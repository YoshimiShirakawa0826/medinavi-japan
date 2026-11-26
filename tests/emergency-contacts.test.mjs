import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EMERGENCY_CONTACTS, jntoMedicalSearchUrl } from '../src/lib/emergency-contacts.ts';

test('helpline call links use the international form of the published number', () => {
  for (const { display, href } of Object.values(EMERGENCY_CONTACTS)) {
    assert.equal(href, `tel:+81${display.replace(/\D/g, '').slice(1)}`);
  }
});

test('JNTO search opens in the closest available language', () => {
  assert.match(jntoMedicalSearchUrl('ko'), /\/kor\//);
  assert.match(jntoMedicalSearchUrl('zh'), /\/chc\//);
  assert.match(jntoMedicalSearchUrl('es'), /\/eng\//);
});
