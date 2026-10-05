import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { clinicCareGuidance, applyCareGuidance } from '../data/clinic-care-guidance.mjs';
import { scheduledOpenStatus, uninsuredStatus } from '../src/lib/clinic-utils.ts';

async function sourceClinics() {
  const directory = new URL('../data/', import.meta.url);
  const parts = (await readdir(directory)).filter(name => /^clinics\.json\.gz\.part\d+$/.test(name)).sort();
  return JSON.parse(gunzipSync(Buffer.concat(await Promise.all(parts.map(name => readFile(new URL(name, directory)))))));
}

test('three supplements match clinic identities without rewriting base facts or verification', async () => {
  const original = await sourceClinics();
  const clinics = applyCareGuidance(original);
  assert.equal(clinics.length, 4430);
  assert.equal(clinics.filter(c => c.careGuide).length, 3);
  assert.equal(clinics.filter(c => uninsuredStatus(c) === true).length, 2);
  assert.equal(clinics.filter(c => uninsuredStatus(c) === undefined).length, 4428);
  assert.equal(clinics.filter(c => uninsuredStatus(c) === false).length, 0);
  for (let i = 0; i < clinics.length; i++) {
    assert.deepEqual(clinics[i].name, original[i].name);
    assert.deepEqual(clinics[i].address, original[i].address);
    assert.deepEqual(clinics[i].verification, original[i].verification);
    assert.equal(clinics[i].updatedAt, original[i].updatedAt);
  }
  assert.equal(original.some(c => c.careGuide), false);
  assert.throws(() => applyCareGuidance(original.map(c => c.id === clinicCareGuidance[0].id ? { ...c, phone: '000' } : c)), /identity mismatch/);
});

test('care guidance has complete translations and HTTPS source / booking links', () => {
  for (const { guide } of clinicCareGuidance) {
    for (const language of ['ja', 'en', 'zh', 'ko', 'es']) {
      assert.ok(guide.notes[language].length >= 3);
      assert.ok(guide.notes[language].every(note => note.trim()));
    }
    for (const source of guide.sources) {
      assert.equal(new URL(source.url).protocol, 'https:');
      assert.equal(source.checkedAt, '2026-10-05');
    }
    assert.equal(new URL(guide.bookingUrl).protocol, 'https:');
  }
});

test('reception cutoffs, lunch breaks and conflicting hours do not imply reception remains open', () => {
  const tsic = { careGuide: clinicCareGuidance[0].guide, openingHours: { mon: [{ start: '09:00', end: '21:00' }] } };
  assert.equal(scheduledOpenStatus(tsic, new Date('2026-10-05T11:29:00Z')), true);
  assert.equal(scheduledOpenStatus(tsic, new Date('2026-10-05T11:30:00Z')), false);
  const nic = { careGuide: clinicCareGuidance[2].guide };
  assert.equal(scheduledOpenStatus(nic, new Date('2026-10-05T02:59:00Z')), true);
  assert.equal(scheduledOpenStatus(nic, new Date('2026-10-05T03:00:00Z')), false);
  assert.equal(scheduledOpenStatus(nic, new Date('2026-10-05T05:00:00Z')), true);
  assert.equal(scheduledOpenStatus(nic, new Date('2026-10-05T08:30:00Z')), false);
  assert.equal(scheduledOpenStatus(nic, new Date('2026-10-12T01:00:00Z')), null);
  assert.equal(scheduledOpenStatus({ ...tsic, careGuide: clinicCareGuidance[1].guide }, new Date('2026-10-05T01:00:00Z')), null);
});

test('consultation UI has no payment, phone CTA or external fee-site entry', async () => {
  const page = await readFile(new URL('../src/app/consultation/page.tsx', import.meta.url), 'utf8');
  const panel = await readFile(new URL('../src/components/ConsultationPanel.tsx', import.meta.url), 'utf8');
  const header = await readFile(new URL('../src/components/layout/Header.tsx', import.meta.url), 'utf8');
  const home = await readFile(new URL('../src/app/page.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(page + panel + header + home, /paymentLink|CONSULTATION_PAYMENT|buy\.stripe|nurse-guide-japan|common\.paid|30,?000|3万円/);
  assert.doesNotMatch(panel, /tel:/);
  assert.match(page, /whatsAppLinkFromConfig/);
});
