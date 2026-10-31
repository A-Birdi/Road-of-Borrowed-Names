/* The Keepers' Road, Chapter 7: the road up (expansion P10; docs/future/work/P10_KEEPERS.md). Hayate's word at
 * Snowbell; the arrival at the Foot of the Road; Aya's teahouse; the first lanterns relit by their names (the clues
 * are on the road: the board and the waystone, Kumazō, Kame and the hamlet's register); the fallen cedar; the hamlet
 * at the Fox Bridge. Companion lines for all four; Suzu's have Kansai versions (kansai_95_kr.js). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene kr.hayate_road
# Snowbell's road east, twelve-chapter journeys: the lower road is buried; the way is the old ridge road.
!faceplayer
hayate: {吹|ふ}き{溜|だ}まり は {崩|くず}して おいた 。 だが 、 {下|した} の {道|みち} は {雪崩|なだれ} で {埋|う}まった 。 {春|はる} まで は {通|とお}れない 。 || I broke up the drift. But the lower road's buried under an avalanche. Nobody gets through till spring.
hayate: {灯落|ひおち} へ {行|い}く なら 、 {尾根|おね} の {古|ふる}い {道|みち} だ 。 {灯守|ひもり} の {道|みち} 、 と {昔|むかし} は {呼|よ}んだ 。 {灯籠|とうろう} は もう 、 {一|ひと}つ も {点|つ}いて いない が な 。 || If it's Lanternfall you want, it's the old ridge road. The keepers' road, they called it once. Not one of its lanterns is lit now.
hayate: …… {暗|くら}く なる {前|まえ} に 、 {宿|やど} に {着|つ}け 。 それ だけ だ 。 || …Get to a waystation before dark. That's all.
?(comp=ren) comp[surprise]: {灯守|ひもり} の {道|みち} …… 。 {名前|なまえ} だけ は 、 {聞|き}いた こと が あります 。 || The keepers' road… I've only ever heard the name.
?(comp=nao) comp: {尾根|おね} {越|ご}え か 。 {遠回|とおまわ}り だ が 、 {道|みち} が ある なら {行|い}く まで だ 。 || Over the ridge, then. The long way round, but if there's a road, we take it.
?(comp=mio) comp: {暗|くら}い {道|みち} か …… 。 {明|あか}るい うち に 、 {進|すす}もう 。 || A dark road… Let's get on while it's light.
?(comp=suzu) comp: {遠回|とおまわ}り も 、 {旅|たび} の うち よ 。 || The long way round is part of the trip too.

@scene kr.arrive
# Staged: the road climbs out of the snow into cedar and maple; a line of stone lanterns goes up the hill, every one
# dark; smoke from a waystation teahouse; your companion looks up the line of dark lanterns in their own way.
!set kr_arrived
!chapter kr
!gesture pc lookroad up
narr: {雪|ゆき} の {坂|さか} を {抜|ぬ}ける と 、 {杉|すぎ} と {紅葉|もみじ} の {山|やま} に なった 。 || Past the snowy slope, the road climbs into cedar and maple.
!card {第七章|だいななしょう} 　{灯守|ひもり} の {道|みち} || Chapter 7 — The Keepers' Road
narr: {石|いし} の {灯籠|とうろう} が 、 {山|やま} の {上|うえ} まで {並|なら}んで いる 。 {一|ひと}つ も {点|つ}いて いない 。 || Stone lanterns line the road all the way up the hill. Not one of them is lit.
?(!seen.kr.hayate_road) narr: {下|した} の {道|みち} は 、 {雪崩|なだれ} で {埋|う}まって いる 。 {灯落|ひおち} へ は 、 この {古|ふる}い {尾根|おね} の {道|みち} を {行|い}く しか ない 。 || The lower road lies buried under an avalanche. The only way to Lanternfall now is this old ridge road.
?(comp=nao) !gesture comp lookroad up
?(comp=nao) comp: {灯籠|とうろう} の {道|みち} か 。 …… {昔|むかし} は 、 {夜|よる} でも {歩|ある}けた ん だろう な 。 || A road of lanterns. …Once you could have walked it at night.
?(comp=mio) comp[sad]: こんな に たくさん ある のに 、 {全部|ぜんぶ} {消|き}えて いる …… 。 {寂|さび}しい {道|みち} だ ね 。 || So many of them, and every one dark… It's a lonely road.
?(comp=ren) !gesture comp chin
?(comp=ren) comp[think]: ここ を {歩|ある}いて いた {人|ひと} たち が いた ん です ね 。 {灯|ひ} を {一|ひと}つ ずつ 、 {守|まも}りながら 。 || There were people who walked this road, tending the lights one by one.
?(comp=suzu) comp: {暗|くら}い {花道|はなみち} ね 。 …… {誰|だれ} か が 、 {灯|あか}り を {入|い}れ{忘|わす}れた みたい 。 || A dark runway. …As if someone forgot to bring the lights up.
!quest kr_main 0
!journal {灯守|ひもり} の {道|みち} を {登|のぼ}って 、 {灯落|ひおち} へ {向|む}かう 。 {灯籠|とうろう} は どれ も {消|き}えて いる 。 || Climb the keepers' road towards Lanternfall. Every lantern on it is dark.
narr: {麓|ふもと} の {茶屋|ちゃや} から 、 {煙|けむり} が {上|あ}がって いる 。 || Smoke rises from the teahouse at the foot of the road.

@scene kr.toro_foot
# The first lantern, relit by its name (the chapter's second verb). Its plate is worn; the name is on the board and
# the waystone (either one sets kr_clue_foot).
narr: {石|いし} の {灯籠|とうろう} 。 {火袋|ひぶくろ} の {中|なか} は 、 {空|から} だ 。 || A stone lantern. Its fire box is empty.
narr: {台|だい} に {名札|なふだ} が ある 。 {字|じ} が {消|き}えて 、 「の {灯|ひ}」 しか {読|よ}めない 。 {道|みち} の {一番|いちばん} {下|した} の {灯籠|とうろう} だ 。 || On its base, a name plate, worn away: only "no hi" is left. It is the lowest lantern on the road.
!if !kr_clue_foot -> later
!challenge kr.name_foot
!set kr_l_foot
!sfx bell
narr: {名前|なまえ} を {呼|よ}ぶ と 、 {火袋|ひぶくろ} の {奥|おく} に 、 {小|ちい}さな {火|ひ} が ともった 。 || As you say its name, a small flame catches deep in the fire box.
?(comp=ren) comp[happy]: …… {点|つ}きました 。 {名前|なまえ} で 、 {灯|ひ} が {戻|もど}った 。 {灯守|ひもり} の {灯|ひ} です 。 || …It's lit. Its name brought the light back. A keepers' lamp.
?(comp=nao) comp[surprise]: {名前|なまえ} を {呼|よ}んだ だけ で …… 。 {葦|あし}ノ{瀬|せ} の {名札|なふだ} と 、 {同|おな}じ だ な 。 || Just by calling its name… Like the name tags back in Reedwake.
?(comp=mio) comp[smile]: {点|つ}いた …… 。 {一|ひと}つ だけ でも 、 {道|みち} が {明|あか}るく {見|み}える ね 。 || It's lit… Even one makes the road look brighter.
?(comp=suzu) comp[laugh]: {一|ひと}つ {目|め} の {灯|あか}り 、 {入|はい}りました ！ {幕|まく} が {開|あ}いた わ 。 || First light up! The curtain's open.
!quest kr_main 1
!journal {名前|なまえ} を {読|よ}む と 、 {灯籠|とうろう} に {灯|ひ} が {戻|もど}る 。 {杉|すぎ} の {石段|いしだん} を {登|のぼ}って 、 {狐橋|きつねばし} へ 。 || Read a lantern's name, and its light comes back. On up the cedar steps to the Fox Bridge.
!end
:later
narr: {名前|なまえ} が {分|わ}かれば 、 {灯|ひ} が {戻|もど}る かも しれない 。 {道標|みちしるべ} か {掲示板|けいじばん} に 、 {手|て}がかり が あり そう だ 。 || If you knew its name, the light might come back. The waystone or the notice board may hold a clue.

@scene kr.toro_foot_lit
narr: 「{迎|むか}え の {灯|ひ}」 。 {旅人|たびびと} を {迎|むか}える {灯|ひ} が 、 {静|しず}か に {燃|も}えて いる 。 || "The Welcoming Light". The lamp that greets travellers burns quietly.

@scene kr.foot_board
!gesture pc read 12,14
narr: {古|ふる}い {掲示板|けいじばん} 。 {灯守|ひもり} の {頃|ころ} の {札|ふだ} が 、 {一枚|いちまい} だけ {残|のこ}って いる 。 || An old notice board. One notice from the keepers' days is left on it.
narr: 「{灯|ひ} の {名|な} ： {迎|むか}え の {灯|ひ} 、 {杉|すぎ} の {灯|ひ} 、 {狐|きつね} の {灯|ひ} …… 」 {後|あと} は {雨|あめ} で {読|よ}めない 。 || "The lights' names: the Welcoming Light, the Cedar Light, the Fox Light…" The rest is washed out by rain.
!set kr_clue_foot

@scene kr.foot_marker
!gesture pc read 16,14
narr: {道標|みちしるべ} 。 「{一|いち} の {宿|やど} ・ {灯守|ひもり} の {道|みち} ・ {迎|むか}え の {灯|ひ} より {登|のぼ}る べし」 || A waystone: "First waystation · The Keepers' Road · Climb from the Welcoming Light".
?(prof=A) narr: 「{登|のぼ}る べし」 は {古|ふる}い {言|い}い{方|かた} で 、 「{登|のぼ}りなさい」 の {意味|いみ} 。 || 登るべし is an old form: "climb (from here)".
!set kr_clue_foot

@scene kr.shrine_foot
# The first of the lantern shrines (The Pilgrim's Stamp Book).
narr: {道|みち} の {脇|わき} の {小|ちい}さな {祠|ほこら} 。 {灯|ひ} の {神|かみ} を まつって いる 。 || A small roadside shrine to the god of the lamps.
?(item.kr_stampbook&!kr_seal_1) !set kr_seal_1
?(item.kr_stampbook&kr_seal_1) narr: イワ さん の {御朱印帳|ごしゅいんちょう} に 、 {一|ひと}つ {目|め} の {印|しるし} を もらった 。 || Iwa's stamp book has its first seal.

@scene kr.aya_first
!faceplayer
!set kr_aya_met
kr_aya[surprise]: あら 、 お{客|きゃく}さん ！ この {道|みち} を {登|のぼ}る {人|ひと} は 、 {珍|めずら}しい わ 。 || Oh, travellers! Not many climb this road.
kr_aya: {上|うえ} の {灯籠|とうろう} が {消|き}えて から 、 もう {七年|ななねん} 。 {数|かぞ}えて いる の よ 。 {七年|ななねん} と {三月|みつき} 。 || It's been seven years since the lanterns up there went out. I count. Seven years and three months.
kr_aya: {尾根|おね} の {先|さき} の {宿坊|しゅくぼう} に 、 ヒサエ さん と いう {灯守|ひもり} の おばあさん が {一人|ひとり} で {住|す}んで いる わ 。 {年|とし} に {二度|にど} 、 {油|あぶら} を {買|か}い に {下|お}りて くる の 。 || Up past the ridge, at the lodge, an old keeper called Hisae lives on her own. She comes down twice a year to buy oil.
kr_aya[smile]: お{茶|ちゃ} を どうぞ 。 {灯|ひ} の ない {道|みち} は 、 {足|あし} が {疲|つか}れる から 。 || Have some tea. A road with no lights is hard on the feet.
!heal

@scene kr.aya_idle
!faceplayer
kr_aya: {灯籠|とうろう} の {名前|なまえ} ？ {掲示板|けいじばん} に {古|ふる}い {札|ふだ} が {残|のこ}って いる わ よ 。 || The lanterns' names? There's an old notice still on the board.
!heal

@scene kr.aya_after
!faceplayer
kr_aya[happy]: {上|うえ} の {灯|ひ} が 、 ここ から {見|み}える の よ ！ {七年|ななねん} {三月|みつき} と {十二日|じゅうににち} ぶり 。 …… {数|かぞ}えて いて よかった 。 || I can see the lights up there from here! Seven years, three months and twelve days. …I'm glad I kept count.
!heal

@scene kr.inn_book
!gesture pc read 8,2
narr: {茶屋|ちゃや} の {宿帳|やどちょう} 。 {巡礼|じゅんれい} の {名前|なまえ} が {並|なら}んで いる 。 {灯守|ひもり} の {名前|なまえ} は 、 {最後|さいご} の {頁|ページ} に {一|ひと}つ だけ 。 「ヒサエ」 。 || The teahouse's register. A column of pilgrims' names. A keeper's name appears just once, on the last page: "Hisae".

@scene kr.iwa_first
!faceplayer
!set kr_iwa_met
kr_iwa: こんにちは 。 わたし は 、 {灯|ひ} の {祠|ほこら} を {回|まわ}って いる の 。 {三|みっ}つ {回|まわ}る と 、 {願|ねが}い が かなう そう よ 。 || Hello. I'm going round the lantern shrines. Visit all three, they say, and your wish comes true.
kr_iwa: {御朱印帳|ごしゅいんちょう} に 、 {印|しるし} を {集|あつ}めて いる の 。 …… さあ 、 {先|さき} に {行|い}く わ ね 。 ゆっくり {登|のぼ}らない と 。 || I collect the seals in my stamp book. …Well, I'll go on ahead. Slowly does it.

@scene kr.iwa_book
!gesture pc kneel
narr: {石段|いしだん} の {途中|とちゅう} に 、 {折|お}りたたみ の {小|ちい}さな {帳面|ちょうめん} が {落|お}ちて いる 。 {表|おもて} に 「イワ」 。 || Halfway up the steps lies a small folding book. On its cover: "Iwa".
!give kr_stampbook
!set kr_iwa_book_found
!quest kr_stamps 0
!journal イワ さん の {御朱印帳|ごしゅいんちょう} を {拾|ひろ}った 。 {先|さき} で {返|かえ}そう 。 || You picked up Iwa's stamp book. Give it back to her further up.

@scene kr.seiji_first
!faceplayer
!set kr_seiji_met
kr_seiji: {僕|ぼく} も {上|うえ} へ {行|い}きます 。 {尾根|おね} の {上|うえ} の 、 {古|ふる}い {社|やしろ} まで 。 {祖父|そふ} の {代|か}わり に お{参|まい}り を {頼|たの}まれて 。 || I'm going up too. To the old shrine above the ridge. My grandfather asked me to go in his place.
kr_seiji: {途中|とちゅう} まで 、 ご{一緒|いっしょ} して いい です か 。 {戦|たたか}い は できません が 、 この {山|やま} の こと は {少|すこ}し {知|し}って います 。 || May I walk with you part of the way? I can't fight, but I know a little about these hills.

@scene kr.cedar
# Road event (W5): a cedar has come down across the steps. Kumazō, a woodcutter, needs a second pair of hands.
!if kr_cedar_cleared -> gone
!look kr_kumazo pc
kr_kumazo: お 、 {人|ひと} だ 。 {助|たす}かった 。 {夜|よる} の {風|かぜ} で 、 {杉|すぎ} が {倒|たお}れた ん だ 。 {一人|ひとり} じゃ {動|うご}かん 。 || Oh, people. Good. The wind brought a cedar down in the night. I can't shift it on my own.
kr_kumazo: そっち の {端|はし} を {持|も}って くれ 。 {俺|おれ} が 「せーの」 と {言|い}ったら 、 {押|お}す ん だ 。 || Take that end. When I say "se-no", push.
!challenge kr.cedar
!set kr_cedar_cleared
!gesture kr_kumazo brow
narr: {杉|すぎ} が {転|ころ}がって 、 {石段|いしだん} が {空|あ}いた 。 || The cedar rolls over and away, and the steps are clear.
kr_kumazo[laugh]: いい {腕|うで} だ ！ …… {礼|れい} に 、 {一|ひと}つ {教|おし}えて やろう 。 この {上|うえ} の {灯籠|とうろう} は 、 「{杉|すぎ} の {灯|ひ}」 と {言|い}う ん だ 。 {親父|おやじ} が そう {呼|よ}んで いた 。 || Nice work! …Here's something for your trouble. The lantern up there is called "the Cedar Light". My father called it that.
!set kr_clue_steps
!end
:gone
narr: {倒|たお}れた {杉|すぎ} は 、 {道|みち} の {脇|わき} に {転|ころ}がって いる 。 || The fallen cedar lies off to the side of the path.

@scene kr.kumazo_first
!faceplayer
!if !kr_cedar_cleared -> ask
kr_kumazo: {杉|すぎ} の {灯|ひ} の {名前|なまえ} 、 {忘|わす}れる な よ 。 || Don't forget the Cedar Light's name.
!end
:ask
kr_kumazo: {杉|すぎ} が {道|みち} を ふさいで いる 。 {手|て} を {貸|か}して くれん か 。 || A cedar's blocking the steps. Could you lend a hand?

@scene kr.kumazo_idle
!faceplayer
kr_kumazo: {灯籠|とうろう} が {暗|くら}い と 、 {山|やま} の もの が {寄|よ}って くる 。 {子供|こども} の ころ は 、 {夜|よる} でも {明|あか}るかった ん だ が な 。 || With the lanterns dark, things come down out of the hills. When I was a boy it was bright here even at night.

@scene kr.kumazo_after
!faceplayer
kr_kumazo[happy]: {夜|よる} の {石段|いしだん} が 、 {明|あか}るい 。 {親父|おやじ} に {見|み}せて やりたかった な 。 || The steps are bright at night. I wish my father could have seen it.

@scene kr.toro_steps
narr: {苔|こけ} に {覆|おお}われた {灯籠|とうろう} 。 {名札|なふだ} の {字|じ} は 、 「{杉|すぎ}」 の {一字|いちじ} しか {読|よ}めない 。 || A moss-covered lantern. Only one character on its plate can be read: 杉, cedar.
!if !kr_clue_steps -> later
!challenge kr.name_steps
!set kr_l_steps
!sfx bell
narr: 「{杉|すぎ} の {灯|ひ}」 。 {苔|こけ} の {間|あいだ} から 、 {灯|ひ} が こぼれた 。 || "The Cedar Light". Light spills out between the moss.
?(comp=ren) comp[smile]: {二|ふた}つ {目|め} です 。 …… {登|のぼ}る ほど 、 {道|みち} が {思|おも}い{出|だ}して いく みたい です 。 || That's two. …As if the road remembers more, the higher we climb.
!end
:later
narr: {誰|だれ} か が 、 この {灯籠|とうろう} の {名前|なまえ} を {覚|おぼ}えて いない だろう か 。 || Surely someone remembers this lantern's name.

@scene kr.toro_steps_lit
narr: {杉|すぎ} の {灯|ひ} が 、 {石段|いしだん} を {照|て}らして いる 。 || The Cedar Light shines on the steps.

@scene kr.shrine_steps
narr: {石段|いしだん} の {上|うえ} の {祠|ほこら} 。 {古|ふる}い {灯明皿|とうみょうざら} が {置|お}いて ある 。 || A shrine at the top of the steps. An old lamp dish sits before it.
?(item.kr_stampbook&!kr_seal_2) !set kr_seal_2
?(item.kr_stampbook&kr_seal_2) narr: {二|ふた}つ {目|め} の {印|しるし} も 、 もらった 。 || The second seal is in the book too.

@scene kr.fox_arrive
# Staged: out of the cedars into a small hamlet; a gorge with a wooden bridge; a fox shrine at its near end; two
# children at the well singing a counting song; a lantern by the bridge, dark, painted a faded golden brown.
!set kr_fox_seen
narr: {杉|すぎ} の {林|はやし} を {抜|ぬ}ける と 、 {小|ちい}さな {里|さと} に {出|で}た 。 {谷|たに} に 、 {木|き} の {橋|はし} が {架|か}かって いる 。 || Out of the cedars, a small hamlet. A wooden bridge spans the gorge.
narr: {井戸|いど} の そば で 、 {子供|こども} が {二人|ふたり} 、 {数|かぞ}え{歌|うた} を {歌|うた}って いる 。 「ひがし の ひ 、 いずみ の ひ ……」 || By the well, two children are singing a counting song: "East's light, spring's light…"
?(comp=suzu) comp[smile]: {子供|こども} の {歌|うた} って 、 {古|ふる}い {話|はなし} が {残|のこ}って いる こと が ある の よ 。 {覚|おぼ}えて おこう 。 || Children's songs sometimes keep old stories in them. Let's remember it.
?(comp=ren) comp[think]: {灯|ひ} の {歌|うた} です ね 。 …… {灯守|ひもり} の {言葉|ことば} が 、 {入|はい}って いる よう な 。 || A song about lights. …It sounds like it has keepers' words in it.
?(comp=nao) comp: {数|かぞ}え{歌|うた} か 。 {子供|こども} の {歌|うた} は 、 {大人|おとな} より {物|もの} を {覚|おぼ}えて いる 。 || A counting song. Children's songs remember more than grown-ups do.
?(comp=mio) comp[smile]: かわいい {歌|うた} 。 …… でも 、 {灯|ひ} の {名前|なまえ} ばかり だ ね 。 || A sweet song. …All about the names of lights, though.
!quest kr_main 2
!journal {狐橋|きつねばし} の {里|さと} に {着|つ}いた 。 {宿坊|しゅくぼう} は 、 {橋|はし} を {渡|わた}って {尾根|おね} の {先|さき} 。 || You reach the hamlet at the Fox Bridge. The lodge is across the bridge, past the ridge.

@scene kr.shozo_first
!faceplayer
!set kr_shozo_met
kr_shozo: {里長|さとおさ} の ショウゾウ です 。 {宿坊|しゅくぼう} へ ？ {橋|はし} を {渡|わた}って 、 {尾根|おね} を {東|ひがし} へ 。 {分|わ}かれ{道|みち} は 、 {右|みぎ} です 。 || I'm Shōzō, the headman. To the lodge? Across the bridge and east along the ridge. Keep right at the fork.
kr_shozo: {左|ひだり} の {道|みち} は 、 {古|ふる}い {館|やかた} へ {行|い}く だけ です 。 {戸|と} は {閉|し}まった まま です よ 。 {誰|だれ} も {開|あ}けた こと が ない 。 || The left way only goes to the old hall. Its door stays shut. No one has ever opened it.
kr_shozo: …… ところで 、 この {橋|はし} の {名前|なまえ} の {話|はなし} 、 {聞|き}きました か 。 {里|さと} に は {三|みっ}つ も {話|はなし} が あって 、 {困|こま}って いる ん です 。 || …By the way, have you heard about this bridge's name? The hamlet has three stories about it, and it's a nuisance.
kr_shozo: {新|あたら}しい {板|いた} を {作|つく}る のに 、 どれ を {書|か}けば いい か {決|き}まらない 。 {話|はなし} を {聞|き}いて くれたら 、 {助|たす}かります 。 || We're making a new board and can't decide which to write. If you'd hear them out, I'd be grateful.
!quest kr_fox 0

@scene kr.shozo_idle
!faceplayer
kr_shozo: カメ さん の {話|はなし} 、 {里|さと} の {記録|きろく} 、 {祠|ほこら} の {板|いた} 。 {三|みっ}つ と も 、 {違|ちが}う ん です よ 。 || Kame's story, the hamlet's register, the shrine's board. All three say something different.
!if !kr_record_read -> ask
:clues
!if !seen.kr.kame|!seen.kr.fox_shrine|!kr_record_read -> end
!choice
* {話|はなし} を {比|くら}べて みる 。 || Compare the tellings. -> fox
* また {後|あと} で 。 || Later. -> end
:fox
!call kr.shozo_fox
:end
!end
# The register is kept in his house, and he brings it out when asked: nothing else ever showed it, so the comparison
# could never be offered (Cloud CC-386, CC-387; Local CL-539, CL-540; Agnes 6541203705). Read once, then the clues are
# checked again.
:ask
!choice
* {里|さと} の {記録|きろく} を {見|み}せて もらう 。 || Ask to see the hamlet's register. -> record
* また {後|あと} で 。 || Later. -> end
:record
!call kr.record
!goto clues

@scene kr.shozo_fox
# Three Tellings of the Fox Bridge (side quest): weigh them, and the hamlet keeps the version you settle on.
!if quest.kr_fox=done -> done
kr_shozo: {三|みっ}つ の {話|はなし} を {並|なら}べて 、 {一緒|いっしょ} に {考|かんが}えて ください 。 || Set the three side by side and think it through with me.
!hook tellings kr.t_fox
!if var._tell=cancel -> later
!if var._tell=no -> no
!quest kr_fox done
?(var.tell_kr.t_fox=both) kr_shozo[smile]: {灯守|ひもり} の {名付|なづ}け と 、 カメ さん の {家|いえ} の {話|はなし} 。 {両方|りょうほう} {書|か}けば 、 {誰|だれ} も {怒|おこ}らない 。 いい {案|あん} です 。 || The keeper's naming, and the tale from Kame's family. Write both, and no one's put out. A good idea.
?(var.tell_kr.t_fox=record) kr_shozo: {記録|きろく} の とおり に {書|か}きましょう 。 …… カメ さん に は 、 {私|わたし} から {話|はな}して おきます 。 || We'll write it as the register has it. …I'll speak to Kame myself.
?(var.tell_kr.t_fox=three) kr_shozo[think]: {三|みっ}つ と も 、 {誰|だれ} の {話|はなし} か {添|そ}えて {並|なら}べる 。 …… {長|なが}い {板|いた} に なります が 、 {正直|しょうじき} です ね 。 || All three, each with whose it is. …It'll be a long board, but an honest one.
!set kr_fox_board
!journal {狐橋|きつねばし} の {新|あたら}しい {板|いた} に {書|か}く {話|はなし} が {決|き}まった 。 || The hamlet has settled what goes on the Fox Bridge's new board.
!end
:no
kr_shozo[think]: …… 「{狐|きつね} が {架|か}けた」 と {書|か}いたら 、 {記録|きろく} と {合|あ}いません 。 {誰|だれ} も {見|み}て いない こと です し 。 もう {少|すこ}し {考|かんが}えましょう か 。 || …If we write "a fox built it", it won't match the register, and nobody saw it happen. Shall we think a little more?
!end
:later
kr_shozo: {急|いそ}ぎません 。 また {聞|き}かせて ください 。 || No hurry. Tell me another time.
!end
:done
kr_shozo: {板|いた} は 、 {今|いま} {塗|ぬ}って いる ところ です 。 || The board's being painted now.

@scene kr.shozo_after
!faceplayer
# (the new board only once the tellings were weighed with him; else only the line's second sentence: Agnes 6541203705)
?(kr_fox_board) kr_shozo[happy]: {橋|はし} の {灯籠|とうろう} が {狐色|きつねいろ} に {光|ひか}って 、 {新|あたら}しい {板|いた} も {読|よ}める 。 {里|さと} の {者|もの} が 、 {夜|よる} に {橋|はし} を {見|み}に {来|く}る ん です よ 。 || The bridge lantern glows fox-brown, and the new board can be read by it. People come out at night just to look at the bridge.
?(!kr_fox_board) kr_shozo[happy]: {里|さと} の {者|もの} が 、 {夜|よる} に {橋|はし} を {見|み}に {来|く}る ん です よ 。 || People come out at night just to look at the bridge.

@scene kr.kame
!faceplayer
!if kr_kame_told -> again
kr_kame[smile]: {橋|はし} の {話|はなし} かい 。 おばあさん が 、 {寝|ね}る {前|まえ} に {話|はな}して くれた もの さ 。 || The bridge's story, is it? My grandmother used to tell it at bedtime.
kr_kame: {昔|むかし} 、 {罠|わな} に かかった {子狐|こぎつね} を 、 {灯守|ひもり} が {助|たす}けた 。 その {夜|よる} 、 {狐|きつね} が {一晩|ひとばん} で {橋|はし} を {架|か}けて 、 お{礼|れい} を した ん だ と さ 。 || Long ago a keeper freed a fox cub from a snare. That night the foxes built the bridge in a single night, to say thank you. So the story goes.
kr_kame: {本当|ほんとう} か どう か なんて 、 {知|し}らない よ 。 でも 、 おばあさん の {声|こえ} は 、 {今|いま} も {覚|おぼ}えて いる 。 || Whether it's true, I couldn't tell you. But I still remember my grandmother's voice.
!set kr_kame_told
!set kr_clue_fox
!end
:again
kr_kame: {橋|はし} の そば の {灯籠|とうろう} は ね 、 「{狐|きつね} の {灯|ひ}」 と {言|い}う の さ 。 {狐色|きつねいろ} だ から ね 。 || The lantern by the bridge, now, it's called "the Fox Light". Because it's fox-coloured, see.
!set kr_clue_fox

@scene kr.kame_after
!faceplayer
kr_kame[happy]: {新|あたら}しい {板|いた} に 、 おばあさん の {話|はなし} の こと も {書|か}いて ある か 、 {見|み}に {行|い}かない と ね 。 || I must go and see what the new board says about my grandmother's story.

@scene kr.fox_shrine
!gesture pc read 18,8
narr: {狐|きつね} の {祠|ほこら} 。 {板|いた} に 「この {祠|ほこら} は 、 {橋|はし} を {守|まも}る {狐|きつね} を まつる 。」 || The fox shrine. Its board: "This shrine honours the fox that guards the bridge."
?(item.kr_stampbook&!kr_seal_3) !set kr_seal_3
?(item.kr_stampbook&kr_seal_3) narr: {三|みっ}つ {目|め} の {印|しるし} も 、 {御朱印帳|ごしゅいんちょう} に {押|お}した 。 || The third seal is in the book.

@scene kr.fox_marker
!gesture pc read 31,15
narr: {道標|みちしるべ} 。 「{二|に} の {宿|やど} ・ {狐橋|きつねばし} 。 {宿坊|しゅくぼう} まで {尾根|おね} を {東|ひがし} へ 」 || A waystone: "Second waystation · Fox Bridge. East along the ridge to the lodge."

@scene kr.record
# The hamlet's register, kept in Shōzō's house (read from the headman: he brings it out).
!gesture pc read
narr: {里|さと} の {古|ふる}い {記録|きろく} 。 {橋|はし} が できた {年|とし} の {頁|ページ} に 、 こう ある 。 || The hamlet's old register. On the page for the year the bridge was built:
narr: 「{灯守|ひもり} {某|なにがし} 、 {橋|はし} の そば の {灯籠|とうろう} を {狐色|きつねいろ} に {塗|ぬ}り 、 {狐橋|きつねばし} と {名付|なづ}く 。」 || "The keeper so-and-so painted the lantern by the bridge fox-colour, and named it Fox Bridge."
!set kr_record_read
!set kr_clue_fox

@scene kr.toro_fox
narr: {橋|はし} の そば の {灯籠|とうろう} 。 {色|いろ} の {剥|は}げた 、 {焼|や}いた パン の よう な {茶色|ちゃいろ} 。 {名札|なふだ} は 、 {字|じ} が {一|ひと}つ も {残|のこ}って いない 。 || The lantern by the bridge, its paint flaking, the brown of toasted bread. Not one character is left on its plate.
!if !kr_clue_fox -> later
!challenge kr.name_fox
!set kr_l_fox
!sfx bell
narr: 「{狐|きつね} の {灯|ひ}」 。 {狐色|きつねいろ} の {灯籠|とうろう} が 、 {橋|はし} を {金色|きんいろ} に {照|て}らした 。 || "The Fox Light". The fox-coloured lantern lights the bridge gold.
?(comp=nao) comp[smile]: {三|みっ}つ {目|め} か 。 {名前|なまえ} を {覚|おぼ}えて いる {人|ひと} が 、 まだ いる 。 {悪|わる}く ない な 。 || Three. There are still people who remember the names. Not bad.
?(comp=mio) comp[smile]: {狐色|きつねいろ} の {灯|ひ} …… {温|あたた}かい {色|いろ} だ ね 。 || A fox-brown light… such a warm colour.
?(comp=ren) comp[happy]: {狐|きつね} の {灯|ひ} 。 …… {名|な} は {灯|ひ} に 、 です ね 。 || The Fox Light. …The name to the lamp.
?(comp=suzu) comp[laugh]: {化|ば}かされた みたい に きれい ね 。 {狐|きつね} の {灯|あか}り って 、 {出来過|できす}ぎ よ 。 || Pretty enough to be a fox's trick. A fox's light — it's almost too good.
!end
:later
narr: {里|さと} の {人|ひと} なら 、 この {灯籠|とうろう} の {名前|なまえ} を {知|し}って いる かも しれない 。 || Someone in the hamlet may know this lantern's name.

@scene kr.toro_fox_lit
narr: {狐|きつね} の {灯|ひ} が 、 {橋|はし} の {上|うえ} を {照|て}らして いる 。 || The Fox Light shines across the bridge.

@scene kr.kids_rhyme
!faceplayer
kr_hinata[smile]: ひがし の ひ 、 いずみ の ひ 、 かね が なったら 、 なまえ の ひ ！ || East's light, spring's light, when the bell has rung, the name's light!
kr_kai: つづき も ある よ 。 おね の みち 、 とうろう みっつ 、 みっつめ の した に 、 あぶら が ねむる ！ || There's more! Along the ridge road, lanterns three; under the third, the oil sleeps!
kr_hinata: おばあちゃん に ならった の 。 {意味|いみ} は 、 しらない ！ || Grandma taught us. We don't know what it means!
!set kr_rhyme_heard
?(!quest.kr_cache) !quest kr_cache 0
?(!quest.kr_cache) !journal {子供|こども} の {数|かぞ}え{歌|うた} に 、 {油|あぶら} の {隠|かく}し{場所|ばしょ} が {歌|うた}われて いる かも しれない 。 || The children's counting song may tell where some oil is hidden.

@scene kr.kids_after
!faceplayer
kr_kai[happy]: うた の とおり だった んだ って ！ あぶら 、 ほんとう に あった ！ || It was just like the song! There really was oil!
kr_hinata[laugh]: こんど は 、 あたらしい うた を つくる の 。 || Next we're making up a new song.
`, 'kr/road');
