/* Reedwake's changes, its road and its return keys (C-87; docs/future/work/LW1_ROLLOUT.md).
 * W1 change beats: the cellar hatch under the river warehouse (Chapter 2 done) and Kōji's river boat (Blockprint's
 * festival done) were already there and are registered; added: the printed news sheet from Blockprint Row pinned by
 * the teahouse, and the ferry's new timetable once Kotonoha is on it.
 * W5 the Reedwake road (rw.road, to Saltglass): a pedlar's cart with a wheel off the first time you walk it (the repair
 * card read aloud), then now and then a crooked waymarker, a dropped letter, or geese on the road.
 * W6 three return keys: the warehouse's unlabelled jars (それぞれ, from Manybridge), a flood stone in the river
 * (waiting, from Manybridge), and the Lantern Hall's votive lamps that go out unless lit all together (すべて, from
 * the Keepers' Road). */
var RB = (globalThis.RB = globalThis.RB || {});
(function (L, C) {
  'use strict';
  const T = L.T;
  // a pedlar who walks the Reedwake road (a new face: a road's own)
  C.chars.lw_kohachi = { name: T('Kohachi', 'コハチ'), voice: { pitch: 0.92 },
    look: { skin: 3, hair: 'short', hairColor: 1, cloth: ['#6a7a5a', '#4e5c42', '#d8c8a0'], shape: 'tunic', acc: ['hat', 'satchel'], hatCol: '#a89060' },
    portrait: { eyes: 'round', style: 'short', acc: ['hat'], hatCol: '#a89060', bg: '#30342a' } };

  // ---- W1: change beats -------------------------------------------------------------------------------------------
  L.beat('reedwake', { id: 'cellar', when: 'ed>=2&ch2_done', en: 'A hatch under the river warehouse', jp: '{倉庫|そうこ} の {床|ゆか} の {扉|とびら}' });
  L.beat('reedwake', { id: 'river', when: 'ed>=2&mb2_done', en: 'Kōji\'s boat goes down the river', jp: 'コウジ の {舟|ふね}' });
  L.beat('reedwake', { id: 'press', when: 'mb2_done', en: 'A printed news sheet by the teahouse', jp: '{刷|す}り{物|もの}' });
  L.beat('reedwake', { id: 'timetable', when: 'ko_done', en: 'The ferry\'s new timetable', jp: '{渡|わた}し の {時刻表|じこくひょう}' });
  C.maps['rw.village'].props.push(
    { p: 'fw_postnote', x: 27, y: 13, if: 'beat.reedwake.press', scene: 'mp.lw_rw_press_sheet' },
    { p: 'sign', x: 42, y: 16, if: 'beat.reedwake.timetable', scene: 'ko.lw_rw_timetable' });
  L.talk('rw.tea:hana', [{ if: 'beat.reedwake.press&!seen.mp.lw_rw_press_hana', scene: 'mp.lw_rw_press_hana' }]);
  L.talk('rw.village:mame', [{ if: 'beat.reedwake.press&!seen.mp.lw_rw_press_mame', scene: 'mp.lw_rw_press_mame' }]);
  L.talk('rw.tea:koji', [{ if: 'beat.reedwake.timetable&!seen.ko.lw_rw_timetable_koji', scene: 'ko.lw_rw_timetable_koji' }]);

  // ---- W5: the Reedwake road -----------------------------------------------------------------------------------------
  C.maps['rw.road'].npcs.push({ id: 'lw_kohachi', x: 17, y: 9, dir: 'down', if: 'departed&!lw_rw_cart_done', talk: 'sg.lw_road_rw_cart' });
  C.maps['rw.road'].props.push({ p: 'cart', x: 18, y: 8, if: 'departed&!lw_rw_cart_done' });
  L.road('rw_road', { maps: ['rw.road'],
    unique: { id: 'cart', scene: 'sg.lw_road_rw_cart' },
    variants: [{ id: 'marker', scene: 'sg.lw_road_rw_marker' }, { id: 'letter', scene: 'sg.lw_road_rw_letter' }, { id: 'geese', scene: 'sg.lw_road_rw_geese' }],
    stamp: { title: ['{葦|あし}ノ{瀬|せ} の {道|みち}', 'the Reedwake road'], ink: '#7a5a2a' } });
  C.notes.lw_carters_cards = { title: T('Carters\' cards', '{荷車|にぐるま} の {札|ふだ}'), fiction: true,
    jp: '{街道|かいどう} を {行|い}く {荷車|にぐるま} に は 、 {直|なお}し{方|かた} を {書|か}いた {小|ちい}さな {札|ふだ} が {下|さ}がって いる 。 {字|じ} の {読|よ}める {人|ひと} が {通|とお}れば 、 {誰|だれ} でも {直|なお}せる よう に 。',
    en: 'Carts on the road carry a little card telling how to mend them, so that anyone passing who can read can help. (The custom is the game\'s own.)' };
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const o = (jp, ok, why) => Object.assign({ jp, ok: !!ok }, why ? { why: { en: why } } : {});
  C.challenges['rw.lw_cart'] = { title: T('The wheel card', '{車輪|しゃりん} の {札|ふだ}'), tiers: {
    F: [ch({ item: 'v:まず', ctx: { jp: 'ふだ ： 「まず くさび を ぬく 。 つぎ に わ を はめる 。 さいご に くさび を うつ 。」', en: '' }, prompt: { en: 'What does the card say to do first?' }, options: [o('くさび を ぬく', 1), o('わ を はめる', 0, 'つぎ に: that is the second step.'), o('くさび を うつ', 0, 'さいご に: that is the last.')] })],
    E: [ch({ item: 'g:v_te_kara', ctx: { jp: '{札|ふだ} ： 「くさび を {抜|ぬ}いて から 、 {輪|わ} を はめて ください 。 それから 、 くさび を {打|う}って ください 。」', en: '' }, prompt: { en: 'What comes straight after taking out the wedge?' }, options: [o('{輪|わ} を はめる', 1), o('くさび を {打|う}つ', 0, 'それから: that comes after the wheel.'), o('{輪|わ} を {外|はず}す', 0, 'The wheel is already off.')] })],
    I: [ch({ item: 'g:cond_tara', ctx: { jp: '{札|ふだ} ： 「{輪|わ} が {奥|おく} まで {入|はい}ったら 、 くさび を {打|う}つ こと 。 {入|はい}らない うち に {打|う}つ と 、 {割|わ}れる 。」', en: '' }, prompt: { en: 'When do you drive the wedge in?' }, options: [o('{輪|わ} が {奥|おく} まで {入|はい}って から', 1), o('{輪|わ} を はめる {前|まえ} に', 0, '〜たら: once the wheel is all the way on.'), o('{輪|わ} が {割|わ}れたら', 0, 'It is the wedge that splits if you hurry.')] })],
    A: [ch({ item: 'g:indirectness', ctx: { jp: 'コハチ ： 「この {札|ふだ} 、 {字|じ} が {細|こま}かくて ね 。 {目|め} が もう {若|わか}く ない もの で ……」', en: '' }, prompt: { en: 'What is Kohachi really asking?' }, options: [o('{札|ふだ} を {読|よ}んで ほしい', 1), o('{新|あたら}しい {札|ふだ} が ほしい', 0, 'He has the card; he cannot read it.'), o('{眼鏡|めがね} を {買|か}いたい', 0, 'He is asking you, not a shop.')] })],
  } };
  C.challenges['rw.lw_marker'] = { title: T('The crooked waymarker', '{曲|ま}がった {道標|みちしるべ}'), tiers: {
    F: [ch({ item: 'v:みぎ', ctx: { jp: 'みちしるべ ： 「← あしのせ 、 しおがらす →」 （かぜ で まわって 、 いま は さかさま）', en: '' }, prompt: { en: 'The marker has been turned round by the wind. Saltglass lies west, the way you were heading. Which arm should point west?' }, options: [o('しおがらす', 1), o('あしのせ', 0, 'Reedwake is behind you, to the east.')] })],
    E: [ch({ item: 'v:向き', ctx: { jp: '{道標|みちしるべ} ： 「{西|にし} ・ {潮|しお}{硝子|がらす} 、 {東|ひがし} ・ {葦|あし}ノ{瀬|せ}」 。 {今|いま} は {向|む}き が {逆|ぎゃく} に なって いる 。', en: '' }, prompt: { en: 'Which arm do you turn to face west?' }, options: [o('{潮|しお}{硝子|がらす}', 1), o('{葦|あし}ノ{瀬|せ}', 0, '東 is east: that arm faces Reedwake.')] })],
    I: [ch({ item: 'g:te_oku', ctx: { jp: '{道標|みちしるべ} の {下|した} に {書|か}き{付|つ}け ： 「{風|かぜ} の {後|あと} は 、 {向|む}き を {直|なお}して おく こと 。」', en: '' }, prompt: { en: 'What does the note ask passers-by to do?' }, options: [o('{風|かぜ} の {後|あと} 、 {向|む}き を {直|なお}して おく', 1), o('{風|かぜ} の {前|まえ} に {抜|ぬ}いて おく', 0, '後 is after.'), o('{風|かぜ} が {止|や}む まで {待|ま}つ', 0, 'It asks you to put it right.')] })],
    A: [ch({ item: 'g:sentence_final', ctx: { jp: '{通|とお}りがかり の {人|ひと} ： 「あれ 、 {逆|さか}さま じゃ ない か な 。 {潮|しお}{硝子|がらす} は {日|ひ} の {沈|しず}む {方|ほう} だ よね 。」', en: '' }, prompt: { en: 'What does the passer-by think?' }, options: [o('{道標|みちしるべ} が {逆|ぎゃく} を {向|む}いて いる', 1), o('{潮|しお}{硝子|がらす} は {東|ひがし} に ある', 0, '日の沈む方 is west.'), o('{道|みち} が {間違|まちが}って いる', 0, 'The road is fine; the marker is turned.')] })],
  } };
  C.challenges['rw.lw_letter'] = { title: T('A dropped letter', '{落|お}ちた {手紙|てがみ}'), tiers: {
    F: [ch({ item: 'v:手紙', ctx: { jp: 'てがみ の うら ： 「あしのせ ・ ちゃや ・ ハナ さま 。 しおがらす ・ タマエ より 。」', en: '' }, prompt: { en: 'Who is the letter for?' }, options: [o('ハナ', 1), o('タマエ', 0, 'より means "from": Tamae sent it.')] })],
    E: [ch({ item: 'g:prt_kara_made', ctx: { jp: '{手紙|てがみ} の {裏|うら} ： 「{葦|あし}ノ{瀬|せ} ・ {茶屋|ちゃや} ・ ハナ {様|さま} 。 {潮|しお}{硝子|がらす} ・ タマエ より 。」', en: '' }, prompt: { en: 'Where should it go?' }, options: [o('{葦|あし}ノ{瀬|せ} の {茶屋|ちゃや}', 1), o('{潮|しお}{硝子|がらす} の {宿|やど}', 0, 'That is where it comes from.')] })],
    I: [ch({ item: 'g:te_shimau', ctx: { jp: '{飛脚|ひきゃく} ： 「しまった 、 {落|お}として しまった ！ {茶屋|ちゃや} の ハナ さん へ の {手紙|てがみ} な ん です 。」', en: '' }, prompt: { en: 'What has the courier done?' }, options: [o('{手紙|てがみ} を うっかり {落|お}とした', 1), o('{手紙|てがみ} を わざと {捨|す}てた', 0, '〜てしまった: it happened by mistake.'), o('{手紙|てがみ} を もう {届|とど}けた', 0, 'It is still here on the road.')] })],
    A: [ch({ item: 'g:keigo_kenjo', ctx: { jp: '{飛脚|ひきゃく} ： 「お{拾|ひろ}い いただき 、 {誠|まこと} に ありがとう ございます 。 {確|たし}か に お{届|とど}け いたします 。」', en: '' }, prompt: { en: 'What does the courier promise?' }, options: [o('{必|かなら}ず {届|とど}ける', 1), o('{手紙|てがみ} を {返|かえ}して ほしい', 0, 'お届けいたします: I will deliver it.'), o('あなた に {届|とど}けて ほしい', 0, 'いたします is the speaker\'s own humble act.')] })],
  } };
  C.challenges['rw.lw_geese'] = { title: T('Geese on the road', '{道|みち} の ガチョウ'), tiers: {
    F: [ch({ item: 'v:待つ', ctx: { jp: 'こども ： 「おねがい 、 はしらないで ！ ガチョウ が にげちゃう 。 ゆっくり まって て 。」', en: '' }, prompt: { en: 'What does the child ask you to do?' }, options: [o('ゆっくり まつ', 1), o('はしって とおる', 0, 'はしらないで: please don\'t run.')] })],
    E: [ch({ item: 'g:v_naide_kudasai', ctx: { jp: '{子|こ}ども ： 「{走|はし}らないで ください ！ ガチョウ が {全部|ぜんぶ} {渡|わた}る まで 、 {待|ま}って ください 。」', en: '' }, prompt: { en: 'Until when should you wait?' }, options: [o('ガチョウ が {全部|ぜんぶ} {渡|わた}る まで', 1), o('{子|こ}ども が {走|はし}る まで', 0, 'まで goes with 渡る: until they have all crossed.')] })],
    I: [ch({ item: 'g:uchi_ni', ctx: { jp: '{子|こ}ども ： 「{暗|くら}く ならない うち に 、 {小屋|こや} に {帰|かえ}したい ん だ 。」', en: '' }, prompt: { en: 'When does the child want the geese home?' }, options: [o('{暗|くら}く なる {前|まえ} に', 1), o('{暗|くら}く なって から', 0, '〜ないうちに: before it gets dark.')] })],
    A: [ch({ item: 'g:casual_contractions', ctx: { jp: '{子|こ}ども ： 「{一羽|いちわ} でも {逃|に}げちゃったら 、 {怒|おこ}られちゃう ……」', en: '' }, prompt: { en: 'What is the child afraid of?' }, options: [o('{一羽|いちわ} でも {逃|に}げたら 、 {叱|しか}られる', 1), o('ガチョウ に {噛|か}まれる', 0, 'ちゃう is てしまう: being told off if one gets away.')] })],
  } };

  // ---- W6: return keys --------------------------------------------------------------------------------------------
  L.seal('rw_jars', { map: 'rw.warehouse', x: 2, y: 5, p: 'bottles', needs: 'mod_sorezore', opens: 'lw_rw_jars_open', scene: 'mb.lw_rw_jars_open',
    hint: ['{壺|つぼ} が {並|なら}んで いる 。 {札|ふだ} は {一枚|いちまい} も ない 。 {一|ひと}つ {一|ひと}つ に {合|あ}う {言葉|ことば} が あれば ……', 'A row of jars, not one label among them. If there were a word that saw to each one in turn…'],
    openedLabel: ['{染|そ}め{壺|つぼ} の {札|ふだ}', 'The dye jars, labelled'], after: { p: 'bottles', scene: 'mb.lw_rw_jars_after' } });
  L.seal('rw_floodstone', { map: 'rw.village', x: 42, y: 19, p: 'stone_marker', needs: 'c_wait', opens: 'lw_rw_flood_open', scene: 'mb.lw_rw_flood_open',
    hint: ['{川|かわ} の {際|きわ} に {古|ふる}い {石|いし} が {立|た}って いる 。 {水|みず} が {速|はや}くて 、 {字|じ} が {見|み}えない 。 {急|いそ}がず に {待|ま}てれば ……', 'An old stone stands at the river\'s edge. The water runs too fast to see the writing on it. If you knew how to wait…'],
    openedLabel: ['{大水|おおみず} の {石|いし}', 'The flood stone'], after: { p: 'stone_marker', scene: 'mb.lw_rw_flood_after' } });
  L.seal('rw_votives', { map: 'rw.hall', x: 3, y: 3, p: 'deadlantern', needs: 'mod_subete', opens: 'lw_rw_votives_lit', scene: 'kr.lw_rw_votives_open',
    hint: ['{小|ちい}さな {灯明|とうみょう} が たくさん ある 。 {一|ひと}つ {点|つ}ける と 、 {他|ほか} が {消|き}えて しまう 。 「{灯|ひ} は ともに」 と {彫|ほ}って ある 。', 'Many little votive lamps. Light one and the others go out. Carved beneath: "The lights, together."'],
    openedLabel: ['{灯明|とうみょう} が {灯|とも}る', 'The votive lamps lit'], after: { p: 'lantern', o: { lit: true }, scene: 'kr.lw_rw_votives_after' } });
  C.notes.lw_dye_jars = { title: T('Kiku\'s dye jars', 'キク の {染|そ}め{壺|つぼ}'), fiction: true,
    jp: '{倉庫|そうこ} の {奥|おく} の {壺|つぼ} は 、 キク が {若|わか}い {頃|ころ} に {使|つか}った {染|そ}め{壺|つぼ} だった 。 {藍|あい} 、 {柿渋|かきしぶ} 、 {茜|あかね} 。 それぞれ の {札|ふだ} を {付|つ}けて おいた 。',
    en: 'The jars at the back of the river warehouse were the dye jars Kiku used when she was young: indigo, persimmon, madder. Each now has its own label again.' };
  C.notes.lw_flood_stone = { title: T('The flood stone', '{大水|おおみず} の {石|いし}'), fiction: true,
    jp: '「この {高|たか}さ まで {水|みず} {来|き}たる 」 。 {三十年|さんじゅうねん} {前|まえ} の {大水|おおみず} の {高|たか}さ を {刻|きざ}んだ {石|いし} 。 {葦|あし}ノ{瀬|せ} の {人|ひと} は 、 {川|かわ} を {忘|わす}れない よう に 、 これ を {立|た}てた 。',
    en: '"The water came this high." A stone marking the great flood of thirty years ago, set up so that Reedwake would not forget its river. (Flood stones like it stand along real Japanese rivers; this one is the game\'s.)' };

  L.scenes(`
@scene mp.lw_rw_press_sheet
narr: {刷|す}り{物|もの} が {貼|は}って ある 。 「{川開|かわびら}き の {祭|まつ}り 、 {大|おお}にぎわい 。 {版木|はんぎ} {町|まち} より 」 。 || A printed sheet is pinned up: "Crowds at the river-opening festival. From Blockprint Row."
narr: {下|した} に {小|ちい}さく 、 {誰|だれ} か が {鉛筆|えんぴつ} で {書|か}き{足|た}して いる 。 「{葦|あし}ノ{瀬|せ} から も {舟|ふね} が {出|で}る そう だ 。」 || Underneath, someone has added in pencil: "They say boats go from Reedwake too."

@scene mp.lw_rw_press_hana
hana: {見|み}ました ？ {町|まち} の {刷|す}り{物|もの} が 、 ここ まで {届|とど}く よう に なった の 。 || Did you see? The town's printed sheets come all the way out here now.
hana: お{客|きゃく} さん が {読|よ}み{終|お}わる まで 、 お{茶|ちゃ} が {冷|さ}めちゃう の よ 。 || My customers' tea goes cold while they read.

@scene mp.lw_rw_press_mame
mame: ねえ 、 {刷|す}り{物|もの} の {字|じ} 、 マメ {半分|はんぶん} {読|よ}めた よ ！ {残|のこ}り は {絵|え} で わかった ！ || Hey, I could read half the printed sheet! The rest I worked out from the picture!

@scene ko.lw_rw_timetable
narr: {渡|わた}し の {時刻表|じこくひょう} 。 {一番|いちばん} {下|した} に 、 {新|あたら}しい {字|じ} で {一行|いちぎょう} {増|ふ}えて いる 。 「{言|こと}の{葉|は}{島|じま} ・ {潮|しお} を {見|み}て {出|で}る」 。 || The ferry timetable. At the very bottom, one new line in fresh ink: "Kotonoha: sails when the tide allows."

@scene ko.lw_rw_timetable_koji
koji: {時刻表|じこくひょう} 、 {見|み}た か ？ {言|こと}の{葉|は}{島|じま} まで {行|い}く {舟|ふね} も 、 {載|の}せる こと に した ん だ 。 || Seen the timetable? I've put the boats to Kotonoha on it too.
koji: {母|はは} の {帳面|ちょうめん} に は ない {行|ゆ}き{先|さき} だ 。 {新|あたら}しい {頁|ページ} を {始|はじ}める ん だ よ 。 || It's a stop my mother's book never had. I'm starting a new page.

@scene sg.lw_road_rw_cart
# Road event (W5): the Reedwake road's own, the first time you walk it after setting out
!look lw_kohachi pc
lw_kohachi: あ 、 {旅|たび} の {方|かた} ！ ちょうど よかった 。 {荷車|にぐるま} の {輪|わ} が {外|はず}れて しまって 。 || Ah, a traveller! Just in time. The wheel's come off my cart.
lw_kohachi: {直|なお}し{方|かた} の {札|ふだ} は ある ん です が 、 {字|じ} が {細|こま}かくて …… {読|よ}んで もらえません か 。 || I've the card that says how to fix it, but the writing's so small… Could you read it for me?
!challenge rw.lw_cart
!if var._res=0 -> later
narr: {札|ふだ} の {通|とお}り に すると 、 {輪|わ} は {音|おと} も なく はまった 。 || Done as the card says, the wheel slides home without a sound.
lw_kohachi[laugh]: {助|たす}かりました ！ {荷車|にぐるま} の {札|ふだ} の こと 、 {覚|おぼ}えて おいて ください 。 {誰|だれ} か を また {助|たす}けられます から 。 || What a help! Remember the carters' cards. You'll help someone else with them one day.
!note lw_carters_cards
!set lw_rw_cart_done
!hook road_done rw_road cart
!refresh
!end
:later
lw_kohachi: {急|いそ}ぎ じゃ ない です から 。 また {通|とお}る とき に 、 {見|み}て ください 。 || There's no hurry. Have another look when you're passing again.

@scene sg.lw_road_rw_marker
narr: {道標|みちしるべ} が {風|かぜ} で {回|まわ}って 、 {逆|ぎゃく} を {向|む}いて いる 。 || The waymarker has been turned by the wind and points the wrong way.
!challenge rw.lw_marker
!if var._res=0 -> later
narr: {腕|うで} を {回|まわ}して 、 {潮|しお}{硝子|がらす} を {西|にし} に {向|む}けた 。 これ で {迷|まよ}う {人|ひと} は いない 。 || You turn the arms till Saltglass faces west. Nobody will go astray now.
!hook road_done rw_road marker
!end
:later
narr: {道標|みちしるべ} は {逆|ぎゃく} を {向|む}いた まま だ 。 || The marker still points the wrong way.

@scene sg.lw_road_rw_letter
narr: {道|みち} に {手紙|てがみ} が {落|お}ちて いる 。 {向|む}こう から {飛脚|ひきゃく} が {走|はし}って くる 。 || A letter lies on the road. A courier comes running back towards you.
!challenge rw.lw_letter
!if var._res=0 -> later
narr: {宛名|あてな} を {読|よ}んで 、 {手紙|てがみ} を {飛脚|ひきゃく} に {渡|わた}した 。 {何度|なんど} も {頭|あたま} を {下|さ}げて 、 {葦|あし}ノ{瀬|せ} の {方|ほう} へ {走|はし}って いった 。 || You read the address and hand the letter back. With bow after bow, the courier runs off towards Reedwake.
!hook road_done rw_road letter
!end
:later
narr: {飛脚|ひきゃく} は {手紙|てがみ} を {拾|ひろ}って 、 {首|くび} を かしげ ながら {行|い}って しまった 。 || The courier picks up the letter and goes off, still puzzling over the address.

@scene sg.lw_road_rw_geese
narr: ガチョウ の {群|む}れ が 、 {道|みち} を {横切|よこぎ}って いる 。 {小|ちい}さな {子|こ} が {棒|ぼう} を {持|も}って {追|お}って いる 。 || A flock of geese is crossing the road, a small child behind them with a stick.
!challenge rw.lw_geese
!if var._res=0 -> later
narr: {立|た}ち{止|ど}まって {待|ま}つ と 、 ガチョウ は {一羽|いちわ} {残|のこ}らず {道|みち} を {渡|わた}った 。 {子|こ} が {手|て} を {振|ふ}った 。 || You stand and wait, and every last goose crosses. The child waves.
!hook road_done rw_road geese
!end
:later
narr: ガチョウ が {騒|さわ}いで 、 {子|こ} は {困|こま}った {顔|かお} を した 。 || The geese scatter and squawk; the child looks at you, put out.

@scene mb.lw_rw_jars_open
narr: {壺|つぼ} を {一|ひと}つ ずつ 、 それぞれ {開|あ}けて {見|み}る 。 {藍|あい} 、 {柿渋|かきしぶ} 、 {茜|あかね} …… それぞれ に {合|あ}う {札|ふだ} を {書|か}いて {付|つ}けた 。 || One by one, you open each jar in turn: indigo, persimmon, madder… and write each its own label.
narr: {底|そこ} の {方|ほう} に 、 {古|ふる}い {字|じ} で 「キク」 と ある 。 || Near the bottom, in an old hand: "Kiku".
!note lw_dye_jars

@scene mb.lw_rw_jars_after
narr: {染|そ}め{壺|つぼ} に は 、 それぞれ {札|ふだ} が {付|つ}いて いる 。 {藍|あい} 、 {柿渋|かきしぶ} 、 {茜|あかね} 。 || Each dye jar has its label: indigo, persimmon, madder.

@scene mb.lw_rw_flood_open
narr: {急|いそ}がず 、 じっと {待|ま}つ 。 {川|かわ} の {流|なが}れ が {緩|ゆる}み 、 {石|いし} の {字|じ} が {水|みず} の {上|うえ} に {出|で}た 。 || You don't hurry. You wait. The current slackens, and the writing on the stone rises clear of the water.
narr: 「この {高|たか}さ まで {水|みず} {来|き}たる 」 。 {三十年|さんじゅうねん} {前|まえ} の {日付|ひづけ} だ 。 || "The water came this high." A date from thirty years ago.
!note lw_flood_stone

@scene mb.lw_rw_flood_after
narr: {大水|おおみず} の {高|たか}さ を {刻|きざ}んだ {石|いし} 。 {今|いま} は {字|じ} が よく {見|み}える 。 || The stone that marks the flood's height. The writing shows clearly now.

@scene kr.lw_rw_votives_open
narr: {一|ひと}つ ずつ で は なく 、 すべて の {灯明|とうみょう} に 、 {一度|いちど} に {火|ひ} を {移|うつ}す 。 || Not one at a time: you carry the flame to all the votive lamps at once.
narr: {小|ちい}さな {灯|ひ} が {揃|そろ}って {灯|とも}り 、 もう {消|き}えない 。 || The little lights come up together, and this time none goes out.
tsuru: …… まあ 。 {私|わたし} が {小|ちい}さい {頃|ころ} から 、 {誰|だれ} も {点|つ}けられなかった の に 。 || …Oh my. Nobody's been able to light those since I was a girl.

@scene kr.lw_rw_votives_after
narr: {灯明|とうみょう} が {揃|そろ}って {灯|とも}って いる 。 || The votive lamps burn together.
`);
})(RB.living, RB.content);
