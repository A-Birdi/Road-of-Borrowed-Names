// Imports painted Harmony art into the game's native format (docs/harmony/contract/CONTRACT.md §9).
//   node tools/harmony_import.mjs <inDir> [<inDir> …] [--set <name>] [--out <dir>] [--report <dir>] [--check] [--replace]
//                                 [--suggest] [--registry <registry.json>] [--force]
//   node tools/harmony_import.mjs --verify <dir>
// <inDir>: the delivered PNGs (any enlargement), optional <name>.mask.png files, an optional import.json and, for a
// committed source batch (art/harmony/source/<batch>/), PROVENANCE.md. Several folders are imported in order, each
// merged over the ones before (the first replaces the output with --replace): regenerating assets/harmony/ from
// the committed sources is
//   node tools/harmony_import.mjs art/harmony/source/<batch> [art/harmony/source/<later batch> …] --replace
// and gives the same bytes every time (CONTRACT.md §9). Default output: assets/harmony/ (normalised 192 × 160 PNGs,
// masks, manifest.json, provenance/, report/). --check validates and prints the summary without writing anything.
// Exit status 1 on any error (missing keys are reported only). No dependencies: a PNG codec on node:zlib.
import path from 'node:path';
import { importSets, verifySet } from './harmony/importer.mjs';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const flag = (k) => args.includes(k);
const usage = 'usage: node tools/harmony_import.mjs <inDir> [<inDir> …] [--set <name>] [--out <dir>] [--report <dir>] [--check] [--replace] [--suggest] [--registry <file>] [--force]\n       node tools/harmony_import.mjs --verify <dir>';

if (flag('--verify')) {
  const dir = opt('--verify');
  if (!dir) { console.error(usage); process.exit(2); }
  const r = verifySet(path.resolve(dir));
  console.log(JSON.stringify(r, null, 1));
  process.exit(r.ok ? 0 : 1);
}
const valued = new Set(['--set', '--out', '--report', '--registry']);
const inDirs = args.filter((a, i) => !a.startsWith('--') && !valued.has(args[i - 1]));
if (!inDirs.length) { console.error(usage); process.exit(2); }
const all = importSets(inDirs.map((d) => path.resolve(d)), {
  set: opt('--set'), out: opt('--out') ? path.resolve(opt('--out')) : null, reportDir: opt('--report') ? path.resolve(opt('--report')) : null,
  check: flag('--check'), replace: flag('--replace'), suggest: flag('--suggest'), registry: opt('--registry'), force: flag('--force'),
});
for (const res of all.all) {
  const R = res.report;
  console.log('== batch', R.set, '(' + R.inDir + ')', 'approval ' + R.approval + (R.batch ? ', batch ' + R.batch : ''));
  for (const [n, f] of Object.entries(R.files)) {
    const tag = f.errors.length ? 'ERROR' : f.warnings.length ? 'warn ' : 'ok   ';
    const vals = f.values ? Object.entries(f.values).map(([m, k]) => m + ' ' + k).join(', ') : '';
    console.log(tag, n.padEnd(30), (f.srcW ? f.srcW + '×' + f.srcH : '').padEnd(10), f.grid ? 'cell ' + f.grid.cell.join('×') : '', f.maskSource || '', vals ? 'values: ' + vals : '', f.suggestion && f.suggestion.offset ? 'suggest ' + f.suggestion.offset.join(',') + ' (iou ' + f.suggestion.iou + ' vs ' + f.suggestion.reference + ')' : '');
    for (const e of f.errors) console.log('      error:', e);
    for (const w of f.warnings) console.log('      warn: ', w);
  }
  for (const e of R.errors) console.log('set error:', e);
  for (const w of R.warnings) console.log('set warn: ', w);
  console.log(JSON.stringify(R.summary), R.ok ? 'OK' : 'FAILED');
}
const R = all.report;
for (const [c, s] of Object.entries(R.companions || {})) console.log('companion', c, s.mode, s.states.join(' '), s.complete ? 'complete' : 'missing ' + s.missingRequired.join(' '));
if (R.coverage && !R.coverage.unresolved) console.log('registry coverage:', R.coverage.present + '/' + R.coverage.required, 'required keys present;', R.coverage.missingRequired.length, 'missing');
for (const [id, b] of Object.entries(R.batches || {})) console.log('batch', id, '(phase ' + b.phase + '):', b.present + '/' + b.required, 'required', b.complete ? '— complete' : '— missing ' + b.missingRequired.join(' '), b.optionalPresent.length ? '; optional ' + b.optionalPresent.join(' ') : '');
if (R.approvalNow) console.log('approval: kit ' + R.approvalNow.kit + '; ' + Object.entries(R.approvalNow.pairings).map(([c, a]) => c + ' ' + a).join(', '));
console.log(all.ok ? 'OK' : 'FAILED', flag('--check') ? '(check only: nothing written)' : '→ ' + R.out);
process.exit(all.ok ? 0 : 1);
