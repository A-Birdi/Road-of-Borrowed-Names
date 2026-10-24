// RBN-QA-176 (Agnes 6381764389, 6381966861; Local CL-282, CL-283): Ashihara's two quarrels were narrated as if both
// people stood together at the sluice or outside the forge, wherever their routines had put them; the forge's working
// hours went up on a freestanding sign, not on its door; the villagers' gathering was told with nothing on screen to say
// time had passed; and "Say back what both are afraid of", which calms one person a use, said nothing of the other. In
// Chromium on the built game, with throwaway journeys (the encounters stubbed to their outcome; their own play is
// tests/e2e/social_battle.mjs):
//  1. the tag: with the hours agreed it hangs on the forge door, on the wall beside it (14,7), read from (14,8) ("A tag
//     hangs on the forge door"); the door (13,7) from (13,8) says its own line; the freestanding sign at (16,8) is gone;
//     collision on the map as on the base build but for (16,8), which the sign no longer blocks (digest below);
//  2. each quarrel, started by either party in each of their routine places (Local's farthest pair among them: Taki at
//     the reeds, Yoshizō in his paddy): the other walks up to you before anything is said (within 8 s); the intro
//     ("arguing over the sluice"; "Natsu stands facing Shō") is said only when both are there, every line then spoken by
//     someone beside you; from too far to arrive in time, no intro and their lines from where they stand; the near
//     pairs arrive; at "Natsu stands facing Shō", each faces the other, from either starter, and nothing staged is left
//     after the scene toward the other (Agnes 6384074869); with Natsu brought up two tiles from you (a fixture), where
//     facing you and facing each other differ, each faces the other;
//  3. a walk that cannot arrive (every tile near you taken): no intro, the away party's lines marked as said from off
//     screen, and the quarrel still settles;
//  4. the gathering, in both orders: the screen goes dark for the narration and Mitsue's line and comes back up with the
//     meeting house built; no map change, no move, the town's routine not moved on; with Skip seen it is not dark; a
//     load made while it is dark leaves nothing dark or open;
//  5. "Say back": heard first while the other still waits, the words say the other is still waiting (both encounters);
//  6. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/ashihara_quarrels.mjs
import { serve, launch, page } from './lib.mjs';

const BASE = { digest: 415207392 }; // the collision digest (but for (16,8)), measured on the base build, CC-022's (see 1.)
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const J = JSON.stringify;
const DONE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true,
  as_streets: true, as_nt_water: true, as_nt_market: true };

