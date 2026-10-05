// The painted Harmony path in the built game (docs/harmony/contract/CONTRACT.md), with the SYNTHETIC sample:
//   node tests/e2e/harmony_raster.mjs [--sheets]
// 1. the built index.html has no painted art: PHASES enter/hold, no timeline, the code-drawn sizes;
// 2. the sample (imported fresh by tools/harmony_import.mjs) is installed into the page, decoded by prepare() (async,
//    createImageBitmap) and composed through the public API: both looks × Suzu × every state × both variants are
//    painted; faces inside, never covered by the other bust; the states differ;
// 3. a missing file: the whole bust falls back to code and stats().raster records it;
// 4. a look change through RB.equip (equip:change) drops the stale painted busts; the new look recolours;
// 5. uninstalled: exactly the code path again (same keys and pixels as before the install);
// 6. a build with the sample embedded (tools/build.mjs --harmony) installs it by itself; no network requests;
// 7. budgets: code busts vs the painted path (build ms, cache entries, decoded bytes, peak during a pairing), on the
//    sample (five exact key shades per family) and on the rich fixture over it (contract v3: 9–11 values per family);
// 8. contract v3: the scale fitted on the visible footprint (2× at 2048 × 1046, where the full canvas gave 1×), the
//    approval state, and the rich fixture recoloured in the page (exact key shades still v2's tones).
// --sheets also writes the evidence (docs/screenshots/harmony/raster_sample/, every image labelled SYNTHETIC SAMPLE)
// and docs/harmony/contract/budgets.json.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { serve, launch, page, root } from './lib.mjs';
import { importSet, importSets } from '../../tools/harmony/importer.mjs';

const SHEETS = process.argv.includes('--sheets');
const t0 = Date.now();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL:', m); } };
const OUT = path.join(root, 'tests/e2e/out/harmony_raster');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
// ---- the sample, imported fresh ---------------------------------------------------------------------------------------
const imp = importSet(path.join(root, 'tests/fixtures/harmony_sample/incoming'), { out: path.join(OUT, 'assets'), replace: true });
ok(imp.report.ok, 'the synthetic sample imports: ' + JSON.stringify(imp.report.summary));
const files = {};
for (const f of fs.readdirSync(path.join(OUT, 'assets')).filter((f) => f.endsWith('.png'))) files[f] = fs.readFileSync(path.join(OUT, 'assets', f)).toString('base64');
const manifest = imp.manifest;
const encodedBytes = Object.values(files).reduce((n, b) => n + Buffer.from(b, 'base64').length, 0);
// the rich fixture over the sample (contract v3)
const impR = importSets(['tests/fixtures/harmony_sample/incoming', 'tests/fixtures/harmony_rich/incoming'].map((d) => path.join(root, d)), { out: path.join(OUT, 'rich_assets'), replace: true });
ok(impR.ok, 'the rich fixture imports over the sample: ' + JSON.stringify(impR.report.summary));
const filesR = {};
for (const f of fs.readdirSync(path.join(OUT, 'rich_assets')).filter((f) => f.endsWith('.png'))) filesR[f] = fs.readFileSync(path.join(OUT, 'rich_assets', f)).toString('base64');
const encodedBytesR = Object.values(filesR).reduce((n, b) => n + Buffer.from(b, 'base64').length, 0);
// a build with the sample embedded (for 6)
const emb = spawnSync(process.execPath, [path.join(root, 'tools/build.mjs'), '--out', path.join(OUT, 'embedded.html'), '--harmony', path.join(OUT, 'assets')], { encoding: 'utf8' });
ok(emb.status === 0 && /painted Harmony art: \d+ PNGs/.test(emb.stdout), 'tools/build.mjs --harmony embeds the set: ' + emb.stdout.trim().split('\n').pop());

const { srv, url } = await serve();
const browser = await launch();
const { p, errors, requests } = await page(browser, url, { viewport: { width: 1920, height: 1080 } });
// the looks of Batches 1a and 1b (contract v3 §1.1)
const LA = { skin: 1, hair: 'ponytail', hairColor: 3, outfit: 2, shape: 'coat', acc: ['glasses', 'flower', 'satchel'] };
const LB = { skin: 5, hair: 'curly', hairColor: 8, outfit: 6, shape: 'robe', acc: ['scarf', 'headband'] };

