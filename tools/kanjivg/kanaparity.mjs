// Kana results with kanji reading off must not change when the kanji set
// grows. Runs the recognizer of an earlier commit (code + data, read with
// `git show`) and the current one on the same held-out kana samples in the
// three kana-only pads (hiragana, katakana, either kana) and compares every
// result: status, candidates (character and distance), size hint and the
// notes about the reading. The two fields that describe drawings outside the
// set (kanjiHint, kanjiLike and their notes) are compared separately: they
// are expected to change, since there are now many more kanji to name.
//
//   node tools/kanjivg/kanaparity.mjs [--rev ba6869d] [--n 2]
// Besides the held-out samples it compares the independent kana (AnimCJK,
// Tomoe) and nonsense drawings (dots, blobs, zigzags, scribbles, tangles).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { FAMILIES, distort, nonsense } from './synth.mjs';

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
const heldN = n, heldSame = same;
// independent kana and nonsense, in the same two pads
const fixturesDir = path.join(root, 'tests', 'fixtures', 'recog');
const extra = [];
for (const file of ['animcjk-kana.json', 'tomoe-ja.json']) {
  const fx = JSON.parse(fs.readFileSync(path.join(fixturesDir, file), 'utf8'));
  for (const c of fx.chars) {
    if (I.scriptOf(c.ch) === 'kanji') continue;
    extra.push({ label: file + ' ' + c.ch, strokes: c.strokes.map((st) => st.map(([x, y]) => ({ x, y }))), box: { w: fx.box, h: fx.box }, pads: [{ script: I.scriptOf(c.ch) === 'hira' ? 'hira' : 'kata' }, { script: 'any' }] });
  }
}
for (const kind of ['dot', 'blob', 'zigzag', 'scribble', 'tangle']) for (let i = 0; i < 40; i++) extra.push({ label: kind + i, strokes: nonsense(kind, 5000 + i), box: { w: 300, h: 300 }, pads: [{ script: 'hira' }, { script: 'kata' }, { script: 'any' }] });
let en = 0, esame = 0, eout = 0;
const ediff = [];
for (const x of extra) for (const pad of x.pads) {
  const opts = { box: x.box, ...pad };
  const ro = OLD.recognize(x.strokes, opts), rn = NEW.recognize(x.strokes, opts);
  en++;
  if (core(ro) === core(rn)) esame++; else if (ediff.length < 10) ediff.push(x.label + ' ' + pad.script);
  if (outside(ro) === outside(rn)) eout++;
}

const med = (a) => { const b = a.slice().sort((x, y) => x - y); return b[b.length >> 1].toFixed(1); };
console.log(`kana-only pads, ${REV} vs working tree: ${kana.length} kana x ${fams.length} held-out families x ${N} samples x 2 pads (its script's, and either kana) = ${heldN} results (${Math.round((Date.now() - t0) / 1000)} s)`);
console.log(`  identical status, candidates (character + distance), size hint and reading notes: ${heldSame}/${heldN}`);
if (diffs.length) console.log('  DIFFERENCES:\n   ' + diffs.join('\n   '));
console.log(`  kanji hint / kanji-like unchanged: ${outSame}/${outN}`);
for (const [k, v] of Object.entries(outDiffs).sort((a, b) => b[1] - a[1])) console.log(`    ${v}x  ${k}`);
console.log(`  independent kana (AnimCJK, Tomoe) and 200 nonsense drawings, ${en} results: identical ${esame}/${en}; kanji hint / kanji-like unchanged ${eout}/${en}${ediff.length ? '; DIFFERENCES: ' + ediff.join(', ') : ''}`);
console.log(`  median time per call (held-out): ${REV} ${med(tOld)} ms, now ${med(tNew)} ms`);
process.exit(heldSame === heldN && esame === en ? 0 : 1);
