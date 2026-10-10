/* The Keepers' Road, Chapter 7: the Scriptorium Cave and the Room of Wicks (expansion P10; R8, D6: a story dungeon
 * with checkpoints). Behind the lodge:
 *   kr.cave1  the Register Shelves: four lantern niches lit in the order the tellings agree on (kr.rite); a wrong
 *             telling (the song's order) rings the bell too soon and slides a shelf aside onto a dead end whose
 *             carving says why, never a trap; the right order opens the way on.
 *   kr.cave2  the Copying Room: the keepers' desks; a bench to rest (the checkpoint); the Teller's Shadow at the
 *             stairs, retelling what you did wrongly until the account is put right.
 *   kr.cave3  the Deepest Shelves: the registers (the waystations, and the keepers' first telling of しじま in three
 *             versions); the Lantern Ghost by the lectern.
 *   kr.vigil  the Room of Wicks, where the vigil is kept at night: ninety-nine wicks, a story at each.
 * Twelve-chapter journeys only. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const CAVE = { region: 'keepers', place: 'keepers', music: 'kr_cave', edition: 2, noTravel: true, travelKind: 'dungeon', setting: 'indoor' };
  const DARK = { dark: 0.55, playerLight: 54, weather: 'motes' };
  // a niche lamp: dark, or lit once the rite has gone right (flag)
  const niche = (x, y, flag) => [{ p: 'deadlantern', x, y, if: '!' + flag }, { p: 'lantern', x, y, if: flag, o: { lit: true } }];

  // ---- the Register Shelves (書庫の洞・一) ----------------------------------------------------------------------------
  C.maps['kr.cave1'] = Object.assign({}, CAVE, {
    name: T('The Register Shelves', '{書庫|しょこ} の {洞|ほら}'),
    ambient: DARK,
    terrain: K.build(28, 20, '#', (k) => {
      k.rect(5, 2, 20, 17, '+');
      k.rect(13, 0, 3, 2, '+');                     // the inner door (opens once the rite is done)
      k.rect(1, 9, 3, 3, '+');                      // the alcove behind the sliding shelf (the dead end),
      k.set(4, 10, '+');                            // reached only through the gap the shelf covers
      for (const y of [8, 12]) { k.hline(6, 11, y, 'L'); k.hline(18, 23, y, 'L'); }
      k.set(14, 19, '+');
    }),
    props: [
      ...niche(7, 3, 'kr_rite_done'), ...niche(11, 3, 'kr_rite_done'), ...niche(17, 3, 'kr_rite_done'), ...niche(22, 3, 'kr_rite_done'),
      { p: 'desk', x: 14, y: 6, scene: 'kr.rite' },
      { p: 'shelf', x: 5, y: 10, if: '!kr_cave_wrong', scene: 'kr.cave_shelf' },
      { p: 'kr_stele', x: 2, y: 10, scene: 'kr.cave_deadend' },
      { p: 'door', x: 14, y: 1, if: '!kr_rite_done', scene: 'kr.cave_inner_shut' },
      { p: 'exitmat', x: 14, y: 18 },
    ],
    npcs: [],
    foes: [
      { id: 'c1a', enemy: 'kr.shadow', x: 20, y: 15, patrol: 2, bg: 'keepers_cave' },
    ],
    exits: [
      { x: 14, y: 19, to: 'kr.lodge', sp: 'from_cave', dir: 'down' },
      { x: 14, y: 0, w: 1, h: 1, to: 'kr.cave2', sp: 'from_cave1', dir: 'up', if: 'kr_rite_done' },
    ],
    onEnter: [{ scene: 'kr.cave_enter', if: '!kr_cave_seen' }],
    spawn: { default: [14, 18, 'up'], from_lodge: [14, 18, 'up'], from_cave2: [14, 2, 'down'] },
  });

  // ---- the Copying Room (写し場) --------------------------------------------------------------------------------------
  C.maps['kr.cave2'] = Object.assign({}, CAVE, {
    name: T('The Copying Room', '{写|うつ}し{場|ば}'),
    ambient: DARK,
    terrain: K.build(30, 22, '#', (k) => {
      k.rect(3, 2, 24, 19, '+');
      k.rect(14, 21, 2, 1, '+');
      for (const x of [6, 12, 18]) k.vline(x, 5, 9, 'L');
      for (const x of [6, 12, 18]) k.vline(x, 13, 16, 'L');
      k.rect(24, 2, 3, 3, '+');
    }),
    props: [
      { p: 'table', x: 8, y: 6, scene: 'kr.copy_desk' }, { p: 'table', x: 14, y: 6 }, { p: 'table', x: 8, y: 14 }, { p: 'table', x: 14, y: 14 },
      { p: 'bookpile', x: 21, y: 8 }, { p: 'bookpile', x: 22, y: 15 },
      { p: 'bench', x: 4, y: 18, scene: 'kr.cave_bench' },
      { p: 'lantern', x: 4, y: 17, o: { lit: true } },
      { p: 'stairs', x: 25, y: 3, if: 'kr_cave2_open', scene: 'kr.cave_down' },
      { p: 'deadlantern', x: 25, y: 3, if: '!kr_cave2_open', scene: 'kr.cave_stairs_shut', o: { staysDark: true } },
    ],
    npcs: [],
    foes: [
      { id: 'c2a', enemy: 'kr.chochin', x: 10, y: 11, patrol: 2, bg: 'keepers_cave',
        intro: { jp: '{写|うつ}し{場|ば} の {天井|てんじょう} から 、 {提灯|ちょうちん} が {一|ひと}つ {下|お}りて きた 。 {骨|ほね} が {裂|さ}けて 、 {笑|わら}って いる 。', en: 'A lantern drops from the Copying Room\'s ceiling. One rib splits in a grin.' },
        settle: { jp: '{提灯|ちょうちん} は {天井|てんじょう} へ {戻|もど}って 、 {静|しず}か に {揺|ゆ}れて いる 。', en: 'The lantern goes back up to the ceiling and hangs there, swaying quietly.' } },
      { id: 'c2b', enemy: 'kr.shadow', x: 20, y: 18, patrol: 1, bg: 'keepers_cave' },
    ],
    triggers: [
      { x: 22, y: 3, w: 2, h: 3, scene: 'kr.shadow_gate', if: '!kr_cave2_open' },
    ],
    exits: [
      { x: 14, y: 21, w: 2, h: 1, to: 'kr.cave1', sp: 'from_cave2', dir: 'down' },
    ],
    spawn: { default: [14, 20, 'up'], from_cave1: [14, 20, 'up'], from_cave3: [24, 4, 'left'] },
  });

  // ---- the Deepest Shelves (奥の書庫) --------------------------------------------------------------------------------
  C.maps['kr.cave3'] = Object.assign({}, CAVE, {
    name: T('The Deepest Shelves', '{奥|おく} の {書庫|しょこ}'),
    ambient: { dark: 0.6, playerLight: 52, weather: 'motes' },
    terrain: K.build(26, 18, '#', (k) => {
      k.rect(3, 2, 20, 14, '+');
      for (const y of [4, 7, 10]) { k.hline(4, 9, y, 'L'); k.hline(16, 21, y, 'L'); }
    }),
    props: [
      { p: 'stairs', x: 4, y: 14, scene: 'kr.cave_up' },
      { p: 'desk', x: 12, y: 4, scene: 'kr.registers' },
      { p: 'lantern', x: 12, y: 2, o: { lit: true } },
      { p: 'kr_wicks', x: 12, y: 13, o: { n: 0 } },
    ],
    npcs: [],
    foes: [],
    triggers: [
      { x: 10, y: 6, w: 5, h: 1, scene: 'kr.ghost_lectern', if: '!kr_ghost_calmed' },
    ],
    exits: [],
    spawn: { default: [5, 14, 'right'], from_cave2: [5, 14, 'right'] },
  });

  // ---- the Room of Wicks (灯明の間), the vigil -------------------------------------------------------------------------
  C.maps['kr.vigil'] = Object.assign({}, CAVE, {
    name: T('The Room of Wicks', '{灯明|とうみょう} の {間|ま}'),
    music: 'kr_vigil',
    ambient: { dark: 0.62, playerLight: 30, tint: 'rgba(40,30,20,0.12)' },
    terrain: K.build(20, 14, '#', (k) => { k.rect(2, 2, 16, 10, 'm'); k.rect(9, 12, 2, 1, '+'); }),
    props: [
      { p: 'kr_wicks', x: 3, y: 2, o: { n: 6 } }, { p: 'kr_wicks', x: 7, y: 2, o: { n: 6 } }, { p: 'kr_wicks', x: 11, y: 2, o: { n: 6 } }, { p: 'kr_wicks', x: 15, y: 2, o: { n: 6 } },
      { p: 'kr_wicks', x: 2, y: 6, o: { n: 5 } }, { p: 'kr_wicks', x: 16, y: 6, o: { n: 5 } },
      { p: 'table', x: 9, y: 6 },
    ],
    npcs: [
      { id: 'kr_hisae', x: 8, y: 5, dir: 'down', talk: 'kr.vigil_hisae' },
      { id: 'kr_kikyo', x: 12, y: 5, dir: 'down', talk: 'kr.vigil_kikyo' },
    ],
    exits: [],
    onEnter: [{ scene: 'kr.vigil_begin', if: '!kr_vigil_done' }],
    spawn: { default: [9, 10, 'up'], from_lodge: [9, 10, 'up'] },
  });
})(RB.content, RB.mapkit);
