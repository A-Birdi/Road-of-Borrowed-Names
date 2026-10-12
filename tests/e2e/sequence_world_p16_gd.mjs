// HX52 specs for the old guardians' pages (expansion P15e, painted in P16): gd.rw … gd.ko, merged into
// tests/e2e/sequence_world.mjs's SEQ (same format; see the comment above SEQ there).
//
// The nine carrying scenes are one template (src/content/guardians/40_scenes.js, scene gd.<key>), played by touching
// the guardian's shrine: a kr_stele (the Harbour Office's is its old filing chest) placed on one map of each region
// only when 'ed>=2&postgame' (src/content/zz_guardians.js), so every spec is a twelve-chapter journey after the story.
// The first touch wakes the guardian (gd_<key>_met; a later touch says it is still awake); "Face it" counts the
// meeting and runs the guardian's encounter (!encounter gd.<key>); a win sets gd.<key>, presses its stamp
// (!hook guardian_won, src/engine/98g_guardians.js) and only then plays the page: one shot, `won` (phase settle), on
// the one line that finds what the guardian left. The sequence ends, and after it the keepsake is given
// (!give gd_<key>_keepsake). "Not now", a step back and an encounter that ends another way show no page; a guardian
// already settled only says its place is quiet.
// The shots (src/ui/43n_seq_post.js, GUARD) paint the place, the keepsake lying in it and the guardian withdrawing as
// a cloud of pale motes: no person, no portrait, no animal, and nothing read from the campaign. So on every page:
// nobody is drawn (no drawsComp, no extra), nobody goes or stays because of the pictures, nothing changes hands
// inside the sequence (the keepsake is given after it: invAfter), and what the shot asserts of the campaign is that
// the guardian has settled and the keepsake still lies where it was left.
// The encounter runs inside the same scene, before the page, and is not under test here: a run that faces the
// guardian needs it to stand in as a win (RB.game.startEncounter resolving { result: 'win' }, as
// tests/unit/guardians.test.mjs does), the way start() stands in for challenges. The "Not now" and "already settled"
// runs never reach it.
// Companions: after the story the one you set out with is always beside you (a stretch apart, cr_apart, yn_apart,
// ko_apart, ends inside its chapter), so every run has one. Pets: by now all four could have been met (the cat at
// Reedwake, the bird at Saltglass, the dog and the tanuki at Cinder Orchard). On the Cloudroad, Steamhollow and
// Kotonoha maps the companion's presence is a condition (noCompanion '!cr_apart', '!yn_apart', '!ko_apart'), which
// the pet's own rule reads the other way round (src/engine/57_petworld.js shown(), against src/engine/50_world.js
// placeCompanion()): there the quick run takes no pet, and the pet's own run shows whether it is with you.

const F = (...o) => Object.assign({}, ...o);
// RB.edition.TWELVE (src/engine/05a_edition.js): the twelve-chapter edition, where the shrines and these scenes live
const TWELVE = 2;

// ---- the moment (flags as the story leaves them) -------------------------------------------------------------------
// the story over in a twelve-chapter journey: every chapter's end; the ending's post, sa_done and postgame
// (src/content/ch6/53_scenes_ending.js); and the New Game+ offer already made, since it opens on the first return to
// the world after the credits (src/ui/66d_ngplus.js), before any shrine can be reached
const POST = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true, sa_done: true, post: true, postgame: true, ngp_offered: true };

