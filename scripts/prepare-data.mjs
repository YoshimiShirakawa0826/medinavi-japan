import { mkdir, readFile, readdir, writeFile, rm } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { createHash } from 'node:crypto';
import path from "node:path";
import { clinicAccessReviews } from '../data/clinic-access-reviews.mjs';
import { additionalAccessReviews } from '../data/clinic-access-reviews-20260913.mjs';
import { applyAccessReviews } from './apply-access-reviews.mjs';
import { nabiiAccessReviews } from './nabii-access-reviews.mjs';
import { applyCareGuidance } from '../data/clinic-care-guidance.mjs';
import { clinicPrefecture, coverageFor, PREFECTURES } from '../data/prefectures.mjs';
import { prepareClinicDatabase } from './clinic-database.mjs';
import { setupCache } from './setup-cache.mjs';
import { applyLanguageReviews, applyWebsiteHolds } from './apply-language-reviews.mjs';

const projectRoot = process.cwd();
const sourceDirectory = path.join(projectRoot, "data");
const outputPath = path.join(projectRoot, "public", "data", "clinics.json");

const cache = await setupCache(projectRoot);
if (await cache.valid()) {
  console.log('Reusing verified clinic database and coverage (inputs and output hashes unchanged).');
  process.exit(0);
}

const partNames = (await readdir(sourceDirectory))
  .filter((name) => /^clinics\.json\.gz\.part\d+$/.test(name))
  .sort();

if (partNames.length === 0) {
  throw new Error("Clinic data archive parts were not found.");
}

const parts = await Promise.all(
  partNames.map((name) => readFile(path.join(sourceDirectory, name))),
);
const compressed = Buffer.concat(parts);
const json = gunzipSync(compressed);
const clinics = JSON.parse(json.toString("utf8"));

if (!Array.isArray(clinics) || clinics.length !== 4430) {
  throw new Error(`Expected 4430 clinics, received ${clinics.length}`);
}

const phoneCount = clinics.filter((clinic) => clinic.phone).length;
if (phoneCount !== 4316) {
  throw new Error(`Expected 4316 phone numbers, received ${phoneCount}`);
}

await mkdir(path.dirname(outputPath), { recursive: true });
const reportParts = (await readdir(sourceDirectory)).filter(name => /^nabii-access\.json\.gz\.part\d+$/.test(name)).sort();
if (!reportParts.length) throw new Error('Nabii access report archive was not found');
const manifest = JSON.parse(await readFile(path.join(sourceDirectory, 'nabii-access-manifest.json'), 'utf8'));
const reportJson = gunzipSync(Buffer.concat(await Promise.all(reportParts.map(name => readFile(path.join(sourceDirectory, name))))));
const reports = JSON.parse(reportJson);
if (manifest.schemaVersion !== 1 || manifest.reportCount !== reports.length
  || JSON.stringify(manifest.parts) !== JSON.stringify(reportParts)
  || createHash('sha256').update(reportJson).digest('hex') !== manifest.jsonSha256) {
  throw new Error('Nabii archive does not match its reviewed manifest');
}
const governmentReviews = nabiiAccessReviews(clinics, reports);
// Editorial clinic guidance overrides a government field only when explicitly reviewed.
const websiteReviews = [...clinicAccessReviews, ...additionalAccessReviews];
const reviewedClinics = applyAccessReviews(applyAccessReviews(clinics, governmentReviews), websiteReviews);
// National bulk data is reviewed separately from the original Tokyo evidence.
const nationalManifest = JSON.parse(await readFile(path.join(sourceDirectory, 'national-clinics-manifest.json'), 'utf8'));
const nationalParts = (await readdir(sourceDirectory)).filter(name => /^national-clinics\.json\.gz\.part\d+$/.test(name)).sort();
const nationalJson = gunzipSync(Buffer.concat(await Promise.all(nationalParts.map(name => readFile(path.join(sourceDirectory, name))))));
const national = JSON.parse(nationalJson);
if (nationalManifest.schemaVersion !== 1 || national.length !== nationalManifest.recordCount
  || JSON.stringify(nationalManifest.parts) !== JSON.stringify(nationalParts)
  || createHash('sha256').update(nationalJson).digest('hex') !== nationalManifest.jsonSha256
  || new Set(national.map(clinic => clinic.id)).size !== national.length
  || national.some(clinic => !/^clinic-\d{2}[12][A-Za-z0-9]{2,17}$/.test(clinic.id) || !clinic.name?.ja || !clinic.address?.ja
    || clinicPrefecture(clinic) !== clinic.prefectureCode)) {
  throw new Error('National archive does not match its reviewed manifest or facility identity');
}
// Keep all original phone/access/care evidence; never merge it into a different
// facility merely because a name or address resembles the older record.
const existing = applyCareGuidance(reviewedClinics);
const originalIds = new Set(existing.map(clinic => clinic.id));
const languageReviews = JSON.parse(await readFile(path.join(sourceDirectory, 'clinic-language-reviews.json'), 'utf8'));
const websiteHolds = JSON.parse(await readFile(path.join(sourceDirectory, 'clinic-website-holds.json'), 'utf8'));
const combined = applyWebsiteHolds(applyLanguageReviews([...existing, ...national.filter(clinic => !originalIds.has(clinic.id))], languageReviews), websiteHolds);
const coverage = coverageFor(combined);
if (Object.values(coverage.prefectures).some(count => count === 0)) throw new Error('Missing prefecture in national data');
// All searches and details use indexed, read-only lookups. Only coverage is
// public static JSON; full records never become a bulk browser download.
const database = await prepareClinicDatabase(combined, path.join(sourceDirectory, 'generated', 'clinics.sqlite'));
await writeFile(path.join(path.dirname(outputPath), 'coverage.json'), JSON.stringify({ ...coverage,
  sourceAsOf: nationalManifest.sourceAsOf, retrievedAt: nationalManifest.retrievedAt, sourcePage: nationalManifest.sourcePage,
  preservedTokyoRecords: existing.length, nationalRecords: national.length,
  version: database.version,
}) + '\n');
// Remove only the obsolete files generated by earlier versions of this script.
await rm(outputPath, { force: true });
for (const prefecture of PREFECTURES) {
  await rm(path.join(path.dirname(outputPath), 'prefectures', `${prefecture.code}.json`), { force: true });
  await rm(path.join(sourceDirectory, 'generated', 'prefectures', `${prefecture.code}.json.gz`), { force: true });
}
await cache.save();
console.log(`Prepared ${combined.length} facilities across 47 prefectures; preserved ${existing.length} Tokyo records, ${phoneCount} phone numbers, ${governmentReviews.length} Nabii reviews and ${websiteReviews.length} website reviews.`);
