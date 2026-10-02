/* Creatures A (battle addendum §5, §6, §9, §10, §18): the shared rig for the Chapter 1–3
 * creature families — wisp, moth, blot, echo, crab, crane, golem, sg_letter, clerk, warden —
 * drawn in src/ui/78b_*.js … 78f_*.js, with their effects and the Shroud veil in
 * src/ui/84a_creatures_a_fx.js. Record: docs/battle/creatures_a.md.
 *
 * What this file adds (presentation only; nothing here reads or changes a rule):
 *
 * 1. Posed-frame variants on top of the authored-pose seam (78_enemy_art.js). A foe cue's
 *    `family` chooses a frame set: act 'exec' + family 'strike' draws spec.poses['exec.strike']
 *    when the definition has it (else the plain act's frames). 'strike@2' holds frame 2 of that
 *    set for the whole cue (a held key pose). spec.alias maps one set onto another's frames (one
 *    cache entry). With reduced motion nothing steps through frames: a delivery's held key poses
 *    (@k) show, the settled look shows at once, and every other cue keeps the still idle drawing. The stage still sees
 *    the plain act ('exec', 'cast' …), so the rest of the game reads the action as before.
 * 2. A rig helper: a family draws every frame from one parametric function rig(L, q, o, H) with a
 *    pose q; idle frames and authored action frames are tables of q over a neutral pose.
 * 3. Choreography helpers for the families' deliveries (RB.battleSeq.addDelivery, registered by
 *    84a once the sequencer exists — this file loads before it).
 * 4. The audit register: every enemy id of these families with its disposition (§9.1, §4 D).
 *
 * Motion styles: each family uses its own MOVES style ('a_<family>') whose prep / exec / cast /
 * recover offsets are zero (the authored frames and the cue's `travel` carry the movement, so
 * the shadow and the body agree); recoil keeps a small directional push. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.creaturesA = (function () {
  'use strict';
  const EA = RB.enemyArt, K = RB.pxkit;
  const FAMILIES = ['wisp', 'moth', 'blot', 'echo', 'crab', 'crane', 'golem', 'sg_letter', 'clerk', 'warden'];

  // ---- 1. posed-frame variants -------------------------------------------------------------
  // where the settled look holds with reduced motion, as a share of its set (1: the last frame)
  const STILL_AT = { settle: 1 };
  function resolve(spec, pose, still) {
    const P = spec.poses;
    // (only definitions built with this rig: another area's poses keep the seam's own behaviour)
    if (!spec._qa || !P || !spec.pose || !pose || !pose.act) return null;
    let fam = pose.family ? String(pose.family) : '', hold = -1;
    const at = fam.lastIndexOf('@');
    if (at >= 0) { hold = +fam.slice(at + 1) || 0; fam = fam.slice(0, at); }
    const al = spec.alias || {}, cand = fam ? pose.act + '.' + fam : '';
    let key = cand && (P[cand] || al[cand]) ? cand : pose.act;
    if (al[key]) key = al[key];
    const n = P[key] | 0;
    if (!n) return null;
    let k = pose.k;
    if (hold >= 0) k = (Math.min(n - 1, hold) + 0.5) / n;
    else if (still) {
      // reduced motion: only a creature's own delivery asks for a held key pose (@k); every other cue
      // (the shared reactions, an interrupted move, Rest) keeps its still idle drawing, as the seam's
      // motion does — and the settled creature shows as it will stay, at once
      if (pose.act !== 'settle') return Object.assign({}, pose, { act: pose.act + '~still' });
      const sa = spec.still && spec.still[key] != null ? spec.still[key] : STILL_AT.settle;
      k = (Math.round(sa * (n - 1)) + 0.5) / n;
    }
    if (key === pose.act && k === pose.k) return null;
    return Object.assign({}, pose, { act: key, k });
  }
  const baseDrawPosed = EA.drawPosed;
  EA.drawPosed = function (c, id, t, o, x, y, s, still, pose) {
    const spec = EA.P[id];
    const v = spec && pose ? resolve(spec, pose, still) : null;
    return baseDrawPosed(c, id, t, o, x, y, s, still, v || pose);
  };

  // ---- 2. styles and the rig ---------------------------------------------------------------
  function style(name, recoil) {
    EA.MOVES[name] = { prep: {}, exec: {}, cast: {}, recoil: Object.assign({ push: 4, lean: 0.001 }, recoil || {}) };
    return name;
  }
  const lerp = (a, b, k) => a + (b - a) * k;
  // q = base ⊕ partial (arrays merged item by item)
  function q(base, part) {
    const out = Object.assign({}, base);
    for (const k in part) out[k] = Array.isArray(part[k]) ? part[k].slice() : part[k];
    return out;
  }
  // two-sided value (near = the side facing the party, screen-left; far = right)
  const side = (v, i) => (Array.isArray(v) ? v[i] : v);
  // A family definition from a rig: { rig(L, q, o, H), base, idle: [partial q…], poseTable:
  // { key: [partial q…] } } → the enemyArt spec fields (build, frames, poses, pose).
  function family(id, d) {
    const idle = d.idle.map((p) => q(d.base, p));
    const table = {}, poses = {};
    for (const key in d.poseTable) { table[key] = d.poseTable[key].map((p) => q(d.base, p)); poses[key] = table[key].length; }
    const spec = Object.assign({}, d.spec, {
      frames: idle.length,
      poseMotion: d.spec.poseMotion || 'travel',
      motion: style('a_' + id, d.recoil),
      build(L, f, o, H) { if (api.onBuilt && f === (d.spec.seq ? d.spec.seq[0] : 0)) api.onBuilt(id, o || {}); return d.rig(L, idle[f] || idle[0], o || {}, H, 'idle', f); },
      poses,
      pose(L, act, i, n, o, H, sd) { const t = table[act] || table[act.split('.')[0]]; return d.rig(L, (t && t[Math.min(t.length - 1, i)]) || idle[0], o || {}, H, act, i, sd); },
      alias: d.alias || null,
      still: d.still || null,
      veil: d.veil || null,
      _qa: { idle, table, base: d.base },
    });
    EA.def(id, spec);
    return spec;
  }

  // A precompiled polygon for fills drawn every frame (flat arrays, no per-pixel destructuring):
  // poly(pts) → { fill(L, M, sh) } — the same pixels as L.poly, several times faster.
  function poly(pts) {
    const n = pts.length, xs = new Float64Array(n), ys = new Float64Array(n);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (let i = 0; i < n; i++) { xs[i] = pts[i][0]; ys[i] = pts[i][1]; x0 = Math.min(x0, xs[i]); y0 = Math.min(y0, ys[i]); x1 = Math.max(x1, xs[i]); y1 = Math.max(y1, ys[i]); }
    const inside = (x, y) => {
      let c = false;
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const yi = ys[i], yj = ys[j];
        if ((yi > y) !== (yj > y) && x < ((xs[j] - xs[i]) * (y - yi)) / (yj - yi) + xs[i]) c = !c;
      }
      return c;
    };
    return { pts, inside, fill: (L, M, sh) => L.fill(x0, y0, x1, y1, inside, M, sh) };
  }
  // fpoly(L, pts, M, sh): L.poly on the precompiled test (for big facets drawn every frame)
  const fpoly = (L, pts, M, sh) => poly(pts).fill(L, M, sh);

  // stone(L, pts, M, o): the same dressed-stone shading as L.stone (pxkit), on the precompiled
  // polygon test — used for the many stones a posed golem, crab or clerk frame redraws.
  function stone(L, pts, M, o) {
    o = o || {};
    const face = o.face == null ? 2 : o.face, bev = o.bevel == null ? 3 : o.bevel, n = M.n;
    const m = pts.length, ax = new Float64Array(m), ay = new Float64Array(m), dxs = new Float64Array(m), dys = new Float64Array(m), l2 = new Float64Array(m), lit = new Float64Array(m);
    let cx = 0, cy = 0;
    for (const p of pts) { cx += p[0] / m; cy += p[1] / m; }
    const T = L.T;
    for (let i = 0; i < m; i++) {
      const a = pts[i], b = pts[(i + 1) % m];
      ax[i] = a[0]; ay[i] = a[1]; dxs[i] = b[0] - a[0]; dys[i] = b[1] - a[1]; l2[i] = dxs[i] * dxs[i] + dys[i] * dys[i] || 1;
      let nx = b[1] - a[1], ny = a[0] - b[0];
      const len = Math.hypot(nx, ny) || 1;
      nx /= len; ny /= len;
      if ((a[0] - cx) * nx + (a[1] - cy) * ny < 0) { nx = -nx; ny = -ny; }
      let wx = T[0] * nx + T[2] * ny, wy = T[1] * nx + T[3] * ny;
      const wl = Math.hypot(wx, wy) || 1;
      wx /= wl; wy /= wl;
      lit[i] = -(wx * 0.62 + wy * 0.78);
    }
    const P = poly(pts);
    return P.fill(L, M, (x, y) => {
      let best = 1e9, e = -1;
      for (let i = 0; i < m; i++) {
        let t = ((x - ax[i]) * dxs[i] + (y - ay[i]) * dys[i]) / l2[i];
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const ex = ax[i] + dxs[i] * t - x, ey = ay[i] + dys[i] * t - y, d = ex * ex + ey * ey;
        if (d < best) { best = d; e = i; }
      }
      best = Math.sqrt(best);
      let k = face;
      if (best < bev && e >= 0) k = face + (lit[e] > 0.35 ? 2 : lit[e] > -0.2 ? 1 : lit[e] > -0.7 ? -1 : -2);
      if (o.seam !== false && best < 1.1 && e >= 0 && lit[e] < -0.2) k = 0;
      return ((k < 0 ? 0 : k > n - 1 ? n - 1 : k) + 0.5) / n;
    });
  }

  // outline(L): the same selective outline as L.outline() (pxkit), scanning only the rows and
  // columns that hold pixels (a posed frame's canvas is mostly empty)
  function outline(L) {
    const { w, h, px, mt } = L, MATS = K.MATS;
    let x0 = w, x1 = -1, y0 = h, y1 = -1;
    for (let y = 0; y < h; y++) {
      const r = y * w;
      for (let x = 0; x < w; x++) if (px[r + x] >>> 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; y1 = y; }
    }
    if (x1 < 0) return L;
    x0 = Math.max(0, x0 - 1); x1 = Math.min(w - 1, x1 + 1); y0 = Math.max(0, y0 - 1); y1 = Math.min(h - 1, y1 + 1);
    const out = px.slice(), omt = mt.slice();
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const i = y * w + x;
      if (px[i] >>> 24) continue;
      let dark = 0, lit = 0, m = 0;
      const chk = (j, isLit) => {
        if (!(px[j] >>> 24)) return;
        const M = MATS[mt[j]];
        if (!M || !M.line) return;
        if (isLit) { if (!lit) { lit = M.lineLit; m = m || M.id; } } else if (!dark) { dark = M.line; m = M.id; }
      };
      if (x + 1 < w) chk(i + 1, true);
      if (y + 1 < h) chk(i + w, true);
      if (x > 0) chk(i - 1, false);
      if (y > 0) chk(i - w, false);
      const col = dark || lit;
      if (col) { out[i] = col; omt[i] = m; }
    }
    L.px = out; L.mt = omt;
    return L;
  }

  // ---- 3. choreography helpers ---------------------------------------------------------------
  const queue = [];
  function deliver(art, kinds, fn) { for (const k of [].concat(kinds)) queue.push([art, k, fn]); }
  // what actually met the creature's target in this move (the rules' results, read-only)
  function outcome(a) {
    const fx = a.fx || [];
    const at = a.aimed;
    if (a.countered) return a.wardBlock ? 'ward' : 'none';
    const miss = fx.some((f) => f.t === 'comp' && f.who === 'suzu' && f.missAt);
    const blk = fx.some((f) => f.t === 'block' && (!at || f.who === at || a.fam !== 'strike'));
    const hit = fx.some((f) => f.t === 'hit' && (!at || f.who === at || a.fam !== 'strike'));
    if (miss && !hit && !blk) return 'miss';
    if (blk && hit) return 'soft';
    if (blk) return 'block';
    if (hit) return 'hit';
    return 'none';
  }
  // cue builders: F(at, act, d, family, travel) and fx / sfx in move-relative ms
  function kit(a) {
    const out = [];
    const rd = !!(a.ctx && a.ctx.reduce);
    return {
      rd, out,
      F(at, act, d, family, travel) { out.push(a.foeCue(Object.assign({ at: Math.max(0, Math.round(at)), act, d: Math.max(1, Math.round(d)), dir: a.dir, family }, travel && !rd ? { travel } : {}))); return this; },
      X(at, name, d, p) { out.push({ at: Math.max(0, Math.round(at)), type: 'fx', name, d: Math.round(d), p: Object.assign({ foe: a.me }, p || {}) }); return this; },
      S(at, name) { out.push({ at: Math.max(0, Math.round(at)), type: 'sfx', name }); return this; },
      done(contact, end) { return { cues: out, contact: Math.round(contact), end: Math.round(end) }; },
    };
  }

  // ---- 4. audit register -----------------------------------------------------------------------
  // family records: frame standard, anchor, idle, materials, anatomy, actions, overlays, reactions,
  // settle; enemy records: disposition 'upgraded' | 'meets' | 'incomplete' and a note
  const audit = { families: {}, enemies: {} };
  function auditFamily(id, rec) { audit.families[id] = rec; }
  function auditEnemy(id, art, disposition, note) { audit.enemies[id] = { art, disposition, note: note || '' }; }

  // ---- 5. the restyle standard: ramps, outlines, light ------------------------------------------
  // (docs/battle/creatures_a.md, "The rendering standard"). Every material is a 5–7 tone ramp whose
  // hue moves as it brightens (shadows cooler and more saturated, highlights warmer and paler), with
  // a high value range; its outline is a COLOUR — the material's darkest tone pushed further toward
  // deep violet / navy / red-brown — and its lit-edge outline a lighter tone of the same family.
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  function toward(h, target, deg) { const d = ((target - h + 540) % 360) - 180; return h + clamp(d, -deg, deg); }
  const hx = (h, s, l) => K.hex(K.hsl2rgb(h, clamp(s, 0, 1), clamp(l, 0.02, 0.98)));
  // hramp(base, o) → n hex colours, dark → light. The base colour is the tone at index `at`.
  //   o: n (6), at (≈ 0.55 of the way), lo / hi (lightness of the ends), cool / warm (hue targets),
  //   hd / hl (max hue travel in degrees toward them), sat (mid saturation ×), sd (darkest
  //   saturation), sl (lightest saturation ×)
  function hramp(base, o) {
    o = o || {};
    const c = K.parse(base), hsl = K.rgb2hsl(c[0], c[1], c[2]);
    const h = hsl[0], s = hsl[1], l = hsl[2], grey = s < 0.09;
    const n = o.n || 6, at = o.at != null ? o.at : Math.round((n - 1) * 0.55);
    const lo = o.lo != null ? o.lo : 0.13, hi = o.hi != null ? o.hi : 0.92;
    const cool = o.cool != null ? o.cool : 250, warm = o.warm != null ? o.warm : 50;
    const hd = o.hd != null ? o.hd : 34, hl = o.hl != null ? o.hl : 22;
    const sm = clamp(s * (o.sat != null ? o.sat : 1.2) + (grey ? 0.05 : 0), 0, 0.85);
    const D = [grey ? cool : toward(h, cool, hd), clamp(o.sd != null ? o.sd : Math.max(sm * 1.05, grey ? 0.16 : 0.32), 0, 0.9), lo];
    const Lt = [grey ? warm : toward(h, warm, hl), clamp(sm * (o.sl != null ? o.sl : 0.62) + (grey ? 0.05 : 0), 0, 0.9), hi];
    const B = [h, sm, clamp(o.l != null ? o.l : l, lo + 0.08, hi - 0.06)];
    const out = [];
    for (let i = 0; i < n; i++) {
      let a, b, k;
      if (i <= at) { a = D; b = B; k = at ? i / at : 1; } else { a = B; b = Lt; k = (i - at) / (n - 1 - at); }
      const dh = ((b[0] - a[0] + 540) % 360) - 180;
      out.push(hx(a[0] + dh * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k));
    }
    return out;
  }
  // hmat(base, o) → a pxkit material from hramp, with a coloured outline (o.line, else the darkest
  // tone pushed toward o.lineHue), a lighter lit-edge outline (o.lineLit) and a cool rim tone
  // (o.rim, used by rim()). o.line: false for marks drawn inside another form.
  function hmat(base, o) {
    o = o || {};
    const cols = o.cols || hramp(base, o);
    const d = K.parse(cols[0]), dh = K.rgb2hsl(d[0], d[1], d[2]);
    const lh = o.lineHue != null ? o.lineHue : toward(dh[0], o.cool != null ? o.cool : 250, 22);
    const line = o.line === false ? false : o.line || hx(lh, Math.max(0.42, Math.min(0.75, dh[1] + 0.12)), o.lineL != null ? o.lineL : Math.max(0.06, dh[2] * 0.55));
    const lineLit = o.line === false ? undefined : o.lineLit || K.hex(K.mix(K.parse(line), K.parse(cols[1]), 0.55));
    const M = K.mat(null, { cols, at: o.at != null ? o.at : Math.round((cols.length - 1) * 0.55), line, lineLit, alpha: o.alpha });
    if (o.alpha != null && !M._a) { M._a = 1; for (let i = 0; i < M.c.length; i++) { const v = K.parse(cols[i]); v[3] = o.alpha; M.rgba[i] = v; M.c[i] = K.pack(v); } }
    if (!M.rimC) M.rimC = K.pack(K.parse(o.rim || K.hex(K.mix(K.parse(cols[Math.max(0, cols.length - 2)]), [150, 186, 255, 255], 0.5))));
    return M;
  }
  // the ramp index of a pixel inside its own material (−1 if it is not one of its tones)
  const stepOf = (L, i) => { const M = K.MATS[L.mt[i]]; return M ? M.c.indexOf(L.px[i]) : -1; };
  function nudge(L, i, k) {
    const M = K.MATS[L.mt[i]];
    if (!M) return;
    const j = M.c.indexOf(L.px[i]);
    if (j < 0) return;
    L.px[i] = M.c[clamp(j + k, 0, M.n - 1)];
  }
  // cast(back, front, dx, dy, k, mats?): the front layer's shadow on the back one — every back
  // pixel that the front form would cover if moved by (dx, dy) (down-right: the key light is upper
  // left), and that the front form does not cover itself, steps k tones darker in its own ramp
  function cast(back, front, dx, dy, k, only) {
    const { w, h } = back, fp = front.px, bp = back.px;
    for (let y = 0; y < h; y++) {
      const sy = y - dy;
      if (sy < 0 || sy >= h) continue;
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (!(bp[i] >>> 24) || (fp[i] >>> 24)) continue;
        const sx = x - dx;
        if (sx < 0 || sx >= w || !(fp[sy * w + sx] >>> 24)) continue;
        if (only && !only.includes(back.mt[i])) continue;
        nudge(back, i, -(k || 1));
      }
    }
    return back;
  }
  // inner shadow of a form on itself: pixels whose (dx, dy) neighbour lies outside the form, i.e.
  // its lower-right flank, step k darker (a crisp core shadow band, not pillow shading)
  function flank(L, dx, dy, k, only) {
    const { w, h, px } = L, out = px.slice();
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!(px[i] >>> 24) || (only && !only.includes(L.mt[i]))) continue;
      const X = x + dx, Y = y + dy;
      if (X >= 0 && Y >= 0 && X < w && Y < h && px[Y * w + X] >>> 24 && L.mt[Y * w + X] === L.mt[i]) continue;
      const M = K.MATS[L.mt[i]];
      const j = M ? M.c.indexOf(px[i]) : -1;
      if (j >= 0) out[i] = M.c[clamp(j - (k || 1), 0, M.n - 1)];
    }
    L.px = out;
    return L;
  }
  // rim(L, mats, o): the cool back light along the right-hand edges of the given materials — each
  // pixel whose right neighbour is empty (and that is not a 1-px sliver) takes its material's rim
  // tone; o.w (1 or 2) widens it, o.down also lights lower edges on the right half
  function rim(L, only, o) {
    o = o || {};
    const { w, h, px, mt } = L, out = px.slice(), wd = o.w || 1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!(px[i] >>> 24) || (only && !only.includes(mt[i]))) continue;
      const M = K.MATS[mt[i]];
      if (!M || !M.rimC) continue;
      let edge = false;
      for (let k = 1; k <= wd && !edge; k++) if (x + k >= w || !(px[i + k] >>> 24)) edge = true;
      if (edge && x > 0 && !(px[i - 1] >>> 24)) edge = false;
      if (!edge && o.down && y + 1 < h && !(px[i + w] >>> 24) && x + 1 < w && !(px[i + w + 1] >>> 24) && x > 0 && px[i - 1] >>> 24) edge = true;
      if (edge && y > 0 && !(px[i - w] >>> 24) && !o.top) edge = false;
      if (edge) out[i] = M.rimC;
    }
    L.px = out;
    return L;
  }
  // despeckle(L): a lone pixel whose four neighbours all share one other tone of the same material
  // takes that tone (clusters, not noise); deliberate accents are drawn after it
  function despeckle(L) {
    const { w, h, px, mt } = L, out = px.slice();
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x, v = px[i];
      if (!(v >>> 24)) continue;
      const a = px[i - 1];
      if (a === v || !(a >>> 24) || px[i + 1] !== a || px[i - w] !== a || px[i + w] !== a) continue;
      if (mt[i - 1] !== mt[i]) continue;
      out[i] = a;
    }
    L.px = out;
    return L;
  }
  // band(L, M, k, test): re-tone every pixel of material M inside a local-space test to step k (or
  // by a function of x, y → step) — hard-edged material bands, specular streaks and blotches
  function band(L, M, test, k, box) {
    const B = box || [-1e4, -1e4, 1e4, 1e4];
    return L.scan(B[0], B[1], B[2], B[3], test, (i, lx, ly) => {
      if (!L.px[i] || L.mt[i] !== M.id) return;
      const kk = typeof k === 'function' ? k(lx, ly, stepOf(L, i)) : k;
      if (kk == null || kk < 0) return;
      L.px[i] = M.c[clamp(kk | 0, 0, M.n - 1)];
    });
  }
  // ball(cx, cy, rx, ry, o) → a shading function (0 … 1) for a rounded form under the key light, in
  // crisp bands when quantised: a lit cap up-left, the mid tone, a core shadow, and a narrow band
  // of reflected light along the shadowed rim (o.refl) — volume without pillow shading.
  // o.lift raises it all (a pale or glowing material), o.k sharpens the light/shadow split,
  // o.mirror for a form drawn in mirrored coordinates (the light stays upper left on screen).
  function ball(cx, cy, rx, ry, o) {
    o = o || {};
    const lift = o.lift || 0, refl = o.refl == null ? 0.1 : o.refl, k = o.k || 1, mx = o.mirror ? -1 : 1;
    return (x, y) => {
      const nx = (mx * (x - cx)) / rx, ny = (y - cy) / (ry || rx), d = nx * nx + ny * ny;
      const nz = Math.sqrt(Math.max(0, 1 - d));
      const f = -(nx * 0.56 + ny * 0.68) * k + nz * 0.42;
      let v = 0.46 + f * 0.5 + lift;
      if (d > 0.74 && f < 0.02) v += refl;
      return clamp(v, 0, 0.999);
    };
  }
  // the standard finish for a set of overlapping layers (back → front): outline each in its own
  // colours, then each nearer layer casts its shadow (dx, dy, one step) on the ones behind it
  function finish(layers, o) {
    o = o || {};
    const sh = o.shadow == null ? [2, 3] : o.shadow;
    for (let i = layers.length - 1; i > 0; i--) if (sh && layers[i]) for (let j = 0; j < i; j++) if (layers[j]) cast(layers[j], layers[i], sh[0], sh[1], 1);
    for (const Lr of layers) if (Lr) outline(Lr);
    let out = null;
    for (const Lr of layers) if (Lr) out = out ? out.over(Lr) : Lr;
    return out;
  }

  // (onBuilt: set by 84a — the first idle frame of a creature built in a battle schedules the
  // prewarm of its action frames)
  const api = { FAMILIES, resolve, style, q, side, lerp, family, poly, stone, outline, deliver, queue, outcome, kit, audit, auditFamily, auditEnemy, K, onBuilt: null,
    fpoly, hramp, hmat, toward, stepOf, nudge, cast, flank, rim, despeckle, band, finish, ball };
  return api;
})();
