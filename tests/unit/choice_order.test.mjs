// Where an option sits in a multiple-choice step never gives the answer away.
// Authors (and the meaning questions RB.tasks builds) write the right option
// first — 657 of 667 authored "choose" steps when this test was added — so
// RB.challenge.choicesFor shuffles what is shown. Checked over every authored
// choose step in the chapters and the Atlas, the generated meaning questions,
// and write steps in choice mode: the options are the same set, the right
// one is first no more often than chance allows, every place gets its share,
// the order holds while a step is open and changes from one asking to the next.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const s = RB.state.newCampaign({ profile: 'E' });
  RB.game.s = s;
  s.learn.profile = 'E';
  s.learn.kanaKnown = 'both';
  const setClock = (n) => { s.learn.clock = n; };

  // every authored choose step (chapters, battles, side stories, the Atlas)
  const steps = [], seen = new Set();
  (function walk(o, d) {
    if (!o || typeof o !== 'object' || d > 12 || seen.has(o)) return;
    seen.add(o);
    if (o.kind === 'choose' && Array.isArray(o.options)) steps.push(o);
    for (const k of Object.keys(o)) walk(o[k], d + 1);
  })({ c: RB.content, a: RB.atlas }, 0);
  t.ok(steps.length > 500, 'authored choose steps found (' + steps.length + ')');
  // the generated "What does this word mean?" questions (recognition, not recall)
  const gen = [];
  for (const e of RB.tasks.kanaWordIndex().slice(0, 120)) {
    const st = RB.tasks.vocabStep(e.w + '|' + e.r, { recall: false });
    if (st && st.kind === 'choose' && st.options.length >= 2) gen.push(st);
  }
  t.ok(gen.length >= 40, 'generated meaning questions found (' + gen.length + ')');
  const authoredFirst = steps.filter((st) => st.options[0] && st.options[0].ok).length;
  t.log('authored with the right option written first: ' + authoredFirst + ' / ' + steps.length + '; generated: ' + gen.filter((st) => st.options[0].ok).length + ' / ' + gen.length);

  const label = (o) => o.en || o.jp || '';
  const all = steps.concat(gen);
  let asked = 0, first = 0, expect = 0, same = 0, stuck = 0, changed = 0, kept = 0;
  const pos4 = [0, 0, 0, 0];
  for (const st of all) {
    const before = JSON.stringify(st.options);
    const want = st.options.map(label).sort().join('|');
    const places = new Set();
    for (let c = 0; c < 12; c++) {
      setClock(c * 7 + 3);
      const shown = RB.challenge.choicesFor(st);
      const again = RB.challenge.choicesFor(st);
      if (shown.map(label).join('|') === again.map(label).join('|')) kept++;
      if (shown.map(label).sort().join('|') !== want || shown.filter((o) => o.ok).length !== st.options.filter((o) => o.ok).length) same++;
      const i = shown.findIndex((o) => o.ok);
      places.add(i);
      asked++;
      if (i === 0) first++;
      expect += 1 / shown.length;
      if (shown.length === 4) pos4[i]++;
    }
    if (JSON.stringify(st.options) !== before) changed++;
    if (st.options.length >= 2 && places.size < 2) stuck++;
  }
  t.ok(same === 0, 'the options shown are exactly the step\'s options, with the same right answer (' + same + ' differ)');
  t.ok(changed === 0, 'showing a step does not reorder the step itself (' + changed + ' changed)');
  t.ok(kept === asked, 'the order holds while a step is open (redrawn at the same moment: ' + kept + ' / ' + asked + ')');
  t.ok(stuck === 0, 'over twelve askings, the right option moves in every step (' + stuck + ' never move)');
  const share = first / asked;
  t.log('right option shown first: ' + (100 * share).toFixed(1) + '% of ' + asked + ' askings (chance ' + (100 * expect / asked).toFixed(1) + '%); 4-option places ' + pos4.join(' / '));
  t.ok(Math.abs(share - expect / asked) < 0.03, 'the right option is first about as often as chance (' + (100 * share).toFixed(1) + '%)');
  const n4 = pos4.reduce((a, b) => a + b, 0);
  t.ok(n4 > 1000 && pos4.every((k) => Math.abs(k / n4 - 0.25) < 0.03), 'with four options, each place holds the right one about a quarter of the time (' + pos4.join(' / ') + ')');

  // write steps answered in choice mode (authored choices, or distractors)
  const writes = [], seenW = new Set();
  (function walk(o, d) {
    if (!o || typeof o !== 'object' || d > 12 || seenW.has(o) || writes.length >= 240) return;
    seenW.add(o);
    if (o.kind === 'write' && typeof o.answer === 'string') writes.push(o);
    for (const k of Object.keys(o)) walk(o[k], d + 1);
  })(RB.content, 0);
  let wAsked = 0, wFirst = 0, wExpect = 0;
  for (const st of writes) {
    for (let c = 0; c < 8; c++) {
      setClock(c * 11 + 1);
      const shown = RB.challenge.choicesFor(st);
      wAsked++;
      if (shown[0] && shown[0].ok) wFirst++;
      wExpect += shown.filter((o) => o.ok).length / shown.length;
    }
  }
  t.ok(writes.length > 100, 'write steps found (' + writes.length + ')');
  t.ok(Math.abs(wFirst / wAsked - wExpect / wAsked) < 0.04, 'write steps in choice mode: an accepted answer is first about as often as chance (' + (100 * wFirst / wAsked).toFixed(1) + '% vs ' + (100 * wExpect / wAsked).toFixed(1) + '%)');
};