// ---- 1: nothing installed ---------------------------------------------------------------------------------------------
const snap = () => p.evaluate(({ LA }) => {
  const HA = RB.harmonyArt;
  const sig = (cv) => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let h = 2166136261; for (let i = 0; i < d.length; i++) h = Math.imul(h ^ d[i], 16777619) >>> 0; return h; };
  HA.clear();
  const out = { phases: HA.PHASES, timeline: typeof HA.timeline, native: HA.NATIVE, fit: [HA.fitScale(1280, 720), HA.fitScale(1920, 1080), HA.fitScale(390, 844, 'compact')], raster: RB.harmonyRaster.active(), comps: [] };
  for (const comp of HA.COMPANIONS) for (const phase of ['enter', 'hold']) { const c = HA.compose({ comp, look: LA, phase }); out.comps.push([c.key, sig(c.cv), c.w, c.h, JSON.stringify(c.faces)]); }
  return out;
}, { LA });
const before = await snap();
ok(!before.raster && before.timeline === 'undefined' && JSON.stringify(before.phases) === '["enter","hold"]' && before.native.standard.w === 228, 'the built game has no painted art: PHASES enter/hold, no timeline, 228 × 100 (' + JSON.stringify(before.native) + ')');

// ---- 2: install, decode, compose ------------------------------------------------------------------------------------------
const r2 = await p.evaluate(async ({ manifest, files, LA, LB }) => {
  const HA = RB.harmonyArt, HR = RB.harmonyRaster, HC = RB.harmonyContract;
  const inst = HR.install({ manifest, files });
  const t0 = performance.now();
  const n = await HA.prepare([{ comp: 'suzu', look: LA, variant: 'standard' }, { comp: 'suzu', look: LA, variant: 'compact' }, { comp: 'suzu', look: LB, variant: 'standard' }, { comp: 'suzu', look: LB, variant: 'compact' }], { async: true });
  const prepMs = performance.now() - t0;
  const px = (c) => c.cv.getContext('2d').getImageData(0, 0, c.w, c.h).data;
  const bad = [], occl = [], seen = {};
  let comps = 0;
  for (const [name, look] of [['A', LA], ['B', LB]]) for (const st of HA.PHASES) for (const variant of ['standard', 'compact']) {
    const o = { comp: 'suzu', look, phase: st, variant };
    const c = HA.compose(o);
    comps++;
    const tag = name + ' ' + st + ' ' + variant;
    if (!c.painted || c.painted.suzu !== 'painted' || c.painted.pc !== 'painted') bad.push(tag + ': ' + JSON.stringify(c.painted));
    if (c.w !== HA.NATIVE[variant].w || c.h !== HA.NATIVE[variant].h || c.cv.width !== c.w) bad.push(tag + ': size ' + c.w + '×' + c.h);
    for (const f of c.faces) if (f.x < 0 || f.y < 0 || f.x + f.w > c.w || f.y + f.h > c.h) bad.push(tag + ': ' + f.who + ' face outside');
    const full = px(c);
    for (const f of c.faces) {
      const d = px(HA.compose(Object.assign({}, o, { omit: f.who === 'pc' ? 'comp' : 'pc' })));
      let diff = 0;
      for (let y = f.y; y < f.y + f.h; y++) for (let x = f.x; x < f.x + f.w; x++) { const i = (y * c.w + x) * 4; if (full[i] !== d[i] || full[i + 1] !== d[i + 1] || full[i + 2] !== d[i + 2] || full[i + 3] !== d[i + 3]) diff++; }
      if (diff) occl.push(tag + ': ' + diff + ' px of ' + f.who + "'s face");
    }
    if (variant === 'standard') { let h = 2166136261; for (let i = 0; i < full.length; i++) h = Math.imul(h ^ full[i], 16777619) >>> 0; seen[name + st] = h; }
  }
  const distinct = (name) => new Set(HA.PHASES.map((s) => seen[name + s])).size;
  const T = HA.timeline('suzu');
  return { inst, n, prepMs, comps, bad, occl, distinctA: distinct('A'), distinctB: distinct('B'), phases: HA.PHASES, native: HA.NATIVE, timeline: T, fit: [HA.fitScale(1280, 720), HA.fitScale(1920, 1080), HA.fitScale(390, 844, 'compact', 3)], raster: HA.stats().raster };
}, { manifest, files, LA, LB });
ok(r2.inst.ok, 'the sample installs in the page: ' + JSON.stringify(r2.inst.errors));
ok(r2.n > 0 && r2.raster.decoded > 0 && !r2.raster.decodeErrors.length, 'prepare({ async }) decoded ' + r2.raster.decoded + ' files (createImageBitmap) and built ' + r2.n + ' compositions in ' + r2.prepMs.toFixed(0) + ' ms: ' + r2.raster.decodeErrors.join('; '));
ok(JSON.stringify(r2.phases) === JSON.stringify(['prep_a', 'prep_b', 'cue', 'cue_b', 'peak', 'settle_a', 'settle_b']) && r2.native.standard.w === 352 && r2.native.compact.w === 248, 'installed: PHASES are the seven states (cue_b since 2026-10-05), NATIVE 352 × 160 / 248 × 128');
ok(r2.timeline && r2.timeline[0].phase === 'prep_a' && r2.timeline[r2.timeline.length - 1].phase === 'settle_b' && !r2.timeline.some((e) => e.phase === 'settle_a' || e.phase === 'cue_b'), "timeline('suzu') exists, from prep_a to settle_b, without the undelivered cue_b and settle_a");
ok(r2.bad.length === 0, r2.comps + ' compositions through compose() (2 looks × 7 states × 2 variants): both busts painted, contract size, faces inside: ' + r2.bad.slice(0, 5).join('; '));
ok(r2.occl.length === 0, 'no face covered by the other bust (pixel comparison with the other omitted): ' + r2.occl.slice(0, 3).join('; '));
ok(r2.distinctA >= 5 && r2.distinctB >= 5, 'the states are different drawings (' + r2.distinctA + ' and ' + r2.distinctB + ' distinct of 7; cue_b holds cue, settle_a holds peak)');
ok(r2.fit[0] === 1 && r2.fit[1] === 2 && Math.abs(r2.fit[2] - 4 / 3) < 1e-9, 'painted scales: standard 1× at 1280 × 720, 2× at 1920 × 1080; compact 4/3 on a 390 × 844 phone at DPR 3');

