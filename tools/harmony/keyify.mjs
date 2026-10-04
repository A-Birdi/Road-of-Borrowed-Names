// The keyify step (docs/harmony/contract/CONTRACT.md §5.5): the player kit painted in look A's REAL colours →
// key-family layers and masks that tools/harmony_import.mjs reads. A dev tool: nothing here ships in the game.
//
//   keyifyKit(inDir, opt) → { files, kit, look, ok, … }      writeKeyified(result, outDir)
//
// 1. Read: every file goes through the importer's own normalisation (normaliseImage: decode, checkerboard refusal,
//    magenta keying, grid detection, cell-centre downsampling, binary alpha, placement) — the same code, not a copy.
// 2. Classify each opaque pixel of a kit file into a PART the file's kind may hold (the look's `files`): a material
//    part (skin, hair, clothMain, clothTrim, accessory) matched against the look's reference ramp for it, or a fixed
//    part (eyes, lips, brush, leaves, …) matched against the look's colours for it. Outline ink and near-white
//    highlights are fixed first (as the importer protects them; ink is snapped to #140c18). The nearest part within
//    `near` that is nearer than every part of another material by `margin` wins; anything else is UNRESOLVED and
//    reported (never guessed). A supplied mask (`<name>.mask.png`, in --masks or beside the file) decides every pixel
//    it covers. A pixel no part matches but which already lies in one of the file's key families (the importer's own
//    derivation) is kept as painted (a part delivered in key colours); a file that is mostly in key families already is
//    passed through whole, its mask derived as the importer derives it.
// 3. Value mapping, per material across the whole kit (the face, the hand and the neck share one mapping): each
//    painted colour's place in that material's painted lightness range → t on the key curve, darkest → s0 and lightest
//    → s4, shaped by the reference ramp (`range`, the default); or its place on the reference ramp itself
//    (`reference`: the reference's s0 lightness → s0, …), squeezed into the key curve's extended range when it
//    overflows. Both are monotonic in lightness: the number of values and their order are kept (merges reported).
//    A material with fewer than 3 values or spanning under 2 reference steps uses `reference` (a range needs a range).
// 4. Residual: the colour's chroma (relative) and hue offset from the reference ramp at its own lightness, kept within
//    the contract's painting tolerance (§5.1: 12° of hue, 16 % of chroma, 0.25 together) and rebuilt on the key curve
//    at t — so painted rim lights and warm highlights survive; larger offsets are clamped and reported.
// 5. Fixed pixels keep their colours; any within `outer` of a key family the file may hold, within `foreign` of one
//    it may not, or exactly an anchor shade is reported (the mask keeps them fixed, but an anchor shade is refused).
// Deterministic: the same inputs and look give the same bytes.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { decodePNG, encodePNG } from './png.mjs';
import { detectGrid, downsample, binarize, keyMagenta, looksLikeCheckerboard } from './grid.mjs';
import { normaliseImage, placeMask } from './importer.mjs';
import { keyTable, isProtected, classify as keyClassify, deriveMask, maskImage, codeOf, shadeOfT } from './masks.mjs';
import { loadContract, root } from './contract.mjs';

export const DEFAULT_LOOK = path.join(root, 'tools/harmony/lookA.json');
export const KEYIFY = {
  near: 0.09, margin: 0.015, pointL: 0.5, // classification (absolute OKLab; colour lists weigh lightness by pointL)
  white: 4, // sRGB distance from #ffffff or the eye white #f6f2ee within which a pixel is always fixed
  maxHue: (12 * Math.PI) / 180, maxChroma: 0.16, maxDist: 0.25, // the residual kept (contract §5.1)
  minValues: 3, minSpan: 2, // `range` needs ≥ 3 values spanning ≥ 2 reference steps
  keyedShare: 0.5, // a file with at least this share of its unprotected pixels in key families is passed through
  neighbours: 3, // an ambiguous pixel (two parts within `near`, under `margin` apart) takes the one of them that at least this
  //               many of its 8 decided neighbours have — twice as many as the other; reported (flag `neighbours`)
};
export const DEFAULT_FILES = { head: ['skin', 'hair'], torso: ['clothMain', 'clothTrim', 'skin'], arm: ['skin', 'clothMain', 'clothTrim'], hair: ['hair', 'clothTrim'], hair_wrap: ['hair', 'clothTrim'], acc: ['accessory'] };
export const FLAG = { unresolved: 1, clamped: 2, collides: 4, foreign: 8, clipped: 16, merged: 32, keyed: 64, masked: 128, neighbours: 256 };

const r4 = (v) => Math.round(v * 1e4) / 1e4;
const hexOf = (r, g, b) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
const hex24 = (k) => hexOf((k >> 16) & 255, (k >> 8) & 255, k & 255);
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const wrapAngle = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };

// ---- the look --------------------------------------------------------------------------------------------------------
export function readLook(file) { return JSON.parse(fs.readFileSync(file || DEFAULT_LOOK, 'utf8')); }

// The ramp the game builds for one material of a look (tones dark → light, and the tones the key shades take), as
// src/ui/88_harmony_raster.js rampsOf / accRow build it. key: skin, hair, clothMain, clothTrim, wrap, accessory:<id>.
export function gameRamp(RB, HC, look, key) {
  const HK = RB.harmonyKit, col = RB.sprites.colorsOf(look), PK = HC.PICK;
  const [m, acc] = key.split(':');
  let M, pick;
  if (m === 'skin') { M = HK.skinMat(col.skin); pick = PK.skin; }
  else if (m === 'hair') { M = HK.hairMat(col.hair); pick = PK.n6; }
  else if (m === 'clothMain') { M = HK.clothMat(col.cloth[0]); pick = PK.n6; }
  else if (m === 'clothTrim') { M = HK.clothMat(col.cloth[2], { step: 0.09 }); pick = PK.n6; }
  else if (m === 'wrap') { M = HK.clothMat(look.wrapCol || col.cloth[2]); pick = PK.n6; }
  else if (m === 'accessory') {
    const ch = HC.ACC[acc] && HC.ACC[acc].channel;
    if (!ch) return null;
    const v = look[ch.field];
    if (v) M = HK.M('acc_' + acc, v, ch.opts);
    else if (ch.def === 'metal') M = HK.metalMat('#e0b850');
    else M = HK.M('acc_' + acc, ch.def === 'cloth.2' ? col.cloth[2] : ch.def, ch.opts);
    pick = M.n >= 6 ? PK.n6 : M.n === 5 ? PK.n5 : PK.n4;
  } else return null;
  return { tones: Array.from(M.c, (p) => hexOf(p & 255, (p >>> 8) & 255, (p >>> 16) & 255)), pick: pick.map((i) => Math.min(i, M.c.length - 1)) };
}
const defaultPick = (n) => (n === 5 ? [0, 1, 2, 3, 4] : n === 6 ? [1, 2, 3, 4, 5] : [0, 1, 2, 3, 4].map((s) => Math.round((s * (n - 1)) / 4)));

