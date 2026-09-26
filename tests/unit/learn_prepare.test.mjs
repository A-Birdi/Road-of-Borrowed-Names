// RB.tasks.prepare at Foundations: a write step whose answer contains untaught
// kana is reduced to one blanked taught kana, and the choice mode for the
// reduced step always offers the right kana (authored whole-word choices are
// dropped). Also: every authored write step in every challenge tier keeps a
// correct option after preparation, at every profile.
import { load } from '../lib/load.mjs';

export default async (t) => {
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const s = RB.state.newCampaign({ profile: 'F' });
  RB.game.s = s;
  s.learn.profile = 'F';
  s.learn.kanaKnown = 'none';
  s.learn.taught = { 'み': true, 'ち': true };
  const step = { kind: 'write', item: 'v:みち', answer: 'みちしるべ', accept: ['みちしるべ'], mode: 'kana', choices: ['みちしるべ', 'みちしるし', 'みずしるべ'] };
  const p = RB.tasks.prepare(step);
  t.ok(p.single && Array.from(p.answer).length === 1, 'reduced to one blanked kana');
  t.ok(!p.choices, 'authored whole-word choices dropped for a one-kana blank');
  const opts = RB.challenge.choicesFor(p);
  t.ok(opts.some((o) => o.ok && o.text === p.answer), 'choice mode offers the blanked kana');
  t.ok(opts.filter((o) => o.ok).length === 1, 'exactly one correct kana option');

  // safety net: authored choices without the answer still get one
  const bad = RB.challenge.choicesFor({ kind: 'write', answer: 'いし', accept: ['いし'], choices: ['いす', 'いと'] });
  t.ok(bad.some((o) => o.ok), 'choicesFor always includes an accepted answer');

  // sweep all authored write steps through prepare at each profile / kana state
  const problems = [];
  const C = RB.content;
  const configs = [
    { profile: 'F', kanaKnown: 'none', taught: { 'あ': 1, 'い': 1, 'う': 1, 'か': 1, 'し': 1, 'た': 1, 'な': 1, 'み': 1, 'ち': 1, 'る': 1, 'ん': 1 } },
    { profile: 'F', kanaKnown: 'hira', taught: { 'モ': 1, 'チ': 1 } },
    { profile: 'E', kanaKnown: 'both', taught: {} },
    { profile: 'A', kanaKnown: 'both', taught: {} },
  ];
  let checked = 0;
  for (const cf of configs) {
    s.learn.profile = cf.profile; s.profile = cf.profile; s.learn.kanaKnown = cf.kanaKnown; s.learn.taught = cf.taught;
    for (const id in C.challenges) {
      let steps;
      try { steps = RB.tasks.stepsOf(C.challenges[id]); } catch (e) { problems.push(id + ' stepsOf threw ' + e.message); continue; }
      steps.forEach((st, i) => {
        if (st.kind !== 'write') return;
        checked++;
        const o = RB.challenge.choicesFor(st);
        if (!o.some((x) => x.ok)) problems.push(cf.profile + '/' + cf.kanaKnown + ' ' + id + '[' + i + '] no correct choice');
        if (st.choices && !st.choices.some((c) => (st.accept || [st.answer]).map(RB.tasks.plain).includes(RB.tasks.plain(c)))) problems.push(cf.profile + ' ' + id + '[' + i + '] prepared choices lack answer');
      });
    }
  }
  t.ok(checked > 100, 'swept ' + checked + ' prepared write steps');
  t.eq(problems.slice(0, 10), [], 'every prepared write step keeps a correct choice');
};
