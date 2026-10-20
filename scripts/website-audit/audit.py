"""Resumable public-website research; candidates never become clinical facts automatically.

Only the checked-in MHLW snapshot supplies target sites. Each facility retains
its own identity even if several facilities publish the same website URL.
Uses the Python standard library, with no credentials or external database.
"""
import argparse
import collections
import concurrent.futures
import csv
import datetime
import gzip
import hashlib
from html.parser import HTMLParser
import ipaddress
import json
from pathlib import Path
import re
import socket
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import urllib.robotparser

VERSION = 3
AGENT = 'MediNaviResearch/2.0 (+https://github.com/YoshimiShirakawa0826/medinavi-japan)'
JST = datetime.timezone(datetime.timedelta(hours=9))
MAX_BYTES = 2_000_000
CLINICAL = re.compile(r'通訳|言語対応|対応言語|対応可能な外国語|外国語|外国人患者|英語.{0,30}(?:診療|診察|対応|話[すせ])|中国語.{0,30}(?:診療|診察|対応)|韓国語.{0,30}(?:診療|診察|対応)|ポルトガル語|スペイン語|ベトナム語|English[ -]speaking|speak.{0,20}(?:English|Chinese|Korean|Spanish)|medical interpre|language (?:support|assistance|barrier)|(?:languages spoken|supported languages)|consultations? in English|(?:English|Chinese|Korean|Spanish).{0,30}(?:support|available|consultation)', re.I)
TRANSLATION = re.compile(r'Google Translate|自動翻訳|機械翻訳|website.{0,40}translat', re.I)
EXCLUDE_LINK = re.compile(r'採用|求人|研究|研究者|プライバシー|著作権|サイトマップ|recruit|career|research|privacy|sitemap|press.release|cookie|facebook|instagram', re.I)


def now():
    return datetime.datetime.now(JST).isoformat(timespec='seconds')


def safe_url(value):
    if not isinstance(value, str):
        raise ValueError('invalid_url')
    p = urllib.parse.urlsplit(value.strip())
    if p.scheme not in ('http', 'https') or not p.hostname or p.username or p.password:
        raise ValueError('unsupported_url')
    if p.port not in (None, 80, 443):
        raise ValueError('unsupported_port')
    host = p.hostname.encode('idna').decode().lower()
    if '.' not in host or host.endswith(('.local', '.internal', '.localhost')):
        raise ValueError('non_public_host')
    try:
        address = ipaddress.ip_address(host)
    except ValueError:
        address = None
    if address and not address.is_global:
        raise ValueError('non_public_host')
    port = f':{p.port}' if p.port else ''
    return urllib.parse.urlunsplit((p.scheme, host + port, p.path or '/', p.query, ''))


def public_dns(url):
    p = urllib.parse.urlsplit(safe_url(url))
    addresses = socket.getaddrinfo(p.hostname, p.port or (443 if p.scheme == 'https' else 80), type=socket.SOCK_STREAM)
    if not addresses or any(not ipaddress.ip_address(row[4][0]).is_global for row in addresses):
        raise ValueError('non_public_dns')


class Redirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, message, headers, target):
        target = safe_url(target)
        if request.full_url.startswith('https:') and not target.startswith('https:'):
            raise ValueError('https_downgrade')
        public_dns(target)
        return super().redirect_request(request, fp, code, message, headers, target)


