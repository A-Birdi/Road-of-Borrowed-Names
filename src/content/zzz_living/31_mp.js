/* Blockprint Row and Playhouse Row's Living World (C-87; docs/future/work/LW1_AUTHORING.md, LW1_ROLLOUT.md): the
 * printers' street, the theatre street and their rooms, a town of their own from the festival's end (`mb2_done`).
 * W2 routines: Kakeru sorting the post in the guild hall or waiting at the river landing with the Reedwake mail;
 *   Hayashi drumming wherever a crowd gathers (the press room's queue, the festival hall's games); Genta rehearsing on
 *   the stage or listening to the children at the festival hall (a chalked note says so); Miyo, once Sōbē has taken her
 *   on (pinned until then), setting type in the press room or minding the drying racks.
 * W3 "Have you seen…?": Sanpei at the press, Tomi at the festival hall and Kakeru the courier (who knows addresses in
 *   Manybridge and Reedwake too); Sōbē, gruff and busy, won't say.
 * W1 change beats. Registered (already there): after the festival (the hall open for the summer, the boat up to
 *   Reedwake at the landing, the tonic seller's pitch empty); Manbē's old playbill given its words back (a leaf home from
 *   Kotonoha); Sanpei's last editions (after the story). Added: a new play about the lamp-keepers' road, with a banner
 *   by the theatre (the Keepers' Road done); the Cloudroad relay's notice at the courier guild (the Cloudroad done).
 * W5: none. Blockprint Row is a street of the city, walked up to from the Exchange district: no road map.
 * W6 return keys: the press room's old teaching block, cut with every kind of character (あらゆる, Chapter 9: the
 *   iroha print, a keepsake); the theatre's house curtain, drawn by the whole company as one (全体, Chapter 11); the
 *   courier guild's route map north, traced station by station (ごとに, Chapter 10). */
