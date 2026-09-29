// Every kanji the game displays can be written on the pad: the recognizer has
// KanjiVG data for each one (tools/kanjivg/gamekanji.mjs derives the list from
// the source), each has a reading for its furigana, each clean reference reads
// as itself, and the owner's case, 守 (守る, a response every player has), is
// read from distorted samples too. Also re-measures the kana/kanji one-shape
// pairs. If this fails after new text brings a new kanji, run
//   node tools/kanjivg/fetch.mjs && node tools/kanjivg/convert.mjs && node tools/kanjiread.mjs
import fs from 'node:fs';
import path from 'node:path';
import { load, root } from '../lib/load.mjs';
import { gameKanji } from '../../tools/kanjivg/gamekanji.mjs';
import { KANJI as FIRST33 } from '../../tools/kanjivg/chars.mjs';
import { generate as kanjiRead } from '../../tools/kanjiread.mjs';
import { FAMILIES, distort } from '../../tools/kanjivg/synth.mjs';

const RB = load(['core', 'lang', 'recog']);
const R = RB.recog;
const I = R._internal;
const BOX = { w: 327, h: 327 };
const draw = (ch) => R.reference(ch).strokes.map((s, si) => s.map((p, k) => ({ x: p.x * 3, y: p.y * 3, t: si * 300 + k * 10 })));
const top = (r) => (r.candidates[0] ? r.candidates[0].ch : null);
const twinEq = (ch, got) => got === ch || !!(I.TWIN_OF[ch] && I.TWIN_OF[ch].includes(got));

export default async (t) => {
  // ---------------------------------------------------------------- coverage
  const { chars: shown, where } = await gameKanji();
  const sup = R.supported({ kanji: true }).filter((c) => I.scriptOf(c) === 'kanji');
  const supSet = new Set(sup);
  const missing = shown.filter((c) => !supSet.has(c));
  t.eq(missing.map((c) => c + ' (' + where[c].join(', ') + ')'), [], `every kanji the game displays has recognizer data (${shown.length} displayed); if not, run tools/kanjivg/fetch.mjs + convert.mjs`);
  const expected = new Set([...shown, ...FIRST33]);
  const stale = sup.filter((c) => !expected.has(c));
  t.eq(stale, [], 'no kanji data beyond the displayed kanji and the first 33 (regenerate with convert.mjs)');
  t.ok(supSet.has('守'), '守 is supported');
  t.log(`${shown.length} kanji displayed by the game; the recognizer reads ${sup.length} kanji (the displayed ones and the first 33)`);

  // readings for the pad's furigana: the generated table is current, and every kanji but 々 has one
  const kr = await kanjiRead();
  const cur = fs.readFileSync(path.join(root, 'src', 'lang', '75_kanjiread.js'), 'utf8');
  t.ok(cur === kr.js, 'src/lang/75_kanjiread.js is up to date (node tools/kanjiread.mjs)');
  const noReading = sup.filter((c) => c !== '々' && !RB.answers.kanjiReading(c));
  t.eq(noReading, [], 'every supported kanji has a reading for its furigana (々 repeats the one before it)');

  // ---------------------------------------------------------------- every clean reference reads as itself
  const bad = [];
  let conf = 0;
  for (const ch of sup) {
    const r = R.recognize(draw(ch), { box: BOX, script: 'kanji' });
    if (!twinEq(ch, top(r))) bad.push(`${ch}->${top(r)}`);
    if (r.status === 'confident') conf++;
    if (!(R.strokeCount(ch) > 0) || R.strokeCount(ch) !== R.reference(ch).strokes.length) bad.push(`${ch}: stroke count`);
  }
  t.eq(bad, [], `every kanji's clean KanjiVG reference is read as itself in the kanji pad (${sup.length})`);
  t.log(`clean references read 'confident': ${conf}/${sup.length} (the rest have a lookalike within the margin, e.g. 未/末)`);
  t.ok(conf / sup.length >= 0.95, "clean references are 'confident' >= 95% of the time");

  // ---------------------------------------------------------------- 守 (the owner's case)
  const fams = Object.keys(FAMILIES).filter((f) => f.startsWith('heldout-'));
  let n = 0, ok = 0, okKanjiPad = 0;
  const miss = [];
  for (const fam of fams) for (let i = 0; i < 3; i++) {
    const s = distort(R.reference('守'), fam, `mamoru|${i}`, { ch: '守' });
    const r = R.recognize(s.strokes, { box: s.box, script: 'any', kanji: true });
    n++;
    if (top(r) === '守') ok++; else miss.push(`${fam}#${i}→${top(r)}`);
    if (R.recognize(s.strokes, { box: s.box, script: 'kanji' }).candidates.slice(0, 5).some((c) => c.ch === '守')) okKanjiPad++;
  }
  t.log(`守 held-out (${fams.length} families x 3) in the kana+kanji pad: top-1 ${ok}/${n}; in the first five (kanji pad) ${okKanjiPad}/${n}; misses: ${miss.join(' ') || 'none'}`);
  t.ok(ok / n >= 0.9, '守 read first in the kana+kanji pad >= 90% of held-out samples');
  t.eq(okKanjiPad, n, '守 always among the first five readings');
  const clean = R.recognize(draw('守'), { box: BOX, script: 'any', kanji: true });
  t.ok(top(clean) === '守' && clean.status === 'confident', 'clean 守: confident');
  t.ok(R.recognize(draw('守'), { box: BOX, script: 'any' }).kanjiHint && R.recognize(draw('守'), { box: BOX, script: 'any' }).kanjiHint.ch === '守', 'clean 守 with kanji reading off: the hint names 守');
  const so = R.strokeOrderFeedback(draw('守'), '守');
  t.ok(so.confident && so.strokeCountOk && so.issues.length === 0, '守 in its standard order: stroke-order feedback confident, no issues');
  const swapped = draw('守');
  [swapped[3], swapped[4]] = [swapped[4], swapped[3]];
  const so2 = R.strokeOrderFeedback(swapped, '守');
  t.ok(so2.confident && so2.issues.some((x) => x.kind === 'order'), '守 with two strokes swapped: an order note');

  // ---------------------------------------------------------------- the one-shape pairs, re-measured
  const pairs = [];
  for (const ch of R.supported({ kanji: false })) {
    if (I.LARGE_OF[ch]) continue;
    const r = R.recognize(draw(ch), { box: BOX, script: 'kanji' });
    if (r.candidates[0] && r.candidates[0].dist <= 0.09) pairs.push(ch + r.candidates[0].ch);
  }
  const declared = I.SAME_SHAPE.filter((g) => g.some((c) => I.scriptOf(c) === 'kanji')).map((g) => g.join(''));
  t.eq(pairs.slice().sort(), declared.slice().sort(), 'kana/kanji pairs within 0.09 are exactly the declared one-shape pairs');
  t.eq(RB.answers.HAND_SAME.slice().sort(), I.SAME_SHAPE.map((g) => g.join('')).sort(), 'the answer checker folds the same one-shape pairs');
};
