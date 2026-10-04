// Fixtures for the staged scenes of Chapters 3 and 4 (docs/expressive/SCENES.md "Performed overworld"; the notes
// are docs/expressive/reports/staging_ch3_ch4.md). Same shape as tests/e2e/staging_ch12_cases.mjs: one entry per
// scene — where it plays (map, where you stand and face), who travels with you, the flags, quests, items, words,
// variables and scenes already seen that the moment needs, and the branches worth playing (choice picks in
// order, companions, flags, a challenge or activity that is not passed). Played by tests/e2e/staging_runner.mjs.
//   { ch, scene, map, at: [x, y, dir], comp, compAt: [x, y, dir] (where the follow rule leaves your companion when the
//     place behind you is blocked), talk, flags, quests, items, words, vars, seen, player, prov, fail,
//     variants: [{ name, picks, comp, comps, flags, items, quests, seen, at, fail, … }], comps, expect }
const ALL4 = ['nao', 'mio', 'ren', 'suzu'];
const F = (...objs) => Object.assign({}, ...objs);
// ---- Chapter 3: Cinder Orchard --------------------------------------------------------------------------------
const K0 = { rw_arrived: true, rw_road_lit: true, departed: true, ch1_done: true, ch2_done: true };
const CO0 = F(K0, { co_arrived: true });
const CO1 = F(CO0, { co_met_sayo: true }); // co_main 1
const COS = F(CO1, { co_suspect: true }); // 2: the suspicion
const COC = F(COS, { co_chronicle_read: true }); // 3: the chronicle read
const COH = F(COC, { co_hist_ume: true, co_hist_goro: true, co_hist_isao: true }); // 4: the three accounts
const COR = F(COH, { co_records_done: true }); // 5: the records laid side by side
const COU = F(COR, { co_upper_open: true, co_upper_seen: true }); // 6: the fence open
const COW = F(COU, { co_w_ishi: true, co_w_tsuchi: true, co_oldworks_seen: true, co_saw_tomoe: true });
const COK = F(COW, { co_w_koori: true, co_seal_broken: true, co_kiln_seen: true, co_kiln_open: true, co_warden_down: true, co_logpage_taken: true, co_kiln_done: true }); // 7
const COT = F(COK, { co_kiln_return: true, co_tokiwa_page: true }); // 8
const COD = F(COT, { co_suzu_told: true, co_suzu_done: true, co_restored: true, co_firebreak_cut: true, co_hiro_seat_named: true, co_asm_names: true }); // 9
const CO9 = F(COD, { ch3_done: true });
const COP = F(CO9, { ch4_done: true, ch5_done: true, ch6_done: true, postgame: true }); // after the journey
const Q = (n) => ({ co_main: n });
const CH3 = [
  // the road and the arrival
  { ch: 3, scene: 'co.arrive', map: 'co.road', at: [3, 11, 'right'], flags: K0, comps: ALL4, expect: { pc: ['lookroad'] } },
  { ch: 3, scene: 'co.road_marker', map: 'co.road', at: [22, 10, 'up'], flags: CO1, quests: Q(1), comps: ALL4, expect: { pc: ['observe'] } },
  { ch: 3, scene: 'co.road_north', map: 'co.road', at: [23, 6, 'up'], flags: CO1, quests: Q(1), comps: ALL4, expect: { pc: ['observe', 'shadeeyes'] } },
  { ch: 3, scene: 'co.village_first', map: 'co.village', at: [1, 18, 'right'], flags: CO0, quests: Q(0), comps: ALL4, expect: { pc: ['lookroad', 'nod'] } },
  { ch: 3, scene: 'co.suspect', map: 'co.village', at: [24, 12, 'up'], flags: CO1, quests: Q(1), comps: ALL4, expect: { pc: ['lookbetween', 'point'] } },
  // the Chronicle Hall
  { ch: 3, scene: 'co.tokiwa', map: 'co.hall', at: [7, 6, 'up'], talk: 'co_tokiwa', flags: CO1, quests: Q(1),
    variants: [{ name: 'first meeting', expect: { co_tokiwa: ['nod', 'glasses'] } }, { name: 'idle', seen: ['co.tokiwa_intro'], expect: { co_tokiwa: ['lookbetween'] } },
      { name: 'asked around', flags: COC, quests: Q(3), expect: { co_tokiwa: ['listen', 'glasses'] } }, { name: 'the records', flags: COH, quests: Q(4), expect: { co_tokiwa: ['lookbetween'] } },
      { name: 'after the records', flags: COR, quests: Q(5), expect: { co_tokiwa: ['aside'] } }] },
  { ch: 3, scene: 'co.tokiwa_intro', map: 'co.hall', at: [7, 6, 'up'], talk: 'co_tokiwa', flags: CO1, quests: Q(1), comps: ALL4, expect: { co_tokiwa: ['nod', 'glasses', 'lookbetween'] } },
  { ch: 3, scene: 'co.chronicle', map: 'co.hall', at: [5, 4, 'up'], flags: COS, quests: Q(2),
    variants: [{ name: 'read', comps: ALL4, expect: { pc: ['observe', 'palm'], co_tokiwa: ['listen', 'glasses', 'aside', 'emphatic'] } }, { name: 'later', fail: true },
      { name: 'before the suspicion', flags: CO1, quests: Q(1) }, { name: 'read again', flags: COC, quests: Q(3) }, { name: 'after the assembly', flags: COD, quests: Q(9) }] },
  { ch: 3, scene: 'co.hall_reading', map: 'co.hall', at: [9, 7, 'up'], flags: COH, quests: Q(4), minLines: 2,
    variants: [{ name: 'side by side', comps: ALL4, minLines: 15, expect: { pc: ['present', 'observe', 'palm'], co_tokiwa: ['observe', 'emphatic', 'read', 'lowered'], co_tamotsu: ['folded', 'nod'] } },
      { name: 'later', fail: true }, { name: 'too early', flags: COC, quests: Q(3), minLines: 1 }, { name: 'cleared', flags: COR, quests: Q(5), minLines: 1 }] },
  { ch: 3, scene: 'co.tokiwa_page', map: 'co.hall', at: [7, 6, 'up'], talk: 'co_tokiwa', flags: COK, quests: Q(7), items: { co_logpage: 1 }, minLines: 2,
    variants: [{ name: 'the page', comps: ALL4, minLines: 8, expect: { pc: ['handover'], co_tokiwa: ['receive', 'read', 'lowered', 'nod'] } }, { name: 'getting ready', flags: COT, quests: Q(8), minLines: 1 }] },
  { ch: 3, scene: 'co.tokiwa_post', map: 'co.hall', at: [7, 6, 'up'], talk: 'co_tokiwa', flags: COP, quests: { co_main: 'done' },
    variants: [{ name: 'a library · all returned · the trial', flags: F(COP, { end_archive_library: true, end_mem_return: true, end_kasane_trial: true }), expect: { co_tokiwa: ['read', 'nod', 'lowered', 'emphatic'] } },
      { name: 'closed · each chose · the keeper', flags: F(COP, { end_archive_closed: true, end_mem_choose: true, end_kasane_keeper: true }), expect: { co_tokiwa: ['read', 'glasses', 'nod'] } }] },
  // the way up
  { ch: 3, scene: 'co.tamotsu_gate', map: 'co.terraces', at: [33, 3, 'right'], talk: 'co_tamotsu', flags: COR, quests: Q(5), comps: ALL4, expect: { co_tamotsu: ['nod', 'present', 'emphatic'], pc: ['lookroad'] } },
  { ch: 3, scene: 'co.upper_locked', map: 'co.terraces', at: [20, 1, 'up'], flags: CO1, quests: Q(1),
    variants: [{ name: 'locked', comps: ALL4, expect: { pc: ['observe'] } }, { name: 'the key is with Tamotsu', flags: COR, quests: Q(5), expect: { pc: ['lookroad'] } }] },
  { ch: 3, scene: 'co.upper_enter', map: 'co.upper', at: [20, 28, 'up'], flags: COU, quests: Q(6), comps: ALL4, expect: { pc: ['lookroad'] } },
  { ch: 3, scene: 'co.upper_stone', map: 'co.upper', at: [23, 26, 'up'], flags: COU, quests: Q(6), comps: ALL4, expect: { pc: ['observe'] } },
  { ch: 3, scene: 'co.upper_wall', map: 'co.upper', at: [20, 23, 'up'], flags: COU, quests: Q(6),
    variants: [{ name: 'stone', comps: ALL4, expect: { pc: ['observe'] } }, { name: 'later', fail: true }] },
  { ch: 3, scene: 'co.ashband', map: 'co.upper', at: [16, 15, 'up'], flags: COU, quests: Q(6),
    variants: [{ name: 'earth', comps: ALL4, expect: { pc: ['observe'] } }, { name: 'later', fail: true }, { name: 'seen', flags: F(COU, { co_w_tsuchi: true }) }] },
  { ch: 3, scene: 'co.oldworks_enter', map: 'co.oldworks', at: [30, 23, 'up'], flags: F(COU, { co_w_ishi: true, co_w_tsuchi: true }), quests: Q(6), comps: ALL4, expect: { pc: ['lookroad', 'shadeeyes'] } },
  { ch: 3, scene: 'co.works_sign', map: 'co.oldworks', at: [5, 14, 'up'], flags: COW, quests: Q(6), comps: ALL4, expect: { pc: ['observe'] } },
  { ch: 3, scene: 'co.kiln_seal', map: 'co.oldworks', at: [20, 6, 'up'], flags: COW, quests: Q(6),
    variants: [{ name: 'too hot', comps: ALL4, expect: { pc: ['handover', 'lookroad'] } }, { name: 'with the ice', words: ['koori'], comps: ALL4, expect: { pc: ['handover', 'recoil'] } }, { name: 'with the ice · later', words: ['koori'], fail: true }] },
  { ch: 3, scene: 'co.shortcut_open', map: 'co.oldworks', at: [2, 24, 'down'], flags: COW, quests: Q(6), comps: ALL4, expect: { pc: ['bend'] } },
  { ch: 3, scene: 'co.ice_enter', map: 'co.icehouse', at: [5, 8, 'up'], flags: COW, quests: Q(6), comps: ALL4, expect: { pc: ['exhale', 'observe'] } },
  { ch: 3, scene: 'co.ice_block', map: 'co.icehouse', at: [2, 5, 'left'], flags: COW, quests: Q(6),
    variants: [{ name: 'ice', comps: ALL4, expect: { pc: ['kneel'] } }, { name: 'later', fail: true }, { name: 'seen', flags: F(COW, { co_w_koori: true }) }] },
  { ch: 3, scene: 'co.kiln_enter', map: 'co.kiln', at: [14, 22, 'up'], flags: F(COW, { co_w_koori: true, co_seal_broken: true }), quests: Q(6), comps: ALL4, expect: { pc: ['brow', 'lookroad'] } },
  { ch: 3, scene: 'co.kiln_wall', map: 'co.kiln', at: [12, 4, 'up'], flags: F(COW, { co_w_koori: true, co_seal_broken: true, co_kiln_seen: true, co_tab1: true, co_tab2: true, co_tab3: true }), vars: { co_tablets: 3 }, quests: Q(6),
    variants: [{ name: 'the tiles in order', comps: ALL4, expect: { pc: ['observe', 'listen', 'lookroad'] } }, { name: 'tiles missing', vars: { co_tablets: 1 } }, { name: 'later', fail: true }] },
  { ch: 3, scene: 'co.warden_fight', map: 'co.kiln_core', at: [7, 9, 'up'], flags: F(COW, { co_w_koori: true, co_seal_broken: true, co_kiln_seen: true, co_kiln_open: true }), quests: Q(6), comps: ALL4, expect: { pc: ['listen', 'exhale'] } },
  { ch: 3, scene: 'co.core_lantern', map: 'co.kiln_core', at: [7, 4, 'up'], flags: F(COW, { co_w_koori: true, co_seal_broken: true, co_kiln_seen: true, co_kiln_open: true, co_warden_down: true }), quests: Q(6),
    variants: [{ name: 'the globe', comps: ALL4, expect: { pc: ['bend', 'present'] } }, { name: 'taken', items: { co_globe: 1 } }] },
  { ch: 3, scene: 'co.core_page', map: 'co.kiln_core', at: [4, 7, 'up'], flags: F(COW, { co_w_koori: true, co_seal_broken: true, co_kiln_seen: true, co_kiln_open: true, co_warden_down: true }), quests: Q(6),
    variants: [{ name: 'stay a while', comps: ALL4, picks: [1], expect: { pc: ['bend', 'read'] } }, { name: 'straight back', comps: ['suzu', 'nao'], picks: [0] }] },
  { ch: 3, scene: 'co.kiln_return', map: 'co.village', at: [24, 3, 'down'], flags: F(COK), quests: Q(7), items: { co_logpage: 1 }, comps: ALL4, minLines: 1 },
  // the square
  { ch: 3, scene: 'co.lookout_base', map: 'co.village', at: [11, 13, 'up'], flags: CO1, quests: Q(1),
    variants: [{ name: 'the ropeless bell', comps: ALL4, expect: { pc: ['lookroad'] } }, { name: 'looked at before', flags: F(CO1, { co_clue_bell: true }) }, { name: 'after the festival', flags: CO9, quests: { co_main: 'done' }, picks: [1] }] },
  { ch: 3, scene: 'co.sayo', map: 'co.village', at: [22, 16, 'up'], talk: 'co_sayo', flags: CO1, quests: Q(1),
    variants: [{ name: 'the seats', expect: { co_sayo: ['check', 'point', 'chin'] } }, { name: 'the seats again', seen: ['co.sayo_seats'], expect: { co_sayo: ['chin'] } },
      { name: 'the performer', flags: COC, quests: Q(3), comps: ['nao', 'suzu'], expect: { co_sayo: ['point'] } }, { name: 'before the gathering', flags: COK, quests: Q(7), expect: { co_sayo: ['guard'] } },
      { name: 'thirty flasks', flags: COC, quests: F(Q(3), { co_count: 0 }), expect: { co_sayo: ['recoil', 'point'] } }] },
  { ch: 3, scene: 'co.sayo_seats', map: 'co.village', at: [22, 16, 'up'], talk: 'co_sayo', flags: CO1, quests: Q(1), comps: ['nao', 'suzu'], expect: { co_sayo: ['point', 'chin'] } },
  { ch: 3, scene: 'co.kotaro', map: 'co.village', at: [26, 20, 'right'], talk: 'co_kotaro', flags: CO1, quests: Q(1),
    variants: [{ name: 'the chair', comps: ALL4, expect: { co_kotaro: ['bounce', 'point'] } }, { name: 'the bell', flags: COC, quests: Q(3) }, { name: 'after the bell', flags: F(COC, { co_bell_rung: true }), quests: Q(3), expect: { co_kotaro: ['fidget', 'nod'], pc: ['bend'] } },
      { name: 'thirty what', flags: COC, quests: F(Q(3), { co_count: 1 }), comps: ALL4, expect: { co_kotaro: ['aside', 'celebrate', 'fidget'] } }] },
  { ch: 3, scene: 'co.goro', map: 'co.village', at: [12, 14, 'up'], talk: 'co_goro', flags: CO1, quests: Q(1), minLines: 1,
    variants: [{ name: 'first meeting', picks: [0] }, { name: 'idle', seen: ['co.goro_first'] }, { name: 'waiting for the rope', quests: F(Q(1), { co_bell: 0 }) },
      { name: 'the night watch', flags: COC, quests: Q(3), comps: ALL4, expect: { co_goro: ['chin', 'lookroad', 'nod', 'lowered'] } }, { name: 'the night watch · later', flags: COC, quests: Q(3), fail: true },
      { name: 'the rope up', flags: COD, quests: F(Q(9), { co_bell: 0 }), items: { co_rope: 1 }, expect: { co_goro: ['lookroad', 'nod'] } }] },
  { ch: 3, scene: 'co.goro_first', map: 'co.village', at: [12, 14, 'up'], talk: 'co_goro', flags: CO1, quests: Q(1),
    variants: [{ name: 'I\'ll find one', picks: [0], expect: { co_goro: ['nod', 'lookroad', 'rubhands'] } }, { name: 'not right now', picks: [1], expect: { co_goro: ['shake'] } }] },
  { ch: 3, scene: 'co.bell_ring', map: 'co.village', at: [12, 14, 'up'], talk: 'co_goro', flags: CO1, quests: F(Q(1), { co_bell: 1 }), items: { co_rope: 1 }, comps: ALL4,
    expect: { pc: ['handover', 'lookroad', 'flinch'], co_goro: ['receive', 'rubhands', 'shake', 'nod'], co_tokiwa: ['aside'] } },
  { ch: 3, scene: 'co.goro_post', map: 'co.village', at: [12, 14, 'up'], talk: 'co_goro', flags: COP, quests: { co_main: 'done' },
    variants: [{ name: 'the memories returned', flags: F(COP, { end_mem_return: true, end_kasane_trial: true }), expect: { co_goro: ['lookroad', 'shake'] } }, { name: 'each chose', flags: F(COP, { end_mem_choose: true, end_kasane_keeper: true }) }] },
  { ch: 3, scene: 'co.tamotsu', map: 'co.village', at: [32, 22, 'right'], talk: 'co_tamotsu', flags: CO1, quests: Q(1),
    variants: [{ name: 'the channel', expect: { co_tamotsu: ['point', 'size'] } }, { name: 'the night watch', flags: COC, quests: Q(3), expect: { co_tamotsu: ['folded'] } },
      { name: 'the fence key', flags: COR, quests: Q(5), expect: { co_tamotsu: ['point'] } }, { name: 'rope for Gorō', quests: F(Q(1), { co_bell: 0 }), expect: { co_tamotsu: ['nod', 'handover'], pc: ['receive'] } }] },
  { ch: 3, scene: 'co.heita', map: 'co.village', at: [20, 11, 'up'], talk: 'co_heita', flags: CO1, quests: Q(1),
    variants: [{ name: 'grass duty', comps: ALL4, expect: { co_heita: ['stretch', 'shrug', 'point'] } }, { name: 'researchers', flags: COC, quests: Q(3), expect: { co_heita: ['aside'] } }] },
  { ch: 3, scene: 'co.heita_after', map: 'co.village', at: [15, 9, 'right'], talk: 'co_heita', flags: CO9, quests: { co_main: 'done' }, comps: ['mio', 'nao'], expect: { co_heita: ['brow', 'lowered'] } },
  { ch: 3, scene: 'co.seat', map: 'co.village', at: [26, 19, 'up'], flags: CO1, quests: Q(1),
    variants: [{ name: 'the empty seat', comps: ALL4, expect: { pc: ['observe', 'lookbetween'] } }, { name: 'named', flags: COD, quests: Q(9) }] },
  { ch: 3, scene: 'co.buckets', map: 'co.village', at: [38, 7, 'up'], flags: CO1, quests: Q(1),
    variants: [{ name: 'dusty', comps: ALL4, expect: { pc: ['bend'] } }, { name: 'filled', flags: COD, quests: Q(9) }] },
  { ch: 3, scene: 'co.channel_marker', map: 'co.village', at: [37, 16, 'left'], flags: CO1, quests: Q(1), comps: ALL4, expect: { pc: ['observe'] } },
  // the workshops
  { ch: 3, scene: 'co.beam', map: 'co.glass', at: [8, 3, 'up'], flags: CO1, quests: Q(1),
    variants: [{ name: 'Hiro at work', comps: ALL4, expect: { pc: ['observe'], hiro: ['glasswork'] } }, { name: 'after the festival', flags: CO9, quests: { co_main: 'done' } }] },
  { ch: 3, scene: 'co.isao', map: 'co.glass', at: [8, 4, 'right'], talk: 'co_isao', flags: CO1, quests: Q(1),
    variants: [{ name: 'first meeting' }, { name: 'idle', seen: ['co.isao_first'], expect: { co_isao: ['observe'] } },
      { name: 'the burn', flags: COC, quests: Q(3), comps: ALL4, expect: { co_isao: ['palm', 'chin', 'listen', 'shake', 'nod', 'handover'], pc: ['receive'] } }, { name: 'the burn · later', flags: COC, quests: Q(3), fail: true }] },
  { ch: 3, scene: 'co.isao_first', map: 'co.glass', at: [8, 4, 'right'], talk: 'co_isao', flags: CO1, quests: Q(1),
    variants: [{ name: 'with Mio', comp: 'mio', expect: { co_isao: ['lookbetween', 'aside'], comp: ['observe', 'shake'] } }, { name: 'with Nao', comp: 'nao', expect: { pc: ['observe'] } }] },
  { ch: 3, scene: 'co.hiro_after', map: 'co.village', at: [25, 20, 'up'], talk: 'hiro', flags: CO9, quests: { co_main: 'done' },
    variants: [{ name: 'with the globe', flags: F(CO9, { co_hiro_globe: true }), comps: ['suzu', 'nao'], expect: { hiro: ['glance', 'handover'], pc: ['receive'] } }, { name: 'beads given', items: { co_glass_beads: 1 } }] },
  { ch: 3, scene: 'co.fusa', map: 'co.inn', at: [2, 5, 'up'], talk: 'co_fusa', flags: CO1, quests: Q(1),
    variants: [{ name: 'first meeting' }, { name: 'rest', seen: ['co.fusa_first'], picks: [0], expect: { co_fusa: ['palm', 'nod'] } }, { name: 'not now', seen: ['co.fusa_first'], picks: [1] },
      { name: 'the orders', flags: COC, quests: Q(3), picks: [0], expect: { co_fusa: ['guard', 'palm', 'laugh', 'handover'], pc: ['receive'] } }, { name: 'the orders · later', flags: COC, quests: Q(3), picks: [1, 1] },
      { name: 'before the gathering', flags: COT, quests: Q(8), expect: { co_fusa: ['guard'] } }] },
  { ch: 3, scene: 'co.fusa_first', map: 'co.inn', at: [2, 5, 'up'], talk: 'co_fusa', flags: CO1, quests: Q(1), comps: ['mio', 'nao'], expect: { co_fusa: ['palm', 'laugh', 'lookbetween'] } },
  { ch: 3, scene: 'co.fusa_post', map: 'co.inn', at: [2, 5, 'up'], talk: 'co_fusa', flags: F(COP, { end_mem_choose: true }), quests: { co_main: 'done' }, comps: ['mio', 'nao'], expect: { co_fusa: ['lookbetween', 'lowered'] } },
  { ch: 3, scene: 'co.shino', map: 'co.post', at: [4, 5, 'up'], talk: 'co_shino', flags: CO1, quests: Q(1),
    variants: [{ name: 'first meeting' }, { name: 'the invitations', flags: COC, quests: Q(3), picks: [0], comps: ['nao', 'mio'], expect: { co_shino: ['present', 'nod'] } }, { name: 'the invitations · another time', flags: COC, quests: Q(3), picks: [1] },
      { name: 'all out', seen: ['co.shino_first'], flags: F(COC, { co_letters_done: true }), quests: Q(3), expect: { co_shino: ['sort'] } }] },
  { ch: 3, scene: 'co.shino_first', map: 'co.post', at: [4, 5, 'up'], talk: 'co_shino', flags: CO1, quests: Q(1), comps: ['nao', 'ren'], expect: { co_shino: ['nod', 'point'] } },
  { ch: 3, scene: 'co.nao_cameo', map: 'co.post', at: [3, 5, 'left'], talk: 'nao', flags: COC, quests: Q(3), comps: ['mio', 'ren', 'suzu'], expect: { nao: ['nod', 'strap', 'point', 'lookroad'] } },
  { ch: 3, scene: 'co.nobu', map: 'co.pottery', at: [4, 6, 'up'], talk: 'co_nobu', flags: CO1, quests: Q(1),
    variants: [{ name: 'I\'ll ask Sayo', picks: [0], expect: { co_nobu: ['point', 'folded', 'size', 'nod'] } }, { name: 'that sounds rough', picks: [1] }, { name: 'waiting', quests: F(Q(1), { co_count: 0 }) },
      { name: 'the order slip', flags: COC, quests: F(Q(3), { co_count: 2 }), comps: ALL4, expect: { co_nobu: ['aside', 'emphatic', 'handover'], pc: ['palm', 'receive'] } }, { name: 'the order slip · not yet', flags: COC, quests: F(Q(3), { co_count: 2 }), fail: true },
      { name: 'plates fired', flags: F(COC, { co_count_done: true }), quests: F(Q(3), { co_count: 'done' }) }] },
  // the terraces
  { ch: 3, scene: 'co.ume', map: 'co.terraces', at: [14, 24, 'up'], talk: 'co_ume', flags: CO1, quests: Q(1),
    variants: [{ name: 'first meeting' }, { name: 'idle', seen: ['co.ume_first'], expect: { co_ume: ['nod'] } },
      { name: 'the night of the fire', flags: COC, quests: Q(3), comps: ALL4, expect: { co_ume: ['lookroad', 'shake', 'lowered', 'handover'], pc: ['receive'] } }, { name: 'the night · later', flags: COC, quests: Q(3), fail: true }] },
  { ch: 3, scene: 'co.ume_first', map: 'co.terraces', at: [14, 24, 'up'], talk: 'co_ume', flags: CO1, quests: Q(1), comps: ALL4, expect: { co_ume: ['nod', 'lookroad', 'shake'] } },
  { ch: 3, scene: 'co.ume_after', map: 'co.terraces', at: [14, 24, 'up'], talk: 'co_ume', flags: CO9, quests: { co_main: 'done' },
    variants: [{ name: 'the pin', expect: { co_ume: ['nod', 'handover'], pc: ['receive'] } }, { name: 'pin given', items: { co_leaf_pin: 1 } }] },
  { ch: 3, scene: 'co.ume_post', map: 'co.terraces', at: [14, 24, 'up'], talk: 'co_ume', flags: COP, quests: { co_main: 'done' },
    variants: [{ name: 'the memories returned', flags: F(COP, { end_mem_return: true }), expect: { co_ume: ['lookroad', 'rubhands'] } }, { name: 'each chose', flags: F(COP, { end_mem_choose: true }), expect: { co_ume: ['shake'] } }] },
  { ch: 3, scene: 'co.asa', map: 'co.terraces', at: [21, 31, 'right'], talk: 'co_asa', flags: CO1, quests: Q(1),
    variants: [{ name: 'the blank signposts', expect: { co_asa: ['point', 'shrug', 'lookbetween'] } }, { name: 'on the way', quests: F(Q(1), { co_signs: 0 }), expect: { co_asa: ['point'] } },
      { name: 'the hat', flags: F(CO1, { co_signs_done: true }), quests: F(Q(1), { co_signs: 0 }), expect: { co_asa: ['nod', 'handover'], pc: ['receive'] } },
      { name: 'firebreak path', flags: F(COD, { co_signs_done: true }), quests: F(Q(9), { co_signs: 'done' }), expect: { co_asa: ['shrug', 'nod'] } }] },
  { ch: 3, scene: 'co.signpost', map: 'co.terraces', at: [18, 18, 'up'], flags: CO1, quests: Q(1),
    variants: [{ name: 'not asked yet', expect: { pc: ['observe'] } }, { name: 'mended', quests: F(Q(1), { co_signs: 0 }), comps: ALL4, expect: { pc: ['observe', 'lookbetween'] } }] },
  { ch: 3, scene: 'co.goat', map: 'co.terraces', at: [26, 23, 'right'], flags: CO1, quests: Q(1), comps: ['suzu', 'nao'], expect: { pc: ['observe'] } },
  // Suzu's story (both versions)
  { ch: 3, scene: 'co.suzu_ask', map: 'co.glass', at: [3, 5, 'right'], talk: 'hiro', flags: F(COC, { co_suzu_told: true }), quests: F(Q(3), { co_suzu: 1 }), comps: ['suzu', 'nao'], minLines: 6,
    expect: { hiro: ['glasswork', 'shake', 'cool'] } },
  { ch: 3, scene: 'co.suzu_c_square', map: 'co.village', at: [27, 15, 'up'], talk: 'suzu', flags: COC, quests: Q(3),
    variants: [{ name: 'meeting again', comps: ['nao', 'mio', 'ren'], expect: { suzu: ['celebrate', 'size', 'aside', 'avert', 'point'], pc: ['point'] } }, { name: 'again', flags: F(COC, { co_suzu_c_met: true }), comp: 'mio' }] },
  { ch: 3, scene: 'co.suzu_c_inn', map: 'co.inn', at: [9, 5, 'right'], talk: 'suzu', flags: F(COC, { co_suzu_c_met: true }), quests: F(Q(3), { co_suzu: 0 }), comps: ['nao', 'mio', 'ren'], expect: { suzu: ['palm', 'lowered', 'avert', 'present', 'read'] } },
  { ch: 3, scene: 'co.suzu_c_wait', map: 'co.inn', at: [9, 5, 'right'], talk: 'suzu', flags: F(COC, { co_suzu_c_met: true, co_suzu_c_inn: true, co_suzu_told: true }), quests: F(Q(3), { co_suzu: 1 }), comp: 'mio',
    variants: [{ name: 'waiting', expect: { suzu: ['shrug'] } }, { name: 'the report', flags: F(COC, { co_suzu_c_met: true, co_suzu_c_inn: true, co_suzu_told: true, co_suzu_asked: true }), quests: F(Q(3), { co_suzu: 2 }), expect: { suzu: ['touchhair', 'nod'], pc: ['palm'] } }] },
  { ch: 3, scene: 'co.suzu_c_after', map: 'co.village', at: [21, 15, 'up'], talk: 'suzu', flags: CO9, quests: { co_main: 'done' }, comps: ['nao', 'mio'], expect: { suzu: ['point', 'present'] } },
  { ch: 3, scene: 'co.suzu_c_post', map: 'co.village', at: [21, 15, 'up'], talk: 'suzu', flags: COP, quests: { co_main: 'done' }, comp: 'mio',
    variants: [{ name: 'the trial', flags: F(COP, { end_kasane_trial: true }), expect: { suzu: ['laugh', 'shrug'] } }, { name: 'the keeper', flags: F(COP, { end_kasane_keeper: true }), expect: { suzu: ['palm'] } }] },
  // the festival
  { ch: 3, scene: 'co.fest_tokiwa', map: 'co.festival', at: [17, 21, 'left'], talk: 'co_tokiwa', flags: COD, quests: Q(9),
    variants: [{ name: 'the names', expect: { co_tokiwa: ['read', 'glasses', 'nod'] } }, { name: 'for the living', flags: F(COD, { co_asm_names: false, co_asm_living: true }) }, { name: 'Ume spoke', flags: F(COD, { co_asm_names: false, co_asm_ume: true }) }] },
  { ch: 3, scene: 'co.fest_hiro', map: 'co.festival', at: [25, 20, 'up'], talk: 'hiro', flags: COD, quests: Q(9), comps: ['suzu', 'nao'], expect: { hiro: ['stretch'] } },
  { ch: 3, scene: 'co.reflection', map: 'co.lookout', at: [7, 6, 'up'], flags: COD, quests: Q(9), comps: ALL4, minLines: 8, expect: { pc: ['chin', 'lookroad'] } },
];

