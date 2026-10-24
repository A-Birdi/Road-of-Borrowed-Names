// RBN-QA-182 (Agnes 6382784813, 6383011149; Local CL-290, CL-292): a tap on someone who moves while you walk to them
// (the Procession Road's patrolling foxfire, a villager) walked you to where they had stood and then, finding them
// gone from beside you, silently did nothing. Now they are followed once more, to beside where they stand now, and the
// normal checks run there; never a second retry. In Chromium on the built game, on the Procession Road (hall.w2f2),
// each mover moved by the test while you walk (set on a new tile: what a patrol step or a wander does), its own patrol
// held still so nothing else moves it:
//  1. the foxfire, moved once: the walk goes on to beside it and its encounter starts;
//  2. moved again during that second walk: nothing, and no third walk;
//  3. taken away while you walk: nothing, and no second walk;
//  4. a new tap, a direction key, a map change or a new journey during the second walk: it is dropped (no encounter);
//     a scene begun on its own during the first walk, during the second, or as the last step is under way, and a battle
//     begun on its own (fled): the walk ends where it was, and its encounter never starts, through them or after them
//     (Agnes 6384084366, Local CL-300); another creature put in the place of the one tapped, or the one tapped moved to
//     where no way reaches beside it: no second walk, nothing;
//  5. a person (one of the procession, waiting on the grass), moved once: followed, and their scene plays; moved again:
//     nothing;
//  6. a prop moved while you walk (a fixture; props never move): no second walk;
//  7. no page errors. (Across a counter: tests/e2e/counter_tap.mjs, unchanged.)
// Usage: node tools/build.mjs && node tests/e2e/tap_moving.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const J = JSON.stringify;
const { p, ctx, errors } = await page(b, url, { viewport: { width: 1188, height: 848 } });

