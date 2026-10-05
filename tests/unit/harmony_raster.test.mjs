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
  t.eq(HA.PHASES, HC.STATES, 'painted: PHASES are the seven states (cue_b since Robin\'s decision of 2026-10-05)');
  t.eq(JSON.stringify(HA.NATIVE), JSON.stringify({ standard: { w: 352, h: 160 }, compact: { w: 248, h: 128 } }), 'painted: NATIVE is the contract pair (352 × 160, compact 248 × 128)');
  t.eq([HA.fitScale(1280, 720, 'standard'), HA.fitScale(1920, 1080, 'standard'), HA.fitScale(1600, 900, 'standard')], [1, 2, 1], 'standard scales: 1× at 1280 × 720 and 1600 × 900, 2× at 1920 × 1080');
  t.eq([HA.fitScale(390, 844, 'compact', 3), HA.fitScale(412, 915, 2.625 && 'compact', 2.625), HA.fitScale(320, 640, 'compact', 2)].map((v) => +v.toFixed(4)), [1.3333, 1.5238, 1], 'compact scales are DPR-aware (390 × 844 @3 → 4/3: faces 69 CSS px)');

  // ---- the timeline --------------------------------------------------------------------------------------------------------
  // (Robin's decision, 2026-10-05: a timeline per playback mode — Normal the proposed performance, Fast Normal's old
  // fractions with cue_b taking the second half of cue's span; the sample has no cue_b or settle_a)
  t.eq(HA.timeline('suzu'), [
    { phase: 'prep_a', seg: 'in', from: 0, to: 0.6 }, { phase: 'prep_b', seg: 'in', from: 0.6, to: 1 },
    { phase: 'cue', seg: 'hold', from: 0, to: 0.19 }, { phase: 'peak', seg: 'hold', from: 0.19, to: 0.77 },
    { phase: 'settle_b', seg: 'hold', from: 0.77, to: 1 }, { phase: 'settle_b', seg: 'out', from: 0, to: 1 },
  ], "Suzu's timeline at Normal (the default): cue holding through the missing cue_b, peak through the missing settle_a");
  t.eq(HA.timeline('suzu', 'fast'), [
    { phase: 'prep_a', seg: 'in', from: 0, to: 0.5 }, { phase: 'prep_b', seg: 'in', from: 0.5, to: 1 },
    { phase: 'cue', seg: 'hold', from: 0, to: 0.21 }, { phase: 'peak', seg: 'hold', from: 0.21, to: 0.79 },
    { phase: 'settle_b', seg: 'hold', from: 0.79, to: 1 }, { phase: 'settle_b', seg: 'out', from: 0, to: 1 },
  ], "Suzu's timeline at Fast: exactly the six-state set's old fractions");
  t.eq([HA.timeline('nao'), HA.timeline('nao', 'fast')], [HC.timeline(), HC.timeline(null, null, 'fast')], 'a companion with no painted set gets the default timeline of the mode (its code bust maps each state)');
  t.eq(HC.timeline(['prep_a', 'cue', 'peak', 'settle_b']).map((e) => [e.phase, e.seg, e.from, e.to]), [['prep_a', 'in', 0, 1], ['cue', 'hold', 0, 0.19], ['peak', 'hold', 0.19, 0.77], ['settle_b', 'hold', 0.77, 1], ['settle_b', 'out', 0, 1]], 'only the required states (Normal): prep_a fills the arrival, cue holds to the peak, peak to settle_b');
  t.eq(HC.timeline(['prep_a', 'cue', 'peak', 'settle_b'], null, 'fast').map((e) => [e.phase, e.seg, e.from, e.to]), [['prep_a', 'in', 0, 1], ['cue', 'hold', 0, 0.21], ['peak', 'hold', 0.21, 0.79], ['settle_b', 'hold', 0.79, 1], ['settle_b', 'out', 0, 1]], 'only the required states (Fast)');
  // the states' starts in WALL ms (the contract's SEGMENTS): Normal 220 / 820 / 360, Fast 180 / 380 / 220
  const startsOf = (mode) => { const D = HC.SEGMENTS[mode], o = { in: 0, hold: D.in, out: D.in + D.hold }; return HC.TIMELINES[mode].map((e) => [e.phase, Math.round(o[e.seg] + D[e.seg] * e.from)]); };
  t.eq(HC.TIMELINE, HC.TIMELINES.normal, 'TIMELINE is Normal\'s');
  t.eq(startsOf('normal'), [['prep_a', 0], ['prep_b', 132], ['cue', 220], ['cue_b', 310], ['peak', 376], ['settle_a', 761], ['settle_b', 851], ['settle_b', 1040]], 'at Normal the states start at 0, 132, 220, 310, 376, 761 and 851 ms (the fade from 1,040)');
  t.eq(startsOf('fast'), [['prep_a', 0], ['prep_b', 90], ['cue', 180], ['cue_b', 220], ['peak', 260], ['settle_a', 400], ['settle_b', 480], ['settle_b', 560]], 'at Fast (wall ms) the states start at 0, 90, 180, 220, 260, 400 and 480 — Normal\'s old performance, cue_b at 220');
  for (const mode of HC.MODES) for (const T of [HC.timeline(null, null, mode), HC.timeline(['prep_a', 'cue', 'peak', 'settle_b'], null, mode)]) t.eq(HC.validTimeline(T), [], 'the timelines are valid (' + mode + ')');
  t.eq(HC.timeline(HC.STATES, { peak: { seg: 'hold', from: 0.2, to: 0.6 } }).find((e) => e.phase === 'peak'), { phase: 'peak', seg: 'hold', from: 0.2, to: 0.6 }, 'a manifest override replaces a state\'s span');
  for (const bad of [{ cue: { seg: 'hold', from: 0.5, to: 0.1 } }, { peak: { seg: 'hold', from: 0.1, to: 0.5 } }, { peak: { seg: 'later', from: 0, to: 1 } }]) {
    const m = JSON.parse(JSON.stringify(manifest)); m.companions.suzu.timeline = bad;
    t.ok(HC.validateManifest(m).some((e) => /timeline/.test(e)), 'an invalid override is refused by the schema: ' + JSON.stringify(bad));
  }
  // overrides apply to each mode's base timeline, and must be valid at every mode
  {
    const ok = { peak: { seg: 'hold', from: 0.25, to: 0.6 } }, m = JSON.parse(JSON.stringify(manifest)); m.companions.suzu.timeline = ok;
    const st = manifest.companions.suzu.states;
    // (the sample has no settle_a, so the peak then holds on to settle_b's start: 0.77 at Normal, 0.79 at Fast)
    const pk = (mode) => HC.timeline(st, ok, mode).find((e) => e.phase === 'peak');
    t.ok(!HC.validateManifest(m).some((e) => /timeline/.test(e)) && JSON.stringify([pk('normal'), pk('fast')]) === JSON.stringify([{ phase: 'peak', seg: 'hold', from: 0.25, to: 0.77 }, { phase: 'peak', seg: 'hold', from: 0.25, to: 0.79 }]), 'an override valid at both modes is accepted and applied to each mode\'s base timeline (peak from 0.25 at Normal and at Fast)');
    const half = { peak: { seg: 'hold', from: 0.2, to: 0.6 } }, m2 = JSON.parse(JSON.stringify(manifest)); m2.companions.suzu.timeline = half;
    const errs = HC.validateManifest(m2).filter((e) => /timeline/.test(e));
    t.ok(HC.validTimeline(HC.timeline(st, half, 'normal')).length === 0 && errs.length && errs.every((e) => /\(fast\)/.test(e)), 'an override that overlaps only at Fast (cue there runs to 0.21) is refused, naming the mode: ' + errs.join('; '));
    // an override written for the old six-state fractions (cue to 0.21) on a set without cue_b: the missing cue_b never
    // shortens it back to 0.19, so at Normal it overlaps the peak (from 0.19) and is refused, not silently trimmed
    const old = { cue: { seg: 'hold', from: 0, to: 0.21 } };
    t.ok(HC.timeline(st, old, 'normal').find((e) => e.phase === 'cue').to === 0.21 && HC.validTimeline(HC.timeline(st, old, 'normal')).length > 0 && HC.validTimeline(HC.timeline(st, old, 'fast')).length === 0, 'a missing optional state only extends the one before it: an override is never trimmed to fit (and is checked at each mode)');
  }
  // cue_b: the companion's frame where delivered (else cue, as any missing optional state); the player's kit has no files
  // of its own for it and shows its cue drawing — head, arm, hair, and cue's group offsets unless cue_b has its own
  {
    const pl = HR.plan('pc', LA, 'cue_b', 'suzu'), pq = HR.plan('pc', LA, 'cue', 'suzu'), cs = HR.plan('suzu', null, 'cue_b', 'suzu');
    t.ok(pl.ok && pl.expr === 'cue' && pl.pose === 'cue' && JSON.stringify(pl.files) === JSON.stringify(pq.files) && JSON.stringify(pl.groups) === JSON.stringify(pq.groups), 'cue_b: the player\'s kit shows its cue drawing (' + pl.files.slice(0, 3).join(', ') + ' …)');
    t.ok(cs.ok && cs.state === 'cue' && cs.asked === 'cue_b', 'cue_b: a companion set without it shows cue through its span (the sample has none)');
    const man = HR.manifest(), g0 = man.pc.groups;
    man.pc.groups = Object.assign({}, g0, { cue: { head: [1, -1], torso: [0, 0] } });
    const g1 = HR.plan('pc', LA, 'cue_b', 'suzu').groups;
    man.pc.groups = Object.assign({}, g0, { cue: { head: [1, -1], torso: [0, 0] }, cue_b: { head: [0, -2], torso: [0, 0] } });
    const g2 = HR.plan('pc', LA, 'cue_b', 'suzu').groups;
    man.pc.groups = g0;
    t.eq([g1, g2], [{ head: [1, -1], torso: [0, 0] }, { head: [0, -2], torso: [0, 0] }], 'cue_b takes cue\'s group offsets unless it has its own');
    t.eq([HC.parse('suzu_cue_b'), HC.parse('suzu_cue_b_fx'), HC.parse('suzu_cue_fx')].map((q) => q && [q.kind, q.who, q.state, q.layer]), [['comp', 'suzu', 'cue_b', null], ['comp', 'suzu', 'cue_b', 'fx'], ['comp', 'suzu', 'cue', 'fx']], 'file names: <comp>_cue_b is the state cue_b (its effect <comp>_cue_b_fx), never cue with a layer');
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

  // ---- the visible footprint and the scale (contract v3 §3.3) -------------------------------------------------------------
  {
    const uniq = [...new Set(HA.timeline('suzu').map((e) => e.phase))];
    for (const look of [LA, LB]) for (const variant of ['standard', 'compact']) {
      const f = HA.footprint({ comp: 'suzu', look, variant });
      let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
      for (const st of uniq) { const b = HA._.buildPainted(N({ comp: 'suzu', look, phase: st, variant })).bounds; x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h); }
      t.eq([f.x, f.y, f.w, f.h, f.phases], [x0, y0, x1 - x0, y1 - y0, uniq.length], look.hair + ' ' + variant + ': the footprint is the union of the visible bounds of every state in the timeline (' + f.w + ' × ' + f.h + ' of ' + HA.NATIVE[variant].w + ' × ' + HA.NATIVE[variant].h + ')');
    }
    const fS = HA.footprint({ comp: 'suzu', look: LA, variant: 'standard' });
    const sc = (w, h, foot) => HA.fitScale(w, h, 'standard', 1, foot);
    t.eq([sc(2048, 1046, fS), sc(1920, 1080, fS), sc(1280, 720, fS)], [2, 2, 1], 'on the visible footprint: 2× at 2048 × 1046 and 1920 × 1080, 1× at 1280 × 720');
    t.eq([sc(2048, 1046), sc(1920, 1080)], [1, 2], 'on the full canvas (contract v2) 2048 × 1046 got only 1×');
    const views = [];
    for (const st of HC.STATES) views.push(HA.compose({ comp: 'suzu', look: LA, phase: st, view: { w: 2048, h: 1046 } }).scale);
    t.eq([...new Set(views)], [2], 'compose() gives every state of the performance the same scale (2× at 2048 × 1046): it never changes mid-performance');
    t.eq(HA.footprint({ comp: 'suzu', look: LA, variant: 'standard', still: true }), fS, 'reduced motion is fitted on the same footprint (its held poses are states of the timeline)');
  }
  // ---- approval (contract v3; never shown to players) --------------------------------------------------------------------------------
  t.eq(HA.approval().kit + ' ' + JSON.stringify(HA.approval().pairings), 'synthetic {"nao":"provisional","mio":"provisional","ren":"provisional","suzu":"synthetic"}', 'approval: the synthetic sample is "synthetic"; companions without a painted set are the provisional code busts');
  t.eq(HA.stats().approval.labels.candidate, 'visual candidate awaiting approval', 'stats() carries the approval and its labels');
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

  // ---- the rich fixture (contract v3: free values), recoloured ----------------------------------------------------------------------------
  {
    const { importSets } = await import('../../tools/harmony/importer.mjs');
    const tmpR = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-raster-rich-'));
    let rich;
    try { rich = importSets(['tests/fixtures/harmony_sample/incoming', 'tests/fixtures/harmony_rich/incoming'].map((d) => path.join(root, d)), { out: tmpR, replace: true }); } catch (e) { fs.rmSync(tmpR, { recursive: true, force: true }); throw e; }
    const rf = {};
    for (const f of fs.readdirSync(tmpR).filter((f) => f.endsWith('.png'))) rf[f] = fs.readFileSync(path.join(tmpR, f)).toString('base64');
    fs.rmSync(tmpR, { recursive: true, force: true });
    t.ok(rich.ok && HR.install({ manifest: rich.manifest, files: rf }, { decode }).ok, 'the rich fixture over the sample installs');
    const CC = HC.colour, dark = Object.assign({}, LA, { skin: 6, hairColor: 0, outfit: 5 }), pale = Object.assign({}, LA, { skin: 0, hairColor: 6, outfit: 6 });
    const nd = new Set();
    for (const look of [LA, dark, pale]) for (const st of HC.STATES) { const pl = HR.plan('pc', look, st, 'suzu'); if (pl.ok) pl.files.forEach((f) => nd.add(f)); }
    await HR.load([...nd]);
    // per material: the painted values (t from the input colour, in half-step buckets) and the outputs' lightness
    const order = [], kept = [];
    for (const look of [LA, dark, pale]) {
      const r = HR._.rampsOf(look), buckets = {};
      for (const [name, f] of HR._.decoded) {
        if (!f.code || HC.parse(name).kind === 'acc') continue;
        const tab = [r.rows.skin, r.rows.hair, r.rows.clothMain, r.rows.clothTrim, null];
        const out = new Uint32Array(f.w * f.h);
        HR._.draw(out, f, 0, 0, tab, null);
        for (let i = 0; i < out.length; i++) {
          const c = f.code[i]; if (c < 2) continue;
          const mi = ((c - 2) / 5) | 0, p = f.px[i], q = out[i];
          const tIn = CC.decompose(CC.oklab(p & 255, (p >>> 8) & 255, (p >>> 16) & 255), HC.MATERIALS[mi]).t;
          const L = CC.oklab(q & 255, (q >>> 8) & 255, (q >>> 16) & 255)[0];
          const k = HC.MATERIALS[mi] + ':' + Math.round(tIn * 2) / 2;
          (buckets[k] = buckets[k] || []).push(L);
        }
      }
      for (const m of ['skin', 'hair', 'clothMain', 'clothTrim']) {
        const ks = Object.keys(buckets).filter((k) => k.startsWith(m + ':')).map((k) => +k.split(':')[1]).sort((a, b) => a - b);
        const mean = (t) => { const a = buckets[m + ':' + t]; return a.reduce((x, y) => x + y, 0) / a.length; };
        for (let i = 1; i < ks.length; i++) { const d = mean(ks[i]) - mean(ks[i - 1]); if (!(d >= 0.02)) order.push(m + ' look skin ' + look.skin + ': ' + ks[i - 1] + '→' + ks[i] + ' ΔL ' + d.toFixed(4)); }
        kept.push(ks.length);
      }
    }
    t.eq(order, [], 'every painted value stays apart from the next (mean ΔL ≥ 0.02 per half step) on look A, the darkest (skin 6, black hair, cloth 5) and the palest (skin 0, white hair, cloth 6) targets');
    t.ok(Math.min(...kept) >= 8, 'and each family keeps its painted values (' + Math.min(...kept) + '–' + Math.max(...kept) + ' value levels per material)');
    // exact key shades still give exactly the v2 tones on ramps the value floor leaves alone (look A)
    const rA = HR._.rampsOf(LA);
    let ex = 0, exBad = 0;
    for (const [m, row] of [['skin', rA.rows.skin], ['hair', rA.rows.hair], ['clothMain', rA.rows.clothMain], ['clothTrim', rA.rows.clothTrim]]) HC.KEY_RAMPS[m].forEach((hx, s) => { const c = CC.hexRgb(hx), p = (0xff000000 | (c[2] << 16) | (c[1] << 8) | c[0]) >>> 0; const q = HR._.recolourPx(row, HC.MATERIALS.indexOf(m), p); if (!row.opened) { if (q === row.ramp[s]) ex++; else exBad++; } });
    const openA = Object.entries(rA.rows).filter(([k, row]) => k !== 'wrap' && row.opened).map(([k]) => k);
    t.ok(ex === 5 * (4 - openA.length) && ex >= 15 && exBad === 0, 'look A: every exact key shade gives exactly its v2 tone on each ramp the value floor leaves alone (' + ex + ' shades; opened here: ' + (openA.join(', ') || 'none') + ')');
    t.eq(openA, ['skin'], 'look A\'s only opened ramp is skin 1 (its v2 tones for s3 and s4 are 0.036 apart, under the floor of 0.05)');
    const r6 = HR._.rampsOf(dark).rows.skin;
    t.ok(r6.opened && r6.curve.filter((nd2) => nd2.key).every((nd2, i, a) => !i || nd2.L - a[i - 1].L >= HC.RECOLOUR.valueFloor - 1e-9), 'the darkest skin\'s ramp (whose v2 tones 1 and 2 are 0.002 apart in lightness) is opened to the value floor (' + HC.RECOLOUR.valueFloor + ' per shade step)');
    HR.install({ manifest, files }, { decode });
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

  // ---- a hat hides the hair above its own top edge, only in the columns it covers, and closes the edge it leaves ------------------
  // (the sample has no hat: the flower's drawing stands in for one, with a band line well below the hair's top, so the
  // former rule, every hair pixel above the band, would have cut the hair beside it flat)
  {
    const m = JSON.parse(JSON.stringify(manifest)), fh = Object.assign({}, files);
    m.files.acc_hat = Object.assign({}, m.files.acc_flower, { png: 'acc_hat.png', mask: 'acc_hat.mask.png' });
    fh['acc_hat.png'] = files['acc_flower.png']; fh['acc_hat.mask.png'] = files['acc_flower.mask.png'];
    m.pc.hatBand = { hat: 60 };
    t.eq(HR.install({ manifest: m, files: fh }, { decode }), { ok: true, errors: [] }, 'the sample with a stand-in hat installs');
    for (const hair of ['ponytail', 'curly']) {
      const L0 = Object.assign({}, LA, { hair, acc: [] }), L1 = Object.assign({}, L0, { acc: ['hat'] });
      const p0 = HR.plan('pc', L0, 'prep_a', 'suzu'), p1 = HR.plan('pc', L1, 'prep_a', 'suzu');
      await HR.load(p0.files.concat(p1.files));
      const b0 = HR.paint(p0, L0), b1 = HR.paint(p1, L1), W = b0.w, Hh = b0.h;
      const hat = HR._.decoded.get('acc_hat'), head = HR._.decoded.get(p1.parts.find((q) => q.slot === 'head').file);
      const hairs = p1.parts.filter((q) => /^hair_/.test(q.slot)).map((q) => HR._.decoded.get(q.file));
      const top = new Array(W).fill(-1);
      for (let x = 0; x < W; x++) for (let y = 0; y < Hh; y++) if (hat.px[y * W + x] >>> 24) { top[x] = y; break; }
      const o = HC.colour.hexRgb(HC.OUTLINE), ink = ((255 << 24) | (o[2] << 16) | (o[1] << 8) | o[0]) >>> 0;
      let beside = 0, closed = 0, besideAbove = 0, hidden = 0, shown = 0, notHead = 0;
      for (let x = 0; x < W; x++) for (let y = 0; y < Hh; y++) {
        const i = y * W + x;
        // (the one change allowed beside it: the hair pixel next to hair hidden over background closes with the outline ink)
        if (top[x] < 0) { if (b1.px[i] !== b0.px[i]) { if (b1.px[i] === ink && ((x > 0 && top[x - 1] >= 0 && y < top[x - 1] && !(b1.px[i - 1] >>> 24)) || (x < W - 1 && top[x + 1] >= 0 && y < top[x + 1] && !(b1.px[i + 1] >>> 24)))) closed++; else beside++; } if (y < 60 && hairs.some((f) => f.px[i] >>> 24)) besideAbove++; continue; }
        if (y >= top[x]) continue;
        if (hairs.some((f) => f.px[i] >>> 24)) hidden++;
        if (b1.px[i] >>> 24) { shown++; if (!(head.px[i] >>> 24)) notHead++; }
      }
      t.ok(besideAbove > 0 && beside === 0, hair + ': beside the hat the bust is the hatless one, hair above the band line included (' + besideAbove + ' hair px above it kept; ' + closed + ' edge px closed with the outline ink)');
      t.ok(hidden > 0 && notHead === 0, hair + ': above the hat\'s top edge in its columns no hair is drawn (' + hidden + ' hair px hidden; only the bald head shows there, ' + shown + ' px)');
    }
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
