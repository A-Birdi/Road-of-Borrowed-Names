/* Line B — "The Name Nobody Calls" (quest lq_road).
 * Reedwake (the blank lantern past the ferry house; Old Yasu) → Saltglass
 * (Tetsu) → Cinder Orchard (Grandma Ume: the Koharu persimmon) → Reedwake
 * (Yasu remembers; the name is written; lq_ally2; Koharuno opens) →
 * Koharuno (the tree) → Lanternfall (Kayo) → Koharuno. See docs/STORY.md. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene lq.road_lantern
!if quest.lq_road>=4 -> write
narr: {古|ふる}い {灯|あか}り 。 {笠|かさ} の {紙|かみ} は {破|やぶ}れて いない のに 、 {字|じ} が {一|ひと}つ も ない 。 {嵐|あらし} より ずっと {前|まえ} から {白|しろ}かった よう に {見|み}える 。 || An old lantern. The paper shade isn't torn, yet there isn't a single letter on it. It looks as if it was blank long before the storm.
narr: {灯|あか}り の {向|む}こう に 、 {草|くさ} に {埋|う}もれた {道|みち} が {東|ひがし} へ {続|つづ}いて いる 。 || Beyond it, a path buried in grass runs east.
?(quest.lq_road>=1) narr: {書|か}く {名前|なまえ} が {分|わ}からない うち は 、 {笠|かさ} は {白|しろ}い まま だ 。 || Until you know the name to write, the shade stays blank.
?(!quest.lq_road) !quest lq_road 0
?(comp=nao) comp: {行|い}き{先|さき} の ない {灯|あか}り か 。 {宛名|あてな} の ない {荷物|にもつ} と {同|おな}じ だ 。 {気味|きみ} が {悪|わる}い 。 || A lantern with no destination. Like a parcel with no address. Gives me the creeps.
?(comp=mio) comp[worry]: ラベル を {剥|は}がした {瓶|びん} みたい 。 {中身|なかみ} が あった こと まで 、 {忘|わす}れられて しまう の ね 。 || Like a jar with its label peeled off. Even the fact that it held something gets forgotten.
?(comp=ren) comp[think]: {名前|なまえ} を {失|うしな}った {道|みち} は 、 {行|い}き{先|さき} を {忘|わす}れる 。 …… {師匠|ししょう} の {教|おし}え です 。 {本当|ほんとう} に {見|み}る の は 、 {初|はじ}めて です 。 || A road that loses its name forgets where it leads. …My teacher taught me that. It's the first time I've seen it for real.
?(comp=suzu) comp: {誰|だれ} も {台詞|せりふ} を {覚|おぼ}えて いない {芝居|しばい} の {舞台|ぶたい} だ ね 。 || A stage for a play nobody remembers the lines to.
!end
:write
!call lq.road_write

@scene lq.road_lantern_lit
narr: {笠|かさ} に は 「 {小春野|こはるの} 」 。 {端|はし} の {方|ほう} に 、 {名前|なまえ} が {二|ふた}つ {並|なら}んで いる 。 $name と 、 $comp 。 || The shade reads "Koharuno". Near the edge, two names side by side: $name and $comp.

@scene lq.road_loops
narr: {草|くさ} の {道|みち} を {東|ひがし} へ {進|すす}む 。 {木|き} の {間|あいだ} を {抜|ぬ}けた …… と {思|おも}ったら 、 {目|め} の {前|まえ} に さっき の {灯|あか}り が あった 。 || You follow the grassy path east. You come out between the trees… and there's the same lantern in front of you.
!move pc left 1
?(!quest.lq_road) !quest lq_road 0
?(comp=nao) comp: {道|みち} が {回|まわ}ってる 。 {地図|ちず} が {迷|まよ}ってる ん じゃ ない 。 {道|みち} の {方|ほう} が {迷|まよ}ってる ん だ 。 || The path is going round in circles. It's not the map that's lost — it's the road.
?(comp=mio) comp[worry]: …… {今|いま} 、 {確|たし}か に {東|ひがし} へ {歩|ある}いた わ よ ね ？ || …We did just walk east, didn't we?
?(comp=ren) comp[shy]: …… {今|いま} の は 、 {私|わたし} の {方向|ほうこう}{音痴|おんち} の せい で は ありません 。 {念|ねん}のため 。 || …That was not my sense of direction. Just so we're clear.
?(comp=suzu) comp: {舞台|ぶたい} の {袖|そで} に {入|はい}ったら 、 {反対|はんたい} の {袖|そで} から {出|で}て きた 。 {古|ふる}い {手品|てじな} だ よ 。 || Walk off into the wings and come back on from the other side. It's an old trick.

@scene lq.road_marker
narr: {折|お}れた {石|いし} の {道標|みちしるべ} 。 {上|うえ} の {半分|はんぶん} は ない 。 {残|のこ}った {所|ところ} に 、 {字|じ} が {少|すこ}し だけ {読|よ}める 。 「 …… {野|の} へ 」 。 || A broken stone waymarker. The top half is gone. What's left still shows a few characters: "…no, this way" — the end of a place name.
narr: {石|いし} に {彫|ほ}った {字|じ} は {消|き}えない 。 でも 、 {石|いし} ごと なくなる こと は ある 。 || Words carved in stone don't fade. But the stone itself can go missing.
?(quest.lq_road>=4) narr: {小春野|こはるの} 。 {折|お}れた {石|いし} の {字|じ} と 、 {合|あ}って いる 。 || Koharuno. It fits the broken stone.

@scene lq.road_yasu1
!faceplayer yasu
pc: {渡|わた}し{小屋|ごや} の {先|さき} の {灯|あか}り に 、 {名前|なまえ} が ありません でした 。 || The lantern past the ferry house has no name on it.
yasu[think]: …… あれ を {見|み}た か 。 || …You saw that one, did you.
yasu: {昔|むかし} 、 {川|かわ} の {向|む}こう に {村|むら} が あった 。 {家|いえ} が {十|とお} ほど の 、 {小|ちい}さな {村|むら} だ 。 わし は {二十年|にじゅうねん} 、 あそこ に {住|す}んで いた 。 {女房|にょうぼう} の {里|さと} で な 。 || Long ago there was a hamlet across the river. Ten houses or so, a small place. I lived there twenty years. It was my wife's home.
yasu: {真|ま}ん{中|なか} に {大|おお}きな {柿|かき} の {木|き} が あって な 。 {秋|あき} に なる と 、 {枝|えだ} が {折|お}れる ほど {実|み} が なった 。 {甘|あま}い {柿|かき} だった 。 {今|いま} でも {味|あじ} は {覚|おぼ}えて いる 。 || There was a great persimmon tree in the middle. In autumn it bore so much fruit the branches nearly broke. Sweet ones. I can still taste them.
yasu[sad]: …… だが 、 {村|むら} の {名前|なまえ} が {出|で}て こん@来る=(won't come) 。 {女房|にょうぼう} が {死|し}んで から 、 {誰|だれ} も あの {名前|なまえ} を {口|くち} に しなく なった 。 {気|き} が ついたら 、 わし の {頭|あたま} から も {消|き}えとった 。 || …But the name won't come. After my wife died, nobody said it anymore. Before I knew it, it had gone out of my head too.
yasu: {三十年|さんじゅうねん} {前|まえ} の {大水|おおみず} で 、 {村|むら} は {流|なが}された 。 みんな {舟|ふね} で {川|かわ} を {下|くだ}って いった 。 {下|しも} の {港|みなと} の {船乗|ふなの}り なら 、 {誰|だれ} を どこ へ {運|はこ}んだ か 、 {覚|おぼ}えて いる かも しれん 。 || The great flood thirty years ago took the hamlet. Everyone went downriver by boat. The boatmen at the harbour downstream might remember who they carried, and where.
!quest lq_road 1
?(comp=nao) comp: {下|しも} の {港|みなと} …… {潮硝子|しおがらす} だ な 。 {船|ふね} の {人間|にんげん} は 、 {積|つ}んだ {荷|に} を {忘|わす}れない 。 {人|ひと} も {荷|に} の うち だ 。 || The harbour downstream… Saltglass. Boat people don't forget a cargo. Passengers count.
?(comp=mio) comp: {味|あじ} を {覚|おぼ}えて いる なら 、 {全部|ぜんぶ} {忘|わす}れた わけ じゃ ありません よ 。 || If you remember the taste, you haven't forgotten everything.
?(comp=ren) comp: 「 {迷|まよ}ったら 、 {一番|いちばん} {古|ふる}い {名前|なまえ} に {戻|もど}れ 」 。 …… {師匠|ししょう} の {言葉|ことば} です 。 {古|ふる}い {名前|なまえ} を {知|し}って いる {人|ひと} を {探|さが}しましょう 。 || "When in doubt, go back to the oldest name." My teacher's words. Let's find someone who knows the old name.
?(comp=suzu) comp: {名前|なまえ} は {忘|わす}れて も 、 {柿|かき} の {味|あじ} は {覚|おぼ}えてる 。 {舌|した} の {方|ほう} が {物覚|ものおぼ}え が いい ね 。 || He's forgotten the name but not the taste. His tongue has the better memory.

@scene lq.road_tetsu
!faceplayer tetsu
!if quest.lq_road>=0 -> asked
tetsu: {葦|あし}ノ{瀬|せ} から {来|き}た ん だった な 。 || You came down from Reedwake, didn't you.
tetsu: {親父|おやじ} の {船|ふね} は 、 {昔|むかし} {葦|あし}ノ{瀬|せ} の {川|かわ} を {上|のぼ}って いた 。 {渡|わた}し{場|ば} の {先|さき} に 、 {柿|かき} の {村|むら} が あって な 。 {秋|あき} は {柿|かき} を {積|つ}んで {下|くだ}った もん だ 。 || My father's boat used to work up Reedwake's river. Past the ferry landing there was a persimmon village. In autumn he'd come back down loaded with persimmons.
tetsu: {今|いま} {通|とお}って も 、 {渡|わた}し{場|ば} の {先|さき} に は {道|みち} ひとつ {見|み}えない だろう 。 {名前|なまえ} の ない {灯|あか}り が {立|た}ってる だけ だ 。 || Pass that way now and you won't see so much as a path beyond the landing. Just a lantern with no name.
!goto tell
:asked
?(quest.lq_road=0) pc: {葦|あし}ノ{瀬|せ} の {川|かわ} の {向|む}こう に 、 {名前|なまえ} の {消|き}えた {道|みち} が ある ん です 。 {昔|むかし} 、 {村|むら} が あった そう です 。 || Across Reedwake's river there's a road whose name has faded. There used to be a hamlet, they say.
?(quest.lq_road=1) pc: {葦|あし}ノ{瀬|せ} の {川|かわ} の {向|む}こう に あった {村|むら} を 、 {知|し}りません か 。 {大|おお}きな {柿|かき} の {木|き} の ある {村|むら} です 。 || Do you know the hamlet that used to be across Reedwake's river? The one with the great persimmon tree?
tetsu[think]: …… {柿|かき} の {村|むら} だ な 。 {親父|おやじ} の {船|ふね} で 、 よく {柿|かき} を {積|つ}んで {下|くだ}った 。 || …The persimmon village. We used to bring persimmons down on my father's boat.
:tell
tetsu[think]: {大水|おおみず} の {年|とし} 、 {親父|おやじ} は その {村|むら} の {人|ひと} を {乗|の}せて {下|くだ}った 。 {俺|おれ} も まだ {若|わか}くて 、 {親父|おやじ} の {船|ふね} を {手伝|てつだ}って いた 。 || The flood year, my father brought that village's people downriver. I was young then, working on his boat.
tetsu: {泥|どろ} だらけ の {人|ひと} たち が 、 {柿|かき} の {枝|えだ} を {抱|かか}えて いた 。 {実|み} じゃ ない 。 {切|き}った {枝|えだ} だ 。 「 {向|む}こう で {接|つ}ぐ ん だ 」 と {言|い}って 、 {果樹園|かじゅえん} の {方|ほう} へ {上|のぼ}って いった 。 || Mud-covered people, holding persimmon branches. Not fruit — cut branches. "We'll graft them where we're going," they said, and went up toward the orchard country.
tetsu: {村|むら} の {名前|なまえ} か 。 …… {親父|おやじ} は 「 {柿|かき} の {村|むら} 」 と しか {呼|よ}ばなかった 。 {悪|わる}い な 。 || The village's name? …Dad only ever called it "the persimmon village". Sorry.
!set lq_road_tetsu
!quest lq_road 2
?(comp=nao) comp: {実|み} じゃ なくて {枝|えだ} を {持|も}って {逃|に}げた 。 {次|つぎ} が ある と {思|おも}ってた ん だ な 。 || They fled carrying branches, not fruit. They believed there'd be a next time.
?(comp=mio) comp: {接|つ}ぎ{木|き} なら 、 {元|もと} の {木|き} と {同|おな}じ {実|み} が なります 。 {村|むら} の {柿|かき} は 、 どこか で まだ {生|い}きて いる かも しれません 。 || A graft bears the same fruit as the tree it came from. The village's persimmon may still be alive somewhere.
?(comp=ren) comp: {灰実|はいみ} の {里|さと} です ね 。 {果樹園|かじゅえん} の {人|ひと} は 、 {木|き} {一本|いっぽん} {一本|いっぽん} に {名前|なまえ} を {付|つ}けます 。 || Cinder Orchard, then. Orchard people name every single tree.
?(comp=suzu) comp: {逃|に}げる {時|とき} に {持|も}って いく もの で 、 その {人|ひと} が {分|わ}かる って {言|い}う よ ね 。 {枝|えだ} か あ 。 || They say what people take when they run tells you who they are. Branches, huh.

@scene lq.road_ume
!faceplayer co_ume
pc: {川|かわ} の {向|む}こう の {村|むら} から {来|き}た {柿|かき} の {木|き} を 、 {知|し}りません か 。 {大水|おおみず} の {年|とし} に 、 {枝|えだ} を {持|も}って きた {人|ひと} たち が いた はず です 。 || Do you know of a persimmon that came from a village across a river? People brought cuttings here the year of the great flood.
co_ume[surprise]: …… {小春|こはる} の こと かい 。 || …You mean Koharu?
co_ume: うち の {段|だん} の いちばん {上|うえ} に ある 、 いちばん {甘|あま}い {柿|かき} さ 。 {東|ひがし} の {川|かわ} の {向|む}こう の {大木|たいぼく} から {接|つ}いだ って 、 {母|はは} が {言|い}ってた よ 。 {枝|えだ} を {持|も}って きた {人|ひと} たち は 、 {冬|ふゆ} の {前|まえ} に また どこか へ {行|い}って しまった けど ね 。 || The sweetest persimmon we've got, on the top terrace. My mother said it was grafted from a great old tree across a river in the east. The folk who brought the cuttings moved on again before winter.
co_ume[think]: {小春|こはる} の {頃|ころ} に {甘|あま}く なる から 、 {小春|こはる} 。 …… そう {思|おも}ってた けど 、 {違|ちが}う の かも しれない ね 。 {実|み} は 、 {生|う}まれた {所|ところ} の {名前|なまえ} を {借|か}りる こと が ある から 。 || It sweetens in the koharu days, so it's called Koharu. …That's what I always thought. But maybe not. Fruit sometimes borrows the name of the place it came from.
co_ume[smile]: {毎年|まいとし} 、 {採|と}る {日|ひ} に は 「 {小春|こはる} ！ {小春|こはる} ！ 」 って {大声|おおごえ} で {呼|よ}び ながら {採|と}る ん だ よ 。 {呼|よ}ばれない {名前|なまえ} は {枯|か}れる から ね 。 || Every year on picking day we call out "Koharu! Koharu!" as we pick. A name nobody calls withers, you know.
co_ume: ほら 、 {去年|きょねん} の {干|ほ}し{柿|がき} だ 。 その お{年寄|としよ}り に {食|た}べさせて ごらん 。 {舌|した} は {頭|あたま} より {物覚|ものおぼ}え が いい から ね 。 || Here — a dried one from last year. Let the old man taste it. The tongue remembers better than the head.
!give lq_koharu_fruit
!set lq_road_name
!note lq_koharubiyori
!quest lq_road 3
?(comp=nao) comp: {実|み} が {名前|なまえ} を {運|はこ}んでた わけ か 。 {三十年|さんじゅうねん} 、 {誰|だれ} に も {気|き}づかれず に 。 …… {立派|りっぱ} な {配達|はいたつ} だ 。 || So the fruit was carrying the name all along. Thirty years, and nobody noticed. …That's proper delivery.
?(comp=mio) comp: {植物|しょくぶつ} の {名前|なまえ} は 、 {庭|にわ} より {長|なが}く {生|い}きる こと が ある んです 。 {薬草|やくそう} も そう 。 || Plant names can outlive the gardens they grew in. Herbs are the same.
?(comp=ren) comp: 「 {迷|まよ}ったら 、 {一番|いちばん} {古|ふる}い {名前|なまえ} に {戻|もど}れ 」 。 …… {柿|かき} の {一番|いちばん} {古|ふる}い {名前|なまえ} が 、 {村|むら} の {名前|なまえ} だった の かも しれません 。 || "When in doubt, go back to the oldest name." …Perhaps the persimmon's oldest name was the village's.
?(comp=suzu) comp[laugh]: {借|か}りた {名前|なまえ} で {生|い}き{延|の}びて きた わけ だ 。 {芸名|げいめい} みたい な もん だ ね 。 || So it's lived on under a borrowed name. Like a stage name.

@scene lq.road_yasu2
!faceplayer yasu
pc: {灰実|はいみ} の {里|さと} に 、 {川|かわ} の {向|む}こう から {来|き}た {柿|かき} が ありました 。 「 {小春|こはる} 」 と {呼|よ}ばれて います 。 || In Cinder Orchard there's a persimmon that came from across a river. They call it Koharu.
narr: $name は 、 ウメ の {干|ほ}し{柿|がき} を ヤス に {渡|わた}した 。 ヤス は {黙|だま}って 、 {一口|ひとくち} かじった 。 || You hand Yasu Ume's dried persimmon. Without a word, he takes a bite.
yasu[surprise]: …… {小春|こはる} 。 || …Koharu.
yasu[sad]: {小春|こはる} …… {小春野|こはるの} 。 {小春野|こはるの} だ 。 ミツ が 「 {小春野|こはるの} の {柿|かき} が いちばん 」 って 、 {毎年|まいとし} {言|い}ってた 。 || Koharu… Koharuno. Koharuno. Mitsu used to say it every year: "Koharuno persimmons are the best."
yasu: {小春野|こはるの} 。 …… {声|こえ} に {出|だ}す の は 、 {三十年|さんじゅうねん} ぶり だ 。 || Koharuno. …First time I've said it aloud in thirty years.
yasu: {灯|あか}り に {書|か}いて やって くれ 。 わし の {字|じ} じゃ 、 もう {残|のこ}らん@残る 。 あんた の {字|じ} なら …… 。 || Write it on the lantern for me. My writing won't hold anymore. But yours…
yasu: {先|さき} に {行|い}って {待|ま}ってる 。 || I'll go ahead and wait there.
!take lq_koharu_fruit
!quest lq_road 4
?(comp=nao) comp: …… {名前|なまえ} が {口|くち} から {出|で}る {瞬間|しゅんかん} って の は 、 {何度|なんど} {見|み}て も いい もん だ な 。 || …The moment a name comes back out of someone's mouth. Never gets old.
?(comp=mio) comp[smile]: よかった ……。 ヤス さん 、 {顔色|かおいろ} が {変|か}わりました 。 || Oh, good… Yasu's colour has come back.
?(comp=ren) comp: {名前|なまえ} を {呼|よ}ぶ {人|ひと} が いる 。 これ なら 、 {灯|あか}り に {書|か}いて も {根|ね} を {張|は}ります 。 || Someone calls the name now. Written on the lantern, it'll take root.
?(comp=suzu) comp[smile]: いい {台詞|せりふ} だった 。 {三十年|さんじゅうねん} {待|ま}った {甲斐|かい} が ある よ 。 || That was a good line. Worth thirty years of waiting.
!refresh

@scene lq.road_yasu_bank
!faceplayer yasu_bank
!call lq.road_write

@scene lq.road_write
narr: {白|しろ}い {笠|かさ} の {前|まえ} に {立|た}つ 。 ヤス が {隣|となり} で {待|ま}って いた 。 || You stand before the blank shade. Yasu is waiting beside it.
yasu: {頼|たの}む 。 || Please.
!challenge lq.c_koharu
!if var._res=0 -> later
narr: {笠|かさ} に 「 {小春野|こはるの} 」 の {字|じ} が {入|はい}った 。 {字|じ} は {滑|すべ}り{落|お}ちない 。 {灯|あか}り が 、 {静|しず}か に ともった 。 || The name "Koharuno" goes onto the shade. It doesn't slide off. The lantern lights quietly.
narr: {草|くさ} の {道|みち} の {先|さき} で 、 {木|き} の {枝|えだ} が {少|すこ}し {分|わ}かれた よう に {見|み}えた 。 || Down the grassy path, the branches seem to part a little.
yasu: …… {小春野|こはるの} 。 {道|みち} が {思|おも}い{出|だ}した な 。 || …Koharuno. The road's remembered.
yasu: {小春野|こはるの} の {灯|あか}り に は 、 {昔|むかし} から {決|き}まり が あって な 。 {一緒|いっしょ} に {渡|わた}った {者|もの} は 、 {笠|かさ} の {端|はし} に {二人|ふたり} の {名前|なまえ} を {並|なら}べて {書|か}く 。 {帰|かえ}り{道|みち} を {忘|わす}れない よう に 。 || The Koharuno lantern had a custom. People who crossed together wrote both their names side by side at the edge of the shade. So they'd never forget the way home.
yasu: わし と ミツ の {名前|なまえ} も 、 {昔|むかし} は そこ に あった 。 …… あんた たち も {書|か}いて いけ 。 || Mitsu's name and mine used to be there. …You two write yours as well.
narr: $name が {名前|なまえ} を {書|か}く と 、 その {横|よこ} に 、 {違|ちが}う {字|じ} で 「 $comp 」 。 || You write your name, and beside it, in a different hand: "$comp".
?(comp=nao) comp[shy]: …… {二人|ふたり} {分|ぶん} の {宛名|あてな} か 。 {悪|わる}く ない 。 {戦|たたか}い でも 、 あんた に {来|く}る もの は 、 {俺|おれ} に も {来|く}る と {思|おも}え 。 {半分|はんぶん} {引|ひ}き{受|う}ける 。 || …An address for two. Not bad. In a fight, too — whatever comes for you, count it as coming for me. I'll take half.
?(comp=mio) comp[smile]: {並|なら}んだ {名前|なまえ} って 、 {支|ささ}え{合|あ}って いる みたい です ね 。 …… {戦|たたか}い の {時|とき} も 、 {一人|ひとり} で {受|う}け{止|と}めない で 。 わたし が {隣|となり} に います 。 || Names side by side look like they're holding each other up. …In battle too, don't take it all alone. I'm right beside you.
?(comp=ren) comp: {名前|なまえ} は 、 {書|か}き{手|て} が {信|しん}じて いれば {根|ね} を {張|は}る 。 …… {私|わたし} は 、 この {二|ふた}つ の {名前|なまえ} を {信|しん}じて います 。 {戦|たたか}い の {中|なか} でも 、 あなた の {前|まえ} に {立|た}ちます 。 || A name takes root if the writer believes in it. …I believe in these two. In a fight, too, I'll stand in front of you.
?(comp=suzu) comp[laugh]: {二枚|にまい}{看板|かんばん} って やつ だ ね ！ …… {真面目|まじめ} に {言|い}う と 、 {戦|たたか}い で あんた が {狙|ねら}われたら 、 {客|きゃく} の {目|め} は {私|わたし} が {引|ひ}き{受|う}ける 。 {二人|ふたり} で {一組|ひとくみ} の {芸|げい} だ から ね 。 || A double bill! …Seriously, though: if something takes aim at you in a fight, I'll draw the audience's eye. We're a two-person act.
!toast {相棒|あいぼう} が {戦|たたか}い で 、 あなた と {並|なら}んで {立|た}つ よう に なった 。 || Your companion will now stand with you in battle.
!set lq_road_open lq_ally2
!note lq_koharuno
!quest lq_road 5
yasu: …… {先|さき} に {行|い}って {見|み}て きて くれ 。 わし は 、 {足|あし} が {言|い}う こと を {聞|き}く {日|ひ} に {行|い}く 。 || …Go and have a look first. I'll go on a day my legs agree to it.
yasu[think]: {木守|きもり} の {娘|むすめ} の カヨ は 、 {大水|おおみず} の {後|あと} 、 {灯落|ひおち} の おば の {所|ところ} へ {預|あず}けられた 。 …… {生|い}きて いれば 、 もう {四十|よんじゅう} を {過|す}ぎた ころ だ 。 || The tree-keeper's girl, Kayo, was sent to her aunt in Lanternfall after the flood. …She'd be past forty now, if she's alive.
!autosave
!refresh
!end
:later
yasu: {急|いそ}がんで@急ぐ いい 。 {三十年|さんじゅうねん} {待|ま}った ん だ 。 || No need to hurry. It's waited thirty years.

@scene lq.road_yasu_after
!faceplayer yasu
yasu: {毎朝|まいあさ} 、 {桟橋|さんばし} で 「 {小春野|こはるの} 」 と {言|い}う こと に した 。 もう {二度|にど} と {滑|すべ}り{落|お}ちない よう に な 。 || I've made a habit of saying "Koharuno" on the pier every morning. So it never slips away again.
yasu[smile]: カヨ が コウジ の {舟|ふね} で 、 {柿|かき} を {届|とど}けて くれる 。 ミツ の {干|ほ}し{柿|がき} と 、 {同|おな}じ {味|あじ} が する よ 。 || Kayo sends persimmons over on Kōji's boat. They taste just like Mitsu's dried ones.

@scene lq.kh_arrive
!set lq_kh_seen
narr: {道|みち} が {開|ひら}けた 。 {沢|さわ} の {向|む}こう に 、 {誰|だれ} も {住|す}んで いない {家|いえ} が {並|なら}んで いる 。 {屋根|やね} の {藁|わら} は 、 {灰色|はいいろ} に {変|か}わって いた 。 || The path opens out. Beyond a stream stand houses where nobody lives, their thatch gone grey.
narr: {村|むら} の {真|ま}ん{中|なか} に 、 {大|おお}きな {柿|かき} の {木|き} が {立|た}って いた 。 {採|と}る {人|ひと} の いない {実|み} が 、 {枝|えだ} いっぱい に {赤|あか}く {光|ひか}って いる 。 || In the middle of the hamlet stands a great persimmon tree. Fruit that nobody picks glows red along every branch.
?(comp=nao) comp: {誰|だれ} も {住|す}んでない のに 、 {道|みち} が {残|のこ}ってる 。 …… {道|みち} の {方|ほう} も 、 {誰|だれ} か を {待|ま}ってた の かも な 。 || Nobody lives here, yet the path's still here. …Maybe the road was waiting for someone too.
?(comp=mio) comp: …… {静|しず}か 。 でも 、 {悲|かな}しい {静|しず}か さ じゃ ない わ 。 {眠|ねむ}って いた だけ みたい 。 || …So quiet. But not a sad quiet. As if it was only asleep.
?(comp=ren) comp: {灯|あか}り の {名前|なまえ} {一|ひと}つ で 、 {村|むら} が {一|ひと}つ {戻|もど}る 。 …… {灯守|ひもり} に なって 、 よかった 。 || One lantern's name, and a whole hamlet comes back. …I'm glad I became a keeper.
?(comp=suzu) comp: {幕|まく} が {上|あ}がった 。 {役者|やくしゃ} は まだ いない けど 、 {舞台|ぶたい} は ずっと {待|ま}ってた ね 。 || The curtain's up. No actors yet — but the stage has been waiting all along.

@scene lq.kh_tree
narr: {太|ふと}い {幹|みき} に 、 {低|ひく}い {所|ところ} から {順|じゅん} に 、 {刃物|はもの} で {刻|きざ}んだ {線|せん} が ある 。 {子|こ}ども の {背|せ} を {測|はか}った {跡|あと} だ 。 || On the thick trunk, from low down upward, are lines cut with a blade — where a child's height was measured.
narr: {線|せん} の {横|よこ} に 、 {同|おな}じ {名前|なまえ} 。 「 かよ {五|いつ}つ 」 「 かよ {八|やっ}つ 」 …… {一番|いちばん} {上|うえ} は 「 かよ {十二|じゅうに} 」 。 そこ で {止|と}まって いる 。 || Beside each line, the same name. "Kayo, 5". "Kayo, 8"… The highest says "Kayo, 12". There they stop.
?(quest.lq_road=done) narr: {十二|じゅうに} の {線|せん} の {上|うえ} に 、 {新|あたら}しい {線|せん} が {一本|いっぽん} 。 「 かよ {四十二|よんじゅうに} 」 。 || Above the twelve there is one new line: "Kayo, 42".
!if quest.lq_road>=6 -> end
!if quest.lq_road<5 -> end
!quest lq_road 6
?(comp=nao&sb_arrived) comp: {十二|じゅうに} で {止|と}まった {背|せ} か 。 …… {雪鈴|ゆきすず} の {石段|いしだん} の {柱|はしら} と {同|おな}じ だ 。 || Height marks that stop at twelve. …Like the post on the stair in Snowbell.
?(comp=nao&!sb_arrived) comp: {十二|じゅうに} で {止|と}まった {背|せ} か 。 …… その {先|さき} を {測|はか}る {人|ひと} が 、 いなかった わけ だ 。 || Height marks that stop at twelve. …Nobody was left to measure the rest.
?(comp=mio) comp: …… {背|せ} を {測|はか}って もらえる って 、 {大事|だいじ} に されて いた って こと よ ね 。 || …Having your height measured means someone cherished you.
?(comp=ren) comp: {刃物|はもの} で {刻|きざ}んだ {名前|なまえ} は 、 {静寂|しじま} に も {消|け}せません 。 {木|き} が {覚|おぼ}えて いて くれた んです 。 || A name cut with a blade can't be lifted even by the Hush. The tree remembered it for her.
?(comp=suzu) comp: {十二|じゅうに} の {次|つぎ} は 、 {本人|ほんにん} に {刻|きざ}んで もらわない と ね 。 || After twelve — she'll have to come and carve the next one herself.

@scene lq.kh_stone
narr: {苔|こけ} の {生|は}えた {石|いし} に 、 {名前|なまえ} が {並|なら}んで {彫|ほ}って ある 。 {上|うえ} に 「 {小春野|こはるの} の {者|もの} 」 。 || Names are carved in rows on a mossy stone. At the top: "The people of Koharuno".
narr: 「 ヤス ・ ミツ 」 「 {木守|きもり} ゲンタ ・ ハル ・ カヨ 」 「 トメ 」 「 ヨシゾウ ・ キミ ・ サブ 」 「 ヨネ ・ チグサ 」 …… {石|いし} の {字|じ} は 、 {一|ひと}つ も {消|き}えて いない 。 || "Yasu, Mitsu". "Genta the tree-keeper, Haru, Kayo". "Tome". "Yoshizō, Kimi, Sabu". "Yone, Chigusa"… Not one of the carved names has faded.
?(lq_fare_found) narr: 「 チグサ 」 。 {峠|とうげ} で お{茶|ちゃ} を いれて いる {人|ひと} と 、 {同|おな}じ {名前|なまえ} だ 。 || "Chigusa" — the same name as the woman who brews tea at the pass.
?(comp=nao) comp: {全員|ぜんいん} {分|ぶん} の {宛名|あてな} が 、 ここ に ある 。 {配達先|はいたつさき} が {散|ち}らばった だけ だ 。 || Every one of their addresses is right here. It's only the people who got scattered.
?(comp=mio) comp: {石|いし} に {書|か}いた {人|ひと} は 、 {忘|わす}れられる の が {怖|こわ}かった の ね 。 {分|わ}かる わ 。 || Whoever carved these was afraid of being forgotten. I understand that.
?(comp=ren) comp: {紙|かみ} の {名前|なまえ} は {薄|うす}れても 、 {石|いし} の {名前|なまえ} は {残|のこ}る 。 {灯守|ひもり} に は 、 {少|すこ}し {悔|くや}しい {話|はなし} です 。 || Names on paper fade; names in stone stay. A slightly galling thing for a lantern keeper to admit.
?(comp=suzu) comp: {出演者|しゅつえんしゃ} {一覧|いちらん} だ ね 。 {誰|だれ} も {抜|ぬ}けてない 。 || A cast list. Nobody left out.

@scene lq.kh_lantern
narr: こちら {側|がわ} の {灯|あか}り の {笠|かさ} に は 、 「 {葦|あし}ノ{瀬|せ} 」 。 {葦|あし}ノ{瀬|せ} の {名前|なまえ} は 、 {毎日|まいにち} {誰|だれ} か が {呼|よ}んで いた から 、 {消|き}えなかった の だろう 。 || The shade on this side says "Ashinose" — Reedwake. Someone was saying that name every day, so it never faded.

@scene lq.kh_marker
narr: 「 {西|にし} 、 {渡|わた}し{場|ば} 。 {東|ひがし} 、 {小春野|こはるの} 。 」 {古|ふる}い {石|いし} の {道標|みちしるべ} だ 。 || "West: the ferry landing. East: Koharuno." An old stone waymarker.

@scene lq.kh_well
narr: {古|ふる}い {井戸|いど} 。 {底|そこ} に は {水|みず} で は なく 、 {落|お}ち{葉|ば} が {溜|た}まって いる 。 || An old well. At the bottom there's no water, only fallen leaves.

@scene lq.kh_view
narr: {腰|こし} を {下|お}ろす と 、 {川|かわ} の {上|かみ} の {方|ほう} に {山|やま} が {重|かさ}なって {見|み}えた 。 {昔|むかし} の {人|ひと} も 、 ここ に {座|すわ}って {柿|かき} を {干|ほ}した の だろう 。 || Sitting down, you can see hills folding into each other upriver. People must once have sat here to dry their persimmons.
?(quest.lq_road=done) narr: {縁|えん} に 、 {新|あたら}しい {干|ほ}し{柿|がき} が {一列|いちれつ} 、 {吊|つ}るして ある 。 || Along the eaves nearby, a fresh row of persimmons hangs drying.

@scene lq.kh_book
narr: {木守|きもり} の {帳面|ちょうめん} 。 {毎年|まいとし} の {柿|かき} の {数|かず} が 、 {丁寧|ていねい} な {字|じ} で {書|か}いて ある 。 {名前|なまえ} は {全部|ぜんぶ} {消|き}えて いる が 、 {数|かず} は {残|のこ}って いる 。 || The tree-keeper's ledger. Each year's persimmon count is written out in careful handwriting. The names have all faded, but the numbers remain.
narr: {最後|さいご} の {頁|ページ} ： 「 {大水|おおみず} 。 {娘|むすめ} を {灯落|ひおち} の {姉|あね} の {所|ところ} へ {預|あず}ける 。 {木|き} は {鳥|とり} に {任|まか}せる 。 」 || The last page: "The flood. Sending our girl to my sister in Lanternfall. I leave the tree to the birds."
!if quest.lq_road>=6 -> end
!if quest.lq_road<5 -> end
narr: {柿|かき} の {木|き} に も 、 {何|なに} か {残|のこ}って いる かも しれない 。 || There may be something on the persimmon tree, too.

@scene lq.kh_chest
narr: {木|き} の {箱|はこ} を {開|あ}ける と 、 {茶色|ちゃいろ} が かった {橙色|だいだいいろ} の {布|ぬの} が {一枚|いちまい} 、 {畳|たた}んで あった 。 {柿渋|かきしぶ} で {染|そ}めた {手|て}ぬぐい だ 。 || Inside the wooden chest, a single folded cloth of a brownish orange: a cotton cloth dyed with kakishibu.
narr: {三十年|さんじゅうねん} {経|た}って も 、 {色|いろ} は {褪|あ}せて いない 。 || Thirty years on, the colour hasn't faded.
!set lq_kh_chest
!give lq_tenugui
!note lq_kakishibu
?(comp=mio) comp: {柿渋|かきしぶ} は {虫|むし} も {水|みず} も {寄|よ}せ{付|つ}けない の 。 {丈夫|じょうぶ} な {布|ぬの} よ 。 || Kakishibu keeps off insects and water. It's tough cloth.
?(comp=suzu) comp: {似合|にあ}う {似合|にあ}う 。 {柿|かき} の {村|むら} の {衣装|いしょう} だ ね 。 || Suits you. A costume from the persimmon village.
!refresh

@scene lq.kayo_tree
narr: {若|わか}い {柿|かき} の {木|き} 。 {大人|おとな} の {背|せ} より {少|すこ}し {高|たか}い くらい 。 {実|み} は まだ {少|すこ}し しか ない 。 || A young persimmon tree, a little taller than a grown person. It bears only a little fruit so far.
?(quest.lq_road>=3) narr: {葉|は} の {形|かたち} が 、 {灰実|はいみ} の {里|さと} の {小春|こはる} に {似|に}て いる 。 || The shape of its leaves is like the Koharu tree's in Cinder Orchard.

@scene lq.kayo_idle
!faceplayer
lq_kayo[smile]: {柿|かき} の {木|き} です か 。 …… はい 、 もちろん 、 {立派|りっぱ} な {木|き} です 。 {子|こ}ども の {頃|ころ} に {持|も}って きた {種|たね} から {育|そだ}てた んです 。 || The persimmon tree? …Yes, certainly, it's a fine tree. I grew it from a seed I brought with me as a child.
lq_kayo[think]: {生|う}まれた {村|むら} の 、 {大|おお}きな {木|き} の {種|たね} です 。 {村|むら} の {名前|なまえ} は …… 。 || A seed from a great tree in the village where I was born. The village's name…
lq_kayo[smile]: …… {忘|わす}れて も {平気|へいき} です 。 もちろん 。 || …It's quite all right to forget. Certainly.
?(comp=mio) comp[worry]: …… {平気|へいき} に は 、 {見|み}えません でした けど 。 || …She didn't look "all right" to me.
?(comp=nao) comp: {今|いま} の 「 もちろん 」 、 {封|ふう} が {開|あ}いてた な 。 {中身|なかみ} が こぼれてた 。 || That "certainly" had its envelope open. The contents were spilling out.
?(comp=ren) comp[think]: {種|たね} から {育|そだ}てた {木|き} …… 。 {故郷|こきょう} の {名前|なまえ} を 、 {木|き} に {預|あず}けて いる の かも しれません 。 || A tree grown from a seed… Perhaps she's left her home's name in the tree's keeping.
?(comp=suzu) comp: {笑|わら}ってる けど 、 {目|め} は {遠|とお}く を {見|み}てた ね 。 || She's smiling, but her eyes were somewhere far away.

@scene lq.kayo_idle_after
!faceplayer
lq_kayo: {鐘|かね} が {鳴|な}って から 、 {言|い}える よう に なった んです 。 …… {故郷|こきょう} の {名前|なまえ} を {忘|わす}れた の が 、 {悲|かな}しい 。 {悲|かな}しい です 。 {言|い}えて 、 よかった 。 || Since the bell rang I can say it. …I'm sad that I've forgotten the name of home. Sad. I'm glad I could say so.
?(comp=mio) comp: {悲|かな}しい 、 と {言|い}える の は 、 {大事|だいじ} な こと です 。 || Being able to say "I'm sad" matters.

@scene lq.road_kayo_certainly
!faceplayer
pc: カヨ さん です か 。 {小春野|こはるの} の {木守|きもり} の {娘|むすめ} さん の 。 || Are you Kayo? The tree-keeper's daughter from Koharuno?
lq_kayo[surprise]: …… {小春野|こはるの} 。 || …Koharuno.
pc: {道|みち} が {戻|もど}りました 。 {柿|かき} の {木|き} も 、 まだ {立|た}って います 。 {帰|かえ}りません か 。 || The road is back. The persimmon tree is still standing. Won't you go home?
lq_kayo[smile]: はい 、 もちろん 。 {喜|よろこ}んで 。 || Yes, certainly. With pleasure.
narr: {笑|わら}って いる のに 、 {手|て} の {鋏|はさみ} が {震|ふる}えて いる 。 || She's smiling, but the shears in her hand are trembling.
?(comp=nao) comp: …… {今|いま} の 「 もちろん 」 は 、 {中身|なかみ} の ない {封筒|ふうとう} だ 。 || …That "certainly" was an empty envelope.
?(comp=mio) comp[worry]: …… {無理|むり} に 「 はい 」 と {言|い}わせて しまった 。 この {町|まち} で は 、 {誰|だれ} も {嫌|いや} と {言|い}えない のに 。 || …We made her say yes. In this town, nobody can say no.
?(comp=ren) comp: {灯|あか}り の {消|き}えた 「 もちろん 」 です 。 {鐘|かね} が {戻|もど}る まで 、 {本当|ほんとう} の {答|こた}え は {聞|き}けない でしょう 。 || A "certainly" with the lamp gone out. Until the bell is back, we won't hear her real answer.
?(comp=suzu) comp: {台詞|せりふ} の {言|い}い{方|かた} が {違|ちが}う 。 あれ は 「 いいえ 」 の {顔|かお} だ よ 。 || The line reading's wrong. That was a "no" face.

@scene lq.road_kayo
!faceplayer
pc: カヨ さん 。 {小春野|こはるの} へ の {道|みち} が {戻|もど}りました 。 || Kayo. The road to Koharuno is back.
lq_kayo[surprise]: …… {小春野|こはるの} 。 そう 、 {小春野|こはるの} です 。 {言|い}われる まで 、 {思|おも}い{出|だ}せなかった 。 || …Koharuno. Yes — Koharuno. I couldn't remember it until you said it.
lq_kayo[sad]: …… {正直|しょうじき} に {言|い}います 。 {帰|かえ}る の が 、 {怖|こわ}い んです 。 {誰|だれ} も いない {村|むら} を {見|み}たら 、 {本当|ほんとう} に {終|お}わって しまう {気|き} が して 。 || …I'll be honest. I'm afraid to go back. If I see the village with no one in it, I feel it'll really be over.
!choice
* {柿|かき} の {木|き} に 、 あなた の {背|せ} の {線|せん} が {残|のこ}って いました 。 || Your height marks are still on the persimmon tree. -> tree
* ヤス さん も 、 {元気|げんき} です よ 。 || Yasu is alive and well, you know. -> yasu
:tree
lq_kayo[surprise]: …… {十二|じゅうに} で {止|と}まって いる でしょう 。 {父|ちち} が {最後|さいご} に {刻|きざ}んだ {線|せん} です 。 || …It stops at twelve, doesn't it. The last line my father cut.
!goto both
:yasu
lq_kayo[surprise]: ヤス おじさん ！ {生|い}きて いた んです ね 。 ミツ おばさん の {干|ほ}し{柿|がき} 、 {大好|だいす}き でした 。 || Uncle Yasu! He's alive! I loved Aunt Mitsu's dried persimmons.
:both
?(comp=mio&quest.lf_mio=done) comp: カヨ さん 。 {怖|こわ}い なら 、 {怖|こわ}い と {言|い}って いい んです 。 {嫌|いや} なら 、 {嫌|いや} と {言|い}って いい 。 …… わたし も 、 それ を {覚|おぼ}えた ばかり です 。 || Kayo. If you're afraid, you can say you're afraid. If you don't want to, you can say no. …I've only just learned that myself.
?(comp=mio&!quest.lf_mio=done) comp: カヨ さん 。 {怖|こわ}い なら 、 {怖|こわ}い と {言|い}って いい んです 。 {嫌|いや} なら 、 {嫌|いや} と {言|い}って いい 。 …… わたし も 、 まだ {練習|れんしゅう} {中|ちゅう} です けど 。 || Kayo. If you're afraid, you can say you're afraid. If you don't want to, you can say no. …I'm still practising that myself.
?(comp=nao) comp: {怖|こわ}い の は 、 {大事|だいじ} な もの が まだ そこ に ある から だ 。 {空|から}っぽ なら 、 {怖|こわ}く ない 。 || You're afraid because something that matters is still there. If it were empty, you wouldn't be.
?(comp=ren) comp: {道|みち} は {名前|なまえ} を {思|おも}い{出|だ}しました 。 {次|つぎ} は 、 {名前|なまえ} を {呼|よ}ぶ {人|ひと} が {帰|かえ}る {番|ばん} です 。 || The road has remembered its name. Now it's the turn of the people who call it.
?(comp=suzu) comp: {誰|だれ} も いない {舞台|ぶたい} に {立|た}つ の は {怖|こわ}い よ ね 。 でも 、 {立|た}った {瞬間|しゅんかん} に 、 そこ は もう {誰|だれ} も いない {舞台|ぶたい} じゃ なく なる ん だ よ 。 || Standing on an empty stage is frightening. But the moment you step onto it, it isn't empty anymore.
lq_kayo: …… {行|い}きます 。 {今度|こんど} は 、 「 もちろん 」 じゃ なくて 。 {行|い}きたい から 、 {行|い}きます 。 || …I'll go. Not "certainly" this time. I'll go because I want to.
lq_kayo: {柿|かき} の {木|き} の {下|した} で {待|ま}って います 。 {葦|あし}ノ{瀬|せ} の {渡|わた}し{場|ば} の {先|さき} です よ ね 。 || I'll wait under the persimmon tree. Past the ferry landing in Reedwake, isn't it?
!set lq_kayo_going
!quest lq_road 7
!refresh

@scene lq.road_home
!faceplayer
!music wonder
lq_kayo[smile]: …… {来|き}て くれた んです ね 。 || …You came.
lq_kayo: {枝|えだ} が {重|おも}そう 。 {三十年|さんじゅうねん} 、 {誰|だれ} も {採|と}らなかった から 。 {鳥|とり} たち は 、 さぞ {喜|よろこ}んだ でしょう ね 。 || The branches look so heavy. Thirty years and no one picked them. The birds must have been delighted.
narr: カヨ は {背伸|せの}び を して 、 {実|み} を {一|ひと}つ {採|と}った 。 そして 、 {少|すこ}し {照|て}れ ながら 、 {大|おお}きな {声|こえ} を {出|だ}した 。 || Kayo stretches up and picks one fruit. Then, a little embarrassed, she calls out loud:
lq_kayo[laugh]: {小春|こはる} ！ {小春|こはる} ！ || Koharu! Koharu!
lq_kayo: …… {父|ちち} が 、 {採|と}る {日|ひ} に こう {呼|よ}んで いた んです 。 {呼|よ}ばれない {名前|なまえ} は {枯|か}れる から 、 って 。 || …My father used to call out like that on picking day. "A name nobody calls withers," he'd say.
lq_kayo: {十二|じゅうに} の {線|せん} の {上|うえ} に 、 {今|いま} の {背|せ} を {刻|きざ}んで も いい です か 。 {遅|おそ}すぎます けど 。 || May I cut a line for how tall I am now, above the twelve? It's far too late, but still.
narr: {新|あたら}しい {線|せん} は 、 {十二|じゅうに} の {線|せん} より {手|て}のひら {一|ひと}つ {分|ぶん} {高|たか}かった 。 {横|よこ} に は 「 かよ {四十二|よんじゅうに} 」 。 || The new line is a hand's breadth above the twelve. Beside it: "Kayo, 42".
lq_kayo: これ 、 お{礼|れい} です 。 {灯落|ひおち} の {木|き} の {種|たね} 。 {小春|こはる} の {孫|まご} みたい な もの です 。 {古|ふる}い {袖|そで} で {袋|ふくろ} を {縫|ぬ}いました 。 || This is to thank you. A seed from my Lanternfall tree — a sort of grandchild of Koharu. I sewed the little bag from an old sleeve.
lq_kayo: {種|たね} は {待|ま}つ もの です 。 {何年|なんねん} でも 。 …… {私|わたし} たち と {同|おな}じ です ね 。 || Seeds wait. For years, if they must. …Just like us.
!give lq_kaki_seed
!quest lq_road done
?(comp=nao) comp: …… {名前|なまえ} が {道|みち} を {呼|よ}んで 、 {道|みち} が {人|ひと} を {呼|よ}んだ 。 {配達|はいたつ} {完了|かんりょう} だ 。 || …The name called the road, and the road called the people home. Delivery complete.
?(comp=mio) comp[smile]: {種|たね} から {育|そだ}てた {木|き} は 、 {親|おや} と {同|おな}じ {実|み} は {付|つ}けない んです 。 でも 、 {子|こ} は {子|こ} です 。 …… きっと 、 いい {木|き} に なります 。 || A tree grown from seed won't bear quite the same fruit as its parent. But a child is a child. …It'll grow into a good tree.
?(comp=ren) comp: {灯|あか}り {一|ひと}つ 、 {名前|なまえ} {一|ひと}つ 、 {人|ひと} {一人|ひとり} 。 …… {灯守|ひもり} の {仕事|しごと} で 、 {一番|いちばん} いい {仕事|しごと} でした 。 || One lantern, one name, one person. …The best work I've done as a keeper.
?(comp=suzu) comp[smile]: {初日|しょにち} の {幕|まく} が {上|あ}がった ね 。 {客|きゃく} は {鳥|とり} と {私|わたし} たち だけ だ けど 。 …… {悪|わる}く ない {初日|しょにち} だ よ 。 || Opening night. The audience is us and the birds. …Not a bad opening night.
!set lq_road_done
!autosave
!refresh

@scene lq.kayo_home
!faceplayer
lq_kayo: {木守|きもり} の {小屋|こや} の {屋根|やね} を 、 {少|すこ}し ずつ {直|なお}して います 。 {天気|てんき} の いい {日|ひ} に は 、 ヤス おじさん が コウジ さん の {舟|ふね} で {来|き}て くれる んです 。 || I'm mending the tree-keeper's hut, a little at a time. On fine days Uncle Yasu comes over on Kōji's boat.
lq_kayo[smile]: {朝|あさ} 、 {声|こえ} に {出|だ}して {言|い}う んです 。 「 {小春野|こはるの} 」 って 。 {誰|だれ} も {聞|き}いて いなくて も 。 || Every morning I say it out loud: "Koharuno". Even if no one's listening.

@scene lq.kayo_home_post
!faceplayer
lq_kayo: {灯落|ひおち} から {手紙|てがみ} が {来|き}ました 。 {小春野|こはるの} に {戻|もど}りたい って いう {家族|かぞく} が 、 {二|ふた}つ も 。 || Letters came from Lanternfall — two families who want to come back to Koharuno.
?(end_archive_library) lq_kayo: {山|やま} の {書庫|しょこ} で 、 {村|むら} の {古|ふる}い {地図|ちず} を {写|うつ}させて もらった んです 。 {家|いえ} が {建|た}って いた {場所|ばしょ} が 、 {全部|ぜんぶ} {分|わ}かりました 。 || At the mountain archive they let me copy an old map of the village. Now I know where every house stood.
lq_kayo[smile]: {来年|らいねん} の {秋|あき} は 、 {採|と}る {人|ひと} が {足|た}りそう です 。 || Next autumn, it looks like there'll be enough of us for the picking.
`, 'lq/40_road');
