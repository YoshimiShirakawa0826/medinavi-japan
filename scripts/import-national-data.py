"""Import MHLW's published nationwide hospital/clinic CSV archives.

Only four bulk files are fetched; no search crawling or detail-page scraping.
Raw downloads stay outside the checkout. Rebuilds use the checked-in archive.
"""
import argparse
import collections
import csv
import datetime
import gzip
import hashlib
import io
import json
import pathlib
import re
import urllib.request
import zipfile

AS_OF = '2026-06-01'
PAGE = 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryou/newpage_43373.html'
SOURCES = {
    'hospital-facility-20260601.zip': '01-1_hospital_facility_info_20260601.csv.zip',
    'clinic-facility-20260601.zip': '02-1_clinic_facility_info_20260601.csv.zip',
    'hospital-hours-20260601.zip': '01-2_hospital_speciality_hours_20260601.csv.zip',
    'clinic-hours-20260601.zip': '02-2_clinic_speciality_hours_20260601.csv.zip',
}
ALIASES = {
    'internal': ['内科', '一般内科', '総合内科', '消化器内科', '循環器内科', '呼吸器内科', '糖尿病内科', '内分泌内科', '腎臓内科', '血液内科', '感染症内科', '漢方内科', '老年内科', '脳神経内科', '神経内科'],
    'surgery': ['外科', '一般外科', '消化器外科', '乳腺外科', '肛門外科', '呼吸器外科', '心臓血管外科'],
    'pediatrics': ['小児科', '小児内科'], 'orthopedics': ['整形外科'],
    'dermatology': ['皮膚科', '一般皮膚科'], 'ophthalmology': ['眼科'],
    'ent': ['耳鼻科', '耳鼻咽喉科', '耳鼻いんこう科', '耳鼻咽喉頭頸部外科'],
    'obgyn': ['産婦人科', '産科', '婦人科'], 'psychiatry': ['精神科', '心療内科'], 'urology': ['泌尿器科'],
}


def csv_rows(file):
    with zipfile.ZipFile(file) as archive:
        files = [name for name in archive.namelist() if name.endswith('.csv')]
        if len(files) != 1:
            raise ValueError(f'Expected one CSV: {file}')
        # Reading the entire member verifies its ZIP CRC, including when a row
        # is rejected later. HTTPS verification is never disabled.
        data = archive.read(files[0]).decode('utf-8-sig')
    return csv.DictReader(io.StringIO(data))


