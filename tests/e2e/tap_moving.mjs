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
    RB.game.startBattle = (enemy) => { window.__enc.push(enemy); }; // (what interact does with a creature in front: startFoe)
    void s;
  }, [x, y]);
}
// tap (x, y); while you walk, run the given moves (each when the condition holds); then wait until the walk is over
// and report what happened
const run = (tap, moves) => p.evaluate(async ([tap, moves, process_env_dbg]) => {
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
        : m.when === 'retry' ? W.path && W.path.length > 0 && W.pathTarget && W.pathTarget.tries === 1 : false;
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
      else if (m.do === 'key') { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', bubbles: true })); setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown', code: 'ArrowDown', bubbles: true })), 120); }
    }
    if (window.__enc.length || RB.ui.dialogue.isOpen() || RB.script.isRunning()) break;
    if (!W.path && !P.mv && performance.now() - t0 > 600) break;
    await new Promise((r) => setTimeout(r, 16));
  }
  await new Promise((r) => setTimeout(r, 400));
  const scene = RB.ui.dialogue.isOpen() ? (RB.ui.dialogue.shown() || {}).who || 'open' : RB.script.isRunning() ? 'running' : null;
  for (let i = 0; i < 80 && (RB.ui.dialogue.isOpen() || RB.script.isRunning()); i++) { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 40)); }
  const tr = window.__trace.filter((t, i, a) => !i || t.join() !== a[i - 1].join());
  return { enc: window.__enc.slice(), scene, map: W.map.id, at: [W.player.x, W.player.y], dir: P.dir, walks, retries, moved: done.filter(Boolean).length, path: !!W.path, target: !!W.pathTarget, trace: process_env_dbg ? tr : undefined };
}, [tap, moves || [], !!process.env.DBG]);

// the foxfire's place, and where it can be moved to (free tiles nearby, two steps off)
await begin(21, 16);
const F = await p.evaluate(() => { const f = RB.world.W.foes[0]; return { at: [f.x, f.y], home: f.home, id: f.encounter || (f.def && f.def.encounter) }; });
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
