// RB.recog accuracy on data NOT used to build templates:
//  - held-out synthetic distortions (seed families never used for tuning),
//  - confusable pairs,
//  - independent stroke data from AnimCJK and Tomoe (tests/fixtures/recog),
//  - nonsense rejection and timing.
// Synthetic and font-derived data do not establish accuracy on real human
// handwriting; see docs/RECOGNITION.md. Full report: node tools/kanjivg/eval.mjs
import fs from 'node:fs';
import path from 'node:path';
import { load, root } from '../lib/load.mjs';
import { FAMILIES, distort, nonsense } from '../../tools/kanjivg/synth.mjs';

const RB = load(['core', 'recog']);
const R = RB.recog;
const I = R._internal;

const times = [];
function rec(strokes, opts) {
  const t0 = performance.now();
  const r = R.recognize(strokes, opts);
  times.push(performance.now() - t0);
  return r;
}
const padMode = (ch) => { const s = I.scriptOf(ch); return s === 'both' ? 'kata' : s; };
// top-1 counts if it is the character or its small/large partner (size tested separately)
const sizeEq = (ch, got) => got === ch || I.LARGE_OF[ch] === got || I.SMALL_OF[ch] === got || I.LARGE_OF[got] === ch;
// in the mixed-script 'any' pad, shape-identical pairs (へ/ヘ) are returned together and both count
const shapeEq = (ch, got) => sizeEq(ch, got) || I.SAME_SHAPE.some((g) => g.includes(ch) && g.includes(got));
const pct = (a, b) => ((100 * a) / b).toFixed(1) + '%';

