// Material masks for the player kit (docs/harmony/contract/CONTRACT.md §5, contract v3: key families, free values).
// A pixel's code: 0 transparent, 1 fixed (keeps its painted colour), 2 + material × 5 + shade for a recolourable
// pixel (material in RB.harmonyContract.MATERIALS order; shade 0–4 = its value on the key curve rounded, kept for
// reports and the mask views — the game recolours from the pixel's own colour, so every painted value survives).
// The game reads the same materials from the mask image and the normalised pixel (src/ui/88_harmony_raster.js),
// with the same projection (RB.harmonyContract.colour.project).
import { blank, rgba } from './image.mjs';

const d3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const codeOf = (mi, s) => 2 + mi * 5 + s;
export const matOf = (code) => (code >= 2 ? Math.floor((code - 2) / 5) : -1);
export const shadeOf = (code) => (code >= 2 ? (code - 2) % 5 : -1);
export const shadeOfT = (t) => (t <= 0 ? 0 : t >= 4 ? 4 : Math.round(t));
const hexOf = (rgb) => '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('');
const r3 = (v) => Math.round(v * 1000) / 1000;

export function keyTable(HC) {
  const keys = [];
  HC.MATERIALS.forEach((m, mi) => HC.KEY_RAMPS[m].forEach((h, s) => { const c = rgba(h); keys.push({ m, mi, s, rgb: c.slice(0, 3), hex: h }); }));
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
// every material's projection of one colour: [{ m, mi, t, d }] in MATERIALS order (memoised per colour)
function projector(HC) {
  const memo = new Map(), C = HC.colour;
  return (rgb) => {
    const k = (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];
    let v = memo.get(k);
    if (!v) { const p = C.oklab(rgb[0], rgb[1], rgb[2]); v = HC.MATERIALS.map((m, mi) => { const q = C.project(p, m); return { m, mi, t: q.t, d: q.d }; }); memo.set(k, v); }
    return v;
  };
}
// How the derivation classifies one opaque, unprotected colour for a file that may hold `allowedIdx`:
//   { kind: 'material', m, mi, t, d } | { kind: 'fixed', d } | { kind: 'unresolved', why, near, d, t }
export function classify(pr, allowedIdx, HC) {
  const I = HC.IMPORT;
  const al = pr.filter((q) => allowedIdx.has(q.mi)).sort((a, b) => a.d - b.d);
  const na = pr.filter((q) => !allowedIdx.has(q.mi)).sort((a, b) => a.d - b.d);
  const a1 = al[0] || null, a2 = al[1] || null, n1 = na[0] || null;
  const foreign = n1 && n1.d <= I.foreign && (!a1 || n1.d + I.margin <= a1.d);
  if (foreign) return { kind: 'unresolved', why: 'a ' + n1.m + '-family colour (' + r3(n1.d) + ' from its curve) in a file that may not contain ' + n1.m, near: n1.m, d: n1.d, t: n1.t };
  if (a1 && a1.d <= I.inner) {
    if (!a2 || a2.d - a1.d >= I.margin) return { kind: 'material', m: a1.m, mi: a1.mi, t: a1.t, d: a1.d };
    return { kind: 'unresolved', why: 'between the ' + a1.m + ' (' + r3(a1.d) + ') and ' + a2.m + ' (' + r3(a2.d) + ') families: not clearly nearer one (margin ' + I.margin + ')', near: a1.m, d: a1.d, t: a1.t };
  }
  if (!a1 || a1.d > I.outer) return { kind: 'fixed', d: a1 ? a1.d : Infinity };
  return { kind: 'unresolved', why: 'between inner (' + I.inner + ') and outer (' + I.outer + ') of the ' + a1.m + ' family (' + r3(a1.d) + ')', near: a1.m, d: a1.d, t: a1.t };
}

// Derive the mask of a kit file from its colours. Material pixels keep their painted colour (contract v3: no snapping
// to five shades); only outline ink within the outline radius is snapped to #140c18. allowed: the material names
// this kind of file may contain. Also counts the distinct painted values of each material (the report's `values`).
export function deriveMask(img, allowed, HC) {
  const T = keyTable(HC), d = img.data, n = img.w * img.h, proj = projector(HC);
  const codes = new Uint8Array(n), unresolved = [], counts = { transparent: 0, fixed: 0 }, values = {};
  const allowedIdx = new Set(allowed.map((m) => HC.MATERIALS.indexOf(m)));
  let snappedOutline = 0;
  for (let i = 0; i < n; i++) {
    const o = 4 * i;
    if (!d[o + 3]) { codes[i] = 0; counts.transparent++; continue; }
    const rgb = [d[o], d[o + 1], d[o + 2]];
    if (isProtected(rgb, T, HC)) {
      if (d3(rgb, T.outline) <= HC.IMPORT.outline && (rgb[0] !== T.outline[0] || rgb[1] !== T.outline[1] || rgb[2] !== T.outline[2])) { d.set(T.outline, o); snappedOutline++; }
      codes[i] = 1; counts.fixed++; continue;
    }
    const c = classify(proj(rgb), allowedIdx, HC);
    if (c.kind === 'material') {
      codes[i] = codeOf(c.mi, shadeOfT(c.t));
      counts[c.m] = (counts[c.m] || 0) + 1;
      (values[c.m] = values[c.m] || new Set()).add((rgb[0] << 16) | (rgb[1] << 8) | rgb[2]);
      continue;
    }
    codes[i] = 1;
    if (c.kind === 'fixed') { counts.fixed++; continue; }
    unresolved.push({ x: i % img.w, y: (i / img.w) | 0, colour: hexOf(rgb), why: c.why, near: c.near, dist: r3(c.d), t: Math.round(c.t * 100) / 100 });
  }
  return { codes, unresolved, counts, values: Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.size])), snappedOutline, snappedKey: 0 };
}

