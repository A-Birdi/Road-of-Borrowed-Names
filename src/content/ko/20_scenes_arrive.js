/* Kotonoha, Chapter 9: the call and the crossing (expansion P11). At the end of Lanternfall's council in a
 * twelve-chapter journey, Yae remembers a letter: Ōmi writes from Saltglass that leaves with writing on them are
 * washing up in the harbour, and that Nami, one of Kotonoha's leaf-keepers, has crossed over to ask for help; in the
 * envelope is a leaf with はんたい on it, the word Lanternfall lost. Tetsu's board has a new line west; the crossing;
 * the chapter's beginning on the island's jetty (whoever arrives first, by ferry or by the player's own boat, once
 * Lanternfall is over: ko.begin). An earlier visit by the player's own boat is side content (25_scenes_early.js). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene ko.call
# Staged: after the council, Yae remembers and holds the envelope out; you take it and read; the dry leaf in it, which
# you hold up; Yae's long look at the word on it; your companion's own answer (Nao turns the envelope over to read
# the postmark, Mio's hand to her mouth, Ren looks at the leaf against the light, Suzu reads Ōmi's signature twice).
!gesture lf_yae present pc prop=letter
lf_yae: そう そう 、 {忘|わす}れる ところ でした 。 {今朝|けさ} 、 {海|うみ} の {方|ほう} から 、 あなた {宛|あ}て の {手紙|てがみ} が {届|とど}いて います よ 。 || Oh, yes, I nearly forgot. A letter came for you this morning, from the coast.
!gesture pc read prop=letter
narr: {潮硝子|しおがらす} の {港長|こうちょう} 、 オウミ から だ 。 {封筒|ふうとう} の {中|なか} に は 、 {手紙|てがみ} と 、 {乾|かわ}いた {葉|は} が {一枚|いちまい} 。 || It's from Ōmi, the harbourmaster at Saltglass. In the envelope: a letter, and a single dry leaf.
narr: 「{港|みなと} に 、 {字|じ} の {書|か}いて ある {葉|は} が {流|なが}れ{着|つ}いて います 。 {毎朝|まいあさ} 、 {何百枚|なんびゃくまい} も 。」 || "Leaves with writing on them are washing up in the harbour. Hundreds, every morning."
narr: 「{言|こと}の{葉|は}{島|じま} から 、 {葉守|はもり} の ナミ が {来|き}ました 。 {島|しま} の {大|おお}きな {木|き} が 、 {葉|は} を {落|お}とし{過|す}ぎて いる そう です 。 {助|たす}け を {求|もと}めて います 。」 || "Nami, one of the leaf-keepers of Kotonoha, has come over. She says the island's great tree is shedding far too fast. She is asking for help."
narr: 「テツ が {島|しま} へ {船|ふね} を {出|だ}します 。 {来|こ}られる なら 、 {潮硝子|しおがらす} へ 。 {港長|こうちょう} オウミ」 || "Tetsu will take the boat out to the island. If you can come, come to Saltglass. — Ōmi, Harbourmaster."
!gesture pc present prop=leaf
narr: {葉|は} に は 、 {細|ほそ}い {字|じ} で {一言|ひとこと} 、 「はんたい」 と {書|か}いて ある 。 || On the leaf, in a thin hand, one word: はんたい, "against".
!give ko_leaf_lf quiet
!gesture lf_yae observe pc
lf_yae[sad]: …… この {町|まち} が なくした {言葉|ことば} です ね 。 {何年|なんねん} も {探|さが}さず に いた のに 、 {海|うみ} まで {流|なが}れて いって いた の か 。 || …The word this town lost. All those years we never looked for it, and it had drifted all the way out to sea.
?(comp=nao) !gesture comp observe pc
?(comp=nao) comp: {消印|けしいん} は {三日|みっか} {前|まえ} だ 。 {潮硝子|しおがらす} から の {海|うみ} の {便|びん} で 、 {急|いそ}ぎ の {判|はん} まで {押|お}して ある 。 …… {港長|こうちょう} が {急|いそ}ぎ と {書|か}く の は 、 よっぽど だ 。 || The postmark's three days old. Sea post from Saltglass, stamped urgent. …If the harbourmaster writes urgent, it's serious.
?(comp=mio) !gesture comp flinch
?(comp=mio) comp[surprise]: {言葉|ことば} が 、 {葉|は} に なって {流|なが}れて いく の ？ …… {葦|あし}ノ{瀬|せ} の ラベル の {字|じ} も 、 どこか に {流|なが}れ{着|つ}いて いる の かも しれない 。 || Words turn into leaves and drift away? …Then the letters off Reedwake's labels may have washed up somewhere too.
?(comp=ren) !gesture comp observe pc
?(comp=ren) comp[think]: {失|うしな}われた {名前|なまえ} を {預|あず}かって いる {人|ひと} たち が 、 {海|うみ} の {向|む}こう に も いる の です ね 。 {灯守|ひもり} と {同|おな}じ よう に 。 || So there are people across the sea looking after lost words too. Like the lantern-keepers.
?(comp=suzu) !gesture comp observe pc
?(comp=suzu) comp: 「{港長|こうちょう} オウミ」 。 …… あの {人|ひと} が {頼|たの}み{事|ごと} の {手紙|てがみ} を {書|か}く なんて ね 。 {次|つぎ} の {幕|まく} は {海|うみ} の {上|うえ} よ 。 || "Ōmi, Harbourmaster." …Her, writing a letter asking for help. The next act's out at sea.
lf_yae: {書庫|しょこ} は {逃|に}げません 。 {先|さき} に 、 {海|うみ} の {向|む}こう の {人|ひと} たち を {助|たす}けて あげなさい 。 {議会|ぎかい} も 、 {賛成|さんせい} {一|ひと}つ 、 {反対|はんたい} {一|ひと}つ で 、 {送|おく}り{出|だ}します から 。 || The Archive won't run away. Help the people across the sea first. The council will send you off with one vote for and one against.
!set ko_called
!quest ko_main 0
!journal オウミ から {手紙|てがみ} が {届|とど}いた 。 {潮硝子|しおがらす} の {港|みなと} から 、 テツ の {船|ふね} が {言|こと}の{葉|は}{島|じま} へ {出|で}る 。 || A letter from Ōmi: Tetsu's boat sails from Saltglass harbour to Kotonoha.
!toast {言|こと}の{葉|は}{島|じま} へ の {船|ふね} が {出|で}る （{潮硝子|しおがらす}） || A boat sails for Kotonoha (from Saltglass).

@scene ko.ferry_tetsu
# Staged: Tetsu at the jetty with a fresh line chalked on the board; he looks out west, past the lighthouse.
!faceplayer
tetsu: {板|いた} に 、 もう {一|ひと}つ {行|い}き{先|さき} が {出|で}た 。 {西|にし} の {沖|おき} 。 {言|こと}の{葉|は}{島|じま} だ 。 || Another line on the board. West, out to sea. Kotonoha.
!gesture tetsu lookroad left
tetsu: {港長|こうちょう} から {聞|き}いた な 。 {島|しま} の {葉守|はもり} が {来|き}て 、 {頭|あたま} を {下|さ}げて {帰|かえ}って いった 。 || You've heard from the harbourmaster. A keeper from the island came, bowed her head and went back.
tetsu: {島|しま} は {遠|とお}い 。 {半日|はんにち} かかる 。 …… {波|なみ} は {穏|おだ}やか だ 。 || The island's far. Half a day out. …The sea's calm.
?(comp=nao) comp: {言|こと}の{葉|は}{島|じま} …… {船乗|ふなの}り の {作|つく}り{話|ばなし} だ と {思|おも}って いた 。 {本当|ほんとう} に ある の か 。 || Kotonoha… I thought it was a sailors' tale. It's real?
?(comp=mio) comp[think]: {落|お}ちた {言葉|ことば} が {流|なが}れ{着|つ}く {島|しま} …… 。 {薬|くすり} の {名前|なまえ} も 、 そこ に ある かしら 。 || An island where fallen words wash up… I wonder if the medicines' names are there too.
?(comp=ren) comp: {海|うみ} の {上|うえ} の {道|みち} に は 、 {灯籠|とうろう} が ありません ね 。 …… テツ さん の {目|め} が 、 {灯|ひ} の {代|か}わり です か 。 || There are no lanterns on a road over the sea. …So Tetsu's eyes do for the lights?
?(comp=suzu) comp[smile]: {島|しま} へ {渡|わた}る {船旅|ふなたび} ！ {舞台|ぶたい} が {海|うみ} の {上|うえ} に {移|うつ}る わけ ね 。 || A voyage out to an island! The stage moves out to sea.
!choice
* {言|こと}の{葉|は}{島|じま} へ {行|い}きます 。 || We'll go to Kotonoha. -> go
* まだ です 。 || Not yet. -> wait
:go
tetsu: {乗|の}れ 。 {潮|しお} が いい 。 || Get aboard. The tide's right.
!call ko.ferry_out
!end
:wait
tetsu: {島|しま} へ の {船|ふね} は 、 {毎朝|まいあさ} {出|で}る 。 || The island boat goes out every morning.

@scene ko.ferry_tetsu_again
!faceplayer
tetsu: どこ へ {行|い}く 。 || Where to?
!choice
* {言|こと}の{葉|は}{島|じま} へ 。 || To Kotonoha. -> ko
* {八百橋|やおばし} へ 。 || To Manybridge. -> mb
* {今日|きょう} は いい です 。 || Not today. -> end
:ko
!call ko.ferry_out
!end
:mb
!call mb.ferry_east
!end
:end

@scene ko.ferry_out
!fade out
narr: {船|ふね} は {灯台|とうだい} の {先|さき} を {抜|ぬ}けて 、 {西|にし} の {沖|おき} へ {出|で}る 。 {陸|りく} が {少|すこ}し ずつ {小|ちい}さく なって いく 。 || The boat clears the lighthouse and heads west, out to sea. Little by little the land grows small.
narr: {昼|ひる} を {過|す}ぎる と 、 {波|なみ} の {間|あいだ} に 、 {金色|きんいろ} の {葉|は} が {浮|う}かび{始|はじ}めた 。 || Past noon, gold leaves begin to float between the waves.
!warp ko.shore 20 22 up
!fade in
?(!ko_arrived) !call ko.first_sight
?(ch5_done&!ko_ch9) !call ko.begin

@scene ko.ferry_back
narr: テツ の {船|ふね} が 、 {桟橋|さんばし} に {繋|つな}いで ある 。 {潮硝子|しおがらす} へ の {便|びん} だ 。 || Tetsu's boat is tied up at the jetty: the run back to Saltglass.
!choice
* {潮硝子|しおがらす} へ {戻|もど}る 。 || Go back to Saltglass. -> go
* まだ {乗|の}らない 。 || Not yet. -> end
:go
!fade out
narr: {船|ふね} は {東|ひがし} へ 。 {大|おお}きな {木|き} が 、 {夕日|ゆうひ} の {中|なか} で {遠|とお}ざかって いく 。 || The boat heads east. The great tree draws away into the evening sun.
!warp sg.harbor 33 28 up
!fade in
:end

@scene ko.first_sight
# The first landing, by any boat: the great camphor above the village, leaves drifting down over everything.
# The view itself is shown as a picture over the two lines that describe it (src/ui/42g_interlude_firstsight.js;
# RBN-QA-073): you land and look up the beach a moment (by either boat the shore has only just come up out of the
# dark, and would flash and go without it); then, from the end of the jetty, the sand and the island rising beyond it,
# the great tree on its crown with its limbs spread wide, leaves drifting down; then back on the jetty for your
# companion's word.
!set ko_arrived
!travel kotonoha
!gesture pc lookroad up
!wait 700
!fade out
!interlude ko_first_sight
!fade in 600
narr: {砂浜|すなはま} の {向|む}こう に 、 {見|み}た こと も ない {大|おお}きな {木|き} が {立|た}って いる 。 {島|しま} {全体|ぜんたい} を {抱|かか}える よう に 、 {枝|えだ} を {広|ひろ}げて 。 || Beyond the sand stands a tree bigger than any you have seen, its branches spread as if to hold the whole island.
narr: {葉|は} が 、 {雪|ゆき} の よう に {降|ふ}って いる 。 {一枚|いちまい} {一枚|いちまい} に 、 {薄|うす}く {字|じ} が {見|み}える 。 || Leaves are falling like snow. On each one, faintly, there is writing.
!fade out
!interlude -
!fade in
?(comp=nao) comp: …… {全部|ぜんぶ} 、 {誰|だれ} か が {書|か}いた か {言|い}った か した {言葉|ことば} か 。 {届|とど}け{先|さき} は 、 どこ だった ん だろう な 。 || …All of these, words someone wrote or said. Where were they meant to go, I wonder.
?(comp=mio) comp[surprise]: きれい …… 。 でも 、 こんな に たくさん 。 {全部|ぜんぶ} 、 なくなった {言葉|ことば} な の ？ || Beautiful… But so many. Are these all lost words?
?(comp=ren) comp[think]: {灯|ひ} の {道|みち} より も {古|ふる}い {木|き} かも しれません 。 {葉|は} の {字|じ} は 、 {墨|すみ} の {色|いろ} が みんな {違|ちが}います 。 || It may be older than the lantern roads. The ink on the leaves is a different colour on every one.
?(comp=suzu) comp[smile]: {紙吹雪|かみふぶき} みたい ね 。 …… {拍手|はくしゅ} の {代|か}わり に 、 {言葉|ことば} が {降|ふ}って くる {舞台|ぶたい} 。 || Like a shower of paper confetti. …A stage where words come down instead of applause.

@scene ko.begin
# Chapter 9's beginning on the jetty, whoever arrives first once Lanternfall is over. Staged: Nami at the end of the
# jetty with a basket of leaves on her hip; she sets it down and nods; her plain welcome; she points up the path to the
# village and the tree; your companion's own answer.
!set ko_ch9
!chapter ko
!travel kotonoha
!card {第九章|だいきゅうしょう} 　{言|こと}の{葉|は}{島|じま} || Chapter 9 — Kotonoha, the Isle of Word-Leaves
!look ko_nami pc
!gesture ko_nami nod
ko_nami: {来|き}て くれた ん だ ね 。 ナミ です 。 {葉守|はもり} の 、 {一番|いちばん} {若|わか}い {方|ほう} 。 || You came. I'm Nami — the youngest of the leaf-keepers, more or less.
ko_nami: {見|み}て の とおり 。 {木|き} が 、 {毎日|まいにち} {葉|は} を {落|お}として いる 。 {拾|ひろ}って も {拾|ひろ}って も 、 {追|お}いつかない 。 || As you can see. The tree drops its leaves every day. We gather and gather, and can't keep up.
ko_nami: {葉|は} は 、 どこか で なくなった {言葉|ことば} な ん だ 。 {昔|むかし} は 、 {一日|いちにち} {十枚|じゅうまい} ぐらい だった 。 {今|いま} は 、 {数|かぞ}えられない 。 || The leaves are words that went missing somewhere. It used to be ten or so a day. Now we can't count them.
!gesture ko_nami point 20,3
ko_nami: {村|むら} で 、 オトハ {婆|ばあ}さま が {待|ま}って いる 。 {一番|いちばん} {古|ふる}い {葉守|はもり} だ よ 。 || Grandmother Otoha is waiting in the village. She's the oldest keeper there is.
?(comp=nao) comp: {届|とど}け{先|さき} の ない {手紙|てがみ} が {山|やま} に なってる よう な もん か 。 …… {郵便屋|ゆうびんや} と して は 、 {放|ほう}って おけない な 。 || Like a mountain of letters with no addresses. …As a courier, I can't leave that alone.
?(comp=mio) comp: {一枚|いちまい} ずつ 、 {元|もと} の {場所|ばしょ} が ある ん です よ ね 。 {手伝|てつだ}わせて ください 。 || Every one of them has a place it came from, doesn't it. Let us help.
?(comp=ren) comp: {名前|なまえ} を {灯|ひ} に {返|かえ}す の と 、 {似|に}た {仕事|しごと} です ね 。 {私|わたし} に も できる こと が ある はず です 。 || It's work like giving names back to lamps. There must be something I can do.
?(comp=suzu) comp[smile]: {裏方|うらかた} が {足|た}りない {舞台|ぶたい} ね 。 {任|まか}せて 。 {人手|ひとで} なら 、 ここ に {二人|ふたり} いる わ 。 || A show that's short of stagehands. Leave it to us. There are two pairs of hands right here.
!quest ko_main 1
!journal {言|こと}の{葉|は}{島|じま} に {着|つ}いた 。 {木|き} が {葉|は} を {落|お}とし{過|す}ぎて いる 。 {村|むら} で 、 {一番|いちばん} {古|ふる}い {葉守|はもり} オトハ に {会|あ}おう 。 || Kotonoha. The great tree is shedding far too fast. Meet Otoha, the oldest of the keepers, in the village.
!autosave
`);
