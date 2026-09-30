/* Chapter 1: mill road, the mill (three floors), and NPC placement. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });

  // ---- the mill road ------------------------------------------------------------------
  // A rocky ridge crosses the road (rows 13-16) from the tree line to the river
  // reeds. It has two ways through, and only two: the echoing narrows (x 6, the
  // road itself, where the voices push back whoever heads for the mill until
  // Suzu's round quiets them) and the animal track behind the reed bed (x 12,
  // closed by reeds until Nao opens it). Either one is enough; both lead back
  // down; nobody is ever held on the mill side (docs/addendum/fieldweave.md).
  C.maps['rw.millroad'] = {
    name: T('The Mill Road', '{水車|すいしゃ}{小屋|ごや} へ の {道|みち}'), region: 'reedwake', music: 'mystery', noTravel: false,
    ambient: { weather: 'motes' },
    terrain: K.build(26, 26, '.', (k) => {
      k.ragged('left', 'T', 3, 41).ragged('top', 'T', 1, 42);
      k.rect(19, 0, 7, 26, '~');
      k.vline(18, 0, 25, '"');
      k.rect(13, 3, 6, 1, '~');
      k.path([[10, 25], [10, 18], [6, 18], [6, 12], [12, 12], [12, 6], [9, 6], [9, 5]], ':', 1);
      k.path([[11, 18], [12, 18], [12, 13]], ';', 1);          // the animal track behind the reeds (Nao's way)
      k.scatter(',', 10, 43, [3, 3, 14, 20], '.');
      k.scatter(';', 12, 44, [3, 3, 14, 20], '.');
      k.scatter('T', 6, 45, [13, 5, 5, 8], '.');
      // the ridge: cliffs everywhere but the narrows (x 6) and the track (x 12)
      k.rect(1, 13, 5, 4, '^').rect(7, 13, 5, 4, '^').rect(13, 13, 5, 4, '^');
      k.set(1, 12, '^').set(2, 12, '^').set(16, 17, '^').set(17, 17, '^').set(3, 17, 'r');
      k.set(10, 25, ':').set(11, 25, ':');
    }),
    structs: [
      { type: 'house', x: 6, y: 1, w: 7, h: 4, roof: 'thatch', wall: 'wood', door: 3, windows: [1, 5], to: 'rw.mill1', spawn: [7, 10] },
      { type: 'house', x: 14, y: 19, w: 3, h: 3, roof: 'thatch', wall: 'wood', door: null, windows: [1] },
    ],
    props: [
      { p: 'millwheel', x: 14, y: 2, o: { still: true }, if: '!rw_echo_done', scene: 'rw.mr_wheel' },
      { p: 'millwheel', x: 14, y: 2, if: 'rw_echo_done' },
      { p: 'deadlantern', x: 7, y: 17, scene: 'rw.mr_lantern', if: '!rw_mr_ren' },
      { p: 'lantern', x: 7, y: 17, if: 'rw_mr_ren' },
      { p: 'stone_marker', x: 11, y: 22, scene: 'rw.mr_marker' },
      // the reed bed that closes the animal track (collision = these four tufts)
      { p: 'reeds', x: 12, y: 14, if: '!rw_mr_nao', scene: 'rw.mr_reeds' }, { p: 'reeds', x: 12, y: 15, if: '!rw_mr_nao', scene: 'rw.mr_reeds' },
      { p: 'reeds', x: 12, y: 16, if: '!rw_mr_nao', scene: 'rw.mr_reeds' }, { p: 'reeds', x: 12, y: 17, if: '!rw_mr_nao', scene: 'rw.mr_reeds' },
      // the voices in the narrows (drawn; the push is the trigger at its mouth)
      { p: 'echo', x: 6, y: 13, if: '!rw_mr_suzu&!rw_echo_done' }, { p: 'echo', x: 6, y: 14, if: '!rw_mr_suzu&!rw_echo_done' },
      { p: 'echo', x: 6, y: 15, if: '!rw_mr_suzu&!rw_echo_done' },
      { p: 'barrel', x: 13, y: 22 }, { p: 'crate', x: 17, y: 21 },
      { p: 'rock', x: 5, y: 11, block: true, scene: 'rw.mr_rock' },
    ],
    npcs: [
      { id: 'sae', x: 15, y: 23, dir: 'left', talk: [{ if: '!rw_mr_mio', scene: 'rw.mr_sae' }, { scene: 'rw.mr_sae2' }] },
      { id: 'mio', x: 14, y: 23, dir: 'right', if: 'rw_mill_open&!rw_echo_done', talk: [{ if: '!rw_mr_mio', scene: 'rw.mr_mio' }, { scene: 'rw.mr_mio2' }] },
      { id: 'ren', x: 8, y: 18, dir: 'left', if: 'rw_mill_open&!rw_echo_done', talk: [{ if: '!rw_mr_ren', scene: 'rw.mr_ren' }, { scene: 'rw.mr_ren2' }] },
      { id: 'nao', x: 11, y: 19, dir: 'up', if: 'rw_mill_open&!rw_echo_done', talk: [{ if: '!rw_mr_nao', scene: 'rw.mr_nao' }, { scene: 'rw.mr_nao2' }] },
      { id: 'suzu', x: 5, y: 18, dir: 'up', if: 'rw_mill_open&!rw_echo_done', talk: [{ if: '!rw_mr_suzu', scene: 'rw.mr_suzu_talk' }, { scene: 'rw.mr_suzu2' }] },
    ],
    foes: [
      { id: 'f1', enemy: 'rw.reedling', x: 10, y: 21, patrol: 1 },
      { id: 'f2', enemy: 'rw.reedling', x: 6, y: 9, patrol: 1, aggro: true },
      // out of doors by the mill: the moth has drifted out of it (its own lines
      // and the open-air backdrop; inside the mill it keeps the window line)
      { id: 'f3', enemy: 'rw.dustmoth', x: 11, y: 7, patrol: 1, bg: 'reedwake',
        intro: { jp: '{白|しろ}い {粉|こな} を まとった {蛾|が} が 、 {水車|すいしゃ}{小屋|ごや} から ゆっくり {出|で}て きた 。 {羽|はね} の {字|じ} が {見|み}えない 。', en: 'A moth dusted in white flour drifts out of the mill. The letters on its wings are hidden.' },
        settle: { jp: '{羽|はね} の {字|じ} が {読|よ}める よう に なる と 、 {蛾|が} は {水車|すいしゃ}{小屋|ごや} の {屋根|やね} を こえて {飛|と}んで いった 。', en: 'Once the letters on its wings can be read, the moth flutters up over the mill roof and away.' } },
    ],
    exits: [{ x: 10, y: 25, w: 2, h: 1, to: 'rw.village', tx: 22, ty: 1, dir: 'down' }],
    // the narrows are one tile wide between cliffs: its mouth (6,16) is the only
    // way in from either side; the scene pushes back only those heading up
    triggers: [{ x: 6, y: 16, w: 1, h: 1, scene: 'rw.mr_narrows', if: '!rw_mr_suzu&!rw_echo_done' }],
    onEnter: [{ scene: 'rw.mr_enter', once: true }],
    spawn: { default: [10, 24, 'up'] },
  };

  // ---- the mill -----------------------------------------------------------------------
  C.maps['rw.mill1'] = {
    name: T('The Old Mill', '{古|ふる}い {水車|すいしゃ}{小屋|ごや}'), region: 'reedwake', music: 'mill', noTravel: true,
    ambient: { dark: 0.45, playerLight: 52, weather: 'motes' },
    terrain: K.build(15, 12, '#', (k) => { k.rect(1, 2, 13, 9, '_'); k.set(7, 11, '_'); k.rect(11, 8, 2, 2, '+'); }),
    props: [
      { p: 'exitmat', x: 7, y: 10 },
      { p: 'millstone', x: 6, y: 4, scene: 'rw.m1_stone' },
      { p: 'gears', x: 10, y: 2, o: { jammed: true }, if: '!rw_gears', scene: 'rw.m1_gears' },
      { p: 'gears', x: 10, y: 2, if: 'rw_gears' },
      { p: 'ladder', x: 2, y: 2, scene: 'rw.m1_ladder' },
      { p: 'stairs', x: 12, y: 9, scene: 'rw.m1_stairs' },
      { p: 'crate', x: 1, y: 8 }, { p: 'crate', x: 2, y: 9 }, { p: 'barrel', x: 13, y: 4 }, { p: 'hay', x: 1, y: 6 },
      { p: 'sign', x: 9, y: 9, text: { jp: '{粉|こな} は {乾|かわ}いた ところ に {置|お}く こと 。', en: '(A notice in the miller\'s hand) Keep flour in a dry place.' } },
    ],
    foes: [
      { id: 'm1a', enemy: 'rw.dustmoth', x: 3, y: 4, patrol: 1, if: 'rw_gears' },
      { id: 'm1b', enemy: 'rw.inkblot', x: 11, y: 6, if: 'rw_loft_done&!rw_echo_done' },
    ],
    exits: [{ x: 7, y: 11, to: 'rw.millroad', tx: 9, ty: 5, dir: 'down' }],
    triggers: [{ x: 5, y: 6, w: 4, h: 2, scene: 'rw.m1_boss', if: 'rw_loft_done&!rw_echo_done' }],
    onEnter: [{ scene: 'rw.m1_enter', once: true }],
    spawn: { default: [7, 10, 'up'] },
  };
  C.maps['rw.mill2'] = {
    name: T('The Mill Loft', '{屋根裏|やねうら}'), region: 'reedwake', music: 'mystery', noTravel: true,
    ambient: { dark: 0.5, playerLight: 48, weather: 'motes' },
    terrain: K.build(13, 9, '#', (k) => { k.rect(1, 2, 11, 6, '_'); }),
    props: [
      { p: 'ladder', x: 2, y: 7, block: false },
      { p: 'deadlantern', x: 6, y: 2, scene: 'rw.m2_lantern', if: '!rw_loft_done' },
      { p: 'lantern', x: 6, y: 2, if: 'rw_loft_done' },
      { p: 'echo', x: 4, y: 4, scene: 'rw.m2_voice1' }, { p: 'echo', x: 9, y: 3, scene: 'rw.m2_voice2' }, { p: 'echo', x: 9, y: 6, scene: 'rw.m2_voice3' },
      { p: 'crate', x: 11, y: 2 }, { p: 'hay', x: 1, y: 3 }, { p: 'bookpile', x: 11, y: 7, scene: 'rw.m2_ledger' },
    ],
    exits: [{ x: 2, y: 8, to: 'rw.mill1', tx: 2, ty: 4, dir: 'down' }],
    spawn: { default: [2, 6, 'up'] },
  };
  // the ladder is a special exit: stepping onto the bottom of the loft ladder goes down
  C.maps['rw.mill2'].terrain = K.build(13, 9, '#', (k) => { k.rect(1, 2, 11, 6, '_'); k.set(2, 8, '_'); });
  C.maps['rw.mill0'] = {
    name: T('The Wheel Pit', '{水車|すいしゃ} の {下|した}'), region: 'reedwake', music: 'mill', noTravel: true,
    ambient: { dark: 0.55, playerLight: 46 },
    terrain: K.build(16, 10, '#', (k) => { k.rect(1, 2, 14, 7, '+'); k.rect(6, 2, 3, 7, '~'); k.hline(6, 8, 5, 'b'); k.set(2, 9, '+'); }),
    props: [
      { p: 'stairs', x: 2, y: 8, block: false },
      { p: 'chest', x: 13, y: 3, scene: 'rw.m0_chest', if: '!rw_m0_chest' },
      { p: 'chest', x: 13, y: 3, o: { open: true }, if: 'rw_m0_chest' },
      { p: 'barrel', x: 1, y: 3 }, { p: 'net', x: 10, y: 2 },
    ],
    foes: [
      { id: 'p1', enemy: 'rw.inkblot', x: 11, y: 6, patrol: 1 },
      // under the wheel there are no reeds: the Reedling rises from the wet stones
      { id: 'p2', enemy: 'rw.reedling', x: 3, y: 4, patrol: 1, bg: 'mill',
        intro: { jp: '{水車|すいしゃ} の {下|した} の {濡|ぬ}れた {石|いし} の {間|あいだ} から 、 {名前|なまえ} を なくした {光|ひかり} が {浮|う}かんで きた 。', en: 'From between the wet stones under the wheel rises a light that has lost its name.' },
        settle: { jp: '{光|ひかり} は {静|しず}か に {水路|すいろ} の {流|なが}れ に {乗|の}って いった 。', en: 'The light slips quietly away on the millrace.' } },
    ],
    exits: [{ x: 2, y: 9, to: 'rw.mill1', tx: 12, ty: 8, dir: 'down' }],
    spawn: { default: [2, 7, 'up'] },
  };

  // ---- people of Reedwake ---------------------------------------------------------------
  const pre = '!rw_echo_done';
  C.maps['rw.village'].npcs = [
    { id: 'tsuru', x: 21, y: 15, dir: 'down', if: '!rw_echo_done', talk: [
      { if: '!rw_met_tsuru', scene: 'rw.tsuru_first' },
      { if: 'quest.rw_labels=active&rw_bottles_done&rw_letters_done&rw_lanterns_done&rw_suzu_told&rw_hana_cups', scene: 'rw.tsuru_report' },
      { if: 'quest.rw_labels=active', scene: 'rw.tsuru_hint' },
      { scene: 'rw.tsuru_mill' }] },
    { id: 'suzu', x: 18, y: 19, dir: 'down', if: '!rw_mill_open|rw_echo_done&!rw_hall_gather&!departed|departed&comp!=suzu', talk: [
      { if: 'departed', scene: 'rw.suzu_after' },
      { if: 'rw_echo_done', scene: 'rw.suzu_evening' },
      { if: '!rw_suzu_told', scene: 'rw.suzu_first' }, { scene: 'rw.suzu_again' }] },
    { id: 'mame', x: 17, y: 18, dir: 'right', wander: 2, talk: [
      { if: 'post', scene: 'rw.mame_post' },
      { if: 'quest.rw_crossroads=done&!rw_charm_given', scene: 'rw.mame_charm' },
      { if: 'rw_echo_done', scene: 'rw.mame_after' }, { scene: 'rw.mame_first' }] },
    { id: 'nao', x: 26, y: 17, dir: 'left', if: 'rw_letters_done&!rw_mill_open|rw_echo_done&!rw_hall_gather&!departed|departed&comp!=nao', talk: [
      { if: 'departed', scene: 'rw.nao_after' }, { if: 'rw_echo_done', scene: 'rw.nao_evening' }, { scene: 'rw.nao_square' }] },
    { id: 'ren', x: 31, y: 19, dir: 'up', if: '!rw_mill_open|rw_echo_done&!rw_hall_gather&!departed|departed&comp!=ren', talk: [
      { if: 'departed', scene: 'rw.ren_after' }, { if: 'rw_echo_done', scene: 'rw.ren_evening' },
      { if: '!rw_met_ren', scene: 'rw.ren_first' }, { if: '!rw_lanterns_done', scene: 'rw.ren_again' }, { scene: 'rw.ren_done' }] },
    { id: 'yasu', x: 34, y: 25, dir: 'right', talk: [
      { if: 'post', scene: 'rw.yasu_post' }, { if: 'quest.rw_founding=done', scene: 'rw.yasu_after' }, { scene: 'rw.yasu_first' }] },
    { id: 'tomo', x: 7, y: 24, dir: 'down', wander: 1, talk: [
      { if: 'post', scene: 'rw.tomo_post' }, { if: 'rw_echo_done', scene: 'rw.tomo_after' }, { scene: 'rw.tomo_first' }] },
    { id: 'koji', x: 44, y: 17, dir: 'left', if: 'rw_echo_done&!rw_koji_back', talk: [{ scene: 'rw.koji_bank' }] },
    { id: 'hana_out', char: 'hana', x: 30, y: 16, dir: 'down', if: 'rw_echo_done&!rw_koji_back', talk: [{ scene: 'rw.hana_again' }] },
    // Tsuru stays in the square until evening falls (she still has things to say
    // after Kōji goes in), then walks to the Lantern Hall, where she waits
    { id: 'tsuru_out', char: 'tsuru', x: 27, y: 17, dir: 'right', if: 'rw_echo_done&!rw_evening', talk: [{ scene: 'rw.tsuru_evening' }] },
  ];
  C.maps['rw.hall'].npcs = [
    { id: 'tsuru', x: 5, y: 4, dir: 'down', if: 'rw_echo_done', talk: [
      { if: 'post&!seen.rw.atlas_intro', scene: 'rw.atlas_intro' }, { if: 'post', scene: 'rw.tsuru_post' },
      { if: 'departed', scene: 'rw.tsuru_after' }, { if: 'rw_hall_gather', scene: 'rw.hall_tsuru' }, { scene: 'rw.tsuru_evening' }] },
    { id: 'nao', x: 2, y: 5, dir: 'right', if: 'rw_hall_gather&!departed', talk: 'rw.hall_nao' },
    { id: 'mio', x: 8, y: 5, dir: 'left', if: 'rw_hall_gather&!departed', talk: 'rw.hall_mio' },
    { id: 'ren', x: 3, y: 7, dir: 'right', if: 'rw_hall_gather&!departed', talk: 'rw.hall_ren' },
    { id: 'suzu', x: 6, y: 7, dir: 'left', if: 'rw_hall_gather&!departed', talk: 'rw.hall_suzu' },
  ];
  C.maps['rw.apoth'].npcs = [
    { id: 'mio', x: 5, y: 3, dir: 'down', if: '!rw_mill_open|rw_echo_done&!rw_hall_gather&!departed|departed&comp!=mio', talk: [
      { if: 'departed', scene: 'rw.mio_after' }, { if: 'rw_echo_done', scene: 'rw.mio_evening' },
      { if: '!rw_bottles_done', scene: 'rw.mio_first' }, { scene: 'rw.mio_again' }] },
  ];
  C.maps['rw.warehouse'].npcs = [
    { id: 'nao', x: 5, y: 4, dir: 'down', if: '!rw_letters_done', talk: [{ scene: 'rw.nao_first' }] },
  ];
  C.maps['rw.tea'].npcs = [
    { id: 'hana', x: 2, y: 2, dir: 'down', talk: [
      { if: 'post', scene: 'rw.hana_post' },
      { if: 'rw_koji_back&quest.rw_teahouse=done', scene: 'rw.hana_after2' },
      { if: 'rw_koji_back', scene: 'rw.hana_rush' },
      { if: '!rw_hana_cups', scene: 'rw.hana_first' }, { scene: 'rw.hana_again' }] },
    { id: 'koji', x: 5, y: 6, dir: 'left', if: 'rw_koji_back', talk: [{ if: 'post', scene: 'rw.koji_post' }, { scene: 'rw.koji_tea' }] },
  ];
  C.maps['rw.carpenter'].npcs = [
    { id: 'bunta', x: 5, y: 4, dir: 'down', talk: [
      { if: 'post', scene: 'rw.bunta_post' },
      { if: 'quest.rw_tools=done', scene: 'rw.bunta_after' },
      { if: 'rw_tally_read', scene: 'rw.bunta_tally' },
      { if: 'quest.rw_tools', scene: 'rw.bunta_again' }, { scene: 'rw.bunta_first' }] },
  ];
  C.maps['rw.house2'].npcs = [
    { id: 'kiku', x: 3, y: 5, dir: 'down', talk: [
      { if: 'post', scene: 'rw.kiku_post' },
      { if: 'quest.rw_tools=done', scene: 'rw.kiku_after' },
      { if: 'rw_tally_read', scene: 'rw.kiku_tally' },
      { if: 'quest.rw_tools', scene: 'rw.kiku_side' }, { scene: 'rw.kiku_first' }] },
  ];
  C.maps['rw.house1'].npcs = [
    { id: 'oto', x: 3, y: 4, dir: 'down', talk: [
      { if: 'post', scene: 'rw.oto_post' },
      { if: 'quest.rw_boots=done', scene: 'rw.oto_after' },
      { if: 'rw_sign_read', scene: 'rw.oto_sign' },
      { if: 'quest.rw_boots', scene: 'rw.oto_again' }, { scene: 'rw.oto_first' }] },
  ];
  C.maps['rw.ferry'].npcs = [];
  C.maps['rw.hall'].onEnter = [{ scene: 'rw.hall_gather', if: 'rw_evening&!rw_hall_gather' }];
  // the night before departure belongs to the village: the roads out wait for morning
  C.maps['rw.village'].hold = [{ if: 'rw_night', scene: 'rw.night_hold' }];
  // Pier planks over the river for Old Yasu
  C.maps['rw.village'].terrain = C.maps['rw.village'].terrain.map((row, y) => (y === 25 ? row.slice(0, 33) + '::bb' + row.slice(37) : row));
  C.maps['rw.village'].props = C.maps['rw.village'].props.filter((p) => p.p !== 'pier');
  void pre;
})(RB.content, RB.mapkit);
