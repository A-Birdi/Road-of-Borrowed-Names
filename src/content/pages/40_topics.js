/* Talk about this road (addendum §11.6): after the page is finished, a finite
 * bank of 12 topics per companion — four everyday travel habits (h1–h4), four
 * reflections on what you actually shared (r1–r4) and four observations about
 * current discoveries, pets and places (o1–o4). Every slot has a line for each
 * true state (a pet or none, expeditions finished or not, keepsakes or none,
 * camp or home), so nothing is claimed that did not happen.
 * Offered only when asked: "Talk about this road" at an Atlas camp (once per
 * outing) and by talking to your companion in the Lantern Hall after coming
 * home (once per homecoming). No bond, no reward, no counter; recently heard
 * topics are skipped, and when every topic has been heard a brief ordinary
 * line is enough. Selection: RB.pages.topic (10_pages.js). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene pages.road.camp
!hook pages_topic camp

@scene pages.road.home
!hook pages_topic home

# ======================================================================================
# Nao
# ======================================================================================
@scene road.nao.h1
nao: {新|あたら}しい {場所|ばしょ} に {入|はい}ったら 、 まず {出口|でぐち} を {二|ふた}つ {数|かぞ}える 。 {癖|くせ} だ 。 || When I walk into a new place, first thing I count two exits. Habit.
?(pages.at=camp) nao: ここ は …… {来|き}た {道|みち} と 、 {先|さき} の {分|わ}かれ{道|みち} 。 {二|ふた}つ ある 。 {落|お}ち{着|つ}く 。 || Here it's… the way we came and the fork ahead. Two. That settles me.
?(pages.at=home) nao: {灯|あか}り{堂|どう} は {戸口|とぐち} が {一|ひと}つ しか ない 。 でも 、 ここ は {帰|かえ}って くる {場所|ばしょ} だ から 、 {数|かぞ}えなくて いい 。 || The Lantern Hall's only got the one door. But this is where we come back to, so I don't need to count.
pc: {入口|いりぐち} も {数|かぞ}える の ？ || Do you count the entrances too?
nao[smirk]: {入口|いりぐち} は 、 {誰|だれ}か が {入|はい}って くる {所|ところ} だ 。 そっち の {方|ほう} が {大事|だいじ} な {時|とき} も ある 。 || Entrances are where someone comes in. Sometimes that matters more.

@scene road.nao.h2
nao: {宛名|あてな} を {書|か}き{直|なお}す {時|とき} 、 {元|もと} の {字|じ} の {癖|くせ} を {少|すこ}し だけ {残|のこ}す んだ 。 || When I rewrite an address, I leave a little of the original handwriting's quirks in.
nao: {全部|ぜんぶ} きれい に したら 、 {誰|だれ} が {書|か}いた か {分|わ}からなく なる 。 {誰|だれ} から か {分|わ}からない {手紙|てがみ} は 、 {半分|はんぶん} しか {届|とど}いて ない 。 || Make it all neat and you can't tell who wrote it. A letter you can't tell who it's from has only half arrived.
pc: …… {灯落|ひおち} の {宛名|あてな} みたい に ？ || …Like the addresses in Lanternfall?
nao: そう 。 あそこ の {字|じ} は 、 {上手|じょうず} すぎて {誰|だれ} の でも なかった 。 || Right. The writing there was so neat it belonged to nobody.

@scene road.nao.h3
nao: {鞄|かばん} の {詰|つ}め{方|かた} に は {順番|じゅんばん} が ある 。 {急|いそ}ぎ の {手紙|てがみ} は {一番|いちばん} {上|うえ} 、 {重|おも}い {物|もの} は {背中|せなか} {側|がわ} 。 || There's an order to packing the bag. Urgent letters on top, heavy things against your back.
nao: {宛名|あてな} の {束|たば} は …… {一番|いちばん} {下|した} 。 {一番|いちばん} {重|おも}い から 。 {重|おも}さ の {意味|いみ} は 、 {聞|き}く な よ 。 || The bundle of labels goes… at the very bottom. It's the heaviest. Don't ask what I mean by heavy.
?(bond>=trusted) nao[smirk]: {鞄|かばん} の {中身|なかみ} を {人|ひと} に {話|はな}す の は 、 {初|はじ}めて だ 。 {配達人|はいたつにん} の {秘密|ひみつ} だ ぞ 。 || First time I've told anyone what's in the bag. That's a courier secret, mind.

@scene road.nao.h4
nao: {近道|ちかみち} は {好|す}き だ 。 でも 、 {二人|ふたり} で {歩|ある}く {時|とき} は 、 {遠回|とおまわ}り も {悪|わる}くない 。 || I like shortcuts. But when there are two of us, the long way round isn't bad either.
nao: {一人|ひとり} だ と {急|いそ}ぐ 。 {急|いそ}ぐ と 、 {見落|みお}とす 。 {配達|はいたつ} で {一番|いちばん} {怖|こわ}い の は 、 {見落|みお}とし だ 。 || On my own I hurry. When I hurry, I miss things. The scariest thing in deliveries is missing something.

@scene road.nao.r1
nao: {灯|あか}り{堂|どう} の {壁|かべ} の {札|ふだ} 、 {時々|ときどき} {見|み}に {行|い}く んだ 。 || I go and look at the card on the Lantern Hall wall now and then.
?(pages.theme=next) nao: {次|つぎ} の {誰|だれ}か が あれ を {読|よ}んで 、 {自分|じぶん} で {決|き}めて {歩|ある}いて くれたら いい 。 || I hope whoever comes next reads it, and then decides for themselves.
?(pages.theme=back) nao: {帰|かえ}り{道|みち} の {札|ふだ} が {壁|かべ} に ある と 、 {出|で}かける {時|とき} {気|き} が {楽|らく} だ 。 {変|へん} だ よ な 。 || Having a way-home card on the wall makes it easier to set out. Funny, that.
nao: {表|おもて} の {一言|ひとこと} を {選|えら}んだ の は $name だ 。 {読|よ}む たび に 、 それ を {思|おも}い{出|だ}す 。 || You chose the line on the front. I remember that every time I read it.

@scene road.nao.r2
?(pages.completed>=1) nao: {書|か}かれて いない {道|みち} を 、 {最後|さいご} まで {歩|ある}いた {日|ひ} が ある だろ 。 {灯|ひ} の {中|なか} に {葦|あし}ノ{瀬|せ} の {字|じ} が {見|み}えた {時|とき} 。 || Remember walking an unwritten road all the way to the end? When we saw Reedwake's name inside the lantern.
?(pages.completed>=1) nao: {宛先|あてさき} が {読|よ}める って 、 やっぱり いい もん だ 。 || Being able to read where you're going — still a good feeling.
?(!pages.completed>=1) nao: {書|か}かれて いない {道|みち} を 、 まだ {一度|いちど} も {最後|さいご} まで {歩|ある}いて ない な 。 || We haven't walked an unwritten road all the way to the end yet.
?(!pages.completed>=1) nao: {焦|あせ}らなくて いい 。 {引|ひ}き{返|かえ}す の も 、 {立派|りっぱ} な {帰|かえ}り{方|かた} だ 。 || No need to rush. Turning back is a perfectly good way home.

@scene road.nao.r3
?(memory.ending:nao) nao: {橋|はし} の {上|うえ} で {話|はな}した {日|ひ} から 、 {配達|はいたつ} の {予定|よてい} を {一人|ひとり} で {決|き}めなく なった 。 || Since that day we talked on the bridge, I've stopped planning the rounds on my own.
?(!memory.ending:nao) nao: {灯|あか}り{堂|どう} で やっと {話|はな}した {日|ひ} から 、 {配達|はいたつ} の {予定|よてい} を {一人|ひとり} で {決|き}めなく なった 。 || Since the day we finally talked in the Lantern Hall, I've stopped planning the rounds on my own.
nao: {相談|そうだん} する {相手|あいて} が いる と 、 {道|みち} が {一本|いっぽん} {増|ふ}える 。 {不思議|ふしぎ} だ 。 || Having someone to talk it over with is like having one more road. Strange.

@scene road.nao.r4
?(quest.lf_nao=done) nao: ウミ の {一行|いちぎょう} の {返事|へんじ} 、 {時々|ときどき} {思|おも}い{出|だ}す 。 「 {読|よ}みました 」 。 {短|みじか}い のに 、 {重|おも}さ が ちょうど いい 。 || I think about Umi's one-line reply sometimes. "I read it." Short, but exactly the right weight.
?(quest.lf_nao=done) nao: {届|とど}けて 、 {決|き}めて もらう 。 {配達人|はいたつにん} の {仕事|しごと} は 、 それ で {全部|ぜんぶ} だ 。 || Deliver it, and let them decide. That's the whole of a courier's job.
?(!quest.lf_nao=done) nao: {鞄|かばん} の {底|そこ} の {手紙|てがみ} 、 まだ {持|も}ってる 。 {届|とど}ける {日|ひ} は 、 {自分|じぶん} で {決|き}める 。 {逃|に}げてる わけ じゃ ない 。 || The letter at the bottom of the bag — I've still got it. I'll pick the day to deliver it myself. I'm not running from it.
?(!quest.lf_nao=done) nao: …… {灯落|ひおち} に {寄|よ}る {時|とき} は 、 {付|つ}き{合|あ}って くれ 。 || …When we pass through Lanternfall, come with me.

@scene road.nao.o1
?(petvis=cat) nao: {猫|ねこ} は {地図|ちず} の {上|うえ} に {座|すわ}る の が {好|す}き だ な 。 {一番|いちばん} {大事|だいじ} な {所|ところ} を {必|かなら}ず {隠|かく}す 。 || The cat loves sitting on the map. Always right on the important bit.
?(petvis=dog) nao: {犬|いぬ} は {道|みち} を {鼻|はな} で {覚|おぼ}える 。 {字|じ} が {読|よ}めなくて も 、 {帰|かえ}り{道|みち} は {間違|まちが}えない 。 いい な 。 || Dogs learn roads with their noses. Can't read, never mistake the way home. Must be nice.
?(petvis=bird) nao: {鳥|とり} は {上|うえ} から {道|みち} を {見|み}てる 。 {出口|でぐち} を {数|かぞ}える {必要|ひつよう} も ない ん だろう な 。 || Birds see the road from above. Probably never need to count exits.
?(petvis=tanuki) nao: たぬき って 、 {鞄|かばん} の {匂|にお}い を {確|たし}かめて から じゃ ない と {寝|ね}ない んだ な 。 {慎重|しんちょう} な {奴|やつ} だ 。 || The tanuki won't sleep till it's sniffed the bag. Careful creature.
?(petvis) nao: {連|つ}れ が {一匹|いっぴき} いる と 、 {見張|みは}り も {気|き} が {楽|らく} だ 。 || With one more along, keeping watch is easier.
?(!petvis) nao: {港|みなと} の {犬|いぬ} に は 、 {昔|むかし} よく {荷物|にもつ} を {盗|ぬす}まれた 。 {動物|どうぶつ} の {連|つ}れ は いない けど 、 {今|いま} の {荷物|にもつ} は {安全|あんぜん} だ 。 || The harbour dog used to steal from my bags all the time. No animal travelling with us — but the luggage is safe these days.
?(!petvis) nao: {二人|ふたり} で ちょうど いい 。 {見張|みは}り も 、 {交代|こうたい} で {回|まわ}る 。 || Two's just right. We take turns keeping watch.

@scene road.nao.o2
?(atlas_restore_1) nao: {渡|わた}し{場|ば} の {新|あたら}しい {看板|かんばん} 、 {見|み}た か ？ {字|じ} が {太|ふと}くて 、 {霧|きり} の {朝|あさ} でも {読|よ}める 。 {誰|だれ} が {書|か}いた か 、 {知|し}ってる か ？ || Seen the new signboard at the ferry landing? Thick letters — you can read it even on a foggy morning. Know who wrote it?
?(atlas_restore_1) pc: {知|し}らない 。 || No idea.
?(atlas_restore_1) nao[smirk]: こっち も {知|し}らない 。 {良|よ}い {字|じ} は 、 {名前|なまえ} が なくて も {届|とど}く 。 || Me neither. Good handwriting gets through even without a name.
?(!atlas_restore_1) nao: {灯|あか}り{堂|どう} の {灯籠|とうろう} の {名前|なまえ} 、 {全部|ぜんぶ} {読|よ}める 。 {当|あ}たり{前|まえ} に なった けど 、 {前|まえ} は {当|あ}たり{前|まえ} じゃ なかった 。 || Every name on the Lantern Hall's lanterns can be read. It's become normal, but it didn't used to be.

@scene road.nao.o3
?(pages.keeps>=1) nao: {道|みち} で {見|み}つけた {小|ちい}さな {物|もの} の こと 、 $name は ちゃんと {覚|おぼ}えてる よ な 。 {届|とど}け{先|さき} の ない {荷物|にもつ} を {預|あず}かってる みたい で 、 {嫌|きら}い じゃ ない 。 || You remember the little things we've found on the road, don't you. Like holding parcels with no addressee. I don't mind it.
?(!pages.keeps>=1) nao: {灯|あか}り{堂|どう} の {札|ふだ} の {他|ほか} に 、 {形|かたち} の ある {土産|みやげ} は まだ ない な 。 それ で いい 。 {荷物|にもつ} は {軽|かる}い {方|ほう} が いい 。 || Apart from the card in the Lantern Hall, we haven't brought home much you can hold. That's fine. Lighter bags.

@scene road.nao.o4
?(pages.at=camp) nao: {書|か}かれて いない {道|みち} で {焚|た}き{火|び} を する の 、 {最初|さいしょ} は {変|へん} な {感|かん}じ だった 。 {紙|かみ} の {上|うえ} で {火|ひ} を {使|つか}う みたい で 。 || Making a fire on the unwritten roads felt odd at first. Like using fire on paper.
?(pages.at=camp) nao: {今|いま} は 、 {手紙|てがみ} の {上|うえ} で {休|やす}んでる みたい で 、 {悪|わる}くない 。 || Now it's like resting on top of a letter. Not bad.
?(pages.at=home) nao: {灯|あか}り{堂|どう} に {帰|かえ}る と 、 {最初|さいしょ} に ツル の {机|つくえ} を {見|み}る 。 {帳面|ちょうめん} の {位置|いち} が {変|か}わって ない と 、 {安心|あんしん} する 。 || When we get back to the Lantern Hall, the first thing I look at is Tsuru's desk. If the ledgers haven't moved, I relax.
?(pages.at=home) nao: {変|か}わらない {物|もの} が {一|ひと}つ ある と 、 {他|ほか} が {全部|ぜんぶ} {変|か}わって も {帰|かえ}って {来|こ}られる 。 || If one thing stays put, you can find your way back even if everything else changes.

@scene road.nao.quiet1
nao: …… {今日|きょう} は {特|とく}に ない 。 {黙|だま}って {歩|ある}く の も 、 {悪|わる}くない だろ 。 || …Nothing much today. Walking quiet's not bad either, right?
@scene road.nao.quiet2
nao: {話|はなし} は {尽|つ}きた 。 …… {嘘|うそ} だ 。 {明日|あした} に {取|と}って おく 。 || I'm all out of things to say. …That's a lie. I'm saving them for tomorrow.
@scene road.nao.quiet3
nao: {出口|でぐち} は {二|ふた}つ 。 {連|つ}れ は {一人|ひとり} 。 {問題|もんだい} なし 。 || Two exits. One companion. No problems.

# ======================================================================================
# Mio
# ======================================================================================
@scene road.mio.h1
mio: {瓶|びん} の ラベル 、 {少|すこ}し でも {曲|ま}がって いる と {気|き} に なる の 。 {旅|たび} の {間|あいだ} も 、 {毎晩|まいばん} {直|なお}して た 。 || If a bottle label's even slightly crooked, it bothers me. I straightened them every night on the journey.
mio: {最近|さいきん} は 、 {一|ひと}つ だけ {曲|ま}がった まま に して おく {練習|れんしゅう} を してる の 。 …… {三日|みっか} で {直|なお}しちゃった けど 。 || Lately I've been practising leaving just one crooked. …I fixed it after three days.

@scene road.mio.h2
mio: お{茶|ちゃ} は 、 {疲|つか}れて いる {時|とき} ほど {薄|うす}く {淹|い}れる の 。 {濃|こ}い と 、 {眠|ねむ}れなく なる から 。 || The more tired you are, the weaker I make the tea. Strong tea keeps you awake.
?(pages.at=camp) mio: だから 、 ここ の お{茶|ちゃ} は {少|すこ}し {薄|うす}め 。 …… {意味|いみ} は 、 {分|わ}かる でしょ ？ || So the tea out here is a little weak. …You get what that means?
?(pages.at=home) mio: {今日|きょう} の お{茶|ちゃ} は 、 {普通|ふつう} の {濃|こ}さ 。 {帰|かえ}って きた {日|ひ} は 、 それ で いい の 。 || Today's tea is the normal strength. On a day we get home, that's right.

@scene road.mio.h3
mio: {人|ひと} の {顔色|かおいろ} を {見|み}る の は 、 {仕事|しごと} の {癖|くせ} 。 でも 、 {言|い}わない で おく の も {覚|おぼ}えた 。 || Checking people's colour is a work habit. But I've learned to keep quiet about it too.
mio: {言|い}われたく ない {時|とき} も ある でしょ 。 {休|やす}みたい か どう か は 、 {本人|ほんにん} が {決|き}める こと 。 || Sometimes people don't want to be told. Whether you want a rest is your call.
pc: …… {今|いま} は ？ || …And right now?
mio[smile]: {聞|き}かれた から {言|い}う ね 。 {大丈夫|だいじょうぶ} そう 。 || Since you asked: you look fine.

@scene road.mio.h4
mio: {一日|いちにち} {一回|いっかい} 、 {何|なに}か に 「 いいえ 」 と {言|い}う {練習|れんしゅう} を してる の 。 {小|ちい}さな こと で いい から 。 || Once a day I practise saying "no" to something. Small things are fine.
mio: {昨日|きのう} は 、 {三杯目|さんばいめ} の お{茶|ちゃ} を {断|ことわ}った 。 {自分|じぶん} で {淹|い}れた お{茶|ちゃ} だ けど 。 || Yesterday I turned down a third cup of tea. One I'd made myself.
?(bond>=trusted) mio[laugh]: …… $name に も 、 {今度|こんど} {何|なに}か {断|ことわ}って みよう かな 。 {練習台|れんしゅうだい} に なって くれる ？ || …Maybe I'll try refusing you something next. Will you be my practice partner?

@scene road.mio.r1
?(pages.theme=pause) mio: ハナ さん の {茶屋|ちゃや} の {壁|かべ} の {札|ふだ} 、 {見|み}る と {座|すわ}りたく なる の 。 {効|き}き{目|め} が ある みたい 。 || Every time I see the card on Hana's teahouse wall, I want to sit down. It seems to work.
?(pages.theme=share) mio: ハナ さん の {茶屋|ちゃや} の {壁|かべ} の {札|ふだ} 、 {見|み}る たび に 、 {一人|ひとり} で {全部|ぜんぶ} やらなくて いい って {思|おも}い{出|だ}す の 。 || Every time I see the card on Hana's teahouse wall, I remember I don't have to do everything alone.
mio: {言葉|ことば} を {選|えら}んだ の は あなた 。 {絵|え} を {描|か}いた の は わたし 。 {分担|ぶんたん} も 、 ちょうど よかった 。 || You chose the words. I drew the picture. A good division of work, too.

@scene road.mio.r2
?(pages.completed>=1) mio: {道|みち} の {終|お}わり まで {行|い}けた {日|ひ} 、 {正直|しょうじき} 、 {少|すこ}し {誇|ほこ}らしかった 。 {無理|むり} を しない {旅|たび} でも 、 {最後|さいご} まで {行|い}ける んだ って 。 || The day we got to the end of a road, honestly, I was a little proud. You can get all the way even on a journey where nobody overdoes it.
?(!pages.completed>=1) mio: まだ {道|みち} の {終|お}わり まで は {行|い}って ない けど 、 {困|こま}って ない の 。 {途中|とちゅう} で {帰|かえ}って くる の も 、 {立派|りっぱ} な {旅|たび} よ 。 || We haven't reached the end of a road yet, but I don't mind. Coming back partway is a proper journey too.

@scene road.mio.r3
mio: あの {日|ひ} 、 {店|みせ} で {瓶|びん} を {渡|わた}した でしょ 。 {中身|なかみ} の ない {瓶|びん} 。 || That day at the shop, I gave you a bottle. An empty one.
mio: {今|いま} {思|おも}う と 、 {中身|なかみ} が ない から 、 {何|なに} でも {入|い}れられる の よ ね 。 || Thinking about it now — because there's nothing in it, you can put anything in.
?(memory.ending_retro:mio) mio: {灯|あか}り{堂|どう} で {話|はな}した {日|ひ} から 、 {少|すこ}し {肩|かた} の {力|ちから} が {抜|ぬ}けた の 。 {言|い}いそびれて いた こと って 、 {重|おも}い の ね 。 || And since the day we talked in the Lantern Hall, my shoulders have loosened a little. Things you never got round to saying are heavy.

@scene road.mio.r4
?(quest.lf_mio=done) mio: {記録館|きろくかん} で {断|ことわ}った {日|ひ} の こと 、 {今|いま} でも {時々|ときどき} {夢|ゆめ} に {見|み}る の 。 {怖|こわ}い {夢|ゆめ} じゃ ない 。 {声|こえ} が ちゃんと {出|で}る {夢|ゆめ} 。 || I still dream about the day I refused at the Records Hall sometimes. Not a frightening dream. One where my voice comes out properly.
?(!quest.lf_mio=done&quest.lf_mio>=2) mio: {灯落|ひおち} の {返事|へんじ} は 、 まだ {返|かえ}して ない 。 {忘|わす}れて は いない よ 。 {自分|じぶん} の {声|こえ} で 、 いつか 。 || I still haven't given my answer in Lanternfall. I haven't forgotten. In my own voice, someday.
?(!quest.lf_mio=done) mio: {断|ことわ}る の は 、 まだ {上手|じょうず} じゃ ない 。 でも 、 {上手|じょうず} に ならなくて も いい って 、 {最近|さいきん} {思|おも}う の 。 {言|い}えれば 、 それ で いい 。 || I'm still not good at refusing. But lately I think I don't have to be good at it. Being able to say it is enough.

@scene road.mio.o1
?(petvis=cat) mio: {猫|ねこ} は 、 {一番|いちばん} {暖|あたた}かい {場所|ばしょ} を {知|し}って いる の 。 {休|やす}む {場所|ばしょ} は 、 あの {子|こ} に {任|まか}せよう かしら 。 || The cat always knows the warmest spot. Maybe I'll leave choosing where we rest to it.
?(petvis=dog) mio: {犬|いぬ} って 、 {疲|つか}れたら すぐ {寝|ね}る でしょ 。 {我慢|がまん} しない の 。 {見習|みなら}いたい わ 。 || Dogs fall asleep the moment they're tired, don't they. No enduring it. I'd like to learn from that.
?(petvis=bird) mio: {鳥|とり} は {朝|あさ} {早|はや}く {起|お}きて 、 {夜|よる} は {早|はや}く {寝|ね}る 。 {一番|いちばん} {体|からだ} に いい {暮|く}らし を して いる の は 、 あの {子|こ} ね 。 || The bird gets up early and goes to bed early. That one lives the healthiest life of any of us.
?(petvis=tanuki) mio: たぬき って 、 {困|こま}ったら {寝|ね}た {振|ふ}り を する って {言|い}う でしょ 。 {休|やす}み {方|かた} の {名人|めいじん} よ ね 。 || They say tanuki pretend to be asleep when they're in trouble. A master of resting.
?(!petvis) mio: {動物|どうぶつ} の {連|つ}れ は いない けど 、 {薬草|やくそう} の {袋|ふくろ} に は 、 よく {虫|むし} が {住|す}み{着|つ}く の 。 …… {連|つ}れ と は {呼|よ}ばない けど 。 || No animal travels with us, but insects are always moving into my herb bags. …I wouldn't call them companions.

@scene road.mio.o2
?(atlas_restore_1) mio: {渡|わた}し{場|ば} の {看板|かんばん} 、 {新|あたら}しく なった ね 。 {霧|きり} の {朝|あさ} でも 、 {迷|まよ}う {人|ひと} が {減|へ}る わ 。 || The ferry landing's sign is new. Fewer people will get lost on foggy mornings.
?(!atlas_restore_1) mio: {葦|あし}ノ{瀬|せ} の {橋|はし} 、 {毎日|まいにち} {渡|わた}って も {飽|あ}きない の 。 {向|む}こう {岸|ぎし} に {届|とど}いてる だけ で 、 {嬉|うれ}しく なる 。 || I never get tired of crossing Reedwake's bridge. Just seeing it reach the other bank makes me happy.

@scene road.mio.o3
?(pages.keeps>=1) mio: {道|みち} で {見|み}つけた {物|もの} 、 {棚|たな} に {並|なら}べる なら 、 ラベル は わたし が {書|か}く わ 。 まっすぐ に 。 || If you ever line up the things we've found on the roads, I'll write the labels. Straight ones.
?(!pages.keeps>=1) mio: {形|かたち} に {残|のこ}って いる もの は 、 あの {札|ふだ} {一枚|いちまい} 。 でも 、 {覚|おぼ}えて いる こと は 、 {棚|たな} に {入|はい}り{切|き}らない くらい ある 。 || The only thing we've kept that you can hold is that one card. But what we remember wouldn't fit on a shelf.

@scene road.mio.o4
?(pages.at=camp) mio: {焚|た}き{火|び} の {煙|けむり} って 、 {服|ふく} に {残|のこ}る でしょ 。 {帰|かえ}って から も 、 {旅|たび} の {匂|にお}い が する 。 わたし 、 あれ が {好|す}き 。 || Campfire smoke stays in your clothes. Even after you get home, you smell of the journey. I like that.
?(pages.at=home) mio: {灯|あか}り{堂|どう} って 、 {帰|かえ}って くる と {少|すこ}し {暗|くら}い の 。 {目|め} が {慣|な}れる まで 、 {一緒|いっしょ} に {立|た}ち{止|ど}まる の が {好|す}き 。 || The Lantern Hall's always a bit dark when we come back in. I like standing still together until our eyes adjust.

@scene road.mio.quiet1
mio: {今日|きょう} は 、 {話|はなし} より お{茶|ちゃ} に しよう か 。 || Tea instead of talk today?
@scene road.mio.quiet2
mio: …… {特|とく}に {何|なに} も 。 {何|なに} も ない {日|ひ} が 、 {一番|いちばん} いい {日|ひ} よ 。 || …Nothing in particular. Days with nothing in them are the best days.
@scene road.mio.quiet3
mio: {話|はな}す こと が ない の も 、 {仲|なか} が いい {証拠|しょうこ} なんだって 。 {誰|だれ} が {言|い}った の か は {忘|わす}れた けど 。 || Having nothing to say is a sign of being close, apparently. I forget who said it.

# ======================================================================================
# Ren
# ======================================================================================
@scene road.ren.h1
ren: この {靴|くつ} 、 {直|なお}そう と {思|おも}って から 、 もう {何年|なんねん} {経|た}つ でしょう 。 || How many years has it been since I meant to mend these boots?
ren: {灯|ひ} は {毎朝|まいあさ} {磨|みが}く のに 、 {靴|くつ} は {磨|みが}かない 。 {優先順位|ゆうせんじゅんい} の {問題|もんだい} です 。 || I polish the lamp every morning, and never the boots. A question of priorities.
pc: {靴|くつ} も {大事|だいじ} だ よ 。 || Boots matter too, you know.
ren[smirk]: …… {灯|ひ} を {持|も}った まま {転|ころ}ぶ {方|ほう} が 、 {危|あぶ}ない です ね 。 {一理|いちり} あります 。 || …Falling over while holding a lamp would be more dangerous, yes. You have a point.

@scene road.ren.h2
ren: {分|わ}かれ{道|みち} で わたし が {右|みぎ} だ と {思|おも}ったら 、 {大抵|たいてい} {左|ひだり} です 。 {統計|とうけい} を {取|と}りました 。 || When I think it's right at a fork, it's usually left. I've kept statistics.
ren: {最近|さいきん} は 、 {自分|じぶん} の {勘|かん} を {逆|ぎゃく} に {使|つか}う {方法|ほうほう} を {研究|けんきゅう} して います 。 …… {精度|せいど} は 、 {五割|ごわり} です 。 || Lately I've been researching how to use my instincts in reverse. …Accuracy: fifty percent.

@scene road.ren.h3
ren: {旅|たび} の {間|あいだ} に {見|み}た {名前|なまえ} は 、 {全部|ぜんぶ} {帳面|ちょうめん} に {書|か}き{写|うつ}して あります 。 {字|じ} の {形|かたち} ごと 。 || Every name I saw on the journey, I copied into my notebook. Down to the shape of the letters.
ren: {名前|なまえ} は 、 {書|か}いた {人|ひと} の {手|て} で {読|よ}む もの です から 。 {同|おな}じ {字|じ} でも 、 {書|か}く {人|ひと} で {伝|つた}わる もの が {少|すこ}し {変|か}わる 。 || A name is read in the hand that wrote it. Even the same character carries a little something different, depending on who wrote it.

@scene road.ren.h4
ren: {灯守|ひもり} の {仕事|しごと} で {一番|いちばん} {大事|だいじ} な の は 、 {灯|ひ} を {絶|た}やさない こと です 。 || The most important thing in a lantern keeper's work is never letting the light go out.
ren: {二番目|にばんめ} は 、 {冗談|じょうだん} を {絶|た}やさない こと 。 …… {今|いま} {決|き}めました 。 || The second is never letting the jokes run out. …I just decided that.

@scene road.ren.r1
?(pages.theme=sure) ren: {灯|あか}り{堂|どう} の {壁|かべ} の {頁|ページ} に 、 {確|たし}か な こと を {一|ひと}つ {書|か}きました ね 。 {読|よ}み{返|かえ}す と 、 {今|いま} でも {確|たし}か です 。 {安心|あんしん} しました 。 || On the page on the Lantern Hall wall, we wrote down one certain thing. When I reread it, it's still certain. What a relief.
?(pages.theme=unsure) ren: {灯|あか}り{堂|どう} の {壁|かべ} の {頁|ページ} 、 「 {分|わ}からない 」 と {書|か}いた {所|ところ} が 、 {一番|いちばん} {読|よ}まれて いる {気|き} が します 。 || On the page on the Lantern Hall wall, I have a feeling the part where we wrote "not known" gets read the most.
ren: {余白|よはく} の {書|か}き{込|こ}み に 、 {二人|ふたり} {分|ぶん} の {字|じ} が ある 。 {灯守|ひもり} の {帳面|ちょうめん} で は 、 {珍|めずら}しい こと です 。 || There are two people's handwriting in the margin. Rare, in a lantern keeper's register.

@scene road.ren.r2
?(pages.completed>=1) ren: {道|みち} の {終|お}わり の {灯籠|とうろう} の {字|じ} 、 やはり わたし の {字|じ} だった と {思|おも}います 。 {九割|きゅうわり} の {確率|かくりつ} で 。 || I still think the writing on the lantern at the road's end was mine. Ninety percent certain.
?(pages.completed>=1) ren: {残|のこ}り の {一割|いちわり} は 、 {記録|きろく} に 「 {不明|ふめい} 」 と {書|か}いて あります 。 || The remaining ten percent is recorded as "unknown".
?(!pages.completed>=1) ren: まだ {道|みち} の {終|お}わり の {灯籠|とうろう} を {見|み}て いません 。 {見|み}る {日|ひ} まで 、 {楽|たの}しみ を {取|と}って おきます 。 || We haven't seen the lantern at a road's end yet. I'll save the anticipation until we do.

@scene road.ren.r3
ren: {灯|あか}り{堂|どう} の {前|まえ} で {灯|ひ} を {磨|みが}いて いた {日|ひ} 、 {師匠|ししょう} の {教|おし}え を {一|ひと}つ {足|た}しました ね 。 {一緒|いっしょ} に {迷|まよ}って くれる {者|もの} を 、 と 。 || The day I was polishing lamps outside the Lantern Hall, I added a lesson to my teacher's. Someone who'll get lost with you.
ren: {今|いま} でも 、 あれ が {一番|いちばん} {出来|でき} の いい {教|おし}え だ と {思|おも}って います 。 {作|つく}った の は わたし です が 。 || I still think it's the best lesson of the lot. Even if I'm the one who made it up.
?(memory.ending_retro:ren) ren: {灯|あか}り{堂|どう} で {遅|おそ}く なった {話|はなし} を した {日|ひ} から 、 {帳面|ちょうめん} に {書|か}く {前|まえ} に 、 あなた に {聞|き}く よう に なりました 。 || And since the day we had that overdue talk in the Lantern Hall, I ask you before I write things down.

@scene road.ren.r4
?(sa_ren_took) ren: {師匠|ししょう} の {顔|かお} を {思|おも}い{出|だ}す と 、 {最近|さいきん} は {口論|こうろん} より {先|さき} に 、 {笑|わら}った {顔|かお} が {出|で}て きます 。 {順番|じゅんばん} が {入|い}れ{替|か}わりました 。 || When I think of my teacher's face these days, the smile comes before the quarrel. The order has swapped.
?(!sa_ren_took) ren: {書庫|しょこ} に {預|あず}けた {顔|かお} の こと 、 {時々|ときどき} {考|かんが}えます 。 {取|と}り に {行|い}く か どう か 、 まだ {決|き}めて いません 。 {決|き}めない まま で いる の も 、 {悪|わる}くない 。 || I think about the face I left at the Archive sometimes. I still haven't decided whether to go for it. Not deciding isn't so bad.

@scene road.ren.o1
?(petvis=cat) ren: {猫|ねこ} が わたし の {灯|ひ} の {横|よこ} で {寝|ね}て いる と 、 {動|うご}けません 。 {灯守|ひもり} が 、 {灯|ひ} に {守|まも}られて いる よう な もの です 。 || When the cat sleeps next to my lamp, I can't move. As if the keeper were being kept by the light.
?(petvis=dog) ren: {間違|まちが}った {道|みち} に {入|はい}ったら 、 あの {子|こ} が {止|と}めて くれる かも しれません 。 {期待|きたい} して います 。 || If I turn down a wrong road, perhaps that one will stop me. I'm counting on it.
?(petvis=bird) ren: {鳥|とり} は {北|きた} が {分|わ}かる と {言|い}います 。 {聞|き}いて みました 。 {返事|へんじ} は ありません でした 。 || They say birds can tell which way is north. I asked. No reply.
?(petvis=tanuki) ren: たぬき は {化|ば}ける と {言|い}われて います が 、 {灯|ひ} の {前|まえ} で は たぬき の まま です 。 {正直|しょうじき} な {子|こ} です 。 || Tanuki are said to shapeshift, but in front of the lamp it stays a tanuki. An honest one.
?(!petvis) ren: {動物|どうぶつ} の {連|つ}れ は いません が 、 {灯|ひ} に {寄|よ}って くる {蛾|が} なら 、 {毎晩|まいばん} います 。 {名前|なまえ} は つけて いません 。 || No animal travels with us, but moths come to the lamp every night. I haven't named them.

@scene road.ren.o2
?(atlas_restore_1) ren: {渡|わた}し{場|ば} の {看板|かんばん} 、 {良|よ}い {字|じ} です 。 {誰|だれ} の {字|じ} か {調|しら}べよう と しました が 、 {途中|とちゅう} で {迷子|まいご} に なりました 。 || The ferry landing sign is in a good hand. I tried to find out whose, but I got lost on the way.
?(!atlas_restore_1) ren: {葦|あし}ノ{瀬|せ} の {灯籠|とうろう} の {名前|なまえ} は 、 {帰|かえ}る たび に {確|たし}かめて います 。 {今|いま} の ところ 、 {一|ひと}つ も {消|き}えて いません 。 || I check the names on Reedwake's lanterns every time we come home. So far, not a single one has faded.

@scene road.ren.o3
?(pages.keeps>=1) ren: {道|みち} で {見|み}つけた {小|ちい}さな {物|もの} も 、 {名前|なまえ} を {付|つ}けて {記録|きろく} して あります 。 {灯守|ひもり} の {癖|くせ} です 。 || The small things we've found on the roads are in my record too, each with a name. A lantern keeper's habit.
?(!pages.keeps>=1) ren: {記録|きろく} に {残|のこ}って いる {品|しな} は 、 {灯|あか}り{堂|どう} の {頁|ページ} {一枚|いちまい} だけ です 。 {少|すく}ない ほど 、 {一|ひと}つ {一|ひと}つ が {重|おも}く なります 。 || The only item in the record is the page in the Lantern Hall. The fewer there are, the more each one weighs.

@scene road.ren.o4
?(pages.at=camp) ren: {焚|た}き{火|び} の {灯|ひ} で {見|み}る と 、 {地面|じめん} に {下書|したが}き の {線|せん} が {透|す}けて {見|み}えます 。 {誰|だれ}か が 、 {先|さき} に {道|みち} を {考|かんが}えて いた ん です ね 。 || In the firelight you can see pencil lines under the ground. Someone thought this road through before us.
?(pages.at=home) ren: {灯|あか}り{堂|どう} の {灯|ひ} は 、 {出|で}かける {前|まえ} と {帰|かえ}った {後|あと} で 、 {同|おな}じ {明|あか}るさ です 。 {当|あ}たり{前|まえ} の こと を 、 {毎回|まいかい} {確|たし}かめて しまいます 。 || The Lantern Hall's lamps are just as bright when we leave as when we come back. I check that obvious thing every single time.

@scene road.ren.quiet1
ren: {特|とく}に {報告|ほうこく} は ありません 。 {平和|へいわ} で 、 {結構|けっこう} です 。 || Nothing to report. Peaceful. Excellent.
@scene road.ren.quiet2
ren: …… {今日|きょう} の {冗談|じょうだん} は 、 {品切|しなぎ}れ です 。 {明日|あした} {入荷|にゅうか} します 。 || …Today's jokes are sold out. More in tomorrow.
@scene road.ren.quiet3
ren: {黙|だま}って {灯|ひ} を {見|み}る {時間|じかん} も 、 {灯守|ひもり} の {仕事|しごと} の うち です 。 || Watching the flame in silence is part of a lantern keeper's work too.

# ======================================================================================
# Suzu
# ======================================================================================
@scene road.suzu.h1
suzu: {今日|きょう} の {帳簿|ちょうぼ} 、 {聞|き}きたい ？ {出費|しゅっぴ} ： お{茶|ちゃ} {二杯|にはい} 。 {収入|しゅうにゅう} ： なし 。 {笑|わら}い ： {数|かぞ}え{切|き}れない 。 || Want to hear today's accounts? Expenses: two cups of tea. Income: none. Laughs: too many to count.
suzu: {笑|わら}い を {収入|しゅうにゅう} に {入|い}れる か 、 {毎回|まいかい} {迷|まよ}う の 。 {入|い}れたら 、 {大金持|おおがねも}ち に なっちゃう から 。 || I can never decide whether laughs count as income. If I did, I'd be rich.

@scene road.suzu.h2
suzu: {歩|ある}き ながら 、 {頭|あたま} の {中|なか} で {台詞|せりふ} を {稽古|けいこ} してる の 。 {時々|ときどき} {声|こえ} に {出|で}ちゃう けど 。 || I rehearse lines in my head while I walk. Sometimes they slip out loud.
suzu: {今日|きょう} の {台詞|せりふ} は 「 {荷物|にもつ} 、 {持|も}とう か 」 。 …… {相手|あいて} が いない と 、 {言|い}う {機会|きかい} が ない の よ ね 。 || Today's line is "Want me to carry that?" …Without someone there, I'd never get to say it.

@scene road.suzu.h3
suzu: リボン が ない と 、 {髪|かみ} が {顔|かお} に {掛|か}かる の 。 {風|かぜ} の {強|つよ}い {日|ひ} は 、 {前|まえ} が {見|み}えない 。 || Without the ribbon, my hair gets in my face. On windy days I can't see a thing.
suzu[smirk]: {返|かえ}して 、 って {意味|いみ} じゃ ない よ 。 {預|あず}けた もの は 、 {次|つぎ} の {幕|まく} まで 。 {約束|やくそく} は {約束|やくそく} 。 || That's not a hint to give it back. What's left with you stays until the next act. A promise is a promise.

@scene road.suzu.h4
suzu: {休憩|きゅうけい} の こと 、 {幕間|まくあい} って {呼|よ}んじゃう の 。 {一座|いちざ} に いた {頃|ころ} から の {癖|くせ} ね 。 || I call breaks "intervals". A habit from my troupe days.
suzu: {幕間|まくあい} に は 、 {必|かなら}ず お{茶|ちゃ} を {飲|の}む 。 {次|つぎ} の {幕|まく} で 、 {声|こえ} が {枯|か}れない よう に 。 {旅|たび} も 、 {同|おな}じ 。 || Every interval, I drink tea. So my voice doesn't give out in the next act. Travelling's the same.

@scene road.suzu.r1
?(pages.theme=funny) suzu: ハナ の {茶屋|ちゃや} の {番付|ばんづけ} 、 {見|み}た {人|ひと} が {笑|わら}って くれたら いい な 。 {本当|ほんとう} に あった こと だ って 、 {信|しん}じて くれなくて も 。 || I hope whoever sees the programme at Hana's teahouse laughs. Even if they don't believe it really happened.
?(pages.theme=quiet) suzu: ハナ の {茶屋|ちゃや} の {番付|ばんづけ} 、 {静|しず}か な {場面|ばめん} な のに 、 ちゃんと {芝居|しばい} に なってる の 。 {不思議|ふしぎ} ね 。 || The programme at Hana's teahouse is for a quiet scene, and it still works as a play. Funny, that.
suzu: {題|だい} を {決|き}めた の は あなた 。 {絵|え} を {描|か}いた の は わたし 。 {二人|ふたり} で {書|か}いた {脚本|きゃくほん} って やつ ね 。 || You chose the title. I drew the pictures. Co-written, you might say.

@scene road.suzu.r2
?(pages.completed>=1) suzu: {道|みち} の {終|お}わり まで {行|い}った {日|ひ} の {終幕|しゅうまく} 、 われ ながら {良|よ}かった と {思|おも}う 。 {拍手|はくしゅ} は 、 {家|いえ} で もらった し ね 。 || The final curtain the day we reached a road's end — pretty good, if I say so myself. And we took our applause at home.
?(!pages.completed>=1) suzu: {書|か}かれて いない {道|みち} で は 、 まだ {最終幕|さいしゅうまく} まで {行|い}った こと が ない の よ ね 。 {途中|とちゅう} で {終|お}わる {芝居|しばい} も 、 {嫌|きら}い じゃ ない けど 。 || We've never made it to the final act on an unwritten road. I don't mind plays that stop partway, though.

@scene road.suzu.r3
suzu: {広場|ひろば} の {舞台|ぶたい} で 、 {最後|さいご} の {台詞|せりふ} を {変|か}えた でしょ 。 「 みんな 、 {生|い}きて いきました 」 。 || On the stage in the square, I changed the last line, remember? "And everyone went on living."
?(pages.reply=onstage) suzu: あなた に {言|い}われて 、 {自分|じぶん} の {台詞|せりふ} も {一行|いちぎょう} {書|か}いた 。 まだ {誰|だれ} に も {聞|き}かせて ない 。 {初日|しょにち} まで {秘密|ひみつ} 。 || Because you told me to, I wrote myself a line too. Haven't let anyone hear it yet. Secret till opening night.
?(!pages.reply=onstage) suzu: あの {台詞|せりふ} に して 、 よかった 。 {幸|しあわ}せ か どう か は 、 {今|いま} も {毎日|まいにち} {決|き}めて いる {最中|さいちゅう} 。 || I'm glad I went with that line. Whether it's happily or not, I'm still deciding, every day.

@scene road.suzu.r4
suzu: ヒロ の {祭|まつ}り で は 、 {空|あ}いた {席|せき} の {隣|となり} に {座|すわ}る の 。 {二十回|にじゅっかい} {分|ぶん} の {一回|いっかい} ずつ 。 {帳簿|ちょうぼ} に は 、 {線|せん} を {引|ひ}かず に {書|か}き{足|た}して いく 。 || At Hiro's festivals I sit next to the empty seat. One of the twenty, one at a time. In the ledger I add them without crossing anything out.
suzu[closed]: {本当|ほんとう} の {話|はなし} は 、 {何度|なんど} {話|はな}して も {慣|な}れない 。 {慣|な}れない ほう が 、 いい の かも ね 。 || The true story never gets easier to tell, however many times. Maybe it's better that it doesn't.

@scene road.suzu.o1
?(petvis=cat) suzu: {猫|ねこ} って 、 {一番|いちばん} いい {場面|ばめん} で {必|かなら}ず {舞台|ぶたい} を {横切|よこぎ}る の よ 。 {生|う}まれつき の {役者|やくしゃ} ね 。 || Cats always cross the stage at the best moment. Born performers.
?(petvis=dog) suzu: {犬|いぬ} は {最高|さいこう} の {観客|かんきゃく} 。 {何|なに} を {見|み}せて も 、 {尻尾|しっぽ} で {拍手|はくしゅ} して くれる 。 || Dogs are the best audience. Whatever you show them, they applaud with their tails.
?(petvis=bird) suzu: {鳥|とり} の {声|こえ} って 、 {舞台|ぶたい} の {効果音|こうかおん} より ずっと いい 。 {出演料|しゅつえんりょう} は 、 お{米|こめ} で いい かしら 。 || Birdsong beats any stage sound effect. Would it take its fee in rice?
?(petvis=tanuki) suzu: たぬき は {化|ば}ける って {言|い}う でしょ 。 {役者|やくしゃ} {仲間|なかま} と して 、 {一目|いちもく} {置|お}いて いる の 。 || They say tanuki can shapeshift. As a fellow performer, I have to respect that.
?(!petvis) suzu: {動物|どうぶつ} の {相手役|あいてやく} は いない けど 、 {二人|ふたり} {芝居|しばい} も {悪|わる}くない 。 {台詞|せりふ} の {取|と}り{合|あ}い に ならない し 。 || No animal co-stars, but a two-hander isn't bad. Nobody fighting over lines.

@scene road.suzu.o2
?(atlas_restore_1) suzu: {渡|わた}し{場|ば} の {看板|かんばん} 、 {字|じ} が {大|おお}きくて いい ね 。 {看板|かんばん} も {芝居|しばい} と {同|おな}じ 。 {後|うし}ろ の {席|せき} から {読|よ}めない と 、 {意味|いみ} が ない の 。 || The ferry landing sign has nice big letters. Signs are like plays: if the back row can't read it, it's pointless.
?(!atlas_restore_1) suzu: {葦|あし}ノ{瀬|せ} の {広場|ひろば} 、 {小|ちい}さな {舞台|ぶたい} に ちょうど いい {広|ひろ}さ なの よ 。 {測|はか}った の 。 {歩幅|ほはば} で 。 || Reedwake's square is just the right size for a little stage. I measured it. In paces.

@scene road.suzu.o3
?(pages.keeps>=1) suzu: {道|みち} で {見|み}つけた {物|もの} って 、 {小道具|こどうぐ} に したく なる の よ ね 。 {使|つか}わない けど 。 {飾|かざ}る だけ 。 || The things we've found on the road make me want to use them as props. I won't. Just look at them.
?(!pages.keeps>=1) suzu: {持|も}って {帰|かえ}った {物|もの} は 、 {番付|ばんづけ} {一枚|いちまい} だけ 。 {身軽|みがる} な {一座|いちざ} ね 。 || All we've brought home is one programme. A troupe that travels light.

@scene road.suzu.o4
?(pages.at=camp) suzu: {焚|た}き{火|び} って 、 {照明|しょうめい} と して は {最高|さいこう} なの 。 {顔|かお} が みんな {優|やさ}しく {見|み}える 。 || A campfire is the best stage lighting there is. Every face looks kind.
?(pages.at=home) suzu: {灯|あか}り{堂|どう} は {声|こえ} が よく {響|ひび}く の 。 {一度|いちど} {小声|こごえ} で {稽古|けいこ} したら 、 ツル さん に {全部|ぜんぶ} {聞|き}かれて た 。 || The Lantern Hall has wonderful acoustics. I rehearsed in a whisper once, and Tsuru heard every word.

@scene road.suzu.quiet1
suzu: {今日|きょう} は {台本|だいほん} が {白紙|はくし} 。 {即興|そっきょう} で {黙|だま}って みる ？ || Today's script is blank. Shall we improvise some silence?
@scene road.suzu.quiet2
suzu: {特|とく}に {言|い}う こと なし 。 …… これ も {立派|りっぱ} な {台詞|せりふ} よ 。 || Nothing to say. …That's a perfectly good line too.
@scene road.suzu.quiet3
suzu: {幕間|まくあい} 、 {延長|えんちょう} 。 {話|はなし} は また {次|つぎ} の {幕|まく} で 。 || Interval extended. More in the next act.
`, 'pages/topics');

// The bank: 12 topics per companion, in three kinds (see the header). A slot
// whose lines depend on a fact has a variant: the fact's current value.
(function () {
  'use strict';
  const T = (s, cond) => RB.state.test(s, cond);
  const V = {
    at: (s) => (T(s, 'pages.at=camp') ? 'camp' : 'home'),
    o1: (s) => (RB.pages.petVisible(s) ? 'pet:' + s.company.pet : 'nopet'),
    r2: (s) => (T(s, 'pages.completed>=1') ? 'done' : 'notyet'),
    o2: (s) => (s.flags.atlas_restore_1 ? 'restored' : 'plain'),
    o3: (s) => (T(s, 'pages.keeps>=1') ? 'keeps' : 'none'),
    r4: (s) => (s.comp === 'ren' ? (s.flags.sa_ren_took ? 'took' : 'left') : RB.pages.pqDone(s, s.comp) ? 'done' : 'open'),
  };
  V.o4 = V.at;
  const PER = { 'nao.h1': V.at, 'mio.h2': V.at };
  const list = [];
  for (const c of ['nao', 'mio', 'ren', 'suzu']) {
    for (const k of ['h', 'r', 'o']) for (let i = 1; i <= 4; i++) {
      const slot = k + i, id = c + '.' + slot;
      list.push({ id, comp: c, slot, kind: { h: 'habit', r: 'reflection', o: 'observation' }[k], where: 'any', scene: 'road.' + c + '.' + slot, variant: PER[id] || V[slot] || null });
    }
  }
  RB.pages.addTopics(list);
})();
