/* Cosmetic pets, part 2: the volume rasterizer the pet art is drawn with.
 *
 * The pets are drawn the way the battle figures are (src/engine/34_battlers.js):
 * a posed rig of simple volumes — ellipsoids for heads, bodies and paws,
 * tapered (and optionally flattened) chains for legs, tails, ears and wings —
 * rasterized at art resolution with a depth buffer. Each pixel takes one step
 * of its material's five-step hue-shifted ramp from the light (upper left, a
 * little toward the viewer); a material may repaint a pixel from its own
 * pattern (tabby stripes, calico patches, a tanuki's mask) using coordinates
 * local to the part, so a pattern stays put on the animal in every view and
 * pose. A darker contour separates a nearer part from a farther one, lone
 * pixels join their neighbours, small decals (eyes, noses) are stamped where
 * they are visible, and the selective outline goes round. Nothing is smoothed:
 * every edge is a hard pixel edge on the same art grid as the world.
 *
 * Because the rig is 3-D, one set of poses gives every view: the four road
 * directions (camera pitch 28°) and the rear three-quarter battle view (pitch
 * 20°, facing up-right, as the adventurers). This file knows nothing about
 * species: src/engine/37_pets_3rig.js builds the volumes.
 *
 *   RB.petArt.camera({ w, h, ax, ay, pitch, yaw, zs, mirror })
 *   RB.petArt.render(cam, build) -> Buf   build(K) calls K.ell/K.chain/K.decal
 *   RB.petArt.V (vector kit), ramp(base) (a five-step ramp) */
var RB = (globalThis.RB = globalThis.RB || {});

