/* Chapter 2 maps: the coast road, Saltglass harbour and its interiors, the
 * fishers' cove, and the Drowned Archive (five tidal ruin areas). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const txt = (jp, en) => ({ jp, en });

  // ---- The coast road ------------------------------------------------------------------
  C.maps['sg.road'] = {
    name: { en: 'The Coast Road', jp: '{海沿|うみぞ}いの{道|みち}' }, region: 'saltglass', music: 'road',
    ambient: { weather: null },
    terrain: K.build(40, 22, '.', (k) => {
      k.ragged('top', 'T', 3, 41);
      k.scatter('T', 9, 42, [20, 3, 20, 4], '.');
      k.scatter('T', 7, 47, [0, 3, 12, 5], '.');
      k.hline(0, 39, 15, '^');
      k.rect(0, 16, 40, 2, 's');
      k.rect(0, 18, 40, 4, '~');
      k.rect(15, 18, 8, 4, 's');
      k.path([[39, 10], [14, 10]], ':', 2);
      k.path([[18, 12], [18, 21]], ':', 2);
      k.path([[15, 0], [15, 9]], ':', 2);
      k.scatter(',', 22, 43, [0, 4, 40, 11], '.');
      k.scatter(';', 14, 44, [0, 4, 40, 11], '.');
      k.scatter('r', 5, 45, [0, 12, 40, 3], '.');
      k.scatter('h', 5, 46, [0, 16, 40, 2], 's');
    }),
    props: [
      { p: 'lantern', x: 34, y: 9, o: { lit: true } },
      { p: 'lantern', x: 25, y: 9, o: { lit: true } },
      { p: 'deadlantern', x: 17, y: 8, scene: 'sg.road_forklantern', if: '!ch2_done' },
      { p: 'lantern', x: 17, y: 8, scene: 'sg.road_forklantern', if: 'ch2_done' },
      { p: 'sign', x: 20, y: 12, scene: 'sg.road_sign' },
      { p: 'lantern', x: 14, y: 3, o: { lit: true } },
      { p: 'bench', x: 7, y: 13, scene: 'sg.road_bench' },
      { p: 'stone_marker', x: 36, y: 12, scene: 'sg.road_marker' },
    ],
    foes: [{ id: 'r1', enemy: 'sg.crab', x: 8, y: 16, patrol: 2 }],
    exits: [
      { x: 39, y: 10, w: 1, h: 2, to: 'rw.road', sp: 'from_next', dir: 'right' },
      { x: 15, y: 0, w: 2, h: 1, to: 'co.road', sp: 'from_prev', dir: 'up', if: 'ch2_done' },
      { x: 18, y: 21, w: 2, h: 1, to: 'sg.harbor', tx: 27, ty: 2, dir: 'down' },
    ],
    triggers: [{ x: 15, y: 0, w: 2, h: 1, scene: 'sg.road_inland_closed', if: '!ch2_done' }],
    onEnter: [{ scene: 'sg.arrive', if: '!sg_arrived' }, { scene: 'sg.road_open', if: 'ch2_done&!sg_road_open_seen' }],
    spawn: { default: [37, 10, 'left'], from_prev: [37, 10, 'left'], from_next: [15, 2, 'down'], from_harbor: [18, 20, 'up'] },
  };

  // ---- Saltglass harbour (hub) ---------------------------------------------------------------
  const causewayWater = [];
  for (let y = 35; y <= 40; y++) for (let x = 8; x <= 9; x++) {
    causewayWater.push({ p: 'water', x, y, if: '!sg_tide_low', scene: 'sg.causeway_water' });
    if (y >= 36) causewayWater.push({ p: 'sg_fog', x, y, if: 'sg_tide_low&!sg_fog_cleared' });
  }
  C.maps['sg.harbor'] = {
    name: { en: 'Saltglass', jp: '{潮|しお}{硝子|がらす}' }, region: 'saltglass', place: 'saltglass', travel: 'saltglass',
    music: 'saltglass',
    ambient: { weather: null },
    terrain: K.build(56, 42, '.', (k) => {
      k.ragged('top', 'T', 2, 21);
      k.vline(0, 0, 19, 'T').vline(55, 0, 11, 'T');
      // sea, the point and the beach
      k.rect(0, 29, 56, 13, '~');
      k.rect(0, 20, 12, 15, '.');
      k.rect(44, 20, 12, 9, 's');
      k.rect(47, 29, 9, 3, 's');
      k.rect(46, 32, 10, 1, 'w');
      k.rect(8, 35, 2, 7, 's');
      k.set(0, 34, 'r').set(1, 34, 'r').set(5, 34, 'r').set(11, 33, 'r').set(11, 34, 'r').set(0, 20, 'T').set(0, 21, 'T');
      // quay, street, lanes
      k.rect(12, 24, 32, 5, '+');
      k.rect(2, 13, 50, 3, '=');
      k.path([[52, 13], [55, 13]], ':', 2);
      k.path([[27, 0], [27, 12]], ':', 2);
      k.rect(26, 16, 3, 8, '=');
      k.rect(29, 16, 14, 8, '=');
      k.path([[4, 16], [4, 23]], ':', 2);
      k.path([[16, 21], [16, 23]], ':', 1);
      k.path([[6, 7], [6, 12]], ':', 1);
      k.path([[16, 11], [16, 12]], ':', 1);
      k.path([[35, 11], [35, 12]], ':', 1);
      k.path([[46, 8], [46, 12]], ':', 1);
      k.path([[8, 27], [8, 34]], ':', 2);
      k.path([[43, 20], [48, 20]], ':', 1);
      // piers
      k.rect(18, 29, 2, 8, 'B');
      k.rect(34, 29, 2, 7, 'B');
      k.rect(31, 36, 8, 2, 'b');
      // greenery
      k.scatter(',', 26, 22, [1, 2, 54, 10], '.');
      k.scatter(';', 10, 23, [1, 2, 54, 10], '.');
      k.scatter('T', 8, 24, [1, 2, 54, 9], '.');
      k.scatter('o', 6, 25, [1, 16, 11, 7], '.');
      k.scatter(',', 8, 26, [0, 20, 12, 13], '.');
      k.scatter('h', 6, 27, [44, 21, 12, 10], 's');
    }),
    structs: [
      { type: 'house', x: 4, y: 4, w: 5, h: 3, roof: 'tile', wall: 'wood', door: 2, windows: [0, 4], to: 'sg.isamu', spawn: [3, 6] },
      { type: 'house', x: 13, y: 7, w: 7, h: 4, roof: 'tile', wall: 'stone', door: 3, windows: [1, 5], to: 'sg.office', spawn: [5, 7], lit: true },
      { type: 'house', x: 31, y: 6, w: 8, h: 5, roof: 'tile', wall: 'wood', door: 4, windows: [1, 2, 6], chimney: true, to: 'sg.inn', spawn: [6, 8], lit: true },
      { type: 'house', x: 44, y: 5, w: 5, h: 3, roof: 'tile', door: 2, windows: [0, 4], chimney: true, to: 'sg.harbor', locked: 'sg.door_fuku' },
      { type: 'house', x: 12, y: 16, w: 8, h: 5, roof: 'slate', wall: 'wood', door: 4, windows: [1, 6], to: 'sg.warehouse', spawn: [6, 8] },
      { type: 'house', x: 20, y: 16, w: 6, h: 5, roof: 'slate', wall: 'wood', door: 3, windows: [1], to: 'sg.harbor', locked: 'sg.door_wh1' },
      { type: 'house', x: 46, y: 16, w: 6, h: 4, roof: 'glass', wall: 'stone', door: 2, windows: [0, 4], chimney: true, to: 'sg.glass', spawn: [5, 7], lit: true },
      { type: 'house', x: 6, y: 24, w: 4, h: 3, roof: 'thatch', wall: 'wood', door: 1, windows: [3], to: 'sg.tidehut', spawn: [4, 6] },
      { type: 'tower', x: 1, y: 29, w: 3, h: 3, door: 1, to: 'sg.lighthouse', spawn: [4, 8] },
    ],
    props: [
      // town signs and inscriptions
      { p: 'lantern', x: 26, y: 3, o: { lit: true } }, { p: 'lantern', x: 29, y: 3, o: { lit: true } },
      { p: 'noticeboard', x: 23, y: 11, scene: 'sg.notice' },
      { p: 'sign', x: 20, y: 10, scene: 'sg.sign_office' },
      { p: 'sign', x: 39, y: 10, scene: 'sg.sign_inn' },
      { p: 'sign', x: 45, y: 19, scene: 'sg.sign_glass' },
      { p: 'sign', x: 11, y: 20, scene: 'sg.sign_wh' },
      { p: 'signblank', x: 52, y: 12, scene: 'sg.cove_sign', if: '!sg_sign_fixed' },
      { p: 'sign', x: 52, y: 12, scene: 'sg.cove_sign_fixed', if: 'sg_sign_fixed' },
      { p: 'stone_marker', x: 10, y: 34, scene: 'sg.causeway_marker' },
      { p: 'laundry', x: 20, y: 4 }, { p: 'laundry', x: 9, y: 9 },
      { p: 'bench', x: 40, y: 8, scene: 'sg.bench_fuku' },
      { p: 'flowerpot', x: 30, y: 10 }, { p: 'flowerpot', x: 39, y: 9 }, { p: 'flowerpot', x: 12, y: 10 },
      { p: 'well', x: 23, y: 5 },
      { p: 'mailbox', x: 36, y: 12, scene: 'sg.mailbox' },
      // fish market
      { p: 'sg_stall', x: 30, y: 18, across: true, scene: 'sg.stall_kiyo' },
      { p: 'sg_stall', x: 36, y: 18, across: true, o: { empty: true }, scene: 'sg.stall_empty' },
      { p: 'barrel', x: 29, y: 21 }, { p: 'barrel', x: 30, y: 21 }, { p: 'crate', x: 38, y: 21 }, { p: 'crate', x: 39, y: 21 }, { p: 'barrel', x: 41, y: 21 },
      { p: 'table', x: 40, y: 18, scene: 'sg.market_table' },
      // quay
      { p: 'lamppost', x: 14, y: 24 }, { p: 'lamppost', x: 24, y: 24 }, { p: 'lamppost', x: 32, y: 24 }, { p: 'lamppost', x: 42, y: 24 },
      { p: 'crate', x: 13, y: 27 }, { p: 'crate', x: 14, y: 27 }, { p: 'crate', x: 13, y: 26, scene: 'sg.quay_crate' }, { p: 'barrel', x: 41, y: 27 }, { p: 'barrel', x: 42, y: 27 },
      { p: 'net', x: 21, y: 27 }, { p: 'net', x: 27, y: 27 },
      { p: 'bench', x: 38, y: 25 },
      { p: 'noticeboard', x: 36, y: 24, scene: 'sg.ferryboard' },
      { p: 'boat', x: 20, y: 31 }, { p: 'boat', x: 16, y: 33 }, { p: 'boat', x: 22, y: 35 },
      { p: 'sg_ferry', x: 32, y: 38 },
      // west point
      { p: 'sg_tideboard', x: 10, y: 25, scene: 'sg.tidepost' },
      { p: 'rock', x: 3, y: 23 },
      // east beach: sea glass
      { p: 'sparkle', x: 52, y: 26, scene: 'sg.glass_pick1', if: 'quest.sg_seaglass&!sg_glass1' },
      { p: 'sparkle', x: 45, y: 28, scene: 'sg.glass_pick2', if: 'quest.sg_seaglass&!sg_glass2' },
      { p: 'boat', x: 50, y: 30, scene: 'sg.beach_boat' },
    ].concat(causewayWater),
    npcs: [
      { id: 'daigo', x: 25, y: 26, wander: 2, talk: [
        { if: 'post', scene: 'sg.daigo_post' },
        { if: 'quest.sg_cove=0&!sg_dir_daigo', scene: 'sg.dir_daigo' },
        { if: 'sg_boss_done', scene: 'sg.daigo_after' },
        { if: 'quest.sg_main>=3', scene: 'sg.daigo_mid' },
        { scene: 'sg.daigo_idle' }] },
      { id: 'tetsu', x: 34, y: 29, dir: 'down', talk: [
        { if: 'post', scene: 'sg.tetsu_post' },
        { if: 'quest.sg_main=1&!sg_ferry_done', scene: 'sg.tetsu_first' },
        { if: 'sg_boss_done&!seen.sg.tetsu_history', scene: 'sg.tetsu_history' },
        { if: 'quest.sg_main>=5&!item.sg_rope', scene: 'sg.tetsu_rope' },
        { scene: 'sg.tetsu_idle' }] },
      { id: 'kiyo', x: 31, y: 17, dir: 'down', noFace: false, talk: [
        { if: 'post', scene: 'sg.kiyo_post' },
        { if: 'quest.sg_main=3&!sg_clue_kiyo', scene: 'sg.kiyo_clue' },
        { if: 'quest.sg_cove=0&!sg_dir_kiyo', scene: 'sg.dir_kiyo' },
        { if: 'quest.sg_cove=done', scene: 'sg.kiyo_fish' },
        { scene: 'sg.kiyo_idle' }] },
      { id: 'sota', x: 18, y: 28, dir: 'down', if: '!quest.sg_cove=done', talk: [
        { if: 'item.sg_nets', scene: 'sg.sota_nets' },
        { if: 'quest.sg_cove', scene: 'sg.sota_wait' },
        { if: 'quest.sg_main>=2', scene: 'sg.sota_start' },
        { scene: 'sg.sota_early' }] },
      { id: 'sota2', char: 'sota', x: 19, y: 33, dir: 'right', if: 'quest.sg_cove=done', talk: [
        { if: 'post', scene: 'sg.sota_post' },
        { scene: 'sg.sota_after' }] },
      { id: 'fuku', x: 47, y: 9, dir: 'down', talk: [
        { if: 'post', scene: 'sg.fuku_post' },
        { if: 'item.sg_plate', scene: 'sg.fuku_plate' },
        { if: 'quest.sg_seaglass=done', scene: 'sg.fuku_after' },
        { if: 'quest.sg_seaglass>=1', scene: 'sg.fuku_boat' },
        { scene: 'sg.fuku_idle' }] },
      { id: 'tobi', x: 50, y: 24, wander: 2, talk: [
        { if: 'post', scene: 'sg.tobi_post' },
        { if: 'quest.sg_cove=0&!sg_dir_tobi', scene: 'sg.dir_tobi' },
        { if: 'quest.sg_seaglass=0', scene: 'sg.tobi_glass' },
        { scene: 'sg.tobi_idle' }] },
      { id: 'shiori_out', char: 'shiori', x: 10, y: 32, dir: 'down', if: 'sg_fog_cleared&!sg_boss_done', talk: 'sg.shiori_causeway' },
      { id: 'suzu', x: 28, y: 22, dir: 'down', if: 'comp!=suzu&!ch2_done', talk: [
        { if: 'sg_boss_done', scene: 'sg.suzu_cameo2' },
        { scene: 'sg.suzu_cameo' }] },
      { id: 'nagisa_q', char: 'nagisa', x: 35, y: 33, dir: 'up', if: 'sg_ferry_running&quest.sg_lighthouse=2&!sg_nagisa_met', talk: 'sg.nagisa_arrive' },
    ],
    exits: [
      { x: 27, y: 0, w: 2, h: 1, to: 'sg.road', tx: 18, ty: 20, dir: 'up' },
      { x: 55, y: 13, w: 1, h: 2, to: 'sg.cove', tx: 1, ty: 8, dir: 'right', if: 'sg_cove_open' },
      { x: 8, y: 41, w: 2, h: 1, to: 'sg.da_entry', tx: 11, ty: 15, dir: 'down', if: 'sg_tide_low' },
    ],
    triggers: [
      { x: 55, y: 13, w: 1, h: 2, scene: 'sg.cove_lost', if: '!sg_cove_open' },
      { x: 8, y: 36, w: 2, h: 1, scene: 'sg.causeway_fog', if: 'sg_tide_low&!sg_fog_cleared' },
      { x: 8, y: 37, w: 2, h: 1, scene: 'sg.causeway_walk', if: 'sg_fog_cleared', once: true, id: 'walk' },
    ],
    onEnter: [
      { scene: 'sg.harbor_first', if: '!sg_harbor_seen' },
      { scene: 'sg.return_harbor', if: 'sg_boss_done&!sg_returned' },
      { scene: 'sg.ferry_arrives', if: 'sg_ferry_running&quest.sg_lighthouse=2&!sg_ferry_seen' },
    ],
    spawn: { default: [27, 2, 'down'], from_road: [27, 2, 'down'], from_cove: [54, 13, 'left'], from_archive: [8, 39, 'up'] },
  };

  // ---- interiors -------------------------------------------------------------------------------------
  function interior(id, name, w, h, doorX, back, extra) {
    C.maps[id] = Object.assign({
      name, region: 'saltglass', music: null, noTravel: true,
      terrain: K.room(w, h, '_', doorX),
      props: [],
      npcs: [],
      exits: [{ x: doorX, y: h - 1, to: 'sg.harbor', tx: back[0], ty: back[1], dir: 'down' }],
      spawn: { default: [doorX, h - 2, 'up'] },
    }, extra);
  }
  interior('sg.office', T('Harbour Office', '{港|みなと}の{事務所|じむしょ}'), 11, 9, 5, [16, 11], {
    props: [
      { p: 'exitmat', x: 5, y: 7 },
      { p: 'desk', x: 4, y: 4, across: true, scene: 'sg.office_desk' },
      { p: 'shelf', x: 1, y: 2 }, { p: 'shelf', x: 2, y: 2 },
      { p: 'sign', x: 8, y: 2, scene: 'sg.office_chart' },
      { p: 'bookpile', x: 9, y: 6 }, { p: 'flowerpot', x: 9, y: 2 },
      { p: 'bench', x: 1, y: 6 },
    ],
    npcs: [{ id: 'omi', x: 5, y: 3, dir: 'down', talk: [
      { if: 'post', scene: 'sg.omi_post' },
      { if: 'quest.sg_main=0', scene: 'sg.omi_intro' },
      { if: 'quest.sg_main=1', scene: 'sg.omi_checking' },
      { if: 'quest.sg_main=2', scene: 'sg.omi_report' },
      { if: 'quest.sg_main=3', scene: 'sg.omi_ask' },
      { if: 'quest.sg_main=4', scene: 'sg.omi_wait' },
      { if: 'quest.sg_main=9', scene: 'sg.omi_final' },
      { if: 'ch2_done', scene: 'sg.omi_after' },
      { scene: 'sg.omi_tide' }] }],
  });
  interior('sg.inn', T('The Gull', 'かもめ{亭|てい}'), 13, 10, 6, [35, 11], {
    terrain: K.build(13, 10, '#', (k) => { k.rect(1, 2, 11, 7, '_'); k.set(6, 9, '_'); k.rect(1, 2, 3, 1, 'k'); }),
    props: [
      { p: 'exitmat', x: 6, y: 8 },
      { p: 'counter', x: 8, y: 4, across: true }, { p: 'stove', x: 9, y: 2 }, { p: 'pot', x: 10, y: 2 }, { p: 'shelf', x: 11, y: 2 },
      { p: 'table', x: 2, y: 3, scene: 'sg.inn_table' }, { p: 'chair', x: 1, y: 3 }, { p: 'chair', x: 4, y: 3 },
      { p: 'table', x: 2, y: 6 }, { p: 'chair', x: 1, y: 6 }, { p: 'chair', x: 4, y: 6 },
      { p: 'smalltable', x: 9, y: 7 }, { p: 'chair', x: 10, y: 7 },
      { p: 'stairs', x: 11, y: 5, scene: 'sg.inn_stairs' },
      { p: 'sign', x: 7, y: 2, scene: 'sg.inn_menu' },
    ],
    npcs: [
      { id: 'tamae', x: 9, y: 3, dir: 'down', talk: [
        { if: 'post', scene: 'sg.tamae_post' },
        { if: 'quest.sg_main=1&!sg_lunch_done', scene: 'sg.tamae_first' },
        { if: 'quest.sg_main=1&!sg_post_done', scene: 'sg.tamae_postbag' },
        { if: 'sg_boss_done&!ch2_done', scene: 'sg.tamae_after' },
        { scene: 'sg.tamae_rest' }] },
      { id: 'nao', x: 3, y: 5, dir: 'down', if: 'comp!=nao&!sg_post_done', talk: 'sg.nao_cameo' },
    ],
  });
  interior('sg.warehouse', T('No. 2 Warehouse', '{二番|にばん}{倉庫|そうこ}'), 13, 10, 6, [16, 21], {
    terrain: K.build(13, 10, '#', (k) => { k.rect(1, 2, 11, 7, '_'); k.set(6, 9, '_'); }),
    props: [
      { p: 'exitmat', x: 6, y: 8 },
      { p: 'crate', x: 1, y: 2 }, { p: 'crate', x: 2, y: 2 }, { p: 'crate', x: 1, y: 3 }, { p: 'crate', x: 11, y: 7 },
      { p: 'crate', x: 4, y: 3, scene: 'sg.crate_blank' },
      { p: 'crate', x: 8, y: 3, scene: 'sg.crate_glued' },
      { p: 'barrel', x: 10, y: 5, scene: 'sg.crate_oil' }, { p: 'barrel', x: 11, y: 5 },
      { p: 'barrel', x: 11, y: 2 }, { p: 'barrel', x: 11, y: 3 },
      { p: 'desk', x: 1, y: 6, scene: 'sg.wh_ledger' },
      { p: 'shelf', x: 6, y: 2 }, { p: 'net', x: 8, y: 7 },
    ],
    npcs: [{ id: 'wataru', x: 5, y: 5, dir: 'left', talk: [
      { if: 'post', scene: 'sg.wataru_post' },
      { if: 'quest.sg_main<=1&!sg_wataru_met', scene: 'sg.wataru_first' },
      { if: 'quest.sg_main=4', scene: 'sg.wataru_confront' },
      { if: 'sg_wataru_resolved&!sg_extension_done', scene: 'sg.wataru_letter' },
      { if: 'sg_wataru_resolved', scene: 'sg.wataru_after' },
      { scene: 'sg.wataru_busy' }] }],
  });
  interior('sg.glass', T("Asahi's Glassworks", 'アサヒ の ガラス{工房|こうぼう}'), 10, 9, 5, [48, 20], {
    props: [
      { p: 'exitmat', x: 5, y: 7 },
      { p: 'kiln', x: 1, y: 2, scene: 'sg.glass_kiln' },
      { p: 'glassware', x: 6, y: 2 }, { p: 'glassware', x: 7, y: 2 }, { p: 'shelf', x: 8, y: 2 },
      { p: 'table', x: 6, y: 5, scene: 'sg.glass_table' },
      { p: 'crate', x: 1, y: 6 }, { p: 'barrel', x: 8, y: 6 },
    ],
    npcs: [{ id: 'asahi', x: 4, y: 4, dir: 'down', talk: [
      { if: 'post', scene: 'sg.asahi_post' },
      { if: 'quest.sg_main=3&!sg_clue_asahi', scene: 'sg.asahi_clue' },
      { if: 'quest.sg_seaglass=done', scene: 'sg.asahi_after' },
      { if: 'quest.sg_seaglass=2&item.sg_registry', scene: 'sg.asahi_name' },
      { if: 'quest.sg_seaglass=3', scene: 'sg.asahi_plate_wait' },
      { if: 'quest.sg_seaglass=1', scene: 'sg.asahi_waitname' },
      { if: 'quest.sg_seaglass=0&item.sg_seaglass>=3', scene: 'sg.asahi_glass' },
      { if: 'quest.sg_seaglass=0', scene: 'sg.asahi_waitglass' },
      { if: 'quest.sg_main>=2', scene: 'sg.asahi_order' },
      { scene: 'sg.asahi_early' }] }],
  });
  interior('sg.lighthouse', T('Lighthouse', '{灯台|とうだい}'), 9, 10, 4, [2, 32], {
    terrain: K.build(9, 10, '#', (k) => { k.rect(1, 2, 7, 7, '+'); k.set(4, 9, '+'); k.rect(3, 3, 3, 3, 'k'); }),
    props: [
      { p: 'exitmat', x: 4, y: 8 },
      { p: 'sg_lens', x: 4, y: 2, scene: 'sg.lh_lens' },
      { p: 'stairs', x: 1, y: 2, scene: 'sg.lh_stairs' },
      { p: 'smalltable', x: 1, y: 6, scene: 'sg.lh_letter' },
      { p: 'bed', x: 7, y: 5 }, { p: 'barrel', x: 7, y: 2, scene: 'sg.lh_oil' },
    ],
    npcs: [
      { id: 'genzo', x: 5, y: 4, dir: 'down', talk: [
        { if: 'post', scene: 'sg.genzo_post' },
        { if: 'quest.sg_main=3&!sg_clue_genzo', scene: 'sg.genzo_clue' },
        { if: 'quest.sg_main=6', scene: 'sg.genzo_wind' },
        { if: 'quest.sg_lighthouse=1', scene: 'sg.genzo_truth' },
        { if: 'sg_nagisa_met', scene: 'sg.genzo_family' },
        { if: 'quest.sg_lighthouse=2', scene: 'sg.genzo_waiting' },
        { if: 'quest.sg_main>=2&!quest.sg_lighthouse', scene: 'sg.genzo_grump' },
        { scene: 'sg.genzo_idle' }] },
      { id: 'nagisa', x: 3, y: 4, dir: 'down', if: 'sg_nagisa_met', talk: [{ if: 'post', scene: 'sg.nagisa_post' }, { scene: 'sg.nagisa_home' }] },
    ],
  });
  interior('sg.tidehut', T('Tide-Watch Hut', '{潮見|しおみ}{小屋|ごや}'), 9, 8, 4, [7, 27], {
    props: [
      { p: 'exitmat', x: 4, y: 6 },
      { p: 'sg_tideboard', x: 1, y: 2, scene: 'sg.tideboard' },
      { p: 'desk', x: 5, y: 2, scene: 'sg.tide_desk' },
      { p: 'bed', x: 7, y: 4 }, { p: 'bookpile', x: 1, y: 5 }, { p: 'telescope', x: 7, y: 2, scene: 'sg.tide_scope' },
    ],
    npcs: [{ id: 'shiori', x: 4, y: 3, dir: 'down', if: '!sg_fog_cleared|sg_boss_done', talk: [
      { if: 'post', scene: 'sg.shiori_post' },
      { if: 'quest.sg_main=5', scene: 'sg.shiori_tide' },
      { if: 'quest.sg_main=6', scene: 'sg.shiori_fog' },
      { if: 'sg_boss_done', scene: 'sg.shiori_after' },
      { if: 'quest.sg_main>=2', scene: 'sg.shiori_mid' },
      { scene: 'sg.shiori_early' }] }],
  });
  interior('sg.isamu', T("Isamu's House", 'イサム の {家|いえ}'), 8, 8, 3, [6, 7], {
    props: [
      { p: 'exitmat', x: 3, y: 6 },
      { p: 'chair', x: 5, y: 3, scene: 'sg.isamu_chair' },
      { p: 'smalltable', x: 2, y: 3, scene: 'sg.isamu_desk' },
      { p: 'bed', x: 1, y: 5 }, { p: 'crate', x: 6, y: 5 }, { p: 'flowerpot', x: 6, y: 2, scene: 'sg.isamu_plant' },
    ],
    onEnter: [{ scene: 'sg.isamu_nao', if: 'comp=nao' }],
  });

  // ---- The fishers' cove -----------------------------------------------------------------------------
  C.maps['sg.cove'] = {
    name: { en: "The Fishers' Cove", jp: '{漁師|りょうし}の{入|い}り{江|え}' }, region: 'saltglass', music: 'quiet_road', noTravel: true,
    terrain: K.build(30, 20, 's', (k) => {
      k.rect(0, 0, 30, 4, '^');
      k.ragged('top', '^', 5, 51);
      k.rect(0, 15, 30, 5, '~');
      k.ragged('bottom', '~', 6, 52);
      k.path([[0, 8], [7, 8]], ':', 2);
      k.rect(19, 10, 4, 2, 'w');
      k.scatter('h', 9, 53, [3, 5, 26, 8], 's');
      k.set(0, 7, '^').set(0, 10, '^');
    }),
    props: [
      { p: 'sign', x: 3, y: 7, scene: 'sg.cove_plaque' },
      { p: 'net', x: 24, y: 6, scene: 'sg.cove_nets', if: 'quest.sg_cove=2' },
      { p: 'net', x: 24, y: 6, if: '!quest.sg_cove=2' },
      { p: 'sg_wreck', x: 11, y: 11, scene: 'sg.cove_wreck' },
      { p: 'sparkle', x: 6, y: 12, scene: 'sg.glass_pick3', if: 'quest.sg_seaglass&!sg_glass3' },
      { p: 'sparkle', x: 27, y: 11, scene: 'sg.glass_pick4', if: 'quest.sg_seaglass&!sg_glass4' },
      { p: 'stump', x: 16, y: 6, scene: 'sg.cove_driftwood' },
    ],
    foes: [
      { id: 'c1', enemy: 'sg.crab', x: 14, y: 8, patrol: 2, aggro: true },
      { id: 'c2', enemy: 'sg.crab', x: 22, y: 12, patrol: 1 },
      { id: 'w1', enemy: 'sg.fogwisp', x: 19, y: 6, patrol: 2, aggro: true },
    ],
    exits: [{ x: 0, y: 8, w: 1, h: 2, to: 'sg.harbor', tx: 54, ty: 13, dir: 'left' }],
    onEnter: [{ scene: 'sg.cove_arrive', if: '!sg_cove_seen' }],
    spawn: { default: [1, 8, 'right'] },
  };

  // ---- The Drowned Archive ------------------------------------------------------------------------------
  const DA = { region: 'archive', music: 'drowned_archive', noTravel: true, ambient: { weather: 'pages', dark: 0.42, playerLight: 52, tint: 'rgba(40,70,110,0.10)' } };
  C.maps['sg.da_entry'] = Object.assign({}, DA, {
    name: { en: 'Drowned Archive — Receiving Hall', jp: '{沈|しず}んだ{書庫|しょこ}・{受付|うけつけ}' },
    terrain: K.build(24, 18, '#', (k) => {
      k.rect(1, 2, 22, 15, '+');
      k.set(11, 17, '+').set(12, 17, '+');
      k.set(11, 1, '+').set(12, 1, '+').set(11, 0, '+').set(12, 0, '+');
      k.set(0, 9, '+').set(0, 10, '+');
      k.rect(18, 2, 2, 15, '~');
      k.hline(18, 19, 9, 'b');
      k.hline(2, 8, 2, 'L').hline(14, 16, 2, 'L');
      k.scatter('w', 16, 61, [1, 4, 16, 12], '+');
      k.rect(20, 4, 3, 2, 'L');
    }),
    props: [
      { p: 'sg_drawers', x: 11, y: 3, scene: 'sg.da_catalog' },
      { p: 'counter', x: 5, y: 6, scene: 'sg.da_sortdesk' },
      { p: 'lantern', x: 3, y: 4 }, { p: 'lantern', x: 16, y: 4 },
      { p: 'bookpile', x: 21, y: 13, scene: 'sg.da_eastpile' }, { p: 'bookpile', x: 2, y: 14 },
      { p: 'ink', x: 9, y: 11 }, { p: 'ink', x: 14, y: 14 },
      { p: 'sign', x: 10, y: 2, scene: 'sg.da_innersign' },
    ],
    foes: [
      { id: 'e1', enemy: 'sg.crab', x: 6, y: 12, patrol: 2, aggro: true },
      { id: 'e2', enemy: 'sg.crab', x: 21, y: 11, patrol: 2, aggro: true },
    ],
    exits: [
      { x: 11, y: 17, w: 2, h: 1, to: 'sg.harbor', tx: 8, ty: 39, dir: 'up' },
      { x: 11, y: 0, w: 2, h: 1, to: 'sg.da_stacks', tx: 14, ty: 19, dir: 'up', locked: 'sg.da_innerdoor', unlock: 'sg_da_catalog' },
      { x: 0, y: 9, w: 1, h: 2, to: 'sg.da_reading', tx: 8, ty: 11, dir: 'up', locked: 'sg.da_bolted', unlock: 'sg_da_shortcut' },
    ],
    onEnter: [{ scene: 'sg.da_arrive', if: '!sg_da_seen' }],
    spawn: { default: [11, 15, 'up'], from_stacks: [11, 2, 'down'], from_reading: [1, 9, 'right'] },
  });
  C.maps['sg.da_stacks'] = Object.assign({}, DA, {
    name: { en: 'Drowned Archive — The Stacks', jp: '{沈|しず}んだ{書庫|しょこ}・{書架|しょか}' },
    terrain: K.build(30, 22, '#', (k) => {
      k.rect(1, 2, 28, 19, '+');
      for (const y of [4, 7, 14, 17]) { k.hline(3, 11, y, 'L'); k.hline(17, 26, y, 'L'); }
      k.rect(1, 10, 28, 2, '~');
      k.rect(13, 10, 2, 2, 'B');
      k.rect(23, 10, 2, 2, 'w');
      k.set(14, 21, '+').set(15, 21, '+');
      k.set(29, 5, '+').set(29, 6, '+');
      k.scatter('w', 10, 62, [1, 12, 28, 8], '+');
    }),
    props: [
      { p: 'sign', x: 2, y: 4, scene: 'sg.da_shelf_a' },
      { p: 'sign', x: 16, y: 4, scene: 'sg.da_shelf_ka' },
      { p: 'sign', x: 2, y: 14, scene: 'sg.da_shelf_sa' },
      { p: 'sign', x: 16, y: 14, scene: 'sg.da_shelf_ta' },
      { p: 'lantern', x: 12, y: 3 }, { p: 'lantern', x: 27, y: 13 },
      { p: 'bookpile', x: 5, y: 12, scene: 'sg.da_wetbooks' }, { p: 'bookpile', x: 20, y: 19 }, { p: 'bookpile', x: 27, y: 8 },
      { p: 'ink', x: 8, y: 16 }, { p: 'ink', x: 21, y: 5 },
    ],
    foes: [
      { id: 's1', enemy: 'sg.crane', x: 8, y: 13, patrol: 2, aggro: true },
      { id: 's2', enemy: 'sg.crane', x: 20, y: 8, patrol: 2, aggro: true },
      { id: 's3', enemy: 'sg.blot', x: 24, y: 5, patrol: 1, aggro: true },
    ],
    exits: [
      { x: 14, y: 21, w: 2, h: 1, to: 'sg.da_entry', tx: 11, ty: 2, dir: 'down' },
      { x: 29, y: 5, w: 1, h: 2, to: 'sg.da_reading', tx: 1, ty: 6, dir: 'right' },
    ],
    onEnter: [{ scene: 'sg.da_stacks_first', if: '!sg_da_stacks_seen' }],
    spawn: { default: [14, 19, 'up'], from_reading: [28, 5, 'left'] },
  });
  C.maps['sg.da_reading'] = Object.assign({}, DA, {
    name: { en: 'Drowned Archive — Reading Room', jp: '{沈|しず}んだ{書庫|しょこ}・{閲覧室|えつらんしつ}' },
    ambient: { weather: 'motes', dark: 0.3, playerLight: 52, tint: 'rgba(60,70,110,0.08)' },
    terrain: K.build(18, 14, '#', (k) => {
      k.rect(1, 2, 16, 11, '+');
      k.rect(4, 4, 10, 6, 'k');
      k.set(0, 6, '+').set(0, 7, '+');
      k.set(8, 13, '+').set(9, 13, '+');
      k.set(8, 1, '+').set(9, 1, '+').set(8, 0, '+').set(9, 0, '+');
      k.hline(1, 6, 2, 'L').hline(11, 16, 2, 'L');
    }),
    props: [
      { p: 'desk', x: 5, y: 5, scene: 'sg.da_ledger' },
      { p: 'desk', x: 11, y: 5, scene: 'sg.da_registry' },
      { p: 'lantern', x: 2, y: 4 }, { p: 'lantern', x: 15, y: 4 },
      { p: 'bookpile', x: 2, y: 10 }, { p: 'bookpile', x: 15, y: 11 },
      { p: 'chair', x: 7, y: 7 }, { p: 'chair', x: 10, y: 7 },
      { p: 'sign', x: 10, y: 2, scene: 'sg.da_readingsign' },
    ],
    foes: [{ id: 'r1', enemy: 'sg.letter', x: 14, y: 9, patrol: 1 }],
    exits: [
      { x: 0, y: 6, w: 1, h: 2, to: 'sg.da_stacks', tx: 28, ty: 5, dir: 'left' },
      { x: 8, y: 13, w: 2, h: 1, to: 'sg.da_entry', tx: 1, ty: 9, dir: 'down', locked: 'sg.da_unbolt', unlock: 'sg_da_shortcut' },
      { x: 8, y: 0, w: 2, h: 1, to: 'sg.da_sluice', tx: 13, ty: 17, dir: 'up' },
    ],
    onEnter: [{ scene: 'sg.da_reading_first', if: '!sg_da_reading_seen' }],
    spawn: { default: [1, 6, 'right'], from_sluice: [8, 2, 'down'] },
  });
  const channel = [];
  for (let y = 8; y <= 11; y++) for (let x = 13; x <= 14; x++) channel.push({ p: 'water', x, y, if: '!sg_da_raft', scene: 'sg.da_channel' });
  C.maps['sg.da_sluice'] = Object.assign({}, DA, {
    name: { en: 'Drowned Archive — Sluice Channels', jp: '{沈|しず}んだ{書庫|しょこ}・{水門|すいもん}' },
    terrain: K.build(28, 20, '#', (k) => {
      k.rect(1, 2, 26, 17, '+');
      k.rect(1, 8, 26, 4, '~');
      k.rect(13, 8, 2, 4, 'w');
      k.rect(1, 14, 5, 3, '~');
      k.rect(22, 3, 4, 3, '~');
      k.set(13, 19, '+').set(14, 19, '+');
      k.set(13, 1, '+').set(14, 1, '+').set(13, 0, '+').set(14, 0, '+');
      k.scatter('w', 12, 63, [1, 12, 26, 6], '+');
    }),
    props: [
      { p: 'sg_raft', x: 13, y: 8, if: 'sg_da_raft' },
      { p: 'sg_bollard', x: 12, y: 12, scene: 'sg.da_raft' },
      { p: 'sg_bollard', x: 15, y: 7 },
      { p: 'lantern', x: 3, y: 12 }, { p: 'lantern', x: 24, y: 12 }, { p: 'lantern', x: 10, y: 3 },
      { p: 'sign', x: 16, y: 12, scene: 'sg.da_sluicesign' },
      { p: 'bookpile', x: 2, y: 4 }, { p: 'bookpile', x: 25, y: 17 },
    ].concat(channel),
    foes: [
      { id: 'm1', enemy: 'sg.moth', x: 6, y: 5, patrol: 2, aggro: true },
      { id: 'm2', enemy: 'sg.moth', x: 21, y: 15, patrol: 2, aggro: true },
      { id: 'g1', enemy: 'sg.golem', x: 17, y: 4, patrol: 1, aggro: true },
    ],
    exits: [
      { x: 13, y: 19, w: 2, h: 1, to: 'sg.da_reading', tx: 8, ty: 2, dir: 'down' },
      { x: 13, y: 0, w: 2, h: 1, to: 'sg.da_vault', tx: 9, ty: 13, dir: 'up' },
    ],
    onEnter: [{ scene: 'sg.da_sluice_first', if: '!sg_da_sluice_seen' }],
    spawn: { default: [13, 17, 'up'], from_vault: [13, 2, 'down'] },
  });
  C.maps['sg.da_vault'] = Object.assign({}, DA, {
    name: { en: 'Drowned Archive — Returns Counter', jp: '{沈|しず}んだ{書庫|しょこ}・{返送|へんそう}{窓口|まどぐち}' },
    music: [{ if: 'sg_boss_done', id: 'wonder' }, { id: 'drowned_archive' }],
    ambient: { weather: 'pages', dark: 0.38, playerLight: 56, tint: 'rgba(30,60,110,0.14)' },
    terrain: K.build(20, 16, '#', (k) => {
      k.rect(1, 2, 18, 13, '+');
      k.rect(3, 3, 14, 3, 'p');
      k.set(9, 15, '+').set(10, 15, '+');
      k.rect(1, 9, 3, 5, '~');
      k.rect(16, 9, 3, 5, '~');
    }),
    props: [
      { p: 'counter', x: 5, y: 5, across: true, scene: 'sg.da_counter' }, { p: 'counter', x: 12, y: 5, across: true, scene: 'sg.da_counter' },
      { p: 'bookpile', x: 3, y: 3 }, { p: 'bookpile', x: 16, y: 3 }, { p: 'bookpile', x: 4, y: 7 }, { p: 'bookpile', x: 15, y: 7 },
      { p: 'lantern', x: 2, y: 2 }, { p: 'lantern', x: 17, y: 2 },
      { p: 'sparkle', x: 9, y: 4, if: 'sg_boss_done' },
    ],
    npcs: [{ id: 'sg_clerk', x: 9, y: 4, dir: 'down', if: '!sg_boss_done', talk: 'sg.da_boss', look: { custom: 'sg_clerk' } }],
    triggers: [{ x: 4, y: 9, w: 12, h: 1, scene: 'sg.da_boss', if: '!sg_boss_done' }],
    exits: [{ x: 9, y: 15, w: 2, h: 1, to: 'sg.da_sluice', tx: 13, ty: 2, dir: 'down' }],
    spawn: { default: [9, 13, 'up'] },
  });
  void txt;
})(RB.content, RB.mapkit);
