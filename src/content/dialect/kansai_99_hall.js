/* Suzu's Kansai-ben: the Hall of a Hundred Tales (expansion P15): the key ledger, the foyer, wing 1 (The Lamp at
 * the Crossroads) wing 2 (The Fox's Wedding), wing 3 (The Bell Before Dawn) and wing 4 (The Borrowed
 * Umbrella). Format and rules: src/lang/85_dialect.js, docs/dialect/suzu_kansai.md. "=" the standard line as
 * authored (the key: its Japanese); ">" the Kansai version. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.dialect.add('kansai', `
@ hall/hall.tsuru_ledger [hall.tsuru_ledger]
= {百物語|ひゃくものがたり} ！ {一座|いちざ} の {年寄|としよ}り に {自慢|じまん} できる わ 。 {百|ひゃく} {本|ほん} の {芝居|しばい} を {見|み}た って 。 || A hundred tales! I can boast to the troupe's old-timers: I saw a hundred plays.
> {百物語|ひゃくものがたり} や ！ {一座|いちざ} の {年寄|としよ}り に {自慢|じまん} できる わ 。 {百|ひゃく} {本|ほん} の {芝居|しばい} を {見|み}た って な 。 || A hundred tales! I can boast to the troupe's old-timers: I saw a hundred plays.
@ hall/hall.foyer_first [hall.foyer_first]
= {十|とお} の {舞台|ぶたい} と 、 {十|とお} の {幕|まく} ね 。 {一幕|ひとまく} ずつ 、 {観|み}て いこう よ 。 || Ten stages, ten curtains. Let's take them one act at a time.
> {十|とお} の {舞台|ぶたい} と 、 {十|とお} の {幕|まく} や な 。 {一幕|ひとまく} ずつ 、 {観|み}て いこ か 。 || Ten stages, ten curtains. Let's take them one act at a time.
@ hall/hall.w1.f1_first [hall.w1.f1_first]
= {幕|まく} が {上|あ}がった ね 。 {第|だい}{一幕|いちまく} 、 {夕暮|ゆうぐ}れ の {辻|つじ} 。 || The curtain's up. Act one: the crossroads at dusk.
> {幕|まく} が {上|あ}がった な 。 {第|だい}{一幕|いちまく} 、 {夕暮|ゆうぐ}れ の {辻|つじ} や 。 || The curtain's up. Act one: the crossroads at dusk.
@ hall/hall.w1.f3_first [hall.w1.f3_first]
= {最後|さいご} の {幕|まく} ね 。 {主役|しゅやく} の {灯籠|とうろう} が 、 {出番|でばん} を {待|ま}って いる 。 || The last act. The star lamp is waiting for its cue.
> {最後|さいご} の {幕|まく} や な 。 {主役|しゅやく} の {灯籠|とうろう} が 、 {出番|でばん} を {待|ま}っとる 。 || The last act. The star lamp is waiting for its cue.
@ hall/hall.w1.t1 [hall.w1.t1]
= {台詞|せりふ} も {同|おな}じ よ 。 {聞|き}こえなかったら 、 {聞|き}き{返|かえ}す 。 {黙|だま}って {演|や}る の が 、 {一番|いちばん} {危|あぶ}ない 。 || Same with lines. If you didn't catch it, ask. Carrying on in silence is the riskiest thing.
> {台詞|せりふ} も {同|おな}じ や で 。 {聞|き}こえへんかったら 、 {聞|き}き{返|かえ}す 。 {黙|だま}って {演|や}る の が 、 {一番|いちばん} {危|あぶ}ない ねん 。 || Same with lines. If you didn't catch it, ask. Carrying on in silence is the riskiest thing.
@ hall/hall.w1.t6 [hall.w1.t6]
= {私|わたし} が {持|も}つ よ 。 {帳面|ちょうめん} {読|よ}み なら {得意|とくい} 。 {何|なに} が {知|し}りたい ？ || I'll hold it. Reading small print is my strong suit. What do you want to know?
> うち が {持|も}つ わ 。 {帳面|ちょうめん} {読|よ}み なら {得意|とくい} や 。 {何|なに} が {知|し}りたい ん ？ || I'll hold it. Reading small print is my strong suit. What do you want to know?
@ hall/hall.w1.end [hall.w1.end]
= {第|だい}{一幕|いちまく} 、 {幕|まく} ！ {聞|き}き{返|かえ}す {勇気|ゆうき} の {話|はなし} 。 {拍手|はくしゅ} を どうぞ 。 || End of act one! A tale about the courage to ask again. Applause, please.
> {第|だい}{一幕|いちまく} 、 {幕|まく} や ！ {聞|き}き{返|かえ}す {勇気|ゆうき} の {話|はなし} 。 {拍手|はくしゅ} 、 たのむ で 。 || End of act one! A tale about the courage to ask again. Applause, please.
@ hall/hall.gate [hall.gate]
= {灯|ひ} が {全部|ぜんぶ} {点|つ}いたら 、 ほどける ん だろう 。 || I expect it unties once all the lights are lit.
> {灯|ひ} が {全部|ぜんぶ} {点|つ}いたら 、 ほどける ん やろ な 。 || I expect it unties once all the lights are lit.
@ hall/hall.w1.f2_first [hall.w1.f2_first]
= {札|ふだ} が ある 。 {先|さき} に {読|よ}んで から 、 {歩|ある}こう 。 || There's a card. Let's read it before we walk.
> {札|ふだ} が ある わ 。 {先|さき} に {読|よ}んで から 、 {歩|ある}こ 。 || There's a card. Let's read it before we walk.
@ hall/hall.w1.t2 [hall.w1.t2]
= {道|みち}しるべ が すぐ そこ に ある 。 {見|み}て から {答|こた}えて も いい ね 。 || The signpost is right there. We could look before we answer.
> {道|みち}しるべ が すぐ そこ に ある で 。 {見|み}て から {答|こた}えて も ええ な 。 || The signpost is right there. We could look before we answer.
@ hall/hall.w1.t3 [hall.w1.t3]
= {正|ただ}しい {三|みっ}つ が ある から 、 {違|ちが}う {一|ひと}つ が {分|わ}かる ん だ ね 。 || It's because three are right that the odd one shows.
> {正|ただ}しい {三|みっ}つ が ある から 、 {違|ちが}う {一|ひと}つ が {分|わ}かる ん や な 。 || It's because three are right that the odd one shows.
@ hall/hall.w1.t4_card [hall.w1.t4_card]
= {角|かど} を {数|かぞ}えながら {行|い}こう 。 || Let's count the corners as we go.
> {角|かど} を {数|かぞ}えながら {行|い}こ 。 || Let's count the corners as we go.
@ hall/hall.w1.l4 [hall.w1.l4_w6]
= {角|かど} を {数|かぞ}え{直|なお}して みよう か 。 {入|い}り{口|ぐち} から 、 もう {一度|いちど} 。 || Shall we count the corners again? From the way in, once more.
> {角|かど} を {数|かぞ}え{直|なお}して みよ か 。 {入|い}り{口|ぐち} から 、 もう {一回|いっかい} 。 || Shall we count the corners again? From the way in, once more.
@ hall/hall.w1.t6_ne [hall.w1.t6_ne]
= {地図|ちず} の {言葉|ことば} 、 もう {一度|いちど} {言|い}おう か ？ || Shall I say what the map said again?
> {地図|ちず} の {言葉|ことば} 、 もう {一回|いっかい} {言|い}お か ？ || Shall I say what the map said again?
@ hall/hall.w1.t6_ne [hall.w1.t6_ne]
= {地図|ちず} の {通|とお}り だ 。 {読|よ}んで 、 {歩|ある}いて 、 {見|み}つけた 。 || Just as the map said. Read it, walked it, found it.
> {地図|ちず} の {通|とお}り や 。 {読|よ}んで 、 {歩|ある}いて 、 {見|み}つけた で 。 || Just as the map said. Read it, walked it, found it.
@ hall/hall.w1.l8 [hall.w1.l8_N]
= {順番|じゅんばん} が {違|ちが}った みたい だ 。 {札|ふだ} を もう {一度|いちど} {読|よ}もう 。 || Wrong order, it seems. Let's read the note again.
> {順番|じゅんばん} が {違|ちが}った みたい や 。 {札|ふだ} を もう {一回|いっかい} {読|よ}も 。 || Wrong order, it seems. Let's read the note again.
@ hall/hall.w2.f1_first [hall.w2.f1_first]
= {第|だい}{二幕|にまく} は 、 {雨|あめ} と お{日様|ひさま} の {舞台|ぶたい} ね 。 {傘|かさ} の {出番|でばん} よ 。 || Act two: a stage of rain and sunshine. Time for the umbrellas.
> {第|だい}{二幕|にまく} は 、 {雨|あめ} と お{日様|ひさま} の {舞台|ぶたい} や な 。 {傘|かさ} の {出番|でばん} や で 。 || Act two: a stage of rain and sunshine. Time for the umbrellas.
@ hall/hall.w2.f2_first [hall.w2.f2_first]
= {並|なら}び{順|じゅん} が {分|わ}からなくて 、 {困|こま}って いる みたい だ 。 || They seem stuck: nobody knows the order to walk in.
> {並|なら}び{順|じゅん} が {分|わ}からへん で 、 {困|こま}っとる みたい や 。 || They seem stuck: nobody knows the order to walk in.
@ hall/hall.w2.f3_first [hall.w2.f3_first]
= いよいよ {本番|ほんばん} ね 。 {小道具|こどうぐ} の {返却|へんきゃく} から 。 {舞台|ぶたい} の {基本|きほん} よ 。 || The real performance at last. Props returned first: the basics of the stage.
> いよいよ {本番|ほんばん} や な 。 {小道具|こどうぐ} の {返却|へんきゃく} から や 。 {舞台|ぶたい} の {基本|きほん} や で 。 || The real performance at last. Props returned first: the basics of the stage.
@ hall/hall.w2.t1 [hall.w2.t1]
= {帳簿|ちょうぼ} {的|てき} に は 、 {傘|かさ} が {貸|か}し で 、 {栗|くり} が お{返|かえ}し 。 {完璧|かんぺき} な {幕切|まくぎ}れ ね 。 || In the ledger: the umbrella the loan, the chestnuts the repayment. A perfect curtain.
> {帳簿|ちょうぼ} {的|てき} に は 、 {傘|かさ} が {貸|か}し で 、 {栗|くり} が お{返|かえ}し や 。 {完璧|かんぺき} な {幕切|まくぎ}れ や な 。 || In the ledger: the umbrella the loan, the chestnuts the repayment. A perfect curtain.
@ hall/hall.w2.tray_groom [hall.w2.tray_groom]
= {誰|だれ} から 、 {誰|だれ} へ 。 {札|ふだ} の {字|じ} {一|ひと}つ で 、 {行|い}き{先|さき} が {変|か}わる ん だ ね 。 || From whom, to whom. One word on a tag, and the gift goes somewhere else.
> {誰|だれ} から 、 {誰|だれ} へ 。 {札|ふだ} の {字|じ} {一|ひと}つ で 、 {行|い}き{先|さき} が {変|か}わる ん や な 。 || From whom, to whom. One word on a tag, and the gift goes somewhere else.
@ hall/hall.w2.t3 [hall.w2.t3]
= {仲人|なこうど} は 、 {誰|だれ} が {誰|だれ} に 、 を {間違|まちが}えたら {仕事|しごと} に ならない から ね 。 || A go-between who mixes up who gives to whom is out of work.
> {仲人|なこうど} は 、 {誰|だれ} が {誰|だれ} に 、 を {間違|まちが}えたら {仕事|しごと} に ならへん から な 。 || A go-between who mixes up who gives to whom is out of work.
@ hall/hall.w2.t4_card [hall.w2.t4_card]
= {先頭|せんとう} から {順番|じゅんばん} に 、 {声|こえ} を かけて いこう 。 || Let's call them out in order, from the front.
> {先頭|せんとう} から {順番|じゅんばん} に 、 {声|こえ} を かけて いこ か 。 || Let's call them out in order, from the front.
@ hall/hall.w2.l4_bearer [hall.w2.l4_bearer]
= {札|ふだ} を もう {一度|いちど} {読|よ}もう 。 {誰|だれ} の {後|うし}ろ に {誰|だれ} 、 か 。 || Let's read the card again. Who walks behind whom.
> {札|ふだ} を もう {一度|いちど} {読|よ}も か 。 {誰|だれ} の {後|うし}ろ に {誰|だれ} 、 や 。 || Let's read the card again. Who walks behind whom.
@ hall/hall.w2.t6 [hall.w2.t6]
= {座席表|ざせきひょう} なら {任|まか}せて 。 {一座|いちざ} の {興行|こうぎょう} で {毎晩|まいばん} {作|つく}って た から 。 {誰|だれ} の ？ || Leave seating plans to me. I made one every night for the troupe's shows. Whose?
> {座席表|ざせきひょう} なら {任|まか}せとき 。 {一座|いちざ} の {興行|こうぎょう} で {毎晩|まいばん} {作|つく}って た ん や から 。 {誰|だれ} の ？ || Leave seating plans to me. I made one every night for the troupe's shows. Whose?
@ hall/hall.w2.t6_bride [hall.w2.t6_bride]
= {紙|かみ} の {言葉|ことば} 、 もう {一度|いちど} {言|い}おう か ？ || Shall I say what the list said again?
> {紙|かみ} の {言葉|ことば} 、 もう {一度|いちど} {言|い}お か ？ || Shall I say what the list said again?
@ hall/hall.w2.t6_bride [hall.w2.t6_bride]
= {傘|かさ} を {貸|か}した {人|ひと} が 、 {一番|いちばん} いい {席|せき} に {座|すわ}る 。 {正|ただ}しい {並|なら}び だ ね 。 || The one who lent the umbrella sits in the best seat. The right arrangement.
> {傘|かさ} を {貸|か}した {人|ひと} が 、 {一番|いちばん} ええ {席|せき} に {座|すわ}る 。 {正|ただ}しい {並|なら}び や な 。 || The one who lent the umbrella sits in the best seat. The right arrangement.
@ hall/hall.w2.t8_notes [hall.w2.t8_notes]
= {貸|か}した {人|ひと} に {返|かえ}す 。 {借|か}りた {人|ひと} じゃ ない よ 。 || Back to whoever lent it. Not whoever borrowed it.
> {貸|か}した {人|ひと} に {返|かえ}す ん や 。 {借|か}りた {人|ひと} と ちゃう で 。 || Back to whoever lent it. Not whoever borrowed it.
@ hall/hall.w2.end [hall.w2.end]
= {第|だい}{二幕|にまく} 、 {幕|まく} ！ {貸|か}し{借|か}り は 、 {全部|ぜんぶ} {返|かえ}した 。 {拍手|はくしゅ} ！ || End of act two! Every loan paid back. Applause!
> {第|だい}{二幕|にまく} 、 {幕|まく} や ！ {貸|か}し{借|か}り は 、 {全部|ぜんぶ} {返|かえ}した で 。 {拍手|はくしゅ} ！ || End of act two! Every loan paid back. Applause!
@ hall/hall.w3.f1_first [hall.w3.f1_first]
= {第|だい}{三幕|さんまく} は 、 {夜|よる} の {舞台|ぶたい} ね 。 {幕|まく} が {上|あ}がる の は 、 {夜明|よあ}け {前|まえ} 。 || Act three: a night stage. The curtain goes up before dawn.
> {第|だい}{三幕|さんまく} は 、 {夜|よる} の {舞台|ぶたい} や な 。 {幕|まく} が {上|あ}がる の は 、 {夜明|よあ}け {前|まえ} や 。 || Act three: a night stage. The curtain goes up before dawn.
@ hall/hall.w3.f2_first [hall.w3.f2_first]
= {一緒|いっしょ} に {登|のぼ}ろう 。 {順番|じゅんばん} に 、 {一|ひと}つ ずつ 。 || We'll climb with you. In order, one thing at a time.
> {一緒|いっしょ} に {登|のぼ}ろ か 。 {順番|じゅんばん} に 、 {一|ひと}つ ずつ や 。 || We'll climb with you. In order, one thing at a time.
@ hall/hall.w3.f3_first [hall.w3.f3_first]
= お{囃子|はやし} が {入|はい}った わ 。 {大詰|おおづ}め ね 。 || The drums have come in. This is the final scene.
> お{囃子|はやし} が {入|はい}った で 。 {大詰|おおづ}め や な 。 || The drums have come in. This is the final scene.
@ hall/hall.w3.t1 [hall.w3.t1]
= {代役|だいやく} の {初舞台|はつぶたい} ね 。 {一番|いちばん} {緊張|きんちょう} する やつ よ 。 || An understudy's first night. The most nerve-racking kind.
> {代役|だいやく} の {初舞台|はつぶたい} や な 。 {一番|いちばん} {緊張|きんちょう} する やつ や で 。 || An understudy's first night. The most nerve-racking kind.
@ hall/hall.w3.t2_note [hall.w3.t2_note]
= {書|か}いて ある {順|じゅん} と 、 やる {順|じゅん} は 、 {違|ちが}う かも しれない 。 {前|まえ} と {後|あと} を よく {見|み}よう 。 || The order it's written in may not be the order to do it in. Watch for before and after.
> {書|か}いて ある {順|じゅん} と 、 やる {順|じゅん} は 、 ちゃう かも しれへん 。 {前|まえ} と {後|あと} を よう {見|み}よ か 。 || The order it's written in may not be the order to do it in. Watch for before and after.
@ hall/hall.w3.c_water [hall.w3.c_water]
= {書|か}いて ある {順|じゅん} じゃ なくて 、 {前|まえ} と {後|あと} で {決|き}まる {順|じゅん} 。 {上手|うま}く いった ね 。 || Not the order it was written in, but the order before and after make. Well done.
> {書|か}いて ある {順|じゅん} や なくて 、 {前|まえ} と {後|あと} で {決|き}まる {順|じゅん} や 。 {上手|うま}い こと いった な 。 || Not the order it was written in, but the order before and after make. Well done.
@ hall/hall.w3.t3 [hall.w3.t3]
= {鐘撞|かねつ}き は 、 {前|まえ} と {後|あと} を {間違|まちが}えたら {仕事|しごと} に ならない から ね 。 || A bell-ringer who mixes up before and after is out of a job.
> {鐘撞|かねつ}き は 、 {前|まえ} と {後|あと} を {間違|まちが}えたら {仕事|しごと} に ならへん から な 。 || A bell-ringer who mixes up before and after is out of a job.
@ hall/hall.w3.h_jizo [hall.w3.h_jizo]
= {急|いそ}がなくて いい 。 {線香|せんこう} は 、 まだ ある 。 || No need to hurry. There's more incense.
> {急|いそ}がん で ええ 。 {線香|せんこう} は 、 まだ ある で 。 || No need to hurry. There's more incense.
@ hall/hall.w3.h_jizo [hall.w3.h_jizo]
= {前|まえ} に 、 {後|あと} で 、 {間|ま}に{合|あ}った 。 {時計|とけい} と {仲良|なかよ}く なった {気分|きぶん} だ ね 。 || Before, after, in time. I feel like the clock and I are friends now.
> {前|まえ} に 、 {後|あと} で 、 {間|ま}に{合|あ}った で 。 {時計|とけい} と {仲良|なかよ}く なった {気分|きぶん} や な 。 || Before, after, in time. I feel like the clock and I are friends now.
@ hall/hall.w3.t6 [hall.w3.t6]
= {香盤表|こうばんひょう} みたい な もん ね 。 {任|まか}せて 。 {何|なに} を {見|み}る ？ || It's like a running order. Leave it to me. What am I looking for?
> {香盤表|こうばんひょう} みたい な もん や な 。 {任|まか}せとき 。 {何|なに} を {見|み}る ん ？ || It's like a running order. Leave it to me. What am I looking for?
@ hall/hall.w3.t6_h1 [hall.w3.t6_h1]
= {暦|こよみ} の {言葉|ことば} 、 もう {一度|いちど} {言|い}おう か ？ || Shall I say the almanac's words again?
> {暦|こよみ} の {言葉|ことば} 、 もう {一度|いちど} {言|い}お か ？ || Shall I say the almanac's words again?
@ hall/hall.w3.t6_h1 [hall.w3.t6_h1]
= これ で 、 {村|むら} の {人|ひと} も {鐘|かね} の {時|とき} が {分|わ}かる 。 || Now the village will know the bell's hour too.
> これ で 、 {村|むら} の {人|ひと} も {鐘|かね} の {時|とき} が {分|わ}かる な 。 || Now the village will know the bell's hour too.
@ hall/hall.w3.w_osho [hall.w3.w_osho]
= {見|み}た {順番|じゅんばん} に {並|なら}べたら 、 {最後|さいご} の {場所|ばしょ} に いる はず だ 。 || Put the sightings in order, and the cub should be where it was seen last.
> {見|み}た {順番|じゅんばん} に {並|なら}べたら 、 {最後|さいご} の {場所|ばしょ} に おる はず や 。 || Put the sightings in order, and the cub should be where it was seen last.
@ hall/hall.w3.hide_steps [hall.w3.hide_steps]
= {一番|いちばん} {最後|さいご} に {見|み}た の は 、 {誰|だれ} だった ？ || Who saw it last?
> {一番|いちばん} {最後|さいご} に {見|み}た ん は 、 {誰|だれ} やった ？ || Who saw it last?
@ hall/hall.w3.hide_steps [hall.w3.hide_steps]
= {大丈夫|だいじょうぶ} 。 お{母|かあ}さん の ところ へ {帰|かえ}ろう 。 || It's all right. Let's get you back to your mother.
> {大丈夫|だいじょうぶ} や 。 お{母|かあ}さん の とこ へ {帰|かえ}ろ な 。 || It's all right. Let's get you back to your mother.
@ hall/hall.w3.end [hall.w3.end]
= {第|だい}{三幕|さんまく} 、 {幕|まく} ！ {出|で} の きっかけ を {一度|いちど} も {外|はず}さなかった わ 。 {拍手|はくしゅ} ！ || End of act three! Not one cue missed. Applause!
> {第|だい}{三幕|さんまく} 、 {幕|まく} や ！ {出|で} の きっかけ 、 {一度|いちど} も {外|はず}さへんかった で 。 {拍手|はくしゅ} ！ || End of act three! Not one cue missed. Applause!
@ hall/hall.w4.f1_first [hall.w4.f1_first]
= {第|だい}{四幕|よんまく} は 、 {雨|あめ} の {舞台|ぶたい} ね 。 {今度|こんど} の {主役|しゅやく} は 、 {傘|かさ} そのもの らしい わ よ 。 || Act four: a rainy stage. This time the lead is the umbrella itself, I hear.
> {第|だい}{四幕|よんまく} は 、 {雨|あめ} の {舞台|ぶたい} や な 。 {今度|こんど} の {主役|しゅやく} は 、 {傘|かさ} そのもの らしい で 。 || Act four: a rainy stage. This time the lead is the umbrella itself, I hear.
@ hall/hall.w4.f2_first [hall.w4.f2_first]
= {一年|いちねん} {前|まえ} 、 ゴサク さん は ここ で {足止|あしど}め された ん だ ね 。 || A year ago, this is where Gosaku was stopped.
> {一年|いちねん} {前|まえ} 、 ゴサク さん は ここ で {足止|あしど}め された ん や な 。 || A year ago, this is where Gosaku was stopped.
@ hall/hall.w4.f3_first [hall.w4.f3_first]
= {出|で}た わ ね 、 {主役|しゅやく} が 。 {舞台|ぶたい} {袖|そで} で {拗|す}ねてる みたい だ けど 。 || There's our lead. Sulking in the wings, by the look of it.
> {出|で}た で 、 {主役|しゅやく} が 。 {舞台|ぶたい} {袖|そで} で {拗|す}ねてる みたい や けど 。 || There's our lead. Sulking in the wings, by the look of it.
@ hall/hall.w4.t1 [hall.w4.t1]
= {小道具|こどうぐ} が {勝手|かって} に {帰|かえ}る なんて 、 {一座|いちざ} なら {大騒|おおさわ}ぎ よ 。 || A prop going home by itself? The troupe would be in uproar.
> {小道具|こどうぐ} が {勝手|かって} に {帰|かえ}る なんて 、 {一座|いちざ} やったら {大騒|おおさわ}ぎ や で 。 || A prop going home by itself? The troupe would be in uproar.
@ hall/hall.w4.n_oume [hall.w4.n_oume]
= {何|なに} を {頼|たの}んで いた か 、 もう {一度|いちど} {聞|き}いて みよう 。 || Let's hear again what they were asking for.
> {何|なに} を {頼|たの}んで いた か 、 もう {一度|いちど} {聞|き}いて みよ か 。 || Let's hear again what they were asking for.
@ hall/hall.w4.n_oume [hall.w4.n_oume]
= はっきり {言|い}わない {頼|たの}み も 、 {聞|き}けば {分|わ}かる もの だ ね 。 || Even a request nobody says outright makes sense once you listen.
> はっきり {言|い}わへん {頼|たの}み も 、 {聞|き}いたら {分|わ}かる もん や な 。 || Even a request nobody says outright makes sense once you listen.
@ hall/hall.w4.t3 [hall.w4.t3]
= {頼|たの}み {方|かた} を {間違|まちが}えたら 、 {商売|しょうばい} に ならない から ね 。 || Ask the wrong way and there's no trade at all.
> {頼|たの}み {方|かた} を {間違|まちが}えたら 、 {商売|しょうばい} に ならへん から な 。 || Ask the wrong way and there's no trade at all.
@ hall/hall.w4.t4_diary [hall.w4.t4_diary]
= {行|い}く つもり だった {道|みち} じゃ なくて 、 {本当|ほんとう} に {行|い}った {道|みち} を {辿|たど}ろう 。 || Not the way he meant to go: the way he really went.
> {行|い}く つもり やった {道|みち} や なくて 、 {本当|ほんとう} に {行|い}った {道|みち} を {辿|たど}ろ か 。 || Not the way he meant to go: the way he really went.
@ hall/hall.w4.f3_ferry [hall.w4.f3_ferry]
= {行|い}く つもり の {道|みち} と 、 {本当|ほんとう} に {行|い}った {道|みち} 。 {一年|いちねん} {前|まえ} の ゴサク さん に 、 {追|お}い{付|つ}いた ね 。 || The way he meant and the way he went. We've caught up with Gosaku as he was a year ago.
> {行|い}く つもり の {道|みち} と 、 {本当|ほんとう} に {行|い}った {道|みち} 。 {一年|いちねん} {前|まえ} の ゴサク さん に 、 {追|お}い{付|つ}いた な 。 || The way he meant and the way he went. We've caught up with Gosaku as he was a year ago.
@ hall/hall.w4.t6 [hall.w4.t6]
= {張|は}り{紙|がみ} を {読|よ}む の は 、 {旅回|たびまわ}り の {基本|きほん} よ 。 {任|まか}せて 。 {何|なに} を {見|み}る ？ || Reading posted notices is basic touring. Leave it to me. What am I looking for?
> {張|は}り{紙|がみ} を {読|よ}む の は 、 {旅回|たびまわ}り の {基本|きほん} や で 。 {任|まか}せとき 。 {何|なに} を {見|み}る ん ？ || Reading posted notices is basic touring. Leave it to me. What am I looking for?
@ hall/hall.w4.x_bridge [hall.w4.x_bridge]
= {高札|こうさつ} の {言葉|ことば} 、 もう {一度|いちど} {言|い}おう か ？ || Shall I say the notice's words again?
> {高札|こうさつ} の {言葉|ことば} 、 もう {一度|いちど} {言|い}お か ？ || Shall I say the notice's words again?
@ hall/hall.w4.x_bridge [hall.w4.x_bridge]
= {渡|わた}って も いい {所|ところ} から 、 {渡|わた}る 。 {一年|いちねん} {前|まえ} の ゴサク さん も 、 そう したかった だろう ね 。 || We cross where crossing is allowed. Gosaku would have wanted to, a year ago.
> {渡|わた}って も ええ {所|ところ} から 、 {渡|わた}る ん や 。 {一年|いちねん} {前|まえ} の ゴサク さん も 、 そう したかった やろ な 。 || We cross where crossing is allowed. Gosaku would have wanted to, a year ago.
@ hall/hall.w4.t8_rules [hall.w4.t8_rules]
= しなければ ならない こと 、 して も いい こと 、 して は いけない こと 。 {分|わ}けて {覚|おぼ}えよう 。 || What we must do, what we may do, what we mustn't. Let's keep them apart.
> せな あかん こと 、 して も ええ こと 、 したら あかん こと 。 {分|わ}けて {覚|おぼ}えよ か 。 || What we must do, what we may do, what we mustn't. Let's keep them apart.
@ hall/hall.w4.r_door [hall.w4.r_door]
= {全部|ぜんぶ} 、 {決|き}まり の {通|とお}り 。 これ なら 、 {誰|だれ} に も {叱|しか}られない ね 。 || All by the rules. Nobody can scold us now.
> {全部|ぜんぶ} 、 {決|き}まり の {通|とお}り や 。 これ やったら 、 {誰|だれ} に も {叱|しか}られへん な 。 || All by the rules. Nobody can scold us now.
@ hall/hall.w4.end [hall.w4.end]
= {第|だい}{四幕|よんまく} 、 {幕|まく} ！ {主役|しゅやく} の {傘|かさ} に 、 {大|おお}きな {拍手|はくしゅ} を ！ || End of act four! A big hand for our lead, the umbrella!
> {第|だい}{四幕|よんまく} 、 {幕|まく} や ！ {主役|しゅやく} の {傘|かさ} に 、 {大|おお}きな {拍手|はくしゅ} 、 たのむ で ！ || End of act four! A big hand for our lead, the umbrella!
`, 'hall');
