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
@ hall/hall.w5.f1_first [hall.w5.f1_first]
= {第|だい}{五幕|ごまく} は 、 {二|ふた}つ の {家|いえ} の {話|はなし} ね 。 {家|いえ} {同士|どうし} の {喧嘩|けんか} は 、 {芝居|しばい} の {定番|ていばん} よ 。 || Act five: a tale of two houses. A feud between houses is a stage favourite.
> {第|だい}{五幕|ごまく} は 、 {二|ふた}つ の {家|いえ} の {話|はなし} や な 。 {家|いえ} {同士|どうし} の {喧嘩|けんか} は 、 {芝居|しばい} の {定番|ていばん} や で 。 || Act five: a tale of two houses. A feud between houses is a stage favourite.
@ hall/hall.w5.f2_first [hall.w5.f2_first]
= {苦|にが}い {井戸|いど} 、 か 。 {誰|だれ} の せい か より 、 {何|なに} が {理由|りゆう} か を {知|し}りたい ね 。 || The bitter well. Never mind whose fault; I'd like to know what the reason is.
> {苦|にが}い {井戸|いど} 、 か 。 {誰|だれ} の せい か より 、 {何|なに} が {理由|りゆう} か 、 {知|し}りたい な 。 || The bitter well. Never mind whose fault; I'd like to know what the reason is.
@ hall/hall.w5.f3_first [hall.w5.f3_first]
= {大詰|おおづ}め の {舞台|ぶたい} は 、 {広場|ひろば} ね 。 {両家|りょうけ} {揃|そろ}い{踏|ぶ}み よ 。 || The final scene is set in the square. Both houses on stage together.
> {大詰|おおづ}め の {舞台|ぶたい} は 、 {広場|ひろば} や な 。 {両家|りょうけ} {揃|そろ}い{踏|ぶ}み や で 。 || The final scene is set in the square. Both houses on stage together.
@ hall/hall.w5.t1 [hall.w5.t1]
= {悪役|あくやく} の いない {喧嘩|けんか} は 、 {演|や}る の が {一番|いちばん} {難|むずか}しい の よ 。 || A quarrel with no villain is the hardest kind to play.
> {悪役|あくやく} の いない {喧嘩|けんか} は 、 {演|や}る の が {一番|いちばん} {難|むずか}しい ん や で 。 || A quarrel with no villain is the hardest kind to play.
@ hall/hall.w5.e_bucket [hall.w5.e_bucket]
= ここ に は 、 {困|こま}った こと が {見|み}えて いる だけ 。 どうして そう なった か 、 {誰|だれ} か に {聞|き}いて みよう 。 || Here the trouble only shows. Let's ask someone why it happens.
> ここ に は 、 {困|こま}った こと が {見|み}えてる だけ や 。 なんで そう なった か 、 {誰|だれ} か に {聞|き}いて みよ か 。 || Here the trouble only shows. Let's ask someone why it happens.
@ hall/hall.w5.c_pulley [hall.w5.c_pulley]
= {桶|おけ} を {叩|たた}いて も 、 {桶|おけ} は {上|あ}がらない もん ね 。 || Banging the bucket would never have brought it up.
> {桶|おけ} を {叩|たた}いて も 、 {桶|おけ} は {上|あ}がらへん もん な 。 || Banging the bucket would never have brought it up.
@ hall/hall.w5.t3 [hall.w5.t3]
= {理由|りゆう} が {合|あ}わない と 、 {話|はなし} が {全部|ぜんぶ} おかしく なる から ね 。 || When the reason doesn't fit, the whole story goes wrong.
> {理由|りゆう} が {合|あ}わへん と 、 {話|はなし} が {全部|ぜんぶ} おかしく なる から な 。 || When the reason doesn't fit, the whole story goes wrong.
@ hall/hall.w5.to_drink [hall.w5.to_drink]
= {東|ひがし} だ から {甘|あま}い 、 {西|にし} だ から {苦|にが}い 、 じゃ ない ん だ ね 。 {理由|りゆう} を {最後|さいご} まで {読|よ}まない と 。 || It's not "east, so sweet" and "west, so bitter". You have to read the reason to the end.
> {東|ひがし} や から {甘|あま}い 、 {西|にし} や から {苦|にが}い 、 ちゃう ん や な 。 {理由|りゆう} を {最後|さいご} まで {読|よ}まへん と あかん で 。 || It's not "east, so sweet" and "west, so bitter". You have to read the reason to the end.
@ hall/hall.w5.t6 [hall.w5.t6]
= {古|ふる}い {台本|だいほん} を {読|よ}む の は 、 {慣|な}れてる わ 。 {任|まか}せて 。 {何|なに} を {見|み}る ？ || I'm used to reading old scripts. Leave it to me. What am I looking for?
> {古|ふる}い {台本|だいほん} を {読|よ}む の は 、 {慣|な}れてる で 。 {任|まか}せとき 。 {何|なに} を {見|み}たら ええ ？ || I'm used to reading old scripts. Leave it to me. What am I looking for?
@ hall/hall.w5.m_willow [hall.w5.m_willow]
= {記録|きろく} の {言葉|ことば} 、 もう {一度|いちど} {言|い}おう か ？ || Shall I say what the record said again?
> {記録|きろく} の {言葉|ことば} 、 もう {一回|いっかい} {言|い}おう か ？ || Shall I say what the record said again?
@ hall/hall.w5.m_willow [hall.w5.m_willow]
= {理由|りゆう} が {分|わ}かれば 、 {直|なお}し {方|かた} も {分|わ}かる 。 {誰|だれ} の せい でも なかった ね 。 || Know the reason and you know the remedy. It was nobody's fault after all.
> {理由|りゆう} が {分|わ}かったら 、 {直|なお}し {方|かた} も {分|わ}かる 。 {誰|だれ} の せい でも なかった ん や な 。 || Know the reason and you know the remedy. It was nobody's fault after all.
@ hall/hall.w5.t8_board [hall.w5.t8_board]
= {誰|だれ} に {何|なに} が できる か 、 {理由|りゆう} を {聞|き}いて から {決|き}めよう 。 || Let's hear everyone's reasons before we decide who does what.
> {誰|だれ} に {何|なに} が できる か 、 {理由|りゆう} を {聞|き}いて から {決|き}めよ か 。 || Let's hear everyone's reasons before we decide who does what.
@ hall/hall.w5.h_kota [hall.w5.h_kota]
= できない {理由|りゆう} を {聞|き}けば 、 できる こと も {分|わ}かる 。 {上手|うま}く {分|わ}けられた ね 。 || Hear why someone can't, and you learn what they can. Nicely shared out.
> できへん {理由|りゆう} を {聞|き}いたら 、 できる こと も {分|わ}かる 。 {上手|うま}い こと {分|わ}けられた な 。 || Hear why someone can't, and you learn what they can. Nicely shared out.
@ hall/hall.w5.end [hall.w5.end]
= {第|だい}{五幕|ごまく} 、 {幕|まく} ！ {悪役|あくやく} なし の {大団円|だいだんえん} よ 。 {拍手|はくしゅ} ！ || End of act five! A happy ending with no villain. Applause!
> {第|だい}{五幕|ごまく} 、 {幕|まく} や ！ {悪役|あくやく} なし の {大団円|だいだんえん} や で 。 {拍手|はくしゅ} 、 たのむ で ！ || End of act five! A happy ending with no villain. Applause!
@ hall/hall.w6.f1_first [hall.w6.f1_first]
= {第|だい}{六幕|ろくまく} は 、 {関所|せきしょ} の {場|ば} ね 。 {関所|せきしょ} の {芝居|しばい} に は 、 {名場面|めいばめん} が {多|おお}い の よ 。 || Act six: the barrier scene. Barrier plays are full of famous scenes.
> {第|だい}{六幕|ろくまく} は 、 {関所|せきしょ} の {場|ば} や な 。 {関所|せきしょ} の {芝居|しばい} に は 、 {名場面|めいばめん} が {多|おお}い ん や で 。 || Act six: the barrier scene. Barrier plays are full of famous scenes.
@ hall/hall.w6.f2_first [hall.w6.f2_first]
= {暗|くら}く なる {前|まえ} に 、 {灯籠|とうろう} を {灯|とも}さない と 。 でも 、 {決|き}まり が ある みたい だ ね 。 || We should light the lanterns before it's dark. But there seems to be a rule.
> {暗|くら}く なる {前|まえ} に 、 {灯籠|とうろう} を {灯|とも}さへん と 。 でも 、 {決|き}まり が ある みたい や な 。 || We should light the lanterns before it's dark. But there seems to be a rule.
@ hall/hall.w6.f3_first [hall.w6.f3_first]
= {幕|まく} が {上|あ}がる と 、 {門|もん} の {前|まえ} に {母|はは} と {子|こ} 。 {泣|な}かせる {場面|ばめん} の {始|はじ}まり よ 。 || Curtain up on a mother and child before the gate. The start of a tear-jerker.
> {幕|まく} が {上|あ}がったら 、 {門|もん} の {前|まえ} に {母|はは} と {子|こ} 。 {泣|な}かせる {場面|ばめん} の {始|はじ}まり や で 。 || Curtain up on a mother and child before the gate. The start of a tear-jerker.
@ hall/hall.w6.ibuki [hall.w6.ibuki]
= {札|ふだ} の {決|き}まり 、 {先|さき} に {読|よ}もう 。 {例外|れいがい} が {多|おお}そう だ 。 || Let's read the board first. Looks like lots of exceptions.
> {札|ふだ} の {決|き}まり 、 {先|さき} に {読|よ}もう や 。 {例外|れいがい} が {多|おお}そう や で 。 || Let's read the board first. Looks like lots of exceptions.
@ hall/hall.w6.t1 [hall.w6.t1]
= {最後|さいご} の {一行|いちぎょう} を {書|か}かない {台本|だいほん} 。 {役者|やくしゃ} を {信|しん}じて いる の ね 。 || A script that leaves out its last line. It trusts its actors.
> {最後|さいご} の {一行|いちぎょう} を {書|か}かへん {台本|だいほん} 。 {役者|やくしゃ} を {信|しん}じてる ん や な 。 || A script that leaves out its last line. It trusts its actors.
@ hall/hall.w6.n_ofuku [hall.w6.n_ofuku]
= {決|き}まり の {通|とお}り 。 「 ても 」 と 「 ただし 」 を {見落|みお}とさなくて よかった 。 || All by the board. Good thing we didn't miss the "even if" and the "however".
> {決|き}まり の {通|とお}り や 。 「 ても 」 と 「 ただし 」 を {見落|みお}とさへん で よかった わ 。 || All by the board. Good thing we didn't miss the "even if" and the "however".
@ hall/hall.w6.t3 [hall.w6.t3]
= {条件|じょうけん} が {合|あ}わない と 、 {言葉|ことば} が {全部|ぜんぶ} {逆|さか}さま に なる から ね 。 || When the condition doesn't fit, the whole saying comes out backwards.
> {条件|じょうけん} が {合|あ}わへん と 、 {言葉|ことば} が {全部|ぜんぶ} {逆|さか}さま に なる から な 。 || When the condition doesn't fit, the whole saying comes out backwards.
@ hall/hall.w6.l_foot [hall.w6.l_foot]
= 「 {全部|ぜんぶ} {灯|とも}す 」 で も 、 「 ただし 」 が {一|ひと}つ 。 {例外|れいがい} を {見落|みお}とさなくて よかった 。 || "Light them all", with one "however". Good thing we didn't miss the exception.
> 「 {全部|ぜんぶ} {灯|とも}す 」 で も 、 「 ただし 」 が {一|ひと}つ 。 {例外|れいがい} を {見落|みお}とさへん で よかった わ 。 || "Light them all", with one "however". Good thing we didn't miss the exception.
@ hall/hall.w6.t6 [hall.w6.t6]
= {滲|にじ}んだ {台本|だいほん} なら 、 {何度|なんど} も {読|よ}んだ わ 。 {任|まか}せて 。 {何|なに} を {探|さが}す ？ || I've read plenty of smudged scripts. Leave it to me. What am I looking for?
> {滲|にじ}んだ {台本|だいほん} やったら 、 {何度|なんど} も {読|よ}んだ で 。 {任|まか}せとき 。 {何|なに} を {探|さが}したら ええ ？ || I've read plenty of smudged scripts. Leave it to me. What am I looking for?
@ hall/hall.w6.x_momo [hall.w6.x_momo]
= {帳面|ちょうめん} の {言葉|ことば} 、 もう {一度|いちど} {言|い}おう か ？ || Shall I say what the ledger said again?
> {帳面|ちょうめん} の {言葉|ことば} 、 もう {一回|いっかい} {言|い}おう か ？ || Shall I say what the ledger said again?
@ hall/hall.w6.x_momo [hall.w6.x_momo]
= {夜|よる} は {通|とお}さない 。 ただし 、 {一|ひと}つ だけ {例外|れいがい} が ある 。 {読|よ}んで よかった ね 。 || Nobody after dark, except in one case. Good thing we read it.
> {夜|よる} は {通|とお}さへん 。 ただし 、 {一|ひと}つ だけ {例外|れいがい} が ある 。 {読|よ}んで よかった な 。 || Nobody after dark, except in one case. Good thing we read it.
@ hall/hall.w6.t8_board [hall.w6.t8_board]
= どの {場合|ばあい} に 、 {何|なに} を する の か 。 {合|あ}う {組|く}み{合|あ}わせ を {探|さが}そう 。 || Which case calls for what. Let's find what goes together.
> どの {場合|ばあい} に 、 {何|なに} を する ん か 。 {合|あ}う {組|く}み{合|あ}わせ を {探|さが}して みよ か 。 || Which case calls for what. Let's find what goes together.
@ hall/hall.w6.h1 [hall.w6.h1]
= {雨|あめ} なら {傘|かさ} 、 {暗|くら}く なったら {提灯|ちょうちん} 。 {決|き}まり と いう より 、 {親切|しんせつ} の {一覧|いちらん} だ ね 。 || An umbrella if it rains, a lantern once it's dark. Less a list of rules than a list of kindnesses.
> {雨|あめ} やったら {傘|かさ} 、 {暗|くら}く なったら {提灯|ちょうちん} 。 {決|き}まり と いう より 、 {親切|しんせつ} の {一覧|いちらん} や な 。 || An umbrella if it rains, a lantern once it's dark. Less a list of rules than a list of kindnesses.
@ hall/hall.w6.otsuta [hall.w6.otsuta]
= …… イブキ と {話|はな}そう 。 || …Let's talk to Ibuki.
> …… イブキ と {話|はな}して みよ か 。 || …Let's talk to Ibuki.
@ hall/hall.w6.end [hall.w6.end]
= {第|だい}{六幕|ろくまく} 、 {幕|まく} ！ {門番|もんばん} が {門|もん} を {開|あ}ける {場面|ばめん} は 、 {何度|なんど} {見|み}て も {泣|な}ける わ 。 || End of act six! The scene where the gatekeeper opens the gate makes me cry every time.
> {第|だい}{六幕|ろくまく} 、 {幕|まく} や ！ {門番|もんばん} が {門|もん} を {開|あ}ける {場面|ばめん} は 、 {何度|なんど} {見|み}て も {泣|な}ける ん や わ 。 || End of act six! The scene where the gatekeeper opens the gate makes me cry every time.
@ hall/hall.w7.f1_first [hall.w7.f1_first]
= {第|だい}{七幕|ななまく} は 、 {誰|だれ} も {出|で}て こない {芝居|しばい} ね 。 {台詞|せりふ} の ない {役|やく} が 、 {一番|いちばん} {難|むずか}しい の よ 。 || Act seven: a play where nobody comes on. The part with no lines is the hardest.
> {第|だい}{七幕|ななまく} は 、 {誰|だれ} も {出|で}て こない {芝居|しばい} や な 。 {台詞|せりふ} の ない {役|やく} が 、 {一番|いちばん} {難|むずか}しい ん や で 。 || Act seven: a play where nobody comes on. The part with no lines is the hardest.
@ hall/hall.w7.f2_first [hall.w7.f2_first]
= …… {誰|だれ} も いない のに 、 {誰|だれ} か の {話|はな}し{声|ごえ} が {聞|き}こえる よう な {気|き}が する 。 || …There's nobody here, but it feels as if I can hear someone talking.
> …… {誰|だれ} も おらへん のに 、 {誰|だれ} か の {話|はな}し{声|ごえ} が {聞|き}こえる よう な {気|き}が する わ 。 || …There's nobody here, but it feels as if I can hear someone talking.
@ hall/hall.w7.f3_first [hall.w7.f3_first]
= {出|で}た ！ {欲張|よくば}り な {隣|となり} の {人|ひと} 。 この {役|やく} 、 {昔話|むかしばなし} で は {大抵|たいてい} {損|そん} を する の よ ね 。 || There he is! The greedy neighbour. In the old tales, that part usually comes off worst.
> {出|で}た ！ {欲張|よくば}り な {隣|となり} の {人|ひと} や 。 この {役|やく} 、 {昔話|むかしばなし} で は {大抵|たいてい} {損|そん} する ん や で 。 || There he is! The greedy neighbour. In the old tales, that part usually comes off worst.
@ hall/hall.w7.owan [hall.w7.owan]
= {札|ふだ} に は 、 {何|なに} の こと か 、 {書|か}いて ない ね 。 {読|よ}めば {分|わ}かる の かな 。 || The notes don't say what they mean. I suppose you can tell by reading them.
> {札|ふだ} に は 、 {何|なに} の こと か 、 {書|か}いて ない な 。 {読|よ}んだら {分|わ}かる ん やろ か 。 || The notes don't say what they mean. I suppose you can tell by reading them.
@ hall/hall.w7.t1 [hall.w7.t1]
= {一番|いちばん} {大事|だいじ} な {人|ひと} が 、 {一度|いちど} も {出|で}て こない {話|はなし} 。 {粋|いき} だ わ 。 || A tale where the most important one never once comes on stage. Very stylish.
> {一番|いちばん} {大事|だいじ} な {人|ひと} が 、 {一回|いっかい} も {出|で}て こない {話|はなし} 。 {粋|いき} や わ 。 || A tale where the most important one never once comes on stage. Very stylish.
@ hall/hall.w7.h1 [hall.w7.h1]
= {何|なに} の こと か {書|か}いて ない のに 、 {読|よ}めば {分|わ}かる 。 {書|か}いた {人|ひと} も 、 {分|わ}かる と {思|おも}って {書|か}いた ん だ ね 。 || None of them says what it means, and yet you can tell. Whoever wrote them trusted the reader to know.
> {何|なに} の こと か {書|か}いて ない のに 、 {読|よ}んだら {分|わ}かる 。 {書|か}いた {人|ひと} も 、 {分|わ}かる と {思|おも}って {書|か}いた ん や な 。 || None of them says what it means, and yet you can tell. Whoever wrote them trusted the reader to know.
@ hall/hall.w7.t3 [hall.w7.t3]
= 「 あれ 」 も 「 それ 」 も 、 {相手|あいて} が {何|なに} を {知|し}って いる か で {決|き}まる ん だ ね 。 || Are or sore: which one you say depends on what the other person knows.
> 「 あれ 」 も 「 それ 」 も 、 {相手|あいて} が {何|なに} を {知|し}ってる か で {決|き}まる ん や な 。 || Are or sore: which one you say depends on what the other person knows.
@ hall/hall.w7.c_kettle [hall.w7.c_kettle]
= {何|なに} を 、 と は {一言|ひとこと} も {書|か}いて ない のに 、 {台所|だいどころ} に {立|た}つ と {分|わ}かる 。 {毎日|まいにち} の こと だ から だ ね 。 || It never once says what, and yet standing in the kitchen you know. Because it's the same every day.
> {何|なに} を 、 と は {一言|ひとこと} も {書|か}いて ない のに 、 {台所|だいどころ} に {立|た}ったら {分|わ}かる 。 {毎日|まいにち} の こと や から な 。 || It never once says what, and yet standing in the kitchen you know. Because it's the same every day.
@ hall/hall.w7.t6 [hall.w7.t6]
= {古|ふる}い {手紙|てがみ} は 、 {役|やく} の {下調|したしら}べ で {何度|なんど} も {読|よ}んだ わ 。 {任|まか}せて 。 {何|なに} を {探|さが}す ？ || I've read plenty of old letters preparing for parts. Leave it to me. What am I looking for?
> {古|ふる}い {手紙|てがみ} は 、 {役|やく} の {下調|したしら}べ で {何回|なんかい} も {読|よ}んだ で 。 {任|まか}せとき 。 {何|なに} を {探|さが}したら ええ ？ || I've read plenty of old letters preparing for parts. Leave it to me. What am I looking for?
@ hall/hall.w7.m_comb [hall.w7.m_comb]
= {手紙|てがみ} の {言葉|ことば} 、 もう {一度|いちど} {言|い}おう か ？ || Shall I say what the letter said again?
> {手紙|てがみ} の {言葉|ことば} 、 もう {一回|いっかい} {言|い}おう か ？ || Shall I say what the letter said again?
@ hall/hall.w7.m_comb [hall.w7.m_comb]
= {名前|なまえ} を {書|か}かなくて も 、 {家族|かぞく} に は {分|わ}かった ん だ ね 。 {分|わ}かる {人|ひと} に {向|む}けて {書|か}いた {手紙|てがみ} だ 。 || Even without naming it, the family would have known. It was written for someone who would understand.
> {名前|なまえ} を {書|か}かなくて も 、 {家族|かぞく} に は {分|わ}かった ん や な 。 {分|わ}かる {人|ひと} に {向|む}けて {書|か}いた {手紙|てがみ} や 。 || Even without naming it, the family would have known. It was written for someone who would understand.
@ hall/hall.w7.b_rl [hall.w7.b_rl]
= 「 {赤|あか}い の 」 「 さっき の 」 。 {名前|なまえ} を {言|い}わなくて も 、 {話|はなし} の {流|なが}れ で {分|わ}かる ね 。 || "The red one", "the one from before": no names needed, the conversation carries it.
> 「 {赤|あか}い の 」 「 さっき の 」 。 {名前|なまえ} を {言|い}わなくて も 、 {話|はなし} の {流|なが}れ で {分|わ}かる な 。 || "The red one", "the one from before": no names needed, the conversation carries it.
@ hall/hall.w7.end [hall.w7.end]
= {第|だい}{七幕|ななまく} 、 {幕|まく} ！ {台詞|せりふ} の ない {場面|ばめん} ほど 、 お{客|きゃく} は {聞|き}き{入|い}る もの よ 。 || End of act seven! The scenes with no lines are the ones audiences lean in for.
> {第|だい}{七幕|ななまく} 、 {幕|まく} や ！ {台詞|せりふ} の ない {場面|ばめん} ほど 、 お{客|きゃく} は {聞|き}き{入|い}る もん や で 。 || End of act seven! The scenes with no lines are the ones audiences lean in for.
@ hall/hall.w8.f1_first [hall.w8.f1_first]
= {第|だい}{八幕|はちまく} は 、 {推理|すいり} の {芝居|しばい} ね 。 {証人|しょうにん} が {三人|さんにん} 、 {話|はなし} が {三|みっ}つ 。 {面白|おもしろ}く なり そう 。 || Act eight: a detective play. Three witnesses, three stories. This should be good.
> {第|だい}{八幕|はちまく} は 、 {推理|すいり} の {芝居|しばい} や な 。 {証人|しょうにん} が {三人|さんにん} 、 {話|はなし} が {三|みっ}つ 。 {面白|おもしろ}く なり そう や わ 。 || Act eight: a detective play. Three witnesses, three stories. This should be good.
@ hall/hall.w8.f2_first [hall.w8.f2_first]
= {証人|しょうにん} が {立|た}って いた {場所|ばしょ} に {行|い}けば 、 {本当|ほんとう} に {見|み}えた か 、 {聞|き}こえた か 、 {確|たし}かめられる ね 。 || If we go to where each witness was, we can check whether they really could have seen or heard it.
> {証人|しょうにん} が {立|た}ってた {場所|ばしょ} に {行|い}ったら 、 {本当|ほんとう} に {見|み}えた か 、 {聞|き}こえた か 、 {確|たし}かめられる な 。 || If we go to where each witness was, we can check whether they really could have seen or heard it.
@ hall/hall.w8.f3_first [hall.w8.f3_first]
= {大詰|おおづ}め の {前|まえ} の {言|い}い{争|あらそ}い 。 {推理|すいり} {劇|げき} の {定番|ていばん} よ 。 || An argument before the final scene. Every whodunit has one.
> {大詰|おおづ}め の {前|まえ} の {言|い}い{争|あらそ}い や 。 {推理|すいり} {劇|げき} の {定番|ていばん} や で 。 || An argument before the final scene. Every whodunit has one.
@ hall/hall.w8.t1 [hall.w8.t1]
= {証人|しょうにん} が {三人|さんにん} 、 {誰|だれ} も {嘘|うそ} は ついて ない 。 でも {誰|だれ} も {全部|ぜんぶ} は {知|し}らない 。 {上手|じょうず} な {脚本|きゃくほん} ね 。 || Three witnesses, none of them lying, none of them knowing it all. Clever writing.
> {証人|しょうにん} が {三人|さんにん} 、 {誰|だれ} も {嘘|うそ} は ついて ない 。 でも {誰|だれ} も {全部|ぜんぶ} は {知|し}らへん 。 {上手|じょうず} な {脚本|きゃくほん} や な 。 || Three witnesses, none of them lying, none of them knowing it all. Clever writing.
@ hall/hall.w8.to_seen [hall.w8.to_seen]
= {見|み}た 、 {聞|き}こえた 、 {聞|き}いた 、 {思|おも}った 。 {分|わ}けて みる と 、 {狐|きつね} の {話|はなし} は {一枚|いちまい} も 「 {見|み}た 」 に {入|はい}って いない ね 。 || Seen, heard, told, guessed. Sorted, not one slip about the fox is in "seen".
> {見|み}た 、 {聞|き}こえた 、 {聞|き}いた 、 {思|おも}った 。 {分|わ}けて みたら 、 {狐|きつね} の {話|はなし} は {一枚|いちまい} も 「 {見|み}た 」 に {入|はい}って ない な 。 || Seen, heard, told, guessed. Sorted, not one slip about the fox is in "seen".
@ hall/hall.w8.t3 [hall.w8.t3]
= どれ だけ {確|たし}か か を {言|い}い{間違|まちが}える と 、 {話|はなし} が {全部|ぜんぶ} {信用|しんよう} できなく なる から ね 。 || Get how sure you are wrong, and nobody can trust any of it.
> どれ だけ {確|たし}か か を {言|い}い{間違|まちが}えたら 、 {話|はなし} が {全部|ぜんぶ} {信用|しんよう} できなく なる から な 。 || Get how sure you are wrong, and nobody can trust any of it.
@ hall/hall.w8.p_kitchen [hall.w8.p_kitchen]
= {本人|ほんにん} が {確|たし}か だ と {思|おも}って いて も 、 {場所|ばしょ} を {見|み}る と {違|ちが}う こと も ある 。 {嘘|うそ} じゃ なくて 、 {思|おも}い{込|こ}み だ ね 。 || Even when someone is sure, the place itself can show otherwise. Not a lie: a mistaken belief.
> {本人|ほんにん} が {確|たし}か や と {思|おも}って いて も 、 {場所|ばしょ} を {見|み}たら {違|ちが}う こと も ある 。 {嘘|うそ} や なくて 、 {思|おも}い{込|こ}み や な 。 || Even when someone is sure, the place itself can show otherwise. Not a lie: a mistaken belief.
@ hall/hall.w8.t6 [hall.w8.t6]
= {子供|こども} の {字|じ} は 、 {子役|こやく} の {台本|だいほん} で {慣|な}れてる わ 。 {任|まか}せて 。 {何|なに} を {探|さが}す ？ || I'm used to children's writing from the child actors' scripts. Leave it to me. What am I looking for?
> {子供|こども} の {字|じ} は 、 {子役|こやく} の {台本|だいほん} で {慣|な}れてる で 。 {任|まか}せとき 。 {何|なに} を {探|さが}したら ええ ？ || I'm used to children's writing from the child actors' scripts. Leave it to me. What am I looking for?
@ hall/hall.w8.r_east [hall.w8.r_east]
= {書|か}き{置|お}き の {言葉|ことば} 、 もう {一度|いちど} {言|い}おう か ？ || Shall I say what the note said again?
> {書|か}き{置|お}き の {言葉|ことば} 、 もう {一回|いっかい} {言|い}おう か ？ || Shall I say what the note said again?
@ hall/hall.w8.r_east [hall.w8.r_east]
= 「 そう だ 」 も 「 らしい 」 も 、 {人|ひと} から {聞|き}いた {話|はなし} 。 でも 、 ヒサ は それ を {信|しん}じて {歩|ある}いて いった ん だ ね 。 || Whether it's そうだ or らしい, it's something Hisa heard. And Hisa trusted it, and walked.
> 「 そう だ 」 も 「 らしい 」 も 、 {人|ひと} から {聞|き}いた {話|はなし} や 。 でも 、 ヒサ は それ を {信|しん}じて {歩|ある}いて いった ん や な 。 || Whether it's そうだ or らしい, it's something Hisa heard. And Hisa trusted it, and walked.
@ hall/hall.w8.t8_board [hall.w8.t8_board]
= {名札|なふだ} を 、 {合|あ}う {足跡|あしあと} に {置|お}いて いこう 。 || Let's set each name tag by the prints that match.
> {名札|なふだ} を 、 {合|あ}う {足跡|あしあと} に {置|お}いて みよ か 。 || Let's set each name tag by the prints that match.
@ hall/hall.w8.pr1 [hall.w8.pr1]
= {見|み}た {話|はなし} 、 {聞|き}こえた {話|はなし} 、 {聞|き}いた {話|はなし} 。 {全部|ぜんぶ} {合|あ}わせる と 、 {雪|ゆき} の {上|うえ} で {一|ひと}つ に なった ね 。 || What was seen, heard and told: put together, it all comes to one thing in the snow.
> {見|み}た {話|はなし} 、 {聞|き}こえた {話|はなし} 、 {聞|き}いた {話|はなし} 。 {全部|ぜんぶ} {合|あ}わせたら 、 {雪|ゆき} の {上|うえ} で {一|ひと}つ に なった な 。 || What was seen, heard and told: put together, it all comes to one thing in the snow.
@ hall/hall.w8.end [hall.w8.end]
= {第|だい}{八幕|はちまく} 、 {幕|まく} ！ {犯人|はんにん} の いない {推理|すいり} {劇|げき} 、 {案外|あんがい} {悪|わる}く ない わ 。 || End of act eight! A whodunit with no culprit. Not bad at all.
> {第|だい}{八幕|はちまく} 、 {幕|まく} や ！ {犯人|はんにん} の おらへん {推理|すいり} {劇|げき} 、 {案外|あんがい} {悪|わる}く ない で 。 || End of act eight! A whodunit with no culprit. Not bad at all.
@ hall/hall.w9.f1_first [hall.w9.f1_first]
= {第|だい}{九幕|きゅうまく} は 、 {鶴|つる} の {恩返|おんがえ}し 。 これ は {泣|な}ける {話|はなし} よ 。 || Act nine: The Crane's Return. This one's a weepie.
> {第|だい}{九幕|きゅうまく} は 、 {鶴|つる} の {恩返|おんがえ}し 。 これ は {泣|な}ける {話|はなし} や で 。 || Act nine: The Crane's Return. This one's a weepie.
@ hall/hall.w9.f2_first [hall.w9.f2_first]
= {囲炉裏|いろり} の {席|せき} に も 、 {決|き}まり が ある みたい だ ね 。 || Even the seats round the hearth seem to have rules.
> {囲炉裏|いろり} の {席|せき} に も 、 {決|き}まり が ある みたい や な 。 || Even the seats round the hearth seem to have rules.
@ hall/hall.w9.f3_first [hall.w9.f3_first]
= いよいよ {大詰|おおづ}め ね 。 {覗|のぞ}く か 、 {覗|のぞ}かない か 。 || The final act at last. To look, or not to look.
> いよいよ {大詰|おおづ}め や な 。 {覗|のぞ}く か 、 {覗|のぞ}かへん か 。 || The final act at last. To look, or not to look.
@ hall/hall.w9.t1 [hall.w9.t1]
= {約束|やくそく} を {破|やぶ}る {場面|ばめん} 、 {毎回|まいかい} 「 やめて 」 って {言|い}いたく なる の よ ね 。 || Every time we reach the part where they break the promise, I want to shout "don't".
> {約束|やくそく} を {破|やぶ}る {場面|ばめん} 、 {毎回|まいかい} 「 やめて 」 って {言|い}いたく なる わ 。 || Every time we reach the part where they break the promise, I want to shout "don't".
@ hall/hall.w9.to_otoku [hall.w9.to_otoku]
= {奥|おく}さん に は {普通|ふつう} に 、 {子供|こども} に は {優|やさ}しく 、 {店|みせ} の {人|ひと} に は {丁寧|ていねい} に 、 {殿|との}さま の {使|つか}い に は うんと {丁寧|ていねい} に 。 {同|おな}じ {人|ひと} が 、 {四|よっ}つ の {話|はな}し{方|かた} を して いた ね 。 || Plain with his wife, gentle with a child, polite with the shopkeeper, very polite with the lord's man. One man, four ways of talking.
> {奥|おく}さん に は {普通|ふつう} に 、 {子供|こども} に は {優|やさ}しく 、 {店|みせ} の {人|ひと} に は {丁寧|ていねい} に 、 {殿|との}さま の {使|つか}い に は うんと {丁寧|ていねい} に 。 {同|おな}じ {人|ひと} や のに 、 {話|はな}し{方|かた} が {四|よっ}つ も あった な 。 || Plain with his wife, gentle with a child, polite with the shopkeeper, very polite with the lord's man. One man, four ways of talking.
@ hall/hall.w9.t3 [hall.w9.t3]
= {言葉|ことば} は {合|あ}って いて も 、 {相手|あいて} を {間違|まちが}える と {失礼|しつれい} に なる ん だ ね 。 || The words can be right and still be rude, if they're aimed at the wrong person.
> {言葉|ことば} は {合|あ}って いて も 、 {相手|あいて} を {間違|まちが}えたら {失礼|しつれい} に なる ん や な 。 || The words can be right and still be rude, if they're aimed at the wrong person.
@ hall/hall.w9.t4_board [hall.w9.t4_board]
= {名札|なふだ} を 、 {今夜|こんや} の {席|せき} に {置|お}いて いこう 。 || Let's set each name tag on tonight's seat.
> {名札|なふだ} を 、 {今夜|こんや} の {席|せき} に {置|お}いて みよ か 。 || Let's set each name tag on tonight's seat.
@ hall/hall.w9.seat_yokoza [hall.w9.seat_yokoza]
= お{客|きゃく}さん は {客座|きゃくざ} 。 …… {今夜|こんや} の あの {人|ひと} は 、 まだ お{客|きゃく}さん なん だ ね 。 || The guest takes the guest's seat. …Tonight she is still a guest.
> お{客|きゃく}さん は {客座|きゃくざ} 。 …… {今夜|こんや} の あの {人|ひと} は 、 まだ お{客|きゃく}さん なん や な 。 || The guest takes the guest's seat. …Tonight she is still a guest.
@ hall/hall.w9.seat_yokoza [hall.w9.seat_yokoza]
= {木尻|きじり} に {座|すわ}る の は 、 {家族|かぞく} に なった しるし だ ね 。 || Sitting by the firewood is a sign she has become family.
> {木尻|きじり} に {座|すわ}る の は 、 {家族|かぞく} に なった しるし や な 。 || Sitting by the firewood is a sign she has become family.
@ hall/hall.w9.t6 [hall.w9.t6]
= {頼|たの}み なら 、 {私|わたし} が {聞|き}いて おいた わ 。 {何|なに} が {知|し}りたい ？ || I heard her request. What do you want to know?
> {頼|たの}み なら 、 うち が {聞|き}いた で 。 {何|なに} が {知|し}りたい ん ？ || I heard her request. What do you want to know?
@ hall/hall.w9.d_meal [hall.w9.d_meal]
= {頼|たの}み の {言葉|ことば} 、 もう {一度|いちど} {言|い}おう か ？ || Shall I say what she asked again?
> {頼|たの}み の {言葉|ことば} 、 もう {一回|いっかい} {言|い}う ？ {任|まか}せとき 。 || Shall I say what she asked again?
@ hall/hall.w9.d_meal [hall.w9.d_meal]
= {頼|たの}まれた こと を して 、 {頼|たの}まれて いない こと は しない 。 それ も 、 {相手|あいて} を {大事|だいじ} に する {方法|ほうほう} だ ね 。 || Doing what you're asked, and nothing you're not: that's a way of caring for someone, too.
> {頼|たの}まれた こと を して 、 {頼|たの}まれて いない こと は しない 。 それ も 、 {相手|あいて} を {大事|だいじ} に する やり{方|かた} や な 。 || Doing what you're asked, and nothing you're not: that's a way of caring for someone, too.
@ hall/hall.w9.post_hearth [hall.w9.post_hearth]
= {同|おな}じ {注文|ちゅうもん} が 、 {門|もん} で は {仰|おお}せ 、 {店|みせ} で は ご{注文|ちゅうもん} 、 {家|いえ} で は 「 {欲|ほ}しい そう だ 」 に なった 。 {言葉|ことば} は 、 {相手|あいて} に {合|あ}わせて {着替|きが}える ん だ ね 。 || The same order was a decree at the gate, a commission at the shop and "he wants" at home. Words change their clothes to suit the listener.
> {同|おな}じ {注文|ちゅうもん} が 、 {門|もん} で は {仰|おお}せ 、 {店|みせ} で は ご{注文|ちゅうもん} 、 {家|いえ} で は 「 {欲|ほ}しい そう だ 」 に なった 。 {言葉|ことば} は 、 {相手|あいて} に {合|あ}わせて {着替|きが}える ん や な 。 || The same order was a decree at the gate, a commission at the shop and "he wants" at home. Words change their clothes to suit the listener.
@ hall/hall.w9.end [hall.w9.end]
= {第|だい}{九幕|きゅうまく} 、 {幕|まく} 。 …… {泣|な}かせる {芝居|しばい} だった わ 。 || End of act nine. …That one got me.
> {第|だい}{九幕|きゅうまく} 、 {幕|まく} 。 …… {泣|な}かせる {芝居|しばい} やった わ 。 || End of act nine. …That one got me.
@ hall/hall.w10.f1_first [hall.w10.f1_first]
= {最終幕|さいしゅうまく} の {舞台|ぶたい} は 、 {私|わたし} たち の {旅|たび} 。 {演出|えんしゅつ} 、 {憎|にく}い わ ね 。 || The last act is set on our own journey. Whoever staged this knows what they're doing.
> {最終幕|さいしゅうまく} の {舞台|ぶたい} は 、 うちら の {旅|たび} 。 {演出|えんしゅつ} 、 {憎|にく}い な あ 。 || The last act is set on our own journey. Whoever staged this knows what they're doing.
@ hall/hall.w10.f2_first [hall.w10.f2_first]
= {九|ここの}つ の {灯|ひ} 、 {全部|ぜんぶ} {見覚|みおぼ}え が ある ね 。 || All nine lights look familiar.
> {九|ここの}つ の {灯|ひ} 、 {全部|ぜんぶ} {見覚|みおぼ}え が ある な 。 || All nine lights look familiar.
@ hall/hall.w10.f3_first [hall.w10.f3_first]
= {大詰|おおづ}め の {大詰|おおづ}め ね 。 {客席|きゃくせき} は 、 {満員|まんいん} よ 。 || The very last scene. And a full house.
> {大詰|おおづ}め の {大詰|おおづ}め や な 。 {客席|きゃくせき} は 、 {満員|まんいん} や で 。 || The very last scene. And a full house.
@ hall/hall.w10.t1 [hall.w10.t1]
= {主役|しゅやく} は あなた 。 {脇役|わきやく} は {私|わたし} 。 {悪|わる}く ない {配役|はいやく} よ 。 || You in the lead, me in support. Not bad casting.
> {主役|しゅやく} は あんた 。 {脇役|わきやく} は うち 。 ええ {配役|はいやく} や わ 。 || You in the lead, me in support. Not bad casting.
@ hall/hall.w10.t2_board [hall.w10.t2_board]
= {札|ふだ} を 、 {通|とお}った {順|じゅん} に {道標|みちしるべ} へ {置|お}いて いこう 。 || Let's set the tablets on the waystones in the order we passed through.
> {札|ふだ} を 、 {通|とお}った {順|じゅん} に {道標|みちしるべ} へ {置|お}いて みよ か 。 || Let's set the tablets on the waystones in the order we passed through.
@ hall/hall.w10.st1 [hall.w10.st1]
= {一|ひと}つ {一|ひと}つ は {寄|よ}り{道|みち} みたい だった けど 、 {並|なら}べる と ちゃんと {道|みち} に なって いる ね 。 || Each one felt like a detour at the time, but laid out together they make a road.
> {一|ひと}つ {一|ひと}つ は {寄|よ}り{道|みち} みたい やった けど 、 {並|なら}べたら ちゃんと {道|みち} に なって いる な 。 || Each one felt like a detour at the time, but laid out together they make a road.
@ hall/hall.w10.t3 [hall.w10.t3]
= {全部|ぜんぶ} 、 どこ か で {一度|いちど} {習|なら}った こと だ 。 {忘|わす}れて ない もの だ ね 。 || Every one of them something we learned somewhere along the way. We haven't forgotten.
> {全部|ぜんぶ} 、 どこ か で {一回|いっかい} {習|なら}った こと や 。 ちゃんと {覚|おぼ}えて いる もん や な 。 || Every one of them something we learned somewhere along the way. We haven't forgotten.
@ hall/hall.w10.to_w1 [hall.w10.to_w1]
= {道|みち} を {聞|き}く の も 、 {断|ことわ}る の も 、 {人|ひと} の {話|はなし} を {伝|つた}える の も 、 {全部|ぜんぶ} この {館|やかた} で {練習|れんしゅう} した ん だ ね 。 || Asking the way, saying no, passing on what someone said: we practiced all of it in this Hall.
> {道|みち} を {聞|き}く の も 、 {断|ことわ}る の も 、 {人|ひと} の {話|はなし} を {伝|つた}える の も 、 {全部|ぜんぶ} この {館|やかた} で {練習|れんしゅう} した ん や な 。 || Asking the way, saying no, passing on what someone said: we practiced all of it in this Hall.
@ hall/hall.w10.t6 [hall.w10.t6]
= {古|ふる}い {台本|だいほん} の {字|じ} に {似|に}て いる わ 。 {読|よ}んで あげる 。 {何|なに} が {知|し}りたい ？ || It looks like the writing in old scripts. I'll read it for you. What do you want to know?
> {古|ふる}い {台本|だいほん} の {字|じ} に {似|に}て いる わ 。 {任|まか}せとき 。 {何|なに} が {知|し}りたい ん ？ || It looks like the writing in old scripts. I'll read it for you. What do you want to know?
@ hall/hall.w10.k_box [hall.w10.k_box]
= {書|か}き{付|つ}け の {言葉|ことば} 、 もう {一度|いちど} {言|い}おう か ？ || Shall I say what the note said again?
> {書|か}き{付|つ}け の {言葉|ことば} 、 もう {一回|いっかい} {言|い}う ？ {任|まか}せとき 。 || Shall I say what the note said again?
@ hall/hall.w10.k_box [hall.w10.k_box]
= {止|や}めた {人|ひと} たち が 、 {続|つづ}き を {待|ま}って いた ん だ ね 。 || The ones who stopped were waiting for someone to go on.
> {止|や}めた {人|ひと} たち が 、 {続|つづ}き を {待|ま}って いた ん や な 。 || The ones who stopped were waiting for someone to go on.
@ hall/hall.w10.pg4 [hall.w10.pg4]
= {自分|じぶん} の {旅|たび} を 、 {自分|じぶん} の {言葉|ことば} で {書|か}く 。 …… {最初|さいしょ} の {頃|ころ} は 、 {考|かんが}えられなかった ね 。 || Writing your own journey in your own words. …Back at the start, you couldn't have imagined it.
> {自分|じぶん} の {旅|たび} を 、 {自分|じぶん} の {言葉|ことば} で {書|か}く 。 …… {最初|さいしょ} の {頃|ころ} から は 、 {想像|そうぞう} も つかへん な 。 || Writing your own journey in your own words. …Back at the start, you couldn't have imagined it.
@ hall/hall.w10.end [hall.w10.end]
= {百幕|ひゃくまく} 、 {大入|おおい}り {満員|まんいん} 。 …… いい {芝居|しばい} だった わ 。 || A hundred acts, a full house. …A fine show.
> {百幕|ひゃくまく} 、 {大入|おおい}り {満員|まんいん} 。 …… ええ {芝居|しばい} やった わ 。 || A hundred acts, a full house. …A fine show.
@ hall/hall.tsuru_final [hall.tsuru_final]
= ツル さん 、 {帰|かえ}り の {道中|どうちゅう} 、 {退屈|たいくつ} は させません よ 。 || Keeper Tsuru, I won't let you be bored on the way home.
> ツル さん 、 {帰|かえ}り の {道中|どうちゅう} は 、 うち が {盛|も}り{上|あ}げる で 。 || Keeper Tsuru, I won't let you be bored on the way home.
`, 'hall');