// lightness → t on a curve (nodes rising in t and L), continued along the end segments
export function tOfL(C, L) {
  const n = C.length, sl = (A, B) => (B.t - A.t) / (B.L - A.L || 1e-9);
  if (L <= C[0].L) return C[0].t + (L - C[0].L) * sl(C[0], C[1]);
  if (L >= C[n - 1].L) return C[n - 1].t + (L - C[n - 1].L) * sl(C[n - 2], C[n - 1]);
  let i = 0;
  while (i < n - 2 && L > C[i + 1].L) i++;
  return C[i].t + (L - C[i].L) * sl(C[i], C[i + 1]);
}

// A look JSON → { name, game, ref(key), parts, files, as, T, errors }. Material ramps missing from the JSON come from
// the game look through the game's own code (opt.RB: the runtime loaded in node), when there is one.
export function resolveLook(json, opt = {}) {
  const HC = opt.HC || loadContract(), C = HC.colour;
  const L = { name: json.name || 'look', json, game: json.game || null, files: json.files || {}, as: json.as || {}, T: Object.assign({}, KEYIFY, json.thresholds || {}), errors: [], refs: {}, fixedParts: {} };
  for (const [name, list] of Object.entries(json.fixed || {})) {
    if (!Array.isArray(list) || !list.length) { L.errors.push('fixed.' + name + ': a list of colours'); continue; }
    L.fixedParts[name] = list.map((h) => C.labHex(h));
  }
  L.ref = (key) => {
    if (L.refs[key] !== undefined) return L.refs[key];
    const [m, acc] = key.split(':'), mats = json.materials || {};
    let spec = m === 'accessory' ? mats.accessory && mats.accessory[acc] : mats[m], source = 'look';
    if (!spec && opt.RB && L.game) { spec = gameRamp(opt.RB, HC, L.game, key); source = 'game'; }
    if (!spec || !Array.isArray(spec.tones) || spec.tones.length < 2) { L.refs[key] = null; return null; }
    const tones = spec.tones.map((h) => C.hexRgb(h)), pick = spec.pick || defaultPick(tones.length);
    // a sampled colour reference (`raw`): its tones as nodes in rising lightness, as sampled (no value floor);
    // otherwise the ramp the game would build from the tones (the runtime's target curve)
    const curve = spec.raw ? tones.map((c, i) => { const q = C.oklab(c[0], c[1], c[2]); return { t: i, L: q[0], a: q[1], b: q[2] }; }) : C.targetCurve(tones, pick);
    // the value scale (which lightness is which shade step): the ramp itself, or `scale` — a sampled look keeps the
    // base look's (the game's) scale, since a style master shows colours, not where each sits among the shade steps
    const sc = spec.scale && Array.isArray(spec.scale.tones) ? spec.scale : null;
    const sTones = sc ? sc.tones.slice() : spec.tones.slice(), sPick = sc ? sc.pick || defaultPick(sc.tones.length) : pick.slice();
    const scale = sc ? C.targetCurve(sTones.map((h) => C.hexRgb(h)), sPick) : curve;
    L.refs[key] = { key, material: m === 'wrap' ? 'clothTrim' : m, acc: acc || null, tones: spec.tones.slice(), pick: pick.slice(), source, curve, scale, scaleTones: sTones, scalePick: sPick, L0: C.curveAt(scale, 0)[0], L4: C.curveAt(scale, 4)[0] };
    return L.refs[key];
  };
  return L;
}
// the reference key of material m in a file
export const refKeyOf = (m, p) => (m === 'accessory' ? 'accessory:' + p.acc : m === 'clothTrim' && p.kind === 'hair_wrap' ? 'wrap' : m);

// The parts a file may hold: [{ name, material, kind: 'ramp' | 'points', ref | points }] or 'fixed' (everything fixed).
export function partsOf(L, p, HC) {
  let list = L.files[p.name];
  if (list === undefined && p.kind === 'acc') list = L.files['acc_' + p.acc];
  if (list === undefined && p.kind === 'acc' && !(HC.ACC[p.acc] && HC.ACC[p.acc].channel)) list = 'fixed';
  if (list === undefined) list = L.files[p.kind];
  if (list === undefined) list = DEFAULT_FILES[p.kind];
  if (list === undefined || list === 'fixed') return { parts: 'fixed', errors: [] };
  const allowed = HC.allowedOf(p), parts = [], errors = [];
  for (const name of list) {
    if (HC.MATERIALS.indexOf(name) >= 0) {
      if (allowed.indexOf(name) < 0) { errors.push('the look lists ' + name + ' for ' + p.name + ', which may not hold it (contract §5.2)'); continue; }
      const ref = L.ref(refKeyOf(name, p));
      if (!ref) { errors.push('no reference ramp for ' + refKeyOf(name, p) + ' (' + p.name + '): give materials.' + (name === 'accessory' ? 'accessory.' + p.acc : name) + ' in the look, or a game look'); continue; }
      parts.push({ name, material: name, kind: 'ramp', ref });
    } else if (L.fixedParts[name]) {
      const m = L.as[name] || 'fixed';
      if (m !== 'fixed' && allowed.indexOf(m) < 0) { errors.push('as.' + name + ' = ' + m + ', which ' + p.name + ' may not hold'); continue; }
      const ref = m === 'fixed' ? null : L.ref(refKeyOf(m, p));
      if (m !== 'fixed' && !ref) { errors.push('no reference ramp for ' + refKeyOf(m, p)); continue; }
      parts.push({ name, material: m, kind: 'points', points: L.fixedParts[name], ref });
    } else errors.push('unknown part ' + name + ' for ' + p.name + ' (neither a material nor in fixed)');
  }
  return { parts, errors };
}

