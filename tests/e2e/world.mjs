// The world proof (expansion P01; src/engine/65_worldlook.js; docs/future/work/P01_WORLD.md), against the built
// index.html in Chromium, with a synthetic session (never a real save):
//  - without ?dev=world nothing changes: the proof is not allowed, the view is the game's own, and a frame of the
//    village is pixel-identical to one drawn with the proof present but switched off;
//  - with it, the village uses the far view (45 tiles across at 1440×900, whole device pixels per art pixel), a
//    room keeps the near view, and leaving the room brings the far view back;
//  - in the far view a tap still lands on the tile under the finger, and walls still stop the player.
// Usage: node tests/e2e/world.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
async function test(name, fn) {
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 90s')), 90000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.message || e).slice(0, 700)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const tiles = (p) => p.evaluate(() => { const v = RB.render.viewSize(); return { w: +(v.w / 16).toFixed(2), h: +(v.h / 16).toFixed(2), px: +(v.scale * 16).toFixed(2) }; });
const square = (p) => p.evaluate(() => { RB.game.debugStart('rw.village', 22, 18, { comp: 'suzu', flags: { departed: true } }); });

// the camera eases after a resize (the touch controls' band appearing): wait until it rests
async function settled(p) {
  let last = '';
  for (let i = 0; i < 40; i++) {
    const c = await p.evaluate(() => RB.render.cam.x + ',' + RB.render.cam.y);
    if (c === last) return;
    last = c;
    await p.waitForTimeout(150);
  }
  throw new Error('the camera never settled');
}
// one frame drawn at a fixed instant with the game's clock held, as a hash of the canvas's pixels
const frameHash = (p) => p.evaluate(() => {
  RB.render.frame(5000);
  const cv = document.querySelector('canvas');
  const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
  let x = 2166136261;
  for (let i = 0; i < d.length; i += 4) { x ^= d[i] | (d[i + 1] << 8) | (d[i + 2] << 16); x = Math.imul(x, 16777619) >>> 0; }
  return x.toString(16) + ':' + cv.width + 'x' + cv.height;
});

await test('without ?dev=world the game is unchanged: not allowed, the near view, the same pixels as the proof switched off', async () => {
  const { p, ctx, errors, requests } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  await square(p);
  await p.waitForTimeout(300);
  assert(await p.evaluate(() => RB.worldLook.allowed() === false && RB.worldLook.active(RB.world.W.map) === false), 'the proof must not be allowed without the flag');
  const t = await tiles(p);
  assert(t.w === 22.5 && t.px === 64, 'the near view at 1440×900 is 22.5 tiles at 64 css px: ' + JSON.stringify(t));
  assert(!errors.length && !requests.length, 'errors/requests: ' + errors.concat(requests).join('; '));
  // the same held moment drawn three ways in this page: as the game; with the proof allowed but switched off;
  // allowed, on, near view and every layer off. All three must be the same pixels.
  await settled(p);
  await p.clock.install();
  await p.clock.pauseAt(await p.evaluate(() => Date.now() + 50));
  const plain = await frameHash(p);
  await p.evaluate(() => { window.__RB_DEV_WORLD__ = true; RB.worldLook.set({ on: false }); });
  const off = await frameHash(p);
  await p.evaluate(() => RB.worldLook.set({ on: true, view: 'near', kit: false, light: false, atmos: false, soft: false }));
  const bare = await frameHash(p);
  assert(plain === off, 'a frame with the proof switched off differs from the game: ' + plain + ' vs ' + off);
  assert(plain === bare, 'a frame with every layer off and the near view differs from the game: ' + plain + ' vs ' + bare);
  await ctx.close();
});

await test('?dev=world: the village in the far view, a room in the near view, the far view again outside', async () => {
  const { p, ctx, errors, requests } = await page(b, url + '?dev=world', { viewport: { width: 1440, height: 900 } });
  await square(p);
  await p.waitForTimeout(200);
  assert(await p.evaluate(() => RB.worldLook.allowed() && RB.worldLook.active(RB.world.W.map)), 'the proof should be active in the village');
  let t = await tiles(p);
  assert(t.w === 45 && t.px === 32, 'far view at 1440×900: ' + JSON.stringify(t));
  await p.evaluate(() => RB.world.enter('rw.tea'));
  await p.waitForTimeout(200);
  t = await tiles(p);
  assert(t.w === 22.5, 'a room keeps the near view: ' + JSON.stringify(t));
  await p.evaluate(() => RB.world.enter('rw.village', 30, 17, 'down'));
  await p.waitForTimeout(200);
  t = await tiles(p);
  assert(t.w === 45, 'the far view again outside: ' + JSON.stringify(t));
  await p.evaluate(() => RB.worldLook.set({ view: 'near' }));
  t = await tiles(p);
  assert(t.w === 22.5, 'the near view when chosen: ' + JSON.stringify(t));
  assert(!errors.length && !requests.length, 'errors/requests: ' + errors.concat(requests).join('; '));
  await ctx.close();
});

for (const v of [{ tag: '1440×900', viewport: { width: 1440, height: 900 }, dpr: 1 }, { tag: '375×667 phone', viewport: { width: 375, height: 667 }, dpr: 3, mobile: true }]) {
  await test('far view, ' + v.tag + ': a tap walks to the tile under it; the well and a house still block', async () => {
    const { p, ctx, errors } = await page(b, url + '?dev=world', { viewport: v.viewport, dpr: v.dpr, mobile: v.mobile, touch: v.mobile });
    await square(p);
    await settled(p);
    // the middle of tile (24, 19), from the renderer's own mapping, then a real tap/click there
    const goal = [24, 19];
    const pt = await p.evaluate(([x, y]) => { const a = RB.render.tileToCss(x, y), k = RB.render.viewSize().scale * 16; return { x: a.x + k / 2, y: a.y + k / 2 }; }, goal);
    if (v.mobile) await p.touchscreen.tap(pt.x, pt.y); else await p.mouse.click(pt.x, pt.y);
    await p.waitForFunction(([x, y]) => { const pl = RB.world.W.player; return pl.x === x && pl.y === y && !pl.mv; }, goal, { timeout: 6000 });
    // the well stands at (20, 17): walking into it from (21, 17) goes nowhere
    const blocked = await p.evaluate(() => RB.maps.blockedStatic(RB.world.W.map, 20, 17));
    assert(blocked === true, 'the well should block');
    // a house's wall (the teahouse at 28..32 × 12..15): solid
    const wall = await p.evaluate(() => RB.maps.blockedStatic(RB.world.W.map, 29, 13));
    assert(wall === true, 'the teahouse wall should block');
    assert(!errors.length, 'errors: ' + errors.join('; '));
    await ctx.close();
  });
}

await test('W01 layers: each switches on its own; the shadow mask is built once; shade reaches a person; reduced motion holds still; night casts no sun shadows', async () => {
  const { p, ctx, errors, requests } = await page(b, url + '?dev=world', { viewport: { width: 1440, height: 900 } });
  await square(p);
  await settled(p);
  await p.clock.install();
  await p.clock.pauseAt(await p.evaluate(() => Date.now() + 50));
  const set = (o) => p.evaluate((o) => RB.worldLook.set(Object.assign({ on: true, view: 'far', kit: false, light: false, atmos: false, soft: false }, o)), o);
  await set({});
  const bare = await frameHash(p);
  await set({ light: true });
  const light = await frameHash(p);
  await set({ atmos: true });
  const atmos = await frameHash(p);
  await set({ light: true, atmos: true });
  const both = await frameHash(p);
  await set({ light: true, atmos: true, soft: true });
  const soft = await frameHash(p);
  const all = [bare, light, atmos, both, soft];
  assert(new Set(all).size === all.length, 'each layer should change the frame on its own: ' + all.join(' '));
  await set({});
  assert(await frameHash(p) === bare, 'switching the layers off again should give the bare frame back');
  // the map's shadow mask: built once for the map, not per frame
  await set({ light: true, atmos: true });
  await frameHash(p);
  const m0 = await p.evaluate(() => RB.worldLook.stats().masks);
  await p.evaluate(() => { for (let i = 0; i < 30; i++) RB.render.frame(5000 + i * 16); });
  const m1 = await p.evaluate(() => RB.worldLook.stats().masks);
  assert(m1 === m0, 'drawing frames rebuilt the shadow mask: ' + m0 + ' → ' + m1);
  // the teahouse (28..32 × 12..15) shades the ground to its right; the open square in front of it is in sun
  const sh = await p.evaluate(() => { const m = RB.world.W.map; return { right: RB.worldLook.shadeAt(m, { fx: 33, fy: 14 }), open: RB.worldLook.shadeAt(m, { fx: 25, fy: 20 }) }; });
  assert(sh.right > 0 && sh.open === 0, 'shade where expected: ' + JSON.stringify(sh));
  // reduced motion: two instants draw the same frame (no glints, no flicker)
  await p.evaluate(() => { RB.game.settings.reducedMotion = true; RB.game.applySettings(); });
  const r1 = await frameHash(p), r2 = await p.evaluate(() => { RB.render.frame(9000); const cv = document.querySelector('canvas'); const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let x = 2166136261; for (let i = 0; i < d.length; i += 4) { x ^= d[i] | (d[i + 1] << 8) | (d[i + 2] << 16); x = Math.imul(x, 16777619) >>> 0; } return x.toString(16) + ':' + cv.width + 'x' + cv.height; });
  assert(r1 === r2, 'reduced motion: the frame changed between two instants: ' + r1 + ' vs ' + r2);
  assert(!errors.length && !requests.length, 'errors/requests: ' + errors.concat(requests).join('; '));
  await ctx.close();
  // night: the game's own darkness and lights; the proof adds glow, never sun shadows
  const n = await page(b, url + '?dev=world', { viewport: { width: 1440, height: 900 } });
  await n.p.evaluate(() => { RB.game.debugStart('rw.village', 22, 18, { comp: 'suzu', flags: { departed: true, rw_night: true } }); });
  await n.p.waitForTimeout(600);
  const look = await n.p.evaluate(() => ({ mask: !!RB.world.W.map.look, masks: RB.worldLook.stats().masks }));
  assert(!look.mask && look.masks === 0, 'no sun shadows at night: ' + JSON.stringify(look));
  assert(!n.errors.length, 'errors: ' + n.errors.join('; '));
  await n.ctx.close();
});

await test('the development panel: only on a ?dev=world page; its switches work; the visit is offered only with no journey loaded', async () => {
  const plain = await page(b, url, { viewport: { width: 1440, height: 900 } });
  assert(!(await plain.p.$('#wl-dev')), 'the panel must not exist without the flag');
  await plain.ctx.close();
  const { p, ctx, errors } = await page(b, url + '?dev=world', { viewport: { width: 1440, height: 900 } });
  await p.waitForSelector('#wl-dev');
  assert(await p.evaluate(() => RB.save.current().slot == null), 'fixture: no slot is current at the title');
  assert(await p.isVisible('#wl-visit'), 'the visit is offered at the title');
  await p.click('#wl-visit');
  await p.waitForFunction(() => RB.world.W.map && RB.world.W.map.id === 'rw.village');
  await p.click('#wl-dev [data-k="light"]');
  assert(await p.evaluate(() => RB.worldLook.opts.light === false), 'the Light switch should turn the layer off');
  assert(await p.getAttribute('#wl-dev [data-k="light"]', 'aria-pressed') === 'false', 'the switch shows its state');
  await p.click('#wl-dev [data-k="far"]');
  const t = await tiles(p);
  assert(t.w === 22.5, 'Far view off gives the near view: ' + JSON.stringify(t));
  // pretend a journey is loaded: the visit is withdrawn
  await p.evaluate(() => { RB.save.setCurrent(3, 1); RB.worldLook.set({}); });
  assert(!(await p.isVisible('#wl-visit')), 'the visit must not be offered while a save slot is current');
  await p.evaluate(() => RB.save.setCurrent(null, 0));
  assert(!errors.length, 'errors: ' + errors.join('; '));
  await ctx.close();
});

await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
