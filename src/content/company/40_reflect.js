/* Companionship content, part 4: the two journey reflections (addendum §8.2), one of
 * each per companion. How We Travel (after Chapter 2): their way of travelling and
 * the pace you set together. What We Keep (after Chapter 4): one moment this
 * journey actually recorded (co_keep_recall picks it, or says honestly that it is
 * the whole road). Each: Not now first (free; the topic waits quietly), then at
 * least two respectful replies; none is right or wrong and none judges language.
 * Later saves hear them with retrospective wording. Each gives its one bond event
 * once (co_bond); both also sit in the rest topics' first and fifth slots. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene co.reflect_travel_nao
# Staged (anywhere it is told: no position is assumed): you and Nao turn to each other. A hand to the satchel
# strap as Nao asks; put off, a shrug. Nao explains the courier's pace with an open hand, glances aside at the
# detours, shakes the head: not a complaint; your answer gets a nod, a shrug, a nod; on the close, the smirk
# and the look away.
!look pc nao
!look nao pc
!gesture nao strap
?(!ch4_done) comp: {潮硝子|しおがらす} から {歩|ある}いて きて 、 {分|わ}かった こと が ある 。 {少|すこ}し {話|はな}して いい か ？ || Walking since Saltglass, I've worked something out. Mind if I say it?
?(ch4_done) comp: {潮硝子|しおがらす} の {頃|ころ} から 、 {言|い}おう と {思|おも}ってた こと が ある 。 {遅|おそ}く なった けど 、 {今|いま} いい か ？ || There's something I've meant to say since Saltglass. It's late, but can I say it now?
!choice
* {聞|き}かせて || Go on. -> talk
* {今|いま} は いい || Not now. -> later
:later
!gesture nao shrug
comp: ん 。 {逃|に}げ{道|みち} の {話|はなし} じゃ ない から 、 いつ でも いい 。 || Mm. It's not about escape routes. Any time.
!hook co_defer reflect:travel
!end
:talk
!gesture nao palm
comp: {俺|おれ} は ずっと {一人|ひとり} で {配達|はいたつ} して きた から 、 {歩|ある}く の が {速|はや}い 。 {近道|ちかみち} が あれば {使|つか}う 。 {寄|よ}り{道|みち} は しない 。 || I've always delivered alone, so I walk fast. If there's a shortcut I take it. No detours.
!gesture nao aside
comp: あんた と {歩|ある}く と 、 {寄|よ}り{道|みち} が {多|おお}い 。 {人|ひと} の {話|はなし} を {聞|き}いて 、 {看板|かんばん} を {読|よ}んで 、 {来|き}た {道|みち} を {戻|もど}って 。 || Walking with you, there are lots of detours. Listening to people, reading signs, going back the way we came.
!gesture nao shake
comp[think]: …… {文句|もんく} じゃ ない 。 {俺|おれ} の {速|はや}さ で {歩|ある}いてたら 、 {見落|みお}とした もの が ある 。 それ だけ だ 。 || …That's not a complaint. At my pace, we'd have missed things. That's all.
!choice
* {急|いそ}ぐ {時|とき} は 、 {道|みち} を {任|まか}せる || When it matters, I'll leave the road to you. -> fast
* {寄|よ}り{道|みち} は やめない よ || I'm not giving up the detours. -> slow
* {二人|ふたり} の {間|あいだ} くらい で || Somewhere between the two of us. -> both
:fast
!gesture nao nod pc
comp[smirk]: {了解|りょうかい} 。 {急|いそ}ぐ {時|とき} は {俺|おれ} 、 {急|いそ}がない {時|とき} は あんた 。 …… {最初|さいしょ} の {日|ひ} に {決|き}めた の と 、 {同|おな}じ だ な 。 || Deal. When we're in a hurry, me. When we're not, you. …Same as we agreed on day one.
!hook co_answer reflect:travel fast
!goto close
:slow
!gesture nao shrug
comp[laugh]: だろう な 。 …… いい よ 。 {寄|よ}り{道|みち} の {出口|でぐち} は 、 {俺|おれ} が {覚|おぼ}えて おく 。 || Figured. …Fine. I'll keep track of the way out of every detour.
!hook co_answer reflect:travel slow
!goto close
:both
!gesture nao nod pc
comp: {間|あいだ} か 。 {配達|はいたつ} で {言|い}えば 、 {半日|はんにち} {遅|おく}れ くらい だ な 。 …… {悪|わる}く ない 。 || Somewhere between. In delivery terms, about half a day late. …Not bad.
!hook co_answer reflect:travel both
:close
?(bond>=rhythm) !gesture nao aside
?(bond>=rhythm) comp[smile]: …… {一人|ひとり} の {時|とき} より 、 {道|みち} が {短|みじか}く {感|かん}じる 。 {不思議|ふしぎ} な もん だ 。 || …The road feels shorter than when I was on my own. Funny, that.
!hook co_bond reflect:travel
!hook co_remember reflections reflect_travel reflect:travel
!hook co_done reflect:travel

@scene co.reflect_travel_mio
# Staged (anywhere it is told): you and Mio turn to each other. Her hands together at her chest as she asks;
# put off, a smile and a nod. Two hands for matching her pace to others, a hand to her chin over losing her own,
# an open hand for her question; your answer gets a nod (a promise), her hidden laugh, a breath out; on the close,
# her thanks with both hands.
!look pc mio
!look mio pc
!gesture mio guard
?(!ch4_done) comp: {少|すこ}し {休|やす}みません か 。 …… {休|やす}み ながら 、 {話|はな}したい こと が あって 。 || Shall we rest a moment? …There's something I'd like to talk about while we do.
?(ch4_done) comp: {潮硝子|しおがらす} の {頃|ころ} から 、 {聞|き}こう と {思|おも}って いた こと が あります 。 {今|いま} 、 いい です か 。 || There's something I've meant to ask since Saltglass. Is now all right?
!choice
* いい よ || Of course. -> talk
* {今|いま} は いい || Not now. -> later
:later
!gesture mio nod pc
comp[smile]: はい 。 {急|いそ}ぎません 。 {私|わたし} も 、 {急|いそ}がない {練習|れんしゅう} を して います から 。 || All right. No hurry. I'm practising not hurrying, too.
!hook co_defer reflect:travel
!end
:talk
!gesture mio size
comp: {私|わたし} 、 {人|ひと} に {合|あ}わせて {歩|ある}く の が {癖|くせ} なん です 。 {速|はや}い {人|ひと} に は {速|はや}く 、 {遅|おそ}い {人|ひと} に は {遅|おそ}く 。 || I have a habit of matching my pace to whoever I'm with. Fast with the fast, slow with the slow.
!gesture mio chin
comp[think]: でも 、 {自分|じぶん} の {速|はや}さ が {分|わ}からなく なる こと が あって 。 …… あなた と {歩|ある}いて いる と 、 {不思議|ふしぎ} と {息|いき} が {切|き}れない んです 。 || But then I lose track of my own pace. …Walking with you, oddly, I don't get out of breath.
!gesture mio palm
comp: {疲|つか}れたら 、 {疲|つか}れた って {言|い}って も いい です か 。 {私|わたし} も 、 あなた も 。 || If I'm tired, may I say so? Both of us, I mean.
!choice
* {言|い}って ほしい 。 {休|やす}む から || Please do. We'll rest. -> rest
* {私|わたし} も {言|い}う よ || I'll say so too. -> both
* {今|いま} の {速|はや}さ で いい || This pace is fine as it is. -> keep
:rest
!gesture mio nod pc
?(seen.sb.quiet_mio) comp[smile]: …… はい 。 {約束|やくそく} です 。 {規則|きそく} {三十三番|さんじゅうさんばん} に します 。 || …All right. A promise. I'll make it rule number thirty-three.
?(!seen.sb.quiet_mio) comp[smile]: …… はい 。 {約束|やくそく} です 。 {私|わたし} の {決|き}まり に {加|くわ}えて おきます 。 || …All right. A promise. I'll add it to my rules.
!hook co_answer reflect:travel rest
!goto close
:both
!gesture mio laugh
comp[laugh]: {二人|ふたり} とも {言|い}う 。 …… {薬師|くすし} と して は 、 {一番|いちばん} {安心|あんしん} できる {答|こた}え です 。 || Both of us say it. …As an apothecary, that's the most reassuring answer there is.
!hook co_answer reflect:travel both
!goto close
:keep
!gesture mio exhale
comp: そう です か 。 …… じゃあ 、 この {速|はや}さ を {覚|おぼ}えて おきます 。 {誰|だれ} か に {合|あ}わせた {速|はや}さ じゃ なくて 、 {私|わたし} の {速|はや}さ と して 。 || I see. …Then I'll remember this pace. Not as someone else's pace — as mine.
!hook co_answer reflect:travel keep
:close
?(bond>=rhythm) !gesture mio thanks pc
?(bond>=rhythm) comp[smile]: {誰|だれ} か に {合|あ}わせる ん じゃ なくて 、 {一緒|いっしょ} に {歩|ある}く 。 {似|に}て いる けど 、 {違|ちが}う ん です ね 。 || Not keeping pace with someone — walking together. They're alike, but they aren't the same.
!hook co_bond reflect:travel
!hook co_remember reflections reflect_travel reflect:travel
!hook co_done reflect:travel

@scene co.reflect_travel_ren
# Staged (anywhere it is told): you and Ren turn to each other. Ren's open hand to begin; put off, a glance
# aside. Ren counts the three checks of the map, a hand to the chin over asking the way, the glasses before
# the question (the one adjustment of the scene); your answer gets thanks with open hands, a nod, a start of
# surprise; on the close, a slow breath out.
!look pc ren
!look ren pc
!gesture ren palm
?(!ch4_done) comp: {少|すこ}し 、 {記録|きろく} の {確認|かくにん} を させて ください 。 {私|わたし} たち の {旅|たび} の {記録|きろく} です 。 || Allow me to check the records a moment. The records of our journey.
?(ch4_done) comp: {潮硝子|しおがらす} から {気|き} に なって いた {記録|きろく} が あります 。 {遅|おそ}く なりました が 、 {確認|かくにん} して も ？ || There's a record I've been meaning to check since Saltglass. It's late, but may I?
!choice
* どうぞ || Go ahead. -> talk
* {今|いま} は いい || Not now. -> later
:later
!gesture ren aside
comp[smirk]: {承知|しょうち} しました 。 {記録|きろく} は {逃|に}げません 。 {私|わたし} は {迷|まよ}います が 。 || Understood. Records don't run away. I do get lost, though.
!hook co_defer reflect:travel
!end
:talk
!gesture ren count
comp: {私|わたし} は {地図|ちず} を {三回|さんかい} {確|たし}かめて から {歩|ある}き{出|だ}します 。 そして 、 {四回目|よんかいめ} に {迷|まよ}います 。 || I check the map three times before I set off. And get lost on the fourth.
!gesture ren chin
comp[think]: {旅|たび} を して {分|わ}かりました 。 {道|みち} を {聞|き}く の は 、 {恥|は}ずかしい こと で は ない 。 {灯守|ひもり} が {言|い}う の も {変|へん} です が 。 || Travelling has taught me that asking the way is nothing to be ashamed of. Odd for a lantern keeper to say.
!gesture ren glasses
comp: それ と 、 {速|はや}さ の {話|はなし} です 。 {私|わたし} は {遅|おそ}い 。 {灯|あか}り を {全部|ぜんぶ} {見|み}て しまう ので 。 …… あなた に は 、 {遅|おそ}すぎます か 。 || And about pace. I'm slow: I end up checking every lantern. …Am I too slow for you?
!choice
* {灯|あか}り を {見|み}る {時間|じかん} は {必要|ひつよう} だ || Checking the lanterns is time well spent. -> lamps
* {急|いそ}ぐ {時|とき} は {声|こえ} を かける || When we need to hurry, I'll say so. -> call
* {迷|まよ}う の も {一緒|いっしょ} に || If we get lost, we get lost together. -> lost
:lamps
!gesture ren thanks pc
comp[smile]: …… ありがとう ございます 。 {灯|あか}り の {方|ほう} も 、 きっと {喜|よろこ}んで います 。 {私|わたし} の {推測|すいそく} です が 。 || …Thank you. The lanterns are pleased too, I'm sure. That's only my inference.
!hook co_answer reflect:travel lamps
!goto close
:call
!gesture ren nod pc
comp: {助|たす}かります 。 {声|こえ} を かけられたら 、 {灯|あか}り より あなた を {優先|ゆうせん} します 。 {記録|きろく} して おきます 。 || That helps. When you call, I'll put you before the lanterns. I'll make a note of it.
!hook co_answer reflect:travel call
!goto close
:lost
!gesture ren listen pc
comp[surprise]: …… それ は 、 {旅|たび} に {出|で}る {時|とき} に {私|わたし} が {約束|やくそく} した こと です 。 {言|い}い{返|かえ}された の は 、 {初|はじ}めて です ね 。 || …That's the promise I made when we set out. It's the first time anyone has said it back to me.
!hook co_answer reflect:travel lost
:close
?(bond>=rhythm) !gesture ren exhale
?(bond>=rhythm) comp[smile]: {師匠|ししょう} は 、 {一人|ひとり} で {歩|ある}く {人|ひと} でした 。 {私|わたし} は 、 {二人|ふたり} の {方|ほう} が {向|む}いて いる よう です 。 || My teacher walked alone. It seems I'm better suited to two.
!hook co_bond reflect:travel
!hook co_remember reflections reflect_travel reflect:travel
!hook co_done reflect:travel

@scene co.reflect_travel_suzu
# Staged (anywhere it is told): you and Suzu turn to each other. Suzu's showman's two hands for the "interval
# meeting"; put off, her laugh. She flips her account book open over the troupe's schedule, explains with an open
# hand, glances away on the serious line; your answer gets a small celebration, a nod, a shrug (rock-paper-scissors);
# on the close, her open-handed thanks.
!look pc suzu
!look suzu pc
!gesture suzu size
?(!ch4_done) comp: ねえ 、 {幕間|まくあい} の {打|う}ち{合|あ}わせ 、 して いい ？ {旅|たび} の {進|すす}め{方|かた} の 。 || Hey, can we have an interval meeting? About how we're running this tour.
?(ch4_done) comp: {潮硝子|しおがらす} から ずっと {言|い}いそびれてた {打|う}ち{合|あ}わせ 、 {今|いま} して いい ？ || The meeting I've been meaning to have since Saltglass — can we have it now?
!choice
* いい よ || Sure. -> talk
* {今|いま} は いい || Not now. -> later
:later
!gesture suzu laugh
comp[laugh]: {了解|りょうかい} 。 {打|う}ち{合|あ}わせ は {延期|えんき} 。 {延期|えんき} の {料金|りょうきん} は {取|と}らない わ よ 。 || Understood — meeting postponed. No postponement fee.
!hook co_defer reflect:travel
!end
:talk
!gesture suzu check prop=accountbook
comp: {一座|いちざ} で は 、 {旅|たび} の {予定|よてい} は {帳簿|ちょうぼ} が {決|き}めてた の 。 {宿代|やどだい} が {払|はら}える {町|まち} まで 、 {何日|なんにち} で {着|つ}く か 。 || In the troupe, the ledger set the schedule. How many days to the next town we could afford to sleep in.
!gesture suzu palm
comp: あなた と の {旅|たび} は 、 {帳簿|ちょうぼ} じゃ なくて {人|ひと} が {決|き}めてる 。 {困|こま}ってる {人|ひと} が いたら 、 {予定|よてい} は {全部|ぜんぶ} {書|か}き{直|なお}し 。 || Travelling with you, people set it, not a ledger. Someone in trouble, and the whole schedule gets rewritten.
!gesture suzu avert pc
comp[closed]: …… {嫌|いや} じゃ ない の よ 。 {数字|すうじ} が {合|あ}わない {旅|たび} は 、 {初|はじ}めて だ けど 。 || …I don't mind. It's the first tour I've been on where the numbers don't add up.
!choice
* {帳簿|ちょうぼ} は スズ に {任|まか}せる || I'll leave the books to you. -> books
* {予定|よてい} は これから も {変|か}わる || The schedule will keep changing. -> change
* {二人|ふたり} で {予定|よてい} を {立|た}てよう || Let's plan it together. -> plan
:books
!gesture suzu celebrate
comp[laugh]: {任|まか}された ！ …… {経費|けいひ} の {欄|らん} に 、 「 {寄|よ}り{道|みち} {代|だい} 」 って {書|か}いて おく わ 。 || Entrusted! …I'll add a column for "detour expenses".
!hook co_answer reflect:travel books
!goto close
:change
!gesture suzu nod pc
comp[smile]: でしょう ね 。 {台本|だいほん} {通|どお}り に {行|い}かない {芝居|しばい} の ほう が 、 {客|きゃく} は {覚|おぼ}えてる もの よ 。 || I thought so. Audiences remember the plays that don't go to script.
!hook co_answer reflect:travel change
!goto close
:plan
!gesture suzu shrug
comp: {共同|きょうどう} {演出|えんしゅつ} ね 。 …… {意見|いけん} が {割|わ}れたら 、 じゃんけん で {決|き}める 。 それ が {一座|いちざ} の {伝統|でんとう} 。 || Co-directing. …If we disagree, rock-paper-scissors. Troupe tradition.
!hook co_answer reflect:travel plan
:close
?(bond>=rhythm) !gesture suzu thanks pc
?(bond>=rhythm) comp[smile]: {一人|ひとり} で {帳簿|ちょうぼ} を つけてた {頃|ころ} より 、 {数字|すうじ} は {合|あ}わない けど 、 {帳尻|ちょうじり} は {合|あ}ってる {気|き} が する の 。 || The numbers add up less than when I kept the books alone, but somehow the account balances.
!hook co_bond reflect:travel
!hook co_remember reflections reflect_travel reflect:travel
!hook co_done reflect:travel

@scene co.reflect_keep_nao
# Staged (anywhere it is told): you and Nao turn to each other. A glance between you and the road as Nao asks;
# put off, a shrug. Nao takes one of the kept address labels from the satchel and looks at it, then a hand to
# the strap for the one from this journey, and an open hand: and you? Your answer gets a nod, a shrug, a nod; on
# the close, the look away.
!look pc nao
!look nao pc
!gesture nao lookbetween pc and=down
?(!ch5_done) comp: {雪鈴|ゆきすず} まで {来|き}た な 。 …… {一|ひと}つ {聞|き}いて いい か 。 || We've made it as far as Snowbell. …Can I ask you something?
?(ch5_done) comp: {前|まえ} に {聞|き}きそびれた こと が ある 。 {今|いま} {聞|き}いて いい か 。 || There's something I never got round to asking. Can I ask now?
!choice
* いい よ || Go ahead. -> talk
* {今|いま} は いい || Not now. -> later
:later
!gesture nao shrug
comp: ん 。 {急|いそ}ぐ {配達|はいたつ} じゃ ない 。 || Mm. Not an urgent delivery.
!hook co_defer reflect:keep
!end
:talk
!gesture nao check prop=letter
comp: {俺|おれ} は {宛名|あてな} の ラベル を {取|と}って おく 。 {何|なに} を {運|はこ}んだ か 、 {忘|わす}れない ため に 。 || I keep address labels. So I don't forget what I carried.
!gesture nao strap
comp[think]: この {旅|たび} の ラベル を {一枚|いちまい} だけ {残|のこ}す と したら 、 {俺|おれ} は …… || If I kept just one label from this journey, I'd keep…
!hook co_keep_recall
!gesture nao palm pc
comp: あんた は ？ {何|なに} を {残|のこ}したい ？ || And you? What would you keep?
!choice
* {同|おな}じ {日|ひ} を {残|のこ}したい || I'd keep the same day. -> same
* {別|べつ} の {日|ひ} が ある || There's another day I'd keep. -> other
* {何|なに} も {起|お}きない {普通|ふつう} の {日|ひ} || The ordinary days, when nothing happened. -> plain
:same
!gesture nao nod pc
comp[smile]: …… {同|おな}じ ラベル を {二人|ふたり} で {持|も}ってる わけ だ 。 {失|な}くしにくく なる な 。 || …So we both hold the same label. Makes it harder to lose.
!hook co_answer reflect:keep same
!goto close
:other
!gesture nao shrug
comp: そう か 。 {言|い}わなくて いい 。 {宛名|あてな} が {違|ちが}って も 、 {同|おな}じ {鞄|かばん} に {入|はい}る 。 || Right. You don't have to say. Different address, same satchel.
!hook co_answer reflect:keep other
!goto close
:plain
!gesture nao nod pc
comp[laugh]: …… {何|なに} も {起|お}きない {日|ひ} か 。 {配達人|はいたつにん} に は 、 {一番|いちばん} {贅沢|ぜいたく} な {日|ひ} だ 。 || …A day when nothing happens. For a courier, that's the most luxurious kind.
!hook co_answer reflect:keep plain
:close
?(bond>=trusted) !gesture nao aside
?(bond>=trusted) comp[shy]: …… {今日|きょう} の {話|はなし} も 、 {一枚|いちまい} {増|ふ}えた ラベル だ 。 {笑|わら}う な よ 。 || …Today's talk makes one more label. Don't laugh.
!hook co_bond reflect:keep
!hook co_remember reflections reflect_keep reflect:keep
!hook co_done reflect:keep

@scene co.reflect_keep_mio
# Staged (anywhere it is told): you and Mio turn to each other. Her hands together at her chest as she asks; put
# off, a nod. A bottle from her belt looked over for the shelf she labels, a hand to her chin, an open hand: and
# you? Your answer gets her hidden laugh, a nod, a breath out; on the close, her hands fidget.
!look pc mio
!look mio pc
!gesture mio guard
?(!ch5_done) comp: {雪鈴|ゆきすず} の {空気|くうき} は 、 {頭|あたま} が はっきり します ね 。 …… {少|すこ}し 、 {聞|き}いて も いい です か 。 || The Snowbell air clears the head, doesn't it. …May I ask you something?
?(ch5_done) comp: {前|まえ} から {聞|き}きたかった こと が あります 。 {遅|おそ}く なりました けど 、 {今|いま} {聞|き}いて も いい です か 。 || There's something I've wanted to ask for a while. It's late, but may I ask now?
!choice
* いい よ || Of course. -> talk
* {今|いま} は いい || Not now. -> later
:later
!gesture mio nod pc
comp[smile]: はい 。 また {今度|こんど} 。 {瓶|びん} に {入|い}れて 、 {取|と}って おきます 。 || All right, another time. I'll keep it in a jar.
!hook co_defer reflect:keep
!end
:talk
!gesture mio check prop=bottle
comp: {薬|くすり} の {棚|たな} に は 、 {何|なに} を いつ {作|つく}った か 、 {全部|ぜんぶ} {書|か}いて {残|のこ}します 。 || On a medicine shelf, I write everything down: what I made, and when.
!gesture mio chin
comp[think]: この {旅|たび} で 、 {一|ひと}つ だけ {書|か}いて {残|のこ}す と したら …… || If I could write down just one thing from this journey…
!hook co_keep_recall
!gesture mio palm pc
comp: あなた は どう です か 。 {何|なに} を {残|のこ}したい ？ || What about you? What would you keep?
!choice
* {同|おな}じ {日|ひ} を {残|のこ}したい || I'd keep the same day. -> same
* {別|べつ} の {日|ひ} が ある || There's another day I'd keep. -> other
* {何|なに} も {起|お}きない {普通|ふつう} の {日|ひ} || The ordinary days, when nothing happened. -> plain
:same
!gesture mio laugh
comp[laugh]: {同|おな}じ {頁|ページ} に {二人|ふたり} で {書|か}く 。 …… {字|じ} が {重|かさ}なって 、 {読|よ}みにくく なり そう です ね 。 || Two of us writing on the same page. …Our writing will overlap and be hard to read.
!hook co_answer reflect:keep same
!goto close
:other
!gesture mio nod pc
comp[smile]: {教|おし}えて くれなくて も いい です 。 あなた の {棚|たな} に 、 ちゃんと {置|お}いて あげて ください 。 || You needn't tell me. Just make sure it has a place on your own shelf.
!hook co_answer reflect:keep other
!goto close
:plain
!gesture mio exhale
comp: {何|なに} も {起|お}きない {日|ひ} 。 …… {私|わたし} の {好|す}き な {日|ひ} です 。 {誰|だれ} も {怪我|けが} を しない {日|ひ} 。 || The days when nothing happened. …My favourite kind. The days nobody gets hurt.
!hook co_answer reflect:keep plain
:close
?(bond>=trusted&seen.sb.quiet_mio) !gesture mio fidget
?(bond>=trusted&seen.sb.quiet_mio) comp[shy]: …… これ は 、 ラベル の ない {瓶|びん} に は {入|い}れません 。 ちゃんと {名前|なまえ} を {書|か}いて {置|お}いて おきます 。 || …This won't go in the jar with no label. I'll write its name on it properly.
!hook co_bond reflect:keep
!hook co_remember reflections reflect_keep reflect:keep
!hook co_done reflect:keep

@scene co.reflect_keep_ren
# Staged (anywhere it is told): you and Ren turn to each other. Ren's open hand to ask; put off, a nod. Two hands
# for the names a keeper chooses to keep, a hand to the chin, a turn of the head to you for your choice; your
# answer gets thanks with open hands, a nod, a slow breath out; on the close, the lamp tended.
!look pc ren
!look ren pc
!gesture ren palm
?(!ch5_done) comp: {雪鈴|ゆきすず} の {天文台|てんもんだい} に は 、 {古|ふる}い {記録|きろく} が たくさん ありました 。 …… {私|わたし} たち の {記録|きろく} の {話|はなし} を して も ？ || The Snowbell observatory was full of old records. …May I talk about ours?
?(ch5_done) comp: {遅|おそ}く なりました が 、 {雪鈴|ゆきすず} で {聞|き}こう と {思|おも}って いた こと が あります 。 || It's late, but there's something I meant to ask you in Snowbell.
!choice
* {聞|き}かせて || Go on. -> talk
* {今|いま} は いい || Not now. -> later
:later
!gesture ren nod pc
comp: {分|わ}かりました 。 {頁|ページ} を {開|ひら}いた まま に して おきます 。 || Understood. I'll leave the page open.
!hook co_defer reflect:keep
!end
:talk
!gesture ren size
comp: {灯守|ひもり} は 、 {残|のこ}す {名前|なまえ} を {選|えら}びます 。 {全部|ぜんぶ} は {残|のこ}せない から です 。 || A lantern keeper chooses which names to keep. You can't keep them all.
!gesture ren chin
comp[think]: この {旅|たび} から {一|ひと}つ {選|えら}ぶ なら 、 {私|わたし} は …… || If I chose one from this journey…
!hook co_keep_recall
!gesture ren listen pc
comp: あなた なら 、 {何|なに} を {残|のこ}します か 。 || And you — what would you keep?
!choice
* {同|おな}じ {日|ひ} を {残|のこ}したい || I'd keep the same day. -> same
* {別|べつ} の {日|ひ} が ある || There's another day I'd keep. -> other
* {何|なに} も {起|お}きない {普通|ふつう} の {日|ひ} || The ordinary days, when nothing happened. -> plain
:same
!gesture ren thanks pc
comp[smile]: {同|おな}じ {記録|きろく} を {二人|ふたり} で {持|も}つ 。 {写|うつ}し が {二|ふた}つ ある の は 、 {灯守|ひもり} と して {理想|りそう} です 。 || The two of us holding the same record. Two copies — a keeper's ideal.
!hook co_answer reflect:keep same
!goto close
:other
!gesture ren nod pc
comp: {違|ちが}う {頁|ページ} を {選|えら}ぶ 。 それ で {記録|きろく} は {豊|ゆた}か に なります 。 {教|おし}えて くれなくて も 、 {構|かま}いません 。 || Choosing a different page. That's how records grow richer. You needn't tell me which.
!hook co_answer reflect:keep other
!goto close
:plain
!gesture ren exhale
comp: {何|なに} も {起|お}きなかった {日|ひ} 。 {記録|きろく} に は {残|のこ}りにくい {日|ひ} です ね 。 …… だから こそ 、 {私|わたし} が {覚|おぼ}えて おきます 。 || The days nothing happened. The hardest days to put on record. …Which is exactly why I'll remember them.
!hook co_answer reflect:keep plain
:close
?(bond>=trusted) !gesture ren tendlamp
?(bond>=trusted) comp[smile]: …… {師匠|ししょう} の {教|おし}え に 、 {一行|いちぎょう} {足|た}したく なりました 。 まだ {言葉|ことば} に は なって いません が 。 || …I find I want to add a line to my teacher's lessons. It hasn't turned into words yet.
!hook co_bond reflect:keep
!hook co_remember reflections reflect_keep reflect:keep
!hook co_done reflect:keep

@scene co.reflect_keep_suzu
# Staged (anywhere it is told): you and Suzu turn to each other. No flourish: Suzu's head goes down as she asks to
# be serious; put off, a nod. Two hands for the scene an actor takes home, a hand to her chin, an open hand: and
# you? Your answer gets a small celebration, a nod, a laugh; on the close, a glance away and back.
!look pc suzu
!look suzu pc
!gesture suzu lowered
?(!ch5_done) comp: {雪鈴|ゆきすず} の {夜|よる} は {長|なが}い わ ね 。 …… {少|すこ}し 、 {真面目|まじめ} な {話|はなし} を して いい ？ {一|ひと}つ だけ 。 || Snowbell nights are long. …Can I be serious for a moment? Just once.
?(ch5_done) comp: {前|まえ} に {聞|き}き{忘|わす}れた こと が ある の 。 {真面目|まじめ} な やつ 。 {今|いま} いい ？ || There's something I forgot to ask you. A serious one. Is now all right?
!choice
* いい よ || Sure. -> talk
* {今|いま} は いい || Not now. -> later
:later
!gesture suzu nod pc
comp: {了解|りょうかい} 。 {客席|きゃくせき} の {灯|あか}り は 、 まだ {落|お}とさない で おく わ 。 || Understood. I'll leave the house lights up a little longer.
!hook co_defer reflect:keep
!end
:talk
!gesture suzu size
comp: {芝居|しばい} が {終|お}わる と 、 {役者|やくしゃ} は {一|ひと}つ だけ {場面|ばめん} を {持|も}って {帰|かえ}る の 。 {一番|いちばん} {好|す}き だった {場面|ばめん} を 。 || When a run ends, an actor takes one scene home. The one they loved most.
!gesture suzu chin
comp[think]: この {旅|たび} で {私|わたし} が {持|も}って {帰|かえ}る {場面|ばめん} は …… || The scene I'd take home from this journey…
!hook co_keep_recall
!gesture suzu palm pc
comp: あなた は ？ どの {場面|ばめん} を {持|も}って {帰|かえ}る ？ || And you? Which scene would you take home?
!choice
* {同|おな}じ {場面|ばめん} を {持|も}って {帰|かえ}る || I'd take the same scene. -> same
* {別|べつ} の {場面|ばめん} が ある || There's a different scene for me. -> other
* {何|なに} も {起|お}きない {幕間|まくあい} || The intervals, when nothing happened. -> plain
:same
!gesture suzu celebrate
comp[laugh]: {同|おな}じ {場面|ばめん} ！ …… {二人|ふたり} で {覚|おぼ}えて いれば 、 いつ でも {再演|さいえん} できる わ ね 。 || The same scene! …If we both remember it, we can revive it any time.
!hook co_answer reflect:keep same
!goto close
:other
!gesture suzu nod pc
comp[smile]: {違|ちが}う {場面|ばめん} ね 。 いい の よ 。 {客|きゃく} ごと に {違|ちが}う {場面|ばめん} が {残|のこ}る の が 、 いい {芝居|しばい} なの 。 || A different scene. That's fine. In a good play, everyone keeps a different scene.
!hook co_answer reflect:keep other
!goto close
:plain
!gesture suzu laugh
comp: {幕間|まくあい} ？ …… ふふ 。 {舞台|ぶたい} の {袖|そで} で {水|みず} を {飲|の}んでる {時間|じかん} が {一番|いちばん} {好|す}き 、 って {言|い}う {役者|やくしゃ} 、 {結構|けっこう} いる の よ 。 || The intervals? …Heh. Plenty of actors say their favourite moments are drinking water in the wings.
!hook co_answer reflect:keep plain
:close
?(bond>=trusted&seen.sb.quiet_suzu) !gesture suzu avert pc
?(bond>=trusted&seen.sb.quiet_suzu) comp[shy]: …… これ は {冗談|じょうだん} じゃ ない から 、 {帳簿|ちょうぼ} の {最後|さいご} の {頁|ページ} に {書|か}いて おく わ 。 || …This isn't a joke, so it goes on the last page of the book.
!hook co_bond reflect:keep
!hook co_remember reflections reflect_keep reflect:keep
!hook co_done reflect:keep
`, 'company/40_reflect');
