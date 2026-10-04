// The keyify step (tools/harmony_keyify.mjs, tools/harmony/keyify.mjs; docs/harmony/contract/CONTRACT.md §5.5) on the
// SYNTHETIC kits — key-coloured fixtures, not art. The synthetic sample (five exact key shades per family) and the rich
// fixture (9–11 values per family with hue and chroma jitter, rim and warm lights) are recoloured into look A's real
// colours by the game's own runtime (src/ui/88_harmony_raster.js), delivered as real-colour layers (some enlarged, one
// on a magenta background), converted back to key families by keyify, imported by the importer, and recoloured into
// eight looks; the busts are compared with the same looks painted from the original key kit.
// Also: the default look file is the game's own ramps; range vs reference value mapping; a layer whose material
// cannot be classified is reported and not written; a supplied mask settles it; a painted checkerboard is refused;
// --sample (reference ramps from a style master and its mask); the output is deterministic.
// KEYIFY_KEEP=1 keeps the scratch folder (the delivery, the look, the master) for inspection.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { encodePNG, decodePNG } from '../../tools/harmony/png.mjs';
import { blank } from '../../tools/harmony/image.mjs';
import { root } from '../../tools/harmony/contract.mjs';
import { keyifyKit, writeKeyified, readLook, gameRamp, sampleLook, FLAG } from '../../tools/harmony/keyify.mjs';
import { loadRuntime, importToMemory, bustsOf, diffImages, proofLooks, stats, validate, syntheticDelivery, enlargeImg, settleMasks } from '../../tools/harmony/keyify_report.mjs';

