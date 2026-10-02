/* A Quiet Cast — fish drawings (Practice addendum §5.3, §8.2). Every fish is
 * original code-drawn pixel art, built from its own side-view description
 * (content: src/content/fishing/10_fish.js `art`): a body profile, the fins it
 * has and where, its mouth, eye and barbels, and its markings. Different fish
 * differ in outline and fins, not only in colour (tests compare silhouettes).
 *
 * The renderer writes into a plain RGBA buffer, so it runs (and is tested) in
 * node; the browser turns a buffer into a canvas.
 *
 *   RB.fishArt.render(def, o) -> { w, h, data, mask, eye, mouth }
 *        o: { len (body length in art px), view: 'plate'|'side'|'silhouette'|'blank',
 *             bend (-1..1, a flex for landing), alpha (0..1), facing: 'left'|'right' }
 *   RB.fishArt.canvas(def, o) -> canvas (browser), cached by species and options
 *   RB.fishArt.blank(o) -> the same non-spoiling outline for every unseen entry
 *   RB.fishArt.iou(a, b) -> silhouette overlap of two renders (tests) */
var RB = (globalThis.RB = globalThis.RB || {});

RB.fishArt = (function () {
  'use strict';
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const hexRgb = (h) => { const n = parseInt(String(h).slice(1, 7), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const mixC = (a, b, k) => [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * k));
  const lighten = (c, k) => mixC(c, [255, 250, 236], k);
  const darken = (c, k) => mixC(c, [18, 20, 40], k);
  // deterministic hash for markings
  const hh = (a, b, c) => { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0); };

  // smooth interpolation through [t, value] points
  function curve(pts, t) {
    if (t <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) {
      if (t <= pts[i][0]) {
        const a = pts[i - 1], b = pts[i], k = (t - a[0]) / (b[0] - a[0] || 1);
        const e = k * k * (3 - 2 * k);
        return a[1] + (b[1] - a[1]) * e;
      }
    }
    return pts[pts.length - 1][1];
  }
  function Buf(w, h) {
    this.w = w; this.h = h;
    this.data = new Uint8ClampedArray(w * h * 4);
    this.grp = new Int8Array(w * h).fill(-1); // 0 body, 1 fin, 2 eye/outline features
  }
  Buf.prototype.set = function (x, y, c, a, grp) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    this.data[i] = c[0]; this.data[i + 1] = c[1]; this.data[i + 2] = c[2]; this.data[i + 3] = Math.round(255 * (a == null ? 1 : a));
    if (grp != null) this.grp[y * this.w + x] = grp;
  };
  Buf.prototype.get = function (x, y) { return x < 0 || y < 0 || x >= this.w || y >= this.h ? -1 : this.grp[y * this.w + x]; };

  // polygon fill (even-odd, pixel centres)
  function fillPoly(B, pts, fn) {
    let y0 = Infinity, y1 = -Infinity;
    for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      const xs = [];
      const yc = y + 0.5;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + ((yc - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
      }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.ceil(xs[k] - 0.5); x <= Math.floor(xs[k + 1] - 0.5); x++) fn(x, y);
    }
  }

  // ---- one fish ------------------------------------------------------------------------------------------
  function render(def, o) {
    o = o || {};
    const A = (def && def.art) || {};
    const L = Math.max(8, Math.round(o.len || A.len || 64));
    const view = o.view || 'plate';
    const prof = A.profile || [[0, 0.04, 0.04], [0.3, 0.16, 0.14], [1, 0.04, 0.04]];
    const tail = A.tail || { len: 0.2, spread: 0.18, fork: 0.5 };
    const maxH = Math.max(...prof.map((p) => Math.max(p[1], p[2])));
    const finH = Math.max(0, ...(A.dorsal || []).map((d) => d.h || 0), ...(A.anal ? [A.anal.h || 0] : [0]));
    const padX = 3, padY = 3;
    const W = Math.ceil(L * (1 + tail.len + 0.04)) + padX * 2;
    const H = Math.ceil(L * (Math.max(maxH, tail.spread) * 2 + finH * 2 + 0.1)) + padY * 2;
    const B = new Buf(W, H);
    const midY = Math.round(padY + L * (Math.max(maxH, tail.spread) + finH) + 0.5);
    const bend = clamp(o.bend || 0, -1, 1);
    // fish coordinates (t along the body from the snout, v up from the midline in units of L) -> pixels
    const off = (t) => bend * L * 0.12 * Math.sin(clamp(t, 0, 1.3) * Math.PI * 0.9) * (t > 0.35 ? (t - 0.35) * 1.6 : 0);
    const P = (t, v) => [padX + t * L, midY - v * L + off(t)];
    const top = (t) => curve(prof.map((p) => [p[0], p[1]]), t);
    const bot = (t) => curve(prof.map((p) => [p[0], p[2]]), t);
    const C = (k) => hexRgb((A.col && A.col[k]) || '#888888');
    const back = C('back'), flank = C('flank'), belly = C('belly'), fin = C('fin'), line = darken(C('back'), 0.55);
    const sil = view === 'silhouette' || view === 'blank';
    const silCol = view === 'blank' ? [150, 138, 112] : [26, 40, 52];
    const silA = view === 'blank' ? 0.55 : (o.alpha == null ? 0.55 : o.alpha);
    const finColAt = (k) => (sil ? silCol : k ? mixC(fin, [255, 255, 255], 0.15) : fin);
    const finA = sil ? silA : 0.92;

    // fins first (the body is drawn over their roots)
    const finPoly = (pts, rays) => {
      const px = pts.map((p) => P(p[0], p[1]));
      fillPoly(B, px, (x, y) => { if (B.get(x, y) < 0) B.set(x, y, finColAt(((x + y) & 3) === 0), finA, 1); });
      if (!sil && rays) {
        // rays: short darker lines from the base outward
        const base = rays.base, n = rays.n || 4;
        for (let i = 0; i < n; i++) {
          const k = (i + 0.5) / n;
          const a = P(base[0][0] + (base[1][0] - base[0][0]) * k, base[0][1] + (base[1][1] - base[0][1]) * k);
          const tip = rays.tip(k);
          const b = P(tip[0], tip[1]);
          const steps = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1])));
          for (let s = 0; s <= steps * 0.8; s++) { const x = a[0] + ((b[0] - a[0]) * s) / steps, y = a[1] + ((b[1] - a[1]) * s) / steps; if (B.get(Math.round(x), Math.round(y)) === 1) B.set(x, y, darken(fin, 0.28), 0.95, 1); }
        }
      }
    };
    // caudal fin
    {
      const t0 = 1, ty = tail.len, sp = tail.spread, fk = tail.fork || 0, shape = tail.shape || 'fork';
      const vt = top(1), vb = bot(1);
      let pts;
      if (shape === 'round') pts = [[t0 - 0.02, vt], [t0 + ty * 0.5, sp * 0.95], [t0 + ty, sp * 0.45], [t0 + ty * 1.05, 0], [t0 + ty, -sp * 0.45], [t0 + ty * 0.5, -sp * 0.95], [t0 - 0.02, -vb]];
      else if (shape === 'truncate') pts = [[t0 - 0.02, vt], [t0 + ty, sp], [t0 + ty * (1 - fk * 0.25), 0], [t0 + ty, -sp], [t0 - 0.02, -vb]];
      else pts = [[t0 - 0.02, vt], [t0 + ty, sp], [t0 + ty * (1 - fk), 0], [t0 + ty, -sp], [t0 - 0.02, -vb]];
      finPoly(pts, { base: [[t0, vt], [t0, -vb]], n: 6, tip: (k) => [t0 + ty * (shape === 'round' ? 1 : 1 - fk * (1 - Math.abs(k - 0.5) * 2) * 0.9), (1 - 2 * k) * sp * 0.92] });
    }
    // dorsal fins
    for (const d of A.dorsal || []) {
      const t0 = d.at, t1 = d.at + d.len, h = d.h;
      const v0 = top(t0), v1 = top(t1);
      let pts;
      if (d.shape === 'round') pts = [[t0, v0 - 0.005], [t0 + d.len * 0.2, v0 + h * 0.85], [t0 + d.len * 0.6, v0 + h], [t1, v1 + h * 0.45], [t1 + d.len * 0.08, v1 - 0.005]];
      else if (d.shape === 'long') pts = [[t0, v0 - 0.005], [t0 + d.len * 0.12, v0 + h], [t1 - d.len * 0.1, v1 + h * 0.7], [t1 + 0.01, v1 - 0.005]];
      else if (d.shape === 'spiny') pts = [[t0, v0 - 0.005], [t0 + d.len * 0.25, v0 + h], [t0 + d.len * 0.5, v0 + h * 0.7], [t0 + d.len * 0.75, v0 + h * 0.85], [t1, v1 + h * 0.2], [t1 + 0.005, v1 - 0.005]];
      else pts = [[t0, v0 - 0.005], [t0 + d.len * 0.3, v0 + h], [t1 + d.len * 0.25, v1 + h * 0.2], [t1, v1 - 0.005]];
      finPoly(pts, { base: [[t0, v0], [t1, v1]], n: Math.max(3, Math.round(d.len * 30)), tip: (k) => [t0 + d.len * (k + 0.12), (d.shape === 'long' ? h * 0.85 : h * (1 - k * 0.6)) + top(t0 + d.len * k)] });
    }
    // anal fin
    if (A.anal) {
      const d = A.anal, t0 = d.at, t1 = d.at + d.len, h = d.h;
      const v0 = -bot(t0), v1 = -bot(t1);
      const pts = d.shape === 'long' ? [[t0, v0 + 0.005], [t0 + d.len * 0.15, v0 - h], [t1 - d.len * 0.05, v1 - h * 0.6], [t1, v1 + 0.005]]
        : [[t0, v0 + 0.005], [t0 + d.len * 0.3, v0 - h], [t1 + d.len * 0.3, v1 - h * 0.35], [t1, v1 + 0.005]];
      finPoly(pts, { base: [[t0, v0], [t1, v1]], n: Math.max(3, Math.round(d.len * 30)), tip: (k) => [t0 + d.len * (k + 0.15), -bot(t0 + d.len * k) - h * (1 - k * 0.55)] });
    }
    // pelvic fins (or a goby's sucker disc)
    if (A.pelvic) {
      const d = A.pelvic, t0 = d.at, v0 = -bot(t0);
      const pts = d.disc ? [[t0 - 0.02, v0 + 0.01], [t0 + d.len * 0.1, v0 - d.h], [t0 + d.len, v0 - d.h * 0.9], [t0 + d.len + 0.02, v0 + 0.01]]
        : [[t0, v0 + 0.005], [t0 + d.len * 0.8, v0 - d.h], [t0 + d.len, v0 - d.h * 0.7], [t0 + d.len * 0.4, v0 + 0.005]];
      finPoly(pts, null);
    }

    // body
    const x0 = padX, x1 = padX + L;
    for (let x = x0; x <= x1; x++) {
      const t = (x - padX) / L;
      const vt = top(t), vb = bot(t);
      const yT = midY - vt * L + off(t), yB = midY + vb * L + off(t);
      for (let y = Math.ceil(yT - 0.25); y <= Math.floor(yB + 0.25); y++) {
        if (sil) { B.set(x, y, silCol, silA, 0); continue; }
        const v = (y - yT) / Math.max(1, yB - yT); // 0 at the back, 1 at the belly
        let c = v < 0.36 ? back : v < 0.72 ? flank : belly;
        // a soft dithered seam between the bands
        if (Math.abs(v - 0.36) < 0.05 && ((x + y) & 1)) c = mixC(back, flank, 0.5);
        if (Math.abs(v - 0.72) < 0.05 && ((x + y) & 1)) c = mixC(flank, belly, 0.5);
        // light from above: the back's top edge brighter, the belly's lower edge darker
        if (v < 0.12) c = lighten(c, 0.18);
        if (v > 0.9) c = darken(c, 0.12);
        c = markings(A, t, v, x, y, c);
        B.set(x, y, c, 1, 0);
      }
    }
    if (!sil) {
      // gill cover: a curved darker line behind the head
      const g = A.gill || 0.22;
      for (let v = -bot(g) * 0.85; v <= top(g) * 0.85; v += 1 / L) {
        const t = g + 0.025 * Math.cos((v / (top(g) + 0.01)) * 1.2);
        const p = P(t, v);
        if (B.get(Math.round(p[0]), Math.round(p[1])) === 0) B.set(p[0], p[1], darken(flank, 0.3), 1, 2);
      }
      if (A.mark && A.mark.opercle) { const p = P(g + 0.01, top(g) * 0.4); for (let dx = 0; dx < 2; dx++) for (let dy = 0; dy < 2; dy++) B.set(p[0] + dx, p[1] + dy, hexRgb(A.mark.opercle), 1, 2); }
      // pectoral fin, laid on the body
      if (A.pectoral) {
        const d = A.pectoral, t0 = d.at;
        const pts = [[t0, -bot(t0) * 0.15], [t0 + d.len, -bot(t0) * 0.15 - d.h * 0.5], [t0 + d.len * 0.85, -bot(t0) * 0.15 - d.h], [t0 + 0.01, -bot(t0) * 0.3]];
        fillPoly(B, pts.map((p) => P(p[0], p[1])), (x, y) => { if (B.get(x, y) === 0) B.set(x, y, mixC(fin, flank, 0.3), 1, 2); });
      }
    }
    // eye
    const eyeT = (A.eye && A.eye.at) || 0.1, eyeV = (A.eye && A.eye.v != null ? A.eye.v : 0.3) * top(eyeT);
    const er = Math.max(1, Math.round(((A.eye && A.eye.r) || 0.035) * L));
    const ep = P(eyeT, eyeV);
    if (!sil) {
      for (let dx = -er; dx <= er; dx++) for (let dy = -er; dy <= er; dy++) {
        if (dx * dx + dy * dy > er * er + 0.5) continue;
        B.set(ep[0] + dx, ep[1] + dy, dx * dx + dy * dy >= er * er - 1 ? [236, 228, 196] : [16, 14, 20], 1, 2);
      }
      if (er >= 2) B.set(ep[0] - 1, ep[1] - 1, [255, 255, 250], 1, 2);
    }
    // mouth and barbels
    const mt = A.mouth || 'terminal';
    const mp = mt === 'up' ? P(0.005, top(0) * 0.7) : mt === 'sub' ? P(0.03, -bot(0.03) * 0.6) : P(0, 0);
    if (!sil) {
      const len = Math.max(1, Math.round(L * ((A.mouthLen || 0.05))));
      for (let i = 0; i < len; i++) B.set(mp[0] + i, mp[1] + (mt === 'up' ? i * 0.5 : 0), darken(flank, 0.5), 1, 2);
    }
    for (let b = 0; b < (A.barbels || 0); b++) {
      const bl = Math.max(2, Math.round(L * (b === 0 ? 0.07 : 0.045)));
      for (let i = 0; i < bl; i++) B.set(mp[0] + 1 + b * 2 - i * 0.3, mp[1] + 1 + i, sil ? silCol : darken(flank, 0.35), sil ? silA : 1, 2);
    }
    // a selective outline: a darker edge where the fish meets the background
    if (!sil) {
      const out = [];
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (B.get(x, y) >= 0) continue;
        const n = [B.get(x - 1, y), B.get(x + 1, y), B.get(x, y - 1), B.get(x, y + 1)];
        if (n.some((g) => g === 0)) out.push([x, y, 0]); else if (n.some((g) => g === 1)) out.push([x, y, 1]);
      }
      for (const [x, y, g] of out) B.set(x, y, g === 0 ? line : darken(fin, 0.45), g === 0 ? 1 : 0.75, 3);
    }
    // mirror for a fish facing right
    if (o.facing === 'right') {
      const d = B.data, gr = B.grp;
      for (let y = 0; y < H; y++) for (let x = 0; x < W / 2; x++) {
        const a = (y * W + x) * 4, b = (y * W + (W - 1 - x)) * 4;
        for (let k = 0; k < 4; k++) { const t = d[a + k]; d[a + k] = d[b + k]; d[b + k] = t; }
        const ga = y * W + x, gb = y * W + (W - 1 - x), tg = gr[ga]; gr[ga] = gr[gb]; gr[gb] = tg;
      }
    }
    const mask = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) mask[i] = B.data[i * 4 + 3] > 40 ? 1 : 0;
    const fx = (p) => (o.facing === 'right' ? W - 1 - p[0] : p[0]);
    return { w: W, h: H, data: B.data, mask, eye: { x: fx(ep), y: ep[1] }, mouth: { x: fx(mp), y: mp[1] }, mid: midY, len: L };
  }
  // markings painted on the body: bars, bands, stripes, spots, scutes, scales, mottling, lateral line
  function markings(A, t, v, x, y, c) {
    const M = A.mark || {};
    const col = (h) => hexRgb(h);
    if (M.scales && ((x * 3 + y * 2) % 7 === 0) && v > 0.15 && v < 0.85) c = darken(c, 0.14);
    if (M.mottle && v < 0.75) { const h = hh(Math.floor(x / 3), Math.floor(y / 2), 7) % 11; if (h < 3) c = mixC(c, col(M.mottle), 0.6); }
    if (M.spots) for (const sp of M.spots) { const h = hh(Math.floor(x / 2), Math.floor(y / 2), sp.seed || 3) % 100; if (t > (sp.t0 || 0.1) && t < (sp.t1 || 0.95) && v > (sp.v0 || 0) && v < (sp.v1 || 0.6) && h < (sp.p || 9)) c = col(sp.col); }
    if (M.bars) {
      const b = M.bars, span = b.t1 - b.t0;
      if (t > b.t0 && t < b.t1 && v > (b.v0 || 0.05) && v < (b.v1 || 0.8)) {
        const k = ((t - b.t0) / span) * b.n;
        const fr = k - Math.floor(k);
        if (fr < (b.w || 0.45)) c = mixC(c, col(Math.floor(k) % 2 && b.alt ? b.alt : b.col), b.k || 0.75);
      }
    }
    if (M.band) {
      const b = M.band;
      if (t > b.t0 && t < b.t1 && Math.abs(v - b.v) < b.hw * (t < b.t0 + 0.1 ? (t - b.t0) / 0.1 : 1)) c = mixC(c, col(b.col), b.k || 0.8);
    }
    if (M.stripes) for (const s of M.stripes) if (t > s.t0 && t < s.t1 && Math.abs(v - s.v) < s.hw) c = mixC(c, col(s.col), s.k || 0.7);
    if (M.lateral && Math.abs(v - M.lateral.v - (M.lateral.arc || 0) * Math.sin(t * Math.PI) * -1) < 0.03 && t > 0.2 && t < 0.98) c = mixC(c, col(M.lateral.col), 0.75);
    if (M.scutes) {
      const s = M.scutes;
      // the line runs high behind the head, then drops to the middle and runs straight to the tail
      const k = clamp((t - s.t0) / 0.35, 0, 1);
      const vl = s.v - (s.arc || 0) * (1 - Math.sin(k * Math.PI / 2));
      if (t > s.t0 && t < s.t1 && Math.abs(v - vl) < 0.045) c = ((x & 1) ? lighten(c, 0.35) : darken(c, 0.25));
    }
    return c;
  }
  // The same plain outline for every fish not yet seen (non-spoiling).
  const BLANK = { art: { len: 64, profile: [[0, 0.05, 0.05], [0.3, 0.15, 0.13], [0.7, 0.11, 0.09], [1, 0.045, 0.045]], tail: { len: 0.2, spread: 0.15, fork: 0.35 }, dorsal: [{ at: 0.4, len: 0.16, h: 0.08 }], anal: { at: 0.62, len: 0.12, h: 0.06 }, col: {} } };
  const blank = (o) => render(BLANK, Object.assign({}, o || {}, { view: 'blank' }));

  // silhouette overlap (intersection over union) of two renders, aligned at the snout and midline
  function iou(a, b) {
    let inter = 0, uni = 0;
    const W = Math.max(a.w, b.w), H = Math.max(a.h, b.h);
    const oa = Math.round(H / 2 - a.mid), ob = Math.round(H / 2 - b.mid);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const ya = y - oa, yb = y - ob;
      const ma = x < a.w && ya >= 0 && ya < a.h ? a.mask[ya * a.w + x] : 0;
      const mb = x < b.w && yb >= 0 && yb < b.h ? b.mask[yb * b.w + x] : 0;
      if (ma || mb) uni++;
      if (ma && mb) inter++;
    }
    return uni ? inter / uni : 0;
  }

  // ---- browser canvases (cached) -----------------------------------------------------------------------------
  const cache = new Map();
  function toCanvas(r) {
    const cv = document.createElement('canvas');
    cv.width = r.w; cv.height = r.h;
    const g = cv.getContext('2d');
    const img = g.createImageData(r.w, r.h);
    img.data.set(r.data);
    g.putImageData(img, 0, 0);
    cv._fish = { eye: r.eye, mouth: r.mouth, mid: r.mid, len: r.len, w: r.w, h: r.h };
    return cv;
  }
  function canvas(def, o) {
    o = o || {};
    const key = (def ? def.id : '?') + '|' + JSON.stringify(o);
    let cv = cache.get(key);
    if (cv) return cv;
    cv = toCanvas(def ? render(def, o) : blank(o));
    cache.set(key, cv);
    while (cache.size > 240) cache.delete(cache.keys().next().value);
    return cv;
  }
  function blankCanvas(o) { return canvas(null, o); }

  return { render, blank, iou, canvas, blankCanvas, toCanvas, cacheSize: () => cache.size };
})();
