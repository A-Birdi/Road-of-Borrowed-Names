// HX52 specs (tests/e2e/sequence_world.mjs) for the twelve-chapter edition's Cloudroad and Steamhollow sequences
// (Chapters 10 and 11, the travel volume's pages played in the world, P16): cr.summit, cr.letter, cr.relay, yn.kettle,
// yn.end. Same format and fields as the SEQ table they are merged into.
//
// The moments are synthetic fixtures of a twelve-chapter campaign (edition TWELVE, src/engine/05a_edition.js): the
// flags, quests and items the callers of each carrying scene leave at that moment, no more than the story guarantees.
// Companions: on the Cloudroad and in Steamhollow the companion is on the map while the region's apart flag is off (the
// maps' noCompanion '!cr_apart' / '!yn_apart', read by RB.world.placeCompanion). The surety stretch (cr_apart) ends at
// the Barrier as the gate opens for both (cr_passed), so the pass and the stations after it have the companion back.
// In Nao's journey Nao runs the relay's last leg down to Kirishita alone (cr.nao_decides, comp_away) and asks you to
// come after; the way up from Kumoi to the High Pass waits for that night on the porch (cr_nao_night: cr.kumoi_east),
// so the pass, the letter and its delivery always have Nao back (they once could be reached with Nao away). In
// Steamhollow the nights apart and the quarrels come after the Kettle and are over before the mediation can begin
// (Rokubei waits for yn_eve_done), so the Kettle and the vow always have the companion.
// Pets: by Chapter 10 all four can have been met (the cat at Reedwake, the bird at Saltglass, the dog and the tanuki at
// Cinder Orchard).
const F = (...o) => Object.assign({}, ...o);
const TWELVE = 2;
const on = (...ks) => Object.fromEntries(ks.map((k) => [k, true]));
const nums = (p, a, b) => Array.from({ length: b - a + 1 }, (_, i) => p + (a + i));

// ---- the moments ----------------------------------------------------------------------------------------------------
// the chapters before the Cloudroad, done (story order rw sg mb1 mb2 co sb kr lf ko; each chapter's own done flag)
const D10 = on('rw_arrived', 'rw_road_lit', 'departed', 'ch1_done', 'ch2_done', 'mb1_done', 'mb2_done', 'ch3_done', 'ch4_done', 'kr_done', 'ch5_done', 'ko_done');
// the Cloudroad climbed station by station: every station reached (cr_st), its lamp named (1–5 before you may leave
// by the east end, cr.depart; Kirishita's is kept lit by Sakichi, cr.arrive6; Kumoi's, 7, named here too, although
// nothing needs it: see cr.relay), the message handed on and the road chosen at 1–5; the Barrier: the papers checked,
// the guarantee fetched alone from Kumoi, the gate opened for both (cr_passed)
const CR7 = F(D10, on('cr_called', 'cr_kanbe_met', ...nums('cr_given', 1, 5), ...nums('cr_plan', 1, 5), ...nums('cr_st', 1, 7), ...nums('cr_lamp', 1, 7),
  'cr_barrier_seen', 'cr_seals_checked', 'cr_above_seen', 'cr_shizu_waited', 'cr_passed'));
// the High Pass climbed to the Courier's Hut and the courier answered (the hut's east door to the summit opens then)
const CRP = F(CR7, on('cr_pass1_seen', 'cr_pass2_seen', 'cr_bridge_crossed', 'cr_pass3_seen', 'cr_hut_seen', 'cr_courier_done'));
// the Cloudroad done (cr.deliver, cr.end); the summit seen on the way down to Steamhollow (its first visit plays it)
const CRD = F(CRP, on('cr_summit_seen', 'cr_message_taken', 'cr_delivered', 'cr_bridge_mended', 'cr_ledge_cleared', 'cr_done'));
// Steamhollow down to the Kettle's chamber: the call over the pass, the town, the rooms, both houses heard, the quarrel
// on the red bridge, Rokubei's word and Aki's grille; the Valve Hall's far valve (its handle from the nook) for the stair
const YNV = F(CRD, on('yn_called', 'yn_descent_seen', 'yn_arrived', 'yn_rokubei_met', 'yn_kami_seen', 'yn_oritsu_met', 'yn_rooms_done', 'yn_shimo_seen',
  'yn_shimo_heard', 'yn_quarrel', 'yn_guild_told', 'yn_vents_open', 'yn_vents1_seen', 'yn_handle_taken', 'yn_vent2', 'yn_vents2_seen', 'yn_vents3_seen'));