// Read a supplied mask (already on the canvas): mask colours → materials; the art keeps its painted colours (v3).
// Errors: a mask pixel that is no mask colour, a transparent mask under an opaque pixel, a material this kind may not
// contain, a colour marked as a material although it lies beyond `outer` from that material's key curve (it could
// not be recoloured faithfully: paint it in the family, or mark it fixed). Warnings: protected pixels marked as a
// material (kept fixed); fixed pixels inside an allowed family (they keep a key-family colour in every look).
export function readMask(img, mask, allowed, HC) {
  const T = keyTable(HC), d = img.data, md = mask.data, n = img.w * img.h, proj = projector(HC);
  const codes = new Uint8Array(n), errors = [], warnings = [], counts = { transparent: 0, fixed: 0 }, values = {};
  const allowedIdx = new Set(allowed.map((m) => HC.MATERIALS.indexOf(m)));
  let forcedFixed = 0, maskOnClear = 0, fixedInFamily = 0;
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
    if (mi === -1) {
      codes[i] = 1; counts.fixed++;
      if (!isProtected(rgb, T, HC) && proj(rgb).some((q) => allowedIdx.has(q.mi) && q.d <= HC.IMPORT.inner)) fixedInFamily++;
      continue;
    }
    if (!allowedIdx.has(mi)) { errors.push({ x, y, why: 'material ' + HC.MATERIALS[mi] + ' is not allowed in this kind of file' }); codes[i] = 1; continue; }
    if (isProtected(rgb, T, HC)) { forcedFixed++; codes[i] = 1; counts.fixed++; continue; }
    const q = proj(rgb)[mi];
    if (q.d > HC.IMPORT.outer) { errors.push({ x, y, why: hexOf(rgb) + ' is marked ' + HC.MATERIALS[mi] + ' but lies ' + r3(q.d) + ' from its key family (outer ' + HC.IMPORT.outer + ')' }); codes[i] = 1; continue; }
    codes[i] = codeOf(mi, shadeOfT(q.t));
    counts[HC.MATERIALS[mi]] = (counts[HC.MATERIALS[mi]] || 0) + 1;
    (values[HC.MATERIALS[mi]] = values[HC.MATERIALS[mi]] || new Set()).add((rgb[0] << 16) | (rgb[1] << 8) | rgb[2]);
  }
  if (forcedFixed) warnings.push(forcedFixed + ' outline or highlight pixels marked as a material were kept fixed');
  if (maskOnClear) warnings.push(maskOnClear + ' mask pixels over transparent art were ignored');
  if (fixedInFamily) warnings.push(fixedInFamily + ' pixels marked fixed lie inside an allowed key family: they keep that colour in every look');
  return { codes, errors, warnings, counts, values: Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.size])) };
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
// For --verify and the tests: the codes a normalised file and its mask image give (exact mask colours required; a
// material pixel must not be protected and must lie within `outer` of its family — what the game will recolour).
export function codesFrom(img, mask, HC) {
  const T = keyTable(HC), n = img.w * img.h, codes = new Uint8Array(n), errors = [], proj = projector(HC);
  for (let i = 0; i < n; i++) {
    const o = 4 * i;
    if (!img.data[o + 3]) { if (mask && mask.data[o + 3]) errors.push('mask opaque over a transparent pixel at ' + (i % img.w) + ',' + ((i / img.w) | 0)); continue; }
    if (!mask) { codes[i] = 1; continue; }
    if (!mask.data[o + 3]) { errors.push('mask transparent under an opaque pixel at ' + (i % img.w) + ',' + ((i / img.w) | 0)); codes[i] = 1; continue; }
    const mc = [mask.data[o], mask.data[o + 1], mask.data[o + 2]];
    if (mc[0] === T.fixed[0] && mc[1] === T.fixed[1] && mc[2] === T.fixed[2]) { codes[i] = 1; continue; }
    const mi = T.mask.findIndex((c) => c[0] === mc[0] && c[1] === mc[1] && c[2] === mc[2]);
    if (mi < 0) { errors.push('not an exact mask colour at ' + (i % img.w) + ',' + ((i / img.w) | 0)); codes[i] = 1; continue; }
    const rgb = [img.data[o], img.data[o + 1], img.data[o + 2]];
    if (isProtected(rgb, T, HC)) { errors.push(HC.MATERIALS[mi] + ' mask over outline ink or a highlight at ' + (i % img.w) + ',' + ((i / img.w) | 0)); codes[i] = 1; continue; }
    const q = proj(rgb)[mi];
    if (q.d > HC.IMPORT.outer) { errors.push(HC.MATERIALS[mi] + ' pixel ' + hexOf(rgb) + ' outside its key family (' + r3(q.d) + ') at ' + (i % img.w) + ',' + ((i / img.w) | 0)); codes[i] = 1; continue; }
    codes[i] = codeOf(mi, shadeOfT(q.t));
  }
  return { codes, errors };
}
