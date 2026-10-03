// The recolouring proof for contract v3 (docs/harmony/contract/CONTRACT.md §5), on the SYNTHETIC rich fixture
// (tests/fixtures/harmony_rich: the sample's player kit with 9–11 values per key family, hue and chroma jitter, rim
// lights and warm highlights) imported over the synthetic sample (Suzu) and painted by the game's own raster path
// (src/ui/88_harmony_raster.js, loaded in node, decoded by the importer's PNG decoder):
//   sheets   every supported skin (7), every hair colour (10), every cloth palette (8: main and trim, coat and robe)
//            and the accessory channels (flower, scarf, headband), the player bust at peak, 2×
//   values   for every material and every target ramp, the painted values of the rich fixture (half steps from
//            −0.5 to 4.5) mapped onto the target: the smallest OKLab ΔE and ΔL between neighbouring values — the
//            darkest and lightest targets named — against the floor VALUE_FLOOR
//   residual the residual factor swept (0, 0.25, 0.5, 0.75, 1): the identity round trip (the fixture recoloured into
//            the key ramps themselves must give itself back), how far outputs sit from their target family
//            (relative, as the importer measures), gamut clipping, and how much painted variation survives
//   exact    every exact key shade gives exactly the tone contract v2 gave, for every target
// Writes docs/screenshots/harmony/recolour_v3/ (small PNGs and proof.json, every image labelled SYNTHETIC).
// Exit 1 when a check fails.   node tools/harmony_recolour_proof.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { load, root } from '../tests/lib/load.mjs';
import { decodePNG, encodePNG } from './harmony/png.mjs';
import { importSet, SYNTHETIC_LABEL } from './harmony/importer.mjs';
import { blank, blit, text, rect } from './harmony/image.mjs';

const VALUE_FLOOR = { dE: 0.02, dL: 0.012 }; // ≈ one just-noticeable difference in OKLab (ΔE 0.02)
const OUT = path.join(root, 'docs/screenshots/harmony/recolour_v3');
const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas']);
const HR = RB.harmonyRaster, HC = RB.harmonyContract, CC = HC.colour, SP = RB.sprites;
RB.sprites.makeCanvas = (w, h) => ({ width: w, height: h, getContext: () => ({ createImageData: (a, b) => ({ data: new Uint8ClampedArray(a * b * 4) }), putImageData() {} }) });

// ---- the rich fixture over the sample, installed --------------------------------------------------------------------
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-proof-'));
let manifest, files = {};
try {
  const a = importSet(path.join(root, 'tests/fixtures/harmony_sample/incoming'), { out: tmp, replace: true });
  const b = importSet(path.join(root, 'tests/fixtures/harmony_rich/incoming'), { out: tmp });
  if (!a.report.ok || !b.report.ok) throw new Error('import failed: ' + JSON.stringify([a.report.summary, b.report.summary, b.report.errors.slice(0, 3)]));
  manifest = b.manifest;
  for (const f of fs.readdirSync(tmp).filter((f) => f.endsWith('.png'))) files[f] = fs.readFileSync(path.join(tmp, f)).toString('base64');
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }
const decode = async (b64) => { const d = decodePNG(Buffer.from(b64, 'base64')); return { w: d.w, h: d.h, data: d.data }; };
const inst = HR.install({ manifest, files }, { decode });
if (!inst.ok) throw new Error('install: ' + inst.errors.join('; '));
const LA = { skin: 1, hair: 'ponytail', hairColor: 3, outfit: 2, shape: 'coat', acc: ['glasses', 'flower', 'satchel'] };
const LB = { skin: 5, hair: 'curly', hairColor: 8, outfit: 6, shape: 'robe', acc: ['scarf', 'headband'] };
const ACC_COLS = ['#2c2430', '#6a3a4a', '#c8452a', '#c8962e', '#3a7a5a', '#2c4468', '#8a7ab8', '#d8c89a', '#f4f0e8'];
const rows = [
  { id: 'skin', title: 'SKIN 0-6 (LOOK A)', looks: SP.SKIN.map((_, i) => [Object.assign({}, LA, { skin: i }), 'SKIN ' + i]) },
  { id: 'hair', title: 'HAIR COLOUR 0-9 (LOOK A)', looks: SP.HAIR.map((_, i) => [Object.assign({}, LA, { hairColor: i }), (SP.HAIR_NAMES[i] || 'HAIR ' + i).toUpperCase()]) },
  { id: 'cloth_coat', title: 'CLOTH 0-7, MAIN AND TRIM (LOOK A, COAT)', looks: SP.CLOTH.map((_, i) => [Object.assign({}, LA, { outfit: i }), 'CLOTH ' + i]) },
  { id: 'cloth_robe', title: 'CLOTH 0-7, MAIN AND TRIM (LOOK B, ROBE)', looks: SP.CLOTH.map((_, i) => [Object.assign({}, LB, { outfit: i }), 'CLOTH ' + i]) },
  { id: 'acc_flower', title: 'FLOWER CHANNEL (LOOK A)', looks: [[LA, 'DEFAULT']].concat(ACC_COLS.map((c) => [Object.assign({}, LA, { flowerCol: c }), c])) },
  { id: 'acc_scarf_band', title: 'SCARF AND HEADBAND CHANNELS (LOOK B)', looks: [[LB, 'DEFAULT']].concat(ACC_COLS.map((c) => [Object.assign({}, LB, { scarfCol: c, bandCol: c }), c])) },
];
const need = new Set();
for (const r of rows) for (const [look] of r.looks) for (const st of ['peak']) { const pl = HR.plan('pc', look, st, 'suzu'); if (!pl.ok) throw new Error('plan ' + JSON.stringify(pl.missing)); pl.files.forEach((f) => need.add(f)); }
await HR.load([...need]);

