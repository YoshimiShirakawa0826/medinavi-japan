import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchesKeyword, searchRadius, updateSearch, safeSearchReturn, parseSearchLocation, weekendStatus, RESULT_PAGE_SIZE } from '../src/lib/search-state.ts';
import { pageWindow } from '../src/lib/clinic-utils.ts';

test('a radius requires an explicitly chosen origin, never a Shinjuku fallback', () => {
  for (const value of ['1', '3', '5', '10', 'near', null]) assert.equal(searchRadius(value, false), 'off');
  assert.equal(searchRadius('3', true), 3);
  assert.equal(searchRadius('near', true), null);
  assert.equal(searchRadius('garbage', true), 'off');
  assert.equal(searchRadius(null, true), 'off');
});

test('filter and area changes reset page and preserve unrelated filters', () => {
  assert.equal(updateSearch('dept=internal&page=42&dist=3', {area: 'Shibuya', dist: 'near'}), '/hospitals?dept=internal&dist=near&area=Shibuya');
  assert.equal(updateSearch('dist=1&page=4', {dist: null}), '/hospitals');
});

test('return links can only return to the hospital list', () => {
  for (const url of ['https://evil.test', '//evil.test', 'javascript:alert(1)', '/hospitals-evil', '/hospitals/../admin', '/hospitals?x=\nfoo', null]) {
    assert.equal(safeSearchReturn(url), '/hospitals');
  }
  assert.equal(safeSearchReturn('/hospitals?dept=internal&area=Shibuya&page=2'), '/hospitals?dept=internal&area=Shibuya&page=2');
});

test('keyword search handles full-width text, case, whitespace and all name/address languages', () => {
  const h = {name: {ja: 'Ｔｏｋｙｏ　Ｃｌｉｎｉｃ', en: 'Tokyo Clinic'}, address: {ja: '東京都千代田区', en: 'Chiyoda Tokyo'}};
  for (const query of ['', ' tokyo   CLINIC ', '千代田区', 'ｔｏｋｙｏ Chiyoda']) assert.equal(matchesKeyword(h, query), true);
  assert.equal(matchesKeyword(h, 'Osaka'), false);
});

test('stored coordinates expire, validate and remain out of return URLs', () => {
  const now = 2000000;
  assert.deepEqual(parseSearchLocation(JSON.stringify({lat: 35, lng: 139, savedAt: now}), now), {lat: 35, lng: 139});
  for (const data of [null, 'bad', '{}', '{"lat":35,"lng":139}', JSON.stringify({lat: 91, lng: 139, savedAt: now}), JSON.stringify({lat: 35, lng: 139, savedAt: 1}), JSON.stringify({lat: 35, lng: 139, savedAt: now + 1})]) assert.equal(parseSearchLocation(data, now), null);
});

test('unrecorded weekend hours are not labelled weekdays only', () => {
  assert.equal(weekendStatus({}), undefined);
  assert.equal(weekendStatus({closedDays: {sat: true}}), undefined);
  assert.equal(weekendStatus({closedDays: {sat: true, sun: true}}), false);
  assert.equal(weekendStatus({openingHours: {sat: [{start: '09:00', end: '12:00'}]}}), true);
  assert.equal(weekendStatus({openingHours: {sat: [{start: 'bad', end: '12:00'}]}}), undefined);
});

test('shorter mobile result pages still expose all 4430 records', () => {
  let count = 0;
  for (let page = 1; page <= Math.ceil(4430 / RESULT_PAGE_SIZE); page++) {
    const {start, end} = pageWindow(4430, String(page), RESULT_PAGE_SIZE);
    assert.equal(start, count);
    count = end;
  }
  assert.equal(count, 4430);
});
