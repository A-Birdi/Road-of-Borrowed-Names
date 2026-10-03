/* Chapter 1 scenes: arrival on the lantern road, Keeper Tsuru, and the
 * first quest's threads (Mio, Nao, Ren, Suzu, Hana). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene rw.arrive
# Staged: you stop on the wet road and look along it; what your background notices, you do (the courier
# points out the dark lantern, the craftsperson looks down at the mud, the student checks the letter);
# then you face east, the way you walk.
!music road
!gesture pc lookroad right
narr: {嵐|あらし} の {次|つぎ} の {朝|あさ} 。 {道|みち} は まだ ぬれて いる 。 || The morning after the storm. The road is still wet.
narr: {折|お}れた {枝|えだ} 、 {泥|どろ} の {水|みず}たまり 、 どこか で {鳴|な}く {鳥|とり} 。 || Broken branches, muddy puddles, a bird calling somewhere.
?(bg=courier) !gesture pc point 14,8
?(bg=courier) narr: {配達|はいたつ} の {癖|くせ} で 、 {道|みち} の {先|さき} の {灯|あか}り を {数|かぞ}える 。 ひとつ 、 ふたつ …… みっつ{目|め} が {消|き}えて いる 。 || Out of courier's habit, you count the lanterns ahead. One, two… the third is dark.
?(bg=craft) !gesture pc bend
?(bg=craft) narr: {靴|くつ} の {底|そこ} に {泥|どろ} が {入|はい}って きた 。 {着|つ}いたら まず {直|なお}さなきゃ 。 || Mud is getting into your boots. First thing when you arrive: fix them.
?(bg=student) !prop pc letter
?(bg=student) !gesture pc check prop=letter
?(bg=student) narr: {紹介状|しょうかいじょう} は {無事|ぶじ} だ 。 {字|じ} も にじんで いない 。 {少|すこ}し {安心|あんしん} する 。 || The letter of introduction survived. The ink hasn't even run. That's a small relief.
?(bg=student) !prop pc -
!look pc right
narr: {葦|あし}ノ{瀬|せ} の {灯守|ひもり} 、 ツル さん へ の {紹介状|しょうかいじょう} を {持|も}って 、 {東|ひがし} へ {歩|ある}く 。 || You walk east, carrying a letter of introduction for Tsuru, the lantern keeper of Reedwake.
!give rw_letter quiet
!note rw_roads
!set rw_arrived
!toast || Move with the arrow keys or WASD (or tap where to walk). Press Z / Enter / Space — or tap — to look and talk. H toggles the lightbulb: point at any Japanese for help.

@scene rw.road_lantern
!if rw_road_lit -> lit
narr: {灯|あか}り の {紙|かみ} が {白|しろ}い 。 {字|じ} が {一|ひと}つ も {残|のこ}って いない 。 || The lantern's paper is white. Not a single letter is left on it.
narr: {雨|あめ} で {流|なが}れた の なら 、 {墨|すみ} の {跡|あと} が {残|のこ}る はず だ 。 でも 、 まるで {最初|さいしょ} から {何|なに} も {書|か}かれて いなかった よう に {白|しろ}い 。 || If the rain had washed it away, there would be traces of ink. But it's as white as if nothing had ever been written there.
narr: {指|ゆび} で {触|ふ}れる と 、 {紙|かみ} の {奥|おく} に {古|ふる}い {字|じ} の {形|かたち} が 、 かすか に {感|かん}じられた 。 || When you touch it, you can faintly feel the shapes of old letters deep in the paper.
!lesson kana
!challenge rw.c_road_lantern
!if var._res=0 -> later
!sfx lantern
narr: {字|じ} が {紙|かみ} に {染|し}み{込|こ}み 、 {灯|あか}り が ともった 。 || The letters sink into the paper, and the lantern lights.
narr: {道|みち} の {先|さき} の {白|しろ}い もや が 、 すっと {晴|は}れた 。 || The white haze on the road ahead clears away.
!set rw_road_lit
!autosave
!end
:later
narr: {灯|あか}り は {白|しろ}い まま だ 。 また {後|あと} で {試|ため}そう 。 || The lantern stays blank. You can try again later.
!end
:lit
narr: {灯|あか}り に 「 {葦|あし}ノ{瀬|せ} 」 の {字|じ} が {浮|う}かんで いる 。 || The name "Ashinose" glows on the lantern.
!end

@scene rw.road_mist
narr: {東|ひがし} の {道|みち} は {白|しろ}い もや に {溶|と}けて いる 。 {進|すす}んで も 、 {気|き}づく と {同|おな}じ {場所|ばしょ} に {戻|もど}って いる 。 || The road east dissolves into white haze. However far you go, you find yourself back where you started.
narr: {消|き}えた {灯|あか}り の せい かも しれない 。 || Maybe it's because of the dark lantern.

@scene rw.road_marker
narr: {苔|こけ} の {生|は}えた {石|いし} に 、 {字|じ} が {彫|ほ}って ある 。 || Words are carved into a mossy stone.
narr: 「 {東|ひがし} 、 {葦|あし}ノ{瀬|せ} 。 {西|にし} 、 {潮硝子|しおがらす} 。 」 || "East: Ashinose (Reedwake). West: Shiogarasu (Saltglass)."
?(rw_road_lit) narr: {石|いし} に {彫|ほ}られた {字|じ} は 、 {消|き}えて いない 。 {紙|かみ} より {石|いし} の {方|ほう} が {頑固|がんこ} らしい 。 || The carved words haven't faded. Stone seems more stubborn than paper.

@scene rw.road_west_blocked
narr: {西|にし} へ {行|い}く {前|まえ} に 、 まず {葦|あし}ノ{瀬|せ} で {用事|ようじ} を {済|す}ませよう 。 || Before heading west, you have business in Reedwake.
!move pc right 1

@scene rw.village_first
!music reedwake
narr: {川|かわ} の {音|おと} 。 {干|ほ}された {網|あみ} 。 {屋根|やね} を {直|なお}す {槌|つち} の {音|おと} 。 || The sound of the river. Nets hung out to dry. Hammers mending roofs.
narr: {広場|ひろば} の {真|ま}ん{中|なか} で 、 {杖|つえ} を ついた {老婦人|ろうふじん} が {腕|うで} を {組|く}んで {立|た}って いる 。 || In the middle of the square, an old woman leaning on a cane stands with her arms folded.
tsuru: そこ の {旅|たび} の {人|ひと} 。 {泥|どろ} だらけ だね 。 {灯|ひ} の {道|みち} から {来|き}た の かい 。 || You there, traveller. You're covered in mud. Did you come by the lantern road?
!emote tsuru ?

@scene rw.tsuru_first
# Staged: Tsuru points back down the road to the lantern that went out; you step up beside her to hand
# over the letter (side-on, so the hands show) and she reads it; she shows you a dark lantern of her own,
# shakes her head over the night's damage; she sends you round the square with a point to Mio's shop (you
# look where she points), a glance to the performer by the well.
!faceplayer tsuru
!gesture tsuru point 1,30
tsuru: {道|みち} の {三|みっ}つ{目|め} の {灯|あか}り 、 ともって いた かい 。 ゆうべ {消|き}えた はず なんだ けど ね 。 || The third lantern on the road — was it lit? It went out last night, I'd have sworn.
!choice
* {紹介状|しょうかいじょう} を {渡|わた}す || Hand over the letter. -> letter
* {灯|あか}り に {名前|なまえ} を {書|か}きました || I wrote its name back. -> wrote
:wrote
!look tsuru pc
!gesture tsuru observe pc
tsuru[surprise]: {書|か}いた ？ あんた が ？ || You wrote it? You?
:letter
!walkto pc 22 15 left
!look tsuru pc
!prop pc letter
!gesture pc handover tsuru
!gesture tsuru receive pc then=read
narr: {紹介状|しょうかいじょう} を {渡|わた}す と 、 ツル は {目|め} を {細|ほそ}めて {読|よ}んだ 。 || You hand over the letter. Tsuru narrows her eyes and reads.
!take rw_letter
!gesture tsuru nod pc
tsuru[think]: …… なるほど 。 {古|ふる}い {字|じ} が {読|よ}める {人|ひと} か 。 {今時|いまどき} めずらしい 。 || …I see. Someone who can read the old letters. You don't meet many these days.
!prop tsuru -
!gesture tsuru point 20,22
tsuru: わたし は ツル 。 この {村|むら} の {灯守|ひもり} だ 。 {灯|あか}り の {名前|なまえ} を {書|か}き{直|なお}す の が {仕事|しごと} …… だった 。 || I'm Tsuru, keeper of this village's lanterns. My job is rewriting their names… was, anyway.
!look tsuru pc
!gesture tsuru shake
tsuru[worry]: ゆうべ の {嵐|あらし} で 、 {村|むら} じゅう の {字|じ} が {消|き}えた 。 {薬|くすり} の ラベル 、 {手紙|てがみ} の {宛名|あてな} 、 {灯|あか}り の {名前|なまえ} まで 。 || In last night's storm, writing vanished all over the village. Medicine labels, the addresses on letters, even the lanterns' names.
tsuru: わたし が {書|か}き{直|なお}して も 、 すぐ に {滑|すべ}り{落|お}ちる 。 {年|とし} の せい だ と {言|い}われれば それまで だ けど ね 。 || When I rewrite them, they slide right off. You could call it old age and leave it at that.
!gesture tsuru nod pc
tsuru[smile]: でも 、 あんた の {字|じ} は {残|のこ}った 。 {手|て} を {貸|か}して おくれ 。 {宿|やど} と {飯|めし} くらい は {出|だ}す よ 。 || But your writing held. Lend me a hand. I can at least give you a bed and meals.
!choice
* {手伝|てつだ}います || I'll help. -> yes
* {何|なに} が {起|お}きた ん です か || What happened here? -> what
:what
!gesture tsuru chin
tsuru: それ が わかれば {苦労|くろう} しない 。 {嵐|あらし} で {水|みず} が {入|はい}った なら 、 {墨|すみ} が にじむ はず だろう 。 でも 、 どの {紙|かみ} も {真|ま}っ{白|しろ} なんだ 。 まるで {誰|だれ} か が {丁寧|ていねい} に はがして いった みたい に ね 。 || If I knew, I wouldn't be worrying. If water got in, the ink would have run. But every sheet is perfectly white — as if someone had peeled it off, very carefully.
:yes
tsuru: よし 。 まず は {広場|ひろば} の {周|まわ}り の {人|ひと} に {話|はなし} を {聞|き}いて おくれ 。 || Good. Start by asking around the square.
!gesture tsuru point 11,15
!gesture pc listen 11,15
tsuru: {薬屋|くすりや} の ミオ 、 {川|かわ} の {倉庫|そうこ} に いる {配達|はいたつ} の {子|こ} 、 {橋|はし} の {所|ところ} の {若|わか}い {灯守|ひもり} 。 それと 、 {茶屋|ちゃや} の ハナ も {様子|ようす} が おかしい 。 || Mio at the apothecary, the courier down at the river warehouse, the young lantern keeper by the bridge. And Hana at the teahouse hasn't been herself either.
!look pc tsuru
!look tsuru 18,19
tsuru: {広場|ひろば} で {騒|さわ}いで いる {旅芸人|たびげいにん} も 、 {何|なに} か {見|み}た らしい よ 。 {話|はなし} は {長|なが}い けど 。 || The travelling performer making a racket in the square apparently saw something too. Long-winded, though.
!look tsuru pc
tsuru: それから 、 これ を {持|も}って いき な 。 {灯守|ひもり} が {最初|さいしょ} に {覚|おぼ}える {言葉|ことば} だ 。 || And take this with you. It's the first word a keeper learns.
!word mamoru
!note rw_himori
!gesture tsuru nod pc
tsuru: 「 まもる 」 。 {意味|いみ} は {誰|だれ} でも {知|し}って いる 。 {大事|だいじ} なの は 、 {本気|ほんき} で {書|か}く こと だ 。 || "Mamoru" — to protect. Everyone knows what it means. What matters is writing it like you mean it.
!set rw_met_tsuru
!quest rw_labels 0
!autosave

@scene rw.tsuru_hint
# Staged: each place Tsuru still sends you to, she points at as she names it (Mio's door, the warehouse,
# the bridge, the well, the teahouse chimney); each line names a different place, so the points differ.
!faceplayer tsuru
tsuru: {調子|ちょうし} は どう だい 。 || How's it going?
?(!rw_bottles_done) !gesture tsuru point 11,15
?(!rw_bottles_done) tsuru: ミオ の {店|みせ} は {広場|ひろば} の {西|にし} 。 {瓶|びん} だらけ で {困|こま}ってる はず だ 。 || Mio's shop is west of the square. She'll be drowning in bottles.
?(!rw_letters_done) !gesture tsuru point 29,25
?(!rw_letters_done) tsuru: {配達|はいたつ} の {子|こ} は {南|みなみ} の {倉庫|そうこ} 。 {川|かわ} の {近|ちか}く だ よ 。 || The courier is at the warehouse to the south, near the river.
?(!rw_lanterns_done) !gesture tsuru point 32,18
?(!rw_lanterns_done) tsuru: {橋|はし} の {灯守|ひもり} は 、 {東|ひがし} の {橋|はし} の {手前|てまえ} に いる 。 || The young keeper is just before the bridge, to the east.
?(!rw_suzu_told) !gesture tsuru point 20,17
?(!rw_suzu_told) tsuru: {旅芸人|たびげいにん} は {井戸|いど} の {近|ちか}く で {歌|うた}ってる 。 {聞|き}こえる だろう 。 || The performer is singing by the well. You can hear her, surely.
?(!rw_hana_cups) !gesture tsuru point 30,13
?(!rw_hana_cups) tsuru: ハナ の {茶屋|ちゃや} は {橋|はし} の {近|ちか}く 。 {煙突|えんとつ} から {煙|けむり} が {出|で}て いる {家|いえ} だ 。 || Hana's teahouse is near the bridge — the one with smoke coming from the chimney.
!if rw_bottles_done&rw_letters_done&rw_lanterns_done&rw_suzu_told&rw_hana_cups -> all
!quest rw_labels 1 quiet
!end
:all
!call rw.tsuru_report

@scene rw.tsuru_report
# Staged: you tell her what you found with an open hand and she listens, still; she thinks over the old
# word, points north to the mill, and her head shakes at the voices; a nod to send you.
!faceplayer tsuru
tsuru: …… {全部|ぜんぶ} {聞|き}いて きた かい 。 || …You've heard it all, then?
!gesture pc palm tsuru
!gesture tsuru listen pc hold
narr: {聞|き}いた こと を ツル に {話|はな}す 。 {白|しろ}すぎる ラベル 。 {宛名|あてな} だけ が {消|き}えた {手紙|てがみ} 。 {滑|すべ}り{落|お}ちる {灯|あか}り の {名前|なまえ} 。 {嵐|あらし} の {夜|よる} 、 {足音|あしおと} の ない {人影|ひとかげ} 。 そして 、 ふたつ の お{茶|ちゃ} 。 || You tell Tsuru everything. Labels too white. Letters with only the addresses gone. Lantern names that slide off. A figure without footsteps on the night of the storm. And two cups of tea.
!gesture tsuru chin
tsuru[think]: ふん 。 {雨|あめ} の せい じゃ ない 。 {昔|むかし} の {灯守|ひもり} は こういう の を 「 しじま 」 と {呼|よ}んだ 。 || Hm. That's no rain. The old keepers had a word for this: shijima. The hush.
!note rw_hush
tsuru: {名前|なまえ} を {静|しず}か に {持|も}って いく もの さ 。 わたし の {師匠|ししょう} の {頃|ころ} に は 、 もう {誰|だれ} も {本気|ほんき} に して いなかった けど ね 。 || Something that quietly carries names away. Even in my teacher's day, nobody took it seriously.
!gesture tsuru point 22,0
tsuru[worry]: それ から 、 {北|きた} の {水車|すいしゃ}{小屋|ごや} だ 。 {嵐|あらし} の {夜|よる} から 、 {誰|だれ} も いない のに {声|こえ} が {聞|き}こえる って 。 {粉屋|こなや} の {娘|むすめ} が {逃|に}げて きた 。 || And then there's the water mill to the north. Since the storm, people hear voices there though no one's inside. The miller's daughter ran away from it.
!look tsuru pc
!gesture tsuru shake
tsuru: {呼|よ}んで も いない のに 、 {呼|よ}び{返|かえ}して くる んだ と さ 。 {昔|むかし} の {声|こえ} で 。 || It calls back, she says, though nobody called it. In voices from years ago.
!gesture tsuru nod pc
tsuru: {北|きた} の {道|みち} を {開|あ}けて おく 。 あんた ひとり で {行|い}け と は {言|い}わない よ 。 {心配|しんぱい} {性|しょう} の {連中|れんちゅう} が 、 どうせ ついて {行|い}く だろう から ね 。 || I'll open the north path. I won't tell you to go alone — the worriers around here will tag along anyway.
!quest rw_labels done
!quest rw_mill 0
!set rw_mill_open
!lesson kana
!autosave

@scene rw.tsuru_mill
!faceplayer tsuru
tsuru: {水車|すいしゃ}{小屋|ごや} は {北|きた} の {道|みち} の {突|つ}き{当|あ}たり だ 。 {無理|むり} は する んじゃ ない よ 。 || The mill is at the end of the north path. Don't overdo it.
?(item.rw_wheel_pin) tsuru: その {軸|じく} 、 サエ から {預|あず}かった の かい 。 {歯車|はぐるま} に {使|つか}う ん だろう ね 。 || That pin — Sae gave it to you? It must go in the gears.

@scene rw.mill_blocked
narr: {北|きた} の {道|みち} は 、 {倒|たお}れた {木|き} と {泥|どろ} で ふさがって いる 。 ツル が {村|むら} の {人|ひと} を {集|あつ}めれば 、 {片付|かたづ}けられ そう だ 。 || The north path is blocked by a fallen tree and mud. If Tsuru gathered people, it could be cleared.
!move pc down 1

@scene rw.leave_early
narr: {西|にし} の {灯|ひ} の {道|みち} 。 {今|いま} は まだ 、 {村|むら} で やる こと が ある 。 || The lantern road west. For now, there's still work to do in the village.
!move pc right 1

@scene rw.mio_first
# Staged: Mio's worried welcome with a hand at her chest; you both look at the blank labels; as she talks
# she goes to the shelf and lines the bottles up (the line says so) and speaks to you from there; once the
# labels hold she leans in to them, comes round to your side to thank you with open hands, a hand to her
# heart for her teacher's word, and covers "forget it" by handing you a salve.
!faceplayer mio
!gesture mio guard
mio[worry]: いらっしゃいませ …… あ 、 すみません 。 {今|いま} 、 {店|みせ} は ちょっと …… 。 || Welcome… oh, I'm sorry. The shop is a bit… right now.
!gesture pc observe 2,2
narr: {棚|たな} の {瓶|びん} は きちんと {並|なら}んで いる 。 ただ 、 どの ラベル も {真|ま}っ{白|しろ} だ 。 || The bottles on the shelves are neatly lined up. But every label is blank.
!look pc mio
mio: {嵐|あらし} の あと 、 ラベル が {全部|ぜんぶ} {白|しろ}く なって しまって 。 {似|に}た {色|いろ} の {薬|くすり} が {多|おお}い ので 、 {間違|まちが}える と {危|あぶ}ない ん です 。 || After the storm, all the labels went white. So many medicines look alike — a mix-up could be dangerous.
!walkto mio 3 2 left
!look pc mio
!gesture mio tidy 2,2
narr: {話|はな}し ながら 、 ミオ は {瓶|びん} を {一本|いっぽん} ずつ ほんの {少|すこ}し {回|まわ}して 、 {向|む}き を そろえて いる 。 || As she talks, Mio turns each bottle a fraction, lining them all up to face the same way.
!look mio pc
!look pc mio
mio: でも 、 {変|へん} なん です 。 {水|みず} に ぬれた なら 、 {紙|かみ} が ふやける はず でしょう 。 これ 、 ぜんぜん ぬれて いない ん です よ 。 || But it's strange. If they'd got wet, the paper would be warped, wouldn't it? These aren't wet at all.
mio: {字|じ} だけ 、 きれい に なく なって いる 。 …… {気味|きみ} が {悪|わる}い です 。 || Only the writing is gone, perfectly. …It gives me the creeps.
mio: ツル さん の お{客|きゃく}さま です か ？ {字|じ} が {書|か}ける なら 、 {手伝|てつだ}って いただけません か 。 {帳面|ちょうめん} に {中身|なかみ} は {全部|ぜんぶ} {書|か}いて あります から 。 || Are you Tsuru's guest? If you can write, would you help me? What's in each bottle is all written in my notebook.
!lesson kana
!challenge rw.c_bottles
!if var._res=0 -> later
!gesture mio observe 2,2
mio[smile]: …… {字|じ} が 、 {落|お}ちない 。 すごい 。 わたし が {書|か}いた の は 、 {朝|あさ} の うち に {全部|ぜんぶ} {滑|すべ}って しまった のに 。 || …The writing isn't coming off. Amazing. Everything I wrote this morning slid right off.
!walkto mio 6 4 left
!look pc mio
!gesture mio thanks pc
mio: ありがとう ございます 。 お{礼|れい} に 、 これ を 。 {薬|くすり} じゃ なくて 、 {言葉|ことば} です けど 。 || Thank you. Please take this as thanks. It's not medicine — it's a word.
!word iyasu
!gesture mio guard
mio: 「 いやす 」 。 {傷|きず} を {治|なお}す とき の 「 {癒|いや}す 」 です 。 わたし の {先生|せんせい} は 、 {薬|くすり} を {渡|わた}す とき 、 いつも {心|こころ} の {中|なか} で そう {書|か}いて いた そう です 。 || Iyasu — to heal, to soothe. My teacher used to write it in her heart every time she handed over medicine, apparently.
!prop mio bottle
!gesture mio handover pc
!gesture pc receive mio
mio[think]: …… {変|へん} な こと を {言|い}いました ね 。 {忘|わす}れて ください 。 || …I said something strange, didn't I. Forget it.
!give rw_salve
!set rw_bottles_done
!quest rw_labels 1 quiet
!autosave
!end
:later
!look mio pc
!gesture mio nod pc
mio: {急|いそ}ぎません 。 {間違|まちが}える より 、 {時間|じかん} を かける {方|ほう} が ずっと いい ので 。 || There's no rush. Taking time is far better than making a mistake.

@scene rw.mio_again
!faceplayer mio
mio: ラベル 、 ちゃんと {残|のこ}って います 。 {朝|あさ} から {三回|さんかい} {確|たし}かめました 。 || The labels are still there. I've checked three times since morning.
mio[smirk]: …… {四回|よんかい} です 。 || …Four times.
?(rw_letters_done&!rw_hana_cups) mio: ハナ さん に も {会|あ}って あげて ください 。 {朝|あさ} から お{茶|ちゃ} を ふたつ いれて 、 ぼんやり して いる ん です 。 || Please go and see Hana too. She's been pouring two cups of tea since morning and staring into space.

@scene rw.bottles_look
narr: {同|おな}じ {形|かたち} の {瓶|びん} が 、 {白|しろ}い ラベル を つけて {並|なら}んで いる 。 {中身|なかみ} は {色|いろ} だけ が {違|ちが}う 。 || Identical bottles stand in a row with blank labels. Only the colours of their contents differ.

@scene rw.apoth_table
narr: {帳面|ちょうめん} が {開|ひら}いて いる 。 {細|こま}かい {字|じ} で 、 {薬|くすり} の {分量|ぶんりょう} と {日付|ひづけ} が びっしり {書|か}いて ある 。 {帳面|ちょうめん} の {字|じ} は {消|き}えて いない 。 || A notebook lies open, packed with doses and dates in small handwriting. The notebook's writing hasn't vanished.
?(rw_bottles_done) narr: {余白|よはく} に 、 {小|ちい}さく 「 {休|やす}む 」 と {書|か}いて ある 。 {誰|だれ} に {向|む}けた {言葉|ことば} だろう 。 || In the margin, small: "rest". You wonder who that was meant for.

@scene rw.nao_first
# Staged: Nao points straight down at the missing board, eyes the way out, holds up one of the damp letters
# and you lean in to it; after the sorting, a nod, a point to the chalked crates (you look), and on a
# courier's background Nao looks you over.
!faceplayer nao
!gesture nao point 5,5
nao: …… {入口|いりぐち} から {来|き}た なら 、 {足元|あしもと} {気|き}を つけて 。 {三|みっ}つ{目|め} の {床板|ゆかいた} 、 {抜|ぬ}けてる から 。 || …If you came in the front, watch your step. The third floorboard is gone.
!gesture nao aside
narr: {帽子|ぼうし} の {下|した} から 、 {黄土色|おうどいろ} の スカーフ 。 {膨|ふく}らんだ {鞄|かばん} 。 {話|はな}し ながら 、 {目|め} だけ が {裏口|うらぐち} の {方|ほう} を {確|たし}かめて いる 。 || An ochre scarf; a bulging satchel. While talking, their eyes check the back door.
!prop nao letter
!gesture nao present pc hold
nao: {配達人|はいたつにん} の ナオ 。 {嵐|あらし} で {足止|あしど}め 。 で 、 これ 。 || Nao, courier. Stuck here by the storm. And — this.
!gesture pc observe nao
narr: {机|つくえ} の {上|うえ} に 、 {湿|しめ}った {手紙|てがみ} の {山|やま} 。 {宛名|あてな} の ところ だけ 、 {真|ま}っ{白|しろ} だ 。 || A pile of damp letters on the desk. Only the addresses are blank.
nao: {中身|なかみ} は {読|よ}める 。 {宛名|あてな} だけ {消|き}えた 。 {雨|あめ} って 、 そんな {器用|きよう} な こと する か ？ || The contents are readable. Only the addresses are gone. Does rain do anything that neat?
!look pc nao
!gesture nao aside
nao[smirk]: {他人|たにん} の {手紙|てがみ} を {読|よ}む の は {好|す}き じゃ ない 。 でも 、 {届|とど}かない {手紙|てがみ} は もっと {嫌|きら}い だ 。 {手伝|てつだ}って くれる ？ || I don't like reading other people's letters. But I hate letters that never arrive even more. Help me?
!prop nao -
!lesson kana
!activity rw.a_letters
!if var._res=0 -> later
!gesture nao nod pc
nao: …… {全部|ぜんぶ} {当|あ}たり 。 {字|じ} の {癖|くせ} まで {見|み}てた ？ いい {目|め} してる 。 || …Every one right. Were you reading the handwriting too? You've got a good eye.
!gesture nao point 8,5
!gesture pc listen 8,5
nao: {倉庫|そうこ} の {木箱|きばこ} も {同|おな}じ だった 。 {紙|かみ} の {札|ふだ} は {白|しろ} 。 でも 、 {下|した} に チョーク で {書|か}いた {印|しるし} は {残|のこ}ってた 。 || The crates in the warehouse are the same. The paper tags went white. But the chalk marks underneath survived.
!look pc nao
!look nao pc
nao[think]: {紙|かみ} に {書|か}いた {名前|なまえ} だけ 、 {狙|ねら}われた みたい だ 。 …… {変|へん} な {話|はなし} だろ 。 || As if only names written on paper were targeted. …Weird, right?
?(bg=courier) !gesture nao observe pc
?(bg=courier) nao: …… あんた も {配達|はいたつ} やってた ？ {封|ふう} の {持|も}ち{方|かた} で わかる 。 || …You've done deliveries too? I can tell from how you hold an envelope.
!set rw_letters_done rw_met_nao
!quest rw_labels 1 quiet
!autosave
!end
:later
nao: いい よ 。 {手紙|てがみ} は {逃|に}げない 。 {配達人|はいたつにん} は たまに {逃|に}げる けど 。 || Fine. Letters don't run away. Couriers sometimes do.

@scene rw.nao_square
!faceplayer nao
nao: {広場|ひろば} から だと 、 {出口|でぐち} が {四|よっ}つ {見|み}える 。 {落|お}ち{着|つ}く 。 || From the square you can see four ways out. It's calming.
?(!rw_mill_open) nao: {北|きた} の {道|みち} 、 {泥|どろ} で ふさがってる 。 {倒木|とうぼく} は ひとり じゃ {無理|むり} だ な 。 || The north path's blocked with mud. Can't shift that fallen tree alone.
?(rw_mill_open) nao: {水車|すいしゃ}{小屋|ごや} 、 {行|い}く なら {言|い}って 。 {道|みち} は {先|さき} に {見|み}て おく 。 || If you're going to the mill, tell me. I'll scout the road ahead.

@scene rw.crates
narr: {木箱|きばこ} の {紙|かみ} の {札|ふだ} は {白|しろ} 。 でも 、 {木|き} に {直接|ちょくせつ} チョーク で 「 こめ 」 「 しお 」 と {書|か}いて ある 。 || The paper tags on the crates are blank. But written straight on the wood in chalk: "rice", "salt".

@scene rw.ren_first
# Staged: caught talking to a lantern, Ren pushes their glasses up; you look them over (the patched coat,
# the mud); they explain with an open hand, turn to the lantern whose name won't take root, catch themself
# on their teacher (a hand to the chin, a small shake); you step to their side and they hand you the record.
!faceplayer ren
!gesture ren glasses
ren: ── {失礼|しつれい} 。 {今|いま} 、 {灯|あか}り と {話|はな}して いた ところ でして 。 || — Excuse me. I was just in the middle of talking with the lantern.
!gesture pc observe ren
narr: {継|つ}ぎ{当|あ}て だらけ の {儀式用|ぎしきよう} の {上着|うわぎ} 。 {鏡|かがみ} の よう に {磨|みが}かれた ランプ 。 そして 、 {泥|どろ} だらけ の {靴|くつ} 。 || A ceremonial coat covered in patches. A lamp polished like a mirror. And boots caked in mud.
!gesture ren palm pc
ren: レン と {申|もう}します 。 {川上|かわかみ} から 、 {嵐|あらし} の あと の {灯|あか}り を {直|なお}し に {来|き}ました 。 {灯守|ひもり} です 。 {一応|いちおう} 。 || I'm Ren. I came down from upriver to mend the lanterns after the storm. A keeper. Nominally.
!gesture ren observe 32,18
ren: {記録|きろく} は {完璧|かんぺき} です 。 {名前|なまえ} も {距離|きょり} も {全部|ぜんぶ} {写|うつ}して ある 。 ただ …… {書|か}いて も {書|か}いて も 、 {名前|なまえ} が {根|ね} を {張|は}らない 。 || My records are perfect. Every name and distance, copied out. Only… however many times I write them, the names won't take root.
!look ren pc
!gesture ren chin then=shake
ren[think]: {先生|せんせい} なら 、 どう した でしょう 。 {教|おし}え は {全部|ぜんぶ} {覚|おぼ}えて いる のに 、 {顔|かお} が …… いえ 、 {関係|かんけい} ない {話|はなし} です 。 || What would my teacher have done? I remember every lesson, and yet the face… No. That's beside the point.
!walkto pc 32 19 left
!look ren pc
!prop ren ledger
!gesture ren handover pc
!gesture pc receive ren
ren: ツル さん が {言|い}って いた {方|かた} です ね 。 {字|じ} が {残|のこ}る と 。 {南|みなみ} の {灯|あか}り と 、 {橋|はし} の {灯|あか}り 。 {記録|きろく} を {読|よ}み{上|あ}げます から 、 {書|か}いて いただけます か 。 || You're the one Tsuru mentioned — whose writing stays. The south lantern and the bridge lantern. I'll read from the records if you'll write.
!give rw_record
!set rw_met_ren
!lesson kana

@scene rw.ren_again
!faceplayer ren
ren: {南|みなみ} の {灯|あか}り は {広場|ひろば} から {南|みなみ} 、 {橋|はし} の {灯|あか}り は すぐ そこ です 。 {近|ちか}づいて {調|しら}べて ください 。 || The south lantern is south of the square; the bridge lantern is right there. Go up and examine them.
?(rw_lantern_s&!rw_lantern_b) ren: {南|みなみ} は ともりました ね 。 {残|のこ}る は {橋|はし} です 。 || The south one's lit. Only the bridge left.
?(rw_lantern_b&!rw_lantern_s) ren: {橋|はし} は …… {半分|はんぶん} だけ ともった 、 と {言|い}う べき でしょう か 。 {南|みなみ} も お{願|ねが}い します 。 || The bridge… is half lit, I should say. The south one too, please.

@scene rw.lantern_south
!if !rw_met_ren -> norecord
!challenge rw.c_lantern_s
!if var._res=0 -> end
!sfx lantern
narr: {灯|あか}り が ともる 。 {紙|かみ} の {上|うえ} で 、 {字|じ} が {落|お}ち{着|つ}いた 。 || The lantern lights. The letters settle on the paper.
!set rw_lantern_s
!if rw_lantern_b -> both
!end
:both
!call rw.ren_lanterns_done
!end
:norecord
narr: {灯|あか}り の {紙|かみ} は {白|しろ}い 。 {何|なに} と {書|か}けば いい か 、 {記録|きろく} が ない と わからない 。 {橋|はし} の {近|ちか}く の {灯守|ひもり} が {持|も}って いる かも しれない 。 || The lantern's paper is blank. Without a record, you don't know what to write. The keeper near the bridge might have one.

@scene rw.lantern_bridge
!if !rw_met_ren -> norecord
!challenge rw.c_lantern_b
!if var._res=0 -> end
!sfx lantern
narr: {灯|あか}り は ともった 。 でも 、 {字|じ} の {端|はし} が 、 {紙|かみ} から {少|すこ}し ずつ {滑|すべ}って いく 。 まだ {何|なに} か が {足|た}りない 。 || The lantern lights. But the end of the writing keeps slipping, little by little, off the paper. Something is still missing.
!set rw_lantern_b
!if rw_lantern_s -> both
!end
:both
!call rw.ren_lanterns_done
!end
:norecord
narr: {橋|はし} の {灯|あか}り 。 {紙|かみ} は {白|しろ}い 。 すぐ {近|ちか}く に 、 {記録|きろく} を めくって いる {灯守|ひもり} が いる 。 || The bridge lantern. The paper is blank. There's a keeper leafing through records right nearby.

@scene rw.ren_lanterns_done
# Staged: Ren leans to the bridge lantern beside them, points across to the far bank (the second name),
# thinks with a hand to their chin; then turns to you with a nod for the word, and looks down at their boots.
!gesture ren observe 32,18
ren[surprise]: …… {根|ね} を {張|は}った 。 {本当|ほんとう} に 。 || …They took root. They really did.
!gesture ren point 42,17
ren: {橋|はし} の {方|ほう} は 、 {記録|きろく} に よれば {名前|なまえ} が {二|ふた}つ {必要|ひつよう} な はず です 。 {向|む}こう{岸|ぎし} と 、 {渡|わた}し{守|もり} の {名前|なまえ} 。 {二|ふた}つ{目|め} の {欄|らん} が 、 {記録|きろく} から も {消|き}えて いる 。 || According to the records, the bridge needs two names: the far bank, and the ferryman's. The second entry has vanished from the records too.
!gesture ren chin
ren[think]: {記録|きろく} から まで …… 。 {紙|かみ} の {上|うえ} の {名前|なまえ} だけ を {持|も}って いく {何|なに} か が いる 。 {先生|せんせい} が {昔|むかし} 、 そんな {話|はなし} を して いた {気|き} が します 。 || Even from the records… Something is taking only the names written on paper. My teacher once told me a story like that, I think.
!look ren pc
!gesture ren nod pc
ren[smile]: ありがとう ございます 。 これ を 。 {灯守|ひもり} の {言葉|ことば} です 。 {私|わたし} より 、 あなた の {手|て} で {書|か}く {方|ほう} が {明|あか}るい でしょう 。 || Thank you. Take this — a keeper's word. It'll shine brighter written in your hand than in mine.
!word hikari
!gesture ren observe
ren: 「 ひかり 」 。 {隠|かく}れた もの を {照|て}らす {言葉|ことば} です 。 …… {私|わたし} の {靴|くつ} の {汚|よご}れ も {照|て}らして しまう ので 、 {使|つか}い{方|かた} に は {注意|ちゅうい} を 。 || Hikari — light. It shows what's hidden. …It also shows up the mud on my boots, so use it with care.
!set rw_lanterns_done
!quest rw_labels 1 quiet
!autosave

@scene rw.ren_done
!faceplayer ren
ren: {灯|あか}り の {名前|なまえ} は 、 {今|いま} の ところ {落|お}ち{着|つ}いて います 。 {一時間|いちじかん} ごと に {確|たし}かめて います が 。 || The lanterns' names are holding, for now. I'm checking them every hour.
?(!quest.rw_boots) ren: …… {靴|くつ} です か ？ {気|き}づいて いました 。 {直|なお}す {時間|じかん} が ない だけ です 。 {本当|ほんとう} です 。 || …My boots? I'm aware. I simply haven't had time to mend them. Truly.

@scene rw.suzu_first
# Staged: Suzu's showman's welcome with both hands; Mame points her out and Suzu answers her; when she
# lowers her voice she looks away and back to you; the lanterns closing like books in her hands; a laugh;
# and the far bank her troupe reached, pointed at.
!faceplayer suzu
!gesture suzu size pc
suzu[laugh]: さあさあ 、 {旅|たび} の お{方|かた} ！ {嵐|あらし} の {夜|よる} の {不思議|ふしぎ} な {話|はなし} 、 {聞|き}いて いかない ？ お{代|だい} は {笑顔|えがお} ひとつ ！ || Roll up, traveller! Care to hear a strange tale of the storm night? The price — one smile!
!gesture mame point suzu
mame: スズ の {話|はなし} 、 {三回|さんかい} {目|め} だ よ ！ {毎回|まいかい} ちがう けど ！ || This is the third time Suzu's told it! It's different every time!
!look suzu mame
!gesture suzu palm mame
suzu[smirk]: {語|かた}り{部|べ} は {話|はなし} を {育|そだ}てる もの な の 。 || A storyteller helps her stories grow.
!look suzu pc
narr: {色褪|いろあ}せた {舞台用|ぶたいよう} の リボン 。 {大|おお}きな {身振|みぶ}り 。 でも 、 {声|こえ} を {落|お}とした とき 、 {目|め} は {笑|わら}って いない 。 || A faded stage ribbon. Big gestures. But when she lowers her voice, her eyes aren't smiling.
!gesture suzu avert pc
suzu: …… {本当|ほんとう} の ところ を {言|い}う と ね 。 {嵐|あらし} の {夜|よる} 、 {道|みち} を {誰|だれ} か が {歩|ある}いて いた 。 {足音|あしおと} が しない の 。 {水|みず}たまり を {踏|ふ}んで も 、 {音|おと} が しない 。 || …If I'm honest. On the storm night, someone was walking the road. No footsteps. Even stepping in puddles, no sound.
!gesture suzu size
suzu: その {人|ひと} が {通|とお}った あと 、 {灯|あか}り が ひとつ ずつ {消|き}えた 。 {本|ほん} を {閉|と}じる みたい に 、 {丁寧|ていねい} に 。 || After that person passed, the lanterns went out one by one. Carefully, like someone closing books.
!gesture suzu laugh
suzu[smile]: …… ほら ね 。 {三回|さんかい} {目|め} で やっと {本当|ほんとう} の {話|はなし} に なった 。 {話|はなし} は {育|そだ}つ の 。 || …See? Third time round, it finally became the true version. Stories grow.
!gesture suzu point 42,17
suzu: {一座|いちざ} は {先|さき} に {向|む}こう{岸|ぎし} へ {渡|わた}った の 。 {私|わたし} は {荷物|にもつ} の {番|ばん} で {残|のこ}ってたら 、 {橋|はし} が …… ね 。 {見|み}て の とおり 。 || My troupe crossed to the far bank ahead of me. I stayed behind to mind the luggage, and then the bridge… well. You've seen it.
!set rw_suzu_told rw_met_suzu
!quest rw_labels 1 quiet

@scene rw.suzu_again
!faceplayer suzu
suzu: お{客|きゃく}さま 、 アンコール ？ {残念|ざんねん} 、 {今日|きょう} の {公演|こうえん} は {終|お}わり 。 {明日|あした} は {新作|しんさく} よ 。 || An encore, dear audience? Sorry — today's show is over. Tomorrow, a new piece.
?(!rw_mill_open) suzu: {橋|はし} が {届|とど}かない の 、 {私|わたし} の せい じゃ ない よ ね ？ …… {冗談|じょうだん} 。 {半分|はんぶん} は 。 || The bridge not reaching isn't my fault, right? …Joking. Half joking.
?(rw_mill_open) suzu: {水車|すいしゃ}{小屋|ごや} ？ {怖|こわ}い {話|はなし} の {舞台|ぶたい} に ぴったり 。 …… {私|わたし} も {行|い}く 。 {怖|こわ}い から こそ 。 || The mill? The perfect set for a ghost story. …I'm coming too. Precisely because it's scary.

@scene rw.hana_first
# Staged (Chapter 1 performed interaction, docs/expressive/GESTURES.md): Hana stops at the two cups on
# the table, the player turns with her and back; a thought, a guarded hand, the cup held out.
!faceplayer hana
!gesture hana nod pc
hana[smile]: いらっしゃい 。 {朝|あさ} の お{茶|ちゃ} 、 {入|い}れた ばかり よ 。 …… あら 。 || Welcome. I've just made the morning tea. …Oh.
!gesture hana observe prop:teaset hold
!gesture pc listen prop:teaset
narr: {卓|たく} の {上|うえ} に 、 {湯気|ゆげ} の {立|た}つ {茶碗|ちゃわん} が ふたつ 。 || On the table, two cups of tea, steaming.
!look pc hana
!gesture hana chin hold
hana[think]: また ふたつ いれて しまった 。 {毎朝|まいあさ} 、 {手|て} が {勝手|かって} に ふたつ いれる の 。 || I've poured two again. Every morning my hands pour two on their own.
!gesture hana guard hold
hana[worry]: {一|ひと}つ は わたし の 。 もう {一|ひと}つ は …… {誰|だれ} の だった かしら 。 {毎朝|まいあさ} {来|く}る {人|ひと} が いた はず なの 。 {声|こえ} も {笑|わら}い{方|かた} も {覚|おぼ}えて いる のに 、 {名前|なまえ} と {顔|かお} だけ が 、 ない の 。 || One is mine. The other… whose was it? Someone used to come every morning, I'm sure of it. I remember the voice, the laugh — only the name and face are gone.
!gesture hana aside
hana: {変|へん} よ ね 。 {冷|さ}めた お{茶|ちゃ} を {毎朝|まいあさ} {捨|す}てる の が 、 {少|すこ}し {寂|さび}しい だけ 。 …… {飲|の}んで いく ？ {冷|さ}めてない {方|ほう} を 。 || Silly, isn't it. It's just a little lonely, pouring the cold cup away every morning. …Will you have some? The one that isn't cold.
!choice
* いただきます || I'd love some. -> drink
* {誰|だれ} か {心当|こころあ}たり は ？ || Any idea who it could be? -> who
:who
!gesture hana point down
hana[think]: {橋|はし} の {方|ほう} から {来|き}た 、 と {思|おも}う 。 {朝|あさ} は いつも {川|かわ} の {匂|にお}い が した 。 それ しか わからない の 。 || From the direction of the bridge, I think. They always smelled of the river in the mornings. That's all I know.
:drink
!prop hana cup
!gesture hana present pc prop=cup hold
hana[smile]: どう ぞ 。 {旅|たび} の {人|ひと} に {飲|の}んで もらえる なら 、 {二|ふた}つ{目|め} も {無駄|むだ} じゃ ない わ 。 || Here you are. If a traveller drinks it, the second cup isn't wasted.
!give rw_tea_leaves quiet
!set rw_hana_cups
!quest rw_labels 1 quiet

@scene rw.hana_again
!faceplayer hana
hana: お{茶|ちゃ} 、 まだ ある わ よ 。 {二|ふた}つ {分|ぶん} 。 || There's still tea. Enough for two.
?(rw_mill_open) hana[worry]: {水車|すいしゃ}{小屋|ごや} に {行|い}く の ？ …… {昔|むかし} 、 あそこ で {誰|だれ} か と よく {遊|あそ}んだ {気|き} が する 。 {気|き}を つけて ね 。 || You're going to the mill? …I feel like I used to play there with someone, long ago. Be careful.

@scene rw.tea_cups
narr: {茶碗|ちゃわん} が ふたつ 。 ひとつ は {縁|ふち} が {少|すこ}し {欠|か}けて いる 。 {長|なが}い あいだ {同|おな}じ {人|ひと} が {使|つか}って きた の だろう 。 || Two teacups. One has a small chip on the rim. The same person must have used it for years.

@scene rw.teatable
narr: {茶屋|ちゃや} の {外|そと} の {卓|たく} 。 {川|かわ} と {橋|はし} が よく {見|み}える 。 {向|む}こう{岸|ぎし} まで {届|とど}かない {橋|はし} が 。 || The table outside the teahouse has a good view of the river and the bridge. The bridge that doesn't reach the far bank.
?(bridge_fixed) narr: {橋|はし} は {向|む}こう{岸|ぎし} まで {届|とど}いて いる 。 {朝|あさ} の {光|ひかり} が {板|いた} の {上|うえ} で {光|ひか}って いる 。 || The bridge reaches the far bank. Morning light glints on the planks.

@scene rw.tea_bed
!if !rw_met_tsuru -> no
narr: ハナ が {貸|か}して くれた {部屋|へや} の {布団|ふとん} 。 {少|すこ}し {休|やす}もう か 。 || The futon in the room Hana lent you. Rest a while?
!choice
* {休|やす}む || Rest. -> rest
* やめて おく || Not now. -> end
:rest
!inn
narr: {川|かわ} の {音|おと} を {聞|き}き ながら 、 {少|すこ}し {眠|ねむ}った 。 || You sleep a little, listening to the river.
!end
:no
narr: {他人|たにん} の {布団|ふとん} だ 。 {勝手|かって} に {寝|ね}る わけ に は いかない 。 || It's someone else's futon. You can't just lie down on it.
`, 'ch1/30_arrival');
