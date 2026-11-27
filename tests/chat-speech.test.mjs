import { test } from 'node:test';
import assert from 'node:assert/strict';
import { appendSpoken, recognitionConstructor, speechErrorKind, transcriptOf, SPEECH_LOCALES } from '../src/lib/chat/speech.ts';

test('recognition is found under either the standard or the webkit name', () => {
  class Std {}
  class Webkit {}
  assert.equal(recognitionConstructor({ SpeechRecognition: Std }), Std);
  assert.equal(recognitionConstructor({ webkitSpeechRecognition: Webkit }), Webkit);
  assert.equal(recognitionConstructor({}), null);
  assert.equal(recognitionConstructor(undefined), null);
});

test('every UI language has a recognition locale', () => {
  assert.deepEqual(Object.keys(SPEECH_LOCALES).sort(), ['en', 'es', 'ja', 'ko', 'zh']);
});

test('interim and final results are joined into one transcript', () => {
  const results = [Object.assign([{ transcript: 'I have ' }], { isFinal: true }), Object.assign([{ transcript: 'a fever' }], { isFinal: false })];
  assert.equal(transcriptOf(results), 'I have a fever');
});

test('spoken text is appended with spacing that suits the language', () => {
  assert.equal(appendSpoken('', '熱があります', 'ja'), '熱があります');
  assert.equal(appendSpoken('新宿です。', '熱があります', 'ja'), '新宿です。熱があります');
  assert.equal(appendSpoken('Near Shibuya.', 'I have a fever', 'en'), 'Near Shibuya. I have a fever');
  assert.equal(appendSpoken('typed', '', 'en'), 'typed');
});

test('recognition errors map to user messages; deliberate stops are silent', () => {
  assert.equal(speechErrorKind('not-allowed'), 'denied');
  assert.equal(speechErrorKind('no-speech'), 'nospeech');
  assert.equal(speechErrorKind('network'), 'failed');
  assert.equal(speechErrorKind('aborted'), null);
});
