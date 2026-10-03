// The prologue's shots in the built index.html (src/ui/41*_prologue_*.js), at a
// desktop (1920×1080, 1280×800), an upright phone (390×844) and a landscape
// phone (844×390):
//  - the real flow: Next steps through all six shots, each a different picture,
//    the last Next reaches the creation folio and the shots' caches are released;
//  - every shot draws at the start, middle and end, moving and with reduced
//    motion, at the screen's own buffer size, and is a picture (not one flat colour);
//  - the traveller walks the road: at every moment of the shot the pixel of the
//    title scene under their feet is road, not river; the walk starts above the
//    caption slip, goes up the road (away), and the figure shrinks with distance;
//    with reduced motion they stand still. For comparison the old path (the
//    screen's centre column, as drawn before) is sampled on the same scene;
//  - the riverbank lantern's name leaves it: fewer ink pixels as the shot goes on;
//  - no console errors and no network requests.
// Usage: node tests/e2e/prologue.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0, pass = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const VPS = [['1920x1080', { width: 1920, height: 1080 }, 1], ['1280x800', { width: 1280, height: 800 }, 1], ['390x844', { width: 390, height: 844 }, 3], ['844x390', { width: 844, height: 390 }, 3]];

for (const [tag, vp, dpr] of VPS) {
  const { p, errors, requests } = await page(b, url, { viewport: vp, dpr, mobile: dpr > 1, touch: dpr > 1 });
  await p.click('text=New Game');
  await p.click('.slot[data-slot="1"] [data-a=start]');
  await p.waitForSelector('.cr-prologue .slip');
  await p.waitForTimeout(400);

  // ---- deterministic checks on offscreen buffers of the screen's size
  const r = await p.evaluate(() => {
    const vs = RB.render.viewSize(), w = Math.round(vs.w * 2), h = Math.round(vs.h * 2);
    const a = document.getElementById('world').getBoundingClientRect(), s = document.querySelector('.cr-prologue .slip').getBoundingClientRect();
    const vb = ((s.top - a.top) * h) / a.height;
    const mkc = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return g; };
    const out = { w, h, vb, shots: {}, walk: [], old: { river: 0, off: 0, n: 0 } };
    // every shot, start / middle / end, moving and still
    for (const kind of ['road', 'tea', 'cup', 'lantern', 'bridge', 'walker']) {
      const res = [];
      for (const still of [false, true]) for (const k of [0, 0.5, 1]) {
        const g = mkc();
        let err = null;
        const t0 = performance.now();
        try { RB.prologueArt.draw(kind, g, w, h, 5000 + k * 3000, k, { vb, still }); } catch (e) { err = String(e); }
        const ms = performance.now() - t0;
        const d = g.getImageData(0, 0, w, h).data, seen = new Set();
        for (let i = 0; i < d.length; i += 4 * 97) seen.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
        res.push({ still, k, err, colours: seen.size, ms: Math.round(ms) });
      }
      out.shots[kind] = res;
    }
    // the traveller: the scene alone, then where the feet are at each moment
    const g0 = mkc();
    RB.ui.title.drawBackdrop(g0, w, h, 0);
    const scene = g0.getImageData(0, 0, w, h).data;
    const px = (x, y) => { x = Math.max(0, Math.min(w - 1, Math.round(x))); y = Math.max(0, Math.min(h - 1, Math.round(y))); const o = (y * w + x) * 4; return [scene[o], scene[o + 1], scene[o + 2]]; };
    const river = (c) => c[2] - c[0] > 30; // the river is blue against the road's grey-violet
    const G = RB.ui.title.roadGuide(w, h);
    for (let k = 0; k <= 1.0001; k += 0.05) {
      const W = RB.prologueArt.walkerAt(w, h, k, vb, false);
      const under = [px(W.x, W.y), px(W.x - 2, W.y), px(W.x + 2, W.y)];
      const [rc, hw] = G.at(W.y);
      out.walk.push({ k: +k.toFixed(2), x: W.x, y: W.y, H: W.H, river: under.filter(river).length, off: Math.abs(W.x - rc) / hw });
      // the old path: the screen's centre column, from 95 % of the height up by 20 %
      const oy = h * 0.95 - k * h * 0.2, [orc, ohw] = G.at(oy);
      out.old.n++; if (river(px(w / 2, oy))) out.old.river++; if (Math.abs(w / 2 - orc) > ohw) out.old.off++;
    }
    out.hz = G.hz;
    out.still = [0, 0.5, 1].map((k) => RB.prologueArt.walkerAt(w, h, k, vb, true)).map((W) => W.x + ',' + W.y + ',' + W.H);
    // the figure is drawn where walkerAt says
    const gw = mkc(); RB.prologueArt.draw('walker', gw, w, h, 1000, 0.5, { vb, still: false });
    const W5 = RB.prologueArt.walkerAt(w, h, 0.5, vb, false), dw = gw.getImageData(0, 0, w, h).data;
    let diff = 0;
    for (let y = W5.y - W5.H; y <= W5.y; y++) for (let x = W5.x - 4; x <= W5.x + 4; x++) { const o = (y * w + x) * 4; if (Math.abs(dw[o] - scene[o]) + Math.abs(dw[o + 1] - scene[o + 1]) + Math.abs(dw[o + 2] - scene[o + 2]) > 30) diff++; }
    out.figurePx = diff;
    // the lantern's name: pixels in the ink's own colours (a stroke that has begun to go is paler, then gone)
    const INK = new Set(RB.pxkit.ramp('#2a1418', 3, { n: 3, at: 1, line: false }).map((c) => (c[0] << 16) | (c[1] << 8) | c[2]));
    out.ink = [0.05, 0.4, 0.95].map((k) => {
      const g = mkc(); RB.prologueArt.draw('lantern', g, w, h, 1000, k, { vb, still: true });
      const d = g.getImageData(0, 0, w, h).data;
      let n = 0;
      for (let i = 0; i < d.length; i += 4) if (INK.has((d[i] << 16) | (d[i + 1] << 8) | d[i + 2])) n++;
      return n;
    });
    out.stats = RB.prologueArt.stats();
    return out;
  });
  for (const [kind, res] of Object.entries(r.shots)) {
    const errs = res.filter((x) => x.err);
    ok(!errs.length, tag + ' ' + kind + ': draws at start, middle and end, moving and still' + (errs.length ? ' ' + errs[0].err : ''));
    ok(res.every((x) => x.colours >= 12), tag + ' ' + kind + ': a picture, not a flat fill (sampled colours ' + Math.min(...res.map((x) => x.colours)) + '–' + Math.max(...res.map((x) => x.colours)) + ')');
    console.log('     ' + tag + ' ' + kind + ' draw ms: first ' + res[0].ms + ', then ' + res.slice(1).map((x) => x.ms).join('/'));
  }
  const wk = r.walk;
  ok(wk.every((s) => s.river === 0), tag + ' traveller: the scene under their feet is road at every moment (' + wk.filter((s) => s.river).length + ' of ' + wk.length + ' moments over water)');
  ok(wk.every((s) => s.off < 0.5), tag + ' traveller: walks the middle of the road (furthest ' + Math.max(...wk.map((s) => s.off)).toFixed(2) + ' of the half-width from its centre)');
  ok(wk[0].y < r.vb && wk[0].y > r.vb - 12, tag + ' traveller: starts on the road just above the caption slip (feet at ' + wk[0].y + ', slip at ' + Math.round(r.vb) + ')');
  ok(wk.every((s, i) => !i || s.y <= wk[i - 1].y) && wk[wk.length - 1].y - r.hz <= (wk[0].y - r.hz) * 0.5, tag + ' traveller: goes up the road, away from us, at least halfway to the horizon (' + wk[0].y + ' → ' + wk[wk.length - 1].y + ', horizon ' + r.hz + ')');
  ok(wk.every((s, i) => !i || s.H <= wk[i - 1].H) && wk[wk.length - 1].H <= Math.ceil(wk[0].H * 0.45) && wk[0].H <= 50, tag + ' traveller: shrinks with distance (' + wk.map((s) => s.H).filter((v, i, a) => a.indexOf(v) === i).join(' → ') + ' px)');
  ok(r.still[0] === r.still[1] && r.still[1] === r.still[2], tag + ' traveller: with reduced motion stands still (' + r.still[0] + ')');
  ok(r.figurePx > 20, tag + ' traveller: drawn where the walk says (' + r.figurePx + ' px changed)');
  console.log('     ' + tag + ' for comparison, the old path (the screen centre) was off the road at ' + r.old.off + ' of ' + r.old.n + ' moments (its foot pixel over water at ' + r.old.river + ')');
  ok(r.ink[0] > r.ink[1] && r.ink[1] > r.ink[2] && r.ink[2] === 0, tag + ' lantern: its name leaves it, stroke by stroke (ink pixels ' + r.ink.join(' → ') + ')');
  ok(r.stats.layers <= 6, tag + ' cached static layers stay few (' + r.stats.layers + ')');

  // ---- the real flow: Next through all six shots, each a different picture
  const hashes = [];
  for (let i = 0; i < 6; i++) {
    await p.waitForTimeout(1300);
    hashes.push(await p.evaluate(() => { const c = document.getElementById('world'), g = document.createElement('canvas'); g.width = 64; g.height = 36; const x = g.getContext('2d'); x.drawImage(c, 0, 0, 64, 36); const d = x.getImageData(0, 0, 64, 36).data; let hsh = 0; for (let j = 0; j < d.length; j += 4) hsh = (hsh * 31 + d[j] + d[j + 1] * 3 + d[j + 2] * 7) >>> 0; return hsh; }));
    await p.click('.cr-prologue [data-a=next]');
  }
  ok(new Set(hashes).size === 6, tag + ' flow: six different pictures');
  await p.waitForSelector('.folio-create #nm');
  const after = await p.evaluate(() => RB.prologueArt.stats());
  ok(after.layers === 0 && after.figures === 0, tag + ' flow: the last Next reaches creation and the shots\' caches are released ' + JSON.stringify(after));
  ok(!errors.length, tag + ' no console errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  ok(!requests.length, tag + ' no network requests' + (requests.length ? ': ' + requests.slice(0, 3).join(' ') : ''));
  await p.close();
}
await b.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
