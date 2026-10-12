// HX52 specs for the twelve-chapter edition's pages, group "mb": Manybridge (mb1, mb2), the Keepers' Road (kr),
// Kotonoha (ko) and the settlement's first festival (as). Imported by sequence_world.mjs and merged into its SEQ
// table: same format, same meaning (read that file's header and SEQ first).
//
// Every spec starts in the twelve-chapter edition (`edition: 2`, RB.edition's TWELVE, src/engine/05a_edition.js): the
// maps and scenes here exist only in such journeys.
//
// Story order of the twelve (RB.edition.ORDER): rw, sg, mb1, mb2, co, sb, kr, lf, ko, cr, yn, sa. Companions: all four
// can travel with you from the departure on, and none of these scenes falls in a stretch apart (Ren's night apart,
// kr_apart, and the tide's separation, ko_apart, end before the vigil and the Garden; the Cloudroad's and
// Steamhollow's comp_away stretches end before the settlement). Pets: in Manybridge (mb1, mb2) only the cat
// (Reedwake) or the bird (Saltglass) can have been met; Cinder Orchard (the dog, the tanuki) comes after Manybridge,
// so from the Keepers' Road on any of the four.
//
// The fixtures are the flags, quests and items each scene's callers leave. The harness sets flags, quests and items
// only, not script variables (s.vars), so a variable such as the settlement's lantern choice is left unset here.
const F = (...o) => Object.assign({}, ...o);
const ED = 2; // RB.edition.TWELVE

