// The Harmony art importer's core (CLI: tools/harmony_import.mjs; contract: docs/harmony/contract/CONTRACT.md §9).
// importSet(inDir, opt) reads a batch of delivered PNGs, normalises each to the 192 × 160 native canvas, derives or
// reads the player kit's masks, assembles the manifest and the report, and (unless opt.check) writes them.
// verifySet(dir) re-checks a normalised folder. Everything is deterministic for the same input.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { decodePNG, encodePNG } from './png.mjs';
import { detectGrid, downsample, binarize, keyMagenta, looksLikeCheckerboard, hasTransparency, place } from './grid.mjs';
import { deriveMask, readMask, fixedKeyColours, maskImage, codesFrom, matOf } from './masks.mjs';
import { blank, blit, rect, line, text, rgba, put } from './image.mjs';
import { loadContract, loadRegistry, root } from './contract.mjs';

export const SYNTHETIC_LABEL = 'SYNTHETIC SAMPLE — not art';
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const r4 = (v) => Math.round(v * 1e4) / 1e4;
const rel = (p) => path.relative(root, p).split(path.sep).join('/') || '.';

function bboxOf(img) {
  let x0 = img.w, y0 = img.h, x1 = -1, y1 = -1;
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) if (img.data[(y * img.w + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return x1 < 0 ? null : [x0, y0, x1 + 1, y1 + 1];
}
function materialsOf(codes, HC) {
  const m = {};
  for (const c of codes) { if (!c) continue; const k = c === 1 ? 'fixed' : HC.MATERIALS[matOf(c)]; m[k] = (m[k] || 0) + 1; }
  return m;
}
// IoU of two images' alpha inside a box, with b shifted by (dx, dy)
function iou(a, b, box, dx, dy) {
  let inter = 0, uni = 0;
  for (let y = box[1]; y < box[3]; y++) for (let x = box[0]; x < box[2]; x++) {
    const A = a.data[(y * a.w + x) * 4 + 3] > 0;
    const X = x - dx, Y = y - dy;
    const B = X >= 0 && Y >= 0 && X < b.w && Y < b.h && b.data[(Y * b.w + X) * 4 + 3] > 0;
    if (A && B) inter++;
    if (A || B) uni++;
  }
  return uni ? inter / uni : 0;
}
// The offset that best lays `img` over `ref` (silhouettes inside the head box), within ±radius px.
export function suggestOffset(img, ref, box, radius) {
  let best = { dx: 0, dy: 0, iou: iou(ref, img, box, 0, 0) };
  for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
    const v = iou(ref, img, box, dx, dy);
    if (v > best.iou + 1e-9 || (Math.abs(v - best.iou) <= 1e-9 && Math.abs(dx) + Math.abs(dy) < Math.abs(best.dx) + Math.abs(best.dy))) best = { dx, dy, iou: v };
  }
  return { dx: best.dx, dy: best.dy, iou: r4(best.iou) };
}

// Normalise one delivered file. Returns { name, parsed, img, codes, maskSource, rep } (img null on a fatal error).
export function normaliseFile(buf, name, opt) {
  const HC = opt.HC || loadContract();
  const W = HC.BUST.w, H = HC.BUST.h;
  const p = HC.parse(name);
  const rep = { source: name + '.png', errors: [], warnings: [] };
  const fail = (m) => { rep.errors.push(m); return { name, parsed: p, img: null, codes: null, rep }; };
  if (!p || p.isMask) return fail('not a contract file name (docs/harmony/contract/CONTRACT.md §1)');
  if (p.unknown) return fail('unknown accessory file: ' + name);
  rep.kind = p.kind;
  rep.sourceSha256 = sha(buf);
  let src;
  try { src = decodePNG(buf); } catch (e) { return fail(e.message); }
  rep.srcW = src.w; rep.srcH = src.h; rep.png = { colorType: src.info.colorType, bitDepth: src.info.bitDepth };
  const fc = opt.fileCfg || {};
  if (looksLikeCheckerboard(src)) return fail('the background is a painted checkerboard, not transparency');
  const keyed = keyMagenta(src, fc.background || 'auto');
  if (keyed) rep.warnings.push(keyed + ' #ff00ff background pixels keyed out');
  if (!hasTransparency(src)) return fail('no transparency (and no flat #ff00ff background)');
  const grid = detectGrid(src, fc.cell ? { cell: fc.cell, origin: fc.origin } : null, HC.BUST);
  rep.grid = { cell: [r4(grid.x.c), r4(grid.y.c)], origin: [r4(grid.x.o), r4(grid.y.o)], score: [grid.x.score == null ? null : r4(grid.x.score), grid.y.score == null ? null : r4(grid.y.score)], native: [grid.x.n, grid.y.n], forced: !!fc.cell };
  if (!grid.square) rep.warnings.push('the detected cells are not square (' + rep.grid.cell.join(' × ') + ')');
  if (!fc.cell && Math.min(grid.x.score || 0, grid.y.score || 0) < 0.6) rep.warnings.push('a weak grid fit (' + rep.grid.score.join(', ') + '): check the contact sheet, or set files.' + name + '.cell');
  const nat = binarize(downsample(src, grid));
  const off = fc.offset || [Math.round((W - nat.w) / 2), Math.round((H - nat.h) / 2)];
  if (!fc.offset && (nat.w !== W || nat.h !== H)) rep.warnings.push('native ' + nat.w + ' × ' + nat.h + ', not ' + W + ' × ' + H + ': centred at ' + off.join(', ') + ' (set files.' + name + '.offset)');
  rep.offset = off.slice();
  const placed = place(nat, W, H, off[0], off[1]);
  if (placed.outside) rep.errors.push(placed.outside + ' opaque pixels fall outside the ' + W + ' × ' + H + ' canvas');
  const img = placed.img;
  if (!bboxOf(img)) rep.errors.push('the file is empty');
  // masks
  const allowed = HC.allowedOf(p);
  let codes, maskSource = 'none';
  if (allowed.length) {
    if (opt.maskBuf) {
      maskSource = 'supplied';
      let mk;
      try { mk = decodePNG(opt.maskBuf); } catch (e) { rep.errors.push('mask: ' + e.message); }
      if (mk) {
        let mn;
        if (mk.w === src.w && mk.h === src.h && (src.w !== W || src.h !== H)) mn = binarize(downsample(mk, grid));
        else if (mk.w === W && mk.h === H) mn = binarize(mk);
        else mn = binarize(downsample(mk, detectGrid(mk, null, HC.BUST)));
        const mp = mk.w === W && mk.h === H ? { img: mn } : place(mn, W, H, off[0], off[1]);
        const r = readMask(img, mp.img, allowed, HC);
        codes = r.codes;
        for (const e of r.errors.slice(0, 40)) rep.errors.push('mask ' + e.x + ',' + e.y + ': ' + e.why);
        if (r.errors.length > 40) rep.errors.push('… ' + (r.errors.length - 40) + ' more mask errors');
        rep.warnings.push(...r.warnings);
      }
    } else {
      maskSource = 'derived';
      const r = deriveMask(img, allowed, HC);
      codes = r.codes;
      rep.unresolved = r.unresolved.slice(0, 200);
      rep.unresolvedCount = r.unresolved.length;
      if (r.unresolved.length) rep.errors.push(r.unresolved.length + ' unresolved pixels (neither a key shade within ' + HC.IMPORT.snap + ' nor ' + HC.IMPORT.ambiguous + ' away from every allowed key shade): see unresolved, or supply ' + name + '.mask.png');
      if (r.snappedKey) rep.warnings.push(r.snappedKey + ' pixels snapped to their key shade');
      if (r.snappedOutline) rep.warnings.push(r.snappedOutline + ' pixels snapped to the outline ink #140c18');
    }
    if (codes) {
      const fk = fixedKeyColours(img, codes, HC);
      if (fk.length) rep.errors.push(fk.length + ' fixed pixels are exactly a key colour (first at ' + fk[0].x + ',' + fk[0].y + ' ' + fk[0].colour + ')');
    }
  } else {
    if (opt.maskBuf) rep.warnings.push('a mask for a file that is never recoloured is ignored');
    codes = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) codes[i] = img.data[4 * i + 3] ? 1 : 0;
  }
  rep.bbox = bboxOf(img);
  rep.materials = codes ? materialsOf(codes, HC) : null;
  rep.maskSource = maskSource;
  return { name, parsed: p, img, codes, maskSource, rep };
}

