/* Manybridge's Living World (C-87; docs/future/work/LW1_AUTHORING.md, LW1_ROLLOUT.md): the Exchange district, Warehouse
 * Row, the ferry pier and their rooms, from the chapter's end (`mb1_done`). Blockprint and Playhouse Rows are a town of
 * their own (31_mp.js).
 * W2 routines: Ichi learning more bridges' names (Sen's register at the Tally Exchange, Yoshi's old addresses in the
 *   dead-letter office); Haru at the well or at Masaya's stall (a note on her door says which); Zenzō, once his
 *   grandfather's agreement is home (pinned until then), at tea in Fujiya or at Kawaya's river window.
 * W3 "Have you seen…?": Uno at the inn, Sen at the Exchange and Masa at the stall; Heiji, busy with his books, won't say.
 * W1 change beats. Registered (already there): Gonta back at work after the dispute; Matsu at the fireworks if she was
 *   invited (Blockprint's festival); the porters' yard board given its words back (a leaf home from Kotonoha). Added:
 *   Cinder Orchard's dried persimmons on the pier and at Fujiya (Cinder Orchard done); letters for Snowbell leaving the
 *   dead-letter office, and the northern post's notice by the Exchange's postbox (Snowbell done).
 * W5: none. Manybridge has no road map: Tetsu's ferry and Kōji's river boat reach it, and Blockprint Row is its own
 *   street up from the Exchange.
 * W6 return keys: the knotted letters in the dead-letter office (いくつか, Chapter 4), the little door in the Harbour
 *   Bridge's footing (your own boat: the sea licence), Warehouse Row's board of storehouse marks (すべて, Chapter 7). */