// ---- distances ---------------------------------------------------------------------------------------------------------
// a colour (OKLab) against a reference ramp: the chroma-plane distance from the ramp at the colour's own lightness,
// combined with how far its lightness lies beyond the ramp's ends (absolute OKLab)
export function rampDistance(p, ref, C) {
  const K = ref.curve, n = K.length, t = tOfL(K, p[0]);
  const tc = t < K[0].t ? K[0].t : t > K[n - 1].t ? K[n - 1].t : t;
  const q = C.curveAt(K, tc), at = C.fitLab(q[0], q[1], q[2]);
  const dL = p[0] < K[0].L ? K[0].L - p[0] : p[0] > K[n - 1].L ? p[0] - K[n - 1].L : 0;
  return { d: Math.hypot(p[1] - at[1], p[2] - at[2], dL), t, at };
}
function pointDistance(p, pts, w) {
  let best = Infinity;
  for (const q of pts) { const v = Math.hypot(p[1] - q[1], p[2] - q[2], w * (p[0] - q[0])); if (v < best) best = v; }
  return best;
}
// classify one colour among a file's parts: { part, material, d, d2, other } or { unresolved, why, near }
function classifyColour(p, parts, T, C) {
  const best = {};
  for (const pt of parts) {
    const d = pt.kind === 'ramp' ? rampDistance(p, pt.ref, C).d : pointDistance(p, pt.points, T.pointL);
    if (!best[pt.material] || d < best[pt.material].d) best[pt.material] = { part: pt, d };
  }
  const ranked = Object.entries(best).sort((a, b) => a[1].d - b[1].d);
  const [m1, b1] = ranked[0], second = ranked[1];
  const near = ranked.slice(0, 3).map(([m, b]) => ({ part: b.part.name, material: m, d: r4(b.d) }));
  if (b1.d > T.near) return { unresolved: true, why: 'matches no part of this file (nearest ' + b1.part.name + ' at ' + r4(b1.d) + ', limit ' + T.near + ')', near };
  if (second && second[1].d - b1.d < T.margin) return { unresolved: true, why: 'between ' + b1.part.name + ' (' + r4(b1.d) + ') and ' + second[1].part.name + ' (' + r4(second[1].d) + '): not ' + T.margin + ' nearer one', near, between: [{ part: b1.part, material: m1 }, { part: second[1].part, material: second[0] }] };
  return { part: b1.part, material: m1, d: b1.d, near };
}

// ---- the key colour ------------------------------------------------------------------------------------------------------
// A painted colour (OKLab) of material m at value tKey: its residual against the reference ramp at its own lightness
// (relative chroma rho, hue offset theta), kept within the painting tolerance, rebuilt on m's key curve at tKey.
export function keyColour(p, ref, tKey, m, T, HC) {
  const C = HC.colour, R = HC.RECOLOUR, K = ref.curve, n = K.length;
  const tr = tOfL(K, p[0]), trc = tr < K[0].t ? K[0].t : tr > K[n - 1].t ? K[n - 1].t : tr;
  const q = C.curveAt(K, trc), at = C.fitLab(q[0], q[1], q[2]);
  const CR = Math.hypot(at[1], at[2]), CP = Math.hypot(p[1], p[2]);
  let rho = (CP - CR) / Math.max(CR, R.minChroma);
  let th = CP < 1e-4 || CR < 1e-4 ? 0 : wrapAngle(Math.atan2(p[2], p[1]) - Math.atan2(at[2], at[1]));
  const rho0 = rho, th0 = th;
  rho = Math.max(-T.maxChroma, Math.min(T.maxChroma, rho));
  th = Math.max(-T.maxHue, Math.min(T.maxHue, th));
  const dist = (r, h) => Math.sqrt(Math.max(0, (1 + r) * (1 + r) + 1 - 2 * (1 + r) * Math.cos(h)));
  if (dist(rho, th) > T.maxDist) {
    let lo = 0, hi = 1;
    for (let i = 0; i < 30; i++) { const s = (lo + hi) / 2; if (dist(rho * s, th * s) <= T.maxDist) lo = s; else hi = s; }
    rho *= lo; th *= lo;
  }
  const clamped = Math.abs(rho - rho0) > 1e-3 || Math.abs(th - th0) > 1e-3;
  const k = C.curveAt(C.keyCurve(m), tKey), A = C.fitLab(k[0], k[1], k[2]);
  const CK = Math.hypot(A[1], A[2]), hK = Math.atan2(A[2], A[1]);
  const Cn = Math.max(0, CK + rho * Math.max(CK, R.minChroma)), h = hK + th;
  const o = C.srgbOf(A[0], Cn * Math.cos(h), Cn * Math.sin(h));
  return { rgb: [o[0], o[1], o[2]], clipped: !!o[3], clamped, rho, theta: th, rho0, theta0: th0, tRef: tr };
}

// Per material (reference key) across the kit: lightness → t on the key curve.
export function valueMap(ref, colours, mode, T, HC) {
  const ext = HC.IMPORT.extend, K = ref.scale;
  const Ls = [...colours.values()].map((v) => v.lab[0]);
  const Lmin = Math.min(...Ls), Lmax = Math.max(...Ls);
  const t0 = tOfL(K, Lmin), t1 = tOfL(K, Lmax);
  let use = mode, why = null, f, compressed = false;
  if (mode === 'range') {
    if (colours.size < T.minValues) { use = 'reference'; why = colours.size + ' value' + (colours.size === 1 ? '' : 's') + ' (a range needs ' + T.minValues + ')'; }
    else if (t1 - t0 < T.minSpan) { use = 'reference'; why = 'the values span ' + r4(t1 - t0) + ' reference steps (a range needs ' + T.minSpan + ')'; }
  }
  if (use === 'range') {
    const a = ref.L0, b = ref.L4, s = (b - a) / (Lmax - Lmin);
    f = (L) => { const v = tOfL(K, a + (L - Lmin) * s); return v < 0 ? 0 : v > 4 ? 4 : v; };
  } else if (t0 < -ext || t1 > 4 + ext) {
    const a0 = Math.max(t0, -ext), a1 = Math.min(t1, 4 + ext), s = t1 > t0 ? (a1 - a0) / (t1 - t0) : 0;
    f = (L) => a0 + (tOfL(K, L) - t0) * s;
    compressed = true;
  } else f = (L) => tOfL(K, L);
  return { mode: use, why, f, Lmin, Lmax, tRef: [t0, t1], compressed };
}

// ---- one file: read and classify -------------------------------------------------------------------------------------------
function readFile(inDir, name, ctx) {
  const { HC, cfg, masksDir } = ctx;
  const buf = fs.readFileSync(path.join(inDir, name + '.png'));
  const n = normaliseImage(buf, name, { HC, fileCfg: (cfg.files || {})[name] });
  const f = { name, parsed: n.parsed, rep: n.rep, img: n.img, src: n.src, grid: n.grid, off: n.off, sourceSha256: n.rep.sourceSha256 };
  if (!n.img || !n.parsed || n.parsed.kind === 'comp') return f;
  // a supplied mask: --masks first, then beside the file
  const cands = [masksDir && path.join(masksDir, name + '.mask.png'), path.join(inDir, name + '.mask.png')].filter(Boolean);
  const mp = cands.find((q) => fs.existsSync(q));
  if (mp) {
    try { f.mask = placeMask(fs.readFileSync(mp), n.src, n.grid, n.off, HC); f.maskFrom = (masksDir && mp.startsWith(masksDir) ? '--masks/' : '') + path.basename(mp); }
    catch (e) { f.rep.errors.push('mask ' + path.basename(mp) + ': ' + e.message); }
  }
  return f;
}

