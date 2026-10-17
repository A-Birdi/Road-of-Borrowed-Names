// FR-1V (Astra's verification follow-up, 2026-10-17): a one-kana blank in a Foundations word task credits the kana it
// asked for. The word around it is met with the rest supplied: seen, kept due and logged as supported exposure, never
// promoted or counted as independently answered, in the scheduler (s.learn.items[id] box/ok/modes) or in the evidence
// log (ev/evTry/log). Controls: a whole word written from met kana is credited; a copy model and a revealed answer are
// supported, not independent. Records made before this change are left as they are (their scope is not recoverable).
// The record call below carries the same fields as src/ui/65_challenge.js finish(); the browser path is
// tests/e2e/fr1_partial_word.mjs.
import { load } from '../lib/load.mjs';

export default async (t) => {
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const WORD = 'v:葦ノ瀬', ch = RB.content.challenges['rw.c_mill_lantern'];
  const fresh = (taught) => {
    const s = RB.state.newCampaign({ profile: 'F' });
    s.learn.kanaKnown = 'none';
    s.learn.taught = {};
    Array.from(taught).forEach((c) => (s.learn.taught[c] = true));
    RB.game.s = s;
    return s;
  };
  const EV = { hand: 'hand', ime: 'typed', choice: 'recog' };
  // finish()'s record call for a committed answer (65_challenge.js)
  const answer = (st, mode, res) => {
    res = Object.assign({ firstTry: true, assisted: !!(st.copy || st.guided), help: null }, res || {});
    RB.learn.record(st.item, { ok: res.firstTry !== false, mode, assisted: res.assisted, ctx: 'rw.c_mill_lantern', kind: st.kind,
      ev: RB.evidence.modeOf(st, mode), help: res.help, exposed: !!(st.copy || st.guided), repairs: 0,
      written: mode === 'hand' ? RB.tasks.plain(st.answer) : null, task: null, exposure: st.exposure || null });
    [].concat(st.item, st.exposure || []).forEach((i) => RB.learn.markIntroduced(i));
  };
  const item = (s, id) => s.learn.items[id] || null;

  // ---- the prepared task: what is assessed, and what is only met ----
  {
    fresh('あいうえお');
    const st = RB.tasks.stepsOf(ch)[0];
    t.eq([st.answer, st.template, st.item, st.exposure], ['あ', { before: '', after: 'しのせ' }, ['k:あ'], [WORD]], 'a one-kana blank assesses k:あ; the word is exposure');
    fresh('あいうえおしのせ');
    const w = RB.tasks.stepsOf(ch)[0];
    t.ok(w.answer === 'あしのせ' && [].concat(w.item).join() === WORD && !w.exposure, 'every kana met: the whole word is asked and assessed');
    fresh('');
    const c = RB.tasks.stepsOf(ch)[0];
    t.ok(c.copy && [].concat(c.item).join() === WORD && !c.exposure, 'no kana met: a copy of the whole word, with its model');
  }

  // ---- one blank, answered right with the pen, the keyboard and by choosing ----
  for (const mode of ['hand', 'ime', 'choice']) {
    const s = fresh('あいうえお');
    const st = RB.tasks.stepsOf(ch)[0];
    answer(st, mode);
    const k = item(s, 'k:あ'), w = item(s, WORD);
    t.ok(k && k.box === 1 && k.ok === 1 && (k.ev || {})[EV[mode]] === 1, mode + ': the kana is credited (box 1, ok 1, independent ' + EV[mode] + ')');
    t.ok(w && w.box === 0 && w.ok === 0 && w.streak === 0, mode + ': the word is not promoted or counted right: ' + JSON.stringify(w && { box: w.box, ok: w.ok }));
    t.ok(w && w.seen === 1 && w.modes.assisted === 1 && w.modes.hand === 0 && w.modes.recall === 0 && w.modes.recog === 0, mode + ': the word is seen once, with support, in no answering mode');
    t.ok(w && !Object.keys(w.ev || {}).length && !Object.keys(w.evTry || {}).length && !(w.okIn || []).length, mode + ': the word has no independent evidence and no counted try');
    const e = w && w.log && w.log[w.log.length - 1];
    t.ok(e && e.p === 1 && e.x === 1 && e.h === 'supplied' && e.m === EV[mode], mode + ': its log line says part of it was asked, the rest supplied: ' + JSON.stringify(e));
    t.ok(RB.learn.introduced(WORD), mode + ': the word is marked met');
    t.ok(w && w.due <= RB.learn.clock() + 1, mode + ': the word stays due for a later look');
    const st2 = s.learn.stats;
    t.eq([st2.hand, st2.typed, st2.recog, st2.assisted], mode === 'hand' ? [1, 0, 0, 0] : mode === 'ime' ? [0, 1, 0, 0] : [0, 0, 1, 0], mode + ': one answer in the totals, not two');
    const p = RB.evidence.profile(s, WORD);
    t.ok(p && p.recogRecent.of === 0 && p.modes[EV[mode]].independent === 0, mode + ': the word\'s page shows no answer of it');
  }

  // ---- a wrong first answer on the blank: the kana is set back, the word is not ----
  {
    const s = fresh('あいうえお');
    const w0 = (s.learn.items[WORD] = Object.assign(RB.learn.rec ? RB.learn.rec(WORD) : {}, { box: 2, ok: 3, streak: 1 }));
    const st = RB.tasks.stepsOf(ch)[0];
    answer(st, 'hand', { firstTry: false });
    const w = item(s, WORD), k = item(s, 'k:あ');
    t.ok(k.bad === 1, 'a slip on the kana is the kana\'s');
    t.ok(w.box === 2 && w.bad === 0 && w.streak === 1 && w.ok === 3, 'the word keeps its box, streak and count: ' + JSON.stringify({ box: w.box, bad: w.bad, streak: w.streak }));
    void w0;
  }

  // ---- an earlier record of the word: kept, and its review never put off by a sight of it ----
  {
    const s = fresh('あいうえお');
    const now = RB.learn.clock();
    const w0 = RB.learn.rec(WORD);
    Object.assign(w0, { box: 3, ok: 4, seen: 4, due: now + 2, ev: { hand: 3 }, okIn: ['story'] });
    const st = RB.tasks.stepsOf(ch)[0];
    answer(st, 'choice');
    const w = item(s, WORD);
    t.ok(w.box === 3 && w.ok === 4 && w.ev.hand === 3 && !w.ev.recog && w.okIn.join() === 'story', 'an earlier record keeps its box and evidence; nothing new is credited');
    t.ok(w.due <= now + 2, 'its review is not put later (due ' + w.due + ', was ' + (now + 2) + ')');
  }

  // ---- controls ----
  {
    const s = fresh('あいうえおしのせ');
    const st = RB.tasks.stepsOf(ch)[0];
    answer(st, 'hand');
    const w = item(s, WORD);
    t.ok(w.box === 1 && w.ok === 1 && w.ev.hand === 1 && w.modes.hand === 1, 'the whole word written from met kana is credited as before');
  }
  {
    const s = fresh('');
    const st = RB.tasks.stepsOf(ch)[0];
    answer(st, 'hand');
    const w = item(s, WORD), e = w.log[w.log.length - 1];
    t.ok(w.box === 0 && w.ok === 0 && w.modes.assisted === 1 && !Object.keys(w.ev || {}).length && e.x === 1 && !e.p, 'copying the word from its model is supported practice, not independent (as before)');
  }
  {
    const s = fresh('あいうえお');
    const st = RB.tasks.stepsOf(ch)[0];
    answer(st, 'choice', { assisted: true, help: 'supplied' }); // "I don't know": the answer shown, then continued
    const k = item(s, 'k:あ'), w = item(s, WORD);
    t.ok(k.box === 0 && k.ok === 0 && k.modes.assisted === 1 && !Object.keys(k.ev || {}).length, 'a revealed blank is supported for the kana too');
    t.ok(w.box === 0 && !Object.keys(w.ev || {}).length && w.log[w.log.length - 1].p === 1, 'and the word is still only met');
  }

  // ---- saves: nothing earlier is rewritten on load, and no history is invented ----
  {
    const s = fresh('あいうえお');
    const w0 = RB.learn.rec(WORD);
    Object.assign(w0, { box: 1, ok: 1, seen: 1, ev: { hand: 1 }, log: [{ d: 20743, m: 'hand', c: 'story', h: null, f: 1, x: 0 }] });
    const before = JSON.stringify(s.learn.items);
    const back = RB.save.migrate(JSON.parse(JSON.stringify(s)));
    t.eq(JSON.stringify(back.learn.items), before, 'loading a save leaves its learning records exactly as they were (an old blank\'s credit is not guessed at)');
  }
};
