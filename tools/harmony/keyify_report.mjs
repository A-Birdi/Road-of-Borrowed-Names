// The keyify step's validation (docs/harmony/contract/CONTRACT.md §5.5), with the game's own runtime loaded in node
// (src/ui/88_harmony_raster.js, the code that recolours in the game; decoded by the importer's PNG decoder):
//   round trip   every converted material pixel recoloured back to the look's reference ramps by the runtime's own
//                per-pixel recolour (RB.harmonyRaster rowOf / recolourPx), compared with the painted input: ΔE in OKLab
//                per material (mean, p95, max), pixels changed, pixels over one just-noticeable difference (0.02)
//   import       the converted folder imported by tools/harmony_import.mjs's importer and re-checked (--verify)
//   busts        the converted kit installed in the runtime and assembled: the game look, and ≥ 6 looks spanning light
//                and dark skins, light, dark and vivid hair, light and dark cloth; the input layers assembled the same
//                way (never recoloured) for comparison
//   value floor  §5.4: neighbouring painted values on every supported target ramp (7 skins, 10 hair colours, 8 cloth
//                palettes, the accessory channels): the smallest ΔE, and pairs that were apart when painted but fall
//                under 0.02 on some target
//   sheets       files.png (input | key layer | mask over the input | round trip | ΔE | flagged pixels, per file) and
//                looks.png; report.json
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { load } from '../../tests/lib/load.mjs';
import { decodePNG, encodePNG } from './png.mjs';
import { importSet, verifySet, SYNTHETIC_LABEL } from './importer.mjs';
import { blank, blit, text, rect } from './image.mjs';
import { root } from './contract.mjs';
import { FLAG, refKeyOf, readLook, keyifyKit } from './keyify.mjs';

export const JND = 0.02;
const r4 = (v) => Math.round(v * 1e4) / 1e4;
const pack = (r, g, b) => (0xff000000 | (b << 16) | (g << 8) | r) >>> 0;
const unpack = (p) => [p & 255, (p >>> 8) & 255, (p >>> 16) & 255];

export function loadRuntime() {
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas']);
  RB.sprites.makeCanvas = (w, h) => ({ width: w, height: h, getContext: () => ({ createImageData: (a, b) => ({ data: new Uint8ClampedArray(a * b * 4) }), putImageData() {} }) });
  return RB;
}
export function stats(list) {
  if (!list.length) return { n: 0, mean: 0, p95: 0, max: 0 };
  const s = Float64Array.from(list).sort();
  let sum = 0;
  for (const v of s) sum += v;
  return { n: s.length, mean: r4(sum / s.length), p95: r4(s[Math.min(s.length - 1, Math.floor(0.95 * (s.length - 1)))]), max: r4(s[s.length - 1]) };
}
// the runtime's row (target curve + memo) for a look reference: the game's own rowOf on the reference's value-scale tones
// (the reference ramp itself, or for a sampled look the base look's ramp: the round trip then includes the palette
// difference between the style master and the base look)
export function rowOfRef(RB, ref) {
  const C = RB.harmonyContract.colour;
  const c = new Uint32Array(ref.scaleTones.map((h) => { const q = C.hexRgb(h); return pack(q[0], q[1], q[2]); }));
  return RB.harmonyRaster._.rowOf({ c, n: c.length }, ref.scalePick);
}