// ---- sheets ------------------------------------------------------------------------------------------------------------
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) if (/\.png$/.test(f)) fs.rmSync(path.join(OUT, f));
const CROP = [56, 14, 192, 160], SC = 2, CW = (CROP[2] - CROP[0]) * SC, CH = (CROP[3] - CROP[1]) * SC;
const sheetsOut = {};
function bustImg(look) {
  const b = HR.paint(HR.plan('pc', look, 'peak', 'suzu'), look, true);
  const img = blank(CROP[2] - CROP[0], CROP[3] - CROP[1]);
  for (let y = CROP[1]; y < CROP[3]; y++) for (let x = CROP[0]; x < CROP[2]; x++) { const p = b.px[y * b.w + x]; if (p >>> 24) img.data.set([p & 255, (p >>> 8) & 255, (p >>> 16) & 255, 255], 4 * ((y - CROP[1]) * img.w + x - CROP[0])); }
  return img;
}
for (const r of rows) {
  const per = Math.min(r.looks.length, 5), nr = Math.ceil(r.looks.length / per);
  const img = blank(16 + per * (CW + 12), 58 + nr * (CH + 26) + 22, '#22252e');
  text(img, SYNTHETIC_LABEL + ' — RECOLOUR V3: ' + r.title + ', PEAK, 2X', 10, 10, '#ff9a6a', 2);
  text(img, 'THE RICH FIXTURE (9-11 VALUES PER KEY FAMILY, JITTER, RIM AND WARM LIGHTS) RECOLOURED BY THE GAME. NOT ART.', 10, 34, '#a8a294');
  r.looks.forEach(([look, label], i) => {
    const x = 10 + (i % per) * (CW + 12), y = 50 + Math.floor(i / per) * (CH + 26);
    rect(img, x, y, x + CW, y + CH, '#2e323e', true);
    blit(img, bustImg(look), x, y, SC);
    text(img, label, x, y + CH + 6, '#e8e2d0');
  });
  text(img, SYNTHETIC_LABEL, 10, img.h - 14, '#ff9a6a');
  const png = encodePNG(img, { text: { Comment: SYNTHETIC_LABEL } });
  fs.writeFileSync(path.join(OUT, r.id + '_2x.png'), png);
  sheetsOut[r.id + '_2x.png'] = png.length;
}

