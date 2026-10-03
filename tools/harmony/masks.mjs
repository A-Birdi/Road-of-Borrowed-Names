// Material masks and shade indices for the player kit (docs/harmony/contract/CONTRACT.md §5).
// A pixel's code: 0 transparent, 1 fixed (keeps its painted colour), 2 + material × 5 + shade for a recolourable
// pixel (material in RB.harmonyContract.MATERIALS order, shade 0–4). The game reads the same codes from the
// mask image plus the normalised pixel (src/ui/88_harmony_raster.js).
import { blank, rgba } from './image.mjs';

const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
const d3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const codeOf = (mi, s) => 2 + mi * 5 + s;
export const matOf = (code) => (code >= 2 ? Math.floor((code - 2) / 5) : -1);
export const shadeOf = (code) => (code >= 2 ? (code - 2) % 5 : -1);

export function keyTable(HC) {
  const keys = [];
  HC.MATERIALS.forEach((m, mi) => HC.KEY_RAMPS[m].forEach((h, s) => { const c = rgba(h); keys.push({ m, mi, s, rgb: c.slice(0, 3), lum: lum(c[0], c[1], c[2]), hex: h }); }));
  const exact = new Map(keys.map((k) => [(k.rgb[0] << 16) | (k.rgb[1] << 8) | k.rgb[2], k]));
  const protect = HC.IMPORT.protect.map((h) => rgba(h).slice(0, 3));
  const mask = HC.MATERIALS.map((m) => rgba(HC.MASK[m]).slice(0, 3));
  return { keys, exact, protect, outline: rgba(HC.OUTLINE).slice(0, 3), mask, fixed: rgba(HC.MASK.fixed).slice(0, 3) };
}
// outline ink or a near-white highlight / eye white: never recoloured
export function isProtected(rgb, T, HC) {
  if (d3(rgb, T.outline) <= HC.IMPORT.outline) return true;
  for (let i = 1; i < T.protect.length; i++) if (d3(rgb, T.protect[i]) <= HC.IMPORT.white) return true;
  return false;
}
// the key shade of material mi nearest in luminance to rgb
function shadeByLum(rgb, mi, T) {
  const L = lum(rgb[0], rgb[1], rgb[2]);
  let best = 0, bd = Infinity;
  for (const k of T.keys) if (k.mi === mi) { const v = Math.abs(k.lum - L); if (v < bd) { bd = v; best = k.s; } }
  return best;
}

// Derive the mask of a kit file from its colours (mutates img: snapped pixels take exact key colours, outline
// ink within the outline radius becomes #140c18). allowed: material names this kind of file may contain.
export function deriveMask(img, allowed, HC) {
  const T = keyTable(HC), d = img.data, n = img.w * img.h;
  const codes = new Uint8Array(n), unresolved = [], counts = { transparent: 0, fixed: 0 };
  const allowedIdx = new Set(allowed.map((m) => HC.MATERIALS.indexOf(m)));
  let snappedOutline = 0, snappedKey = 0;
  for (let i = 0; i < n; i++) {
    const o = 4 * i;
    if (!d[o + 3]) { codes[i] = 0; counts.transparent++; continue; }
    const rgb = [d[o], d[o + 1], d[o + 2]];
    if (isProtected(rgb, T, HC)) {
      if (d3(rgb, T.outline) <= HC.IMPORT.outline && (rgb[0] !== T.outline[0] || rgb[1] !== T.outline[1] || rgb[2] !== T.outline[2])) { d.set(T.outline, o); snappedOutline++; }
      codes[i] = 1; counts.fixed++; continue;
    }
    // nearest key shade overall, and nearest among the allowed materials
    let near = null, nd = Infinity, nearA = null, ndA = Infinity;
    for (const k of T.keys) {
      const v = d3(rgb, k.rgb);
      if (v < nd) { nd = v; near = k; }
      if (allowedIdx.has(k.mi) && v < ndA) { ndA = v; nearA = k; }
    }
    if (nearA && ndA <= HC.IMPORT.snap) {
      codes[i] = codeOf(nearA.mi, nearA.s);
      counts[nearA.m] = (counts[nearA.m] || 0) + 1;
      if (ndA > 0) { d.set(nearA.rgb, o); snappedKey++; }
      continue;
    }
    const x = i % img.w, y = (i / img.w) | 0, hex = '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('');
    if (near && nd <= HC.IMPORT.snap && !allowedIdx.has(near.mi)) {
      unresolved.push({ x, y, colour: hex, why: 'a ' + near.m + ' key shade in a file that may not contain ' + near.m, near: near.hex, dist: +nd.toFixed(1) });
      codes[i] = 1; continue;
    }
    if (nearA && ndA <= HC.IMPORT.ambiguous) {
      unresolved.push({ x, y, colour: hex, why: 'between snap (' + HC.IMPORT.snap + ') and ambiguous (' + HC.IMPORT.ambiguous + ') of ' + nearA.m + ' s' + nearA.s, near: nearA.hex, dist: +ndA.toFixed(1) });
      codes[i] = 1; continue;
    }
    codes[i] = 1; counts.fixed++;
  }
  return { codes, unresolved, counts, snappedOutline, snappedKey };
}

