/* Battle figures: the two adventurers seen from behind and to the side (a rear
 * three-quarter view), facing diagonally up-right toward the foe, with a pose
 * library. See docs/ART_DIRECTION.md §10 for the standard.
 *
 * Every look is built from one pose-driven rig: joints placed by the pose
 * (the hands and feet by two-bone IK, so a gesture is written as "where the
 * hand goes"), body parts as simple volumes on those joints — ellipsoids for
 * head, hips and hands, tapered capsules for limbs and tails, lofted sections
 * for the torso and skirts, boxes for books and bags — rasterized at art
 * resolution with a depth buffer. Each pixel takes one tone of its material's
 * six-tone hue-shifted ramp from the key light (upper left, toward the viewer),
 * through the material's own recipe (clustered locks and a highlight arc in hair,
 * folds with lit ridges in cloth, hard bands in metal, a glint in glass); then the
 * craft passes of the owner's reference (round 2 of the battle art): cast shadows
 * under overlapping forms, a form line on the farther of two overlapping parts,
 * seams where colours meet, a cool rim down the right-hand edges, lone pixels
 * folded into their cluster, and an outline in each material's own deep colour
 * that breaks lighter on lit upper-left edges. Nothing is smoothed: every edge is
 * a hard pixel edge on the same grid as the world. docs/battle/party.md records
 * the standard (ramps, outline rule, light, per-material recipes).
 *
 * Hands are articulated (palm, the fingers as one or more pieces and a thumb, by shape: fist, relaxed,
 * open, flat, point, pinch, cup, spread), and what a hand holds is drawn by it: the folio, a paper
 * strip, a brush, Mio's vial (from the bottles at her hip), Ren's lamp (raised when a gesture frees his
 * left hand). The pose library — every actor's stance, idle key poses, gestures and reactions — is
 * src/engine/34m_battler_moves.js (RB.battlerMoves); this file draws whatever pose it is given.
 *
 * Battle addendum §6.2 (native frame standard): the frame stays 80×104 art px, anchor (36, 100),
 * 1.14 art px per body unit. The 96×128 working frame was rendered from the same rig for comparison
 * (grid 'w96', previews only); docs/battle/party.md records the measurements and why 80×104 ships.
 *
 * API (the contract with the battle presentation):
 *   RB.battlers.FRAME, ANCHOR, POSES, GESTURES, VARIANTS
 *   RB.battlers.draw(ctx, look, o) -> anchors in canvas px:
 *     { hand (the acting release point, as before), head, chest, feet,
 *       torso, handR, handL, held (what the acting hand holds), release (where an effect leaves) }
 *     o: { x, y, scale, t, who: 'pc'|'comp', id: 'pc'|'nao'|'mio'|'ren'|'suzu', pose, gesture
 *          (a gesture for anticipate/act/recover; a variant for a reaction pose), k, reduce, facing }
 *   RB.battlers.preview(look, pose, gesture, k[, o]) -> canvas (one frame, scale 1)
 *   RB.battlers.prewarm(look, who[, id]); retain(list of looks); budget() -> resident pixel estimate
 * Frames are cached per look, actor, pose, gesture/variant and quantized progress or idle key: a
 * bounded set (least-recently-used, CAP frames). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.battlers = (function () {
  'use strict';
  const P = RB.pix, SP = RB.sprites;
  // The native grid: frame, foot anchor and art px per body unit. GRIDS.w96 is the §6.2 comparison.
  const GRIDS = {
    std: { id: 'std', FW: 80, FH: 104, AX: 36, AY: 100, ZS: 1.14 },
    w96: { id: 'w96', FW: 96, FH: 128, AX: 43, AY: 123, ZS: 1.368 },
  };
  let FW = 80, FH = 104, AX = 36, AY = 100, ZS = 1.14;
  function useGrid(g) { g = g || GRIDS.std; FW = g.FW; FH = g.FH; AX = g.AX; AY = g.AY; ZS = g.ZS; return g; }
  const M = () => RB.battlerMoves;
  const POSES = ['ready', 'calm', 'anticipate', 'act', 'recover', 'hit', 'brace', 'down', 'cheer', 'guard', 'soothed', 'afflict'];
  const shade = P.shade, mix = P.mix;
  const DEG = Math.PI / 180;

  // ---- small vector kit ----------------------------------------------------------------------
  const V = (x, y, z) => [x, y, z];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const len = (a) => Math.hypot(a[0], a[1], a[2]);
  const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const lerpN = (a, b, t) => a + (b - a) * t;
  // 3×3 matrices as arrays of three column vectors (the local axes in the parent frame)
  const M_ID = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const mv = (M, v) => [M[0][0] * v[0] + M[1][0] * v[1] + M[2][0] * v[2], M[0][1] * v[0] + M[1][1] * v[1] + M[2][1] * v[2], M[0][2] * v[0] + M[1][2] * v[1] + M[2][2] * v[2]];
  const mtv = (M, v) => [dot(M[0], v), dot(M[1], v), dot(M[2], v)];
  const mm = (A, B) => [mv(A, B[0]), mv(A, B[1]), mv(A, B[2])];
  const rotX = (a) => { const c = Math.cos(a), s = Math.sin(a); return [[1, 0, 0], [0, c, s], [0, -s, c]]; };  // pitch: +a tips the top forward (+z)
  const rotY = (a) => { const c = Math.cos(a), s = Math.sin(a); return [[c, 0, -s], [0, 1, 0], [s, 0, c]]; }; // yaw: +a turns forward (+z) toward +x
  const rotZ = (a) => { const c = Math.cos(a), s = Math.sin(a); return [[c, -s, 0], [s, c, 0], [0, 0, 1]]; };  // roll: +a tips the top toward +x (the body's right)
  const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);

  // ---- camera ------------------------------------------------------------------------------------
  // World: x right on screen, y up, z toward the viewer across the ground. The camera looks down
  // at PITCH. A body's local frame (x its right, y up, z its forward) is turned by YAW so that its
  // forward points up-right on the screen: we see its back and its right side.
  const PITCH = 20 * DEG, YAW = 36 * DEG;
  const cp = Math.cos(PITCH), spn = Math.sin(PITCH);
  const DIR = [0, -spn, -cp];                   // from the viewer into the scene
  const TOWARD = [0, spn, cp];                  // toward the viewer
  const LIGHT = norm([-0.72, 0.64, 0.36]);      // toward the light: upper left, a little in front
  // body local -> world: right -> (cos, 0, sin) (right and toward the viewer), forward -> (sin, 0, -cos)
  const BODY0 = [[Math.cos(YAW), 0, Math.sin(YAW)], [0, 1, 0], [Math.sin(YAW), 0, -Math.cos(YAW)]];
  // (a pose's `turn` — Suzu's twirl — turns the whole body about its foot anchor: the frame is set for the
  // one figure being built, so its side, front and back are the rig's own, never a mirrored costume)
  let BODY = BODY0;
  const bodyFor = (ps) => (ps && ps.turn ? mm(BODY0, rotY(ps.turn * DEG)) : BODY0);
  // ZS (above, per grid): art px per body unit: the figure is authored in body units and drawn a little larger.
  // world point -> [screen x from the anchor, screen y from the anchor (down +), depth toward viewer]
  const proj = (w) => [w[0] * ZS, -(w[1] * cp - w[2] * spn) * ZS, w[1] * spn + w[2] * cp];

  // ---- primitives ------------------------------------------------------------------------------------
  // A primitive: { kind, mat, grp, ... } in world coordinates. mat: { R: [6 tones], OL, RIM, LIT, kind,
  // th, pat(info, v, l), lev(info, l) }. The raster keeps, per pixel, the nearest hit: its depth, group,
  // material, tone step and the surface normal's screen-x and light terms (for the rim and the passes).
  function Raster() {
    const n = FW * FH;
    this.z = new Float32Array(n).fill(-1e9);
    this.g = new Int16Array(n).fill(-1);
    this.lv = new Int8Array(n);
    this.R = new Array(n);
    this.m = new Array(n);
    this.nx = new Float32Array(n);
    this.nl = new Float32Array(n);
    this.flag = new Uint8Array(n); // 1: keep (decals), 2: no contour, 4: no rim, 8: no cast shadow
  }
  // pixel centre -> ray origin on the depth-0 plane
  function rayO(px, py) {
    const sx = (px + 0.5 - AX) / ZS, su = (AY - (py + 0.5)) / ZS;
    return [sx, su * cp, -su * spn];
  }
  function bboxOf(pts, pad) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const w of pts) { const s = proj(w); x0 = Math.min(x0, s[0]); x1 = Math.max(x1, s[0]); y0 = Math.min(y0, s[1]); y1 = Math.max(y1, s[1]); }
    return [Math.max(0, Math.floor(AX + x0 - pad)), Math.max(0, Math.floor(AY + y0 - pad)), Math.min(FW - 1, Math.ceil(AX + x1 + pad)), Math.min(FH - 1, Math.ceil(AY + y1 + pad))];
  }
  // shading step from a normal and a material. Tones: 0 deep shadow, 1 shadow, 2 half-light, 3 the lit
  // plane (the material's own colour), 4 highlight; 5 (sheen, specular) only where a material's own
  // pattern or band puts it. A material may shade itself (lev: clustered locks, folds, hard metal bands).
  const TH = [0.74, 0.3, 0.1, -0.5];
  let lastN = TOWARD, lastL = 0;
  const levelOf = (l, f, th) => {
    let v = l > th[0] ? 4 : l > th[1] ? 3 : l > th[2] ? 2 : l > th[3] ? 1 : 0;
    if (f < 0.16 && l < 0.3) v = Math.min(v, 1); // the turned-away rim darkens
    return v;
  };
  function stepOf(n, mat, info) {
    const l = dot(n, LIGHT), f = dot(n, TOWARD);
    lastN = n; lastL = l;
    let v = mat.lev ? mat.lev(info, l, f) : levelOf(l, f, mat.th || TH);
    if (mat.pat) v += mat.pat(info, v, l);
    if (mat.min != null) v = Math.max(v, mat.min);
    if (mat.max != null) v = Math.min(v, mat.max);
    const top = mat.top || 4;
    return v < 0 ? 0 : v > top ? top : v;
  }
  function write(r, i, z, grp, mat, lv, flag) {
    if (z <= r.z[i]) return;
    r.z[i] = z; r.g[i] = grp; r.R[i] = mat.R; r.m[i] = mat; r.lv[i] = lv; r.flag[i] = flag || mat.flag || 0;
    r.nx[i] = lastN[0]; r.nl[i] = lastL;
  }
  // Ellipsoid: centre c, axes M (columns: unit axes), radii rad. info.l = local hit / radii.
  function ellipsoid(r, pr) {
    const { c, M, rad, mat, grp, keep } = pr;
    const ext = Math.max(rad[0], rad[1], rad[2]);
    const [x0, y0, x1, y1] = bboxOf([c], ext + 1);
    const dl = mtv(M, DIR); const d = [dl[0] / rad[0], dl[1] / rad[1], dl[2] / rad[2]];
    const A = dot(d, d);
    for (let py = y0; py <= y1; py++) for (let px = x0; px <= x1; px++) {
      const O = sub(rayO(px, py), c), ol = mtv(M, O), o = [ol[0] / rad[0], ol[1] / rad[1], ol[2] / rad[2]];
      const B = 2 * dot(o, d), C = dot(o, o) - 1, D = B * B - 4 * A * C;
      if (D < 0) continue;
      const s = (-B - Math.sqrt(D)) / (2 * A);
      const l = add(o, mul(d, s)); // on the unit sphere
      if (keep && !keep(l)) continue;
      const i = py * FW + px, z = -s;
      if (z <= r.z[i]) continue;
      const n = norm(mv(M, [l[0] / rad[0], l[1] / rad[1], l[2] / rad[2]]));
      write(r, i, z, grp, mat, stepOf(n, mat, { l, n, px, py, a: Math.atan2(l[0], l[2]), M }));
    }
  }
  const sphere = (r, c, rad, mat, grp, keep, M) => ellipsoid(r, { c, M: M || M_ID, rad: [rad, rad, rad], mat, grp, keep });
  // Tapered capsule from a to b: a chain of spheres (radius ra..rb); info.u runs 0..1 along it,
  // info.a is the angle round its axis (for stripes).
  function capsule(r, a, b, ra, rb, mat, grp, o) {
    o = o || {};
    const L = len(sub(b, a)), n = Math.max(1, Math.ceil(L / 0.7));
    const ax = norm(sub(b, a));
    const side = norm(Math.abs(ax[1]) < 0.9 ? cross(ax, [0, 1, 0]) : cross(ax, [1, 0, 0])), up2 = cross(side, ax);
    for (let k = 0; k <= n; k++) {
      const t = k / n, c = lerp(a, b, t), rad = lerpN(ra, rb, t);
      const [x0, y0, x1, y1] = bboxOf([c], rad + 1);
      const cz = 0;
      for (let py = y0; py <= y1; py++) for (let px = x0; px <= x1; px++) {
        const O = sub(rayO(px, py), c);
        const B = 2 * dot(O, DIR), C = dot(O, O) - rad * rad, D = B * B - 4 * C;
        if (D < 0) continue;
        const s = (-B - Math.sqrt(D)) / 2;
        const i = py * FW + px, z = -s + cz;
        if (z <= r.z[i]) continue;
        const hit = add(O, mul(DIR, s));
        const nn = norm(hit);
        if (o.keep && !o.keep(nn, t)) continue;
        write(r, i, z, grp, mat, stepOf(nn, mat, { u: t, a: Math.atan2(dot(nn, side), dot(nn, up2)), n: nn, px, py, len: L, ax }));
      }
    }
  }
  // Loft: a solid of elliptical sections along an axis from a (h = 0) to b (h = 1). prof: rows of
  // [h, rx, rz] (radii along the frame's x and z). M: the frame (its y column is the axis).
  function loft(r, pr) {
    const { a, b, M, prof, mat, grp, keep } = pr;
    const Lv = sub(b, a), L = len(Lv);
    const ex = M[0], ey = norm(Lv), ez = M[2];
    let rmax = 0; for (const q of prof) rmax = Math.max(rmax, q[1], q[2]);
    const mid = lerp(a, b, 0.5), R2 = Math.hypot(L / 2, rmax) + 0.5;
    const radAt = (h) => {
      if (h <= prof[0][0]) return [prof[0][1], prof[0][2]];
      for (let i = 1; i < prof.length; i++) if (h <= prof[i][0]) { const q0 = prof[i - 1], q1 = prof[i], t = (h - q0[0]) / (q1[0] - q0[0] || 1); return [lerpN(q0[1], q1[1], t), lerpN(q0[2], q1[2], t)]; }
      const q = prof[prof.length - 1]; return [q[1], q[2]];
    };
    const f = (w) => { const q = sub(w, a), h = dot(q, ey) / L; if (h < 0 || h > 1) return 1; const [rx, rz] = radAt(h); const x = dot(q, ex) / rx, z = dot(q, ez) / rz; return x * x + z * z - 1; };
    const [x0, y0, x1, y1] = bboxOf([a, b], rmax + 1);
    for (let py = y0; py <= y1; py++) for (let px = x0; px <= x1; px++) {
      const O = rayO(px, py);
      const oc = sub(O, mid), B = 2 * dot(oc, DIR), C = dot(oc, oc) - R2 * R2, D = B * B - 4 * C;
      if (D < 0) continue;
      const s0 = (-B - Math.sqrt(D)) / 2, s1 = (-B + Math.sqrt(D)) / 2;
      let s = s0, hit = null;
      for (; s <= s1; s += 0.45) { const w = add(O, mul(DIR, s)); if (f(w) <= 0) { hit = s; break; } }
      if (hit == null) continue;
      let lo = hit - 0.45, hi = hit;
      for (let k = 0; k < 5; k++) { const m = (lo + hi) / 2; if (f(add(O, mul(DIR, m))) <= 0) hi = m; else lo = m; }
      const w = add(O, mul(DIR, hi)), i = py * FW + px, z = -hi;
      if (z <= r.z[i]) continue;
      const q = sub(w, a), h = dot(q, ey) / L;
      const lx = dot(q, ex), lz = dot(q, ez);
      if (keep && !keep(lx, h, lz)) continue;
      const e = 0.35;
      let n = [f(add(w, [e, 0, 0])) - f(add(w, [-e, 0, 0])), f(add(w, [0, e, 0])) - f(add(w, [0, -e, 0])), f(add(w, [0, 0, e])) - f(add(w, [0, 0, -e]))];
      n = norm(n);
      if (!isFinite(n[0])) n = TOWARD;
      write(r, i, z, grp, mat, stepOf(n, mat, { h, a: Math.atan2(lx, lz), lx, lz, n, px, py, ey, ex, ez }));
    }
  }
  // Box: centre c, axes M, half sizes hs; info.face is the axis of the face hit (0,1,2) and its sign.
  function box(r, pr) {
    const { c, M, hs, mat, grp } = pr;
    const ext = Math.hypot(hs[0], hs[1], hs[2]);
    const [x0, y0, x1, y1] = bboxOf([c], ext + 1);
    const d = mtv(M, DIR);
    for (let py = y0; py <= y1; py++) for (let px = x0; px <= x1; px++) {
      const o = mtv(M, sub(rayO(px, py), c));
      let tn = -1e9, tf = 1e9, fa = 0, fs = 1;
      let ok = true;
      for (let k = 0; k < 3; k++) {
        if (Math.abs(d[k]) < 1e-9) { if (Math.abs(o[k]) > hs[k]) { ok = false; break; } continue; }
        let t1 = (-hs[k] - o[k]) / d[k], t2 = (hs[k] - o[k]) / d[k], sg = -1;
        if (t1 > t2) { const tt = t1; t1 = t2; t2 = tt; sg = 1; }
        if (t1 > tn) { tn = t1; fa = k; fs = sg; }
        if (t2 < tf) tf = t2;
      }
      if (!ok || tn > tf) continue;
      const i = py * FW + px, z = -tn;
      if (z <= r.z[i]) continue;
      const nl = [0, 0, 0]; nl[fa] = fs;
      const n = mv(M, nl), l = add(o, mul(d, tn));
      write(r, i, z, grp, mat, stepOf(n, mat, { face: fa, sign: fs, l, hs, n, px, py }));
    }
  }

  // ---- colour: hue-shifted ramps, coloured outlines -------------------------------------------------------
  // Every material is a ramp of six tones whose hue moves as it brightens: the shadows cooler and more
  // saturated (toward blue-violet; flesh toward crimson), the lights warmer (toward yellow-cream), with a
  // wide value range. Its outline (OL) is its own darkest tone pushed further toward deep blue/violet —
  // a colour, never black; LIT is the lighter line a lit edge breaks into (selective outline); RIM is the
  // cool back light that runs down the right-hand edges.
  const towardH = (h, target, amt) => { const d = ((target - h + 540) % 360) - 180; return h + Math.sign(d) * Math.min(Math.abs(d), amt); };
  const RC = new Map();
  function hramp(base, o) {
    o = o || {};
    const key = base + '|' + (o.sat || 1) + '|' + (o.cool || 250) + '|' + (o.warm || 52) + '|' + (o.lo || 0) + '|' + (o.hs || 1) + '|' + (o.hi || 1) + '|' + (o.rim || '') + '|' + (o.ds == null ? 1 : o.ds) + '|' + (o.ssh || 1);
    let out = RC.get(key);
    if (out) return out;
    let [h, s, l] = P.toHsl(P.rgba(base));
    // (a true grey takes a cool steel hue; a warm or cool near-black keeps its own)
    const grey = s < 0.1;
    if (s < 0.035) h = o.greyHue == null ? 222 : o.greyHue;
    // (pale colours — creams, whites, bleached cloth — shade toward a cool grey rather than through red)
    const pale = l > 0.74 && s < 0.5 && o.hs == null;
    const sat = o.sat || 1, hs = o.hs || (pale ? 0.4 : 1), cool = o.cool || 250, warm = o.warm || 52, dsk = o.ds == null ? (pale ? 0 : 1) : o.ds, ssh = o.ssh || (pale ? 0.4 : 1);
    // white materials keep their shadows lighter; dark ones lift less toward their highlight
    const lo = o.lo || (l > 0.78 ? 0.62 : l > 0.62 ? 0.8 : 1), hi = (o.hi || 1) * (l < 0.3 ? 0.7 : 1);
    const S = (x) => Math.max(0, Math.min(1, x));
    // (blues brighten toward cyan, not round through violet to the warm side)
    const warmT = !o.warm && h >= 170 && h <= 255 ? h - 120 : warm;
    const T = (lv, dh, ds) => P.hex(P.fromHsl(towardH(h, dh < 0 ? cool : warmT, Math.abs(dh) * hs), S(s * sat * (dh < 0 ? ssh : 1) + ds * (ds > 0 ? dsk : 1)), S(lv)));
    const R = [
      T(l * (1 - 0.6 * lo), -30, grey ? 0.07 : 0.16),
      T(l * (1 - 0.41 * lo), -19, grey ? 0.06 : 0.11),
      T(l * (1 - 0.2 * lo), -8, grey ? 0.03 : 0.05),
      T(l, 0, 0),
      T(l + (1 - l) * 0.36 * hi, 13, grey ? 0.02 : -0.02),
      T(l + (1 - l) * 0.66 * hi, 24, grey ? 0.01 : -0.1),
    ];
    const OL = T(Math.max(0.07, Math.min(0.19, l * 0.26)), -42, grey ? 0.14 : 0.22);
    out = { R, OL, LIT: P.mix(OL, R[1], 0.55), RIM: P.mix(R[3], o.rim || '#8ec0ff', 0.5) };
    RC.set(key, out);
    if (RC.size > 600) RC.delete(RC.keys().next().value);
    return out;
  }
  // a material from a ramp (and its recipe)
  const mk = (rp, o) => Object.assign({ R: rp.R, OL: rp.OL, LIT: rp.LIT, RIM: rp.RIM }, o || {});
  // a material from fixed tones (glow, ink): six tones and an outline
  const fixed = (R, OL, o) => Object.assign({ R: R.length === 6 ? R : R.concat([R[R.length - 1]]), OL, LIT: OL, RIM: R[Math.min(4, R.length - 1)] }, o || {});

  // ---- lighting recipes per material ------------------------------------------------------------------------
  // A surface's normal bent toward a tangent (a lock of hair, a fold, a crease) lights one flank of each
  // form and shades the other: clusters with a lit ridge and a shadow valley, following the form.
  const bent = (n, t, a) => { const q = norm(add(n, mul(t, a))); return [dot(q, LIGHT), dot(q, TOWARD)]; };
  const frac = (x) => x - Math.floor(x);
  // hair on the head: locks hang from the crown (angle bands round the head's vertical axis), each lit on
  // its left flank; a dark parting between locks below the crown; a broken highlight band (one dash per
  // lock) where the head turns to the light
  const HAIR_TH = [0.9, 0.32, 0.12, -0.45];
  function hairCapLev(N, band) {
    return (info, l0, f0) => {
      if (!info.l) return levelOf(l0, f0, HAIR_TH); // (a capsule or loft drawn in the cap's material)
      const L = info.l, M = info.M;
      const a = Math.atan2(L[0], L[2]), u = frac((a / (2 * Math.PI)) * N + 0.37);
      const crown = clamp01((0.86 - L[1]) / 0.34);
      const t = norm(mv(M, [Math.cos(a), 0, -Math.sin(a)]));
      const face = clamp01((f0 - 0.12) / 0.3);                         // (no lock detail at the grazing silhouette)
      const [l, f] = bent(info.n, t, (u - 0.5) * 1.0 * crown * face);
      let v = levelOf(l, f, HAIR_TH);
      if (v === 4 && (u < 0.3 || u > 0.72)) v = 3;                   // a lock's light is in its middle
      if (u < 0.1 && crown > 0.6 && L[1] < 0.3 && L[1] > -0.5 && face > 0.6) v -= 1;
      const k = Math.floor((a / (2 * Math.PI)) * N + 0.37);
      const b0 = band[0] + 0.03 * Math.sin(k * 2.3), b1 = band[1] + 0.03 * Math.cos(k * 1.7);
      if (L[1] > b0 && L[1] < b1 && u > 0.36 && u < 0.6 && l0 > 0.45) v = l > 0.7 && L[1] > (b0 + b1) / 2 ? 5 : Math.max(v, 4);
      return v;
    };
  }
  // hair falling in a tail, braid or long fall: strands along it, lit on the left flank, a highlight dash
  // high on each strand
  function strandLev(N, hiAt, axisOf) {
    return (info) => {
      const ax = axisOf(info);
      const a = info.a, u = frac((a / (2 * Math.PI)) * N + 0.2);
      const t = norm(cross(ax, info.n));
      const face = clamp01((dot(info.n, TOWARD) - 0.1) / 0.3);
      const [l, f] = bent(info.n, t, (u - 0.5) * 0.9 * face);
      let v = levelOf(l, f, HAIR_TH);
      if (u < 0.14 && face > 0.6) v -= 1;
      const along = info.u != null ? info.u : 1 - info.h;
      if (along > hiAt[0] && along < hiAt[1] && u > 0.32 && u < 0.62 && dot(info.n, LIGHT) > 0.4) v = l > 0.66 ? 5 : Math.max(v, 4);
      return v;
    };
  }
  // cloth hanging from the waist: folds round it (deeper toward the hem, gathered under the belt), each
  // with a lit ridge on its left flank and a shadow valley; a crisp valley line low on the skirt; a hem band
  const CLOTH_TH = [0.72, 0.3, 0.1, -0.5];
  function foldLev(N, o) {
    o = o || {};
    return (info) => {
      const h = info.h, a = info.a;
      const u = frac((a / (2 * Math.PI)) * N + (o.off || 0.31));
      const amp = 0.18 + 0.95 * Math.pow(1 - clamp01(h), 0.7);
      const t = norm(sub(mul(info.ex, Math.cos(a)), mul(info.ez, Math.sin(a))));
      const [l, f] = bent(info.n, t, Math.sin(u * 2 * Math.PI) * amp);
      let v = levelOf(l, f, CLOTH_TH);
      if (h < 0.55 && u > 0.7 && u < 0.79) v -= 1;                 // the valley's crease
      if (h > 0.86) { const g = frac((a / (2 * Math.PI)) * N * 2 + 0.1); if (g < 0.22) v -= 1; } // gathered under the belt
      if (h < 0.05) v -= 1;                                        // the hem turned up
      if (o.vent && Math.abs(a) > Math.PI - 0.1 && h < 0.5) v = 0;  // a coat's back vent
      return v;
    };
  }
  // a sleeve: creases ringing it round the elbow, lit on top
  function sleeveLev(info) {
    if (!info.ax) return levelOf(dot(info.n, LIGHT), dot(info.n, TOWARD), CLOTH_TH);
    const [l, f] = bent(info.n, info.ax, Math.sin(info.u * Math.PI * 5) * 0.42);
    return levelOf(l, f, CLOTH_TH);
  }
  // metal: hard bands of value and a near-white streak (no soft gradient)
  const metalLev = (info, l, f) => (l > 0.62 ? 5 : l > 0.3 ? 4 : l > -0.1 ? 2 : f < 0.3 ? 0 : 1);
  // glass: a dark rim, the body, one bright glint
  const glassLev = (info, l, f) => (f < 0.3 ? 1 : l > 0.72 ? 5 : l > 0.3 ? 3 : 2);

  // ---- palette ---------------------------------------------------------------------------------------
  const INK = '#2a1e26';
  const pcache = new Map();
  function palette(look) {
    const k = JSON.stringify([SP.colorsOf(look), look.wrapCol, look.hoodCol, look.outlineCol]);
    let p = pcache.get(k);
    if (p) return p;
    const base = SP._art.palette(look);
    const col = SP.colorsOf(look);
    const hc = col.hair;
    const [cm, cs, ca] = col.cloth;
    p = Object.assign({}, base, {
      // skin: shadows toward crimson, outline a dark red-brown
      skin6: hramp(col.skin[0], { cool: 352, warm: 42, hs: 0.72, ds: 0, ssh: 0.6, lo: 0.55, rim: '#b8d0ff' }),
      // hair: the lock colour between its mid and light, saturated; shadows cool, the band warm
      // (very dark hair takes a cool sheen)
      hair6: P.lum(hc[1]) < 0.2 ? hramp(P.mix(hc[1], hc[2] || hc[1], 0.3), { sat: 1.1, warm: 225, hi: 0.85 }) : hramp(P.mix(hc[1], hc[2] || hc[1], 0.2), { sat: P.lum(hc[1]) > 0.55 ? 0.98 : 1.12, hs: 1.15 }),
      cloth6: hramp(cm, { sat: 1.22 }),
      acc6: hramp(ca, { sat: 1.15 }),
      pants6: hramp(col.pants, { sat: 1.2 }),
      boots6: hramp(P.lum(col.boots) < 0.2 ? P.mix(col.boots, '#6a4a32', 0.35) : col.boots, { sat: 1.1, warm: 40 }),
      wrap6: hramp(look.wrapCol || ca, { sat: 1.15 }),
      stub6: hramp(P.mix(hc[1], col.skin[0], 0.4), { hs: 0.8 }),
    });
    pcache.set(k, p);
    if (pcache.size > 100) pcache.delete(pcache.keys().next().value);
    return p;
  }

  // ---- materials ---------------------------------------------------------------------------------------
  function mats(look, p) {
    const tieC = look.tieCol || p.ac[1];
    const skinTH = [0.8, 0.28, 0.06, -0.6];
    const M = {
      skin: mk(p.skin6, { th: skinTH, kind: 'skin' }),
      // the face (in rear view the cheek and jaw): a shadow under the jaw line, a lit cheekbone
      face: mk(p.skin6, {
        kind: 'skin', lev: (info, l, f) => {
          let v = levelOf(l, f, skinTH);
          const L = info.l;
          if (L[2] > 0.15 && L[1] < -0.38) v -= 1;
          if (L[2] > 0.25 && L[1] > -0.25 && L[1] < 0.05 && L[0] > 0.3 && l > -0.1) v += 1;
          return v;
        },
      }),
      hand: mk(p.skin6, { th: [0.62, 0.2, -0.3, -0.7], min: 2, kind: 'skin' }),
      ear: mk(p.skin6, { th: [0.8, 0.4, -0.1, -0.5], min: 1, max: 3, kind: 'skin' }),
      lash: fixed([p.eye, p.eye, p.eye, p.iris, p.iris], p.eye, { max: 1, flag: 1 | 4 }),
      blush: fixed([P.mix(p.skin6.R[1], '#d05a6a', 0.4), P.mix(p.skin6.R[2], '#e06a72', 0.4), P.mix(p.skin6.R[3], '#e8707a', 0.38), P.mix(p.skin6.R[3], '#e8807a', 0.34), P.mix(p.skin6.R[4], '#e8807a', 0.3)], p.skin6.OL, { flag: 1 | 4, kind: 'skin' }),
      cloth: mk(p.cloth6, { lev: sleeveLev, kind: 'cloth' }),
      // the back of the garment: a centre seam, the side seams, the yoke across the shoulders
      torso: mk(p.cloth6, {
        kind: 'cloth', th: CLOTH_TH, pat: (info, v) => {
          const a = Math.abs(info.a);
          if (a > Math.PI - 0.09 && info.h < 0.62) return -1;              // the centre-back seam
          return 0;
        },
      }),
      skirt: mk(p.cloth6, { kind: 'cloth', lev: foldLev(look.shape === 'robe' ? 9 : 7, { vent: look.shape === 'coat' }) }),
      trim: mk(p.acc6, { th: [0.6, 0.2, -0.2, -0.6], min: 1, kind: 'cloth' }),
      cuff: mk(p.acc6, { th: [0.6, 0.2, -0.2, -0.6], min: 1, max: 4, kind: 'cloth' }),
      collar: mk(p.acc6, { th: [0.6, 0.2, -0.2, -0.6], min: 1, kind: 'cloth' }),
      // the belt / sash: a band with a lit upper edge and a dark lower edge
      accent: mk(p.acc6, { th: [0.6, 0.2, -0.2, -0.6], min: 1, kind: 'cloth', pat: (info) => (info.h != null ? (info.h > 0.78 ? 1 : info.h < 0.2 ? -1 : 0) : 0) }),
      accentDk: mk(p.acc6, { max: 2, kind: 'cloth' }),
      tie: mk(hramp(tieC, { sat: 1.15 }), { min: 1 }),
      pants: mk(p.pants6, { kind: 'cloth', lev: sleeveLev }),
      // boots: leather; a dark sole, a lit toe cap, a turned-down top
      boots: mk(p.boots6, {
        kind: 'leather', th: [0.7, 0.35, -0.1, -0.5], top: 5, pat: (info, v, l) => {
          if (info.l) { if (info.l[1] < -0.5) return -3; if (info.l[2] > 0.45 && info.l[1] > -0.2 && l > 0.3) return 1; return 0; }
          if (info.u != null) return info.u < 0.12 ? 1 : info.u < 0.22 ? -1 : 0;
          return 0;
        },
      }),
      // (spiky hair: the spikes carry the light; the cap under them stays plain)
      hair: mk(p.hair6, { kind: 'hair', top: 5, lev: hairCapLev(7, look.hair === 'spiky' ? [-2, -2] : [0.14, 0.42]) }),
      hairTail: mk(p.hair6, { kind: 'hair', top: 5, lev: strandLev(4, [0.08, 0.3], (i) => i.ax) }),
      hairTuft: mk(p.hair6, { kind: 'hair', top: 5, lev: strandLev(2, [-1, -1], (i) => i.ax) }),
      hairStrand: mk(p.hair6, { kind: 'hair', top: 5, lev: strandLev(4, [-1, -1], (i) => i.ax) }),
      // a spike of hair: lit on its upper-left flank toward the tip, its underside in shadow
      hairSpike: mk(p.hair6, { kind: 'hair', top: 5, th: [0.94, 0.36, 0.1, -0.45], pat: (info, v, l) => (info.u < 0.3 && l < 0.2 ? -1 : 0) }),
      hairV: mk(p.hair6, { kind: 'hair', top: 5, lev: strandLev(8, [0.1, 0.22], (i) => i.ey) }),
      hairCurl: mk(p.hair6, { kind: 'hair', top: 5, th: [0.9, 0.3, 0.05, -0.5], pat: (info, v, l) => (l > 0.82 && info.l && info.l[0] < -0.2 ? 1 : 0) }),
      hairBun: mk(p.hair6, { kind: 'hair', top: 5, lev: hairCapLev(5, [0.2, 0.46]) }),
      hairBraid: mk(p.hair6, { kind: 'hair', top: 5, th: [0.55, 0.15, -0.2, -0.5], pat: (info, v, l) => (info.l && info.l[1] < -0.4 ? -1 : l > 0.72 ? 1 : 0) }),
      wrap: mk(p.wrap6, { kind: 'cloth', pat: (info) => { const u = ((info.h != null ? info.h * 5 : (info.l ? info.l[1] * 3 : 0)) + 10) % 1; return u < 0.2 ? -1 : 0; } }),
      stubble: mk(p.stub6, { max: 3 }),
      // (whites shade toward a cool grey, not through red)
      ivory: mk(hramp('#ece4d4', { hs: 0.4, ssh: 0.35, ds: 0 }), { kind: 'cloth' }),
      leather: mk(hramp('#8a6a3a', { sat: 1.1, warm: 40 }), { kind: 'leather' }),
      gold: mk(hramp('#e0b850', { sat: 1.1, warm: 58 }), { min: 1, top: 5, lev: metalLev, kind: 'metal' }),
      paper: mk(hramp('#f0e6cc', { hs: 0.4, ssh: 0.4, ds: 0 }), { min: 2, kind: 'paper' }),
      ink: fixed([INK, INK, '#3a2e36', '#4a3e46', '#5a4e56'], '#140e18', { max: 2 }),
      glow: fixed(['#c87830', '#e8a040', '#ffd27a', '#fff0b8', '#fffae0', '#ffffff'], '#6a3a1a', { min: 2, top: 5, flag: 4 }),
      // the lamp flared: the glass runs lighter, its darkest step the old mid
      glowHi: fixed(['#e8a040', '#ffd27a', '#fff0b8', '#fffae0', '#ffffff', '#ffffff'], '#8a4a1a', { min: 2, top: 5, flag: 4 }),
      // Mio's vial: green glass (as the bottles at her hip), a dark rim and one glint
      glass: mk(hramp('#5aa898', { sat: 1.1 }), { lev: glassLev, top: 5, kind: 'glass' }),
      iron: mk(hramp('#4a4450', { sat: 0.8 }), { max: 4, top: 5, lev: metalLev, kind: 'metal' }),
      wood: mk(hramp('#7a5530', { sat: 1.1, warm: 40 }), { kind: 'wood' }),
    };
    if (look.outlineCol) for (const q in M) { M[q] = Object.assign({}, M[q], { OL: look.outlineCol }); }
    return M;
  }

  // ---- rig ----------------------------------------------------------------------------------------------
  // Two-bone IK: from root a toward target t with lengths l1, l2, bending toward pole. Returns [mid, end].
  function ik(a, t, l1, l2, pole) {
    let d = sub(t, a), dl = len(d);
    const maxl = l1 + l2 - 0.01;
    if (dl > maxl) { d = mul(d, maxl / dl); dl = maxl; }
    const dn = norm(d);
    const x = (l1 * l1 - l2 * l2 + dl * dl) / (2 * dl);
    const h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
    let pv = sub(pole, mul(dn, dot(pole, dn)));
    pv = len(pv) < 1e-6 ? norm(cross(dn, [1, 0, 0])) : norm(pv);
    const mid = add(add(a, mul(dn, x)), mul(pv, h));
    return [mid, add(a, d)];
  }
  // Proportions (local units = art px at scale 1).
  function bodyOf(look) {
    const child = look.size === 'child', old = look.age === 'old';
    const k = child ? 0.74 : 1;
    return {
      child, old, k,
      hipW: 4.4 * (child ? 0.85 : 1), thigh: 13 * k, shin: 12.6 * k, ankle: 3.4 * k,
      pelvisY: 29.4 * k, waist: 4.4 * k, chest: 15 * k, neck: 3.2,
      shW: 9.1 * (child ? 0.82 : 1), upper: 10.8 * k, fore: 9.8 * k,
      // a little less head than on the road: the arms and what they hold must read past it
      headR: [10.6, 11.6, 10.8].map((v) => v * (child ? 0.94 : 0.9)),
      girth: child ? 0.86 : 1,
    };
  }

  // A pose is a set of numbers; poseAt() fills them for (pose, gesture, k, t, who).
  function restPose() {
    return {
      pelvis: [0, 0, 0], pelvisYaw: 0, pelvisRoll: 0, // offsets from rest (local)
      spineYaw: 0, spinePitch: 3, spineRoll: 0,     // degrees
      headYaw: 14, headPitch: 0, headRoll: 0,
      footR: [5.5, 0, 3.6], footL: [-5.2, 0, -3], footRLift: 0, footLLift: 0, footRYaw: 18, footLYaw: 4,
      handR: [10.6, 25.5, 2.5], handL: [-10.4, 25.5, 1.2],  // hand targets in pelvis-local coordinates
      elbowR: [1, -0.3, -1], elbowL: [-1, -0.3, -1],
      hairLag: 0, hairSway: 0, clothSway: 0,
      prop: {},
    };
  }

  // ---- assembly: a pose and a look -> draw calls in world space ---------------------------------------
  const GRP = { body: 1, armR: 2, armL: 3, legR: 4, legL: 5, head: 6, hair: 7, tail: 8, acc: 9, prop: 10, hand: 11, cape: 12, skirt: 1, ear: 13 };
  function assemble(look, ps) {
    const B = bodyOf(look), p = palette(look), Mt = mats(look, p);
    const W = (v) => mv(BODY, v), WM = (M) => mm(BODY, M);
    const calls = [];
    const g = B.girth;
    const pel = add([0, B.pelvisY, 0], ps.pelvis);
    const Mp = mm(rotY(ps.pelvisYaw * DEG), rotZ(ps.pelvisRoll * DEG));
    const Ms = mm(Mp, mm(rotY(ps.spineYaw * DEG), mm(rotX((ps.spinePitch + (B.old ? 7 : 0)) * DEG), rotZ(ps.spineRoll * DEG))));
    const Mh = mm(Ms, mm(rotY(ps.headYaw * DEG), mm(rotX((ps.headPitch + (B.old ? 4 : 0)) * DEG), rotZ(ps.headRoll * DEG))));
    const waist = add(pel, mv(Mp, [0, B.waist, 0]));
    const neckB = add(waist, mv(Ms, [0, B.chest, 0]));
    const shR = add(waist, mv(Ms, [B.shW, B.chest - 2.6, -0.5])), shL = add(waist, mv(Ms, [-B.shW, B.chest - 2.6, -0.5]));
    const neckT = add(neckB, mv(Ms, [0, B.neck, 0.6]));
    const headC = add(neckT, mv(Mh, [0, B.headR[1] - 2.6, 0.9]));
    const hipR = add(pel, mv(Mp, [B.hipW, -0.6, 0])), hipL = add(pel, mv(Mp, [-B.hipW, -0.6, 0]));
    const ankR = [ps.footR[0], B.ankle + ps.footRLift, ps.footR[2]], ankL = [ps.footL[0], B.ankle + ps.footLLift, ps.footL[2]];
    const [kneeR] = ik(hipR, ankR, B.thigh, B.shin, mv(Mp, [0.3, 0, 1]));
    const [kneeL] = ik(hipL, ankL, B.thigh, B.shin, mv(Mp, [-0.15, 0, 1]));
    const hs = mul(ps.pelvis, 0.8);
    const [elbR, wrR] = ik(shR, add(ps.handR, hs), B.upper, B.fore, mv(Ms, ps.elbowR));
    const [elbL, wrL] = ik(shL, add(ps.handL, hs), B.upper, B.fore, mv(Ms, ps.elbowL));
    const handR = add(wrR, mul(norm(sub(wrR, elbR)), 1.5)), handL = add(wrL, mul(norm(sub(wrL, elbL)), 1.5));
    const J = { pel, waist, neckB, neckT, headC, shR, shL, hipR, hipL, kneeR, kneeL, ankR, ankL, elbR, elbL, wrR, wrL, handR, handL, Mp, Ms, Mh, B };
    const S = (c, rad, mat, grp, keep, M) => calls.push((r) => sphere(r, W(c), rad, mat, grp, keep, M ? WM(M) : null));
    const E = (c, M, rad, mat, grp, keep) => calls.push((r) => ellipsoid(r, { c: W(c), M: WM(M), rad, mat, grp, keep }));
    const C = (a, b, ra, rb, mat, grp, o) => calls.push((r) => capsule(r, W(a), W(b), ra, rb, mat, grp, o));
    const Lf = (a, b, M, prof, mat, grp, keep) => calls.push((r) => loft(r, { a: W(a), b: W(b), M: WM(M), prof, mat, grp, keep }));
    const Bx = (c, M, hsz, mat, grp) => calls.push((r) => box(r, { c: W(c), M: WM(M), hs: hsz, mat, grp }));
    const K = { S, E, C, Lf, Bx, W, J, Mt, p, look, ps };

    // legs: trousers to the boot, a boot shaft and a foot pointing where the foot is turned
    const leg = (hip, knee, ank, yaw, grp) => {
      const robe = look.shape === 'robe';
      C(hip, knee, 3.7 * g, 3.1 * g, Mt.pants, grp);
      C(knee, ank, 3.1 * g, 2.6 * g, Mt.pants, grp);
      const bootTop = lerp(ank, knee, robe ? 0.25 : 0.42);
      C(bootTop, ank, 3.2 * g, 2.9 * g, Mt.boots, grp);
      const Mf = mm(Mp, rotY(yaw * DEG));
      E(add(ank, mv(Mf, [0, -1.6, 2.2])), Mf, [2.8 * g, 2.1, 4.4 * g], Mt.boots, grp);
    };
    leg(hipL, kneeL, ankL, ps.footLYaw, GRP.legL);
    leg(hipR, kneeR, ankR, ps.footRYaw, GRP.legR);
    // hips (trousers) and torso
    E(add(pel, mv(Mp, [0, 1.6, 0])), Mp, [6.8 * g, 4.8, 5.2 * g], Mt.pants, GRP.body);
    Lf(add(waist, mv(Ms, [0, -2.2, 0])), neckB, Ms, [[0, 7.3 * g, 5.5 * g], [0.3, 7.2 * g, 5.4 * g], [0.58, 8.2 * g, 5.9 * g], [0.8, 8.7 * g, 5.7 * g], [0.93, 8 * g, 4.9 * g], [1, 5 * g, 3.6 * g]], Mt.torso, GRP.body);
    // the skirt of the garment (tunic, coat, robe, dress, apron), hanging from the waist
    garment(K, look, B, p, Mt, pel, waist, Mp, Ms);
    // arms: a round shoulder, sleeve, cuff and hand
    const arm = (sh, elb, wr, side, grp) => {
      S(sh, 3.4 * g, Mt.cloth, grp);
      C(sh, elb, 3.2 * g, 2.8 * g, Mt.cloth, grp);
      C(elb, wr, 2.8 * g, 2.4 * g, Mt.cloth, grp);
      if (look.shape === 'robe') C(lerp(elb, wr, 0.45), wr, 3.1, 3.6, Mt.cloth, grp);
      // the cuff: a band turned back at the wrist, a lighter edge on its lip
      S(lerp(wr, elb, 0.12), 2.5 * g, Mt.cuff, grp);
      C(lerp(wr, elb, 0.2), lerp(wr, elb, 0.05), 2.65 * g, 2.55 * g, Mt.cuff, grp);
      // a button on the cuff, on the side turned to us: a deliberate glint
      { const ax = norm(sub(wr, elb)), tv = mtv(BODY, TOWARD), o = norm(sub(tv, mul(ax, dot(tv, ax)))); S(add(lerp(wr, elb, 0.13), mul(o, 2.6 * g)), 0.6, Mt.gold, GRP.acc); }
      // (a palm opened against what comes: the old prop.palm is the 'flat' shape)
      const shape = (side > 0 ? ps.handShapeR : ps.handShapeL) || (side > 0 && ps.prop && ps.prop.palm > 0.5 ? 'flat' : 'fist');
      const pn = (side > 0 ? ps.palmR : ps.palmL) || [-side, -0.2, 0.15];
      handModel(K, wr, elb, shape, pn, side, GRP.hand);
    };
    arm(shL, elbL, wrL, -1, GRP.armL);
    arm(shR, elbR, wrR, 1, GRP.armR);
    // collar, neck and head: skin, the ears, the tip of the nose in profile
    Lf(add(neckB, mv(Ms, [0, -1.2, -0.2])), add(neckB, mv(Ms, [0, 1.3, 0.1])), Ms, [[0, 5.2 * g, 4.4 * g], [1, 3.9 * g, 3.4 * g]], look.shape === 'coat' ? Mt.cloth : Mt.collar, GRP.body);
    C(neckB, neckT, 2.7 * g, 2.5 * g, Mt.skin, GRP.head);
    E(headC, Mh, B.headR, Mt.face, GRP.head);
    const hr = B.headR;
    E(add(headC, mv(Mh, [hr[0] * 0.98, -hr[1] * 0.14, -hr[2] * 0.1])), Mh, [1.8, 3.1, 2.2], Mt.ear, GRP.ear);
    E(add(headC, mv(Mh, [-hr[0] * 0.98, -hr[1] * 0.14, -hr[2] * 0.1])), Mh, [1.8, 3.1, 2.2], Mt.ear, GRP.ear);
    E(add(headC, mv(Mh, [0.4, -hr[1] * 0.22, hr[2] * 0.97])), Mh, [1.3, 1.6, 1.6], Mt.skin, GRP.head);
    // the lashes of the near eye, showing at the cheek's edge when the head turns toward the foe,
    // and a touch of colour on the cheek
    E(add(headC, mv(Mh, [hr[0] * 0.56, -hr[1] * 0.02, hr[2] * 0.84])), Mh, [1.2, 0.7, 0.9], Mt.lash, GRP.ear);
    // turned toward us (a twirl's front view) the far eye shows too (only then: the usual view is unchanged)
    if (ps.turn && Math.cos((ps.turn + 36) * DEG) < 0.2) E(add(headC, mv(Mh, [-hr[0] * 0.56, -hr[1] * 0.02, hr[2] * 0.84])), Mh, [1.2, 0.7, 0.9], Mt.lash, GRP.ear);
    E(add(headC, mv(Mh, [hr[0] * 0.72, -hr[1] * 0.3, hr[2] * 0.62])), Mh, [1.4, 0.8, 1.2], Mt.blush, GRP.head, (l) => true);
    hair(K);
    return { calls, J, K };
  }

  // ---- hands ----------------------------------------------------------------------------------------------
  // A hand at the wrist wr, the forearm coming from elb: a palm, the fingers (one mass, or separate where
  // they read: a pointing index, spread fingers) and a thumb. pn: which way the palm faces (body-local);
  // side +1 right, -1 left (the thumb is on the side it belongs). Units: a palm about 3.8 wide, the
  // fingers reaching 4–5.6 past the wrist — at 1.14 px/unit a hand of 5–7 px, enough for a fist, an
  // open palm, a pointing finger or a pinch to read apart.
  const HAND = 1.38;
  function handModel(K, wr, elb, shape, pn, side, grp) {
    const { Mt } = K;
    const d = norm(sub(wr, elb));
    let z = sub(pn, mul(d, dot(pn, d)));
    z = len(z) < 1e-3 ? norm(cross(d, [0, 1, 0])) : norm(z);
    const x = mul(cross(z, d), side); // toward the thumb
    const Mh = [x, d, cross(x, d)];
    // u: toward the thumb, v: along the fingers, w: out of the palm. Hands are drawn a little larger
    // than life (HAND), as the head is: at this size a gesture is read from the hand's shape.
    const at = (u, v, w) => add(wr, add(add(mul(x, u * HAND), mul(d, v * HAND)), mul(z, w * HAND)));
    const hm = Mt.hand;
    const E = (c, M0, r, m, g) => K.E(c, M0, r.map((q) => q * HAND), m, g);
    const C = (a, b, ra, rb, m, g) => K.C(a, b, ra * HAND, rb * HAND, m, g);
    switch (shape) {
      case 'open': case 'flat':
        E(at(0, 1.6, 0), Mh, [1.85, 1.7, 1.05], hm, grp);
        E(at(-0.2, 3.7, 0.1), Mh, [1.7, 1.55, 0.72], hm, grp);
        C(at(1.2, 1.0, 0.3), at(2.5, 2.6, 0.6), 0.75, 0.6, hm, grp);
        break;
      case 'spread':
        E(at(0, 1.6, 0), Mh, [1.85, 1.7, 1.05], hm, grp);
        for (const [u, a] of [[-1.3, -0.4], [-0.4, -0.12], [0.5, 0.16]]) C(at(u, 2.8, 0), at(u + Math.sin(a) * 2.7, 2.8 + Math.cos(a) * 2.7, 0.15), 0.64, 0.56, hm, grp);
        C(at(1.3, 1.0, 0.3), at(2.9, 2.2, 0.6), 0.7, 0.6, hm, grp);
        break;
      case 'point':
        E(at(0, 1.5, -0.1), Mh, [1.85, 1.8, 1.3], hm, grp);
        E(at(-0.4, 2.6, 0.5), Mh, [1.5, 0.95, 1.0], hm, grp);
        C(at(0.8, 2.6, 0.1), at(0.9, 5.8, 0.15), 0.68, 0.56, hm, grp);
        C(at(1.4, 1.3, 0.4), at(1.5, 2.7, 0.9), 0.66, 0.6, hm, grp);
        break;
      case 'pinch':
        E(at(0, 1.5, -0.1), Mh, [1.85, 1.8, 1.35], hm, grp);
        C(at(0.7, 2.4, 0.2), at(0.6, 3.7, 0.9), 0.64, 0.55, hm, grp);
        C(at(1.4, 1.4, 0.6), at(0.8, 3.4, 1.1), 0.64, 0.55, hm, grp);
        break;
      case 'cup':
        E(at(0, 1.5, 0), Mh, [1.9, 1.8, 1.3], hm, grp);
        C(at(-0.6, 2.8, 0.2), at(-0.2, 3.4, 1.6), 0.95, 0.75, hm, grp);
        C(at(1.4, 1.3, 0.5), at(1.3, 2.6, 1.4), 0.66, 0.6, hm, grp);
        break;
      case 'relaxed':
        E(at(0, 1.5, 0), Mh, [1.85, 1.75, 1.2], hm, grp);
        C(at(-0.2, 2.6, 0), at(-0.1, 3.9, 0.9), 1.15, 0.8, hm, grp);
        C(at(1.3, 1.2, 0.4), at(1.6, 2.5, 0.9), 0.66, 0.56, hm, grp);
        break;
      default: // a fist
        E(at(0, 1.5, 0), Mh, [1.95, 1.9, 1.5], hm, grp);
        E(at(-0.2, 2.5, 0.5), Mh, [1.7, 0.95, 1.1], hm, grp);
        C(at(1.5, 1.3, 0.6), at(0.5, 2.4, 1.3), 0.66, 0.6, hm, grp);
    }
    return { at, x, d, z };
  }

  // ---- garments -------------------------------------------------------------------------------------------
  function garment(K, look, B, p, Mt, pel, waist, Mp, Ms) {
    const g = B.girth, k = B.k, sh = ['tunic', 'apron', 'coat', 'robe', 'dress'].includes(look.shape) ? look.shape : 'tunic';
    const sway = K.ps.clothSway || 0, flare = Math.max(0, K.ps.clothFlare || 0);
    // (a turning skirt flares out and its hem lifts a little — Suzu's twirl; 0 otherwise)
    const hemY = { tunic: 19, apron: 19, coat: 10.5, robe: 2.4, dress: 12.5 }[sh] * (sh === 'robe' ? 1 : k) + flare * 1.6;
    const prof = {
      tunic: [[0, 9.4, 7.8], [0.5, 8.7, 6.9], [1, 7.6, 6.0]],
      apron: [[0, 9.4, 7.8], [0.5, 8.7, 6.9], [1, 7.6, 6.0]],
      coat: [[0, 11.2, 9.6], [0.55, 9.6, 7.8], [1, 7.7, 6.1]],
      robe: [[0, 10.8, 9.4], [0.18, 9.8, 8.4], [0.7, 8.6, 7.0], [1, 7.7, 6.1]],
      dress: [[0, 12.4, 10.6], [0.5, 10.2, 8.4], [1, 7.6, 6.0]],
    }[sh].map(([h, rx, rz]) => [h, rx * g * (1 + flare * 0.3 * (1 - h)), rz * g * (1 + flare * 0.3 * (1 - h))]);
    const top = add(waist, mv(Ms, [0, 0.8, 0]));
    const hem = [pel[0] + sway, hemY, pel[2] - sway * 0.4];
    K.Lf(hem, top, Mp, prof, Mt.skirt, GRP.skirt);
    if (sh === 'robe' || sh === 'dress') { const h1 = lerp(hem, top, 0.05); K.Lf(add(hem, [0, -0.2, 0]), h1, Mp, [[0, prof[0][1] + 0.35, prof[0][2] + 0.35], [1, prof[0][1] + 0.2, prof[0][2] + 0.2]], Mt.trim, GRP.skirt); }
    // belt / sash / obi
    const bh = sh === 'robe' ? 2.6 : 1.5;
    K.Lf(add(waist, mv(Ms, [0, -bh, 0])), add(waist, mv(Ms, [0, bh * 0.6, 0])), Ms, [[0, 8.0 * g, 6.3 * g], [1, 7.7 * g, 6.0 * g]], Mt.accent, GRP.skirt);
    // the belt's buckle at the near hip (a tunic's or coat's belt; a robe's or dress's sash is tied behind)
    if (sh !== 'robe' && sh !== 'dress') {
      K.Bx(add(waist, mv(Ms, [7.7 * g, -0.4, -1.6 * g])), mm(Ms, rotY(80 * DEG)), [1.2, 1.05, 0.5], Mt.gold, GRP.acc);
      // the belt's free end, tucked through and hanging over the hip (it follows the cloth's sway)
      K.C(add(waist, mv(Ms, [7.9 * g, -0.9, -2.8 * g])), add(waist, mv(Ms, [8.3 * g + sway * 0.4, -4.6, -3.4 * g])), 0.75, 0.65, Mt.accent, GRP.acc);
    }
    const back = (dx, dy, dz) => add(waist, mv(Ms, [dx, dy, -6.3 * g + dz]));
    // a bow: each loop folds into the knot (its inner end in shadow, its outer end lit), the knot a step
    // darker, the tails hanging from it
    const bow = (mat, tails, sc) => {
      sc = sc || 1;
      const loop = (sd) => Object.assign({}, mat, { pat: (info, v) => (info.l ? (info.l[0] * -sd > 0.35 ? -1 : info.l[0] * -sd < -0.55 && v >= 3 ? 1 : 0) : 0) });
      // the loops flattened and tipped up and outward from the knot
      for (const sd of [-1, 1]) K.E(back(sd * 2.5 * sc, 0.7, -0.6), mm(Ms, rotZ(-sd * 22 * DEG)), [2.7 * sc, 1.55 * sc, 1.0], loop(sd), GRP.acc);
      K.E(back(0, 0.3, -1.1), Ms, [1.1, 1.3, 0.9], Object.assign({}, mat, { pat: () => -1 }), GRP.acc);
      if (tails) {
        // two short tails, an inverted V
        K.C(back(-0.5, -0.6, -0.9), back(-2.3 * sc + sway * 0.3, -4.4 * sc, -1.2), 0.8, 0.55, mat, GRP.acc);
        K.C(back(0.5, -0.6, -0.9), back(2.0 * sc + sway * 0.3, -3.8 * sc, -1.2), 0.8, 0.55, mat, GRP.acc);
      }
    };
    if (sh === 'robe') bow(Mt.accent, false);
    if (sh === 'dress') bow(Mt.accent, true);
    if (sh === 'apron') {
      // apron strings tied at the small of the back; the bib's straps cross the back
      bow(Mt.ivory, true, 0.78);
      const J = K.J, outward = (n) => dot(n, mv(BODY, mv(Ms, [0, 0, -1]))) > -0.3;
      K.C(add(J.shR, mv(Ms, [-2.2, 1.4, -2.2])), back(-5.4, 0.8, 1.4), 0.7, 0.7, Mt.ivory, GRP.acc, { keep: outward });
      K.C(add(J.shL, mv(Ms, [2.2, 1.4, -2.2])), back(5.4, 0.8, 1.4), 0.7, 0.7, Mt.ivory, GRP.acc, { keep: outward });
    }
  }

  // ---- hair ---------------------------------------------------------------------------------------------
  // In the head's frame (x its right, y up, z its forward); l is a point on the unit sphere of the cap.
  // A side ponytail, a braid, a flower or ribbon on the left of the head are on the far side here: they
  // show where they stand out past the head.
  function hair(K) {
    const { J, Mt, look, ps } = K;
    const Mh = J.Mh, hc = J.headC, hr = J.B.headR;
    const st = look.hair || 'short';
    const hs = hr[0] / 12.2; // the hair was drawn for a head 12.2 wide; it scales with the head
    const H = (v) => add(hc, mv(Mh, mul(v, hs)));
    const cap = (sc, keep, mat) => K.E(H([0, 0.9, -0.5]), Mh, [hr[0] * sc[0], hr[1] * sc[1], hr[2] * sc[2]], mat || Mt.hair, GRP.hair, keep);
    // the face stays clear below the fringe; ears show for short styles
    const face = (l) => !(l[2] > 0.28 && l[1] < 0.3 && Math.abs(l[0]) < 0.8);
    const ears = (l) => !(Math.abs(l[0]) > 0.72 && l[1] < -0.02 && l[1] > -0.62 && l[2] > -0.35);
    const lag = ps.hairLag || 0, sw = ps.hairSway || 0;
    // a tail: a chain of capsules through points given in the head frame (the lower points follow late)
    const tail = (pts, r0, r1, mat) => {
      const w = pts.map((q, i) => { const f = i / (pts.length - 1); return add(H(q), [sw * f * 1.2, -lag * f * 1.4, 0]); });
      // (one highlight dash, high on the tail where it turns to the light; the strands run on below it)
      for (let i = 0; i + 1 < w.length; i++) K.C(w[i], w[i + 1], hs * lerpN(r0, r1, i / (w.length - 1)), hs * lerpN(r0, r1, (i + 1) / (w.length - 1)), mat || (i === 1 ? Mt.hairTail : Mt.hairStrand), GRP.tail);
    };
    const tie = (q, rad) => K.S(H(q), rad || 1.6, Mt.tie, GRP.acc);
    // under a hat or cap, what would stand above the head is tucked under it (no spikes or bun through
    // the crown; curls round the sides only)
    const covered = (look.acc || []).some((a) => a === 'hat' || a === 'cap');
    if (st === 'bald') return;
    if (st === 'shaved') { cap([1.03, 1.02, 1.03], (l) => face(l) && ears(l) && l[1] > -0.5, Mt.stubble); return; }
    if (st === 'wrap') {
      cap([1.1, 1.1, 1.12], (l) => face(l) && l[1] > -0.55, Mt.wrap);
      K.S(H([-1.5, -2, -13.8]), 3, Mt.wrap, GRP.acc); K.S(H([2, -1.4, -13.6]), 2.6, Mt.wrap, GRP.acc);
      tail([[0, -4, -13.5], [-0.5, -10, -12.5], [-1, -15, -11]], 1.8, 1.4, Mt.wrap);
      return;
    }
    if (st === 'curly') {
      cap(covered ? [1.08, 1.04, 1.1] : [1.16, 1.12, 1.16], (l) => face(l) && l[1] > -0.55);
      for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, yy = (i % 3) * 3 - 3; if (covered && yy > 0) continue; K.S(H([Math.sin(a) * 13.4, 3 + yy - (covered ? 2 : 0), Math.cos(a) * 13.4 - 0.5]), 3.4, Mt.hairCurl, GRP.hair, (l) => true); }
      return;
    }
    const nape = { short: -0.46, spiky: -0.46, ponytail: -0.46, bun: -0.4, braid: -0.46, twintails: -0.46, bob: -0.75, long: -0.8, wavy: -0.8 }[st] || -0.46;
    const tight = st === 'bun' ? [1.05, 1.04, 1.07] : [1.1, 1.08, 1.12];
    const earsShow = st !== 'bob' && st !== 'long' && st !== 'wavy';
    // the nape's edge is the locks' tips: each lock hangs a little lower at its middle than at its parting
    const tipAt = (l) => { const u = frac((Math.atan2(l[0], l[2]) / (2 * Math.PI)) * 7 + 0.37); return 0.11 * (1 - Math.abs(u - 0.5) * 2); };
    cap(tight, (l) => face(l) && (!earsShow || ears(l)) && l[1] > nape - tipAt(l));
    // clumps of hair that stand out at the back and sides and end in points: the head's outline is
    // locks, not a ball (short and tied-back styles; under a hat they stay below its brim)
    if (['short', 'ponytail', 'braid', 'twintails'].includes(st)) {
      const R0 = hr[0] * tight[0] / hs, Rz = hr[2] * tight[2] / hs;
      const tufts = [[132, -0.4, 1.1], [160, -0.3, 1], [-170, -0.46, 1.15], [-136, -0.4, 1.05]];
      for (const [deg, y0, sc] of tufts) {
        const a = deg * DEG, sa = Math.sin(a), ca = Math.cos(a), yy = y0 * hr[1] / hs;
        const p0 = [sa * R0 * 0.86, yy + 2.2, ca * Rz * 0.86 - 0.5], p1 = [sa * (R0 + 0.9) + sw * 0.3, yy - 3.4 * sc - lag * 0.25, ca * (Rz + 0.9) - 0.5];
        K.C(H(p0), H(p1), 2.7 * hs, 0.55 * hs, Mt.hairTuft, GRP.hair);
      }
    }
    if (st === 'spiky') {
      // (pointing up, out and back, so that from behind they read in profile on the outline, not end-on)
      const sp = [[-6, 13, -3], [1, 14, -4], [8, 12, -2], [-12, 7, -3], [12, 6, -3], [-6, 10, -10], [6, 9, -10], [-13, 0, -6], [13, -1, -5]];
      for (const q of sp) { if (covered && q[1] > 6) continue; const d = norm(q); K.C(H(mul(d, 9.6)), H(mul(d, 19.5)), 4.4, 0.6, Mt.hairSpike, GRP.hair); }
    }
    if (st === 'bob') {
      // a blunt, chin-length bob: the sides and back fall straight to the jaw
      K.Lf(H([0, -12.5, -1.2]), H([0, 1, -0.5]), Mh, [[0, 13.3 * hs, 12.6 * hs], [0.6, 13.6 * hs, 13.1 * hs], [1, 13.2 * hs, 12.8 * hs]], Mt.hairV, GRP.hair, (lx, h, lz) => !(lz > 3.5 * hs && Math.abs(lx) < 11 * hs));
    }
    if (st === 'long' || st === 'wavy') {
      // the long fall of hair down the back, to below the shoulder blades
      // its top starts inside the head, so it grows out of the cap without a seam; wavy hair ripples
      const top = H([0, 3, -3.6]), bot = add(J.waist, mv(J.Ms, [lag * 0.2 + sw * 0.5, 7 - lag, -6.4]));
      const wv = st === 'wavy';
      const prof = [];
      for (let i = 0; i <= 10; i++) {
        const h = i / 10, rip = wv ? Math.sin(h * Math.PI * 4.5) * 0.8 : 0;
        prof.push([h, (h < 0.72 ? 7.6 + 4.2 * Math.sqrt(h / 0.72) : 11.8 - (h - 0.72) * 9) * hs * 1.02 + rip, (h < 0.72 ? 3.2 + 3.6 * (h / 0.72) : 6.8 + (h - 0.72) * 4) * hs]);
      }
      K.Lf(bot, top, J.Ms, prof, Mt.hairV, GRP.tail, (lx, h, lz) => lz < 1.4);
    }
    if (st === 'ponytail') {
      // tied high on the left, falling behind the left shoulder
      tie([-10.2, 6.2, -5.2], 2);
      tail([[-11.4, 5, -6], [-14.2, 0, -6.6], [-15.4, -7, -6.4], [-15.2, -14, -5.6], [-13.8, -20, -4.8], [-12.6, -24.5, -4.2]], 3.6, 1.3);
    }
    if (st === 'twintails') {
      for (const sx of [-1, 1]) {
        tie([sx * 10.4, 4.4, -5], 1.9);
        tail([[sx * 11.6, 3.2, -5.6], [sx * 13.8, -2, -6], [sx * 14.2, -9, -5.4], [sx * 13.4, -16, -4.6], [sx * 12.4, -20.5, -4]], 3.4, 1.3);
      }
    }
    if (st === 'bun' && covered) {
      // a low bun at the nape, under the hat's brim
      K.S(H([0, -1.5, -12.4]), 5.2, Mt.hairBun, GRP.tail);
      K.E(H([0, 2.2, -11.4]), rotX(-20 * DEG), [3.6, 1.2, 2.4], Mt.tie, GRP.acc);
    } else if (st === 'bun') {
      K.S(H([0, 11, -9.6]), 6.2, Mt.hairBun, GRP.tail);
      K.E(H([0, 6.9, -7.4]), rotX(-50 * DEG), [4.4, 1.3, 3.2], Mt.tie, GRP.acc);
    }
    if (st === 'braid') {
      // a single braid from behind the left ear, over the left shoulder
      const pts = [[-9.4, -6, -6], [-11, -11.5, -4.4], [-11.6, -16.5, -2], [-11.4, -21, 0.4], [-11, -25, 2.6]];
      const w = pts.map((q, i) => add(H(q), [sw * i * 0.25, -lag * i * 0.3, 0]));
      for (let i = 0; i + 1 < w.length; i++) for (let j = 0; j < 3; j++) { const t = j / 3, c = lerp(w[i], w[i + 1], t); K.S(c, 2.5 - i * 0.2, Mt.hairBraid, GRP.tail); }
      K.S(w[w.length - 1], 1.3, Mt.tie, GRP.acc);
    }
  }

  const COVER = mk(hramp('#9a4a3c', { sat: 1.1, warm: 40 }), { min: 1, kind: 'leather' });
  // ---- props held in battle ---------------------------------------------------------------------------------
  // A small bound book (the traveller's folio), a strip of paper, a brush. Held by the hand joints.
  function props(K) {
    const { J, Mt, ps, look } = K;
    const pr = ps.prop || {};
    const Ms = J.Ms;
    if (pr.book > 0.25) {
      // held in the left hand (the right, if the left carries a lantern); open 0 (shut) .. 1 (open flat)
      // (someone without a book of their own brings one out as the gesture begins)
      const open = clamp01(pr.bookOpen || 0), tilt = pr.bookTilt == null ? -50 : pr.bookTilt;
      const c = pr.bookR ? add(J.handR, mv(Ms, [-2.4, 1.2, 1])) : add(J.handL, mv(Ms, pr.bookAt || [-1.4, 1.2, 0.8]));
      const Mb = mm(Ms, mm(rotY((pr.bookYaw || 10) * DEG), rotX(tilt * DEG)));
      // (the folio: a red-brown leather cover, its page block cream)
      const cover = COVER;
      if (open < 0.08) {
        K.Bx(c, Mb, [3.4, 4.4, 1.2], cover, GRP.prop);
        K.Bx(add(c, mv(Mb, [0.3, 0, 0])), Mb, [3.1, 4.1, 0.8], Mt.paper, GRP.prop);
        // brass corners on the fore-edge and the clasp across it
        for (const sy of [-1, 1]) for (const sz of [-1, 1]) K.S(add(c, mv(Mb, [3.1, sy * 4.1, sz * 1.15])), 0.75, Mt.gold, GRP.prop);
        K.Bx(add(c, mv(Mb, [3.5, 0, 0])), Mb, [0.5, 0.9, 1.35], Mt.gold, GRP.prop);
      } else {
        const a = open * 70 * DEG; // each half turns out from the spine
        for (const sx of [-1, 1]) {
          const Mh2 = mm(Mb, rotY(sx * a));
          const cc = add(c, mv(Mh2, [sx * 3.2, 0, 0]));
          K.Bx(add(cc, mv(Mh2, [0, 0, -0.9])), Mh2, [3.3, 4.4, 0.4], cover, GRP.prop);
          K.Bx(cc, Mh2, [3.0, 4.1, 0.6], Mt.paper, GRP.prop);
        }
      }
    }
    if (pr.strip) {
      // a paper strip pinched in the right hand, pointing along the forearm
      const d = norm(sub(J.handR, J.elbR)), Ls = 3 + 6 * clamp01(pr.strip);
      K.C(add(J.handR, mul(d, 1)), add(J.handR, mul(d, Ls)), 1.2, 1.2, Mt.paper, GRP.prop);
      K.S(add(J.handR, mul(d, Ls * 0.6)), 0.8, Mt.ink, GRP.prop);
    }
    if (pr.vial > 0.5) {
      // Mio's vial, taken from the bottles at her hip (that one is then not at the hip): held in the
      // right hand, upright, tipping toward the one it is for as it pours (vialTilt, degrees); the cork
      // out once it is opened (cork 1)
      const tilt = (pr.vialTilt || 0) * DEG, hd = pr.vialL ? J.handL : J.handR;
      const ax = norm([Math.sin(tilt) * 0.5, Math.cos(tilt), Math.sin(tilt) * 0.85]);
      // (drawn a little larger than life, as the hands are)
      const q = (s) => add(hd, add(mul(ax, s * 1.3), [0.9, 0, 1.4]));
      K.C(q(-1.4), q(0.7), 1.95, 2, Mt.glass, GRP.prop);
      K.C(q(0.7), q(2.2), 1.9, 0.95, Mt.glass, GRP.prop);
      K.C(q(2.2), q(3.2), 0.82, 0.82, Mt.glass, GRP.prop);
      if (!(pr.cork > 0.5)) K.C(q(3.1), q(3.9), 0.95, 0.95, Mt.wood, GRP.prop);
      K.J.vial = { lip: q(3.4), mid: q(0.4), ax };
    }
    if (pr.brush) {
      const d = norm(sub(J.handR, J.elbR)), up = norm(add(d, [0, 0.9, 0]));
      K.C(add(J.handR, mul(up, -2.4)), add(J.handR, mul(up, 7.5)), 0.8, 0.7, Mt.wood, GRP.prop);
      K.C(add(J.handR, mul(up, 7.5)), add(J.handR, mul(up, 11)), 1.2, 0.4, Mt.ink, GRP.prop);
    }
  }

  // ---- accessories and keepsakes ----------------------------------------------------------------------------
  // Attached to the joints they belong to. One-sided things keep their side: the flower, ribbon, leaf
  // and quill on the left of the head (shown where they stand out past it), a lantern or cane in the
  // left hand, a basket in the right, the satchel's strap over the right shoulder to its bag on the left.
  // an accessory's own colour as a material (its ramp, outline and rim)
  const flat = (c, o) => mk(hramp(c, { sat: 1.12 }), o || {});
  function accessories(K) {
    const { J, Mt, look, ps } = K;
    const acc = look.acc || [];
    const Ms = J.Ms, Mh = J.Mh, Mp = J.Mp, hc = J.headC, hr = J.B.headR, g = J.B.girth, ch = J.B.chest;
    const H = (v) => add(hc, mv(Mh, v));
    const Sp = (v) => add(J.waist, mv(Ms, v));
    const Pl = (v) => add(J.pel, mv(Mp, v));
    const sway = ps.clothSway || 0, lag = ps.hairLag || 0, hsw = ps.hairSway || 0;
    const chain = (pts, r0, r1, mat, grp) => { for (let i = 0; i + 1 < pts.length; i++) K.C(pts[i], pts[i + 1], lerpN(r0, r1, i / (pts.length - 1)), lerpN(r0, r1, (i + 1) / (pts.length - 1)), mat, grp || GRP.acc); };
    const ring = (cen, rx, rz, y, n, rad, mat, M) => { for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; K.S(add(cen, mv(M, [Math.sin(a) * rx, y, Math.cos(a) * rz])), rad, mat, GRP.acc); } };
    const out = (l) => mul(l, 1.08); // just proud of the hair's surface
    // how far the hair stands out from the head (curls), for what sits round or over it
    const puff = look.hair === 'curly' ? 1.22 : 1;
    const blossom = (c0, R, heart) => {
      for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; K.S(add(c0, mv(Mh, [Math.sin(a) * 2.2, Math.cos(a) * 2.2, -0.6])), 1.8, R, GRP.acc); }
      K.S(add(c0, mv(Mh, [0, 0, -1])), 1.3, heart, GRP.acc);
    };
    const lantern = (top, own) => {
      // (the lamp a gesture raises flares: its glass runs lighter — ps.prop.flare; Ren's own lamp, the
      // object of his every action, is drawn a size up, as hands are)
      const lit = own && ps.prop && ps.prop.flare > 0.5 ? Mt.glowHi : Mt.glow, q = own ? 1.3 : 1;
      const at = (y) => add(top, [0, y * q, 0]);
      K.C(top, at(-2.2), 0.35 * q, 0.35 * q, Mt.iron, GRP.prop);
      K.Bx(at(-2.6), Ms, [2.2 * q, 0.6 * q, 2.2 * q], Mt.iron, GRP.prop);
      K.E(at(-5.4), Ms, [2.3 * q, 2.6 * q, 2.3 * q], lit, GRP.prop);
      K.Bx(at(-8.2), Ms, [2 * q, 0.5 * q, 2 * q], Mt.iron, GRP.prop);
      // Lantern Ward: the lamp's shutter turned to the creatures (its iron plate on the glass's far side), so
      // the light falls back over the pair
      if (own && ps.prop && ps.prop.lampShade > 0.5) K.Bx(add(at(-5.4), mv(Ms, [0.4 * q, 0, 2.1 * q])), mm(Ms, rotY(-20 * DEG)), [2.2 * q, 2.4 * q, 0.35 * q], Mt.iron, GRP.prop);
      if (own) K.J.lamp = at(-5.4);
    };
    for (const a of acc) {
      switch (a) {
        case 'scarf': {
          // a wrap of cloth round the neck (folds round it), a knot at the back on the left, and the tail
          // streaming over the shoulder blade, folded along its length, splitting into two ends
          const col = look.scarfCol || '#c8962e';
          const W = flat(col, { lev: foldLev(5, { off: 0.15 }) }), T = flat(col, { lev: strandLev(3, [-1, -1], (i) => i.ax) });
          const St = look.scarfStripe ? flat(look.scarfStripe, { lev: strandLev(3, [-1, -1], (i) => i.ax) }) : null;
          K.Lf(Sp([0, ch - 1.4, -0.3]), Sp([0, ch + 2.1, 0.2]), Ms, [[0, 5.7 * g, 5.1 * g], [0.5, 6.0 * g, 5.4 * g], [1, 5.0 * g, 4.5 * g]], W, GRP.acc);
          K.E(Sp([-2.6, ch + 0.2, -5.0 * g]), Ms, [2, 1.7, 1.3], Object.assign({}, W, { lev: null, pat: () => -1 }), GRP.acc);
          const t0 = Sp([-2.9, ch - 0.6, -5.3 * g]), t1 = Sp([-3.6 + sway * 0.4, ch - 4.6, -6.4]), t2 = Sp([-4.1 + sway * 0.8, ch - 7.8, -6.9]);
          chain([t0, t1, t2], 2.0, 1.6, T);
          // the split ends
          K.C(t2, Sp([-5.3 + sway * 1.1, ch - 10.8, -7.0]), 1.2, 0.45, T, GRP.acc);
          K.C(t2, Sp([-3.3 + sway * 1.2, ch - 10.4, -7.3]), 1.1, 0.45, T, GRP.acc);
          if (St) { K.C(lerp(t0, t1, 0.45), lerp(t0, t1, 0.62), 2.05, 2.0, St, GRP.acc); K.C(lerp(t1, t2, 0.5), lerp(t1, t2, 0.68), 1.85, 1.8, St, GRP.acc); }
          break;
        }
        case 'satchel': {
          const big = look.bigSatchel;
          chain([Sp([6.6, ch - 1.2, -3.2]), Sp([2.2, ch - 5.5, -6.2]), Sp([-3.4, ch - 10, -6.6]), Pl([-6.4, 2.2, -5.2])], 0.9, 0.9, Mt.leather);
          const Mb = mm(Mp, rotY(-40 * DEG));
          const c = Pl([-7.2 + sway * 0.2, -0.5, -5.4]);
          K.Bx(c, Mb, [big ? 4 : 3.4, big ? 3.8 : 3.2, 1.6], Mt.leather, GRP.acc);
          K.Bx(add(c, mv(Mb, [0, big ? 1.6 : 1.3, -0.6])), Mb, [big ? 4.1 : 3.5, big ? 2.2 : 1.9, 1.3], flat('#b08e58'), GRP.acc);
          K.S(add(c, mv(Mb, [0, 0, -1.9])), 0.7, Mt.gold, GRP.acc);
          if (big) K.Bx(add(c, mv(Mb, [0.6, 4.2, 0.2])), mm(Mb, rotZ(8 * DEG)), [2.6, 1.2, 0.4], Mt.paper, GRP.acc);
          break;
        }
        case 'glasses': {
          const fc = flat(look.glassCol || '#4a3e48', { max: 2 });
          K.C(H([hr[0] * 0.7, 0.4, hr[2] * 0.82]), H([hr[0] * 1.05, 0.3, -0.3]), 0.55, 0.55, fc, GRP.acc);
          K.C(H([hr[0] * 0.34, 0.1, hr[2] * 1.06]), H([hr[0] * 0.72, 0.4, hr[2] * 0.84]), 0.55, 0.55, fc, GRP.acc);
          break;
        }
        case 'headband': {
          const R = flat(look.bandCol || K.p.ac[1], { min: 1 });
          const pu = puff, ex = (pu - 1) * 12; // (round the curls, not under them)
          for (let i = 0; i < 24; i++) { const t = (i / 24) * Math.PI * 2; K.S(H([Math.sin(t) * (hr[0] + 1.3 + ex), 4.6 + ex * 0.3 - Math.cos(t) * 1.6, Math.cos(t) * (hr[2] + 1.4 + ex)]), 1.25, R, GRP.acc); }
          K.S(H([0, 6.4, -(hr[2] + 2.2 + ex)]), 1.6, R, GRP.acc);
          chain([H([0, 5.8, -(hr[2] + 2.4 + ex)]), H([-1.4 + hsw, 1, -(hr[2] + 3.4 + ex)]), H([-2 + hsw * 1.6, -3.4 - lag, -(hr[2] + 3.2 + ex)])], 0.9, 0.8, R);
          chain([H([0.6, 5.8, -(hr[2] + 2.4 + ex)]), H([1.6 + hsw, 1.6, -(hr[2] + 3 + ex)]), H([2.4 + hsw * 1.6, -2 - lag, -(hr[2] + 2.8 + ex)])], 0.9, 0.8, R);
          break;
        }
        case 'flower': blossom(H(out([-hr[0] * 0.7, hr[1] * 0.62, -hr[2] * 0.5])), flat(look.flowerCol || '#f4a6a0', { min: 2 }), flat('#f4d060', { min: 2 })); break;
        case 'hat': {
          const R = flat(look.hatCol || '#8a6a44');
          const band = flat(shade(look.hatCol || '#8a6a44', -2), { max: 2 });
          const base = H([0, hr[1] * 0.42 + (puff - 1) * 6, -0.4]);
          const q = (hr[0] / 12.2) * puff;
          K.Lf(add(base, mv(Mh, [0, -0.6, 0])), add(base, mv(Mh, [0, 0.8, 0])), Mh, [[0, 17.5 * q, 17.5 * q], [1, 16.5 * q, 16.5 * q]], R, GRP.acc);
          K.Lf(add(base, mv(Mh, [0, 0.6, 0])), add(base, mv(Mh, [0, 8.4 * q, -0.3])), Mh, [[0, 9.8 * q, 9.8 * q], [0.25, 9.4 * q, 9.4 * q], [0.85, 8.4 * q, 8.4 * q], [1, 6.2 * q, 6.2 * q]], R, GRP.acc);
          K.Lf(add(base, mv(Mh, [0, 0.8, 0])), add(base, mv(Mh, [0, 2.6 * q, 0])), Mh, [[0, 10 * q, 10 * q], [1, 9.7 * q, 9.7 * q]], band, GRP.acc);
          break;
        }
        case 'earrings': {
          const R = flat(look.earCol || '#e8c860', { min: 2 });
          for (const sx of [-1, 1]) { K.C(H([sx * hr[0] * 0.98, -hr[1] * 0.38, -0.3]), H([sx * hr[0] * 1.0, -hr[1] * 0.5, -0.3]), 0.3, 0.3, Mt.gold, GRP.acc); K.S(H([sx * hr[0] * 1.0, -hr[1] * 0.6, -0.3]), 1.4, R, GRP.acc); }
          break;
        }
        case 'cape': {
          const R = flat(look.capeCol || '#6a3a4a');
          const top = add(J.neckB, mv(Ms, [0, -0.4, -0.6])), bot = [J.pel[0] + sway * 1.4, 11, J.pel[2] - 1.6];
          K.Lf(bot, top, Ms, [[0, 12.6 * g, 10.4 * g], [0.55, 10.6 * g, 8.6 * g], [0.9, 9.6 * g, 7 * g], [1, 5.4 * g, 4.4 * g]], Object.assign({}, R, { lev: foldLev(6, { off: 0.4 }) }), GRP.cape, (lx, h, lz) => lz < 1.5 - h * 1.2);
          K.S(Sp([0, ch + 0.4, 5]), 1, Mt.gold, GRP.acc);
          break;
        }
        case 'lamp': lantern(add(J.handL, [0, -1.4, 0]), true); break;
        case 'ribbon': {
          const R = flat(look.ribbonCol || '#c85a6a', { min: 1 });
          const c = H(out([-hr[0] * 0.6, hr[1] * 0.72, -hr[2] * 0.5]));
          K.E(add(c, mv(Mh, [-2.2, 0.6, -0.4])), Mh, [2.4, 1.8, 1.1], R, GRP.acc);
          K.E(add(c, mv(Mh, [2.2, 0.6, -0.4])), Mh, [2.4, 1.8, 1.1], R, GRP.acc);
          K.S(c, 1.1, R, GRP.acc);
          chain([add(c, mv(Mh, [-0.4, -0.8, -0.6])), add(c, mv(Mh, [-1.4 + hsw, -5 - lag, -1.2]))], 0.8, 0.7, R);
          break;
        }
        case 'bell': {
          const cord = flat(look.cordCol || '#b8342a', { min: 1 });
          ring(J.neckB, 3.9 * g, 3.4 * g, 1.4, 10, 0.6, cord, Ms);
          // the bow at the nape sits over long hair or a scarf, as it does on the road from behind
          const over = (['long', 'wavy'].includes(look.hair) ? 6.6 : look.hair === 'bob' ? 3.4 : 0) + (acc.includes('scarf') ? 1.8 : 0);
          const n = Sp([0, ch + 1.6 + (over ? 1 : 0), -4.9 * g - over]);
          K.E(add(n, mv(Ms, [-1.7, 0.5, -0.4])), Ms, [1.8, 1.3, 0.9], cord, GRP.acc);
          K.E(add(n, mv(Ms, [1.7, 0.5, -0.4])), Ms, [1.8, 1.3, 0.9], cord, GRP.acc);
          K.S(add(n, mv(Ms, [0, 0.3, -0.6])), 0.9, cord, GRP.acc);
          K.C(add(n, mv(Ms, [-0.4, -0.2, -0.6])), add(n, mv(Ms, [-1.2, -3.4, -0.9])), 0.55, 0.5, cord, GRP.acc);
          K.C(add(n, mv(Ms, [0.4, -0.2, -0.6])), add(n, mv(Ms, [1.1, -2.8, -0.9])), 0.55, 0.5, cord, GRP.acc);
          break;
        }
        case 'cap': {
          const R = flat(look.capCol || '#2c4468');
          const cq = puff;
          K.E(H([0, 3.4, -0.6]), Mh, [hr[0] * 1.12 * cq, hr[1] * 0.78 * cq, hr[2] * 1.14 * cq], R, GRP.acc, (l) => l[1] > -0.02);
          for (let i = 0; i < 22; i++) { const t = (i / 22) * Math.PI * 2; K.S(H([Math.sin(t) * hr[0] * 1.12 * cq, 3.4, Math.cos(t) * hr[2] * 1.14 * cq]), 1.3, flat(shade(look.capCol || '#2c4468', -2), { max: 2 }), GRP.acc); }
          K.E(H([0, 3.2, hr[2] * 1.2 * cq]), Mh, [8, 0.8, 5], flat(shade(look.capCol || '#2c4468', -2)), GRP.acc);
          break;
        }
        case 'leaf': {
          const c = H(out([-hr[0] * 0.68, hr[1] * 0.66, -hr[2] * 0.52]));
          const Ml = mm(Mh, mm(rotY(-40 * DEG), rotZ(30 * DEG)));
          K.E(c, Ml, [3.2, 3.8, 1.1], flat(look.leafCol || '#c8452a', { min: 1 }), GRP.acc);
          K.C(add(c, mv(Ml, [0, -2.6, 0])), add(c, mv(Ml, [0, -4.4, 0])), 0.4, 0.4, Mt.wood, GRP.acc);
          break;
        }
        case 'bottles': {
          // the green one is the vial she takes out (not at the hip while it is in her hand)
          if (!(ps.prop && ps.prop.vial > 0.5)) {
            K.C(Pl([7.6, 2, 2.4]), Pl([7.8, -2.2, 2.4]), 1.3, 1.5, flat('#6ab0a0', { min: 2 }), GRP.acc);
            K.S(Pl([7.6, 2.6, 2.4]), 0.8, flat('#a88860'), GRP.acc);
          }
          K.C(Pl([6.4, 2.2, -3.8]), Pl([6.6, -1.2, -4]), 1.1, 1.3, flat('#c8a0d0', { min: 2 }), GRP.acc);
          break;
        }
        case 'beard': K.E(H([0, -hr[1] * 0.62, hr[2] * 0.42]), Mh, [hr[0] * 0.78, hr[1] * 0.42, hr[2] * 0.62], Mt.hairCurl, GRP.hair, (l) => l[2] > -0.2); break;
        case 'cane': K.C(add(J.handL, [0, 1.6, 0]), [J.handL[0] - 1.2, 0.5, J.handL[2] + 1], 0.8, 0.7, Mt.wood, GRP.prop); K.C(add(J.handL, [0, 1.6, 0]), add(J.handL, [1.6, 2.4, 0]), 0.9, 0.9, Mt.wood, GRP.prop); break;
        case 'basket': {
          const c = add(J.handR, [0.4, -4.4, 0.4]);
          K.Lf(add(c, [0, -2.4, 0]), add(c, [0, 1.8, 0]), Ms, [[0, 3.6, 3.2], [1, 4.4, 3.8]], flat('#b08a4a', { pat: (info) => ((info.a * 3 + info.h * 6) % 1 < 0.2 ? -1 : 0) }), GRP.prop);
          K.C(add(c, [-3.6, 1.8, 0]), add(J.handR, [0, 0.4, 0]), 0.5, 0.5, Mt.wood, GRP.prop);
          K.C(add(J.handR, [0, 0.4, 0]), add(c, [3.6, 1.8, 0]), 0.5, 0.5, Mt.wood, GRP.prop);
          break;
        }
        case 'hood': {
          const R = flat(look.hoodCol || K.p.cl[1]);
          K.E(H([0, 1.6, -1.2]), Mh, [hr[0] * 1.2, hr[1] * 1.16, hr[2] * 1.22], R, GRP.acc, (l) => !(l[2] > 0.3 && l[1] < 0.5 && Math.abs(l[0]) < 0.72));
          K.Lf(add(J.neckB, mv(Ms, [0, -4, -0.4])), add(J.neckB, mv(Ms, [0, 3, -1])), Ms, [[0, 10.6 * g, 8 * g], [1, 7, 7.6]], R, GRP.acc, (lx, h, lz) => lz < 3);
          break;
        }
        case 'patches': K.Bx(Sp([4.2, ch - 6, -6.2 * g]), Ms, [1.6, 1.6, 0.6], flat('#8a7a5a'), GRP.acc); K.Bx(Pl([-3, -6, -8.6]), Mp, [1.5, 1.5, 0.5], flat('#8a7a5a'), GRP.acc); break;
        case 'toolbelt': {
          ring(J.waist, 8.1 * g, 6.4 * g, -2.4, 26, 0.9, Mt.leather, Ms);
          K.Bx(Pl([7.6, 1.2, -2]), mm(Mp, rotY(60 * DEG)), [1.8, 2.2, 1.4], Mt.leather, GRP.acc);
          K.C(Pl([-7.4, 4, -3]), Pl([-7.8, -2.4, -3.2]), 0.5, 0.5, Mt.wood, GRP.acc); K.Bx(Pl([-7.8, -2.8, -3.2]), Mp, [1.6, 0.9, 0.9], Mt.iron, GRP.acc);
          break;
        }
        case 'atlas_sash': {
          const R = flat(look.sashCol || '#d8c89a');
          chain([Sp([6.8, ch - 0.6, -3]), Sp([2, ch - 5.6, -6.4]), Sp([-3.6, ch - 11, -6.8]), Pl([-6.6, 2.4, -5.4])], 1.5, 1.5, R);
          K.S(Pl([-6.6, 2.4, -5.8]), 2.1, R, GRP.acc);
          chain([Pl([-6.6, 1.4, -6]), Pl([-7 + sway * 0.4, -4, -6.4])], 1.2, 1, R);
          break;
        }
        case 'atlas_pin': { // on the outside of the right shoulder, clear of long hair
          const Mq = mm(Ms, mm(rotY(80 * DEG), rotZ(45 * DEG)));
          K.Bx(add(J.shR, mv(Ms, [3.9, 0.4, -0.9])), Mq, [1.5, 1.5, 0.6], Mt.gold, GRP.acc);
          K.S(add(J.shR, mv(Ms, [4.4, 0.4, -0.9])), 0.7, flat('#3a5a8a', { min: 2 }), GRP.acc);
          break;
        }
        case 'atlas_lamplet': lantern(Pl([8.4, 3.6, -1])); break;
        case 'atlas_quill': K.C(H([-hr[0] * 0.66, hr[1] * 0.42, -hr[2] * 0.58]), H([-hr[0] * 1.02 + hsw * 0.3, hr[1] * 1.3, -hr[2] * 0.9]), 1.1, 0.5, flat('#f4f0e0', { min: 2 }), GRP.acc); break;
        default: break;
      }
    }
  }

  // ---- render one frame -------------------------------------------------------------------------------------
  // After the volumes are rasterized (each pixel one tone of its material's ramp), the craft passes:
  //  1. cast shadows: a pixel whose path toward the light runs under a nearer part of another form (the
  //     head over the collar, an arm over the side, the hair over the nape, a hat's brim, a strap) is
  //     shaded: a clear shadow shape under what overlaps it, not pillow shading round every edge;
  //  2. edges between forms: the farther of two overlapping forms gets a dark line (its own deepest tone:
  //     lighter than the silhouette's outline); where two materials meet at nearly the same depth (a belt
  //     on a coat, a cuff on a sleeve, a boot's top), the one underneath takes a shadow seam and the raised
  //     one a lit edge;
  //  3. the rim: a cool back light down the right-hand edges of the silhouette, on the side turned away
  //     from the key light (upper left);
  //  4. clusters: a lone pixel whose four neighbours agree on another tone takes theirs;
  //  5. the outline: every pixel round the silhouette takes the outline colour of the material it borders
  //     (a dark, cool version of that material, never black); on the upper-left edges of lit forms it
  //     breaks into a lighter line (selective outline).
  const NB = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const SHADOW_S = [1.2, 2.2, 3.3, 4.6];
  const DBG = {}; // (development switches for the passes: noCast, noEdge, noRim, noClean)
  function render(look, ps, grid) {
    useGrid(grid);
    BODY = bodyFor(ps);
    try { return render1(look, ps); } finally { useGrid(GRIDS.std); BODY = BODY0; }
  }
  function render1(look, ps) {
    const as = assemble(look, ps);
    props(as.K);
    accessories(as.K);
    const r = new Raster();
    for (const f of as.calls) f(r);
    const n = FW * FH, lv = r.lv.slice(), mark = new Uint8Array(n); // mark: 1 a form line, 2 the rim
    const op = (x, y) => x >= 0 && y >= 0 && x < FW && y < FH && r.g[y * FW + x] >= 0;
    // 1. cast shadows (marched toward the light through the depth buffer)
    for (let py = 0; py < FH; py++) for (let px = 0; px < FW; px++) {
      const i = py * FW + px;
      if (r.g[i] < 0 || r.flag[i] & 8 || DBG.noCast) continue;
      const P0 = add(rayO(px, py), mul(TOWARD, r.z[i]));
      for (const s of SHADOW_S) {
        const pr = proj(add(P0, mul(LIGHT, s)));
        const X = Math.floor(AX + pr[0]), Y = Math.floor(AY + pr[1]);
        if (X < 0 || Y < 0 || X >= FW || Y >= FH) break;
        const j = Y * FW + X;
        if (r.g[j] < 0 || r.g[j] === r.g[i]) continue;
        const dz = r.z[j] - pr[2];
        if (dz > 0.5 && dz < 7) { lv[i] = lv[i] >= 3 ? 1 : Math.max(0, lv[i] - 1); break; }
      }
    }
    // 2. edges between forms
    for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
      const i = y * FW + x;
      if (r.g[i] < 0 || r.flag[i] & 2 || DBG.noEdge) continue;
      let line = false;
      for (const [dx, dy] of NB) {
        if (!op(x + dx, y + dy)) continue;
        const j = (y + dy) * FW + x + dx;
        if (r.g[j] !== r.g[i] && r.z[j] > r.z[i] + 2.4) { line = true; break; }
      }
      if (line) { mark[i] = 1; continue; }
      // a seam with the material above or to the left (toward the light)
      for (const [dx, dy] of [[0, -1], [-1, 0]]) {
        if (!op(x + dx, y + dy)) continue;
        const j = (y + dy) * FW + x + dx;
        if (r.R[j] === r.R[i]) continue; // (only where colours meet: a band on a garment, a cuff, a boot top)
        const dz = r.z[j] - r.z[i];
        if (dz > 0.15 && dz <= 2.4) { lv[i] = Math.max(0, lv[i] - 1); break; }
        if (dz < -0.15 && dz >= -2.4 && lv[i] >= 2 && dy) { lv[i] = Math.min(r.m[i].top || 4, lv[i] + 1); break; }
      }
    }
    // 3. the rim down the right-hand edges
    for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
      const i = y * FW + x;
      if (r.g[i] < 0 || mark[i] || r.flag[i] & 4 || DBG.noRim) continue;
      // (the outer silhouette only: not the inside edge of a gap between an arm and the body)
      if (!op(x + 1, y) && !op(x + 2, y) && !op(x + 3, y) && r.nx[i] > 0.28 && r.nl[i] < 0.42) mark[i] = 2;
    }
    // 4. clusters: a lone pixel whose four neighbours agree on another step of the same ramp takes that step
    const lv2 = lv.slice();
    for (let y = 1; y < FH - 1; y++) for (let x = 1; x < FW - 1; x++) {
      const i = y * FW + x;
      if (r.g[i] < 0 || r.flag[i] & 1 || mark[i] || DBG.noClean) continue;
      let same = true, v = -1;
      for (const [dx, dy] of NB) {
        const j = (y + dy) * FW + x + dx;
        if (r.g[j] < 0 || r.R[j] !== r.R[i] || mark[j]) { same = false; break; }
        if (v < 0) v = lv[j]; else if (lv[j] !== v) { same = false; break; }
      }
      if (same && v !== lv[i]) lv2[i] = v;
    }
    // 5. colour, then the coloured selective outline
    const b = new P.Buf(FW, FH), d = b.d;
    const put = (i, c) => { const v = P.rgba(c), o = i * 4; d[o] = v[0]; d[o + 1] = v[1]; d[o + 2] = v[2]; d[o + 3] = 255; };
    for (let i = 0; i < n; i++) {
      if (r.g[i] < 0) continue;
      const m = r.m[i], R = m.R;
      put(i, mark[i] === 1 ? (lv2[i] <= 0 ? P.mix(R[0], m.OL, 0.5) : R[0]) : mark[i] === 2 ? m.RIM : R[lv2[i]]);
    }
    for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
      if (op(x, y)) continue;
      // the bordering pixel: below first (the outline under a form carries its colour), then the sides
      let j = -1, litSide = true;
      for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
        if (!op(x + dx, y + dy)) continue;
        if (dx < 0 || dy < 0) litSide = false;
        if (j < 0) j = (y + dy) * FW + x + dx;
      }
      if (j < 0) continue;
      const m = r.m[j];
      put(y * FW + x, litSide && lv2[j] >= 3 && !mark[j] ? m.LIT : m.OL);
    }
    return { b, J: as.J };
  }

  // local joint -> offset from the anchor on screen (art px at scale 1, on the current grid)
  const scr = (v) => { const s = proj(mv(BODY, v)); return { x: s[0], y: s[1] }; };

  // ---- anchors (battle addendum §7.2) ---------------------------------------------------------------
  // feet: the ground point (the anchor; it never moves); torso: the chest; head: the crown; handR/handL:
  // the hands; held: what the acting hand holds (folio, strip, brush, vial, lamp), or that hand;
  // release: where an effect leaves the actor (a brush tip, a strip's end, the open folio, the vial's
  // lip, the lamp's glass, a pointing fingertip, an open palm). `hand` keeps its old meaning — the
  // acting release point — so every effect that starts "from the hand" starts where it should.
  function pointsOf(J, ps, pose, gesture) {
    const Mh = J.Mh, top = add(J.headC, mv(Mh, [0, J.B.headR[1] + 2, 0]));
    const pr = ps.prop || {};
    const left = ps.act === 'L';
    const hd = left ? J.handL : J.handR, el = left ? J.elbL : J.elbR;
    const fwd = norm(sub(hd, el));
    const gest = pose === 'anticipate' || pose === 'act' || pose === 'recover';
    let held = hd, release = hd;
    if (gest && gesture === 'book' && pr.book > 0.25) { held = add(J.handL, mv(J.Ms, [3.5, 1.5, 2])); release = held; }
    else if (pr.vial > 0.5 && J.vial) { held = J.vial.mid; release = add(J.vial.lip, mul(J.vial.ax, 1)); }
    else if (left && J.lamp) { held = J.lamp; release = J.lamp; }
    else if (pr.brush) { const d = norm(add(fwd, [0, 0.9, 0])); held = add(hd, mul(d, 3)); release = add(hd, mul(d, 9)); }
    else if (pr.strip > 0.5) { held = add(hd, mul(fwd, 2 + 3 * pr.strip)); release = add(hd, mul(fwd, 3 + 6 * pr.strip)); }
    else {
      const sh = left ? ps.handShapeL : ps.handShapeR;
      if (sh === 'point') release = add(hd, mul(fwd, 5.8 * HAND - 1.5));
      else if (sh === 'open' || sh === 'flat' || sh === 'spread') release = add(hd, mul(fwd, 3.6 * HAND - 1.5));
    }
    const chest = scr(add(J.neckB, mv(J.Ms, [0, -4.5, 0])));
    return {
      hand: scr(release), release: scr(release), held: scr(held),
      head: scr(top), chest, torso: chest, waist: scr(J.waist), handR: scr(J.handR), handL: scr(J.handL),
      lamp: J.lamp ? scr(J.lamp) : null, feet: { x: 0, y: 0 },
    };
  }
  const PT_KEYS = ['hand', 'release', 'held', 'head', 'chest', 'torso', 'waist', 'handR', 'handL', 'feet'];

  // ---- who is drawn ------------------------------------------------------------------------------------
  // An actor id chooses the stance and movement language (src/engine/34m_battler_moves.js): 'pc', a
  // companion's id, or 'comp' (any other figure: an NPC drawn in the battle style). Without o.id the
  // companion is recognised by their look (the content's own look object, or an equal one).
  const lookIds = new WeakMap();
  function actorOf(look, who, id) {
    if (id) return id;
    if (who !== 'comp') return 'pc';
    let a = lookIds.get(look);
    if (a) return a;
    a = 'comp';
    const C = (RB.content && RB.content.chars) || {};
    for (const c of ['nao', 'mio', 'ren', 'suzu']) if (C[c] && (C[c].look === look || JSON.stringify(C[c].look) === lookKey(look))) { a = c; break; }
    lookIds.set(look, a);
    return a;
  }

  // ---- cache and API ---------------------------------------------------------------------------------------
  // Keys: look, actor, pose, gesture (or a reaction's variant), progress (QK steps; ½ steps with reduced
  // motion), the idle key frame (a small fixed set per actor), facing, grid — never elapsed time.
  const QK = 12, CAP = 720;
  const cache = new Map();
  const lookKeys = new WeakMap();
  function lookKey(look) { let k = lookKeys.get(look); if (!k) { k = JSON.stringify(look); lookKeys.set(look, k); } return k; }
  const stats = { built: 0, buildMs: 0, maxMs: 0, hits: 0, evicted: 0, retained: 0 };
  // the frame a request names: every input normalised, and its bounded cache key
  function resolve(look, o) {
    const Mv = M();
    const pose = POSES.includes(o.pose) ? o.pose : 'ready';
    const who = o.who === 'comp' ? 'comp' : 'pc';
    const id = actorOf(look, who, o.id);
    const usesG = pose === 'anticipate' || pose === 'act' || pose === 'recover';
    const gesture = usesG ? (Mv.hasGesture(o.gesture, id) ? o.gesture : 'direct') : '';
    const variant = !usesG && o.gesture && Mv.hasVariant(pose, o.gesture) ? o.gesture : '';
    const reduce = !!o.reduce;
    const idleP = pose === 'ready' || pose === 'calm';
    let k = Math.max(0, Math.min(1, o.k == null ? 0 : +o.k || 0));
    // (a gesture may draw its progress more finely than QK steps — Suzu's twirl — still a bounded set)
    const qk = (usesG && Mv.qkOf && Mv.qkOf(id, gesture)) || QK;
    k = reduce ? Math.round(k * 2) / 2 : Math.round(k * qk) / qk;
    const ik = idleP ? Mv.idleKey(id, pose, o.t || 0, reduce) : '';
    const left = o.facing === 'upleft';
    const grid = o.grid && GRIDS[o.grid] ? GRIDS[o.grid] : GRIDS.std;
    const lk = lookKey(look);
    const key = lk + '|' + id + '|' + pose + '|' + gesture + variant + '|' + (idleP ? ik : k) + '|' + (reduce ? 1 : 0) + (left ? 'L' : 'R') + (grid.id === 'std' ? '' : '|' + grid.id);
    return { pose, who, id, gesture, variant, reduce, k, ik, left, grid, lk, key, t: o.t || 0 };
  }
  function build(look, r) {
    const ps = M().poseAt(look, r.pose, r.gesture || r.variant, r.k, r.t, r.who, r.reduce, r.id, r.ik);
    useGrid(r.grid);
    BODY = bodyFor(ps);
    try { const { b, J } = render1(look, ps); return { b, J, ps, pts: pointsOf(J, ps, r.pose, r.gesture) }; } finally { useGrid(GRIDS.std); BODY = BODY0; }
  }
  function frameFor(look, o) {
    look = look || {};
    o = o || {};
    const r = resolve(look, o);
    let f = cache.get(r.key);
    if (f) { cache.delete(r.key); cache.set(r.key, f); stats.hits++; return f; }
    const t0 = performance.now();
    let { b, pts } = build(look, r);
    let buf = b, ax = r.grid.AX;
    if (r.left) { buf = b.mirror(); ax = r.grid.FW - 1 - r.grid.AX; const fl = (q) => (q ? { x: -q.x, y: q.y } : q); const m = {}; for (const kk in pts) m[kk] = fl(pts[kk]); pts = m; }
    f = { cv: buf.toCanvas(), pts, ax, ay: r.grid.AY, w: r.grid.FW, h: r.grid.FH, lk: r.lk, id: r.id };
    const ms = performance.now() - t0;
    stats.built++; stats.buildMs += ms; stats.maxMs = Math.max(stats.maxMs, ms);
    cache.set(r.key, f);
    while (cache.size > CAP) { cache.delete(cache.keys().next().value); stats.evicted++; }
    return f;
  }
  // One frame measured without a canvas (node tests): its anchors (art px from the foot anchor), the
  // drawn box (frame px), the number of drawn pixels, the pose numbers and the cache key it would use.
  function measure(look, o) {
    look = look || {};
    const r = resolve(look, o || {});
    const { b, ps, pts } = build(look, r);
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, n = 0;
    for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) if (b.d[(y * b.w + x) * 4 + 3]) { n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    let feet = [];
    for (let x = 0; x < b.w; x++) if (b.d[(y1 * b.w + x) * 4 + 3]) feet.push(x);
    return { pts, box: { x0, y0, x1, y1 }, n, feetMid: feet.length ? (feet[0] + feet[feet.length - 1]) / 2 : null, ps, key: r.key, id: r.id, grid: r.grid, data: b.d };
  }
  // Draw one figure: its foot anchor at (o.x, o.y) on ctx, scaled by a whole number. Returns where
  // effects attach, in canvas px.
  function draw(ctx, look, o) {
    o = o || {};
    const s = Math.max(1, Math.floor(o.scale || 1));
    const f = frameFor(look, o);
    const x = Math.round(o.x || 0), y = Math.round(o.y || 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(f.cv, x - f.ax * s, y - f.ay * s, f.w * s, f.h * s);
    const out = {};
    for (const k of PT_KEYS) { const q = f.pts[k]; out[k] = { x: x + q.x * s, y: y + q.y * s }; }
    out.lamp = f.pts.lamp ? { x: x + f.pts.lamp.x * s, y: y + f.pts.lamp.y * s } : null;
    out.feet = { x, y };
    return out;
  }
  // One frame at scale 1 (for menus and tests); the anchor is at ANCHOR (or the grid's).
  function preview(look, pose, gesture, k, o) {
    return frameFor(look, Object.assign({ pose, gesture, k, t: 0 }, o || {})).cv;
  }
  // The anchors of one frame, relative to its foot anchor (art px at scale 1).
  function anchors(look, o) { return Object.assign({}, frameFor(look, o || {}).pts); }
  // Build the frames a battle starts with ahead of time (in idle moments): this actor's idle and calm key
  // frames only (battle addendum §21.4: prewarm the encounter's actors, nothing else).
  // (it stops if a later encounter's retain() leaves this look out: no stale frames built afterwards)
  let keepSet = null;
  function prewarm(look, who, id) {
    who = who === 'comp' ? 'comp' : 'pc';
    const list = [], lk = lookKey(look);
    for (const pose of ['ready', 'calm']) for (const t of M().idleTimes(actorOf(look, who, id), pose)) list.push({ pose, t, who, id });
    let i = 0;
    const step = () => {
      if (keepSet && !keepSet.has(lk)) return;
      const t0 = performance.now();
      while (i < list.length && performance.now() - t0 < 6) frameFor(look, list[i++]);
      if (i < list.length) (typeof requestIdleCallback === 'function' ? requestIdleCallback : setTimeout)(step);
    };
    step();
    return list.length;
  }
  // Keep only the frames of these looks (an encounter's actors); every other look's frames are released.
  function retain(looks) {
    const keep = new Set((looks || []).filter(Boolean).map(lookKey));
    keepSet = keep;
    for (const [k, f] of cache) if (!keep.has(f.lk)) { cache.delete(k); stats.retained++; }
    return cache.size;
  }
  // Estimated resident pixels of the cached frames (battle addendum §21.5): w × h × 4 bytes per frame.
  function budget() {
    let bytes = 0;
    const per = {};
    for (const f of cache.values()) { const b = f.w * f.h * 4; bytes += b; per[f.id] = (per[f.id] || 0) + 1; }
    const frameBytes = GRIDS.std.FW * GRIDS.std.FH * 4;
    return {
      frames: cache.size, bytes, mib: +(bytes / 1048576).toFixed(3), perActor: per,
      cap: CAP, capMib: +((CAP * frameBytes) / 1048576).toFixed(2), budgetMib: 48,
      built: stats.built, meanBuildMs: stats.built ? +(stats.buildMs / stats.built).toFixed(2) : 0, maxBuildMs: +stats.maxMs.toFixed(1), hits: stats.hits, evicted: stats.evicted, released: stats.retained,
    };
  }
  // A new encounter: release the frames of looks that are not in it (the player's look and the committed
  // companion's), so the cache never accumulates every appearance met in a session.
  if (RB.bus && RB.bus.on) RB.bus.on('present:scene', (e) => {
    try {
      if (!e || e.phase !== 'enter' || !RB.game || !RB.game.s) return;
      const s = RB.game.s, looks = [RB.equip.look(s)];
      if (e.comp && RB.content.chars[e.comp]) looks.push(RB.content.chars[e.comp].look);
      retain(looks);
    } catch (err) { /* presentation only */ }
  });

  return {
    FRAME: { w: FW, h: FH }, ANCHOR: { x: AX, y: AY }, POSES,
    get GESTURES() { return M() ? M().GESTURES : []; },
    get VARIANTS() { return M() ? M().VARIANTS : {}; },
    get LOOP() { return M() ? M().LOOP : {}; },
    GRIDS, QK,
    draw, preview, anchors, prewarm, retain, budget, actorOf,
    _: {
      // (an outside caller — the fishing stage — gets the plain companion stance unless it names the
      // actor, so its own authored poses are laid over the stance they were written for)
      poseAt: (look, pose, g, k, t, who, reduce, id, ik) => M().poseAt(look, pose, g, k, t, who, reduce, id || (who === 'comp' ? 'comp' : 'pc'), ik), render, frameFor, handModel, cacheSize: () => cache.size, clear: () => cache.clear(), YAW, PITCH,
      DBG, get ZS() { return ZS; }, keys: () => [...cache.keys()], measure, resolve,
    },
  };
})();
