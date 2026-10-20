import { rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
// Restored Next/Turbopack output served stale global CSS alongside new markup.
// Rebuild from source so Vercel publishes matching scripts and styles.
rmSync(new URL('../.next', import.meta.url), { recursive: true, force: true });
const result = spawnSync(process.execPath, [
  fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url)), 'build',
], { cwd: root, stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