// Which states and layers each companion has, from the file names; plus errors.
function companionSets(names, HC, cfg, prev) {
  const out = {}, errors = [];
  for (const n of names) {
    const p = HC.parse(n);
    if (!p || p.kind !== 'comp') continue;
    const c = (out[p.who] = out[p.who] || { flat: new Set(), layered: new Map(), fx: new Set() });
    if (!p.layer) c.flat.add(p.state);
    else if (p.layer === 'fx') c.fx.add(p.state);
    else { if (!c.layered.has(p.state)) c.layered.set(p.state, new Set()); c.layered.get(p.state).add(p.layer); }
  }
  const res = {};
  for (const who of Object.keys(out).sort()) {
    const c = out[who], cc = Object.assign({}, prev && prev[who], cfg && cfg[who]);
    if (c.flat.size && c.layered.size) errors.push(who + ': both flattened and layered frames; deliver one or the other');
    const layered = c.layered.size > 0;
    const states = HC.STATES.filter((s) => (layered ? c.layered.has(s) : c.flat.has(s)));
    if (!layered && c.fx.size && !c.flat.size) errors.push(who + ': effect files without frames');
    let layers = null;
    if (layered) {
      layers = Array.isArray(cc.layers) ? cc.layers.slice() : null;
      if (!layers) errors.push(who + ': layered frames need "layers" (back to front) in import.json');
      else for (const [st, ls] of c.layered) for (const l of ls) if (layers.indexOf(l) < 0) errors.push(who + '_' + st + '_' + l + ': layer "' + l + '" is not in the listed layers');
    }
    const missing = HC.REQUIRED.filter((s) => states.indexOf(s) < 0);
    res[who] = { mode: layered ? 'layered' : 'flat', states, layers, fx: [...c.fx].sort((a, b) => HC.STATES.indexOf(a) - HC.STATES.indexOf(b)), face: cc.face || {}, timeline: cc.timeline || null, offset: cc.offset || { standard: [0, 0], compact: [0, 0] }, complete: !missing.length, missingRequired: missing };
  }
  return { sets: res, errors };
}