// ---- Chapter 4: Snowbell ---------------------------------------------------------------------------------------
const SB0 = F(K0, { co_arrived: true, ch3_done: true });
const SB1 = F(SB0, { sb_arrived: true, sb_hamlet_seen: true }); // sb_lamp 0: ask at the inn
const SBY = SB1; // sb_lamp 1 (Yae sent you)
const SBL = F(SB1, { sb_letters_done: true }); // the blank post read
const SBA = F(SBL, { sb_akari_ordered: true }); // Akari's letters in order (sb_lamp 3)
const SBS = F(SBA, { sb_storm: true }); // the storm night (sb_lamp 5)
const SBH = F(SBS, { sb_orders_done: true, sb_hearth_done: true }); // the hearth relit
const SBM = F(SBH, { sb_quiet_done: true, sb_morning: true }); // the morning after
const SBO = F(SBM, { sb_obs_open: true }); // sb_lamp 6: Hoshino's key
const SBT = F(SBO, { sb_stair_open: true }); // the stair melted
const SBD = F(SBT, { sb_path_seen: true, sb_hall_seen: true, sb_dial1: true }); // sb_lamp 7: the dial door open
const SBC = F(SBD, { sb_charts_seen: true, sb_log_solved: true, sb_archive_found: true, sb_ushio_sketch: true }); // the grille key
const SBG = F(SBC, { sb_gallery_seen: true, sb_crank: true }); // sb_lamp 8: the hatch open
const SBLIT = F(SBG, { sb_dome_seen: true, sb_boss_done: true, sb_name_done: true, sb_lamp_lit: true, sb_hoshino_stays: true });
const SBE = F(SBLIT, { sb_evening: true, sb_evening_seen: true }); // the evening the lamp comes back
const SB9 = F(SBE, { ch4_done: true });
const SBP = F(SB9, { sb_evening: false, sb_after: true, ch5_done: true, ch6_done: true, postgame: true }); // after the journey
const L = (n) => ({ sb_lamp: n });
const CH4 = [
  // the road and the hamlet
  { ch: 4, scene: 'sb.arrive', map: 'sb.road', at: [2, 13, 'right'], flags: SB0, comps: ALL4, expect: { pc: ['exhale'] } },
  { ch: 4, scene: 'sb.road_east_locked', map: 'sb.road', at: [30, 13, 'right'], flags: SB1, quests: L(0), comps: ALL4, expect: { pc: ['observe'] } },
  { ch: 4, scene: 'sb.hamlet_first', map: 'sb.hamlet', at: [22, 34, 'up'], flags: F(SB0, { sb_arrived: true }), comps: ALL4, expect: { pc: ['lookroad', 'shadeeyes'] } },
  { ch: 4, scene: 'sb.stair_ice', map: 'sb.hamlet', at: [30, 2, 'up'], flags: SB1, quests: L(1),
    variants: [{ name: 'no word yet', expect: { pc: ['observe'] } }, { name: 'the storm night', flags: SBH, quests: L(5), words: ['honoo'] }, { name: 'the morning, no key', flags: SBM, quests: L(5), words: ['honoo'], comp: 'ren' },
      { name: 'melted', flags: SBO, quests: L(6), words: ['honoo'], comps: ALL4, expect: { pc: ['handover', 'recoil'] } }, { name: 'not melted yet', flags: SBO, quests: L(6), words: ['honoo'], fail: true }] },
  { ch: 4, scene: 'sb.natsume', map: 'sb.inn', at: [5, 5, 'up'], talk: 'natsume', flags: SB1, quests: L(1),
    variants: [{ name: 'first meeting', expect: { natsume: ['yawn', 'laugh'] } }, { name: 'the hint', quests: F(L(1), { sb_goats: 1 }), expect: { natsume: ['doze'] } },
      { name: 'the kids', quests: F(L(1), { sb_goats: 'done' }), expect: { natsume: ['laugh', 'yawn'] } }, { name: 'after the lamp', flags: F(SBLIT, { sb_storm: true }), quests: L(8) }] },
  { ch: 4, scene: 'sb.tetsuji', map: 'sb.hamlet', at: [10, 27, 'left'], compAt: [10, 26, 'down'], talk: 'tetsuji', flags: SB1, quests: L(1),
    variants: [{ name: 'twelve', comps: ['nao', 'suzu'], expect: { tetsuji: ['countidle', 'count', 'folded'] } }, { name: 'waiting', quests: F(L(1), { sb_goats: 0 }), expect: { tetsuji: ['point'] } },
      { name: 'born', quests: F(L(1), { sb_goats: 2 }), comps: ['mio', 'ren'], expect: { tetsuji: ['chin', 'listen', 'lowered', 'handover'], pc: ['palm', 'receive'] } }, { name: 'twelve, good', quests: F(L(1), { sb_goats: 'done' }) },
      { name: 'after the lamp', flags: SBLIT, quests: F(L(8), { sb_goats: 'done' }), expect: { tetsuji: ['lookroad'] } }] },
  { ch: 4, scene: 'sb.fuki', map: 'sb.fuki', at: [3, 3, 'left'], talk: 'fuki', flags: SB1, quests: L(1),
    variants: [{ name: 'leave it to us', picks: [0], expect: { fuki: ['nod', 'shake', 'lookbetween', 'laugh'] } }, { name: 'busy', picks: [1] }, { name: 'the notebook', quests: F(L(1), { sb_bell: 1 }) },
      { name: 'the noon bell rang', quests: F(L(1), { sb_bell: 2 }), expect: { fuki: ['laugh', 'handover', 'nod'], pc: ['receive'] } }, { name: 'done', quests: F(L(1), { sb_bell: 'done' }) }] },
  { ch: 4, scene: 'sb.bellpost', map: 'sb.hamlet', at: [22, 16, 'up'], flags: SB1, quests: L(1),
    variants: [{ name: 'blank', expect: { pc: ['observe'] } }, { name: 'rewritten', quests: F(L(1), { sb_bell: 2 }) },
      { name: 'once', quests: F(L(1), { sb_bell: 1 }), picks: [0], comp: 'mio' }, { name: 'twice', quests: F(L(1), { sb_bell: 1 }), picks: [1], comps: ALL4, expect: { pc: ['lookroad'] } },
      { name: 'three times', quests: F(L(1), { sb_bell: 1 }), picks: [2], comps: ['nao', 'ren'] }, { name: 'the storm signal', quests: F(L(1), { sb_bell: 1 }), picks: [3], comps: ['mio', 'suzu'], expect: { pc: ['flinch'] } }] },
  { ch: 4, scene: 'sb.fuki_after', map: 'sb.hamlet', at: [23, 17, 'up'], talk: 'fuki', flags: F(SB9, { sb_evening: false, sb_after: true }), quests: { sb_lamp: 'done' },
    variants: [{ name: 'the bell rung', quests: { sb_lamp: 'done', sb_bell: 'done' }, expect: { fuki: ['laugh', 'lookbetween'] } }, { name: 'the bell still to ring', picks: [0], expect: { fuki: ['lookroad', 'nod', 'laugh'] } }] },
  { ch: 4, scene: 'sb.kanta', map: 'sb.hamlet', at: [19, 20, 'up'], talk: 'kanta', flags: SB1, quests: L(1),
    variants: [{ name: 'a judge', comps: ['suzu', 'ren'], expect: { kanta: ['bounce', 'lookbetween', 'point', 'fidget'] } }, { name: 'not seen all three', quests: F(L(1), { sb_snow: 0 }), expect: { kanta: ['lookbetween'] } },
      { name: 'the judging', quests: F(L(1), { sb_snow: 0 }), seen: ['sb.sculpt_goat', 'sb.sculpt_obs', 'sb.sculpt_fox'], expect: { kanta: ['point', 'duck'], chiyo: ['celebrate'], rokuta: ['size'] } },
      { name: 'the judging · later', quests: F(L(1), { sb_snow: 1 }), fail: true }, { name: 'judged', quests: F(L(1), { sb_snow: 'done' }) },
      { name: 'the lamp on', flags: SBLIT, quests: F(L(8), { sb_snow: 'done' }), expect: { kanta: ['celebrate'] } }] },
  { ch: 4, scene: 'sb.chiyo', map: 'sb.hamlet', at: [21, 21, 'up'], talk: 'chiyo', flags: SB1, quests: L(1), minLines: 1,
    variants: [{ name: 'the berry lamp', expect: { chiyo: ['point'] } }, { name: 'won', quests: F(L(1), { sb_snow: 'done' }), expect: { chiyo: ['celebrate'] } }, { name: 'won twice', flags: SBLIT, quests: F(L(8), { sb_snow: 'done' }) }] },
  { ch: 4, scene: 'sb.rokuta', map: 'sb.hamlet', at: [24, 20, 'right'], talk: 'rokuta', flags: SB1, quests: L(1),
    variants: [{ name: 'the tail', comp: 'nao', expect: { rokuta: ['size', 'forehead'] } }, { name: 'lost', comp: 'suzu', quests: F(L(1), { sb_snow: 'done' }), expect: { rokuta: ['aside'] } }] },
  { ch: 4, scene: 'sb.storm_kids', map: 'sb.inn', at: [9, 8, 'down'], talk: 'chiyo', flags: SBS, quests: L(5), minLines: 2,
    variants: [{ name: 'a draw', expect: { chiyo: ['point'], rokuta: ['size'] } }, { name: 'cancelled?', quests: F(L(5), { sb_snow: 'done' }), expect: { rokuta: ['aside'] } }] },
  { ch: 4, scene: 'sb.sachi', map: 'sb.hamlet', at: [35, 21, 'up'], talk: 'sachi', flags: SB1, quests: L(1),
    variants: [{ name: 'frozen washing', expect: { sachi: ['lookbetween', 'palm'] } }, { name: 'the letter', flags: SBL, quests: L(2), expect: { sachi: ['present', 'laugh'] } },
      { name: 'after the lamp', flags: SBLIT, quests: L(8) }, { name: 'the evening', map: 'sb.sachi', at: [5, 4, 'up'], flags: SBE, quests: L(8), minLines: 1 }] },
  { ch: 4, scene: 'sb.denji', map: 'sb.hamlet', at: [38, 25, 'right'], talk: 'denji', flags: SB1, quests: L(1),
    variants: [{ name: 'the ice hole', expect: { denji: ['glance', 'lookroad'] } }, { name: 'the lamp back', flags: F(SBLIT, { sb_shortcut: true }), quests: L(8), expect: { denji: ['lookroad', 'size'] } }] },
  { ch: 4, scene: 'sb.hayate', map: 'sb.hamlet', at: [27, 8, 'up'], talk: 'hayate', flags: SB1, quests: L(1),
    variants: [{ name: 'the foxes', comps: ['mio', 'nao'], expect: { hayate: ['point', 'lookroad'] } }, { name: 'the morning', flags: SBM, quests: L(5), expect: { hayate: ['size', 'folded'] } }] },
  // the main road of the chapter
  { ch: 4, scene: 'sb.hoshino', map: 'sb.hoshino', at: [4, 5, 'up'], talk: 'hoshino', flags: SBY, quests: L(1), minLines: 1,
    variants: [{ name: 'the promise', comps: ALL4, minLines: 10, expect: { hoshino: ['listen', 'glasses', 'lowered', 'present', 'aside'], pc: ['palm'] } }, { name: 'waiting', quests: L(2) },
      { name: 'the letters', flags: SBA, quests: L(3), items: { sb_akari_letters: 1 }, comps: ALL4, minLines: 20, expect: { hoshino: ['receive', 'read', 'lowered', 'listen'], pc: ['handover', 'flinch'] } },
      { name: 'the letters · the bell known', flags: SBA, quests: F(L(3), { sb_bell: 'done' }), items: { sb_akari_letters: 1 }, picks: [0, 2], comps: ['nao', 'mio'], minLines: 20 },
      { name: 'the stair melted?', flags: SBO, quests: L(6) }] },
  { ch: 4, scene: 'sb.sousuke', map: 'sb.post', at: [7, 4, 'up'], talk: 'sousuke', flags: SB1, quests: L(1),
    variants: [{ name: 'first meeting', expect: { sousuke: ['nod', 'glasses'] } }, { name: 'the blank post', quests: L(2), comps: ['nao', 'mio', 'suzu'], expect: { sousuke: ['aside', 'present', 'read', 'count', 'handover'], pc: ['receive'] } },
      { name: 'the blank post · later', quests: L(2), comp: 'ren', fail: true }, { name: 'after', flags: SBA, quests: L(4) }, { name: 'the morning', flags: SBM, quests: L(5) }, { name: 'the lamp lit', flags: SBLIT, quests: L(8) }] },
  { ch: 4, scene: 'sb.yae_storm', map: 'sb.inn', at: [8, 9, 'up'], flags: SBS, quests: L(5), words: [],
    variants: [{ name: 'the orders', comp: 'nao', minLines: 10, expect: { yae: ['palm', 'count', 'laugh'] } }, { name: 'not helped, not lit', comp: 'mio', fail: true }, { name: 'the fire lit', flags: SBH, quests: L(5), comp: 'ren', expect: { yae: ['point'] } }] },
  { ch: 4, scene: 'sb.hearth_fails', map: 'sb.inn', at: [7, 7, 'up'], flags: F(SBS, { sb_orders_done: true }), quests: L(5), comps: ALL4, minLines: 8,
    expect: { pc: ['lookroad', 'observe'], yae: ['recoil', 'laugh'], denji: ['chin'], kanta: ['fidget', 'celebrate'], hoshino: ['chin'] } },
  { ch: 4, scene: 'sb.morning_hoshino', map: 'sb.inn', at: [6, 9, 'up'], talk: 'hoshino', flags: SBM, quests: L(5), comps: ['mio', 'nao'], expect: { hoshino: ['nod', 'handover'], pc: ['receive'] } },
  // the quiet night
  { ch: 4, scene: 'sb.quiet_begin', map: 'sb.inn_room', at: [6, 5, 'left'], flags: SBH, quests: L(5), minLines: 10,
    variants: [{ name: 'Nao · talk, go on, deliver it, no laughing', comp: 'nao', picks: [0, 0, 0, 0], expect: { comp: ['present', 'avert'] } }, { name: 'Nao · sheep, laugh, my fear, one label', comp: 'nao', picks: [1, 1, 2, 1], expect: { pc: ['lowered', 'observe'] } }, { name: 'Nao · listen', comp: 'nao', picks: [0, 0, 1, 0] },
      { name: 'Mio · rules, angry, reassure, the jar', comp: 'mio', picks: [0, 1, 0, 0], expect: { comp: ['fidget', 'emphatic', 'present'] } }, { name: 'Mio · company, what, honest, good', comp: 'mio', picks: [1, 0, 1, 1] }, { name: 'Mio · share', comp: 'mio', picks: [1, 0, 2, 0], expect: { pc: ['lowered'] } },
      { name: 'Ren · joke, laugh, recite', comp: 'ren', picks: [0, 0, 0], expect: { comp: ['count', 'lowered', 'tendlamp'] } }, { name: 'Ren · gentle, pun, keep', comp: 'ren', picks: [1, 1, 1], expect: { comp: ['glasses', 'thanks'] } }, { name: 'Ren · hope', comp: 'ren', picks: [1, 0, 2] },
      { name: 'Suzu · snoring, exact, which, mine', comp: 'suzu', picks: [0, 0, 0, 0], expect: { comp: ['recoil', 'present', 'bow'] } }, { name: 'Suzu · scared, the goat now, wait, free', comp: 'suzu', picks: [1, 1, 1, 1] }, { name: 'Suzu · helped', comp: 'suzu', picks: [0, 0, 2, 0], expect: { comp: ['write'] } }] },
  // the observatory
  { ch: 4, scene: 'sb.path_enter', map: 'sb.obs_path', at: [14, 38, 'up'], flags: SBT, quests: L(6), comps: ALL4, expect: { pc: ['shadeeyes', 'lookroad'] } },
  { ch: 4, scene: 'sb.path_bench', map: 'sb.obs_path', at: [9, 37, 'up'], flags: F(SBT, { sb_path_seen: true }), quests: L(6), comps: ALL4, expect: { pc: ['observe'] } },
  { ch: 4, scene: 'sb.hall_enter', map: 'sb.obs_hall', at: [10, 14, 'up'], flags: F(SBT, { sb_path_seen: true }), quests: L(6), comps: ALL4, expect: { pc: ['lookroad', 'observe'] } },
  { ch: 4, scene: 'sb.hall_dial', map: 'sb.obs_hall', at: [12, 4, 'up'], flags: F(SBT, { sb_path_seen: true, sb_hall_seen: true }), quests: L(6),
    variants: [{ name: 'south', comps: ALL4, expect: { pc: ['observe', 'listen', 'lookroad'] } }, { name: 'not yet', fail: true }, { name: 'open', flags: SBD, quests: L(7) }] },
  { ch: 4, scene: 'sb.charts_stove', map: 'sb.obs_charts', at: [13, 3, 'up'], flags: F(SBD, { sb_charts_seen: true }), quests: L(7),
    variants: [{ name: 'lit', picks: [0], comps: ALL4, expect: { pc: ['bend', 'handover', 'exhale'] } }, { name: 'left', picks: [1] }, { name: 'already lit', flags: F(SBD, { sb_charts_seen: true, sb_stove_lit: true }) }] },
  { ch: 4, scene: 'sb.charts_desk', map: 'sb.obs_charts', at: [10, 5, 'up'], flags: F(SBD, { sb_charts_seen: true }), quests: L(7),
    variants: [{ name: 'the note', comps: ['nao', 'suzu', 'mio'], expect: { pc: ['read'] } }, { name: 'the log solved', flags: SBC, quests: L(7) }] },
  { ch: 4, scene: 'sb.charts_log', map: 'sb.obs_charts', at: [4, 6, 'up'], flags: F(SBD, { sb_charts_seen: true }), quests: L(7), minLines: 5,
    variants: [{ name: 'the sketch', comps: ['nao', 'mio', 'suzu'], expect: { pc: ['read', 'strap'] } }, { name: 'Ren · keep it', comp: 'ren', picks: [0], expect: { comp: ['receive', 'read', 'present', 'lowered', 'handover', 'lookroad'] } },
      { name: 'Ren · the lamp first', comp: 'ren', picks: [1], expect: { comp: ['nod', 'handover'] } }] },
  { ch: 4, scene: 'sb.gallery_enter', map: 'sb.obs_gallery', at: [1, 10, 'right'], flags: SBC, quests: L(7), comps: ALL4, expect: { pc: ['lookroad', 'observe'] } },
  { ch: 4, scene: 'sb.service_bolt', map: 'sb.obs_gallery', at: [18, 11, 'right'], flags: F(SBC, { sb_gallery_seen: true }), quests: L(7),
    variants: [{ name: 'lift the bar', picks: [0], comps: ['nao', 'ren'], expect: { pc: ['observe', 'bend'] } }, { name: 'leave it', picks: [1] }] },
  { ch: 4, scene: 'sb.dome_enter', map: 'sb.obs_dome', at: [7, 10, 'up'], flags: SBG, quests: L(8), comps: ALL4, expect: { pc: ['lookroad', 'observe'] } },
  { ch: 4, scene: 'sb.boss_pre', map: 'sb.obs_dome', at: [7, 7, 'up'], flags: F(SBG, { sb_dome_seen: true }), quests: L(8), minLines: 12,
    variants: [{ name: 'by the back stair', flags: F(SBG, { sb_dome_seen: true, sb_shortcut: true }), comps: ALL4, picks: [0], expect: { pc: ['listen', 'exhale'], hoshino: ['exhale', 'observe', 'lowered', 'present'] } },
      { name: 'every door open', comps: ['mio'], picks: [1], expect: { hoshino: ['observe', 'lowered', 'present'] } }] },
  { ch: 4, scene: 'sb.eve_start', map: 'sb.hamlet', at: [22, 20, 'up'], flags: F(SBLIT, { sb_evening: true }), quests: L(8), comps: ALL4, minLines: 5,
    expect: { pc: ['lookroad'], yae: ['celebrate'], sousuke: ['present'] } },
  { ch: 4, scene: 'sb.eve_hoshino', map: 'sb.hamlet', at: [22, 18, 'up'], talk: 'hoshino', flags: SBE, quests: L(8),
    variants: [{ name: 'stays', expect: { hoshino: ['lookbetween', 'exhale', 'glasses'] } }, { name: 'goes', flags: F(SBE, { sb_hoshino_stays: false, sb_hoshino_goes: true }), expect: { hoshino: ['nod'] } },
      { name: 'both', flags: F(SBE, { sb_hoshino_stays: false, sb_hoshino_both: true }), expect: { hoshino: ['chin'] } }] },
  { ch: 4, scene: 'sb.hoshino_post', map: 'sb.hamlet', at: [35, 9, 'right'], talk: 'hoshino', flags: SBP, quests: { sb_lamp: 'done' },
    variants: [{ name: 'both · the library', flags: F(SBP, { sb_hoshino_stays: false, sb_hoshino_both: true, end_archive_library: true }), expect: { hoshino: ['lookbetween', 'exhale', 'nod'] } },
      { name: 'stays · closed', flags: F(SBP, { end_archive_closed: true }), expect: { hoshino: ['present', 'lookroad'] } }] },
  { ch: 4, scene: 'sb.yae_post', map: 'sb.inn', at: [13, 4, 'up'], talk: 'yae', flags: SBP, quests: { sb_lamp: 'done' },
    variants: [{ name: 'Kanta keeps the lamp · rest', flags: F(SBP, { sb_hoshino_stays: false, sb_hoshino_goes: true, end_archive_library: true }), picks: [0], expect: { yae: ['laugh', 'chin', 'nod'] } },
      { name: 'Hoshino stays · help', flags: F(SBP, { end_archive_closed: true }), picks: [1], expect: { yae: ['palm', 'laugh'] } }, { name: 'another time', picks: [2] }] },
  { ch: 4, scene: 'sb.goat_note', map: 'sb.goatshed', at: [5, 2, 'right'], compAt: [5, 3, 'up'], flags: SB1, quests: L(1),
    variants: [{ name: 'not ours to read', expect: { pc: ['observe'] } }, { name: 'read', quests: F(L(1), { sb_goats: 0 }), comps: ALL4 }, { name: 'read again', quests: F(L(1), { sb_goats: 2 }) }] },
];

export const CH34 = CH3.concat(CH4);
