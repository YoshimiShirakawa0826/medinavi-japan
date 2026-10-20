import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gunzipSync } from 'node:zlib';
import { searchResponse } from '../src/lib/search-response.ts';

test('large public coordinate responses are compressed without changing data or caching private queries', async () => {
  const data = {locations:Array.from({length:5000},(_,i)=>[i,35.12345,139.12345])};
  const response=searchResponse(data,new Request('https://example.test/api/clinics/search',{headers:{'Accept-Encoding':'gzip, deflate, br'}}));
  assert.equal(response.headers.get('Content-Encoding'),'gzip');
  assert.equal(response.headers.get('Cache-Control'),'private, no-store');
  assert.equal(response.headers.get('Vary'),'Accept-Encoding');
  const bytes=Buffer.from(await response.arrayBuffer());
  assert.deepEqual(JSON.parse(gunzipSync(bytes)),data);
  assert.ok(bytes.length < JSON.stringify(data).length / 2);
});

test('gzip refusal is honored and small result pages need no compression work', async () => {
  const large={locations:Array.from({length:5000},(_,i)=>[i,35,139])};
  const refused=searchResponse(large,new Request('https://example.test',{headers:{'Accept-Encoding':'gzip;q=0, *;q=1'}}));
  assert.equal(refused.headers.get('Content-Encoding'),null);
  assert.deepEqual(await refused.json(),large);
  const small=searchResponse({items:[]},new Request('https://example.test',{headers:{'Accept-Encoding':'gzip'}}));
  assert.equal(small.headers.get('Content-Encoding'),null);
  assert.deepEqual(await small.json(),{items:[]});
});