// Each place: where you stand facing the shrine (a free tile beside it, in the part of the map its way in reaches;
// checked against the compiled map with RB.maps.blockedStatic), the region's flags the map reads (its people, props,
// triggers and enter events) as the story left them, and the ways on from there.
const PLACES = {
  // Reedwake, the Old Mill's milling floor (rw.mill1), as the page paints it: the stele by the mill's oldest post at
  // (9,4), east of the millstones (6–7,4–5), under the loft's rafters; you stand south of it. The Mill Echo was quieted
  // in Chapter 1 and the gears freed (the dust moth that drifts west of the stones is out of the frame).
  rw: { at: ['rw.mill1', 9, 5, 'up'], flags: { rw_echo_done: true, rw_loft_done: true, rw_gears: true },
    reach: [{ to: 'rw.millroad', why: 'the door out to the mill road' }, { tile: [12, 9], why: 'the stairs down to the wheel pit (a prop with its scene, not an exit)' }] },
  // Saltglass, the Harbour Office (sg.office): the old filing chest at (2,4), approached from the door at (5,8). Since
  // Chapter 2's office scene Wataru no longer works at (7,5) (wataru_office: confessed and resolved); Omi is at her
  // desk at (5,3) throughout, out of the frame (the shot is the chest's top drawer)
  sg: { at: ['sg.office', 2, 5, 'up'], flags: { sg_wataru_confessed: true, sg_wataru_resolved: true },
    reach: [{ to: 'sg.harbor', why: 'the door out to the harbour' }] },
  // Cinder Orchard, the Kiln's Heart (co.kiln_core): the stele at (7,4), in front of the glass lantern at (7,3). The
  // Warden was settled in Chapter 3 (co_warden_down); its fight on entering is `once: false` and would start again
  // after the scene without it
  co: { at: ['co.kiln_core', 7, 5, 'up'], flags: { co_warden_down: true },
    reach: [{ to: 'co.kiln', why: 'the way back out through the kiln' }] },
  // Snowbell, the Lamp Room under the observatory's dome (sb.obs_dome): the stele at (3,6). Chapter 4 settled its
  // guardian (sb_boss_done: no trigger), lit the great lamp (sb_lamp_lit) and ended (Hoshino gone from (4,8))
  sb: { at: ['sb.obs_dome', 3, 7, 'up'], flags: { sb_boss_done: true, sb_lamp_lit: true, sb_dome_seen: true },
    reach: [{ to: 'sb.obs_gallery', why: 'the stair down to the gallery' }] },
  // Lanternfall, the Bell Chamber of the drowned tower (lf.bellhall): the stele at (13,11) in the shallows; in from the
  // stair at (8,1), you stand north of it. Chapter 5 opened the last gate (lf_gate_c), settled the chamber's boss
  // (lf_boss_done: no trigger) and rang the bell (lf_bell_rung) before the council that ends it
  lf: { at: ['lf.bellhall', 13, 10, 'down'], flags: { lf_gate_c: true, lf_boss_done: true, lf_bell_rung: true },
    reach: [{ to: 'lf.tower_low', why: 'the stair up to the tower\'s lower floor' }] },
  // Manybridge, the First Bridge (mb.firstbridge): the stele at (15,12), at the bridge's south foot (the bridge is
  // x 12–14; its name plaque on the other side at (11,12)), where the page has it: by the oldest pile. The bridge was
  // named (mb_bridge_named: the spirit and the flood gone). The map has no exit: the way back is the old door at
  // (13,15) (mb.firstbridge_back, to mb.under3)
  mb: { at: ['mb.firstbridge', 15, 13, 'up'], flags: { mb_firstbridge_seen: true, mb_bridge_named: true },
    reach: [{ prop: 'door', why: 'the old door back under the city' }] },
  // the Cloudroad Pass (cr.summit): the stele at (28,13), the summit cairn. Steamhollow's call was answered (yn_called):
  // Jinpachi is gone from (5,12), the trigger at the east edge (cr.summit_east) is off and the way down east is open
  cr: { at: ['cr.summit', 27, 13, 'right'], flags: { cr_summit_seen: true, yn_called: true },
    reach: [{ to: 'cr.hut', why: 'the hut, west' }, { to: 'yn.descent', why: 'the way down to Steamhollow, east (twelve-chapter edition, once called)' }] },
  // Steamhollow, the Kettle's Chamber (yn.kettle): the stele at (16,12), south-east of the pool. The Kettle Below was
  // settled (yn_kettle_settled: no trigger), and its after-scene played straight after, on the same visit
  yn: { at: ['yn.kettle', 15, 12, 'right'], flags: { yn_kettle_settled: true, yn_kettle_seen_after: true },
    reach: [{ to: 'yn.vents3', why: 'the vents, back up' }] },
  // Kotonoha, the Garden of Unsent Words in the Root Hollows (ko.garden): the stele at (20,16); in from the west edge.
  // The Gardener was settled (ko_gardener_done)
  ko: { at: ['ko.garden', 19, 16, 'right'], flags: { ko_garden_seen: true, ko_gardener_done: true },
    reach: [{ to: 'ko.roots2', why: 'the root passage, west' }] },
};

// the shared part of a guardian's page (one template, one shot); the place is PLACES[k]
function page(k, runs) {
  const P = PLACES[k], keep = 'gd_' + k + '_keepsake';
  return {
    scene: 'gd.' + k, edition: TWELVE, at: P.at, flags: F(POST, P.flags),
    // nobody on the map is drawn and the presence that withdraws is the guardian, never a person of the place (no
    // actor, no character, no portrait): nobody to see go, nobody the pictures hold in place
    stay: [],
    // given after the sequence ends, once: it is yours afterwards, not inside the pictures
    invAfter: { [keep]: 1 },
    reach: P.reach,
    facts: [
      { shot: 'won', cond: 'gd.' + k, why: 'the guardian has settled: the scene sets it (and presses the stamp) before the page' },
      { shot: 'won', cond: '!item.' + keep, why: 'the keepsake still lies where the guardian left it: it is yours only after the picture' },
    ],
    runs,
  };
}
// facing the guardian: the reply chosen, the one page shown, the guardian settled and met
const face = (k, o) => F({ choose: [/Face it/], shots: ['won'], flagsAfter: { ['gd.' + k]: true, ['gd_' + k + '_met']: true } }, o);

