// RBN-QA-088 (Agnes 6335192080): a scene's entrance (`!enter`) and the staging walk that takes someone to their place
// belong to the campaign, the map, the scene and the figure they began with. Once any of those is gone the walk takes
// no further step, never moves whoever now answers to the same name, and the entrance is not counted as made. In
// Chromium on the built game, with test scenes in the sea cave (`!enter ko_nana x y`, then one line), where Nana is
// not a resident but the scene's own figure; the keepers' village is where she lives:
//  1. the same campaign, another map (the village) entered while she walks to her place: the village's own Nana, who
//     answers to the same name, is never moved and stays at her place; the entrance is recorded as not made ("map
//     changed"), one Nana, and the scene's line is still said. The cave entered afresh instead: her figure goes with
//     the old visit (a map entered clears its extras; its residents are kept as they are, 50_world.js refreshActors),
//     the entrance is recorded as not made ("figure gone"), no Nana left behind, the line said;
//  2. another campaign (in the village) loaded while she walks to her place (not while she walks in: suzu_stage.mjs
//     covers that): its Nana is never moved, nothing is recorded for the old entrance, nothing more of the old scene is
//     said, and no scene is left running;
//  3. skipping (the scene seen, skip on) with her place taken: she is set down on a free tile (nobody's, not a wall),
//     no one ever on another's tile, the entrance recorded as not made ("blocked"), and when the scene ends she leaves
//     as the scene's own: no Nana is left behind;
//  4. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/enter_ownership.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const KO = { ch2_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_ch9: true, ko_arrived: true, ko_otoha_met: true, 'tell_ko.t_hall_ok': true, ko_seacave_seen: true, ko_lowtide: true, 'foe:ko.seacave:s1': true, 'foe:ko.seacave:s2': true };
const allErrors = [];

async function setup(p, map, x, y) {
  await p.evaluate(([KO, map, x, y]) => {
    const s = RB.game.debugStart(map, x, y, { dir: 'up', edition: RB.edition.forNew(), comp: 'suzu', flags: Object.assign({}, KO) });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.world.enter(map, x, y, 'up', { fresh: true });
    if (!window.__wrapped) {
      const say = RB.ui.dialogue.say;
      RB.ui.dialogue.say = function (l) { window.__said.push({ who: l.who, en: l.en, sceneId: l.sceneId }); return say.apply(this, arguments); };
      window.__wrapped = true;
      // every 50 ms: each Nana here (and on her way out), and whether anyone shares a tile
      setInterval(() => {
        const W = RB.world.W;
        if (!W.map || !window.__samp) return;
        const isN = (a) => a.id === 'ko_nana' || (a.def && a.def.char === 'ko_nana');
        const people = W.npcs.concat(W.extras);
        const tiles = [W.player.x + ',' + W.player.y].concat(W.comp ? [W.comp.x + ',' + W.comp.y] : [], people.map((a) => a.x + ',' + a.y));
        window.__samp.push({ t: performance.now() | 0, map: W.map, mapId: W.map.id, run: RB.script.isRunning(),
          nana: people.filter(isN).map((a) => ({ x: a.x, y: a.y, extra: !!a.extra, obj: a })), going: W.leavers.filter(isN).length, clash: new Set(tiles).size !== tiles.length });
      }, 50);
    }
    window.__said = []; window.__samp = [];
  }, [KO, map, x, y]);
  await p.waitForTimeout(700);
}
const entrances = (p) => p.evaluate(() => (RB.test.entrances || []).map((e) => Object.assign({}, e)));
// the new world's Nana from the moment of the change: every sample of her (the residents of the new map only)
const after = (p, t0) => p.evaluate((t0) => window.__samp.filter((x) => x.t >= t0 && x.map === RB.world.W.map).map((x) => ({ n: x.nana.length, at: x.nana.map((a) => [a.x, a.y, a.extra]), clash: x.clash })), t0);
async function advanceAll(p, ms) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance());
    await p.waitForTimeout(120);
  }
}