// Import a folder into a scratch directory (written, so --verify runs), returning the manifest and the files as base64.
export function importToMemory(dir) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-keyify-'));
  try {
    const r = importSet(dir, { out: tmp, replace: true });
    const files = {};
    for (const f of fs.readdirSync(tmp).filter((f) => f.endsWith('.png'))) files[f] = fs.readFileSync(path.join(tmp, f)).toString('base64');
    const v = r.report.ok ? verifySet(tmp) : { ok: false, errors: ['not imported'] };
    return { manifest: r.manifest, files, report: r.report, verify: v };
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}
const decode = async (b64) => { const d = decodePNG(Buffer.from(b64, 'base64')); return { w: d.w, h: d.h, data: d.data }; };
export function install(RB, manifest, files) {
  const r = RB.harmonyRaster.install({ manifest, files }, { decode });
  if (!r.ok) throw new Error('install: ' + r.errors.join('; '));
}
// The player bust for a look, painted by the runtime: the first state (and pairing) whose files are all present.
export async function bust(RB, look, prefer) {
  const HR = RB.harmonyRaster;
  const tries = (prefer ? [prefer] : []).concat(['peak', 'settle_b', 'cue', 'prep_a'].flatMap((st) => ['suzu', 'nao', 'mio', 'ren'].map((c) => [st, c])));
  for (const [st, comp] of tries) {
    const pl = HR.plan('pc', look, st, comp);
    if (!pl.ok) continue;
    await HR.load(pl.files);
    const b = HR.paint(pl, look, true);
    if (!b) continue;
    const img = blank(b.w, b.h);
    for (let i = 0; i < b.px.length; i++) { const p = b.px[i]; if (p >>> 24) img.data.set([...unpack(p), 255], 4 * i); }
    return { img, state: st, comp };
  }
  return null;
}
// Each named kit file of the installed set, alone on its canvas, recoloured into a look exactly as paint() recolours a
// layer (the look's rows; an accessory's channel; the wrap's) — how the synthetic test makes "real-colour" layers.
export async function paintLayers(RB, look, names) {
  const HR = RB.harmonyRaster, HC = RB.harmonyContract, W = HC.BUST.w, H = HC.BUST.h;
  await HR.load(names);
  const r = HR._.rampsOf(look), base = [r.rows.skin, r.rows.hair, r.rows.clothMain, r.rows.clothTrim, null], out = {};
  for (const n of names) {
    const f = HR._.decoded.get(n), p = HC.parse(n);
    if (!f) throw new Error('not decoded: ' + n);
    let tab = base;
    if (p.kind === 'acc') { tab = base.slice(); tab[4] = HR._.accRow(r, look, p.acc); }
    else if (p.kind === 'hair_wrap') { tab = base.slice(); tab[3] = r.rows.wrap; }
    const px = new Uint32Array(W * H);
    HR._.draw(px, f, 0, 0, tab, null);
    const img = blank(W, H);
    for (let i = 0; i < px.length; i++) if (px[i] >>> 24) img.data.set([...unpack(px[i]), 255], 4 * i);
    out[n] = img;
  }
  return out;
}
// ---- the synthetic delivery (tests and evidence; SYNTHETIC SAMPLE — not art) ------------------------------------------------
const nearest = (img, f, CW, CH, oy, bg) => {
  const out = blank(CW, CH, bg || null), W = img.w, H = img.h;
  for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) { const sx = Math.floor((x + 0.5) / f), sy = Math.floor((y + 0.5 - oy) / f); if (sx < 0 || sy < 0 || sx >= W || sy >= H) continue; const o = (sy * W + sx) * 4; if (img.data[o + 3]) out.data.set(img.data.subarray(o, o + 4), (y * CW + x) * 4); }
  return out;
};
export const enlargeImg = (img, f, bg) => nearest(img, f, img.w * f, img.h * f, 0, bg);
export const square1024 = (img) => nearest(img, 1024 / img.w, 1024, 1024, (1024 - (img.h * 1024) / img.w) / 2);
const hexAt = (d, o) => '#' + [d[o], d[o + 1], d[o + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');
// The synthetic kit (the sample, or the rich fixture imported over it) recoloured by the runtime into the look file's game
// look — "real-colour" layers — written as a delivery under dir/in (the torso at 4×, a head at 3× on #ff00ff, the flower in
// the 1024 square; Suzu's sample frames as delivered), with dir/look.json: the look file with the sample's own fixed colours
// per kind of file as its fixed parts (the code busts' eyes, mouth, brush, metal, leaves), and dir/masks: partial masks
// marking the code mouth's #4a1a24 fixed (0.0096 from auburn hair's darkest value: ambiguous in real colours).
export async function syntheticDelivery(RB, dir, opt = {}) {
  const HC = RB.harmonyContract, W = HC.BUST.w, H = HC.BUST.h;
  const sampleDir = path.join(root, 'tests/fixtures/harmony_sample/incoming');
  const look = opt.look || readLook();
  const sample = importToMemory(sampleDir);
  if (!sample.report.ok) throw new Error('the synthetic sample does not import');
  let set = sample;
  if (opt.fixture === 'rich') {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-keyify-rich-'));
    try {
      importSet(sampleDir, { out: tmp, replace: true });
      const r = importSet(path.join(root, 'tests/fixtures/harmony_rich/incoming'), { out: tmp });
      if (!r.report.ok) throw new Error('the rich fixture does not import');
      set = { manifest: r.manifest, files: Object.fromEntries(fs.readdirSync(tmp).filter((f) => f.endsWith('.png')).map((f) => [f, fs.readFileSync(path.join(tmp, f)).toString('base64')])), report: r.report };
    } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
  }
  const kitNames = Object.keys(set.manifest.files).filter((n) => HC.parse(n).kind !== 'comp');
  install(RB, set.manifest, set.files);
  const layers = await paintLayers(RB, look.game, kitNames);
  RB.harmonyRaster.uninstall();
  const kindKey = (p) => (p.kind === 'acc' ? 'acc_' + p.acc : p.kind), perKind = {};
  for (const n of kitNames) {
    const img = decodePNG(Buffer.from(sample.files[n + '.png'], 'base64')), mf = sample.manifest.files[n].mask, mk = mf ? decodePNG(Buffer.from(sample.files[mf], 'base64')) : null;
    const s = (perKind[kindKey(HC.parse(n))] = perKind[kindKey(HC.parse(n))] || new Set());
    for (let i = 0; i < W * H; i++) { const o = 4 * i; if (img.data[o + 3] && !(mk && (mk.data[o] || mk.data[o + 1] || mk.data[o + 2]))) s.add(hexAt(img.data, o)); }
  }
  const lk = JSON.parse(JSON.stringify(look));
  lk.name = look.name + ' (synthetic ' + (opt.fixture || 'sample') + ')';
  lk.note = 'SYNTHETIC SAMPLE — not art. ' + (look.note || '');
  lk.fixed = {}; lk.files = {}; lk.as = {};
  for (const [kk, s] of Object.entries(perKind)) {
    lk.fixed['sample_' + kk] = [...s].sort();
    const base = look.files[kk] !== undefined ? look.files[kk] : look.files[kk.startsWith('acc_') ? 'acc' : kk];
    lk.files[kk] = base === 'fixed' ? 'fixed' : base.filter((q) => HC.MATERIALS.includes(q)).concat(['sample_' + kk]);
  }
  const inDir = path.join(dir, 'in'), maskDir = path.join(dir, 'masks'), lookFile = path.join(dir, 'look.json');
  fs.mkdirSync(inDir, { recursive: true }); fs.mkdirSync(maskDir, { recursive: true });
  fs.writeFileSync(lookFile, JSON.stringify(lk, null, 1) + '\n');
  const TEXT = { Comment: SYNTHETIC_LABEL }, big = opt.enlarge !== false;
  for (const n of kitNames) {
    const img = layers[n];
    const out = big && n === 'pc_torso_coat' ? enlargeImg(img, 4) : big && n === 'pc_head_focus' ? enlargeImg(img, 3, '#ff00ff') : big && n === 'acc_flower' ? square1024(img) : img;
    fs.writeFileSync(path.join(inDir, n + '.png'), encodePNG(out, { text: TEXT }));
  }
  if (opt.companions !== false) for (const f of fs.readdirSync(sampleDir).filter((f) => /^suzu_.*\.png$/.test(f))) fs.copyFileSync(path.join(sampleDir, f), path.join(inDir, f));
  const cfg = JSON.parse(fs.readFileSync(path.join(sampleDir, 'import.json'), 'utf8'));
  cfg.files = big ? { pc_head_focus: { background: 'magenta' } } : {};
  cfg.note = SYNTHETIC_LABEL + '. The synthetic ' + (opt.fixture || 'sample') + ' kit recoloured into look A\'s real colours by the game (tools/harmony/keyify_report.mjs syntheticDelivery).';
  fs.writeFileSync(path.join(inDir, 'import.json'), JSON.stringify(cfg, null, 1) + '\n');
  for (const n of ['pc_head_cue', 'pc_head_peak']) {
    const img = layers[n], mk = blank(W, H);
    let k = 0;
    for (let i = 0; i < W * H; i++) if (img.data[4 * i + 3] && hexAt(img.data, 4 * i) === '#4a1a24') { mk.data.set([0, 0, 0, 255], 4 * i); k++; }
    if (k) fs.writeFileSync(path.join(maskDir, n + '.mask.png'), encodePNG(mk, { text: TEXT }));
  }
  return { inDir, maskDir, lookFile, look: lk, set, sample, kitNames, layers, perKind };
}

// The report's workflow for reported pixels, automated for the synthetic kits: a mask over just those pixels (painted from
// a ground truth: truthOf(name) → its mask image), then keyify again — repeated while pixels are reported (a neighbour's
// vote can change once a mask decides the pixel next to it). baseMasks: masks to start from (copied into mdir).
export async function settleMasks(RB, dir, baseMasks, mdir, first, truthOf, opt) {
  const W = RB.harmonyContract.BUST.w, H = RB.harmonyContract.BUST.h;
  fs.mkdirSync(mdir, { recursive: true });
  if (baseMasks) for (const f of fs.readdirSync(baseMasks)) fs.copyFileSync(path.join(baseMasks, f), path.join(mdir, f));
  let res = first, rounds = 0, painted = 0;
  while (res.report.unresolved && rounds < 4) {
    for (const [n, f] of Object.entries(res.report.files).filter(([, q]) => q.unresolvedCount)) {
      const truth = truthOf(n), mp = path.join(mdir, n + '.mask.png'), prev = fs.existsSync(mp) ? decodePNG(fs.readFileSync(mp)) : blank(W, H);
      for (const u of res.files.find((q) => q.name === n).unresolved) { const i = u.y * W + u.x; prev.data.set(truth.data.subarray(4 * i, 4 * i + 4), 4 * i); painted++; }
      fs.writeFileSync(mp, encodePNG(prev));
    }
    res = keyifyKit(dir, Object.assign({ RB, masksDir: mdir }, opt));
    rounds++;
  }
  return { res, rounds, painted };
}
// The player bust of an imported set ({ manifest, files }) in each look, painted by the runtime (then uninstalled).
export async function bustsOf(RB, set, looks, prefer) {
  install(RB, set.manifest, set.files);
  const out = [];
  for (const l of looks) out.push(await bust(RB, l.look || l, prefer));
  RB.harmonyRaster.uninstall();
  return out;
}
// ΔE (OKLab) between two RGBA images over pixels opaque in either: { list, changed, alpha }
export function diffImages(a, b, C) {
  const list = [];
  let changed = 0, alpha = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    const A = a.data[i + 3] > 0, B = b.data[i + 3] > 0;
    if (!A && !B) continue;
    if (A !== B) { alpha++; continue; }
    const p = C.oklab(a.data[i], a.data[i + 1], a.data[i + 2]), q = C.oklab(b.data[i], b.data[i + 1], b.data[i + 2]);
    list.push(C.dLab(p, q));
    if (a.data[i] !== b.data[i] || a.data[i + 1] !== b.data[i + 1] || a.data[i + 2] !== b.data[i + 2]) changed++;
  }
  return { list, changed, alpha };
}
export const proofLooks = (game) => {
  const base = Object.assign({}, game);
  delete base.cloth;
  const L = (o, label) => ({ look: Object.assign({}, base, o), label });
  return [
    { look: game, label: 'LOOK A (THE GAME LOOK)' },
    L({ skin: 0, hairColor: 6, outfit: 6, flowerCol: '#8a7ab8', scarfCol: '#2c4468', bandCol: '#c8452a' }, 'SKIN 0, WHITE HAIR, CLOTH 6'),
    L({ skin: 6, hairColor: 0, outfit: 5, flowerCol: '#f4f0e8', scarfCol: '#d8c89a', bandCol: '#f4f0e8' }, 'SKIN 6, BLACK HAIR, CLOTH 5'),
    L({ skin: 4, hairColor: 8, outfit: 0, flowerCol: '#c8962e', scarfCol: '#6a3a4a', bandCol: '#c8962e' }, 'SKIN 4, TEAL HAIR, CLOTH 0'),
    L({ skin: 2, hairColor: 4, outfit: 3, flowerCol: '#2c4468', scarfCol: '#c8452a', bandCol: '#2c4468' }, 'SKIN 2, GOLD HAIR, CLOTH 3'),
    L({ skin: 5, hairColor: 9, outfit: 7, flowerCol: '#c8452a', scarfCol: '#f4f0e8', bandCol: '#3a7a5a' }, 'SKIN 5, PLUM HAIR, CLOTH 7'),
    L({ skin: 3, hairColor: 1, outfit: 1, flowerCol: '#3a7a5a', scarfCol: '#8a7ab8', bandCol: '#d8c89a' }, 'SKIN 3, DARK BROWN HAIR, CLOTH 1'),
    L({ skin: 1, hairColor: 5, outfit: 4, flowerCol: '#d8c89a', scarfCol: '#3a7a5a', bandCol: '#6a3a4a' }, 'SKIN 1, GREY HAIR, CLOTH 4'),
  ];
};

// ---- the validation ------------------------------------------------------------------------------------------------------
export async function validate(res, outDir, opt = {}) {
  const RB = opt.RB || loadRuntime(), HC = RB.harmonyContract, C = HC.colour, HR = RB.harmonyRaster;
  const W = HC.BUST.w, H = HC.BUST.h, N = W * H, L = res.look;
  const kitFiles = res.files.filter((f) => f.key && f.cls);
  const out = { roundTrip: { materials: {}, files: {}, fixedChanged: 0, keyedExcluded: 0 }, import: null, busts: null, floor: {}, sheets: [] };
  // -- round trip, per file and material
  const rows = new Map(), rowOf = (key) => { if (!rows.has(key)) rows.set(key, rowOfRef(RB, L.ref(key))); return rows.get(key); };
  const perMat = {}, rt = new Map();
  for (const f of kitFiles) {
    const back = { w: W, h: H, data: new Uint8Array(f.key.data) }, de = new Float32Array(N).fill(-1), fm = {};
    for (let i = 0; i < N; i++) {
      const c = f.cls[i], o = 4 * i;
      if (c === -2) continue;
      if (c < 0) { if (f.key.data[o] !== f.img.data[o] || f.key.data[o + 1] !== f.img.data[o + 1] || f.key.data[o + 2] !== f.img.data[o + 2]) out.roundTrip.fixedChanged++; continue; }
      if (f.flags[i] & FLAG.keyed) { out.roundTrip.keyedExcluded++; continue; }
      const m = HC.MATERIALS[c], key = refKeyOf(m, f.parsed);
      const q = unpack(HR._.recolourPx(rowOf(key), c, pack(f.key.data[o], f.key.data[o + 1], f.key.data[o + 2])));
      back.data[o] = q[0]; back.data[o + 1] = q[1]; back.data[o + 2] = q[2];
      const v = C.dLab(C.oklab(q[0], q[1], q[2]), C.oklab(f.img.data[o], f.img.data[o + 1], f.img.data[o + 2]));
      de[i] = v;
      const changed = q[0] !== f.img.data[o] || q[1] !== f.img.data[o + 1] || q[2] !== f.img.data[o + 2];
      for (const bucket of [(perMat[key] = perMat[key] || { list: [], changed: 0, over: 0 }), (fm[key] = fm[key] || { list: [], changed: 0, over: 0 })]) { bucket.list.push(v); if (changed) bucket.changed++; if (v > JND) bucket.over++; }
    }
    rt.set(f.name, { back, de });
    out.roundTrip.files[f.name] = Object.fromEntries(Object.entries(fm).map(([k, b]) => [k, Object.assign(stats(b.list), { changed: b.changed, overJnd: b.over })]));
  }
  out.roundTrip.materials = Object.fromEntries(Object.entries(perMat).sort().map(([k, b]) => [k, Object.assign(stats(b.list), { changed: b.changed, overJnd: b.over })]));
  // -- the importer on the converted folder (only when it was written)
  let imported = null;
  if (opt.importDir) {
    imported = importToMemory(opt.importDir);
    out.import = { ok: imported.report.ok, summary: imported.report.summary, errors: imported.report.errors.concat(...Object.entries(imported.report.files).flatMap(([n, r]) => r.errors.map((e) => n + ': ' + e))).slice(0, 40), warnings: Object.entries(imported.report.files).flatMap(([n, r]) => r.warnings.map((w) => n + ': ' + w)).slice(0, 40), masks: Object.fromEntries(Object.entries(imported.report.files).map(([n, r]) => [n, r.maskSource])), verify: { ok: imported.verify.ok, errors: (imported.verify.errors || []).slice(0, 20) } };
  }
  // -- assembled busts: the converted kit in several looks; the input layers assembled as delivered
  let looks = [], inputBust = null, gameBust = null;
  if (imported && imported.report.ok && L.game) {
    install(RB, imported.manifest, imported.files);
    for (const pl of proofLooks(L.game)) { const b = await bust(RB, pl.look); looks.push(Object.assign({}, pl, b ? { img: b.img, state: b.state, comp: b.comp } : { img: null })); }
    gameBust = looks[0].img ? looks[0] : null;
    // the input layers, every pixel fixed (never recoloured), assembled by the same code
    const inFiles = Object.assign({}, imported.files);
    for (const f of kitFiles) {
      inFiles[f.name + '.png'] = encodePNG(f.img).toString('base64');
      const mk = blank(W, H);
      for (let i = 0; i < N; i++) if (f.img.data[4 * i + 3]) mk.data.set([0, 0, 0, 255], 4 * i);
      if (imported.manifest.files[f.name] && imported.manifest.files[f.name].mask) inFiles[imported.manifest.files[f.name].mask] = encodePNG(mk).toString('base64');
    }
    install(RB, imported.manifest, inFiles);
    const ib = gameBust ? await bust(RB, L.game, [gameBust.state, gameBust.comp]) : null;
    inputBust = ib ? ib.img : null;
    HR.uninstall();
    out.busts = { looks: looks.map((l) => ({ label: l.label, look: l.look, state: l.state || null, comp: l.comp || null, painted: !!l.img })) };
    if (inputBust && gameBust) {
      const dd = diffImages(inputBust, gameBust.img, C);
      out.busts.gameLookVsInput = Object.assign(stats(dd.list), { changed: dd.changed, overJnd: dd.list.filter((v) => v > JND).length, alphaDiffers: dd.alpha, state: gameBust.state, note: 'the converted kit assembled and recoloured in the game look vs the input layers assembled unrecoloured; equal to the per-file round trip when the look\'s reference ramps are the game look\'s own' });
    }
  }
  // -- the value floor (§5.4): neighbouring painted values on every supported target
  const SP = RB.sprites, base = Object.assign({}, L.game || { skin: 1, hairColor: 3, outfit: 2 });
  delete base.cloth;
  const ACC_COLS = ['#2c2430', '#6a3a4a', '#c8452a', '#c8962e', '#3a7a5a', '#2c4468', '#8a7ab8', '#d8c89a', '#f4f0e8'];
  const targetsOf = (key) => {
    const [m, acc] = key.split(':'), list = [];
    if (m === 'skin') SP.SKIN.forEach((_, i) => list.push(['skin ' + i, HR._.rampsOf(Object.assign({}, base, { skin: i })).rows.skin]));
    else if (m === 'hair') SP.HAIR.forEach((_, i) => list.push(['hair ' + (SP.HAIR_NAMES[i] || i), HR._.rampsOf(Object.assign({}, base, { hairColor: i })).rows.hair]));
    else if (m === 'clothMain' || m === 'clothTrim' || m === 'wrap') SP.CLOTH.forEach((_, i) => list.push(['cloth ' + i + (m === 'clothMain' ? ' main' : ' trim'), HR._.rampsOf(Object.assign({}, base, { outfit: i })).rows[m]]));
    else if (m === 'accessory') {
      const ch = HC.ACC[acc] && HC.ACC[acc].channel;
      if (ch) for (const c of [null].concat(ACC_COLS)) { const lk = c ? Object.assign({}, base, { [ch.field]: c }) : base; list.push([acc + ' ' + (c || 'default'), HR._.accRow(HR._.rampsOf(lk), lk, acc)]); }
    }
    return list;
  };
  for (const [key, k] of Object.entries(res.kit)) {
    // the kit's distinct values on this reference, by key t, with their painted colours
    const vals = new Map();
    for (const f of kitFiles) for (let i = 0; i < N; i++) {
      const c = f.cls[i];
      if (c < 0 || f.flags[i] & FLAG.keyed || refKeyOf(HC.MATERIALS[c], f.parsed) !== key) continue;
      const t = Math.round(f.tKey[i] * 1e5) / 1e5;
      if (!vals.has(t)) vals.set(t, [f.img.data[4 * i], f.img.data[4 * i + 1], f.img.data[4 * i + 2]]);
    }
    const ts = [...vals.keys()].sort((a, b) => a - b);
    let minDE = Infinity, worst = null, lost = 0, painted = 0;
    const lostPairs = new Set();
    for (const [name, row] of targetsOf(key)) {
      const lab = ts.map((t) => { const q = C.recolour({ t, rho: 0, theta: 0 }, row.curve); return C.oklab(q[0], q[1], q[2]); });
      for (let i = 1; i < ts.length; i++) {
        const e = C.dLab(lab[i], lab[i - 1]);
        if (e < minDE) { minDE = e; worst = { target: name, between: [r4(ts[i - 1]), r4(ts[i])] }; }
        const pa = vals.get(ts[i - 1]), pb = vals.get(ts[i]), pe = C.dLab(C.oklab(pa[0], pa[1], pa[2]), C.oklab(pb[0], pb[1], pb[2]));
        if (pe >= JND && e < JND) lostPairs.add(i);
      }
    }
    for (let i = 1; i < ts.length; i++) { const pa = vals.get(ts[i - 1]), pb = vals.get(ts[i]); if (C.dLab(C.oklab(pa[0], pa[1], pa[2]), C.oklab(pb[0], pb[1], pb[2])) >= JND) painted++; }
    lost = lostPairs.size;
    out.floor[key] = { values: ts.length, targets: targetsOf(key).length, minNeighbourDE: ts.length > 1 ? r4(minDE) : null, worst, pairsApartWhenPainted: painted, pairsUnderJndOnSomeTarget: lost };
  }
  // -- sheets
  const synthetic = !!res.cfg.synthetic, label = synthetic ? SYNTHETIC_LABEL : null;
  fs.mkdirSync(outDir, { recursive: true });
  out.sheets.push(writeFilesSheet(path.join(outDir, 'files.png'), kitFiles, rt, HC, label));
  if (looks.length) out.sheets.push(writeLooksSheet(path.join(outDir, 'looks.png'), inputBust, looks, HC, label, L.name));
  const report = Object.assign({}, res.report, { validation: out });
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 1) + '\n');
  return { out, report, looks, inputBust };
}

