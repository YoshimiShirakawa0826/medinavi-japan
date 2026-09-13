import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nabiiAccessReviews } from '../scripts/nabii-access-reviews.mjs';
import { applyAccessReviews } from '../scripts/apply-access-reviews.mjs';
import { matchesAccess } from '../src/lib/clinic-access.ts';

const clinic = { id: 'clinic-1321310137216', name: { ja: 'テスト医院' }, address: { ja: '東京都港区芝1-2-3' }, phone: '03-1111-2222' };
const source = { clinicId: clinic.id, clinicName: clinic.name.ja, matchedPhone: clinic.phone, matchedAddress: clinic.address.ja,
  url: 'https://www.iryou.teikyouseido.mhlw.go.jp/znk-web/juminkanja/S2430/initialize?kikanCd=1310137216&kikanKbn=2&prefCd=13',
  checkedAt: '2026-09-13', sourceUpdatedAt: '2026-01-23', sha256: 'a'.repeat(64), creditCard: '可能',
  japaneseInsuranceDesignation: true, departments: [{ name: '内科', status: 'no' }, { name: '皮膚科', status: 'yes' }] };
const materialize = record => applyAccessReviews([clinic], nabiiAccessReviews([clinic], [record]))[0];

test('Nabii answers preserve specialty scope and never infer travel-insurance direct billing', () => {
  const result = materialize(source);
  assert.equal(matchesAccess(result, 'creditCardAccepted'), true);
  assert.equal(matchesAccess(result, 'japaneseHealthInsurance'), true);
  assert.equal(matchesAccess(result, 'overseasInsuranceAccepted'), false);
  assert.equal(matchesAccess(result, 'walkInAvailable'), true);
  assert.equal(matchesAccess(result, 'walkInAvailable', 'internal'), false);
  assert.equal(matchesAccess(result, 'walkInAvailable', 'dermatology'), true);
  const cosmetic = materialize({ ...source, departments: [{ name: '美容皮膚科', status: 'yes' }] });
  assert.equal(matchesAccess(cosmetic, 'walkInAvailable', 'dermatology'), false);
  const restricted = materialize({ ...source, languageReservations: [{ name: '英語', reservation: '要予約', note: '-' }] });
  assert.equal(matchesAccess(restricted, 'walkInAvailable', 'dermatology', 'en'), false);
  assert.equal(matchesAccess(restricted, 'walkInAvailable', 'dermatology', 'ja'), true);
});

test('blank answers, electronic-payment-only negatives and absent designations stay out of positive filters', () => {
  for (const creditCard of [null, '-', '', '未回答']) {
    const result = materialize({ ...source, creditCard, electronicPayment: '不可', japaneseInsuranceDesignation: false });
    assert.equal(result.accessEvidence.creditCardAccepted.status, 'information');
    assert.equal(matchesAccess(result, 'creditCardAccepted'), false);
    assert.equal(result.accessEvidence.japaneseHealthInsurance, undefined);
  }
  const result = materialize({ ...source, creditCard: '-', electronicPayment: '-' });
  assert.equal(result.accessEvidence.creditCardAccepted, undefined);
});

test('wrong clinic IDs, changed base identity, invalid dates and malformed scoped facts fail closed', () => {
  for (const changes of [
    { matchedPhone: '03-1111-9999' }, { matchedAddress: '別住所' }, { clinicName: '別医院' },
    { url: source.url.replace('1310137216', '1310137240') },
    { sourceUpdatedAt: '2099-01-01' }, { checkedAt: '2026-02-30' },
    { departments: [{ name: '内科', status: 'perhaps' }] },
  ]) assert.throws(() => materialize({ ...source, ...changes }));
  assert.throws(() => nabiiAccessReviews([clinic], [source, source]));
});

test('an explicit clinic-website correction takes priority without erasing other fields or changing base dates', () => {
  const first = materialize(source);
  const correction = { clinicId: clinic.id, clinicName: clinic.name.ja, matchedPhone: clinic.phone,
    identitySource: 'https://example.com/', fields: { creditCardAccepted: {
      status: 'no', notes: Object.fromEntries(['ja', 'en', 'zh', 'ko', 'es'].map(l => [l, 'Cash only'])),
      sources: [{ kind: 'official_website', url: 'https://example.com/payment', checkedAt: '2026-09-13' }],
    } } };
  const corrected = applyAccessReviews([first], [correction])[0];
  assert.equal(matchesAccess(corrected, 'creditCardAccepted'), false);
  assert.deepEqual(corrected.accessEvidence.japaneseHealthInsurance, first.accessEvidence.japaneseHealthInsurance);
  const { accessEvidence, ...base } = corrected;
  assert.ok(accessEvidence);
  assert.deepEqual(base, clinic);
});
