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

export const MISC = [...FARE];
