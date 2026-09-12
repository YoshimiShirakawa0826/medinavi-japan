import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import path from "node:path";
import { clinicAccessReviews } from '../data/clinic-access-reviews.mjs';
import { applyAccessReviews } from './apply-access-reviews.mjs';

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
const reviewedClinics = applyAccessReviews(clinics, clinicAccessReviews);
await writeFile(outputPath, JSON.stringify(reviewedClinics, null, 2) + '\n');
console.log(`Prepared ${clinics.length} clinics with ${phoneCount} phone numbers and ${clinicAccessReviews.length} field-level website reviews.`);