// ---- the moments ----------------------------------------------------------------------------------------------------
// gone from Reedwake, Saltglass's story over (ch2_done: Tetsu's ferry east to Manybridge)
const D1 = { rw_arrived: true, rw_road_lit: true, departed: true, ch1_done: true };
const SG = F(D1, { ch2_done: true });
// Manybridge, Chapter 3, at the First Bridge with the name just given: the dispute settled, the dead letter read, Ichi
// lost and found (mb.uno_evening sets mb_ichi_lost and nothing unsets it), the lock opened, the Undercroft's three
// levels worked, and the boss encounter's conclusion `named` (src/content/mb/33_under.js) has set mb_bridge_named
// before mb.boss_go calls mb.bridge_named
const MB1 = F(SG, {
  mb_arrived: true, mb_exchange_seen: true, mb_dispute_done: true, mb_rice_found: true, mb_ev_letter: true,
  mb_ichi_lost: true, mb_ichi_found: true, mb_ev_song: true, mb_passage: true, mb_under_seen: true, mb_tab1: true,
  mb_u1_low: true, mb_u2_through: true, mb_tab3: true, mb_u3_down: true, mb_firstbridge_seen: true, mb_bridge_named: true,
});
// Matsu read the dead letter in the passage encounter (conclusion `letter`): her lamp, hung below
const MATSU_LETTER = { mb_matsu_letter: true, mb_matsu_lamp: true, mb_lamp_hung: true };
// Manybridge, Chapter 4: up the Cross Canal (mb.chapter_end left mb1_done and the quest's reward flag), Sōbē met
const MB2 = F(MB1, { mb1_done: true, mb_main_done: true, mp_arrived: true, mp_sobe_met: true, mp_press_open: true });
// the notice printed at the press (src/engine/72p_press.js circulate: press_printed, press_notice)
const PRINTED = F(MB2, { press_printed: true, press_notice: true });
// the night of the Opening of the River: rehearsal, the three preparations (the bank's lanterns, the bank's stalls,
// the drums first), the Understage won, the committee's yukata, the first step onto the bank
const FEST = F(PRINTED, {
  mp_theatre_seen: true, mp_rehearsal_done: true, mp_fest_heard: true, mp_under_open: true, mp_prep_met: true,
  mp_lan_bank: true, mp_prep_lanterns: true, mp_st_bank: true, mp_prep_stalls: true, mp_proc_drums: true, mp_prep_procession: true,
  mp_under_seen: true, mp_book1: true, mp_book2: true, mp_book3: true, mp_bottom_seen: true, mp_under_done: true,
  mp_yukata: true, mp_fest_night: true, mp_fest_walked: true, pt_festival: true,
});
// Cinder Orchard and Snowbell behind you (their chapter flags keep their six-chapter names: ch3_done, ch4_done)
const KR0 = F(PRINTED, { mb2_done: true, ch3_done: true, ch4_done: true });
// the Keepers' Road, the night of the vigil: the road climbed, the rite, the registers read (kr_night), the evening
// at the lodge, Hisae's "To the Room of Wicks" (kr.hisae_vigil sets kr_evening_done and warps you in)
const KR_VIGIL = F(KR0, {
  kr_arrived: true, kr_l_foot: true, kr_l_steps: true, kr_l_fox: true, kr_stele_read: true, kr_rhyme_heard: true,
  kr_kikyo_met: true, kr_kikyo_lodge: true, kr_lodge_seen: true, kr_hisae_met: true, kr_scroll_done: true, kr_moths_done: true,
  kr_cave_seen: true, kr_rite_done: true, kr_registers_read: true, kr_night: true, kr_evening_seen: true, kr_evening_done: true,
});
// the evening's companion beat, as Hisae requires before the vigil: Ren back from the Ridge Light (kr_apart over), or
// the quarrel made up
const REN_BACK = { kr_ren_lamp_known: true, kr_hisae_told_ren: true, kr_l_ridge: true, kr_ren_back: true, kr_ren_crossroads: true };
const MADE_UP = { kr_quarrel: true, kr_makeup_done: true };
// dawn after the vigil (the Hundredth Tale's conclusions set kr_tale_closed; kr_night is unset after the encounter)
const KR_DAWN = F(KR_VIGIL, MADE_UP, { kr_vigil_begun: true, kr_vigil_done: true, kr_tale_closed: true, kr_night: false });
// Kotonoha (after Lanternfall: ch5_done): called, arrived, the tellings, the hollow open, the Root Hollows walked, the
// tide's separation over (ko_reunited, ko_apart unset), the Garden reached
const KO = F(KR0, {
  kr_vigil_done: true, kr_done: true, ch5_done: true,
  ko_called: true, ko_arrived: true, ko_ch9: true, ko_otoha_met: true, ko_tell_otoha: true, ko_tell_nami: true,
  ko_tell_hamaji: true, ko_tell_shell: true, ko_hollow_open: true, ko_crown_seen: true, ko_roots_seen: true, ko_root_a: true,
  ko_tide_in: true, ko_round_seen: true, ko_root_b: true, ko_root_c: true, ko_reunited: true, ko_garden_seen: true,
});
// after the story (the Still Archive's end sets postgame): Ashihara Shinden grown to its festival (three ways named,
// Kotoe come, both notices, both quarrels, the meeting house, the three preparations)
const AS = F(KO, {
  ko_gardener_done: true, ko_done: true, cr_done: true, yn_done: true, postgame: true,
  as_arrived: true, as_nm_main: true, as_nm_canal: true, as_nm_hill: true, as_streets: true, as_kotoe: true,
  as_nt_water: true, as_nt_market: true, as_dp_water: true, as_dp_noise: true, as_hall: true,
  as_fp_lan: true, as_fp_food: true, as_fp_order: true,
});

