// The Harmony art importer (tools/harmony_import.mjs and tools/harmony/*.mjs; docs/harmony/contract/CONTRACT.md §9):
// grid detection (whole and fractional enlargements, padding, noise), cell-centre majority, binary alpha,
// magenta keying, checkerboard and interlace refusals, mask derivation (snapping, protected ink and highlights,
// refusal on unresolved pixels and on key colours a kind may not hold), supplied masks overriding, fixed pixels in
// key colours refused, offset suggestions, and a whole import + verify of the committed synthetic sample.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { decodePNG, encodePNG } from '../../tools/harmony/png.mjs';
import { detectGrid, downsample, binarize, place } from '../../tools/harmony/grid.mjs';
import { deriveMask, readMask, fixedKeyColours, codesFrom, maskImage, matOf, shadeOf } from '../../tools/harmony/masks.mjs';
import { normaliseFile, importSet, verifySet, suggestOffset } from '../../tools/harmony/importer.mjs';
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

  // ---- mask derivation --------------------------------------------------------------------------------------------------
  const K = (m, s) => rgba(HC.KEY_RAMPS[m][s]);
  const one = (pixels) => { const im = blank(W, H); pixels.forEach(([x, y, c]) => im.data.set(c.length === 4 ? c : [...c, 255], 4 * (y * W + x))); return im; };
  {
    const im = one([[0, 0, K('skin', 2)], [1, 0, [K('hair', 3)[0] + 5, K('hair', 3)[1] - 4, K('hair', 3)[2] + 3]], [2, 0, rgba('#140c18')], [3, 0, [30, 20, 30]], [4, 0, [255, 255, 255]], [5, 0, [120, 200, 30]]]);
    const r = deriveMask(im, ['skin', 'hair'], HC);
    t.eq([r.codes[0], r.codes[1]].map((c) => [HC.MATERIALS[matOf(c)], shadeOf(c)]), [['skin', 2], ['hair', 3]], 'exact and near (within 12) key shades become their material and shade');
    t.eq([...rgba(HC.KEY_RAMPS.hair[3])].slice(0, 3), [...im.data.subarray(4, 7)], 'a near key pixel is snapped to the exact key colour');
    t.eq([r.codes[2], r.codes[3], r.codes[4], r.codes[5]], [1, 1, 1, 1], 'outline ink, a near-black within the outline radius, white and a far colour are fixed');
    t.eq(r.unresolved.length, 0, 'no unresolved pixels');
  }
  {
    // 20 away from a skin key shade: neither snapped nor clearly fixed → unresolved, the import of such a file fails
    const k = K('skin', 3), im = one([[10, 10, [k[0] - 12, k[1] + 12, k[2] + 10]]]);
    const r = deriveMask(im, ['skin', 'hair'], HC);
    t.ok(r.unresolved.length === 1 && /between snap/.test(r.unresolved[0].why), 'a pixel between the snap and the ambiguous distance is unresolved (' + JSON.stringify(r.unresolved[0]) + ')');
    const acc = one([[3, 3, K('accessory', 2)]]);
    const r2 = deriveMask(acc, ['hair'], HC);
    t.ok(r2.unresolved.length === 1 && /may not contain/.test(r2.unresolved[0].why), 'a key colour of a material the kind may not hold is unresolved');
    // through the importer: the file is refused and nothing is written for it
    const res = normaliseFile(encodePNG(im), 'pc_head_focus', { HC });
    t.ok(res.rep.errors.some((e) => /unresolved pixels/.test(e)), 'normaliseFile reports the unresolved pixel as an error: ' + res.rep.errors.join('; '));
  }
  {
    // a supplied mask overrides: a pixel far from every key is declared skin (shade by luminance, rewritten to the key)
    const im = one([[5, 5, [180, 120, 90]], [6, 5, rgba('#140c18')], [7, 5, [90, 90, 90]]]);
    const mk = one([[5, 5, [255, 0, 0]], [6, 5, [255, 0, 0]], [7, 5, [0, 0, 0]]]);
    const r = readMask(im, mk, ['skin', 'hair'], HC);
    t.eq(HC.MATERIALS[matOf(r.codes[5 * W + 5])], 'skin', 'a supplied mask decides the material');
    t.eq(r.codes[5 * W + 6], 1, 'outline ink stays fixed even when the mask says skin');
    t.ok(r.warnings.some((w) => /kept fixed/.test(w)), 'and the importer says so');
    const bad = readMask(im, one([[5, 5, [0, 255, 0]], [6, 5, [17, 200, 99]]]), ['skin'], HC);
    t.ok(bad.errors.some((e) => /not allowed/.test(e.why)) && bad.errors.some((e) => /not a mask colour/.test(e.why)) && bad.errors.some((e) => /transparent under/.test(e.why)), 'a supplied mask with a disallowed material, an unknown colour or a hole is refused');
    // codesFrom (the runtime's reading) agrees with the importer's codes after rewriting
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
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
};
