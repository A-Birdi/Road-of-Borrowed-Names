// Writes the SYNTHETIC sample delivery for the Harmony painted-art contract (tests/fixtures/harmony_sample/):
// a minimal set the importer can read and the game can assemble — Suzu (five states and an effect) and a player
// kit for two materially different looks (ponytail + coat + glasses + flower; curly + robe + scarf + satchel).
// It is NOT art: every file is the game's own code-drawn bust layers (88_harmony_*.js), placed on the contract's
// 192 × 160 template, the player mirrored to face left, the recolourable parts repainted in the key ramps, and
// some files enlarged (4×, 3× on a flat magenta background, a 1024 square at 5.333×) so the importer's grid
// detection is exercised. Each PNG carries the text "SYNTHETIC SAMPLE — not art".
//   node tools/build.mjs && node tools/harmony_sample.mjs
// Mirroring puts the player's worn things on the other side of the head: sides in the sample are not a reference.
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from '../tests/e2e/lib.mjs';
import { encodePNG } from './harmony/png.mjs';
import { blank } from './harmony/image.mjs';
import { SYNTHETIC_LABEL } from './harmony/importer.mjs';

const OUT = path.join(root, 'tests/fixtures/harmony_sample/incoming');
const LOOK_A = { skin: 1, hair: 'ponytail', hairColor: 3, outfit: 2, shape: 'coat', acc: ['glasses', 'flower'] };
const LOOK_B = { skin: 5, hair: 'curly', hairColor: 8, outfit: 6, shape: 'robe', acc: ['scarf', 'satchel'] };

const { srv, url } = await serve();
const browser = await launch();
const { p, errors } = await page(browser, url, { viewport: { width: 1280, height: 800 } });

