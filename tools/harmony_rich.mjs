// Writes the SYNTHETIC rich fixture for contract v3 (tests/fixtures/harmony_rich/): the synthetic sample's player
// kit (tests/fixtures/harmony_sample/incoming) repainted the way contract v3 lets an artist paint it — each
// recolourable material in its key FAMILY with many values instead of the five exact key shades:
//   values      every material pixel moved off its key shade by −0.5, 0 or +0.5 shade steps in diagonal bands
//               (so a material spans up to 11 values on a half-step grid from t −0.5 to 4.5, beyond both ends
//               of the key ramp: 8–11 for the materials the kit uses across its shades)
//   hue jitter  ±2° or ±4° in 2 × 2 blocks, chroma ±6 %
//   rim light   pixels on a silhouette's right edge: one step lighter, 8° cooler, 10 % less chroma
//   warm light  some skin and hair pixels at shade 3–4: half a step lighter, 8° warmer, 5 % more chroma
// Together at most 12° of hue and 16 % of chroma off the key curve: the painting tolerance contract v3 states
// (docs/harmony/contract/CONTRACT.md §5.2), which the importer's thresholds are calibrated to accept.
// Outline ink, whites, eyes, metal, leather and every other fixed colour are left exactly as in the sample, so the
// fixture also tests that the importer keeps them fixed. The ground truth (which material each pixel is, and the
// value it was painted at) goes to truth/ — never into incoming/, where it would act as a supplied mask.
// It is NOT art: it exists to calibrate the importer's thresholds (tools/harmony_calibrate.mjs) and to prove the
// recolouring (tools/harmony_recolour_proof.mjs). Deterministic: no randomness, the same bytes every run.
//   node tools/harmony_rich.mjs
import fs from 'node:fs';
import path from 'node:path';
import { decodePNG, encodePNG } from './harmony/png.mjs';
import { detectGrid, downsample, binarize, keyMagenta, place } from './harmony/grid.mjs';
import { blank } from './harmony/image.mjs';
import { loadContract, root } from './harmony/contract.mjs';
import { SYNTHETIC_LABEL } from './harmony/importer.mjs';

const HC = loadContract(), C = HC.colour;
const SRC = path.join(root, 'tests/fixtures/harmony_sample/incoming');
const OUT = path.join(root, 'tests/fixtures/harmony_rich');
const W = HC.BUST.w, H = HC.BUST.h;
const cfg = JSON.parse(fs.readFileSync(path.join(SRC, 'import.json'), 'utf8'));
const KEY = new Map();
HC.MATERIALS.forEach((m, mi) => HC.KEY_RAMPS[m].forEach((h, s) => { const c = C.hexRgb(h); KEY.set((c[0] << 16) | (c[1] << 8) | c[2], { m, mi, s }); }));
const near = (rgb, hex, r) => { const c = C.hexRgb(hex); return Math.hypot(rgb[0] - c[0], rgb[1] - c[1], rgb[2] - c[2]) <= r; };
const isProt = (rgb) => near(rgb, HC.OUTLINE, HC.IMPORT.outline) || near(rgb, '#ffffff', HC.IMPORT.white) || near(rgb, '#f6f2ee', HC.IMPORT.white);
const hash = (x, y, k) => { let h = (x * 374761393 + y * 668265263 + k * 2246822519) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return (h ^ (h >>> 16)) >>> 0; };
const DEG = Math.PI / 180;