// Hats and caps must cover the bald scalp above their band line, on every head and hairstyle offset.
function hatCover(files, pc, HC) {
  const errs = [];
  const heads = Object.keys(files).filter((n) => /^pc_head_/.test(n));
  for (const hat of ['hat', 'cap']) {
    const f = files['acc_' + hat];
    if (!f || !heads.length) continue;
    const band = pc && pc.hatBand && pc.hatBand[hat];
    if (band == null) { errs.push('acc_' + hat + ': pc.hatBand.' + hat + ' (the band line) is not set'); continue; }
    const offs = [[0, 0]];
    for (const s of Object.keys((pc && pc.attach) || {})) if (pc.attach[s][hat]) offs.push(pc.attach[s][hat]);
    for (const h of heads) for (const [dx, dy] of offs) {
      let open = 0;
      const head = files[h], hi = f;
      for (let y = 0; y < Math.min(HC.BUST.h, band + dy); y++) for (let x = 0; x < HC.BUST.w; x++) {
        if (!head.data[(y * head.w + x) * 4 + 3]) continue;
        const X = x - dx, Y = y - dy;
        const cov = X >= 0 && Y >= 0 && X < hi.w && Y < hi.h && hi.data[(Y * hi.w + X) * 4 + 3];
        if (!cov) open++;
      }
      if (open) errs.push('acc_' + hat + ' at ' + dx + ',' + dy + ' leaves ' + open + ' scalp pixels of ' + h + ' above the band (y < ' + (band + dy) + ') uncovered');
    }
  }
  return errs;
}

