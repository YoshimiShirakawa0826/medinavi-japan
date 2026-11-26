import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { createHash } from 'node:crypto';
import path from "node:path";
import { clinicAccessReviews } from '../data/clinic-access-reviews.mjs';
import { additionalAccessReviews } from '../data/clinic-access-reviews-20260913.mjs';
import { applyAccessReviews } from './apply-access-reviews.mjs';
import { nabiiAccessReviews } from './nabii-access-reviews.mjs';
import { applyCareGuidance } from '../data/clinic-care-guidance.mjs';

const projectRoot = process.cwd();
const sourceDirectory = path.join(projectRoot, "data");
const outputPath = path.join(projectRoot, "public", "data", "clinics.json");

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
// Compact JSON avoids shipping indentation for thousands of records.
await writeFile(outputPath, JSON.stringify(applyCareGuidance(reviewedClinics)) + '\n');
console.log(`Prepared ${clinics.length} clinics with ${phoneCount} phone numbers; ${governmentReviews.length} Nabii reviews and ${websiteReviews.length} clinic website reviews.`);

// A compact index for server-rendered clinic pages (title, description, summary
// shown before the full data set loads). Generated, not committed.
const indexPath = path.join(projectRoot, 'src', 'generated', 'clinic-index.json');
await mkdir(path.dirname(indexPath), { recursive: true });
const clinicIndex = Object.fromEntries(clinics.map(clinic => [clinic.id, {
  ja: clinic.name?.ja || '', en: clinic.name?.en || '', address: clinic.address?.ja || '',
  phone: clinic.phone || '', departments: Array.isArray(clinic.departments) ? clinic.departments : [],
}]));
await writeFile(indexPath, JSON.stringify(clinicIndex) + '\n');

// Compact records for the chat assistant's clinic search tool (server only).
const searchPath = path.join(projectRoot, 'src', 'generated', 'clinic-search.json');
const finalClinics = JSON.parse(await readFile(outputPath, 'utf8'));
await writeFile(searchPath, JSON.stringify(finalClinics.map(clinic => ({
  id: clinic.id, name: { ja: clinic.name?.ja || '', en: clinic.name?.en || '' },
  address: clinic.address?.ja || '', phone: clinic.phone || '',
  latitude: clinic.latitude, longitude: clinic.longitude,
  departments: clinic.departments || [], supportedLanguages: clinic.supportedLanguages || [],
  openingHours: clinic.openingHours, closedDays: clinic.closedDays,
  careGuide: clinic.careGuide ? { scheduleNeedsConfirmation: clinic.careGuide.scheduleNeedsConfirmation, receptionHours: clinic.careGuide.receptionHours } : undefined,
}))) + '\n');
