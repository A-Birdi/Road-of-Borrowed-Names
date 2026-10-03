// Fixtures for the staged scenes of Chapters 5 and 6 (docs/expressive/SCENES.md "Performed overworld"; the notes
// are docs/expressive/reports/staging_ch5_ch6.md). One entry per scene, in the same shape as
// tests/e2e/staging_ch12_cases.mjs: where it plays (map, where you stand and face), who travels with you, the flags,
// quests, items, words and scenes already seen (`seen`) that the moment needs, and the branches worth playing
// (choice picks in order, companions, flags, a challenge or activity that is not passed). Played by
// tests/e2e/staging_runner.mjs through tests/e2e/staging_chapters.mjs --ch=5 / --ch=6.
//   { ch, scene, map, at: [x, y, dir], comp, talk, flags, quests, items, words, vars, player, seen, fail,
//     variants: [{ name, picks, comp, comps, flags, items, quests, seen, at, fail, … }], comps, expect }
const ALL4 = ['nao', 'mio', 'ren', 'suzu'];
const F = (...objs) => Object.assign({}, ...objs);

// ---- Chapter 5: Lanternfall -------------------------------------------------------------------------------
const L0 = { rw_arrived: true, departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true };
const LA = F(L0, { lf_arrived: true }); // on the Lantern Road
const LT = F(LA, { lf_town_intro: true }); // in town, before the bell
const LB = F(LT, { lf_ledger_seen: true, lf_akari_key: true, lf_yae_told: true, lf_tokuji_told: true, lf_tokuji_boat: true, lf_tower_entered: true, lf_gate_a: true, lf_gate_b: true, lf_gate_c: true, lf_koe: true, lf_boss_done: true, lf_bell_rung: true }); // after the bell
const LD = F(LB, { lf_after_town: true, ch5_done: true }); // the chapter done
const LP = F(LD, { sa_arrived: true, ch6_done: true, sa_done: true, post: true, postgame: true }); // after the ending
const CH5 = [
  // 20_town.js
  { ch: 5, scene: 'lf.arrive', map: 'lf.road', at: [2, 13, 'right'], flags: L0, comps: ALL4, minLines: 4, expect: { pc: ['lookroad', 'shadeeyes', 'point'] } },
  { ch: 5, scene: 'lf.road_bench', map: 'lf.road', at: [17, 14, 'down'], flags: LA, comps: ALL4, expect: { pc: ['lookroad'] } },
  { ch: 5, scene: 'lf.road_lantern', map: 'lf.road', at: [23, 11, 'up'], flags: LA, expect: { pc: ['observe'] },
    variants: [{ name: 'blank · ren', comp: 'ren', expect: { comp: ['observe'] } }, { name: 'blank · nao', comp: 'nao' }, { name: 'lit', comp: 'mio', flags: LD }] },
  { ch: 5, scene: 'lf.road_north_locked', map: 'lf.road', at: [24, 1, 'up'], flags: LA, variants: [{ name: 'at the left of the gap', comps: ALL4 }, { name: 'at the right', at: [25, 1, 'up'], comp: 'ren' }], expect: { pc: ['lookroad'] } },
  { ch: 5, scene: 'lf.town_intro', map: 'lf.town', at: [2, 17, 'right'], flags: LA, comps: ALL4, minLines: 12,
    expect: { lf_hayato: ['palm', 'present', 'stamp', 'handover', 'chin'], pc: ['observe', 'receive', 'point'] } },
  { ch: 5, scene: 'lf.board', map: 'lf.town', at: [26, 18, 'up'], flags: LT, expect: { pc: ['observe'] },
    variants: [{ name: 'before the bell', comps: ALL4, expect: { pc: ['lookbetween'] } }, { name: 'after the bell', comp: 'nao', flags: LB }] },
  { ch: 5, scene: 'lf.bench_canal', map: 'lf.town', at: [48, 32, 'down'], flags: LT, comps: ALL4, expect: { pc: ['cupear'] } },
  { ch: 5, scene: 'lf.nagi', map: 'lf.town', at: [13, 17, 'down'], talk: 'lf_nagi', flags: LT, expect: { lf_nagi: ['tendlamp'] },
    variants: [{ name: 'first · ren', comp: 'ren', expect: { lf_nagi: ['point', 'glance'], comp: ['chin'] } }, { name: 'first · mio', comp: 'mio' }, { name: 'again', comp: 'nao', seen: ['lf.nagi'] }] },
  { ch: 5, scene: 'lf.kei', map: 'lf.town', at: [17, 25, 'left'], talk: 'lf_kei', flags: LT, comps: ALL4, minLines: 5, expect: { lf_kei: ['peek', 'shake', 'shrug', 'point'] } },
  { ch: 5, scene: 'lf.shu', map: 'lf.gardens', at: [8, 18, 'down'], talk: 'lf_shu', flags: LT, variants: [{ name: 'mio', comp: 'mio', expect: { comp: ['observe'] } }, { name: 'ren', comp: 'ren' }], expect: { lf_shu: ['brow', 'size', 'lowered'], pc: ['palm'] } },
  { ch: 5, scene: 'lf.setsu', map: 'lf.inn', at: [2, 5, 'up'], talk: 'lf_setsu', flags: LT, comp: 'nao', variants: [{ name: 'rest', picks: [0], expect: { lf_setsu: ['palm', 'laugh'] } }, { name: 'all right', picks: [1] }], expect: { pc: ['lookroad'] } },
  { ch: 5, scene: 'lf.setsu_after', map: 'lf.inn', at: [2, 5, 'up'], talk: 'lf_setsu', flags: LB, comp: 'ren', variants: [{ name: 'rest', picks: [0] }, { name: 'another time', picks: [1] }], expect: { lf_setsu: ['celebrate', 'palm'] } },
  { ch: 5, scene: 'lf.setsu_post', map: 'lf.inn', at: [2, 5, 'up'], talk: 'lf_setsu', comp: 'suzu', flags: LP, picks: [1],
    variants: [{ name: 'Kasane tried', flags: F(LP, { end_kasane_trial: true }), expect: { lf_setsu: ['palm', 'lookroad'] } }, { name: 'Kasane the keeper', flags: F(LP, { end_kasane_keeper: true }), picks: [0] }] },
  { ch: 5, scene: 'lf.ritsu', map: 'lf.cafe', at: [2, 4, 'up'], talk: 'lf_ritsu', flags: LT,
    variants: [{ name: 'helped · suzu', comp: 'suzu', picks: [0], expect: { lf_ritsu: ['laugh', 'present'], comp: ['chin', 'check'] } }, { name: 'helped · mio', comp: 'mio', picks: [0] }, { name: 'another time', comp: 'nao', picks: [1] }, { name: 'orders muddled', comp: 'ren', picks: [0], fail: true }],
    expect: { lf_ritsu: ['fidget', 'palm'] } },
  { ch: 5, scene: 'lf.ritsu_after', map: 'lf.cafe', at: [2, 4, 'up'], talk: 'lf_ritsu', flags: LB, comp: 'mio', variants: [{ name: 'help', picks: [0] }, { name: 'another time', picks: [1] }], expect: { lf_ritsu: ['celebrate', 'palm'] } },
  { ch: 5, scene: 'lf.ritsu_post', map: 'lf.cafe', at: [2, 4, 'up'], talk: 'lf_ritsu', flags: LP, comp: 'ren', picks: [1], expect: { lf_ritsu: ['laugh'] } },
  { ch: 5, scene: 'lf.masaru', map: 'lf.bakery', at: [4, 4, 'up'], talk: 'lf_masaru', flags: LT, comps: ALL4, minLines: 6, expect: { lf_masaru: ['laugh', 'count', 'knead'], pc: ['observe'] } },
  { ch: 5, scene: 'lf.masaru_after', map: 'lf.bakery', at: [4, 4, 'up'], talk: 'lf_masaru', flags: LB, comp: 'suzu', expect: { lf_masaru: ['laugh', 'knead'] } },
  { ch: 5, scene: 'lf.masaru_post', map: 'lf.bakery', at: [4, 4, 'up'], talk: 'lf_masaru', comp: 'nao', flags: LP,
    variants: [{ name: 'Kasane tried', flags: F(LP, { end_kasane_trial: true }) }, { name: 'otherwise' }], expect: { lf_masaru: ['count', 'laugh'] } },
  { ch: 5, scene: 'lf.memorial', map: 'lf.sluice', at: [10, 11, 'up'], flags: LT, expect: { pc: ['observe', 'kneel'] },
    variants: [{ name: 'before the bell', comps: ALL4 }, { name: 'the names back', comp: 'mio', flags: LB, expect: { comp: ['kneel'] } }] },
];

export const CH56 = [...CH5];
