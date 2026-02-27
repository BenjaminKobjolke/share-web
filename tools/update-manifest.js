import { readdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const notesDir = join(__dirname, '..', 'public', 'release_notes');

const versionPattern = /^\d+\.\d+\.\d+$/;

const versions = readdirSync(notesDir, { withFileTypes: true })
  .filter(d => d.isDirectory() && versionPattern.test(d.name))
  .map(d => d.name)
  .sort((a, b) => {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      if (pa[i] !== pb[i]) return pb[i] - pa[i];
    }
    return 0;
  });

const manifest = { versions };
writeFileSync(join(notesDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('Manifest updated:', versions.join(', '));
