"""Reconcile clinic phones against public MHLW sources; never infer a number.

Python 3 standard library only. Raw downloads and review evidence are kept outside
public/. Run with --help. The input clinic IDs, order and non-phone fields survive.
"""
import argparse
import collections
import concurrent.futures
import datetime
import gzip
import hashlib
import html.parser
import json
import pathlib
import re
import threading
import time
import unicodedata
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
import zipfile

NABII = 'https://www.iryou.teikyouseido.mhlw.go.jp/znk-web/juminkanja/S2430/initialize'
DIRECTORY = 'https://kouseikyoku.mhlw.go.jp/kantoshinetsu/chousa/shitei.html'
DIRECTORY_ZIP = 'https://kouseikyoku.mhlw.go.jp/kantoshinetsu/shitei_ika_r0809.zip'
DIRECTORY_SHA256 = '0ff92e681bfa11a45216ce7a5764acb79a3a8c08aedf54a0d30fe9f037a1126e'
DAY = datetime.datetime.now(datetime.timezone.utc).date().isoformat()
CORPORATE = ('医療法人', '一般社団法人', '公益財団法人', '社会福祉法人',
             '一般財団法人', '医療社団法人', '社会医療法人')


def name_key(text):
    return re.sub(r'\s+', '', unicodedata.normalize('NFKC', text)).lower()


def kanji_number(match):
    digits = dict(zip('〇零一二三四五六七八九', [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]))
    total = value = 0
    for char in match[0]:
        if char in digits:
            value = value * 10 + digits[char]
        else:
            total += (value or 1) * {'十': 10, '百': 100}[char]
            value = 0
    return str(total + value)


def address_key(text):
    """Town and up to three street numbers; keep spaces separating floor numbers."""
    text = unicodedata.normalize('NFKC', text).lower()
    text = re.sub(r'^〒\s*\d{3}[-ー−‐―]?\d{4}', '', text)
    text = re.sub(r'^東京都', '', text.strip())
    text = re.sub(r'[〇零一二三四五六七八九十百]+(?=丁目|番地|番|号)', kanji_number, text)
    text = re.sub(r'(\d+)\s*(丁目|番地の|番地|番)\s*(?=\d)', r'\1-', text)
    text = re.sub(r'(?<=\d)[ー−‐―－](?=\d)', '-', text)
    match = re.match(r'([^0-9]+?)(\d+(?:\s*-\s*\d+){0,2})', text)
    return (name_key(match[1]), re.sub(r'\s+', '', match[2])) if match else None


def same_name(left, right):
    left, right = name_key(left), name_key(right)
    return bool(left and right) and (left == right
        or (left.endswith(right) and left.startswith(CORPORATE))
        or (right.endswith(left) and right.startswith(CORPORATE)))


def normalized_phone(raw):
    """Accept one domestic phone; reject descriptions, multiple numbers and FAX labels."""
    text = unicodedata.normalize('NFKC', raw).strip()
    if not re.fullmatch(r'[0-9()\s\-−‐―ー]+', text):
        return None
    digits = re.sub(r'\D', '', text)
    if not re.fullmatch(r'0[1-9]\d{8,9}', digits):
        return None
    # Preserve supplied grouping when present, rather than guessing area codes.
    text = re.sub(r'[−‐―ー]', '-', text)
    text = re.sub(r'\)\s*', '-', text).replace('(', '')
    text = re.sub(r'\s+', '-', text).strip('-')
    return re.sub(r'-+', '-', text)


def nabii_url(clinic_id):
    match = re.fullmatch(r'clinic-(\d{2})(2)(\d{10})', clinic_id)
    if not match:
        raise ValueError('Unrecognized Nabii clinic ID: ' + clinic_id)
    return f'{NABII}?kikanCd={match[3]}&kikanKbn={match[2]}&prefCd={match[1]}'


def read_directory(archive):
    """Read the published Excel cells without evaluating code, formulas or macros."""
    if hashlib.sha256(archive.read_bytes()).hexdigest() != DIRECTORY_SHA256:
        raise ValueError('Source archive changed; inspect it before changing the pinned hash/date.')
    with zipfile.ZipFile(archive) as outer:
        names = [name for name in outer.namelist() if '東京' in name and name.endswith('.xlsx')]
        if len(names) != 1:
            raise ValueError('Expected exactly one Tokyo workbook')
        import io
        raw = outer.read(names[0])
        workbook = zipfile.ZipFile(io.BytesIO(raw))
    ns = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    strings = [''.join(node.text or '' for node in item.findall('.//m:t', ns))
               for item in ET.fromstring(workbook.read('xl/sharedStrings.xml')).findall('m:si', ns)]
    root = ET.fromstring(workbook.read('xl/worksheets/sheet1.xml'))
    records, current = [], None
    for row in root.findall('m:sheetData/m:row', ns):
        cells = {}
        for cell in row.findall('m:c', ns):
            value = cell.find('m:v', ns)
            if value is not None:
                cells[re.sub(r'\d', '', cell.attrib['r'])] = (
                    strings[int(value.text)] if cell.attrib.get('t') == 's' else value.text)
        if re.fullmatch(r'\d{2},\d{4},\d', cells.get('B', '')):
            current = dict(row=int(row.attrib['r']), code=cells['B'].replace(',', ''),
                           name=cells.get('C', ''), address=cells.get('D', ''),
                           phone=cells.get('E', ''), type=cells.get('J', ''), status='')
            records.append(current)
        elif current and cells.get('J') in ('現存', '休止'):
            current['status'] = cells['J']
    return records


