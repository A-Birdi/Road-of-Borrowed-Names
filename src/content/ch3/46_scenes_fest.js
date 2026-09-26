/* Chapter 3 — festival night: what each resident says under the lanterns.
 * Lines vary with what the player did (side quests, choices at the assembly). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene co.fest_tokiwa
co_tokiwa: {年代記|ねんだいき} の {今年|ことし} の {頁|ページ} は 、 {長|なが}く なりそう です 。 {書|か}く こと が {多|おお}い 。 {泣|な}いた こと も 、 {笑|わら}った こと も 。 || This year's page in the chronicle will be a long one. There's a great deal to write — the crying and the laughing both.
co_tokiwa: {本年|ほんねん} 、 と {書|か}きます 。 {同年|どうねん} で は なく 。 {今|いま} 、 ここ で {書|か}いて いる {記録|きろく} です から 。 || I'll write "this year". Not "that same year". Because this record is being written here, now.
?(co_asm_names) co_tokiwa: {名前|なまえ} から {読|よ}んで 、 よかった 。 {五人|ごにん} が 、 {今夜|こんや} は {皆|みな} と {一緒|いっしょ} に いる {気|き} が します 。 || I'm glad we began with the names. Tonight it feels as though the five are here with us.
?(co_asm_living) co_tokiwa: {生|い}きて いる {人|ひと} の ため に 、 と {言|い}って くださった 。 {記録|きろく} は 、 {本来|ほんらい} そう いう もの でした 。 || You said "for the living". That is what records were meant to be for.
?(co_asm_ume) co_tokiwa: ウメ さん に {話|はな}して もらって よかった 。 {覚|おぼ}えて いた {人|ひと} の {言葉|ことば} は 、 {私|わたし} の {字|じ} より {重|おも}い 。 || I'm glad Ume spoke. The words of someone who kept remembering weigh more than anything in my hand.

@scene co.fest_ume
co_ume: {若|わか}い {頃|ころ} の {祭|まつ}り の {歌|うた} を 、 {思|おも}い{出|だ}した よ 。 {二番|にばん} が ある ん だ 。 {誰|だれ} も {歌|うた}わなく なって た 、 {二番|にばん} が ね 。 || I remembered the festival song from when I was young. There's a second verse. A verse nobody had been singing.
co_ume[smile]: {火|ひ} を {送|おく}る {歌|うた} さ 。 {来|き}た {火|ひ} に 、 {帰|かえ}り{道|みち} を {教|おし}える {歌|うた} 。 || It's a song for seeing the fire off. It shows the fire that came the way home.

@scene co.fest_goro
co_goro: {祭|まつ}り の {終|お}わり に 、 {鐘|かね} を {一度|いちど} だけ {鳴|な}らす 。 {五人|ごにん} の ため に な 。 {一度|いちど} だけ だ 。 {皆|みな} が {走|はし}り{出|だ}さん よう に 。 || At the end of the festival I'll ring the bell once. For the five. Only once — so nobody goes running.
?(co_bell_done) co_goro: {綱|つな} を {探|さが}して くれた の は 、 あんた だ 。 {鳴|な}らす {時|とき} 、 {少|すこ}し {思|おも}い{出|だ}す と しよう 。 || You're the one who found me the rope. When I ring it, I'll think of you a little.

@scene co.fest_sayo
co_sayo[laugh]: {見|み}て ！ {席|せき} が {全部|ぜんぶ} {埋|う}まって る の 。 {空|あ}いて いる の は 、 {名前|なまえ} の ある {五|いつ}つ だけ 。 {空|あ}いて いて も 、 {今年|ことし} は {誰|だれ} か が いる 。 || Look! Every seat is filled. The only empty ones are the five with names. Empty, but this year there's someone in them.
?(co_count_done) co_sayo: {甘|あま}い もの は 、 ノブ さん の {小皿|こざら} で {配|くば}って る わ 。 {三十枚|さんじゅうまい} 、 ぴったり ！ || The sweets are going round on Nobu's small plates. Thirty exactly!

@scene co.fest_kotaro
co_kotaro: {甘酒|あまざけ} 、 {今年|ことし} は {二杯|にはい} {飲|の}んで いい って ！ {特別|とくべつ} な {年|とし} だ から だって 。 {何|なに} が {特別|とくべつ} か 、 {誰|だれ} も {教|おし}えて くれない けど 。 || I'm allowed two cups of amazake this year! Because it's a special year, they said. Nobody'll tell me what's special.
co_kotaro: …… {嘘|うそ} 。 {知|し}って る 。 {父|とう}ちゃん が {泣|な}き ながら {教|おし}えて くれた 。 || …That's a lie. I know. Dad told me, crying.

@scene co.fest_isao
co_isao: {火屋|ほや} {三十個|さんじゅっこ} 。 {今年|ことし} は {全部|ぜんぶ} ヒロ が {吹|ふ}いた 。 {最後|さいご} の {一|ひと}つ も 、 {上手|うま}く いった そう だ 。 || Thirty globes. Hiro blew every one this year. Even the last one came out right, he says.
co_isao: …… {右手|みぎて} が {痛|いた}む 。 {悪|わる}い {痛|いた}み じゃ ねえ 。 {何|なに} を {掴|つか}んだ か 、 {分|わ}かった から な 。 || …My right hand aches. It's not a bad ache. Now I know what I was holding on to.

@scene co.fest_hiro
hiro: {席|せき} に {名前|なまえ} を {書|か}いた ら 、 {不思議|ふしぎ} と {肩|かた} が {軽|かる}く なった 。 {二十年|にじゅうねん} 、 {何|なに} か を {担|かつ}いで いた らしい 。 || When I wrote her name on the seat, my shoulders felt oddly light. I must have been carrying something for twenty years.
?(comp=suzu) hiro: …… {隣|となり} 、 {空|あ}いて る ぞ 。 {返済|へんさい} の {日|ひ} だ 。 || …The seat next to it is free. Payment's due.
?(comp=suzu) comp[smile]: {分|わ}かって る わ よ 。 {帳簿|ちょうぼ} {通|どお}り に ね 。 || I know, I know. By the book.
?(comp!=suzu) hiro: スズ の {芝居|しばい} 、 {見|み}る か 。 {次|つぎ} だ そう だ 。 …… {俺|おれ} は {一番|いちばん} {前|まえ} で {見|み}る 。 {待|ま}た された {分|ぶん} な 。 || Watching Suzu's piece? She's on next. …I'm watching from the front row. I've waited long enough.

@scene co.fest_nobu
co_nobu: {飲|の}む か 。 {甘酒|あまざけ} だ 。 とっくり に {入|い}れて ある 。 …… {三十本|さんじゅっぽん} も あれば 、 {使|つか}い{道|みち} は ある もん だ な 。 || Drink? Amazake. In a flask. …Turns out thirty flasks do find a use.
?(co_count_done) co_nobu: {湯呑|ゆの}み 、 {使|つか}って る か 。 {灰|はい} の {釉|くすり} は 、 {使|つか}う ほど {色|いろ} が {深|ふか}く なる 。 || Using that cup? Ash glaze deepens the more you use it.

@scene co.fest_fusa
co_fusa[smile]: ヨシノ が {染|そ}めた {旗|はた} 、 {物置|ものおき} に {一枚|いちまい} だけ {残|のこ}って た の 。 {今夜|こんや} は 、 {舞台|ぶたい} の {真|ま}ん{中|なか} に {下|さ}げた わ 。 || One of the banners Yoshino dyed was still in the storeroom. Tonight I hung it in the middle of the stage.
?(co_orders_done) co_fusa: {甘酒|あまざけ} の {注文|ちゅうもん} 、 {今夜|こんや} も {手伝|てつだ}って くれる ？ …… {冗談|じょうだん} よ 。 {今夜|こんや} は {飲|の}む {側|がわ} で いて 。 || Help with the amazake orders again tonight? …I'm joking. Tonight, be on the drinking side.

@scene co.fest_shino
co_shino: {今夜|こんや} は {手紙|てがみ} を {書|か}く {人|ひと} が {多|おお}い ん です 。 {宛先|あてさき} の ない {手紙|てがみ} を 。 {五|いつ}つ の {棚|たな} に 、 もう {入|はい}りきらない くらい 。 || A lot of people are writing letters tonight. Letters with no destination. The five slots are already overflowing.

@scene co.fest_tamotsu
co_tamotsu: {灯籠|とうろう} の {夜|よる} は 、 {水路|すいろ} の {横|よこ} で {見張|みは}る 。 {親父|おやじ} も そう して た 。 {今|いま} は {理由|りゆう} を {知|し}って る 。 {理由|りゆう} を {知|し}って {立|た}つ {見張|みは}り は 、 {眠|ねむ}く ならん 。 || On lantern night I keep watch by the channel. My father did the same. Now I know why. A watch you stand knowing why doesn't make you sleepy.

@scene co.fest_asa
co_asa: {上|うえ} の {段|だん} の {柿|かき} 、 {初|はじ}めて {採|と}った の 。 {渋|しぶ}かった ！ {干|ほ}せば {甘|あま}く なる って 、 ウメ ばあちゃん が 。 || I picked persimmons from the upper terraces for the first time. So astringent! Grandma Ume says they'll sweeten once they're dried.
?(co_signs_done) co_asa: {道|みち}しるべ の {火除|ひよ}け{道|みち} の {腕|うで} 、 {今朝|けさ} {皆|みな} が {見上|みあ}げて {歩|ある}いて た よ 。 || This morning everyone was looking up at the "firebreak path" arm as they walked.

@scene co.fest_heita
co_heita: {今日|きょう} は {朝|あさ} から {草|くさ} を {刈|か}って 、 {夜|よる} は {祭|まつ}り っす 。 {人生|じんせい} で {一番|いちばん} {働|はたら}いた {日|ひ} っす よ 。 {昼寝|ひるね} も して ない 。 …… ちょっと だけ しか 。 || Cutting grass since dawn, festival by night. Hardest-working day of my life. Didn't even nap. …Well, only a little.
`, 'ch3/festival');
