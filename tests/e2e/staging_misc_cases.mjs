// Fixtures for the staged scenes outside the chapter folders: the long quests (src/content/lq), the deduction
// cases (cases), The Pages We Keep (pages), the pet vignettes (pets) and the other material not tied to one
// chapter (docs/expressive/SCENES.md "Performed overworld"; notes in docs/expressive/reports/staging_lq_misc.md).
// Same shape as tests/e2e/staging_ch12_cases.mjs, played by tests/e2e/staging_runner.mjs through
// tests/e2e/staging_chapters.mjs --ch=misc:
//   { group: 'misc', scene, map, at: [x, y, dir], comp, talk, flags, quests, items, words, vars, player, prov, fail,
//     variants: [{ name, picks, comp, comps, flags, items, quests, at, fail, … }], comps, expect: { who: [gestures] } }
const ALL4 = ['nao', 'mio', 'ren', 'suzu'];
const F = (...objs) => Object.assign({}, ...objs);
const M = (o) => Object.assign({ group: 'misc' }, o);

// ---- story states (the same flags the chapter fixtures use) ----------------------------------------------------
const R0 = { rw_arrived: true, rw_road_lit: true, rw_met_tsuru: true };
const R5 = F(R0, { rw_bottles_done: true, rw_letters_done: true, rw_lanterns_done: true, rw_suzu_told: true, rw_hana_cups: true, rw_met_nao: true, rw_met_ren: true, rw_met_suzu: true, rw_lantern_s: true, rw_lantern_b: true });
// Chapter 1 resolved: the mill quiet, the bridge mended, Kōji back
const RE = F(R5, { rw_mill_open: true, rw_mr_mio: true, rw_mr_nao: true, rw_mr_ren: true, rw_mr_suzu: true, rw_gears: true, rw_loft_done: true, rw_echo_done: true, bridge_fixed: true, rw_koji_back: true });
const RD = F(RE, { departed: true, ch1_done: true });
const POST = F(RD, { ch2_done: true, ch3_done: true, ch4_done: true, ch5_done: true, ch6_done: true, postgame: true });
// Saltglass: arrived; the main quest's errands done; the chapter over
const S0 = F(RD, { sg_arrived: true, sg_harbor_seen: true });
const SC = F(S0, { sg_crates_done: true, sg_post_done: true, sg_ferry_done: true, sg_lunch_done: true, sg_wataru_met: true, sg_crate_blank: true, sg_crate_glued: true });
const SE = F(SC, { sg_clue_asahi: true, sg_clue_genzo: true, sg_clue_kiyo: true, sg_wataru_confessed: true, sg_wataru_resolved: true, sg_extension_done: true, sg_tide_read: true, sg_tide_low: true, sg_fog_cleared: true,
  sg_da_seen: true, sg_da_stacks_seen: true, sg_da_reading_seen: true, sg_da_catalog: true, sg_da_raft: true, sg_boss_done: true, sg_returned: true, ch2_done: true, sg_ferry_running: true });
const C3 = F(SE, { co_arrived: true });
const C4 = F(C3, { ch3_done: true, sb_arrived: true });
const C5 = F(C4, { ch4_done: true, lf_town_intro: true });

