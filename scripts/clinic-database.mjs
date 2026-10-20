import { DatabaseSync } from 'node:sqlite';
import { gzipSync } from 'node:zlib';
import { mkdir, rename, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { clinicPrefecture } from '../data/prefectures.mjs';
import { hasWebsiteReview, matchesAccess } from '../src/lib/clinic-access.ts';
import { uninsuredStatus } from '../src/lib/clinic-utils.ts';
import { normalizeSearchText, weekendStatus } from '../src/lib/search-state.ts';

export const DEPARTMENT_IDS = ['internal', 'surgery', 'pediatrics', 'orthopedics', 'dermatology', 'ophthalmology', 'ent', 'obgyn', 'psychiatry', 'urology'];
export const LANGUAGE_IDS = ['ja', 'en', 'zh', 'ko', 'es'];
const mask = (values, predicate) => values.reduce((result, value, index) => result | (predicate(value) ? 1 << index : 0), 0);

function checkedEnglishDay(record) {
  if (record.accessInfo?.englishSupportToday !== true || record.verification?.status !== 'verified'
    || !['phone', 'manual_visit'].includes(record.verification.confirmedBy)) return null;
  const checked = record.verification.lastConfirmedAt;
  if (typeof checked !== 'string' || !Number.isFinite(Date.parse(checked))) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(checked)) return new Date(checked).toISOString().startsWith(checked) ? checked : null;
  if (!/(?:Z|[+-]\d{2}:\d{2})$/.test(checked)) return null;
  return new Date(checked).toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
}

export async function prepareClinicDatabase(records, file) {
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp`;
  await rm(temporary, { force: true });
  const db = new DatabaseSync(temporary);
  const digest = createHash('sha256');
  try {
    db.exec(`PRAGMA journal_mode=OFF; PRAGMA synchronous=OFF;
      CREATE TABLE clinics (
        ordinal INTEGER PRIMARY KEY, id TEXT NOT NULL UNIQUE, prefecture TEXT NOT NULL,
        latitude REAL NOT NULL, longitude REAL NOT NULL, keywords TEXT NOT NULL,
        departments INTEGER NOT NULL, languages INTEGER NOT NULL, english_day TEXT,
        card INTEGER NOT NULL, insurance INTEGER NOT NULL, walk_any INTEGER NOT NULL,
        walk_departments INTEGER NOT NULL, walk_languages INTEGER NOT NULL,
        night_weekend INTEGER NOT NULL, reviewed INTEGER NOT NULL, verified INTEGER NOT NULL,
        selfpay INTEGER NOT NULL, schedule TEXT
      );
      CREATE TABLE clinic_details (ordinal INTEGER PRIMARY KEY REFERENCES clinics(ordinal), record BLOB NOT NULL);
      CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      BEGIN;`);
    const insert = db.prepare('INSERT INTO clinics VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
    const insertDetail = db.prepare('INSERT INTO clinic_details VALUES (?,?)');
    for (const [index, record] of records.entries()) {
      const raw = JSON.stringify(record);
      digest.update(raw);
      const selfpay = uninsuredStatus(record);
      const schedule = record.openingHours || record.closedDays || record.careGuide?.receptionHours
        ? JSON.stringify({ openingHours: record.openingHours, closedDays: record.closedDays,
          careGuide: record.careGuide && { receptionHours: record.careGuide.receptionHours, scheduleNeedsConfirmation: record.careGuide.scheduleNeedsConfirmation } }) : null;
      insert.run(index + 1, record.id, clinicPrefecture(record), record.latitude, record.longitude,
        [...new Set([...Object.values(record.name), ...Object.values(record.address)].map(normalizeSearchText))].join(' '),
        mask(DEPARTMENT_IDS, id => record.departments.includes(id)),
        mask(LANGUAGE_IDS, id => record.supportedLanguages.includes(id)),
        checkedEnglishDay(record),
        Number(matchesAccess(record, 'creditCardAccepted')), Number(matchesAccess(record, 'overseasInsuranceAccepted')),
        Number(matchesAccess(record, 'walkInAvailable')),
        mask(DEPARTMENT_IDS, id => matchesAccess(record, 'walkInAvailable', id)),
        mask(LANGUAGE_IDS, id => matchesAccess(record, 'walkInAvailable', null, id)),
        Number(!!record.accessInfo?.nightOpen || weekendStatus(record) === true),
        Number(hasWebsiteReview(record)), Number(record.verification?.status === 'verified'),
        selfpay === undefined ? -1 : Number(selfpay), schedule);
      insertDetail.run(index + 1, gzipSync(raw));
    }
    const summary = { version: digest.digest('hex').slice(0, 24), total: records.length,
      reviewed: records.filter(hasWebsiteReview).length,
      prefectures: Object.fromEntries(db.prepare('SELECT prefecture, count(*) AS total, sum(reviewed) AS reviewed FROM clinics GROUP BY prefecture').all()
        .map(row => [row.prefecture, { total: row.total, reviewed: row.reviewed }])) };
    db.prepare('INSERT INTO metadata VALUES (?,?)').run('summary', JSON.stringify(summary));
    db.exec('COMMIT; CREATE INDEX clinics_prefecture ON clinics(prefecture); ANALYZE;');
    const check = db.prepare('PRAGMA quick_check').get();
    if (Object.values(check)[0] !== 'ok') throw new Error('Clinic database integrity check failed');
    db.close();
    await rename(temporary, file);
    return summary;
  } catch (error) {
    try { db.close(); } catch { /* already closed */ }
    await rm(temporary, { force: true });
    throw error;
  }
}