// In the sea cave she is the scene's own figure (an extra): her place is taken by Suzu when she is brought in, so she
// walks in to the tile in front of you; Suzu then steps aside, and once she has arrived staging walks her on to her
// place, three or more steps. The change comes at her first step of that walk.
async function cave(p, scene) {
  await setup(p, 'ko.seacave', 13, 10);
  return p.evaluate((scene) => {
    const W = RB.world.W, c = W.comp, P = [W.player.x, W.player.y];
    const open = (x, y) => x >= 0 && y >= 0 && x < W.map.w && y < W.map.h && !RB.maps.blockedStatic(W.map, x, y) && !RB.maps.exitAt(W.map, x, y) && !W.npcs.concat(W.extras).some((a) => a.x === x && a.y === y) &&
      !W.map.triggers.some((t) => x >= t.x && x < t.x + t.w && y >= t.y && y < t.y + t.h);
    const front = [P[0], P[1] - 1], aside = [[P[0] - 1, P[1]], [P[0] + 1, P[1]], [P[0], P[1] + 1]].find(([x, y]) => open(x, y));
    // her place: three or four steps from the tile in front of you, by open tiles
    const dist = new Map([[front.join(), 0]]), q = [front];
    let to = null;
    while (q.length && !to) {
      const [x, y] = q.shift(), d = dist.get(x + ',' + y);
      if (d >= 3 && d <= 4 && !(x === aside[0] && y === aside[1])) { to = [x, y]; break; }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (!dist.has(k) && open(nx, ny) && !(nx === P[0] && ny === P[1])) { dist.set(k, d + 1); q.push([nx, ny]); } }
    }
    c.x = to[0]; c.y = to[1]; c.fx = to[0]; c.fy = to[1]; c.mv = null; c.route = null;
    RB.script.add('@scene ' + scene + '\n!enter ko_nana ' + to[0] + ' ' + to[1] + ' up\nnarr: テスト || A test line.\n', 'enter_ownership test');
    window.__samp = [];
    RB.script.run(scene);
    // Suzu steps aside while Nana is still on her way in
    const n = W.extras.find((a) => a.id === 'ko_nana');
    c.x = aside[0]; c.y = aside[1]; c.fx = aside[0]; c.fy = aside[1];
    return { front, aside, to, walkingIn: !!(n && n.route) };
  }, scene);
}
// her first step from the tile in front of you towards her place, after her walk-in
const positioning = (p, front) => p.waitForFunction((front) => {
  const n = RB.world.W.extras.find((a) => a.id === 'ko_nana');
  return !!n && !n.route && (n.x !== front[0] || n.y !== front[1] || (!!n.mv && (n.mv.tx !== front[0] || n.mv.ty !== front[1])));
}, front, { timeout: 15000 }).then(() => true, () => false);

