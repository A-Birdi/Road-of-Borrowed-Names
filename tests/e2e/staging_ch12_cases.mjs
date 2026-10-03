// Fixtures for the staged scenes of Chapters 1 and 2 (docs/expressive/SCENES.md "Performed overworld"; the notes
// are docs/expressive/reports/staging_ch1_ch2.md). One entry per scene: where it plays (map, where you stand and
// face), who travels with you, the flags, quests, items and words the moment needs, and the branches worth
// playing (choice picks in order, companions, flags, a challenge or activity that is not passed). Played by
// tests/e2e/staging_runner.mjs.
//   { ch, scene, map, at: [x, y, dir], comp, talk (the person you talk to: they turn to you), flags, quests,
//     items, words, vars, player, prov, fail,
//     variants: [{ name, picks: [i, …], comp, comps: [...], flags, items, quests, at, fail, … }], comps: [...],
//     expect: { who: [gestures cued] } }
const ALL4 = ['nao', 'mio', 'ren', 'suzu'];
const F = (...objs) => Object.assign({}, ...objs);
// ---- Chapter 1: Reedwake -------------------------------------------------------------------------------------
const R0 = { rw_arrived: true, rw_road_lit: true };
const R1 = F(R0, { rw_met_tsuru: true });
const R5 = F(R1, { rw_bottles_done: true, rw_letters_done: true, rw_lanterns_done: true, rw_suzu_told: true, rw_hana_cups: true, rw_met_nao: true, rw_met_ren: true, rw_met_suzu: true, rw_lantern_s: true, rw_lantern_b: true });
const RM = F(R5, { rw_mill_open: true }); // the mill road open
const RE = F(RM, { rw_mr_mio: true, rw_mr_nao: true, rw_mr_ren: true, rw_mr_suzu: true, rw_gears: true, rw_loft_done: true, rw_echo_done: true, bridge_fixed: true, rw_koji_back: true });
const RH = F(RE, { rw_evening: true, rw_night: true }); // the evening of the Lantern Hall
const RD = F(RE, { departed: true, ch1_done: true });
const CH1 = [
  { ch: 1, scene: 'rw.arrive', map: 'rw.road', at: [3, 9, 'right'], flags: {}, variants: [{ name: 'courier', player: { bg: 'courier' } }, { name: 'craft', player: { bg: 'craft' } }, { name: 'student', player: { bg: 'student' } }], expect: { pc: ['lookroad'] } },
  { ch: 1, scene: 'rw.tsuru_first', map: 'rw.village', at: [21, 16, 'up'], talk: 'tsuru', flags: R0, items: { rw_letter: 1 }, variants: [{ name: 'letter · help', picks: [0, 0] }, { name: 'wrote · what', picks: [1, 1] }], expect: { tsuru: ['point', 'receive', 'shake'], pc: ['handover'] } },
  { ch: 1, scene: 'rw.tsuru_hint', map: 'rw.village', at: [21, 16, 'up'], talk: 'tsuru', flags: R1, quests: { rw_labels: 1 }, variants: [{ name: 'nobody yet', expect: { tsuru: ['point'] } }, { name: 'only Hana left', flags: F(R5, { rw_hana_cups: false }) }, { name: 'all heard: the report', flags: R5 }] },
  { ch: 1, scene: 'rw.tsuru_report', map: 'rw.village', at: [21, 16, 'up'], talk: 'tsuru', flags: R5, quests: { rw_labels: 1 }, expect: { tsuru: ['listen', 'point'], pc: ['palm'] } },
  { ch: 1, scene: 'rw.mio_first', map: 'rw.apoth', at: [5, 4, 'up'], talk: 'mio', flags: R1, quests: { rw_labels: 0 }, variants: [{ name: 'labels written', expect: { mio: ['tidy', 'thanks', 'handover'], pc: ['receive'] } }, { name: 'later', fail: true }, { name: 'from her side', at: [4, 3, 'right'] }], expect: { mio: ['guard'] } },
  { ch: 1, scene: 'rw.nao_first', map: 'rw.warehouse', at: [4, 4, 'right'], talk: 'nao', flags: R1, quests: { rw_labels: 0 }, variants: [{ name: 'sorted', player: { bg: 'student' } }, { name: 'a courier', player: { bg: 'courier' }, expect: { nao: ['observe'] } }, { name: 'later', fail: true }], expect: { nao: ['point', 'present'] } },
  { ch: 1, scene: 'rw.ren_first', map: 'rw.village', at: [31, 20, 'up'], talk: 'ren', flags: R1, expect: { ren: ['glasses', 'observe', 'handover'], pc: ['observe', 'receive'] } },
  { ch: 1, scene: 'rw.ren_lanterns_done', map: 'rw.village', at: [20, 23, 'up'], flags: F(R1, { rw_met_ren: true, rw_lantern_s: true, rw_lantern_b: true }), variants: [{ name: 'at the south lantern' }, { name: 'at the bridge lantern', at: [32, 19, 'up'] }], expect: { ren: ['observe', 'point', 'nod'] } },
  { ch: 1, scene: 'rw.suzu_first', map: 'rw.village', at: [18, 20, 'up'], talk: 'suzu', flags: R1, expect: { suzu: ['size', 'avert', 'point'], mame: ['point'] } },
  { ch: 1, scene: 'rw.mr_sae', map: 'rw.millroad', at: [15, 24, 'up'], talk: 'sae', flags: RM, quests: { rw_mill: 0 }, expect: { sae: ['recoil', 'lowered'], mio: ['kneel'] } },
  { ch: 1, scene: 'rw.mr_mio', map: 'rw.millroad', at: [14, 24, 'up'], talk: 'mio', flags: RM, quests: { rw_mill: 0 }, expect: { mio: ['handover', 'palm'], sae: ['receive', 'avert'] } },
  { ch: 1, scene: 'rw.mr_nao', map: 'rw.millroad', at: [11, 20, 'up'], talk: 'nao', flags: RM, quests: { rw_mill: 1 },
    variants: [{ name: 'told · reeds cleared', picks: [0], expect: { nao: ['point', 'kneel'] } }, { name: 'told · the narrows', picks: [1] }, { name: 'read the reeds · cleared', flags: F(RM, { rw_mr_obs_reeds: true }), picks: [0, 0], expect: { nao: ['nod', 'lookbetween', 'kneel'] } }, { name: 'took them for reeds · narrows', flags: F(RM, { rw_mr_obs_reeds: true }), picks: [1, 1] }] },
  { ch: 1, scene: 'rw.mr_suzu_talk', map: 'rw.millroad', at: [5, 19, 'up'], talk: 'suzu', flags: RM, quests: { rw_mill: 1 },
    variants: [{ name: 'sing', picks: [0], expect: { suzu: ['point', 'size', 'palm', 'celebrate'] } }, { name: 'ask, then sing', picks: [1] }, { name: 'heard the echo · read it', flags: F(RM, { rw_mr_obs_echo: true }), picks: [0, 0] }] },
  { ch: 1, scene: 'rw.m1_gears', map: 'rw.mill1', at: [10, 3, 'up'], flags: RM, quests: { rw_mill: 1 }, variants: [{ name: 'with the pin', items: { rw_wheel_pin: 1 }, expect: { pc: ['observe', 'handover', 'listen', 'flinch'] } }, { name: 'no pin' }] },
  { ch: 1, scene: 'rw.m0_chest', map: 'rw.mill0', at: [13, 4, 'up'], flags: F(RM, { rw_gears: true }), expect: { pc: ['kneel'] } },
  { ch: 1, scene: 'rw.m1_boss', map: 'rw.mill1', at: [6, 7, 'up'], flags: F(RM, { rw_mr_mio: true, rw_gears: true, rw_loft_done: true }), quests: { rw_mill: 3 }, minLines: 4,
    variants: [{ name: 'knows mizu', words: ['mizu'] }, { name: 'remembers mizu', expect: { pc: ['chin'] } }], expect: { pc: ['listen', 'flinch', 'lookroad'] } },
  { ch: 1, scene: 'rw.hall_gather', map: 'rw.hall', at: [5, 8, 'up'], flags: RH, quests: { rw_depart: 0 }, expect: { tsuru: ['point', 'count'], nao: ['lookbetween'] } },
  { ch: 1, scene: 'rw.hall_nao', map: 'rw.hall', at: [3, 5, 'left'], talk: 'nao', flags: F(RH, { rw_hall_gather: true }), quests: { rw_depart: 0 },
    variants: [{ name: 'asked', picks: [0], expect: { nao: ['point', 'strap', 'nod'] } }, { name: 'not yet', picks: [1] }, { name: 'chosen · reconsider', prov: 'nao', picks: [0] }, { name: 'chosen · go together', prov: 'nao', picks: [1] }] },
  { ch: 1, scene: 'rw.hall_mio', map: 'rw.hall', at: [7, 5, 'right'], talk: 'mio', flags: F(RH, { rw_hall_gather: true }), quests: { rw_depart: 0 },
    variants: [{ name: 'asked', picks: [0], expect: { mio: ['fidget', 'laugh', 'nod'] } }, { name: 'not yet', picks: [1] }, { name: 'chosen · reconsider', prov: 'mio', picks: [0], expect: { mio: ['size', 'shake'] } }, { name: 'chosen · go together', prov: 'mio', picks: [1] }] },
  { ch: 1, scene: 'rw.hall_ren', map: 'rw.hall', at: [4, 7, 'left'], talk: 'ren', flags: F(RH, { rw_hall_gather: true }), quests: { rw_depart: 0 },
    variants: [{ name: 'asked', picks: [0], expect: { ren: ['count', 'glasses', 'bow'] } }, { name: 'not yet', picks: [1] }, { name: 'chosen · reconsider', prov: 'ren', picks: [0], expect: { ren: ['point', 'nod'] } }, { name: 'chosen · go together', prov: 'ren', picks: [1] }] },
  { ch: 1, scene: 'rw.hall_suzu', map: 'rw.hall', at: [5, 7, 'right'], talk: 'suzu', flags: F(RH, { rw_hall_gather: true }), quests: { rw_depart: 0 },
    variants: [{ name: 'asked', picks: [0], expect: { suzu: ['size', 'palm', 'avert', 'nod'] } }, { name: 'not yet', picks: [1] }, { name: 'chosen · reconsider', prov: 'suzu', picks: [0], expect: { suzu: ['laugh'] } }, { name: 'chosen · go together', prov: 'suzu', picks: [1] }] },
  { ch: 1, scene: 'rw.hall_shrine', map: 'rw.hall', at: [4, 3, 'up'], flags: F(RH, { rw_hall_gather: true }), quests: { rw_depart: 0 },
    variants: [{ name: 'Nao chosen · set out', prov: 'nao', picks: [0], minLines: 8, expect: { pc: ['observe', 'write'], nao: ['nod'] } }, { name: 'Ren chosen · set out', prov: 'ren', picks: [0], minLines: 8, expect: { ren: ['bow'] } }, { name: 'Mio chosen · not yet', prov: 'mio', picks: [1] }, { name: 'Suzu chosen · not yet', prov: 'suzu', picks: [1] },
      { name: 'nobody asked yet', expect: { tsuru: [] } }, { name: 'before the gathering', flags: { rw_hall_gather: false }, expect: { pc: ['observe'] } }, { name: 'after setting out', comp: 'mio', flags: { departed: true, ch1_done: true }, expect: { pc: ['listen'] } }] },
  { ch: 1, scene: 'rw.depart', map: 'rw.hall', at: [4, 3, 'up'], flags: F(RH, { rw_hall_gather: true }), quests: { rw_depart: 0 }, minLines: 8,
    variants: ALL4.map((c) => ({ name: c, prov: c })), expect: { pc: ['write'], tsuru: ['nod'] } },
  { ch: 1, scene: 'rw.seeoff', map: 'rw.road', at: [26, 9, 'left'], flags: RD, quests: { rw_depart: 1 }, comps: ALL4, minLines: 6, expect: { pc: ['lookroad'], mame: ['wave'] } },
  { ch: 1, scene: 'rw.sign_road', map: 'rw.village', at: [2, 30, 'up'], flags: RE,
    variants: [{ name: 'mended', picks: [0], expect: { pc: ['observe'], mame: ['wave'] } }, { name: 'later', picks: [1] }, { name: 'already mended', quests: { rw_crossroads: 'done' }, flags: F(RE, { rw_sign_fixed: true }) }] },
  { ch: 1, scene: 'rw.oto_sign', map: 'rw.house1', at: [3, 5, 'up'], talk: 'oto', flags: F(R1, { rw_sign_read: true }), quests: { rw_boots: 1 }, expect: { oto: ['observe', 'handover'] } },
  { ch: 1, scene: 'rw.bench_tools', map: 'rw.carpenter', at: [1, 4, 'up'], flags: R1, quests: { rw_tools: 1 },
    variants: [{ name: 'the record', expect: { pc: ['kneel', 'receive'] } }, { name: 'read already', flags: F(R1, { rw_tally_read: true }) }, { name: 'no quest', quests: {} }] },
  { ch: 1, scene: 'rw.bunta_tally', map: 'rw.carpenter', at: [5, 5, 'up'], talk: 'bunta', flags: F(R1, { rw_tally_read: true }), quests: { rw_tools: 2 },
    variants: [{ name: 'with the plane', items: { rw_plane: 1 }, expect: { bunta: ['forehead', 'receive', 'handover'], pc: ['present'] } }, { name: 'the shuttle not yet taken' }] },
  { ch: 1, scene: 'rw.kiku_tally', map: 'rw.house2', at: [3, 6, 'up'], talk: 'kiku', flags: F(R1, { rw_tally_read: true }), quests: { rw_tools: 2 },
    variants: [{ name: 'with the shuttle', items: { rw_shuttle: 1 }, expect: { kiku: ['receive', 'handover'], pc: ['handover'] } }, { name: 'waiting' }] },
  { ch: 1, scene: 'rw.yasu_first', map: 'rw.village', at: [33, 25, 'right'], talk: 'yasu', flags: R1, variants: [{ name: 'told', picks: [0], expect: { yasu: ['point', 'nod'] } }, { name: 'another time', picks: [1] }] },
  { ch: 1, scene: 'rw.mame_first', map: 'rw.village', at: [17, 19, 'up'], talk: 'mame', flags: R1, variants: [{ name: "it won't", picks: [0], expect: { mame: ['fidget', 'celebrate'] } }, { name: "I don't know", picks: [1], expect: { mame: ['point'] } }] },
  { ch: 1, scene: 'rw.mame_charm', map: 'rw.village', at: [17, 19, 'up'], talk: 'mame', flags: F(RE, { rw_sign_fixed: true }), quests: { rw_crossroads: 'done' }, expect: { mame: ['handover', 'laugh'] } },
  { ch: 1, scene: 'rw.hana_rush', map: 'rw.tea', at: [2, 4, 'up'], talk: 'hana', flags: RE, variants: [{ name: 'helped', picks: [0], expect: { hana: ['pour', 'handover'] } }, { name: 'later', picks: [1] }] },
  { ch: 1, scene: 'rw.tsuru_post', map: 'rw.hall', at: [5, 5, 'up'], talk: 'tsuru', comp: 'nao', flags: F(RD, { postgame: true }), picks: [1],
    variants: [{ name: 'the trial', flags: F(RD, { postgame: true, end_kasane_trial: true }), picks: [1], expect: { tsuru: ['chin', 'point'] } }, { name: 'the keeper', flags: F(RD, { postgame: true, end_kasane_keeper: true }), picks: [1] }, { name: 'no news', picks: [1] }, { name: 'the Atlas, not now', picks: [0, 1] }] },
  { ch: 1, scene: 'rw.tomo_lost', map: 'rw.village', at: [7, 25, 'up'], talk: 'tomo', flags: RE, expect: { tomo: ['point', 'guard'] } },
  { ch: 1, scene: 'rw.tomo_mochi', map: 'rw.village', at: [7, 25, 'up'], talk: 'tomo', flags: F(RE, { rw_mochi_carried: true }), quests: { rw_mochi: 1 }, variants: [{ name: 'the tag written', expect: { tomo: ['exhale', 'handover'] } }, { name: 'later', fail: true }] },
];

