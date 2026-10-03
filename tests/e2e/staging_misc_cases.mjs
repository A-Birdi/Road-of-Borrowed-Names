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
];

export const MISC = [...FARE, ...ROAD, ...CASES];
