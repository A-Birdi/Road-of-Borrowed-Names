/* Kotonoha, Chapter 9: the Root Hollows (根の洞) and the Gardener's garden (expansion P11; R4; A11 connected systems
 * with words as keys; 10_STORY §8, the separation "in danger"). Down through the hollow between two of the great
 * camphor's roots:
 *   ko.roots1  the Whispering Hollow: leaves ride a current of air; one has lost its word. Put it back and the roots
 *              across the way down draw apart (ko_root_a); a bench to rest (the checkpoint).
 *   ko.roots2  the Tidal Hollow: the sea comes in under the island here. Crossing the root bridge over the channel,
 *              the tide rises over it behind you and your companion is left on the far side (ko_apart: a solvable
 *              scare; calm lines, never a warning). The way on to the garden is on their side, behind roots that give
 *              way only once the passages are reshaped from below (ko_root_c).
 *   ko.roots3  the Long Way Round: alone and in the dark; two leaves with their words lost. Restoring the first draws
 *              back the roots in the middle of the passage (ko_root_b); the second reshapes the hollows: a way opens
 *              up to the far side of the channel, and the roots before the garden part (ko_root_c).
 *   ko.garden  the Garden of Unsent Words, under the heart of the tree: leaves that were never meant to be found,
 *              hung on root-branches; the Gardener.
 * Twelve-chapter journeys only. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const ROOTS = { region: 'kotonoha', place: 'kotonoha', music: 'ko_roots', edition: 2, noTravel: true, travelKind: 'dungeon', setting: 'indoor', noCompanion: '!ko_apart' };
  const DARK = { dark: 0.5, playerLight: 54, weather: 'leaves', tint: 'rgba(40,70,50,0.10)' };
  // roots across a passage: a tangle until `flag`, then nothing there
  const arch = (x, y, flag, scene) => Object.assign({ p: 'ko_rootarch', x, y, if: '!' + flag }, scene ? { scene } : {});
  // a current of air with a leaf in it: the leaf's word lost (a scene restores it), then only drifting leaves
  const current = (x, y, flag, scene) => [{ p: 'ko_current', x, y, if: '!' + flag, scene }, { p: 'ko_current', x, y, if: flag }];

  // ---- the Whispering Hollow (囁きの洞) --------------------------------------------------------------------------------
  C.maps['ko.roots1'] = Object.assign({}, ROOTS, {
    name: T('The Whispering Hollow', '{囁|ささや}き の {洞|ほら}'),
    ambient: DARK,
    terrain: K.build(30, 24, '#', (k) => {
      k.rect(3, 2, 24, 20, '+');
      k.rect(14, 0, 2, 2, '+');
      k.rect(14, 22, 2, 2, '+');
      for (const [x, y, w, h] of [[6, 6, 3, 8], [21, 8, 3, 6], [10, 15, 6, 2]]) k.rect(x, y, w, h, '#');
      k.rect(17, 4, 3, 2, 'd');
      k.scatter('r', 5, 961, [4, 3, 22, 18], '+');
    }),
    props: [
      ...current(4, 10, 'ko_root_a', 'ko.root_leaf_a'),
      arch(14, 21, 'ko_root_a', 'ko.root_arch'),
      { p: 'bench', x: 24, y: 4, scene: 'ko.roots_rest' },
      { p: 'ko_current', x: 25, y: 16 }, { p: 'ko_current', x: 12, y: 7 },
      { p: 'ko_leaves', x: 18, y: 18 }, { p: 'ko_leaves', x: 7, y: 19 },
    ],
    npcs: [],
    foes: [
      { id: 'r1a', enemy: 'ko.leafling', x: 18, y: 11, patrol: 2, bg: 'kotonoha_cave' },
      { id: 'r1b', enemy: 'ko.jelly', x: 9, y: 19, patrol: 1, bg: 'kotonoha_cave' },
    ],
    exits: [
      { x: 14, y: 0, w: 2, h: 1, to: 'ko.crown', sp: 'from_roots', dir: 'up' },
      { x: 14, y: 23, w: 2, h: 1, to: 'ko.roots2', sp: 'from_roots1', dir: 'down', if: 'ko_root_a' },
    ],
    onEnter: [{ scene: 'ko.roots_enter', if: '!ko_roots_seen' }],
    spawn: { default: [14, 1, 'down'], from_crown: [14, 1, 'down'], from_roots2: [14, 22, 'up'] },
  });

  // ---- the Tidal Hollow (潮の洞) ---------------------------------------------------------------------------------------
  // north side (from above, the garden's way, and where the companion is left): rows 1–9; the channel rows 10–12 with
  // its root bridge (x 15–16); south side rows 13–22 with the way round west
  C.maps['ko.roots2'] = Object.assign({}, ROOTS, {
    name: T('The Tidal Hollow', '{潮|しお} の {洞|ほら}'),
    ambient: Object.assign({}, DARK, { tint: 'rgba(40,80,100,0.12)' }),
    terrain: K.build(32, 24, '#', (k) => {
      k.rect(2, 1, 28, 9, '+');
      k.rect(2, 10, 28, 3, 'd');
      k.rect(15, 10, 2, 3, '_');                      // the root bridge
      k.rect(2, 13, 28, 9, '+');
      k.rect(15, 0, 2, 1, '+');
      k.rect(0, 18, 2, 2, '+');                       // the way round, west
      k.rect(0, 3, 2, 2, '+');                        // where the way round comes back, north-west
      k.rect(30, 3, 2, 2, '+');                       // on to the garden, east
      for (const [x, y, w, h] of [[7, 4, 3, 3], [22, 5, 3, 2], [8, 16, 4, 3], [21, 15, 3, 4]]) k.rect(x, y, w, h, '#');
    }),
    props: [
      // once the tide is in, the bridge is under water (until the hollows are reshaped and it goes out again)
      { p: 'water', x: 15, y: 10, if: 'ko_tide_in&!ko_root_c' }, { p: 'water', x: 16, y: 10, if: 'ko_tide_in&!ko_root_c' },
      { p: 'water', x: 15, y: 11, if: 'ko_tide_in&!ko_root_c' }, { p: 'water', x: 16, y: 11, if: 'ko_tide_in&!ko_root_c' },
      { p: 'water', x: 15, y: 12, if: 'ko_tide_in&!ko_root_c' }, { p: 'water', x: 16, y: 12, if: 'ko_tide_in&!ko_root_c' },
      arch(28, 3, 'ko_root_c', 'ko.root_arch_garden'),
      { p: 'ko_current', x: 5, y: 15 }, { p: 'ko_current', x: 26, y: 18 }, { p: 'ko_current', x: 12, y: 2 },
      { p: 'ko_leaves', x: 19, y: 6 }, { p: 'ko_leaves', x: 4, y: 20 },
    ],
    npcs: [],
    foes: [
      { id: 'r2a', enemy: 'ko.jelly', x: 25, y: 19, patrol: 1, bg: 'kotonoha_cave' },
    ],
    triggers: [
      // halfway across the bridge, the first time, in Chapter 9: the tide comes in behind you
      { x: 15, y: 12, w: 2, h: 1, scene: 'ko.tide_split', if: 'ko_ch9&!ko_tide_in' },
      // the reunion: back on the north side by the way round
      { x: 2, y: 3, w: 2, h: 2, scene: 'ko.reunion', if: 'ko_apart&ko_root_c' },
    ],
    exits: [
      { x: 15, y: 0, w: 2, h: 1, to: 'ko.roots1', sp: 'from_roots2', dir: 'up' },
      { x: 0, y: 18, w: 1, h: 2, to: 'ko.roots3', sp: 'from_roots2', dir: 'left' },
      { x: 0, y: 3, w: 1, h: 2, to: 'ko.roots3', sp: 'from_north', dir: 'left', if: 'ko_root_c' },
      { x: 31, y: 3, w: 1, h: 2, to: 'ko.garden', sp: 'from_roots2', dir: 'right', if: 'ko_root_c' },
    ],
    spawn: { default: [15, 1, 'down'], from_roots1: [15, 1, 'down'], from_roots3: [1, 18, 'right'], from_round: [2, 4, 'right'], from_garden: [30, 4, 'left'] },
  });

  // ---- the Long Way Round (回り道) -------------------------------------------------------------------------------------
  // entered from the Tidal Hollow's south-west; two leaves without their words; the way back up comes out north
  C.maps['ko.roots3'] = Object.assign({}, ROOTS, {
    name: T('The Long Way Round', '{回|まわ}り{道|みち}'),
    ambient: { dark: 0.62, playerLight: 50, weather: 'leaves', tint: 'rgba(30,50,40,0.12)' },
    terrain: K.build(30, 24, '#', (k) => {
      k.rect(18, 15, 10, 7, '+');                     // where you come in (from the Tidal Hollow)
      k.rect(28, 18, 2, 2, '+');
      k.rect(5, 15, 13, 3, '+');                      // the passage west
      k.rect(3, 4, 5, 14, '+');                       // up the west side
      k.rect(8, 4, 14, 3, '+');                       // across the top
      k.rect(20, 1, 5, 6, '+');                       // the way up, north-east
      k.rect(22, 0, 2, 1, '+');
      k.scatter('r', 4, 971, [4, 5, 22, 14], '+');
    }),
    props: [
      ...current(26, 20, 'ko_root_b', 'ko.root_leaf_b'),
      arch(11, 15, 'ko_root_b', 'ko.root_arch'),
      ...current(4, 6, 'ko_root_c', 'ko.root_leaf_c'),
      arch(20, 4, 'ko_root_c', 'ko.root_arch'),
      { p: 'ko_leaves', x: 6, y: 12 }, { p: 'ko_leaves', x: 15, y: 5 },
    ],
    npcs: [],
    foes: [
      { id: 'r3a', enemy: 'ko.echo', x: 5, y: 10, patrol: 2, bg: 'kotonoha_cave' },
    ],
    exits: [
      { x: 29, y: 18, w: 1, h: 2, to: 'ko.roots2', sp: 'from_roots3', dir: 'right' },
      { x: 22, y: 0, w: 2, h: 1, to: 'ko.roots2', sp: 'from_round', dir: 'up', if: 'ko_root_c' },
    ],
    onEnter: [{ scene: 'ko.round_enter', if: 'ko_apart&!ko_round_seen' }],
    spawn: { default: [28, 18, 'left'], from_roots2: [28, 18, 'left'], from_north: [22, 1, 'down'] },
  });

  // ---- the Garden of Unsent Words (届かぬ言葉の庭) ---------------------------------------------------------------------
  C.maps['ko.garden'] = Object.assign({}, ROOTS, {
    name: T('The Garden of Unsent Words', '{届|とど}かぬ {言葉|ことば} の {庭|にわ}'), music: 'ko_garden',
    ambient: { dark: 0.45, playerLight: 60, weather: 'leaves', tint: 'rgba(120,140,80,0.10)' },
    terrain: K.build(26, 20, '#', (k) => {
      k.rect(2, 2, 22, 16, '+');
      k.rect(0, 9, 2, 2, '+');
      k.scatter(',', 18, 981, [3, 3, 20, 14], '+');
    }),
    props: [
      { p: 'ko_current', x: 6, y: 5 }, { p: 'ko_current', x: 19, y: 5 }, { p: 'ko_current', x: 6, y: 14 }, { p: 'ko_current', x: 19, y: 14 },
      { p: 'ko_leaves', x: 9, y: 8 }, { p: 'ko_leaves', x: 15, y: 12 }, { p: 'ko_leaves', x: 4, y: 11 },
      { p: 'ko_basket', x: 21, y: 9 },
      // the Gardener is the woven roots and leaves at the garden's heart (it speaks with its portrait only)
      { p: 'ko_rootarch', x: 12, y: 5, if: '!ko_gardener_done', scene: 'ko.gardener' },
      { p: 'ko_rootarch', x: 12, y: 5, if: 'ko_gardener_done', scene: 'ko.garden_after' },
    ],
    npcs: [],
    exits: [{ x: 0, y: 9, w: 1, h: 2, to: 'ko.roots2', sp: 'from_garden', dir: 'left' }],
    onEnter: [{ scene: 'ko.garden_enter', if: '!ko_garden_seen' }],
    spawn: { default: [1, 9, 'right'], from_roots2: [1, 9, 'right'] },
  });
})(RB.content, RB.mapkit);
