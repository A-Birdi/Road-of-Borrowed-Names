// Calibrates the importer's key-family thresholds (contract v3, docs/harmony/contract/CONTRACT.md §5) on the two
// SYNTHETIC fixtures, against their ground truth:
//   the sample  tests/fixtures/harmony_sample/incoming — kit parts in the five exact key shades (material = an
//               exact key colour of a material the file may hold; everything else fixed)
//   the rich    tests/fixtures/harmony_rich/incoming — the same kit with 9–11 values per family, hue and chroma
//               jitter, rim lights and warm highlights (truth/<name>.mask.png: the material of every pixel;
//               truth/<name>.value.png: the value it was painted at)
// For every opaque, unprotected kit pixel it measures the relative distance (RB.harmonyContract.colour.project) to
// its own family, to the nearest other allowed family, and — for fixed pixels — to the nearest allowed and the
// nearest foreign family; then it classifies everything with the contract's IMPORT thresholds and counts mistakes.
// Writes docs/harmony/contract/calibration.json; exit 1 if the thresholds misclassify anything or leave less
// headroom than the contract states.
//   node tools/harmony_calibrate.mjs [--sweep]
import fs from 'node:fs';
import path from 'node:path';
import { decodePNG } from './harmony/png.mjs';
import { detectGrid, downsample, binarize, keyMagenta, place } from './harmony/grid.mjs';
import { classify, isProtected, keyTable } from './harmony/masks.mjs';
import { loadContract, root } from './harmony/contract.mjs';