function classifyFile(f, L, ctx) {
  const { HC } = ctx, C = HC.colour, T = L.T, KT = keyTable(HC), W = HC.BUST.w, H = HC.BUST.h, N = W * H;
  const p = f.parsed, d = f.img.data;
  const allowed = HC.allowedOf(p), allowedIdx = new Set(allowed.map((m) => HC.MATERIALS.indexOf(m)));
  const { parts, errors } = partsOf(L, p, HC);
  f.rep.errors.push(...errors);
  f.parts = parts;
  f.cls = new Int8Array(N).fill(-2); // −2 transparent, −1 fixed, 0–4 material, −3 unresolved
  f.flags = new Uint16Array(N);
  f.partOf = new Array(N).fill(null);
  f.unresolved = [];
  const pending = [];
  f.counts = {};
  f.snapped = 0;
  const memo = new Map(), labOf = (k) => C.oklab((k >> 16) & 255, (k >> 8) & 255, k & 255);
  const projAll = (lab) => HC.MATERIALS.map((m, mi) => { const q = C.project(lab, m); return { m, mi, t: q.t, d: q.d }; });
  // already in key colours? (the importer's own derivation over the file's unprotected pixels)
  let unprot = 0, inKey = 0;
  if (allowed.length) for (let i = 0; i < N; i++) {
    const o = 4 * i;
    if (!d[o + 3] || isProtected([d[o], d[o + 1], d[o + 2]], KT, HC)) continue;
    unprot++;
    const k = (d[o] << 16) | (d[o + 1] << 8) | d[o + 2];
    let c = memo.get('k' + k);
    if (!c) { c = keyClassify(projAll(labOf(k)), allowedIdx, HC); memo.set('k' + k, c); }
    if (c.kind === 'material') inKey++;
  }
  f.keyedShare = unprot ? inKey / unprot : 0;
  if (allowed.length && unprot && f.keyedShare >= T.keyedShare && !f.mask) {
    // delivered in key colours already: passed through, the mask derived exactly as the importer derives it
    f.mode = 'keyed';
    const r = deriveMask(f.img, allowed, HC);
    f.codes = r.codes;
    for (let i = 0; i < N; i++) {
      const c = r.codes[i];
      if (!c) continue;
      if (c === 1) { f.cls[i] = -1; if (isProtected([d[4 * i], d[4 * i + 1], d[4 * i + 2]], KT, HC)) f.partOf[i] = 'protected'; continue; }
      f.cls[i] = Math.floor((c - 2) / 5); f.flags[i] |= FLAG.keyed;
    }
    for (const u of r.unresolved) { const i = u.y * W + u.x; f.cls[i] = -3; f.flags[i] |= FLAG.unresolved; f.unresolved.push({ x: u.x, y: u.y, colour: u.colour, why: 'key colours: ' + u.why }); }
    f.snapped = r.snappedOutline;
    return f;
  }
  f.mode = parts === 'fixed' ? 'fixed' : 'real';
  const maskMat = (i) => {
    if (!f.mask) return null;
    const m = f.mask.data, o = 4 * i;
    if (m[o + 3] < 128) return null;
    const mc = [m[o], m[o + 1], m[o + 2]];
    let best = null, bd = 61;
    const dd = (c) => Math.hypot(mc[0] - c[0], mc[1] - c[1], mc[2] - c[2]);
    if (dd(KT.fixed) < bd) { best = 'fixed'; bd = dd(KT.fixed); }
    KT.mask.forEach((c, k) => { const v = dd(c); if (v < bd) { bd = v; best = HC.MATERIALS[k]; } });
    return best || 'bad';
  };
  for (let i = 0; i < N; i++) {
    const o = 4 * i;
    if (!d[o + 3]) continue;
    const rgb = [d[o], d[o + 1], d[o + 2]], k = (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];
    // outline ink: fixed and snapped to #140c18, as the importer does; white and the eye white (within T.white): fixed;
    // other near-whites (the importer's highlight radius) are classified, and stay fixed unless a material claims them
    // (the light end of a pale ramp — a pink flower's palest petal — is that material's value, not a highlight)
    const ink = Math.hypot(rgb[0] - KT.outline[0], rgb[1] - KT.outline[1], rgb[2] - KT.outline[2]) <= HC.IMPORT.outline;
    const white = KT.protect.slice(1).some((q) => Math.hypot(rgb[0] - q[0], rgb[1] - q[1], rgb[2] - q[2]) <= T.white);
    const exactInk = k === ((KT.outline[0] << 16) | (KT.outline[1] << 8) | KT.outline[2]);
    const mm = maskMat(i);
    // (a supplied mask may claim a near-ink pixel for a material: a material's darkest value painted that close to the
    // ink; its key colour is then far from the ink and recoloured)
    if ((ink || white) && !(ink && !exactInk && mm && mm !== 'fixed' && mm !== 'bad')) {
      if (ink && !exactInk) { d.set(KT.outline, o); f.snapped++; }
      f.cls[i] = -1; f.partOf[i] = 'protected';
      continue;
    }
    const highlight = isProtected(rgb, KT, HC);
    if (mm) {
      f.flags[i] |= FLAG.masked;
      if (mm === 'bad') { f.cls[i] = -3; f.flags[i] |= FLAG.unresolved; f.unresolved.push({ x: i % W, y: (i / W) | 0, colour: hex24(k), why: 'the supplied mask has no mask colour here' }); continue; }
      if (mm === 'fixed') { f.cls[i] = -1; f.partOf[i] = 'mask:fixed'; continue; }
      if (allowed.indexOf(mm) < 0) { f.cls[i] = -3; f.flags[i] |= FLAG.unresolved; f.unresolved.push({ x: i % W, y: (i / W) | 0, colour: hex24(k), why: 'the supplied mask marks ' + mm + ', which ' + p.name + ' may not hold' }); continue; }
      if (!L.ref(refKeyOf(mm, p))) { f.cls[i] = -3; f.flags[i] |= FLAG.unresolved; f.unresolved.push({ x: i % W, y: (i / W) | 0, colour: hex24(k), why: 'no reference ramp for ' + refKeyOf(mm, p) }); continue; }
      f.cls[i] = HC.MATERIALS.indexOf(mm); f.partOf[i] = 'mask:' + mm;
      continue;
    }
    if (parts === 'fixed') { f.cls[i] = -1; f.partOf[i] = 'fixed'; continue; }
    let c = memo.get(k);
    if (!c) {
      const lab = labOf(k);
      c = parts.length ? classifyColour(lab, parts, T, C) : { unresolved: true, why: 'the look gives this file no parts', near: [] };
      if (c.unresolved && !c.between && allowed.length) {
        // matching no part, but clearly in a key family the file may hold (within half the importer's inner distance:
        // a real auburn can sit at the edge of the orange skin family, a key colour sits near its curve): a part painted
        // in key colours already, kept as painted, as the importer would read it
        const kc = keyClassify(projAll(lab), allowedIdx, HC);
        if (kc.kind === 'material' && kc.d <= HC.IMPORT.inner / 2) c = { keyed: true, material: kc.m, part: { name: 'key:' + kc.m } };
      }
      memo.set(k, c);
    }
    if (highlight && (c.unresolved || c.keyed || c.material === 'fixed')) { f.cls[i] = -1; f.partOf[i] = 'protected'; continue; }
    if (c.unresolved) { f.cls[i] = -3; f.flags[i] |= FLAG.unresolved; pending.push([i, c, k]); continue; }
    f.partOf[i] = c.part.name;
    if (c.keyed) { f.cls[i] = HC.MATERIALS.indexOf(c.material); f.flags[i] |= FLAG.keyed; continue; }
    f.cls[i] = c.material === 'fixed' ? -1 : HC.MATERIALS.indexOf(c.material);
  }
  // An ambiguous pixel (two parts of different materials both within `near`, under `margin` apart: auburn hair's light
  // values and a light skin's shadows, a pale skin's highlight and cream bristles) takes the one of the two that its
  // decided neighbours clearly have — at least T.neighbours of the 8, twice as many as the other (outline ink does not
  // vote). Up to three passes, each applied at once (order-free). Flagged `neighbours` and counted in the report.
  for (let pass = 0; pass < 3; pass++) {
    const decided = [];
    for (const [i, c] of pending) {
      if (f.cls[i] !== -3 || !c.between) continue;
      const x = i % W, y = (i / W) | 0, votes = new Map();
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const X = x + dx, Y = y + dy;
        if ((!dx && !dy) || X < 0 || Y < 0 || X >= W || Y >= H) continue;
        const j = Y * W + X, cj = f.cls[j];
        if (cj === -2 || cj === -3 || f.partOf[j] === 'protected') continue;
        const mj = cj === -1 ? 'fixed' : HC.MATERIALS[cj];
        votes.set(mj, (votes.get(mj) || 0) + 1);
      }
      const [a, b] = c.between, va = votes.get(a.material) || 0, vb = votes.get(b.material) || 0;
      const win = va >= T.neighbours && va >= 2 * vb ? a : vb >= T.neighbours && vb >= 2 * va ? b : null;
      if (win) decided.push([i, win]);
    }
    for (const [i, win] of decided) { f.cls[i] = win.material === 'fixed' ? -1 : HC.MATERIALS.indexOf(win.material); f.flags[i] = (f.flags[i] & ~FLAG.unresolved) | FLAG.neighbours; f.partOf[i] = win.part.name; }
    if (!decided.length) break;
  }
  for (const [i, c, k] of pending) if (f.cls[i] === -3) f.unresolved.push({ x: i % W, y: (i / W) | 0, colour: hex24(k), why: c.why, near: c.near });
  return f;
}

