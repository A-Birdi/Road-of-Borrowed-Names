/* The Keepers' Road, Chapter 7: the cave, the registers, the evening and the vigil (expansion P10). The rite of the
 * four lamps (the tellings, kr.t_cave; a wrong telling's dead end explains itself); the Copying Room and the Teller's
 * Shadow; the registers: the road's lamps by name (one of them Ren's, never reached), the keepers' first telling of
 * しじま in three hands that don't agree, the order's last pages (S1, S2: deepens, never explains). Then the evening
 * at the lodge (each companion's beat is in 24_scenes_comp.js), the vigil of ninety-nine wicks, the Hundredth Tale,
 * and dawn with every lamp on the road lit. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene kr.cave_enter
# Staged: a long cave lined with shelves of registers; four lamp niches in the far wall, all dark; a stone desk before
# them with a bell hanging over it; a door in the rock behind.
!set kr_cave_seen
narr: {棚|たな} に {帳面|ちょうめん} が {並|なら}ぶ {長|なが}い {洞|ほら} 。 {奥|おく} の {壁|かべ} に {灯明|とうみょう} の {窪|くぼ}み が {四|よっ}つ 。 どれ も {暗|くら}い 。 || A long cave lined with shelves of registers. Four lamp niches in the far wall, all dark.
narr: {石|いし} の {机|つくえ} の {上|うえ} に 、 {小|ちい}さな {鐘|かね} が {下|さ}がって いる 。 {奥|おく} の {戸|と} は {閉|し}まって いる 。 || Over a stone desk hangs a small bell. The door at the back is shut.
!quest kr_main 4

@scene kr.rite
# The four lamps, lit in the order the tellings agree on (kr.t_cave). All four sources first: the stele, the song,
# Kikyō's scroll and Hisae's memory.
!if kr_rite_done -> done
!if !kr_stele_read -> stele
!if !kr_rhyme_heard -> rhyme
!if !kr_scroll_done -> scroll
narr: {四|よっ}つ の {灯|ひ} の {順番|じゅんばん} 。 {碑|ひ} 、 ヒサエ の {記憶|きおく} 、 {子供|こども} の {歌|うた} 、 キキョウ の {絵巻|えまき} 。 {並|なら}べて {比|くら}べよう 。 || The order of the four lamps: the stele, Hisae's memory, the children's song, Kikyō's scroll. Set them side by side.
!hook tellings kr.t_cave
!if var._tell=cancel -> later
!if var._tell=no -> wrong
!sfx lantern
narr: {東|ひがし} 、 {泉|いずみ} 、 {名|な} 。 {灯|ひ} が {一|ひと}つ ずつ ともり 、 {最後|さいご} に {鐘|かね} が {鳴|な}った 。 || East, spring, name: one by one the lamps catch. Last, the bell rings.
!sfx bell
!set kr_rite_done
!unset kr_cave_wrong
narr: {奥|おく} の {戸|と} が 、 {重|おも}い {音|おと} を {立|た}てて {開|ひら}いた 。 || The door at the back opens with a heavy sound.
?(comp=ren) comp[smile]: {全部|ぜんぶ} が {正|ただ}しい わけ じゃ なかった 。 でも 、 {全部|ぜんぶ} が {少|すこ}し ずつ {正|ただ}しかった 。 || None of them was all right. But each of them was a little right.
?(comp=nao) comp: {碑|ひ} と 、 ばあさん と 、 {絵巻|えまき} 。 {三|みっ}つ が {同|おな}じ {宛先|あてさき} を {指|さ}して いた な 。 || The stele, the old woman and the scroll. All three pointed at the same address.
?(comp=mio) comp[smile]: {歌|うた} だけ 、 {少|すこ}し {違|ちが}って いました ね 。 {子供|こども} の {歌|うた} は 、 {覚|おぼ}え{易|やす}い {順|じゅん} に なる の かしら 。 || Only the song was a little different. Maybe children's songs settle into the order that's easiest to remember.
?(comp=suzu) comp[laugh]: {歌|うた} は {節|ふし} が {大事|だいじ} 。 {順番|じゅんばん} より {響|ひび}き よ 。 {歌|うた} の {身|み} に も なって あげて 。 || A song cares about the tune. The sound matters more than the order. Spare a thought for the song.
!quest kr_main 5
!journal {洞|ほら} の {奥|おく} の {戸|と} が {開|ひら}いた 。 {灯守|ひもり} の {記録|きろく} は 、 {奥|おく} の {書庫|しょこ} に ある 。 || The cave's inner door is open. The keepers' registers are in the deepest shelves.
!end
:wrong
!sfx bell
narr: {鐘|かね} が {鳴|な}った 。 {名|な} の {灯|ひ} を {点|つ}ける {前|まえ} に 。 {奥|おく} の {戸|と} は {動|うご}かない 。 || The bell rings, before the name lamp is lit. The door at the back doesn't move.
narr: {代|か}わり に 、 {西|にし} の {棚|たな} が {横|よこ} に {滑|すべ}って 、 {狭|せま}い {通路|つうろ} が {現|あらわ}れた 。 || Instead, a shelf on the west side slides aside onto a narrow passage.
!set kr_cave_wrong
!end
:later
narr: {順番|じゅんばん} は 、 また {後|あと} で {考|かんが}えよう 。 || You can work out the order later.
!end
:stele
narr: {順番|じゅんばん} を {決|き}める {前|まえ} に 、 {尾根|おね} の {碑|ひ} を {読|よ}んで おきたい 。 || Before deciding the order, you'd like to read the ridge's stele.
!end
:rhyme
narr: {狐橋|きつねばし} の {子供|こども} たち が {歌|うた}って いた {歌|うた} も 、 {聞|き}いて おきたい 。 || You'd like to hear the song the Fox Bridge children were singing, too.
!end
:scroll
narr: キキョウ の {絵巻|えまき} は 、 まだ {字|じ} が {流|なが}れた まま だ 。 || Kikyō's scroll still has its captions washed out.
!end
:done
narr: {四|よっ}つ の {灯|ひ} が 、 {静|しず}か に {燃|も}えて いる 。 || The four lamps burn quietly.

@scene kr.cave_shelf
narr: {重|おも}い {棚|たな} 。 {床|ゆか} に 、 {横|よこ} に {滑|すべ}った {跡|あと} が ある 。 || A heavy shelf, with scrapes on the floor where it has slid sideways.

@scene kr.cave_deadend
# The dead end that explains itself: the keepers carved the rule where a wrong order would bring you.
!gesture pc read 2,10
narr: {行|い}き{止|ど}まり 。 {石|いし} に {字|じ} が {彫|ほ}って ある 。 || A dead end. There are characters cut in the stone.
narr: 「{鐘|かね} が {鳴|な}れば 、 {灯|ひ} は {終|お}わり 。 {名|な} の {灯|ひ} は 、 {鐘|かね} より {先|さき} に {点|つ}ける こと 。」 || "When the bell rings, the lighting is over. The name lamp is lit before the bell."
?(comp=ren) comp[think]: {鐘|かね} は {終|お}わり の {合図|あいず} 。 ヒサエ さん の {言|い}った とおり です 。 {歌|うた} の {順番|じゅんばん} は 、 {節|ふし} の ため に {入|い}れ{替|か}わって いた ん です ね 。 || The bell is the signal to stop, just as Hisae said. The song's order was swapped to fit the tune.
?(comp=nao) comp: {歌|うた} の {順|じゅん} を {信|しん}じた {俺|おれ} たち の {負|ま}け だ 。 …… {次|つぎ} は {名|な} が {先|さき} だ 。 || Our mistake for trusting the song's order. …Name first, next time.
?(comp=mio) comp: {歌|うた} は 、 {順番|じゅんばん} まで は {保証|ほしょう} して くれない の ね 。 もう {一度|いちど} 。 || A song won't vouch for the order. Once more, then.
?(comp=suzu) comp[smirk]: {鐘|かね} は {幕|まく} {切|ぎ}れ の {合図|あいず} 。 {途中|とちゅう} で {鳴|な}らしたら 、 {芝居|しばい} は {終|お}わっちゃう わ 。 || The bell is the curtain. Ring it in the middle and the play's over.
narr: {洞|ほら} の {灯|ひ} が {消|き}えて 、 {棚|たな} が {元|もと} に {戻|もど}った 。 || The cave's lamps go out, and the shelf slides back.
!unset kr_cave_wrong
!warp kr.cave1 14 9 up

@scene kr.cave_inner_shut
narr: {奥|おく} の {戸|と} 。 {鍵|かぎ} {穴|あな} は ない 。 {灯|ひ} の {順番|じゅんばん} で {開|ひら}く らしい 。 || The back door. No keyhole: it seems to open by the order of the lamps.

@scene kr.copy_desk
narr: {灯守|ひもり} が {帳面|ちょうめん} を {写|うつ}した {机|つくえ} 。 {墨|すみ} が {乾|かわ}いて 、 {筆|ふで} が {一本|いっぽん} {残|のこ}って いる 。 || A desk where the keepers copied their registers. The ink has dried; one brush is left.

@scene kr.cave_bench
narr: {写|うつ}し{場|ば} の {長椅子|ながいす} 。 {灯|ひ} の そば で 、 {一休|ひとやす}み できる 。 || A long bench in the Copying Room. You can rest here by the lamp.
!heal

@scene kr.cave_stairs_shut
narr: {下|した} へ {降|お}りる {階段|かいだん} の {前|まえ} に 、 {黒|くろ}い {影|かげ} が {立|た}って いる 。 || A dark shadow stands before the stairs going down.

@scene kr.shadow_gate
# The Teller's Shadow at the stairs: it retells what you did, wrongly, until the account is put right.
!if kr_cave2_open -> end
narr: {階段|かいだん} の {前|まえ} の {壁|かべ} に 、 {扇|おうぎ} を {持|も}った {影|かげ} が {映|うつ}った 。 「{旅人|たびびと} は 、 {西|にし} の {灯|ひ} を {最初|さいしょ} に {点|つ}けた ……」 || On the wall before the stairs a shadow with a fan appears. "The travellers lit the west lamp first…"
!encounter kr.shadow_gate
:end

@scene kr.cave_down
!warp kr.cave3 5 14 right

@scene kr.cave_up
!warp kr.cave2 24 4 left

@scene kr.ghost_lectern
# The Lantern Ghost by the lectern: the apprentice's tale with its ending changed.
!if kr_ghost_calmed -> end
narr: {書見台|しょけんだい} の {横|よこ} に 、 {提灯|ちょうちん} が {一|ひと}つ {下|さ}がって いる 。 {骨|ほね} が {裂|さ}けて 、 {口|くち} の よう に {笑|わら}った 。 || A lantern hangs beside the lectern. One rib splits, and it grins like a mouth.
!encounter kr.ghost_lectern
:end

@scene kr.registers
# The registers (S1, S2): the road's lamps by name; the keepers' first telling of しじま in three hands; the last
# pages. Deepens the mystery; explains nothing that belongs to the finale.
!if kr_registers_read -> again
!gesture pc read 12,4
narr: {灯守|ひもり} の {記録|きろく} 。 {一番|いちばん} {古|ふる}い {帳面|ちょうめん} から {順|じゅん} に 、 {道|みち} の {灯|ひ} の {名前|なまえ} が {並|なら}んで いる 。 || The keepers' registers. From the oldest volume on, the names of the road's lamps, in order.
narr: {迎|むか}え の {灯|ひ} 、 {杉|すぎ} の {灯|ひ} 、 {羊歯|しだ} の {灯|ひ} 、 {狐|きつね} の {灯|ひ} 、 {尾根|おね} の {灯|ひ} …… 。 || The Welcoming Light, the Cedar Light, the Fern Light, the Fox Light, the Ridge Light…
narr: {一番|いちばん} {古|ふる}い {頁|ページ} に 、 しじま の こと が {書|か}いて ある 。 {三人|さんにん} の {違|ちが}う {手|て} で 。 || On the oldest page, something about the shijima. In three different hands.
narr: {一|ひと}つ {目|め} 。 「しじま は 、 {名|な} を {静|しず}か に {持|も}って いく 。 {名|な} を {呼|よ}べ 。 {呼|よ}ばれた {名|な} は {残|のこ}る 。」 || The first: "The shijima quietly takes names away. Call them. A name that is called stays."
narr: {二|ふた}つ {目|め} 。 「しじま は 、 {声|こえ} を {嫌|きら}う 。 {鐘|かね} を {鳴|な}らせ 。」 || The second: "The shijima hates a voice raised. Ring the bells."
narr: {三|みっ}つ {目|め} 。 「しじま に {逆|さか}らう な 。 {静|しず}か に して いれば 、 {通|とお}り{過|す}ぎる 。」 || The third: "Do not resist the shijima. Keep quiet, and it will pass."
narr: {後|あと} の {頁|ページ} ほど 、 {三|みっ}つ{目|め} の {字|じ} に {似|に}た {手|て} が {増|ふ}えて いく 。 そして 、 {灯|ひ} の {名前|なまえ} が 、 {一|ひと}つ 、 また {一|ひと}つ {消|き}えて いく 。 || The later the pages, the more the hands look like the third. And the lamps' names drop out, one by one.
narr: {最後|さいご} の {頁|ページ} は 、 {三十年|さんじゅうねん} {前|まえ} 。 「{最後|さいご} の {一人|ひとり} 、 {山|やま} を {下|お}りる 。 ヒサエ のみ {残|のこ}る 。」 || The last page is thirty years old: "The last one goes down the mountain. Only Hisae remains."
!give kr_register
!set kr_registers_read
!set kr_night
?(comp=nao) !call kr.nao_registers
?(comp=mio) comp[sad]: {静|しず}か に して いれば {通|とお}り{過|す}ぎる …… 。 {通|とお}り{過|す}ぎなかった ん です ね 。 {灯|ひ} が {一|ひと}つ ずつ 、 {消|き}えて いった 。 || Keep quiet and it will pass… It didn't pass. The lamps went out one by one.
?(comp=ren) !call kr.ren_registers
?(comp=suzu) comp: {三|みっ}つ の {台本|だいほん} が あって 、 {一番|いちばん} {楽|らく} な の が {勝|か}った の ね 。 …… {黙|だま}って いる の が 、 {一番|いちばん} {楽|らく} だ もの 。 || Three scripts, and the easiest one won. …Keeping quiet is always easiest.
narr: ヒサエ は 、 {仲間|なかま} が みんな {山|やま} を {下|お}りた こと を 、 {知|し}って いる の だろう か 。 || Does Hisae know the others all went down the mountain?
!quest kr_main 6
?(!quest.kr_hisae) !quest kr_hisae 0
!journal {記録|きろく} を {読|よ}んだ 。 しじま に ついて 、 {三|みっ}つ の {違|ちが}う {言|い}い{伝|つた}え 。 {今夜|こんや} 、 {宿坊|しゅくぼう} で {夜|よ}{通|どお}し の {番|ばん} を する 。 || You read the registers: three tellings of the shijima that don't agree. Tonight, the vigil at the lodge.
narr: {洞|ほら} を {出|で}る と 、 もう {日|ひ} が {暮|く}れて いた 。 || When you come out of the cave, night has fallen.
!warp kr.lodge 20 5 down
!end
:again
narr: {灯守|ひもり} の {記録|きろく} 。 しじま の {三|みっ}つ の {言|い}い{伝|つた}え 。 「{名|な} を {呼|よ}べ 」 「{鐘|かね} を {鳴|な}らせ 」 「{逆|さか}らう な 」 。 || The keepers' registers. The shijima's three tellings: "Call the names", "Ring the bells", "Do not resist".

@scene kr.vigil_begin
# The vigil (R8): ninety-nine wicks, a story at each, the room darkening; Hisae and Kikyō tell; the companion takes a
# turn (Suzu tells with Kikyō in her route). At the ninety-ninth, the Hundredth Tale.
!set kr_vigil_begun
narr: {灯明|とうみょう} の {間|ま} 。 {壁|かべ} に {沿|そ}って 、 {芯|しん} が {九十九|きゅうじゅうきゅう} {本|ほん} 。 || The Room of Wicks. Ninety-nine wicks along the walls.
kr_hisae: {灯守|ひもり} は 、 {年|とし} に {一度|いちど} 、 ここ で {夜|よ}{通|どお}し {話|はなし} を した 。 {一|ひと}つ {話|はな}す たび に 、 {芯|しん} を {一本|いっぽん} {消|け}す 。 || Once a year the keepers told stories here all night. With each story, one wick is put out.
kr_hisae: {九十九|きゅうじゅうきゅう} の {話|はなし} を したら 、 {夜|よ} が {明|あ}ける 。 {百|ひゃく} {番目|ばんめ} は 、 {語|かた}らない 。 それ が {決|き}まり さ 。 || After ninety-nine, the dawn comes. The hundredth is not told. That's the rule.
!fade out
narr: ヒサエ が {語|かた}り 、 キキョウ が {語|かた}り 、 {芯|しん} が {一本|いっぽん} 、 また {一本|いっぽん} と {消|き}えて いく 。 || Hisae tells, Kikyō tells, and the wicks go out, one and then another.
?(comp=nao) narr: ナオ は 、 {届|とど}かなかった {手紙|てがみ} の {話|はなし} を {一|ひと}つ {語|かた}った 。 {誰|だれ} の {手紙|てがみ} か は 、 {言|い}わなかった 。 || Nao tells a story about a letter that never arrived. Whose letter, they don't say.
?(comp=mio) narr: ミオ は 、 {母|はは} から {聞|き}いた {薬草|やくそう} の {話|はなし} を {語|かた}った 。 {途中|とちゅう} で {少|すこ}し 、 {声|こえ} が {詰|つ}まった 。 || Mio tells a story about herbs, one her mother told. Halfway through, her voice catches a little.
?(comp=ren) narr: レン は 、 {灯|ひ} の {名前|なまえ} を {一|ひと}つ ずつ {唱|とな}える {話|はなし} を 、 {静|しず}か に {語|かた}った 。 || Ren quietly tells a story of lamps' names, recited one by one.
?(comp=suzu) narr: スズ は 、 キキョウ と {掛|か}け{合|あ}い で {語|かた}った 。 {笑|わら}い{声|ごえ} が 、 {暗|くら}い {部屋|へや} に {響|ひび}いた 。 || Suzu tells a tale with Kikyō, trading lines like a double act. Laughter rings in the dark room.
!fade in
narr: {九十八|きゅうじゅうはち} {本目|ほんめ} が {消|き}えた 。 {残|のこ}る {芯|しん} は 、 {一本|いっぽん} 。 || The ninety-eighth goes out. One wick is left.
kr_kikyo: {九十九|きゅうじゅうきゅう} {番目|ばんめ} は 、 {灯守|ひもり} の {見習|みなら}い の {話|はなし} 。 {見習|みなら}い は 、 {東|ひがし} の {灯|ひ} を {点|とも}し …… || The ninety-ninth is the tale of the keepers' apprentice. The apprentice lit the east lamp…
narr: その {時|とき} 、 {部屋|へや} の {隅|すみ} の {闇|やみ} が 、 {集|あつ}まり{始|はじ}めた 。 || Just then the dark in the corner of the room begins to gather.
!encounter kr.hyakuwa
!set kr_vigil_done
!unset kr_night
!call kr.dawn

@scene kr.dawn
# Dawn: the vigil kept; every lamp on the road lit (the props read kr_vigil_done); Hisae's thanks.
!fade out
!warp kr.lodge 20 12 up
!fade in
narr: {夜|よ} が {明|あ}けた 。 {宿坊|しゅくぼう} を {出|で}る と 、 {尾根|おね} の {灯籠|とうろう} が 、 {麓|ふもと} まで {全部|ぜんぶ} {点|つ}いて いた 。 || Dawn. Out of the lodge, every lantern along the ridge is lit, all the way down to the foot of the road.
!sfx bell
kr_hisae: …… {百話目|ひゃくわめ} は 、 {今年|ことし} も {語|かた}られなかった 。 {道|みち} の {灯|ひ} が 、 {全部|ぜんぶ} {戻|もど}った 。 {三十年|さんじゅうねん} ぶり だ よ 。 || …The hundredth went untold again this year. Every lamp on the road is back. First time in thirty years.
?(kr_tale_closed) kr_hisae[smile]: {九十九|きゅうじゅうきゅう} {番目|ばんめ} を 、 あんな {風|ふう} に {終|お}わらせる と は ね 。 {灯守|ひもり} でも 、 なかなか できない よ 。 || To end the ninety-ninth like that. Not many keepers could.
kr_hisae: {峠|とうげ} の {道|みち} も 、 {明|あか}るく なった 。 {灯落|ひおち} へ お{行|い}き 。 {灯|ひ} の {名前|なまえ} を 、 {忘|わす}れる んじゃ ない よ 。 || The road over the pass is light now too. Go on to Lanternfall. And don't forget the lamps' names.
!quest kr_main 7
?(quest.kr_hisae=0) !quest kr_hisae 1
!journal {夜|よ} が {明|あ}けて 、 {灯守|ひもり} の {道|みち} の {灯|ひ} が {全部|ぜんぶ} {戻|もど}った 。 {峠|とうげ} を {越|こ}えて 、 {灯落|ひおち} へ 。 || Dawn, and every lamp on the keepers' road is back. Over the pass to Lanternfall.
!autosave

@scene kr.vigil_hisae
!faceplayer
kr_hisae: {芯|しん} が {一本|いっぽん} {消|き}える たび に 、 {話|はなし} が {一|ひと}つ {終|お}わる 。 {終|お}わる の は 、 {悪|わる}い こと じゃ ない よ 。 || Each wick that goes out is a story ended. An ending isn't a bad thing.

@scene kr.vigil_kikyo
!faceplayer
kr_kikyo: {語|かた}り は 、 {終|お}わり が {一番|いちばん} {難|むずか}しい の 。 {始|はじ}める の は 、 {誰|だれ} でも できる けど 。 || In telling, the ending is the hardest part. Anyone can begin.
`, 'kr/vigil');
