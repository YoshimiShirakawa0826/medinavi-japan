import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { PREFECTURES, clinicPrefecture, coverageFor, prefectureByCode } from '../data/prefectures.mjs';
import { prefectureSearchChanges, updateSearch } from '../src/lib/search-state.ts';
import { scheduledOpenStatus } from '../src/lib/clinic-utils.ts';
import { nabiiClinicUrl } from '../src/lib/clinic-contact.ts';
import { searchRecord } from '../scripts/search-index.mjs';
import { matchesAccess } from '../src/lib/clinic-access.ts';

const manifest = JSON.parse(readFileSync(new URL('../data/national-clinics-manifest.json', import.meta.url)));
const raw = gunzipSync(Buffer.concat(manifest.parts.map(part => readFileSync(new URL(`../data/${part}`, import.meta.url)))));
const records = JSON.parse(raw);

test('national snapshot contains real, unique, sourced hospital and clinic IDs in all 47 prefectures', () => {
  assert.equal(createHash('sha256').update(raw).digest('hex'), manifest.jsonSha256);
  assert.equal(records.length, 87870);
  assert.equal(new Set(records.map(record => record.id)).size, records.length);
  const coverage = coverageFor(records);
  assert.deepEqual(coverage.prefectures, manifest.prefectures);
  assert.equal(Object.keys(coverage.prefectures).length, 47);
  assert.ok(Object.values(coverage.prefectures).every(count => count > 0));
  for (const record of records) {
    assert.equal(clinicPrefecture(record), record.prefectureCode);
    assert.ok(record.name.ja && record.address.ja && nabiiClinicUrl(record.id));
    assert.ok(manifest.sources.some(source => source.url === record.source.url));
  }
  const sapporo = records.find(record => record.id === 'clinic-0111010000010');
  assert.equal(sapporo.name.en, 'Sapporo Medical University Hospital');
  assert.equal(sapporo.address.ja, '北海道札幌市中央区南１条西１６丁目２９１番地');
  assert.ok(sapporo.departments.includes('internal'));
});

test('a Romanized institution name never becomes evidence of English or same-day availability', () => {
  for (const record of records) {
    assert.deepEqual(record.supportedLanguages, []);
    assert.equal(record.phone, '');
    assert.equal(record.verification.status, 'unverified');
    assert.deepEqual(record.accessInfo, {});
    assert.equal(scheduledOpenStatus(record, new Date('2026-10-20T01:00:00Z')), null);
  }
});

test('prefecture selection resets location, distance and pagination while retaining clinical filters', () => {
  const url = updateSearch('area=Shibuya&location=manual&dist=3&page=8&lang=en&dept=internal&q=病院', prefectureSearchChanges('27'));
  const params = new URL(url, 'https://example.test').searchParams;
  assert.equal(params.get('prefecture'), '27');
  assert.equal(params.get('lang'), 'en');
  assert.equal(params.get('dept'), 'internal');
  assert.equal(params.get('q'), '病院');
  for (const key of ['area', 'location', 'dist', 'page']) assert.equal(params.has(key), false);
  assert.equal(prefectureSearchChanges('99').prefecture, null);
});

test('prefectures use stable JIS codes and full addresses, including postal prefixes and nonnumeric facility IDs', () => {
  assert.equal(PREFECTURES.length, 47);
  assert.equal(prefectureByCode('01').name.ja, '北海道');
  assert.equal(prefectureByCode('47').name.ja, '沖縄県');
  assert.equal(prefectureByCode('../13'), null);
  for (const prefecture of PREFECTURES) {
    assert.equal(clinicPrefecture({ address: { ja: `〒123-4567 ${prefecture.name.ja}テスト市` } }), prefecture.code);
    for (const language of ['ja', 'en', 'zh', 'ko', 'es']) assert.ok(prefecture.name[language]);
  }
  assert.equal(clinicPrefecture({ id: 'clinic-151BYJTX00002' }), '15');
  assert.equal(clinicPrefecture({ name: { en: 'Tokyo Clinic' }, address: { ja: '大阪府大阪市' } }), '27');
});

test('compact search records preserve specialty and language restrictions on walk-ins and insurance', () => {
  const record = {
    name: { ja: '医院', en: 'Clinic' }, address: { ja: '東京都', en: 'Tokyo' },
    accessEvidence: {
      walkInAvailable: { status: 'conditional', departments: [{ name: '内科', status: 'no' }, { name: '皮膚科', status: 'yes' }],
        languageReservations: [{ name: '英語', reservation: '要予約', note: '' }], notes: { ja: '予約条件あり' }, sources: [{ url: 'https://example.com' }] },
      overseasInsuranceAccepted: { status: 'yes', billing: 'pay_first', notes: {}, sources: [] },
    },
  };
  const summary = searchRecord(record);
  assert.equal(matchesAccess(summary, 'walkInAvailable', 'internal', 'ja'), false);
  assert.equal(matchesAccess(summary, 'walkInAvailable', 'dermatology', 'ja'), true);
  assert.equal(matchesAccess(summary, 'walkInAvailable', 'dermatology', 'en'), false);
  assert.equal(matchesAccess(summary, 'overseasInsuranceAccepted'), false);
  assert.deepEqual(record.accessEvidence.walkInAvailable.sources, [{ url: 'https://example.com' }]);
});
