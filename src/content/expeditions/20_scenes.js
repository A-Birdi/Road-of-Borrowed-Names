/* The Flood Cellars' scenes (expansion P07 pilot): Yasu, who keeps the River Warehouse; the hatch and its preview
 * card; the notices; the stations, the grate and the ladder (the shortcut), the sluice and the outflow door; the way
 * out. The hooks (xp_*) are src/ui/89b_expedition.js. Flags: xp_cellars_… belong to one visit (a restart clears
 * them); xpk_cellars_… are kept (what was heard, taught, opened and finished). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene xp.cellars_yasu
# Staged: Yasu nods back toward the warehouse, then down at the boards, as if he could see the water under them.
!faceplayer yasu
!gesture yasu point 29,24
yasu: {倉庫|そうこ} の {下|した} に 、 {米|こめ} を {置|お}く {地下|ちか} が ある 。 {嵐|あらし} の {夜|よる} から 、 {水|みず} が {引|ひ}かない 。 || There's a cellar under the warehouse where we keep the rice. Since the night of the storm, the water hasn't gone down.
!look yasu pc
yasu: {若|わか}い {者|もん} が {水|みず} を {抜|ぬ}こう と した が 、 {途中|とちゅう} で {逃|に}げて きた 。 {貼|は}り{紙|がみ} だけ {残|のこ}して な 。 || The young hands tried to drain it, and ran off halfway. They left their notices, at least.
yasu: {何|なに} を やって 、 {何|なに} を やって ない か 。 {読|よ}める {者|もん} が {行|い}けば 、 {水|みず} は {抜|ぬ}ける 。 {急|いそ}ぐ {話|はなし} じゃ ない 。 {床|ゆか} の {上|うえ} の {戸|と} から {降|お}りられる 。 || What they did, and what they didn't. Someone who can read that could drain it. No hurry. The hatch in the floor will take you down.
?(comp=mio) comp: {水|みず} に {浸|つ}かった {米|こめ} は 、 {早|はや}く {出|だ}さない と {傷|いた}む わ 。 …… {行|い}って みましょう か 。 || Rice that's been in water spoils if it isn't brought out soon. …Shall we go and see?
?(comp=nao) comp: {逃|に}げる {前|まえ} に {貼|は}り{紙|がみ} を {残|のこ}す か 。 {律儀|りちぎ} な {連中|れんちゅう} だ な 。 || They ran, but left notices first. Conscientious lot.
?(comp=ren) comp: {貼|は}り{紙|がみ} が {残|のこ}って いる なら 、 {灯|あか}り の {書|か}き{置|お}き と {同|おな}じ です 。 {前|まえ} の {人|ひと} の {手|て} を {読|よ}めば いい 。 || If the notices are still there, it's like a lamplighter's note. We just read the hand that came before.
?(comp=suzu) comp: やった こと と 、 やって ない こと 。 {帳簿|ちょうぼ} と {同|おな}じ だ ね 。 {締|し}め は {私|わたし} たち か 。 || What's been done and what hasn't: just like a ledger. And we close the books, do we?
!set xpk_cellars_heard

@scene xp.cellars_yasu_done
!faceplayer yasu
!gesture yasu nod pc
yasu: {水|みず} が {引|ひ}いた な 。 {米|こめ} も {無事|ぶじ} だ 。 …… {若|わか}い {者|もん} の {貼|は}り{紙|がみ} も 、 {読|よ}む {者|もん} が いて {初|はじ}めて {役|やく} に {立|た}つ 。 || The water's down. The rice is safe. …Even the young hands' notices are only any use once someone reads them.
yasu: {下|した} は いつでも {使|つか}って いい 。 {寒|さむ}い が 、 {静|しず}か だ ぞ 。 || Use the cellars whenever you like. Cold, but quiet.
!set xpk_cellars_thanked

@scene xp.cellars_hatch
narr: {床|ゆか} に {四角|しかく} い {戸|と} が ある 。 {下|した} から 、 {水|みず} の {匂|にお}い が {上|あ}がって くる 。 || A square hatch in the floor. The smell of water rises from below.
!hook xp_preview cellars
!if var._res=0 -> later
!hook xp_enter cellars
!end
:later
narr: {戸|と} を {閉|し}めた 。 {急|いそ}ぐ {話|はなし} じゃ ない 。 || You close the hatch. It can wait.

@scene xp.cellars_first
# Staged: the companion looks round at the dark passages, then at the board by the ladder.
narr: {冷|つめ}たい {空気|くうき} 。 {通路|つうろ} が {左右|さゆう} に {分|わ}かれて 、 {奥|おく} へ {続|つづ}いて いる 。 || Cold air. The passages split left and right and go on into the dark.
?(comp=mio) comp: {壁|かべ} の {貼|は}り{紙|がみ} 、 {先|さき} に {読|よ}んで おきましょう 。 {何|なに} が {済|す}んで いる か 、 {分|わ}かる はず よ 。 || Let's read the notice on the wall first. It should tell us what's already been done.
?(comp=nao) comp: {道|みち} は {二|ふた}つ 、 {行|い}き{先|さき} は {一|ひと}つ か 。 …… まず {貼|は}り{紙|がみ} だ な 。 || Two ways, one destination. …The notice first.
?(comp=ren) comp: {貼|は}り{紙|がみ} が あります 。 {前|まえ} の {人|ひと} が {何|なに} を {済|す}ませた か 、 {読|よ}んで から {進|すす}みましょう 。 || There's a notice. Let's read what the last people finished before we go on.
?(comp=suzu) comp: {貼|は}り{紙|がみ} が {先|さき} だ よ 。 {前|まえ} の {人|ひと} の {仕事|しごと} を {二回|にかい} やる の は 、 {損|そん} だ から ね 。 || Notice first. Doing the last lot's work twice is a loss on the books.

@scene xp.cellars_board
narr: 「 {米|こめ} は {棚|たな} の {上|うえ} に {上|あ}げて あります 。 {階段|かいだん} の {灯|あか}り は つけて あります 。 {下|した} の {水門|すいもん} は まだ です 。 」 || "The rice has been put up on the shelves. The stair light has been switched on. The sluice below is still to do."
!if xpk_cellars_taught -> again
?(comp=mio) comp: 「{上|あ}げて あります」 。 {誰|だれ} か が {上|あ}げて 、 その まま に して ある 、 と いう こと ね 。 || "Has been put up": someone put it up, and left it that way.
?(comp=nao) comp: 「{上|あ}げて あります」 か 。 やった {本人|ほんにん} は {書|か}いて ない が 、 {誰|だれ} か が やった んだ 。 || "Has been put up." Doesn't say who, but somebody did it.
?(comp=ren) comp: 「〜て あります」 は 、 {誰|だれ} か が {済|す}ませて {残|のこ}した {形|かたち} です 。 {灯|あか}り の {帳面|ちょうめん} でも よく {見|み}ます 。 || "〜て あります" is the shape of something someone finished and left. You see it in lamp logs all the time.
?(comp=suzu) comp: 「{上|あ}げて あります」 。 {済|す}み の {判|はん} みたい な もの だ よ 。 {誰|だれ} か が やって 、 その まま に して ある 。 || "Has been put up." Like a "done" stamp: someone did it, and it's been left that way.
!teach te_aru
!set xpk_cellars_taught
:again
!challenge xp.c_notice
!if var._res=0 -> later
?(comp=mio) comp: {済|す}んだ こと は {済|す}んだ こと 。 {私|わたし} たち の {仕事|しごと} は 、 その {先|さき} ね 。 || What's done is done. Our work starts after it.
?(comp=nao) comp: {分|わ}かった 。 {残|のこ}り は {下|した} の {水門|すいもん} だ 。 || Right. What's left is the sluice below.
?(comp=ren) comp: {読|よ}めました ね 。 {残|のこ}って いる の は 、 {下|した} の {水門|すいもん} です 。 || You read it. What's left is the sluice below.
?(comp=suzu) comp: {貸|か}し {借|か}り {無|な}し 。 {残|のこ}り は {下|した} の {水門|すいもん} {一|ひと}つ 。 || All square. One sluice below left on the books.
!end
:later
narr: {貼|は}り{紙|がみ} は 、 いつでも {読|よ}み{直|なお}せる 。 || The notice will still be here to read again.

@scene xp.cellars_tally
narr: {帳面|ちょうめん} が {置|お}いて ある 。 「 {米|こめ} 、 {三十|さんじゅう} {袋|ふくろ} 。 {全部|ぜんぶ} {上|あ}げて ある 。 」 || A tally book has been left here. "Rice, thirty sacks. All put up."
narr: {最後|さいご} の {字|じ} は 、 {急|いそ}いで {書|か}いた {字|じ} だ 。 「 {水|みず} が {来|く}る 。 {灯|あか}り は つけて おく 。 」 || The last line is in a hurried hand. "Water coming. Leaving the light on."

@scene xp.cellars_bench
narr: {壁|かべ} {際|ぎわ} に {長椅子|ながいす} が {置|お}いて ある 。 || A bench has been set against the wall.
!hook xp_station bench

@scene xp.cellars_grate
narr: {床|ゆか} に {鉄|てつ} の {格子|こうし} が ある 。 {下|した} から {留|と}めて あって 、 {上|うえ} から は {開|あ}かない 。 || An iron grate in the floor. It has been fastened from below, and won't open from up here.
?(comp) comp: {向|む}こう {側|がわ} から なら 、 {開|あ}けられる かも 。 || Maybe from the other side.

@scene xp.cellars_lampnote
narr: {棚|たな} に {紙|かみ} が {貼|は}って ある 。 「 ガラス は {拭|ふ}いて あります 。 {油|あぶら} は {箱|はこ} の {中|なか} に {入|い}れて あります 。 ランプ に は まだ {入|い}れて いません 。 」 || A note has been put up on the shelf. "The glass has been wiped. The oil has been put in the box. It is not in the lamp yet."

@scene xp.cellars_lamp
narr: {消|き}えた ランプ 。 {横|よこ} の {紙|かみ} に 、 {手入|てい}れ の {途中|とちゅう} が {書|か}いて ある 。 || A lamp gone out. The note beside it says how far its tending got.
!if xpk_cellars_lamp_known -> known
:read
!call xp.cellars_lampnote
!challenge xp.c_lamp
!if var._res=0 -> later
!set xpk_cellars_lamp_known
!goto lit
:known
!choice
* {前|まえ} と {同|おな}じ よう に {直|なお}す 。 || Tend it as before. -> lit
* {紙|かみ} を {読|よ}み{直|なお}す 。 || Read the note again. -> read
:lit
narr: {箱|はこ} の {油|あぶら} を ランプ に {入|い}れて 、 {火|ひ} を つけた 。 {部屋|へや} が {明|あか}るく なる 。 || You fill the lamp from the box and light it. The room brightens.
!set xp_cellars_lamp_fixed
!refresh
narr: ここ で {一度|いちど} 、 {休|やす}める 。 || You can rest here once.
!end
:later
narr: ランプ は {消|き}えた まま だ 。 || The lamp stays dark.

@scene xp.cellars_lamp_rest
narr: ランプ が {静|しず}か に {灯|とも}って いる 。 || The lamp burns quietly.
!hook xp_station lamp

@scene xp.cellars_leave
narr: はしご の {上|うえ} に 、 {倉庫|そうこ} の {床|ゆか} の {戸|と} が {見|み}える 。 || Up the ladder, the warehouse hatch.
!choice
* {上|うえ} に {戻|もど}る 。 || Climb out. -> out
* まだ {下|した} に いる 。 || Stay down here. -> stay
:out
!hook xp_leave
!end
:stay
narr: {振|ふ}り{返|かえ}って 、 {通路|つうろ} の {奥|おく} を {見|み}る 。 || You turn back toward the passages.

@scene xp.cellars_b2sign
narr: 「 {西|にし} の {橋|はし} は {渡|わた}れます 。 {東|ひがし} に も {板|いた} を {渡|わた}して あります が 、 {今|いま} は {水|みず} の {下|した} です 。 {水門|すいもん} は {南|みなみ} の {奥|おく} 。 」 || "The west bridge can be crossed. A plank has been laid on the east side too, but it's under water now. The sluice is at the far south end."

@scene xp.cellars_spring
narr: {石|いし} の {井戸|いど} 。 {冷|つめ}たい {水|みず} が {下|した} から {出|で}て くる 。 || A stone well. Cold water rises in it from below.
!hook xp_station spring

@scene xp.cellars_sluice_plate
narr: {銅|どう} の {板|いた} に {手順|てじゅん} が {刻|きざ}んで ある 。 || The steps have been cut into a copper plate.
narr: 「 {水門|すいもん} は もう {閉|し}めて あります 。 {栓|せん} を {抜|ぬ}いて ください 。 」 || "The sluice gate has already been shut. Pull the plug."
narr: 「 {車|くるま} に は {油|あぶら} が さして あります 。 {車|くるま} を {回|まわ}して ください 。 」 || "The wheel has been oiled. Turn the wheel."
narr: 「 {水|みず} が {引|ひ}いたら 、 {栓|せん} を {戻|もど}して ください 。 {東|ひがし} に は {板|いた} が {渡|わた}して あります 。 」 || "When the water has gone down, put the plug back. A plank has been laid across on the east side."

@scene xp.cellars_sluice
narr: {排水|はいすい} の {水門|すいもん} 。 {横|よこ} の {銅|どう} の {板|いた} に 、 {手順|てじゅん} が {刻|きざ}んで ある 。 || The drain sluice. The steps have been cut into a copper plate beside it.
!encounter xp.cellars_sluice
!if var._res=0 -> later
!set xp_cellars_drained
!refresh
narr: {水|みず} の {音|おと} が {遠|とお}く なって いく 。 {北|きた} の {通路|つうろ} と {東|ひがし} の {板|いた} が 、 {水|みず} の {上|うえ} に {出|で}た 。 || The sound of the water goes further and further off. The north passage and the east plank are out of the water.
?(comp=mio) comp: {手順|てじゅん} どおり 。 {薬|くすり} の {調合|ちょうごう} と {同|おな}じ ね 。 || Step by step, exactly as written. Like mixing a remedy.
?(comp=nao) comp: {書|か}いて ある とおり に やれば 、 {水|みず} も {言|い}う こと を {聞|き}く か 。 || Do what it says, and even water does as it's told.
?(comp=ren) comp: {前|まえ} の {人|ひと} の {仕事|しごと} が 、 {無駄|むだ} に ならなくて よかった 。 || I'm glad the last people's work wasn't wasted.
?(comp=suzu) comp: {水|みず} の {勘定|かんじょう} 、 {合|あ}った よ 。 || The water's accounts balance.
!end
:later
narr: {水門|すいもん} は その まま だ 。 {板|いた} の {手順|てじゅん} は 、 {逃|に}げない 。 || The sluice stays as it is. The steps on the plate aren't going anywhere.

@scene xp.cellars_sluice_done
narr: {栓|せん} は {戻|もど}して ある 。 {水門|すいもん} は {閉|し}まった まま 。 || The plug has been put back. The gate stays shut.

@scene xp.cellars_ladder
narr: {上|うえ} へ {続|つづ}く はしご 。 {天井|てんじょう} の {格子|こうし} が 、 こちら {側|がわ} から {留|と}めて ある 。 || A ladder going up. The grate in the ceiling has been fastened from this side.
!if xpk_cellars_sc_ladder -> open
narr: {留|と}め{金|がね} を {外|はず}す と 、 {格子|こうし} が {持|も}ち{上|あ}がった 。 {上|うえ} は 、 はしご の {下|した} の {部屋|へや} だ 。 || You slide the catches back and the grate lifts. Above is the room at the foot of the first ladder.
!hook xp_shortcut cellars ladder
?(comp=mio) comp: これ で 、 {次|つぎ} は ここ まで すぐ {来|こ}られる わ ね 。 || Now we can come straight down here next time.
?(comp=nao) comp: {近道|ちかみち} が {一|ひと}つ 。 {配達|はいたつ} でも {一番|いちばん} {助|たす}かる やつ だ 。 || One shortcut. The kind that helps most on a round.
?(comp=ren) comp: {帰|かえ}り {道|みち} が {短|みじか}く なりました 。 {次|つぎ} に {来|く}る {時|とき} も 、 ここ は {開|あ}いて います 。 || The way back's shorter now. It'll still be open next time we come.
?(comp=suzu) comp: {近道|ちかみち} 、 {開通|かいつう} 。 {幕間|まくあい} が {短|みじか}く なる の は 、 いい こと だ よ 。 || Shortcut open. Shorter intervals are always welcome.
:open
!choice
* はしご を {上|のぼ}る 。 || Climb up. -> up
* {今|いま} は {上|のぼ}らない 。 || Not now. -> stay
:up
!warp rw.cellar1 8 21 up
!end
:stay

@scene xp.cellars_outflow
!if xpk_cellars_done&xp_cellars_outflow -> open
narr: {出口|でぐち} の {戸|と} 。 {貼|は}り{紙|がみ} が {一枚|いちまい} {残|のこ}って いる 。 || The outflow door. One notice is left on it.
narr: 「 {戸|と} に は {鍵|かぎ} が かけて あります 。 {鍵|かぎ} は {右|みぎ} の {柱|はしら} に かけて あります 。 {出|で}る {時|とき} は 、 {戸|と} を {閉|し}めて ください 。 」 || "The door has been locked. The key has been hung on the right-hand post. When you go out, please close the door."
!challenge xp.c_final
!if var._res=0 -> later
narr: {柱|はしら} の {鍵|かぎ} で {戸|と} を {開|あ}けた 。 {外|そと} の {光|ひかり} と 、 {川|かわ} へ {流|なが}れる {水|みず} の {音|おと} 。 || You open the door with the key from the post. Daylight, and the sound of water running down to the river.
narr: {水|みず} が {全部|ぜんぶ} {川|かわ} へ {出|で}て いく まで {待|ま}って 、 {戸|と} を {閉|し}めた 。 {鍵|かぎ} は {柱|はしら} に {戻|もど}して おいた 。 || You wait until the last of the water has gone out to the river, then close the door, and hang the key back on its post.
?(comp=mio) comp: {米|こめ} は {無事|ぶじ} 。 {貼|は}り{紙|がみ} の {人|ひと} たち に も 、 {教|おし}えて あげたい わ 。 || The rice is safe. I'd like the people who wrote the notices to know.
?(comp=nao) comp: {届|とど}いた な 。 {貼|は}り{紙|がみ} の {返事|へんじ} は 、 {乾|かわ}いた {床|ゆか} だ 。 || Delivered. The reply to their notices is a dry floor.
?(comp=ren) comp: {書|か}いた {人|ひと} と {読|よ}んだ {人|ひと} 。 {二人|ふたり} {分|ぶん} の {仕事|しごと} で 、 {水|みず} が {引|ひ}きました 。 || The one who wrote and the one who read. It took both to bring the water down.
?(comp=suzu) comp: {締|し}め 、 {完了|かんりょう} 。 {帳簿|ちょうぼ} が {合|あ}う と 、 {気持|きも}ち が いい ね 。 || Books closed. Nothing feels better than accounts that balance.
!set xpk_cellars_done xp_cellars_outflow
!refresh
!choice
* {上|うえ} に {戻|もど}る 。 || Climb out now. -> out
* もう {少|すこ}し ここ に いる 。 || Stay a little longer. -> stay
:out
!hook xp_leave
!end
:stay
!end
:open
narr: {戸|と} は {閉|し}めて ある 。 {鍵|かぎ} は {柱|はしら} に かけて ある 。 {全部|ぜんぶ} 、 {貼|は}り{紙|がみ} の とおり だ 。 || The door has been closed; the key hangs on its post. Everything as the notice said.
!end
:later
narr: {戸|と} の {前|まえ} で 、 {貼|は}り{紙|がみ} を もう {一度|いちど} {見|み}る 。 {急|いそ}がなくて いい 。 || You look at the notice once more. There's no hurry.
`, 'expeditions/20_scenes.js');
