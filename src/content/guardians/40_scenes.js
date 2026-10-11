/* The old guardians: their shrines' scenes (expansion P15e; plan E16). A shrine is only there after the story
 * (src/content/zz_guardians.js); touching it wakes the guardian the first time, offers to face it (or not: "Not now"
 * costs nothing), and counts each meeting for the honest record (src/engine/98g_guardians.js). A win sets gd.<key>,
 * presses the guardian's stamp with that record, gives its keepsake once, and leaves the shrine quiet; a step back, a
 * fall or a conversation that ends another way leaves everything learned and lets you come back. Suzu's lines have
 * Kansai versions (src/content/dialect/kansai_99_guardians.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const G = [
    { key: 'rw', place: ['{水車小屋|すいしゃごや} の {古|ふる}い {柱|はしら}', 'The mill\'s oldest post'],
      wake: '{柱|はしら} に {触|さわ}る と 、 {梁|はり} の {上|うえ} で {誰|だれ} か が {咳払|せきばら}い を した 。 こだま に は 、 まだ {続|つづ}き が あった らしい 。 || You touch the post, and up in the rafters someone clears their throat. The echo, it seems, had more to say.',
      comp: {
        nao: '{今度|こんど} は {誰|だれ} の {声|こえ} だ ？ {偉|えら}そう な {爺|じい}さん みたい だ ぞ 。 || Whose voice is it this time? Sounds like a bossy old man.',
        mio: '{古|ふる}い {粉屋|こなや} さん の {声|こえ} ね 。 {指図|さしず} に {慣|な}れた {話|はな}し{方|かた} だ わ 。 || An old miller\'s voice. Someone used to giving orders.',
        ren: '{水車|すいしゃ} を {建|た}てた {人|ひと} の {声|こえ} かも しれません 。 {言葉|ことば} が 、 とても {古|ふる}い です 。 || It may be the voice of whoever built the mill. The words are very old.',
        suzu: '{座長|ざちょう} の {声|こえ} ね 。 {昔|むかし} の 。 {稽古場|けいこば} を {思|おも}い{出|だ}す わ 。 || That\'s a company manager\'s voice. An old one. Takes me back to rehearsals.',
      },
      won: '{石臼|いしうす} の {間|あいだ} に 、 {粉|こな} で {白|しろ}く なった {古|ふる}い {帽子|ぼうし} が {一|ひと}つ {残|のこ}って いた 。 || Between the millstones lies an old cap, white with flour.',
      after: '{古|ふる}い {柱|はしら} 。 {梁|はり} の {上|うえ} は 、 {静|しず}か だ 。 || The old post. The rafters are quiet.' },
    { key: 'sg', place: ['{古|ふる}い {書類棚|しょるいだな}', 'An old filing chest'],
      wake: '{書類棚|しょるいだな} の {引|ひ}き{出|だ}し が 、 {一|ひと}つ ずつ {勝手|かって} に {開|あ}いて いく 。 {奥|おく} から 、 {判子|はんこ} を {押|お}す {音|おと} が {聞|き}こえる 。 || The drawers of the filing chest open one by one on their own. From the back comes the thump of a rubber stamp.',
      comp: {
        nao: 'うわ 、 {役所|やくしょ} の {匂|にお}い が する 。 {俺|おれ} 、 これ {苦手|にがて} なんだ よ な 。 || Ugh, it smells like a government office. I can\'t stand these.',
        mio: '{潮|しお} の {書記|しょき} より 、 もっと {上|うえ} の {人|ひと} みたい ね 。 || Someone even higher up than the Tide Clerk, by the look of it.',
        ren: '{本局|ほんきょく} …… {書記|しょき} が {仕|つか}えて いた {所|ところ} です か 。 {丁寧|ていねい} に {話|はな}しましょう 。 || The head office… where the Clerk answered to. Let\'s speak politely.',
        suzu: 'お{役所|やくしょ} の {芝居|しばい} は 、 {台詞|せりふ} が {長|なが}い の よ ね 。 || Office plays always have the longest speeches.',
      },
      won: '{一番|いちばん} {上|うえ} の {引|ひ}き{出|だ}し に 、 {古|ふる}い {眼鏡|めがね} が {入|はい}って いた 。 {小|ちい}さな {札|ふだ} に 「 {次|つぎ} の {書記|しょき} へ 」 。 || In the top drawer is a pair of old spectacles, with a small tag: "For the next clerk."',
      after: '{書類棚|しょるいだな} 。 {引|ひ}き{出|だ}し は 、 きちんと {閉|し}まって いる 。 || The filing chest. Every drawer is neatly shut.' },
    { key: 'co', place: ['{窯|かま} の {奥|おく} の {石|いし}', 'The stone at the back of the kiln'],
      wake: '{灰|はい} の {下|した} で 、 {何|なに} か が {赤|あか}く {光|ひか}った 。 {番人|ばんにん} が {守|まも}って いた の は 、 この {火|ひ} だった の か 。 || Under the ash, something glows red. Was this the fire the Warden was guarding?',
      comp: {
        nao: '{熱|あつ}い ！ {近|ちか}づく だけ で {眉毛|まゆげ} が {焦|こ}げ そう だ 。 || Hot! I could singe my eyebrows just standing here.',
        mio: '{水|みず} を {用意|ようい} して おいた ほう が いい わ 。 {風|かぜ} は {絶対|ぜったい} に だめ よ 。 || We\'d better have water ready. And no wind, whatever happens.',
        ren: 'ここ で {最初|さいしょ} に {点|とも}された {火|ひ} …… {何百年|なんびゃくねん} も {消|き}えず に いた ん です ね 。 || The first fire lit here… it\'s been burning for hundreds of years.',
        suzu: '{見|み}て 、 {炎|ほのお} が {人|ひと} の {形|かたち} に なって いく 。 {大道具|おおどうぐ} さん も びっくり ね 。 || Look, the flames are taking a person\'s shape. The stagehands would be amazed.',
      },
      won: '{熾火|おきび} の {側|そば} に 、 {火|ひ} の {色|いろ} に {染|そ}まった {襟巻|えりま}き が {置|お}いて あった 。 {触|さわ}る と 、 まだ {温|あたた}かい 。 || By the embers lies a scarf dyed the colour of fire. It is still warm to the touch.',
      after: '{窯|かま} の {奥|おく} 。 {熾火|おきび} が 、 {静|しず}か に {赤|あか}い 。 || The back of the kiln. The embers glow quietly.' },
    { key: 'sb', place: ['{丸屋根|まるやね} の {真下|ました} の {石|いし}', 'The stone under the dome'],
      wake: '{屋根|やね} の {隙間|すきま} から 、 {星|ほし} の {光|ひかり} が {一筋|ひとすじ} {落|お}ちて きた 。 {光|ひかり} は {床|ゆか} で {止|と}まらず 、 だんだん {近|ちか}づいて くる 。 || A single ray of starlight falls through the slit in the dome. It does not stop at the floor; it keeps coming closer.',
      comp: {
        nao: '{星|ほし} が {降|お}りて くる なんて 、 {聞|き}いた こと ない ぞ 。 || A star coming down? Never heard of such a thing.',
        mio: '{待|ま}ちくたびれた {灯|ひ} の 、 {家族|かぞく} …… かしら 。 || The Lamp That Waited\'s… family, perhaps?',
        ren: '{鐘|かね} を {持|も}って いて ください 。 {小|ちい}さな {光|ひかり} が 、 {後|あと} から {来|き}そう です 。 || Keep a bell ready. Little lights look set to follow her down.',
        suzu: '{星|ほし} の {登場|とうじょう} 。 {照明|しょうめい} さん 、 {腕|うで} が いい わ ね 。 || A star\'s entrance. Whoever\'s on lights knows their job.',
      },
      won: '{床|ゆか} に 、 {星|ほし} の {欠片|かけら} の よう な {耳飾|みみかざ}り が {二|ふた}つ {残|のこ}って いた 。 || On the floor lie two earrings like chips of starlight.',
      after: '{丸屋根|まるやね} の {下|した} 。 {隙間|すきま} の {向|む}こう に 、 {星|ほし} が {一|ひと}つ {見|み}える 。 || Under the dome. Through the slit, one star shows.' },
    { key: 'lf', place: ['{沈鐘|ちんしょう} の {台座|だいざ}', 'The Drowned Bell\'s stand'],
      wake: '{台座|だいざ} に {触|さわ}る と 、 {鐘|かね} が ひとりでに {低|ひく}く {唸|うな}った 。 {熱|あつ}い {青銅|せいどう} の {匂|にお}い が する 。 {誰|だれ} か が 、 {金槌|かなづち} で {鐘|かね} を {叩|たた}いて いる 。 || You touch the stand, and the bell hums low on its own. There is a smell of hot bronze. Someone is tapping the bell with a hammer.',
      comp: {
        nao: '{鐘|かね} を {叩|たた}いて {顔|かお} しかめてる 。 {職人|しょくにん} って 、 どこ でも {同|おな}じ だ な 。 || Tapping the bell and frowning. Craftspeople are the same everywhere.',
        mio: '{自分|じぶん} の {仕事|しごと} を {許|ゆる}せない {人|ひと} の {顔|かお} ね 。 {見|み}た こと が ある わ 。 || That\'s the face of someone who can\'t forgive their own work. I\'ve seen it before.',
        ren: '{灯落|ひおち} の {人|ひと} は 、 {反対|はんたい} {意見|いけん} を {大事|だいじ} に します 。 {正直|しょうじき} に {話|はな}しましょう 。 || In Lanternfall they value an objection. Let\'s speak honestly.',
        suzu: '{鐘|かね} の {音|おと} に {文句|もんく} ？ {私|わたし} は この {音|おと} 、 {好|す}き よ 。 || A complaint about the bell\'s note? I like this note.',
      },
      won: '{台座|だいざ} の {縁|ふち} に 、 {小|ちい}さな {青銅|せいどう} の {鈴|すず} が {置|お}いて あった 。 {鳴|な}らす と 、 {沈鐘|ちんしょう} と {同|おな}じ {低|ひく}い {音|おと} が した 。 || On the edge of the stand sits a little bronze bell. Rung, it gives the same low note as the Drowned Bell.',
      after: '{沈鐘|ちんしょう} の {台座|だいざ} 。 {鐘|かね} は 、 {低|ひく}く {静|しず}か に {掛|か}かって いる 。 || The Drowned Bell\'s stand. The bell hangs low and quiet.' },
    { key: 'mb', place: ['{最初|さいしょ} の {橋|はし} の {杭|くい}', 'The first bridge\'s oldest pile'],
      wake: '{杭|くい} に {触|さわ}る と 、 {木|き} の {中|なか} で {何|なに} か が {身|み}じろぎ した 。 {川|かわ} の {音|おと} に {混|ま}じって 、 {紙|かみ} を {広|ひろ}げる {音|おと} が する 。 || You touch the pile, and something stirs inside the wood. Under the sound of the river comes the sound of paper being unrolled.',
      comp: {
        nao: '{八百|はっぴゃく} の {橋|はし} を {一本|いっぽん} に しろ って ？ {配達|はいたつ} が {大変|たいへん} に なる ぞ 。 || Make eight hundred bridges into one? That\'d wreck every delivery round.',
        mio: '{最初|さいしょ} の {一本|いっぽん} を {架|か}けた {人|ひと} …… {怒|おこ}って いる と いう より 、 {寂|さび}しそう ね 。 || The one who built the first bridge… less angry than lonely, I\'d say.',
        ren: '{条件|じょうけん} を {出|だ}し{合|あ}う {町|まち} です 。 {話|はな}し{合|あ}い で {決|き}めましょう 。 || This is a town that trades conditions. Let\'s settle it by talking.',
        suzu: '{初演|しょえん} の {演出家|えんしゅつか} が 、 {再演|さいえん} に {文句|もんく} を {言|い}い に {来|き}た みたい ね 。 || Like the original director turning up to complain about the revival.',
      },
      won: '{杭|くい} の {根元|ねもと} に 、 {古|ふる}い {鉢巻|はちまき} が {結|むす}んで あった 。 {藍|あい} の {色|いろ} が 、 まだ {褪|あ}せて いない 。 || Tied round the foot of the pile is an old headband, its indigo still unfaded.',
      after: '{最初|さいしょ} の {橋|はし} の {杭|くい} 。 {川|かわ} が 、 いつも の よう に {流|なが}れて いる 。 || The first bridge\'s oldest pile. The river runs on as always.' },
    { key: 'cr', place: ['{頂上|ちょうじょう} の {石積|いしづ}み', 'The summit cairn'],
      wake: '{石積|いしづ}み に {石|いし} を {一|ひと}つ {載|の}せる と 、 {足元|あしもと} の {雲|くも} が {大|おお}きく {揺|ゆ}れた 。 {雲|くも} の {中|なか} から 、 {角|つの} が {現|あらわ}れる 。 || You add a stone to the cairn, and the cloud at your feet heaves. Out of it rise horns.',
      comp: {
        nao: '{雲牛|くもうし} の {親玉|おやだま} か よ ！ {縄|なわ} 、 {持|も}って きた よ な ？ || The boss of all the cloud oxen! You brought rope, right?',
        mio: '{大|おお}きい …… でも 、 {目|め} は {優|やさ}しい わ 。 {年寄|としよ}り の {目|め} ね 。 || It\'s huge… but its eyes are gentle. Old eyes.',
        ren: '{噂|うわさ} と {本当|ほんとう} の こと を 、 {分|わ}けて {話|はな}しましょう 。 {雲路|くもじ} で {習|なら}った よう に 。 || Let\'s keep rumour and fact apart, the way the Cloudroad taught us.',
        suzu: '{雲|くも} の {中|なか} から {登場|とうじょう} なんて 、 {大物|おおもの} の {出|で}{方|かた} ね 。 || Entering out of a cloud. That\'s how the big names make an entrance.',
      },
      won: '{石積|いしづ}み の {上|うえ} に 、 {雲|くも} の よう に {白|しろ}い {合羽|かっぱ} が {掛|か}かって いた 。 {軽|かる}くて 、 {少|すこ}し {湿|しめ}って いる 。 || Over the cairn hangs a cape as white as cloud, light and a little damp.',
      after: '{頂上|ちょうじょう} の {石積|いしづ}み 。 {遠|とお}く で 、 {雲牛|くもうし} が {鳴|な}いて いる 。 || The summit cairn. Far off, a cloud ox lows.' },
    { key: 'yn', place: ['{釜|かま}の{主|ぬし} の {湯|ゆ} の {縁|ふち} の {石|いし}', 'The stone at the Kettle\'s pool'],
      wake: '{湯|ゆ} が 、 いつも より {深|ふか}い {所|ところ} から {沸|わ}いて くる 。 {釜|かま}の{主|ぬし} が 、 {怯|おび}えて いない のに {震|ふる}えて いる 。 {下|した} に 、 {何|なに} か もっと {大|おお}きい もの が いる 。 || The water is boiling up from deeper than usual. The Kettle Below is trembling, though not with fear. There is something bigger underneath.',
      comp: {
        nao: '{釜|かま} の {親|おや} ？ {谷|たに} の {下|した} {全部|ぜんぶ} が {釜|かま} なのか よ 。 || The Kettle\'s parent? Is the whole valley one big kettle, then?',
        mio: 'ずぶ{濡|ぬ}れ ね 。 {氷|こおり} を {使|つか}えば 、 {動|うご}き を {止|と}められる かも 。 || She\'s soaked. If we use ice, we might be able to stop her moving.',
        ren: '{子|こ} を {心配|しんぱい} する {母|はは} です 。 {答|こた}え を {用意|ようい} して おきましょう 。 || A mother worried for her child. Let\'s have an answer ready.',
        suzu: '{親子|おやこ} の {再会|さいかい} の {場面|ばめん} ね 。 {泣|な}かせる わ 。 || A parent-and-child reunion scene. A real tear-jerker.',
      },
      won: '{湯|ゆ} の {縁|ふち} に 、 {湯気|ゆげ} の {色|いろ} を した {頭巾|ずきん} が {畳|たた}んで あった 。 || Folded on the edge of the pool is a hood the colour of steam.',
      after: '{釜|かま}の{主|ぬし} の {湯|ゆ} 。 ちょうど いい {湯気|ゆげ} が {立|た}って いる 。 || The Kettle\'s pool. Steam rises from it, just right.' },
    { key: 'ko', place: ['{根|ね} の {間|あいだ} の {古|ふる}い {帳面|ちょうめん}', 'The old ledger among the roots'],
      wake: '{帳面|ちょうめん} を {開|ひら}く と 、 {根|ね} の {間|あいだ} から {落|お}ち{葉|ば} が {集|あつ}まって きて 、 {人|ひと} の {形|かたち} に なった 。 || You open the ledger, and leaves gather from among the roots into the shape of a person.',
      comp: {
        nao: '{手紙|てがみ} を {仕分|しわ}けて いる 。 {俺|おれ} の {同業者|どうぎょうしゃ} だ な 。 || Sorting letters. A colleague of mine.',
        mio: '{庭守|にわもり} より も 、 ずっと {前|まえ} の {人|ひと} ね 。 {手|て} つき が {丁寧|ていねい} だ わ 。 || Someone from long before the Gardener. Look how carefully she works.',
        ren: '{帳面|ちょうめん} の {字|じ} は {古|ふる}い です が 、 {読|よ}めます 。 {誰|だれ} が {誰|だれ} に {書|か}いた か 、 {気|き} を {付|つ}けて {読|よ}みましょう 。 || The ledger\'s hand is old, but I can read it. Let\'s mind who wrote to whom.',
        suzu: '{楽屋|がくや} の {手紙|てがみ} {入|い}れ を {思|おも}い{出|だ}す わ 。 {届|とど}かなかった {手紙|てがみ} も 、 {入|はい}って いた 。 || It reminds me of the letter rack backstage. There were letters in it that never got delivered.',
      },
      won: '{一番|いちばん} {新|あたら}しい {棚|たな} に 、 {緑|みどり} の {葉|は} が {一枚|いちまい} {残|のこ}って いた 。 {宛先|あてさき} に は 、 あなた の {名前|なまえ} 。 || On the newest shelf lies a single green leaf. It is addressed to you.',
      after: '{根|ね} の {間|あいだ} の {帳面|ちょうめん} 。 {閉|と}じられて 、 {新|あたら}しい {棚|たな} に {置|お}いて ある 。 || The ledger among the roots, closed, on the newest shelf.' },
  ];
  C.guardianScenes = G;
  const COMP = ['nao', 'mio', 'ren', 'suzu'];
  let out = '';
  for (const g of G) {
    const k = g.key;
    out += `
@scene gd.${k}
!if gd.${k} -> after
!if gd_${k}_met -> again
!set gd_${k}_met
narr: ${g.wake}
${COMP.map((c) => `?(comp=${c}) comp: ${g.comp[c]}`).join('\n')}
?(!comp) narr: {一人|ひとり} だ 。 でも 、 {逃|に}げる {理由|りゆう} は ない 。 || You are on your own. But there is no reason to run.
:ask
!choice
* {向|む}き{合|あ}う || Face it -> face
* {今|いま} は やめて おく || Not now -> later
:later
narr: {古|ふる}い {守|まも}り{手|て} は 、 {待|ま}って くれる 。 {長|なが}い {間|あいだ} 、 {待|ま}って いた の だ から 。 || The old guardian will wait. It has waited a long time already.
!end
:again
narr: ${g.place[0]} 。 {古|ふる}い {守|まも}り{手|て} が 、 まだ {目|め} を {覚|さ}まして いる 。 || ${g.place[1]}. The old guardian is still awake.
!goto ask
:face
!var gd_${k}_n + 1
!encounter gd.${k}
!if var._res=0 -> unsettled
!set gd.${k}
!hook guardian_won ${k}
narr: ${g.won}
!give gd_${k}_keepsake
!autosave progress
!end
:unsettled
narr: {古|ふる}い {守|まも}り{手|て} は 、 まだ {納得|なっとく} して いない 。 {話|はなし} は 、 また {今度|こんど} 。 || The old guardian is not satisfied yet. Another time.
!end
:after
narr: ${g.after}
`;
  }
  RB.script.add(out);
})(RB.content);
