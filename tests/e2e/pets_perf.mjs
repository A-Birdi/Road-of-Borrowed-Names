// The pets' incremental frame cost and memory, in the BUILT game (the pattern of tests/e2e/perf.mjs: the work
// itself is timed, since headless requestAnimationFrame is capped by vsync).
// - world: RB.render.frame() + RB.world.update() on Reedwake with no pet and with each species following while
//   you walk (A/B, median of rounds), and the time spent inside the pet's own work (petWorld.update/push and the
//   frames it asks for), warm cache and after clearing it;
// - battle: the time inside RB.battlePets.draw on the real stage over calm frames and over a reaction, per frame;
// - memory: the frame cache (entries, pixel bytes) after a walk and after a battle, and the JS heap (CDP) with no
//   pet and with one.
// Writes tests/e2e/out/pets/perf.json and prints a table. Usage: node tests/e2e/pets_perf.mjs [--vp 1280x800]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const [vw, vh] = opt('--vp', '1280x800').split('x').map(Number);
const outDir = path.join(root, 'tests/e2e/out/pets');
fs.mkdirSync(outDir, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
const out = { viewport: vw + 'x' + vh, world: {}, battle: {}, memory: {} };

const { p, ctx } = await page(b, url, { viewport: { width: vw, height: vh } });
const cdp = await ctx.newCDPSession(p);
await cdp.send('Performance.enable');
const heap = async () => { await cdp.send('HeapProfiler.collectGarbage'); const m = await cdp.send('Performance.getMetrics'); return Math.round(m.metrics.find((x) => x.name === 'JSHeapUsedSize').value / 1024); };

// ---- world -----------------------------------------------------------------------------------------------------
async function worldRun(sp, cold) {
  return p.evaluate(async ([sp, cold]) => {
    RB.game.debugStart('rw.village', 17, 24, { comp: 'mio', flags: { rw_arrived: true, rw_road_lit: true, departed: true, ch1_done: true } }); // (before the cat's vignette opens: no other animal in the square)
    await new Promise((r) => setTimeout(r, 300));
    while (RB.ui.dialogue.isOpen()) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 30)); }
    const s = RB.game.s;
    if (sp) { RB.pets.meet(s, sp); RB.pets.select(s, sp); } else RB.pets.select(s, null);
    // the vignettes' animals stay out of the comparison (they are there with or without a pet)
    const W = RB.world.W;
    const cv = document.getElementById('world'), g = cv.getContext('2d'), flush = () => g.getImageData(0, 0, 1, 1);
    // instrument the pet's own work
    const PW = RB.petWorld, A = RB.petArt;
    let inPet = 0;
    const wrap = (o, k) => { const f = o[k]; o[k] = function () { const t = performance.now(); try { return f.apply(this, arguments); } finally { inPet += performance.now() - t; } }; return () => { o[k] = f; }; };
    const un = [wrap(PW, 'update'), wrap(A, 'frame')];
    // the list items the pet pushes draw later: time them too
    const push0 = PW.push;
    PW.push = function (list, c, ax, ay, t) { const n = list.length; const r = push0.call(this, list, c, ax, ay, t); for (let i = n; i < list.length; i++) { const d = list[i].draw; list[i].draw = () => { const t0 = performance.now(); try { d(); } finally { inPet += performance.now() - t0; } }; } return r; };
    if (cold) A.clearCache();
    // walk: a loop left and right along the lane (the pet follows, walks, settles)
    const path = ['left', 'left', 'left', 'up', 'right', 'right', 'right', 'down'];
    const times = [];
    let step = 0;
    for (let round = 0; round < 5; round++) {
      inPet = 0;
      const t0 = performance.now();
      const N = 240;
      for (let i = 0; i < N; i++) {
        if (!W.player.mv) { RB.world._tryMove(path[step % path.length]); step++; }
        RB.world.update(16, true);
        RB.render.frame(t0 + i * 16);
      }
      flush();
      times.push({ frame: (performance.now() - t0) / N, pet: inPet / N });
      if (cold) break;
    }
    PW.push = push0; un.forEach((f) => f());
    times.sort((a, b) => a.frame - b.frame);
    const mid = times[Math.floor(times.length / 2)];
    return { frame: +mid.frame.toFixed(3), pet: +mid.pet.toFixed(3), cache: A.cacheStats(), state: sp ? RB.petWorld.state().stats : null };
  }, [sp, cold]);
}
out.memory.heapNoPetKB = await heap();
out.world.none = await worldRun(null, false);
for (const sp of ['cat', 'dog', 'bird', 'tanuki']) {
  out.world[sp + '_cold'] = await worldRun(sp, true);
  out.world[sp] = await worldRun(sp, false);
}
out.memory.afterWalkCache = await p.evaluate(() => RB.petArt.cacheStats());
out.memory.heapWithPetsKB = await heap();