// fixed pixels against the key families (what the importer would make of them without the mask)
function collisions(f, HC) {
  const C = HC.colour, KT = keyTable(HC), W = HC.BUST.w, d = f.img.data;
  const allowedIdx = new Set(HC.allowedOf(f.parsed).map((m) => HC.MATERIALS.indexOf(m)));
  const by = new Map();
  for (let i = 0; i < f.cls.length; i++) {
    if (f.cls[i] !== -1 || f.partOf[i] === 'protected') continue;
    const o = 4 * i, k = (d[o] << 16) | (d[o + 1] << 8) | d[o + 2];
    let e = by.get(k);
    if (e === undefined) {
      e = null;
      const ex = KT.exact.get(k);
      if (ex) e = { kind: 'anchor', family: ex.m, d: 0, why: 'exactly the ' + ex.m + ' anchor shade s' + ex.s + ' (the importer refuses a fixed pixel in an anchor shade)' };
      else {
        const lab = C.oklab(d[o], d[o + 1], d[o + 2]);
        for (const [mi, m] of HC.MATERIALS.entries()) {
          const q = C.project(lab, m);
          if (allowedIdx.has(mi) && q.d <= HC.IMPORT.outer && (!e || q.d < e.d)) e = { kind: 'allowed', family: m, d: r4(q.d), why: 'within ' + HC.IMPORT.outer + ' of the ' + m + ' key family (' + r4(q.d) + '): without its mask the importer would recolour it as ' + m };
          else if (!allowedIdx.has(mi) && q.d <= HC.IMPORT.foreign && (!e || (e.kind !== 'allowed' && q.d < e.d))) e = { kind: 'foreign', family: m, d: r4(q.d), why: 'within ' + HC.IMPORT.foreign + ' of the ' + m + ' key family (' + r4(q.d) + '), which this file may not hold: without its mask the importer would refuse it' };
        }
      }
      by.set(k, e);
    }
    if (!e) continue;
    f.flags[i] |= e.kind === 'foreign' ? FLAG.foreign : FLAG.collides;
    const key = hex24(k);
    if (!f.collide[key]) f.collide[key] = Object.assign({ colour: key, count: 0, first: [i % W, (i / W) | 0] }, e);
    f.collide[key].count++;
  }
}