// a journey on the Procession Road, you at (x, y); the foxfire's patrol held; encounters recorded, not played
async function begin(x, y) {
  await p.evaluate(async ([x, y]) => {
    const s = RB.game.debugStart('hall.w2f2', x, y, { edition: RB.edition.forNew(), comp: null, flags: { hall_w2_f2_seen: true }, dir: 'up' });
    RB.game.settings.textSpeed = 'instant'; RB.save.autosave = async () => {};
    const W = RB.world.W, t0 = performance.now();
    while (W.time - W.enteredAt < 1100 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50));
    for (const f of W.foes) f.wt = 1e12;
    W.quietUntil = 0;
    window.__enc = [];
    if (!window.__realBattle) window.__realBattle = RB.game.startBattle; // (a battle begun on its own, below: the real one)
    RB.game.startBattle = (enemy) => { window.__enc.push(enemy); }; // (what interact does with a creature in front: startFoe)
    void s;
  }, [x, y]);
}
// tap (x, y); while you walk, run the given moves (each when the condition holds); then wait until the walk is over
// and report what happened
// (`through`: a scene or a battle begun while you walk is played through, Next to its end, a battle fled, and then it
// waits on: anything still queued would walk on or start)
const run = (tap, moves, through) => p.evaluate(async ([tap, moves, process_env_dbg, through]) => {
  const W = RB.world.W, P = W.player;
  const find = (who) => (who === 'foe' ? W.foes[0] : who === 'prop' ? W.map.props.find((q) => q.__fixture) : W.npcs.find((n) => n.id === who));
  const set = (a, x, y) => { a.x = x; a.y = y; a.fx = x; a.fy = y; a.mv = null; };
  const start = [P.x, P.y];
  let walks = 0, lastPath = null, retries = 0;
  const done = [];
  RB.world.tapTile(tap[0], tap[1]);
  const t0 = performance.now();
  window.__trace = [];
  while (performance.now() - t0 < 20000) {
    window.__trace.push([P.x, P.y, W.path ? W.path.length : -1, W.pathTarget ? W.pathTarget.tries || 0 : -1]);
    if (W.path && W.path !== lastPath) { walks++; lastPath = W.path; if (W.pathTarget && W.pathTarget.tries === 1) retries++; }
    for (let i = 0; i < moves.length; i++) {
      const m = moves[i];
      if (done[i]) continue;
      const when = m.when === 'walking' ? W.path && W.path.length && (P.x !== start[0] || P.y !== start[1]) && !(W.pathTarget && W.pathTarget.tries)
        : m.when === 'retry' ? W.path && W.path.length > 0 && W.pathTarget && W.pathTarget.tries === 1
        : m.when === 'last' ? W.path && W.path.length === 0 && P.mv && !(W.pathTarget && W.pathTarget.tries) : false;
      if (!when) continue;
      done[i] = true;
      const a = find(m.who);
      if (m.do === 'move') set(a, m.to[0], m.to[1]);
      else if (m.do === 'remove') W.foes.splice(W.foes.indexOf(a), 1);
      else if (m.do === 'tap') RB.world.tapTile(m.to[0], m.to[1]);
      else if (m.do === 'warp') RB.game.transition(m.to[0], m.to[1], m.to[2], 'up');
      else if (m.do === 'journey') {
        RB.game.debugStart('hall.w2f2', m.to[0], m.to[1], { edition: RB.edition.forNew(), comp: null, flags: { hall_w2_f2_seen: true }, dir: 'up' });
        for (const f of RB.world.W.foes) f.wt = 1e12; // (the new journey's foxfire held still too)
      }
      else if (m.do === 'scene') { window.__sceneAt = [P.x, P.y]; RB.script.run(m.scene); }
      else if (m.do === 'battle') { window.__sceneAt = [P.x, P.y]; window.__realBattle(m.enemy, { foeKey: 'test:' + Math.random() }); }
      else if (m.do === 'replace') { const c = Object.assign({}, a, { id: 'replacement', def: a.def }); W.foes.splice(W.foes.indexOf(a), 1, c); }
      else if (m.do === 'enclose') {
        // (moved to where no way reaches beside it: every free tile round it taken by a fixture)
        set(a, m.to[0], m.to[1]);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
          const x = m.to[0] + dx, y = m.to[1] + dy;
          if (!RB.world.blocked(x, y, { ignorePlayer: true })) W.map.props.push({ p: 'crate', x, y, if: 'hall_w2_f2_seen', __fixture: true });
        }
      }
      else if (m.do === 'key') { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', bubbles: true })); setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown', code: 'ArrowDown', bubbles: true })), 120); }
    }
    if (through) {
      // play a scene through and flee a battle; afterwards wait on, to see whether the tap's walk or its interaction
      // comes back
      if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true);
      const fl = document.querySelector('.cb-dock [data-flee]');
      if (fl && RB.game.inBattle()) fl.click();
      const busy = RB.script.isRunning() || RB.ui.dialogue.isOpen() || RB.game.inBattle();
      if (busy) window.__busyUntil = performance.now();
      if (window.__enc.length) break;
      if (window.__busyUntil && !busy && !W.path && !P.mv && performance.now() - window.__busyUntil > 1500) break;
      await new Promise((r) => setTimeout(r, 40));
      continue;
    }
    if (window.__enc.length || RB.ui.dialogue.isOpen() || RB.script.isRunning()) break;
    if (!W.path && !P.mv && performance.now() - t0 > 600) break;
    await new Promise((r) => setTimeout(r, 16));
  }
  await new Promise((r) => setTimeout(r, 400));
  const scene = RB.ui.dialogue.isOpen() ? (RB.ui.dialogue.shown() || {}).who || 'open' : RB.script.isRunning() ? 'running' : null;
  for (let i = 0; i < 80 && (RB.ui.dialogue.isOpen() || RB.script.isRunning()); i++) { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 40)); }
  const tr = window.__trace.filter((t, i, a) => !i || t.join() !== a[i - 1].join());
  const r = { enc: window.__enc.slice(), scene, map: W.map.id, at: [W.player.x, W.player.y], dir: P.dir, walks, retries, moved: done.filter(Boolean).length, path: !!W.path, target: !!W.pathTarget, sceneAt: window.__sceneAt || null, busy: !!window.__busyUntil, trace: process_env_dbg ? tr : undefined };
  window.__sceneAt = null; window.__busyUntil = 0;
  return r;
}, [tap, moves || [], !!process.env.DBG, !!through]);

