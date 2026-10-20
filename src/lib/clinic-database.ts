import { DatabaseSync } from 'node:sqlite';
import { gunzipSync } from 'node:zlib';
import type { SQLInputValue } from 'node:sqlite';
import type { Hospital } from '../types';
import { scheduledOpenStatus, pageWindow } from './clinic-utils.ts';
import { normalizeSearchText, RESULT_PAGE_SIZE } from './search-state.ts';
import { searchRecord } from '../../scripts/search-index.mjs';

const DEPARTMENTS = ['internal', 'surgery', 'pediatrics', 'orthopedics', 'dermatology', 'ophthalmology', 'ent', 'obgyn', 'psychiatry', 'urology'];
const LANGUAGES = ['ja', 'en', 'zh', 'ko', 'es'];
type Summary = { version: string; total: number; reviewed: number; prefectures: Record<string, { total: number; reviewed: number }> };
type RecordRow = { record: Uint8Array };

export class InvalidSearch extends Error {}
export class DatasetChanged extends Error {}

// One read-only connection; SQLite bounds its page cache to 4 MiB. No database
// file or clinic data is ever copied into an unbounded JavaScript cache.
export function openClinicDatabase(file: string) {
  const db = new DatabaseSync(file, { readOnly: true });
  db.exec('PRAGMA query_only=ON; PRAGMA trusted_schema=OFF; PRAGMA cache_size=-4096; PRAGMA mmap_size=0;');
  db.function('clinic_open', (schedule, epoch) => {
    if (typeof schedule !== 'string' || typeof epoch !== 'number') return 0;
    return Number(scheduledOpenStatus(JSON.parse(schedule), new Date(epoch)) === true);
  });
  const summary = JSON.parse((db.prepare("SELECT value FROM metadata WHERE key='summary'").get() as { value: string }).value) as Summary;
  const detailQuery = db.prepare('SELECT record FROM clinics JOIN clinic_details USING(ordinal) WHERE id=?');
  const unpack = (row: RecordRow): Hospital => JSON.parse(gunzipSync(row.record).toString('utf8'));

  function search(params: URLSearchParams, now = Date.now()) {
    if (params.toString().length > 4096) throw new InvalidSearch('Search too long');
    // Coordinates are intentionally unsupported: nearest sorting stays on the
    // device. Reject them instead of silently creating a coordinate API.
    for (const key of ['lat', 'lng', 'latitude', 'longitude']) if (params.has(key)) throw new InvalidSearch('Coordinates are not accepted');
    const view = params.get('view') || 'page';
    if (!['page', 'locations', 'cards'].includes(view)) throw new InvalidSearch('Invalid view');
    if (view === 'cards') {
      if (params.get('version') !== summary.version) throw new DatasetChanged('Dataset changed');
      const rawIds = (params.get('ids') || '').split(',');
      if (rawIds.length > RESULT_PAGE_SIZE || rawIds.some(id => !/^[1-9]\d{0,8}$/.test(id))) throw new InvalidSearch('Invalid record selection');
      const ids = rawIds.map(Number);
      if (new Set(ids).size !== ids.length) throw new InvalidSearch('Duplicate record selection');
      const rows = db.prepare(`SELECT ordinal, record FROM clinics JOIN clinic_details USING(ordinal) WHERE ordinal IN (${ids.map(() => '?').join(',')})`).all(...ids) as unknown as Array<RecordRow & { ordinal: number }>;
      const byId = new Map(rows.map(row => [row.ordinal, row]));
      return { version: summary.version, items: ids.flatMap(id => byId.has(id) ? [card(byId.get(id)!, now)] : []) };
    }
    const where: string[] = [];
    const values: SQLInputValue[] = [];
    const add = (sql: string, ...args: SQLInputValue[]) => { where.push(sql); values.push(...args); };
    const prefecture = params.get('prefecture') || '';
    if (prefecture) {
      if (!Object.hasOwn(summary.prefectures, prefecture)) throw new InvalidSearch('Invalid prefecture');
      add('prefecture=?', prefecture);
    }
    const keyword = params.get('q') || '';
    if (keyword.length > 120) throw new InvalidSearch('Keyword too long');
    for (const word of normalizeSearchText(keyword).split(' ').filter(Boolean)) add('instr(keywords,?)>0', word);
    const dept = params.get('dept');
    const lang = params.get('lang');
    const flag = (key: string) => params.get(key) === 'true';
    let deptBit = 0, langBit = 0;
    if (dept) {
      if (!DEPARTMENTS.includes(dept)) throw new InvalidSearch('Invalid department');
      deptBit = 1 << DEPARTMENTS.indexOf(dept); add('(departments & ?) != 0', deptBit);
    }
    if (lang) {
      if (!LANGUAGES.includes(lang)) throw new InvalidSearch('Invalid language');
      langBit = 1 << LANGUAGES.indexOf(lang); add('(languages & ?) != 0', langBit);
    }
    if (flag('engtoday')) add('(languages & ?) != 0 AND english_day=?', 1 << LANGUAGES.indexOf('en'),
      new Date(now).toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }));
    for (const [key, column] of [['card', 'card'], ['insurance', 'insurance'], ['nightweekend', 'night_weekend'], ['verified', 'verified'], ['reviewed', 'reviewed']]) {
      if (flag(key)) add(`${column}=1`);
    }
    if (flag('walkin')) {
      add('walk_any=1');
      if (deptBit) add('(walk_departments & ?) != 0', deptBit);
      if (langBit) add('(walk_languages & ?) != 0', langBit);
    }
    if (flag('selfpay')) add(flag('uninsuredUnknown') ? 'selfpay IN (1,-1)' : 'selfpay=1');
    if (flag('open')) add('schedule IS NOT NULL AND clinic_open(schedule,?)=1', now);
    const clause = where.length ? ` WHERE ${where.join(' AND ')}` : '';
    const scope = prefecture ? summary.prefectures[prefecture] : summary;
    const total = (db.prepare(`SELECT count(*) AS total FROM clinics${clause}`).get(...values) as { total: number }).total;
    const meta = { version: summary.version, total, scopeCount: scope.total, reviewedCount: scope.reviewed };
    if (view === 'locations') {
      const rows = db.prepare(`SELECT ordinal,latitude,longitude FROM clinics${clause} ORDER BY ordinal`).all(...values) as unknown as Array<{ ordinal: number; latitude: number; longitude: number }>;
      return { ...meta, locations: rows.map(row => [row.ordinal, row.latitude, row.longitude]) };
    }
    const pagination = pageWindow(total, params.get('page'), RESULT_PAGE_SIZE);
    const rows = db.prepare(`SELECT record FROM clinics JOIN clinic_details USING(ordinal)${clause} ORDER BY ordinal LIMIT ? OFFSET ?`).all(...values, RESULT_PAGE_SIZE, pagination.start) as unknown as RecordRow[];
    return { ...meta, ...pagination, items: rows.map(row => card(row, now)) };
  }
  function card(row: RecordRow, now: number) {
    const record = unpack(row);
    return { ...searchRecord(record), isOpenNow: scheduledOpenStatus(record, new Date(now)) } as Hospital;
  }
  return {
    summary,
    detail(id: string) { const row = detailQuery.get(id) as RecordRow | undefined; return row ? unpack(row) : null; },
    search,
    close() { db.close(); },
  };
}
