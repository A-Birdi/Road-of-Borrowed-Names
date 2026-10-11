/* Suzu's Kansai-ben: the Hall of a Hundred Tales (expansion P15): the key ledger, the foyer, wing 1 (The Lamp at
 * the Crossroads) and wing 2 (The Fox's Wedding). Format and rules: src/lang/85_dialect.js, docs/dialect/suzu_kansai.md. "=" the standard line as
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
`, 'hall');