var RB = (globalThis.RB = globalThis.RB || {});
(function (L) {
  'use strict';
  const C = RB.content, T = L.T;
  RB.lex.add(RB.lex.parseTable(`
結び文|むすびぶみ|n|A|a knotted letter (a letter folded into a narrow strip and tied in a knot)
橋脚|きょうきゃく|n|A|bridge pier, a bridge's footing
屋号|やごう|n|A|a house's trade name (a shop's or family's name and mark)
井桁|いげた|n|A|well-frame (the # shape of a well's curb; a common mark)
好物|こうぶつ|n|I|favourite food, something you love to eat
日本|にほん|n|F|Japan
`));

  L.town('manybridge', {
    name: T('Manybridge', '{八百橋|やおばし}'),
    maps: ['mb.pier', 'mb.exchange', 'mb.kura', 'mb.tally', 'mb.fujiya', 'mb.porters', 'mb.inn', 'mb.deadletter', 'mb.lockhouse', 'mb.yard'],
    care: ['mb2_done', 'ch3_done', 'ch4_done', 'ko_done'],
    after: 'mb1_done',
  });

  // ---- W2: routines -------------------------------------------------------------------------------------------------
  L.routine('manybridge', 'mb_ichi', { base: 'mb.exchange:mb_ichi', slots: [
    { map: 'mb.tally', x: 11, y: 4, dir: 'up', line: ['セン さん が {帳面|ちょうめん} を {見|み}せて くれる ん だ 。 {橋|はし} の {名前|なまえ} が 、 {番号|ばんごう} の {順|じゅん} に {全部|ぜんぶ} {書|か}いて ある ！', 'Sen lets me look at the register. Every bridge\'s name is in it, in number order!'] },
    { map: 'mb.deadletter', x: 8, y: 4, dir: 'left', line: ['{古|ふる}い {手紙|てがみ} の {宛名|あてな} に は 、 {知|し}らない {橋|はし} の {名前|なまえ} が ある ん だ よ 。 ヨシ さん が {読|よ}んで くれる 。 {八百|はっぴゃく} に 、 また {近|ちか}づいた ！', 'Old letters have bridges I don\'t know in their addresses. Yoshi reads them to me. Another step closer to eight hundred!'] },
  ] });
  L.routine('manybridge', 'mb_haru', { base: 'mb.exchange:mb_haru', slots: [
    { map: 'mb.exchange', x: 28, y: 31, dir: 'left', line: ['{水|みず} を {汲|く}み に {来|き}ました 。 イチ は 、 また どこ か で {橋|はし} の {名前|なまえ} を {覚|おぼ}えて いる でしょう 。', 'I\'ve come for water. Ichi will be off learning bridge names somewhere again.'] },
    { map: 'mb.exchange', x: 16, y: 27, dir: 'up', line: ['{今夜|こんや} は まさ{屋|や} の お{蕎麦|そば} に します 。 イチ の {好物|こうぶつ} な ん です よ 。', 'Masaya\'s soba tonight. It\'s Ichi\'s favourite.'] },
  ] });
  L.away('manybridge', 'mb_haru', { map: 'mb.exchange', x: 33, y: 29, p: 'fw_note', line: ['{戸|と} の {横|よこ} に {書|か}き{置|お}き 。 「{井戸|いど} か 、 まさ{屋|や} に います 。 ハル」', 'A note by the door: "At the well, or at Masaya\'s. —Haru"'] });
  // Zenzō keeps to Warehouse Row while his grandfather's agreement is still to find
  L.routine('manybridge', 'mb_zenzo', { base: 'mb.kura:mb_zenzo', pin: '!quest.mb_lc=done', slots: [
    { map: 'mb.fujiya', x: 10, y: 4, dir: 'left', line: ['{六十年|ろくじゅうねん} {分|ぶん} の {話|はなし} が ある から のう 。 {茶|ちゃ} が {何杯|なんばい} あって も {足|た}りん わい 。', 'Sixty years\' worth to talk over. No amount of tea is enough.'] },
    { map: 'mb.inn', x: 3, y: 7, dir: 'up', line: ['{茶|ちゃ} の {後|あと} は 、 ここ で {川|かわ} の {音|おと} を {聞|き}く んじゃ 。 {年寄|としよ}り の {楽|たの}しみ じゃ よ 。', 'After tea I sit here and listen to the river. An old man\'s pleasure.'] },
  ] });

  // ---- W3: who can be asked after whom ---------------------------------------------------------------------------------
  L.asks('mb_uno');
  L.knows('mb_uno', { mb_haru: 'routine', mb_ichi: 'routine', mb_zenzo: 'routine', mb_masa: 'routine', mb_masu: 'routine', mb_take: 'routine',
    mb_gonta: 'loose', mb_yoshi: 'loose', mb_kansuke: 'loose', mb_fujiko: 'loose', mb_matsu: 'loose', mb_sen: 'loose', mb_heiji: 'loose' });
  L.asks('mb_sen');
  L.knows('mb_sen', { mb_fujiko: 'routine', mb_heiji: 'routine', mb_gonta: 'routine', mb_take: 'routine', mb_yoshi: 'routine', mb_ichi: 'routine', mb_matsu: 'routine',
    mb_zenzo: 'loose', mb_uno: 'loose', mb_haru: 'loose', mb_kansuke: 'loose', mp_sanpei: 'loose' });
  L.asks('mb_masa');
  L.knows('mb_masa', { mb_masu: 'routine', mb_haru: 'routine', mb_ichi: 'routine', mb_gonta: 'routine', mb_take: 'routine',
    mb_uno: 'loose', mb_kansuke: 'loose', mb_zenzo: 'loose', mb_heiji: 'loose', mp_tomi: 'loose' });
  L.asks('mb_heiji');
  L.cold('mb_heiji', ['{米|こめ} の {行方|ゆくえ} なら {分|わ}かる が 、 {人|ひと} の {行方|ゆくえ} は {知|し}らん 。 {帳面|ちょうめん} で {忙|いそが}しい ん だ 。', 'Where rice goes, I can tell you. Where people go, I couldn\'t say. I\'ve my books to keep.']);
  L.usual('mb_take', ['タケ さん なら 、 {渡|わた}し{場|ば} か {札場|ふだば} の {前|まえ} で 、 {荷|に} を {運|はこ}んで います よ 。', 'Take? Carrying cargo, on the ferry pier or outside the Exchange.']);
  L.usual('mb_masa', ['まさ{屋|や} は 、 {赤|あか}い のれん の {屋台|やたい} です 。 {橋|はし} の そば です よ 。', 'Masaya is the stall with the red curtain, by the bridge.']);
  L.usual('mb_masu', ['ます{屋|や} は 、 {青|あお}い のれん の {屋台|やたい} です 。 {井戸|いど} の {前|まえ} です よ 。', 'Masuya is the stall with the blue curtain, in front of the well.']);
  L.usual('mb_uno', ['ウノ さん は {川屋|かわや} です 。 {宿|やど} の {帳場|ちょうば} から {動|うご}きません よ 。', 'Uno\'s at Kawaya. Never leaves the inn\'s front desk.']);
  L.usual('mb_fujiko', ['{藤屋|ふじや} の {女将|おかみ} は 、 {藤橋|ふじばし} の {向|む}こう の お{店|みせ} です 。', 'The mistress of Fujiya is in her shop, over the Wisteria Bridge.']);
  L.usual('mb_heiji', ['ヘイジ さん は 、 {蔵|くら} の {並|なら}び の 、 {自分|じぶん} の {蔵|くら} の {前|まえ} です 。', 'Heiji? Outside his own storehouses, on Warehouse Row.']);
  L.usual('mb_gonta', ['ゴンタ さん は 、 {荷運|にはこ}び{屋|や} の {前|まえ} で {木箱|きばこ} を {運|はこ}んで います 。', 'Gonta\'s carrying crates outside the porters\' office.']);
  L.usual('mb_yoshi', ['ヨシ さん は 、 {届|とど}かない {手紙|てがみ} の {部屋|へや} に います 。 {札場|ふだば} の {隣|となり} です 。', 'Yoshi\'s in the dead-letter office, next to the Exchange.']);
  L.usual('mb_matsu', ['マツ さん は 、 {閘門|こうもん} の {家|いえ} から めったに {出|で}ません 。', 'Matsu hardly ever leaves the lock-keeper\'s house.']);
  L.usual('mb_sen', ['セン さん は {札場|ふだば} の {中|なか} です 。 いつも です 。', 'Sen? Inside the Exchange. Always.']);
  L.usual('mb_kansuke', ['カンスケ さん は 、 {蔵|くら} の {並|なら}び の {舟|ふね} の そば で 、 {網|あみ} を {繕|つくろ}って います 。', 'Kansuke mends nets by the boat on Warehouse Row.']);

  // ---- W1: change beats -------------------------------------------------------------------------------------------
  // already there: their content is the chapters' own
  L.beat('manybridge', { id: 'gonta', when: 'mb_dispute_done', en: 'Gonta back at work by the porters\' office', jp: '{荷運|にはこ}び{屋|や} の ゴンタ' });
  L.beat('manybridge', { id: 'fireworks', when: 'mb2_done&mp_inv_matsu', en: 'Matsu went to the fireworks', jp: 'マツ と {花火|はなび}' });
  L.beat('manybridge', { id: 'porters_board', when: 'ko_ret_mb', en: 'The porters\' yard board has its words back', jp: '{荷置|にお}き{場|ば} の {板|いた}' });
  // added: goods and letters from the towns further on
  L.beat('manybridge', { id: 'orchard', when: 'ch3_done', en: 'Dried persimmons from Cinder Orchard on the pier', jp: '{灰実|はいみ} の {里|さと} の {干|ほ}し{柿|がき}' });
  L.beat('manybridge', { id: 'north_post', when: 'ch4_done', en: 'Letters for Snowbell leave the dead-letter office', jp: '{北|きた} へ の {手紙|てがみ}' });
  C.maps['mb.pier'].props.push(
    { p: 'crate', x: 3, y: 12, if: 'beat.manybridge.orchard' },
    { p: 'crate', x: 4, y: 12, if: 'beat.manybridge.orchard', scene: 'co.lw_mb_persimmons' });
  C.maps['mb.exchange'].props.push({ p: 'fw_postnote', x: 21, y: 9, if: 'beat.manybridge.north_post', scene: 'sb.lw_mb_north_notice' });
  L.talk('mb.fujiya:mb_fujiko', [{ if: 'beat.manybridge.orchard&!seen.co.lw_mb_fujiko_persimmons', scene: 'co.lw_mb_fujiko_persimmons' }]);
  L.talk('mb.deadletter:mb_yoshi', [{ if: 'beat.manybridge.north_post&!seen.sb.lw_mb_yoshi_north', scene: 'sb.lw_mb_yoshi_north' }]);

  // ---- W6: return keys --------------------------------------------------------------------------------------------
  L.seal('mb_knots', { map: 'mb.deadletter', x: 9, y: 2, p: 'pet_papers', needs: 'mod_ikutsuka', opens: 'lw_mb_knots_open', scene: 'mp.lw_mb_knots_open',
    hint: ['{棚|たな} の {隅|すみ} に 、 {結|むす}び{文|ぶみ} の {束|たば} 。 {結|むす}び{目|め} を {一|ひと}つ ほどく と 、 {他|ほか} の {結|むす}び{目|め} が {締|し}まって しまう 。 いくつか {一度|いちど} に ほどければ ……', 'In the corner by the shelves, a bundle of knotted letters. Undo one knot and the others pull tight. If only you could undo a few at once…'],
    openedLabel: ['{結|むす}び{文|ぶみ} の {束|たば}', 'The knotted letters, untied'], after: { p: 'pet_papers_tidy', scene: 'mp.lw_mb_knots_after' } });
  L.seal('mb_footing', { map: 'mb.pier', x: 25, y: 9, p: 'sg_bollard', needs: 'item.sea_licence_doc', opens: 'lw_mb_footing_open', scene: 'sea.lw_mb_footing_open',
    hint: ['{港橋|みなとばし} の {下|した} 、 {橋脚|きょうきゃく} の {石|いし} に {小|ちい}さな {戸|と} が ある 。 {水|みず} の すぐ {上|うえ} で 、 {岸|きし} から は {届|とど}かない 。 {自分|じぶん} の {舟|ふね} が あれば ……', 'Under the Harbour Bridge there\'s a little door in the stone footing, just above the water and out of reach from the bank. If you had a boat of your own…'],
    openedLabel: ['{港橋|みなとばし} の {橋脚|きょうきゃく}', 'The Harbour Bridge\'s footing'], after: { p: 'sg_bollard', scene: 'sea.lw_mb_footing_after' } });
  L.seal('mb_marks', { map: 'mb.kura', x: 3, y: 17, p: 'signblank', needs: 'mod_subete', opens: 'lw_mb_marks_open', scene: 'kr.lw_mb_marks_open',
    hint: ['{蔵|くら} の {並|なら}び の {印|しるし} の {板|いた} 。 {蔵|くら} の {印|しるし} が 、 みんな {白|しろ}く なって いる 。 {一|ひと}つ {書|か}き{戻|もど}す と 、 {別|べつ} の {一|ひと}つ が {消|き}えて しまう 。 すべて を {一度|いちど} に {守|まも}れたら ……', 'Warehouse Row\'s board of storehouse marks. Every mark has gone white. Write one back and another fades. If you could guard them all at once…'],
    openedLabel: ['{蔵|くら} の {印|しるし} の {板|いた}', 'The board of storehouse marks'], after: { p: 'sign', scene: 'kr.lw_mb_marks_after' } });
  // what an opened spot leaves people to say (once)
  L.talk('mb.tally:mb_sen', [{ if: 'lw_mb_footing_open&!seen.sea.lw_mb_sen_builders', scene: 'sea.lw_mb_sen_builders' }]);
  // (Heiji has two placements on Warehouse Row, before and after the dispute: his words go on the later one)
  const heiji = (C.maps['mb.kura'].npcs || []).find((n) => n.id === 'mb_heiji' && n.if === 'mb_dispute_done');
  if (heiji) heiji.talk = [{ if: 'lw_mb_marks_open&!seen.kr.lw_mb_heiji_marks', scene: 'kr.lw_mb_heiji_marks' }].concat(typeof heiji.talk === 'string' ? [{ scene: heiji.talk }] : heiji.talk || []);

  C.notes.lw_mb_musubi = { title: T('Knotted letters', '{結|むす}び{文|ぶみ}'), fiction: true,
    jp: '{手紙|てがみ} を {細|ほそ}く {折|お}って {結|むす}ぶ 「{結|むす}び{文|ぶみ}」 は 、 {日本|にほん} に {昔|むかし} から ある {手紙|てがみ} の {形|かたち} 。 {八百橋|やおばし} で は 、 {約束|やくそく} の {結|むす}び{文|ぶみ} を 、 {結|むす}び{橋|ばし} の {欄干|らんかん} に {結|むす}んだ と {伝|つた}えられて いる 。',
    en: 'Folding a letter into a narrow strip and tying it in a knot, a musubi-bumi (結び文), is a real and very old way of sending a letter in Japan. Tying promises to the rail of Musubi Bridge is Manybridge\'s own custom, and the game\'s.' };
  C.notes.lw_mb_builders = { title: T('The builders\' stone', '{橋|はし} を {架|か}けた {人|ひと} たち'), fiction: true,
    jp: '{港橋|みなとばし} の {橋脚|きょうきゃく} の {中|なか} に 、 {橋|はし} を {架|か}けた {人|ひと} たち の {名前|なまえ} を {彫|ほ}った {石|いし} が ある 。 {港橋|みなとばし} は {船大工|ふなだいく} の {組|くみ} 。 {結|むす}び{橋|ばし} だけ は 、 「{名|な} を {知|し}らず」 。',
    en: 'Inside the Harbour Bridge\'s footing, a stone carved with the names of the people who built the city\'s bridges, each beside its bridge. The Harbour Bridge: the shipwrights\' crew. Only Musubi Bridge, the first, says "builder unknown".' };
  C.notes.lw_mb_kura_marks = { title: T('Storehouse marks', '{蔵|くら} の {印|しるし}'), fiction: true,
    jp: '{日本|にほん} の {蔵|くら} に は 、 {持|も}ち{主|ぬし} の {屋号|やごう} の {印|しるし} を {描|か}く こと が {多|おお}い 。 {山|やま} {形|がた} 、 {丸|まる} の {中|なか} に {一字|いちじ} 、 {井桁|いげた} など 。 {蔵|くら} の {並|なら}び の {印|しるし} の {板|いた} は 、 {八百橋|やおばし} の もの 。',
    en: 'Japanese storehouses often carry their owner\'s house mark (屋号): a mountain shape, a character in a circle, a well-frame (井桁). That is real; Warehouse Row\'s board of marks, and Heiji\'s rice in a circle, are the game\'s.' };

  L.scenes(`
@scene co.lw_mb_persimmons
narr: {木箱|きばこ} に {焼|や}き{印|いん} 。 「{灰実|はいみ} の {里|さと} ・ {干|ほ}し{柿|がき}」 。 {甘|あま}い {匂|にお}い が する 。 || A brand burned into the crate: "Cinder Orchard — dried persimmons". It smells sweet.
narr: {北|きた} の {道|みち} を {下|くだ}って 、 {潮硝子|しおがらす} から {舟|ふね} で {着|つ}いた らしい 。 || It seems they came down the north road and over from Saltglass by boat.

@scene co.lw_mb_fujiko_persimmons
!faceplayer
mb_fujiko: {灰実|はいみ} の {里|さと} の {干|ほ}し{柿|がき} が 、 うち に {入|はい}る よう に なった よ 。 {北|きた} の {道|みち} が {通|とお}った おかげ さ 。 || Cinder Orchard's dried persimmons come to us now. All thanks to the north road being open.
mb_fujiko: {今年|ことし} の は {甘|あま}い ね 。 {札|ふだ} に も ちゃんと 「{甘|あま}い」 と {書|か}いて おいた 。 {嘘|うそ} の ない {札|ふだ} は 、 よく {売|う}れる ん だ よ 。 || This year's are sweet. I wrote "sweet" on the tally, too. A tally that doesn't lie sells well.
?(comp=mio) comp[smile]: {干|ほ}し{柿|がき} は 、 {長|なが}い {旅|たび} に いい です ね 。 {軽|かる}くて 、 {甘|あま}くて 。 || Dried persimmons are good for a long journey. Light, and sweet.
?(comp=nao) comp: {灰実|はいみ} の {柿|かき} が 、 {舟|ふね} で ここ まで 。 {道|みち} が {開|ひら}けば 、 {荷|に} も {手紙|てがみ} も {届|とど}く 。 || Cinder Orchard's persimmons, all the way here by boat. Open a road, and goods and letters both get through.

@scene sb.lw_mb_north_notice
narr: {郵便|ゆうびん} {箱|ばこ} の {横|よこ} に 、 {新|あたら}しい {張|は}り{紙|がみ} 。 「{北|きた} の {便|びん} 、 また {始|はじ}めます 。 {灰実|はいみ} の {里|さと} 、 {雪鈴|ゆきすず} まで 。 {月|つき} に {三度|さんど} {出|で}ます 。」 || A new notice beside the postbox: "The northern post runs again, to Cinder Orchard and Snowbell. It leaves three times a month."

@scene sb.lw_mb_yoshi_north
!faceplayer
mb_yoshi: {雪鈴|ゆきすず} {宛|あ}て の {手紙|てがみ} が 、 ここ で {何年|なんねん} も {待|ま}って いた ん です 。 {北|きた} の {道|みち} が {通|とお}じた ので 、 {今朝|けさ} やっと {送|おく}り{出|だ}しました 。 || Letters addressed to Snowbell had waited here for years. With the north road through, I finally sent them off this morning.
mb_yoshi: {宛先|あてさき} の {方|ほう} が 、 まだ そこ に いて くれれば いい の です けど 。 || I do hope the people they're for are still there.
?(comp=nao) comp: {何年|なんねん} {待|ま}って も 、 {手紙|てがみ} は {手紙|てがみ} だ 。 {届|とど}けば 、 {遅|おそ}すぎる こと は ない 。 || However many years it waits, a letter is still a letter. If it arrives, it isn't too late.

@scene mp.lw_mb_knots_open
narr: {結|むす}び{目|め} を いくつか {選|えら}んで 、 {一度|いちど} に ほどく 。 {束|たば} が ふわり と {緩|ゆる}んだ 。 || You choose a few of the knots and undo them at once. The bundle loosens with a sigh.
narr: {中|なか} は 、 {細|ほそ}く {折|お}って {結|むす}んだ {手紙|てがみ} ばかり 。 {宛名|あてな} は どれ も 「{結|むす}び{橋|ばし} の たもと」 。 || Inside: nothing but letters folded into narrow strips and knotted. Every one is addressed "At the foot of Musubi Bridge".
!look mb_yoshi pc
mb_yoshi: {結|むす}び{橋|ばし} …… 。 {名前|なまえ} が {消|き}えて いた から 、 どこ へ {届|とど}ける の か {分|わ}からなかった の ね 。 || Musubi Bridge… With its name gone, nobody knew where they were meant to go.
mb_yoshi: {昔|むかし} は 、 {約束|やくそく} を {結|むす}び{文|ぶみ} に して 、 {橋|はし} の {欄干|らんかん} に {結|むす}んだ そう です 。 「また {会|あ}おう」 「{必|かなら}ず {返|かえ}す」 …… 。 || Long ago, they say, people wrote their promises as knotted letters and tied them to the bridge's rail. "Let's meet again." "I'll pay you back, I swear"…
mb_yoshi: マツ さん に {頼|たの}んで 、 {下|した} の {橋|はし} へ {持|も}って いって もらいましょう 。 {何十年|なんじゅうねん} {遅|おく}れ でも 、 {宛先|あてさき} に {着|つ}きます 。 || I'll ask Matsu to take them down to the bridge below. Decades late, but they'll reach their address.
!note lw_mb_musubi
!refresh

@scene mp.lw_mb_knots_after
narr: {結|むす}び{文|ぶみ} は ほどかれて 、 きれい に {重|かさ}ねて ある 。 {宛名|あてな} は みんな 「{結|むす}び{橋|ばし} の たもと」 。 || The knotted letters lie untied and neatly stacked, every one addressed "At the foot of Musubi Bridge".

@scene sea.lw_mb_footing_open
narr: {自分|じぶん} の {舟|ふね} を {港|みなと} から {回|まわ}して 、 {橋|はし} の {下|した} へ そっと {漕|こ}ぎ{入|い}れ 、 {杭|くい} に {繋|つな}いだ 。 || You bring your own boat round from the harbour, row quietly in under the bridge, and tie up at the post.
narr: {小|ちい}さな {戸|と} の {奥|おく} に 、 {石|いし} が {一枚|いちまい} 。 {橋|はし} を {架|か}けた {人|ひと} たち の {名前|なまえ} が 、 {橋|はし} の {名前|なまえ} と {並|なら}べて {彫|ほ}って ある 。 || Behind the little door, a single stone slab, carved with the names of the people who built the bridges, each beside its bridge.
narr: 「{港橋|みなとばし} 、 {船大工|ふなだいく} の {組|くみ} 。 …… {結|むす}び{橋|ばし} 、 {名|な} を {知|し}らず 。」 || "Harbour Bridge: the shipwrights' crew. … Musubi Bridge: builder unknown."
?(comp=nao) comp: {橋|はし} に も 、 {差出人|さしだしにん} が いる わけ か 。 || So bridges have senders too.
?(comp=mio) comp[smile]: {作|つく}った {人|ひと} の {名前|なまえ} が 、 {水|みず} の そば で {守|まも}られて いた ん です ね 。 || The makers' names, kept safe down by the water.
?(comp=ren) comp: {灯|ひ} の {記録|きろく} と {同|おな}じ です 。 {誰|だれ} が {点|つ}けた か 、 {残|のこ}して おく 。 || Like a lamp register. You keep a record of who lit it.
?(comp=suzu) comp[laugh]: {舞台|ぶたい} の {裏|うら} の {名前|なまえ} ね 。 {座長|ざちょう} より {大事|だいじ} な {名前|なまえ} よ 。 || The names backstage. They matter more than the head of the company's.
!note lw_mb_builders
!refresh

@scene sea.lw_mb_footing_after
narr: {舟|ふね} を {繋|つな}いだ {杭|くい} 。 {橋|はし} の {下|した} の {石|いし} は 、 {今|いま} も {橋|はし} を {架|か}けた {人|ひと} たち の {名前|なまえ} を {守|まも}って いる 。 || The post you moored to. Under the bridge, the stone still keeps its builders' names.

@scene sea.lw_mb_sen_builders
!faceplayer
mb_sen: {港橋|みなとばし} の {下|した} に 、 {架|か}けた {人|ひと} の {名前|なまえ} が ？ …… {帳面|ちょうめん} に {欄|らん} を {一|ひと}つ {足|た}します 。 「{架|か}けた {人|ひと}」 。 || The builders' names, under the Harbour Bridge? …I'll add a column to the register: "Built by".
mb_sen: {名前|なまえ} の {横|よこ} に 、 もう {一|ひと}つ {名前|なまえ} 。 {帳面|ちょうめん} が 、 {少|すこ}し {重|おも}く なります ね 。 || A name beside every name. The register gets a little heavier.

@scene kr.lw_mb_marks_open
narr: {一|ひと}つ ずつ で は なく 、 すべて の {印|しるし} を {一度|いちど} に {守|まも}る 。 || Not one at a time: you guard every mark at once.
narr: {山|やま} {形|がた} 、 {丸|まる} に {米|こめ} 、 {井桁|いげた} …… 。 {板|いた} の {上|うえ} に 、 {蔵|くら} の {印|しるし} が {揃|そろ}って {戻|もど}った 。 もう {消|き}えない 。 || A mountain, rice in a circle, a well-frame… The storehouse marks come back onto the board all together, and this time none fades.
?(comp=ren) comp: {灯守|ひもり} の {言葉|ことば} です ね 。 「すべて の {灯|ひ} を {守|まも}る」 。 {印|しるし} に も {効|き}く ん です ね 。 || The lamp-keepers' saying. "A keeper guards every lamp." It works on marks too.
?(comp=nao) comp: {宛名|あてな} と {同|おな}じ だ 。 {印|しるし} が あれば 、 {荷|に} は {迷|まよ}わない 。 || Same as an address. With a mark on it, cargo doesn't go astray.
?(comp=mio) comp[smile]: {薬|くすり} の {札|ふだ} と {同|おな}じ 。 {一|ひと}つ でも {消|き}えたら 、 {困|こま}る から 。 || Like medicine labels. If even one goes, there's trouble.
?(comp=suzu) comp: {一座|いちざ} の {名前|なまえ} も 、 {一人|ひとり} {欠|か}けたら {番付|ばんづけ} に ならない の よ 。 || A company's names too: one missing, and it's not a playbill.
!note lw_mb_kura_marks
!refresh

@scene kr.lw_mb_marks_after
narr: {蔵|くら} の {印|しるし} の {板|いた} 。 {山|やま} {形|がた} 、 {丸|まる} に {米|こめ} 、 {井桁|いげた} 。 どの {印|しるし} も 、 はっきり {読|よ}める 。 || The board of storehouse marks: a mountain, rice in a circle, a well-frame. Every mark reads clearly.

@scene kr.lw_mb_heiji_marks
!faceplayer
mb_heiji: …… {板|いた} の {印|しるし} 、 {見|み}た か 。 {丸|まる} に {米|こめ} 。 {祖父|そふ} の {代|だい} から の {印|しるし} だ 。 || …Seen the marks on the board? Rice in a circle. My grandfather's mark.
mb_heiji: {札|ふだ} を {書|か}き{直|なお}す より 、 {早|はや}かった な 。 …… {礼|れい} は {言|い}う 。 {一度|いちど} だけ だ ぞ 。 || Quicker than rewriting a tally. …You have my thanks. Just the once, mind.
`);

  // Suzu's Kansai-ben for her lines above (src/lang/85_dialect.js; docs/dialect/suzu_kansai.md)
  RB.dialect.add('kansai', `
@ zzz_living/30_mb [sea.lw_mb_footing_open]
= {舞台|ぶたい} の {裏|うら} の {名前|なまえ} ね 。 {座長|ざちょう} より {大事|だいじ} な {名前|なまえ} よ 。 || The names backstage. They matter more than the head of the company's.
> {舞台|ぶたい} の {裏|うら} の {名前|なまえ} や な 。 {座長|ざちょう} より {大事|だいじ} な {名前|なまえ} や で 。 || The names backstage. They matter more'n the head of the company's.
@ zzz_living/30_mb [kr.lw_mb_marks_open]
= {一座|いちざ} の {名前|なまえ} も 、 {一人|ひとり} {欠|か}けたら {番付|ばんづけ} に ならない の よ 。 || A company's names too: one missing, and it's not a playbill.
> {一座|いちざ} の {名前|なまえ} も 、 {一人|ひとり} {欠|か}けたら {番付|ばんづけ} に ならへん ねん で 。 || A company's names too: one missin', and it ain't a playbill.
`, 'zzz_living/30_mb.js');
})(RB.living);
