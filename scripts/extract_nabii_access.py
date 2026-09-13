"""Extract labelled access facts from cached public Nabii reports (requires lxml).

Never read tooltip definitions as reported answers. Missing, conflicting or
unmatched values remain unknown. The original clinic records are not modified.
"""
import argparse
import collections
import datetime
import gzip
import hashlib
import json
import pathlib
import re
import unicodedata
from lxml import html
from enrich_phones import address_key, name_key, same_name, normalized_phone, nabii_url


def clean(element):
    return ' '.join(element.text_content().split())


def css_class(root, value):
    return root.xpath('.//*[contains(concat(" ", normalize-space(@class), " "), $value)]', value=f' {value} ')


def labelled(root, label):
    answers = set()
    for row in root.xpath('.//tr'):
        heads, cells = row.xpath('./th'), row.xpath('./td')
        if len(heads) == len(cells) == 1 and clean(heads[0]) == label:
            answers.add(clean(cells[0]))
    return next(iter(answers)) if len(answers) == 1 else None


def section(root, heading):
    controls = [e.get('aria-controls') for e in root.xpath('.//*[@aria-controls]') if clean(e) == heading]
    return root.xpath('.//*[@id=$id]', id=controls[0])[0] if len(controls) == 1 and root.xpath('.//*[@id=$id]', id=controls[0]) else None


def parse_report(raw):
    if b'</html>' not in raw.lower():
        raise ValueError('Incomplete report')
    root = html.fromstring(raw.decode('utf-8'))
    for element in css_class(root, 'tooltipBlock'):
        element.drop_tree()
    result = {'identity': {key: labelled(root, label) for key, label in
              [('name', '正式名称'), ('address', '所在地'), ('phone', '案内用電話番号')]}}
    updates = css_class(root, 'kouhyoubi')
    if len(updates) == 1:
        match = re.search(r'(\d{4})/(\d{1,2})/(\d{1,2})', clean(updates[0]))
        if match:
            result['sourceUpdatedAt'] = datetime.date(*map(int, match.groups())).isoformat()
    result['creditCard'] = labelled(root, 'クレジットカード決済')
    result['electronicPayment'] = labelled(root, '電子決済サービスへの対応')
    insurance = section(root, '保険医療機関、公費負担医療機関及びその他の病院の種類')
    result['japaneseInsuranceDesignation'] = bool(insurance is not None and any(
        clean(cell) == '保険医療機関' for cell in insurance.xpath('.//table[contains(@class,"ptn6Item")]//td')))

    departments = collections.defaultdict(set)
    for area in css_class(root, 'ptn3DataArea') + css_class(root, 'ptn1DataArea'):
        names = area.xpath('./h3')
        if len(names) != 1:
            continue
        name = clean(names[0]).lstrip('◆').strip()
        annotations = ' '.join(clean(e) for e in css_class(area, 'annotation'))
        walk = re.search(r'予約外診察[：:]\s*([^、,）)\s]+)', annotations)
        # Reports without a weekly timetable use pattern 1 for the same
        # specialty annotation. Other pattern-1 tables are unrelated.
        if not walk and 'ptn1DataArea' in area.get('class', '').split():
            continue
        # Only the explicit appointment-free consultation field is used.
        status = {'可能': 'yes', '不可': 'no'}.get(walk[1] if walk else '', 'unknown')
        departments[name].add(status)
    result['departments'] = [{'name': name, 'status': next(iter(values)) if len(values) == 1 else 'unknown'}
                            for name, values in sorted(departments.items()) if name]
    languages = []
    for area in css_class(root, 'ptn9DataArea'):
        name, reservation = labelled(area, '対応可能な外国語名'), labelled(area, '予約')
        if name and reservation in ('要予約', '予約不要'):
            languages.append({'name': name, 'reservation': reservation,
                              'note': labelled(area, '予約備考') or ''})
    result['languageReservations'] = languages
    # Candidate discovery only, never automatic travel-insurance acceptance.
    result['travelInsuranceMentions'] = sorted(set(re.findall(
        r'[^。\n]{0,100}(?:海外旅行保険|旅行保険|travel insurance|direct billing)[^。\n]{0,160}',
        '\n'.join(clean(e) for e in root.xpath('.//td')), re.I)))
    return result


def match_identity(clinic, identity):
    if not same_name(clinic['name']['ja'], identity.get('name') or ''):
        return 'name_mismatch'
    if not address_key(clinic['address']['ja']) or address_key(clinic['address']['ja']) != address_key(identity.get('address') or ''):
        return 'address_mismatch'
    old_phone = normalized_phone(clinic.get('phone') or '')
    source_phone = normalized_phone(identity.get('phone') or '')
    if old_phone and source_phone:
        if re.sub(r'\D', '', old_phone) != re.sub(r'\D', '', source_phone):
            return 'phone_mismatch'
    elif name_key(clinic['address']['ja']) != name_key(identity.get('address') or ''):
        return 'full_address_required_without_phone'
    return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--clinics', type=pathlib.Path, required=True)
    parser.add_argument('--cache', type=pathlib.Path, required=True)
    parser.add_argument('--output', type=pathlib.Path, required=True)
    parser.add_argument('--audit', type=pathlib.Path, required=True)
    args = parser.parse_args()
    clinics = json.loads(args.clinics.read_text())
    progress_path = args.cache / 'fetch-progress.json'
    progress = {r['id']: r for r in json.loads(progress_path.read_text())} if progress_path.exists() else {}
    reports, audit = [], []
    for clinic in clinics:
        if clinic.get('accessEvidence'):
            continue
        path = args.cache / (clinic['id'] + '.html.gz')
        if not path.exists():
            failure = progress.get(clinic['id'], {})
            audit.append({'id': clinic['id'], 'status': failure.get('status', 'not_fetched'),
                          **{k: failure[k] for k in ['code', 'reason'] if k in failure}})
            continue
        try:
            raw = gzip.decompress(path.read_bytes())
            record = parse_report(raw)
            reason = match_identity(clinic, record['identity'])
            if reason:
                audit.append({'id': clinic['id'], 'status': reason, 'sourceIdentity': record['identity']})
                continue
            meta_path = args.cache / (clinic['id'] + '.meta.json')
            checked_at = (json.loads(meta_path.read_text())['checkedAt'] if meta_path.exists() else
                          datetime.datetime.fromtimestamp(path.stat().st_mtime, datetime.timezone.utc).date().isoformat())
            if record.get('sourceUpdatedAt', '') > checked_at:
                raise ValueError('Future source update')
            record.update(clinicId=clinic['id'], clinicName=clinic['name']['ja'], matchedPhone=clinic['phone'],
                          matchedAddress=clinic['address']['ja'], url=nabii_url(clinic['id']), checkedAt=checked_at,
                          sha256=hashlib.sha256(raw).hexdigest())
            reports.append(record)
            audit.append({'id': clinic['id'], 'status': 'matched'})
        except (ValueError, OSError) as error:
            audit.append({'id': clinic['id'], 'status': 'parse_error', 'reason': str(error)[:160]})
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(reports, ensure_ascii=False, separators=(',', ':')) + '\n')
    args.audit.parent.mkdir(parents=True, exist_ok=True)
    args.audit.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'records': len(reports), 'audit': dict(collections.Counter(r['status'] for r in audit)),
                      'cards': dict(collections.Counter(r['creditCard'] for r in reports)),
                      'japaneseInsurance': sum(r['japaneseInsuranceDesignation'] for r in reports)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
