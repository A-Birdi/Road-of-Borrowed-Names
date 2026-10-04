// Evidence for the keyify step (docs/harmony/contract/CONTRACT.md §5.5) on the SYNTHETIC kits — not art.
//   node tools/harmony_keyify_proof.mjs
// 1. The synthetic sample's player kit recoloured into look A's real colours by the game's own runtime, delivered as
//    real-colour layers (tools/harmony/keyify_report.mjs syntheticDelivery: three layers enlarged, one on #ff00ff), keyified
//    with the default value mapping (range) and validated (--report): docs/screenshots/harmony/keyify/files.png,
//    looks.png, report.json.
// 2. proof.json: the converted kits recoloured into the eight proof looks vs the same looks painted from the original key
//    kits (ΔE in OKLab over the bust: mean, p95, max, pixels over 0.02) — the sample with `reference` and `range`, the rich
//    fixture (9–11 values per family, jitter, rim and warm lights) with `reference` after masks over its reported pixels
//    (painted from its ground truth), and the sample with a look sampled (--sample) from a style master and its mask.
// Exit 1 when a check fails (the same bounds as tests/unit/harmony_keyify.test.mjs).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { decodePNG, encodePNG } from './harmony/png.mjs';
import { blank } from './harmony/image.mjs';
import { root } from './harmony/contract.mjs';
import { SYNTHETIC_LABEL } from './harmony/importer.mjs';
import { keyifyKit, writeKeyified, sampleLook, readLook } from './harmony/keyify.mjs';
import { loadRuntime, importToMemory, bustsOf, diffImages, proofLooks, stats, validate, syntheticDelivery, settleMasks, enlargeImg } from './harmony/keyify_report.mjs';

