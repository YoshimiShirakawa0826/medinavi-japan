import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { clinicAccessReviews } from '../data/clinic-access-reviews.mjs';
import { applyAccessReviews } from '../scripts/apply-access-reviews.mjs';
import { hasWebsiteReview, matchesAccess } from '../src/lib/clinic-access.ts';
import { whatsAppLinkFromConfig } from '../src/lib/consultation.ts';

const parts = readdirSync('data').filter(name => /^clinics\.json\.gz\.part\d+$/.test(name)).sort();
const base = JSON.parse(gunzipSync(Buffer.concat(parts.map(name => readFileSync(`data/${name}`)))));
const clinics = applyAccessReviews(base, clinicAccessReviews);

test('website reviews match 10 existing clinics without changing base records or direct verification', () => {
  assert.equal(clinics.length, 4430);
  assert.equal(clinics.filter(hasWebsiteReview).length, 10);
  assert.equal(clinics.filter(h => h.phone).length, 4316);
  for (let i = 0; i < base.length; i++) {
    const { accessEvidence, ...rest } = clinics[i];
    assert.deepEqual(rest, base[i]);
    if (accessEvidence) assert.notEqual(clinics[i].verification.status, 'verified');
  }
});

test('evidence drives filters; old false defaults and document support do not imply acceptance', () => {
  const byId = Object.fromEntries(clinics.map(h => [h.id, h]));
  const positiveCounts = { creditCardAccepted: 8, overseasInsuranceAccepted: 2, walkInAvailable: 5 };
  for (const [field, count] of Object.entries(positiveCounts)) {
    assert.equal(clinics.filter(h => matchesAccess(h, field)).length, count);
    assert.equal(matchesAccess({ accessInfo: { [field]: true } }, field), false);
  }
  assert.equal(matchesAccess(byId['clinic-1322136000366'], 'overseasInsuranceAccepted'), false); // reimbursement documents
  assert.equal(matchesAccess(byId['clinic-1322136600080'], 'overseasInsuranceAccepted'), false); // billing unconfirmed
  assert.equal(matchesAccess(byId['clinic-1322136200484'], 'walkInAvailable'), false); // appointment required
  assert.equal(matchesAccess(byId['clinic-1322136400213'], 'walkInAvailable'), true); // appointment priority
  assert.equal(clinics.filter(h => matchesAccess(h, 'creditCardAccepted') && matchesAccess(h, 'walkInAvailable') && matchesAccess(h, 'overseasInsuranceAccepted')).length, 2);
});

test('bad clinic matches, duplicates, missing translations and incomplete insurance evidence stop the build', () => {
  for (const mutate of [
    r => { r[0].clinicId = 'clinic-not-found'; },
    r => { r[0].matchedPhone = '03-0000-0000'; },
    r => { r.push(r[0]); },
    r => { delete r[0].fields.creditCardAccepted.notes.en; },
    r => { r[0].fields.creditCardAccepted.sources = []; },
    r => { r[0].fields.creditCardAccepted.sources[0].url = 'javascript:alert(1)'; },
    r => { r[0].fields.creditCardAccepted.sources[0].checkedAt = '2099-01-01'; },
    r => { r[3].fields.overseasInsuranceAccepted.billing = 'pay_first'; },
  ]) {
    const reviews = structuredClone(clinicAccessReviews);
    mutate(reviews);
    assert.throws(() => applyAccessReviews(base, reviews));
  }
});

test('WhatsApp stays disabled until registration is explicitly confirmed in deployment config', () => {
  for (const value of [undefined, '', 'false', 'yes', 'https://example.com']) {
    assert.equal(whatsAppLinkFromConfig(value), null);
  }
  assert.equal(whatsAppLinkFromConfig('true'), 'https://wa.me/817090369655');
});
