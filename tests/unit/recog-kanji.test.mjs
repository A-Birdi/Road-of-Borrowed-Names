// RB.recog with the kana + kanji pad ("Kanji or kana"): the 33 supported kanji
// from real KanjiVG reference strokes (clean and held-out distortions), the
// kana/kanji confusable pairs, no regression of kana accuracy, the kana/kanji
// twins (ロ/口, ニ/二, カ/力, ー/一), the kanji hint with kanji reading off,
// the kanji-like detection for kanji outside the set, and independence from
// anything answer-like. Numbers are logged; docs/RECOGNITION.md quotes the
// full report (node tools/kanjivg/eval.mjs --kanji).
import { load } from '../lib/load.mjs';
import { FAMILIES, distort, nonsense, UNKNOWN_KANJI, composeKanji } from '../../tools/kanjivg/synth.mjs';

const RB = load(['core', 'recog']);
const R = RB.recog;
const I = R._internal;
const KANJI = '一二三十人口日月山川木水火土石田力大小上下中名手目雨本入出王門心花';
const BOX = { w: 327, h: 327 };
const draw = (ch) => R.reference(ch).strokes.map((s, si) => s.map((p, k) => ({ x: p.x * 3, y: p.y * 3, t: si * 300 + k * 10 })));
const top = (r) => (r.candidates[0] ? r.candidates[0].ch : null);
const chars = (r) => r.candidates.map((c) => c.ch);
const MIX = { script: 'any', kanji: true };
const sizeEq = (ch, got) => got === ch || I.LARGE_OF[ch] === got || I.SMALL_OF[ch] === got || I.LARGE_OF[got] === ch;
const twinEq = (ch, got) => sizeEq(ch, got) || !!(I.TWIN_OF[ch] && I.TWIN_OF[ch].includes(got));
const shapeEq = (ch, got) => twinEq(ch, got) || I.SAME_SHAPE.some((g) => g.includes(ch) && g.includes(got));
const pct = (a, b) => ((100 * a) / b).toFixed(1) + '%';
const fams = Object.keys(FAMILIES).filter((f) => f.startsWith('heldout-'));

