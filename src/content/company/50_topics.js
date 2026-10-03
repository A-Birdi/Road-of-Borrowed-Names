/* Companionship content, part 5: six rest-place topics per companion (addendum §19.1)
 * and a small ritual at each existing safe rest setting (§19.2).
 *   slot 1 a travel habit            — How We Travel (the first journey reflection)
 *   slot 2 a first impression        — early (from Saltglass on)
 *   slot 3 a harmless preference     — middle (after Cinder Orchard)
 *   slot 4 sharing responsibility    — middle (from Snowbell on)
 *   slot 5 a remembered discovery    — What We Keep (the second journey reflection)
 *   slot 6 what continuing might mean — late (after Lanternfall; post-story wording after the ending)
 * Only the two reflections give a bond event; the others are companionship, and
 * hearing one again changes nothing. Rituals are opt-in, give nothing, and have
 * no timer; the pet greeting (the pet system) joins the same rest menu. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (CC) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  const TOP = (comp, slot, stage, when, id, scene, title, reflect) => CC.topics.push({ id, comp, slot, stage, when, scene, title, reflect: reflect || null });
  for (const c of ['nao', 'mio', 'ren', 'suzu']) {
    TOP(c, 1, 'early', 'ch2_done', 'reflect.travel.' + c, 'co.reflect_travel_' + c, T('{旅|たび} の {仕方|しかた}', 'How We Travel'), 'reflect:travel');
    TOP(c, 5, 'late', 'ch4_done', 'reflect.keep.' + c, 'co.reflect_keep_' + c, T('{残|のこ}す もの', 'What We Keep'), 'reflect:keep');
  }
  TOP('nao', 2, 'early', 'ch>=2', 't.nao.pier', 'co.t_nao_pier', T('{右|みぎ} の {桟橋|さんばし}', 'The right-hand pier'));
  TOP('nao', 3, 'middle', 'ch3_done', 't.nao.pencil', 'co.t_nao_pencil', T('{筆|ふで} より {鉛筆|えんぴつ}', 'Pencil, not brush'));
  TOP('nao', 4, 'middle', 'ch>=4', 't.nao.half', 'co.t_nao_half', T('{鞄|かばん} の {重|おも}さ', 'The weight of the satchel'));
  TOP('nao', 6, 'late', 'ch5_done', 't.nao.back', 'co.t_nao_back', T('{帰|かえ}り{道|みち}', 'The way back'));
  TOP('mio', 2, 'early', 'ch>=2', 't.mio.sea', 'co.t_mio_sea', T('{海|うみ} を {見|み}た {日|ひ}', 'Seeing the sea'));
  TOP('mio', 3, 'middle', 'ch3_done', 't.mio.tea', 'co.t_mio_tea', T('ぬるい お{茶|ちゃ}', 'Lukewarm tea'));
  TOP('mio', 4, 'middle', 'ch>=4', 't.mio.box', 'co.t_mio_box', T('{二|ふた}つ の {薬箱|くすりばこ}', 'Two medicine chests'));
  TOP('mio', 6, 'late', 'ch5_done', 't.mio.after', 'co.t_mio_after', T('{続|つづ}ける と いう こと', 'Carrying on'));
  TOP('ren', 2, 'early', 'ch>=2', 't.ren.stars', 'co.t_ren_stars', T('{灯|あか}り の ない {夜|よる}', 'A night with no lanterns'));
  TOP('ren', 3, 'middle', 'ch3_done', 't.ren.polish', 'co.t_ren_polish', T('{灯|あか}り と {靴|くつ}', 'Lamps and boots'));
  TOP('ren', 4, 'middle', 'ch>=4', 't.ren.alone', 'co.t_ren_alone', T('{一人|ひとり} で {守|まも}らない', 'No one keeps a name alone'));
  TOP('ren', 6, 'late', 'ch5_done', 't.ren.after', 'co.t_ren_after', T('{半分|はんぶん} {直|なお}った {道|みち}', 'Half-mended roads'));
  TOP('suzu', 2, 'early', 'ch>=2', 't.suzu.house', 'co.t_suzu_house', T('{港|みなと} の {客席|きゃくせき}', 'The harbour audience'));
  TOP('suzu', 3, 'middle', 'ch3_done', 't.suzu.amazake', 'co.t_suzu_amazake', T('{甘酒|あまざけ}', 'Amazake'));
  TOP('suzu', 4, 'middle', 'ch>=4', 't.suzu.books', 'co.t_suzu_books', T('{帳簿|ちょうぼ} の {確認|かくにん}', 'Checking the books'));
  TOP('suzu', 6, 'late', 'ch5_done', 't.suzu.after', 'co.t_suzu_after', T('{次|つぎ} の {幕|まく}', 'The next act'));

  CC.rituals.nao = { title: T('{鞄|かばん} を {下|お}ろす', 'Set the bags down together'), scene: 'co.ritual_nao' };
  CC.rituals.mio = { title: T('{一息|ひといき} つく', 'Take a breath together'), scene: 'co.ritual_mio' };
  CC.rituals.ren = { title: T('{灯|あか}り の {手入|てい}れ', 'Tend the lamp together'), scene: 'co.ritual_ren' };
  CC.rituals.suzu = { title: T('{黙|だま}って {座|すわ}る', 'Sit quietly together'), scene: 'co.ritual_suzu' };
})(RB.content.company);

// a keepsake pinned on display (the Roadside Keepsakes catalogue): rituals may glance at it
RB.state.addTerm('display', (s) => !!(s.discovery && s.discovery.display));

RB.script.add(`
@scene co.t_nao_pier
# Staged (anywhere it is told): you and Nao turn to each other. A glance aside back to being fifteen; both arms
# up, the parcel held over the head in the sea; a shrug for the old woman; a head shake ("the opposite") or a hand
# to the satchel (parcel first); a point to the right for the right-hand pier.
!look pc nao
!look nao pc
!gesture nao aside
comp: {潮硝子|しおがらす} に {初|はじ}めて {配達|はいたつ} に {行|い}った の は 、 {十五|じゅうご} の {時|とき} だ 。 || The first time I made a delivery to Saltglass, I was fifteen.
!gesture nao stretch
comp[smirk]: {右|みぎ} の {桟橋|さんばし} を {走|はし}って 、 {板|いた} を {踏|ふ}み{抜|ぬ}いた 。 {荷物|にもつ} を {頭|あたま} の {上|うえ} に {上|あ}げた まま 、 {腰|こし} まで {海|うみ} に {浸|つ}かった 。 || Ran down the right-hand pier and went straight through a board. Stood waist-deep in the sea with the parcel held over my head.
!gesture nao shrug
comp: {荷物|にもつ} は {濡|ぬ}れなかった 。 {受取人|うけとりにん} の {婆|ばあ}さん は 、 {俺|おれ} より {先|さき} に {荷物|にもつ} の {心配|しんぱい} を した 。 || The parcel stayed dry. The old woman it was for worried about the parcel before she worried about me.
!choice
* それ で {港|みなと} が {嫌|きら}い に なった ？ || Did that put you off the harbour? -> a
* {荷物|にもつ} を {守|まも}った の は すごい || Keeping the parcel dry — that's impressive. -> b
:a
!gesture nao shake
comp[laugh]: {逆|ぎゃく} だ 。 {婆|ばあ}さん が {乾|かわ}いた {服|ふく} を {貸|か}して くれて 、 {焼|や}き{魚|ざかな} を {食|く}わせて くれた 。 {港|みなと} の {第一|だいいち} {印象|いんしょう} は 、 {焼|や}き{魚|ざかな} だ 。 || The opposite. She lent me dry clothes and fed me grilled fish. My first impression of the harbour is grilled fish.
!goto close
:b
!gesture nao strap
comp[smirk]: {配達人|はいたつにん} は 、 {荷物|にもつ} が {先|さき} 、 {自分|じぶん} は {後|あと} 。 …… {今|いま} は 、 {少|すこ}し {順番|じゅんばん} を {考|かんが}え{直|なお}してる けど な 。 || Couriers: parcel first, self second. …These days I'm rethinking the order a bit.
:close
!gesture nao point right
comp: だから 、 {誰|だれ} か が {潮硝子|しおがらす} へ {行|い}く と {聞|き}く と 、 {必|かなら}ず {右|みぎ} の {桟橋|さんばし} の {話|はなし} を する 。 {誰|だれ} も {聞|き}いて ない けど な 。 || So whenever someone says they're off to Saltglass, I tell them about the right-hand pier. Nobody listens.
!hook co_heard t.nao.pier

@scene co.t_nao_pencil
# Staged (anywhere it is told): you and Nao turn to each other. An open hand: a pencil person; a hand to the ear
# where the pencil sits; a nod (the brush for addresses) or a shrug (the third pencil); a glance aside — first
# time talking tools with anyone.
!look pc nao
!look nao pc
!gesture nao palm
comp: {俺|おれ} は {筆|ふで} より {鉛筆|えんぴつ} だ 。 || Me, I'm a pencil person, not a brush person.
!gesture nao cupear
comp: {鉛筆|えんぴつ} は {雨|あめ} で {滲|にじ}まない 。 {墨|すみ} を {擦|す}る {時間|じかん} も {要|い}らない 。 {耳|みみ} に {挟|はさ}んで おける 。 || Pencil doesn't run in the rain. No time spent grinding ink. And it sits behind your ear.
!choice
* でも {筆|ふで} の {字|じ} も きれい だ よ || Brush writing is beautiful, though. -> brush
* {耳|みみ} の {鉛筆|えんぴつ} 、 {気|き}づいてた || I'd noticed the one behind your ear. -> ear
:brush
!gesture nao nod pc
comp[think]: …… {知|し}ってる 。 {宛名|あてな} を {書|か}き{直|なお}す {時|とき} だけ は 、 {筆|ふで} を {使|つか}う 。 {受取人|うけとりにん} が {一番|いちばん} {最初|さいしょ} に {見|み}る {字|じ} だ から な 。 || …I know. When I rewrite an address, that's the one time I use a brush. It's the first writing the recipient sees.
!goto close
:ear
!gesture nao shrug
comp[smirk]: {目|め} が いい な 。 …… {三本目|さんぼんめ} だ 。 {前|まえ} の {二本|にほん} は 、 {川|かわ} と {崖|がけ} に {落|お}とした 。 || Sharp eyes. …It's my third. Lost the first two, one to a river and one off a cliff.
:close
!gesture nao aside
comp: …… {道具|どうぐ} の {話|はなし} を {誰|だれ} か に する の は 、 {初|はじ}めて だ 。 || …First time I've talked tools with anyone.
!hook co_heard t.nao.pencil

@scene co.t_nao_half
# Staged (anywhere it is told): you and Nao turn to each other. A hand on the satchel strap (nobody else carries
# it), a glance aside, an open hand: you choose where we go; offered the map, Nao hands it over; or a nod: the
# satchel's mine; at the close, the look away.
!look pc nao
!look nao pc
!gesture nao strap
comp: {鞄|かばん} は {誰|だれ} に も {持|も}たせない 。 {昔|むかし} から の {決|き}まり だ 。 || Nobody else carries the satchel. Always been my rule.
!gesture nao aside
comp[think]: {中身|なかみ} を {全部|ぜんぶ} {知|し}ってる の は 、 {俺|おれ} だけ で いい 。 {重|おも}さ も 、 {責任|せきにん} も 。 そう {思|おも}ってた 。 || Only I need to know everything in it. The weight, the responsibility. That's what I thought.
!gesture nao palm pc
comp: …… でも 、 {行|い}き{先|さき} を {決|き}める の は あんた だ 。 {最初|さいしょ} の {日|ひ} に そう {決|き}めた 。 {半分|はんぶん} {持|も}って もらってる よう な もん だ な 。 || …But you choose where we go. We agreed on the first day. It's like having you carry half.
!choice
* {地図|ちず} くらい は {持|も}つ よ || I'll at least carry the map. -> map
* {鞄|かばん} は ナオ の もの だ || The satchel's yours. -> yours
:map
!gesture nao handover pc prop=paper
!gesture pc receive nao
comp[smile]: …… {地図|ちず} か 。 じゃあ 、 {頼|たの}む 。 {逆|さか}さ に {持|も}つ な よ 。 || …The map. All right, it's yours. Don't hold it upside down.
!goto close
:yours
!gesture nao nod pc
comp: ああ 。 {鞄|かばん} は {俺|おれ} の だ 。 でも 、 {中|なか} の {話|はなし} は 、 {時々|ときどき} {聞|き}いて もらう 。 || Yeah. The satchel's mine. But what's inside it, I'll tell you about now and then.
:close
?(lq_ally2) !gesture nao aside
?(lq_ally2) comp: {小春野|こはるの} で 「 {半分|はんぶん} {引|ひ}き{受|う}ける 」 って {言|い}った だろ 。 あれ 、 {逆|ぎゃく} も {込|こ}み だ から な 。 || At Koharuno I said I'd take half. That goes both ways, you know.
!hook co_heard t.nao.half

@scene co.t_nao_back
# Staged (anywhere it is told): you and Nao turn to each other. An open hand: getting back is what matters; a
# glance aside (where to go back to); a shrug (several addresses), a point at you (you the destination), or a nod.
!look pc nao
!look nao pc
!gesture nao palm
comp: {配達|はいたつ} で {一番|いちばん} {大事|だいじ} なの は 、 {着|つ}く こと じゃ ない 。 {帰|かえ}る こと だ 。 || The most important part of a delivery isn't arriving. It's getting back.
!gesture nao aside
?(!post) comp[think]: この {旅|たび} が {終|お}わったら 、 {俺|おれ} は どこ に {帰|かえ}る ん だろう な 。 {葦|あし}ノ{瀬|せ} か 、 {次|つぎ} の {配達|はいたつ} か 。 || When this journey's over, where do I go back to? Reedwake, or the next delivery?
?(post) comp[think]: {旅|たび} は 、 {一応|いちおう} {終|お}わった 。 なのに 、 {帰|かえ}り{道|みち} が {一本|いっぽん} じゃ なく なった 。 || The journey's over, more or less. And yet there's more than one way home now.
!choice
* {帰|かえ}る {場所|ばしょ} は {一|ひと}つ じゃ なくて いい || You don't need just one place to come back to. -> many
* {次|つぎ} の {道|みち} も {一緒|いっしょ} に || Take the next road with me. -> next
* {今|いま} は {分|わ}からなくて いい || You don't have to know yet. -> unsure
:many
!gesture nao shrug
comp: …… {宛先|あてさき} が いくつ も ある {手紙|てがみ} か 。 {配達人|はいたつにん} {泣|な}かせ だ 。 {悪|わる}く ない けど 。 || …A letter with several addresses. A courier's nightmare. Not bad, though.
!goto close
:next
!gesture nao point pc
comp[smirk]: {道|みち} は {俺|おれ} 、 {行|い}き{先|さき} は あんた 。 {約束|やくそく} は 、 まだ {切|き}れて ない ぞ 。 || Me the road, you the destination. That agreement hasn't run out.
!goto close
:unsure
!gesture nao nod pc
comp: …… そう だ な 。 {帰|かえ}り{道|みち} は 、 {歩|ある}いて いる うち に {見|み}えて くる もん だ 。 || …Yeah. The way back shows itself while you walk.
:close
!hook co_heard t.nao.back

@scene co.t_mio_sea
# Staged (anywhere it is told): you and Mio turn to each other. A touch to her hair (honestly…), her laugh behind
# her hand at the salt remedy; a glance aside (the second thought kept) or a hand at her chest (no end in sight);
# a breath out for walking it together.
!look pc mio
!look mio pc
!gesture mio touchhair
comp: {正直|しょうじき} に {言|い}う と 、 {海|うみ} を {近|ちか}く で {見|み}た の は 、 {潮硝子|しおがらす} が {久|ひさ}しぶり でした 。 || To be honest, Saltglass was the first time in years I'd seen the sea up close.
!gesture mio laugh
comp[laugh]: {川|かわ} の {村|むら} の {薬師|くすし} です から 。 {最初|さいしょ} に {思|おも}った の は 、 「 {塩|しお} の {薬|くすり} が いくら でも {作|つく}れる 」 でした 。 || I'm a river-village apothecary. The first thing I thought was, "I could make as much salt remedy as I like."
!choice
* {薬師|くすし} らしい {感想|かんそう} だ || Spoken like an apothecary. -> a
* {怖|こわ}く なかった ？ || Wasn't it a little frightening? -> b
:a
!gesture mio aside
comp[smile]: よく {言|い}われます 。 …… {二番目|にばんめ} に {思|おも}った こと は 、 {言|い}わない こと に します 。 || People say that a lot. …The second thing I thought, I'll keep to myself.
!goto close
:b
!gesture mio guard
comp[think]: {少|すこ}し 。 {終|お}わり が {見|み}えない もの は 、 {苦手|にがて} です 。 {病気|びょうき} でも 、 {仕事|しごと} でも 。 || A little. I'm not good with things that have no end in sight. Illnesses. Work.
:close
?(ch3_done) !gesture mio exhale
?(ch3_done) comp: {今|いま} なら 、 {少|すこ}し {違|ちが}う {感想|かんそう} を {言|い}えそう です 。 {終|お}わり が {見|み}えなくて も 、 {一緒|いっしょ} に {歩|ある}く {人|ひと} が いれば {平気|へいき} です 。 || Now I think I'd say something different. Even with no end in sight, it's all right if someone walks it with you.
!hook co_heard t.mio.sea

@scene co.t_mio_tea
# Staged (anywhere it is told): you and Mio turn to each other. She looks at the cup in her hand; her hands fidget
# over the tea she always forgets; her laugh (she'll wait) or a nod (tea for two).
!look pc mio
!look mio pc
!gesture mio check prop=cup
comp: {私|わたし} 、 お{茶|ちゃ} は ぬるい の が {好|す}き なん です 。 || I like my tea lukewarm.
!gesture mio fidget
comp[shy]: {薬|くすり} を {作|つく}って いる と 、 {淹|い}れた お{茶|ちゃ} を {忘|わす}れて しまって 。 {気|き}づく と いつも ぬるくて 。 {慣|な}れたら 、 それ が {好|す}き に なりました 。 || When I'm making medicine I forget the tea I've poured. By the time I notice, it's always lukewarm. I got used to it, and now I like it.
!choice
* {熱|あつ}い の を {淹|い}れ{直|なお}そう か ？ || Shall I make you a fresh hot one? -> hot
* {冷|さ}める まで {待|ま}とう || Let's wait for it to cool. -> wait
:hot
!gesture mio laugh
comp[laugh]: ありがとう 。 …… でも 、 {冷|さ}める まで {待|ま}ちます 。 {待|ま}って いる {間|あいだ} に 、 {話|はなし} が できます から 。 || Thank you. …But I'll wait for it to cool. We can talk while we wait.
!goto close
:wait
!gesture mio nod pc
comp[smile]: はい 。 {二人|ふたり} で ぬるい お{茶|ちゃ} 。 …… ハナ さん に {見|み}られたら 、 {怒|おこ}られ そう です 。 || Yes. Lukewarm tea for two. …Hana would scold us if she saw.
:close
!hook co_heard t.mio.tea

@scene co.t_mio_box
# Staged (anywhere it is told): you and Mio turn to each other. Two hands for the chest split in two, an open hand
# (would you carry one?), her hands fidget (asking is harder); offered the heavy one, her flat hand: no, that's
# mine; or thanks with both hands; a breath out at the close.
!look pc mio
!look mio pc
!gesture mio size
comp: {薬箱|くすりばこ} 、 {二|ふた}つ に {分|わ}けた ん です 。 || I've split the medicine chest in two.
!gesture mio palm pc
comp: {一|ひと}つ は {私|わたし} が {持|も}ちます 。 もう {一|ひと}つ は …… {軽|かる}い {方|ほう} です けど 、 {持|も}って もらえます か 。 || I'll carry one. The other one… it's the lighter one, but would you carry it?
!gesture mio fidget
comp[shy]: {一人|ひとり} で {全部|ぜんぶ} {持|も}つ の が 、 {当|あ}たり{前|まえ} だ と {思|おも}って いました 。 {頼|たの}む の は 、 {頼|たの}まれる より {難|むずか}しい です ね 。 || I always thought carrying all of it myself was simply how it was. Asking is harder than being asked.
!choice
* {重|おも}い {方|ほう} を {持|も}つ よ || I'll take the heavy one. -> heavy
* {喜|よろこ}んで {持|も}つ || Gladly. -> glad
:heavy
!gesture mio emphatic
comp[laugh]: だめ です 。 {重|おも}い {方|ほう} は {私|わたし} 。 …… {断|ことわ}る の も 、 {練習|れんしゅう} {中|ちゅう} です から 。 || No. The heavy one's mine. …I'm practising saying no, too.
!goto close
:glad
!gesture mio thanks pc
comp[smile]: …… ありがとう 。 {中|なか} の ラベル は 、 {全部|ぜんぶ} {三回|さんかい} {確|たし}かめて あります 。 || …Thank you. Every label inside has been checked three times.
:close
?(lq_ally2) !gesture mio exhale
?(lq_ally2) comp: {小春野|こはるの} で 、 {一人|ひとり} で {受|う}け{止|と}めない で って {言|い}いました よね 。 {自分|じぶん} に も {言|い}って いた ん です 、 たぶん 。 || At Koharuno I told you not to take it all alone. I think I was telling myself, too.
!hook co_heard t.mio.box

@scene co.t_mio_after
# Staged (anywhere it is told): you and Mio turn to each other. An open hand for the shop, a hand to her chin
# (carrying on is changing a little at a time); a nod, her laugh, or her thanks with both hands.
!look pc mio
!look mio pc
!gesture mio palm
?(!post) comp: {旅|たび} が {終|お}わったら 、 お{店|みせ} に {戻|もど}ります 。 {戻|もど}る つもり です 。 || When the journey's over, I'll go back to the shop. That's the plan.
?(post) comp: お{店|みせ} に {戻|もど}って 、 {思|おも}った より {早|はや}く {慣|な}れました 。 {水曜|すいよう} の お{休|やす}み に は 、 まだ {慣|な}れません けど 。 || Back at the shop, I settled in faster than I expected. Except for Wednesdays off — I'm still not used to those.
!gesture mio chin
comp[think]: でも 、 {続|つづ}ける って 、 {同|おな}じ こと を {繰|く}り{返|かえ}す こと じゃ ない と {思|おも}う んです 。 {少|すこ}し ずつ {変|か}えて いく こと 。 || But I don't think carrying on means repeating the same thing. It means changing a little at a time.
!choice
* {時々|ときどき} は 、 {一緒|いっしょ} に {旅|たび} を しよう || Let's still travel together sometimes. -> travel
* {店|みせ} に も {寄|よ}る よ || I'll come by the shop. -> shop
* ミオ が {決|き}めて いい || It's yours to decide. -> yours
:travel
!gesture mio nod pc
?(post) comp[smile]: はい 。 {水曜|すいよう} に 。 …… {冗談|じょうだん} です 。 {水曜|すいよう} じゃ なくて も 。 || Yes. On Wednesdays. …Joking. Not only Wednesdays.
?(!post) comp[smile]: はい 。 {約束|やくそく} です 。 {薬箱|くすりばこ} は {軽|かる}く して {行|い}きます 。 || Yes. A promise. I'll pack a lighter medicine chest.
!goto close
:shop
!gesture mio laugh
comp[laugh]: お{客|きゃく} さん と して {来|き}たら 、 ちゃんと お{代|だい} を {頂|いただ}きます よ 。 {友達|ともだち} と して {来|き}たら 、 お{茶|ちゃ} を {出|だ}します 。 || If you come as a customer, I'll charge you properly. If you come as a friend, I'll make tea.
!goto close
:yours
!gesture mio thanks pc
comp: …… ありがとう 。 {決|き}めて いい 、 って {言|い}われる の 、 {好|す}き です 。 {断|ことわ}って いい 、 と {同|おな}じ くらい 。 || …Thank you. I like being told it's mine to decide. As much as being told I can say no.
:close
!hook co_heard t.mio.after

@scene co.t_ren_stars
# Staged (anywhere it is told): you and Ren turn to each other. A glance aside (the first sleepless night), counting
# on the fingers (stars instead of lanterns); the glasses for four hundred and twelve, or the lamp tended (one inn
# lamp is enough now).
!look pc ren
!look ren pc
!gesture ren aside
comp: {葦|あし}ノ{瀬|せ} を {出|で}た {最初|さいしょ} の {夜|よる} 、 {眠|ねむ}れません でした 。 || The first night after we left Reedwake, I couldn't sleep.
!gesture ren count
comp: {灯|あか}り を {数|かぞ}える {仕事|しごと} の ない {夜|よる} は 、 {初|はじ}めて でした から 。 {代|か}わり に 、 {星|ほし} を {数|かぞ}えました 。 || It was my first night with no lanterns to count. I counted stars instead.
!choice
* いくつ まで {数|かぞ}えた ？ || How far did you get? -> count
* {今|いま} は {眠|ねむ}れて いる ？ || Do you sleep now? -> sleep
:count
!gesture ren glasses
comp[smirk]: {四百|よんひゃく} {十二|じゅうに} 。 {同|おな}じ {星|ほし} を {二回|にかい} {数|かぞ}えた {可能性|かのうせい} は 、 {否定|ひてい} できません 。 || Four hundred and twelve. I can't rule out counting some of them twice.
!goto close
:sleep
!gesture ren tendlamp
comp[smile]: {今|いま} は 、 {宿|やど} の {灯|あか}り を {一|ひと}つ {確|たし}かめれば {眠|ねむ}れます 。 {旅|たび} の {灯守|ひもり} に なった よう です 。 || These days, checking one inn lamp is enough to let me sleep. I've become a travelling keeper, it seems.
:close
!hook co_heard t.ren.stars

@scene co.t_ren_polish
# Staged (anywhere it is told): you and Ren turn to each other. The lamp tended (the favourite part of the day), a
# look down at the boots; an open hand (lamps answer), or a glance aside (within the year).
!look pc ren
!look ren pc
!gesture ren tendlamp
comp: {灯|あか}り を {磨|みが}く {時間|じかん} が 、 {一日|いちにち} で {一番|いちばん} {好|す}き です 。 || Polishing the lamp is my favourite part of the day.
!gesture ren observe down
comp[think]: {靴|くつ} を {磨|みが}く {時間|じかん} は 、 {一日|いちにち} で {一番|いちばん} {短|みじか}い です 。 {理由|りゆう} は {単純|たんじゅん} で 、 {靴|くつ} は {返事|へんじ} を しない から です 。 || Polishing my boots is the shortest part. Simply because boots don't answer back.
!choice
* {灯|あか}り は {返事|へんじ} を する の ？ || And lamps do? -> reply
* {靴|くつ} も {喜|よろこ}ぶ と {思|おも}う || I think your boots would appreciate it. -> boots
:reply
!gesture ren palm
comp: {磨|みが}けば 、 {明|あか}るく なります 。 {立派|りっぱ} な {返事|へんじ} です 。 …… {靴|くつ} は {磨|みが}いて も 、 {道|みち} を {間違|まちが}えます 。 || Polish it and it brightens. A fine answer. …Boots, however polished, still take the wrong road.
!goto close
:boots
!gesture ren aside
comp[shy]: …… {検討|けんとう} します 。 {今年|ことし} の うち に 。 {来年|らいねん} かも しれません 。 || …I'll consider it. Within the year. Possibly next year.
:close
!hook co_heard t.ren.polish

@scene co.t_ren_alone
# Staged (anywhere it is told): you and Ren turn to each other. An open hand for the teacher's lesson, a hand to the
# chin, a slow breath out (perhaps it was said to me); a point to you (that would be you) or the glasses (galling).
!look pc ren
!look ren pc
!gesture ren palm
comp: {師匠|ししょう} の {教|おし}え に 、 「 {一人|ひとり} で {名前|なまえ} を {守|まも}る {者|もの} は いない 」 と いう の が あります 。 || One of my teacher's lessons goes: "No one keeps a name alone."
!gesture ren chin
comp[think]: {長|なが}い {間|あいだ} 、 {灯守|ひもり} の {心得|こころえ} だ と {思|おも}って いました 。 {町|まち} の {皆|みな} で {名前|なまえ} を {守|まも}る 、 と いう 。 || For a long time I took it as a keeper's principle. The whole town keeps its names together, that sort of thing.
!gesture ren exhale
comp: {旅|たび} を して いて 、 {少|すこ}し {違|ちが}う {意味|いみ} に {聞|き}こえて きました 。 {一人|ひとり} で {抱|かか}える な 、 と 。 {私|わたし} に {言|い}って いた の かも しれません 。 || Travelling, it's started to sound different. Don't carry it by yourself. Perhaps it was said to me.
!choice
* {一緒|いっしょ} に {守|まも}ろう || Let's keep them together. -> keep
* {師匠|ししょう} は {分|わ}かって いた ん だ ね || Your teacher knew you well. -> knew
:keep
!gesture ren point pc
comp[smile]: はい 。 {二人|ふたり} なら 、 {少|すく}なくとも {一人|ひとり} は {道|みち} を {覚|おぼ}えて います 。 あなた の {方|ほう} です が 。 || Yes. With two of us, at least one will remember the road. That would be you.
!goto close
:knew
!gesture ren glasses
comp: …… そう {思|おも}う と 、 {悔|くや}しい です ね 。 {言|い}い{返|かえ}せない {教|おし}え が 、 {一番|いちばん} {残|のこ}ります 。 || …Put like that, it's galling. The lessons you can't argue with are the ones that stay.
:close
!hook co_heard t.ren.alone

@scene co.t_ren_after
# Staged (anywhere it is told): you and Ren turn to each other. Two hands for the mountains of names, a hand to the
# chin; a nod, a slow breath out, or the glasses (days off, as a way of answering back).
!look pc ren
!look ren pc
!gesture ren size
?(!post) comp: {旅|たび} が {終|お}わって も 、 {灯|あか}り の {道|みち} は {半分|はんぶん} しか {直|なお}らない でしょう 。 {書|か}き{直|なお}す {名前|なまえ} が 、 {山|やま} ほど {残|のこ}ります 。 || Even when the journey's over, the lantern roads will only be half mended. Mountains of names left to rewrite.
?(post) comp: {灯|あか}り の {道|みち} は 、 まだ {半分|はんぶん} {直|なお}った だけ です 。 {書|か}き{直|なお}す {名前|なまえ} が 、 {山|やま} ほど {残|のこ}って います 。 || The lantern roads are only half mended. Mountains of names still to rewrite.
!gesture ren chin
comp[think]: {続|つづ}ける と いう の は 、 {終|お}わらない {仕事|しごと} を {引|ひ}き{受|う}ける こと です 。 {灯守|ひもり} は 、 {皆|みな} そう です 。 || Carrying on means taking on work that never ends. Every keeper does.
!choice
* {一緒|いっしょ} に {書|か}き{直|なお}そう || Let's rewrite them together. -> together
* {終|お}わらない の も {悪|わる}く ない || Work that never ends isn't so bad. -> endless
* {休|やす}む {日|ひ} も {作|つく}ろう || Let's make some days off, too. -> rest
:together
!gesture ren nod pc
comp[smile]: {二人|ふたり} で {書|か}けば 、 {字|じ} の {癖|くせ} が {混|ま}ざります 。 {記録|きろく} と して は {困|こま}ります が 、 {灯|あか}り と して は 、 {良|よ}い {灯|あか}り に なる でしょう 。 || With two of us writing, our handwriting will mix. Awkward for the records — but it'll make good lanterns.
!goto close
:endless
!gesture ren exhale
comp: {同感|どうかん} です 。 {終|お}わる {仕事|しごと} は 、 {少|すこ}し {寂|さび}しい 。 || Agreed. Work that ends is a little lonely.
!goto close
:rest
!gesture ren glasses
comp[laugh]: {休|やす}み 。 …… {師匠|ししょう} が {一度|いちど} も {取|と}らなかった もの です 。 {私|わたし} は 、 {取|と}って みます 。 {言|い}い{返|かえ}す つもり で 。 || Days off. …Something my teacher never once took. I'll try them. As a way of answering back.
:close
!hook co_heard t.ren.after

@scene co.t_suzu_house
# Staged (anywhere it is told): you and Suzu turn to each other. Two showman's hands for the troupe's first show, her
# laugh at the fishermen who never laughed, an open hand for the crate of dried fish; a nod, or her account book
# ("value unknown").
!look pc suzu
!look suzu pc
!gesture suzu size
comp: {一座|いちざ} で {初|はじ}めて {潮硝子|しおがらす} に {来|き}た {時|とき} の こと 、 {話|はな}した っけ ？ || Did I ever tell you about the first time the troupe played Saltglass?
!gesture suzu laugh
comp[laugh]: {漁師|りょうし} さん たち 、 {一|ひと}つ も {笑|わら}わない の 。 {最後|さいご} まで 。 {座長|ざちょう} が {泣|な}き そう に なってた 。 || The fishermen didn't laugh once. Not once, right to the end. The director nearly cried.
!gesture suzu palm
comp: で 、 {終|お}わった {後|あと} 、 {一人|ひとり} の {婆|ばあ}さん が {干物|ひもの} を {一箱|ひとはこ} くれた の 。 「 {明日|あした} も {来|く}る ん だろ 」 って 。 || Then afterwards an old woman gave us a whole crate of dried fish. "You're coming back tomorrow, aren't you."
!choice
* {笑|わら}わない けど 、 {見|み}て いた ん だ || They didn't laugh, but they were watching. -> watch
* {干物|ひもの} は {最高|さいこう} の {拍手|はくしゅ} だ || Dried fish is the best applause. -> fish
:watch
!gesture suzu nod pc
comp[smile]: そう 。 {笑|わら}わない {客|きゃく} ほど 、 {最後|さいご} まで {席|せき} に いる の よ 。 {港|みなと} の {人|ひと} は 、 {照|て}れ{屋|や} なの 。 || Right. The ones who don't laugh are the ones who stay to the end. Harbour people are shy.
!goto close
:fish
!gesture suzu check prop=accountbook
comp[laugh]: でしょ ！ {帳簿|ちょうぼ} に は 「 {干物|ひもの} {一箱|ひとはこ} 、 {金額|きんがく} {不明|ふめい} 」 って {書|か}いた わ 。 || Right? I wrote in the book: "One crate of dried fish, value unknown."
:close
!hook co_heard t.suzu.house

@scene co.t_suzu_amazake
# Staged (anywhere it is told): you and Suzu turn to each other. A touch to her hair (a weakness), her account book
# (a necessary expense); a small celebration (the audit passed) or she writes the debt down and nods.
!look pc suzu
!look suzu pc
!gesture suzu touchhair
comp: {私|わたし} 、 {甘酒|あまざけ} に は {目|め} が ない の 。 {知|し}ってた ？ || I have a weakness for amazake. Did you know?
!gesture suzu check prop=accountbook
comp[smirk]: {寒|さむ}い {町|まち} に {着|つ}いたら 、 まず {甘酒|あまざけ} の {屋台|やたい} を {探|さが}す 。 {宿|やど} より {先|さき} に 。 {帳簿|ちょうぼ} に は 「 {必要|ひつよう} {経費|けいひ} 」 って {書|か}いて ある わ 。 || When I reach a cold town, I look for an amazake stall first. Before the inn. It's entered in the books as a necessary expense.
!choice
* {必要|ひつよう} {経費|けいひ} なら {仕方|しかた} ない || If it's a necessary expense, fair enough. -> ok
* {次|つぎ} の {町|まち} で は おごる よ || Next town, it's on me. -> treat
:ok
!gesture suzu celebrate
comp[laugh]: {話|はなし} の {分|わ}かる {相棒|あいぼう} で {助|たす}かる わ 。 {監査|かんさ} は {通|とお}った ！ || A partner who understands! The audit's passed!
!goto close
:treat
!gesture suzu write
comp: …… それ 、 {借|か}り に なる わ よ 。 {帳簿|ちょうぼ} に {書|か}く けど 、 いい ？ || …That counts as a debt, you know. I'll have to write it down. All right?
!gesture suzu nod pc
comp[smile]: {返|かえ}す の は 、 {次|つぎ} の {次|つぎ} の {町|まち} ね 。 {借|か}り が ある と 、 {次|つぎ} の {町|まち} も {一緒|いっしょ} に {行|い}く {理由|りゆう} に なる でしょ 。 || I'll pay you back in the town after that. With a debt outstanding, we've a reason to go on together.
:close
!hook co_heard t.suzu.amazake

@scene co.t_suzu_books
# Staged (anywhere it is told): you and Suzu turn to each other. She holds out her account book in both hands; no
# flourish, her head goes down over ten years of keeping it alone; she looks away and back (mistakes, or lies);
# her open-handed thanks, or her laugh at the change of subject; a glance aside about the last page.
!look pc suzu
!look suzu pc
!gesture suzu present pc prop=accountbook
comp: ねえ 、 {帳簿|ちょうぼ} の {計算|けいさん} 、 {確|たし}かめて くれる ？ || Hey, would you check the sums in my book?
!gesture suzu lowered
comp[closed]: {一座|いちざ} で {十年|じゅうねん} 、 {帳簿|ちょうぼ} は {私|わたし} {一人|ひとり} で つけて きた の 。 {誰|だれ} に も {見|み}せない の が {誇|ほこ}り だった 。 || Ten years with the troupe, I kept the books alone. I was proud that nobody else ever saw them.
!gesture suzu avert pc
comp: でも 、 {一人|ひとり} で {全部|ぜんぶ} {合|あ}わせる と 、 {間違|まちが}い に {気|き}づかない の よ 。 {嘘|うそ} に も ね 。 || But when you balance it all alone, you don't notice mistakes. Or lies.
!choice
* {確|たし}かめる よ || I'll check them. -> check
* スズ の {字|じ} 、 きれい だ ね || Your handwriting's lovely. -> hand
:check
!gesture suzu thanks pc
comp[smile]: {助|たす}かる わ 。 …… {間違|まちが}い が あったら 、 {遠慮|えんりょ} なく {言|い}って 。 {笑|わら}わずに {言|い}って くれたら 、 もっと {嬉|うれ}しい 。 || Thank you. …If there's a mistake, tell me straight. Even better if you don't laugh.
!goto close
:hand
!gesture suzu laugh
comp[laugh]: {話|はなし} を そらした わ ね 。 …… {褒|ほ}め{言葉|ことば} は 、 {貸|か}し に して おく 。 || You changed the subject. …I'll put the compliment down as a credit.
:close
?(seen.sb.quiet_suzu) !gesture suzu aside
?(seen.sb.quiet_suzu) comp: {最後|さいご} の {頁|ページ} だけ は 、 {計算|けいさん} しなくて いい から ね 。 あれ は {合|あ}わない の が {正|ただ}しい の 。 || Just don't do the sums on the last page. That page is meant not to balance.
!hook co_heard t.suzu.books

@scene co.t_suzu_after
# Staged (anywhere it is told): you and Suzu turn to each other. Two showman's hands for the next show; then no
# flourish, she looks away and back to ask for the same partner; a nod, a small celebration, or a slow breath out.
!look pc suzu
!look suzu pc
!gesture suzu size
?(!post) comp: この {芝居|しばい} が {終|お}わったら 、 {次|つぎ} は {何|なに} を やる ？ {役者|やくしゃ} って 、 {千秋楽|せんしゅうらく} の {前|まえ} から {次|つぎ} の {話|はなし} を する の よ 。 || When this play's over, what do we put on next? Actors always talk about the next show before closing night.
?(post) comp: {千秋楽|せんしゅうらく} は {終|お}わった わ 。 {次|つぎ} の {演目|えんもく} 、 まだ {決|き}めて ない の 。 {珍|めずら}しい でしょ 。 || Closing night's been and gone. I haven't picked the next show. Unusual for me.
!gesture suzu avert pc
comp[closed]: {正直|しょうじき} に {言|い}う ね 。 {冗談|じょうだん} は {後|あと} に する 。 …… {次|つぎ} の {幕|まく} も 、 {同|おな}じ {相方|あいかた} で やりたい 。 {二人|ふたり} {芸|げい} の 、 {相方|あいかた} よ 。 || I'll say this honestly. Jokes later. …I'd like the next act with the same stage partner. A double act, I mean.
!choice
* {次|つぎ} の {幕|まく} も {客席|きゃくせき} に いる || I'll be in the audience for the next act too. -> seat
* {今度|こんど} は {一緒|いっしょ} に {舞台|ぶたい} に {立|た}つ || This time I'll stand on stage with you. -> stage
* {幕|まく} が {下|お}りて も 、 {道|みち} は {続|つづ}く || Curtain or not, the road goes on. -> road
:seat
!gesture suzu nod pc
comp[smile]: {特等席|とくとうせき} 、 {取|と}って おく わ 。 {料金|りょうきん} は {無料|むりょう} 。 …… {利子|りし} も なし 。 || I'll save you the best seat. Free of charge. …No interest either.
!goto close
:stage
!gesture suzu celebrate
comp[laugh]: {言|い}った わ ね ！ …… {大丈夫|だいじょうぶ} 。 {台詞|せりふ} は {言|い}わなくて いい の 。 {立|た}って いる だけ で 、 {私|わたし} が {全部|ぜんぶ} {合|あ}わせる から 。 || You said it! …Don't worry. You needn't say a line. Just stand there, and I'll play off you.
!goto close
:road
!gesture suzu exhale
comp: …… 「 そして 、 {皆|みな} {生|い}きて いった 」 。 うん 。 それ で いい の 。 || …"And everyone went on living." Yes. That'll do.
:close
!hook co_heard t.suzu.after

@scene co.ritual_nao
# Staged (anywhere you rest): Nao looks one way and the other (the window and the door, or the dark round the fire),
# then a hand to the satchel strap as it comes off; a nod to you: keep an eye on the bags.
!faceplayer comp
!look pc nao
!gesture nao lookbetween left and=right then=strap
?(!rest=camp) narr: ナオ は {窓|まど} と {扉|とびら} を {確|たし}かめて から 、 {鞄|かばん} を {肩|かた} から {下|お}ろした 。 {重|おも}い {音|おと} が した 。 || Nao checks the window and the door, then lets the satchel slide off one shoulder. It lands with a heavy thump.
?(rest=camp) narr: ナオ は {焚|た}き{火|び} の {周|まわ}り を {一周|いっしゅう} して {暗|くら}がり を {見|み}て から 、 {石|いし} の {横|よこ} に {鞄|かばん} を {下|お}ろした 。 || Nao walks once around the fire, looks into the dark, then sets the satchel down beside the stones.
!wait 500
!emote comp ...
?(display) narr: ナオ の {目|め} が 、 {飾|かざ}って ある {品|しな} に {一度|いちど} だけ {止|と}まった 。 || Nao's eyes rest for a moment on the keepsake you set out.
!gesture nao nod pc
?(!bond>=rhythm) comp: …… {少|すこ}し {休|やす}む 。 {荷物|にもつ} 、 {見|み}てて くれ 。 || …I'll rest a bit. Keep an eye on the bags.
?(bond>=rhythm&!bond>=trusted) comp[smile]: {肩|かた} が {軽|かる}い と 、 {道|みち} が {違|ちが}って {見|み}える 。 {少|すこ}し だけ な 。 || With my shoulders light, the road looks different. Only a little.
?(bond>=trusted) comp[smile]: {荷物|にもつ} を {誰|だれ} か に {見|み}て もらって {休|やす}む なんて 、 {前|まえ} は {考|かんが}えられなかった 。 || Resting while someone else watches the bags — I couldn't have imagined it before.

@scene co.ritual_mio
# Staged (anywhere you rest): Mio straightens the lamp stand (or, at a camp, kneels to set the water on), then a
# slow breath out: time doing nothing.
!faceplayer comp
!look pc mio
?(!rest=camp) !gesture mio tidy
?(rest=camp) !gesture mio kneel down
?(!rest=camp) narr: ミオ は {部屋|へや} の {行灯|あんどん} が {少|すこ}し {傾|かたむ}いて いる の に {気|き}づき 、 {真|ま}っ{直|す}ぐ に {直|なお}した 。 それ から 、 {自分|じぶん} で {少|すこ}し {笑|わら}った 。 || Mio notices the room's lamp stand leaning a little and straightens it. Then she laughs at herself, a little.
?(rest=camp) narr: ミオ は {薬箱|くすりばこ} を {下|お}ろし 、 {小|ちい}さな {鍋|なべ} で お{湯|ゆ} を {沸|わ}かし{始|はじ}めた 。 {薬|くすり} で は なく 、 お{茶|ちゃ} の ため に 。 || Mio sets down the medicine chest and puts a small pot of water on to boil. For tea, not medicine.
!wait 500
!emote comp note
?(display) narr: ミオ は {飾|かざ}って ある {品|しな} の {埃|ほこり} を 、 {袖|そで} で そっと {払|はら}った 。 || Mio brushes the dust from the keepsake you set out, gently, with her sleeve.
!gesture mio exhale
?(!bond>=rhythm) comp: …… ふう 。 {何|なに} も しない {時間|じかん} も 、 {大事|だいじ} です ね 。 || …Phew. Time spent doing nothing matters too.
?(bond>=rhythm&!bond>=trusted) comp[smile]: {直|なお}す もの が {一|ひと}つ だけ で 、 よかった 。 {今日|きょう} は それ で {十分|じゅうぶん} です 。 || Only one thing to straighten. That's plenty for today.
?(bond>=trusted) comp[smile]: {誰|だれ} か と {一緒|いっしょ} に {休|やす}む と 、 {休|やす}み が {薬|くすり} に なる ん です ね 。 {知|し}りません でした 。 || Resting with someone turns rest into medicine. I didn't know that.

@scene co.ritual_ren
# Staged (anywhere you rest): Ren sits with the travelling lamp and tends it, then speaks from there with an open
# hand.
!faceplayer comp
!look pc ren
!pose ren sit
!gesture ren tendlamp
?(!rest=camp) narr: レン は {旅|たび} の {灯|あか}り を {膝|ひざ} に {載|の}せ 、 {芯|しん} を {短|みじか}く {切|き}り{揃|そろ}えた 。 {靴|くつ} は その まま だ 。 || Ren sets the travelling lantern on one knee and trims the wick. The boots stay as they are.
?(rest=camp) narr: レン は {焚|た}き{火|び} の {火|ひ} を {少|すこ}し {分|わ}けて もらい 、 {旅|たび} の {灯|あか}り に {移|うつ}した 。 || Ren borrows a little of the campfire's flame and passes it to the travelling lantern.
!wait 500
!emote comp ...
?(display) narr: レン は {飾|かざ}って ある {品|しな} を {灯|あか}り の {近|ちか}く に {動|うご}かした 。 よく {見|み}える よう に 。 || Ren moves the keepsake you set out closer to the light, so it can be seen properly.
!gesture ren palm
?(!bond>=rhythm) comp: {灯|あか}り の {手入|てい}れ は 、 {考|かんが}え{事|ごと} の {手入|てい}れ でも あります 。 || Tending the lamp is a way of tending one's thoughts.
?(bond>=rhythm&!bond>=trusted) comp[smile]: {見|み}て いて {退屈|たいくつ} で は ありません か 。 …… そう です か 。 では 、 {続|つづ}けます 。 || Isn't this boring to watch? …Is it not? Then I'll carry on.
?(bond>=trusted) comp[smile]: {師匠|ししょう} は 、 {灯|あか}り の {手入|てい}れ を {一人|ひとり} で しました 。 {私|わたし} は 、 {見|み}て いる {人|ひと} が いる {方|ほう} が {好|す}き です 。 || My teacher always tended the lamps alone. I prefer having someone watching.

@scene co.ritual_suzu
# Staged (anywhere you rest): Suzu opens her account book and closes it again, then sits down beside you without a
# word (across the fire at a camp).
!faceplayer comp
!look pc suzu
!gesture suzu check prop=accountbook
?(!rest=camp) narr: スズ は {帳簿|ちょうぼ} を {開|ひら}き 、 {何|なに} も {書|か}かず に {閉|と}じた 。 それ から 、 {黙|だま}って {隣|となり} に {座|すわ}った 。 || Suzu opens her account book, writes nothing, and closes it again. Then she sits down beside you without a word.
?(rest=camp) narr: スズ は {焚|た}き{火|び} の {向|む}こう に {座|すわ}り 、 {火|ひ} の {粉|こ} が {上|あ}がる の を {眺|なが}めて いた 。 {珍|めずら}しく 、 {何|なに} も {言|い}わない 。 || Suzu sits across the fire, watching the sparks rise. For once, she says nothing.
!wait 600
!emote comp note
?(display) narr: スズ は {飾|かざ}って ある {品|しな} を {手|て} に {取|と}り 、 {光|ひかり} に かざして 、 {元|もと} の {場所|ばしょ} に {戻|もど}した 。 || Suzu picks up the keepsake you set out, holds it to the light, and puts it back exactly where it was.
!pose suzu sit
?(!bond>=rhythm) comp: …… {幕間|まくあい} 。 {何|なに} も {起|お}きない {時間|じかん} 。 {悪|わる}く ない でしょ 。 || …The interval. A time when nothing happens. Not bad, is it.
?(bond>=rhythm&!bond>=trusted) comp[smile]: {黙|だま}って いて も {平気|へいき} な {相手|あいて} って 、 {貴重|きちょう} なの よ 。 {役者|やくしゃ} に は 。 || Someone you can be quiet with is precious. For an actor, especially.
?(bond>=trusted) comp[smile]: {観客|かんきゃく} も {役者|やくしゃ} も いない {時間|じかん} 。 …… {帳簿|ちょうぼ} に {書|か}けない もの の {中|なか} で 、 {一番|いちばん} {好|す}き かも 。 || A time with no audience and no actors. …Of all the things I can't put in a ledger, this might be my favourite.
`, 'company/50_topics');