// a journey in the village in the quarrels' part, the residents in the slots given, you at (x, y)
async function begin(p, x, y, dir, o) {
  await p.evaluate(async ([x, y, dir, o, done]) => {
    const s = RB.game.debugStart('as.village', x, y, { edition: RB.edition.forNew(), comp: null, flags: Object.assign({}, done, o.flags || {}), dir });
    s.quests.as_main = { stage: o.stage == null ? 2 : o.stage, done: false, t: 0 };
    Object.assign(s.vars, { as_wash: o.wash || 'stream', as_market: 'board' }, o.vars || {});
    RB.town.rec(s); s.world.towns.ashihara = { tick: 1, slots: o.slots || {}, leftAt: null, flags: {}, rests: 0 };
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.skipSeen = !!o.skip; RB.save.autosave = async () => {};
    RB.world.W.quietUntil = 1e15;
    RB.world.refreshActors();
    // the encounters, stubbed to their outcome (what their conclusion sets, as it ends)
    RB.game.startEncounter = async (id) => {
      const s2 = RB.game.s;
      if (id === 'as.water') { s2.flags.as_rota_time = true; return { result: 'win', outcome: 'time' }; }
      if (id === 'as.noise') { s2.flags.as_forge_hours = true; return { result: 'win', outcome: 'hours' }; }
      return { result: 'lose' };
    };
    // every line said: who, its English, where its speaker stood, whether it was marked as said from off screen; and
    // where Natsu and Shō stand and the way each is drawn facing (a staged look, else their own)
    const face = () => Object.fromEntries(['as_natsu', 'as_sho'].map((id) => { const W = RB.world.W, n = W.npcs.find((q) => q.id === id); if (!n) return [id, null]; const f = RB.staging.frameOf(n), lk = n.stg && n.stg.look, t = lk && lk.target; return [id, { at: [n.x, n.y], dir: (f && f.dir) || n.dir, staged: !!(f && f.dir), lookAt: !lk ? null : t === W.player ? 'pc' : (t && t.id) || '?' }]; }));
    window.__face = face;
    window.__said = [];
    const say0 = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) {
      const W = RB.world.W, who = l && l.who, n = who && W.npcs.find((q) => q.id === who);
      window.__said.push({ who, en: String((l && l.en) || '').slice(0, 70), at: n ? [n.x, n.y] : null, pc: [W.player.x, W.player.y], away: who && RB.staging.unarrivedAway ? RB.staging.unarrivedAway(who) : null,
        dark: !!document.querySelector('#overlay > .fade.on'), face: face() });
      return say0.apply(this, arguments);
    };
    let quiet = 0;
    for (let i = 0; i < 200 && quiet < 8; i++) {
      if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true);
      quiet = RB.ui.dialogue.isOpen() || RB.script.isRunning() ? 0 : quiet + 1;
      await new Promise((r) => setTimeout(r, 40));
    }
    window.__said = [];
  }, [x, y, dir, o, DONE]);
}
// talk to a resident (the scene their talk runs), and read on with Next until the world is back
const talk = (p, id, o) => p.evaluate(async ([id, o]) => {
  const run = RB.script.run('as.' + id.slice(3), { npc: id });
  const t0 = Date.now();
  for (let i = 0; i < 1200; i++) {
    if (o && o.at && !window.__hit && window.__said.some((l) => o.at.test(l.en))) { window.__hit = true; await o.at.fn(); }
    if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true);
    if (!RB.script.isRunning() && !RB.ui.dialogue.isOpen() && Date.now() - t0 > 400) break;
    await new Promise((r) => setTimeout(r, 40));
  }
  await Promise.race([run, new Promise((r) => setTimeout(r, 2000))]);
  return window.__said.slice();
}, [id, o || null]);
const near = (l) => l.at && Math.max(Math.abs(l.at[0] - l.pc[0]), Math.abs(l.at[1] - l.pc[1])) <= 2;
// the way one stands facing another, by the game's own rule (src/engine/52_staging.js dirTo: the longer axis; a diagonal
// above, sideways, so that the face stays seen)
const toward = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1]; if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left'; if (Math.abs(dx) === Math.abs(dy) && dy < 0) return dx > 0 ? 'right' : 'left'; return dy > 0 ? 'down' : 'up'; };
// at "Natsu stands facing Shō": each faces the other
const facingAt = (said) => { const l = said.find((x) => /^Natsu stands facing Shō/.test(x.en)); const F = l && l.face; return { said: !!l, F: F || null, pc: l ? l.pc : null, ok: !!(F && F.as_natsu && F.as_sho && F.as_natsu.dir === toward(F.as_natsu.at, F.as_sho.at) && F.as_sho.dir === toward(F.as_sho.at, F.as_natsu.at)) }; };

const { p, ctx, errors } = await page(b, url, { viewport: { width: 1188, height: 848 } });

