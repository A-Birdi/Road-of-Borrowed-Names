// Pixel-grid detection and normalisation for delivered pixel art (docs/harmony/contract/CONTRACT.md §9).
// An image tool returns the art enlarged by a whole or fractional factor (4× = 768 × 640; a 1024 square holding
// the 192 × 160 canvas at 5.333×), sometimes with a soft cell edge. The grid is found from where colours change:
// along each axis, the edge weight at every pixel boundary, then for each candidate cell size the phase that
// puts most of that weight within half a pixel of a grid line. A grid's halves and thirds fit the same edges,
// so the LARGEST size scoring within 10 % of the best wins; a fine search then takes the middle of the plateau.
import { blank } from './image.mjs';

const ALPHA = 128;
const dist2 = (d, a, b) => { const r = d[a] - d[b], g = d[a + 1] - d[b + 1], bl = d[a + 2] - d[b + 2]; return r * r + g * g + bl * bl; };
function differs(d, a, b) {
  const oa = d[a + 3] >= ALPHA, ob = d[b + 3] >= ALPHA;
  if (oa !== ob) return true;
  if (!oa) return false;
  return dist2(d, a, b) > 1600; // more than 40 apart (a tool's noise inside a cell is ignored)
}
// edge weight at each boundary k (between line k − 1 and k) along an axis
export function edgeProfile(img, axis) {
  const { w, h, data } = img;
  const n = axis === 'x' ? w : h, m = axis === 'x' ? h : w;
  const E = new Float64Array(n);
  for (let k = 1; k < n; k++) {
    let s = 0;
    for (let j = 0; j < m; j++) {
      const a = axis === 'x' ? (j * w + k - 1) * 4 : ((k - 1) * w + j) * 4;
      const b = axis === 'x' ? (j * w + k) * 4 : (k * w + j) * 4;
      if (differs(data, a, b)) s++;
    }
    E[k] = s;
  }
  return E;
}
const tol = (c) => (c >= 3 ? 0.8 : 0.44);
// the share of edge weight within ±tol px of a grid of size c, at its best phase
function scoreAt(E, total, c) {
  const NB = Math.max(32, Math.ceil(c * 16));
  const bins = new Float64Array(NB);
  for (let k = 1; k < E.length; k++) if (E[k]) bins[Math.min(NB - 1, Math.floor(((k % c) / c) * NB))] += E[k];
  // strictly less than ±0.5 px for small cells (one integer position per window: a 2 px grid on a native image
  // scores ½); ±0.8 px from 3 px cells up, so both halves of a soft (blended) cell edge count; never the whole
  // cell (a window round the full circle would count an edge twice)
  const win = Math.max(0, Math.min(Math.floor((NB - 1) / 2), Math.round((tol(c) / c) * NB)));
  let s = 0;
  for (let i = -win; i <= win; i++) s += bins[(i + NB) % NB];
  let best = s, bo = 0;
  for (let b = 1; b < NB; b++) {
    s += bins[(b + win) % NB] - bins[(b - win - 1 + NB) % NB];
    if (s > best + 1e-9) { best = s; bo = b; }
  }
  // the phase: the weighted mean of the edges inside the best window
  const oc = ((bo + 0.5) / NB) * c, half = ((win + 0.5) / NB) * c;
  let sw = 0, sd = 0;
  for (let k = 1; k < E.length; k++) {
    if (!E[k]) continue;
    const dl = ((((k - oc) % c) + c * 1.5) % c) - c / 2;
    if (Math.abs(dl) <= half) { sw += E[k]; sd += E[k] * dl; }
  }
  const o = ((oc + (sw ? sd / sw : 0)) % c + c) % c;
  // against chance: a window covering a share f of the cell catches f of randomly placed edges
  const f = (2 * win + 1) / NB, raw = best / total;
  return { score: f >= 1 ? 0 : Math.max(0, (raw - f) / (1 - f)), raw, o };
}
export function detectAxis(E, n, opt = {}) {
  let total = 0;
  for (const v of E) total += v;
  if (!total) return { c: 1, o: 0, score: 0, flat: true };
  // an exact whole multiple of the contract's canvas is tried first (1: the file is native size)
  if (opt.canvas && n % opt.canvas === 0) {
    const k = n / opt.canvas;
    if (k === 1) return { c: 1, o: 0, score: 1, prior: true };
    const s = scoreAt(E, total, k);
    if (s.score >= 0.85) return { c: k, o: Math.abs(s.o - Math.round(s.o)) < 0.02 ? Math.round(s.o) % k : s.o, score: s.score, prior: true };
  }
  const cMax = Math.max(1.5, Math.min(opt.cMax || 24, n / 8));
  // steps small enough that the grid drifts at most 0.2 px across the image; an enlargement under 1.5× is not
  // a plausible delivery, and below that the half-pixel test cannot tell a grid from chance
  const stepAt = (c) => Math.min(0.01, Math.max(0.0002, (0.2 * c) / n));
  const coarse = [];
  for (let c = 1.5; c <= cMax + 1e-9; c += stepAt(c)) coarse.push({ c, ...scoreAt(E, total, c) });
  const max = Math.max(...coarse.map((s) => s.score));
  if (max < 0.5) return { c: 1, o: 0, score: 0, noGrid: true };
  let pick = coarse[0];
  for (const s of coarse) if (s.score >= 0.9 * max) pick = s;
  // fine search around the pick; the middle of the best plateau
  const fine = [], st = stepAt(pick.c);
  for (let c = Math.max(1, pick.c - 3 * st); c <= pick.c + 3 * st; c += st / 8) fine.push({ c, ...scoreAt(E, total, c) });
  const fmax = Math.max(...fine.map((s) => s.score));
  const plateau = fine.filter((s) => s.score >= fmax - 1e-6);
  const mid = plateau[Math.floor(plateau.length / 2)];
  // least squares: each edge near a grid line is that line (x ≈ o + k·c), twice
  let c = mid.c, o = mid.o;
  for (let it = 0; it < 2; it++) {
    let sw = 0, sk = 0, sx = 0, skk = 0, skx = 0;
    for (let x = 1; x < E.length; x++) {
      if (!E[x]) continue;
      const k = Math.round((x - o) / c);
      if (Math.abs(x - (o + k * c)) > tol(c) + 0.06) continue;
      const w = E[x];
      sw += w; sk += w * k; sx += w * x; skk += w * k * k; skx += w * k * x;
    }
    const den = sw * skk - sk * sk;
    if (!sw || Math.abs(den) < 1e-9) break;
    c = (sw * skx - sk * sx) / den;
    o = (sx - c * sk) / sw;
  }
  if (Math.abs(c - Math.round(c)) < 0.002) c = Math.round(c); // a whole size when it is one
  o = ((o % c) + c) % c;
  if (Math.abs(o - Math.round(o)) < 0.02) o = Math.round(o) % c;
  return { c, o, score: scoreAt(E, total, c).score };
}
// The grid of an image: { x: { c, o, i0, n }, y: { … }, score } — n cells along each axis, cell i0 the first
// whose centre lies inside the image. `force`: { cell, origin } from the batch settings.
export function detectGrid(img, force, canvas) {
  const E = {}, tot = {};
  const ax = (axis) => {
    const n = axis === 'x' ? img.w : img.h;
    if (force && force.cell) {
      const c = Array.isArray(force.cell) ? force.cell[axis === 'x' ? 0 : 1] : force.cell;
      const o = force.origin ? force.origin[axis === 'x' ? 0 : 1] : 0;
      return { c, o: ((o % c) + c) % c, score: null, forced: true };
    }
    E[axis] = edgeProfile(img, axis);
    tot[axis] = E[axis].reduce((a, b) => a + b, 0);
    return detectAxis(E[axis], n, { canvas: canvas ? (axis === 'x' ? canvas.w : canvas.h) : null });
  };
  let x = ax('x'), y = ax('y');
  // pixels are square: when the axes disagree, try each axis's size on the other; of the sizes that fit both axes
  // (each scoring ≥ 0.5), the larger wins (a grid's thirds fit as well as the grid)
  if (!x.forced && Math.abs(x.c - y.c) / Math.max(x.c, y.c) >= 0.01 && tot.x && tot.y) {
    const at = (axis, c) => { const s = scoreAt(E[axis], tot[axis], c); return { c, o: s.o, score: s.score }; };
    const pairs = [{ x: at('x', y.c), y }, { x, y: at('y', x.c) }].filter((p) => Math.min(p.x.score, p.y.score) >= 0.5);
    const best = pairs.sort((a, b) => b.x.c - a.x.c)[0];
    if (best) { x = Object.assign(best.x, { reconciled: true }); y = Object.assign(best.y, { reconciled: true }); }
  }
  const fin = (g, n) => { const i0 = Math.ceil(-g.o / g.c - 0.5), i1 = Math.floor((n - g.o) / g.c - 0.5); return Object.assign(g, { i0, n: i1 - i0 + 1 }); };
  x = fin(x, img.w); y = fin(y, img.h);
  return { x, y, square: Math.abs(x.c - y.c) / Math.max(x.c, y.c) < 0.01 };
}
// One native pixel per cell: the majority colour of the cell's centre region (the middle half), alpha binarised
// first (transparent pixels count as one value); a tie goes to the pixel nearest the centre.
export function downsample(img, grid) {
  const { x: gx, y: gy } = grid, out = blank(gx.n, gy.n), d = img.data;
  const range = (g, i, n) => {
    const a = g.o + (g.i0 + i + 0.25) * g.c, b = g.o + (g.i0 + i + 0.75) * g.c, mid = g.o + (g.i0 + i + 0.5) * g.c;
    let p0 = Math.ceil(a - 0.5), p1 = Math.ceil(b - 0.5) - 1;
    if (p1 < p0) p0 = p1 = Math.floor(mid);
    return [Math.max(0, p0), Math.min(n - 1, p1), mid];
  };
  for (let j = 0; j < gy.n; j++) {
    const [y0, y1, my] = range(gy, j, img.h);
    for (let i = 0; i < gx.n; i++) {
      const [x0, x1, mx] = range(gx, i, img.w);
      const count = new Map();
      let best = 0, bestN = -1, bestD = Infinity;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const o = (y * img.w + x) * 4;
        const k = d[o + 3] < ALPHA ? 0 : (((d[o] << 16) | (d[o + 1] << 8) | d[o + 2]) | 0x1000000) >>> 0;
        const c = (count.get(k) || 0) + 1;
        count.set(k, c);
        const dd = (x + 0.5 - mx) ** 2 + (y + 0.5 - my) ** 2;
        if (c > bestN || (c === bestN && dd < bestD)) { best = k; bestN = c; bestD = dd; }
      }
      const o = (j * gx.n + i) * 4;
      // no repeated colour among several opaque pixels (a tool's noise): the per-channel median of them
      const area = (x1 - x0 + 1) * (y1 - y0 + 1);
      if (best && bestN === 1 && area > 2) {
        const ch = [[], [], []];
        for (const k of count.keys()) if (k) { ch[0].push((k >> 16) & 255); ch[1].push((k >> 8) & 255); ch[2].push(k & 255); }
        if (ch[0].length * 2 > area) { for (const a of ch) a.sort((p, q) => p - q); const m = ch[0].length >> 1; best = ((ch[0][m] << 16) | (ch[1][m] << 8) | ch[2][m] | 0x1000000) >>> 0; }
      }
      if (best) { out.data[o] = (best >> 16) & 255; out.data[o + 1] = (best >> 8) & 255; out.data[o + 2] = best & 255; out.data[o + 3] = 255; }
    }
  }
  return out;
}
// Alpha to 0 or 255 (transparent pixels become 0, 0, 0, 0).
export function binarize(img) {
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < ALPHA) d[i] = d[i + 1] = d[i + 2] = d[i + 3] = 0; else d[i + 3] = 255; }
  return img;
}
export const hasTransparency = (img) => { for (let i = 3; i < img.data.length; i += 4) if (img.data[i] < ALPHA) return true; return false; };
// A flat #ff00ff background (a tool that cannot write transparency): every pixel within 40 of it becomes
// transparent. 'auto' does it only for an opaque image whose four corners are that magenta.
export function keyMagenta(img, mode) {
  const d = img.data, near = (o) => Math.hypot(d[o] - 255, d[o + 1], d[o + 2] - 255) <= 40;
  if (mode !== 'magenta') {
    if (mode === 'alpha' || hasTransparency(img)) return 0;
    const corners = [0, (img.w - 1) * 4, (img.h - 1) * img.w * 4, (img.h * img.w - 1) * 4];
    if (!corners.every(near)) return 0;
  }
  let n = 0;
  for (let o = 0; o < d.length; o += 4) if (d[o + 3] && near(o)) { d[o] = d[o + 1] = d[o + 2] = d[o + 3] = 0; n++; }
  return n;
}
// A painted "transparency" checkerboard: an opaque image whose corner blocks hold exactly two light greys.
export function looksLikeCheckerboard(img) {
  if (hasTransparency(img)) return false;
  // corner blocks large enough to span two squares of any usual checker size
  const d = img.data, s = Math.min(Math.floor(Math.min(img.w, img.h) / 2), Math.max(24, Math.floor(Math.min(img.w, img.h) / 12)));
  for (const [cx, cy] of [[0, 0], [img.w - s, 0], [0, img.h - s], [img.w - s, img.h - s]]) {
    const cols = new Set();
    for (let y = cy; y < cy + s; y++) for (let x = cx; x < cx + s; x++) {
      const o = (y * img.w + x) * 4;
      const r = d[o], g = d[o + 1], b = d[o + 2];
      if (Math.max(r, g, b) - Math.min(r, g, b) > 12 || r < 140) return false;
      cols.add((r << 16) | (g << 8) | b);
      if (cols.size > 2) return false;
    }
    if (cols.size !== 2) return false;
  }
  return true;
}
// Place a native image on the canvas (W × H) at (dx, dy). Returns { img, outside: opaque pixels cut off }.
export function place(src, W, H, dx, dy) {
  const out = blank(W, H);
  let outside = 0;
  for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
    const o = (y * src.w + x) * 4;
    if (!src.data[o + 3]) continue;
    const X = x + dx, Y = y + dy;
    if (X < 0 || Y < 0 || X >= W || Y >= H) { outside++; continue; }
    out.data.set(src.data.subarray(o, o + 4), (Y * W + X) * 4);
  }
  return { img: out, outside };
}
