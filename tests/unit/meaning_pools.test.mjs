// RBN-QA-165 follow-up (Agnes 6376933092; Local CL-249; Cloud CC-157 §5): the lexicon's deliberate non-words (meaning
// "(not a word: …)") are wrong choices the tasks that teach them write by hand; but the three generated wrong-meaning
// pools drew them too, so a choice could read "(not a word: しほさゐ only half read; today しおさい)" and its reason
// "That would be しほさい". With the real generators, against the source before this (hashed there):
//  1. vocabulary recognition (vocabStep), every real `exp` entry at 50 clocks: no marked wrong option; one right answer,
//     the entry's own meaning; four options still (no pool runs short); the item, the word shown, the right answer and
//     the explanation as before; a sample of the targets whose pool held no non-word asks exactly as before;
//  2. the listening exam, the same at 20 turns each: no marked option; the transcript, the right answer, the item as
//     before; four options; every other part of the unaffected targets as before;
//  3. bookmark practice, on the game's own lines that use an `exp` word and on lines that don't: no marked option; still
//     no learning item; one right answer; as many steps per line as before; lines without such a word exactly as before;
//  4. the kana completion and ko.toro_2's hand-written wrong choice as RBN-QA-165 left them.
import { load } from '../lib/load.mjs';
import { createHash } from 'node:crypto';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content;
  const non = (o) => /^\(not a word\b/.test((o && (o.en || o.m)) || '');
  const idx = RB.tasks.kanaWordIndex();
  const exp = idx.filter((e) => e.pos === 'exp' && !non(e));
  // (every tenth of the other entries, a sample: their pools hold thousands, and a step reshuffles its pool)
  const others = idx.filter((e) => e.pos !== 'exp' && !non(e)).filter((e, i) => i % 10 === 0);
  RB.game.G.s = RB.state.newCampaign({ edition: 2 });
  RB.learn.kanaKnown = () => true;
  const H = () => createHash('sha256');
  const hx = (h) => h.digest('hex').slice(0, 16);

  // ---- 1. vocabStep
  const bad1 = []; const same1 = H(), rest1 = H();
  for (const e of exp) for (let c = 0; c < 50; c++) {
    RB.learn.clock = () => c;
    const st = RB.tasks.vocabStep(e.w + '|' + e.r, { recall: false });
    const right = st.options.filter((o) => o.ok);
    if (st.options.some((o) => !o.ok && non(o)) || right.length !== 1 || right[0].en !== e.m || st.options.length !== 4) bad1.push(e.r + '@' + c);
    same1.update(JSON.stringify([st.item, st.ctx, right[0].en, st.explain]));
  }
  for (const e of others) for (let c = 0; c < 2; c++) { RB.learn.clock = () => c; rest1.update(JSON.stringify(RB.tasks.vocabStep(e.w + '|' + e.r, { recall: false }))); }
  t.eq(bad1, [], 'vocabulary recognition, ' + exp.length + ' real exp entries at 50 clocks: no marked wrong option, one right answer (its meaning), four options');
  t.eq([hx(same1), hx(rest1)], ['f15f3b598fe102a7', 'd4df034a8919e491'], 'the item, word, right answer and explanation as before; every target without a non-word in its pool exactly as before');

  // ---- 2. the listening exam
  const s = RB.game.G.s, bad2 = [], same2 = H(), rest2 = H();
  for (const e of exp) for (let n = 0; n < 20; n++) {
    const q = RB.exams.question(s, 'v:' + e.w + '|' + e.r, 'listen', n);
    if (!q) { bad2.push(e.r + ' none'); continue; }
    const right = q.options.filter((o) => o.ok);
    if (q.options.some((o) => !o.ok && non(o)) || right.length !== 1 || right[0].en !== e.m || q.options.length !== 4) bad2.push(e.r + '@' + n);
    same2.update(JSON.stringify([q.item, q.transcript, right[0].en, q.prompt]));
  }
  for (const e of others.slice(0, 200)) for (let n = 0; n < 2; n++) rest2.update(JSON.stringify(RB.exams.question(s, 'v:' + e.w + '|' + e.r, 'listen', n)));
  t.eq(bad2, [], 'the listening exam, ' + exp.length + ' real exp entries at 20 turns: no marked option, one right answer, four options');
  t.eq([hx(same2), hx(rest2)], ['7380fc704663a500', '44c213d62f69f907'], 'the item, transcript, right answer and prompt as before; the other targets exactly as before');

  // ---- 3. bookmark practice, on the game's own lines
  const lines = [];
  for (const id in C.scenes) for (const c of C.scenes[id].cmds) if (c.op === 'say' && c.jp) lines.push(c.jp);
  const withExp = [], without = [];
  for (const jp of lines) {
    const b = { id: 'bm' + (withExp.length + without.length), jp };
    const ws = RB.bookmarks.wordsOf(b);
    (ws.some((w) => w.entry && w.entry.pos === 'exp' && !non(w.entry)) ? withExp : without).push(b);
    if (withExp.length >= 120 && without.length >= 120) break;
  }
  const bad3 = [], same3 = H(), rest3 = H();
  for (const b of withExp) {
    const steps = RB.bookmarks.practiceSteps(b, 3);
    for (const st of steps) {
      const right = st.options.filter((o) => o.ok);
      if (st.options.some((o) => !o.ok && non(o)) || right.length !== 1 || st.item) bad3.push(b.id);
    }
    same3.update(JSON.stringify([b.id, steps.length, steps.map((st) => [st.ctx, st.options.find((o) => o.ok).en, st.explain, st.options.length])]));
  }
  for (const b of without.slice(0, 120)) rest3.update(JSON.stringify(RB.bookmarks.practiceSteps(b, 3)));
  t.ok(withExp.length >= 50 && without.length >= 50, 'the game\'s own lines: ' + withExp.length + ' using an exp word, ' + without.length + ' not');
  t.eq(bad3, [], 'bookmark practice: no marked option, one right answer, still no learning item');
  t.eq([hx(same3), hx(rest3)], ['d28e4b8c93c3517d', '8e423c248e5903bd'], 'as many steps per line, each with the same word, right answer and number of options; lines without such a word exactly as before');

  // ---- 4.
  const wrongs = C.challenges['ko.toro_2'].tiers.F[0].options.filter((x) => !x.ok).map((x) => x.jp);
  t.ok(wrongs.includes('しほさい') && typeof RB.tasks.nonWord === 'function' && RB.tasks.nonWord({ m: '(not a word: x)' }) && !RB.tasks.nonWord({ m: 'a word' }), 'ko.toro_2 keeps しほさい as its wrong choice; the one test for a marked non-word is shared');
};