const res = await p.evaluate(({ LOOK_A, LOOK_B }) => {
  const HK = RB.harmonyKit, HC = RB.harmonyContract, P = RB.pxkit;
  const W = HC.BUST.w, H = HC.BUST.h, B = HK.BUST;
  const OUTLINE = P.parse(HC.OUTLINE);
  const tmp = [];
  const pose = (name, base, ph, mod) => { HK.POSES[name] = (_ph, v) => { const q = HK.POSES[base](ph, v); mod(q); return q; }; tmp.push(name); return name; };
  // ---- material classes: which code materials are which contract material -----------------------------------------
  const mi = (m) => HC.MATERIALS.indexOf(m);
  function classes(look, extra) {
    const d = HK.dressOf(look), c = new Map();
    const add = (M, m, pick) => { if (M) c.set(M.id, { m: mi(m), pick }); };
    add(d.F.skin, 'skin', HC.PICK.skin);
    add(d.F.blush, 'skin', [5]); // (the blush is painted as the skin's highlight: it recolours with the skin)
    add(d.Mh, 'hair', HC.PICK.n6); add(d.Mb, 'hair', [0, 1]);
    for (const id of HK._matIds('stubble')) c.set(id, { m: mi('hair'), pick: [0, 1, 2, 3] });
    add(d.Mc, 'clothMain', HC.PICK.n6); add(d.Ma, 'clothTrim', HC.PICK.n6);
    add(HK.clothMat(look.wrapCol || d.cloth[2]), 'clothTrim', HC.PICK.n6);
    for (const [name, pick] of extra || []) for (const id of HK._matIds(name)) c.set(id, { m: mi('accessory'), pick });
    return c;
  }
  // nearest pick slot for a ramp index (ties go darker)
  const slot = (pick, idx) => { let b = 0, bd = 1e9; pick.forEach((k, s) => { const v = Math.abs(k - idx); if (v < bd) { bd = v; b = s; } }); return b; };
  // ---- one file: code layers → 192 × 160 RGBA, the player mirrored ------------------------------------------------
  function render(stack, names, who, cls, shift) {
    const img = new Uint8Array(W * H * 4), codes = new Uint8Array(W * H);
    const nx = who === 'pc' ? HC.ANCHORS.pc.neck : HC.ANCHORS.comp.neck;
    const mir = who === 'pc';
    const dx = nx[0] - (mir ? B.w - 1 - B.ax : B.ax) + ((shift && shift[0]) || 0), dy = nx[1] - B.ay + ((shift && shift[1]) || 0);
    for (const n of names) {
      const L = stack.layers ? stack.layers.get(n) : stack;
      if (!L) continue;
      for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) {
        const i = y * L.w + x, px = L.px[i];
        // (alpha is binary in the contract: translucent code pixels — the glasses' lens tint — are left out)
        if ((px >>> 24) < 200) continue;
        const X = (mir ? L.w - 1 - x : x) + dx, Y = y + dy;
        if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
        const M = P.MATS[L.mt[i]];
        let rgb = [px & 255, (px >> 8) & 255, (px >> 16) & 255], code = 1;
        if (M && (px === M.line || px === M.lineLit)) rgb = OUTLINE.slice(0, 3);
        else if (M && cls && cls.has(M.id)) {
          const cl = cls.get(M.id), idx = M.c.indexOf(px);
          if (idx >= 0) { const s = slot(cl.pick, idx); rgb = P.parse(HC.KEY_RAMPS[HC.MATERIALS[cl.m]][s]).slice(0, 3); code = 2 + cl.m * 5 + s; }
        }
        const o = 4 * (Y * W + X);
        img[o] = rgb[0]; img[o + 1] = rgb[1]; img[o + 2] = rgb[2]; img[o + 3] = 255; codes[Y * W + X] = code;
      }
    }
    return { img, codes };
  }
  // the robe's wide sleeve, synthesised: cloth pixels of the fitted arm grown two px outward and down
  function widen(f) {
    const img = f.img.slice(), codes = f.codes.slice();
    const isCloth = (c) => c >= 2 && (Math.floor((c - 2) / 5) === mi('clothMain') || Math.floor((c - 2) / 5) === mi('clothTrim'));
    const grow = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (codes[y * W + x]) continue;
      let near = false;
      for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, -2], [-1, -1], [1, -1], [-2, -1], [2, -1]]) { const X = x + ox, Y = y + oy; if (X >= 0 && Y >= 0 && X < W && Y < H && isCloth(codes[Y * W + X])) near = true; }
      if (near) grow.push(y * W + x);
    }
    const key = P.parse(HC.KEY_RAMPS.clothMain[1]);
    for (const i of grow) { img.set([key[0], key[1], key[2], 255], 4 * i); codes[i] = 2 + mi('clothMain') * 5 + 1; }
    // a fresh outline round the new edge
    const edge = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (codes[y * W + x]) continue; for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { const X = x + ox, Y = y + oy; if (X >= 0 && Y >= 0 && X < W && Y < H && grow.indexOf(Y * W + X) >= 0) { edge.push(y * W + x); break; } } }
    for (const i of edge) { img.set([OUTLINE[0], OUTLINE[1], OUTLINE[2], 255], 4 * i); codes[i] = 1; }
    return { img, codes };
  }
  const b64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
  const files = {};
  const put = (name, f, mask) => { files[name] = { rgba: b64(f.img), codes: mask ? b64(f.codes) : null }; };
  const faceOf = (b, who, shift) => {
    const r = b.face, nx = (who === 'pc' ? HC.ANCHORS.pc : HC.ANCHORS.comp).neck;
    const dx = nx[0] - (who === 'pc' ? B.w - 1 - B.ax : B.ax) + ((shift && shift[0]) || 0), dy = nx[1] - B.ay;
    const x0 = who === 'pc' ? B.w - (r.x + r.w) : r.x;
    return [x0 + dx, r.y + dy, x0 + dx + r.w, r.y + dy + r.h];
  };

  // ---- Suzu: prep_a, prep_b, cue, peak (+ its glint as an effect file), settle_b; settle_a left out on purpose ---
  const S = { prep_a: ['curtain', 'enter'], prep_b: [pose('__s_suzu_prepb', 'curtain', 'enter', (q) => { q.nearArm.wr = [q.nearArm.wr[0] - 1, q.nearArm.wr[1] - 3]; q.settle = 1; }), 'hold'],
    cue: [pose('__s_suzu_cue', 'curtain', 'hold', (q) => { q.expr = { near: {}, far: {}, brow: 'up', mouth: 'grin', blush: true }; }), 'hold'],
    peak: ['curtain', 'hold'], settle_b: [pose('__s_suzu_settle', 'curtain', 'hold', (q) => { q.expr = { near: {}, far: {}, brow: 'soft', mouth: 'smile', blush: true }; q.head = [0, 0]; }), 'hold'] };
  const suzuFace = {};
  for (const [st, [ps, ph]] of Object.entries(S)) {
    const b = HK.drawBust('suzu', null, ps, ph, 'standard', { fx: false });
    put('suzu_' + st, render(b.layer, ['x'], 'comp', null));
    suzuFace[st] = faceOf(b, 'comp');
  }
  { const b = HK.drawBust('suzu', null, 'curtain', 'hold', 'standard', { fx: true, keepLayers: true }); put('suzu_peak_fx', render(b.stack, ['fx'], 'comp', null)); }

  // ---- the player kit ------------------------------------------------------------------------------------------------
  const EXPR = {
    focus: (q) => { q.expr = { near: { lid: 1 }, far: { lid: 1 }, brow: 'knit', mouth: 'firm' }; },
    cue: (q) => { q.expr = { near: {}, far: {}, brow: 'up', mouth: 'open' }; },
    peak: (q) => { q.expr = { near: {}, far: { closed: 'up' }, brow: 'lift', mouth: 'grin', blush: true }; },
    settle: (q) => { q.expr = { near: {}, far: {}, brow: 'firm', mouth: 'smirk' }; },
  };
  const bald = Object.assign({}, LOOK_A, { hair: 'shaved', acc: [] });
  const pcFace = {};
  for (const [e, mod] of Object.entries(EXPR)) {
    const ps = pose('__s_pc_' + e, 'rally', 'hold', (q) => { mod(q); q.head = [0, 0]; });
    const b = HK.drawBust('pc', bald, ps, 'hold', 'standard', { keepLayers: true });
    // (the head is painted bald: the hair's cast shadow on the forehead comes from the stubble only)
    put('pc_head_' + e, render(b.stack, ['neck', 'head', 'brows'], 'pc', classes(bald)), e === 'peak');
    pcFace[e] = faceOf(b, 'pc');
  }
  for (const look of [LOOK_A, LOOK_B]) {
    const cls = classes(look, [['scarf', HC.PICK.n6], ['flower', HC.PICK.n6]]);
    const enter = HK.drawBust('pc', look, 'rally', 'enter', 'standard', { keepLayers: true });
    const hold = HK.drawBust('pc', look, 'rally', 'hold', 'standard', { keepLayers: true });
    const holdNoFx = HK.drawBust('pc', look, 'rally', 'hold', 'standard', { keepLayers: true, fx: false });
    put('pc_torso_' + look.shape, render(hold.stack, ['torso'], 'pc', cls), look.shape === 'robe');
    put('pc_hair_' + look.hair + '_back', render(hold.stack, ['hairBack'], 'pc', cls));
    put('pc_hair_' + look.hair + '_front', render(hold.stack, ['cap', 'front'], 'pc', cls));
    if (look.hair === 'ponytail') put('pc_hair_ponytail_back_swing', render(enter.stack, ['hairBack'], 'pc', cls)); // the trailing drawing
    const arm = ['farArm', 'farHeld', 'farHand'];
    const arms = {
      prep_a: render(enter.stack, arm, 'pc', cls), prep_b: render(enter.stack, arm, 'pc', cls, [1, -3]),
      cue: render(holdNoFx.stack, arm, 'pc', cls), peak_suzu: render(hold.stack, arm.concat(['ink']), 'pc', cls), settle_suzu: render(holdNoFx.stack, arm, 'pc', cls, [-1, 2]),
    };
    const sleeve = HC.sleeveOf(look.shape);
    for (const [ps, f] of Object.entries(arms)) {
      if (sleeve === 'wide' && ps === 'prep_b') continue; // optional: left out so prep_b falls back to prep_a
      const name = 'pc_arm_' + ps + '_' + sleeve;
      put(name, sleeve === 'wide' ? widen(f) : f, name === 'pc_arm_settle_suzu_wide');
    }
    for (const a of look.acc) {
      const only = Object.assign({}, look, { acc: [a] });
      const b = HK.drawBust('pc', only, 'rally', 'hold', 'standard', { keepLayers: true });
      const layer = { glasses: ['glasses'], flower: ['headAcc'], scarf: ['scarf'], satchel: ['chest'] }[a];
      put('acc_' + a, render(b.stack, layer, 'pc', classes(only, [['scarf', HC.PICK.n6], ['flower', HC.PICK.n6]])));
    }
  }
  for (const n of tmp) delete HK.POSES[n];
  return { files, suzuFace, pcFace };
}, { LOOK_A, LOOK_B });

