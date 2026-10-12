/* The Cloudroad, Chapter 10: the companions' beats on the restored relay (expansion P12e; 14_COMPANIONS's Chapter 10;
 * sealed S14). Nao's step is the crossroads at the Mist Barrier (22_scenes_barrier.js); for the others the first
 * runner of the restored relay, the night the chapter ends, carries their Chapter 10 beat, once, with one Bond event
 * (cr:beat, 40_company.js):
 *   Mio   a message from Kikue at the springs beyond the pass, who has heard of her travels: "Come and see the
 *         springs." Mio touches the jar in her bag and says little (her crossroads is Chapter 11's, P13).
 *   Ren   word from Old Hisae, relay to relay: the Keepers' Road is lit at every post again.
 *   Suzu  her reply to Koume, written at last, handed to the runner for the road down to the coast and the troupe.
 * Suzu's lines have Kansai versions (kansai_98_cr.js). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene cr.mio_kikue
!if cr_mio_kikue -> end
!set cr_mio_kikue
cr_jinpachi: ミオ さん に 、 {峠|とうげ} の {向|む}こう から {伝言|でんごん} です 。 {湯|ゆ} の {谷|たに} の キクエ さん から 。 「{噂|うわさ} は {聞|き}いて います 。 {一度|いちど} 、 {湯|ゆ} を {見|み}に いらっしゃい 。」 || A message for Mio from over the pass. From Kikue, in the valley of the springs: "I've heard of your travels. Come and see the springs, once."
comp[surprise]: …… キクエ さん 。 {母|はは} の 、 {古|ふる}い お{友達|ともだち} です 。 || …Kikue. My mother's old friend.
narr: ミオ は {鞄|かばん} の {中|なか} の {瓶|びん} に 、 そっと {手|て} を {当|あ}てた 。 || Mio rests a hand lightly on the jar in her bag.
comp[smile]: …… {大丈夫|だいじょうぶ} です 。 {返事|へんじ} は 、 {自分|じぶん} で {持|も}って {行|い}きます 。 {峠|とうげ} の {向|む}こう まで 。 || …It's all right. I'll take my answer myself. Over the pass.
!hook co_bond cr:beat
:end

@scene cr.ren_lit
!if cr_ren_lit -> end
!set cr_ren_lit
cr_jinpachi: レン さん に 、 {灯落|ひおち} の {方|ほう} から {継|つ}いで {来|き}た {伝言|でんごん} です 。 ヒサエ さん から 。 「{灯守|ひもり} の {道|みち} 、 {全|すべ}て の {灯|ひ} 、 {点|つ}く 。」 || A message for Ren, passed up the relay from Lanternfall's way. From Hisae: "The Keepers' Road: every lamp lit."
comp[surprise]: …… {全|すべ}て の {灯|ひ} 。 ヒサエ さん が 、 {一|ひと}つ ずつ {名前|なまえ} を {呼|よ}んだ ん です ね 。 || …Every lamp. Hisae called them by name, one by one.
?(cr_lamp7) comp[smile]: こちら の {灯|ひ} も 、 {七|なな}つ {全部|ぜんぶ} {点|つ}いた と 、 {返事|へんじ} を {継|つ}いで ください 。 {同|おな}じ {言葉|ことば} で 。 || Please pass back a reply that all seven lamps here are lit too. In the same words.
?(!cr_lamp7) comp[smile]: こちら は {灯|ひ} が {六|むっ}つ {点|つ}いた と 、 {返事|へんじ} を {継|つ}いで ください 。 {七|なな}つ {目|め} 、 {雲居|くもい} の {灯|ひ} の {名前|なまえ} は 、 {私|わたし} たち が {呼|よ}びます 。 || Please pass back a reply that six lamps are lit here. The seventh, Kumoi's, we'll call by name ourselves.
!hook co_bond cr:beat
:end

@scene cr.suzu_reply
!if cr_suzu_reply -> end
!set cr_suzu_reply
comp: ジンパチ さん 。 これ 、 {下|した} まで {継|つ}いで くれる ？ {海|うみ} の {方|ほう} の 、 {旅|たび} の {一座|いちざ} の コウメ って {人|ひと} に 。 || Jinpachi. Could you pass this down the line? To someone called Koume, in a travelling company down by the sea.
cr_jinpachi: {一座|いちざ} の コウメ さん 。 {必|かなら}ず {継|つ}ぎます 。 {一言一句|いちごんいっく} 、 {変|か}えず に 。 || Koume, of the company. I'll pass it on, without fail. Not a word changed.
narr: スズ の {手紙|てがみ} は 、 {薄|うす}くて 、 {何度|なんど} も {書|か}き{直|なお}した {跡|あと} が あった 。 || Suzu's letter is thin, and shows the marks of being written over and over.
comp: …… {返事|へんじ} 、 {遅|おそ}く なった けど 。 {遅|おそ}すぎる {手紙|てがみ} は ない って 、 {誰|だれ} か が {言|い}ってた もの ね 。 || …The reply's late. But someone said there's no such thing as a letter too late.
!hook co_bond cr:beat
:end
`);
