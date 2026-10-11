/* Steamhollow, Chapter 11: the Steam Vents (湯気の抜け穴), under the spring house (expansion P13; plan R3, A11 connected
 * airflow, D2 stationed resources; docs/future/work/P13_STEAMHOLLOW.md). The bath-keepers' old tunnels round the
 * source, where the steam finds its way up through the rock.
 *
 * Connected airflow (A11): the steam has to go somewhere. In the Valve Hall (yn.vents1) one valve at a time lets it out
 * through its own pipe (yn_vent1 the near valve, yn_vent2 the far one, never both): the passage under the open valve
 * clears, and the steam it no longer holds is pushed back into another. Opening the near valve clears the way to the
 * old tool nook, where the far valve's handle lies, and fills the passage to the hot pool; the far valve, with its
 * handle, clears the stair down. In the Channel (yn.vents2) a shutter sends the steam into the upper corridor or the
 * lower one (yn_shutter), so you cross the middle chamber and change it. Nothing here can trap you: every valve and the
 * shutter can be turned back from where you stand.
 *
 * Hot pools (D2): three, each restoring a little (`!hook bath_soak`) and then running cool (yn_pool<n>_used); a
 * checkpoint at the second. The Kettle Below waits in its chamber (yn.kettle); its encounter is in 33_creatures.js. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const VENTS = { region: 'yn_vents', place: 'steamhollow', music: 'yn_vents', edition: 2, noTravel: true, travelKind: 'dungeon', indoor: true, noCompanion: '!yn_apart', ambient: { weather: 'motes', tint: 'rgba(230,226,200,0.10)', dark: 0.32 } };
  const steam = (x, y) => ({ p: 'yn_steam', x, y });
  // a hot pool: steaming until used, then cool
  const pool = (n, x, y) => [
    { p: 'yn_pool', x, y, if: '!yn_pool' + n + '_used', scene: 'yn.pool' + n },
    { p: 'yn_pool', x, y, if: 'yn_pool' + n + '_used', o: { cool: true }, scene: 'yn.pool_cool' },
  ];

  // ==== 1 · the Valve Hall (弁の間) ====================================================================================
  C.maps['yn.vents1'] = Object.assign({}, VENTS, {
    name: T('The Valve Hall', '{弁|べん} の {間|ま}'),
    terrain: K.build(30, 22, '^', (k) => {
      k.rect(3, 20, 2, 2, '+');            // the stair up to the spring house
      k.rect(2, 16, 10, 4, '+');           // the foot of the stair
      k.rect(12, 9, 8, 11, '+');           // the hall
      k.rect(3, 10, 9, 2, '+'); k.rect(2, 4, 7, 6, '+');      // west: the passage to the hot pool's alcove
      k.rect(15, 0, 2, 9, '+');            // north: the way on, down to the channel
      k.rect(20, 14, 4, 2, '+'); k.rect(23, 11, 6, 8, '+');   // east: the passage to the old tool nook
      k.scatter('s', 10, 1361, [2, 4, 27, 16], '+');
    }),
    props: [
      // the steam in each passage, by which valve is open
      { p: 'yn_steamwall', x: 9, y: 10, h: 2, if: 'yn_vent1|yn_vent2' },
      { p: 'yn_steamwall', x: 21, y: 14, h: 2, if: '!yn_vent1' },
      { p: 'yn_steamwall', x: 15, y: 7, w: 2, if: '!yn_vent2' },
      // the valves: the near one in the hall, the far one by the stair down (its handle is in the nook)
      { p: 'yn_valve', x: 13, y: 17, if: '!yn_vent1', scene: 'yn.valve1' },
      { p: 'yn_valve', x: 13, y: 17, if: 'yn_vent1', o: { open: true }, scene: 'yn.valve1' },
      { p: 'yn_valve', x: 18, y: 10, if: '!yn_vent2', scene: 'yn.valve2' },
      { p: 'yn_valve', x: 18, y: 10, if: 'yn_vent2', o: { open: true }, scene: 'yn.valve2' },
      { p: 'yn_handle', x: 26, y: 14, if: '!yn_handle_taken', scene: 'yn.handle' },
      { p: 'stone_marker', x: 6, y: 17, scene: 'yn.vents_notice' },
      steam(14, 12), steam(25, 12), steam(4, 6), steam(7, 18),
    ].concat(pool(1, 3, 5)),
    npcs: [],
    foes: [{ id: 'e1', enemy: 'yn.toad', x: 25, y: 16, patrol: 1, bg: 'yn_vents' }, { id: 'e2', enemy: 'yn.steamwisp', x: 16, y: 13, patrol: 2, bg: 'yn_vents' }],
    exits: [
      { x: 3, y: 21, w: 2, h: 1, to: 'yn.lower', sp: 'from_vents', dir: 'down' },
      { x: 15, y: 0, w: 2, h: 1, to: 'yn.vents2', sp: 'from_above', dir: 'up' },
    ],
    onEnter: [{ scene: 'yn.vents1_first', if: '!yn_vents1_seen' }],
    spawn: { default: [3, 19, 'up'], from_lower: [3, 19, 'up'], from_below: [15, 1, 'down'] },
  });

  // ==== 2 · the Channel (湯樋) ==========================================================================================
  // The old channel that carries the spring to the divider; the shutter in the middle chamber sends the steam up or
  // down; the second hot pool and its checkpoint; the water clock's float, jammed in silt (what the guild's ledger
  // could not explain).
  C.maps['yn.vents2'] = Object.assign({}, VENTS, {
    name: T('The Channel', '{湯樋|ゆどい}'),
    terrain: K.build(32, 24, '^', (k) => {
      k.rect(2, 21, 2, 3, '+');                                // up to the Valve Hall
      k.rect(2, 18, 13, 3, '+');                               // the lower corridor
      k.rect(14, 9, 7, 12, '+');                               // the middle chamber
      k.rect(20, 4, 10, 2, '+'); k.rect(20, 6, 2, 4, '+');     // the upper corridor, out of the chamber's top
      k.rect(28, 0, 2, 4, '+');                                // down to the deep vents
      k.rect(5, 18, 9, 1, '~');                                // the channel itself, along the lower corridor
      k.rect(14, 11, 2, 2, 'd');
      k.scatter('s', 8, 1371, [2, 4, 28, 18], '+');
    }),
    props: [
      { p: 'yn_steamwall', x: 9, y: 19, h: 2, if: 'yn_shutter' },
      { p: 'yn_steamwall', x: 25, y: 4, h: 2, if: '!yn_shutter' },
      { p: 'yn_valve', x: 19, y: 15, if: '!yn_shutter', scene: 'yn.shutter' },
      { p: 'yn_valve', x: 19, y: 15, if: 'yn_shutter', o: { open: true }, scene: 'yn.shutter' },
      { p: 'yn_float', x: 16, y: 18, if: '!yn_float_found', scene: 'yn.float' },
      steam(17, 10), steam(24, 5), steam(6, 19),
    ].concat(pool(2, 16, 13)),
    npcs: [],
    foes: [{ id: 'e1', enemy: 'yn.pebbles', x: 8, y: 19, patrol: 2, bg: 'yn_vents' }, { id: 'e2', enemy: 'yn.toad', x: 17, y: 16, patrol: 1, bg: 'yn_vents' }],
    exits: [
      { x: 2, y: 23, w: 2, h: 1, to: 'yn.vents1', sp: 'from_below', dir: 'down' },
      { x: 28, y: 0, w: 2, h: 1, to: 'yn.vents3', sp: 'from_above', dir: 'up' },
    ],
    onEnter: [{ scene: 'yn.vents2_first', if: '!yn_vents2_seen' }],
    spawn: { default: [2, 21, 'up'], from_above: [2, 21, 'up'], from_below: [28, 1, 'down'] },
  });

  // ==== 3 · the Deep Vents (奥の抜け穴): the Kettle's breath, a bath-keeper at work, the last pool ==================
  C.maps['yn.vents3'] = Object.assign({}, VENTS, {
    name: T('The Deep Vents', '{奥|おく} の {抜|ぬ}け{穴|あな}'), ambient: { weather: 'motes', tint: 'rgba(240,200,160,0.12)', dark: 0.36 },
    terrain: K.build(28, 20, '^', (k) => {
      k.rect(2, 18, 2, 2, '+');
      k.path([[2, 16], [12, 16], [12, 8], [22, 8], [22, 2], [24, 2]], '+', 3);
      k.rect(24, 0, 2, 4, '+');
      k.rect(5, 10, 5, 6, '+');
      k.scatter('s', 8, 1381, [2, 2, 24, 16], '+');
    }),
    props: [steam(8, 11), steam(18, 9), steam(23, 4), { p: 'stone_marker', x: 13, y: 7, scene: 'yn.vents3_stone' }].concat(pool(3, 6, 11)),
    npcs: [],
    foes: [
      { id: 'e1', enemy: 'yn.lostguest', x: 16, y: 9, patrol: 2, bg: 'yn_vents' },
      // Aki, at work in the deep vents (a wanderer, E3: a bath-keeper who joins against anything muddying the water)
      { id: 'w_aki', enemy: 'yn.toad', encounter: 'yn.wander_aki', x: 12, y: 13, patrol: 1, bg: 'yn_vents', if: '!yn_aki_met' },
    ],
    exits: [
      { x: 2, y: 19, w: 2, h: 1, to: 'yn.vents2', sp: 'from_below', dir: 'down' },
      { x: 24, y: 0, w: 2, h: 1, to: 'yn.kettle', sp: 'from_below', dir: 'up' },
    ],
    onEnter: [{ scene: 'yn.vents3_first', if: '!yn_vents3_seen' }],
    spawn: { default: [2, 17, 'up'], from_above: [2, 17, 'up'], from_below: [24, 1, 'down'] },
  });

  // ==== the Kettle's chamber (釜の間) ===================================================================================
  C.maps['yn.kettle'] = Object.assign({}, VENTS, {
    name: T('The Kettle\'s Chamber', '{釜|かま} の {間|ま}'), music: [{ if: 'yn_kettle_settled', id: 'yn_vents' }, { id: 'yn_kettle' }],
    ambient: { weather: 'motes', tint: 'rgba(250,190,140,0.16)', dark: 0.3 },
    alt: [{ if: 'yn_kettle_settled', ambient: { weather: 'motes', tint: 'rgba(200,230,226,0.10)', dark: 0.22 } }],
    terrain: K.build(20, 16, '^', (k) => {
      k.rect(2, 2, 16, 12, '+'); k.rect(6, 3, 8, 5, '~'); k.rect(9, 14, 2, 2, '+');
      k.scatter('s', 8, 1391, [2, 2, 16, 12], '+');
    }),
    props: [steam(7, 3), steam(12, 2), steam(10, 5), steam(4, 9), steam(15, 10),
      { p: 'stone_marker', x: 3, y: 3, scene: 'yn.kettle_stone' }],
    npcs: [],
    exits: [{ x: 9, y: 15, w: 2, h: 1, to: 'yn.vents3', sp: 'from_below', dir: 'down' }],
    triggers: [{ x: 6, y: 9, w: 8, h: 1, scene: 'yn.kettle', if: '!yn_kettle_settled' }],
    onEnter: [{ scene: 'yn.kettle_after', if: 'yn_kettle_settled&!yn_kettle_seen_after' }],
    spawn: { default: [9, 13, 'up'], from_below: [9, 13, 'up'] },
  });
})(RB.content, RB.mapkit);
