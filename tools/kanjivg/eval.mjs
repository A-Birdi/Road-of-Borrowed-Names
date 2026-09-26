// Full evaluation report for RB.recog (numbers quoted in docs/RECOGNITION.md).
//   node tools/kanjivg/eval.mjs                 held-out synthetic families + independent fixtures
//   node tools/kanjivg/eval.mjs --n 20          samples per character per family (default 10)
//   node tools/kanjivg/eval.mjs --family dev    only the tuning family
//   node tools/kanjivg/eval.mjs --kanji         include the optional kanji set
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from '../../tests/lib/load.mjs';
import { FAMILIES, distort, nonsense } from './synth.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const N = +arg('--n', 10);
const onlyFam = arg('--family', null);
const withKanji = args.includes('--kanji');

const RB = load(['core', 'recog']);
const R = RB.recog;
const I = R._internal;
const scriptOf = I.scriptOf;

// Shape equivalence used for "shape-correct": the character itself, its
// small/large partner, and members of a shape-identical group.
function equivalents(ch) {
  const s = new Set([ch]);
  const lg = I.LARGE_OF[ch] || ch;
  s.add(lg);
  if (I.SMALL_OF[lg]) s.add(I.SMALL_OF[lg]);
  for (const g of I.SAME_SHAPE) if (g.includes(ch)) g.forEach((c) => s.add(c));
  return s;
}
const padMode = (ch) => (scriptOf(ch) === 'kanji' ? 'kanji' : scriptOf(ch) === 'both' ? 'kata' : scriptOf(ch));

function newStats() { return { n: 0, top1: 0, top1exact: 0, top3: 0, conf: 0, confRight: 0, unc: 0, rej: 0, conf1: {} }; }
function tally(st, ch, res, anyMode) {
  st.n++;
  const eq = anyMode ? equivalents(ch) : new Set([ch, I.LARGE_OF[ch] || ch, I.SMALL_OF[ch] || ch]);
  const c = res.candidates.map((x) => x.ch);
  const ok1 = c.length && eq.has(c[0]);
  if (ok1) st.top1++;
  if (c[0] === ch) st.top1exact++;
  if (c.slice(0, 3).some((x) => eq.has(x))) st.top3++;
  if (res.status === 'confident') { st.conf++; if (ok1) st.confRight++; }
  if (res.status === 'uncertain') st.unc++;
  if (res.status === 'nonsense') st.rej++;
  if (!ok1) { const k = ch + '→' + (c[0] || '∅'); st.conf1[k] = (st.conf1[k] || 0) + 1; }
}
const pct = (a, b) => (b ? ((100 * a) / b).toFixed(1) + '%' : '-');
function line(name, st) {
  return `${name.padEnd(22)} n=${String(st.n).padStart(5)}  top1 ${pct(st.top1, st.n).padStart(6)}  top3 ${pct(st.top3, st.n).padStart(6)}  exact-size top1 ${pct(st.top1exact, st.n).padStart(6)}  confident ${pct(st.conf, st.n).padStart(6)} (precision ${pct(st.confRight, st.conf)})  uncertain ${pct(st.unc, st.n).padStart(6)}  rejected ${pct(st.rej, st.n).padStart(5)}`;
}
function worst(st, k = 12) {
  return Object.entries(st.conf1).sort((a, b) => b[1] - a[1]).slice(0, k).map(([p, c]) => `${p}×${c}`).join('  ');
}

const times = [];
function run(strokes, opts) {
  const t0 = performance.now();
  const r = R.recognize(strokes, opts);
  times.push(performance.now() - t0);
  return r;
}

const kana = R.supported({ kanji: false });
const kanji = R.supported({ kanji: true }).filter((c) => scriptOf(c) === 'kanji');
const groups = { hiragana: kana.filter((c) => scriptOf(c) === 'hira'), katakana: kana.filter((c) => scriptOf(c) !== 'hira') };
if (withKanji) groups.kanji = kanji;

console.log(`RB.recog evaluation — ${kana.length} kana${withKanji ? ` + ${kanji.length} kanji` : ''}, ${N} samples/char/family`);
console.log('top1 = best candidate is the character or its size partner (つ/っ); "any" mode also accepts shape-identical pairs (へ/ヘ).');
console.log('exact-size = top-1 is exactly the drawn character, size decided from box-relative size/position (no toggle).\n');