// ---- 1. the tag on the forge door; collision ---------------------------------------------------------------------------
{
  const readings = {};
  for (const [x, label] of [[14, 'tag'], [13, 'door']]) {
    await begin(p, x, 8, 'up', { stage: 2, flags: { as_dp_water: true, as_dp_noise: true, as_rota_time: true, as_forge_hours: true }, vars: { as_rota: 'time', as_forge: 'hours' } });
    readings[label] = await p.evaluate(async () => {
      window.__said = [];
      RB.world.interact();
      for (let i = 0; i < 100; i++) { await new Promise((r) => setTimeout(r, 40)); if (RB.ui.dialogue.isOpen()) break; }
      const line = RB.ui.dialogue.isOpen() ? RB.ui.dialogue.shown().en : null;
      for (let i = 0; i < 50 && (RB.ui.dialogue.isOpen() || RB.script.isRunning()); i++) { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 40)); }
      return line;
    });
  }
  const M = await p.evaluate(() => {
    const W = RB.world.W, m = W.map, shown = (q) => !q.if || RB.state.test(RB.game.s, q.if);
    const tag = m.props.filter((q) => q.p === 'as_forgetag' && shown(q)).map((q) => [q.x, q.y, q.scene]);
    const sign = m.props.filter((q) => q.p === 'sign' && q.x === 16 && q.y === 8 && shown(q)).length;
    // collision with nobody about: every tile, solid or not, folded into one digest (but (16,8), reported apart)
    const keep = [W.npcs, W.extras, W.comp];
    W.npcs = []; W.extras = []; W.comp = null;
    let h = 7;
    const w = m.w || (m.terrain && m.terrain[0] && m.terrain[0].length) || 40, hh = m.h || (m.terrain && m.terrain.length) || 30;
    let s168 = null, s147 = null;
    for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) {
      if (x === W.player.x && y === W.player.y) continue;
      const solid = !!RB.world.blocked(x, y, { ignorePlayer: true });
      if (x === 16 && y === 8) { s168 = solid; continue; }
      if (x === 14 && y === 7) s147 = solid;
      h = (h * 31 + (solid ? 3 : 1) + x * 7 + y * 13) | 0;
    }
    [W.npcs, W.extras, W.comp] = keep;
    return { tag, sign, digest: h, s168, s147 };
  });
  console.log('     (collision digest but for (16,8): ' + M.digest + ')');
  ok(J(M.tag) === J([[14, 7, 'as.forge_hours']]) && M.sign === 0, 'the hours agreed: the tag on the forge door\'s wall (14,7), the freestanding sign at (16,8) gone (' + J(M) + ')');
  ok(/^A tag hangs on the forge door/.test(readings.tag || '') && /^The forge\. It smells of charcoal/.test(readings.door || ''), 'read from (14,8): the tag; from (13,8): the forge door\'s own line (' + J(readings) + ')');
  ok(M.s147 === true && M.s168 === false && (BASE.digest ? M.digest === BASE.digest : true), 'collision as on the base build but for (16,8), now free; the wall tile (14,7) solid as before (' + J({ digest: M.digest, base: BASE.digest, s168: M.s168, s147: M.s147 }) + ')');
}

