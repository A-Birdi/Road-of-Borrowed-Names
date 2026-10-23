// RBN-QA-165 (Agnes 6375757669): a kana completion ("Complete the word …: write the missing hiragana") took its example
// word from the whole lexicon, which also holds deliberate non-words, the wrong choices of the tasks that teach them
// (しほさい in ko.toro_2's old-spelling lesson). Only a homophone target (じ ぢ ず づ and in katakana) left them out,
// so ほ could be asked, and answered "right", in しほさい, "(not a word: …)". With the real generator:
//  1. the native case, reproduced: ほ at the clock where it chose しほさい, every kana known: a real word now;
//  2. every kana target that a non-word contains (46 of them), at 200 clocks: the example is always a real word, and
//     neither the prompt nor the explanation says "not a word";
//  3. a target whose only examples among the known kana are non-words falls back to the bare kana question;
//  4. the task is the same task: its item, answer, what it accepts, its mode and script;
//  5. every other target asks exactly as before (the same steps, hashed over 50 clocks), homophones included;
//  6. the old-spelling lesson keeps しほさい as its wrong choice, and the lexicon keeps its entry.
import { load } from '../lib/load.mjs';
import { createHash } from 'node:crypto';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const non = (e) => /^\(not a word\b/.test((e && e.m) || '');
  const idx = RB.tasks.kanaWordIndex();
  const touched = [...new Set(idx.filter((e) => non(e) && (e.lv === 'F' || e.lv === 'E')).flatMap((e) => Array.from(e.r)))].sort();
  const KANA = Object.keys(RB.kana.ROMA).filter((k) => k.length === 1 && RB.kana.isKana(k)).concat(['っ', 'ッ', 'ー']).filter((k, i, a) => a.indexOf(k) === i).sort();
  let known = () => true;
  RB.learn.kanaKnown = (c) => known(c);
  const at = (ch, c) => { RB.learn.clock = () => c; return RB.tasks.kanaStep(ch); };

  // ---- 1.
  const s1 = at('ほ', 16);
  t.ok(s1.word && !non(s1.word) && s1.word.r !== 'しほさい' && s1.word.r.includes('ほ'), 'ほ at the clock that chose しほさい: a real word now (' + (s1.word && s1.word.r + ', ' + s1.word.m) + ')');

  // ---- 2.
  const bad = [];
  for (const ch of touched) for (let c = 0; c < 200; c++) {
    const st = at(ch, c);
    if ((st.word && non(st.word)) || /not a word/.test(JSON.stringify([st.prompt, st.explain]))) { bad.push(ch + '@' + c + ': ' + (st.word && st.word.r)); break; }
  }
  t.ok(touched.length >= 40, 'the targets a non-word contains (' + touched.length + ')');
  t.eq(bad, [], 'every such target, at 200 clocks: a real example word, and no "not a word" in what is shown');

  // ---- 3. (ゆ when only な and ぎ are known besides: ゆなぎ is the only word there, and not a word)
  known = (c) => c === 'な' || c === 'ぎ';
  const s3 = at('ゆ', 5);
  known = () => true;
  t.ok(!s3.word && !s3.template && s3.answer === 'ゆ' && /^Write the hiragana for “yu”\.$/.test(s3.prompt.en), 'with only non-words to hand, the bare kana question (' + JSON.stringify(s3.prompt) + ')');

  // ---- 4.
  const id = (st) => JSON.stringify([st.kind, st.item, st.answer, st.accept, st.mode, st.script, st.single]);
  t.eq([id(at('ほ', 16)), id(at('シ', 7)), id(at('ゆ', 3))], [id({ kind: 'write', item: 'k:ほ', answer: 'ほ', accept: ['ほ'], mode: 'kana', script: 'hira', single: true }),
    id({ kind: 'write', item: 'k:シ', answer: 'シ', accept: ['シ'], mode: 'kana', script: 'kata', single: true }), id({ kind: 'write', item: 'k:ゆ', answer: 'ゆ', accept: ['ゆ'], mode: 'kana', script: 'hira', single: true })],
  'the same task: item, answer, what it accepts, mode and script');

  // ---- 5. (hashed on the source before RBN-QA-165)
  const rest = KANA.filter((k) => !touched.includes(k));
  const h = createHash('sha256');
  for (const ch of rest) for (let c = 0; c < 50; c++) h.update(ch + c + JSON.stringify(at(ch, c)));
  t.eq({ n: rest.length, hash: h.digest('hex').slice(0, 16) }, { n: 59, hash: 'cf7f971905446617' }, 'every other target asks exactly as before, homophones included');

  // ---- 6.
  const wrongs = RB.content.challenges['ko.toro_2'].tiers.F[0].options.filter((x) => !x.ok).map((x) => x.jp);
  t.ok(wrongs.includes('しほさい') && RB.lex.all().some((e) => e.r === 'しほさい' && non(e)), 'the old-spelling lesson keeps しほさい as its wrong choice; the lexicon keeps its entry');
};
