import { test } from 'node:test';
import assert from 'node:assert/strict';
import { telephoneHref, nabiiClinicUrl } from '../src/lib/clinic-contact.ts';

test('call links handle full-width digits and parentheses while preserving the leading zero', () => {
  assert.equal(telephoneHref('(０３)６２５６－８９８１'), 'tel:0362568981');
  assert.equal(telephoneHref('0120-101-713'), 'tel:0120101713');
  assert.equal(telephoneHref('090 1234 5678'), 'tel:09012345678');
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
