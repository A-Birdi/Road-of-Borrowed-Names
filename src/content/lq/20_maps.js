/* The long quest lines: the side area Koharuno (reached from Reedwake's far
 * bank once its name is written again), and every hook into earlier
 * chapters' maps. Each hook adds to a map defined earlier (this directory
 * loads after ch1–ch6); none rewrites an existing scene.
 *
 * People and where the story keeps them (never two places at once):
 *   Chigusa  sb.road (her stall)   until found & the Snowbell road is open, and again once the quest is done
 *            rw.tea                found & ch4_done & fare not yet paid
 *            sg.inn                fare paid & quest not yet done
 *   Kayo     lf.gardens            until she decides to go home (lq_kayo_going)
 *            lq.koharu             from then on
 *   Yasu     rw.village pier       except while he waits by the lantern (lq_road stage 4)
 */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const npc = (map, id) => (C.maps[map].npcs || []).find((n) => n.id === id);
  // put talk options first (the first matching option is the one that runs)
  const talkFirst = (map, id, opts) => { const n = npc(map, id); if (n) n.talk = opts.concat(Array.isArray(n.talk) ? n.talk : [{ scene: n.talk }]); };
  const addProps = (map, props) => { C.maps[map].props = (C.maps[map].props || []).concat(props); };
  const addNpcs = (map, list) => { C.maps[map].npcs = (C.maps[map].npcs || []).concat(list); };
  const setTiles = (map, cells) => {
    const rows = C.maps[map].terrain.slice();
    for (const [x, y, ch] of cells) rows[y] = rows[y].slice(0, x) + ch + rows[y].slice(x + 1);
    C.maps[map].terrain = rows;
  };

  // ---- Koharuno ----------------------------------------------------------------------------
  C.maps['lq.koharu'] = {
    name: T('Koharuno', '{小春野|こはるの}'), region: 'reedwake', music: 'quiet_road',
    ambient: { weather: 'leaves', tint: 'rgba(255,190,120,0.05)' },
    terrain: K.build(36, 24, '.', (k) => {
      k.ragged('top', 'T', 3, 611).ragged('bottom', 'T', 3, 612).ragged('right', 'T', 3, 613).ragged('left', 'T', 2, 614);
      // the side stream, with reeds on both banks
      k.rect(10, 0, 2, 24, '~');
      k.vline(9, 0, 23, '"').vline(12, 0, 23, '"');
      // fields gone back to grass, and flowers
      k.scatter(';', 46, 621, [13, 3, 20, 18], '.');
      k.scatter(',', 30, 622, [2, 3, 32, 18], '.;');
      k.scatter('o', 7, 624, [2, 3, 6, 18], '.,;');
      // wild persimmon saplings to the east, grown from fallen fruit
      k.scatter('O', 5, 623, [29, 3, 4, 6], '.,;');
      // the road in from the ferry, and a plank bridge over the stream
      k.path([[0, 11], [31, 11]], ':', 2);
      k.hline(9, 12, 11, 'b', 2);
      k.path([[17, 8], [17, 10]], ':', 1);
      k.path([[26, 8], [26, 10]], ':', 1);
      k.path([[29, 13], [29, 17]], ':', 1).path([[28, 17], [29, 17]], ':', 1);
      // old fence lines by the fields
      k.hline(14, 19, 20, 'f').hline(22, 25, 20, 'f');
    }),
    structs: [
      // Yasu and Mitsu's house
      { type: 'house', x: 15, y: 5, w: 5, h: 3, roof: 'thatch', wall: 'wood', door: 2, windows: [0, 4],
        shut: T('Two names are carved into the doorpost: "Yasu" and "Mitsu". The door has swollen shut.', '{戸口|とぐち} の {柱|はしら} に 、 {名前|なまえ} が {二|ふた}つ {彫|ほ}って ある 。 「ヤス」 「ミツ」 。 {戸|と} は {膨|ふく}らんで {開|あ}かない 。') },
      { type: 'house', x: 24, y: 5, w: 5, h: 3, roof: 'thatch', wall: 'wood', door: 2, windows: [0, 4],
        shut: T('The roof has fallen in. You can\'t go inside.', '{屋根|やね} が {落|お}ちて いて 、 {中|なか} に は {入|はい}れない 。') },
      { type: 'house', x: 15, y: 15, w: 5, h: 3, roof: 'thatch', door: 2, windows: [0, 4],
        shut: T('A fallen beam blocks the door.', '{倒|たお}れた {梁|はり} が 、 {戸|と} を {塞|ふさ}いで いる 。') },
      // the tree-keeper's hut
      { type: 'house', x: 27, y: 14, w: 4, h: 3, roof: 'thatch', wall: 'wood', door: 1, windows: [3], to: 'lq.koharu_hut', spawn: [4, 6] },
    ],
    props: [
      { p: 'lantern', x: 3, y: 10, o: { lit: true }, scene: 'lq.kh_lantern' },
      { p: 'stone_marker', x: 5, y: 13, scene: 'lq.kh_marker' },
      { p: 'lq_kaki', x: 20, y: 7, scene: 'lq.kh_tree' },
      { p: 'lq_namestone', x: 21, y: 14, scene: 'lq.kh_stone' },
      { p: 'well', x: 23, y: 16, scene: 'lq.kh_well' },
      { p: 'bench', x: 31, y: 9, scene: 'lq.kh_view' },
      { p: 'deadtree', x: 7, y: 16 }, { p: 'stump', x: 14, y: 13 }, { p: 'crate', x: 30, y: 17 },
    ],
    npcs: [
      { id: 'lq_kayo', x: 21, y: 9, dir: 'up', if: 'lq_kayo_going', talk: [
        { if: 'quest.lq_road=done&post', scene: 'lq.kayo_home_post' },
        { if: 'quest.lq_road=done', scene: 'lq.kayo_home' },
        { scene: 'lq.road_home' }] },
    ],
    exits: [{ x: 0, y: 11, w: 1, h: 2, to: 'rw.village', tx: 48, ty: 18, dir: 'left' }],
    onEnter: [{ scene: 'lq.kh_arrive', if: '!lq_kh_seen' }],
    spawn: { default: [2, 11, 'right'], from_reedwake: [2, 11, 'right'] },
  };
  C.maps['lq.koharu_hut'] = {
    name: T('The Tree-Keeper\'s Hut', '{木守|きもり} の {小屋|こや}'), region: 'interior', music: null, noTravel: true,
    ambient: { dark: 0.25 },
    terrain: K.room(9, 8, '_', 4),
    props: [
      { p: 'exitmat', x: 4, y: 6 },
      { p: 'table', x: 1, y: 3, scene: 'lq.kh_book' },
      { p: 'chest', x: 6, y: 2, scene: 'lq.kh_chest', if: '!lq_kh_chest' },
      { p: 'chest', x: 6, y: 2, o: { open: true }, if: 'lq_kh_chest', text: T('The chest is empty now, apart from the smell of old persimmons.', '{箱|はこ} は もう {空|から} だ 。 {古|ふる}い {柿|かき} の {匂|にお}い だけ が {残|のこ}って いる 。') },
      { p: 'shelf', x: 7, y: 2, text: T('Rows of empty jars, and strings of persimmons dried to leather long ago.', '{空|から} の {瓶|びん} が {並|なら}んで いる 。 ずっと {昔|むかし} に {干|ほ}された {柿|かき} が 、 {革|かわ} の よう に なって {下|さ}がって いる 。') },
      { p: 'crate', x: 7, y: 5 }, { p: 'pot', x: 1, y: 5 },
    ],
    npcs: [],
    exits: [{ x: 4, y: 7, to: 'lq.koharu', tx: 28, ty: 17, dir: 'down' }],
    spawn: { default: [4, 6, 'up'] },
  };
  C.banter.push(
    { comp: 'nao', map: 'lq.koharu', scene: 'lq.b_nao' }, { comp: 'mio', map: 'lq.koharu', scene: 'lq.b_mio' },
    { comp: 'ren', map: 'lq.koharu', scene: 'lq.b_ren' }, { comp: 'suzu', map: 'lq.koharu', scene: 'lq.b_suzu' });

  // ---- Reedwake: the far bank's lost path, the ferry book, the teahouse, the pier ------------------
  // a path east from the ferry house through the trees, a blank lantern and
  // the lower half of a broken waymarker
  setTiles('rw.village', [[46, 18, ':'], [47, 18, ':'], [48, 18, ':'], [49, 18, ':'], [46, 19, ':'], [47, 19, ':'], [48, 19, ':'], [49, 19, ':'], [48, 17, '.'], [48, 20, '.']]);
  addProps('rw.village', [
    { p: 'deadlantern', x: 48, y: 17, scene: 'lq.road_lantern', if: '!lq_road_open' },
    { p: 'lantern', x: 48, y: 17, scene: 'lq.road_lantern_lit', if: 'lq_road_open' },
    { p: 'stone_marker', x: 48, y: 20, scene: 'lq.road_marker' },
  ]);
  C.maps['rw.village'].exits.push({ x: 49, y: 18, w: 1, h: 2, to: 'lq.koharu', sp: 'from_reedwake', dir: 'right', if: 'lq_road_open' });
  C.maps['rw.village'].triggers.push({ x: 49, y: 18, w: 1, h: 2, scene: 'lq.road_loops', if: '!lq_road_open' });
  // Old Yasu leaves the pier only to wait by the lantern while the name is written
  const yasu = npc('rw.village', 'yasu');
  yasu.if = '!quest.lq_road=4';
  talkFirst('rw.village', 'yasu', [
    { if: 'quest.lq_road=0', scene: 'lq.road_yasu1' },
    { if: 'quest.lq_road=3', scene: 'lq.road_yasu2' },
    { if: 'quest.lq_road=done&!seen.lq.road_yasu_after', scene: 'lq.road_yasu_after' },
  ]);
  addNpcs('rw.village', [{ id: 'yasu_bank', char: 'yasu', x: 47, y: 18, dir: 'up', if: 'quest.lq_road=4', talk: 'lq.road_yasu_bank' }]);
  // the fare book in Kōji's ferry house
  addProps('rw.ferry', [{ p: 'bookpile', x: 6, y: 2, scene: 'lq.fare_book' }]);
  // Kōji at the teahouse; Chigusa comes here to pay
  talkFirst('rw.tea', 'koji', [
    { if: 'quest.lq_fare=4&lq_fare_found&ch4_done&!lq_fare_paid', scene: 'lq.fare_pay' },
    { if: '!quest.lq_fare', scene: 'lq.fare_koji' },
    { if: 'quest.lq_fare=0', scene: 'lq.fare_koji_wait' },
    { if: 'quest.lq_fare=done&!seen.lq.fare_koji_after', scene: 'lq.fare_koji_after' },
  ]);
  addNpcs('rw.tea', [{ id: 'lq_chigusa', x: 6, y: 4, dir: 'down', if: 'lq_fare_found&ch4_done&!lq_fare_paid', talk: 'lq.fare_pay' }]);

  // ---- Saltglass: Tamae at the Gull, Tetsu at the ferry ---------------------------------------------
  talkFirst('sg.inn', 'tamae', [
    { if: 'lq_fare_paid&!quest.lq_fare=done', scene: 'lq.fare_gull' },
    { if: 'quest.lq_fare=1&quest.sg_main>=2', scene: 'lq.fare_tamae' },
    { if: 'quest.lq_fare=done&!seen.lq.fare_tamae_after', scene: 'lq.fare_tamae_after' },
  ]);
  addNpcs('sg.inn', [{ id: 'lq_chigusa', x: 6, y: 4, dir: 'right', if: 'lq_fare_paid&!quest.lq_fare=done', talk: 'lq.fare_gull' }]);
  talkFirst('sg.harbor', 'tetsu', [{ if: 'sg_boss_done&quest.lq_road<=1&!lq_road_tetsu', scene: 'lq.road_tetsu' }]);

  // ---- Cinder Orchard: Fusa at the inn, Grandma Ume on the terraces --------------------------------
  // (never in place of a main-story conversation: Fusa's evening scene and
  // Ume's part in the chronicle come first)
  const F = 'quest.lq_fare=2';
  talkFirst('co.inn', 'co_fusa', [{ if: F + '&quest.co_main<8|' + F + '&co_restored|' + F + '&ch3_done', scene: 'lq.fare_fusa' }]);
  const U = 'quest.lq_road>=1&quest.lq_road<=2&!lq_road_name';
  talkFirst('co.terraces', 'co_ume', [{ if: U + '&!co_chronicle_read|' + U + '&co_hist_ume|' + U + '&ch3_done', scene: 'lq.road_ume' }]);

  // ---- The Snowbell road: Chigusa's stall --------------------------------------------------------------
  addProps('sb.road', [
    { p: 'lq_teastall', x: 9, y: 10, scene: 'lq.stall' },
    { p: 'campfire', x: 12, y: 10, if: '!lq_fare_found|!ch4_done|quest.lq_fare=done' },
    { p: 'bench', x: 12, y: 12 },
    { p: 'sign', x: 8, y: 11, scene: 'lq.stall_note', if: 'lq_fare_found&ch4_done&!quest.lq_fare=done' },
  ]);
  addNpcs('sb.road', [{ id: 'lq_chigusa', x: 11, y: 11, dir: 'down', if: '!lq_fare_found|!ch4_done|quest.lq_fare=done', talk: [
    { if: 'quest.lq_fare=done&post', scene: 'lq.chigusa_post' },
    { if: 'quest.lq_fare=done', scene: 'lq.chigusa_after' },
    { if: 'quest.lq_fare>=2&quest.lq_fare<=3', scene: 'lq.fare_chigusa' },
    { if: 'quest.lq_fare=4', scene: 'lq.chigusa_wait' },
    { scene: 'lq.chigusa_idle' }] }]);

  // ---- Lanternfall: Kayo and her tree in the Garden Quarter -----------------------------------------
  addProps('lf.gardens', [{ p: 'lq_kaki_young', x: 31, y: 12, scene: 'lq.kayo_tree' }]);
  addNpcs('lf.gardens', [{ id: 'lq_kayo', x: 30, y: 12, dir: 'right', if: '!lq_kayo_going', talk: [
    { if: 'quest.lq_road>=6&lf_bell_rung', scene: 'lq.road_kayo' },
    { if: 'quest.lq_road>=6', scene: 'lq.road_kayo_certainly' },
    { if: 'lf_bell_rung', scene: 'lq.kayo_idle_after' },
    { scene: 'lq.kayo_idle' }] }]);

  // ---- letters from home: for players who left Reedwake without hearing of
  // either line (and saves made before these lines existed), the news
  // catches up with them in the next town they enter ------------------------------------------------
  const LETTERS = 'ch2_done&!lq_letters&!quest.lq_fare|ch2_done&!lq_letters&!quest.lq_road';
  for (const m of ['sg.harbor', 'co.village', 'sb.hamlet', 'lf.town', 'sa.camp']) {
    C.maps[m].onEnter = (C.maps[m].onEnter || []).concat([{ scene: 'lq.letters_home', if: LETTERS }]);
  }
})(RB.content, RB.mapkit);
