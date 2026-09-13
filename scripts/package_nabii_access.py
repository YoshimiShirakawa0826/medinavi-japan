"""Package a reviewed fact snapshot for reproducible offline Vercel builds."""
import argparse
import collections
import gzip
import hashlib
import json
import pathlib
from enrich_phones import nabii_url

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--facts', type=pathlib.Path, required=True)
parser.add_argument('--audit', type=pathlib.Path, required=True)
parser.add_argument('--destination', type=pathlib.Path, default=pathlib.Path('data'))
args = parser.parse_args()
raw = args.facts.read_bytes()
records = json.loads(raw)
audit = json.loads(args.audit.read_text())
if any(r['status'] in ('not_fetched', 'stopped', 'cached', 'downloaded') for r in audit):
    raise SystemExit('The remaining clinic list has not finished downloading.')
if len(records) != sum(r['status'] == 'matched' for r in audit):
    raise SystemExit('Fact records and reconciliation totals do not agree.')
compressed = gzip.compress(raw, mtime=0)
args.destination.mkdir(parents=True, exist_ok=True)
for old in args.destination.glob('nabii-access.json.gz.part[0-9][0-9]'):
    old.unlink()
part_names = []
for start in range(0, len(compressed), 100000):
    name = f'nabii-access.json.gz.part{start // 100000:02}'
    (args.destination / name).write_bytes(compressed[start:start + 100000])
    part_names.append(name)
manifest = {
    'schemaVersion': 1, 'reportCount': len(records), 'attemptedClinics': len(audit),
    'source': '医療情報ネット（ナビイ）施設詳細',
    'checkedAt': sorted(set(r['checkedAt'] for r in records)),
    'jsonSha256': hashlib.sha256(raw).hexdigest(), 'parts': part_names,
    'reconciliation': dict(collections.Counter(r['status'] for r in audit)),
}
holds = [{**r, 'url': nabii_url(r['id'])} for r in audit if r['status'] != 'matched']
(args.destination / 'nabii-access-holds.json').write_text(json.dumps({
    'schemaVersion': 1, 'checkedAt': manifest['checkedAt'], 'records': holds,
}, ensure_ascii=False, indent=2) + '\n')
(args.destination / 'nabii-access-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(manifest, ensure_ascii=False))