// ---- Long quest A: A Fare Thirty Years Owed (src/content/lq/30_fare.js), in story order -----------------------
const FARE = [
  M({ scene: 'lq.fare_koji', map: 'rw.tea', at: [4, 6, 'right'], talk: 'koji', flags: RE,
    variants: [{ name: 'before setting out', comp: null, expect: { koji: ['aside', 'size', 'point'], hana: ['aside'] } }, { name: 'on the road', comps: ALL4 }, { name: 'after the journey', comp: 'ren', flags: POST }] }),
  M({ scene: 'lq.fare_book', map: 'rw.ferry', at: [6, 3, 'up'], flags: RE,
    variants: [{ name: 'pressed · alone', comp: null, expect: { pc: ['read', 'check', 'lookroad'] } }, { name: 'pressed', comps: ALL4 }, { name: 'later', comp: 'mio', fail: true, expect: { pc: ['bend'] } },
      { name: 'read again', comp: 'nao', flags: RD, quests: { lq_fare: 1 } }, { name: 'read again · paid', comp: 'suzu', flags: F(RD, { lq_fare_paid: true }), quests: { lq_fare: 5 } }] }),
  M({ scene: 'lq.fare_tamae', map: 'sg.inn', at: [9, 5, 'up'], talk: 'tamae', flags: SC, quests: { sg_main: 2, lq_fare: 1 }, items: { lq_stamp: 1 }, comps: ALL4,
    expect: { pc: ['present'], tamae: ['observe', 'palm', 'chin', 'lowered', 'laugh', 'nod'] } }),
  M({ scene: 'lq.fare_fusa', map: 'co.inn', at: [2, 5, 'up'], talk: 'co_fusa', flags: C3, quests: { co_main: 1, lq_fare: 2 }, comps: ALL4, expect: { co_fusa: ['listen', 'laugh', 'chin'], pc: ['palm'] } }),
  M({ scene: 'lq.chigusa_idle', map: 'sb.road', at: [11, 12, 'up'], talk: 'lq_chigusa', flags: C4,
    variants: [{ name: 'the cup turned down', quests: { lq_fare: 1 }, comps: ['mio', 'suzu'], expect: { pc: ['receive', 'observe'] } }, { name: 'not yet on the quest', comp: 'nao' }],
    expect: { lq_chigusa: ['pour', 'handover', 'laugh'] } }),
  M({ scene: 'lq.fare_chigusa', map: 'sb.road', at: [11, 12, 'up'], talk: 'lq_chigusa', flags: C4, minLines: 20,
    variants: [{ name: 'Sister Dove · the letter written', quests: { lq_fare: 2 }, comps: ALL4, expect: { lq_chigusa: ['recoil', 'lowered', 'bow', 'nod', 'present', 'lookroad', 'feedfire'], pc: ['present'] } },
      { name: 'from Fusa · Koharuno named', quests: { lq_fare: 3 }, flags: F(C4, { lq_road_open: true }), comp: 'ren', expect: { lq_chigusa: ['listen'] } },
      { name: 'she writes it herself', quests: { lq_fare: 2 }, comp: 'mio', fail: true },
      { name: 'the road already open', quests: { lq_fare: 3 }, flags: F(C4, { ch4_done: true }), comp: 'suzu' }] }),
  M({ scene: 'lq.fare_pay', map: 'rw.tea', at: [4, 6, 'right'], talk: 'koji', flags: F(C5, { lq_fare_found: true, lq_ally1: true }), quests: { lq_fare: 4 }, items: { lq_stamp: 1 }, minLines: 15,
    variants: [{ name: 'Kōji asked', comps: ALL4 }, { name: 'Chigusa asked', comp: 'mio', talk: 'lq_chigusa', at: [5, 4, 'right'] }, { name: 'Chigusa asked from her side', comp: 'nao', talk: 'lq_chigusa', at: [7, 4, 'left'] }],
    expect: { lq_chigusa: ['present', 'bow', 'handover', 'write', 'receive', 'laugh'], koji: ['sip', 'present', 'handover'], hana: ['laugh', 'nod'] } }),
  M({ scene: 'lq.fare_gull', map: 'sg.inn', at: [9, 5, 'up'], talk: 'tamae', flags: F(SE, { lq_fare_found: true, lq_ally1: true, lq_fare_paid: true }), quests: { lq_fare: 5 }, items: { lq_stamp: 1 }, minLines: 10,
    variants: [{ name: 'Tamae asked', comps: ALL4 }, { name: 'Chigusa asked', comp: 'suzu', talk: 'lq_chigusa', at: [7, 4, 'left'] }],
    expect: { tamae: ['celebrate', 'receive', 'stamp', 'lowered', 'point'], lq_chigusa: ['handover', 'celebrate'], pc: ['receive'] } }),
];

