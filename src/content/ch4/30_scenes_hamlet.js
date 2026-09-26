/* Chapter 4 scenes: arrival, the road, the hamlet's props and its residents'
 * everyday conversations (routines by story phase, post-story lines). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene sb.arrive
!set sb_arrived
!chapter 4
!card {第四章|だいよんしょう} ・ {雪鈴|ゆきすず} || Chapter Four — Snowbell
narr: {坂|さか} を {上|のぼ}る ほど 、 {空気|くうき} が {薄|うす}く なって いく 。 {雪|ゆき} が {音|おと} を {吸|す}いこんで 、 {自分|じぶん} たち の {足音|あしおと} だけ が {聞|き}こえる 。 || The higher the road climbs, the thinner the air. The snow swallows every sound but your own footsteps.
?(comp=nao) comp[smirk]: {灰実|はいみ} の {里|さと} から {半日|はんにち} で これ か 。 {荷物|にもつ} より {先|さき} に {耳|みみ} が {凍|こお}る 。 || Half a day from Cinder Orchard and it's this. My ears'll freeze before the parcels do.
?(comp=nao) comp: {雪鈴|ゆきすず} は 、 {冬|ふゆ} の あいだ {郵便|ゆうびん} が {止|と}まる {村|むら} だ 。 {手紙|てがみ} は みんな 、 {雪|ゆき} が とける まで {待|ま}つ 。 || Snowbell's a place where the post stops for winter. Every letter waits for the thaw.
?(comp=nao) comp: …… {待|ま}たせる {側|がわ} の {配達人|はいたつにん} と して は 、 {耳|みみ} が {痛|いた}い {話|はなし} だけど な 。 || …Not a pleasant thing to hear, for a courier who's kept people waiting before.
?(comp=mio) comp[worry]: {指|ゆび} 、 {冷|つめ}たく なって ない ？ {手袋|てぶくろ} の {予備|よび} 、 ありますよ 。 ええと 、 {二組|ふたくみ} …… いえ 、 {三組|さんくみ} 。 || Are your fingers getting cold? I've got spare gloves. Let's see, two pairs… no, three.
?(comp=mio) comp[smile]: {山|やま} の {上|うえ} に 、 {天文台|てんもんだい} が ある そう です 。 {夜|よる} に なる と 、 {下|した} の {町|まち} から も {灯|あか}り が {見|み}える んです って 。 || They say there's an observatory up on the mountain. At night its lamp can be seen even from the towns below.
?(comp=ren) comp[think]: {雪鈴|ゆきすず} 。 {灯|ひ} の {道|みち} の {里|さと} の {中|なか} で 、 いちばん {高|たか}い ところ に ある {村|むら} です 。 || Snowbell. Of all the villages on the lantern roads, it sits the highest.
?(comp=ren) comp[smile]: {記録|きろく} に よれば 、 この {坂|さか} は {一本道|いっぽんみち} です 。 …… わたし でも {迷|まよ}いません 。 たぶん 。 || According to the records, this slope is a single road. …Even I can't get lost. Probably.
?(comp=suzu) comp[laugh]: さあ さあ 、 {雪|ゆき} の {舞台|ぶたい} の {幕開|まくあ}け だよ ！ …… さむっ 。 {客席|きゃくせき} に {火鉢|ひばち} を ください 。 || Roll up, roll up — the curtain rises on the snow stage! …Brr. Braziers for the audience, please.
?(comp=suzu) comp: {昔|むかし} 、 {一座|いちざ} で {一度|いちど} だけ {来|き}た こと が ある んだ 。 {鐘|かね} の {音|おと} が 、 やけに きれい な {村|むら} だった 。 || I came here once with the troupe, years ago. A village where the bell sounded ridiculously clear.
!autosave
`, 'ch4/arrive');

RB.script.add(`
@scene sb.road_sign
narr: {道標|みちしるべ} に {三|みっ}つ の {腕|うで} が ある 。 「 ↑ {雪鈴|ゆきすず} 」 「 → {灯落|ひおち} 」 「 ← {灰実|はいみ} の {里|さと} 」 。 {灯落|ひおち} の {腕|うで} に は 、 {雪|ゆき} が {厚|あつ}く {積|つ}もって いる 。 || The signpost has three arms: "↑ Snowbell", "→ Lanternfall", "← Cinder Orchard". Snow lies thick on the Lanternfall arm.
?(!ch4_done&comp=ren) comp: {灯落|ひおち} へ の {道|みち} は 、 {冬|ふゆ} の あいだ {閉|と}ざされる と {記録|きろく} に あります 。 {今|いま} は {雪鈴|ゆきすず} へ 。 || The records say the way to Lanternfall is closed through the winter. Snowbell for now.

@scene sb.road_marker
narr: {古|ふる}い {石|いし} に 、 {字|じ} が {刻|きざ}んで ある 。 「 {雪|ゆき} の {日|ひ} は {鐘|かね} を {聞|き}け 」 。 || Words are carved into an old stone: "On snowy days, listen for the bell."
?(comp=nao) comp: {道|みち} に {迷|まよ}ったら 、 {鐘|かね} の {音|おと} の ほう へ {歩|ある}け 、 って こと だろ 。 {実用的|じつようてき} で いい 。 || Meaning: if you get lost, walk toward the sound of the bell. Practical. I like it.
?(comp=suzu) comp: {舞台|ぶたい} でも {同|おな}じ だよ 。 {迷|まよ}ったら 、 {音|おと} の する ほう へ 。 || Same on stage. When you're lost, go toward the sound.

@scene sb.road_shrine
narr: {雪|ゆき} を かぶった {小|ちい}さな {祠|ほこら} 。 {誰|だれ} か が 、 {干|ほ}し{柿|がき} を {一|ひと}つ {供|そな}えて いった 。 まだ {新|あたら}しい 。 || A small snow-capped wayside shrine. Someone has left a single dried persimmon as an offering. It's still fresh.
?(comp=mio) comp[smile]: {誰|だれ} か が {最近|さいきん} 、 ここ を {通|とお}った んです ね 。 {冬|ふゆ} の {坂|さか} を 。 || Someone came by here recently, then. Up the winter slope.

@scene sb.road_east_locked
narr: {灯落|ひおち} へ {下|くだ}る {道|みち} は 、 {背|せ} より {高|たか}い {吹|ふ}き{溜|だ}まり に {埋|う}もれて いる 。 {今|いま} は {通|とお}れない 。 || The road down to Lanternfall is buried under a drift taller than you. There's no getting through for now.
?(comp=nao) comp: {春|はる} まで {待|ま}つ か 、 {誰|だれ} か が {掘|ほ}る か だ な 。 {雪鈴|ゆきすず} の {連中|れんちゅう} に {聞|き}いて みよう 。 || Either we wait for spring or somebody digs. Let's ask the Snowbell folk.
?(comp=mio) comp: {今|いま} {無理|むり} を して も 、 {凍|こご}える だけ です 。 {先|さき} に {雪鈴|ゆきすず} へ {行|い}きましょう 。 || Forcing it now would only get us frozen. Let's go to Snowbell first.
?(comp=ren) comp: {道|みち} が ある こと は {確|たし}か です 。 …… {見|み}えない だけ で 。 || The road is definitely there. …We just can't see it.
?(comp=suzu) comp: {幕|まく} が {下|お}りてる ね 。 {次|つぎ} の {幕|まく} は 、 {上|うえ} の {村|むら} から だ 。 || The curtain's down on that one. The next act starts in the village up the hill.

@scene sb.hayate_road
hayate: {吹|ふ}き{溜|だ}まり は {崩|くず}して おいた 。 {灯落|ひおち} まで 、 {道|みち} は {通|つう}じて いる 。 || I broke up the drift. The road's open all the way to Lanternfall.
hayate: {下|くだ}り は {滑|すべ}る 。 {足|あし} を {横|よこ} に して {歩|ある}け 。 …… それ だけ だ 。 || The way down is slippery. Walk with your feet sideways. …That's all.
`, 'ch4/road');

RB.script.add(`
@scene sb.hamlet_first
!set sb_hamlet_seen
narr: {雪|ゆき} に {半分|はんぶん} {埋|う}もれた {家|いえ} が 、 {十|とお} ほど {寄|よ}り{添|そ}って いる 。 {広場|ひろば} の {真|ま}ん{中|なか} に 、 {鐘|かね} を {吊|つ}るした {柱|はしら} が {立|た}って いる 。 || A dozen or so houses huddle together, half buried in snow. In the middle of the square stands a post with a bell hung from it.
narr: {北|きた} の {山|やま} の {上|うえ} に 、 {丸|まる}い {屋根|やね} の {建物|たてもの} が {見|み}える 。 その {窓|まど} は {暗|くら}い 。 || On the mountain to the north you can make out a building with a round roof. Its window is dark.
kanta[surprise]: あ ！ {旅|たび} の {人|ひと} だ ！ {冬|ふゆ} に {来|く}る {人|ひと} なんて 、 はじめて {見|み}た ！ || Oh! Travellers! I've never seen anyone come in winter!
kanta: あれ ？ あれ は {天文台|てんもんだい} の {灯|あか}り 。 {毎晩|まいばん} ついてた のに 、 {十日|とおか} ぐらい {前|まえ} から ずっと {消|き}えてる んだ 。 || That? That's the observatory lamp. It was lit every single night, but it's been out for about ten days now.
kanta[worry]: ホシノ じいちゃん 、 {元気|げんき} ない んだ よ 。 {母|かあ}ちゃん が 、 {宿|やど} の ヤエ さん に {聞|き}け って 。 {大人|おとな} の {話|はなし} だ から って 。 || Grandpa Hoshino's been really down. Mum says to ask Yae at the inn. 'Cause it's grown-up business.
?(comp=nao) comp: {消|き}えた {灯|あか}り 、 か 。 {嫌|いや} な {予感|よかん} が する な 。 || A lamp that went out. I've got a bad feeling.
?(comp=mio) comp[worry]: {十日|とおか} も …… 。 {宿|やど} に {行|い}って みましょう 。 {体|からだ} も {温|あたた}めないと 。 || Ten days… Let's go to the inn. We need to warm up, too.
?(comp=ren) comp[think]: {灯|あか}り が {消|き}える の は 、 {油|あぶら} が {切|き}れた とき か 、 {名前|なまえ} が {消|き}えた とき です 。 || A lamp goes out when the oil runs dry — or when its name is lifted.
?(comp=suzu) comp: {主役|しゅやく} の いない {舞台|ぶたい} みたい だ ね 。 よし 、 {宿|やど} で {筋書|すじが}き を {聞|き}こう 。 || Like a stage with no lead. Right — let's get the plot at the inn.
!quest sb_lamp start
!note sb_snowbell

@scene sb.hamlet_board
narr: {村|むら} の {掲示板|けいじばん} 。 「 {郵便|ゆうびん} は {春|はる} まで {出|で}ません 。 {手紙|てがみ} は {郵便|ゆうびん}{小屋|ごや} で {預|あず}かります 。 ── ソウスケ 」 || The hamlet noticeboard: "No post will go out until spring. Letters can be left at the post shelter. — Sousuke"
narr: その {下|した} に 、 {子|こ}ども の {字|じ} で 。 「 ゆきだるま コンテスト ！ しんさいん ぼしゅう ちゅう 」 || Below it, in a child's hand: "Snowman contest! Judge wanted!"
?(quest.sb_goats) narr: {端|はし} に 、 {太|ふと}い {字|じ} で 。 「 ヤギ が {二頭|にとう} {多|おお}い 。 {心当|こころあ}たり の ある {者|もの} は テツジ まで 」 || In the corner, in heavy strokes: "Two goats too many. Anyone who knows why, see Tetsuji."

@scene sb.well
narr: {井戸|いど} は {凍|こお}って いる 。 {氷|こおり} の {上|うえ} に 、 {小|ちい}さな {足跡|あしあと} が {並|なら}んで いた 。 {子|こ}ども が {滑|すべ}って {遊|あそ}んだ らしい 。 || The well is frozen. A line of small footprints crosses the ice: children have been sliding on it.

@scene sb.laundry
narr: {干|ほ}した {洗濯物|せんたくもの} が 、 {板|いた} の よう に {凍|こお}って いる 。 {子|こ}ども の {着物|きもの} が 、 {立|た}った まま {揺|ゆ}れて いた 。 || The washing on the line has frozen stiff as boards. A child's kimono sways, standing up by itself.

@scene sb.post_box
narr: {郵便|ゆうびん} {箱|ばこ} 。 {口|くち} に {雪|ゆき} が {詰|つ}まって いる 。 {札|ふだ} に は 「 {次|つぎ} の {集荷|しゅうか} ： {雪解|ゆきど}け の あと 」 。 || A postbox with snow packed into its slot. The label reads: "Next collection: after the thaw."

@scene sb.hoshino_scope
narr: {古|ふる}い {望遠鏡|ぼうえんきょう} が 、 {坂|さか} の {下|した} に {向|む}けて {固定|こてい} されて いる 。 {星|ほし} で は なく 、 {灯落|ひおち} へ {続|つづ}く {道|みち} を {見|み}る {角度|かくど} だ 。 || An old telescope has been fixed pointing down the slope — not at the stars, but at the angle of the road that runs toward Lanternfall.

@scene sb.icehole
narr: {川|かわ} の {氷|こおり} に {開|あ}けた {丸|まる}い {穴|あな} 。 {黒|くろ}い {水|みず} が 、 ゆっくり {動|うご}いて いる 。 || A round hole cut in the ice of the stream. Black water moves slowly beneath.
?(comp=mio) comp: ここ に {落|お}ちたら 、 {薬|くすり} より {先|さき} に {毛布|もうふ} が {要|い}ります ね 。 {気|き}を つけて 。 || Fall in here and you'd need a blanket before any medicine. Careful.

@scene sb.stair_marker
narr: {石段|いしだん} の {脇|わき} の {石|いし} 。 「 ここ より {上|うえ} 、 {天文台|てんもんだい} 。 {星|ほし} を {見|み}る {者|もの} は 、 {足元|あしもと} も {見|み}よ 。 」 || A stone beside the stair: "Observatory above. You who look at the stars — look at your feet too."
?(comp=ren) comp[smile]: いい {言葉|ことば} です 。 わたし の {師匠|ししょう} も 、 {似|に}た こと を {言|い}って いました 。 …… わたし が {言|い}われた {理由|りゆう} は 、 ご{想像|そうぞう} に お{任|まか}せ します 。 || Good words. My teacher used to say something similar. …Why it needed saying to me, I leave to your imagination.

@scene sb.stair_ice
!if sb_stair_open -> end
!if sb_obs_open -> melt
narr: {天文台|てんもんだい} へ の {石段|いしだん} が 、 {青白|あおじろ}い {氷|こおり} に すっぽり {包|つつ}まれて いる 。 {叩|たた}いて も びくとも しない 。 || The stone stair to the observatory is completely encased in blue-white ice. Knocking on it does nothing.
?(!word.honoo) narr: この {氷|こおり} を とかす {方法|ほうほう} が 、 {今|いま} は {思|おも}いつかない 。 || You can't think of any way to melt this, for now.
?(word.honoo&!sb_morning) narr: {外|そと} は もう {吹雪|ふぶき} だ 。 {今|いま} は {上|のぼ}れない 。 || The storm is already here. No climbing now.
?(sb_morning&!sb_obs_open) comp: {扉|とびら} の {鍵|かぎ} は ホシノ さん が {持|も}って いる はず です 。 {先|さき} に {話|はなし} を {聞|き}きましょう 。 || Hoshino should have the key to the door. Let's talk to him first.
!end
:melt
narr: {氷|こおり} に {手|て} を かざす 。 {昨夜|ゆうべ} {囲炉裏|いろり} で {書|か}いた {字|じ} を 、 もう {一度|いちど} 。 || You hold your hand up to the ice. The word you wrote at the hearth last night — once more.
!challenge sb.c_melt
!if var._res=0 -> end
!sfx fire_out
!shake
narr: {氷|こおり} が {音|おと} を {立|た}てて {割|わ}れ 、 {湯気|ゆげ} に なって {消|き}えた 。 {石段|いしだん} が {現|あらわ}れる 。 || The ice cracks with a report and vanishes into steam. The stone stair appears.
!set sb_stair_open
?(comp=nao) comp[smirk]: {便利|べんり} だ な 、 その {字|じ} 。 {冬|ふゆ} の {配達|はいたつ} に {一|ひと}つ {欲|ほ}しい 。 || Handy word, that. I'd like one for winter deliveries.
?(comp=mio) comp[smile]: {足元|あしもと} 、 {気|き}を つけて 。 とけた {水|みず} が また {凍|こお}ります から 。 || Watch your step. The meltwater will freeze again.
?(comp=ren) comp: {星|ほし} の {石段|いしだん} 。 {上|のぼ}り{切|き}った ところ が 、 {天文台|てんもんだい} です 。 …… {一本道|いっぽんみち} で よかった 。 || The Star Stair. The observatory is at the very top. …Thank goodness it's one road.
?(comp=suzu) comp[laugh]: {拍手|はくしゅ} ！ {氷|こおり} の {幕|まく} が {上|あ}がった よ 。 || Applause! The ice curtain rises.
!quest sb_lamp 6
`, 'ch4/hamlet');

// ---- residents -----------------------------------------------------------------------------
RB.script.add(`
@scene sb.yae
!if sb_lamp_lit -> after
!if sb_storm -> morning
!if quest.sb_lamp>=1 -> later
yae[surprise]: まあ ！ この {季節|きせつ} に お{客|きゃく} さん だ なんて 。 さあ さあ 、 {入|はい}って 。 {雪|ゆき} は {払|はら}って から ね 。 || My! Guests, at this time of year. Come in, come in. Brush the snow off first, mind.
yae[smile]: {雪見屋|ゆきみや} の ヤエ です 。 {部屋|へや} なら {空|あ}いてる よ 。 {冬|ふゆ} は いつ も {空|あ}いてる けど ね 。 || I'm Yae; this is Yukimiya. There are rooms free. There always are, in winter.
pc: {天文台|てんもんだい} の {灯|あか}り の こと を {聞|き}きたい んです が 。 || We wanted to ask about the observatory lamp.
yae[worry]: ああ …… あれ ね 。 || Ah… that.
yae: ホシノ さん って いう {天文|てんもん}{学者|がくしゃ} が いて ね 。 {娘|むすめ} さん が {灯落|ひおち} へ {働|はたら}き に {出|で}た とき 、 {約束|やくそく} した んだって 。 「 おまえ が {帰|かえ}る まで 、 {毎晩|まいばん} {灯|あか}り を ともして おく 」 って 。 || There's an astronomer called Hoshino. When his daughter went down to work in Lanternfall, he made her a promise: "I'll keep the lamp lit every night until you come home."
yae[think]: {二十年|にじゅうねん} …… いや 、 {十年|じゅうねん} ？ あれ 、 {何年|なんねん} だった っけ 。 {毎年|まいとし} {数|かぞ}えてた のに 。 || Twenty years… no, ten? Oh — how many years was it? I used to count them every year.
yae: とにかく 、 {一晩|ひとばん} も {欠|か}かさなかった の 。 それ が 、 {急|きゅう} に ね 。 || Anyway, he never missed a single night. And then, all of a sudden.
?(comp=nao) comp: {数|かず} まで {抜|ぬ}けてる 。 {静寂|しじま} の {仕業|しわざ} だ な 。 || Even the number's gone. That's the Hush's work.
?(comp=mio) comp[think]: {毎年|まいとし} {数|かぞ}えて いた {数|かず} が 、 {出|で}て こない …… 。 || A number she counted every year, and it won't come…
?(comp=ren) comp[think]: {数|かず} が {抜|ぬ}け{落|お}ちて います 。 {静寂|しじま} の {手|て} の {跡|あと} です 。 || The number has dropped out. That's the Hush's fingerprint.
?(comp=suzu) comp: {台本|だいほん} の {数字|すうじ} だけ 、 {誰|だれ} か が {消|け}した みたい 。 || As if someone rubbed out just the numbers in the script.
yae: ホシノ さん の {家|いえ} は 、 {北|きた} の {坂|さか} の {下|した} 。 {天文台|てんもんだい} へ {上|のぼ}る {石段|いしだん} の {手前|てまえ} だよ 。 {会|あ}って あげて 。 {近頃|ちかごろ} 、 {誰|だれ} とも {話|はな}さない の 。 || His house is at the foot of the north slope, just before the stone stair up to the observatory. Go and see him. He hardly talks to anyone lately.
!quest sb_lamp 1
!end
:later
yae[smile]: {寒|さむ}かった でしょう 。 ちょっと {休|やす}んで いく ？ || Cold out there, wasn't it? Rest a little?
!choice
* {休|やす}みます || We'll rest a while. -> rest
* {甘酒|あまざけ} を ください || Some amazake, please. -> sake
* {大丈夫|だいじょうぶ} です || We're fine. -> bye
:rest
!inn
yae: よく {休|やす}めた ？ {顔色|かおいろ} が よく なった ね 。 || Rested well? You've got your colour back.
!end
:sake
!if item.sb_amazake -> have
!give sb_amazake
yae: はい 、 {熱|あつ}い の を {瓶|びん} に {詰|つ}めた よ 。 {歩|ある}きながら {飲|の}んで も いい し 、 {懐|ふところ} に {入|い}れて おけば {懐炉|かいろ} の {代|か}わり に も なる 。 || Here — I've filled a flask with a hot one. Drink it as you walk, or tuck it inside your coat and it'll keep you warm.
!end
:have
yae[laugh]: まだ {一本|いっぽん} {残|のこ}ってる でしょう 。 {欲張|よくば}り さん 。 || You've still got one left, haven't you? Greedy.
!end
:bye
yae: {気|き}を つけて ね 。 {北|きた} の {風|かぜ} は {意地悪|いじわる} だ から 。 || Take care. The north wind is a spiteful thing.
!end
:morning
yae: {昨夜|ゆうべ} は ありがとう 。 {囲炉裏|いろり} の {火|ひ} 、 {朝|あさ} まで {一度|いちど} も {弱|よわ}く ならなかった よ 。 || Thank you for last night. The hearth didn't dim once till morning.
yae: {天文台|てんもんだい} へ {行|い}く んでしょう 。 {帰|かえ}ったら 、 {熱|あつ}い の を {用意|ようい} して おく から ね 。 || You're going up to the observatory, aren't you? I'll have something hot ready when you're back.
!goto later
:after
yae[smile]: {窓|まど} を {開|あ}ける と 、 {灯|あか}り が {見|み}える の 。 {朝|あさ} まで ずっと 。 {毎朝|まいあさ} {確|たし}かめちゃう 。 || When I open the window I can see the lamp. All night till morning. I check every morning now.
!goto later

@scene sb.yae_post
?(sb_hoshino_goes) yae: ホシノ さん が {下|くだ}って から 、 {灯|あか}り は カンタ が ともしてる の 。 {一晩|ひとばん} も {欠|か}かさず に ね 。 {誰|だれ} に {似|に}た んだか 。 || Since Hoshino went down the mountain, Kanta's been lighting the lamp. Hasn't missed a night. Wonder who he takes after.
?(!sb_hoshino_goes) yae: ホシノ さん 、 {毎晩|まいばん} {灯|あか}り を ともして から 、 うち で {一杯|いっぱい} {飲|の}んで いく の 。 {前|まえ} より よく {笑|わら}う よ 。 || Every night Hoshino lights the lamp, then stops here for a cup. He laughs more than he used to.
?(end_archive_library) yae: {山|やま} の {上|うえ} の {書庫|しょこ} 、 {図書館|としょかん} に なった んだって ね 。 {冬|ふゆ} でも {本|ほん} を {借|か}り に {行|い}ける かしら 。 || I hear the archive up the mountain's become a library. Wonder if I could borrow books there, even in winter.
?(end_archive_closed) yae: {山|やま} の {上|うえ} の {書庫|しょこ} は {閉|と}じた んだって 。 {静|しず}か な の は 、 {雪|ゆき} だけ で {十分|じゅうぶん} だよ 。 || They say the archive up the mountain is shut now. Snow's quiet enough for me.
yae[smile]: {部屋|へや} は {空|あ}いてる よ 。 あんた たち の {部屋|へや} は 、 いつ でも ね 。 || There's a room free. Your room, always.
!choice
* {休|やす}みます || We'll rest. -> rest
* {注文|ちゅうもん} を {手伝|てつだ}います || We'll help with orders. -> help
* また {来|き}ます || We'll come again. -> end
:rest
!inn
!end
:help
!activity sb.a_hearth_orders
yae[laugh]: {助|たす}かる ！ {給金|きゅうきん} は {甘酒|あまざけ} で いい ？ || A lifesaver! Can I pay you in amazake?
!end

@scene sb.inn_menu
narr: {品書|しなが}き 。 「 {甘酒|あまざけ} 、 しょうが{湯|ゆ} 、 ヤギ の ミルク 、 お{茶|ちゃ} 、 {焼|や}き{餅|もち} 」 。 {下|した} に {小|ちい}さく 「 ツケ は {春|はる} まで 」 。 || The menu: "Amazake, ginger tea, goat's milk, tea, grilled rice cakes." Underneath, in small letters: "Tabs settled in spring."
?(comp=suzu) comp[smirk]: 「 ツケ は {春|はる} まで 」 。 …… {正直|しょうじき} な {店|みせ} だ 。 {気|き}に {入|い}った 。 あたし は {今|いま} {払|はら}う けど 。 || "Tabs settled in spring." …An honest shop. I like it. I'll pay now, though.

@scene sb.inn_counter
narr: {帳場|ちょうば} の {台|だい} 。 {甘酒|あまざけ} の {鍋|なべ} から 、 {甘|あま}い {湯気|ゆげ} が {立|た}って いる 。 || The inn's counter. Sweet steam rises from the amazake pot.

@scene sb.inn_table
narr: {誰|だれ} か が {将棋|しょうぎ} の {途中|とちゅう} で {席|せき} を {立|た}った らしい 。 {駒|こま} が {一|ひと}つ 、 {盤|ばん} の {外|そと} に {転|ころ}がって いる 。 || Someone seems to have left in the middle of a game of shogi. One piece has rolled off the board.

@scene sb.inn_stairs
yae: {上|うえ} は {客|きゃく} {間|ま} だよ 。 {泊|と}まる なら {声|こえ} を かけて ね 。 {今|いま} は {風|かぜ} を {通|とお}してる ところ 。 || Upstairs are the guest rooms. Give me a shout if you're staying. I'm airing them just now.

@scene sb.inn_door_storm
narr: {戸|と} を {少|すこ}し {開|あ}けた だけ で 、 {雪|ゆき} が {横|よこ} から {吹|ふ}き{込|こ}んで きた 。 {外|そと} は {何|なに} も {見|み}えない 。 || You open the door just a crack and snow blasts in sideways. Outside, you can see nothing at all.
yae: だめ だめ ！ {吹雪|ふぶき} の {夜|よる} に {外|そと} に {出|で}る の は 、 {雪鈴|ゆきすず} で いちばん の {禁止|きんし} {事項|じこう} だよ ！ || No, no! Going outside on a storm night is the number one rule in Snowbell!

@scene sb.irori
!if sb_storm&!sb_hearth_done&sb_orders_done -> retry
!if sb_storm&!sb_hearth_done -> low
narr: {囲炉裏|いろり} の {火|ひ} が 、 ぱちぱち と {鳴|な}って いる 。 {鉄瓶|てつびん} から 、 {細|ほそ}い {湯気|ゆげ} 。 || The hearth fire crackles. A thin thread of steam rises from the iron kettle.
?(sb_hearth_done) narr: {灰|はい} の {上|うえ} に 、 {昨夜|ゆうべ} {書|か}いた {字|じ} の {形|かたち} が 、 まだ うっすら {残|のこ}って いる 。 || On the ash, the shape of the word you wrote last night still lingers faintly.
!end
:low
narr: {火|ひ} が {小|ちい}さい 。 {薪|まき} は ある のに 、 {炎|ほのお} が {上|あ}がらない 。 || The fire is small. There's wood enough, but no flames rise.
!end
:retry
!call sb.hearth_fails
`, 'ch4/residents-inn');

RB.script.add(`
@scene sb.natsume
!if sb_lamp_lit -> after
!if quest.sb_goats=done -> thanks
!if quest.sb_goats>=1 -> hint
natsume[tired]: ふぁ …… 。 あ 、 ごめん なさい 。 {夜|よる} の ヤギ {番|ばん} で 、 {昼|ひる} は {眠|ねむ}い の 。 || Hwaah… Oh, sorry. I do the night watch with the goats, so I'm sleepy in the daytime.
natsume[smile]: テツジ {伯父|おじ} さん の {姪|めい} の ナツメ です 。 {伯父|おじ} さん 、 {怒|おこ}って なかった ？ {朝|あさ} 、 {何|なに} か {叫|さけ}んでた けど …… {眠|ねむ}くて 。 || I'm Natsume, Uncle Tetsuji's niece. Was Uncle angry? He was shouting something this morning, but… I was too sleepy.
!end
:hint
natsume[tired]: ヤギ が {多|おお}い ？ …… ちゃんと {書|か}いて おいた よ 。 {小屋|こや} の {柱|はしら} に 。 ぜんぶ 。 …… ぐう 。 || Too many goats? …I wrote it down. On the post in the shed. All of it. …Zzz.
!end
:thanks
natsume[laugh]: {伯父|おじ} さん 、 {子|こ}ヤギ を {抱|だ}いて {泣|な}いてた って 。 {本人|ほんにん} は 「 {泣|な}いて ない 、 {雪|ゆき} だ 」 って {言|い}う けど 。 || They say Uncle cried holding the kids. He says, "I wasn't crying, it was snow."
natsume: {名前|なまえ} 、 まだ {決|き}めて ない の 。 {何|なに} が いい かな 。 …… {考|かんが}えてたら 、 {眠|ねむ}く なって きた 。 || We haven't named them yet. What would be good? …Thinking about it is making me sleepy.
!end
:after
natsume[smile]: {夜|よる} の ヤギ {番|ばん} 、 {楽|たの}しく なった よ 。 {灯|あか}り が ある と 、 {星|ほし} を {数|かぞ}えながら {起|お}きて いられる の 。 || The night goat watch is fun now. With the lamp there, I can stay awake counting stars.

@scene sb.natsume_post
natsume[smile]: {子|こ}ヤギ の {名前|なまえ} 、 {決|き}まった よ 。 「 ホシ 」 と 「 アカリ 」 。 …… ホシノ さん に は まだ {内緒|ないしょ} ね 。 || We named the kids: "Hoshi" and "Akari". …Don't tell Hoshino yet.
?(end_mem_return) natsume: {町|まち} の {人|ひと} たち 、 {忘|わす}れて いた こと を {思|おも}い{出|だ}した んだって 。 {泣|な}いたり {笑|わら}ったり 、 {大変|たいへん} らしい よ 。 || They say the town folk got back what they'd forgotten. Lots of crying and laughing, apparently.
?(end_mem_choose) natsume: {忘|わす}れた こと を {取|と}り に {行|い}く か どう か 、 {自分|じぶん} で {決|き}められる んだって 。 わたし なら …… {寝|ね}て から {決|き}める 。 || They say you get to decide whether to go and fetch what you forgot. Me… I'd sleep on it.

@scene sb.storm_natsume
natsume[laugh]: {吹雪|ふぶき} の {夜|よる} は 、 ヤギ {番|ばん} が お{休|やす}み なの 。 ヤギ も わたし も 、 {朝|あさ} まで {寝|ね}る 。 {最高|さいこう} 。 || On storm nights the goat watch is cancelled. The goats and I sleep till morning. Best thing ever.
`, 'ch4/residents-natsume');

RB.script.add(`
@scene sb.tetsuji
!if sb_lamp_lit -> after
!if quest.sb_goats=done -> done
!if quest.sb_goats>=2 -> report
!if quest.sb_goats -> waiting
:intro
tetsuji[angry]: …… {十二|じゅうに} 。 {何度|なんど} {数|かぞ}えて も {十二|じゅうに} だ 。 || …Twelve. However many times I count, it's twelve.
tetsuji: おれ の ヤギ は {十頭|じゅっとう} だ 。 {朝|あさ} {小屋|こや} を {開|あ}けたら 、 {十二|じゅうに} いた 。 {二頭|にとう} 、 {誰|だれ} か の が {迷|まよ}いこんで いる 。 || I own ten goats. This morning I opened the shed and there were twelve. Two of them belong to someone else and wandered in.
tetsuji[angry]: {吹雪|ふぶき} の {前|まえ} に 、 {持|も}ち{主|ぬし} に {返|かえ}さない と いかん 。 だが 、 {誰|だれ} も {名乗|なの}り{出|で}ん@名乗り出る 。 {旅|たび} の {人|ひと} 、 {暇|ひま} なら {聞|き}いて まわって くれ 。 || They need returning to their owner before the storm. But no one's come forward. If you've time, travellers, ask around.
?(comp=nao) comp[smirk]: ヤギ の {迷子|まいご} {届|とど}け か 。 {配達|はいたつ} より {難|むずか}しそう だ な 。 || A lost-goat notice. Sounds harder than deliveries.
?(comp=suzu) comp[laugh]: {増|ふ}えた ほう で {困|こま}る って 、 {珍|めずら}しい {悩|なや}み だ ね 。 {帳簿|ちょうぼ} が {合|あ}わない の は 、 あたし も {嫌|きら}い だけど 。 || Troubled because you've got more — that's a rare kind of worry. Mind you, I hate books that don't balance too.
!quest sb_goats start
!end
:waiting
tetsuji: {誰|だれ} か {心当|こころあ}たり は あった か 。 …… ない か 。 {小屋|こや} も {見|み}て みて くれ 。 おれ は {字|じ} を {読|よ}む の が {遅|おそ}い 。 || Anyone know anything? …No. Take a look in the shed too. I'm slow at reading.
!end
:report
tetsuji[think]: {書|か}き{置|お}き ？ ナツメ の か 。 {何|なん} と {書|か}いて あった 。 || A note? Natsume's? What did it say?
pc: {夜中|よなか} に モモ が {子|こ}ヤギ を {二匹|にひき} {産|う}んだ そう です 。 || It says Momo had two kids in the night.
tetsuji[surprise]: …… {生|う}まれた 。 モモ に 、 {子|こ}ども が 。 {二匹|にひき} 。 || …Born. Momo had kids. Two of them.
tetsuji: {誰|だれ} か の ヤギ じゃ なくて 、 おれ の ヤギ だった の か 。 {十頭|じゅっとう} と …… {二匹|にひき} 。 || So they weren't anybody else's goats — they're mine. Ten goats and… two little ones.
narr: テツジ は {帽子|ぼうし} を {深|ふか}く かぶり {直|なお}した 。 {目|め} の {辺|あた}り が 、 {少|すこ}し {赤|あか}い 。 || Tetsuji pulls his hat down low. His eyes look a little red.
tetsuji: …… {雪|ゆき} が {目|め} に {入|はい}った 。 || …Got snow in my eye.
?(comp=mio) comp[smile]: {雪|ゆき} なら 、 すぐ とけます よ 。 おめでとう ございます 。 || Snow melts quickly. Congratulations.
?(comp=ren) comp[smile]: {記録|きろく} を {訂正|ていせい} しましょう 。 {十頭|じゅっとう} に 、 {二頭|にとう} {追加|ついか} 。 {誤差|ごさ} で は なく 、 {慶事|けいじ} です 。 || Let's correct the record. Ten head, plus two. Not an error — a happy event.
tetsuji: {持|も}って いけ 。 {予備|よび} の {鈴|すず} だ 。 {鳴|な}る と 「 {慌|あわ}てる な 」 と {聞|き}こえる 。 おれ に は な 。 || Take it. My spare bell. When it rings it sounds like "don't panic". To me, anyway.
!give sb_goat_bell
!give sb_cheese
!note sb_counters
!quest sb_goats done
!end
:done
tetsuji: {十二|じゅうに} 。 …… {何度|なんど} {数|かぞ}えて も {十二|じゅうに} だ 。 {悪|わる}く ない 。 || Twelve. …However many times I count, twelve. Not bad.
!end
:after
tetsuji: {天文台|てんもんだい} の {灯|あか}り が ある と 、 {夜|よる} の {小屋|こや} が {明|あか}るい 。 {子|こ}ヤギ が {外|そと} を {見|み}たがる@見る 。 || With the observatory lamp lit, the shed's bright at night. The kids want to look outside.
!if quest.sb_goats=done -> end
!if quest.sb_goats>=2 -> report
!if quest.sb_goats -> waiting
!goto intro

@scene sb.tetsuji_post
tetsuji: {子|こ}ヤギ は {大|おお}きく なった 。 {十二頭|じゅうにとう} 。 もう {匹|ひき} じゃ ない 。 {頭|とう} だ 。 || The kids have grown. Twelve head. Not little ones any more — proper goats.
?(end_kasane_trial) tetsuji: {山|やま} の {上|うえ} の {番人|ばんにん} が 、 {町|まち} で {裁|さば}き を {受|う}けた って な 。 …… {逃|に}げなかった の は 、 {認|みと}めて やる 。 || They say the keeper from up the mountain stood trial in the town. …Didn't run. I'll give them that.
?(end_kasane_keeper) tetsuji: {山|やま} の {上|うえ} の {番人|ばんにん} は 、 まだ {書庫|しょこ} に いる らしい 。 {見張|みは}り {付|つ}き で な 。 ヤギ と {同|おな}じ だ 。 || The keeper up the mountain's still at the archive, I hear. Under watch. Same as goats.

@scene sb.storm_tetsuji
!if quest.sb_goats=done -> ok
tetsuji[angry]: ヤギ は {小屋|こや} に {入|い}れた 。 {十二頭|じゅうにとう} 、 {全部|ぜんぶ} な 。 {他人|たにん} の ヤギ でも 、 {吹雪|ふぶき} に {放|ほう}って は おけん 。 || The goats are in the shed. All twelve. Somebody else's or not, you don't leave a goat out in a storm.
!end
:ok
tetsuji: {子|こ}ヤギ は {母親|ははおや} に くっついて {寝|ね}て いる 。 {吹雪|ふぶき} も {知|し}らん@知る で 。 …… うらやましい 。 || The kids are asleep curled against their mother. Don't even know there's a storm. …Lucky things.
`, 'ch4/residents-tetsuji');

RB.script.add(`
@scene sb.sousuke_post
sousuke[smile]: {春|はる} の {最初|さいしょ} の {郵便|ゆうびん} で 、 {灯落|ひおち} から {三十通|さんじゅっつう} も {届|とど}きました 。 {宛名|あてな} は 、 ぜんぶ {読|よ}めました よ 。 || The first post of spring brought thirty letters from Lanternfall. I could read every single address.
?(sb_hoshino_goes) sousuke: ホシノ さん から も {一通|いっつう} 。 {差出人|さしだしにん} の {住所|じゅうしょ} が {灯落|ひおち} に なって いる ホシノ さん の {手紙|てがみ} なんて 、 {変|へん} な {感|かん}じ です 。 || One from Mr Hoshino too. A letter from him with Lanternfall as the sender's address — feels strange.
?(!sb_hoshino_goes) sousuke: アカリ さん から ホシノ さん へ 、 {三通|さんつう} 。 {一番上|いちばんうえ} に {置|お}いて {渡|わた}しました 。 {配達|はいたつ} は 、 やっぱり {自分|じぶん} で したい です から ね 。 || Three from Akari to Mr Hoshino. I put them on top and handed them over myself. I do prefer to make my own deliveries.

@scene sb.storm_sousuke
sousuke: {吹雪|ふぶき} の {夜|よる} も 、 {郵便|ゆうびん}{屋|や} の {仕事|しごと} は あります 。 {待|ま}つ こと です 。 …… {冗談|じょうだん} です 。 {帳簿|ちょうぼ} を つけて います 。 || There's postmaster's work even on a storm night: waiting. …A joke. I'm doing the ledger.
sousuke[think]: アカリ さん と は 、 {子|こ}ども の ころ 、 {隣|となり} の {家|いえ} でした 。 {灯落|ひおち} の {住所|じゅうしょ} は …… {封筒|ふうとう} に {書|か}いて あった のに 、 {思|おも}い{出|だ}せない 。 {悔|くや}しい です 。 || Akari lived next door when we were children. Her address in Lanternfall… it was written on every envelope, and I can't remember it. It's galling.

@scene sb.eve_sousuke
sousuke[smile]: {春|はる} に なったら 、 {最初|さいしょ} の {袋|ふくろ} に ホシノ さん の {手紙|てがみ} を {入|い}れます 。 …… あ 、 もう あなた たち が {持|も}って いく んでした ね 。 {配達|はいたつ} 、 {頼|たの}みました よ 。 || Come spring, Mr Hoshino's letter goes in the first sack. …Oh — you're taking it, aren't you. Deliver it well.
`, 'ch4/residents-sousuke');

RB.script.add(`
@scene sb.fuki
!if quest.sb_bell=done -> done
!if quest.sb_bell>=2 -> report
!if quest.sb_bell>=1 -> go
fuki[tired]: ごほっ …… 。 おや 、 {旅|たび} の {人|ひと} かい 。 {見苦|みぐる}しい ところ を 。 || Koff… Oh, travellers, is it. Forgive the state of me.
fuki: {鐘撞|かねつ}き の フキ だよ 。 {広場|ひろば} の {鐘|かね} を 、 {五十年|ごじゅうねん} {鳴|な}らして きた 。 {朝|あさ} 、 {昼|ひる} 、 {夕方|ゆうがた} 。 {吹雪|ふぶき} の とき も 、 {迷子|まいご} の とき も 。 || I'm Fuki, keeper of the bell. I've rung the bell in the square for fifty years. Morning, noon and evening. For storms, and for people lost.
fuki[worry]: ところが この かぜ で 、 {柱|はしら} に {上|のぼ}れない 。 おまけ に 、 {決|き}まり を {書|か}いた {柱|はしら} の {板|いた} が 、 {真|ま}っ{白|しろ} に なっちまった@なる 。 || But with this cold I can't climb the post. And on top of that, the board with the rules on it has gone blank as snow.
fuki: {若|わか}い {者|もの} は 、 {板|いた} を {見|み}て {鳴|な}らして いた から ね 。 {今日|きょう} は {昼|ひる} の {鐘|かね} が {鳴|な}らない かも しれない 。 {昼|ひる} の {鐘|かね} が {鳴|な}らない と 、 {村|むら} じゅう {昼|ひる} ごはん を {食|た}べ{損|そこ}ねる んだよ 。 || The young ones always read the board to ring it. Today the noon bell might not ring at all. And when the noon bell doesn't ring, the whole hamlet misses lunch.
fuki: わたし の {帳面|ちょうめん} に 、 {決|き}まり が {書|か}いて ある 。 {読|よ}んで 、 {代|か}わり に {鳴|な}らして くれない かい 。 || The rules are written in my notebook. Would you read them and ring it for me?
!choice
* {任|まか}せて ください || Leave it to us. -> yes
* {今|いま} は {忙|いそが}しい です || We're busy right now. -> no
:yes
fuki[smile]: ありがたい 。 {帳面|ちょうめん} は そこ の {本|ほん} の {山|やま} の {上|うえ} だよ 。 {字|じ} が {汚|きたな}い の は 、 {勘弁|かんべん} して おくれ 。 || Bless you. The notebook's on top of that pile of books. Forgive the messy handwriting.
!quest sb_bell start
!end
:no
fuki: いい よ 、 いい よ 。 {昼|ひる} ごはん が {遅|おそ}れる だけ さ 。 …… {村|むら} じゅう の ね 。 || Fine, fine. Lunch will just be late. …For the whole hamlet.
!end
:go
fuki: {帳面|ちょうめん} は {読|よ}めた かい 。 {昼|ひる} の {鐘|かね} 、 {頼|たの}んだ よ 。 {間違|まちが}えたら …… ヤギ が {帰|かえ}って きちまう@くる から ね 。 || Managed to read the notebook? The noon bell, then — I'm counting on you. Get it wrong and… the goats will all come home.
!end
:report
fuki[laugh]: {聞|き}こえた よ 。 {昼|ひる} の {鐘|かね} 。 {二|ふた}つ 、 きれい に 。 {五十年|ごじゅうねん} ぶり に 、 {寝床|ねどこ} で {鐘|かね} を {聞|き}いた よ 。 || I heard it. The noon bell. Two strokes, clean. First time in fifty years I've heard the bell from my bed.
fuki: これ を {持|も}って いき な 。 {古|ふる}い {鐘|かね} の {綱|つな} で {編|あ}んだ んだ 。 {鐘|かね} と {同|おな}じ で 、 {息|いき} を {合|あ}わせる の に いい 。 || Take this. I braided it from an old bell rope. Like the bell, it's good for keeping in time together.
!give sb_bell_cord
!note sb_bell_signals
!quest sb_bell done
fuki: {吹雪|ふぶき} の {鐘|かね} も 、 {覚|おぼ}えて おいて おくれ 。 {短|みじか}く 、 {何度|なんど} も 。 {使|つか}わない で {済|す}めば いい けど ね 。 || Remember the storm bell too. Short, again and again. Let's hope you never need it.
!end
:done
fuki: {鐘|かね} は {鳴|な}らす {人|ひと} が いれば 、 {鳴|な}る 。 {灯|あか}り と {同|おな}じ さ 。 || A bell rings as long as there's someone to ring it. Same as a lamp.

@scene sb.fuki_notebook
!if quest.sb_bell -> read
narr: {古|ふる}い {帳面|ちょうめん} 。 {表紙|ひょうし} に 「 {鐘|かね} 」 と {一文字|ひともじ} 。 || An old notebook. On the cover, one character: "Bell".
!end
:read
!challenge sb.c_bell_board
!if var._res=0 -> end
!quest sb_bell 1
narr: {決|き}まり は {頭|あたま} に {入|はい}った 。 {広場|ひろば} の {鐘|かね} の {柱|はしら} へ {行|い}こう 。 || You've got the rules in your head. Off to the bell-post in the square.

@scene sb.fuki_tea
narr: {枕元|まくらもと} の {盆|ぼん} に 、 {冷|さ}めた しょうが{湯|ゆ} と 、 {誰|だれ} か が {置|お}いて いった みかん 。 || On a tray by the pillow: cold ginger tea, and a mandarin someone left.

@scene sb.bellpost
!if quest.sb_bell=1 -> ring
!if quest.sb_bell>=2 -> read
narr: {鐘|かね} の {柱|はしら} 。 {下|した} の {板|いた} は 、 {雪|ゆき} の よう に {白|しろ}い 。 {字|じ} が {一|ひと}つ も {残|のこ}って いない 。 || The bell-post. The board beneath it is white as snow; not a single character remains.
!end
:read
narr: {板|いた} に 、 {新|あたら}しく {字|じ} が {書|か}き{直|なお}して ある 。 「 {朝|あさ} {七時|しちじ} {一|ひと}つ 、 {昼|ひる} {十二時|じゅうにじ} {二|ふた}つ 、 {夕方|ゆうがた} {五時|ごじ} {三|みっ}つ 。 {吹雪|ふぶき} は {短|みじか}く {何度|なんど} も 。 {迷子|まいご} は {長|なが}く {一|ひと}つ 、 {休|やす}んで {一|ひと}つ 。 」 || The board has been written anew: "7 a.m. one. Noon, two. 5 p.m., three. Storm: short, again and again. Lost: one long, a pause, one more."
!end
:ring
narr: {柱|はしら} の {梯子|はしご} を {上|のぼ}る 。 {鐘|かね} の {綱|つな} は 、 {氷|こおり} の よう に {冷|つめ}たい 。 そろそろ {昼|ひる} だ 。 || You climb the ladder on the post. The bell rope is cold as ice. It's nearly noon.
!choice
* {一回|いっかい} || Once. -> one
* {二回|にかい} || Twice. -> two
* {三回|さんかい} || Three times. -> three
* {短|みじか}く 、 {何度|なんど} も || Short, again and again. -> storm
:one
!sfx bell
narr: ごーん 。 …… {窓|まど} が {開|あ}いて 、 {寝間着|ねまき} の {人|ひと} が {顔|かお} を {出|だ}した 。 「 もう {朝|あさ} ？ 」 || Gonnnng. …A window opens and someone in nightclothes pokes their head out. "Morning already?"
?(comp) comp: {一|ひと}つ は {朝|あさ} の {合図|あいず} だった みたい だ よ 。 {帳面|ちょうめん} を {思|おも}い{出|だ}そう 。 || One stroke seems to have been the morning signal. Let's remember the notebook.
!end
:three
!sfx bell
narr: ごーん 、 ごーん 、 ごーん 。 …… {遠|とお}く で テツジ の {声|こえ} 。 「 もう ヤギ を {入|い}れる {時間|じかん} か ！？ 」 || Gonnng, gonnng, gonnng. …In the distance, Tetsuji's voice: "Time to bring the goats in already?!"
?(comp) comp[laugh]: {三|みっ}つ は {夕方|ゆうがた} の ヤギ の {合図|あいず} だ ね 。 {今|いま} は {昼|ひる} だ よ 。 || Three is the evening goat signal. It's noon now.
!end
:storm
!sfx bell
narr: カン カン カン カン ！ …… {家々|いえいえ} の {戸|と} が {一斉|いっせい} に {閉|し}まる {音|おと} が した 。 {空|そら} は {青|あお}い 。 || Clang clang clang clang! …Every door in the hamlet slams shut at once. The sky is blue.
?(comp) comp[worry]: …… {吹雪|ふぶき} の {合図|あいず} だ よ 、 それ 。 みんな に {謝|あやま}り に {行|い}かない と 。 || …That's the storm signal. We'll have to go round and apologise to everyone.
!end
:two
!sfx bell
!wait 500
!sfx bell
narr: ごーん …… ごーん 。 {澄|す}んだ {音|おと} が 、 {雪|ゆき} の {谷|たに} に {広|ひろ}がって いく 。 {家々|いえいえ} の {煙突|えんとつ} から 、 {少|すこ}し ずつ {煙|けむり} が {上|あ}がり {始|はじ}めた 。 {昼|ひる} ごはん の {支度|したく} だ 。 || Gonnng… gonnng. The clear note spreads through the snowy valley. One by one, chimneys begin to smoke. Lunch is on.
?(comp=nao) comp: {時間|じかん} どおり 。 {配達人|はいたつにん} と して は 、 {気持|きも}ち が いい 。 || Right on time. As a courier, that's satisfying.
?(comp=mio) comp[smile]: みんな の {昼|ひる} ごはん を {守|まも}りました ね 。 {大事|だいじ} な {仕事|しごと} です 。 || You've saved everyone's lunch. That's important work.
?(comp=ren) comp[smile]: {鐘|かね} も {灯|あか}り も 、 {決|き}まった {時|とき} に {決|き}まった {形|かたち} で 。 {灯守|ひもり} の {仕事|しごと} と {似|に}て います 。 || Bells and lamps both: the set form, at the set time. Not unlike a keeper's work.
?(comp=suzu) comp[laugh]: {開演|かいえん} の {合図|あいず} みたい ！ …… {昼|ひる} ごはん と いう {名|な} の {演目|えんもく} の ね 。 || Like the call to curtain! …For a show called "Lunch".
!quest sb_bell 2

@scene sb.fuki_after
!if !quest.sb_bell -> offer
fuki: かぜ は {治|なお}った よ 。 {灯|あか}り が ついた {晩|ばん} に 、 すっと {楽|らく}に なった 。 {気|き}の せい かね 。 || My cold's gone. The night the lamp came on, I felt better just like that. My imagination, maybe.
fuki: {鐘|かね} と {灯|あか}り 。 {音|おと} と {光|ひかり} 。 {帰|かえ}り{道|みち} の {目印|めじるし} は 、 {二|ふた}つ ある ほう が いい 。 || The bell and the lamp. Sound and light. It's better for a way home to have two marks.

!end
:offer
fuki: かぜ は {治|なお}った けど 、 {膝|ひざ} が ね 。 {梯子|はしご} は まだ {無理|むり} だ 。 {柱|はしら} の {板|いた} も {白|しろ}い まま さ 。 || My cold's better, but my knees aren't. The ladder's still beyond me. And the board on the post is still blank.
fuki: わたし の {家|いえ} に {帳面|ちょうめん} が ある 。 {決|き}まり を {覚|おぼ}えて 、 {昼|ひる} の {鐘|かね} を {鳴|な}らして くれない かい 。 || My notebook's at my house. Would you learn the rules and ring the noon bell for me?
!choice
* {任|まか}せて ください || Leave it to us. -> yes
* また {今度|こんど} || Another time. -> end
:yes
!quest sb_bell start
fuki[smile]: ありがたい 。 {帳面|ちょうめん} は {本|ほん} の {山|やま} の {上|うえ} だよ 。 || Bless you. The notebook's on top of the pile of books.

@scene sb.fuki_post
?(sb_hoshino_goes) fuki: ホシノ は {娘|むすめ} の ところ へ {下|くだ}った 。 {灯|あか}り は カンタ の {仕事|しごと} に なった よ 。 {約束|やくそく} は 、 {人|ひと} から {人|ひと} へ {渡|わた}せる もん だ ね 。 || Hoshino went down to his daughter. The lamp's Kanta's job now. Turns out a promise can be passed from hand to hand.
?(!sb_hoshino_goes) fuki: ホシノ は {毎晩|まいばん} {上|のぼ}って いる よ 。 {帰|かえ}り に {鐘|かね} の {下|した} で {一休|ひとやす}み する の が 、 {新|あたら}しい {決|き}まり さ 。 || Hoshino climbs every night. Resting under the bell on the way back — that's the new rule.
?(end_mem_return) fuki: {忘|わす}れた こと が 、 みんな {戻|もど}った んだって ね 。 {痛|いた}い もの も {含|ふく}めて 。 …… それ で いい 。 {鐘|かね} は {悲|かな}しい {日|ひ} に も {鳴|な}らす もん だ 。 || They say everything forgotten came back. Painful things included. …That's right. A bell rings on sad days too.
?(end_mem_choose) fuki: {忘|わす}れた こと は 、 {会|あ}い に {行|い}く か どう か {選|えら}べる んだって ね 。 {選|えら}べる の は 、 {悪|わる}く ない 。 || They say you can choose whether to go and visit what you forgot. Being able to choose isn't bad.

@scene sb.storm_fuki
!if quest.sb_bell=done -> rang
fuki[tired]: ごほっ 。 {吹雪|ふぶき} の {鐘|かね} は 、 {這|は}って でも {鳴|な}らす よ 。 それ が {鐘撞|かねつ}き だ 。 || Koff. I'd crawl to ring the storm bell if I had to. That's what a bell-keeper is.
!end
:rang
fuki[smile]: {吹雪|ふぶき} の {鐘|かね} 、 あんた が {鳴|な}らした ね 。 {音|おと} で わかる 。 {若|わか}い {腕|うで} の {音|おと} だ 。 …… {悪|わる}く なかった よ 。 || You rang the storm bell. I could tell by the sound. Young arms. …Not bad at all.

@scene sb.eve_fuki
fuki[smile]: {鐘|かね} を {鳴|な}らそう か と {思|おも}った けど 、 やめた 。 {今夜|こんや} は 、 {静|しず}か に {見|み}て いたい 。 || I thought about ringing the bell, but I didn't. Tonight I want to just watch, quietly.
`, 'ch4/residents-fuki');

RB.script.add(`
@scene sb.kanta
!if sb_lamp_lit -> after
!if quest.sb_snow=done -> done
!if quest.sb_snow>=1 -> judge
!if quest.sb_snow -> look
kanta[smile]: ねえ=(hey) ねえ=(hey) 、 {旅|たび} の {人|ひと} ！ {雪像|せつぞう} コンテスト の {審査員|しんさいん} に なって よ ！ || Hey, hey, traveller! Be the judge for our snow-sculpture contest!
kanta: おれ と チヨ と ロクタ で 、 {一|ひと}つ ずつ {作|つく}った んだ 。 {大人|おとな} は みんな 「 どれ も {上手|じょうず} 」 って {言|い}う から 、 {決|き}まらない の 。 || Chiyo, Rokuta and me made one each. The grown-ups all say "they're all good", so we can't decide.
kanta: {決|き}まり が ある んだ 。 「 {札|ふだ} に {書|か}いた とおり の {雪像|せつぞう} が {勝|か}ち 」 ！ {大|おお}きさ じゃ ない よ 。 {説明|せつめい} と {同|おな}じ か どう か ！ || There's a rule: "The sculpture that matches what's written on its card wins!" Not the biggest — whichever matches its description!
kanta[worry]: でも 、 {昨日|きのう} の {風|かぜ} で 、 ちょっと {崩|くず}れた の も ある んだ よね …… 。 || Only, yesterday's wind knocked some of them about a bit…
?(comp=suzu) comp[laugh]: {審査員|しんさいん} ！ いい {響|ひび}き 。 {公平|こうへい} に 、 でも {愛|あい} を もって ね 。 || Judge! Has a nice ring. Fair — but with love.
?(comp=ren) comp: {記録|きろく} と {現物|げんぶつ} の {照合|しょうごう} です ね 。 {得意|とくい} {分野|ぶんや} です 。 || Checking the record against the real thing. My speciality.
!quest sb_snow start
kanta: {三|みっ}つ とも {見|み}て きて ！ {札|ふだ} は {像|ぞう} の {前|まえ} に {立|た}てて ある から ！ || Go and look at all three! The cards are stuck in the snow in front of them!
!end
:look
kanta: {三|みっ}つ とも {見|み}た ？ ヤギ と 、 {天文台|てんもんだい} と 、 キツネ ！ || Seen all three? The goat, the observatory, and the fox!
!if seen.sb.sculpt_goat&seen.sb.sculpt_obs&seen.sb.sculpt_fox -> ready
!end
:ready
!quest sb_snow 1
!goto judge
:judge
kanta: {決|き}まった ？ どれ が {勝|か}ち ？ || Decided? Which one wins?
!challenge sb.c_snow_judge
!if var._res=0 -> later
kanta[surprise]: チヨ の {天文台|てんもんだい} ！ || Chiyo's observatory!
chiyo[laugh]: やった ！ {赤|あか}い {実|み} の {灯|あか}り 、 ちゃんと {残|のこ}ってた でしょ ！ || Yes! The red-berry lamp was still there, wasn't it!
rokuta[angry]: くっそー 。 {風|かぜ} が {悪|わる}い 。 {尻尾|しっぽ} は もっと {大|おお}きかった んだ ！ || Aw, rats. It was the wind's fault. The tail was way bigger!
kanta[sad]: おれ の ヤギ 、 {角|つの} が {一本|いっぽん} とれちゃった から なあ 。 …… {次|つぎ} は {氷|こおり} で {角|つの} を {作|つく}る ！ || My goat lost one of its horns… Next time I'll make the horns out of ice!
narr: {子|こ}ども たち の {後|うし}ろ から 、 サチ が {顔|かお} を {出|だ}した 。 || Sachi appears from behind the children.
sachi[smile]: {審査員|しんさいん} さん 、 お{疲|つか}れ さま 。 これ 、 {子|こ}ども たち が {色|いろ} を {選|えら}んだ の 。 {審査員|しんさいん} へ の お{礼|れい} だって 。 || Well judged, and thank you. The children chose the colours for this. It's their thank-you to the judge.
!give sb_scarf
!quest sb_snow done
!end
:later
kanta: ゆっくり {決|き}めて いい よ 。 {雪|ゆき} は {春|はる} まで とけない から ！ || Take your time. The snow won't melt till spring!
!end
:done
kanta: チヨ の {灯|あか}り 、 {夜|よる} に なる と {本物|ほんもの} みたい に {見|み}える んだ よ 。 …… {赤|あか}い けど 。 || Chiyo's lamp looks like the real one at night. …Well, it's red.
!end
:after
kanta[laugh]: {灯|あか}り 、 ついた ！ ついた ！ {窓|まど} から {見|み}える んだ よ ！ || The lamp's on! It's on! I can see it from my window!
!if quest.sb_snow=done -> end
!if quest.sb_snow>=1 -> judge
!if quest.sb_snow -> look
kanta: ねえ=(hey) 、 まだ {審査員|しんさいん} 、 {募集|ぼしゅう} {中|ちゅう} だ よ ！ || Hey, we're still looking for a judge!
!quest sb_snow start
!end

@scene sb.kanta_post
?(sb_hoshino_goes) kanta[smile]: {灯|あか}り は おれ が ともしてる んだ 。 {毎晩|まいばん} ！ ホシノ じいちゃん と {約束|やくそく} した から ！ || I light the lamp now. Every night! Because I promised Grandpa Hoshino!
?(sb_hoshino_goes) kanta: {鼓星|つづみぼし} も {覚|おぼ}えた よ 。 {冬|ふゆ} の {夜|よる} 、 {南|みなみ} ！ || I learned the Drum Stars too. Winter nights, south!
?(!sb_hoshino_goes) kanta[smile]: ホシノ じいちゃん に 、 {星|ほし} の {名前|なまえ} を {習|なら}ってる んだ 。 {鼓星|つづみぼし} は {冬|ふゆ} の {南|みなみ} ！ || Grandpa Hoshino's teaching me star names. The Drum Stars are winter, south!

@scene sb.storm_kanta
kanta[worry]: {風|かぜ} の {音|おと} 、 {怖|こわ}く ない よ 。 …… ちょっと だけ 。 || The wind doesn't scare me. …Only a little.
?(sb_hearth_done) kanta[smile]: ねえ=(hey) 、 さっき の {火|ひ} の {字|じ} 、 おれ に も {教|おし}えて ！ 「 ほのお 」 だよ ね ？ || Hey, teach me that fire word from before! Ho, no, o, right?

@scene sb.eve_kanta
kanta[laugh]: {見|み}て ！ {見|み}て ！ {灯|あか}り が ついた ！ {十日|とおか} ぶり ！ いや 、 {十一日|じゅういちにち} ぶり ！ || Look! Look! The lamp's lit! First time in ten days! No, eleven!

@scene sb.chiyo
!if quest.sb_snow=done -> won
chiyo[smile]: チヨ の は {天文台|てんもんだい} ！ {灯|あか}り は ナナカマド の {実|み} な の 。 {本物|ほんもの} は {消|き}えちゃった から 、 チヨ が ともして あげた の 。 || Mine's the observatory! The lamp is a rowan berry. The real one went out, so I lit one for it.
!end
:won
chiyo[laugh]: {勝|か}った ！ でも 、 ほんと は ね 、 {本物|ほんもの} の {灯|あか}り が つく ほう が 、 うれしい 。 || I won! But really… I'd be happier if the real lamp came on.
?(sb_lamp_lit) chiyo: …… だから 、 {今日|きょう} は {二回|にかい} {勝|か}った の ！ || …So today I won twice!

@scene sb.chiyo_post
chiyo[smile]: {次|つぎ} の コンテスト は 、 {雪|ゆき} で {灯落|ひおち} の {橋|はし} を {作|つく}る の 。 アカリ さん が {毎晩|まいばん} {立|た}ってた {橋|はし} ！ || For the next contest we're making the Lanternfall bridge out of snow. The one Akari stood on every night!

@scene sb.rokuta
!if quest.sb_snow=done -> lost
rokuta[smirk]: おれ の キツネ が いちばん かっこいい 。 {尻尾|しっぽ} を {見|み}ろ よ 。 …… {見|み}ろ って 。 {昨日|きのう} は もっと {大|おお}きかった んだ から 。 || My fox is the coolest. Look at the tail. …Look at it, I said. It was way bigger yesterday.
?(comp=nao) comp: {昨日|きのう} の {大|おお}きさ は 、 {札|ふだ} に {書|か}いて ある の か ？ || Is yesterday's size written on the card?
rokuta[angry]: …… {書|か}いて ある よ ！ {悪|わる}い か よ ！ || …It is! So what!
!end
:lost
rokuta: {次|つぎ} は {負|ま}けない 。 {札|ふだ} を {先|さき} に {書|か}かない で 、 {作|つく}って から {書|か}く 。 …… それ って ずるい ？ || I won't lose next time. I'll build first and write the card after. …Is that cheating?
?(comp=suzu) comp[laugh]: ずるく ない よ 。 それ を {世間|せけん} で は 「 {正直|しょうじき} 」 って {言|い}う の 。 || Not cheating. Out in the world, they call that "honesty".

@scene sb.rokuta_post
rokuta[smirk]: キツネ 、 {本物|ほんもの} を {見|み}た んだ 。 {雪|ゆき} の {中|なか} から こっち を {見|み}てた 。 {怖|こわ}く なかった 。 …… ほんと だ よ 。 || I saw a real fox. It was watching me from the snow. I wasn't scared. …Honest.

@scene sb.storm_kids
!if quest.sb_snow=done -> done
chiyo[angry]: ロクタ が 、 {吹雪|ふぶき} で {雪像|せつぞう} が {全部|ぜんぶ} {崩|くず}れたら 「 {引|ひ}き{分|わ}け 」 だって ！ || Rokuta says if the storm knocks all the sculptures down, it's a "draw"!
rokuta[smirk]: {風|かぜ} は {公平|こうへい} だ から な 。 || The wind's fair, that's why.
!end
:done
rokuta: {吹雪|ふぶき} で チヨ の {天文台|てんもんだい} が {崩|くず}れたら 、 {優勝|ゆうしょう} は {取|と}り{消|け}し だ よな ？ || If the storm knocks down Chiyo's observatory, her win gets cancelled, right?
chiyo[angry]: {取|と}り{消|け}さない ！ || It does not!
`, 'ch4/residents-children');

RB.script.add(`
@scene sb.sachi
!if sb_evening -> eve
!if sb_lamp_lit -> after
!if sb_letters_done -> letter
sachi[smile]: {洗濯物|せんたくもの} 、 {干|ほ}した そば から {凍|こお}っちゃう の 。 {立|た}つ {着物|きもの} 、 {見|み}た ？ カンタ が {喜|よろこ}ぶ の よ 。 || The washing freezes the moment I hang it up. Did you see the kimono that stands up by itself? Kanta loves it.
sachi: {夫|おっと} は {灯落|ひおち} へ {出稼|でかせ}ぎ に {行|い}って いる の 。 {春|はる} まで {帰|かえ}らない 。 {手紙|てがみ} も {届|とど}かない し …… まあ 、 {冬|ふゆ} は いつも そう だけど ね 。 || My husband's working in Lanternfall for the season. He won't be back till spring. No letters get through either… well, it's like that every winter.
!end
:letter
sachi[smile]: {夫|おっと} の {手紙|てがみ} 、 ありがとう 。 {春|はる} に {帰|かえ}る って 。 カンタ に {木|き} の {人形|にんぎょう} を {買|か}った んだって 。 || Thank you for my husband's letter. He says he'll be back in spring. He's bought Kanta a wooden doll.
sachi[laugh]: カンタ に は {内緒|ないしょ} ね 。 もう {人形|にんぎょう} で {遊|あそ}ぶ {年|とし} じゃ ない って {怒|おこ}る から 。 {本当|ほんとう} は {喜|よろこ}ぶ くせ に 。 || Don't tell Kanta. He'll get cross and say he's too old for dolls. When really he'll love it.
!end
:after
sachi: {灯|あか}り が ついて から 、 カンタ が {夜|よる} {窓|まど} から {離|はな}れない の 。 {寝|ね}かせる の が {大変|たいへん} 。 {嬉|うれ}しい {大変|たいへん} だけど ね 。 || Since the lamp came on, Kanta won't leave the window at night. Getting him to bed is a struggle. A happy struggle.
!end
:eve
sachi[smile]: カンタ は {広場|ひろば} ？ …… やっぱり 。 {今夜|こんや} だけ は 、 {夜更|よふ}かし を {許|ゆる}して あげる わ 。 || Is Kanta in the square? …Of course. Just for tonight, he can stay up late.

@scene sb.sachi_post
sachi[smile]: {夫|おっと} が {帰|かえ}って きた の 。 {人形|にんぎょう} を {見|み}た カンタ 、 「 {子|こ}ども じゃ ない 」 って {言|い}いながら 、 {毎晩|まいばん} {抱|だ}いて {寝|ね}てる わ 。 || My husband came home. Kanta took one look at the doll and said "I'm not a baby" — and he's slept holding it every night since.

@scene sb.storm_sachi
sachi[worry]: {夫|おっと} は {灯落|ひおち} で 、 この {吹雪|ふぶき} を {知|し}らない のね 。 {知|し}らない ほう が いい か 。 {心配性|しんぱいしょう} だ から 。 || My husband's down in Lanternfall and doesn't know about this storm. Maybe better he doesn't. He's a worrier.

@scene sb.sachi_loom
narr: {織|お}り{機|き} に 、 {途中|とちゅう} まで {織|お}った {布|ぬの} 。 {雪|ゆき} の {結晶|けっしょう} の {模様|もよう} が 、 {三|みっ}つ {半|はん} 。 || Half-woven cloth on the loom: three and a half snowflake patterns.

@scene sb.sachi_box
narr: {箱|はこ} の {中|なか} に 、 {小|ちい}さく なった {子|こ}ども の {服|ふく} が 、 {年|とし} ごと に {畳|たた}んで しまって ある 。 || Inside the box, children's clothes Kanta has outgrown are folded away, one bundle for each year.
`, 'ch4/residents-sachi');

RB.script.add(`
@scene sb.denji
!if sb_lamp_lit -> after
denji: {川|かわ} の {氷|こおり} に {穴|あな} を {開|あ}けて 、 {魚|さかな} を {待|ま}って いる 。 {魚|さかな} も {寒|さむ}くて {動|うご}かん@動く 。 {気|き}が {合|あ}う 。 || I've cut a hole in the ice and I'm waiting for fish. The fish are too cold to move. We get on.
denji: おれ は デンジ 。 {大工|だいく} だった 。 {天文台|てんもんだい} の {丸屋根|まるやね} は 、 {四十年|よんじゅうねん} {前|まえ} 、 ホシノ と {二人|ふたり} で {上|あ}げた 。 {二人|ふたり} とも {若|わか}くて 、 {馬鹿|ばか} だった 。 || I'm Denji. I was a carpenter. Forty years ago Hoshino and I put the dome on that observatory, just the two of us. Both young, both fools.
?(sb_storm) denji: {中|なか} の こと なら 、 {宿|やど} で {話|はな}した とおり だ 。 {迷|まよ}ったら 、 {壁|かべ} の {字|じ} を {読|よ}め 。 おれ たち は 、 {何|なん} でも {書|か}いて おいた 。 || As I told you at the inn. If you're lost inside, read the writing on the walls. We wrote everything down.
!end
:after
denji: {灯|あか}り が {戻|もど}った な 。 …… {丸屋根|まるやね} から の {眺|なが}め は 、 どう だった 。 {四十年|よんじゅうねん} {前|まえ} と {同|おな}じ なら 、 いい {眺|なが}め だ 。 || The lamp's back. …How was the view from the dome? If it's the same as forty years ago, it's a good one.
?(sb_shortcut) denji[smirk]: {裏|うら} の {階段|かいだん} 、 {使|つか}った か 。 あれ は おれ の {自慢|じまん} だ 。 ホシノ は 「 {無駄|むだ} だ 」 と {言|い}った が な 。 || Used the back stair, did you? That's my pride and joy. Hoshino called it a waste.

@scene sb.denji_post
denji: {丸屋根|まるやね} の {修理|しゅうり} を {頼|たの}まれた 。 この {年|とし} で な 。 …… {断|ことわ}る {理由|りゆう} が ない 。 || They've asked me to repair the dome. At my age. …Can't think of a reason to say no.
?(end_archive_library) denji: {山|やま} の {書庫|しょこ} の {棚|たな} も 、 {作|つく}り{直|なお}す らしい 。 {図書館|としょかん} に する んだ と 。 {大工|だいく} の {出番|でばん} だ 。 || They're rebuilding the shelves at the mountain archive too, I hear. Making it a library. Carpenter's work.

@scene sb.storm_denji
denji: {天文台|てんもんだい} に {上|のぼ}る なら 、 {聞|き}いて おけ 。 || If you're going up to the observatory, listen.
denji: {一階|いっかい} の {奥|おく} の {扉|とびら} は 、 ホシノ の {悪趣味|あくしゅみ} だ 。 「 {見|み}る べき {方角|ほうがく} を {知|し}る {者|もの} に {開|ひら}く 」 。 {壁|かべ} の {心得|こころえ} を {読|よ}め 。 {答|こた}え は そこ に ある 。 || The door at the back of the ground floor is Hoshino's bad taste: "It opens for one who knows which way to look." Read the rules on the wall. The answer's there.
denji: {上|うえ} の {回廊|かいろう} に は 、 {裏|うら} の {階段|かいだん} が ある 。 {外|そと} の {石段|いしだん} に {出|で}られる 。 ただし {内側|うちがわ} から しか {開|あ}かん@開く 。 {一度|いちど} {開|あ}ければ 、 {次|つぎ} から は {近道|ちかみち} だ 。 || The upper gallery has a back stair. It lets out onto the stone steps outside. Only opens from the inside, though. Open it once and it's a shortcut after that.
denji: {丸屋根|まるやね} へ の {蓋|ふた} は 、 {回廊|かいろう} の ハンドル で {開|あ}ける 。 {回|まわ}し{方|かた} は {壁|かべ} に {書|か}いて ある 。 {凍|こお}って いたら …… まあ 、 {読|よ}めば わかる 。 || The hatch to the dome opens with the handle in the gallery. How to turn it is written on the wall. If it's frozen… well, read it and you'll see.

@scene sb.denji_morning
denji: {行|い}く の か 。 {扉|とびら} 、 {裏|うら} の {階段|かいだん} 、 {蓋|ふた} の ハンドル 。 {昨夜|ゆうべ} {言|い}った {三|みっ}つ を {忘|わす}れる な 。 || Going, are you? The door, the back stair, the hatch handle. Don't forget the three things I told you last night.
denji: それ と 、 ホシノ を {頼|たの}む 。 あいつ は {約束|やくそく} の こと に なる と 、 {自分|じぶん} を {粗末|そまつ} に する 。 || And look after Hoshino for me. When it comes to promises, he doesn't look after himself.
`, 'ch4/residents-denji');

RB.script.add(`
@scene sb.hayate
!if sb_morning -> morning
hayate: …… {旅|たび} の {者|もの} か 。 {石段|いしだん} に は {近|ちか}づく な 。 {氷|こおり} の {中|なか} に キツネ が いる 。 || …Travellers. Stay away from the stair. There are foxes in the ice.
hayate: {雪|ゆき}ギツネ は {本来|ほんらい} 、 {人|ひと} を {襲|おそ}わない 。 だが {灯|あか}り が {消|き}えて から 、 {目|め} が {変|か}わった 。 {何|なに} か に {呼|よ}ばれて いる よう な {目|め} だ 。 || Snow foxes don't attack people, by nature. But since the lamp went out, their eyes have changed. Like something is calling them.
?(comp=mio) comp[worry]: {怪我|けが} を して いる キツネ が いたら 、 {教|おし}えて ください 。 …… {人|ひと} も 、 キツネ も 。 || If you find any hurt foxes, tell me. …People or foxes.
hayate[surprise]: …… {変|か}わった {人|ひと} だ 。 {覚|おぼ}えて おく 。 || …Odd sort. I'll remember.
!end
:morning
hayate: {上|のぼ}る の か 。 キツネ は {動|うご}く もの を {追|お}う 。 {走|はし}る な 。 {目|め} を そらさず に 、 {横|よこ} へ {抜|ぬ}けろ 。 || Going up? Foxes chase what moves. Don't run. Keep your eyes on them and slip past to the side.
hayate: …… {追|お}って きたら 、 {戦|たたか}う しか ない 。 {傷|きず}つけず に {済|す}む なら 、 それ が いい 。 || …If they come after you, there's nothing for it but to fight. If you can do it without hurting them, better.

@scene sb.hayate_post
hayate: キツネ の {目|め} は 、 もと に {戻|もど}った 。 {雪|ゆき} の {中|なか} から {見|み}て いる だけ だ 。 {昔|むかし} の よう に 。 || The foxes' eyes are back to normal. They just watch from the snow. Like they used to.

@scene sb.storm_hayate
hayate: {窓|まど} の {外|そと} に 、 キツネ の {声|こえ} が {聞|き}こえた 。 {吹雪|ふぶき} の {中|なか} を 、 {天文台|てんもんだい} の ほう へ {走|はし}って いった 。 || I heard foxes crying outside the window. Running through the storm, toward the observatory.
hayate: {何|なに} か が 、 {上|うえ} で {待|ま}って いる 。 …… {気|き}を つけろ 。 || Something is waiting up there. …Be careful.
`, 'ch4/residents-hayate');

RB.script.add(`
@scene sb.nao_cameo
nao[smirk]: よう 。 $name か 。 {世界|せかい} は {狭|せま}い な 。 …… いや 、 {雪|ゆき} の {上|うえ} じゃ {広|ひろ}い か 。 || Hey. $name. Small world. …Or big, when it's all snow.
nao: {冬|ふゆ} {越|ご}し の {郵便|ゆうびん} を {届|とど}け に {来|き}たら 、 {峠|とうげ} が {閉|し}まった 。 {灯落|ひおち} へ の {袋|ふくろ} を {抱|かか}えた まま 、 {春|はる} まで {足止|あしど}め だ 。 || Came up to deliver the winter post and the pass shut behind me. Now I'm stuck here till spring, hugging a sack for Lanternfall.
nao: {雪鈴|ゆきすず} の {宛名|あてな} が {消|き}えた {話|はなし} 、 {聞|き}いた か 。 {気|き}に {入|い}らない 。 {消|き}える ぐらい なら 、 {最初|さいしょ} から {書|か}く な って {話|はなし} だ 。 || Heard about Snowbell's addresses vanishing? I don't like it. If they're going to vanish, why write them in the first place.
nao: {気|き}を つけろ よ 。 {二人|ふたり} で {来|き}た んだろ 。 {二人|ふたり} で {帰|かえ}れ 。 || Be careful. You came as two. Go back as two.

@scene sb.nao_cameo_storm
nao: {吹雪|ふぶき} で {足止|あしど}め 、 {二回目|にかいめ} 。 …… {配達人|はいたつにん} は 、 {待|ま}つ の が いちばん {苦手|にがて} なんだ よ 。 || Stuck by a storm, second time now. …Couriers are worst of all at waiting.
?(sb_hearth_done) nao[smirk]: さっき の {字|じ} 、 {見|み}た ぞ 。 {囲炉裏|いろり} の {火|ひ} が {立|た}った 。 …… {悪|わる}く ない 。 {灯落|ひおち} の {手紙|てがみ} も 、 そう やって {届|とど}けば いい のに な 。 || Saw that word earlier. Stood the whole fire up. …Not bad. Wish letters to Lanternfall could arrive like that.

@scene sb.nao_cameo_after
nao: {灯|あか}り 、 ついた な 。 {下|した} の {町|まち} から も {見|み}える はず だ 。 {灯落|ひおち} で {待|ま}ってる {誰|だれ} か に も 。 || The lamp's lit. They should be able to see it from the town below. Whoever's waiting in Lanternfall, too.
nao: こっち が {持|も}ってる {袋|ふくろ} に も 、 {雪鈴|ゆきすず} から の {手紙|てがみ} が {入|はい}ってる 。 {宛名|あてな} が {戻|もど}ったら 、 ちゃんと {届|とど}ける 。 {約束|やくそく} する 。 || The sack I'm carrying has letters from Snowbell in it too. Once the addresses come back, I'll deliver them properly. Promise.

@scene sb.nao_cameo_post
nao[smile]: {雪鈴|ゆきすず} の {袋|ふくろ} 、 {全部|ぜんぶ} {届|とど}けた よ 。 {一通|いっつう} も {残|のこ}さず に 。 …… {今|いま} は 、 それ が {誇|ほこ}り だ 。 || Delivered every letter in the Snowbell sack. Not one left over. …These days, that's what I'm proud of.

@scene sb.goat
!sfx cursor
narr: 「 メェ ～ 」 。 ヤギ は あなた の {袖|そで} を {噛|か}もう と した 。 || "Meeeh." The goat tries to chew your sleeve.
?(comp=suzu) comp[laugh]: {衣装|いしょう} を {食|た}べる の は やめて ！ {昔|むかし} 、 それ で {幕|まく} を {一枚|いちまい} {失|うしな}った んだ から ！ || Don't eat the costume! I lost a whole curtain to one of you once!

@scene sb.goat_kid
narr: {生|う}まれた ばかり の {子|こ}ヤギ 。 {足|あし} が まだ ふらふら して いる 。 {小|ちい}さな {声|こえ} で 「 メ 」 と {鳴|な}いた 。 || A newborn kid, still wobbly on its legs. It lets out a tiny "Meh."

@scene sb.goat_momo
narr: {首|くび} の {札|ふだ} に 「 モモ 」 。 {母|はは} ヤギ は {誇|ほこ}らしげ に 、 {子|こ}ども たち の {前|まえ} に {立|た}って いる 。 || The tag on her collar says "Momo". The mother goat stands proudly in front of her kids.
`, 'ch4/cameo-goats');