// ---- the kit ---------------------------------------------------------------------------------------------------------------
// opt: { look (JSON) | lookFile, RB (the runtime in node; needed for ramps the look leaves to the game), values: 'range' |
// 'reference', masksDir, HC }
export function keyifyKit(inDir, opt = {}) {
  const HC = opt.HC || loadContract(), C = HC.colour, W = HC.BUST.w, H = HC.BUST.h, N = W * H, KT = keyTable(HC);
  const lookJson = opt.look || readLook(opt.lookFile);
  const L = resolveLook(lookJson, { HC, RB: opt.RB });
  const mode = opt.values || 'range';
  const errors = L.errors.map((e) => 'look: ' + e), warnings = [];
  if (mode !== 'range' && mode !== 'reference') errors.push('--values must be range or reference (got ' + mode + ')');
  const cfgPath = path.join(inDir, 'import.json');
  const cfg = fs.existsSync(cfgPath) ? JSON.parse(fs.readFileSync(cfgPath, 'utf8')) : {};
  const all = fs.readdirSync(inDir).filter((f) => /\.png$/i.test(f) && !/\.mask\.png$/i.test(f)).sort();
  const ctx = { HC, cfg, masksDir: opt.masksDir || null };
  const files = [];
  for (const fn of all) {
    const name = fn.replace(/\.png$/i, '');
    const f = readFile(inDir, name, ctx);
    f.collide = {};
    files.push(f);
    if (!f.img || !f.parsed) continue;
    if (f.parsed.kind === 'comp') { f.mode = 'companion'; continue; }
    classifyFile(f, L, ctx);
  }
  // value maps per reference, across the kit (real-colour material pixels only; key-coloured ones keep their colour)
  const pools = new Map();
  for (const f of files) {
    if (!f.cls || f.mode === 'keyed') continue;
    f.refs = {};
    for (let i = 0; i < N; i++) {
      const mi = f.cls[i];
      if (mi < 0 || f.flags[i] & FLAG.keyed) continue;
      const m = HC.MATERIALS[mi], key = refKeyOf(m, f.parsed);
      f.refs[mi] = key;
      if (!pools.has(key)) pools.set(key, new Map());
      const o = 4 * i, k = (f.img.data[o] << 16) | (f.img.data[o + 1] << 8) | f.img.data[o + 2], pool = pools.get(key);
      const e = pool.get(k);
      if (e) e.n++; else pool.set(k, { n: 1, lab: C.oklab(f.img.data[o], f.img.data[o + 1], f.img.data[o + 2]) });
    }
  }
  const kit = {};
  const keyOf = new Map(); // `${refKey}|${rgb24}` → key colour result
  for (const [key, pool] of [...pools.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    const ref = L.ref(key), m = ref.material;
    const vm = valueMap(ref, pool, mode, L.T, HC);
    const back = new Map();
    const ts = [];
    let clamped = 0, clipped = 0, clampedPx = 0, clippedPx = 0;
    for (const [k, v] of pool) {
      let t = vm.f(v.lab[0]), kc = keyColour(v.lab, ref, t, m, L.T, HC);
      // a key colour the importer and the game would take for outline ink or a highlight (the extended ends of the
      // key curves come near #f6f2ee) would never be recoloured: moved inward until it is not
      for (let g = 0; g < 100 && isProtected(kc.rgb, KT, HC); g++) { t += t > 2 ? -0.01 : 0.01; kc = keyColour(v.lab, ref, t, m, L.T, HC); kc.clipped = true; }
      kc.t = t;
      keyOf.set(key + '|' + k, kc);
      ts.push(t);
      if (kc.clamped) { clamped++; clampedPx += v.n; }
      if (kc.clipped) { clipped++; clippedPx += v.n; }
      const kk = (kc.rgb[0] << 16) | (kc.rgb[1] << 8) | kc.rgb[2];
      if (!back.has(kk)) back.set(kk, []);
      back.get(kk).push(k);
    }
    const merged = [...back.entries()].filter(([, v]) => v.length > 1).map(([kk, v]) => ({ key: hex24(kk), painted: v.map(hex24) }));
    for (const g of merged) for (const h of g.painted) keyOf.get(key + '|' + parseInt(h.slice(1), 16)).merged = true;
    const st = [...new Set(ts.map((t) => Math.round(t * 1e6)))].sort((a, b) => a - b).map((v) => v / 1e6);
    let minDt = Infinity;
    for (let i = 1; i < st.length; i++) minDt = Math.min(minDt, st[i] - st[i - 1]);
    const lightness = [...pool.values()].map((v) => v.lab[0]);
    kit[key] = {
      material: m, accessory: ref.acc, reference: { source: ref.source, tones: ref.tones, pick: ref.pick, scale: ref.scale === ref.curve ? null : { tones: ref.scaleTones, pick: ref.scalePick } }, mode: vm.mode, fallback: vm.why, compressed: vm.compressed,
      values: pool.size, keyValues: back.size, merged, pixels: [...pool.values()].reduce((a, v) => a + v.n, 0),
      lightness: [r4(Math.min(...lightness)), r4(Math.max(...lightness))], tReference: vm.tRef.map(r4), t: [r4(Math.min(...ts)), r4(Math.max(...ts))], minNeighbourStep: st.length > 1 ? r4(minDt) : null,
      clamped: { colours: clamped, pixels: clampedPx }, gamutClipped: { colours: clipped, pixels: clippedPx },
    };
    if (vm.why) warnings.push(key + ': mapped by the reference ramp, not by range — ' + vm.why);
    if (vm.compressed) warnings.push(key + ': the painted values reach t ' + r4(vm.tRef[0]) + '…' + r4(vm.tRef[1]) + ' on the reference, beyond the key curve\'s ±' + HC.IMPORT.extend + ' steps: squeezed into it (order kept)');
    if (vm.mode === 'range') {
      if (vm.tRef[0] > 0.5 || vm.tRef[1] < 3.5) warnings.push(key + ': range mapping stretches the painted values (reference t ' + r4(vm.tRef[0]) + '…' + r4(vm.tRef[1]) + ') to s0…s4: if the darkest or lightest painted value is not meant as the material\'s deepest shadow or highlight, use --values=reference');
      if (vm.tRef[0] < -0.5 || vm.tRef[1] > 4.5) warnings.push(key + ': range mapping squeezes the painted values (reference t ' + r4(vm.tRef[0]) + '…' + r4(vm.tRef[1]) + ') into s0…s4');
    }
    if (merged.length) warnings.push(key + ': ' + merged.length + ' key colours each take more than one painted value (8-bit rounding): ' + merged.slice(0, 4).map((g) => g.painted.join('+') + '→' + g.key).join(', '));
  }
  // the key layers
  for (const f of files) {
    if (!f.cls) continue;
    const d = f.img.data;
    f.key = { w: W, h: H, data: new Uint8Array(d) };
    if (f.mode !== 'keyed') {
      f.codes = new Uint8Array(N);
      f.tKey = new Float32Array(N).fill(NaN);
      for (let i = 0; i < N; i++) {
        const c = f.cls[i];
        if (c === -2) continue;
        if (c < 0) { f.codes[i] = 1; continue; }
        const o = 4 * i, k = (d[o] << 16) | (d[o + 1] << 8) | d[o + 2];
        if (f.flags[i] & FLAG.keyed) { const q = C.project(C.oklab(d[o], d[o + 1], d[o + 2]), HC.MATERIALS[c]); f.codes[i] = codeOf(c, shadeOfT(q.t)); f.tKey[i] = q.t; continue; }
        const kc = keyOf.get(f.refs[c] + '|' + k);
        f.key.data[o] = kc.rgb[0]; f.key.data[o + 1] = kc.rgb[1]; f.key.data[o + 2] = kc.rgb[2];
        f.codes[i] = codeOf(c, shadeOfT(kc.t));
        f.tKey[i] = kc.t;
        if (kc.clamped) f.flags[i] |= FLAG.clamped;
        if (kc.clipped) f.flags[i] |= FLAG.clipped;
        if (kc.merged) f.flags[i] |= FLAG.merged;
      }
    }
    collisions(f, HC);
  }
  // per-file report
  const fileReps = {};
  let unresolved = 0, fileErrors = 0;
  for (const f of files) {
    const R = { kind: f.parsed ? f.parsed.kind : null, mode: f.mode || null, source: f.rep.source, sourceSha256: f.sourceSha256 || null, srcW: f.rep.srcW, srcH: f.rep.srcH, grid: f.rep.grid, offset: f.rep.offset, errors: f.rep.errors.slice(), warnings: f.rep.warnings.slice() };
    if (f.cls) {
      const mats = {}, partsN = {}, flags = {};
      for (let i = 0; i < N; i++) {
        const c = f.cls[i];
        if (c === -2) continue;
        const mk = c === -1 ? 'fixed' : c === -3 ? 'unresolved' : HC.MATERIALS[c];
        mats[mk] = (mats[mk] || 0) + 1;
        if (f.partOf && f.partOf[i]) partsN[f.partOf[i]] = (partsN[f.partOf[i]] || 0) + 1;
        for (const [n, b] of Object.entries(FLAG)) if (f.flags[i] & b) flags[n] = (flags[n] || 0) + 1;
      }
      Object.assign(R, { keyedShare: r4(f.keyedShare || 0), mask: f.maskFrom || null, materials: mats, parts: partsN, flags, snappedOutline: f.snapped || 0 });
      R.unresolvedCount = f.unresolved.length;
      R.unresolved = f.unresolved.slice(0, 200);
      R.collisions = Object.values(f.collide).sort((a, b) => b.count - a.count);
      if (f.unresolved.length) {
        const by = {};
        for (const u of f.unresolved) by[u.colour] = (by[u.colour] || 0) + 1;
        R.errors.push(f.unresolved.length + ' unresolved pixels (' + Object.keys(by).length + ' colours: ' + Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([c, k]) => c + ' ×' + k).join(', ') + '): see unresolved, add the part to the look, or supply ' + f.name + '.mask.png');
      }
      const anchors = R.collisions.filter((c) => c.kind === 'anchor');
      if (anchors.length) R.errors.push(anchors.reduce((a, c) => a + c.count, 0) + ' fixed pixels are exactly an anchor shade (' + anchors.map((c) => c.colour).join(', ') + ')');
      const coll = R.collisions.filter((c) => c.kind !== 'anchor');
      if (coll.length) R.warnings.push(coll.reduce((a, c) => a + c.count, 0) + ' fixed pixels lie in or near a key family (' + coll.slice(0, 5).map((c) => c.colour + ' ' + c.kind + ' ' + c.family + ' ' + c.d).join(', ') + '): kept fixed by the mask');
      if (f.mode === 'keyed') R.warnings.push('already in key colours (' + Math.round(f.keyedShare * 100) + ' % of its pixels): passed through, mask derived as the importer derives it');
      const kp = f.mode !== 'keyed' && flags.keyed;
      if (kp) R.warnings.push(kp + ' pixels match no part but lie in a key family: kept as painted (key colours)');
      if (f.snapped) R.warnings.push(f.snapped + ' pixels within ' + HC.IMPORT.outline + ' of the outline ink were taken as ink (snapped to #140c18): a material value painted that dark is lost — paint it lighter, or claim it in a mask');
      if (flags.neighbours) R.warnings.push(flags.neighbours + ' ambiguous pixels decided by their neighbours (flag neighbours: check them on the flagged sheet, or supply a mask)');
      unresolved += f.unresolved.length;
    }
    fileErrors += R.errors.length;
    fileReps[f.name] = R;
  }
  const ok = !errors.length && !fileErrors;
  return { HC, look: L, mode, cfg, files, kit, report: { look: L.name, values: mode, thresholds: L.T, files: fileReps, kit, errors, warnings, unresolved, ok, summary: { files: files.length, kit: files.filter((f) => f.cls).length, companions: files.filter((f) => f.mode === 'companion').length, unresolved, fileErrors, setErrors: errors.length } }, ok, inDir };
}

