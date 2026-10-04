// The keyify step (docs/harmony/contract/CONTRACT.md §5.5): the player's Harmony kit painted in look A's REAL colours →
// key-family layers and masks, ready for tools/harmony_import.mjs.
//   node tools/harmony_keyify.mjs <inDir> <outDir> [--look=<look.json>] [--masks=<dir>] [--values=range|reference]
//                                 [--sample=<master.png> [--sample-mask=<mask.png>] [--sample-acc=<id>]] [--report] [--force]
// <inDir>: delivered files under contract names (any whole enlargement or the 1024 square, real transparency or a
// flat #ff00ff, as the importer reads them), an optional import.json (per-file cell/origin/offset/background are
// applied here) and PROVENANCE.md. Companion frames are copied unchanged. <outDir> gets a native 192 × 160 key layer
// and <name>.mask.png per kit file, import.json, PROVENANCE.md and keyify.json; then
//   node tools/harmony_import.mjs <outDir> …
// --look      the reference colours (default tools/harmony/lookA.json, the brief's look A)
// --masks     supplied masks (<name>.mask.png, mask colours of §5; any enlargement): they decide every pixel they cover
// --values    range (default): each material's painted lightness range → s0…s4, shaped by the reference ramp;
//             reference: the place on the reference ramp itself (s0 of the reference → s0)
// --sample    derive the reference ramps from a style master (and a rough mask); writes <outDir>/look.sampled.json
// --report    the validation (round trip with the game's own recolour, the importer on the result, the bust in ≥ 6
//             looks, the value floor; sheets) under <outDir>/keyify_report/
// --force     write files with unresolved pixels too (those pixels stay fixed)
// Exit status 1 on any error (unresolved pixels, a bad file, a fixed pixel in an anchor shade, a failed import with
// --report). Node built-ins only.
import fs from 'node:fs';
import path from 'node:path';
import { keyifyKit, writeKeyified, readLook, sampleLook, DEFAULT_LOOK } from './harmony/keyify.mjs';
import { loadRuntime, validate } from './harmony/keyify_report.mjs';

const args = process.argv.slice(2);
const valued = new Set(['--look', '--masks', '--values', '--sample', '--sample-mask', '--sample-acc']);
const opt = (k) => { for (let i = 0; i < args.length; i++) { if (args[i].startsWith(k + '=')) return args[i].slice(k.length + 1); if (args[i] === k) return args[i + 1]; } return null; };
const flag = (k) => args.includes(k);
const pos = args.filter((a, i) => !a.startsWith('--') && !valued.has(args[i - 1]));
const usage = 'usage: node tools/harmony_keyify.mjs <inDir> <outDir> [--look=<look.json>] [--masks=<dir>] [--values=range|reference] [--sample=<master.png> [--sample-mask=<mask.png>] [--sample-acc=<id>]] [--report] [--force]';
if (pos.length !== 2) { console.error(usage); process.exit(2); }
const [inDir, outDir] = pos.map((p) => path.resolve(p));
if (path.resolve(inDir) === path.resolve(outDir)) { console.error('the output folder must not be the input folder'); process.exit(2); }