// ---- enlarge some files, write PNGs, masks and import.json ------------------------------------------------------------
const W = 192, H = 160;
const MASK = { 0: null, 1: [0, 0, 0], skin: [255, 0, 0], hair: [0, 255, 0], clothMain: [0, 0, 255], clothTrim: [255, 255, 0], accessory: [255, 0, 255] };
const MATS = ['skin', 'hair', 'clothMain', 'clothTrim', 'accessory'];
const fromB64 = (s) => new Uint8Array(Buffer.from(s, 'base64'));
function enlarge(img, f, CW, CH, ox, oy, bg) {
  const out = blank(CW, CH, bg || null);
  for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
    const sx = Math.floor((x + 0.5 - ox) / f), sy = Math.floor((y + 0.5 - oy) / f);
    if (sx < 0 || sy < 0 || sx >= W || sy >= H) continue;
    const o = (sy * W + sx) * 4;
    if (img.data[o + 3]) out.data.set(img.data.subarray(o, o + 4), (y * CW + x) * 4);
  }
  return out;
}
// how each file is delivered: [factor, canvas w, h, offset x, y, background]
const SCALE = {
  suzu_prep_a: [4, 768, 640, 0, 0], suzu_peak: [4, 768, 640, 0, 0], suzu_peak_fx: [4, 768, 640, 0, 0],
  suzu_cue: [1024 / 192, 1024, 1024, 0, (1024 - 160 * 1024 / 192) / 2],
  pc_head_peak: [3, 576, 480, 0, 0, '#ff00ff'],
  pc_torso_robe: [4, 768, 640, 0, 0], pc_hair_curly_front: [4, 768, 640, 0, 0],
};
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
let bytes = 0;
const TEXT = { Comment: SYNTHETIC_LABEL };
for (const [name, f] of Object.entries(res.files)) {
  const img = { w: W, h: H, data: fromB64(f.rgba) };
  const sc = SCALE[name];
  const big = sc ? enlarge(img, sc[0], sc[1], sc[2], sc[3], sc[4], sc[5]) : img;
  const png = encodePNG(big, { text: TEXT });
  fs.writeFileSync(path.join(OUT, name + '.png'), png); bytes += png.length;
  if (f.codes) {
    // a supplied mask (exercises the override): exact, from the code materials, delivered at the art's scale
    const codes = fromB64(f.codes), m = blank(W, H);
    for (let i = 0; i < W * H; i++) { const c = codes[i]; if (!c) continue; const col = c === 1 ? MASK[1] : MASK[MATS[Math.floor((c - 2) / 5)]]; m.data.set([...col, 255], 4 * i); }
    const mbig = sc ? enlarge(m, sc[0], sc[1], sc[2], sc[3], sc[4]) : m;
    const mp = encodePNG(mbig, { text: TEXT });
    fs.writeFileSync(path.join(OUT, name + '.mask.png'), mp); bytes += mp.length;
  }
}
const cfg = {
  set: 'sample', synthetic: true, artVersion: 1,
  note: SYNTHETIC_LABEL + '. Written by tools/harmony_sample.mjs from the code-drawn busts; see docs/harmony/contract/CONTRACT.md.',
  files: { pc_head_peak: { background: 'magenta' } },
  companions: { suzu: { face: res.suzuFace } },
  pc: {
    face: res.pcFace,
    groups: { prep_b: { head: [0, -1], torso: [0, 0] }, peak: { head: [0, -1], torso: [0, -1] } },
    attach: { curly: { flower: [0, -2] } },
  },
};
fs.writeFileSync(path.join(OUT, 'import.json'), JSON.stringify(cfg, null, 1) + '\n');
fs.writeFileSync(path.join(OUT, '..', 'SYNTHETIC.txt'), SYNTHETIC_LABEL + '\n\nEvery image here is generated by tools/harmony_sample.mjs from the game\'s code-drawn Harmony busts, placed on the\ncontract v2 template (docs/harmony/contract/CONTRACT.md). It exists to exercise the importer and the runtime\nraster path; it is not art, not a style reference and not a delivery. The player is mirrored, so worn sides\nare reversed. Looks: A ponytail + coat + glasses + flower; B curly + robe (wide sleeve) + scarf + satchel.\n');
console.log('wrote', Object.keys(res.files).length, 'files (' + Object.values(res.files).filter((f) => f.codes).length + ' with supplied masks),', (bytes / 1024).toFixed(1), 'KiB, to', path.relative(root, OUT));
if (errors.length) { console.log('page errors:\n' + errors.join('\n')); process.exitCode = 1; }
await browser.close(); srv.close();
