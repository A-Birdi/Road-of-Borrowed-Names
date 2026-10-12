/* A Licence for the Open Sea (expansion P11b; the quest, the yard and the wiring in 05_licence.js, the tasks in
 * 31_licence_learning.js). Ōmi's deal; Fuku and her husband's boat; Kajirō's yard and Nui's loom in Manybridge; the
 * name, checked by Sōbē and painted by Sanpei and Miyo; Tetsu's five sea words, Shiori's tide book and the trial round
 * the mark; Ōmi's examination, the licence, and her version of the rumour. The boat's name is `$boat {丸|まる}` (its
 * kana and 丸); in English, "the $boat" (Chidori-maru). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
# ---- 0 · the deal -----------------------------------------------------------------------------------------------------
@scene sea.omi_deal
# Staged: Ōmi at her desk with a chart of the coast pinned beside her; she taps the little ports along it, then nods
# out of the window at the old hulls drawn up on the beach.
!faceplayer
omi: おう 、 {来|き}た か 。 ちょうど いい 。 {話|はなし} が ある 。 || Ah, there you are. Good timing. I've a proposition.
!gesture omi point 8,2
omi: {渡|わた}し{船|ぶね} は {時刻表|じこくひょう} どおり だ 。 {結構|けっこう} な こと だ よ 。 だが 、 {沿岸|えんがん} の {小|ちい}さな {港|みなと} に は 、 {郵便|ゆうびん} が {月|つき} に {一度|いちど} しか {届|とど}かない 。 || The ferry keeps its timetable. Very nice. But the little ports along the coast get their post once a month.
omi: {小回|こまわ}り の {利|き}く {郵便船|ゆうびんせん} が 、 {一隻|いっせき} {欲|ほ}しい 。 {古|ふる}い {船|ふね} なら 、 {浜|はま} に {何隻|なんせき} も ある 。 {足|た}りない の は 、 {直|なお}す {手|て} と 、 {乗|の}る {人|ひと} だ 。 || I want one handy little post boat. There are old hulls all along the beach. What I'm short of is hands to mend one, and someone to sail her.
!look omi pc
omi: そこ で だ 。 {古|ふる}い {船|ふね} を {一隻|いっせき} {直|なお}して 、 {免状|めんじょう} を {取|と}ったら 、 その {船|ふね} は あんた の もの だ 。 {代|か}わり に 、 {沿岸|えんがん} の {郵便|ゆうびん} を {運|はこ}んで もらう 。 || So here's the deal. Mend an old hull and earn your licence, and she's yours to sail. In return, you carry the coast's post.
?(comp=nao) comp[surprise]: {郵便|ゆうびん} を {船|ふね} で ？ …… {飛脚|ひきゃく} が {海|うみ} に {出|で}る の か 。 {悪|わる}く ない な 。 || Post by boat? …A courier taking to the sea. Not bad at all.
?(comp=mio) comp[smile]: {船|ふね} が あれば 、 {海|うみ} の {向|む}こう の {人|ひと} に も {薬|くすり} を {届|とど}けられます ね 。 || With a boat, we could get medicine to people across the water too.
?(comp=ren) comp[think]: {海|うみ} に も 、 {灯|ひ} の {道|みち} の よう な {道|みち} が ある の でしょう か 。 {見|み}て みたい です 。 || I wonder whether the sea has roads like the lantern roads. I'd like to see.
?(comp=suzu) comp[smile]: {船|ふね} の {旅|たび} ね 。 {一座|いちざ} の {巡業|じゅんぎょう} みたい 。 {乗|の}った わ 。 || A journey by boat. Like a troupe on tour. Count me in.
!choice
* {引|ひ}き{受|う}けます 。 || I'll take it on. -> yes
* {少|すこ}し {考|かんが}えさせて ください 。 || Let me think it over. -> later
:yes
!call sea.omi_deal_yes
!end
:later
omi: いつでも いい 。 {港|みなと} は {逃|に}げない よ 。 || Whenever you like. The harbour isn't going anywhere.

@scene sea.omi_deal_again
!faceplayer
omi: {船|ふね} の {話|はなし} 、 {考|かんが}えて くれた かい ？ || Thought any more about the boat?
!choice
* {引|ひ}き{受|う}けます 。 || I'll take it on. -> yes
* まだ {考|かんが}えて います 。 || I'm still thinking. -> later
:yes
!call sea.omi_deal_yes
!end
:later
omi: {急|いそ}がない よ 。 {古|ふる}い {船|ふね} は 、 {待|ま}つ の に {慣|な}れてる 。 || No hurry. Old boats are used to waiting.

@scene sea.omi_deal_yes
omi[smile]: よし 。 {話|はなし} が {早|はや}い 。 || Good. Quick to the point.
?(quest.sg_seaglass=done) omi: {船|ふね} だ が …… {当|あ}て が ある 。 フク さん の {千鳥丸|ちどりまる} だ 。 {旦那|だんな} が {亡|な}くなって から 、 {浜|はま} に {上|あ}げた まま に なってる 。 || As for the boat… I've one in mind. Fuku's Chidori-maru. She's sat up on the beach since Fuku's husband died.
?(!quest.sg_seaglass=done) omi: {船|ふね} だ が …… {当|あ}て が ある 。 フク さん の {旦那|だんな} の {船|ふね} だ 。 {浜|はま} に {上|あ}げた まま に なってる 。 {名前|なまえ} は …… {港|みなと} の {帳面|ちょうめん} から も {消|き}えて しまった 。 || As for the boat… I've one in mind. Fuku's late husband's. She's sat up on the beach. Her name… it's gone from the harbour's books as well.
omi: {無理|むり} に とは {言|い}わない 。 フク さん が {嫌|いや} なら 、 {港|みなと} の {古|ふる}い {水先船|みずさきぶね} が ある 。 まず 、 {話|はなし} を {聞|き}いて きな 。 || I won't push it. If she'd rather not, there's the harbour's old pilot boat. Go and talk to her first.
!quest sea_licence 0
!journal オウミ と {約束|やくそく} した 。 {古|ふる}い {船|ふね} を {直|なお}して {免状|めんじょう} を {取|と}れば 、 {船|ふね} は {自分|じぶん} の もの 。 {代|か}わり に {沿岸|えんがん} の {郵便|ゆうびん} を {運|はこ}ぶ 。 || A deal with Ōmi: mend an old hull and earn a licence, and the boat is mine to sail, carrying the coast's post.

# ---- Fuku and her husband's boat ---------------------------------------------------------------------------------------
@scene sea.fuku_hull
# Staged: Fuku on her bench, looking down the beach to where a hull lies under a tarpaulin.
!faceplayer
!if quest.sg_seaglass=done -> named
fuku: {港長|こうちょう} さん から {聞|き}きました よ 。 {夫|おっと} の {船|ふね} の こと 。 || The harbourmaster told me. About my husband's boat.
!gesture fuku lookroad right
fuku[worry]: …… でも ね 、 わたし 、 あの {船|ふね} の {名前|なまえ} も {思|おも}い{出|だ}せない の 。 {名前|なまえ} も {分|わ}からない {船|ふね} を 、 {人|ひと} に {渡|わた}す なんて …… 。 || …But you see, I can't even remember her name. To hand over a boat when I don't know her name…
fuku: アサヒ ちゃん に 、 {名札|なふだ} を {頼|たの}んで ある の 。 {名前|なまえ} が {分|わ}かったら 、 その {時|とき} は {喜|よろこ}んで 。 || I've asked little Asahi for a nameplate. If the name turns up, then gladly.
!choice
* {名前|なまえ} が {分|わ}かる まで 、 {待|ま}ちます 。 || I'll wait until her name turns up. -> wait
* {港|みなと} の {水先船|みずさきぶね} に します 。 || I'll take the harbour's pilot boat. -> pilot
:wait
fuku[smile]: ありがとう 。 {待|ま}って くれる {人|ひと} が いる と 、 {思|おも}い{出|だ}す の も {楽|たの}しみ に なる わ 。 || Thank you. With someone waiting, I might even look forward to remembering.
!journal フク さん は 、 {旦那|だんな} さん の {船|ふね} の {名前|なまえ} を {思|おも}い{出|だ}せない 。 アサヒ さん の {名札|なふだ} が できたら 、 {船|ふね} を {任|まか}せて くれる 。 || Fuku can't remember her husband's boat's name. Once Asahi's nameplate is made, she'll trust us with the boat.
!end
:pilot
fuku: ごめんなさい ね 。 …… {水先船|みずさきぶね} も 、 いい {船|ふね} です よ 。 {港|みなと} の {子|こ} たち は 、 みんな あれ の {横|よこ} で {泳|およ}ぎ を {覚|おぼ}えた の 。 || I'm sorry. …The pilot boat's a good boat too. Every child in the harbour learned to swim alongside her.
!var sea_hull = pilot
!goto tow
:named
fuku[smile]: {千鳥丸|ちどりまる} の こと ね 。 {港長|こうちょう} さん から {聞|き}きました よ 。 || It's about the Chidori-maru. The harbourmaster told me.
!gesture fuku lookroad right
fuku: {毎朝|まいあさ} 「いってらっしゃい 」 って {言|い}う でしょう 。 {返事|へんじ} は {鳥|とり} だけ 。 …… あの {船|ふね} が また {海|うみ} に {出|で}たら 、 {返事|へんじ} が {一|ひと}つ {増|ふ}える わ 。 || I say "take care" every morning, you know. Only the bird answers. …If she went to sea again, there'd be one more answer.
!look fuku pc
fuku: {名前|なまえ} を {返|かえ}して くれた あなた に 、 {乗|の}って ほしい の 。 {名前|なまえ} は ね 、 {好|す}き に つけて いい の よ 。 {新|あたら}しい {主|あるじ} に は 、 {新|あたら}しい {名前|なまえ} が {似合|にあ}う こと も ある から 。 || I'd like you to sail her, you who gave me back her name. And you may name her as you like. A new master sometimes suits a new name.
?(comp=nao) comp: …… {大事|だいじ} に 、 {預|あず}かります 。 || …We'll look after her.
?(comp=mio) comp[smile]: {大切|たいせつ} に {乗|の}ります 。 {約束|やくそく} します 。 || We'll sail her with care. I promise.
?(comp=ren) comp: {名|な} を {変|か}えて も 、 {船|ふね} が {覚|おぼ}えて いる こと は {変|か}わりません 。 || Even with a new name, what a boat remembers doesn't change.
?(comp=suzu) comp[smile]: {二代目|にだいめ} を {襲名|しゅうめい} する よう な もの ね 。 {恥|は}ずかしく ない {舞台|ぶたい} に する わ 。 || Like taking on a stage name from the one before. We'll do her proud.
!var sea_hull = chidori
:tow
narr: {次|つぎ} の {朝|あさ} 、 テツ の {渡|わた}し{船|ぶね} が 、 {古|ふる}い {船体|せんたい} を {引|ひ}いて {東|ひがし} へ {出|で}た 。 {行|い}き{先|さき} は 、 {八百橋|やおばし} の {造船所|ぞうせんじょ} 。 || Next morning, Tetsu's ferry heads east with the old hull in tow, bound for the boatyard at Manybridge.
!quest sea_licence 1
!journal {船体|せんたい} は {八百橋|やおばし} の {造船所|ぞうせんじょ} へ 。 {渡|わた}し{場|ば} の {横|よこ} の {船大工|ふなだいく} 、 カジロウ を {訪|たず}ねる 。 || The hull has gone to Manybridge. Find Kajirō the shipwright, by the ferry pier.

@scene sea.fuku_sails
# Once the boat is yours and lies at the quay: Fuku has walked down to see her.
!faceplayer
fuku[smile]: {見|み}ました よ 。 {岸|きし} に {着|つ}いて いる の を 。 $boat {丸|まる} 。 いい {名前|なまえ} ね 。 || I saw her, tied up at the quay. The $boat. That's a lovely name.
?(var.sea_kept=1) fuku: …… ちどり の まま に して くれた の ね 。 あの {人|ひと} 、 きっと {照|て}れて いる わ 。 || …You kept her name. He'd be blushing, I'm sure.
fuku: {今朝|けさ} は 、 {船|ふね} に も 「いってらっしゃい 」 を {言|い}いました 。 || This morning I said "take care" to the boat as well.

# ---- 1–3 · the yard ------------------------------------------------------------------------------------------------
@scene sea.kajiro_first
# Staged: Kajirō walks the length of the old hull on the slip, knocking on the planks with a knuckle and listening.
!faceplayer
sea_kajiro: …… {港長|こうちょう} の {客|きゃく} か 。 {船|ふね} は {届|とど}いてる 。 || …Ōmi's lot, are you. The hull's arrived.
!gesture sea_kajiro observe 3,4
sea_kajiro: {竜骨|りゅうこつ} は {丈夫|じょうぶ} だ 。 {板|いた} が {六枚|ろくまい} {腐|くさ}ってる 。 {帆|ほ} は {新|あたら}しく {縫|ぬ}う 。 || The keel's sound. Six planks are rotten. The sail we sew new.
sea_kajiro: {板|いた} は {注文|ちゅうもん} した 。 が 、 {届|とど}かない 。 この {町|まち} で は 、 よく ある こと だ 。 || I ordered the planking. It hasn't come. Happens a lot, in this town.
?(comp=nao) comp: {荷物|にもつ} が {違|ちが}う {倉|くら} に {行|い}く の は 、 この {町|まち} の {名物|めいぶつ} だ な 。 || Cargo going to the wrong warehouse is this town's speciality.
?(comp=mio) comp: また {倉|くら} {違|ちが}い です か 。 {札|ふだ} を {読|よ}めば 、 {見|み}つかる かも しれません 。 || The wrong warehouse again? If we read the labels, we may find it.
?(comp=ren) comp: {届|とど}かない {荷|に} に も 、 {必|かなら}ず {行|い}き{先|さき} が あります 。 {間違|まちが}って いて も 。 || A delivery that doesn't arrive has always gone somewhere. Even if it's the wrong place.
?(comp=suzu) comp: {小道具|こどうぐ} が {別|べつ} の {小屋|こや} に {届|とど}く の と {同|おな}じ ね 。 {探|さが}せば ある わ 。 || Like props delivered to the wrong theatre. Look, and they'll turn up.
sea_kajiro: それ と 、 {帆|ほ} だ 。 {奥|おく} の ヌイ に {聞|き}いて くれ 。 {俺|おれ} の {字|じ} が {読|よ}めない と {怒|おこ}ってる 。 || And the sail. Ask Nui, at the back. She's cross that she can't read my writing.
!quest sea_licence 2
!journal カジロウ の {造船所|ぞうせんじょ} 。 {届|とど}かない {板|いた} を {探|さが}す 。 {帆|ほ}{縫|ぬ}い の ヌイ に 、 {注文|ちゅうもん} を {読|よ}んで あげる 。 || Kajirō's yard. Find the planking that never arrived, and read Nui the sail-maker her order.

@scene sea.kajiro_timber
!faceplayer
sea_kajiro: {板|いた} の {送|おく}り{状|じょう} だ 。 {倉|くら}{通|どお}り の どこ か に ある 。 {読|よ}んで くれ 。 || Here's the delivery note for the planking. It's somewhere on Warehouse Row. Read it for me.
!challenge sea.yard_timber
!if var._res=1 -> ok
sea_kajiro: …… {急|いそ}がん 。 {板|いた} は {逃|に}げない 。 || …No rush. Planks don't run off.
!end
:ok
sea_kajiro: そこ か 。 {渡|わた}し{場|ば} の タケ に 、 この {送|おく}り{状|じょう} を {見|み}せて くれ 。 {車|くるま} で {運|はこ}んで くれる 。 || There, is it. Show this note to Take, the porter on the pier. He'll cart it over.
!give sea_timber_note

@scene sea.kajiro_take
sea_kajiro: {送|おく}り{状|じょう} は 、 {渡|わた}し{場|ば} の タケ に 。 || The note goes to Take, on the pier.

@scene sea.take_timber
# Staged: Take reads the note, nods, and whistles for his handcart.
!faceplayer
mb_take: {船大工|ふなだいく} の {送|おく}り{状|じょう} か 。 どれ 。 || The shipwright's note? Let's see.
!gesture mb_take read prop=letter
mb_take: …… なるほど 、 {三番|さんばん}{倉|ぐら} か 。 {板|いた} が {六枚|ろくまい} 。 {任|まか}せな 。 {昼|ひる} まで に {運|はこ}んで おく 。 || …Number three warehouse, eh. Six planks. Leave it to me. They'll be there by noon.
!take sea_timber_note
!set sea_f_timber
!journal {板|いた} は {三番|さんばん}{倉|ぐら} に あった 。 タケ が {造船所|ぞうせんじょ} へ {運|はこ}んで くれる 。 || The planking was in warehouse three. Take is carting it to the yard.

@scene sea.kajiro_nui
sea_kajiro: ヌイ の {方|ほう} は 、 どう だ 。 {帆|ほ} の ない {船|ふね} は 、 ただ の {箱|はこ} だ 。 || How's Nui getting on? A boat without a sail is just a box.

@scene sea.kajiro_name
# Both favours done: the planks are in and the sail is sewn. Now the name, chosen kana by kana.
!faceplayer
?(quest.sea_licence=2) sea_kajiro: {板|いた} は {張|は}った 。 {帆|ほ} も {縫|ぬ}い{上|あ}がった 。 || The planks are in. The sail's sewn.
sea_kajiro: あと は 、 {名前|なまえ} だ 。 {名前|なまえ} の ない {船|ふね} は 、 {呼|よ}んで も {帰|かえ}って こない 。 || All she needs now is a name. A boat with no name won't come back when you call her.
?(var.sea_hull=chidori) sea_kajiro: {前|まえ} の {名前|なまえ} は ちどり だった な 。 {残|のこ}す か 、 {変|か}える か 。 あんた が {決|き}めろ 。 || Her old name was Chidori. Keep it or change it. Your call.
?(!var.sea_hull=chidori) sea_kajiro: {水先船|みずさきぶね} に は 、 {名前|なまえ} が なかった 。 みんな 「{水先|みずさき}」 と {呼|よ}んで いた 。 {初|はじ}めて の {名前|なまえ} だ な 。 || The pilot boat never had a name. Everyone just called her "the pilot". This'll be her first.
narr: {名前|なまえ} は 、 かな で 。 {字|じ} を {一|ひと}つ ずつ {選|えら}ぶ 。 || The name, in kana. Choose the letters one by one.
?(var.sea_hull=chidori) !hook sail_name keep
?(!var.sea_hull=chidori) !hook sail_name
!if var._res=1 -> named
sea_kajiro: …… {急|いそ}がん で いい 。 {名前|なまえ} は 、 {一生|いっしょう} もの だ 。 || …Take your time. A name's for life.
!end
:named
!set sea_named
sea_kajiro: $boat {丸|まる} 、 か 。 || The $boat, is it.
!quest sea_licence 3
!gesture sea_kajiro nod
?(var.sea_kept=1) sea_kajiro: ちどり の まま か 。 フク さん が {喜|よろこ}ぶ 。 || Chidori still. Fuku will be pleased.
sea_kajiro: {悪|わる}く ない 。 {字|じ} は 、 {版木|はんぎ}{通|どお}り の ソウベエ の {店|みせ} が {書|か}く 。 {造船所|ぞうせんじょ} の {船|ふね} の {名前|なまえ} は 、 {昔|むかし} から あそこ の {仕事|しごと} だ 。 || Not bad. Sōbē's shop on Blockprint Row will paint the letters. The yard's boat names have always been their work.
?(!mb1_done) sea_kajiro: …… {版木|はんぎ}{通|どお}り へ の {道|みち} は 、 {札場|ふだば} の {騒|さわ}ぎ が {片付|かたづ}く まで {閉|し}まって いる 。 {落|お}ち{着|つ}いたら 、 {行|い}って くれ 。 || …The way to Blockprint Row is shut until the Exchange's trouble is sorted out. Go once it's settled.
!journal {船|ふね} の {名前|なまえ} は 「$boat {丸|まる}」 。 {字|じ} を {書|か}いて もらう ため 、 {版木|はんぎ}{通|どお}り の ソウベエ を {訪|たず}ねる 。 || The boat's name is the $boat. Ask Sōbē on Blockprint Row to have it painted.

@scene sea.kajiro_sobe
sea_kajiro: {字|じ} は 、 ソウベエ の {店|みせ} に {頼|たの}んで くれ 。 {版木|はんぎ}{通|どお}り だ 。 || Ask Sōbē's shop for the letters. Blockprint Row.

@scene sea.sobe_sign
# Staged: Sōbē takes a practice board down from the rack: boat names painted in his apprentice's hand.
!faceplayer
mp_sobe: {船|ふね} の {名前|なまえ} ？ …… {刷|す}り{物|もの} じゃ ねえ が 、 {字|じ} は {字|じ} だ 。 {引|ひ}き{受|う}けた 。 || A boat's name? …It's not printing, but letters are letters. We'll take it on.
mp_sobe: {筆|ふで} を {持|も}つ の は サンペイ だ 。 だが その {前|まえ} に 、 あいつ の {稽古|けいこ}{板|いた} を {見|み}て くれ 。 {間違|まちが}い が {一|ひと}つ ある 。 {見|み}つけられる か 。 || Sanpei holds the brush. But first, look at his practice board. There's one mistake on it. Can you find it?
!challenge sea.sign_board
!if var._res=1 -> ok
mp_sobe: …… もう {一度|いちど} 、 よく {見|み}な 。 {急|いそ}ぐ こと は ねえ 。 || …Take another good look. No hurry.
!end
:ok
!set sea_sign_ok
mp_sobe[smile]: そう だ 。 {一画|いっかく} {違|ちが}えば 、 {別|べつ} の {船|ふね} に なる 。 {名前|なまえ} って の は 、 そういう もん だ 。 || That's it. One stroke wrong and she's a different boat. That's what names are like.
mp_sobe: サンペイ を {造船所|ぞうせんじょ} に {行|い}かせる 。 …… ミヨ も {付|つ}いて {行|い}く だろう な 。 {止|と}めて も {無駄|むだ} だ 。 || I'll send Sanpei to the yard. …Miyo will tag along, I expect. No use stopping her.
!journal ソウベエ の {店|みせ} の サンペイ が 、 {造船所|ぞうせんじょ} で {船|ふね} の {名前|なまえ} を {書|か}いて くれる 。 || Sanpei from Sōbē's shop will paint the boat's name at the yard.

@scene sea.kajiro_paint
# Staged: Sanpei on a crate at the bow with a brush and a pot of white; Miyo at his elbow reading each letter out;
# Miyo is allowed the last one; everyone steps back to look.
!faceplayer
narr: サンペイ が 、 {舳先|へさき} に {白|しろ}い {塗料|とりょう} で {字|じ} を {書|か}いて いく 。 ミヨ が {横|よこ} で 、 {一字|いちじ} ずつ {読|よ}み{上|あ}げる 。 || Sanpei paints the letters on the bow in white. Beside him, Miyo reads each one out.
mp_miyo: …… {最後|さいご} の 「{丸|まる}」 は 、 わたし ！ {丸|まる} なら 、 {小|ちい}さく て も {書|か}ける もん ！ || …The last one, 丸, is mine! Even I can write 丸, small as I am!
mp_sanpei: しょうがない な 。 …… {曲|ま}げる なよ 。 || Oh, all right. …Don't make it wonky.
narr: 「$boat {丸|まる}」 。 {舳先|へさき} で 、 {白|しろ}い {字|じ} が {乾|かわ}いて いく 。 || The $boat. The white letters dry on the bow.
?(comp=nao) comp: …… いい {字|じ} だ 。 {宛名|あてな} に {書|か}いたら 、 {迷|まよ}わず {届|とど}く 。 || …Good lettering. Write that on an envelope and it'd never go astray.
?(comp=mio) comp[smile]: {名前|なまえ} が {入|はい}る と 、 {急|きゅう} に {生|い}きて いる みたい に {見|み}えます ね 。 || Once the name's on, she suddenly looks alive.
?(comp=ren) comp: {名|な} を {書|か}く の は 、 {灯|ひ} を {入|い}れる の と {似|に}て います 。 {灯|とも}りました ね 。 || Writing a name is like lighting a lamp. She's lit.
?(comp=suzu) comp[smile]: {看板|かんばん} が {上|あ}がった わ ね 。 {初日|しょにち} は いつ ？ || The sign's up. When's opening night?
sea_kajiro: {試|ため}し{乗|の}り は 、 {潮硝子|しおがらす} の テツ の {仕事|しごと} だ 。 {船|ふね} は {俺|おれ} が {回|まわ}して おく 。 || Sea trials are Tetsu's business, at Saltglass. I'll have her sailed round.
?(!mb2_done) sea_kajiro: …… だが 、 {祭|まつ}り が {終|お}わる まで 、 テツ は {渡|わた}し{船|ぶね} で {手|て} が {離|はな}せない だろう 。 || …But until the festival's over, Tetsu won't have a hand free from the ferry.
!quest sea_licence 4
!journal {名前|なまえ} が {入|はい}った 。 {試|ため}し{乗|の}り は {潮硝子|しおがらす} で テツ と 。 || The name's on her. Sea trials are at Saltglass, with Tetsu.

@scene sea.kajiro_after
sea_kajiro: {船|ふね} は {元気|げんき} か 。 {板|いた} が {鳴|な}ったら 、 {持|も}って こい 。 || How's the boat? If her planks start creaking, bring her in.

@scene sea.kajiro_idle
sea_kajiro: …… {船|ふね} の {用|よう} じゃ ない なら 、 {後|あと} に して くれ 。 || …If it's not about a boat, later.

@scene sea.yard_hull
?(quest.sea_licence>=0&quest.sea_licence<=3) narr: {台|だい} の {上|うえ} に 、 あなた の {船|ふね} に なる {古|ふる}い {船体|せんたい} 。 || On the trestles, the old hull that's going to be your boat.
?(!quest.sea_licence|quest.sea_licence>=4) narr: {台|だい} の {上|うえ} に 、 {誰|だれ} か の {小舟|こぶね} 。 {底|そこ} に {新|あたら}しい {板|いた} が {張|は}って ある 。 || Someone's skiff on the trestles, new planks along her bottom.

@scene sea.yard_loom
narr: ヌイ の {機|はた} 。 {帆布|はんぷ} が {長|なが}く {伸|の}びて いる 。 || Nui's loom, with a long run of sailcloth stretching from it.

@scene sea.nui_sail
# Staged: Nui at the loom with a strip of canvas over her knees; she waves a scrap of paper at you.
!faceplayer
sea_nui: あっ 、 ちょうど よかった ！ ねえ 、 これ {読|よ}める ？ カジロウ さん の {字|じ} 、 {蟹|かに} が {歩|ある}いた みたい で 。 || Oh, perfect timing! Hey, can you read this? Kajirō's writing looks like a crab walked across it.
!challenge sea.nui_sail
!if var._res=1 -> ok
sea_nui: {惜|お}しい ！ …… {急|いそ}がない から 、 また {読|よ}んで ね 。 || Close! …No hurry. Read it to me again later.
!end
:ok
sea_nui[happy]: それ それ ！ {縦|たて} と {横|よこ} が {分|わ}かれば 、 {後|あと} は {縫|ぬ}う だけ 。 {三日|みっか} で {仕上|しあ}げる よ 。 || That's it! Once I know the height and the width, it's just sewing. I'll have it done in three days.
?(comp=nao) comp: {帆|ほ} も 、 {寸法|すんぽう} を {間違|まちが}えたら {届|とど}かない {手紙|てがみ} と {同|おな}じ か 。 || So a sail with the wrong measurements is like a letter that never arrives.
?(comp=mio) comp: {針|はり} の {運|はこ}び が 、 {私|わたし} が {包帯|ほうたい} を {巻|ま}く より {速|はや}い …… 。 || Her needle's faster than I am winding a bandage…
?(comp=ren) comp: {一目|ひとめ} ずつ に 、 {風|かぜ} を {受|う}ける {力|ちから} が {入|はい}る の です ね 。 || Every stitch takes a little of the wind's weight.
?(comp=suzu) comp[smile]: {衣装|いしょう}{方|かた} に {欲|ほ}しい {腕|うで} ね 。 || I'd want hands like that in the wardrobe department.
!set sea_f_sail
!journal ヌイ に {帆|ほ} の {寸法|すんぽう} を {読|よ}んで あげた 。 {三日|みっか} で {縫|ぬ}い{上|あ}がる 。 || Read Nui the sail's measurements. She'll have it sewn in three days.

@scene sea.nui_after
sea_nui: {帆|ほ} は {任|まか}せて 。 {破|やぶ}れたら 、 いつでも {持|も}って きて ！ || Leave sails to me. If one tears, bring it any time!

@scene sea.nui_idle
narr: ヌイ が 、 {歌|うた}い ながら {針|はり} を {動|うご}かして いる 。 || Nui is singing as she sews.
sea_nui: {縫|ぬ}う {時|とき} は 、 {歌|うた}う の 。 {針|はり} が {迷|まよ}わない よう に 。 || I sing when I sew. It keeps the needle from wandering.

# ---- 4 · sea trials at Saltglass ----------------------------------------------------------------------------------------
@scene sea.tetsu_words
# Staged: Tetsu on the quay beside your boat, newly sailed round from Manybridge; he points to each part as he names
# it, then out at the water and up at the wind.
!faceplayer
tetsu: {来|き}た か 。 $boat {丸|まる} 、 {着|つ}いてる 。 || There you are. The $boat's in.
!choice
* {試|ため}し{乗|の}り の {話|はなし} です 。 || About the sea trials. -> words
* {渡|わた}し{船|ぶね} に {乗|の}りたい です 。 || I'd like the ferry. -> ferry
:ferry
!call sea.tetsu_ferry
!end
:words
!if var.sea_w>=1 -> two
tetsu: {海|うみ} に {出|で}る {前|まえ} に 、 {言葉|ことば} を {五|いつ}つ 。 {覚|おぼ}えろ 。 || Before you go out, five words. Learn them.
!gesture tetsu point 36,33
tetsu: {帆|ほ} 。 {風|かぜ} を {受|う}ける 。 {舵|かじ} 。 {船|ふね} の {向|む}き を {決|き}める 。 {錨|いかり} 。 {船|ふね} を {止|と}めて おく 。 || 帆, the sail: it takes the wind. 舵, the rudder: it decides where she points. 錨, the anchor: it holds her still.
!challenge sea.words_boat
!if var._res=1 -> one
tetsu: …… もう {一度|いちど} だ 。 {帆|ほ} 、 {舵|かじ} 、 {錨|いかり} 。 {急|いそ}がなくて いい 。 || …Again. 帆, 舵, 錨. No need to hurry.
!end
:one
!var sea_w = 1
:two
!gesture tetsu lookroad down
tetsu: {潮|しお} 。 {海|うみ} の {水|みず} の {満|み}ち{引|ひ}き 。 {風向|かざむ}き 。 {風|かぜ} が どこ から {来|く}る か 。 || 潮, the tide: the sea's water coming in and going out. 風向き, the wind's direction: where it comes from.
tetsu: {陸|おか} の {人間|にんげん} は 、 {風|かぜ} が どこ へ {行|い}く か を {言|い}う 。 {船乗|ふなの}り は 、 どこ から {来|く}る か を {言|い}う 。 || Landsmen say where the wind goes. Sailors say where it comes from.
!challenge sea.words_wind
!if var._res=1 -> ok
tetsu: {潮|しお} と {風向|かざむ}き 。 また {聞|き}く 。 || The tide and the wind's direction. I'll ask again.
!end
:ok
tetsu: よし 。 …… {潮|しお} の {時刻|じこく} は 、 シオリ の {帳面|ちょうめん} に ある 。 {潮見|しおみ}{小屋|ごや} で {読|よ}ませて もらえ 。 || Good. …The tide times are in Shiori's book. Have her let you read it at the tide-watch hut.
!set sea_words
!journal テツ に {海|うみ} の {言葉|ことば} を {五|いつ}つ {教|おそ}わった 。 {帆|ほ} 、 {舵|かじ} 、 {錨|いかり} 、 {潮|しお} 、 {風向|かざむ}き 。 {次|つぎ} は シオリ の {潮|しお} の {帳面|ちょうめん} 。 || Tetsu taught me five sea words: sail, rudder, anchor, tide, the wind's direction. Next, Shiori's tide book.

# Tetsu's ferry, offered from his sea-trial scenes (whichever run his board has now)
@scene sea.tetsu_ferry
!if ch5_done&!ko_arrived -> ko1
!if ko_arrived&!post -> ko2
!call mb.ferry_tetsu_again
!end
:ko1
!call ko.ferry_tetsu
!end
:ko2
!call ko.ferry_tetsu_again

@scene sea.shiori_tide
# Staged: Shiori opens her tide book on the desk and turns it round so you can read the day's page.
!faceplayer
shiori: テツ さん から {聞|き}きました 。 {試|ため}し{乗|の}り です ね 。 {潮|しお} の {表|ひょう} を {見|み}ましょう 。 || Tetsu told me. Your sea trial. Let's look at the tide table.
!gesture shiori read
shiori: {港|みなと} を {出|で}る の は 、 {満|み}ち{潮|しお} の ころ が {一番|いちばん} です 。 {浅瀬|あさせ} で {底|そこ} を {擦|す}りません から 。 || Around high tide is the best time to leave harbour. You won't scrape the bottom on the shallows.
!challenge sea.tide_book
!if var._res=1 -> ok
shiori: {急|いそ}ぎません 。 {潮|しお} は {毎日|まいにち} {二回|にかい} {満|み}ちます から 。 || There's no hurry. The tide comes in twice a day.
!end
:ok
shiori[smile]: その とおり です 。 テツ さん に 、 その {時刻|じこく} を {伝|つた}えて ください 。 {帳面|ちょうめん} の {字|じ} も {潮|しお} も 、 {今日|きょう} は {正直|しょうじき} です よ 。 || Just so. Tell Tetsu the time. My book and the tide are both honest today.
!set sea_tide
!journal シオリ の {帳面|ちょうめん} で 、 {満|み}ち{潮|しお} の {時刻|じこく} を {読|よ}んだ 。 テツ と {試|ため}し{乗|の}り に {出|で}る 。 || Read the time of high tide in Shiori's book. Time to go out with Tetsu on the trial.

@scene sea.tetsu_trial
!faceplayer
tetsu: {潮|しお} は 。 || The tide?
!choice
* {満|み}ち{潮|しお} です 。 {今|いま} {出|で}られます 。 || It's high. We can go now. -> go
* {渡|わた}し{船|ぶね} に {乗|の}りたい です 。 || I'd like the ferry. -> ferry
* また {後|あと} で 。 || Later. -> later
:ferry
!call sea.tetsu_ferry
!end
:later
tetsu: {潮|しお} は {待|ま}って くれん が 、 また {満|み}ちる 。 || The tide won't wait, but it comes in again.
!end
:go
tetsu: {岬|みさき} の {先|さき} の ブイ を {回|まわ}って 、 {戻|もど}って こい 。 {帆|ほ} は {風|かぜ} に {合|あ}わせろ 。 {風|かぜ} は {西|にし} から だ 。 || Round the buoy off the point and come back. Set the sail to the wind. The wind's from the west.
tetsu: …… {心配|しんぱい} は {要|い}らん 。 {俺|おれ} も {乗|の}って いる 。 || …No need to worry. I'm aboard too.
!var sea_trial = 1
!hook sail_trial saltglass saltglass

@scene sea.trial_mark
# At sea on the trial: the buoy off the point is rounded. (Tetsu is aboard, not on the sea map: his words are quoted.)
narr: {赤|あか} と {白|しろ} の ブイ を 、 ぐるり と {回|まわ}った 。 テツ が {頷|うなず}く 。 「よし 。 {港|みなと} へ {戻|もど}れ 。」 || You round the red-and-white buoy. Tetsu nods. "Good. Back to harbour."
!var sea_trial = 2
!hook sail_log sight the mark off the point

@scene sea.arrive_saltglass
# After any arrival at Saltglass by boat; the sea trial's end, if this was the trial (the crew may have sailed her round).
!if var.sea_trial>=1 -> trial
!end
:trial
?(var.sea_trial=1) narr: {乗組員|のりくみいん} が 、 ブイ を {回|まわ}って から {港|みなと} に {入|い}れた 。 || The crew rounded the buoy before bringing her in.
!look tetsu pc
tetsu: …… {悪|わる}く ない 。 {帆|ほ} の {張|は}り も 、 {舵|かじ} も 。 || …Not bad. The sail and the rudder, both.
?(comp=nao) comp: {海|うみ} の {上|うえ} だ と 、 {道|みち} が ない の に {迷|まよ}わない もん だ な 。 || Out on the water there's no road, and somehow you still don't get lost.
?(comp=mio) comp[smile]: {風|かぜ} が {帆|ほ} に {入|はい}った {時|とき} 、 {船|ふね} が {笑|わら}った みたい でした 。 || When the wind filled the sail, it was as if the boat laughed.
?(comp=ren) comp: {灯|ひ} の ない {道|みち} でも 、 {風|かぜ} と {潮|しお} が {道|みち} を {教|おし}えて くれる の です ね 。 || Even with no lamps on the way, the wind and the tide show you the road.
?(comp=suzu) comp[smile]: {初舞台|はつぶたい} に して は 、 {上出来|じょうでき} じゃない ？ || Not bad for a debut, was it?
tetsu: {次|つぎ} は {港長|こうちょう} の {試験|しけん} だ 。 {書類|しょるい} と 、 {話|はなし} だ 。 オウミ は {厳|きび}しい が 、 {意地|いじ} は {悪|わる}く ない 。 || Next is the harbourmaster's examination. Papers, and a talk. Ōmi's strict, but she's not mean.
!var sea_trial = 0
!set sea_trial_done
!quest sea_licence 5
!journal {試|ため}し{乗|の}り は {無事|ぶじ} {終|お}わった 。 {次|つぎ} は {港長|こうちょう} オウミ の {試験|しけん} 。 || The sea trial went well. Next, Harbourmaster Ōmi's examination.

# ---- 5 · the licence ------------------------------------------------------------------------------------------------
@scene sea.omi_licence
# Staged: Ōmi has cleared her desk; a form lies on it with a pen beside it. For the interview she puts on her reading
# glasses and an examiner's voice, and drops both again at the end.
!faceplayer
!if var.sea_exam>=1 -> again
omi: {来|き}た ね 。 テツ から {聞|き}いた 。 {腕|うで} は {確|たし}か だ と さ 。 || There you are. Tetsu says your hands are sound.
omi: じゃあ 、 {試験|しけん} だ 。 まず {書類|しょるい} 。 それから 、 {少|すこ}し {話|はなし} を {聞|き}く 。 {間違|まちが}えたら 、 その {場|ば} で やり{直|なお}し だ 。 {何度|なんど} でも な 。 || Right, the examination. Papers first. Then I'll ask you a few things. Get one wrong and you go again, then and there. As many times as it takes.
!var sea_exam = 1
!goto start
:again
omi: {続|つづ}き を やる かい ？ || Shall we carry on?
:start
!if var.sea_exam_form>=1 -> talk
:form
!challenge sea.licence_form
!if var._res=1 -> formok
omi: …… {惜|お}しい 。 もう {一度|いちど} {書|か}いて みな@見る 。 || …Close. Write it again.
!choice
* もう {一度|いちど} 。 || Again. -> form
* {少|すこ}し {休|やす}みます 。 || I'll take a break. -> rest
:formok
!var sea_exam_form = 1
omi: {書類|しょるい} は いい 。 …… では 。 || The form's fine. …Now, then.
:talk
omi: ゴホン 。 これ より 、 {面接|めんせつ} を {始|はじ}めます 。 || Ahem. The interview will now begin.
?(comp=nao) comp: （…… {急|きゅう} に {言葉|ことば} が {硬|かた}く なった な 。） || (…Her voice just went all stiff.)
?(comp=mio) comp: （{港長|こうちょう} さん 、 {眼鏡|めがね} を かける と {別人|べつじん} みたい ……。） || (With her glasses on, the harbourmaster's like a different person…)
?(comp=ren) comp: （{試験|しけん} の {言葉|ことば} です ね 。 {丁寧|ていねい} に {答|こた}えましょう 。） || (Examination language. Let's answer politely.)
?(comp=suzu) comp: （{役|やく} に {入|はい}った わ ね 。 こっち も {合|あ}わせ ない と 。） || (She's got into character. We'd better play along.)
:q1
!challenge sea.interview_1
!if var._res=1 -> q2
omi: …… もう {一度|いちど} 、 {伺|うかが}います 。 || …I shall ask once more.
!choice
* はい 。 || Yes. -> q1
* {少|すこ}し {休|やす}ませて ください 。 || May I take a break? -> rest
:q2
!challenge sea.interview_2
!if var._res=1 -> q3
omi: …… もう {一度|いちど} 、 {伺|うかが}います 。 || …I shall ask once more.
!choice
* はい 。 || Yes. -> q2
* {少|すこ}し {休|やす}ませて ください 。 || May I take a break? -> rest
:q3
!challenge sea.interview_3
!if var._res=1 -> pass
omi: …… もう {一度|いちど} 、 {伺|うかが}います 。 || …I shall ask once more.
!choice
* はい 。 || Yes. -> q3
* {少|すこ}し {休|やす}ませて ください 。 || May I take a break? -> rest
:pass
omi: …… {以上|いじょう} で 、 {面接|めんせつ} を {終|お}わります 。 || …That concludes the interview.
!gesture omi nod
omi[smile]: {合格|ごうかく} だ 。 …… ああ 、 {肩|かた} が {凝|こ}った 。 {試験官|しけんかん} の {喋|しゃべ}り{方|かた} は 、 {性|しょう} に {合|あ}わない よ 。 || You pass. …Oof, my shoulders. Talking like an examiner doesn't suit me.
!give sea_licence_doc
narr: {免状|めんじょう} に は 、 {船|ふね} の {名前|なまえ} 「$boat {丸|まる}」 と 、 あなた の {名前|なまえ} 。 その {下|した} に 、 オウミ の {大|おお}きな {署名|しょめい} 。 || On the licence: the boat's name, the $boat, and yours. Beneath them, Ōmi's large signature.
?(var.sea_hull=pilot) !hook sail_boat pilot
?(!var.sea_hull=pilot) !hook sail_boat chidori
omi: {船|ふね} は あんた の もの だ 。 {港|みなと} の {桟橋|さんばし} に {繋|つな}いで ある 。 {海図|かいず} は {船|ふね} の {中|なか} に {置|お}いた 。 || She's yours. She's tied up at the harbour's pier. I've put the chart aboard.
!if ko_arrived -> been
omi: …… それ と な 。 {郵便|ゆうびん} を {運|はこ}ぶ なら 、 {一|ひと}つ {話|はなし} して おく 。 || …And one more thing, since you'll be carrying the post.
omi: {海|うみ} で なくなった {郵便|ゆうびん} は 、 {西|にし} の {沖|おき} の {島|しま} に {流|なが}れ{着|つ}く 、 って {話|はなし} が ある 。 {船乗|ふなの}り の {噂|うわさ} さ 。 どの {帳面|ちょうめん} に も {載|の}って ない {島|しま} だ 。 || There's a tale that post lost at sea washes up on an island out west. Sailors' talk. An island that's in no ledger.
omi: {港長|こうちょう} と して は 、 {馬鹿|ばか} な {話|はなし} だ と {言|い}う べき だろう ね 。 …… でも 、 なくした {手紙|てがみ} が どこ か に {届|とど}いて いる なら 、 {悪|わる}く ない と {思|おも}う よ 。 || As harbourmaster, I suppose I ought to call it nonsense. …But if lost letters are getting somewhere after all, I wouldn't mind that.
?(comp=nao) comp: …… {届|とど}かなかった {手紙|てがみ} が 、 {島|しま} に 。 || …Letters that never arrived. On an island.
?(comp=mio) comp[think]: なくした もの が {集|あつ}まる {島|しま} …… 。 {本当|ほんとう} に ある なら 、 {行|い}って みたい です 。 || An island where lost things gather… If it's real, I'd like to go.
?(comp=ren) comp: {噂|うわさ} に は 、 {必|かなら}ず {少|すこ}し {本当|ほんとう} の こと が {入|はい}って います 。 || There's always a little truth in a rumour.
?(comp=suzu) comp[smile]: {地図|ちず} に ない {島|しま} 。 {芝居|しばい} の {筋|すじ} なら 、 {次|つぎ} の {幕|まく} は そこ ね 。 || An island that's on no map. If this were a play, that's where the next act would be.
!set sea_rumour_omi
!goto done
:been
omi: {言|こと}の{葉|は}{島|じま} に は 、 もう {渡|わた}し{船|ぶね} で {行|い}った ん だった ね 。 {自分|じぶん} の {船|ふね} で {行|い}く {島|しま} は 、 また {違|ちが}って {見|み}える よ 。 || You've already been to Kotonoha on the ferry, haven't you. An island looks different when you sail there yourself.
:done
omi: {最初|さいしょ} の {仕事|しごと} だ 。 {沿岸|えんがん} の {郵便|ゆうびん} 。 {漣|さざなみ} の {束|たば} は ウキ の {店|みせ} の {郵便|ゆうびん}{箱|ばこ} へ 、 {東|ひがし} の {渡|わた}し{場|ば} の {一通|いっつう} は ゲンロク {爺|じい}さん に 。 || Your first job: the coast's post. Sazanami's bundle goes in the post box at Uki's stall, and the one letter for East Landing to old Genroku.
omi: {東|ひがし} の {渡|わた}し{場|ば} に は 、 {砂|すな} で {船|ふね} が {着|つ}けられない 。 {浜|はま} を {回|まわ}って {歩|ある}いて {行|い}きな 。 || East Landing's silted: no boat can put in there. Walk round the beach.
!give sea_mailbag
!quest sea_licence 6
!journal {免状|めんじょう} を {取|と}った 。 $boat {丸|まる} は {自分|じぶん} の {船|ふね} 。 {潮硝子|しおがらす} の {桟橋|さんばし} から 、 {海図|かいず} を {広|ひろ}げて {出|で}られる 。 || The licence is mine, and the $boat with it. She sails from Saltglass's pier: open the chart aboard her.
!autosave
!end
:rest
omi: いい よ 。 {続|つづ}き は 、 また {今度|こんど} だ 。 || Fine. We'll carry on another time.
`);