const RB = loadRuntime();
let look = readLook(opt('--look') ? path.resolve(opt('--look')) : DEFAULT_LOOK);
if (opt('--sample')) {
  look = sampleLook(fs.readFileSync(path.resolve(opt('--sample'))), opt('--sample-mask') ? fs.readFileSync(path.resolve(opt('--sample-mask'))) : null, look, { RB, acc: opt('--sample-acc') });
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'look.sampled.json'), JSON.stringify(look, null, 1) + '\n');
  const S = look.sampled;
  console.log('sampled', S.pixels, 'pixels of the style master (' + S.master.w + '×' + S.master.h + ', native ' + S.master.native.join('×') + ')' + (S.mask ? ' with its mask' : ' without a mask') + ':', Object.entries(S.materials).map(([m, v]) => m + ' ' + v.pixels).join(', '), '; fixed colours', S.fixed, '; ignored', S.ignored, '→ look.sampled.json');
}
const res = keyifyKit(inDir, { look, RB, values: opt('--values') || 'range', masksDir: opt('--masks') ? path.resolve(opt('--masks')) : null });
let w;
try { w = writeKeyified(res, outDir, { force: flag('--force') }); } catch (e) { console.error(e.message); process.exit(2); }
const R = res.report;
console.log('== keyify', path.relative(process.cwd(), inDir) || '.', '→', path.relative(process.cwd(), outDir) || '.', '(look: ' + R.look + ', values: ' + R.values + ')');
for (const [n, f] of Object.entries(R.files)) {
  const tag = f.errors.length ? 'ERROR' : f.warnings.length ? 'warn ' : 'ok   ';
  const mats = f.materials ? Object.entries(f.materials).map(([m, k]) => m + ' ' + k).join(', ') : '';
  console.log(tag, n.padEnd(30), (f.mode || '').padEnd(9), (f.srcW ? f.srcW + '×' + f.srcH : '').padEnd(10), mats);
  for (const e of f.errors) console.log('      error:', e);
  for (const x of f.warnings) console.log('      warn: ', x);
}
for (const [k, v] of Object.entries(R.kit)) console.log('value map', k.padEnd(18), v.mode.padEnd(9), v.values + ' values → ' + v.keyValues + ' key colours', 'L ' + v.lightness.join('…'), 'ref t ' + v.tReference.join('…'), '→ t ' + v.t.join('…'), v.clamped.pixels ? 'clamped ' + v.clamped.pixels + ' px' : '', v.gamutClipped.pixels ? 'clipped ' + v.gamutClipped.pixels + ' px' : '');
for (const e of R.errors) console.log('error:', e);
for (const x of R.warnings) console.log('warn: ', x);
console.log('written', w.written.length, 'files' + (w.skipped.length ? '; NOT written (errors): ' + w.skipped.join(' ') : ''));
let ok = res.ok;
if (flag('--report')) {
  const v = await validate(res, path.join(outDir, 'keyify_report'), { RB, importDir: outDir });
  const V = v.out;
  for (const [k, s] of Object.entries(V.roundTrip.materials)) console.log('round trip', k.padEnd(18), 'n ' + s.n, 'ΔE mean ' + s.mean, 'p95 ' + s.p95, 'max ' + s.max, 'changed ' + s.changed, 'over JND ' + s.overJnd);
  if (V.import) console.log('import', V.import.ok ? 'OK' : 'FAILED', JSON.stringify(V.import.summary), 'verify', V.import.verify.ok ? 'OK' : 'FAILED');
  if (V.import && !V.import.ok) { ok = false; for (const e of V.import.errors) console.log('  import error:', e); }
  if (V.busts) console.log('busts', V.busts.looks.filter((l) => l.painted).length + '/' + V.busts.looks.length, 'painted', V.busts.gameLookVsInput ? '; game look vs input ΔE mean ' + V.busts.gameLookVsInput.mean + ' p95 ' + V.busts.gameLookVsInput.p95 + ' max ' + V.busts.gameLookVsInput.max : '');
  for (const [k, f] of Object.entries(V.floor)) console.log('value floor', k.padEnd(18), f.values + ' values on ' + f.targets + ' targets: min neighbour ΔE ' + f.minNeighbourDE + (f.worst ? ' (' + f.worst.target + ')' : ''), f.pairsUnderJndOnSomeTarget ? '; ' + f.pairsUnderJndOnSomeTarget + ' painted pairs under 0.02 somewhere' : '');
  console.log('report →', path.relative(process.cwd(), path.join(outDir, 'keyify_report')), V.sheets.join(' '));
}
console.log(ok ? 'OK' : 'FAILED');
process.exit(ok ? 0 : 1);