export default async (t) => {
  // ---------------------------------------------------------------- API
  t.eq(R.sameShape('ロ'), ['ロ', '口'], 'sameShape(ロ)');
  t.eq(R.sameShape('へ'), ['へ', 'ヘ'], 'sameShape(へ)');
  t.eq(R.sameShape('あ'), null, 'sameShape(あ) is null');
  const plain = R.recognize(draw('あ'), { box: BOX, script: 'any' });
  t.ok(plain.kanjiHint === null && plain.kanjiLike === false, 'result carries kanjiHint (null) and kanjiLike (false)');

  // ---------------------------------------------------------------- every kanji, clean reference, kana+kanji pad
  const cleanBad = [];
  for (const ch of KANJI) {
    const r = R.recognize(draw(ch), { box: BOX, ...MIX });
    if (!r.candidates.slice(0, 2).some((c) => c.ch === ch) || r.status !== 'confident') cleanBad.push(`${ch}->${chars(r).slice(0, 2).join('')}/${r.status}`);
    if (!I.TWIN_OF[ch] && top(r) !== ch) cleanBad.push(`${ch} not first`);
  }
  t.eq(cleanBad, [], 'every KanjiVG kanji reference is read confidently in the kana+kanji pad (twins: in the first two)');

  // ---------------------------------------------------------------- kana/kanji twins
  for (const [kana, kan] of [['ロ', '口'], ['ニ', '二'], ['カ', '力'], ['ー', '一']]) {
    for (const ch of [kana, kan]) {
      for (let i = 0; i < 4; i++) {
        const s = i ? distort(R.reference(ch), 'heldout-noise', `twin|${ch}|${i}`, { ch }) : { strokes: draw(ch), box: BOX };
        const r = R.recognize(s.strokes, { box: s.box, ...MIX });
        const c = r.candidates;
        t.ok(c[0] && c[1] && c[0].ch === kana && c[1].ch === kan && c[0].dist === c[1].dist, `${ch} (${i}): ${kana} then ${kan} at one distance (${chars(r).slice(0, 2).join('')})`);
        if (!i) t.ok(r.notes.includes(`identical-shape: ${kana}/${kan}`), `${ch}: identical-shape note`);
        const k = R.recognize(s.strokes, { box: s.box, script: 'any' });
        t.ok(!chars(k).includes(kan) && top(k) === kana, `${ch} (${i}): kana-only pad returns ${kana}, never ${kan}`);
      }
    }
  }

  // ---------------------------------------------------------------- confusable sets across kana and kanji
  // requested pairs (口/ロ 二/ニ 力/カ 一/ー 入/人 十/ナ/メ; 工/エ 八/ハ 夕/タ, where the kanji
  // is not supported: the kana must still read as itself) and lookalikes found in the data
  const SETS = ['口ロ', '二ニ', '力カ', '一ー', '入人', '十ナメ', 'エハタ', '三ミ', '川ルリり', '小ハ', '土エ上', '王エキ', '手キチ', '木ホ本',
    '大ナ', '下トテ', '日目ヨ', '田ロ', '中ロ', '心ルい', '水ホ', '火ソメ', '人入ヘ', '花イヒ', '名タ', '山出', '二こに', 'ソリ川', 'ノ人'];
  let pn = 0, pok = 0;
  const pairBad = [];
  for (const set of SETS) {
    let n = 0, ok = 0;
    for (const ch of new Set(set)) for (const fam of ['heldout-affine', 'heldout-noise', 'heldout-truncext']) for (let i = 0; i < 3; i++) {
      const s = distort(R.reference(ch), fam, `kpair|${ch}|${i}`, { ch });
      const r = R.recognize(s.strokes, { box: s.box, ...MIX });
      n++;
      if (r.candidates[0] && shapeEq(ch, r.candidates[0].ch)) ok++; else pairBad.push(`${ch}→${top(r) || '∅'}`);
    }
    pn += n; pok += ok;
    t.ok(ok / n >= 0.9, `kana/kanji set ${set}: ${ok}/${n}`);
  }
  t.log(`kana/kanji confusable sets (${SETS.length}), kana+kanji pad: ${pct(pok, pn)} of ${pn}; errors: ${pairBad.join(' ') || 'none'}`);
  t.ok(pok / pn >= 0.97, 'kana/kanji confusable sets overall >= 97%');
  // 工 八 夕 are not in the set: their kana lookalikes stay kana, and no kanji is invented
  for (const ch of 'エハタ') t.ok(!chars(R.recognize(draw(ch), { box: BOX, ...MIX })).some((c) => '工八夕'.includes(c)), `${ch}: no unsupported kanji is returned`);

  // ---------------------------------------------------------------- kana accuracy does not regress with kanji on
  const kana = R.supported({ kanji: false });
  let n = 0, same = 0, anyOk = 0, mixOk = 0, mixKanjiTop = 0;
  const changed = [];
  for (const fam of fams) for (const ch of kana) {
    const s = distort(R.reference(ch), fam, `kreg|${ch}|0`, { ch });
    const a = R.recognize(s.strokes, { box: s.box, script: 'any' });
    const m = R.recognize(s.strokes, { box: s.box, ...MIX });
    n++;
    if (top(a) && sizeEq(ch, top(a))) anyOk++;
    if (top(m) && sizeEq(ch, top(m))) mixOk++;
    if (top(a) === top(m)) same++; else changed.push(`${ch}:${top(a)}→${top(m)}`);
    if (top(m) && I.scriptOf(top(m)) === 'kanji') mixKanjiTop++;
  }
  t.log(`kana held-out (${fams.length} families x 1, n=${n}): top-1 ${pct(anyOk, n)} kana pad, ${pct(mixOk, n)} kana+kanji pad; top-1 changed ${n - same}× (${changed.join(' ') || 'none'}); a kanji first ${mixKanjiTop}×`);
  t.ok(mixOk >= anyOk, 'kana top-1 in the kana+kanji pad is not lower than in the kana pad');
  // twins come kana first; a different kanji first is rare (the full eval found one weak ん read as a one-stroke 人)
  t.ok(mixKanjiTop / n <= 0.002, `a kana drawing gets a kanji as its first reading at most 0.2% of the time (${mixKanjiTop}/${n})`);
  // the 33 kanji, held-out, in the kana+kanji pad (twins count either way; the pad orders them by context)
  let kn = 0, k1 = 0, kExact = 0, kConf = 0, kConfOk = 0;
  for (const fam of fams) for (const ch of KANJI) for (let i = 0; i < 2; i++) {
    const s = distort(R.reference(ch), fam, `kacc|${ch}|${i}`, { ch });
    const r = R.recognize(s.strokes, { box: s.box, ...MIX });
    kn++;
    const ok = top(r) && twinEq(ch, top(r));
    if (ok) k1++;
    if (top(r) === ch) kExact++;
    if (r.status === 'confident') { kConf++; if (ok) kConfOk++; }
  }
  t.log(`kanji held-out in the kana+kanji pad (n=${kn}): top-1 ${pct(k1, kn)} (twin read as its kana first: exact ${pct(kExact, kn)}), confident ${pct(kConf, kn)} (precision ${pct(kConfOk, kConf)})`);
  t.ok(k1 / kn >= 0.98, 'kanji held-out top-1 in the kana+kanji pad >= 98%');
  t.ok(kConfOk / Math.max(1, kConf) >= 0.99, "kanji: 'confident' is right >= 99% of the time");

  // ---------------------------------------------------------------- kanji reading off: name the kanji (kanjiHint)
  let hn = 0, hint = 0, hintWrong = 0;
  for (const fam of fams) for (const ch of KANJI) {
    const s = distort(R.reference(ch), fam, `khint|${ch}|0`, { ch });
    const r = R.recognize(s.strokes, { box: s.box, script: 'any' });
    t.ok(!r.candidates.some((c) => I.scriptOf(c.ch) === 'kanji'), `kana pad never returns a kanji candidate (${ch})`);
    if (I.TWIN_OF[ch]) continue; // ロ for 口 is a right reading already
    hn++;
    if (r.kanjiHint) { if (r.kanjiHint.ch === ch) hint++; else hintWrong++; }
  }
  t.log(`kanji drawn with kanji reading off (n=${hn}, twins excluded): hint names it ${pct(hint, hn)}, names another kanji ${hintWrong}×`);
  t.ok(hint / hn >= 0.8 && hintWrong === 0, 'kanji hint: names the drawn kanji >= 80% of the time, never a different one');
  t.eq(R.recognize(draw('水'), { box: BOX, script: 'any' }).kanjiHint.ch, '水', 'clean 水 in the kana pad: hint 水');
  t.eq(R.recognize(draw('水'), { box: BOX, script: 'hira' }).kanjiHint.ch, '水', 'clean 水 in the hiragana pad: hint 水');
  t.eq(R.recognize(draw('水'), { box: BOX, ...MIX }).kanjiHint, null, 'no hint when kanji are read');

  // ---------------------------------------------------------------- outside the set: kanji-like (kanjiLike)
  const unk = Object.entries(UNKNOWN_KANJI);
  let un = 0, likeKana = 0, likeMix = 0, confMix = 0, hintUnk = 0;
  const confWrong = [];
  for (const fam of fams) for (const [ch, parts] of unk) {
    const s = distort(composeKanji(R.reference, parts), fam, `unk|${ch}|0`, {});
    const a = R.recognize(s.strokes, { box: s.box, script: 'any' });
    const m = R.recognize(s.strokes, { box: s.box, ...MIX });
    un++;
    if (a.kanjiLike) likeKana++;
    if (a.kanjiHint) hintUnk++;
    if (m.kanjiLike) likeMix++;
    if (m.status === 'confident') { confMix++; confWrong.push(`${ch}→${top(m)}`); }
    if (a.kanjiLike) t.ok(a.sizeHint === null, `kanji-like ${ch}: no size hint`);
  }
  t.log(`unknown kanji composed from KanjiVG components (${unk.length} kanji x ${fams.length} families, n=${un}): kanji-like ${pct(likeKana, un)} kana pad, ${pct(likeMix, un)} kana+kanji pad; kanji hint ${hintUnk}×; confidently read as a supported kanji ${confMix}× (${confWrong.join(' ') || 'none'})`);
  t.ok(likeKana / un >= 0.9 && likeMix / un >= 0.9, 'unknown kanji flagged kanji-like >= 90% in both pads');
  t.ok(hintUnk === 0, 'unknown kanji never named as a supported kanji by the hint');
  t.ok(confMix / un <= 0.03, "unknown kanji read 'confident' as a supported kanji <= 3%");
  // kana and nonsense are not kanji-like, and get no hint
  let kl = 0, kh = 0, kn2 = 0;
  for (const fam of fams) for (const ch of kana) {
    const s = distort(R.reference(ch), fam, `klike|${ch}|0`, { ch });
    for (const opts of [{ script: I.scriptOf(ch) === 'hira' ? 'hira' : 'kata' }, { script: 'any' }, MIX]) {
      const r = R.recognize(s.strokes, { box: s.box, ...opts });
      kn2++;
      if (r.kanjiLike) kl++;
      if (r.kanjiHint) kh++;
    }
  }
  t.log(`kana held-out in three pads (n=${kn2}): kanji-like ${kl}×, kanji hint ${kh}×`);
  t.ok(kl === 0 && kh === 0, 'kana drawings are never kanji-like and never get a kanji hint');
  let nl = 0;
  for (const kind of ['dot', 'blob', 'zigzag', 'scribble', 'tangle']) for (let i = 0; i < 30; i++) for (const opts of [{ script: 'any' }, MIX]) {
    const r = R.recognize(nonsense(kind, 3000 + i), { box: { w: 300, h: 300 }, ...opts });
    if (r.kanjiLike || r.kanjiHint || r.status === 'confident') nl++;
  }
  t.eq(nl, 0, 'nonsense is never kanji-like, hinted or confident');
  // many-stroke kanji beyond any template: still kanji-like, not just "nonsense"
  const mori = R.recognize(composeKanji(R.reference, UNKNOWN_KANJI['森']).strokes.map((s) => s.map((p) => ({ x: p.x * 3, y: p.y * 3 }))), { box: BOX, script: 'any' });
  t.ok(mori.status === 'nonsense' && mori.kanjiLike && mori.candidates.length === 0, '森 (12 strokes) in the kana pad: rejected, flagged kanji-like, no candidates');

  // ---------------------------------------------------------------- nothing answer-like changes the result
  for (const [ch, opts] of [['水', MIX], ['水', { script: 'any' }], ['口', MIX], ['ロ', MIX]]) {
    const base = JSON.stringify(R.recognize(draw(ch), { box: BOX, ...opts }));
    const withAns = JSON.stringify(R.recognize(draw(ch), { box: BOX, ...opts, expected: 'みず', answer: '口', target: 'ロ', accept: ['ロ', '口'] }));
    t.eq(withAns, base, `answer-like options change nothing (${ch}, ${JSON.stringify(opts)})`);
  }
  t.ok(!/expected|answer|target|accept/.test(R.recognize.toString()), 'recognize() source does not reference an answer');
};
