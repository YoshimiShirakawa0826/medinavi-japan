import { test } from 'node:test';
import assert from 'node:assert/strict';
import { searchClinics } from '../src/lib/chat/clinic-search.ts';

const base = { phone: '03-0000-0000', supportedLanguages: ['ja', 'en'], openingHours: {}, closedDays: {} };
const records = [
  { ...base, id: 'a', name: { ja: '新宿内科', en: 'Shinjuku Naika' }, address: '新宿', latitude: 35.6900, longitude: 139.7010, departments: ['internal'] },
  { ...base, id: 'b', name: { ja: '池袋内科', en: 'Ikebukuro Naika' }, address: '池袋', latitude: 35.7295, longitude: 139.7109, departments: ['internal'] },
  { ...base, id: 'c', name: { ja: '湘南美容クリニック新宿院', en: 'Shonan Beauty' }, address: '新宿', latitude: 35.6901, longitude: 139.7011, departments: ['dermatology', 'internal'] },
  { ...base, id: 'd', name: { ja: '新宿眼科', en: 'Shinjuku Eye' }, address: '新宿', latitude: 35.6902, longitude: 139.7012, departments: ['ophthalmology'], supportedLanguages: ['ja'] },
];
const now = new Date('2026-11-26T03:00:00Z');

test('search filters by department and area radius and hides cosmetic clinics', () => {
  const cards = searchClinics(records, { department: 'internal', area: 'Shinjuku' }, now);
  assert.deepEqual(cards.map(card => card.id), ['a']);
  assert.ok(cards[0].distanceKm !== null && cards[0].distanceKm < 1);
});

test('language filter keeps only clinics listing that language; unknown values are ignored', () => {
  assert.deepEqual(searchClinics(records, { language: 'en', area: 'Shinjuku' }, now).map(card => card.id), ['a']);
  assert.equal(searchClinics(records, { department: 'dentistry', area: 'nowhere' }, now).length, 3);
});

test('the visitor language ranks first without filtering others out', () => {
  const pool = [
    { ...base, id: 'x', name: { ja: 'A', en: 'A' }, address: '', latitude: 0, longitude: 0, departments: ['internal'], supportedLanguages: ['ja'] },
    { ...base, id: 'y', name: { ja: 'B', en: 'B' }, address: '', latitude: 0, longitude: 0, departments: ['internal'], supportedLanguages: ['ja', 'es'] },
  ];
  assert.deepEqual(searchClinics(pool, { department: 'internal' }, now, 5, 'es').map(c => c.id), ['y', 'x']);
});

test('the model never receives clinic names, addresses or phone numbers', async () => {
  const { describeForModel } = await import('../src/lib/chat/clinic-search.ts');
  const text = describeForModel(searchClinics(records, { department: 'internal' }, now), { department: 'internal' });
  assert.doesNotMatch(text, /新宿内科|Shinjuku Naika|03-0000-0000/);
  assert.match(text, /"found":/);
});