// ---- Long quest B: The Name Nobody Calls (src/content/lq/40_road.js), in story order ------------------------
const KO = F(RD, { lq_road_open: true, lq_ally2: true, lq_road_tetsu: true, lq_road_name: true }); // Koharuno open
const ROAD = [
  M({ scene: 'lq.road_lantern', map: 'rw.village', at: [48, 18, 'up'], flags: RD,
    variants: [{ name: 'before setting out', comp: null, flags: RE, expect: { pc: ['observe', 'lookroad'] } }, { name: 'first look', comps: ALL4 }, { name: 'no name yet', comp: 'nao', quests: { lq_road: 1 } }] }),
  M({ scene: 'lq.road_loops', map: 'rw.village', at: [49, 18, 'right'], flags: RD,
    variants: [{ name: 'before setting out', comp: null, flags: RE }, { name: 'the upper step', comps: ALL4 }, { name: 'the lower step', at: [49, 19, 'right'], comp: 'mio' }], expect: { pc: ['lookroad'] } }),
  M({ scene: 'lq.road_yasu1', map: 'rw.village', at: [33, 25, 'right'], talk: 'yasu', flags: RD, quests: { lq_road: 0 },
    variants: [{ name: 'on the road', comps: ALL4 }, { name: 'before setting out', comp: null, flags: RE }], expect: { yasu: ['chin', 'point', 'lowered'], pc: ['point'] } }),
  M({ scene: 'lq.road_tetsu', map: 'sg.harbor', at: [34, 30, 'up'], talk: 'tetsu', flags: SE,
    variants: [{ name: 'asked', quests: { lq_road: 1 }, comps: ALL4, expect: { tetsu: ['chin', 'lookroad', 'shake'], pc: ['palm'] } }, { name: 'asked first', quests: { lq_road: 0 }, comp: 'nao' },
      { name: 'told unasked', comp: 'suzu', expect: { tetsu: ['point', 'lookroad', 'shake'] } }] }),
  M({ scene: 'lq.road_ume', map: 'co.terraces', at: [14, 24, 'up'], talk: 'co_ume', flags: C3, quests: { lq_road: 2 }, comps: ALL4,
    expect: { co_ume: ['listen', 'lookroad', 'chin', 'handover'], pc: ['receive'] } }),
  // settle (here and in the two cases after): the story moves Yasu between the pier and the lantern by the far bank
  // (quest.lq_road=4, !refresh), and the world walks the same figure there after the scene (50_world.js shiftTo:
  // about 35 tiles, round by the bridge, some 9 s at his pace), longer than the runner's default 5 s wait. He must
  // still arrive and nobody may share a tile on the way.
  M({ scene: 'lq.road_yasu2', settle: 15000, map: 'rw.village', at: [33, 25, 'right'], talk: 'yasu', flags: F(RD, C3, { ch3_done: true, lq_road_tetsu: true, lq_road_name: true }), quests: { lq_road: 3 }, items: { lq_koharu_fruit: 1 }, comps: ALL4,
    expect: { pc: ['handover'], yasu: ['receive', 'lowered', 'point', 'nod'] } }),
  M({ scene: 'lq.road_write', settle: 15000, map: 'rw.village', at: [48, 18, 'up'], flags: F(RD, C3, { ch3_done: true, lq_road_tetsu: true, lq_road_name: true }), quests: { lq_road: 4 }, minLines: 10,
    variants: [{ name: 'written', comps: ALL4, expect: { pc: ['observe', 'write', 'lookroad'], yasu: ['nod', 'read', 'point', 'lowered', 'chin'], comp: ['write'] } }, { name: 'not yet', comp: 'ren', fail: true, minLines: 3, expect: { yasu: ['nod'] } }] }),
  M({ scene: 'lq.road_yasu_bank', settle: 15000, map: 'rw.village', at: [46, 18, 'right'], talk: 'yasu_bank', flags: F(RD, C3, { ch3_done: true, lq_road_tetsu: true, lq_road_name: true }), quests: { lq_road: 4 }, minLines: 10,
    variants: [{ name: 'from his side', comp: 'mio' }, { name: 'from below', at: [47, 19, 'up'], comp: 'suzu' }], expect: { yasu: ['read'], comp: ['write'] } }),
  M({ scene: 'lq.kh_arrive', map: 'lq.koharu', at: [2, 11, 'right'], flags: KO, quests: { lq_road: 5 }, comps: ALL4, expect: { pc: ['lookroad'] } }),
  M({ scene: 'lq.kh_tree', map: 'lq.koharu', at: [20, 9, 'up'], flags: KO, quests: { lq_road: 5 },
    variants: [{ name: 'the marks', comps: ALL4, expect: { pc: ['observe'] } }, { name: 'the marks · after Snowbell', comp: 'nao', flags: F(KO, { sb_arrived: true }) },
      { name: 'Kayo\'s new line', comp: 'mio', flags: F(KO, { lq_kayo_going: true }), quests: { lq_road: 'done' } }] }),
  M({ scene: 'lq.kh_stone', map: 'lq.koharu', at: [21, 13, 'down'], flags: KO, quests: { lq_road: 5 },
    variants: [{ name: 'the names', comps: ALL4, expect: { pc: ['bend'] } }, { name: 'Chigusa\'s name too', comp: 'ren', flags: F(KO, { lq_fare_found: true }), expect: { pc: ['chin'] } }] }),
  M({ scene: 'lq.kh_chest', map: 'lq.koharu_hut', at: [6, 3, 'up'], flags: KO, quests: { lq_road: 6 }, comps: ['mio', 'suzu', 'nao'], expect: { pc: ['kneel', 'present'] } }),
  M({ scene: 'lq.kayo_idle', map: 'lf.gardens', at: [29, 12, 'right'], talk: 'lq_kayo', flags: F(C5, { lq_road_open: true }), comps: ALL4, expect: { lq_kayo: ['point', 'chin', 'nod'] } }),
  M({ scene: 'lq.kayo_idle_after', map: 'lf.gardens', at: [29, 12, 'right'], talk: 'lq_kayo', flags: F(C5, { lf_bell_rung: true }), variants: [{ name: 'Mio', comp: 'mio' }, { name: 'Ren', comp: 'ren' }], expect: { lq_kayo: ['lowered'] } }),
  M({ scene: 'lq.road_kayo_certainly', map: 'lf.gardens', at: [29, 12, 'right'], talk: 'lq_kayo', flags: F(C5, KO), quests: { lq_road: 6 }, comps: ALL4,
    expect: { lq_kayo: ['observe', 'nod', 'fidget'], pc: ['palm'] } }),
  M({ scene: 'lq.road_kayo', map: 'lf.gardens', at: [29, 12, 'right'], talk: 'lq_kayo', flags: F(C5, KO, { lf_bell_rung: true }), quests: { lq_road: 6 },
    variants: [{ name: 'the height marks', picks: [0], comps: ALL4, expect: { lq_kayo: ['lookroad', 'lowered', 'aside', 'nod'] } }, { name: 'Yasu · Mio after her no', picks: [1], comp: 'mio', quests: { lq_road: 6, lf_mio: 'done' }, expect: { lq_kayo: ['celebrate'], comp: ['emphatic'] } },
      { name: 'Yasu · Mio still practising', picks: [1], comp: 'mio' }] }),
  M({ scene: 'lq.road_home', map: 'lq.koharu', at: [21, 10, 'up'], talk: 'lq_kayo', flags: F(KO, { lq_kayo_going: true }), quests: { lq_road: 7 }, comps: ALL4, minLines: 8,
    expect: { lq_kayo: ['shadeeyes', 'pointup', 'celebrate', 'write', 'handover'], pc: ['receive'] } }),
  M({ scene: 'lq.letters_home', map: 'sg.harbor', at: [27, 2, 'down'], flags: F(RD, { sg_arrived: true }),
    variants: [{ name: 'both letters', comps: ['nao', 'ren'] }, { name: 'Tsuru\'s only', comp: 'ren', quests: { lq_fare: 1 } }, { name: 'Kōji\'s only', comp: 'mio', quests: { lq_road: 1 } }], expect: { pc: ['read'] } }),
];

