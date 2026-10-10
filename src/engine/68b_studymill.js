/* The fidelity study's world: the Mill and its surroundings, from the real map (C.maps['rw.millroad']), drawn
 * from scratch at the study's standard (docs/future/work/P01_STUDY.md; development only).
 *
 * Everything is generated once when the study opens, pixel by pixel into buffers, then composed every frame:
 *  - the ground: grass with blade clusters and tonal patches, the worn path with its grass-bitten edges and
 *    pebbles, flowers, the banks, the forest floor, the ridge;
 *  - the water: the river and the mill race, a loop of frames (flow lines, ripples, glints, foam at the banks);
 *  - things that stand: the mill (thatch, timber frame, plaster, stone footing, lit windows, the door), the wheel
 *    (a loop of turning frames), trees (leaf clusters lit from the upper left), reeds and cattails, tall grass;
 *    each one drawn in depth order with the people;
 *  - the shadows they cast (a mask, multiplied in a cool violet), and what is bright enough to bloom.
 * The sun is low in the upper left, warm; shade is cool. Variation comes only from hashes of position. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.studyMill = (function () {
  'use strict';
  const K = RB.studyKit;
  const { RAMP, hash, vnoise, fbm, Buf, clamp } = K;
  const TS = 32;
  const MAP = 'rw.millroad';
  // the scene's extent in world art px (the map's own coordinates; the camera stays near the mill's door)
  const X0 = -128, Y0 = -224, W = 864, H = 768;
  const SUN = { x: -0.62, y: -0.7, z: 0.6 }; // towards the sun: upper left, a little in front
  { const l = Math.hypot(SUN.x, SUN.y, SUN.z); SUN.x /= l; SUN.y /= l; SUN.z /= l; }

  let rows = null;
  function T(tx, ty) {
    if (ty < 0 || tx < 0) return 'T';
    if (tx >= 26) return '~';
    if (ty >= 26) return '.';
    return rows[ty][tx];
  }
  const tileAt = (x, y) => T(Math.floor(x / TS), Math.floor(y / TS));

  // ---- the path's centre line: segments between neighbouring path tiles, and on to the mill's door ------------
  function pathSegments() {
    const segs = [];
    for (let ty = 0; ty < 26; ty++) for (let tx = 0; tx < 26; tx++) {
      if (T(tx, ty) !== ':') continue;
      const c = [tx * TS + 16, ty * TS + 16];
      if (T(tx + 1, ty) === ':') segs.push([c, [c[0] + TS, c[1]]]);
      if (T(tx, ty + 1) === ':') segs.push([c, [c[0], c[1] + TS]]);
      if (tx === 9 && ty === 5) segs.push([c, [c[0], 150]]); // up to the step
    }
    return segs;
  }
  function segDist(px, py, s) {
    const [a, b] = s, dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy || 1;
    let u = ((px - a[0]) * dx + (py - a[1]) * dy) / L;
    u = u < 0 ? 0 : u > 1 ? 1 : u;
    return Math.hypot(px - a[0] - dx * u, py - a[1] - dy * u);
  }

  // ---- the ground ---------------------------------------------------------------------------------------------
  // material per pixel: 0 grass, 1 path, 2 water, 3 bank, 4 forest floor, 5 cliff face, 6 cliff top
  function buildGround(S) {
    const mat = new Uint8Array(W * H), lvl = new Float32Array(W * H);
    const segs = pathSegments();
    const waterTile = (tx, ty) => T(tx, ty) === '~';
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const wx = x + X0, wy = y + Y0, tx = Math.floor(wx / TS), ty = Math.floor(wy / TS), ch = T(tx, ty);
      let m = 0;
      // under the forest it is grass too: the canopy's shadow darkens it (no tile edges)
      if (ch === '^') m = 5;
      if (ch === '~') {
        // the bank bites into the water tile where a neighbour is land, by a wobbling width
        const fx = wx - tx * TS, fy = wy - ty * TS;
        let d = 99;
        if (!waterTile(tx - 1, ty)) d = Math.min(d, fx);
        if (!waterTile(tx + 1, ty)) d = Math.min(d, TS - 1 - fx);
        if (!waterTile(tx, ty - 1)) d = Math.min(d, fy);
        if (!waterTile(tx, ty + 1)) d = Math.min(d, TS - 1 - fy);
        const bw = 3 + vnoise(wx, wy, 7, 31) * 4;
        m = d < bw ? 3 : 2;
        lvl[y * W + x] = d;
      } else if (m === 0 || m === 4) {
        let pd = 99;
        for (const s of segs) {
          if (Math.abs(s[0][0] - wx) > 60 && Math.abs(s[1][0] - wx) > 60) continue;
          if (Math.abs(s[0][1] - wy) > 60 && Math.abs(s[1][1] - wy) > 60) continue;
          pd = Math.min(pd, segDist(wx, wy, s));
        }
        // the path is narrower than its tile, wider at the door and the bends, with a wandering edge
        const hw = 10 + (vnoise(wx, wy, 11, 32) - 0.5) * 5 + (wy < 200 && Math.abs(wx - 304) < 30 ? 3 : 0);
        if (pd < hw) { m = 1; lvl[y * W + x] = hw - pd; }
      }
      mat[y * W + x] = m;
    }
    // the ridge: a ledge of grass along the top of each cliff run
    for (let y = 1; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (mat[i] === 5 && mat[i - W] !== 5 && mat[i - W] !== 6) for (let k = 0; k < 5 && y + k < H; k++) if (mat[i + k * W] === 5) mat[i + k * W] = 6;
    }
    S.mat = mat; S.lvl = lvl;

    const g = new Buf(W, H), G = RAMP.grass, D = RAMP.dirt, St = RAMP.stone;
    // grass: calm tonal patches with ragged (not noisy) edges; the texture is in the tufts, not in every pixel
    const gl = new Int8Array(W * H).fill(-1);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, wx = x + X0, wy = y + Y0, m = mat[i];
      if (m !== 0 && m !== 4 && m !== 6) continue;
      const v = fbm(wx, wy, 90, 41, 3) + (vnoise(wx, wy, 4, 43) - 0.5) * 0.09;
      let L = v < 0.36 ? 3 : v < 0.47 ? 4 : v < 0.6 ? 5 : 6;
      if (fbm(wx + 500, wy, 60, 44, 2) + (vnoise(wx, wy, 3, 45) - 0.5) * 0.08 > 0.66) L++; // sunny, drier patches
      if (m === 4) L = Math.max(1, L - 3);
      gl[i] = L;
    }
    // tufts: a handful of designed shapes (h highlight, m mid, d the shadow beneath), placed sparsely
    const TUFT = [
      ['h...h', '.h.h.', '.mhm.', 'ddddd'],
      ['..h..', '.hmh.', 'hm.mh', '.ddd.'],
      ['h.h.h', 'mhmhm', 'ddddd'],
      ['.h', 'hm', 'dd'],
      ['h..', 'mh.', 'mmh', 'ddd'],
      ['..h', '.hm', 'hmm', 'ddd'],
    ];
    const tuftLvl = new Int8Array(W * H);
    for (let cy = 2; cy < H; cy += 6) for (let cx = (cy / 6) % 2 ? 0 : 3; cx < W; cx += 7) {
      const wx = cx + X0, wy = cy + Y0;
      if (hash(wx, wy, 51) > 0.62) continue;
      const tp = TUFT[Math.floor(hash(wx, wy, 52) * TUFT.length)];
      const ox = cx + Math.floor(hash(wx, wy, 53) * 4), oy = cy + Math.floor(hash(wx, wy, 54) * 3);
      const base = gl[Math.min(H - 1, oy + tp.length - 1) * W + Math.min(W - 1, ox)];
      if (base < 0) continue;
      for (let r = 0; r < tp.length; r++) for (let k = 0; k < tp[r].length; k++) {
        const ch = tp[r][k], px = ox + k, py = oy + r;
        if (ch === '.' || px >= W || py >= H) continue;
        const j = py * W + px;
        if (gl[j] < 0) continue;
        tuftLvl[j] = ch === 'h' ? 2 : ch === 'm' ? 1 : -1;
      }
    }
    // clover: three-leaf sprigs here and there in the cooler patches
    for (let k = 0; k < 520; k++) {
      const x = Math.floor(hash(k, 7, 55) * (W - 4)) + 1, y = Math.floor(hash(k, 8, 55) * (H - 4)) + 1;
      if (gl[y * W + x] < 0 || gl[y * W + x] > 5 || mat[y * W + x] !== 0) continue;
      for (const [dx, dy, d] of [[0, -1, 2], [-1, 0, 2], [1, 0, 1], [0, 0, 1], [0, 1, -1], [1, 1, -1]]) tuftLvl[(y + dy) * W + x + dx] = d;
    }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (gl[i] < 0) continue;
      g.set(x, y, G[clamp(gl[i] + tuftLvl[i], 0, 9)]);
    }
    // the path: packed earth in three tones with ragged edges, sunken a little: its north edge in the bank's shade,
    // its south edge a sunlit lip, grass leaning over both
    const isPath = (x, y) => x >= 0 && y >= 0 && x < W && y < H && mat[y * W + x] === 1;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, wx = x + X0, wy = y + Y0, m = mat[i];
      if (m === 1) {
        const v = fbm(wx, wy, 16, 61, 2) + (vnoise(wx, wy, 3, 62) - 0.5) * 0.1;
        let L = v < 0.4 ? 4 : v < 0.6 ? 5 : 6;
        if (lvl[i] > 5 && fbm(wx, wy, 7, 63, 1) > 0.7) L = 7; // worn smooth along the middle
        let up = 0, down = 0;
        for (let k = 1; k <= 3; k++) { if (!up && !isPath(x, y - k)) up = k; if (!down && !isPath(x, y + k)) down = k; }
        if (up === 1 || up === 2) L = up === 1 ? 2 : 3;
        else if (!isPath(x - 1, y) || !isPath(x - 2, y)) L = Math.min(L, 3);
        if (down === 1) L = 7;
        else if (!isPath(x + 1, y)) L = Math.max(L, 6);
        g.set(x, y, D[L]);
      } else if (m === 3) {
        // the bank: wet earth and a few stones at the water's edge
        const d = lvl[i];
        const v = 2.2 + (vnoise(wx, wy, 4, 71) - 0.5) * 1.4 - (d < 2 ? 0.8 : 0);
        g.set(x, y, D[clamp(Math.round(v), 0, 4)]);
      } else if (m === 2) {
        const d = lvl[i];
        g.set(x, y, RAMP.water[d < 5 ? 5 : d < 9 ? 4 : 3]); // the bed; the moving surface is drawn over it
      } else if (m === 5) {
        // the ridge's face: layered stone, lit from the upper left
        const sh = Math.floor(vnoise(wx, 0, 9, 81) * 6), band = Math.floor((wy + sh) / 7);
        const v = 4 + (hash(Math.floor(wx / 9), band, 82) - 0.5) * 2.2 + ((wy + sh) % 7 === 0 ? -2 : 0);
        g.set(x, y, St[clamp(Math.round(v), 1, 7)]);
      }
    }
    // grass leaning over the path's edges: blades from the grass side reaching 2–3 px onto the earth
    for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
      const i = y * W + x;
      if (mat[i] !== 0) continue;
      const below = isPath(x, y + 1), above = isPath(x, y - 1);
      if (!below && !above) continue;
      const wx = x + X0, wy = y + Y0, r = hash(wx, wy, 57);
      if (r > 0.5) continue;
      const L = Math.max(3, gl[i]), n = 1 + Math.floor(hash(wx, wy, 58) * 3);
      for (let k = 1; k <= n; k++) {
        const yy = below ? y + k : y - k + 1, xx = x + (r < 0.18 ? (below ? 1 : -1) * (k > 1 ? 1 : 0) : 0);
        if (!isPath(xx, yy) && k > 1) break;
        g.set(xx, yy, G[clamp(L + (k === n ? 2 : 1), 0, 9)]);
      }
      if (below) g.set(x + 1, y + n + 1, D[2]);
    }
    // pebbles on the path and at its edges: a lit pixel, a body, a shadow
    for (let k = 0; k < 900; k++) {
      const x = Math.floor(hash(k, 1, 91) * W), y = Math.floor(hash(k, 2, 91) * H), i = y * W + x;
      if (mat[i] !== 1 || x >= W - 2 || y >= H - 2) continue;
      const big = hash(k, 3, 91) > 0.75;
      g.set(x, y, St[6]); g.set(x + 1, y, St[5]);
      if (big) { g.set(x, y + 1, St[4]); g.set(x + 1, y + 1, St[3]); g.set(x + 2, y + 1, D[2]); }
      else g.set(x + 1, y + 1, D[2]);
    }
    // stones in the bank
    for (let k = 0; k < 500; k++) {
      const x = Math.floor(hash(k, 4, 92) * W), y = Math.floor(hash(k, 5, 92) * H), i = y * W + x;
      if (mat[i] !== 3 || x >= W - 3 || y >= H - 3) continue;
      g.set(x, y, St[6]); g.set(x + 1, y, St[5]); g.set(x, y + 1, St[4]); g.set(x + 1, y + 1, St[3]); g.set(x + 2, y + 1, St[2]);
    }
    // flowers on the flower tiles and scattered wherever grass meets the path or the mill's footing
    const F = RAMP.flower, kinds = [F.white, F.yellow, F.pink, F.blue, F.white];
    const flower = (x, y, f) => {
      g.set(x, y + 1, G[2]); g.set(x + 1, y + 2, G[3]); // a stalk's shadow
      g.set(x - 1, y, f[1]); g.set(x + 1, y, f[1]); g.set(x, y - 1, f[2]); g.set(x, y + 1, f[0]);
      g.set(x, y, F.yellow[2]);
      g.set(x - 1, y + 2, G[7]); g.set(x + 2, y + 1, G[6]);
    };
    for (let ty = -1; ty < 18; ty++) for (let tx = -4; tx < 24; tx++) {
      const ch = T(tx, ty);
      const n = ch === ',' ? 7 : ch === '.' ? (hash(tx, ty, 93) > 0.55 ? 2 : 0) : 0;
      for (let k = 0; k < n; k++) {
        const fx = tx * TS + 3 + Math.floor(hash(tx * 7 + k, ty, 94) * 26) - X0, fy = ty * TS + 3 + Math.floor(hash(tx, ty * 7 + k, 95) * 26) - Y0;
        if (fx < 2 || fy < 2 || fx >= W - 3 || fy >= H - 3 || mat[fy * W + fx] !== 0) continue;
        flower(fx, fy, kinds[Math.floor(hash(tx + k, ty - k, 96) * kinds.length)]);
      }
    }
    S.ground = g;
  }

  // ---- the water: the river (south) and the mill race (west, into the wheel), a seamless loop of frames ------
  // Flow lines are short streaks in lanes 3 px wide, each lane with its own phase; everything repeats after
  // WATER_MS, so the loop never jumps. Glints twinkle for three frames; foam runs along the banks.
  const WATER_N = 16, WATER_MS = 3200;
  function buildWater(S) {
    const { mat, lvl } = S, Wa = RAMP.water;
    let x0 = W, y0 = H, x1 = 0, y1 = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (mat[y * W + x] === 2) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
    const bw = x1 - x0 + 1, bh = y1 - y0 + 1, Lp = 48;
    S.water = { x: x0, y: y0, w: bw, h: bh, frames: [] };
    // ripple marks: short arcs across the flow, in a periodic field that drifts with it
    for (let f = 0; f < WATER_N; f++) {
      const b = new Buf(bw, bh), ph = f / WATER_N;
      for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
        const i = (y + y0) * W + (x + x0);
        if (mat[i] !== 2) continue;
        const wx = x + x0 + X0, wy = y + y0 + Y0, race = wy >= 96 && wy < 128 && wx < 608, d = lvl[i];
        let L = race ? (d < 6 ? 5 : 4) : d < 4 ? 5 : d < 10 ? 4 : 3;
        const along = race ? -wx : wy, v = race ? 2 : 1;
        if (d < 2.2) { const uf = (((along * 0.7 - v * 9 * ph * 3) % 9) + 9) % 9; L = uf < 3 ? 8 : 6; }
        b.set(x, y, Wa[clamp(L, 1, 9)]);
      }
      // ripple marks, block by block: each drifts with the flow and wraps inside its own block of Lp px
      const isRace = (qx, qy) => { const wy = qy + y0 + Y0, wx = qx + x0 + X0; return wy >= 96 && wy < 128 && wx < 608; };
      const mark = (qx, qy) => qx >= 0 && qy >= 0 && qx < bw && qy < bh && mat[(qy + y0) * W + qx + x0] === 2 && lvl[(qy + y0) * W + qx + x0] >= 2.5;
      for (let blk = 0; blk < Math.ceil(bh / Lp); blk++) for (let k = 0; k < Math.floor(bw * Lp / 40); k++) {
        const ax = Math.floor(hash(blk, k, 304) * bw), ay = Math.floor(blk * Lp + (((hash(blk, k, 305) * Lp + Lp * ph) % Lp) + Lp) % Lp);
        const len = 2 + Math.floor(hash(blk, k, 306) * 4), dark = hash(blk, k, 307) < 0.3;
        if (!mark(ax, ay) || isRace(ax, ay)) continue;
        for (let q = 0; q < len; q++) {
          const qx = ax + q - (len >> 1), qy = ay + (q === 0 || q === len - 1 ? 1 : 0);
          if (!mark(qx, qy) || isRace(qx, qy)) continue;
          b.set(qx, qy, Wa[dark ? 2 : lvl[(qy + y0) * W + qx + x0] < 5 ? 7 : 6]);
          if (!dark && mark(qx, qy + 1)) b.set(qx, qy + 1, Wa[3]);
        }
      }
      for (let blk = 0; blk < Math.ceil(bw / Lp); blk++) for (let k = 0; k < 40; k++) {
        const ay = Math.floor(hash(blk, k, 308) * bh), ax = Math.floor(blk * Lp + (((hash(blk, k, 309) * Lp - 2 * Lp * ph) % Lp) + Lp) % Lp);
        const len = 2 + Math.floor(hash(blk, k, 310) * 3);
        if (!mark(ax, ay) || !isRace(ax, ay)) continue;
        for (let q = 0; q < len; q++) {
          const qx = ax + (q === 0 || q === len - 1 ? 1 : 0), qy = ay + q - (len >> 1);
          if (!mark(qx, qy) || !isRace(qx, qy)) continue;
          b.set(qx, qy, Wa[7]);
          if (mark(qx + 1, qy)) b.set(qx + 1, qy, Wa[3]);
        }
      }
      // glints: a few twinkles, each three frames long, brightest in its middle frame
      for (let k = 0; k < Math.floor(bw * bh / 900); k++) {
        const gx = Math.floor(hash(k, 11, 302) * bw), gy = Math.floor(hash(k, 12, 302) * bh), at = Math.floor(hash(k, 13, 302) * WATER_N);
        const age = (f - at + WATER_N) % WATER_N;
        if (age > 2 || mat[(gy + y0) * W + gx + x0] !== 2 || lvl[(gy + y0) * W + gx + x0] < 3) continue;
        if (age === 1) { b.set(gx, gy, Wa[9]); b.set(gx - 1, gy, Wa[8]); b.set(gx + 1, gy, Wa[8]); b.set(gx, gy - 1, Wa[8]); b.set(gx, gy + 1, Wa[8]); }
        else b.set(gx, gy, Wa[8]);
      }
      S.water.frames.push(b.canvas());
    }
  }

  // ---- trees: leaf clusters on a dome, each lit as a small sphere, layered back to front ----------------------
  // Returns the canopy, the trunk, and the canopy's mask (for its shadow), anchored at the trunk's foot.
  function makeTree(seed, R, bush) {
    const pad = 4, cw = Math.ceil(R * 2.4) + pad * 2, chh = Math.ceil(R * 2.15) + pad * 2, trunkH = bush ? 0 : Math.round(R * 0.95);
    const w = cw, h = chh + trunkH, cx = w / 2, cy = pad + R * 1.08, L = RAMP.leaf, Bk = RAMP.bark;
    const clumps = [];
    const n = 11 + Math.floor(hash(seed, 1, 401) * 4);
    clumps.push({ x: cx, y: cy - R * 0.15, r: R * 0.6 });
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + hash(seed, k, 402) * 0.6, rho = R * (0.48 + hash(seed, k, 403) * 0.18);
      clumps.push({ x: cx + Math.cos(a) * rho, y: cy + Math.sin(a) * rho * 0.86, r: R * (0.38 + hash(seed, k, 404) * 0.14) });
    }
    for (let k = 0; k < 4; k++) {
      const a = Math.PI * (1.15 + k * 0.23) + hash(seed, k, 405) * 0.3;
      clumps.push({ x: cx + Math.cos(a) * R * 0.32, y: cy + Math.sin(a) * R * 0.3, r: R * 0.36 });
    }
    clumps.sort((a, b) => a.y - b.y); // back (upper) clumps first; the front ones overlap them
    const own = new Int16Array(w * h).fill(-1);
    for (let y = 0; y < chh; y++) for (let x = 0; x < w; x++) {
      for (let k = clumps.length - 1; k >= 0; k--) {
        const c = clumps[k], d2 = ((x + 0.5 - c.x) ** 2 + (y + 0.5 - c.y) ** 2) / (c.r * c.r);
        const notch = (hash(x >> 1, y >> 1, seed + 406) - 0.5) * 0.22;
        if (d2 < 1 + notch) { own[y * w + x] = k; break; }
      }
    }
    const b = new Buf(w, h), m = new Uint8Array(w * h);
    // the trunk first (the canopy overlaps its top)
    const tx = Math.round(cx), baseY = bush ? Math.round(cy + R * 0.8) : h - 3;
    for (let y = Math.round(cy + R * 0.3); !bush && y <= baseY; y++) {
      const t = (y - (cy + R * 0.3)) / (baseY - (cy + R * 0.3)), hw = 2.6 + t * 1.2 + (y > baseY - 3 ? (y - (baseY - 3)) * 1.4 : 0);
      for (let x = Math.floor(tx - hw); x <= Math.ceil(tx + hw); x++) {
        const u = (x + 0.5 - tx) / hw;
        if (Math.abs(u) > 1) continue;
        let v = 3.6 - u * 2.2 + (hash(x, y >> 2, seed + 407) - 0.5) * 0.8;
        if (hash(x, 0, seed + 408) > 0.7 && Math.abs(u) < 0.8) v -= 1.3; // bark furrows
        if (y < cy + R * 0.75) v -= 1.4; // under the canopy
        b.set(x, y, Bk[clamp(Math.round(v), 0, 6)]);
      }
    }
    for (let y = 0; y < chh; y++) for (let x = 0; x < w; x++) {
      const k = own[y * w + x];
      if (k < 0) continue;
      const c = clumps[k];
      let nx = (x + 0.5 - c.x) / c.r, ny = (y + 0.5 - c.y) / c.r;
      const nn = nx * nx + ny * ny, nz = Math.sqrt(Math.max(0, 1 - Math.min(1, nn)));
      // blend with the whole dome's normal, so the tree reads as one mass lit from the upper left
      const dx = (x + 0.5 - cx) / R, dy = (y + 0.5 - cy) / R, dz = Math.sqrt(Math.max(0, 1 - Math.min(1, dx * dx + dy * dy)));
      const Nx = nx * 0.55 + dx * 0.45, Ny = ny * 0.55 + dy * 0.45, Nz = nz * 0.55 + dz * 0.45;
      let v = 0.18 + 0.82 * Math.max(0, (Nx * SUN.x + Ny * SUN.y + Nz * SUN.z) / Math.hypot(Nx, Ny, Nz));
      // a crevice where this clump's upper edge meets the one behind it
      const up = y > 0 ? own[(y - 1) * w + x] : -1, up2 = y > 1 ? own[(y - 2) * w + x] : -1;
      if ((up >= 0 && up !== k) || (up2 >= 0 && up2 !== k && ny < -0.5)) v -= 0.22;
      // leaf texture: little lit leaves in 2-px cells, darker gaps between
      const cell = hash((x + (y >> 1)) >> 1, y >> 1, seed + 409);
      v += (cell - 0.5) * 0.16;
      let li = clamp(Math.round(v * 9), 1, 9);
      if (li >= 7 && hash(x, y, seed + 410) > 0.82) li = 9;
      b.set(x, y, L[li]);
      m[y * w + x] = 1;
    }
    // the silhouette: dark on the lower right, a step darker on the upper left
    for (let y = 0; y < chh; y++) for (let x = 0; x < w; x++) {
      if (!m[y * w + x]) continue;
      const out = (dx, dy) => { const xx = x + dx, yy = y + dy; return xx < 0 || yy < 0 || xx >= w || yy >= h || !m[yy * w + xx]; };
      if (out(1, 0) || out(0, 1)) b.set(x, y, L[out(1, 0) && out(0, 1) ? 0 : 1]);
      else if (out(-1, 0) || out(0, -1)) { const c0 = b.get(x, y); if (c0) b.set(x, y, [c0[0] * 0.86, c0[1] * 0.86, c0[2] * 0.9]); }
    }
    // roots
    if (!bush) for (const [dx, len] of [[-1, 3], [1, 3]]) for (let k = 1; k <= len; k++) b.set(tx + dx * (3 + k), baseY - 1 + (k > 1 ? 1 : 0), Bk[k === 1 ? 3 : 2]);
    return { cv: b.canvas(), mask: m, w, h, ax: Math.round(cx), ay: baseY, R, canopyBottom: Math.round(cy + R) };
  }

  function buildTrees(S) {
    const variants = [];
    for (let k = 0; k < 10; k++) variants.push(makeTree(k * 7 + 3, 20 + Math.floor(hash(k, 1, 411) * 8)));
    S.variants = variants;
    S.trees = [];
    for (let ty = Math.floor(Y0 / TS) - 1; ty < Math.ceil((Y0 + H) / TS); ty++) for (let tx = Math.floor(X0 / TS) - 1; tx < Math.ceil((X0 + W) / TS); tx++) {
      if (T(tx, ty) !== 'T') continue;
      const v = variants[Math.floor(hash(tx, ty, 412) * variants.length)];
      const x = tx * TS + 16 + Math.round((hash(tx, ty, 413) - 0.5) * 10), y = ty * TS + 26 + Math.round((hash(tx, ty, 414) - 0.5) * 8);
      // a tree whose neighbours below and to the side are open ground stands at the forest's edge, and moves
      const edge = T(tx, ty + 1) !== 'T' || T(tx + 1, ty) !== 'T' || T(tx - 1, ty) !== 'T';
      S.trees.push({ v, x, y, edge, ph: hash(tx, ty, 415) * Math.PI * 2 });
    }
    // undergrowth where the forest meets open ground: low leafy masses hiding the gaps between trunks
    const bushes = [];
    for (let k = 0; k < 6; k++) bushes.push(makeTree(900 + k * 13, 8 + Math.floor(hash(k, 2, 416) * 5), true));
    S.bushes = bushes;
    for (let ty = Math.floor(Y0 / TS) - 1; ty < Math.ceil((Y0 + H) / TS); ty++) for (let tx = Math.floor(X0 / TS) - 1; tx < Math.ceil((X0 + W) / TS); tx++) {
      if (T(tx, ty) !== 'T') continue;
      const open = (a, b2) => T(a, b2) !== 'T' && T(a, b2) !== '~';
      const spots = [];
      if (open(tx, ty + 1)) spots.push([8, 30], [24, 31]);
      if (open(tx + 1, ty)) spots.push([30, 10], [31, 26]);
      for (const [ox, oy] of spots) {
        const v = bushes[Math.floor(hash(tx * 3 + ox, ty * 5 + oy, 417) * bushes.length)];
        S.trees.push({ v, x: tx * TS + ox + Math.round((hash(tx, ty + ox, 418) - 0.5) * 6), y: ty * TS + oy, edge: false, bush: true, ph: 0 });
      }
    }
  }

  // ---- shadows: one mask of how much each ground pixel is shaded (multiplied in a cool violet) -----------------
  function buildShadows(S) {
    const a = new Float32Array(W * H);
    const put = (x, y, v) => { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= H) return; const i = y * W + x; if (v > a[i]) a[i] = v; };
    for (const tr of S.trees) {
      const R = tr.v.R, cx = tr.x - X0 + R * (tr.bush ? 0.45 : 0.95), cy = tr.y - Y0 + (tr.bush ? 1 : R * 0.08);
      const rx = R * (tr.bush ? 1.05 : 1.15), ry = R * (tr.bush ? 0.5 : 0.6);
      for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
        const d = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 + (hash(x >> 1, y >> 1, 420) - 0.5) * 0.18;
        if (d > 1) continue;
        const fleck = !tr.bush && hash(x >> 1, y >> 1, 421) > 0.9; // sun through the leaves
        put(x, y, fleck ? 0.2 : d > 0.8 ? 0.45 : 0.72);
      }
      if (!tr.bush) {
        for (let y = -2; y <= 1; y++) for (let x = -6; x <= 7; x++) if ((x / 7) ** 2 + (y / 2.2) ** 2 <= 1) put(tr.x - X0 + x, tr.y - Y0 + y, 0.78); // the trunk's foot
        for (let k = 0; k < R * 0.9; k++) for (let w = -1; w <= 1; w++) put(tr.x - X0 + 3 + k, tr.y - Y0 + Math.round(k * 0.2) + w, 0.7); // the trunk's shadow
      }
    }
    S.shadowA = a;
  }
  function shadowCanvas(S) {
    const b = new Buf(W, H), a = S.shadowA, col = [96, 86, 150];
    for (let i = 0; i < W * H; i++) if (a[i] > 0) { const x = i % W, y = (i / W) | 0; b.set(x, y, col, Math.round(a[i] * 255)); }
    return b.canvas();
  }

  // ---- plants that move: tall grass and reeds, each in three leans; and the small life of the clearing ---------
  function makePlant(seed, kind) {
    const tall = kind === 'reed', w = tall ? 13 : 11, h = tall ? 26 : 12, frames = [];
    const blades = [];
    const n = tall ? 5 : 5 + Math.floor(hash(seed, 1, 701) * 3);
    for (let k = 0; k < n; k++) blades.push({ x: (tall ? 3 : 2) + hash(seed, k, 702) * (w - (tall ? 6 : 4)), h: (tall ? 14 : 5) + hash(seed, k, 703) * (tall ? 10 : 6), lean: (hash(seed, k, 704) - 0.5) * (tall ? 3 : 4), cat: tall && hash(seed, k, 705) > 0.5 });
    for (const sway of [-1, 0, 1]) {
      const b = new Buf(w, h), Rp = tall ? RAMP.reed : RAMP.grass;
      for (const bl of blades) {
        let px = bl.x, py = h - 1;
        for (let k = 0; k < bl.h; k++) {
          const t = k / bl.h, x = Math.round(bl.x + (bl.lean + sway * 1.6) * t * t), y = h - 1 - k;
          const top = k >= bl.h - 2;
          b.set(x, y, Rp[top ? (tall ? 7 : 8) : clamp(Math.round(3 + t * 4), 2, tall ? 6 : 7)]);
          if (!top && x + 1 < w && t < 0.5) b.set(x + 1, y, Rp[2]);
          px = x; py = y;
        }
        if (bl.cat) for (let k = 0; k < 5; k++) { b.set(px, py + k + 1, RAMP.cattail[k === 0 ? 4 : k === 4 ? 1 : 3]); b.set(px + 1, py + k + 1, RAMP.cattail[k === 4 ? 0 : 1]); }
      }
      frames.push(b.canvas());
    }
    return { frames, w, h };
  }
  function buildPlants(S) {
    const grass = [], reeds = [];
    for (let k = 0; k < 5; k++) grass.push(makePlant(800 + k, 'grass'));
    for (let k = 0; k < 4; k++) reeds.push(makePlant(850 + k, 'reed'));
    S.plants = [];
    const place = (x, y, kinds) => { const v = kinds[Math.floor(hash(x, y, 706) * kinds.length)]; S.plants.push({ v, x, y }); };
    for (let ty = -1; ty < 17; ty++) for (let tx = -2; tx < 26; tx++) {
      const ch = T(tx, ty);
      if (ch === ';') for (let k = 0; k < 4; k++) place(tx * TS + 4 + Math.floor(hash(tx, ty + k, 707) * 24), ty * TS + 8 + Math.floor(hash(tx + k, ty, 708) * 22), grass);
      else if (ch === '"') for (let k = 0; k < 5; k++) place(tx * TS + 2 + Math.floor(hash(tx, ty + k, 709) * 26), ty * TS + 3 + k * 6 + Math.floor(hash(tx + k, ty, 715) * 5), hash(tx + k, ty + k, 716) > 0.3 ? reeds : grass);
      else if ((ch === '.' || ch === ',') && hash(tx, ty, 710) > 0.55) place(tx * TS + 4 + Math.floor(hash(tx, ty, 711) * 24), ty * TS + 6 + Math.floor(hash(tx, ty, 712) * 24), grass);
    }
    // a fringe along the mill's footing and the race's banks
    for (let x = 196; x < 412; x += 9) if (hash(x, 3, 713) > 0.35 && (x < 286 || x > 322)) place(x, 162, grass);
    for (let x = 418; x < 600; x += 8) { place(x, 98, reeds); if (hash(x, 1, 714) > 0.5) place(x + 3, 131, grass); }
  }
  // the breeze: a gust travelling across the clearing from the west
  const leanAt = (x, t) => (t ? Math.round(Math.sin(t / 900 - x / 70) * 0.7 + Math.sin(t / 2300 - x / 160) * 0.6) : 0);

  // motes in the light, two butterflies, a few leaves coming down from the forest
  function life(S, c, cam, bw, bh, t) {
    const px = (x, y, col, w, h) => { c.fillStyle = col; c.fillRect(Math.round(x - cam.x), Math.round(y - cam.y), w || 1, h || 1); };
    for (let k = 0; k < 46; k++) {
      const bx = -80 + hash(k, 1, 720) * 640, by = -40 + hash(k, 2, 720) * 280, sp = 4 + hash(k, 3, 720) * 6;
      const y = by - ((t / 1000) * sp + hash(k, 4, 720) * 60) % 60, x = bx + Math.sin(t / (1600 + k * 37) + k) * 7;
      const a = 0.35 + 0.45 * Math.max(0, Math.sin(t / (700 + k * 23) + k * 1.7));
      px(x, y, 'rgba(255,240,200,' + a.toFixed(2) + ')', hash(k, 5, 720) > 0.8 ? 2 : 1, 1);
    }
    for (const [k, cx, cy, col] of [[0, 262, 188, '#fbfbf2'], [1, 404, 176, '#f8d860']]) {
      const x = cx + Math.sin(t / 1900 + k * 2) * 34 + Math.sin(t / 700 + k) * 6, y = cy + Math.sin(t / 1300 + k * 3) * 14 + Math.sin(t / 260 + k) * 2;
      const open = Math.floor(t / 110 + k) % 2 === 0;
      if (open) { px(x - 2, y, col, 2, 2); px(x + 1, y, col, 2, 2); px(x, y + 1, '#3a2a2a'); }
      else { px(x - 1, y - 1, col, 1, 2); px(x + 1, y - 1, col, 1, 2); px(x, y, '#3a2a2a', 1, 2); }
    }
    for (let k = 0; k < 6; k++) {
      const life = 7000 + k * 900, ph = ((t + k * 2300) % life) / life;
      const x = -20 + k * 34 + ph * 140 + Math.sin(ph * 12 + k) * 10, y = -10 + k * 12 + ph * 230;
      const col = ['#c9b04a', '#9cbf4c', '#d88a3a'][k % 3];
      const flip = Math.floor(ph * 40) % 2;
      px(x, y, col, flip ? 2 : 1, flip ? 1 : 2);
    }
  }

  function build() {
    rows = RB.content.maps[MAP].terrain;
    const S = { X0, Y0, W, H, TS };
    const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
    buildGround(S);
    S.groundCv = S.ground.canvas();
    buildWater(S);
    buildTrees(S);
    S.house = RB.studyHouse.build();
    buildPlants(S);
    buildShadows(S);
    { // the mill's own shadow, and a dark line of contact along its foot
      const poly = K.inPoly(S.house.shadow.map(([x, y]) => [x - X0, y - Y0]));
      for (let y = 84 - Y0; y < 172 - Y0; y++) for (let x = 405 - X0; x < 466 - X0; x++) {
        if (!poly(x + 0.5, y + 0.5)) continue;
        const edge = !poly(x + 2.5, y + 0.5) || !poly(x + 0.5, y + 2.5) || !poly(x - 1.5, y - 1.5);
        S.shadowA[y * W + x] = Math.max(S.shadowA[y * W + x], edge ? 0.4 : 0.62); // a softer rim: the penumbra
      }
      for (let x = 190 - X0; x < 418 - X0; x++) for (let y = 160 - Y0; y < 164 - Y0; y++) S.shadowA[y * W + x] = Math.max(S.shadowA[y * W + x], 0.55 - (y - (160 - Y0)) * 0.12);
    }
    S.shadowCv = shadowCanvas(S);
    S.buildMs = (typeof performance !== 'undefined' ? performance.now() : 0) - t0;
    return S;
  }

  // draw the scene into c (the game's art-resolution buffer); cam = the world point at the buffer's top left
  function draw(S, c, cam, bw, bh, t, o) {
    o = o || {};
    const sx = Math.round(cam.x - X0), sy = Math.round(cam.y - Y0);
    c.drawImage(S.groundCv, sx, sy, bw, bh, 0, 0, bw, bh);
    const tm = o.motion === false ? 0 : Math.max(0, t);
    const f = Math.floor(((tm % WATER_MS) / WATER_MS) * WATER_N) % WATER_N, Wt = S.water;
    c.drawImage(Wt.frames[f], Wt.x - sx, Wt.y - sy);
    if (o.light !== false) {
      c.globalCompositeOperation = 'multiply';
      c.drawImage(S.shadowCv, sx, sy, bw, bh, 0, 0, bw, bh);
      c.globalCompositeOperation = 'source-over';
    }
    // things that stand, back to front
    const list = [];
    for (const tr of S.trees) {
      const v = tr.v, dx = tr.x - v.ax - cam.x, dy = tr.y - v.ay - cam.y;
      if (dx > bw || dy > bh || dx + v.w < 0 || dy + v.h < 0) continue;
      list.push({ z: tr.y, draw: () => drawTree(c, tr, dx, dy, tm) });
    }
    for (const pl of S.plants) {
      const v = pl.v, dx = pl.x - (v.w >> 1) - cam.x, dy = pl.y - v.h - cam.y;
      if (dx > bw || dy > bh || dx + v.w < 0 || dy + v.h < 0) continue;
      list.push({ z: pl.y, draw: () => c.drawImage(v.frames[leanAt(pl.x, tm) + 1], dx, dy) });
    }
    const Hs = S.house;
    list.push({ z: Hs.mill.z, draw: () => c.drawImage(Hs.mill.cv, Hs.mill.x - cam.x, Hs.mill.y - cam.y) });
    list.push({ z: Hs.lean.z, draw: () => c.drawImage(Hs.lean.cv, Hs.lean.x - cam.x, Hs.lean.y - cam.y) });
    const wf = Math.floor(((tm % Hs.WHEEL_MS) / Hs.WHEEL_MS) * Hs.WHEEL_N) % Hs.WHEEL_N;
    list.push({ z: Hs.wheel.z, draw: () => { c.drawImage(Hs.wheel.frames[wf], Hs.wheel.x - cam.x, Hs.wheel.y - cam.y); Hs.drawFoam(c, cam, tm); } });
    if (o.extra) for (const e of o.extra) list.push(e);
    list.sort((a, b) => a.z - b.z);
    for (const e of list) e.draw();
  }
  // a tree, its canopy in three bands that sway a pixel in the breeze (the top most, the trunk not at all)
  function drawTree(c, tr, dx, dy, t) {
    const v = tr.v;
    if (!tr.edge || !t) { c.drawImage(v.cv, dx, dy); return; }
    const gust = Math.sin(t / 1300 + tr.ph) * 0.6 + Math.sin(t / 3100 + tr.ph * 0.7) * 0.6;
    const cut1 = Math.round(v.canopyBottom * 0.35), cut2 = Math.round(v.canopyBottom * 0.7);
    const o1 = Math.round(gust * 1.4), o2 = Math.round(gust * 0.8);
    c.drawImage(v.cv, 0, cut2, v.w, v.h - cut2, dx, dy + cut2, v.w, v.h - cut2);
    c.drawImage(v.cv, 0, cut1, v.w, cut2 - cut1, dx + o2, dy + cut1, v.w, cut2 - cut1);
    c.drawImage(v.cv, 0, 0, v.w, cut1, dx + o1, dy, v.w, cut1);
  }

  return { build, draw, life, T: () => T, X0, Y0, W, H, TS, SUN };
})();
