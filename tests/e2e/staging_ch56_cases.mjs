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
const LW = F(LT, { lf_yae_told: true, lf_tokuji_told: true, lf_tokuji_boat: true, lf_tower_entered: true }); // in the bell tower
const LM = F(LW, { lf_up_closed: true, lf_gate_a: true, lf_mid_seen: true, lf_shortcut: true }); // the gate works
const LL = F(LM, { lf_gate_b: true, lf_low_seen: true }); // the drowned stair
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
  // 22_main.js
  { ch: 5, scene: 'lf.tadashi', map: 'lf.records', at: [7, 5, 'up'], talk: 'lf_tadashi', flags: LT,
    variants: [{ name: 'the form', comps: ALL4, quests: { lf_main: 0 }, expect: { lf_tadashi: ['nod', 'present', 'stamp', 'palm'], pc: ['observe'] } },
      { name: 'the slip in hand', comp: 'nao', quests: { lf_main: 1 }, items: { lf_request_slip: 1 }, expect: { lf_tadashi: ['palm'] } },
      { name: 'the ledger read', comp: 'mio', quests: { lf_main: 2 }, flags: F(LT, { lf_ledger_seen: true }), expect: { lf_tadashi: ['aside'], pc: ['palm'] } },
      { name: 'the ledger read · the key had', comp: 'ren', quests: { lf_main: 3 }, flags: F(LT, { lf_ledger_seen: true, lf_akari_key: true }) },
      { name: 'later', comp: 'suzu', quests: { lf_main: 5 }, expect: { lf_tadashi: ['halfraise'] } },
      { name: 'after Mio refused', comp: 'nao', quests: { lf_main: 5 }, flags: F(LT, { lf_mio_done: true }), expect: { lf_tadashi: ['chin', 'read'] } }] },
  { ch: 5, scene: 'lf.tadashi_after', map: 'lf.records', at: [7, 5, 'up'], talk: 'lf_tadashi', flags: LB,
    variants: [{ name: 'first', comps: ALL4, expect: { lf_tadashi: ['exhale', 'stamp'] } }, { name: 'again', comp: 'mio', seen: ['lf.tadashi_after'], expect: { lf_tadashi: ['palm', 'exhale'] } }] },
  { ch: 5, scene: 'lf.records_ledger', map: 'lf.records', at: [2, 7, 'down'], flags: LT, quests: { lf_main: 1 },
    variants: [{ name: 'with the slip', comps: ALL4, items: { lf_request_slip: 1 }, expect: { pc: ['read', 'observe'] } }, { name: 'no permit', comp: 'nao', expect: { pc: ['observe'] } }] },
  { ch: 5, scene: 'lf.akari_letters', map: 'lf.clerks', at: [5, 5, 'up'], talk: 'akari', flags: LT, quests: { lf_main: 2 }, expect: { akari: ['lowered', 'guard', 'fidget'], pc: ['observe'] },
    variants: [{ name: 'after Snowbell', comps: ALL4, expect: { akari: ['flinch'] } }, { name: 'before Snowbell', comp: 'mio', flags: F(LT, { ch4_done: false }), expect: { akari: ['lookroad'] } },
      { name: 'with Hoshino\'s letter', comp: 'ren', items: { sb_reply_letter: 1 }, flags: F(LT, { sb_hoshino_goes: true }), expect: { akari: ['receive', 'read'] } }] },
  { ch: 5, scene: 'lf.akari_reply', map: 'lf.clerks', at: [5, 5, 'up'], talk: 'akari', flags: LT, quests: { lf_main: 2, lf_akari: 0 }, items: { sb_reply_letter: 1 },
    expect: { akari: ['flinch', 'observe', 'receive', 'read', 'present', 'guard'], pc: ['present', 'handover'] },
    variants: [{ name: 'he goes · nao', comp: 'nao', flags: F(LT, { sb_hoshino_goes: true }) }, { name: 'both · mio', comp: 'mio', flags: F(LT, { sb_hoshino_both: true }) }, { name: 'he stays · ren', comp: 'ren' }, { name: 'he stays · suzu', comp: 'suzu' }] },
  { ch: 5, scene: 'lf.akari_hint', map: 'lf.clerks', at: [5, 5, 'up'], talk: 'akari', flags: LT, expect: { akari: ['guard', 'avert', 'present', 'handover'], pc: ['receive'] },
    variants: [{ name: 'the letters heard', comps: ALL4, quests: { lf_main: 2, lf_akari: 0 } }, { name: 'first the letters', comp: 'nao', quests: { lf_main: 2 } }] },
  { ch: 5, scene: 'lf.akari_letter', map: 'lf.clerks', at: [5, 5, 'up'], talk: 'akari', flags: LB, quests: { lf_akari: 1 }, expect: { akari: ['palm', 'avert', 'thanks'] },
    variants: [{ name: 'the reply had · he goes · nao', comp: 'nao', flags: F(LB, { lf_akari_got_reply: true, sb_hoshino_goes: true }), expect: { akari: ['handover'], comp: ['receive'] } },
      { name: 'both · mio', comp: 'mio', flags: F(LB, { lf_akari_got_reply: true, sb_hoshino_both: true }) }, { name: 'he stays · ren', comp: 'ren', flags: F(LB, { lf_akari_got_reply: true }) }, { name: 'no reply · suzu', comp: 'suzu' }] },
  { ch: 5, scene: 'lf.akari_post', map: 'lf.clerks', at: [5, 5, 'up'], talk: 'akari', flags: LP, expect: { akari: ['present'] },
    variants: [{ name: 'he went', comp: 'nao', flags: F(LP, { sb_hoshino_goes: true }) }, { name: 'he stayed', comp: 'suzu' }] },
  { ch: 5, scene: 'lf.stacks_enter', map: 'lf.stacks', at: [2, 3, 'down'], flags: F(LT, { lf_stacks_open: true }), quests: { lf_main: 3 }, comps: ALL4, expect: { pc: ['lookroad', 'cupear'] } },
  { ch: 5, scene: 'lf.minutes_chest', map: 'lf.stacks', at: [21, 3, 'up'], flags: F(LT, { lf_stacks_open: true }), quests: { lf_main: 3 }, comps: ALL4, expect: { pc: ['kneel', 'read'] } },
  { ch: 5, scene: 'lf.conduit', map: 'lf.stacks', at: [21, 7, 'right'], flags: F(LT, { lf_stacks_open: true }), quests: { lf_main: 3 }, expect: { pc: ['observe'] },
    variants: [{ name: 'first', comps: ALL4, expect: { pc: ['cupear', 'bend'] } }, { name: 'again', comp: 'nao', flags: F(LT, { lf_stacks_open: true, lf_conduit_seen: true }) }] },
  { ch: 5, scene: 'lf.yae', map: 'lf.council', at: [7, 3, 'left'], talk: 'lf_yae', flags: LT, quests: { lf_main: 2 }, comps: ['mio', 'suzu', 'nao'], expect: { lf_yae: ['palm', 'chin', 'nod', 'aside'] } },
  { ch: 5, scene: 'lf.yae_minutes', map: 'lf.council', at: [7, 3, 'left'], talk: 'lf_yae', flags: LT, quests: { lf_main: 4 }, items: { lf_minutes: 1 }, comps: ALL4, minLines: 15,
    expect: { lf_yae: ['receive', 'read', 'lowered', 'aside', 'palm', 'laugh'], pc: ['handover'] } },
  { ch: 5, scene: 'lf.tokuji_early', map: 'lf.sluice', at: [18, 11, 'left'], talk: 'lf_tokuji', flags: LT, quests: { lf_main: 2 }, comps: ALL4, expect: { lf_tokuji: ['lookroad'] } },
  { ch: 5, scene: 'lf.tokuji_story', map: 'lf.sluice', at: [18, 11, 'left'], talk: 'lf_tokuji', flags: F(LT, { lf_yae_told: true }), quests: { lf_main: 5 }, items: { lf_minutes: 1 }, comps: ALL4, minLines: 12,
    expect: { lf_tokuji: ['observe', 'lowered', 'present', 'handover', 'nod', 'folded', 'flinch'], pc: ['present', 'receive', 'wave'] } },
  { ch: 5, scene: 'lf.tokuji_post', map: 'lf.sluice', at: [18, 11, 'left'], talk: 'lf_tokuji', flags: LP,
    variants: [{ name: 'Kasane came', comp: 'nao', flags: F(LP, { end_kasane_trial: true }), expect: { lf_tokuji: ['lookroad'] } }, { name: 'the memories back', comp: 'ren', flags: F(LP, { end_mem_return: true, end_kasane_keeper: true }), expect: { lf_tokuji: ['nod'] } }] },
  { ch: 5, scene: 'lf.yae_after', map: 'lf.council', at: [7, 3, 'left'], talk: 'lf_yae', flags: F(LB, { lf_after_town: true }), quests: { lf_main: 7 },
    variants: [{ name: 'the council back', comps: ALL4, minLines: 14, expect: { lf_yae: ['emphatic', 'celebrate', 'present'], lf_tadashi: ['glasses', 'emphatic'], lf_masaru: ['celebrate'] } }, { name: 'later', comp: 'mio', flags: LD, expect: { lf_yae: ['laugh'] } }] },
  { ch: 5, scene: 'lf.after_town', map: 'lf.town', at: [39, 38, 'up'], flags: LB, comps: ALL4, minLines: 8, expect: { pc: ['lookroad', 'cupear'], lf_masaru: ['flinch'], lf_kohei: ['listen'] } },
  // 24_tower.js
  { ch: 5, scene: 'lf.tower_arrive', map: 'lf.tower_top', at: [7, 9, 'up'], flags: F(LT, { lf_yae_told: true, lf_tokuji_told: true, lf_tokuji_boat: true }), quests: { lf_main: 6 }, comps: ALL4, expect: { pc: ['observe', 'cupear'] } },
  { ch: 5, scene: 'lf.roster', map: 'lf.tower_top', at: [2, 3, 'up'], flags: LW, comps: ALL4, expect: { pc: ['observe', 'bend'] } },
  { ch: 5, scene: 'lf.wheel_upper', map: 'lf.tower_upper', at: [3, 5, 'left'], flags: LW, comp: 'nao',
    variants: [{ name: 'turn it', picks: [0], expect: { pc: ['observe', 'bend'] } }, { name: 'leave it', picks: [1] }, { name: 'closed already', flags: F(LW, { lf_up_closed: true }) }] },
  { ch: 5, scene: 'lf.wheel_lower', map: 'lf.tower_upper', at: [16, 9, 'right'], flags: F(LW, { lf_up_closed: true }),
    variants: [{ name: 'turned', picks: [0], comps: ALL4, expect: { pc: ['observe', 'bend', 'lookroad'] } }, { name: 'left', picks: [1], comp: 'mio', expect: { pc: ['observe'] } },
      { name: 'stuck · plate unread', picks: [0], comp: 'nao', flags: LW }, { name: 'stuck · plate read', picks: [0], comps: ALL4, flags: F(LW, { lf_plate_a_read: true }) }, { name: 'open already', comp: 'ren', flags: F(LW, { lf_up_closed: true, lf_gate_a: true }), expect: { pc: ['lookroad'] } }] },
  { ch: 5, scene: 'lf.mid_enter', map: 'lf.tower_mid', at: [10, 2, 'down'], flags: F(LW, { lf_up_closed: true, lf_gate_a: true }), comps: ALL4, expect: { pc: ['observe', 'lookroad', 'bend'] } },
  { ch: 5, scene: 'lf.east_door', map: 'lf.tower_mid', at: [19, 8, 'right'], flags: LM, expect: { pc: ['observe'] },
    variants: [{ name: 'open it', picks: [0], comp: 'nao', expect: { pc: ['bend'] } }, { name: 'leave it shut', picks: [1], comp: 'mio' },
      { name: 'shut it again', picks: [0], comp: 'ren', flags: F(LM, { lf_east_open: true }) }, { name: 'drained · seal it', picks: [0], comps: ALL4, flags: F(LM, { lf_east_open: true, lf_mid_drained: true }) },
      { name: 'drained · leave it open', picks: [1], comp: 'suzu', flags: F(LM, { lf_east_open: true, lf_mid_drained: true }) }, { name: 'barred', comp: 'nao', flags: F(LM, { lf_gate_b: true }) }] },
  { ch: 5, scene: 'lf.west_plug', map: 'lf.tower_mid', at: [2, 8, 'left'], flags: LM, expect: { pc: ['observe'] },
    variants: [{ name: 'pulled', picks: [0], comp: 'mio', flags: F(LM, { lf_east_open: true }), expect: { pc: ['bend', 'lookroad'] } }, { name: 'stuck · plate unread', picks: [0], comp: 'nao' },
      { name: 'stuck · plate read', picks: [0], comp: 'ren', flags: F(LM, { lf_plate_b_read: true }) }, { name: 'leave it', picks: [1], comp: 'suzu' }, { name: 'out already', comp: 'nao', flags: F(LM, { lf_east_open: true, lf_mid_drained: true }) }] },
  { ch: 5, scene: 'lf.water_returns', map: 'lf.tower_mid', at: [10, 10, 'down'], flags: F(LM, { lf_east_open: true, lf_mid_drained: true }), comps: ALL4, expect: { pc: ['flinch', 'lookroad'] } },
  { ch: 5, scene: 'lf.junction', map: 'lf.tower_mid', at: [18, 4, 'right'], flags: LM, expect: { pc: ['cupear'] },
    variants: [{ name: 'first', comps: ALL4, expect: { pc: ['observe', 'lookroad', 'receive'] } }, { name: 'again', comp: 'mio', flags: F(LM, { lf_koe: true }) }] },
  { ch: 5, scene: 'lf.low_enter', map: 'lf.tower_low', at: [10, 2, 'down'], flags: LL, comps: ALL4, expect: { pc: ['lookroad', 'listen'] } },
  { ch: 5, scene: 'lf.south_plug', map: 'lf.tower_low', at: [3, 14, 'left'], flags: LL, comp: 'nao', expect: { pc: ['observe'] },
    variants: [{ name: 'pulled', picks: [0], expect: { pc: ['bend', 'lookroad'] } }, { name: 'leave it', picks: [1] }, { name: 'out already', flags: F(LL, { lf_south_pulled: true }) }] },
  { ch: 5, scene: 'lf.north_plug', map: 'lf.tower_low', at: [15, 3, 'right'], flags: LL, expect: { pc: ['observe'] },
    variants: [{ name: 'pulled', picks: [0], comps: ALL4, flags: F(LL, { lf_south_pulled: true }), expect: { pc: ['bend', 'lookroad'] } }, { name: 'too soon', picks: [0], comps: ALL4, expect: { pc: ['flinch', 'brow'] } },
      { name: 'leave it', picks: [1], comp: 'mio' }, { name: 'out already', comp: 'ren', flags: F(LL, { lf_south_pulled: true, lf_gate_c: true }) }] },
  { ch: 5, scene: 'lf.waterline', map: 'lf.tower_low', at: [14, 6, 'up'], flags: LL, comps: ALL4, expect: { pc: ['observe'] } },
  { ch: 5, scene: 'lf.boss_intro', map: 'lf.bellhall', at: [8, 5, 'down'], flags: F(LL, { lf_south_pulled: true, lf_gate_c: true }), quests: { lf_main: 7 }, comps: ALL4, minLines: 4, expect: { pc: ['flinch', 'observe'] } },
  { ch: 5, scene: 'lf.tower_key', map: 'lf.bellhall', at: [9, 3, 'up'], flags: F(LL, { lf_south_pulled: true, lf_gate_c: true, lf_boss_done: true }), comps: ALL4, expect: { pc: ['observe', 'bend'] } },
];

export const CH56 = [...CH5];