export default async (t) => {
  // ---------------------------------------------------------------- held-out synthetic
  const fams = Object.keys(FAMILIES).filter((f) => f.startsWith('heldout-'));
  const kana = R.supported({ kanji: false });
  // kanji: a fixed sample of the game's ~1,550 (every 8th, ~194 characters) to
  // keep the unit run short; tools/kanjivg/eval.mjs --kanji measures all of them
  const allKanji = R.supported({ kanji: true }).filter((c) => I.scriptOf(c) === 'kanji');
  const groups = {
    hiragana: kana.filter((c) => I.scriptOf(c) === 'hira'),
    katakana: kana.filter((c) => I.scriptOf(c) !== 'hira'),
    kanji: allKanji.filter((_, i) => i % 8 === 0),
  };
  const SAMPLES = 3;
  const conf = {};
  for (const [g, chars] of Object.entries(groups)) {
    let n = 0, top1 = 0, top3 = 0, confident = 0, confRight = 0, rejected = 0, exact = 0;
    for (const fam of fams) for (const ch of chars) for (let i = 0; i < (g === 'kanji' ? 1 : SAMPLES); i++) {
      const s = distort(R.reference(ch), fam, `unit|${ch}|${i}`, { ch });
      const r = rec(s.strokes, { box: s.box, script: padMode(ch) });
      const c = r.candidates.map((x) => x.ch);
      n++;
      const ok = c.length && sizeEq(ch, c[0]);
      if (ok) top1++; else { const k = `${ch}→${c[0] || '∅'}`; conf[k] = (conf[k] || 0) + 1; }
      if (c[0] === ch) exact++;
      if (c.slice(0, 3).some((x) => sizeEq(ch, x))) top3++;
      if (r.status === 'confident') { confident++; if (ok) confRight++; }
      if (r.status === 'nonsense') rejected++;
    }
    t.log(`${g} held-out (${chars.length} characters x ${fams.length} families x ${g === 'kanji' ? 1 : SAMPLES}): top1 ${pct(top1, n)}, top3 ${pct(top3, n)}, exact-size ${pct(exact, n)}, confident ${pct(confident, n)} (precision ${pct(confRight, confident)}), falsely rejected ${pct(rejected, n)}, n=${n}`);
    t.ok(top1 / n >= 0.97, `${g}: held-out top-1 >= 97% (${pct(top1, n)})`);
    t.ok(top3 / n >= 0.99, `${g}: held-out top-3 >= 99% (${pct(top3, n)})`);
    t.ok(confRight / Math.max(1, confident) >= 0.99, `${g}: 'confident' is right >= 99% of the time`);
    t.ok(rejected / n <= 0.01, `${g}: real characters rejected as nonsense <= 1%`);
  }
  t.log('held-out confusions:', Object.entries(conf).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}×${v}`).join(' ') || 'none');

  // ---------------------------------------------------------------- confusable pairs
  // direction/placement-preserving distortions only (a reversed ソ stroke is ン)
  const SETS = ['シツ', 'ソン', 'ぬめ', 'ねれわ', 'さち', 'るろ', 'はほ', 'いり', 'こに', 'クケタ', 'ウワフ', 'ヌス', 'コユ', 'かが', 'はばぱ', 'ソリ', 'シミ', 'アマ', 'チテ', 'ラヲ', 'きさ', 'あお', 'けは', 'れね', 'ぬね', 'わね', 'すむ', 'ちら', 'ほま', 'ルレ', 'ヘハ', 'エユ', 'ナメ', 'セヒ', 'いこ'];
  let pn = 0, pok = 0;
  const pairBad = [];
  for (const set of SETS) {
    let n = 0, ok = 0;
    for (const ch of set) for (const fam of ['heldout-affine', 'heldout-noise', 'heldout-truncext']) for (let i = 0; i < 4; i++) {
      const s = distort(R.reference(ch), fam, `pair|${ch}|${i}`, { ch });
      const r = rec(s.strokes, { box: s.box, script: 'any' });
      n++;
      if (r.candidates[0] && shapeEq(ch, r.candidates[0].ch)) ok++;
      else pairBad.push(`${ch}→${r.candidates[0] ? r.candidates[0].ch : '∅'}`);
    }
    pn += n; pok += ok;
    t.ok(ok / n >= 0.9, `confusable set ${set}: ${ok}/${n} correct`);
  }
  t.log(`confusable sets (${SETS.length}): ${pct(pok, pn)} top-1 of ${pn}; errors: ${pairBad.join(' ') || 'none'}`);
  t.ok(pok / pn >= 0.97, 'confusable sets overall >= 97%');
  // つ/っ by size: the same shape large+centred vs small+low in the box
  let sz = 0, szn = 0;
  for (const [L, S] of [['つ', 'っ'], ['や', 'ゃ'], ['ゆ', 'ゅ'], ['よ', 'ょ'], ['ツ', 'ッ'], ['ヤ', 'ャ'], ['ユ', 'ュ'], ['ヨ', 'ョ'], ['あ', 'ぁ'], ['イ', 'ィ']]) {
    for (let i = 0; i < 4; i++) {
      const big = distort(R.reference(L), 'heldout-noise', `sz|${L}|${i}`, { ch: L, scale: 1.1 });
      const rb = rec(big.strokes, { box: big.box, script: padMode(L) });
      const sm = distort(R.reference(L), 'heldout-noise', `sz|${S}|${i}`, { ch: L, scale: 0.6 });
      // move the small drawing into the lower-left quarter of the box
      const smS = sm.strokes.map((st) => st.map((p) => ({ ...p, x: p.x * 0.9 - 10, y: p.y * 0.9 + 70 })));
      const rs = rec(smS, { box: sm.box, script: padMode(L) });
      szn += 2;
      if (rb.candidates[0] && rb.candidates[0].ch === L) sz++;
      if (rs.candidates[0] && rs.candidates[0].ch === S) sz++;
    }
  }
  t.log(`small vs large by box size/position (no toggle): ${sz}/${szn}`);
  t.ok(sz / szn >= 0.95, 'small/large decided from box-relative size >= 95%');

  // ---------------------------------------------------------------- independent sources
  const densify = (stroke, step) => {
    const out = [stroke[0]];
    for (let i = 1; i < stroke.length; i++) {
      const [ax, ay] = stroke[i - 1], [bx, by] = stroke[i];
      const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / step));
      for (let k = 1; k <= n; k++) out.push([ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n]);
    }
    return out;
  };
  const fixture = (name) => JSON.parse(fs.readFileSync(path.join(root, 'tests', 'fixtures', 'recog', name), 'utf8'));
  for (const [name, minKana, minKanji] of [['animcjk-kana.json', 0.95, null], ['tomoe-ja.json', 0.9, 0.95]]) {
    const fx = fixture(name);
    const st = { kana: [0, 0, 0], kanji: [0, 0, 0] };
    const errs = [];
    // Tomoe has ~1,550 of the game's kanji: every 5th here (all in eval.mjs)
    let ki = 0;
    for (const c of fx.chars) {
      if (I.scriptOf(c.ch) === 'kanji' && ki++ % 5 !== 0) continue;
      const strokes = c.strokes.map((s) => densify(s, fx.box / 100).map(([x, y], k) => ({ x, y, t: k * 10 })));
      const isK = I.scriptOf(c.ch) === 'kanji';
      const r = rec(strokes, { box: { w: fx.box, h: fx.box }, script: isK ? 'kanji' : padMode(c.ch) });
      const cs = r.candidates.map((x) => x.ch);
      const s = st[isK ? 'kanji' : 'kana'];
      s[0]++;
      if (cs[0] && shapeEq(c.ch, cs[0])) s[1]++; else errs.push(`${c.ch}→${cs[0] || '∅'}`);
      if (cs.slice(0, 3).some((x) => sizeEq(c.ch, x))) s[2]++;
    }
    t.log(`${name}: kana top1 ${st.kana[1]}/${st.kana[0]} (${pct(st.kana[1], st.kana[0])}), top3 ${pct(st.kana[2], st.kana[0])}` +
      (st.kanji[0] ? `; kanji top1 ${st.kanji[1]}/${st.kanji[0]}` : '') + `; errors: ${errs.join(' ') || 'none'}`);
    t.ok(st.kana[1] / st.kana[0] >= minKana, `${name}: kana top-1 >= ${minKana * 100}%`);
    if (minKanji) t.ok(st.kanji[1] / st.kanji[0] >= minKanji, `${name}: kanji top-1 >= ${minKanji * 100}%`);
  }

  // ---------------------------------------------------------------- nonsense rates
  for (const [kind, min] of [['dot', 1], ['blob', 1], ['zigzag', 1], ['scribble', 0.85], ['tangle', 0.85]]) {
    let rej = 0, confident = 0;
    const N = 60;
    for (let i = 0; i < N; i++) {
      const r = rec(nonsense(kind, 1000 + i), { box: { w: 300, h: 300 }, script: 'any' });
      if (r.status === 'nonsense') rej++;
      if (r.status === 'confident') confident++;
    }
    t.log(`nonsense ${kind}: rejected ${rej}/${N}, confident ${confident}/${N}`);
    t.ok(rej / N >= min, `${kind}: rejection rate >= ${min * 100}%`);
    t.eq(confident, 0, `${kind}: never 'confident'`);
  }

  // ---------------------------------------------------------------- timing
  times.sort((a, b) => a - b);
  const med = times[times.length >> 1], p95 = times[Math.floor(times.length * 0.95)];
  t.log(`timing: ${times.length} calls, median ${med.toFixed(2)} ms, p95 ${p95.toFixed(2)} ms, max ${times[times.length - 1].toFixed(2)} ms`);
  t.ok(med < 30, 'median recognize() time < 30 ms');
  t.ok(p95 < 60, 'p95 recognize() time < 60 ms');
};
