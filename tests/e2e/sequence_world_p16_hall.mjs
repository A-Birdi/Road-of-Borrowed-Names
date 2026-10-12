// HX52 specs for the Hall of a Hundred Tales' ten tales (hall.w1 … hall.w10; src/ui/43n_seq_post.js), merged into
// sequence_world.mjs's SEQ table (same format; see that file's header for what each field checks).
//
// Each tale is one shot, `tale`: the tale as a picture scroll in ink and wash, painted straight into pixels by the
// sequence's own painter (Pn.figure, Pn.house, …). Nothing in it goes through the drawing kit's figure, bust or back,
// a portrait or a pet frame, so no person of the world (you, your companion, the floor's people) is drawn as
// themselves and drawsComp is never claimed; the ink people are the tale's. The scroll plays from the tale's end scene
// `hall.wN.end`, which the capstone (`hall.wN.t10`) calls on the wing's last floor once the wing is done, so each spec
// stands where that capstone is used, facing it.
//
// What this fixture cannot reproduce (debugStart, flags, items and quests only):
//  - the Hall's own record, s.hall (src/engine/98h_hall.js: the wing record with its counted trials and pattern, and
//    the visit). Every `hall.wN…` condition reads it, so here every trial reads as not done, every wing as not relit
//    and the pattern as 0. The end scenes themselves read it once: w1's Genza line `?(hall.w1.t9)` never plays here;
//  - `!hook hall_finish` (src/ui/89h_hall.js:213) returns at once without a visit. In play it leaves the wing and
//    carries you to its hearth in the foyer (C.hallHearths), and from there the foyer's west door leads on to
//    kr.hall. Here the world stays on the last floor, which has no exits, so where you stand afterwards (`map`) and
//    the ways on (`reach`) are not checked: `reach: []` in every spec, deliberately;
//  - people placed by `hall.wN.tK` conditions stand where a Hall without a record puts them (w1 Genza on the west
//    road, not by the lamp; w6 Otsuta still at the gate, though in play she has gone down the pass; …). `stay` names
//    the person (the char), which holds under either placement;
//  - the facts the tales stand on in play (the capstone counted, hall.wN.t10; the wing relit, hall.wN) cannot be read
//    here. The specs read the capstone's own floor flag instead (xp_hall_wN_f2_t10, set by hall.wN.t10 just before it
//    calls the end) and the tale's done flag (hall_wN_done, set after the pictures; the travel volume's page is
//    witnessed by it: src/content/hall/40_records.js).
// The floors' mechanism flags (lamps lit, things given back, cases hung, …) are left unset: which ones a floor ends
// with depends on the pattern, which lives in s.hall; they change only which props the floor shows.
//
// Companions: the Hall opens only after the story (the key ledger), when you always travel with one of the four; any
// can be with you (each end has a line for each). The `?(!comp)` lines of w9 and w10 have no run (nothing after the
// story leaves you alone). Pets: by then all four animals can have been met; the Hall's maps hide none.

// the twelve-chapter edition (RB.edition.TWELVE, src/engine/05a_edition.js): the Hall's maps are edition 2
const ED = 2;
const F = (...o) => Object.assign({}, ...o);
// after the story, the key ledger in hand, the foyer seen; the New Game+ offer already made when the story ended (else
// it opens over the map after the scene: src/ui/66d_ngplus.js); as tests/e2e/hall.mjs starts its journeys
const POST = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true, postgame: true, hall_ledger: true, hall_foyer_seen: true, ngp_offered: true };
// the moment the capstone calls the end: the wing's three floors arrived on (their arrival scenes seen) and the last
// floor's three trials marked by their own flags (t8, t9, and t10 itself just before the call)
const told = (w, more) => F(POST, {
  ['hall_' + w + '_f1_seen']: true, ['hall_' + w + '_f2_seen']: true, ['hall_' + w + '_f3_seen']: true,
  ['xp_hall_' + w + '_f2_t8']: true, ['xp_hall_' + w + '_f2_t9']: true, ['xp_hall_' + w + '_f2_t10']: true,
}, more || {});
// the nine tales told before the tenth door opens (their own done flags; the seal itself reads s.hall)
const NINE = Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ['hall_w' + n + '_done', true]));
// every tale: the capstone done when the scroll is first shown; the tale told by the scene's end
const TOLD = (w, why) => [
  { shot: 'tale', cond: 'xp_hall_' + w + '_f2_t10', why },
  { shot: 'tale', cond: 'hall_' + w + '_done', when: 'scene', why: 'the tale told: written as the light folds back, after the pictures (it witnesses the volume\'s page)' },
];

