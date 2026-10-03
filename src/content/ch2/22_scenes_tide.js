/* Chapter 2 main quest, act 3: the tide-watcher, the windless fog, the
 * lighthouse vane (かぜ) and the causeway. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene sg.shiori_early
shiori: いらっしゃいませ 。 {潮見|しおみ} の シオリ です 。 {潮|しお} の {時間|じかん} なら 、 {何|なん} でも {聞|き}いて ください 。 || Welcome. I'm Shiori, the tide-watcher. Ask me anything about the tides.
shiori: {嵐|あらし} の {後|あと} 、 {港|みなと} の {板|いた} の {字|じ} は {動|うご}く よう に なりました が 、 {私|わたし} の {帳面|ちょうめん} の {字|じ} は {動|うご}きません 。 {不思議|ふしぎ} です ね 。 || Since the storm, the writing on the harbour boards has started to move — but the writing in my notebooks hasn't. Strange, isn't it.
shiori[think]: {毎日|まいにち} {読|よ}み{返|かえ}して いる から かも しれません 。 {読|よ}まれない {字|じ} から 、 {消|き}えて いく の かも 。 || Perhaps because I read them back every day. Perhaps it's the writing nobody reads that fades first.

@scene sg.shiori_mid
shiori: {港|みなと} の {騒|さわ}ぎ 、 {聞|き}いて います 。 {潮|しお} は {嘘|うそ} を つきません が 、 {人|ひと} は {時々|ときどき} つきます から ね 。 || I've heard about the fuss in the harbour. The tide never lies — but people sometimes do.
?(quest.sg_main=4) shiori: ワタル さん は 、 {毎朝|まいあさ} {潮|しお} の {時間|じかん} を {聞|き}きに {来|き}ます 。 {真面目|まじめ} な {人|ひと} です よ 。 {真面目|まじめ} すぎて 、 {困|こま}る {人|ひと} です 。 || Wataru comes every morning to ask the tide times. He's a conscientious man. Too conscientious for his own good.

@scene sg.shiori_tide
# Staged: Shiori looks up at "the branch"; she points to the telescope that looks out to the island, opens
# a hand for the sand road, and points to the tide table on the wall (you look at it); a nod when you read
# it right; an open hand for "it goes out again tomorrow", and the table pointed out again if you need it.
!if sg_tide_read -> askwait
shiori: いらっしゃいませ 。 {今日|きょう} の {潮|しお} を {聞|き}きに いらっしゃった の です か 。 || Welcome. Have you come to ask about today's tide?
pc: {沖|おき} の {分室|ぶんしつ} の こと を {聞|き}きたくて 。 || We wanted to ask about the offshore branch.
!gesture shiori listen pc
shiori[surprise]: …… {沈|しず}んだ {書庫|しょこ} を 「{分室|ぶんしつ}」 と {呼|よ}ぶ {人|ひと} に は 、 {初|はじ}めて {会|あ}いました 。 || …I've never met anyone who calls the drowned archive "the branch".
!gesture shiori point 7,2
shiori: {岬|みさき} の {沖|おき} の {小島|こじま} です 。 {八十年|はちじゅうねん} {前|まえ} の {高潮|たかしお} で {沈|しず}んで 、 それ から は {誰|だれ} も {近|ちか}づきません 。 || It's the little island off the point. It sank in a storm surge eighty years ago, and no one has gone near it since.
!look shiori pc
!gesture shiori palm pc
shiori: でも 、 {大潮|おおしお} の {引|ひ}き{潮|しお} の {日|ひ} だけ 、 {岬|みさき} から {島|しま} まで {砂|すな} の {道|みち} が {現|あらわ}れます 。 {今日|きょう} が その {日|ひ} です 。 || But on the lowest tides of the month, a sand road appears from the point to the island. Today is one of those days.
!gesture shiori point 1,2
!gesture pc listen 1,2
shiori: {表|ひょう} を {見|み}て みましょう か 。 {時間|じかん} を {間違|まちが}える と 、 {帰|かえ}り の {道|みち} が {海|うみ} の {下|した} です よ 。 || Shall we look at the table? Get the time wrong and your road home will be under the sea.
!note sg_tide_words
!teach mae_ato
!lesson kana
!challenge sg.c_tidetable
!if var._res=0 -> later
!set sg_tide_read
!look pc shiori
!look shiori pc
!gesture shiori nod pc
shiori[smile]: {正確|せいかく} です 。 {引|ひ}き{潮|しお} まで 、 あと {二時間|にじかん} ほど 。 ここ で お{待|ま}ち に なります か 。 {港|みなと} で {用事|ようじ} を {済|す}ませて きて も {構|かま}いません よ 。 || Exactly right. About two hours until low tide. Will you wait here? You're welcome to finish your business in the harbour and come back.
:askwait
!choice
* ここ で {待|ま}ちます 。 || We'll wait here. -> wait
* {後|あと} で {来|き}ます 。 || We'll come back later. -> laterwait
:wait
!call sg.tide_wait
!end
:laterwait
!gesture shiori palm pc
shiori: {岬|みさき} の {道|みち} は {逃|に}げません 。 {潮|しお} は {待|ま}って くれません が 、 {明日|あした} も また {引|ひ}きます から 。 || The causeway won't run away. The tide won't wait for you — but it goes out again tomorrow.
!end
:later
!look pc shiori
!gesture shiori point 1,2
shiori: {表|ひょう} は 、 いつでも ここ に あります 。 || The table's always here.
shiori: {急|いそ}がなくて いい です よ 。 {知|し}らない {言葉|ことば} は 、 {言葉|ことば} の {手助|てだす}け で {読|よ}み{方|かた} と {意味|いみ} が {分|わ}かります 。 || There's no hurry. If a word is new, word help will give you its reading and meaning.

@scene sg.tide_wait
# the wait is seen from Shiori's window: the tide goes out over the lines (src/ui/42b_interlude_tide.js)
!fade out
!interlude tide_wait wait
!fade in 600
narr: シオリ の {淹|い}れた {薄|うす}い お{茶|ちゃ} を {飲|の}みながら 、 {潮|しお} が {引|ひ}く の を {待|ま}った 。 || You wait for the tide to go out, drinking the weak tea Shiori makes.
?(comp=mio) narr: ミオ は 、 シオリ の {棚|たな} の {貝殻|かいがら} を {大|おお}きさ の {順|じゅん} に {並|なら}べ{直|なお}して いた 。 || Mio rearranges the shells on Shiori's shelf in order of size.
?(comp=ren) narr: レン は シオリ と 、 {潮|しお} の {記録|きろく} の {付|つ}け{方|かた} に ついて {熱心|ねっしん} に {話|はな}し{込|こ}んで いた 。 || Ren and Shiori talk earnestly about how to keep tide records.
?(comp=nao) narr: ナオ は {窓|まど} の {外|そと} を {見|み}て いた 。 {時々|ときどき} 、 {丘|おか} の {上|うえ} の {家|いえ} の ほう を 。 || Nao watches out of the window. Now and then, towards a house on the hill.
?(comp=suzu) narr: スズ は シオリ に カード の {手品|てじな} を {見|み}せて 、 {三回|さんかい} {種|たね} を {見破|みやぶ}られた 。 || Suzu shows Shiori a card trick and has it seen through three times.
!set sg_tide_low
!interlude tide_wait road
shiori: {時間|じかん} です 。 {窓|まど} を ご{覧|らん} ください 。 || It's time. Look out of the window.
narr: {岬|みさき} の {先|さき} から 、 {白|しろ}い {砂|すな} の {道|みち} が {海|うみ} に {伸|の}びて いる 。 {島|しま} まで 、 まっすぐ に 。 || From the tip of the point, a white sand road runs out across the sea, straight to the island.
!interlude tide_wait fog
narr: …… その {道|みち} の {上|うえ} に だけ 、 {真|ま}っ{白|しろ} な {霧|きり} が {座|すわ}って いた 。 || …And over that road, and only there, sits a thick white fog.
!fade out
!interlude -
!fade in
shiori[worry]: {霧|きり} …… 。 {嵐|あらし} の {後|あと} 、 ずっと {風|かぜ} が {止|や}んで いる の です 。 {風|かぜ} の ない {霧|きり} は 、 {晴|は}れません 。 || Fog… Ever since the storm the wind has dropped. Windless fog doesn't lift.
shiori: {霧|きり} の {中|なか} を {歩|ある}いた {人|ひと} は 、 みんな {岬|みさき} に {戻|もど}って きます 。 {前|まえ} に {進|すす}んだ はず なのに 、 と {言|い}って 。 || Everyone who walks into that fog comes back to the point — saying they were sure they'd walked forward.
shiori[think]: {風|かぜ} の こと なら 、 {灯台|とうだい} の ゲンゾウ さん です 。 {岬|みさき} の {風|かぜ} を 、 {五十年|ごじゅうねん} {見|み}て きた {人|ひと} です から 。 || If it's the wind you need, ask Genzō at the lighthouse. He's watched the winds on this point for fifty years.
!quest sg_main 6
!autosave

@scene sg.shiori_fog
# Staged: Shiori points out towards the lighthouse; with Ren, they look from one wall to the other for the tip
# of the point, and she points them out of the window to the tallest building.
!gesture shiori point left
shiori: {霧|きり} は まだ {座|すわ}って います 。 {風|かぜ} の こと は 、 ゲンゾウ さん に 。 || The fog is still sitting there. Ask Genzō about the wind.
?(comp=ren) !gesture comp lookbetween left and=right
?(comp=ren) comp: {灯台|とうだい} は {岬|みさき} の {先|さき} です 。 …… {岬|みさき} の {先|さき} は 、 どちら でしょう 。 || The lighthouse is at the tip of the point. …Which way is the tip of the point?
?(comp=ren) !look shiori comp
?(comp=ren) !gesture shiori point 7,2
?(comp=ren) shiori[smile]: {窓|まど} の {外|そと} の 、 {一番|いちばん} {高|たか}い {建物|たてもの} です よ 。 || The tallest building outside the window.

@scene sg.shiori_causeway
shiori: {今日|きょう} の {引|ひ}き{潮|しお} は {長|なが}い です 。 {日暮|ひぐ}れ まで は {大丈夫|だいじょうぶ} 。 それ でも 、 {無理|むり} は しないで ください ね 。 || Today's low tide is a long one. You're safe until sunset. Even so, don't push yourselves.
shiori: {書庫|しょこ} の {中|なか} で {迷|まよ}ったら 、 {乾|かわ}いた {部屋|へや} を {探|さが}して 。 {昔|むかし} の {図面|ずめん} で は 、 {上|うえ} の {階|かい} に {閲覧室|えつらんしつ} が ありました 。 || If you get lost inside the archive, look for a dry room. On the old plans, there was a reading room on the upper level.

@scene sg.shiori_after
shiori: {帳面|ちょうめん} の {字|じ} も 、 {板|いた} の {字|じ} も 、 {今|いま} は {落|お}ち{着|つ}いて います 。 {潮|しお} と {同|おな}じ よう に 。 || The writing in my notebooks and on the boards has settled now. Like the tide.
shiori[think]: {沈|しず}んだ {書庫|しょこ} の {図面|ずめん} を 、 {書|か}き{直|なお}そう と {思|おも}います 。 {次|つぎ} に {迷|まよ}う {人|ひと} の ため に 。 || I think I'll redraw the plans of the drowned archive. For the next person who gets lost there.

@scene sg.tideboard
narr: {潮|しお} の {表|ひょう} 。 {白墨|はくぼく} で {丁寧|ていねい} に {書|か}いて ある 。 || The tide table, carefully written in chalk.
narr: 「{満潮|まんちょう} {午前|ごぜん} {九時|くじ} ・ {干潮|かんちょう} {午後|ごご} {三時|さんじ} {十五分|じゅうごふん}」 。 {字|じ} は {動|うご}かない 。 || "High tide 9:00 a.m. — Low tide 3:15 p.m." The writing doesn't move.

@scene sg.tidepost
narr: {外|そと} の {潮見|しおみ} の {板|いた} 。 {波|なみ} の {線|せん} が {描|か}いて ある 。 {時刻|じこく} の {所|ところ} は {空白|くうはく} だ 。 || The tide board outside. A wavy line is painted on it, but the times are blank.
narr: {下|した} に {小|ちい}さく 「{正|ただ}しい {時刻|じこく} は {中|なか} で 」 。 || Underneath, in small letters: "For the correct times, ask inside."

@scene sg.tide_desk
narr: {潮|しお} の {帳面|ちょうめん} が {何十冊|なんじっさつ} も {積|つ}んで ある 。 {一番|いちばん} {古|ふる}い {帳面|ちょうめん} は 、 {表紙|ひょうし} が {塩|しお} で {白|しろ}い 。 || Dozens of tide notebooks are stacked here. The oldest has a cover gone white with salt.
?(quest.sg_main>=5) narr: {古|ふる}い {帳面|ちょうめん} の {余白|よはく} に 、 {誰|だれ} か の {字|じ} 。 「{島|しま} の {鐘|かね} 、 {今日|きょう} も {鳴|な}らず 」 。 || In the margin of an old notebook, someone has written: "The island bell did not ring today either."

@scene sg.tide_scope
narr: {望遠鏡|ぼうえんきょう} を {覗|のぞ}く 。 {沖|おき} の {小島|こじま} が {見|み}える 。 {崖|がけ} に 、 {石|いし} の {門|もん} の よう な もの 。 || You look through the telescope. The little island offshore. In its cliff, something like a stone gateway.

@scene sg.causeway_water
narr: {岬|みさき} の {先|さき} の {海|うみ} 。 {満|み}ち{潮|しお} で 、 {道|みち} は {水|みず} の {下|した} だ 。 || The sea off the tip of the point. The tide is in; any road is underwater.
?(quest.sg_main>=5) narr: {潮|しお} の {時間|じかん} は 、 {潮見|しおみ}{小屋|ごや} の シオリ に {聞|き}こう 。 || Ask Shiori at the tide-watch hut about the tide times.

@scene sg.causeway_marker
narr: {石|いし} の {道標|みちしるべ} 。 「{満|み}ち{潮|しお} に {注意|ちゅうい} ・ {子供|こども} は {岬|みさき} より {先|さき} へ {行|い}かない こと」 。 || A stone marker: "Beware the rising tide. Children must not go past the point."
?(comp=suzu) comp[smirk]: {大人|おとな} で よかった わ 。 || Lucky we're grown-ups.

@scene sg.causeway_fog
# Staged: in the fog you look down at the sand at your feet; back at the marker, your companion's own
# reaction (Nao looks back down at the causeway, Mio looks between the ways, Ren pushes their glasses up, Suzu
# shrugs); you look to the lighthouse when the way to the wind is Genzō.
!gesture pc observe down
narr: {霧|きり} の {中|なか} へ {踏|ふ}み{込|こ}む 。 {足元|あしもと} の {砂|すな} しか {見|み}えない 。 || You step into the fog. You can see nothing but the sand at your feet.
narr: {真|ま}っすぐ {歩|ある}いた 。 {確|たし}か に {真|ま}っすぐ 。 …… {霧|きり} が {途切|とぎ}れる と 、 {岬|みさき} の {石|いし} の {道標|みちしるべ} が {目|め} の {前|まえ} に あった 。 || You walk straight ahead. Definitely straight. …When the fog parts, the stone marker on the point is right in front of you.
!warp sg.harbor 9 33 up
?(comp=nao) !gesture comp lookroad down
?(comp=mio) !gesture comp lookbetween down and=up
?(comp=ren) !gesture comp glasses
?(comp=suzu) !gesture comp shrug
?(comp=nao) comp[angry]: …… {道|みち} に {嘘|うそ} を つかれる の は 、 これ で {二度目|にどめ} だ 。 || …Second time a road's lied to me.
?(comp=mio) comp[worry]: {方角|ほうがく} が 、 {分|わ}からなく なる 。 {風|かぜ} さえ {吹|ふ}けば …… 。 || You lose all sense of direction. If only the wind would blow…
?(comp=ren) comp[shy]: {私|わたし} の せい では ありません 。 …… {念|ねん}のため 、 {言|い}って おきます 。 || That wasn't my fault. …Just so it's on record.
?(comp=suzu) comp: {舞台|ぶたい} に {上|あ}がった つもり が 、 {楽屋|がくや} に {戻|もど}されてた わ 。 || I thought I was stepping on stage and found myself back in the dressing room.
?(quest.sg_main=6) !look pc 2,31
?(quest.sg_main=6) narr: {灯台|とうだい} の ゲンゾウ に 、 {風|かぜ} の こと を {聞|き}こう 。 || Ask Genzō at the lighthouse about the wind.

@scene sg.genzo_wind
# Staged: Genzō shakes his head over the dead wind and points to the stairs up to the vane, a nod: come on;
# at the top (your companion beside you, not under the dialogue box on this small roof) you lean in to the
# still vane, and he points to the letters his father cut; your companion's
# own answer (Ren's and Suzu's open hand, Nao's nod, Mio's hand to her chest); he looks you over: can you
# write it? You step to the vane's side to write the word on its fin (side-on, so the brush shows); you look
# out at the fog coming apart; he turns to the vane as it moves, and his small celebration; your companion's
# own delight (Mio's hand to her blown hair, Suzu's celebration, Nao's and Ren's nods).
!if sg_genzo_up -> ask
!gesture genzo shake
genzo: {風|かぜ} ？ …… {止|や}んでる な 。 {嵐|あらし} の {晩|ばん} から 、 ぴたり と だ 。 || The wind? …It's dropped. Dead since the night of the storm.
!gesture genzo point 1,2
genzo: {五十年|ごじゅうねん} 、 {岬|みさき} で {風|かぜ} が {止|や}んだ こと は ない 。 {凪|なぎ} の {日|ひ} でも 、 {上|うえ} の {風見|かざみ} は {回|まわ}ってた 。 || Fifty years, and the wind's never stopped on this point. Even on a calm day, the vane up top would turn.
!look genzo pc
!gesture genzo nod pc
genzo[think]: {来|き}な 。 {上|うえ} を {見|み}せて やる 。 || Come on. I'll show you the top.
!fade out
!set sg_genzo_up
narr: {螺旋|らせん} {階段|かいだん} を {上|のぼ}る 。 ゲンゾウ は {膝|ひざ} を {叩|たた}きながら 、 {一段|いちだん} ずつ {上|のぼ}った 。 || You climb the spiral stairs. Genzō goes up one step at a time, slapping his knee.
!warp sg.lighthouse_top 8 5 up
!walkto comp 6 5 up now
!fade in
!gesture pc observe 8,4 hold
narr: {灯台|とうだい} の {上|うえ} 。 {鉄|てつ} の {風見|かざみ} が 、 {錆|さ}び{付|つ}いた よう に {止|と}まって いる 。 {風見|かざみ} の {羽|はね} に 、 {文字|もじ} が {彫|ほ}って ある 。 || The top of the lighthouse. The iron weather vane stands still, as if rusted solid. Letters are cut into its fin.
narr: …… いや 、 {彫|ほ}って あった 。 {溝|みぞ} は ある のに 、 {字|じ} の {形|かたち} が {分|わ}からない 。 || …Or rather, were cut. The grooves are there, but you can't make out the shape of the letters.
!look pc genzo
!gesture genzo point 8,4
genzo: {親父|おやじ} が {彫|ほ}った ん だ 。 「{風|かぜ}」 って {字|じ} を な 。 {風|かぜ} の {名前|なまえ} を {書|か}いて おけば 、 {風|かぜ} は {岬|みさき} を {忘|わす}れない 、 って な 。 …… {迷信|めいしん} だ よ 。 || My father carved it. The word "wind". Write the wind's name, he said, and the wind won't forget the point. …Superstition.
?(comp=ren) !gesture comp palm genzo
?(comp=nao) !gesture comp nod genzo
?(comp=mio) !gesture comp guard
?(comp=suzu) !gesture comp palm genzo
?(comp=ren) comp: {迷信|めいしん} …… かも しれません 。 でも 、 {灯|ひ} の {道|みち} の {灯籠|とうろう} も 、 {同|おな}じ {理屈|りくつ} で {立|た}って います 。 || Superstition… perhaps. But the lanterns on the lantern roads stand on the same reasoning.
?(comp=nao) comp: {宛名|あてな} と {同|おな}じ だ 。 {名前|なまえ} が {消|き}えたら 、 {届|とど}く もの も {届|とど}かない 。 || Same as an address. When the name goes, nothing arrives.
?(comp=mio) comp: {葦|あし}ノ{瀬|せ} の {灯籠|とうろう} と {同|おな}じ ね 。 {名前|なまえ} が {消|き}えたら 、 {繋|つな}がり も {消|き}える 。 || Like the lanterns in Reedwake. When the name fades, the connection fades too.
?(comp=suzu) comp: {役|やく} の {名前|なまえ} を {忘|わす}れた {役者|やくしゃ} は 、 {舞台|ぶたい} に {出|で}られない もの ね 。 || An actor who forgets the name of their part can't go on stage.
:ask
!look genzo pc
!gesture genzo observe pc
genzo: {書|か}ける の か 。 お{前|まえ} さん 。 || Can you write it? You?
!challenge sg.c_kaze
!if var._res=0 -> later
!walkto pc 7 4 right
!gesture pc write
narr: {溝|みぞ} を なぞる よう に 、 {筆|ふで} を {動|うご}かす 。 「{風|かぜ}」 。 || You move the brush as if tracing the grooves. Kaze — wind.
!sfx wind
!set sg_fog_cleared
narr: {風見|かざみ} が 、 きい 、 と {鳴|な}った 。 || The vane creaks.
!gesture pc lookroad down
narr: {沖|おき} から 、 {冷|つめ}たい {風|かぜ} が {吹|ふ}いて きた 。 {岬|みさき} の {霧|きり} が 、 {端|はし} から ほどけて いく 。 || A cold wind comes in off the sea. The fog on the causeway begins to unravel from its edges.
!word kaze
!gesture genzo listen 8,4
genzo[surprise]: …… {回|まわ}った 。 || …It turned.
!gesture genzo celebrate
genzo[smile]: ふん 。 {迷信|めいしん} も 、 {馬鹿|ばか} に できん な 。 || Hmph. Can't sneer at superstition, it seems.
?(comp=nao) !gesture comp nod pc
?(comp=mio) !gesture comp touchhair
?(comp=ren) !gesture comp nod genzo
?(comp=suzu) !gesture comp celebrate
?(comp=nao) comp[smile]: {字|じ} で {風|かぜ} が {吹|ふ}く の か 。 …… {今|いま} の 、 {手帳|てちょう} に {書|か}いとこ 。 || Writing that makes the wind blow. …I'm putting that in my notebook.
?(comp=mio) comp[laugh]: {髪|かみ} が ぐちゃぐちゃ ！ …… でも 、 いい {風|かぜ} ！ || My hair's a mess! …But what a lovely wind!
?(comp=ren) comp[smile]: {名|な} を {書|か}けば 、 {風|かぜ} は {岬|みさき} を {思|おも}い{出|だ}す 。 …… {灯守|ひもり} の {教|おし}え と {同|おな}じ です 。 || Write its name, and the wind remembers the point. …It's what keepers are taught, too.
?(comp=suzu) comp[laugh]: {拍手|はくしゅ} ！ {今日|きょう} {一番|いちばん} の {見|み}せ{場|ば} ね ！ || Applause! Best moment of the day!
!quest sg_main 7
!journal {霧|きり} が {晴|は}れた 。 {岬|みさき} の {道|みち} を {渡|わた}ろう 。 || The fog has lifted. Cross the causeway south of the point.
!autosave
!end
:later
!gesture genzo nod pc
genzo: {気|き} が {向|む}いたら {言|い}え 。 {階段|かいだん} は {逃|に}げん 。 || Tell me when you're ready. The stairs aren't going anywhere.

@scene sg.genzo_top
genzo: {風見|かざみ} が {回|まわ}って いる と 、 {落|お}ち{着|つ}く 。 || It settles me, seeing the vane turn.
genzo: {下|お}りる とき は 、 {一緒|いっしょ} に {行|い}く 。 {膝|ひざ} が {文句|もんく} を {言|い}う が な 。 || When you go down, I'll come with you. My knees will grumble, mind.

@scene sg.lt_vane
!if sg_fog_cleared -> free
narr: {鉄|てつ} の {風見|かざみ} 。 {錆|さ}び{付|つ}いた よう に 、 {少|すこ}し も {動|うご}かない 。 || The iron weather vane. It doesn't move at all, as if rusted solid.
narr: {羽|はね} に {溝|みぞ} が {彫|ほ}って ある 。 でも 、 {字|じ} の {形|かたち} が {分|わ}からない 。 || Grooves are cut into its fin, but you can't make out the shape of the letter.
!end
:free
narr: {風見|かざみ} が 、 {海|うみ} から の {風|かぜ} に {揺|ゆ}れて いる 。 || The vane swings in the wind off the sea.
narr: {羽|はね} の {溝|みぞ} は 、 はっきり 「{風|かぜ}」 と {読|よ}める 。 || The grooves in its fin read clearly: 「風」, kaze, wind.

@scene sg.lt_view
narr: {手摺|てす}り の {向|む}こう 、 ずっと {下|した} に 、 {岬|みさき} と {港|みなと} が {見|み}える 。 || Beyond the railing, far below, you can see the point and the harbour.
?(!sg_fog_cleared) narr: {岬|みさき} から {島|しま} へ {続|つづ}く {砂|すな} の {道|みち} 。 その {上|うえ} に だけ 、 {白|しろ}い {霧|きり} が {座|すわ}って いる 。 || The sand road from the point to the island. Over it, and only there, sits a white fog.
?(!sg_fog_cleared) narr: {風|かぜ} が ない 。 {海|うみ} も {霧|きり} も 、 {少|すこ}し も {動|うご}かない 。 || There is no wind. Neither the sea nor the fog moves at all.
?(sg_fog_cleared) narr: {霧|きり} は もう ない 。 {砂|すな} の {道|みち} が 、 {島|しま} まで まっすぐ に {見|み}える 。 || The fog is gone. You can see the sand road running straight to the island.
?(sg_fog_cleared) narr: {海|うみ} の {上|うえ} に 、 {白|しろ}い {波|なみ} が {小|ちい}さく {立|た}って いる 。 || Small white waves are breaking out on the sea.

@scene sg.lt_rail
narr: {手摺|てす}り の {塗|ぬ}り が 、 ここ だけ {剥|は}げて いる 。 {鉄|てつ} が {光|ひか}る ほど 、 {擦|す}り{減|へ}って いる 。 || The paint on the railing has worn away here, and only here. The iron is rubbed so smooth it shines.
narr: {五十年|ごじゅうねん} 、 {毎晩|まいばん} 、 {同|おな}じ {所|ところ} を {握|にぎ}って {上|のぼ}って きた {手|て} の {跡|あと} だ 。 || The mark of a hand that has gripped this same spot, coming up every night for fifty years.
?(sg_genzo_up) genzo: …… {手摺|てす}り なんか {見|み}る な 。 || …Don't go looking at the railing.

@scene sg.lt_lamp
narr: {灯室|とうしつ} 。 ガラス の {中|なか} に 、 {人|ひと} より {大|おお}きな レンズ が ある 。 || The lamp room. Inside the glass stands a lens taller than a person.
narr: {昼間|ひるま} は {灯|ひ} を {消|け}して いる 。 レンズ は 、 {日|ひ} の {光|ひかり} だけ を {集|あつ}めて {光|ひか}って いた 。 || By day the lamp is out. The lens shines with nothing but the sunlight it gathers.

@scene sg.causeway_walk
# Staged: you look out along the sand road; your companion's own answer (Nao looks back up to the harbour
# for the time, Mio bends to the shells, Ren looks along the road, Suzu's showman's hands); you look ahead to
# the doorway in the cliff.
!gesture pc lookroad down
narr: {濡|ぬ}れた {砂|すな} の {道|みち} が 、 {島|しま} へ {続|つづ}いて いる 。 {両側|りょうがわ} で 、 {引|ひ}いた {海|うみ} が {静|しず}か に {光|ひか}って いた 。 || The wet sand road runs on to the island. On either side, the drawn-back sea glints quietly.
?(comp=nao) !gesture comp lookroad up
?(comp=mio) !gesture comp bend
?(comp=ren) !gesture comp lookroad down
?(comp=suzu) !gesture comp size
?(comp=nao) comp: {帰|かえ}り の {時間|じかん} 、 {覚|おぼ}えてる ？ {満|み}ち{潮|しお} に {追|お}いつかれたら 、 {泳|およ}ぐ こと に なる ぞ 。 || You remember when we have to be back? If the tide catches us, we'll be swimming.
?(comp=mio) comp: {貝|かい} が いっぱい 。 …… {拾|ひろ}う の は 、 {帰|かえ}り に しよう ね 。 || So many shells. …We'll pick them up on the way back.
?(comp=ren) comp: {海|うみ} の {真|ま}ん{中|なか} を {歩|ある}く {道|みち} 。 {記録|きろく} で は {読|よ}んで いました が 、 {本当|ほんとう} に ある の です ね 。 || A road through the middle of the sea. I'd read about them in the records, but they really exist.
?(comp=suzu) comp: {花道|はなみち} ね 。 {客|きゃく} は カモメ と カニ だけ だ けど 。 || A runway to the stage. Though the audience is only gulls and crabs.
!look pc 8,41
narr: {島|しま} の {崖|がけ} に 、 {石|いし} の {門|もん} が {口|くち} を {開|あ}けて いる 。 || In the island's cliff, a stone doorway gapes open.
`, 'ch2/22_scenes_tide');