// ---- Deduction cases and their keepsakes (src/content/cases) --------------------------------------------------
const CASES = [
  M({ scene: 'cs.parcel_shelf', map: 'rw.warehouse', at: [6, 3, 'up'], flags: RE,
    variants: [{ name: 'taken · alone', comp: null, picks: [0, 1], expect: { pc: ['bend', 'read', 'check', 'observe'] } }, { name: 'taken', comps: ALL4, flags: RD, picks: [0, 1] },
      { name: 'taken · the record', comp: 'nao', flags: RD, picks: [0, 0] }, { name: 'left', comp: 'mio', flags: RD, picks: [1] }] }),
  M({ scene: 'cs.parcel_oldsite', map: 'sg.harbor', at: [53, 30, 'down'], flags: SC, cases: { parcel: 'open' }, items: { cs_parcel: 1 },
    variants: [{ name: 'left at the post', picks: [0], comps: ALL4, expect: { pc: ['observe', 'present', 'check'] } }, { name: 'kept', picks: [1], comp: 'nao' }, { name: 'without the parcel', comp: 'ren', items: {} }] }),
  M({ scene: 'cs.seto_parcel', map: 'sg.harbor', at: [52, 5, 'right'], talk: 'cs_seto', flags: SC, cases: { parcel: 'open' }, items: { cs_parcel: 1 }, comps: ['mio', 'suzu'],
    expect: { pc: ['present', 'handover', 'receive'], cs_seto: ['receive', 'point', 'palm', 'handover'] } }),
  M({ scene: 'cs.hama_parcel', map: 'sg.harbor', at: [39, 26, 'left'], talk: 'cs_hama', flags: SC, cases: { parcel: 'open' }, items: { cs_parcel: 1 }, minLines: 8,
    variants: [{ name: 'told her', picks: [0], comps: ['nao', 'ren'] }, { name: 'only delivered', picks: [1], comp: 'suzu' }],
    expect: { pc: ['present', 'handover', 'receive'], cs_hama: ['observe', 'point', 'receive', 'present', 'nod', 'handover'] } }),
  M({ scene: 'cs.view_window', map: 'sg.lighthouse', at: [6, 3, 'up'], flags: SC,
    variants: [{ name: 'lent', picks: [0, 1], comps: ALL4, expect: { pc: ['observe', 'receive'], genzo: ['point', 'shake', 'handover', 'present'] } }, { name: 'only looked', picks: [1], comp: 'mio' },
      { name: 'lent already', comp: 'nao', cases: { view: 'open' } }, { name: 'after the case', comp: 'ren', cases: { view: 'done' }, expect: { genzo: ['nod'] } }] }),
  M({ scene: 'cs.shell_shiori', map: 'sg.tidehut', at: [4, 4, 'up'], talk: 'shiori', flags: SE, comps: ['mio', 'nao'], expect: { shiori: ['nod', 'handover'], pc: ['receive', 'check'] } }),
  M({ scene: 'cs.swallow_nobu', map: 'co.pottery', at: [4, 6, 'up'], talk: 'co_nobu', flags: F(C3, { ch3_done: true, co_kiln_open: true }), comps: ['ren', 'suzu'], expect: { co_nobu: ['nod', 'handover'], pc: ['receive', 'check'] } }),
  M({ scene: 'cs.rosette_box', map: 'sb.hoshino', at: [5, 3, 'up'], flags: F(C4, { sb_log_solved: true }),
    variants: [{ name: 'one taken', picks: [0], comps: ['ren', 'mio'], expect: { pc: ['bend', 'check'] } }, { name: 'left', picks: [1], comp: 'nao' }] }),
  M({ scene: 'cs.spool_tokuji', map: 'lf.sluice', at: [16, 11, 'right'], talk: 'lf_tokuji', flags: F(C5, { lf_gate_c: true, lf_bell_rung: true }), comps: ['nao', 'suzu'], expect: { lf_tokuji: ['nod', 'handover'], pc: ['receive', 'check'] } }),
  // the Star Stair's viewpoints (the case of the view): look out, or hold the sketch up either way round
  M({ scene: 'cs.view_west', map: 'sb.obs_path', at: [4, 31, 'left'], flags: C4, cases: { view: 'open' }, items: { cs_sketch: 1 },
    variants: [{ name: 'looked out', picks: [0], comp: 'ren', expect: { pc: ['lookroad'] } }, { name: 'held up as it hung', picks: [1], comp: 'mio', expect: { pc: ['present'] } }, { name: 'held up turned over', picks: [2], comp: 'nao', expect: { pc: ['check'] } }] }),
  M({ scene: 'cs.view_east', map: 'sb.obs_path', at: [14, 33, 'up'], flags: C4, cases: { view: 'open' }, items: { cs_sketch: 1 },
    variants: [{ name: 'looked out', picks: [0], comp: 'suzu', expect: { pc: ['lookroad'] } }, { name: 'held up as it hung', picks: [1], comp: 'ren', expect: { pc: ['present'] } }, { name: 'held up turned over', picks: [2], comp: 'mio', expect: { pc: ['check'] } }] }),
  M({ scene: 'cs.view_seat', map: 'sb.obs_path', at: [10, 37, 'up'], flags: C4, cases: { view: 'open' }, items: { cs_sketch: 1 },
    variants: [{ name: 'looked out', picks: [0], comp: 'mio', expect: { pc: ['lookroad'] } }, { name: 'held up as it hung', picks: [1], comp: 'nao', expect: { pc: ['present'] } },
      { name: 'held up turned over: the match', picks: [2], comp: 'suzu', expect: { pc: ['check'] } }, { name: 'left where it was drawn', picks: [1], comp: 'ren', cases: { view: 'done' }, expect: { pc: ['handover'], comp: ['nod'] } }] }),
];

