/* The world proof's regional kit (expansion P01, W02; docs/future/work/P01_WORLD.md "W02"): Reedwake's materials
 * and dressing, drawn only by the proof (src/engine/65_worldlook.js, ?dev=world) and only on the slice's maps.
 * Nothing here changes a tile, a collision, a prop or a person; it draws.
 *
 *   ground   baked once into the map's static layer after its tiles: grass in sunlit and shaded patches, tufts,
 *            flower clusters and clover on open grass; the square's edge broken by grass; the river deepened, with
 *            lily pads near its banks. Low dressing only: you walk through it as through the game's own flowers.
 *   props    the proof's art for a kind of prop, in place of the game's (reeds as cattail clumps; lusher trees)
 *   structs  the proof's buildings (the game's own house, lit within, with flower boxes and a planter)
 *   decor    extra drawables, y-sorted with everything else, only where nothing walks: ducks on the river, the
 *            bridge's posts and rope rails along its edges.
 * Every variation comes from position hashes (RB.tiles.hh); animation from the frame's time, held still with
 * reduced motion. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.worldKit = (function () {
  'use strict';
  const K = RB.propKit;
  const { R, ell, poly, line, mix, ramp, rgb } = K;
  const hh = (x, y, k) => RB.tiles.hh(x, y, k);
  const ATS = 32;

  // ---- the region's brief: colours the kit adds to the palette's own --------------------------------------------
  const BRIEF = {
    reedwake: {
      sunGrass: '#b2cf58', deepGrass: '#2a5634', clover: ['#2f6a34', '#3f8a3e', '#69ac4c'],
      flowers: [['#fbfbf0', '#e8e2c8'], ['#b8a0e8', '#8a70c0'], ['#f6d65a', '#d0a830'], ['#f4a6b0', '#d07888']],
      deepWater: '#1d4f96', pad: ['#24502a', '#37733a', '#58a048', '#8cc860'], padFlower: ['#fff4f4', '#f4b8c8'],
      blade: ['#3c7a36', '#5f9e45', '#9cc85a'],
    },
  };
  BRIEF.reedwake.bird = 'duck'; BRIEF.reedwake.rail = 'rope';
  // Saltglass (W05): the same pieces, its own colours: coastal grass, the sea's blue, sandstone paving warmed by the
  // sun, no lily pads in salt water, gulls instead of ducks, chain rails on the piers
  BRIEF.saltglass = {
    sunGrass: '#c4c66c', deepGrass: '#46663a', clover: ['#3a6a3a', '#4f8446', '#7aa85a'],
    flowers: [['#fbfbf0', '#dedad0'], ['#9cc4e8', '#6a90c0'], ['#f4c8a0', '#d89a70'], ['#e89a9a', '#c87070']],
    deepWater: '#18568f', pad: null, padFlower: null, blade: ['#4a7a3c', '#6c9a4c', '#a8c468'],
    pave: '#d9c39a', paveAmt: 0.28, bird: 'gull', rail: 'chain',
  };
  const briefOf = (m) => BRIEF[m.region] || BRIEF.reedwake;

  // ---- ground --------------------------------------------------------------------------------------------------
  const GRASS = { grass: 1, flowers: 1, tallgrass: 1 };
  // smooth value noise on a lattice of `cell` art px (deterministic)
  function vnoise(x, y, cell, seed) {
    const fx = x / cell, fy = y / cell, xi = Math.floor(fx), yi = Math.floor(fy), xf = fx - xi, yf = fy - yi;
    const h = (a, b) => (hh(a, b, seed) & 1023) / 1023;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = h(xi, yi) + (h(xi + 1, yi) - h(xi, yi)) * u, b = h(xi, yi + 1) + (h(xi + 1, yi + 1) - h(xi, yi + 1)) * u;
    return a + (b - a) * v;
  }
  const lerp3 = (d, o, c, t) => { d[o] += (c[0] - d[o]) * t; d[o + 1] += (c[1] - d[o + 1]) * t; d[o + 2] += (c[2] - d[o + 2]) * t; };
  function dressGround(c, m, g) {
    const B = briefOf(m), cv = c.canvas, W = cv.width, H = cv.height;
    const tileAt = (tx, ty) => m.tiles[Math.max(0, Math.min(m.h - 1, ty)) * m.w + Math.max(0, Math.min(m.w - 1, tx))];
    const img = c.getImageData(0, 0, W, H), d = img.data;
    const SUN = rgb(B.sunGrass), DEEP = rgb(B.deepGrass), WATER = rgb(B.deepWater);
    // the tone field on a 2-px grid: broad sunlit and shaded patches, a finer clumping inside them
    const TW = Math.ceil(W / 2), TH = Math.ceil(H / 2), tone = new Int8Array(TW * TH);
    for (let y = 0; y < TH; y++)
      for (let x = 0; x < TW; x++) {
        const n = vnoise(x * 2, y * 2, 52, 501) * 0.6 + vnoise(x * 2, y * 2, 16, 502) * 0.4;
        tone[y * TW + x] = n > 0.62 ? 1 : n < 0.34 ? -1 : 0;
      }
    for (let py = 0; py < H; py++) {
      const ty = Math.floor(py / ATS) - g.y;
      for (let px = 0; px < W; px++) {
        const tx = Math.floor(px / ATS) - g.x, t = tileAt(tx, ty), o = (py * W + px) * 4;
        const r = d[o], gg = d[o + 1], b = d[o + 2];
        if (GRASS[t.id]) {
          if (!(gg > r + 8 && gg > b + 8)) continue; // only the grass itself, not a path's spill or a flower
          const k = tone[(py >> 1) * TW + (px >> 1)];
          if (k > 0) lerp3(d, o, SUN, 0.14);
          else if (k < 0) lerp3(d, o, DEEP, 0.17);
        } else if ((t.water && t.id !== 'darkwater') || ((t.id === 'bridgeH' || t.id === 'bridgeV') && b > r + 24 && b >= gg)) {
          // deeper river: the darker the pixel, the more it takes the deep blue (the banks' foam stays light)
          const L = (r + gg + b) / 765;
          if (L < 0.8) lerp3(d, o, WATER, 0.74 * (1 - L * 0.45));
        } else if (B.pave && (t.id === 'road' || t.id === 'stonefloor') && !(r < 40 && gg < 40)) {
          // sandstone warmed by the sun (Saltglass's streets and quay); the joints stay darker
          const L = (r + gg + b) / 765;
          lerp3(d, o, rgb(B.pave), B.paveAmt * (0.6 + L * 0.6));
        }
        if (t.id === 'road') {
          // the square's edge: grass creeps over the outer cobbles in a ragged, clumped line, carrying the grass's
          // own texture across (mirrored from beyond the edge), with a dark rim where it overhangs the stones
          const lx = px % ATS, ly = py % ATS, X0 = px - lx, Y0 = py - ly;
          const edge = (dx, dy) => !!GRASS[tileAt(tx + dx, ty + dy).id];
          let depth = 99, sx = 0, sy = 0;
          if (edge(0, -1) && ly < depth) { depth = ly; sx = px; sy = Y0 - 1 - ly; }
          if (edge(0, 1) && ATS - 1 - ly < depth) { depth = ATS - 1 - ly; sx = px; sy = Y0 + ATS + (ATS - 1 - ly); }
          if (edge(-1, 0) && lx < depth) { depth = lx; sx = X0 - 1 - lx; sy = py; }
          if (edge(1, 0) && ATS - 1 - lx < depth) { depth = ATS - 1 - lx; sx = X0 + ATS + (ATS - 1 - lx); sy = py; }
          if (depth > 14) continue;
          const reach = 2 + Math.round(vnoise(px, py, 11, 78) * 9 + vnoise(px, py, 4, 79) * 3);
          if (depth < reach && sx >= 0 && sy >= 0 && sx < W && sy < H) {
            const so = (sy * W + sx) * 4;
            d[o] = d[so]; d[o + 1] = d[so + 1]; d[o + 2] = d[so + 2];
          } else if (depth === reach || depth === reach + 1) lerp3(d, o, [34, 30, 44], depth === reach ? 0.38 : 0.18);
        }
      }
    }
    c.putImageData(img, 0, 0);
    // small things on the open grass: tufts, clover, flower clusters (never under a prop or a building's footprint)
    const covered = new Set();
    for (const p of m.props) { const pd = RB.props.P[p.p]; const pw = p.w || (pd && pd.w) || 1, ph = p.h || (pd && pd.h) || 1; for (let y = p.y; y < p.y + ph; y++) for (let x = p.x; x < p.x + pw; x++) covered.add(x + ',' + y); }
    for (const st of m.structs) for (let y = st.y; y < st.y + st.h; y++) for (let x = st.x; x < st.x + st.w; x++) covered.add(x + ',' + y);
    const near = (tx, ty, ids) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && ids(tileAt(tx + dx, ty + dy))) return true; return false; };
    const nearHouse = (tx, ty) => m.structs.some((st) => tx >= st.x - 1 && tx <= st.x + st.w && ty >= st.y + st.h - 1 && ty <= st.y + st.h);
    for (let ty = -g.y; ty < m.h + g.y; ty++)
      for (let tx = -g.x; tx < m.w + g.x; tx++) {
        const t = tileAt(tx, ty);
        if (!GRASS[t.id] || covered.has(tx + ',' + ty)) continue;
        const X = (tx + g.x) * ATS, Y = (ty + g.y) * ATS, h0 = hh(tx, ty, 300);
        // tufts: a few blades each, a darker root and a sunlit tip
        const nT = 3 + (h0 % 4);
        for (let i = 0; i < nT; i++) {
          const r = hh(tx, ty, 310 + i), bx = X + 2 + (r % 28), by = Y + 4 + ((r >>> 5) % 26), hgt = 3 + ((r >>> 10) % 3);
          for (let j = -1; j <= 1; j++) {
            const hj = hgt - Math.abs(j);
            R(c, bx + j * 2, by - hj, 1, hj, B.blade[1]);
            R(c, bx + j * 2 + (j < 0 ? -1 : j > 0 ? 1 : 0) * 0, by - hj, 1, 1, B.blade[2]);
            R(c, bx + j * 2, by - 1, 1, 1, B.blade[0]);
          }
        }
        // clover: a patch of round leaves
        if (h0 % 7 === 0) {
          const cx = X + 6 + ((h0 >>> 4) % 18), cy = Y + 8 + ((h0 >>> 9) % 16);
          for (let i = 0; i < 6; i++) {
            const r = hh(tx, ty, 330 + i), lx = cx + ((r % 11) - 5), ly = cy + (((r >>> 4) % 7) - 3);
            ell(c, lx, ly, 2, 1.6, B.clover[0]); ell(c, lx - 0.5, ly - 0.5, 1.4, 1.1, B.clover[1]); R(c, lx - 1, ly - 1, 1, 1, B.clover[2]);
          }
        }
        // flowers gather where people tend them (by a house's front) and along the paths' edges
        const byPath = near(tx, ty, (n) => n.id === 'path' || n.id === 'road');
        const chance = nearHouse(tx, ty) ? 0.75 : byPath ? 0.28 : 0.07;
        if ((h0 >>> 12) % 100 < chance * 100) {
          const kind = B.flowers[(h0 >>> 3) % B.flowers.length], n = 6 + ((h0 >>> 16) % 9);
          const cx = X + 8 + ((h0 >>> 6) % 16), cy = Y + 10 + ((h0 >>> 11) % 14);
          for (let i = 0; i < n; i++) {
            const r = hh(tx, ty, 350 + i), fx = cx + ((r % 15) - 7), fy = cy + (((r >>> 4) % 9) - 4);
            R(c, fx - 1, fy + 1, 3, 2, B.clover[0]);
            R(c, fx, fy, 2, 2, kind[1]);
            R(c, fx, fy, 1, 1, kind[0]);
          }
        }
      }
    // lily pads on still water near the banks, a few in flower; each lifts off the water with its own shade
    for (let ty = -g.y; ty < m.h + g.y; ty++)
      for (let tx = -g.x; tx < m.w + g.x; tx++) {
        const t = tileAt(tx, ty);
        if (!t.water || t.id === 'darkwater') continue;
        const bank = near(tx, ty, (n) => !n.water && n.id !== 'bridgeH' && n.id !== 'bridgeV');
        const bridge = near(tx, ty, (n) => n.id === 'bridgeH' || n.id === 'bridgeV');
        const h0 = hh(tx, ty, 400);
        if (!B.pad || bridge || h0 % 100 >= (bank ? 42 : 6)) continue;
        const X = (tx + g.x) * ATS, Y = (ty + g.y) * ATS, n = 1 + ((h0 >>> 8) % 3);
        for (let i = 0; i < n; i++) {
          const r = hh(tx, ty, 410 + i), cx = X + 6 + (r % 20), cy = Y + 6 + ((r >>> 5) % 20), rx = 3 + ((r >>> 10) % 3), ry = rx * 0.7;
          ell(c, cx + 1, cy + 1.5, rx, ry, 'rgba(10,30,70,0.35)');
          ell(c, cx, cy, rx, ry, B.pad[1]);
          ell(c, cx - 0.6, cy - 0.5, rx - 1, ry - 0.8, B.pad[2]);
          R(c, Math.round(cx - rx + 1), Math.round(cy - ry + 1), 2, 1, B.pad[3]);
          // the notch, toward a hashed side
          const ang = ((r >>> 14) % 8) * (Math.PI / 4);
          line(c, Math.round(cx), Math.round(cy), Math.round(cx + Math.cos(ang) * rx), Math.round(cy + Math.sin(ang) * ry), B.pad[0], 1);
          if ((r >>> 20) % 5 === 0) { R(c, Math.round(cx) - 1, Math.round(cy) - 2, 3, 2, B.padFlower[1]); R(c, Math.round(cx), Math.round(cy) - 3, 1, 2, B.padFlower[0]); R(c, Math.round(cx), Math.round(cy) - 1, 1, 1, '#f6d65a'); }
        }
      }
  }

  // ---- props ---------------------------------------------------------------------------------------------------
  // The reveal rule for every tall piece of the kit: someone standing just behind it (up to two tiles above, within a
  // tile either side) must stay findable, so the piece thins while they are there.
  function someoneBehind(cx, cy) {
    const W = RB.world && RB.world.W;
    if (!W || !W.player) return false;
    for (const a of [W.player, W.comp].concat(W.npcs || [], W.extras || [])) {
      if (!a) continue;
      const dy = cy - a.fy, dx = Math.abs(a.fx - cx);
      if (dy > 0 && dy <= 2.2 && dx < 1.2) return true;
    }
    return false;
  }
  // Cattails: an irregular clump per bank tile (twelve variants by position, not three), taller and denser toward
  // the water, leaning outward, brown heads on some stalks, broad blades low down; it sways a little.
  const PROPS = {};
  function cattails(c, x, y, pal, t, o) {
    const cx = o.cx | 0, cy = o.cy | 0, v = hh(cx, cy, 500) % 12;
    const still = !!o.still;
    const f = still ? 2 : Math.round(Math.sin(t / 900 + cx * 0.7 + cy * 0.3) * 2) + 2;
    const key = 'wk-reeds|' + v + '|' + f;
    const cv = K.cached(key, () => K.make(48, 76, (g) => {
      g.translate(8, 40);
      const M = K.mat(pal), r5 = M.reed, head = ramp('#7a4a26', 0.45, 0.3), blade = ramp('#4e7a34', 0.45, 0.35);
      const n = 9 + (v % 4), sway = f - 2;
      const stalks = [];
      for (let i = 0; i < n; i++) {
        const r = hh(v, i, 61);
        stalks.push({ bx: 1 + ((r % 30) + i * 3) % 31, top: -34 + ((r >>> 3) % 22), col: r5[1 + ((r >>> 7) % 3)], lean: sway * (0.5 + ((r >>> 9) % 3) * 0.3) + (((r >>> 15) % 3) - 1) * 0.6, head: (r >>> 11) % 3 === 0, r });
      }
      stalks.sort((a, b) => a.top - b.top);
      for (const s of stalks) {
        for (let yy = s.top; yy < 31; yy++) {
          const tt = (31 - yy) / (31 - s.top), xx = Math.round(s.bx + s.lean * tt * tt * 3);
          R(g, xx, yy, 1, 1, yy < s.top + 4 ? r5[3] : s.col);
          if (yy > 18) R(g, xx + 1, yy, 1, 1, r5[0]);
        }
        if (s.head) {
          const hx = Math.round(s.bx + s.lean * 2.4);
          R(g, hx - 1, s.top + 3, 3, 7, head[2]); R(g, hx - 1, s.top + 3, 1, 6, head[3]); R(g, hx + 1, s.top + 4, 1, 6, head[1]);
          R(g, hx, s.top + 1, 1, 2, r5[3]);
        }
      }
      // broad blades curving out at the foot
      for (let i = 0; i < 5; i++) {
        const r = hh(v, i, 71), bx = 3 + (r % 26), dir = (r >>> 5) & 1 ? 1 : -1, len = 8 + ((r >>> 7) % 7);
        for (let k = 0; k < len; k++) R(g, Math.round(bx + dir * (k * 0.5 + k * k * 0.05) + sway * 0.4 * (k / len)), 30 - k * 1.6, 2, 2, k > len - 3 ? blade[3] : blade[(k + i) % 2 ? 1 : 2]);
      }
      g.setTransform(1, 0, 0, 1, 0, 0);
      K.outline(g, 48, 76, 'sel');
    }));
    // someone standing just behind the clump (up to two tiles above, a tile either side) stays findable: the clump
    // thins to let them show through (the same rule for every tall piece of the kit)
    const behind = someoneBehind(cx, cy);
    if (behind) c.globalAlpha = 0.5;
    c.drawImage(cv, x - 8, y - 40);
    if (behind) c.globalAlpha = 1;
  }
  PROPS.reeds = cattails;

  // The broken span of a bridge: the river in the kit's deep blue (the game's own water prop is the old, paler
  // river), with splintered plank ends where it meets the boards that remain.
  function brokenSpan(c, x, y, pal, t, o) {
    const m = RB.world && RB.world.W && RB.world.W.map, cx = o.cx | 0, cy = o.cy | 0;
    const B = briefOf(m || { region: 'reedwake' }), w = pal.water;
    const deep = [mix(w[0], B.deepWater, 0.62), mix(w[1], B.deepWater, 0.5), mix(w[2], B.deepWater, 0.35), mix(w[3], B.deepWater, 0.15)];
    const f = K.frame(t || 0, 200, 8, o.still);
    const side = (dx) => { if (!m) return false; const n = m.tiles[cy * m.w + cx + dx]; if (!n || n.id !== 'bridgeH') return false; return !m.props.some((p) => p.p === 'water' && p.x === cx + dx && p.y === cy && (!p.if || RB.state.test(RB.game.s, p.if))); };
    const L = side(-1), Rr = side(1);
    const cv = K.cached('wk-broken|' + f + '|' + (L ? 1 : 0) + (Rr ? 1 : 0) + '|' + cy % 2, () => K.make(32, 32, (g) => {
      R(g, 0, 0, 32, 32, deep[0]);
      for (let r = 0; r < 4; r++) { const yy = 3 + r * 8, off = ((f + r * 3) % 8) * 4; for (let xx = -32; xx < 32; xx += 16) R(g, xx + off, yy + (r % 2), 9, 1, deep[1]); }
      R(g, (f * 3) % 24 + 2, 13, 6, 1, deep[2]); R(g, (f * 3 + 13) % 26 + 2, 23, 4, 1, deep[2]);
      const wood = ramp('#8a5a36', 0.45, 0.35);
      const stubs = (x0, dir) => {
        for (let i = 0; i < 4; i++) {
          const len = 3 + ((hh(cx, cy + i, 820) % 5)), yy = 3 + i * 7 + (cy % 2);
          for (let k = 0; k < len; k++) R(g, x0 + dir * k, yy, 1, 5 - (k === len - 1 ? 2 : 0), k === len - 1 ? wood[3] : wood[1 + (k % 2)]);
          R(g, x0 + dir * len, yy + 5, 1, 1, 'rgba(10,30,70,0.4)');
        }
      };
      if (L) stubs(0, 1);
      if (Rr) stubs(31, -1);
    }));
    c.drawImage(cv, x, y);
  }
  PROPS.water = brokenSpan;

  // Saltglass's market stalls: the game's stall, with a deeper canvas awning over it, sloped toward the square, a
  // scalloped valance and its shade on the counter; striped in the harbour's blue.
  function stall(c, x, y, pal, t, o) {
    const base = RB.props.P.sg_stall && RB.props.P.sg_stall.draw2;
    // the game's stall below its own low awning (which hid the keeper's head), then taller posts and the canvas
    // raised clear of a standing keeper's head
    if (base) { c.save(); c.beginPath(); c.rect(x - 12, y - 34, 124, 90); c.clip(); base(c, x, y, pal, t, o); c.restore(); }
    const w5 = ramp('#8a6a44', 0.45, 0.35);
    for (const px of [4, 88]) { R(c, x + px, y - 64, 4, 31, w5[2]); R(c, x + px, y - 64, 1, 31, w5[3]); R(c, x + px + 3, y - 64, 1, 31, w5[0]); }
    const cv = K.cached('wk-awning', () => K.make(116, 40, (g) => {
      g.translate(6, 0);
      for (let i = 0; i < 16; i++) {
        const blue = i % 2 === 0, cc = ramp(blue ? '#3e5f96' : '#ece8de', 0.42, 0.3);
        const xT = -2 + i * 6.4, xB = -5 + i * 6.8;
        // the canvas slopes: narrower at the back, wider at the front; lit at the back, shaded toward the valance
        for (let r = 0; r < 22; r++) { const u = r / 21, xa = Math.round(xT + (xB - xT) * u); R(g, xa, 6 + r, 7, 1, cc[u < 0.25 ? 4 : u < 0.6 ? 3 : 2]); }
        // the valance: a scallop per stripe
        R(g, Math.round(xB), 28, 7, 3, cc[1]); ell(g, Math.round(xB) + 3.5, 31, 3.5, 2.6, cc[1]); R(g, Math.round(xB) + 1, 33, 5, 1, cc[0]);
      }
      R(g, -3, 5, 104, 1, '#2a2432'); R(g, -6, 27, 112, 1, 'rgba(30,24,40,0.45)');
      g.setTransform(1, 0, 0, 1, 0, 0);
      K.outline(g, 116, 40, 'sel');
    }));
    c.drawImage(cv, x - 10, y - 92);
    R(c, x + 2, y - 26, 92, 4, 'rgba(22,16,40,0.16)'); // its shade on the posts and counter's back
  }
  PROPS.sg_stall = stall;
  // the quay's lamp posts carry the harbour's anchor banner (Saltglass only; elsewhere the game's lamp post)
  function lamppost(c, x, y, pal, t, o) {
    const base = RB.props.P.lamppost && RB.props.P.lamppost.draw2;
    if (base) base(c, x, y, pal, t, o);
    const m = RB.world && RB.world.W && RB.world.W.map;
    if (!m || m.region !== 'saltglass') return;
    const sway = o.still ? 0 : Math.round(Math.sin((t || 0) / 1300 + (o.cx | 0)) * 1);
    const cv = K.cached('wk-banner|' + sway, () => K.make(16, 30, (g) => {
      const cl = ramp('#3e5f96', 0.42, 0.32), wh = '#ece8de', ir = K.FIX.iron;
      R(g, 0, 0, 12, 2, ir[2]); R(g, 0, 0, 12, 1, ir[3]);
      for (let r = 0; r < 22; r++) { const off = Math.round((r / 22) * sway); R(g, 2 + off, 2 + r, 9, 1, cl[r < 2 ? 3 : 2]); R(g, 10 + off, 2 + r, 1, 1, cl[1]); }
      // the swallowtail and the anchor
      R(g, 2 + sway, 24, 3, 3, cl[2]); R(g, 8 + sway, 24, 3, 3, cl[2]);
      const ax = 6 + Math.round(sway * 0.5);
      R(g, ax, 7, 1, 11, wh); R(g, ax - 2, 9, 5, 1, wh); R(g, ax - 3, 15, 1, 2, wh); R(g, ax + 3, 15, 1, 2, wh); R(g, ax - 2, 17, 5, 1, wh); ell(g, ax + 0.5, 6, 1.4, 1.4, wh);
      K.outline(g, 16, 30, 'sel');
    }));
    c.drawImage(cv, x + 20, y - 12);
  }
  PROPS.lamppost = lamppost;

  // ---- buildings ------------------------------------------------------------------------------------------------
  // The game's own house, lit within by day (a lamp behind the panes), with a flower box under each window and a
  // planter beside the door, all on the wall's own footprint.
  const STRUCTS = {};
  function house(c, x, y, pal, t, o) {
    const base = RB.props.STRUCT2.house;
    base(c, x, y, pal, t, Object.assign({}, o, { lit: true }));
    const key = 'wk-hbox|' + o.w + '|' + o.h + '|' + (o.windows || []).join('.') + '|' + (o.door == null ? '-' : o.door) + '|' + (o.x | 0) + '|' + (o.y | 0);
    const cv = K.cached(key, () => K.make(o.w * ATS + 16, 30, (g) => {
      g.translate(8, 0);
      const B = BRIEF.reedwake, wood = ramp('#8a5a36', 0.45, 0.35);
      for (const wx of o.windows || []) {
        const bx = wx * ATS + 3, by = 21;
        // the box
        R(g, bx, by, 26, 6, wood[1]); R(g, bx, by, 26, 1, wood[3]); R(g, bx, by + 5, 26, 1, wood[0]);
        R(g, bx + 1, by + 2, 24, 1, wood[2]);
        // greenery and blooms spilling over its lip
        const seed = hh(o.x | 0, (o.y | 0) + wx, 600);
        for (let i = 0; i < 13; i++) {
          const r = hh(seed, i, 601), lx = bx + 1 + (r % 24), ly = by - 1 - ((r >>> 5) % 5);
          ell(g, lx, ly, 2.2, 1.8, B.clover[(r >>> 9) % 2]);
        }
        for (let i = 0; i < 7; i++) {
          const r = hh(seed, i, 602), fk = B.flowers[(seed + i) % B.flowers.length], lx = bx + 2 + (r % 22), ly = by - 2 - ((r >>> 5) % 5);
          R(g, lx, ly, 2, 2, fk[1]); R(g, lx, ly, 1, 1, fk[0]);
        }
      }
      if (o.door != null) {
        // a planter by the door, on the side away from a window
        const dx = o.door * ATS + ((o.windows || []).includes(o.door + 1) ? -10 : 34);
        R(g, dx, 20, 8, 8, wood[1]); R(g, dx, 20, 8, 1, wood[3]); R(g, dx + 7, 21, 1, 7, wood[0]);
        for (let i = 0; i < 6; i++) { const r = hh(o.x | 0, i, 603); ell(g, dx + 1 + (r % 6), 17 - ((r >>> 4) % 6), 2.4, 2, B.clover[(r >>> 8) % 2]); }
        R(g, dx + 2, 13, 2, 2, B.flowers[1][1]); R(g, dx + 5, 15, 2, 2, B.flowers[0][1]);
      }
      g.setTransform(1, 0, 0, 1, 0, 0);
      K.outline(g, o.w * ATS + 16, 30, 'sel');
    }));
    c.drawImage(cv, x - 8, y + o.h * ATS - 34);
  }
  STRUCTS.house = house;

  // ---- low growth: ferns and flowering shrubs, knee-high, walked through like the game's own tall grass ------------
  // Placed only in safe places: open grass, never on a path, a prop, a building, an exit or a trigger, never in front
  // of a door (the 3×2 approach), never at or beside anyone's place or anything you can use, never on a spawn.
  function shrubs(m) {
    if (m.kitShrubs) return m.kitShrubs;
    const keep = new Set(), mark = (x, y, r) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) keep.add((x + dx) + ',' + (y + dy)); };
    for (const p of m.props) { const pd = RB.props.P[p.p]; const pw = p.w || (pd && pd.w) || 1, ph = p.h || (pd && pd.h) || 1; for (let y = p.y; y < p.y + ph; y++) for (let x = p.x; x < p.x + pw; x++) mark(x, y, p.scene || p.text ? 1 : 0); }
    for (const st of m.structs) {
      for (let y = st.y; y < st.y + st.h; y++) for (let x = st.x; x < st.x + st.w; x++) keep.add(x + ',' + y);
      if (st.door != null) for (let dy = 0; dy <= 2; dy++) for (let dx = -1; dx <= 1; dx++) keep.add((st.x + st.door + dx) + ',' + (st.y + st.h - 1 + dy));
    }
    const def = m.def || {};
    for (const e of (def.exits || []).concat(def.triggers || [])) for (let y = e.y - 1; y < e.y + (e.h || 1) + 1; y++) for (let x = e.x - 1; x < e.x + (e.w || 1) + 1; x++) keep.add(x + ',' + y);
    for (const n of def.npcs || []) mark(n.x, n.y, 1);
    for (const k in def.spawn || {}) { const sp = def.spawn[k]; if (Array.isArray(sp)) mark(sp[0], sp[1], 1); }
    // people placed by other content (addNpcs) and the companions' spots: anything with a position in the def's lists
    for (const n of (RB.content && RB.content.maps && RB.content.maps[m.id] && RB.content.maps[m.id].npcs) || []) mark(n.x, n.y, 1);
    const out = [];
    for (let y = 1; y < m.h - 1; y++)
      for (let x = 1; x < m.w - 1; x++) {
        const t = m.tiles[y * m.w + x];
        if (!GRASS[t.id] || keep.has(x + ',' + y)) continue;
        let path = false;
        for (let dy = -1; dy <= 1 && !path; dy++) for (let dx = -1; dx <= 1; dx++) { const n = m.tiles[(y + dy) * m.w + x + dx]; if (n && (n.id === 'path' || n.id === 'road' || n.id === 'bridgeH')) { path = true; break; } }
        const side = m.structs.some((st) => (x === st.x - 1 || x === st.x + st.w) && y >= st.y + 1 && y < st.y + st.h);
        const r = hh(x, y, 700) % 100;
        if (r < (side ? 70 : path ? 4 : 11)) out.push({ x, y, v: hh(x, y, 701) % 12 });
      }
    m.kitShrubs = out;
    return out;
  }
  function shrubArt(pal, v) {
    return K.cached('wk-shrub|' + v, () => K.make(40, 34, (g) => {
      const M = K.mat(pal), B = BRIEF.reedwake, fern = v % 3 === 0;
      const L = v % 4 === 1 ? M.leaf.map((c) => mix(c, '#c8d060', 0.1)) : M.leaf;
      if (fern) {
        // fronds fanning out from the root
        for (let i = 0; i < 9; i++) {
          const r = hh(v, i, 711), ang = Math.PI * (0.12 + (i / 8) * 0.76), len = 9 + (r % 6);
          for (let k = 0; k < len; k++) {
            const x = Math.round(20 - Math.cos(ang) * k * 1.3), y = Math.round(30 - Math.sin(ang) * k * 1.05 + (k * k) / (len * 2.2));
            R(g, x, y, 2, 1, L[k < 3 ? 1 : k > len - 3 ? 3 : 2]);
            if (k % 2 === 0 && k > 2) { R(g, x - 1, y + 1, 1, 1, L[1]); R(g, x + 2, y + 1, 1, 1, L[2]); }
          }
        }
      } else {
        const cl = [];
        for (let i = 0; i < 6; i++) { const r = hh(v, i, 712); cl.push({ x: 9 + (r % 22), y: 18 + ((r >>> 5) % 9), r: 5 + ((r >>> 9) % 3) }); }
        K.foliage(g, cl.sort((a, b) => a.y - b.y), L, 720 + v, { ao: 0.6, tex: 0.4 });
        if (v % 2 === 1) {
          const fk = B.flowers[(v >> 1) % B.flowers.length];
          for (let i = 0; i < 9; i++) { const r = hh(v, i, 713); const x = 8 + (r % 24), y = 13 + ((r >>> 5) % 13); R(g, x, y, 2, 2, fk[1]); R(g, x, y, 1, 1, fk[0]); }
        }
      }
      K.outline(g, 40, 34, 'sel');
      g.globalCompositeOperation = 'destination-over';
      K.shadow(g, 20, 31, 13, 3, 0.26);
      g.globalCompositeOperation = 'source-over';
    }));
  }

  // ---- decor -----------------------------------------------------------------------------------------------------
  // Drawables added to the y-sort: only on water (ducks) or along a bridge's edges (its rails), so nothing stands
  // where anyone walks.
  function duckArt(f) {
    return K.cached('wk-duck|' + f, () => K.make(14, 12, (g) => {
      const body = ramp('#f2efe4', 0.4, 0.2), bill = '#e8a030';
      ell(g, 7, 8, 5, 2.6, body[2]); ell(g, 6, 7.5, 4, 1.8, body[3]);
      R(g, 9, 3 + (f ? 1 : 0), 3, 4, body[2]); R(g, 9, 3 + (f ? 1 : 0), 2, 1, body[4]);
      R(g, 12, 5 + (f ? 1 : 0), 2, 1, bill); R(g, 10, 4 + (f ? 1 : 0), 1, 1, '#1a1420');
      R(g, 3, 6, 2, 1, body[1]);
      K.outline(g, 14, 12, 'sel');
    }));
  }
  function gullArt(f) {
    return K.cached('wk-gull|' + f, () => K.make(16, 12, (g) => {
      const w = ramp('#f4f2ea', 0.4, 0.2), wing = ramp('#9aa2b0', 0.45, 0.3);
      ell(g, 7, 8, 5.5, 2.4, w[2]); ell(g, 6, 7.4, 4, 1.6, w[3]);
      R(g, 3, 6, 6, 2, wing[2]); R(g, 2, 7, 2, 1, wing[0]); R(g, 1, 7, 1, 1, '#2a2a30');
      R(g, 10, 3 + (f ? 1 : 0), 3, 4, w[2]); R(g, 10, 3 + (f ? 1 : 0), 2, 1, w[4]);
      R(g, 13, 5 + (f ? 1 : 0), 2, 1, '#e8b030'); R(g, 11, 4 + (f ? 1 : 0), 1, 1, '#1a1420');
      K.outline(g, 16, 12, 'sel');
    }));
  }
  function flyArt(up) {
    return K.cached('wk-fly|' + up, () => K.make(22, 12, (g) => {
      const w = ramp('#f4f2ea', 0.4, 0.2), wing = ramp('#aab0bc', 0.45, 0.3);
      ell(g, 11, 7, 4, 1.8, w[2]); R(g, 14, 6, 3, 2, w[3]); R(g, 17, 7, 2, 1, '#e8b030');
      if (up) { line(g, 10, 6, 4, 1, wing[2], 2); line(g, 12, 6, 17, 2, wing[3], 2); R(g, 3, 1, 2, 1, '#3a3a44'); }
      else { line(g, 10, 7, 3, 9, wing[2], 2); line(g, 12, 7, 18, 9, wing[3], 2); R(g, 2, 9, 2, 1, '#3a3a44'); }
      K.outline(g, 22, 12, 'sel');
    }));
  }
  function decor(m, env) {
    if (m.kitDecor && m.kitDecor.key === m.staticLayer) return m.kitDecor.list;
    const out = [];
    // the water's long axis: a river's channel (ducks swim up and down it) or a sea's breadth (gulls ride across it)
    const B = briefOf(m), water = [];
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) { const t = m.tiles[y * m.w + x]; if (t.water && t.id !== 'darkwater') water.push([x, y]); }
    if (water.length > 30) {
      const xs = water.map((w) => w[0]).sort((a, b) => a - b), ys = water.map((w) => w[1]).sort((a, b) => a - b);
      const x0 = xs[0], x1 = xs[xs.length - 1], y0 = ys[0], y1 = ys[ys.length - 1];
      if (x1 - x0 > y1 - y0) for (let i = 0; i < 4; i++) out.push({ kind: 'bird', axis: 'x', i, y: y0 + 2.5 + i * 1.7, a0: x0 + 2 + i * 7, span: x1 - x0 - 6 });
      else { const mid = xs[xs.length >> 1]; for (let i = 0; i < 3; i++) out.push({ kind: 'bird', axis: 'y', i, x: mid + (i - 1) * 0.9, a0: 4 + i * 9, span: m.h - 8 }); }
      // gulls also glide over a harbour in slow loops
      if (B.bird === 'gull') for (let i = 0; i < 2; i++) out.push({ kind: 'flyer', i, cx: (x0 + x1) / 2 - 6 + i * 12, cy: y0 - 6 + i * 3, rx: 9 + i * 3, ry: 4 + i });
    }
    // rails: posts every two tiles and a rope (Reedwake) or a chain (Saltglass) along the outer edges of each run of
    // bridge or pier tiles
    for (let y = 0; y < m.h; y++)
      for (let x = 0; x < m.w; x++) {
        const t = m.tiles[y * m.w + x];
        if (t.id === 'bridgeH') {
          const up = m.tiles[(y - 1) * m.w + x], dn = m.tiles[(y + 1) * m.w + x];
          if (up && up.id !== 'bridgeH') out.push({ kind: 'rail', x, y, side: 'far' });
          if (dn && dn.id !== 'bridgeH') out.push({ kind: 'rail', x, y, side: 'near' });
        } else if (t.id === 'bridgeV') {
          const lf = m.tiles[y * m.w + x - 1], rt = m.tiles[y * m.w + x + 1];
          if (lf && lf.id !== 'bridgeV' && lf.water) out.push({ kind: 'railV', x, y, side: 'left' });
          if (rt && rt.id !== 'bridgeV' && rt.water) out.push({ kind: 'railV', x, y, side: 'right' });
        }
      }
    m.kitDecor = { key: m.staticLayer, list: out };
    return out;
  }
  function pushDecor(list, c, m, env, t) {
    const pal = RB.tiles.PAL[m.region] || RB.tiles.PAL.reedwake;
    for (const sh of shrubs(m)) {
      const X = env.ax(sh.x * 16), Y = env.ay(sh.y * 16);
      if (X < -40 || Y < -40 || X > env.bw + 40 || Y > env.bh + 40) continue;
      list.push({ z: (sh.y + 1) * 16 - 1, draw: () => c.drawImage(shrubArt(pal, sh.v), X - 4, Y) });
    }
    const B = briefOf(m), s = RB.game.s, broken = new Set();
    for (const p of m.props) if (p.p === 'water' && (!p.if || RB.state.test(s, p.if))) broken.add(p.x + ',' + p.y);
    const wood = ramp('#7a5030', 0.45, 0.35), rope = ramp('#c8a870', 0.4, 0.3);
    for (const d of decor(m, env)) {
      if (d.kind === 'bird') {
        // a slow loop along the water's long axis, each bird on its own clock
        const per = 70000 + d.i * 23000, ph = env.still ? 0.3 + d.i * 0.2 : ((t / per) + d.i * 0.37) % 1;
        const fwd = ph < 0.5, k = fwd ? ph * 2 : (1 - ph) * 2, wob = env.still ? 0 : Math.sin(t / 3000 + d.i) * 0.25;
        const fx = d.axis === 'x' ? d.a0 + k * d.span * 0.6 : d.x + wob, fy = d.axis === 'x' ? d.y + wob : d.a0 + k * d.span * 0.4;
        const X = env.ax(fx * 16), Y = env.ay(fy * 16);
        if (X < -20 || Y < -20 || X > env.bw + 20 || Y > env.bh + 20) continue;
        const ty = Math.floor(fy), tx = Math.floor(fx), tile = m.tiles[Math.max(0, Math.min(m.h - 1, ty)) * m.w + Math.max(0, Math.min(m.w - 1, tx))];
        if (!tile || !tile.water || broken.has(tx + ',' + ty)) continue;
        const bob = env.still ? 0 : Math.round(Math.sin(t / 500 + d.i * 2));
        const gull = B.bird === 'gull', flip = d.axis === 'x' ? !fwd : !fwd;
        list.push({ z: fy * 16 + 8, draw: () => {
          const art = gull ? gullArt(env.still ? 0 : Math.floor(t / 900 + d.i) % 2) : duckArt(env.still ? 0 : Math.floor(t / 900 + d.i) % 2);
          c.save();
          if (flip) { c.translate(X + 16, 0); c.scale(-1, 1); c.translate(-(X + 16), 0); }
          c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(X + 7, Y + 21, 18, 1);
          c.drawImage(art, X + 9, Y + 10 + bob);
          c.restore();
        } });
      } else if (d.kind === 'flyer') {
        // a gull gliding a slow ellipse, its shadow on whatever is below; wings beat now and then
        const per = 26000 + d.i * 7000, a = env.still ? d.i * 2 : ((t / per) + d.i * 0.4) * Math.PI * 2;
        const fx = d.cx + Math.cos(a) * d.rx, fy = d.cy + Math.sin(a) * d.ry, alt = 40;
        const X = env.ax(fx * 16), Y = env.ay(fy * 16);
        if (X < -40 || Y < -80 || X > env.bw + 40 || Y > env.bh + 40) continue;
        const beat = env.still ? 1 : (Math.floor(t / 160 + d.i * 3) % 8 < 3 ? Math.floor(t / 160) % 2 : 1), left = Math.sin(a) > 0;
        list.push({ z: 1e7 + d.i, draw: () => {
          c.fillStyle = 'rgba(30,24,60,0.18)'; c.fillRect(X + 10, Y + 24, 10, 2);
          const art = flyArt(beat);
          c.save();
          if (left) { c.translate(X + 16, 0); c.scale(-1, 1); c.translate(-(X + 16), 0); }
          c.drawImage(art, X + 6, Y - alt);
          c.restore();
        } });
      } else if (d.kind === 'railV') {
        // a pier's side: posts every two tiles down its length and a chain (or rope) between, slung outward
        const X = env.ax(d.x * 16), Y = env.ay(d.y * 16);
        if (X < -40 || Y < -60 || X > env.bw + 40 || Y > env.bh + 40) continue;
        const rx = d.side === 'left' ? X + 1 : X + 29, chain = B.rail === 'chain';
        list.push({ z: d.y * 16 + 16.2, draw: () => {
          if (d.y % 2 === 0) { R(c, rx - 1, Y - 10, 3, 12, wood[2]); R(c, rx - 1, Y - 10, 1, 12, wood[3]); R(c, rx - 2, Y - 11, 5, 2, wood[1]); }
          for (let i = 0; i < 32; i++) {
            const u = i / 32, out = Math.round(Math.sin(u * Math.PI) * 2) * (d.side === 'left' ? -1 : 1);
            if (chain) { R(c, rx + out, Y - 7 + i, 1, 1, i % 3 === 2 ? '#3a3a44' : '#8a8a96'); if (i % 3 === 0) R(c, rx + out + (d.side === 'left' ? -1 : 1), Y - 7 + i, 1, 1, '#5a5a66'); }
            else R(c, rx + out, Y - 7 + i, 1, 1, rope[1]);
          }
        } });
      } else if (d.kind === 'rail') {
        if (broken.has(d.x + ',' + d.y)) continue;
        const X = env.ax(d.x * 16), Y = env.ay(d.y * 16);
        if (X < -40 || Y < -60 || X > env.bw + 40 || Y > env.bh + 40) continue;
        const far = d.side === 'far', ry = far ? Y + 2 : Y + 30;
        list.push({ z: far ? d.y * 16 + 0.2 : d.y * 16 + 16.2, draw: () => {
          const post = (px) => { R(c, px, ry - 12, 4, 13, wood[2]); R(c, px, ry - 12, 1, 13, wood[3]); R(c, px + 3, ry - 11, 1, 12, wood[0]); R(c, px - 1, ry - 13, 6, 2, wood[1]); };
          if (d.x % 2 === 0) post(X + 2);
          // the rope (or chain) sags between posts
          for (let i = 0; i < 32; i++) { const u = i / 32, sag = Math.round(Math.sin(u * Math.PI) * 3); if (B.rail === 'chain') { R(c, X + i, ry - 9 + sag, 1, 1, i % 3 === 2 ? '#3a3a44' : '#8a8a96'); } else { R(c, X + i, ry - 9 + sag, 1, 1, rope[1]); if (i % 3 === 0) R(c, X + i, ry - 10 + sag, 1, 1, rope[3]); } }
        } });
      }
    }
  }

  // the low growth as things the sun's shadows know about (src/engine/65_worldlook.js casts them)
  function casters(m) {
    const pal = RB.tiles.PAL[m.region] || RB.tiles.PAL.reedwake;
    return shrubs(m).map((sh) => ({ x: sh.x, y: sh.y, k: 0.45, draw: (g, x, y) => g.drawImage(shrubArt(pal, sh.v), x - 4, y) }));
  }

  return { dressGround, PROPS, STRUCTS, pushDecor, casters, shrubs, decor, someoneBehind, BRIEF, vnoise };
})();
