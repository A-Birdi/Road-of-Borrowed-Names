// The Harmony art importer (tools/harmony_import.mjs and tools/harmony/*.mjs; docs/harmony/contract/CONTRACT.md §9):
// grid detection (whole and fractional enlargements, padding, noise), cell-centre majority, binary alpha,
// magenta keying, checkerboard (pure, noisy, under art, inside a padded file) and interlace refusals, mask derivation
// by key family (contract v3: free values kept, protected ink and highlights, refusal on unresolved pixels and on
// colours of a family the kind may not hold), supplied masks deciding and checked against the family, fixed pixels
// in key colours refused, offset suggestions, a whole import + verify of the committed synthetic sample and of the
// rich fixture against its ground truth, byte-for-byte regeneration, provenance, approval and the batches.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { decodePNG, encodePNG } from '../../tools/harmony/png.mjs';
import { detectGrid, downsample, binarize, place } from '../../tools/harmony/grid.mjs';
import { deriveMask, readMask, fixedKeyColours, codesFrom, maskImage, matOf, shadeOf } from '../../tools/harmony/masks.mjs';
import { normaliseFile, importSet, importSets, verifySet, suggestOffset } from '../../tools/harmony/importer.mjs';
import { looksLikeCheckerboard } from '../../tools/harmony/grid.mjs';
import crypto from 'node:crypto';
import { loadContract, root } from '../../tools/harmony/contract.mjs';
import { blank, rgba } from '../../tools/harmony/image.mjs';

const W = 192, H = 160;
// a deterministic pixel-art-like native image: discs of a few colours on transparency
function art(seed, pal) {
  const img = blank(W, H); let s = seed;
  const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  pal = pal || [[20, 12, 24], [200, 80, 40], [90, 160, 60], [240, 220, 180], [60, 70, 160], [150, 40, 120]];
  for (let k = 0; k < 110; k++) { const cx = rnd() * W, cy = rnd() * H, r = 2 + rnd() * 12, c = pal[(rnd() * pal.length) | 0]; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if ((x - cx) ** 2 + (y - cy) ** 2 < r * r) img.data.set([...c, 255], (y * W + x) * 4); }
  return img;
}
function enlarge(src, f, CW, CH, ox, oy, noise) {
  const out = blank(CW, CH); let s = 7;
  const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
    const sx = Math.floor((x + 0.5 - ox) / f), sy = Math.floor((y + 0.5 - oy) / f);
    if (sx < 0 || sy < 0 || sx >= src.w || sy >= src.h) continue;
    const o = (sy * src.w + sx) * 4;
    if (!src.data[o + 3]) continue;
    const c = [0, 1, 2].map((i) => Math.max(0, Math.min(255, src.data[o + i] + (noise ? Math.round((rnd() - 0.5) * noise) : 0))));
    out.data.set([...c, 255], (y * CW + x) * 4);
  }
  return out;
}
const diffPx = (a, b, tol = 0) => { let n = 0; for (let i = 0; i < a.data.length; i += 4) { const d = Math.hypot(a.data[i] - b.data[i], a.data[i + 1] - b.data[i + 1], a.data[i + 2] - b.data[i + 2]); if (a.data[i + 3] !== b.data[i + 3] || (a.data[i + 3] && d > tol)) n++; } return n; };