// ---- Pet vignettes (src/content/pets) ---------------------------------------------------------------------------
// (an invitation opens the naming and travel prompts of !hook pet_meet, which the runner does not answer: the branches
// play "Not now", which carries every cue of the meeting; the invitation itself adds no line)
const PETS = [
  M({ scene: 'pets.cat.cat', map: 'rw.village', at: [15, 24, 'up'], flags: RD,
    variants: [{ name: 'restless · alone', comp: null, flags: RE, expect: { pc: ['observe'] } }, { name: 'restless', comps: ALL4 },
      { name: 'settled · a hand · not now', vars: { pet_cat: 2 }, picks: [0, 1], comps: ALL4, expect: { pc: ['kneel'] } },
      { name: 'settled · sat down · not now', vars: { pet_cat: 2 }, picks: [1, 1], comp: 'suzu' }, { name: 'settled · left be', vars: { pet_cat: 2 }, picks: [2], comp: 'nao' }] }),
  M({ scene: 'pets.cat.screen', map: 'rw.village', at: [14, 24, 'up'], flags: RD,
    variants: [{ name: 'set on its stone', picks: [0], comps: ALL4, expect: { pc: ['observe', 'kneel'] } }, { name: 'tied to the nail', picks: [1], comp: 'mio', expect: { pc: ['stretch'] } },
      { name: 'left', picks: [2], comp: 'ren' }, { name: 'steady · tied', vars: { pet_cat: 2 }, flags: F(RD, { pet_cat_by_cord: true }), comp: 'nao' }, { name: 'steady · on its stone', vars: { pet_cat: 2 }, comp: 'suzu' }] }),
  M({ scene: 'pets.bird.bird', map: 'sg.harbor', at: [45, 27, 'left'], flags: S0, quests: { sg_main: 1 },
    variants: [{ name: 'restless', comps: ALL4, expect: { pc: ['observe'] } }, { name: 'settled · still · not now', vars: { pet_bird: 2 }, picks: [0, 1], comps: ALL4 },
      { name: 'settled · an open palm · not now', vars: { pet_bird: 2 }, picks: [1, 1], comp: 'mio', expect: { pc: ['palm'] } }, { name: 'settled · left be', vars: { pet_bird: 2 }, picks: [2], comp: 'nao' }] }),
  // the dog's corner (co.village 32–33,26) cannot be faced on foot (the barrel, the crate and the wall close off
  // 33,25): its scene is reached from the gate (31,26), which calls it once the gate stays shut, so it is played
  // from the gate's side here (a finding of this pass, in the report)
  M({ scene: 'pets.dog.dog', map: 'co.village', at: [31, 25, 'down'], flags: F(C3, { co_met_sayo: true }),
    variants: [{ name: 'restless', comps: ALL4, expect: { pc: ['observe'] } }, { name: 'settled · a hand · not now', vars: { pet_dog: 2 }, picks: [0, 1], comps: ALL4, expect: { pc: ['kneel'] } },
      { name: 'settled · sat down · not now', vars: { pet_dog: 2 }, picks: [1, 1], comp: 'ren' }, { name: 'settled · left be', vars: { pet_dog: 2 }, picks: [2], comp: 'mio' }] }),
  M({ scene: 'pets.dog.gate', map: 'co.village', at: [31, 25, 'down'], flags: F(C3, { co_met_sayo: true }),
    variants: [{ name: 'the latch loop', picks: [0], comps: ALL4, expect: { pc: ['observe', 'bend'] } }, { name: 'the stop peg', picks: [1], comp: 'nao', at: [30, 26, 'right'], expect: { pc: ['kneel'] } },
      { name: 'left', picks: [2], comp: 'suzu' }, { name: 'shut · the dog not yet met', vars: { pet_dog: 2 }, picks: [2], comp: 'ren' }] }),
  M({ scene: 'pets.tanuki.tanuki', map: 'co.road', at: [6, 4, 'up'], flags: C3,
    variants: [{ name: 'restless', comps: ALL4, expect: { pc: ['observe'] } }, { name: 'settled · waited · not now', vars: { pet_tanuki: 2 }, picks: [0, 1], comps: ALL4 }, { name: 'settled · left be', vars: { pet_tanuki: 2 }, picks: [1], comp: 'nao' }] }),
  M({ scene: 'pets.tanuki.papers', map: 'co.road', at: [5, 5, 'up'], flags: C3,
    variants: [{ name: 'under a flat stone', picks: [0], comps: ALL4, expect: { pc: ['observe', 'kneel'] } }, { name: 'in the rock\'s lee', picks: [1], comp: 'mio', expect: { pc: ['bend'] } }, { name: 'left', picks: [2], comp: 'ren' },
      { name: 'tidy · the tanuki not yet met', vars: { pet_tanuki: 2 }, picks: [1], comp: 'suzu' }] }),
  M({ scene: 'pets.bird.post', map: 'sg.harbor', at: [43, 27, 'up'], flags: S0, quests: { sg_main: 1 },
    variants: [{ name: 'untied', picks: [0], comps: ALL4, expect: { pc: ['observe', 'kneel'] } }, { name: 'tucked in', picks: [1], comp: 'ren', expect: { pc: ['bend'] } }, { name: 'left', picks: [2], comp: 'suzu' },
      { name: 'steady · the bird not yet met', vars: { pet_bird: 2 }, picks: [2], comp: 'mio' }] }),
];

