/* The Cloudroad, Chapter 10: the maps (expansion P12; docs/future/work/P12_CLOUDROAD.md). The old highway climbs
 * north-east from the Lantern Road's top corner: seven post stations, each a single street of inns with its relay
 * office, its notice board and its everlasting lamp (常夜灯); between them the legs of the road. The High Pass is in
 * 11_pass.js. Twelve-chapter journeys only (`edition: 2`).
 *
 * A leg has two roads that part at a gorge and meet again beyond it: the main road (本道), stone-paved and short, through
 * the gorge's floor; the old road (旧道), a path round above it, longer. Which is open depends on the leg and the
 * weather's phase (var.cr_phase, set by the story, never a clock); a closed road is shown closed where it is closed,
 * and the way round is always there. Leaving a station for a leg the first time asks for the plan (cr.depart<n>,
 * the reports weighed: 20_scenes_road.js), which puts you on the road you chose; afterwards the station's east end
 * leads straight on.
 *
 * Light-state continuity: each station's everlasting lamp is two instances, dark and lit, by cr_lamp<n>. The weather
 * by phase is each map's `alt` (rain, fog, snow), and clears once the chapter is done. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  // noCompanion: the companion is away while cr_apart holds (the surety at the Mist Barrier; Nao's night apart)
  const ROAD = { region: 'cloudroad', place: 'cloudroad', travel: 'cloudroad', music: 'cloudroad', edition: 2, noCompanion: '!cr_apart' };
  // the weather by phase: 2 cloud, 3 rain, 4 fog, 5 clearing, 6 snow (above the cloud); none once the chapter is done
  const W = {
    2: { weather: 'motes', tint: 'rgba(150,158,166,0.10)' },
    3: { weather: 'rain', tint: 'rgba(90,108,128,0.14)', dark: 0.1 },
    4: { weather: 'motes', tint: 'rgba(232,236,240,0.42)' },
    5: { weather: 'motes', tint: 'rgba(230,236,240,0.12)' },
    6: { weather: 'snow', tint: 'rgba(220,228,238,0.12)' },
  };
  const alts = (...ph) => ph.map((n) => ({ if: 'var.cr_phase=' + n + '&!cr_done', ambient: W[n] }));
  // the everlasting lamp: dark until the station's name is back on it (cr_lamp<n>), lit after
  const lamp = (x, y, n) => [
    { p: 'cr_joyato', x, y, if: '!cr_lamp' + n, scene: 'cr.lamp' + n },
    { p: 'cr_joyato', x, y, if: 'cr_lamp' + n, light: 40, o: { lit: true }, scene: 'cr.lamp_lit' },
  ];
  C.cloudroad = C.cloudroad || {};
  C.cloudroad.STATIONS = ['cr.oiwake', 'cr.suginoki', 'cr.sakashita', 'cr.nakayama', 'cr.umagaeshi', 'cr.kirishita', 'cr.kumoi'];

  // ---- a station: one street west to east, the houses on its north side, the board and the lamp on the south ---------
  function station(id, n, name, o) {
    C.maps[id] = Object.assign({}, ROAD, o.region ? { region: o.region } : {}, {
      name, ambient: o.ambient || { weather: 'motes', tint: 'rgba(200,205,190,0.05)' }, alt: o.alt || alts(2, 3, 4, 5),
      terrain: K.build(36, 24, '.', (k) => {
        k.ragged('top', '^', 2, 900 + n * 10).ragged('bottom', 'Q', 2, 901 + n * 10);
        k.scatter('Q', 12, 902 + n * 10, [0, 2, 36, 3], '.');
        k.rect(0, 12, 36, 2, '=');
        k.scatter(';', 10, 903 + n * 10, [0, 15, 36, 6], '.');
        k.scatter(',', 5, 904 + n * 10, [0, 15, 36, 6], '.');
        if (o.terrain) o.terrain(k);
      }),
      structs: o.structs || [],
      props: [].concat(lamp(o.lamp[0], o.lamp[1], n), [
        { p: 'noticeboard', x: o.board[0], y: o.board[1], scene: 'cr.board' + n },
        { p: 'cr_kago', x: o.kago[0], y: o.kago[1], scene: 'cr.ride', if: 'cr_lamp' + n },
      ], o.props || []),
      npcs: o.npcs || [],
      exits: [].concat(o.west ? [o.west] : [], o.east ? [o.east] : [], o.exits || []),
      triggers: [].concat(o.plan ? [{ x: 34, y: 12, w: 1, h: 2, scene: 'cr.depart' + n, if: '!cr_plan' + n }] : [], o.triggers || []),
      onEnter: [{ scene: 'cr.arrive' + n, if: '!cr_st' + n }].concat(o.onEnter || []),
      spawn: Object.assign({ default: [2, 12, 'right'], from_west: [1, 12, 'right'], from_east: [34, 12, 'left'] }, o.spawn || {}),
    });
  }
  // ---- a leg: the main road through the gorge (y 11–12), the old road round above it (y 3–4 and down the far side) ---
  function leg(id, n, name, o) {
    C.maps[id] = Object.assign({}, ROAD, {
      name, ambient: o.ambient || { weather: 'motes' }, alt: o.alt || alts(2, 3, 4, 5),
      terrain: K.build(36, 22, '.', (k) => {
        k.ragged('top', '^', 2, 960 + n * 10).ragged('bottom', 'Q', 2, 961 + n * 10);
        k.scatter('Q', 18, 962 + n * 10, [0, 13, 36, 7], '.');
        k.scatter('Q', 8, 963 + n * 10, [0, 5, 12, 5], '.');
        // the gorge: one way through on its floor, one round above it
        k.rect(13, 5, 10, 6, '^'); k.rect(13, 13, 10, 7, '^');
        k.path([[0, 11], [35, 11]], '+', 2);
        k.path([[0, 3], [26, 3], [26, 6], [31, 6], [31, 9], [28, 9], [28, 11]], ':', 2);
        if (o.terrain) o.terrain(k);
      }),
      props: [].concat(
        o.mainShut ? [Object.assign({ x: 17, y: 11, h: 2 }, o.mainShut)] : [],
        o.oldShut ? [Object.assign({ x: 17, y: 3, h: 2 }, o.oldShut)] : [],
        o.props || []),
      npcs: o.npcs || [],
      foes: o.foes || [],
      exits: [
        { x: 0, y: 11, w: 1, h: 2, to: o.from, tx: 34, ty: 12, dir: 'left' },
        { x: 0, y: 3, w: 1, h: 2, to: o.from, tx: 34, ty: 12, dir: 'left' },
        { x: 35, y: 11, w: 1, h: 2, to: o.to, sp: 'from_west', dir: 'right' },
      ],
      triggers: o.triggers || [],
      onEnter: o.onEnter || [],
      spawn: { default: [1, 11, 'right'], main: [1, 11, 'right'], old: [1, 3, 'right'], from_east: [34, 11, 'left'] },
    });
  }

  // ==== 1 · Oiwake (追分宿), where the highway leaves the Lantern Road ==================================================
  station('cr.oiwake', 1, T('Oiwake Station', '{追分宿|おいわけじゅく}'), {
    lamp: [29, 10], board: [26, 15], kago: [12, 11],
    structs: [
      { type: 'house', x: 3, y: 6, w: 8, h: 5, roof: 'tile', wall: 'wood', door: 4, windows: [1, 6], to: 'cr.oiwake_post', spawn: [5, 6], lit: true, sign: true, signX: 1 },
      { type: 'house', x: 14, y: 6, w: 8, h: 5, roof: 'thatch', wall: 'wood', door: 3, windows: [1, 6], lit: true, sign: true, signX: 5 },
      { type: 'house', x: 24, y: 7, w: 5, h: 4, roof: 'thatch', wall: 'wood', door: null, windows: [1, 3] },
    ],
    props: [
      { p: 'sign', x: 2, y: 14, scene: 'cr.oiwake_sign' },
      { p: 'well', x: 9, y: 16 }, { p: 'bench', x: 18, y: 15 }, { p: 'stone_marker', x: 32, y: 15, scene: 'cr.oiwake_stone' },
    ],
    npcs: [
      { id: 'cr_tome', x: 17, y: 11, dir: 'down', talk: [{ if: 'cr_done', scene: 'cr.tome_after' }, { scene: 'cr.tome' }] },
      { id: 'cr_jinpachi', x: 7, y: 14, dir: 'up', if: 'cr_called&!cr_done', talk: 'cr.jinpachi' },
    ],
    west: { x: 0, y: 12, w: 1, h: 2, to: 'lf.road', tx: 34, ty: 4, dir: 'left' },
    east: { x: 35, y: 12, w: 1, h: 2, to: 'cr.leg1', sp: 'main', dir: 'right' },
    plan: true,
    spawn: { from_lanternfall: [1, 12, 'right'] },
  });

  // ==== leg 1 · the cedar avenue (杉並木) ==============================================================================
  leg('cr.leg1', 1, T('The Cedar Avenue', '{杉並木|すぎなみき}'), {
    from: 'cr.oiwake', to: 'cr.suginoki',
    terrain: (k) => { for (let x = 1; x < 13; x += 3) { k.set(x, 10, 'Q'); k.set(x, 13, 'Q'); } for (let x = 24; x < 35; x += 3) { k.set(x, 10, 'Q'); k.set(x, 13, 'Q'); } },
    props: [
      { p: 'stone_marker', x: 6, y: 14, scene: 'cr.leg1_stone' }, { p: 'kr_toro', x: 25, y: 9 },
      { p: 'shrine', x: 20, y: 2, scene: 'cr.leg1_shrine' },
    ],
    foes: [
      { id: 'e1', enemy: 'cr.waystone', x: 28, y: 12, patrol: 2 },
      // the pilgrim on the shrine path (a wanderer, E3)
      { id: 'w_oshika', enemy: 'cr.waystone', encounter: 'cr.wander_oshika', x: 18, y: 4, patrol: 1, if: 'cr_called&!cr_oshika_met' },
    ],
  });

  // ==== 2 · Suginoki (杉ノ木宿), under the great cedar =================================================================
  station('cr.suginoki', 2, T('Suginoki Station', '{杉|すぎ}ノ{木宿|きじゅく}'), {
    lamp: [30, 10], board: [24, 15], kago: [9, 11],
    structs: [
      { type: 'house', x: 3, y: 6, w: 7, h: 5, roof: 'tile', wall: 'wood', door: 3, windows: [1, 5], lit: true, sign: true, signX: 1 },
      { type: 'house', x: 20, y: 6, w: 8, h: 5, roof: 'thatch', wall: 'wood', door: 4, windows: [1, 6], lit: true, sign: true, signX: 1 },
    ],
    props: [
      { p: 'cr_bigcedar', x: 13, y: 6, scene: 'cr.cedar' },
      { p: 'bench', x: 11, y: 15 }, { p: 'bench', x: 14, y: 15 }, { p: 'teaset', x: 12, y: 16 },
      { p: 'crate', x: 30, y: 15 }, { p: 'crate', x: 31, y: 15 },
    ],
    npcs: [
      { id: 'cr_ine', x: 13, y: 14, dir: 'down', talk: [{ if: 'cr_done', scene: 'cr.ine_after' }, { scene: 'cr.ine' }] },
      { id: 'cr_sada', x: 29, y: 16, dir: 'left', if: '!cr_done', talk: 'cr.sada' },
      { id: 'cr_kosuke', x: 6, y: 15, dir: 'right', if: '!cr_st3', talk: 'cr.kosuke' },
    ],
    west: { x: 0, y: 12, w: 1, h: 2, to: 'cr.leg1', sp: 'from_east', dir: 'left' },
    east: { x: 35, y: 12, w: 1, h: 2, to: 'cr.leg2', sp: 'main', dir: 'right' },
    plan: true,
  });

  // ==== leg 2 · the stone switchbacks (石畳) ===========================================================================
  // the rumour of a landslide on the stone road: an old slide's rocks lie beside it, long cleared
  leg('cr.leg2', 2, T('The Stone Steps', '{石畳|いしだたみ}'), {
    from: 'cr.suginoki', to: 'cr.sakashita',
    terrain: (k) => { k.scatter('r', 8, 991, [13, 5, 10, 6], '^'); k.set(15, 10, 'r'); k.set(19, 13, 'r'); },
    props: [
      { p: 'rock', x: 12, y: 10 }, { p: 'rock', x: 23, y: 13 },
      { p: 'stone_marker', x: 9, y: 13, scene: 'cr.leg2_stone' },
    ],
    foes: [{ id: 'e1', enemy: 'cr.echo', x: 27, y: 11, patrol: 2 }, { id: 'e2', enemy: 'cr.packlantern', x: 8, y: 3, patrol: 2 }],
  });

  // ==== 3 · Sakashita (坂下宿), at the foot of the long slope ===========================================================
  station('cr.sakashita', 3, T('Sakashita Station', '{坂下宿|さかしたじゅく}'), {
    lamp: [31, 10], board: [21, 15], kago: [12, 11],
    terrain: (k) => { k.rect(0, 19, 36, 2, '~'); k.rect(0, 18, 36, 1, 'w'); k.rect(4, 18, 2, 3, 'B'); },
    structs: [
      { type: 'house', x: 3, y: 6, w: 9, h: 5, roof: 'thatch', wall: 'wood', door: 4, windows: [1, 7], to: 'cr.saka_inn', spawn: [5, 6], lit: true, sign: true, signX: 1 },
      { type: 'house', x: 15, y: 7, w: 6, h: 4, roof: 'tile', wall: 'wood', door: 3, windows: [1, 4], lit: true },
      { type: 'house', x: 24, y: 7, w: 5, h: 4, roof: 'thatch', wall: 'wood', door: null, windows: [1, 3] },
    ],
    props: [{ p: 'bench', x: 15, y: 15 }, { p: 'well', x: 27, y: 15 }],
    npcs: [
      // (from the letter's delivery until the coins are decided he is at Sono's inn: src/content/cr/25_side.js)
      { id: 'cr_heisuke', x: 18, y: 11, dir: 'down', if: '!cr_delivered|quest.cr_family=done', talk: [{ if: 'cr_done', scene: 'cr.heisuke_after' }, { scene: 'cr.heisuke' }] },
      { id: 'cr_yahei', x: 25, y: 16, dir: 'left', if: 'var.cr_phase=3&!cr_st4', talk: 'cr.yahei' },
    ],
    west: { x: 0, y: 12, w: 1, h: 2, to: 'cr.leg2', sp: 'from_east', dir: 'left' },
    east: { x: 35, y: 12, w: 1, h: 2, to: 'cr.leg3', sp: 'main', dir: 'right' },
    plan: true,
  });

  // ==== leg 3 · the stream (沢) =======================================================================================
  // a mountain stream crosses both roads; in the rain the main road's bridge is washed out (until mended after the
  // chapter); the old road fords higher up, on stepping stones
  leg('cr.leg3', 3, T('The Stream', '{沢|さわ}'), {
    from: 'cr.sakashita', to: 'cr.nakayama',
    terrain: (k) => { k.rect(17, 0, 2, 22, '~'); k.rect(16, 11, 4, 2, 'b'); k.rect(16, 3, 4, 2, 'w'); },
    mainShut: { p: 'cr_bridge_out', if: 'cr_bridge_washed&!cr_bridge_mended', w: 2 },
    props: [{ p: 'stone_marker', x: 10, y: 13, scene: 'cr.leg3_stone' }],
    foes: [{ id: 'e1', enemy: 'cr.packlantern', x: 26, y: 12, patrol: 2 }, { id: 'e2', enemy: 'cr.waystone', x: 9, y: 3, patrol: 1 }],
    npcs: [{ id: 'cr_matazo', x: 24, y: 3, dir: 'left', if: 'cr_st3&!cr_matazo_done', talk: 'cr.matazo' }],
  });

  // ==== 4 · Nakayama (中山宿), the middle of the mountain: two inns face each other ====================================
  station('cr.nakayama', 4, T('Nakayama Station', '{中山宿|なかやまじゅく}'), {
    lamp: [32, 15], board: [27, 15], kago: [2, 15],
    structs: [
      { type: 'house', x: 3, y: 6, w: 9, h: 5, roof: 'tile', wall: 'wood', door: 4, windows: [1, 7], lit: true, sign: true, signX: 1 },
      { type: 'house', x: 14, y: 6, w: 9, h: 5, roof: 'tile', wall: 'wood', door: 4, windows: [1, 7], lit: true, sign: true, signX: 6 },
      { type: 'house', x: 26, y: 7, w: 5, h: 4, roof: 'thatch', wall: 'wood', door: null, windows: [1, 3] },
    ],
    props: [
      { p: 'fence', x: 12, y: 10 }, { p: 'fence', x: 13, y: 10 },
      { p: 'bench', x: 18, y: 16 }, { p: 'table', x: 19, y: 16, scene: 'cr.rin_map' },
    ],
    npcs: [
      { id: 'cr_otaki', x: 8, y: 11, dir: 'down', talk: [{ if: 'cr_done', scene: 'cr.otaki_after' }, { scene: 'cr.otaki' }] },
      { id: 'cr_seibe', x: 18, y: 11, dir: 'down', talk: [{ if: 'cr_done', scene: 'cr.seibe_after' }, { scene: 'cr.seibe' }] },
      { id: 'cr_tatsu', x: 13, y: 15, dir: 'up', if: '!quest.cr_guest=done', talk: 'cr.tatsu' },
      { id: 'cr_rin', x: 21, y: 16, dir: 'left', talk: [{ if: 'cr_done', scene: 'cr.rin_after' }, { scene: 'cr.rin' }] },
    ],
    west: { x: 0, y: 12, w: 1, h: 2, to: 'cr.leg3', sp: 'from_east', dir: 'left' },
    east: { x: 35, y: 12, w: 1, h: 2, to: 'cr.leg4', sp: 'main', dir: 'right' },
    plan: true,
  });

  // ==== leg 4 · the ledge (崖道) ======================================================================================
  // the old road runs along a ledge, where a rockfall has closed it (and, early on, a pack horse stands stuck); the
  // main road through the gorge is open. The mapmaker's new map shows the ledge as the short way.
  leg('cr.leg4', 4, T('The Ledge', '{崖道|がけみち}'), {
    from: 'cr.nakayama', to: 'cr.umagaeshi',
    terrain: (k) => { k.rect(13, 2, 10, 1, '^'); k.scatter('r', 6, 994, [24, 4, 10, 4], '.'); },
    oldShut: { p: 'cr_slide', if: '!cr_ledge_cleared', w: 2 },
    props: [{ p: 'stone_marker', x: 8, y: 13, scene: 'cr.leg4_stone' }, { p: 'cr_horse', x: 11, y: 3, if: '!cr_horse_safe', scene: 'cr.horse' }],
    foes: [{ id: 'e1', enemy: 'cr.echo', x: 26, y: 12, patrol: 2 }],
  });

  // ==== 5 · Umagaeshi (馬返し宿), where the horses turn back ==========================================================
  station('cr.umagaeshi', 5, T('Umagaeshi Station', '{馬返|うまがえ}し{宿|じゅく}'), {
    lamp: [30, 10], board: [22, 15], kago: [10, 11],
    structs: [
      { type: 'house', x: 3, y: 6, w: 8, h: 5, roof: 'thatch', wall: 'wood', door: 4, windows: [1, 6], lit: true, sign: true, signX: 1 },
      { type: 'house', x: 14, y: 7, w: 6, h: 4, roof: 'tile', wall: 'wood', door: 3, windows: [1, 4], lit: true, sign: true, signX: 1 },
      { type: 'house', x: 23, y: 6, w: 5, h: 5, roof: 'thatch', wall: 'wood', door: null, windows: [1, 3] },
    ],
    props: [
      { p: 'hay', x: 27, y: 15 }, { p: 'hay', x: 28, y: 15 }, { p: 'cr_horse', x: 30, y: 16, if: 'cr_horse_safe' },
      { p: 'stone_marker', x: 33, y: 15, scene: 'cr.uma_stone' }, { p: 'bench', x: 12, y: 15 },
    ],
    npcs: [
      { id: 'cr_genji', x: 28, y: 17, dir: 'left', talk: [{ if: 'cr_done', scene: 'cr.genji_after' }, { scene: 'cr.genji' }] },
      { id: 'cr_chika', x: 17, y: 11, dir: 'down', talk: [{ if: 'cr_done', scene: 'cr.chika_after' }, { scene: 'cr.chika' }] },
    ],
    west: { x: 0, y: 12, w: 1, h: 2, to: 'cr.leg4', sp: 'from_east', dir: 'left' },
    east: { x: 35, y: 12, w: 1, h: 2, to: 'cr.leg5', sp: 'main', dir: 'right' },
    plan: true,
  });

  // ==== leg 5 · the fog road (霧の坂) ==================================================================================
  // in the fog (phase 4) a fog bank hangs over the old road's edge, and a Cloud Ox stands on the main road; once the
  // fog lifts (phase 5, a night waited out at Umagaeshi) the ox has wandered off and both roads are clear
  leg('cr.leg5', 5, T('The Fog Slope', '{霧|きり} の {坂|さか}'), {
    from: 'cr.umagaeshi', to: 'cr.kirishita', ambient: { weather: 'motes', tint: 'rgba(225,230,235,0.2)' },
    oldShut: { p: 'cr_fogbank', if: 'var.cr_phase=4' },
    props: [{ p: 'stone_marker', x: 7, y: 13, scene: 'cr.leg5_stone' }, { p: 'kr_toro', x: 24, y: 9 }],
    triggers: [{ x: 15, y: 11, w: 1, h: 2, scene: 'cr.ox', if: 'var.cr_phase=4&!cr_ox_done' }],
    foes: [
      // the Fog Porter goes for your travel papers (E6) until you have kept them from it once
      { id: 'fp', enemy: 'cr.fogporter', encounter: 'cr.fog_papers', x: 27, y: 12, patrol: 2, if: 'item.cr_papers&!cr_papers_kept' },
      { id: 'e1', enemy: 'cr.echo', x: 8, y: 3, patrol: 2 },
    ],
  });

  // ==== 6 · Kirishita (霧下宿), the last lit station below the Barrier ==================================================
  station('cr.kirishita', 6, T('Kirishita Station', '{霧下宿|きりしたじゅく}'), {
    lamp: [30, 10], board: [22, 15], kago: [11, 11], alt: alts(4, 5, 6),
    terrain: (k) => { k.rect(0, 19, 36, 2, '~'); k.rect(0, 18, 36, 1, 'w'); },
    structs: [
      { type: 'house', x: 4, y: 6, w: 9, h: 5, roof: 'thatch', wall: 'wood', door: 4, windows: [1, 7], to: 'cr.kirishita_inn', spawn: [5, 6], lit: true, sign: true, signX: 1 },
      { type: 'house', x: 17, y: 7, w: 6, h: 4, roof: 'thatch', wall: 'wood', door: null, windows: [1, 4] },
    ],
    props: [{ p: 'bench', x: 9, y: 11, scene: 'cr.porch' }, { p: 'mailbox', x: 14, y: 11, scene: 'cr.sakichi_box' }],
    npcs: [
      { id: 'cr_sakichi', x: 7, y: 11, dir: 'down', if: '!cr_apart', talk: [{ if: 'cr_done', scene: 'cr.sakichi_after' }, { if: 'cr_sakichi_met', scene: 'cr.sakichi_idle' }, { scene: 'cr.sakichi_first' }] },
      { id: 'cr_sue', x: 18, y: 14, dir: 'up', talk: [{ if: 'cr_done', scene: 'cr.sue_after' }, { scene: 'cr.sue' }] },
    ],
    west: { x: 0, y: 12, w: 1, h: 2, to: 'cr.leg5', sp: 'from_east', dir: 'left' },
    east: { x: 35, y: 12, w: 1, h: 2, to: 'cr.barrier', sp: 'from_west', dir: 'right' },
  });

  // ==== the Mist Barrier (霧の関) =====================================================================================
  // the road meets a fence of grey palings across the whole saddle and a roofed gate; the office on the near side. The
  // gate opens for the one fetching proof (cr_fetching) and, once the papers are made good, for both (cr_passed).
  C.maps['cr.barrier'] = Object.assign({}, ROAD, {
    name: T('The Mist Barrier', '{霧|きり} の {関|せき}'),
    ambient: { weather: 'motes', tint: 'rgba(225,230,236,0.24)' }, alt: alts(6),
    terrain: K.build(36, 24, '.', (k) => {
      k.ragged('top', '^', 3, 1001).ragged('bottom', '^', 3, 1002);
      k.rect(0, 12, 36, 2, '=');
      // the barrier's fence of grey palings across the saddle; the road through the gate
      k.rect(20, 0, 1, 24, 'f'); k.rect(20, 12, 1, 2, '=');
      k.scatter(';', 8, 1003, [0, 15, 18, 5], '.');
    }),
    structs: [
      { type: 'house', x: 3, y: 5, w: 10, h: 6, roof: 'tile', wall: 'wood', door: 5, windows: [1, 8], to: 'cr.barrier_office', spawn: [6, 7], lit: true, sign: true, signX: 1 },
    ],
    props: [
      { p: 'cr_gate', x: 20, y: 12, h: 2, if: '!cr_fetching&!cr_passed' },
      { p: 'cr_gate', x: 20, y: 12, h: 2, block: false, o: { open: true }, if: 'cr_fetching|cr_passed' },
      { p: 'noticeboard', x: 15, y: 15, scene: 'cr.barrier_board' },
      { p: 'bench', x: 8, y: 15, scene: 'cr.barrier_bench' },
    ],
    npcs: [
      { id: 'cr_gonza', x: 19, y: 11, dir: 'left', talk: [{ if: 'cr_done', scene: 'cr.gonza_after' }, { scene: 'cr.gonza' }] },
    ],
    exits: [
      { x: 0, y: 12, w: 1, h: 2, to: 'cr.kirishita', sp: 'from_east', dir: 'left' },
      { x: 35, y: 12, w: 1, h: 2, to: 'cr.above', sp: 'from_west', dir: 'right' },
    ],
    triggers: [{ x: 18, y: 12, w: 1, h: 2, scene: 'cr.barrier_stop', if: '!cr_fetching&!cr_passed' }],
    onEnter: [{ scene: 'cr.barrier_first', if: '!cr_barrier_seen' }],
    spawn: { default: [2, 12, 'right'], from_west: [1, 12, 'right'], from_east: [34, 12, 'left'] },
  });

  // ==== above the cloud (雲の上): the road from the Barrier up to Kumoi =================================================
  C.maps['cr.above'] = Object.assign({}, ROAD, {
    name: T('Above the Cloud', '{雲|くも} の {上|うえ}'),
    ambient: { weather: 'motes', tint: 'rgba(235,240,245,0.08)' }, alt: alts(6),
    region: 'cloudtop',
    terrain: K.build(36, 22, '*', (k) => {
      k.ragged('top', '^', 3, 1011);
      k.rect(0, 17, 36, 5, '~');
      k.ragged('bottom', '~', 2, 1012);
      k.path([[0, 12], [10, 12], [14, 8], [24, 8], [28, 12], [35, 12]], '+', 2);
      k.scatter('P', 10, 1013, [0, 3, 36, 5], '*');
      k.scatter('R', 6, 1014, [0, 13, 36, 3], '*');
    }),
    props: [{ p: 'stone_marker', x: 18, y: 6, scene: 'cr.above_stone' }, { p: 'kr_toro', x: 9, y: 10 }],
    npcs: [],
    foes: [
      { id: 'e1', enemy: 'cr.moth', x: 30, y: 12, patrol: 2, bg: 'cloudtop' },
      // the smuggler, on the road he took round the checkpoint (a wanderer, E3)
      { id: 'w_ginji', enemy: 'cr.moth', encounter: 'cr.wander_ginji', x: 20, y: 8, patrol: 1, bg: 'cloudtop', if: '!cr_ginji_met' },
    ],
    exits: [
      { x: 0, y: 12, w: 1, h: 2, to: 'cr.barrier', sp: 'from_east', dir: 'left' },
      { x: 35, y: 12, w: 1, h: 2, to: 'cr.kumoi', sp: 'from_west', dir: 'right' },
    ],
    onEnter: [{ scene: 'cr.above_first', if: '!cr_above_seen' }],
    spawn: { default: [1, 12, 'right'], from_west: [1, 12, 'right'], from_east: [34, 12, 'left'] },
  });

  // ==== 7 · Kumoi (雲居宿), the station above the cloud =================================================================
  station('cr.kumoi', 7, T('Kumoi Station', '{雲居宿|くもいじゅく}'), {
    lamp: [30, 10], board: [22, 15], kago: [11, 11], alt: alts(6),
    ambient: { weather: 'motes', tint: 'rgba(235,240,245,0.06)' },
    region: 'cloudtop',
    terrain: (k) => { k.swap('.', '*', [0, 0, 36, 24]); k.swap(';', '*', [0, 0, 36, 24]); k.swap(',', '*', [0, 0, 36, 24]); k.swap('Q', 'P', [0, 0, 36, 24]); k.rect(0, 20, 36, 4, '~'); },
    structs: [
      { type: 'house', x: 3, y: 6, w: 9, h: 5, roof: 'tile', wall: 'wood', door: 4, windows: [1, 7], lit: true, sign: true, signX: 1 },
      { type: 'house', x: 15, y: 7, w: 6, h: 4, roof: 'thatch', wall: 'wood', door: 3, windows: [1, 4], lit: true },
    ],
    props: [{ p: 'stone_marker', x: 33, y: 15, scene: 'cr.kumoi_stone' }, { p: 'bench', x: 14, y: 15 }],
    npcs: [
      { id: 'cr_shizu', x: 7, y: 11, dir: 'down', talk: [{ if: 'cr_done', scene: 'cr.shizu_after' }, { scene: 'cr.shizu' }] },
      { id: 'cr_koma', x: 18, y: 15, dir: 'left', talk: [{ if: 'cr_done', scene: 'cr.koma_after' }, { scene: 'cr.koma' }] },
    ],
    west: { x: 0, y: 12, w: 1, h: 2, to: 'cr.above', sp: 'from_east', dir: 'left' },
    east: { x: 35, y: 12, w: 1, h: 2, to: 'cr.pass1', sp: 'from_west', dir: 'right', if: 'cr_passed' },
    triggers: [{ x: 34, y: 12, w: 1, h: 2, scene: 'cr.kumoi_east', if: '!cr_passed' }],
  });

  // ---- interiors ---------------------------------------------------------------------------------------------------
  function interior(id, name, w, h, doorX, outside, back, extra) {
    C.maps[id] = Object.assign({
      name, region: 'interior', place: 'cloudroad', music: null, noTravel: true, travelKind: 'interior', edition: 2, noCompanion: '!cr_apart',
      terrain: K.room(w, h, '_', doorX),
      props: [], npcs: [],
      exits: [{ x: doorX, y: h - 1, to: outside, tx: back[0], ty: back[1], dir: 'down' }],
      spawn: { default: [doorX, h - 2, 'up'] },
    }, extra);
  }
  // the relay office at Oiwake (問屋場): Kanbe's ledger and the old relay's emblem over the door
  interior('cr.oiwake_post', T('The Relay Office', '{問屋場|といやば}'), 11, 8, 5, 'cr.oiwake', [7, 11], {
    props: [
      { p: 'exitmat', x: 5, y: 6 }, { p: 'counter', x: 3, y: 2, across: true }, { p: 'sb_mailshelf', x: 8, y: 2, scene: 'cr.post_shelf' },
      { p: 'desk', x: 1, y: 4, scene: 'cr.post_ledger' }, { p: 'lantern', x: 10, y: 3, o: { lit: true } },
    ],
    npcs: [{ id: 'cr_kanbe', x: 4, y: 3, dir: 'down', talk: [{ if: 'cr_done', scene: 'cr.kanbe_after' }, { if: 'cr_kanbe_met', scene: 'cr.kanbe_idle' }, { scene: 'cr.kanbe_first' }] }],
  });
  // Sono's inn at Sakashita, built by her grandfather, the last courier
  interior('cr.saka_inn', T('The Courier\'s Inn', '{飛脚宿|ひきゃくやど}'), 11, 8, 5, 'cr.sakashita', [7, 11], {
    props: [
      { p: 'exitmat', x: 5, y: 6 }, { p: 'counter', x: 3, y: 2, across: true }, { p: 'table', x: 8, y: 3, scene: 'cr.guestbook' },
      { p: 'shelf', x: 1, y: 2, scene: 'cr.saka_shelf' }, { p: 'lantern', x: 10, y: 3, o: { lit: true } }, { p: 'bench', x: 8, y: 5 },
    ],
    npcs: [{ id: 'cr_sono', x: 4, y: 3, dir: 'down', talk: [{ if: 'cr_done', scene: 'cr.sono_after' }, { scene: 'cr.sono' }] }],
  });
  // Sakichi's station house at Kirishita: the post shelf, the hearth, the porch outside
  interior('cr.kirishita_inn', T('Kirishita\'s Station House', '{霧下|きりした} の {宿|やど}'), 11, 8, 5, 'cr.kirishita', [8, 11], {
    props: [
      { p: 'exitmat', x: 5, y: 6 }, { p: 'sb_irori', x: 5, y: 3 }, { p: 'sb_mailshelf', x: 8, y: 2, scene: 'cr.sakichi_shelf' },
      { p: 'lantern', x: 10, y: 3, o: { lit: true } }, { p: 'sb_futon', x: 1, y: 4 },
    ],
    npcs: [],
  });
  // the Barrier's office: Ujie's desk, Sumi's table of papers and seals
  interior('cr.barrier_office', T('The Barrier Office', '{関所|せきしょ} の {番所|ばんしょ}'), 13, 9, 6, 'cr.barrier', [8, 11], {
    props: [
      { p: 'exitmat', x: 6, y: 7 }, { p: 'desk', x: 5, y: 2, scene: 'cr.ujie_desk' }, { p: 'table', x: 9, y: 4, scene: 'cr.sumi_table' },
      { p: 'shelf', x: 1, y: 2 }, { p: 'shelf', x: 11, y: 2 }, { p: 'lantern', x: 3, y: 2, o: { lit: true } }, { p: 'bench', x: 2, y: 5 },
    ],
    npcs: [
      { id: 'cr_ujie', x: 6, y: 3, dir: 'down', talk: [{ if: 'cr_done', scene: 'cr.ujie_after' }, { scene: 'cr.ujie' }] },
      { id: 'cr_sumi', x: 9, y: 5, dir: 'left', talk: [{ if: 'cr_done', scene: 'cr.sumi_after' }, { scene: 'cr.sumi' }] },
    ],
  });
})(RB.content, RB.mapkit);