// ---- the contact sheet ----------------------------------------------------------------------------------------------
const SHEET_BG = '#22252e', INK = '#e8e2d0', DIM = '#9a94a4';
function guides(img, ox, oy, s, who, HC) {
  const A = HC.ANCHORS[who === 'comp' ? 'comp' : 'pc'];
  const R = (b, col) => rect(img, ox + b[0] * s, oy + b[1] * s, ox + b[2] * s, oy + b[3] * s, col);
  R([0, 0, HC.BUST.w, HC.BUST.h], '#5a5e6a');
  R(A.head, '#5ab0ff80'); R(A.face, '#ffd84aa0'); R(HC.COMPACT_SAFE, '#b0b0b060');
  for (const h of A.hands) R(h, '#ff7ad070');
  const [nx, ny] = A.neck;
  line(img, ox + (nx - 4) * s, oy + ny * s, ox + (nx + 4) * s, oy + ny * s, '#ff4a4a'); line(img, ox + nx * s, oy + (ny - 4) * s, ox + nx * s, oy + (ny + 4) * s, '#ff4a4a');
  line(img, ox + A.crop[0][0] * s, oy + A.crop[0][1] * s, ox + A.crop[1][0] * s - 1, oy + A.crop[1][1] * s, '#3ad0a0', 6);
}
export function contactSheet(entries, meta, HC) {
  const s = 2, cw = HC.BUST.w * s + 8 + HC.BUST.w + 16, ch = HC.BUST.h * s + 28, cols = 3;
  const rows = Math.ceil(entries.length / cols);
  const head = meta.synthetic ? 64 : 40;
  const img = blank(cols * cw + 16, head + rows * ch + 30, SHEET_BG);
  text(img, 'HARMONY IMPORT ' + meta.set + ' — ' + entries.length + ' FILES — CONTRACT V' + HC.VERSION, 10, 10, INK, 2);
  if (meta.synthetic) text(img, SYNTHETIC_LABEL, 10, 36, '#ff9a6a', 2);
  entries.forEach((e, i) => {
    const x = 8 + (i % cols) * cw, y = head + Math.floor(i / cols) * ch;
    const who = e.parsed && e.parsed.kind === 'comp' ? 'comp' : 'pc';
    rect(img, x, y, x + HC.BUST.w * s, y + HC.BUST.h * s, '#2e323e', true);
    if (e.img) blit(img, e.img, x, y, s);
    guides(img, x, y, s, who, HC);
    const mx = x + HC.BUST.w * s + 8;
    rect(img, mx, y, mx + HC.BUST.w, y + HC.BUST.h, '#3a3e4a', true);
    if (e.codes) { const m = maskImage(e.codes, HC.BUST.w, HC.BUST.h, HC); for (let k = 0; k < e.codes.length; k++) if (e.codes[k] === 1) m.data.set([70, 70, 78, 255], 4 * k); blit(img, m, mx, y, 1); }
    text(img, e.rep.maskSource === 'none' ? 'FIXED' : 'MASK ' + e.rep.maskSource, mx, y + HC.BUST.h + 4, DIM);
    const bad = e.rep.errors.length ? ' ERR ' + e.rep.errors.length : '';
    text(img, e.name + bad, x, y + HC.BUST.h * s + 6, e.rep.errors.length ? '#ff7070' : INK);
  });
  if (meta.synthetic) text(img, SYNTHETIC_LABEL, 10, img.h - 20, '#ff9a6a', 1);
  return img;
}

