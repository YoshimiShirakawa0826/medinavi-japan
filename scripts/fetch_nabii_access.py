"""Download public Nabii clinic reports for an explicit list of existing IDs.

No authentication, search endpoints or unbounded crawling. Cache is outside
public/. Global pacing and stop-on-denial apply even across worker threads.
"""
import argparse
import concurrent.futures
import datetime
import gzip
import hashlib
import json
import pathlib
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from enrich_phones import nabii_url


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--clinics', required=True)
    ap.add_argument('--cache', required=True)
    ap.add_argument('--workers', type=int, default=4)
    ap.add_argument('--limit', type=int)
    args = ap.parse_args()
    if not 1 <= args.workers <= 20:
        ap.error('workers must be between 1 and 20')
    clinics = json.loads(pathlib.Path(args.clinics).read_text())
    clinics = [c for c in clinics if not c.get('accessEvidence')][:args.limit]
    cache = pathlib.Path(args.cache)
    cache.mkdir(parents=True, exist_ok=True)
    stop, lock = threading.Event(), threading.Lock()
    next_request = [0.0]
    today = datetime.datetime.now(datetime.timezone.utc).date().isoformat()

    def fetch(c):
        file = cache / (c['id'] + '.html.gz')
        if file.exists():
            return {'id': c['id'], 'status': 'cached'}
        if stop.is_set():
            return {'id': c['id'], 'status': 'stopped'}
        with lock:
            wait = max(0, next_request[0] - time.monotonic())
            next_request[0] = time.monotonic() + wait + 0.5
        if stop.wait(wait):
            return {'id': c['id'], 'status': 'stopped'}
        url = nabii_url(c['id'])
        try:
            req = urllib.request.Request(url, headers={
                'User-Agent': 'MediNaviDataReview/1.0 (+https://medinavi-japan.vercel.app/)',
                'Accept': 'text/html',
            })
            with urllib.request.urlopen(req, timeout=40) as res:
                if urllib.parse.urlsplit(res.url).hostname != 'www.iryou.teikyouseido.mhlw.go.jp':
                    raise ValueError('Unexpected redirect')
                raw = res.read(5_000_001)
            if len(raw) > 5_000_000 or b'</html>' not in raw.lower():
                raise ValueError('Incomplete or oversized report')
            file.write_bytes(gzip.compress(raw, mtime=0))
            (cache / (c['id'] + '.meta.json')).write_text(json.dumps({
                'url': url, 'checkedAt': today, 'sha256': hashlib.sha256(raw).hexdigest(),
                'bytes': len(raw),
            }))
            return {'id': c['id'], 'status': 'downloaded'}
        except urllib.error.HTTPError as e:
            if e.code in (401, 403, 429):
                stop.set()
            return {'id': c['id'], 'status': 'http_error', 'code': e.code}
        except Exception as e:
            return {'id': c['id'], 'status': 'fetch_error', 'reason': str(e)[:180]}

    results, counts = [], {}
    start = time.monotonic()
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = [pool.submit(fetch, c) for c in clinics]
        for future in concurrent.futures.as_completed(futures):
            result = future.result()
            results.append(result)
            counts[result['status']] = counts.get(result['status'], 0) + 1
            if len(results) % 25 == 0 or len(results) == len(clinics):
                print(json.dumps({'completed': len(results), 'total': len(clinics),
                    'counts': counts, 'seconds': round(time.monotonic() - start)}), flush=True)
                (cache / 'fetch-progress.json').write_text(json.dumps(results, indent=2))
    (cache / 'fetch-progress.json').write_text(json.dumps(results, indent=2))


if __name__ == '__main__':
    main()
