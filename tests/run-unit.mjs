// Runs every tests/unit/*.test.mjs file. Each exports default async (t) => {...}
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'unit');
const only = process.argv[2];
let pass = 0, fail = 0;
const t = {
  ok(cond, msg) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg); } },
  eq(a, b, msg) { const ok = JSON.stringify(a) === JSON.stringify(b); if (ok) pass++; else { fail++; console.log('  FAIL:', msg, '\n    got', JSON.stringify(a), '\n    want', JSON.stringify(b)); } },
  log: (...a) => console.log('  ', ...a),
};
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.test.mjs')).sort()) {
  if (only && !f.includes(only)) continue;
  console.log('#', f);
  const before = fail;
  try { await (await import(pathToFileURL(path.join(dir, f)))).default(t); }
  catch (e) { fail++; console.log('  ERROR', e.stack); }
  if (fail === before) console.log('  ok');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
