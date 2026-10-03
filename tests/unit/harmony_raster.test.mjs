// The painted Harmony path in node (src/ui/88_harmony_raster.js behind RB.harmonyArt; docs/harmony/contract/CONTRACT.md),
// with the committed SYNTHETIC sample imported to a temporary folder and decoded by the importer's own PNG decoder:
// - nothing installed: PHASES ['enter', 'hold'], no timeline, the code-drawn sizes (and the same after uninstall);
// - timeline() fractions: defaults, a missing optional state held, manifest overrides, invalid ones refused;
// - both sample looks and Suzu compose painted at every state, both variants, faces inside and never covered;
// - recolouring never touches fixed pixels, outline ink or highlights; shades map to the look's own material ramps;
// - no key-ramp colour survives in any recoloured player bust, across skins, hair colours and cloth palettes;
// - a missing file makes the WHOLE bust fall back to code (recorded), never a mix; invalidation on a look change;
// - registry coverage: every registry entry maps to asset keys or is declared not visible; the manifest schema.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { load, root } from '../lib/load.mjs';
import { decodePNG } from '../../tools/harmony/png.mjs';
import { importSet } from '../../tools/harmony/importer.mjs';

export default async (t) => {
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas']);
  const HA = RB.harmonyArt, HR = RB.harmonyRaster, HC = RB.harmonyContract, HK = RB.harmonyKit, P = RB.pxkit;
  // (node has no canvas: compose() and prepare() get a stand-in that keeps nothing)
  RB.sprites.makeCanvas = (w, h) => ({ width: w, height: h, getContext: () => ({ createImageData: (a, b) => ({ data: new Uint8ClampedArray(a * b * 4) }), putImageData() {} }) });
  // ---- nothing installed --------------------------------------------------------------------------------------------
  const before = { phases: HA.PHASES, tl: typeof HA.timeline, native: JSON.stringify(HA.NATIVE), fit: HA.fitScale(1920, 1080, 'standard') };
  t.eq(before, { phases: ['enter', 'hold'], tl: 'undefined', native: JSON.stringify({ standard: { w: 228, h: 100 }, compact: { w: 160, h: 84 } }), fit: 3 }, 'no painted art: PHASES enter/hold, no timeline, the code-drawn sizes and scales');
  const LA = { skin: 1, hair: 'ponytail', hairColor: 3, outfit: 2, shape: 'coat', acc: ['glasses', 'flower'] };
  const LB = { skin: 5, hair: 'curly', hairColor: 8, outfit: 6, shape: 'robe', acc: ['scarf', 'satchel'] };
  const codeBefore = HA._.build(HA._.norm({ comp: 'suzu', look: LA, phase: 'hold' }));

  // ---- the sample, imported and installed -------------------------------------------------------------------------------
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-raster-'));
  let res;
  try { res = importSet(path.join(root, 'tests/fixtures/harmony_sample/incoming'), { out: tmp, replace: true }); } catch (e) { fs.rmSync(tmp, { recursive: true, force: true }); throw e; }
  const files = {};
  for (const f of fs.readdirSync(tmp).filter((f) => f.endsWith('.png'))) files[f] = fs.readFileSync(path.join(tmp, f)).toString('base64');
  fs.rmSync(tmp, { recursive: true, force: true });
  const manifest = res.manifest;
  const decode = async (b64) => { const d = decodePNG(Buffer.from(b64, 'base64')); return { w: d.w, h: d.h, data: d.data }; };
  t.eq(HR.install({ manifest, files }, { decode }), { ok: true, errors: [] }, 'the sample installs');
  t.eq(HA.PHASES, HC.STATES, 'painted: PHASES are the six states');
  t.eq(JSON.stringify(HA.NATIVE), JSON.stringify({ standard: { w: 352, h: 160 }, compact: { w: 248, h: 128 } }), 'painted: NATIVE is the contract pair (352 × 160, compact 248 × 128)');
  t.eq([HA.fitScale(1280, 720, 'standard'), HA.fitScale(1920, 1080, 'standard'), HA.fitScale(1600, 900, 'standard')], [1, 2, 1], 'standard scales: 1× at 1280 × 720 and 1600 × 900, 2× at 1920 × 1080');
  t.eq([HA.fitScale(390, 844, 'compact', 3), HA.fitScale(412, 915, 2.625 && 'compact', 2.625), HA.fitScale(320, 640, 'compact', 2)].map((v) => +v.toFixed(4)), [1.3333, 1.5238, 1], 'compact scales are DPR-aware (390 × 844 @3 → 4/3: faces 69 CSS px)');

  // ---- the timeline --------------------------------------------------------------------------------------------------------
  t.eq(HA.timeline('suzu'), [
    { phase: 'prep_a', seg: 'in', from: 0, to: 0.5 }, { phase: 'prep_b', seg: 'in', from: 0.5, to: 1 },
    { phase: 'cue', seg: 'hold', from: 0, to: 0.21 }, { phase: 'peak', seg: 'hold', from: 0.21, to: 0.79 },
    { phase: 'settle_b', seg: 'hold', from: 0.79, to: 1 }, { phase: 'settle_b', seg: 'out', from: 0, to: 1 },
  ], "Suzu's timeline: the default fractions, peak holding through the missing settle_a");
  t.eq(HA.timeline('nao'), HC.timeline(), 'a companion with no painted set gets the default timeline (its code bust maps each state)');
  t.eq(HC.timeline(['prep_a', 'cue', 'peak', 'settle_b']).map((e) => [e.phase, e.seg, e.from, e.to]), [['prep_a', 'in', 0, 1], ['cue', 'hold', 0, 0.21], ['peak', 'hold', 0.21, 0.79], ['settle_b', 'hold', 0.79, 1], ['settle_b', 'out', 0, 1]], 'only the required states: prep_a fills the arrival, peak holds to settle_b');
  const ms = (seg, f) => ({ in: 180, hold: 380, out: 220 }[seg] * f);
  t.eq(HC.TIMELINE.map((e) => [e.phase, Math.round((e.seg === 'in' ? 0 : e.seg === 'hold' ? 180 : 560) + ms(e.seg, e.from))]), [['prep_a', 0], ['prep_b', 90], ['cue', 180], ['peak', 260], ['settle_a', 400], ['settle_b', 480], ['settle_b', 560]], 'at Normal speed the states start at 0, 90, 180, 260, 400 and 480 ms');
  for (const T of [HC.timeline(), HC.timeline(['prep_a', 'cue', 'peak', 'settle_b'])]) t.eq(HC.validTimeline(T), [], 'the timelines are valid');
  t.eq(HC.timeline(HC.STATES, { peak: { seg: 'hold', from: 0.2, to: 0.6 } }).find((e) => e.phase === 'peak'), { phase: 'peak', seg: 'hold', from: 0.2, to: 0.6 }, 'a manifest override replaces a state\'s span');
  for (const bad of [{ cue: { seg: 'hold', from: 0.5, to: 0.1 } }, { peak: { seg: 'hold', from: 0.1, to: 0.5 } }, { peak: { seg: 'later', from: 0, to: 1 } }]) {
    const m = JSON.parse(JSON.stringify(manifest)); m.companions.suzu.timeline = bad;
    t.ok(HC.validateManifest(m).some((e) => /timeline/.test(e)), 'an invalid override is refused by the schema: ' + JSON.stringify(bad));
  }
  t.ok(HC.validTimeline([{ phase: 'peak', seg: 'hold', from: 0, to: 1 }]).some((e) => /settle_b/.test(e)), 'a timeline must end on settle_b (reduced motion shows it alone)');

  // ---- decode, then compose both looks with Suzu at every state ---------------------------------------------------------------
  const need = new Set();
  for (const look of [LA, LB]) for (const st of HC.STATES) for (const who of ['suzu', 'pc']) { const pl = HR.plan(who, look, st, 'suzu'); if (pl.ok) pl.files.forEach((f) => need.add(f)); }
  t.eq(await HR.load([...need]), need.size, 'every file the two looks and Suzu need decodes (' + need.size + ')');
  const N = (o) => HA._.norm(o);
  const bad = [], occl = [];
  let n = 0;
  for (const look of [LA, LB]) for (const st of HC.STATES) for (const variant of ['standard', 'compact']) {
    const o = { comp: 'suzu', look, phase: st, variant };
    const c = HA._.buildPainted(N(o));
    n++;
    const tag = look.hair + ' ' + st + ' ' + variant;
    if (c.src.suzu !== 'painted' || c.src.pc !== 'painted') bad.push(tag + ': ' + JSON.stringify(c.src));
    if (c.layer.w !== HA.NATIVE[variant].w || c.layer.h !== HA.NATIVE[variant].h) bad.push(tag + ': size');
    for (const f of c.faces) if (f.x < 0 || f.y < 0 || f.x + f.w > c.layer.w || f.y + f.h > c.layer.h) bad.push(tag + ': ' + f.who + ' face outside');
    for (const f of c.faces) {
      const other = HA._.buildPainted(N(Object.assign({}, o, { omit: f.who === 'pc' ? 'comp' : 'pc' })));
      let d = 0;
      for (let y = f.y; y < f.y + f.h; y++) for (let x = f.x; x < f.x + f.w; x++) { const i = y * c.layer.w + x; if (c.layer.px[i] !== other.layer.px[i]) d++; }
      if (d) occl.push(tag + ': ' + d + ' px of ' + f.who + "'s face changed by the other bust");
    }
  }
  t.eq(bad, [], n + ' painted compositions (2 looks × 6 states × 2 variants): both busts painted, contract size, faces inside');
  t.eq(occl, [], 'no face is covered by the other bust (each compared with the other omitted)');
  const keyA = HA.keyOf({ comp: 'suzu', look: LA, phase: 'peak' });
  t.ok(new RegExp('^v1\\|c' + HC.VERSION + '\\|a1\\|suzu\\|standard\\|peak\\|b\\|fx\\|-\\|PP\\|').test(keyA), 'keys carry ART_VERSION, the contract and art versions, companion, variant, state and painted/code flags: ' + keyA.slice(0, 40));
  t.ok(HA.keyOf({ comp: 'suzu', look: LB, phase: 'peak' }) !== keyA && HA.keyOf({ comp: 'suzu', look: LA, phase: 'cue' }) !== keyA && HA.keyOf({ comp: 'suzu', look: LA, phase: 'peak', variant: 'compact' }) !== keyA, 'look, state and variant change the key');
  t.eq(HA.keyOf({ comp: 'suzu', look: LA, phase: 'cue', still: true }), HA.keyOf({ comp: 'suzu', look: LA, phase: 'settle_b' }), 'reduced motion (still) asks for settle_b');
  t.eq(HA.keyOf({ comp: 'suzu', look: LA, phase: 'enter' }), HA.keyOf({ comp: 'suzu', look: LA, phase: 'prep_a' }), "a caller's 'enter' is prep_a, 'hold' settle_b");
  // the states differ in pixels (a performance, not one picture)
  const px = (st) => HA._.buildPainted(N({ comp: 'suzu', look: LA, phase: st })).layer.px;
  const diff = (a, b) => { let k = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) k++; return k; };
  t.ok(diff(px('prep_a'), px('peak')) > 200 && diff(px('cue'), px('peak')) > 20 && diff(px('peak'), px('settle_b')) > 20, 'prep_a, cue, peak and settle_b are different drawings');

  // ---- recolouring discipline ----------------------------------------------------------------------------------------------------
  const KEY = new Set();
  for (const m of HC.MATERIALS) for (const h of HC.KEY_RAMPS[m]) KEY.add(P.parse(h).slice(0, 3).join(','));
  const looks = [];
  for (let i = 0; i < 10; i++) looks.push({ skin: i % 7, hair: i % 2 ? 'curly' : 'ponytail', hairColor: i, outfit: i % 8, shape: i % 2 ? 'robe' : 'coat', acc: i % 2 ? ['scarf', 'satchel'] : ['glasses', 'flower'] });
  looks.push(Object.assign({}, LB, { skin: 0 }), Object.assign({}, LA, { skin: 6 }), RB.equip.lookWith(LB, 'lq_tenugui'), RB.equip.lookWith(LA, 'atlas_cos_flower'));
  for (const look of looks) for (const st of HC.STATES) { const pl = HR.plan('pc', look, st, 'suzu'); if (pl.ok) pl.files.forEach((f) => need.add(f)); }
  await HR.load([...need]);
  let survived = 0, checked = 0, touched = 0, shadeOk = 0, shadeBad = 0;
  const dec = HR._.decoded;
  for (const look of looks) {
    const r = HR._.rampsOf(look);
    // per file: fixed (code 1) pixels keep their colour, material pixels take the look's shade
    for (const [name, f] of dec) {
      if (!f.code) continue;
      const out = new Uint32Array(f.w * f.h);
      const accName = (HC.parse(name) || {}).acc;
      const tab = [r.skin, r.hair, r.clothMain, /^pc_hair_wrap_/.test(name) ? r.wrap : r.clothTrim, accName ? HR._.accRamp(r, look, accName) : null];
      HR._.draw(out, f, 0, 0, tab, null);
      for (let i = 0; i < out.length; i++) {
        if (!f.code[i]) continue;
        if (f.code[i] === 1) { if (out[i] !== f.px[i]) touched++; continue; }
        const c = f.code[i] - 2;
        if (out[i] === tab[Math.floor(c / 5)][c % 5]) shadeOk++; else shadeBad++;
      }
    }
    for (const st of HC.STATES) {
      const pl = HR.plan('pc', look, st, 'suzu');
      if (!pl.ok) continue;
      const b = HR.paint(pl, look, true);
      for (const p of b.px) { if (!(p >>> 24)) continue; checked++; if (KEY.has([p & 255, (p >> 8) & 255, (p >> 16) & 255].join(','))) survived++; }
    }
  }
  t.eq(touched, 0, 'recolouring never changes a fixed pixel (outline ink, highlights, eyes, metal, glass, leather) across ' + looks.length + ' looks');
  t.ok(shadeOk > 10000 && shadeBad === 0, 'every material pixel takes its shade of the look\'s ramp (' + shadeOk + ' checked)');
  t.eq(survived, 0, 'no key-ramp colour survives in any recoloured player bust (' + checked + ' pixels: ' + looks.length + ' looks × 6 states)');
  // protected pixels: an outline pixel marked as skin in a mask stays as painted
  {
    const art = { w: 2, h: 1, data: new Uint8Array([0x14, 0x0c, 0x18, 255, 255, 255, 255, 255]) }, mk = { w: 2, h: 1, data: new Uint8Array([255, 0, 0, 255, 255, 0, 0, 255]) };
    t.eq([...HR._.codesOf(art, mk)], [1, 1], 'outline ink and white under a skin mask are read as fixed by the game too');
  }
  // the painted and code busts share colour logic: the targets are the code materials' own steps
  {
    const col = RB.sprites.colorsOf(LB), r = HR._.rampsOf(LB);
    t.eq([r.skin[3], r.hair[2], r.clothMain[2], r.clothTrim[0]], [HK.skinMat(col.skin).c[4], HK.hairMat(col.hair).c[3], HK.clothMat(col.cloth[0]).c[3], HK.clothMat(col.cloth[2], { step: 0.09 }).c[1]], 'target ramps are the code busts\' skinMat / hairMat / clothMat steps');
    const sc = HR._.accRamp(r, RB.equip.lookWith(LB, 'lq_tenugui'), 'scarf');
    t.ok(sc && sc.length === 5 && sc[2] !== HR._.accRamp(HR._.rampsOf(LA), LA, 'flower')[2], "an accessory takes its own look field (the tenugui's scarfCol)");
  }

  // ---- whole-bust fallback ---------------------------------------------------------------------------------------------------------------
  {
    const m2 = JSON.parse(JSON.stringify(manifest)); delete m2.files.pc_torso_robe;
    const f2 = Object.assign({}, files); delete f2['pc_torso_robe.png']; delete f2['pc_torso_robe.mask.png'];
    t.eq(HR.install({ manifest: m2, files: f2 }, { decode }).ok, true, 'a set without pc_torso_robe installs (sets are partial)');
    for (const look of [LA, LB]) for (const st of HC.STATES) { const pl = HR.plan('pc', look, st, 'suzu'); if (pl.ok) await HR.load(pl.files); }
    await HR.load(HR.plan('suzu', null, 'peak', 'suzu').files);
    const fb0 = HR.stats().fallbacks;
    const cB = HA._.buildPainted(N({ comp: 'suzu', look: LB, phase: 'peak' })), cA = HA._.buildPainted(N({ comp: 'suzu', look: LA, phase: 'peak' }));
    t.ok(/^code \(missing pc_torso_robe/.test(cB.src.pc) && cB.src.suzu === 'painted', 'robe missing: the robe look\'s whole player bust is code (' + cB.src.pc + '), Suzu stays painted');
    t.eq(cA.src.pc, 'painted', 'the coat look is still painted');
    t.eq([cB.faces[1].w, cB.faces[1].h], [36, 33], 'the fallback is the whole code bust (its own face size), never painted parts with a code torso');
    t.ok(HR.stats().fallbacks > fb0 && HR.stats().fallbackLog.some((f) => f.missing.indexOf('pc_torso_robe') >= 0), 'the fallback is recorded in stats().raster with the missing file');
    const m3 = JSON.parse(JSON.stringify(manifest)); delete m3.files.suzu_cue; m3.companions.suzu.states = m3.companions.suzu.states.filter((s) => s !== 'cue');
    HR.install({ manifest: m3, files }, { decode });
    await HR.load(HR.plan('pc', LA, 'peak', 'suzu').files);
    const cC = HA._.buildPainted(N({ comp: 'suzu', look: LA, phase: 'peak' }));
    t.ok(/^code/.test(cC.src.suzu), 'a companion missing a required state is drawn in code at every state (' + cC.src.suzu + ')');
    t.eq(HA.timeline('suzu'), HC.timeline(), 'and its timeline is the default one');
    t.ok(HR.install({ manifest: Object.assign({}, manifest, { contractVersion: 1 }), files }).ok === false && !HR.active() && HA.PHASES.length === 2, 'a manifest of another contract version is not installed (and the code path is back)');
  }

  // ---- invalidation on a look change ----------------------------------------------------------------------------------------------------
  {
    HR.install({ manifest, files }, { decode });
    await HR.load([...need]);
    HA.clear();
    HA.prepare({ comp: 'suzu', look: LA, phase: 'peak' });
    HA.prepare({ comp: 'suzu', look: LB, phase: 'peak' });
    const ks = () => HA.stats().keys;
    const lk = (l) => HK.lookKey(l);
    t.ok(ks().busts.some((k) => k.endsWith(lk(LA))) && ks().busts.some((k) => k.endsWith(lk(LB))), 'both looks\' painted player busts are cached');
    HA.invalidate(LB);
    t.ok(!ks().busts.some((k) => k.split('|')[1] === 'pc' && k.endsWith(lk(LA))) && !ks().compositions.some((k) => k.endsWith(lk(LA))), "invalidate(look) drops the other look's painted busts and compositions");
    t.ok(ks().busts.some((k) => k.split('|')[1] === 'suzu'), "the companion's painted bust is kept (shared by every look)");
    t.ok(ks().busts.some((k) => k.endsWith(lk(LB))), 'the worn look stays');
  }

  // ---- the registry: every entry maps to asset keys or is declared not visible ------------------------------------------------------------
  {
    const reg = JSON.parse(fs.readFileSync(path.join(root, 'docs/harmony/contract/registry.json'), 'utf8'));
    const req = new Set(reg.assetKeys.required), opt = new Set(reg.assetKeys.optional);
    const miss = [];
    const entries = Object.values(reg.keepsakes).concat(Object.values(reg.creationAccessories.entries));
    for (const e of entries) {
      if (e.visibleInBust) { if (!e.files || !e.files.length) miss.push((e.id || e.acc) + ': visible but no files'); for (const f of e.files || []) if (!req.has(f.file)) miss.push(f.file + ' not an asset key'); }
      else if (!e.reason) miss.push((e.id || e.acc) + ': not visible without a reason');
    }
    for (const s of reg.hairstyles.ids) { if (!req.has('pc_hair_' + s + '_front')) miss.push(s + ' front'); if (reg.hairstyles.frontOnly.indexOf(s) < 0 && !req.has('pc_hair_' + s + '_back')) miss.push(s + ' back'); }
    for (const s of reg.garmentShapes.all) { if (!req.has('pc_torso_' + s)) miss.push('torso ' + s); for (const pose of ['prep_a', 'cue'].concat(...Object.keys(reg.companions).map((c) => ['peak_' + c, 'settle_' + c]))) if (!req.has('pc_arm_' + pose + '_' + reg.garmentShapes.sleeveOf[s])) miss.push('arm ' + pose + ' ' + s); if (!opt.has('pc_arm_prep_b_' + reg.garmentShapes.sleeveOf[s])) miss.push('prep_b ' + s); }
    for (const c of Object.keys(reg.companions)) for (const st of HC.REQUIRED) if (!req.has(c + '_' + st)) miss.push(c + '_' + st);
    for (const e of HC.EXPRS) if (!req.has('pc_head_' + e)) miss.push('head ' + e);
    t.eq(miss, [], 'every registry entry (' + entries.length + ' accessories and keepsakes, ' + reg.hairstyles.ids.length + ' hairstyles, ' + reg.garmentShapes.all.length + ' cuts, ' + Object.keys(reg.companions).length + ' companions) maps to asset keys or is declared not visible');
    const accs = new Set(RB.sprites.ACCESSORIES.concat(Object.values(RB.content.items).filter((it) => it && it.slot === 'cosmetic' && it.acc).map((it) => it.acc)));
    t.eq([...accs].filter((a) => !HC.ACC[a] && !HC.NOT_SHOWN[a]), [], 'every accessory a player can wear is in the contract (files) or listed as not shown');
    const visible = Object.keys(HC.ACC).filter((a) => accs.has(a));
    const again = HC.assetKeys({ companions: HA.COMPANIONS, hairstyles: RB.sprites.HAIRSTYLES, shapes: RB.harmonyArtFixtures.SHAPES, accessories: visible });
    t.eq([again.required.length, again.optional.length], [reg.assetKeys.required.length, reg.assetKeys.optional.length], 'registry.json\'s asset keys match the contract and the game now (' + again.required.length + ' required, ' + again.optional.length + ' optional)');
    t.eq(reg.contractVersion, HC.VERSION, 'registry.json is for contract v' + HC.VERSION);
  }

  // ---- the manifest schema ---------------------------------------------------------------------------------------------------------------------
  {
    t.eq(HC.validateManifest(manifest, Object.keys(files)), [], 'the sample manifest passes the schema');
    const mut = (fn) => { const m = JSON.parse(JSON.stringify(manifest)); fn(m); return HC.validateManifest(m, Object.keys(files)); };
    const cases = [
      ['wrong schema', (m) => { m.schema = 'x'; }], ['contract v1', (m) => { m.contractVersion = 1; }], ['a 191-wide file', (m) => { m.files.suzu_peak.w = 191; }],
      ['a kit file without a mask', (m) => { m.files.pc_head_cue.mask = null; }], ['a companion with a mask', (m) => { m.files.suzu_peak.mask = 'suzu_peak.mask.png'; }],
      ['an unknown name', (m) => { m.files.suzu_wave = Object.assign({}, m.files.suzu_peak, { png: 'suzu_wave.png' }); }], ['a group offset on a non-group', (m) => { m.pc.groups.peak = { arm: [0, 1] }; }],
      ['a non-integer attach offset', (m) => { m.pc.attach.curly.flower = [0.5, 1]; }], ['an attach offset on a chest accessory', (m) => { m.pc.attach.curly.satchel = [0, 1]; }],
      ['an unknown arm slot', (m) => { m.pc.armSlot.cue = 'over_everything'; }], ['a missing PNG', (m) => { m.files.acc_hat = Object.assign({}, m.files.acc_flower, { png: 'acc_hat.png', mask: 'acc_hat.mask.png' }); }],
      ['a bad face box', (m) => { m.companions.suzu.face.peak = [10, 10, 5, 5]; }], ['an unknown companion mode', (m) => { m.companions.suzu.mode = 'video'; }],
    ];
    for (const [name, fn] of cases) t.ok(mut(fn).length > 0, 'the schema refuses ' + name);
  }

  // ---- uninstalled: exactly the code path again ---------------------------------------------------------------------------------------------------
  HR.uninstall();
  HA.clear();
  const after = { phases: HA.PHASES, tl: typeof HA.timeline, native: JSON.stringify(HA.NATIVE), fit: HA.fitScale(1920, 1080, 'standard') };
  t.eq(after, before, 'after uninstall: PHASES, timeline, NATIVE and fitScale are as before');
  const codeAfter = HA._.build(HA._.norm({ comp: 'suzu', look: LA, phase: 'hold' }));
  t.ok(codeAfter.layer.px.every((v, i) => v === codeBefore.layer.px[i]) && JSON.stringify(codeAfter.faces) === JSON.stringify(codeBefore.faces), 'and a code-drawn composition is pixel-identical to the one built before anything was installed');
};