// ---- writing ---------------------------------------------------------------------------------------------------------------
// outDir gets: each kit file's key layer (native 192 × 160) and <name>.mask.png; companion files copied byte for byte;
// import.json (the delivery's, without the per-file grid and offset settings keyify has already applied to kit files,
// plus a `keyify` note); PROVENANCE.md if delivered; keyify.json (the report). A file with errors (unresolved pixels, an
// anchor shade on a fixed pixel, a bad file) is not written unless opt.force (then its unresolved pixels stay fixed).
export function writeKeyified(res, outDir, opt = {}) {
  const { HC, files, cfg, inDir } = res;
  fs.mkdirSync(outDir, { recursive: true });
  for (const f of fs.readdirSync(outDir)) if (/\.png$/i.test(f)) fs.rmSync(path.join(outDir, f));
  const synthetic = !!cfg.synthetic, text = synthetic ? { Comment: 'SYNTHETIC SAMPLE — not art' } : {};
  const written = [], skipped = [];
  const ocfg = JSON.parse(JSON.stringify(cfg));
  ocfg.files = ocfg.files || {};
  for (const f of files) {
    const R = res.report.files[f.name];
    if (f.mode === 'companion') { fs.copyFileSync(path.join(inDir, f.name + '.png'), path.join(outDir, f.name + '.png')); written.push(f.name); continue; }
    if (!f.key || (R.errors.length && !opt.force)) { skipped.push(f.name); continue; }
    fs.writeFileSync(path.join(outDir, f.name + '.png'), encodePNG(f.key, { text }));
    fs.writeFileSync(path.join(outDir, f.name + '.mask.png'), encodePNG(maskImage(f.codes, HC.BUST.w, HC.BUST.h, HC), { text }));
    if (ocfg.files[f.name]) { for (const k of ['cell', 'origin', 'offset', 'background']) delete ocfg.files[f.name][k]; if (!Object.keys(ocfg.files[f.name]).length) delete ocfg.files[f.name]; }
    written.push(f.name);
  }
  if (!Object.keys(ocfg.files).length) delete ocfg.files;
  ocfg.keyify = { tool: 'tools/harmony_keyify.mjs', look: res.look.name, values: res.mode, sources: Object.fromEntries(files.filter((f) => f.sourceSha256).map((f) => [f.name, f.sourceSha256])) };
  fs.writeFileSync(path.join(outDir, 'import.json'), JSON.stringify(ocfg, null, 1) + '\n');
  const prov = path.join(inDir, 'PROVENANCE.md');
  if (fs.existsSync(prov)) fs.copyFileSync(prov, path.join(outDir, 'PROVENANCE.md'));
  const rep = Object.assign({}, res.report, { written, skipped, forced: !!opt.force });
  fs.writeFileSync(path.join(outDir, 'keyify.json'), JSON.stringify(rep, null, 1) + '\n');
  return { written, skipped, sha: sha(JSON.stringify(rep)) };
}

