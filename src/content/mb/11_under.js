/* Manybridge, Chapter 3: the Undercroft Locks (閘門の地下), under the Tally Exchange (expansion P08; plan R1, A11 a
 * connected-water dungeon; DUNGEON_FAMILIES A31's sibling: the language is the routing the chapter taught). A story
 * dungeon: checkpoints at each level's entrance, no expedition rules.
 *
 *   B1, the Upper Basin: a walkway round a basin; the way east is under water until the first tablet is read and its
 *     gate turned (the basin drains into the channels below: mb_u1_low). Matsu's lamp hook (a rest if she gave you
 *     her lamp).
 *   B2, the Channels: two basins joined by a middle gate; raising one lowers the other. The keeper's punt crosses only
 *     when the levels match (the procedure mb.locks; mb_u2_through).
 *   B3, the Great Lock: the last lock lowers the punt to the oldest level (mb.greatlock; mb_u3_down).
 *   The First Bridge: an underground canal and the city's first bridge, three spans, and its spirit.
 * The language, procedures and creatures are in 33_under.js; the scenes in 23_scenes_under.js. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const UNDER = { region: 'manybridge', music: 'undercroft', noTravel: true, travelKind: 'dungeon', travelPlace: { en: 'the Undercroft Locks' }, edition: 2 };
  const flood = (cells, cond) => cells.map(([x, y]) => ({ p: 'lf_flood', x, y, if: cond, o: { cx: x, cy: y } }));
  const rect = (x0, y0, w, h) => { const out = []; for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) out.push([x, y]); return out; };
  const intro = (jp, en) => ({ jp, en });

  // ---- B1: the Upper Basin (34 × 22) -------------------------------------------------------------------------------
  C.maps['mb.under1'] = Object.assign({}, UNDER, {
    name: T('The Upper Basin', '{上|うえ} の {池|いけ}'),
    ambient: { dark: 0.5, playerLight: 56, weather: 'motes' },
    terrain: K.build(34, 22, '#', (k) => {
      k.rect(2, 2, 30, 3, '+');          // the north walkway
      k.rect(2, 5, 3, 15, '+');          // the west walkway
      k.rect(5, 17, 22, 3, '+');         // the south walkway
      k.rect(8, 7, 18, 9, 'd');          // the basin
      k.rect(26, 2, 3, 3, 'w');          // the drowned stretch of the north walkway (passable once drained)
      k.rect(29, 2, 4, 3, '+');          // beyond it, the way down
      k.scatter('w', 10, 901, [2, 2, 24, 3], '+');
    }),
    props: [
      { p: 'stairs', x: 3, y: 2, scene: 'mb.under_up' },
      { p: 'sign', x: 6, y: 2, scene: 'mb.tablet1' },
      { p: 'sb_crank', x: 9, y: 18, scene: 'mb.gate1' },
      ...flood(rect(26, 2, 3, 3), '!mb_u1_low'),
      // Matsu's lamp hook: a rest place if she gave you her lamp
      { p: 'deadlantern', x: 3, y: 12, scene: 'mb.under_lamp', if: '!mb_lamp_hung' },
      { p: 'lantern', x: 3, y: 12, scene: 'mb.under_lamp_rest', if: 'mb_lamp_hung' },
      { p: 'stairs', x: 31, y: 3, scene: 'mb.under_down1' },
      { p: 'barrel', x: 20, y: 18 }, { p: 'crate', x: 24, y: 19 }, { p: 'lantern', x: 14, y: 2, o: { lit: true } },
    ],
    foes: [
      { id: 'u1a', enemy: 'mb.snail', x: 16, y: 3, patrol: 2, bg: 'undercroft', intro: intro('{水門|すいもん} の {形|かたち} の {殻|から} を {背負|せお}った かたつむり が 、 {通路|つうろ} を {塞|ふさ}いで いる 。', 'A snail with a shell shaped like a lock gate is blocking the walkway.') },
      { id: 'u1b', enemy: 'mb.tangle', x: 3, y: 15, patrol: 1, bg: 'undercroft' },
      { id: 'u1c', enemy: 'mb.crab', x: 18, y: 18, patrol: 2, bg: 'undercroft' },
    ],
    exits: [],
    onEnter: [{ scene: 'mb.under_arrive', if: '!mb_under_seen' }],
    spawn: { default: [3, 3, 'down'], from_house: [3, 3, 'down'], from_below: [30, 3, 'left'] },
  });

  // ---- B2: the Channels (38 × 24) ----------------------------------------------------------------------------------
  C.maps['mb.under2'] = Object.assign({}, UNDER, {
    name: T('The Channels', '{水路|すいろ}'),
    ambient: { dark: 0.55, playerLight: 56, weather: 'motes' },
    terrain: K.build(38, 24, '#', (k) => {
      k.rect(2, 2, 20, 3, '+');          // the landing from above (to the gate house)
      k.rect(2, 5, 3, 16, '+');          // the west walkway
      k.rect(5, 18, 28, 3, '+');         // the south walkway
      k.rect(7, 7, 10, 9, 'd');          // the west basin
      k.rect(21, 7, 10, 9, 'd');         // the east basin
      k.rect(17, 10, 4, 3, 'd');         // the middle gate's channel
      k.rect(17, 5, 4, 2, '+');          // the gate house above it
      k.rect(33, 5, 3, 16, '+');         // the east walkway (reached by the punt)
      k.rect(33, 2, 3, 3, '+');          // the way down
      k.rect(31, 18, 2, 3, 'w');         // the south walkway's end, under water until the punt is through
    }),
    props: [
      { p: 'stairs', x: 3, y: 2, scene: 'mb.under_up2' },
      { p: 'sign', x: 8, y: 2, scene: 'mb.tablet2' },
      { p: 'sb_crank', x: 18, y: 5, scene: 'mb.locks_go' },
      { p: 'mb_barge', x: 8, y: 12, if: '!mb_u2_through', o: { empty: true } },
      { p: 'mb_barge', x: 27, y: 12, if: 'mb_u2_through', o: { empty: true } },
      ...flood(rect(31, 18, 2, 3), '!mb_u2_through'),
      { p: 'stairs', x: 34, y: 2, scene: 'mb.under_down2' },
      { p: 'lantern', x: 3, y: 10, o: { lit: true } }, { p: 'lantern', x: 34, y: 10, o: { lit: true } },
      { p: 'crate', x: 12, y: 19 }, { p: 'barrel', x: 13, y: 19 }, { p: 'bench', x: 6, y: 19, scene: 'mb.under_bench' },
    ],
    foes: [
      { id: 'u2a', enemy: 'mb.beetle', x: 10, y: 3, patrol: 2, bg: 'undercroft', intro: intro('{算盤|そろばん} の {珠|たま} の よう な {背中|せなか} の {甲虫|かぶとむし} が 、 {数|かず} を {並|なら}べ{替|か}えて いる 。', 'A beetle whose back is lined like an abacus is shuffling numbers about.') },
      { id: 'u2b', enemy: 'mb.crab', x: 3, y: 14, patrol: 1, bg: 'undercroft' },
      { id: 'u2c', enemy: 'mb.tangle', x: 20, y: 19, patrol: 2, bg: 'undercroft', aggro: true },
      { id: 'u2d', enemy: 'mb.barge', x: 34, y: 14, patrol: 1, bg: 'undercroft', intro: intro('{誰|だれ} も {乗|の}って いない {荷舟|にぶね} が 、 {勝手|かって} に {動|うご}いて {来|く}る 。', 'An empty barge comes gliding along by itself.') },
    ],
    exits: [],
    spawn: { default: [3, 3, 'down'], from_above: [3, 3, 'down'], from_below: [34, 3, 'down'] },
  });

  // ---- B3: the Great Lock (30 × 22) --------------------------------------------------------------------------------
  C.maps['mb.under3'] = Object.assign({}, UNDER, {
    name: T('The Great Lock', '{大閘門|だいこうもん}'),
    ambient: { dark: 0.6, playerLight: 56, weather: 'motes' },
    terrain: K.build(30, 22, '#', (k) => {
      k.rect(2, 2, 26, 3, '+');          // the upper quay
      k.rect(11, 5, 8, 12, 'd');         // the lock chamber
      k.rect(2, 5, 3, 14, '+');          // the west stair-walk
      k.rect(5, 16, 6, 3, '+');          // the lower quay (reached by the lock)
      k.rect(19, 16, 9, 3, '+');
      k.rect(25, 5, 3, 11, '+');         // the east walk
      k.rect(5, 16, 23, 1, 'w');
    }),
    props: [
      { p: 'stairs', x: 3, y: 2, scene: 'mb.under_up3' },
      { p: 'sign', x: 9, y: 2, scene: 'mb.tablet3' },
      { p: 'sb_crank', x: 20, y: 2, scene: 'mb.greatlock_go' },
      { p: 'mb_barge', x: 13, y: 6, if: '!mb_u3_down', o: { empty: true } },
      { p: 'mb_barge', x: 13, y: 14, if: 'mb_u3_down', o: { empty: true } },
      { p: 'door', x: 23, y: 18, scene: 'mb.firstbridge_door' },
      { p: 'lantern', x: 6, y: 2, o: { lit: true } }, { p: 'lantern', x: 26, y: 15, o: { lit: true } },
    ],
    foes: [
      { id: 'u3a', enemy: 'mb.barge', x: 26, y: 8, patrol: 1, bg: 'undercroft' },
      { id: 'u3b', enemy: 'mb.snail', x: 7, y: 17, patrol: 1, bg: 'undercroft', if: 'mb_u3_down' },
    ],
    exits: [],
    spawn: { default: [3, 3, 'down'], from_above: [3, 3, 'down'], lower: [7, 17, 'right'], from_bridge: [23, 17, 'up'] },
  });

  // ---- the First Bridge (28 × 18) ----------------------------------------------------------------------------------
  C.maps['mb.firstbridge'] = Object.assign({}, UNDER, {
    name: T('The First Bridge', '{一番|いちばん} の {橋|はし}'),
    ambient: { dark: 0.62, playerLight: 60, weather: 'motes' },
    alt: [{ if: 'mb_bridge_named', ambient: { dark: 0.35, playerLight: 50, weather: 'motes' } }],
    terrain: K.build(28, 18, '#', (k) => {
      k.rect(2, 12, 24, 4, '+');         // the near bank
      k.rect(2, 2, 24, 3, '+');          // the far bank
      k.rect(2, 5, 24, 7, 'd');          // the oldest canal
      k.rect(12, 5, 3, 7, 'B');          // the bridge's three spans (B: walkable once restored)
    }),
    props: [
      { p: 'door', x: 13, y: 15, scene: 'mb.firstbridge_back' },
      // the three spans, broken until the bridge has its name (they block the way)
      { p: 'lf_flood', x: 12, y: 6, if: '!mb_bridge_named', o: { cx: 12, cy: 6 } }, { p: 'lf_flood', x: 13, y: 6, if: '!mb_bridge_named', o: { cx: 13, cy: 6 } }, { p: 'lf_flood', x: 14, y: 6, if: '!mb_bridge_named', o: { cx: 14, cy: 6 } },
      { p: 'lf_flood', x: 12, y: 8, if: '!mb_bridge_named', o: { cx: 12, cy: 8 } }, { p: 'lf_flood', x: 13, y: 8, if: '!mb_bridge_named', o: { cx: 13, cy: 8 } }, { p: 'lf_flood', x: 14, y: 8, if: '!mb_bridge_named', o: { cx: 14, cy: 8 } },
      { p: 'lf_flood', x: 12, y: 10, if: '!mb_bridge_named', o: { cx: 12, cy: 10 } }, { p: 'lf_flood', x: 13, y: 10, if: '!mb_bridge_named', o: { cx: 13, cy: 10 } }, { p: 'lf_flood', x: 14, y: 10, if: '!mb_bridge_named', o: { cx: 14, cy: 10 } },
      { p: 'mb_plaque', x: 11, y: 12, scene: 'mb.firstbridge_plaque', o: { bridge: 'musubi' } },
      { p: 'lantern', x: 4, y: 12, o: { lit: true } }, { p: 'lantern', x: 23, y: 12, o: { lit: true } },
      { p: 'shrine', x: 13, y: 2, scene: 'mb.firstbridge_shrine' },
    ],
    npcs: [{ id: 'mb_bridgespirit', char: 'mb_bridgespirit', x: 13, y: 11, dir: 'down', if: '!mb_bridge_named', talk: 'mb.boss_go' }],
    exits: [],
    onEnter: [{ scene: 'mb.firstbridge_arrive', if: '!mb_firstbridge_seen' }],
    spawn: { default: [13, 14, 'up'], from_lock: [13, 14, 'up'] },
  });
})(RB.content, RB.mapkit);
