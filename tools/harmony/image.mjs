// RGBA8 image helpers for the Harmony importer's reports (node, no dependencies): blank images, pixel access,
// nearest-neighbour blits and enlargement, rectangles and lines, and a 5 × 7 bitmap font for the labels on
// evidence sheets (sheets are evidence, never art: nothing here is used on an asset).
export const blank = (w, h, fill) => {
  const img = { w, h, data: new Uint8Array(w * h * 4) };
  if (fill) { const c = rgba(fill); for (let i = 0; i < w * h; i++) img.data.set(c, 4 * i); }
  return img;
};
export function rgba(c) {
  if (Array.isArray(c)) return [c[0], c[1], c[2], c[3] == null ? 255 : c[3]];
  const s = String(c).replace('#', '');
  const n = parseInt(s.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, s.length >= 8 ? parseInt(s.slice(6, 8), 16) : 255];
}
export const hex = (r, g, b) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
export const px = (img, x, y) => { const o = (y * img.w + x) * 4; return [img.data[o], img.data[o + 1], img.data[o + 2], img.data[o + 3]]; };
export function put(img, x, y, c) {
  if (x < 0 || y < 0 || x >= img.w || y >= img.h) return;
  const o = (y * img.w + x) * 4, a = c[3] == null ? 255 : c[3];
  if (a >= 255) { img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2]; img.data[o + 3] = 255; return; }
  if (!a) return;
  const k = a / 255, da = img.data[o + 3] / 255, oa = k + da * (1 - k);
  for (let i = 0; i < 3; i++) img.data[o + i] = Math.round((c[i] * k + img.data[o + i] * da * (1 - k)) / (oa || 1));
  img.data[o + 3] = Math.round(oa * 255);
}
// draw src over dst at (dx, dy), each pixel as an s × s block (alpha over)
export function blit(dst, src, dx, dy, s = 1) {
  for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
    const o = (y * src.w + x) * 4;
    if (!src.data[o + 3]) continue;
    const c = [src.data[o], src.data[o + 1], src.data[o + 2], src.data[o + 3]];
    for (let j = 0; j < s; j++) for (let i = 0; i < s; i++) put(dst, dx + x * s + i, dy + y * s + j, c);
  }
}
export function enlarge(src, s) { const d = blank(src.w * s, src.h * s); blit(d, src, 0, 0, s); return d; }
export function rect(img, x0, y0, x1, y1, c, fill) {
  c = rgba(c);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (fill || y === y0 || y === y1 - 1 || x === x0 || x === x1 - 1) put(img, x, y, c);
}
export function line(img, x0, y0, x1, y1, c, dash) {
  c = rgba(c);
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= n; i++) { if (dash && Math.floor(i / dash) % 2) continue; put(img, Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), c); }
}

// 5 × 7 font: each glyph is 7 rows, bit 4 the leftmost column. Lower case is drawn as upper case.
const G = {
  A: [14, 17, 17, 31, 17, 17, 17], B: [30, 17, 17, 30, 17, 17, 30], C: [14, 17, 16, 16, 16, 17, 14], D: [30, 17, 17, 17, 17, 17, 30],
  E: [31, 16, 16, 30, 16, 16, 31], F: [31, 16, 16, 30, 16, 16, 16], G: [14, 17, 16, 23, 17, 17, 15], H: [17, 17, 17, 31, 17, 17, 17],
  I: [14, 4, 4, 4, 4, 4, 14], J: [7, 2, 2, 2, 2, 18, 12], K: [17, 18, 20, 24, 20, 18, 17], L: [16, 16, 16, 16, 16, 16, 31],
  M: [17, 27, 21, 21, 17, 17, 17], N: [17, 17, 25, 21, 19, 17, 17], O: [14, 17, 17, 17, 17, 17, 14], P: [30, 17, 17, 30, 16, 16, 16],
  Q: [14, 17, 17, 17, 21, 18, 13], R: [30, 17, 17, 30, 20, 18, 17], S: [15, 16, 16, 14, 1, 1, 30], T: [31, 4, 4, 4, 4, 4, 4],
  U: [17, 17, 17, 17, 17, 17, 14], V: [17, 17, 17, 17, 17, 10, 4], W: [17, 17, 17, 21, 21, 21, 10], X: [17, 17, 10, 4, 10, 17, 17],
  Y: [17, 17, 10, 4, 4, 4, 4], Z: [31, 1, 2, 4, 8, 16, 31],
  0: [14, 17, 19, 21, 25, 17, 14], 1: [4, 12, 4, 4, 4, 4, 14], 2: [14, 17, 1, 2, 4, 8, 31], 3: [31, 2, 4, 2, 1, 17, 14], 4: [2, 6, 10, 18, 31, 2, 2],
  5: [31, 16, 30, 1, 1, 17, 14], 6: [6, 8, 16, 30, 17, 17, 14], 7: [31, 1, 2, 4, 8, 8, 8], 8: [14, 17, 17, 14, 17, 17, 14], 9: [14, 17, 17, 15, 1, 2, 12],
  ' ': [0, 0, 0, 0, 0, 0, 0], '-': [0, 0, 0, 31, 0, 0, 0], '—': [0, 0, 0, 31, 0, 0, 0], _: [0, 0, 0, 0, 0, 0, 31], '.': [0, 0, 0, 0, 0, 12, 12],
  ':': [0, 12, 12, 0, 12, 12, 0], '/': [1, 1, 2, 4, 8, 16, 16], '(': [2, 4, 8, 8, 8, 4, 2], ')': [8, 4, 2, 2, 2, 4, 8], ',': [0, 0, 0, 0, 12, 4, 8],
  '%': [24, 25, 2, 4, 8, 19, 3], '×': [0, 17, 10, 4, 10, 17, 0], '+': [0, 4, 4, 31, 4, 4, 0], '=': [0, 0, 31, 0, 31, 0, 0], '#': [10, 10, 31, 10, 31, 10, 10],
  "'": [4, 4, 8, 0, 0, 0, 0], '[': [14, 8, 8, 8, 8, 8, 14], ']': [14, 2, 2, 2, 2, 2, 14], '>': [8, 4, 2, 1, 2, 4, 8], '<': [2, 4, 8, 16, 8, 4, 2], '|': [4, 4, 4, 4, 4, 4, 4],
  '?': [14, 17, 1, 2, 4, 0, 4], '!': [4, 4, 4, 4, 4, 0, 4], '→': [0, 4, 2, 31, 2, 4, 0],
};
export const textWidth = (s, sc = 1) => [...String(s)].length * 6 * sc;
export function text(img, s, x, y, c, sc = 1) {
  c = rgba(c);
  let cx = x;
  for (const ch of String(s)) {
    const g = G[ch] || G[ch.toUpperCase()] || G['?'];
    for (let r = 0; r < 7; r++) for (let b = 0; b < 5; b++) if (g[r] & (16 >> b)) for (let j = 0; j < sc; j++) for (let i = 0; i < sc; i++) put(img, cx + b * sc + i, y + r * sc + j, c);
    cx += 6 * sc;
  }
  return cx;
}
