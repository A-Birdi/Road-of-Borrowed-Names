// Kana results with kanji reading off must not change when the kanji set
// grows. Runs the recognizer of an earlier commit (code + data, read with
// `git show`) and the current one on the same held-out kana samples in the
// three kana-only pads (hiragana, katakana, either kana) and compares every
// result: status, candidates (character and distance), size hint and the
// notes about the reading. The two fields that describe drawings outside the
// set (kanjiHint, kanjiLike and their notes) are compared separately: they
// are expected to change, since there are now many more kanji to name.
//
//   node tools/kanjivg/kanaparity.mjs [--rev ba6869d] [--n 2] [--fixtures]
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { FAMILIES, distort } from './synth.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const REV = arg('--rev', 'ba6869d');
const N = +arg('--n', 2);

function loadRecog(sources) {
  const ctx = { console, setTimeout, clearTimeout, performance };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  for (const [name, code] of sources) vm.runInContext(code, ctx, { filename: name });
  return ctx.RB.recog;
}
const FILES = ['src/core/00_ns.js', 'src/recog/10_strokedata.js', 'src/recog/20_recognizer.js'];
const git = (rev, f) => execFileSync('git', ['show', `${rev}:${f}`], { cwd: root, encoding: 'utf8', maxBuffer: 64 << 20 });
const OLD = loadRecog(FILES.map((f) => [REV + ':' + f, git(REV, f)]));
const NEW = loadRecog(FILES.map((f) => [f, fs.readFileSync(path.join(root, f), 'utf8')]));

const I = NEW._internal;
const kana = NEW.supported({ kanji: false });
const outsideNote = (n) => /^kanji-(hint|like)/.test(n);
const core = (r) => JSON.stringify({ status: r.status, candidates: r.candidates, sizeHint: r.sizeHint, notes: r.notes.filter((n) => !outsideNote(n)) });
const outside = (r) => JSON.stringify({ hint: r.kanjiHint && r.kanjiHint.ch, like: r.kanjiLike });

const fams = Object.keys(FAMILIES).filter((f) => f.startsWith('heldout-'));
let n = 0, same = 0, outN = 0, outSame = 0;
const diffs = [], outDiffs = {};
const tOld = [], tNew = [];
const t0 = Date.now();
for (const fam of fams) for (const ch of kana) for (let i = 0; i < N; i++) {
  const s = distort(NEW.reference(ch), fam, `${ch}|${i}`, { ch });
  const pads = [{ script: I.scriptOf(ch) === 'hira' ? 'hira' : 'kata' }, { script: 'any' }];
  for (const pad of pads) {
    const opts = { box: s.box, ...pad };
    let a = performance.now();
    const ro = OLD.recognize(s.strokes, opts);
    tOld.push(performance.now() - a);
    a = performance.now();
    const rn = NEW.recognize(s.strokes, opts);
    tNew.push(performance.now() - a);
    n++;
    if (core(ro) === core(rn)) same++; else if (diffs.length < 20) diffs.push(`${fam} ${ch}#${i} ${pad.script}: ${core(ro)} -> ${core(rn)}`);
    outN++;
    if (outside(ro) === outside(rn)) outSame++;
    else { const k = `${outside(ro)} -> ${outside(rn)}`; outDiffs[k] = (outDiffs[k] || 0) + 1; }
  }
}
const med = (a) => { const b = a.slice().sort((x, y) => x - y); return b[b.length >> 1].toFixed(1); };
console.log(`kana-only pads, ${REV} vs working tree: ${kana.length} kana x ${fams.length} held-out families x ${N} samples x 2 pads = ${n} results (${Math.round((Date.now() - t0) / 1000)} s)`);
console.log(`  identical status, candidates (character + distance), size hint and reading notes: ${same}/${n}`);
if (diffs.length) console.log('  DIFFERENCES:\n   ' + diffs.join('\n   '));
console.log(`  kanji hint / kanji-like unchanged: ${outSame}/${outN}`);
for (const [k, v] of Object.entries(outDiffs).sort((a, b) => b[1] - a[1])) console.log(`    ${v}x  ${k}`);
console.log(`  median time per call: ${REV} ${med(tOld)} ms, now ${med(tNew)} ms`);
process.exit(same === n ? 0 : 1);
