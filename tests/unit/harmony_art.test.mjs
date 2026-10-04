// Harmony portrait art (Harmony addendum §5.1, §6, §21, §23.3), in node without a canvas: the busts and the
// paired compositions are built as pixel layers (RB.harmonyArt._.build / RB.harmonyKit.drawBust).
// - coverage: the appearance fixture set, generated from the registries, covers every hairstyle, garment
//   shape, cloth palette, skin, hair colour, accessory category and wearable keepsake;
// - every fixture's player bust draws (hold, the crossing arrival drawing, standard and compact) with the
//   face inside the canvas and visible;
// - the four pairings × two phases × two variants compose; neither face is touched by the other bust
//   (a composition compared with one that leaves the other bust out, inside each face rectangle);
// - sides: worn things stay on their own side (Suzu's ribbon and mole, Nao's pencil, Ren's ponytail, the
//   near earring, the satchel's strap from the near shoulder);
// - keys: the resolved look, companion, phase, variant and ART_VERSION are in them; reduced motion → hold;
// - determinism and discipline: identical pixels on a rebuild; no Math.random or clock in the art files.
import fs from 'node:fs';
import path from 'node:path';
import { load, root } from '../lib/load.mjs';

export default async (t) => {
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content']);
  const HA = RB.harmonyArt, HK = RB.harmonyKit, FX = RB.harmonyArtFixtures;
  t.ok(HA && HK && FX, 'RB.harmonyArt, RB.harmonyKit and the fixture set exist');

  // ---- coverage ------------------------------------------------------------------------------------------
  const list = FX.fixtures();
  const cov = FX.coverage(list);
  for (const k of Object.keys(cov)) t.eq(cov[k].missing, [], 'fixtures cover every ' + k + ' (' + cov[k].got + '/' + cov[k].want + ')');
  t.ok(list.length >= 24, 'at least 24 fixtures (' + list.length + ')');
  t.ok(list.every((f) => f.synthetic === true), 'every fixture is labelled synthetic');

  // ---- every fixture's player bust ------------------------------------------------------------------------
  const B = HK.BUST;
  const opaque = (L, r) => { let n = 0; for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) if (x >= 0 && y >= 0 && x < L.w && y < L.h && L.px[y * L.w + x] >>> 24) n++; return n; };
  const bad = [];
  let drawn = 0;
  for (const f of list) for (const ph of ['hold', 'enter']) for (const v of ['standard', 'compact']) {
    if (v === 'compact' && list.indexOf(f) % 3) continue; // every third fixture also in compact (the browser test draws them all)
    let b;
    try { b = HK.drawBust('pc', f.look, 'rally', ph, v); } catch (e) { bad.push(f.id + ' ' + ph + ' ' + v + ': ' + e.message); continue; }
    drawn++;
    const r = b.face;
    if (r.x < 0 || r.y < 0 || r.x + r.w > B.w || r.y + r.h > B.h) bad.push(f.id + ' ' + ph + ': face outside the canvas');
    if (opaque(b.layer, r) < r.w * r.h * 0.7) bad.push(f.id + ' ' + ph + ' ' + v + ': face rectangle not mostly drawn');
    if (!b.hands.length) bad.push(f.id + ' ' + ph + ': no hand');
    if (b.acc.skipped.some((a) => !HK.ACC_NOT_SHOWN[a])) bad.push(f.id + ': an accessory neither drawn nor listed as not shown: ' + b.acc.skipped.join(','));
  }
  t.eq(bad, [], drawn + ' player busts drawn (every fixture, hold and the crossing arrival; compact for a third): faces inside and drawn, a hand, every accessory accounted for');

  // ---- compositions: faces untouched by the other bust ---------------------------------------------------
  const look = list.find((f) => f.id === 'acceptance_green_auburn').look;
  const N = (o) => HA._.norm(Object.assign({ look }, o));
  const occl = [];
  let comps = 0;
  for (const comp of HA.COMPANIONS) for (const phase of ['enter', 'hold']) for (const variant of ['standard', 'compact']) {
    const full = HA._.build(N({ comp, phase, variant }));
    const noPc = HA._.build(N({ comp, phase, variant, omit: 'pc' }));
    const noComp = HA._.build(N({ comp, phase, variant, omit: 'comp' }));
    comps++;
    for (const f of full.faces) {
      const other = f.who === 'pc' ? noComp : noPc;
      let diff = 0;
      for (let y = f.y; y < f.y + f.h; y++) for (let x = f.x; x < f.x + f.w; x++) {
        if (x < 0 || y < 0 || x >= full.layer.w || y >= full.layer.h) continue;
        const i = y * full.layer.w + x;
        if (full.layer.px[i] !== other.layer.px[i]) diff++;
      }
      if (diff) occl.push(comp + ' ' + phase + ' ' + variant + ': ' + diff + ' px of ' + f.who + "'s face changed by the other bust");
      if (f.x < 0 || f.y < 0 || f.x + f.w > full.layer.w || f.y + f.h > full.layer.h) occl.push(comp + ' ' + phase + ' ' + variant + ': ' + f.who + "'s face leaves the canvas");
    }
    t.eq(full.faces.map((f) => f.who), [comp, 'pc'], comp + ' ' + phase + ' ' + variant + ': two faces, companion first');
  }
  t.eq(occl, [], comps + ' compositions: neither face is covered by the other bust (pixel comparison inside the face rectangles)');

  // the companion is on the left, the player on the right; both faces wholly inside the canvas
  for (const v of ['standard', 'compact']) {
    const c = HA._.build(N({ comp: 'suzu', variant: v }));
    t.ok(c.faces[0].x + c.faces[0].w <= c.faces[1].x, v + ': companion left of the player, faces apart');
    t.ok(c.bounds.w > 0 && c.layer.w === HA.NATIVE[v].w && c.layer.h === HA.NATIVE[v].h, v + ': native size ' + HA.NATIVE[v].w + ' × ' + HA.NATIVE[v].h);
  }

  // ---- sides of worn things --------------------------------------------------------------------------------
  const sideOf = (who, pose, name) => {
    const b = HK.drawBust(who, look, pose, 'hold', 'standard');
    const ids = new Set(HK._matIds(name));
    let left = 0, right = 0;
    for (let i = 0; i < b.layer.px.length; i++) if (b.layer.px[i] && ids.has(b.layer.mt[i])) { if (i % b.layer.w < b.head.x) left++; else right++; }
    return { left, right };
  };
  const rib = sideOf('suzu', 'curtain', 'ribbon');
  t.ok(rib.right > rib.left * 3, "Suzu's ribbon sits toward her left (the far side, screen right) as in her portrait (" + JSON.stringify(rib) + ')');
  const pen = sideOf('nao', 'route', 'pencil');
  t.ok(pen.right > 0 && pen.left === 0, "Nao's pencil is tucked on their left (screen right) (" + JSON.stringify(pen) + ')');
  const suzu = HK.drawBust('suzu', null, 'curtain', 'hold', 'standard');
  t.ok(suzu.mole && suzu.mole.x > suzu.head.x, "Suzu's mole is on her left cheek (the far cheek), as in her portrait");
  const ren = HK.drawBust('ren', null, 'ward', 'hold', 'standard');
  t.ok(ren.hairBox && ren.hairBox.back.x0 < ren.head.x - 18, "Ren's ponytail hangs behind the head (screen left)");

  // ---- keys, phases, variants, reduced motion ------------------------------------------------------------
  const k0 = HA.keyOf({ comp: 'mio', look, phase: 'hold' });
  t.ok(k0.startsWith('v' + HA.ART_VERSION + '|'), 'keys carry ART_VERSION');
  t.ok(HA.keyOf({ comp: 'mio', look: Object.assign({}, look, { hairColor: 4 }), phase: 'hold' }) !== k0, 'a changed hair colour changes the key');
  t.ok(HA.keyOf({ comp: 'mio', look: RB.equip.lookWith(look, 'co_straw_hat'), phase: 'hold' }) !== k0, 'a worn keepsake (through RB.equip.lookWith) changes the key');
  t.ok(HA.keyOf({ comp: 'ren', look, phase: 'hold' }) !== k0, 'the companion is in the key');
  t.ok(HA.keyOf({ comp: 'mio', look, phase: 'enter' }) !== k0 && HA.keyOf({ comp: 'mio', look, variant: 'compact' }) !== k0, 'phase and variant are in the key');
  t.eq(HA.keyOf({ comp: 'mio', look, phase: 'enter', still: true }), k0, 'reduced motion (still) asks for the hold drawing');
  t.eq(HA.keyOf({ comp: 'mio', look: JSON.parse(JSON.stringify(look)), phase: 'hold' }), k0, 'an equal look gives the same key');
  const diffPx = (a, b) => { let n = 0; for (let i = 0; i < a.px.length; i++) if (a.px[i] !== b.px[i]) n++; return n; };
  for (const comp of HA.COMPANIONS) {
    const e = HA._.build(N({ comp, phase: 'enter' })), h = HA._.build(N({ comp, phase: 'hold' }));
    t.ok(diffPx(e.layer, h.layer) > 150, comp + ': the arriving and held drawings differ (' + diffPx(e.layer, h.layer) + ' px)');
  }

  // ---- determinism and discipline -----------------------------------------------------------------------------
  const a1 = HK.drawBust('pc', look, 'rally', 'hold', 'standard'), a2 = HK.drawBust('pc', look, 'rally', 'hold', 'standard');
  t.eq(diffPx(a1.layer, a2.layer), 0, 'a bust drawn twice is identical');
  const files = fs.readdirSync(path.join(root, 'src/ui')).filter((f) => f.startsWith('88_harmony'));
  t.ok(files.length >= 6, 'the harmony art files: ' + files.join(', '));
  const strip = (f) => fs.readFileSync(path.join(root, 'src/ui', f), 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
  const src = files.map(strip).join('\n');
  t.ok(!/Math\.random/.test(src), 'no Math.random in the harmony files');
  t.ok(!/Date\.now|new Date|performance\.now/.test(files.filter((f) => f !== '88_harmony_art.js').map(strip).join('\n')), 'no clock in the drawing code (only the API times its builds)');
  t.ok(!/fillText|strokeText|font\s*=/.test(src), 'no lettering is drawn into the art');
};
