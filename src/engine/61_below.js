/* The view from height. An elevated outdoor map (the top of the lighthouse,
 * a fire lookout) names the ground it stands over, and the world past its
 * deck is that ground, far below:
 *
 *   surround: { below: 'sg.harbor' | [{ if, map }, …],   the ground map (first that holds)
 *               at: [gx, gy],      the ground point (tiles) at the foot of the structure
 *               hide: [x, y, w, h] the structure itself on the ground map (left out)
 *               scale: 0.5,        how small the ground is drawn
 *               drop: 1.75,        how far below the deck's south edge the foot appears (deck tiles)
 *               shaft: 'stone' | 'timber', top: 3, foot: 1.6,  the structure seen dropping away:
 *                                  half its width under the deck (deck tiles) and at the foot (ground tiles)
 *               beyond: { left: 'water' } }   optional: the tile past a side of the ground map
 *                                  (otherwise its edge carries on, trees and all)
 *
 * The ground is the real map: its tiles (the edge carrying on past it, as
 * outdoors), its props and buildings, under the story state now (a prop or
 * building whose condition fails is not there, so the causeway fog lifts
 * when the wind comes back), at art resolution, then shrunk onto the same
 * pixel grid by picking, for each new pixel, the covered colour nearest
 * their mean (never a blend: the palette stays the art's own), with a
 * little haze for the distance. It is placed so that `at` lies at the foot
 * of the shaft drawn below the deck's south edge, and moves less than the
 * deck when the view moves (and a little as you walk about, unless motion
 * is reduced): parallax, so it reads as far below. Haze thickens toward the
 * edges of the view; at night the deck's own darkness falls on it and the
 * ground's lanterns and lit windows shine through afterwards; where the sea
 * shows, the deck's ambient.sea ('calm' | 'wind') adds glints or small
 * whitecaps. Void tiles of such a deck are left transparent, so the ground
 * shows round a platform that is smaller than its map.
 *
 * One built backdrop per (deck map, ground map, state, region): kept while
 * you are on that map, released when you leave it. RB.below.state() and
 * .project() serve the tests. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.below = (function () {
  'use strict';
  const TS = 16, ART = 2, ATS = TS * ART;
  const entries = new Map(); // key → backdrop, for the deck map in `owner` only
  let owner = null;
  const stats = { builds: 0, lastMs: 0, maxMs: 0, released: 0 };
  let last = null; // what was drawn last frame (for the tests)

  const spec = (m) => { const s = m && m.def && m.def.surround; return s && typeof s === 'object' && s.below ? s : null; };
  const active = (m) => !!spec(m);
  const ci = (v, n) => (v < 0 ? 0 : v >= n ? n - 1 : v);
  const SCENERY = { tree: 1, orchard: 1, pine: 1, deadtree: 1, bush: 1, reeds: 1, rock: 1, stump: 1 };
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  function groundId(sp, st) {
    if (typeof sp.below === 'string') return sp.below;
    for (const b of sp.below) if (!b.if || RB.state.test(st, b.if)) return b.map;
    return null;
  }
  // the walkable deck: the bounding box of the map's tiles that are not void
  function deckOf(m) {
    if (m.deck) return m.deck;
    let x0 = m.w, y0 = m.h, x1 = -1, y1 = -1;
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.tiles[y * m.w + x].id !== 'void') { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    return (m.deck = x1 < 0 ? { x0: 0, y0: 0, x1: m.w, y1: m.h } : { x0, y0, x1: x1 + 1, y1: y1 + 1 });
  }
  const nightOf = (amb) => (amb && amb.dark || 0) >= 0.3;
  const hidden = (sp, x, y, w, h) => { const r = sp.hide; return !!r && x < r[0] + r[2] && x + w > r[0] && y < r[1] + r[3] && y + h > r[1]; };
  // which of the ground's conditional things are there now (part of the cache key)
  function stateSig(gm, st) {
    let s = '';
    for (const p of gm.props) if (p.if) s += RB.state.test(st, p.if) ? '1' : '0';
    for (const b of gm.structs) if (b.if) s += RB.state.test(st, b.if) ? '1' : '0';
    return s;
  }

  // ---- building the backdrop -------------------------------------------------------------------
  // Shrink by sc onto the same pixel grid: each new pixel takes the covered
  // colour nearest the covered mean (fully transparent sources are skipped).
  function shrink(src, sc) {
    const sw = src.width, sh = src.height;
    const d = src.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, sw, sh).data;
    const dw = Math.max(1, Math.floor(sw * sc)), dh = Math.max(1, Math.floor(sh * sc));
    const out = RB.sprites.makeCanvas(dw, dh), oc = out.getContext('2d');
    const img = oc.createImageData(dw, dh), o = img.data;
    const cand = new Int32Array(16);
    for (let Y = 0; Y < dh; Y++) {
      const y0 = Y / sc, y1 = (Y + 1) / sc;
      for (let X = 0; X < dw; X++) {
        const x0 = X / sc, x1 = (X + 1) / sc;
        let n = 0, r = 0, g = 0, b = 0;
        for (let y = Math.floor(y0); y < Math.min(sh, Math.ceil(y1)); y++) for (let x = Math.floor(x0); x < Math.min(sw, Math.ceil(x1)); x++) {
          const q = (y * sw + x) * 4;
          if (d[q + 3] < 128) continue;
          r += d[q]; g += d[q + 1]; b += d[q + 2];
          if (n < 16) cand[n] = q;
          n++;
        }
        if (!n) continue;
        const m = Math.min(n, 16);
        r /= n; g /= n; b /= n;
        let best = cand[0], bd = 1e9;
        for (let i = 0; i < m; i++) { const q = cand[i], e = (d[q] - r) ** 2 + (d[q + 1] - g) ** 2 + (d[q + 2] - b) ** 2; if (e < bd) { bd = e; best = q; } }
        const p = (Y * dw + X) * 4;
        o[p] = d[best]; o[p + 1] = d[best + 1]; o[p + 2] = d[best + 2]; o[p + 3] = 255;
      }
    }
    oc.putImageData(img, 0, 0);
    return out;
  }
  // The ground drawn at art resolution over `reg` (tiles), under the story state now.
  function render(sp, gm, st, night, reg) {
    const pal = RB.tiles.PAL[gm.region] || RB.tiles.PAL.reedwake;
    const W = (reg.x1 - reg.x0) * ATS, H = (reg.y1 - reg.y0) * ATS;
    const big = RB.sprites.makeCanvas(W, H);
    const c = big.getContext('2d', { willReadFrequently: true });
    c.imageSmoothingEnabled = false;
    // ground: past the map's edge it carries on (its edge row repeated, as outdoors), or is what
    // the surround names for that side (beyond: { left: 'water' }: the sea past the point)
    const tileG = tileOf(sp, gm), by = sp.beyond || {};
    const outside = (x, y) => x < 0 || y < 0 || x >= gm.w || y >= gm.h;
    const named = (x, y) => (x < 0 && by.left) || (x >= gm.w && by.right) || (y < 0 && by.top) || (y >= gm.h && by.bottom);
    for (let y = reg.y0; y < reg.y1; y++)
      for (let x = reg.x0; x < reg.x1; x++) {
        const t = tileG(x, y);
        const nb = (dx, dy) => tileG(x + dx, y + dy);
        const px = (x - reg.x0) * ATS, py = (y - reg.y0) * ATS;
        if (t.draw2) t.draw2(c, px, py, pal, RB.tiles.hh(x, y), nb, x, y);
        else { c.save(); c.scale(ART, ART); t.draw(c, px / ART, py / ART, pal, RB.tiles.hh(x, y), nb); c.restore(); }
      }
    if (RB.tileArt && RB.tileArt.flush) RB.tileArt.flush();
    const t1 = now();
    // props and buildings that are there now (not the structure itself), back to front, held
    // still; anything whose art may reach into the region (art rises above its footprint)
    const near = (x, y, w, h) => x + w >= reg.x0 - 2 && x <= reg.x1 + 2 && y + h >= reg.y0 - 1 && y <= reg.y1 + 4;
    const list = [];
    // the edge's trees, rocks and reeds carry on past it too (thinned, by position)
    const edgeThing = new Map();
    for (const p of gm.props) if (p.auto && SCENERY[p.p]) edgeThing.set(p.y * gm.w + p.x, p.p);
    for (let y = reg.y0 - 1; y < reg.y1 + 3; y++) for (let x = reg.x0 - 2; x < reg.x1 + 2; x++) {
      if (!outside(x, y) || named(x, y)) continue;
      const k = edgeThing.get(ci(y, gm.h) * gm.w + ci(x, gm.w));
      if (!k || RB.tiles.hh(x, y, 11) % 10 > 6) continue;
      const pd = RB.props.P[k];
      if (!pd || !pd.draw2) continue;
      list.push({ z: (y + 1) * TS - 0.5, draw: () => pd.draw2(c, (x - reg.x0) * ATS, (y - reg.y0) * ATS, pal, 0, { cx: x, cy: y, still: true }) });
    }
    for (const p of gm.props) {
      if (p.if && !RB.state.test(st, p.if)) continue;
      const pd = RB.props.P[p.p];
      if (!pd) continue;
      const pw = p.w || pd.w, ph = p.h || pd.h;
      if (hidden(sp, p.x, p.y, pw, ph) || !near(p.x, p.y, pw, ph)) continue;
      const opts = Object.assign({ cx: p.x, cy: p.y, still: true }, p.o || {});
      list.push({ z: (p.y + ph) * TS - (pd.block === false ? 12 : 0) - 0.5, draw: () => {
        const x = (p.x - reg.x0) * ATS, y = (p.y - reg.y0) * ATS;
        if (pd.draw2) pd.draw2(c, x, y, pal, 0, opts);
        else { c.save(); c.scale(ART, ART); pd.draw(c, x / ART, y / ART, pal, 0, opts); c.restore(); }
      } });
    }
    for (const b of gm.structs) {
      if (b.if && !RB.state.test(st, b.if)) continue;
      if (hidden(sp, b.x, b.y, b.w, b.h) || !near(b.x, b.y, b.w, b.h)) continue;
      const kind = b.type || 'house', o = Object.assign({ night }, b);
      const d2 = RB.props.STRUCT2 && RB.props.STRUCT2[kind];
      list.push({ z: (b.y + b.h) * TS, draw: () => {
        const x = (b.x - reg.x0) * ATS, y = (b.y - reg.y0) * ATS;
        if (d2) d2(c, x, y, pal, 0, o);
        else { c.save(); c.scale(ART, ART); RB.props.STRUCT[kind](c, x / ART, y / ART, pal, 0, o); c.restore(); }
      } });
    }
    list.sort((a, b) => a.z - b.z);
    for (const e of list) e.draw();
    return { big, t1 };
  }
  function tileOf(sp, gm) {
    const by = sp.beyond || {}, TT = RB.tiles.T;
    return (x, y) => (x < 0 && by.left ? TT[by.left] : x >= gm.w && by.right ? TT[by.right] : y < 0 && by.top ? TT[by.top] : y >= gm.h && by.bottom ? TT[by.bottom] : null) || gm.tiles[ci(y, gm.h) * gm.w + ci(x, gm.w)];
  }
  // the ground's lanterns and lit windows (at night, drawn over the deck's darkness)
  function lightsOf(sp, gm, st, night) {
    const out = [];
    for (const p of gm.props) {
      if (p.if && !RB.state.test(st, p.if)) continue;
      const pd = RB.props.P[p.p];
      if (!pd || !(pd.light || p.light) || (p.o && p.o.lit === false) || hidden(sp, p.x, p.y, 1, 1)) continue;
      out.push({ x: p.x + 0.5, y: p.y + 0.15, r: (p.light || pd.light) / TS });
    }
    for (const b of gm.structs) {
      if ((b.if && !RB.state.test(st, b.if)) || hidden(sp, b.x, b.y, b.w, b.h) || !(b.lit || night)) continue;
      for (const wx of b.windows || []) out.push({ x: b.x + wx + 0.5, y: b.y + b.h - 0.62, r: 1.1 });
    }
    return out;
  }
  // a little haze for the distance, baked in
  function haze(g, night, x, y, w, h) { g.fillStyle = night ? 'rgba(20,14,40,0.10)' : 'rgba(205,226,232,0.12)'; g.fillRect(x, y, w, h); }
  // the scale snapped so a tile is a whole number of pixels (a patch then lines up exactly)
  const scaleOf = (sp) => Math.max(4, Math.round(ATS * (sp.scale || 0.5))) / ATS;
  function build(m, sp, gm, st, night, reg, bits) {
    const t0 = now(), sc = scaleOf(sp);
    const { big, t1 } = render(sp, gm, st, night, reg);
    const t2 = now();
    const mini = shrink(big, sc);
    const t3 = now();
    big.width = big.height = 1; // release the full-size canvas now
    haze(mini.getContext('2d'), night, 0, 0, mini.width, mini.height);
    // where the sea shows: one spot per tile of water for glints and whitecaps
    const water = [], tileG = tileOf(sp, gm);
    for (let y = reg.y0; y < reg.y1; y++) for (let x = reg.x0; x < reg.x1; x++) {
      const t = tileG(x, y);
      if (!t.water || t.id === 'darkwater') continue;
      const h = RB.tiles.hh(x, y, 77);
      water.push({ x: ((x - reg.x0) * ATS + 4 + (h % 24)) * sc, y: ((y - reg.y0) * ATS + 6 + ((h >>> 5) % 20)) * sc, h });
    }
    const ms = Math.round(now() - t0);
    stats.builds++; stats.lastMs = ms; stats.maxMs = Math.max(stats.maxMs, ms);
    stats.last = { kind: 'build', tiles: Math.round(t1 - t0), things: Math.round(t2 - t1), shrink: Math.round(t3 - t2), size: [reg.x1 - reg.x0, reg.y1 - reg.y0] };
    return { cv: mini, reg, sc, lights: lightsOf(sp, gm, st, night), water, ms, night, ground: gm.id, bits };
  }
  // The story moved on while you are up here (the fog lifting): redraw only where the
  // ground's conditional things changed, into the backdrop already built.
  function patch(e, sp, gm, st, bits) {
    const t0 = now();
    let d = null;
    const grow = (x0, y0, x1, y1) => { d = d ? { x0: Math.min(d.x0, x0), y0: Math.min(d.y0, y0), x1: Math.max(d.x1, x1), y1: Math.max(d.y1, y1) } : { x0, y0, x1, y1 }; };
    let i = 0;
    for (const p of gm.props) if (p.if) { if (bits[i] !== e.bits[i]) { const pd = RB.props.P[p.p] || {}; grow(p.x - 2, p.y - 3, p.x + (p.w || pd.w || 1) + 2, p.y + (p.h || pd.h || 1) + 1); } i++; }
    for (const b of gm.structs) if (b.if) { if (bits[i] !== e.bits[i]) grow(b.x - 1, b.y - 5, b.x + b.w + 1, b.y + b.h + 1); i++; }
    if (d) {
      const r = { x0: Math.max(e.reg.x0, d.x0), y0: Math.max(e.reg.y0, d.y0), x1: Math.min(e.reg.x1, d.x1), y1: Math.min(e.reg.y1, d.y1) };
      if (r.x1 > r.x0 && r.y1 > r.y0) {
        const { big } = render(sp, gm, st, e.night, r);
        const piece = shrink(big, e.sc);
        big.width = big.height = 1;
        haze(piece.getContext('2d'), e.night, 0, 0, piece.width, piece.height);
        const ppt = Math.round(ATS * e.sc);
        e.cv.getContext('2d').drawImage(piece, (r.x0 - e.reg.x0) * ppt, (r.y0 - e.reg.y0) * ppt);
      }
    }
    e.bits = bits;
    e.lights = lightsOf(sp, gm, st, e.night);
    const ms = Math.round(now() - t0);
    stats.patches = (stats.patches || 0) + 1; stats.lastPatchMs = ms;
    stats.last = { kind: 'patch', ms, rect: d };
  }

  // ---- placing it -----------------------------------------------------------------------------
  // Where the foot of the structure is on screen this frame (art px), with the parallax.
  function footOf(m, sp, env) {
    const D = deckOf(m), sc = scaleOf(sp);
    const cx = (D.x0 + D.x1) / 2, cy = (D.y0 + D.y1) / 2;
    const vw = env.bw / ART, vh = env.bh / ART;
    // the ground moves at `sc` of the deck's rate when the view moves
    const refX = cx * TS - vw / 2, refY = cy * TS - vh / 2;
    let px = (env.cam.x - refX) * ART * (1 - sc), py = (env.cam.y - refY) * ART * (1 - sc);
    // and a little as you walk about (as your eye moves over the edge)
    if (!env.still && env.player) { px -= (env.player.fx + 0.5 - cx) * 5; py -= (env.player.fy + 0.5 - cy) * 4; }
    return {
      x: env.ax(cx * TS) + px, y: env.ay(D.y1 * TS) + (sp.drop || 1.5) * ATS + py,
      top: { x: env.ax(cx * TS), y: env.ay(D.y1 * TS) }, D, sc,
    };
  }
  // the ground tiles this frame needs, padded so walking about does not rebuild
  function needed(sp, F, env) {
    const s = F.sc * ATS, at = sp.at;
    return {
      x0: Math.floor(at[0] + (0 - F.x) / s) - 1, x1: Math.ceil(at[0] + (env.bw - F.x) / s) + 1,
      y0: Math.floor(at[1] + (0 - F.y) / s) - 1, y1: Math.ceil(at[1] + (env.bh - F.y) / s) + 1,
    };
  }
  // The tiles needed wherever the view can go on this map at this size (a map taller or wider
  // than the view scrolls; the ground then slides at its own rate), so walking about never
  // rebuilds: the union of what the view's extreme positions need.
  function reach(m, sp, env) {
    const vw = env.bw / ART, vh = env.bh / ART, mw = m.w * TS, mh = m.h * TS;
    const xs = mw <= vw ? [env.cam.x] : [Math.min(env.cam.x, 0), Math.max(env.cam.x, mw - vw)];
    const ys = mh <= vh * 0.7 ? [env.cam.y] : [Math.min(env.cam.y, 0), Math.max(env.cam.y, mh - vh * 0.7)];
    let u = null;
    for (const x of xs) for (const y of ys) {
      const cam = { x, y }, ax = (lx) => Math.round((lx - x) * ART), ay = (ly) => Math.round((ly - y) * ART);
      const n = needed(sp, footOf(m, sp, Object.assign({}, env, { cam, ax, ay })), env);
      u = u ? { x0: Math.min(u.x0, n.x0), y0: Math.min(u.y0, n.y0), x1: Math.max(u.x1, n.x1), y1: Math.max(u.y1, n.y1) } : n;
    }
    return u;
  }
  function backdrop(m, sp, env) {
    const st = RB.game.s;
    const gid = groundId(sp, st);
    if (!gid || !RB.content.maps[gid]) return null;
    if (owner !== m.id) { release(); owner = m.id; }
    const gm = RB.maps.compile(gid);
    const night = nightOf(env.amb);
    const F = footOf(m, sp, env), need = reach(m, sp, env);
    const key = gid + '|' + (night ? 'n' : 'd'), bits = stateSig(gm, st);
    let e = entries.get(key);
    if (e && !(e.reg.x0 <= need.x0 && e.reg.y0 <= need.y0 && e.reg.x1 >= need.x1 && e.reg.y1 >= need.y1)) e = null; // the view grew
    if (e && e.bits !== bits) patch(e, sp, gm, st, bits);
    if (!e) {
      const pad = 3;
      e = build(m, sp, gm, st, night, { x0: need.x0 - pad, y0: need.y0 - pad, x1: need.x1 + pad, y1: need.y1 + pad }, bits);
      entries.delete(key);
      entries.set(key, e);
      while (entries.size > 2) entries.delete(entries.keys().next().value);
    }
    return { e, F };
  }
  const toScreen = (e, F, sp, gx, gy) => ({ x: F.x + (gx - sp.at[0]) * ATS * e.sc, y: F.y + (gy - sp.at[1]) * ATS * e.sc });

  // ---- drawing --------------------------------------------------------------------------------
  function draw(c, m, env) {
    const sp = spec(m);
    const b = sp && backdrop(m, sp, env);
    if (!b) { c.fillStyle = '#10141c'; c.fillRect(0, 0, env.bw, env.bh); last = null; return; }
    const { e, F } = b;
    const o = toScreen(e, F, sp, e.reg.x0, e.reg.y0);
    c.fillStyle = e.night ? '#0e0c1a' : '#7d98a0';
    c.fillRect(0, 0, env.bw, env.bh);
    c.drawImage(e.cv, Math.round(o.x), Math.round(o.y));
    // the sea's own life: glints when calm, small whitecaps when the wind blows
    const sea = env.amb && env.amb.sea;
    if (sea && e.water.length) {
      const windy = sea === 'wind', f = env.still ? 0 : Math.floor(env.t / (windy ? 420 : 650)) % 4;
      for (const w of e.water) {
        const x = Math.round(o.x + w.x), y = Math.round(o.y + w.y);
        if (x < -4 || y < -4 || x > env.bw + 4 || y > env.bh + 4) continue;
        const ph = (w.h + f) % 4;
        if (windy) {
          if (w.h % 5 || ph === 3) continue;
          c.fillStyle = '#6a9cac'; c.fillRect(x + 1, y + 1, ph === 1 ? 3 : 2, 1);
          c.fillStyle = '#eef8f6'; c.fillRect(x, y, ph === 1 ? 3 : 2, 1);
        } else if (w.h % 7 === 0 && ph < 2) { c.fillStyle = '#cfeaf0'; c.fillRect(x, y, 1, 1); }
      }
    }
    // haze thickening toward the edges of the view
    const hz = e.night ? '12,8,24' : '206,226,232', D = Math.round(Math.min(env.bw, env.bh) * 0.24), A = e.night ? 0.45 : 0.4;
    const band = (x0, y0, x1, y1, x, y, w, h) => { const gr = c.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, 'rgba(' + hz + ',' + A + ')'); gr.addColorStop(1, 'rgba(' + hz + ',0)'); c.fillStyle = gr; c.fillRect(x, y, w, h); };
    band(0, 0, D, 0, 0, 0, D, env.bh); band(env.bw, 0, env.bw - D, 0, env.bw - D, 0, D, env.bh);
    band(0, 0, 0, D, 0, 0, env.bw, D); band(0, env.bh, 0, env.bh - D, 0, env.bh - D, env.bw, D);
    // the structure dropping away from the deck's south edge to its foot
    const pal = RB.tiles.PAL[m.region] || RB.tiles.PAL.reedwake;
    const shaft = { top: { x0: F.top.x - (sp.top || 3) * ATS, x1: F.top.x + (sp.top || 3) * ATS, y: F.top.y }, foot: { x0: F.x - (sp.foot || 1.5) * ATS * e.sc, x1: F.x + (sp.foot || 1.5) * ATS * e.sc, y: F.y } };
    const legs = sp.shaft === 'timber' ? timber(c, shaft, pal) : (stone(c, shaft, pal, e.sc), null);
    sides(c, F.D, env, sp, pal);
    last = { map: m.id, ground: e.ground, F, o, sc: e.sc, shaft, legs, at: sp.at, reg: e.reg };
  }
  const lerp = (a, b, k) => a + (b - a) * k;
  // A stone tower seen from its top: lit on the left, coursed (the courses closing up as they go
  // down and away), two slit windows, the gallery's shadow across its head, its shadow on the ground.
  function stone(c, S, pal, sc) {
    const s5 = RB.propKit.mat(pal).stone, H = S.foot.y - S.top.y;
    if (H <= 2) return;
    const col = (u) => s5[u < 0.1 ? 3 : u < 0.3 ? 4 : u < 0.45 ? 3 : u < 0.68 ? 2 : u < 0.86 ? 1 : 0];
    // its shadow on the ground, falling to the lower right
    c.fillStyle = 'rgba(22,16,40,0.22)';
    c.beginPath(); c.moveTo(S.foot.x0 + 4, S.foot.y); c.lineTo(S.foot.x1, S.foot.y - 2); c.lineTo(S.foot.x1 + H * 0.9, S.foot.y + H * 0.35); c.lineTo(S.foot.x1 + H * 0.7, S.foot.y + H * 0.45); c.closePath(); c.fill();
    const rows = [];
    for (let y = 0; y <= H; y++) {
      const k = y / H, xl = Math.round(lerp(S.top.x0, S.foot.x0, k)), xr = Math.round(lerp(S.top.x1, S.foot.x1, k)), w = xr - xl;
      rows.push([xl, w]);
      // shade in five bands across the drum
      let x = xl;
      for (const [a, b] of [[0, 0.1], [0.1, 0.3], [0.3, 0.45], [0.45, 0.68], [0.68, 0.86], [0.86, 1]]) {
        const x2 = Math.round(xl + w * b);
        if (x2 > x) { c.fillStyle = col((a + b) / 2); c.fillRect(x, S.top.y + y, x2 - x, 1); }
        x = x2;
      }
    }
    // courses: their spacing follows the scale from the deck (1) down to the ground (sc)
    let y = 3, n = 0;
    while (y < H - 1) {
      const k = y / H, [xl, w] = rows[Math.round(y)], sp = 7 * lerp(1, sc, k);
      c.fillStyle = s5[1]; c.fillRect(xl + 1, S.top.y + Math.round(y), w - 2, 1);
      for (let j = 0; j < 6; j++) {
        const u = ((j + (n % 2) * 0.5) / 6) * Math.PI, jx = Math.round(xl + w / 2 - Math.cos(u) * (w / 2));
        if (jx > xl + 2 && jx < xl + w - 2 && sp > 3) { c.fillRect(jx, S.top.y + Math.round(y) + 1, 1, Math.max(1, Math.round(sp - 1))); }
      }
      y += Math.max(2, sp); n++;
    }
    // slit windows, a little left of the middle
    for (const k of [0.3, 0.64]) {
      const yy = Math.round(k * H), [xl, w] = rows[yy], sz = lerp(1, sc, k);
      const wx = Math.round(xl + w * 0.42), ww = Math.max(2, Math.round(5 * sz)), wh = Math.max(3, Math.round(12 * sz));
      c.fillStyle = '#1a1820'; c.fillRect(wx, S.top.y + yy, ww, wh);
      c.fillStyle = s5[4]; c.fillRect(wx - 1, S.top.y + yy + wh, ww + 2, 1);
    }
    // the gallery's shadow across the top of the shaft, and the footing at the bottom
    c.fillStyle = 'rgba(22,16,40,0.35)'; c.fillRect(S.top.x0, S.top.y, S.top.x1 - S.top.x0, Math.min(10, H));
    c.fillStyle = 'rgba(22,16,40,0.18)'; c.fillRect(S.top.x0, S.top.y + 10, S.top.x1 - S.top.x0, Math.min(8, Math.max(0, H - 10)));
    c.fillStyle = s5[3]; c.fillRect(S.foot.x0 - 2, S.foot.y - 2, S.foot.x1 - S.foot.x0 + 4, 2);
    c.fillStyle = s5[1]; c.fillRect(S.foot.x0 - 2, S.foot.y, S.foot.x1 - S.foot.x0 + 4, 1);
  }
  // A timber fire lookout seen from its platform: four splayed legs, ties and cross-braces.
  function timber(c, S, pal) {
    const w5 = RB.propKit.mat(pal).wood, H = S.foot.y - S.top.y;
    if (H <= 2) return;
    const leg = (xt, xb, wt, wb, col, lit) => {
      for (let y = 0; y <= H; y++) {
        const k = y / H, x = Math.round(lerp(xt, xb, k)), w = Math.max(1, Math.round(lerp(wt, wb, k)));
        c.fillStyle = col; c.fillRect(x, S.top.y + y, w, 1);
        if (lit && w > 2) { c.fillStyle = w5[4]; c.fillRect(x, S.top.y + y, 1, 1); }
      }
    };
    const T0 = S.top.x0 + 10, T1 = S.top.x1 - 14, B0 = S.foot.x0, B1 = S.foot.x1 - 2;
    // back legs (in shadow), then the front ones
    leg(T0 + 18, B0 + 5, 6, 3, w5[1], false); leg(T1 - 18, B1 - 5, 6, 3, w5[1], false);
    const line = (x0, y0, x1, y1, col) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) | 0; c.fillStyle = col; for (let i = 0; i <= n; i++) c.fillRect(Math.round(lerp(x0, x1, i / n)), Math.round(lerp(y0, y1, i / n)), 2, 1); };
    const at = (k, side) => ({ x: side ? lerp(T1 + 3, B1 + 1, k) : lerp(T0 + 3, B0 + 1, k), y: S.top.y + k * H });
    for (const [a, b] of [[0.05, 0.45], [0.45, 0.9]]) {
      const p0 = at(a, 0), p1 = at(b, 1), q0 = at(a, 1), q1 = at(b, 0);
      line(p0.x, p0.y, p1.x, p1.y, w5[1]); line(q0.x, q0.y, q1.x, q1.y, w5[1]);
      const t = at(b, 0), u = at(b, 1);
      c.fillStyle = w5[2]; c.fillRect(Math.round(t.x), Math.round(t.y), Math.round(u.x - t.x), 2);
      c.fillStyle = w5[3]; c.fillRect(Math.round(t.x), Math.round(t.y), Math.round(u.x - t.x), 1);
    }
    leg(T0, B0, 8, 4, w5[3], true); leg(T1, B1, 8, 4, w5[2], false);
    // the deck's beam along the south edge, in shadow
    c.fillStyle = w5[1]; c.fillRect(S.top.x0, S.top.y, S.top.x1 - S.top.x0, 4);
    c.fillStyle = 'rgba(22,16,40,0.3)'; c.fillRect(S.top.x0, S.top.y + 4, S.top.x1 - S.top.x0, 4);
    return [{ x0: T0 + 3, y0: S.top.y, x1: B0 + 2, y1: S.foot.y }]; // the front-left leg's middle line (tests)
  }
  // A short drop at the deck's other edges: the edge of the slab or beam in shadow.
  function sides(c, D, env, sp, pal) {
    const x0 = env.ax(D.x0 * TS), x1 = env.ax(D.x1 * TS), y0 = env.ay(D.y0 * TS), y1 = env.ay(D.y1 * TS);
    const r5 = sp.shaft === 'timber' ? RB.propKit.mat(pal).wood : RB.propKit.mat(pal).stone;
    c.fillStyle = r5[1]; c.fillRect(x0 - 4, y0, 4, y1 - y0); c.fillRect(x1, y0, 4, y1 - y0);
    c.fillStyle = r5[0]; c.fillRect(x0 - 4, y1 - 2, 4, 6); c.fillRect(x1, y1 - 2, 4, 6);
    for (let y = y0 + 12; y < y1 - 4; y += 32) { c.fillRect(x0 - 3, y, 3, 4); c.fillRect(x1, y, 3, 4); }
  }
  // At night: the ground's lanterns and lit windows, over the deck's darkness.
  function drawLights(c, m, env) {
    if (!last || last.map !== m.id) return;
    const sp = spec(m), e = [...entries.values()].find((x) => x.ground === last.ground && x.reg === last.reg);
    if (!sp || !e || !e.night || !e.lights.length) return;
    const fl = env.still ? 0 : Math.sin(env.t / 260) * 0.04;
    for (const L of e.lights) {
      const p = toScreen(e, last.F, sp, L.x, L.y);
      if (p.x < -20 || p.y < -20 || p.x > env.bw + 20 || p.y > env.bh + 20) continue;
      const r = Math.max(2, L.r * ATS * e.sc * 0.55);
      for (let i = 3; i >= 1; i--) { c.fillStyle = 'rgba(255,196,110,' + ((0.09 + fl) * (4 - i)).toFixed(3) + ')'; c.beginPath(); c.arc(Math.round(p.x), Math.round(p.y), (r * i) / 3, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = '#ffe9b0'; c.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, 2, 2);
    }
  }

  function release() {
    if (entries.size) stats.released += entries.size;
    entries.clear();
    owner = null; last = null;
  }
  if (RB.bus) RB.bus.on('map:enter', (ev) => { if (owner && (!ev || ev.id !== owner)) release(); });

  // Tests: where a ground tile is on screen (css px), and what was drawn.
  function project(gx, gy) {
    if (!last || !RB.render) return null;
    const e = [...entries.values()].find((x) => x.reg === last.reg);
    if (!e) return null;
    const p = toScreen(e, last.F, { at: last.at }, gx, gy), k = RB.render.viewSize().scale / ART;
    return { x: p.x * k, y: p.y * k };
  }
  function state() {
    const k = RB.render ? RB.render.viewSize().scale / ART : 1;
    const css = (p) => ({ x: p.x * k, y: p.y * k });
    return {
      active: !!last, map: last && last.map, ground: last && last.ground, cached: entries.size, builds: stats.builds, lastMs: stats.lastMs, maxMs: stats.maxMs, released: stats.released, patches: stats.patches || 0, lastPatchMs: stats.lastPatchMs || 0, phases: stats.last || null,
      foot: last && css(last.F), shaftTop: last && { x0: last.shaft.top.x0 * k, x1: last.shaft.top.x1 * k, y: last.shaft.top.y * k }, shaftFoot: last && { x0: last.shaft.foot.x0 * k, x1: last.shaft.foot.x1 * k, y: last.shaft.foot.y * k },
      legs: last && last.legs ? last.legs.map((l) => ({ x0: l.x0 * k, y0: l.y0 * k, x1: l.x1 * k, y1: l.y1 * k })) : null,
      lights: (() => { const e = last && [...entries.values()].find((x) => x.reg === last.reg); return e && e.night ? e.lights.map((L) => [L.x, L.y]) : []; })(),
    };
  }
  // Tests: a hash of the backdrop drawn last (a patched one must equal one built afresh).
  function backdropHash() {
    const e = last && [...entries.values()].find((x) => x.reg === last.reg);
    if (!e) return null;
    const d = e.cv.getContext('2d').getImageData(0, 0, e.cv.width, e.cv.height).data;
    let h = 0;
    for (let i = 0; i < d.length; i += 4) h = (h * 31 + d[i] + d[i + 1] * 3 + d[i + 2] * 7) >>> 0;
    return { h, w: e.cv.width, hgt: e.cv.height, reg: e.reg };
  }
  // Tests: the backdrop's own colour at a ground point (before haze at the edges of the view).
  function sample(gx, gy) {
    const e = last && [...entries.values()].find((x) => x.reg === last.reg);
    if (!e) return null;
    const ppt = ATS * e.sc, x = Math.floor((gx - e.reg.x0) * ppt), y = Math.floor((gy - e.reg.y0) * ppt);
    if (x < 0 || y < 0 || x >= e.cv.width || y >= e.cv.height) return null;
    return Array.from(e.cv.getContext('2d').getImageData(x, y, 1, 1).data.slice(0, 3));
  }
  return { active, spec, deckOf, draw, drawLights, release, project, state, shrink, backdropHash, sample };
})();