// the Kettle settled (and seen settled), the evening over (each companion's own: yn_eve_done), the mediation held (one
// of its ends) and the agreement written with 全体 taught (yn.mediation_start, yn.agreement_write, yn.zentai)
const YNM = F(YNV, on('yn_kettle_settled', 'yn_kettle_seen_after', 'yn_evening', 'yn_eve_started', 'yn_eve_done', 'yn_mediated', 'yn_med_together', 'mod_zentai'));
const CR_ITEMS = ['cr_ledger', 'cr_papers']; // Kanbe's, at Oiwake (cr.kanbe_first); nothing on the road takes them
const YN_ITEMS = CR_ITEMS.concat(['yn_letter', 'yn_towel', 'yn_yukata']); // Rokubei's letter (yn.call); the inn's towel and yukata (yn.rooms_start)

export const SPECS = {
  'cr.summit': {
    edition: TWELVE, scene: 'cr.summit_first', at: ['cr.summit', 1, 10, 'right'], flags: CRP, give: CR_ITEMS, quests: { cr_main: 7 },
    // the Pass's onEnter the first time (23_scenes_pass.js replaces the map's own list): out of the hut's east door onto
    // the summit's west end (spawn from_west). The letter box at the hut may still be unopened (the door opens with the
    // courier answered, not with the box taken). The pictures: the cloud sea; then the steam far to the north-east and
    // the two of you small on the edge, from behind. Nobody lives on the pass (Jinpachi comes up only once the chapter
    // is done), so nobody stays or goes; the way on foot is back past the hut (the post is still to deliver, and the way
    // down to the steam opens only with Chapter 11's call: cr.summit_east)
    stay: [], drawsComp: true, reach: [{ to: 'cr.hut', why: 'back down past the Courier\'s Hut, the post still to deliver' }],
    runs: [
      { name: 'Suzu · the dog with you', comp: 'suzu', pet: 'dog', shots: ['clouds', 'steam'], quick: true },
      { name: 'Ren · the cat met, hidden by the setting', comp: 'ren', pet: 'cat', petHidden: true, shots: ['clouds', 'steam'] },
      { name: 'Mio', comp: 'mio', shots: ['clouds', 'steam'] },
      { name: 'Nao · the bird with you', comp: 'nao', pet: 'bird', shots: ['clouds', 'steam'] },
      // Nao away for the night: they ran the relay's last leg down to Kirishita, and the porch is not yet visited
    ],
  },
  'cr.letter': {
    edition: TWELVE, scene: 'cr.deliver', at: ['cr.sakashita', 18, 12, 'up'], flags: F(CRP, { cr_message_taken: true }), give: CR_ITEMS.concat(['cr_message']), quests: { cr_main: 8 },
    settle: 9000, chain: ['cr.relay'],
    // Heisuke's talk at Sakashita once the courier's letter is yours (cr_message_taken&!cr_done): he stands at the
    // relay office's door (18,11), you in the street before him. cr.deliver calls cr.end, so the chapter's end (cr.relay)
    // follows in the same scene. The pictures: Heisuke with the letter open in his hands from the first shot, reading,
    // then the long silence; he stays at his door. The letter leaves your keeping with the picture's first line ("You
    // hand him the box"), the one that shows it in his hands; your hands are empty
    stay: ['cr_heisuke'], held: { pc: null }, inv: [{ item: 'cr_message', n: -1, shot: 'letter', phase: 'open' }],
    // the ways the scene leaves open: Sono's inn, where Heisuke asks you to come with him later (cr.family), and the
    // road up the mountain, where the relay runs again
    reach: [{ to: 'cr.saka_inn', why: 'Sono\'s inn, where Heisuke asks you to come with him' }, { to: 'cr.leg3', why: 'the road on up the mountain, the relay\'s road' }],
    facts: [{ shot: 'letter', cond: 'cr_message_taken', why: 'the letter he reads is the one you took from the courier\'s box at the hut' }],
    runs: [
      { name: 'Mio · Kikue\'s message after the pictures · the cat with you', comp: 'mio', pet: 'cat', shots: ['letter'], flagsAfter: { cr_delivered: true, cr_done: true }, quick: true },
      { name: 'Ren · the bird met, hidden by the setting', comp: 'ren', pet: 'bird', petHidden: true, shots: ['letter'] },
      { name: 'Nao', comp: 'nao', shots: ['letter'] },
      { name: 'Suzu · the tanuki with you', comp: 'suzu', pet: 'tanuki', shots: ['letter'] },
      // Kumoi's lamp is the one lamp nothing makes you name (no departure scene at station 7; the way to the pass needs
      // only cr_passed), so the relay can reach the chapter's end with Kumoi's dark (the campaign fixture F-ren-cr_done
      // is one): the relay page reads each lamp (cr_lamp<n>, recorded as it is read) and draws Kumoi's station dark
      { name: 'Ren · Kumoi\'s lamp never named (nothing needs it)', comp: 'ren', flags: { cr_lamp7: false }, shots: ['letter'] },
    ],
  },
  'cr.relay': {
    // only ever played from cr.deliver (the summit's own onEnter for cr.end, 11_pass.js, is replaced by
    // 23_scenes_pass.js's), so it is checked in every cr.letter run. Night on the mountain: the stations' lamps lit
    // from the foot to the pass (each as the world has it: Kumoi's may be dark), a courier's lantern on the move between
    // the third and the fourth; nobody drawn
    chained: 'cr.letter', scene: 'cr.end', stay: [],
    facts: [
      { shot: 'relay', cond: 'cr_lamp1&cr_lamp2&cr_lamp3&cr_lamp4&cr_lamp5&cr_lamp6', why: 'the six lamps the story has you name before the chapter can end are lit, as the stations\' everlasting lamps stand in the world (the seventh, Kumoi\'s, is drawn as the world has it)' },
      { shot: 'relay', cond: 'cr_done&cr_bridge_mended&cr_ledge_cleared', when: 'scene', why: 'the relay running again, the bridge mended and the ledge cleared, as its lines tell' },
    ],
  },
  'yn.kettle': {
    edition: TWELVE, scene: 'yn.kettle', at: ['yn.kettle', 9, 9, 'up'], flags: YNV, give: YN_ITEMS, quests: { yn_main: 5 },
    // the chamber's trigger row (y 9, x 6–13, while the Kettle is unsettled), walked into straight up from the stair
    // (spawn 9,13). The encounter settles the Kettle (yn_kettle_settled) before the pictures; they show the Kettle
    // sinking in its pool, the bubbles going out, the steam rising quietly: nobody drawn. Aki speaks one line under them
    // when you have met her in the deep vents ("I'll be waiting by the Kettle"), and the world has her there, at the
    // pool's edge (15,8), out of the pictures
    stay: [], reach: [{ to: 'yn.vents3', why: 'back up through the vents to the town (the evening, then the meeting)' }],
    hidden: [{ who: 'yn_aki', why: 'at the pool\'s edge, out of the pictures: they show only the Kettle and its pool' }],
    facts: [{ shot: 'pool', cond: 'yn_kettle_settled', why: 'settled in the encounter just before: the chamber\'s settled light and music' }],
    runs: [
      { name: 'Aki met, her voice in the chamber · Nao · the cat with you', comp: 'nao', pet: 'cat', flags: { yn_aki_met: true }, shots: ['pool'], quick: true },
      { name: 'Aki never met · Mio', comp: 'mio', shots: ['pool'] },
      { name: 'Aki met, the float found · Ren · the tanuki met, hidden by the setting', comp: 'ren', pet: 'tanuki', petHidden: true, flags: { yn_aki_met: true, yn_float_found: true, yn_clock_seen: true }, shots: ['pool'] },
      { name: 'Aki never met · Suzu · the bird with you', comp: 'suzu', pet: 'bird', shots: ['pool'] },
    ],
  },
  'yn.end': {
    edition: TWELVE, scene: 'yn.end', at: ['yn.upper', 29, 11, 'down'], flags: YNM, give: YN_ITEMS.concat(['yn_agreement']), quests: { yn_main: 7 }, settle: 9000,
    // called by the walk (yn.walk), the upper street's onEnter once the valley has mediated: you step out of the guild
    // hall's door onto the upper street (29,11), facing down. The pictures: every lantern lit, the red bridge with both
    // inns' guests in yukata (figures in the inns' colours, not anyone of the map); then the silent north ridge and your
    // companion's resolve, in the shot's own phase. Nobody of the street is shown; the north road, closed until now
    // (yn.north_closed), is open once the chapter ends
    stay: [], drawsComp: true, reach: [{ to: 'yn.north', why: 'the north road towards the ridge and the Archive, open once the valley has agreed' }],
    facts: [{ shot: 'valley', cond: 'yn_mediated', why: 'the two houses\' guests on one bridge: the agreement made at the guild hall that morning' }],
    runs: [
      { name: 'Ren · hand in hand · the tanuki with you', comp: 'ren', pet: 'tanuki', flags: { yn_hand: true, yn_ren_quarrel: true, yn_ren_madeup: true }, shots: ['valley', 'ridge'], phases: { ridge: ['comp'] }, flagsAfter: { yn_done: true }, quick: true },
      { name: 'Mio · side by side, after her night apart', comp: 'mio', flags: { yn_side: true, yn_mio_night: true, yn_mio_crossroads: true, yn_mio_back: true }, shots: ['valley', 'ridge'], phases: { ridge: ['comp'] } },
      { name: 'Suzu · hand in hand, after her night apart · the dog met, hidden by the setting', comp: 'suzu', pet: 'dog', petHidden: true, flags: { yn_hand: true, yn_suzu_night: true, yn_suzu_crossroads: true, yn_suzu_back: true }, shots: ['valley', 'ridge'], phases: { ridge: ['comp'] } },
      { name: 'Nao · side by side · the cat with you', comp: 'nao', pet: 'cat', flags: { yn_side: true, yn_nao_quarrel: true, yn_nao_madeup: true }, shots: ['valley', 'ridge'], phases: { ridge: ['comp'] } },
    ],
  },
};
