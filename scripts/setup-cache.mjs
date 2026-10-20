import { createReadStream } from 'node:fs';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

async function hashFiles(files, initial = '') {
  const hash = createHash('sha256').update(initial);
  for (const file of files) {
    hash.update(file);
    for await (const chunk of createReadStream(file)) hash.update(chunk);
  }
  return hash.digest('hex');
}

export async function setupCache(root) {
  const inputs = ['package-lock.json', 'src/types/index.ts', 'src/lib/clinic-utils.ts', 'src/lib/clinic-access.ts', 'src/lib/search-state.ts'];
  for (const directory of ['data', 'scripts']) {
    for (const item of await readdir(path.join(root, directory), { withFileTypes: true })) {
      if (item.isFile()) inputs.push(`${directory}/${item.name}`);
    }
  }
  const signature = await hashFiles(inputs.sort().map(file => path.join(root, file)), process.version);
  const database = path.join(root, 'data/generated/clinics.sqlite');
  const coverage = path.join(root, 'public/data/coverage.json');
  const marker = path.join(root, 'data/generated/setup-cache.json');
  return {
    async valid() {
      try {
        const saved = JSON.parse(await readFile(marker, 'utf8'));
        return saved.signature === signature && saved.outputs === await hashFiles([database, coverage]);
      } catch { return false; } // Missing/corrupt output is replaced from verified archives.
    },
    async save() {
      await writeFile(marker, JSON.stringify({ signature, outputs: await hashFiles([database, coverage]) }) + '\n');
    },
  };
}
