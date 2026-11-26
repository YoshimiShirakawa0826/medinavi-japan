// MediNavi JAPAN offline cache.
// - Emergency information is pre-cached so it opens without a connection.
// - Pages: network first, falling back to the cached copy.
// - Build assets (/_next/static): cache first (file names are content-hashed).
// - The 22 MB clinic data file is never cached here.
const VERSION = 'v1';
const PAGE_CACHE = `medinavi-pages-${VERSION}`;
const ASSET_CACHE = `medinavi-assets-${VERSION}`;
const PRECACHE = ['/emergency', '/symptoms', '/'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(PAGE_CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('medinavi-') && key !== PAGE_CACHE && key !== ASSET_CACHE).map(key => caches.delete(key)),
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/data/')) return;

  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(caches.open(ASSET_CACHE).then(async cache => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) cache.put(request, response.clone());
      return response;
    }));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(PAGE_CACHE);
      try {
        const response = await fetch(request);
        // Store pages by path only, so query strings (e.g. ?hl=zh) share one copy.
        if (response.ok) cache.put(url.pathname, response.clone());
        return response;
      } catch {
        return (await cache.match(url.pathname)) || (await cache.match('/emergency')) || Response.error();
      }
    })());
  }
});
