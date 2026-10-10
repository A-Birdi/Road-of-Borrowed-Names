/* Kotonoha, Chapter 9: the island above ground (expansion P11; docs/future/work/P11_SEA.md). The shore where the boats
 * land, written leaves drifting along the tide line and old stone lanterns half-buried in the sand; the village of
 * netted houses with the keepers' hall; the great camphor's lower terraces and, above them, its crown; the tide pools
 * to the west with their conches and the tide calendar; the sea cave to the east. The Root Hollows are in
 * 11_roots.js. Twelve-chapter journeys only (`edition: 2`).
 *
 * The island's three phases (07_REGIONS.md R4) are read separately: the story phase by flags (an early visit by the
 * player's own boat before Lanternfall is over, `ko_arrived&!ch5_done`; Chapter 9, `ko_ch9`; after the ending,
 * `post`), the profile by the tasks' tiers, and introduced concepts by the tasks' items. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  // noCompanion: the companion is away while ko_apart holds (the separation in the Root Hollows, 11_roots.js)
  const ISLE = { region: 'kotonoha', place: 'kotonoha', travel: 'kotonoha', music: 'kotonoha', edition: 2, noCompanion: '!ko_apart' };
  // leaves drifting down everywhere, a little sea haze
  const LEAVES = { weather: 'leaves', tint: 'rgba(200,220,210,0.05)' };
  // a stone lantern half-buried in sand: dark until `flag`, lit after
  const sandtoro = (x, y, flag, scene, after) => [
    Object.assign({ p: 'ko_sandtoro', x, y, if: '!' + flag }, scene ? { scene } : {}),
    Object.assign({ p: 'ko_sandtoro', x, y, if: flag, light: 30, o: { lit: true } }, after ? { scene: after } : {}),
  ];

  // ---- the shore (言の葉の浜) -------------------------------------------------------------------------------------------
  C.maps['ko.shore'] = Object.assign({}, ISLE, {
    name: T('The Shore of Leaves', '{葉|は} の {浜|はま}'),
    ambient: LEAVES,
    terrain: K.build(40, 26, '.', (k) => {
      k.ragged('top', 'T', 2, 901);
      k.scatter(';', 14, 902, [0, 3, 40, 8], '.');
      k.scatter('o', 5, 903, [2, 4, 36, 6], '.');
      k.rect(0, 11, 40, 10, 's');
      k.scatter('"', 9, 904, [0, 10, 40, 2], 's');
      k.rect(0, 20, 40, 2, 'w');
      k.rect(0, 22, 40, 4, '~');
      k.ragged('bottom', '~', 2, 905);
      k.rect(19, 18, 3, 7, '_');                       // the jetty
      k.path([[20, 0], [20, 11]], ':', 2);             // up to the village
      k.rect(33, 3, 7, 8, '^'); k.rect(0, 3, 4, 7, '^');
      k.scatter('h', 6, 906, [1, 12, 38, 7], 's');
    }),
    props: [
      { p: 'ko_leaves', x: 5, y: 17 }, { p: 'ko_leaves', x: 12, y: 19 }, { p: 'ko_leaves', x: 25, y: 18 }, { p: 'ko_leaves', x: 30, y: 15 }, { p: 'ko_leaves', x: 9, y: 13 },
      { p: 'ko_basket', x: 15, y: 14 }, { p: 'ko_basket', x: 26, y: 13 },
      ...sandtoro(7, 12, 'ko_l_shore1', null, null), ...sandtoro(34, 16, 'ko_l_shore2', null, null),
      { p: 'sign', x: 22, y: 10, scene: 'ko.shore_sign' },
      { p: 'ko_netrack', x: 27, y: 9 },
      { p: 'pier', x: 19, y: 24 }, { p: 'pier', x: 21, y: 24 },
      { p: 'boat', x: 22, y: 22, if: 'ko_arrived', scene: 'ko.ferry_back' },
      { p: 'bench', x: 16, y: 10 },
    ],
    npcs: [
      { id: 'ko_nami', x: 20, y: 17, dir: 'down', if: 'ch5_done&!ko_otoha_met' },
    ],
    exits: [],
    spawn: { default: [20, 22, 'up'], from_sea: [20, 22, 'up'] },
  });
})(RB.content, RB.mapkit);

RB.script.add(`
@scene ko.shore_sign
!gesture pc read 22,10
narr: {古|ふる}い {板|いた} に 、 {彫|ほ}った {字|じ} 。 「{言|こと}の{葉|は}{島|じま} 。 {葉|は} を {拾|ひろ}う {者|もの} は 、 {葉守|はもり} の {村|むら} へ 。」 || Old boards, the words cut into them: "Kotonoha. Whoever gathers a leaf, bring it to the keepers' village."
`);
