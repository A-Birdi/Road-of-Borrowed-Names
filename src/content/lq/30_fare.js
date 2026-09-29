/* Line A — "A Fare Thirty Years Owed" (quest lq_fare).
 * Reedwake (Kōji, the ferry book) → Saltglass (Tamae at the Gull) → Cinder
 * Orchard (Fusa) → the Snowbell road (Chigusa; lq_ally1) → Reedwake (the
 * fare is paid) → Saltglass (the seal goes home). See docs/STORY.md. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene lq.fare_koji
?(post) !call rw.koji_post
!faceplayer koji
?(post) koji: …… そう だ 。 もう {一|ひと}つ 、 {頼|たの}み が ある ん だ 。 || …Oh, right. There's one more thing I wanted to ask.
?(!post) koji: {字|じ} の {読|よ}める {人|ひと} に 、 {頼|たの}み が ある 。 || I've a favour to ask of someone who can read.
koji: {渡|わた}し{小屋|ごや} を {片付|かたづ}けてたら 、 おふくろ の {渡|わた}し{帳|ちょう} が {出|で}て きた 。 {誰|だれ} を {渡|わた}して 、 いくら もらった か 、 {全部|ぜんぶ} {書|か}いて ある 。 || I was tidying the ferry house and turned up Mum's fare book. Who she took across, what they paid — it's all written down.
koji[think]: {一|ひと}つ だけ 、 {払|はら}って もらってない {渡|わた}し{賃|ちん} が ある 。 {三十年|さんじゅうねん} {前|まえ} の 、 {嵐|あらし} の {夜|よる} の {客|きゃく} だ 。 || There's one fare that was never paid. A passenger from a stormy night, thirty years back.
koji: おふくろ は {死|し}ぬ まで 、 その {客|きゃく} を {待|ま}ってた 。 {金|かね} の ため じゃ ない 。 「 {払|はら}い に {来|く}る って {約束|やくそく} した ん だ 。 どこか で {生|い}きてる って こと さ 」 って な 。 || Mum waited for that passenger till the day she died. Not for the money. "They promised to come and pay," she'd say. "That means they're alive somewhere."
hana[sad]: {嵐|あらし} の {季節|きせつ} に なる と 、 {母|はは} は {毎年|まいとし} あの {帳面|ちょうめん} を {開|ひら}いて いた わ 。 || Every year when the storms came, Mother would open that book.
koji: {名前|なまえ} は …… {今年|ことし} の {嵐|あらし} で 、 {帳面|ちょうめん} から {消|き}えちまった@消える 。 {残|のこ}ってる の は 、 {客|きゃく} が {置|お}いてった@置く {判子|はんこ} だけ だ 。 || The name… went out of the book in this year's storm. All that's left is a seal the passenger left behind.
koji: {帳面|ちょうめん} は {渡|わた}し{小屋|ごや} の {棚|たな} だ 。 {暇|ひま} が あったら 、 {見|み}て やって くれ 。 || The book's on the shelf in the ferry house. If you've a moment, have a look at it for me.
!quest lq_fare 0
?(comp=nao) comp: {届|とど}かなかった {約束|やくそく} か 。 …… {三十年|さんじゅうねん} は {長|なが}い な 。 || A promise that never arrived. …Thirty years is a long time.
?(comp=mio) comp[think]: {待|ま}つ {人|ひと} の {方|ほう} が 、 {待|ま}たせる {人|ひと} より {重|おも}い もの を {持|も}って いる こと が あります 。 || Sometimes the one who waits carries something heavier than the one who keeps them waiting.
?(comp=ren) comp: {判子|はんこ} は 、 {名前|なまえ} の {代|か}わり に {約束|やくそく} を {支|ささ}える もの です 。 {見|み}て みましょう 。 || A seal stands behind a promise in place of a name. Let's take a look.
?(comp=suzu) comp: {未払|みばら}い が {一件|いっけん} 。 {帳簿|ちょうぼ} の {話|はなし} なら 、 {私|わたし} の {得意|とくい} {分野|ぶんや} だ よ 。 || One outstanding payment. If it's a matter of accounts, that's my speciality.

@scene lq.fare_koji_wait
!faceplayer koji
koji: {帳面|ちょうめん} は {渡|わた}し{小屋|ごや} の {棚|たな} だ 。 {橋|はし} を {渡|わた}って すぐ の {小屋|こや} さ 。 || The book's on the shelf in the ferry house — the hut just over the bridge.

@scene lq.fare_book
!if quest.lq_fare>=1 -> again
narr: {古|ふる}い {渡|わた}し{帳|ちょう} 。 {日付|ひづけ} と {人数|にんずう} と 、 もらった {渡|わた}し{賃|ちん} が 、 {細|こま}かい {字|じ} で {並|なら}んで いる 。 || An old fare book. Dates, numbers of passengers and the fares taken, lined up in small handwriting.
narr: {最後|さいご} の {方|ほう} の {頁|ページ} に 、 {別|べつ} の {字|じ} が ある 。 {若|わか}い {人|ひと} の 、 {震|ふる}えた {字|じ} だ 。 {小|ちい}さな {木|き} の {判子|はんこ} が 、 {頁|ページ} の {間|あいだ} に {挟|はさ}んで ある 。 || Near the end there's a different hand — a young person's, shaky. A small wooden seal is tucked between the pages.
?(!quest.lq_fare) !quest lq_fare 0
!challenge lq.c_seal
!if var._res=0 -> later
narr: {判子|はんこ} を {紙|かみ} に {押|お}す と 、 「 かもめ 」 と {出|で}た 。 {名前|なまえ} の {所|ところ} は 、 {白|しろ}い まま だ 。 || Pressed onto paper, the seal prints "kamome" — gull. The space for the name stays blank.
!give lq_stamp
!note lq_farebook
!quest lq_fare 1
?(!comp) narr: かもめ 。 {西|にし} の {港町|みなとまち} で 、 {聞|き}いて みよう か 。 || Kamome. Perhaps someone in the harbour town to the west will know it.
?(comp=nao) comp[think]: かもめ …… {宿|やど} の {名前|なまえ} か 、 {船|ふね} の {名前|なまえ} か 。 {港|みなと} の {匂|にお}い が する な 。 || Kamome… the name of an inn, or a boat. Smells like a harbour.
?(comp=mio) comp: {判子|はんこ} を {置|お}いて いく なんて 、 よほど {急|いそ}いで いた の ね 。 || Leaving a seal behind — they must have been desperate.
?(comp=ren) comp: {港|みなと} の {宿|やど} に は 、 よく {鳥|とり} の {名前|なまえ} が {付|つ}いて います 。 {潮硝子|しおがらす} なら …… 。 || Harbour inns are often named after birds. If it's Saltglass…
?(comp=suzu) comp: {判子|はんこ} が {借用書|しゃくようしょ} の {代|か}わり か 。 {貸|か}した {方|ほう} は {三十年|さんじゅうねん} {待|ま}った 。 {利子|りし} は …… {言|い}わない で おこう 。 || So the seal stands in for an IOU. The lender waited thirty years. The interest… let's not.
!end
:later
narr: {判子|はんこ} は {帳面|ちょうめん} に {戻|もど}して おいた 。 また {見|み}に {来|こ}よう 。 || You put the seal back in the book. You can look again later.
!end
:again
narr: 「 {渡|わた}し{賃|ちん} 、 {必|かなら}ず {払|はら}い に {来|き}ます 。 」 {判子|はんこ} の {跡|あと} は 「 かもめ 」 。 || "The fare — I will come back to pay it, without fail." The seal's mark: "kamome".
?(!lq_fare_paid) narr: {名前|なまえ} の {所|ところ} は 、 まだ {白|しろ}い 。 || The space for the name is still blank.
?(lq_fare_paid) narr: {白|しろ}かった {所|ところ} に 、 {今|いま} は 「 チグサ 」 。 {横|よこ} に {小|ちい}さく 「 {済|す}み 」 。 || Where it was blank, it now says "Chigusa". Beside it, small: "Paid".

@scene lq.fare_tamae
!faceplayer tamae
pc: この {判子|はんこ} の {跡|あと} 、 {見覚|みおぼ}え は ありません か 。 || Do you recognise this stamp?
tamae[surprise]: …… かもめ 。 うち の {判子|はんこ} じゃ ない か ！ {母|かあ}ちゃん が {自分|じぶん} で {彫|ほ}った {字|じ} だ よ 、 これ 。 || …Kamome. That's our seal! That's Mum's lettering — she carved it herself.
tamae: {三十年|さんじゅうねん} {前|まえ} に なくなった ん だ 。 …… いや 、 なくなった ん じゃ ない 。 {母|かあ}ちゃん が {貸|か}した ん だ 。 || It went missing thirty years ago. …No — it didn't go missing. Mum lent it out.
tamae[think]: {台所|だいどころ} に {女|おんな} の {子|こ} が いた ん だ よ 。 {十五|じゅうご} か そこら 。 あたし は {七|なな}つ で 、 「 ハトねえ 」 って {呼|よ}んでた 。 {本当|ほんとう} の {名前|なまえ} は …… {聞|き}いた こと も なかった 。 || There was a girl in the kitchen. Fifteen or so. I was seven, and I called her "Sister Dove". Her real name… I never even asked.
tamae: {嵐|あらし} の {年|とし} 、 {東|ひがし} に いる {母親|ははおや} が {倒|たお}れた って {知|し}らせ が {来|き}て 、 その {夜|よる} の うち に {出|で}て いった 。 {母|かあ}ちゃん は {金|かね} の {代|か}わり に 、 あの {判子|はんこ} を {持|も}たせた 。 「 どこ の {宿|やど} でも 、 これ を {見|み}せりゃ@見せる かもめ{亭|てい} の {者|もの} だ って {分|わ}かる 」 って ね 。 || The storm year, word came that her mother back east had collapsed, and she left that same night. Instead of money, Mum gave her the seal. "Show this at any inn and they'll know you're one of the Gull's," she said.
tamae[sad]: {帰|かえ}って は こなかった 。 {何年|なんねん} か して 、 {果樹園|かじゅえん} の {方|ほう} から はがき が {一枚|いちまい} {来|き}た 。 {名前|なまえ} は なし 。 ハト の {絵|え} だけ 。 || She never came back. A few years later a single postcard came from the orchard country. No name. Just a drawing of a dove.
tamae[laugh]: それ と 、 あの {子|こ} の いれる お{茶|ちゃ} ！ {濃|こ}くて 、 {匙|さじ} が {立|た}つ くらい だった 。 {母|かあ}ちゃん が {毎朝|まいあさ} {文句|もんく} を {言|い}ってた よ 。 || And her tea! So strong you could stand a spoon in it. Mum complained every morning.
tamae: {灰実|はいみ} の {里|さと} に も {宿|やど} が ある だろう 。 {台所|だいどころ} の {好|す}きな {子|こ} だった 。 どこか に {行|い}った なら 、 {宿|やど} だ よ 。 || There's an inn in Cinder Orchard, isn't there? She loved a kitchen. If she went anywhere, it'd be an inn.
!quest lq_fare 2
?(comp=nao) comp: {名前|なまえ} の ない はがき か 。 …… {見|み}つけて ほしい けど 、 {頼|たの}めない 。 そういう {時|とき} に {出|だ}す もん だ 。 || A postcard without a name. …You send those when you want to be found but can't bring yourself to ask.
?(comp=mio) comp: {濃|こ}い お{茶|ちゃ} は 、 {看病|かんびょう} の {夜|よる} に {飲|の}む もの です 。 お{母|かあ}さん の そば で {覚|おぼ}えた の かも しれません 。 || Strong tea is what you drink sitting up with the sick. Maybe she learned it at her mother's bedside.
?(comp=ren) comp: {判子|はんこ} を {貸|か}す の は 、 {名前|なまえ} を {貸|か}す こと です 。 …… お{母|かあ}さん は 、 その {子|こ} を {信|しん}じて いた んです ね 。 || Lending a seal is lending your name. …Your mother trusted that girl.
?(comp=suzu) comp[laugh]: この {宿|やど} は 、 {借|か}り を {気長|きなが} に {待|ま}って くれる ん だ よ ね 。 {私|わたし} も {知|し}ってる 。 || This inn is very patient about debts. I should know.

@scene lq.fare_fusa
!faceplayer co_fusa
pc: {匙|さじ} が {立|た}つ くらい {濃|こ}い お{茶|ちゃ} を いれる {人|ひと} を 、 {知|し}りません か 。 || Do you know anyone who makes tea strong enough to stand a spoon in?
co_fusa[laugh]: …… チグサ ！ あの {子|こ} の こと ね 。 {懐|なつ}かしい わ 。 || …Chigusa! You mean her. Oh, that takes me back.
co_fusa: {冬|ふゆ} を {三|みっ}つ 、 うち の {台所|だいどころ} に いた の 。 お{客|きゃく} は 「 {苦|にが}い 、 {苦|にが}い 」 って {言|い}い ながら 、 {毎年|まいとし} {飲|の}み に {来|き}た わ 。 || She was in our kitchen three winters. The guests would complain "bitter, bitter" — and come back every year to drink it.
co_fusa[think]: {変|か}わった {癖|くせ} が あった わ ね 。 {自分|じぶん} の {卓|たく} に 、 いつも {湯呑|ゆの}み を {一|ひと}つ {余分|よぶん} に {伏|ふ}せて おく の 。 「 {借|か}り の ある {人|ひと} の {分|ぶん} 」 って 。 || She had an odd habit. She always kept one extra cup upside down on her table. "For someone I owe," she said.
co_fusa: それから {雪|ゆき} の {道|みち} を {上|のぼ}って いった 。 {峠|とうげ} を {越|こ}える {荷車|にぐるま} の {人|ひと} に は {熱|あつ}い もの が {要|い}る から って 。 {今|いま} でも {屋台|やたい} を やって いる って {聞|き}く わ よ 。 || Then she went up the snow road. Said the carters crossing the pass needed something hot. I hear she still keeps a stall up there.
!quest lq_fare 3
?(comp=nao) comp: 「 {借|か}り の ある {人|ひと} の {分|ぶん} 」 か 。 …… {三十年|さんじゅうねん} 、 {湯呑|ゆの}み を {待|ま}たせてた わけ だ 。 || "For someone I owe." …So a cup's been waiting on a table for thirty years.
?(comp=mio) comp: {伏|ふ}せた {湯呑|ゆの}み …… 。 {忘|わす}れて いない って 、 {自分|じぶん} に {言|い}い{聞|き}かせる {形|かたち} ね 。 || A cup turned upside down… a way of telling yourself you haven't forgotten.
?(comp=ren) comp: {灯|あか}り を {一|ひと}つ 、 {点|つ}けた まま に して おく の と {同|おな}じ です 。 || It's like leaving one lantern burning.
?(comp=suzu) comp: {帳簿|ちょうぼ} に {書|か}かない {借|か}り も ある 。 {一番|いちばん} {重|おも}い やつ だ よ 。 || Some debts never go in the books. They're the heaviest kind.

@scene lq.chigusa_idle
!faceplayer
lq_chigusa: お{茶|ちゃ} {一杯|いっぱい} 、 どう だい 。 {峠|とうげ} の {風|かぜ} は {骨|ほね} まで {来|く}る よ 。 || A cup of tea? The wind at the pass gets into your bones.
narr: {出|だ}された お{茶|ちゃ} は 、 {黒|くろ} に {近|ちか}い {色|いろ} を して いた 。 {一口|ひとくち} で 、 {目|め} が {覚|さ}める 。 || The tea she hands you is nearly black. One sip and you're wide awake.
lq_chigusa[laugh]: {濃|こ}い だろ 。 {荷車|にぐるま} の {連中|れんちゅう} は 、 これ で {眠気|ねむけ} を {飛|と}ばす ん だ 。 || Strong, eh? The carters drink it to keep awake.
?(quest.lq_fare=1) narr: {屋台|やたい} の {卓|たく} に は 、 {湯呑|ゆの}み が {一|ひと}つ だけ {伏|ふ}せて ある 。 || On the stall's counter, one cup has been turned upside down.
?(comp=mio) comp[laugh]: …… {目|め} が {冴|さ}えて 、 {三日|みっか} は {眠|ねむ}れない かも 。 || …I might not sleep for three days.
?(comp=suzu) comp: {舞台|ぶたい} の {前|まえ} に {一杯|いっぱい} 、 {欲|ほ}しい {味|あじ} だ ね 。 || The sort of cup you want before a show.

@scene lq.stall
narr: {小|ちい}さな {屋台|やたい} 。 {厚|あつ}い {湯呑|ゆの}み が {並|なら}んで いて 、 {一|ひと}つ だけ {伏|ふ}せて ある 。 || A small stall. A row of thick cups, one of them turned upside down.
?(quest.lq_fare=done) narr: {伏|ふ}せた {湯呑|ゆの}み は 、 もう ない 。 {全部|ぜんぶ} 、 {上|うえ} を {向|む}いて いる 。 || The upside-down cup is gone. They all face up now.

@scene lq.fare_chigusa
!faceplayer
?(quest.lq_fare=3) pc: {昔|むかし} 、 かもめ{亭|てい} で {働|はたら}いて いた チグサ さん です か 。 || Are you Chigusa, who used to work at the Gull?
?(quest.lq_fare=2) pc: …… {昔|むかし} 、 かもめ{亭|てい} で 「 ハトねえ 」 と {呼|よ}ばれて いません でした か 。 || …Weren't you once called "Sister Dove", at the Gull?
lq_chigusa[surprise]: …… それ を 、 どこ で {聞|き}いた 。 || …Where did you hear that?
narr: $name は 、 {判子|はんこ} の {跡|あと} の ある {紙|かみ} を {見|み}せた 。 「 かもめ 」 。 || You show her the scrap with the stamp on it. "Kamome".
lq_chigusa[closed]: …… {葦|あし}ノ{瀬|せ} の 、 {渡|わた}し{場|ば} 。 || …Reedwake. The ferry landing.
narr: チグサ は {長|なが}い {間|あいだ} 、 {黙|だま}って いた 。 {薬缶|やかん} が {鳴|な}って も 、 {火|ひ} から {下|お}ろさなかった 。 || For a long time Chigusa says nothing. Even when the kettle starts to whistle, she doesn't lift it from the fire.
lq_chigusa[sad]: {三十年|さんじゅうねん} {前|まえ} の {嵐|あらし} の {夜|よる} だ 。 {母|はは} が {危|あぶ}ない って {聞|き}いて 、 {港|みなと} から {走|はし}った 。 {川|かわ} は {溢|あふ}れそう で 、 {橋|はし} は {流|なが}されて いた 。 || A stormy night, thirty years ago. I'd heard my mother was dying, and I ran from the harbour. The river was about to burst its banks, and the bridge had been swept away.
lq_chigusa: {母|はは} の {家|いえ} は 、 {葦|あし}ノ{瀬|せ} の {川|かわ} の {向|む}こう の 、 {小|ちい}さな {村|むら} だった 。 …… {村|むら} の {名前|なまえ} も 、 もう {出|で}て こない よ 。 || My mother's house was in a little village across Reedwake's river. …I can't even call up its name anymore.
?(lq_road_open) pc: …… {小春野|こはるの} です か 。 || …Koharuno?
?(lq_road_open) lq_chigusa[surprise]: …… {小春野|こはるの} 。 そう だ 。 {母|はは} は 、 {大|おお}きな {柿|かき} の {木|き} の そば に {住|す}んで いた 。 || …Koharuno. That's it. My mother lived near the big persimmon tree.
lq_chigusa: {渡|わた}し{守|もり} の おばさん は 、 {黙|だま}って {舟|ふね} を {出|だ}して くれた 。 {金|かね} は なかった 。 {持|も}って いた の は 、 {借|か}りた {判子|はんこ} だけ 。 || The ferrywoman took the boat out without a word. I had no money. All I had was a borrowed seal.
lq_chigusa: 「 {必|かなら}ず {払|はら}い に {来|き}ます 」 って {書|か}いた 。 {母|はは} は {二日|ふつか} {後|ご} に {死|し}んだ 。 || I wrote "I will come back to pay, without fail." My mother died two days later.
lq_chigusa[tired]: {次|つぎ} の {春|はる} こそ 、 と {毎年|まいとし} {思|おも}った 。 {金|かね} が {貯|た}まる と 、 {今度|こんど} は {遅|おそ}すぎる {気|き} が した 。 {十年|じゅうねん} {過|す}ぎたら 、 {顔|かお} を {出|だ}す の が {怖|こわ}く なった 。 || Every year I thought: next spring, for certain. When I'd saved the money, it felt too late. After ten years, I was afraid to show my face.
lq_chigusa: …… おばさん は 、 {元気|げんき} かい 。 || …Is she well, the ferrywoman?
pc: {何年|なんねん} か {前|まえ} に {亡|な}くなった そう です 。 {渡|わた}し{舟|ぶね} は 、 {息子|むすこ} の コウジ さん が {継|つ}いで います 。 || She passed away some years ago. Her son Kōji runs the ferry now.
pc: {最後|さいご} まで 、 あなた を {待|ま}って いた そう です 。 「 {約束|やくそく} した ん だ から 、 どこか で {生|い}きてる 」 って 。 || She waited for you to the end. "They promised — so they're alive somewhere," she used to say.
lq_chigusa[sad]: …… そう かい 。 || …Is that so.
?(comp=nao) comp: {届|とど}けなかった {手紙|てがみ} なら 、 {俺|おれ} に も ある 。 …… {遅|おそ}すぎる か どう か は 、 {受|う}け{取|と}る {方|ほう} が {決|き}める 。 {出|だ}す {方|ほう} が {決|き}める こと じゃ ない 。 || I've got letters I never delivered, too. …Whether it's too late is for the one receiving to decide. Not the one sending.
?(comp=mio) comp: チグサ さん 。 {待|ま}って いた {人|ひと} は 、 もう いない かも しれません 。 でも 、 {約束|やくそく} を {聞|き}いた {人|ひと} は 、 まだ います 。 {息子|むすこ} さん も 、 あの {帳面|ちょうめん} も 。 || Chigusa. The one who waited may be gone. But the ones who heard your promise are still there — her son, and that book.
?(comp=ren) comp: {灯|あか}り の {名前|なまえ} は 、 {書|か}いた {人|ひと} が いなく なって も {残|のこ}ります 。 {読|よ}む {人|ひと} が いる {限|かぎ}り 。 …… あの {帳面|ちょうめん} に は 、 まだ あなた の {約束|やくそく} を {読|よ}む {人|ひと} が います 。 || A lantern's name outlasts the one who wrote it, as long as someone reads it. …There's still someone reading your promise in that book.
?(comp=suzu) comp: {私|わたし} は ね 、 {借|か}り を {全部|ぜんぶ} {帳面|ちょうめん} に {付|つ}けてる 。 {遅|おく}れて {返|かえ}した {借|か}り は 、 {返|かえ}さなかった {借|か}り より ずっと {軽|かる}い よ 。 …… {持|も}ち{続|つづ}けた もの は 、 {重|おも}く なる ばかり だ から 。 || I keep every debt I owe in a notebook. A debt paid late weighs far less than one never paid. …Things you keep carrying only get heavier.
lq_chigusa[think]: …… {払|はら}い に {行|い}く よ 。 {息子|むすこ} さん に 、 {直接|ちょくせつ} 。 || …I'll go and pay. To her son, in person.
lq_chigusa: {先|さき} に {手紙|てがみ} を {出|だ}して おきたい 。 {突然|とつぜん} {行|い}って {驚|おどろ}かせる の は {悪|わる}い 。 …… {書|か}く の を {手伝|てつだ}って くれる かい 。 {字|じ} は {書|か}ける けど 、 {言葉|ことば} が {出|で}て こない ん だ 。 || I want to send a letter ahead. It'd be wrong to turn up out of nowhere and startle him. …Will you help me write it? I can write, but the words won't come.
!challenge lq.c_note
!if var._res=0 -> self
lq_chigusa: …… これ で いい 。 {郵便|ゆうびん} {小屋|ごや} に {預|あず}けて くる よ 。 || …That'll do. I'll leave it at the post shelter.
!goto decided
:self
lq_chigusa: …… いい よ 。 {続|つづ}き は {自分|じぶん} で {書|か}く 。 {三十年|さんじゅうねん} {分|ぶん} だ 。 {時間|じかん} は かかる けど ね 。 || …It's all right. I'll write the rest myself. Thirty years' worth — it'll take a while.
:decided
!set lq_fare_found lq_ally1
!quest lq_fare 4
?(!ch4_done) lq_chigusa: {吹|ふ}き{溜|だ}まり の {向|む}こう で 、 {荷車|にぐるま} が {止|と}まってる 。 {連中|れんちゅう} に は {熱|あつ}い お{茶|ちゃ} が {要|い}る 。 {道|みち} が {開|ひら}いて 、 {荷車|にぐるま} が {動|うご}き{出|だ}したら 、 {店|みせ} を {閉|し}めて {下|お}りる よ 。 || The carts are stuck behind the drifts, and those lads need their hot tea. Once the road opens and the carts are moving, I'll shut up shop and go down.
?(ch4_done) lq_chigusa: {道|みち} は {開|ひら}いてる 。 {荷車|にぐるま} も {動|うご}いてる 。 …… {言|い}い{訳|わけ} は 、 もう ない ね 。 {今日|きょう} {下|お}りる よ 。 || The road's open. The carts are moving. …No excuses left, then. I'll go down today.
lq_chigusa: {葦|あし}ノ{瀬|せ} の 、 {茶屋|ちゃや} で {待|ま}ってる 。 …… {逃|に}げない よ 。 もう 。 || I'll wait at the teahouse in Reedwake. …I won't run. Not anymore.
narr: チグサ が {薬缶|やかん} に {向|む}き{直|なお}る と 、 $comp が {小|ちい}さな {声|こえ} で {話|はな}しかけて きた 。 || As Chigusa turns back to her kettle, $comp speaks to you quietly.
?(comp=nao) comp[think]: …… {三十年|さんじゅうねん} {待|ま}って から {動|うご}く の も 、 {悪|わる}く は ない 。 でも 、 {俺|おれ} は {待|ま}たない こと に する 。 {次|つぎ} の {戦|たたか}い から 、 {隙|すき} が {見|み}えたら 、 {合図|あいず} を {待|ま}たず に {動|うご}く 。 || …Moving after thirty years isn't wrong. But I've decided not to wait. From the next fight on, when I see an opening, I'll move without waiting for your signal.
?(comp=mio) comp: …… わたし は いつも 、 {頼|たの}まれて から {動|うご}く の 。 {頼|たの}まれたら {断|ことわ}れない くせ に ね 。 でも 、 {戦|たたか}い の {中|なか} で は 、 あなた が {頼|たの}む {前|まえ} に {動|うご}く から 。 || …I always wait to be asked before I move — though once I'm asked I can never say no. But in a fight, I'll move before you have to ask.
?(comp=ren) comp: {灯守|ひもり} は 、 {灯|あか}り が {消|き}えて から {気|き}づく ので は {遅|おそ}い んです 。 …… {次|つぎ} から は 、 {言|い}われる {前|まえ} に {灯|あか}り を {掲|かか}げます 。 {戦|たたか}い の {中|なか} でも 。 || A keeper who only notices once the light is out is too late. …From now on I'll raise the light before I'm asked. In a fight, too.
?(comp=suzu) comp[smile]: {舞台|ぶたい} の {袖|そで} で {出番|でばん} を {待|ま}つ の は 、 もう おしまい 。 {次|つぎ} の {戦|たたか}い から 、 {出|で}る べき {時|とき} は {自分|じぶん} で {出|で}る よ 。 {合図|あいず} は いらない 。 || No more waiting in the wings for my cue. From the next fight, when it's time to step out, I'll step out on my own. No signal needed.
!toast {相棒|あいぼう} が {戦|たたか}い で 、 {自分|じぶん} から {動|うご}く よう に なった 。 || Your companion will now act on their own initiative in battle.
!refresh

@scene lq.chigusa_wait
!faceplayer
lq_chigusa: {道|みち} が {開|ひら}いて 、 {荷車|にぐるま} が {動|うご}き{出|だ}したら {下|お}りる 。 {雪鈴|ゆきすず} の {上|うえ} の {灯|あか}り が ともれば 、 {吹|ふ}き{溜|だ}まり も {崩|くず}れる だろう さ 。 || When the road opens and the carts are moving, I'll go down. Once the light above Snowbell is lit, the drifts should give way too.
lq_chigusa[smile]: …… {手紙|てがみ} は 、 もう {出|だ}した よ 。 {取|と}り{消|け}せない よう に ね 。 || …I've sent the letter already. So I can't take it back.

@scene lq.stall_note
narr: {屋台|やたい} に {札|ふだ} が {下|さ}がって いる 。 「 {葦|あし}ノ{瀬|せ} へ {行|い}って きます 。 {借|か}り を {返|かえ}したら {戻|もど}ります 。 チグサ 」 || A card hangs on the stall: "Gone to Reedwake. Back once I've paid what I owe. — Chigusa"

@scene lq.fare_pay
!faceplayer lq_chigusa
lq_chigusa: …… {来|き}た ね 。 {手紙|てがみ} は {先|さき} に {着|つ}いてた 。 {朝|あさ} から ずっと 、 ここ に {座|すわ}ってる 。 || …You came. My letter got here first. I've been sitting here since morning.
koji: {座|すわ}ってる だけ で 、 {茶|ちゃ} も {飲|の}まない ん だ 。 {姉|ねえ}さん が {三杯|さんばい} も いれた のに 。 || Just sitting. Won't touch her tea, and my sister's poured her three cups.
hana[smile]: {薄|うす}い って {顔|かお} を された の 。 {失礼|しつれい} しちゃう わ 。 || She made a face as if it were weak. How rude.
lq_chigusa[think]: …… {始|はじ}める よ 。 || …Let's begin.
narr: チグサ は {立|た}ち{上|あ}がって 、 コウジ の {前|まえ} に {小銭|こぜに} を {並|なら}べた 。 {三十年|さんじゅうねん} {前|まえ} の {渡|わた}し{賃|ちん} と 、 {同|おな}じ {額|がく} だ 。 || Chigusa stands and lays coins in front of Kōji — the same sum as a fare thirty years ago.
lq_chigusa: {嵐|あらし} の {夜|よる} に 、 お{母|かあ}さん に {渡|わた}して もらった {者|もの} です 。 {遅|おそ}く なりました 。 {申|もう}し{訳|わけ} ありません でした 。 || I'm the one your mother took across on a stormy night. I'm late. I'm truly sorry.
koji[think]: …… {金|かね} は いい 。 おふくろ は {金|かね} を {待|ま}ってた ん じゃ ない 。 || …Keep the money. Mum wasn't waiting for money.
lq_chigusa: {分|わ}かってる 。 でも 、 {払|はら}わせて おくれ 。 {一|ひと}つ ぐらい 、 {約束|やくそく} を {約束|やくそく} どおり に {守|まも}らせて ほしい ん だ 。 || I know. But let me pay. Let me keep one promise the way I promised it.
koji: …… {分|わ}かった 。 || …All right.
narr: コウジ は {小銭|こぜに} を {受|う}け{取|と}り 、 {渡|わた}し{帳|ちょう} を {開|ひら}いた 。 {白|しろ}い {所|ところ} の {横|よこ} に 、 {筆|ふで} を {置|お}く 。 || Kōji takes the coins and opens the fare book, and sets a brush beside the blank space.
koji: {名前|なまえ} を {書|か}いて くれ 。 {帳面|ちょうめん} に 、 {覚|おぼ}えて おいて もらおう 。 || Write your name. Let the book remember it.
narr: 「 チグサ 」 。 {今度|こんど} は 、 {震|ふる}えて いない {字|じ} だった 。 その {横|よこ} に 、 コウジ が {小|ちい}さく {書|か}き{足|た}す 。 「 {済|す}み 」 。 || "Chigusa". This time the hand doesn't shake. Beside it, Kōji adds in small letters: "Paid".
koji[smirk]: それ と 、 これ 。 {質草|しちぐさ} だ 。 …… {質草|しちぐさ} の チグサ さん か 。 {覚|おぼ}え やすい な 。 || And this. The pledge. …Chigusa and her pledge — shichigusa. Easy to remember.
hana: コウジ ！ || Kōji!
lq_chigusa[laugh]: …… いい よ 。 {言|い}われ{慣|な}れてる 。 || …It's fine. I've heard that one before.
lq_chigusa: かもめ{亭|てい} の 、 {女将|おかみ} さん の {判子|はんこ} だ 。 …… {自分|じぶん} で {返|かえ}し に {行|い}く よ 。 {海|うみ} も 、 ひさしぶり に {見|み}たい し ね 。 || It belongs to the Gull — to the landlady there. …I'll take it back myself. I'd like to see the sea again, too.
hana: また {寄|よ}って ね 。 {次|つぎ} は {濃|こ}い の を いれる から 。 || Come by again. Next time I'll make it strong.
!set lq_fare_paid
!quest lq_fare 5
?(comp=nao) comp[smile]: …… {遅配|ちはい} {三十年|さんじゅうねん} 。 でも 、 {届|とど}いた 。 || …Thirty years overdue. But delivered.
?(comp=mio) comp[smile]: {名前|なまえ} が {戻|もど}った {帳面|ちょうめん} って 、 いい です ね 。 {薬|くすり} の ラベル を {貼|は}り{直|なお}した {時|とき} みたい 。 || A book with its name back. It's like re-labelling a jar.
?(comp=ren) comp: 「 {済|す}み 」 。 {短|みじか}い {字|じ} です が 、 どんな {灯|あか}り の {名前|なまえ} より {重|おも}い かも しれません 。 || "Paid". A short word — perhaps heavier than any lantern name.
?(comp=suzu) comp[laugh]: {帳尻|ちょうじり} が {合|あ}った ！ {三十年|さんじゅうねん} {越|ご}し の {決算|けっさん} だ よ 。 || The books balance! A reckoning thirty years in the making.
!autosave
!refresh

@scene lq.fare_gull
tamae[laugh]: {聞|き}いて よ ！ ハトねえ が {帰|かえ}って きた ん だ よ ！ {三十年|さんじゅうねん} ぶり ！ || Listen to this! Sister Dove came back! After thirty years!
lq_chigusa[shy]: {大|おお}きな {声|こえ} で {言|い}う ん じゃ ない よ 。 …… {七|なな}つ の {子|こ} が 、 {女将|おかみ} に なってる なんて ね 。 || Don't shout it about. …The seven-year-old's the landlady now. Imagine.
lq_chigusa: これ 。 お{母|かあ}さん に {借|か}りた もの だ 。 {返|かえ}す の が {遅|おそ}く なった 。 || This. I borrowed it from your mother. I'm late returning it.
narr: {小|ちい}さな {木|き} の {判子|はんこ} 。 タマエ は それ を {紙|かみ} に {押|お}した 。 「 かもめ 」 。 || The small wooden seal. Tamae presses it onto a slip of paper. "Kamome".
tamae[sad]: …… {母|かあ}ちゃん は ね 、 「 {貸|か}した だけ だ 。 そのうち {戻|もど}って くる 」 って 、 {最後|さいご} まで {言|い}ってた よ 。 || …Mum always said, right to the end: "I only lent it. It'll come back one of these days."
tamae[laugh]: {本当|ほんとう} に {戻|もど}って きた よ 、 {母|かあ}ちゃん 。 || It really did come back, Mum.
lq_chigusa: {判子|はんこ} の {分|ぶん} 、 {台所|だいどころ} で {働|はたら}いて {返|かえ}そう か 。 || Shall I work off the seal in your kitchen?
tamae: やめて おくれ ！ あんた の お{茶|ちゃ} を {出|だ}したら 、 お{客|きゃく} が {眠|ねむ}れなく なる 。 || Don't you dare! Serve your tea here and the guests won't sleep a wink.
lq_chigusa[laugh]: …… {峠|とうげ} に {帰|かえ}る よ 。 {荷車|にぐるま} の {連中|れんちゅう} が {待|ま}ってる 。 || …I'm going back to the pass. The carters are waiting.
!faceplayer lq_chigusa
lq_chigusa: あんた に は 、 これ を 。 {三十年|さんじゅうねん} 、 {卓|たく} の {上|うえ} に {伏|ふ}せて おいた {湯呑|ゆの}み だ 。 もう {要|い}らない 。 {次|つぎ} に {借|か}り が できた {時|とき} の ため に 、 {持|も}って おいき 。 || This is for you. The cup I kept upside down on my table for thirty years. I don't need it now. Keep it for the next time you owe someone.
!give lq_kept_cup
!quest lq_fare done
?(comp=nao) comp: {貸|か}した {判子|はんこ} と 、 {借|か}りた {渡|わた}し{賃|ちん} 。 {両方|りょうほう} {届|とど}いた 。 {配達人|はいたつにん} と して は 、 {満点|まんてん} だ 。 || A lent seal and an owed fare — both delivered. As a courier, I'd call that full marks.
?(comp=mio) comp[smile]: {借|か}りた もの を {返|かえ}す と 、 {人|ひと} って {背|せ} が {伸|の}びる の ね 。 チグサ さん 、 {来|き}た {時|とき} より {大|おお}きく {見|み}える 。 || Returning what you borrowed makes people stand taller. Chigusa looks bigger than when she came in.
?(comp=ren) comp: {判子|はんこ} が {帰|かえ}って 、 {名前|なまえ} が {帰|かえ}って 、 {人|ひと} が {帰|かえ}った 。 …… {灯|あか}り {一|ひと}つ {分|ぶん} くらい 、 {世界|せかい} が {明|あか}るく なった {気|き} が します 。 || The seal came home, the name came home, and a person came home. …The world feels about one lantern brighter.
?(comp=suzu) comp[smile]: {借|か}り を {返|かえ}した {人|ひと} の {顔|かお} って 、 {舞台|ぶたい} を {降|お}りた {役者|やくしゃ} と {同|おな}じ だ よ 。 {疲|つか}れて 、 {軽|かる}くて 、 ちょっと {寂|さび}しい 。 || Someone who's just paid off a debt has the same face as an actor coming off stage. Tired, light, and a little lonely.
!set lq_fare_done
!autosave
!refresh

@scene lq.fare_tamae_after
!faceplayer tamae
tamae: {判子|はんこ} は {台所|だいどころ} の {柱|はしら} に {掛|か}けた よ 。 {母|かあ}ちゃん が {掛|か}けてた {所|ところ} に ね 。 || I hung the seal on the kitchen post — where Mum used to keep it.
tamae[laugh]: ハトねえ から {手紙|てがみ} が {来|く}る よう に なった ん だ 。 {字|じ} が {濃|こ}くて 、 {読|よ}む と {目|め} が {覚|さ}める 。 || Sister Dove writes to me now. Her handwriting's as strong as her tea — reading it wakes you right up.

@scene lq.fare_koji_after
!faceplayer koji
koji: おふくろ の {帳面|ちょうめん} 、 {最後|さいご} の {頁|ページ} まで {埋|う}まった 。 {新|あたら}しい {帳面|ちょうめん} を {下|お}ろした よ 。 || Mum's book is full to the last page now. I've started a new one.
koji[smirk]: {一行目|いちぎょうめ} は チグサ さん だ 。 {帰|かえ}る {前|まえ} に 、 {向|む}こう{岸|ぎし} まで {一往復|いちおうふく} 、 {乗|の}って いった 。 {今度|こんど} は {前払|まえばら}い で な 。 || First line is Chigusa. Before she left, she rode across to the far bank and back. Paid up front this time.

@scene lq.chigusa_after
!faceplayer
lq_chigusa: {荷車|にぐるま} の {連中|れんちゅう} が 、 「 {最近|さいきん} お{茶|ちゃ} が {甘|あま}く なった 」 って {言|い}う ん だ よ 。 {失礼|しつれい} な 。 {同|おな}じ {濃|こ}さ だ 。 || The carters say my tea's gone soft lately. The cheek. It's exactly as strong as ever.
lq_chigusa[smile]: …… {湯呑|ゆの}み を {一|ひと}つ {減|へ}らした だけ さ 。 || …All I did was put one cup away.
?(lq_road_open) lq_chigusa: {小春野|こはるの} に も {行|い}って きた よ 。 {母|はは} の {名前|なまえ} が 、 {石|いし} に {残|のこ}って た 。 {柿|かき} を {一|ひと}つ 、 もらって きた 。 || I went to Koharuno too. My mother's name was still on the stone. I brought back a persimmon.

@scene lq.chigusa_post
!faceplayer
lq_chigusa: {下|した} から {上|のぼ}って くる {人|ひと} が {増|ふ}えた よ 。 {名前|なまえ} の {戻|もど}った {道|みち} は 、 {人|ひと} を {呼|よ}ぶ ん だ ね 。 || More people come up from below these days. A road that has its name back calls people to it.
lq_chigusa: {春|はる} に なったら 、 {一度|いちど} {葦|あし}ノ{瀬|せ} の {舟|ふね} に {乗|の}り に {行|い}く 。 {今度|こんど} は {客|きゃく} と して ね 。 || Come spring I'll go and ride the Reedwake ferry once. As an ordinary passenger, this time.
`, 'lq/30_fare');