// ---- a whole batch --------------------------------------------------------------------------------------------------
export function importSet(inDir, opt = {}) {
  const HC = loadContract();
  const W = HC.BUST.w, H = HC.BUST.h;
  const out = opt.out || path.join(root, 'assets/harmony');
  const regFile = loadRegistry(opt.registry);
  const cfgPath = path.join(inDir, 'import.json');
  const cfg = fs.existsSync(cfgPath) ? JSON.parse(fs.readFileSync(cfgPath, 'utf8')) : {};
  const set = opt.set || cfg.set || path.basename(path.resolve(inDir)).toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const synthetic = !!cfg.synthetic;
  const all = fs.readdirSync(inDir).filter((f) => /\.png$/i.test(f)).sort();
  const maskNames = new Set(all.filter((f) => /\.mask\.png$/i.test(f)));
  const artNames = all.filter((f) => !maskNames.has(f));
  const report = { set, synthetic, contractVersion: HC.VERSION, inDir: rel(path.resolve(inDir)), out: rel(path.resolve(out)), files: {}, errors: [], warnings: [] };
  const done = [];
  for (const f of artNames) {
    const name = f.replace(/\.png$/i, '');
    const mf = name + '.mask.png';
    const r = normaliseFile(fs.readFileSync(path.join(inDir, f)), name, { HC, fileCfg: (cfg.files || {})[name], maskBuf: maskNames.has(mf) ? fs.readFileSync(path.join(inDir, mf)) : null });
    report.files[name] = r.rep;
    done.push(r);
  }
  for (const m of maskNames) if (!artNames.includes(m.replace(/\.mask\.png$/i, '.png'))) report.warnings.push(m + ': a mask without its file');
  // offset suggestions: against the same name already imported, else the kind's reference in this batch
  if (opt.suggest) {
    const byName = Object.fromEntries(done.filter((d) => d.img).map((d) => [d.name, d]));
    for (const d of done) {
      if (!d.img) continue;
      let ref = null, refName = null;
      const prevPng = path.join(out, d.name + '.png');
      if (fs.existsSync(prevPng)) { ref = decodePNG(fs.readFileSync(prevPng)); refName = 'previous ' + d.name + '.png'; }
      else if (d.parsed.kind === 'comp' && !d.parsed.layer) { const st = ['settle_b', 'peak', 'cue', 'prep_a'].find((s) => byName[d.parsed.who + '_' + s]); if (st && d.parsed.who + '_' + st !== d.name) { ref = byName[d.parsed.who + '_' + st].img; refName = d.parsed.who + '_' + st; } }
      else if (d.parsed.kind === 'head' && d.name !== 'pc_head_focus' && byName.pc_head_focus) { ref = byName.pc_head_focus.img; refName = 'pc_head_focus'; }
      if (!ref) continue;
      const box = HC.ANCHORS[d.parsed.kind === 'comp' ? 'comp' : 'pc'].head;
      const sg = suggestOffset(d.img, ref, box, HC.IMPORT.maxOffset);
      // (a match below 0.5 IoU is no evidence of where the file belongs: nothing is suggested)
      d.rep.suggestion = sg.iou >= 0.5 ? { reference: refName, delta: [sg.dx, sg.dy], offset: [d.rep.offset[0] + sg.dx, d.rep.offset[1] + sg.dy], iou: sg.iou } : { reference: refName, none: 'no reliable silhouette match (best IoU ' + sg.iou + ')' };
    }
  }
  // the manifest: earlier batches' files stay unless replaced
  const prevPath = path.join(out, 'manifest.json');
  const prev = !opt.replace && fs.existsSync(prevPath) ? JSON.parse(fs.readFileSync(prevPath, 'utf8')) : null;
  const files = Object.assign({}, prev ? prev.files : {});
  const outputs = {};
  for (const d of done) {
    if (!d.img || d.rep.errors.length) continue;
    const png = encodePNG(d.img, { text: synthetic ? { Comment: SYNTHETIC_LABEL } : {} });
    const hasMask = d.maskSource !== 'none';
    const mpng = hasMask ? encodePNG(maskImage(d.codes, W, H, HC), { text: synthetic ? { Comment: SYNTHETIC_LABEL } : {} }) : null;
    outputs[d.name] = { png, mpng };
    files[d.name] = {
      png: d.name + '.png', w: W, h: H, kind: d.parsed.kind, sha256: sha(png), bytes: png.length,
      mask: hasMask ? d.name + '.mask.png' : null, maskSource: d.maskSource, maskSha256: mpng ? sha(mpng) : null, maskBytes: mpng ? mpng.length : 0,
      bbox: d.rep.bbox, materials: d.rep.materials,
      import: { set, source: d.rep.source, sourceSha256: d.rep.sourceSha256, srcW: d.rep.srcW, srcH: d.rep.srcH, cell: d.rep.grid.cell, origin: d.rep.grid.origin, offset: d.rep.offset },
    };
  }
  const names = Object.keys(files).sort();
  const cs = companionSets(names, HC, cfg.companions, prev && prev.companions);
  report.errors.push(...cs.errors);
  const pc = Object.assign({ face: {}, groups: {}, attach: {}, hatBand: {}, armSlot: {}, glassesOver: [], offset: { standard: [0, 0], compact: [0, 0] } }, prev && prev.pc);
  for (const k of Object.keys(cfg.pc || {})) pc[k] = Array.isArray(cfg.pc[k]) ? cfg.pc[k].slice() : typeof cfg.pc[k] === 'object' ? Object.assign({}, pc[k], cfg.pc[k]) : cfg.pc[k];
  const keys = regFile ? regFile.json.assetKeys : null;
  const coverage = keys ? { required: keys.required.length, present: keys.required.filter((k) => files[k]).length, missingRequired: keys.required.filter((k) => !files[k]), optionalPresent: keys.optional.filter((k) => files[k]) } : { unresolved: true, reason: 'no docs/harmony/contract/registry.json' };
  const manifest = {
    schema: 'rbn-harmony-manifest', contractVersion: HC.VERSION, artVersion: cfg.artVersion || (prev ? prev.artVersion + (Object.keys(outputs).length ? 1 : 0) : 1), set, synthetic: synthetic || !!(prev && prev.synthetic),
    source: { importer: 'tools/harmony_import.mjs', registry: regFile ? { sha256: sha(regFile.bytes), indexHtml: regFile.json.source.indexHtml.sha256, commit: regFile.json.source.git.commit } : null, sets: [...new Set([...(prev && prev.source && prev.source.sets) || [], set])] },
    files: Object.fromEntries(names.map((n) => [n, files[n]])),
    companions: Object.fromEntries(Object.entries(cs.sets).map(([k, v]) => [k, { mode: v.mode, states: v.states, layers: v.layers, fx: v.fx, face: v.face, timeline: v.timeline, offset: v.offset }])),
    pc, coverage,
  };
  // the images the manifest describes (new from this batch, earlier ones from the output folder)
  const imgOf = {};
  for (const d of done) if (d.img && outputs[d.name]) imgOf[d.name] = d.img;
  for (const n of names) if (!imgOf[n] && fs.existsSync(path.join(out, n + '.png'))) imgOf[n] = decodePNG(fs.readFileSync(path.join(out, n + '.png')));
  report.errors.push(...hatCover(imgOf, pc, HC));
  const pngList = names.flatMap((n) => [files[n].png].concat(files[n].mask ? [files[n].mask] : []));
  report.errors.push(...HC.validateManifest(manifest, pngList).map((e) => 'manifest: ' + e));
  report.companions = cs.sets;
  report.coverage = coverage;
  report.unknownNames = Object.entries(report.files).filter(([, r]) => r.errors.some((e) => /not a contract file name|unknown accessory/.test(e))).map(([n]) => n);
  const fileErrors = Object.values(report.files).reduce((n, r) => n + r.errors.length, 0);
  report.ok = !fileErrors && !report.errors.length;
  report.summary = { files: artNames.length, imported: Object.keys(outputs).length, fileErrors, setErrors: report.errors.length, warnings: Object.values(report.files).reduce((n, r) => n + r.warnings.length, 0) + report.warnings.length };
  const sheet = contactSheet(done, { set, synthetic }, HC);
  if (!opt.check) {
    fs.mkdirSync(out, { recursive: true });
    if (opt.replace) for (const f of fs.readdirSync(out)) if (/\.png$/.test(f)) fs.rmSync(path.join(out, f));
    for (const [n, o] of Object.entries(outputs)) { fs.writeFileSync(path.join(out, n + '.png'), o.png); if (o.mpng) fs.writeFileSync(path.join(out, n + '.mask.png'), o.mpng); }
    if (report.ok || opt.force) fs.writeFileSync(prevPath, JSON.stringify(manifest, null, 1) + '\n');
    const rd = opt.reportDir || path.join(out, 'report');
    fs.mkdirSync(rd, { recursive: true });
    fs.writeFileSync(path.join(rd, 'report.json'), JSON.stringify(report, null, 1) + '\n');
    fs.writeFileSync(path.join(rd, 'contact.png'), encodePNG(sheet, { text: synthetic ? { Comment: SYNTHETIC_LABEL } : {} }));
  }
  return { manifest, report, outputs, sheet, done };
}

