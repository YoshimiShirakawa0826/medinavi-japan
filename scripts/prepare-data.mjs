import { mkdir, readFile, writeFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import path from "node:path";

const projectRoot = process.cwd();
const sourcePath = path.join(projectRoot, "data", "clinics.json.gz");
const outputPath = path.join(projectRoot, "public", "data", "clinics.json");

const compressed = await readFile(sourcePath);
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
await writeFile(outputPath, json);
console.log(`Prepared ${clinics.length} clinics with ${phoneCount} phone numbers.`);
