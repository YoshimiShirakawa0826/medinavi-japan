import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hasClinicCoordinates, clinicMapUrl, scheduledOpenStatus, matchesDepartment, pageWindow, loadClinics } from '../src/lib/clinic-utils.ts';
import { paymentLinkFromConfig } from '../src/lib/consultation.ts';

const schedule = { openingHours: { tue: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '17:00' }] } };

test('Tokyo hours are independent of the visitor timezone and respect breaks and closing time', () => {
  const originalTZ = process.env.TZ;
  try {
    for (const zone of ['UTC', 'Asia/Tokyo', 'America/Los_Angeles']) {
      process.env.TZ = zone;
      assert.equal(scheduledOpenStatus(schedule, new Date('2026-09-08T00:00:00Z')), true);
      assert.equal(scheduledOpenStatus(schedule, new Date('2026-09-08T03:00:00Z')), false);
      assert.equal(scheduledOpenStatus(schedule, new Date('2026-09-08T04:00:00Z')), true);
      assert.equal(scheduledOpenStatus(schedule, new Date('2026-09-08T08:00:00Z')), false);
    }
  } finally {
    if (originalTZ === undefined) delete process.env.TZ;
    else process.env.TZ = originalTZ;
  }
});

test('missing, malformed, overnight and holiday schedules never become an open badge', () => {
  const now = new Date('2026-09-08T01:00:00Z');
  assert.equal(scheduledOpenStatus({}, now), null);
  assert.equal(scheduledOpenStatus({ openingHours: { tue: [] } }, now), null);
  assert.equal(scheduledOpenStatus({ openingHours: { tue: [{ start: 'bad', end: '17:00' }] } }, now), null);
  assert.equal(scheduledOpenStatus({ openingHours: { tue: [{ start: '22:00', end: '06:00' }] } }, now), null);
  assert.equal(scheduledOpenStatus({ ...schedule, closedDays: { tue: true } }, now), false);
  assert.equal(scheduledOpenStatus(schedule, new Date('2026-09-22T01:00:00Z')), null);
  assert.equal(scheduledOpenStatus(schedule, new Date('2028-09-05T01:00:00Z')), null);
});

test('invalid clinic coordinates use the Japanese name and address in map searches', () => {
  assert.equal(hasClinicCoordinates(0, 0), false);
  assert.equal(hasClinicCoordinates(NaN, 139), false);
  assert.equal(hasClinicCoordinates(91, 139), false);
  assert.equal(hasClinicCoordinates(35, 181), false);
  assert.equal(hasClinicCoordinates(35.6, 139.7), true);
  const clinic = { latitude: 0, longitude: 0, name: { ja: 'テスト医院' }, address: { ja: '東京都新宿区' } };
  assert.equal(new URL(clinicMapUrl(clinic)).searchParams.get('query'), 'テスト医院 東京都新宿区');
});

test('department searches exclude records with no department', () => {
  assert.equal(matchesDepartment({ departments: [] }, 'dermatology'), false);
  assert.equal(matchesDepartment({ departments: [] }, null), true);
  assert.equal(matchesDepartment({ departments: ['dermatology'] }, 'dermatology'), true);
});

test('pagination reaches every record without overlap and handles invalid URLs', () => {
  const ids = new Set();
  for (let page = 1; page <= 45; page++) {
    const { start, end } = pageWindow(4430, String(page));
    for (let i = start; i < end; i++) {
      assert.equal(ids.has(i), false);
      ids.add(i);
    }
  }
  assert.equal(ids.size, 4430);
  for (const page of [null, 'NaN', '-1', '2.4', 'Infinity']) assert.equal(pageWindow(4430, page).page, 1);
  assert.equal(pageWindow(4430, '999').page, 45);
  assert.deepEqual(pageWindow(0, '2'), { page: 1, pages: 1, start: 0, end: 0 });
});

test('network errors are distinguishable from an empty clinic list', async t => {
  const fetch = t.mock.method(global, 'fetch', async () => new Response('Not found', { status: 404 }));
  await assert.rejects(loadClinics(), /request failed/);
  fetch.mock.mockImplementation(async () => new Response('{}', { status: 200 }));
  await assert.rejects(loadClinics(), /Invalid clinic data/);
  fetch.mock.mockImplementation(async () => new Response('[]', { status: 200 }));
  assert.deepEqual(await loadClinics(), []);
});

test('payment stays disabled until a valid HTTPS Stripe payment link is configured', () => {
  for (const url of [undefined, '', 'javascript:alert(1)', 'http://buy.stripe.com/example', 'https://buy.stripe.com.evil.test/example', 'https://user:pass@buy.stripe.com/example', 'https://buy.stripe.com/']) {
    assert.equal(paymentLinkFromConfig(url), null);
  }
  assert.equal(paymentLinkFromConfig('https://buy.stripe.com/test_example'), 'https://buy.stripe.com/test_example');
});
