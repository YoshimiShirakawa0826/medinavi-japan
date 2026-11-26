import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allowRequest, isSameOrigin } from '../src/lib/chat/rate-limit.ts';

test('a visitor gets 5 requests per minute', () => {
  const t = 1_000_000;
  for (let i = 0; i < 5; i++) assert.equal(allowRequest('ip-a', 5, t + i), true);
  assert.equal(allowRequest('ip-a', 5, t + 10), false);
  assert.equal(allowRequest('ip-b', 5, t + 10), true);
  assert.equal(allowRequest('ip-a', 5, t + 61_000), true);
});

test('only same-origin requests are accepted', () => {
  const req = origin => new Request('https://medinavi-japan.vercel.app/api/chat', { method: 'POST', headers: origin ? { origin } : {} });
  assert.equal(isSameOrigin(req('https://medinavi-japan.vercel.app')), true);
  assert.equal(isSameOrigin(req('https://evil.example')), false);
  assert.equal(isSameOrigin(req(null)), false);
});