// ---- The Pages We Keep (src/content/pages): the retrospective, the unfinished conversation, the offer ------------
// (in the Hall they begin on arrival, the companion on your own tile in the doorway; elsewhere, the retrospective and
// the unfinished conversation are told wherever you ask for them: the village square stands for "anywhere")
const RETRO = { nao: ['bend', 'palm', 'nod', 'strap'], mio: ['nod', 'tidy'], ren: ['bend', 'palm', 'nod', 'handover'], suzu: ['exhale', 'lowered', 'palm', 'write'] };
const PAGES = [
  M({ scene: 'pages.enter_retro', map: 'rw.hall', at: [5, 8, 'up'], flags: POST, minLines: 8,
    variants: ALL4.map((c) => ({ name: 'now · ' + c, comp: c, picks: [0, 0], expect: { [c]: RETRO[c] } })).concat([{ name: 'later', comp: 'mio', picks: [1], minLines: 2 }]) }),
  M({ scene: 'pages.retro', map: 'rw.village', at: [23, 16, 'up'], flags: POST, minLines: 6, variants: ALL4.map((c) => ({ name: 'in the square · ' + c, comp: c, picks: [1], expect: { [c]: RETRO[c] } })) }),
  M({ scene: 'pages.enter_unfinished', map: 'rw.hall', at: [5, 8, 'up'], flags: POST,
    variants: [{ name: 'now · Nao', comp: 'nao', picks: [0], expect: { nao: ['strap', 'nod'] } }, { name: 'now · Mio', comp: 'mio', picks: [0], expect: { mio: ['laugh', 'fidget', 'thanks'] } }, { name: 'later', comp: 'nao', picks: [1] }] }),
  M({ scene: 'pages.unfinished', map: 'rw.village', at: [23, 16, 'up'], flags: POST, variants: [{ name: 'in the square · Nao', comp: 'nao' }, { name: 'in the square · Mio', comp: 'mio' }] }),
  M({ scene: 'pages.enter_offer', map: 'rw.hall', at: [5, 8, 'up'], flags: F(POST, { atlas_open: true }), minLines: 5,
    variants: [{ name: 'Nao · for whoever walks it next', comp: 'nao', picks: [0], expect: { nao: ['point', 'palm', 'shake', 'lookbetween', 'nod'] } }, { name: 'Nao · for the way back', comp: 'nao', picks: [1], expect: { nao: ['strap'] } },
      { name: 'Mio · resting', comp: 'mio', picks: [0], expect: { mio: ['guard', 'palm', 'touchhair', 'size', 'nod'] } }, { name: 'Mio · sharing', comp: 'mio', picks: [1], expect: { mio: ['emphatic'] } },
      { name: 'Ren · certain', comp: 'ren', picks: [0], expect: { ren: ['palm', 'glasses', 'size'] } }, { name: 'Ren · not certain', comp: 'ren', picks: [1], expect: { ren: ['nod'] } },
      { name: 'Suzu · funny', comp: 'suzu', picks: [0], expect: { suzu: ['size', 'palm', 'shrug', 'celebrate', 'check'] } }, { name: 'Suzu · quiet', comp: 'suzu', picks: [1], expect: { suzu: ['nod'] } },
      { name: 'later', comp: 'ren', picks: [2], minLines: 4 }] }),
];

