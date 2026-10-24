// RBN-QA-165 follow-up (Agnes 6376933092; Local CL-249; Cloud CC-157 §5): the lexicon's deliberate non-words (meaning
// "(not a word: …)") are wrong choices the tasks that teach them write by hand; but the three generated wrong-meaning
// pools drew them too, so a choice could read "(not a word: しほさゐ only half read; today しおさい)" and its reason
// "That would be しほさい". With the real generators, against the source before this (hashed there):
//  1. vocabulary recognition (vocabStep), every real `exp` entry at 50 clocks: no marked wrong option; one right answer,
//     the entry's own meaning; four options still (no pool runs short); the item, the word shown, the right answer and
//     the explanation as before. Every deliberate non-word in the index is an `exp` entry, so no other target's pool
//     ever held one: every such target (all of them, at one clock) asks exactly as before;
//  2. the listening exam, the same at 20 turns each: no marked option; the transcript, the right answer, the item as
//     before; four options; every target outside `exp` (all, at one turn) exactly as before;
//  3. bookmark practice, on the game's own lines that use an `exp` word and on lines that don't (the first 120 of each
//     in scene order, a sample): no marked option; still no learning item; one right answer; as many steps per line,
//     with as many options, as before; the sampled lines without such a word exactly as before; and making every one of
//     those steps leaves the journey exactly as it was (the runner records only a step with an item,
//     src/ui/65_challenge.js, and bookmark practice also passes noRecord: read, not run here);
//  4. the kana completion and ko.toro_2's hand-written wrong choice as RBN-QA-165 left them;
//  5. the same inputs give the same steps (each generator, twice, for every `exp` target and sampled line);
//  6. a sparse pool, as a fixture (the real `exp` pools hold 172 or more): the cached index cut down to a target, real
//     words of its part of speech and the non-words. The non-words are never brought back to fill the options: with two
//     real words, three options; with one, two options, and bookmark practice leaves the word out (its threshold of two
//     wrong choices, as before); with none, the right answer alone. The test reports these; it does not change them.
import { load } from '../lib/load.mjs';
import { createHash } from 'node:crypto';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content;
  const non = (o) => /^\(not a word\b/.test((o && (o.en || o.m)) || '');
  const idx = RB.tasks.kanaWordIndex();
  const exp = idx.filter((e) => e.pos === 'exp' && !non(e));
  // every entry outside `exp`: no deliberate non-word is outside it, so their pools never held one
  const others = idx.filter((e) => e.pos !== 'exp' && !non(e));
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
  RB.learn.clock = () => 0;
  for (const e of others) rest1.update(JSON.stringify(RB.tasks.vocabStep(e.w + '|' + e.r, { recall: false })));
  t.ok(idx.filter(non).length >= 30 && idx.filter(non).every((e) => e.pos === 'exp'), 'every deliberate non-word in the index (' + idx.filter(non).length + ') is an exp entry, so only exp pools held one');
  t.eq(bad1, [], 'vocabulary recognition, ' + exp.length + ' real exp entries at 50 clocks: no marked wrong option, one right answer (its meaning), four options');
  t.eq([hx(same1), hx(rest1)], ['f15f3b598fe102a7', 'd1b38c0fe383c75f'], 'the item, word, right answer and explanation as before; every target outside exp (' + others.length + ', at one clock) exactly as before');

  // ---- 2. the listening exam
  const s = RB.game.G.s, bad2 = [], same2 = H(), rest2 = H();
  for (const e of exp) for (let n = 0; n < 20; n++) {
    const q = RB.exams.question(s, 'v:' + e.w + '|' + e.r, 'listen', n);
    if (!q) { bad2.push(e.r + ' none'); continue; }
    const right = q.options.filter((o) => o.ok);
    if (q.options.some((o) => !o.ok && non(o)) || right.length !== 1 || right[0].en !== e.m || q.options.length !== 4) bad2.push(e.r + '@' + n);
    same2.update(JSON.stringify([q.item, q.transcript, right[0].en, q.prompt]));
  }
  for (const e of others) rest2.update(JSON.stringify(RB.exams.question(s, 'v:' + e.w + '|' + e.r, 'listen', 0)));
  t.eq(bad2, [], 'the listening exam, ' + exp.length + ' real exp entries at 20 turns: no marked option, one right answer, four options');
  t.eq([hx(same2), hx(rest2)], ['7380fc704663a500', '9fafd152b84cc841'], 'the item, transcript, right answer and prompt as before; every target outside exp (' + others.length + ', at one turn) exactly as before');

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
  const journey = JSON.stringify(RB.game.G.s);
  for (const b of withExp) {
    const steps = RB.bookmarks.practiceSteps(b, 3);
    for (const st of steps) {
      const right = st.options.filter((o) => o.ok);
      if (st.options.some((o) => !o.ok && non(o)) || right.length !== 1 || st.item) bad3.push(b.id);
    }
    same3.update(JSON.stringify([b.id, steps.length, steps.map((st) => [st.ctx, st.options.find((o) => o.ok).en, st.explain, st.options.length])]));
  }
  for (const b of without.slice(0, 120)) rest3.update(JSON.stringify(RB.bookmarks.practiceSteps(b, 3)));
  t.ok(withExp.length >= 50 && without.length >= 50, 'the game\'s own lines (a sample, in scene order): ' + withExp.length + ' using an exp word, ' + without.length + ' not');
  t.eq(bad3, [], 'bookmark practice: no marked option, one right answer, still no learning item');
  t.ok(JSON.stringify(RB.game.G.s) === journey, 'bookmark practice: making every one of those steps leaves the journey (its learning records included) exactly as it was');
  t.eq([hx(same3), hx(rest3)], ['d28e4b8c93c3517d', '8e423c248e5903bd'], 'as many steps per line, each with the same word, right answer and number of options; the sampled lines without such a word exactly as before');

  // ---- 4.
  const wrongs = C.challenges['ko.toro_2'].tiers.F[0].options.filter((x) => !x.ok).map((x) => x.jp);
  t.ok(wrongs.includes('しほさい') && typeof RB.tasks.nonWord === 'function' && RB.tasks.nonWord({ m: '(not a word: x)' }) && !RB.tasks.nonWord({ m: 'a word' }), 'ko.toro_2 keeps しほさい as its wrong choice; the one test for a marked non-word is shared');

  // ---- 5. the same inputs, the same steps
  const twice = [];
  for (const e of exp) {
    RB.learn.clock = () => 7;
    const k = e.w + '|' + e.r;
    if (JSON.stringify(RB.tasks.vocabStep(k, { recall: false })) !== JSON.stringify(RB.tasks.vocabStep(k, { recall: false }))) twice.push('vocab ' + e.r);
    if (JSON.stringify(RB.exams.question(s, 'v:' + k, 'listen', 3)) !== JSON.stringify(RB.exams.question(s, 'v:' + k, 'listen', 3))) twice.push('exam ' + e.r);
  }
  for (const b of withExp.concat(without.slice(0, 120))) if (JSON.stringify(RB.bookmarks.practiceSteps(b, 3)) !== JSON.stringify(RB.bookmarks.practiceSteps(b, 3))) twice.push('bookmark ' + b.id);
  t.eq(twice, [], 'each generator, twice with the same inputs, gives the same steps (' + exp.length + ' exp targets, ' + (withExp.length + Math.min(120, without.length)) + ' lines)');

  // ---- 6. a sparse pool (a fixture; the cached index is put back afterwards)
  const keep = idx.slice(), nonW = keep.filter(non);
  const fx = exp.find((e) => RB.bookmarks.wordsOf({ id: 'fx', jp: e.w }).some((w) => w.entry === e));
  const mates = exp.filter((x) => x !== fx && x.m !== fx.m && x.w !== fx.w && x.r !== fx.r);
  const sparse = [];
  try {
    for (const m of [2, 1, 0]) {
      idx.length = 0; idx.push(fx, ...mates.slice(0, m), ...nonW);
      RB.learn.clock = () => 0;
      const v = RB.tasks.vocabStep(fx.w + '|' + fx.r, { recall: false });
      const q = RB.exams.question(s, 'v:' + fx.w + '|' + fx.r, 'listen', 0);
      const bs = RB.bookmarks.practiceSteps({ id: 'fx' + m, jp: fx.w }, 3);
      const marked = [v, q].concat(bs).some((st) => st.options.some((o) => !o.ok && non(o)));
      sparse.push(m + ' real: vocab ' + v.options.length + ', exam ' + q.options.length + ', bookmark ' + (bs.length ? bs[0].options.length : 'none') + (marked ? ', MARKED' : ''));
    }
  } finally { idx.length = 0; idx.push(...keep); }
  t.eq(sparse, ['2 real: vocab 3, exam 3, bookmark 3', '1 real: vocab 2, exam 2, bookmark none', '0 real: vocab 1, exam 1, bookmark none'],
    'a sparse pool (a fixture, ' + fx.r + ' with ' + nonW.length + ' non-words beside it): the non-words never fill the options; fewer options, and bookmark practice leaves the word out below two wrong choices, as before');
  t.ok(RB.tasks.kanaWordIndex().length === keep.length, 'the cached index put back (' + keep.length + ')');
};
