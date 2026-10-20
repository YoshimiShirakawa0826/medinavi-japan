"""Join website research with reviewed evidence without promoting candidates to facts."""
import argparse
import collections
import csv
import gzip
import importlib.util
import json
from pathlib import Path
import re

spec = importlib.util.spec_from_file_location('website_audit', Path(__file__).parent / 'website-audit/audit.py')
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)
NON_CLINICAL = {'contact_only', 'machine_translation', 'patient_arranged_interpreter', 'onsite_interpreter_unavailable', 'service_suspended'}
PREFECTURES = dict(zip((f'{code:02d}' for code in range(1, 48)),
    '北海道 青森県 岩手県 宮城県 秋田県 山形県 福島県 茨城県 栃木県 群馬県 埼玉県 千葉県 東京都 神奈川県 新潟県 富山県 石川県 福井県 山梨県 長野県 岐阜県 静岡県 愛知県 三重県 滋賀県 京都府 大阪府 兵庫県 奈良県 和歌山県 鳥取県 島根県 岡山県 広島県 山口県 徳島県 香川県 愛媛県 高知県 福岡県 佐賀県 長崎県 熊本県 大分県 宮崎県 鹿児島県 沖縄県'.split()))
CSV_LABELS = {
    'facility_id': '施設ID', 'prefecture_code': '都道府県コード', 'prefecture_name_ja': '都道府県',
    'facility_name': '施設名', 'facility_address': '所在地', 'directory_website': '配布元のサイトURL',
    'language_review_status': '調査状態コード', 'language_review_status_ja': '調査状態',
    'registered_clinical_languages': '登録済みの診療言語コード', 'registered_modes': '登録した対応方法コード',
    'registered_reservation_conditions': '登録した予約条件コード', 'registered_notes_ja': '登録済みの案内',
    'registered_source_urls': '登録済みの出典URL', 'registered_source_checked_dates': '出典の確認日',
    'body_pages_retrieved': '取得した本文ページ数',
    'retrieval_complete_within_selected_pages': '取得処理完了（選択ページ範囲内）',
    'retrieval_or_manual_review_reasons': '取得不可・個別確認の理由',
    'candidate_source_url_unreviewed': '未照合候補の出典URL', 'candidate_quote_unreviewed': '未照合候補の引用',
    'candidate_source_sha256_unreviewed': '未照合候補のHTML_SHA256',
    'candidate_page_checked_at_unreviewed': '未照合候補ページの取得日時',
    'website_retrieval_checked_at': 'URL取得の確認日時',
}
STATUS_JA = {
    'clinical_languages_registered': '診療での外国語対応の記載を登録',
    'japanese_only_registered': '日本語のみの診療と公式に記載',
    'language_policy_registered': '通訳条件・問い合わせ・休止等の記載を登録',
    'website_withheld_unrelated_destination': '無関係な転送先のため公式リンクを保留',
    'candidate_requires_identity_and_context_review': '候補あり・施設と内容の照合待ち',
    'body_retrieved_without_registered_language_evidence': '本文取得・診療言語の根拠は未登録',
    'not_started': '今回の調査は未着手',
    'not_started_time_budget': '時間上限による未着手',
    'retrieval_unavailable_or_manual_review_required': '取得不可または画像・PDF等の個別確認が必要',
}


def candidate_relevance(candidate):
    page, quote = candidate
    # This only chooses a useful excerpt for a human. Negative statements and
    # suspended services are relevant too; it never classifies capability.
    score = 30 if re.search(r'interpret|foreign|language.support|通訳', page.get('url', ''), re.I) else 0
    score += 20 if re.search(r'医療通訳|英語で.{0,15}(?:診療|診察)|対応言語|medical interpret|English.speaking|speak English', quote, re.I) else 0
    score += 10 if re.search(r'予約|休止|ありません|無料|有料|suspend|not available|no.{0,20}interpret|book|fee', quote, re.I) else 0
    return score


def read_results(paths, known_websites):
    results = {}
    for path in paths:
        with gzip.open(path, 'rt', encoding='utf8') as source:
            for line in source:
                record = json.loads(line)
                website = record.get('website')
                if website not in known_websites or record.get('version') != audit.VERSION:
                    raise ValueError('Unexpected website or research version')
                if website in results:
                    raise ValueError('Duplicate website result; select one run, not overlapping reruns')
                results[website] = record
    return results


