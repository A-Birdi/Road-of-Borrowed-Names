// The Chart Room's stove cold until the flame word lights it, sprite and light both (Agnes 6545405253, 6545601642;
// Local CL-556, CL-557; Cloud CC-399). On the real content and runner (no pixels here: tests/e2e/chart_stove.mjs
// draws them):
//  1. two placements on the one tile, the same scene: written as unlit (o.lit false) until sb_stove_lit, the plain one
//     after; exactly one of them there in either state; no other stove in the game is written as unlit;
//  2. the room's light: no light from the stove before, one after (the world's emitters), and the room's darkness as
//     before (0.4 cold, 0.2 lit); after a save's round trip, the same;
//  3. the scene, unchanged: first arrival, the cold narration; "Leave it" leaves it cold (and asked again, still cold);
//     "Light it" lights it, and the warmth (rest, checkpoint, autosave) as before; asked again, only the warmth;
//  4. a battle here (the moth): the stove among the place's nearby things written as unlit before lighting and plain
//     after, so the backdrop's glow (which skips o.lit false) follows; the lamps written as unlit elsewhere keep o.lit
//     false into a battle's composition too;
//  and no scene ended on an error from the runner.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, BP = RB.battlePlaces;
  const flat = (x) => JSON.stringify(x);

  let log = [], pick = 0, saves = 0;
  RB.ui.dialogue.say = async (o) => { log.push('say:' + (o && o.en)); };
  RB.ui.dialogue.choose = async () => pick;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.shake = () => {};
  RB.ui.fade = async () => {};
  for (const k of ['dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => { saves++; };
  RB.test.enable({ choose: () => pick });

  const camp = (lit) => {
    const s = S.newCampaign(); s.comp = 'nao'; s.map = 'sb.obs_charts'; s.x = 12; s.y = 3;
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, sb_storm: true, sb_morning: true, sb_obs_open: true, sb_stair_open: true }, lit ? { sb_stove_lit: true } : {});
    RB.game.G.s = s; RB.game.s = s;
    return s;
  };
  const errors = [];
  const run = async (scene) => {
    log = [];
    try { await RB.script.run(scene, {}); } catch (e) { errors.push(scene + ': ' + String((e && e.message) || e)); }
    return log.slice();
  };
  const stoves = (C.maps['sb.obs_charts'].props || []).filter((p) => p.p === 'stove');
  const active = (s) => stoves.filter((p) => !p.if || S.test(s, p.if));
  const M = RB.maps.compile('sb.obs_charts');
  const stoveLights = () => RB.worldLook.emitters(M).filter((e) => e.p.p === 'stove' && e.p.x === 13 && e.p.y === 2).length;
  const dark = () => C.maps['sb.obs_charts'].ambient.dark;

  // ---- 1. the placements
  {
    const cold = camp(false), lit = camp(true);
    const a = active(cold), b = active(lit);
    t.ok(stoves.length === 2 && stoves.every((p) => p.x === 13 && p.y === 2 && p.scene === 'sb.charts_stove')
      && a.length === 1 && a[0].o && a[0].o.lit === false && b.length === 1 && !(b[0].o && b[0].o.lit === false),
      '1 two placements on the one tile, the same scene: written as unlit before the stove is lit, plain after, one there in either state (' + flat({ cold: a.map((p) => p.o || null), lit: b.map((p) => p.o || null) }) + ')');
    const others = [];
    for (const id in C.maps) for (const p of C.maps[id].props || []) if (p.p === 'stove' && !(id === 'sb.obs_charts' && p.x === 13 && p.y === 2)) others.push(id + (p.o && p.o.lit === false ? ' UNLIT' : ''));
    t.ok(others.length > 0 && !others.some((x) => /UNLIT/.test(x)), '1 no other stove in the game is written as unlit, so each keeps its lit drawing (' + others.length + ' others)');
  }

  // ---- 2. the room's light and darkness, and a save's round trip
  {
    camp(false);
    const before = { lights: stoveLights(), dark: dark() };
    const s = camp(true);
    const after = { lights: stoveLights(), dark: dark() };
    const back = JSON.parse(JSON.stringify(s)); RB.game.G.s = back; RB.game.s = back;
    const reloaded = { lights: stoveLights(), dark: dark(), active: active(back).map((p) => p.o || null) };
    t.ok(before.lights === 0 && before.dark === 0.4 && after.lights === 1 && after.dark === 0.2 && flat(reloaded) === flat({ lights: 1, dark: 0.2, active: [null] }),
      '2 the stove gives no light before it is lit and one after, the room 0.4 then 0.2, the same after a save\'s round trip (' + flat({ before, after, reloaded }) + ')');
  }

  // ---- 3. the scene
  {
    const s = camp(false);
    pick = 1; saves = 0;
    const leave = await run('sb.charts_stove'), again = await run('sb.charts_stove');
    const coldNow = !s.flags.sb_stove_lit && active(s)[0].o && active(s)[0].o.lit === false;
    pick = 0;
    const light = await run('sb.charts_stove');
    const lit = { flag: !!s.flags.sb_stove_lit, saves, cp: s.checkpoint || s.flags.checkpoint || null };
    const warm = await run('sb.charts_stove');
    const cold = (l) => l.some((x) => /^say:A cold stove with some wood left inside/.test(x));
    const flare = (l) => l.some((x) => /the wood flares red/.test(x));
    const hands = (l) => l.some((x) => /You warm your hands at the stove/.test(x));
    t.ok(cold(leave) && !flare(leave) && !hands(leave) && cold(again) && coldNow, '3 first arrival: the cold narration; "Leave it" leaves it cold, and asked again it is still cold (' + flat({ leave: leave.length, again: again.length }) + ')');
    t.ok(cold(light) && flare(light) && hands(light) && lit.flag && lit.saves === 1 && !cold(warm) && !flare(warm) && hands(warm),
      '3 "Light it": the flare, then the warmth (and its autosave), the stove lit; asked again, only the warmth (' + flat({ lit, warm: warm.length }) + ')');
  }

  // ---- 4. a battle in the room, and the other lamps written as unlit
  {
    const placed = (mapId, f) => {
      const m = RB.maps.compile(mapId);
      const e = Object.assign({ id: f.enemy }, C.enemies[f.enemy] || {});
      e.where = { map: mapId, x: f.x, y: f.y };
      e.setting = RB.render.enclosed(m) ? 'indoor' : 'outdoor';
      e.bgKey = e.bg || e.region || 'reedwake';
      return e;
    };
    const flags = (o) => (cond) => S.test(Object.assign(S.newCampaign(), { flags: Object.assign({ departed: true }, o) }), cond);
    const stoveIn = (c) => (c.context || []).concat(c.structure || []).filter((it) => it.id === 'stove' && it.at === '13,2');
    const moth = placed('sb.obs_charts', { enemy: 'sb.moth', x: 5, y: 8 });
    const cb = stoveIn(BP.compose(moth, moth.where, 5, { test: flags({}) })), ca = stoveIn(BP.compose(moth, moth.where, 5, { test: flags({ sb_stove_lit: true }) }));
    t.ok(cb.length === 1 && cb[0].o && cb[0].o.lit === false && ca.length === 1 && !(ca[0].o && ca[0].o.lit === false),
      '4 a battle here: the stove among the place\'s nearby things, written as unlit before lighting and plain after (' + flat({ before: cb.map((x) => x.o), after: ca.map((x) => x.o) }) + ')');
  }

  t.ok(!errors.length, 'no scene ended on an error from the runner: ' + errors.join(' | '));
};
