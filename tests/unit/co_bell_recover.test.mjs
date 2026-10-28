// The Bell Without a Rope (Agnes 6457243012; Local CL-513; Cloud CC-367): Gorō's talk list put his after-chapter and
// postgame lines ahead of his own scene, so a bell quest still open after Chapter 3 could never be finished (his scene's
// restored branch, which thanks you, finishes the quest and takes back a leftover rope, was never reached), and the
// guide had nothing to mark. In node:
//  1. his talk: his own scene while the quest is open, in any chapter; otherwise as before (in Chapter 3, after it, in
//     the postgame; never taken or done); his routine places (the inn, the top terrace) hold the same list;
//  2. the guide: within Chapter 3 as before; once the story is over, Gorō, wherever his routine has him;
//  3. with the real runner: after Chapter 3 and in the postgame, either stage, rope held or not: his thanks, the quest
//     done once, a leftover rope taken once, then his ordinary talk again; within Chapter 3, the hand-in as before;
//  4. at a routine place, through its own first line (the usual_talk hook): the same thanks, the quest done.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, G = RB.questGuide, test = S.test;
  const base = C.maps['co.village'].npcs.find((n) => n.id === 'co_goro' && Array.isArray(n.talk));
  const inn = C.maps['co.inn'].npcs.find((n) => n.id === 'co_goro_r2'), top = C.maps['co.terraces'].npcs.find((n) => n.id === 'co_goro_r3');
  const IN = { departed: true, ch1_done: true, ch2_done: true, co_arrived: true };
  const AFTER = Object.assign({}, IN, { co_restored: true, ch3_done: true });
  const POST = Object.assign({}, AFTER, { postgame: true });
  const journey = (flags, quest, rope, slot) => {
    const s = S.newCampaign({ edition: 2 }); s.comp = 'ren'; s.map = 'co.village'; s.x = 12; s.y = 15;
    Object.assign(s.flags, flags || {});
    if (s.flags.ch3_done) s.quests.co_main = { stage: 9, done: true, t: 1 };
    if (quest) { s.quests.co_bell = Object.assign({}, quest); s.seen['co.goro_first'] = true; } // (he offered it at their first meeting)
    if (rope) s.inv.co_rope = 1;
    s.world = { towns: { cinder: { tick: 1, slots: { co_goro: slot || 1 }, leftAt: null, flags: {}, rests: 0 } } };
    RB.game.G.s = s; RB.game.s = s;
    return s;
  };
  const st0 = { stage: 0, done: false, t: 1 }, st1 = { stage: 1, done: false, t: 1 }, done = { stage: 1, done: true, t: 2 };
  const talk = (s) => (base.talk.find((o) => !o.if || test(s, o.if)) || {}).scene;
  const where = (e) => e.map + ':' + e.kind + ':' + (e.id || e.p);

  // ---- 1. his talk
  t.ok(inn && top && inn.talk === base.talk && top.talk === base.talk, '1 the inn and the top terrace hold his square list itself');
  t.eq([
    talk(journey(IN, null)), talk(journey(IN, st0)), talk(journey(IN, st1, 1)), talk(journey(IN, st1)),
    talk(journey(AFTER, st0)), talk(journey(AFTER, st1, 1)), talk(journey(AFTER, st1)), talk(journey(POST, st0)), talk(journey(POST, st1, 1)),
    talk(journey(AFTER, null)), talk(journey(AFTER, done)), talk(journey(POST, null)), talk(journey(POST, done)),
  ], ['co.goro', 'co.goro', 'co.goro', 'co.goro', 'co.goro', 'co.goro', 'co.goro', 'co.goro', 'co.goro', 'co.goro_after', 'co.goro_after', 'co.goro_post', 'co.goro_post'],
  '1 Gorō: his own scene while the quest is open, in any chapter; never taken or done, as before');

  // ---- 2. the guide (its cache reset for each state)
  const rows = [];
  for (const [label, flags, q, rope, slot] of [['in Chapter 3, stage 0', IN, st0, 0, 1], ['in Chapter 3, stage 1, rope', IN, st1, 1, 1],
    ['after Chapter 3, stage 0, the square', AFTER, st0, 0, 1], ['after Chapter 3, stage 1, rope, the inn', AFTER, st1, 1, 2],
    ['after Chapter 3, stage 1, no rope, the top terrace', AFTER, st1, 0, 3], ['postgame, stage 1, rope, the inn', POST, st1, 1, 2]]) {
    G.reset();
    const s = journey(flags, q, rope, slot);
    rows.push(label + ': ' + G.targets('co_bell', s).targets.map(where).join(', '));
  }
  t.eq(rows, ['in Chapter 3, stage 0: co.village:npc:co_tamotsu', 'in Chapter 3, stage 1, rope: co.village:npc:co_goro',
    'after Chapter 3, stage 0, the square: co.village:npc:co_goro', 'after Chapter 3, stage 1, rope, the inn: co.inn:npc:co_goro_r2',
    'after Chapter 3, stage 1, no rope, the top terrace: co.terraces:npc:co_goro_r3', 'postgame, stage 1, rope, the inn: co.inn:npc:co_goro_r2'],
  '2 the guide: within Chapter 3 as before; once the story is over, Gorō wherever he is');

  // ---- 3. the real runner
  const said = [], toasts = [];
  RB.ui.dialogue.say = async (l) => { said.push(l.en); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async (o) => { toasts.push(o.kind + ':' + o.en); };
  RB.ui.shake = () => {}; // (the hand-in's bell shakes the screen: no page here)
  for (const k of ['dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  const THANKS = /you were the first to take my asking seriously/;
  const DONE = 'quest_done:The Bell Without a Rope';
  for (const [label, flags, q, rope, again] of [['after Chapter 3, stage 0', AFTER, st0, 0, 'co.goro_after'], ['after Chapter 3, stage 1, rope held', AFTER, st1, 1, 'co.goro_after'],
    ['after Chapter 3, stage 1, no rope', AFTER, st1, 0, 'co.goro_after'], ['postgame, stage 0', POST, st0, 0, 'co.goro_post'], ['postgame, stage 1, rope held', POST, st1, 1, 'co.goro_post']]) {
    const s = journey(flags, q, rope);
    said.length = 0; toasts.length = 0;
    await RB.script.run(talk(s));
    const first = said.slice(), next = talk(s);
    await RB.script.run(next);
    t.ok(s.quests.co_bell.done && (s.inv.co_rope || 0) === 0 && first.some((l) => THANKS.test(l)) && said.filter((l) => THANKS.test(l)).length === 1 &&
      toasts.filter((x) => x === DONE).length === 1 && next === again,
    '3 ' + label + ': his thanks, the quest done once, no rope left, then ' + again + ' (' + JSON.stringify({ q: s.quests.co_bell, rope: s.inv.co_rope || 0, toasts, next, first }) + ')');
  }
  {
    // within Chapter 3, before the restoration: the hand-in, as before (the bell rings; done once; the rope taken)
    const s = journey(IN, st1, 1);
    said.length = 0; toasts.length = 0;
    await RB.script.run(talk(s));
    const next = talk(s);
    await RB.script.run(next);
    t.ok(s.quests.co_bell.done && s.flags.co_bell_done && s.flags.co_bell_rung && (s.inv.co_rope || 0) === 0 && said.some((l) => /Oh — a rope!/.test(l)) &&
      !said.some((l) => THANKS.test(l)) && toasts.filter((x) => x === DONE).length === 1 && next === 'co.goro',
    '3 within Chapter 3, rope held: the hand-in as before (' + JSON.stringify({ q: s.quests.co_bell, rope: s.inv.co_rope || 0, toasts }) + ')');
  }

  // ---- 4. at a routine place: its own first line, then his talk (src/engine/53_town.js, the usual_talk hook)
  for (const [label, n, sc, line] of [['the inn', inn, 'co.lw_sl_co_goro_r2', /Fusa's tea is always too hot/], ['the top terrace', top, 'co.lw_sl_co_goro_r3', /you can see the whole village/]]) {
    const s = journey(AFTER, st1, 1, n === inn ? 2 : 3);
    RB.world.W = { npcs: [{ id: n.id, def: n }] };
    said.length = 0; toasts.length = 0;
    await RB.script.run(sc, { npc: n.id });
    t.ok(s.quests.co_bell.done && (s.inv.co_rope || 0) === 0 && line.test(said[0] || '') && said.some((l) => THANKS.test(l)) && toasts.filter((x) => x === DONE).length === 1,
      '4 ' + label + ': its own line, then his thanks; the quest done, the rope taken (' + JSON.stringify({ q: s.quests.co_bell, said }) + ')');
  }
};
