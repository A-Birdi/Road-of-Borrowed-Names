// AR-1 Mill checks beyond the mill: (1) shared reach — other maps drawing the shared stairs, and the two mill battle
// backdrops, captured with the same deterministic recipe (to diff before/after); (2) render cost and sprite-cache
// growth over the same short scenes (real clock, headless Chromium, this container's CPU: indicative only).
// Usage: [PERF_ONLY=1] node tools/review/ar1_mill_reach_perf.mjs <build.html> <outDir>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
let pw;
try { pw = await import('playwright'); } catch { pw = await import('/opt/node22/lib/node_modules/playwright/index.mjs'); }
const [, , html, out] = process.argv;
fs.mkdirSync(out, { recursive: true });
const body = fs.readFileSync(html);
const srv = http.createServer((q, r) => { if (q.url.split('?')[0] !== '/') { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(body); });
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const url = 'http://127.0.0.1:' + srv.address().port + '/';
const browser = await pw.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const T0 = new Date('2026-10-17T09:00:00Z');
const SEED = `(() => { let s = 0x2f6b4a1d; Math.random = function () { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; window.__seed = (n) => { s = n | 0; }; })();`;
const res = { build: html, errors: [] };

// ---- (1) shared reach, deterministic ----
if (!process.env.PERF_ONLY) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'no-preference' });
  await ctx.addInitScript(SEED);
  await ctx.clock.install({ time: T0 });
  await ctx.clock.pauseAt(new Date(T0.getTime() + 1000));
  const p = await ctx.newPage();
  p.on('pageerror', (e) => res.errors.push(e.message));
  await p.goto(url);
  for (let i = 0; i < 200 && !(await p.evaluate(() => window.__RB_READY__ === true)); i++) await ctx.clock.runFor(100);
  const align = async () => { const now = await p.evaluate(() => performance.now()); await ctx.clock.runFor(Math.ceil((now + 1000) / 60000) * 60000 - now); await p.evaluate(() => window.__seed(0x51a7e)); };
  const SHOTS = [['sg.inn', 11, 6, 'up'], ['co.terraces', 8, 26, 'up'], ['hall.w1f1', 17, 2, 'up'], ['mb.inn', 11, 7, 'up'], ['rw.cellar2', 2, 4, 'up']];
  for (const [map, x, y, dir] of SHOTS) {
    await align();
    await p.evaluate(([map, x, y, dir]) => { Object.assign(RB.game.settings, { reducedMotion: false, worldLight: true, muted: true }); RB.game.debugStart(map, x, y, { dir, flags: { ['enter:' + map]: true } }); }, [map, x, y, dir]);
    await ctx.clock.runFor(4000);
    // close any arrival scene's line so the floor shows (the same on both sides)
    await p.evaluate(() => { for (let k = 0; k < 30 && RB.ui.dialogue.isOpen(); k++) RB.ui.dialogue.advance(true); });
    await ctx.clock.runFor(1000);
    await p.screenshot({ path: path.join(out, 'reach_' + map + '.png') });
  }
  // the two battle backdrops round the mill: inside (the mill's own creature) and out by the wheel
  for (const [map, id, flags] of [['rw.mill1', 'm1a', { rw_gears: true, rw_mill_open: true }], ['rw.millroad', 'f3', { rw_mill_open: true }]]) {
    await align();
    await p.evaluate(([map, id, flags]) => {
      Object.assign(RB.game.settings, { reducedMotion: false, worldLight: true, muted: true, textSpeed: 'instant', input: 'choice' });
      const place = RB.content.maps[map].foes.find((f) => f.id === id);
      RB.game.debugStart(map, place.x, place.y + 1, { flags: Object.assign({ ['enter:' + map + ':rw.m1_enter']: true, 'enter:rw.millroad:rw.mr_enter': true }, flags) });
      RB.game.startBattle(place.enemy, { place, where: { map, x: place.x, y: place.y }, foeKey: 'ar1:' + id });
    }, [map, id, flags]);
    await ctx.clock.runFor(6000);
    await p.screenshot({ path: path.join(out, 'battle_' + map + '.png') });
    res['battle_' + map] = await p.evaluate(() => ({ mode: RB.game.mode() }));
  }
  await ctx.close();
}

// ---- (2) render cost and cache growth, real clock ----
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => res.errors.push(e.message));
  await p.goto(url);
  await p.waitForFunction(() => window.__RB_READY__ === true, null, { timeout: 30000 });
  for (const [name, map, x, y, flags] of [
    ['mill1', 'rw.mill1', 12, 8, { 'enter:rw.mill1:rw.m1_enter': true, rw_mill_open: true }],
    ['millroad_working', 'rw.millroad', 13, 4, { 'enter:rw.millroad:rw.mr_enter': true, rw_mill_open: true, rw_echo_done: true, 'foe:rw.millroad:f1': true, 'foe:rw.millroad:f2': true, 'foe:rw.millroad:f3': true }],
    ['millroad_jammed', 'rw.millroad', 13, 4, { 'enter:rw.millroad:rw.mr_enter': true, rw_mill_open: true, 'foe:rw.millroad:f1': true, 'foe:rw.millroad:f2': true, 'foe:rw.millroad:f3': true }],
  ]) {
    res['perf_' + name] = await p.evaluate(async ([map, x, y, flags]) => {
      Object.assign(RB.game.settings, { reducedMotion: false, worldLight: true, muted: true });
      RB.propKit.clear();
      const c0 = RB.propKit.cacheSize();
      const a = performance.now();
      RB.game.debugStart(map, x, y, { flags });
      RB.render.frame(performance.now()); // the first frame: the static layer, the light, the sprites made
      const first = performance.now() - a;
      const c1 = RB.propKit.cacheSize();
      const ms = [];
      for (let i = 0; i < 240; i++) { const t0 = performance.now(); RB.render.frame(t0); ms.push(performance.now() - t0); }
      ms.sort((u, v) => u - v);
      const q = (k) => +ms[Math.min(ms.length - 1, Math.floor(ms.length * k))].toFixed(2);
      return { firstFrameMs: +first.toFixed(1), p50: q(0.5), p95: q(0.95), max: q(0.999), cacheBefore: c0, cacheAfterFirst: c1, cacheAfter240: RB.propKit.cacheSize() };
    }, [map, x, y, flags]);
  }
  await ctx.close();
}
fs.writeFileSync(path.join(out, 'reach_perf.json'), JSON.stringify(res, null, 1));
await browser.close();
srv.close();
console.log(JSON.stringify(res));
