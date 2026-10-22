/* Steamhollow, Chapter 11: the Steam Vents and the Kettle Below (expansion P13d; docs/future/work/P13_STEAMHOLLOW.md;
 * maps in 11_vents.js). The valves and the shutter (connected airflow: open one and the steam goes elsewhere, A11), the
 * hot pools (a little rest each, then cool, D2), the water clock's float jammed in silt (why the division drifted), Aki
 * at work in the deep vents (a wanderer, E3), and the Kettle Below (釜の主): frightened rather than angry, pressed from
 * above by the town's quarrel and from the ridge by the silence; settled, never defeated (S4; its encounter in
 * 33_creatures.js). Then the evening: the town rests before the mediation (27_scenes_comp.js has each companion's).
 * Suzu's lines have Kansai versions (kansai_99_yn.js). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene yn.vents1_first
!set yn_vents1_seen
narr: {熱|あつ}い {空気|くうき} 。 {岩|いわ} の {壁|かべ} から {鉄|てつ} の {管|くだ} が {突|つ}き{出|で}て いて 、 {先|さき} に {弁|べん} の {輪|わ} が {付|つ}いて いる 。 {奥|おく} の {通|とお}り{道|みち} は 、 {湯気|ゆげ} で {真|ま}っ{白|しろ} だ 。 || Hot air. Iron pipes stick out of the rock walls, each with a valve wheel on the end. The passages beyond are white with steam.
?(comp=nao) comp: {出口|でぐち} は {後|うし}ろ の {石段|いしだん} {一|ひと}つ 。 …… {覚|おぼ}えた 。 || One way out: the steps behind us. …Noted.
?(comp=mio) comp[worry]: {湯気|ゆげ} を {吸|す}いすぎない で 。 {苦|くる}しく なったら 、 すぐ {言|い}って ください 。 || Don't breathe in too much steam. If it gets hard to breathe, say so at once.
?(comp=ren) comp[think]: {湯気|ゆげ} の {通|とお}り{道|みち} …… 。 {風|かぜ} が {一方|いっぽう} に {抜|ぬ}ければ 、 {別|べつ} の {方|ほう} は {詰|つ}まる 。 || The steam's way up… If the air goes out one way, the other way chokes.
?(comp=suzu) comp[smirk]: {舞台|ぶたい} の {煙|けむり} の {仕掛|しか}け と {同|おな}じ ね 。 どこ か を {開|あ}ければ 、 どこ か が {煙|けむ}る 。 || Like the smoke effects under a stage. Open one somewhere, and somewhere else fills with smoke.

@scene yn.vents_notice
# The bath-keepers' notice by the stair: how the valves work, in plain instructions (read it, A11).
narr: {湯守|ゆもり} の {古|ふる}い {張|は}り{紙|がみ} 。 || An old bath-keepers' notice.
narr: 「{弁|べん} は 、 {一度|いちど} に {一|ひと}つ だけ {開|あ}ける こと 。 {一|ひと}つ {開|あ}ける と 、 {湯気|ゆげ} は {別|べつ} の {道|みち} に {流|なが}れる 。 {奥|おく} の {弁|べん} の {取|と}っ{手|て} は 、 {道具置|どうぐお}き に ある 。」 || "Open only one valve at a time. Open one, and the steam flows into another passage. The far valve's handle is kept in the tool nook."
!if yn_vents_notice -> end
!challenge yn.vents_notice
!set yn_vents_notice
:end

@scene yn.valve1
# The near valve: open, the passage to the tool nook clears and the steam goes into the pool's passage; shut again, the
# reverse. Opening it shuts the far valve (one at a time).
!if yn_vent1 -> shut
narr: {手前|てまえ} の {弁|べん} を {回|まわ}す 。 {管|くだ} の {先|さき} から 、 {湯気|ゆげ} が {勢|いきお}い よく {噴|ふ}き{出|だ}した 。 || You turn the near valve. Steam jets from the end of the pipe.
!set yn_vent1
!unset yn_vent2
!sfx wind
narr: {東|ひがし} の {通|とお}り{道|みち} の {湯気|ゆげ} が {引|ひ}いて いく 。 …… {代|か}わり に 、 {西|にし} の {湯溜|ゆだ}まり へ の {道|みち} が 、 {白|しろ}く {埋|う}まった 。 || The steam in the east passage draws back. …And in its place, the way west to the hot pool fills with white.
!refresh
!end
:shut
narr: {手前|てまえ} の {弁|べん} を {閉|し}める 。 {湯気|ゆげ} は {元|もと} の {道|みち} へ {戻|もど}った 。 || You close the near valve. The steam goes back the way it was.
!unset yn_vent1
!refresh

@scene yn.valve2
!if !yn_handle_taken -> nohandle
!if yn_vent2 -> shut
narr: {取|と}っ{手|て} を {差|さ}し{込|こ}んで 、 {奥|おく} の {弁|べん} を {回|まわ}す 。 {手前|てまえ} の {弁|べん} は 、 {自然|しぜん} に {閉|し}まった 。 || You fit the handle and turn the far valve. The near one closes of its own accord.
!set yn_vent2
!unset yn_vent1
!sfx wind
narr: {北|きた} の {石段|いしだん} の {湯気|ゆげ} が {晴|は}れて いく 。 {下|した} へ {降|お}りる {道|みち} が {見|み}えた 。 || The steam over the north stair clears. You can see the way down.
!refresh
!end
:shut
narr: {奥|おく} の {弁|べん} を {閉|し}める 。 {北|きた} の {石段|いしだん} が 、 また {白|しろ}く なった 。 || You close the far valve. The north stair goes white again.
!unset yn_vent2
!refresh
!end
:nohandle
narr: {弁|べん} の {輪|わ} に 、 {取|と}っ{手|て} が ない 。 {四角|しかく} い {穴|あな} が {開|あ}いて いる だけ だ 。 || The valve has no handle: only a square socket.

@scene yn.handle
narr: {道具置|どうぐお}き の {石|いし} の {間|あいだ} に 、 {真鍮|しんちゅう} の {取|と}っ{手|て} が {落|お}ちて いる 。 {四角|しかく} い {穴|あな} に {合|あ}い そう だ 。 || Among the stones of the tool nook lies a brass handle. It looks as if it would fit a square socket.
!set yn_handle_taken
!sfx item_get
!refresh

@scene yn.pool1
narr: {岩|いわ} の {間|あいだ} に 、 {湯|ゆ} が {溜|た}まって いる 。 {手|て} を {入|い}れる と 、 ちょうど いい {熱|あつ}さ だ 。 || Between the rocks, a pool of spring water. You put a hand in: just the right heat.
!hook bath_soak 4
!set yn_pool1_used
narr: {少|すこ}し {休|やす}む と 、 {湯|ゆ} は {静|しず}か に {冷|さ}めて いった 。 || You rest a while, and the water quietly cools.
!refresh

@scene yn.pool2
narr: {湯樋|ゆどい} の {脇|わき} の {湯溜|ゆだ}まり 。 {湯気|ゆげ} が {立|た}って いる 。 || A pool beside the channel, steaming.
!hook bath_soak 4
!checkpoint
!set yn_pool2_used
narr: {足|あし} を {浸|ひた}して {休|やす}んだ 。 {湯|ゆ} は {冷|さ}めた が 、 {体|からだ} は {温|あたた}まった 。 || You rest with your feet in it. The water cools, but you're warmer.
!refresh

@scene yn.pool3
narr: {奥|おく} の {湯溜|ゆだ}まり 。 {湯|ゆ} が {小|ちい}さく {沸|わ}いて いる 。 || A pool deep in the vents, bubbling a little.
!hook bath_soak 4
!set yn_pool3_used
narr: {湯|ゆ} は {静|しず}か に なり 、 {冷|さ}めた 。 || The water stills and cools.
!refresh

@scene yn.pool_cool
narr: {湯溜|ゆだ}まり は 、 もう {冷|さ}めて いる 。 {湯気|ゆげ} も {立|た}って いない 。 || The pool has gone cool. No steam rises from it.

@scene yn.vents2_first
!set yn_vents2_seen
narr: {古|ふる}い {湯樋|ゆどい} 。 {石|いし} で {組|く}んだ {水路|すいろ} を 、 {湯|ゆ} が {流|なが}れて いる 。 {真|ま}ん{中|なか} の {部屋|へや} に 、 {大|おお}きな {弁|べん} が {一|ひと}つ 。 || The old channel: spring water running along a stone-built course. In the chamber in the middle, one big valve.

@scene yn.shutter
# The shutter in the middle chamber: the steam into the upper corridor or the lower. Turn it from here, whichever way.
!if yn_shutter -> back
# ("the valve", not "the big valve": this line also follows the small wheel at either end of the Channel; RBN-QA-121)
narr: {弁|べん} を {回|まわ}す 。 {下|した} の {通|とお}り{道|みち} に {湯気|ゆげ} が {流|なが}れ{込|こ}み 、 {上|うえ} の {通|とお}り{道|みち} が {晴|は}れた 。 || You turn the valve. Steam floods the lower passage, and the upper one clears.
!set yn_shutter
!sfx wind
!refresh
!end
:back
narr: {弁|べん} を {戻|もど}す 。 {湯気|ゆげ} は {上|うえ} の {通|とお}り{道|みち} へ {戻|もど}り 、 {下|した} が {晴|は}れた 。 || You turn the valve back. The steam returns to the upper passage, and the lower clears.
!unset yn_shutter
!refresh

@scene yn.shutter_end
# The shutter's wheel at either end of the Channel: the same pipe as the big valve in the middle chamber.
narr: {通|とお}り{道|みち} の {端|はし} に 、 {小|ちい}さな {弁|べん} の {輪|わ} が ある 。 {管|くだ} が 、 {真|ま}ん{中|なか} の {部屋|へや} の {大|おお}きな {弁|べん} に つながって いる 。 || At the end of the passage there's a small valve wheel. Its pipe runs to the big valve in the middle chamber.
!call yn.shutter

@scene yn.float
# The water clock's float, jammed in silt: why the division drifted. Evidence for the mediation (yn_float_found).
narr: {湯樋|ゆどい} の {底|そこ} に 、 {真鍮|しんちゅう} の {浮|う}き が {泥|どろ} に {埋|う}まって いる 。 {細|ほそ}い {棒|ぼう} が 、 {上|うえ} の {方|ほう} へ {伸|の}びて いる 。 || At the bottom of the channel a brass float is buried in silt, a thin rod reaching up from it.
narr: {水時計|みずどけい} の {浮|う}き だ 。 {泥|どろ} を {払|はら}う と 、 {棒|ぼう} が するり と {動|うご}いた 。 || The water clock's float. You brush away the silt, and the rod slides free.
!set yn_float_found
?(yn_clock_seen) narr: {上|うえ} の {湯分|ゆわ}け の {時計|とけい} が {止|と}まって いた の は 、 これ の せい だ 。 || This is why the clock at the divider stopped.
?(comp=nao) comp: {誰|だれ} も {盗|ぬす}んで いなかった 。 {泥|どろ} が {時計|とけい} を {止|と}めて いた だけ だ 。 || Nobody was stealing anything. Silt had stopped the clock, that's all.
?(comp=mio) comp[think]: {原因|げんいん} が {分|わ}かれば 、 {治|なお}せます 。 {泥|どろ} を {除|の}けた から 、 {時計|とけい} は また {動|うご}く はず です 。 || Once you know the cause, you can treat it. With the silt cleared, the clock should run again.
?(comp=ren) comp[smile]: {一番|いちばん} {古|ふる}い {仕掛|しか}け が 、 {一番|いちばん} {下|した} で {止|と}まって いた 。 …… {見|み}つかって よかった 。 || The oldest mechanism, stopped at the very bottom. …I'm glad we found it.
?(comp=suzu) comp[laugh]: {犯人|はんにん} は {泥|どろ} ！ {推理|すいり} {劇|げき} なら 、 {客|きゃく} が {怒|おこ}る {結末|けつまつ} ね 。 || The culprit was mud! In a mystery play the audience would be furious.
!refresh

@scene yn.vents3_first
!set yn_vents3_seen
narr: {奥|おく} の {抜|ぬ}け{穴|あな} 。 {地面|じめん} が 、 {時々|ときどき} {低|ひく}く {唸|うな}る 。 {湯気|ゆげ} が 、 {吸|す}われて は {吐|は}かれる 。 {誰|だれ} か が 、 {奥|おく} で {息|いき} を して いる よう に 。 || Deep in the vents. Now and then the ground rumbles low. The steam is drawn in and breathed out, as if someone deep inside were breathing.

@scene yn.vents3_stone
narr: {岩|いわ} に {彫|ほ}った {古|ふる}い {字|じ} 。 「{釜|かま}の{主|ぬし} 、 {静|しず}か なる を {好|この}む 。 {騒|さわ}げば {沸|わ}き 、 {黙|だま}れば {冷|ひ}ゆ 。」 || Old characters cut into the rock: "The Kettle Below loves calm. Clamour, and it boils; silence, and it chills."
?(comp=ren) comp[think]: {騒|さわ}いで も {黙|だま}って も 、 だめ 。 …… {話|はな}せ と いう こと でしょう か 。 || Not clamour, and not silence. …Is it telling us to talk?

@scene yn.aki_kettle
# Aki by the Kettle's pool (11_vents.js), waiting as she said she would; afterwards keeping an eye on the source.
!faceplayer
?(!yn_kettle_settled) yn_aki: {釜|かま} が {震|ふる}えて いる 。 {湯|ゆ} の {顔色|かおいろ} が 、 {一番|いちばん} {悪|わる}い 。 …… {私|わたし} は ここ で {見|み}て いる わ 。 || The Kettle is shaking. The water's colour is at its worst. …I'll watch from here.
?(yn_kettle_settled) yn_aki: {湯|ゆ} の {顔色|かおいろ} が 、 {戻|もど}った 。 {湯元|ゆもと} は 、 {私|わたし} が {見|み}て おく 。 || The water's colour has come back. I'll keep an eye on the source.

@scene yn.kettle
# The Kettle Below: a great iron-dark shape in the boiling pool, the size of a house, shaking. More frightened than
# angry. The encounter (yn.kettle, 33_creatures.js) settles it; nothing here defeats it.
narr: {煮|に}え{立|た}つ {湯|ゆ} の {真|ま}ん{中|なか} に 、 {大|おお}きな {黒|くろ}い {釜|かま} の よう な もの が {沈|しず}んで いる 。 {釜|かま} は 、 {震|ふる}えて いた 。 || In the middle of the boiling water sits a great black shape like a kettle. It is shaking.
narr: {上|うえ} から 、 {怒鳴|どな}り{声|ごえ} が {降|ふ}って くる 。 {尾根|おね} の {方|ほう} から は 、 {何|なに} の {音|おと} も {来|こ}ない 。 その {間|あいだ} で 、 {釜|かま} が {鳴|な}って いる 。 || From above, shouting rains down. From the ridge, no sound comes at all. Between the two, the Kettle rattles.
?(comp=nao) comp[closed]: …… {怒|おこ}ってる ん じゃ ない 。 {怖|こわ}がってる ん だ 。 {走|はし}り{出|だ}す {前|まえ} の {馬|うま} と {同|おな}じ {顔|かお} だ 。 || …It isn't angry. It's frightened. Same face as a horse about to bolt.
?(comp=mio) comp[worry]: {震|ふる}えて います 。 {熱|ねつ} が {出|で}て いる {子|こ} みたい 。 …… {落|お}ち{着|つ}かせて あげないと 。 || It's shaking. Like someone running a fever. …We have to calm it.
?(comp=ren) comp[think]: {名前|なまえ} を {呼|よ}ばれず に 、 {長|なが}い {間|あいだ} ここ に いた ん です ね 。 || It's been down here a long time, without anyone calling its name.
?(comp=suzu) comp[worry]: {上|うえ} から は {罵声|ばせい} 、 {横|よこ} から は {無言|むごん} 。 …… {最悪|さいあく} の {客席|きゃくせき} ね 。 {震|ふる}える わ よ 。 || Jeers from above, dead silence from the side. …The worst audience there is. Of course it's shaking.
!encounter yn.kettle
!if var._res=0 -> again
!set yn_kettle_settled
!refresh
# Illustrated (src/ui/43m_seq_yn.js): the bubbles going out, the Kettle settling.
!sequence yn.kettle begin
!shot pool
narr: {湯|ゆ} の {泡|あわ} が 、 {一|ひと}つ ずつ {消|き}えて いく 。 {釜|かま} は {湯|ゆ} の {底|そこ} に {沈|しず}み 、 {静|しず}か に {湯気|ゆげ} を {吐|は}いた 。 {温|あたた}かい 、 ちょうど いい {湯気|ゆげ} だった 。 || The bubbles fade one by one. The Kettle sinks to the bottom and quietly breathes out steam: warm steam, just right.
?(yn_aki_met) yn_aki: …… {湯|ゆ} の {顔色|かおいろ} が 、 {戻|もど}った 。 {十年|じゅうねん} ぶり の {顔|かお} よ 。 || …The water's colour has come back. A face I haven't seen in ten years.
!sequence yn.kettle end
!quest yn_main 6
!set yn_evening
!journal {釜|かま}の{主|ぬし} は {落|お}ち{着|つ}いた 。 {上|うえ} の {言|い}い{争|あらそ}い と 、 {尾根|おね} の {静|しず}けさ に {挟|はさ}まれて 、 {怯|おび}えて いた の だ 。 {明日|あした} の {朝|あさ} 、 {寄合所|よりあいじょ} で {話|はな}し{合|あ}い が ある 。 || The Kettle Below has settled. It was frightened, caught between the quarrel above and the silence from the ridge. Tomorrow morning there's a meeting at the guild hall.
!autosave
!end
:again
narr: {釜|かま} の {震|ふる}え は 、 まだ {止|と}まらない 。 {少|すこ}し {離|はな}れて 、 {息|いき} を {整|ととの}えよう 。 || The Kettle is still shaking. Step back a little and catch your breath.
!move pc down 2

@scene yn.kettle_stone
narr: {壁|かべ} に 、 {昔|むかし} の {湯守|ゆもり} の {名前|なまえ} が {並|なら}んで いる 。 {一番|いちばん} {新|あたら}しい の は 、 ロクベエ の {若|わか}い {頃|ころ} の {字|じ} だ 。 || On the wall, the names of bath-keepers past. The newest is Rokubei's, in a young man's hand.

@scene yn.kettle_after
!set yn_kettle_seen_after
narr: {湯|ゆ} は {澄|す}んで 、 {底|そこ} の {釜|かま} が {見|み}える 。 {時々|ときどき} 、 {大|おお}きな {泡|あわ} が {一|ひと}つ 、 のんびり と {上|あ}がって くる 。 || The water is clear; you can see the Kettle at the bottom. Now and then a big bubble rises, unhurried.
`);