// ---- 2. each quarrel, from either starter, in each of their places ---------------------------------------------------------
// Whoever comes up walks (Natsu carries her baby; nobody runs to a quarrel: Agnes 6383011149), with an 8-second bound:
// near enough, they arrive and the intro is said with both beside you; from too far, the walk ends where it has got to,
// and then there is no intro and their lines are said from where they stand (marked off screen when they are). Either
// way it is told as it stands. [starter, you at, facing, slots, wash, what the case is, near enough to arrive]
const told = (said, pair, intro) => {
  const i = said.findIndex((l) => intro.test(l.en)), spoken = said.filter((l) => pair.includes(l.who));
  const both = spoken.length >= 2 && spoken.every(near);
  return { both, intro: i, fine: both ? i === 0 && spoken.every((l) => !l.away) : i < 0 && spoken.some((l) => !near(l)) };
};
const WATER = [
  ['as_yoshizo', [27, 5], 'up', { as_yoshizo: 1, as_taki: 1 }, 'stream', 'Yoshizō in his paddy, Taki in hers', true],
  ['as_taki', [27, 13], 'down', { as_yoshizo: 2, as_taki: 1 }, 'stream', 'Taki in her paddy, Yoshizō at the bridge', true],
  ['as_taki', [12, 16], 'down', { as_yoshizo: 1, as_taki: 2 }, 'stream', 'Taki at the stream, Yoshizō in his paddy', false],
  ['as_taki', [8, 17], 'left', { as_yoshizo: 1, as_taki: 2 }, 'reeds', 'Taki at the reeds, Yoshizō in his paddy (the farthest pair)', false],
  ['as_yoshizo', [23, 11], 'down', { as_yoshizo: 2, as_taki: 2 }, 'reeds', 'Yoshizō at the bridge, Taki at the reeds', false],
];
for (const [who, at, dir, slots, wash, what, close] of WATER) {
  await begin(p, at[0], at[1], dir, { slots, wash });
  const said = await talk(p, who);
  const T = told(said, ['as_yoshizo', 'as_taki'], /arguing over the sluice/);
  ok(T.fine && (!close || T.both) && !said.some((l) => /arguing at the sluice/.test(l.en)) && (await p.evaluate(() => !!RB.game.s.flags.as_dp_water)),
    'the water, ' + what + ', started by ' + who + ': the other walks up first; ' + (T.both ? 'both there: "arguing over the sluice", every line from beside you' : 'not there in time: no intro, their lines from where they stand') + '; settled (' + J(said.slice(0, 3).map((l) => [l.who, l.en.slice(0, 30), l.at, l.pc, l.away])) + ')');
}
const NOISE = [
  ['as_sho', [13, 9], 'up', { as_sho: 1, as_natsu: 1 }, 'stream', 'Shō at the forge, Natsu at her door', true],
  ['as_natsu', [16, 16], 'down', { as_sho: 1, as_natsu: 2 }, 'stream', 'Natsu at the stream, Shō at the forge', true],
  ['as_natsu', [4, 17], 'left', { as_sho: 1, as_natsu: 2 }, 'reeds', 'Natsu at the reeds, Shō at the forge', false],
  ['as_sho', [13, 9], 'up', { as_sho: 1, as_natsu: 2 }, 'reeds', 'Shō at the forge, Natsu at the reeds', false],
];
for (const [who, at, dir, slots, wash, what, close] of NOISE) {
  // (Mitsue out at the paddies, off the way from the reeds to the forge: someone standing in it stops a walk where it is,
  // as any walk-up does, RBN-QA-108; that path is 3. below)
  await begin(p, at[0], at[1], dir, { slots: Object.assign({ as_mitsue: 2 }, slots), wash, flags: { as_dp_water: true, as_rota_time: true }, vars: { as_rota: 'time' } });
  const said = await talk(p, who);
  const T = told(said, ['as_sho', 'as_natsu'], /^Natsu stands facing Shō/);
  // at the intro, each faces the other; after the scene, no staged facing is left on either
  const FA = facingAt(said);
  const after = await p.evaluate(() => window.__face());
  const left = Object.values(after).some((x) => x && /^as_(natsu|sho)$/.test(x.lookAt || ''));
  ok((FA.ok || !FA.said) && !left && (!close || FA.said), 'the forge\'s noise, ' + what + ', started by ' + who + ': at "Natsu stands facing Shō" each faces the other; no look toward the other left after the scene (' + J({ at: FA.F, after }) + ')');
  ok(T.fine && (!close || T.both) && !said.some((l) => /Outside the forge/.test(l.en)) && (await p.evaluate(() => !!RB.game.s.flags.as_dp_noise)),
    'the forge\'s noise, ' + what + ', started by ' + who + ': the other walks up first; ' + (T.both ? 'both there: "Natsu stands facing Shō", every line from beside you' : 'not there in time: no intro, their lines from where they stand') + ' (no "Outside the forge"); settled (' + J(said.slice(0, 3).map((l) => [l.who, l.en.slice(0, 30), l.at, l.pc, l.away])) + ')');
}