// ---- 1. the same campaign, another map, while she walks to her place -------------------------------------------------
{
  const { p, errors } = await page(b, url);
  const r0 = await cave(p, 'zz.enter_cave1');
  const e0 = (await entrances(p)).filter((e) => e.scene === 'zz.enter_cave1').length;
  const moving = await positioning(p, r0.front);
  // (the keepers' village, where Nana lives at her own place)
  const t0 = await p.evaluate(() => { RB.world.enter('ko.village', 20, 20, 'up', { fresh: true }); return performance.now() | 0; });
  const home = await p.evaluate(() => { const n = RB.world.W.npcs.find((a) => a.id === 'ko_nana'); return n && [n.x, n.y]; });
  await p.waitForTimeout(3000);
  const S = await after(p, t0);
  const ent = (await entrances(p)).filter((e) => e.scene === 'zz.enter_cave1').slice(e0);
  await advanceAll(p, 1500);
  const said = await p.evaluate(() => window.__said.filter((l) => l.sceneId === 'zz.enter_cave1').map((l) => l.en));
  ok(r0.walkingIn && moving && home && S.length > 20 && S.every((x) => x.n === 1 && x.at[0][0] === home[0] && x.at[0][1] === home[1] && !x.at[0][2]),
    'another map entered while she walks to her place in the cave: the village\'s own Nana (who answers to the same name) is never moved, stays at her place, one Nana (' + JSON.stringify({ r0, moving, home, samples: S.length, moved: S.filter((x) => x.n !== 1 || x.at[0][0] !== home[0] || x.at[0][1] !== home[1]).slice(0, 3) }) + ')');
  ok(ent.length === 1 && ent[0].ok === false && ent[0].why === 'map changed', 'and the entrance is recorded as not made, the map having changed (' + JSON.stringify(ent) + ')');
  ok(said.length === 1, 'and the scene goes on: its line is said (' + JSON.stringify(said) + ')');
  allErrors.push(...errors); await p.close();
}
{
  // the same map entered afresh: the people of the scene's own (extras) go with the old visit; residents are kept
  const { p, errors } = await page(b, url);
  const r0 = await cave(p, 'zz.enter_cave2');
  const moving = await positioning(p, r0.front);
  await p.evaluate(() => { RB.world.enter('ko.seacave', 13, 10, 'up', { fresh: true }); });
  await p.waitForTimeout(3000);
  const ent = (await entrances(p)).filter((e) => e.scene === 'zz.enter_cave2');
  await advanceAll(p, 1500);
  await p.waitForTimeout(2000);
  const end = await p.evaluate(() => { const W = RB.world.W, isN = (a) => a.id === 'ko_nana'; return { here: W.npcs.concat(W.extras).filter(isN).length, going: W.leavers.filter(isN).length, run: RB.script.isRunning(), said: window.__said.filter((l) => l.sceneId === 'zz.enter_cave2').length }; });
  const S = await p.evaluate(() => window.__samp.map((x) => ({ n: x.nana.length, clash: x.clash })));
  ok(r0.walkingIn && moving && ent.length === 1 && ent[0].ok === false && ent[0].why === 'figure gone', 'the cave entered afresh while she walks to her place: the entrance is recorded as not made, its figure gone with the old visit (' + JSON.stringify({ moving, ent }) + ')');
  ok(!end.run && end.here === 0 && end.going === 0 && end.said === 1 && !S.some((x) => x.n > 1) && !S.some((x) => x.clash), 'no Nana is left in the cave, the scene\'s line is said, nothing running, never two Nanas, nobody on another\'s tile (' + JSON.stringify(end) + ')');
  allErrors.push(...errors); await p.close();
}

// ---- 2. another campaign loaded while she walks to her place -------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  // (the campaign loaded is one in the keepers' village, Nana at her own place)
  await setup(p, 'ko.village', 20, 20);
  await p.evaluate(async () => { await RB.save.writeSlot(2, RB.game.s, { force: true }); });
  const r0 = await cave(p, 'zz.enter_cave3');
  const e0 = (await entrances(p)).filter((e) => e.scene === 'zz.enter_cave3').length;
  const moving = await positioning(p, r0.front);
  const t0 = await p.evaluate(() => performance.now() | 0);
  await p.evaluate(async () => { await RB.game.loadCampaign(2); });
  const home = await p.evaluate(() => { const n = RB.world.W.npcs.find((a) => a.id === 'ko_nana'); return n && [n.x, n.y]; });
  await p.waitForTimeout(3000);
  const S = await after(p, t0);
  const v = await p.evaluate(() => ({ map: RB.world.W.map.id, run: RB.script.isRunning(), dlg: RB.ui.dialogue.isOpen(), said: window.__said.filter((l) => /^zz\./.test(l.sceneId || '')).length }));
  const ent = (await entrances(p)).filter((e) => e.scene === 'zz.enter_cave3').slice(e0);
  ok(r0.walkingIn && moving && home && v.map === 'ko.village' && S.length > 20 && S.every((x) => x.n === 1 && x.at[0][0] === home[0] && x.at[0][1] === home[1] && !x.at[0][2]),
    'another campaign loaded while she walks to her place: its own Nana is never moved, stays at her place, one Nana (' + JSON.stringify({ moving, home, samples: S.length, moved: S.filter((x) => x.n !== 1 || x.at[0][0] !== home[0] || x.at[0][1] !== home[1]).slice(0, 3), v }) + ')');
  ok(!ent.length && !v.said && !v.run && !v.dlg, 'and nothing is recorded for the old entrance, nothing of the old scene is said, and no scene is left running (' + JSON.stringify({ ent, v }) + ')');
  allErrors.push(...errors); await p.close();
}

