/* Sazanami's scenes (expansion P11d; the map, people and quests in 01_region.js, the tasks in 30_learning.js). The
 * first sight of the hamlet; Isaku at the jetty (his mother's letter, the winter's storms, the written leaves in his
 * nets that point west); Uki's market and the hamlet's post; Yone's torn net; the tide-pool school, where the player
 * teaches Mina and Riku. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
# ---- arriving --------------------------------------------------------------------------------------------------------
@scene sz.first
# The first sight of the hamlet, on foot down the coast road or ashore from the jetty: nets drying on racks, a little
# market by the jetty, children at the pools on the point.
!set sz_seen
!travel sazanami
narr: {小|ちい}さな {漁村|ぎょそん} 。 {網|あみ} が {風|かぜ} に {揺|ゆ}れ 、 {桟橋|さんばし} の {横|よこ} で {市|いち} が {立|た}って いる 。 {岬|みさき} の {潮|しお}だまり で 、 {子|こ}ども が {二人|ふたり} {遊|あそ}んで いる 。 || A small fishing hamlet. Nets sway in the wind; by the jetty a market is going. Out on the point, two children play at the tide pools.
?(comp=nao) comp: {漣|さざなみ} か 。 {郵便|ゆうびん} は {月|つき} に {一度|いちど} 。 …… {待|ま}って いる {手紙|てがみ} が 、 たくさん ありそう だ 。 || Sazanami. Post once a month. …There must be a lot of letters people are waiting for.
?(comp=mio) comp[smile]: {潮|しお} の {匂|にお}い 。 {潮硝子|しおがらす} より 、 {少|すこ}し {静|しず}か です ね 。 || The smell of the sea. A little quieter than Saltglass.
?(comp=ren) comp: {灯籠|とうろう} が {一|ひと}つ も ありません 。 ここ で は 、 {海|うみ} が {道|みち} な の です ね 。 || Not one lantern. Here, the sea is the road.
?(comp=suzu) comp[smile]: {舞台|ぶたい} は {小|ちい}さい けど 、 {役者|やくしゃ} は {揃|そろ}ってる わ ね 。 || A small stage, but the whole cast is here.

@scene sz.arrive_boat
# Ashore from the boat at the jetty.
?(!sz_seen) !call sz.first

@scene sz.road_sign
narr: {道標|みちしるべ} 。 「{東|ひがし} 　{潮硝子|しおがらす}」 。 || A signpost: "East: Saltglass".

@scene sz.netrack
narr: {網|あみ} が {干|ほ}して ある 。 {繕|つくろ}った {跡|あと} が 、 {新|あたら}しい {糸|いと} の {色|いろ} で {分|わ}かる 。 || Nets hung up to dry. The mended places show in the colour of the new twine.

@scene sz.stall
narr: {台|だい} の {上|うえ} に 、 {今朝|けさ} の {魚|さかな} 。 {端|はし} に 、 {郵便|ゆうびん} の {箱|はこ} が {置|お}いて ある 。 || This morning's fish on the counter. At one end sits the hamlet's post box.

@scene sz.pools_sign
narr: {立|た}て{札|ふだ} ： 「{貝|かい} を {取|と}らないで ください 。 {石|いし} は {元|もと} に {戻|もど}して ください 。」 || A notice: "Please don't take the shellfish. Please put the stones back as you found them."

# ---- Isaku ----------------------------------------------------------------------------------------------------------
@scene sz.isaku_first
!faceplayer
sz_isaku: よう 。 {潮硝子|しおがらす} から {来|き}た の か 。 || Hey. Come from Saltglass?
sz_isaku: {市場|いちば} の キヨ を {知|し}ってる か ？ {俺|おれ} の {母|はは} だ 。 …… {元気|げんき} に してる か な 。 {顔|かお} を {見|み}せ に {帰|かえ}れ と 、 {毎月|まいつき} {手紙|てがみ} が {来|く}る 。 || Know Kiyo at the market? She's my mother. …Hope she's well. Every month she writes telling me to come home and show my face.
?(comp=nao) comp: {毎月|まいつき} {届|とど}く {手紙|てがみ} か 。 …… {返事|へんじ} は 、 {書|か}いて やれ よ 。 || A letter every month, eh. …Write back, at least.

@scene sz.isaku_idle
!faceplayer
?(sea_post_sz) sz_isaku: {母|はは} から {手紙|てがみ} が {来|き}た 。 {魚|さかな} ばかり {食|た}べて ない で 、 {野菜|やさい} も {食|た}べろ 、 だ と さ 。 …… {漁師|りょうし} に {言|い}う こと か 。 || A letter from my mother. Don't just eat fish, eat your vegetables too, she says. …To a fisherman.
?(!sea_post_sz) sz_isaku: {今日|きょう} は {波|なみ} が {穏|おだ}やか だ 。 {網|あみ} を {入|い}れる に は いい 。 || The sea's calm today. Good for putting the nets out.

@scene sz.isaku_winter
# The licence's last leg, before Snowbell's story is over: nothing in the nets yet.
!faceplayer
sz_isaku: {変|へん} な もの ？ …… {今|いま} は 、 {魚|さかな} と {海藻|かいそう} だけ だ 。 || Anything strange? …Just now, only fish and seaweed.
sz_isaku: だが {冬|ふゆ} の {嵐|あらし} の {後|あと} は 、 {西|にし} から {色々|いろいろ} {流|なが}れて {来|く}る 。 {冬|ふゆ} が {明|あ}けたら 、 また {来|き}な 。 || But after the winter storms, all sorts drifts in from the west. Come back once the winter's over.

@scene sz.isaku_leaves
# After the winter (Snowbell's story): Isaku brings up a net with written leaves caught in its meshes. They drift from
# the west, where the old fishers say an island lies past the charts. The island's hint (the port joins the chart).
!faceplayer
sz_isaku: {来|き}た か 。 {見|み}せたい もの が ある 。 || There you are. I've something to show you.
!gesture sz_isaku point 21,20
narr: イサク が {網|あみ} を {引|ひ}き{上|あ}げる 。 {網|あみ} の {目|め} に 、 {金色|きんいろ} の {葉|は} が {何枚|なんまい} も {引|ひ}っかかって いる 。 {一枚|いちまい} {一枚|いちまい} に 、 {薄|うす}く {字|じ} が {書|か}いて ある 。 || Isaku hauls up a net. Caught in its meshes are gold leaves, many of them, and on each one, faintly, there is writing.
sz_isaku: {冬|ふゆ} の {嵐|あらし} の {後|あと} から 、 {毎朝|まいあさ} これ だ 。 {潮|しお} は {西|にし} から {来|く}る 。 {爺|じい}さん たち は 、 {西|にし} の {沖|おき} に {島|しま} が ある と {言|い}う 。 {海図|かいず} に は ない {島|しま} だ 。 || Every morning since the winter storms, it's this. The tide comes from the west. The old men say there's an island out west. One that isn't on any chart.
?(comp=nao) comp: …… {郵便|ゆうびん} の {札|ふだ} の {字|じ} みたい な {葉|は} も ある 。 {港長|こうちょう} の {言|い}って いた {島|しま} か 。 || …Some of these look like the writing on a postal tag. The island the harbourmaster talked about?
?(comp=mio) comp[think]: {字|じ} の {書|か}いて ある {葉|は} …… 。 {潮|しお} を {辿|たど}れば 、 {島|しま} に {着|つ}く かも しれません 。 || Leaves with writing… If we follow the tide, we might reach the island.
?(comp=ren) comp: {墨|すみ} の {色|いろ} が 、 {一枚|いちまい} ずつ {違|ちが}います 。 {別々|べつべつ} の {人|ひと} が {書|か}いた {字|じ} です 。 || The ink is a different colour on each one. Different people wrote these.
?(comp=suzu) comp[surprise]: {台本|だいほん} の {切|き}れ{端|はし} みたい ね 。 {続|つづ}き は 、 {西|にし} の {島|しま} に ある の かしら 。 || Like scraps of a script. Is the rest of it on the island out west?
sz_isaku: {潮|しお} に {乗|の}って {西|にし} へ {行|い}けば 、 {着|つ}く かも な 。 {自分|じぶん} の {船|ふね} が ある なら 、 {行|い}って みろ よ 。 || Ride the tide west and you might get there. You've a boat of your own: go and see.
!set sea_ko_hint
!quest sea_licence 8
!journal {漣|さざなみ} の {網|あみ} に 、 {字|じ} の {書|か}いて ある {葉|は} 。 {西|にし} の {沖|おき} の {島|しま} から {流|なが}れて {来|く}る らしい 。 {海図|かいず} に 、 {新|あたら}しい {行|い}き{先|さき} が {増|ふ}えた 。 || Written leaves in Sazanami's nets, drifting in from an island out west. A new destination on the chart.

# ---- Uki: the market and the post -------------------------------------------------------------------------------------
@scene sz.uki_first
!faceplayer
sz_uki: いらっしゃい ！ {朝|あさ} の {水揚|みずあ}げ だ よ ！ …… あ 、 {客|きゃく} じゃ ない ね 。 {旅|たび} の {人|ひと} だ 。 || Come and see! The morning catch! …Oh, you're not buying, you're travelling.
sz_uki: ちょうど いい 。 {帳面|ちょうめん} を {付|つ}ける {人|ひと} が {寝坊|ねぼう} して ね 。 {数|かず} を {数|かぞ}えて くれない ？ || Perfect timing. The one who keeps the tally overslept. Would you count for me?
!choice
* {手伝|てつだ}います 。 || I'll help. -> yes
* また {今度|こんど} 。 || Another time. -> end
:yes
!quest sz_market 0
!call sz.uki_market

@scene sz.uki_market
!faceplayer
sz_uki: {言|い}う よ ！ {書|か}いて ！ || I'll call them out! You write!
!challenge sz.market
!if var._res=1 -> ok
sz_uki: あれ 、 {合|あ}わない ね 。 {後|あと} で もう {一回|いっかい} {数|かぞ}えよう 。 || Hm, that doesn't add up. We'll count again later.
!end
:ok
sz_uki[happy]: {合|あ}ってる ！ {助|たす}かった よ 。 {寝坊|ねぼう} した {奴|やつ} より 、 {速|はや}い くらい だ 。 || That's right! What a help. Quicker than the one who overslept, even.
!quest sz_market done

@scene sz.uki_post
# The maiden voyage: the hamlet's bundle from the mailbag, into the post box at Uki's stall.
!faceplayer
sz_uki: {郵便|ゆうびん} ？ {潮硝子|しおがらす} から ？ …… {月|つき} の {半|なか}ば に ？ || Post? From Saltglass? …In the middle of the month?
narr: {郵便|ゆうびん}{袋|ぶくろ} から 、 {漣|さざなみ} {宛|あて} の {束|たば} を {出|だ}して {渡|わた}した 。 || You take the bundle for Sazanami from the mailbag and hand it over.
sz_uki[happy]: {本当|ほんとう} だ ！ イサク 、 お{母|かあ}さん から だ よ ！ …… これ から は 、 {船|ふね} で {来|く}る の ？ {月|つき} に {一度|いちど} じゃ なく て ？ || It really is! Isaku, one from your mother! …From now on it comes by boat? Not once a month?
!set sea_post_sz
!call sea.post_check

@scene sz.uki_after
sz_uki: {今日|きょう} も {大漁|たいりょう} だ よ ！ {数|かぞ}える の は 、 {自分|じぶん} で やる けど ね 。 || Another good catch today! I'm doing the counting myself, though.

@scene sz.uki_idle
sz_uki: いらっしゃい ！ {見|み}る だけ でも いい よ ！ || Come and look! Looking's free!

# ---- Yone: the torn net -------------------------------------------------------------------------------------------
@scene sz.yone_first
!faceplayer
sz_yone: …… {目|め} が {悪|わる}く なって ね 。 {網|あみ} の {破|やぶ}れ が 、 よく {見|み}えない の さ 。 || …My eyes aren't what they were. I can't make out the tears in a net any more.
sz_yone: {若|わか}い {目|め} を {貸|か}して おくれ 。 {破|やぶ}れた {目|め} を {見|み}つけて 、 {繕|つくろ}い {方|かた} を {一緒|いっしょ} に 。 || Lend me young eyes. Find the torn meshes, and we'll mend them together.
!choice
* {手伝|てつだ}います 。 || I'll help. -> yes
* また {今度|こんど} 。 || Another time. -> end
:yes
!quest sz_nets 0
!call sz.yone_nets

@scene sz.yone_nets
!faceplayer
!if var.sz_net>=1 -> knot
sz_yone: どこ が {破|やぶ}れて いる か 、 {言|い}って おくれ 。 || Tell me where it's torn.
!challenge sz.net_find
!if var._res=1 -> found
sz_yone: {急|いそ}がない よ 。 {網|あみ} は {逃|に}げない 。 || No hurry. The net isn't going anywhere.
!end
:found
!var sz_net = 1
sz_yone: そこ だ ね 。 では 、 {繕|つくろ}おう 。 || There, is it. Now, let's mend it.
:knot
!challenge sz.net_knot
!if var._res=1 -> done
sz_yone: {順番|じゅんばん} が {大事|だいじ} なん だ よ 。 また {後|あと} で 。 || The order's what matters. Later, then.
!end
:done
sz_yone[smile]: …… いい {結|むす}び{目|め} だ 。 {孫|まご} に {教|おそ}わった と {言|い}って おこう 。 {本当|ほんとう} は {孫|まご} なんて いない けど ね 。 || …A good knot. I'll say my grandchild taught me. Not that I have one.
!quest sz_nets done

@scene sz.yone_after
sz_yone: {目|め} は {悪|わる}く なって も 、 {手|て} は {覚|おぼ}えて いる もん だ ね 。 || My eyes may go, but my hands remember.

@scene sz.yone_idle
sz_yone: {網|あみ} は 、 {魚|さかな} より {先|さき} に {風|かぜ} を {捕|つか}まえる 。 {干|ほ}す {時|とき} は 、 {気|き} を つけな 。 || A net catches the wind before it catches a fish. Mind that, when you hang one out.

# ---- the tide-pool school ----------------------------------------------------------------------------------------
@scene sz.school_ask
# Mina and Riku's teacher has gone to Saltglass for the season; they ask the traveller to be their teacher at the
# pools. The player teaches: three lessons, one each time you talk to either child.
!faceplayer
sz_mina: ねえ 、 {先生|せんせい} に なって くれる ？ {学校|がっこう} の {先生|せんせい} が 、 {潮硝子|しおがらす} に {行|い}っちゃった の 。 || Hey, will you be our teacher? Our school teacher's gone off to Saltglass.
sz_riku: {潮|しお}だまり が {教室|きょうしつ} な ん だ 。 {生|い}き{物|もの} の {名前|なまえ} 、 {教|おし}えて ！ || The tide pools are our classroom. Teach us the creatures' names!
?(comp=nao) comp: {先生|せんせい} か 。 …… {宛名|あてな} の {読|よ}み{方|かた} なら 、 {俺|おれ} も {教|おし}えられる が な 。 || Teacher, eh. …Reading addresses, I could teach.
?(comp=mio) comp[smile]: {先生|せんせい} です って 。 {頑張|がんば}って ください ね 。 || Teacher, they say. Do your best.
?(comp=ren) comp: {教|おし}える と 、 {自分|じぶん} も {覚|おぼ}え{直|なお}します 。 いい {授業|じゅぎょう} に なります よ 。 || Teaching, you learn it again yourself. It'll be a good lesson.
?(comp=suzu) comp[smile]: {教壇|きょうだん} も {舞台|ぶたい} の {一|ひと}つ よ 。 {声|こえ} を {張|は}って ね 。 || A teacher's platform is a kind of stage. Project your voice.
!choice
* {引|ひ}き{受|う}けます 。 || All right. -> yes
* また {今度|こんど} 。 || Another time. -> end
:yes
!quest sz_school 0
sz_mina[happy]: やった ！ じゃあ 、 {一時間目|いちじかんめ} ！ || Yay! First lesson, then!
!call sz.school_lesson

@scene sz.school_lesson
!faceplayer
!if var.sz_lesson>=2 -> l3
!if var.sz_lesson>=1 -> l2
sz_riku: {石板|せきばん} に {書|か}いた よ 。 「ヤトカリ」 ！ {貝|かい} を {背負|せお}ってる やつ ！ …… {合|あ}ってる ？ || I wrote it on my slate: ヤトカリ! The one carrying a shell on its back! …Is that right?
!challenge sz.school_1
!if var._res=1 -> ok
!goto later
:l2
sz_mina: ヒトデ が {三|みっ}つ いる よ 。 …… {一匹|いっぴき} 、 {二匹|にひき} …… {三匹|さんひき} ？ {読|よ}み{方|かた} が {変|か}わる の 、 なんで ？ || There are three starfish. …One, two… three? Why does the reading keep changing?
!challenge sz.school_2
!if var._res=1 -> ok
!goto later
:l3
sz_riku: {立|た}て{札|ふだ} 、 {何|なん} て {書|か}いて ある の ？ {大人|おとな} は {読|よ}んで くれない ん だ 。 || What does the notice say? The grown-ups never read it to us.
!challenge sz.school_3
!if var._res=1 -> ok
!goto later
:ok
!var sz_lesson + 1
!if var.sz_lesson>=3 -> done
?(var.sz_lesson=1) sz_riku[happy]: ヤ「ド」カリ ！ {点々|てんてん} が いる ん だ 。 …… {覚|おぼ}えた ！ || Ya-DO-kari! It needs the two dots. …Got it!
?(var.sz_lesson=2) sz_mina[happy]: いっぴき 、 にひき 、 さんびき 。 {口|くち} が {勝手|かって} に {言|い}い{易|やす}い {音|おと} に する ん だ ね 。 || Ippiki, nihiki, sanbiki. Your mouth turns them into whatever's easiest to say.
sz_mina: {次|つぎ} の {授業|じゅぎょう} も 、 {待|ま}ってる ね ！ || We'll be waiting for the next lesson!
!end
:done
sz_riku[happy]: {貝|かい} を {取|と}らない で 、 {石|いし} は {元|もと} に {戻|もど}す 。 {生|い}き{物|もの} の {家|いえ} だ から ！ || Don't take the shellfish, and put the stones back. Because they're the creatures' homes!
sz_mina: {先生|せんせい} 、 ありがとう ！ …… これ 、 {授業料|じゅぎょうりょう} 。 {一番|いちばん} きれい な {貝殻|かいがら} ！ {空|から}っぽ だ から 、 {取|と}って いい やつ ！ || Thank you, teacher! …This is your fee. The prettiest shell! It's an empty one, so it's all right to take.
?(comp=nao) comp: {授業料|じゅぎょうりょう} が {貝殻|かいがら} か 。 …… {一番|いちばん} {高|たか}い {授業料|じゅぎょうりょう} だ な 。 || A shell for the fee. …The best-paid lesson there is.
?(comp=mio) comp[smile]: {空|から} の {貝殻|かいがら} を {選|えら}んだ の 、 {偉|えら}い わ 。 ちゃんと {聞|き}いて いた の ね 。 || Choosing an empty shell, well done. You were listening.
?(comp=ren) comp: {教|おし}えた こと が 、 もう {返|かえ}って きました ね 。 || What you taught has already come back to you.
?(comp=suzu) comp[smile]: {千秋楽|せんしゅうらく} の {花|はな} より 、 {嬉|うれ}しい {贈|おく}り{物|もの} ね 。 || Better than flowers on closing night.
!quest sz_school done
!end
:later
sz_mina: …… {先生|せんせい} 、 また {明日|あした} {教|おし}えて ね 。 || …Teacher, teach us again tomorrow.

@scene sz.mina_after
sz_mina: ヤドカリ 、 ヒトデ 、 イソギンチャク ！ {全部|ぜんぶ} {書|か}ける よう に なった よ ！ || Hermit crab, starfish, sea anemone! I can write them all now!

@scene sz.riku_after
sz_riku: {石|いし} は {元|もと} に {戻|もど}した よ 。 {先生|せんせい} の {言|い}う とおり ！ || I put the stones back. Like teacher said!

@scene sz.mina_idle
sz_mina: {潮|しお}だまり に は 、 {小|ちい}さい {海|うみ} が {入|はい}ってる ん だ よ 。 || Each tide pool's got a little sea in it.

@scene sz.riku_idle
sz_riku: {波|なみ} が {来|く}る {前|まえ} に 、 {走|はし}って {逃|に}げる ん だ ！ || When the wave's coming, you run!
`);