// ---- 2b. where facing you and facing each other differ: Natsu brought up two tiles from you, Shō beside you ----------------
{
  await begin(p, 13, 9, 'up', { slots: { as_mitsue: 2, as_sho: 1, as_natsu: 1 }, wash: 'stream', flags: { as_dp_water: true, as_rota_time: true }, vars: { as_rota: 'time' } });
  // (a fixture: every free tile within 2 of you taken by a crate but (11,9), two to your left: beside you, facing you
  // and facing each other are the same by the game's rule; from two away they are not)
  await p.evaluate(() => {
    const W = RB.world.W, p0 = W.player;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const x = p0.x + dx, y = p0.y + dy;
      if ((!dx && !dy) || (x === 11 && y === 9) || W.npcs.some((n) => n.x === x && n.y === y) || RB.world.blocked(x, y, { ignorePlayer: true })) continue;
      W.map.props.push({ p: 'crate', x, y, if: 'departed', __fixture: true });
    }
  });
  const said = await talk(p, 'as_sho');
  const FA = facingAt(said);
  // (here facing each other is not facing you: the case tells the two apart)
  const apart = FA.F && FA.pc && (toward(FA.F.as_sho.at, FA.F.as_natsu.at) !== toward(FA.F.as_sho.at, FA.pc) || toward(FA.F.as_natsu.at, FA.F.as_sho.at) !== toward(FA.F.as_natsu.at, FA.pc));
  ok(FA.said && apart && FA.ok, 'Natsu brought up two tiles from you, Shō beside you: at "Natsu stands facing Shō" each faces the other, not you (' + J({ at: FA.F, you: FA.pc }) + ')');
  await p.evaluate(() => { const m = RB.world.W.map; m.props = m.props.filter((q) => !q.__fixture); });
}

// ---- 3. a walk that cannot arrive --------------------------------------------------------------------------------------------
{
  // (Taki at the reeds, far across the village from Yoshizō's paddy, so that what she says is said from off screen)
  await begin(p, 27, 5, 'up', { slots: { as_yoshizo: 1, as_taki: 2 }, wash: 'reeds' });
  // (a fixture: every free tile within 2 of you taken by a crate, but the starter's own)
  await p.evaluate(() => {
    const W = RB.world.W, p0 = W.player;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const x = p0.x + dx, y = p0.y + dy;
      if ((!dx && !dy) || W.npcs.some((n) => n.x === x && n.y === y) || RB.world.blocked(x, y, { ignorePlayer: true })) continue;
      W.map.props.push({ p: 'crate', x, y, if: 'departed', __fixture: true });
    }
  });
  const said = await talk(p, 'as_yoshizo');
  const taki = said.filter((l) => l.who === 'as_taki');
  ok(!said.some((l) => /arguing (over|at) the sluice/.test(l.en)) && taki.length > 0 && taki.every((l) => l.away) && (await p.evaluate(() => !!RB.game.s.flags.as_dp_water)),
    'Taki cannot come up from the reeds (every tile near you taken): no intro, her lines marked as said from off screen, and it still settles (' + J(taki.map((l) => [l.en.slice(0, 30), l.at, l.away])) + ')');
  await p.evaluate(() => { const m = RB.world.W.map; m.props = m.props.filter((q) => !q.__fixture); });
}