// the foxfire's place, and where it can be moved to (free tiles nearby, two steps off)
await begin(21, 16);
const F = await p.evaluate(() => { const f = RB.world.W.foes[0]; return { at: [f.x, f.y], home: f.home, id: f.encounter || (f.def && f.def.encounter), enemy: f.def && f.def.enemy }; });
const fx = F.at[0], fy = F.at[1];
const free = (x, y) => p.evaluate(([x, y]) => !RB.world.blocked(x, y, { ignorePlayer: true }) && !RB.maps.exitAt(RB.world.W.map, x, y), [x, y]);
async function spot(cands) { for (const c of cands) if (await free(c[0], c[1])) return c; return null; }
const A1 = await spot([[fx + 2, fy], [fx, fy + 2], [fx - 2, fy], [fx, fy - 2]]);
const A2 = await spot([[fx + 2, fy + 2], [fx - 2, fy - 2], [fx + 2, fy - 2], [fx - 2, fy + 2]]);
console.log('     (the foxfire at ' + J(F.at) + ', moved to ' + J(A1) + ' then ' + J(A2) + ')');

// 1. moved once
{
  await begin(21, 16);
  const r = await run([fx, fy], [{ when: 'walking', who: 'foe', do: 'move', to: A1 }]);
  const beside = Math.abs(r.at[0] - A1[0]) + Math.abs(r.at[1] - A1[1]) === 1;
  ok(r.moved === 1 && r.retries === 1 && beside && r.enc.length === 1, 'the foxfire moved while you walk: one more walk, to beside where it is now, and its encounter starts (' + J(r) + ')');
}
// 2. moved again during the second walk
{
  await begin(21, 16);
  const r = await run([fx, fy], [{ when: 'walking', who: 'foe', do: 'move', to: A1 }, { when: 'retry', who: 'foe', do: 'move', to: A2 }]);
  ok(r.moved === 2 && r.retries === 1 && r.walks === 2 && !r.enc.length && !r.path && !r.target, 'moved again during the second walk: nothing, and no third walk (' + J(r) + ')');
}
// 3. taken away while you walk
{
  await begin(21, 16);
  const r = await run([fx, fy], [{ when: 'walking', who: 'foe', do: 'remove' }]);
  ok(r.moved === 1 && r.retries === 0 && r.walks === 1 && !r.enc.length, 'taken away while you walk: nothing, and no second walk (' + J(r) + ')');
}
// 4. a new tap, or a key, during the second walk
{
  await begin(21, 16);
  const r = await run([fx, fy], [{ when: 'walking', who: 'foe', do: 'move', to: A1 }, { when: 'retry', who: 'foe', do: 'tap', to: [18, 18] }]);
  ok(r.moved === 2 && r.retries === 1 && !r.enc.length, 'a new tap during the second walk: the follow-up dropped, no encounter (' + J(r) + ')');
  await begin(21, 16);
  const k = await run([fx, fy], [{ when: 'walking', who: 'foe', do: 'move', to: A1 }, { when: 'retry', who: 'foe', do: 'key' }]);
  ok(k.moved === 2 && k.retries === 1 && !k.enc.length, 'a direction key during the second walk: dropped, no encounter (' + J(k) + ')');
  await begin(21, 16);
  const w = await run([fx, fy], [{ when: 'walking', who: 'foe', do: 'move', to: A1 }, { when: 'retry', who: 'foe', do: 'warp', to: ['hall.w2f1', 17, 13] }]);
  ok(w.moved === 2 && w.retries === 1 && !w.enc.length && w.map === 'hall.w2f1' && !w.path && !w.target, 'a map change during the second walk: dropped, no encounter, nothing carried to the new map (' + J(w) + ')');
  await begin(21, 16);
  const c = await run([fx, fy], [{ when: 'walking', who: 'foe', do: 'move', to: A1 }, { when: 'retry', who: 'foe', do: 'journey', to: [17, 14] }]);
  ok(c.moved === 2 && c.retries === 1 && !c.enc.length && J(c.at) === J([17, 14]) && !c.path && !c.target, 'a new journey during the second walk: dropped, no encounter, nothing carried into it (' + J(c) + ')');
}
// 4b. a scene or a battle begun on its own while you walk (not one the walk started: Agnes 6384084366, Local CL-300): the
// walk ends where it was; its interaction never fires, through it or after it, and the walk does not go on
{
  // (where you stood when it began, give or take the step then under way)
  const stopped = (r) => r.sceneAt && Math.abs(r.at[0] - r.sceneAt[0]) + Math.abs(r.at[1] - r.sceneAt[1]) <= 1;
  await begin(21, 16);
  const s1 = await run([fx, fy], [{ when: 'walking', who: 'foe', do: 'scene', scene: 'hall.w2.t4_card' }], true);
  ok(s1.busy && !s1.enc.length && !s1.path && !s1.target && stopped(s1), 'a scene begun on its own during the walk: played through, then nothing: no encounter, and you stay where it found you (' + J(s1) + ')');
  await begin(21, 16);
  const s2 = await run([fx, fy], [{ when: 'walking', who: 'foe', do: 'move', to: A1 }, { when: 'retry', who: 'foe', do: 'scene', scene: 'hall.w2.t4_card' }], true);
  ok(s2.busy && s2.retries === 1 && !s2.enc.length && !s2.path && !s2.target && stopped(s2), 'and during the second walk: the same (' + J(s2) + ')');
  await begin(21, 16);
  const s3 = await run([fx, fy], [{ when: 'last', who: 'foe', do: 'scene', scene: 'hall.w2.t4_card' }], true);
  ok(s3.busy && !s3.enc.length && !s3.path && !s3.target, 'a scene begun as the walk\'s last step is under way: the step ends, and the encounter never starts, through the scene or after it (' + J(s3) + ')');
  await begin(21, 16);
  const s4 = await run([fx, fy], [{ when: 'walking', who: 'foe', do: 'battle', enemy: F.enemy }], true);
  ok(s4.busy && !s4.enc.length && !s4.path && !s4.target && stopped(s4), 'a battle begun on its own during the walk (fled): then nothing, no encounter, no walk on (' + J(s4) + ')');
}
// 4c. someone else in the place of the one tapped; one moved to where no way reaches beside them
{
  await begin(21, 16);
  const r1 = await run([fx, fy], [{ when: 'walking', who: 'foe', do: 'replace' }]);
  ok(r1.moved === 1 && r1.retries === 0 && !r1.enc.length && !r1.path, 'another creature in the place of the one tapped: nothing with it, and no second walk (' + J(r1) + ')');
  await begin(21, 16);
  const r2 = await run([fx, fy], [{ when: 'walking', who: 'foe', do: 'enclose', to: A1 }]);
  await p.evaluate(() => { const m = RB.world.W.map; m.props = m.props.filter((q) => !q.__fixture); });
  ok(r2.moved === 1 && r2.retries === 0 && r2.walks === 1 && !r2.enc.length && !r2.path, 'moved to where no way reaches beside it: no second walk, nothing (' + J(r2) + ')');
}
// 5. a person: one of the procession waiting on the grass, moved once, then moved again
{
  await begin(17, 14);
  const N = await p.evaluate(() => { const n = RB.world.W.npcs.find((q) => /^hall_/.test(q.id) && !/_r\d$/.test(q.id)); return n && { id: n.id, at: [n.x, n.y] }; });
  const nx = N.at[0], ny = N.at[1];
  const B1 = await spot([[nx - 2, ny], [nx, ny - 2], [nx, ny + 2], [nx - 2, ny - 1]]);
  const B2 = await spot([[nx - 2, ny + 2], [nx - 2, ny - 2], [nx + 2, ny + 2], [nx - 3, ny]]);
  await begin(17, 14);
  const r = await run([nx, ny], [{ when: 'walking', who: N.id, do: 'move', to: B1 }]);
  ok(r.moved === 1 && r.retries === 1 && !!r.scene && Math.abs(r.at[0] - B1[0]) + Math.abs(r.at[1] - B1[1]) === 1, 'a person (' + N.id + ') who moved while you walk: followed once, and their scene plays (' + J(r) + ')');
  await begin(17, 14);
  const r2 = await run([nx, ny], [{ when: 'walking', who: N.id, do: 'move', to: B1 }, { when: 'retry', who: N.id, do: 'move', to: B2 }]);
  ok(r2.moved === 2 && r2.retries === 1 && r2.walks === 2 && !r2.scene && !r2.path, 'and moved again: nothing, no third walk (' + J(r2) + ')');
}
// 6. a prop moved while you walk (a fixture: props never move)
{
  await begin(21, 16);
  const r = await p.evaluate(async () => {
    const W = RB.world.W, m = W.map;
    m.props.push({ p: 'sign', x: 25, y: 18, scene: 'hall.w2.t4_card', __fixture: true });
    return true;
  });
  void r;
  const q = await run([25, 18], [{ when: 'walking', who: 'prop', do: 'move', to: [27, 18] }]);
  ok(q.moved === 1 && q.retries === 0 && q.walks === 1 && !q.scene, 'a prop moved while you walk: no second walk, nothing read (' + J(q) + ')');
}
ok(!errors.length, 'no page errors (' + J(errors).slice(0, 300) + ')');
await ctx.close(); await b.close(); srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