// ---- 3: a missing file → the whole bust in code --------------------------------------------------------------------------
const r3 = await p.evaluate(async ({ manifest, files, LA, LB }) => {
  const HA = RB.harmonyArt, HR = RB.harmonyRaster;
  const m = JSON.parse(JSON.stringify(manifest)); delete m.files.pc_torso_robe;
  const f = Object.assign({}, files); delete f['pc_torso_robe.png']; delete f['pc_torso_robe.mask.png'];
  HR.install({ manifest: m, files: f }); HA.clear();
  await HA.prepare([{ comp: 'suzu', look: LA, phase: 'peak' }, { comp: 'suzu', look: LB, phase: 'peak' }], { async: true });
  const a = HA.compose({ comp: 'suzu', look: LA, phase: 'peak' }), b = HA.compose({ comp: 'suzu', look: LB, phase: 'peak' });
  const st = HA.stats().raster;
  return { a: a.painted, b: b.painted, faceB: b.faces[1], log: st.fallbackLog.filter((x) => x.missing.indexOf('pc_torso_robe') >= 0).length };
}, { manifest, files, LA, LB });
ok(r3.a.pc === 'painted' && /^code \(missing pc_torso_robe/.test(r3.b.pc) && r3.b.suzu === 'painted', 'robe missing: the robe look\'s player bust is drawn whole in code, the coat look and Suzu stay painted (' + r3.b.pc + ')');
ok(r3.faceB.w === 36 && r3.faceB.h === 33 && r3.log > 0, 'the fallback is the whole code bust (face 36 × 33) and is recorded in stats().raster.fallbackLog');

// ---- 4: a look change through the equipment API -------------------------------------------------------------------------
const r4 = await p.evaluate(async ({ manifest, files, LB }) => {
  const HA = RB.harmonyArt, HR = RB.harmonyRaster, g = RB.game, saved = g.s;
  HR.install({ manifest, files }); HA.clear();
  g.s = { player: { look: JSON.parse(JSON.stringify(LB)) }, equip: { charm: null, tool: null, cosmetic: null } };
  const sig = (c) => { const d = c.cv.getContext('2d').getImageData(0, 0, c.w, c.h).data; let h = 2166136261; for (let i = 0; i < d.length; i++) h = Math.imul(h ^ d[i], 16777619) >>> 0; return h; };
  try {
    await HA.prepare({ comp: 'suzu', look: RB.equip.look(g.s), phase: 'peak' }, { async: true });
    const a = HA.compose({ comp: 'suzu', look: RB.equip.look(g.s), phase: 'peak' });
    const pcBefore = HA.stats().keys.busts.filter((k) => k.split('|')[1] === 'pc').length;
    RB.equip.equip(g.s, 'lq_tenugui'); // the persimmon-dyed cloth: a scarf in its own colour (equip:change)
    const pcAfter = HA.stats().keys.busts.filter((k) => k.split('|')[1] === 'pc').length;
    const look2 = RB.equip.look(g.s);
    await HA.prepare({ comp: 'suzu', look: look2, phase: 'peak' }, { async: true });
    const b = HA.compose({ comp: 'suzu', look: look2, phase: 'peak' });
    return { painted: [a.painted.pc, b.painted.pc], keys: [a.key !== b.key], sigs: sig(a) !== sig(b), pcBefore, pcAfter, compsKept: HA.stats().keys.busts.filter((k) => k.split('|')[1] === 'suzu').length, scarfCol: look2.scarfCol };
  } finally { g.s = saved; }
}, { manifest, files, LB });
ok(r4.pcBefore >= 1 && r4.pcAfter === 0 && r4.compsKept >= 1, 'equip:change drops the stale painted player busts (' + r4.pcBefore + ' → ' + r4.pcAfter + '); the companion\'s are kept');
ok(r4.painted.every((s) => s === 'painted') && r4.keys[0] && r4.sigs, 'the new look (scarf ' + r4.scarfCol + ') is painted under a new key, with new pixels');

// ---- 5: uninstalled: the code path exactly as before -------------------------------------------------------------------------
await p.evaluate(() => { RB.harmonyRaster.uninstall(); RB.harmonyArt.clear(); });
const after = await snap();
ok(JSON.stringify(after) === JSON.stringify(before), 'after uninstall: PHASES, timeline, NATIVE, scales and 8 code compositions (keys and pixels) are as before the install');

// ---- 8: contract v3 — the visible footprint, approval, the rich fixture in the page ----------------------------------------
const r8 = await p.evaluate(async ({ manifest, files, filesR, manifestR, LA, LB }) => {
  const HA = RB.harmonyArt, HR = RB.harmonyRaster, HC = RB.harmonyContract;
  HR.install({ manifest, files }); HA.clear();
  await HA.prepare([{ comp: 'suzu', look: LA, variant: 'standard' }, { comp: 'suzu', look: LA, variant: 'compact' }], { async: true });
  const foot = HA.footprint({ comp: 'suzu', look: LA, variant: 'standard' });
  const scales = HC.STATES.map((st) => HA.compose({ comp: 'suzu', look: LA, phase: st, view: { w: 2048, h: 1046 } }).scale);
  const out = { foot, scales, full: HA.fitScale(2048, 1046, 'standard'), on1920: HA.fitScale(1920, 1080, 'standard', 1, foot), approval: HA.approval(), statsApproval: HA.stats().approval.kit };
  // the rich fixture: every painted pixel of look A recoloured; how many distinct output colours per bust
  HR.install({ manifest: manifestR, files: filesR }); HA.clear();
  await HA.prepare([{ comp: 'suzu', look: LA, variant: 'standard' }, { comp: 'suzu', look: LB, variant: 'standard' }], { async: true });
  const colours = (look) => { const c = HA.compose({ comp: 'suzu', look, phase: 'peak', omit: 'comp', backing: false }); const d = c.cv.getContext('2d').getImageData(0, 0, c.w, c.h).data; const s = new Set(); for (let i = 0; i < d.length; i += 4) if (d[i + 3]) s.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]); return { n: s.size, painted: c.painted.pc }; };
  out.richA = colours(LA); out.richB = colours(LB);
  HR.install({ manifest, files }); HA.clear();
  await HA.prepare([{ comp: 'suzu', look: LA, phase: 'peak' }], { async: true });
  out.sampleA = colours(LA);
  HR.uninstall(); HA.clear();
  out.after = HA.approval();
  return out;
}, { manifest, files, filesR, manifestR: impR.manifest, LA, LB });
ok(r8.foot && r8.foot.w < 352 && r8.foot.h < 160 && r8.scales.every((s) => s === 2) && r8.full === 1 && r8.on1920 === 2, 'contract v3: the pair fitted on its visible footprint (' + (r8.foot && r8.foot.w + ' × ' + r8.foot.h) + ' art px): 2× at 2048 × 1046 for every state (the full canvas gave ' + r8.full + '×), 2× at 1920 × 1080');
ok(r8.approval.kit === 'synthetic' && r8.approval.pairings.suzu === 'synthetic' && r8.approval.pairings.nao === 'provisional' && r8.statsApproval === 'synthetic' && r8.after.kit === 'provisional' && Object.values(r8.after.pairings).every((v) => v === 'provisional'), 'approval: the sample is synthetic, the code busts provisional (and everything provisional once uninstalled): ' + JSON.stringify(r8.approval.pairings));
ok(r8.richA.painted === 'painted' && r8.richB.painted === 'painted' && r8.richA.n > 2 * r8.sampleA.n, 'the rich fixture is painted in the page with its values kept: ' + r8.richA.n + ' colours in look A\'s player bust (the five-shade sample: ' + r8.sampleA.n + '), look B ' + r8.richB.n);

