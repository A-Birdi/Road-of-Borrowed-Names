// RBN-QA-198 (Agnes 6758566311 and 6768862363; Local CL-714, CL-761; Cloud CC-544; Agnes 6803414018): a kana unit written
// as two characters (ティ, ファ, しゃ …) is completed in a word with the word going on after the whole unit, and only a
// one-character unit is single (one character on the pad, the one-character feedback). In node, the real task builder:
//  1. every two-character unit the game teaches that has a word: before + unit + after is the word, nothing of the unit
//     after the blank, not single, the unit itself the answer and the item;
//  2. every one-character kana with a word, as before: before + kana + after is the word, single;
//  3. Foundations: a unit asked in a word is asked whole after the level's own adaptation (every kana of the word is
//     known, so nothing is blanked further); with the unit taught whole but its small kana not taught alone there is no
//     word, and the bare unit is asked whole, not single (Agnes 6806661624; tests/unit/kana_taught_units.test.mjs); with
//     both scripts known, nothing changes;
//  4. grading: テ for ティ and フ for ファ are wrong, the unit right; テイ for ティ is recorded as it is (not right);
//  5. the bare task (no word): not single for a two-character unit, single for one character (the bare-kana row,
//     Agnes 6805563739 (a) and 6806661624; Local CL-775; this test first pinned it as single).
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const journey = (o = {}) => {
    const s = RB.state.newCampaign({ edition: 2 });
    s.learn.kanaKnown = o.known || 'both'; s.learn.profile = o.profile || 'E';
    if (o.taught) s.learn.taught = Object.fromEntries(o.taught.map((c) => [c, true]));
    RB.game.G.s = s; RB.game.s = s;
    return s;
  };
  // every kana unit the game knows, from the kana tables
  const units = new Set();
  for (const k of Object.keys(RB.kana)) if (Array.isArray(RB.kana[k])) for (const x of RB.kana[k]) if (typeof x === 'string' && x && RB.kana.isKana(x[0])) units.add(x);
  for (const x of ['ティ', 'ファ', 'しゃ']) units.add(x);
  const two = [...units].filter((x) => x.length === 2);
  // every single kana: the hiragana and katakana blocks, and the long-vowel mark
  const one = [];
  for (const [a, z] of [[0x3041, 0x3096], [0x30a1, 0x30fa]]) for (let c = a; c <= z; c++) one.push(String.fromCharCode(c));
  one.push('ー');

  // ---- 1. two-character units
  journey();
  let n2 = 0;
  const bad2 = [];
  for (const ch of two) {
    const st = RB.tasks.kanaStep(ch);
    if (!st.template) continue;
    n2++;
    const w = st.word.r, i = w.indexOf(ch);
    if (!(st.template.before + ch + st.template.after === w && st.template.after === w.slice(i + 2) && st.single === false && st.answer === ch && st.accept.length === 1 && st.accept[0] === ch && st.item === 'k:' + ch)) bad2.push(ch + ' ' + JSON.stringify({ w, tpl: st.template, single: st.single }));
  }
  t.ok(n2 >= 20 && !bad2.length, '1 every two-character unit with a word (' + n2 + '): the word goes on after the whole unit, not single, the unit the answer ' + bad2.slice(0, 4).join('; '));
  const pt = RB.tasks.kanaStep('ティ');
  t.ok(pt.template && pt.template.after.indexOf('ィ') !== 0, '1 ティ: nothing of the unit after the blank ' + JSON.stringify(pt.template));

  // ---- 2. one-character kana, as before
  let n1 = 0;
  const bad1 = [];
  for (const ch of one) {
    const st = RB.tasks.kanaStep(ch);
    if (!st.template) continue;
    n1++;
    const w = st.word.r, i = w.indexOf(ch);
    if (!(st.template.before + ch + st.template.after === w && st.template.after === w.slice(i + 1) && st.single === true)) bad1.push(ch);
  }
  t.ok(n1 >= 100 && !bad1.length, '2 every one-character kana with a word (' + n1 + '): as before, single ' + bad1.slice(0, 6).join(' '));

  // ---- 3. Foundations
  journey({ profile: 'F', known: 'kata', taught: ['パ', 'ー', 'テ', 'ィ', 'ティ'] });
  const f1 = RB.tasks.prepare(RB.tasks.kanaStep('ティ'));
  t.ok(f1.answer === 'ティ' && f1.item === 'k:ティ' && f1.template && f1.template.before === 'パー' && f1.template.after === 'ー' && !f1.fullAnswer, '3 Foundations, every kana of パーティー taught: ティ asked whole in the word ' + JSON.stringify({ a: f1.answer, tpl: f1.template, item: f1.item }));
  journey({ profile: 'F', known: 'none', taught: ['し', 'ゃ', 'しゃ', 'み', 'せ', 'ん'] });
  const f2 = RB.tasks.prepare(RB.tasks.kanaStep('しゃ'));
  t.ok(f2.answer === 'しゃ' && f2.item === 'k:しゃ' && f2.template && f2.template.before === '' && f2.template.after === 'みせん', '3 Foundations, hiragana: しゃ asked whole in しゃみせん ' + JSON.stringify({ a: f2.answer, tpl: f2.template }));
  journey({ profile: 'F', known: 'kata', taught: ['パ', 'ー', 'テ', 'ティ'] });
  const f3 = RB.tasks.prepare(RB.tasks.kanaStep('ティ'));
  t.ok(!f3.template && f3.single === false && f3.answer === 'ティ' && f3.item === 'k:ティ' && !f3.fullAnswer && !f3.exposure,
    '3 Foundations, ティ taught whole and the small ィ not taught alone: no word, the bare unit asked whole (not single, credited to ティ)');
  journey({ profile: 'F', known: 'both' });
  const f4 = RB.tasks.prepare(RB.tasks.kanaStep('ファ'));
  t.ok(f4.answer === 'ファ' && f4.template && f4.template.after === '', '3 Foundations, both scripts known: ファ in ソファ, whole ' + JSON.stringify(f4.template));

  // ---- 4. grading
  journey();
  const chk = (got, want, single) => RB.answers.check(got, { answer: want, accept: [want], mode: 'kana', input: 'ime', single });
  const r1 = chk('テ', 'ティ', false), r2 = chk('ティ', 'ティ', false), r3 = chk('フ', 'ファ', false), r4 = chk('ファ', 'ファ', false), r5 = chk('テイ', 'ティ', false);
  t.ok(!r1.ok && r2.ok && !r3.ok && r4.ok, '4 テ and フ wrong; ティ and ファ right');
  t.ok(!r5.ok, '4 テイ for ティ is not right');
  t.log('テイ for ティ: ' + JSON.stringify((r5.feedback || []).map((f) => f.en)));
  t.log('テ for ティ: ' + JSON.stringify((r1.feedback || []).map((f) => f.en)));

  // ---- 5. the bare task: not this row's (still single, one character or two)
  t.eq(['ティ', 'しゃ', 'テ'].map((ch) => RB.tasks.kanaStep(ch, { bare: true }).single), [false, false, true], '5 the bare task: not single for ティ and しゃ, single for テ');
};