const OUT = path.join(root, 'docs/screenshots/harmony/keyify');
const RB = loadRuntime(), HC = RB.harmonyContract, C = HC.colour, W = HC.BUST.w, H = HC.BUST.h;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-keyify-proof-'));
const fails = [];
const check = (ok, what) => { if (!ok) fails.push(what); console.log(ok ? 'ok  ' : 'FAIL', what); };
try {
  const look = readLook(), looks = proofLooks(look.game), prefer = ['peak', 'suzu'];
  const D = await syntheticDelivery(RB, path.join(tmp, 'sample'));
  const orig = await bustsOf(RB, D.sample, looks, prefer);
  const measure = async (res, name) => {
    const dir = path.join(tmp, name);
    writeKeyified(res, dir);
    const imp = importToMemory(dir);
    const b = imp.report.ok ? await bustsOf(RB, imp, looks, prefer) : null;
    return { imp, b, dir };
  };
  const compare = (a, b) => {
    const all = [], per = [];
    let alpha = 0;
    a.forEach((x, i) => { const d = diffImages(x.img, b[i].img, C); all.push(...d.list); alpha += d.alpha; per.push(Object.assign({ look: looks[i].label }, stats(d.list), { over: d.list.filter((v) => v > 0.02).length })); });
    return Object.assign(stats(all), { over: all.filter((v) => v > 0.02).length, alpha, looks: per });
  };
  const proof = { label: SYNTHETIC_LABEL, looks: looks.map((l) => ({ label: l.label, look: l.look })), runs: {} };
  // -- the sample, reference and range
  for (const values of ['reference', 'range']) {
    const res = keyifyKit(D.inDir, { look: D.look, RB, values, masksDir: D.maskDir });
    const m = await measure(res, 'out_' + values);
    check(res.ok && m.imp.report.ok && m.imp.verify.ok, 'sample, ' + values + ': converts, imports and verifies');
    const c = compare(orig, m.b);
    proof.runs['sample_' + values] = Object.assign({ values, kit: res.report.kit, warnings: res.report.warnings }, { busts: c });
    console.log('     sample, ' + values + ': ΔE mean ' + c.mean + ', p95 ' + c.p95 + ', max ' + c.max + ', over 0.02 ' + c.over + ' of ' + c.n);
    if (values === 'reference') check(c.alpha === 0 && c.max <= 0.01, 'sample, reference: every look within ΔE 0.01 of the original kit');
    else {
      check(c.alpha === 0 && c.mean <= 0.005, 'sample, range: mean ΔE ≤ 0.005 (the trim and headband, painted without their lightest shade, are stretched)');
      // the evidence: the default mapping, validated
      const v = await validate(res, OUT, { RB, importDir: m.dir });
      check(v.out.import.ok && v.out.import.verify.ok && v.out.busts.looks.every((l) => l.painted), 'report: the importer accepts the result; the bust is painted in all ' + looks.length + ' looks');
      proof.runs.sample_range.validation = { roundTrip: v.out.roundTrip.materials, gameLookVsInput: v.out.busts.gameLookVsInput, floor: v.out.floor };
    }
  }
  // -- the rich fixture, reference, after masks over its reported pixels
  const DR = await syntheticDelivery(RB, path.join(tmp, 'rich'), { fixture: 'rich', enlarge: false, companions: false });
  const origRich = await bustsOf(RB, DR.set, looks, prefer);
  const r0 = keyifyKit(DR.inDir, { look: D.look, RB, values: 'reference', masksDir: D.maskDir });
  const rs = await settleMasks(RB, DR.inDir, D.maskDir, path.join(tmp, 'masks_rich'), r0, (n) => decodePNG(fs.readFileSync(path.join(root, 'tests/fixtures/harmony_rich/truth', n + '.mask.png'))), { look: D.look, values: 'reference' });
  const mr = await measure(rs.res, 'out_rich');
  check(rs.res.ok && mr.imp.report.ok, 'rich, reference: converts and imports after masks over ' + rs.painted + ' reported pixels');
  const cr = compare(origRich, mr.b);
  const nb = (res) => Object.values(res.report.files).reduce((a, f) => a + ((f.flags || {}).neighbours || 0), 0);
  proof.runs.rich_reference = { values: 'reference', reportedFirst: r0.report.unresolved, maskRounds: rs.rounds, maskedPixels: rs.painted, neighbours: nb(rs.res), clamped: Object.values(rs.res.report.kit).reduce((a, k) => a + k.clamped.pixels, 0), kit: rs.res.report.kit, busts: cr };
  console.log('     rich, reference: ΔE mean ' + cr.mean + ', p95 ' + cr.p95 + ', max ' + cr.max + ', over 0.02 ' + cr.over + ' of ' + cr.n);
  check(cr.alpha === 0 && cr.mean <= 0.002 && cr.p95 <= 0.005 && cr.over <= cr.n / 1000, 'rich, reference: mean ≤ 0.002, p95 ≤ 0.005, ≤ 0.1 % over 0.02');
  // -- the sample with a sampled look (a style master: look A's layers laid over each other, and their masks)
  const master = blank(W, H), mmask = blank(W, H);
  for (const n of ['pc_hair_ponytail_back', 'pc_torso_coat', 'acc_satchel', 'pc_head_peak', 'pc_hair_ponytail_front', 'acc_flower', 'pc_arm_peak_suzu_fitted']) {
    const img = D.layers[n], m = decodePNG(Buffer.from(D.sample.files[D.sample.manifest.files[n].mask], 'base64'));
    for (let i = 0; i < W * H; i++) if (img.data[4 * i + 3]) { master.data.set(img.data.subarray(4 * i, 4 * i + 4), 4 * i); mmask.data.set(m.data.subarray(4 * i, 4 * i + 4), 4 * i); }
  }
  const sl = sampleLook(encodePNG(enlargeImg(master, 4)), encodePNG(enlargeImg(mmask, 4)), look, { RB });
  const s0 = keyifyKit(D.inDir, { look: sl, RB, masksDir: D.maskDir });
  const ss = await settleMasks(RB, D.inDir, D.maskDir, path.join(tmp, 'masks_sampled'), s0, (n) => decodePNG(Buffer.from(D.sample.files[D.sample.manifest.files[n].mask], 'base64')), { look: sl });
  const ms = await measure(ss.res, 'out_sampled');
  check(ss.res.ok && ms.imp.report.ok, '--sample: converts and imports after masks over ' + ss.painted + ' reported pixels');
  const cs = compare(orig, ms.b);
  proof.runs.sample_sampled_range = { values: 'range', sampled: sl.sampled, reportedFirst: s0.report.unresolved, maskRounds: ss.rounds, maskedPixels: ss.painted, neighbours: nb(ss.res), busts: cs };
  console.log('     --sample, range: ΔE mean ' + cs.mean + ', p95 ' + cs.p95 + ', max ' + cs.max + ', over 0.02 ' + cs.over + ' of ' + cs.n);
  check(cs.alpha === 0 && cs.mean <= 0.005 && cs.p95 <= 0.01, '--sample: mean ≤ 0.005, p95 ≤ 0.01');
  proof.checks = { failed: fails };
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'proof.json'), JSON.stringify(proof, null, 1) + '\n');
  console.log('→', path.relative(root, OUT), fs.readdirSync(OUT).join(' '));
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }
console.log(fails.length ? 'FAILED: ' + fails.length : 'OK');
process.exit(fails.length ? 1 : 0);
