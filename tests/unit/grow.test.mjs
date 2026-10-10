// The Grow route (expansion L18): one level up, offered, taught first, recorded as stretch, never changing the level;
// declining leaves no trace. Advanced grows by a task's own stretchA steps, never an invented level.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const s = RB.state.newCampaign({ profile: 'E' });
  s.learn.kanaKnown = 'both';
  RB.game.s = s;
  t.eq([RB.grow.next('F'), RB.grow.next('E'), RB.grow.next('I'), RB.grow.next('A')], ['E', 'I', 'A', 'A+'], 'one level up; Advanced has its own stretch');
  const ch = RB.content.challenges['ws.L7'];
  const st = RB.grow.stepsFor(ch, 'E');
  t.ok(st && st.length === 1 && st[0].id === 'ws.L7.I', 'an Elementary player is offered the Intermediate version');
  t.eq(RB.grow.stepsFor(ch, 'A'), null, 'Advanced: nothing invented above it (this task has no stretchA)');
  RB.test.enable({});
  const before = JSON.stringify(s.learn);
  const d = await RB.grow.offer('ws.L7', { accept: false });
  t.ok(d.declined && JSON.stringify(s.learn) === before, 'declining leaves no trace');
  const r = await RB.grow.offer('ws.L7', { accept: true });
  t.ok(r.ok && s.learn.profile === 'E', 'accepted and done; the level is unchanged');
  t.ok(!RB.test.problems.length, 'the stretch steps solve cleanly: ' + JSON.stringify(RB.test.problems));
  RB.test.disable();
};
