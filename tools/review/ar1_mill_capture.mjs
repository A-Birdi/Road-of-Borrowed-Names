// AR-1 Mill (the Old Mill's art, F13): the capture recipe, the same for the baseline and the candidate build.
// Deterministic: the page's clock is Playwright's fake clock, installed before load and paused, so time moves only when
// the recipe moves it; Math.random is a fixed-seed generator; every shot starts at a whole minute of the page's
// performance clock with the same random sequence. The same build gives the same pixels, so a before/after pair
// differs only where the builds differ (tools/review/ar1_mill_compare.mjs). Clips step the engine 1000/30 ms of game time
// per frame and capture each frame: speed and duration are exact and equal; the file's 30 fps is the sampling rate.
// Usage: node tools/review/ar1_mill_capture.mjs <build.html> <outDir> [--only=name,name] [--clips] [--no-stills]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
let pw;
try { pw = await import('playwright'); } catch { pw = await import('/opt/node22/lib/node_modules/playwright/index.mjs'); }

const [, , html, out] = process.argv;
const only = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const clips = process.argv.includes('--clips');
const stills = !process.argv.includes('--no-stills');
fs.mkdirSync(out, { recursive: true });
const body = fs.readFileSync(html);
const srv = http.createServer((req, res) => {
  if (req.url.split('?')[0] !== '/') { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  res.end(body);
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const url = 'http://127.0.0.1:' + srv.address().port + '/';
const browser = await pw.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const T0 = new Date('2026-10-17T09:00:00Z');
const SEED = `(() => { let s = 0x2f6b4a1d; Math.random = function () { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; window.__seed = (n) => { s = n | 0; }; })();`;

const VIEWS = {
  desktop: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 },
  // an emulation of a phone (Chromium's mobile + touch emulation), not a phone
  narrow: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const ENTERED = { 'enter:rw.mill1:rw.m1_enter': true, 'enter:rw.millroad:rw.mr_enter': true, 'enter:rw.mill0:rw.m0_enter': true };
const BEATEN = { 'foe:rw.millroad:f1': true, 'foe:rw.millroad:f2': true, 'foe:rw.millroad:f3': true, 'foe:rw.mill0:p1': true, 'foe:rw.mill0:p2': true };
const JAMMED = Object.assign({ rw_mill_open: true }, ENTERED, BEATEN);
const WORKING = Object.assign({}, JAMMED, { rw_gears: true, rw_loft_done: true, rw_echo_done: true, bridge_fixed: true });
const INSIDE = Object.assign({}, ENTERED, BEATEN, { rw_mill_open: true });
const INSIDE_OPEN = Object.assign({}, INSIDE, { rw_gears: true });
// name: [map, x, y, facing, flags, settings]
const SHOTS = {
  stair_landing: ['rw.mill1', 12, 8, 'down', INSIDE, {}],
  stair_front: ['rw.mill1', 12, 10, 'up', INSIDE, {}],
  stair_west: ['rw.mill1', 10, 9, 'right', INSIDE, {}],
  stair_east: ['rw.mill1', 13, 9, 'left', INSIDE, {}],
  stone_beside: ['rw.mill1', 8, 5, 'left', INSIDE, {}],
  pit_stairs: ['rw.mill0', 2, 7, 'up', INSIDE_OPEN, {}],
  wheel_jammed: ['rw.millroad', 13, 4, 'up', JAMMED, {}],
  wheel_working: ['rw.millroad', 13, 4, 'up', WORKING, {}],
  wheel_working_reduced: ['rw.millroad', 13, 4, 'up', WORKING, { reducedMotion: true }],
  wheel_working_nolight: ['rw.millroad', 13, 4, 'up', WORKING, { worldLight: false, reducedMotion: true }],
  wheel_north: ['rw.millroad', 13, 2, 'right', WORKING, {}],
  wheel_door: ['rw.millroad', 9, 6, 'up', WORKING, {}],
};
const NARROW = ['stair_landing', 'pit_stairs', 'wheel_jammed', 'wheel_working'];

async function open(view) {
  const ctx = await browser.newContext(Object.assign({ reducedMotion: 'no-preference' }, VIEWS[view]));
  await ctx.addInitScript(SEED);
  await ctx.clock.install({ time: T0 });
  await ctx.clock.pauseAt(new Date(T0.getTime() + 1000)); // time moves only when the recipe moves it
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto(url);
  for (let i = 0; i < 200 && !(await p.evaluate(() => window.__RB_READY__ === true)); i++) await ctx.clock.runFor(100);
  return { ctx, p, errors };
}
async function place(o, name) {
  const [map, x, y, dir, flags, set] = SHOTS[name];
  // every shot starts at a whole minute of the page's clock with the same random sequence, whatever the page did
  // before (loading takes a different number of steps from run to run)
  const now = await o.p.evaluate(() => performance.now()); // the clock the game draws by
  await o.ctx.clock.runFor(Math.ceil((now + 1000) / 60000) * 60000 - now);
  await o.p.evaluate(([map, x, y, dir, flags, set]) => {
    window.__seed(0x51a7e);
    Object.assign(RB.game.settings, { reducedMotion: false, worldLight: true, muted: true }, set);
    RB.game.debugStart(map, x, y, { flags, dir });
  }, [map, x, y, dir, flags, set]);
  await o.ctx.clock.runFor(4000); // the place name card has come and gone; the camera has settled
}
const meta = { build: html, sha256: (await import('node:crypto')).createHash('sha256').update(body).digest('hex'), clock: T0.toISOString(), shots: {}, clips: {} };

if (stills) for (const view of ['desktop', 'narrow']) {
  const o = await open(view);
  for (const name of Object.keys(SHOTS)) {
    if (only.length && !only.includes(name)) continue;
    if (view === 'narrow' && !NARROW.includes(name)) continue;
    await place(o, name);
    const f = path.join(out, view + '_' + name + '.png');
    await o.p.screenshot({ path: f });
    const st = await o.p.evaluate(() => ({ map: RB.world.W.map.id, x: RB.world.W.player.x, y: RB.world.W.player.y, mode: RB.game.mode(), cam: [Math.round(RB.render.cam.x), Math.round(RB.render.cam.y)], t: performance.now() }));
    meta.shots[view + '_' + name] = Object.assign({ recipe: SHOTS[name], view: VIEWS[view] }, st);
  }
  meta['errors_' + view] = o.errors.slice();
  await o.ctx.close();
}

// Clips: the engine stepped 1000/30 ms of game time per frame and each frame captured (so speed and duration are
// exact and equal before and after; the file's 30 fps is the sampling rate, not the engine's frame rate).
const CLIPS = {
  // the walk up to the working wheel from the mill door, round to the gap on its west side and back
  wheel_walk_working: { shot: 'wheel_door', taps: [[13, 5], [16, 4], [13, 4]], frames: 270, clip: { x: 300, y: 0, width: 760, height: 520 } },
  wheel_walk_jammed: { shot: 'wheel_door', jammed: true, taps: [[13, 5], [16, 4], [13, 4]], frames: 270, clip: { x: 300, y: 0, width: 760, height: 520 } },
  // round the stair-well: west side, the landing, the east side, the front
  stair_walk: { shot: 'stair_west', taps: [[11, 8], [13, 8], [13, 10], [10, 10]], frames: 300, clip: { x: 560, y: 300, width: 600, height: 460 } },
};
if (clips) {
  const o = await open('desktop');
  for (const [name, c] of Object.entries(CLIPS)) {
    if (only.length && !only.includes(name)) continue;
    if (c.jammed) SHOTS.wheel_door_j = ['rw.millroad', 9, 6, 'up', JAMMED, {}];
    await place(o, c.jammed ? 'wheel_door_j' : c.shot);
    const dir = path.join(out, 'clip_' + name);
    fs.mkdirSync(dir, { recursive: true });
    let k = 0, ti = 0;
    for (let i = 0; i < c.frames; i++) {
      // the next tap once the player has stopped (a short pause at each stop)
      const idle = await o.p.evaluate(() => { const p = RB.world.W.player; return !p.mv && !p.route && !RB.world.W.pathTarget; });
      if (idle && ti < c.taps.length && (k++ % 18 === 0)) { const [tx, ty] = c.taps[ti++]; await o.p.evaluate(([tx, ty]) => RB.world.tapTile(tx, ty), [tx, ty]); }
      await o.ctx.clock.runFor(1000 / 30);
      await o.p.screenshot({ path: path.join(dir, String(i).padStart(4, '0') + '.png'), clip: c.clip });
    }
    meta.clips[name] = { frames: c.frames, stepMs: 1000 / 30, clip: c.clip, taps: c.taps };
  }
  meta.errors_clips = o.errors.slice();
  await o.ctx.close();
}
fs.writeFileSync(path.join(out, clips && !stills ? 'clips.json' : 'capture.json'), JSON.stringify(meta, null, 1));
await browser.close();
srv.close();
console.log('captured', Object.keys(meta.shots).length, 'stills,', Object.keys(meta.clips).length, 'clips; errors:', JSON.stringify([meta.errors_desktop, meta.errors_narrow, meta.errors_clips]));