// ---- Chapter 2: Saltglass -----------------------------------------------------------------------------------
const S0 = F(RD, { sg_arrived: true, sg_harbor_seen: true }); // arrived, before the main quest's steps
const SC = F(S0, { sg_crates_done: true, sg_post_done: true, sg_ferry_done: true, sg_lunch_done: true, sg_wataru_met: true, sg_crate_blank: true, sg_crate_glued: true });
const SW = F(SC, { sg_clue_asahi: true, sg_clue_genzo: true, sg_clue_kiyo: true }); // the three clues
const SR = F(SW, { sg_wataru_confessed: true, sg_wataru_resolved: true, sg_extension_done: true }); // Wataru's matter settled
const ST = F(SR, { sg_tide_read: true, sg_tide_low: true }); // the tide out
const SF = F(ST, { sg_fog_cleared: true }); // the wind back
const SB = F(SF, { sg_da_seen: true, sg_da_stacks_seen: true, sg_da_reading_seen: true, sg_da_catalog: true, sg_da_raft: true, sg_boss_done: true }); // the archive done
const SE = F(SB, { sg_returned: true, ch2_done: true, sg_ferry_running: true }); // the chapter over
const CH2 = [
  { ch: 2, scene: 'sg.arrive', map: 'sg.road', at: [37, 10, 'left'], flags: RD, quests: { rw_depart: 1 }, comps: ALL4, minLines: 5, expect: { pc: ['lookroad', 'observe', 'point', 'lookbetween'] } },
  { ch: 2, scene: 'sg.road_forklantern', map: 'sg.road', at: [17, 9, 'up'], flags: S0, variants: [{ name: 'flickering', comps: ALL4, expect: { pc: ['observe'] } }, { name: 'lit', comp: 'ren', flags: SE, expect: { pc: ['listen'] } }] },
  { ch: 2, scene: 'sg.road_bench', map: 'sg.road', at: [7, 12, 'down'], flags: S0, comps: ALL4, expect: { pc: ['lookroad', 'observe'] } },
  { ch: 2, scene: 'sg.road_inland_closed', map: 'sg.road', at: [15, 1, 'up'], flags: S0, comps: ALL4, expect: { pc: ['point'] } },
  { ch: 2, scene: 'sg.road_open', map: 'sg.road', at: [18, 20, 'up'], flags: SE, comps: ALL4 },
  { ch: 2, scene: 'sg.harbor_first', map: 'sg.harbor', at: [27, 2, 'down'], flags: F(RD, { sg_arrived: true }), quests: { sg_main: 0 }, comps: ALL4, expect: { pc: ['lookroad', 'bend'] } },
  { ch: 2, scene: 'sg.return_harbor', map: 'sg.harbor', at: [9, 33, 'up'], flags: SB, quests: { sg_main: 9 }, comps: ALL4, expect: { pc: ['shadeeyes', 'point'] } },
  { ch: 2, scene: 'sg.omi_intro', map: 'sg.office', at: [5, 5, 'up'], talk: 'omi', flags: S0, quests: { sg_main: 0 }, comps: ALL4, expect: { omi: ['listen', 'size', 'emphatic', 'count', 'shake'], pc: ['palm'] } },
  { ch: 2, scene: 'sg.wataru_first', map: 'sg.warehouse', at: [5, 6, 'up'], talk: 'wataru', flags: S0, quests: { sg_main: 1 }, comps: ALL4, expect: { wataru: ['flinch', 'fidget'] } },
  { ch: 2, scene: 'sg.crate_blank', map: 'sg.warehouse', at: [4, 4, 'up'], flags: F(S0, { sg_wataru_met: true }), quests: { sg_main: 1 },
    variants: [{ name: 'the first crate', comps: ALL4, expect: { pc: ['observe'] } }, { name: 'the second crate · asked', comp: 'nao', flags: F(S0, { sg_wataru_met: true, sg_crate_glued: true }), picks: [0], expect: { pc: ['lookbetween'], wataru: ['flinch'] } }] },
  { ch: 2, scene: 'sg.crate_glued', map: 'sg.warehouse', at: [8, 4, 'up'], flags: F(S0, { sg_wataru_met: true }), quests: { sg_main: 1 }, comps: ALL4, expect: { pc: ['observe', 'handover'] } },
  { ch: 2, scene: 'sg.crates_check', map: 'sg.warehouse', at: [8, 4, 'up'], flags: F(S0, { sg_wataru_met: true, sg_crate_blank: true, sg_crate_glued: true }), quests: { sg_main: 1 },
    variants: [{ name: 'asked', comps: ALL4, picks: [0], expect: { pc: ['lookbetween'], wataru: ['flinch'] } }, { name: 'nothing yet', comp: 'mio', picks: [1], expect: { wataru: ['fidget'] } }, { name: 'not compared yet', comp: 'ren', fail: true }] },
  { ch: 2, scene: 'sg.tamae_first', map: 'sg.inn', at: [9, 5, 'up'], talk: 'tamae', flags: S0, quests: { sg_main: 1 },
    variants: [{ name: 'helped', comps: ALL4, picks: [0], minLines: 12, expect: { tamae: ['tidy', 'point', 'celebrate', 'handover'] } }, { name: 'later', comp: 'nao', picks: [1] }, { name: 'a break', comp: 'suzu', picks: [0], fail: true }] },
  { ch: 2, scene: 'sg.tamae_postbag', map: 'sg.inn', at: [9, 5, 'up'], talk: 'tamae', flags: F(S0, { sg_lunch_done: true }), quests: { sg_main: 1 },
    variants: [{ name: 'delivered', comps: ALL4, expect: { tamae: ['handover', 'present'], pc: ['receive', 'read'] } }, { name: 'later', comp: 'mio', fail: true }] },
  { ch: 2, scene: 'sg.tetsu_first', map: 'sg.harbor', at: [34, 30, 'up'], talk: 'tetsu', flags: S0, quests: { sg_main: 1 }, comps: ALL4, expect: { tetsu: ['point', 'folded', 'handover'], pc: ['receive'] } },
  { ch: 2, scene: 'sg.omi_report', map: 'sg.office', at: [5, 5, 'up'], talk: 'omi', flags: SC, quests: { sg_main: 2 },
    variants: [{ name: 'sorted', comp: 'ren', expect: { omi: ['listen', 'emphatic', 'size', 'exhale'] } }, { name: 'not yet', comp: 'suzu', fail: true }] },
  { ch: 2, scene: 'sg.genzo_clue', map: 'sg.lighthouse', at: [5, 5, 'up'], talk: 'genzo', flags: SC, quests: { sg_main: 3 }, comps: ALL4, expect: { genzo: ['point', 'folded', 'aside'] } },
  { ch: 2, scene: 'sg.kiyo_clue', map: 'sg.harbor', at: [31, 19, 'up'], talk: 'kiyo', flags: SC, quests: { sg_main: 3 }, comp: 'mio', expect: { kiyo: ['guard', 'point', 'lowered'] } },
  { ch: 2, scene: 'sg.check_clues', map: 'sg.harbor', at: [31, 19, 'up'], flags: SW, quests: { sg_main: 3 }, comps: ALL4, expect: { pc: ['chin'] } },
  { ch: 2, scene: 'sg.wataru_confront', map: 'sg.warehouse', at: [5, 6, 'up'], talk: 'wataru', flags: SW, quests: { sg_main: 4 }, items: { sg_notice: 1 }, minLines: 10,
    variants: [{ name: 'he speaks for himself', comps: ALL4, picks: [0], expect: { wataru: ['fidget', 'aside', 'resolve', 'halfraise'], pc: ['count'] } }, { name: 'we tell her', comp: 'nao', picks: [1] }, { name: 'not yet', comp: 'mio', fail: true, minLines: 3 }] },
  { ch: 2, scene: 'sg.wataru_letter', map: 'sg.warehouse', at: [5, 6, 'up'], talk: 'wataru', flags: F(SW, { sg_wataru_confessed: true, sg_wataru_resolved: true }), quests: { sg_main: 4 },
    variants: [{ name: 'written', comps: ALL4, expect: { wataru: ['read', 'present', 'handover', 'point'], pc: ['read'] } }, { name: 'not yet', comp: 'ren', fail: true }] },
  { ch: 2, scene: 'sg.shiori_tide', map: 'sg.tidehut', at: [4, 4, 'up'], talk: 'shiori', flags: SR, quests: { sg_main: 5 },
    variants: [{ name: 'read · come back later', comp: 'mio', picks: [1], expect: { shiori: ['listen', 'point', 'nod'] } }, { name: 'read · wait', comp: 'nao', picks: [0] }, { name: 'not read', comp: 'suzu', fail: true }, { name: 'read before', comp: 'ren', flags: F(SR, { sg_tide_read: true }), picks: [1] }] },
  { ch: 2, scene: 'sg.shiori_fog', map: 'sg.tidehut', at: [4, 4, 'up'], talk: 'shiori', flags: ST, quests: { sg_main: 6 }, variants: [{ name: 'Ren', comp: 'ren', expect: { comp: ['lookbetween'], shiori: ['point'] } }, { name: 'Nao', comp: 'nao' }] },
  { ch: 2, scene: 'sg.causeway_fog', map: 'sg.harbor', at: [8, 35, 'down'], flags: ST, quests: { sg_main: 6 }, comps: ALL4, expect: { pc: ['observe'] } },
  { ch: 2, scene: 'sg.genzo_wind', map: 'sg.lighthouse', at: [5, 5, 'up'], talk: 'genzo', flags: ST, quests: { sg_main: 6 }, minLines: 8,
    variants: [{ name: 'written', comps: ALL4, expect: { genzo: ['shake', 'point', 'observe', 'celebrate'], pc: ['observe', 'write'] } }, { name: 'not yet', comp: 'suzu', fail: true }] },
  { ch: 2, scene: 'sg.causeway_walk', map: 'sg.harbor', at: [8, 37, 'down'], flags: SF, quests: { sg_main: 7 }, comps: ALL4, expect: { pc: ['lookroad'] } },
  { ch: 2, scene: 'sg.da_arrive', map: 'sg.da_entry', at: [11, 15, 'up'], flags: SF, quests: { sg_main: 7 }, comps: ALL4, expect: { pc: ['lookroad', 'observe'] } },
  { ch: 2, scene: 'sg.da_catalog', map: 'sg.da_entry', at: [11, 4, 'up'], flags: F(SF, { sg_da_seen: true }), quests: { sg_main: 8 },
    variants: [{ name: 'sorted', comps: ALL4, expect: { pc: ['observe', 'lookbetween', 'listen'] } }, { name: 'later', comp: 'mio', fail: true }, { name: 'done before', comp: 'ren', flags: F(SF, { sg_da_seen: true, sg_da_catalog: true }) }] },
  { ch: 2, scene: 'sg.da_stacks_first', map: 'sg.da_stacks', at: [14, 19, 'up'], flags: F(SF, { sg_da_seen: true }), quests: { sg_main: 8 }, comps: ALL4, expect: { pc: ['lookroad'] } },
  { ch: 2, scene: 'sg.da_reading_first', map: 'sg.da_reading', at: [1, 6, 'right'], flags: F(SF, { sg_da_seen: true }), quests: { sg_main: 8 }, comps: ALL4, expect: { pc: ['exhale'] } },
  { ch: 2, scene: 'sg.da_ledger', map: 'sg.da_reading', at: [5, 6, 'up'], flags: F(SF, { sg_da_seen: true, sg_da_reading_seen: true }), quests: { sg_main: 8 },
    variants: [{ name: 'read', comps: ALL4, expect: { pc: ['observe'] } }, { name: 'later', comp: 'nao', fail: true }, { name: 'again', comp: 'mio', flags: F(SF, { sg_da_ledger: true }) }] },
  { ch: 2, scene: 'sg.da_registry', map: 'sg.da_reading', at: [11, 6, 'up'], flags: F(SF, { sg_da_seen: true }), quests: { sg_main: 8 }, comp: 'suzu',
    variants: [{ name: 'for Asahi', quests: { sg_main: 8, sg_seaglass: 1 }, expect: { pc: ['observe', 'read'] } }, { name: 'nobody asked yet' }, { name: 'taken', flags: F(SF, { sg_registry_taken: true }) }] },
  { ch: 2, scene: 'sg.da_raft', map: 'sg.da_sluice', at: [12, 13, 'up'], flags: F(SF, { sg_da_seen: true }), quests: { sg_main: 8 }, items: { sg_rope: 1 },
    variants: [{ name: 'tied', comps: ALL4, expect: { pc: ['observe', 'handover'] } }, { name: 'later', comp: 'ren', fail: true }, { name: 'done', comp: 'nao', flags: F(SF, { sg_da_raft: true }) }] },
  { ch: 2, scene: 'sg.da_boss', map: 'sg.da_vault', at: [9, 9, 'up'], flags: F(SF, { sg_da_seen: true, sg_da_raft: true }), quests: { sg_main: 8 }, comps: ALL4, minLines: 12, expect: { pc: ['palm'], sg_clerk: ['stiff'] } },
  { ch: 2, scene: 'sg.da_boss_after', map: 'sg.da_vault', at: [9, 6, 'up'], flags: F(SF, { sg_da_seen: true, sg_da_raft: true }), quests: { sg_main: 8 }, comps: ALL4, expect: { pc: ['observe', 'palm', 'lookroad'] } },
  { ch: 2, scene: 'sg.omi_final', map: 'sg.office', at: [5, 5, 'up'], talk: 'omi', flags: F(SB, { sg_returned: true }), quests: { sg_main: 9 }, minLines: 10,
    variants: [{ name: 'he came himself · Nao', comp: 'nao', flags: F(SB, { sg_returned: true, sg_wataru_self: true }), expect: { omi: ['lookroad', 'nod', 'palm', 'point'] } }, { name: 'we told her · Suzu', comp: 'suzu', expect: { omi: ['shrug'] } }] },
  { ch: 2, scene: 'sg.ch2_end', map: 'sg.office', at: [5, 5, 'up'], flags: F(SB, { sg_returned: true, sg_evening: true }), quests: { sg_main: 'done' }, comps: ALL4, minLines: 6, expect: { comp: ['lowered'] } },
  { ch: 2, scene: 'sg.tamae_after', map: 'sg.inn', at: [9, 5, 'up'], talk: 'tamae', flags: SB, variants: [{ name: 'rest', comp: 'mio', picks: [0] }, { name: 'good luck', comp: 'ren', picks: [1] }], expect: { tamae: ['present', 'laugh'] } },
  { ch: 2, scene: 'sg.tamae_post', map: 'sg.inn', at: [9, 5, 'up'], talk: 'tamae', comp: 'nao', flags: F(SE, { postgame: true }), variants: [{ name: 'rest', picks: [0] }, { name: 'another time', picks: [1] }], expect: { tamae: ['laugh', 'present'] } },
  { ch: 2, scene: 'sg.nao_cameo', map: 'sg.inn', at: [3, 6, 'up'], talk: 'nao', flags: S0, quests: { sg_main: 1 }, comps: ['mio', 'ren', 'suzu'], expect: { nao: ['strap', 'point', 'lookroad'] } },
  { ch: 2, scene: 'sg.tetsu_history', map: 'sg.harbor', at: [34, 30, 'up'], talk: 'tetsu', flags: SR, quests: { sg_main: 5 }, comp: 'ren', variants: [{ name: 'told', picks: [0], expect: { tetsu: ['lookroad', 'lowered'] } }, { name: 'another time', picks: [1] }] },
  { ch: 2, scene: 'sg.dir_check', map: 'sg.harbor', at: [32, 17, 'left'], talk: 'kiyo', flags: F(SC, { sg_dir_daigo: true, sg_dir_tobi: true, sg_dir_kiyo: true }), vars: { sg_dirs: 3 }, quests: { sg_main: 2, sg_cove: 0 }, comps: ALL4, expect: { pc: ['point', 'size'] } },
  { ch: 2, scene: 'sg.sota_start', map: 'sg.harbor', at: [18, 29, 'up'], talk: 'sota', flags: SC, quests: { sg_main: 2 }, comp: 'mio', expect: { sota: ['point', 'aside', 'forehead'] } },
  { ch: 2, scene: 'sg.sota_nets', map: 'sg.harbor', at: [18, 29, 'up'], talk: 'sota', flags: SC, quests: { sg_main: 2, sg_cove: 3 }, items: { sg_nets: 1 },
    variants: [{ name: 'before Wataru', comps: ALL4, expect: { sota: ['receive', 'handover'], pc: ['handover', 'receive'] } }, { name: 'after Wataru', comp: 'nao', flags: F(SR), expect: { sota: ['aside'] } }] },
  { ch: 2, scene: 'sg.fuku_idle', map: 'sg.harbor', at: [47, 10, 'up'], talk: 'fuku', flags: S0, variants: [{ name: 'Nao', comp: 'nao', expect: { fuku: ['point', 'shake', 'observe'], comp: ['aside', 'shake'] } }, { name: 'the wind back · Mio', comp: 'mio', flags: SF }] },
  { ch: 2, scene: 'sg.fuku_boat', map: 'sg.harbor', at: [47, 10, 'up'], talk: 'fuku', flags: SC, quests: { sg_seaglass: 1 }, comp: 'ren', expect: { fuku: ['lookroad', 'shake'] } },
  { ch: 2, scene: 'sg.fuku_plate', map: 'sg.harbor', at: [47, 10, 'up'], talk: 'fuku', flags: SC, quests: { sg_seaglass: 3 }, items: { sg_plate: 1 }, comps: ALL4, expect: { fuku: ['receive', 'read', 'lowered', 'shake'], pc: ['handover'] } },
  { ch: 2, scene: 'sg.glass_pick1', map: 'sg.harbor', at: [52, 27, 'up'], flags: SC, quests: { sg_seaglass: 0 }, comp: 'mio', expect: { pc: ['kneel'] } },
  { ch: 2, scene: 'sg.glass_pick2', map: 'sg.harbor', at: [45, 29, 'up'], flags: SC, quests: { sg_seaglass: 0 }, comp: 'mio', expect: { pc: ['kneel'] } },
  { ch: 2, scene: 'sg.glass_pick3', map: 'sg.cove', at: [6, 13, 'up'], flags: F(SC, { sg_cove_seen: true, sg_cove_open: true }), quests: { sg_seaglass: 0 }, comp: 'nao', expect: { pc: ['kneel'] } },
  { ch: 2, scene: 'sg.glass_pick4', map: 'sg.cove', at: [27, 12, 'up'], flags: F(SC, { sg_cove_seen: true, sg_cove_open: true }), quests: { sg_seaglass: 0 }, comp: 'nao', expect: { pc: ['kneel'] } },
  { ch: 2, scene: 'sg.asahi_order', map: 'sg.glass', at: [4, 5, 'up'], talk: 'asahi', flags: SC, quests: { sg_main: 2 }, comp: 'suzu', expect: { asahi: ['count', 'point'] } },
  { ch: 2, scene: 'sg.asahi_glass', map: 'sg.glass', at: [4, 5, 'up'], talk: 'asahi', flags: SC, quests: { sg_seaglass: 0 }, items: { sg_seaglass: 3 },
    variants: [{ name: 'no name yet · Ren', comp: 'ren', expect: { asahi: ['receive', 'chin', 'aside'], comp: ['glasses'] } }, { name: 'with the registry card', comp: 'mio', items: { sg_seaglass: 3, sg_registry: 1 } }] },
  { ch: 2, scene: 'sg.genzo_grump', map: 'sg.lighthouse', at: [5, 5, 'up'], talk: 'genzo', flags: SC, quests: { sg_main: 2 }, comps: ALL4, expect: { genzo: ['folded', 'point', 'aside'] } },
  { ch: 2, scene: 'sg.genzo_truth', map: 'sg.lighthouse', at: [5, 5, 'up'], talk: 'genzo', flags: SC, quests: { sg_lighthouse: 1 }, variants: [{ name: 'Nao', comp: 'nao' }, { name: 'Suzu', comp: 'suzu' }, { name: 'Mio', comp: 'mio' }], expect: { genzo: ['folded', 'listen', 'lowered', 'exhale'], pc: ['read'] } },
  { ch: 2, scene: 'sg.ferry_arrives', map: 'sg.harbor', at: [27, 2, 'down'], flags: SE, quests: { sg_lighthouse: 2 }, comps: ALL4, expect: { nagisa: ['listen', 'laugh', 'bow', 'thanks'], genzo: ['lowered', 'handover'] } },
  { ch: 2, scene: 'sg.isamu_nao', map: 'sg.isamu', at: [3, 6, 'up'], comp: 'nao', flags: S0, variants: [{ name: 'should I have?', picks: [0], expect: { comp: ['aside', 'lowered', 'strap', 'shake'] } }, { name: 'say nothing', picks: [1] }] },
  { ch: 2, scene: 'sg.suzu_cameo', map: 'sg.harbor', at: [28, 23, 'up'], talk: 'suzu', flags: S0, comp: 'nao', expect: { suzu: ['size', 'nod', 'palm', 'avert'] } },
  { ch: 2, scene: 'sg.cove_arrive', map: 'sg.cove', at: [1, 8, 'right'], flags: F(SC, { sg_cove_open: true }), comps: ALL4, expect: { pc: ['lookroad'] } },
  { ch: 2, scene: 'sg.cove_nets', map: 'sg.cove', at: [24, 7, 'up'], flags: F(SC, { sg_cove_open: true, sg_cove_seen: true }), quests: { sg_cove: 2 }, comps: ALL4, expect: { pc: ['receive'] } },
];

export const CH12 = [...CH1, ...CH2];