class Document(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts, self.links, self.anchor, self.skip, self.title = [], [], None, 0, []
        self.in_title = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('script', 'style', 'noscript', 'svg'):
            self.skip += 1
        if tag == 'title':
            self.in_title = True
        if tag == 'a':
            self.anchor = [attrs.get('href') or '', []]
        if tag == 'img' and attrs.get('alt') and not self.skip:
            self.parts.extend((' ', attrs['alt'], ' '))
            if self.anchor:
                self.anchor[1].append(attrs['alt'])
        if tag in ('p', 'div', 'br', 'li', 'h1', 'h2', 'h3', 'td', 'tr', 'section'):
            self.parts.append('\n')

    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'noscript', 'svg') and self.skip:
            self.skip -= 1
        if tag == 'title':
            self.in_title = False
        if tag == 'a' and self.anchor:
            self.links.append((self.anchor[0], ' '.join(' '.join(self.anchor[1]).split())))
            self.anchor = None

    def handle_data(self, data):
        if self.in_title:
            self.title.append(data)
        if not self.skip:
            self.parts.append(data)
            if self.anchor:
                self.anchor[1].append(data)

    def text(self):
        return '\n'.join(' '.join(line.split()) for line in ''.join(self.parts).splitlines() if line.strip())


def rank_links(base, links):
    found = {}
    host = urllib.parse.urlsplit(base).hostname
    for href, label in links:
        if not href or EXCLUDE_LINK.search(label + ' ' + href):
            continue
        try:
            url = safe_url(urllib.parse.urljoin(base, href))
        except ValueError:
            continue
        p = urllib.parse.urlsplit(url)
        if p.hostname != host or url == safe_url(base):
            continue
        words = label + ' ' + p.path
        if re.search(r'通訳|外国語|外国人|言語対応|国際(?:医療|診療)|foreign|international.(?:patient|medical)|interpret|language.support', words, re.I):
            score = 100
        elif re.search(r'受診.*(?:案内|方)|初診|外来.*案内|new.patients|first.visit|outpatient|patient.guide|patients.?visitors|appointments?|consultation', words, re.I):
            score = 90 if re.search(r'/(?:en|eng|english)(?:/|_)|_en/', p.path, re.I) else 60
        elif re.fullmatch(r'\s*(?:English|英語|EN|中文|한국어|Español)\s*', label, re.I) or re.fullmatch(r'/(?:en|english|eng|zh|cn|ko|es)/?(?:index\.(?:html?|php))?', p.path, re.I):
            score = 80
        else:
            continue
        found[url] = max(score, found.get(url, 0))
    # Prefer clinical content over navigation/footer pages. URL ordering never
    # makes a site map outrank an outpatient or foreign-patient guide.
    return [{'url': url, 'score': score} for url, score in sorted(found.items(), key=lambda item: (-item[1], item[0]))]


def snippets(text):
    flat = ' '.join(text.split())
    results, covered = [], -1
    for match in CLINICAL.finditer(flat):
        if match.start() <= covered:
            continue
        start, end = max(0, match.start() - 100), min(len(flat), match.end() + 220)
        results.append(flat[start:end])
        covered = end
        if len(results) == 12:
            break
    return results


def unavailable(error, phase):
    result = {'phase': phase, 'error': type(error).__name__}
    if isinstance(error, urllib.error.HTTPError):
        result['httpStatus'] = error.code
        body = error.read(700).decode('utf8', 'replace')
        result['errorKind'] = 'upstream_transport_error' if 'envoy://cloudflare_' in body else 'http_error'
        result['message'] = body[:300] if result['errorKind'] == 'upstream_transport_error' else f'HTTP {error.code}'
    else:
        result['errorKind'] = 'network_or_url_error'
        result['message'] = str(error)[:250]
    return result


