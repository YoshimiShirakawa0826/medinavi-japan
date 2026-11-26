import { test } from 'node:test';
import assert from 'node:assert/strict';
import { telephoneHref, internationalPhone, nabiiClinicUrl } from '../src/lib/clinic-contact.ts';

test('call links use +81 so foreign SIM and roaming phones can connect', () => {
  assert.equal(telephoneHref('(０３)６２５６－８９８１'), 'tel:+81362568981');
  assert.equal(telephoneHref('03-6457-7600'), 'tel:+81364577600');
  assert.equal(telephoneHref('090 1234 5678'), 'tel:+819012345678');
});

test('toll-free numbers keep the domestic form because +81 cannot reach them', () => {
  assert.equal(telephoneHref('0120-101-713'), 'tel:0120101713');
  assert.equal(telephoneHref('0800-123-4567'), 'tel:08001234567');
  assert.equal(internationalPhone('0120-101-713'), null);
});

test('international display keeps the published grouping', () => {
  assert.equal(internationalPhone('03-6457-7600'), '+81 3-6457-7600');
  assert.equal(internationalPhone('（０３）６２５６－８９８１'), '+81 3-6256-8981');
  assert.equal(internationalPhone('(03)6256-8981'), '+81 3-6256-8981');
  assert.equal(internationalPhone('0362568981'), '+81 362568981');
});

test('missing, ambiguous and non-phone values cannot become calls', () => {
  for (const phone of ['', null, undefined, 362568981, '03-1234-5678 / 03-2345-6789',
    'FAX:03-1234-5678', '03-1234-5678 ext 9', 'javascript:alert(1)', '1234567890', '119']) {
    assert.equal(telephoneHref(phone), null);
  }
});

test('Nabii links retain the exact prefecture, category and facility identifier', () => {
  const url = new URL(nabiiClinicUrl('clinic-1321310137216'));
  assert.equal(url.hostname, 'www.iryou.teikyouseido.mhlw.go.jp');
  assert.equal(url.searchParams.get('kikanCd'), '1310137216');
  assert.equal(url.searchParams.get('kikanKbn'), '2');
  assert.equal(url.searchParams.get('prefCd'), '13');
  assert.equal(nabiiClinicUrl('clinic-1322130154950').includes('kikanCd=2130154950'), true);
  for (const id of ['mock-1', 'clinic-1321310137216?x=1', 'clinic-132131013721']) {
    assert.equal(nabiiClinicUrl(id), null);
  }
});