// ---- values: neighbouring painted values stay distinguishable on every target -----------------------------------------
const truth = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/harmony_rich/truth/truth.json'), 'utf8'));
const targets = [];
SP.SKIN.forEach((_, i) => targets.push({ m: 'skin', name: 'skin ' + i, row: HR._.rampsOf(Object.assign({}, LA, { skin: i })).rows.skin }));
SP.HAIR.forEach((_, i) => targets.push({ m: 'hair', name: 'hair ' + (SP.HAIR_NAMES[i] || i), row: HR._.rampsOf(Object.assign({}, LA, { hairColor: i })).rows.hair }));
SP.CLOTH.forEach((_, i) => { const r = HR._.rampsOf(Object.assign({}, LA, { outfit: i })).rows; targets.push({ m: 'clothMain', name: 'cloth ' + i + ' main', row: r.clothMain }, { m: 'clothTrim', name: 'cloth ' + i + ' trim', row: r.clothTrim }); });
for (const c of ACC_COLS.concat([null])) for (const [a, look, f] of [['flower', LA, 'flowerCol'], ['scarf', LB, 'scarfCol'], ['headband', LB, 'bandCol']]) {
  const lk = c ? Object.assign({}, look, { [f]: c }) : look;
  targets.push({ m: 'accessory', name: a + ' ' + (c || 'default'), row: HR._.accRow(HR._.rampsOf(lk), lk, a) });
}
const labOf = (rgb) => CC.oklab(rgb[0], rgb[1], rgb[2]);
const valueRows = [];
for (const T of targets) {
  const vals = truth.values[T.m].painted;
  const out = vals.map((t) => labOf(CC.recolour({ t, rho: 0, theta: 0 }, T.row.curve)));
  let dE = Infinity, dL = Infinity, at = null;
  for (let i = 1; i < out.length; i++) { const e = CC.dLab(out[i], out[i - 1]), l = out[i][0] - out[i - 1][0]; if (e < dE) { dE = e; at = [vals[i - 1], vals[i]]; } dL = Math.min(dL, l); }
  valueRows.push({ material: T.m, target: T.name, L2: +CC.curveAt(T.row.curve, 2)[0].toFixed(3), minDE: +dE.toFixed(4), minDL: +dL.toFixed(4), at, values: vals.length });
}
const byMat = {};
for (const r of valueRows) (byMat[r.material] = byMat[r.material] || []).push(r);
const extremes = {};
for (const [m, rs] of Object.entries(byMat)) {
  const s = rs.slice().sort((a, b) => a.L2 - b.L2);
  extremes[m] = { darkest: s[0], lightest: s[s.length - 1], worst: rs.slice().sort((a, b) => a.minDE - b.minDE)[0] };
}
const valueFails = valueRows.filter((r) => r.minDE < VALUE_FLOOR.dE || r.minDL < VALUE_FLOOR.dL);

// ---- exact key shades: contract v2's tones, exactly (except where the value floor opens a collapsed ramp) -----------------
let exactOk = 0, exactBad = 0;
const opened = [];
for (const T of targets) {
  const mi = HC.MATERIALS.indexOf(T.m);
  HC.KEY_RAMPS[T.m].forEach((hx, s) => { const c = CC.hexRgb(hx), p = (0xff000000 | (c[2] << 16) | (c[1] << 8) | c[0]) >>> 0; T.row.memo.clear(); const q = HR._.recolourPx(T.row, mi, p); if (q === T.row.exact[s] && (T.row.opened || q === T.row.ramp[s])) exactOk++; else exactBad++; });
  if (T.row.opened) {
    const keyShift = T.row.curve.filter((n) => n.key).map((n) => +(n.L - n.L0).toFixed(4));
    opened.push({ target: T.name, material: T.m, keyShadesChanged: T.row.exact.map((p, s) => (p !== T.row.ramp[s] ? s : null)).filter((v) => v != null), lightnessShiftAtKeys: keyShift, maxShift: Math.max(...keyShift.map(Math.abs)) });
  }
}
// with the floor off (valueFloor 0) every target's curve passes through exactly its v2 tones
let v2Exact = 0, v2Bad = 0;
for (const T of targets) {
  const nodes = T.row.curve.filter((n) => n.key);
  nodes.forEach((n, s) => { const c = CC.srgbOf(n.L0, n.a, n.b), p = (0xff000000 | (c[2] << 16) | (c[1] << 8) | c[0]) >>> 0; if (p === T.row.ramp[s]) v2Exact++; else v2Bad++; });
}