// ---- sheets ---------------------------------------------------------------------------------------------------------------
const BG = '#22252e', INK = '#e8e2d0', DIM = '#9a94a4', WARN = '#ff9a6a';
function unionBox(imgs, W, H) {
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (const img of imgs) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (img.data[(y * W + x) * 4 + 3]) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + 1); y1 = Math.max(y1, y + 1); }
  if (x1 <= x0) return [0, 0, W, H];
  return [Math.max(0, x0 - 2), Math.max(0, y0 - 2), Math.min(W, x1 + 2), Math.min(H, y1 + 2)];
}
function crop(img, b) {
  const o = blank(b[2] - b[0], b[3] - b[1]);
  for (let y = b[1]; y < b[3]; y++) for (let x = b[0]; x < b[2]; x++) { const s = (y * img.w + x) * 4; if (img.data[s + 3]) o.data.set(img.data.subarray(s, s + 4), ((y - b[1]) * o.w + x - b[0]) * 4); }
  return o;
}
const mix = (a, b, k) => [0, 1, 2].map((i) => Math.round(a[i] * (1 - k) + b[i] * k));
function heat(v) { // 0 → grey, JND → yellow, 0.05+ → red
  if (v < 0) return null;
  const k = Math.min(1, v / 0.05);
  return k < 0.4 ? mix([58, 62, 74], [232, 208, 64], k / 0.4) : mix([232, 208, 64], [255, 48, 48], (k - 0.4) / 0.6);
}
const FLAG_COL = [[FLAG.unresolved, [255, 32, 32]], [FLAG.foreign, [255, 64, 255]], [FLAG.collides, [0, 224, 255]], [FLAG.merged, [255, 255, 255]], [FLAG.clamped, [255, 208, 0]], [FLAG.clipped, [255, 128, 0]], [FLAG.neighbours, [168, 128, 255]], [FLAG.keyed, [128, 255, 128]]];
function writeFilesSheet(file, kitFiles, rt, HC, label) {
  const W = HC.BUST.w, H = HC.BUST.h, N = W * H, s = 2;
  const box = unionBox(kitFiles.map((f) => f.img), W, H), pw = (box[2] - box[0]) * s, ph = (box[3] - box[1]) * s;
  const cols = ['INPUT (REAL COLOURS)', 'KEY LAYER', 'MASK OVER INPUT', 'ROUND TRIP (LOOK A)', 'DELTA E (.02 YELLOW, .05 RED)', 'FLAGGED'];
  const head = label ? 96 : 72, rowH = ph + 24;
  const img = blank(12 + cols.length * (pw + 10), head + kitFiles.length * rowH + 50, BG);
  text(img, 'HARMONY KEYIFY — ' + kitFiles.length + ' KIT FILES — 2X, CROPPED TO THE KIT', 10, 10, INK, 2);
  if (label) text(img, label, 10, 36, WARN, 2);
  cols.forEach((c, i) => text(img, c, 10 + i * (pw + 10), head - 26, DIM));
  const T = { mask: HC.MATERIALS.map((m) => { const n = parseInt(HC.MASK[m].slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }) };
  kitFiles.forEach((f, r) => {
    const y = head + r * rowH + 14, R = rt.get(f.name);
    const panels = [f.img, f.key, blank(W, H), R ? R.back : blank(W, H), blank(W, H), blank(W, H)];
    for (let i = 0; i < N; i++) {
      const o = 4 * i;
      if (!f.img.data[o + 3]) continue;
      const src = [f.img.data[o], f.img.data[o + 1], f.img.data[o + 2]], grey = Math.round(0.3 * src[0] + 0.59 * src[1] + 0.11 * src[2]);
      const c = f.cls[i];
      const ov = c >= 0 ? mix(src, T.mask[c], 0.55) : c === -3 ? [255, 32, 32] : mix(src, [0, 0, 0], 0.55);
      panels[2].data.set([...ov, 255], o);
      const h = R ? heat(R.de[i]) : null;
      panels[4].data.set([...(h || mix([grey, grey, grey], [34, 37, 46], 0.7)), 255], o);
      let fc = null;
      for (const [b, col] of FLAG_COL) if (f.flags[i] & b) { fc = col; break; }
      panels[5].data.set([...(fc || mix([grey, grey, grey], [34, 37, 46], 0.6)), 255], o);
    }
    panels.forEach((p, i) => { const x = 10 + i * (pw + 10); rect(img, x, y, x + pw, y + ph, '#2e323e', true); blit(img, crop(p, box), x, y, s); });
    text(img, f.name + (f.mode && f.mode !== 'real' ? ' (' + f.mode.toUpperCase() + ')' : '') + (f.unresolved && f.unresolved.length ? ' — ' + f.unresolved.length + ' UNRESOLVED' : ''), 10, y - 11, f.unresolved && f.unresolved.length ? '#ff7070' : INK);
  });
  let lx = 10;
  const ly = img.h - 30;
  for (const [n, b] of Object.entries(FLAG)) { const col = (FLAG_COL.find((q) => q[0] === b) || [0, null])[1]; if (!col) continue; rect(img, lx, ly, lx + 10, ly + 8, col, true); lx = text(img, n.toUpperCase(), lx + 14, ly, DIM) + 12; }
  if (label) text(img, label, 10, img.h - 14, WARN);
  fs.writeFileSync(file, encodePNG(img, { text: label ? { Comment: label } : {} }));
  return path.basename(file);
}
function writeLooksSheet(file, inputBust, looks, HC, label, lookName) {
  const W = HC.BUST.w, H = HC.BUST.h, s = 2;
  const imgs = [inputBust].concat(looks.map((l) => l.img)).filter(Boolean);
  const box = unionBox(imgs, W, H), pw = (box[2] - box[0]) * s, ph = (box[3] - box[1]) * s;
  const panels = [{ img: inputBust, label: 'INPUT, ASSEMBLED (' + String(lookName).toUpperCase() + ')' }].concat(looks.map((l) => ({ img: l.img, label: l.label })));
  const per = 5, rows = Math.ceil(panels.length / per), head = label ? 72 : 48;
  const img = blank(12 + per * (pw + 12), head + rows * (ph + 28) + 30, BG);
  text(img, 'HARMONY KEYIFY — THE CONVERTED KIT, ASSEMBLED AND RECOLOURED BY THE GAME — 2X', 10, 10, INK, 2);
  if (label) text(img, label, 10, 34, WARN, 2);
  panels.forEach((p, i) => {
    const x = 10 + (i % per) * (pw + 12), y = head + Math.floor(i / per) * (ph + 28);
    rect(img, x, y, x + pw, y + ph, '#2e323e', true);
    if (p.img) blit(img, crop(p.img, box), x, y, s); else text(img, 'NOT PAINTED', x + 8, y + 8, '#ff7070');
    text(img, p.label, x, y + ph + 6, INK);
  });
  if (label) text(img, label, 10, img.h - 14, WARN);
  fs.writeFileSync(file, encodePNG(img, { text: label ? { Comment: label } : {} }));
  return path.basename(file);
}
