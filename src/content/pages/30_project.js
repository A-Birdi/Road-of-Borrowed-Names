/* The Pages We Keep (addendum §11): one finite project for the committed
 * companion, in the existing Atlas preparation, camp and homecoming flow.
 *   Page I   pages.offer   the Lantern Hall (offered once on entering; afterwards
 *                          talk to your companion there). Never blocks a run.
 *   Page II  pages.camp    at the first camp after a real event of that outing
 *            pages.home2   or at home, if the camp talk was put off
 *   Page III pages.home3   after coming home from that outing (any return)
 *   pages.home             called at the end of atlas.home (the homecoming)
 * The choices are presented and committed by !hook pages_choose (10_pages.js).
 * Every return is honest: an early return is a real decision, a defeat is the
 * road sending you home, an outing with nothing in it leaves the page open. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
# ---- Page I: What Shall We Keep? ----------------------------------------------------------------
@scene pages.enter_offer
!call pages.offer

@scene pages.offer
!if comp=nao -> nao
!if comp=mio -> mio
!if comp=ren -> ren
!if comp=suzu -> suzu
!end
:nao
nao: ツル の {新|あたら}しい {帳面|ちょうめん} 、 {見|み}た か ？ {道|みち} が どこ へ {続|つづ}く か は {書|か}いて ある 。 でも 、 {帰|かえ}り{方|かた} は {誰|だれ} も {書|か}いて ない 。 || Seen Tsuru's new ledger? It says where the roads go. Nobody's written down how to get back.
nao: だから 、 {二人|ふたり} で {一枚|いちまい} 、 {札|ふだ} を {作|つく}らない か 。 {本当|ほんとう} に {歩|ある}いた {道|みち} から 、 {一|ひと}つ だけ {選|えら}んで 。 || So how about the two of us make one card? From a road we actually walk. Just one thing from it.
?(quest.lf_nao=done) nao: ウミ の {時|とき} に {分|わ}かった 。 {道|みち} を {知|し}ってる の と 、 {人|ひと} の {代|か}わり に {決|き}める の は 、 {別|べつ} だ 。 そういう の を {書|か}いて おきたい 。 || Umi taught me something. Knowing a road and deciding for someone else are different things. That's the kind of thing I want written down.
?(!quest.lf_nao=done) nao: {道|みち} を {知|し}ってる の と 、 {人|ひと} の {代|か}わり に {決|き}める の は 、 {別|べつ} だ 。 {最近|さいきん} 、 よく そう {思|おも}う 。 そういう の を {書|か}いて おきたい 。 || Knowing a road and deciding for someone else are different things. I think about that a lot lately. That's the kind of thing I want written down.
?(bond>=trusted) nao[smirk]: {誰|だれ} に でも {頼|たの}む {話|はなし} じゃ ない けど な 。 || Not something I'd ask just anyone, mind.
nao: {次|つぎ} に {歩|ある}く {誰|だれ}か の ため に する か 、 {自分|じぶん} たち の {帰|かえ}り{道|みち} の ため に する か 。 どっち が いい ？ || For whoever walks it next, or for finding our own way back. Which do you want?
!hook pages_choose theme
!if pages.pick=later -> nlater
?(pages.pick=next) nao[smile]: {道案内|みちあんない} か 。 {配達人|はいたつにん} の {得意|とくい} {分野|ぶんや} だ 。 {決|き}め{付|つ}けない {書|か}き{方|かた} を {考|かんが}えよう 。 || Directions, then. A courier's speciality. We'll work out how to write it without telling anyone what to do.
?(pages.pick=back) nao: {帰|かえ}り{道|みち} の {一言|ひとこと} 、 か 。 …… {鞄|かばん} に {入|い}れて おく の に ちょうど いい 。 || A line for the way back… Just the right size to keep in the bag.
nao: {次|つぎ} に {書|か}かれて いない {道|みち} へ {出|で}たら 、 {本当|ほんとう} に あった こと を {一|ひと}つ {覚|おぼ}えて おこう 。 {焚|た}き{火|び} の {所|ところ} で {話|はな}そう 。 || Next time we're out on an unwritten road, let's remember one thing that really happens. We'll talk it over at the campfire.
!end
:nlater
nao: {急|いそ}ぐ {話|はなし} じゃ ない 。 {気|き} が {向|む}いたら 、 {声|こえ} を かけて くれ 。 || No rush. Say the word when you feel like it.
!end
:mio
mio: ねえ 、 $name 。 {旅|たび} の {間|あいだ} 、 わたし は ずっと {誰|だれ}か の {荷物|にもつ} を {持|も}って いた {気|き} が する の 。 || You know, $name, all through the journey I felt like I was always carrying someone's load.
mio: だから 、 {今度|こんど} は {荷|に} を {下|お}ろせた {場所|ばしょ} の こと を 、 {一枚|いちまい} {残|のこ}したい 。 {書|か}かれて いない {道|みち} で 、 {本当|ほんとう} に {休|やす}めた {所|ところ} を 。 || So this time I'd like to keep one page about a place where we could set things down. Somewhere on an unwritten road where we really rested.
?(quest.lf_mio=done) mio: {断|ことわ}る の を {覚|おぼ}えた から 、 {休|やす}む の も {覚|おぼ}えたい の 。 {順番|じゅんばん} と して は 、 {合|あ}ってる でしょ ？ || I've learned to say no, so I'd like to learn to rest too. That's the right order, isn't it?
?(!quest.lf_mio=done) mio: {休|やす}む の も 、 {断|ことわ}る の と {同|おな}じ で 、 {練習|れんしゅう} が いる みたい 。 || Resting seems to need practice too, same as saying no.
?(bond>=trusted) mio[smile]: あなた と なら 、 {休|やす}む の が {上手|じょうず} に なれる {気|き} が する の 。 || With you, I think I could get good at resting.
mio: {休|やす}んで も {怖|こわ}くなかった {理由|りゆう} を {書|か}く か 、 {仕事|しごと} を {分|わ}け{合|あ}えた {理由|りゆう} を {書|か}く か 。 どっち に する ？ || Shall we write about why a pause felt safe, or about how we managed to share the work?
!hook pages_choose theme
!if pages.pick=later -> mlater
?(pages.pick=pause) mio[smile]: うん 。 {休|やす}む {練習|れんしゅう} の {記録|きろく} ね 。 {処方|しょほう} より 、 ずっと {大事|だいじ} かも 。 || Mm. A record of practising rest. Maybe more important than any prescription.
?(pages.pick=share) mio: {分|わ}け{合|あ}う {方|ほう} ね 。 …… わたし が {全部|ぜんぶ} やろう と したら 、 {止|と}めて よ 。 || Sharing, then. …If I try to do everything myself, stop me.
mio: {次|つぎ} の {道|みち} で 、 {一|ひと}つ だけ {覚|おぼ}えて おこう 。 {無理|むり} に じゃ なくて 、 {自然|しぜん} に 。 || On the next road, let's remember just one thing. Not forcing it — naturally.
!end
:mlater
mio: いい の 。 {急|いそ}がない の も 、 {練習|れんしゅう} の うち 。 || That's fine. Not hurrying is part of the practice too.
!end
:ren
ren: {灯守|ひもり} の {帳面|ちょうめん} に は 、 {余白|よはく} が あります 。 {次|つぎ} の {灯守|ひもり} へ の {書|か}き{込|こ}み の ため の 。 || A lantern keeper's register has margins. For notes to the next keeper.
?(sa_ren_took) ren: {師匠|ししょう} の {余白|よはく} は 、 {字|じ} が {右|みぎ} に {跳|は}ねて いて 、 {読|よ}む と {顔|かお} が {浮|う}かびます 。 || My teacher's margins kick to the right. When I read them, I can see the face.
?(!sa_ren_took) ren: {師匠|ししょう} の {余白|よはく} は 、 {顔|かお} を {知|し}らなくて も 、 {声|こえ} が {聞|き}こえる {字|じ} でした 。 || My teacher's margins were written so you could hear the voice, even without knowing the face.
ren: わたし たち も 、 {一枚|いちまい} {書|か}きません か 。 {書|か}かれて いない {道|みち} で 、 {実際|じっさい} に {見|み}た こと から 。 || Shall we write one too? From something we actually see on an unwritten road.
?(bond>=trusted) ren[smirk]: {方角|ほうがく} の {記述|きじゅつ} は 、 あなた に お{願|ねが}い します 。 {念|ねん} の ため 。 || Directions I'll leave to you. Just to be safe.
ren: {確|たし}か な こと を {書|か}く か 。 それとも 、 {分|わ}からない こと を 、 {分|わ}からない と {正直|しょうじき} に {書|か}く か 。 || Do we write down something certain? Or write down something we don't know, and say honestly that we don't?
!hook pages_choose theme
!if pages.pick=later -> rlater
?(pages.pick=sure) ren: {確|たし}か な こと 。 …… {方角|ほうがく} {以外|いがい} で 、 {探|さが}しましょう 。 || Something certain. …We'll look for one that isn't about directions.
?(pages.pick=unsure) ren[smile]: {分|わ}からない こと を {分|わ}からない と {書|か}く 。 {灯守|ひもり} に は 、 {一番|いちばん} {難|むずか}しい {仕事|しごと} です 。 {好|す}き です 。 || Writing what we don't know as not known. The hardest job a lantern keeper has. I like it.
ren: {次|つぎ} の {道|みち} で 、 {書|か}き{留|と}める もの を {一|ひと}つ {見|み}つけましょう 。 {野営|やえい} の {時|とき} に 、 {相談|そうだん} を 。 || On the next road, let's find one thing worth writing down. We can talk it over at camp.
!end
:rlater
ren: {承知|しょうち} しました 。 {余白|よはく} は 、 {逃|に}げません 。 || Understood. The margins aren't going anywhere.
!end
:suzu
suzu: ねえ 、 {芝居|しばい} に は {大|おお}きな {場面|ばめん} の {間|あいだ} に 、 {小|ちい}さな {場面|ばめん} が ある の 。 {誰|だれ} も {書|か}き{残|のこ}さない やつ 。 || You know, in a play there are small scenes between the big ones. The ones nobody ever writes down.
suzu: {書|か}かれて いない {道|みち} で 、 そういう {場面|ばめん} を {一|ひと}つ {拾|ひろ}って こない ？ {本当|ほんとう} に あった こと だけ 。 {嘘|うそ} は {一|ひと}つ も なし 。 || How about we bring one of those back from an unwritten road? Only something that really happens. Not a single lie.
?(bond>=trusted) suzu[smile]: {相方|あいかた} が あなた なら 、 {台本|だいほん} なし でも {怖|こわ}くない し 。 || With you as my partner, even no script isn't scary.
suzu: {笑|わら}える {場面|ばめん} に する か 、 {静|しず}か な {場面|ばめん} に する か 。 あなた は {演|えん}じなくて いい から ね 。 || A funny scene, or a quiet one? And you don't have to act in it.
!hook pages_choose theme
!if pages.pick=later -> slater
?(pages.pick=funny) suzu[laugh]: {笑|わら}える {方|ほう} ！ {台本|だいほん} なし で {笑|わら}える の が 、 {一番|いちばん} {難|むずか}しい の よ 。 || Funny it is! Getting a laugh without a script is the hardest thing there is.
?(pages.pick=quiet) suzu[smile]: {静|しず}か な {方|ほう} 。 …… {舞台|ぶたい} で は いつも {削|けず}られる ところ 。 {今度|こんど} は 、 {残|のこ}そう 。 || The quiet one. …The bit that always gets cut on stage. This time we keep it.
suzu: {次|つぎ} の {道|みち} で {何|なに}か {起|お}きたら 、 {焚|た}き{火|び} の {前|まえ} で {話|はな}そう 。 {帳簿|ちょうぼ} は わたし が つける 。 || If something happens on the next road, let's talk it over by the fire. I'll keep the books.
!end
:slater
suzu: {了解|りょうかい} 。 {開演|かいえん} {時間|じかん} は 、 {未定|みてい} で 。 || Understood. Curtain time: to be announced.
!end

# ---- Page II: A Moment Worth Keeping ------------------------------------------------------------
# the companion connects the recorded event to the theme and asks what to keep
@scene pages.p2q
?(comp=nao&pages.theme=next) nao: {次|つぎ} に ここ を {歩|ある}く {誰|だれ}か に 、 {何|なに} を {残|のこ}す ？ {正解|せいかい} じゃ なくて 、 {役|やく} に {立|た}つ こと を 。 || What do we leave for whoever walks there next? Not the right answer — something useful.
?(comp=nao&pages.theme=back) nao: {帰|かえ}り{道|みち} の {一言|ひとこと} に する なら 、 あの {道|みち} の どこ を {書|か}く ？ || If it's a line for the way back, which part of that road goes in?
?(comp=mio&pages.theme=pause&pages.at=camp) mio: {今|いま} 、 こうして {座|すわ}って いて も 、 {落|お}ち{着|つ}かない {感|かん}じ が しない の 。 どうして だろう ね 。 || Sitting here like this, I don't feel restless at all. I wonder why.
?(comp=mio&pages.theme=pause&pages.at=home) mio: あの {道|みち} で 、 {休|やす}む の が {怖|こわ}くなかった の は 、 どうして だった と {思|おも}う ？ || On that road, why do you think resting didn't feel frightening?
?(comp=mio&pages.theme=share) mio: {一人|ひとり} で {全部|ぜんぶ} やろう と しなくて {済|す}んだ の は 、 {何|なに} が {良|よ}かった の かな 。 || What was it that meant I didn't have to try to do everything myself?
?(comp=ren&pages.theme=sure) ren: {確|たし}か な こと を {一|ひと}つ {書|か}く なら 、 {何|なに} に します か 。 {方角|ほうがく} {以外|いがい} で 。 || If we write down one certain thing, what shall it be? Apart from directions.
?(comp=ren&pages.theme=unsure) ren: {分|わ}からない こと を {分|わ}からない と {書|か}く なら 、 {何|なに} を {書|か}きます か 。 {候補|こうほ} は {山|やま} ほど あります が 。 || If we write down something we don't know, what shall it be? There are plenty of candidates.
?(comp=suzu&pages.theme=funny) suzu: {笑|わら}える {場面|ばめん} に する なら 、 どこ を {切|き}り{取|と}る ？ {脚色|きゃくしょく} は なし で 。 || If it's a funny scene, which bit do we cut out? No embellishing.
?(comp=suzu&pages.theme=quiet) suzu: {静|しず}か な {場面|ばめん} に する なら 、 どこ を {残|のこ}す ？ {拍手|はくしゅ} の {来|こ}ない ところ を 。 || If it's a quiet scene, what do we keep? The part where no applause comes.

# the companion answers what the player chose to keep (values, not claims about the player)
@scene pages.p2r
?(comp=nao&pages.aspect=read) nao: {確|たし}かめて から 、 {動|うご}く 。 {急|いそ}ぐ {奴|やつ} ほど 、 それ を {忘|わす}れる 。 {書|か}いて おこう 。 || Check first, then move. The ones in a hurry always forget that. Let's write it down.
?(comp=nao&pages.aspect=decide) nao[smile]: {決|き}める の は 、 {歩|ある}く {二人|ふたり} 。 {道|みち} を {知|し}ってる {奴|やつ} が {決|き}める んじゃ ない 。 …… いい {札|ふだ} に なる 。 || The two who walk it decide. Not whoever happens to know the road. …That'll make a good card.
?(comp=nao&pages.aspect=home) nao: {帰|かえ}り{道|みち} が {見|み}える と 、 {先|さき} へ も {行|い}ける 。 {配達人|はいたつにん} の {基本|きほん} だ 。 || When you can see the way home, you can go further. Courier basics.
?(comp=mio&pages.aspect=stop) mio: {止|と}まる の も 、 {道|みち} の うち 。 {薬|くすり} の {帳面|ちょうめん} に は {書|か}けない こと ね 。 || Stopping is part of the road too. Not something you can write in a remedy book.
?(comp=mio&pages.aspect=turns) mio: {交代|こうたい} で やる と 、 どっち も {倒|たお}れない 。 {当|あ}たり{前|まえ} の こと ほど 、 {書|か}いて おかない と {忘|わす}れちゃう の よ 。 || Take turns, and neither of you falls over. The more obvious a thing is, the more you need to write it down or you forget.
?(comp=mio&pages.aspect=enough) mio: 「 {今日|きょう} は ここ まで 」 って {言|い}える の は 、 {弱|よわ}さ じゃ ない 。 …… {自分|じぶん} に {言|い}い{聞|き}かせてる の 。 || Being able to say "that's enough for today" isn't weakness. …I'm telling myself, too.
?(comp=ren&pages.aspect=known) ren: {確|たし}か な こと は 、 {短|みじか}く {書|か}く に {限|かぎ}ります 。 {長|なが}く {書|か}く と 、 {確|たし}か じゃ なく なる 。 || Certain things are best written short. Write them long and they stop being certain.
?(comp=ren&pages.aspect=unknown) ren: {分|わ}からない 、 と {書|か}いて おけば 、 {次|つぎ} の {人|ひと} が {続|つづ}き を {書|か}けます 。 {余白|よはく} は 、 その ため に ある 。 || Write "not known", and the next person can write what comes after. That's what margins are for.
?(comp=ren&pages.aspect=way) ren[smirk]: …… {方角|ほうがく} は 、 {全部|ぜんぶ} あなた が {選|えら}びました 。 {余白|よはく} に {書|か}いて おきます 。 「 {道案内|みちあんない} ： わたし で は ない 」 。 || …You chose every direction. I'll note it in the margin: "Navigator: not me."
?(comp=suzu&pages.aspect=asis) suzu: {起|お}きた まま に 。 {脚色|きゃくしょく} なし 。 …… わたし に は 、 {一番|いちばん} {難|むずか}しい {注文|ちゅうもん} ね 。 || Just as it happened. No embellishment. …The hardest order you could give me.
?(comp=suzu&pages.aspect=pause) suzu: {間|ま} を {残|のこ}す 。 {分|わ}かってる じゃない 。 {間|ま} の ない {芝居|しばい} は 、 {息|いき} が できない の 。 || Leave the pause in. You know your stuff. A play with no pauses can't breathe.
?(comp=suzu&pages.aspect=watch) suzu[smile]: {見|み}て いた だけ の ところ 。 …… {客席|きゃくせき} から の {場面|ばめん} ね 。 {演|えん}じなくて いい 。 それ で {十分|じゅうぶん} 。 || The part where you only watched. …A scene from the audience's side. No acting needed. That's plenty.

@scene pages.camp
!hook pages_event camp
!call pages.p2q
!hook pages_choose aspect camp
!if pages.pick=later -> later
!call pages.p2r
?(comp=nao) nao: {清書|せいしょ} は 、 {帰|かえ}って から 。 {折|お}り{方|かた} も {決|き}めよう 。 || We'll write it out properly back home. Decide how to fold it, too.
?(comp=mio) mio: {絵|え} は 、 {帰|かえ}って から {描|か}く ね 。 お{茶|ちゃ} を {淹|い}れ ながら 。 || I'll draw it when we're home. While the tea brews.
?(comp=ren) ren: {清書|せいしょ} は {灯|あか}り{堂|どう} で 。 {余白|よはく} に は 、 {二人|ふたり} で {書|か}き{込|こ}みましょう 。 || We'll make the fair copy in the Lantern Hall. And both write in the margin.
?(comp=suzu) suzu: {番付|ばんづけ} は {帰|かえ}って から {描|か}く 。 {絵|え} は わたし 、 {題|だい} は あなた 。 || I'll draw the programme back home. Pictures by me, title by you.
!end
:later
?(comp=nao) nao: {分|わ}かった 。 {家|いえ} で {話|はな}そう 。 {覚|おぼ}えて おく 。 || Right. We'll talk at home. I'll remember.
?(comp=mio) mio: うん 。 {急|いそ}がない 。 {帰|かえ}って から に しよう 。 || Mm. No hurry. Let's leave it till we're home.
?(comp=ren) ren: {承知|しょうち} しました 。 {帰|かえ}って から 、 {改|あらた}めて 。 || Understood. Once we're home, then.
?(comp=suzu) suzu: {了解|りょうかい} 。 {続|つづ}き は {家|いえ} で 。 || Got it. To be continued at home.

# ---- coming home ------------------------------------------------------------------------------------
# honest words for how the outing ended (early return: a real decision; defeat: the road sent us home)
@scene pages.p2ret
?(comp=nao&pages.ret=complete) nao: {最後|さいご} まで {歩|ある}いた {道|みち} だ 。 {書|か}く こと は {多|おお}い けど 、 {一|ひと}つ に {絞|しぼ}ろう 。 || We walked that one to the end. Plenty to write about, but let's pick just one.
?(comp=nao&pages.ret=early) nao: {途中|とちゅう} で {引|ひ}き{返|かえ}した けど 、 あれ は {本当|ほんとう} に あった こと だ 。 || We turned back partway, but that really happened.
?(comp=nao&pages.ret=defeat) nao: {道|みち} に {追|お}い{返|かえ}された 。 それ でも 、 あそこ まで は {二人|ふたり} で {行|い}った 。 || The road threw us back. Even so, we got that far together.
?(comp=nao&pages.ret=folded) nao: {道|みち} ごと {消|き}えちゃった 。 でも 、 {覚|おぼ}えてる こと は {消|き}えない 。 || The whole road vanished on us. What we remember doesn't.
?(comp=mio&pages.ret=complete) mio: {最後|さいご} まで {行|い}けた {道|みち} ね 。 {帰|かえ}って {来|こ}られて 、 よかった 。 || A road we got to the end of. I'm glad we came home.
?(comp=mio&pages.ret=early) mio: {途中|とちゅう} で {帰|かえ}って きた {道|みち} 。 {引|ひ}き{返|かえ}す って {決|き}められた の も 、 {書|か}いて いい こと よ 。 || A road we came back from partway. Being able to decide to turn back is worth writing down too.
?(comp=mio&pages.ret=defeat) mio: {道|みち} に {帰|かえ}された けど 、 {二人|ふたり} とも ここ に いる 。 それ が {一番|いちばん} 。 || The road sent us back, but we're both here. That's what matters most.
?(comp=mio&pages.ret=folded) mio: {道|みち} は {消|き}えちゃった けど 、 {覚|おぼ}えて いる こと は {消|き}えない の 。 || The road's gone, but what we remember isn't.
?(comp=ren&pages.ret=complete) ren: {道|みち} の {終|お}わり まで 、 {記録|きろく} が {続|つづ}いた {道|みち} です 。 || A road whose record runs all the way to its end.
?(comp=ren&pages.ret=early) ren: {途中|とちゅう} で {引|ひ}き{返|かえ}した {道|みち} です が 、 {記録|きろく} と して は {完全|かんぜん} です 。 {帰|かえ}り{道|みち} も 、 {道|みち} です から 。 || We turned back partway, but as a record it's complete. The way home is a road too.
?(comp=ren&pages.ret=defeat) ren: {道|みち} に {折|お}り{畳|たた}まれて 、 {帰|かえ}って きました 。 {正直|しょうじき} に {書|か}きます 。 その {前|まえ} に あった こと も 、 {正直|しょうじき} に 。 || The road folded us up and sent us back. I'll write that honestly. And what happened before it, just as honestly.
?(comp=ren&pages.ret=folded) ren: {道|みち} そのもの が {見|み}つからなく なりました 。 {記録|きろく} だけ は 、 {残|のこ}って います 。 || The road itself can't be found any more. Only the record remains.
?(comp=suzu&pages.ret=complete) suzu: {千秋楽|せんしゅうらく} まで {行|い}った {道|みち} ね 。 || A road that ran all the way to closing night.
?(comp=suzu&pages.ret=early) suzu: {途中|とちゅう} で {幕|まく} を {下|お}ろした {道|みち} 。 でも 、 {幕間|まくあい} は ちゃんと あった 。 || A road where we brought the curtain down early. But there was a proper interval.
?(comp=suzu&pages.ret=defeat) suzu: {公演|こうえん} {中止|ちゅうし} に なった {道|みち} 。 でも 、 {中止|ちゅうし} の {前|まえ} の {場面|ばめん} は 、 {本物|ほんもの} だった 。 || A road where the show was cancelled. But the scenes before that were real.
?(comp=suzu&pages.ret=folded) suzu: {劇場|げきじょう} ごと {消|き}えちゃった 。 {番付|ばんづけ} だけ は {残|のこ}せる 。 || The whole theatre vanished. We can still keep the programme.

@scene pages.home2
!hook pages_event home
!call pages.p2ret
!call pages.p2q
!hook pages_choose aspect home
!if pages.pick=later -> later
!call pages.p2r
!call pages.ask3
!end
:later
?(comp=nao) nao: {分|わ}かった 。 {札|ふだ} は {逃|に}げない 。 || Right. The card's not going anywhere.
?(comp=mio) mio: また {今度|こんど} 。 {頁|ページ} は 、 {待|ま}って て くれる から 。 || Another time. The page will wait for us.
?(comp=ren) ren: {承知|しょうち} しました 。 {余白|よはく} は 、 {空|あ}けて おきます 。 || Understood. I'll keep the margin clear.
?(comp=suzu) suzu: {了解|りょうかい} 。 {幕間|まくあい} を {延|の}ばそう 。 || Got it. Let's make the interval longer.

@scene pages.ask3
?(comp=nao) nao: …… {札|ふだ} 、 {今|いま} {仕上|しあ}げる か ？ || …Shall we finish the card now?
?(comp=mio) mio: …… {頁|ページ} 、 {今|いま} {仕上|しあ}げて しまう ？ || …Shall we finish the page now?
?(comp=ren) ren: …… {頁|ページ} の {清書|せいしょ} 、 {今|いま} {始|はじ}めます か 。 || …Shall we start the fair copy now?
?(comp=suzu) suzu: …… {番付|ばんづけ} 、 {今|いま} {仕上|しあ}げちゃう ？ || …Shall we finish the programme now?
!choice
* {今|いま} {仕上|しあ}げよう || Let's finish it now -> now
* また {今度|こんど} || Another time -> later
:later
?(comp=nao) nao: いつ でも いい 。 {灯|あか}り{堂|どう} で {声|こえ} を かけて くれ 。 || Whenever. Just say so in the Lantern Hall.
?(comp=mio) mio: うん 。 {灯|あか}り{堂|どう} で {声|こえ} を かけて ね 。 || Mm. Just say so in the Lantern Hall.
?(comp=ren) ren: では 、 {灯|あか}り{堂|どう} で 。 {声|こえ} を かけて ください 。 || The Lantern Hall, then. Just say the word.
?(comp=suzu) suzu: {灯|あか}り{堂|どう} で {声|こえ} を かけて 。 {楽屋|がくや} で {待|ま}ってる 。 || Call me in the Lantern Hall. I'll be waiting in the dressing room.
!end
:now
!call pages.home3

# ---- Page III: Put It Somewhere Real ------------------------------------------------------------
@scene pages.home3
!if pages.where=home -> made
?(comp=nao&pages.ret=complete) nao: {最後|さいご} まで {歩|ある}いて 、 {帰|かえ}って きた 。 {札|ふだ} に する の に 、 ちょうど いい {日|ひ} だ 。 || We walked it to the end and came home. Just the right day for a card.
?(comp=nao&pages.ret=early) nao: {途中|とちゅう} で {引|ひ}き{返|かえ}した {道|みち} の {札|ふだ} だ 。 {引|ひ}き{返|かえ}す の も 、 {帰|かえ}り{方|かた} の うち 。 || It's a card from a road we turned back on. Turning back is one way of getting home.
?(comp=nao&pages.ret=defeat|comp=nao&pages.ret=folded) nao: {途中|とちゅう} で {終|お}わった {道|みち} でも 、 {札|ふだ} は {作|つく}れる 。 {嘘|うそ} は {書|か}かない 。 {道|みち} に {帰|かえ}された 、 と {書|か}く 。 || A road that ended partway can still make a card. We won't write anything untrue. We'll write that the road sent us back.
?(comp=mio&pages.ret=complete) mio: {最後|さいご} まで {行|い}って 、 {帰|かえ}って {来|こ}られた 。 まず 、 {座|すわ}ろう 。 || We went all the way and came home. First, let's sit down.
?(comp=mio&pages.ret=early) mio: {途中|とちゅう} で {帰|かえ}って きた {日|ひ} の {札|ふだ} 。 {引|ひ}き{返|かえ}す の も 、 {休|やす}み の {一種|いっしゅ} よ 。 || A card from a day we came back early. Turning back is a kind of rest too.
?(comp=mio&pages.ret=defeat|comp=mio&pages.ret=folded) mio: {最後|さいご} まで は {行|い}けなかった 。 でも 、 {二人|ふたり} とも ここ に いる 。 {札|ふだ} に は 、 {本当|ほんとう} の こと だけ {書|か}こう 。 || We didn't make it to the end. But we're both here. Let's put only what's true on the card.
?(comp=ren&pages.ret=complete) ren: {道|みち} の {終|お}わり まで の {記録|きろく} です 。 {頁|ページ} に {清書|せいしょ} しましょう 。 || A record all the way to the road's end. Let's make the fair copy.
?(comp=ren&pages.ret=early) ren: {途中|とちゅう} で {引|ひ}き{返|かえ}した {記録|きろく} です 。 {引|ひ}き{返|かえ}した 、 と {書|か}く の も 、 {正確|せいかく} さ の うち です 。 || A record of turning back partway. Writing "we turned back" is part of being accurate.
?(comp=ren&pages.ret=defeat|comp=ren&pages.ret=folded) ren: {道|みち} に {帰|かえ}された 、 と {正直|しょうじき} に {書|か}きます 。 その {前|まえ} に あった こと も 、 {同|おな}じ {正直|しょうじき} さ で 。 || I'll write honestly that the road sent us home. And what happened before it, just as honestly.
?(comp=suzu&pages.ret=complete) suzu: {千秋楽|せんしゅうらく} まで {演|えん}じきった {道|みち} ね 。 {番付|ばんづけ} に しよう 。 || A road we played all the way to closing night. Let's make the programme.
?(comp=suzu&pages.ret=early) suzu: {途中|とちゅう} で {幕|まく} を {下|お}ろした {日|ひ} の {番付|ばんづけ} 。 {幕間|まくあい} は 、 ちゃんと あった から 。 || A programme from a day we brought the curtain down early. There was a proper interval, after all.
?(comp=suzu&pages.ret=defeat|comp=suzu&pages.ret=folded) suzu: {公演|こうえん} は {途中|とちゅう} で {中止|ちゅうし} 。 でも 、 {中止|ちゅうし} の {前|まえ} の {場面|ばめん} は {本物|ほんもの} 。 {番付|ばんづけ} に は 、 そう {書|か}く 。 || The show was stopped partway. But the scene before that was real. That's what the programme will say.
:made
!if comp=nao -> nao
!if comp=mio -> mio
!if comp=ren -> ren
!if comp=suzu -> suzu
!end
:nao
narr: ナオ は {厚|あつ}い {紙|かみ} を {出|だ}して 、 {道|みち} の {線|せん} を {引|ひ}き 、 {半分|はんぶん} に {折|お}った 。 {宛名|あてな} の {欄|らん} は 、 {空|あ}けて ある 。 || Nao takes out a sheet of stiff paper, draws the line of the road, and folds it in half. The address space is left blank.
nao: {誰|だれ} に {届|とど}く か は 、 {読|よ}む {人|ひと} が {決|き}める 。 {表|おもて} の {一言|ひとこと} だけ 、 $name が {選|えら}んで くれ 。 || Who it's for is up to whoever reads it. You choose just the line for the front.
!hook pages_choose caption
!if pages.pick=later -> nlater
nao[smile]: いい {札|ふだ} だ 。 {灯|あか}り{堂|どう} の {壁|かべ} に {貼|は}って おこう 。 {次|つぎ} に {出|で}る {誰|だれ}か の {目|め} に も {入|はい}る 。 || Good card. Let's pin it on the Lantern Hall wall. Whoever heads out next will see it.
narr: {札|ふだ} が {灯|あか}り{堂|どう} の {壁|かべ} に {留|と}められた 。 {同|おな}じ {札|ふだ} を もう {一枚|いちまい} {折|お}って 、 ナオ は $name に {渡|わた}した 。 || The card is pinned to the Lantern Hall wall. Nao folds a second one just like it and hands it to you.
?(bond>=trusted) nao[smirk]: {壁|かべ} の {分|ぶん} と 、 $name の {分|ぶん} 。 {控|ひか}え は {取|と}らない 。 …… {嘘|うそ} だ 。 {三枚目|さんまいめ} は {鞄|かばん} に {入|い}れる 。 || One for the wall, one for you. No copy for me. …That's a lie. The third goes in the bag.
nao: {札|ふだ} は {一枚|いちまい} で いい 。 {道|みち} の {話|はなし} は 、 これから も {焚|た}き{火|び} で しよう 。 || One card is enough. We'll keep talking about the road by the fire.
!end
:nlater
nao: {分|わ}かった 。 {紙|かみ} は {鞄|かばん} に {入|い}れて おく 。 || Right. I'll keep the paper in the bag.
!end
:mio
narr: ミオ は {小|ちい}さな {札|ふだ} に 、 {湯呑|ゆの}み を {二|ふた}つ {描|か}いた 。 {湯気|ゆげ} も {二|ふた}つ 。 {片方|かたほう} は {少|すこ}し {曲|ま}がって いる 。 || On a small card, Mio draws two teacups with two curls of steam. One of them is a little crooked.
mio: {文字|もじ} は あなた が {選|えら}んで 。 {絵|え} は わたし が {描|か}いた から 。 {分担|ぶんたん} ね 。 || You choose the words. I did the drawing. Division of labour.
!hook pages_choose caption
!if pages.pick=later -> mlater
mio[smile]: うん 。 それ に しよう 。 || Mm. That one.
narr: その {日|ひ} の うち に {茶屋|ちゃや} へ {寄|よ}る と 、 ハナ は {壁|かべ} の {一番|いちばん} {明|あか}るい {所|ところ} を {空|あ}けて くれた 。 {札|ふだ} は そこ に {留|と}められた 。 || That same day you stop at the teahouse, and Hana clears the brightest spot on the wall for it. The card is pinned there.
narr: ミオ は {同|おな}じ {絵|え} を もう {一枚|いちまい} {描|か}いて 、 $name に {渡|わた}した 。 {湯気|ゆげ} は 、 {今度|こんど} は {二|ふた}つ とも まっすぐ だった 。 || Mio draws the same picture once more and gives it to you. This time both curls of steam come out straight.
mio: {傷|きず} を {治|なお}す {薬|くすり} じゃ ない よ 。 {座|すわ}って いい {場所|ばしょ} の {印|しるし} 。 それ だけ 。 || It's not a remedy for anything. Just a mark for a place where it's all right to sit. That's all.
!end
:mlater
mio: いい の 。 {絵|え} は 、 {描|か}き{直|なお}せる から 。 || That's fine. I can always redraw it.
!end
:ren
narr: レン は {灯|ひ} の {頁|ページ} を {広|ひろ}げ 、 {灯籠|とうろう} を {一|ひと}つ {描|か}いた 。 {線|せん} は まっすぐ 。 {右|みぎ} の {余白|よはく} だけ が 、 {白|しろ}い まま だ 。 || Ren spreads out a lantern page and draws a single lantern. Straight lines. Only the right-hand margin stays blank.
ren: {余白|よはく} に は 、 {二人|ふたり} で {一行|いちぎょう} ずつ 。 {最初|さいしょ} の {一行|いちぎょう} を 、 {選|えら}んで ください 。 || In the margin, one line each. Choose the first line.
!hook pages_choose caption
!if pages.pick=later -> rlater
?(pages.theme=sure) narr: $name が {一行|いちぎょう} {書|か}き 、 その {下|した} に レン が {小|ちい}さく {書|か}き{足|た}した 。 「 {確認|かくにん} {済|ず}み 。 {灯守|ひもり} 」 。 || You write your line, and under it Ren adds, small: "Confirmed. — Lantern keeper."
?(pages.theme=unsure) narr: $name が {一行|いちぎょう} {書|か}き 、 その {下|した} に レン が {小|ちい}さく {書|か}き{足|た}した 。 「 {同意|どうい} 。 {灯守|ひもり} 」 。 || You write your line, and under it Ren adds, small: "Agreed. — Lantern keeper."
ren: {灯|あか}り{堂|どう} の {壁|かべ} に {貼|は}りましょう 。 {道|みち} を {変|か}える {力|ちから} は ありません が 、 {読|よ}んだ {人|ひと} の {足|あし} を 、 {少|すこ}し {軽|かる}く する かも しれません 。 || Let's pin it on the Lantern Hall wall. It has no power to change a road, but it might make a reader's steps a little lighter.
narr: {頁|ページ} が {壁|かべ} に {留|と}められた 。 レン は {写|うつ}し を もう {一枚|いちまい} {作|つく}って 、 $name に {渡|わた}した 。 {余白|よはく} の {二人|ふたり} {分|ぶん} の {字|じ} まで 、 そのまま {写|うつ}して ある 。 || The page is pinned to the wall. Ren makes one more copy and hands it to you, both hands in the margin copied exactly.
!end
:rlater
ren: {承知|しょうち} しました 。 {余白|よはく} は 、 {逃|に}げません 。 || Understood. The margin isn't going anywhere.
!end
:suzu
narr: スズ は {小|ちい}さな {番付|ばんづけ} を {描|か}いた 。 {幕|まく} と 、 {客席|きゃくせき} と 、 {二人|ふたり} {分|ぶん} の {影|かげ} 。 {題|だい} の {所|ところ} だけ 、 {空|あ}いて いる 。 || Suzu draws a little programme: a curtain, a few seats, two shadows. Only the space for the title is empty.
suzu: {題|だい} は あなた が {決|き}めて 。 わたし が {決|き}める と 、 {盛|も}りすぎる から 。 || You choose the title. If I do it, I'll overdo it.
!hook pages_choose caption
!if pages.pick=later -> slater
suzu[laugh]: {決|き}まり ！ …… で 、 {読|よ}む ？ {貼|は}る だけ ？ {見|み}てる だけ でも いい よ 。 {義務|ぎむ} は なし 。 || Decided! …So, do we read it out, or just pin it up? Just watching is fine too. No obligations.
!choice
* スズ が {読|よ}む の を {聞|き}く || Listen to Suzu read it -> listen
* {一緒|いっしょ} に {声|こえ} に {出|だ}して {読|よ}む || Read it aloud together -> both
* {貼|は}る だけ に する || Just pin it up -> pin
:listen
narr: スズ は {番付|ばんづけ} を {持|も}って 、 {小|ちい}さな {声|こえ} で {一度|いちど} だけ {読|よ}んだ 。 {舞台|ぶたい} の {声|こえ} で は なく 、 {普段|ふだん} の {声|こえ} で 。 || Suzu holds up the programme and reads it through once, quietly. Not in her stage voice — in her everyday one.
!goto pin
:both
narr: {二人|ふたり} で {声|こえ} を {揃|そろ}えて 、 {題|だい} を {読|よ}んだ 。 {少|すこ}し ずれた 。 スズ は 、 それ も {気|き} に {入|い}った らしい 。 || You read the title aloud together, slightly out of time. Suzu seems to like that too.
:pin
narr: {番付|ばんづけ} は ハナ の {茶屋|ちゃや} の {壁|かべ} に {貼|は}られた 。 スズ は {同|おな}じ もの を もう {一枚|いちまい} {描|か}いて 、 $name に {渡|わた}した 。 || The programme goes up on the wall of Hana's teahouse. Suzu draws one more just like it and gives it to you.
suzu: {上演|じょうえん} は 、 {気|き} が {向|む}いた {時|とき} だけ 。 {帳簿|ちょうぼ} に も 、 {貸|か}し は なし 。 || We only stage it when we feel like it. And there's no debt in the ledger, either.
!end
:slater
suzu: {了解|りょうかい} 。 {題|だい} {未定|みてい} の まま 、 {楽屋|がくや} に {置|お}いて おく 。 || Understood. It'll wait in the dressing room, untitled.
!end

# ---- the homecoming (called at the end of atlas.home) -------------------------------------------
@scene pages.home
!if pages.empty -> empty
!if pages.home2 -> two
!if pages.home3 -> three
!end
:empty
?(comp=nao) nao: {今日|きょう} は 、 {札|ふだ} に {書|か}く こと が {起|お}きる {前|まえ} に {戻|もど}された な 。 {札|ふだ} は {逃|に}げない 。 {道|みち} は 、 また {開|ひら}く 。 || Today we got sent back before anything happened to put on the card. The card's not going anywhere. The road will open again.
?(comp=mio) mio: {今日|きょう} の {頁|ページ} は 、 {白紙|はくし} の まま 。 それ で いい の 。 {次|つぎ} の {道|みち} が ある から 。 || Today's page stays blank. That's fine. There'll be another road.
?(comp=ren) ren: {書|か}き{留|と}める こと は 、 まだ {起|お}きて いません でした 。 {余白|よはく} は 、 {次|つぎ} の {道|みち} まで {取|と}って おきます 。 || Nothing worth recording had happened yet. I'll save the margin for the next road.
?(comp=suzu) suzu: {幕|まく} が {上|あ}がる {前|まえ} に {中止|ちゅうし} 。 {払|はら}い{戻|もど}し は なし 、 {次|つぎ} の {公演|こうえん} に {振|ふ}り{替|か}え ！ || Called off before the curtain went up. No refunds — tickets carry over to the next show!
!end
:two
?(comp=nao) nao: …… {札|ふだ} の {話|はなし} 、 {今|いま} {少|すこ}し いい か ？ || …About the card — got a minute now?
?(comp=mio) mio: …… {頁|ページ} の {話|はなし} 、 {今|いま} {少|すこ}し いい ？ お{茶|ちゃ} {淹|い}れる から 。 || …About our page — have you got a minute? I'll make tea.
?(comp=ren) ren: …… {余白|よはく} の {件|けん} 、 {今|いま} {相談|そうだん} して も いい です か 。 || …About the margin. May we talk it over now?
?(comp=suzu) suzu: …… {番付|ばんづけ} の {打|う}ち{合|あ}わせ 、 {今|いま} やる ？ || …Shall we have the programme meeting now?
!choice
* {今|いま} {話|はな}そう || Let's talk now -> talk
* また {後|あと} で || Later -> later
:talk
!call pages.home2
!end
:later
?(comp=nao) nao: いつ でも いい 。 {灯|あか}り{堂|どう} で {声|こえ} を かけて くれ 。 || Whenever. Just say so in the Lantern Hall.
?(comp=mio) mio: うん 。 {灯|あか}り{堂|どう} で {声|こえ} を かけて ね 。 || Mm. Just say so in the Lantern Hall.
?(comp=ren) ren: では 、 {灯|あか}り{堂|どう} で 。 {声|こえ} を かけて ください 。 || The Lantern Hall, then. Just say the word.
?(comp=suzu) suzu: {灯|あか}り{堂|どう} で {声|こえ} を かけて 。 {楽屋|がくや} で {待|ま}ってる 。 || Call me in the Lantern Hall. I'll be waiting in the dressing room.
!end
:three
!call pages.ask3

# ---- the finished page, pinned up -----------------------------------------------------------------
@scene pages.display
!hook pages_display
`, 'pages/project');

(function () {
  'use strict';
  const J = (jp, en) => ({ jp, en });
  // What the pinned page shows when you look at it (its caption was chosen by you).
  const SHOW = {
    nao: { narr: (c) => J('{壁|かべ} に 、 {折|お}り{畳|たた}んだ {道順|みちじゅん} の {札|ふだ} が {留|と}めて ある 。 {表|おもて} に は ナオ の {字|じ} で 「 ' + c.jp + ' 」 。', 'A folded route card is pinned to the wall. On the front, in Nao\'s hand: "' + c.en + '"'),
      inside: (t) => J('{中|なか} に は {道|みち} の {線|せん} と 、 「 ' + t.jp + ' 」 の こと 。', 'Inside: the line of the road, and a note about "' + t.en + '".'),
      say: J('{読|よ}んだ {誰|だれ}か が 、 {自分|じぶん} で {決|き}めて {歩|ある}けば いい 。', 'I hope whoever reads it decides for themselves.') },
    mio: { narr: (c) => J('{壁|かべ} に 、 {湯呑|ゆの}み を {二|ふた}つ {描|か}いた {小|ちい}さな {札|ふだ} 。 「 ' + c.jp + ' 」 と {書|か}いて ある 。', 'On the wall, a small card with two teacups drawn on it. It says: "' + c.en + '"'),
      inside: (t) => J('{隅|すみ} に {小|ちい}さく 、 「 ' + t.jp + ' 」 。', 'In the corner, small: "' + t.en + '".'),
      say: J('{見|み}る と 、 {少|すこ}し {座|すわ}りたく なる でしょ 。', 'Looking at it makes you want to sit down a moment, doesn\'t it.') },
    ren: { narr: (c) => J('{壁|かべ} に 、 {灯籠|とうろう} の {頁|ページ} が {一枚|いちまい} 。 {余白|よはく} に 「 ' + c.jp + ' 」 。 {下|した} に 、 {灯守|ひもり} の {小|ちい}さな {字|じ} 。', 'On the wall, a page with a lantern drawn on it. In the margin: "' + c.en + '" And under that, a lantern keeper\'s small handwriting.'),
      inside: (t) => J('{頁|ページ} の {題|だい} は 「 ' + t.jp + ' 」 。', 'The page is headed "' + t.en + '".'),
      say: J('{字|じ} が {二人|ふたり} {分|ぶん} ある {頁|ページ} は 、 {珍|めずら}しい の です よ 。', 'A page with two people\'s handwriting is a rare thing, you know.') },
    suzu: { narr: (c) => J('{壁|かべ} に 、 {小|ちい}さな {番付|ばんづけ} 。 {演目|えんもく} は 「 ' + c.jp + ' 」 。 {出演|しゅつえん} 、 {二人|ふたり} 。', 'On the wall, a little programme. Title: "' + c.en + '" Cast: two.'),
      inside: (t) => J('{場面|ばめん} の {説明|せつめい} に は 、 「 ' + t.jp + ' 」 。', 'The scene is described as "' + t.en + '".'),
      say: J('{上演|じょうえん} は 、 {気|き} が {向|む}いた {時|とき} に ね 。', 'We stage it whenever we feel like it.') },
  };
  RB.hooks.pages_display = async () => {
    const s = RB.game.s, p = RB.pages.state(s);
    if (!p || p.stage < 3) return;
    const c = s.comp, S = SHOW[c];
    const cap = RB.pages.PROJECT[c].captions[p.theme][p.caption];
    await RB.ui.dialogue.say({ who: 'narr', jp: S.narr(cap).jp, en: S.narr(cap).en });
    if (p.ev) await RB.ui.dialogue.say({ who: 'narr', jp: S.inside(p.ev.title).jp, en: S.inside(p.ev.title).en });
    await RB.ui.dialogue.say({ who: c, expr: 'smile', jp: S.say.jp, en: S.say.en });
  };
  RB.pages.SHOW = SHOW;
})();