// ---- the residual factor, swept ----------------------------------------------------------------------------------------------
// every distinct (colour, material) of the rich fixture's kit, with its pixel count
const KEYROW = Object.fromEntries(HC.MATERIALS.map((m) => [m, CC.targetCurve(HC.KEY_RAMPS[m], [0, 1, 2, 3, 4])]));
const px = [];
{
  const seen = new Map();
  for (const [name, f] of HR._.decoded) {
    if (!f.code) continue;
    for (let i = 0; i < f.code.length; i++) {
      const c = f.code[i]; if (c < 2) continue;
      const mi = ((c - 2) / 5) | 0, p = f.px[i], rgb = [p & 255, (p >>> 8) & 255, (p >>> 16) & 255], k = (rgb[0] << 16 | rgb[1] << 8 | rgb[2]) * 8 + mi;
      const e = seen.get(k); if (e) e.n++; else { const v = { rgb, m: HC.MATERIALS[mi], n: 1 }; seen.set(k, v); px.push(v); }
    }
  }
}
const relFrom = (lab, curve) => {
  // the output's relative distance from its target family at its own lightness (as the importer measures a key family)
  let lo = curve[0].t - 3, hi = curve[curve.length - 1].t + 3;
  for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (CC.curveAt(curve, mid)[0] < lab[0]) lo = mid; else hi = mid; }
  const q = CC.curveAt(curve, (lo + hi) / 2), at = CC.fitLab(q[0], q[1], q[2]);
  return Math.hypot(lab[1] - at[1], lab[2] - at[2]) / Math.max(Math.hypot(at[1], at[2]), HC.RECOLOUR.minChroma);
};
const sweep = [];
for (const k of [0, 0.25, 0.5, 0.75, 1]) {
  let rtSum = 0, rtMax = 0, rtN = 0, clip = 0, all = 0, keepSum = 0, keepN = 0, relMax = 0, relSum = 0;
  for (const q of px) {
    const lab = labOf(q.rgb), dc = CC.decompose(lab, q.m);
    // identity: back into the key ramp itself
    const back = CC.recolour(dc, KEYROW[q.m], k), e = CC.dLab(labOf(back), lab);
    rtSum += e * q.n; rtN += q.n; rtMax = Math.max(rtMax, e);
    for (const T of targets) {
      if (T.m !== q.m) continue;
      const o = CC.recolour(dc, T.row.curve, k), o0 = CC.recolour(dc, T.row.curve, 0);
      all += q.n; if (o[3]) clip += q.n;
      keepSum += CC.dLab(labOf(o), labOf(o0)) * q.n; keepN += q.n;
      const rel = relFrom(labOf(o), T.row.curve); relMax = Math.max(relMax, rel); relSum += rel * q.n;
    }
  }
  sweep.push({ residual: k, identityRoundTrip: { meanDE: +(rtSum / rtN).toFixed(4), maxDE: +rtMax.toFixed(4) }, variationKept: { meanDE: +(keepSum / keepN).toFixed(4) }, fromTargetFamily: { mean: +(relSum / keepN).toFixed(3), max: +relMax.toFixed(3) }, gamutClipped: +(clip / all * 100).toFixed(2) + ' %' });
}
const chosen = sweep.find((s) => s.residual === HC.RECOLOUR.residual);

const proof = {
  label: SYNTHETIC_LABEL,
  made: 'node tools/harmony_recolour_proof.mjs (the rich fixture over the sample, painted by src/ui/88_harmony_raster.js in node)',
  thresholds: HC.IMPORT, recolour: HC.RECOLOUR, valueFloor: VALUE_FLOOR,
  sheets: sheetsOut,
  values: { targets: valueRows.length, fails: valueFails, extremes, all: valueRows },
  exactKeyShades: { checked: exactOk + exactBad, wrong: exactBad, note: 'an exact key shade gives its v2 ramp tone, bit for bit, on every ramp the value floor leaves as it is; the opened ramps are listed', opened, unfloored: { keyNodesAtV2Tone: v2Exact, other: v2Bad } },
  residual: { chosen: HC.RECOLOUR.residual, sweep },
};
fs.writeFileSync(path.join(OUT, 'proof.json'), JSON.stringify(proof, null, 1) + '\n');
console.log('sheets:', JSON.stringify(sheetsOut));
console.log('values: ' + valueRows.length + ' targets; worst per material:', JSON.stringify(Object.fromEntries(Object.entries(extremes).map(([m, e]) => [m, { worst: e.worst.target + ' ΔE ' + e.worst.minDE + ' ΔL ' + e.worst.minDL, darkest: e.darkest.target + ' ' + e.darkest.minDE, lightest: e.lightest.target + ' ' + e.lightest.minDE }]))));
console.log('exact key shades: ' + exactOk + ' as specified, ' + exactBad + ' wrong; ramps opened by the value floor: ' + opened.length + ' of ' + targets.length + ' (max key lightness shift ' + Math.max(0, ...opened.map((o) => o.maxShift)) + '): ' + opened.map((o) => o.target + ' s' + o.keyShadesChanged.join('/')).join(', '));
for (const s of sweep) console.log('residual', JSON.stringify(s));
const ok = !valueFails.length && !exactBad && chosen.identityRoundTrip.maxDE < 0.01;
console.log(ok ? 'proof OK' : 'proof FAILED ' + JSON.stringify(valueFails.slice(0, 5)));
process.exit(ok ? 0 : 1);