export const SPECS = {
  'mb1.named': {
    edition: ED,
    // the boss encounter won, mb.boss_go calls the scene where you stand: on the near bank before the spirit's place
    // on the bridge (it stood at 13,11 facing down; you talked to it from 13,12)
    scene: 'mb.bridge_named', at: ['mb.firstbridge', 13, 12, 'up'], flags: MB1, quests: { mb_main: 6 }, settle: 9000,
    // the scene then warps to Matsu's house and calls mb.chapter_end, which goes out onto the Exchange at dusk
    chain: ['mb1.dusk'],
    // the grey shape sinks into the water as the spans lie down: the spirit is gone from the world on return (its
    // placement reads !mb_bridge_named); nobody else is on the First Bridge's map
    gone: ['mb_bridgespirit'], stay: [], drawsComp: true,
    // after the chapter's end you stand on the Exchange's lock apron; the way upriver to Blockprint Row (where Sanpei's
    // blank woodblock comes from, "upriver: that's where the next act is") opens with mb1_done
    reach: [{ to: 'mp.blockprint', why: 'the way up the Cross Canal to Blockprint Row, opened as the chapter ends' }],
    facts: [
      { shot: 'spans', cond: 'mb_bridge_named', why: 'the spans lie down at the name: the bridge has it' },
      { shot: 'plaque', cond: 'mb_bridge_named', why: 'the letters come back to the plaque (the world reads the plaque by the same flag)' },
    ],
    runs: [
      { name: 'Nao · Matsu read the letter · the cat with you', comp: 'nao', pet: 'cat', flags: MATSU_LETTER, shots: ['spans', 'plaque', 'bank'], map: 'mb.exchange', flagsAfter: { mb1_done: true }, quick: true },
      { name: 'Mio · the lock opened on the Exchange\'s leave (no letter) · the bird with you', comp: 'mio', pet: 'bird', shots: ['spans', 'plaque', 'bank'], map: 'mb.exchange', flagsAfter: { mb1_done: true } },
      { name: 'Ren · Matsu read the letter · the cat met, hidden by the setting', comp: 'ren', pet: 'cat', petHidden: true, flags: MATSU_LETTER, shots: ['spans', 'plaque', 'bank'], map: 'mb.exchange' },
      { name: 'Suzu · no letter', comp: 'suzu', shots: ['spans', 'plaque', 'bank'], map: 'mb.exchange' },
    ],
  },
  'mb1.dusk': {
    edition: ED, chained: 'mb1.named', scene: 'mb.chapter_end',
    // (only reached from mb.bridge_named: the chain's runs play it)
    // On the Exchange at entry (src/content/mb/10_maps.js): Gonta (by the porters' office once the dispute is done),
    // Ichi and Haru (Ichi found, mb1_done not yet set), Take, the noodle sellers. Sen speaks in the sequence (she is
    // inside the Tally Exchange in the world). Sanpei is the boy the narration brings running through the crowd with
    // the blank block; the world never places him on the Exchange (he is at Blockprint Row before you meet Sōbē).
    // NOT excused here, on purpose: the `block` shot's crowd (src/ui/43h_seq_mb1.js:555) also draws Matsu, whom you
    // have just left in her house (mb.lockhouse), and Sōbē, the master printer upriver whom you only meet in Chapter 4
    // ("So you're the ones who gave the bridges their names back"). Neither is on the Exchange: see the report.
    extra: { mp_sanpei: 'the ink-stained boy the narration brings running through the crowd from Blockprint Row with the blank woodblock' },
    hidden: [
      { who: 'mp_sanpei', shot: 'dusk', why: 'he arrives only on the line that brings him through the crowd' },
      { who: 'mp_sanpei', shot: 'sen', why: 'he arrives only on the line that brings him through the crowd' },
    ],
    stay: [], drawsComp: true,
    facts: [
      { shot: 'dusk', cond: 'mb_bridge_named', why: 'the boards fill and the boatmen call the bridges by name: the first bridge has its name' },
      { shot: 'sen', cond: 'mb_bridge_named', why: '"Musubi Bridge" written at number one in the register' },
    ],
  },
  'mb2.press': {
    edition: ED,
    // talk to Sōbē at his desk in the workshop (quest.mp_main=1&press_notice), standing in front of him
    scene: 'mp.sobe_printed', at: ['mp.workshop', 6, 6, 'up'], flags: PRINTED, quests: { mp_main: 1 },
    // Sōbē holds the sheet up and breathes out; he stays at his place. No item: the printed notice is a flag
    // (press_notice), not something in your bag, so nothing changes hands
    stay: ['mp_sobe'],
    reach: [{ to: 'mp.blockprint', why: 'out onto Blockprint Row, the way east to Playhouse Row and Manbē' }],
    facts: [
      { shot: 'sheet', cond: 'press_notice', why: 'the sheet held up is the notice you printed' },
      { shot: 'sobe', cond: 'press_printed', why: '"the press that stood idle three days has run"' },
    ],
    runs: [
      { name: 'Ren · the name-slip block (the branch\'s phase) · the cat with you', comp: 'ren', pet: 'cat', shots: ['sheet', 'sobe'], phases: { sobe: ['slips'] }, flagsAfter: { mp_ev_slips: true }, quick: true },
      { name: 'Nao (no slips) · the bird with you', comp: 'nao', pet: 'bird', shots: ['sheet', 'sobe'], noPhase: { sobe: ['slips'] }, flagsAfter: { mp_ev_slips: false } },
      { name: 'Mio (no slips) · the bird met, hidden by the setting', comp: 'mio', pet: 'bird', petHidden: true, shots: ['sheet', 'sobe'], noPhase: { sobe: ['slips'] }, flagsAfter: { mp_ev_slips: false } },
      { name: 'Suzu (no slips)', comp: 'suzu', shots: ['sheet', 'sobe'], noPhase: { sobe: ['slips'] } },
    ],
  },
  'mb2.fireworks': {
    edition: ED,
    // Tomi at the foot of the Curtain Bridge on the festival night (mp_tomi_n, 26,23 facing down): "Please start the
    // fireworks" calls the scene, which walks you to 24,24; then mp.chapter_end fades to the next morning on the same
    // bank (mb2_done, mp.playhouse 24,23)
    scene: 'mp.fireworks', at: ['mp.playhouse', 26, 24, 'up'], flags: FEST, quests: { mp_main: 6 }, settle: 9000,
    // the crowds on the far bridges are pixel heads, nobody in particular; Tomi and the bank's people are not drawn
    stay: [], drawsComp: true,
    reach: [{ to: 'mp.blockprint', why: 'the way back through Blockprint Row (the road north from Saltglass is mended, Kakeru says)' }],
    facts: [
      { shot: 'bloom', cond: 'mp_fest_night&mp_fireworks', why: 'the festival night, the fireworks Tomi was asked for' },
      { shot: 'two', cond: 'mp_yukata&mp_fest_night&!mb2_done', why: 'the two of you in the committee\'s yukata, as the world dresses you that night (src/engine/58f_festdress.js)' },
      { shot: 'two', cond: 'mp_under_done', why: 'your companion thinks back to their anger in the Understage' },
      { shot: 'sky', cond: 'mb1_done&mp_under_done', why: '"a city with its names returned": the bridges and the stage' },
    ],
    runs: [
      { name: 'Nao · "I was glad you were angry" · the cat with you', comp: 'nao', pet: 'cat', choose: [/glad you were angry/], shots: ['bloom', 'two', 'sky'], phases: { bloom: ['cheer'], two: ['think', 'smile'] }, map: 'mp.playhouse', flagsAfter: { mb2_done: true }, quick: true },
      { name: 'Mio · "Your anger helped the actors" · the bird with you', comp: 'mio', pet: 'bird', choose: [/helped the actors/], shots: ['bloom', 'two', 'sky'], phases: { two: ['think', 'smile'] }, map: 'mp.playhouse', flagsAfter: { mb2_done: true } },
      { name: 'Ren · "quiet anger" · the cat met, hidden by the setting', comp: 'ren', pet: 'cat', petHidden: true, choose: [/quiet anger/], shots: ['bloom', 'two', 'sky'], phases: { two: ['think', 'smile'] }, map: 'mp.playhouse' },
      { name: 'Suzu · Koume\'s letter found · "Read that letter when you\'re ready"', comp: 'suzu', flags: { mp_ev_koume: true }, choose: [/when you.re ready/], shots: ['bloom', 'two', 'sky'], phases: { two: ['think', 'smile'] }, map: 'mp.playhouse' },
      { name: 'Suzu · no letter · "Thank you for being angry alongside me"', comp: 'suzu', pet: 'bird', choose: [/Thank you for being angry/], shots: ['bloom', 'two', 'sky'], phases: { two: ['think', 'smile'] }, map: 'mp.playhouse' },
    ],
  },
  'kr.vigil': {
    edition: ED,
    // the Room of Wicks' arrival (onEnter, !kr_vigil_done) where Hisae's warp puts you: 9,10 facing up
    scene: 'kr.vigil_begin', at: ['kr.vigil', 9, 10, 'up'], flags: KR_VIGIL, give: ['kr_register'], quests: { kr_main: 6 }, settle: 9000,
    encounter: { outcome: 'closed', flags: { kr_tale_closed: true } }, // the Hundredth Tale after the pictures, closed (33_cave.js conclusions)
    // Hisae and Kikyō keep the vigil in the room and are still there when the pictures give way to the encounter
    stay: ['kr_hisae', 'kr_kikyo'],
    hidden: [
      { who: 'kr_kikyo', shot: 'last', phases: ['out'], why: 'she is drawn once she begins the ninety-ninth, on her line' },
      { who: 'kr_hyakuwa', why: 'the dark gathers as a mass in the corner, never a figure: the Hundredth Tale is the encounter\'s' },
    ],
    // after the encounter kr.dawn warps you out of the lodge into the morning; the way over the pass opens with
    // kr_vigil_done
    reach: [{ to: 'kr.descent', why: 'the way east over the pass, open once the vigil is kept' }],
    facts: [
      { shot: 'room', cond: 'kr_night&kr_registers_read', why: 'the night after the registers' },
      { shot: 'last', cond: '!kr_vigil_done', why: 'the dark gathers before the vigil is kept: the encounter decides it after the pictures' },
    ],
    runs: [
      { name: 'Ren back from the Ridge Light · the tanuki with you', comp: 'ren', pet: 'tanuki', flags: REN_BACK, shots: ['room', 'hisae', 'last'], phases: { hisae: ['out'], last: ['kikyo', 'gather'] }, map: 'kr.lodge', flagsAfter: { kr_vigil_done: true }, quick: true },
      { name: 'Suzu (made up; tells with Kikyō) · the dog with you', comp: 'suzu', pet: 'dog', flags: MADE_UP, shots: ['room', 'hisae', 'last'], phases: { hisae: ['out'], last: ['kikyo', 'gather'] }, map: 'kr.lodge' },
      { name: 'Nao (made up) · the cat met, hidden by the setting', comp: 'nao', pet: 'cat', petHidden: true, flags: F(MADE_UP, { kr_nao_sakichi: true }), shots: ['room', 'hisae', 'last'], map: 'kr.lodge' },
      { name: 'Mio (made up)', comp: 'mio', flags: MADE_UP, shots: ['room', 'hisae', 'last'], map: 'kr.lodge' },
    ],
  },
  'kr.dawn': {
    edition: ED,
    // onEnter of the Pass (kr_vigil_done&!kr_done), from the lodge's east way: spawn from_lodge, 1,12 facing right
    scene: 'kr.chapter_end', at: ['kr.descent', 1, 12, 'right'], flags: KR_DAWN, give: ['kr_register'], quests: { kr_main: 7 },
    // nobody on the pass (Seiji only after kr_done with kr_seiji_gone); the two of you only
    stay: [], drawsComp: true,
    reach: [{ to: 'lf.road', why: 'down into Lanternfall\'s valley, the way the pictures look out on (opens with kr_done)' }, { to: 'kr.lodge', why: 'the lit road behind' }],
    facts: [
      { shot: 'road', cond: 'kr_vigil_done', why: 'every lantern on the road lit: the road\'s lanterns light on kr_vigil_done' },
      { shot: 'valley', cond: 'kr_done', why: 'the way down to Lanternfall is open (the pass\'s exit reads kr_done, set as the scene begins)' },
    ],
    runs: [
      { name: 'Mio · the bird with you', comp: 'mio', pet: 'bird', shots: ['road', 'valley'], phases: { valley: ['comp', 'resolve'] }, flagsAfter: { kr_done: true }, quick: true },
      { name: 'Ren (back from the ridge) · the dog with you', comp: 'ren', pet: 'dog', flags: F(REN_BACK, { kr_quarrel: false, kr_makeup_done: false }), shots: ['road', 'valley'], phases: { valley: ['comp', 'resolve'] } },
      { name: 'Nao · the tanuki met, hidden by the setting', comp: 'nao', pet: 'tanuki', petHidden: true, shots: ['road', 'valley'], phases: { valley: ['comp', 'resolve'] } },
      { name: 'Suzu', comp: 'suzu', shots: ['road', 'valley'], phases: { valley: ['comp', 'resolve'] } },
    ],
  },
  'ko.garden': {
    edition: ED,
    // the woven roots at the Garden's heart (prop ko_rootarch 12,5, two tiles wide, scene ko.gardener while
    // !ko_gardener_done): you stand below it facing up. The scene opens with the Gardener's encounter; the pictures
    // follow once it is settled (ko_gardener_done set and the prop refreshed)
    scene: 'ko.gardener', at: ['ko.garden', 12, 6, 'up'], flags: KO, quests: { ko_main: 6 },
    encounter: { outcome: 'sorted', flags: { ko_gardener_sorted: true } }, // the Gardener before the pictures, the leaves sorted (33_creatures.js)
    // nobody stands in the Garden (the Gardener is the roots and speaks with its portrait only); the two of you
    stay: [], drawsComp: true,
    reach: [{ to: 'ko.roots2', why: 'the way back up through the Root Hollows, to tell Otoha' }],
    facts: [{ shot: 'garden', cond: 'ko_gardener_done', why: 'the shape settles back into the roots: the Gardener has been answered' }],
    runs: [
      { name: 'Suzu · the dog with you', comp: 'suzu', pet: 'dog', shots: ['garden', 'leaves'], flagsAfter: { ko_gardener_done: true }, quick: true },
      { name: 'Nao · the cat with you', comp: 'nao', pet: 'cat', shots: ['garden', 'leaves'], flagsAfter: { ko_gardener_done: true } },
      { name: 'Ren · the bird met, hidden by the setting', comp: 'ren', pet: 'bird', petHidden: true, shots: ['garden', 'leaves'] },
      { name: 'Mio', comp: 'mio', shots: ['garden', 'leaves'] },
    ],
  },
  'ko.end': {
    edition: ED,
    // talk to Otoha by the Wind Stone in the Keepers' Village (24,16 facing down; quest.ko_main=7), from in front
    scene: 'ko.end', at: ['ko.village', 24, 17, 'up'], flags: F(KO, { ko_gardener_done: true }), quests: { ko_main: 7 },
    // Otoha by the stone, then from behind looking north: she stays where she stands
    stay: ['ko_otoha'],
    reach: [{ to: 'ko.shore', why: 'down to the shore and Tetsu\'s boat back to the mainland (the journal\'s next step)' }],
    facts: [{ shot: 'stone', cond: 'ko_gardener_done', why: 'the tree breathing again, the leaves falling the old way: the Gardener answered' }],
    runs: [
      { name: 'Ren · the tanuki with you', comp: 'ren', pet: 'tanuki', shots: ['stone', 'north'], flagsAfter: { ko_done: true }, quick: true },
      { name: 'Mio · the cat with you', comp: 'mio', pet: 'cat', shots: ['stone', 'north'], flagsAfter: { ko_done: true } },
      { name: 'Nao · the dog met, hidden by the setting', comp: 'nao', pet: 'dog', petHidden: true, shots: ['stone', 'north'] },
      { name: 'Suzu', comp: 'suzu', shots: ['stone', 'north'] },
    ],
  },
  'as.festival': {
    edition: ED,
    // Mitsue at her board-side place (slot 1, pinned while quest.as_main=3): "Begin the festival" in as.fest_prep
    // calls the scene; you stand in front of her on the way in
    scene: 'as.festival', at: ['as.village', 10, 10, 'up'], flags: AS, quests: { as_main: 3 },
    // the residents dance round the fire and Shō drums (all of them live here: slot 1 at a fresh campaign); Mohei is
    // placed only on market days but speaks in the sequence. Mitsue holds out the hat and stays where she is
    stay: ['as_mitsue'],
    // the hat is held out in the last shot and given on the line after the sequence ends (src/content/settle/
    // 20_scenes.js:272): nothing changes hands inside the pictures; the hat is yours once the world is back
    invAfter: { as_kasa: 1 },
    reach: [{ to: 'rw.road', why: 'the way back to the Lantern Road' }],
    facts: [
      { shot: 'night', cond: 'as_fest_night&as_fp_lan', why: 'the festival night, the lanterns hung where the village chose' },
      { shot: 'night', cond: 'as_kotoe', why: 'Kotoe walks to the festival: she came once the ways had names' },
      { shot: 'fire', cond: 'as_dp_water&as_dp_noise', why: 'Yoshizō and Taki dance side by side, Shō drums beside Natsu: both quarrels settled' },
    ],
    runs: [
      { name: 'Nao · the cat with you', comp: 'nao', pet: 'cat', shots: ['night', 'fire'], phases: { fire: ['gift'] }, tested: ['var.as_lan=canal', 'var.as_lan=hill'], flagsAfter: { as_fest_done: true, as_fest_night: false }, quick: true },
      { name: 'Ren · the dog with you', comp: 'ren', pet: 'dog', shots: ['night', 'fire'], phases: { fire: ['gift'] }, flagsAfter: { as_fest_done: true } },
      { name: 'Mio · the bird met, hidden by the setting', comp: 'mio', pet: 'bird', petHidden: true, shots: ['night', 'fire'] },
      { name: 'Suzu · the tanuki with you', comp: 'suzu', pet: 'tanuki', shots: ['night', 'fire'] },
    ],
  },
};
