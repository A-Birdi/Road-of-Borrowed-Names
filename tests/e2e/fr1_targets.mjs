// FR-1 F12: a tap or click on a tall lantern's drawn lamp, which stands in the tile above its footprint, uses the
// lantern, as the action key in front of it does; the rest of that tile, beside and above the picture, is still ground
// to walk to. Mouse and touch, on the road lantern and Reedwake's south lantern. The millstone's picture lies inside
// its own footprint: a click on it inspects it, a click above it walks.
// Usage: node tools/build.mjs && node tests/e2e/fr1_targets.mjs
import { serve, launch } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fails = 0;
const ok = (c, m) => { if (!c) fails++; console.log((c ? '  ok   ' : '  FAIL ') + m); };
const CASES = [
  { name: 'road lantern', map: 'rw.road', start: [10, 9, 'right'], prop: [14, 8], top: true },
  { name: 'south lantern', map: 'rw.village', start: [20, 25, 'up'], prop: [20, 22], top: true },
  { name: 'millstone', map: 'rw.mill1', start: [7, 9, 'up'], prop: [6, 4], w: 2, top: false },
];
for (const touch of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, hasTouch: touch });
  const p = await ctx.newPage();
  await p.goto(url);
  await p.waitForFunction(() => window.RB && RB.game && RB.game.debugStart);
  // the first map of a fresh page builds its caches; and the first touch of a page unlocks audio
  await p.evaluate(() => RB.game.debugStart('rw.road', 10, 9, {}));
  await p.waitForTimeout(1200);
  if (touch) await p.touchscreen.tap(5, 5); else await p.mouse.click(5, 5);
  await p.waitForTimeout(300);
  for (const c of CASES) {
    // a click at (dx, dy) tiles from the footprint's top left middle: did the thing's scene start, or where did you walk
    const tapAt = async (dx, dy) => {
      await p.evaluate((c) => {
        RB.game.debugStart(c.map, c.start[0], c.start[1], {});
        window.__ran = [];
        if (!window.__spy) { window.__spy = true; RB.script.run = function (id) { window.__ran.push(id); return Promise.resolve(); }; }
      }, c);
      await p.waitForTimeout(350);
      await p.evaluate((c) => { RB.test.place(c.start[0], c.start[1], c.start[2]); window.__ran = []; }, c);
      await p.waitForTimeout(120);
      // where the thing is on screen, once the camera has stopped following you there
      const where = () => p.evaluate((c) => { const a = RB.render.tileToCss(c.prop[0], c.prop[1]); const r = document.querySelector('canvas').getBoundingClientRect(); return { x: r.left + a.x, y: r.top + a.y, k: RB.render.tileToCss(1, 0).x - RB.render.tileToCss(0, 0).x }; }, c);
      let box = await where();
      for (let i = 0; i < 40; i++) { await p.waitForTimeout(100); const b2 = await where(); if (Math.abs(b2.x - box.x) < 0.5 && Math.abs(b2.y - box.y) < 0.5) break; box = b2; }
      const x = box.x + ((c.w || 1) / 2 + dx) * box.k, y = box.y + dy * box.k;
      if (touch) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y);
      await p.waitForTimeout(2000);
      return p.evaluate(() => ({ ran: window.__ran.length > 0, at: RB.world.W.player.x + ',' + RB.world.W.player.y }));
    };
    const how = touch ? 'touch' : 'mouse';
    ok((await tapAt(0, 0.5)).ran, c.name + ' (' + how + '): its footprint uses it');
    const lamp = await tapAt(0, -0.4);
    ok(c.top ? lamp.ran : !lamp.ran, c.name + ' (' + how + '): ' + (c.top ? 'its drawn lamp above the footprint uses it' : 'the floor above it is walked to') + ' [' + JSON.stringify(lamp) + ']');
    const above = await tapAt(0, -1.3);
    ok(!above.ran, c.name + ' (' + how + '): above the picture is ground to walk to [' + above.at + ']');
    const side = await tapAt(0.45, -0.25);
    ok(!side.ran, c.name + ' (' + how + '): beside the picture is ground to walk to [' + side.at + ']');
  }
  await ctx.close();
}
await b.close();
srv.close();
console.log(fails ? fails + ' failed' : 'fr1_targets: all passed');
process.exit(fails ? 1 : 0);
