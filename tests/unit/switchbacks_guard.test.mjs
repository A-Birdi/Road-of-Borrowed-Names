// The Switchbacks' retaining log (Agnes 6552850704; Local CL-586; Cloud CC-424): its trigger holds only while its own
// scene is not running, so "Leave it as it is", which steps you back through the trigger, cannot start it again. On the
// real runner, the screen stood in for:
//  1. the trigger: one, on cr.pass1 at x 22–23, y 22–23, its condition cr_slide_seen&!cr_turn_cleared&!scene.cr.pass1_clear;
//  2. (the trigger's own condition read throughout) before the scene it holds; while the scene runs (at its own menu) it does not; after "Leave it as it is" it holds
//     again, so a later step back in offers it; after "Lever the log free" it does not;
//  3. while the scene runs, a copy of the journey (as the quest guide reads one) still holds it: the scene term reads
//     the live journey's runner only;
//  4. the scene as it was: "Leave it as it is" steps you back two tiles, "Lever the log free" sets cr_turn_cleared;
//  and no scene ended on an error from the runner.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const COND = 'cr_slide_seen&!cr_turn_cleared&!scene.cr.pass1_clear';
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };

  // what the trigger reads, from its own condition on the map (so a control on the old trigger reads the old one)
  const trig = (C.maps['cr.pass1'].triggers || []).filter((x) => x.scene === 'cr.pass1_clear');
  const holds = (s) => !!trig.length && S.test(s, trig[0].if);
  // the runner with the screen stood in for; the menu answers as asked and records what the trigger reads then
  let pick = 'leave', atMenu = null;
  const moves = [];
  RB.ui.dialogue.say = async () => {};
  RB.ui.dialogue.choose = async (opts) => {
    const s = RB.game.s;
    atMenu = { live: holds(s), copy: holds(JSON.parse(JSON.stringify(s))) };
    const i = opts.findIndex((o) => (pick === 'lever' ? /Lever/ : /Leave/).test(o.en || ''));
    return i < 0 ? 0 : i;
  };
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.fade = async () => {};
  for (const k of ['dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.scriptMove = async (who, dir, n) => { moves.push([who, dir, n]); };
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  const fresh = () => {
    const s = S.newCampaign({ edition: 2 }); s.comp = 'nao'; s.map = 'cr.pass1'; s.x = 23; s.y = 22;
    Object.assign(s.flags, { departed: true, cr_called: true, cr_slide_seen: true });
    RB.game.G.s = s; RB.game.s = s; return s;
  };

  // 1. the trigger
  t.ok(trig.length === 1 && flat([trig[0].x, trig[0].y, trig[0].w, trig[0].h]) === flat([22, 22, 2, 2]) && trig[0].if === COND,
    '1 one trigger for the scene, on x 22–23, y 22–23, its condition ' + COND + ' ' + flat(trig));

  // 2–4. before, during, after
  {
    const s = fresh();
    const before = holds(s);
    pick = 'leave'; moves.length = 0; atMenu = null;
    await RB.script.run('cr.pass1_clear');
    const during = atMenu, afterLeave = holds(s), leaveMoves = moves.slice();
    pick = 'lever'; moves.length = 0; atMenu = null;
    await RB.script.run('cr.pass1_clear');
    const afterLever = holds(s);
    t.ok(before && during && during.live === false && afterLeave && s.flags.cr_turn_cleared && !afterLever,
      '2 before the scene it holds; at the scene\'s own menu it does not; after "Leave it as it is" it holds again; after "Lever the log free" it does not ' + flat({ before, during, afterLeave, afterLever }));
    t.ok(during && during.copy === true, '3 while the scene runs, a copy of the journey (as the quest guide reads one) still holds it ' + flat(during));
    t.ok(flat(leaveMoves) === flat([['pc', 'left', 2]]), '4 "Leave it as it is" steps you back two tiles, and "Lever the log free" sets cr_turn_cleared, as before ' + flat(leaveMoves));
  }

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