// ---- 7: budgets ----------------------------------------------------------------------------------------------------------------
const budget = await p.evaluate(async ({ manifest, files, manifestR, filesR, LA, LB }) => {
  const HA = RB.harmonyArt, HR = RB.harmonyRaster;
  const out = { code: {}, painted: {} };
  // code busts: a cold pairing (both busts and the composition), both phases and both variants, then cache residency
  HR.uninstall(); HA.clear();
  const cold = [];
  for (const comp of HA.COMPANIONS) { HA.clear(); const t0 = performance.now(); HA.compose({ comp, look: LA, phase: 'hold' }); cold.push(performance.now() - t0); }
  HA.clear();
  const t1 = performance.now();
  for (const variant of ['standard', 'compact']) for (const phase of ['enter', 'hold']) HA.compose({ comp: 'suzu', look: LA, phase, variant });
  const st = HA.stats();
  out.code = { coldPairingMs: cold.map((v) => +v.toFixed(1)), pairingAllMs: +(performance.now() - t1).toFixed(1), busts: st.busts, compositions: st.compositions, backings: st.backings, bytes: st.bytes, cap: st.cap };
  // painted: one pairing and look, every state and both variants (what a cut-in can show)
  HR.install({ manifest, files }); HA.clear();
  const per = {};
  for (const [name, look] of [['A', LA], ['B', LB]]) {
    HR.uninstall(); HR.install({ manifest, files }); HA.clear();
    const t2 = performance.now();
    await HA.prepare([{ comp: 'suzu', look, variant: 'standard' }, { comp: 'suzu', look, variant: 'compact' }], { async: true });
    const ms = performance.now() - t2;
    const s = HA.stats(), r = s.raster;
    // a cold composition with decoded files: paint both busts and compose
    HA.clear();
    // cold after clear(): the ink backing is rebuilt too; then a new state with the backing cached (busts painted
    // from decoded files + the composition) — the cost of a state the overlay has not prepared
    const t3 = performance.now(); HA.compose({ comp: 'suzu', look, phase: 'peak' }); const coldMs = performance.now() - t3;
    const t5 = performance.now(); HA.compose({ comp: 'suzu', look, phase: 'cue' }); const coldStateMs = performance.now() - t5;
    const t4 = performance.now(); HA.compose({ comp: 'suzu', look, phase: 'peak' }); const warmMs = performance.now() - t4;
    per[name] = { prepareAllMs: +ms.toFixed(1), decodeMs: r.decodeMs, decodedFiles: r.decoded, decodedBytes: r.decodedBytes, busts: s.busts, compositions: s.compositions, cacheBytes: s.bytes, peakBytes: s.bytes + r.decodedBytes, coldComposeWithBackingMs: +coldMs.toFixed(1), coldStateMs: +coldStateMs.toFixed(1), warmComposeMs: +warmMs.toFixed(2), paintMs: HA.stats().raster.paintMs };
  }
  out.painted = per;
  // the rich fixture (contract v3): the same, with many values per family (the recolour memoised per painted colour)
  const perR = {};
  for (const [name, look] of [['A', LA], ['B', LB]]) {
    HR.uninstall(); HR.install({ manifest: manifestR, files: filesR }); HA.clear();
    const t2 = performance.now();
    await HA.prepare([{ comp: 'suzu', look, variant: 'standard' }, { comp: 'suzu', look, variant: 'compact' }], { async: true });
    const ms = performance.now() - t2;
    const s = HA.stats(), r = s.raster;
    HA.clear();
    const t3 = performance.now(); HA.compose({ comp: 'suzu', look, phase: 'peak' }); const coldMs = performance.now() - t3;
    const t5 = performance.now(); HA.compose({ comp: 'suzu', look, phase: 'cue' }); const coldStateMs = performance.now() - t5;
    perR[name] = { prepareAllMs: +ms.toFixed(1), decodeMs: r.decodeMs, decodedFiles: r.decoded, decodedBytes: r.decodedBytes, busts: s.busts, compositions: s.compositions, cacheBytes: s.bytes, peakBytes: s.bytes + r.decodedBytes, coldComposeWithBackingMs: +coldMs.toFixed(1), coldStateMs: +coldStateMs.toFixed(1), paintMs: HA.stats().raster.paintMs, recoloured: r.recoloured, decomposed: r.decomposed, gamutClipped: r.gamutClipped };
  }
  out.paintedRich = perR;
  out.env = { ua: navigator.userAgent, cores: navigator.hardwareConcurrency, view: [innerWidth, innerHeight], dpr: devicePixelRatio };
  HR.uninstall(); HA.clear();
  return out;
}, { manifest, files, manifestR: impR.manifest, filesR, LA, LB });
console.log('budgets', JSON.stringify(budget));
ok(budget.paintedRich.A.decodedFiles > 0 && budget.paintedRich.A.recoloured > 0, 'rich-fixture budgets measured (' + budget.paintedRich.A.recoloured + ' painted colours recoloured; paint mean ' + JSON.stringify(budget.paintedRich.A.paintMs) + ' ms)');
ok(budget.painted.A.decodedFiles > 0 && budget.painted.A.peakBytes > 0, 'budgets measured (decoded ' + budget.painted.A.decodedFiles + ' files, ' + (budget.painted.A.decodedBytes / 1024).toFixed(0) + ' KiB; peak ' + (budget.painted.A.peakBytes / 1048576).toFixed(2) + ' MiB)');