export const SPECS = {
  // the cap between the millstones under a high window, the great wheel behind, the hopper over them: the milling
  // floor the shrine stands on (rw.mill1; the stones at (6,4))
  'gd.rw': page('rw', [
    face('rw', { name: 'face it, the first meeting · Mio · the cat with you', comp: 'mio', pet: 'cat', quick: true }),
    face('rw', { name: 'face it, met before and stepped back · Nao', comp: 'nao', flags: { gd_rw_met: true } }),
    // (no page: the guardian waits, nothing is pressed or given)
    { name: '"Not now" · Suzu (no sequence)', comp: 'suzu', choose: [/Not now/], shots: [], flagsAfter: { 'gd.rw': false } },
  ]),
  // the filing chest's top drawer pulled out into the window's light, the spectacles and their tag in it
  'gd.sg': page('sg', [
    face('sg', { name: 'face it · Ren · the bird with you', comp: 'ren', pet: 'bird', quick: true }),
    face('sg', { name: 'face it · Suzu · the cat met, hidden by the setting', comp: 'suzu', pet: 'cat', petHidden: true }),
  ]),
  // the embers at the back of the kiln's vault and the fire-coloured scarf over a loose brick
  'gd.co': page('co', [
    face('co', { name: 'face it · Suzu · the dog with you', comp: 'suzu', pet: 'dog', quick: true }),
    face('co', { name: 'face it · Nao · the tanuki with you', comp: 'nao', pet: 'tanuki' }),
  ]),
  // the dome from its floor, the slit open on the night, the telescope at rest; two star-chip earrings in the starlight.
  // (The great lamp at (6,4), lit since Chapter 4 and the room's warm light in the world, is not in the picture.)
  'gd.sb': page('sb', [
    face('sb', { name: 'face it · Nao · the tanuki with you', comp: 'nao', pet: 'tanuki', quick: true }),
    face('sb', { name: 'face it, met before and stepped back · Mio', comp: 'mio', flags: { gd_sb_met: true } }),
  ]),
  // the great bell on its beam over the dark water, the little bronze bell on the stand beneath. (The page paints the
  // great bell green with patina, the look ch5.bell's `bell` shot gives it before it is rung, while by now it has been
  // rung and the world shows it bright bronze: no fact here claims the bell's state until that is settled.)
  'gd.lf': page('lf', [
    face('lf', { name: 'face it · Mio · the dog with you', comp: 'mio', pet: 'dog', quick: true }),
    face('lf', { name: 'face it · Ren · the bird met, hidden by the setting', comp: 'ren', pet: 'bird', petHidden: true }),
  ]),
  // under the first bridge, the oldest pile close by and the indigo headband round its foot at the water
  'gd.mb': page('mb', [
    face('mb', { name: 'face it · Ren · the cat with you', comp: 'ren', pet: 'cat', quick: true }),
    face('mb', { name: 'face it · Nao', comp: 'nao' }),
  ]),
  // the summit above the sea of cloud, the cairn with its strips on their cord, the white cape over its top stone
  // (the quick run takes no pet: see the header on noCompanion)
  'gd.cr': page('cr', [
    face('cr', { name: 'face it · Suzu', comp: 'suzu', quick: true }),
    face('cr', { name: 'face it · Mio · the dog with you', comp: 'mio', pet: 'dog' }),
  ]),
  // the Kettle's pool, quiet, and the steam-coloured hood folded on a boulder at its edge (the quick run: no pet)
  'gd.yn': page('yn', [
    face('yn', { name: 'face it · Nao', comp: 'nao', quick: true }),
    face('yn', { name: 'face it · Ren · the tanuki with you', comp: 'ren', pet: 'tanuki' }),
  ]),
  // the ledgers on shelves cut into the earth among the roots; the green leaf on the newest shelf (the quick run: no
  // pet)
  'gd.ko': page('ko', [
    face('ko', { name: 'face it · Mio', comp: 'mio', quick: true }),
    face('ko', { name: 'face it · Suzu · the bird with you', comp: 'suzu', pet: 'bird' }),
    // (no page: settled before, the place is quiet; the scene goes straight to its last line. The keepsake you would
    // hold by then is not given: nothing on this path reads it)
    { name: 'already settled · Ren (no sequence)', comp: 'ren', flags: { 'gd.ko': true, gd_ko_met: true }, shots: [] },
  ]),
};