RB.petArt = (function () {
  'use strict';
  const P = RB.pix;
  const DEG = Math.PI / 180;

  // ---- vectors and 3×3 frames (columns are the local axes in the parent frame) -----------------------
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const len = (a) => Math.hypot(a[0], a[1], a[2]);
  const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const M_ID = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const mv = (M, v) => [M[0][0] * v[0] + M[1][0] * v[1] + M[2][0] * v[2], M[0][1] * v[0] + M[1][1] * v[1] + M[2][1] * v[2], M[0][2] * v[0] + M[1][2] * v[1] + M[2][2] * v[2]];
  const mtv = (M, v) => [dot(M[0], v), dot(M[1], v), dot(M[2], v)];
  const mm = (A, B) => [mv(A, B[0]), mv(A, B[1]), mv(A, B[2])];
  const rotX = (a) => { const c = Math.cos(a), s = Math.sin(a); return [[1, 0, 0], [0, c, s], [0, -s, c]]; };  // pitch: +a tips the nose (+z) down
  const rotY = (a) => { const c = Math.cos(a), s = Math.sin(a); return [[c, 0, -s], [0, 1, 0], [s, 0, c]]; }; // yaw: +a turns the nose (+z) toward +x
  const rotZ = (a) => { const c = Math.cos(a), s = Math.sin(a); return [[c, -s, 0], [s, c, 0], [0, 0, 1]]; };  // roll: +a tips the top toward +x
  // a frame whose z axis points along d (the part's length), with y as close to `up` as it allows
  function along(d, up) {
    const z = norm(d);
    let x = cross(up || [0, 1, 0], z);
    if (len(x) < 1e-5) x = cross([0, 0, 1], z);
    x = norm(x);
    return [x, cross(z, x), z];
  }
  const V = { add, sub, mul, dot, cross, len, norm, lerp, mv, mtv, mm, rotX, rotY, rotZ, along, M_ID, DEG };

  // ---- camera ----------------------------------------------------------------------------------------
  // World: x right on screen, y up, z toward the viewer across the ground; the camera looks down at
  // `pitch`. The animal's local frame (x its right, y up, z its nose) is turned by `yaw`: 0 walks away
  // from the viewer, 90° walks right, 180° toward the viewer, 36° is the battle view (up-right).
  // `mirror` draws the mirror image of the geometry while the light stays where it is; `wide`
  // stretches the drawing across the screen (a little, for animals seen end-on).
  function camera(o) {
    const pitch = (o.pitch == null ? 28 : o.pitch) * DEG, yaw = (o.yaw || 0) * DEG;
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const cam = {
      w: o.w, h: o.h, ax: o.ax, ay: o.ay, zs: o.zs || 1, zx: (o.zs || 1) * (o.wide || 1), cp, sp,
      DIR: [0, -sp, -cp], TOWARD: [0, sp, cp],
      body: [[Math.cos(yaw), 0, Math.sin(yaw)], [0, 1, 0], [Math.sin(yaw), 0, -Math.cos(yaw)]],
      light: norm([-0.72, 0.64, 0.36]),
      mirror: !!o.mirror,
    };
    return cam;
  }
  // world point -> [screen x, screen y, depth toward the viewer]
  const proj = (cam, w) => [cam.ax + w[0] * cam.zx, cam.ay - (w[1] * cam.cp - w[2] * cam.sp) * cam.zs, w[1] * cam.sp + w[2] * cam.cp];
  // pixel centre -> the ray's origin on the depth-0 plane
  function rayO(cam, px, py) {
    const sx = (px + 0.5 - cam.ax) / cam.zx, su = (cam.ay - (py + 0.5)) / cam.zs;
    return [sx, su * cam.cp, -su * cam.sp];
  }

  // ---- the raster --------------------------------------------------------------------------------------
  function Raster(cam) {
    const n = cam.w * cam.h;
    this.cam = cam;
    this.z = new Float32Array(n).fill(-1e9);
    this.g = new Int16Array(n).fill(-1);
    this.lv = new Int8Array(n);
    this.R = new Array(n);
    this.flag = new Uint8Array(n); // 1 keep its step (no lone-pixel join), 2 no contour
  }
  // a material: { R: [5 colours], th?: thresholds, min?, max?, flag?, pat?(info, v, l) -> {R?, d?} | number }
  function stepOf(cam, n, mat, info) {
    const l = dot(n, cam.light), f = dot(n, cam.TOWARD);
    const th = mat.th || [0.7, 0.36, -0.04, -0.42];
    let v = l > th[0] ? 4 : l > th[1] ? 3 : l > th[2] ? 2 : l > th[3] ? 1 : 0;
    if (f < 0.18 && l < 0.3) v = Math.min(v, 1); // the turned-away rim darkens
    let R = mat.R;
    if (mat.pat) {
      const q = mat.pat(info, v, l);
      if (typeof q === 'number') v += q;
      else if (q) { if (q.R) R = q.R; if (q.d) v += q.d; if (q.v != null) v = q.v; }
    }
    if (mat.min != null) v = Math.max(v, mat.min);
    if (mat.max != null) v = Math.min(v, mat.max);
    return [R, v < 0 ? 0 : v > 4 ? 4 : v];
  }
  function write(r, i, z, grp, R, lv, flag) {
    r.z[i] = z; r.g[i] = grp; r.R[i] = R; r.lv[i] = lv; r.flag[i] = flag || 0;
  }
  function bbox(cam, c, ext) {
    const s = proj(cam, c);
    const e = ext * cam.zs + 1;
    return [Math.max(0, Math.floor(s[0] - e)), Math.max(0, Math.floor(s[1] - e)), Math.min(cam.w - 1, Math.ceil(s[0] + e)), Math.min(cam.h - 1, Math.ceil(s[1] + e))];
  }
  // Ellipsoid (world): centre c, frame M, radii rad; info.l is the hit on the unit sphere of its own
  // frame, info.part names the part (patterns read both).
  function ellipsoid(r, pr) {
    const cam = r.cam, { c, rad, mat, grp } = pr, M = pr.M || M_ID;
    const [x0, y0, x1, y1] = bbox(cam, c, Math.max(rad[0], rad[1], rad[2]));
    const dl = mtv(M, cam.DIR), d = [dl[0] / rad[0], dl[1] / rad[1], dl[2] / rad[2]];
    const A = dot(d, d);
    for (let py = y0; py <= y1; py++) for (let px = x0; px <= x1; px++) {
      const ol = mtv(M, sub(rayO(cam, px, py), c)), o = [ol[0] / rad[0], ol[1] / rad[1], ol[2] / rad[2]];
      const B = 2 * dot(o, d), C = dot(o, o) - 1, D = B * B - 4 * A * C;
      if (D < 0) continue;
      const s = (-B - Math.sqrt(D)) / (2 * A);
      const i = py * cam.w + px, z = -s + (pr.bias || 0);
      if (z <= r.z[i]) continue;
      const l = add(o, mul(d, s));
      if (pr.keep && !pr.keep(l)) continue;
      const n = norm(mv(M, [l[0] / rad[0], l[1] / rad[1], l[2] / rad[2]]));
      // light on a mass: the normal is bent toward the normal of the larger form the part belongs to
      // (the trunk, the head), so neighbouring volumes share one light, mid and shadow plane instead
      // of each small sphere carrying its own bands (patterns still see the part's own normal)
      let nl = n;
      const ms = pr.mass;
      if (ms) {
        const wp = add(rayO(cam, px, py), mul(cam.DIR, s));
        const q = mtv(ms.M, sub(wp, ms.c));
        const nb = norm(mv(ms.M, [q[0] / (ms.r[0] * ms.r[0]), q[1] / (ms.r[1] * ms.r[1]), q[2] / (ms.r[2] * ms.r[2])]));
        nl = norm(lerp(n, nb, ms.k));
      }
      const [R, v] = stepOf(cam, nl, mat, { l, n, part: pr.part, u: pr.u });
      write(r, i, z, grp, R, v, pr.flag || mat.flag);
    }
  }

  // ---- building a frame --------------------------------------------------------------------------------
  // build(K) describes the animal in its own frame (units: art px at zs 1); K turns it into the world.
  //   K.ell(part, c, rad, mat, o)            o: { M (local frame), grp, keep, bias, flag }
  //   K.chain(part, pts, radii, mat, o)      a tapered chain through pts (radii per point; o.flat: [sx, sy]
  //                                          flattens the cross-section along the chain's x/y; o.up)
  //   K.decal(p, fn)                         fn(ctx) at the projected point if visible (eyes, noses)
  //   K.at(p) -> screen point {x, y}         (anchors for effects and for tests)
  function render(cam, build, opts) {
    opts = opts || {};
    const r = new Raster(cam);
    const B = cam.body;
    // mirrored: the screen image is reflected (the animal faces the other way), the light stays put;
    // a part's frame is reflected too, so its own coordinates — and its pattern — mirror with it
    const toW = (p) => { const w = mv(B, p); return cam.mirror ? [-w[0], w[1], w[2]] : w; };
    const toM = (M) => { const w = [mv(B, M[0]), mv(B, M[1]), mv(B, M[2])]; return cam.mirror ? w.map((c) => [-c[0], c[1], c[2]]) : w; };
    let gid = 0;
    const groups = {};
    const gOf = (name) => (name == null ? gid++ : groups[name] != null ? groups[name] : (groups[name] = gid++));
    const decals = [];
    // the current light mass (K.mass): parts drawn while it is set share its planes
    let mass = null;
    const K = {
      // K.mass(c, r, k) in the animal's frame: centre, radii, how far normals bend toward it (0..1); null ends it
      mass(c, rr, k) { mass = c ? { c: toW(c), M: toM(M_ID), r: rr, k: k == null ? 0.45 : k } : null; },
      ell(part, c, rad, mat, o) {
        o = o || {};
        ellipsoid(r, { c: toW(c), M: toM(o.M || M_ID), rad, mat, grp: gOf(o.grp || part), part, keep: o.keep, bias: o.bias, flag: o.flag, u: o.u, mass: o.mass === false ? null : mass });
      },
      chain(part, pts, radii, mat, o) {
        o = o || {};
        const grp = gOf(o.grp || part);
        // total length for u
        let L = 0;
        const seg = [];
        for (let k = 0; k + 1 < pts.length; k++) { const s = len(sub(pts[k + 1], pts[k])); seg.push(s); L += s; }
        let acc = 0;
        for (let k = 0; k + 1 < pts.length; k++) {
          const a = pts[k], b = pts[k + 1], sl = seg[k];
          const n = Math.max(1, Math.ceil(sl / (o.step || 0.55)));
          const F = along(sub(b, a), o.up);
          for (let j = (k === 0 ? 0 : 1); j <= n; j++) {
            const t = j / n, c = lerp(a, b, t), rr = radii[k] + (radii[k + 1] - radii[k]) * t;
            const u = L ? (acc + sl * t) / L : 0;
            const fl = o.flat || [1, 1];
            ellipsoid(r, { c: toW(c), M: toM(F), rad: [Math.max(0.3, rr * fl[0]), Math.max(0.3, rr * fl[1]), Math.max(0.3, rr)], mat, grp, part, u, keep: o.keep, flag: o.flag, mass: o.mass === false ? null : mass });
          }
          acc += sl;
        }
      },
      // o.grp: the decal belongs to that part's group (an eye or a nose is never stamped on the chest)
      decal(p, fn, o) { o = o || {}; decals.push({ w: toW(p), fn, o, grp: o.grp != null ? gOf(o.grp) : null }); },
      at(p) { const s = proj(cam, toW(p)); return { x: s[0], y: s[1], z: s[2] }; },
      // a direction in the animal's frame, in the world (the frame patterns see their normals in)
      dir(v) { return toW(v); },
      mirror: !!cam.mirror,
    };
    build(K);
    const W = cam.w, H = cam.h, n = W * H, lv = r.lv.slice();
    // contour: a pixel beside a nearer part of another group is drawn darker
    const NB = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const cgap = opts.contour == null ? 1.6 : opts.contour;
    const cont = new Uint8Array(n);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (r.g[i] < 0 || r.flag[i] & 2) continue;
      for (const [dx, dy] of NB) {
        const X = x + dx, Y = y + dy;
        if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
        const j = Y * W + X;
        if (r.g[j] < 0 || r.g[j] === r.g[i] || (r.flag[j] & 2)) continue;
        if (r.z[j] > r.z[i] + cgap) { lv[i] = Math.max(0, Math.min(r.lv[i] - 2, 1)); cont[i] = 1; break; }
      }
    }
    // Cast shadow (the larger views): just below a nearer part of another group — under the chin, the
    // haunch over a hind paw, the head over the shoulders — the surface is a step darker for two rows,
    // so overlapping forms read as forms, not as one silhouette.
    if (opts.cast) {
      for (let y = 1; y < H; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (r.g[i] < 0 || cont[i] || r.flag[i] & 2) continue;
        for (let k = 1; k <= 2 && y - k >= 0; k++) {
          const j = i - k * W;
          if (r.g[j] < 0 || r.g[j] === r.g[i] || (r.flag[j] & 2)) continue;
          if (r.z[j] > r.z[i] + cgap) { lv[i] = Math.max(0, Math.min(lv[i], r.lv[i] - 1)); break; }
        }
      }
    }
    // a lone pixel whose four neighbours agree on another step of the same ramp takes that step
    const lv2 = lv.slice();
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      if (r.g[i] < 0 || r.flag[i] & 1) continue;
      let same = true, v = -1;
      for (const [dx, dy] of NB) {
        const j = (y + dy) * W + x + dx;
        if (r.g[j] < 0 || r.R[j] !== r.R[i]) { same = false; break; }
        if (v < 0) v = lv[j]; else if (lv[j] !== v) { same = false; break; }
      }
      if (same && v !== lv[i]) lv2[i] = v;
    }
    // Clusters, not speckle (opts.cluster passes): a pixel that shares its colour (ramp and step) with at
    // most one of its eight neighbours, where five or more of them agree on another colour of the same
    // group, takes that colour. Patterns and planes become grouped shapes; contour lines and decals stay.
    let R2 = r.R;
    for (let pass = 0; pass < (opts.cluster || 0); pass++) {
      const nl = lv2.slice(), nR = R2.slice();
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
        const i = y * W + x;
        if (r.g[i] < 0 || r.flag[i] & 1 || cont[i]) continue;
        let same = 0;
        const tally = [];
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const j = i + dy * W + dx;
          if (r.g[j] !== r.g[i] || cont[j]) continue;
          if (R2[j] === R2[i] && lv2[j] === lv2[i]) { same++; continue; }
          let t = tally.find((q) => q.R === R2[j] && q.v === lv2[j]);
          if (!t) tally.push((t = { R: R2[j], v: lv2[j], n: 0 }));
          t.n++;
        }
        if (same > 1) continue;
        let best = null;
        for (const q of tally) if (q.n >= 5 && (!best || q.n > best.n)) best = q;
        if (best) { nl[i] = best.v; nR[i] = best.R; }
      }
      for (let i = 0; i < n; i++) { lv2[i] = nl[i]; }
      R2 = nR;
    }
    const b = new P.Buf(W, H);
    for (let i = 0; i < n; i++) if (r.g[i] >= 0) b.put(i % W, (i / W) | 0, P.rgba(R2[i][lv2[i]]));
    // decals: drawn where their point is not hidden behind a nearer part
    for (const d of decals) {
      const s = proj(cam, d.w);
      const px = Math.floor(s[0]), py = Math.floor(s[1]);
      if (px < 0 || py < 0 || px >= W || py >= H) continue;
      const i = py * W + px;
      if (!d.o.always && r.g[i] >= 0 && r.z[i] > s[2] + (d.o.tol == null ? 0.9 : d.o.tol)) continue;
      if (d.grp != null && r.g[i] !== d.grp) continue;
      d.fn({ b, x: px, y: py, sx: s[0], sy: s[1], zs: cam.zs, mirror: !!cam.mirror });
    }
    if (opts.outline !== false) b.outline(opts.outlineCol || '#241c20', { minA: 100 });
    return b;
  }

  // One ramp step, the characters' rule (RB.pix.shade: darker leans cool/violet, lighter warm), with
  // a hex writer that clamps before padding (RB.pix.hex pads before rounding, so a channel that
  // rounds up to 16 from just under it comes out as three digits — seen as a stray blue on the
  // tanuki's darkest fur; the shared file is left alone and its owner told).
  const h2 = (n) => { const v = Math.max(0, Math.min(255, Math.round(n))); return (v < 16 ? '0' : '') + v.toString(16); };
  const hex6 = (v) => '#' + h2(v[0]) + h2(v[1]) + h2(v[2]);
  const toward = (h, target, amt) => { const d = ((target - h + 540) % 360) - 180; return h + Math.sign(d) * Math.min(Math.abs(d), amt); };
  const sc = new Map();
  function shade(c, k) {
    if (!k) return c;
    const key = c + '|' + k;
    let out = sc.get(key);
    if (out) return out;
    const [h, s, l] = P.toHsl(P.rgba(c));
    if (k < 0) {
      const n = -k, grey = s < 0.1 ? 0.05 : 0;
      // fur in shadow: warm coats (ginger, cream, tan) lean only a little toward violet, and do not
      // gain saturation — the shortest way to violet from orange runs through red, which reads as raw skin
      const warm = h < 70 || h > 330;
      out = hex6(P.fromHsl(toward(h, 250, (warm ? 4 : 10) * n), Math.min(warm ? s : 1, s + (warm ? -0.02 : 0.05 + grey) * n), l - (l < 0.25 ? 0.055 : l < 0.5 ? 0.09 : 0.11) * n));
    } else {
      const n = k;
      out = hex6(P.fromHsl(toward(h, 48, 7 * n), s * (l > 0.7 ? 0.9 : 1) + (l < 0.6 ? 0.03 : 0) * n, l + (l < 0.25 ? 0.075 : l > 0.8 ? 0.05 : 0.085) * n));
    }
    sc.set(key, out);
    return out;
  }
  const mix = (a, b, t) => { const A = P.rgba(a), B = P.rgba(b); return hex6([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]); };
  // five-step ramp: [deep, shadow, base, light, highlight] (hue-shifted like the characters')
  const rc = new Map();
  function ramp(base, dark, light) {
    const k = base + '|' + (dark || '') + '|' + (light || '');
    let v = rc.get(k);
    if (!v) {
      v = [shade(dark || base, dark ? -1 : -2), dark ? mix(dark, shade(base, -1), 0.5) : shade(base, -1), base, light ? mix(light, shade(base, 1), 0.35) : shade(base, 1), shade(light || base, light ? 1 : 2)];
      rc.set(k, v);
    }
    return v;
  }
  // a flat colour as a ramp that keeps only a little shading (decals, noses, beaks)
  function flat(c, spread) {
    const s = spread == null ? 1 : spread;
    return [shade(c, -2 * s), shade(c, -s), c, shade(c, s * 0.6), shade(c, s)];
  }

  return { V, camera, proj, render, ramp, flat, shade, mix };
})();
