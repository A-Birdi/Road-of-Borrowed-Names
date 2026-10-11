/* The Cloudroad, Chapter 10: the High Pass (雲路峠) and the Courier's Hut (expansion P12; plan 07_REGIONS.md R2, D1 a
 * floor-by-floor dungeon, D2 a story dungeon's checkpoints; docs/future/work/P12_CLOUDROAD.md). From Kumoi the road
 * climbs above the cloud:
 *   cr.pass1   the Switchbacks (九十九折り): the road zigzags up the slope; a landslide has taken one turn, and the way
 *              round it is a goat path across the scree (the detour), until the turn is cleared from above (cr_turn_cleared).
 *   cr.pass2   the Rope Bridge (吊り橋) and the snow shelter (避難小屋): a chasm crossed on ropes and planks; on the far
 *              side a shelter with a stove and a little firewood, where the party can rest a few times (the rest hut,
 *              limited uses: var.cr_shelter_uses) and where the road keeps a checkpoint.
 *   cr.pass3   the Snowfield (雪原): open snow under the summit, the waystones half buried, the last stretch.
 *   cr.hut     the Courier's Hut (飛脚小屋): a relay hut on the saddle, its door open; the Courier Who Never Arrived.
 *   cr.summit  the Pass itself: the cloud sea below on every side, and far down to the north-east a valley of steam. The
 *              way down to Steamhollow opens with Chapter 11 (P13).
 * Twelve-chapter journeys only. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const PASS = { region: 'cloudtop', place: 'cloudroad', music: 'cr_pass', edition: 2, noTravel: true, travelKind: 'dungeon', noCompanion: '!cr_apart' };
  const SNOW = { weather: 'snow', tint: 'rgba(225,232,240,0.10)' };
  const clear = [{ if: 'cr_done', ambient: { weather: 'motes', tint: 'rgba(235,240,245,0.06)' } }];

  // ---- the Switchbacks (九十九折り) -----------------------------------------------------------------------------------
  C.maps['cr.pass1'] = Object.assign({}, PASS, {
    name: T('The Switchbacks', '{九十九折|つづらお}り'), ambient: SNOW, alt: clear,
    terrain: K.build(28, 34, '^', (k) => {
      // the road: up from the bottom left, five turns, out at the top right
      k.path([[3, 33], [3, 28], [22, 28], [22, 22], [5, 22], [5, 16], [22, 16], [22, 10], [5, 10], [5, 4], [24, 4], [24, 0]], '+', 2);
      // the detour round the slide on the second turn: a goat path out across the scree and back
      k.path([[23, 29], [26, 29], [26, 22], [24, 22]], ':', 1);
      k.scatter('R', 10, 1101, [0, 0, 28, 34], '^');
    }),
    props: [
      { p: 'cr_slide', x: 22, y: 24, w: 2, h: 2, if: '!cr_turn_cleared' },
      { p: 'stone_marker', x: 7, y: 27, scene: 'cr.pass1_stone' },
      { p: 'kr_toro', x: 20, y: 27 },
    ],
    npcs: [],
    foes: [{ id: 'e1', enemy: 'cr.moth', x: 12, y: 22, patrol: 2, bg: 'cloudtop' }, { id: 'e2', enemy: 'cr.packlantern', x: 14, y: 10, patrol: 2, bg: 'cloudtop' }],
    exits: [
      { x: 3, y: 33, w: 2, h: 1, to: 'cr.kumoi', tx: 34, ty: 12, dir: 'down' },
      { x: 24, y: 0, w: 2, h: 1, to: 'cr.pass2', sp: 'from_below', dir: 'up' },
    ],
    triggers: [{ x: 22, y: 26, w: 2, h: 1, scene: 'cr.pass1_slide', if: '!cr_turn_cleared&!cr_slide_seen' }],
    onEnter: [{ scene: 'cr.pass1_enter', if: '!cr_pass1_seen' }],
    spawn: { default: [3, 32, 'up'], from_west: [3, 32, 'up'], from_above: [24, 1, 'down'] },
  });

  // ---- the Rope Bridge (吊り橋) and the snow shelter (避難小屋) --------------------------------------------------------
  C.maps['cr.pass2'] = Object.assign({}, PASS, {
    name: T('The Rope Bridge', '{吊|つ}り{橋|ばし}'), ambient: SNOW, alt: clear,
    terrain: K.build(36, 22, '*', (k) => {
      k.ragged('top', '^', 3, 1111).ragged('bottom', '^', 2, 1112);
      k.path([[0, 18], [6, 18], [6, 10], [35, 10]], '+', 2);
      k.rect(14, 0, 7, 22, '~');
      k.rect(14, 10, 7, 2, 'b');
      k.scatter('P', 8, 1113, [0, 3, 13, 6], '*');
      k.scatter('R', 6, 1114, [22, 13, 14, 6], '*');
    }),
    structs: [{ type: 'house', x: 26, y: 4, w: 6, h: 4, roof: 'thatch', wall: 'wood', door: 3, windows: [1], lit: true }],
    props: [
      { p: 'stone_marker', x: 9, y: 12, scene: 'cr.bridge_stone' },
      { p: 'campfire', x: 29, y: 8, scene: 'cr.shelter' },
      { p: 'sb_woodpile', x: 32, y: 8, scene: 'cr.shelter_wood' },
    ],
    npcs: [],
    foes: [{ id: 'e1', enemy: 'cr.echo', x: 6, y: 14, patrol: 2, bg: 'cloudtop' }],
    exits: [
      { x: 0, y: 18, w: 1, h: 2, to: 'cr.pass1', sp: 'from_above', dir: 'left' },
      { x: 35, y: 10, w: 1, h: 2, to: 'cr.pass3', sp: 'from_west', dir: 'right' },
    ],
    triggers: [{ x: 13, y: 10, w: 1, h: 2, scene: 'cr.bridge', if: '!cr_bridge_crossed' }],
    onEnter: [{ scene: 'cr.pass2_enter', if: '!cr_pass2_seen' }],
    spawn: { default: [1, 18, 'right'], from_below: [1, 18, 'right'], from_east: [34, 10, 'left'] },
  });

  // ---- the Snowfield (雪原) ------------------------------------------------------------------------------------------
  C.maps['cr.pass3'] = Object.assign({}, PASS, {
    name: T('The Snowfield', '{雪原|せつげん}'), ambient: SNOW, alt: clear,
    terrain: K.build(36, 24, '*', (k) => {
      k.ragged('top', '^', 4, 1121).ragged('bottom', '^', 3, 1122);
      k.scatter('R', 14, 1123, [0, 4, 36, 16], '*');
      k.path([[0, 10], [12, 10], [12, 14], [26, 14], [26, 8], [35, 8]], '+', 1);
    }),
    props: [
      { p: 'stone_marker', x: 6, y: 9, scene: 'cr.snow_stone1' }, { p: 'stone_marker', x: 18, y: 13, scene: 'cr.snow_stone2' },
      { p: 'stone_marker', x: 28, y: 7, scene: 'cr.snow_stone3' },
      { p: 'sb_drift', x: 20, y: 14, if: '!cr_drift_cleared', scene: 'cr.drift' },
    ],
    npcs: [],
    foes: [{ id: 'e1', enemy: 'cr.moth', x: 16, y: 14, patrol: 2, bg: 'cloudtop' }, { id: 'e2', enemy: 'cr.ox', x: 30, y: 8, patrol: 1, bg: 'cloudtop' }],
    exits: [
      { x: 0, y: 10, w: 1, h: 1, to: 'cr.pass2', sp: 'from_east', dir: 'left' },
      { x: 35, y: 8, w: 1, h: 1, to: 'cr.hut', sp: 'from_west', dir: 'right' },
    ],
    onEnter: [{ scene: 'cr.pass3_enter', if: '!cr_pass3_seen' }],
    spawn: { default: [1, 10, 'right'], from_west: [1, 10, 'right'], from_east: [34, 8, 'left'] },
  });

  // ---- the Courier's Hut (飛脚小屋) ----------------------------------------------------------------------------------
  C.maps['cr.hut'] = Object.assign({}, PASS, {
    name: T('The Courier\'s Hut', '{飛脚|ひきゃく}{小屋|ごや}'), music: 'cr_hut', ambient: { weather: 'snow', tint: 'rgba(200,210,226,0.16)', dark: 0.1 }, alt: clear,
    terrain: K.build(30, 22, '*', (k) => {
      k.ragged('top', '^', 3, 1131).ragged('bottom', '^', 3, 1132);
      k.path([[0, 12], [29, 12]], '+', 2);
    }),
    structs: [{ type: 'house', x: 10, y: 5, w: 10, h: 6, roof: 'thatch', wall: 'wood', door: 5, windows: [1, 8], lit: false }],
    props: [
      { p: 'kr_toro', x: 9, y: 11 }, { p: 'kr_toro', x: 20, y: 11 },
      { p: 'cr_satchel', x: 15, y: 11, if: 'cr_courier_done&!cr_message_taken', scene: 'cr.satchel' },
    ],
    npcs: [],
    exits: [
      { x: 0, y: 12, w: 1, h: 2, to: 'cr.pass3', sp: 'from_east', dir: 'left' },
      { x: 29, y: 12, w: 1, h: 2, to: 'cr.summit', sp: 'from_west', dir: 'right', if: 'cr_courier_done' },
    ],
    triggers: [{ x: 13, y: 12, w: 4, h: 2, scene: 'cr.courier', if: '!cr_courier_done' }],
    onEnter: [{ scene: 'cr.hut_enter', if: '!cr_hut_seen' }],
    spawn: { default: [1, 12, 'right'], from_west: [1, 12, 'right'], from_east: [28, 12, 'left'] },
  });

  // ---- the Pass (峠): the cloud sea, and the valley of steam below ------------------------------------------------------
  C.maps['cr.summit'] = Object.assign({}, PASS, {
    name: T('The Cloudroad Pass', '{雲路峠|くもじとうげ}'), music: 'cloudroad', noTravel: false, travel: 'cloudroad', travelKind: null,
    ambient: { weather: 'motes', tint: 'rgba(240,236,226,0.06)' },
    terrain: K.build(36, 22, '*', (k) => {
      k.rect(0, 0, 36, 4, '~');
      k.rect(0, 16, 36, 6, '~');
      k.ragged('top', '~', 2, 1141).ragged('bottom', '~', 3, 1142);
      k.path([[0, 10], [35, 10]], '+', 2);
      k.scatter('R', 6, 1143, [0, 5, 36, 10], '*');
    }),
    props: [
      { p: 'stone_marker', x: 17, y: 8, scene: 'cr.summit_stone' },
      { p: 'cr_joyato', x: 20, y: 8, if: 'cr_done', light: 40, o: { lit: true }, scene: 'cr.lamp_lit' },
      { p: 'bench', x: 12, y: 13, scene: 'cr.summit_view' },
    ],
    npcs: [],
    exits: [
      { x: 0, y: 10, w: 1, h: 2, to: 'cr.hut', sp: 'from_east', dir: 'left' },
    ],
    triggers: [{ x: 33, y: 10, w: 1, h: 2, scene: 'cr.summit_east' }],
    onEnter: [{ scene: 'cr.end', if: 'cr_message_taken&!cr_done' }],
    spawn: { default: [1, 10, 'right'], from_west: [1, 10, 'right'] },
  });
})(RB.content, RB.mapkit);