export const SPECS = {
  'hall.w1': {
    // before the great lamp (sb_greatlamp at 15,10, two by two), on the road up from the way in: hall.w1.t10 calls the
    // end once the lamp is relit (src/content/hall/21_w1_scenes.js:348)
    scene: 'hall.w1.end', edition: ED, hall: 'w1', at: ['hall.w1f3', 15, 12, 'up'], flags: told('w1'),
    // Genza walked with you to the lamp and stays to hear it (by it as hall_genza_lamp in play; on the west road here,
    // the Hall having no record); the travellers of the scroll are the tale's, none of them on the floor
    stay: ['hall_genza'], inv: [], reach: [],
    hidden: [{ who: 'hall_lamp', why: 'the great lamp\'s own voice: a lamp, never a figure' }],
    facts: TOLD('w1', 'the lamp at the crossroads lit, the travellers on its roads: the great lamp relit'),
    runs: [
      { name: 'Mio · the cat with you', comp: 'mio', pet: 'cat', shots: ['tale'], quick: true },
      { name: 'Nao', comp: 'nao', shots: ['tale'] },
    ],
  },
  'hall.w2': {
    // before the wedding table (16,5, two wide), from below: hall.w2.t10 (src/content/hall/22_w2_scenes.js:342)
    scene: 'hall.w2.end', edition: ED, hall: 'w2', at: ['hall.w2f3', 16, 6, 'up'], flags: told('w2'),
    // the procession goes beyond the torii with the bride: Kozue speaks under the scroll and stands on no map of the
    // Hall; she asks you to look after her little brother, who stays
    gone: ['hall_kozue'], stay: ['hall_konta'], inv: [], reach: [],
    facts: TOLD('w2', 'the wedding procession going in under the torii: the cup passed round'),
    runs: [
      { name: 'Nao · the dog with you', comp: 'nao', pet: 'dog', shots: ['tale'], quick: true },
      { name: 'Suzu · the bird met, hidden by the setting', comp: 'suzu', pet: 'bird', petHidden: true, shots: ['tale'] },
    ],
  },
  'hall.w3': {
    // before the dawn bell (lf_bigbell at 15,3, two by two), from below: hall.w3.t10 (src/content/hall/23_w3_scenes.js:455)
    scene: 'hall.w3.end', edition: ED, hall: 'w3', at: ['hall.w3f3', 15, 5, 'up'], flags: told('w3'),
    // Shino, who rang it, at the foot of the bell; Mame, whose night it ends, speaks from where she stands (by the
    // steps in play, hall_mame_after; where t9 found her here); the scroll sends nobody away
    stay: ['hall_shino', 'hall_mame'], inv: [], reach: [],
    facts: TOLD('w3', 'the belfry at dawn over the valley: the bell rung'),
    runs: [
      { name: 'Ren · the tanuki with you', comp: 'ren', pet: 'tanuki', shots: ['tale'], quick: true },
      { name: 'Mio', comp: 'mio', shots: ['tale'] },
    ],
  },
  'hall.w4': {
    // facing Myōshin on her veranda (hall_myoshin at 13,4, facing down): hall.w4.t10 is talking to her
    // (src/content/hall/24_w4_scenes.js:436)
    scene: 'hall.w4.end', edition: ED, hall: 'w4', at: ['hall.w4f3', 13, 5, 'up'], flags: told('w4'),
    // the lender under the eave stays; Gosaku goes home through the rain with the red umbrella (the karakasa,
    // they/them) open over his head: the scroll draws him out in the rain under it, and its first line says he goes.
    // Both stand on the floor when the world returns (hall_gosaku3 at 17,16; the umbrella at 19,4 in play, at 19,19
    // here), unconditionally, until hall_finish folds you out: this check fails in play as here
    stay: ['hall_myoshin'], gone: ['hall_gosaku', 'hall_karakasa'], inv: [], reach: [],
    facts: TOLD('w4', 'the umbrella in the rain with the one who borrowed it: returned to Myōshin first'),
    runs: [
      { name: 'Suzu · the cat with you', comp: 'suzu', pet: 'cat', shots: ['tale'], quick: true },
      { name: 'Ren', comp: 'ren', shots: ['tale'] },
    ],
  },
  'hall.w5': {
    // before the well (16,3, two wide), from below: hall.w5.t10, the well-cleaning (src/content/hall/25_w5_scenes.js:402)
    scene: 'hall.w5.end', edition: ED, hall: 'w5', at: ['hall.w5f3', 16, 4, 'up'], flags: told('w5'),
    // the frog in the well speaks from his well; the east house and the west house (Osugi, Mosuke) cook at one pot:
    // both households stay where they live
    stay: ['hall_kero', 'hall_osugi', 'hall_mosuke'], inv: [], reach: [],
    facts: TOLD('w5', 'the two wells and the one pot between the houses: the wells cleaned together'),
    runs: [
      { name: 'Mio · the bird with you', comp: 'mio', pet: 'bird', shots: ['tale'], quick: true },
      { name: 'Nao · the tanuki met, hidden by the setting', comp: 'nao', pet: 'tanuki', petHidden: true, shots: ['tale'] },
    ],
  },
  'hall.w6': {
    // before the gate (cr_gate at 16,3), from the road below it: hall.w6.t10, the night kept at the gate with Ibuki
    // (src/content/hall/28_w6_scenes.js:422)
    scene: 'hall.w6.end', edition: ED, hall: 'w6', at: ['hall.w6f3', 16, 4, 'up'], flags: told('w6'),
    // Ibuki keeps the gate; Otsuta comes back up the pass in the morning (the small figure on the path: arriving,
    // not left in place, so neither list names her: in play she is off the floor, here the Hall's missing record
    // leaves her at the gate); Kihei speaks from his board, a voice here (he stands on the first floor)
    stay: ['hall_ibuki'], inv: [], reach: [],
    facts: TOLD('w6', 'the gate and its board at morning, someone coming back up the pass: the night kept').concat([
      { shot: 'tale', cond: 'xp_hall_w6_f2_t9', why: 'Otsuta coming back up the pass: the gate was opened for her (t9 is marked only when she went through)' },
    ]),
    runs: [
      { name: 'Ren · the dog with you', comp: 'ren', pet: 'dog', shots: ['tale'], quick: true },
      { name: 'Suzu', comp: 'suzu', shots: ['tale'] },
    ],
  },
  'hall.w7': {
    // before the little gate by the stream (cr_gate at 16,5), from the garden: hall.w7.t10, leaving the house
    // (src/content/hall/31_w7_scenes.js:365)
    scene: 'hall.w7.end', edition: ED, hall: 'w7', at: ['hall.w7f3', 16, 6, 'up'], flags: told('w7'),
    // the one walking away from the house on the scroll is the one leaving it (you, by the gate); Owan, who speaks for
    // the house, and Magoroku, whose rice never ran low after, stay in it
    stay: ['hall_owan', 'hall_magoroku'], inv: [], reach: [],
    facts: TOLD('w7', 'the house with its door lit and someone going away along the path: the house left'),
    runs: [
      { name: 'Nao · the cat with you', comp: 'nao', pet: 'cat', shots: ['tale'], quick: true },
      { name: 'Mio · the dog met, hidden by the setting', comp: 'mio', pet: 'dog', petHidden: true, shots: ['tale'] },
    ],
  },
  'hall.w8': {
    // before the inn's ledger on its desk (20,11, two wide), from below: hall.w8.t10, the record of the night
    // (src/content/hall/34_w8_scenes.js:382)
    scene: 'hall.w8.end', edition: ED, hall: 'w8', at: ['hall.w8f3', 20, 12, 'up'], flags: told('w8'),
    // the inn's people the morning after stay where they are (Omatsu at her ledger, Saki, Gonroku); Hisa and the old
    // traveller Kichibei come back in the tale's morning and speak, but are on no map (arriving, not left in place)
    stay: ['hall_omatsu', 'hall_saki', 'hall_gonroku'], inv: [], reach: [],
    facts: TOLD('w8', 'the three witnesses kneeling at the inn, the night set down: the inn\'s record written'),
    runs: [
      { name: 'Suzu · the tanuki with you', comp: 'suzu', pet: 'tanuki', shots: ['tale'], quick: true },
      { name: 'Nao', comp: 'nao', shots: ['tale'] },
    ],
  },
  'hall.w9': {
    // facing the young woman by the loom room (hall_musume at 25,7, facing down): hall.w9.t10, the farewell, is
    // talking to her (or using the loom; src/content/hall/37_w9_scenes.js:510)
    scene: 'hall.w9.end', edition: ED, hall: 'w9', at: ['hall.w9f3', 25, 8, 'up'], flags: told('w9'),
    // the crane lays the last bolt before the old couple and rises into the morning sky: the scroll draws her in
    // flight over the house, its first line says so. The old couple stay. The young woman (hall_musume, the crane)
    // stands at 25,7 unconditionally when the world returns, until hall_finish folds you out: this check fails in
    // play as here. Sabu calls after her from the first floor, a voice here
    gone: ['hall_musume'], stay: ['hall_otoku', 'hall_yosaku'], inv: [], reach: [],
    facts: TOLD('w9', 'the crane flying from the old couple\'s house: the farewell made'),
    runs: [
      { name: 'Mio · the bird with you', comp: 'mio', pet: 'bird', shots: ['tale'], quick: true },
      { name: 'Ren', comp: 'ren', shots: ['tale'] },
    ],
  },
  'hall.w10': {
    // before the hundredth lantern (sb_greatlamp at 15,9, two by two), from below: hall.w10.t10, the hundredth tale
    // told (src/content/hall/39a_w10_scenes.js:401); the nine tales before it told
    scene: 'hall.w10.end', edition: ED, hall: 'w10', at: ['hall.w10f3', 15, 11, 'up'], flags: told('w10', NINE),
    // after the pictures the scene goes on to Keeper Tsuru (hall.tsuru_final), who in play sits by the tenth hearth
    // in the foyer; here the world is still the floor, so she walks in as a speaker and out again (settle)
    settle: 9000,
    // Sōan and Kohaku, who sat down on either side to hear it, speak; "let's go home together" is a wish, not shown
    // going
    stay: ['hall_soan', 'hall_kohaku'], reach: [],
    // nothing changes hands in the pictures; Tsuru's keepsake, the Lantern of the Hundred, comes after them
    inv: [], invAfter: { hall_lantern: 1 },
    facts: TOLD('w10', 'the Hall at night, every lamp lit, you close holding up the hundredth light: the hundredth tale told'),
    runs: [
      { name: 'Ren · the cat with you · "My own shadow"', comp: 'ren', pet: 'cat', choose: [/My own shadow/], shots: ['tale'], flagsAfter: { hall_tsuru_final: true }, quick: true },
      { name: 'Suzu · the dog with you · "Nothing"', comp: 'suzu', pet: 'dog', choose: [/lights only grew brighter/], shots: ['tale'], flagsAfter: { hall_tsuru_final: true } },
      { name: 'Nao · "My own shadow"', comp: 'nao', choose: [/My own shadow/], shots: ['tale'], flagsAfter: { hall_tsuru_final: true } },
      { name: 'Mio · the bird met, hidden by the setting · "Nothing"', comp: 'mio', pet: 'bird', petHidden: true, choose: [/lights only grew brighter/], shots: ['tale'], flagsAfter: { hall_tsuru_final: true } },
    ],
  },
};

// The tale's end begins in the dark and goes back into it (src/content/hall/*_scenes.js `!fade out` before the
// pictures); the fold-back is told in the dark, and the world shows again at the wing's hearth in the foyer
// (`!hook hall_finish`). So on return nobody of the tale is in view, and every run ends in the foyer.
for (const S of Object.values(SPECS)) {
  S.stay = [];
  for (const R of S.runs || []) R.map = 'hall.foyer';
}