const W = 192, H = 160;
const hex = (d, o) => '#' + [d[o], d[o + 1], d[o + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');

export default async (t) => {
  const RB = loadRuntime(), HC = RB.harmonyContract, C = HC.colour;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-keyify-test-'));
  try {
    const look = readLook();
    // ---- the default look file: the game's own ramps for its game look --------------------------------------------
    for (const key of ['skin', 'hair', 'clothMain', 'clothTrim', 'accessory:flower']) {
      const g = gameRamp(RB, HC, look.game, key), [m, a] = key.split(':'), j = m === 'accessory' ? look.materials.accessory[a] : look.materials[m];
      t.eq([j.tones, j.pick], [g.tones, g.pick], 'lookA.json ' + key + ' is the game\'s ramp for its game look');
    }
    const rows = RB.harmonyRaster._.rampsOf(look.game).rows;
    t.eq(C.targetCurve(look.materials.skin.tones.map(C.hexRgb), look.materials.skin.pick).map((n) => +n.L.toFixed(6)), rows.skin.curve.map((n) => +n.L.toFixed(6)), 'the skin reference curve is the runtime\'s target curve (value floor included)');

    // ---- the synthetic sample, in look A's real colours (the delivery: tools/harmony/keyify_report.mjs syntheticDelivery) --
    const sampleDir = path.join(root, 'tests/fixtures/harmony_sample/incoming');
    const D = await syntheticDelivery(RB, tmp);
    const { sample, kitNames, layers, inDir, maskDir } = D, testLook = D.look;
    t.ok(sample.report.ok && kitNames.length === 25, 'the synthetic sample imports and its 25 kit files are recoloured into look A');
    const cfg = JSON.parse(fs.readFileSync(path.join(inDir, 'import.json'), 'utf8'));
    // the code bust's mouth (#4a1a24) lies 0.0096 from auburn hair's darkest value: a real ambiguity in real colours.
    // Its neighbours (the rest of the mouth) decide it, reported; a supplied mask — here partial: only those pixels,
    // the rest classified — decides it outright, as the contract settles any ambiguity
    const pre = keyifyKit(inDir, { look: testLook, RB, values: 'reference' });
    const pc = pre.report.files.pc_head_cue, preF = pre.files.find((f) => f.name === 'pc_head_cue');
    let mouthN = 0, mouthFixed = 0;
    for (let i = 0; i < W * H; i++) if (preF.img.data[4 * i + 3] && hex(preF.img.data, 4 * i) === '#4a1a24') { mouthN++; if (preF.cls[i] === -1 && preF.flags[i] & FLAG.neighbours) mouthFixed++; }
    let mouthOpen = 0, mouthHair = 0;
    for (let i = 0; i < W * H; i++) if (preF.img.data[4 * i + 3] && hex(preF.img.data, 4 * i) === '#4a1a24') { if (preF.cls[i] === -3) mouthOpen++; if (preF.cls[i] === 1) mouthHair++; }
    t.ok(mouthN === 9 && mouthFixed + mouthOpen === 9 && mouthFixed > 0 && mouthOpen > 0 && !mouthHair && pc.flags.neighbours === mouthFixed && pc.unresolvedCount === mouthOpen && pc.warnings.some((w) => /decided by their neighbours/.test(w)), 'without a mask the ambiguous mouth colour is never guessed: ' + mouthFixed + ' pixels decided by their neighbours (reported), ' + mouthOpen + ' unresolved');
    // ---- reference mapping: the delivery converted, imported, recoloured into eight looks -------------------------------
    const looks = proofLooks(look.game);
    const ref = await busts(sample, looks);
    async function busts(set, ls) { return bustsOf(RB, set, ls, ['peak', 'suzu']); }
    async function run(name, opt, lk) {
      const res = keyifyKit(inDir, Object.assign({ look: lk || testLook, RB, masksDir: maskDir }, opt));
      const outDir = path.join(tmp, name);
      const w = writeKeyified(res, outDir);
      const imp = importToMemory(outDir);
      return { res, w, imp, outDir };
    }
    function compare(a, b) {
      const per = a.map((x, i) => { const d = diffImages(x.img, b[i].img, C); return Object.assign(stats(d.list), { changed: d.changed, alpha: d.alpha, over: d.list.filter((v) => v > 0.02).length }); });
      const all = []; a.forEach((x, i) => all.push(...diffImages(x.img, b[i].img, C).list));
      return { per, all: Object.assign(stats(all), { alpha: per.reduce((s, p) => s + p.alpha, 0), over: per.reduce((s, p) => s + p.over, 0) }) };
    }
    const settle = (dir, mdir, first, truthOf, opt) => settleMasks(RB, dir, maskDir, mdir, first, truthOf, opt);
    const sampleTruth = (n) => decodePNG(Buffer.from(sample.files[sample.manifest.files[n].mask], 'base64'));
    const R1 = await run('out_ref', { values: 'reference' });
    t.ok(R1.res.ok && R1.res.report.unresolved === 0, 'reference: every pixel classified (' + JSON.stringify(R1.res.report.summary) + ')');
    t.eq(R1.res.report.files.pc_head_cue.flags.masked, 9, 'the partial mask decides the mouth pixels it covers');
    t.ok(R1.imp.report.ok && R1.imp.verify.ok, 'reference: the converted folder imports and verifies (' + JSON.stringify(R1.imp.report.summary) + ')');
    t.eq(Object.values(R1.imp.manifest.files).filter((f) => f.kind !== 'comp').map((f) => f.maskSource).filter((s) => s !== 'supplied'), [], 'every kit file is imported with keyify\'s mask');
    t.eq(R1.w.written.length, kitNames.length + 6, 'all ' + kitNames.length + ' kit files written, and Suzu\'s 6 frames copied');
    t.ok(fs.readFileSync(path.join(R1.outDir, 'suzu_peak.png')).equals(fs.readFileSync(path.join(sampleDir, 'suzu_peak.png'))), 'companion frames are copied byte for byte');
    t.eq(R1.res.report.files.pc_torso_coat.grid.cell, [4, 4], 'a 4× layer is read on its grid'); t.ok(R1.res.report.files.acc_flower.grid.cell.every((v) => Math.abs(v - 1024 / 192) < 0.01), 'the 1024 square is read at 5.333× (' + R1.res.report.files.acc_flower.grid.cell.join(' × ') + ')');
    t.ok(R1.res.report.files.pc_head_focus.warnings.some((w) => /keyed out/.test(w)), 'the magenta background is keyed out');
    // the materials keyify found = the materials of the original key kit, pixel for pixel (decided by neighbours included)
    const MC = { '255,0,0': 0, '0,255,0': 1, '0,0,255': 2, '255,255,0': 3, '255,0,255': 4, '0,0,0': -1 };
    function agreement(res, truthOf) {
      let agree = 0, differ = 0, byNeighbours = 0;
      for (const f of res.files.filter((q) => q.cls)) {
        const tr = truthOf(f.name);
        for (let i = 0; i < W * H; i++) {
          if (f.cls[i] === -2 || f.partOf[i] === 'protected') continue;
          const o = 4 * i, tm = MC[tr.data[o] + ',' + tr.data[o + 1] + ',' + tr.data[o + 2]];
          if (tm === f.cls[i]) agree++; else differ++;
          if (f.flags[i] & FLAG.neighbours) byNeighbours++;
        }
      }
      return { agree, differ, byNeighbours };
    }
    let agree = 0, differ = 0;
    for (const n of kitNames) {
      const a = sampleTruth(n), b = decodePNG(Buffer.from(R1.imp.files[R1.imp.manifest.files[n].mask], 'base64'));
      for (let i = 0; i < W * H; i++) { const o = 4 * i; if (!a.data[o + 3]) continue; if (a.data[o] === b.data[o] && a.data[o + 1] === b.data[o + 1] && a.data[o + 2] === b.data[o + 2]) agree++; else differ++; }
    }
    t.ok(differ === 0, 'the imported masks equal the original kit\'s on every opaque pixel (' + agree + ' agree, ' + differ + ' differ)');
    const a1 = agreement(R1.res, sampleTruth);
    t.ok(a1.differ === 0, 'reference: keyify\'s materials = the original kit\'s on every unprotected pixel (' + a1.agree + ' agree, ' + a1.differ + ' differ; ' + a1.byNeighbours + ' decided by neighbours)');
    const b1 = await busts(R1.imp, looks), c1 = compare(ref, b1);
    t.log('reference mapping, sample: busts in ' + looks.length + ' looks vs the original key kit: ΔE mean ' + c1.all.mean + ', p95 ' + c1.all.p95 + ', max ' + c1.all.max + ', over 0.02: ' + c1.all.over + ' of ' + c1.all.n);
    // tolerance: half a just-noticeable difference (ΔE 0.01). The chain rounds to 8 bits twice (look A, then the key
    // colour), and a target ramp steeper than look A's can stretch one 8-bit step; anything a viewer could see is a failure
    t.ok(c1.all.alpha === 0 && c1.all.max <= 0.01, 'reference: every look matches the original kit within ΔE 0.01 (max ' + c1.all.max + ')');

    // ---- range mapping (the default): the painted range → s0…s4 ----------------------------------------------------------
    const R2 = await run('out_range', {});
    t.ok(R2.res.ok && R2.imp.report.ok && R2.imp.verify.ok, 'range: converts, imports and verifies');
    const K2 = R2.res.report.kit;
    t.ok(Object.values(K2).every((k) => k.t[0] === 0 && k.t[1] === 4 && k.mode === 'range'), 'range: every material reaches exactly s0 and s4 (' + Object.entries(K2).map(([k, v]) => k + ' ' + v.t.join('…')).join(', ') + ')');
    t.ok(Object.values(K2).every((k) => k.keyValues === k.values && !k.merged.length), 'range: every painted value keeps its own key colour (' + Object.entries(K2).map(([k, v]) => k + ' ' + v.values + '→' + v.keyValues).join(', ') + ')');
    t.ok(R2.res.report.warnings.some((w) => /^clothTrim: range mapping stretches/.test(w)) && R2.res.report.warnings.some((w) => /^accessory:headband: range mapping stretches/.test(w)), 'range: the sample\'s trim and headband (painted without their lightest key shade) are reported as stretched');
    const b2 = await busts(R2.imp, looks), c2 = compare(ref, b2);
    t.log('range mapping, sample: busts vs the original kit: ΔE mean ' + c2.all.mean + ', p95 ' + c2.all.p95 + ', max ' + c2.all.max + ', over 0.02: ' + c2.all.over + ' of ' + c2.all.n + ' (the stretched trim)');
    // where the painted range is the reference's (skin, hair, cloth main, flower), range = reference
    const keysSame = ['skin', 'hair', 'clothMain', 'accessory:flower'];
    let worstSame = 0;
    for (const n of kitNames) {
      const A = R1.res.files.find((f) => f.name === n), B = R2.res.files.find((f) => f.name === n);
      for (let i = 0; i < W * H; i++) { const c = A.cls[i]; if (c < 0) continue; const key = c === 4 ? 'accessory:' + A.parsed.acc : HC.MATERIALS[c]; if (keysSame.includes(key)) worstSame = Math.max(worstSame, Math.abs(A.tKey[i] - B.tKey[i])); }
    }
    t.ok(worstSame < 0.03, 'range = reference (within 8-bit rounding) where the painted range is the reference\'s: max |Δt| ' + worstSame.toFixed(4));

    // ---- the validation report on the converted folder ---------------------------------------------------------------------
    const v = await validate(R2.res, path.join(R2.outDir, 'keyify_report'), { RB, importDir: R2.outDir });
    const V = v.out;
    t.ok(V.import.ok && V.import.verify.ok, 'report: the importer accepts the converted folder');
    t.eq(V.busts.looks.filter((l) => l.painted).length, 8, 'report: the bust is painted in 8 looks');
    t.ok(['files.png', 'looks.png', 'report.json'].every((f) => fs.existsSync(path.join(R2.outDir, 'keyify_report', f))), 'report: files.png, looks.png and report.json written');
    t.ok(V.roundTrip.materials.skin.max === 0 && V.roundTrip.materials.hair.max === 0 && V.roundTrip.materials.clothMain.max === 0, 'report: the round trip gives skin, hair and cloth main back exactly (anchor shades)');
    t.ok(V.roundTrip.materials.clothTrim.max > 0.02, 'report: the round trip shows the stretched trim (max ΔE ' + V.roundTrip.materials.clothTrim.max + ')');
    t.ok(Object.values(V.floor).every((f) => f.pairsUnderJndOnSomeTarget === 0), 'report: no pair of painted values falls under ΔE 0.02 on any of the supported targets (§5.4)');
    t.log('report round trip (range):', Object.entries(V.roundTrip.materials).map(([k, s]) => k + ' mean ' + s.mean + ' max ' + s.max).join('; '));

    // ---- the rich fixture: many values, jitter, rim and warm lights ----------------------------------------------------------
    const DR = await syntheticDelivery(RB, path.join(tmp, 'rich'), { fixture: 'rich', enlarge: false, companions: false });
    const rich = DR.set, inRich = DR.inDir;
    t.ok(rich.report.ok, 'the rich fixture imports over the sample');
    const richRes = keyifyKit(inRich, { look: testLook, RB, values: 'reference', masksDir: maskDir });
    // the colours the rich fixture's jitter pushes next to a fixed colour of the code head (its nose and cheek shading,
    // fixed in the key kit, look like skin in real colours) are reported; a mask over just those pixels settles them,
    // the workflow the report asks for (here painted from the fixture's ground truth)
    const richUnres = Object.entries(richRes.report.files).filter(([, f]) => f.unresolvedCount);
    const nb = Object.values(richRes.report.files).reduce((s, f) => s + ((f.flags || {}).neighbours || 0), 0);
    t.log('rich: ' + richRes.report.unresolved + ' unresolved pixels in ' + richUnres.map(([n, f]) => n + ' ' + f.unresolvedCount).join(', ') + '; ' + nb + ' decided by their neighbours');
    t.ok(richUnres.every(([n]) => /^pc_head_/.test(n)) && richRes.report.unresolved < 40, 'rich: only a few head pixels are left unresolved (' + richRes.report.unresolved + ')');
    const settled = await settle(inRich, path.join(tmp, 'masks_rich'), richRes, (n) => decodePNG(fs.readFileSync(path.join(root, 'tests/fixtures/harmony_rich/truth', n + '.mask.png'))), { look: testLook, values: 'reference' });
    const richRes2 = settled.res, rounds = settled.rounds;
    t.ok(richRes2.ok && richRes2.report.unresolved === 0, 'rich: with masks over the reported pixels (' + rounds + ' rounds), every pixel is placed');
    // every material pixel keyify placed is the fixture's own material (ground truth)
    let rAgree = 0, rDiffer = 0;
    for (const f of richRes2.files.filter((q) => q.cls)) {
      const truth = decodePNG(fs.readFileSync(path.join(root, 'tests/fixtures/harmony_rich/truth', f.name + '.mask.png')));
      const T = { '255,0,0': 0, '0,255,0': 1, '0,0,255': 2, '255,255,0': 3, '255,0,255': 4, '0,0,0': -1 };
      for (let i = 0; i < W * H; i++) { if (f.cls[i] === -2 || f.partOf[i] === 'protected') continue; const o = 4 * i, tm = T[truth.data[o] + ',' + truth.data[o + 1] + ',' + truth.data[o + 2]]; if (tm === f.cls[i]) rAgree++; else { rDiffer++; if (rDiffer < 12) t.log('differs', f.name, i % W, (i / W) | 0, hex(f.img.data, 4 * i), 'truth', tm, 'keyify', f.cls[i], f.partOf[i], f.flags[i]); } }
    }
    t.ok(rDiffer === 0, 'rich: keyify\'s materials = the ground truth on every unprotected pixel (' + rAgree + ' agree, ' + rDiffer + ' differ)');
    t.log('rich: materials = ground truth on ' + rAgree + ' unprotected pixels, ' + rDiffer + ' differ; ' + agreement(richRes2, (n) => decodePNG(fs.readFileSync(path.join(root, 'tests/fixtures/harmony_rich/truth', n + '.mask.png')))).byNeighbours + ' decided by neighbours');
    const outRich = path.join(tmp, 'out_rich');
    writeKeyified(richRes2, outRich);
    const richOut = importToMemory(outRich);
    t.ok(richOut.report.ok && richOut.verify.ok, 'rich: the converted folder imports and verifies');
    const K3 = richRes2.report.kit;
    t.ok(Object.values(K3).every((k) => !k.merged.length), 'rich: no two painted values share a key colour (' + Object.entries(K3).map(([k, v]) => k + ' ' + v.values + '→' + v.keyValues).join(', ') + ')');
    const rr = await busts(rich, looks), r3 = await busts(richOut, looks), c3 = compare(rr, r3);
    t.log('reference mapping, rich: busts vs the original rich kit: ΔE mean ' + c3.all.mean + ', p95 ' + c3.all.p95 + ', max ' + c3.all.max + ', over 0.02: ' + c3.all.over + ' of ' + c3.all.n + '; residual clamped ' + Object.values(K3).reduce((s, k) => s + k.clamped.pixels, 0) + ' px');
    // tolerance: mean ≤ 0.002 and p95 ≤ 0.005 (a quarter of a just-noticeable difference), at most 0.1 % of pixels over
    // 0.02. The chain rounds to 8 bits twice; the fixture's jitter reaches the contract's tolerance (12° and 16 %), and
    // where look A's ramp is less saturated than the key family 8 bits hold less of it (330 px clamped); a value painted
    // within 24 of the outline ink in look A's colours (the teal trim's darkest) is ink to the importer and to keyify:
    // one pixel per look, the max
    t.ok(c3.all.alpha === 0 && c3.all.mean <= 0.002 && c3.all.p95 <= 0.005 && c3.all.over <= c3.all.n / 1000, 'rich: the looks match the original rich kit (mean ' + c3.all.mean + ' ≤ 0.002, p95 ' + c3.all.p95 + ' ≤ 0.005, ' + c3.all.over + ' pixels over 0.02 ≤ 0.1 %)');

    // ---- negative: a material the look cannot place ------------------------------------------------------------------
    const badDir = path.join(tmp, 'in_bad');
    fs.mkdirSync(badDir);
    const hf = layers.pc_hair_ponytail_front, pink = { w: W, h: H, data: new Uint8Array(hf.data) };
    let painted = 0;
    const R1f = R1.res.files.find((f) => f.name === 'pc_hair_ponytail_front');
    for (let i = 0; i < W * H; i++) if (R1f.cls[i] === 3) { pink.data.set([0xe0, 0x70, 0xa0], 4 * i); painted++; }
    fs.writeFileSync(path.join(badDir, 'pc_hair_ponytail_front.png'), encodePNG(pink));
    const bad = keyifyKit(badDir, { look: testLook, RB });
    const bf = bad.report.files.pc_hair_ponytail_front;
    t.ok(!bad.ok && bf.unresolvedCount === painted && bf.unresolved[0].colour === '#e070a0', 'pink ties in a hair layer are reported as unresolved (' + bf.unresolvedCount + ' px, ' + (bf.unresolved[0] || {}).why + ')');
    const wb = writeKeyified(bad, path.join(tmp, 'out_bad'));
    t.eq([wb.written, wb.skipped], [[], ['pc_hair_ponytail_front']], 'a file with unresolved pixels is not written');
    // the hand mask settles it: the ties are trim (their hue is then clamped to the trim family, and reported)
    const mk = blank(W, H);
    for (let i = 0; i < W * H; i++) if (R1f.cls[i] === 3) mk.data.set([255, 255, 0, 255], 4 * i);
    const bm = path.join(tmp, 'masks_bad');
    fs.mkdirSync(bm);
    fs.writeFileSync(path.join(bm, 'pc_hair_ponytail_front.mask.png'), encodePNG(enlargeImg(mk, 4)));
    const fixedBad = keyifyKit(badDir, { look: testLook, RB, masksDir: bm });
    const fb = fixedBad.report.files.pc_hair_ponytail_front;
    t.ok(fixedBad.ok && fb.materials.clothTrim === painted && fb.flags.masked === painted && fb.flags.clamped === painted, 'a supplied mask (at 4×) marks them trim: converted, the clamped residual reported (' + JSON.stringify(fb.flags) + ')');
    // a layer delivered in key colours already (the sample's own flower) is passed through beside real-colour ones,
    // its mask derived as the importer derives it (its leaves and centre are fixed colours: 73 % of it is key colours); the real-colour head is converted, though 27 % of it lies in the skin family
    const mixDir = path.join(tmp, 'in_mixed');
    fs.mkdirSync(mixDir);
    fs.copyFileSync(path.join(sampleDir, 'acc_flower.png'), path.join(mixDir, 'acc_flower.png'));
    fs.writeFileSync(path.join(mixDir, 'pc_head_focus.png'), encodePNG(layers.pc_head_focus));
    const mixed = keyifyKit(mixDir, { look: testLook, RB }), mf = mixed.report.files;
    t.ok(mf.acc_flower.mode === 'keyed' && mf.acc_flower.keyedShare >= 0.5 && mf.acc_flower.unresolvedCount === 0 && mf.pc_head_focus.mode === 'real' && mf.pc_head_focus.keyedShare === 0, 'a key-coloured layer is passed through (share ' + mf.acc_flower.keyedShare + '), a real-colour one converted (share ' + mf.pc_head_focus.keyedShare + ')');
    const mo = path.join(tmp, 'out_mixed');
    writeKeyified(mixed, mo);
    t.ok(fs.readFileSync(path.join(mo, 'acc_flower.png')).length > 0 && importToMemory(mo).report.ok, 'the mixed delivery imports');
    // a whole delivery in key colours (the sample itself, one layer with its supplied mask) goes through unchanged:
    // every layer and mask the importer then writes is byte for byte what importing the sample directly writes
    const kd = keyifyKit(sampleDir, { look: testLook, RB });
    t.ok(kd.ok && Object.values(kd.report.files).filter((f) => f.materials && f.mode !== 'fixed').every((f) => f.mode === 'keyed'), 'a key-coloured delivery is passed through layer by layer (' + Object.entries(kd.report.files).filter(([, f]) => f.materials && f.mode !== 'keyed' && f.mode !== 'fixed').map(([n]) => n).join(' ') + ')');
    const ko = path.join(tmp, 'out_keyed');
    writeKeyified(kd, ko);
    const kimp = importToMemory(ko);
    const kitPngs = Object.keys(sample.files).filter((f) => !/^suzu_/.test(f));
    const sameBytes = kitPngs.filter((f) => kimp.files[f] === sample.files[f]);
    t.ok(kimp.report.ok && sameBytes.length === kitPngs.length, 'importing it after keyify gives the same ' + kitPngs.length + ' kit layers and masks, byte for byte (' + sameBytes.length + ' equal)');
    // fixed colours near the key families are reported: an anchor shade is an error (the importer refuses it), one in
    // a key family the file may hold a warning (the mask keeps it fixed)
    const sat = { w: W, h: H, data: new Uint8Array(layers.acc_satchel.data) }, satF = R1.res.files.find((f) => f.name === 'acc_satchel');
    let put = 0;
    for (let i = 0; i < W * H && put < 6; i++) if (satF.cls[i] === -1 && satF.partOf[i] !== 'protected') { sat.data.set(put < 3 ? [0x3a, 0x4c, 0xc8] : [0x3c, 0x50, 0xc4], 4 * i); put++; }
    const colDir = path.join(tmp, 'in_coll');
    fs.mkdirSync(colDir);
    fs.writeFileSync(path.join(colDir, 'acc_satchel.png'), encodePNG(sat));
    const col = keyifyKit(colDir, { look: testLook, RB }).report.files.acc_satchel;
    const anchor = col.collisions.find((c) => c.kind === 'anchor'), near = col.collisions.find((c) => c.colour === '#3c50c4');
    t.ok(anchor && anchor.count === 3 && col.errors.some((e) => /anchor shade/.test(e)) && near && near.kind === 'allowed' && near.family === 'accessory' && col.warnings.some((w) => /near a key family/.test(w)), 'fixed colours in or near a key family are reported (anchor: error; in the accessory family: warning)');
    // a painted checkerboard is refused exactly as the importer refuses it
    const chk = blank(W * 2, H * 2);
    for (let y = 0; y < H * 2; y++) for (let x = 0; x < W * 2; x++) { const g = ((x >> 4) + (y >> 4)) & 1 ? 204 : 255; chk.data.set([g, g, g, 255], (y * W * 2 + x) * 4); }
    const ckDir = path.join(tmp, 'in_chk');
    fs.mkdirSync(ckDir);
    fs.writeFileSync(path.join(ckDir, 'pc_torso_coat.png'), encodePNG(chk));
    t.ok(keyifyKit(ckDir, { look: testLook, RB }).report.files.pc_torso_coat.errors.some((e) => /checkerboard/.test(e)), 'a painted checkerboard is refused');

    // ---- --sample: reference ramps from a style master and its rough mask ---------------------------------------------------
    // the master: look A's real-colour layers laid over each other (no group offsets: colours are all it is for; the
    // glasses left off, so the cheeks' lightest skin shows — a master must show each material's whole value range), the
    // mask: the original kit's masks laid the same way
    const master = blank(W, H), mmask = blank(W, H);
    for (const n of ['pc_hair_ponytail_back', 'pc_torso_coat', 'acc_satchel', 'pc_head_peak', 'pc_hair_ponytail_front', 'acc_flower', 'pc_arm_peak_suzu_fitted']) {
      const img = layers[n], mf = sample.manifest.files[n].mask, m = decodePNG(Buffer.from(sample.files[mf], 'base64'));
      for (let i = 0; i < W * H; i++) if (img.data[4 * i + 3]) { master.data.set(img.data.subarray(4 * i, 4 * i + 4), 4 * i); mmask.data.set(m.data.subarray(4 * i, 4 * i + 4), 4 * i); }
    }
    if (process.env.KEYIFY_KEEP) { fs.writeFileSync(path.join(tmp, 'master.png'), encodePNG(master)); fs.writeFileSync(path.join(tmp, 'master.mask.png'), encodePNG(mmask)); }
    const sampled = sampleLook(encodePNG(enlargeImg(master, 4)), encodePNG(enlargeImg(mmask, 4)), look, { RB });
    t.ok(sampled.sampled.mask && ['skin', 'hair', 'clothMain', 'clothTrim', 'accessory'].every((m) => sampled.sampled.materials[m]), '--sample derives a ramp for every material the master shows (' + Object.entries(sampled.sampled.materials).map(([m, v]) => m + ' ' + v.pixels).join(', ') + '; ' + sampled.sampled.fixed + ' fixed colours)');
    fs.writeFileSync(path.join(tmp, 'sampledLook.json'), JSON.stringify(sampled, null, 1));
    const first4 = keyifyKit(inDir, { look: sampled, RB, masksDir: maskDir });
    const nb4 = Object.values(first4.report.files).reduce((a, f) => a + ((f.flags || {}).neighbours || 0), 0);
    t.log('--sample: ' + first4.report.unresolved + ' pixels reported (' + Object.entries(first4.report.files).filter(([, f]) => f.unresolvedCount).map(([n, f]) => n + ' ' + f.unresolvedCount).join(', ') + '), ' + nb4 + ' decided by their neighbours');
    t.ok(first4.report.unresolved < 120, '--sample: the sampled look places all but a few pixels (' + first4.report.unresolved + ' reported)');
    const s4 = await settle(inDir, path.join(tmp, 'masks_sampled'), first4, sampleTruth, { look: sampled });
    const a4 = agreement(s4.res, sampleTruth);
    // (the master shows the trim's darkest value on 1 pixel — the satchel strap, the arm and the head cover the rest — so
    // the sampled trim lacks it and its 43 pixels in the torsos are read as the nearest fixed colour: a master must show
    // each material's whole value range)
    t.ok(a4.differ <= (a4.agree + a4.differ) / 200, '--sample: materials against the original kit, at most 0.5 % differ (' + a4.agree + ' agree, ' + a4.differ + ' differ; ' + a4.byNeighbours + ' decided by neighbours)');
    const R4 = { res: s4.res, outDir: path.join(tmp, 'out_sampled') };
    writeKeyified(R4.res, R4.outDir);
    R4.imp = importToMemory(R4.outDir);
    t.ok(R4.res.report.unresolved === 0 && R4.imp.report.ok && R4.imp.verify.ok, '--sample: with masks over the reported pixels (' + s4.rounds + ' rounds) the delivery converts and imports');
    const c4 = compare(ref, await busts(R4.imp, looks));
    t.log('--sample: materials vs the original kit: ' + a4.agree + ' agree, ' + a4.differ + ' differ, ' + a4.byNeighbours + ' decided by neighbours');
    t.log('range mapping with the sampled look, sample: busts vs the original kit: ΔE mean ' + c4.all.mean + ', p95 ' + c4.all.p95 + ', max ' + c4.all.max + ', over 0.02: ' + c4.all.over + ' of ' + c4.all.n);
    // the sampled colours are the painted ones, the value scale the base look's: as close as the default look's range run
    // but for the flower's palest petal, which a near-white fixed colour of the master (bristles, an eye white) leaves
    // ambiguous and the highlight rule keeps fixed
    t.ok(c4.all.alpha === 0 && c4.all.mean <= 0.005 && c4.all.p95 <= 0.01, '--sample: the looks match the original kit (mean ' + c4.all.mean + ' ≤ 0.005, p95 ' + c4.all.p95 + ' ≤ 0.01)');

    // ---- determinism ------------------------------------------------------------------------------------------------------
    const again = keyifyKit(inDir, { look: testLook, RB, values: 'reference', masksDir: maskDir });
    writeKeyified(again, path.join(tmp, 'out_ref2'));
    const same = fs.readdirSync(R1.outDir).filter((f) => !fs.statSync(path.join(R1.outDir, f)).isDirectory()).every((f) => fs.readFileSync(path.join(R1.outDir, f)).equals(fs.readFileSync(path.join(tmp, 'out_ref2', f))));
    t.ok(same, 'the same delivery and look give the same bytes');
    t.ok(FLAG.unresolved === 1, 'flags exported');
  } finally { if (process.env.KEYIFY_KEEP) console.log('   kept', tmp); else fs.rmSync(tmp, { recursive: true, force: true }); }
};