var RB = (globalThis.RB = globalThis.RB || {});
(function (L) {
  'use strict';
  const C = RB.content, T = L.T;
  RB.lex.add(RB.lex.parseTable(`
道中図|どうちゅうず|n|A|a route map (for travellers, showing the stages of a road)
定式幕|じょうしきまく|n|A|the striped house curtain of a kabuki theatre
萌葱|もえぎ|n|A|leek green, a bright yellowish green
いろは|いろは|n|I|the iroha poem (every kana once); the ABC of something
活字|かつじ|n|I|printing type
新入り|しんいり|n|I|newcomer, new hand
柿色|かきいろ|n|I|persimmon colour, a reddish brown
縦縞|たてじま|n|A|vertical stripes
いろはにほへと||exp|A|"the colours are fragrant": the iroha poem's first line (classical)
ちりぬるを||exp|A|"yet they scatter": the iroha poem's second line (classical)
`));

  L.town('blockprint', {
    name: T('Blockprint and Playhouse Rows', '{版木|はんぎ} の {通|とお}り と {芝居|しばい} の {通|とお}り'),
    maps: ['mp.blockprint', 'mp.playhouse', 'mp.workshop', 'mp.pressroom', 'mp.guild', 'mp.theatre', 'mp.committee', 'mp.festhall', 'mp.tenement'],
    care: ['ch3_done', 'kr_done', 'ko_done', 'cr_done'],
    after: 'mb2_done',
  });

  // ---- W2: routines -------------------------------------------------------------------------------------------------
  L.routine('blockprint', 'mp_kakeru', { base: 'mp.blockprint:mp_kakeru', slots: [
    { map: 'mp.guild', x: 6, y: 2, dir: 'down', perform: 'sort', line: ['{今日|きょう} の {便|びん} の {仕分|しわ}け だ 。 {宛名|あてな} の {札|ふだ} が {刷|す}れる と 、 {仕分|しわ}け も {速|はや}い ぜ 。', 'Sorting today\'s post. With the address tags printed again, sorting goes quick too.'] },
    { map: 'mp.playhouse', x: 47, y: 25, dir: 'left', line: ['{葦|あし}ノ{瀬|せ} {行|ゆ}き の {手紙|てがみ} だ 。 {舟|ふね} が {出|で}る まで 、 {走|はし}らず に {待|ま}つ 。 これ も {飛脚|ひきゃく} の {仕事|しごと} さ 。', 'Letters for Reedwake. I wait for the boat instead of running. That\'s a courier\'s job too.'] },
  ] });
  L.routine('blockprint', 'mp_hayashi', { base: 'mp.playhouse:mp_hayashi', slots: [
    { map: 'mp.blockprint', x: 8, y: 17, dir: 'down', line: ['{刷|す}り{物|もの} を {待|ま}つ {人|ひと} が {並|なら}ぶ から 、 ここ で {叩|たた}く の さ 。 ポン 、 ポン ！', 'People queue here for the prints, so this is where I drum. Pom, pom!'] },
    { map: 'mp.playhouse', x: 31, y: 32, dir: 'right', line: ['{会所|かいしょ} の {遊|あそ}び に 、 {子供|こども} が {集|あつ}まる 。 {子供|こども} は 、 {太鼓|たいこ} が {大好|だいす}き だ から ね 。', 'The children gather for the games at the festival hall. Children love a drum.'] },
  ] });
  L.routine('blockprint', 'mp_genta', { base: 'mp.playhouse:mp_genta', slots: [
    { map: 'mp.theatre', x: 14, y: 4, dir: 'down', line: ['{次|つぎ} の {漫才|まんざい} の {稽古|けいこ} だ 。 {相方|あいかた} の {風邪|かぜ} も 、 やっと {治|なお}った から な 。', 'Rehearsing the next double act. My partner\'s cold has finally cleared up.'] },
    { map: 'mp.festhall', x: 9, y: 4, dir: 'down', line: ['{子供|こども} の {笑|わら}う {声|こえ} を {聞|き}き に {来|く}る ん だ 。 {笑|わら}い の {稽古|けいこ} に なる から な 。', 'I come to hear the children laughing. It\'s good practice, laughter.'] },
  ] });
  L.away('blockprint', 'mp_genta', { map: 'mp.playhouse', x: 30, y: 14, p: 'fw_note', line: ['{地面|じめん} に チョーク で 。 「ゲンタ は {小屋|こや} か {会所|かいしょ} 。 {笑|わら}いたい {人|ひと} は どうぞ 」', 'Chalked on the ground: "Genta: at the theatre or the festival hall. Anyone who wants a laugh, come along."'] });
  // Miyo keeps her broom on the street until Sōbē has taken her on at the press
  L.routine('blockprint', 'mp_miyo', { base: 'mp.blockprint:mp_miyo', pin: '!quest.mp_apprentice=done', slots: [
    { map: 'mp.pressroom', x: 9, y: 3, dir: 'up', line: ['{活字|かつじ} を {拾|ひろ}う の 、 お{兄|にい}ちゃん より {早|はや}く なった よ ！ …… {一|ひと}つ だけ だ けど 。', 'I pick type faster than my brother now! …For one letter, anyway.'] },
    { map: 'mp.blockprint', x: 9, y: 20, dir: 'up', line: ['{刷|す}った {紙|かみ} を {干|ほ}す の も 、 {見習|みなら}い の {仕事|しごと} ！ {字|じ} が {消|き}えない か 、 ちゃんと {見|み}てる の 。', 'Hanging the prints to dry is an apprentice\'s job too! I\'m making sure the letters don\'t fade.'] },
  ] });
  // the performers' manifest (src/content/zzz_living/00_work.js; tests/unit/perform.test.mjs): the routine's own work
  C.work = C.work || [];
  C.work.push({ map: 'mp.guild', id: 'mp_kakeru_r2', char: 'mp_kakeru', act: 'sort', why: 'the courier, sorting the day\'s post behind the guild\'s counter' });

  // ---- W3: who can be asked after whom ---------------------------------------------------------------------------------
  L.asks('mp_sanpei');
  L.knows('mp_sanpei', { mp_miyo: 'routine', mp_sobe: 'routine', mp_kakeru: 'routine',
    mp_genta: 'loose', mp_manbe: 'loose', mp_hayashi: 'loose', mp_tomi: 'loose', mp_shinobu: 'loose', mp_saku: 'loose', mb_sen: 'loose' });
  L.asks('mp_tomi');
  L.knows('mp_tomi', { mp_manbe: 'routine', mp_genta: 'routine', mp_hayashi: 'routine', mb_masa: 'routine', mb_masu: 'routine',
    mp_saku: 'loose', mp_shinobu: 'loose', mp_kakeru: 'loose', mp_sanpei: 'loose', mp_miyo: 'loose', mb_matsu: 'loose' });
  L.asks('mp_kakeru');
  L.knows('mp_kakeru', { mp_sobe: 'routine', mp_sanpei: 'routine', mp_miyo: 'routine', mp_tomi: 'routine', mp_manbe: 'routine', mp_shinobu: 'routine',
    mp_genta: 'loose', mp_hayashi: 'loose', mp_saku: 'loose', mb_sen: 'loose', mb_fujiko: 'loose', mb_yoshi: 'loose', mb_uno: 'loose', hana: 'loose' });
  L.asks('mp_sobe');
  L.cold('mp_sobe', ['{人|ひと} の {居場所|いばしょ} だ ？ {版木|はんぎ} の {字|じ} なら {読|よ}める が 、 {人|ひと} の {行|い}き{先|さき} まで は {読|よ}めない よ 。 {仕事|しごと} の {邪魔|じゃま} だ 。', 'Where people are? I can read the letters on a block, not where folk wander off to. You\'re in the way of my work.']);
  L.usual('mp_sobe', ['{親方|おやかた} は {仕事場|しごとば} です よ 。 {朝|あさ} から {晩|ばん} まで 。', 'The master\'s in the workshop. Morning till night.']);
  L.usual('mp_sanpei', ['サンペイ なら {刷|す}り{場|ば} だ よ 。 {手|て} を {墨|すみ} だらけ に して ね 。', 'Sanpei? At the press, ink up to the elbows.']);
  L.usual('mp_tomi', ['トミ さん は 、 {祭|まつ}り の {世話役|せわやく} の {所|ところ} か 、 {会所|かいしょ} です よ 。', 'Tomi? At the festival committee, or at the festival hall.']);
  L.usual('mp_manbe', ['マンベエ さん は 、 {芝居小屋|しばいごや} から {離|はな}れない よ 。', 'Manbē never strays far from the playhouse.']);
  L.usual('mp_shinobu', ['シノブ さん は 、 {長屋|ながや} の {部屋|へや} で {書|か}いて いる よ 。', 'Shinobu is writing, in the room in the tenement.']);

  // ---- W1: change beats -------------------------------------------------------------------------------------------
  // already there: their content is the chapters' own
  L.beat('blockprint', { id: 'festival_over', when: 'mb2_done', en: 'After the festival: the hall open for the summer, the boat up to Reedwake, the tonic seller\'s pitch empty', jp: '{祭|まつ}り の {後|あと}' });
  L.beat('blockprint', { id: 'playbill', when: 'ko_ret_mp', en: 'Manbē\'s old playbill has its words back', jp: '{古|ふる}い {番付|ばんづけ}' });
  L.beat('blockprint', { id: 'last_edition', when: 'ed>=2&postgame', en: 'Sanpei\'s last editions of the broadsheet', jp: '{最後|さいご} の {瓦版|かわらばん}' });
  // added
  L.beat('blockprint', { id: 'new_play', when: 'kr_done', en: 'A new play about the lamp-keepers\' road', jp: '{灯守|ひもり} の {芝居|しばい}' });
  L.beat('blockprint', { id: 'relay', when: 'cr_done', en: 'The courier guild takes letters over the Cloudroad', jp: '{雲路|くもじ} を {越|こ}える {便|びん}' });
  C.maps['mp.playhouse'].props.push({ p: 'mp_nobori', x: 33, y: 11, if: 'beat.blockprint.new_play', scene: 'kr.lw_mp_new_play_bill', o: { col: 'indigo' } });
  C.maps['mp.blockprint'].props.push({ p: 'fw_postnote', x: 28, y: 7, if: 'beat.blockprint.relay', scene: 'cr.lw_mp_relay_notice' });
  L.talk('mp.theatre:mp_manbe_a', [{ if: 'beat.blockprint.new_play&!seen.kr.lw_mp_manbe_play', scene: 'kr.lw_mp_manbe_play' }]);
  L.talk('mp.blockprint:mp_kakeru', [
    { if: 'beat.blockprint.relay&!seen.cr.lw_mp_kakeru_relay', scene: 'cr.lw_mp_kakeru_relay' },
    { if: 'lw_mp_relaymap_open&!seen.cr.lw_mp_kakeru_map', scene: 'cr.lw_mp_kakeru_map' }]);

  // ---- W6: return keys --------------------------------------------------------------------------------------------
  L.seal('mp_iroha', { map: 'mp.pressroom', x: 6, y: 2, p: 'kr_scroll', needs: 'mod_arayuru', opens: 'lw_mp_iroha_open', scene: 'ko.lw_mp_iroha_open',
    hint: ['{壁|かべ} に {掛|か}けた {古|ふる}い {版|はん} 。 ひらがな 、 カタカナ 、 {漢字|かんじ} …… あらゆる {字|じ} が {彫|ほ}って ある 。 {刷|す}る たび に 、 {違|ちが}う {種類|しゅるい} の {字|じ} が {消|き}えて しまう 。', 'An old printing block hung on the wall, cut with every kind of character: hiragana, katakana, kanji… Each time it is printed, a different kind fades away.'],
    openedLabel: ['いろは の {版|はん}', 'The iroha block'], after: { p: 'kr_scroll', scene: 'ko.lw_mp_iroha_after' } });
  L.seal('mp_curtain', { map: 'mp.theatre', x: 19, y: 4, p: 'fw_pulleypost', needs: 'mod_zentai', opens: 'lw_mp_curtain_open', scene: 'yn.lw_mp_curtain_open',
    hint: ['{古|ふる}い {引|ひ}き{幕|まく} の {綱|つな} 。 {昔|むかし} は 、 {一座|いちざ} {全員|ぜんいん} で {引|ひ}いた と いう 。 {一人|ひとり} ずつ {引|ひ}いて も 、 {幕|まく} は びくとも しない 。', 'The rope of the old draw curtain. Once, they say, the whole company pulled it together. Pull it one by one, and the curtain won\'t budge.'],
    openedLabel: ['{定式幕|じょうしきまく}', 'The house curtain'], after: { p: 'fw_pulleypost', scene: 'yn.lw_mp_curtain_after' } });
  L.seal('mp_relaymap', { map: 'mp.guild', x: 9, y: 2, p: 'kr_scroll', needs: 'mod_goto', opens: 'lw_mp_relaymap_open', scene: 'cr.lw_mp_relaymap_open',
    hint: ['{飛脚|ひきゃく} の {古|ふる}い {道中図|どうちゅうず} 。 {北|きた} へ {延|の}びる {道|みち} を {指|ゆび} で たどる と 、 {通|とお}った {所|ところ} から {墨|すみ} が {薄|うす}れて いく 。 {途中|とちゅう} で {息|いき} を {継|つ}げれば ……', 'The couriers\' old route map. Trace the road north with a finger, and the ink fades behind it. If only the trace could catch its breath along the way…'],
    openedLabel: ['{飛脚|ひきゃく} の {道中図|どうちゅうず}', 'The couriers\' route map'], after: { p: 'kr_scroll', scene: 'cr.lw_mp_relaymap_after' } });
  C.items.lw_iroha_print = { name: T('The iroha print', 'いろは の {刷|す}り{物|もの}'), key: true,
    desc: 'A sheet from the old teaching block in Blockprint Row\'s press room: the iroha poem, every kana once and only once, printed so that no kind of letter faded. A keepsake.' };

  C.notes.lw_mp_iroha = { title: T('The iroha poem', 'いろは {歌|うた}'), fiction: false,
    jp: '「いろは {歌|うた}」 は 、 かな を {一|ひと}つ ずつ 、 {一度|いちど} だけ {使|つか}った {古|ふる}い {歌|うた} 。 {昔|むかし} は 、 {字|じ} を {習|なら}う {子供|こども} の {手本|てほん} だった 。 かな の {順番|じゅんばん} と して も {使|つか}われた 。',
    en: 'The iroha (いろは歌) is a real poem, close to a thousand years old, that uses each of the old kana exactly once. Children learning to write copied it, and its order was long used like an alphabet to number things in sequence.' };
  C.notes.lw_mp_curtain = { title: T('The house curtain', '{定式幕|じょうしきまく}'), fiction: true,
    jp: '{歌舞伎|かぶき} の {芝居小屋|しばいごや} の {定式幕|じょうしきまく} は 、 {黒|くろ} 、 {柿色|かきいろ} 、 {萌|もえ}{葱|ぎ} の {縦縞|たてじま} 。 {芝居|しばい} の {通|とお}り の {幕|まく} の {裏|うら} に は 、 {昔|むかし} の {役者|やくしゃ} たち の {名前|なまえ} が {書|か}いて ある 。',
    en: 'The jōshiki-maku (定式幕), the kabuki theatre\'s striped house curtain of black, persimmon and leek green, is real. The old actors\' names on the back of Playhouse Row\'s curtain are the game\'s.' };
  C.notes.lw_mp_relaymap = { title: T('The couriers\' route map', '{飛脚|ひきゃく} の {道中図|どうちゅうず}'), fiction: true,
    jp: '{昔|むかし} の {継|つ}ぎ{飛脚|びきゃく} は 、 {宿場|しゅくば} ごと に {走|はし}る {人|ひと} を {替|か}えて 、 {遠|とお}く まで {手紙|てがみ} を {運|はこ}んだ 。 {版木|はんぎ} の {通|とお}り の {組合|くみあい} の {道中図|どうちゅうず} は 、 {雲路|くもじ} の {峠|とうげ} まで {続|つづ}いて いる 。',
    en: 'Relay couriers (継飛脚) of old changed runners at every post town and so carried letters great distances; that much is real history. The Blockprint guild\'s route map, running all the way to the Cloudroad\'s pass, is the game\'s.' };

  L.scenes(`
@scene kr.lw_mp_new_play_bill
narr: {新|あたら}しい {幟|のぼり} 。 「{秋|あき} の {芝居|しばい} ・ {灯守|ひもり} の {道|みち} 。 {灯守|ひもり} の {見習|みなら}い の {話|はなし}」 。 || A new banner: "The autumn play: The Lamp-Keepers' Road. The tale of the keepers' apprentice."

@scene kr.lw_mp_manbe_play
!faceplayer
mp_manbe: {秋|あき} の {演目|えんもく} が {決|き}まりました ！ {灯守|ひもり} の {道|みち} の {話|はなし} です 。 {旅|たび} の {絵解|えと}き から {聞|き}いた {話|はなし} を 、 {芝居|しばい} に します 。 || The autumn programme is settled! The tale of the lamp-keepers' road. We're making a play of a story we heard from a travelling picture-scroll teller.
mp_manbe: {最後|さいご} に {灯|ひ} が {全部|ぜんぶ} {点|つ}く {場面|ばめん} で は 、 {舞台|ぶたい} の {灯|あか}り を {全部|ぜんぶ} {使|つか}います よ 。 {大入|おおい}り {間違|まちが}い なし です ！ || For the last scene, where every lamp comes on, we'll use every light the stage has. A full house, no doubt about it!
?(comp=ren) comp[smile]: …… {灯守|ひもり} の {話|はなし} が 、 {舞台|ぶたい} に 。 {見|み}に {来|き}ます 。 {必|かなら}ず 。 || …A lamp-keepers' tale, on the stage. I'll come and see it. Without fail.
?(comp=suzu) comp[laugh]: {灯|あか}り を {全部|ぜんぶ} ？ {役者|やくしゃ} が {眩|まぶ}しくて 、 {台詞|せりふ} を {忘|わす}れちゃう わ よ 。 || Every light? The actors will be so dazzled they'll forget their lines.

@scene cr.lw_mp_relay_notice
narr: {組合|くみあい} の {張|は}り{紙|がみ} 。 「{雲路|くもじ} の {継|つ}ぎ{飛脚|びきゃく} 、 また {始|はじ}まりました 。 {山|やま} の {向|む}こう へ の {手紙|てがみ} 、 ここ で {受|う}け{付|つ}けます 。」 || The guild's notice: "The Cloudroad relay is running again. Letters for beyond the mountains accepted here."

@scene cr.lw_mp_kakeru_relay
!faceplayer
mp_kakeru: {聞|き}いた か ？ {雲路|くもじ} の {継|つ}ぎ{飛脚|びきゃく} が {戻|もど}った ！ {宿|しゅく} ごと に {足|あし} を {替|か}えて 、 {山|やま} を {越|こ}える ん だ と よ 。 || Heard? The Cloudroad relay's back! Fresh legs at every station, over the mountains, so they say.
mp_kakeru: {一人|ひとり} で {全部|ぜんぶ} {走|はし}る の が {一番|いちばん} {速|はや}い と {思|おも}って いた が …… {継|つ}ぐ {方|ほう} が 、 {遠|とお}く まで {届|とど}く 。 {悔|くや}しい けど な 。 || I always thought running the whole way yourself was fastest… but passing it on reaches further. Annoying, but there it is.
?(comp=nao) mp_kakeru: …… ナオ 。 {今度|こんど} の {勝負|しょうぶ} は 、 {継|つ}ぎ で やろう ぜ 。 {組|くみ} {同士|どうし} で 。 || …Nao. Next race, let's make it a relay. Team against team.
?(comp=nao) comp[smirk]: {望|のぞ}む ところ だ 。 || Suits me.

@scene cr.lw_mp_kakeru_map
!faceplayer
mp_kakeru: {組合|くみあい} の {道中図|どうちゅうず} 、 {読|よ}めた って ？ {雲路|くもじ} まで ！ {爺|じい}さん の {爺|じい}さん の {頃|ころ} は 、 あそこ まで {走|はし}って いた ん だ な 。 || You got the guild's route map to read? All the way to the Cloudroad! In my grandfather's grandfather's day, they ran that far.
mp_kakeru: {壁|かべ} に {掛|か}けて おいて くれ 。 {新入|しんい}り に {見|み}せて 、 {自慢|じまん} する から よ 。 || Leave it up on the wall. I'll show it off to the new hands.

@scene ko.lw_mp_iroha_open
narr: あらゆる {字|じ} を 、 あらゆる {風|かぜ} から {守|まも}る 。 {葉守|はもり} の {言葉|ことば} を {思|おも}い{出|だ}して 、 {版|はん} に {墨|すみ} を {置|お}いた 。 || Guard every kind of letter from every kind of wind. Remembering the leaf-keepers' words, you ink the block.
!look mp_sanpei pc
mp_sanpei: …… {消|き}えない ！ ひらがな も 、 カタカナ も 、 {漢字|かんじ} も 、 {全部|ぜんぶ} {残|のこ}ってる ！ || …It isn't fading! Hiragana, katakana, kanji, every one of them is still there!
narr: {刷|す}り{上|あ}がった {紙|かみ} に は 、 {古|ふる}い {歌|うた} 。 「いろはにほへと 、 ちりぬるを ……」 。 かな を {一|ひと}つ ずつ 、 {一度|いちど} だけ {使|つか}った {歌|うた} だ 。 || On the printed sheet, an old poem: "Iro ha nihoheto, chirinuru wo…" A poem that uses every kana once, and only once.
mp_sanpei: {親方|おやかた} の {親方|おやかた} が 、 {見習|みなら}い に {字|じ} を {教|おし}える ため に {彫|ほ}った {版|はん} です 。 {一枚|いちまい} 、 {持|も}って いって ください 。 || My master's master cut that block to teach the apprentices their letters. Please, take a sheet.
!give lw_iroha_print
!note lw_mp_iroha
?(comp=suzu) comp[smile]: いろは 。 {子役|こやく} の {頃|ころ} 、 {楽屋|がくや} で {覚|おぼ}えた わ 。 || Iroha. I learned it in the dressing room, when I was a child actor.
?(comp=ren) comp: {字|じ} を {全部|ぜんぶ} 、 {一度|いちど} ずつ 。 {灯|ひ} の {名前|なまえ} を {呼|よ}ぶ {順番|じゅんばん} に 、 {似|に}て います 。 || Every letter, once each. Like the order the lamps' names are called in.
!refresh

@scene ko.lw_mp_iroha_after
narr: いろは の {版|はん} 。 {刷|す}れば 、 どの {種類|しゅるい} の {字|じ} も {消|き}えない 。 || The iroha block. Printed now, no kind of letter fades.

@scene yn.lw_mp_curtain_open
narr: {一人|ひとり} ずつ で は なく 、 {一座|いちざ} {全体|ぜんたい} で 。 {谷|たに} で {覚|おぼ}えた {言葉|ことば} を {綱|つな} に {込|こ}めて 、 {引|ひ}いた 。 || Not one by one: the company as a whole. You put the word you learned in the valley into the rope, and pull.
narr: {古|ふる}い {幕|まく} が 、 {重|おも}い {音|おと} を {立|た}てて {動|うご}いた 。 {黒|くろ} 、 {柿色|かきいろ} 、 {萌|もえ}{葱|ぎ} の {縦縞|たてじま} 。 {裏|うら} に は 、 {昔|むかし} の {役者|やくしゃ} たち の {名前|なまえ} が {墨|すみ} で {書|か}いて あった 。 || The old curtain moves with a heavy sound: stripes of black, persimmon and leek green. On its back, in ink, the names of the actors of long ago.
mp_manbe: {定式幕|じょうしきまく} が {動|うご}いた ！ {先代|せんだい} の {頃|ころ} から 、 {誰|だれ} も {引|ひ}けなかった のに 。 || The house curtain moved! Nobody's been able to draw it since the last manager's day.
mp_manbe: {裏|うら} の {名前|なまえ} 、 {見|み}て ください 。 {一番|いちばん} {下|した} の {小|ちい}さい {字|じ} まで 、 {全部|ぜんぶ} {残|のこ}って います 。 || Look at the names on the back. Down to the smallest at the very bottom, every one is still there.
?(comp=suzu) comp[smile]: {一座|いちざ} {全体|ぜんたい} で {一|ひと}つ の {幕|まく} 。 …… {谷|たに} で {言|い}った とおり でしょ 。 || The whole company, one curtain. …Just as I said in the valley.
?(comp=nao) comp: {重|おも}い {荷|に} は 、 {全員|ぜんいん} で {担|かつ}ぐ 。 {当|あ}たり{前|まえ} の こと だ 。 || A heavy load, everyone carries together. Stands to reason.
?(comp=mio) comp[smile]: {一人|ひとり} じゃ {動|うご}かない もの も 、 {皆|みんな} で なら {動|うご}く ん です ね 。 || What won't move for one person moves for everyone together.
?(comp=ren) comp: {灯|ひ} も {幕|まく} も 、 {一|ひと}つ の {体|からだ} と して {動|うご}かす 。 …… {覚|おぼ}えて おきます 。 || Lamps and curtains, moved as one body. …I'll remember that.
!note lw_mp_curtain
!refresh

@scene yn.lw_mp_curtain_after
narr: {定式幕|じょうしきまく} の {綱|つな} 。 {幕|まく} の {裏|うら} に は 、 {昔|むかし} の {役者|やくしゃ} たち の {名前|なまえ} 。 || The house curtain's rope. On the curtain's back, the names of the actors of long ago.

@scene cr.lw_mp_relaymap_open
narr: {一度|いちど} に {全部|ぜんぶ} で は なく 、 {宿|しゅく} ごと に 。 {一|ひと}つ の {宿場|しゅくば} で {止|と}まって は 、 {新|あたら}しい {墨|すみ} で {次|つぎ} の {区間|くかん} を たどる 。 || Not all at once, but station by station. You stop at each post town and trace the next leg in fresh ink.
narr: {墨|すみ} は もう {薄|うす}れない 。 {道|みち} は {山|やま} を {越|こ}えて 、 {雲路|くもじ} の {峠|とうげ} まで {続|つづ}いて いた 。 || The ink fades no more. The road climbs over the mountains, all the way to the Cloudroad's pass.
?(comp=nao) comp: …… {昔|むかし} の {飛脚|ひきゃく} は 、 ここ まで {走|はし}った の か 。 {宿|しゅく} ごと に 、 {次|つぎ} の {足|あし} に {渡|わた}して 。 || …So the couriers of old ran all this way. Handing on to fresh legs at every station.
?(comp=mio) comp[smile]: {薬|くすり} と {同|おな}じ だ ね 。 {一度|いちど} に {全部|ぜんぶ} で は なく 、 {一回|いっかい} ごと に {少|すこ}し ずつ 。 || Like medicine. Not all at once: a little, every time.
?(comp=ren) comp: {一区間|ひとくかん} ずつ 、 {新|あたら}しい {墨|すみ} 。 {灯|ひ} の {芯|しん} を {切|き}る の と {同|おな}じ です 。 || A fresh line of ink for each leg. The same as trimming a wick.
?(comp=suzu) comp[laugh]: {一座|いちざ} の {旅|たび} と {同|おな}じ ね 。 {町|まち} ごと に {一幕|ひとまく} 。 || Like a troupe on tour. One act in every town.
!note lw_mp_relaymap
!refresh

@scene cr.lw_mp_relaymap_after
narr: {飛脚|ひきゃく} の {道中図|どうちゅうず} 。 {北|きた} へ の {道|みち} が 、 {雲路|くもじ} の {峠|とうげ} まで 、 はっきり {描|か}かれて いる 。 || The couriers' route map. The road north is drawn clearly, all the way to the Cloudroad's pass.
`);

  // Suzu's Kansai-ben for her lines above (src/lang/85_dialect.js; docs/dialect/suzu_kansai.md)
  RB.dialect.add('kansai', `
@ zzz_living/31_mp [kr.lw_mp_manbe_play]
= {灯|あか}り を {全部|ぜんぶ} ？ {役者|やくしゃ} が {眩|まぶ}しくて 、 {台詞|せりふ} を {忘|わす}れちゃう わ よ 。 || Every light? The actors will be so dazzled they'll forget their lines.
> {灯|あか}り を {全部|ぜんぶ} ？ {役者|やくしゃ} が {眩|まぶ}しくて 、 {台詞|せりふ} {忘|わす}れて まう で 。 || Every light? The actors'll be so dazzled they'll forget their lines.
@ zzz_living/31_mp [ko.lw_mp_iroha_open]
= いろは 。 {子役|こやく} の {頃|ころ} 、 {楽屋|がくや} で {覚|おぼ}えた わ 。 || Iroha. I learned it in the dressing room, when I was a child actor.
> いろは や 。 {子役|こやく} の {頃|ころ} 、 {楽屋|がくや} で {覚|おぼ}えた ん や 。 || Iroha. Learned it in the dressing room, back when I was a child actor.
@ zzz_living/31_mp [yn.lw_mp_curtain_open]
= {一座|いちざ} {全体|ぜんたい} で {一|ひと}つ の {幕|まく} 。 …… {谷|たに} で {言|い}った とおり でしょ 。 || The whole company, one curtain. …Just as I said in the valley.
> {一座|いちざ} {全体|ぜんたい} で {一|ひと}つ の {幕|まく} や 。 …… {谷|たに} で {言|い}うた とおり やろ 。 || The whole company, one curtain. …Just like I said in the valley.
@ zzz_living/31_mp [cr.lw_mp_relaymap_open]
= {一座|いちざ} の {旅|たび} と {同|おな}じ ね 。 {町|まち} ごと に {一幕|ひとまく} 。 || Like a troupe on tour. One act in every town.
> {一座|いちざ} の {旅|たび} と {一緒|いっしょ} や な 。 {町|まち} ごと に {一幕|ひとまく} や 。 || Like a troupe on tour. One act in every town.
`, 'zzz_living/31_mp.js');
})(RB.living);
