/* Manybridge, Chapter 3: the thread (expansion P08; docs/future/work/P08_MANYBRIDGE.md). Quest mb_main:
 *   0  arrived: find Fujiya, whose rice keeps going astray
 *   1  the porters' canal table: send the next barges properly (barge routing, 30_learning.js)
 *   2  the Tally Exchange: Fujiko, Heiji and the porter Gonta (the dispute, 31_encounters.js)
 *   3  Sen's register of bridges: the first bridge, under the Exchange; the oldest dead letter (Yoshi)
 *   4  evening at the inn: Ichi is lost in the canals; the night search (Kansuke, the East Bridge)
 *   5  morning: the lock-keeper Matsu and the way down (the negotiation)
 *   6  the Undercroft Locks and the Nameless Bridge (11_under.js, 22_scenes_under.js)
 *   7  the bridges named; the chapter's end (mb1_done)
 * Evidence of the first bridge's name (flags mb_ev_*): the dead letter's address (main), Ichi's counting song
 * (main), the Fujiya tally book's rubbing and Kansuke's riddle (optional). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene mb.fujiko_first
# Staged: Fujiko looks up from a ledger at the counter, sizes you up, and waves you in; she taps the ledger at
# "Heiji"; your companion's own answer; she points east, towards the porters.
!faceplayer
mb_fujiko: いらっしゃい 。 …… {客|きゃく} じゃ ない ね 。 その {顔|かお} は 、 {外|そと} の {騒|さわ}ぎ を {見|み}て きた {顔|かお} だ 。 || Welcome. …You're not customers. That's the face of someone who's seen the racket outside.
pc: {潮硝子|しおがらす} から {来|き}ました 。 {橋|はし} の {名前|なまえ} の こと を {聞|き}きたくて 。 || We've come from Saltglass. We wanted to ask about the bridges' names.
mb_fujiko: {潮硝子|しおがらす} ！ あそこ の {干物|ひもの} は うち が {買|か}ってる 。 …… なら {話|はな}そう 。 || Saltglass! We buy their dried fish. …Then I'll tell you.
!gesture mb_fujiko read
mb_fujiko: うち の {米|こめ} を 、 {蔵|くら} の {並|なら}び の ヘイジ さん に {送|おく}った 。 {三度|さんど} {送|おく}って 、 {三度|さんど} とも 「{届|とど}いて ない 」 と {言|い}われた 。 || I sent rice to Heiji on Warehouse Row. Three times I sent it, and three times he said it never arrived.
mb_fujiko[angry]: {払|はら}い は {止|と}まる 。 {米|こめ} は どこ か へ {消|き}える 。 {橋|はし} の {札|ふだ} は {真|ま}っ{白|しろ} 。 {商売|しょうばい} に {名前|なまえ} が ない と 、 こう なる の さ 。 || Payment stops. The rice vanishes somewhere. The plaques are blank. That's trade without names for you.
?(comp=nao) comp: {荷|に} が {消|き}える 、 か 。 {大抵|たいてい} は 、 どこ か に ちゃんと ある もの だ 。 {誰|だれ} も {見|み}て ない {所|ところ} に な 。 || Cargo vanishing, eh. Usually it's somewhere all right. Somewhere nobody's looked.
?(comp=mio) comp: ヘイジ さん も 、 {困|こま}って いる の かも しれません ね 。 {米|こめ} が {来|こ}ない の は 、 {向|む}こう も {同|おな}じ です から 。 || Heiji may be struggling too. The rice not coming hurts him just the same.
?(comp=ren) comp: {舟|ふね} を {導|みちび}く の が {橋|はし} の {札|ふだ} なら 、 {札|ふだ} の {消|き}えた {所|ところ} で {舟|ふね} は {曲|ま}がり{方|かた} を {間違|まちが}える 。 {灯|ひ} の {道|みち} と {同|おな}じ です 。 || If the plaques guide the boats, the boats turn wrong where the plaques are gone. It's the same on the lantern roads.
?(comp=suzu) comp[smirk]: {三度|さんど} も {消|き}える {米|こめ} 、 {手品|てじな} なら {大当|おおあ}たり だけど ね 。 || Rice that vanishes three times over — as a magic act, it'd be a hit.
mb_fujiko: {次|つぎ} の {荷|に} は もう {舟|ふね} に {積|つ}んで ある 。 {荷運|にはこ}び{屋|や} の {盤|ばん} で 、 {行|い}き{先|さき} を はっきり {言|い}って やって くれない か 。 {舟|ふね} は {言|い}われた {通|とお}り に {行|い}く 。 {言|い}われた {通|とお}り に しか {行|い}かない 。 || The next load is already aboard. Would you go to the porters' board and tell them clearly where it's going? A barge goes exactly where it's told. Only where it's told.
!look mb_fujiko 49,7
!quest mb_main 1
!journal {藤屋|ふじや} の {米|こめ} が 、 {三度|さんど} も ヘイジ さん に {届|とど}いて いない 。 {荷運|にはこ}び{屋|や} の {盤|ばん} で 、 {次|つぎ} の {荷|に} を {送|おく}る 。 || Fujiya's rice has failed to reach Heiji three times. At the porters' board, send the next load.

@scene mb.fujiko_route
mb_fujiko: {荷運|にはこ}び{屋|や} は {隣|となり} だ よ 。 {誰|だれ} が 、 {何|なに} を 、 どこ に 。 {舟|ふね} は それ だけ {聞|き}けば {動|うご}く 。 || The porters are next door. Who, what, where to. That's all a barge needs to hear.

@scene mb.fujiko_idle
mb_fujiko: {名前|なまえ} の ない {商売|しょうばい} は 、 {約束|やくそく} の ない {商売|しょうばい} だ 。 {早|はや}く {札|ふだ} が {戻|もど}って ほしい ね 。 || Trade without names is trade without promises. I want those plaques back.

@scene mb.fujiko_tallygo
mb_fujiko: {札場|ふだば} で ヘイジ さん が {待|ま}ってる 。 {私|わたし} も {行|い}く よ 。 || Heiji's waiting at the Tally Exchange. I'm going too.

@scene mb.fujiko_after
mb_fujiko: {札|ふだ} が {読|よ}める と 、 {払|はら}い も {読|よ}める 。 ありがたい ね 。 …… {次|つぎ} に {潮硝子|しおがらす} へ {行|い}く なら 、 {干物|ひもの} の {代金|だいきん} 、 {持|も}って いって おくれ 。 || When the plaques read, so do the payments. A mercy. …If you're going back to Saltglass, take them the money for the fish, would you?

@scene mb.fujiya_scroll
narr: {掛|か}け{軸|じく} に 「{信用|しんよう} は {名前|なまえ} に {宿|やど}る 」 と {書|か}いて ある 。 || A hanging scroll reads: "Trust lives in a name."

@scene mb.fujiya_tallybook
!gesture pc read
narr: {古|ふる}い {帳面|ちょうめん} 。 {藤屋|ふじや} の {先々代|せんせんだい} が 、 {橋|はし} の {札|ふだ} を {紙|かみ} に {写|うつ}し{取|と}った {拓本|たくほん} が {挟|はさ}まって いる 。 || An old ledger. Tucked inside are rubbings Fujiya's grandmother took of the bridges' plaques.
?(quest.mb_main>=3) narr: {一番|いちばん} {古|ふる}い {一枚|いちまい} に は 、 「{一|いち}」 と {番号|ばんごう} が あり 、 {名前|なまえ} の {最初|さいしょ} の {字|じ} だけ が {読|よ}める 。 「{結|むす}ぶ」 と {同|おな}じ {字|じ} だ 。 || The oldest is numbered "one", and only the first character of its name can be read: 結…
?(quest.mb_main>=3&!mb_ev_rubbing) !set mb_ev_rubbing
?(quest.mb_main>=3&!mb_ev_rubbing_j) !journal {藤屋|ふじや} の {拓本|たくほん} ： {一番|いちばん} の {橋|はし} の {名前|なまえ} の {最初|さいしょ} の {字|じ} は 、 「{結|むす}ぶ」 の {字|じ} 。 || Fujiya's rubbing: the first bridge's name begins with 結 (musu…).
?(quest.mb_main>=3) !set mb_ev_rubbing_j

@scene mb.porters_take
mb_take: {盤|ばん} は そこ だ 。 {舟|ふね} の {札|ふだ} を {付|つ}けて 、 {行|い}き{先|さき} を {言|い}えば 、 {船頭|せんどう} が その {通|とお}り に {漕|こ}ぐ 。 || The board's there. Pin on the barge's tag, say where it's going, and the boatman rows it just as you say.
?(quest.mb_main>=2) mb_take: {舟|ふね} は ちゃんと {着|つ}いた 。 なら 、 {前|まえ} の {三|みっ}つ は どこ へ {行|い}った ん だ ？ {札場|ふだば} で ヘイジ さん が {怒|おこ}ってる ぜ 。 || The barges got there fine. So where did the three before go? Heiji's fuming at the Tally Exchange.

@scene mb.porters_rules
narr: 「{荷運|にはこ}び の {心得|こころえ} 。 {誰|だれ} から 、 {誰|だれ} へ 、 {何|なに} を 、 どこ まで 。 {言|い}われない こと は 、 しない 。」 || "The porter's rule. From whom, to whom, what, and how far. Do nothing you weren't told."

@scene mb.route_table
# Staged: the canal board: you pin the tag, Take beside you; the barge goes where you said; your companion watches.
?(quest.mb_main<1) narr: {運河|うんが} の {盤|ばん} 。 {小|ちい}さな {舟|ふね} の {駒|こま} が {並|なら}んで いる 。 || The canal board. Little barge tokens stand in a row.
?(quest.mb_main<1) !end
?(quest.mb_main>=2) narr: {盤|ばん} の {上|うえ} の {舟|ふね} は 、 みんな {行|い}き{先|さき} に {着|つ}いて いる 。 || Every barge on the board has reached where it was going.
?(quest.mb_main>=2) !end
!gesture pc read
mb_take: まず は {藤屋|ふじや} の {米|こめ} だ 。 ヘイジ さん の {西|にし} の {蔵|くら} 。 {言|い}って くれ 。 || First, Fujiya's rice. Heiji's west storehouse. Say it.
!challenge mb.route1
mb_take: よし 、 {着|つ}いた ！ …… {札|ふだ} が なくて も 、 {言葉|ことば} が はっきり して いれば {舟|ふね} は {迷|まよ}わねえ 。 || There — it's in! …Plaques or no plaques, if the words are clear, the barge doesn't get lost.
mb_take: {次|つぎ} 。 {潮硝子|しおがらす} の {干物|ひもの} 、 {宿|やど} の {川屋|かわや} へ 。 || Next. Saltglass dried fish, for the inn, Kawaya.
!challenge mb.route2
?(comp=nao) comp[smirk]: {悪|わる}く ない 。 {配達人|はいたつにん} の {才能|さいのう} が ある ぞ 。 || Not bad. You've a courier's knack.
?(comp=mio) comp[smile]: {舟|ふね} が ちゃんと {着|つ}く と 、 なんだか ほっと する ね 。 || It's such a relief when the barge gets there properly.
?(comp=ren) comp[shy]: {私|わたし} が {言|い}って いたら 、 {舟|ふね} は {今頃|いまごろ} {海|うみ} の {上|うえ} です 。 …… {方向|ほうこう} は 、 {苦手|にがて} な ので 。 || If I'd been the one saying it, the barge would be at sea by now. …Directions aren't my strength.
?(comp=suzu) comp[laugh]: 「{言|い}われた {通|とお}り に しか {行|い}かない 」 。 {台本|だいほん} {通|どお}り の {役者|やくしゃ} みたい ね 。 || "Only where it's told." Like an actor who sticks to the script.
# Growth (C-74's schedule, 10_modifiers.js): それぞれ, "each, respectively", learned from the barges: each load its own
# place, so each of you a ward fitted to what comes at you. A scene, not a pop-up; once.
?(!mod_sorezore) mb_take: {荷|に} に は それぞれ 、 {自分|じぶん} の {行|い}き{先|さき} が ある 。 {一|ひと}つ の {言|い}い{方|かた} で 、 {全部|ぜんぶ} は {送|おく}れねえ よ 。 || Every load has its own place to go. You can't send the lot with one way of saying it.
?(!mod_sorezore&comp=nao) comp[think]: それぞれ の {荷|に} に 、 それぞれ の {行|い}き{先|さき} か 。 …… {守|まも}る の も {同|おな}じ だ な 。 {一人|ひとり} ずつ 、 {来|く}る もの に {合|あ}わせて 。 || Each load, its own place. …Protecting's the same. One at a time, fitted to what's coming.
?(!mod_sorezore&comp=mio) comp[think]: {薬|くすり} も それぞれ よ 。 {同|おな}じ {熱|ねつ} でも 、 {人|ひと} に よって {違|ちが}う {薬|くすり} を {出|だ}す の 。 {守|まも}る の も 、 きっと そう ね 。 || Medicine's the same. Even for the same fever, different people get different remedies. Protecting must be like that too.
?(!mod_sorezore&comp=ren) comp[think]: {灯|ひ} も 、 それぞれ の {道|みち} を {照|て}らします 。 {一|ひと}つ の {灯|ひ} で {全部|ぜんぶ} を {照|て}らす より 、 {確|たし}か です 。 …… {守|まも}り も 、 {同|おな}じ でしょう 。 || Lanterns each light their own road. Surer than one light for everything. …Wards must be the same.
?(!mod_sorezore&comp=suzu) comp[think]: {舞台|ぶたい} でも 、 {役者|やくしゃ} それぞれ に {合|あ}う {台詞|せりふ} が ある の よ 。 {守|まも}る の も 、 {一人|ひとり} ずつ {合|あ}わせれば いい わ 。 || On stage, every actor has the lines that suit them. Protecting can be fitted one at a time too.
?(!mod_sorezore) narr: {言葉|ことば} が {一|ひと}つ 、 {形|かたち} に なった 。 「それぞれ を {守|まも}る」 。 {二人|ふたり} それぞれ の {前|まえ} に 、 {来|く}る {一撃|いちげき} に {合|あ}わせた {守|まも}り を 。 || A phrase takes shape: それぞれ を 守る, "protect each one": a ward before each of you, fitted to the blow coming at that one.
?(!mod_sorezore) !teach mod_sorezore
?(!mod_sorezore) !set mod_sorezore
mb_take: {今日|きょう} の {舟|ふね} は {迷|まよ}わなかった 。 なら 、 {前|まえ} の {三|みっ}つ は どこ へ {行|い}った ？ …… {札場|ふだば} で {聞|き}いて くれ 。 ヘイジ さん が {届|とど}け{出|で}を {出|だ}してる 。 || Today's barges didn't get lost. So where did the three before go? …Ask at the Tally Exchange. Heiji's lodged a complaint.
!quest mb_main 2
!journal {舟|ふね} は {言|い}われた {通|とお}り に {着|つ}いた 。 {前|まえ} の {三|みっ}つ の {荷|に} は ？ {札場|ふだば} へ 。 || The barges went where they were told. And the three loads before? To the Tally Exchange.

@scene mb.sen_first
!faceplayer
mb_sen: {札場|ふだば} へ ようこそ 。 {売|う}りたい {物|もの} 、 {買|か}いたい {物|もの} 、 {頼|たの}みたい こと は 、 {札|ふだ} に {書|か}いて {壁|かべ} に {掛|か}けます 。 || Welcome to the Tally Exchange. What you want to sell, what you want to buy, what you want done: write it on a tally and hang it on the wall.
mb_sen: {札|ふだ} に は 、 {条件|じょうけん} も {書|か}きます 。 「{雨|あめ} なら 」 「{三日|みっか} まで に 」 。 {条件|じょうけん} を {読|よ}まない {人|ひと} が 、 {一番|いちばん} {揉|も}めます 。 || Tallies carry their conditions too. "If it rains." "By the third day." The people who don't read the conditions are the ones who end up quarrelling.

@scene mb.board_outside
narr: {札場|ふだば} の {外|そと} の {掲示板|けいじばん} 。 {名前|なまえ} の {消|き}えた {札|ふだ} が 、 {何枚|なんまい} も {掛|か}かって いる 。 || The Exchange's outside board. Tally after tally hangs there with its name worn off.
narr: 「{橋|はし} の {札|ふだ} が {読|よ}めない {間|あいだ} は 、 {荷|に} の {行|い}き{先|さき} を {口|くち} で {確|たし}かめる こと 。 ―― {札場|ふだば} 」 || "While the bridges' plaques cannot be read, confirm every load's destination by word of mouth. — The Tally Exchange"

@scene mb.board_rice
# The tally the misunderstanding turns on: Heiji's standing order, condition and all.
!gesture pc read
narr: ヘイジ の {札|ふだ} 。 || Heiji's tally.
narr: 「{米|こめ} 、 {毎週|まいしゅう} {十俵|じっぴょう} 。 {西|にし} の {蔵|くら} が {一杯|いっぱい} なら 、 {東|ひがし} の {蔵|くら} へ 。」 || "Rice, ten bales a week. If the west storehouse is full, to the east one."
!set mb_ev_notice

@scene mb.board_fish
narr: 「{潮硝子|しおがらす} の {干物|ひもの} 、 {入|い}りました 。 {藤屋|ふじや} 」 。 {隣|となり} に 、 {潮硝子|しおがらす} の {浮|う}き{玉|だま} の {札|ふだ} も ある 。 「ガラス の {浮|う}き{玉|だま} 、 {一箱|ひとはこ} 。 {割|わ}れ{物|もの} {注意|ちゅうい} 。」 || "Saltglass dried fish, just in. Fujiya." Beside it, a tally for Saltglass glass floats: "Glass floats, one crate. Fragile."

@scene mb.board_passage
narr: 「{札場|ふだば} の {下|した} の {閘門|こうもん} 。 {閘門番|こうもんばん} の {許|ゆる}し なく {入|はい}る こと を {禁止|きんし} します 。」 || "The lock beneath the Exchange. No entry without the lock-keeper's leave."

@scene mb.board_lost
narr: 「{迷子|まいご} の {荷|に} 、 {見|み}つけた {方|かた} は {札場|ふだば} へ 。」 {札|ふだ} が {十枚|じゅうまい} {以上|いじょう} {並|なら}んで いる 。 || "Lost cargo — finders, please report to the Exchange." More than ten tallies hang in a row.
?(mb_ichi_found) narr: {一番|いちばん} {下|した} に 、 {子供|こども} の {字|じ} で {一枚|いちまい} 。 「イチ 、 みつかりました 。 ありがとう 。」 || At the very bottom, one in a child's hand: "Ichi was found. Thank you."

@scene mb.fujiko_tally
mb_fujiko[angry]: {送|おく}った もの は {送|おく}った ！ {帳面|ちょうめん} に も {書|か}いて ある ！ || What I sent, I sent! It's in the ledger!

@scene mb.heiji_tally
mb_heiji[angry]: {西|にし} の {蔵|くら} は {空|から} だった 。 {一粒|ひとつぶ} も ない 。 {来|こ}ない {米|こめ} に 、 {払|はら}う {金|かね} は ない 。 || The west storehouse was empty. Not a grain. I don't pay for rice that never came.

@scene mb.sen_dispute
# Staged: Sen sets down her pen, the hall goes quiet; she gathers the three of them (Gonta is fetched from the quay)
# on the matted floor; the companion stands at your side.
!faceplayer
mb_sen: …… {札場|ふだば} の {決|き}まり です 。 {揉|も}め{事|ごと} は 、 {関|かか}わる {人|ひと} が {全員|ぜんいん} {揃|そろ}って から {話|はな}します 。 {荷|に} を {運|はこ}んだ ゴンタ さん も {呼|よ}びました 。 || …The Exchange's rule: a dispute is heard with everyone concerned present. I've sent for Gonta too — he carried the loads.
mb_sen: {間|あいだ} に {入|はい}って くれます か 。 {外|そと} の {人|ひと} の {方|ほう} が 、 {話|はなし} を {聞|き}いて もらえる こと も あります 。 || Will you stand between them? Sometimes people listen to an outsider.
?(comp=nao) comp: {怒鳴|どな}り{合|あ}い の {仲裁|ちゅうさい} か 。 …… {黙|だま}って {聞|き}く の も 、 {手|て} だ ぞ 。 {急|いそ}ぐ と 、 {一番|いちばん} {大事|だいじ} な こと を {言|い}う {奴|やつ} が {口|くち} を {閉|と}じる 。 || Refereeing a shouting match, eh. …Listening in silence works too. Rush them, and the one with the most important thing to say clams up.
?(comp=mio) comp: {怒|おこ}って いる {人|ひと} に は 、 {時間|じかん} が {必要|ひつよう} です 。 …… {待|ま}つ の も 、 {大事|だいじ} な {答|こた}え です よ 。 || People who are angry need time. …Waiting can be an answer too.
?(comp=ren) comp: {灯|ひ} を {守|まも}る とき 、 {風|かぜ} が {止|や}む まで {待|ま}つ こと が あります 。 {人|ひと} の {話|はなし} も 、 {同|おな}じ かも しれません 。 || Keeping a lantern, sometimes you wait for the wind to drop. Perhaps it's the same with what people say.
?(comp=suzu) comp: {舞台|ぶたい} でも ね 、 {間|ま} が {一番|いちばん} {難|むずか}しい の 。 {何|なに} も {言|い}わない で {待|ま}つ と 、 {相手|あいて} が {本音|ほんね} を {言|い}う こと が ある わ 。 || On stage, the pause is the hardest thing. Wait without saying anything, and sometimes the other person says what they really mean.
!set learn_wait
narr: 「{待|ま}つ」 ： {何|なに} も {言|い}わず に 、 {相手|あいて} の {番|ばん} を {待|ま}つ 。 {黙|だま}って いる {人|ひと} が 、 {口|くち} を {開|ひら}く こと が ある 。 {戦|たたか}い でも 、 {相手|あいて} の {動|うご}き を {見|み}る {間|ま} に なる 。 || Wait: say nothing, and let the others speak. Someone who has gone quiet may open up. In battles too, it gives you a beat to watch what's coming.
!encounter mb.dispute
!call mb.dispute_after

@scene mb.dispute_after
# Every conclusion moves the story on: the rice is in the east storehouse, whatever else was said.
!set mb_dispute_done
?(mb_gonta_confessed) mb_gonta[sad]: …… {浮|う}き{玉|だま} の {箱|はこ} の {分|ぶん} は 、 {俺|おれ} が {働|はたら}いて {返|かえ}します 。 {藤屋|ふじや} の {女将|おかみ} に も 、 {潮硝子|しおがらす} に も 。 || …I'll work off the crate of floats. To Fujiya's mistress, and to Saltglass.
?(mb_gonta_confessed) mb_fujiko: …… {正直|しょうじき} に {言|い}った {人|ひと} を 、 うち は {首|くび} に しない よ 。 {働|はたら}いて {返|かえ}し な 。 || …I don't sack people who own up. Work it off.
?(mb_gonta_left) narr: ゴンタ は {戻|もど}らない 。 {荷運|にはこ}び{屋|や} の {前|まえ} で 、 {一人|ひとり} {運河|うんが} を {見|み}て いる らしい 。 || Gonta doesn't come back. He's down by the porters' office, staring at the canal alone, they say.
?(mb_rice_found) mb_heiji: …… {東|ひがし} の {蔵|くら} に 、 {十俵|じっぴょう} ずつ {三度|さんど} 。 {全部|ぜんぶ} あった 。 {払|はら}おう 。 {疑|うたが}って 、 {悪|わる}かった 。 || …Ten bales, three times, in the east storehouse. All of it there. I'll pay. I'm sorry I doubted you.
?(!mb_rice_found) narr: {話|はなし} は {途中|とちゅう} で {終|お}わった が 、 {札場|ふだば} の {者|もの} が {東|ひがし} の {蔵|くら} を {開|あ}けて みる と 、 {米|こめ} は そこ に あった 。 || The talk broke off unfinished, but when the Exchange's people opened the east storehouse, the rice was there.
!set mb_rice_found
!look mb_sen pc
mb_sen: ただ 、 {一|ひと}つ {分|わ}からない こと が あります 。 {札|ふだ} の {消|き}え{方|かた} です 。 || There's still one thing I don't understand: how the plaques are fading.
mb_sen: {札場|ふだば} に は 、 {町|まち} の {橋|はし} を {全部|ぜんぶ} {書|か}いた {帳面|ちょうめん} が あります 。 {番号|ばんごう} の {順|じゅん} に 。 {消|き}えて いる の は 、 {一番|いちばん} から です 。 {一番|いちばん} が {最初|さいしょ} に {消|き}えて 、 {二番|にばん} 、 {三番|さんばん} …… と 。 || The Exchange keeps a register of every bridge in the city, in order of their numbers. The names are fading from number one. One went first, then two, then three…
mb_sen: {一番|いちばん} の {橋|はし} は 、 この {札場|ふだば} の {下|した} に あります 。 {町|まち} が まだ {沼|ぬま} だった {頃|ころ} の 、 {最初|さいしょ} の {橋|はし} 。 {帳面|ちょうめん} の {名前|なまえ} も 、 もう {読|よ}めません 。 || Bridge number one is beneath this Exchange: the first bridge, from when the city was still a marsh. Its name in the register can't be read any more either.
?(comp=nao) comp[think]: {名前|なまえ} の {分|わ}からない {宛先|あてさき} か 。 …… そういう {手紙|てがみ} が {集|あつ}まる {場所|ばしょ} 、 さっき {郵便箱|ゆうびんばこ} に {書|か}いて あった な 。 || An address nobody can read. …There was a place for letters like that, the postbox said.
?(comp=mio) comp[think]: {昔|むかし} の {名前|なまえ} なら 、 {昔|むかし} の {手紙|てがみ} に {残|のこ}って いる かも しれません ね 。 || If it's an old name, maybe it survives in old letters.
?(comp=ren) comp[surprise]: {一番|いちばん} から {順|じゅん} に …… {名前|なまえ} の {糸|いと} を {端|はし} から {引|ひ}いて いる よう です 。 || In order from the first… as if someone's pulling the thread of names from its end.
?(comp=suzu) comp[think]: {一番|いちばん} {古|ふる}い {名前|なまえ} を {知|し}ってる の は 、 {一番|いちばん} {古|ふる}い {人|ひと} か 、 {一番|いちばん} {古|ふる}い {紙|かみ} ね 。 || Whoever knows the oldest name: the oldest person, or the oldest paper.
mb_sen: {札場|ふだば} の {下|した} に 、 {宛先不明|あてさきふめい} の {手紙|てがみ} を {預|あず}かる {係|かかり} が あります 。 ヨシ さん に {聞|き}いて みて ください 。 {古|ふる}い {宛名|あてな} なら 、 あそこ が {一番|いちばん} です 。 || Under the Exchange there's the office that keeps undeliverable letters. Ask Yoshi. For old addresses, there's nowhere better.
!quest mb_main 3
!note mb_three_causes
!journal {米|こめ} は {東|ひがし} の {蔵|くら} に あった 。 {橋|はし} の {名前|なまえ} は 「{一番|いちばん} の {橋|はし}」 から {消|き}えて いる 。 {宛先不明|あてさきふめい} の {係|かかり} へ 。 || The rice was in the east storehouse. The bridges' names are fading from "bridge number one". To the dead-letter office.

@scene mb.gonta_first
mb_gonta: …… {浮|う}き{玉|だま} は 、 {水|みず} に {浮|う}く はず な ん だ 。 {浮|う}く はず …… 。 || …Floats are supposed to float. Supposed to…
?(comp=nao) comp: {何|なに} か {落|お}とした {顔|かお} だ な 。 || That's the face of someone who's dropped something.

@scene mb.gonta_wait
mb_gonta: {札場|ふだば} に {呼|よ}ばれてる 。 …… {行|い}きたく ねえ 。 || I've been called to the Exchange. …I don't want to go.

@scene mb.gonta_work
mb_gonta: {荷|に} を {運|はこ}ぶ {前|まえ} に 、 {行|い}き{先|さき} を {声|こえ} に {出|だ}して {言|い}う こと に した 。 {舟|ふね} より {先|さき} に 、 {俺|おれ} が {迷|まよ}わない よう に な 。 || Before I carry anything, I say where it's going out loud now. So I don't get lost before the barge does.

@scene mb.gonta_after
mb_gonta: {浮|う}き{玉|だま} の {分|ぶん} 、 あと {少|すこ}し で {返|かえ}し{終|お}わる 。 {潮硝子|しおがらす} の {人|ひと} に 、 よろしく {言|い}って くれ 。 || I've almost worked off the floats. Give my regards to the people in Saltglass.

@scene mb.heiji_first
mb_heiji: {西|にし} の {蔵|くら} は {空|から} だ 。 {藤屋|ふじや} の {米|こめ} は {一度|いちど} も {来|こ}なかった 。 {話|はなし} なら {札場|ふだば} で {聞|き}く 。 || The west storehouse is empty. Fujiya's rice never came, not once. If you want to talk, it'll be at the Exchange.

@scene mb.heiji_work
mb_heiji: {東|ひがし} の {蔵|くら} を {見|み}なかった {俺|おれ} も 、 {悪|わる}い 。 {札|ふだ} に {書|か}いた の は 、 {俺|おれ} だ から な 。 || Not checking the east storehouse was my fault too. I'm the one who wrote that tally.

@scene mb.heiji_after
mb_heiji: {札|ふだ} を {書|か}き{直|なお}した 。 「{西|にし} の {蔵|くら} が {一杯|いっぱい} なら 、 {東|ひがし} へ 。 {閉|し}まって いる だけ なら 、 {待|ま}つ こと 。」 {長|なが}い が 、 {間違|まちが}えない 。 || I rewrote my tally: "If the west storehouse is full, to the east. If it's only shut, wait." Long-winded, but nobody'll get it wrong.

@scene mb.sen_census
mb_sen: {一番|いちばん} の {橋|はし} の {名前|なまえ} が {分|わ}かれば 、 {帳面|ちょうめん} の {他|ほか} の {名前|なまえ} も {戻|もど}る かも しれません 。 || If we can find bridge number one's name, the register's other names may come back too.
?(quest.mb_census) mb_sen: {橋|はし} の {名前|なまえ} 、 {見|み}つけたら {教|おし}えて ください 。 {帳面|ちょうめん} に {書|か}き{戻|もど}します 。 || When you find a bridge's name, tell me. I'll write it back in the register.
?(!quest.mb_census) !call mb.census_start

@scene mb.sen_after
mb_sen: {帳面|ちょうめん} の {一番|いちばん} に 、 「{結|むす}び{橋|ばし}」 。 {書|か}き{込|こ}む とき 、 {手|て} が {震|ふる}えました 。 || In the register, number one: "Musubi Bridge". My hand shook as I wrote it in.

@scene mb.deadletter_desk
narr: {机|つくえ} の {上|うえ} に 、 {宛名|あてな} の {薄|うす}れた {手紙|てがみ} が {山|やま} の よう に {積|つ}んで ある 。 || On the desk, letters with fading addresses are piled like a mountain.

@scene mb.yoshi_idle
mb_yoshi: {届|とど}かない {手紙|てがみ} は 、 {捨|す}てません 。 いつか {宛先|あてさき} の {方|ほう} から 、 {取|と}り に {来|く}る かも しれません から 。 || I never throw away a letter that couldn't be delivered. The addressee might come for it one day.

@scene mb.yoshi_letter
# Staged: Yoshi climbs the stepladder to the oldest drawer, blows the dust off a bundle; she reads the address with
# you; for Nao, the bundle with Nao's name is handed over (the seed); you look at the letter for the first bridge.
!faceplayer
mb_yoshi: {一番|いちばん} {古|ふる}い {宛名|あてな} 、 です か 。 …… ちょっと {待|ま}って くださいね 。 || The oldest addresses? …Wait a moment.
!look mb_yoshi pc
mb_yoshi: これ が 、 この {係|かかり} で {一番|いちばん} {古|ふる}い {手紙|てがみ} です 。 {四十年|よんじゅうねん} {前|まえ} の もの 。 {宛名|あてな} が 、 {半分|はんぶん} {消|き}えて います 。 || This is the oldest letter in the office. Forty years old. Half the address has faded.
!gesture pc read
narr: {宛名|あてな} は {半分|はんぶん} {消|き}えて いる 。 「…… {橋|はし} の {橋守|はしもり} さま」 。 {橋|はし} の {名前|なまえ} は 、 {最初|さいしょ} と {最後|さいご} の {音|おと} しか {残|のこ}って いない 。 || Half the address has faded: "To the bridge-keeper of … Bridge." Of the bridge's name, only the first and last sounds are left: む…び (mu…bi).
mb_yoshi: {橋守|はしもり} は 、 {橋|はし} の {番|ばん} を する {人|ひと} です 。 {今|いま} は もう いません 。 {最後|さいご} の {橋守|はしもり} は 、 {閘門番|こうもんばん} の マツ さん の ご{主人|しゅじん} だった と {聞|き}きます 。 || A bridge-keeper watched over a bridge. There are none now. The last one, I hear, was the husband of Matsu, the lock-keeper.
!set mb_ev_letter
!journal {宛先不明|あてさきふめい} の {一番|いちばん} {古|ふる}い {手紙|てがみ} ： {橋|はし} の {名前|なまえ} は 、 {最初|さいしょ} と {最後|さいご} の {音|おと} だけ 。 {最後|さいご} の {橋守|はしもり} は 、 {閘門番|こうもんばん} マツ の {夫|おっと} 。 || The oldest dead letter: "To the bridge-keeper of … Bridge"; only the name's first and last sounds survive, む…び (mu…bi). The last bridge-keeper was the husband of Matsu, the lock-keeper.
?(comp=nao) !call mb.nao_bundle
?(comp!=nao) mb_yoshi: この {手紙|てがみ} 、 {持|も}って いって ください 。 {届|とど}く {先|さき} が {見|み}つかった {気|き} が します 。 || Take this letter with you. I feel it's found where it belongs.
!give mb_letter
mb_yoshi: {今日|きょう} は もう {遅|おそ}い です よ 。 {閘門|こうもん} は {明日|あした} に して 、 {宿|やど} で {休|やす}んで ください 。 || It's late. Leave the lock until tomorrow, and rest at the inn.
!quest mb_main 4
!journal {夕方|ゆうがた} 。 {閘門|こうもん} は {明日|あした} 。 {宿|やど} の {川屋|かわや} で {休|やす}む 。 || Evening. The lock can wait till tomorrow. Rest at Kawaya, the inn.

@scene mb.nao_bundle
# The seed (14_COMPANIONS): a bundle held for "the courier Nao", forwarded under an old relay emblem. Pocketed unopened.
mb_yoshi: …… あら 。 ナオ さん 、 と おっしゃいました ね 。 {配達人|はいたつにん} の 。 || …Oh. Nao, you said? The courier?
!gesture mb_yoshi handover comp
mb_yoshi: 「{配達人|はいたつにん} ナオ さん へ 。 {留|と}め{置|お}き 。」 {古|ふる}い {中継|ちゅうけい} の {印|しるし} が {押|お}して あります 。 {何年|なんねん} も 、 ここ で {待|ま}って いた の です よ 。 || "For the courier Nao. To be held." It has an old relay stamp on it. It's been waiting here for years.
!gesture comp receive
comp[surprise]: …… {俺|おれ} {宛|あて} ？ || …For me?
!gesture comp strap
comp[smirk]: ファンレター だ な 。 {人気者|にんきもの} は {辛|つら}い 。 …… {後|あと} で {読|よ}む 。 || Fan mail. The burden of popularity. …I'll read it later.
!set mb_nao_bundle
mb_yoshi: この {古|ふる}い {手紙|てがみ} も 、 {持|も}って いって ください 。 {届|とど}く {先|さき} が {見|み}つかった {気|き} が します 。 || And take this old letter too. I feel it's found where it belongs.

@scene mb.uno_rest
mb_uno: {川屋|かわや} へ ようこそ 。 {休|やす}んで いく ？ {川|かわ} の {音|おと} で 、 よく {眠|ねむ}れる よ 。 || Welcome to Kawaya. Staying the night? The sound of the river puts you right to sleep.
!choice
* {休|やす}みます 。 || We'll rest. -> rest
* また {今度|こんど} 。 || Another time. -> end
:rest
!inn
mb_uno: おはよう 。 {朝|あさ} ご{飯|はん} は {潮硝子|しおがらす} の {干物|ひもの} だ よ 。 {誰|だれ} か さん が {舟|ふね} で {送|おく}って くれた から ね 。 || Morning. Breakfast is Saltglass dried fish — somebody sent it over by barge, after all.
:end

@scene mb.uno_evening
# Staged: you sit down to supper at the inn; the door bangs open; Kayo, out of breath, a lantern in her hand; Uno
# stands; your companion is already on their feet; you pick up your things.
mb_uno: {夕飯|ゆうはん} {出来|でき}てる よ 。 {座|すわ}って ── || Supper's ready. Sit yourselves ──
!shake 1
mb_kayo: イチ が …… うち の イチ が 、 {帰|かえ}って {来|こ}ない ん です ！ {橋|はし} を {数|かぞ}えに {行|い}く 、 って {言|い}った きり …… ！ || Ichi — my Ichi hasn't come home! He said he was going to count the bridges, and then…!
mb_uno: {暗|くら}く なった のに …… {運河|うんが} の {方|ほう} かい ？ || And it's dark already… Down by the canals?
mb_kayo: {白|しろ}い {蔵|くら} の {並|なら}び の {方|ほう} へ 。 {船頭|せんどう} の カンスケ さん の {舟|ふね} を {見|み}に よく {行|い}く ん です 。 || Towards Warehouse Row. He often goes to look at Kansuke the boatman's boat.
?(comp=nao) comp: {行|い}く ぞ 。 {子供|こども} の {足|あし} なら 、 まだ {遠|とお}く は ない 。 || Let's go. On a child's legs, he can't have got far.
?(comp=mio) comp: {一緒|いっしょ} に {探|さが}します 。 {大丈夫|だいじょうぶ} 、 きっと {見|み}つかります 。 || We'll help you look. It'll be all right, we'll find him.
?(comp=ren) comp: {灯|ひ} を {持|も}って いきます 。 {暗|くら}い {水辺|みずべ} で は 、 {灯|ひ} が {目印|めじるし} に なる 。 || I'll bring the lamp. By dark water, a light is something to find your way to.
?(comp=suzu) comp: {行|い}きましょう 。 …… {大|おお}きな {声|こえ} で {呼|よ}ぶ の は 、 {私|わたし} の {得意|とくい} よ 。 || Let's go. …Calling out loud is my speciality.
!set mb_night mb_ichi_lost
!warp mb.exchange 6 31 down
!journal {夜|よる} 。 カヨ さん の {息子|むすこ} イチ が 、 {運河|うんが} で {迷子|まいご} に なった 。 {蔵|くら} の {並|なら}び へ 。 || Night. Kayo's son Ichi is lost by the canals. To Warehouse Row.

@scene mb.night_pier
narr: …… {渡|わた}し{場|ば} の {方|ほう} じゃ ない 。 カヨ さん は 、 {蔵|くら} の {並|なら}び と {言|い}って いた 。 {東|ひがし} の {道|みち} だ 。 || …Not the pier. Kayo said Warehouse Row. The east road.
!warp mb.exchange 22 38 up

@scene mb.kansuke_night
# Staged: Kansuke is on his boat with a lantern; he points with his pole; a riddle even now (but a kind one).
!faceplayer
mb_kansuke: {子供|こども} ？ …… {見|み}た よ 。 {日|ひ} が {沈|しず}む {頃|ころ} 、 {一人|ひとり} で {橋|はし} を {数|かぞ}えて いった 。 || A child? …I saw him. Around sunset, counting the bridges on his own.
mb_kansuke: {名前|なまえ} の ない {橋|はし} の {下|した} 、 {水|みず} が {東|ひがし} へ {流|なが}れて いく {所|ところ} 。 {見|み}て ごらん 。 || Under the bridge with no name, where the water runs away east. Go and look.
!gesture mb_kansuke point 31,13
?(comp=ren) comp: {東|ひがし} …… {右|みぎ} です ね 。 …… {右|みぎ} です よ ね ？ || East… that's right. …That is right, isn't it?

@scene mb.ichi_found
# Staged: down on the ledge at the water's edge beside the East Bridge, a small boy hugging his knees; he looks up at
# the lamp; you crouch; he takes your hand; the companion's own way with a frightened child.
!gesture pc kneel mb_ichi
mb_ichi[sad]: …… {帰|かえ}り{道|みち} が 、 {分|わ}かんなく なった 。 {橋|はし} に {名前|なまえ} が ない から 、 どこ に いる か {言|い}えなかった の 。 || …I didn't know the way home. The bridges had no names, so I couldn't say where I was.
pc: {一緒|いっしょ} に {帰|かえ}ろう 。 お{母|かあ}さん が {待|ま}ってる よ 。 || Let's go home together. Your mother's waiting.
?(comp=nao) comp: よく じっと {待|ま}った な 。 {迷|まよ}った とき は 、 {動|うご}かない の が {一番|いちばん} だ 。 {配達人|はいたつにん} も そう する 。 || Good, you stayed put. When you're lost, not moving is best. Couriers do the same.
?(comp=mio) comp: {寒|さむ}かった でしょう 。 ほら 、 これ を {羽織|はお}って 。 {怪我|けが} は ない ？ …… よかった 。 || You must be cold. Here, put this round you. Are you hurt? …Good.
?(comp=ren) comp: {灯|ひ} が {見|み}えた から 、 {顔|かお} を {上|あ}げた の でしょう 。 {灯|ひ} は 、 {名前|なまえ} の ない {所|ところ} で も {目印|めじるし} に なります 。 || You looked up because you saw the light. A light marks the way even where there are no names.
?(comp=suzu) comp[smile]: {泣|な}かなかった の ね 。 {立派|りっぱ} な {役者|やくしゃ} よ 。 {帰|かえ}ったら 、 {拍手|はくしゅ} して あげる 。 || You didn't cry. A fine performer. When we get home, I'll give you a round of applause.
mb_ichi: …… {船頭|せんどう} さん の {歌|うた} 、 {歌|うた}って た の 。 {怖|こわ}く ない よう に 。 「{一|ひと}つ {結|むす}んで 、 {二|ふた}つ {渡|わた}って 、 {三|みっ}つ {流|なが}れて …… 」 {橋|はし} を {数|かぞ}える {歌|うた} 。 || …I was singing the boatmen's song. So I wouldn't be scared. "One, tie it; two, cross it; three, let it flow…" A song for counting bridges.
mb_ichi: {一番|いちばん} の {橋|はし} は 、 「{結|むす}ぶ」 {橋|はし} な ん だ って 。 {町|まち} を {結|むす}んでる ん だ って 。 || The first bridge is the "tying" one, they say. It ties the city together.
!set mb_ev_song mb_ichi_found
!journal イチ の {歌|うた} ： 「{一|ひと}つ {結|むす}んで …… 」 。 {一番|いちばん} の {橋|はし} は 、 {町|まち} を {結|むす}ぶ {橋|はし} 。 || Ichi's song: "One, tie it…" The first bridge is the one that ties the city together.
!warp mb.exchange 36 31 up
!call mb.morning_after

@scene mb.morning_after
# Staged: dawn over the Exchange; Kayo holds Ichi; she bows deeply; Ichi waves; your companion's line; morning light.
!unset mb_night
mb_kayo: …… ありがとう ございました 。 {本当|ほんとう} に 、 ありがとう …… 。 || …Thank you. Thank you, truly…
!gesture mb_kayo nod pc
mb_ichi: {橋|はし} に {名前|なまえ} が あったら 、 {迷|まよ}わなかった の に 。 || If the bridges had names, I wouldn't have got lost.
?(comp=nao) comp[think]: …… {子供|こども} が {帰|かえ}れない {町|まち} は 、 だめ だ 。 {一番|いちばん} の {橋|はし} 、 {行|い}く ぞ 。 || …A city a child can't find his way home in is no good. To the first bridge.
?(comp=mio) comp[think]: {荷物|にもつ} だけ じゃ ない ん だ ね 。 {名前|なまえ} が {消|き}える と 、 {人|ひと} も {帰|かえ}れなく なる 。 || It's not just cargo. When the names go, people can't get home either.
?(comp=ren) comp[think]: {村|むら} {一|ひと}つ の {話|はなし} では ありません ね 。 {町|まち} {一|ひと}つ が 、 {帰|かえ}り{道|みち} を {失|うしな}いかけて いる 。 || This isn't one village's trouble any more. A whole city is losing its way home.
?(comp=suzu) comp[think]: …… {笑|わら}って {済|す}む {話|はなし} じゃ なく なった わ ね 。 {一番|いちばん} の {橋|はし} 、 {名前|なまえ} を {返|かえ}して もらいましょう 。 || …This isn't something to laugh off any more. Let's get the first bridge its name back.
!quest mb_main 5
!journal {朝|あさ} 。 イチ は {家|いえ} に {帰|かえ}った 。 {一番|いちばん} の {橋|はし} へ ： {閘門番|こうもんばん} マツ さん に {会|あ}う 。 || Morning. Ichi is home. On to the first bridge: see Matsu, the lock-keeper.

@scene mb.matsu_first
!faceplayer
mb_matsu: {閘門|こうもん} は {閉|し}まって いる 。 {知|し}らない {人|ひと} に {話|はな}す こと は ない よ 。 || The lock is shut. I've nothing to say to people I don't know.

@scene mb.lock_rules
narr: 「{閘門|こうもん} の {下|した} 、 {水|みず} の {高|たか}さ {毎日|まいにち} {変|か}わる 。 {番|ばん} の {者|もの} の ほか 、 {入|はい}る べからず 。」 || "Below the lock, the water stands at a different height every day. None but the keeper may enter."

@scene mb.hatch_closed
narr: {床|ゆか} の {重|おも}い {戸|と} 。 {鍵|かぎ} が かかって いる 。 {下|した} から 、 {水|みず} の {音|おと} が {聞|き}こえる 。 || A heavy hatch in the floor, locked. From below comes the sound of water.

@scene mb.matsu_negotiate
# Staged: Matsu at her table, arms folded; she doesn't look up; the companion beside you; the letter in your satchel.
!faceplayer
mb_matsu: また {来|き}た の かい 。 {下|した} に {行|い}きたい ？ {無理|むり} だ ね 。 || You again? You want to go down? Out of the question.
!encounter mb.passage
!call mb.passage_after

@scene mb.passage_after
?(mb_matsu_letter) mb_matsu: …… {四十年|よんじゅうねん} か 。 あの {人|ひと} は 、 {最後|さいご} まで {橋|はし} の {名前|なまえ} を {呼|よ}んで いた 。 {私|わたし} は 、 {聞|き}いて いなかった 。 || …Forty years. He was calling the bridge's name right to the end. I wasn't listening.
?(mb_matsu_letter) mb_matsu: {私|わたし} の {灯|あか}り を {持|も}って いき な 。 {下|した} の {休|やす}み{場|ば} に {掛|か}けて おけば 、 {帰|かえ}り{道|みち} に なる 。 || Take my lamp. Hang it at the resting place below, and it'll be your way back.
?(mb_matsu_letter) !set mb_matsu_lamp
?(mb_passage) mb_matsu: {鍵|かぎ} は {開|あ}けた 。 {水|みず} の {高|たか}さ は 、 {石板|せきばん} に {書|か}いて ある 。 {読|よ}める なら 、 {迷|まよ}わない 。 || I've unlocked it. The water heights are written on the tablets. If you can read them, you won't get lost.
?(!mb_passage) narr: マツ は {戸|と} を {閉|し}めて しまった 。 …… {外|そと} に {出|で}る と 、 セン が {待|ま}って いた 。 || Matsu shuts her door. …Outside, Sen is waiting.
?(!mb_passage) mb_sen: {札場|ふだば} の {名|な} で 、 {閘門|こうもん} を {開|あ}ける {許|ゆる}し を {取|と}りました 。 マツ さん は {怒|おこ}る でしょう けど 、 {町|まち} の ため です 。 || I've got the Exchange's leave to open the lock. Matsu will be angry, but it's for the city.
?(!mb_passage) !set mb_passage
!quest mb_main 6
!journal {閘門|こうもん} の {下|した} へ 。 {一番|いちばん} の {橋|はし} を {探|さが}す 。 || Down through the lock, to find the first bridge.

@scene mb.matsu_passage
mb_matsu: {下|した} は {冷|つめ}たい よ 。 {水|みず} の {高|たか}さ を {読|よ}み{違|ちが}える んじゃ ない 。 || It's cold down there. Don't misread the water heights.

@scene mb.matsu_after
mb_matsu: {一番|いちばん} の {橋|はし} に 、 {名前|なまえ} が {戻|もど}った 。 …… {今夜|こんや} は 、 {久|ひさ}しぶり に {下|した} へ {降|お}りて みる よ 。 {灯|あか}り を {持|も}って ね 。 || The first bridge has its name back. …Tonight I'll go down there again, for the first time in years. With a lamp.
`, 'mb/21_scenes_main.js');
