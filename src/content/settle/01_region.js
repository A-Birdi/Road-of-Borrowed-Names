/* Ashihara Shinden (葦原新田, "the new fields on the reed plain"), the new settlement (expansion P15f; plan 07_REGIONS.md
 * R7, sealed S6: the sixth Atlas restoration's lantern on the Lantern Road names it, "a village that wasn't there last
 * year"). Postgame, twelve-chapter journeys only: a path opens at the Lantern Road's north-east corner once the story
 * is over. A village with a name and almost nothing else; the player helps it become a place: naming its three ways
 * (naming is this world's magic), writing its first notices (people do what they say), settling its first two
 * quarrels (mediation, E8), arranging its first festival (a smaller cousin of Manybridge's, A50). Residents move in as
 * it grows, keep routines (W2: src/engine/53_town.js) and every improvement changes the map. Never money, never upkeep.
 * The people (pronouns as given): Mitsue (she), who leads the settlers; Yoshizō (he) and Taki (she), farmers whose rice
 * shares one channel; Shō (they), the smith; Natsu (she), with a baby next door to the forge; Kotoe (she), a teacher
 * who comes once letters can find the village; Mohei (he), a pedlar who comes on market days.
 * Here: palette, chart, the way in, the people, the village map and its growth, the routines. Tasks and quarrels:
 * 10_learning.js; scenes: 20_scenes.js; records: 40_records.js. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const TL = RB.tiles;
  // new thatch and fresh-cut timber, young rice, reed beds going gold, a pale wide sky
  TL.PAL.ashihara = Object.assign({}, TL.PAL.reedwake || {}, {
    grass: ['#86a85e', '#96b86c', '#aecb84', '#6a8a4c'], field: ['#7aa84e', '#8cba5c', '#5e8e3c', '#a8cc78'],
    wood: ['#b08a5a', '#c8a070', '#8a6a44', '#dcbc8c'], roof: ['#b89a5a', '#a08448', '#86703c', '#d0b478'],
    water: ['#4a8aa0', '#5a9ab0', '#86bcc8', '#e4f2f2'], sky: '#e6ecdc', dark: '#161a12',
  });
  TL.addRamps(TL.PAL.ashihara);

  // ---- the chart and the way in (twelve-chapter journeys, after the story) ------------------------------------------
  C.places.ashihara = {
    name: T('Ashihara Shinden', '{葦原|あしはら}{新田|しんでん}'), map: 'as.village', x: 1, y: 10, dir: 'right', pos: [356, 268], region: 'ashihara',
    desc: 'A new village on the reed plain past the Lantern Road: new fields, new houses, and names still to be given.', edition: 2,
  };
  C.roads.push(['reedwake', 'ashihara', { edition: 2, if: 'postgame' }]);
  const road = C.maps['rw.road'];
  road.exits.push({ x: 31, y: 3, w: 1, h: 2, to: 'as.village', sp: 'from_road', dir: 'right', if: 'ed>=2&postgame' });

  // ---- the people -----------------------------------------------------------------------------------------------------
  const ch = (id, d) => (C.chars[id] = d);
  // Mitsue: came up from Reedwake's drowned lower fields after the storm and talked twelve families into trying again
  // here; brisk, warm, always holding a list (she/her)
  ch('as_mitsue', { name: T('Mitsue', 'ミツエ'), voice: { pitch: 0.96 },
    look: { skin: 2, hair: 'wrap', wrapCol: '#4a6a5a', hairColor: 1, cloth: ['#5a7a6a', '#46604e', '#e8e0cc'], shape: 'apron', acc: [] },
    portrait: { eyes: 'narrow', style: 'wrap', wrapCol: '#4a6a5a', collar: 'apron', bg: '#24322a' } });
  // Yoshizō: dug the channel himself and has not forgotten it; loud, honest, frightened of a bad first harvest (he/him)
  ch('as_yoshizo', { name: T('Yoshizō', 'ヨシゾウ'), voice: { pitch: 0.78 },
    look: { skin: 4, hair: 'short', hairColor: 1, cloth: ['#7a6a4a', '#5e5038', '#d8ccb0'], shape: 'tunic', acc: ['headband'], bandCol: '#e8e0cc' },
    portrait: { eyes: 'sharp', style: 'short', acc: ['headband'], bandCol: '#e8e0cc', bg: '#2e2a1e' } });
  // Taki: farms the lower paddy with her two boys; quick-tongued, quicker to help (she/her)
  ch('as_taki', { name: T('Taki', 'タキ'), voice: { pitch: 1.04 },
    look: { skin: 3, hair: 'ponytail', hairColor: 2, cloth: ['#a85a4a', '#8a463a', '#ecdcc4'], shape: 'apron', acc: [] },
    portrait: { eyes: 'round', style: 'ponytail', collar: 'apron', bg: '#36221c' } });
  // Shō: the village's smith, of few words; every sickle for the harvest comes off their anvil (they/them)
  ch('as_sho', { name: T('Shō', 'ショウ'), voice: { pitch: 0.86 },
    look: { skin: 3, hair: 'spiky', hairColor: 1, cloth: ['#4a4a52', '#38383e', '#c8b89a'], shape: 'apron', acc: [] },
    portrait: { eyes: 'sharp', style: 'spiky', collar: 'apron', bg: '#222226' } });
  // Natsu: next door to the forge with a new baby who will not sleep through the hammering (she/her)
  ch('as_natsu', { name: T('Natsu', 'ナツ'), voice: { pitch: 1.1 },
    look: { skin: 2, hair: 'bob', hairColor: 1, cloth: ['#c89aa8', '#a87a88', '#f0e6dc'], shape: 'robe', acc: [] },
    portrait: { eyes: 'round', style: 'bob', bg: '#3a2a30' } });
  // Kotoe: a teacher from Saltglass who writes, once the village has addresses, asking to open a school (she/her)
  ch('as_kotoe', { name: T('Kotoe', 'コトエ'), voice: { pitch: 1.0 },
    look: { skin: 2, hair: 'bob', hairColor: 6, cloth: ['#4a5a8a', '#38466a', '#e8e0cc'], shape: 'robe', acc: ['glasses'], glassCol: '#6a5a4a' },
    portrait: { eyes: 'narrow', style: 'bob', acc: ['glasses'], glassCol: '#6a5a4a', bg: '#222a3a' } });
  // Mohei: a pedlar who comes up the Lantern Road on market days with everything a new village lacks (he/him)
  ch('as_mohei', { name: T('Mohei', 'モヘエ'), voice: { pitch: 0.92 },
    look: { skin: 4, hair: 'short', hairColor: 6, cloth: ['#8a7a3a', '#6e602c', '#e8dcc0'], shape: 'tunic', acc: ['satchel'], age: 'old' },
    portrait: { eyes: 'narrow', style: 'short', age: 'old', bg: '#2e2a18' } });

  // ---- the village ------------------------------------------------------------------------------------------------------
  // Growth, in the order the player brings it (each a flag set in 20_scenes.js):
  //   as_nm_main/canal/hill  a way named: its signpost       as_streets  all three: the post box, Kotoe and her school
  //   as_nt_water            washing moves off the well       as_nt_market  market day: Mohei's stall (where it says)
  //   as_dp_water            the channel's rota board         as_dp_noise   the forge's hours, or a forge by the paddies
  //   as_hall                the meeting house                as_fest_done  the festival's lanterns stay up
  const SHUT = (en, jp) => T(en, jp);
  C.maps['as.village'] = {
    name: T('Ashihara Shinden', '{葦原|あしはら}{新田|しんでん}'), region: 'ashihara', place: 'ashihara', travel: 'ashihara', edition: 2,
    music: [{ if: 'as_fest_night', id: 'as_festival' }, { id: 'ashihara' }],
    ambient: { weather: null },
    terrain: K.build(36, 24, '.', (k) => {
      k.ragged('top', 'T', 2, 1501);                 // the wood behind the village
      k.rect(0, 18, 36, 1, 'w');                     // the reed plain's stream
      k.rect(0, 19, 36, 5, '"');                     // the reed beds the village is named for
      k.path([[0, 10], [35, 10]], ':', 2);           // the way in, through the middle of the village
      k.vline(24, 3, 17, 'w');                       // the channel Yoshizō dug, from the hill spring to the stream
      k.rect(24, 10, 1, 2, 'b');                     // its plank bridge
      k.path([[22, 3], [22, 16]], ':', 1);           // the lane along the channel
      k.path([[8, 3], [8, 9]], ':', 1);              // the lane up the rise
      k.set(8, 2, 'Q');                              // the lone pine at the top of the rise
      k.rect(26, 3, 4, 6, 'F');                      // Yoshizō's paddy, upstream
      k.rect(26, 13, 4, 4, 'F');                     // Taki's paddy, downstream
      k.scatter(',', 8, 1502, [0, 12, 22, 5], '.');
      k.scatter(';', 10, 1503, [0, 3, 7, 5], '.');
    }),
    structs: [
      { type: 'house', x: 2, y: 5, w: 5, h: 3, roof: 'thatch', wall: 'wood', door: 2, windows: [0, 4], shut: SHUT('Mitsue\'s house. A list is pinned to the door.', 'ミツエ の {家|いえ} 。 {戸|と} に 、 {書|か}き{付|つ}け が {留|と}めて ある 。') },
      { type: 'house', x: 11, y: 5, w: 5, h: 3, roof: 'thatch', wall: 'wood', door: 2, windows: [0], shut: SHUT('The forge. It smells of charcoal and hot iron.', '{鍛冶場|かじば} 。 {炭|すみ} と {熱|あつ}い {鉄|てつ} の {匂|にお}い が する 。') },
      { type: 'house', x: 17, y: 5, w: 4, h: 3, roof: 'thatch', wall: 'wood', door: 1, windows: [3], shut: SHUT('Natsu\'s house. Inside, very quietly, someone is humming a lullaby.', 'ナツ の {家|いえ} 。 {中|なか} から 、 {小|ちい}さな {声|こえ} で {子守唄|こもりうた} が {聞|き}こえる 。') },
      { type: 'house', x: 31, y: 4, w: 4, h: 3, roof: 'thatch', wall: 'wood', door: 1, windows: [3], shut: SHUT('Yoshizō\'s house. A spade leans by the door, still muddy.', 'ヨシゾウ の {家|いえ} 。 {戸口|とぐち} に 、 {泥|どろ} の ついた {鋤|すき} が {立|た}てかけて ある 。') },
      { type: 'house', x: 31, y: 13, w: 4, h: 3, roof: 'thatch', wall: 'wood', door: 1, windows: [0], shut: SHUT('Taki\'s house. Two small pairs of sandals by the door.', 'タキ の {家|いえ} 。 {戸口|とぐち} に 、 {小|ちい}さな {草履|ぞうり} が {二足|にそく} 。') },
      // the growth
      { type: 'house', x: 2, y: 13, w: 6, h: 3, roof: 'tile', wall: 'wood', door: 3, windows: [1, 4], grow: true, if: 'as_kotoe', shut: SHUT('Kotoe\'s school. Through the window, rows of small desks.', 'コトエ の {寺子屋|てらこや} 。 {窓|まど} から 、 {小|ちい}さな {机|つくえ} が {並|なら}んで いる の が {見|み}える 。') },
      { type: 'house', x: 12, y: 13, w: 7, h: 3, roof: 'tile', wall: 'wood', door: 3, windows: [1, 5], grow: true, if: 'as_hall', shut: SHUT('The meeting house. New timber, and the smell of fresh tatami.', '{寄合所|よりあいじょ} 。 {新|あたら}しい {木|き} と 、 {新|あたら}しい {畳|たたみ} の {匂|にお}い 。') },
    ],
    props: [
      { p: 'noticeboard', x: 9, y: 8, scene: 'as.board' },
      { p: 'well', x: 19, y: 8, scene: 'as.well' },
      // the three ways: blank posts until they are named, then their signposts
      { p: 'signblank', x: 1, y: 9, scene: 'as.way_main', if: '!as_nm_main' }, { p: 'sign', x: 1, y: 9, scene: 'as.way_main', if: 'as_nm_main' },
      { p: 'signblank', x: 23, y: 4, scene: 'as.way_canal', if: '!as_nm_canal' }, { p: 'sign', x: 23, y: 4, scene: 'as.way_canal', if: 'as_nm_canal' },
      { p: 'signblank', x: 9, y: 4, scene: 'as.way_hill', if: '!as_nm_hill' }, { p: 'sign', x: 9, y: 4, scene: 'as.way_hill', if: 'as_nm_hill' },
      { p: 'mailbox', x: 6, y: 9, if: 'as_streets', scene: 'as.mailbox' },
      // where the washing goes: the drinking well until the notice says otherwise
      { p: 'laundry', x: 21, y: 8, if: '!as_nt_water' },
      { p: 'laundry', x: 13, y: 17, if: 'var.as_wash=stream' }, { p: 'laundry', x: 4, y: 17, if: 'var.as_wash=reeds' },
      // market day: Mohei's stall where the notice put it
      { p: 'counter', x: 10, y: 12, across: true, if: 'var.as_market=board' }, { p: 'crate', x: 13, y: 12, if: 'var.as_market=board' },
      { p: 'counter', x: 25, y: 12, across: true, if: 'var.as_market=bridge' }, { p: 'crate', x: 28, y: 12, if: 'var.as_market=bridge' },
      // the channel's rota, and the forge's hours or its new place by the paddies
      { p: 'sign', x: 25, y: 9, if: 'as_dp_water', scene: 'as.rota' },
      // (the hours' tag hangs on the forge door, on the wall beside it, read from in front of it at (14,8); the door
      // (13,7) keeps its own line: RBN-QA-176)
      { p: 'as_forgetag', x: 14, y: 7, if: 'var.as_forge=hours', scene: 'as.forge_hours' },
      { p: 'anvil', x: 33, y: 8, if: 'var.as_forge=moved' }, { p: 'campfire', x: 34, y: 8, if: 'var.as_forge=moved' },
      // the festival's lanterns, where they were hung, stay up afterwards
      ...[2, 6, 15, 20, 31].map((x) => ({ p: 'lantern', x, y: 12, o: { lit: true }, if: 'var.as_lan=street' })),
      ...[4, 7, 13, 16].map((y) => ({ p: 'lantern', x: 21, y, o: { lit: true }, if: 'var.as_lan=canal' })),
      ...[3, 5, 7].map((y) => ({ p: 'lantern', x: 7, y, o: { lit: true }, if: 'var.as_lan=hill' })),
      { p: 'campfire', x: 20, y: 16, if: 'as_fest_night' },
      { p: 'bench', x: 5, y: 3 }, { p: 'hay', x: 30, y: 9 }, { p: 'barrel', x: 16, y: 9 },
    ],
    npcs: [],
    exits: [{ x: 0, y: 10, w: 1, h: 2, to: 'rw.road', tx: 30, ty: 3, dir: 'left' }],
    onEnter: [{ scene: 'as.first', if: '!as_arrived' }],
    spawn: { default: [1, 10, 'right'], from_road: [1, 10, 'right'] },
  };

  // ---- the people, where they are: routines (W2) that change as the village grows --------------------------------------
  // Each resident has two places; the town's routine moves them on (src/engine/53_town.js). One person, one place: the
  // placements below are exclusive by their conditions.
  C.towns = C.towns || {};
  C.towns.ashihara = {
    name: T('Ashihara Shinden', '{葦原|あしはら}{新田|しんでん}'), maps: ['as.village'],
    care: ['as_streets', 'as_nt_water', 'as_nt_market', 'as_dp_water', 'as_dp_noise', 'as_hall', 'as_fest_done'],
    residents: {
      as_mitsue: { slots: 2, pin: '!as_streets|quest.as_main=3' },
      as_yoshizo: { slots: 2, pin: 'quest.as_main=2&!as_dp_water' },
      as_taki: { slots: 2, pin: 'quest.as_main=2&!as_dp_water' },
      as_sho: { slots: 2, pin: 'quest.as_main=2&!as_dp_noise' },
      as_natsu: { slots: 2, pin: 'quest.as_main=2&!as_dp_noise' },
      as_kotoe: { slots: 2 },
      as_mohei: { slots: 2 },
    },
  };
  const V = C.maps['as.village'];
  const at = (id, x, y, dir, cond, talk) => V.npcs.push({ id, x, y, dir, if: cond, talk: talk || [{ scene: 'as.' + id.slice(3) }] });
  // Mitsue: by the notice board, or out at the paddies; at the meeting house's door once it stands
  at('as_mitsue', 10, 9, 'down', 'slot.as_mitsue=1');
  at('as_mitsue', 25, 6, 'left', 'slot.as_mitsue=2&!as_hall');
  at('as_mitsue', 17, 16, 'left', 'slot.as_mitsue=2&as_hall');
  // Yoshizō and Taki: each in their paddy; or Yoshizō at the bridge and Taki where the washing is done
  at('as_yoshizo', 27, 4, 'down', 'slot.as_yoshizo=1');
  at('as_yoshizo', 23, 12, 'up', 'slot.as_yoshizo=2');
  at('as_taki', 27, 14, 'up', 'slot.as_taki=1');
  at('as_taki', 21, 9, 'up', 'slot.as_taki=2&!as_nt_water');
  at('as_taki', 12, 17, 'right', 'slot.as_taki=2&var.as_wash=stream');
  at('as_taki', 7, 17, 'left', 'slot.as_taki=2&var.as_wash=reeds');
  // Shō: at the forge (wherever it is), or helping at Yoshizō's paddy in the afternoons once the hours are agreed
  at('as_sho', 13, 8, 'down', 'slot.as_sho=1&!var.as_forge=moved|!as_dp_noise');
  at('as_sho', 33, 9, 'up', 'var.as_forge=moved');
  at('as_sho', 28, 9, 'up', 'slot.as_sho=2&var.as_forge=hours');
  // Natsu: at her door with the baby; or at the washing place
  at('as_natsu', 18, 8, 'down', 'slot.as_natsu=1|!as_nt_water');
  at('as_natsu', 16, 17, 'left', 'slot.as_natsu=2&var.as_wash=stream');
  at('as_natsu', 3, 17, 'right', 'slot.as_natsu=2&var.as_wash=reeds');
  // Kotoe, once she has come: at the school's door, or reading under the lone pine
  at('as_kotoe', 7, 16, 'left', 'as_kotoe&slot.as_kotoe=1');
  at('as_kotoe', 9, 3, 'left', 'as_kotoe&slot.as_kotoe=2');
  // Mohei, on market days: at his stall wherever the notice put it; on other days he is on the road
  at('as_mohei', 11, 13, 'up', 'var.as_market=board&slot.as_mohei=1');
  at('as_mohei', 26, 13, 'up', 'var.as_market=bridge&slot.as_mohei=1');
})(RB.content, RB.mapkit);
