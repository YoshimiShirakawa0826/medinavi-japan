import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bookingSummary, matchesPurpose } from '../src/lib/clinic-access.ts';

const clinic = { accessEvidence: { walkInAvailable: { status: 'conditional', departments: [{name:'内科',status:'no'},{name:'皮膚科',status:'yes'},{name:'美容皮膚科',status:'yes'}], languageReservations:[{name:'英語',reservation:'要予約'}] } } };
test('booking summary prioritizes a language booking requirement over walk-in listings', () => {
  assert.equal(bookingSummary(clinic,'dermatology','en'),'languageBooking');
  assert.equal(bookingSummary(clinic,'dermatology','ja'),'walkListed');
  assert.equal(bookingSummary(clinic,'internal','ja'),'bookingNeeded');
  assert.equal(bookingSummary(clinic,'ent','ja'),'specialtyUnknown');
});
test('missing and conflicting evidence never imply walk-in availability', () => {
  assert.equal(bookingSummary({}),'confirm');
  assert.equal(bookingSummary({accessEvidence:{walkInAvailable:{status:'information',departments:[{name:'皮膚科',status:'yes'}]}}},'dermatology'),'confirm');
  assert.equal(bookingSummary({accessEvidence:{walkInAvailable:{status:'no'}}}),'bookingNeeded');
});
test('purpose filters distinguish cosmetic and general departments, preserve unknowns when unfiltered', () => {
  const cosmetic = {accessEvidence:{walkInAvailable:{departments:[{name:'美容皮膚科',status:'yes'}]}}};
  assert.equal(matchesPurpose(cosmetic,'general'),false);
  assert.equal(matchesPurpose(cosmetic,'cosmetic'),true);
  assert.equal(matchesPurpose(clinic,'general'),true);
  assert.equal(matchesPurpose(clinic,'cosmetic'),true);
  assert.equal(matchesPurpose({},'general'),false);
  assert.equal(matchesPurpose({},'cosmetic'),false);
  assert.equal(matchesPurpose({},null),true);
});
