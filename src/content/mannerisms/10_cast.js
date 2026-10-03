/* Mannerism profiles: the player, the four companions and the recurring cast (docs/expressive/GESTURES.md
 * §6–§7, written from each person's look, role, station and own lines). Read by the idle scheduler
 * (RB.staging), the scene cues and the dialogue portraits (`portrait`: the portrait animation's idle and
 * signature cue, PORTRAITS.md §4). Everyone else on a map gets a profile derived from their look and the
 * station they stand at (RB.mannerisms.classOf). Habits name RB.gestures ids; talk lists primitive numbers.
 * `tier: 'bespoke'` marks the 26 characters with authored treatment beyond their class overlay. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const M = (id, cls, tier, o) => RB.mannerisms.add(id, Object.assign({ class: cls, tier }, o));
  const B = 'bespoke', O = 'overlay';

  // ---- the player and the companions (§6) ----------------------------------------------------------------
  // the player: only what implies no feeling (the strap, a look at what is in front, a shift of weight);
  // tells and conversation come only from the line the player chose
  M('pc', 'traveller', B, { every: [9, 16], idle: [['strap', 2], ['glance', 2], ['shift', 2], ['shiftR', 1]], talk: [9, 1, 2], avoid: ['any gesture that implies a feeling the chosen line does not'],
    portrait: { idle: 'neutral loop', cues: {} } });
  M('nao', 'traveller', B, { rest: 'strap', every: [7, 14], idle: [['lookroad', 4], ['check', 2, { prop: 'letter' }], ['strap', 1], ['glance', 2]], route: [['lookroad', 2]],
    tells: { surprise: 'listen', worry: 'aside', sad: 'aside', happy: 'nod', think: 'lookbetween', shy: 'aside' }, props: ['satchel', 'letter', 'tags'], talk: [10, 3, 2, 14, 4],
    strong: [{ beat: 'lf.nao_deliver', gesture: 'handover' }], avoid: ['impatience on every line', 'sprinting'],
    portrait: { idle: 'glances toward the frame edge (the exits), sparse blinks', cues: { smirk: 'smirk with the head turned a little away' } } });
  M('mio', 'host', B, { rest: 'clasp', every: [8, 15], idle: [['check', 3, { prop: 'bottle' }], ['glance', 3], ['touchhair', 1], ['shift', 1]], route: [['glance', 1]],
    tells: { surprise: 'recoil', worry: 'guard', sad: 'lowered', happy: 'laugh', think: 'chin', angry: 'emphatic', shy: 'fidget' }, props: ['bottles', 'bottle'], talk: [4, 15, 13, 30, 24, 20, 32],
    strong: [{ beat: 'lf.mio_refuse', gesture: 'emphatic' }, { beat: 'lf.mio_refuse', gesture: 'shake' }, { beat: 'lf.mio_refuse', gesture: 'fidget' }], avoid: ['perpetual shyness', 'bowing on every line'],
    portrait: { idle: 'soft tilt, steady blinks; a pin in the bun catches the light', cues: { worry: 'brows up and a small nod', laugh: 'laugh hidden: shoulders, closed eyes' } } });
  M('ren', 'keeper', B, { every: [9, 16], idle: [['tendlamp', 4], ['glasses', 1], ['lookroad', 2], ['glance', 1]], route: [['lookroad', 1]],
    tells: { surprise: 'listen', worry: 'aside', sad: 'lowered', think: 'chin', happy: 'nod' }, props: ['lamp', 'glasses'], talk: [1, 9, 11, 7, 30], glassesPerScene: 1,
    strong: [{ beat: 'sa.shelf_ren', gesture: 'glasses' }], avoid: ['the glasses as the answer to every feeling'],
    portrait: { idle: 'ponytail sway; a glint over the lenses', cues: { think: 'one glasses adjustment (at most once per scene)', closed: 'a held close before hard truths' } } });
  M('suzu', 'performer', B, { rest: 'hip', restScene: false, every: [7, 13], idle: [['hum', 3], ['heeltap', 2], ['touchhair', 2], ['check', 1, { prop: 'accountbook' }]], route: [['hum', 1]],
    tells: { surprise: 'recoil', worry: 'aside', sad: 'lowered', happy: 'laugh', think: 'chin', shy: 'avert' }, props: ['ribbon', 'accountbook'], talk: [9, 11, 31, 32], serious: [25, 27, 28],
    strong: [{ beat: 'co.suzu_truth', gesture: 'present' }, { beat: 'sa.end_comp', gesture: 'handover' }], avoid: ['a twirl or a wink in any apology, loss or confession'],
    portrait: { idle: 'ribbon and earring sway; a light weight shift', cues: { laugh: 'shoulders bob and a wink', serious: 'no flourish, a straighter head' } } });

  // ---- bespoke recurring characters (§7) ---------------------------------------------------------------------
  M('kasane', 'keeper', B, { rest: 'sleeves', every: [20, 34], idle: [['glance', 2], ['lookroad', 1], ['check', 1, { prop: 'folio' }]], tells: { worry: 'aside', sad: 'lowered', surprise: 'recoil', think: 'chin' }, props: ['folio'], talk: [9, 16, 27], strong: [{ beat: 'sa.toya_read', gesture: 'bow' }, { beat: 'sa.choose_kasane', gesture: 'lowered' }], social: 0.1,
    portrait: { idle: 'long still holds, the hood edge stirs', cues: { closed: 'eyes close slowly before an admission' } } });
  M('hoshino', 'scholar', B, { rest: 'heart', every: [14, 26], idle: [['lookroad', 3], ['glasses', 2], ['rubhands', 1]], tells: { surprise: 'listen', sad: 'lowered', happy: 'exhale', think: 'chin' }, props: ['letter', 'flint'], talk: [3, 5, 7, 13], strong: [{ beat: 'sb.lamp_name', gesture: 'exhale' }],
    portrait: { idle: 'a glint on the glasses, the beard still', cues: { surprise: 'brows high over the frames' } } });
  M('tsuru', 'elder', B, { every: [16, 28], idle: [['lookroad', 3], ['glance', 2], ['tendlight', 1, { at: 'light' }]], tells: { think: 'chin', worry: 'shake', sad: 'lowered', surprise: 'listen' }, props: ['cane'], talk: [2, 4, 10], strong: [{ beat: 'rw.bridge_scene', gesture: 'thanks' }, { beat: 'rw.depart', gesture: 'lowered' }],
    portrait: { idle: 'very slow blinks, chin up', cues: { think: 'eyes narrow further' } } });
  M('co_tokiwa', 'scholar', B, { every: [14, 24], idle: [['readidle', 3], ['glasses', 2], ['tidy', 1, { at: 'surface' }]], tells: { worry: 'aside', sad: 'lowered', think: 'glasses' }, props: ['book', 'brush'], talk: [7, 16, 24], strong: [{ beat: 'co.tokiwa_confront', gesture: 'lowered' }, { beat: 'co.assembly', gesture: 'read' }],
    portrait: { idle: 'a glint on the glasses', cues: { sad: 'gaze down and held' } } });
  M('omi', 'official', B, { rest: null, every: [12, 22], idle: [['write', 4, { at: 'desk' }], ['sort', 2, { at: 'surface' }], ['lookroad', 1], ['shift', 1]], tells: { think: 'listen', angry: 'emphatic', surprise: 'listen', sad: 'exhale' }, props: ['ledger', 'tags', 'brush'], talk: [1, 11, 24, 14],
    strong: [{ beat: 'sg.omi_wataru', gesture: 'emphatic' }, { beat: 'sg.omi_wataru', gesture: 'size' }, { beat: 'sg.omi_wataru', gesture: 'point' }], avoid: ['shouting', 'a desk slam'], social: 0.3,
    portrait: { idle: 'slow blinks under the brim, almost no tilt', cues: { angry: 'a narrowing and one exhale; no shake' } } });
  // Hiro "can't let go" of the work (co.hiro_first): at the workshop the blowpipe never leaves his hands and
  // keeps turning; elsewhere (the eve, the festival) he sits and wipes his brow under the head cloth
  M('hiro', 'craft', B, { every: [9, 16], idle: [['brow', 3], ['stretch', 1], ['glance', 1]], tells: { sad: 'forehead', think: 'aside', worry: 'aside' }, props: ['blowpipe', 'head cloth'], talk: [1, 20, 2], strong: [{ beat: 'co.hiro_first', gesture: 'glasswork' }, { beat: 'co.suzu_truth', gesture: 'forehead' }],
    maps: { 'co.glass': { rest: 'pipehold', restProp: 'pipeA', every: [3, 7], idle: [['glasswork', 6], ['glance', 1]] } } });
  M('wataru', 'clerk', B, { rest: 'heart.R', every: [8, 15], idle: [['countidle', 3], ['glasses', 2], ['glance', 2], ['sort', 1, { at: 'surface' }]], tells: { sad: 'lowered', worry: 'fidget', surprise: 'recoil', happy: 'exhale', shy: 'avert' }, props: ['book', 'tags', 'notice'], talk: [8, 26, 27, 9],
    strong: [{ beat: 'sg.omi_wataru', gesture: 'halfraise' }, { beat: 'sg.omi_wataru', gesture: 'recoil' }, { beat: 'sg.omi_wataru', gesture: 'exhale' }],
    portrait: { idle: 'glasses slip a pixel and are pushed back', cues: { sad: 'gaze down, then (on a later line) up' } } });
  M('genzo', 'elder', B, { rest: 'behind', every: [14, 24], idle: [['lookroad', 3], ['shadeeyes', 2], ['shift', 1]], tells: { sad: 'aside', happy: 'celebrate', surprise: 'listen' }, talk: [4, 10, 2], strong: [{ beat: 'sg.genzo_wind', gesture: 'celebrate' }, { beat: 'sg.ferry_arrives', gesture: 'lowered' }] });
  M('akari', 'clerk', B, { rest: 'clasp', every: [10, 18], idle: [['stamp', 3, { at: 'surface' }], ['tidy', 2, { at: 'surface' }], ['lookroad', 1]], tells: { worry: 'guard', happy: 'thanks', sad: 'avert' }, props: ['letter', 'stamp'], talk: [19, 13, 27], strong: [{ beat: 'lf.akari_letter', gesture: 'avert' }, { beat: 'lf.akari_letter', gesture: 'thanks' }] });
  M('lf_yae', 'official', B, { every: [14, 26], idle: [['glance', 2], ['nod', 2], ['readidle', 1]], tells: { think: 'chin', sad: 'lowered', happy: 'celebrate' }, props: ['cane', 'book'], talk: [2, 9, 32], strong: [{ beat: 'lf.yae_after', gesture: 'celebrate' }] });
  M('lq_chigusa', 'host', B, { every: [9, 16], idle: [['pour', 3, { at: 'tea' }], ['feedfire', 2, { at: 'fire' }], ['lookroad', 2], ['stir', 1, { at: 'hearth' }]], tells: { happy: 'laugh', sad: 'bow', surprise: 'recoil' }, props: ['teapot', 'cup'], talk: [13, 14, 28], strong: [{ beat: 'lq.fare_chigusa', gesture: 'bow' }, { beat: 'lq.fare_gull', gesture: 'celebrate' }] });
  M('umi', 'clerk', B, { every: [9, 16], idle: [['write', 2, { at: 'desk' }], ['tidy', 2, { at: 'surface' }], ['glance', 1]], tells: { angry: 'emphatic', happy: 'laugh', sad: 'lowered' }, props: ['brush', 'letter'], talk: [24, 3, 16], strong: [{ beat: 'lf.nao_deliver', gesture: 'read' }] });
  M('tamae', 'host', B, { every: [7, 13], idle: [['tidy', 3, { at: 'surface' }], ['stir', 2, { at: 'hearth' }], ['glance', 2], ['polish', 1]], tells: { happy: 'laugh', surprise: 'recoil', sad: 'lowered' }, props: ['teapot', 'cup'], talk: [9, 31, 32], strong: [{ beat: 'lq.fare_gull', gesture: 'celebrate' }] });
  M('yae', 'host', B, { every: [8, 14], idle: [['stir', 3, { at: 'hearth' }], ['countidle', 2], ['tidy', 2, { at: 'surface' }], ['glance', 1]], tells: { happy: 'laugh', worry: 'countidle', surprise: 'recoil', think: 'chin' }, props: ['cup', 'teapot'], talk: [12, 9, 31, 10], strong: [{ beat: 'sb.yae', gesture: 'count' }, { beat: 'sb.eve_start', gesture: 'celebrate' }] });
  M('lf_tadashi', 'official', B, { every: [12, 20], idle: [['stamp', 4, { at: 'surface' }], ['tidy', 1, { at: 'surface' }], ['glasses', 2]], tells: { think: 'chin', surprise: 'halfraise', happy: 'exhale' }, props: ['stamp'], talk: [13, 7, 8], strong: [{ beat: 'lf.mio_refuse', gesture: 'halfraise' }, { beat: 'lf.mio_refuse', gesture: 'exhale' }] });
  M('shiori', 'scholar', B, { every: [10, 18], idle: [['readidle', 3], ['lookroad', 2], ['write', 2, { at: 'desk' }]], tells: { think: 'chin', surprise: 'listen', worry: 'lowered' }, props: ['book', 'brush'], talk: [10, 16, 3], strong: [{ beat: 'sg.shiori_tide', gesture: 'point' }] });
  M('yasu', 'elder', B, { every: [16, 28], idle: [['lookroad', 3], ['glance', 2], ['doze', 1]], tells: { happy: 'laugh', sad: 'lowered', think: 'chin' }, props: ['cane'], talk: [12, 3, 32], strong: [{ beat: 'lq.road_write', gesture: 'read' }] });
  M('lf_tokuji', 'elder', B, { rest: 'folded', every: [16, 30], idle: [['lookroad', 3], ['glance', 1]], tells: { angry: 'folded', sad: 'lowered' }, talk: [22, 14], strong: [{ beat: 'lf.tokuji_story', gesture: 'lowered' }], social: 0.2 });
  M('lq_kayo', 'traveller', B, { every: [9, 16], idle: [['lookroad', 3], ['observe', 2], ['check', 1, { prop: 'seeds' }]], tells: { happy: 'laugh', surprise: 'recoil', think: 'chin' }, props: ['basket', 'seeds'], talk: [13, 4, 31], strong: [{ beat: 'lq.road_home', gesture: 'pointup' }] });
  M('koji', 'craft', B, { rest: 'cuphold', restProp: 'cup', every: [10, 18], idle: [['sip', 3], ['lookroad', 2], ['shift', 1]], tells: { happy: 'nod', think: 'aside' }, props: ['cup'], talk: [14, 1], strong: [{ beat: 'rw.bridge_scene', gesture: 'thanks' }] });
  M('hana', 'host', B, { every: [8, 15], idle: [['pour', 3, { at: 'tea' }], ['tidy', 2, { at: 'surface' }], ['lookroad', 2]], tells: { sad: 'aside', worry: 'guard', happy: 'nod', think: 'chin' }, props: ['teapot', 'cup'], talk: [13, 9], strong: [{ beat: 'rw.bridge_scene', gesture: 'bow' }],
    portrait: { idle: 'warm tilt', cues: { sad: 'gaze to the side (the cups)' } } });

  // ---- recurring cast on their class overlays, with their own habits (§7) ----------------------------------
  M('co_ume', 'elder', O, { every: [16, 28], idle: [['glance', 2], ['lookroad', 1], ['doze', 1]], talk: [5, 20, 25] });
  M('co_goro', 'elder', O, { rest: 'behind', every: [18, 30], idle: [['lookroad', 2], ['rubhands', 1]], talk: [2, 25] });
  M('sa_oyone', 'keeper', O, { rest: 'sleeves', every: [14, 24], idle: [['write', 2, { at: 'surface' }], ['tendlight', 2, { at: 'light' }], ['glance', 1]], talk: [16, 2] });
  M('asahi', 'craft', O, { rest: 'folded', every: [10, 18], idle: [['brow', 2], ['check', 2, { prop: 'cup' }], ['glance', 1]], talk: [11, 5] });
  M('tetsu', 'elder', O, { rest: 'folded', every: [16, 28], idle: [['lookroad', 3], ['glance', 1]], talk: [10, 22] });
  M('co_sayo', 'host', O, { every: [8, 14], idle: [['check', 3, { prop: 'paper' }], ['lookroad', 1], ['touchhair', 1]], talk: [9, 10, 31] });
  M('lf_hayato', 'official', O, { every: [10, 18], idle: [['tidy', 2, { at: 'surface' }], ['sort', 2, { at: 'surface' }], ['glance', 2]], talk: [9, 13], social: 0.7 });
  M('fuki', 'elder', O, { every: [14, 24], idle: [['rubhands', 2], ['lookroad', 1], ['tendlight', 1, { at: 'light' }]], talk: [2, 32] });
  M('co_tamotsu', 'craft', O, { rest: 'folded', every: [12, 22], idle: [['lookroad', 2], ['shadeeyes', 1]], talk: [22, 24] });
  M('kanta', 'child', O, { every: [5, 10], idle: [['bounce', 3], ['peek', 2], ['crouch', 1]], talk: [10, 31] });
  M('co_fusa', 'host', O, { every: [9, 16], idle: [['polish', 3], ['stir', 2, { at: 'hearth' }], ['glance', 1]], talk: [19, 9] });
  M('sousuke', 'traveller', O, { every: [9, 16], idle: [['sort', 3, { prop: 'envelopes' }], ['check', 2, { prop: 'letter' }], ['glasses', 1]], talk: [13, 12, 16] });
  M('co_nobu', 'craft', O, { rest: 'folded', every: [10, 18], idle: [['brow', 2], ['knead', 2, { at: 'bench' }]], talk: [22, 24], social: 0.3 });
  M('co_isao', 'craft', O, { every: [14, 24], idle: [['observe', 2], ['brow', 1], ['doze', 1]], talk: [4, 20] });
  M('lf_kinu', 'host', O, { rest: 'hips', every: [9, 16], idle: [['glance', 2], ['tidy', 1, { at: 'surface' }]], talk: [24, 10] });
  M('sa_clerk', 'nonhuman', O, { every: [16, 28], idle: [['stiff', 1]], talk: [2, 13] });
  M('fuku', 'elder', O, { every: [16, 28], idle: [['lookroad', 2], ['shadeeyes', 1]], talk: [2, 3] });
  M('lf_kohei', 'craft', O, { every: [9, 16], idle: [['hammer', 2, { at: 'bench' }], ['brow', 2], ['stretch', 1]], talk: [11, 17] });
  // Isamu waits by the fire: warms his hands, and now and then a hand goes to his ear, as if he heard something
  M('sa_isamu', 'traveller', O, { rest: 'sit', every: [12, 22], idle: [['rubhands', 3], ['cupear', 2], ['sitidle', 1], ['glance', 1]], talk: [1, 29] });
  M('tetsuji', 'craft', O, { rest: 'folded', every: [10, 18], idle: [['countidle', 2], ['lookroad', 1]], talk: [12, 23] });
  M('denji', 'elder', O, { rest: 'sitlap', every: [14, 24], idle: [['sitidle', 2], ['glance', 1]], talk: [11, 2] });
  M('co_kotaro', 'child', O, { every: [5, 10], idle: [['bounce', 2], ['peek', 2], ['glance', 1]], talk: [10, 18] });
  M('co_asa', 'craft', O, { every: [10, 18], idle: [['lookroad', 2], ['brow', 1]], talk: [10, 17] });
  M('sota', 'craft', O, { every: [9, 16], idle: [['jiggle', 3], ['brow', 1], ['glance', 1]], talk: [10, 23] });
  M('lf_tsuya', 'elder', O, { every: [14, 24], idle: [['lookroad', 3], ['glance', 1]], talk: [1, 32] });
  M('co_shino', 'traveller', O, { every: [9, 16], idle: [['sort', 2, { prop: 'letter' }], ['lookroad', 2], ['strap', 1]], talk: [14, 2] });
  M('tomo', 'host', O, { every: [9, 16], idle: [['hangwash', 2, { at: 'laundry' }], ['lookroad', 2], ['glance', 1]], talk: [13, 32] });
  // Masaru kneads at his floured bench (lf_kneadbench, a 'surface' station), standing side-on at its end (lf.bakery 4,3)
  // so the work reads at play scale; between batches he counts the orders and wipes his brow.
  M('lf_masaru', 'host', O, { every: [8, 14], idle: [['knead', 3, { at: 'surface' }], ['countidle', 1], ['brow', 1]], talk: [12, 31] });
  M('co_heita', 'craft', O, { every: [12, 22], idle: [['doze', 3], ['stretch', 2], ['yawn', 1]], talk: [17] });
  M('lf_ritsu', 'host', O, { rest: 'clasp', every: [9, 16], idle: [['polish', 3], ['tidy', 1, { at: 'surface' }]], talk: [19, 26] });
  M('daigo', 'craft', O, { every: [9, 16], idle: [['stretch', 2], ['brow', 1], ['check', 1, { prop: 'tags' }]], talk: [13, 24] });
  M('kiyo', 'host', O, { every: [9, 16], idle: [['tidy', 2, { at: 'surface' }], ['glance', 1]], talk: [19, 25] });
  M('cs_hama', 'craft', O, { every: [9, 16], idle: [['hammer', 2, { at: 'bench' }], ['jiggle', 1]], talk: [16, 14] });
  M('lf_nagi', 'keeper', O, { every: [10, 18], idle: [['tendlamp', 3], ['lookroad', 1]], talk: [10, 4] });
  M('sa_tsuzuri', 'nonhuman', O, { every: [16, 28], idle: [['stiff', 1]], talk: [2, 13] });
  M('lf_setsu', 'host', O, { rest: 'clasp', every: [9, 16], idle: [['tidy', 2, { at: 'surface' }], ['glance', 1]], talk: [19, 9] });
  M('mame', 'child', O, { every: [5, 10], idle: [['bounce', 2], ['peek', 1], ['glance', 1]], talk: [10, 31] });
  M('oto', 'craft', O, { every: [9, 16], idle: [['hammer', 3, { at: 'bench' }], ['observe', 1], ['brow', 1]], talk: [14] });
  M('hayate', 'craft', O, { every: [10, 18], idle: [['lookroad', 3], ['brow', 1]], talk: [10, 22], social: 0.3 });
  M('natsume', 'craft', O, { every: [8, 14], idle: [['yawn', 3], ['doze', 2]], talk: [32, 2] });
  M('tobi', 'child', O, { every: [5, 10], idle: [['bounce', 2], ['peek', 2]], talk: [10, 31] });
  M('lf_kei', 'child', O, { rest: 'behind', every: [6, 12], idle: [['peek', 2], ['heeltap', 2]], talk: [17, 10] });
  M('bunta', 'craft', O, { rest: 'folded', every: [10, 18], idle: [['hammer', 2, { at: 'bench' }], ['lookroad', 1]], talk: [22, 23] });
  M('kiku', 'elder', O, { every: [12, 20], idle: [['knead', 2, { at: 'bench' }], ['glance', 1]], talk: [20, 9] });
  M('sachi', 'host', O, { every: [9, 16], idle: [['hangwash', 3, { at: 'laundry' }], ['glance', 1]], talk: [13, 32] });
  M('lf_shu', 'craft', O, { every: [9, 16], idle: [['observe', 2], ['brow', 1]], talk: [11, 17] });
  M('nagisa', 'traveller', O, { every: [10, 18], idle: [['check', 3, { prop: 'letter' }], ['lookroad', 2]], talk: [16, 27] });
  M('chiyo', 'child', O, { every: [5, 10], idle: [['crouch', 3], ['bounce', 1], ['glance', 1]], talk: [10, 31] });
  M('rokuta', 'child', O, { rest: 'folded', every: [6, 12], idle: [['crouch', 2], ['peek', 1]], talk: [11, 23] });
  M('sae', 'craft', O, { rest: 'sleeves', every: [10, 18], idle: [['lookroad', 3], ['glance', 1]], talk: [19, 21] });
})();