class Reader:
    def __init__(self, cache, timeout=12):
        self.cache, self.timeout = Path(cache), timeout
        self.cache.mkdir(parents=True, exist_ok=True)
        self.lock = threading.Lock()
        self.host_locks, self.robots, self.last = {}, {}, {}
        self.cache_bytes = sum(path.stat().st_size for path in self.cache.glob('*.gz'))
        self.cache_budget = 25 * 1024 * 1024

    def raw(self, url):
        public_dns(url)
        opener = urllib.request.build_opener(Redirect())
        request = urllib.request.Request(safe_url(url), headers={'User-Agent': AGENT, 'Accept': 'text/html,application/xhtml+xml,text/plain,application/pdf;q=0.5'})
        with opener.open(request, timeout=self.timeout) as response:
            body = response.read(MAX_BYTES + 1)
            if len(body) > MAX_BYTES:
                raise ValueError('response_too_large')
            return safe_url(response.url), response.headers.get_content_type(), response.headers.get_content_charset(), body

    def page(self, url):
        url = safe_url(url)
        origin = urllib.parse.urlunsplit((*urllib.parse.urlsplit(url)[:2], '', '', ''))
        host = urllib.parse.urlsplit(url).hostname
        with self.lock:
            lock = self.host_locks.setdefault(host, threading.Lock())
        with lock:
            if origin not in self.robots:
                parser = urllib.robotparser.RobotFileParser()
                try:
                    _, _, _, raw = self.raw(origin + '/robots.txt')
                    parser.parse(raw.decode('utf8', 'replace').splitlines())
                    self.robots[origin] = parser
                except urllib.error.HTTPError as error:
                    if error.code in (404, 410):
                        parser.parse([])
                        self.robots[origin] = parser
                    else:
                        # An unavailable robots file is not permission to crawl.
                        self.robots[origin] = unavailable(error, 'robots')
                except Exception as error:
                    self.robots[origin] = unavailable(error, 'robots')
            policy = self.robots[origin]
            if isinstance(policy, dict):
                return {'requestedUrl': url, 'status': 'robots_unavailable', **policy}
            if not policy.can_fetch(AGENT, url):
                return {'requestedUrl': url, 'status': 'robots_disallowed'}
            delay = max(0.5, policy.crawl_delay(AGENT) or 0)
            if delay > 20:
                return {'requestedUrl': url, 'status': 'manual_review_long_crawl_delay'}
            remaining = delay - (time.monotonic() - self.last.get(host, 0))
            if remaining > 0:
                time.sleep(remaining)
            self.last[host] = time.monotonic()
            try:
                final, mime, charset, raw = self.raw(url)
                sha = hashlib.sha256(raw).hexdigest()
                result = {'requestedUrl': url, 'url': final, 'httpStatus': 200, 'contentType': mime,
                          'contentSha256': sha, 'checkedAt': now(), 'status': 'retrieved'}
                if mime not in ('text/html', 'application/xhtml+xml', 'text/plain'):
                    result.update(status='manual_review_document', links=[], candidates=[])
                    return result
                if not charset:
                    match = re.search(br'charset\s*=\s*["\']?([A-Za-z0-9_-]+)', raw[:10000], re.I)
                    charset = match.group(1).decode() if match else 'utf8'
                try:
                    html = raw.decode(charset, 'replace')
                except LookupError:
                    html = raw.decode('utf8', 'replace')
                document = Document()
                document.feed(html)
                text = document.text()
                result.update(title=' '.join(document.title)[:300], textCharacters=len(text),
                              links=rank_links(final, document.links), candidates=snippets(text),
                              websiteTranslationMention=bool(TRANSLATION.search(text)),
                              identityExcerpt=text[:500] + '\n' + text[-1000:])
                if len(text) < 150:
                    result['status'] = 'manual_review_dynamic_or_image_page'
                if result['candidates']:
                    result['sourceSnapshotSaved'] = self.store(sha, raw, text)
                return result
            except Exception as error:
                return {'requestedUrl': url, 'status': 'fetch_unavailable', **unavailable(error, 'page')}

    def store(self, sha, raw, text):
        saved = []
        # Keep full relevant text first; bound artifact storage in each shard.
        for suffix, body in (('text', text.encode()), ('body', raw)):
            path = self.cache / (sha + '.' + suffix + '.gz')
            with self.lock:
                if path.exists():
                    saved.append(suffix)
                    continue
                packed = gzip.compress(body)
                if self.cache_bytes + len(packed) <= self.cache_budget:
                    path.write_bytes(packed)
                    self.cache_bytes += len(packed)
                    saved.append(suffix)
        return saved


