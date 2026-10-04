/* Mannerism profiles: the player, the four companions and the recurring cast (docs/expressive/GESTURES.md
 * §6–§7, written from each person's look, role, station and own lines). Read by the idle scheduler
 * (RB.staging), the scene cues and the dialogue portraits. Everyone else on a map gets a profile derived from
 * their look and the station they stand at (RB.mannerisms.classOf). Habits name RB.gestures ids; talk lists
 * primitive numbers. `tier: 'bespoke'` marks the 26 characters with authored treatment beyond their class overlay.
 *
 * The dialogue portrait (src/ui/21_portrait_anim.js, PORTRAITS.md §4–§5) takes its class overlay from `class`
 * and reads `portrait` — `note` (what it should read as), `class` (only where the portrait's overlay is not the
 * actor class), rates in ms (`blink`, `shut`, `dbl`, `breath`, `glance: { every, hold, dirs }`, `tilt`, `sway`,
 * `glint`, `habit: { kind, every, hold }`, `big`; null removes a motion), `cues` (the variant of the cue each
 * emotion uses: smirk { turn, wink }, laugh { hidden, wink }, worry { nod }, think { adjust, lids },
 * closed { slow }, sad { look }) and `serious` (expressions held without a tilt or weight shift). Two tells
 * shape the cue without a block: tells.sad 'aside' or 'avert' (the sad cue ends looking down and aside) and
 * tells.think 'glasses' (a glasses adjustment, once a scene). Whatever is not given here comes from the
 * portrait player's own table, then the class overlay. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const M = (id, cls, tier, o) => RB.mannerisms.add(id, Object.assign({ class: cls, tier }, o));
  const B = 'bespoke', O = 'overlay';

  // ---- the player and the companions (§6) ----------------------------------------------------------------
  // the player: only what implies no feeling (the strap, a look at what is in front, a shift of weight);
  // tells and conversation come only from the line the player chose
  M('pc', 'traveller', B, { every: [9, 16], idle: [['strap', 2], ['glance', 2], ['shift', 2], ['shiftR', 1]], talk: [9, 1, 2, 10, 11, 12, 15, 16, 21, 29], avoid: ['any gesture that implies a feeling the chosen line does not'],
    portrait: { note: 'the plain loop: nothing that implies a feeling (the player\'s lines carry no tags); a look at what is in front', class: 'base',
      glance: { every: [12000, 20000], hold: [700, 1100], dirs: [[1, 0], [0, 1]] } } });
  M('nao', 'traveller', B, { rest: 'strap', every: [7, 14], idle: [['lookroad', 4], ['check', 2, { prop: 'letter' }], ['strap', 1], ['glance', 2]], route: [['lookroad', 2]],
    tells: { surprise: 'listen', worry: 'aside', sad: 'aside', happy: 'nod', think: 'lookbetween', shy: 'aside' , angry: 'emphatic' }, props: ['satchel', 'letter', 'tags'], talk: [10, 3, 2, 14, 4, 9, 17, 20, 24, 27],
    strong: [{ beat: 'lf.nao_deliver', gesture: 'handover' }], avoid: ['impatience on every line', 'sprinting'],
    // (the sad cue ends looking aside: tells.sad 'aside', "a smirk and a look away")
    portrait: { note: 'glances toward the frame\'s edges (the exits), sparse blinks; smirk with the head turned a little away, held; sadness looks away',
      blink: [4400, 7400], dbl: 0.05, glance: { every: [6000, 10000], hold: [900, 1400], dirs: [[-1, 0], [1, 0]] }, cues: { smirk: { turn: [-1, 0] } } } });
  M('mio', 'host', B, { rest: 'clasp', every: [8, 15], idle: [['check', 3, { prop: 'bottle' }], ['glance', 3], ['touchhair', 1], ['shift', 1]], route: [['glance', 1]],
    tells: { surprise: 'recoil', worry: 'guard', sad: 'lowered', happy: 'laugh', think: 'chin', angry: 'emphatic', shy: 'fidget' }, props: ['bottles', 'bottle'], talk: [4, 15, 13, 30, 24, 20, 32, 6, 10, 11, 28, 29],
    strong: [{ beat: 'lf.mio_refuse', gesture: 'emphatic' }, { beat: 'lf.mio_refuse', gesture: 'shake' }, { beat: 'lf.mio_refuse', gesture: 'fidget' }], avoid: ['perpetual shyness', 'bowing on every line'],
    portrait: { note: 'steady blinks, a soft tilt, a careful look down at you; worry: brows up and a small nod; a hidden laugh (closed eyes, one shoulder lift)',
      blink: [3400, 5000], dbl: 0.04, tilt: { every: [9000, 15000], hold: [2200, 3600], dx: [1] }, glance: { every: [10000, 16000], hold: [600, 900], dirs: [[0, 1], [-1, 1]] },
      cues: { worry: { nod: true }, laugh: { hidden: true } } } });
  M('ren', 'keeper', B, { every: [9, 16], idle: [['tendlamp', 4], ['glasses', 1], ['lookroad', 2], ['glance', 1]], route: [['lookroad', 1]],
    tells: { surprise: 'listen', worry: 'aside', sad: 'lowered', think: 'chin', happy: 'nod' }, props: ['lamp', 'glasses'], talk: [1, 9, 11, 7, 30, 12, 20, 28, 29], glassesPerScene: 1,
    strong: [{ beat: 'sa.shelf_ren', gesture: 'glasses' }], avoid: ['the glasses as the answer to every feeling'],
    // (a keeper's overlay, as on the road: the slower breath and longer lids of someone whose tell is stillness)
    portrait: { note: 'ponytail sway; a glint over the lenses; stillness; think: one glasses adjustment (at most once a scene); closed: a held, slower close before hard truths',
      blink: [3800, 6000], glint: { every: [8000, 14000] }, sway: { every: [6000, 10000] }, glance: { every: [12000, 18000], hold: [900, 1300], dirs: [[1, 0], [-1, 0]] },
      cues: { think: { adjust: true }, closed: { slow: 1.4 } } } });
  M('suzu', 'performer', B, { rest: 'hip', restScene: false, every: [7, 13], idle: [['hum', 3], ['heeltap', 2], ['touchhair', 2], ['check', 1, { prop: 'accountbook' }]], route: [['hum', 1]],
    tells: { surprise: 'recoil', worry: 'aside', sad: 'lowered', happy: 'laugh', think: 'chin', shy: 'avert' }, props: ['ribbon', 'accountbook'], talk: [9, 11, 31, 32, 10, 12, 17, 20, 29, 30], serious: [25, 27, 28],
    strong: [{ beat: 'co.suzu_truth', gesture: 'present' }, { beat: 'sa.end_comp', gesture: 'handover' }], avoid: ['a twirl or a wink in any apology, loss or confession'],
    portrait: { note: 'ribbon and earring sway; a light weight shift (shoulders, then the head, the hair behind); the laugh and her first smirk of a scene wink; serious lines: no flourish, a straighter head',
      sway: { every: [4000, 7000] }, tilt: null, habit: { kind: 'weight', every: [10000, 16000], hold: [3000, 5000] },
      cues: { laugh: { wink: true }, smirk: { wink: true } }, serious: ['sad', 'worry', 'closed', 'sad2'] } });

  // ---- bespoke recurring characters (§7) ---------------------------------------------------------------------
  M('kasane', 'keeper', B, { rest: 'sleeves', every: [20, 34], idle: [['glance', 2], ['lookroad', 1], ['check', 1, { prop: 'folio' }]], tells: { worry: 'aside', sad: 'lowered', surprise: 'recoil', think: 'chin' }, props: ['folio'], talk: [9, 16, 27], strong: [{ beat: 'sa.toya_read', gesture: 'bow' }, { beat: 'sa.choose_kasane', gesture: 'lowered' }], social: 0.1,
    portrait: { note: 'long still holds (rare, slow glances over the shelves), the hood edge stirs; closed: the eyes close slowly before an admission',
      blink: [5000, 8000], glance: { every: [18000, 28000], hold: [1200, 1800], dirs: [[1, 0], [0, 1]] }, sway: { every: [7000, 12000] }, cues: { closed: { slow: 1.6 } } } });
  M('hoshino', 'scholar', B, { rest: 'heart', every: [14, 26], idle: [['lookroad', 3], ['glasses', 2], ['rubhands', 1]], tells: { surprise: 'listen', sad: 'lowered', happy: 'exhale', think: 'chin' }, props: ['letter', 'flint'], talk: [3, 5, 7, 13], strong: [{ beat: 'sb.lamp_name', gesture: 'exhale' }],
    portrait: { note: 'a glint on the glasses, the beard still; looks up the hill to the dark lamp now and then; surprise reads through the glasses (the brows over the frames)',
      glint: { every: [7000, 12000] }, habit: { kind: 'lookUp', every: [14000, 22000], hold: [1200, 1800] } } });
  M('tsuru', 'elder', B, { every: [16, 28], idle: [['lookroad', 3], ['glance', 2], ['tendlight', 1, { at: 'light' }]], tells: { think: 'chin', worry: 'shake', sad: 'lowered', surprise: 'listen' }, props: ['cane'], talk: [2, 4, 10, 12], strong: [{ beat: 'rw.bridge_scene', gesture: 'thanks' }, { beat: 'rw.seeoff', gesture: 'lowered' }],
    portrait: { note: 'very slow blinks, the chin lifted now and then; think: the brows draw in and the eyes narrow further',
      blink: [6000, 9000], habit: { kind: 'chinUp', every: [12000, 20000], hold: [2000, 3000] }, cues: { think: { lids: true } } } });
  M('co_tokiwa', 'scholar', B, { every: [14, 24], idle: [['readidle', 3], ['glasses', 2], ['tidy', 1, { at: 'surface' }]], tells: { worry: 'aside', sad: 'lowered', think: 'glasses' }, props: ['book', 'brush'], talk: [7, 16, 24], strong: [{ beat: 'co.tokiwa_confront', gesture: 'lowered' }, { beat: 'co.assembly', gesture: 'read' }],
    // (think: a glasses adjustment once a scene, from tells.think 'glasses')
    portrait: { note: 'the glasses pushed up now and then; an evasive glance aside; think: a glasses adjustment (once a scene); sad: the gaze down and held',
      habit: { kind: 'glassesPush', every: [14000, 22000], hold: [0, 0] }, glance: { every: [10000, 16000], hold: [700, 1100], dirs: [[-1, 0], [-1, 1]] } } });
  M('omi', 'official', B, { rest: null, every: [12, 22], idle: [['write', 4, { at: 'desk' }], ['sort', 2, { at: 'surface' }], ['lookroad', 1], ['shift', 1]], tells: { think: 'listen', angry: 'emphatic', surprise: 'listen', sad: 'exhale' }, props: ['ledger', 'tags', 'brush'], talk: [1, 11, 24, 14, 12, 17, 20],
    strong: [{ beat: 'sg.omi_wataru', gesture: 'emphatic' }, { beat: 'sg.omi_wataru', gesture: 'size' }, { beat: 'sg.omi_wataru', gesture: 'point' }], avoid: ['shouting', 'a desk slam'], social: 0.3,
    portrait: { note: 'slow blinks under the brim, no double blinks, almost no tilt, a rare look to the harbour window; angry: a narrowing and one exhale, no shake',
      blink: [5200, 8000], dbl: 0, glance: { every: [16000, 26000], hold: [1000, 1500], dirs: [[1, 0]] } } });
  // Hiro "can't let go" of the work (co.hiro_first): at the workshop the blowpipe never leaves his hands and
  // keeps turning; elsewhere (the eve, the festival) he sits and wipes his brow under the head cloth
  M('hiro', 'craft', B, { every: [9, 16], idle: [['brow', 3], ['stretch', 1], ['glance', 1]], tells: { sad: 'forehead', think: 'aside', worry: 'aside' }, props: ['blowpipe', 'head cloth'], talk: [1, 20, 2], strong: [{ beat: 'co.hiro_first', gesture: 'glasswork' }, { beat: 'co.suzu_truth', gesture: 'forehead' }],
    maps: { 'co.glass': { rest: 'pipehold', restProp: 'pipeA', every: [3, 7], idle: [['glasswork', 6], ['glance', 1]] } },
    portrait: { note: 'looks down at the glow; keeps working while hurt (a pause of the hands is the tell)', glance: { every: [9000, 14000], hold: [900, 1300], dirs: [[0, 1], [1, 1]] } } });
  M('wataru', 'clerk', B, { rest: 'heart.R', every: [8, 15], idle: [['countidle', 3], ['glasses', 2], ['glance', 2], ['sort', 1, { at: 'surface' }]], tells: { sad: 'lowered', worry: 'fidget', surprise: 'recoil', happy: 'exhale', shy: 'avert' }, props: ['book', 'tags', 'notice'], talk: [8, 26, 27, 9, 6, 10, 16],
    strong: [{ beat: 'sg.omi_wataru', gesture: 'halfraise' }, { beat: 'sg.omi_wataru', gesture: 'recoil' }, { beat: 'sg.omi_wataru', gesture: 'exhale' }],
    portrait: { note: 'the glasses slip a pixel and are pushed back; looks down at the tags, and aside at the door; sad: the gaze goes down and aside',
      habit: { kind: 'glassesSlip', every: [9000, 15000], hold: [2600, 4000] }, glance: { every: [8000, 14000], hold: [800, 1300], dirs: [[0, 1], [1, 0]] }, cues: { sad: { look: [-1, 1] } } } });
  M('genzo', 'elder', B, { rest: 'behind', every: [14, 24], idle: [['lookroad', 3], ['shadeeyes', 2], ['shift', 1]], tells: { sad: 'aside', happy: 'celebrate', surprise: 'listen' , angry: 'folded' }, talk: [4, 10, 2, 22, 29], strong: [{ beat: 'sg.genzo_wind', gesture: 'celebrate' }, { beat: 'sg.ferry_arrives', gesture: 'lowered' }],
    // (the sad cue looks aside: tells.sad 'aside', "turns away to hide feeling")
    portrait: { note: 'squints at the vane (the lids half for about a second); turns aside to hide a feeling', habit: { kind: 'squint', every: [10000, 16000], hold: [900, 1300] } } });
  M('akari', 'clerk', B, { rest: 'clasp', every: [10, 18], idle: [['stamp', 3, { at: 'surface' }], ['tidy', 2, { at: 'surface' }], ['lookroad', 1]], tells: { worry: 'guard', happy: 'thanks', sad: 'avert' }, props: ['letter', 'stamp'], talk: [19, 13, 27], strong: [{ beat: 'lf.akari_letter', gesture: 'avert' }, { beat: 'lf.akari_letter', gesture: 'thanks' }],
    portrait: { note: 'looks to the window toward the mountains, and down at the forms; sadness averts (tells.sad)', glance: { every: [9000, 15000], hold: [900, 1400], dirs: [[-1, -1], [0, 1]] } } });
  M('lf_yae', 'official', B, { every: [14, 26], idle: [['glance', 2], ['nod', 2], ['readidle', 1]], tells: { think: 'chin', sad: 'lowered', happy: 'celebrate' }, props: ['cane', 'book'], talk: [2, 9, 32], strong: [{ beat: 'lf.yae_after', gesture: 'celebrate' }],
    portrait: { note: 'a small nod now and then (the unanimous agreement)', habit: { kind: 'nod', every: [9000, 15000], hold: [180, 220] } } });
  M('lq_chigusa', 'host', B, { every: [9, 16], idle: [['pour', 3, { at: 'tea' }], ['feedfire', 2, { at: 'fire' }], ['lookroad', 2], ['stir', 1, { at: 'hearth' }]], tells: { happy: 'laugh', sad: 'bow', surprise: 'recoil' }, props: ['teapot', 'cup'], talk: [13, 14, 28], strong: [{ beat: 'lq.fare_chigusa', gesture: 'bow' }, { beat: 'lq.fare_gull', gesture: 'celebrate' }],
    portrait: { note: 'looks down the road', glance: { every: [8000, 13000], hold: [900, 1300], dirs: [[-1, 0]] } } });
  M('umi', 'clerk', B, { every: [9, 16], idle: [['write', 2, { at: 'desk' }], ['tidy', 2, { at: 'surface' }], ['glance', 1]], tells: { angry: 'emphatic', happy: 'laugh', sad: 'lowered' }, props: ['brush', 'letter'], talk: [24, 3, 16], strong: [{ beat: 'lf.nao_deliver', gesture: 'read' }] });
  M('tamae', 'host', B, { every: [7, 13], idle: [['tidy', 3, { at: 'surface' }], ['stir', 2, { at: 'hearth' }], ['glance', 2], ['polish', 1]], tells: { happy: 'laugh', surprise: 'recoil', sad: 'lowered' }, props: ['teapot', 'cup'], talk: [9, 31, 32, 10, 12, 17], strong: [{ beat: 'lq.fare_gull', gesture: 'celebrate' }],
    portrait: { note: 'laughs big (her cues a frame larger); always half-turned toward the kitchen', big: true, glance: { every: [10000, 16000], hold: [700, 1100], dirs: [[1, 0]] } } });
  M('yae', 'host', B, { every: [8, 14], idle: [['stir', 3, { at: 'hearth' }], ['countidle', 2], ['tidy', 2, { at: 'surface' }], ['glance', 1]], tells: { happy: 'laugh', worry: 'countidle', surprise: 'recoil', think: 'chin' }, props: ['cup', 'teapot'], talk: [12, 9, 31, 10], strong: [{ beat: 'sb.yae', gesture: 'count' }, { beat: 'sb.eve_start', gesture: 'celebrate' }] });
  M('lf_tadashi', 'official', B, { every: [12, 20], idle: [['stamp', 4, { at: 'surface' }], ['tidy', 1, { at: 'surface' }], ['glasses', 2]], tells: { think: 'chin', surprise: 'halfraise', happy: 'exhale' }, props: ['stamp'], talk: [13, 7, 8], strong: [{ beat: 'lf.mio_refuse', gesture: 'halfraise' }, { beat: 'lf.mio_refuse', gesture: 'exhale' }],
    portrait: { note: 'a glint on the glasses, pushed up now and then', glint: { every: [9000, 15000] }, habit: { kind: 'glassesPush', every: [16000, 26000], hold: [0, 0] } } });
  M('shiori', 'scholar', B, { every: [10, 18], idle: [['readidle', 3], ['lookroad', 2], ['write', 2, { at: 'desk' }]], tells: { think: 'chin', surprise: 'listen', worry: 'lowered' }, props: ['book', 'brush'], talk: [10, 16, 3, 9], strong: [{ beat: 'sg.shiori_tide', gesture: 'point' }],
    portrait: { note: 'looks out of the window to the sea', glance: { every: [9000, 14000], hold: [1000, 1500], dirs: [[1, 0], [1, -1]] } } });
  M('yasu', 'elder', B, { every: [16, 28], idle: [['lookroad', 3], ['glance', 2], ['doze', 1]], tells: { happy: 'laugh', sad: 'lowered', think: 'chin' }, props: ['cane'], talk: [12, 3, 32, 10], strong: [{ beat: 'lq.road_write', gesture: 'read' }],
    portrait: { note: 'a small nod in the telling', habit: { kind: 'nod', every: [12000, 20000], hold: [180, 220] } } });
  M('lf_tokuji', 'elder', B, { rest: 'folded', every: [16, 30], idle: [['lookroad', 3], ['glance', 1]], tells: { angry: 'folded', sad: 'lowered' }, talk: [22, 14], strong: [{ beat: 'lf.tokuji_story', gesture: 'lowered' }], social: 0.2,
    portrait: { note: 'stares at the lake: rare, long looks to one side', glance: { every: [16000, 26000], hold: [1400, 2200], dirs: [[1, 0]] } } });
  M('lq_kayo', 'traveller', B, { every: [9, 16], idle: [['lookroad', 3], ['observe', 2], ['check', 1, { prop: 'seeds' }]], tells: { happy: 'laugh', surprise: 'recoil', think: 'chin' }, props: ['basket', 'seeds'], talk: [13, 4, 31], strong: [{ beat: 'lq.road_home', gesture: 'pointup' }],
    portrait: { note: 'looks up at the tree', glance: { every: [8000, 12000], hold: [900, 1300], dirs: [[0, -1], [1, -1]] } } });
  M('koji', 'craft', B, { rest: 'cuphold', restProp: 'cup', every: [10, 18], idle: [['sip', 3], ['lookroad', 2], ['shift', 1]], tells: { happy: 'nod', think: 'aside' }, props: ['cup'], talk: [14, 1], strong: [{ beat: 'rw.bridge_scene', gesture: 'thanks' }] });
  M('hana', 'host', B, { every: [8, 15], idle: [['pour', 3, { at: 'tea' }], ['tidy', 2, { at: 'surface' }], ['lookroad', 2]], tells: { sad: 'aside', worry: 'guard', happy: 'nod', think: 'chin' }, props: ['teapot', 'cup'], talk: [13, 9], strong: [{ beat: 'rw.bridge_scene', gesture: 'bow' }],
    portrait: { note: 'a warm tilt; sad: the gaze to the side (the cups)', tilt: { every: [8000, 14000], hold: [2400, 3600], dx: [1] }, cues: { sad: { look: [1, 1] } } } });

  // ---- recurring cast on their class overlays, with their own habits (§7) ----------------------------------
  M('co_ume', 'elder', O, { every: [16, 28], idle: [['glance', 2], ['lookroad', 1], ['doze', 1]], talk: [5, 20, 25] });
  M('co_goro', 'elder', O, { rest: 'behind', every: [18, 30], idle: [['lookroad', 2], ['rubhands', 1]], talk: [2, 25] });
  M('sa_oyone', 'keeper', O, { rest: 'sleeves', every: [14, 24], idle: [['write', 2, { at: 'surface' }], ['tendlight', 2, { at: 'light' }], ['glance', 1]], talk: [16, 2] });
  M('asahi', 'craft', O, { rest: 'folded', every: [10, 18], idle: [['brow', 2], ['check', 2, { prop: 'cup' }], ['glance', 1]], talk: [11, 5, 12] });
  M('tetsu', 'elder', O, { rest: 'folded', every: [16, 28], idle: [['lookroad', 3], ['glance', 1]], talk: [10, 22] });
  M('co_sayo', 'host', O, { every: [8, 14], idle: [['check', 3, { prop: 'paper' }], ['lookroad', 1], ['touchhair', 1]], talk: [9, 10, 31] });
  M('lf_hayato', 'official', O, { every: [10, 18], idle: [['tidy', 2, { at: 'surface' }], ['sort', 2, { at: 'surface' }], ['glance', 2]], talk: [9, 13], social: 0.7 });
  M('fuki', 'elder', O, { every: [14, 24], idle: [['rubhands', 2], ['lookroad', 1], ['tendlight', 1, { at: 'light' }]], talk: [2, 32] });
  M('co_tamotsu', 'craft', O, { rest: 'folded', every: [12, 22], idle: [['lookroad', 2], ['shadeeyes', 1]], talk: [22, 24] });
  M('kanta', 'child', O, { every: [5, 10], idle: [['bounce', 3], ['peek', 2], ['crouch', 1]], talk: [10, 31] });
  M('co_fusa', 'host', O, { every: [9, 16], idle: [['polish', 3], ['stir', 2, { at: 'hearth' }], ['glance', 1]], talk: [19, 9] });
  M('sousuke', 'traveller', O, { every: [9, 16], idle: [['sort', 3, { prop: 'envelopes' }], ['check', 2, { prop: 'letter' }], ['glasses', 1]], talk: [13, 12, 16] });
  M('co_nobu', 'craft', O, { rest: 'folded', every: [10, 18], idle: [['brow', 2], ['knead', 2, { at: 'bench' }]], talk: [22, 24], social: 0.3 });
  M('co_isao', 'craft', O, { every: [14, 24], idle: [['observe', 2], ['brow', 1], ['doze', 1]], talk: [4, 20],
    portrait: { note: 'squints at a flame now and then', habit: { kind: 'squint', every: [12000, 20000], hold: [900, 1300] } } });
  M('lf_kinu', 'host', O, { rest: 'hips', every: [9, 16], idle: [['glance', 2], ['tidy', 1, { at: 'surface' }]], talk: [24, 10] });
  M('sa_clerk', 'nonhuman', O, { every: [16, 28], idle: [['stiff', 1]], talk: [2, 13] });
  M('fuku', 'elder', O, { every: [16, 28], idle: [['lookroad', 2], ['shadeeyes', 1]], talk: [2, 3, 10] });
  M('lf_kohei', 'craft', O, { every: [9, 16], idle: [['hammer', 2, { at: 'bench' }], ['brow', 2], ['stretch', 1]], talk: [11, 17] });
  // Isamu waits by the fire: warms his hands, and now and then a hand goes to his ear, as if he heard something
  M('sa_isamu', 'traveller', O, { rest: 'sit', every: [12, 22], idle: [['rubhands', 3], ['cupear', 2], ['sitidle', 1], ['glance', 1]], talk: [1, 29],
    portrait: { note: 'listens for something no one else hears: a held look aside', glance: { every: [10000, 16000], hold: [1400, 2000], dirs: [[-1, 0]] } } });
  M('tetsuji', 'craft', O, { rest: 'folded', every: [10, 18], idle: [['countidle', 2], ['lookroad', 1]], talk: [12, 23] });
  M('denji', 'elder', O, { rest: 'sitlap', every: [14, 24], idle: [['sitidle', 2], ['glance', 1]], talk: [11, 2] });
  M('co_kotaro', 'child', O, { every: [5, 10], idle: [['bounce', 2], ['peek', 2], ['glance', 1]], talk: [10, 18] });
  M('co_asa', 'craft', O, { every: [10, 18], idle: [['lookroad', 2], ['brow', 1]], talk: [10, 17] });
  M('sota', 'craft', O, { every: [9, 16], idle: [['jiggle', 3], ['brow', 1], ['glance', 1]], talk: [10, 23] });
  M('lf_tsuya', 'elder', O, { every: [14, 24], idle: [['lookroad', 3], ['glance', 1]], talk: [1, 32] });
  M('co_shino', 'traveller', O, { every: [9, 16], idle: [['sort', 2, { prop: 'letter' }], ['lookroad', 2], ['strap', 1]], talk: [14, 2] });
  M('tomo', 'host', O, { every: [9, 16], idle: [['hangwash', 2, { at: 'laundry' }], ['lookroad', 2], ['glance', 1]], talk: [13, 32, 10, 29] });
  // Masaru kneads at his floured bench (lf_kneadbench, a 'surface' station), standing side-on at its end (lf.bakery 4,3)
  // so the work reads at play scale; between batches he counts the orders and wipes his brow.
  M('lf_masaru', 'host', O, { every: [8, 14], idle: [['knead', 3, { at: 'surface' }], ['countidle', 1], ['brow', 1]], talk: [12, 31] });
  M('co_heita', 'craft', O, { every: [12, 22], idle: [['doze', 3], ['stretch', 2], ['yawn', 1]], talk: [17] });
  M('lf_ritsu', 'host', O, { rest: 'clasp', every: [9, 16], idle: [['polish', 3], ['tidy', 1, { at: 'surface' }]], talk: [19, 26] });
  M('daigo', 'craft', O, { every: [9, 16], idle: [['stretch', 2], ['brow', 1], ['check', 1, { prop: 'tags' }]], talk: [13, 24] });
  M('kiyo', 'host', O, { every: [9, 16], idle: [['tidy', 2, { at: 'surface' }], ['glance', 1]], talk: [19, 25, 6, 10, 17] });
  M('cs_hama', 'craft', O, { every: [9, 16], idle: [['hammer', 2, { at: 'bench' }], ['jiggle', 1]], talk: [16, 14] });
  M('lf_nagi', 'keeper', O, { every: [10, 18], idle: [['tendlamp', 3], ['lookroad', 1]], talk: [10, 4] });
  M('sa_tsuzuri', 'nonhuman', O, { every: [16, 28], idle: [['stiff', 1]], talk: [2, 13] });
  M('lf_setsu', 'host', O, { rest: 'clasp', every: [9, 16], idle: [['tidy', 2, { at: 'surface' }], ['glance', 1]], talk: [19, 9] });
  M('mame', 'child', O, { every: [5, 10], idle: [['bounce', 2], ['peek', 1], ['glance', 1]], talk: [10, 31, 32] });
  M('oto', 'craft', O, { every: [9, 16], idle: [['hammer', 3, { at: 'bench' }], ['observe', 1], ['brow', 1]], talk: [14] });
  M('hayate', 'craft', O, { every: [10, 18], idle: [['lookroad', 3], ['brow', 1]], talk: [10, 22], social: 0.3 });
  M('natsume', 'craft', O, { every: [8, 14], idle: [['yawn', 3], ['doze', 2]], talk: [32, 2] });
  M('tobi', 'child', O, { every: [5, 10], idle: [['bounce', 2], ['peek', 2]], talk: [10, 31] });
  // Kei is the one person in Lanternfall who can still say no (lf.kei, lf.nagi): her head shake (20) is hers
  M('lf_kei', 'child', O, { rest: 'behind', every: [6, 12], idle: [['peek', 2], ['heeltap', 2]], talk: [17, 10, 20] });
  M('bunta', 'craft', O, { rest: 'folded', every: [10, 18], idle: [['hammer', 2, { at: 'bench' }], ['lookroad', 1]], talk: [22, 23] });
  M('kiku', 'elder', O, { every: [12, 20], idle: [['knead', 2, { at: 'bench' }], ['glance', 1]], talk: [20, 9] });
  M('sachi', 'host', O, { every: [9, 16], idle: [['hangwash', 3, { at: 'laundry' }], ['glance', 1]], talk: [13, 32] });
  M('lf_shu', 'craft', O, { every: [9, 16], idle: [['observe', 2], ['brow', 1]], talk: [11, 17] });
  M('nagisa', 'traveller', O, { every: [10, 18], idle: [['check', 3, { prop: 'letter' }], ['lookroad', 2]], talk: [16, 27, 28, 30, 32] });
  M('chiyo', 'child', O, { every: [5, 10], idle: [['crouch', 3], ['bounce', 1], ['glance', 1]], talk: [10, 31] });
  M('rokuta', 'child', O, { rest: 'folded', every: [6, 12], idle: [['crouch', 2], ['peek', 1]], talk: [11, 23] });
  M('sae', 'craft', O, { rest: 'sleeves', every: [10, 18], idle: [['lookroad', 3], ['glance', 1]], talk: [19, 21, 27] });
})();
