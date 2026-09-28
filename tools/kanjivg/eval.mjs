// Full evaluation report for RB.recog (numbers quoted in docs/RECOGNITION.md).
//   node tools/kanjivg/eval.mjs                 held-out synthetic families + independent fixtures
//   node tools/kanjivg/eval.mjs --n 20          samples per character per family (default 10)
//   node tools/kanjivg/eval.mjs --family dev    only the tuning family
//   node tools/kanjivg/eval.mjs --kanji         include the optional kanji set
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from '../../tests/lib/load.mjs';
import { FAMILIES, distort, nonsense, UNKNOWN_KANJI, composeKanji } from './synth.mjs';

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
const overall = { pad: newStats(), any: newStats() }; // kana only
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
        tally(stPad, ch, r1, false); tally(fs1, ch, r1, false);
        if (gname !== 'kanji') tally(overall.pad, ch, r1, false);
        const pg = (perGroupAll[gname] = perGroupAll[gname] || { pad: newStats(), any: newStats() });
        tally(pg.pad, ch, r1, false);
        // kana: 'any' pad (hiragana+katakana); kanji: 'any' with kanji enabled (kana+kanji)
        const r2 = run(s.strokes, { box: s.box, script: 'any', kanji: gname === 'kanji' });
        tally(stAny, ch, r2, true); tally(pg.any, ch, r2, true);
        if (gname !== 'kanji') tally(overall.any, ch, r2, true);
      }
    }
    console.log(line(`${fam}/${gname} pad`, stPad));
    console.log(line(`${fam}/${gname} any${gname === 'kanji' ? '+kanji' : ''}`, stAny));
  }
  console.log(`  worst confusions: ${worst(fs1)}\n`);
}
if (fams.length > 1) {
  console.log('== all held-out families');
  for (const [g, s] of Object.entries(perGroupAll)) {
    console.log(line(`${g} pad-mode`, s.pad));
    console.log(line(`${g} any${g === 'kanji' ? '+kanji' : ''}-mode`, s.any));
  }
  console.log(line('ALL kana pad-mode', overall.pad));
  console.log(line('ALL kana any-mode', overall.any));
  console.log(`  worst confusions (pad): ${worst(overall.pad, 20)}\n`);
}