const fams = Object.keys(FAMILIES).filter((f) => (onlyFam ? f === onlyFam : f !== 'dev'));
const overall = { pad: newStats(), any: newStats() };
const perGroupAll = {};
for (const fam of fams) {
  const fs1 = newStats();
  for (const [gname, chars] of Object.entries(groups)) {
    const stPad = newStats(), stAny = newStats();
    for (const ch of chars) {
      const ref = R.reference(ch);
      for (let i = 0; i < N; i++) {
        const s = distort(ref, fam, `${ch}|${i}`, { ch });
        const r1 = run(s.strokes, { box: s.box, script: padMode(ch) });
        tally(stPad, ch, r1, false); tally(fs1, ch, r1, false); tally(overall.pad, ch, r1, false);
        const pg = (perGroupAll[gname] = perGroupAll[gname] || { pad: newStats(), any: newStats() });
        tally(pg.pad, ch, r1, false);
        if (gname !== 'kanji') {
          const r2 = run(s.strokes, { box: s.box, script: 'any', kanji: false });
          tally(stAny, ch, r2, true); tally(overall.any, ch, r2, true); tally(pg.any, ch, r2, true);
        }
      }
    }
    console.log(line(`${fam}/${gname} pad`, stPad));
    if (gname !== 'kanji') console.log(line(`${fam}/${gname} any`, stAny));
  }
  console.log(`  worst confusions: ${worst(fs1)}\n`);
}
if (fams.length > 1) {
  console.log('== all held-out families');
  for (const [g, s] of Object.entries(perGroupAll)) {
    console.log(line(`${g} pad-mode`, s.pad));
    if (g !== 'kanji') console.log(line(`${g} any-mode`, s.any));
  }
  console.log(line('ALL pad-mode', overall.pad));
  console.log(line('ALL any-mode', overall.any));
  console.log(`  worst confusions (pad): ${worst(overall.pad, 20)}\n`);
}

// Independent sources (not KanjiVG), used unmodified except for pointer-style densification.
function densify(stroke, step) {
  const out = [stroke[0]];
  for (let i = 1; i < stroke.length; i++) {
    const [ax, ay] = stroke[i - 1], [bx, by] = stroke[i];
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / step));
    for (let k = 1; k <= n; k++) out.push([ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n]);
  }
  return out;
}
for (const file of ['animcjk-kana.json', 'tomoe-ja.json']) {
  const p = path.join(root, 'tests', 'fixtures', 'recog', file);
  if (!fs.existsSync(p)) { console.log(`${file}: not present (run tools/kanjivg/fixtures.mjs)`); continue; }
  const fx = JSON.parse(fs.readFileSync(p, 'utf8'));
  const st = { pad: newStats(), any: newStats(), kanji: newStats() };
  for (const c of fx.chars) {
    const strokes = c.strokes.map((s) => densify(s, fx.box / 100).map(([x, y], k) => ({ x, y, t: k * 10 })));
    const box = { w: fx.box, h: fx.box };
    if (scriptOf(c.ch) === 'kanji') {
      tally(st.kanji, c.ch, run(strokes, { box, script: 'kanji' }), false);
      continue;
    }
    tally(st.pad, c.ch, run(strokes, { box, script: padMode(c.ch) }), false);
    tally(st.any, c.ch, run(strokes, { box, script: 'any' }), true);
  }
  console.log(`== ${file}: ${fx.source}`);
  console.log(line('kana pad-mode', st.pad));
  console.log(line('kana any-mode', st.any));
  if (st.kanji.n) console.log(line('kanji (script:kanji)', st.kanji));
  console.log(`  errors (pad): ${worst(st.pad, 40)}`);
  if (st.kanji.n) console.log(`  errors (kanji): ${worst(st.kanji, 20)}`);
  console.log('');
}

// Nonsense and empty input.
{
  const kinds = ['dot', 'blob', 'zigzag', 'scribble', 'tangle'];
  const out = [];
  for (const k of kinds) {
    let rej = 0, unc = 0, n = 0;
    for (let i = 0; i < 100; i++) {
      const r = run(nonsense(k, i), { box: { w: 300, h: 300 }, script: 'any' });
      n++;
      if (r.status === 'nonsense') rej++;
      else if (r.status === 'uncertain') unc++;
    }
    out.push(`${k}: rejected ${rej}/${n}, uncertain ${unc}/${n}, confident ${n - rej - unc}/${n}`);
  }
  console.log('== nonsense (script any, box 300)');
  out.forEach((l) => console.log('  ' + l));
  const e1 = R.recognize([], {}).status, e2 = R.recognize([[]], {}).status, e3 = R.recognize(null, {}).status;
  console.log(`  empty input: [] -> ${e1}, [[]] -> ${e2}, null -> ${e3}\n`);
}

times.sort((a, b) => a - b);
const q = (f) => times[Math.min(times.length - 1, Math.floor(f * times.length))].toFixed(2);
console.log(`timing over ${times.length} recognize() calls: mean ${(times.reduce((a, b) => a + b, 0) / times.length).toFixed(2)} ms, median ${q(0.5)} ms, p95 ${q(0.95)} ms, max ${q(1)} ms (node ${process.version})`);
