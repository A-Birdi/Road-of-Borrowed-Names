/* Harmony painted-art contract, version 2 — the machine side (docs/harmony/contract/CONTRACT.md).
 *
 * One source of truth for the painted busts: canvas geometry and anchors, the performance states and
 * their timeline, file naming, the player kit's layer slots and their order, the accessories' files and
 * colour channels, the mask colours, the key ramps the player kit is painted in, and the importer's
 * thresholds. Pure data and pure functions: the game's raster path (88_harmony_raster.js), the registry
 * export (tools/harmony_registry.mjs) and the importer (tools/harmony_import.mjs, which loads this file
 * into a node vm) all read it, so they cannot drift apart.
 *
 * Coordinates are art px on a bust canvas (192 × 160), origin top left, x right, y down. Boxes are
 * half-open [x0, y0, x1, y1). The companion is turned three-quarter toward screen RIGHT, the player
 * three-quarter toward screen LEFT (toward the companion): the player's near side is the character's left
 * (screen right). Nothing here draws or decodes anything. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.harmonyContract = (function () {
  'use strict';
  const VERSION = 2;
  const BUST = { w: 192, h: 160 };

  // ---- anchors (per bust canvas) --------------------------------------------------------------------
  // neck: the pit of the neck (the registration point); head: crown to chin (hair may spill past it);
  // face: brow to chin; hands: where the signature hand may be; crop: the ink band's lower edge across
  // this canvas in the pair (paint past it to the bottom edge; the game crops along it).
  const ANCHORS = {
    comp: { neck: [94, 118], head: [62, 18, 130, 104], face: [74, 52, 124, 104], hands: [[8, 36, 76, 150], [76, 30, 190, 150]], crop: [[0, 156], [192, 150]] },
    pc: { neck: [98, 118], head: [62, 18, 130, 104], face: [68, 52, 118, 104], hands: [[124, 30, 188, 150]], crop: [[0, 151], [192, 145]] },
  };
  // Phones show the compact pair; the face and the signature hand must be above y 128 (inside this box).
  const COMPACT_SAFE = [8, 0, 184, 128];

  // ---- the pair (built by the game) -------------------------------------------------------------------
  // Each variant: canvas size, where each bust canvas's origin sits (companion behind, player in front),
  // and the ink band (top edge: a brush edge starting at top0 and rising by `rise` per px; lower edge: the
  // straight line `bottom`, which crops both busts; the right end breaks into brush tails at `end`).
  // The compact pair brings the player closer and crops the outer hands: it is a crop for narrow screens.
  const PAIR = {
    standard: { w: 352, h: 160, comp: [0, 0], pc: [160, 0], band: { top0: 42, rise: 0.05, bottom: [[0, 156], [352, 145]], end: 344 } },
    compact: { w: 248, h: 128, comp: [-38, 0], pc: [98, 0], band: { top0: 34, rise: 0.035, bottom: [[0, 126], [248, 120]], end: 244 } },
  };
  // Display: the standard pair at an integer scale inside the addendum's §5.2 limits (42 % of the view's
  // width, 30 % of its height, 12 % of its area); the compact pair at a DPR-aware scale (CSS px per art px
  // whose product with devicePixelRatio is a whole number) up to the view's width and 27 % of its height.
  const DISPLAY = { standard: { maxW: 0.42, maxH: 0.3, maxArea: 0.12, integer: true }, compact: { maxW: 1, maxH: 0.27, dprAware: true }, maxScale: 6, minFaceCss: 64 };

  // ---- states and timing ---------------------------------------------------------------------------------
  const STATES = ['prep_a', 'prep_b', 'cue', 'peak', 'settle_a', 'settle_b'];
  const REQUIRED = ['prep_a', 'cue', 'peak', 'settle_b'];
  const OPTIONAL = ['prep_b', 'settle_a'];
  const REDUCED = 'settle_b';
  // fractions of the cut-in overlay's segments (Normal 180 / 380 / 220 ms, Fast 100 / 220 / 160 ms)
  const TIMELINE = [
    { phase: 'prep_a', seg: 'in', from: 0, to: 0.5 },
    { phase: 'prep_b', seg: 'in', from: 0.5, to: 1 },
    { phase: 'cue', seg: 'hold', from: 0, to: 0.21 },
    { phase: 'peak', seg: 'hold', from: 0.21, to: 0.58 },
    { phase: 'settle_a', seg: 'hold', from: 0.58, to: 0.79 },
    { phase: 'settle_b', seg: 'hold', from: 0.79, to: 1 },
    { phase: 'settle_b', seg: 'out', from: 0, to: 1 },
  ];
  const SEGMENTS = { normal: { in: 180, hold: 380, out: 220 }, fast: { in: 100, hold: 220, out: 160 } };
  const SEG_ORDER = { in: 0, hold: 1, out: 2 };
  // the drawing a code-drawn bust shows for a state (the fallback when a bust has no complete painted set)
  const CODE_PHASE = { prep_a: 'enter', prep_b: 'enter', cue: 'hold', peak: 'hold', settle_a: 'hold', settle_b: 'hold' };

  // The timeline for the states a set has. `have`: the states delivered (an optional state that is missing
  // holds the state before it: that state's span is extended over the missing one's); `over`: per-state
  // { seg, from, to } replacements from the manifest (checked by validTimeline before use).
  function timeline(have, over) {
    const set = have ? new Set(have) : new Set(STATES);
    const base = TIMELINE.map((e) => Object.assign({}, e, over && over[e.phase] && e.seg === over[e.phase].seg ? { from: over[e.phase].from, to: over[e.phase].to } : null));
    // an override of a state's hold also moves the neighbouring spans that touch it
    const out = [];
    for (const e of base) {
      if (set.has(e.phase)) { out.push(e); continue; }
      const prev = out[out.length - 1];
      if (prev && prev.seg === e.seg) prev.to = e.to;
    }
    return out.map((e) => ({ phase: e.phase, seg: e.seg, from: round(e.from), to: round(e.to) }));
  }
  const round = (v) => Math.round(v * 1e4) / 1e4;
  // A timeline is valid when every entry is a known state and segment, 0 ≤ from < to ≤ 1, the entries are
  // in state order along in → hold → out, and nothing overlaps.
  function validTimeline(T) {
    const errs = [];
    if (!Array.isArray(T) || !T.length) return ['empty timeline'];
    let last = -1, lastState = -1;
    for (const e of T) {
      if (STATES.indexOf(e.phase) < 0) errs.push('unknown state ' + e.phase);
      if (SEG_ORDER[e.seg] == null) errs.push('unknown segment ' + e.seg);
      if (!(e.from >= 0 && e.to <= 1 && e.from < e.to)) errs.push(e.phase + ': bad span ' + e.from + '–' + e.to);
      const at = SEG_ORDER[e.seg] + e.from;
      if (at < last - 1e-9) errs.push(e.phase + ' starts before the entry before it ends');
      last = SEG_ORDER[e.seg] + e.to;
      const si = STATES.indexOf(e.phase);
      if (si < lastState) errs.push(e.phase + ' is out of state order');
      lastState = si;
    }
    if (T[T.length - 1].phase !== REDUCED) errs.push('the last state must be ' + REDUCED + ' (reduced motion shows it alone)');
    return errs;
  }
  // The state shown in place of `st` when the set lacks it (optional states hold the previous one).
  function stateFor(st, have) {
    const set = new Set(have);
    let i = STATES.indexOf(st);
    while (i >= 0 && !set.has(STATES[i])) i--;
    return i >= 0 ? STATES[i] : null;
  }

  // ---- the player kit ----------------------------------------------------------------------------------------
  const EXPRS = ['focus', 'cue', 'peak', 'settle'];
  const EXPR_OF = { prep_a: 'focus', prep_b: 'focus', cue: 'cue', peak: 'peak', settle_a: 'settle', settle_b: 'settle' };
  const ARM_SHARED = ['prep_a', 'prep_b', 'cue'];
  const ARM_REQUIRED_SHARED = ['prep_a', 'cue'];
  const armPoses = (comps) => ARM_SHARED.concat(...comps.map((c) => ['peak_' + c, 'settle_' + c]));
  // the brush arm's pose for a state of the pairing with `comp` (prep_b falls back to prep_a when absent)
  function armOf(st, comp) {
    if (st === 'prep_a' || st === 'prep_b' || st === 'cue') return st;
    if (st === 'peak') return 'peak_' + comp;
    return 'settle_' + comp;
  }
  // Sleeves: the robe's is wide (the road sprites draw a flared mouth for it alone: src/engine/32_spriteart.js
  // armsFB); the dress has puffed sleeve heads (part of its torso) over a fitted forearm.
  const SLEEVES = ['fitted', 'wide'];
  const SLEEVE_OF = { tunic: 'fitted', robe: 'wide', coat: 'fitted', apron: 'fitted', dress: 'fitted' };
  const sleeveOf = (shape) => SLEEVE_OF[shape] || 'fitted';
  // hair parts; the optional swing drawings for the two in-between states
  const HAIR_PARTS = ['back', 'front'];
  const FRONT_ONLY = ['shaved'];
  const SWING_STATES = ['prep_b', 'settle_a'];
  // Layer slots, back to front. Groups: what a state's whole-pixel group offset moves.
  const PC_SLOTS = ['acc_back', 'hair_back', 'acc_ear_far', 'torso', 'acc_chest', 'acc_neck', 'head', 'glasses', 'hair_front', 'acc_head', 'acc_ear_near', 'arm'];
  const GROUP_OF = { acc_back: 'torso', hair_back: 'head', acc_ear_far: 'head', torso: 'torso', acc_chest: 'torso', acc_neck: 'torso', head: 'head', glasses: 'head', hair_front: 'head', acc_head: 'head', acc_ear_near: 'head', arm: 'torso' };
  // where the brush arm may go in the stack for a pose (manifest pc.armSlot[pose]); default in front of all
  const ARM_SLOT = { front: null, under_acc_head: 'acc_head', under_hair_front: 'hair_front', under_head: 'head', under_torso: 'torso' };

  // ---- accessories ----------------------------------------------------------------------------------------------
  // Every accessory a player can wear (the creation choices and every cosmetic keepsake's acc): its files
  // (with the slot each goes in), whether it is mounted on the hair (a per-hairstyle offset), whether it hides
  // the hair above its band, and the colour channel that feeds its accessory-ramp pixels (look field, the
  // default when the field is absent, and the material options the code busts use for it).
  // `variant`: a look field that selects other files (the knitted keepsake scarf).
  const A6 = (step, o) => Object.assign({ n: 6, at: 3, step, cool: 250, warm: 52, lineCol: '#140c18' }, o || {});
  const A5 = (step, o) => Object.assign({ n: 5, at: 3, step, cool: 250, warm: 52, lineCol: '#140c18' }, o || {});
  const ACC = {
    cape: { files: [['acc_cape_back', 'acc_back'], ['acc_cape_front', 'acc_chest']], channel: { field: 'capeCol', def: '#6a3a4a', opts: A6(0.075) } },
    satchel: { files: [['acc_satchel', 'acc_chest']], channel: null },
    atlas_sash: { files: [['acc_atlas_sash', 'acc_chest']], channel: { field: 'sashCol', def: '#d8c89a', opts: A5(0.07, { cool: 230 }) } },
    bell: { files: [['acc_bell', 'acc_chest']], channel: { field: 'cordCol', def: '#b8342a', opts: A5(0.08) } },
    atlas_pin: { files: [['acc_atlas_pin', 'acc_chest']], channel: null },
    scarf: { files: [['acc_scarf', 'acc_neck']], variant: { field: 'scarfStripe', files: [['acc_scarf_knit', 'acc_neck']] }, channel: { field: 'scarfCol', def: '#c8962e', opts: A6(0.075) } },
    glasses: { files: [['acc_glasses', 'glasses']], channel: null },
    hat: { files: [['acc_hat', 'acc_head']], hair: true, hides: true, channel: { field: 'hatCol', def: '#8a6a44', opts: A6(0.075) } },
    cap: { files: [['acc_cap', 'acc_head']], hair: true, hides: true, channel: { field: 'capCol', def: '#2c4468', opts: A6(0.075) } },
    headband: { files: [['acc_headband', 'acc_head']], hair: true, channel: { field: 'bandCol', def: 'cloth.2', opts: A6(0.08) } },
    ribbon: { files: [['acc_ribbon', 'acc_head']], hair: true, channel: { field: 'ribbonCol', def: '#c8687a', opts: A6(0.075) } },
    flower: { files: [['acc_flower', 'acc_head']], hair: true, channel: { field: 'flowerCol', def: '#f4a6a0', opts: A6(0.07) } },
    leaf: { files: [['acc_leaf', 'acc_head']], hair: true, channel: { field: 'leafCol', def: '#c8452a', opts: A6(0.075) } },
    atlas_quill: { files: [['acc_atlas_quill', 'acc_head']], hair: true, channel: null },
    earrings: { files: [['acc_earrings_far', 'acc_ear_far'], ['acc_earrings_near', 'acc_ear_near']], channel: { field: 'earCol', def: 'metal', opts: A5(0.1) } },
  };
  // order inside a slot (back to front), as the code busts draw them
  const SLOT_ORDER = { acc_chest: ['satchel', 'atlas_sash', 'bell', 'atlas_pin', 'cape'], acc_head: ['hat', 'cap', 'headband', 'ribbon', 'flower', 'leaf', 'atlas_quill'] };
  // Worn things that are deliberately not painted in a bust (with the reason; the registry lists them).
  const NOT_SHOWN = {
    atlas_lamplet: 'hangs at the hip, below the ink band crop',
    bottles: 'companion-only (Mio); carried at the hip, below the crop — her vial is part of her painted frames',
    lamp: 'companion-only (Ren); held in his painted frames',
    patches: 'companion-only (Ren); part of his painted coat',
    pencil: 'companion-only (Nao); part of his painted frames',
    beard: 'not a player option', cane: 'not carried by any party member', basket: 'not carried', book: 'not carried', hood: 'not a player option', toolbelt: 'not carried', apronstrap: 'part of the apron',
  };
  // The accessory files a look needs: [{ acc, file, slot }] in no particular order; unknown → { missing }.
  function accFiles(look) {
    const out = [], unknown = [];
    for (const a of (look && look.acc) || []) {
      const d = ACC[a];
      if (!d) { if (!NOT_SHOWN[a]) unknown.push(a); continue; }
      const files = d.variant && look[d.variant.field] ? d.variant.files : d.files;
      for (const [file, slot] of files) out.push({ acc: a, file, slot });
    }
    return { files: out, unknown };
  }

  // ---- materials, masks, key ramps --------------------------------------------------------------------------------
  const MATERIALS = ['skin', 'hair', 'clothMain', 'clothTrim', 'accessory'];
  const MASK = { skin: '#ff0000', hair: '#00ff00', clothMain: '#0000ff', clothTrim: '#ffff00', accessory: '#ff00ff', fixed: '#000000' };
  // Paint the player kit's recolourable parts in these, darkest → lightest (docs/harmony/asset_brief/ref_palettes.png).
  // Skin is a deliberately unnatural orange key (contract v2): brief v1's natural skin key was skin palette 2's own
  // ramp (a recoloured skin-2 player would contain key colours) and lay within 40 of 28 of the code's face colours
  // (the default iris 15.6 away, a mouth 11.1, a blush 10.3). KEY_SKIN_V1 keeps it for the record.
  const KEY_SKIN_V1 = ['#6e3e2a', '#9a5e40', '#c28e64', '#dcae84', '#f2d0a8'];
  const KEY_RAMPS = {
    skin: ['#601c00', '#943c08', '#d06018', '#f48c40', '#ffc0a0'],
    hair: ['#2a0a3a', '#5a1470', '#8a24a0', '#b848c8', '#e088ec'],
    clothMain: ['#0c3a14', '#1a6428', '#2e8c3c', '#52b45a', '#8ad88a'],
    clothTrim: ['#0a3a44', '#12687a', '#22a0b4', '#5ccce0', '#a8f0f8'],
    accessory: ['#10164a', '#222e8a', '#3a4cc8', '#6a80ec', '#a8b8ff'],
  };
  const OUTLINE = '#140c18';
  // Which steps of the code busts' material ramps the five shades map to: skin (6 tones, the base light at 4:
  // deep crease, crease, shadow, light, highlight — the mid between shadow and light is not used); the other
  // 6-tone materials (base at 3); 5-tone materials (all five).
  const PICK = { skin: [0, 1, 2, 4, 5], n6: [1, 2, 3, 4, 5], n5: [0, 1, 2, 3, 4], n4: [0, 1, 1, 2, 3] };
  // What each kind of file may contain besides fixed pixels (the importer only snaps to these ramps).
  const ALLOWED = {
    comp: [], head: ['skin', 'hair'], torso: ['clothMain', 'clothTrim', 'skin'], arm: ['skin', 'clothMain', 'clothTrim'],
    hair: ['hair'], hair_wrap: ['hair', 'clothTrim'], acc: ['accessory'],
  };
  // Importer thresholds (Euclidean distance in sRGB 0–255): a pixel within `snap` of a key shade of an allowed
  // material takes that shade; farther than `ambiguous` from every allowed key shade it is fixed (keeps its
  // colour); in between it is unresolved and the import fails. Outline ink (within `outline` of #140c18) and
  // near-white highlights (within `white` of #ffffff or the eye white #f6f2ee) are always fixed. Alpha below
  // `alpha` is transparent, at or above it opaque.
  const IMPORT = { snap: 12, ambiguous: 40, outline: 24, white: 24, alpha: 128, protect: ['#140c18', '#ffffff', '#f6f2ee'], maxOffset: 24 };

  // ---- file names ------------------------------------------------------------------------------------------------------
  // <comp>_<state>[_<layer>], pc_head_<expr>, pc_torso_<shape>, pc_arm_<pose>_<sleeve>, pc_hair_<style>_<part>[_swing],
  // acc_<id>[_<part>|_<variant>]; a mask is <name>.mask.png.
  function parse(name, reg) {
    name = String(name).replace(/\.png$/i, '');
    const isMask = /\.mask$/.test(name);
    if (isMask) name = name.slice(0, -5);
    const comps = (reg && reg.companions) || ['nao', 'mio', 'ren', 'suzu'];
    let m;
    for (const c of comps) {
      if (name.indexOf(c + '_') !== 0) continue;
      const rest = name.slice(c.length + 1);
      for (const st of STATES) {
        if (rest === st) return { name, isMask, kind: 'comp', who: c, state: st, layer: null };
        if (rest.indexOf(st + '_') === 0) return { name, isMask, kind: 'comp', who: c, state: st, layer: rest.slice(st.length + 1) };
      }
      return null;
    }
    if ((m = /^pc_head_([a-z]+)$/.exec(name))) return EXPRS.indexOf(m[1]) >= 0 ? { name, isMask, kind: 'head', expr: m[1] } : null;
    if ((m = /^pc_torso_([a-z]+)$/.exec(name))) return { name, isMask, kind: 'torso', shape: m[1] };
    if ((m = /^pc_arm_([a-z_]+)_(fitted|wide)$/.exec(name))) return { name, isMask, kind: 'arm', pose: m[1], sleeve: m[2] };
    if ((m = /^pc_hair_([a-z]+)_(back|front)(_swing)?$/.exec(name))) return { name, isMask, kind: m[1] === 'wrap' ? 'hair_wrap' : 'hair', style: m[1], part: m[2], swing: !!m[3] };
    if ((m = /^acc_([a-z_]+)$/.exec(name))) {
      for (const id of Object.keys(ACC)) for (const f of ACC[id].files.concat(ACC[id].variant ? ACC[id].variant.files : [])) if (f[0] === name) return { name, isMask, kind: 'acc', acc: id, slot: f[1] };
      return { name, isMask, kind: 'acc', acc: m[1], slot: null, unknown: true };
    }
    return null;
  }
  const allowedOf = (p) => (p ? ALLOWED[p.kind] || [] : []);

  // Every asset key the contract asks for, from the registry's lists ({ companions, hairstyles, shapes,
  // accessories: [acc ids that are visible] }): { required, optional }.
  function assetKeys(reg) {
    const req = [], opt = [];
    for (const c of reg.companions) for (const st of STATES) (REQUIRED.indexOf(st) >= 0 ? req : opt).push(c + '_' + st);
    for (const e of EXPRS) req.push('pc_head_' + e);
    for (const s of reg.shapes) req.push('pc_torso_' + s);
    const sleeves = SLEEVES.filter((sl) => reg.shapes.some((s) => sleeveOf(s) === sl));
    for (const pose of armPoses(reg.companions)) for (const sl of sleeves) (pose === 'prep_b' ? opt : req).push('pc_arm_' + pose + '_' + sl);
    for (const st of reg.hairstyles) for (const part of HAIR_PARTS) {
      if (part === 'back' && FRONT_ONLY.indexOf(st) >= 0) continue;
      req.push('pc_hair_' + st + '_' + part);
      opt.push('pc_hair_' + st + '_' + part + '_swing');
    }
    for (const a of reg.accessories) {
      const d = ACC[a];
      if (!d) continue;
      for (const f of d.files) if (req.indexOf(f[0]) < 0) req.push(f[0]);
      if (d.variant) for (const f of d.variant.files) if (req.indexOf(f[0]) < 0) req.push(f[0]);
    }
    return { required: req.sort(), optional: opt.sort() };
  }

  // ---- the manifest (assets/harmony/manifest.json) ---------------------------------------------------------------
  // Returns a list of schema errors (empty: valid). `files` (optional): the names of the PNGs that came with it.
  const isBox = (b) => Array.isArray(b) && b.length === 4 && b.every((v) => Number.isInteger(v)) && b[0] < b[2] && b[1] < b[3];
  const isPt = (p) => Array.isArray(p) && p.length === 2 && p.every((v) => Number.isInteger(v) && Math.abs(v) <= 64);
  function validateManifest(m, files) {
    const E = [];
    const need = (c, msg) => { if (!c) E.push(msg); };
    if (!m || typeof m !== 'object') return ['not an object'];
    need(m.schema === 'rbn-harmony-manifest', 'schema must be "rbn-harmony-manifest"');
    need(m.contractVersion === VERSION, 'contractVersion must be ' + VERSION + ' (got ' + m.contractVersion + ')');
    need(Number.isInteger(m.artVersion) && m.artVersion >= 1, 'artVersion must be a positive integer');
    need(typeof m.set === 'string' && /^[a-z0-9_-]+$/.test(m.set), 'set must be a short lowercase name');
    need(typeof m.synthetic === 'boolean', 'synthetic must be true or false');
    need(m.files && typeof m.files === 'object', 'files must be an object');
    const names = m.files ? Object.keys(m.files) : [];
    for (const n of names) {
      const f = m.files[n], p = parse(n);
      if (!p) { E.push(n + ': not a contract file name'); continue; }
      if (p.unknown) E.push(n + ': unknown accessory file');
      need(f.png === n + '.png', n + ': png must be ' + n + '.png');
      need(f.w === BUST.w && f.h === BUST.h, n + ': must be ' + BUST.w + ' × ' + BUST.h);
      need(/^[0-9a-f]{64}$/.test(f.sha256 || ''), n + ': sha256 missing');
      need(f.kind === p.kind, n + ': kind must be ' + p.kind);
      need(f.mask === null || f.mask === n + '.mask.png', n + ': mask must be null or ' + n + '.mask.png');
      need(['derived', 'supplied', 'none'].indexOf(f.maskSource) >= 0, n + ': maskSource must be derived, supplied or none');
      if (allowedOf(p).length) need(!!f.mask, n + ': a recolourable kind needs a mask');
      else need(!f.mask, n + ': a fixed kind has no mask');
      if (files) { need(files.indexOf(f.png) >= 0, n + ': ' + f.png + ' not supplied'); if (f.mask) need(files.indexOf(f.mask) >= 0, n + ': ' + f.mask + ' not supplied'); }
    }
    const C = m.companions || {};
    for (const c of Object.keys(C)) {
      const d = C[c];
      need(d.mode === 'flat' || d.mode === 'layered', c + ': mode must be flat or layered');
      need(Array.isArray(d.states) && d.states.every((s) => STATES.indexOf(s) >= 0), c + ': states must be state ids');
      if (d.mode === 'layered') need(Array.isArray(d.layers) && d.layers.length > 0, c + ': a layered set lists its layers back to front');
      for (const st of Object.keys(d.face || {})) need(STATES.indexOf(st) >= 0 && isBox(d.face[st]), c + ': face.' + st + ' must be a box');
      if (d.timeline) { const T = timeline(d.states, d.timeline); const te = validTimeline(T); for (const e of te) E.push(c + ': timeline: ' + e); }
      for (const v of Object.keys(d.offset || {})) need(PAIR[v] && isPt(d.offset[v]), c + ': offset.' + v + ' must be [dx, dy]');
    }
    const P = m.pc || {};
    for (const e of Object.keys(P.face || {})) need(EXPRS.indexOf(e) >= 0 && isBox(P.face[e]), 'pc.face.' + e + ' must be an expression box');
    for (const st of Object.keys(P.groups || {})) {
      need(STATES.indexOf(st) >= 0, 'pc.groups.' + st + ': not a state');
      for (const g of Object.keys(P.groups[st] || {})) need((g === 'head' || g === 'torso') && isPt(P.groups[st][g]), 'pc.groups.' + st + '.' + g + ' must be head|torso: [dx, dy]');
    }
    for (const s of Object.keys(P.attach || {})) for (const a of Object.keys(P.attach[s] || {})) need(ACC[a] && ACC[a].hair && isPt(P.attach[s][a]), 'pc.attach.' + s + '.' + a + ': a hair-mounted accessory and [dx, dy]');
    for (const a of Object.keys(P.hatBand || {})) need(ACC[a] && ACC[a].hides && Number.isInteger(P.hatBand[a]) && P.hatBand[a] >= 0 && P.hatBand[a] < BUST.h, 'pc.hatBand.' + a + ': a hat or cap and a row');
    for (const pose of Object.keys(P.armSlot || {})) need(Object.prototype.hasOwnProperty.call(ARM_SLOT, P.armSlot[pose]), 'pc.armSlot.' + pose + ': one of ' + Object.keys(ARM_SLOT).join(', '));
    need(!P.glassesOver || (Array.isArray(P.glassesOver) && P.glassesOver.every((s) => typeof s === 'string')), 'pc.glassesOver must list hairstyles');
    for (const v of Object.keys(P.offset || {})) need(PAIR[v] && isPt(P.offset[v]), 'pc.offset.' + v + ' must be [dx, dy]');
    return E;
  }

  // A plain description for the registry export and the docs.
  function describe() {
    return {
      version: VERSION, bust: BUST, anchors: ANCHORS, compactSafe: COMPACT_SAFE, pair: PAIR, display: DISPLAY,
      states: STATES, required: REQUIRED, optional: OPTIONAL, reducedMotion: REDUCED, timeline: TIMELINE, segments: SEGMENTS, codePhase: CODE_PHASE,
      exprs: EXPRS, exprOf: EXPR_OF, armShared: ARM_SHARED, armRequiredShared: ARM_REQUIRED_SHARED, sleeves: SLEEVES, sleeveOf: SLEEVE_OF,
      hairParts: HAIR_PARTS, frontOnly: FRONT_ONLY, swingStates: SWING_STATES,
      pcSlots: PC_SLOTS, groupOf: GROUP_OF, armSlot: Object.keys(ARM_SLOT), slotOrder: SLOT_ORDER,
      accessories: ACC, notShown: NOT_SHOWN, materials: MATERIALS, mask: MASK, keyRamps: KEY_RAMPS, keySkinV1: KEY_SKIN_V1, outline: OUTLINE, pick: PICK, allowed: ALLOWED, import: IMPORT,
    };
  }
  // the reference sheet generator (tests/e2e/harmony_asset_refs.mjs) draws the key ramps from here
  RB.harmonyKeyRamps = [['skin (key)', KEY_RAMPS.skin], ['hair', KEY_RAMPS.hair], ['cloth main', KEY_RAMPS.clothMain], ['cloth trim', KEY_RAMPS.clothTrim], ['accessory', KEY_RAMPS.accessory]];

  return {
    VERSION, BUST, ANCHORS, COMPACT_SAFE, PAIR, DISPLAY, STATES, REQUIRED, OPTIONAL, REDUCED, TIMELINE, SEGMENTS, CODE_PHASE,
    EXPRS, EXPR_OF, ARM_SHARED, ARM_REQUIRED_SHARED, SLEEVES, SLEEVE_OF, HAIR_PARTS, FRONT_ONLY, SWING_STATES, PC_SLOTS, GROUP_OF, ARM_SLOT,
    ACC, SLOT_ORDER, NOT_SHOWN, MATERIALS, MASK, KEY_RAMPS, KEY_SKIN_V1, OUTLINE, PICK, ALLOWED, IMPORT,
    timeline, validTimeline, stateFor, armOf, armPoses, sleeveOf, accFiles, parse, allowedOf, assetKeys, validateManifest, describe,
  };
})();
