import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyLanguageReviews, applyWebsiteHolds } from '../scripts/apply-language-reviews.mjs';
import { searchRecord } from '../scripts/search-index.mjs';
import { hasWebsiteReview } from '../src/lib/clinic-access.ts';

const clinic = { id: 'clinic-012100001', name: { ja: 'テスト医院' }, address: { ja: '北海道札幌市' },
  website: 'http://example.com/', supportedLanguages: ['ja'], phone: '', verification: { status: 'unverified' }, accessInfo: {} };
const source = { url: 'https://example.com/english/', checkedAt: '2026-10-20',
  quote: 'Our doctors provide consultations in English. Please make an appointment.', contentSha256: 'a'.repeat(64) };
const entry = { languages: ['en'], mode: 'doctor', reservation: 'required',
  notes: Object.fromEntries(['ja','en','zh','ko','es'].map(language => [language, 'A doctor speaks English; appointments required.'])), sources: [source] };
const review = { clinicId: clinic.id, clinicName: clinic.name.ja, clinicAddress: clinic.address.ja, clinicWebsite: clinic.website,
  identitySource: { requestedUrl: 'https://example.com/', url: 'https://example.com/', contentSha256: 'b'.repeat(64) }, entries: [entry] };

test('official website evidence adds clinical language support while preserving conditions and existing records', () => {
  const original = structuredClone(clinic);
  const [enriched] = applyLanguageReviews([clinic], [review]);
  assert.deepEqual(enriched.supportedLanguages, ['ja','en']);
  assert.equal(enriched.languageSupport[0].reservation, 'required');
  assert.deepEqual(enriched.languageSupport[0].sources, [source]);
  assert.deepEqual(enriched.verification, clinic.verification);
  assert.deepEqual(enriched.accessInfo, {}); // no same-day, walk-in, phone or availability inference
  assert.equal(hasWebsiteReview(enriched), true);
  assert.equal(searchRecord(enriched).languageSupport, undefined); // full quotes are detail-only
  assert.equal(hasWebsiteReview(searchRecord(enriched)), true);
  assert.deepEqual(searchRecord(enriched).supportedLanguages, ['ja','en']);
  assert.deepEqual(clinic, original);
});

test('contact-only support, machine translation and a patient-supplied interpreter do not imply clinical language capability', () => {
  for (const mode of ['contact_only','machine_translation','patient_arranged_interpreter','onsite_interpreter_unavailable']) {
    const [enriched] = applyLanguageReviews([clinic], [{ ...review, entries: [{ ...entry, mode }] }]);
    assert.deepEqual(enriched.supportedLanguages, ['ja']);
    assert.equal(enriched.languageSupport[0].mode, mode);
  }
});

test('reviews cannot be assigned to a similarly named facility or an unrelated source site', () => {
  for (const change of [{clinicId:'clinic-012OTHER'}, {clinicName:'別の医院'}, {clinicAddress:'北海道旭川市'},
    {clinicWebsite:'https://other.example.com/'}, {identitySource:{...review.identitySource,requestedUrl:'https://other.example.com/'}}]) {
    assert.throws(() => applyLanguageReviews([clinic], [{...review,...change}]), /identity mismatch/);
  }
  assert.throws(() => applyLanguageReviews([clinic], [review,review]), /identity mismatch/);
  for (const change of [{url:'https://third-party.example/'},{url:'javascript:alert(1)'},{checkedAt:'2026-02-30'},
    {checkedAt:'2999-01-01'},{quote:'English'},{contentSha256:'invalid'}]) {
    assert.throws(() => applyLanguageReviews([clinic], [{...review,entries:[{...entry,sources:[{...source,...change}]}]}]), /Incomplete/);
  }
});

test('an observed unrelated website can be withheld without deleting the clinic or its medical data', () => {
  const hold = { clinicId: clinic.id, clinicName: clinic.name.ja, clinicAddress: clinic.address.ja,
    clinicWebsite: clinic.website, observedUrl: 'https://unrelated.example/', checkedAt: '2026-10-20',
    contentSha256: 'a'.repeat(64), reason: 'Observed unrelated content' };
  const [result] = applyWebsiteHolds([clinic], [hold]);
  assert.equal(result.website, undefined);
  assert.equal(result.id, clinic.id);
  assert.deepEqual(result.supportedLanguages, clinic.supportedLanguages);
  assert.deepEqual(result.verification, clinic.verification);
  assert.equal(clinic.website, 'http://example.com/');
  assert.throws(() => applyWebsiteHolds([clinic], [{ ...hold, clinicAddress: '別の住所' }]), /identity mismatch/);
});