def load_clinics(root):
    root = Path(root)
    manifest = json.loads((root / 'data/national-clinics-manifest.json').read_text())
    packed = b''.join((root / 'data' / name).read_bytes() for name in manifest['parts'])
    raw = gzip.decompress(packed)
    if hashlib.sha256(raw).hexdigest() != manifest['jsonSha256']:
        raise ValueError('national archive checksum mismatch')
    records = json.loads(raw)
    if len(records) != manifest['recordCount'] or len({record['id'] for record in records}) != len(records):
        raise ValueError('national archive facility identity mismatch')
    return [{'id': record['id'], 'name': record['name']['ja'], 'address': record['address']['ja'],
             'website': record['website'], 'prefecture': record['prefectureCode']}
            for record in records if record['prefectureCode'] != '13' and record.get('website')]


def group_sites(clinics, shard, shards):
    grouped = {}
    for clinic in clinics:
        try:
            host = urllib.parse.urlsplit(safe_url(clinic['website'])).hostname
        except ValueError:
            host = clinic['website']
        if int(hashlib.sha256(host.encode()).hexdigest(), 16) % shards != shard:
            continue
        grouped.setdefault(clinic['website'], []).append(clinic)
    return grouped


def audit_site(website, reader, max_pages, resume_file, seed=None, retry=False, deadline=None):
    if resume_file.exists():
        cached = json.loads(resume_file.read_text())
        if cached.get('version') == VERSION and cached.get('website') == website:
            has_failure = any(page.get('status') in ('fetch_unavailable', 'robots_unavailable') for page in cached.get('pages', []))
            if cached.get('complete') and not (retry and has_failure):
                return cached
            seed = cached
    result = {'version': VERSION, 'website': website, 'checkedAt': now(), 'pages': [], 'complete': False}
    try:
        original = safe_url(website)
        first = 'https:' + original[5:] if original.startswith('http:') else original
        pending, visited = [(first, 0, 200)], set()
        while pending and len(result['pages']) < max_pages:
            if deadline and time.monotonic() >= deadline:
                result['stopReason'] = 'time_budget'
                break
            pending.sort(key=lambda item: (-item[2], item[1], item[0]))
            url, depth, _ = pending.pop(0)
            if url in visited:
                continue
            visited.add(url)
            page = reader.page(url)
            result['pages'].append(page)
            if len(result['pages']) == 1 and first != original and page.get('status') in ('fetch_unavailable', 'robots_unavailable'):
                if page.get('httpStatus') not in (401, 403, 429):
                    pending.append((original, 0, 190))
            if depth < 2:
                for link in page.get('links', [])[:12]:
                    if link['url'] not in visited:
                        pending.append((link['url'], depth + 1, link['score']))
        result['complete'] = result.get('stopReason') != 'time_budget'
    except Exception as error:
        result['error'] = str(error)[:250]
        result['complete'] = True
    # A previous successful page is never erased by a later temporary error.
    if seed:
        by_url = {page.get('url') or page.get('requestedUrl'): page for page in seed.get('pages', []) if page.get('contentSha256')}
        for page in result['pages']:
            key = page.get('url') or page.get('requestedUrl')
            if page.get('contentSha256') or key not in by_url:
                by_url[key] = page
        result['pages'] = list(by_url.values())
    resume_file.write_text(json.dumps(result, ensure_ascii=False) + '\n')
    return result