// ---- --sample: reference ramps from a style master ------------------------------------------------------------------------
// The look's reference colours derived from a style master (look A painted complete, in real colours, any enlargement:
// read with the importer's grid code) and, if given, a rough hand mask in the contract's mask colours (§5: skin red,
// hair green, cloth main blue, cloth trim yellow, accessory magenta, fixed black; edges may be loose — outline ink and
// highlights are ignored and each tone is a median). Per material: the colour at each lightness (lightness groups,
// medians: `raw` tones, a colour reference only), with the base look's ramp kept as its value scale (`scale`: which
// lightness is which shade step — a master shows colours, not shade steps). Fixed: the master's
// fixed colours, merged within 0.015, as one colour list `sampled` that every file may hold (it replaces the base
// look's fixed lists when a mask is given; without one, pixels are first classified against the base look and the
// sampled list is added to it). Materials the master does not show keep the base look's ramps.
export function sampleLook(masterBuf, maskBuf, base, opt = {}) {
  const HC = opt.HC || loadContract(), C = HC.colour, KT = keyTable(HC);
  const src = decodePNG(masterBuf);
  if (looksLikeCheckerboard(src)) throw new Error('the style master has a painted checkerboard background');
  keyMagenta(src, 'auto');
  const grid = detectGrid(src, null, HC.BUST), nat = binarize(downsample(src, grid));
  let mask = null;
  if (maskBuf) {
    const mk = decodePNG(maskBuf);
    if (mk.w === src.w && mk.h === src.h) mask = binarize(downsample(mk, grid));
    else if (mk.w === nat.w && mk.h === nat.h) mask = binarize(mk);
    else { const m2 = binarize(downsample(mk, detectGrid(mk, null, HC.BUST))); if (m2.w === nat.w && m2.h === nat.h) mask = m2; else throw new Error('the mask (' + mk.w + ' × ' + mk.h + ') does not fit the style master (' + src.w + ' × ' + src.h + ', ' + nat.w + ' × ' + nat.h + ' native)'); }
  }
  const accIds = Object.keys((base.materials && base.materials.accessory) || {});
  const acc = opt.acc || (accIds.length === 1 ? accIds[0] : 'flower');
  const L = resolveLook(base, { HC, RB: opt.RB });
  // every part of the base look, for classifying an unmasked master
  const allParts = [];
  for (const m of HC.MATERIALS) { const ref = L.ref(m === 'accessory' ? 'accessory:' + acc : m); if (ref) allParts.push({ name: m, material: m, kind: 'ramp', ref }); }
  for (const [name, pts] of Object.entries(L.fixedParts)) allParts.push({ name, material: L.as[name] && L.as[name] !== 'fixed' ? L.as[name] : 'fixed', kind: 'points', points: pts, ref: L.as[name] && L.as[name] !== 'fixed' ? L.ref(L.as[name]) : null });
  const pools = {}, fixedCols = new Map();
  let unmatched = 0, used = 0;
  for (let i = 0; i < nat.w * nat.h; i++) {
    const o = 4 * i, d = nat.data;
    if (!d[o + 3]) continue;
    const rgb = [d[o], d[o + 1], d[o + 2]];
    if (Math.hypot(rgb[0] - KT.outline[0], rgb[1] - KT.outline[1], rgb[2] - KT.outline[2]) <= HC.IMPORT.outline || KT.protect.slice(1).some((q) => Math.hypot(rgb[0] - q[0], rgb[1] - q[1], rgb[2] - q[2]) <= L.T.white)) continue;
    let m = null;
    if (mask) {
      const md = mask.data;
      if (md[o + 3] < 128) continue;
      const mc = [md[o], md[o + 1], md[o + 2]], dd = (c) => Math.hypot(mc[0] - c[0], mc[1] - c[1], mc[2] - c[2]);
      let bd = 61;
      if (dd(KT.fixed) < bd) { bd = dd(KT.fixed); m = 'fixed'; }
      KT.mask.forEach((c, k) => { const v = dd(c); if (v < bd) { bd = v; m = HC.MATERIALS[k]; } });
      if (!m) { unmatched++; continue; }
    } else {
      const c = classifyColour(C.oklab(rgb[0], rgb[1], rgb[2]), allParts, L.T, C);
      if (c.unresolved) { unmatched++; continue; }
      m = c.material;
    }
    used++;
    const k = (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];
    if (m === 'fixed') { fixedCols.set(k, (fixedCols.get(k) || 0) + 1); continue; }
    (pools[m] = pools[m] || []).push(C.oklab(rgb[0], rgb[1], rgb[2]));
  }
  const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
  const out = JSON.parse(JSON.stringify(base));
  out.name = (base.name || 'look') + ' (sampled)';
  out.note = 'Reference colours sampled by tools/harmony_keyify.mjs --sample from a style master' + (mask ? ' and its mask' : ' (no mask: classified against the base look)') + '; materials it does not show keep the base look\'s ramps. ' + (base.note || '');
  out.materials = JSON.parse(JSON.stringify(base.materials || {}));
  const sampled = {};
  for (const [m, list] of Object.entries(pools)) {
    if (list.length < 12) continue;
    // the material's colour at each lightness: its pixels in lightness order, cut into groups wherever lightness jumps
    // by more than 0.01 or a group would span more than 0.04; each group of ≥ 3 pixels a tone — its median lightness, a
    // and b (medians shrug off a rough mask's stray edges)
    const sorted = list.slice().sort((a, b) => a[0] - b[0]), bins = [];
    for (const v of sorted) { const g = bins[bins.length - 1]; if (g && v[0] - g[g.length - 1][0] <= 0.01 && v[0] - g[0][0] <= 0.04) g.push(v); else bins.push([v]); }
    const tones = [];
    let lastL = -1;
    for (const b of bins) {
      if (b.length < 3) continue;
      const Lm = med(b.map((v) => v[0]));
      if (Lm - lastL < 0.004) continue;
      const q8 = C.srgbOf(Lm, med(b.map((v) => v[1])), med(b.map((v) => v[2])));
      tones.push(hexOf(q8[0], q8[1], q8[2])); lastL = Lm;
    }
    if (tones.length < 2) continue;
    const n = list.length;
    sampled[m] = { pixels: n, tones };
    const b = L.ref(m === 'accessory' ? 'accessory:' + acc : m), spec = { tones, raw: true };
    if (b) spec.scale = { tones: b.scaleTones, pick: b.scalePick };
    if (m === 'accessory') { out.materials.accessory = out.materials.accessory || {}; out.materials.accessory[acc] = spec; }
    else out.materials[m] = spec;
  }
  const clusters = [];
  for (const [k, n] of [...fixedCols.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])) {
    const lab = C.oklab((k >> 16) & 255, (k >> 8) & 255, k & 255);
    if (clusters.some((c) => C.dLab(c.lab, lab) < 0.015)) continue;
    if (clusters.length < 48) clusters.push({ lab, hex: hex24(k), n });
  }
  if (clusters.length) {
    out.fixed = mask ? {} : Object.assign({}, base.fixed || {});
    out.fixed.sampled = clusters.map((c) => c.hex);
    const files = {};
    for (const [k, v] of Object.entries(base.files || {})) files[k] = v === 'fixed' ? v : (mask ? v.filter((q) => HC.MATERIALS.indexOf(q) >= 0) : v.slice()).concat(['sampled']);
    for (const [k, v] of Object.entries(DEFAULT_FILES)) if (!files[k]) files[k] = v.concat(['sampled']);
    out.files = files;
    if (mask) out.as = {};
  }
  out.sampled = { master: { w: src.w, h: src.h, native: [nat.w, nat.h], cell: [r4(grid.x.c), r4(grid.y.c)] }, mask: !!mask, accessory: acc, materials: sampled, fixed: clusters.length, pixels: used, ignored: unmatched };
  return out;
}