// The kana + kanji pad ("Kanji or kana", script 'any' + kanji): kana accuracy
// against the kana pad on the same samples, the kana/kanji confusable sets, the
// kanji hint with kanji reading off, and kanji the recognizer does not know
// (composed from real KanjiVG component strokes).
if (withKanji && fams.length > 1) {
  const MIX = { script: 'any', kanji: true };
  const sizeEq = (ch, got) => got === ch || I.LARGE_OF[ch] === got || I.SMALL_OF[ch] === got || I.LARGE_OF[got] === ch;
  const top = (r) => (r.candidates[0] ? r.candidates[0].ch : null);
  let n = 0, anyShape = 0, mixShape = 0, anyStrict = 0, mixStrict = 0, changed = 0, kanjiFirst = 0, like = 0, hint = 0, confA = 0, confM = 0;
  for (const fam of fams) for (const ch of kana) for (let i = 0; i < N; i++) {
    const s = distort(R.reference(ch), fam, `${ch}|${i}`, { ch });
    const a = run(s.strokes, { box: s.box, script: 'any' }), m = run(s.strokes, { box: s.box, ...MIX });
    n++;
    if (top(a) && equivalents(ch).has(top(a))) anyShape++;
    if (top(m) && equivalents(ch).has(top(m))) mixShape++;
    if (top(a) && sizeEq(ch, top(a))) anyStrict++;
    if (top(m) && sizeEq(ch, top(m))) mixStrict++;
    if (top(a) !== top(m)) changed++;
    if (top(m) && scriptOf(top(m)) === 'kanji') kanjiFirst++;
    if (a.status === 'confident') confA++;
    if (m.status === 'confident') confM++;
    if (a.kanjiLike || m.kanjiLike) like++;
    if (a.kanjiHint) hint++;
  }
  console.log('== kana + kanji pad ("Kanji or kana"), all held-out families');
  console.log(`  kana (n=${n}): top-1 ${pct(anyStrict, n)} kana pad / ${pct(mixStrict, n)} kana+kanji pad (shape-equivalent ${pct(anyShape, n)} / ${pct(mixShape, n)}); ` +
    `confident ${pct(confA, n)} / ${pct(confM, n)}; first reading changed ${changed}×, a kanji first ${kanjiFirst}×; kanji-like ${like}×, kanji hint ${hint}×`);
  const kanjiSet = kanji;
  let kn = 0, k1 = 0, kx = 0, kc = 0, kcOk = 0, hn = 0, h1 = 0, hWrong = 0;
  for (const fam of fams) for (const ch of kanjiSet) for (let i = 0; i < N; i++) {
    const s = distort(R.reference(ch), fam, `${ch}|${i}`, { ch });
    const m = run(s.strokes, { box: s.box, ...MIX });
    const ok = top(m) && (top(m) === ch || (I.TWIN_OF[ch] && I.TWIN_OF[ch].includes(top(m))));
    kn++; if (ok) k1++; if (top(m) === ch) kx++;
    if (m.status === 'confident') { kc++; if (ok) kcOk++; }
    if (!I.TWIN_OF[ch]) {
      const a = run(s.strokes, { box: s.box, script: 'any' });
      hn++;
      if (a.kanjiHint) { if (a.kanjiHint.ch === ch) h1++; else hWrong++; }
    }
  }
  console.log(`  kanji (n=${kn}): top-1 ${pct(k1, kn)} (a twin counts as its kana: exact ${pct(kx, kn)}), confident ${pct(kc, kn)} (precision ${pct(kcOk, kc)})`);
  console.log(`  kanji drawn with kanji reading off (n=${hn}, twins excluded): the hint names it ${pct(h1, hn)}, another kanji ${hWrong}×`);
  const SETS = ['口ロ', '二ニ', '力カ', '一ー', '入人', '十ナメ', 'エハタ', '三ミ', '川ルリり', '小ハ', '土エ上', '王エキ', '手キチ', '木ホ本',
    '大ナ', '下トテ', '日目ヨ', '田ロ', '中ロ', '心ルい', '水ホ', '火ソメ', '人入ヘ', '花イヒ', '名タ', '山出', '二こに', 'ソリ川', 'ノ人'];
  let pn = 0, pok = 0;
  const perr = {};
  for (const set of SETS) for (const ch of new Set(set)) for (const fam of ['heldout-affine', 'heldout-noise', 'heldout-truncext']) for (let i = 0; i < N; i++) {
    const s = distort(R.reference(ch), fam, `pair|${ch}|${i}`, { ch });
    const m = run(s.strokes, { box: s.box, ...MIX });
    pn++;
    if (top(m) && (equivalents(ch).has(top(m)))) pok++; else { const k = ch + '→' + (top(m) || '∅'); perr[k] = (perr[k] || 0) + 1; }
  }
  console.log(`  kana/kanji confusable sets (${SETS.length}, direction-preserving families): ${pct(pok, pn)} of ${pn}; errors: ${Object.entries(perr).map(([k, v]) => k + '×' + v).join(' ') || 'none'}`);
  const unk = Object.entries(UNKNOWN_KANJI);
  let un = 0, lk = 0, lm = 0, hu = 0, cm = 0;
  const cmList = {};
  for (const fam of fams) for (const [ch, parts] of unk) for (let i = 0; i < N; i++) {
    const s = distort(composeKanji(R.reference, parts), fam, `unk|${ch}|${i}`, {});
    const a = run(s.strokes, { box: s.box, script: 'any' }), m = run(s.strokes, { box: s.box, ...MIX });
    un++;
    if (a.kanjiLike) lk++;
    if (m.kanjiLike) lm++;
    if (a.kanjiHint) hu++;
    if (m.status === 'confident') { cm++; const k = ch + '→' + top(m); cmList[k] = (cmList[k] || 0) + 1; }
  }
  console.log(`  kanji it does not know (${unk.length}, composed from KanjiVG components; n=${un}): kanji-like ${pct(lk, un)} kana pad / ${pct(lm, un)} kana+kanji pad; ` +
    `named by the hint ${hu}×; read 'confident' as a supported kanji ${cm}× (${Object.entries(cmList).map(([k, v]) => k + '×' + v).join(' ') || 'none'})\n`);
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
  const st = { pad: newStats(), any: newStats(), kanji: newStats(), mixKana: newStats(), mixKanji: newStats() };
  let fxHint = 0, fxHintN = 0;
  for (const c of fx.chars) {
    const strokes = c.strokes.map((s) => densify(s, fx.box / 100).map(([x, y], k) => ({ x, y, t: k * 10 })));
    const box = { w: fx.box, h: fx.box };
    if (scriptOf(c.ch) === 'kanji') {
      tally(st.kanji, c.ch, run(strokes, { box, script: 'kanji' }), false);
      if (withKanji) {
        tally(st.mixKanji, c.ch, run(strokes, { box, script: 'any', kanji: true }), true);
        if (!I.TWIN_OF[c.ch]) { fxHintN++; const h = run(strokes, { box, script: 'any' }).kanjiHint; if (h && h.ch === c.ch) fxHint++; }
      }
      continue;
    }
    tally(st.pad, c.ch, run(strokes, { box, script: padMode(c.ch) }), false);
    tally(st.any, c.ch, run(strokes, { box, script: 'any' }), true);
    if (withKanji) tally(st.mixKana, c.ch, run(strokes, { box, script: 'any', kanji: true }), true);
  }
  console.log(`== ${file}: ${fx.source}`);
  console.log(line('kana pad-mode', st.pad));
  console.log(line('kana any-mode', st.any));
  if (st.kanji.n) console.log(line('kanji (script:kanji)', st.kanji));
  if (st.mixKana.n) console.log(line('kana kana+kanji pad', st.mixKana));
  if (st.mixKanji.n) console.log(line('kanji kana+kanji pad', st.mixKanji) + `\n  kanji in the kana pad: the hint names it ${fxHint}/${fxHintN} (twins excluded)`);
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
