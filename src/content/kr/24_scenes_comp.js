/* The Keepers' Road, Chapter 7: the companions' evening (expansion P10; plan 14_COMPANIONS §2–§4; sealed S14; C16 and
 * C-59: a quarrel always ends in making up, and never costs Bond).
 *   Ren (the crossroads, the night apart, the unfinished matter): Hisae offers Ren the road's keepership. Ren goes up
 *     the ridge alone, "keeper's business". The registers named the Ridge Light: as an apprentice Ren was sent to
 *     relight it, got lost, and never reached it; it went dark, and a traveller lost the way that night (found safe,
 *     years later, Hisae remembers). The player spends the evening at the lodge, then finds Ren at the dark lamp; Ren
 *     relights it by its name, explains, apologises to Hisae, and chooses to finish the road with the player first.
 *     Ren's teacher's story stays with Ren's own quest (S2): Hisae says nothing of the teacher.
 *   Nao (pressure): Sakichi's name in the registers, a courier who once carried the keepers' post. Nao goes quiet,
 *     snaps when asked, and makes up.
 *   Mio (pressure): Hisae's health, which she cannot stop tending though Hisae won't have it. Mio snaps, then makes up.
 *   Suzu (pressure): Koume's letter, still unanswered. Kikyō asks after her troupe; Suzu jokes it away too sharply,
 *     then makes up.
 * The player answers each apology in their own words (chosen); every answer is accepted, and the story says how it
 * lands (a stiff 申し訳ありません to a friend gets a laugh, never a penalty). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene kr.evening
# The evening at the lodge after the cave (onEnter, at night).
!set kr_evening_seen
# (RBN-QA-062) the gathering is shown, not only told: whoever is at the lodge tonight is already round Hisae's lamp, and
# stays there for the rest of the visit; you and your companion walk to it before the line
!walkto kr_mokichi 18 9 right now stay
!walkto kr_sora 19 10 up now stay
?(kr_kikyo_lodge) !walkto kr_kikyo 22 9 left now stay
!walkto pc 20 7 down party max=12000
narr: {宿坊|しゅくぼう} の {上|うえ} に 、 {星|ほし} が {出|で}て いる 。 ヒサエ の {灯|ひ} の まわり に 、 モキチ の {家族|かぞく} と キキョウ が {集|あつ}まって いる 。 || Stars over the lodge. Mokichi's family and Kikyō have gathered round Hisae's lamp.
?(comp=ren) !call kr.ren_evening
?(comp=nao) !call kr.nao_evening
?(comp=mio) !call kr.mio_evening
?(comp=suzu) !call kr.suzu_evening

@scene kr.nao_registers
comp[closed]: …… {記録|きろく} の {端|はし} に 、 {郵便|ゆうびん} の {係|かかり} の {名前|なまえ} が ある 。 {飛脚|ひきゃく} だ 。 || …In the margin of the register, the names of those who carried the post. Couriers.
narr: {頁|ページ} の {隅|すみ} に 、 「{飛脚|ひきゃく} サキチ 、 {灯守|ひもり} の {文|ふみ} を {運|はこ}ぶ」 と ある 。 ナオ の {指|ゆび} が 、 そこ で {止|と}まった 。 || In the corner of the page: "The courier Sakichi carries the keepers' letters". Nao's finger stops there.
comp: …… {何|なん} でも ない 。 {次|つぎ} 、 {行|い}こう 。 || …It's nothing. Let's go on.
!set kr_nao_sakichi

@scene kr.ren_registers
comp[surprise]: …… {尾根|おね} の {灯|ひ} 。 {横|よこ} に 、 {小|ちい}さく {書|か}いて あります 。 || …The Ridge Light. There's something written small beside it.
narr: 「{尾根|おね} の {灯|ひ} 。 {見習|みなら}い 、 {来|き}たらず 。 {灯|ひ} {消|き}ゆ 。 {旅人|たびびと} {一人|ひとり} 、 {道|みち} に {迷|まよ}う 。」 || "The Ridge Light. The apprentice did not come. The lamp went out. A traveller lost the way."
comp[closed]: …… {私|わたし} です 。 {見習|みなら}い の {時|とき} に 、 {一人|ひとり} で この {灯|ひ} を {点|つ}け に {来|く}る はず でした 。 || …That was me. As an apprentice, I was supposed to come and light this lamp on my own.
comp: {道|みち} に {迷|まよ}って 、 {着|つ}けなかった 。 …… {今|いま} まで 、 {誰|だれ} に も {言|い}えなかった こと です 。 || I got lost, and never reached it. …I've never been able to tell anyone.
!set kr_ren_lamp_known

@scene kr.ren_evening
# Ren's crossroads begins: Hisae's offer, made by her lamp; Ren goes up the ridge alone (and is gone from your side
# there and then: RBN-QA-066).
kr_hisae: レン 。 あんた に {話|はなし} が ある 。 || Ren. I've something to say to you.
kr_hisae: この {道|みち} の {灯守|ひもり} を 、 {継|つ}がない かい 。 {宿坊|しゅくぼう} も 、 {記録|きろく} も 、 {灯|ひ} も 、 {全部|ぜんぶ} あんた の もの に なる 。 || Will you take on the keepership of this road? The lodge, the registers, the lamps: all of it would be yours.
comp[surprise]: …… わたし が 、 ですか 。 || …Me?
kr_hisae: {芯|しん} を {整|ととの}える {手|て} を {見|み}た 。 {迷|まよ}う {子|こ} だった が 、 {灯|ひ} の {前|まえ} じゃ {迷|まよ}わない 。 || I've seen your hands trim a wick. You were a child who got lost, but you don't get lost in front of a lamp.
comp[closed]: …… {少|すこ}し 、 {灯守|ひもり} の {用事|ようじ} が あります 。 {一人|ひとり} で {行|い}かせて ください 。 || …I have some keeper's business. Please let me go on my own.
comp: {先|さき} に {休|やす}んで いて ください 。 {心配|しんぱい} は いりません 。 || Go and rest. There's no need to worry.
narr: レン は {灯|ひ} を {一|ひと}つ {持|も}って 、 {尾根|おね} の {方|ほう} へ {歩|ある}いて いった 。 || Ren takes a lamp and walks off towards the ridge.
!set kr_apart
!refresh comp
!journal レン が 、 {一人|ひとり} で {尾根|おね} へ {行|い}った 。 「{灯守|ひもり} の {用事|ようじ}」 だ と いう 。 {宿坊|しゅくぼう} で {夜|よる} を {過|す}ごして から 、 {探|さが}し に {行|い}こう 。 || Ren has gone up to the ridge alone: "keeper's business", they said. Spend the evening at the lodge, then go and find them.

@scene kr.nao_evening
# Nao's pressure: Sakichi's name. A small quarrel, and making up (C16).
comp: …… 。 || ……
narr: ナオ は {灯|ひ} の そば に {座|すわ}って 、 {鞄|かばん} の {底|そこ} の {束|たば} を 、 {触|さわ}って は {離|はな}して いる 。 || Nao sits by the lamp, touching the bundle at the bottom of their satchel and letting it go again.
!choice
* サキチ って 、 {知|し}って いる {人|ひと} ？ || Is Sakichi someone you know? -> ask
* {何|なに} も {聞|き}かない 。 || Don't ask. -> quiet
:ask
comp[angry]: …… {関係|かんけい} ない だろ 。 {飛脚|ひきゃく} の {名前|なまえ} なんて 、 どこ に でも ある 。 || …That's none of your business. Couriers' names turn up everywhere.
narr: ナオ は {立|た}ち{上|あ}がって 、 {灯|ひ} の {外|そと} の {暗|くら}がり へ {行|い}って しまった 。 || Nao gets up and walks off into the dark beyond the lamplight.
!set kr_quarrel
!refresh comp
!goto end
:quiet
narr: {何|なに} も {聞|き}かず に 、 {隣|となり} に {座|すわ}って いた 。 しばらく して 、 ナオ が {小|ちい}さく {言|い}った 。 「…… {聞|き}かない の か 。」 || You sit beside Nao and ask nothing. After a while Nao says quietly, "…You're not going to ask?"
comp: {聞|き}かれたら 、 {怒|おこ}った と {思|おも}う 。 …… {悪|わる}い な 。 {今|いま} は 、 まだ {言|い}えない 。 || If you'd asked, I'd have bitten your head off. …Sorry. I can't say yet.
!set kr_makeup_done
:end

@scene kr.mio_evening
# Mio's pressure: Hisae's health. Mio cannot stop tending; a small quarrel, and making up (C16).
narr: ミオ は 、 ヒサエ の {咳|せき} を {聞|き}いて から 、 {薬|くすり} を {煎|せん}じて は {持|も}って いく 。 ヒサエ は {三度|さんど} とも {断|ことわ}った 。 || Since she heard Hisae cough, Mio has been brewing medicine and taking it over. Hisae has refused it three times.
!choice
* {少|すこ}し {休|やす}んだら ？ || Why not rest a little? -> rest
* {一緒|いっしょ} に {持|も}って いこう か 。 || Shall we take it over together? -> together
:rest
comp[angry]: {休|やす}める わけ ない でしょう ！ {一人|ひとり} で {三十年|さんじゅうねん} 、 {誰|だれ} も {診|み}て くれなかった の よ ！ || How could I rest? Thirty years alone, and nobody ever looked after her!
narr: ミオ は {鍋|なべ} を {抱|かか}えて 、 ヒサエ の {小屋|こや} の {方|ほう} へ {行|い}って しまった 。 || Mio picks up the pot and goes off towards Hisae's hut.
!set kr_quarrel
!refresh comp
!goto end
:together
narr: {二人|ふたり} で {薬|くすり} を {持|も}って いく と 、 ヒサエ は {四度目|よんどめ} に やっと {受|う}け{取|と}った 。 「{二人|ふたり} がかり かい 。 {降参|こうさん} だ よ 。」 || You take the medicine over together, and on the fourth try Hisae finally accepts it. "Two of you at once? I give in."
comp[smile]: …… ありがとう 。 {一人|ひとり} で {頑張|がんば}りすぎる の 、 わたし の {悪|わる}い {癖|くせ} だ ね 。 || …Thank you. Trying too hard on my own: that's a bad habit of mine.
!set kr_makeup_done
:end

@scene kr.suzu_evening
# Suzu's pressure: Koume's letter, unanswered. A small quarrel, and making up (C16).
kr_kikyo: スズ さん 、 あなた の {一座|いちざ} は 、 {今|いま} どこ を {回|まわ}って いる の ？ || Suzu, where's your troupe playing these days?
comp[laugh]: さあ 。 {雲|くも} の {上|うえ} かも ね 。 {役者|やくしゃ} は {風|かぜ} {任|まか}せ よ 。 || Who knows? Up in the clouds, maybe. Actors go where the wind blows.
narr: {笑|わら}って いる が 、 {目|め} は {笑|わら}って いない 。 {懐|ふところ} の {手紙|てがみ} の {角|かど} が 、 {見|み}えて いる 。 || She's laughing, but her eyes aren't. The corner of the letter shows in the fold of her robe.
!choice
* コウメ さん の {手紙|てがみ} 、 まだ {返事|へんじ} して ない の ？ || Haven't you answered Koume's letter yet? -> ask
* {黙|だま}って {聞|き}いて いる 。 || Just listen. -> quiet
:ask
comp[angry]: …… {人|ひと} の {懐|ふところ} を {覗|のぞ}く の は 、 {野暮|やぼ} よ 。 {客|きゃく} は {舞台|ぶたい} を {見|み}て いれば いい の 。 || …Peering into someone's robe is bad manners. The audience should keep its eyes on the stage.
narr: スズ は {立|た}ち{上|あ}がって 、 {壊|こわ}れた {壁|かべ} の {向|む}こう へ {行|い}って しまった 。 || Suzu gets up and goes off beyond the broken wall.
!set kr_quarrel
!refresh comp
!goto end
:quiet
narr: {黙|だま}って いる と 、 スズ が {小|ちい}さく {息|いき} を {吐|は}いた 。 「…… {聞|き}かないで くれて 、 ありがとう 。 その うち 、 ちゃんと {書|か}く わ 。」 || You say nothing, and Suzu lets out a small breath. "…Thank you for not asking. I'll write back properly, one of these days."
!set kr_makeup_done
:end

@scene kr.hisae_night
# The evening at Hisae's lamp. Ren's route: Hisae tells of the offer, and of the night the Ridge Light went out.
!faceplayer
?(comp=ren) !if kr_ren_back -> vigil
?(comp=ren) kr_hisae: レン は {尾根|おね} へ {行|い}った よ 。 {尾根|おね} の {灯|ひ} の ところ さ 。 {昔|むかし} 、 {見習|みなら}い が {一人|ひとり} 、 あの {灯|ひ} に {着|つ}けなかった 。 その {夜|よる} 、 {旅人|たびびと} が {一人|ひとり} {迷|まよ}った 。 || Ren's gone up to the ridge. To the Ridge Light. Long ago an apprentice never reached that lamp. That night a traveller lost the way.
?(comp=ren) kr_hisae: {旅人|たびびと} は 、 {何年|なんねん} も {後|あと} に {無事|ぶじ} で {見|み}つかった 。 {麓|ふもと} の {茶屋|ちゃや} の {宿帳|やどちょう} に 、 {名前|なまえ} が ある 。 …… あの {子|こ} は 、 それ を {知|し}らない ん だろう ね 。 {迎|むか}え に {行|い}って おやり 。 || The traveller turned up safe, years later. Their name's in the teahouse register at the foot. …That child doesn't know, I expect. Go and fetch them.
?(comp=ren) !set kr_hisae_told_ren
?(comp=ren) !end
!if kr_makeup_done -> vigil
kr_hisae: {喧嘩|けんか} かい 。 {灯|ひ} の {前|まえ} で {喧嘩|けんか} を する と 、 {灯|ひ} が {曲|ま}がる って 、 {昔|むかし} は {言|い}った もん さ 。 {仲直|なかなお}り して おいで 。 || Had words, have you? In the old days they said quarrelling in front of a lamp makes the flame lean. Go and make it up.
!call kr.makeup
!end
:vigil
!call kr.hisae_vigil

@scene kr.makeup
# The making up: the companion comes back and apologises; the player answers in their own words (chosen). Away from
# you at the lodge since the quarrel (RBN-QA-063, the maps' followerAway), they are back at your side for it.
!if kr_makeup_done -> end
!set kr_quarrel_back
!refresh comp
?(comp=nao) comp: …… さっき は 、 {言|い}い{過|す}ぎた 。 {悪|わる}かった 。 サキチ は 、 {昔|むかし} {道|みち} を {教|おし}えて くれた {飛脚|ひきゃく} だ 。 それ だけ だ 。 {今|いま} は 。 || …I said too much back there. Sorry. Sakichi's a courier who taught me the road, long ago. That's all. For now.
?(comp=mio) comp[sad]: …… さっき は 、 ごめんなさい 。 あなた に {怒|おこ}る こと じゃ なかった 。 ヒサエ さん が 、 {昔|むかし} の {誰|だれ} か に {似|に}て いて 。 || …I'm sorry about earlier. It wasn't you I should have been angry with. Hisae reminds me of someone, from before.
?(comp=suzu) comp: …… さっき は 、 {悪|わる}かった わ 。 {野暮|やぼ} なんて 、 {言|い}う つもり じゃ なかった の 。 {手紙|てがみ} は 、 まだ {怖|こわ}くて {開|ひら}けない だけ 。 || …Sorry about earlier. I didn't mean to call you rude. It's only that I'm still too scared to answer the letter.
!choice
* いい よ 。 {気|き}に しないで 。 || It's fine. Don't worry about it. -> fine
* こっち こそ 、 ごめん 。 {聞|き}きすぎた 。 || I'm sorry too. I pried. -> mine
* {誠|まこと} に {申|もう}し{訳|わけ} ありません でした 。 || I offer my most sincere apologies. -> stiff
:fine
?(comp=nao) comp[smile]: …… そう か 。 {助|たす}かる 。 || …Right. Thanks.
?(comp=mio) comp[smile]: …… ありがとう 。 {優|やさ}しい ね 。 || …Thank you. You're kind.
?(comp=suzu) comp[smile]: …… ありがと 。 {相方|あいかた} が あなた で よかった わ 。 || …Thanks. I'm glad you're my partner.
!goto made
:mine
?(comp=nao) comp: お{互|たが}い さま だ 。 …… {仲直|なかなお}り だ な 。 || We're even. …Made up, then.
?(comp=mio) comp[smile]: ううん 、 {心配|しんぱい} して くれた ん だ もの 。 {仲直|なかなお}り 。 || No, you were worried about me. We're friends again.
?(comp=suzu) comp[laugh]: こちら こそ 。 …… ほら 、 これ で {両成敗|りょうせいばい} ね 。 || Me too. …There, that's both of us at fault, fair and square.
!goto made
:stiff
?(comp=nao) comp[laugh]: …… なん だ 、 その {謝|あやま}り{方|かた} 。 {役所|やくしょ} か 。 …… でも 、 {気持|きも}ち は {届|とど}いた 。 || …What kind of apology is that? Are you the town office? …The meaning got through, though.
?(comp=mio) comp[laugh]: ふふ 、 {堅|かた}すぎ です よ 。 {友達|ともだち} に は 、 「ごめん」 で {十分|じゅうぶん} です 。 || Heh, far too stiff. "Sorry" is plenty between friends.
?(comp=suzu) comp[laugh]: {殿様|とのさま} か ！ …… もう 、 {笑|わら}っちゃった じゃ ない 。 {仲直|なかなお}り よ 。 || Who are you, a feudal lord? …Now look, you've made me laugh. We're friends again.
:made
!set kr_makeup_done
!hook co_bond kr:makeup
:end

@scene kr.ren_lantern
# Ren's night apart, resolved at the Ridge Light (the unfinished matter); then the crossroads' answer. Its night
# sounds: bell crickets in the grass, an owl, wind in the lantern's shutters. Back together, Ren leaves the lantern
# and walks with you from there (RBN-QA-066: the ridge's Ren goes, the follower comes, beside you).
!if kr_ren_back -> end
?(!kr_hisae_told_ren) narr: レン は 、 {暗|くら}い {灯籠|とうろう} の {前|まえ} に {立|た}って いる 。 {声|こえ} を かけて いい か {迷|まよ}う 。 ヒサエ に {先|さき} に {話|はなし} を {聞|き}こう か 。 || Ren is standing before the dark lantern. You're not sure whether to call out. Perhaps talk to Hisae first.
?(!kr_hisae_told_ren) !end
!sfx crickets
ren[closed]: …… {来|き}て しまいました か 。 {灯守|ひもり} の {用事|ようじ} だ と {言|い}った のに 。 || …So you came. I did say it was keeper's business.
ren: これ が 、 {私|わたし} が {着|つ}けなかった {灯|ひ} です 。 {見習|みなら}い の {時|とき} 、 {道|みち} に {迷|まよ}って 、 {夜|よる} が {明|あ}けて しまった 。 {誰|だれ} か が 、 この {暗|くら}い {道|みち} で {迷|まよ}った と {聞|き}きました 。 || This is the lamp I never reached. As an apprentice I got lost, and the night was over before I found it. I heard someone lost their way on this dark road.
!choice
* その {旅人|たびびと} は 、 {無事|ぶじ} だった よ 。 || That traveller was found safe. -> safe
* {一緒|いっしょ} に 、 {点|つ}けよう 。 || Let's light it together. -> light
:safe
narr: ヒサエ に {聞|き}いた こと を 、 そのまま {伝|つた}えた 。 {何年|なんねん} も {後|あと} に 、 {無事|ぶじ} に {見|み}つかった こと 。 {茶屋|ちゃや} の {宿帳|やどちょう} に {名前|なまえ} が ある こと 。 || You tell Ren what Hisae told you: the traveller was found safe, years later, and their name is in the teahouse register.
ren[surprise]: …… {無事|ぶじ} 、 だった 。 || …They were safe.
ren[closed]: …… ずっと 、 {誰|だれ} に も {聞|き}けなかった ん です 。 {聞|き}いたら 、 {答|こた}え を {知|し}って しまう から 。 || …I could never ask anyone. If I asked, I'd know the answer.
:light
!sfx owl
ren: {名前|なまえ} を {呼|よ}んで ください 。 {今度|こんど} は 、 {一人|ひとり} じゃ ない 。 || Call its name, please. This time I'm not alone.
!challenge kr.name_ridge
!set kr_l_ridge
!sfx bell
narr: 「{尾根|おね} の {灯|ひ}」 。 {何十年|なんじゅうねん} {暗|くら}かった {灯籠|とうろう} に 、 {灯|ひ} が ともった 。 || "The Ridge Light". A lantern dark for decades catches.
ren[smile]: …… {点|つ}きました 。 {遅|おそ}く なって 、 ごめんなさい 。 || …It's lit. I'm sorry I took so long.
!sfx shutters
ren: ヒサエ さん に 、 この {道|みち} を {継|つ}がない か と {言|い}われました 。 {宿坊|しゅくぼう} も 、 {灯|ひ} も 、 {全部|ぜんぶ} 。 …… {正直|しょうじき} 、 {嬉|うれ}しかった 。 {灯守|ひもり} の {居場所|いばしょ} です から 。 || Hisae asked me to take on this road. The lodge, the lamps, all of it. …Honestly, I was glad. It's a place for a keeper.
ren: でも 、 {灯|ひ} は {今|いま} 、 どこ でも {消|き}えて います 。 {灯守|ひもり} は 、 {暗|くら}い ところ へ {行|い}く もの です 。 …… あなた と 、 {最後|さいご} まで {歩|ある}きたい 。 この {道|みち} の {答|こた}え は 、 その {後|あと} で {出|だ}します 。 || But lamps are going out everywhere now. A keeper goes where it's dark. …I want to walk with you to the end. I'll give this road its answer after that.
!unset kr_apart
!refresh
!refresh comp
!set kr_ren_back
!set kr_ren_crossroads
!hook co_bond kr:night
!hook co_remember together kr_ridge
!journal レン は 、 {尾根|おね} の {灯|ひ} を {点|つ}けた 。 {灯守|ひもり} の {道|みち} を {継|つ}ぐ の は 、 {旅|たび} の {後|あと} に する と いう 。 || Ren lit the Ridge Light. The keepership of the road can wait, they say, until the journey's end.
:end

@scene kr.hisae_vigil
# To the vigil: everyone gathered (Ren back, or the quarrel made up). Ren's route: Ren answers Hisae.
!faceplayer
!if kr_vigil_done -> end
?(comp=ren&kr_ren_back) comp: ヒサエ さん 。 {昔|むかし} 、 {尾根|おね} の {灯|ひ} を {点|つ}けられなくて 、 すみません でした 。 …… {今夜|こんや} 、 {点|つ}けました 。 || Hisae. I'm sorry I failed to light the Ridge Light, long ago. …Tonight, I lit it.
?(comp=ren&kr_ren_back) kr_hisae[smile]: {知|し}って いる よ 。 ここ から {見|み}えた 。 …… で 、 {答|こた}え は ？ || I know. I saw it from here. …And your answer?
?(comp=ren&kr_ren_back) comp: {旅|たび} を {終|お}えたら 、 {必|かなら}ず {戻|もど}って きます 。 {答|こた}え は 、 その {時|とき} に 。 || When the journey's over, I'll come back without fail. You'll have my answer then.
?(comp=ren&kr_ren_back) kr_hisae: {灯守|ひもり} の {約束|やくそく} だ よ 。 {待|ま}って いる 。 || A keeper's promise, then. I'll wait.
?(comp=ren&!kr_ren_back) kr_hisae: レン を {迎|むか}え に {行|い}って おやり 。 {尾根|おね} の {灯|ひ} の ところ に いる よ 。 || Go and fetch Ren. They're at the Ridge Light.
?(comp=ren&!kr_ren_back) !end
?(comp!=ren&!kr_makeup_done) kr_hisae: {先|さき} に 、 {仲直|なかなお}り して おいで 。 || Make it up first.
?(comp!=ren&!kr_makeup_done) !end
kr_hisae: さあ 、 {夜|よ}{通|どお}し の {番|ばん} を しよう 。 {灯明|とうみょう} の {間|ま} へ 。 || Now, let's keep the vigil. To the Room of Wicks.
!set kr_evening_done
!fade out
!warp kr.vigil 9 10 up
!fade in
:end
`, 'kr/company');
