// The Quest Guide answers the journey as it is now (LP-1 review): asked, then a flag or seen scene changes (set, set
// false, or deleted), then asked again in the same synchronous callback, the second answer is the changed journey's.
// LP-1 shares one copy of the live flags and seen scenes between the branches of an analysis; that copy must not
// outlive the analysis (a copy kept until a microtask gave the first answer again, and the cached `targets` kept it).
// The oracle is a fresh analysis of a separate copy of the changed journey; each case must change the answer, so a
// case cannot pass by being irrelevant. Fixtures: tests/fixtures/campaign/ (Chapter 4 and Chapter 11 of one journey).
import fs from 'node:fs';
import { load, root } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const G = RB.questGuide, J = JSON.stringify;
  const tick = () => new Promise((res) => setTimeout(res, 0));
  const CASES = {
    'F-ren-ch4_done': [['sb_snow', 'flags', 'postgame', 'set'], ['sb_snow', 'flags', 'sb_evening', 'false'], ['sb_snow', 'flags', 'sb_evening', 'delete'],
      ['sb_snow', 'seen', 'sb.sculpt_goat', 'set'], ['ren_ushio', 'seen', 'sa.gate_first', 'set']],
    'F-ren-yn_done': [['ren_ushio', 'seen', 'sa.ushio_grave', 'set'], ['ko_kihei', 'flags', 'ko_lowtide', 'false'], ['ko_kihei', 'flags', 'ko_lowtide', 'delete']],
  };
  let n = 0;
  for (const fx in CASES) {
    const s = RB.save.migrate(JSON.parse(fs.readFileSync(root + '/tests/fixtures/campaign/' + fx + '.json', 'utf8')));
    RB.game.s = s;
    for (const [q, where, k, how] of CASES[fx]) {
      const name = fx + ' ' + q + ': ' + where + '.' + k + ' ' + how;
      const had = Object.prototype.hasOwnProperty.call(s[where], k), was = s[where][k];
      t.ok(how === 'set' ? !was : !!was, name + ': the journey starts the other way');
      const change = (o) => { if (how === 'set') o[where][k] = true; else if (how === 'false') o[where][k] = false; else delete o[where][k]; };
      const undo = () => { if (had) s[where][k] = was; else delete s[where][k]; };
      const changed = JSON.parse(J(s)); change(changed);
      G.reset();
      const expect = J(G.analyse(q, changed)), nExpect = J(G.nudges(q, changed).lines);
      G.reset();
      // one synchronous run: ask, change, ask again (the analysis, the cached targets and the nudges)
      const before = J(G.analyse(q, s)), tb = J(G.targets(q, s)); G.nudges(q, s);
      change(s);
      const after = J(G.analyse(q, s)), ta = J(G.targets(q, s)), na = J(G.nudges(q, s).lines);
      t.ok(before !== expect, name + ': the change matters to the answer');
      t.eq(tb, before, name + ': targets before = the analysis');
      t.ok(after === expect, name + ': asked again in the same callback, the analysis sees the change');
      t.ok(ta === expect, name + ': and so do the cached targets');
      t.ok(na === nExpect, name + ': and the nudges');
      await tick();
      t.ok(J(G.targets(q, s)) === expect, name + ': and in a later task (the cached targets were not kept stale)');
      undo(); G.reset();
      n++;
    }
  }
  t.log('quest guide, a changed journey asked again in one callback: ' + n + ' cases');
};