const HC = loadContract(), C = HC.colour, I = HC.IMPORT, T = keyTable(HC);
const W = HC.BUST.w, H = HC.BUST.h;
const SWEEP = process.argv.includes('--sweep');
function nativeOf(dir, name, cfg) {
  const src = decodePNG(fs.readFileSync(path.join(dir, name + '.png')));
  const fc = (cfg.files || {})[name] || {};
  keyMagenta(src, fc.background || 'auto');
  const nat = binarize(downsample(src, detectGrid(src, fc.cell ? { cell: fc.cell, origin: fc.origin } : null, HC.BUST)));
  return place(nat, W, H, fc.offset ? fc.offset[0] : Math.round((W - nat.w) / 2), fc.offset ? fc.offset[1] : Math.round((H - nat.h) / 2)).img;
}
const MASKC = HC.MATERIALS.map((m) => C.hexRgb(HC.MASK[m]));
const fixtures = [
  { id: 'sample', dir: path.join(root, 'tests/fixtures/harmony_sample/incoming'), truth: null },
  { id: 'rich', dir: path.join(root, 'tests/fixtures/harmony_rich/incoming'), truth: path.join(root, 'tests/fixtures/harmony_rich/truth') },
];
const rows = []; // one per distinct (fixture, file kind, colour, truth)
for (const fx of fixtures) {
  const cfg = fs.existsSync(path.join(fx.dir, 'import.json')) ? JSON.parse(fs.readFileSync(path.join(fx.dir, 'import.json'), 'utf8')) : {};
  for (const f of fs.readdirSync(fx.dir).filter((f) => f.endsWith('.png') && !f.endsWith('.mask.png')).sort()) {
    const name = f.slice(0, -4), p = HC.parse(name), allowed = HC.allowedOf(p);
    if (!allowed.length) continue;
    const img = nativeOf(fx.dir, name, cfg);
    const tm = fx.truth ? decodePNG(fs.readFileSync(path.join(fx.truth, name + '.mask.png'))) : null;
    const tv = fx.truth ? decodePNG(fs.readFileSync(path.join(fx.truth, name + '.value.png'))) : null;
    const seen = new Map();
    for (let i = 0; i < W * H; i++) {
      const o = 4 * i;
      if (!img.data[o + 3]) continue;
      const rgb = [img.data[o], img.data[o + 1], img.data[o + 2]];
      if (isProtected(rgb, T, HC)) continue;
      let mi = -1, tTrue = null;
      if (tm) { mi = MASKC.findIndex((c) => c[0] === tm.data[o] && c[1] === tm.data[o + 1] && c[2] === tm.data[o + 2]); if (mi >= 0) tTrue = tv.data[o] / 40 - 1; }
      else { const k = T.exact.get((rgb[0] << 16) | (rgb[1] << 8) | rgb[2]); if (k && allowed.includes(k.m)) { mi = k.mi; tTrue = k.s; } }
      const key = (rgb[0] << 16 | rgb[1] << 8 | rgb[2]) + ':' + mi + ':' + tTrue;
      const r = seen.get(key);
      if (r) { r.n++; continue; }
      const lab = C.oklab(rgb[0], rgb[1], rgb[2]);
      const pr = HC.MATERIALS.map((m, k) => { const q = C.project(lab, m); return { m, mi: k, t: q.t, d: q.d }; });
      const row = { fixture: fx.id, file: name, kind: p.kind, colour: '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join(''), truth: mi >= 0 ? HC.MATERIALS[mi] : 'fixed', tTrue, n: 1, allowed, pr };
      seen.set(key, row); rows.push(row);
    }
  }
}
const r3 = (v) => Math.round(v * 1000) / 1000;
function measure(rs) {
  const mat = rs.filter((r) => r.truth !== 'fixed'), fix = rs.filter((r) => r.truth === 'fixed');
  const own = (r) => r.pr.find((q) => q.m === r.truth);
  const other = (r) => Math.min(...r.pr.filter((q) => q.m !== r.truth && r.allowed.includes(q.m)).map((q) => q.d), Infinity);
  const foreign = (r) => Math.min(...r.pr.filter((q) => !r.allowed.includes(q.m)).map((q) => q.d), Infinity);
  const allowedMin = (r) => r.pr.filter((q) => r.allowed.includes(q.m)).sort((a, b) => a.d - b.d)[0];
  const px = (a) => a.reduce((s, r) => s + r.n, 0);
  const worst = (a, f, k, dir) => a.map((r) => ({ v: f(r), r })).sort((x, y) => dir * (x.v - y.v)).slice(0, k).map(({ v, r }) => ({ d: r3(v), colour: r.colour, fixture: r.fixture, file: r.file, truth: r.truth, t: r.tTrue, px: r.n }));
  const q = (a, f, p) => { const v = a.flatMap((r) => Array(r.n).fill(f(r))).sort((x, y) => x - y); return v.length ? r3(v[Math.min(v.length - 1, Math.floor(p * v.length))]) : null; };
  const tErr = mat.map((r) => Math.abs(own(r).t - r.tTrue));
  return {
    materialPixels: px(mat), materialColours: mat.length, fixedPixels: px(fix), fixedColours: fix.length,
    material: { ownDistance: { p50: q(mat, (r) => own(r).d, 0.5), p99: q(mat, (r) => own(r).d, 0.99), max: r3(Math.max(...mat.map((r) => own(r).d))) }, worst: worst(mat, (r) => own(r).d, 6, -1),
      gapToNextAllowed: { min: r3(Math.min(...mat.map((r) => other(r) - own(r).d))) }, nearestForeign: { min: r3(Math.min(...mat.map(foreign))) },
      valueError: { max: r3(Math.max(...tErr)), mean: r3(tErr.reduce((a, b) => a + b, 0) / Math.max(1, tErr.length)) } },
    fixed: { nearestAllowed: { min: r3(Math.min(...fix.map((r) => allowedMin(r).d))), p01: q(fix, (r) => allowedMin(r).d, 0.01) }, worst: worst(fix, (r) => allowedMin(r).d, 6, 1), nearestForeign: { min: r3(Math.min(...fix.map(foreign))) }, worstForeign: worst(fix, foreign, 3, 1) },
  };
}
function judge(th) {
  const save = Object.assign({}, I);
  Object.assign(I, th);
  const out = { wrongMaterial: 0, materialAsFixed: 0, fixedAsMaterial: 0, unresolved: 0, examples: [] };
  for (const r of rows) {
    const c = classify(r.pr, new Set(r.allowed.map((m) => HC.MATERIALS.indexOf(m))), HC);
    let bad = null;
    if (c.kind === 'unresolved') { out.unresolved += r.n; bad = 'unresolved'; }
    else if (r.truth === 'fixed' && c.kind === 'material') { out.fixedAsMaterial += r.n; bad = 'fixed→' + c.m; }
    else if (r.truth !== 'fixed' && c.kind === 'fixed') { out.materialAsFixed += r.n; bad = r.truth + '→fixed'; }
    else if (r.truth !== 'fixed' && c.m !== r.truth) { out.wrongMaterial += r.n; bad = r.truth + '→' + c.m; }
    if (bad && out.examples.length < 8) out.examples.push({ bad, colour: r.colour, fixture: r.fixture, file: r.file, px: r.n, d: r3(c.d || 0) });
  }
  Object.assign(I, save);
  out.errors = out.wrongMaterial + out.materialAsFixed + out.fixedAsMaterial + out.unresolved;
  return out;
}
const res = {
  note: 'SYNTHETIC fixtures only (tests/fixtures/harmony_sample, tests/fixtures/harmony_rich). Distances are relative (RB.harmonyContract.colour.project): the chroma-plane deviation over the key curve\'s chroma at that lightness, combined with shade steps beyond the extended ends.',
  thresholds: { inner: I.inner, outer: I.outer, margin: I.margin, foreign: I.foreign, extend: I.extend },
  sample: measure(rows.filter((r) => r.fixture === 'sample')), rich: measure(rows.filter((r) => r.fixture === 'rich')), both: measure(rows),
  result: judge({}),
};
const B = res.both;
// headroom: how far inside the measured limits the thresholds sit
res.headroom = { innerOverWorstMaterial: r3(I.inner / B.material.ownDistance.max), nearestFixedOverOuter: r3(B.fixed.nearestAllowed.min / I.outer), marginUnderSmallestGap: r3(B.material.gapToNextAllowed.min / I.margin), nearestForeignFixedOverForeign: r3(B.fixed.nearestForeign.min / I.foreign) };
if (SWEEP) {
  res.sweep = [];
  for (const inner of [0.2, 0.25, 0.28, 0.31, 0.34, 0.38]) for (const outer of [0.31, 0.34, 0.36, 0.38, 0.42]) { if (outer < inner) continue; const j = judge({ inner, outer }); res.sweep.push({ inner, outer, errors: j.errors, unresolved: j.unresolved, fixedAsMaterial: j.fixedAsMaterial, materialAsFixed: j.materialAsFixed }); }
}
fs.writeFileSync(path.join(root, 'docs/harmony/contract/calibration.json'), JSON.stringify(res, null, 1) + '\n');
console.log(JSON.stringify({ thresholds: res.thresholds, material: B.material.ownDistance, gap: B.material.gapToNextAllowed, fixedNearestAllowed: B.fixed.nearestAllowed, fixedNearestForeign: B.fixed.nearestForeign, valueError: B.material.valueError, headroom: res.headroom, result: res.result }, null, 1));
if (SWEEP) for (const s of res.sweep) console.log(JSON.stringify(s));
const ok = res.result.errors === 0 && res.headroom.innerOverWorstMaterial >= 1.1 && res.headroom.nearestFixedOverOuter >= 1.1 && res.headroom.marginUnderSmallestGap >= 1.5 && res.headroom.nearestForeignFixedOverForeign >= 1.1;
console.log(ok ? 'calibration OK' : 'calibration FAILED');
process.exit(ok ? 0 : 1);
