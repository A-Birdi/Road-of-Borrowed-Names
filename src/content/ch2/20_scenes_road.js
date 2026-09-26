/* Chapter 2 scenes: arrival on the coast road, the fork lantern, the first
 * look at the harbour, the return from the archive and the chapter's end. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene sg.arrive
!set sg_arrived
!chapter 2
narr: {潮|しお} の {匂|にお}い が 、 {風|かぜ} に {混|ま}じって きた 。 || The smell of the sea has crept into the air.
!card {第二章|だいにしょう} ・ {潮硝子|しおがらす} || Chapter 2 — Saltglass
narr: {崖|がけ} の {下|した} に 、 {赤|あか}い {屋根|やね} と {桟橋|さんばし} が {並|なら}んで いる 。 {港町|みなとまち} 、 {潮硝子|しおがらす} だ 。 || Below the cliffs, red roofs and piers line the water: the harbour town of Saltglass.
?(comp=nao) comp[smirk]: {着|つ}いた 。 {予定|よてい} より {半日|はんにち} {早|はや}い 。 {誰|だれ} か さん が {寄|よ}り{道|みち} しなかった おかげ だ 。 || Here. Half a day ahead of schedule. Thanks to someone not taking detours.
?(comp=nao) pc: それ 、 {褒|ほ}めて る ？ || Is that a compliment?
?(comp=nao) comp: {事実|じじつ} を {言|い}った だけ 。 …… {右|みぎ} の {桟橋|さんばし} は {歩|ある}く な よ 。 {板|いた} が {腐|くさ}って る 。 || Just stating a fact. …Stay off the right-hand pier. The boards are rotten.
?(comp=nao) comp[think]: {手紙|てがみ} を {届|とど}けに 、 {何度|なんど} も {来|き}た {町|まち} だ 。 …… {届|とど}けなかった の も 、 {一通|いっつう} ある けど 。 || I've come here with letters more times than I can count. …There's one I didn't deliver, too.
?(comp=nao) comp[closed]: {今|いま} の は {聞|き}かなかった こと に しろ 。 || Forget I said that.
?(comp=mio) comp[smile]: わあ 、 {海|うみ} ！ …… {薬草|やくそう} の {匂|にお}い が しない {空気|くうき} 、 {久|ひさ}しぶり 。 || Oh — the sea! …It's been ages since I breathed air that didn't smell of herbs.
?(comp=mio) pc: {楽|たの}しそう だ ね 。 || You sound happy.
?(comp=mio) comp[shy]: {少|すこ}し だけ ね 。 {母|はは} が {潮硝子|しおがらす} の {干物|ひもの} を {好|す}き だった の 。 …… {仕事|しごと} で {来|き}た の は 、 {分|わ}かって る よ 。 || Just a little. My mother loved Saltglass dried fish. …I know we're here for work.
?(comp=mio) comp[think]: でも 、 {変|へん} ね 。 {港|みなと} なのに 、 {鳥|とり} の {声|こえ} しか {聞|き}こえない 。 || Strange, though. It's a harbour, and all I can hear are the birds.
?(comp=ren) comp: {潮硝子|しおがらす} 。 {灯|ひ} の {道|みち} の {記録|きろく} に よれば 、 {葦|あし}ノ{瀬|せ} から {二日|ふつか} 。 {予定|よてい} どおり です 。 || Saltglass. According to the lantern road records, two days from Reedwake. Right on schedule.
?(comp=ren) pc: {一回|いっかい} 、 {道|みち} を {間違|まちが}えた けど ね 。 || We did take one wrong turn.
?(comp=ren) comp[shy]: あれ は {景色|けしき} の いい {遠回|とおまわ}り です 。 …… {記録|きろく} に は {書|か}きません 。 || That was a scenic detour. …I won't be writing it in the records.
?(comp=ren) comp[think]: {港|みなと} の {灯|あか}り が {少|すく}ない 。 {昼|ひる} だ から …… なら 、 いい の です が 。 || Few lights down in the harbour. I hope that's only because it's daytime.
?(comp=suzu) comp[laugh]: さあさあ 、 お{立|た}ち{会|あ}い ！ {潮|しお} と ガラス の {町|まち} 、 {潮硝子|しおがらす} に ご{到着|とうちゃく} ！ || Roll up, roll up! Now arriving: the town of tide and glass, Saltglass!
?(comp=suzu) pc: {誰|だれ} に {言|い}って る の ？ || Who are you announcing to?
?(comp=suzu) comp[smirk]: カモメ に よ 。 {客|きゃく} は {選|えら}べない の 。 …… {前|まえ} に {来|き}た とき 、 {宿代|やどだい} が {銅貨|どうか} {三枚|さんまい} {足|た}りなくて ね 。 {今度|こんど} は ちゃんと {払|はら}う わ 。 || To the gulls. You can't choose your audience. …Last time I was here I was three coppers short on the inn bill. I'll pay properly this time.
?(comp=suzu) comp[think]: …… {変|へん} ね 。 {市場|いちば} の {声|こえ} が {聞|き}こえない 。 {港|みなと} は 、 もっと うるさい はず よ 。 || …Odd. I can't hear the market. A harbour ought to be noisier than this.
pc: {沈|しず}んだ {書庫|しょこ} の こと 、 {港|みなと} の {人|ひと} に {聞|き}いて みよう 。 || Let's ask the people in the harbour about the sunken archive.
narr: {道|みち} は ここ で {分|わ}かれて いる 。 {下|くだ}り{坂|ざか} は {港|みなと} へ 、 {北|きた} の {道|みち} は {内陸|ないりく} へ 。 || The road forks here: downhill to the harbour, and north, inland.
!quest sg_main start
!journal {沈|しず}んだ {書庫|しょこ} の {噂|うわさ} を {追|お}って 、 {潮硝子|しおがらす} へ 。 || Following the rumour of a sunken archive, down to Saltglass.
!autosave

@scene sg.road_forklantern
!if ch2_done -> fixed
narr: {分|わ}かれ{道|みち} の {灯籠|とうろう} だ 。 {火|ひ} は {消|き}えて いる 。 {笠|かさ} の {字|じ} が 、 {見|み}る たび に {変|か}わる 。 || The lantern at the fork. Its flame is out, and the name on the shade changes every time you look.
narr: 「{灰実|はいみ} の {里|さと}」 …… と {思|おも}えば 「{潮硝子|しおがらす}」 。 また 「{灰実|はいみ} の {里|さと}」 。 || "Cinder Orchard"… then "Saltglass". Then "Cinder Orchard" again.
?(comp=ren) comp[worry]: {一|ひと}つ の {笠|かさ} に 、 {二|ふた}つ の {名前|なまえ} 。 これ では 、 {道|みち} は どちら へ {続|つづ}く か {決|き}められません 。 || Two names on one shade. The road can't decide which way it leads.
?(comp=nao) comp: {宛先|あてさき} が {二|ふた}つ ある {荷物|にもつ} みたい だ 。 どっち に も {届|とど}かない やつ 。 || Like a parcel with two addresses. The kind that never reaches either.
?(comp=mio) comp[worry]: {目|め} が {回|まわ}り そう 。 …… あまり {見|み}ない ほう が いい かも 。 || It makes me dizzy. …Maybe better not to stare.
?(comp=suzu) comp[smirk]: {早変|はやが}わり の {芸|げい} なら {負|ま}けない けど 、 この {灯籠|とうろう} に は {負|ま}ける わ 。 || I'm good at quick changes, but I concede to this lantern.
!end
:fixed
narr: {灯籠|とうろう} に {火|ひ} が {入|はい}って いる 。 {笠|かさ} に は 、 {落|お}ち{着|つ}いた {字|じ} で 「{灰実|はいみ} の {里|さと}」 。 || The lantern is lit. Its shade reads, in steady letters, "Cinder Orchard".

@scene sg.road_sign
!if ch2_done -> open
narr: {道標|みちしるべ} だ 。 「↓ {潮硝子|しおがらす} {港|みなと}」 「→ {葦|あし}ノ{瀬|せ}」 「↑ ……」 。 || A signpost. "↓ Saltglass harbour", "→ Reedwake", "↑ …"
narr: {北|きた} を {指|さ}す {板|いた} だけ 、 {字|じ} が {波|なみ} の よう に {揺|ゆ}れて {読|よ}めない 。 || Only the arm pointing north is unreadable; its letters ripple like water.
!end
:open
narr: {道標|みちしるべ} だ 。 「↓ {潮硝子|しおがらす} {港|みなと}」 「→ {葦|あし}ノ{瀬|せ}」 「↑ {灰実|はいみ} の {里|さと}」 。 || A signpost. "↓ Saltglass harbour", "→ Reedwake", "↑ Cinder Orchard".

@scene sg.road_marker
narr: {苔|こけ} むした {石|いし} の {道標|みちしるべ} 。 「{右|みぎ} {葦|あし}ノ{瀬|せ} {道|みち} 　 {左|ひだり} {潮硝子|しおがらす} {道|みち}」 。 || A mossy stone marker: "Right: the Reedwake road. Left: the Saltglass road."
?(comp=ren) comp: {古|ふる}い {形|かたち} の {道標|みちしるべ} です 。 {石|いし} に {彫|ほ}った {字|じ} は 、 {紙|かみ} より ずっと {長|なが}く {残|のこ}ります 。 || An old-style marker. Letters cut in stone last far longer than paper.

@scene sg.road_bench
narr: {崖|がけ} の {上|うえ} の {古|ふる}い ベンチ 。 {港|みなと} と 、 {沖|おき} の {小島|こじま} が よく {見|み}える 。 || An old bench at the cliff edge. From here you can see the whole harbour, and the little island offshore.
narr: {島|しま} の {周|まわ}り だけ 、 {海|うみ} の {色|いろ} が {少|すこ}し {暗|くら}い 。 || Only around the island is the sea a shade darker.
?(comp=mio) comp[smile]: ここ で お{弁当|べんとう} を {食|た}べたら 、 おいしい だろう ね 。 || Lunch would taste good up here.
?(comp=nao) comp: {配達|はいたつ} の {帰|かえ}り に 、 よく ここ で {休|やす}んだ 。 {誰|だれ} に も {言|い}って ない けど 。 || I used to rest here on the way back from deliveries. Never told anyone.
?(comp=ren) comp: {灯|ひ} の {道|みち} の ベンチ は 、 {昔|むかし} の {灯守|ひもり} が {置|お}いた もの が {多|おお}い そう です 。 {旅人|たびびと} に {景色|けしき} を {見|み}せる ため に 。 || They say many benches on the lantern roads were placed by keepers long ago — to show travellers the view.
?(comp=suzu) comp[closed]: …… {少|すこ}し だけ 、 {座|すわ}って いこう か 。 {幕|まく} が {上|あ}がる {前|まえ} の 、 {深呼吸|しんこきゅう} 。 || …Let's sit a moment. A deep breath before the curtain goes up.

@scene sg.road_inland_closed
narr: {北|きた} の {道|みち} を {歩|ある}き{出|だ}す 。 …… {気|き} が つく と 、 また {分|わ}かれ{道|みち} の {灯籠|とうろう} の {前|まえ} に {立|た}って いた 。 || You set off along the north road. …And find yourself standing in front of the fork lantern again.
!warp sg.road 16 9 right
?(comp=nao) comp[angry]: は ？ {一本道|いっぽんみち} だった ぞ 。 …… {道|みち} が 、 {自分|じぶん} の {行|い}き{先|さき} を {忘|わす}れて る 。 || What? That was one straight road. …The road's forgotten where it goes.
?(comp=mio) comp[surprise]: {今|いま} 、 {確|たし}か に {北|きた} へ {歩|ある}いた よ ね ？ …… {灯籠|とうろう} の {名前|なまえ} が {決|き}まらない から かな 。 || We did walk north just now, didn't we? …Is it because the lantern can't settle on a name?
?(comp=ren) comp[think]: {灯籠|とうろう} が {二|ふた}つ の {名|な} の {間|あいだ} で {揺|ゆ}れて いる かぎり 、 この {道|みち} は どこ に も {着|つ}きません 。 …… {今回|こんかい} は 、 {私|わたし} が {迷|まよ}った わけ では ありません よ 。 || As long as the lantern wavers between two names, this road arrives nowhere. …And this time it wasn't me getting lost.
?(comp=suzu) comp[laugh]: あら 、 {出口|でぐち} が {入口|いりぐち} に なる {手品|てじな} ね 。 …… {笑|わら}えない わ 。 || Oh, the trick where the exit turns into the entrance. …Not funny.
pc: {先|さき} に 、 {潮硝子|しおがらす} で {何|なに} が {起|お}きて いる の か {調|しら}べよう 。 || Let's find out what's happening in Saltglass first.

@scene sg.road_open
!set sg_road_open_seen
narr: {分|わ}かれ{道|みち} の {灯籠|とうろう} に 、 {火|ひ} が {灯|とも}って いる 。 {笠|かさ} の {名前|なまえ} は 、 もう {揺|ゆ}れない 。 || The fork lantern is burning. The name on its shade no longer wavers.
?(comp=ren) comp[smile]: 「{灰実|はいみ} の {里|さと}」 。 …… よい {字|じ} です 。 {道|みち} が 、 {行|い}き{先|さき} を {思|おも}い{出|だ}しました 。 || "Cinder Orchard." …Good lettering. The road has remembered where it goes.
?(comp=nao) comp: {北|きた} の {道|みち} 、 {通|とお}れる よう に なった な 。 {灰実|はいみ} の {里|さと} まで 、 {三日|みっか} って とこ だ 。 || The north road's open. Three days to Cinder Orchard, give or take.
?(comp=mio) comp[smile]: {北|きた} の {道|みち} が {戻|もど}って る 。 {灰実|はいみ} の {里|さと} …… {果物|くだもの} の {町|まち} だ よ ね 。 || The north road's back. Cinder Orchard… that's the fruit town, isn't it?
?(comp=suzu) comp[think]: {灰実|はいみ} の {里|さと} 、 か 。 …… {久|ひさ}しぶり ね 。 || Cinder Orchard, huh. …It's been a while.
!journal {北|きた} の {道|みち} が {開|ひら}いた 。 {灰実|はいみ} の {里|さと} へ 。 || The north road is open. On to Cinder Orchard.

@scene sg.harbor_first
!set sg_harbor_seen
narr: {坂|さか} を {下|くだ}る と 、 {潮|しお} と {魚|さかな} と タール の {匂|にお}い が した 。 || At the bottom of the slope, the air smells of salt, fish and tar.
narr: {一枚|いちまい} の ラベル が {風|かぜ} に {飛|と}ばされて 、 {足元|あしもと} に {落|お}ちた 。 {字|じ} が {書|か}いて ある …… と {思|おも}った {瞬間|しゅんかん} 、 {白|しろ}く {消|き}えた 。 || A label skitters along the ground and lands at your feet. There's writing on it — and the moment you look, it fades to white.
daigo: おーい ！ その ラベル 、 {誰|だれ} の {荷物|にもつ} の だ ？ …… って 、 {白紙|はくし} か 。 また か よ 。 || Hey! Whose cargo is that label off? …Oh, it's blank. Not again.
daigo: {嵐|あらし} の {後|あと} から 、 ずっと こう だ 。 {荷札|にふだ} も {手紙|てがみ} も {道案内|みちあんない} も 、 みんな {言|い}う こと が {違|ちが}う 。 || Ever since the storm it's been like this. Cargo tags, letters, directions — they all say something different.
daigo: {困|こま}った こと が あったら 、 {港長|こうちょう} の オウミ さん に {言|い}いな 。 {事務所|じむしょ} は {大通|おおどお}り の {西|にし} だ 。 || If you've got a problem, tell the harbourmaster, Ōmi. The office is on the west side of the main street.
?(comp=nao) comp: …… {白紙|はくし} の {荷札|にふだ} 。 {配達人|はいたつにん} に とって は {悪夢|あくむ} だ な 。 || …Blank tags. A courier's nightmare.
?(comp=mio) comp[worry]: {葦|あし}ノ{瀬|せ} の {瓶|びん} の ラベル と {同|おな}じ …… 。 ここ でも 。 || Just like the labels on my bottles back in Reedwake… here too.
?(comp=ren) comp[think]: {字|じ} が {消|き}える {瞬間|しゅんかん} を 、 {初|はじ}めて {見|み}ました 。 {嵐|あらし} の {夜|よる} だけ の こと では ない 。 {今|いま} も {続|つづ}いて いる 。 || I've never seen the moment a word disappears. It didn't just happen on the night of the storm. It's still happening.
?(comp=suzu) comp[worry]: {目|め} の {前|まえ} で {消|き}える なんて 。 {手品|てじな} なら {種|たね} が ある けど …… 。 || Vanishing right in front of us. If it were a magic trick, there'd be a secret to it…
!journal {港長|こうちょう} の オウミ を {訪|たず}ねよう 。 {事務所|じむしょ} は {大通|おおどお}り の {西|にし} 。 || Visit Harbourmaster Ōmi. The office is on the west side of the main street.

@scene sg.return_harbor
!set sg_returned
narr: {手紙|てがみ} が 、 カモメ の よう に {港|みなと} の {空|そら} を {舞|ま}って いた 。 {一通|いっつう} 、 また {一通|いっつう} と 、 {家々|いえいえ} の {戸口|とぐち} に {降|お}りて いく 。 || Letters wheel over the harbour like gulls. One by one, they drift down to doorsteps.
shiori[surprise]: {手紙|てがみ} が …… {空|そら} から 。 || Letters… falling from the sky.
narr: {渡|わた}し{場|ば} の {時刻表|じこくひょう} で {揺|ゆ}れて いた {字|じ} が 、 {落|お}ち{着|つ}いた 。 {倉庫|そうこ} の ラベル も 、 もう {動|うご}かない 。 || The flickering times on the ferry board settle. The warehouse labels stop moving.
narr: {岬|みさき} の {風見|かざみ} が 、 {気持|きも}ち よさそう に {回|まわ}って いる 。 || The weather vane on the point turns contentedly.
?(comp=nao) comp: {配達|はいたつ} {完了|かんりょう} 。 …… {空|そら} から 、 って の は {初|はじ}めて {見|み}た けど な 。 || Delivery complete. …Though I've never seen it done from the sky.
?(comp=mio) comp[smile]: {見|み}て 、 キヨ さん が {手紙|てがみ} を {拾|ひろ}って {泣|な}いてる 。 …… よかった 。 || Look, Kiyo's picked up a letter and she's crying. …I'm glad.
?(comp=ren) comp[smile]: {返送|へんそう} {取|と}り{消|け}し 。 …… {記録|きろく} に {残|のこ}したい {言葉|ことば} です 。 || "Return cancelled." …Words I'd like to put on record.
?(comp=suzu) comp[laugh]: {紙吹雪|かみふぶき} ！ {最高|さいこう} の {終幕|しゅうまく} ね ！ || Confetti! What a finale!
pc: オウミ さん に {報告|ほうこく} しよう 。 || Let's report to Ōmi.
!journal {港長|こうちょう} の {事務所|じむしょ} へ 。 || To the harbour office.
!autosave

@scene sg.ch2_end
!warp sg.harbor 19 35 down
narr: その {夜|よる} 。 {桟橋|さんばし} の {先|さき} で 、 {灯台|とうだい} の {光|ひかり} が {海|うみ} を {撫|な}でて いく の を {見|み}て いた 。 || That night, at the end of the pier, you watch the lighthouse beam stroke the sea.
?(comp=nao) comp: …… {今日|きょう} 、 ワタル の {督促状|とくそくじょう} を {見|み}て 、 ちょっと {嫌|いや} な {気分|きぶん} に なった 。 || …Seeing Wataru's final notice today put me in a bit of a mood.
?(comp=nao) pc: {嫌|いや} な {気分|きぶん} ？ || A mood?
?(comp=nao) comp: {宛名|あてな} の {読|よ}める {手紙|てがみ} を 、 {読|よ}めない {箱|はこ} に {入|い}れる 。 …… {同|おな}じ こと を した こと が ある 。 {一回|いっかい} だけ 。 || Putting a letter with a readable address in the unreadable box. …I've done the same thing. Once.
?(comp=nao&!sg_nao_isamu) comp: {丘|おか} の {上|うえ} に 、 {空|から} の {家|いえ} が ある だろ 。 あそこ に {住|す}んで た {爺|じい}さん の {手紙|てがみ} だ 。 {灯落|ひおち} の {娘|むすめ} {宛|あて} の 。 || There's an empty house up the hill. The old man who lived there wrote it. To his daughter in Lanternfall.
?(comp=nao&sg_nao_isamu) comp: イサム の {手紙|てがみ} の こと だ よ 。 {分|わ}かって る だろ 。 || I mean Isamu's letter. You know that.
?(comp=nao) comp[closed]: {届|とど}ける べき じゃ ない と {思|おも}った 。 {今|いま} も 、 {半分|はんぶん} は そう {思|おも}って る 。 || I didn't think it should be delivered. Half of me still thinks so.
?(comp=nao) comp: {鞄|かばん} の {一番|いちばん} {底|そこ} に ある 。 {捨|す}て られない まま 。 …… あの {書記|しょき} の こと 、 {笑|わら}え ない よ な 。 || It's at the very bottom of my bag. Couldn't throw it away. …Can't exactly laugh at that clerk, can I.
?(comp=nao) comp[smirk]: {今|いま} の 、 {忘|わす}れて いい から 。 {明日|あした} は {北|きた} だ 。 {早|はや}く {寝|ね}ろ 。 || You can forget I said that. North tomorrow. Get some sleep.
?(comp=mio) comp: ワタル さん の こと 、 ずっと {考|かんが}えて た の 。 || I've been thinking about Wataru all evening.
?(comp=mio) comp[sad]: わたし 、 {頼|たの}まれたら {断|ことわ}れない でしょう 。 {薬|くすり} の {代金|だいきん} も 、 「{後|あと} で いい よ 」 って 、 {何人|なんにん} に も {言|い}って る 。 || You know I can't say no when someone asks. I've told so many people "pay for the medicine later".
?(comp=mio) comp: それ で {店|みせ} が {苦|くる}しく なって も 、 {誰|だれ} に も {言|い}わない 。 …… ワタル さん と {少|すこ}し {似|に}て る 。 {黙|だま}って {帳尻|ちょうじり} を {合|あ}わせる ところ が 。 || And when the shop struggles because of it, I don't tell anyone. …A bit like Wataru. Quietly balancing the books.
?(comp=mio) pc: ミオ は {誰|だれ} に も {嘘|うそ} を ついて ない よ 。 || You haven't lied to anyone, Mio.
?(comp=mio) comp[smile]: うん 。 でも 、 {自分|じぶん} に は ついて た かも 。 「{大丈夫|だいじょうぶ}」 って 。 || No. But maybe to myself. "I'm fine."
?(comp=mio) comp: オウミ さん みたい に 、 {優|やさ}しくて {厳|きび}しい の って 、 {難|むずか}しい ね 。 …… {明日|あした} から 、 {練習|れんしゅう} して みる 。 || Being kind and strict at once, like Ōmi — it's hard. …I'll start practising tomorrow.
?(comp=mio) comp[laugh]: まず は 、 {干物|ひもの} の お{土産|みやげ} を {断|ことわ}る {練習|れんしゅう} から 。 …… {無理|むり} かも 。 || Starting with refusing all the dried fish people keep giving us. …That might be impossible.
?(comp=ren) comp: {書記|しょき} の {言|い}った 「{主|あるじ}」 の こと を 、 {考|かんが}えて いました 。 || I was thinking about the "master" the Clerk mentioned.
?(comp=ren) comp: {私|わたし} の {師匠|ししょう} は 、 {何年|なんねん} も {前|まえ} に 、 {山|やま} の {書庫|しょこ} へ {話|はなし} を しに {行|い}きました 。 そして 、 {帰|かえ}って きません でした 。 || My master went to the archive in the mountains years ago, to talk. And never came back.
?(comp=ren) comp[sad]: {師匠|ししょう} の {教|おし}え は 、 {一字一句|いちじいっく} {覚|おぼ}えて います 。 でも 、 {顔|かお} が …… {思|おも}い{出|だ}せない の です 。 {今夜|こんや} 、 {初|はじ}めて それ が {怖|こわ}く なりました 。 || I remember every word my master taught me. But the face… I can't recall it. Tonight, for the first time, that frightens me.
?(comp=ren) pc: {棚|たな} に {上|あ}げられた の かも しれない ね 。 || Maybe it's been shelved.
?(comp=ren) comp: …… ええ 。 だと すれば 、 {取|と}り{戻|もど}せる かも しれません 。 {返送|へんそう} は {取|と}り{消|け}せる と 、 {今日|きょう} {分|わ}かりました から 。 || …Yes. And if so, it might be retrieved. Today we learned that a return can be cancelled.
?(comp=ren) comp[smile]: {暗|くら}い {話|はなし} を して しまいました 。 {灯台|とうだい} の {前|まえ} では 、 {暗|くら}い {話|はなし} も {少|すこ}し {明|あか}るく {聞|き}こえる ので 、 {許|ゆる}して ください 。 || I've said something gloomy. Forgive me — in front of a lighthouse, even gloomy talk sounds a little brighter.
?(comp=ren) comp[shy]: …… {今|いま} の は 、 {冗談|じょうだん} の つもり でした 。 || …That was meant as a joke.
?(comp=suzu) comp: ねえ 。 ワタル くん の {帳簿|ちょうぼ} 、 {最初|さいしょ} に {見|み}た とき から 、 {嘘|うそ} だって {分|わ}かって た の 。 || Hey. I knew Wataru's books were lying the first time I saw them.
?(comp=suzu) comp[smirk]: {数字|すうじ} の {嘘|うそ} は {得意|とくい} なの 。 {昔|むかし} 、 {一座|いちざ} の {帳簿|ちょうぼ} を ごまかした こと が ある から 。 {三日|みっか} で バレた けど 。 || I'm good at spotting lies in numbers. I once fudged the troupe's accounts myself. Found out in three days.
?(comp=suzu) pc: {今夜|こんや} は {冗談|じょうだん} から {入|はい}らない ね 。 || No joke to start with tonight.
?(comp=suzu) comp[closed]: …… {入|はい}った わ よ 。 {今|いま} の が {冗談|じょうだん} 。 {本当|ほんとう} の {話|はなし} は 、 ここ から 。 || …I did. That was the joke. The real story starts here.
?(comp=suzu) comp[sad]: {嘘|うそ} に は 、 {帳簿|ちょうぼ} に {書|か}けない {嘘|うそ} も ある の 。 {人|ひと} を {慰|なぐさ}める ため の やつ 。 {利子|りし} が {見|み}えない から 、 {返|かえ}す {日|ひ} が {分|わ}からない 。 || Some lies can't go in a ledger. The ones you tell to comfort someone. You can't see the interest, so you never know when it falls due.
?(comp=suzu) comp: {灰実|はいみ} の {里|さと} に は 、 {一|ひと}つ …… {返|かえ}さなきゃ いけない もの が ある の 。 || In Cinder Orchard there's something… I have to pay back.
?(comp=suzu) comp[smile]: さ 、 {今夜|こんや} は ここ まで ！ {幕|まく} ！ || Right — that's all for tonight! Curtain!
narr: {灯台|とうだい} の {光|ひかり} が {港|みなと} を {一周|いっしゅう} して 、 また {戻|もど}って きた 。 || The lighthouse beam sweeps once around the harbour and comes back again.
!unset sg_evening
!set ch2_done sg_ferry_running
!warp sg.inn 6 7 down
narr: {翌朝|よくあさ} 。 {港|みなと} は {朝|あさ} から うるさかった 。 {正|ただ}しい うるささ だった 。 || Next morning, the harbour is loud from dawn. The right kind of loud.
!heal
!journal {北|きた} の {道|みち} を {通|とお}って 、 {灰実|はいみ} の {里|さと} へ 。 || Take the north road out of the coast road fork to Cinder Orchard.
!autosave
`, 'ch2/20_scenes_road');
