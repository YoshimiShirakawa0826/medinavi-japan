import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import path from "node:path";
import { clinicAccessReviews } from '../data/clinic-access-reviews.mjs';
import { additionalAccessReviews } from '../data/clinic-access-reviews-20260913.mjs';
import { applyAccessReviews } from './apply-access-reviews.mjs';
import { nabiiAccessReviews } from './nabii-access-reviews.mjs';

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
const reports = JSON.parse(gunzipSync(Buffer.concat(await Promise.all(reportParts.map(name => readFile(path.join(sourceDirectory, name)))))));
const governmentReviews = nabiiAccessReviews(clinics, reports);
// Editorial clinic guidance overrides a government field only when explicitly reviewed.
const websiteReviews = [...clinicAccessReviews, ...additionalAccessReviews];
const reviewedClinics = applyAccessReviews(applyAccessReviews(clinics, governmentReviews), websiteReviews);
// Compact JSON avoids shipping indentation for thousands of records.
await writeFile(outputPath, JSON.stringify(reviewedClinics) + '\n');
console.log(`Prepared ${clinics.length} clinics with ${phoneCount} phone numbers; ${governmentReviews.length} Nabii reviews and ${websiteReviews.length} clinic website reviews.`);