// ---- The Company (src/content/company): rest-place talks, reflections, rituals, invitations ----------------------
// told wherever you rest or wherever the companion asks: a rest place stands for them (the Gull in Saltglass, facing
// along the room so that you and your companion turn to each other side-on)
const REST = { map: 'sg.inn', at: [6, 6, 'left'], flags: SE };
// a talk with a question and three answers (and "not now"): each answer, one with the closing line of a closer bond
const talk3 = (scene, comp, gs, o) => M(Object.assign({ scene }, REST, { comp, variants: [
  { name: 'answer 1', picks: [0, 0], bond: 6, expect: { [comp]: gs } }, { name: 'answer 2', picks: [0, 1] }, { name: 'answer 3', picks: [0, 2] }, { name: 'not now', picks: [1] }] }, o || {}));
const COMPANY = [
  talk3('co.reflect_travel_nao', 'nao', ['strap', 'palm', 'aside', 'shake', 'nod']),
  talk3('co.reflect_travel_mio', 'mio', ['guard', 'size', 'chin', 'palm', 'nod', 'thanks']),
  talk3('co.reflect_travel_ren', 'ren', ['palm', 'count', 'chin', 'glasses', 'thanks', 'exhale']),
  talk3('co.reflect_travel_suzu', 'suzu', ['size', 'check', 'palm', 'avert', 'celebrate', 'thanks']),
  talk3('co.reflect_keep_nao', 'nao', ['lookbetween', 'check', 'strap', 'palm', 'nod', 'aside'], { flags: F(SE, C5) }),
  talk3('co.reflect_keep_mio', 'mio', ['guard', 'check', 'chin', 'palm', 'laugh'], { flags: F(SE, C5) }),
  talk3('co.reflect_keep_ren', 'ren', ['palm', 'size', 'chin', 'listen', 'thanks', 'tendlamp'], { flags: F(SE, C5) }),
  talk3('co.reflect_keep_suzu', 'suzu', ['lowered', 'size', 'chin', 'palm', 'celebrate'], { flags: F(SE, C5) }),
];
// the rest-place topics: two or three answers each (no "not now": they are chosen from the rest menu)
const topic = (scene, comp, n, gs, o) => M(Object.assign({ scene }, REST, { comp, variants: Array.from({ length: n }, (_, i) => Object.assign({ name: 'answer ' + (i + 1), picks: [i] }, i === 0 ? { expect: { [comp]: gs } } : {})) }, o || {}));
const LATE = F(SE, C5, { ch5_done: true, lq_ally2: true });
COMPANY.push(
  topic('co.t_nao_pier', 'nao', 2, ['aside', 'stretch', 'shrug', 'shake', 'point']),
  topic('co.t_nao_pencil', 'nao', 2, ['palm', 'cupear', 'nod', 'aside']),
  topic('co.t_nao_half', 'nao', 2, ['strap', 'aside', 'palm', 'handover'], { flags: LATE }),
  topic('co.t_nao_back', 'nao', 3, ['palm', 'aside', 'shrug'], { flags: LATE }),
  topic('co.t_mio_sea', 'mio', 2, ['touchhair', 'laugh', 'aside', 'exhale'], { flags: F(SE, { ch3_done: true }) }),
  topic('co.t_mio_tea', 'mio', 2, ['check', 'fidget', 'laugh']),
  topic('co.t_mio_box', 'mio', 2, ['size', 'palm', 'fidget', 'emphatic', 'exhale'], { flags: LATE }),
  topic('co.t_mio_after', 'mio', 3, ['palm', 'chin', 'nod'], { flags: LATE }),
  topic('co.t_ren_stars', 'ren', 2, ['aside', 'count', 'glasses']),
  topic('co.t_ren_polish', 'ren', 2, ['tendlamp', 'observe', 'palm']),
  topic('co.t_ren_alone', 'ren', 2, ['palm', 'chin', 'exhale', 'point']),
  topic('co.t_ren_after', 'ren', 3, ['size', 'chin', 'nod'], { flags: LATE }),
  topic('co.t_suzu_house', 'suzu', 2, ['size', 'laugh', 'palm', 'nod']),
  topic('co.t_suzu_amazake', 'suzu', 2, ['touchhair', 'check', 'celebrate']),
  topic('co.t_suzu_books', 'suzu', 2, ['present', 'lowered', 'avert', 'thanks']),
  topic('co.t_suzu_after', 'suzu', 3, ['size', 'avert', 'nod'], { flags: LATE }),
);
// the rituals at a rest place: the bond changes the closing line; at a camp the narration differs (sa.camp)
const ritual = (scene, comp, gs) => M({ scene, comp, map: 'sg.inn', at: [6, 6, 'left'], flags: SE, expect: { [comp]: gs },
  variants: [{ name: 'at an inn', bond: 0 }, { name: 'at an inn · in rhythm', bond: 3 }, { name: 'at an inn · trusted', bond: 6 }, { name: 'at the camp on the Archive road', map: 'sa.camp', at: [15, 11, 'right'], flags: F(SE, C5, { ch5_done: true }), bond: 6 }] });
