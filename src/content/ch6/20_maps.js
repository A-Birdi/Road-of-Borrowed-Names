/* Chapter 6 maps: the Archive road above Lanternfall, the pilgrims' hut,
 * and the Still Archive itself — gate, Reading Room, Stacks, conduit
 * terminus, Room of Set-Down Memories, Kasane's study and the Heart. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  // Archive ambience changes once the Hush has settled (read every frame).
  const stillAmbient = (before, after) => ({
    get weather() { return RB.game.s && RB.game.s.flags.sa_hush_down ? after.weather : before.weather; },
    get tint() { return RB.game.s && RB.game.s.flags.sa_hush_down ? after.tint : before.tint; },
    get dark() { return RB.game.s && RB.game.s.flags.sa_hush_down ? (after.dark || 0) : (before.dark || 0); },
    playerLight: 46,
  });

  // ---- the road up from Lanternfall -----------------------------------------------------------
  C.maps['sa.road'] = {
    name: T('The Archive Road', '{書庫|しょこ} への {坂道|さかみち}'), region: 'sa_mount',
    music: [{ if: 'sa_descent', id: 'ending' }, { if: 'sa_hush_down', id: 'road' }, { id: 'quiet_road' }],
    ambient: {
      get weather() { return RB.game.s && RB.game.s.flags.sa_hush_down ? 'motes' : 'pages'; },
      get tint() { return RB.game.s && RB.game.s.flags.sa_descent && !RB.game.s.flags.postgame ? 'rgba(255,214,170,0.10)' : null; },
    },
    terrain: K.build(36, 26, '.', (k) => {
      k.swap('.', '*', [0, 0, 36, 12]);
      k.ragged('left', 'Q', 2, 61).ragged('right', 'Q', 3, 62).ragged('top', 'P', 2, 63).ragged('bottom', 'Q', 2, 64);
      k.swap('Q', 'P', [0, 0, 36, 12]);
      // terraces the road switches back across
      k.hline(0, 35, 18, '^', 2);
      k.hline(0, 35, 12, '^', 2);
      k.hline(0, 35, 5, '^', 1);
      k.path([[2, 25], [2, 21], [27, 21], [27, 15], [7, 15], [7, 9], [30, 9], [30, 0]], ':', 2);
      k.scatter('r', 6, 65, [2, 20, 30, 3], '.');
      k.scatter(',', 10, 66, [2, 14, 30, 8], '.');
      k.scatter('R', 5, 67, [2, 1, 30, 10], '*');
      k.scatter('P', 6, 68, [2, 1, 26, 10], '*');
      // a viewpoint ledge over Lanternfall
      k.rect(1, 14, 4, 3, '.');
    }),
    props: [
      { p: 'deadlantern', x: 5, y: 20, scene: 'sa.lantern1', if: '!sa_hush_down' }, { p: 'lantern', x: 5, y: 20, scene: 'sa.lantern1_lit', if: 'sa_hush_down' },
      { p: 'deadlantern', x: 22, y: 20, scene: 'sa.lantern2', if: '!sa_hush_down' }, { p: 'lantern', x: 22, y: 20, scene: 'sa.lantern2_lit', if: 'sa_hush_down' },
      { p: 'deadlantern', x: 12, y: 14, scene: 'sa.lantern3', if: '!sa_hush_down' }, { p: 'lantern', x: 12, y: 14, scene: 'sa.lantern3_lit', if: 'sa_hush_down' },
      { p: 'deadlantern', x: 29, y: 4, scene: 'sa.lantern4', if: '!sa_hush_down' }, { p: 'lantern', x: 29, y: 4, scene: 'sa.lantern4_lit', if: 'sa_hush_down' },
      { p: 'stone_marker', x: 10, y: 23, scene: 'sa.road_marker' },
      { p: 'bench', x: 1, y: 14, scene: 'sa.road_view' },
      { p: 'crate', x: 25, y: 8, scene: 'sa.road_bundle' },
    ],
    npcs: [],
    foes: [
      { id: 'c1', enemy: 'sa.crane', x: 17, y: 16, patrol: 1, aggro: true },
      { id: 'c2', enemy: 'sa.crane', x: 20, y: 10, patrol: 1 },
    ],
    exits: [
      { x: 2, y: 25, w: 2, h: 1, to: 'lf.road', sp: 'from_next', dir: 'down' },
      { x: 30, y: 0, w: 2, h: 1, to: 'sa.camp', tx: 13, ty: 17, dir: 'up' },
    ],
    triggers: [
      { x: 2, y: 24, w: 2, h: 1, scene: 'sa.epilogue', if: 'sa_descent&!sa_done' },
    ],
    onEnter: [{ scene: 'sa.arrive', if: '!sa_arrived' }],
    spawn: { default: [3, 22, 'up'], from_prev: [2, 23, 'up'], from_next: [30, 2, 'down'] },
  };

  // ---- the pilgrims' hut ---------------------------------------------------------------------------
  C.maps['sa.camp'] = {
    name: T('Last Lamp Hut', '{最後|さいご} の {灯|ひ} の {小屋|こや}'), region: 'sa_mount', place: 'sa_hut', travel: 'sa_hut',
    music: [{ if: 'sa_descent', id: 'ending' }, { id: 'inn' }],
    ambient: { weather: 'snow' },
    terrain: K.build(28, 20, '*', (k) => {
      k.ragged('left', 'P', 3, 71).ragged('right', 'P', 3, 72).ragged('top', 'P', 2, 73).ragged('bottom', 'P', 2, 74);
      k.rect(4, 4, 20, 13, '*');
      k.path([[13, 19], [13, 0]], ':', 2);
      k.path([[6, 12], [13, 12]], ':', 1);
      k.rect(15, 10, 6, 5, ':');
      k.scatter('R', 5, 75, [4, 4, 20, 13], '*');
    }),
    structs: [
      { type: 'house', x: 4, y: 7, w: 6, h: 4, roof: 'snow', wall: 'wood', door: 2, windows: [0, 4], chimney: true, lit: true, to: 'sa.hut', spawn: [5, 7] },
    ],
    props: [
      { p: 'lantern', x: 12, y: 15, scene: 'sa.camp_lamp' },
      { p: 'campfire', x: 17, y: 12 },
      { p: 'bench', x: 17, y: 14, block: true }, { p: 'stump', x: 20, y: 12 },
      { p: 'tent', x: 19, y: 9 },
      { p: 'noticeboard', x: 9, y: 13, scene: 'sa.camp_board' },
      { p: 'crate', x: 11, y: 8 }, { p: 'barrel', x: 10, y: 9 },
      { p: 'stone_marker', x: 22, y: 5, scene: 'sa.camp_cairn' },
      // folios brought down to the hut when the Archive is closed but people may still visit theirs
      { p: 'shelf', x: 11, y: 7, scene: 'sa.camp_folios', if: 'end_archive_closed&end_mem_choose' },
    ],
    npcs: [
      { id: 'sa_isamu', x: 16, y: 11, dir: 'right', if: '!post', talk: [
        { if: 'quest.sa_isamu=done', scene: 'sa.isamu_after' },
        { if: 'item.sa_folio_isamu', scene: 'sa.isamu_return' },
        { if: 'quest.sa_isamu', scene: 'sa.isamu_wait' },
        { scene: 'sa.isamu_first' },
      ] },
      { id: 'sa_oyone', x: 11, y: 14, dir: 'right', if: 'sa_descent&!post', talk: 'sa.oyone_descent' },
      { id: 'kasane', x: 16, y: 15, dir: 'left', if: 'sa_descent&end_kasane_trial&!post', talk: 'sa.kasane_walk' },
      { id: 'sa_tsuzuri', was: 'sa_clerk', x: 16, y: 6, dir: 'down', if: 'post&end_archive_closed&sa_clerk_named', talk: 'sa.tsuzuri_post' },
      { id: 'sa_clerk', x: 16, y: 6, dir: 'down', if: 'post&end_archive_closed&!sa_clerk_named', talk: 'sa.clerk_post' },
    ],
    exits: [
      { x: 13, y: 19, w: 2, h: 1, to: 'sa.road', tx: 30, ty: 2, dir: 'down' },
      { x: 13, y: 0, w: 2, h: 1, to: 'sa.gate', tx: 14, ty: 19, dir: 'up' },
    ],
    triggers: [
      { x: 13, y: 16, w: 2, h: 1, scene: 'sa.camp_descent', if: 'sa_descent&!seen.sa.camp_descent', id: 'descent' },
    ],
    onEnter: [{ scene: 'sa.camp_first', if: '!seen.sa.camp_first' }],
    spawn: { default: [13, 17, 'up'] },
  };
  C.maps['sa.hut'] = {
    name: T('Last Lamp Hut', '{最後|さいご} の {灯|ひ} の {小屋|こや}'), region: 'interior', music: 'inn', noTravel: true,
    terrain: K.room(11, 9, '_', 5),
    props: [
      { p: 'exitmat', x: 5, y: 7 },
      { p: 'stove', x: 1, y: 2 }, { p: 'pot', x: 2, y: 2 },
      { p: 'bed', x: 9, y: 2 }, { p: 'bed', x: 8, y: 2 },
      { p: 'table', x: 4, y: 4, scene: 'sa.hut_register' }, { p: 'chair', x: 3, y: 4 },
      { p: 'shelf', x: 6, y: 2, scene: 'sa.hut_shelf' },
      { p: 'teaset', x: 1, y: 5, scene: 'sa.hut_tea' },
    ],
    ambient: { dark: 0.2, playerLight: 40 },
    npcs: [
      { id: 'sa_oyone', x: 3, y: 2, dir: 'down', talk: [
        { if: 'post', scene: 'sa.oyone_post' },
        { if: 'sa_descent', scene: 'sa.oyone_descent' },
        { if: 'seen.sa.oyone_first', scene: 'sa.oyone_inn' },
        { scene: 'sa.oyone_first' },
      ] },
    ],
    exits: [{ x: 5, y: 8, to: 'sa.camp', tx: 6, ty: 11, dir: 'down' }],
    spawn: { default: [5, 6, 'up'] },
  };

  // ---- the Archive's outer court -----------------------------------------------------------------------
  C.maps['sa.gate'] = {
    name: T('The Archive Gate', '{書庫|しょこ} の {門|もん}'), region: 'sa_still', noTravel: false,
    music: [{ if: 'sa_hush_down', id: 'wonder' }, { id: 'still_archive' }],
    ambient: stillAmbient({ weather: 'pages', tint: 'rgba(210,214,236,0.10)' }, { weather: 'motes', tint: 'rgba(255,232,196,0.06)' }),
    terrain: K.build(30, 22, '+', (k) => {
      k.rect(0, 0, 30, 2, 'x');
      k.ragged('left', 'R', 2, 81).ragged('right', 'R', 2, 82);
      k.rect(5, 12, 20, 8, '+');
      k.rect(12, 9, 6, 11, '=');
      k.hline(13, 16, 20, '=', 2);
      // the conduits climb the court and vanish into the Archive's side
      k.vline(3, 2, 21, 'd', 2);
      k.vline(25, 2, 21, 'd', 2);
      // garden beds, gone grey
      k.rect(6, 14, 4, 4, '.'); k.rect(20, 14, 4, 4, '.');
      k.scatter(',', 5, 83, [6, 14, 4, 4], '.'); k.scatter(',', 5, 84, [20, 14, 4, 4], '.');
    }),
    structs: [
      { type: 'house', x: 8, y: 2, w: 14, h: 7, roof: 'indigo', wall: 'stone', door: 7, windows: [2, 4, 10, 12], to: 'sa.reading', spawn: [14, 17], lit: true, if: '!post|!end_archive_closed' },
    ],
    props: [
      { p: 'sa_statue', x: 11, y: 10, scene: 'sa.gate_statue' }, { p: 'sa_statue', x: 18, y: 10, scene: 'sa.gate_statue' },
      { p: 'sign', x: 18, y: 12, scene: 'sa.gate_plaque' },
      { p: 'sa_grave', x: 22, y: 18, scene: 'sa.ushio_grave' },
      { p: 'lantern', x: 23, y: 18, if: 'sa_hush_down' }, { p: 'deadlantern', x: 23, y: 18, if: '!sa_hush_down' },
      { p: 'deadtree', x: 7, y: 15 }, { p: 'bush', x: 21, y: 15 }, { p: 'flowerpot', x: 23, y: 15, if: 'sa_hush_down' },
      { p: 'sa_pipe', x: 3, y: 2 }, { p: 'sa_pipe', x: 26, y: 2 },
      { p: 'bench', x: 6, y: 19 },
    ],
    npcs: [
      { id: 'kasane', x: 15, y: 12, dir: 'down', if: 'sa_choice_archive&!sa_choice_kasane', talk: 'sa.choose_kasane' },
      { id: 'kasane', x: 15, y: 12, dir: 'down', if: 'sa_choice_kasane&end_kasane_keeper&!post', talk: 'sa.kasane_bye' },
      { id: 'kasane', x: 15, y: 12, dir: 'down', if: 'post&end_kasane_keeper&end_archive_closed', talk: 'sa.kasane_post' },
      { id: 'sa_reader', x: 8, y: 13, dir: 'right', wander: 2, if: 'post&end_archive_library', talk: 'sa.reader_gate' },
    ],
    foes: [
      { id: 'w1', enemy: 'sa.wraith', x: 9, y: 17, patrol: 2, aggro: true },
    ],
    exits: [
      { x: 13, y: 21, w: 2, h: 1, to: 'sa.camp', tx: 13, ty: 2, dir: 'down' },
    ],
    triggers: [
      { x: 15, y: 8, w: 1, h: 1, scene: 'sa.gate_sealed', if: 'post&end_archive_closed' },
    ],
    onEnter: [{ scene: 'sa.gate_first', if: '!seen.sa.gate_first' }],
    spawn: { default: [14, 19, 'up'] },
  };

  // ---- the Reading Room ------------------------------------------------------------------------------------
  C.maps['sa.reading'] = {
    name: T('The Reading Room', '{閲覧室|えつらんしつ}'), region: 'sa_still', noTravel: true,
    music: [{ if: 'sa_hush_down', id: 'wonder' }, { id: 'still_archive' }],
    ambient: stillAmbient({ weather: 'pages', tint: 'rgba(210,214,236,0.10)', dark: 0.15 }, { weather: 'motes', tint: 'rgba(255,232,196,0.06)' }),
    terrain: K.build(28, 20, '#', (k) => {
      k.rect(1, 2, 26, 16, 'p');
      k.rect(12, 2, 4, 16, 'k');
      k.set(14, 18, 'p').set(13, 18, 'p').set(14, 19, 'p').set(13, 19, 'p');
      // side doors
      k.set(0, 9, 'p').set(0, 10, 'p');
      k.set(27, 9, 'p').set(27, 10, 'p');
    }),
    props: [
      { p: 'sa_cabinet', x: 2, y: 2, o: { blank: true }, scene: 'sa.cabinet', if: '!sa_catalogue_done' }, { p: 'sa_cabinet', x: 2, y: 2, scene: 'sa.cabinet_done', if: 'sa_catalogue_done' },
      { p: 'sa_cabinet', x: 5, y: 2, o: { blank: true }, scene: 'sa.cabinet', if: '!sa_catalogue_done' }, { p: 'sa_cabinet', x: 5, y: 2, scene: 'sa.cabinet_done', if: 'sa_catalogue_done' },
      { p: 'sa_cabinet', x: 8, y: 2, o: { blank: true }, scene: 'sa.cabinet', if: '!sa_catalogue_done' }, { p: 'sa_cabinet', x: 8, y: 2, scene: 'sa.cabinet_done', if: 'sa_catalogue_done' },
      { p: 'shelf', x: 18, y: 2 }, { p: 'shelf', x: 19, y: 2 }, { p: 'shelf', x: 20, y: 2 }, { p: 'shelf', x: 21, y: 2 }, { p: 'shelf', x: 22, y: 2 }, { p: 'shelf', x: 23, y: 2 }, { p: 'shelf', x: 24, y: 2 }, { p: 'shelf', x: 25, y: 2 },
      { p: 'pillar', x: 11, y: 5 }, { p: 'pillar', x: 16, y: 5 }, { p: 'pillar', x: 11, y: 12 }, { p: 'pillar', x: 16, y: 12 },
      { p: 'desk', x: 3, y: 7 }, { p: 'desk', x: 7, y: 7, scene: 'sa.reading_desk' }, { p: 'desk', x: 3, y: 11 }, { p: 'desk', x: 7, y: 11 },
      { p: 'desk', x: 19, y: 7 }, { p: 'desk', x: 23, y: 7, scene: 'sa.reading_charter' }, { p: 'desk', x: 19, y: 11 }, { p: 'desk', x: 23, y: 11 },
      { p: 'chair', x: 4, y: 8 }, { p: 'chair', x: 20, y: 12 }, { p: 'chair', x: 24, y: 8 },
      { p: 'bookpile', x: 2, y: 15 }, { p: 'bookpile', x: 25, y: 15 }, { p: 'lantern', x: 1, y: 15 }, { p: 'lantern', x: 26, y: 15 },
      { p: 'sign', x: 15, y: 16, scene: 'sa.reading_plaque' },
      { p: 'sa_gate', x: 1, y: 9, if: '!sa_catalogue_done', scene: 'sa.stacks_locked' }, { p: 'sa_gate', x: 1, y: 10, if: '!sa_catalogue_done', scene: 'sa.stacks_locked' },
      { p: 'sa_door', x: 26, y: 9, if: '!sa_shortcut', scene: 'sa.shortcut_locked' }, { p: 'sa_door', x: 26, y: 10, if: '!sa_shortcut', scene: 'sa.shortcut_locked' },
    ],
    npcs: [
      { id: 'sa_clerk', x: 6, y: 4, dir: 'down', if: '!sa_clerk_named&!post|!sa_clerk_named&!end_archive_closed', talk: [
        { if: 'sa_hush_down', scene: 'sa.clerk_after' },
        { if: 'item.sa_ushio_notes', scene: 'sa.clerk_name' },
        { if: 'seen.sa.clerk_first', scene: 'sa.clerk_again' },
        { scene: 'sa.clerk_first' },
      ] },
      { id: 'sa_tsuzuri', was: 'sa_clerk', x: 6, y: 4, dir: 'down', if: 'sa_clerk_named', talk: [{ if: 'post', scene: 'sa.tsuzuri_post' }, { scene: 'sa.tsuzuri_chat' }] },
      { id: 'kasane', x: 14, y: 8, dir: 'down', if: '!sa_kasane_left', talk: 'sa.kasane_meet' },
      { id: 'kasane', x: 14, y: 6, dir: 'down', if: 'sa_choice_mem&!sa_choice_archive', talk: 'sa.choose_archive' },
      { id: 'kasane', x: 14, y: 5, dir: 'down', if: 'post&end_kasane_keeper&end_archive_library', talk: 'sa.kasane_post' },
      { id: 'sa_reader', x: 20, y: 9, dir: 'left', wander: 2, if: 'post&end_archive_library', talk: 'sa.reader_room' },
    ],
    exits: [
      { x: 13, y: 19, w: 2, h: 1, to: 'sa.gate', tx: 15, ty: 9, dir: 'down' },
      { x: 0, y: 9, w: 1, h: 2, to: 'sa.stacks', tx: 29, ty: 12, dir: 'left', if: 'sa_catalogue_done' },
      { x: 27, y: 9, w: 1, h: 2, to: 'sa.study', tx: 2, ty: 6, dir: 'right', if: 'sa_shortcut' },
    ],
    triggers: [],
    onEnter: [{ scene: 'sa.kasane_meet', if: '!sa_met_kasane' }],
    spawn: { default: [14, 17, 'up'] },
  };

  // ---- the Stacks ------------------------------------------------------------------------------------------------
  // Upper and lower stacks of stone shelves either side of a cross passage.
  // Aisle B (x13-15, below the passage) runs down to a barred niche with the
  // stair; the call slip on the entrance desk says which aisle to look for.
  C.maps['sa.stacks'] = {
    name: T('The Stacks', '{書架|しょか}'), region: 'sa_still', noTravel: true,
    music: [{ if: 'sa_hush_down', id: 'wonder' }, { id: 'hush' }],
    ambient: stillAmbient({ weather: 'pages', tint: 'rgba(200,206,236,0.12)', dark: 0.3 }, { weather: 'motes', tint: 'rgba(255,232,196,0.06)', dark: 0.1 }),
    terrain: K.build(32, 24, '#', (k) => {
      k.rect(1, 2, 30, 21, 'p');
      for (const x of [4, 8, 12, 16, 20, 24]) { k.vline(x, 3, 9, 'L'); k.vline(x, 12, 18, 'L'); }
      k.vline(27, 3, 9, 'L');
      // fallen shelves in the cross passage
      k.set(6, 10, 'L').set(18, 11, 'L').set(22, 10, 'L');
      // the stair niche below aisle B
      k.vline(12, 19, 22, '#'); k.vline(16, 19, 22, '#');
      k.set(31, 12, 'p').set(31, 13, 'p');
    }),
    props: [
      { p: 'desk', x: 27, y: 15, scene: 'sa.stacks_slip' },
      { p: 'sign', x: 5, y: 12, scene: 'sa.aisle_d' }, { p: 'sign', x: 9, y: 12, scene: 'sa.aisle_a' }, { p: 'sign', x: 13, y: 12, scene: 'sa.aisle_b' }, { p: 'sign', x: 17, y: 12, scene: 'sa.aisle_c' },
      { p: 'sa_gate', x: 13, y: 19, if: '!sa_stacks_done', scene: 'sa.stacks_gate' }, { p: 'sa_gate', x: 14, y: 19, if: '!sa_stacks_done', scene: 'sa.stacks_gate' }, { p: 'sa_gate', x: 15, y: 19, if: '!sa_stacks_done', scene: 'sa.stacks_gate' },
      { p: 'stairs', x: 14, y: 21 },
      { p: 'bookpile', x: 2, y: 21 }, { p: 'bookpile', x: 18, y: 2 }, { p: 'bookpile', x: 29, y: 21, scene: 'sa.stacks_pile' },
      { p: 'crystal', x: 30, y: 3 }, { p: 'crystal', x: 1, y: 3 }, { p: 'crystal', x: 22, y: 21 },
      { p: 'ink', x: 19, y: 15 }, { p: 'ink', x: 9, y: 6 }, { p: 'ink', x: 6, y: 20 },
    ],
    npcs: [],
    // The last stretch before the Hush: on Standard a placement may bring a
    // second creature, on Demanding a third (Relaxed: always one). See
    // RB.combatLogic.groupFor and docs/COMBAT_NOTES.md.
    foes: [
      { id: 'w1', enemy: 'sa.wraith', x: 10, y: 6, patrol: 2, aggro: true, group: { normal: ['sa.moth'], hard: ['sa.moth', 'sa.crane'] } },
      { id: 'w2', enemy: 'sa.wraith', x: 22, y: 15, patrol: 2, aggro: true, group: { normal: ['sa.crane'], hard: ['sa.crane', 'sa.moth'] } },
      { id: 'm1', enemy: 'sa.moth', x: 26, y: 5, patrol: 2, group: { normal: ['sa.moth'], hard: ['sa.moth', 'sa.moth'] } },
      { id: 'e1', enemy: 'sa.echo', x: 6, y: 15, patrol: 1, aggro: true, group: { normal: ['sa.moth'], hard: ['sa.moth', 'sa.ghost'] } },
    ],
    exits: [
      { x: 31, y: 12, w: 1, h: 2, to: 'sa.reading', tx: 1, ty: 10, dir: 'right' },
      { x: 14, y: 21, w: 1, h: 1, to: 'sa.conduits', tx: 27, ty: 4, dir: 'down', if: 'sa_stacks_done' },
    ],
    triggers: [],
    onEnter: [{ scene: 'sa.stacks_enter', if: '!seen.sa.stacks_enter' }],
    spawn: { default: [29, 12, 'left'] },
  };

  // ---- the conduit terminus --------------------------------------------------------------------------------------
  // Three channels run from the pipe mouths into a basin; a band of dark water
  // cuts the room in two. The only crossing to the lower floor (and the way on)
  // is the plank at the charter gate, which stays flooded until the gate is
  // persuaded.
  C.maps['sa.conduits'] = {
    name: T('The Quiet Conduits', '{静|しず}かな {水路|すいろ}'), region: 'sa_still', noTravel: true,
    music: [{ if: 'sa_hush_down', id: 'wonder' }, { id: 'hush' }],
    ambient: stillAmbient({ weather: null, tint: 'rgba(160,180,230,0.10)', dark: 0.45 }, { weather: 'motes', tint: 'rgba(255,232,196,0.05)', dark: 0.2 }),
    terrain: K.build(30, 22, '#', (k) => {
      k.rect(1, 2, 28, 19, '+');
      k.vline(7, 2, 13, 'd', 2); k.vline(14, 2, 10, 'd', 2); k.vline(21, 2, 13, 'd', 2);
      k.rect(9, 11, 12, 5, 'd');
      k.rect(1, 14, 8, 1, 'd'); k.rect(21, 14, 8, 1, 'd');
      k.hline(7, 8, 6, 'b'); k.hline(21, 22, 8, 'b'); k.hline(14, 15, 4, 'b');
      k.set(3, 14, 'B');
      k.set(0, 17, '+').set(0, 18, '+');
    }),
    props: [
      { p: 'sa_pipe', x: 7, y: 2 }, { p: 'sa_pipe', x: 14, y: 2 }, { p: 'sa_pipe', x: 21, y: 2 },
      { p: 'sparkle', x: 12, y: 13 }, { p: 'sparkle', x: 16, y: 12 }, { p: 'sparkle', x: 14, y: 14 },
      { p: 'desk', x: 2, y: 4, scene: 'sa.notice_desk' },
      { p: 'sign', x: 4, y: 13, scene: 'sa.charter_gate' },
      { p: 'water', x: 3, y: 14, if: '!sa_promise_done', scene: 'sa.charter_gate' },
      { p: 'lantern', x: 1, y: 8 }, { p: 'lantern', x: 28, y: 5 }, { p: 'lantern', x: 1, y: 19 },
      { p: 'crate', x: 24, y: 18 }, { p: 'barrel', x: 25, y: 18 }, { p: 'crate', x: 27, y: 16, scene: 'sa.conduit_crate' },
    ],
    npcs: [],
    foes: [
      { id: 'g1', enemy: 'sa.ghost', x: 11, y: 9, patrol: 1, aggro: true, group: { normal: ['sa.ghost'], hard: ['sa.ghost', 'sa.crane'] } },
      { id: 'g2', enemy: 'sa.ghost', x: 16, y: 18, patrol: 2, aggro: true, group: { normal: ['sa.crane'], hard: ['sa.crane', 'sa.moth'] } },
      { id: 'c1', enemy: 'sa.crane', x: 25, y: 10, patrol: 1, group: { normal: ['sa.crane'], hard: ['sa.crane', 'sa.crane'] } },
    ],
    exits: [
      { x: 27, y: 3, w: 1, h: 1, to: 'sa.stacks', tx: 14, ty: 20, dir: 'up' },
      { x: 0, y: 17, w: 1, h: 2, to: 'sa.memories', tx: 21, ty: 9, dir: 'left' },
    ],
    triggers: [],
    onEnter: [{ scene: 'sa.conduits_enter', if: '!seen.sa.conduits_enter' }],
    spawn: { default: [27, 5, 'down'] },
  };

  // ---- the Room of Set-Down Memories ----------------------------------------------------------------------------
  C.maps['sa.memories'] = {
    name: T('The Room of Set-Down Memories', '{預|あず}けられた {記憶|きおく} の {部屋|へや}'), region: 'sa_still', noTravel: true,
    music: [{ if: 'sa_hush_down', id: 'sorrow' }, { id: 'sorrow' }],
    ambient: stillAmbient({ weather: 'motes', tint: 'rgba(230,220,200,0.06)', dark: 0.2 }, { weather: 'motes', tint: 'rgba(255,232,196,0.08)', dark: 0.1 }),
    terrain: K.build(24, 18, '#', (k) => {
      k.rect(1, 2, 22, 15, 'p');
      for (const y of [3, 6, 12, 15]) { k.hline(2, 8, y, 'L'); k.hline(14, 20, y, 'L'); }
      k.rect(9, 7, 5, 4, 'k');
      k.set(23, 9, 'p').set(23, 10, 'p');
      k.set(11, 1, 'p').set(11, 0, 'p');
    }),
    props: [
      { p: 'table', x: 10, y: 8, scene: 'sa.mem_table' }, { p: 'chair', x: 12, y: 8 },
      { p: 'crystal', x: 1, y: 9 }, { p: 'crystal', x: 22, y: 5 }, { p: 'crystal', x: 22, y: 13 },
      { p: 'sa_cabinet', x: 9, y: 13, scene: 'sa.mem_requests' },
      // readable shelves (the rest are simply shelves)
      { p: 'shelf', x: 3, y: 3, scene: 'sa.shelf_kasane', block: true },
      { p: 'shelf', x: 6, y: 3, scene: 'sa.shelf_returned_rw' },
      { p: 'shelf', x: 15, y: 3, scene: 'sa.shelf_returned_co' },
      { p: 'shelf', x: 18, y: 3, scene: 'sa.shelf_returned_sb' },
      { p: 'shelf', x: 4, y: 6, scene: 'sa.shelf_ren' },
      { p: 'shelf', x: 7, y: 6, scene: 'sa.shelf_returned_lf' },
      { p: 'shelf', x: 16, y: 6, scene: 'sa.shelf_tae' },
      { p: 'shelf', x: 19, y: 6, scene: 'sa.shelf_grief' },
      { p: 'shelf', x: 3, y: 12, scene: 'sa.shelf_isamu' },
      { p: 'shelf', x: 6, y: 12, scene: 'sa.shelf_grief2' },
      { p: 'shelf', x: 15, y: 12, scene: 'sa.shelf_grief3' },
      { p: 'shelf', x: 18, y: 15, scene: 'sa.shelf_saltglass' },
      { p: 'shelf', x: 5, y: 15, scene: 'sa.shelf_empty' },
    ],
    npcs: [
      { id: 'kasane', x: 11, y: 11, dir: 'up', if: 'sa_toya_read&!sa_choice_mem', talk: 'sa.choose_mem' },
      { id: 'kasane', x: 11, y: 11, dir: 'up', if: 'post&end_kasane_keeper&end_archive_library&end_mem_choose', talk: 'sa.kasane_post_mem' },
    ],
    exits: [
      { x: 23, y: 9, w: 1, h: 2, to: 'sa.conduits', tx: 1, ty: 17, dir: 'right' },
      { x: 11, y: 0, w: 1, h: 1, to: 'sa.study', tx: 7, ty: 9, dir: 'up' },
    ],
    triggers: [],
    onEnter: [{ scene: 'sa.memories_enter', if: '!seen.sa.memories_enter' }],
    spawn: { default: [21, 9, 'left'] },
  };

  // ---- Kasane's study ---------------------------------------------------------------------------------------------
  C.maps['sa.study'] = {
    name: T("The Keeper's Study", 'カサネ の {書斎|しょさい}'), region: 'sa_still', noTravel: true,
    music: [{ if: 'sa_hush_down', id: 'wonder' }, { id: 'mystery' }],
    ambient: stillAmbient({ weather: null, tint: 'rgba(230,220,200,0.05)', dark: 0.35 }, { weather: null, tint: 'rgba(255,232,196,0.06)', dark: 0.2 }),
    terrain: K.build(15, 12, '#', (k) => {
      k.rect(1, 2, 13, 9, '_');
      k.rect(5, 4, 5, 4, 'm');
      k.set(7, 11, '_').set(0, 6, '_').set(7, 1, '_');
    }),
    props: [
      { p: 'desk', x: 5, y: 3, scene: 'sa.study_desk' },
      { p: 'sa_lamp', x: 10, y: 3, scene: 'sa.study_lamp' },
      { p: 'bed', x: 12, y: 2, scene: 'sa.study_bed' },
      { p: 'shelf', x: 1, y: 2, scene: 'sa.study_objections' }, { p: 'shelf', x: 2, y: 2, scene: 'sa.study_objections' },
      { p: 'bookpile', x: 3, y: 2, scene: 'sa.study_notebook' },
      { p: 'smalltable', x: 12, y: 8, scene: 'sa.study_cups' },
      { p: 'bookpile', x: 1, y: 9 }, { p: 'crate', x: 13, y: 9 },
      { p: 'stairs', x: 7, y: 1 },
      { p: 'sa_door', x: 0, y: 6, if: '!sa_shortcut', scene: 'sa.shortcut_open' },
    ],
    npcs: [],
    exits: [
      { x: 7, y: 11, w: 1, h: 1, to: 'sa.memories', tx: 11, ty: 2, dir: 'down' },
      { x: 0, y: 6, w: 1, h: 1, to: 'sa.reading', tx: 26, ty: 10, dir: 'left', if: 'sa_shortcut' },
      { x: 7, y: 1, w: 1, h: 1, to: 'sa.heart', tx: 12, ty: 17, dir: 'up' },
    ],
    triggers: [],
    onEnter: [{ scene: 'sa.study_enter', if: '!seen.sa.study_enter' }],
    spawn: { default: [7, 9, 'up'] },
  };

  // ---- the Heart of the Hush -----------------------------------------------------------------------------------------
  C.maps['sa.heart'] = {
    name: T('The Heart of the Hush', '{静寂|しじま} の {芯|しん}'), region: 'sa_still', noTravel: true,
    music: [{ if: 'sa_hush_down', id: 'finale' }, { id: 'hush' }],
    ambient: stillAmbient({ weather: 'pages', tint: 'rgba(190,196,236,0.14)', dark: 0.4 }, { weather: 'motes', tint: 'rgba(255,226,186,0.10)', dark: 0.15 }),
    terrain: K.build(25, 20, 'x', (k) => {
      // a round island of paper floor over nothing
      for (let y = 0; y < 20; y++) for (let x = 0; x < 25; x++) {
        const dx = (x - 12) / 9.5, dy = (y - 8) / 6.5;
        if (dx * dx + dy * dy <= 1) k.set(x, y, 'p');
      }
      k.vline(12, 13, 19, 'p');
      k.vline(11, 15, 19, '+'); k.vline(13, 15, 19, '+');
    }),
    props: [
      { p: 'sa_hushcore', x: 11, y: 3, if: '!sa_hush_down', scene: 'sa.hush_core' },
      { p: 'sa_hushcore', x: 11, y: 3, o: { settled: true }, if: 'sa_hush_down', scene: 'sa.hush_core_after' },
      { p: 'pillar', x: 5, y: 8 }, { p: 'pillar', x: 19, y: 8 },
      { p: 'bookpile', x: 7, y: 11 }, { p: 'bookpile', x: 17, y: 11 },
    ],
    npcs: [
      { id: 'kasane', x: 12, y: 7, dir: 'down', if: '!sa_hush_down', talk: 'sa.heart_kasane' },
      { id: 'kasane', x: 12, y: 7, dir: 'down', if: 'sa_hush_down&!sa_toya_read', talk: [{ if: '!seen.sa.after_battle', scene: 'sa.after_battle' }, { scene: 'sa.after_return' }] },
    ],
    exits: [{ x: 12, y: 19, w: 1, h: 1, to: 'sa.study', tx: 7, ty: 2, dir: 'down' }],
    triggers: [
      { x: 11, y: 11, w: 3, h: 1, scene: 'sa.heart_kasane', if: '!sa_hush_down&!seen.sa.heart_kasane', id: 'approach' },
    ],
    onEnter: [{ scene: 'sa.heart_enter', if: '!seen.sa.heart_enter' }],
    spawn: { default: [12, 17, 'up'] },
  };
})(RB.content, RB.mapkit);