// ---- --sheets: evidence ---------------------------------------------------------------------------------------------------------
if (SHEETS) {
  const SH = path.join(root, 'docs/screenshots/harmony/raster_sample');
  fs.mkdirSync(SH, { recursive: true });
  const sheets = await p.evaluate(async ({ manifest, files, LA, LB }) => {
    const HA = RB.harmonyArt, HR = RB.harmonyRaster, HC = RB.harmonyContract;
    HR.install({ manifest, files }); HA.clear();
    const LABEL = 'SYNTHETIC SAMPLE — not art';
    const looks = [['Look A (Batch 1a): ponytail, coat, glasses, flower, satchel (skin 1, auburn, green)', LA], ['Look B (Batch 1b): curly, robe (wide sleeve), scarf, headband (skin 5, teal, pale)', LB]];
    await HA.prepare(looks.flatMap(([, l]) => [{ comp: 'suzu', look: l, variant: 'standard' }, { comp: 'suzu', look: l, variant: 'compact' }]), { async: true });
    const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#22252e'; g.fillRect(0, 0, w, h); return [c, g]; };
    const txt = (g, s, x, y, size, col, bold) => { g.font = (bold ? 'bold ' : '') + size + 'px sans-serif'; g.fillStyle = col || '#e8e2d0'; g.fillText(s, x, y); };
    const out = {};
    // 1. both looks across the states, standard and compact, at 1× and 2×
    for (const sc of [1, 2]) {
      const W = 352 * sc, Hh = 160 * sc, cw = W + 16 * sc, top = 70 * sc;
      const [c, g] = mk(30 + 6 * cw, top + 2 * (Hh + 128 * sc + 60 * sc) + 30 * sc);
      txt(g, LABEL + ' — the painted path assembling the sample kit with Suzu, every state (contract v' + HC.VERSION + '), ' + sc + '×', 14, 26 * sc, 14 * sc, '#ff9a6a', true);
      txt(g, 'Code-drawn busts placed on the 192 × 160 template, the player mirrored and repainted in key ramps, recoloured by the game for each look. Not art, not a style reference.', 14, 46 * sc, 10 * sc, '#a8a294');
      HA.PHASES.forEach((s, i) => txt(g, s, 20 + i * cw, top - 6 * sc, 12 * sc, '#e8e2d0', true));
      looks.forEach(([label, look], li) => {
        const y0 = top + li * (Hh + 128 * sc + 60 * sc);
        txt(g, label, 20, y0 + 12 * sc, 11 * sc, '#f0c878');
        HA.PHASES.forEach((s, i) => {
          const a = HA.compose({ comp: 'suzu', look, phase: s });
          g.drawImage(a.cv, 20 + i * cw, y0 + 18 * sc, a.w * sc, a.h * sc);
          const b = HA.compose({ comp: 'suzu', look, phase: s, variant: 'compact' });
          g.drawImage(b.cv, 20 + i * cw, y0 + 24 * sc + Hh, b.w * sc, b.h * sc);
        });
      });
      txt(g, LABEL, 14, c.height - 10 * sc, 11 * sc, '#ff9a6a', true);
      out['looks_states_' + sc + 'x.png'] = c.toDataURL('image/png');
    }
    // 2. recolouring: look A's geometry across skins, hair colours and cloth palettes (pale to dark), peak, 2×
    {
      const sc = 2, list = [[0, 6, 6], [1, 3, 2], [2, 4, 0], [3, 0, 7], [4, 9, 3], [5, 8, 5], [6, 5, 1], [6, 2, 4]];
      const [c, g] = mk(30 + 4 * (352 * sc + 20), 90 + 2 * (160 * sc + 40));
      txt(g, LABEL + ' — one kit, recoloured by the game: skin / hair colour / cloth palette per pair (peak, 2×)', 14, 30, 22, '#ff9a6a', true);
      const need = [];
      list.forEach(([skin, hc, o]) => need.push({ comp: 'suzu', look: Object.assign({}, LA, { skin, hairColor: hc, outfit: o }), phase: 'peak' }));
      await HA.prepare(need, { async: true });
      list.forEach(([skin, hc, o], i) => {
        const x = 20 + (i % 4) * (352 * sc + 20), y = 70 + Math.floor(i / 4) * (160 * sc + 40);
        const a = HA.compose({ comp: 'suzu', look: Object.assign({}, LA, { skin, hairColor: hc, outfit: o }), phase: 'peak' });
        g.drawImage(a.cv, x, y, a.w * sc, a.h * sc);
        txt(g, 'skin ' + skin + ' · hair ' + RB.sprites.HAIR_NAMES[hc] + ' · cloth ' + o, x, y + 160 * sc + 22, 18, '#e8e2d0');
      });
      txt(g, LABEL, 14, c.height - 12, 16, '#ff9a6a', true);
      out['recolour_2x.png'] = c.toDataURL('image/png');
    }
    // 3. mask views of every decoded kit file, as the game reads them (material colours; fixed in grey)
    {
      const dec = [...HR._.decoded].filter(([, f]) => f.code).sort((a, b) => a[0].localeCompare(b[0]));
      const sc = 2, cols = 4, cw = 2 * 192 * sc + 30, ch = 160 * sc + 40;
      const [c, g] = mk(20 + cols * cw, 70 + Math.ceil(dec.length / cols) * ch + 30);
      txt(g, LABEL + ' — the player kit as decoded: each file (key ramps) and its mask (skin red, hair green, cloth blue, trim yellow, accessory magenta, fixed grey), 2×', 14, 30, 20, '#ff9a6a', true);
      const COL = [[255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 0], [255, 0, 255]];
      dec.forEach(([name, f], i) => {
        const x = 20 + (i % cols) * cw, y = 60 + Math.floor(i / cols) * ch;
        const a = new ImageData(new Uint8ClampedArray(f.px.buffer.slice(0)), f.w, f.h), m = new ImageData(f.w, f.h);
        for (let k = 0; k < f.code.length; k++) { const cd = f.code[k]; if (!cd) continue; const col = cd === 1 ? [90, 90, 98] : COL[Math.floor((cd - 2) / 5)]; m.data.set([col[0], col[1], col[2], 255], 4 * k); }
        for (const [img, dx] of [[a, 0], [m, 192 * sc + 10]]) { const t = document.createElement('canvas'); t.width = f.w; t.height = f.h; t.getContext('2d').putImageData(img, 0, 0); g.fillStyle = '#2e323e'; g.fillRect(x + dx, y, 192 * sc, 160 * sc); g.drawImage(t, x + dx, y, 192 * sc, 160 * sc); }
        txt(g, name, x, y + 160 * sc + 16, 14, '#e8e2d0');
      });
      txt(g, LABEL, 14, c.height - 12, 16, '#ff9a6a', true);
      out['masks_2x.png'] = c.toDataURL('image/png');
    }
    // 4. the whole-bust fallback: the robe torso withheld, look B's player is drawn whole in code
    {
      const m = JSON.parse(JSON.stringify(manifest)); delete m.files.pc_torso_robe;
      const f = Object.assign({}, files); delete f['pc_torso_robe.png']; delete f['pc_torso_robe.mask.png'];
      HR.install({ manifest: m, files: f }); HA.clear();
      await HA.prepare([{ comp: 'suzu', look: LB, phase: 'peak' }, { comp: 'suzu', look: LA, phase: 'peak' }], { async: true });
      const sc = 2, [c, g] = mk(40 + 2 * (352 * sc + 20), 150 + 160 * sc);
      txt(g, LABEL + ' — whole-bust fallback: pc_torso_robe withheld (peak, 2×)', 14, 30, 22, '#ff9a6a', true);
      [[LA, 'look A: every file present → painted'], [LB, 'look B: pc_torso_robe missing → the whole player bust in code']].forEach(([look, label], i) => {
        const a = HA.compose({ comp: 'suzu', look, phase: 'peak' });
        g.drawImage(a.cv, 20 + i * (352 * sc + 20), 60, a.w * sc, a.h * sc);
        txt(g, label + ' (' + a.painted.pc + ')', 20 + i * (352 * sc + 20), 80 + 160 * sc, 16, '#e8e2d0');
      });
      txt(g, LABEL, 14, c.height - 12, 16, '#ff9a6a', true);
      out['fallback_2x.png'] = c.toDataURL('image/png');
      HR.uninstall(); HA.clear();
    }
    return out;
  }, { manifest, files, LA, LB });
  for (const [name, data] of Object.entries(sheets)) fs.writeFileSync(path.join(SH, name), Buffer.from(data.split(',')[1], 'base64'));
  fs.copyFileSync(path.join(OUT, 'assets/report/contact.png'), path.join(SH, 'import_contact.png'));
  const rep = JSON.parse(fs.readFileSync(path.join(OUT, 'assets/report/report.json'), 'utf8'));
  rep.inDir = 'tests/fixtures/harmony_sample/incoming'; rep.out = '(a temporary folder)';
  fs.writeFileSync(path.join(SH, 'import_report.json'), JSON.stringify(rep, null, 1) + '\n');
  const b = { date: new Date().toISOString().slice(0, 10), note: 'SYNTHETIC SAMPLE — not art. Measured by tests/e2e/harmony_raster.mjs --sheets in headless Chromium (software canvas) on a shared machine; not a physical device. painted: the sample (five exact key shades per family); paintedRich: the rich fixture over it (contract v3, 9–11 values per family).', contractVersion: 3, sampleEncodedBytes: encodedBytes, sampleFiles: Object.keys(files).length, richEncodedBytes: encodedBytesR, richFiles: Object.keys(filesR).length, manifestFiles: Object.keys(manifest.files).length, ...budget };
  fs.writeFileSync(path.join(root, 'docs/harmony/contract/budgets.json'), JSON.stringify(b, null, 1) + '\n');
  console.log('wrote', Object.keys(sheets).length + 2, 'evidence files to docs/screenshots/harmony/raster_sample/ and docs/harmony/contract/budgets.json');
}

