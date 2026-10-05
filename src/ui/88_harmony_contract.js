/* Harmony painted-art contract, version 3 — the machine side (docs/harmony/contract/CONTRACT.md).
 *
 * One source of truth for the painted busts: canvas geometry and anchors, the performance states and
 * their timeline, file naming, the player kit's layer slots and their order, the accessories' files and
 * colour channels, the mask colours, the key families the player kit is painted in (version 3: five anchor
 * shades per family, any number of values between and a little beyond them), the colour model the importer
 * and the game share (OKLab key curves, target curves, recolouring), the importer's thresholds, the delivery
 * batches and the approval states. Pure data and pure functions: the game's raster path (88_harmony_raster.js), the registry
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
  const VERSION = 3;
  // manifests the game still installs: v2's (written before key families; their kit pixels are exact key shades,
  // which v3 recolours exactly as v2 did) and v3's
  const COMPATIBLE = [2, 3];
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
  // Seven states (Robin's decision, 2026-10-05: `cue_b`, an in-between from `cue` to `peak`, the state Robin's
  // seven-frame art has). A six-state set (no cue_b) holds `cue` through cue_b's span, as any missing optional state.
  const STATES = ['prep_a', 'prep_b', 'cue', 'cue_b', 'peak', 'settle_a', 'settle_b'];
  const REQUIRED = ['prep_a', 'cue', 'peak', 'settle_b'];
  const OPTIONAL = ['prep_b', 'cue_b', 'settle_a'];
  const REDUCED = 'settle_b';
  // Reduced motion with painted art (contract v3, the owner's "suitable held poses and restrained fades"): no travel;
  // `peak` held, then `settle_b` held, one cross-fade of `crossFade` presentation ms centred at `at` of the hold,
  // inside the overlay's own reduced-motion timing (its fade in, hold and fade out) on the playback mode's segments.
  // The code busts keep theirs (the hold drawing alone).
  const REDUCED_MOTION = { states: ['peak', 'settle_b'], at: { seg: 'hold', from: 0.5 }, crossFade: 100 };
  // The playback modes with a portrait (Instant has none) and each one's timeline: fractions of the cut-in overlay's
  // segments (SEGMENTS). Robin's decision (2026-10-05): Normal plays the proposed performance; Fast plays what Normal
  // played before (its six-state fractions), with cue_b taking the second half of cue's span.
  const MODES = ['normal', 'fast'];
  const TIMELINES = {
    normal: [
      { phase: 'prep_a', seg: 'in', from: 0, to: 0.6 },
      { phase: 'prep_b', seg: 'in', from: 0.6, to: 1 },
      { phase: 'cue', seg: 'hold', from: 0, to: 0.11 },
      { phase: 'cue_b', seg: 'hold', from: 0.11, to: 0.19 },
      { phase: 'peak', seg: 'hold', from: 0.19, to: 0.66 },
      { phase: 'settle_a', seg: 'hold', from: 0.66, to: 0.77 },
      { phase: 'settle_b', seg: 'hold', from: 0.77, to: 1 },
      { phase: 'settle_b', seg: 'out', from: 0, to: 1 },
    ],
    fast: [
      { phase: 'prep_a', seg: 'in', from: 0, to: 0.5 },
      { phase: 'prep_b', seg: 'in', from: 0.5, to: 1 },
      { phase: 'cue', seg: 'hold', from: 0, to: 0.105 },
      { phase: 'cue_b', seg: 'hold', from: 0.105, to: 0.21 },
      { phase: 'peak', seg: 'hold', from: 0.21, to: 0.58 },
      { phase: 'settle_a', seg: 'hold', from: 0.58, to: 0.79 },
      { phase: 'settle_b', seg: 'hold', from: 0.79, to: 1 },
      { phase: 'settle_b', seg: 'out', from: 0, to: 1 },
    ],
  };
  // (the default: Normal's)
  const TIMELINE = TIMELINES.normal;
  // the overlay's segments in WALL ms (Normal 220 / 820 / 360 = 1,400; Fast 180 / 380 / 220 = 780). The sequencer
  // holds them in presentation ms (RB.battleSeq.T.cutin: Fast's clock runs ×1.43, so 257 / 543 / 315).
  const SEGMENTS = { normal: { in: 220, hold: 820, out: 360 }, fast: { in: 180, hold: 380, out: 220 } };
  const SEG_ORDER = { in: 0, hold: 1, out: 2 };
  // the drawing a code-drawn bust shows for a state (the fallback when a bust has no complete painted set)
  const CODE_PHASE = { prep_a: 'enter', prep_b: 'enter', cue: 'hold', cue_b: 'hold', peak: 'hold', settle_a: 'hold', settle_b: 'hold' };

  // The timeline for the states a set has, at a playback mode (MODES; default Normal). `have`: the states delivered
  // (an optional state that is missing holds the state before it: that state's span is extended over the missing
  // one's); `over`: per-state { seg, from, to } replacements from the manifest, applied to the mode's base timeline
  // (checked by validTimeline before use, at every mode).
  function timeline(have, over, mode) {
    const set = have ? new Set(have) : new Set(STATES);
    const base = (TIMELINES[mode] || TIMELINE).map((e) => Object.assign({}, e, over && over[e.phase] && e.seg === over[e.phase].seg ? { from: over[e.phase].from, to: over[e.phase].to } : null));
    // an override of a state's hold also moves the neighbouring spans that touch it
    const out = [];
    for (const e of base) {
      if (set.has(e.phase)) { out.push(e); continue; }
      const prev = out[out.length - 1];
      // (only ever extended: an override that already runs past the missing state's span is kept, and checked)
      if (prev && prev.seg === e.seg) prev.to = Math.max(prev.to, e.to);
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
    if (T[T.length - 1].phase !== REDUCED) errs.push('the last state must be ' + REDUCED + ' (reduced motion ends on it)');
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
  // (cue_b, the companion's in-between toward the peak, has no player files of its own: the player's kit shows its
  // cue drawing through it — head, arm, hair and the state's group offsets, unless pc.groups.cue_b is given)
  const EXPR_OF = { prep_a: 'focus', prep_b: 'focus', cue: 'cue', cue_b: 'cue', peak: 'peak', settle_a: 'settle', settle_b: 'settle' };
  const KIT_STATE = { cue_b: 'cue' };
  const ARM_SHARED = ['prep_a', 'prep_b', 'cue'];
  const ARM_REQUIRED_SHARED = ['prep_a', 'cue'];
  const armPoses = (comps) => ARM_SHARED.concat(...comps.map((c) => ['peak_' + c, 'settle_' + c]));
  // the brush arm's pose for a state of the pairing with `comp` (prep_b falls back to prep_a when absent; cue_b is cue's)
  function armOf(st, comp) {
    if (st === 'cue_b') return 'cue';
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
    lamp: 'companion-only (Ren); held in their painted frames',
    patches: 'companion-only (Ren); part of their painted coat',
    pencil: 'companion-only (Nao); part of their painted frames',
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

  // ---- approval states (contract v3) ---------------------------------------------------------------------------------
  // Per pairing (a companion's frames with the player's arm poses for it) and for the player kit, in the manifest
  // (companions.<id>.approval, pc.approval; set from the batch's import.json). Shown by RB.harmonyArt.stats() and the
  // ?dev=harmony viewer, never to players. The code-drawn busts are 'provisional'; the synthetic fixtures 'synthetic'.
  const APPROVAL = ['provisional', 'candidate', 'approved', 'verified'];
  const APPROVAL_LABEL = { provisional: 'provisional artwork', candidate: 'visual candidate awaiting approval', approved: 'approved visual direction', verified: 'integrated and verified', synthetic: 'synthetic sample — not art' };

  // ---- delivery batches (contract v3 §1.1) ---------------------------------------------------------------------------------
  // Phase 1 (1a) sets the quality bar — Suzu and the player's look A — and is approved by the owner before anything is
  // rolled out; phase 2 (1b) then proves a materially different look B on the same kit. Looks name the parts only:
  // every colour is the player's own choice (the kit is recoloured).
  const BATCHES = {
    '1a': {
      phase: 1, purpose: 'the quality bar: Suzu and the player\'s look A (owner approval before roll-out)', companion: 'suzu',
      look: { hair: 'ponytail', shape: 'coat', acc: ['glasses', 'flower', 'satchel'] },
      required: ['suzu_prep_a', 'suzu_cue', 'suzu_peak', 'suzu_settle_b', 'pc_head_focus', 'pc_head_cue', 'pc_head_peak', 'pc_head_settle', 'pc_torso_coat',
        'pc_arm_prep_a_fitted', 'pc_arm_cue_fitted', 'pc_arm_peak_suzu_fitted', 'pc_arm_settle_suzu_fitted', 'pc_hair_ponytail_back', 'pc_hair_ponytail_front', 'acc_glasses', 'acc_flower', 'acc_satchel'],
      optional: ['suzu_prep_b', 'suzu_cue_b', 'suzu_settle_a', 'suzu_peak_fx', 'pc_arm_prep_b_fitted'],
    },
    '1b': {
      phase: 2, purpose: 'the customisation proof: a materially different look B on the same kit (after 1a is approved)', companion: 'suzu', after: '1a',
      look: { hair: 'curly', shape: 'robe', acc: ['scarf', 'headband'] },
      required: ['pc_torso_robe', 'pc_arm_prep_a_wide', 'pc_arm_cue_wide', 'pc_arm_peak_suzu_wide', 'pc_arm_settle_suzu_wide', 'pc_hair_curly_back', 'pc_hair_curly_front', 'acc_scarf', 'acc_headband'],
      optional: ['pc_arm_prep_b_wide'],
    },
  };
  // How far a set of file names covers each batch: { id: { required, present, missingRequired, optionalPresent, complete } }
  function batchCoverage(names) {
    const have = new Set(names), out = {};
    for (const [id, B] of Object.entries(BATCHES)) {
      const miss = B.required.filter((n) => !have.has(n));
      out[id] = { phase: B.phase, required: B.required.length, present: B.required.length - miss.length, missingRequired: miss, optionalPresent: B.optional.filter((n) => have.has(n)), complete: !miss.length };
    }
    return out;
  }
  // The approval of each pairing and of the player kit in a manifest (v2 manifests: 'candidate', or 'synthetic').
  function approvalOf(m) {
    const def = m && m.synthetic ? 'synthetic' : 'candidate';
    const out = { kit: (m && m.pc && m.pc.approval) || def, pairings: {} };
    for (const c of Object.keys((m && m.companions) || {})) out.pairings[c] = m.companions[c].approval || def;
    return out;
  }

  // ---- materials, masks, key ramps --------------------------------------------------------------------------------
  const MATERIALS = ['skin', 'hair', 'clothMain', 'clothTrim', 'accessory'];
  const MASK = { skin: '#ff0000', hair: '#00ff00', clothMain: '#0000ff', clothTrim: '#ffff00', accessory: '#ff00ff', fixed: '#000000' };
  // Paint the player kit's recolourable parts in these, darkest → lightest (docs/harmony/asset_brief/ref_palettes.png).
  // Skin is a deliberately unnatural orange key (contract v2): brief v1's natural skin key was skin palette 2's own
  // ramp (a recoloured skin-2 player would contain key colours) and lay within 40 of 28 of the code's face colours
  // (the default iris 15.6 away, a mouth 11.1, a blush 10.3). KEY_SKIN_V1 keeps it for the record.
  // The darkest hair and trim shades are also more saturated than brief v1's (#2a0a3a, #0a3a44), which sat
  // within 40 of the near-blacks every kit file holds (outline ink, lashes, brush lacquer): measured on the sample.
  const KEY_SKIN_V1 = ['#6e3e2a', '#9a5e40', '#c28e64', '#dcae84', '#f2d0a8'];
  const KEY_V1 = { hair0: '#2a0a3a', clothTrim0: '#0a3a44' };
  const KEY_RAMPS = {
    skin: ['#601c00', '#943c08', '#d06018', '#f48c40', '#ffc0a0'],
    hair: ['#3c0a5c', '#5a1470', '#8a24a0', '#b848c8', '#e088ec'],
    clothMain: ['#0c3a14', '#1a6428', '#2e8c3c', '#52b45a', '#8ad88a'],
    clothTrim: ['#004e60', '#12687a', '#22a0b4', '#5ccce0', '#a8f0f8'],
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
    hair: ['hair', 'clothTrim'], hair_wrap: ['hair', 'clothTrim'], acc: ['accessory'],
  };
  // Importer thresholds (contract v3: key families, free values; docs/harmony/contract/CONTRACT.md §5).
  // Each material's five key shades are a KEY CURVE: piecewise linear in OKLab through s0…s4, extended by `extend`
  // (in shade steps) beyond both ends along the end segments. A pixel is projected onto a curve at its own
  // lightness (t: where on the curve, in shade steps; d: the OKLab distance from the curve at that lightness — its
  // hue and chroma deviation — plus any lightness beyond the extended ends). For a file's allowed materials: the
  // nearest curve within `inner`, nearer than the runner-up by at least `margin`, takes the pixel (keeping its
  // painted colour and value); farther than `outer` from every allowed curve, the pixel is fixed; anything else is
  // unresolved (the import fails unless a supplied <name>.mask.png decides). A pixel within `foreign` of a curve its
  // file may not hold (practically a key colour of that material), and clearly nearer to it than to any allowed one,
  // is unresolved too: a skin-orange patch painted into a hair file would otherwise keep its key colour in every look. Outline ink (within
  // `outline` of #140c18, sRGB 0–255) and near-white highlights (within `white` of #ffffff or the eye white
  // #f6f2ee) are always fixed. Alpha below `alpha` is transparent, at or above it opaque. Calibrated on the
  // synthetic sample and the synthetic rich fixture (tools/harmony_calibrate.mjs, docs/harmony/contract/calibration.json).
  // `v2`: contract v2's sRGB snap radii, kept for the record (v2 snapped every kit pixel to one of five shades).
  const IMPORT = { inner: 0.31, outer: 0.34, margin: 0.1, foreign: 0.1, extend: 0.6, outline: 24, white: 24, alpha: 128, protect: ['#140c18', '#ffffff', '#f6f2ee'], maxOffset: 24, v2: { snap: 12, ambiguous: 40 } };
  // Recolouring (runtime, contract v3): a material pixel's t (its value on its key curve) maps onto the TARGET CURVE —
  // the look's own material ramp (the code busts' tones), with key shade s at the tone PICK chooses for it and the
  // tones PICK skips in between (or beyond) at their fractional places — and its deviation from the key curve
  // (relative chroma rho, hue angle theta) is added back to the target, scaled by `residual`, capped at `maxChroma`
  // (relative) and `maxHue` (radians), then mapped into the sRGB gamut at constant lightness and hue. An exact key
  // shade has no deviation and gives exactly the tone it gave in v2 — except on the few ramps where the game's own tones
  // collapse (two picked tones less than `valueFloor` of OKLab lightness apart per shade step: the darkest and
  // lightest skins, white and gold hair, very dark or very light accessory colours): there the target curve is opened
  // to the floor (targetCurve below) so painted values stay readable; `valueFloor: 0` restores v2's tones everywhere.
  // `minChroma`: below this key chroma the relative chroma is taken against it (no division by a near-grey).
  const RECOLOUR = { residual: 1, maxChroma: 1, maxHue: 0.6, minChroma: 0.02, valueFloor: 0.05 };

  // ---- colour: OKLab (Björn Ottosson, 2020), the space the key curves and the recolouring work in ---------------------
  const LIN = new Float64Array(256);
  for (let i = 0; i < 256; i++) { const c = i / 255; LIN[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  const enc = (c) => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
  // sRGB 0–255 (integers) → [L, a, b]
  function oklab(r, g, b) {
    const R = LIN[r & 255], G = LIN[g & 255], B = LIN[b & 255];
    const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B), m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B), s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
    return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
  }
  // [L, a, b] → linear sRGB (may fall outside 0–1)
  function linOf(L, a, b) {
    const l = L + 0.3963377774 * a + 0.2158037573 * b, m = L - 0.1055613458 * a - 0.0638541728 * b, s = L - 0.0894841775 * a - 1.291485548 * b;
    const l3 = l * l * l, m3 = m * m * m, s3 = s * s * s;
    return [4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3, -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3, -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3];
  }
  const inGamut = (c) => c[0] >= -1e-7 && c[0] <= 1 + 1e-7 && c[1] >= -1e-7 && c[1] <= 1 + 1e-7 && c[2] >= -1e-7 && c[2] <= 1 + 1e-7;
  // [L, a, b] → sRGB 0–255 integers inside the gamut: lightness clamped to 0–1, then, if needed, the chroma reduced
  // at that lightness and hue (bisection) until it fits. Returns [r, g, b, clipped].
  function srgbOf(L, a, b) {
    L = L < 0 ? 0 : L > 1 ? 1 : L;
    let c = linOf(L, a, b), clipped = false;
    if (!inGamut(c)) {
      clipped = true;
      let lo = 0, hi = 1;
      for (let i = 0; i < 18; i++) { const k = (lo + hi) / 2; if (inGamut(linOf(L, a * k, b * k))) lo = k; else hi = k; }
      c = linOf(L, a * lo, b * lo);
    }
    const q = (v) => { const x = Math.round(enc(v < 0 ? 0 : v > 1 ? 1 : v)); return x < 0 ? 0 : x > 255 ? 255 : x; };
    return [q(c[0]), q(c[1]), q(c[2]), clipped];
  }
  // [L, a, b] inside the sRGB gamut: lightness clamped to 0–1, the chroma reduced at that lightness and hue if needed
  function fitLab(L, a, b) {
    L = L < 0 ? 0 : L > 1 ? 1 : L;
    if (inGamut(linOf(L, a, b))) return [L, a, b];
    let lo = 0, hi = 1;
    for (let i = 0; i < 18; i++) { const k = (lo + hi) / 2; if (inGamut(linOf(L, a * k, b * k))) lo = k; else hi = k; }
    return [L, a * lo, b * lo];
  }
  const hexRgb = (h) => { const n = parseInt(String(h).replace('#', '').slice(0, 6), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const labHex = (h) => { const c = hexRgb(h); return oklab(c[0], c[1], c[2]); };
  const dLab = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);

  // ---- key curves and target curves ---------------------------------------------------------------------------------------
  // A curve is a list of nodes { t, L, a, b } in rising t (and rising L for a key curve); between nodes it is linear
  // in OKLab, beyond the end nodes it continues along the end segments.
  function curveAt(C, t) {
    const n = C.length;
    let i = 0;
    if (t <= C[0].t) i = 0; else if (t >= C[n - 1].t) i = n - 2; else while (i < n - 2 && t > C[i + 1].t) i++;
    const A = C[i], B = C[i + 1], span = B.t - A.t, k = span > 0 ? (t - A.t) / span : 0;
    return [A.L + (B.L - A.L) * k, A.a + (B.a - A.a) * k, A.b + (B.b - A.b) * k];
  }
  // the extended key curve of a material (cached): nodes at −extend, 0…4, 4 + extend
  const keyCurves = {};
  function keyCurve(m) {
    if (keyCurves[m]) return keyCurves[m];
    const K = KEY_RAMPS[m].map((h, s) => { const p = labHex(h); return { t: s, L: p[0], a: p[1], b: p[2] }; });
    const e = IMPORT.extend, ext = (P, Q, t) => ({ t, L: P.L + (P.L - Q.L) * e, a: P.a + (P.a - Q.a) * e, b: P.b + (P.b - Q.b) * e });
    keyCurves[m] = [ext(K[0], K[1], -e)].concat(K, [ext(K[4], K[3], 4 + e)]);
    return keyCurves[m];
  }
  // where a colour (OKLab) sits on material m's key curve, at its own lightness:
  //   t     in shade steps (0 = s0 … 4 = s4), continued linearly past the ends by lightness (not clamped)
  //   at    the curve's point it is measured against (t clamped to the extended ends: tc), mapped into the sRGB gamut
  //   d     its RELATIVE distance from the curve (dimensionless): the chroma-plane deviation from `at` divided by the
  //         curve's own chroma there (so 0.2 is "a fifth off the family's colour", whether the family is vivid or
  //         pale at that value), combined with how many shade steps the lightness lies beyond the extended ends
  //   dAbs  the plain OKLab distance from `at` (for reports)
  // Relative, because every key curve fades toward neutral at its ends: in absolute terms an ivory shirt sits 0.036
  // from the skin curve's pale end and a lash 0.056 from its dark end (measured on the sample), while relative to
  // the curve's chroma both are more than half the family's colour away.
  function project(p, m) {
    const C = keyCurve(m), n = C.length, L = p[0];
    let t;
    if (L <= C[0].L) t = C[0].t + ((L - C[0].L) * (C[1].t - C[0].t)) / (C[1].L - C[0].L);
    else if (L >= C[n - 1].L) t = C[n - 1].t + ((L - C[n - 1].L) * (C[n - 1].t - C[n - 2].t)) / (C[n - 1].L - C[n - 2].L);
    else { let i = 0; while (i < n - 2 && L > C[i + 1].L) i++; t = C[i].t + ((L - C[i].L) * (C[i + 1].t - C[i].t)) / (C[i + 1].L - C[i].L); }
    const tc = t < C[0].t ? C[0].t : t > C[n - 1].t ? C[n - 1].t : t;
    // (the family's colour at that value as sRGB can show it: past the light end of a pale ramp the curve leaves the
    // gamut, and a painted colour there cannot have the curve's chroma)
    const q = curveAt(C, tc), at = fitLab(q[0], q[1], q[2]);
    const ck = Math.max(Math.hypot(at[1], at[2]), RECOLOUR.minChroma);
    const d = Math.hypot(Math.hypot(p[1] - at[1], p[2] - at[2]) / ck, t - tc);
    return { t, tc, d, dAbs: dLab(p, at), at };
  }
  // A pixel of material m, decomposed for recolouring: t (value), rho (chroma relative to the key curve's at that
  // lightness, −1 = grey), theta (hue angle from the key curve's, radians). Look-independent.
  function decompose(p, m) {
    const pr = project(p, m), K = pr.at, R = RECOLOUR;
    const CK = Math.hypot(K[1], K[2]), C = Math.hypot(p[1], p[2]);
    const rho = Math.max(-1, Math.min(R.maxChroma, (C - CK) / Math.max(CK, R.minChroma)));
    let theta = C < 1e-4 || CK < 1e-4 ? 0 : Math.atan2(p[2], p[1]) - Math.atan2(K[2], K[1]);
    while (theta > Math.PI) theta -= 2 * Math.PI;
    while (theta < -Math.PI) theta += 2 * Math.PI;
    theta = Math.max(-R.maxHue, Math.min(R.maxHue, theta));
    return { t: pr.t, rho, theta, d: pr.d };
  }
  // The target curve for a material ramp of the look: tones (sRGB hex or [r, g, b]) dark → light, and pick (the five
  // tone indices key shades 0…4 take: PICK). Skipped tones between two picks sit at their fractional place; tones
  // beyond the first or last pick continue at the spacing of the end pair; the curve then reaches the extended ends
  // (−extend, 4 + extend) along its end segments. Duplicate picks give a flat stretch — which the VALUE FLOOR then
  // opens: lightness must rise by at least `floor` (RECOLOUR.valueFloor) per shade step between every two nodes, so
  // neighbouring painted values stay apart on the darkest and lightest ramps (the game's own ramps repeat or nearly
  // repeat a tone there). The adjustment is a weighted least-squares fit (isotonic regression on lightness less the
  // floor's running total; key nodes weigh 100, the others 1), lightness only, kept within 0–1: a ramp that already
  // meets the floor is left exactly as it is. Each node keeps `L0`, its lightness before the floor.
  function targetCurve(tones, pick, floor) {
    floor = floor == null ? RECOLOUR.valueFloor : floor;
    const lab = tones.map((c) => (Array.isArray(c) ? oklab(c[0], c[1], c[2]) : labHex(c)));
    const nodes = [];
    const add = (t, j) => { const q = lab[j]; nodes.push({ t, L: q[0], a: q[1], b: q[2], key: Number.isInteger(t) && t >= 0 && t <= 4 }); };
    const s1 = pick[1] - pick[0] || 1, s4 = pick[4] - pick[3] || 1;
    for (let j = 0; j < pick[0]; j++) add(-(pick[0] - j) / s1, j);
    for (let s = 0; s < 5; s++) {
      add(s, pick[s]);
      if (s < 4) for (let j = pick[s] + 1; j < pick[s + 1]; j++) add(s + (j - pick[s]) / (pick[s + 1] - pick[s]), j);
    }
    for (let j = pick[4] + 1; j < tones.length; j++) add(4 + (j - pick[4]) / s4, j);
    const e = IMPORT.extend;
    if (nodes[0].t > -e) { const q = curveAt(nodes, -e); nodes.unshift({ t: -e, L: q[0], a: q[1], b: q[2], key: false }); }
    if (nodes[nodes.length - 1].t < 4 + e) { const q = curveAt(nodes, 4 + e); nodes.push({ t: 4 + e, L: q[0], a: q[1], b: q[2], key: false }); }
    for (const n of nodes) n.L0 = n.L;
    if (floor > 0) {
      // M_i = L_i − G_i (G: the floor's running total), fitted non-decreasing (pool adjacent violators), then back
      const n = nodes.length, G = [0];
      for (let i = 1; i < n; i++) G[i] = G[i - 1] + floor * (nodes[i].t - nodes[i - 1].t);
      const blocks = [];
      for (let i = 0; i < n; i++) {
        let b = { w: nodes[i].key ? 100 : 1, v: nodes[i].L - G[i], from: i, to: i };
        while (blocks.length && blocks[blocks.length - 1].v > b.v - 1e-12) { const a = blocks.pop(); b = { w: a.w + b.w, v: (a.v * a.w + b.v * b.w) / (a.w + b.w), from: a.from, to: b.to }; }
        blocks.push(b);
      }
      const lo = 0 - G[0], hi = 1 - G[n - 1];
      for (const b of blocks) for (let i = b.from; i <= b.to; i++) {
        const M = Math.min(Math.max(b.v, lo), hi);
        // (unchanged nodes keep their exact lightness: a ramp that meets the floor is untouched to the last bit)
        if (Math.abs(M + G[i] - nodes[i].L) > 1e-9) nodes[i].L = M + G[i];
      }
    }
    return nodes;
  }
  // A decomposed pixel on a target curve → sRGB [r, g, b, clipped]. `k`: the residual factor (default RECOLOUR.residual).
  function recolour(dc, T, k) {
    k = k == null ? RECOLOUR.residual : k;
    const q = curveAt(T, dc.t), CT = Math.hypot(q[1], q[2]), hT = Math.atan2(q[2], q[1]);
    const C = Math.max(0, CT * (1 + k * dc.rho)), h = hT + k * dc.theta;
    return srgbOf(q[0], C * Math.cos(h), C * Math.sin(h));
  }

  // ---- file names ------------------------------------------------------------------------------------------------------
  // <comp>_<state>[_<layer>], pc_head_<expr>, pc_torso_<shape>, pc_arm_<pose>_<sleeve>, pc_hair_<style>_<part>[_swing],
  // acc_<id>[_<part>|_<variant>]; a mask is <name>.mask.png. The longest state matches first: suzu_cue_b is the
  // state cue_b (never cue with a layer "b"); suzu_cue_b_fx its effect; suzu_cue_fx cue's.
  const STATES_LONGEST = STATES.slice().sort((a, b) => b.length - a.length || STATES.indexOf(a) - STATES.indexOf(b));
  function parse(name, reg) {
    name = String(name).replace(/\.png$/i, '');
    const isMask = /\.mask$/.test(name);
    if (isMask) name = name.slice(0, -5);
    const comps = (reg && reg.companions) || ['nao', 'mio', 'ren', 'suzu'];
    let m;
    for (const c of comps) {
      if (name.indexOf(c + '_') !== 0) continue;
      const rest = name.slice(c.length + 1);
      for (const st of STATES_LONGEST) {
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
    need(COMPATIBLE.indexOf(m.contractVersion) >= 0, 'contractVersion must be ' + COMPATIBLE.join(' or ') + ' (got ' + m.contractVersion + ')');
    // approval states (contract v3): every pairing and the player kit; 'synthetic' exactly when the set is synthetic
    const okApproval = (v) => (m.synthetic ? v === 'synthetic' : APPROVAL.indexOf(v) >= 0);
    if (m.contractVersion >= 3) {
      for (const c of Object.keys(m.companions || {})) need(okApproval(m.companions[c].approval), c + ': approval must be ' + (m.synthetic ? '"synthetic"' : 'one of ' + APPROVAL.join(', ')));
      need(okApproval((m.pc || {}).approval), 'pc.approval must be ' + (m.synthetic ? '"synthetic"' : 'one of ' + APPROVAL.join(', ')));
    }
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
      if (d.timeline) {
        for (const st of Object.keys(d.timeline)) {
          const o = d.timeline[st];
          need(STATES.indexOf(st) >= 0 && o && SEG_ORDER[o.seg] != null && o.from >= 0 && o.to <= 1 && o.from < o.to, c + ': timeline.' + st + ' must be { seg, from, to } with 0 ≤ from < to ≤ 1');
        }
        // (the overrides apply to each playback mode's base timeline: valid at every mode)
        for (const mode of MODES) { const te = validTimeline(timeline(d.states, d.timeline, mode)); for (const e of te) E.push(c + ': timeline (' + mode + '): ' + e); }
      }
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
      version: VERSION, compatible: COMPATIBLE, bust: BUST, anchors: ANCHORS, compactSafe: COMPACT_SAFE, pair: PAIR, display: DISPLAY,
      states: STATES, required: REQUIRED, optional: OPTIONAL, reducedMotion: REDUCED, reducedMotionPlan: REDUCED_MOTION, modes: MODES, timeline: TIMELINE, timelines: TIMELINES, segments: SEGMENTS, segmentsUnit: 'wall ms', codePhase: CODE_PHASE,
      approval: APPROVAL, approvalLabel: APPROVAL_LABEL, batches: BATCHES, recolour: RECOLOUR,
      colourModel: 'OKLab key curves through the five anchor shades of each key family, extended ' + IMPORT.extend + ' steps past both ends; t from lightness; deviation relative to the curve\'s chroma (src/ui/88_harmony_contract.js colour)',
      exprs: EXPRS, exprOf: EXPR_OF, kitState: KIT_STATE, armShared: ARM_SHARED, armRequiredShared: ARM_REQUIRED_SHARED, sleeves: SLEEVES, sleeveOf: SLEEVE_OF,
      hairParts: HAIR_PARTS, frontOnly: FRONT_ONLY, swingStates: SWING_STATES,
      pcSlots: PC_SLOTS, groupOf: GROUP_OF, armSlot: Object.keys(ARM_SLOT), slotOrder: SLOT_ORDER,
      accessories: ACC, notShown: NOT_SHOWN, materials: MATERIALS, mask: MASK, keyRamps: KEY_RAMPS, keySkinV1: KEY_SKIN_V1, keyV1: KEY_V1, outline: OUTLINE, pick: PICK, allowed: ALLOWED, import: IMPORT,
    };
  }
  // the reference sheet generator (tests/e2e/harmony_asset_refs.mjs) draws the key ramps from here
  RB.harmonyKeyRamps = [['skin (key)', KEY_RAMPS.skin], ['hair', KEY_RAMPS.hair], ['cloth main', KEY_RAMPS.clothMain], ['cloth trim', KEY_RAMPS.clothTrim], ['accessory', KEY_RAMPS.accessory]];

  return {
    VERSION, COMPATIBLE, BUST, ANCHORS, COMPACT_SAFE, PAIR, DISPLAY, STATES, REQUIRED, OPTIONAL, REDUCED, REDUCED_MOTION, MODES, TIMELINE, TIMELINES, SEGMENTS, CODE_PHASE, APPROVAL, APPROVAL_LABEL, BATCHES,
    EXPRS, EXPR_OF, KIT_STATE, ARM_SHARED, ARM_REQUIRED_SHARED, SLEEVES, SLEEVE_OF, HAIR_PARTS, FRONT_ONLY, SWING_STATES, PC_SLOTS, GROUP_OF, ARM_SLOT,
    ACC, SLOT_ORDER, NOT_SHOWN, MATERIALS, MASK, KEY_RAMPS, KEY_SKIN_V1, KEY_V1, OUTLINE, PICK, ALLOWED, IMPORT, RECOLOUR,
    timeline, validTimeline, stateFor, armOf, armPoses, sleeveOf, accFiles, parse, allowedOf, assetKeys, validateManifest, describe, batchCoverage, approvalOf,
    colour: { oklab, linOf, srgbOf, fitLab, labHex, hexRgb, dLab, curveAt, keyCurve, project, decompose, targetCurve, recolour },
  };
})();