class DetailParser(html.parser.HTMLParser):
    """Extract only explicitly labelled public name/address/guide phone cells."""
    def __init__(self):
        super().__init__()
        self.fields = collections.defaultdict(set)
        self.cell = None
        self.row = None

    def handle_starttag(self, tag, attrs):
        if tag == 'tr':
            self.row = {'th': [], 'td': []}
        elif self.row is not None and tag in ('th', 'td'):
            self.cell = tag

    def handle_data(self, data):
        if self.row is not None and self.cell:
            self.row[self.cell].append(data)

    def handle_endtag(self, tag):
        if tag in ('th', 'td'):
            self.cell = None
        elif tag == 'tr' and self.row is not None:
            label = ''.join(self.row['th']).strip()
            value = ' '.join(''.join(self.row['td']).split())
            if label in ('正式名称', '所在地', '案内用電話番号') and value:
                self.fields[label].add(value)
            self.row, self.cell = None, None


def parse_detail(raw):
    parser = DetailParser()
    # A saved prefix may end between UTF-8 characters after the completed table.
    parser.feed(raw.decode('utf-8', errors='replace'))
    # Desktop and mobile tables repeat fields. Conflicting values need review.
    result = {}
    for label, key in [('正式名称', 'name'), ('所在地', 'address'), ('案内用電話番号', 'phone')]:
        values = parser.fields[label]
        if len(values) == 1:
            result[key] = next(iter(values))
    return result


def source_record(kind, url, retrieved_at=None, **extra):
    return dict(kind=kind, url=url, retrievedAt=retrieved_at or DAY, **extra)