// the sample file on its native canvas (as the importer places it, without masks)
function nativeOf(name) {
  const src = decodePNG(fs.readFileSync(path.join(SRC, name + '.png')));
  const fc = (cfg.files || {})[name] || {};
  keyMagenta(src, fc.background || 'auto');
  const nat = binarize(downsample(src, detectGrid(src, fc.cell ? { cell: fc.cell, origin: fc.origin } : null, HC.BUST)));
  return place(nat, W, H, fc.offset ? fc.offset[0] : Math.round((W - nat.w) / 2), fc.offset ? fc.offset[1] : Math.round((H - nat.h) / 2)).img;
}
// a colour of material m at value t, relative chroma rho and hue turn theta (radians)
function paint(m, t, rho, theta) {
  const k = C.curveAt(C.keyCurve(m), t), c = Math.hypot(k[1], k[2]) * (1 + rho), h = Math.atan2(k[2], k[1]) + theta;
  return C.srgbOf(k[0], c * Math.cos(h), c * Math.sin(h)).slice(0, 3);
}
const names = fs.readdirSync(SRC).filter((f) => f.endsWith('.png') && !f.endsWith('.mask.png')).map((f) => f.slice(0, -4)).filter((n) => HC.allowedOf(HC.parse(n)).length).sort();
// enlarged deliveries in the rich set too (the grid must still be found when neighbouring values are close)
const SCALE = { pc_head_cue: 4, pc_torso_coat: 3 };
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'incoming'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'truth'), { recursive: true });
const MASKC = HC.MATERIALS.map((m) => C.hexRgb(HC.MASK[m]));
const stats = { files: {}, values: {}, kinds: { band: 0, rim: 0, warm: 0, keptKey: 0 } };
const tValues = {};
for (const name of names) {
  const img = nativeOf(name), out = blank(W, H), truth = blank(W, H), tv = new Float32Array(W * H).fill(NaN);
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? null : img.data.subarray(4 * (y * W + x), 4 * (y * W + x) + 4));
  const keyAt = (x, y) => { const p = at(x, y); return p && p[3] ? KEY.get((p[0] << 16) | (p[1] << 8) | p[2]) : null; };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const o = 4 * (y * W + x);
    if (!img.data[o + 3]) continue;
    const k = keyAt(x, y);
    if (!k) { out.data.set(img.data.subarray(o, o + 4), o); truth.data.set([0, 0, 0, 255], o); continue; }
    let t = k.s + [-0.5, 0, 0.5][Math.floor((x * 0.6 + y) / 4) % 3];
    let theta = [-4, -2, 0, 2, 4][hash(x >> 1, y >> 1, 1) % 5] * DEG, rho = [-0.06, 0, 0.06][hash(x >> 1, y >> 1, 2) % 3];
    let kind = 'band';
    const right = at(x + 1, y);
    if ((!right || !right[3] || isProt(right)) && keyAt(x - 1, y)) { t += 1; theta -= 8 * DEG; rho -= 0.1; kind = 'rim'; }
    else if ((k.m === 'skin' || k.m === 'hair') && k.s >= 3 && (x * 3 + y * 5) % 7 === 0) { t += 0.5; theta += 8 * DEG; rho += 0.05; kind = 'warm'; }
    t = Math.max(-0.5, Math.min(4.5, t));
    let rgb = paint(k.m, t, rho, theta);
    // (a value that lands on outline ink or a white would be fixed by the importer: that pixel keeps its key shade)
    if (isProt(rgb)) { rgb = C.hexRgb(HC.KEY_RAMPS[k.m][k.s]); t = k.s; kind = 'keptKey'; }
    stats.kinds[kind]++;
    out.data.set([rgb[0], rgb[1], rgb[2], 255], o);
    truth.data.set([...MASKC[k.mi], 255], o);
    tv[y * W + x] = t;
    (tValues[k.m] = tValues[k.m] || new Set()).add(Math.round(t * 100) / 100);
    (stats.values[k.m] = stats.values[k.m] || new Set()).add((rgb[0] << 16) | (rgb[1] << 8) | rgb[2]);
  }
  const s = SCALE[name] || 1;
  let file = out;
  if (s > 1) { file = blank(W * s, H * s); for (let y = 0; y < H * s; y++) for (let x = 0; x < W * s; x++) { const q = 4 * (Math.floor(y / s) * W + Math.floor(x / s)); if (out.data[q + 3]) file.data.set(out.data.subarray(q, q + 4), 4 * (y * file.w + x)); } }
  fs.writeFileSync(path.join(OUT, 'incoming', name + '.png'), encodePNG(file, { text: { Comment: SYNTHETIC_LABEL } }));
  fs.writeFileSync(path.join(OUT, 'truth', name + '.mask.png'), encodePNG(truth, { text: { Comment: SYNTHETIC_LABEL } }));
  // the painted value of each material pixel, as 8-bit (t + 1) × 40 (t −0.5 → 20, 4.5 → 220) in the red channel
  const tvImg = blank(W, H);
  for (let i = 0; i < W * H; i++) if (!Number.isNaN(tv[i])) tvImg.data.set([Math.round((tv[i] + 1) * 40), 0, 0, 255], 4 * i);
  fs.writeFileSync(path.join(OUT, 'truth', name + '.value.png'), encodePNG(tvImg, { text: { Comment: SYNTHETIC_LABEL } }));
  stats.files[name] = s;
}
const summary = {
  label: SYNTHETIC_LABEL,
  made: 'node tools/harmony_rich.mjs (from tests/fixtures/harmony_sample/incoming)',
  files: names.length,
  enlarged: SCALE,
  values: Object.fromEntries(Object.entries(tValues).map(([m, v]) => [m, { painted: [...v].sort((a, b) => a - b), count: v.size, colours: stats.values[m].size }])),
  pixels: stats.kinds,
};
fs.writeFileSync(path.join(OUT, 'incoming', 'import.json'), JSON.stringify({ set: 'rich', synthetic: true, approval: 'synthetic', note: SYNTHETIC_LABEL + '. The synthetic sample\'s player kit repainted with many values per key family (tools/harmony_rich.mjs). Import it after the sample: its files replace the sample\'s kit.', files: Object.fromEntries(Object.keys(SCALE).map((n) => [n, {}])) }, null, 1) + '\n');
fs.writeFileSync(path.join(OUT, 'truth', 'truth.json'), JSON.stringify(summary, null, 1) + '\n');
fs.writeFileSync(path.join(OUT, 'SYNTHETIC.txt'), SYNTHETIC_LABEL + '\n\nWritten by tools/harmony_rich.mjs from the synthetic sample (tests/fixtures/harmony_sample/): the same player kit,\nits recolourable parts repainted with many values per key family (contract v3: key families, free values),\nmild hue and chroma jitter, rim lights and warm highlights. incoming/ is a delivery-shaped folder (import it\nafter the sample); truth/ holds the ground truth (material masks and painted values) for the calibration and\nthe recolouring proof. Not art, not a style reference, not a delivery.\n');
console.log('wrote', names.length, 'kit files to', path.relative(root, OUT), JSON.stringify(Object.fromEntries(Object.entries(summary.values).map(([m, v]) => [m, v.count + ' values / ' + v.colours + ' colours']))), JSON.stringify(stats.kinds));