// Re-check a normalised folder: schema, hashes, sizes, masks against pixels, key colours, hat cover.
export function verifySet(dir) {
  const HC = loadContract();
  const res = { dir: rel(path.resolve(dir)), errors: [], files: 0 };
  const mp = path.join(dir, 'manifest.json');
  if (!fs.existsSync(mp)) { res.errors.push('no manifest.json'); return res; }
  const m = JSON.parse(fs.readFileSync(mp, 'utf8'));
  const present = fs.readdirSync(dir).filter((f) => f.endsWith('.png'));
  res.errors.push(...HC.validateManifest(m, present).map((e) => 'manifest: ' + e));
  const imgs = {};
  for (const [n, f] of Object.entries(m.files || {})) {
    res.files++;
    const p = path.join(dir, f.png);
    if (!fs.existsSync(p)) continue;
    const buf = fs.readFileSync(p);
    if (sha(buf) !== f.sha256) res.errors.push(n + ': sha256 does not match the manifest');
    let img;
    try { img = decodePNG(buf); } catch (e) { res.errors.push(n + ': ' + e.message); continue; }
    if (img.w !== HC.BUST.w || img.h !== HC.BUST.h) res.errors.push(n + ': ' + img.w + ' × ' + img.h);
    for (let i = 3; i < img.data.length; i += 4) if (img.data[i] !== 0 && img.data[i] !== 255) { res.errors.push(n + ': alpha is not binary'); break; }
    imgs[n] = img;
    const mk = f.mask && fs.existsSync(path.join(dir, f.mask)) ? decodePNG(fs.readFileSync(path.join(dir, f.mask))) : null;
    if (f.mask && mk && f.maskSha256 && sha(fs.readFileSync(path.join(dir, f.mask))) !== f.maskSha256) res.errors.push(n + ': mask sha256 does not match the manifest');
    const { codes, errors } = codesFrom(img, mk, HC);
    res.errors.push(...errors.slice(0, 10).map((e) => n + ': ' + e));
    if (f.mask) { const fk = fixedKeyColours(img, codes, HC); if (fk.length) res.errors.push(n + ': ' + fk.length + ' fixed pixels in a key colour'); }
  }
  res.errors.push(...hatCover(imgs, m.pc, HC));
  res.ok = !res.errors.length;
  return res;
}
