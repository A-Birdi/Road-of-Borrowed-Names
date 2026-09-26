/* Chapter 5 scenes: arrival, the town, readable things, and the everyday
 * residents of Lanternfall before the bell, after it, and after the story. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene lf.arrive
!set lf_arrived
!chapter 5
narr: {松|まつ} の {林|はやし} を {抜|ぬ}ける と 、{急|きゅう} に {谷|たに} が {開|ひら}けた 。|| The road comes out of the pines, and all at once the valley opens below you.
!card {第五章|だいごしょう} 　{灯落|ひおち} || Chapter 5 — Lanternfall
narr: {藍色|あいいろ} の {屋根|やね} 、{細|ほそ}い {運河|うんが} 、{行儀|ぎょうぎ} よく {並|なら}んだ {灯|あか}り 。|| Indigo roofs, narrow canals, lanterns standing in well-mannered rows.
narr: {湖|みずうみ} の {中|なか} から 、{古|ふる}い {塔|とう} の {先|さき} だけ が {突|つ}き{出|で}て いる 。|| Out in the lake, only the top of an old tower breaks the water.
?(comp=nao) comp[smirk]: {着|つ}いた 。{灯落|ひおち} だ 。{書類|しょるい} の {町|まち} だよ 。|| Here we are. Lanternfall. Town of paperwork.
?(comp=nao) comp[think]: …… {変|へん} だな 。{静|しず}か すぎる 。{前|まえ} は {役所|やくしょ} の {前|まえ} で 、{誰|だれ} か が いつも {言|い}い{争|あらそ}って いた のに 。|| …Odd. Too quiet. Last time, somebody was always arguing outside the offices.
?(comp=nao) comp[closed]: …… それ に 、ここ に は 、{届|とど}けて ない {手紙|てがみ} の {相手|あいて} が いる 。|| …And the person that undelivered letter is for lives here.
?(comp=mio) comp[smile]: わあ 、きれい な {町|まち} 。{道|みち} が {全部|ぜんぶ} まっすぐ 。|| Oh, what a lovely town. Every street is perfectly straight.
?(comp=mio) comp[think]: {植木|うえき} も 、{全部|ぜんぶ} {同|おな}じ {形|かたち} に {刈|か}って ある 。…… ちょっと 、{息苦|いきぐる}しい かも 。|| Every hedge is clipped to the same shape, too. …It's a little stifling, maybe.
?(comp=mio) comp: {灯落|ひおち} の {市場|いちば} で 、{薬草|やくそう} を {買|か}い{足|た}したい な 。{時間|じかん} が あったら ね 。|| I'd like to restock herbs at the market here. If we have time.
?(comp=ren) comp[smile]: {灯落|ひおち} 。{灯守|ひもり} の {記録|きろく} に 、よく {出|で}て くる {町|まち} です 。|| Lanternfall. It turns up a lot in the lantern keepers' records.
?(comp=ren) comp[think]: 「{灯|ひ} が {落|お}ちる」 と {書|か}いて ひおち 。{縁起|えんぎ} が いい の か {悪|わる}い の か 、{昔|むかし} から {議論|ぎろん} が ある そう です 。|| Written "lanterns falling". Whether that's a good omen or a bad one has been argued about for centuries, apparently.
?(comp=ren) comp[smirk]: {道|みち} が {全部|ぜんぶ} まっすぐ なら 、{私|わたし} でも {迷|まよ}いません 。…… たぶん 。|| If all the streets are straight, even I won't get lost. …Probably.
?(comp=suzu) comp[laugh]: さあさあ 、お{立|た}ち{会|あ}い ！ {役所|やくしょ} と {運河|うんが} の {町|まち} 、{灯落|ひおち} で ござい ！|| Roll up, roll up! Behold Lanternfall, city of offices and canals!
?(comp=suzu) comp[think]: …… {昔|むかし} ここ で {芝居|しばい} を した とき は 、{客|きゃく} が よく {野次|やじ} を {飛|と}ばした もの よ 。|| …When we played here years ago, the audience heckled like anything.
?(comp=suzu) comp[worry]: {今日|きょう} は 、やけ に {静|しず}か ね 。|| Awfully quiet today, though.
pc: {下|お}りて みましょう 。|| Let's go down.
?(comp=nao) !quest lf_nao start
!journal {灯落|ひおち} に {着|つ}いた 。{町|まち} は {妙|みょう} に {静|しず}か だ 。|| Arrived above Lanternfall. The town is strangely quiet.
!autosave

@scene lf.road_sign
narr: 「← {雪鈴|ゆきすず} 　 {灯落|ひおち} → 」 {上|うえ} へ {向|む}かう {腕|うで} だけ 、{字|じ} が ない 。|| "← Snowbell · Lanternfall →". Only the arm pointing up the mountain has no writing on it.
?(ch5_done) narr: …… {今|いま} は 、{上|うえ} の {腕|うで} に も {字|じ} が ある 。「↑ {静寂|しじま} の {書庫|しょこ}」 。|| …Now the upward arm has words too. "↑ The Still Archive."

@scene lf.road_marker
narr: {苔|こけ}むした {道|みち}しるべ 。「{灯落|ひおち} まで {半里|はんり}」 。|| A mossy waymarker. "Lanternfall: half a ri." (About two kilometres.)

@scene lf.road_bench
narr: {谷|たに} を {見下|みお}ろす {古|ふる}い {腰掛|こしか}け 。{座|すわ}る と 、{町|まち} の {灯|あか}り が {一|ひと}つ ずつ {点|つ}いて いく の が {見|み}える 。|| An old bench looking down over the valley. Sit, and you can watch the town's lamps come on one by one.
?(comp=nao) comp: {全部|ぜんぶ} 、{同|おな}じ {間隔|かんかく} で {点|つ}く 。{気持|きも}ち {悪|わる}い くらい {正確|せいかく} だ 。|| They all light at exactly the same interval. Creepily precise.
?(comp=mio) comp: {少|すこ}し {休|やす}もう か 。{足|あし} 、{痛|いた}く ない ?|| Shall we rest a bit? Your feet aren't sore?
?(comp=ren) comp: {灯|あか}り の {点|つ}け{方|かた} が 、{教本|きょうほん}どおり です 。…… {教本|きょうほん}どおり すぎます 。|| They're lighting them exactly by the manual. …A little too exactly.
?(comp=suzu) comp: いい {眺|なが}め 。{幕|まく} が {上|あ}がる {前|まえ} の {客席|きゃくせき} みたい 。|| Nice view. Like the house just before the curtain goes up.

@scene lf.road_lantern
!if ch5_done -> lit
narr: {分|わ}かれ{道|みち} の {灯籠|とうろう} 。{笠|かさ} に は 、{何|なに} も {書|か}いて いない 。|| The lantern at the fork. Its shade is blank.
narr: {誰|だれ} か が {消|け}した の で は ない 。{字|じ} が 、{上|うえ} へ {持|も}ち{上|あ}げられた よう に 、{薄|うす}く なって {消|き}えた の だ 。|| Nobody rubbed it out. The writing grew faint and vanished, as if it had been lifted upwards.
?(comp=ren) comp[worry]: {行|い}き{先|さき} の {名前|なまえ} が ない {灯|ひ} は 、{道|みち} を {忘|わす}れさせます 。この {先|さき} は 、{今|いま} は {通|とお}れません 。|| A lantern without the name of where it leads makes the road forget itself. We can't get through that way right now.
!end
:lit
narr: {灯籠|とうろう} に {灯|ひ} が {入|はい}って いる 。{笠|かさ} に は 、{細|ほそ}い {字|じ} で 「{静寂|しじま} の {書庫|しょこ}」 。|| The lantern is lit. On its shade, in fine brushwork: "The Still Archive."
narr: {誰|だれ} の {字|じ} か は わからない 。ただ 、とても {几帳面|きちょうめん} な {字|じ} だ 。|| You can't tell whose hand it is. Only that it is very meticulous.

@scene lf.road_north_locked
narr: {山|やま} へ {登|のぼ}る {道|みち} は 、{数歩|すうほ} {先|さき} で {霧|きり} に {溶|と}けて いる 。|| The road up the mountain melts into mist a few steps ahead.
narr: {進|すす}もう と して も 、{気|き} が つく と {同|おな}じ {場所|ばしょ} に {立|た}って いる 。|| Try to go on, and you find yourself standing in the same place.
?(comp=nao) comp: {出口|でぐち} の ない {道|みち} は 、{道|みち} じゃ ない 。{下|した} の {町|まち} が {先|さき} だ 。|| A road with no way out isn't a road. The town first.
?(comp=mio) comp[worry]: {頭|あたま} が くらくら する 。{町|まち} へ {戻|もど}ろう 。|| My head's spinning. Let's go back to the town.
?(comp=ren) comp: {灯籠|とうろう} の {名前|なまえ} が {戻|もど}らない {限|かぎ}り 、この {道|みち} は {開|ひら}きません 。|| As long as the lantern's name doesn't come back, this road won't open.
?(comp=suzu) comp: この {道|みち} 、{迷子|まいご} の {芝居|しばい} を {繰|く}り{返|かえ}してる みたい 。{幕間|まくあい} に しましょ 。|| This road keeps playing the same lost-traveller scene. Let's call an interval.
!move pc down 1

@scene lf.town_intro
!set lf_town_intro
!faceplayer lf_hayato
lf_hayato[smile]: ようこそ 、{灯落|ひおち} へ 。{旅|たび} の {方|かた} です ね 。|| Welcome to Lanternfall. You'll be travellers, I take it.
lf_hayato: こちら に 、お{名前|なまえ} を お{願|ねが}い します 。|| Your name here, please.
narr: {差|さ}し{出|だ}された {用紙|ようし} の {欄|らん} は 、{最初|さいしょ} から ぜんぶ 「{許可|きょか}」 に {丸|まる} が ついて いる 。|| On the form he offers, every box is already circled "approved".
pc: もう {全部|ぜんぶ} 、「{許可|きょか}」 に なって います ね 。|| Everything's already marked "approved".
lf_hayato[smile]: はい 、もちろん です 。|| Yes, of course.
pc: もし {私|わたし} が 、{怪|あや}しい {者|もの} だったら ?|| And if I were someone suspicious?
lf_hayato: かしこまりました 。|| Certainly.
pc: …… いえ 、{質問|しつもん} です よ 。|| …No, that was a question.
lf_hayato[think]: はい 、もちろん です 。|| Yes, of course.
narr: {彼|かれ} は にこにこ と うなずいて 、{判子|はんこ} を {押|お}した 。|| He nods pleasantly and stamps it.
?(comp=nao) comp[think]: …… {今|いま} の 、{返事|へんじ} に なって ない よね 。|| …That wasn't an answer, was it.
?(comp=mio) comp[worry]: {何|なに} を {聞|き}いて も 、「はい」 なの ?|| Whatever you ask, it's "yes"?
?(comp=ren) comp[think]: {返事|へんじ} は {丁寧|ていねい} です が 、{中身|なかみ} が ありません ね 。|| Beautifully polite answers. With nothing inside them.
?(comp=suzu) comp[smirk]: ねえ 、お{兄|にい}さん 。{今日|きょう} は {雪|ゆき} が {降|ふ}る と {思|おも}う ?|| Say, young man. Think it'll snow today?
?(comp=suzu) lf_hayato[smile]: もちろん です 。|| Of course.
?(comp=suzu) comp[worry]: …… こんな に {晴|は}れてる のに ね 。|| …Under a sky this clear.
!give lf_visitor_pass
lf_hayato: {何|なに} か ご{用|よう} が あれば 、{記録館|きろくかん} の {窓口|まどぐち} へ どうぞ 。{私|わたし} も 、ふだん は そこ に おります 。|| If you need anything, the counter at the Records Hall. I'm usually there myself.
pc: あの 、{湖|みずうみ} の {塔|とう} は {何|なん} です か 。|| Excuse me — what's that tower out in the lake?
lf_hayato[think]: {塔|とう} …… です か 。{記録|きろく} に よれば 、「{特|とく}に {問題|もんだい} なし」 です 。|| The tower…? According to the records, "no particular problem".
lf_hayato[smile]: {詳|くわ}しく は 、{記録館|きろくかん} で どうぞ 。{通|とお}り の {北側|きたがわ} 、{一番|いちばん} {大|おお}きな {建物|たてもの} です 。|| For details, please enquire at the Records Hall. North side of the avenue, the biggest building.
!move lf_hayato right 4 160
!quest lf_main start
!note lf_certainly
!autosave

@scene lf.gate_sign
narr: 「{灯落|ひおち} 。{静|しず}か で {穏|おだ}やか な {町|まち} 。」 {看板|かんばん} の {下|した} の ほう に 、{削|けず}られた {跡|あと} が ある 。|| "Lanternfall. A calm and peaceful town." Lower down the signboard, something has been scraped away.
?(lf_bell_rung) narr: {誰|だれ} か が {白墨|はくぼく} で {書|か}き{足|た}して いる 。「…… と {言|い}う {人|ひと} も いる 。」|| Someone has added in chalk: "…or so some people say."

@scene lf.board
!if lf_bell_rung -> after
narr: {議会|ぎかい} の {掲示板|けいじばん} 。|| The council noticeboard.
narr: 「{議題|ぎだい} {一|いち} ： {灯落|ひおち} の {植木|うえき} は {全|すべ}て {丸|まる}く {刈|か}る こと 。{全員|ぜんいん} {賛成|さんせい} 。」|| "Item one: all shrubs in Lanternfall shall be clipped round. Unanimous."
narr: 「{議題|ぎだい} {二|に} ： {灯落|ひおち} の {植木|うえき} は {全|すべ}て {四角|しかく}く {刈|か}る こと 。{全員|ぜんいん} {賛成|さんせい} 。」|| "Item two: all shrubs in Lanternfall shall be clipped square. Unanimous."
?(comp=nao) comp[smirk]: {丸|まる} で {四角|しかく} 。{庭師|にわし} は どう しろ って ?|| Round and square. What's the gardener meant to do?
?(comp=mio) comp[worry]: どっち も 「{賛成|さんせい}」 …… 。{庭師|にわし} さん 、{困|こま}ってる だろう な 。|| Both "unanimous"… The gardener must be at their wits' end.
?(comp=ren) comp: {丸|まる} と {四角|しかく} の {間|あいだ} を {取|と}る と 、{角|かど} の {丸|まる}い {四角|しかく} です ね 。{議会|ぎかい} も {角|かど} が {取|と}れた よう で 。|| Split the difference between round and square and you get a rounded square. The council seems to have had its corners knocked off too.
?(comp=suzu) comp[laugh]: {全員|ぜんいん} {賛成|さんせい} が ふたつ 。{反対|はんたい} {意見|いけん} を {書|か}く {欄|らん} も ない 。|| Two unanimous votes. There isn't even a space to write an objection.
!end
:after
narr: {掲示板|けいじばん} は 、{貼|は}り{紙|がみ} で いっぱい だ 。「{反対|はんたい}！」 「{再|さい}{審議|しんぎ} を {求|もと}む」 「{植木|うえき} は {好|す}きな {形|かたち} で いい」 。|| The board is covered in notices. "Opposed!" "Motion to reconsider." "Shrubs any shape you like."
narr: {一番|いちばん} {上|うえ} に 、ヤエ の {字|じ} 。「{次|つぎ} の {議会|ぎかい} は {長|なが}く なります 。お{弁当|べんとう} を {持|も}って きなさい 。」|| At the top, in Yae's hand: "The next council meeting will be long. Bring a packed lunch."

@scene lf.statue
narr: {石|いし} の {像|ぞう} 。{台座|だいざ} に 「{調和|ちょうわ}」 と {彫|ほ}って ある 。{像|ぞう} の {顔|かお} は 、{誰|だれ} に も {似|に}て いない 。|| A stone statue. On the plinth: "Harmony". Its face resembles no one at all.
?(lf_bell_rung) narr: {台座|だいざ} の {下|した} に 、{子供|こども} の {字|じ} で 「ケイ の ほう が {上手|じょうず}」 。|| Under the plinth, in a child's writing: "Kei is better at faces."

@scene lf.grate
!if lf_conduit_seen -> known
narr: {運河|うんが} の {縁|ふち} の {鉄格子|てつごうし} 。{耳|みみ} を {近|ちか}づける と 、かすか に {何|なに} か が {流|なが}れて いく {音|おと} が する 。|| An iron grate on the canal's edge. Put your ear close, and something faintly flows past below.
narr: {水|みず} の {音|おと} で は ない 。{上|うえ} へ 、{上|うえ} へ と {向|む}かう 、{囁|ささや}き の よう な {音|おと} 。|| Not water. A whispering that keeps going up and up.
!end
:known
narr: {地下|ちか} の {管|くだ} に つながる {格子|こうし} だ 。{町|まち} の {言|い}えなかった {言葉|ことば} が 、ここ を {通|とお}って {山|やま} へ {運|はこ}ばれて いる 。|| A grate onto the pipes below. Every word this town couldn't say passes through here on its way up the mountain.
?(lf_bell_rung) narr: {今|いま} は 、{逆|ぎゃく} に 、{小|ちい}さな {声|こえ} が ぽこぽこ と {上|あ}がって くる 。「いや」 「ちがう」 「もう {一回|いっかい}」 。|| Now it runs the other way: small voices bubble up. "No." "Wrong." "One more time."

@scene lf.mailbox
narr: {郵便|ゆうびん} の {箱|はこ} 。{横|よこ} の {籠|かご} に 、{戻|もど}って きた {手紙|てがみ} が {山|やま} に なって いる 。どれ も 「{宛先|あてさき}{不明|ふめい}」 の {判子|はんこ} 。|| A postbox. The basket beside it is heaped with returned letters, every one stamped "address unknown".
?(lf_bell_rung) narr: {籠|かご} は {空|から} だ 。「{再|さい}{配達|はいたつ}{中|ちゅう}」 と {書|か}いた {札|ふだ} が {下|さ}がって いる 。|| The basket is empty. A tag hangs on it: "Being redelivered."

@scene lf.canal_boat
narr: {渡|わた}し{舟|ぶね} の {小舟|こぶね} 。{運河|うんが} を {通|とお}って {湖|みずうみ} へ {出|で}る 。|| A small ferry skiff. It goes out to the lake by the canal.
narr: {舟|ふね} の {札|ふだ} ： 「{東岸|ひがしぎし} {行|ゆ}き 」 。{塔|とう} へ {行|い}く {便|びん} は ない 。|| Its board reads "To the east shore". No boat goes to the tower.

@scene lf.sign_sluice
narr: 「{南|みなみ} ： {水門|すいもん} の {岸|きし} 」 。|| "South: the sluice shore."

@scene lf.sign_gardens
narr: 「{東|ひがし} ： {庭|にわ} の {町|まち} 」 。|| "East: the garden quarter."

@scene lf.sign_town
narr: 「{西|にし} ： {灯落|ひおち} {本町|ほんまち} 」 。|| "West: Lanternfall, main town."

@scene lf.bench_canal
narr: {運河|うんが} の {向|む}こう の {小|ちい}さな {公園|こうえん} 。{水|みず} の {音|おと} が 、ここ だけ は {普通|ふつう} に {聞|き}こえる 。|| A little park beyond the canal. Here, at least, the water sounds like water.
?(comp=nao) comp: …… ちょっと {座|すわ}る 。{足|あし} じゃ なくて 、{頭|あたま} が {疲|つか}れた 。|| …Sitting down a sec. Not my feet. My head's tired.
?(comp=mio) comp: {水|みず} の {音|おと} って 、{落|お}ち{着|つ}く ね 。{薬|くすり} より {効|き}く かも 。|| The sound of water's calming, isn't it. Might work better than medicine.
?(comp=ren) comp: {運河|うんが} は {町|まち} の {文字|もじ} の よう な もの です 。{正|ただ}しく {流|なが}れて いれば 、{読|よ}めます 。|| Canals are a kind of handwriting for a town. If they flow properly, you can read them.
?(comp=suzu) comp: {座|すわ}って 、{町|まち} の {音|おと} を {聞|き}く の 。{芝居|しばい} の {稽古|けいこ} と {同|おな}じ 。|| Sit and listen to the town. Same as rehearsing a play.

# ---- the lamplighter and her daughter ----------------------------------------------------------------------------------
@scene lf.nagi
!faceplayer lf_nagi
lf_nagi: {灯|あか}り の {番|ばん} を してる ナギ だ よ 。{気|き} を つけて ね 、{油|あぶら} が {跳|は}ねる 。|| I'm Nagi. I tend the lamps. Mind yourself — the oil spits.
!if seen.lf.nagi -> again
lf_nagi[think]: {最近|さいきん} 、{笠|かさ} の {字|じ} が みんな {同|おな}じ に なって いく の 。「{運河|うんが} {通|どお}り」 も 「{魚|さかな} {通|どお}り」 も 、{今|いま} は ぜんぶ 「{灯落|ひおち}」 。|| Lately the writing on the shades is all turning the same. "Canal Street", "Fish Street" — they all just say "Lanternfall" now.
lf_nagi: おかげ で {道|みち} を {聞|き}かれて も 、「どこ も {灯落|ひおち} です よ 」 と しか {言|い}えない 。|| So when someone asks me the way, all I can say is "It's all Lanternfall."
lf_nagi[smile]: …… うち の ケイ だけ は 、まだ 「いや」 って {言|い}える んだ 。まだ {字|じ} が {書|か}けない から かな 。|| …Only my Kei can still say "no". Maybe because she can't write yet.
?(comp=ren) comp[think]: {字|じ} が {書|か}けない から …… 。{書|か}かれた もの から {先|さき} に {消|き}えて いる 、と いう こと でしょう か 。|| Because she can't write… Could it be that things vanish from what's written first?
!end
:again
lf_nagi: {火|ひ} を {入|い}れる {時間|じかん} は 、{毎日|まいにち} {同|おな}じ 。{誰|だれ} も 「{今日|きょう} は {早|はや}く」 とか 「{遅|おそ}く」 とか {言|い}わない から ね 。|| Lamp-lighting time's the same every day. Nobody ever says "earlier today", or "later".

@scene lf.nagi_after
lf_nagi[laugh]: {聞|き}いて よ ！ さっそく 「{魚|さかな} {通|どお}り」 か 「{運河|うんが} {通|どお}り」 か で 、{大|おお}げんか だ よ 。|| Listen to this! Straight away there's a huge row over whether it's "Fish Street" or "Canal Street".
lf_nagi: {両方|りょうほう} {書|か}いて やった 。{笠|かさ} が {狭|せま}い けど ね 。|| I wrote both. The shade's a bit cramped.

@scene lf.nagi_post
lf_nagi: {通|とお}り の {名前|なまえ} 、{全部|ぜんぶ} {戻|もど}った よ 。{三|みっ}つ も {名前|なまえ} が ある {通|とお}り も ある けど 。|| All the street names are back. Some streets have three names now.
?(end_archive_library) lf_nagi: {山|やま} の {書庫|しょこ} から 、{昔|むかし} の {地図|ちず} の {写|うつ}し を {借|か}りた の 。{誰|だれ} でも {借|か}りられる んだって 。|| I borrowed a copy of an old map from the Archive up the mountain. Anyone can borrow them now, apparently.
?(end_archive_closed) lf_nagi: {山|やま} の {書庫|しょこ} は {閉|と}じた って 。{名前|なまえ} は 、{町|まち} の {人|ひと} が {覚|おぼ}えて おけば いい よね 。|| They say the Archive is closed now. Well — the town can remember its own names.

@scene lf.kei
!faceplayer lf_kei
lf_kei: だれ ？ {旅|たび} の {人|ひと} ？|| Who're you? Travellers?
pc: こんにちは 。{少|すこ}し {話|はなし} を {聞|き}いて も いい ?|| Hello. Can I ask you a few things?
lf_kei[smirk]: いや ！|| No!
narr: {町|まち} に {来|き}て {初|はじ}めて {聞|き}いた 「いや」 だった 。|| It is the first "no" you have heard since coming to town.
lf_kei[laugh]: うそ 。いい よ 。{大人|おとな} は みんな 「もちろん」 しか {言|い}わない から 、つまんない の 。|| Just kidding. Okay. The grown-ups only ever say "of course". It's boring.
lf_kei: {夜|よる} に なる と ね 、{運河|うんが} の {格子|こうし} が {歌|うた} を うたう の 。「いや 、いや 」 って 、{上|うえ} の ほう へ {行|い}っちゃう の 。|| At night, the grates by the canal sing. "No, no," they go, and it all goes off upwards.
?(comp=nao) comp: {子供|こども} の ほう が 、よっぽど {話|はなし} が {通|つう}じる 。|| The kid's easier to talk to than any adult here.
?(comp=mio) comp[smile]: {教|おし}えて くれて 、ありがとう 。{格子|こうし} の {近|ちか}く で {遊|あそ}ぶ とき は 、{気|き} を つけて ね 。|| Thank you for telling us. Be careful playing near those grates, all right?
?(comp=mio) lf_kei: いや ！|| No!
?(comp=ren) comp: {格子|こうし} が {歌|うた} を …… 。{貴重|きちょう} な {証言|しょうげん} です 。|| The grates sing… A valuable piece of testimony.
?(comp=suzu) comp[laugh]: いい 「いや」 ね ！ {舞台|ぶたい} で も {通|とお}る {声|こえ} だ わ 。|| What a good "no"! That voice would carry to the back of any theatre.

@scene lf.kei_after
lf_kei[angry]: みんな 「いや」 って {言|い}う よう に なっちゃった 。もう {特別|とくべつ} じゃ ない 。|| Now everybody says "no". It's not special any more.
lf_kei[smirk]: でも いい や 。お{母|かあ}さん と {通|とお}り の {名前|なまえ} で けんか する の 、{楽|たの}しい から 。|| Oh well. Arguing about street names with Mum is fun.

@scene lf.kei_post
lf_kei: ねえ ！ {今|いま} は 「いや」 の {上手|じょうず} な {言|い}い{方|かた} を {練習|れんしゅう} してる の 。「{遠慮|えんりょ} して おきます」 ！|| Hey! I'm practising fancy ways to say no now. "I think I'll refrain"!
lf_kei[laugh]: お{母|かあ}さん に {言|い}ったら 、{笑|わら}われた 。|| When I said it to Mum, she laughed at me.

# ---- the gardener ---------------------------------------------------------------------------------------------------------
@scene lf.shu
!faceplayer lf_shu
lf_shu: …… シュウ 。{庭師|にわし} 。|| …Shū. Gardener.
lf_shu[think]: {議会|ぎかい} は 「{丸|まる}く {刈|か}れ」 と 「{四角|しかく}く {刈|か}れ」 を 、{同|おな}じ {日|ひ} に {決|き}めた 。|| The council decided "clip them round" and "clip them square" on the same day.
lf_shu: だから 、{朝|あさ} {丸|まる}く 、{昼|ひる} {四角|しかく}く 、{夕方|ゆうがた} また {丸|まる}く 。…… {木|き} が {弱|よわ}って いる 。|| So: round in the morning, square at noon, round again in the evening. …The trees are weakening.
pc: 「やめたい」 と {言|い}えば ?|| What if you said you wanted to stop?
lf_shu: …… かしこまりました 。|| …Certainly.
narr: シュウ は {鋏|はさみ} を {持|も}った まま 、{少|すこ}し だけ {悲|かな}しそう な {顔|かお} を した 。|| Shū stands holding the shears, looking a little sad.
?(comp=mio) comp[worry]: {葉|は} の {色|いろ} が {悪|わる}い 。{刈|か}り すぎ …… 。{植物|しょくぶつ} に も 、{休|やす}み が {要|い}る のに 。|| The leaves are a bad colour. Over-pruned… Plants need rest too.

@scene lf.shu_after
lf_shu[smile]: {議会|ぎかい} に 「{反対|はんたい}」 と {書|か}いて {出|だ}した 。{生|う}まれて {初|はじ}めて だ 。|| I submitted an "objection" to the council. First time in my life.
lf_shu: {今年|ことし} は 、{刈|か}らない 。{木|き} が {好|す}きな {形|かたち} に {伸|の}びる の を {見|み}る 。|| This year I'm not clipping them. I'm going to watch the trees grow into whatever shape they like.

@scene lf.shu_post
lf_shu: {庭|にわ} を {見|み}て くれ 。{丸|まる} も {四角|しかく} も 、ぼさぼさ も ある 。|| Look at the garden. Round ones, square ones, scruffy ones.
lf_shu[smile]: …… {悪|わる}く ない だろう 。|| …Not bad, is it.

# ---- the inn -----------------------------------------------------------------------------------------------------------------
@scene lf.setsu
lf_setsu[smile]: {灯|あか}り{宿|やど} へ ようこそ 。…… {満室|まんしつ} です が 、もちろん お{泊|と}め します よ 。|| Welcome to the Lamplit Inn. …We're full, but of course we'll put you up.
narr: {廊下|ろうか} に まで 、{布団|ふとん} が {並|なら}んで いる 。{誰|だれ} も 「{満室|まんしつ} です」 と {断|ことわ}れない の だ 。|| There are futons laid out even in the corridor. Nobody can say "we're full".
lf_setsu[tired]: {部屋|へや} の {数|かず} の {三倍|さんばい} 、お{客|きゃく}さま が いらっしゃる んです 。ふふ 、{嬉|うれ}しい です わ 。|| Three times as many guests as rooms. Heh. It's a pleasure.
!choice
* {休|やす}ませて ください || We'd like to rest. -> rest
* {大丈夫|だいじょうぶ} です || We're all right. -> end
:rest
lf_setsu: かしこまりました 。{窓際|まどぎわ} の {布団|ふとん} を どうぞ 。|| Certainly. Take the futons by the window.
!inn
narr: {廊下|ろうか} で {誰|だれ} か が いびき を かいて いた が 、よく {眠|ねむ}れた 。|| Someone snored in the corridor all night, but you slept well.

@scene lf.setsu_after
lf_setsu[laugh]: {聞|き}いて ください ！ 「{満室|まんしつ} です 」 って 、{今朝|けさ} {三回|さんかい} も {言|い}えた んです よ ！|| Listen! I managed to say "we're full" three times this morning!
lf_setsu: {廊下|ろうか} の {皆|みな}さま に は 、{隣|となり} の {宿|やど} を ご{紹介|しょうかい} しました 。お{客|きゃく}さま は {特別|とくべつ} です から 、{窓際|まどぎわ} を どうぞ 。|| The guests in the corridor, I've sent next door. You're special, so the window spot is yours.
!choice
* {休|やす}ませて ください || We'd like to rest. -> rest
* また {来|き}ます || Another time. -> end
:rest
!inn
narr: {今度|こんど} は 、{廊下|ろうか} も {静|しず}か だった 。|| This time the corridor is quiet too.

@scene lf.setsu_post
lf_setsu: いらっしゃいませ 。{今日|きょう} は …… {空|あ}いて おります よ 。{本当|ほんとう} に 。|| Welcome. Today we… have rooms free. Truly.
?(end_kasane_trial) lf_setsu: カサネ さん が {町|まち} に {下|お}りて きた とき 、うち に {泊|と}まった んです 。{朝|あさ} {早|はや}く {起|お}きて 、{黙|だま}って {廊下|ろうか} を {拭|ふ}いて いました 。|| When Kasane came down to the town, they stayed here. Got up early and wiped the corridor without a word.
?(end_kasane_keeper) lf_setsu: {山|やま} の {上|うえ} の {方|かた} に 、{時々|ときどき} お{弁当|べんとう} を {届|とど}けて います 。「{要|い}りません」 と {返事|へんじ} が {来|く}る ので 、また {送|おく}ります 。|| I send the one up the mountain a lunchbox now and then. They write back "not necessary", so I send another.
!choice
* {休|やす}ませて ください || We'd like to rest. -> rest
* また {来|き}ます || Another time. -> end
:rest
!inn

@scene lf.inn_bed
narr: {糊|のり} の きいた {布団|ふとん} 。{枕|まくら} の {上|うえ} に 、{宿|やど} の {心得|こころえ} が {置|お}いて ある 。「お{客|きゃく}さま の ご{要望|ようぼう} は 、すべて {承|うけたまわ}ります 。」|| A crisply starched futon. On the pillow, the inn's house rules: "All guest requests will be accommodated."

@scene lf.inn_table
narr: {相席|あいせき} の {旅人|たびびと} が 、{黙|だま}って {冷|さ}めた お{茶|ちゃ} を {飲|の}んで いる 。|| A traveller sharing the table sips cold tea in silence.
!if lf_bell_rung -> after
narr: 「お{茶|ちゃ} 、{冷|さ}めて ます ね 」 と {言|い}う と 、「もちろん です 」 と {笑|わら}った 。|| When you say, "Your tea's gone cold," they smile: "Of course."
!end
:after
narr: {今日|きょう} は 、{旅人|たびびと} が {女将|おかみ} に 「お{茶|ちゃ} 、{熱|あつ}い の に {替|か}えて ！」 と {言|い}って いる 。{女将|おかみ} は 「{自分|じぶん} で どうぞ ！」 と {笑|わら}った 。|| Today the traveller is telling the innkeeper, "Swap this for a hot one!" and she laughs back, "Help yourself!"

@scene lf.inn_hall
!if lf_bell_rung -> after
narr: {廊下|ろうか} に {敷|し}かれた {布団|ふとん} 。{知|し}らない {人|ひと} が 、{知|し}らない {人|ひと} の {足|あし} を {枕|まくら} に して {寝|ね}て いる 。|| Futons laid in the corridor. Strangers sleeping with their heads on other strangers' feet.
!end
:after
narr: {廊下|ろうか} は {片付|かたづ}いて いる 。{床|ゆか} に {一枚|いちまい} 、「{本日|ほんじつ} {満室|まんしつ}」 の {札|ふだ} が {誇|ほこ}らしげ に {貼|は}って ある 。|| The corridor has been cleared. A "Full tonight" sign is proudly pinned to the floor.

# ---- the café that cannot refuse ------------------------------------------------------------------------------------------
@scene lf.ritsu
lf_ritsu[smile]: いらっしゃいませ 。リツ の {喫茶|きっさ} へ ようこそ 。|| Welcome to Ritsu's café.
!if seen.lf.ritsu -> menu
lf_ritsu[tired]: …… {実|じつ} は 、お{客|きゃく}さま が メニュー に ない もの を {頼|たの}まれて も 、{断|ことわ}れない んです 。|| …The truth is, when customers order things that aren't on the menu, I can't refuse.
lf_ritsu: {昨日|きのう} は 「{虹色|にじいろ} の お{茶|ちゃ}」 。{一昨日|おととい} は 「{空|そら} を {飛|と}ぶ {団子|だんご}」 。…… かしこまりました 、と {申|もう}し{上|あ}げて しまって 。|| Yesterday it was "rainbow-coloured tea". The day before, "dango that fly". …And I heard myself say "certainly".
?(comp=suzu) comp[think]: で 、{飛|と}んだ の ? {団子|だんご} 。|| And? Did they fly? The dango?
?(comp=suzu) lf_ritsu[sad]: {投|な}げました 。|| I threw them.
lf_ritsu: お{手伝|てつだ}い いただけません か 。{注文|ちゅうもん} を {聞|き}いて 、お{盆|ぼん} に {載|の}せて いただく だけ で …… 。|| Could you possibly help? Just listen to the orders and put things on the tray…
:menu
!choice
* {注文|ちゅうもん} を {手伝|てつだ}う || Help with the orders -> help
* また {今度|こんど} || Another time -> end
:help
!activity lf.cafe_orders
!if var._res=0 -> end
!set lf_cafe_done
lf_ritsu[smile]: …… {最後|さいご} の お{客|きゃく}さま 、カレー は 「ない」 と 、ちゃんと {伝|つた}わりました ね 。|| …That last customer — you got across that we don't have curry.
lf_ritsu: {空|から} の お{盆|ぼん} で 「いいえ」 を {言|い}う なんて 。{私|わたし} に は {思|おも}い つきません でした 。|| Saying "no" with an empty tray. It would never have occurred to me.
lf_ritsu: どうぞ 、{何|なに} か {召|め}し{上|あ}がって ください 。{今日|きょう} は お{代|だい} は {結構|けっこう} です 。|| Please, have something. No charge today.
?(comp=suzu) comp[smirk]: {結構|けっこう} です 、の {正|ただ}しい {使|つか}い{方|かた} ね 。{帳簿|ちょうぼ} に は {書|か}いて おいて よ 。|| That's the proper use of けっこうです. Do write it in the accounts, though.

@scene lf.ritsu_after
lf_ritsu[laugh]: {本日|ほんじつ} 、「{虹色|にじいろ} の お{茶|ちゃ}」 は ございません ！ …… {言|い}えました ！|| We have no "rainbow tea" today! …I said it!
lf_ritsu: {断|ことわ}れる と 、{不思議|ふしぎ} と {作|つく}りたい もの が {作|つく}れる んです 。{新作|しんさく} の {柚子|ゆず} {大福|だいふく} 、いかが です か 。|| Funny — once I can say no, I can make the things I actually want to. Our new yuzu daifuku, perhaps?
!choice
* {注文|ちゅうもん} を {手伝|てつだ}う || Help with the orders -> help
* また {今度|こんど} || Another time -> end
:help
!activity lf.cafe_orders

@scene lf.ritsu_post
lf_ritsu: いらっしゃいませ 。…… あ 、あなた でした か 。|| Welcome. …Oh, it's you.
lf_ritsu[smile]: メニュー に {一行|いちぎょう} {足|た}しました 。「カレー 、ございません 」 。{皆|みな}さん 、{笑|わら}って くださいます 。|| I added a line to the menu: "No curry." Everyone laughs.
!choice
* {注文|ちゅうもん} を {手伝|てつだ}う || Help with the orders -> help
* また {来|き}ます || Another time -> end
:help
!activity lf.cafe_orders

@scene lf.cafe_table
narr: {窓際|まどぎわ} の {小|ちい}さな {卓|たく} 。{誰|だれ} か が {置|お}いて いった {皿|さら} に 、{黒|くろ}こげ の {団子|だんご} が {一|ひと}つ 。|| A little table by the window. On a plate someone left behind: one burnt dango.
?(comp=nao) comp: …… {飛|と}ぶ {団子|だんご} の {失敗作|しっぱいさく} か な 。|| …A failed flying dango, maybe.

@scene lf.cafe_menu
narr: 「お{品書|しなが}き ： お{茶|ちゃ} 、ほうじ{茶|ちゃ} 、{甘酒|あまざけ} 、{団子|だんご} 、{大福|だいふく} 、せんべい 」 。|| "Menu: green tea, roasted tea, amazake, dango, daifuku, rice crackers."
?(!lf_bell_rung) narr: {下|した} に {小|ちい}さく ： 「{他|ほか} の ご{注文|ちゅうもん} も 、もちろん {承|うけたまわ}ります 。」|| And underneath, small: "Other orders, of course, also accepted."
?(lf_bell_rung) narr: {下|した} の {一行|いちぎょう} は 、{線|せん} で {消|け}されて いる 。|| The line underneath has been crossed out.

# ---- the baker who cannot refuse an order ----------------------------------------------------------------------------------
@scene lf.masaru
lf_masaru[laugh]: いらっしゃい ！ パン {屋|や} の マサル だ よ ！|| Welcome! Masaru the baker, that's me!
narr: {頭|あたま} から {足|あし} まで 、{粉|こな} で まっ{白|しろ} だ 。{目|め} の {下|した} に 、{黒|くろ}い くま が ある 。|| He is white with flour from head to toe, with dark rings under his eyes.
lf_masaru: {記録館|きろくかん} から {丸|まる}パン {三百個|さんびゃっこ} 。{猫|ねこ} の {形|かたち} の パン を {一|ひと}つ 。それ から 、「{昨日|きのう} まで に 」 って {注文|ちゅうもん} が {一|ひと}つ 。|| Three hundred rolls for the Records Hall. One cat-shaped loaf. And one order "for yesterday".
pc: {昨日|きのう} まで に は 、{無理|むり} でしょう 。|| You can't do anything by yesterday, surely.
lf_masaru[smile]: もちろん です ！|| Of course!
narr: {彼|かれ} は {明|あか}るく うなずき 、また {生地|きじ} を {捏|こ}ね{始|はじ}めた 。|| He nods cheerfully and goes back to kneading.
?(comp=nao) comp: …… この {人|ひと} 、{寝|ね}て ない よね 。|| …This guy hasn't slept, has he.
?(comp=mio) comp[worry]: {手|て} に やけど が ある 。{薬|くすり} 、{置|お}いて いきます ね 。…… {断|ことわ}らないで 、って {言|い}う まで も ない か 。|| He's got burns on his hands. I'll leave some ointment. …No need to tell him not to refuse it, I suppose.
?(comp=ren) comp: {昨日|きのう} まで の {注文|ちゅうもん} は 、{時|とき} を {戻|もど}す {灯|あか}り で も ない と {無理|むり} です ね 。{灯守|ひもり} に も {無理|むり} です 。|| An order due yesterday would need a lantern that turns back time. Even lantern keepers can't manage that.
?(comp=suzu) comp: {三百個|さんびゃっこ} 、{一個|いっこ} いくら ? …… え 、{値段|ねだん} も {決|き}めて ない の ?|| Three hundred — at how much each? …Wait, you haven't even set a price?

@scene lf.masaru_after
lf_masaru[angry]: {無理|むり} です ！ {三百個|さんびゃっこ} なんて {焼|や}けません ！ …… って 、{言|い}って やった よ ！|| "I can't! I can't bake three hundred!" …That's what I told them!
lf_masaru[laugh]: {記録館|きろくかん} の {人|ひと} 、{少|すこ}し {驚|おどろ}いて から 、「では {五十個|ごじゅっこ} で 」 だって 。{最初|さいしょ} から そう {言|い}え っての ！|| The Records Hall fellow looked startled, then said "fifty, then". Should've said so in the first place!
lf_masaru: {猫|ねこ} の パン は 、ケイ ちゃん の ため に {焼|や}く 。{頼|たの}まれた から じゃ ない 。{焼|や}きたい から だ 。|| The cat loaf I'm baking for little Kei. Not because I was asked. Because I want to.

@scene lf.masaru_post
lf_masaru: よう ！ {今日|きょう} は {三|みっ}つ {注文|ちゅうもん} を {断|ことわ}って 、{二|ふた}つ {新|あたら}しい パン を {考|かんが}えた 。|| Hey there! Today I turned down three orders and came up with two new breads.
?(end_kasane_trial) lf_masaru: カサネ って {人|ひと} が パン を {買|か}い に {来|き}た 。{最初|さいしょ} は {売|う}らない って {言|い}った 。…… {結局|けっきょく} 、{売|う}った けど な 。|| That Kasane came to buy bread. I told them I wouldn't sell it. …Sold it in the end, mind.
?(!end_kasane_trial) lf_masaru[laugh]: {断|ことわ}る と 、{腹|はら} が {減|へ}る ね 。{言|い}い{争|あらそ}い は {体力|たいりょく} が いる ！|| Refusing people makes you hungry. Arguing takes stamina!

@scene lf.bakery_orders
narr: {注文書|ちゅうもんしょ} の {束|たば} 。どれ に も 「{承知|しょうち}」 の {印|しるし} 。{一番|いちばん} {上|うえ} の {紙|かみ} は 、{小|ちい}さな {子|こ} の {字|じ} で 「ねこ の パン」 。|| A stack of order slips, every one marked "accepted". The top slip, in a small child's hand: "cat bread".
?(lf_bell_rung) narr: {半分|はんぶん} {以上|いじょう} に 、{大|おお}きく 「{却下|きゃっか}」 と {書|か}き{足|た}されて いる 。{字|じ} が 、{嬉|うれ}しそう に {踊|おど}って いる 。|| More than half now have "REJECTED" added in big letters. The writing looks like it's dancing.

# ---- garden things ---------------------------------------------------------------------------------------------------------------
@scene lf.garden_statue
narr: {鶴|つる} の {形|かたち} に {刈|か}られる はず だった {植木|うえき} 。{今|いま} は {丸|まる} と {四角|しかく} の {間|あいだ} で 、{困|こま}った {形|かたち} を して いる 。|| A shrub that was supposed to be clipped into a crane. It's now caught somewhere between round and square, looking awkward.

@scene lf.garden_shrine
narr: {小|ちい}さな {祠|ほこら} 。{供|そな}え{物|もの} の {札|ふだ} に は 、{細|ほそ}い {字|じ} で 「{水|みず} の {事故|じこ} が ありません よう に 」 。|| A small wayside shrine. On the offering tag, in fine writing: "May there be no accidents on the water."
narr: {日付|ひづけ} は {三十年前|さんじゅうねんまえ} の {六月|ろくがつ} 。|| It is dated June, thirty years ago.

@scene lf.persimmon
narr: {古|ふる}い {柿|かき} の {木|き} 。{枝|えだ} は {両方|りょうほう} の {庭|にわ} に {張|は}り{出|だ}して いる 。|| An old persimmon tree. Its branches reach out over both gardens.
?(quest.lf_fence=done) narr: {幹|みき} に {縄|なわ} が {一本|いっぽん} 、{真|ま}ん{中|なか} に {巻|ま}いて ある 。{境|さかい} の {印|しるし} だ 。{実|み} は 、{両側|りょうがわ} に {同|おな}じ くらい なって いる 。|| A single rope is tied round the middle of the trunk: the boundary mark. The fruit hangs about evenly on both sides.

@scene lf.fence_holes
narr: {地面|じめん} に 、{杭|くい} を {抜|ぬ}いた {穴|あな} が {並|なら}んで いる 。{毎朝|まいあさ} 、{垣根|かきね} が {少|すこ}し ずつ {動|うご}いて きた {跡|あと} だ 。|| A row of holes where fence posts were pulled up: the trail of a fence that has moved a little every morning.

@scene lf.fence_bench
narr: {柿|かき} の {木|き} の {下|した} の {長椅子|ながいす} 。{片側|かたがわ} に 「コウヘイ」 、もう {片側|かたがわ} に 「キヌ」 と {彫|ほ}って ある 。{真|ま}ん{中|なか} は 、{空|あ}いて いる 。|| A bench under the persimmon. One end is carved "Kōhei", the other "Kinu". The middle is left empty.

# ---- the sluice shore -------------------------------------------------------------------------------------------------------------
@scene lf.sluice_gate
narr: {古|ふる}い {水門|すいもん} 。{板|いた} が {何枚|なんまい} も {重|かさ}なって 、{湖|みずうみ} の {出口|でぐち} を {塞|ふさ}いで いる 。|| The old sluice gate. Board upon board, stacked to close off the lake's outlet.
narr: {柱|はしら} に {刻|きざ}まれた {線|せん} 。「{三十年前|さんじゅうねんまえ} の {水位|すいい}」 。{自分|じぶん} の {頭|あたま} より {高|たか}い 。|| A line cut into the post: "Water level, thirty years ago." It is higher than your head.

@scene lf.sluice_wheel
narr: {水門|すいもん} を {上|あ}げ{下|さ}げ する {車輪|しゃりん} 。{錆|さび} で {固|かた}まって いる 。|| The wheel that raises and lowers the gate. Rusted solid.
?(lf_tokuji_told) narr: {車輪|しゃりん} の {軸|じく} に 、{新|あたら}しい {油|あぶら} が {差|さ}して ある 。トクジ が {毎日|まいにち} {差|さ}して いた らしい 。{回|まわ}す こと は なかった のに 。|| The axle has fresh oil on it. Tokuji seems to have oiled it every day. Without ever turning it.

@scene lf.memorial
narr: {慰霊|いれい} の {碑|ひ} 。「{六月|ろくがつ} の {水|みず} に {逝|ゆ}きし {人々|ひとびと}」 。|| A memorial stone. "For those who were taken by the June waters."
narr: {名前|なまえ} が {刻|きざ}んで ある はず の {面|めん} は 、つるつる だ 。{最後|さいご} に {一|ひと}つ だけ 、{指|ゆび} で なぞった よう に {浅|あさ}く 「トウヤ」 。|| The face where the names should be is smooth. Only one remains at the end, shallow, as if traced by a finger: "Tōya".
?(lf_bell_rung) narr: {今|いま} は 、{名前|なまえ} が {全部|ぜんぶ} {戻|もど}って いる 。{十二人|じゅうににん} 。{一番|いちばん} {最後|さいご} に 、「{使|つか}い トウヤ （ {十七|じゅうなな} ）」 。|| Now all the names are back. Twelve. The last one: "Tōya, messenger (17)."
?(comp=nao) comp: …… {十七|じゅうなな} か 。|| …Seventeen, huh.
?(comp=mio) comp[sad]: {花|はな} 、{替|か}えて おく ね 。|| I'll change the flowers.
?(comp=ren) comp[closed]: …… {名前|なまえ} が {消|き}える こと を 、{誰|だれ} か が {望|のぞ}んだ の でしょう か 。|| …Did someone actually wish for these names to disappear?
?(comp=suzu) comp[sad]: {拍手|はくしゅ} も {野次|やじ} も 、ここ で は {要|い}らない ね 。|| No applause or heckling needed here.

@scene lf.drowned_lamp
narr: {浅瀬|あさせ} に {沈|しず}んだ {灯籠|とうろう} 。{笠|かさ} に 、{泥|どろ} を かぶった {字|じ} が {見|み}える 。「{下町|したまち} {一丁目|いっちょうめ}」 。|| A lantern sunk in the shallows. Under the mud on its shade, writing: "Lower Town, 1st Block."
narr: ここ は 、{昔|むかし} 、{通|とお}り だった の だ 。|| This used to be a street.

@scene lf.tower_view
narr: {湖|みずうみ} の {中|なか} の {鐘楼|しょうろう} 。{屋根|やね} の {下|した} の {石|いし} に 、{字|じ} が {彫|ほ}って ある 。「{灯落|ひおち} {警鐘|けいしょう}」 。|| The bell tower in the lake. Carved into the stone under its roof: "Lanternfall Warning Bell".
!if lf_bell_rung -> rung
narr: {窓|まど} の {奥|おく} に 、{緑|みどり} に くすんだ {大|おお}きな {鐘|かね} が {見|み}える 。{鳴|な}らない よう に 、{管|くだ} が {巻|ま}きついて いる 。|| Behind the arch you can make out a great bell gone green, with pipes wound round it so it cannot swing.
!end
:rung
narr: {鐘|かね} は 、{金色|きんいろ} に {光|ひか}って いる 。{風|かぜ} が {吹|ふ}く と 、ほんの {少|すこ}し {鳴|な}る 。|| The bell shines gold now. When the wind blows, it hums, just a little.

@scene lf.tokuji_table
narr: {小|ちい}さな {卓|たく} に 、{湯飲|ゆの}み が {二|ふた}つ 。{一|ひと}つ は {伏|ふ}せて ある 。|| Two teacups on the little table. One of them is upside down.

@scene lf.tokuji_shelf
narr: {棚|たな} に 、{水門|すいもん} の {番|ばん} の {日誌|にっし} が {三十冊|さんじゅっさつ} 。{毎日|まいにち} 、{同|おな}じ {一行|いちぎょう} 。「{水位|すいい} {異常|いじょう} なし 。{鐘|かね} 、{鳴|な}らず 。」|| Thirty volumes of the gatekeeper's log on the shelf. Every day, the same line. "Water level normal. Bell did not ring."
?(lf_bell_rung) narr: {最新|さいしん} の {頁|ページ} 。「{鐘|かね} 、{鳴|な}る 。」 {字|じ} が {震|ふる}えて いる 。|| The newest page: "Bell rang." The writing trembles.

@scene lf.mailsacks
narr: {郵便|ゆうびん} の {袋|ふくろ} 。{舟|ふね} で {東岸|ひがしぎし} へ {運|はこ}ぶ {手紙|てがみ} だ 。{一番|いちばん} {上|うえ} の {封筒|ふうとう} の {字|じ} は 、ひどく {急|いそ}いで いる 。|| Mail sacks, for the boat to the east shore. The top envelope is addressed in a terrible hurry.
?(comp=nao) comp[smile]: …… {急|いそ}いで {書|か}いた {宛名|あてな} って 、いい よね 。{会|あ}いたい の が {字|じ} に {出|で}てる 。|| …Addresses written in a hurry are the best. You can see how much they want to see someone.

# ---- records and offices: small things -------------------------------------------------------------------------------------------
@scene lf.records_notice
narr: {記録館|きろくかん} の {掲示|けいじ} 。「{本館|ほんかん} の {記録|きろく} は 、{穏|おだ}やか に {整|ととの}えられて おります 。」|| A notice in the Records Hall. "The records of this Hall have been kept calm and orderly."
narr: {下|した} に 、{小|ちい}さな {字|じ} で {日付|ひづけ} 。{先月|せんげつ} から 、{毎週|まいしゅう} {書|か}き{直|なお}されて いる 。|| Underneath, small dates. It has been rewritten every week since last month.

@scene lf.records_counter
narr: {窓口|まどぐち} の {台|だい} 。{判子|はんこ} が {二|ふた}つ {並|なら}んで いる 。「{承認|しょうにん}」 と 、「{承認|しょうにん}」 。|| The counter. Two stamps side by side: "Approved" and "Approved".
?(lf_bell_rung) narr: {三|みっ}つ {目|め} の {判子|はんこ} が {増|ふ}えて いる 。{真新|まあたら}しい 「{却下|きゃっか}」 。|| A third stamp has appeared. A brand-new "Rejected".

@scene lf.clerk_desk
narr: {誰|だれ} か の {机|つくえ} 。{写|うつ}し{直|なお}し の {台帳|だいちょう} が {積|つ}んで ある 。{元|もと} の {台帳|だいちょう} は 、{横|よこ} の {箱|はこ} に 「{廃棄|はいき}」 と {書|か}かれて {入|い}って いる 。|| Someone's desk, piled with recopied ledgers. The originals are in a box beside it marked "for disposal".
?(lf_bell_rung) narr: 「{廃棄|はいき}」 の {字|じ} に {線|せん} が {引|ひ}かれ 、「{保存|ほぞん}」 と {書|か}き{直|なお}して ある 。|| "For disposal" has been struck through and rewritten: "Keep".

@scene lf.returned_letters
narr: {戻|もど}って きた {手紙|てがみ} の {箱|はこ} 。{上|うえ} の {数|すう}{通|つう} は 、{同|おな}じ {丁寧|ていねい} な {字|じ} 。{宛先|あてさき} は 「{雪鈴|ゆきすず}」 。|| A box of returned letters. The top few are in the same careful hand, addressed to "Snowbell".
narr: どれ に も 「{宛先|あてさき}{不明|ふめい}」 の {判子|はんこ} 。|| Every one is stamped "address unknown".
?(lf_bell_rung) narr: {箱|はこ} は {空|から} に なって いる 。|| The box is empty now.

@scene lf.akari_note
narr: アカリ の {机|つくえ} の {上|うえ} に 、{札|ふだ} が {立|た}てて ある 。|| On Akari's desk, a card is propped up.
narr: 「{雪鈴|ゆきすず} に {帰省|きせい} {中|ちゅう} 。{残業|ざんぎょう} は お{断|ことわ}り します 。アカリ」|| "Home in Snowbell on leave. Overtime: declined. — Akari"

@scene lf.council_table
narr: {議会|ぎかい} の {大|おお}きな {卓|たく} 。{議決|ぎけつ} の {帳面|ちょうめん} が {開|ひら}いて いる 。{最近|さいきん} の {頁|ページ} は 、{全部|ぜんぶ} 「{全員|ぜんいん} {賛成|さんせい}」 。|| The council's great table. The book of resolutions lies open. Every recent page: "Unanimous."
?(lf_bell_rung) narr: {今日|きょう} の {頁|ページ} は 、{書|か}き{込|こ}み と {線|せん} と {矢印|やじるし} で 、{真|ま}っ{黒|くろ} だ 。|| Today's page is black with notes, crossings-out and arrows.

@scene lf.council_stamp
narr: {議長|ぎちょう} の {机|つくえ} 。{小|ちい}さな {鈴|すず} が {置|お}いて ある 。{会議|かいぎ} の {始|はじ}まり に {鳴|な}らす もの だ 。|| The chair's desk. A small handbell sits there, for opening meetings.
!if lf_bell_rung -> rung
narr: {舌|ぜつ} が {布|ぬの} で {巻|ま}かれて いる 。{鳴|な}らない よう に 。|| Its clapper has been wrapped in cloth, so that it will not ring.
!end
:rung
narr: {布|ぬの} は {外|はず}されて いる 。|| The cloth has been taken off.
`, 'ch5/town');
