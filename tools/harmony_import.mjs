// Imports a batch of painted Harmony art into the game's native format (docs/harmony/contract/CONTRACT.md §9).
//   node tools/harmony_import.mjs <inDir> [--set <name>] [--out <dir>] [--report <dir>] [--check] [--replace]
//                                 [--suggest] [--registry <registry.json>] [--force]
//   node tools/harmony_import.mjs --verify <dir>
// <inDir>: the delivered PNGs (any enlargement), optional <name>.mask.png files and an optional import.json.
// Default output: assets/harmony/ (normalised 192 × 160 PNGs, masks, manifest.json, report/). --check validates
// and prints the summary without writing anything. Exit status 1 on any error (missing keys are reported only).
// No dependencies: a PNG codec on node:zlib (tools/harmony/png.mjs).
import path from 'node:path';
import { importSet, verifySet } from './harmony/importer.mjs';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const flag = (k) => args.includes(k);
const usage = 'usage: node tools/harmony_import.mjs <inDir> [--set <name>] [--out <dir>] [--report <dir>] [--check] [--replace] [--suggest] [--registry <file>] [--force]\n       node tools/harmony_import.mjs --verify <dir>';

if (flag('--verify')) {
  const dir = opt('--verify');
  if (!dir) { console.error(usage); process.exit(2); }
  const r = verifySet(path.resolve(dir));
  console.log(JSON.stringify(r, null, 1));
  process.exit(r.ok ? 0 : 1);
}
const valued = new Set(['--set', '--out', '--report', '--registry']);
const inDir = args.find((a, i) => !a.startsWith('--') && !valued.has(args[i - 1]));
if (!inDir) { console.error(usage); process.exit(2); }
const res = importSet(path.resolve(inDir), {
  set: opt('--set'), out: opt('--out') ? path.resolve(opt('--out')) : null, reportDir: opt('--report') ? path.resolve(opt('--report')) : null,
  check: flag('--check'), replace: flag('--replace'), suggest: flag('--suggest'), registry: opt('--registry'), force: flag('--force'),
});
const R = res.report;
for (const [n, f] of Object.entries(R.files)) {
  const tag = f.errors.length ? 'ERROR' : f.warnings.length ? 'warn ' : 'ok   ';
  console.log(tag, n.padEnd(30), (f.srcW ? f.srcW + '×' + f.srcH : '').padEnd(10), f.grid ? 'cell ' + f.grid.cell.join('×') : '', f.maskSource || '', f.suggestion && f.suggestion.offset ? 'suggest ' + f.suggestion.offset.join(',') + ' (iou ' + f.suggestion.iou + ' vs ' + f.suggestion.reference + ')' : '');
  for (const e of f.errors) console.log('      error:', e);
  for (const w of f.warnings) console.log('      warn: ', w);
}
for (const e of R.errors) console.log('set error:', e);
for (const w of R.warnings) console.log('set warn: ', w);
for (const [c, s] of Object.entries(R.companions || {})) console.log('companion', c, s.mode, s.states.join(' '), s.complete ? 'complete' : 'missing ' + s.missingRequired.join(' '));
if (R.coverage && !R.coverage.unresolved) console.log('registry coverage:', R.coverage.present + '/' + R.coverage.required, 'required keys present;', R.coverage.missingRequired.length, 'missing');
console.log(JSON.stringify(R.summary), R.ok ? 'OK' : 'FAILED', flag('--check') ? '(check only: nothing written)' : '→ ' + R.out);
process.exit(R.ok ? 0 : 1);
