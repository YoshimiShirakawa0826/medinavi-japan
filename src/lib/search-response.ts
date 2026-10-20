import { gzipSync } from 'node:zlib';

export function searchResponse(data: unknown, request: Request) {
  const body = JSON.stringify(data);
  const accepted = (request.headers.get('accept-encoding') || '').split(',').map(value => {
    const [name, ...options] = value.trim().toLowerCase().split(';');
    const quality = options.find(option => option.trim().startsWith('q='));
    return { name, quality: quality ? Number(quality.trim().slice(2)) : 1 };
  });
  const gzip = accepted.find(value => value.name === 'gzip') ?? accepted.find(value => value.name === '*');
  const headers = { 'Cache-Control': 'private, no-store', 'Content-Type': 'application/json; charset=utf-8', Vary: 'Accept-Encoding' };
  // Only the public coordinate projection can be large. Compress it on the
  // server too, so self-hosted setups do not depend on a CDN for compression.
  if (body.length > 64 * 1024 && gzip && gzip.quality > 0) {
    return new Response(new Uint8Array(gzipSync(body, { level: 3 })), { headers: { ...headers, 'Content-Encoding': 'gzip' } });
  }
  return new Response(body, { headers });
}
