/* The Flood Cellars (expansion P07's pilot; plan 04_DUNGEONS.md D1–D4, D6 A31, D10): an optional expedition under
 * Reedwake's River Warehouse, in journeys of the twelve-chapter edition once Chapter 2 is over. Since the storm the
 * river has stood in the cellars where the village keeps its rice; the hands who worked the drains left notices
 * saying what they had already done (～てある), and the sluice cannot be worked without reading them.
 *
 * An apprenticeship dungeon (A31): everything in it is known but one construction. The notice at the foot of the
 * ladder teaches ～てある; the lamp, the grate and the sluice use it; the outflow door combines it with ～ている and
 * ～てください.
 *
 *   B1, the Upper Cellar: a ring of passages round the rice store, with two ways to the stairs down (north past the
 *     bench, south past the lamp room), the store itself as a cut across, and the lamp room as an optional route.
 *   B2, the Flooded Cellar: a channel across the middle, a bridge on the west, the spring, the sluice works in the
 *     south-east; the outflow chamber beyond the water, reached only once the sluice has drained it, holds the
 *     ladder whose grate opens the way back up (the shortcut) and the outflow door, watched by a blot.
 *
 * Expedition rules: condition carries between encounters (mistakes given back), one bench, one spring and a lamp
 * that can be mended into a rest, every creature in sight, defeat starts the cellars again from the ladder, and
 * what is learned, the floors seen and the opened grate stay. (Maps, the definition and the stations here; the
 * language, the sluice and the scenes in 10_learning.js and 20_scenes.js; the screens in src/ui/89b_expedition.js.) */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const CELLAR = { region: 'reedwake', music: 'mill', noTravel: true, noCheckpoint: true, travelKind: 'dungeon', travelPlace: { en: 'the Flood Cellars' }, expedition: 'cellars' };
  // floodwater that stands until the sluice has been worked (an instance flag: a restart brings it back)
  const flood = (cells, cond) => cells.map(([x, y]) => ({ p: 'lf_flood', x, y, if: cond, o: { cx: x, cy: y } }));
  const rect = (x0, y0, w, h) => { const out = []; for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) out.push([x, y]); return out; };
  const WET = '!xp_cellars_drained';

  // ---- B1: the Upper Cellar (40 × 26) ----------------------------------------------------------------------------
  C.maps['rw.cellar1'] = Object.assign({}, CELLAR, {
    name: T('The Upper Cellar', '{地下|ちか} {一階|いっかい}'),
    ambient: { dark: 0.5, playerLight: 54, weather: 'motes' },
    terrain: K.build(40, 26, '#', (k) => {
      k.rect(1, 17, 9, 7, '+');          // the foot of the ladder
      k.rect(2, 3, 3, 14, '+');          // the west passage
      k.rect(2, 3, 30, 3, '+');          // the north passage
      k.rect(29, 3, 3, 20, '+');         // the east passage
      k.rect(9, 20, 23, 3, '+');         // the south passage
      k.rect(9, 9, 17, 8, '+');          // the rice store
      k.rect(17, 6, 2, 3, '+');          //   its north door
      k.rect(12, 17, 2, 3, '+');         //   its south door
      k.rect(18, 11, 6, 4, 'w').rect(19, 12, 4, 2, '~'); // where the floor gave way: a pool
      k.rect(34, 7, 5, 7, '+');          // the lamp room
      k.rect(32, 9, 2, 2, '+');          //   its passage
      k.scatter('w', 14, 701, [2, 3, 30, 3], '+');
      k.scatter('w', 10, 702, [9, 20, 23, 3], '+');
      k.scatter('w', 6, 703, [29, 3, 3, 20], '+');
    }),
    props: [
      { p: 'ladder', x: 2, y: 18 },
      { p: 'noticeboard', x: 5, y: 17, scene: 'xp.cellars_board' },
      { p: 'bench', x: 3, y: 9, scene: 'xp.cellars_bench' },
      // the grate over the shortcut: bolted from below until opened from B2
      { p: 'lf_grate', x: 8, y: 22, scene: 'xp.cellars_grate', if: '!xpk_cellars_sc_ladder' },
      { p: 'hole', x: 8, y: 22, if: 'xpk_cellars_sc_ladder' }, { p: 'ladder', x: 8, y: 22, if: 'xpk_cellars_sc_ladder' },
      { p: 'stairs', x: 30, y: 4 },
      // the rice store
      { p: 'lf_floursacks', x: 9, y: 9 }, { p: 'lf_floursacks', x: 10, y: 9 }, { p: 'lf_floursacks', x: 9, y: 10 },
      { p: 'lf_floursacks', x: 24, y: 9 }, { p: 'lf_floursacks', x: 25, y: 9 }, { p: 'lf_floursacks', x: 25, y: 10 },
      { p: 'crate', x: 9, y: 15 }, { p: 'crate', x: 10, y: 16 }, { p: 'barrel', x: 25, y: 16 }, { p: 'barrel', x: 24, y: 16 },
      { p: 'pillar', x: 14, y: 12 }, { p: 'pillar', x: 14, y: 14 },
      { p: 'bookpile', x: 11, y: 12, scene: 'xp.cellars_tally' },
      // the lamp room (the optional route): a lamp that can be mended into a rest point
      { p: 'deadlantern', x: 36, y: 8, scene: 'xp.cellars_lamp', if: '!xp_cellars_lamp_fixed' },
      { p: 'lantern', x: 36, y: 8, scene: 'xp.cellars_lamp_rest', if: 'xp_cellars_lamp_fixed' },
      { p: 'shelf', x: 34, y: 7 }, { p: 'shelf', x: 38, y: 7 }, { p: 'crate', x: 38, y: 13 }, { p: 'barrel', x: 34, y: 13 },
      { p: 'sign', x: 37, y: 12, scene: 'xp.cellars_lampnote' },
      // the passages
      { p: 'crate', x: 4, y: 4 }, { p: 'barrel', x: 31, y: 16 }, { p: 'crate', x: 2, y: 14 }, { p: 'barrel', x: 20, y: 22 },
      { p: 'lantern', x: 9, y: 17, o: { lit: true } },
    ],
    foes: [
      { id: 'c1', enemy: 'rw.reedling', x: 16, y: 4, patrol: 2, bg: 'mill', intro: { jp: '{水|みず} と {一緒|いっしょ} に {入|はい}って きた {葦|あし} が 、 {通路|つうろ} で {揺|ゆ}れて いる 。', en: 'Reeds that came in with the flood sway in the passage.' }, settle: { jp: '{葦|あし} は {静|しず}か に なって 、 {水|みず} の {中|なか} に {沈|しず}んだ 。', en: 'The reeds go still and sink back into the water.' } },
      { id: 'c2', enemy: 'rw.reedling', x: 23, y: 21, patrol: 2, bg: 'mill', intro: { jp: '{水|みず} と {一緒|いっしょ} に {入|はい}って きた {葦|あし} が 、 {通路|つうろ} で {揺|ゆ}れて いる 。', en: 'Reeds that came in with the flood sway in the passage.' }, settle: { jp: '{葦|あし} は {静|しず}か に なって 、 {水|みず} の {中|なか} に {沈|しず}んだ 。', en: 'The reeds go still and sink back into the water.' } },
      { id: 'c3', enemy: 'rw.dustmoth', x: 12, y: 13, patrol: 1, aggro: true },
    ],
    exits: [
      { x: 30, y: 4, to: 'rw.cellar2', tx: 4, ty: 4, dir: 'down' },
      { x: 8, y: 22, to: 'rw.cellar2', tx: 30, ty: 4, dir: 'down', if: 'xpk_cellars_sc_ladder' },
    ],
    // the ladder up to the warehouse: stepping on its foot asks whether to climb out
    triggers: [{ x: 2, y: 18, w: 1, h: 1, scene: 'xp.cellars_leave' }],
    onEnter: [{ scene: 'xp.cellars_first', once: true }],
    spawn: { default: [4, 20, 'down'] },
  });

  // ---- B2: the Flooded Cellar (34 × 24) ---------------------------------------------------------------------------
  C.maps['rw.cellar2'] = Object.assign({}, CELLAR, {
    name: T('The Flooded Cellar', '{地下|ちか} {二階|にかい}'),
    ambient: { dark: 0.55, playerLight: 50, weather: 'motes' },
    terrain: K.build(34, 24, '#', (k) => {
      k.rect(1, 2, 9, 7, '+');           // the foot of the stairs
      k.rect(10, 4, 14, 3, '+');         // the north passage (under water until drained)
      k.rect(24, 2, 9, 7, '+');          // the outflow chamber
      k.rect(4, 9, 4, 1, '+');           // down to the west bridge
      k.rect(1, 10, 32, 3, '~');         // the channel
      k.rect(5, 10, 2, 3, 'B');          //   the west bridge
      k.rect(26, 9, 2, 1, '+');          //   the east plank's landing
      k.rect(26, 10, 2, 3, 'B');         //   the east plank (under water until drained)
      k.rect(1, 13, 32, 9, '+');         // the south hall
      k.rect(14, 15, 5, 3, 'w');
      k.scatter('w', 18, 711, [1, 13, 32, 9], '+');
      k.scatter('w', 6, 712, [1, 2, 9, 7], '+');
    }),
    props: [
      { p: 'stairs', x: 2, y: 3 },
      { p: 'sign', x: 8, y: 3, scene: 'xp.cellars_b2sign' },
      // the spring (a station)
      { p: 'well', x: 3, y: 19, scene: 'xp.cellars_spring' },
      // the sluice works
      { p: 'co_sluice', x: 28, y: 14, scene: 'xp.cellars_sluice', o: { open: false }, if: WET },
      { p: 'co_sluice', x: 28, y: 14, scene: 'xp.cellars_sluice_done', o: { open: true }, if: 'xp_cellars_drained' },
      { p: 'lf_plate', x: 26, y: 13, scene: 'xp.cellars_sluice_plate' },
      { p: 'pillar', x: 10, y: 15 }, { p: 'pillar', x: 10, y: 19 }, { p: 'pillar', x: 22, y: 15 }, { p: 'pillar', x: 22, y: 19 },
      { p: 'crate', x: 1, y: 13 }, { p: 'barrel', x: 32, y: 21 }, { p: 'crate', x: 31, y: 21 }, { p: 'lf_floursacks', x: 1, y: 21 },
      // the outflow chamber: the ladder up to the grate (the shortcut), the outflow door
      { p: 'ladder', x: 31, y: 3, scene: 'xp.cellars_ladder' },
      { p: 'door', x: 28, y: 1, scene: 'xp.cellars_outflow' },
      { p: 'lantern', x: 25, y: 2, if: 'xpk_cellars_done', o: { lit: true } },
      { p: 'barrel', x: 32, y: 7 },
    ].concat(flood(rect(19, 4, 5, 3), WET), flood(rect(26, 9, 2, 4), WET)),
    foes: [
      { id: 'd1', enemy: 'rw.inkblot', x: 16, y: 19, patrol: 2 },
      { id: 'd2', enemy: 'rw.reedling', x: 6, y: 14, patrol: 1, bg: 'belltower', intro: { jp: '{水|みず} と {一緒|いっしょ} に {入|はい}って きた {葦|あし} が 、 {通路|つうろ} で {揺|ゆ}れて いる 。', en: 'Reeds that came in with the flood sway in the passage.' }, settle: { jp: '{葦|あし} は {静|しず}か に なって 、 {水|みず} の {中|なか} に {沈|しず}んだ 。', en: 'The reeds go still and sink back into the water.' } },
      // the blot at the outflow door: an encounter of its own (10_learning.js), always in sight
      { id: 'd3', enemy: 'rw.inkblot', encounter: 'xp.cellars_blot', x: 28, y: 4, patrol: 1, aggro: true,
        intro: { jp: '{戸|と} の {前|まえ} で 、 {墨|すみ} の {染|し}み が {貼|は}り{紙|がみ} を {汚|よご}して いる 。', en: 'In front of the door, a blot of ink is smearing the notices.' },
        settle: { jp: '{染|し}み は {薄|うす}く なって 、 {水|みず} と {一緒|いっしょ} に {流|なが}れて いった 。', en: 'The blot thins and runs away with the water.' } },
    ],
    exits: [
      { x: 2, y: 3, to: 'rw.cellar1', tx: 30, ty: 5, dir: 'down' },
    ],
    spawn: { default: [4, 4, 'down'] },
  });

  // ---- the expedition --------------------------------------------------------------------------------------------
  RB.expedition.define('cellars', {
    title: T('The Flood Cellars', '{倉庫|そうこ} の {地下|ちか}'), kind: 'side',
    floors: [
      { id: 'b1', map: 'rw.cellar1', entry: { x: 4, y: 20, dir: 'down' }, name: T('The Upper Cellar', '{地下|ちか} {一階|いっかい}') },
      { id: 'b2', map: 'rw.cellar2', entry: { x: 4, y: 4, dir: 'down' }, name: T('The Flooded Cellar', '{地下|ちか} {二階|にかい}') },
    ],
    preview: {
      language: T('What someone has done and left so: 〜て ある, read in the cellar hands\' notices. New here: 〜て ある. Also used: 〜て いる, 〜て ください.', '〜て ある'),
      size: T('Two floors, with an optional room. Each step is fitted to your profile.'),
      suggested: T('Any profile, once Chapter 2 is over.'),
    },
    rules: { persistent: true, restart: 'entrance', ambush: false },
    stations: {
      bench: { kind: 'bench', map: 'rw.cellar1', x: 3, y: 9 },
      spring: { kind: 'spring', map: 'rw.cellar2', x: 3, y: 19 },
      lamp: { kind: 'lamp', map: 'rw.cellar1', x: 36, y: 8, requires: 'xp_cellars_lamp_fixed' },
    },
    shortcuts: { ladder: { map: 'rw.cellar2', x: 31, y: 3, to: { map: 'rw.cellar1', x: 8, y: 22 } } },
    procedures: ['xp_cellars_sluice'],
    exit: { map: 'rw.warehouse', x: 7, y: 4, dir: 'down' },
  });

  // ---- the way in: a hatch in the River Warehouse, and Yasu, who keeps it -----------------------------------------
  const wh = C.maps['rw.warehouse'];
  wh.props.push(
    { p: 'sg_hatch', x: 7, y: 3, scene: 'xp.cellars_hatch', if: 'ed>=2&ch2_done' },
  );
  const yasu = (C.maps['rw.village'].npcs || []).find((n) => n.id === 'yasu');
  if (yasu) yasu.talk.unshift({ if: 'ed>=2&ch2_done&!xpk_cellars_heard', scene: 'xp.cellars_yasu' }, { if: 'ed>=2&xpk_cellars_done&!xpk_cellars_thanked', scene: 'xp.cellars_yasu_done' });

  // ---- the stamp: the cellars drained (a dungeon's stamp, like the Atlas's) ---------------------------------------
  C.stamps = C.stamps || {};
  C.stamps['xp.cellars'] = { id: 'xp.cellars', family: 'dungeon', title: T('The cellars drained', '{地下|ちか} の {水|みず} を {抜|ぬ}く'), criteria: T('Drain the Flood Cellars and open the outflow door.', '{倉庫|そうこ} の {地下|ちか} の {水|みず} を {抜|ぬ}く'), when: 'ed>=2&xpk_cellars_done', stand: null, design: { shape: 'square', motif: 'stairs', ink: '#2a5a6a' } };
})(RB.content, RB.mapkit);