// Read a supplied mask (already on the canvas): mask colours → materials; shades by luminance; the art's
// recolourable pixels are rewritten in their exact key colours. Errors: a mask pixel that is no mask colour, a
// transparent mask under an opaque pixel, a material this kind may not contain.
export function readMask(img, mask, allowed, HC) {
  const T = keyTable(HC), d = img.data, md = mask.data, n = img.w * img.h;
  const codes = new Uint8Array(n), errors = [], warnings = [], counts = { transparent: 0, fixed: 0 };
  const allowedIdx = new Set(allowed.map((m) => HC.MATERIALS.indexOf(m)));
  let forcedFixed = 0, maskOnClear = 0;
  for (let i = 0; i < n; i++) {
    const o = 4 * i, x = i % img.w, y = (i / img.w) | 0;
    const art = d[o + 3] > 0, mOpaque = md[o + 3] >= 128;
    if (!art) { codes[i] = 0; counts.transparent++; if (mOpaque) maskOnClear++; continue; }
    if (!mOpaque) { errors.push({ x, y, why: 'the mask is transparent under an opaque pixel' }); codes[i] = 1; continue; }
    const mc = [md[o], md[o + 1], md[o + 2]];
    let mi = -2, best = Infinity;
    if (d3(mc, T.fixed) <= 60) { mi = -1; best = d3(mc, T.fixed); }
    T.mask.forEach((c, k) => { const v = d3(mc, c); if (v <= 60 && v < best) { best = v; mi = k; } });
    if (mi === -2) { errors.push({ x, y, why: 'not a mask colour: ' + mc.join(',') }); codes[i] = 1; continue; }
    const rgb = [d[o], d[o + 1], d[o + 2]];
    if (mi === -1) { codes[i] = 1; counts.fixed++; continue; }
    if (!allowedIdx.has(mi)) { errors.push({ x, y, why: 'material ' + HC.MATERIALS[mi] + ' is not allowed in this kind of file' }); codes[i] = 1; continue; }
    if (isProtected(rgb, T, HC)) { forcedFixed++; codes[i] = 1; counts.fixed++; continue; }
    const s = shadeByLum(rgb, mi, T);
    codes[i] = codeOf(mi, s);
    counts[HC.MATERIALS[mi]] = (counts[HC.MATERIALS[mi]] || 0) + 1;
    d.set(rgba(HC.KEY_RAMPS[HC.MATERIALS[mi]][s]).slice(0, 3), o);
  }
  if (forcedFixed) warnings.push(forcedFixed + ' outline or highlight pixels marked as a material were kept fixed');
  if (maskOnClear) warnings.push(maskOnClear + ' mask pixels over transparent art were ignored');
  return { codes, errors, warnings, counts };
}

// Fixed pixels may not be exactly a key colour (a recoloured output must never contain one).
export function fixedKeyColours(img, codes, HC) {
  const T = keyTable(HC), out = [];
  for (let i = 0; i < codes.length; i++) {
    if (codes[i] !== 1) continue;
    const o = 4 * i, k = T.exact.get((img.data[o] << 16) | (img.data[o + 1] << 8) | img.data[o + 2]);
    if (k) out.push({ x: i % img.w, y: (i / img.w) | 0, colour: k.hex, why: 'a fixed pixel in the ' + k.m + ' key colour s' + k.s });
  }
  return out;
}
// codes → the mask image (mask colours; transparent stays transparent)
export function maskImage(codes, w, h, HC) {
  const T = keyTable(HC), out = blank(w, h);
  for (let i = 0; i < codes.length; i++) {
    if (!codes[i]) continue;
    const c = codes[i] === 1 ? T.fixed : T.mask[matOf(codes[i])];
    out.data.set([c[0], c[1], c[2], 255], 4 * i);
  }
  return out;
}
// For --verify and the tests: the codes a normalised file and its mask image give (exact colours required).
export function codesFrom(img, mask, HC) {
  const T = keyTable(HC), n = img.w * img.h, codes = new Uint8Array(n), errors = [];
  for (let i = 0; i < n; i++) {
    const o = 4 * i;
    if (!img.data[o + 3]) { if (mask && mask.data[o + 3]) errors.push('mask opaque over a transparent pixel at ' + (i % img.w) + ',' + ((i / img.w) | 0)); continue; }
    if (!mask) { codes[i] = 1; continue; }
    if (!mask.data[o + 3]) { errors.push('mask transparent under an opaque pixel at ' + (i % img.w) + ',' + ((i / img.w) | 0)); codes[i] = 1; continue; }
    const mc = [mask.data[o], mask.data[o + 1], mask.data[o + 2]];
    if (mc[0] === T.fixed[0] && mc[1] === T.fixed[1] && mc[2] === T.fixed[2]) { codes[i] = 1; continue; }
    const mi = T.mask.findIndex((c) => c[0] === mc[0] && c[1] === mc[1] && c[2] === mc[2]);
    if (mi < 0) { errors.push('not an exact mask colour at ' + (i % img.w) + ',' + ((i / img.w) | 0)); codes[i] = 1; continue; }
    const k = T.exact.get((img.data[o] << 16) | (img.data[o + 1] << 8) | img.data[o + 2]);
    if (!k || k.mi !== mi) { errors.push(HC.MATERIALS[mi] + ' pixel not in its exact key colour at ' + (i % img.w) + ',' + ((i / img.w) | 0)); codes[i] = 1; continue; }
    codes[i] = codeOf(mi, k.s);
  }
  return { codes, errors };
}
