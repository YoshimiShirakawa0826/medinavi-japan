// Build the stable 4,420-clinic review queue without reading regenerated output.
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import path from 'node:path';
import { clinicAccessReviews } from '../data/clinic-access-reviews.mjs';
import { applyAccessReviews } from './apply-access-reviews.mjs';

const output = process.argv[2];
if (!output) throw new Error('Usage: node scripts/prepare-access-base.mjs <cache/base-clinics.json>');
const parts = (await readdir('data')).filter(n => /^clinics\.json\.gz\.part\d+$/.test(n)).sort();
if (!parts.length) throw new Error('Base archive missing');
const clinics = JSON.parse(gunzipSync(Buffer.concat(await Promise.all(parts.map(n => readFile(path.join('data', n)))))));
if (clinics.length !== 4430 || clinics.filter(c => c.phone).length !== 4316) throw new Error('Unexpected base archive');
const baseline = applyAccessReviews(clinics, clinicAccessReviews);
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(baseline) + '\n');
console.log(`Prepared baseline; ${baseline.filter(c => !c.accessEvidence).length} clinics await Nabii review.`);
