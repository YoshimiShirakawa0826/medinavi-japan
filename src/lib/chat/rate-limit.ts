// Per-visitor limit so one person (or a script) cannot use up the shared free-beta
// quota of 30 requests per minute. Kept in memory per server instance: a light guard,
// not a hard guarantee.
const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

export function allowRequest(key: string, limit = 5, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter(time => now - time < WINDOW_MS);
  if (recent.length >= limit) { hits.set(key, recent); return false; }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, times] of hits) if (!times.some(time => now - time < WINDOW_MS)) hits.delete(k);
  return true;
}

/** Only pages of this site may call the chat API. */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}