export default async (t) => {
  const HC = loadContract();
  // ---- grid detection and downsampling ----------------------------------------------------------------------------
  const src = art(11);
  const cases = [
    ['native 192 × 160', 1, W, H, 0, 0, 0],
    ['4× (768 × 640)', 4, 768, 640, 0, 0, 0],
    ['3×', 3, 576, 480, 0, 0, 0],
    ['2.5× (fractional)', 2.5, 480, 400, 0, 0, 0],
    ['1024 square at 1024 / 192 (5.333×), centred vertically', 1024 / 192, 1024, 1024, 0, (1024 - (160 * 1024) / 192) / 2, 0],
    ['6.4× (1229 × 1024)', 6.4, 1229, 1024, 0, 0, 0],
    ['4× with ±8 noise per channel', 4, 768, 640, 0, 0, 16],
    ['5.333× with ±8 noise', 1024 / 192, 1024, 853, 0, 0, 16],
  ];
  for (const [name, f, cw, ch, ox, oy, noise] of cases) {
    const big = enlarge(src, f, cw, ch, ox, oy, noise);
    const g = detectGrid(big, null, HC.BUST);
    const nat = binarize(downsample(big, g));
    const placed = place(nat, W, H, Math.round((W - nat.w) / 2), Math.round((H - nat.h) / 2)).img;
    t.ok(Math.abs(g.x.c - f) < 0.002 && Math.abs(g.y.c - f) < 0.002, name + ': cell ' + g.x.c.toFixed(4) + ' × ' + g.y.c.toFixed(4) + ' (true ' + f.toFixed(4) + ')');
    // (±8 per channel bounds a pixel's error at 13.9)
    t.eq(diffPx(placed, src, noise ? 14 : 0), 0, name + ': downsampled pixels equal the source' + (noise ? ' (within the noise, 14)' : ''));
  }
  // a forced grid (import.json cell/origin) is used as given
  { const big = enlarge(src, 4, 768, 640, 0, 0); const g = detectGrid(big, { cell: 4, origin: [0, 0] }, HC.BUST); t.ok(g.x.forced && g.x.n === W && g.y.n === H, 'a forced cell size is used as given'); }

  // ---- mask derivation (contract v3: key families, free values) ------------------------------------------------------------
  const K = (m, s) => rgba(HC.KEY_RAMPS[m][s]);
  const one = (pixels) => { const im = blank(W, H); pixels.forEach(([x, y, c]) => im.data.set(c.length === 4 ? c : [...c, 255], 4 * (y * W + x))); return im; };
  const CC = HC.colour, I = HC.IMPORT;
  // a colour of family m at value t, relative chroma rho, hue turned by deg degrees
  const fam = (m, t, rho, deg) => { const k = CC.curveAt(CC.keyCurve(m), t), c = Math.hypot(k[1], k[2]) * (1 + rho), h = Math.atan2(k[2], k[1]) + (deg * Math.PI) / 180; return CC.srgbOf(k[0], c * Math.cos(h), c * Math.sin(h)).slice(0, 3); };
  const dist = (rgb, m) => CC.project(CC.oklab(rgb[0], rgb[1], rgb[2]), m).d;
  // a colour of family m whose distance lies inside (lo, hi): the hue turned step by step
  const between = (m, t, lo, hi) => { for (let deg = 5; deg < 60; deg += 0.25) { const c = fam(m, t, 0, deg); const d = dist(c, m); if (d > lo && d < hi) return c; } throw new Error('no colour between ' + lo + ' and ' + hi); };
  {
    const hairFree = fam('hair', 2.6, 0.05, 6), skinDeep = fam('skin', -0.4, 0, 0), skinHigh = fam('skin', 4.4, -0.1, 8);
    const im = one([[0, 0, K('skin', 2)], [1, 0, hairFree], [2, 0, rgba('#140c18')], [3, 0, [30, 20, 30]], [4, 0, [255, 255, 255]], [5, 0, [120, 200, 30]], [6, 0, skinDeep], [7, 0, skinHigh]]);
    const r = deriveMask(im, ['skin', 'hair'], HC);
    t.eq([0, 1, 6, 7].map((i) => [HC.MATERIALS[matOf(r.codes[i])], shadeOf(r.codes[i])]), [['skin', 2], ['hair', 3], ['skin', 0], ['skin', 4]], 'an exact key shade, a free value between shades (2.6, 6° off), and values beyond both ends of the key ramp (−0.4, 4.4) take their family');
    t.eq([...im.data.subarray(4, 7)], hairFree, 'a free value keeps its painted colour (v3: nothing is snapped to five shades)');
    t.eq([r.codes[2], r.codes[3], r.codes[4], r.codes[5]], [1, 1, 1, 1], 'outline ink, a near-black within the outline radius, white and a far colour are fixed');
    t.eq(r.unresolved.length, 0, 'no unresolved pixels');
    t.ok(r.values.skin === 3 && r.values.hair === 1, 'the derivation counts the painted values per family (' + JSON.stringify(r.values) + ')');
  }
  {
    // a colour between inner and outer of the skin family: unresolved, the import of such a file fails
    const c = between('skin', 3, I.inner + 0.004, I.outer - 0.004), im = one([[10, 10, c]]);
    const r = deriveMask(im, ['skin', 'hair'], HC);
    t.ok(r.unresolved.length === 1 && /between inner/.test(r.unresolved[0].why), 'a colour ' + r.unresolved[0].dist + ' from the skin family (inner ' + I.inner + ', outer ' + I.outer + ') is unresolved (' + JSON.stringify(r.unresolved[0]) + ')');
    const far = between('skin', 3, I.outer + 0.01, I.outer + 0.05);
    t.eq(deriveMask(one([[10, 10, far]]), ['skin', 'hair'], HC).codes[10 * W + 10], 1, 'just beyond outer (' + dist(far, 'skin').toFixed(3) + ') it is fixed');
    const acc = one([[3, 3, K('accessory', 2)], [4, 3, fam('accessory', 1.5, 0.02, 2)]]);
    const r2 = deriveMask(acc, ['hair'], HC);
    t.ok(r2.unresolved.length === 2 && r2.unresolved.every((u) => /may not contain accessory/.test(u.why)), 'a key colour (or a value on the curve) of a family the kind may not hold is unresolved');
    // a legitimate fixed colour merely near a foreign family (the sample flower's orange centre, 0.118 from the skin
    // family) stays fixed: the foreign test is for colours practically on that family's curve (within foreign)
    const orange = [0xce, 0x6d, 0x1c];
    t.ok(dist(orange, 'skin') > I.foreign && deriveMask(one([[0, 0, orange]]), ['accessory'], HC).codes[0] === 1, 'an orange flower centre ' + dist(orange, 'skin').toFixed(3) + ' from the skin family stays fixed in an accessory file (foreign ' + I.foreign + ')');
    // through the importer: the file is refused and nothing is written for it
    const res = normaliseFile(encodePNG(im), 'pc_head_focus', { HC });
    t.ok(res.rep.errors.some((e) => /unresolved pixels/.test(e)), 'normaliseFile reports the unresolved pixel as an error: ' + res.rep.errors.join('; '));
  }
  {
    // a supplied mask decides an unresolved colour (kept as painted), keeps protected pixels fixed, and refuses a colour
    // far outside the family it is marked as
    const mid = between('skin', 2, I.inner + 0.004, I.outer - 0.004);
    const im = one([[5, 5, mid], [6, 5, rgba('#140c18')], [7, 5, [90, 90, 90]], [8, 5, [60, 200, 90]]]);
    const mk = one([[5, 5, [255, 0, 0]], [6, 5, [255, 0, 0]], [7, 5, [0, 0, 0]], [8, 5, [255, 0, 0]]]);
    const r = readMask(im, mk, ['skin', 'hair'], HC);
    t.eq(HC.MATERIALS[matOf(r.codes[5 * W + 5])], 'skin', 'a supplied mask decides a colour the derivation leaves unresolved');
    t.eq([...im.data.subarray(4 * (5 * W + 5), 4 * (5 * W + 5) + 3)], mid, 'and the colour is kept as painted');
    t.eq(r.codes[5 * W + 6], 1, 'outline ink stays fixed even when the mask says skin');
    t.ok(r.warnings.some((w) => /kept fixed/.test(w)), 'and the importer says so');
    t.ok(r.errors.some((e) => e.x === 8 && /from its key family/.test(e.why)), 'a green marked as skin (' + dist([60, 200, 90], 'skin').toFixed(2) + ' from the family) is refused');
    const bad = readMask(im, one([[5, 5, [0, 255, 0]], [6, 5, [17, 200, 99]]]), ['skin'], HC);
    t.ok(bad.errors.some((e) => /not allowed/.test(e.why)) && bad.errors.some((e) => /not a mask colour/.test(e.why)) && bad.errors.some((e) => /transparent under/.test(e.why)), 'a supplied mask with a disallowed material, an unknown colour or a hole is refused');
    // codesFrom (the runtime's and --verify's reading) agrees with the importer's codes
    const mi = maskImage(r.codes, W, H, HC);
    const back = codesFrom(im, mi, HC);
    t.eq(back.errors, [], 'the normalised pixels and their mask read back without errors');
    t.ok(back.codes.every((c, i) => c === r.codes[i]), 'and give the same codes');
  }
  {
    const im = one([[1, 1, K('clothMain', 1)]]);
    t.eq(fixedKeyColours(im, Uint8Array.from({ length: W * H }, (_, i) => (i === W + 1 ? 1 : 0)), HC).length, 1, 'a fixed pixel in a key colour is found (it would survive recolouring)');
  }

  // ---- whole files: refusals and keying --------------------------------------------------------------------------------
  {
    const checker = blank(64, 64);
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) checker.data.set(((x >> 3) + (y >> 3)) % 2 ? [204, 204, 204, 255] : [255, 255, 255, 255], 4 * (y * 64 + x));
    t.ok(normaliseFile(encodePNG(checker), 'suzu_peak', { HC }).rep.errors.some((e) => /checkerboard/.test(e)), 'a painted checkerboard background is refused');
    // the gaps the v2 test left (it needed an opaque file with exactly two greys in all four corners)
    let sd = 5; const rnd = () => ((sd = (Math.imul(sd, 1664525) + 1013904223) >>> 0) / 4294967296);
    const chk = (w, h, cell, a, b, noise) => { const im = blank(w, h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = ((Math.floor(x / cell) + Math.floor(y / cell)) & 1) ? a : b, nz = () => Math.round((rnd() - 0.5) * noise); im.data.set([v + nz(), v + nz(), v + nz(), 255], 4 * (y * w + x)); } return im; };
    const paintArt = (im, x0, y0, x1, y1) => { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) im.data.set([150 + ((x * 7 + y * 3) % 60), 60 + ((x + y) % 40), 40, 255], 4 * (y * im.w + x)); };
    const noisy = chk(768, 640, 16, 204, 250, 10); paintArt(noisy, 200, 120, 768, 640);
    const nr = normaliseFile(encodePNG(noisy), 'suzu_peak', { HC });
    t.ok(nr.rep.errors.some((e) => /checkerboard/.test(e)) && nr.rep.checkerboard.cell === 16, 'a noisy checkerboard (±5 per channel) under art that covers three corners is refused by name (' + JSON.stringify(nr.rep.checkerboard) + ')');
    const padded = blank(1024, 1024), inner = chk(1024, 853, 12, 153, 204, 6); paintArt(inner, 300, 200, 760, 853); padded.data.set(inner.data, 4 * 1024 * 85);
    const pr = normaliseFile(encodePNG(padded), 'suzu_peak', { HC });
    t.ok(pr.rep.errors.some((e) => /checkerboard/.test(e)), 'a checkerboard inside a file that also has real transparency (padding) is refused — v2 imported it as art');
    const flatGrey = chk(768, 640, 16, 230, 230, 4); paintArt(flatGrey, 200, 120, 600, 640);
    t.eq(looksLikeCheckerboard(flatGrey), null, 'a flat grey background is not a checkerboard (it is refused as "no transparency" instead)');
    const fp = [];
    for (const dir of ['tests/fixtures/harmony_sample/incoming', 'tests/fixtures/harmony_rich/incoming']) for (const f of fs.readdirSync(path.join(root, dir)).filter((f) => f.endsWith('.png'))) if (looksLikeCheckerboard(decodePNG(fs.readFileSync(path.join(root, dir, f))))) fp.push(f);
    t.eq(fp, [], 'no fixture file is taken for a checkerboard');
    // (corners clear of art: 'auto' keys a background only when all four corners are that magenta)
    const base = art(3); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (x < 16 || y < 16 || x >= W - 16 || y >= H - 16) base.data.fill(0, 4 * (y * W + x), 4 * (y * W + x) + 4);
    const flat = enlarge(base, 3, 576, 480, 0, 0);
    for (let i = 0; i < flat.w * flat.h; i++) if (!flat.data[4 * i + 3]) flat.data.set([255, 0, 255, 255], 4 * i);
    const r = normaliseFile(encodePNG(flat), 'suzu_peak', { HC });
    t.ok(!r.rep.errors.length && r.rep.warnings.some((w) => /#ff00ff background/.test(w)), 'a flat magenta background is keyed out: ' + r.rep.errors.join('; '));
    t.eq(diffPx(r.img, base), 0, 'and the art underneath is intact');
    const flat2 = enlarge(art(3), 3, 576, 480, 0, 0);
    for (let i = 0; i < flat2.w * flat2.h; i++) if (!flat2.data[4 * i + 3]) flat2.data.set([255, 0, 255, 255], 4 * i);
    t.ok(!normaliseFile(encodePNG(flat2), 'suzu_peak', { HC, fileCfg: { background: 'magenta' } }).rep.errors.length, 'background: "magenta" in import.json keys it even when art touches a corner');
    const opaque = enlarge(art(3), 3, 576, 480, 0, 0);
    for (let i = 0; i < opaque.w * opaque.h; i++) if (!opaque.data[4 * i + 3]) opaque.data.set([10, 200, 10, 255], 4 * i);
    t.ok(normaliseFile(encodePNG(opaque), 'suzu_peak', { HC }).rep.errors.some((e) => /no transparency/.test(e)), 'an opaque file without a magenta background is refused');
    const good = encodePNG(art(5));
    const inter = Buffer.from(good); inter[28] = 1;
    const { crc32 } = await import('../../tools/harmony/png.mjs'); inter.writeUInt32BE(crc32(inter, 12, 29), 29);
    t.ok(normaliseFile(inter, 'suzu_peak', { HC }).rep.errors.some((e) => /interlaced/.test(e)), 'an interlaced file is refused by name');
    t.ok(normaliseFile(good, 'suzu_wave', { HC }).rep.errors.some((e) => /not a contract file name/.test(e)), 'a name outside the contract is refused');
    t.ok(normaliseFile(good, 'acc_tiara', { HC }).rep.errors.some((e) => /unknown accessory/.test(e)), 'an unknown accessory file is refused');
    t.ok(normaliseFile(encodePNG(Object.assign(art(5), {})), 'suzu_peak', { HC, fileCfg: { offset: [100, 0] } }).rep.errors.some((e) => /outside the 192/.test(e)), 'art pushed off the canvas by an offset is refused');
  }
  // ---- offset suggestion -------------------------------------------------------------------------------------------------
  {
    const ref = art(9), moved = place(ref, W, H, 5, -3).img;
    const s = suggestOffset(moved, ref, HC.ANCHORS.comp.head, 12);
    t.eq([s.dx, s.dy], [-5, 3], 'the silhouette match finds a 5, −3 px misplacement (IoU ' + s.iou + ')');
  }

  // ---- the committed synthetic sample: import, manifest, verify, --check writes nothing ---------------------------------
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-harmony-'));
  try {
    const inDir = path.join(root, 'tests/fixtures/harmony_sample/incoming');
    const res = importSet(inDir, { out: tmp, replace: true });
    t.ok(res.report.ok, 'the synthetic sample imports without errors: ' + JSON.stringify(res.report.summary) + ' ' + res.report.errors.join('; '));
    t.eq(HC.validateManifest(res.manifest, fs.readdirSync(tmp)), [], 'its manifest passes the schema');
    t.ok(res.manifest.synthetic === true && res.manifest.contractVersion === HC.VERSION, 'the manifest is marked synthetic and contract v' + HC.VERSION);
    const kinds = Object.values(res.report.files).map((f) => f.grid.cell[0]);
    t.ok(kinds.includes(1) && kinds.includes(4) && kinds.includes(3) && kinds.some((c) => Math.abs(c - 1024 / 192) < 0.002), 'the sample exercises native, 3×, 4× and 5.333× files');
    t.ok(Object.values(res.manifest.files).some((f) => f.maskSource === 'supplied') && Object.values(res.manifest.files).some((f) => f.maskSource === 'derived'), 'both supplied and derived masks');
    t.eq(res.manifest.companions.suzu.states, ['prep_a', 'prep_b', 'cue', 'peak', 'settle_b'], "Suzu's states (settle_a left out on purpose)");
    const v = verifySet(tmp);
    t.ok(v.ok && v.files === Object.keys(res.manifest.files).length, '--verify passes on the written set: ' + v.errors.slice(0, 3).join('; '));
    t.ok(decodePNG(fs.readFileSync(path.join(tmp, 'suzu_peak.png'))).info.text.Comment === 'SYNTHETIC SAMPLE — not art', 'normalised sample files carry the synthetic label');
    // --verify catches a changed file
    const p = path.join(tmp, 'acc_flower.png'), b = decodePNG(fs.readFileSync(p)); b.data[0] = 1; b.data[3] = 255; fs.writeFileSync(p, encodePNG(b));
    t.ok(!verifySet(tmp).ok, '--verify fails when a file no longer matches its hash');
    const tmp2 = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-harmony-check-'));
    importSet(inDir, { out: tmp2, check: true });
    t.eq(fs.readdirSync(tmp2), [], '--check writes nothing');
    fs.rmSync(tmp2, { recursive: true, force: true });
    // approval and batches (contract v3)
    t.eq(HC.approvalOf(res.manifest), { kit: 'synthetic', pairings: { suzu: 'synthetic' } }, 'the synthetic sample\'s approval is "synthetic" for the kit and the pairing');
    t.ok(res.manifest.batches['1a'].complete && res.manifest.batches['1b'].complete, 'the sample covers Batch 1a (' + res.manifest.batches['1a'].present + '/18) and Batch 1b (' + res.manifest.batches['1b'].present + '/9)');
    const mut = (fn) => { const m = JSON.parse(JSON.stringify(res.manifest)); fn(m); return HC.validateManifest(m); };
    t.ok(mut((m) => { delete m.companions.suzu.approval; }).some((e) => /approval/.test(e)) && mut((m) => { m.pc.approval = 'approved'; }).some((e) => /approval/.test(e)) && mut((m) => { m.synthetic = false; }).some((e) => /approval/.test(e)), 'v3 manifests need an approval per pairing and for the kit; a synthetic set is only ever "synthetic"');
    t.eq(mut((m) => { m.contractVersion = 2; delete m.companions.suzu.approval; delete m.pc.approval; }), [], 'a v2 manifest (no approval) still passes: the game installs it (its kit pixels are exact key shades)');
    t.ok(mut((m) => { m.synthetic = false; m.companions.suzu.approval = 'approved'; m.pc.approval = 'candidate'; }).length === 0, 'a real set may carry candidate / approved per pairing and kit');
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }

  // ---- cue_b (Robin's decision, 2026-10-05): a seventh, optional state; a delivered <comp>_cue_b is imported as it --------
  // (the sample with a copy of its own cue frame as suzu_cue_b: a stand-in for the in-between, not art)
  {
    const work = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-harmony-cueb-'));
    try {
      const inDir = path.join(work, 'in'), out = path.join(work, 'out');
      fs.cpSync(path.join(root, 'tests/fixtures/harmony_sample/incoming'), inDir, { recursive: true });
      fs.copyFileSync(path.join(inDir, 'suzu_cue.png'), path.join(inDir, 'suzu_cue_b.png'));
      const cfg = JSON.parse(fs.readFileSync(path.join(inDir, 'import.json'), 'utf8'));
      if (cfg.companions && cfg.companions.suzu && cfg.companions.suzu.face && cfg.companions.suzu.face.cue) cfg.companions.suzu.face.cue_b = cfg.companions.suzu.face.cue.slice();
      fs.writeFileSync(path.join(inDir, 'import.json'), JSON.stringify(cfg, null, 1));
      const res = importSet(inDir, { out, replace: true });
      const st = res.manifest.companions.suzu.states;
      t.ok(res.report.ok && JSON.stringify(st) === JSON.stringify(['prep_a', 'prep_b', 'cue', 'cue_b', 'peak', 'settle_b']) && res.manifest.files.suzu_cue_b && fs.existsSync(path.join(out, 'suzu_cue_b.png')), 'a delivered suzu_cue_b is imported as the state cue_b, in state order (' + st.join(', ') + ')');
      t.eq(HC.validateManifest(res.manifest, fs.readdirSync(out)), [], 'its manifest passes the schema at both modes');
      t.ok(res.manifest.batches['1a'].optionalPresent.includes('suzu_cue_b'), 'Batch 1a lists suzu_cue_b among its optional files');
      const span = (mode) => { const e = HC.timeline(st, null, mode).find((x) => x.phase === 'cue_b'); return e && [e.seg, e.from, e.to]; };
      t.eq([span('normal'), span('fast')], [['hold', 0.11, 0.19], ['hold', 0.105, 0.21]], 'its span: Normal 0.11–0.19 of the hold, Fast 0.105–0.21');
      t.ok(verifySet(out).ok, '--verify passes on the seven-file companion set');
    } finally { fs.rmSync(work, { recursive: true, force: true }); }
  }

  // ---- the rich fixture (contract v3): many values per family, against its ground truth --------------------------------
  {
    const tmp3 = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-harmony-rich-'));
    try {
      const rd = path.join(root, 'tests/fixtures/harmony_rich');
      const rr = importSet(path.join(rd, 'incoming'), { out: tmp3, replace: true });
      const unresolved = Object.values(rr.report.files).reduce((n, f) => n + (f.unresolvedCount || 0), 0);
      t.ok(rr.report.ok && unresolved === 0, 'the rich fixture imports with no unresolved pixel: ' + JSON.stringify(rr.report.summary));
      const MC = HC.MATERIALS.map((m) => rgba(HC.MASK[m]).slice(0, 3).join(','));
      let wrong = 0, kept = 0, changed = 0, checked = 0;
      const vals = {};
      for (const d of rr.done) {
        if (!d.codes || !HC.allowedOf(d.parsed).length) continue;
        const tm = decodePNG(fs.readFileSync(path.join(rd, 'truth', d.name + '.mask.png')));
        const src = decodePNG(fs.readFileSync(path.join(tmp3, d.name + '.png')));
        for (let i = 0; i < W * H; i++) {
          if (!d.codes[i]) continue;
          checked++;
          const truth = MC.indexOf([tm.data[4 * i], tm.data[4 * i + 1], tm.data[4 * i + 2]].join(','));
          const got = d.codes[i] === 1 ? -1 : matOf(d.codes[i]);
          if (truth !== got) wrong++;
          if (got >= 0) { if (src.data[4 * i] === d.img.data[4 * i] && src.data[4 * i + 1] === d.img.data[4 * i + 1] && src.data[4 * i + 2] === d.img.data[4 * i + 2]) kept++; else changed++; }
        }
        for (const [m, k] of Object.entries(d.rep.values || {})) vals[m] = Math.max(vals[m] || 0, k);
      }
      t.eq(wrong, 0, 'every one of ' + checked + ' opaque kit pixels gets its true material (or fixed), from colour alone');
      t.ok(kept > 10000 && changed === 0, 'every material pixel is written exactly as painted (' + kept + ' pixels)');
      t.ok(Object.values(vals).every((k) => k >= 20), 'and the families keep their many painted colours (most in one file: ' + JSON.stringify(vals) + ')');
      t.ok(verifySet(tmp3).ok, '--verify accepts the written rich set (material pixels inside their families)');
    } finally { fs.rmSync(tmp3, { recursive: true, force: true }); }
  }

  // ---- regeneration, provenance (contract v3 §1, §9) -------------------------------------------------------------------------
  {
    const work = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-harmony-regen-'));
    try {
      // a batch folder as it would be committed: the sample plus a provenance note
      const b1 = path.join(work, 'batch_a');
      fs.cpSync(path.join(root, 'tests/fixtures/harmony_sample/incoming'), b1, { recursive: true });
      fs.writeFileSync(path.join(b1, 'PROVENANCE.md'), '# SYNTHETIC SAMPLE — not art\n\nTest provenance note.\n');
      const out = path.join(work, 'assets');
      const dirs = [b1, path.join(root, 'tests/fixtures/harmony_rich/incoming')];
      const hashAll = () => { const m = {}; const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const q = path.join(d, e.name); if (e.isDirectory()) walk(q); else m[path.relative(out, q)] = crypto.createHash('sha256').update(fs.readFileSync(q)).digest('hex'); } }; walk(out); return m; };
      const first = importSets(dirs, { out, replace: true });
      const h1 = hashAll();
      fs.rmSync(out, { recursive: true, force: true });
      importSets(dirs, { out, replace: true });
      const h2 = hashAll();
      const diff = Object.keys(Object.assign({}, h1, h2)).filter((k) => h1[k] !== h2[k]);
      t.ok(first.ok && Object.keys(h1).length > 50 && !diff.length, 'two batches imported in order regenerate the output byte for byte (' + Object.keys(h1).length + ' files: PNGs, masks, manifest, provenance, report; differing: ' + JSON.stringify(diff) + ')');
      t.ok(h1['provenance/sample.md'] && first.manifest.source.provenance.sample.sha256 === h1['provenance/sample.md'], 'the batch\'s PROVENANCE.md travels with it (provenance/sample.md, its hash in the manifest)');
      t.ok(first.manifest.source.registry && !first.manifest.source.registry.indexHtml && /^[0-9a-f]{64}$/.test(first.manifest.source.registry.assetKeysSha256), 'the manifest names the registry by its asset keys only (a later build gives the same manifest)');
      t.ok(first.all.length === 2 && first.all[1].report.set === 'rich' && first.manifest.source.sets.join() === 'sample,rich', 'the second batch merged over the first (sets: ' + first.manifest.source.sets.join(', ') + ')');
      // a folder under art/harmony/source/ without PROVENANCE.md is refused
      const src = path.join(root, 'art/harmony/source');
      const probe = fs.existsSync(src) ? null : src;
      const nb = path.join(src, '__unit_test_no_provenance__');
      fs.mkdirSync(nb, { recursive: true });
      try {
        fs.copyFileSync(path.join(root, 'tests/fixtures/harmony_sample/incoming/acc_flower.png'), path.join(nb, 'acc_flower.png'));
        const r = importSet(nb, { out: path.join(work, 'x'), check: true });
        t.ok(r.report.errors.some((e) => /PROVENANCE\.md/.test(e)), 'a batch in art/harmony/source/ without PROVENANCE.md is refused: ' + r.report.errors.join('; '));
      } finally { fs.rmSync(nb, { recursive: true, force: true }); if (probe) fs.rmSync(probe, { recursive: true, force: true }); }
    } finally { fs.rmSync(work, { recursive: true, force: true }); }
  }

  // ---- the batches (contract v3 §1.1) --------------------------------------------------------------------------------------------
  {
    const reg = JSON.parse(fs.readFileSync(path.join(root, 'docs/harmony/contract/registry.json'), 'utf8'));
    const keys = new Set(reg.assetKeys.required.concat(reg.assetKeys.optional));
    const B = HC.BATCHES;
    t.eq([B['1a'].required.length, B['1b'].required.length], [18, 9], 'Batch 1a has 18 required files, Batch 1b 9');
    const bad = [];
    for (const [id, b] of Object.entries(B)) for (const n of b.required.concat(b.optional)) { const q = HC.parse(n); if (!q) bad.push(id + ' ' + n + ': not a contract name'); else if (!keys.has(n) && !(q.kind === 'comp' && q.layer === 'fx')) bad.push(id + ' ' + n + ': not a registry asset key'); }
    t.eq(bad, [], 'every batch file is a contract name and a registry asset key (effects aside)');
    t.ok(B['1a'].required.includes('acc_satchel') && B['1b'].required.includes('acc_headband') && HC.ACC.headband.hair && HC.ACC.headband.channel, 'the satchel is in look A (the owner\'s mockup shows its strap); look B proves a hair-mounted recolourable accessory (the headband) on another hairstyle');
  }
};
