// Pushes the Gemini keys from local .dev.vars to Cloudflare Pages as the
// encrypted runtime secret GEMINI_API_KEYS. Run after `npx wrangler login`.
//
//   npm run secrets:push
//
// Requires: the Pages project (default name "novelryt") to exist — i.e. the repo
// must already be connected in the Cloudflare dashboard (GETTING_STARTED Step 1).
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const PROJECT = process.env.CF_PAGES_PROJECT || 'novelryt';

let raw;
try {
  raw = readFileSync(new URL('../.dev.vars', import.meta.url), 'utf8');
} catch {
  console.error('Could not read .dev.vars. Create it with GEMINI_API_KEYS=...');
  process.exit(1);
}

const match = raw.match(/^\s*GEMINI_API_KEYS\s*=\s*(.+)\s*$/m);
if (!match) {
  console.error('GEMINI_API_KEYS not found in .dev.vars');
  process.exit(1);
}
const value = match[1].trim();
const keyCount = value.split(',').filter(Boolean).length;
console.log(`Pushing GEMINI_API_KEYS (${keyCount} keys) to Pages project "${PROJECT}"…`);

const res = spawnSync(
  'npx',
  ['wrangler', 'pages', 'secret', 'put', 'GEMINI_API_KEYS', '--project-name', PROJECT],
  { input: value, stdio: ['pipe', 'inherit', 'inherit'], shell: true },
);
process.exit(res.status ?? 1);
