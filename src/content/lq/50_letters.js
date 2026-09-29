/* The long quest lines: letters from home (the way in for players who left
 * Reedwake without hearing of either line, and for saves made before these
 * lines existed) and companion banter in Koharuno. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene lq.letters_home
!set lq_letters
narr: {道|みち} の {向|む}こう から {配達人|はいたつにん} が {走|はし}って きて 、 $name の {名前|なまえ} を {呼|よ}んだ 。 「 {葦|あし}ノ{瀬|せ} から 、 {手紙|てがみ} です よ ！ 」 || A courier comes running up the road, calling your name. "Letters from Reedwake!"
!if quest.lq_fare -> road
narr: {一通|いっつう} は コウジ から 。 {不器用|ぶきよう} な {字|じ} だ 。 || One is from Kōji, in a clumsy hand.
narr: 「 おふくろ の {渡|わた}し{帳|ちょう} に 、 {払|はら}って もらってない {渡|わた}し{賃|ちん} が {一|ひと}つ ある 。 {三十年|さんじゅうねん} {前|まえ} の {嵐|あらし} の {夜|よる} の {客|きゃく} だ 。 {名前|なまえ} は {消|き}えた 。 {客|きゃく} が {置|お}いてった@置く {判子|はんこ} を {下|した} に {押|お}して おく 。 {旅|たび} の {途中|とちゅう} で {見覚|みおぼ}え が あったら 、 {教|おし}えて くれ 。 」 || "There's one fare in Mum's ferry book that was never paid — a passenger on a stormy night thirty years ago. The name's gone. I've pressed the seal they left, below. If you come across it on your travels, let me know."
narr: {手紙|てがみ} の {下|した} に 、 {判子|はんこ} の {跡|あと} 。 「 かもめ 」 。 || At the bottom, the seal's stamp: "kamome".
!give lq_stamp
!note lq_farebook
!quest lq_fare 1
:road
!if quest.lq_road -> end
narr: もう {一通|いっつう} は ツル から 。 {短|みじか}い {手紙|てがみ} だ 。 || The other is from Tsuru. It's short.
narr: 「 コウジ の {渡|わた}し{小屋|ごや} の {先|さき} に 、 {名前|なまえ} の ない {灯|あか}り が ある 。 ヤス は {昔|むかし} 、 その {先|さき} の {村|むら} に {住|す}んで いた そう だ 。 {大|おお}きな {柿|かき} の {木|き} の ある {村|むら} で 、 {大水|おおみず} の {後|あと} 、 {村|むら} の {者|もの} は {舟|ふね} で {川|かわ} を {下|くだ}った 。 {潮硝子|しおがらす} の {船乗|ふなの}り に でも {聞|き}いて みて おくれ 。 ツル 」 || "Past Kōji's ferry house there's a lantern with no name. Yasu says he once lived in the hamlet beyond it — a place with a great persimmon tree. After the flood its people went downriver by boat. Ask the Saltglass boatmen, would you? — Tsuru"
!quest lq_road 1
?(comp=nao) comp: {配達人|はいたつにん} に {追|お}いつかれる の は 、 {変|へん} な {気分|きぶん} だ な 。 || Strange feeling, being caught up by a courier.
?(comp=ren) comp: ツル さん の {字|じ} です ね 。 {灯|あか}り の {名前|なまえ} と {同|おな}じ で 、 {少|すこ}し も {崩|くず}れて いない 。 || That's Tsuru's hand. Like her lantern names — not a stroke out of place.

@scene lq.b_nao
comp: {誰|だれ} も いない {村|むら} に も 、 {宛名|あてな} は ある 。 {石|いし} の {名前|なまえ} 、 {全部|ぜんぶ} {読|よ}んだ 。 …… {届|とど}ける {先|さき} が ある の は 、 いい もん だ 。 || Even an empty village has addresses. I read every name on the stone. …It's good, having somewhere to deliver to.

@scene lq.b_mio
comp: {柿|かき} の {葉|は} は 、 {干|ほ}して お{茶|ちゃ} に も できる の よ 。 …… {作|つく}り{方|かた} 、 ラベル に {書|か}いて おかなきゃ 。 || You can dry persimmon leaves and make tea from them, you know. …I must write the method on a label.

@scene lq.b_ren
comp: {師匠|ししょう} は 、 {灯|あか}り の {名前|なまえ} を {書|か}く {前|まえ} に 、 {必|かなら}ず {声|こえ} に {出|だ}して {読|よ}んで いました 。 …… {理由|りゆう} が 、 やっと {分|わ}かった {気|き} が します 。 || Before writing a lantern's name, my teacher always read it aloud first. …I think I finally understand why.

@scene lq.b_suzu
comp: {柿|かき} って ね 、 {渋|しぶ}い うち に {採|と}って {干|ほ}す と 、 {甘|あま}く なる んだって 。 {人|ひと} も そう なら いい けど 。 …… {私|わたし} ？ まだ {干|ほ}し{中|ちゅう} 。 || They say if you pick persimmons while they're still bitter and dry them, they turn sweet. Wouldn't it be nice if people worked that way. …Me? Still drying.
`, 'lq/50_letters');
