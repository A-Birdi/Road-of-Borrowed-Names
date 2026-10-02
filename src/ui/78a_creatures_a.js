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
    if (!P || !spec.pose || !pose || !pose.act) return null;
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

  // (onBuilt: set by 84a — the first idle frame of a creature built in a battle schedules the
  // prewarm of its action frames)
  const api = { FAMILIES, resolve, style, q, side, lerp, family, poly, stone, outline, deliver, queue, outcome, kit, audit, auditFamily, auditEnemy, K, onBuilt: null };
  return api;
})();