def describe(clinic, result, review, held):
    pages = (result or {}).get('pages', [])
    body = [page for page in pages if page.get('textCharacters', 0) >= 150]
    candidates = [(page, quote) for page in pages for quote in page.get('candidates', [])]
    entries = (review or {}).get('entries', [])
    clinical = [entry for entry in entries if entry['mode'] not in NON_CLINICAL and entry['languages']]
    if held:
        status = 'website_withheld_unrelated_destination'
    elif clinical and any(language != 'ja' for entry in clinical for language in entry['languages']):
        status = 'clinical_languages_registered'
    elif clinical:
        status = 'japanese_only_registered'
    elif entries:
        status = 'language_policy_registered'
    elif candidates:
        status = 'candidate_requires_identity_and_context_review'
    elif body:
        status = 'body_retrieved_without_registered_language_evidence'
    elif result is None:
        status = 'not_started'
    elif result.get('stopReason') == 'time_budget' and not pages:
        status = 'not_started_time_budget'
    else:
        status = 'retrieval_unavailable_or_manual_review_required'
    reasons = []
    for page in pages:
        if page.get('status') == 'retrieved':
            continue
        reason = page.get('status', 'unknown') + (':' + page['errorKind'] if page.get('errorKind') else '')
        if page.get('httpStatus'):
            reason += ':' + str(page['httpStatus'])
        message = '中継接続エラー' if page.get('errorKind') == 'upstream_transport_error' else ' '.join(str(page.get('message', '')).split())[:140]
        reasons.append(reason + (': ' + message if message else ''))
    reasons = sorted(set(reasons))
    if result and result.get('error'):
        reasons.append(result['error'])
    if result and result.get('stopReason'):
        reasons.append(result['stopReason'])
    first_page, first_quote = max(candidates, key=candidate_relevance) if candidates else ({}, '')
    sources = [source for entry in entries for source in entry['sources']]
    return {
        'facility_id': clinic['id'], 'prefecture_code': clinic['prefecture'],
        'prefecture_name_ja': PREFECTURES[clinic['prefecture']],
        'facility_name': clinic['name'], 'facility_address': clinic['address'],
        'directory_website': clinic['website'], 'language_review_status': status,
        'language_review_status_ja': STATUS_JA[status],
        'registered_clinical_languages': ','.join(sorted({language for entry in clinical for language in entry['languages']})),
        'registered_modes': ','.join(sorted({entry['mode'] for entry in entries})),
        'registered_reservation_conditions': ','.join(sorted({entry['reservation'] for entry in entries})),
        'registered_notes_ja': ' / '.join(entry['notes']['ja'] for entry in entries),
        'registered_source_urls': ' '.join(dict.fromkeys(source['url'] for source in sources)),
        'registered_source_checked_dates': ','.join(sorted({source['checkedAt'] for source in sources})),
        'body_pages_retrieved': len(body),
        'retrieval_complete_within_selected_pages': bool(result and result.get('complete')),
        'retrieval_or_manual_review_reasons': ','.join(reasons),
        'candidate_source_url_unreviewed': first_page.get('url', ''),
        'candidate_quote_unreviewed': first_quote,
        'candidate_source_sha256_unreviewed': first_page.get('contentSha256', ''),
        'candidate_page_checked_at_unreviewed': first_page.get('checkedAt', ''),
        'website_retrieval_checked_at': (result or {}).get('checkedAt', ''),
    }


def build_report(clinics, results, reviews, holds):
    review_map = {review['clinicId']: review for review in reviews}
    hold_ids = {hold['clinicId'] for hold in holds}
    rows = [describe(clinic, results.get(clinic['website']), review_map.get(clinic['id']), clinic['id'] in hold_ids)
            for clinic in clinics]
    counts = collections.Counter(row['language_review_status'] for row in rows)
    prefectures = {}
    for row in rows:
        pref = prefectures.setdefault(row['prefecture_code'], collections.Counter())
        pref[row['language_review_status']] += 1
    summary = {
        'generatedAt': audit.now(), 'timeZone': 'Asia/Tokyo',
        'scope': 'Non-Tokyo facilities with a website in the pinned MHLW snapshot; selected-page research is not complete language verification.',
        'facilitiesWithDirectoryWebsite': len(clinics),
        'uniqueDirectoryWebsiteUrls': len({clinic['website'] for clinic in clinics}),
        'urlsWithResult': len(results),
        'urlsAttempted': sum(bool(result.get('pages')) for result in results.values()),
        'urlsWithBody': sum(any(page.get('textCharacters', 0) >= 150 for page in result.get('pages', [])) for result in results.values()),
        'urlsCompletedWithinSelectedPageBudget': sum(bool(result.get('complete')) for result in results.values()),
        'allTargetUrlsProcessed': set(results) == {clinic['website'] for clinic in clinics}
            and all(result.get('complete') for result in results.values()),
        'allTargetUrlsAttempted': all(results.get(clinic['website'], {}).get('pages') for clinic in clinics),
        'languageConfirmationComplete': False,
        'counts': dict(sorted(counts.items())),
        'prefectureCounts': {pref: dict(sorted(values.items())) for pref, values in sorted(prefectures.items())},
        'limitations': [
            'Candidates are unreviewed and never automatically update supported languages.',
            'No candidate in selected pages is not evidence of no language support.',
            'Shared websites require a separate facility identity check.',
            'Retrieval restrictions, inaccessible pages, PDF/image/JS content and unlisted sites remain unconfirmed.',
            'Official website evidence does not confirm same-day availability.',
        ],
    }
    return rows, summary


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', default='.')
    parser.add_argument('--results', nargs='+', required=True, help='site-results.jsonl.gz from nonoverlapping shards of one run')
    parser.add_argument('--output', default='audit-output/report')
    parser.add_argument('--require-all-targets', action='store_true')
    args = parser.parse_args()
    root, output = Path(args.root), Path(args.output)
    clinics = audit.load_clinics(root)
    websites = {clinic['website'] for clinic in clinics}
    results = read_results(args.results, websites)
    if args.require_all_targets and set(results) != websites:
        raise ValueError(f'Missing {len(websites - set(results))} target URL results')
    reviews = json.loads((root / 'data/clinic-language-reviews.json').read_text())
    holds = json.loads((root / 'data/clinic-website-holds.json').read_text())
    rows, summary = build_report(clinics, results, reviews, holds)
    output.mkdir(parents=True, exist_ok=True)
    with gzip.open(output / 'facility-language-status.csv.gz', 'wt', encoding='utf-8-sig', newline='') as target:
        writer = csv.DictWriter(target, fieldnames=[CSV_LABELS[key] for key in rows[0]])
        writer.writeheader()
        writer.writerows({CSV_LABELS[key]: audit.csv_safe(value) for key, value in row.items()} for row in rows)
    (output / 'summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({key: value for key, value in summary.items() if key != 'prefectureCounts'}, ensure_ascii=False))


if __name__ == '__main__':
    main()