// ---- 3. skipping, with her place taken -------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await setup(p, 'ko.seacave', 13, 10);
  const r0 = await p.evaluate(() => {
    const W = RB.world.W, c = W.comp;
    const open = (x, y) => !RB.maps.blockedStatic(W.map, x, y) && !RB.maps.exitAt(W.map, x, y) && !W.npcs.concat(W.extras).some((a) => a.x === x && a.y === y);
    // Suzu stands on the place the scene names for Nana (beside you)
    const to = [[1, 0], [-1, 0], [0, 1]].map(([dx, dy]) => [W.player.x + dx, W.player.y + dy]).find(([x, y]) => open(x, y));
    c.x = to[0]; c.y = to[1]; c.fx = to[0]; c.fy = to[1]; c.mv = null; c.route = null;
    RB.script.add('@scene zz.enter_taken\n!enter ko_nana ' + to[0] + ' ' + to[1] + ' up\nnarr: テスト || A test line.\n', 'enter_ownership test');
    RB.game.s.seen['zz.enter_taken'] = true;
    RB.game.settings.skipSeen = true;
    RB.game.setFastForward(true);
    window.__samp = [];
    RB.script.run('zz.enter_taken');
    return { to, comp: [c.x, c.y], pc: [W.player.x, W.player.y] };
  });
  const e0 = 0;
  // where she was set down: every 50 ms sample of the scene in which she is here (a seen scene skipped runs through
  // without waiting, so one probe taken after it began can come after she has gone again)
  await advanceAll(p, 1200);
  const mid = await p.evaluate(() => {
    const W = RB.world.W, at = [];
    for (const x of window.__samp) for (const a of x.nana) at.push({ x: a.x, y: a.y, extra: a.extra, wall: RB.maps.blockedStatic(W.map, a.x, a.y), onPc: false });
    const tiles = [...new Set(at.map((a) => a.x + ',' + a.y))];
    return { samples: at.length, tiles, extra: at.every((a) => a.extra), wall: at.some((a) => a.wall), comp: W.comp && [W.comp.x, W.comp.y] };
  });
  await p.waitForTimeout(6000);
  const S = await p.evaluate(() => window.__samp.map((x) => ({ n: x.nana.length, g: x.going, clash: x.clash, run: x.run })));
  const ent = (await entrances(p)).slice(e0).filter((e) => e.scene === 'zz.enter_taken');
  const end = await p.evaluate(() => { const W = RB.world.W, isN = (a) => a.id === 'ko_nana'; return { here: W.npcs.concat(W.extras).filter(isN).length, going: W.leavers.filter(isN).length, run: RB.script.isRunning(), ff: RB.game.fastForward() }; });
  // (where she stood when the entrance was recorded, and every sample of her while the scene ran)
  const set = ent[0] && ent[0].at, setFree = !!set && await p.evaluate((t) => !RB.maps.blockedStatic(RB.world.W.map, t[0], t[1]), set);
  ok(set && setFree && set.join() !== r0.to.join() && set.join() !== r0.pc.join() && mid.extra && !mid.wall && !mid.tiles.includes(r0.to.join()) && !mid.tiles.includes(r0.pc.join()) && mid.comp && mid.comp.join() === r0.to.join(),
    'skipping, with her place taken (Suzu stands on it): she is set down on a free tile, nobody\'s (never her taken place, never yours), not a wall, and Suzu is left where she is (' + JSON.stringify({ r0, set, mid }) + ')');
  ok(S.length > 50 && !S.some((x) => x.clash) && !S.some((x) => x.n > 1), 'nobody on another\'s tile at any moment, and never two Nanas (' + JSON.stringify({ samples: S.length, clash: S.filter((x) => x.clash).length }) + ')');
  ok(ent.length === 1 && ent[0].ok === false && ent[0].why === 'blocked', 'the entrance is recorded as not made: her place was taken (' + JSON.stringify(ent) + ')');
  ok(!end.run && end.here === 0 && end.going === 0 && !end.ff, 'when the scene ends she leaves as the scene\'s own: no Nana left behind, nothing running (' + JSON.stringify(end) + ')');
  allErrors.push(...errors); await p.close();
}

ok(!allErrors.length, 'no page errors ' + allErrors.slice(0, 3).join(' | '));
await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