def retrieved_date(path):
    return datetime.datetime.fromtimestamp(path.stat().st_mtime, datetime.timezone.utc).date().isoformat()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--clinics', type=pathlib.Path, required=True)
    parser.add_argument('--source-dir', type=pathlib.Path, required=True)
    parser.add_argument('--output', type=pathlib.Path, required=True)
    parser.add_argument('--fetch-details', action='store_true')
    parser.add_argument('--workers', type=int, default=4, choices=range(1, 9))
    args = parser.parse_args()
    source_dir = args.source_dir
    clinics = json.loads(args.clinics.read_text())
    if len({clinic['id'] for clinic in clinics}) != len(clinics):
        raise ValueError('Duplicate clinic IDs')
    directory = read_directory(source_dir / 'shitei_ika_r0809.zip')
    index = collections.defaultdict(list)
    for row in directory:
        if row['status'] == '現存' and row['type'] == '診療所':
            index[address_key(row['address'])].append(row)
    evidence, pending = {}, []
    for clinic in clinics:
        key = address_key(clinic['address']['ja'])
        matches = [row for row in index[key] if key and same_name(clinic['name']['ja'], row['name'])
                   and normalized_phone(row['phone'])]
        if len(matches) == 1:
            row = matches[0]
            evidence[clinic['id']] = dict(phone=normalized_phone(row['phone']),
                source=source_record('mhlw_directory', DIRECTORY,
                    retrieved_at=retrieved_date(source_dir / 'shitei_ika_r0809.zip'), asOf='2026-09-01',
                    field='電話番号', matchMethod='name_and_street_address',
                    sourceFile=DIRECTORY_ZIP, sourceRow=row['row'], sourceCode=row['code']),
                sourceName=row['name'], sourceAddress=row['address'], rawPhone=row['phone'])
        else:
            pending.append(clinic)
    directory_evidence = dict(evidence)
    number_counts = collections.Counter(re.sub(r'\D', '', row['phone']) for row in evidence.values())
    for clinic in clinics:
        record = evidence.get(clinic['id'])
        # A shared number can be a central line or an old branch's number.
        # Also prefer primary Nabii details already inspected during the audit.
        if record and ((source_dir / (clinic['id'] + '.html')).exists()
                       or number_counts[re.sub(r'\D', '', record['phone'])] > 1):
            evidence.pop(clinic['id'])
            pending.append(clinic)
    print(f'Directory matched: {len(evidence)}; detail review: {len(pending)}', flush=True)
    stop = threading.Event()
    lock = threading.Lock()
    next_request = [0.0]

    def detail(clinic):
        url = nabii_url(clinic['id'])
        cache = source_dir / (clinic['id'] + '.html')
        error = None
        if not cache.exists() and args.fetch_details and not stop.is_set():
            # At most one request start per second, and at most eight in flight.
            with lock:
                delay = max(0, next_request[0] - time.monotonic())
                next_request[0] = time.monotonic() + delay + 1.0
            if delay:
                time.sleep(delay)
            if stop.is_set():
                return clinic['id'], None, 'fetch_stopped'
            try:
                request = urllib.request.Request(url, headers={
                    'User-Agent': 'MediNavi-data-quality-check/1.0'})
                with urllib.request.urlopen(request, timeout=35) as response:
                    if response.headers.get('Content-Encoding') == 'gzip':
                        raw = gzip.decompress(response.read())
                    else:
                        # The basic identity/contact table comes first. Avoid
                        # downloading hundreds of KB of unrelated clinical data.
                        raw = b''
                        while len(raw) < 65536:
                            chunk = response.read(8192)
                            if not chunk:
                                break
                            raw += chunk
                            if len(parse_detail(raw)) == 3:
                                break
                cache.write_bytes(raw)
            except urllib.error.HTTPError as exc:
                if exc.code in (401, 403, 429):
                    stop.set()
                error = f'HTTP {exc.code}'
            except (OSError, TimeoutError) as exc:
                error = str(exc)
        if not cache.exists():
            return clinic['id'], None, error or 'detail_not_fetched'
        raw = cache.read_bytes()
        row = parse_detail(raw)
        phone = normalized_phone(row.get('phone', ''))
        match = (same_name(row.get('name', ''), clinic['name']['ja'])
                 and address_key(row.get('address', '')) is not None
                 and address_key(row.get('address', '')) == address_key(clinic['address']['ja']))
        # A current name/address mismatch may be a move or a different facility.
        record = dict(phone=phone, source=source_record('nabii_detail', url, retrieved_at=retrieved_date(cache),
                      field='案内用電話番号', matchMethod='id_name_and_street_address'),
                      sourceName=row.get('name'), sourceAddress=row.get('address'),
                      rawPhone=row.get('phone'), contentSha256=hashlib.sha256(raw).hexdigest())
        if not row.get('name') or not row.get('address'):
            reason = 'detail_identity_unavailable'
        elif not match:
            reason = 'identity_changed'
        elif not phone:
            reason = 'phone_missing_or_ambiguous'
        else:
            reason = None
        return clinic['id'], record, reason

    review, source_disagreements = [], []
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        for number, (clinic_id, record, error) in enumerate(pool.map(detail, pending), 1):
            if not error:
                evidence[clinic_id] = record
                previous = directory_evidence.get(clinic_id)
                if previous and re.sub(r'\D', '', previous['phone']) != re.sub(r'\D', '', record['phone']):
                    source_disagreements.append(dict(id=clinic_id, directory=previous, adopted=record,
                        reason='Primary Nabii contact field; same facility ID, name and street address'))
            else:
                review.append(dict(id=clinic_id, reason=error, candidate=record))
            if number % 25 == 0 or number == len(pending):
                print(f'Detail checked: {number}/{len(pending)}; phones: {len(evidence)}; review: {len(review)}', flush=True)
    original_phones = {clinic['id']: clinic.get('phone', '') for clinic in clinics}
    conflicts = []
    for clinic in clinics:
        record = evidence.get(clinic['id'])
        if record:
            existing = normalized_phone(clinic.get('phone', ''))
            if existing and re.sub(r'\D', '', existing) != re.sub(r'\D', '', record['phone']):
                conflicts.append(dict(id=clinic['id'], existing=existing, candidate=record))
                continue
            clinic['phone'] = record['phone']
            clinic['phoneSource'] = record['source']
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(clinics, ensure_ascii=False, separators=(',', ':')) + '\n')
    report = dict(checkedAt=DAY, total=len(clinics),
                  populated=sum(bool(c.get('phone')) for c in clinics),
                  added=sum(bool(c.get('phone')) and not original_phones[c['id']] for c in clinics),
                  sources=dict(collections.Counter(v['source']['kind'] for v in evidence.values())),
                  evidence=evidence, review=review, conflicts=conflicts, sourceDisagreements=source_disagreements)
    (source_dir / 'phone-reconciliation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({k:v for k,v in report.items() if k not in ('evidence', 'review', 'conflicts', 'sourceDisagreements')}, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
