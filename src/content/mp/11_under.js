/* Manybridge, Chapter 4: the Understage (奈落), beneath the playhouse's stage (expansion P09; plan R1 B, A16, A4, A5).
 * A story dungeon of theatre machinery: checkpoints at each level's entrance, no expedition rules. Each level is worked
 * from a page of the prompt-book, whose stage directions leave things out and point back (それ, その, 二つ目): read
 * right, the machines move; read wrong, they don't (A5: reference and omission repaired).
 *
 *   B1, the Trap Room (せりの間): two trap lifts; set as the first page says, the lower one becomes the stair down
 *     (the procedure mp.lifts; mp_u1_lift). A Prompter's Ghost stands in the dark, there only once acknowledged.
 *   B2, Beneath the Revolve (回り舞台の下): the revolving stage's capstan, turned in the page's order, brings the
 *     passage round (mp.revolve; mp_u2_turned). The crowded fights; after them, the いくつか growth (C-74).
 *   B3, the Weight Well (錘の井戸): counterweights raise the platform across the well (mp.weights; mp_u3_raised).
 *   The Bottom (奈落の底): the names drawn down, circling the Understage's heart: the boss (mp.boss).
 * The language, procedures and creatures are in 33_under.js; the scenes in 23_scenes_under.js. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const UNDER = { region: 'manybridge', music: 'understage', noTravel: true, travelKind: 'dungeon', travelPlace: { en: 'the Understage' }, edition: 2 };
  const intro = (jp, en) => ({ jp, en });
  const block = (cells, cond) => cells.map(([x, y]) => ({ p: 'crate', x, y, if: cond }));
  
  // ---- B1: the Trap Room (30 × 20) ---------------------------------------------------------------------------------
  C.maps['mp.under1'] = Object.assign({}, UNDER, {
    name: T('The Trap Room', 'せり の {間|ま}'),
    ambient: { dark: 0.52, playerLight: 56, weather: 'motes' },
    terrain: K.build(30, 20, '#', (k) => {
      k.rect(1, 2, 28, 16, '_');         // the boards under the stage
      k.rect(9, 7, 9, 5, 'x');           // the trap shafts: a drop into the dark
      k.rect(22, 2, 1, 16, '#');         // the partition before the east bay
      k.set(22, 9, '_'); k.set(22, 10, '_');   // its doorway (blocked by scenery flats until the lifts are set)
    }),
    props: [
      { p: 'stairs', x: 3, y: 2, scene: 'mp.under_up' },
      { p: 'sign', x: 6, y: 2, scene: 'mp.book1' },
      { p: 'sb_crank', x: 19, y: 3, scene: 'mp.lifts_go' },
      { p: 'mp_lift', x: 12, y: 13, o: { raised: false } }, { p: 'mp_lift', x: 15, y: 13, o: { raised: true } },
      { p: 'mp_weights', x: 20, y: 6 }, { p: 'mp_weights', x: 20, y: 12 },
      ...block([[22, 9], [22, 10]], '!mp_u1_lift'),
      { p: 'pillar', x: 4, y: 14, scene: 'mp.kuroko_1' },
      { p: 'stairs', x: 27, y: 15, scene: 'mp.under_down1' },
      { p: 'crate', x: 25, y: 4 }, { p: 'barrel', x: 26, y: 4 }, { p: 'lantern', x: 12, y: 2, o: { lit: true } }, { p: 'lantern', x: 26, y: 12, o: { lit: true } },
    ],
    foes: [
      { id: 'n1a', enemy: 'mp.moth', x: 6, y: 9, patrol: 2, bg: 'understage', intro: intro('{紙|かみ} の {羽|はね} の {蛾|が} が 、 {台本|だいほん} の {字|じ} を {食|た}べて いる 。 {食|た}べた {所|ところ} の {字|じ} が 、 {違|ちが}う {字|じ} に なって いる 。', 'A moth with paper wings is eating the prompt-book\'s letters. Where it has eaten, the letters have turned into different ones.') },
      { id: 'n1b', enemy: 'mp.imp', x: 16, y: 4, patrol: 2, bg: 'understage', intro: intro('{活字|かつじ} で できた {小鬼|こおに} が 、 {逆|さか}さま の {字|じ} を ばらまいて いる 。', 'An imp made of loose type is scattering letters about, all of them backwards.') },
      { id: 'n1c', enemy: 'mp.kuroko', x: 4, y: 15, patrol: 0, bg: 'understage', if: 'mp_kuroko1', intro: intro('{黒子|くろこ} の {姿|すがた} を した {影|かげ} 。 {名前|なまえ} を {呼|よ}ばれて 、 {初|はじ}めて そこ に いる 。', 'A shadow dressed as a kuroko. Named aloud, it is there at last.') },
    ],
    exits: [],
    onEnter: [{ scene: 'mp.under_arrive', if: '!mp_under_seen' }],
    spawn: { default: [3, 3, 'down'], from_theatre: [3, 3, 'down'], from_below: [27, 14, 'up'] },
  });

  // ---- B2: Beneath the Revolve (32 × 22) ---------------------------------------------------------------------------
  // the revolving stage's underside: a great ring of timber on rollers; the way on is round the far side of it
  C.maps['mp.under2'] = Object.assign({}, UNDER, {
    name: T('Beneath the Revolve', '{回|まわ}り{舞台|ぶたい} の {下|した}'),
    ambient: { dark: 0.56, playerLight: 56, weather: 'motes' },
    terrain: K.build(32, 22, '#', (k) => {
      k.rect(1, 2, 30, 18, '_');
      k.rect(10, 6, 12, 9, '#');         // the revolve's drum (its timber ring, on rollers)
      k.rect(1, 16, 30, 1, '#');         // the cross-wall below it
      k.set(15, 16, '_'); k.set(16, 16, '_');    // the way through, under the revolve's edge
    }),
    props: [
      { p: 'stairs', x: 3, y: 2, scene: 'mp.under_up2' },
      { p: 'sign', x: 7, y: 2, scene: 'mp.book2' },
      { p: 'sb_crank', x: 15, y: 4, scene: 'mp.revolve_go' },
      // until the revolve is turned, the scenery flats it carries stand in the way through
      ...block([[15, 16], [16, 16]], '!mp_u2_turned'),
      { p: 'bench', x: 3, y: 14, scene: 'mp.under_bench' },
      { p: 'stairs', x: 28, y: 18, scene: 'mp.under_down2' },
      { p: 'lantern', x: 2, y: 10, o: { lit: true } }, { p: 'lantern', x: 29, y: 10, o: { lit: true } },
      { p: 'crate', x: 26, y: 3 }, { p: 'barrel', x: 27, y: 3 }, { p: 'mp_weights', x: 5, y: 12 },
    ],
    foes: [
      // the crowded fights (C-74's いくつか follows them)
      { id: 'n2a', enemy: 'mp.golem', x: 5, y: 7, patrol: 1, bg: 'understage', group: { normal: ['mp.imp'], hard: ['mp.imp', 'mp.moth'] },
        intro: intro('{古|ふる}い {版木|はんぎ} を {積|つ}み{上|あ}げた {人形|にんぎょう} が 、 {動|うご}き{出|だ}した 。 {後|うし}ろ に 、 {活字|かつじ} の {小鬼|こおに} 。', 'A figure of stacked old woodblocks lurches into motion, a type imp behind it.') },
      { id: 'n2b', enemy: 'mp.moth', x: 26, y: 8, patrol: 2, bg: 'understage', group: { normal: ['mp.moth'], hard: ['mp.moth', 'mp.imp'] } },
      { id: 'n2c', enemy: 'mp.imp', x: 24, y: 14, patrol: 2, bg: 'understage', aggro: true, group: { normal: ['mp.moth'], hard: ['mp.moth', 'mp.moth'] } },
    ],
    exits: [],
    spawn: { default: [3, 3, 'down'], from_above: [3, 3, 'down'], from_below: [28, 17, 'up'] },
  });

  // ---- B3: the Weight Well (26 × 20) -------------------------------------------------------------------------------
  C.maps['mp.under3'] = Object.assign({}, UNDER, {
    name: T('The Weight Well', '{錘|おもり} の {井戸|いど}'),
    ambient: { dark: 0.6, playerLight: 56, weather: 'motes' },
    terrain: K.build(26, 20, '#', (k) => {
      k.rect(1, 2, 24, 16, '_');
      k.rect(8, 6, 10, 8, 'x');          // the well: the counterweights hang down it
      k.rect(12, 6, 2, 8, 'B');          // the platform's track across it (walkable once raised)
      k.rect(1, 14, 24, 1, '#'); k.set(12, 14, '_'); k.set(13, 14, '_');   // the far side, reached only across it
    }),
    props: [
      { p: 'stairs', x: 3, y: 2, scene: 'mp.under_up3' },
      { p: 'sign', x: 6, y: 2, scene: 'mp.book3' },
      { p: 'sb_crank', x: 19, y: 3, scene: 'mp.weights_go' },
      { p: 'mp_weights', x: 8, y: 4 }, { p: 'mp_weights', x: 17, y: 4 },
      ...block([[12, 6], [13, 6]], '!mp_u3_raised'),
      { p: 'pillar', x: 22, y: 15, scene: 'mp.kuroko_2' },
      { p: 'door', x: 13, y: 17, scene: 'mp.bottom_door' },
      { p: 'lantern', x: 2, y: 9, o: { lit: true } }, { p: 'lantern', x: 23, y: 9, o: { lit: true } },
    ],
    foes: [
      { id: 'n3a', enemy: 'mp.golem', x: 20, y: 10, patrol: 1, bg: 'understage' },
      { id: 'n3b', enemy: 'mp.kuroko', x: 22, y: 16, patrol: 0, bg: 'understage', if: 'mp_kuroko2' },
    ],
    exits: [],
    onEnter: [{ scene: 'mp.ikutsuka', if: '!mod_ikutsuka' }],
    spawn: { default: [3, 3, 'down'], from_above: [3, 3, 'down'], from_bottom: [13, 16, 'up'] },
  });

  // ---- the Bottom of the Understage (26 × 18) ----------------------------------------------------------------------
  C.maps['mp.bottom'] = Object.assign({}, UNDER, {
    name: T('The Bottom of the Understage', '{奈落|ならく} の {底|そこ}'),
    music: 'understage',
    ambient: { dark: 0.64, playerLight: 60, weather: 'motes' },
    alt: [{ if: 'mp_under_done', ambient: { dark: 0.4, playerLight: 50, weather: 'motes' } }],
    terrain: K.build(26, 18, '#', (k) => {
      k.rect(1, 2, 24, 14, '_');
      k.rect(8, 4, 10, 7, 'x');          // the deepest shaft, where the names circle
      k.rect(11, 9, 4, 2, '_');          // the lip where the heart stands
    }),
    props: [
      { p: 'door', x: 13, y: 15, scene: 'mp.bottom_back' },
      { p: 'mp_weights', x: 4, y: 4 }, { p: 'mp_weights', x: 21, y: 4 },
      { p: 'lantern', x: 3, y: 12, o: { lit: true } }, { p: 'lantern', x: 22, y: 12, o: { lit: true } },
      { p: 'mp_typecase', x: 2, y: 2 }, { p: 'mp_typecase', x: 23, y: 2 },
    ],
    npcs: [{ id: 'mp_naraku', char: 'mp_naraku', x: 13, y: 10, dir: 'down', if: '!mp_under_done', talk: 'mp.boss_go' }],
    exits: [],
    onEnter: [{ scene: 'mp.bottom_arrive', if: '!mp_bottom_seen' }],
    spawn: { default: [13, 14, 'up'], from_well: [13, 14, 'up'] },
  });
})(RB.content, RB.mapkit);
