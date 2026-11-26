import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectEmergency, redactPersonalInfo, sanitizeReply } from '../src/lib/chat/safety.ts';

test('danger signs are detected in all five languages', () => {
  for (const text of ['父が意識がないです', '胸が痛くて息が苦しい', 'My friend is unconscious', 'I have chest pain',
    '我朋友昏迷了', '呼吸困難', '가슴이 아파요', '숨을 못 쉬어요', 'Tengo dolor en el pecho', 'no puede respirar', 'I want to kill myself']) {
    assert.equal(detectEmergency(text), true, text);
  }
});

test('mild symptoms are not flagged as emergencies', () => {
  for (const text of ['のどが痛いです', 'I have a mild fever and a runny nose', '我有点头疼', '배가 조금 아파요', 'Me pica la piel']) {
    assert.equal(detectEmergency(text), false, text);
  }
});

test('identifiers are removed before text leaves the app', () => {
  const text = redactPersonalInfo('I am John, email john.doe@example.com, phone +1 415 555 1234, passport TK1234567. Fever 38.5, age 34');
  assert.doesNotMatch(text, /example\.com|415|TK1234567/);
  assert.match(text, /38\.5/);
  assert.match(text, /34/);
});

test('model replies keep official numbers and drop invented ones', () => {
  const reply = sanitizeReply('Call 119 now. Or HIMAWARI 03-5285-8181. The clinic number is 03-1234-5678, see https://example.com');
  assert.match(reply, /119/);
  assert.match(reply, /03-5285-8181/);
  assert.doesNotMatch(reply, /1234-5678|example\.com/);
});
