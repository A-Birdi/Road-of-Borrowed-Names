// RBN-QA-104 (Agnes 6341772138; Local CL-198): the cloud sea above the Barrier is drawn as cloud, not water. In
// Chromium on the built game:
//  1. the cloud top's maps (Above the Cloud, Kumoi, the Rope Bridge, the summit) draw their sea in the cloud style;
//     the Cloudroad's own rivers (Sakashita, leg 3, Kirishita) keep the river's;
//  2. over a few seconds of play, the cloud sea catches no glints (the world look's sun sparkle), while a river on the
//     Cloudroad does;
//  3. its animation is one faint drifting wisp per tile: never the water's bright glint dashes, never the foam colour,
//     always under a third of full strength; a river tile still draws its glints;
//  4. the cloud is impassable, every tile of it on all four maps, as before;
//  5. no page errors.
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const CLOUD = [['cr.above', 18, 13], ['cr.kumoi', 14, 17], ['cr.pass2', 10, 10], ['cr.summit', 17, 10]];
const RIVER = [['cr.sakashita', 12, 16], ['cr.leg3', 14, 10], ['cr.kirishita', 12, 16]];
const { p, errors } = await page(b, url);

const go = (m, x, y) => p.evaluate(async ([m, x, y]) => {
  RB.game.G.settings.reducedMotion = false;
  RB.game.debugStart(m, x, y, { comp: 'nao', dir: 'down', flags: { departed: true } });
  await new Promise((r) => setTimeout(r, 900));
  const M = RB.world.W.map;
  return { map: M.id, style: RB.tileArt.kit(RB.tiles.PAL[M.region]).st.water };
}, [m, x, y]);

// 1. the styles
const styles = {};
for (const [m, x, y] of CLOUD.concat(RIVER)) styles[m] = (await go(m, x, y)).style;
ok(CLOUD.every(([m]) => styles[m] === 'cloud') && RIVER.every(([m]) => styles[m] === 'river'),
  'the cloud top\'s four maps draw their sea as cloud; the Cloudroad\'s rivers stay rivers (' + JSON.stringify(styles) + ')');

// 2. glints: the world look's sparkle is drawn with this colour, composited 'lighter'
async function sparkles(m, x, y) {
  await go(m, x, y);
  return p.evaluate(async () => {
    // the world is drawn into an offscreen buffer as well as onscreen canvases: watch both kinds of context
    const protos = [window.CanvasRenderingContext2D, window.OffscreenCanvasRenderingContext2D].filter(Boolean).map((k) => k.prototype);
    const orig = protos.map((q) => q.fillRect);
    let n = 0;
    protos.forEach((q, i) => { q.fillRect = function () { if (typeof this.fillStyle === 'string' && /^rgba\(255,\s*246,\s*214/.test(this.fillStyle)) n++; return orig[i].apply(this, arguments); }; });
    await new Promise((r) => setTimeout(r, 4000));
    protos.forEach((q, i) => { q.fillRect = orig[i]; });
    return n;
  });
}
const sCloud = await sparkles('cr.above', 18, 13), sRiver = await sparkles('cr.leg3', 14, 10);
ok(sCloud === 0 && sRiver > 0, 'over four seconds, the cloud sea catches no glints; a Cloudroad river does (' + JSON.stringify({ cloud: sCloud, river: sRiver }) + ')');

// 3. the tile animation, drawn into a recording context through a whole cycle
async function animOf(m, x, y) {
  await go(m, x, y);
  return p.evaluate(() => {
    const M = RB.world.W.map, pal = RB.tiles.PAL[M.region];
    let tx = -1, ty = -1;
    for (let yy = 1; yy < M.h - 1 && tx < 0; yy++) for (let xx = 1; xx < M.w - 1; xx++) {
      const t = M.tiles[yy * M.w + xx];
      if (t.anim2 && t.water && t.id !== 'darkwater' && [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dy]) => M.tiles[(yy + dy) * M.w + xx + dx].water)) { tx = xx; ty = yy; break; }
    }
    if (tx < 0) return null;
    const tile = M.tiles[ty * M.w + tx], K = RB.tileArt.kit(pal), foam = K.hex.foam.toLowerCase(), styles = new Set();
    let calls = 0, foamCalls = 0, maxAlpha = 0, dash = 0;
    const ctx = {
      fillStyle: '', globalAlpha: 1, save() { this._a = this.globalAlpha; }, restore() { this.globalAlpha = this._a; },
      fillRect(x, y, w, h) { calls++; styles.add(String(this.fillStyle).toLowerCase()); if (String(this.fillStyle).toLowerCase() === foam) foamCalls++; if (h === 1 && w >= 4 && this.globalAlpha >= 0.99) dash++; maxAlpha = Math.max(maxAlpha, this.globalAlpha); },
    };
    for (let t = 0; t < 16000; t += 100) tile.anim2(ctx, 0, 0, pal, t, tx, ty, false);
    return { at: [tx, ty], calls, foamCalls, dash, maxAlpha: +maxAlpha.toFixed(3) };
  });
}
const aCloud = await animOf('cr.above', 18, 13), aRiver = await animOf('cr.leg3', 14, 10);
ok(aCloud && aCloud.calls > 0 && aCloud.foamCalls === 0 && aCloud.dash === 0 && aCloud.maxAlpha < 0.34,
  'the cloud sea\'s animation is a faint drifting wisp: no foam colour, no full-strength glint dashes, never above a third of full strength (' + JSON.stringify(aCloud) + ')');
ok(aRiver && aRiver.dash > 0 && aRiver.foamCalls > 0, 'a river tile on the Cloudroad still draws its glints (' + JSON.stringify(aRiver) + ')');

// 4. impassable
const walls = [];
for (const [m, x, y] of CLOUD) {
  await go(m, x, y);
  walls.push(await p.evaluate(() => {
    const M = RB.world.W.map;
    let n = 0, open = 0;
    for (let yy = 0; yy < M.h; yy++) for (let xx = 0; xx < M.w; xx++) {
      const t = M.tiles[yy * M.w + xx];
      if (!t.water || t.id === 'darkwater') continue;
      const onBridge = M.tiles[yy * M.w + xx].id === 'bridgeH' || M.tiles[yy * M.w + xx].id === 'bridgeV';
      if (onBridge) continue;
      n++;
      if (!RB.world.blocked(xx, yy)) open++;
    }
    return { map: M.id, cloud: n, open };
  }));
}
ok(walls.every((w) => w.cloud > 0 && w.open === 0), 'the cloud is impassable, every tile of it on all four maps (' + JSON.stringify(walls) + ')');

ok(errors.length === 0, 'no page errors' + (errors.length ? ' (' + errors.slice(0, 3).join(' | ') + ')' : ''));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