def csv_safe(value):
    value = str(value)
    return "'" + value if value.lstrip().startswith(('=', '+', '-', '@')) or value.startswith(('\t', '\r', '\n')) else value


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', default='.')
    parser.add_argument('--output', default='audit-output')
    parser.add_argument('--cache', default='audit-cache')
    parser.add_argument('--workers', type=int, default=8)
    parser.add_argument('--shard', type=int, default=0)
    parser.add_argument('--shards', type=int, default=1)
    parser.add_argument('--limit', type=int, default=0)
    parser.add_argument('--max-pages', type=int, default=6)
    parser.add_argument('--max-seconds', type=int, default=0)
    parser.add_argument('--retry-unavailable', action='store_true')
    args = parser.parse_args()
    if not 1 <= args.workers <= 16 or not 0 <= args.shard < args.shards <= 16 or not 1 <= args.max_pages <= 12 or args.limit < 0 or args.max_seconds < 0:
        parser.error('invalid bounds')
    output = Path(args.output)
    (output / 'sites').mkdir(parents=True, exist_ok=True)
    clinics = load_clinics(args.root)
    sites = group_sites(clinics, args.shard, args.shards)
    if args.limit:
        sites = dict(list(sites.items())[:args.limit])
    reader = Reader(args.cache)
    counts, retrieval_counts = collections.Counter(), collections.Counter()
    urls_attempted, urls_with_body, urls_complete = 0, 0, 0
    rows, started = 0, time.monotonic()
    deadline = started + args.max_seconds if args.max_seconds else None

    def run(website):
        key = hashlib.sha256(website.encode()).hexdigest()
        return audit_site(website, reader, args.max_pages, output / 'sites' / (key + '.json'), retry=args.retry_unavailable, deadline=deadline)

    with gzip.open(output / 'site-results.jsonl.gz', 'wt', encoding='utf8') as log, \
            gzip.open(output / 'facility-results.csv.gz', 'wt', encoding='utf-8-sig', newline='') as report, \
            concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        writer = csv.writer(report)
        writer.writerow(['facility_id', 'prefecture', 'name', 'address', 'directory_website', 'body_pages_retrieved',
                         'content_assessment', 'retrieval_status', 'candidate_source_url', 'candidate_quote', 'checked_at'])
        for number, result in enumerate(pool.map(run, sites), 1):
            log.write(json.dumps(result, ensure_ascii=False) + '\n')
            log.flush()
            pages = result['pages']
            body_pages = [page for page in pages if page.get('textCharacters', 0) >= 150]
            candidates = [(page, quote) for page in pages for quote in page.get('candidates', [])]
            assessment = 'needs_evidence_review' if candidates else 'no_statement_in_retrieved_pages' if body_pages else 'not_assessed'
            if candidates and len(sites[result['website']]) > 1:
                assessment = 'needs_facility_identity_review'
            status = 'body_retrieved' if body_pages else next((page['status'] for page in pages), result.get('stopReason', 'invalid_url'))
            urls_attempted += bool(pages)
            urls_with_body += bool(body_pages)
            urls_complete += bool(result['complete'])
            candidate_page, quote = candidates[0] if candidates else ({}, '')
            for clinic in sites[result['website']]:
                writer.writerow([csv_safe(value) for value in [clinic['id'], clinic['prefecture'], clinic['name'], clinic['address'],
                    clinic['website'], len(body_pages), assessment, status, candidate_page.get('url', ''), quote, result['checkedAt']]])
                counts[assessment] += 1
                retrieval_counts[status] += 1
                rows += 1
            report.flush()
            if number % 50 == 0:
                print(json.dumps({'urlsCompleted': number, 'urlsInShard': len(sites), 'facilityRows': rows,
                                  'seconds': round(time.monotonic() - started), 'counts': dict(counts)}), flush=True)
    summary = {'checkedAt': now(), 'version': VERSION, 'shard': args.shard, 'shards': args.shards,
               'targetUrls': len(sites), 'urlsAttempted': urls_attempted, 'urlsWithBody': urls_with_body,
               'urlsWithinPageBudgetCompleted': urls_complete, 'facilityRows': rows,
               'counts': dict(counts), 'retrievalCounts': dict(retrieval_counts),
               'limitations': ['Candidates require facility-identity and context review before registration.',
                              'No matching text in selected pages does not establish no language support.',
                              'HTTP/robots/JS/PDF retrieval limitations remain unconfirmed.']}
    (output / 'summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(summary), flush=True)


if __name__ == '__main__':
    main()
