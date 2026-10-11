/* The Keepers' Road, Chapter 7: the ridge, the lodge, the hall and the pass (expansion P10). The stele and Jūzō; the
 * fork to the Shuttered Hall; Kikyō with her scroll; the lodge and Hisae (her conversation is the encounter
 * kr.hisae, 33_cave.js); すべて (C-74); the ridge's lanterns and the Wick Moths; the cave's door; the hall that stays
 * shut; dawn and the way down (the chapter's end). The cave, the registers and the vigil are in 22_scenes_vigil.js. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene kr.stele
# Source 1 of the cave's tellings, and of the oil cache's (its last line): the keepers' own stone.
!gesture pc read 14,8
narr: {大|おお}きな {石|いし} の {碑|ひ} 。 {灯守|ひもり} が {洞|ほら} を {掘|ほ}った {時|とき} に {彫|ほ}った もの らしい 。 || A great stone stele, cut, it seems, when the keepers dug their cave.
narr: {灯|ひ} の {順番|じゅんばん} の {行|ぎょう} と 、 {油|あぶら} の {置|お}き{場所|ばしょ} の {行|ぎょう} が ある 。 {三|みっ}つ{目|め} の {灯|ひ} の {字|じ} は 、 {削|けず}れて {読|よ}めない 。 || There is a line about the order of the lights, and one about where the oil is kept. The third light's word is worn away.
?(prof=A) narr: {古|ふる}い {言|い}い{方|かた} で {書|か}いて ある 。 「〜べし」 は 「〜しなければ ならない」 。 {読|よ}まなくて も {先|さき} へ {進|すす}める 。 || It is written in the old style: 〜べし means "must". You can go on without reading it.
!set kr_stele_read
?(!kr_juzo_met) narr: {碑|ひ} の {前|まえ} で 、 {眼鏡|めがね} の {男|おとこ} が {字|じ} を {写|うつ}して いる 。 || Before the stele a man in glasses is copying the characters.

@scene kr.juzo_first
!faceplayer
!set kr_juzo_met
kr_juzo: {都|みやこ} から {来|き}た {学者|がくしゃ} の ジュウゾウ です 。 この {道|みち} の {碑|ひ} を 、 {全部|ぜんぶ} {写|うつ}して いる ところ で して 。 || I'm Jūzō, a scholar from the capital. I'm copying every inscription on this road.
kr_juzo: {石|いし} は {嘘|うそ} を つきません 。 {人|ひと} の {記憶|きおく} は {変|か}わる が 、 {彫|ほ}った {字|じ} は {変|か}わらない 。 …… {削|けず}れて {読|よ}めない ところ は 、 {困|こま}ります が ね 。 || Stone doesn't lie. People's memories change; carved characters don't. …Though where they're worn away, that's a nuisance.
?(comp=ren) comp[think]: {石|いし} は 、 {彫|ほ}った {人|ひと} が {知|し}って いた こと しか {言|い}えません 。 {読|よ}めない ところ は 、 {誰|だれ} か に {聞|き}く しか ない です ね 。 || A stone can only say what the person who cut it knew. Where it can't be read, we'll have to ask someone.
?(comp=nao) comp: {石|いし} も {字|じ} も 、 {削|けず}れる 。 {手紙|てがみ} と {同|おな}じ だ 。 || Stone wears away, and so does writing. Same as letters.
?(comp=mio) comp: {石|いし} は {正直|しょうじき} です けど 、 {全部|ぜんぶ} は {教|おし}えて くれない の ね 。 || Stone is honest, but it doesn't tell you everything.
?(comp=suzu) comp[smirk]: {石|いし} の {台本|だいほん} ね 。 {一行|いちぎょう} {抜|ぬ}けて たら 、 {芝居|しばい} は {止|と}まる わ よ 。 || A script in stone. Miss one line and the play stops.

@scene kr.juzo_idle
!faceplayer
kr_juzo: {碑|ひ} の {三|みっ}つ{目|め} は 、 どう {考|かんが}えて も {読|よ}めない 。 {誰|だれ} か {覚|おぼ}えて いる {人|ひと} は いない もの か 。 || The stele's third is unreadable, however I look at it. Isn't there anyone who remembers?

@scene kr.juzo_after
!faceplayer
kr_juzo[smile]: {石|いし} と {人|ひと} と {歌|うた} と {絵|え} を {比|くら}べる 。 …… {都|みやこ} に {帰|かえ}ったら 、 {本|ほん} の {書|か}き{方|かた} を {変|か}えます よ 。 || Compare stone and people and songs and pictures. …When I get back to the capital, I'll write my book differently.

@scene kr.fork_marker
!gesture pc read 19,15
narr: {分|わ}かれ{道|みち} の {道標|みちしるべ} 。 「{右|みぎ} 、 {宿坊|しゅくぼう} 。 {左|ひだり} 、 {館|やかた} 。」 || The fork's waystone: "Right, the lodge. Left, the hall."

@scene kr.kikyo_first
!faceplayer
!set kr_kikyo_met
kr_kikyo: あら 、 {旅|たび} の {方|かた} 。 {私|わたし} は {絵解|えと}き の キキョウ 。 {絵巻|えまき} を {見|み}せて 、 {話|はなし} を {語|かた}る の が {仕事|しごと} です 。 || Oh, travellers. I'm Kikyō, an etoki teller. I show a painted scroll, and tell its story.
kr_kikyo: {毎年|まいとし} この {季節|きせつ} に 、 {宿坊|しゅくぼう} の ヒサエ さん に {灯守|ひもり} の {話|はなし} を {語|かた}り に {行|い}く の 。 …… でも 、 {雨|あめ} に {降|ふ}られて 、 {字|じ} が {流|なが}れて しまって 。 || Every year about now I go up to the lodge to tell Hisae the keepers' story. …But I was caught in the rain, and the captions have run.
kr_kikyo[worry]: それ に 、 {提灯|ちょうちん}お{化|ば}け が ずっと {付|つ}いて くる の 。 {話|はなし} を {食|た}べる {化|ば}け{物|もの} よ 。 {絵巻|えまき} が {心配|しんぱい} で 、 {先|さき} へ {進|すす}めない の 。 || And a lantern ghost has been following me. They eat stories. I'm afraid for my scroll, and I daren't go on.
?(comp=suzu) comp[happy]: {語|かた}り の {同業|どうぎょう} ね ！ {舞台|ぶたい} は {違|ちが}う けど 、 {話|はなし} は {合|あ}い そう 。 || A fellow teller! Different stage, but I think we'll get on.
?(comp=suzu) kr_kikyo[smile]: あら 、 {役者|やくしゃ} さん ？ {声|こえ} で {分|わ}かる わ 。 || Oh, an actor? I can tell by your voice.

@scene kr.kikyo_wait
!faceplayer
kr_kikyo[worry]: {提灯|ちょうちん}お{化|ば}け が 、 あそこ の {灯籠|とうろう} の {陰|かげ} に いる の 。 {一緒|いっしょ} に {追|お}い{払|はら}って もらえない ？ || The lantern ghost is behind that lantern over there. Would you help me drive it off?

@scene kr.kikyo_go
!faceplayer
!set kr_kikyo_lodge
kr_kikyo[smile]: ありがとう 。 {宿坊|しゅくぼう} で {待|ま}って います 。 {絵巻|えまき} の {字|じ} を {直|なお}す の 、 {手伝|てつだ}って もらえたら うれしい わ 。 || Thank you. I'll wait at the lodge. I'd be glad of a hand putting the scroll's words back.

@scene kr.lodge_arrive
# Staged: the road comes up out of the maples onto a shelf of the hill; a long roofless building of stone, its walls
# broken; one lamp lit in the middle of it; a small old woman with a cane looks up from trimming it; behind the ruin,
# a cliff with a door in it.
!set kr_lodge_seen
narr: {紅葉|もみじ} の {林|はやし} を {抜|ぬ}ける と 、 {屋根|やね} の ない {石|いし} の {建物|たてもの} が あった 。 {灯守|ひもり} の {宿坊|しゅくぼう} だ 。 || Out of the maples stands a long stone building with no roof: the keepers' lodge.
narr: {壊|こわ}れた {壁|かべ} の {真|ま}ん{中|なか} に 、 {灯|ひ} が {一|ひと}つ だけ {点|つ}いて いる 。 {小|ちい}さな おばあさん が 、 その {芯|しん} を {整|ととの}えて いた 。 || In the middle of the broken walls a single lamp is lit. A small old woman is trimming its wick.
?(comp=ren) !gesture comp lookroad up
?(comp=ren) comp[surprise]: …… {灯|ひ} が 、 {点|つ}いて います 。 この {道|みち} で 、 {初|はじ}めて {誰|だれ} か が {点|つ}けた {灯|ひ} を {見|み}ました 。 || …There's a light. The first one on this road that someone else has lit.
?(comp=nao) comp: {人|ひと} が いる 。 …… {一人|ひとり} で 、 ここ に ？ || Someone's here. …On their own, up here?
?(comp=mio) comp[worry]: お{年寄|としよ}り が {一人|ひとり} で …… 。 {寒|さむ}く ない の かしら 。 || An old woman on her own… Isn't she cold?
?(comp=suzu) comp: {客席|きゃくせき} の ない {舞台|ぶたい} に 、 {灯|あか}り が {一|ひと}つ 。 …… いい {絵|え} に なる わ 。 || One light on a stage with no audience. …Quite a picture.
!quest kr_main 2
!journal {灯守|ひもり} の {宿坊|しゅくぼう} に {着|つ}いた 。 {灯|ひ} を {守|まも}る おばあさん が いる 。 || You reach the keepers' lodge. An old woman keeps a lamp there.

@scene kr.hisae_first
# Hisae's questions (A6): a conversation where asking back matters more than answering (kr.hisae, 33_cave.js). Every
# ending leads on; the warmer ones are worth having.
!faceplayer
kr_hisae: …… {誰|だれ} だい 。 この {道|みち} を {登|のぼ}って くる {人|ひと} なんて 、 {何年|なんねん} ぶり だろう ね 。 || …Who's that? Years since anyone climbed this road.
!encounter kr.hisae
!set kr_hisae_met
?(kr_hisae_trust) kr_hisae[smile]: …… {久|ひさ}しぶり に 、 {話|はなし} が できた 。 ありがとう よ 。 || …First proper talk I've had in a long while. Thank you.
?(!kr_hisae_trust) kr_hisae: まあ いい 。 {灯|ひ} の {名前|なまえ} を {呼|よ}べる {人|ひと} なら 、 {悪|わる}い {人|ひと} じゃ ない だろう 。 || Well. Anyone who can call a lamp by its name can't be all bad.
!gesture kr_hisae tendlamp
kr_hisae: 「{名|な} は {灯|ひ} に 、 {灯|ひ} は {人|ひと} に 、 {人|ひと} は {名|な} に 。」 …… {灯守|ひもり} の {古|ふる}い {言葉|ことば} さ 。 {芯|しん} を {整|ととの}える と 、 つい {口|くち} に {出|で}る 。 || "A name to the lamp, the lamp to people, people to the name." …An old keepers' saying. It comes out whenever I trim a wick.
?(comp=ren) comp[surprise]: …… その {言葉|ことば} 。 {師匠|ししょう} が {毎晩|まいばん} {言|い}って いた {言葉|ことば} です 。 || …Those words. My teacher said them every night.
?(comp=ren) kr_hisae: そう かい 。 {灯守|ひもり} なら 、 {誰|だれ} でも {知|し}って いる よ 。 {習|なら}った {人|ひと} が いる なら 、 その {人|ひと} も {誰|だれ} か に {習|なら}った の さ 。 || Is that so. Any keeper knows it. If someone taught you, someone taught them too.
?(comp=ren) comp[think]: {師匠|ししょう} だけ の {言葉|ことば} だ と {思|おも}って いました 。 …… {受|う}け{継|つ}がれて きた {言葉|ことば} だった ん です ね 。 {少|すこ}し 、 {不思議|ふしぎ} な {気持|きも}ち です 。 || I thought they were my teacher's own words. …They were handed down. It's a strange feeling.
?(comp=ren) !set kr_ev_saying
kr_hisae: {宿坊|しゅくぼう} の {裏|うら} に 、 {灯守|ひもり} の {書庫|しょこ} の {洞|ほら} が ある 。 {昔|むかし} の {記録|きろく} が 、 {全部|ぜんぶ} そこ に ある よ 。 || Behind the lodge is the keepers' scriptorium, a cave. All the old registers are in there.
kr_hisae: {中|なか} の {灯|ひ} は 、 {決|き}まった {順番|じゅんばん} で {点|つ}けない と 、 {奥|おく} の {戸|と} が {開|あ}かない 。 わたし は …… {一|ひと}つ {目|め} と {最後|さいご} しか 、 もう {覚|おぼ}えて いない 。 || The lights inside must be lit in a set order, or the inner door won't open. I… only remember the first and the last now.
kr_hisae: {尾根|おね} の {碑|ひ} 、 {里|さと} の {子供|こども} の {歌|うた} 、 {絵解|えと}き の {絵巻|えまき} 。 {順番|じゅんばん} は 、 どれ も {少|すこ}し ずつ {違|ちが}う の さ 。 || The ridge's stele, the hamlet children's song, the etoki teller's scroll. Each has the order a little differently.
!call kr.subete
kr_hisae: {頼|たの}み が ある 。 {尾根|おね} の {三|さん} の {宿|やど} の {灯籠|とうろう} に 、 {灯|ひ} を {入|い}れて おくれ 。 {巡礼|じゅんれい} が {道|みち} に {迷|まよ}わない よう に 。 {油|あぶら} は これ を {使|つか}いな 。 || A favour. Light the lanterns at the ridge's third waystation, so the pilgrims don't lose their way. Use this oil.
!quest kr_main 3
!journal ヒサエ に {頼|たの}まれた 。 {尾根|おね} の {三|さん} の {宿|やど} の {灯籠|とうろう} に {灯|ひ} を {入|い}れて 、 {守|まも}ろう 。 || Hisae has asked you to light the lanterns at the ridge's third waystation, and keep them lit.

@scene kr.subete
# C-74: すべて, Protect covering both of you, learned from the keepers' saying.
!if mod_subete -> end
kr_hisae: {灯守|ひもり} に は 、 {古|ふる}い {言葉|ことば} が ある 。 「{灯守|ひもり} は 、 すべて の {灯|ひ} を {守|まも}る 。 {一|ひと}つ も {見捨|みす}てない 。」 || The keepers had an old saying. "A keeper guards every lamp. Not one is left to go out."
kr_hisae: {灯|ひ} だけ じゃ ない 。 {一緒|いっしょ} に {歩|ある}く {者|もの} も 、 すべて だ 。 {守|まも}る なら 、 {自分|じぶん} も {相手|あいて} も {守|まも}りな 。 || Not only lamps. Everyone walking with you, all of them. If you protect, protect yourself and the other one both.
?(comp=nao) comp: すべて を {守|まも}る か 。 …… {欲張|よくば}り な {言葉|ことば} だ が 、 {嫌|きら}い じゃ ない 。 || Protect everyone. …A greedy word, but I don't mind it.
?(comp=mio) comp[smile]: {自分|じぶん} も {相手|あいて} も 。 …… {薬師|くすし} の {心得|こころえ} と 、 {同|おな}じ です ね 。 || Yourself and the other one. …The same as a healer's rule.
?(comp=ren) comp[think]: すべて の {灯|ひ} を 。 …… {灯守|ひもり} の {言葉|ことば} は 、 どれ も {重|おも}い です ね 。 || Every lamp. …Every keepers' saying weighs something.
?(comp=suzu) comp[laugh]: {舞台|ぶたい} の {上|うえ} は 、 {全員|ぜんいん} で {一|ひと}つ よ 。 すべて を {守|まも}る 、 {気|き}に {入|い}った わ 。 || On stage, the whole company is one. Protect everyone: I like it.
!set mod_subete
!teach mod_subete
:end

@scene kr.hisae_idle
!faceplayer
!if quest.kr_main<4 -> lamps
kr_hisae: {洞|ほら} の {灯|ひ} の {順番|じゅんばん} 。 {碑|ひ} と 、 {歌|うた} と 、 {絵巻|えまき} と 、 わたし の {記憶|きおく} 。 {比|くら}べて ごらん 。 {全部|ぜんぶ} が {正|ただ}しい わけ でも 、 {全部|ぜんぶ} が {間違|まちが}い でも ない よ 。 || The order of the cave's lights. The stele, the song, the scroll and my memory. Compare them. They're not all right, and not all wrong.
!end
:lamps
kr_hisae: {尾根|おね} の {灯籠|とうろう} は 、 {夜|よる} に なる と {蛾|が} が {寄|よ}って くる 。 {灯|ひ} を {吸|す}う {蛾|が} さ 。 {気|き}を つけて お{行|い}き 。 || Moths come to the ridge's lanterns at night. Moths that drink the flame. Mind how you go.

@scene kr.hisae_lamp
narr: ヒサエ の {灯|ひ} 。 {三十年|さんじゅうねん} 、 {一晩|ひとばん} も {消|き}えた こと が ない と いう 。 || Hisae's lamp. In thirty years, they say, it has not gone out a single night.

@scene kr.lodge_inscription
!gesture pc read 16,11
narr: {宿坊|しゅくぼう} の {柱|はしら} の {石|いし} に 、 {字|じ} が {彫|ほ}って ある 。 || Characters are cut into a stone pillar of the lodge.
narr: 「{名|な} は {灯|ひ} に 、 {灯|ひ} は {人|ひと} に 、 {人|ひと} は {名|な} に 。」 || "A name to the lamp, the lamp to people, people to the name."
?(comp=ren) comp[smile]: ヒサエ さん の {言葉|ことば} が 、 {石|いし} に も 。 …… {灯守|ひもり} は 、 みんな この {言葉|ことば} と {一緒|いっしょ} に {歩|ある}いた ん です ね 。 || Hisae's words, cut in stone too. …Every keeper walked with these words.
narr: {古|ふる}い {灯守|ひもり} の {言葉|ことば} らしい 。 || An old keepers' saying, it seems.

@scene kr.ruin_lanterns
narr: {崩|くず}れた {三|さん} の {宿|やど} の {灯籠|とうろう} が {二|ふた}つ 。 {暗|くら}い まま だ 。 || Two lanterns at the ruined third waystation, still dark.
?(!kr_hisae_met) narr: {宿坊|しゅくぼう} の {人|ひと} なら 、 この {灯籠|とうろう} の こと を {知|し}って いる かも しれない 。 || Someone at the lodge may know about these lanterns.

@scene kr.moths
# The Wick Moths (E6): the lanterns lit, kept lit while the moths come for the flame. Either ending leads on.
!if kr_moths_done -> end
narr: ヒサエ の {油|あぶら} で 、 {二|ふた}つ の {灯籠|とうろう} に {灯|ひ} を {入|い}れた 。 || With Hisae's oil, you light the two lanterns.
narr: {暗|くら}い {林|はやし} の {奥|おく} から 、 {羽音|はおと} が {近|ちか}づいて くる 。 {灯|ひ} を {吸|す}う {蛾|が} だ 。 || From the dark trees comes a whirr of wings: the moths that drink the flame.
!encounter kr.wick_ridge
!set kr_moths_done
?(kr_moths_kept) narr: {二|ふた}つ の {灯|ひ} は 、 {最後|さいご} まで {消|き}えなかった 。 || Both lights burned to the end.
?(!kr_moths_kept) narr: {一|ひと}つ の {灯|ひ} が {消|き}えた が 、 {名前|なまえ} を {呼|よ}んで {入|い}れ{直|なお}す と 、 また {燃|も}えた 。 || One light went out, but you called it by its name, lit it again, and it burned.
?(comp=ren) comp[smile]: {灯|ひ} は 、 {消|き}えて も また {点|つ}けられます 。 {名前|なまえ} が {残|のこ}って いる かぎり 。 || A light can be lit again even after it goes out. As long as its name is left.
!quest kr_main 4
!journal {尾根|おね} の {灯籠|とうろう} が {点|つ}いた 。 {次|つぎ} は {洞|ほら} の {灯|ひ} の {順番|じゅんばん} 。 {言|い}い{伝|つた}え を {比|くら}べよう 。 || The ridge's lanterns are lit. Next, the order of the cave's lights: weigh the tellings.
:end

@scene kr.cave_go
# The scriptorium's door in the cliff behind the lodge. It opens once the ridge's lanterns are lit.
!if kr_moths_done -> open
narr: {崖|がけ} の {戸|と} 。 {灯守|ひもり} の {書庫|しょこ} の {洞|ほら} だ 。 ヒサエ の {頼|たの}み を {先|さき} に {済|す}ませよう 。 || A door in the cliff: the keepers' scriptorium. See to Hisae's favour first.
!end
:open
narr: {崖|がけ} の {戸|と} を {押|お}す と 、 {冷|つめ}たい {空気|くうき} と {古|ふる}い {紙|かみ} の {匂|にお}い が した 。 || You push the door in the cliff. Cold air, and the smell of old paper.
!warp kr.cave1 14 18 up

@scene kr.lodge_east_dark
narr: {峠|とうげ} へ の {道|みち} は 、 {灯|ひ} が なくて {真|ま}っ{暗|くら} だ 。 {今|いま} {行|い}く の は {危|あぶ}ない 。 || The road on to the pass is pitch dark, with no lanterns lit. Too dangerous now.
!warp kr.lodge 37 18 left

@scene kr.kikyo_lodge
!faceplayer
!if kr_scroll_done -> told
kr_kikyo: {絵巻|えまき} の {字|じ} が 、 {雨|あめ} で {流|なが}れて しまった の 。 {絵|え} は {残|のこ}って いる から 、 {絵|え} に {合|あ}う {言葉|ことば} を {戻|もど}す の を {手伝|てつだ}って くれる ？ || The rain washed the captions off my scroll. The pictures are still there: will you help me put back the words that go with them?
!challenge kr.scroll_captions
!set kr_scroll_done
kr_kikyo[smile]: できた ！ …… では 、 {聞|き}いて ください な 。 {灯守|ひもり} の {見習|みなら}い の {話|はなし} 。 || There! …Now, listen. The tale of the keepers' apprentice.
narr: キキョウ が {絵巻|えまき} を {広|ひろ}げ 、 {指|さ}し{棒|ぼう} で {絵|え} を {指|さ}しながら {語|かた}る 。 || Kikyō unrolls the scroll and tells it, pointing out each picture with her stick.
kr_kikyo: {見習|みなら}い は 、 まず {東|ひがし} の {灯|ひ} を {点|とも}し 、 {次|つぎ} に {泉|いずみ} の {灯|ひ} 、 そして {名|な} の {灯|ひ} 。 {最後|さいご} に {鐘|かね} を {鳴|な}らす と 、 {奥|おく} の {戸|と} が {開|ひら}いた と さ 。 || The apprentice lit the east lamp first, then the spring's, then the name lamp. And when last of all the bell was rung, the inner door opened, so they say.
kr_kikyo: …… {狐|きつね} が {見守|みまも}って いた 、 と いう の は 、 わたし の {師匠|ししょう} が {足|た}した の 。 {子供|こども} が {喜|よろこ}ぶ から って 。 || …The fox watching over them? My teacher added that. Children like it, she said.
?(comp=suzu) comp[laugh]: {分|わ}かる わ 。 {狐|きつね} が {出|で}る と 、 {客席|きゃくせき} が {沸|わ}く の よ 。 || I know just what she means. Bring on a fox and the house goes wild.
!end
:told
kr_kikyo: {絵巻|えまき} の {話|はなし} 、 {洞|ほら} で {役|やく} に {立|た}つ と いい わ ね 。 || I hope the scroll's story is some use in the cave.

@scene kr.kikyo_scroll
!if kr_scroll_done -> read
narr: キキョウ の {絵巻|えまき} 。 {絵|え} は {残|のこ}って いる が 、 {字|じ} が {流|なが}れて いる 。 || Kikyō's scroll. The pictures are there, but the captions have run.
!end
:read
narr: {絵巻|えまき} 。 {見習|みなら}い が {東|ひがし} 、 {泉|いずみ} 、 {名|な} の {灯|ひ} を {点|とも}し 、 {最後|さいご} に {鐘|かね} を {鳴|な}らす 。 {隅|すみ} に {狐|きつね} 。 || The scroll: an apprentice lights the east, spring and name lamps, and last rings the bell. In a corner, a fox.

@scene kr.mokichi
!faceplayer
kr_mokichi: {宿坊|しゅくぼう} の {番|ばん} を して いる モキチ です 。 {番|ばん} と いって も 、 {雨漏|あまも}り を {直|なお}す くらい です が 。 || I'm Mokichi; I look after the lodge. Mostly that means mending the leaks.
kr_mokichi: ヒサエ さん は 、 {人|ひと} の {世話|せわ} に なる の が {嫌|きら}い で ね 。 {食事|しょくじ} を {届|とど}けて も 、 「{灯|ひ} の {番|ばん} が {先|さき} だ」 って ね 。 || Hisae won't let anyone look after her. Bring her food and it's "the lamp comes first".

@scene kr.mokichi_after
!faceplayer
kr_mokichi[happy]: {屋根|やね} を {張|は}る {相談|そうだん} を して いる ん です 。 {巡礼|じゅんれい} の {宿|やど} に しよう と {思|おも}って 。 || We're talking about putting a roof on. A lodging house for pilgrims, we thought.

@scene kr.fuyu
!faceplayer
kr_fuyu: {宿坊|しゅくぼう} は 、 この {部屋|へや} しか {屋根|やね} が ない の 。 {狭|せま}い けど 、 {火|ひ} に あたって いって ね 。 || This room is the only one with a roof. It's small, but come and warm yourselves.
!heal

@scene kr.fuyu_after
!faceplayer
kr_fuyu[smile]: {灯|ひ} が {入|はい}って から 、 {巡礼|じゅんれい} の {人|ひと} が {泊|と}まって いく よう に なった の よ 。 || Since the lanterns came back, pilgrims have started staying the night.
!heal

@scene kr.sora
!faceplayer
kr_sora: ねえ 、 {灯守|ひもり} って 、 {強|つよ}い の ？ ヒサエ ばあちゃん 、 {夜|よる} に {一人|ひとり} で {山|やま} に {入|はい}る ん だ よ 。 || Hey, are keepers strong? Granny Hisae goes up the hill alone at night.

@scene kr.sora_after
!faceplayer
kr_sora[happy]: おれ 、 {灯守|ひもり} に なる ！ ヒサエ ばあちゃん に {名前|なまえ} の {呼|よ}び{方|かた} 、 {教|おそ}わる ん だ ！ || I'm going to be a keeper! Granny Hisae's teaching me how to call the names!

@scene kr.lodge_registers_old
narr: {棚|たな} に 、 {雨|あめ} で {波打|なみう}った {古|ふる}い {帳面|ちょうめん} 。 {宿坊|しゅくぼう} の {毎日|まいにち} の {記録|きろく} だ 。 {最後|さいご} の {頁|ページ} は 、 {三十年|さんじゅうねん} {前|まえ} 。 || On the shelf, old daybooks warped by rain: the lodge's daily records. The last page is thirty years old.

@scene kr.hisae_shelf
narr: ヒサエ の {棚|たな} 。 {油|あぶら} の {壺|つぼ} 、 {芯|しん} の {束|たば} 、 {小|ちい}さな {硯|すずり} が {一|ひと}つ 。 || Hisae's shelf: oil jars, bundles of wicks, and one small inkstone.

@scene kr.hisae_table
narr: {机|つくえ} の {上|うえ} に 、 {書|か}きかけ の {手紙|てがみ} 。 {宛名|あてな} は 、 「{灯守|ひもり} の {皆|みな} さま へ」 。 || On the table, an unfinished letter, addressed "To all the keepers".

@scene kr.hall_first
# The Shuttered Hall (R5's seed): its door stays shut until the postgame (P15). "The hundredth was never told."
!set kr_hall_seen
narr: {尾根|おね} の {上|うえ} に 、 {大|おお}きな {古|ふる}い {館|やかた} が {建|た}って いる 。 {雨戸|あまど} は {全部|ぜんぶ} {閉|し}まって いる 。 || Above the ridge stands a great old hall. Every shutter is closed.
?(comp=ren) comp[think]: {灯守|ひもり} の {館|やかた} …… でしょう か 。 {灯籠|とうろう} が {円|えん} に {並|なら}んで います 。 || A keepers' hall… perhaps. The lanterns stand in a ring.
?(comp=nao) comp: {閉|し}まってる な 。 {宛先|あてさき} の ない {建物|たてもの} だ 。 || Shut up. A building with no address.
?(comp=mio) comp[worry]: {静|しず}か すぎる …… 。 {誰|だれ} も {住|す}んで いない のに 、 {誰|だれ} か が {待|ま}って いる みたい 。 || Too quiet… No one lives here, but it feels like someone's waiting.
?(comp=suzu) comp: {幕|まく} が {下|お}りた まま の {小屋|こや} ね 。 …… {何|なん} の {芝居|しばい} を して いた の かしら 。 || A theatre with its curtain left down. …I wonder what they used to play here.

@scene kr.hall_door
!if hall_ledger -> open
narr: {重|おも}い {戸|と} 。 しめ{縄|なわ} が {張|は}って ある 。 {押|お}して も 、 {動|うご}かない 。 || A heavy door with a sacred rope across it. It won't move.
narr: {戸|と} に {札|ふだ} 。 「{百話目|ひゃくわめ} は 、 {語|かた}られず 。」 || A plaque on the door: "The hundredth was never told."
?(prof=A) narr: 「{語|かた}られず」 は 、 「{語|かた}られなかった」 と いう {意味|いみ} 。 || 語られず means "was not told".
!end
:open
!call hall.door_open

@scene kr.hall_lantern
narr: {館|やかた} の {前|まえ} の {灯籠|とうろう} 。 {名札|なふだ} に は 、 {何|なに} も {彫|ほ}って いない 。 || A lantern before the hall. Its plate has nothing cut on it.

@scene kr.hall_marker
!gesture pc read 11,17
narr: {古|ふる}い {石|いし} 。 「{百物語|ひゃくものがたり} の {館|やかた}」 と だけ {読|よ}める 。 || An old stone. Only "The Hall of a Hundred Tales" can be read.

@scene kr.pass_marker
!gesture pc read 20,13
narr: {峠|とうげ} の {道標|みちしるべ} 。 「{灯落|ひおち} まで {下|くだ}り {一里|いちり}」 || The pass's waystone: "Lanternfall, one ri downhill."

@scene kr.chapter_end
# Dawn at the pass: every lantern on the road lit behind them; Lanternfall's valley below; the companion's resolve
# (S15: the Hush is old; resolve to end it).
!set kr_done
!gesture pc lookroad left
narr: {峠|とうげ} から {振|ふ}り{返|かえ}る と 、 {灯守|ひもり} の {道|みち} の {灯籠|とうろう} が 、 {麓|ふもと} まで {一|ひと}つ {残|のこ}らず {点|つ}いて いた 。 || From the pass you look back: every lantern on the keepers' road is lit, all the way down to the foot.
narr: {前|まえ} に は 、 {灯落|ひおち} の {谷|たに} が {見|み}える 。 || Ahead, Lanternfall's valley.
?(comp=nao) comp: しじま は 、 {俺|おれ} たち が {生|う}まれる {前|まえ} から あった 。 {灯守|ひもり} が {何代|なんだい} も かけて {守|まも}った もの を 、 {黙|だま}って {消|け}して きた 。 || The shijima was here before we were born. It's been quietly putting out what the keepers spent generations keeping.
?(comp=nao) comp[closed]: …… {届|とど}け{先|さき} は 、 {決|き}まった な 。 {終|お}わらせ に {行|い}く ぞ 。 || …Well, that settles where we're delivering. We're going to finish it.
?(comp=mio) comp: {一人|ひとり} で {灯|ひ} を {守|まも}って いた ヒサエ さん 。 {何十年|なんじゅうねん} も 、 {誰|だれ} も {来|こ}ない {道|みち} で 。 || Hisae, keeping her lamp alone. For decades, on a road no one came up.
?(comp=mio) comp[closed]: もう 、 {誰|だれ} も あんな {風|ふう} に {一人|ひとり} に しない 。 …… {終|お}わらせましょう 。 || No one should be left alone like that again. …Let's end this.
?(comp=ren) comp: {灯守|ひもり} は 、 {何百年|なんびゃくねん} も しじま と {向|む}き{合|あ}って きた ん です ね 。 {私|わたし} たち の {前|まえ} に も 、 ずっと 。 || The keepers have faced the shijima for hundreds of years. Long before us.
?(comp=ren) comp[closed]: …… {私|わたし} は 、 その {最後|さいご} の {灯守|ひもり} に は なりません 。 {終|お}わらせる {灯守|ひもり} に なります 。 || …I won't be the last of the keepers. I'll be the one who ends it.
?(comp=suzu) comp: {百年|ひゃくねん} {続|つづ}いた {芝居|しばい} にも 、 {千秋楽|せんしゅうらく} は ある の よ 。 || Even a play that's run a hundred years has a closing night.
?(comp=suzu) comp[closed]: {幕|まく} を {下|お}ろし に {行|い}きましょう 。 …… {今度|こんど} は 、 {私|わたし} たち の {手|て} で 。 || Let's go and bring the curtain down. …With our own hands, this time.
!quest kr_main done
!journal {灯守|ひもり} の {道|みち} に 、 {灯|ひ} が {戻|もど}った 。 しじま は 、 {思|おも}って いた より ずっと {古|ふる}い 。 {灯落|ひおち} へ {下|くだ}ろう 。 || The keepers' road is lit again. The shijima is far older than anyone thought. On down to Lanternfall.
!autosave
`, 'kr/lodge');

RB.script.add(`
@scene kr.toro_ridge
narr: {尾根|おね} の {端|はし} の {灯籠|とうろう} 。 {名札|なふだ} は 「{尾根|おね} の {灯|ひ}」 。 {火袋|ひぶくろ} に は 、 {古|ふる}い {煤|すす} だけ が {残|のこ}って いる 。 || A lantern at the end of the ridge. Its plate reads "the Ridge Light". Only old soot is left in its fire box.
?(comp=ren) comp[closed]: …… 。 || ……

@scene kr.toro_fern
narr: 「{羊歯|しだ} の {灯|ひ}」 。 {苔|こけ} の {間|あいだ} から 、 {灯|ひ} が もれて いる 。 || "The Fern Light". Light leaks out between the moss.
`, 'kr/lodge2');
