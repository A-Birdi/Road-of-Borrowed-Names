/* Chapter 3 residents (part 2): the workshops, the inn, the post house and
 * the terraces — Hiro, Isao, Fusa, Shino, Nobu, Asa, Ume — their props,
 * the counting and signpost side quests, and Nao's cameo. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene co.hiro
!if quest.co_suzu=3&!co_suzu_done -> truth
!if quest.co_suzu=1&!co_suzu_asked -> ask
!if co_kiln_done -> late
!if seen.co.hiro_first -> idle
!call co.hiro_first
!end
:idle
hiro: {火屋|ほや} は {三十個|さんじゅっこ} 。 {二十九個|にじゅうきゅうこ} {目|め} まで {出来|でき}た 。 {最後|さいご} の {一|ひと}つ が 、 いつも {上手|うま}く いかない 。 || Thirty globes. Twenty-nine done. The last one never comes out right.
?(co_suzu_asked) hiro: …… {席|せき} の {話|はなし} 、 {誰|だれ} か に {聞|き}かれた の は {初|はじ}めて だった 。 {悪|わる}い {気|き} は しなかった 。 || …Nobody had ever asked me about the seat before. I didn't mind.
!end
:late
hiro: {外|そと} が {騒|さわ}がしい な 。 {窯|かま} の {方|ほう} から {誰|だれ} か {下|お}りて きた って 。 …… あんた たち か 。 || Noisy outside. Somebody came down from the kiln, they say. …Was that you?
!end
:ask
!call co.suzu_ask
!end
:truth
!call co.suzu_truth

@scene co.hiro_first
# Staged (the world review, WR-03): Hiro keeps the blowpipe turning through the first lines (he cannot
# let go), and holds the gather still to cool when he says he will listen; the companion answers in kind.
!look hiro left
!gesture hiro glasswork hold
!gesture pc observe hiro
hiro: …… {悪|わる}い 。 {今|いま} {手|て} が {離|はな}せない 。 ガラス は {待|ま}って くれない 。 || …Sorry. Can't let go of this. Glass doesn't wait.
narr: ヒロ は {吹|ふ}き{竿|ざお} を {回|まわ}し{続|つづ}け 、 {橙色|だいだいいろ} の {塊|かたまり} を {丸|まる}く {整|ととの}えて いく 。 {額|ひたい} に {巻|ま}いた {手拭|てぬぐ}い が 、 {煤|すす} で {少|すこ}し {黒|くろ}い 。 || Hiro keeps the blowpipe turning, coaxing an orange gather into a sphere. The cloth tied round his forehead is a little black with soot.
!gesture hiro cool pc hold
!look pc hiro
hiro: ヒロ だ 。 {祭|まつ}り の {灯籠|とうろう} の {火屋|ほや} を {作|つく}ってる 。 {用|よう} が あれば 、 {冷|さ}める {間|あいだ} に {聞|き}く 。 || I'm Hiro. I make the globes for the festival lanterns. If you need something, I'll listen while this cools.
?(comp=nao) !gesture comp nod hiro
?(comp=nao) comp: {職人|しょくにん} は {無口|むくち} な {方|ほう} が {信用|しんよう} できる 。 {配達先|はいたつさき} と して も {楽|らく} だ 。 || Quiet craftsmen are the trustworthy kind. Easy to deliver to, too.
?(comp=mio) !gesture comp observe hiro
?(comp=mio) comp[smile]: {額|ひたい} の {手拭|てぬぐ}い 、 {汗|あせ} {止|ど}め です ね 。 {火|ひ} の {粉|こ} {除|よ}け に も なる 。 {賢|かしこ}い 。 || The cloth on your forehead — for sweat. And to keep sparks off, too. Smart.
?(comp=mio) !gesture hiro aside
?(comp=mio) hiro: …… {母|はは} の {真似|まね} だ 。 || …I copied my mother.
?(comp=ren) !gesture comp bow
?(comp=ren) comp: {火屋|ほや} は 、 {灯|ひ} を {守|まも}る ガラス です 。 {灯守|ひもり} と して 、 {頭|あたま} が {下|さ}がります 。 || Globes are the glass that guards a flame. As a lantern keeper, I'm in your debt.
?(comp=suzu) !gesture comp lowered hold
?(comp=suzu) comp[closed]: …… || …
?(comp=suzu) !gesture comp palm hiro
?(comp=suzu) comp[smile]: {素敵|すてき} な {火屋|ほや} 。 {舞台|ぶたい} の {明|あ}かり に {欲|ほ}しい くらい 。 || Lovely globes. I'd want them for stage lights.
?(comp=suzu) !gesture hiro shake
?(comp=suzu) hiro: …… {悪|わる}い が 、 {祭|まつ}り の {分|ぶん} で {手|て} {一杯|いっぱい} だ 。 || …Sorry, the festival order's all I can manage.

@scene co.beam
# Staged: you lean in to the charred beam; Hiro answers from his bench without stopping his work; your
# companion's own answer (Nao leans in, Mio's guarded hand at how deep the char runs, Ren tends their lamp's
# wick, Suzu looks away).
!gesture pc observe 8,2
narr: {壁|かべ} に {立|た}て{掛|か}けた {太|ふと}い {梁|はり} 。 {片側|かたがわ} が 、 {炭|すみ} の よう に {黒|くろ}く {焦|こ}げて いる 。 || A thick beam propped against the wall. One side is charred black as charcoal.
?(!ch3_done) !gesture hiro glasswork hold
?(!ch3_done) hiro: {古|ふる}い {工房|こうぼう} {通|どお}り から {運|はこ}んで きた {梁|はり} だ 。 {親方|おやかた} が 「 {捨|す}てる な 」 って 。 {理由|りゆう} は {知|し}らない 。 || That beam came down from the old workshop row. The master says not to throw it out. I don't know why.
?(comp=nao) !gesture comp observe 8,2
?(comp=nao) comp: {燃|も}えた {跡|あと} だ 。 {焚|た}き{火|び} じゃ ない 。 {家|いえ} ごと {燃|も}えた {焦|こ}げ{方|かた} だ よ 。 || That's burning. Not a campfire — that's the char of a whole house going up.
?(comp=mio) !gesture comp guard
?(comp=mio) comp[worry]: {焦|こ}げ{目|め} が {深|ふか}い 。 {長|なが}い {時間|じかん} 、 {強|つよ}い {火|ひ} に {当|あ}たった ん です 。 || The char runs deep. It sat in a fierce fire for a long time.
?(comp=ren) !gesture comp tendlamp
?(comp=ren) comp: {木|き} は {燃|も}えた こと を {忘|わす}れません 。 {灯|ひ} の {芯|しん} と {同|おな}じ で 。 || Wood doesn't forget that it burned. Like a lantern wick.
?(comp=suzu) !gesture comp aside
?(comp=suzu) comp[closed]: …… {重|おも}そう な {梁|はり} ね 。 {下|した} に {誰|だれ} か いたら 、 {大変|たいへん} ね 。 || …Heavy-looking beam. It'd be terrible if someone were underneath.
!if co_clue_beam -> end
!set co_clue_beam
!var co_clues + 1
!call co.clue_check

@scene co.furnace
narr: ガラス の {炉|ろ} 。 {覗|のぞ}き{窓|まど} の {奥|おく} で 、 {溶|と}けた ガラス が {蜂蜜|はちみつ} の よう に {光|ひか}って いる 。 || The glass furnace. Through its window, molten glass glows like honey.
?(!co_restored) narr: {炉|ろ} の {横|よこ} に 、 {水|みず} の {入|はい}った {桶|おけ} が {置|お}いて ない 。 {普通|ふつう} は {置|お}く もの なのに 。 || There's no bucket of water beside the furnace. There usually is.
?(co_restored) narr: {炉|ろ} の {横|よこ} に 、 {水|みず} を {張|は}った {桶|おけ} が {二|ふた}つ 。 {新|あたら}しい {決|き}まり だ 。 || Beside the furnace, two buckets filled with water. A new rule.

@scene co.glass_ledger
!if item.co_kilnbook -> have
!if co_records_done -> have
narr: {棚|たな} に {古|ふる}い {帳面|ちょうめん} が {並|なら}んで いる 。 {窯|かま} の {記録|きろく} の よう だ 。 {親方|おやかた} の {許|ゆる}し なし に {触|さわ}る の は やめて おこう 。 || Old notebooks line the shelf — kiln records, by the look of them. Better not touch them without the master's say-so.
!end
:have
narr: {棚|たな} の {帳面|ちょうめん} に 、 {一冊|いっさつ} {分|ぶん} の {隙間|すきま} が ある 。 || There's a gap on the shelf where one ledger used to be.

@scene co.isao
# Staged: Isao's hand to his chin; he opens his right hand and looks at the old burn (the narration says so);
# his hand to the chin again over the iron door, a glance aside at the wind, a lean towards the furnace as he
# names Tomoe, a turn to you at the name, a shake of the head at his own muddle; once it is in order, his nod,
# and he hands you the kiln ledger side-on; your companion's own answer (Nao's nod, Mio leans in to his hand,
# Ren's hand to the chin, Suzu's head goes down); when idle he peers at the flame.
!if co_chronicle_read&!co_hist_isao -> hist
!if seen.co.isao_first -> idle
!call co.isao_first
!end
:idle
!gesture co_isao observe 2,2
co_isao: {火屋|ほや} は ヒロ に {任|まか}せて ある 。 {俺|おれ} は もう {目|め} が {利|き}かん 。 {火|ひ} の {色|いろ} が 、 {昔|むかし} ほど {見分|みわ}けられ ねえ 。 || I leave the globes to Hiro. My eyes aren't what they were. I can't tell the colours of a flame like I used to.
?(co_hist_isao&!co_restored) co_isao: {帳面|ちょうめん} は {返|かえ}さなくて いい 。 …… {返|かえ}って きて も 、 {俺|おれ} に は {読|よ}め ねえ {頁|ページ} だ 。 || You needn't return the ledger. …Even if you did, it's a page I can't read.
!end
:hist
!gesture co_isao chin
co_isao: {昔|むかし} の {話|はなし} だ と ？ …… {聞|き}かれた こと が ねえ な 。 || The old days? …Nobody's ever asked.
!gesture co_isao palm
narr: イサオ は {右手|みぎて} を {開|ひら}いて 、 {手|て}のひら を {見|み}た 。 {古|ふる}い {火傷|やけど} の {跡|あと} が 、 {白|しろ}く {引|ひ}き{攣|つ}れて いる 。 || Isao opens his right hand and looks at the palm. An old burn scar puckers white across it.
co_isao: この {火傷|やけど} か 。 {気|き} が ついたら あった 。 {若|わか}い {頃|ころ} から な 。 || This burn? It was just there one day. Since I was young.
!gesture co_isao chin
co_isao: {鉄|てつ} の {戸|と} を {素手|すで} で {閉|し}めた …… {気|き} が する 。 {熱|あつ}かった 。 {何|なん} で {閉|し}めた ん だ か 。 || I shut an iron door with my bare hand… I think. It was hot. Why did I shut it?
!gesture co_isao aside
co_isao: {風|かぜ} が {変|か}わった ん だ 。 {急|きゅう} に 。 {山|やま} の {方|ほう} から 。 || The wind changed. Suddenly. Off the mountain.
!gesture co_isao observe 2,2
co_isao: {祭|まつ}り の {火屋|ほや} を {焼|や}いて いた 。 {三十個|さんじゅっこ} 。 {火|ひ} の {番|ばん} は …… トモエ だ 。 トモエ が {見|み}て いた 。 || We were firing globes for the festival. Thirty. On the fire was… Tomoe. Tomoe was watching it.
!gesture co_isao listen pc
co_isao[surprise]: …… トモエ 。 なんで {今|いま} 、 その {名前|なまえ} が {出|で}て くる 。 || …Tomoe. Why would that name come to me now?
!gesture co_isao shake
co_isao: {頭|あたま} が {散|ち}らかって いる 。 {順|じゅん} に {並|なら}べて くれ 。 || My head's a mess. Line it up for me.
!activity co.a_hist_isao
!if var._res=0 -> later
!gesture co_isao nod pc
co_isao: …… {火屋|ほや} 、 トモエ 、 {風|かぜ} 、 {戸|と} 、 {火傷|やけど} 。 そう だ 。 そう いう {順番|じゅんばん} だ 。 || …Globes, Tomoe, wind, door, burn. Yes. That's the order.
!prop co_isao ledger
!gesture co_isao handover pc
!gesture pc receive co_isao
co_isao: {窯|かま} の {帳面|ちょうめん} を {持|も}って {行|い}け 。 {十四日|じゅうよっか} で {止|と}まって 、 {春|はる} から {俺|おれ} の {字|じ} に なってる 。 その {間|あいだ} に {何|なに} が あった か 、 {俺|おれ} に は {分|わ}から ねえ 。 || Take the kiln ledger. It stops on the fourteenth, and from spring on it's in my hand. What happened between, I couldn't tell you.
!give co_kilnbook
?(comp=nao) !gesture comp nod pc
?(comp=nao) comp: トモエ 。 {工房|こうぼう} の {看板|かんばん} の {名前|なまえ} か も な 。 {覚|おぼ}えて おこう 。 || Tomoe. Could be the name on a workshop sign somewhere. Let's remember it.
?(comp=mio) !gesture comp observe co_isao
?(comp=mio) comp[worry]: その {火傷|やけど} 、 {治|なお}って から {随分|ずいぶん} {経|た}って います 。 …… {体|からだ} は 、 {忘|わす}れて いません よ 。 || That burn healed a long time ago. …Your body hasn't forgotten.
?(comp=ren) !gesture comp chin
?(comp=ren) comp: トモエ 。 {初|はじ}めて {聞|き}く {名|な} です が 、 {初|はじ}めて {聞|き}いた {気|き} が しません 。 || Tomoe. I've never heard the name, and yet it doesn't feel new.
?(comp=suzu) !gesture comp lowered hold
?(comp=suzu) comp[closed]: …… トモエ 。 || …Tomoe.
!set co_hist_isao
!call co.hist_check
!end
:later
co_isao: {無理|むり} に とは {言|い}わねえ 。 {気|き} が {向|む}いたら な 。 || I won't push. Whenever you're ready.

@scene co.isao_first
# Staged: Isao looks from Hiro at the bench to you as he introduces himself; with Mio, she leans in to his
# burned hand, he glances aside from it, and she shakes her head; otherwise you lean in to the scar.
!gesture co_isao lookbetween hiro and=pc
co_isao: {客|きゃく} か 。 {親方|おやかた} の イサオ だ 。 {火屋|ほや} なら ヒロ に {言|い}え 。 {俺|おれ} は もう {口|くち} を {出|だ}す だけ だ 。 || Customers? I'm Isao, the master. For globes, talk to Hiro. These days I just give orders.
?(comp=mio) !gesture comp observe co_isao
?(comp=mio) comp[think]: …… イサオ さん 、 その {右手|みぎて} 。 {古|ふる}い {火傷|やけど} です ね 。 {深|ふか}い 。 || …Isao, your right hand. That's an old burn. A deep one.
?(comp=mio) !gesture co_isao aside
?(comp=mio) co_isao: ん ？ ああ 、 これ か 。 {知|し}らん うち に あった 。 {職人|しょくにん} に は よく ある こと だ 。 || Hm? Oh, this. It was just there one day. Happens to craftsmen.
?(comp=mio) !gesture comp shake
?(comp=mio) comp: …… {知|し}らない うち に {火傷|やけど} を する {人|ひと} は 、 いません 。 || …Nobody gets a burn like that without knowing.
?(comp!=mio) !gesture pc observe co_isao
?(comp!=mio) narr: イサオ の {右手|みぎて} に 、 {白|しろ}く {引|ひ}き{攣|つ}れた {古|ふる}い {傷|きず} が ある 。 || Isao's right palm is puckered with an old white scar.

@scene co.isao_after
co_isao: {窯|かま} の {帳面|ちょうめん} に 、 {十四日|じゅうよっか} の {夜|よる} の こと を {書|か}き{足|た}した 。 {俺|おれ} の {字|じ} で な 。 {二十年|にじゅうねん} {遅|おく}れ の {記録|きろく} だ 。 || I added the night of the fourteenth to the kiln ledger. In my own hand. A record twenty years late.
co_isao: ヒロ の {奴|やつ} 、 {母親|ははおや} に {似|に}て きた 。 {火|ひ} の {見方|みかた} が そっくり だ 。 || That boy Hiro's getting more like his mother. The way he watches a flame — just the same.

@scene co.isao_post
co_isao: {新|あたら}しい {窯|かま} に は 、 {窓|まど} の {横|よこ} に {札|ふだ} を {貼|は}った 。 「 {風|かぜ} の {強|つよ}い {夜|よる} は {開|ひら}く べからず 」 。 トモエ の {字|じ} を {写|うつ}して な 。 || On the new kiln I've put a sign beside the vent: "On windy nights, do not open." Copied from Tomoe's hand.
?(end_archive_library) co_isao: {書庫|しょこ} に 、 {窯焚|かまだ}き の {手順|てじゅん} を {写|うつ}して {送|おく}った 。 {余白|よはく} の {一行|いちぎょう} も {忘|わす}れず に な 。 || I sent the archive a copy of the firing steps. With the line in the margin, mind.

@scene co.hiro_after
# Staged: Hiro glances to the named seat and back to you; with Suzu, he turns to her for her payment and she
# laughs; you step to his side and he hands you the glass-bead earrings.
!gesture hiro glance 26,18
hiro: {席|せき} は 、 {今年|ことし} も {空|あ}けて おいた 。 {名前|なまえ} を {書|か}いて な 。 …… {空|あ}いて いる の に 、 {前|まえ} より {寂|さび}しく ない 。 || I kept the seat free again this year. With her name on it. …It's empty, but it's less lonely than before.
?(co_hiro_globe) !look hiro pc
?(co_hiro_globe) hiro: {窯|かま} から {持|も}って きて くれた {火屋|ほや} 、 {割|わ}れない よう に {棚|たな} に {飾|かざ}って ある 。 {祭|まつ}り の {夜|よる} だけ 、 {火|ひ} を {入|い}れる 。 || The globe you brought from the kiln sits safe on my shelf. Only on festival night do I light it.
?(comp=suzu) !look hiro comp
?(comp=suzu) hiro: スズ 。 {次|つぎ} の {祭|まつ}り も 、 {隣|となり} は {空|あ}けて おく 。 {返済|へんさい} の {残|のこ}り 、 {十九回|じゅうきゅうかい} だ 。 || Suzu. I'll keep the seat next to it free next year, too. Nineteen payments left.
?(comp=suzu) !gesture comp laugh
?(comp=suzu) comp[laugh]: {利子|りし} は 、 {取|と}らない で よ ？ || No interest, I hope?
?(comp!=suzu) hiro: スズ は {旅|たび} に {出|で}た 。 {来年|らいねん} の {祭|まつ}り に {来|く}る と {言|い}って な 。 {帳簿|ちょうぼ} に {書|か}いて いった 。 || Suzu went back on the road. Said she'll come to next year's festival — and wrote it in her book.
!if item.co_glass_beads -> end
!walkto pc 24 19 right
!look hiro pc
!prop hiro beads
!gesture hiro handover pc
!gesture pc receive hiro
hiro: …… これ 、 {持|も}って {行|い}け 。 {火屋|ほや} の {余|あま}り で {作|つく}った 。 {礼|れい} だ 。 || …Take these. I made them from the leftover globe glass. A thank-you.
!give co_glass_beads

@scene co.hiro_post
hiro: {窯|かま} の {番|ばん} を {教|おし}える {時|とき} 、 {最初|さいしょ} に {言|い}う こと に した 。 「 {風|かぜ} の {強|つよ}い {夜|よる} は 、 {上|うえ} の {窓|まど} を {開|あ}ける な 」 。 {理由|りゆう} も {一緒|いっしょ} に 。 || When I teach someone to watch the kiln, that's the first thing I tell them now: "Never open the upper vent on a windy night." And why.
?(end_mem_choose) hiro: {山|やま} に は {行|い}かなかった 。 {母|はは} の こと は 、 もう {自分|じぶん} で {持|も}ってる 。 {足|た}りない {分|ぶん} は 、 {里|さと} の {皆|みな} が {覚|おぼ}えてる 。 || I didn't go up the mountain. I carry my mother with me now. Whatever I'm missing, the village remembers.
?(end_mem_return) hiro: {山|やま} から {戻|もど}った {記憶|きおく} の {中|なか} に 、 {母|はは} の {鼻歌|はなうた} が あった 。 {下手|へた} だった 。 {嬉|うれ}しかった 。 || Among the memories that came back from the mountain was my mother's humming. She was awful at it. I was so glad.

@scene co.fusa
# Staged: Fusa's open hand for the room and her nod; her guarded hand at the festival rush, an open hand to
# explain the trays, her laugh at your counting, and she hands you the dried persimmons across the counter;
# her guarded hand at the dusk gathering.
!if quest.co_main>=8&!co_restored -> eve
!if co_chronicle_read&!co_orders_done -> orders
!if seen.co.fusa_first -> idle
!call co.fusa_first
!end
:idle
!gesture co_fusa palm
co_fusa: {部屋|へや} は {空|あ}いてる わ よ 。 {休|やす}んで いく ？ || There's a room free. Want to rest?
!choice
* {休|やす}む || Rest -> rest
* {今|いま} は いい || Not now -> end
:rest
!gesture co_fusa nod pc
co_fusa: ごゆっくり 。 {干|ほ}し{柿|がき} を {枕元|まくらもと} に {置|お}いて おく わ ね 。 || Take your time. I'll leave some dried persimmons by your pillow.
!inn
!end
:orders
!gesture co_fusa guard
co_fusa[worry]: ああ 、 ちょうど よかった ！ {祭|まつ}り の {前|まえ} は {毎年|まいとし} こう なの 。 {注文|ちゅうもん} が {多|おお}すぎて 、 {手|て} が {足|た}りない の よ 。 || Oh, perfect timing! Every year before the festival it's like this — more orders than hands.
!gesture co_fusa palm
co_fusa: {少|すこ}し だけ {手伝|てつだ}って くれない ？ {言|い}われた とおり に {盆|ぼん} に {載|の}せて 、 {出|だ}す だけ 。 {数|かず} を {間違|まちが}え なければ {大丈夫|だいじょうぶ} ！ || Could you help for a bit? Just put what they ask for on a tray and serve it. As long as you get the numbers right, you'll be fine!
!choice
* {手伝|てつだ}う || Help out -> help
* また {後|あと} で || Maybe later -> idle
:help
!activity co.a_orders
!if var._res=0 -> end
!gesture co_fusa laugh
co_fusa[laugh]: {完璧|かんぺき} ！ {数|かぞ}え{方|かた} が きれい ね 。 {杯|はい} も {個|こ} も {袋|ふくろ} も 、 {一|ひと}つ も {間違|まちが}え ない なんて 。 || Perfect! You count beautifully — cups, pieces, bags, not one wrong.
!prop co_fusa hoshigaki
!gesture co_fusa handover pc
!gesture pc receive co_fusa
co_fusa: {御礼|おれい} に 、 {干|ほ}し{柿|がき} を ひと{束|たば} 。 {旅|たび} の {途中|とちゅう} で {食|た}べて ね 。 || Here's a string of dried persimmons as thanks. Eat them on the road.
!give co_hoshigaki
!set co_orders_done
!end
:eve
!gesture co_fusa guard
co_fusa[worry]: トキワ さん が 、 {夕方|ゆうがた} {広場|ひろば} に {集|あつ}まれ って 。 {何|なに} の {話|はなし} かしら 。 {胸|むね} が ざわざわ する の 。 || Tokiwa wants everyone in the square at dusk. I wonder what it's about. My chest feels all fluttery.

@scene co.fusa_first
# Staged: Fusa's open-handed welcome, her laugh at your luck, and a look from the aired futons to you; with
# Mio, her laugh at the persimmon futon.
!gesture co_fusa palm
co_fusa[smile]: いらっしゃい 。 フサ の {宿|やど} へ ようこそ 。 {茶屋|ちゃや} も やってる から 、 {甘酒|あまざけ} でも どう ぞ 。 || Welcome, welcome, to Fusa's inn. I run the teahouse too, so have some amazake.
!gesture co_fusa laugh
co_fusa: {祭|まつ}り の {前|まえ} は {満室|まんしつ} に なる ん だ けど 、 {今年|ことし} は まだ {空|あ}いてる わ 。 {運|うん} が いい わ ね 。 || Before the festival we're usually full, but this year there's still room. Lucky you.
!gesture co_fusa lookbetween prop:bed and=pc
co_fusa: {休|やす}みたく なったら {声|こえ} を かけて 。 {布団|ふとん} は {干|ほ}した ばかり よ 。 {柿|かき} の {匂|にお}い が する かも しれない けど 。 || Just ask when you want to rest. The futons were aired today. They might smell of persimmon.
?(comp=mio) !gesture comp laugh
?(comp=mio) comp[smile]: {柿|かき} の {匂|にお}い の {布団|ふとん} 。 …… {素敵|すてき} です 。 || A futon that smells of persimmon. …That's lovely.

@scene co.fusa_after
co_fusa: {妹|いもうと} の ヨシノ は ね 、 {工房|こうぼう} {通|どお}り で {染|そ}め{物|もの} を してた の 。 {祭|まつ}り の {旗|はた} も 、 あの {子|こ} が {染|そ}めてた 。 || My sister Yoshino dyed cloth on the workshop row. She dyed the festival banners, too.
co_fusa[smile]: {今年|ことし} から 、 {旗|はた} の {一枚|いちまい} を {私|わたし} が {染|そ}める こと に した わ 。 {下手|へた} だ けど 。 {泣|な}き ながら {染|そ}めた から 、 {色|いろ} が {滲|にじ}んでる の 。 || From this year I dye one of the banners myself. I'm no good at it. I cried while I did it, so the colour ran.

@scene co.fusa_post
# Staged: Fusa looks from the bucket and salve at the front desk to you; with Mio, she leans in to the labels;
# Fusa's head goes down over what she left on the mountain.
!gesture co_fusa lookbetween 3,4 and=pc
co_fusa: {宿|やど} の {帳場|ちょうば} に 、 {新|あたら}しい {桶|おけ} と {火傷|やけど} の {薬|くすり} を {置|お}いた の 。 {旅|たび} の {薬師|くすし} さん に {教|おし}わった {作|つく}り{方|かた} で ね 。 || I keep a new bucket and burn salve at the front desk now. Made the way a travelling apothecary taught me.
?(comp=mio) !gesture comp observe 3,4
?(comp=mio) comp[smile]: …… ちゃんと {作|つく}って くれて いる んです ね 。 ラベル まで 。 || …You've been making it properly. Labels and all.
?(end_mem_choose) !gesture co_fusa lowered
?(end_mem_choose) co_fusa: {山|やま} に {行|い}って 、 ヨシノ の {笑|わら}い{声|ごえ} を {取|と}り{戻|もど}して きた わ 。 {他|ほか} の {悲|かな}しい の は …… まだ {置|お}いて ある 。 {少|すこ}し ずつ ね 。 || I went up the mountain and brought back Yoshino's laugh. The sadder things… I've left there for now. A little at a time.
?(end_mem_return) co_fusa: {全部|ぜんぶ} {戻|もど}って きた {日|ひ} 、 {宿|やど} を {休|やす}んだ の 。 {初|はじ}めて よ 。 {一日|いちにち} {泣|な}いて 、 {次|つぎ} の {日|ひ} に {開|あ}けた わ 。 || The day everything came back, I closed the inn. First time ever. I cried all day and opened the next morning.

@scene co.inn_bed
narr: {干|ほ}した ばかり の {布団|ふとん} 。 {柿|かき} の {甘|あま}い {匂|にお}い が する 。 || A freshly aired futon. It smells sweetly of persimmon.
narr: {休|やす}む なら 、 フサ に {声|こえ} を かけよう 。 || If you want to rest, ask Fusa.

@scene co.inn_tea
narr: {湯呑|ゆの}み が {二|ふた}つ 。 {片方|かたほう} に は {口紅|くちべに} の {跡|あと} 。 {誰|だれ} か が {甘酒|あまざけ} を {飲|の}みかけ で {置|お}いて いった 。 || Two cups. One has a trace of lip rouge. Someone left their amazake half-finished.
?(comp=suzu) comp: …… {私|わたし} の じゃ ない わ よ 。 {今日|きょう} は 。 || …Not mine. Not today.

@scene co.shino
# Staged: Shino holds out the bundle of invitations whose address tags came off; when every one is placed, her
# nod; with Nao, an open hand; when the invitations are out, she sorts the post.
!if co_chronicle_read&!co_letters_done -> letters
!if seen.co.shino_first -> idle
!call co.shino_first
!end
:idle
!gesture co_shino sort prop=letter
co_shino: {招待状|しょうたいじょう} は {全部|ぜんぶ} {出|で}ました 。 {祭|まつ}り の {後|あと} は 、 {礼状|れいじょう} の {山|やま} が {来|き}ます 。 {毎年|まいとし} の こと です 。 || The invitations are all out. After the festival, the thank-you letters pile up. Every year.
!end
:letters
!prop co_shino envelopes
!gesture co_shino present pc prop=envelopes hold
co_shino[worry]: {困|こま}りました 。 {祭|まつ}り の {招待状|しょうたいじょう} の {宛名|あてな} の {札|ふだ} が 、 {束|たば} から {外|はず}れて しまって 。 || I'm in a bind. The address tags came off a bundle of festival invitations.
co_shino: {中身|なかみ} を {読|よ}めば 、 {誰|だれ} {宛|あ}て か {分|わ}かる はず です 。 {手伝|てつだ}って いただけ ます か 。 || Reading the contents should tell us who each is for. Would you help me?
!choice
* {手伝|てつだ}う || Help -> help
* また {今度|こんど} || Another time -> idle
:help
!activity co.a_letters
!if var._res=0 -> end
!prop co_shino -
!gesture co_shino nod pc
co_shino[smile]: {全部|ぜんぶ} {合|あ}って います 。 {手紙|てがみ} を {読|よ}む の が お{上手|じょうず} です ね 。 {宛名|あてな} が なくて も 、 {言葉|ことば} は {相手|あいて} を {覚|おぼ}えて いる もの です 。 || Every one correct. You read letters well. Even without an address, the words remember who they're for.
?(comp=nao) !gesture comp palm
?(comp=nao) comp[smirk]: {同感|どうかん} だ 。 {宛名|あてな} なんて 、 {手紙|てがみ} の {一番|いちばん} {外側|そとがわ} に すぎない 。 || Agreed. The address is just the outermost part of a letter.
!set co_letters_done
!end

@scene co.shino_first
# Staged: Shino's nod, then she points to the sorting rack with its five empty slots; with Nao, they look from
# the rack to her.
!gesture co_shino nod pc
co_shino: {郵便|ゆうびん} の {係|かかり} の シノ です 。 {里|さと} の {手紙|てがみ} は 、 {全部|ぜんぶ} ここ を {通|とお}ります 。 || I'm Shino, the post clerk. Every letter in the village comes through here.
!gesture co_shino point 7,2
co_shino: {仕分|しわ}け{棚|だな} の {区切|くぎ}り が 、 {家|いえ} の {数|かず} より {五|いつ}つ {多|おお}い ん です 。 {作|つく}った {人|ひと} が {数|かぞ}え{間違|まちが}えた ん でしょう ね 。 {空|から} の まま です 。 || The sorting rack has five more slots than there are households. Whoever built it must have miscounted. They've always been empty.
?(comp=nao) !gesture comp lookbetween 7,2 and=co_shino
?(comp=nao) comp: …… {数|かぞ}え{間違|まちが}い 、 ね 。 {職人|しょくにん} は {普通|ふつう} 、 {棚|たな} の {数|かず} を {間違|まちが}え ない けど な 。 || …Miscounted, sure. Carpenters don't usually get the slots wrong.

@scene co.shino_after
co_shino: {五|いつ}つ の {空|あ}いた {区切|くぎ}り に 、 {名前|なまえ} を {書|か}きました 。 {届|とど}く {手紙|てがみ} は もう ありません けど 。 {手紙|てがみ} を {書|か}く {人|ひと} は 、 います から 。 || I wrote names on the five empty slots. No letters will come for them. But there are people who write to them.
co_shino: {時々|ときどき} 、 {宛先|あてさき} の ない {手紙|てがみ} が そこ に {入|はい}って います 。 {私|わたし} は {読|よ}みません 。 {届|とど}ける {先|さき} も 、 ありません 。 それ で いい の です 。 || Now and then a letter with no destination turns up in one. I don't read them. There's nowhere to deliver them. And that's all right.

@scene co.shino_post
co_shino: {他|ほか} の {里|さと} から の {手紙|てがみ} が {増|ふ}えました 。 {道|みち} が {戻|もど}った から でしょう 。 {忙|いそが}しく なって 、 {嬉|うれ}しい です 。 || We get more letters from other villages now. The roads are back, I suppose. Busier, and happier for it.
?(comp!=nao) co_shino: {配達人|はいたつにん} の ナオ さん が 、 {時々|ときどき} {寄|よ}って くれます 。 {宛名|あてな} の {札|ふだ} を {一枚|いちまい} {欲|ほ}しい と {言|い}う ので 、 {差|さ}し{上|あ}げました 。 {集|あつ}めて いる ん です って 。 || Nao, the courier, drops in sometimes. Asked for one of my old address tags, so I gave it. Collects them, apparently.

@scene co.post_desk
!if co_letters_done -> done
narr: {机|つくえ} の {上|うえ} に 、 {宛名|あてな} の {札|ふだ} の {外|はず}れた {招待状|しょうたいじょう} の {束|たば} 。 シノ が {困|こま}った {顔|かお} で {見|み}て いる 。 || On the desk, a bundle of invitations whose address tags have come off. Shino eyes it unhappily.
!end
:done
narr: {招待状|しょうたいじょう} は {全部|ぜんぶ} {配|くば}られた 。 {机|つくえ} の {上|うえ} に は 、 {糊|のり} の {瓶|びん} だけ 。 || The invitations have all gone out. Only a pot of paste remains on the desk.

@scene co.nao_cameo
# Staged: Nao (on the road with the post) nods hello and settles the satchel strap over the heavy letters;
# your companion's own exchange with them (Mio leans in to their boots and Nao shrugs, Ren asks the way and
# Nao points to the door, Suzu laughs and Nao glances away); Nao points to Shino for the letters and looks to
# the door for the next delivery.
!gesture nao nod pc
nao[smirk]: …… よう 。 {世|よ} の {中|なか} 、 {狭|せま}い な 。 || …Hey. Small world.
!gesture nao strap
nao: {潮硝子|しおがらす} から の {荷|に} を {届|とど}け に {来|き}た 。 {祭|まつ}り の {前|まえ} は 、 {柿|かき} の {箱|はこ} より {手紙|てがみ} の {方|ほう} が {重|おも}い 。 || Came up with a load from Saltglass. Before the festival, the letters weigh more than the persimmon crates.
?(comp=mio) !gesture comp observe nao
?(comp=mio) comp[smile]: ナオ さん 。 {靴|くつ} 、 また {減|へ}って います よ 。 || Nao. Your boots are worn down again.
?(comp=mio) !gesture nao shrug
?(comp=mio) nao: {坂|さか} の せい だ 。 {俺|おれ} の せい じゃ ない 。 || The hills' fault. Not mine.
?(comp=ren) !gesture comp palm
?(comp=ren) comp: ナオ 。 {道|みち} を {教|おし}えて ください 。 {宿|やど} から ここ まで 、 {二回|にかい} {迷|まよ}いました 。 || Nao. Please tell me the way. I got lost twice between the inn and here.
?(comp=ren) !gesture nao point 4,7
?(comp=ren) nao: まっすぐ {一本|いっぽん} だ ぞ 。 …… どう やって {迷|まよ}った 。 || It's one straight road. …How did you get lost?
?(comp=suzu) !gesture comp laugh
?(comp=suzu) comp[laugh]: ナオ ！ {相変|あいか}わらず {出口|でぐち} {側|がわ} に {立|た}ってる の ね 。 || Nao! Still standing by the exit, I see.
?(comp=suzu) !gesture nao aside
?(comp=suzu) nao: {癖|くせ} だ 。 …… お{前|まえ} も {相変|あいか}わらず 、 {笑|わら}って {誤魔化|ごまか}してる な 。 {顔|かお} に {書|か}いて ある 。 || Habit. …And you're still laughing things off. It's written on your face.
!gesture nao point co_shino
nao: {宛名|あてな} の {札|ふだ} が {外|はず}れた {手紙|てがみ} の {話|はなし} 、 シノ から {聞|き}いた 。 {手伝|てつだ}って やって くれ 。 {中身|なかみ} を {読|よ}めば {分|わ}かる 。 {大抵|たいてい} は な 。 || Shino told me about the letters that lost their address tags. Give her a hand. Read the contents and you'll know. Usually.
!gesture nao lookroad 4,7
nao: …… {大抵|たいてい} じゃ ない {手紙|てがみ} も ある けど な 。 じゃ 、 {次|つぎ} の {配達|はいたつ} だ 。 || …Not always, though. Right. Next delivery.
!set co_nao_cameo
`, 'ch3/people-workshops');

RB.script.add(`
@scene co.nobu
# Staged: Nobu points to the thirty flasks, his arms fold over the order, he shows how long "long things" are;
# a nod or his arms folded at your answer; when you explain, he glances aside at Kotarō's mistake and makes
# his point about the slip with a flat hand; then his nod, a look at the flasks, and the ash-glazed cup handed
# to you; your companion's own answer (Nao's nod, Mio leans in to the glaze, Ren's open hand, Suzu writes it
# in her book).
!if quest.co_count=2 -> fix
!if quest.co_count=active -> waiting
!if co_count_done -> done
!gesture co_nobu point 6,2
co_nobu: ったく 。 {見|み}ろ 、 この とっくり 。 {三十本|さんじゅっぽん} 。 {窯|かま} {一|ひと}つ {分|ぶん} {焼|や}いた ん だ ぞ 。 || Honestly. Look at these flasks. Thirty of them. A whole kiln-load.
!look co_nobu pc
!gesture co_nobu folded hold
co_nobu: {祭|まつ}り の {係|かかり} から 「 {三十本|さんじゅっぽん} 」 と {注文|ちゅうもん} が {来|き}た 。 {作|つく}った 。 {持|も}って {行|い}ったら 、 「 {頼|たの}んで ない 」 だ と 。 || The festival committee ordered "thirty long ones". I made them. Took them over, and got told "we never ordered these".
!gesture co_nobu size
co_nobu: {俺|おれ} が {聞|き}き{間違|まちが}えた って の か 。 {三十本|さんじゅっぽん} って {言|い}ったら 、 {長|なが}い もん だろう が 。 || Are they saying I misheard? "Thirty 本" means long things, doesn't it?
!choice
* サヨ さん に {聞|き}いて みます 。 || I'll ask Sayo about it. -> yes
* {大変|たいへん} でした ね 。 || That sounds rough. -> no
:yes
!gesture co_nobu nod pc
co_nobu: …… {頼|たの}む 。 {俺|おれ} が {行|い}く と 、 {声|こえ} が {大|おお}きく なる 。 || …Please. If I go, I'll only end up shouting.
!quest co_count 0
!end
:no
!gesture co_nobu folded hold
co_nobu: ふん 。 {同情|どうじょう} より 、 {誰|だれ} か {事情|じじょう} を {聞|き}いて きて くれ ねえ か な 。 || Hmph. Rather than sympathy, I'd like someone to find out what happened.
!end
:waiting
co_nobu: で 、 {何|なん} だった ？ {三十|さんじゅう} の {何|なに} だった ん だ 。 || Well? Thirty of what, then?
!end
:fix
!gesture pc palm
pc: サヨ さん が {頼|たの}んだ の は {小皿|こざら} でした 。 {伝言|でんごん} の {途中|とちゅう} で 、 {数|かぞ}え{方|かた} が {変|か}わって しまった ん です 。 || Sayo ordered small plates. Somewhere along the way, the counter changed.
!gesture co_nobu aside
co_nobu: …… コタロウ の {奴|やつ} か 。 {怒|おこ}る に {怒|おこ}れ ねえ な 。 あいつ 、 うち の とっくり が {好|す}き なん だ 。 || …Kotarō, was it. Can't even be properly angry. The boy loves my flasks.
!gesture co_nobu emphatic
co_nobu: よし 。 {今度|こんど} は {間違|まちが}え ない よう に 、 {注文書|ちゅうもんしょ} を {書|か}いて くれ 。 {数|かず} と {数|かぞ}え{方|かた} を {正|ただ}しく な 。 || Right. So there's no mistake this time, write me an order slip. The numbers and the counters, properly.
!challenge co.c_count
!if var._res=0 -> end
!gesture co_nobu nod pc
co_nobu: …… よし 、 {分|わ}かり やすい 。 {小皿|こざら} {三十枚|さんじゅうまい} 、 {明日|あした} まで に {焼|や}く 。 || …Good. Clear as day. Thirty small plates, fired by tomorrow.
!gesture co_nobu observe 6,2
co_nobu: この とっくり は どう する か な 。 …… {割|わ}る の も {惜|お}しい 。 || And what to do with these flasks. …Shame to smash them.
!look co_nobu pc
!prop co_nobu cup
!gesture co_nobu handover pc
!gesture pc receive co_nobu
co_nobu: {礼|れい} だ 。 {持|も}って {行|い}け 。 {灰|はい} の {釉|くすり} を かけた {湯呑|ゆの}み だ 。 {里|さと} の {灰|はい} で {作|つく}った 。 || Here, for your trouble. A cup with an ash glaze. Made with the orchard's own ash.
!set co_count_done
!quest co_count done
?(comp=nao) !gesture comp nod pc
?(comp=nao) comp: {灰|はい} の {釉|くすり} 、 か 。 {燃|も}えた {後|あと} の もの で 、 きれい な もん を {作|つく}る 。 {悪|わる}く ない 。 || An ash glaze. Making something beautiful out of what's left after burning. I like that.
?(comp=mio) !gesture comp observe pc
?(comp=mio) comp[smile]: {緑|みどり} が {溜|た}まって いる ところ 、 {綺麗|きれい} です ね 。 {大事|だいじ} に します 。 || The way the green pools there is beautiful. I'll treasure it.
?(comp=ren) !gesture comp palm
?(comp=ren) comp: {灰|はい} から {生|う}まれた {器|うつわ} 。 {灰実|はいみ} の {名|な} に 、 {一番|いちばん} {似合|にあ}う {品|しな} です 。 || A vessel born of ash. Nothing could suit the name Haimi better.
?(comp=suzu) !gesture comp write
?(comp=suzu) comp: ちゃんと {帳簿|ちょうぼ} に {書|か}いて おく わ 。 「 ノブ さん から {湯呑|ゆの}み {一|ひと}つ 。 {返済|へんさい} {不要|ふよう} 」 。 || I'll note it in my book. "One cup from Nobu. No repayment needed."
!end
:done
co_nobu: {小皿|こざら} は {焼|や}けた 。 {三十枚|さんじゅうまい} 。 {一枚|いちまい} {余計|よけい} に {焼|や}いた の は 、 コタロウ の {分|ぶん} だ 。 {言|い}う な よ 。 || The plates are fired. Thirty. The one extra's for Kotarō. Don't tell him.

@scene co.flasks
narr: {棚|たな} いっぱい の とっくり 。 {首|くび} の {細|ほそ}い {長|なが}い {瓶|びん} が 、 {数|かぞ}えて みる と {確|たし}か に {三十本|さんじゅっぽん} ある 。 || A shelf full of sake flasks. Long, slender-necked bottles. Count them: thirty, sure enough.
?(co_count_done) narr: {首|くび} に {紐|ひも} が {結|むす}んで ある 。 {草刈|くさか}り {組|ぐみ} の {水筒|すいとう} に なる らしい 。 || Cords have been tied round their necks. They're to become water bottles for the grass crew, apparently.

@scene co.pottery_slip
narr: {机|つくえ} の {上|うえ} の {注文|ちゅうもん} の {紙|かみ} 。 サヨ の {字|じ} で 「 {祭|まつ}り {用|よう} ・ {三十|さんじゅう} ・ {急|いそ}ぎ 」 。 {何|なに} を {三十|さんじゅう} なの か は 、 {書|か}いて いない 。 || The order slip on the table, in Sayo's hand: "For the festival — thirty — urgent." Thirty of what, it doesn't say.
?(comp=ren) comp: {数|かず} だけ で {助数詞|じょすうし} の ない {注文|ちゅうもん} 。 {灯|ひ} に {行|い}き{先|さき} を {書|か}かない の と {同|おな}じ です 。 || A number with no counter. Like a lantern with no destination written on it.

@scene co.nobu_after
co_nobu: {窯|かま} の {横|よこ} に {水|みず} の {桶|おけ} を {置|お}く よう に なった 。 {俺|おれ} の {親父|おやじ} も そう してた 。 {理由|りゆう} を {聞|き}かず に {真似|まね} してた が 、 {今|いま} は {分|わ}かる 。 || I keep a bucket of water by the kiln now. My old man did the same. I copied him without asking why. Now I know.
?(!co_count_done) co_nobu: とっくり は {草刈|くさか}り {組|ぐみ} に {配|くば}った 。 {水筒|すいとう} に ちょうど いい ん だ と 。 {焼|や}いた {甲斐|かい} が あった 。 || I handed the flasks out to the grass crew. Just right for water, they say. Worth firing after all.

@scene co.nobu_post
co_nobu: {灰|はい} の {釉|くすり} が 、 {他|ほか} の {里|さと} で {売|う}れる よう に なった 。 「 {火事|かじ} を {覚|おぼ}えて いる {里|さと} の {焼|や}き{物|もの} 」 だ と さ 。 {変|へん} な {売|う}り{文句|もんく} だ 。 || Our ash glaze sells in other villages now. "Pottery from the village that remembers its fire," they call it. Odd selling point.
?(end_kasane_trial) co_nobu: {書庫|しょこ} の {番人|ばんにん} が {灯落|ひおち} に {来|き}た ん だろう 。 {俺|おれ} は {会|あ}い に は {行|い}か ねえ 。 {湯呑|ゆの}み を {一|ひと}つ {送|おく}った 。 {割|わ}る か {使|つか}う か は 、 {向|む}こう の {勝手|かって} だ 。 || The archive keeper came down to Lanternfall, I hear. I'm not going to see them. I sent a cup. Whether they smash it or use it is up to them.
`, 'ch3/pottery');

RB.script.add(`
@scene co.hist_check
!if !co_hist_ume -> end
!if !co_hist_goro -> end
!if !co_hist_isao -> end
!if quest.co_main>=4 -> end
!quest co_main 4
?(comp=nao) comp: {三人|さんにん} の {話|はなし} 、 {全部|ぜんぶ} {同|おな}じ {夜|よる} の {話|はなし} だ 。 {宛先|あてさき} は {一|ひと}つ 。 {記録堂|きろくどう} に {持|も}って {行|い}こう 。 || Three stories, all about the same night. One address. Let's take them to the Chronicle Hall.
?(comp=mio) comp: {三人|さんにん} とも 、 {同|おな}じ {夜|よる} の こと を {話|はな}して いました 。 {症状|しょうじょう} が {揃|そろ}えば 、 {診断|しんだん} は {一|ひと}つ です 。 || All three were describing the same night. When the symptoms line up, there's only one diagnosis.
?(comp=ren) comp: {三|みっ}つ の {灯|ひ} が 、 {同|おな}じ {名|な} を {照|て}らして います 。 {記録堂|きろくどう} で 、 {帳面|ちょうめん} と {並|なら}べましょう 。 || Three lanterns lighting the same name. Let's set them beside the records in the Chronicle Hall.
?(comp=suzu) comp: {三人|さんにん} の {台詞|せりふ} が 、 {同|おな}じ {場面|ばめん} を {指|さ}してる 。 …… {記録堂|きろくどう} へ 。 {植|う}え{付|つ}け{帳|ちょう} と {窯|かま} の {帳面|ちょうめん} を {持|も}って 。 || Three people's lines, all pointing to the same scene. …To the Chronicle Hall, with the planting book and the kiln ledger.
!journal {植|う}え{付|つ}け{帳|ちょう} と {窯|かま} の {帳面|ちょうめん} を 、 {記録堂|きろくどう} の {閲覧|えつらん} の {机|つくえ} へ 。 || Take the planting book and the kiln ledger to the reading table in the Chronicle Hall.
!autosave

@scene co.ume
# Staged: Ume looks up to the black terraces, shakes her head at her own order, glances towards the channel, a
# hand to her chin for the rainless month; once it is in order her head goes down; you step to her side and
# she hands you the planting book; your companion's own answer (Nao's nod; Mio's head goes down and Ume rubs
# her hands at the children's warm hands; Ren's nod; with Suzu, Ume turns to her at the girl with the red
# ribbon, and Suzu's hand goes to her ribbon); when idle, her nod.
!if co_chronicle_read&!co_hist_ume -> hist
!if seen.co.ume_first -> idle
!call co.ume_first
!end
:idle
!gesture co_ume nod pc
co_ume: {柿|かき} は ね 、 {渋|しぶ}い うち に {取|と}って 、 {干|ほ}して {甘|あま}く する ん だ よ 。 {人|ひと} も {同|おな}じ さ 。 {少|すこ}し {干|ほ}される と 、 {甘|あま}く なる 。 || You pick persimmons while they're still astringent, and dry them sweet. People too. Hang them out a bit and they sweeten.
?(co_hist_ume&!co_restored) co_ume: {植|う}え{付|つ}け{帳|ちょう} 、 {役|やく} に {立|た}ってる かい 。 {変|へん} な {頁|ページ} が ある だろう 。 {若|わか}い {木|き} ばかり {植|う}えた {年|とし} が 。 || Is the planting book any use? There's an odd page in it, isn't there. The year we planted nothing but saplings.
!end
:hist
!gesture co_ume lookroad up
co_ume: {昔|むかし} の こと かい 。 …… {朝|あさ} …… {上|うえ} の {段|だん} が {真|ま}っ{黒|くろ} で ね 。 {柿|かき} の {木|き} が {一本|いっぽん} も なかった 。 || The old days? …In the morning… the upper terraces were pitch black. Not one persimmon tree left.
!look co_ume pc
!gesture co_ume shake
co_ume: いや 、 その {前|まえ} だ 。 {夜中|よなか} に 、 けむり の におい で {目|め} が {覚|さ}めた ん だ よ 。 {空|そら} が {赤|あか}くて ね 。 || No, before that. In the night, the smell of smoke woke me. The sky was red.
!gesture co_ume glance right
co_ume: {子|こ}ども たち の {手|て} を {引|ひ}いて 、 {水路|すいろ} ぞい に {下|お}りた 。 {水|みず} の {音|おと} を {頼|たよ}り に ね 。 || I took the children by the hand and went down along the channel, following the sound of the water.
!gesture co_ume chin
co_ume: その {年|とし} は 、 ずっと {雨|あめ} が {降|ふ}らなかった 。 {一月|ひとつき} {以上|いじょう} も 。 {最初|さいしょ} に {言|い}う べき だった ね 。 || That year it didn't rain for over a month. I should have said that first.
co_ume: {祭|まつ}り の {前|まえ} の {晩|ばん} だった 。 {山|やま} から {乾|かわ}いた {風|かぜ} が {吹|ふ}いて …… ああ 、 {順番|じゅんばん} が めちゃくちゃ だ ね 。 {年|とし} を {取|と}る と これ だ 。 || It was the night before the festival. A dry wind came down off the mountain… oh, I've got it all out of order. That's age for you.
co_ume: あんた 、 {若|わか}い {頭|あたま} で {並|なら}べ{直|なお}して くれない かい 。 || Would you put it in order for me, with your young head?
!activity co.a_hist_ume
!if var._res=0 -> later
!gesture co_ume lowered hold
co_ume[sad]: …… そう 。 そう いう {順番|じゅんばん} だった 。 {不思議|ふしぎ} だ ね 。 {誰|だれ} に も {話|はな}した こと が ない のに 、 {口|くち} が {覚|おぼ}えてる 。 || …Yes. That was the order. Strange. I've never told a soul, and yet my mouth remembers.
!walkto pc 15 23 left
!look co_ume pc
!prop co_ume book
!gesture co_ume handover pc
!gesture pc receive co_ume
co_ume: {植|う}え{付|つ}け{帳|ちょう} を {持|も}って お{行|い}き 。 {三|さん}{代|だい} {分|ぶん} の {字|じ} が ある 。 {変|へん} な {年|とし} が {一|ひと}つ ある から 、 {見|み}て ご{覧|らん} 。 || Take the planting book. It has three generations' handwriting in it. There's one odd year — have a look.
!give co_plantbook
?(comp=nao) !gesture comp nod co_ume
?(comp=nao) comp: {子|こ}ども を {連|つ}れて {逃|に}げた の は 、 ばあさん だった の か 。 {水路|すいろ} が {逃|に}げ{道|みち} 。 {石|いし} に {彫|ほ}って あった とおり だ 。 || So it was you who led the children out. Down the channel — just like the stone says.
?(comp=mio) !gesture comp lowered
?(comp=mio) comp[sad]: {子|こ}ども たち の {手|て} を {引|ひ}いて …… {怖|こわ}かった でしょう 。 || Leading the children by the hand… You must have been so frightened.
?(comp=mio) !gesture co_ume rubhands
?(comp=mio) co_ume: {怖|こわ}かった の かね 。 {覚|おぼ}えてる の は 、 {手|て} の {温|あたた}かさ だけ さ 。 || Was I? All I remember is how warm their hands were.
?(comp=ren) !gesture comp nod co_ume
?(comp=ren) comp: {話|はな}す {順番|じゅんばん} が {乱|みだ}れて も 、 {話|はなし} そのもの は {乱|みだ}れて いない 。 {確|たし}か な {記憶|きおく} です 。 || The telling was out of order, but the story itself wasn't. That's a true memory.
?(comp=suzu) !gesture comp aside
?(comp=suzu) comp[closed]: …… {水路|すいろ} の {下|した} で 、 {子|こ}ども を {数|かぞ}えて いた {人|ひと} たち が いた でしょう 。 …… {旅芸人|たびげいにん} の 。 || …There were people at the bottom of the channel, counting the children as they came, weren't there. …Travelling players.
?(comp=suzu) !gesture co_ume listen comp
?(comp=suzu) !gesture comp touchhair
?(comp=suzu) co_ume: …… ああ 。 いた ね 。 {派手|はで} な {衣装|いしょう} の まま 、 {桶|おけ} を {運|はこ}んで くれた 。 {赤|あか}い リボン の {娘|むすめ} が いた よ 。 || …Ah. There were. Carrying buckets in their gaudy costumes. There was a girl with a red ribbon.
!set co_hist_ume
!call co.hist_check
!end
:later
co_ume: {急|いそ}がなくて いい よ 。 {婆|ばあ} の {話|はなし} は 、 {逃|に}げ も {隠|かく}れ も しない から ね 。 || No hurry. An old woman's stories don't run off anywhere.

@scene co.ume_first
# Staged: Ume's nod of welcome; she looks across to her house over the beams that smell of smoke, then back
# with a shake of the head; your companion's own answer (Nao points to her house and her hand goes to her
# chin, Mio leans in to her, Ren's nod, Suzu's head goes down).
!gesture co_ume nod pc
co_ume: おや 、 {旅|たび} の {人|ひと} 。 {段々畑|だんだんばたけ} は {初|はじ}めて かい 。 {坂|さか} が {急|きゅう} だ から 、 {足元|あしもと} に {気|き} を お{付|つ}け 。 || Well now, travellers. First time on the terraces? The slopes are steep — mind your feet.
!gesture co_ume lookroad 5,24
co_ume: ウメ だ よ 。 {柿|かき} を {育|そだ}てて {六十年|ろくじゅうねん} 。 …… {変|へん} な こと を {言|い}う よう だ けど 、 {雨|あめ} の {日|ひ} に なる と 、 {家|いえ} の {梁|はり} から けむり の におい が する ん だ よ 。 || I'm Ume. Sixty years growing persimmons. …This may sound odd, but on rainy days my roof beams smell of smoke.
!look co_ume pc
!gesture co_ume shake
co_ume: {焚|た}き{火|び} なんか した こと ない {梁|はり} なのに ね 。 {毎年|まいとし} 、 {秋|あき} の {今頃|いまごろ} に なる と 、 その におい で {眠|ねむ}れなく なる 。 || And those beams never saw a fire. Every year about now, that smell keeps me awake.
?(comp=nao) !gesture comp point 5,24
?(comp=nao) comp: {梁|はり} は 、 どこ から {持|も}って きた もの です か 。 || Where did those beams come from?
?(comp=nao) !gesture co_ume chin
?(comp=nao) co_ume: さあ 。 {上|うえ} の {方|ほう} から {下|お}ろした 、 と {聞|き}いた よう な 。 || Hmm. Brought down from up the hill, I think I heard.
?(comp=mio) !gesture comp observe co_ume
?(comp=mio) comp[worry]: {眠|ねむ}れない の は 、 お{辛|つら}い です ね 。 {眠|ねむ}り を {助|たす}ける お{茶|ちゃ} を 、 {後|あと} で お{持|も}ち します 。 || Not sleeping must be hard. I'll bring you a tea that helps with sleep later.
?(comp=ren) !gesture comp nod co_ume
?(comp=ren) comp: {匂|にお}い は 、 {名|な} より {長|なが}く {残|のこ}る こと が あります 。 || Smells sometimes outlast names.
?(comp=suzu) !gesture comp lowered hold
?(comp=suzu) comp[closed]: …… {雨|あめ} の {日|ひ} の 、 けむり の におい 。 || …The smell of smoke on a rainy day.
!if co_clue_smoke -> end
!set co_clue_smoke
!var co_clues + 1
!call co.clue_check

@scene co.ume_beam
narr: {天井|てんじょう} から {下|お}ろした {古|ふる}い {梁|はり} が 、 {壁|かべ} に {立|た}て{掛|か}けて ある 。 {顔|かお} を {近|ちか}づける と 、 かすか に けむり の におい が した 。 || An old beam taken down from the ceiling leans against the wall. Bring your face close and there's the faintest smell of smoke.
!if co_clue_smoke -> end
!set co_clue_smoke
!var co_clues + 1
!call co.clue_check

@scene co.ume_after
# Staged: Ume's nod, a look up to the young trees on the upper terraces; you step to her side and she presses
# the maple-leaf pin on you.
!gesture co_ume nod pc
co_ume: {雨|あめ} の {日|ひ} の {梁|はり} の におい 、 {今|いま} でも する よ 。 でも もう {眠|ねむ}れる 。 {理由|りゆう} が {分|わ}かった から ね 。 || My beams still smell of smoke on rainy days. But I can sleep now. I know why.
!gesture co_ume lookroad up
co_ume: {上|うえ} の {段|だん} の {若|わか}い {木|き} も 、 {二十|はたち} に なった 。 {今年|ことし} から 、 {上|うえ} の {柿|かき} も {干|ほ}す こと に した よ 。 || The young trees on the upper terraces have turned twenty. From this year, I'm drying the upper persimmons too.
!if item.co_leaf_pin -> end
!walkto pc 15 23 left
!look co_ume pc
!prop co_ume leafpin
!gesture co_ume handover pc
!gesture pc receive co_ume
co_ume: …… そう だ 。 これ を あげよう 。 {紅葉|もみじ} の {髪飾|かみかざ}り 。 {旅|たび} の {人|ひと} に は 、 {似合|にあ}う よ 。 || …Oh, I know. Have this. A maple-leaf pin. It suits a traveller.
!give co_leaf_pin

@scene co.ume_post
# Staged: Ume looks up to the upper persimmons, then back to you; she rubs her hands over the backs she
# rubbed, shakes her head at forced medicine.
!gesture co_ume lookroad up
co_ume: {上|うえ} の {段|だん} の {柿|かき} が 、 {甘|あま}く なった よ 。 {火|ひ} を {知|し}ってる {土|つち} は 、 いい {実|み} を つける 。 || The upper persimmons have gone sweet. Soil that has known fire bears good fruit.
!look co_ume pc
?(end_mem_return) !gesture co_ume rubhands
?(end_mem_return) co_ume: {皆|みな} に {記憶|きおく} が {戻|もど}った {日|ひ} 、 わたし は {何|なに} も {変|か}わら なかった 。 {最初|さいしょ} から {預|あず}けて なかった から ね 。 {皆|みな} の {背中|せなか} を {撫|な}でて {回|まわ}った よ 。 || The day everyone's memories came back, nothing changed for me. I never gave mine away. I went round rubbing everyone's backs.
?(end_mem_choose) !gesture co_ume shake
?(end_mem_choose) co_ume: {皆|みな} が {自分|じぶん} で {選|えら}べる よう に した の は 、 {良|よ}い やり{方|かた} だ よ 。 {無理|むり} に {飲|の}ませる {薬|くすり} は 、 {薬|くすり} じゃ ない から ね 。 || Letting everyone choose for themselves was the right way. Medicine forced down someone's throat isn't medicine.
?(end_kasane_trial) co_ume: {番人|ばんにん} さん が {灯落|ひおち} で {皆|みな} に {頭|あたま} を {下|さ}げた そう だ ね 。 {会|あ}ったら 、 {干|ほ}し{柿|がき} を {一|ひと}つ あげる よ 。 {怒|おこ}る の は 、 それ から だ 。 || The keeper bowed to everyone down in Lanternfall, I hear. If I met them, I'd give them a dried persimmon first. The scolding can come after.
?(end_kasane_keeper) co_ume: {番人|ばんにん} さん は 、 {山|やま} で {書庫|しょこ} を {守|まも}ってる ん だろう 。 {寒|さむ}い ところ だ 。 {干|ほ}し{柿|がき} を {送|おく}って やった よ 。 {返事|へんじ} は {三頁|さんページ} も あった 。 || The keeper's minding the archive up the mountain. Cold place. I sent them dried persimmons. The reply ran to three pages.

@scene co.asa
# Staged: Asa points to a blank signpost, shrugs at the vanished writing, points up to the top fence where Ume
# got lost and looks from the middle signpost to you (later she points it out again); her nod of thanks and
# the straw hat handed over; a shrug at the funny "firebreak path", and once the village remembers, her nod.
!if co_signs_done -> done
!if quest.co_signs=active -> going
!gesture co_asa point 23,30
co_asa: {旅|たび} の {人|ひと} ！ ちょうど いい ところ に 。 {道|みち} に {迷|まよ}って ない ？ …… {迷|まよ}う よ ね 。 {道|みち}しるべ の {字|じ} が 、 {全部|ぜんぶ} {消|き}えちゃった ん だ もん 。 || Travellers! Good timing. Lost? …Of course you are. All the writing on the signposts has vanished.
!gesture co_asa shrug
co_asa: {雨|あめ} で {流|なが}れた ん じゃ ない の 。 {雨|あめ} なんて {降|ふ}って ない し 。 {朝|あさ} {来|き}たら 、 {真|ま}っ{白|しろ} に なってた 。 || It didn't wash off — it hasn't even rained. I came up one morning and they were just blank.
!gesture co_asa point up
co_asa: ウメ ばあちゃん が {夕方|ゆうがた} に {迷|まよ}って 、 {上|うえ} の {柵|さく} の {前|まえ} まで {行|い}っちゃった こと が ある の 。 {危|あぶ}ない よ ね 。 || Grandma Ume got lost at dusk once and ended up right at the top fence. Dangerous.
!gesture co_asa lookbetween 18,17 and=pc
co_asa: {真|ま}ん{中|なか} の {道|みち}しるべ 、 {直|なお}して くれない ？ {腕|うで} が {指|さ}してる {方|ほう} を {見|み}れば 、 {分|わ}かる はず だ から 。 || Could you fix the middle signpost? If you look where each arm points, you should be able to tell.
!quest co_signs 0
!end
:going
!gesture co_asa point 18,17
co_asa: {真|ま}ん{中|なか} の {段|だん} の {道|みち}しるべ だ よ 。 {十字|じゅうじ} に なってる ところ 。 || It's the signpost on the middle terrace, where the paths cross.
!end
:done
!gesture co_asa nod pc
co_asa[smile]: {道|みち}しるべ 、 ありがとう ！ ウメ ばあちゃん も 、 もう {迷|まよ}わない って 。 || Thanks for the signpost! Grandma Ume says she won't get lost any more.
!if quest.co_signs=done -> after
!prop co_asa strawhat
!gesture co_asa handover pc
!gesture pc receive co_asa
co_asa: これ 、 お{礼|れい} 。 {麦|むぎ}わら{帽子|ぼうし} 。 {予備|よび} だ けど 、 {日差|ひざ}し は {防|ふせ}げる よ 。 || Here, a thank-you. A straw hat. It's my spare, but it'll keep the sun off.
!quest co_signs done
!end
:after
!gesture co_asa shrug
co_asa: 「 {火除|ひよ}け{道|みち} 」 って 、 {変|へん} な {名前|なまえ} だ よ ね 。 {火|ひ} なんか {来|こ}ない のに 。 …… {来|こ}ない よ ね ？ || "Firebreak path" — funny name, isn't it. It's not like fire ever comes here. …It doesn't, does it?
?(co_restored) !gesture co_asa nod pc
?(co_restored) co_asa: …… {来|く}る ん だ ね 。 {来|き}た ん だ ね 。 だから {刈|か}る ん だ 。 {今|いま} は {分|わ}かる 。 || …It does come. It came. That's why we cut it. I understand now.

@scene co.asa_after
co_asa: {火除|ひよ}け{道|みち} を {刈|か}ったら 、 {段々畑|だんだんばたけ} の {形|かたち} が よく {見|み}える よう に なった 。 {昔|むかし} の {人|ひと} は 、 {火|ひ} の {通|とお}り{道|みち} まで {考|かんが}えて {段|だん} を {作|つく}った ん だ ね 。 || With the firebreaks cut, you can see the shape of the terraces properly. The old folk planned the terraces around where fire would run.
?(co_signs_done) co_asa: {道|みち}しるべ の 「 {火除|ひよ}け{道|みち} 」 、 {今|いま} は {誰|だれ} も {笑|わら}わない よ 。 || Nobody laughs at the "firebreak path" arm any more.

@scene co.asa_post
co_asa: {段々畑|だんだんばたけ} に 、 {新|あたら}しい {道|みち}しるべ を {三本|さんぼん} {立|た}てた の 。 {全部|ぜんぶ} 、 {火除|ひよ}け{道|みち} の {方|ほう} を {指|さ}す {腕|うで} {付|つ}き 。 || I put up three new signposts on the terraces. Every one has an arm pointing to the firebreaks.
?(end_archive_library) co_asa: {山|やま} の {書庫|しょこ} の {人|ひと} が 、 {道|みち}しるべ の {写|うつ}し を {取|と}り に {来|き}た よ 。 {道|みち} の {名前|なまえ} も 、 {皆|みな} で {持|も}って おく んだ って 。 || Someone from the mountain library came to copy our signposts. Road names are for everyone to keep, they said.

@scene co.signpost
# Staged: you lean in to the blank signpost; once the names come back, you look along its arms, and your
# companion answers in their own way (Nao's nod, Mio's laugh, Ren's open hand, Suzu points along the firebreak
# path).
!if co_signs_done -> end
!gesture pc observe 18,17
narr: {十字路|じゅうじろ} の {道|みち}しるべ 。 {四本|よんほん} の {腕|うで} が {四方|しほう} を {指|さ}して いる が 、 {字|じ} は {全部|ぜんぶ} {消|き}えて いる 。 || The crossroads signpost. Four arms point four ways, but every name has vanished.
!if quest.co_signs=active -> fix
narr: {誰|だれ} か が {困|こま}って いる かも しれない 。 || Someone might be having trouble with this.
!end
:fix
!activity co.a_signs
!if var._res=0 -> end
!sfx reveal
!gesture pc lookbetween left and=up
narr: {腕|うで} に {名前|なまえ} が {戻|もど}った 。 {下|くだ}り の {腕|うで} に 「 {里|さと} 」 、 {水路|すいろ} の {方|ほう} に 「 {水門|すいもん} 」 、 {上|うえ} に 「 {上|うえ} の {段|だん} 」 、 そして {草|くさ} の {帯|おび} の {方|ほう} に 「 {火除|ひよ}け{道|みち} 」 。 || The names come back to the arms: "Village" downhill, "Water gate" towards the channel, "Upper terraces" above — and along the strip of grass, "Firebreak path".
?(comp=nao) !gesture comp nod 18,17
?(comp=nao) comp: {道|みち} に {名前|なまえ} が {戻|もど}る と 、 {道|みち} も {急|きゅう}に {真面目|まじめ} な {顔|かお} を する な 。 || Give a road its name back and it suddenly looks serious.
?(comp=mio) !gesture comp laugh
?(comp=mio) comp[smile]: これ で ウメ さん も {迷|まよ}わない です ね 。 || Now Ume won't get lost.
?(comp=ren) !gesture comp palm
?(comp=ren) comp: {道|みち}しるべ は 、 {道|みち} の {約束|やくそく} です 。 …… {私|わたし} も 、 これ で {迷|まよ}わない 、 と {言|い}いたい ところ です が 。 || A signpost is a road's promise. …I'd like to say I won't get lost now either, but.
?(comp=suzu) !gesture comp point left
?(comp=suzu) comp: 「 {火除|ひよ}け{道|みち} 」 。 …… {消|け}された {名前|なまえ} の {中|なか} で 、 {一番|いちばん} {大事|だいじ} な の が {戻|もど}った わ ね 。 || "Firebreak path." …Of all the erased names, the most important one came back.
!set co_signs_done

@scene co.signpost_done
narr: 「 ↓ {里|さと} 」 「 ↗ {水門|すいもん} 」 「 ↑ {上|うえ} の {段|だん} 」 「 ← {火除|ひよ}け{道|みち} 」 。 {字|じ} は {新|あたら}しく 、 {深|ふか}く {彫|ほ}り{直|なお}されて いる 。 || "↓ Village", "↗ Water gate", "↑ Upper terraces", "← Firebreak path". The letters are fresh, cut deep.

@scene co.signpost_small
narr: {小|ちい}さな {道|みち}しるべ 。 {字|じ} が {消|き}えて いる 。 {真|ま}ん{中|なか} の {段|だん} の {大|おお}きな {道|みち}しるべ が {直|なお}れば 、 これ も {読|よ}める よう に なる かも しれない 。 || A small signpost, its lettering gone. If the big one on the middle terrace were fixed, this might come back too.

@scene co.headgate
narr: {水路|すいろ} の {始|はじ}まり の {水門|すいもん} 。 {板|いた} は {下|お}りて いて 、 {水|みず} は {細|ほそ}く しか {流|なが}れて いない 。 || The water gate at the head of the channel. The board is down, and only a thin stream runs through.
?(!co_restored) narr: {板|いた} を {上|あ}げる {車|くるま} に 、 {錆|さび} が {浮|う}いて いる 。 {長|なが}い こと {回|まわ}されて いない 。 || Rust blooms on the wheel that lifts the board. Nobody has turned it in a long time.
?(co_restored) narr: {車|くるま} は {油|あぶら} を {差|さ}されて {光|ひか}って いる 。 {横|よこ} の {石|いし} に 、 {新|あたら}しく {字|じ} が {彫|ほ}って ある 。 「 トモエ 、 ここ に {来|き}る 」 。 || The wheel shines with fresh oil. On the stone beside it, new letters have been cut: "Tomoe came here."
?(comp=ren) comp: {水門|すいもん} の {名|な} は 、 {水|みず} の {約束|やくそく} です 。 {開|あ}ければ 、 {下|した} へ {届|とど}く 。 || A water gate's name is the water's promise. Open it, and it reaches the fields below.

@scene co.terrace_marker
narr: {草|くさ} に {埋|う}もれた {石|いし} の {道標|どうひょう} 。 {苔|こけ} を {払|はら}う と 、 {字|じ} が {出|で}て きた 。 「 {火除|ひよ}け{道|みち} ・ {二|に} 」 。 || A stone marker buried in grass. Brush off the moss and letters appear: "Firebreak — No. 2."
?(comp=nao) comp: {二本目|にほんめ} 、 って こと は {一本目|いっぽんめ} と {三本目|さんぼんめ} も ある わけ だ 。 || "Number two" means there's a one and a three somewhere.

@scene co.goat
# Staged: you lean in to the old goat with its faded tassel; with Suzu, she starts back — the Director! — the
# goat glances at her, she laughs, and thanks it for its service with both hands.
!if comp=suzu -> suzu
!gesture pc observe co_goat
narr: {年|とし} を {取|と}った ヤギ が 、 {柿|かき} の {葉|は} を {食|た}べて いる 。 {首|くび} に 、 {色褪|いろあ}せた {金|きん} の {房|ふさ} が {下|さ}がって いる 。 || An old goat is eating persimmon leaves. From its neck hangs a faded gold tassel.
co_ume: その ヤギ かい 。 {何年|なんねん} か {前|まえ} に 、 {通|とお}りすがり の {一座|いちざ} が {置|お}いて いった の さ 。 「 {引退|いんたい} です 」 って ね 。 {葉|は} ばかり {食|た}べて 、 {働|はたら}き は しない よ 。 || That goat? A passing troupe left it here a few years back. "Retired," they said. Eats leaves all day and never lifts a hoof.
!end
:suzu
!gesture pc observe co_goat
narr: {年|とし} を {取|と}った ヤギ が 、 {柿|かき} の {葉|は} を {食|た}べて いる 。 {首|くび} に 、 {色褪|いろあ}せた {金|きん} の {房|ふさ} 。 || An old goat is eating persimmon leaves. From its neck hangs a faded gold tassel.
?(comp=suzu) !gesture comp recoil
comp[surprise]: …… {座長|ざちょう} ？ {座長|ざちょう} じゃ ない ！ ここ に いた の ？ || …Director? It's the Director! So this is where you ended up?
!gesture co_goat stiff comp
narr: ヤギ は スズ を ちらり と {見|み}て 、 また {葉|は} を {食|た}べ{始|はじ}めた 。 || The goat glances at Suzu and goes back to its leaves.
?(comp=suzu) !gesture comp laugh
comp[laugh]: {一座|いちざ} の ヤギ よ 。 {座長|ざちょう} が {自分|じぶん} より {言|い}う こと を {聞|き}かない から って 、 {座長|ざちょう} って {名前|なまえ} を {付|つ}けた の 。 {幕|まく} を {食|た}べる の が {得意|とくい} で ね 。 || It's the troupe's goat. The real director named it that, because it listened to him even less than he did. Its speciality was eating the curtain.
?(comp=suzu) !gesture comp thanks
comp[smile]: …… {柿|かき} の {葉|は} の {方|ほう} が {美味|おい}しい って {顔|かお} ね 。 {良|よ}い {引退|いんたい} {先|さき} を {見|み}つけた わ ね 、 {座長|ざちょう} 。 || …You look like you've decided persimmon leaves beat curtains. You found a fine place to retire, Director.
`, 'ch3/terraces');
