// The Courier Who Never Arrived, at the hut on the pass (Agnes 6553382240; Local CL-588, CL-590, CL-592; Cloud CC-427,
// CC-428): his trigger holds only while his own scene is not running, so the retreat after the fade, which can still
// be inside the trigger, cannot start him again mid-step. On the real runner, the screen and the encounter stood in
// for (the encounter answers as asked, and records what the trigger reads while it is up):
//  1. the trigger: one, on cr.hut at x 13–16, y 12–13, its condition !cr_courier_done&!scene.cr.courier; Genta's own
//     talk runs the same scene, as before;
//  2. the fade (the trigger's own condition read throughout): before the scene it holds; while the encounter is up it does not; after the fade it holds again (a
//     later step there offers him again), and the retreat is two tiles left, as before;
//  3. while the scene runs, a copy of the journey (as the quest guide reads one) still holds it: the scene term reads
//     the live journey's runner only;
//  4. both wins (relayed, heard): cr_courier_done set, the condition false, no retreat, one autosave;
//  5. a flee and a loss: the scene ends there as before (no retreat, nothing set), and the condition holds again;
//  and no scene ended on an error from the runner.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const COND = '!cr_courier_done&!scene.cr.courier';
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };

  // what the trigger reads, from its own condition on the map (so a control on the old trigger reads the old one)
  const map = C.maps['cr.hut'];
  const trig = (map.triggers || []).filter((x) => x.scene === 'cr.courier');
  const holds = (s) => !!trig.length && S.test(s, trig[0].if);
  // the runner with the screen and the encounter stood in for
  let result = null, during = null, encs = 0, saves = 0;
  const moves = [], said = [];
  RB.ui.dialogue.say = async (l) => { if (l) said.push(l.en || ''); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.fade = async () => {};
  for (const k of ['dismissExtras', 'refreshActors', 'placeCompanion', 'ensureSpeaker']) RB.world[k] = () => {};
  RB.world.scriptMove = async (who, dir, n) => { moves.push([who, dir, n]); };
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => { saves++; };
  RB.game.startEncounter = async (id) => {
    const s = RB.game.s;
    encs++;
    during = { id, live: holds(s), copy: holds(JSON.parse(JSON.stringify(s))) };
    return result;
  };
  const fresh = () => {
    const s = S.newCampaign({ edition: 2 }); s.comp = 'nao'; s.map = 'cr.hut'; s.x = 14; s.y = 12;
    Object.assign(s.flags, { departed: true, cr_called: true, cr_hut_seen: true });
    RB.game.G.s = s; RB.game.s = s; return s;
  };
  const play = async (r) => {
    const s = fresh();
    result = r; during = null; encs = 0; saves = 0; moves.length = 0; said.length = 0;
    const before = holds(s);
    await RB.script.run('cr.courier');
    return { before, during, after: holds(s), done: !!s.flags.cr_courier_done, moves: moves.slice(), encs, saves, faded: said.some((x) => /fades into the snow/.test(x)) };
  };

  // 1. the trigger, and Genta's talk
  t.ok(trig.length === 1 && flat([trig[0].x, trig[0].y, trig[0].w, trig[0].h]) === flat([13, 12, 4, 2]) && trig[0].if === COND,
    '1 one trigger for the courier, on x 13–16, y 12–13, its condition ' + COND + ' ' + flat(trig));
  const genta = (map.npcs || []).find((n) => n.id === 'cr_genta');
  t.ok(genta && genta.talk === 'cr.courier' && genta.if === '!cr_courier_done' && genta.x === 15 && genta.y === 11, '1 Genta\'s own talk runs the same scene, as before ' + flat(genta));

  // 2–3. the fade
  {
    const r = await play({ result: 'end', outcome: 'fades' });
    t.ok(r.before && r.during && r.during.id === 'cr.courier' && r.during.live === false && r.after && !r.done,
      '2 before the scene it holds; while the encounter is up it does not; after the fade it holds again ' + flat(r));
    t.ok(flat(r.moves) === flat([['pc', 'left', 2]]) && r.faded && r.encs === 1 && r.saves === 0, '2 the fade: the courier fades, and the retreat is two tiles left, as before ' + flat({ moves: r.moves, faded: r.faded, saves: r.saves }));
    t.ok(r.during && r.during.copy === true, '3 while the scene runs, a copy of the journey (as the quest guide reads one) still holds it ' + flat(r.during));
  }

  // 4. both wins
  for (const outcome of ['relayed', 'heard']) {
    const r = await play({ result: 'win', outcome });
    t.ok(r.before && r.during && r.during.live === false && r.done && !r.after && !r.moves.length && r.saves === 1 && !r.faded,
      '4 a win (' + outcome + '): cr_courier_done set, the condition false, no retreat, one autosave ' + flat(r));
  }

  // 5. a flee and a loss
  for (const res of ['flee', 'lose']) {
    const r = await play({ result: res, outcome: null });
    t.ok(r.before && r.during && r.during.live === false && r.after && !r.done && !r.moves.length && !r.faded && r.saves === 0,
      '5 a ' + res + ': the scene ends there as before (no retreat, nothing set), and the condition holds again ' + flat(r));
  }

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