// ---- 6: the embedded build -------------------------------------------------------------------------------------------------------
const pe = await page(browser, url + 'tests/e2e/out/harmony_raster/embedded.html', { viewport: { width: 1280, height: 720 } });
const r6 = await pe.p.evaluate(async ({ LA }) => {
  const HA = RB.harmonyArt, HR = RB.harmonyRaster;
  const active = HR.active();
  await HA.prepare({ comp: 'suzu', look: LA }, { async: true });
  const c = HA.compose({ comp: 'suzu', look: LA, phase: 'cue' });
  return { active, set: HR.stats().set, synthetic: HR.stats().synthetic, painted: c.painted, w: c.w, phases: HA.PHASES.length, tl: typeof HA.timeline };
}, { LA });
ok(r6.active && r6.set === 'sample' && r6.synthetic === true && r6.painted.suzu === 'painted' && r6.painted.pc === 'painted' && r6.w === 352 && r6.tl === 'function', 'a build with the sample embedded installs it by itself and paints the pair: ' + JSON.stringify(r6));
ok(!pe.errors.length && !pe.requests.length, 'embedded build: no page errors, no network requests');
await pe.ctx.close();

ok(!errors.length, 'no page errors: ' + errors.join(' | '));
ok(!requests.length, 'no network requests: ' + requests.join(' | '));
console.log(`\n${pass} passed, ${fail} failed (${Math.round((Date.now() - t0) / 1000)} s)`);
await browser.close(); srv.close();
process.exit(fail ? 1 : 0);