// ---- battle ------------------------------------------------------------------------------------------------------
for (const sp of ['cat', 'dog', 'bird', 'tanuki']) {
  out.battle[sp] = await p.evaluate(async (sp) => {
    RB.game.debugStart('rw.millroad', 10, 22, { comp: 'mio' });
    const s = RB.game.s; s.learn.profile = 'E';
    RB.game.settings.textSpeed = 'instant';
    RB.pets.meet(s, sp); RB.pets.select(s, sp);
    RB.game.startBattle('rw.dustmoth', {});
    for (let i = 0; i < 200 && !(document.querySelector('.rcard[data-i]') && !RB.battleSeq.busy()); i++) { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 50)); }
    const BP = RB.battlePets, d0 = BP.draw;
    let tot = 0, n = 0;
    BP.draw = function () { const t = performance.now(); try { return d0.apply(this, arguments); } finally { tot += performance.now() - t; n++; } };
    await new Promise((r) => setTimeout(r, 1500));
    const calm = { perFrame: n ? tot / n : 0, frames: n };
    tot = 0; n = 0;
    // a reaction (emitted as the battle would; the real observer and stage)
    const t0 = RB.battleSeq.now();
    RB.bus.emit('present:action', { scope: 'battle', actor: 'pc', action: 'perf', family: 'wind', targets: ['foe:0'], result: 'hit', exchange: 99, t0, beat: 300 });
    RB.bus.emit('present:enemy', { scope: 'battle', actor: 'foe:0', kind: 'strike', targets: ['pc'], outcome: 'hit', at: 1400, t0 });
    await new Promise((r) => setTimeout(r, 2400));
    const react = { perFrame: n ? tot / n : 0, frames: n };
    BP.draw = d0;
    // the same work timed directly (deterministic, independent of how often the page gets to draw): the pet's
    // draw on the real layout, 150 frames across a reaction and 150 calm frames, cold (cache cleared) then warm
    const L = RB.battleStage.lay();
    const oc = document.createElement('canvas'); oc.width = 1280; oc.height = 800;
    const c = oc.getContext('2d');
    const loop = (fam) => {
      const tb = RB.battleSeq.now() + 10;
      if (fam) RB.bus.emit('present:action', { scope: 'battle', actor: 'pc', action: 'perf', family: fam, targets: ['foe:0'], result: 'hit', exchange: 100 + Math.random(), t0: tb, beat: 200 });
      const t0 = performance.now();
      for (let i = 0; i < 150; i++) d0.call(BP, c, L, { pt: tb + i * 16, t: tb + i * 16, reduce: false });
      c.getImageData(0, 0, 1, 1);
      return (performance.now() - t0) / 150;
    };
    RB.bus.emit('present:scene', { scope: 'battle', phase: 'calm', t0: RB.battleSeq.now() });
    RB.petArt.clearCache();
    const coldReact = loop('fire'), warmReact = loop('fire'), warmCalm = loop(null);
    const st = BP.stats();
    RB.combat && RB.combat.abort ? RB.combat.abort() : null;
    return { calmMs: +calm.perFrame.toFixed(3), calmFrames: calm.frames, reactMs: +react.perFrame.toFixed(3), reactFrames: react.frames, loopColdReactMs: +coldReact.toFixed(3), loopWarmReactMs: +warmReact.toFixed(3), loopWarmCalmMs: +warmCalm.toFixed(3), particles: st.stats.maxParticles, cache: RB.petArt.cacheStats() };
  }, sp);
}
out.memory.afterBattleCache = await p.evaluate(() => RB.petArt.cacheStats());
out.memory.heapEndKB = await heap();
await ctx.close();

fs.writeFileSync(path.join(outDir, 'perf.json'), JSON.stringify(out, null, 2));
const w = out.world;
console.log('viewport ' + out.viewport);
console.log('world (ms per frame, median of 5 × 240 frames walking): none ' + w.none.frame);
for (const sp of ['cat', 'dog', 'bird', 'tanuki']) console.log('  ' + sp.padEnd(7) + ' frame ' + w[sp].frame + ' (inside the pet ' + w[sp].pet + ')   cold cache: frame ' + w[sp + '_cold'].frame + ' (inside the pet ' + w[sp + '_cold'].pet + ')');
console.log('battle (ms inside RB.battlePets.draw per frame):');
for (const sp of ['cat', 'dog', 'bird', 'tanuki']) { const q = out.battle[sp]; console.log('  ' + sp.padEnd(7) + ' timed loop: reaction cold ' + q.loopColdReactMs + ', reaction warm ' + q.loopWarmReactMs + ', calm warm ' + q.loopWarmCalmMs + ' | live: calm ' + q.calmMs + ' (' + q.calmFrames + ' frames), reacting ' + q.reactMs + ' (' + q.reactFrames + ' frames) | particles ' + q.particles); }
console.log('frame cache after the walks: ' + JSON.stringify(out.memory.afterWalkCache) + '; after the battles: ' + JSON.stringify(out.memory.afterBattleCache));
console.log('JS heap (KB, after GC): no pet ' + out.memory.heapNoPetKB + ', after the walks ' + out.memory.heapWithPetsKB + ', at the end ' + out.memory.heapEndKB);
await b.close(); srv.close();
