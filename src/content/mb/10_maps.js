/* Manybridge, Chapter 3: the maps (expansion P08; docs/future/work/P08_MANYBRIDGE.md). The ferry pier, the Exchange
 * district (the hub: the Tally Exchange, Fujiya, the porters, the inn, the lock-keeper's house, four bridges over the
 * Long Canal and the Cross Canal), the warehouse row along the Back Canal (two more bridges, the boatman, the walled
 * warehouse), and the interiors. The Undercroft Locks are in 11_under.js. Every map is the twelve-chapter edition's
 * only (`edition: 2`; the ferry that reaches them sails only in such journeys).
 *
 * Bridges carry plaques (mb_plaque), blank until the name is read back: the main story restores some, the
 * Bridge-Name Census (quest mb_census) the rest. A plaque's flag is mb_pl_<bridge>. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const CITY = { region: 'manybridge', music: 'manybridge', edition: 2 };
  // a bridge's plaque: blank until its name is read back
  const plaque = (id, x, y) => ({ p: 'mb_plaque', x, y, scene: 'mb.plaque_' + id, o: { bridge: id } });
  const willow = (x, y) => ({ p: 'tree', x, y, o: { willow: true } });

  // ---- the ferry pier ----------------------------------------------------------------------------------------------
  C.maps['mb.pier'] = Object.assign({}, CITY, {
    name: T('The Ferry Pier', '{渡|わた}し{場|ば}'),
    ambient: { weather: null },
    terrain: K.build(36, 22, '=', (k) => {
      k.rect(0, 15, 36, 7, '~');        // the harbour
      k.hline(0, 35, 14, '+');           // the quay's edge
      k.rect(26, 0, 4, 15, '~');         // the canal coming down from the city
      k.rect(26, 7, 4, 2, 'b');          // the Harbour Bridge (港橋)
      k.rect(15, 15, 2, 5, 'B');         // the ferry's jetty
      k.rect(30, 0, 6, 14, '=');
      k.set(25, 2, 'T').set(31, 3, 'T').set(25, 12, 'T').set(31, 12, 'T');
      k.scatter(',', 4, 811, [31, 4, 5, 8], '=');
    }),
    structs: [
      { type: 'house', x: 1, y: 1, w: 6, h: 4, roof: 'tile', door: null },
      { type: 'house', x: 8, y: 1, w: 5, h: 4, roof: 'tile', door: null },
      { type: 'house', x: 2, y: 8, w: 4, h: 3, roof: 'tile', wall: 'wood', door: 2, windows: [0], to: 'mb.pier', locked: 'mb.door_ferryoffice' },
      { type: 'house', x: 31, y: 5, w: 5, h: 3, roof: 'tile', door: 2, windows: [0, 4], to: 'mb.pier', locked: 'mb.door_locked' },
    ],
    props: [
      { p: 'sg_ferry', x: 10, y: 17, scene: 'mb.ferry_west' },
      { p: 'sg_bollard', x: 14, y: 14 }, { p: 'sg_bollard', x: 18, y: 14 },
      plaque('minato', 25, 6),
      { p: 'mb_barge', x: 27, y: 2 },
      { p: 'crate', x: 20, y: 12 }, { p: 'crate', x: 21, y: 12 }, { p: 'barrel', x: 22, y: 12 }, { p: 'crate', x: 7, y: 12 },
      { p: 'lantern', x: 13, y: 13, o: { lit: true } }, { p: 'lantern', x: 19, y: 13, o: { lit: true } },
      { p: 'sign', x: 17, y: 11, scene: 'mb.pier_sign' },
      { p: 'bench', x: 9, y: 12 },
    ],
    npcs: [
      { id: 'mb_take', x: 21, y: 10, dir: 'left', talk: [{ if: 'mb1_done', scene: 'mb.take_after' }, { scene: 'mb.take_idle' }] },
    ],
    exits: [{ x: 12, y: 0, w: 3, h: 1, to: 'mb.exchange', tx: 22, ty: 42, dir: 'up' }],
    onEnter: [{ scene: 'mb.arrive', if: '!mb_arrived' }],
    spawn: { default: [15, 13, 'up'], from_ferry: [16, 14, 'up'], from_town: [13, 1, 'down'] },
  });

  // ---- the Exchange district (the hub) -----------------------------------------------------------------------------
  C.maps['mb.exchange'] = Object.assign({}, CITY, {
    name: T('Manybridge', '{八百橋|やおばし}'), place: 'manybridge', travel: 'manybridge',
    ambient: { weather: null },
    alt: [{ if: 'mb_night', ambient: { dark: 0.55, tint: 'rgba(40,50,110,0.18)', playerLight: 44 }, night: true }],
    terrain: K.build(56, 44, '=', (k) => {
      k.rect(0, 20, 50, 3, '~');         // the Long Canal (長堀)
      k.rect(30, 0, 3, 20, '~');         // the Cross Canal (横堀)
      k.rect(11, 20, 2, 3, 'B');         // the Tally Bridge (札橋)
      k.rect(23, 20, 2, 3, 'B');         // the Middle Bridge (中橋)
      k.rect(42, 20, 2, 3, 'B');         // the Storehouse Bridge (蔵橋)
      k.rect(30, 11, 3, 2, 'b');         // the Wisteria Bridge (藤橋)
      k.rect(50, 18, 6, 7, '+');         // the lock's stone apron
      for (const [x, y] of [[3, 19], [17, 19], [28, 23], [36, 19], [47, 23], [29, 6], [33, 15], [6, 23], [38, 23]]) k.set(x, y, 'T');
      k.scatter(',', 6, 821, [0, 24, 56, 18], '=');
    }),
    structs: [
      { type: 'house', x: 4, y: 3, w: 12, h: 6, roof: 'tile', door: 6, windows: [1, 2, 4, 8, 10], to: 'mb.tally', spawn: [8, 9], lit: true, sign: true, signX: 5 },
      { type: 'house', x: 18, y: 5, w: 4, h: 3, roof: 'tile', wall: 'stone', door: 2, windows: [0], to: 'mb.deadletter', spawn: [5, 7] },
      { type: 'house', x: 23, y: 3, w: 5, h: 4, roof: 'tile', door: null },
      { type: 'house', x: 35, y: 3, w: 9, h: 5, roof: 'tile', door: 4, windows: [1, 2, 6, 7], to: 'mb.fujiya', spawn: [6, 7], lit: true, sign: true, signX: 3 },
      { type: 'house', x: 46, y: 3, w: 7, h: 4, roof: 'slate', wall: 'wood', door: 3, windows: [1, 5], to: 'mb.porters', spawn: [6, 7] },
      { type: 'house', x: 35, y: 12, w: 6, h: 4, roof: 'tile', door: null },
      { type: 'house', x: 50, y: 12, w: 5, h: 4, roof: 'tile', wall: 'stone', door: 2, windows: [0, 4], to: 'mb.lockhouse', spawn: [5, 7], lit: true },
      { type: 'house', x: 3, y: 26, w: 9, h: 5, roof: 'tile', door: 4, windows: [1, 2, 6, 7], chimney: true, to: 'mb.inn', spawn: [6, 8], lit: true, sign: true, signX: 2 },
      { type: 'house', x: 33, y: 26, w: 6, h: 3, roof: 'tile', wall: 'wood', door: 2, windows: [0, 4], to: 'mb.exchange', locked: 'mb.door_kayo' },
      { type: 'house', x: 44, y: 26, w: 7, h: 4, roof: 'tile', door: null },
      { type: 'house', x: 3, y: 35, w: 7, h: 4, roof: 'tile', door: null },
      { type: 'house', x: 36, y: 35, w: 7, h: 4, roof: 'tile', wall: 'wood', door: 3, windows: [1, 5], to: 'mb.exchange', locked: 'mb.door_locked' },
      { type: 'house', x: 46, y: 35, w: 7, h: 4, roof: 'tile', door: null },
    ],
    props: [
      // the bridges' plaques
      plaque('fuda', 10, 19), plaque('naka', 22, 19), plaque('kura', 41, 19), plaque('fuji', 29, 10),
      // the Tally Exchange's outside board, the city's notices
      { p: 'noticeboard', x: 17, y: 10, scene: 'mb.board_outside' },
      { p: 'sign', x: 26, y: 8, scene: 'mb.sign_city' },
      // the lock under the city: the Long Canal goes into the dark under the lock-keeper's house
      { p: 'mb_vault', x: 52, y: 19 },
      // barges at their moorings
      { p: 'mb_barge', x: 4, y: 21 }, { p: 'mb_barge', x: 35, y: 21 },
      // the noodle stalls (まさ屋 and ます屋)
      { p: 'mb_noodle', x: 15, y: 26, scene: 'mb.stall_masa', o: { shop: 'masa' } },
      { p: 'mb_noodle', x: 21, y: 26, scene: 'mb.stall_masu', o: { shop: 'masu' } },
      // street furniture
      { p: 'lantern', x: 13, y: 19, o: { lit: true } }, { p: 'lantern', x: 25, y: 19, o: { lit: true } }, { p: 'lantern', x: 44, y: 19, o: { lit: true } },
      { p: 'lantern', x: 33, y: 10, o: { lit: true } }, { p: 'lantern', x: 9, y: 32, o: { lit: true } },
      { p: 'crate', x: 47, y: 9 }, { p: 'crate', x: 48, y: 9 }, { p: 'barrel', x: 52, y: 9 }, { p: 'sg_bollard', x: 7, y: 19 }, { p: 'sg_bollard', x: 34, y: 23 },
      { p: 'bench', x: 27, y: 25 }, { p: 'well', x: 26, y: 31 }, { p: 'flowerpot', x: 13, y: 9 }, { p: 'flowerpot', x: 44, y: 8 },
      { p: 'mailbox', x: 22, y: 9, scene: 'mb.mailbox' },
      { p: 'laundry', x: 40, y: 30 },
    ],
    npcs: [
      { id: 'mb_gonta', x: 26, y: 24, dir: 'up', if: '!mb_dispute_done', talk: [{ if: 'quest.mb_main>=2', scene: 'mb.gonta_wait' }, { scene: 'mb.gonta_first' }] },
      { id: 'mb_gonta', x: 48, y: 10, dir: 'down', if: 'mb_dispute_done', talk: [{ if: 'mb1_done', scene: 'mb.gonta_after' }, { scene: 'mb.gonta_work' }] },
      { id: 'mb_take', x: 20, y: 17, dir: 'down', talk: [{ if: 'mb1_done', scene: 'mb.take_after' }, { scene: 'mb.take_city' }] },
      { id: 'mb_masa', x: 16, y: 25, dir: 'down', talk: 'mb.masa' },
      { id: 'mb_masu', x: 22, y: 25, dir: 'down', talk: 'mb.masu' },
      { id: 'mb_kayo', x: 36, y: 30, dir: 'down', if: '!mb_ichi_lost|mb_ichi_found', talk: [{ if: 'mb_ichi_found', scene: 'mb.kayo_after' }, { scene: 'mb.kayo_idle' }] },
      { id: 'mb_ichi', x: 37, y: 31, dir: 'left', if: 'mb_ichi_found', talk: 'mb.ichi_after' },
    ],
    exits: [
      { x: 21, y: 43, w: 3, h: 1, to: 'mb.pier', tx: 13, ty: 1, dir: 'down' },
      { x: 55, y: 30, w: 1, h: 2, to: 'mb.kura', tx: 1, ty: 19, dir: 'right' },
    ],
    triggers: [{ x: 21, y: 40, w: 3, h: 1, scene: 'mb.night_pier', if: 'mb_night&!mb_ichi_found' }],
    onEnter: [{ scene: 'mb.exchange_first', if: '!mb_exchange_seen' }],
    spawn: { default: [22, 41, 'up'], from_pier: [22, 41, 'up'], from_kura: [54, 30, 'left'] },
  });

  // ---- the warehouse row along the Back Canal ----------------------------------------------------------------------
  C.maps['mb.kura'] = Object.assign({}, CITY, {
    name: T('Warehouse Row', '{蔵|くら} の {並|なら}び'),
    ambient: { weather: null },
    alt: [{ if: 'mb_night', ambient: { dark: 0.6, tint: 'rgba(40,50,110,0.2)', playerLight: 44 }, night: true }],
    terrain: K.build(44, 28, '=', (k) => {
      k.rect(0, 12, 44, 3, '~');         // the Back Canal (裏堀)
      k.rect(8, 12, 2, 3, 'B');          // the West Bridge (西橋)
      k.rect(30, 12, 2, 3, 'B');         // the East Bridge (東橋)
      k.set(32, 15, 'w');                // a ledge at the water's edge, beside the East Bridge
      for (const [x, y] of [[1, 11], [15, 11], [23, 11], [41, 11], [5, 16], [19, 16], [27, 25], [42, 17]]) k.set(x, y, 'T');
      k.scatter(',', 5, 831, [0, 16, 44, 11], '=');
    }),
    structs: [
      { type: 'house', x: 1, y: 2, w: 6, h: 4, roof: 'tile', door: null },
      { type: 'house', x: 10, y: 2, w: 6, h: 4, roof: 'tile', door: 3, to: 'mb.kura', locked: 'mb.door_kura' },
      { type: 'house', x: 18, y: 2, w: 6, h: 4, roof: 'tile', door: 3, to: 'mb.kura', locked: 'mb.door_heiji_w' },
      { type: 'house', x: 26, y: 2, w: 6, h: 4, roof: 'tile', door: 3, to: 'mb.kura', locked: 'mb.door_heiji_e' },
      { type: 'house', x: 34, y: 2, w: 7, h: 4, roof: 'tile', door: null },
      { type: 'house', x: 2, y: 19, w: 6, h: 4, roof: 'tile', wall: 'wood', door: 3, windows: [1], to: 'mb.kura', locked: 'mb.door_locked' },
      { type: 'house', x: 12, y: 20, w: 6, h: 4, roof: 'tile', door: null },
      { type: 'house', x: 34, y: 19, w: 6, h: 4, roof: 'tile', door: null },
    ],
    props: [
      plaque('nishi', 7, 11), plaque('higashi', 29, 11),
      { p: 'sign', x: 20, y: 7, scene: 'mb.sign_heiji_w' }, { p: 'sign', x: 28, y: 7, scene: 'mb.sign_heiji_e' },
      { p: 'boat', x: 20, y: 13 },
      { p: 'mb_bricked', x: 37, y: 23, scene: 'mb.lc_wall', if: '!mb_lc_opened' },
      { p: 'door', x: 37, y: 23, scene: 'mb.lc_inside', if: 'mb_lc_opened' },
      { p: 'mb_barge', x: 38, y: 13 },
      { p: 'lantern', x: 11, y: 11, o: { lit: true } }, { p: 'lantern', x: 33, y: 11, o: { lit: true } }, { p: 'lantern', x: 24, y: 17, o: { lit: true } },
      { p: 'crate', x: 8, y: 7 }, { p: 'crate', x: 9, y: 7 }, { p: 'barrel', x: 16, y: 8 }, { p: 'lf_floursacks', x: 24, y: 7 }, { p: 'lf_floursacks', x: 25, y: 8 },
      { p: 'sg_bollard', x: 18, y: 15 }, { p: 'bench', x: 24, y: 24 },
    ],
    npcs: [
      { id: 'mb_kansuke', x: 21, y: 15, dir: 'up', talk: [{ if: 'mb_night&!mb_ichi_found', scene: 'mb.kansuke_night' }, { scene: 'mb.kansuke' }] },
      { id: 'mb_heiji', x: 23, y: 8, dir: 'down', if: '!mb_dispute_done', talk: 'mb.heiji_first' },
      { id: 'mb_heiji', x: 23, y: 8, dir: 'down', if: 'mb_dispute_done', talk: [{ if: 'mb1_done', scene: 'mb.heiji_after' }, { scene: 'mb.heiji_work' }] },
      { id: 'mb_zenzo', x: 33, y: 24, dir: 'up', talk: [{ if: 'quest.mb_lc=2', scene: 'mb.zenzo_contract' }, { scene: 'mb.zenzo' }] },
      { id: 'mb_ichi', x: 32, y: 15, dir: 'up', if: 'mb_night&!mb_ichi_found', talk: 'mb.ichi_found' },
    ],
    exits: [{ x: 0, y: 19, w: 1, h: 2, to: 'mb.exchange', tx: 54, ty: 30, dir: 'left' }],
    spawn: { default: [1, 19, 'right'], from_exchange: [1, 19, 'right'] },
  });

  // ---- interiors ---------------------------------------------------------------------------------------------------
  function interior(id, name, w, h, doorX, back, extra) {
    C.maps[id] = Object.assign({
      name, region: 'interior', music: null, noTravel: true, travelKind: 'interior', edition: 2,
      terrain: K.room(w, h, '_', doorX),
      props: [], npcs: [],
      exits: [{ x: doorX, y: h - 1, to: 'mb.exchange', tx: back[0], ty: back[1], dir: 'down' }],
      spawn: { default: [doorX, h - 2, 'up'] },
    }, extra);
  }
  // the Tally Exchange (札場): the boards where offers are posted, Sen's desk, the floor of the hall
  interior('mb.tally', T('The Tally Exchange', '{札場|ふだば}'), 17, 11, 8, [10, 9], {
    terrain: K.build(17, 11, '#', (k) => { k.rect(1, 2, 15, 8, '+'); k.set(8, 10, '+'); k.rect(5, 5, 7, 3, 'm'); }),
    props: [
      { p: 'exitmat', x: 8, y: 9 },
      { p: 'noticeboard', x: 2, y: 2, scene: 'mb.board_rice' }, { p: 'noticeboard', x: 5, y: 2, scene: 'mb.board_fish' },
      { p: 'noticeboard', x: 11, y: 2, scene: 'mb.board_passage' }, { p: 'noticeboard', x: 14, y: 2, scene: 'mb.board_lost' },
      { p: 'counter', x: 7, y: 3, across: true }, { p: 'bookpile', x: 9, y: 2, scene: 'mb.offers' },
      { p: 'bench', x: 2, y: 7 }, { p: 'bench', x: 14, y: 7 }, { p: 'lantern', x: 1, y: 4, o: { lit: true } }, { p: 'lantern', x: 15, y: 4, o: { lit: true } },
    ],
    npcs: [
      { id: 'mb_sen', x: 8, y: 2, dir: 'down', talk: [
        { if: 'quest.mb_census=1', scene: 'mb.census_done' },
        { if: 'mb1_done', scene: 'mb.sen_after' },
        { if: 'quest.mb_main=2&!mb_dispute_done', scene: 'mb.sen_dispute' },
        { if: 'quest.mb_main>=3', scene: 'mb.sen_census' },
        { scene: 'mb.sen_first' }] },
      { id: 'mb_fujiko', x: 4, y: 6, dir: 'right', if: 'quest.mb_main=2&!mb_dispute_done', talk: 'mb.fujiko_tally' },
      { id: 'mb_heiji', x: 12, y: 6, dir: 'left', if: 'quest.mb_main=2&!mb_dispute_done', talk: 'mb.heiji_tally' },
    ],
  });
  // Fujiya (藤屋): a trading house's shop front, its goods, and the grandfather's tally book
  interior('mb.fujiya', T('Fujiya', '{藤屋|ふじや}'), 13, 9, 6, [39, 8], {
    props: [
      { p: 'exitmat', x: 6, y: 7 },
      { p: 'counter', x: 5, y: 3, across: true }, { p: 'shelf', x: 1, y: 2 }, { p: 'shelf', x: 2, y: 2 }, { p: 'shelf', x: 10, y: 2 }, { p: 'shelf', x: 11, y: 2 },
      { p: 'lf_floursacks', x: 1, y: 6 }, { p: 'crate', x: 11, y: 6 }, { p: 'barrel', x: 10, y: 6 },
      { p: 'desk', x: 8, y: 4, scene: 'mb.fujiya_tallybook' },
      { p: 'sign', x: 4, y: 2, scene: 'mb.fujiya_scroll' },
    ],
    npcs: [{ id: 'mb_fujiko', x: 6, y: 2, dir: 'down', if: 'quest.mb_main!=2|mb_dispute_done', talk: [
      { if: 'mb1_done', scene: 'mb.fujiko_after' },
      { if: 'quest.mb_main=0', scene: 'mb.fujiko_first' },
      { if: 'quest.mb_main=1', scene: 'mb.fujiko_route' },
      { if: 'quest.mb_main=2', scene: 'mb.fujiko_tallygo' },
      { scene: 'mb.fujiko_idle' }] }],
  });
  // the porters' office: the canal table where barges are sent
  interior('mb.porters', T('The Porters\' Office', '{荷運|にはこ}び{屋|や}'), 13, 9, 6, [49, 7], {
    props: [
      { p: 'exitmat', x: 6, y: 7 },
      { p: 'mb_canaltable', x: 5, y: 3, scene: 'mb.route_table' },
      { p: 'sign', x: 2, y: 2, scene: 'mb.porters_rules' }, { p: 'shelf', x: 10, y: 2 }, { p: 'crate', x: 1, y: 6 }, { p: 'crate', x: 2, y: 6 },
      { p: 'barrel', x: 11, y: 6 }, { p: 'bench', x: 9, y: 6 },
    ],
    npcs: [{ id: 'mb_take', char: 'mb_take', x: 9, y: 3, dir: 'left', if: '!mb1_done', talk: 'mb.porters_take' }],
  });
  // the inn, 川屋 (Kawaya)
  interior('mb.inn', T('Kawaya', '{川屋|かわや}'), 13, 10, 6, [7, 31], {
    terrain: K.build(13, 10, '#', (k) => { k.rect(1, 2, 11, 7, '_'); k.set(6, 9, '_'); k.rect(1, 2, 4, 2, 'm'); }),
    props: [
      { p: 'exitmat', x: 6, y: 8 },
      { p: 'counter', x: 8, y: 4, across: true }, { p: 'stove', x: 10, y: 2 }, { p: 'pot', x: 11, y: 2 },
      { p: 'table', x: 2, y: 6, scene: 'mb.inn_table' }, { p: 'chair', x: 1, y: 6 }, { p: 'chair', x: 4, y: 6 },
      { p: 'stairs', x: 11, y: 6, scene: 'mb.inn_stairs' }, { p: 'sign', x: 7, y: 2, scene: 'mb.inn_menu' },
    ],
    npcs: [{ id: 'mb_uno', x: 9, y: 3, dir: 'down', talk: [{ if: 'quest.mb_main=4&!mb_night', scene: 'mb.uno_evening' }, { scene: 'mb.uno_rest' }] }],
  });
  // the dead-letter office, under the Exchange: letters nobody could deliver
  interior('mb.deadletter', T('The Dead-Letter Office', '{宛先不明|あてさきふめい}の{手紙|てがみ}'), 11, 9, 5, [20, 8], {
    terrain: K.build(11, 9, '#', (k) => { k.rect(1, 2, 9, 6, '+'); k.set(5, 8, '+'); }),
    ambient: { dark: 0.3, playerLight: 40 },
    props: [
      { p: 'exitmat', x: 5, y: 7 },
      { p: 'sg_drawers', x: 1, y: 2 }, { p: 'sg_drawers', x: 7, y: 2 }, { p: 'sb_mailshelf', x: 4, y: 2 },
      { p: 'desk', x: 6, y: 4, scene: 'mb.deadletter_desk' }, { p: 'lantern', x: 9, y: 5, o: { lit: true } }, { p: 'bookpile', x: 1, y: 6 },
    ],
    npcs: [{ id: 'mb_yoshi', x: 5, y: 4, dir: 'down', talk: [{ if: 'quest.mb_main>=3&!mb_ev_letter', scene: 'mb.yoshi_letter' }, { scene: 'mb.yoshi_idle' }] }],
  });
  // the lock-keeper's house: Matsu, her lamps, and the stair down to the lock
  interior('mb.lockhouse', T('The Lock-Keeper\'s House', '{閘門番|こうもんばん} の {家|いえ}'), 11, 9, 5, [52, 16], {
    terrain: K.build(11, 9, '#', (k) => { k.rect(1, 2, 9, 6, '+'); k.set(5, 8, '+'); k.rect(1, 2, 3, 2, 'm'); }),
    props: [
      { p: 'exitmat', x: 5, y: 7 },
      { p: 'stove', x: 8, y: 2 }, { p: 'shelf', x: 6, y: 2 }, { p: 'lantern', x: 1, y: 5, o: { lit: true } }, { p: 'lantern', x: 9, y: 5, o: { lit: true } },
      { p: 'sg_hatch', x: 8, y: 6, scene: 'mb.hatch_closed', if: '!mb_passage' },
      { p: 'stairs', x: 8, y: 6, scene: 'mb.under_go', if: 'mb_passage' },
      { p: 'sign', x: 2, y: 4, scene: 'mb.lock_rules' },
    ],
    npcs: [{ id: 'mb_matsu', x: 5, y: 3, dir: 'down', talk: [
      { if: 'mb1_done', scene: 'mb.matsu_after' },
      { if: 'mb_passage', scene: 'mb.matsu_passage' },
      { if: 'quest.mb_main>=5', scene: 'mb.matsu_negotiate' },
      { scene: 'mb.matsu_first' }] }],
  });
})(RB.content, RB.mapkit);
