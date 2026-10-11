/* Suzu's Kansai-ben: the Hall of a Hundred Tales (expansion P15): the key ledger, the foyer and wing 1, The Lamp at
 * the Crossroads. Format and rules: src/lang/85_dialect.js, docs/dialect/suzu_kansai.md. "=" the standard line as
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
`, 'hall');
