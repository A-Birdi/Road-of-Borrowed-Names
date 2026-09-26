/* Chapter 4 dungeon: the frozen observatory.
 *   sb.obs_path    — the Star Stair (switchback climb, frozen stream, foxes)
 *   sb.obs_hall    — ground floor (ice, telescopes, the direction-dial door)
 *   sb.obs_charts  — the chart room (observing log, drawers; mid-dungeon rest)
 *   sb.obs_gallery — upper gallery (service stair shortcut, hatch crank)
 *   sb.obs_dome    — the lamp room (boss, relighting) */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const lampLit = () => { const s = RB.game && RB.game.s; return !!(s && s.flags.sb_lamp_lit); };

  C.maps['sb.obs_path'] = {
    name: T('The Star Stair', '{星|ほし} の {石段|いしだん}'), region: 'snowbell', music: 'observatory', noTravel: true,
    ambient: { weather: 'snow', get dark() { return lampLit() ? 0.2 : 0.1; }, tint: 'rgba(170,190,230,0.08)' },
    terrain: K.build(28, 40, '*', (k) => {
      k.ragged('left', 'P', 3, 61).ragged('right', 'P', 3, 62);
      k.rect(0, 0, 28, 1, 'P');
      // ridges between the switchbacks, each with one gap
      k.rect(0, 28, 28, 2, '^').rect(3, 28, 3, 2, '*');
      k.rect(0, 18, 28, 2, '^').rect(21, 18, 3, 2, '*');
      k.rect(0, 7, 28, 2, '^').rect(4, 7, 3, 2, '*');
      // a frozen stream running down the middle band
      k.rect(12, 20, 2, 8, 'i');
      k.scatter('R', 8, 63, [3, 9, 22, 9], '*');
      k.scatter('R', 8, 64, [3, 20, 22, 8], '*');
      k.scatter('R', 6, 65, [3, 30, 22, 8], '*');
      k.scatter('P', 6, 66, [3, 30, 22, 8], '*');
      k.scatter('P', 5, 67, [3, 10, 22, 7], '*');
      // the stair itself
      k.path([[14, 39], [14, 34], [4, 34], [4, 28]], ':', 2);
      k.path([[4, 27], [4, 24], [22, 24], [22, 18]], ':', 2);
      k.path([[22, 17], [22, 13], [5, 13], [5, 7]], ':', 2);
      k.path([[5, 6], [5, 6], [20, 6]], ':', 1);
      k.rect(12, 24, 2, 2, 'i');
      k.rect(14, 39, 2, 1, ':');
      k.rect(10, 1, 7, 5, 'X');
      k.set(13, 5, ':');
    }),
    legend: { X: { tile: 'snow', prop: 'sb_blocker' } },
    structs: [
      { type: 'house', x: 19, y: 2, w: 3, h: 3, roof: 'snow', wall: 'stone', door: 1 },
    ],
    props: [
      { p: 'sb_observatory', x: 10, y: 1, if: '!sb_lamp_lit' },
      { p: 'sb_observatory', x: 10, y: 1, o: { lit: true }, if: 'sb_lamp_lit' },
      { p: 'deadlantern', x: 7, y: 33, scene: 'sb.path_lantern', if: '!sb_lamp_lit' },
      { p: 'lantern', x: 7, y: 33, if: 'sb_lamp_lit' },
      { p: 'bench', x: 9, y: 36, scene: 'sb.path_bench' },
      { p: 'sign', x: 6, y: 26, scene: 'sb.path_foxsign' },
      { p: 'deadlantern', x: 20, y: 12, scene: 'sb.path_lantern', if: '!sb_lamp_lit' },
      { p: 'lantern', x: 20, y: 12, if: 'sb_lamp_lit' },
      { p: 'sb_icicles', x: 12, y: 30 }, { p: 'sb_icicles', x: 18, y: 20 },
      { p: 'stone_marker', x: 8, y: 5, scene: 'sb.path_marker' },
      { p: 'telescope', x: 23, y: 5, scene: 'sb.path_view' },
    ],
    foes: [
      { id: 'fox1', enemy: 'sb.fox', x: 9, y: 22, patrol: 2, aggro: true },
      { id: 'fox2', enemy: 'sb.fox', x: 18, y: 26, patrol: 2, aggro: true },
      { id: 'wisp1', enemy: 'sb.wisp', x: 14, y: 11, patrol: 2, aggro: true },
    ],
    npcs: [],
    exits: [
      { x: 14, y: 39, w: 2, h: 1, to: 'sb.hamlet', tx: 30, ty: 2, dir: 'down' },
      { x: 13, y: 5, to: 'sb.obs_hall', tx: 10, ty: 14, dir: 'up' },
      { x: 20, y: 4, to: 'sb.obs_gallery', tx: 17, ty: 11, dir: 'up', locked: 'sb.service_door_out', unlock: 'sb_shortcut' },
    ],
    onEnter: [{ scene: 'sb.path_enter', if: '!sb_path_seen' }],
    spawn: { default: [14, 37, 'up'] },
  };

  C.maps['sb.obs_hall'] = {
    name: T('Observatory — Ground Floor', '{天文台|てんもんだい} {一階|いっかい}'), region: 'snowbell', music: 'observatory', noTravel: true,
    ambient: { dark: 0.35, playerLight: 46, tint: 'rgba(150,190,240,0.08)' },
    terrain: K.build(20, 16, '#', (k) => {
      k.rect(1, 2, 18, 13, '+');
      k.rect(3, 4, 5, 3, 'i').rect(12, 9, 5, 4, 'i').rect(8, 11, 3, 2, 'i').rect(14, 3, 3, 2, 'i');
      k.set(10, 15, '+');
      k.set(10, 1, '+');
    }),
    props: [
      { p: 'exitmat', x: 10, y: 14 },
      { p: 'sb_icewall', x: 10, y: 1, if: '!sb_dial1', scene: 'sb.hall_door' },
      { p: 'door', x: 10, y: 1, if: 'sb_dial1' },
      { p: 'sb_dial', x: 12, y: 3, o: { frost: true, point: 'up' }, if: '!sb_dial1', scene: 'sb.hall_dial' },
      { p: 'sb_dial', x: 12, y: 3, o: { point: 'down' }, if: 'sb_dial1', scene: 'sb.hall_dial' },
      { p: 'noticeboard', x: 6, y: 2, scene: 'sb.hall_rules' },
      { p: 'pillar', x: 4, y: 3 }, { p: 'pillar', x: 16, y: 3 }, { p: 'pillar', x: 4, y: 12 }, { p: 'pillar', x: 16, y: 12 },
      { p: 'telescope', x: 2, y: 8, scene: 'sb.hall_scope' }, { p: 'telescope', x: 17, y: 7, scene: 'sb.hall_scope2' },
      { p: 'bookpile', x: 17, y: 13 }, { p: 'crate', x: 1, y: 13 },
      { p: 'sb_starchart', x: 6, y: 9, o: { frost: true }, scene: 'sb.hall_chart' },
      { p: 'sb_icicles', x: 3, y: 2 }, { p: 'sb_icicles', x: 13, y: 2 }, { p: 'sb_icicles', x: 18, y: 2 },
    ],
    foes: [
      { id: 'wisp2', enemy: 'sb.wisp', x: 5, y: 5, patrol: 2, aggro: true },
      { id: 'wisp3', enemy: 'sb.wisp', x: 14, y: 10, patrol: 2, aggro: true },
      { id: 'ghost1', enemy: 'sb.ghost', x: 9, y: 7, patrol: 1, aggro: false },
    ],
    npcs: [],
    exits: [
      { x: 10, y: 15, to: 'sb.obs_path', tx: 13, ty: 6, dir: 'down' },
      { x: 10, y: 1, to: 'sb.obs_charts', tx: 8, ty: 10, dir: 'up', if: 'sb_dial1' },
    ],
    onEnter: [{ scene: 'sb.hall_enter', if: '!sb_hall_seen' }],
    spawn: { default: [10, 14, 'up'] },
  };

  C.maps['sb.obs_charts'] = {
    name: T('The Chart Room', '{星図|せいず} の {部屋|へや}'), region: 'snowbell', music: 'observatory', noTravel: true,
    ambient: { get dark() { const s = RB.game && RB.game.s; return s && s.flags.sb_stove_lit ? 0.2 : 0.4; }, playerLight: 44 },
    terrain: K.build(16, 12, '#', (k) => {
      k.rect(1, 2, 14, 9, '+');
      k.rect(3, 6, 6, 3, 'k');
      k.rect(11, 8, 3, 2, 'i');
      k.set(8, 11, '+');
      k.set(15, 5, '+');
    }),
    props: [
      { p: 'exitmat', x: 8, y: 10 },
      { p: 'shelf', x: 1, y: 2 }, { p: 'shelf', x: 2, y: 2 }, { p: 'shelf', x: 3, y: 2 },
      { p: 'shelf', x: 6, y: 2, scene: 'sb.charts_cabinet' }, { p: 'shelf', x: 7, y: 2, scene: 'sb.charts_cabinet' }, { p: 'shelf', x: 8, y: 2, scene: 'sb.charts_cabinet' },
      { p: 'sb_starchart', x: 4, y: 5, scene: 'sb.charts_log' },
      { p: 'desk', x: 10, y: 4, scene: 'sb.charts_desk' },
      { p: 'stove', x: 13, y: 2, scene: 'sb.charts_stove' },
      { p: 'bookpile', x: 1, y: 9 }, { p: 'chair', x: 11, y: 5 },
      { p: 'stairs', x: 14, y: 5 },
      { p: 'sb_icewall', x: 14, y: 4, if: '!sb_log_solved' }, { p: 'sb_icewall', x: 14, y: 5, o: { cracked: true }, if: '!sb_log_solved', scene: 'sb.charts_stair_locked' }, { p: 'sb_icewall', x: 14, y: 6, if: '!sb_log_solved' },
      { p: 'sb_icicles', x: 10, y: 2 },
    ],
    foes: [
      { id: 'moth1', enemy: 'sb.moth', x: 5, y: 8, patrol: 1, aggro: false },
    ],
    npcs: [],
    exits: [
      { x: 8, y: 11, to: 'sb.obs_hall', tx: 10, ty: 2, dir: 'down' },
      { x: 15, y: 5, to: 'sb.obs_gallery', tx: 2, ty: 10, dir: 'right', locked: 'sb.charts_stair_locked', unlock: 'sb_log_solved' },
    ],
    onEnter: [{ scene: 'sb.charts_enter', if: '!sb_charts_seen' }],
    spawn: { default: [8, 10, 'up'] },
  };

  C.maps['sb.obs_gallery'] = {
    name: T('The Upper Gallery', '{上|うえ} の {回廊|かいろう}'), region: 'snowbell', music: 'observatory', noTravel: true,
    ambient: { dark: 0.4, playerLight: 46, tint: 'rgba(150,190,240,0.06)' },
    terrain: K.build(20, 14, '#', (k) => {
      k.rect(1, 2, 18, 11, '+');
      k.rect(6, 5, 8, 5, '#');
      k.rect(2, 3, 3, 2, 'i').rect(15, 10, 3, 2, 'i').rect(8, 11, 4, 1, 'i');
      k.set(0, 10, '+');
      k.set(19, 11, '+');
    }),
    props: [
      { p: 'ladder', x: 10, y: 4 },
      { p: 'sb_crank', x: 12, y: 3, o: { frost: true }, if: '!sb_crank', scene: 'sb.hatch_crank' },
      { p: 'sb_crank', x: 12, y: 3, o: { turned: true }, if: 'sb_crank', scene: 'sb.hatch_crank' },
      { p: 'noticeboard', x: 7, y: 2, scene: 'sb.gallery_note' },
      { p: 'telescope', x: 2, y: 6, scene: 'sb.gallery_scope' }, { p: 'telescope', x: 17, y: 3, scene: 'sb.gallery_scope2' },
      { p: 'pillar', x: 5, y: 4 }, { p: 'pillar', x: 14, y: 4 }, { p: 'pillar', x: 5, y: 10 }, { p: 'pillar', x: 14, y: 10 },
      { p: 'bookpile', x: 1, y: 2 }, { p: 'crate', x: 18, y: 2 },
      { p: 'sb_icicles', x: 9, y: 2 }, { p: 'sb_icicles', x: 16, y: 2 },
    ],
    foes: [
      { id: 'ghost2', enemy: 'sb.ghost', x: 3, y: 7, patrol: 2, aggro: true },
      { id: 'golem1', enemy: 'sb.golem', x: 16, y: 7, patrol: 1, aggro: false },
    ],
    npcs: [],
    exits: [
      { x: 0, y: 10, to: 'sb.obs_charts', tx: 14, ty: 5, dir: 'left' },
      { x: 19, y: 11, to: 'sb.obs_path', tx: 20, ty: 5, dir: 'down', locked: 'sb.service_bolt', unlock: 'sb_shortcut' },
      { x: 10, y: 4, to: 'sb.obs_dome', tx: 7, ty: 9, dir: 'up', locked: 'sb.hatch', unlock: 'sb_crank' },
    ],
    onEnter: [{ scene: 'sb.gallery_enter', if: '!sb_gallery_seen' }],
    spawn: { default: [2, 10, 'right'] },
  };

  C.maps['sb.obs_dome'] = {
    name: T('The Lamp Room', '{灯|ひ} の {間|ま}'), region: 'snowbell', noTravel: true,
    music: [{ if: 'sb_lamp_lit', id: 'wonder' }, { id: 'observatory' }],
    ambient: { get dark() { return lampLit() ? 0.15 : 0.5; }, playerLight: 40, get tint() { return lampLit() ? 'rgba(255,200,120,0.08)' : 'rgba(150,190,240,0.12)'; } },
    terrain: K.build(14, 12, '#', (k) => {
      k.rect(1, 2, 12, 9, '+');
      k.rect(2, 1, 10, 1, '+');
      k.frame(2, 3, 10, 7, 'i');
      k.set(7, 11, '+');
    }),
    props: [
      { p: 'sb_greatlamp', x: 6, y: 4, o: { frozen: true }, if: '!sb_lamp_lit', scene: 'sb.dome_lamp' },
      { p: 'sb_greatlamp', x: 6, y: 4, o: { lit: true }, if: 'sb_lamp_lit', scene: 'sb.dome_lamp' },
      { p: 'telescope', x: 2, y: 2, scene: 'sb.dome_scope' }, { p: 'telescope', x: 11, y: 2, scene: 'sb.dome_scope' },
      { p: 'sb_starchart', x: 10, y: 8, scene: 'sb.dome_mural' },
      { p: 'hole', x: 7, y: 10 },
      { p: 'sb_icicles', x: 4, y: 1 }, { p: 'sb_icicles', x: 9, y: 1 },
    ],
    npcs: [
      { id: 'hoshino', x: 4, y: 8, dir: 'right', if: 'sb_boss_done&!ch4_done&!sb_evening', talk: 'sb.dome_hoshino' },
    ],
    exits: [
      { x: 7, y: 11, to: 'sb.obs_gallery', tx: 11, ty: 4, dir: 'down' },
    ],
    triggers: [
      { x: 4, y: 6, w: 6, h: 2, scene: 'sb.boss_pre', if: '!sb_boss_done' },
    ],
    onEnter: [{ scene: 'sb.dome_enter', if: '!sb_dome_seen' }],
    spawn: { default: [7, 9, 'up'] },
  };
})(RB.content, RB.mapkit);
