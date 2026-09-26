/* Chapter 4 main quest, part 2: the frozen observatory — the Star Stair,
 * the dial door, the chart room (the unmoving light, Ushio's sketch), the
 * gallery (shortcut, hatch) and the approach to the lamp. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene sb.path_enter
!set sb_path_seen
narr: {石段|いしだん} は 、 {山|やま} の {斜面|しゃめん} を {折|お}り{返|かえ}し ながら {上|のぼ}って いく 。 {上|うえ} の ほう に 、 {丸|まる}い {屋根|やね} が {小|ちい}さく {見|み}えた 。 || The stair zigzags up the face of the mountain. Far above, the round roof looks small.
narr: {雪|ゆき} の {上|うえ} に 、 {白|しろ}い {影|かげ} が {動|うご}いた 。 {雪|ゆき}ギツネ だ 。 {目|め} が 、 {青|あお}く {光|ひか}って いる 。 || A white shape moves across the snow. A snow fox. Its eyes glow blue.
?(comp=nao) comp: {走|はし}る な 、 だった な 。 …… {配達人|はいたつにん} に {走|はし}る な って 、 {無茶|むちゃ} を {言|い}う ぜ 。 || "Don't run," was it. …Telling a courier not to run. Unreasonable.
?(comp=mio) comp[worry]: あの {目|め} …… {熱|ねつ} の ある {子|こ} の {目|め} に {似|に}て います 。 {苦|くる}しい の かも しれない 。 || Those eyes… they look like a feverish child's. Maybe it's suffering.
?(comp=ren) comp: {石段|いしだん} の {灯|あか}り が {消|き}えて います 。 {上|うえ} の {灯|あか}り と {一緒|いっしょ} に 。 {灯|あか}り は 、 {道|みち} の {背骨|せぼね} です から 。 || The lanterns on the stair are out. Along with the one above. Lanterns are the backbone of a road.
?(comp=suzu) comp: {白|しろ}い キツネ 。 {舞台|ぶたい} なら 、 {化|ば}かす {役|やく} だ ね 。 {騙|だま}されない よう に しよう 。 || A white fox. On stage, that's the trickster role. Let's not be fooled.

@scene sb.path_lantern
narr: {石段|いしだん} の {灯|あか}り 。 {笠|かさ} の {字|じ} は {読|よ}めない ほど {薄|うす}れ 、 {中|なか} に {霜|しも} が {詰|つ}まって いる 。 || A stair lantern. The writing on its shade has faded past reading, and it's packed with frost.
?(comp=ren) comp: {上|うえ} の {大|おお}きな {灯|あか}り が {戻|もど}れば 、 これら も {戻|もど}る でしょう 。 {灯|あか}り は 、 {互|たが}い の {名前|なまえ} を {呼|よ}び{合|あ}って いる もの です 。 || If the great lamp above comes back, these will too. Lamps call each other's names.

@scene sb.path_bench
narr: {石|いし} の {腰掛|こしか}け 。 {脇|わき} の {柱|はしら} に 、 {刻|きざ}み{目|め} が {縦|たて} に {並|なら}んで いる 。 {一|ひと}つ {一|ひと}つ に {小|ちい}さく 、 「 アカリ {四|よっ}つ 」 「 アカリ {五|いつ}つ 」 …… 「 アカリ {十五|じゅうご} 」 。 || A stone seat. On the post beside it, notches run upward, each labelled small: "Akari, 4", "Akari, 5"… "Akari, 15".
?(comp=mio) comp[smile]: {毎年|まいとし} 、 ここ で {背|せ} を {測|はか}って いた んです ね 。 {天文台|てんもんだい} へ {上|のぼ}る {途中|とちゅう} に 。 || He measured her height here every year. On the way up to the observatory.
?(comp=nao) comp: {十五|じゅうご} で {止|と}まってる 。 {町|まち} へ {出|で}た {年|とし} か 。 || Stops at fifteen. The year she went down to the town, I guess.
?(comp=suzu) comp: {柱|はしら} の {傷|きず} は 、 {帳簿|ちょうぼ} より {正直|しょうじき} だ ね 。 || Notches on a post are more honest than any account book.
?(comp=ren) comp: {記録|きろく} です ね 。 {一番|いちばん} {美|うつく}しい {種類|しゅるい} の 。 || A record. The most beautiful kind.

@scene sb.path_foxsign
narr: {立|た}て{札|ふだ} 。 「 キツネ に {注意|ちゅうい} 。 {走|はし}る な 。 {目|め} を そらす な 。 ── ハヤテ 」 || A signboard: "Beware of foxes. Don't run. Don't look away. — Hayate"

@scene sb.path_marker
narr: {石|いし} に {刻|きざ}んだ {字|じ} 。 「 {天文台|てんもんだい} 。 {四十年|よんじゅうねん} {前|まえ} 、 ホシノ と デンジ 、 これ を {建|た}てる 。 {二人|ふたり} とも {若|わか}く 、 {愚|おろ}か なり 」 。 || Letters carved into the stone: "The Observatory. Built forty years ago by Hoshino and Denji. Both young, and fools."
?(comp=suzu) comp[laugh]: {石|いし} に {刻|きざ}む こと じゃ ない よ 、 それ ！ || That's not something you carve in stone!

@scene sb.path_view
narr: {石段|いしだん} の {上|うえ} から 、 {雪鈴|ゆきすず} が {見|み}える 。 {家々|いえいえ} の {煙|けむり} が 、 {細|ほそ}く {真|ま}っ{直|す}ぐ {上|のぼ}って いる 。 {風|かぜ} の ない {朝|あさ} だ 。 || From the top of the stair you can see Snowbell. Smoke rises thin and straight from the houses. A windless morning.
?(sb_lamp_lit) narr: {南東|なんとう} の {遠|とお}く に 、 {灯落|ひおち} の {町|まち} が かすんで いる 。 その {上|うえ} の {山|やま} に 、 {白|しろ}い {点|てん} が {一|ひと}つ 。 || Far to the southeast, Lanternfall lies hazy. On the mountain above it, a single white point.

@scene sb.service_door_out
narr: {小|ちい}さな {石|いし} の {小屋|こや} の {扉|とびら} 。 {内側|うちがわ} から {閂|かんぬき} が かかって いて 、 びくとも しない 。 || The door of a little stone hut. It's barred from the inside and won't budge.
?(comp=nao) comp: {内側|うちがわ} から しか {開|あ}かない 、 か 。 {中|なか} を {回|まわ}って 、 {向|む}こう から {開|あ}けよう 。 || Only opens from the inside. We'll go round through the building and open it from the other side.
?(comp!=nao) comp: デンジ さん の {言|い}って いた 、 {裏|うら} の {階段|かいだん} でしょう か 。 {中|なか} から {開|あ}けられる はず です 。 || That must be the back stair Denji mentioned. It should open from inside.

@scene sb.hall_enter
!set sb_hall_seen
narr: {天文台|てんもんだい} の {中|なか} は 、 {外|そと} より {寒|さむ}かった 。 {床|ゆか} に は {氷|こおり} が {張|は}り 、 {天井|てんじょう} から つらら が {下|さ}がって いる 。 || Inside, the observatory is colder than outside. Ice skins the floor, and icicles hang from the ceiling.
narr: {奥|おく} の {扉|とびら} は 、 {分厚|ぶあつ}い {氷|こおり} で {塞|ふさ}がれて いた 。 {扉|とびら} の {横|よこ} に 、 {真鍮|しんちゅう} の {丸|まる}い {盤|ばん} が ある 。 || The door at the back is blocked by thick ice. Beside it is a round brass dial.
?(comp=nao) comp: {息|いき} が {白|しろ}い 。 …… {中|なか} の ほう が {寒|さむ}い って 、 {建物|たてもの} と して {失格|しっかく} だろ 。 || My breath's white. …A building that's colder inside than out has failed at being a building.
?(comp=mio) comp[worry]: {長|なが}く いる と 、 {指|ゆび} を {悪|わる}く します 。 {手|て} を {擦|こす}り{合|あ}わせて 。 こう 。 || Stay too long and you'll damage your fingers. Rub your hands together. Like this.
?(comp=ren) comp[think]: {星|ほし} を {見|み}る {建物|たてもの} が 、 {目|め} を {閉|と}じて いる よう です 。 || It's as if a building for watching stars has closed its eyes.
?(comp=suzu) comp: {氷|こおり} の {宮殿|きゅうでん} だ ね 。 {衣装|いしょう} {代|だい}=(cost) が かからない {舞台|ぶたい} 。 …… {薪|まき} {代|だい}=(cost) は かかる けど 。 || An ice palace. A set that costs nothing in costumes. …Plenty in firewood, though.

@scene sb.hall_rules
narr: {壁|かべ} の {板|いた} に 、 {氷|こおり} の {下|した} から {字|じ} が {透|す}けて {見|み}える 。 「 {観測|かんそく} の {心得|こころえ} 」 。 || On a board on the wall, writing shows through the ice: "Rules for Observing".
narr: 「 {一|いち} 、 {星|ほし} を {見|み}る {前|まえ} に 、 {目|め} を {暗|くら}さ に {慣|な}らす こと 。 {二|に} 、 {冬|ふゆ} の {夜|よる} {九時|くじ} ごろ 、 {鼓星|つづみぼし} は {南|みなみ} の {空|そら} に {見|み}える 。 {三|さん} 、 {奥|おく} の {扉|とびら} は 、 {見|み}る べき {方角|ほうがく} を {知|し}る {者|もの} に {開|ひら}く 。 」 || "One: before observing, let your eyes grow used to the dark. Two: on winter nights around nine o'clock, the Drum Stars can be seen in the southern sky. Three: the inner door opens for one who knows which way to look."
!note sb_tsuzumi

@scene sb.hall_door
narr: {扉|とびら} は {氷|こおり} に {閉|と}じられて いる 。 {横|よこ} の {丸|まる}い {盤|ばん} に は 、 {方角|ほうがく} の {字|じ} が {刻|きざ}まれて いる 。 || The door is sealed in ice. The round dial beside it is engraved with the compass directions.

@scene sb.hall_dial
!if sb_dial1 -> done
narr: {真鍮|しんちゅう} の {盤|ばん} 。 {針|はり} が {一本|いっぽん} 、 {霜|しも} に {覆|おお}われて いる 。 {盤|ばん} の {縁|ふち} に 、 {北|きた} ・ {東|ひがし} ・ {南|みなみ} ・ {西|にし} の {字|じ} 。 || A brass dial. A single needle, coated in frost. Around the rim: north, east, south, west.
!challenge sb.c_dial
!if var._res=0 -> end
!sfx reveal
!shake
narr: {針|はり} が {南|みなみ} を {指|さ}した とき 、 {盤|ばん} の {奥|おく} で {何|なに} か が かちり と {鳴|な}った 。 {扉|とびら} の {氷|こおり} に 、 {大|おお}きな {罅|ひび} が {走|はし}る 。 || As the needle comes to rest on south, something clicks deep inside the dial. A great crack runs through the ice on the door.
!sfx fire_out
narr: {氷|こおり} は {崩|くず}れ 、 {扉|とびら} が {開|ひら}いた 。 || The ice collapses, and the door opens.
!set sb_dial1
!quest sb_lamp 7
?(comp=nao) comp[smirk]: 「 {見|み}る べき {方角|ほうがく} 」 、 か 。 {気取|きど}った {扉|とびら} だ 。 {嫌|きら}い じゃ ない 。 || "Which way to look." A pretentious door. I don't hate it.
?(comp=mio) comp[smile]: ホシノ さん らしい {鍵|かぎ} です ね 。 {星|ほし} を {知|し}って いる {人|ひと} だけ が {入|はい}れる 。 || A very Hoshino sort of lock. Only people who know the stars can enter.
?(comp=ren) comp: {冬|ふゆ} の {鼓星|つづみぼし} は {南|みなみ} 。 …… {方角|ほうがく} だけ は 、 {得意|とくい} な んです 。 {空|そら} の {方角|ほうがく} は 。 || The winter Drum Stars: south. …Directions are my strong point. In the sky, that is.
?(comp=suzu) comp[laugh]: {開|ひら}け ゴマ 、 じゃ なくて 、 {開|ひら}け {南|みなみ} ！ || Not "open sesame" — "open south"!
!end
:done
narr: {針|はり} は {南|みなみ} を {指|さ}した まま だ 。 || The needle still points south.

@scene sb.hall_scope
narr: {小|ちい}さな {望遠鏡|ぼうえんきょう} 。 {筒|つつ} に 、 {子|こ}ども の {字|じ} で {落書|らくが}き が ある 。 「 アカリ の 」 。 || A small telescope. Scrawled on the tube in a child's hand: "Akari's".

@scene sb.hall_scope2
narr: {観測|かんそく} {記録|きろく} が 、 {氷|こおり} ごし に {読|よ}める 。 「 {今夜|こんや} も {晴|は}れ 。 アカリ 、 {五歳|ごさい} 。 {初|はじ}めて {土星|どせい} を {見|み}る 。 『 {輪|わ} が ある ！ 』 と {叫|さけ}ぶ 。 」 || An observing log, readable through the ice: "Clear again tonight. Akari, age five, sees Saturn for the first time. Shouts 'It's got a ring!'"
?(comp=mio) comp[smile]: {観測|かんそく} {記録|きろく} に 、 {叫|さけ}び{声|ごえ} まで {書|か}いて ある 。 || He even logged her shout.

@scene sb.hall_chart
narr: {霜|しも} で {真|ま}っ{白|しろ} に なった {星図|せいず} 。 {星|ほし} の {名前|なまえ} が 、 {一|ひと}つ も {読|よ}めない 。 || A star chart gone white with frost. Not a single star's name can be read.
?(comp=ren) comp[worry]: {星|ほし} の {名前|なまえ} まで …… 。 {静寂|しじま} は 、 {空|そら} に も {手|て} を {伸|の}ばして いる の か 。 || Even the stars' names… Is the Hush reaching into the sky as well?

@scene sb.charts_enter
!set sb_charts_seen
narr: {星図|せいず} の {部屋|へや} 。 {棚|たな} に {巻物|まきもの} の よう な {星図|せいず} が {並|なら}び 、 {大|おお}きな {机|つくえ} に {観測|かんそく} {日誌|にっし} が {開|ひら}いた まま に なって いる 。 || The chart room. Rolled star charts fill the shelves, and on a big table an observing log lies open.
narr: {部屋|へや} の {隅|すみ} に 、 {冷|つめ}たく なった {鉄|てつ} の ストーブ が ある 。 || In the corner stands an iron stove, gone cold.
?(comp=mio) comp: ストーブ に {火|ひ} を {入|い}れたら 、 {少|すこ}し {休|やす}めます ね 。 {炎|ほのお} の {字|じ} で 。 || If we light the stove, we can rest a little. With the flame word.
?(comp!=mio) comp: {少|すこ}し {休|やす}もう 。 あの ストーブ 、 {使|つか}える かも しれない 。 || Let's rest a bit. That stove might still work.
!checkpoint sb.obs_charts 8 9 up
!autosave

@scene sb.charts_stove
!if sb_stove_lit -> lit
narr: {冷|つめ}たい ストーブ 。 {中|なか} に {薪|まき} が {残|のこ}って いる 。 {炎|ほのお} の {字|じ} を {書|か}けば 、 {火|ひ} が {入|はい}り そう だ 。 || A cold stove with some wood left inside. Write the flame word and it would probably light.
!choice
* {火|ひ} を {入|い}れる || Light it. -> light
* やめて おく || Leave it. -> end
:light
!sfx light
narr: {指|ゆび} で 「 ほのお 」 と {書|か}く と 、 {薪|まき} が {赤|あか}く {燃|も}え{上|あ}がった 。 {部屋|へや} が 、 ゆっくり {温|あたた}まって いく 。 || You trace "honoo" with a finger and the wood flares red. The room slowly warms.
!set sb_stove_lit
:lit
narr: ストーブ の {前|まえ} で {手|て} を {温|あたた}める 。 {疲|つか}れ が {少|すこ}し {抜|ぬ}けて いく 。 || You warm your hands at the stove. A little of the tiredness drains away.
!heal
!checkpoint sb.obs_charts 12 3 down
!autosave
?(comp=nao) comp: {温|あった}まった 。 …… {次|つぎ} の {部屋|へや} も 、 これ ぐらい {親切|しんせつ} だと いい な 。 || Warm now. …Hope the next room's this friendly.
?(comp=mio) comp[smile]: {手|て} 、 {赤|あか}く なって きました ね 。 よかった 。 || Your hands are going pink. Good.
?(comp=ren) comp: {火|ひ} の {前|まえ} で は 、 {道|みち} を {間違|まちが}えません 。 {動|うご}かない から です 。 || I never take a wrong turn in front of a fire. Because I'm not moving.
?(comp=suzu) comp: {幕間|まくあい} の {休憩|きゅうけい} だ ね 。 {客|きゃく} も {役者|やくしゃ} も 、 {温|あたた}まって から {後半|こうはん} へ 。 || Intermission. Audience and players alike warm up before the second half.

@scene sb.charts_desk
narr: {机|つくえ} の {上|うえ} に 、 デンジ {宛|あ}て の {書|か}き{置|お}き 。 ホシノ の {字|じ} だ 。 || On the desk, a note addressed to Denji, in Hoshino's handwriting.
narr: 「 デンジ へ 。 {上|うえ} の {階|かい} へ の {格子|こうし} の {鍵|かぎ} は 、 {星|ほし} で ない {光|ひかり} の {方角|ほうがく} の {引|ひ}き{出|だ}し に {入|い}れて ある 。 {日誌|にっし} を {読|よ}めば わかる 。 {読|よ}まない お{前|まえ} が {悪|わる}い 。 ── ホシノ 」 || "Denji — the key to the grille for the upper floor is in the drawer for the direction of the light that isn't a star. Read the log and you'll know. If you don't read it, that's your own fault. — Hoshino"
?(comp=nao) comp[smirk]: {最後|さいご} の {一行|いちぎょう} 、 {友達|ともだち} {同士|どうし} の {字|じ} だ な 。 || That last line. That's how friends write to each other.
?(comp=suzu) comp[laugh]: 「 {読|よ}まない お{前|まえ} が {悪|わる}い 」 ！ {最高|さいこう} 。 {台本|だいほん} の {表紙|ひょうし} に {書|か}きたい 。 || "If you don't read it, that's your own fault"! Wonderful. I want that on the cover of every script.
!if sb_log_solved -> end
?(comp) comp: {日誌|にっし} は 、 あの {大|おお}きな {机|つくえ} の {上|うえ} だ ね 。 || The log is on that big table.

@scene sb.charts_cabinet
narr: {壁|かべ} {一面|いちめん} の {引|ひ}き{出|だ}し 。 {北|きた} ・ {北東|ほくとう} ・ {東|ひがし} ・ {南東|なんとう} ・ {南|みなみ} ・ {南西|なんせい} ・ {西|にし} ・ {北西|ほくせい} 。 {方角|ほうがく} ごと に {札|ふだ} が {貼|は}って ある 。 || A wall of drawers, each labelled with a direction: N, NE, E, SE, S, SW, W, NW.
!if sb_log_solved -> opened
narr: どの {引|ひ}き{出|だ}し も 、 {霜|しも} で {固|かた}く {閉|し}まって いる 。 {正|ただ}しい {一|ひと}つ を {選|えら}ぶ に は 、 {日誌|にっし} を {読|よ}む しか ない 。 || Every drawer is frozen tight. To pick the right one, you'll have to read the log.
!end
:opened
narr: {南東|なんとう} の {引|ひ}き{出|だ}し は 、 もう {空|から} だ 。 {南|みなみ} の {引|ひ}き{出|だ}し を {少|すこ}し {開|あ}けて みる と 、 {子|こ}ども の {描|か}いた {星|ほし} の {絵|え} が {何十枚|なんじゅうまい} も {入|はい}って いた 。 || The southeast drawer is empty now. Easing open the south drawer, you find dozens of star pictures drawn by a child.

@scene sb.charts_log
!if sb_log_solved -> done
narr: {開|ひら}いた まま の {観測|かんそく} {日誌|にっし} 。 {七年前|しちねんまえ} の {冬|ふゆ} の {頁|ページ} だ 。 {三|みっ}つ の {時刻|じこく} の {記録|きろく} が 、 {丁寧|ていねい} に {並|なら}んで いる 。 || The observing log, lying open at a winter page from seven years ago. Entries for three different times are set down carefully one after another.
!challenge sb.c_log
!if var._res=0 -> end
!set sb_log_solved
!set sb_archive_found
!sfx discover
narr: {南東|なんとう} の {引|ひ}き{出|だ}し の {霜|しも} が 、 ぱりん と {割|わ}れた 。 {中|なか} に は 、 {格子|こうし} の {鍵|かぎ} と 、 {折|お}り{畳|たた}んだ {紙|かみ} が {一枚|いちまい} 。 || The frost on the southeast drawer cracks with a snap. Inside: the key to the grille, and a single folded sheet of paper.
!note sb_archive_light
!call sb.charts_sketch
!end
:done
narr: {日誌|にっし} の {頁|ページ} 。 「 {南東|なんとう} 、 {高|たか}さ {五度|ごど} 。 {白|しろ}い {光|ひかり} 。 {動|うご}かず 。 {星|ほし} に {非|あら}ず 。 」 || The log page: "Southeast, altitude five degrees. White light. Does not move. Not a star."

@scene sb.charts_sketch
narr: {紙|かみ} を {広|ひろ}げる と 、 {鉛筆|えんぴつ} の {似顔絵|にがおえ} だった 。 {重|おも}そう な {灯|あか}り を {提|さ}げた {旅人|たびびと} 。 {外套|がいとう} は {継|つ}ぎ{接|は}ぎ だらけ だ 。 || Unfolded, it's a pencil portrait: a traveller carrying a heavy lantern, in a coat covered in patches.
narr: {下|した} に ホシノ の {字|じ} 。 「 {灯守|ひもり} ウシオ 。 {南東|なんとう} の {光|ひかり} を {見|み}に {来|き}た 。 {三晩|みばん} {泊|と}まり 、 {山|やま} へ {向|む}かう 。 {帰|かえ}らず 。 」 || Beneath it, in Hoshino's hand: "Ushio, a lantern keeper. Came to see the light in the southeast. Stayed three nights, then set out for the mountain. Did not return."
narr: {余白|よはく} に 、 {別|べつ} の {手|て} で 。 「 {名|な} は {灯|ひ} に 、 {灯|ひ} は {人|ひと} に 、 {人|ひと} は {名|な} に 。 」 || In the margin, in a different hand: "A name to the lamp, the lamp to people, people to the name."
!give sb_ushio_sketch
!set sb_ushio_sketch
!note sb_ushio
!if comp=ren -> ren
?(comp=nao) comp[think]: ウシオ …… レン の {師匠|ししょう} の {名前|なまえ} だ 。 {葦|あし}ノ{瀬|せ} で {聞|き}いた こと が ある 。 {山|やま} の {上|うえ} へ {行|い}って 、 {戻|もど}らなかった って 。 || Ushio… That's Ren's teacher's name. I heard it in Reedwake. Went up the mountain and never came back.
?(comp=nao) comp: …… これ は {預|あず}かって おこう 。 {届|とど}け{先|さき} は 、 はっきり してる 。 || …Let's hang on to this. The address it needs to go to is obvious.
?(comp=mio) comp[worry]: ウシオ さん 。 レン さん の {先生|せんせい} の …… 。 レン さん 、 {先生|せんせい} の {話|はなし} を する とき 、 いつも {少|すこ}し {寂|さび}しそう だった 。 || Ushio. Ren's teacher… Whenever Ren talked about their teacher, they always looked a little lonely.
?(comp=mio) comp: {葦|あし}ノ{瀬|せ} に {帰|かえ}ったら 、 {見|み}せて あげましょう 。 …… {見|み}せて いい もの か 、 {少|すこ}し {考|かんが}えて から 。 || When we get back to Reedwake, let's show Ren. …After thinking a bit about whether we should.
?(comp=suzu) comp[think]: ウシオ 。 {聞|き}いた こと ある 。 レン の {師匠|ししょう} だ よ ね 。 {似顔絵|にがおえ} って 、 {残|のこ}された {方|ほう} に は {重|おも}い {荷物|にもつ} だ よ 。 {渡|わた}し{方|かた} を {間違|まちが}え ない よう に しない と 。 || Ushio. I've heard that name. Ren's teacher, right? A portrait is a heavy thing to hand to the one left behind. We'll have to be careful how we give it.
!goto after
:ren
comp[surprise]: …… 。 || ……
comp: 「 {名|な} は {灯|ひ} に 、 {灯|ひ} は {人|ひと} に 、 {人|ひと} は {名|な} に 」 。 {師匠|ししょう} の {言葉|ことば} です 。 {一字|いちじ} {一句|いっく} 、 {間違|まちが}い なく 。 || "A name to the lamp, the lamp to people, people to the name." My teacher's words. Every character, exactly.
comp: {続|つづ}き も {言|い}えます 。 「 だから 、 {名|な} を {一人|ひとり} で {守|まも}る {者|もの} は いない 」 。 …… この {字|じ} も 、 {師匠|ししょう} の {字|じ} です 。 {覚|おぼ}えて います 。 || I can say the rest too. "And so no one keeps a name alone." …And this handwriting is my teacher's. I remember it.
comp[sad]: でも ── この {顔|かお} は 。 || But — this face.
comp: {知|し}らない {人|ひと} です 。 || I don't know this person.
narr: レン は {似顔絵|にがおえ} を 、 {長|なが}い あいだ {見|み}つめて いた 。 {目|め} を {細|ほそ}め 、 {少|すこ}し {離|はな}し 、 また {近|ちか}づけて 。 || Ren looks at the portrait for a long time. Narrowing their eyes, holding it further away, bringing it close again.
comp: {言葉|ことば} は {全部|ぜんぶ} ここ に ある のに 、 {顔|かお} だけ が 、 {他人|たにん} の よう です 。 …… {昨夜|ゆうべ} {話|はな}した とおり です 。 {驚|おどろ}く こと では ありません 。 || Every word is right here, and only the face looks like a stranger's. …Just as I told you last night. Nothing to be surprised about.
!choice
* {持|も}って いて いい よ || You should keep it. -> keep
* {今|いま} は 、 {先|さき} へ {進|すす}もう || Let's keep going, for now. -> onward
:keep
comp: …… いいえ 。 あなた が {持|も}って いて ください 。 {今|いま} の わたし が {持|も}つ と 、 {見|み}る たび に {他人|たにん} に なって しまう {気|き} が する 。 || …No. Please keep it. If I carry it now, I think it'll become more of a stranger every time I look.
comp: {南東|なんとう} の {光|ひかり} 。 {師匠|ししょう} は 、 そこ へ {行|い}った 。 {顔|かお} の {残|のこ}り も 、 たぶん そこ に ある 。 || The light in the southeast. My teacher went there. Whatever is left of the face is probably there too.
!set sb_ren_ushio1
!quest ren_ushio 0
!goto after
:onward
comp: …… はい 。 {灯|あか}り が {先|さき} です 。 ホシノ さん の {約束|やくそく} が 、 {先|さき} です 。 || …Yes. The lamp comes first. Hoshino's promise comes first.
comp[smile]: {似顔絵|にがおえ} は 、 あなた が {持|も}って いて ください 。 わたし は …… {言葉|ことば} の ほう を {持|も}って います から 。 || Please keep the sketch. I'll… carry the words instead.
!set sb_ren_ushio1
!quest ren_ushio 0
:after
narr: {似顔絵|にがおえ} を {丁寧|ていねい} に {畳|たた}み 、 {荷物|にもつ} の いちばん {上|うえ} に しまった 。 {格子|こうし} の {鍵|かぎ} を {手|て} に 、 {階段|かいだん} へ 。 || You fold the sketch carefully and put it at the very top of your pack. Key in hand, you head for the stairs.
!autosave

@scene sb.charts_stair_locked
narr: {上|うえ} へ の {階段|かいだん} は 、 {鉄|てつ} の {格子|こうし} と {氷|こおり} で {閉|と}ざされて いる 。 {錠前|じょうまえ} が {一|ひと}つ 。 || The stair up is closed off by an iron grille and ice. There's a single padlock.
?(!sb_log_solved) comp: {鍵|かぎ} が {要|い}る 。 {机|つくえ} の {上|うえ} の {書|か}き{置|お}き に 、 {何|なに} か {書|か}いて ない ？ || We need a key. Doesn't the note on the desk say something?

@scene sb.gallery_enter
!set sb_gallery_seen
narr: {上|うえ} の {回廊|かいろう} は 、 {丸屋根|まるやね} の {真下|ました} を {一周|いっしゅう} して いる 。 {細|ほそ}い {窓|まど} から 、 {雪|ゆき} の {山々|やまやま} が {見|み}える 。 || The upper gallery runs in a ring right under the dome. Through narrow windows you can see snowy peaks.
narr: {中央|ちゅうおう} の {壁|かべ} に {梯子|はしご} が かかり 、 {天井|てんじょう} の {蓋|ふた} に {続|つづ}いて いる 。 {蓋|ふた} は {凍|こお}りついて いた 。 || A ladder against the central wall leads up to a hatch in the ceiling. The hatch is frozen shut.
?(comp=ren) comp[think]: {上|うえ} から 、 {冷|つめ}たい {気配|けはい} が {降|お}りて きます 。 {灯|あか}り は 、 {待|ま}って いる の では なく …… {待|ま}ち{疲|つか}れて いる 。 || Something cold is coming down from above. The lamp isn't waiting… it's worn out from waiting.
?(comp=nao) comp: {上|うえ} に {何|なに} か いる な 。 {荷物|にもつ} の {気配|けはい} じゃ ない 。 || Something's up there. And it doesn't feel like a parcel.
?(comp=mio) comp[worry]: {寒|さむ}さ が 、 {上|うえ} から {流|なが}れて くる …… 。 {火|ひ} の {元|もと} が {逆|ぎゃく} に なった みたい 。 || The cold is flowing down from above… As if the source of a fire had turned inside out.
?(comp=suzu) comp: {天井|てんじょう} {裏|うら} の {主役|しゅやく} が 、 {出番|でばん} を {待|ま}ってる ね 。 || Whoever's in the rafters is waiting for their cue.

@scene sb.gallery_note
narr: {壁|かべ} の {板|いた} に 、 デンジ の {太|ふと}い {字|じ} 。 「 {蓋|ふた} の {開|あ}け{方|かた} 。 {先|さき} に 、 ハンドル を {火|ひ} で よく あたためる こと 。 {凍|こお}った まま {回|まわ}す と 、 {軸|じく} が {折|お}れる 。 {次|つぎ} に 、 {右|みぎ} へ {三回|さんかい} 。 {最後|さいご} に 、 {左|ひだり} へ {一回|いっかい} {戻|もど}す 。 {逆|ぎゃく} に する な 。 ホシノ 、 お{前|まえ} の こと だ 。 」 || On a board on the wall, in Denji's heavy hand: "Opening the hatch. First, warm the handle well with fire. Turn it frozen and the shaft snaps. Next, three turns to the right. Last, one turn back to the left. Do NOT do it the other way round. Hoshino, that means you."
?(comp=suzu) comp[laugh]: {名指|なざ}し で {注意|ちゅうい} されてる ！ {四十年|よんじゅうねん} {前|まえ} に {何|なに} を した ん だろう 。 || Called out by name! What did he do forty years ago?

@scene sb.hatch_crank
!if sb_crank -> done
narr: {蓋|ふた} を {開|あ}ける ハンドル 。 {霜|しも} で {真|ま}っ{白|しろ} だ 。 || The handle that opens the hatch, white with frost.
!challenge sb.c_crank
!if var._res=0 -> end
!sfx light
narr: {炎|ほのお} で ハンドル を あたため 、 {右|みぎ} へ {三回|さんかい} 、 {左|ひだり} へ {一回|いっかい} 。 {頭|あたま} の {上|うえ} で 、 {重|おも}い {蓋|ふた} が ゆっくり {開|ひら}いた 。 {冷|つめ}たい {空気|くうき} が 、 {滝|たき} の よう に {落|お}ちて くる 。 || You warm the handle with flame, turn it three times right, once left. Overhead, the heavy hatch slowly swings open. Cold air pours down like a waterfall.
!set sb_crank
!quest sb_lamp 8
!autosave
!end
:done
narr: ハンドル は {回|まわ}り{切|き}って いる 。 {蓋|ふた} は {開|ひら}いた まま だ 。 || The handle is fully turned. The hatch stays open.

@scene sb.hatch
narr: {天井|てんじょう} の {蓋|ふた} は {凍|こお}りついて いて 、 {押|お}して も {動|うご}かない 。 {壁|かべ} に ハンドル が ある 。 || The ceiling hatch is frozen shut and won't move when you push. There's a handle on the wall.

@scene sb.service_bolt
narr: {外|そと} へ {出|で}る {裏|うら} の {扉|とびら} 。 {内側|うちがわ} に 、 {太|ふと}い {閂|かんぬき} が {渡|わた}して ある 。 || The back door leading outside. A thick bar runs across it on this side.
!choice
* {閂|かんぬき} を {外|はず}す || Lift the bar. -> open
* そのまま に する || Leave it. -> end
:open
!sfx door
narr: {閂|かんぬき} を {外|はず}す と 、 {扉|とびら} の {向|む}こう に {石段|いしだん} の {上|うえ} の {景色|けしき} が {見|み}えた 。 これ で 、 {天文台|てんもんだい} の {中|なか} を {通|とお}らず に {上|のぼ}り{下|お}り できる 。 || With the bar lifted, the view from the top of the stair appears beyond the door. Now you can come and go without passing through the building.
!set sb_shortcut
!toast {近道|ちかみち} が {開|ひら}いた || A shortcut is open.
?(comp=nao) comp[smirk]: {近道|ちかみち} は {配達人|はいたつにん} の {宝|たから} だ 。 デンジ の じいさん に は 、 {後|あと} で {礼|れい} を {言|い}おう 。 || Shortcuts are a courier's treasure. We'll have to thank old Denji later.
?(comp=ren) comp: これ で ホシノ さん も {上|のぼ}って {来|こ}られます 。 {中|なか} の {扉|とびら} を {通|とお}らず に 。 || Now Hoshino can come up too, without going through the inner doors.

@scene sb.gallery_scope
narr: {西|にし} {向|む}き の {望遠鏡|ぼうえんきょう} 。 {覗|のぞ}く と 、 {灰実|はいみ} の {里|さと} の {段々畑|だんだんばたけ} が 、 {雪|ゆき} の {下|した} で {縞|しま} に なって いる 。 || A west-facing telescope. Through it, Cinder Orchard's terraces show as stripes beneath the snow.

@scene sb.gallery_scope2
narr: {南東|なんとう} {向|む}き の {望遠鏡|ぼうえんきょう} 。 {覗|のぞ}く と 、 {灯落|ひおち} の {町|まち} の {屋根|やね} と {橋|はし} が {見|み}える 。 {橋|はし} の {上|うえ} に 、 {小|ちい}さな {人影|ひとかげ} が {一|ひと}つ 。 || A telescope facing southeast. Through it you can make out Lanternfall's roofs and a bridge. On the bridge, one tiny figure.
?(sb_archive_found) narr: その {上|うえ} の {山|やま} の {高|たか}い ところ に 、 {白|しろ}い {光|ひかり} が {一|ひと}つ 、 {瞬|まばた}き も せず に {灯|とも}って いる 。 || High on the mountain above, a single white light burns without flickering.
?(sb_archive_found&comp=nao) comp: …… あそこ か 。 {全部|ぜんぶ} の {宛名|あてな} が {持|も}って いかれた {先|さき} は 。 || …So that's where every address was taken.
?(sb_archive_found&comp=ren) comp: {静寂|しじま} の {書庫|しょこ} 。 {師匠|ししょう} の {向|む}かった {場所|ばしょ} 。 || The Still Archive. Where my teacher went.

@scene sb.dome_enter
!set sb_dome_seen
narr: {丸屋根|まるやね} の {下|した} 。 {部屋|へや} の {真|ま}ん{中|なか} に 、 {人|ひと} の {背|せ} ほど も ある {大|おお}きな {灯|あか}り が {立|た}って いる 。 {笠|かさ} も {台|だい} も 、 {透|す}き{通|とお}った {氷|こおり} に {包|つつ}まれて いた 。 || Under the dome. In the middle of the room stands a great lamp as tall as a person. Shade and stand alike are wrapped in clear ice.
narr: {笠|かさ} に は 、 {何|なに} も {書|か}いて ない 。 || Nothing is written on the shade.
?(comp=nao) comp: {宛名|あてな} の ない {手紙|てがみ} と {同|おな}じ だ 。 {白|しろ}い 。 || Same as the letters with no address. White.
?(comp=mio) comp[worry]: {寒|さむ}い …… 。 {灯|あか}り が {冷|つめ}たい なんて 、 {変|へん} です 。 || So cold… A lamp shouldn't be cold.
?(comp=ren) comp: {名|な} を {失|うしな}った {灯|ひ} です 。 {近|ちか}づけば 、 {向|む}こう から {話|はな}しかけて くる でしょう 。 || A lamp that has lost its name. If we go closer, it will speak to us.
?(comp=suzu) comp: {主役|しゅやく} の {登場|とうじょう} だ 。 …… {台詞|せりふ} を {忘|わす}れた {主役|しゅやく} 。 || Enter the lead. …A lead who's forgotten their lines.

@scene sb.dome_scope
narr: {大|おお}きな {望遠鏡|ぼうえんきょう} 。 {筒|つつ} の {先|さき} が 、 {真|ま}っ{直|す}ぐ {灯落|ひおち} の {方角|ほうがく} を {向|む}いて いる 。 {星|ほし} を {見|み}る {角度|かくど} で は ない 。 || A great telescope. Its tube points straight toward Lanternfall. Not an angle for watching stars.

@scene sb.dome_mural
narr: {壁|かべ} の {星図|せいず} に 、 {子|こ}ども の {字|じ} で {星|ほし} の {名前|なまえ} が {書|か}き{込|こ}んで ある 。 {間違|まちが}い だらけ だ 。 {父親|ちちおや} の {字|じ} で 、 {一|ひと}つ {一|ひと}つ に 「 よく できました 」 。 || On the wall chart, star names have been written in by a child, full of mistakes. Next to each one, in the father's hand: "Well done."

@scene sb.dome_lamp
!if sb_boss_done&!ch4_done -> resume
!if sb_lamp_lit -> lit
narr: {氷|こおり} に {包|つつ}まれた {灯|あか}り 。 {近|ちか}づく と 、 {息|いき} が {凍|こお}る 。 || The ice-bound lamp. Come close, and your breath freezes.
!end
:resume
!call sb.dome_hoshino
!end
:lit
narr: {灯|あか}り の {笠|かさ} に 、 {新|あたら}しい {字|じ} で 「 あかり 」 。 {炎|ほのお} は {静|しず}か で 、 {温|あたた}かい 。 || On the shade, in fresh ink: "Akari". The flame is quiet and warm.
`, 'ch4/dungeon');
