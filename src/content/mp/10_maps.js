/* Manybridge, Chapter 4: the maps (expansion P09; docs/future/work/P09_MANYBRIDGE2.md). Blockprint Row up the Cross
 * Canal (the printers: Sōbē's workshop, the press room, the drying racks, the courier guild), Playhouse Row beside it
 * on the Long Canal's upper reach (the theatre, its stage door, the festival committee, the bank where the Opening of
 * the River is held), and their interiors. The Understage is in 11_under.js. Twelve-chapter journeys only
 * (`edition: 2`); the way up from the Exchange district opens with Chapter 3's end.
 *
 * The festival changes Playhouse Row: what the preparations decided (the lantern line, the stalls) stands on the bank
 * from then on, lit on the festival night (flags mp_lan_*, mp_st_*, mp_fest_night). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const CITY = { region: 'manybridge', music: 'manybridge', edition: 2 };
  const plaque = (id, x, y) => ({ p: 'mb_plaque', x, y, scene: 'mp.plaque_' + id, o: { bridge: id } });

  // ---- the way up from the Exchange district -----------------------------------------------------------------------
  C.maps['mb.exchange'].exits.push({ x: 34, y: 0, w: 2, h: 1, to: 'mp.blockprint', tx: 22, ty: 30, dir: 'up', if: 'mb1_done' });
  C.maps['mb.exchange'].spawn.from_blockprint = [34, 1, 'down'];

  // ---- Blockprint Row (版木の通り) -----------------------------------------------------------------------------------
  C.maps['mp.blockprint'] = Object.assign({}, CITY, {
    name: T('Blockprint Row', '{版木|はんぎ} の {通|とお}り'),
    ambient: { weather: null },
    terrain: K.build(44, 32, '=', (k) => {
      k.rect(18, 0, 3, 32, '~');         // the Cross Canal, upstream
      k.rect(18, 9, 3, 2, 'b');          // the Woodblock Bridge (版木橋)
      k.rect(18, 22, 3, 2, 'b');         // the Ink Bridge (墨橋)
      for (const [x, y] of [[16, 2], [22, 15], [16, 28], [42, 9], [1, 10], [36, 28]]) k.set(x, y, 'T');
      k.scatter(',', 5, 911, [22, 16, 20, 5], '=');
    }),
    structs: [
      { type: 'house', x: 2, y: 2, w: 9, h: 5, roof: 'tile', door: 4, windows: [1, 2, 6, 7], to: 'mp.workshop', spawn: [6, 7], lit: true, sign: true, signX: 2 },
      { type: 'house', x: 11, y: 3, w: 5, h: 4, roof: 'tile', door: null },
      { type: 'house', x: 2, y: 12, w: 8, h: 4, roof: 'tile', wall: 'wood', door: 3, windows: [1, 6], to: 'mp.pressroom', spawn: [5, 7], lit: true },
      { type: 'house', x: 10, y: 25, w: 6, h: 4, roof: 'tile', wall: 'wood', door: 2, windows: [0, 4], to: 'mp.blockprint', locked: 'mp.door_sanpei' },
      { type: 'house', x: 26, y: 2, w: 10, h: 5, roof: 'slate', door: 5, windows: [1, 2, 7, 8], to: 'mp.guild', spawn: [6, 7], lit: true, sign: true, signX: 2 },
      { type: 'house', x: 37, y: 3, w: 6, h: 4, roof: 'tile', door: null },
      { type: 'house', x: 30, y: 22, w: 7, h: 4, roof: 'tile', door: null },
      { type: 'house', x: 38, y: 22, w: 5, h: 4, roof: 'tile', wall: 'wood', door: 2, to: 'mp.blockprint', locked: 'mp.door_locked' },
    ],
    props: [
      plaque('hangi', 17, 8), plaque('sumi', 21, 21),
      // the drying racks: printed sheets hung on lines (the racks Sōbē's blank sheets come off)
      { p: 'laundry', x: 3, y: 19 }, { p: 'laundry', x: 8, y: 19 }, { p: 'laundry', x: 12, y: 19 }, { p: 'laundry', x: 3, y: 22 }, { p: 'laundry', x: 8, y: 22 },
      { p: 'noticeboard', x: 11, y: 13, scene: 'mp.pressboard' },
      // the tonic seller's playbill on the guild's side of the canal
      { p: 'noticeboard', x: 24, y: 11, scene: 'mp.tonic_bill' },
      { p: 'sign', x: 23, y: 28, scene: 'mp.sign_blockprint' },
      { p: 'mb_barge', x: 18, y: 4 },
      { p: 'lantern', x: 17, y: 11, o: { lit: true } }, { p: 'lantern', x: 21, y: 8, o: { lit: true } }, { p: 'lantern', x: 21, y: 24, o: { lit: true } },
      { p: 'crate', x: 12, y: 8 }, { p: 'crate', x: 13, y: 8 }, { p: 'barrel', x: 36, y: 8 }, { p: 'bench', x: 24, y: 17 },
      { p: 'flowerpot', x: 25, y: 7 }, { p: 'mailbox', x: 33, y: 8, scene: 'mp.guild_box' },
    ],
    npcs: [
      { id: 'mp_sanpei', x: 7, y: 8, dir: 'down', if: '!mp_sobe_met', talk: 'mp.sanpei_first' },
      { id: 'mp_kakeru', x: 30, y: 9, dir: 'left', talk: [{ if: 'mb2_done', scene: 'mp.kakeru_after' }, { scene: 'mp.kakeru' }] },
      { id: 'mp_tokube', x: 26, y: 12, dir: 'left', if: '!mb2_done', talk: 'mp.tokube' },
      { id: 'mp_miyo', x: 13, y: 29, dir: 'up', if: 'mp_sobe_met', talk: [{ if: 'quest.mp_apprentice=done', scene: 'mp.miyo_after' }, { if: 'quest.mp_apprentice=1', scene: 'mp.miyo_teach' }, { scene: 'mp.miyo_first' }] },
    ],
    exits: [
      { x: 22, y: 31, w: 2, h: 1, to: 'mb.exchange', tx: 34, ty: 1, dir: 'down' },
      { x: 43, y: 15, w: 1, h: 2, to: 'mp.playhouse', tx: 1, ty: 12, dir: 'right' },
    ],
    onEnter: [{ scene: 'mp.arrive', if: '!mp_arrived' }],
    spawn: { default: [22, 30, 'up'], from_exchange: [22, 30, 'up'], from_playhouse: [42, 15, 'left'] },
  });

  // ---- Playhouse Row (芝居の通り) -----------------------------------------------------------------------------------
  const night = { ambient: { dark: 0.5, tint: 'rgba(60,40,110,0.18)', playerLight: 48 }, night: true };
  const fireworks = { ambient: { dark: 0.46, tint: 'rgba(70,40,110,0.16)', playerLight: 48, weather: 'fireworks' }, night: true };
  C.maps['mp.playhouse'] = Object.assign({}, CITY, {
    name: T('Playhouse Row', '{芝居|しばい} の {通|とお}り'),
    music: 'playhouse',
    ambient: { weather: null },
    alt: [Object.assign({ if: 'mp_fireworks&mp_fest_night&!mb2_done' }, fireworks), Object.assign({ if: 'mp_fest_night&!mb2_done' }, night)],
    terrain: K.build(52, 34, '=', (k) => {
      k.rect(0, 22, 52, 4, '+');         // the bank where the festival is held
      k.rect(0, 26, 52, 3, '~');         // the Long Canal's upper reach
      k.rect(24, 26, 2, 3, 'B');         // the Curtain Bridge (幕橋)
      for (const [x, y] of [[2, 3], [12, 13], [34, 12], [48, 9], [20, 31], [44, 31]]) k.set(x, y, 'T');
      k.scatter(',', 5, 921, [0, 29, 52, 5], '=');
    }),
    structs: [
      { type: 'house', x: 14, y: 2, w: 18, h: 9, roof: 'tile', door: 9, windows: [2, 3, 5, 12, 14, 15], to: 'mp.theatre', spawn: [10, 13], lit: true, sign: true, signX: 4 },
      { type: 'house', x: 36, y: 3, w: 8, h: 4, roof: 'tile', door: 3, windows: [1, 6], to: 'mp.committee', spawn: [5, 6], lit: true, sign: true, signX: 1 },
      { type: 'house', x: 3, y: 14, w: 8, h: 4, roof: 'tile', wall: 'wood', door: 4, windows: [1, 6], to: 'mp.tenement', spawn: [4, 6] },
      { type: 'house', x: 40, y: 14, w: 8, h: 4, roof: 'tile', door: 4, windows: [1, 2, 5, 6], to: 'mp.playhouse', locked: 'mp.door_ryusui' },
      { type: 'house', x: 4, y: 29, w: 6, h: 3, roof: 'tile', door: null },
      { type: 'house', x: 32, y: 29, w: 7, h: 3, roof: 'tile', door: 3, windows: [1, 5], to: 'mp.festhall', spawn: [7, 7], locked: 'mp.door_festhall', unlock: 'mb2_done', lit: true },
    ],
    props: [
      plaque('maku', 23, 25),
      // the theatre's banners, and its stage door round the side
      { p: 'mp_nobori', x: 15, y: 11 }, { p: 'mp_nobori', x: 19, y: 11, o: { col: 'indigo' } }, { p: 'mp_nobori', x: 27, y: 11, o: { col: 'indigo' } }, { p: 'mp_nobori', x: 31, y: 11 },
      { p: 'door', x: 32, y: 8, scene: 'mp.stagedoor' },
      { p: 'noticeboard', x: 34, y: 10, scene: 'mp.pp_board' },
      { p: 'sign', x: 2, y: 11, scene: 'mp.sign_playhouse' },
      { p: 'lantern', x: 6, y: 22, o: { lit: true } }, { p: 'lantern', x: 20, y: 22, o: { lit: true } }, { p: 'lantern', x: 30, y: 22, o: { lit: true } }, { p: 'lantern', x: 44, y: 22, o: { lit: true } },
      { p: 'bench', x: 9, y: 23 }, { p: 'bench', x: 38, y: 23 }, { p: 'well', x: 26, y: 15 },
      // the festival as the preparations made it (flags set by the committee's tasks)
      { p: 'mp_lanterns', x: 2, y: 22, if: 'mp_lan_bank', o: { lit: true } }, { p: 'mp_lanterns', x: 12, y: 22, if: 'mp_lan_bank', o: { lit: true } }, { p: 'mp_lanterns', x: 33, y: 22, if: 'mp_lan_bank', o: { lit: true } }, { p: 'mp_lanterns', x: 46, y: 22, if: 'mp_lan_bank', o: { lit: true } },
      { p: 'mp_lanterns', x: 16, y: 12, if: 'mp_lan_theatre', o: { lit: true } }, { p: 'mp_lanterns', x: 28, y: 12, if: 'mp_lan_theatre', o: { lit: true } },
      { p: 'mp_lanterns', x: 22, y: 25, if: 'mp_lan_bridge', o: { lit: true } },
      { p: 'mb_noodle', x: 14, y: 23, if: 'mp_st_bank', scene: 'mp.fest_stall_masa', o: { shop: 'masa' } }, { p: 'mb_noodle', x: 40, y: 23, if: 'mp_st_bank', scene: 'mp.fest_stall_masu', o: { shop: 'masu' } },
      { p: 'mb_noodle', x: 16, y: 16, if: 'mp_st_square', scene: 'mp.fest_stall_masa', o: { shop: 'masa' } }, { p: 'mb_noodle', x: 30, y: 16, if: 'mp_st_square', scene: 'mp.fest_stall_masu', o: { shop: 'masu' } },
      { p: 'mb_barge', x: 4, y: 26, if: 'mp_fest_night&!mb2_done' }, { p: 'mb_barge', x: 30, y: 26, if: 'mp_fest_night&!mb2_done' },
      // the festival's games on the night (then in the festival hall, south of the canal)
      { p: 'mp_booth', x: 15, y: 19, if: 'mp_fest_night&!mb2_done', scene: 'mp.booth_yoyo', o: { game: 'yoyo' } },
      { p: 'mp_booth', x: 19, y: 19, if: 'mp_fest_night&!mb2_done', scene: 'mp.booth_wanage', o: { game: 'wanage' } },
      { p: 'mp_booth', x: 31, y: 19, if: 'mp_fest_night&!mb2_done', scene: 'mp.booth_katanuki', o: { game: 'katanuki' } },
      { p: 'mp_booth', x: 35, y: 19, if: 'mp_fest_night&!mb2_done', scene: 'mp.booth_kuji', o: { game: 'kuji' } },
      { p: 'mp_booth', x: 44, y: 19, if: 'mp_fest_night&!mb2_done', scene: 'mp.booth_taiko', o: { game: 'taiko' } },
      // once the river is open (F-40): the boat up to Reedwake
      { p: 'mb_barge', x: 44, y: 26, if: 'mb2_done', scene: 'mp.river_up' },
    ],
    npcs: [
      { id: 'mp_manbe', x: 22, y: 12, dir: 'down', if: '!mp_rehearsal_done', talk: [{ if: 'quest.mp_main>=2', scene: 'mp.manbe_rehearse' }, { scene: 'mp.manbe_first' }] },
      { id: 'mp_genta', x: 28, y: 14, dir: 'left', talk: [{ if: 'mb2_done', scene: 'mp.genta_after' }, { if: 'mp_theatre_seen&comp!=suzu', scene: 'mp.genta_act' }, { scene: 'mp.genta' }] },
      { id: 'mp_hayashi', x: 12, y: 20, dir: 'down', talk: 'mp.hayashi' },
      { id: 'mp_tomi', x: 40, y: 8, dir: 'down', if: 'quest.mp_main<4', talk: 'mp.tomi_first' },
      // the festival night: Tomi at the foot of the Curtain Bridge, Matsu if she was asked
      { id: 'mp_tomi_n', char: 'mp_tomi', x: 26, y: 23, dir: 'down', if: 'mp_fest_night&!mb2_done', talk: 'mp.fest_tomi_night' },
      { id: 'mb_matsu_f', char: 'mb_matsu', x: 8, y: 24, dir: 'down', if: 'mp_inv_matsu&mp_fest_night&!mb2_done', talk: 'mp.fest_matsu' },
      { id: 'mp_ryusui', x: 45, y: 18, dir: 'down', if: 'quest.mp_ghost>=1&!mp_ghost_exposed', talk: 'mp.ryusui' },
      { id: 'mp_saku', x: 30, y: 23, dir: 'down', if: '!quest.mp_actor=done', talk: [{ if: 'quest.mp_actor>=1', scene: 'mp.saku_rehearse' }, { scene: 'mp.saku_first' }] },
    ],
    exits: [{ x: 0, y: 12, w: 1, h: 2, to: 'mp.blockprint', tx: 42, ty: 15, dir: 'left' }],
    // the wanderers (35_ghost.js): Gonta's barge on the bank; a crowd by the theatre with Hayashi's drum
    foes: [
      { id: 'w1', enemy: 'mp.golem', encounter: 'mp.wander_gonta', x: 9, y: 24, patrol: 1, if: 'mb1_done&!mp_fest_night', bg: 'manybridge',
        intro: { jp: '{版木|はんぎ} で できた {人形|にんぎょう} が 、 {岸|きし} の {荷舟|にぶね} の {上|うえ} に {座|すわ}り{込|こ}んで いる 。', en: 'A figure made of woodblocks has sat itself down on a barge by the bank.' },
        settle: { jp: '{人形|にんぎょう} は ばらばら の {版木|はんぎ} に なって 、 {岸|きし} に {積|つ}み{上|あ}がった 。', en: 'The figure comes apart into a heap of woodblocks on the bank.' } },
      { id: 'w2', enemy: 'mp.moth', encounter: 'mp.wander_hayashi', x: 35, y: 13, patrol: 2, if: 'mp_theatre_seen&!mp_fest_night', bg: 'manybridge',
        intro: { jp: '{芝居小屋|しばいごや} の {前|まえ} で 、 {紙|かみ} の {羽|はね} の {蛾|が} が {番付|ばんづけ} の {字|じ} を {食|た}べて いる 。 {人|ひと} が {集|あつ}まって きた 。', en: 'In front of the theatre, paper-winged moths are eating the letters off the playbills. A crowd is gathering.' },
        settle: { jp: '{蛾|が} は {川風|かわかぜ} に {乗|の}って 、 {屋根|やね} の {上|うえ} へ {飛|と}んで いった 。', en: 'The moths ride the river wind up over the roofs.' } },
    ],
    triggers: [{ x: 0, y: 21, w: 52, h: 1, scene: 'mp.fest_night', if: 'mp_fest_night&!mp_fest_walked' }],
    onEnter: [{ scene: 'mp.playhouse_first', if: '!mp_theatre_seen' }],
    spawn: { default: [1, 12, 'right'], from_blockprint: [1, 12, 'right'], from_theatre: [23, 11, 'down'] },
  });

  // ---- interiors ---------------------------------------------------------------------------------------------------
  function interior(id, name, w, h, doorX, outside, back, extra) {
    C.maps[id] = Object.assign({
      name, region: 'interior', place: 'manybridge', music: null, noTravel: true, travelKind: 'interior', edition: 2,
      terrain: K.room(w, h, '_', doorX),
      props: [], npcs: [],
      exits: [{ x: doorX, y: h - 1, to: outside, tx: back[0], ty: back[1], dir: 'down' }],
      spawn: { default: [doorX, h - 2, 'up'] },
    }, extra);
  }
  // Sōbē's workshop: the racks of blocks going blank, the oldest block in its box
  interior('mp.workshop', T('Sōbē\'s Workshop', '{宗兵衛|そうべえ} の {仕事場|しごとば}'), 13, 9, 6, 'mp.blockprint', [6, 7], {
    props: [
      { p: 'exitmat', x: 6, y: 7 },
      { p: 'mp_typecase', x: 1, y: 2 }, { p: 'mp_typecase', x: 2, y: 2 }, { p: 'shelf', x: 3, y: 2, scene: 'mp.racks' }, { p: 'shelf', x: 9, y: 2, scene: 'mp.racks' }, { p: 'mp_typecase', x: 10, y: 2 }, { p: 'mp_typecase', x: 11, y: 2 },
      { p: 'desk', x: 5, y: 3, scene: 'mp.oldest_block' }, { p: 'ink', x: 8, y: 4 }, { p: 'cs_workbench', x: 1, y: 5 }, { p: 'bookpile', x: 11, y: 6 },
      { p: 'lantern', x: 7, y: 2, o: { lit: true } },
    ],
    npcs: [{ id: 'mp_sobe', x: 6, y: 5, dir: 'down', talk: [
      { if: 'mb2_done', scene: 'mp.sobe_after' },
      { if: 'quest.mp_main=1&press_notice', scene: 'mp.sobe_printed' },
      { if: 'quest.mp_main=1', scene: 'mp.sobe_press' },
      { if: 'quest.mp_main>=2', scene: 'mp.sobe_idle' },
      { scene: 'mp.sobe_first' }] }],
  });
  // the press room: the press itself, the type cases, the ink
  interior('mp.pressroom', T('The Press Room', '{刷|す}り{場|ば}'), 12, 9, 5, 'mp.blockprint', [5, 16], {
    props: [
      { p: 'exitmat', x: 5, y: 7 },
      { p: 'mp_press', x: 4, y: 3, scene: 'mp.press' },
      { p: 'mp_typecase', x: 1, y: 2 }, { p: 'mp_typecase', x: 2, y: 2 }, { p: 'mp_typecase', x: 9, y: 2 }, { p: 'mp_typecase', x: 10, y: 2 },
      { p: 'ink', x: 7, y: 3 }, { p: 'table', x: 8, y: 5, scene: 'mp.press_proofs' }, { p: 'laundry', x: 1, y: 6 },
    ],
    npcs: [{ id: 'mp_sanpei', x: 7, y: 5, dir: 'left', if: 'mp_sobe_met', talk: [{ if: 'mb2_done', scene: 'mp.sanpei_after' }, { scene: 'mp.sanpei_press' }] }],
  });
  // the courier guild hall: the courier board, the letter racks
  interior('mp.guild', T('The Courier Guild', '{飛脚|ひきゃく} の {組合|くみあい}'), 13, 9, 6, 'mp.blockprint', [31, 7], {
    props: [
      { p: 'exitmat', x: 6, y: 7 },
      { p: 'counter', x: 5, y: 3, across: true }, { p: 'sb_mailshelf', x: 1, y: 2 }, { p: 'sb_mailshelf', x: 10, y: 2 },
      { p: 'noticeboard', x: 2, y: 5, scene: 'mp.guild_board' }, { p: 'bench', x: 9, y: 6 }, { p: 'lantern', x: 12, y: 4, o: { lit: true } },
    ],
    npcs: [],
  });
  // the theatre: the stage, the seats, the trap in the stage floor
  interior('mp.theatre', T('The Playhouse', '{芝居小屋|しばいごや}'), 21, 15, 10, 'mp.playhouse', [23, 11], {
    terrain: K.build(21, 15, '#', (k) => { k.rect(1, 2, 19, 12, '_'); k.set(10, 14, '_'); k.rect(2, 2, 17, 4, 'm'); }),
    ambient: { dark: 0.2, playerLight: 40 },
    props: [
      { p: 'exitmat', x: 10, y: 13 },
      // the stage (the matted boards), its trap lift, the seats
      { p: 'mp_lift', x: 9, y: 3, scene: 'mp.trap_closed', if: '!mp_under_open', o: { raised: true } },
      { p: 'mp_lift', x: 9, y: 3, scene: 'mp.under_go', if: 'mp_under_open', o: { raised: false } },
      { p: 'bench', x: 3, y: 8 }, { p: 'bench', x: 6, y: 8 }, { p: 'bench', x: 13, y: 8 }, { p: 'bench', x: 16, y: 8 },
      { p: 'bench', x: 3, y: 10 }, { p: 'bench', x: 6, y: 10 }, { p: 'bench', x: 13, y: 10 }, { p: 'bench', x: 16, y: 10 },
      { p: 'lantern', x: 1, y: 6, o: { lit: true } }, { p: 'lantern', x: 19, y: 6, o: { lit: true } },
      { p: 'mp_nobori', x: 1, y: 2 }, { p: 'mp_nobori', x: 19, y: 2, o: { col: 'indigo' } },
      { p: 'desk', x: 15, y: 12, scene: 'mp.promptbook' },
      { p: 'bookpile', x: 4, y: 12, scene: 'mp.oldest_play' },
    ],
    npcs: [
      { id: 'mp_manbe', x: 10, y: 7, dir: 'down', if: 'mp_rehearsal_done&!mb2_done', talk: [{ if: 'quest.mp_main=5', scene: 'mp.manbe_under' }, { scene: 'mp.manbe_idle' }] },
      { id: 'mp_saku', x: 6, y: 4, dir: 'down', if: 'quest.mp_actor=done', talk: 'mp.saku_after' },
      { id: 'mp_manbe_a', char: 'mp_manbe', x: 10, y: 7, dir: 'down', if: 'mb2_done', talk: 'mp.manbe_after' },
    ],
  });
  // the festival committee: Tomi's table of lists and plans
  interior('mp.committee', T('The Festival Committee', '{祭|まつ}り の {世話役|せわやく}'), 11, 8, 5, 'mp.playhouse', [39, 7], {
    terrain: K.build(11, 8, '#', (k) => { k.rect(1, 2, 9, 5, 'm'); k.set(5, 7, '_'); }),
    props: [
      { p: 'exitmat', x: 5, y: 6 },
      { p: 'table', x: 4, y: 3, scene: 'mp.fest_plans' }, { p: 'bookpile', x: 1, y: 2 }, { p: 'bookpile', x: 9, y: 2 }, { p: 'lantern', x: 9, y: 5, o: { lit: false } },
    ],
    npcs: [{ id: 'mp_tomi', x: 5, y: 2, dir: 'down', if: 'quest.mp_main>=4&!mp_fest_night', talk: 'mp.tomi_tasks' }],
  });
  // the festival hall (after the festival): the stall games kept for the summer, in the committee's storehouse
  interior('mp.festhall', T('The Festival Hall', '{祭|まつ}り の {会所|かいしょ}'), 15, 9, 7, 'mp.playhouse', [35, 32], {
    music: 'festival',
    props: [
      { p: 'exitmat', x: 7, y: 7 },
      { p: 'mp_booth', x: 1, y: 3, scene: 'mp.booth_yoyo', o: { game: 'yoyo' } }, { p: 'mp_booth', x: 6, y: 3, scene: 'mp.booth_wanage', o: { game: 'wanage' } },
      { p: 'mp_booth', x: 11, y: 3, scene: 'mp.booth_katanuki', o: { game: 'katanuki' } },
      { p: 'mp_booth', x: 1, y: 5, scene: 'mp.booth_kuji', o: { game: 'kuji' } }, { p: 'mp_booth', x: 11, y: 5, scene: 'mp.booth_taiko', o: { game: 'taiko' } },
      { p: 'mp_lanterns', x: 6, y: 2, o: { lit: true } },
    ],
    npcs: [{ id: 'mp_tomi_h', char: 'mp_tomi', x: 7, y: 5, dir: 'down', talk: 'mp.tomi_hall' }],
  });
  // Shinobu's room in the tenement: manuscripts everywhere
  interior('mp.tenement', T('Shinobu\'s Room', 'シノブ の {部屋|へや}'), 9, 8, 4, 'mp.playhouse', [7, 18], {
    terrain: K.build(9, 8, '#', (k) => { k.rect(1, 2, 7, 5, 'm'); k.set(4, 7, '_'); }),
    props: [
      { p: 'exitmat', x: 4, y: 6 },
      { p: 'desk', x: 1, y: 2, scene: 'mp.manuscripts' }, { p: 'bookpile', x: 6, y: 2 }, { p: 'bookpile', x: 7, y: 2 }, { p: 'bookpile', x: 7, y: 5 },
    ],
    npcs: [{ id: 'mp_shinobu', x: 4, y: 3, dir: 'down', talk: [{ if: 'quest.mp_ghost=done', scene: 'mp.shinobu_after' }, { if: 'quest.mp_ghost>=1', scene: 'mp.shinobu_evidence' }, { scene: 'mp.shinobu_first' }] }],
  });
})(RB.content, RB.mapkit);