def facility(row, departments, url, retrieved):
    source_id, code = row['ID'], row['都道府県コード']
    if not re.fullmatch(r'\d{2}[12][A-Za-z0-9]{2,17}', source_id) or source_id[:2] != code or not 1 <= int(code) <= 47 or source_id[2] not in '12':
        raise ValueError(f'Invalid source identity: {source_id}')
    name, address = row['正式名称'].strip(), row['所在地'].strip()
    if not name or not address:
        raise ValueError(f'Missing name/address: {source_id}')
    try:
        lat, lng = float(row['所在地座標（緯度）']), float(row['所在地座標（経度）'])
    except ValueError:
        lat = lng = 0
    if not (20 <= lat <= 46 and 122 <= lng <= 154):
        lat = lng = 0
    website = row['案内用ホームページアドレス'].strip()
    record = {
        'id': 'clinic-' + source_id, 'prefectureCode': code,
        'name': {lang: row['英語表記（ローマ字表記）'].strip() if lang == 'en' and row['英語表記（ローマ字表記）'].strip() else name for lang in ['ja', 'en', 'zh', 'ko', 'es']},
        'address': {lang: address for lang in ['ja', 'en', 'zh', 'ko', 'es']},
        'phone': '', 'latitude': lat, 'longitude': lng,
        'departments': sorted(departments), 'supportedLanguages': [],
        'isOpenNow': None, 'hasHolidayService': False, 'walkInAllowed': False, 'emergencyAccepted': False,
        'updatedAt': AS_OF, 'dataSource': '医療情報ネット（ナビイ）オープンデータ',
        'source': {'url': url, 'retrievedAt': retrieved, 'asOf': AS_OF},
        'verification': {'status': 'unverified', 'confirmedBy': 'open_data'}, 'accessInfo': {},
    }
    if re.match(r'^https?://[^\s]+$', website):
        record['website'] = website
    # No foreign-language capability, phone, payment, insurance, walk-in or
    # emergency availability can be inferred from a Romanized name. Hours are
    # department-specific and may have irregular closures: left unconfirmed.
    return record


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--source-dir', type=pathlib.Path, required=True)
    ap.add_argument('--output-dir', type=pathlib.Path, default=pathlib.Path('data'))
    ap.add_argument('--download', action='store_true')
    args = ap.parse_args()
    args.source_dir.mkdir(parents=True, exist_ok=True)
    manifest_file = args.output_dir / 'national-clinics-manifest.json'
    existing = json.loads(manifest_file.read_text()) if manifest_file.exists() else {}
    pinned = {item['url']: item['sha256'] for item in existing.get('sources', [])}
    sources = []
    for filename, remote in SOURCES.items():
        url = 'https://www.mhlw.go.jp/content/11121000/' + remote
        file = args.source_dir / filename
        if not file.exists():
            if not args.download:
                raise FileNotFoundError(f'{file}: use --download to retrieve the official archive')
            with urllib.request.urlopen(url, timeout=120) as response:
                data = response.read()
            file.write_bytes(data)
        digest = hashlib.sha256(file.read_bytes()).hexdigest()
        if url in pinned and digest != pinned[url]:
            raise ValueError(f'Source changed; review before updating the manifest: {url}')
        sources.append({'url': url, 'sha256': digest, 'bytes': file.stat().st_size})
    departments = collections.defaultdict(set)
    alias = {name: category for category, names in ALIASES.items() for name in names}
    for kind in ['hospital', 'clinic']:
        for row in csv_rows(args.source_dir / f'{kind}-hours-20260601.zip'):
            category = alias.get(row['診療科目名'].strip())
            if category:
                departments[row['ID']].add(category)
    retrieved = existing.get('retrievedAt', datetime.datetime.now(datetime.timezone.utc).date().isoformat())
    records, seen = [], set()
    for kind in ['hospital', 'clinic']:
        filename = f'{kind}-facility-20260601.zip'
        url = 'https://www.mhlw.go.jp/content/11121000/' + SOURCES[filename]
        for row in csv_rows(args.source_dir / filename):
            record = facility(row, departments[row['ID']], url, retrieved)
            if record['id'] in seen:
                raise ValueError(f'Duplicate ID: {record["id"]}')
            seen.add(record['id'])
            records.append(record)
    counts = collections.Counter(record['prefectureCode'] for record in records)
    if len(counts) != 47 or len(records) != 87870:
        raise ValueError(f'Unexpected national snapshot: {len(records)} records, {len(counts)} prefectures')
    raw = (json.dumps(records, ensure_ascii=False, separators=(',', ':')) + '\n').encode()
    compressed = gzip.compress(raw, mtime=0)
    # Small chunks follow the repository's existing data archive convention.
    parts = {f'national-clinics.json.gz.part{i:02d}': compressed[start:start + 1024 * 1024]
             for i, start in enumerate(range(0, len(compressed), 1024 * 1024))}
    manifest = {'schemaVersion': 1, 'recordCount': len(records), 'sourceAsOf': AS_OF,
                'retrievedAt': retrieved, 'sourcePage': PAGE, 'license': 'PDL1.0',
                'licenseUrl': 'https://www.digital.go.jp/resources/open_data/public_data_license_v1.0',
                'sources': sources, 'jsonSha256': hashlib.sha256(raw).hexdigest(),
                'parts': list(parts), 'prefectures': dict(sorted(counts.items())),
                'limitations': ['Phone numbers and foreign-language capabilities are not in the facility CSV.',
                                'Department-specific hours and irregular closures are not generalized to facility hours.',
                                'Existing reviewed Tokyo records take precedence by exact source ID.']}
    args.output_dir.mkdir(parents=True, exist_ok=True)
    for name, data in parts.items():
        (args.output_dir / name).write_bytes(data)
    for old in args.output_dir.glob('national-clinics.json.gz.part*'):
        if old.name not in parts:
            old.unlink()
    manifest_file.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(f'Imported {len(records):,} real facilities across {len(counts)} prefectures; {len(compressed):,} compressed bytes.')


if __name__ == '__main__':
    main()
