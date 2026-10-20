import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { prepareClinicDatabase } from '../scripts/clinic-database.mjs';
import { openClinicDatabase, InvalidSearch, DatasetChanged } from '../src/lib/clinic-database.ts';
import { fetchNearestPage } from '../src/lib/clinic-search-client.ts';

const make = (id, changes = {}) => ({ id, name: { ja: `病院${id}`, en: `Clinic ${id}` }, address: { ja: '東京都千代田区', en: 'Chiyoda Tokyo' },
  latitude: 35, longitude: 139, departments: ['internal'], supportedLanguages: [], phone: '',
  verification: { status: 'unverified' }, accessInfo: {}, isOpenNow: null, ...changes });
const record = make('clinic-13212345', { name: { ja: 'Ｔｏｋｙｏ医院', en: 'Tokyo Clinic' }, supportedLanguages: ['ja', 'en'],
  departments: ['internal','dermatology'], careGuide: { uninsuredAccepted: true },
  openingHours: { tue: [{ start: '09:00', end: '17:00' }] },
  accessEvidence: {
    creditCardAccepted: { status: 'yes', notes: { ja: '出典あり' }, sources: [] },
    overseasInsuranceAccepted: { status: 'yes', billing: 'pay_first' },
    walkInAvailable: { status: 'conditional', departments: [{ name: '内科', status: 'no' }, { name: '皮膚科', status: 'yes' }],
      languageReservations: [{ name: '英語', reservation: '要予約', note: '' }] },
  },
});

test('indexed pages preserve evidence-based filters and the full detail record without bulk expansion', async t => {
  const directory = await mkdtemp(path.join(tmpdir(), 'medinavi-db-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, 'clinics.sqlite');
  const list = [record,
    make('clinic-27212345', { address: { ja: '大阪府大阪市' }, supportedLanguages: ['ja'], departments: ['pediatrics'], walkInAllowed: true }),
    ...Array.from({length:23}, (_, index) => make(`clinic-132${30000+index}`)),
  ];
  const summary = await prepareClinicDatabase(list, file);
  const db = openClinicDatabase(file); t.after(() => db.close());
  const now = Date.parse('2026-10-20T01:00:00Z');
  const search = query => db.search(new URLSearchParams(query), now);
  assert.equal(search('').total,25);
  assert.equal(search('').items.length,20);
  const last = search('page=999');
  assert.equal(last.page,2); assert.equal(last.items.length,5);
  assert.equal(new Set([...search('').items, ...last.items].map(item=>item.id)).size,25);
  assert.deepEqual(db.detail(record.id), record);
  assert.equal(db.detail('clinic-132NOTREAL01'), null);
  assert.equal(search('prefecture=27').total,1);
  assert.equal(search('q=ｔｏｋｙｏ%20医院').total,1);
  assert.equal(search('q=%27%20OR%201%3D1--').total,0);
  assert.equal(search('card=true').total,1);
  assert.equal(search('insurance=true').total,0);
  assert.equal(search('walkin=true&dept=internal').total,0);
  assert.equal(search('walkin=true&dept=dermatology&lang=ja').total,1);
  assert.equal(search('walkin=true&dept=dermatology&lang=en').total,0);
  assert.equal(search('selfpay=true').total,1);
  assert.equal(search('selfpay=true&uninsuredUnknown=true').total,25);
  assert.equal(search('lang=en').total,1);
  assert.equal(search('open=true').total,1);
  assert.equal(search('view=locations').locations.length,25);
  assert.equal(search(`view=cards&version=${summary.version}&ids=2,1`).items[1].id,record.id);
  for (const query of ['prefecture=../13','lang=unknown','dept=unknown','view=unknown','lat=35','q='+ 'a'.repeat(121),
    `view=cards&version=${summary.version}&ids=1,1`, `view=cards&version=${summary.version}&ids=1)%20OR%201=1`,
    `view=cards&version=${summary.version}&ids=${Array.from({length:21},(_,i)=>i+1).join(',')}`]) {
    assert.throws(()=>search(query), InvalidSearch);
  }
  assert.throws(()=>search('view=cards&version=stale&ids=1'), DatasetChanged);
});

test('nearest sorting and radius filtering stay on the device and request at most one page of cards', async t => {
  const origin={lat:35.1234567,lng:139.7654321};
  const calls=[];
  t.mock.method(globalThis,'fetch',async url=>{
    calls.push(String(url));const p=new URL(url,'https://example.test').searchParams;
    if(p.get('view')==='locations')return Response.json({version:'near-test',total:3,scopeCount:3,reviewedCount:0,
      locations:[[1,35.124,139.766],[2,43,141],[3,0,0]]});
    assert.equal(p.get('ids'),'1');
    return Response.json({version:'near-test',items:[make('clinic-13212345')]});
  });
  const page=await fetchNearestPage('prefecture=13&q=near-test&location=device&lat=35.1234567',origin,3);
  assert.equal(page.total,1);assert.equal(page.items.length,1);
  for(const url of calls){assert.ok(!url.includes(String(origin.lat)));assert.ok(!url.includes(String(origin.lng)));assert.ok(!url.includes('location='));}
  const controller=new AbortController();controller.abort();
  await assert.rejects(fetchNearestPage('q=aborted',origin,3,controller.signal),{name:'AbortError'});
});

test('a dataset change refreshes nearest identifiers instead of displaying a different facility', async t=>{
  let loads=0;
  t.mock.method(globalThis,'fetch',async url=>{
    const p=new URL(url,'https://example.test').searchParams;
    if(p.get('view')==='locations'){
      loads++;
      return Response.json({version:loads===1?'old':'new',total:1,scopeCount:1,reviewedCount:0,locations:[[loads,35,139]]});
    }
    if(p.get('version')==='old')return new Response('',{status:409});
    assert.equal(p.get('ids'),'2');
    return Response.json({version:'new',items:[make('clinic-132NEW001')]});
  });
  const page=await fetchNearestPage('q=version-change',{lat:35,lng:139},null);
  assert.equal(loads,2);assert.equal(page.version,'new');assert.equal(page.items[0].id,'clinic-132NEW001');
});