COMPANY.push(
  ritual('co.ritual_nao', 'nao', ['lookbetween', 'nod']),
  ritual('co.ritual_mio', 'mio', ['exhale']),
  ritual('co.ritual_ren', 'ren', ['tendlamp', 'palm']),
  ritual('co.ritual_suzu', 'suzu', ['check']),
);
// the invitations: each companion asks; three answers and "not now"; the follow-ups once it is settled
const invite = (scene, extra) => M(Object.assign({ scene }, REST, { variants: [{ name: 'answer 1', picks: [0], comps: ALL4 }, { name: 'answer 2', picks: [1], comps: ALL4 }, { name: 'answer 3', picks: [2], comps: ALL4 }, { name: 'not now', picks: [3], comp: 'mio' }].concat(extra || []) }));
COMPANY.push(
  invite('co.inv_sg_hands'),
  M(Object.assign({ scene: 'co.inv_sg_hands_after' }, REST, { variants: [{ name: 'he spoke for himself', comps: ALL4, flags: F(SE, { sg_wataru_self: true }) }, { name: 'we told her', comps: ALL4 }] })),
  invite('co.inv_co_fire', [{ name: 'answer 2 · after Suzu\'s truth', picks: [1], comp: 'suzu', quests: { co_suzu: 1 } }]),
  M(Object.assign({ scene: 'co.inv_co_fire_after' }, REST, { comps: ALL4, flags: F(SE, C3, { co_restored: true }) })),
  invite('co.inv_lf_word'),
  M(Object.assign({ scene: 'co.inv_lf_word_after' }, REST, { comps: ALL4, flags: F(SE, { lf_bell_rung: true }) })),
);

export const MISC = [...FARE, ...ROAD, ...CASES, ...PETS, ...PAGES, ...COMPANY];
