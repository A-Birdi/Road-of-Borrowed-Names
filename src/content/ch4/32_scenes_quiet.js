/* Chapter 4: the quiet stretch. Snowed in upstairs at Yukimiya, the two
 * travellers talk. Four fully different conversations (fears, a funny
 * story, something never told). Choices set var.sb_tone for a small
 * callback in the morning: 1 light, 2 listening, 3 candid. No choice is
 * wrong and none has consequences beyond tone. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene sb.quiet_begin
!music quiet_road
narr: {二階|にかい} の {部屋|へや} は 、 {囲炉裏|いろり} の {熱|ねつ} で ほんのり {温|あたた}かい 。 {窓|まど} の {外|そと} は {真|ま}っ{白|しろ} で 、 {風|かぜ} の {音|おと} しか しない 。 || The upstairs room is faintly warm from the hearth below. Outside the window everything is white, and there is nothing but the sound of the wind.
narr: {布団|ふとん} が {二|ふた}つ 、 {並|なら}べて {敷|し}いて ある 。 {灯|あか}り を {消|け}す と 、 {部屋|へや} は {雪明|ゆきあ}かり だけ に なった 。 || Two futons lie side by side. When you put out the lamp, only the snow-light is left.
!var sb_tone = 2
!if comp=nao -> nao
!if comp=mio -> mio
!if comp=ren -> ren
!if comp=suzu -> suzu
narr: {一人|ひとり} の {夜|よる} は {静|しず}か だ 。 {風|かぜ} の {音|おと} を {数|かぞ}えて いる うち に 、 {眠|ねむ}って しまった 。 || A night alone is quiet. Counting the gusts of wind, you fall asleep.
!goto morning
:nao
!call sb.quiet_nao
!goto morning
:mio
!call sb.quiet_mio
!goto morning
:ren
!call sb.quiet_ren
!goto morning
:suzu
!call sb.quiet_suzu
:morning
!call sb.quiet_morning
`, 'ch4/quiet-begin');

// ---- Nao -------------------------------------------------------------------------------
RB.script.add(`
@scene sb.quiet_nao
comp[tired]: …… {寝|ね}られない な 。 {風|かぜ} の {音|おと} が 、 {誰|だれ} か が {戸|と} を {叩|たた}いてる みたい で 。 || …Can't sleep. The wind sounds like someone knocking at the door.
comp: {配達人|はいたつにん} の {癖|くせ} だ 。 {戸|と} を {叩|たた}く {音|おと} が する と 、 {体|からだ} が {勝手|かって} に {起|お}きる 。 || Courier's habit. Hear knocking and your body gets up on its own.
!choice
* {少|すこ}し {話|はな}そう か || Want to talk for a bit? -> talk
* {羊|ひつじ} でも {数|かぞ}えたら ？ || Try counting sheep? -> sheep
:sheep
!var sb_tone = 1
comp[smirk]: {羊|ひつじ} ？ この {村|むら} なら ヤギ だろ 。 {十頭|じゅっとう} …… いや 、 {十二頭|じゅうにとう} か 。 {数|かぞ}えてる うち に {増|ふ}えそう で {嫌|いや} だ 。 || Sheep? Round here it'd be goats. Ten… no, twelve, was it. They'd multiply while I counted. No thanks.
comp: …… しょうがない 。 {話|はなし} で も する か 。 || …Fine. Let's talk, then.
:talk
comp: …… {笑|わら}う なよ 。 {昔|むかし} 、 {結婚|けっこん} の {申|もう}し{込|こ}み の {手紙|てがみ} を 、 {間違|まちが}った {相手|あいて} に {届|とど}けた こと が ある 。 || …Don't laugh. Once I delivered a marriage proposal to the wrong person.
comp: {双子|ふたご} の {姉妹|しまい} で 、 {宛名|あてな} は {名字|みょうじ} だけ 。 {戸|と} を {開|あ}けた ほう に {渡|わた}した 。 {姉|あね} の ほう だった 。 || Twin sisters, and the address had only the family name. I handed it to whoever opened the door. It was the older one.
comp: {姉|あね} は その {場|ば} で {読|よ}んで 、 「 はい 」 って {言|い}った 。 || She read it right there and said "yes".
!choice
* それ で 、 どう なった の ？ || And then what? -> then
* …… {笑|わら}って いい ？ || …Can I laugh? -> laugh
:laugh
!var sb_tone = 1
comp[smirk]: もう {笑|わら}ってる だろ 。 …… いい よ 。 {続|つづ}き を {聞|き}いたら 、 もっと {笑|わら}う から 。 || You're already laughing. …Fine. You'll laugh harder at the rest.
:then
comp: {次|つぎ} の {日|ひ} 、 {妹|いもうと} の ほう が {来|き}て 、 {言|い}った 。 「 よかった 。 あの {人|ひと} 、 わたし の {好|この}み じゃ ない の 」 。 || Next day the younger one came and said: "Thank goodness. He's not my type at all."
comp[laugh]: {二人|ふたり} は もう {十一年|じゅういちねん} 、 {夫婦|ふうふ} を やってる 。 {子|こ}ども が {三人|さんにん} 。 {毎年|まいとし} {礼状|れいじょう} が {来|く}る 。 {宛名|あてな} は 、 きっちり {名前|なまえ} まで {書|か}いて な 。 || They've been married eleven years now. Three kids. Every year they send me a thank-you note. With my name written out in full, mind.
comp: …… {手紙|てがみ} って の は 、 {届|とど}いた {先|さき} で {勝手|かって} に {意味|いみ} を {持|も}つ 。 {配達人|はいたつにん} が {決|き}める こと じゃ ない 。 || …A letter takes on its own meaning wherever it lands. That's not for the courier to decide.
comp[sad]: …… なのに 、 {決|き}めた こと が ある 。 || …And yet, once, I decided.
comp: {届|とど}けなかった {手紙|てがみ} が ある んだ 。 {死|し}に かけた {父親|ちちおや} から 、 {何年|なんねん} も {会|あ}って ない {娘|むすめ} へ 。 {許|ゆる}して くれ 、 って 。 || There's a letter I never delivered. From a dying father to a daughter he hadn't seen in years. Asking her to forgive him.
comp: {読|よ}んだ わけ じゃ ない 。 {渡|わた}す とき に 、 {本人|ほんにん} が そう {言|い}った 。 {娘|むすめ} に は 、 {許|ゆる}す {義理|ぎり} なんか ない のに な 。 || I didn't read it. He told me himself when he handed it over. Never mind that she owed him no forgiveness.
comp: {重|おも}すぎる と {思|おも}った 。 だから 、 {鞄|かばん} の {底|そこ} に {入|い}れた まま だ 。 {今|いま} も 。 || I thought it was too heavy to put in her hands. So it's still at the bottom of my bag. Even now.
comp[tired]: {怖|こわ}い の は な 。 いつか 、 {誰|だれ} か が ずっと {待|ま}ち{続|つづ}ける {理由|りゆう} が 、 {自分|じぶん} に なる こと だ 。 …… ホシノ の じいさん を {見|み}てたら 、 {急|きゅう} に {思|おも}い{出|だ}した 。 || What scares me is someday being the reason somebody waits forever. …Watching old Hoshino, it all came back.
!choice
* いつか 、 {届|とど}ける べき だ と {思|おも}う || I think someday you should deliver it. -> push
* {今|いま} は 、 {聞|き}く だけ に する || For now, I'll just listen. -> listen
* わたし に も {怖|こわ}い もの が ある || I'm afraid of something too. -> share
:push
!var sb_tone = 3
comp: …… わかってる 。 || …I know.
comp[smile]: 「 わかってる 」 って {口|くち} に {出|だ}せた の は 、 {今夜|こんや} が {初|はじ}めて かも な 。 {灯落|ひおち} は 、 {次|つぎ} の {町|まち} だ 。 || Maybe tonight's the first time I've managed to say "I know" out loud. Lanternfall's the next town.
!goto tin
:listen
!var sb_tone = 2
comp[smile]: …… {助|たす}かる 。 {説教|せっきょう} されたら 、 {窓|まど} から {逃|に}げる ところ だった 。 {吹雪|ふぶき} の {中|なか} へ な 。 || …Thanks. If you'd lectured me, I'd have gone out the window. Into the storm.
!goto tin
:share
!var sb_tone = 3
pc: {誰|だれ} か の {名前|なまえ} を {忘|わす}れる の が {怖|こわ}い 。 {静寂|しじま} に {持|も}って いかれたら 、 {忘|わす}れた こと も {忘|わす}れる かも しれない 。 || I'm afraid of forgetting someone's name. If the Hush took it, I might not even know I'd forgotten.
comp[surprise]: …… そっち の ほう が 、 よっぽど {怖|こわ}い な 。 || …That's a lot scarier.
comp: {忘|わす}れたら 、 {教|おし}えて やる 。 {配達人|はいたつにん} は 、 {名前|なまえ} を {覚|おぼ}える の が {仕事|しごと} だ から な 。 || If you forget, I'll tell you. Remembering names is a courier's job.
:tin
comp: …… {誰|だれ} に も {見|み}せた こと ない もの 、 {見|み}せて やる 。 || …I'll show you something I've never shown anyone.
narr: ナオ は {鞄|かばん} から 、 {平|ひら}たい ブリキ の {缶|かん} を {出|だ}した 。 {中|なか} に は 、 {古|ふる}い {宛名|あてな} の {札|ふだ} が {何百枚|なんびゃくまい} も 、 {紐|ひも} で {束|たば}ねて ある 。 || Nao takes a flat tin from the satchel. Inside are hundreds of old address labels, bundled with string.
comp: {書|か}き{直|なお}した {宛名|あてな} だ 。 {雨|あめ} で にじんだ の 、 {破|やぶ}れた の 、 {字|じ} が {汚|きたな}すぎて {読|よ}めなかった の 。 {新|あたら}しい {札|ふだ} に {書|か}き{直|なお}して 、 {古|ふる}い ほう は …… {捨|す}てられなかった 。 || Addresses I rewrote. Ones that ran in the rain, got torn, were too scrawled to read. I copied them onto new labels, and the old ones… I couldn't throw them away.
comp[shy]: {一枚|いちまい} {一枚|いちまい} が 、 {誰|だれ} か が {誰|だれ} か を {待|ま}ってた {証拠|しょうこ} だ から な 。 …… {笑|わら}え よ 。 {感傷的|かんしょうてき} だろ 。 || Every one of them is proof that somebody was waiting for somebody. …Go on, laugh. Sentimental, right?
!choice
* {笑|わら}わない よ || I won't laugh. -> nolaugh
* {一枚|いちまい} 、 {見|み}て も いい ？ || Can I look at one? -> look
:nolaugh
comp[smile]: …… そう か 。 || …Right.
comp: じゃあ 、 {一枚|いちまい} だけ な 。 || Then just one.
:look
narr: いちばん {上|うえ} の {札|ふだ} に 、 {子|こ}ども の よう な {字|じ} で 「 おとうさん へ 」 と だけ {書|か}いて ある 。 || The label on top says only "To Dad", in handwriting like a child's.
comp: {最初|さいしょ} の {一枚|いちまい} だ 。 {住所|じゅうしょ} が なくて 、 {三日|みっか} かけて {探|さが}した 。 {届|とど}いた よ 。 ちゃんと 。 || The very first one. No address at all; took me three days to find him. It got there. Properly.
comp: …… {寝|ね}る か 。 {明日|あした} は {山|やま} {登|のぼ}り だ 。 || …Let's sleep. Tomorrow's a climb.
comp[smile]: {今夜|こんや} の {話|はなし} は 、 {宛名|あてな} なし で あんた に {預|あず}けて おく 。 {誰|だれ} に も {届|とど}けんな よ 。 || Tonight's talk I'm leaving with you, no address on it. Don't go delivering it to anyone.
`, 'ch4/quiet-nao');

// ---- Mio -------------------------------------------------------------------------------
RB.script.add(`
@scene sb.quiet_mio
comp: …… {起|お}きて ます か ？ || …Are you awake?
comp[shy]: ごめん なさい 。 {枕|まくら} が {変|か}わる と 、 {眠|ねむ}れない の 。 {薬師|くすし} の くせ に ね 。 {眠|ねむ}り{薬|ぐすり} は {持|も}ってる けど 、 {自分|じぶん} に は {使|つか}わない {主義|しゅぎ} で 。 || Sorry. I can't sleep on a strange pillow. Some apothecary, I know. I carry sleeping draughts, but I've a rule against using them on myself.
!choice
* そんな {主義|しゅぎ} が ある んだ ね || You have rules like that? -> rules
* {話|はなし} {相手|あいて} に なる よ || I'll keep you company. -> company
:rules
!var sb_tone = 1
comp[laugh]: {主義|しゅぎ} は {三十二|さんじゅうに} ある の 。 {番号|ばんごう} も ついてる 。 …… {冗談|じょうだん} よ 。 {三十一|さんじゅういち} 。 || I have thirty-two rules. They're numbered. …Joking. Thirty-one.
:company
comp[smile]: …… ありがとう 。 じゃあ 、 {少|すこ}し だけ 。 || …Thank you. Just for a little while, then.
comp: {前|まえ} に 、 {町|まち} から {偉|えら}い お{医者|いしゃ} さん が {来|き}た こと が ある の 。 わたし の {店|みせ} に {入|はい}る なり 、 「 お{嬢|じょう}ちゃん 、 この {軟膏|なんこう} の {使|つか}い{方|かた} を {教|おし}えて あげよう 」 って 。 || Once a very important doctor came from the town. He walked into my shop and said, "Little miss, let me teach you how to use this salve."
comp[angry]: わたし が {作|つく}った {軟膏|なんこう} よ 。 わたし の {字|じ} で 、 ラベル が {貼|は}って ある の 。 || A salve I made. With a label in my handwriting on it.
!choice
* それ で 、 どう した の ？ || So what did you do? -> what
* {怒|おこ}った ？ || Did you lose your temper? -> angry
:angry
!var sb_tone = 1
comp[smirk]: {怒|おこ}って ない わ 。 …… {外|そと} から は 、 そう {見|み}えなかった はず 。 || I didn't lose my temper. …At least it can't have looked that way from outside.
:what
comp[smirk]: {黙|だま}って {最後|さいご} まで {聞|き}いた の 。 それ から 、 お{医者|いしゃ} さん の {腰|こし} の {痛|いた}み に ついて 、 {一時間|いちじかん} {説明|せつめい} して あげた 。 {図|ず} も {描|か}いて 。 || I listened quietly to the end. Then I explained his own back pain to him. For an hour. With diagrams.
comp[laugh]: {帰|かえ}る とき 、 {軟膏|なんこう} を {三|みっ}つ {買|か}って いった わ 。 {定価|ていか} で 。 || On his way out he bought three jars of salve. Full price.
comp: …… でも ね 。 あの とき {腹|はら} が {立|た}った の は 、 {本当|ほんとう} は {少|すこ}し {怖|こわ}かった から かも しれない 。 || …But you know. Maybe the real reason he made me so angry was that I was a little afraid.
comp: 「 {役|やく}に {立|た}たない 」 と {思|おも}われる の が 。 || Afraid of being thought useless.
comp[sad]: わたし 、 {頼|たの}まれる と {断|ことわ}れない でしょう 。 {夜中|よなか} でも 、 {熱|ねつ} を {出|だ}した {子|こ} が いれば {行|い}く 。 {隣|となり} の {村|むら} でも 。 それ は いい の 。 {好|す}き で やってる から 。 || I can't say no when someone asks, can I. Middle of the night, a child with a fever — I go. Even to the next village. That part's fine. I do it because I want to.
comp: {怖|こわ}い の は 、 いつか 「 いいえ 」 って {言|い}ったら 、 みんな が {店|みせ} に {来|こ}なく なる ん じゃ ない か って こと 。 {役|やく}に {立|た}つ から {好|す}かれてる だけ なん じゃ ない か って 。 || What scares me is that if I ever said "no", everyone would stop coming to the shop. That I'm only liked because I'm useful.
!choice
* {役|やく}に {立|た}つ から 、 {一緒|いっしょ} に いる わけ じゃ ない || That's not why I travel with you. -> reassure
* {断|ことわ}って も 、 {来|く}る {人|ひと} は {来|く}る よ || The people who matter will keep coming even if you say no. -> honest
* わたし も 、 {同|おな}じ こと を {考|かんが}える || I think the same about myself. -> share
:reassure
!var sb_tone = 2
comp[shy]: …… ずるい なあ 。 そう いう こと を 、 {暗|くら}い {部屋|へや} で {言|い}う の は 。 {顔|かお} が {見|み}えない から 、 {信|しん}じる しか ない じゃ ない 。 || …That's unfair. Saying something like that in a dark room. I can't see your face, so I've no choice but to believe you.
!goto jar
:honest
!var sb_tone = 3
comp[think]: …… そう ね 。 {来|こ}なく なる {人|ひと} は 、 {来|こ}なく なる 。 {来|く}る {人|ひと} は 、 {来|く}る 。 {薬|くすり} と {同|おな}じ で 、 {効|き}く {人|ひと} に しか {効|き}かない の かも 。 || …You're right. The ones who'd stop coming will stop. The ones who come will come. Like medicine — it only works on the people it works on.
comp[smile]: {薬師|くすし} らしい {答|こた}え に なっちゃった 。 || That turned into a very apothecary sort of answer.
!goto jar
:share
!var sb_tone = 3
pc: {役|やく}に {立|た}たなく なったら 、 {誰|だれ} も {待|ま}って いない ん じゃ ない か って 。 {時々|ときどき} 、 {思|おも}う 。 || That if I stopped being useful, no one would be waiting for me. Sometimes I think that.
comp[surprise]: …… あなた も ？ || …You too?
comp[smile]: じゃあ 、 {約束|やくそく} 。 {役|やく}に {立|た}たない {日|ひ} が あって も 、 お{互|たが}い {待|ま}って いる こと 。 {三十二番目|さんじゅうにばんめ} の {主義|しゅぎ} に する わ 。 || Then it's a promise. Even on days we're useless, we wait for each other. I'll make it rule number thirty-two.
:jar
comp[shy]: …… {誰|だれ} に も {言|い}って ない こと 、 {一|ひと}つ {言|い}って いい ？ || …Can I tell you one thing I've never told anyone?
comp: わたし の {家|いえ} に は 、 ラベル の ない {瓶|びん} が {一|ひと}つ だけ ある の 。 || In my house there's exactly one jar with no label.
comp: {中|なか} に は 、 {紙|かみ} の {切|き}れ{端|はし} が {入|はい}ってる 。 {決|き}め{切|き}れない こと を {書|か}いて 、 {入|い}れて おく の 。 {断|ことわ}りたかった {頼|たの}み とか 、 {言|い}えなかった {言葉|ことば} とか 。 || Inside are scraps of paper. I write down things I can't make up my mind about and put them in. Requests I wanted to refuse. Things I couldn't say.
comp[smile]: {名前|なまえ} を つけたら 、 {答|こた}え を {出|だ}さなきゃ いけない {気|き} が して 。 だから あの {瓶|びん} だけ は 、 {名無|なな}し なの 。 || If I labelled it, I'd feel I had to come up with answers. So that one jar has no name.
!choice
* {今夜|こんや} の こと も 、 {入|い}れる ？ || Will tonight go in the jar? -> jarin
* いい {瓶|びん} だ ね || It sounds like a good jar. -> good
:jarin
comp[laugh]: …… {今夜|こんや} の は {入|い}れない 。 {決|き}め{切|き}れない こと じゃ ない もの 。 {話|はな}して よかった 。 {決|き}まり 。 || …Tonight's not going in. It isn't something I can't decide about. I'm glad I told you. Decided.
!goto night
:good
comp[shy]: いい {瓶|びん} …… かな 。 {散|ち}らかった {瓶|びん} だけど 。 …… うん 。 ありがとう 。 || A good jar… is it? It's a messy jar. …Mm. Thank you.
:night
comp[smile]: おやすみ なさい 。 …… あ 、 {湯|ゆ}たんぽ 、 もう {一|ひと}つ ある けど 、 いる ？ || Good night. …Oh, I have another hot-water bottle, if you want it?
`, 'ch4/quiet-mio');

// ---- Ren -------------------------------------------------------------------------------
RB.script.add(`
@scene sb.quiet_ren
comp: …… $name 。 {起|お}きて います か 。 || …$name. Are you awake?
comp: {明日|あした} の {道|みち} を 、 {頭|あたま} の {中|なか} で {三回|さんかい} {歩|ある}きました 。 {三回|さんかい} とも 、 {違|ちが}う {所|ところ} に {着|つ}きました 。 || I've walked tomorrow's route three times in my head. I arrived somewhere different each time.
!choice
* {一本道|いっぽんみち} なのに ？ || On a single road? -> joke
* {明日|あした} は 、 {一緒|いっしょ} に {歩|ある}く よ || We'll walk it together tomorrow. -> gentle
:joke
!var sb_tone = 1
comp[smirk]: {一本道|いっぽんみち} で {迷|まよ}う の は 、 {才能|さいのう} です 。 {師匠|ししょう} に も そう {言|い}われました 。 {褒|ほ}め{言葉|ことば} では ありません でした 。 || Getting lost on a single road is a talent. My teacher told me so. It was not a compliment.
!goto story
:gentle
comp[smile]: …… {心強|こころづよ}い です 。 {灯守|ひもり} が {言|い}う の も {変|へん} です が 。 || …That's reassuring. Strange thing for a keeper to say.
:story
comp: {見習|みなら}い の ころ 、 {灯|あか}り{堂|どう} の {倉庫|そうこ} で 、 {半日|はんにち} {迷子|まいご} に なった こと が あります 。 || When I was an apprentice, I got lost in the Lantern Hall's storeroom for half a day.
comp: {部屋|へや} は {一|ひと}つ しか ありません 。 {棚|たな} が {多|おお}かった だけ です 。 || It's a single room. There were simply a lot of shelves.
comp: {師匠|ししょう} が {見|み}つけて くれました 。 わたし が {灯|あか}り の {名前|なまえ} を {順番|じゅんばん} に {唱|とな}えて いる {声|こえ} を 、 {頼|たよ}り に して 。 || My teacher found me — by following the sound of my voice reciting the lantern names in order.
comp: {師匠|ししょう} は {聞|き}きました 。 「 {迷子|まいご} か 」 。 わたし は {答|こた}えました 。 「 いいえ 。 {灯|あか}り の {番|ばん} を して いた の です 」 。 || My teacher asked, "Lost?" And I answered, "No. I was keeping watch over the lanterns."
comp[smirk]: {灯守|ひもり} です から 。 || Being a keeper.
!choice
* {笑|わら}う || Laugh. -> laugh
* …… {今|いま} の 、 {駄洒落|だじゃれ} ？ || …Was that a pun? -> pun
:laugh
!var sb_tone = 1
comp[laugh]: …… よかった 。 {笑|わら}って もらえる と 、 {話|はな}した {甲斐|かい} が あります 。 || …Good. A story's worth telling when someone laughs.
!goto teach
:pun
comp[shy]: {解説|かいせつ} を {求|もと}められた {駄洒落|だじゃれ} は 、 {負|ま}け です 。 {師匠|ししょう} も そう {言|い}って いました 。 || A pun that has to be explained has lost. My teacher said that too.
:teach
comp[think]: …… {師匠|ししょう} の {言葉|ことば} は 、 {全部|ぜんぶ} {覚|おぼ}えて います 。 {一|ひと}つ {残|のこ}らず 。 || …I remember every word my teacher said. Every single one.
comp: {灯|あか}り の {名|な} の {書|か}き{方|かた} 。 {雨|あめ} の {日|ひ} の {芯|しん} の {切|き}り{方|かた} 。 {迷|まよ}ったら 、 {音|おと} の する ほう へ 。 {全部|ぜんぶ} 。 || How to write a lantern's name. How to trim a wick on a rainy day. When lost, go toward the sound. All of it.
comp[sad]: でも …… {顔|かお} が 、 {思|おも}い{出|だ}せない んです 。 || But… I can't remember the face.
comp: {声|こえ} の {高|たか}さ も 、 {背|せ} の {高|たか}さ も 、 {笑|わら}い{方|かた} も 。 {何年|なんねん} か {前|まえ} 、 {師匠|ししょう} は {山|やま} の {書庫|しょこ} へ {行|い}きました 。 {誰|だれ} か と {話|はなし} を つけ に 。 それ きり です 。 || Not the pitch of the voice, not how tall, not the way they laughed. Some years ago my teacher went to the archive in the mountains, to have it out with someone. That was the last I saw of them.
comp: {灯守|ひもり} が {人|ひと} の {顔|かお} を {忘|わす}れる なんて 、 {言|い}えません でした 。 {誰|だれ} に も 。 ツル さん に も 。 || A keeper who forgets a face — I couldn't admit it. Not to anyone. Not even to Tsuru.
comp: {怖|こわ}い の は 、 いつか {言葉|ことば} の ほう も {消|き}える こと です 。 {毎晩|まいばん} 、 {寝|ね}る {前|まえ} に {一|ひと}つ ずつ {唱|とな}えて います 。 {手|て} を {伸|の}ばして 、 {何|なに} も ない {夜|よる} が {来|く}る の が 、 {怖|こわ}い 。 || What frightens me is that one day the words will go too. Every night before sleep, I recite them one by one. I'm afraid of the night I reach for one and there's nothing there.
!choice
* {一|ひと}つ 、 {聞|き}かせて || Tell me one of them. -> recite
* {消|き}えたら 、 わたし が {覚|おぼ}えて おく || If they go, I'll remember them for you. -> keep
* {顔|かお} も 、 どこ か に {残|のこ}って いる かも || The face might still be somewhere. -> hope
:recite
!var sb_tone = 2
comp: …… 「 {名|な} は {灯|ひ} に 、 {灯|ひ} は {人|ひと} に 、 {人|ひと} は {名|な} に 」 。 {最初|さいしょ} に {教|おそ}わった {言葉|ことば} です 。 || …"A name to the lamp, the lamp to people, people to the name." The first thing I was taught.
comp[smile]: {続|つづ}き は …… {明日|あした} に しましょう 。 {一晩|ひとばん} に {一|ひと}つ 。 {決|き}まり です から 。 || The rest… let's save for tomorrow. One a night. That's the rule.
!goto sleep
:keep
!var sb_tone = 3
comp[surprise]: …… それ は 、 {灯守|ひもり} が {言|い}う {台詞|せりふ} です よ 。 || …That's a keeper's line, you know.
comp[smile]: でも 、 {受|う}け{取|と}って おきます 。 {大切|たいせつ} に 。 || But I'll accept it. And keep it carefully.
!goto sleep
:hope
!var sb_tone = 2
comp[think]: どこ か に 。 …… そう です ね 。 {名前|なまえ} が {残|のこ}る {場所|ばしょ} が ある なら 、 {顔|かお} が {残|のこ}る {場所|ばしょ} が あって も おかしく ない 。 || Somewhere. …Yes. If there are places where names survive, it wouldn't be strange for there to be places where faces do.
:sleep
comp: …… {話|はな}しすぎました 。 {明日|あした} の {灯|あか}り は 、 わたし が {守|まも}ります 。 あなた の {背中|せなか} は 、 {灯|あか}り が {守|まも}ります 。 おやすみ なさい 。 || …I've talked too much. Tomorrow I'll look after the lamp. And the lamp will look after your back. Good night.
`, 'ch4/quiet-ren');

// ---- Suzu -------------------------------------------------------------------------------
RB.script.add(`
@scene sb.quiet_suzu
comp: ねえ 、 {起|お}きてる ？ …… {起|お}きてる よね 。 {息|いき} の {音|おと} で わかる 。 {客席|きゃくせき} の {寝息|ねいき} は 、 {舞台|ぶたい} から よく {聞|き}こえる の 。 || Hey, you awake? …You are. I can tell by your breathing. You can hear the audience snoring very clearly from the stage.
!choice
* {寝|ね}てる お{客|きゃく} が いた の ？ || People slept through your shows? -> sleep
* {眠|ねむ}れない の ？ || Can't sleep? -> cant
:sleep
!var sb_tone = 1
comp[laugh]: {毎回|まいかい} {一人|ひとり} は いる よ 。 {最前列|さいぜんれつ} に 。 {不思議|ふしぎ} な こと に 、 {同|おな}じ おじいさん の とき も ある 。 {町|まち} が {違|ちが}う のに 。 || Every show has one. Front row. Funnily enough, sometimes it's the same old man. In a different town.
!goto goat
:cant
comp[smile]: {吹雪|ふぶき} の {音|おと} って 、 {拍手|はくしゅ} に {似|に}て ない ？ {鳴|な}り{止|や}まない {拍手|はくしゅ} 。 …… {嘘|うそ} 。 ぜんぜん {似|に}て ない 。 {怖|こわ}い だけ 。 || Doesn't a storm sound like applause? Applause that won't stop. …Lie. Not the slightest bit. It's just scary.
:goat
comp: ヤギ と いえば ね 。 {昔|むかし} 、 {一座|いちざ} に ヤギ が いた の 。 {名前|なまえ} は 「 {座長|ざちょう} 」 。 || Speaking of goats. The troupe used to have a goat. Its name was "Director".
comp: {本物|ほんもの} の {座長|ざちょう} が {付|つ}けた の 。 {自分|じぶん} より {言|い}う こと を {聞|き}かない やつ に は 、 {似合|にあ}い の {名前|なまえ} だ って 。 || The real director named it. Said anything that listened to him even less than he did deserved the title.
comp[laugh]: ある {晩|ばん} 、 お{芝居|しばい} の いちばん {泣|な}ける {場面|ばめん} で 、 その ヤギ が {舞台|ぶたい} に {上|あ}がって きて 、 {幕|まく} を {食|た}べ{始|はじ}めた の 。 || One night, right in the most tear-jerking scene of the play, that goat walked onstage and started eating the curtain.
comp: {客席|きゃくせき} は {大|おお}{笑|わら}い 。 {次|つぎ} の {町|まち} でも 「 ヤギ の {場面|ばめん} は ？ 」 って {聞|き}かれて 、 {結局|けっきょく} その {旅|たび} の {間|あいだ} ずっと 、 ヤギ に {幕|まく} を {食|た}べて もらった 。 || The audience roared. In the next town people asked, "Where's the goat scene?" — so for the rest of that tour, we had the goat eat the curtain every night.
comp[smirk]: {幕|まく} {代|だい} で {一座|いちざ} は {赤字|あかじ} に なった けど ね 。 {帳簿|ちょうぼ} は あたし が つけてた から 、 よく {覚|おぼ}えてる 。 {一枚|いちまい} {八百|はっぴゃく} 。 || The curtains put the troupe in the red. I kept the books, so I remember exactly. Eight hundred a curtain.
!choice
* {八百|はっぴゃく} …… {細|こま}かい ね || Eight hundred… you remember the exact figure? -> exact
* ヤギ は {元気|げんき} ？ || Is the goat still around? -> goatnow
:exact
!var sb_tone = 1
comp[laugh]: {借|か}り と {貸|か}し は 、 {全部|ぜんぶ} {覚|おぼ}えてる の 。 {冗談|じょうだん} は {忘|わす}れて も 、 {数字|すうじ} は {忘|わす}れない 。 {変|へん} でしょ 。 || I remember every debt and every loan. I might forget a joke, but never a figure. Weird, right?
!goto fear
:goatnow
comp[smile]: {座長|ざちょう} は ね 、 {引退|いんたい} して 、 {灰実|はいみ} の {里|さと} の {果樹園|かじゅえん} で {草|くさ} を {食|た}べてる 。 {幕|まく} より {美味|おい}しい って 。 || The Director retired to an orchard in Cinder Orchard and eats grass now. Says it tastes better than curtains.
:fear
comp: …… {灰実|はいみ} の {里|さと} で 、 ヒロ に {本当|ほんとう} の こと を {話|はな}して から 、 {時々|ときどき} {考|かんが}える の 。 || …Since I told Hiro the truth back in Cinder Orchard, I sometimes think about it.
comp: あたし の {口|くち} から は 、 {冗談|じょうだん} が {先|さき} に {出|で}る 。 {本当|ほんとう} の こと は 、 いつも {二番目|にばんめ} 。 || Jokes always come out of my mouth first. The truth is always second.
comp[sad]: {怖|こわ}い の は ね 。 いつか 、 {二番目|にばんめ} が {来|こ}ない {日|ひ} が {来|く}る こと 。 {冗談|じょうだん} だけ で 、 {幕|まく} が {下|お}りちゃう {日|ひ} 。 || What I'm afraid of is that one day the second one won't come. That the curtain will come down on nothing but jokes.
!choice
* {今|いま} の は 、 {何番目|なんばんめ} ？ || And which one was that just now? -> which
* {待|ま}つ よ 。 {二番目|にばんめ} を || I'll wait. For the second one. -> wait
* スズ の {冗談|じょうだん} に は 、 {助|たす}けられてる よ || Your jokes have helped me, you know. -> helped
:which
!var sb_tone = 1
comp[surprise]: …… {一番目|いちばんめ} だった 。 {今|いま} の が 。 あはは 、 {珍|めずら}しい 。 {本当|ほんとう} の こと が {先|さき} に {出|で}た 。 || …That was the first one. Just now. Ha — how rare. The truth came out first.
!goto book
:wait
!var sb_tone = 2
comp[shy]: …… {待|ま}って くれる {客|きゃく} は 、 {貴重|きちょう} だよ 。 {最前列|さいぜんれつ} の おじいさん より も ね 。 || …An audience that waits is precious. More than the old man in the front row.
!goto book
:helped
!var sb_tone = 3
comp[smile]: {本当|ほんとう} ？ …… じゃあ 、 {帳簿|ちょうぼ} に つけて おこう 。 {貸|か}し {一|いち} 。 || Really? …Then I'll put it in the books. One in credit.
:book
comp: {誰|だれ} に も {見|み}せた こと が ない の 、 これ 。 || I've never shown anyone this.
narr: スズ は {枕元|まくらもと} の {帳簿|ちょうぼ} を {開|ひら}いた 。 {最後|さいご} の {頁|ページ} に だけ 、 {数字|すうじ} が ない 。 {名前|なまえ} と 、 {短|みじか}い {言葉|ことば} が {並|なら}んで いる 。 || Suzu opens the account book by her pillow. The last page alone has no numbers — only names and short phrases.
comp: 「 {返|かえ}せない {借|か}り 」 の {頁|ページ} 。 {雨|あめ} の {日|ひ} に {傘|かさ} を くれた {人|ひと} 。 {初舞台|はつぶたい} で {一人|ひとり} だけ {拍手|はくしゅ} して くれた {子|こ} 。 お{金|かね} じゃ {返|かえ}せない もの 。 || The page for debts I can't repay. The person who gave me an umbrella on a rainy day. The one child who clapped at my first show. Things money can't pay back.
comp[shy]: …… あんた の {名前|なまえ} も ある よ 。 {結構|けっこう} {長|なが}く なって きた 。 {困|こま}った もん だ ね 。 || …Your name's in there too. It's getting rather long. What a problem.
!choice
* わたし も 、 スズ の {頁|ページ} を つけて おく || I'll keep a page for you too. -> mine
* {返|かえ}さなくて いい よ || You don't have to pay it back. -> free
:mine
comp[laugh]: お{互|たが}い の {借|か}り ！ {永遠|えいえん} に {締|し}まらない {帳簿|ちょうぼ} だ 。 …… {悪|わる}く ない ね 。 || Debts both ways! Books that'll never balance. …Not bad.
!goto end_s
:free
comp[smile]: {返|かえ}す よ 。 {返|かえ}し{続|つづ}ける 。 それ が あたし の {芸|げい} だ から 。 || I'll pay it back. I'll keep on paying it back. That's my act.
:end_s
comp: さて 、 {本日|ほんじつ} の {公演|こうえん} は これ にて {終幕|しゅうまく} 。 …… おやすみ 、 $name 。 || And with that, tonight's performance comes to a close. …Good night, $name.
`, 'ch4/quiet-suzu');

// ---- morning ---------------------------------------------------------------------------
RB.script.add(`
@scene sb.quiet_morning
!fade out
!set sb_quiet_done
!set sb_morning
!heal
!music -
narr: いつ の {間|ま} に か 、 {風|かぜ} の {音|おと} は やんで いた 。 || At some point, the wind stopped.
!fade in
!music snowbell
narr: {朝|あさ} 。 {窓|まど} の {外|そと} は 、 {目|め} が {痛|いた}い ほど {白|しろ}い 。 {空|そら} に は {雲|くも} {一|ひと}つ ない 。 || Morning. Outside the window, the world is so white it hurts to look at. There isn't a cloud in the sky.
?(comp=nao&var.sb_tone=1) comp[smirk]: ヤギ の {夢|ゆめ} を {見|み}た 。 {十三頭|じゅうさんとう} いた 。 …… {誰|だれ} の せい だ 。 || I dreamed about goats. There were thirteen. …Whose fault is that.
?(comp=nao&var.sb_tone>=2) comp: …… {昨夜|ゆうべ} は 、 どうも 。 {行|い}こう 。 {灯|あか}り が {待|ま}ってる 。 || …Thanks for last night. Let's go. The lamp's waiting.
?(comp=mio&var.sb_tone=1) comp[laugh]: おはよう 。 {主義|しゅぎ} {第一条|だいいちじょう} 、 「 {朝|あさ} ごはん は {抜|ぬ}かない 」 。 {下|した} に {行|い}きましょう 。 || Morning. Rule number one: never skip breakfast. Let's go down.
?(comp=mio&var.sb_tone>=2) comp[smile]: おはよう 。 …… {久|ひさ}しぶり に 、 よく {眠|ねむ}れた わ 。 {瓶|びん} の {中|なか} が 、 {少|すこ}し {軽|かる}く なった {気|き} が する 。 || Morning. …I slept well, for once. The jar feels a little lighter.
?(comp=ren&var.sb_tone=1) comp[smirk]: おはよう ございます 。 {今朝|けさ} は {迷|まよ}わず に {起|お}きられました 。 {布団|ふとん} から {出|で}る {道|みち} は 、 {一本道|いっぽんみち} でした 。 || Good morning. I managed to wake without getting lost. The road out of the futon was a single road.
?(comp=ren&var.sb_tone>=2) comp[smile]: おはよう ございます 。 {昨夜|ゆうべ} 、 {言葉|ことば} は {一|ひと}つ も {欠|か}けて いません でした 。 {今朝|けさ} も 。 {行|い}きましょう 。 || Good morning. Last night, not a single word was missing. This morning neither. Let's go.
?(comp=suzu&var.sb_tone=1) comp[laugh]: おはよう ！ {昨夜|ゆうべ} の {客|きゃく} 、 {最後|さいご} まで {起|お}きてた ね 。 {優秀|ゆうしゅう} 。 {特別|とくべつ} {席|せき} に {招待|しょうたい} しよう 。 || Morning! Last night's audience stayed awake to the end. Excellent. You're invited to the special seats.
?(comp=suzu&var.sb_tone>=2) comp[smile]: おはよう 。 …… {帳簿|ちょうぼ} 、 {今朝|けさ} {一行|いちぎょう} {増|ふ}やした よ 。 {何|なに} を {書|か}いた か は 、 {秘密|ひみつ} 。 || Morning. …I added a line to the books this morning. What I wrote is a secret.
yae: {起|お}きた かい ？ {下|した} に ホシノ さん が {来|き}てる よ 。 {朝|あさ} ごはん も できてる 。 || Up, are you? Hoshino's downstairs. Breakfast's ready too.
!autosave
`, 'ch4/quiet-morning');