// ---- 4. the gathering, in both orders -------------------------------------------------------------------------------------
const gather = async (firstDone, starter, at, dir, o) => {
  const flags = firstDone === 'water' ? { as_dp_water: true, as_rota_time: true } : { as_dp_noise: true, as_forge_hours: true };
  const vars = firstDone === 'water' ? { as_rota: 'time' } : { as_forge: 'hours' };
  await begin(p, at[0], at[1], dir, { slots: { as_yoshizo: 1, as_taki: 1, as_sho: 1, as_natsu: 1, as_mitsue: 1 }, flags, vars, skip: o && o.skip });
  if (o && o.seen) await p.evaluate(() => { const s = RB.game.s; s.seen = s.seen || {}; for (const id of ['as.quarrels_done', 'as.water_talk', 'as.noise_talk', 'as.yoshizo', 'as.sho']) s.seen[id] = true; });
  const before = await p.evaluate(() => ({ map: RB.world.W.map.id || RB.game.s.map, at: [RB.world.W.player.x, RB.world.W.player.y], tick: RB.game.s.world.towns.ashihara.tick }));
  const said = await talk(p, starter);
  const after = await p.evaluate(() => ({ map: RB.world.W.map.id || RB.game.s.map, at: [RB.world.W.player.x, RB.world.W.player.y], tick: RB.game.s.world.towns.ashihara.tick, hall: !!RB.game.s.flags.as_hall,
    dark: !!document.querySelector('#overlay > .fade.on') }));
  return { said, before, after };
};
for (const [firstDone, starter, at, dir] of [['water', 'as_sho', [13, 9], 'up'], ['noise', 'as_yoshizo', [27, 5], 'up']]) {
  const R = await gather(firstDone, starter, at, dir);
  const g = R.said.findIndex((l) => /the villagers gather/.test(l.en)), m = R.said.findIndex((l) => l.who === 'as_mitsue');
  ok(g >= 0 && m > g && R.said[g].dark && R.said[m].dark && !R.after.dark && R.after.hall && J(R.before.at) === J(R.after.at) && R.before.map === R.after.map && R.before.tick === R.after.tick,
    'the gathering, the ' + firstDone + ' settled first: the narration and Mitsue\'s line over a dark screen, then back up with the meeting house built; no map change, no move, the routine not moved on (' + J({ g: R.said[g] && [R.said[g].dark], m: R.said[m] && [R.said[m].who, R.said[m].dark], before: R.before, after: R.after }) + ')');
}
{
  const R = await gather('water', 'as_sho', [13, 9], 'up', { skip: true, seen: true });
  ok(R.after.hall && !R.after.dark && J(R.before.at) === J(R.after.at), 'with Skip seen: the meeting house built, nothing left dark, you where you were (' + J(R.after) + ')');
}
{
  // a load made while it is dark
  await begin(p, 13, 9, 'up', { slots: { as_sho: 1, as_natsu: 1 }, flags: { as_dp_water: true, as_rota_time: true }, vars: { as_rota: 'time' } });
  await p.evaluate(async () => { await RB.save.manualSave(1); });
  const R = await p.evaluate(async () => {
    window.__said = [];
    RB.script.run('as.sho', { npc: 'as_sho' });
    let loaded = null;
    for (let i = 0; i < 600; i++) {
      if (!loaded && window.__said.some((l) => /the villagers gather/.test(l.en))) { loaded = await RB.game.loadCampaign(1, 'manual'); continue; }
      if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true);
      if (loaded && !RB.script.isRunning() && !RB.ui.dialogue.isOpen()) break;
      await new Promise((r) => setTimeout(r, 40));
    }
    await new Promise((r) => setTimeout(r, 800));
    return { loaded: !!loaded, dark: !!document.querySelector('#overlay > .fade.on'), open: RB.ui.dialogue.isOpen(), running: RB.script.isRunning(), hall: !!RB.game.s.flags.as_hall, noise: !!RB.game.s.flags.as_dp_noise, mode: RB.game.mode() };
  });
  ok(R.loaded && !R.dark && !R.open && !R.running && !R.hall && !R.noise && R.mode === 'world', 'a load made in the dark of the gathering: the journey as saved, nothing dark, nothing open (' + J(R) + ')');
}

// ---- 5. "Say back": heard first while the other still waits ------------------------------------------------------------------
{
  const R = await p.evaluate(() => {
    const out = {};
    for (const [enc, first, other] of [['as.water', 'n:yoshizo', 'Taki'], ['as.noise', 'n:sho', 'Natsu']]) {
      const a = RB.content.encounters[enc].social.actions.find((x) => x.id === 'restate');
      const both = a.cases.find((c) => c.when.stance && Object.keys(c.when.stance).length === 2);
      out[enc] = { both: both && both.says.en, first: both && Object.keys(both.when.stance)[0] === first, other, alone: a.cases.filter((c) => Object.keys(c.when.stance).length === 1).map((c) => c.says.en) };
    }
    return out;
  });
  ok(Object.values(R).every((r) => r.first && new RegExp(r.other + ' is still waiting to be heard\\.$').test(r.both) && r.alone.length === 2 && r.alone.every((t) => !/still waiting/.test(t))),
    '"Say back" heard first with the other still heated says the other is still waiting; heard with the other already listening, the words as before (' + J(R) + ')');
}
ok(!errors.length, 'no page errors (' + J(errors).slice(0, 300) + ')');
await ctx.close(); await b.close(); srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
