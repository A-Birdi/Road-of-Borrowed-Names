/* Steamhollow, Chapter 11: the town (expansion P13b–c; docs/future/work/P13_STEAMHOLLOW.md). The market by the red
 * bridge (Tokube, the tonic seller from Playhouse Row, now selling his "cures" at their source: the polite-refusal
 * training ground, yn.salesman, and Mio's honest rejection of a fraud, S4); Tama's steam box (yn.cook, the recipe card;
 * Eggs for Everyone continues in 26_scenes_side.js); the townsfolk (the geta-maker, the lantern-lighter, the postman,
 * the sign-painter, the gossip on the bridge, a carter from the ridge); the quarrel on the red bridge that shakes the
 * ground; the guild hall after it and the way down into the Steam Vents with Aki. The theatre and the dispensary's
 * first visits are here too; their companions' beats are in 27_scenes_comp.js.
 * Suzu's lines have Kansai versions (kansai_99_yn.js). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene yn.lower_first
!set yn_lower_seen
narr: {下|しも} の {町|まち} 。 {川|かわ} の {上|うえ} に {赤|あか}い {橋|はし} が {架|か}かり 、 {橋|はし} の {両側|りょうがわ} に {屋台|やたい} が {並|なら}んで いる 。 || The lower town. A red bridge crosses the river, with stalls along both sides of it.
narr: {川|かわ} の {水|みず} から も 、 {湯気|ゆげ} が {上|あ}がって いる 。 || Even the river is steaming.

@scene yn.tokube_stall
narr: {派手|はで} な {幟|のぼり} 。 「{湯|ゆ}ノ{谷|たに} の {名薬|めいやく} 。 {本場|ほんば} の {味|あじ} ！」 {小瓶|こびん} が {並|なら}んで いる 。 || A gaudy banner: "Steamhollow's wonder tonic. The real thing, from the source!" Rows of little bottles.

@scene yn.tokube
# Tokube, the tonic seller from Manybridge's Playhouse Row (mp.tokube), selling his cures at their source. He presses;
# you decline (yn.salesman). With Mio, her refusal is honest and kind, and it works (S4).
!faceplayer
mp_tokube: さあ さあ 、 {本場|ほんば} の {名薬|めいやく} だ よ ！ …… おや 、 どこ か で {見|み}た {顔|かお} だ ね 。 {八百橋|やおばし} の {芝居町|しばいまち} かい ？ || Step up, step up, the real wonder tonic, from the source! …Oh? I've seen that face somewhere. Playhouse Row, in Manybridge?
mp_tokube: {縁|えん} が ある ね え 。 {一本|いっぽん} どう だい ？ {腰|こし} に も {胸|むね} に も 、 {何|なん} に でも {効|き}く ！ || Must be fate! How about a bottle? Good for your back, your chest, anything at all!
!encounter yn.salesman
!set yn_tokube_done
?(var._enc=honest) !set yn_tokube_honest
?(var._enc=honest) narr: トクベエ は {幟|のぼり} を {下|お}ろし 、 {新|あたら}しい {紙|かみ} に {書|か}き{直|なお}した 。 「{湯|ゆ}ノ{谷|たに} の {湯|ゆ} と {生姜|しょうが} 。 {温|あたた}まります 。」 || Tokube takes down his banner and writes a new one: "Steamhollow spring water and ginger. Warms you up."
?(var._enc=declined) narr: トクベエ は {肩|かた} を すくめて 、 {次|つぎ} の {客|きゃく} に {声|こえ} を かけた 。 || Tokube shrugs and calls out to the next customer.
?(var._enc=bought) narr: {小瓶|こびん} を {一本|いっぽん} {買|か}った 。 {飲|の}んで みる と 、 {生姜|しょうが} の {味|あじ} が した 。 {悪|わる}く は ない 。 || You buy a little bottle. It tastes of ginger. Not bad, as it goes.

@scene yn.tokube_idle
!faceplayer
?(yn_tokube_honest) mp_tokube: 「{何|なん} でも {治|なお}る 」 より 、 「{温|あたた}まる 」 の {方|ほう} が 、 {売|う}れる ん だ よ 。 …… {誰|だれ} に も {言|い}う な よ 。 || "Warms you up" sells better than "cures everything". …Don't tell anyone.
?(!yn_tokube_honest) mp_tokube: また {来|き}な よ 。 {気|き} が {変|か}わったら な 。 || Come back if you change your mind.

@scene yn.tokube_after
!faceplayer
mp_tokube: {尾根|おね} の {人|ひと} たち に 、 {生姜|しょうが} {湯|ゆ} を {配|くば}って いる ん だ 。 {金|かね} は 、 {湯守|ゆもり} が {出|だ}して くれる 。 {悪|わる}く ない {商売|しょうばい} だ よ 。 || I'm handing out ginger and spring water to the ridge folk. The bath-keepers pay. Not a bad trade.

@scene yn.onatsu_stall
narr: {土産物|みやげもの} の {屋台|やたい} 。 {湯|ゆ} の {花|はな} の {包|つつ}み 、 {木|き} の {手桶|ておけ} の {根付|ねつけ} 、 「{湯|ゆ}ノ{谷|たに} 」 と {染|そ}めた {手拭|てぬぐ}い 。 || A souvenir stall: packets of spring-mineral "bath flowers", little wooden bucket charms, towels dyed with "Steamhollow".

@scene yn.onatsu
!faceplayer
yn_onatsu: いらっしゃい ！ {聞|き}いた ？ {上|かみ}の{湯|ゆ} の {女将|おかみ} と {下|しも}の{湯|ゆ} の {主|あるじ} 、 {昔|むかし} は {同|おな}じ {寺子屋|てらこや} に {通|かよ}って た の よ 。 || Welcome! Did you hear? The Upper House's proprietress and the Lower House's master went to the same village school once.
yn_onatsu: {二人|ふたり} と も 、 {字|じ} が {一番|いちばん} {上手|じょうず} で ね 。 {一番|いちばん} を {取|と}り{合|あ}って いた ん だって 。 …… {今|いま} も {変|か}わらない わ ね 。 || They both had the best handwriting, and fought over who was best. …Nothing's changed.
?(comp=suzu) comp[laugh]: {噂話|うわさばなし} の {出所|でどころ} は 、 いつも {屋台|やたい} よ ね 。 || Gossip always comes from the stalls, doesn't it.

@scene yn.onatsu_after
!faceplayer
yn_onatsu: {取|と}り{決|き}め の {紙|かみ} 、 {二人|ふたり} で {清書|せいしょ} した ん だって ！ {一行|いちぎょう} ずつ {交代|こうたい} で 。 {字|じ} の {勝負|しょうぶ} は 、 {引|ひ}き{分|わ}け 。 || They made the fair copy of the agreement together! A line each, in turn. The handwriting contest was a draw.

@scene yn.tsuneji
# A carter from the ridge who brought six neighbours down in his cart and hasn't said a word about it.
!faceplayer
yn_tsuneji: …… {荷車|にぐるま} で 、 {村|むら} の {者|もの} を {六人|ろくにん} {下|お}ろした 。 {下|しも}の{湯|ゆ} の {土間|どま} に いる 。 || …I brought six from the village down in my cart. They're on the Lower House's floor.
yn_tsuneji: {上|うえ} じゃ 、 {馬|うま} も {鳴|な}かなかった 。 {荷車|にぐるま} の {車輪|しゃりん} の {音|おと} も 、 {聞|き}こえなかった 。 {谷|たに} に {入|はい}って 、 {車輪|しゃりん} が {鳴|な}った {時|とき} …… {皆|みんな} 、 {泣|な}いた 。 || Up there even the horse made no sound. You couldn't hear the cart's wheels. When we came into the valley and the wheels started rattling… everyone wept.
?(comp=nao) comp[closed]: …… {六人|ろくにん} 。 {黙|だま}って {運|はこ}んだ の か 。 {大|たい}した {運|はこ}び{屋|や} だ 。 || …Six. And carried them without a word. That's a real carrier.
?(comp=mio) comp[sad]: {音|おと} が {戻|もど}って {泣|な}く の は 、 {体|からだ} が {安心|あんしん} した しるし です 。 …… よく {連|つ}れて {来|き}て くれました 。 || Crying when the sound comes back is the body's way of feeling safe. …You did well to bring them.
?(comp=ren) comp[think]: {車輪|しゃりん} の {音|おと} で 、 {谷|たに} に {着|つ}いた と {分|わ}かった 。 …… {音|おと} も 、 {灯|ひ} と {同|おな}じ です ね 。 || The sound of the wheels told them they'd reached the valley. …Sound is like a lamp, isn't it.
?(comp=suzu) comp: {拍手|はくしゅ} も {音|おと} よ 。 {谷|たに} で 、 {大|おお}きい の を {聞|き}かせて あげたい わ 。 || Applause is a sound too. I'd like them to hear a big round of it here.

@scene yn.kihachi
!faceplayer
yn_kihachi: {下駄|げた} の {音|おと} で 、 {客|きゃく} が {分|わ}かる 。 カラン 、 コロン 。 {急|いそ}ぐ {客|きゃく} 、 {酔|よ}った {客|きゃく} 、 {帰|かえ}りたくない {客|きゃく} 。 || I can tell a guest by the sound of their sandals. Karan, koron. A guest in a hurry, a guest who's had a drink, a guest who doesn't want to go home.
yn_kihachi: {尾根|おね} から {来|き}た {人|ひと} たち は 、 {最初|さいしょ} 、 {音|おと} を {立|た}てず に {歩|ある}いて いた 。 {三日|みっか} {目|め} に 、 やっと {鳴|な}った よ 。 || The folk from the ridge walked without a sound at first. On the third day, at last, their sandals rang.
?(comp=nao) comp[smirk]: {俺|おれ} の {足音|あしおと} は ？ || And my footsteps?
?(comp=nao) yn_kihachi: {出口|でぐち} を {探|さが}して いる {音|おと} だ 。 || Someone looking for the exit.

@scene yn.kihachi_after
!faceplayer
yn_kihachi: {今日|きょう} の {町|まち} の {音|おと} は 、 {急|いそ}いで いない 。 いい {音|おと} だ 。 || The town's sound today isn't in a hurry. A good sound.

@scene yn.geta_stall
narr: {下駄屋|げたや} の {店先|みせさき} 。 {桐|きり} の {台|だい} に 、 {赤|あか} と {藍|あい} の {鼻緒|はなお} 。 {大|おお}きさ で {値段|ねだん} が {違|ちが}う 。 || The geta-maker's shopfront: paulownia soles with red and indigo thongs, priced by size.

@scene yn.toki
# Toki lights the valley's lanterns at dusk, street by street (Ren's beat: the valley's lanterns).
!faceplayer
yn_toki: {夕方|ゆうがた} に なったら 、 {谷|たに} の {提灯|ちょうちん} を {全部|ぜんぶ} {点|つ}ける の が {私|わたし} の {仕事|しごと} 。 {百|ひゃく} と {八|や}つ 。 || At dusk it's my job to light every lantern in the valley. A hundred and eight.
yn_toki: {湯気|ゆげ} の {日|ひ} は 、 {灯|ひ} が にじんで {見|み}える から 、 {早|はや}め に {点|つ}ける の 。 {遠|とお}く から {来|き}た {人|ひと} が 、 {迷|まよ}わない よう に 。 || On steamy days the lights blur, so I light them early. So people coming from far off don't lose their way.
?(comp=ren) comp[surprise]: {百八|ひゃくはち} ！ …… {全部|ぜんぶ} 、 {名前|なまえ} が ある ん です か ？ || A hundred and eight! …Does every one have a name?
?(comp=ren) yn_toki: {名前|なまえ} ？ …… {考|かんが}えた こと も なかった 。 {通|とお}り の {名前|なまえ} なら ある けど 。 || A name? …I've never thought about it. They have the streets' names.
?(comp=ren) comp[smile]: それ で {十分|じゅうぶん} です 。 {通|とお}り の {名前|なまえ} で {呼|よ}べば 、 {灯|ひ} は {応|こた}えます 。 || That's enough. Call them by the street's name and the lamps will answer.

@scene yn.toki_after
!faceplayer
yn_toki: {提灯|ちょうちん} に 、 {通|とお}り の {名前|なまえ} を {書|か}く こと に した の 。 {迷子|まいご} が {減|へ}った わ 。 || I've started writing the street's name on each lantern. Fewer people get lost now.

@scene yn.senta
# Senta, the valley's postman, on sore feet (Nao's beat: a courier's sore feet).
!faceplayer
yn_senta: {郵便|ゆうびん} です 。 …… あ 、 いや 、 {今日|きょう} は {違|ちが}う 。 {足|あし} を {湯|ゆ} に {入|い}れに {来|き}た ん です 。 {北|きた} の {道|みち} を {毎日|まいにち} {往復|おうふく} して いる ので 。 || Post! …Ah, no, not today. I came to put my feet in the footbath. I walk the north road there and back every day.
yn_senta: {最近|さいきん} 、 {上|うえ} の {村|むら} へ {行|い}って も 、 {返事|へんじ} が {来|こ}ない ん です 。 {手紙|てがみ} は {届|とど}く 。 でも 、 {誰|だれ} も {読|よ}まない 。 || Lately, when I go up to the villages, no replies come. The letters arrive. But nobody reads them.
?(comp=nao) comp[closed]: …… {届|とど}いて も 、 {読|よ}まれない 。 {配達|はいたつ} {人|にん} に は 、 {一番|いちばん} {重|おも}い {話|はなし} だ 。 || …Delivered, and not read. For a courier, there's nothing heavier.
?(comp=nao) comp: {足|あし} 、 {湯|ゆ} に {入|い}れて こい 。 {重|おも}い {話|はなし} は 、 {足|あし} から {抜|ぬ}ける 。 || Go and put your feet in. The heavy things go out through your feet.

@scene yn.senta_after
!faceplayer
yn_senta: {上|うえ} の {村|むら} から 、 {一通|いっつう} だけ {返事|へんじ} が {来|き}ました 。 {字|じ} は {震|ふる}えて いた けど 、 {読|よ}めました 。 || One reply came down from the villages. The writing was shaky, but I could read it.

@scene yn.heikichi
!faceplayer
yn_heikichi: {看板|かんばん} {屋|や} の ヘイキチ だ 。 {上|かみ}の{湯|ゆ} と {下|しも}の{湯|ゆ} 、 {両方|りょうほう} から 「{向|む}こう より {大|おお}きい {看板|かんばん} を 」 と {頼|たの}まれて いる 。 || Heikichi, sign-painter. The Upper House and the Lower House have both asked me for "a sign bigger than theirs".
yn_heikichi: {谷|たに} の {幅|はば} が {足|た}りない よ 。 || The valley isn't wide enough.

@scene yn.heikichi_after
!faceplayer
yn_heikichi: {今|いま} は 、 {同|おな}じ {大|おお}きさ の {看板|かんばん} を {二枚|にまい} {書|か}いて いる 。 {下|しも}の{湯|ゆ} の {方|ほう} が 、 {字|じ} が {太|ふと}い けど な 。 || Now I'm painting two signs the same size. The Lower House's letters are a bit bolder, mind.

@scene yn.footbath
!if yn_nao_quarrel&!yn_nao_madeup -> nao
narr: {町|まち} の {足湯|あしゆ} 。 {長|なが}い {木|き} の {湯船|ゆぶね} に 、 {浴衣|ゆかた} の {人|ひと} たち が {並|なら}んで {足|あし} を {入|い}れて いる 。 || The town footbath: guests in yukata sit in a row with their feet in a long wooden trough.
!choice
* {足|あし} を {入|い}れる || Put your feet in -> in
* やめて おく || Not now -> no
:in
narr: {熱|あつ}い 。 でも 、 すぐ に {足|あし} の {裏|うら} から {温|あたた}かさ が {上|あ}がって くる 。 || Hot. But warmth soon rises from the soles of your feet.
?(comp=nao) comp[closed]: …… {座|すわ}る と 、 {立|た}てなく なる な 。 これ は 。 || …Sit down here and you'll never get up again.
!heal
!end
:nao
!call yn.nao_footbath
:no

@scene yn.steambox
narr: {石|いし} の {蒸|む}し{場|ば} 。 {竹|たけ} の {籠|かご} に {入|い}った {卵|たまご} が 、 {湯気|ゆげ} の {中|なか} で {揺|ゆ}れて いる 。 || The stone steam box. Eggs in bamboo baskets sway in the steam.
?(!yn_eggs_cooked) narr: タマ さん に {聞|き}けば 、 {作|つく}り{方|かた} を {教|おし}えて くれる そう だ 。 || Ask Tama and she'll show you how, they say.

@scene yn.tama
# Tama's recipe card: spring eggs (温泉卵), no timer: a procedure (yn.cook). The result feeds scenes, not a stat.
!faceplayer
yn_tama: {温泉卵|おんせんたまご} 、 {作|つく}って みる ？ {作|つく}り{方|かた} は 、 この {札|ふだ} の とおり 。 {急|いそ}がなくて いい の よ 。 {卵|たまご} は {待|ま}って くれる から 。 || Want to try making spring eggs? The method's on this card. No hurry. The eggs will wait for you.
!encounter yn.cook
!if var._res=0 -> later
!set yn_eggs_cooked
!give yn_eggs 3
yn_tama: {上手|じょうず} ！ {白身|しろみ} が とろっと して 、 {黄身|きみ} が しっとり 。 {三|みっ}つ 、 {持|も}って {行|い}きな 。 || Well done! The white's just set and the yolk is soft. Take three with you.
yn_tama: …… ねえ 、 {尾根|おね} から {来|き}た {人|ひと} たち に 、 {一|ひと}つ ずつ {届|とど}けて くれない ？ ヤスケ さん 、 ツネジ さん 、 オシゲ さん 。 {温|あたた}かい もの を {食|た}べる と 、 {声|こえ} が {出|で}る よう に なる から 。 || …Say, would you take one each to the folk from the ridge? Yasuke, Tsuneji and Oshige. Eat something warm and your voice comes back.
!quest yn_eggs 0
?(comp=nao) comp[smirk]: {卵|たまご} を {待|ま}つ の は 、 {悪|わる}く ない な 。 {急|いそ}がなくて いい {仕事|しごと} は 、 {久|ひさ}しぶり だ 。 || Waiting on eggs isn't bad. It's been a while since I had work that didn't need hurrying.
?(comp=mio) comp[smile]: {湯|ゆ} の {温度|おんど} で 、 {固|かた}まり{方|かた} が {違|ちが}う ん です ね 。 {白身|しろみ} と {黄身|きみ} が {逆|ぎゃく} に なる なんて 。 || The temperature of the water changes how they set. The white and the yolk the other way round!
?(comp=ren) comp[laugh]: {札|ふだ} の {順番|じゅんばん} どおり に やれば 、 {迷|まよ}いません ね 。 …… {道|みち} も 、 こう なら いい のに 。 || Follow the card in order and you can't get lost. …If only roads were like this.
?(comp=suzu) comp[laugh]: {一|ひと}つ {百文|ひゃくもん} で {売|う}れる わ よ 、 これ 。 …… {冗談|じょうだん} よ 。 {配|くば}りましょう 。 || These would sell for a hundred mon apiece. …Joking. Let's hand them out.
!end
:later
yn_tama: いい の よ 、 また {後|あと} で 。 {卵|たまご} は {逃|に}げない わ 。 || That's fine, later then. The eggs won't run off.

@scene yn.tama_buns
# Tama's second card: spring buns (温泉まんじゅう) steamed over the vent, no timer (yn.buns). A box to take away.
!faceplayer
yn_tama: {卵|たまご} の {次|つぎ} は 、 {温泉|おんせん}まんじゅう 。 {蒸|む}し{場|ば} の {湯気|ゆげ} で {蒸|む}す の 。 {作|つく}って みる ？ || After the eggs, spring buns. We steam them over the vent. Want to try?
!choice
* {作|つく}って みる || Give it a try -> make
* また {今度|こんど} || Another time -> later
:make
!encounter yn.buns
!if var._res=0 -> later
!set yn_buns_cooked
!give yn_buns
yn_tama: ほら 、 ふっくら ！ {箱|はこ} に {詰|つ}めて おいた から 、 {持|も}って {行|い}きな 。 {旅|たび} の {途中|とちゅう} で {食|た}べて ね 。 || Look at that, nice and plump! I've packed them in a box for you to take. Eat them on the road.
?(comp=nao) comp[smile]: …… {箱|はこ} ごと {走|はし}れる {土産|みやげ} は 、 {一番|いちばん} いい {土産|みやげ} だ 。 || …A souvenir you can run with, box and all, is the best kind.
?(comp=mio) comp[smile]: {蓋|ふた} を {開|あ}けない の が 、 {一番|いちばん} {難|むずか}しかった です 。 {薬|くすり} を {煎|せん}じる {時|とき} と {同|おな}じ です ね 。 || Not lifting the lid was the hardest part. Same as brewing medicine.
?(comp=ren) comp[laugh]: {六|むっ}つ 。 …… {道|みち} の {途中|とちゅう} で 、 {一|ひと}つ ずつ {食|た}べましょう 。 {迷|まよ}って も 、 {食|た}べる もの は あります 。 || Six. …One each on the road, now and then. Even if we get lost, we'll have something to eat.
?(comp=suzu) comp[laugh]: {一座|いちざ} の {差|さ}し{入|い}れ に したい くらい 。 …… {全部|ぜんぶ} は あげない けど 。 || I'd almost give them to the troupe as a backstage treat. …Not all of them, mind.
!end
:later
?(yn_eggs_done) yn_tama: いい の よ 。 また {今度|こんど} ね 。 || That's fine. Another time, then.
?(!yn_eggs_done) yn_tama: いい の よ 。 {卵|たまご} は {届|とど}けて くれた ？ {尾根|おね} の {人|ひと} たち 、 {待|ま}ってる から 。 || That's fine. Did you take the eggs round? The folk from the ridge are waiting.

@scene yn.tama_idle
!faceplayer
yn_tama: {卵|たまご} は {足|た}りてる ？ {尾根|おね} の {人|ひと} たち に {配|くば}って くれる {人|ひと} が いたら 、 {助|たす}かる ん だけど ね 。 || Got enough eggs? If someone would hand some out to the ridge folk, that'd be a help.

@scene yn.tama_after
!faceplayer
yn_tama: {蒸|む}し{場|ば} は 、 {誰|だれ} でも {使|つか}って いい こと に なった の 。 {取|と}り{決|き}め に {書|か}いて ある わ 。 || The steam box is open to anyone now. It's in the agreement.

@scene yn.divider
# The divider over the source (湯分け): the channel split two ways, and the old water clock on its post.
narr: {湯元|ゆもと} の {湯分|ゆわ}け 。 {湯|ゆ} の {流|なが}れ が 、 {木|き} の {堰|せき} で {二|ふた}つ に {分|わ}かれて いる 。 {左|ひだり} は {上|かみ}の{湯|ゆ} へ 、 {右|みぎ} は {下|しも}の{湯|ゆ} へ 。 || The divider over the source: the flow is split two ways by a wooden weir. Left to the Upper House, right to the Lower House.
narr: {柱|はしら} の {上|うえ} に 、 {古|ふる}い {水時計|みずどけい} 。 {目盛|めも}り の {浮|う}き が 、 {途中|とちゅう} で {止|と}まった まま {動|うご}かない 。 || On a post above it, an old water clock. The float on its scale has stopped halfway and doesn't move.
!set yn_clock_seen
?(comp=ren) comp[think]: {止|と}まって います 。 …… {時計|とけい} が {止|と}まれば 、 {半日|はんにち} も {分|わ}からない 。 || It's stopped. …If the clock stops, nobody knows when half a day is up.
?(comp=nao) comp: {止|と}まった {時計|とけい} で 、 {二|ふた}つ の {宿|やど} が {喧嘩|けんか} して いる わけ か 。 || So two inns are fighting by a stopped clock.

@scene yn.vents_door
!if yn_vents_open -> open
narr: {湯元|ゆもと} の {小屋|こや} の {裏|うら} に 、 {下|した} へ {降|お}りる {石段|いしだん} 。 {鉄|てつ} の {格子|こうし} に 、 「{湯守|ゆもり} の {外|ほか} 、 {入|はい}る べからず 」 。 || Behind the spring house, stone steps go down. On the iron grille: "Bath-keepers only."
!end
:open
narr: {石段|いしだん} の {下|した} から 、 {熱|あつ}い {風|かぜ} が {上|あ}がって くる 。 || Hot air rises from the bottom of the steps.
!warp yn.vents1 3 19 up

@scene yn.aki
!faceplayer
yn_aki: {湯守|ゆもり} の アキ 。 {湯元|ゆもと} に は {近|ちか}づかない で 。 {湯|ゆ} の {機嫌|きげん} が {悪|わる}い の 。 || Aki, bath-keeper. Keep away from the source. The water's in a bad temper.
yn_aki: {町|まち} が {怒鳴|どな}る と 、 {湯|ゆ} が {熱|あつ}く なる 。 {黙|だま}る と 、 {冷|つめ}たく なる 。 {私|わたし} の {手|て} は 、 {湯|ゆ} の {顔色|かおいろ} が {分|わ}かる の 。 || When the town shouts, the water goes hot. When it goes quiet, cold. My hands can read the water's mood.

@scene yn.aki_ready
!faceplayer
yn_aki: {頭|かしら} から {聞|き}いた 。 {抜|ぬ}け{穴|あな} へ {行|い}く ん でしょ 。 {格子|こうし} は {開|あ}けた わ 。 {先|さき} に {降|お}りて 、 {奥|おく} の {様子|ようす} を {見|み}て くる 。 || The head told me. You're going down into the vents. I've opened the grille. I'll go ahead and see how it is deeper in.
!set yn_vents_open
!refresh

@scene yn.bridge_quarrel
# The quarrel on the red bridge: Oritsu and Tahei meet in the middle, with half the town watching. Each says the other
# takes the water. Their voices rise; the ground shudders, the river boils, then runs cold. Nobody is hurt.
!set yn_quarrel
narr: {橋|はし} の {真|ま}ん{中|なか} で 、 {上|かみ}の{湯|ゆ} の {女将|おかみ} と {下|しも}の{湯|ゆ} の {主|あるじ} が {向|む}かい{合|あ}って いる 。 {町|まち} の {人|ひと} たち が 、 {遠巻|とおま}き に {見|み}て いる 。 || In the middle of the bridge the Upper House's proprietress and the Lower House's master stand face to face. The townsfolk watch from a distance.
yn_oritsu: {露天風呂|ろてんぶろ} など と いう もの を {作|つく}る から 、 {湯|ゆ} が {足|た}りなく なる の で ございます 。 || If one builds such a thing as an open-air bath, of course the water runs short.
yn_tahei: {客|きゃく} を {倍|ばい} に した の は どっち だ ！ {俺|おれ} たち の {半日|はんにち} は 、 {水|みず} しか {来|こ}ねえ ん だ よ ！ || And who doubled their guests? Our half day brings nothing but cold water!
yn_oritsu: {声|こえ} を {荒|あら}げる の は 、 {下|しも}の{湯|ゆ} の {流儀|りゅうぎ} で ございます か 。 || Is raising one's voice the Lower House's custom?
yn_tahei: {敬語|けいご} で {殴|なぐ}る の が 、 {上|かみ}の{湯|ゆ} の {流儀|りゅうぎ} か ！ || Is beating people with honorifics the Upper House's?
!sfx wind
!shake
narr: {足元|あしもと} が 、 {大|おお}きく {揺|ゆ}れた 。 {川|かわ} の {湯気|ゆげ} が 、 {一度|いちど} に {噴|ふ}き{上|あ}がる 。 || The ground lurches underfoot. Steam bursts up from the river all at once.
!shake
narr: …… そして 、 {急|きゅう} に {静|しず}か に なった 。 {川|かわ} から {湯気|ゆげ} が {消|き}えて いる 。 {冷|つめ}たい {風|かぜ} が 、 {谷|たに} を {抜|ぬ}けた 。 || …And then, suddenly, quiet. The steam has gone from the river. A cold wind passes down the valley.
yn_oritsu: …… {湯|ゆ} が 。 || …The water.
yn_tahei: {冷|つめ}てえ …… 。 || It's cold…
?(comp=nao) comp[closed]: {二人|ふたり} と も 、 {黙|だま}れ 。 …… {地面|じめん} が {先|さき} に {怒|おこ}った ぞ 。 || Both of you, quiet. …The ground got angry first.
?(comp=mio) comp[worry]: {急|きゅう} に {熱|あつ}く なって 、 {急|きゅう} に {冷|つめ}たく なる 。 {湯|ゆ} に {入|はい}って いる {人|ひと} が {危|あぶ}ない です ！ || Suddenly hot, then suddenly cold. Anyone in the bath is in danger!
?(comp=ren) comp[worry]: {灯|ひ} が {揺|ゆ}れて います 。 …… {谷|たに} じゅう の {灯|ひ} が 、 {一度|いちど} に 。 || The lamps are swaying. …Every lamp in the valley, all at once.
?(comp=suzu) comp[angry]: {幕|まく} を {下|お}ろして ！ {二人|ふたり} と も 、 {客席|きゃくせき} を {見|み}なさい よ 。 {皆|みんな} 、 {怖|こわ}がって いる わ 。 || Bring the curtain down! Both of you, look at your audience. Everyone's frightened.
narr: {女将|おかみ} と {主|あるじ} は 、 {互|たが}い に {目|め} を {逸|そ}らして 、 {黙|だま}って {橋|はし} を {下|お}りた 。 || The proprietress and the master look away from each other and step off the bridge without a word.
!quest yn_main 4
!journal {赤|あか}い {橋|はし} で {二|ふた}つ の {宿|やど} が {言|い}い{争|あらそ}い 、 {地面|じめん} が {揺|ゆ}れて {湯|ゆ} が {冷|つめ}たく なった 。 {湯守|ゆもり} の {寄合所|よりあいじょ} で 、 ロクベエ に {会|あ}おう 。 || The two inns quarrelled on the red bridge; the ground shook and the water went cold. See Rokubei at the bath-keepers' hall.
!autosave

@scene yn.guild_after_quarrel
# Rokubei after the quarrel: the clock has stopped (if you saw it); the old folk's Kettle; the vents. Aki goes ahead.
!set yn_guild_told
!faceplayer yn_rokubei
yn_rokubei: {見|み}た か 。 {町|まち} が {怒鳴|どな}れば 、 {湯|ゆ} が {暴|あば}れる 。 {黙|だま}れば 、 {冷|ひ}える 。 …… {昔話|むかしばなし} だ と {思|おも}って いた ん だ が な 。 || You saw it. When the town shouts, the water rages. When it falls silent, it goes cold. …I thought it was just an old story.
?(yn_clock_seen) yn_rokubei: {水時計|みずどけい} が {止|と}まって いた ？ …… そう か 。 {湯|ゆ} の {分|わ}け{方|かた} が {狂|くる}って いた の か 。 {俺|おれ} たち {湯守|ゆもり} が 、 {気|き}づかなかった 。 || The water clock had stopped? …I see. So the division's been off. And we bath-keepers never noticed.
yn_rokubei: {湯元|ゆもと} の {下|した} に 、 {昔|むかし} の {湯守|ゆもり} が {掘|ほ}った {抜|ぬ}け{穴|あな} が ある 。 {湯気|ゆげ} の {通|とお}り{道|みち} だ 。 {奥|おく} に は 、 {釜|かま}の{主|ぬし} が {住|す}む と いう 。 || Under the source there are tunnels the old bath-keepers dug: the steam's way up. Deep inside, they say, lives the Kettle Below.
yn_rokubei: {湯|ゆ} が {暴|あば}れる {理由|りゆう} を 、 {見|み}て {来|き}て くれない か 。 アキ が {格子|こうし} の {鍵|かぎ} を {持|も}って いる 。 || Would you go down and find out why the water's raging? Aki has the key to the grille.
?(comp=nao) comp: {地下|ちか} か 。 {出口|でぐち} を {先|さき} に {確|たし}かめる 。 {話|はなし} は それ から だ 。 || Underground. I'll check the exits first. Talk after.
?(comp=mio) comp[think]: {湯|ゆ} の {暴|あば}れ{方|かた} に は 、 {理由|りゆう} が ある はず です 。 {熱|ねつ} が {出|で}る の に {理由|りゆう} が ある よう に 。 || There must be a reason the water's raging. The way there's always a reason for a fever.
?(comp=ren) comp: {地下|ちか} で は 、 {私|わたし} は {後|うし}ろ を {歩|ある}きます 。 …… {迷|まよ}う の で 。 || Underground I'll walk at the back. …Because I'll get lost.
?(comp=suzu) comp[smirk]: {奈落|ならく} へ {降|お}りる の ね 。 {芝居小屋|しばいごや} の {下|した} なら 、 {慣|な}れて いる わ 。 || Down into the pit, then. I'm used to the space under a stage.
!quest yn_main 5
!journal {湯元|ゆもと} の {下|した} の {湯気|ゆげ} の {抜|ぬ}け{穴|あな} へ {降|お}りて 、 {湯|ゆ} が {暴|あば}れる {理由|りゆう} を {探|さが}そう 。 アキ が {格子|こうし} を {開|あ}けて くれる 。 || Go down into the Steam Vents under the source and find out why the water rages. Aki will open the grille.

@scene yn.rokubei_vents
!faceplayer
yn_rokubei: アキ は {湯元|ゆもと} に いる 。 {格子|こうし} の {鍵|かぎ} は 、 あいつ が {持|も}って いる 。 || Aki's at the source. She has the key to the grille.

@scene yn.rokubei_tomorrow
!faceplayer
yn_rokubei: {明日|あした} の {朝|あさ} 、 ここ に {皆|みな} を {集|あつ}める 。 {今夜|こんや} は 、 {休|やす}んで くれ 。 || Tomorrow morning I'll bring them all here. Tonight, rest.

@scene yn.rokubei_after
!faceplayer
yn_rokubei: {湯|ゆ} を {分|わ}ける の は {湯守|ゆもり} の {仕事|しごと} だ が 、 {話|はな}し{合|あ}う の は {谷|たに} {全体|ぜんたい} の {仕事|しごと} だ 。 …… {教|おし}えられた よ 。 || Dividing the water is the bath-keepers' job. Talking it out is the whole valley's job. …You taught me that.

@scene yn.guild_table
narr: {寄合所|よりあいじょ} の {長|なが}い {机|つくえ} 。 {端|はし} から {端|はし} まで 、 {古|ふる}い {傷|きず} が {並|なら}んで いる 。 {何代|なんだい} も の {言|い}い{争|あらそ}い の {跡|あと} だ 。 || The guild hall's long table, scarred from end to end: the marks of generations of arguments.

@scene yn.guild_ledger
narr: {湯守|ゆもり} の {帳面|ちょうめん} 。 {毎日|まいにち} の {湯|ゆ} の {量|りょう} と 、 {切|き}り{替|か}え の {時刻|じこく} 。 {最近|さいきん} の {頁|ページ} は 、 {切|き}り{替|か}え の {時刻|じこく} が {毎日|まいにち} {少|すこ}し ずつ {遅|おそ}れて いる 。 || The guild's ledger: each day's flow and the hour of each switch. On the recent pages the switch comes a little later every day.
!if item.yn_ledger -> end
!give yn_ledger
narr: ロクベエ が 、 {帳面|ちょうめん} の {写|うつ}し を {渡|わた}して くれた 。 || Rokubei hands you a copy of the ledger.
:end

@scene yn.guild_model
narr: {湯分|ゆわ}け の {模型|もけい} 。 {一|ひと}つ の {湯元|ゆもと} から 、 {二|ふた}つ の {流|なが}れ 。 {昔|むかし} の {字|じ} で 、 「{湯|ゆ} は {一|ひと}つ 、 {宿|やど} は {二|ふた}つ 」 と {彫|ほ}って ある 。 || A model of the divider: one source, two streams. Carved in old characters: "One spring, two houses."
?(comp=ren) comp[think]: 「{湯|ゆ} は {一|ひと}つ 、 {宿|やど} は {二|ふた}つ 」 。 …… {一番|いちばん} {古|ふる}い {名前|なまえ} です ね 。 || "One spring, two houses." …The oldest name.

@scene yn.terraces_first
!set yn_terraces_seen
narr: {川|かわ} に {沿|そ}って 、 {田|た} が {段|だん} に なって {下|くだ}って いる 。 {水|みず} を {張|は}った {田|た} に 、 {湯気|ゆげ} が {映|うつ}って いる 。 || Along the river, rice paddies step down in terraces. The steam is reflected in the flooded fields.

@scene yn.terrace_footbath
!if yn_mio_night&!yn_mio_back -> mio
narr: {棚田|たなだ} の {上|うえ} の {小|ちい}さな {足湯|あしゆ} 。 {田|た} を {見下|みお}ろし ながら {足|あし} を {温|あたた}められる 。 || A small footbath above the terraces, where you can warm your feet and look down over the fields.
!heal
!end
:mio
!call yn.mio_dawn

@scene yn.shrine
narr: {湯|ゆ} の {神様|かみさま} の {小|ちい}さな {社|やしろ} 。 {供|そな}え{物|もの} は 、 {卵|たまご} が {一|ひと}つ 。 || A small shrine to the god of the spring. The offering: one egg.
?(yn_kettle_settled) narr: {卵|たまご} が {二|ふた}つ に {増|ふ}えて いる 。 || The offering has grown to two eggs.

@scene yn.kakehi
narr: {竹|たけ} の {筧|かけい} から 、 {湯|ゆ} が {石|いし} の {鉢|はち} へ {落|お}ちて いる 。 ポタン 、 ポタン 。 || Spring water drips from a bamboo spout into a stone basin. Plip, plop.

@scene yn.playhouse_first
!set yn_playhouse_seen
narr: {小|ちい}さな {芝居小屋|しばいごや} 。 {舞台|ぶたい} の {上|うえ} で 、 {旅|たび} の {一座|いちざ} が {稽古|けいこ} を して いる 。 || A little theatre. On the stage, a travelling troupe is rehearsing.
?(comp=suzu) comp[surprise]: …… {嘘|うそ} 。 あの {幟|のぼり} 。 あれ は …… {私|わたし} の {一座|いちざ} よ 。 || …No. That banner. That's… my troupe.
?(comp=suzu) narr: {舞台|ぶたい} の {上|うえ} の {女|おんな} が 、 こちら を {見|み}て 、 {手|て} に {持|も}った {扇|おうぎ} を {落|お}とした 。 || The woman on the stage looks this way and drops the fan in her hand.

@scene yn.koume
!faceplayer
yn_koume: いらっしゃい ！ {今夜|こんや} の {芝居|しばい} 、 {見|み}に {来|き}て ね 。 {笑|わら}わせる わ よ 。 || Hello! Come and see tonight's show. We'll make you laugh.
?(comp=suzu&yn_suzu_crossroads) yn_koume: …… スズ 。 {今夜|こんや} も 、 {客席|きゃくせき} から {見|み}て いて 。 || …Suzu. Watch from the seats tonight, too.

@scene yn.koume_after
!faceplayer
yn_koume: {次|つぎ} の {町|まち} へ {行|い}く {前|まえ} に 、 {一言|ひとこと} 。 …… {帳面|ちょうめん} 、 {見|み}せて くれて ありがとう 。 {今度|こんど} は 、 {二人|ふたり} の {漫才|まんざい} を {見|み}に {行|い}く から 。 || A word before we go on to the next town. …Thank you for showing us the books. Next time, we'll come and see the two of you do your act.

@scene yn.shinza
!faceplayer
yn_shinza: {座長|ざちょう} の シンザ だ 。 {客|きゃく} の {数|かず} は 、 {耳|みみ} で {数|かぞ}える 。 {今夜|こんや} は 、 {満員|まんいん} だ な 。 {笑|わら}い{声|ごえ} で {分|わ}かる 。 || Shinza, head of the troupe. I count the house by ear. It'll be full tonight. I can tell by the laughter.

@scene yn.shinza_after
!faceplayer
yn_shinza: {一座|いちざ} の {帳面|ちょうめん} 、 {今|いま} は {三人|さんにん} で {付|つ}けて いる 。 {一人|ひとり} で {抱|かか}える もん じゃ なかった ん だ な 。 || We keep the troupe's books with three people now. It was never a load for one person to carry.

@scene yn.kikue_first
# Kikue at the dispensary: honest about what the waters can and cannot do. With Mio, the first meeting in years.
!set yn_kikue_met
!faceplayer
yn_kikue: いらっしゃい 。 {薬処|くすりどころ} の キクエ です 。 {湯|ゆ} は {体|からだ} を {温|あたた}める けれど 、 {何|なん} でも {治|なお}す わけ で は ない 。 {棚|たな} の {札|ふだ} に は 、 そう {書|か}いて ある わ 。 || Welcome. I'm Kikue, of the dispensary. The waters warm the body, but they don't cure everything. The labels on my shelves say so.
?(comp=mio) yn_kikue: …… ミオ ちゃん ？ まあ 。 お{母|かあ}さん に 、 そっくり に なって 。 || …Mio? Oh, my. You've grown to look just like your mother.
?(comp=mio) comp[shy]: キクエ さん 。 …… ご{無沙汰|ぶさた} して います 。 {手紙|てがみ} の {返事|へんじ} も 、 {出|だ}さない まま で 。 || Kikue. …It's been so long. And I never even answered your letter.
?(comp=mio) yn_kikue: いい の よ 。 {来|き}て くれた じゃ ない 。 {返事|へんじ} より 、 ずっと いい わ 。 || It doesn't matter. You came. That's far better than a reply.

@scene yn.kikue_idle
!faceplayer
yn_kikue: {湯|ゆ} が {暴|あば}れる と 、 {湯|ゆ} あたり の {人|ひと} が {増|ふ}える の 。 {長湯|ながゆ} は 、 しない で ね 。 || When the water rages, more people get overcome by the heat. Don't stay in the bath too long.

@scene yn.kikue_after
!faceplayer
yn_kikue: {棚|たな} の {札|ふだ} 、 {一|ひと}つ だけ {何|なに} も {書|か}いて ない の を {置|お}いた の 。 {決|き}めて いない こと の {場所|ばしょ} よ 。 {誰|だれ} か に {教|おそ}わった の 。 || I've put one jar on the shelf with nothing written on it. A place for things not yet decided. Someone taught me that.

@scene yn.kikue_shelf
narr: {棚|たな} の {瓶|びん} に 、 {小|ちい}さな {札|ふだ} 。 「{湯|ゆ} の {花|はな} 。 {肌|はだ} が {滑|なめ}らか に なる 。 {病気|びょうき} は {治|なお}らない 。」 || A small label on a jar: "Spring mineral flakes. Smooth the skin. Do not cure illness."
?(comp=mio) comp[smile]: …… {正直|しょうじき} な {札|ふだ} 。 {効|き}く こと と {効|き}かない こと が 、 {両方|りょうほう} {書|か}いて ある 。 || …An honest label. It says what it does and what it doesn't.

@scene yn.kikue_jars
narr: {壺|つぼ} が {並|なら}んで いる 。 {生姜|しょうが} 、 {葛|くず} 、 {甘草|かんぞう} 。 {一番|いちばん} {奥|おく} の {壺|つぼ} に は 、 {札|ふだ} が ない 。 || A row of jars: ginger, kudzu, liquorice root. The jar at the very back has no label.

@scene yn.patient_futon
!if yn_mio_night -> patient
narr: {患者|かんじゃ} の ため の {布団|ふとん} 。 {今|いま} は {空|から} だ 。 || A futon for patients. Empty for now.
!end
:patient
narr: オシゲ が {眠|ねむ}って いる 。 {額|ひたい} に {冷|つめ}たい {手拭|てぬぐ}い 。 || Oshige is asleep, a cool towel on her forehead.

@scene yn.north_first
!set yn_north_seen
narr: {北|きた} へ {登|のぼ}る {道|みち} 。 {一歩|いっぽ} {登|のぼ}る ごと に 、 {谷|たに} の {音|おと} が {遠|とお}く なる 。 || The road climbs north. With every step up, the valley's noise grows fainter.
?(comp=nao) comp[closed]: …… {静|しず}か だ 。 {自分|じぶん} の {足音|あしおと} も {聞|き}こえない 。 || …Quiet. I can't hear my own footsteps.
?(comp=mio) comp[worry]: {耳|みみ} が 、 また {詰|つ}まります 。 …… {大丈夫|だいじょうぶ} 。 {進|すす}みましょう 。 || My ears are blocking up again. …I'm all right. Let's go on.
?(comp=ren) comp: {灯|ひ} の ない {道|みち} です 。 {私|わたし} が {前|まえ} を …… いえ 、 {並|なら}んで {歩|ある}きましょう 。 || A road with no lamps. I'll go in front… no. Let's walk side by side.
?(comp=suzu) comp: {客席|きゃくせき} が {空|から} に なって いく みたい 。 …… でも 、 {舞台|ぶたい} は まだ {終|お}わって ない わ 。 || Like the seats emptying one by one. …But the play isn't over yet.

@scene yn.north_stone
narr: {古|ふる}い {道標|みちしるべ} 。 「{右|みぎ} 、 {灯|ひ} の {道|みち} より {来|く}る {道|みち} と {合|あ}う 。 {上|うえ} 、 {書庫|しょこ} への {坂道|さかみち} 。」 || An old waystone: "Right, meets the road up from the Lantern Road. Above, the slope to the Archive."

@scene yn.north_lantern
narr: {消|き}えた {提灯|ちょうちん} 。 {灯|ひ} を {入|い}れて も 、 すぐ に {消|き}えて しまう 。 {音|おと} も なく 。 || A dead lantern. Light it and it goes straight out again. Without a sound.
?(comp=ren) comp[sad]: …… ここ から {先|さき} は 、 {名前|なまえ} を {呼|よ}んで も 、 {声|こえ} が {届|とど}かない の かも しれません 。 || …From here on, perhaps, even when you call a name, your voice won't reach.
`);
