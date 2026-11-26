import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runAssistant, SarashinaError, SARASHINA_MODEL } from '../src/lib/chat/assistant.ts';

const records = [{ id: 'a', name: { ja: '新宿内科', en: 'Shinjuku Naika' }, address: '東京都新宿区', phone: '03-1111-2222',
  latitude: 35.69, longitude: 139.701, departments: ['internal'], supportedLanguages: ['ja', 'en'], openingHours: {}, closedDays: {} }];

function mockFetch(responses, calls) {
  return async (url, init) => {
    calls.push(JSON.parse(init.body));
    const next = responses.shift();
    if (next.status) return new Response('{}', { status: next.status, headers: { 'retry-after': '7' } });
    return new Response(JSON.stringify({ choices: [{ message: next }] }), { status: 200 });
  };
}

test('tool calls search our data, and invented numbers are removed from the reply', async () => {
  const calls = [];
  const fetchImpl = mockFetch([
    { content: '', tool_calls: [{ id: 't1', type: 'function', function: { name: 'search_clinics', arguments: '{"department":"internal","area":"Shinjuku","language":"en"}' } }], reasoning: 'enc' },
    { content: 'Here are internal medicine clinics near Shinjuku. Call 03-9999-0000 first. If it gets worse, call 119.' },
  ], calls);
  const result = await runAssistant({ apiKey: 'k', language: 'en', history: [{ role: 'user', content: 'fever near Shinjuku' }], records, fetchImpl });
  assert.deepEqual(result.clinics.map(c => c.id), ['a']);
  assert.doesNotMatch(result.reply, /9999/);
  assert.match(result.reply, /119/);
  assert.equal(calls[0].model, SARASHINA_MODEL);
  assert.match(calls[0].messages[0].content, /English/);
  const toolMessage = calls[1].messages.find(m => m.role === 'tool');
  assert.equal(toolMessage.tool_call_id, 't1');
  assert.doesNotMatch(toolMessage.content, /03-1111-2222/);
  assert.equal(calls[1].messages.find(m => m.role === 'assistant').reasoning, 'enc');
});

test('rate limits surface as SarashinaError with Retry-After', async () => {
  const fetchImpl = mockFetch([{ status: 429 }], []);
  await assert.rejects(runAssistant({ apiKey: 'k', language: 'ja', history: [{ role: 'user', content: 'hi' }], records, fetchImpl }),
    error => error instanceof SarashinaError && error.status === 429 && error.retryAfter === 7);
});

test('internal department IDs in parentheses are removed from replies', async () => {
  const { stripDepartmentIds } = await import('../src/lib/chat/assistant.ts');
  assert.equal(stripDepartmentIds('内科（internal）を受診してください。耳鼻科 (ent) でも可'), '内科を受診してください。耳鼻科 でも可');
});

test('lines that list the carded clinics are removed from the reply', async () => {
  const { stripClinicLines } = await import('../src/lib/chat/assistant.ts');
  const cards = [{ id: 'a', name: { en: 'CLINIC OHIRA', ja: '大平医院' }, address: '', phone: '', departments: [], languages: [], openNow: null, distanceKm: 0.3 }];
  const reply = '以下是涩谷附近的诊所：\n\n- CLINIC OHIRA（0.3km）\n\n请提前致电确认。';
  assert.equal(stripClinicLines(reply, cards), '以下是涩谷附近的诊所：\n\n请提前致电确认。');
});
