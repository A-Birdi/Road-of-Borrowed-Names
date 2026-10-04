/* Chapter 5 scenes inside the submerged bell tower: the loft, the three gate
 * plates (negation and condition decide which way the water goes), the
 * conduit junction where こえ is learned, Tōya's traces, the keeper and the
 * ringing of the drowned bell. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene lf.tower_arrive
# Staged: in the belfry loft you look down at the soft, wet floorboards and listen towards the water and the
# whispering below; your companion's own answer (Nao points back down to the one window, Mio checks the lids of her
# bottles, Ren looks between the stairs and the ladder, Suzu's two hands for the acoustics).
!set lf_tower_entered
!gesture pc observe down
narr: {窓|まど} を {越|こ}えて 、{鐘楼|しょうろう} の {屋根裏|やねうら} に {下|お}りる 。{床|ゆか} の {板|いた} が 、{水|みず} を {吸|す}って {柔|やわ}らかい 。|| You climb in through the window and down into the belfry loft. The floorboards are soft with water.
!gesture pc cupear down
narr: {足|あし} の {下|した} から 、{低|ひく}い {音|おと} が {聞|き}こえる 。{水|みず} の {音|おと} と 、{囁|ささや}き の {音|おと} 。|| From below your feet comes a low sound: water, and whispering.
?(comp=nao) !gesture comp point down
?(comp=nao) comp: {入口|いりぐち} は {窓|まど} {一|ひと}つ 。{出口|でぐち} も {窓|まど} {一|ひと}つ 。…… {覚|おぼ}えて おいて 。|| One window in. One window out. …Remember that.
?(comp=mio) !gesture comp check prop=bottle
?(comp=mio) comp[worry]: {湿気|しっけ} が すごい 。{薬|くすり} の {瓶|びん} 、{蓋|ふた} を {確|たし}かめて おく ね 。|| So damp. I'll check the lids on my bottles.
?(comp=ren) !gesture comp lookbetween 12,3 and=5,3
?(comp=ren) comp: {灯|あか}り を {先|さき} に 。{階段|かいだん} は {下|した} …… いえ 、{上|うえ} …… いえ 、{下|した} です 。{水|みず} の {音|おと} が する ほう です 。|| Lamp first. The stairs go down… no, up… no, down. Towards the sound of water.
?(comp=suzu) !gesture comp size
?(comp=suzu) comp: いい {響|ひび}き 。{一言|ひとこと} {言|い}う だけ で 、{塔|とう} {全体|ぜんたい} が {聞|き}いてる みたい 。|| Lovely acoustics. Say one word and the whole tower listens.
!quest lf_main 7
!lesson kana
!checkpoint lf.tower_top 7 9 up
!autosave

@scene lf.roster
# Staged: you lean in to the duty roster, and bend close to the hurried line at its foot; your companion's own
# answer (Nao's nod, Mio's head goes down, Ren leans in to the record, Suzu breathes out).
!gesture pc observe prop:noticeboard
narr: {古|ふる}い {当番表|とうばんひょう} 。「{警鐘|けいしょう} {当番|とうばん}」 。{曜日|ようび} ごと に 、{鐘|かね} を {鳴|な}らす {人|ひと} の {名前|なまえ} が {並|なら}んで いる 。|| An old duty roster: "Warning Bell Duty". A name for each day of the week, the person who would ring the bell.
!gesture pc bend prop:noticeboard
narr: {一番|いちばん} {下|した} に 、{急|いそ}いだ {字|じ} で {書|か}き{足|た}して ある 。「{六月|ろくがつ} {十二日|じゅうににち} {夜|よる} ── トウヤ （ {代|か}わり ）」 。|| At the very bottom, added in a hurried hand: "June 12th, night — Tōya (standing in)."
?(comp=nao) !gesture comp nod
?(comp=nao) comp: {自分|じぶん} で {自分|じぶん} を {当番|とうばん} に {書|か}いた んだ 。…… {字|じ} が {震|ふる}えて ない 。{決|き}めてた んだ な 。|| He wrote himself onto the roster. …The writing doesn't shake. He'd made up his mind.
?(comp=mio) !gesture comp lowered
?(comp=mio) comp[sad]: 「{代|か}わり」 …… 。{誰|だれ} の {代|か}わり でも ない のに 。|| "Standing in"… when he wasn't standing in for anyone.
?(comp=ren) !gesture comp observe prop:noticeboard
?(comp=ren) comp: {当番|とうばん} で は ない {者|もの} が 、{記録|きろく} の {形|かたち} を {守|まも}って {名前|なまえ} を {書|か}いた 。{几帳面|きちょうめん} な の は 、きょうだい {揃|そろ}って です ね 。|| Someone not on duty still kept the form of the record and wrote his name. Meticulousness runs in that family.
?(comp=suzu) !gesture comp exhale
?(comp=suzu) comp: {飛|と}び{入|い}り の {役者|やくしゃ} 。{一番|いちばん} {大事|だいじ} な {場面|ばめん} で 。|| A walk-on performer, for the most important scene of all.

@scene lf.top_plate
narr: {青銅|せいどう} の {小|ちい}さな {札|ふだ} 。「この {下|した} 、{水門|すいもん} {三|みっ}つ 。{札|ふだ} を {読|よ}んで から {動|うご}かす こと 。」|| A small bronze plate. "Below: three sluice gates. Read the plates before you move anything."

@scene lf.trapdoor
narr: {縄|なわ}ばしご の かかった {床|ゆか} の {戸|と} 。{下|した} から {閉|し}まって いて 、{開|あ}かない 。|| A trapdoor with a rope ladder. It's fastened from below and won't open.

@scene lf.upper_logs
narr: {鐘|かね} {当番|とうばん} の {日誌|にっし} 。{水|みず} で {膨|ふく}らんで いる 。|| The bell-duty log, swollen with water.
narr: {最後|さいご} の {頁|ページ} 。{同|おな}じ {急|いそ}いだ {字|じ} で 、{一行|いちぎょう} だけ 。「{鐘|かね} 、{鳴|な}らす 。」|| The last page. In the same hurried hand, a single line: "Ringing the bell."

# ---- plate A: 〜ないと〜ない ----------------------------------------------------------------------------------------------------
@scene lf.plate_a
narr: {青銅|せいどう} の {札|ふだ} に 、{水門|すいもん} の {使|つか}い{方|かた} が {刻|きざ}んで ある 。|| A bronze plate, engraved with instructions for the gates.
!if lf_plate_a_read -> text
!challenge lf.ch_gate1
!set lf_plate_a_read
:text
narr: 「{上|うえ} の {水門|すいもん} を {閉|し}めない と 、{下|した} の {水門|すいもん} は {開|ひら}かない 。」|| "Unless the upper gate is closed, the lower gate will not open."
narr: {車輪|しゃりん} は {二|ふた}つ 。{西|にし} の {壁|かべ} に 「{上|うえ}」 、{東|ひがし} の {壁|かべ} に 「{下|した}」 。|| Two wheels: "upper" on the west wall, "lower" on the east wall.

@scene lf.wheel_upper
# Staged: you look over the wheel of the upper gate; turning it, you lean into it as it groans shut. Already closed:
# you look it over.
!if lf_up_closed -> already
!gesture pc observe prop:lf_wheel
narr: 「{上|うえ} の {水門|すいもん}」 と {書|か}かれた {車輪|しゃりん} 。{今|いま} は {開|あ}いて いる 。|| A wheel marked "upper gate". It's open at the moment.
!choice
* {回|まわ}して 、{閉|し}める || Turn it and close the gate -> close
* そのまま に する || Leave it -> end
:close
!sfx door
!gesture pc bend prop:lf_wheel
narr: ぎし 、ぎし …… 。{重|おも}い {音|おと} を たてて 、{上|うえ} の {水門|すいもん} が {閉|し}まった 。|| Creak… creak… With a heavy groan, the upper gate closes.
!set lf_up_closed
!end
:already
!gesture pc observe prop:lf_wheel
narr: {上|うえ} の {水門|すいもん} は 、{閉|し}まって いる 。|| The upper gate is closed.

@scene lf.wheel_lower
# Staged: you look over the wheel of the lower gate and lean into it; as the water drains you look to the stairs
# down; your companion's own answer (Nao's nod, Mio points to the stairs, Ren's open hand to them, Suzu's small
# celebration). Stuck: you lean into the wheel in vain, and look over to the plate on the wall; your companion
# points you to the upper gate first (Nao, Ren), Mio opens a hand towards it, Suzu counts the skipped step.
!if lf_gate_a -> done
!gesture pc observe prop:lf_wheel
narr: 「{下|した} の {水門|すいもん}」 の {車輪|しゃりん} 。|| The wheel for the "lower gate".
!choice
* {回|まわ}して 、{開|あ}ける || Turn it to open the gate -> try
* やめて おく || Leave it -> end
:try
!if !lf_up_closed -> stuck
!sfx water
!shake
!gesture pc bend prop:lf_wheel
narr: {車輪|しゃりん} が {回|まわ}った 。{足|あし} の {下|した} で 、{水|みず} が ごうごう と {流|なが}れ{出|だ}す 。|| The wheel turns. Beneath your feet, water starts to roar away.
!gesture pc lookroad 10,13
narr: {下|した} へ {続|つづ}く {階段|かいだん} の {水|みず} が 、みるみる {引|ひ}いて いく 。|| The water on the stairs down drains away before your eyes.
!set lf_gate_a
?(comp=nao) !gesture comp nod
?(comp=nao) comp: {読|よ}んだ {通|とお}り に {動|うご}いた 。…… {札|ふだ} 、{信用|しんよう} できる じゃん 。|| It did exactly what it said. …Guess the plates can be trusted.
?(comp=mio) !gesture comp point 10,13
?(comp=mio) comp[smile]: {水|みず} が {引|ひ}いた 。{先|さき} へ {進|すす}めそう 。|| The water's gone down. We can keep going.
?(comp=ren) !gesture comp palm 10,13
?(comp=ren) comp: {条件|じょうけん} を {満|み}たせば 、{扉|とびら} は {開|ひら}く 。{灯|ひ} の {道|みち} と {同|おな}じ です 。|| Meet the condition and the door opens. Just like the lantern roads.
?(comp=suzu) !gesture comp celebrate
?(comp=suzu) comp[laugh]: {第一幕|だいいちまく} 、{成功|せいこう} ！|| Act one: a success!
!autosave
!end
:stuck
!gesture pc bend prop:lf_wheel
narr: {車輪|しゃりん} は 、びくとも しない 。|| The wheel won't budge.
?(!lf_plate_a_read) !gesture pc lookroad 5,2
?(!lf_plate_a_read) narr: {近|ちか}く の {壁|かべ} に 、{青銅|せいどう} の {札|ふだ} が ある 。{先|さき} に {読|よ}んで みよう 。|| There's a bronze plate on the wall nearby. Better read it first.
?(lf_plate_a_read&comp=nao) !gesture comp point 2,5
?(lf_plate_a_read&comp=nao) comp: 「{閉|し}めない と 、{開|ひら}かない」 。{上|うえ} が {先|さき} だよ 。|| "Unless it's closed, it won't open." Upper first.
?(lf_plate_a_read&comp=mio) !gesture comp palm 2,5
?(lf_plate_a_read&comp=mio) comp: {札|ふだ} に は 、{上|うえ} を {先|さき} に {閉|し}める って …… {書|か}いて なかった ？|| Didn't the plate say to close the upper one first?
?(lf_plate_a_read&comp=ren) !gesture comp point 2,5
?(lf_plate_a_read&comp=ren) comp: {札|ふだ} の {条件|じょうけん} を 、まだ {満|み}たして いません 。{西|にし} の {車輪|しゃりん} です 。|| We haven't met the plate's condition yet. The west wheel.
?(lf_plate_a_read&comp=suzu) !gesture comp count
?(lf_plate_a_read&comp=suzu) comp: {段取|だんど}り を {飛|と}ばした わ ね 。{上|うえ} が {先|さき} 。|| We skipped a step. Upper first.
!end
:done
!gesture pc lookroad 10,13
narr: {下|した} の {水門|すいもん} は 、{開|あ}いて いる 。{水|みず} は {下|した} の {階|かい} へ {流|なが}れて いった 。|| The lower gate is open. The water has gone down to the next level.

# ---- the gate works: plate B and the junction ------------------------------------------------------------------------------------
@scene lf.mid_enter
# Staged: arriving in the gate works you look over the slowly turning gears and down at the black water; you go to
# the rope ladder and bend to unhook its catch (the narration), your companion coming along beside you; their own
# answer (Nao's nod at one more way out, Mio breathes out, Ren's open hand to the ladder, Suzu points to it).
!set lf_mid_seen lf_shortcut
!gesture pc observe 7,2
narr: {水門|すいもん} の {機械室|きかいしつ} 。{古|ふる}い {歯車|はぐるま} が 、まだ ゆっくり と {回|まわ}って いる 。|| The gate works. Old gears are still turning, slowly.
!gesture pc lookroad down
narr: {部屋|へや} の {南|みなみ} {半分|はんぶん} は 、{黒|くろ}い {水|みず} の {下|した} だ 。|| The southern half of the room is under black water.
!walkto pc 4 3 left
!walkto comp 5 3 left
!gesture pc bend 3,3
narr: {壁|かべ} に 、{縄|なわ}ばしご が かかって いる 。{上|うえ} の {屋根裏|やねうら} の {床|ゆか} の {戸|と} まで {続|つづ}いて いる 。{外|はず}した {留|と}め{金|がね} が 、からん と {鳴|な}った 。|| A rope ladder hangs on the wall, running up to the trapdoor in the loft. You unhook its catch; it clanks free.
?(comp=nao) !gesture comp nod
?(comp=nao) comp: {出口|でぐち} 、{一|ひと}つ {増|ふ}えた 。…… {少|すこ}し {落|お}ち{着|つ}いた 。|| One more way out. …I feel a bit better.
?(comp=mio) !gesture comp exhale
?(comp=mio) comp: これ で 、{何|なに} か あって も {上|うえ} へ {戻|もど}れる ね 。|| Now we can get back up if anything happens.
?(comp=ren) !gesture comp palm 3,3
?(comp=ren) comp: {近道|ちかみち} です 。…… {私|わたし} が {迷|まよ}って も 、はしご は {迷|まよ}いません 。|| A shortcut. …Even if I get lost, the ladder won't.
?(comp=suzu) !gesture comp point 3,3
?(comp=suzu) comp: {舞台|ぶたい} の {袖|そで} から {奈落|ならく} へ 、{抜|ぬ}け{道|みち} {確保|かくほ} 。|| An exit from the wings down to the understage — secured.
!toast {近道|ちかみち} が {開|ひら}いた || Shortcut: the rope ladder now links the gate works and the loft.
!checkpoint lf.tower_mid 10 2 down
!autosave

@scene lf.gears
narr: {大|おお}きな {歯車|はぐるま} 。{歯|は} の {一|ひと}つ {一|ひと}つ に 、{小|ちい}さな {字|じ} が {刻|きざ}んで ある 。「{上|のぼ}り 」 「{上|のぼ}り 」 「{上|のぼ}り 」 。|| A great gear. Each of its teeth is stamped with tiny writing: "uphill", "uphill", "uphill".

@scene lf.ladder_mid
narr: {屋根裏|やねうら} へ {続|つづ}く {縄|なわ}ばしご 。|| A rope ladder up to the loft.

@scene lf.plate_b
narr: {二枚目|にまいめ} の {青銅|せいどう} の {札|ふだ} 。{文字|もじ} が {多|おお}い 。|| The second bronze plate. More writing on this one.
!if lf_plate_b_read -> text
!challenge lf.ch_gate2
!set lf_plate_b_read
:text
narr: 「{東|ひがし} の {扉|とびら} を {開|あ}けない と 、{西|にし} の {栓|せん} は {抜|ぬ}けない 。」|| "Unless the east door is open, the west plug cannot be pulled."
narr: 「{水|みず} が {引|ひ}いたら 、{東|ひがし} の {扉|とびら} を {閉|し}める こと 。{閉|し}めなければ 、{水|みず} は {戻|もど}って くる 。」|| "Once the water has gone down, close the east door. If you do not close it, the water will come back."

@scene lf.east_door
# Staged: you look over the handle of the east door and haul on it, open or shut; once the room has drained, you
# haul it shut and the bar drops; your companion's own answer (Nao's nod, Mio points to the stairs, Ren counts
# condition, timing, consequence, Suzu's small celebration).
!if lf_gate_b -> sealed
!if lf_east_open -> open
!gesture pc observe prop:lf_lever
narr: {東|ひがし} の {扉|とびら} の {取|と}っ{手|て} 。{扉|とびら} は {今|いま} 、{閉|し}まって いる 。|| The handle of the east door. The door is shut right now.
!choice
* {取|と}っ{手|て} を {倒|たお}して 、{扉|とびら} を {開|あ}ける || Pull the handle to open the door -> open_it
* そのまま に する || Leave it -> end
:open_it
!sfx door
!gesture pc bend prop:lf_lever
narr: {東|ひがし} の {扉|とびら} が {開|ひら}いた 。{湖|みずうみ} の {冷|つめ}たい {風|かぜ} が 、すっと {入|はい}って くる 。|| The east door swings open. A cold draught off the lake slips in.
!set lf_east_open
!end
:open
!if lf_mid_drained -> close_now
!gesture pc observe prop:lf_lever
narr: {東|ひがし} の {扉|とびら} は {開|あ}いて いる 。|| The east door is open.
!choice
* {扉|とびら} を {閉|し}める || Close the door -> reclose
* そのまま に する || Leave it open -> end
:reclose
!gesture pc bend prop:lf_lever
narr: {扉|とびら} を {閉|し}めた 。{水|みず} は 、まだ {引|ひ}いて いない 。|| You shut the door. The water still hasn't gone down.
!unset lf_east_open
!end
:close_now
!gesture pc observe prop:lf_lever
narr: {部屋|へや} の {水|みず} は {引|ひ}いて いる 。{東|ひがし} の {扉|とびら} は 、まだ {開|あ}いた まま だ 。|| The room has drained. The east door is still open.
!choice
* {扉|とびら} を {閉|し}める || Close the door -> seal
* そのまま に する || Leave it open -> end
:seal
!sfx door
!shake
!gesture pc bend prop:lf_lever
narr: {扉|とびら} を {閉|し}める と 、{重|おも}い {閂|かんぬき} が ひとりでに {落|お}ちた 。{外|そと} の {水|みず} が 、{扉|とびら} を どん と {叩|たた}いて 、{諦|あきら}めた 。|| As you close the door, a heavy bar drops into place of its own accord. The water outside thumps against it once, then gives up.
!unset lf_east_open
!set lf_gate_b
?(comp=nao) !gesture comp nod
?(comp=nao) comp: 「{閉|し}めなければ 、{戻|もど}って くる」 。{書|か}いた {奴|やつ} 、{親切|しんせつ} だ な 。|| "If you don't close it, it comes back." Whoever wrote that was a kind soul.
?(comp=mio) !gesture comp point 10,16
?(comp=mio) comp[smile]: よし 。{階段|かいだん} が {見|み}えた 。|| Right. I can see the stairs.
?(comp=ren) !gesture comp count
?(comp=ren) comp: {条件|じょうけん} 、{時|とき} 、{結果|けっか} 。{三|みっ}つ とも {守|まも}りました 。|| Condition, timing, consequence. We kept all three.
?(comp=suzu) !gesture comp celebrate
?(comp=suzu) comp[laugh]: {第二幕|だいにまく} 、{幕|まく} ！|| Act two — curtain!
!autosave
!end
:sealed
!gesture pc observe prop:lf_lever
narr: {東|ひがし} の {扉|とびら} は 、{閂|かんぬき} で しっかり {閉|し}まって いる 。|| The east door is barred fast.

@scene lf.west_plug
# Staged: you look over the handle of the west plug and haul on it; as the room drains you look down to the stairs
# appearing. Stuck: you haul in vain, and look over to the plate on the north wall.
!if lf_mid_drained -> pulled
!gesture pc observe prop:lf_lever
narr: {西|にし} の {栓|せん} の {取|と}っ{手|て} 。{部屋|へや} の {水|みず} を {抜|ぬ}く {栓|せん} だ 。|| The handle of the west plug: the drain for this room.
!choice
* {栓|せん} を {抜|ぬ}く || Pull the plug -> pull
* やめて おく || Leave it -> end
:pull
!if !lf_east_open -> stuck
!sfx water
!shake
!gesture pc bend prop:lf_lever
narr: {栓|せん} が {抜|ぬ}けた 。ごぼごぼ と {音|おと} を たてて 、{部屋|へや} の {水|みず} が {西|にし} へ {吸|す}い{込|こ}まれて いく 。|| The plug comes free. With a great gurgling, the room's water is sucked away to the west.
!set lf_mid_drained
!gesture pc lookroad down
narr: {南|みなみ} の {床|ゆか} が {現|あらわ}れ 、{下|した} へ {続|つづ}く {階段|かいだん} が {見|み}えた 。|| The southern floor appears, and with it the stairs leading down.
!end
:stuck
!gesture pc bend prop:lf_lever
narr: {栓|せん} は 、{吸|す}い{付|つ}いた よう に {動|うご}かない 。|| The plug won't move, as if it's being sucked shut.
?(!lf_plate_b_read) !gesture pc lookroad 9,3
?(!lf_plate_b_read) narr: {部屋|へや} の {北|きた} の {壁|かべ} に 、{札|ふだ} が ある 。|| There's a plate on the north wall.
?(lf_plate_b_read) narr: {札|ふだ} の {一行目|いちぎょうめ} を {思|おも}い{出|だ}す 。「{東|ひがし} の {扉|とびら} を {開|あ}けない と 、{西|にし} の {栓|せん} は {抜|ぬ}けない 。」|| You recall the plate's first line: "Unless the east door is open, the west plug cannot be pulled."
!end
:pulled
!gesture pc observe prop:lf_lever
narr: {西|にし} の {栓|せん} は 、{抜|ぬ}けて いる 。|| The west plug is out.

@scene lf.water_returns
# Staged: you start as the lake pours in through the open east door; your companion makes room and you step back
# north out of it (with staging off the scene leaves you standing on the flooded row); you look to the silted drain;
# your companion's own answer (Nao shakes their head, Mio looks you over for a soaking, Ren points to the door left
# open, Suzu's laugh).
!sfx water
!shake
!gesture pc flinch 20,8
narr: {南|みなみ} へ {踏|ふ}み{出|だ}した とたん 、{開|あ}いた まま の {東|ひがし} の {扉|とびら} から 、{湖|みずうみ} の {水|みず} が どっと {流|なが}れ{込|こ}んで きた 。|| The moment you step south, lake water comes pouring in through the east door you left open.
!walkto comp 11 8 down
!walkto pc 10 9 up
!gesture pc lookroad 1,8
narr: {栓|せん} の {穴|あな} に {泥|どろ} が {詰|つ}まり 、{部屋|へや} は また {水|みず} の {下|した} に {沈|しず}んだ 。|| Silt clogs the drain, and the room sinks back under water.
!unset lf_mid_drained
?(comp=nao) !gesture comp shake
?(comp=nao) comp: …… 「{閉|し}めなければ 、{戻|もど}って くる 」 。{書|か}いて あった 。{書|か}いて あった よ 。|| …"If you don't close it, it comes back." It said so. It literally said so.
?(comp=mio) !gesture comp observe pc
?(comp=mio) comp[worry]: {大丈夫|だいじょうぶ} ？ {濡|ぬ}れて ない ？ …… {栓|せん} を もう {一度|いちど} {抜|ぬ}いて 、{今度|こんど} は {扉|とびら} を {閉|し}めよう 。|| Are you all right? Not soaked? …Let's pull the plug again, and this time close the door.
?(comp=ren) !gesture comp point 20,8
?(comp=ren) comp: {水|みず} が {引|ひ}いたら 、{閉|し}める 。{順番|じゅんばん} の {最後|さいご} を {飛|と}ばしました ね 。|| Once the water's down, close it. We skipped the last step.
?(comp=suzu) !gesture comp laugh
?(comp=suzu) comp[laugh]: {大波|おおなみ} の {演出|えんしゅつ} 、{見事|みごと} ！ …… {二度目|にどめ} は いらない けど 。|| What a spectacular wave effect! …Don't need an encore.

@scene lf.junction
# Staged: you look over the pipes gathering into one, listen to the voices inside, look up the way they are carried,
# and lay a hand on the pipe (the narration); your companion's own answer (Nao's flat hand of anger, Mio's head goes
# down, Ren looks up the pipes for their teacher's voice, Suzu's open hand to the voices). Again: you listen at the
# pipe.
!if lf_koe -> again
!gesture pc observe prop:lf_conduit
narr: {何本|なんぼん} も の {管|くだ} が 、ここ で {一本|いっぽん} に まとまって いる 。|| Here, many pipes gather into one.
!gesture pc cupear prop:lf_conduit
narr: {中|なか} から 、{町|まち} の {人|ひと} たち の {声|こえ} が {聞|き}こえる 。|| From inside come the voices of the townsfolk.
narr: 「{焼|や}けない よ 、そんな {数|かず} ！」 「{境|さかい} は そこ じゃ ない わ 」 「{本当|ほんとう} は 、{帰|かえ}りたい 」 …… 。|| "I can't bake that many!" "That's not where the boundary is!" "I really want to go home…"
!gesture pc lookroad up
narr: {言|い}えなかった 「いいえ」 が 、{上|うえ} へ 、{上|うえ} へ と {運|はこ}ばれて いく 。|| Every "no" that nobody could say, carried up and up.
pc: …… {声|こえ} 。|| …Voices.
!gesture pc receive prop:lf_conduit hold
narr: {管|くだ} に {手|て} を {当|あ}てる と 、{指先|ゆびさき} に {震|ふる}え が {伝|つた}わって くる 。{声|こえ} は 、{外|そと} へ {出|で}たがって いる 。|| Lay your hand on the pipe and a trembling passes into your fingertips. The voices want to get out.
!sfx reveal
!word koe
narr: {声|こえ} ： {人|ひと} の {出|だ}す {音|おと} 。{黙|だま}らされた ところ に 、もう {一度|いちど} {響|ひび}かせる {言葉|ことば} 。{戦|たたか}い の {中|なか} で 、しじま に {答|こた}える {言葉|ことば} と して {織|お}れる 。|| 声 (こえ): voice — a word to make heard again where things were silenced. You can now weave こえ in encounters to answer a Hush.
?(comp=nao) !gesture comp emphatic
?(comp=nao) comp[angry]: {宛先|あてさき} も {書|か}いて ない {荷物|にもつ} を 、{勝手|かって} に {運|はこ}ぶ な よ 。…… {返|かえ}して もらう から な 。|| Don't go hauling parcels that don't even have an address on them. …We're taking these back.
?(comp=mio) !gesture comp lowered
?(comp=mio) comp[sad]: {言|い}えない まま {飲|の}み{込|こ}んだ {言葉|ことば} …… {体|からだ} に {悪|わる}い はず だ よ 。|| Words swallowed without ever being said… No wonder people have been getting ill.
?(comp=ren) !gesture comp lookroad up
?(comp=ren) comp: {師匠|ししょう} の {声|こえ} も 、こう して {上|うえ} へ {運|はこ}ばれた の でしょう か 。…… {今|いま} は 、{前|まえ} へ {進|すす}みましょう 。|| Was my master's voice carried up like this too? …For now, let's keep going.
?(comp=suzu) !gesture comp palm prop:lf_conduit
?(comp=suzu) comp: {出番|でばん} を {待|ま}ってる {声|こえ} ばっかり 。{幕|まく} を {上|あ}げて あげなきゃ ね 。|| Nothing but voices waiting for their cue. We need to raise the curtain for them.
!set lf_koe
!autosave
!end
:again
!gesture pc cupear prop:lf_conduit
narr: {管|くだ} の {中|なか} で 、{声|こえ} が {出番|でばん} を {待|ま}って いる 。|| Inside the pipe, the voices wait for their turn.

# ---- the drowned stair: plate C ---------------------------------------------------------------------------------------------------------
@scene lf.low_enter
# Staged: at the top of the drowned stair you look down the flooded walkway and stand still, feeling for the weight
# of the bell; your companion's own answer (Nao looks down the way, Mio looks you over in the cold, Ren tends the
# flickering lamp, Suzu touches her wet hair). (Your companion first steps off the stairhead beside you.)
!set lf_low_seen
!walkto comp 11 2 down
!gesture pc lookroad down
narr: {沈|しず}んだ {階段|かいだん} 。{真|ま}ん{中|なか} の {通|とお}り{道|みち} は 、{水|みず} に {沈|しず}んで いる 。|| The drowned stair. The walkway down the middle is under water.
!gesture pc listen down
narr: {壁|かべ} の {向|む}こう から 、{大|おお}きな {鐘|かね} の 、{鳴|な}れない {重|おも}さ が {伝|つた}わって くる 。|| Through the walls you can feel the weight of a great bell that cannot ring.
?(comp=nao) !gesture comp lookroad down
?(comp=nao) comp: …… {近|ちか}い 。{気配|けはい} で わかる 。|| …Close now. I can feel it.
?(comp=mio) !gesture comp observe pc
?(comp=mio) comp: {息|いき} が {白|しろ}い 。{冷|ひ}えて きた ね 。|| Your breath's showing. It's getting cold.
?(comp=ren) !gesture comp tendlamp
?(comp=ren) comp: {灯|あか}り が {揺|ゆ}れて います 。{風|かぜ} は ない のに 。|| The lamp's flickering. And there's no wind.
?(comp=suzu) !gesture comp touchhair
?(comp=suzu) comp: {次|つぎ} が {最終幕|さいしゅうまく} ね 。{衣装|いしょう} 、{濡|ぬ}れちゃった けど 。|| The next one's the final act. Pity my costume's soaked.

@scene lf.plate_c
narr: {三枚目|さんまいめ} の {札|ふだ} 。|| The third plate.
!if lf_plate_c_read -> text
!challenge lf.ch_gate3
!set lf_plate_c_read
:text
narr: 「{南|みなみ} の {栓|せん} を {抜|ぬ}く まで 、{北|きた} の {栓|せん} に {触|さわ}って は いけない 。」|| "Until the south plug is pulled, the north plug must not be touched."

@scene lf.south_plug
# Staged: you look over the south plug and haul it out; you look across to the north plug still holding the water.
!if lf_south_pulled -> done
!gesture pc observe prop:lf_lever
narr: {南|みなみ} の {隅|すみ} の {栓|せん} 。{取|と}っ{手|て} に 「{南|みなみ}」 と {刻|きざ}んで ある 。|| The plug in the south corner. Its handle is stamped "south".
!choice
* {栓|せん} を {抜|ぬ}く || Pull the plug -> pull
* やめて おく || Leave it -> end
:pull
!sfx water
!gesture pc bend prop:lf_lever
narr: {栓|せん} を {抜|ぬ}く と 、{足元|あしもと} の {水|みず} が ゆっくり {渦|うず} を {巻|ま}いて {引|ひ}き{始|はじ}めた 。|| As you pull the plug, the water around your feet slowly begins to swirl away.
!gesture pc lookroad 16,3
narr: {通|とお}り{道|みち} の {水|みず} は 、まだ {北|きた} の {栓|せん} で {止|と}まって いる 。|| The water over the walkway is still held back by the north plug.
!set lf_south_pulled
!end
:done
!gesture pc observe prop:lf_lever
narr: {南|みなみ} の {栓|せん} は 、{抜|ぬ}けて いる 。|| The south plug is out.

@scene lf.north_plug
# Staged: you look over the north plug and haul it out; you look down the wet stone path to the bell chamber; your
# companion's own answer (Nao points out the path, Mio's nod to you, Ren's open hand to it, Suzu's open hand
# inviting you on). Too soon: you start at the water spouting up and wipe your face; your companion answers (Nao's
# shrug, Mio holds out a towel, Ren points to the south plug, Suzu's laugh).
!if lf_gate_c -> done
!gesture pc observe prop:lf_lever
narr: {北|きた} の {栓|せん} 。{取|と}っ{手|て} に 「{北|きた}」 と {刻|きざ}んで ある 。|| The north plug. Its handle is stamped "north".
!choice
* {栓|せん} を {抜|ぬ}く || Pull the plug -> pull
* やめて おく || Leave it -> end
:pull
!if !lf_south_pulled -> surge
!sfx water
!shake
!gesture pc bend prop:lf_lever
narr: {北|きた} の {栓|せん} が {抜|ぬ}ける と 、{通|とお}り{道|みち} の {水|みず} が {一気|いっき} に {南|みなみ} へ {流|なが}れ{落|お}ちた 。|| As the north plug comes out, the water over the walkway rushes away south all at once.
!gesture pc lookroad 10,12
narr: {濡|ぬ}れた {石|いし} の {道|みち} が 、{鐘|かね} の {間|ま} へ {続|つづ}いて いる 。|| A wet stone path leads on to the bell chamber.
!set lf_gate_c
?(comp=nao) !gesture comp point 10,12
?(comp=nao) comp: {道|みち} が {出|で}た 。{戻|もど}り{道|みち} も {同|おな}じ 。よし 。|| There's the path. Same way back. Good.
?(comp=mio) !gesture comp nod pc
?(comp=mio) comp: {最後|さいご} の {水門|すいもん} ね 。{一緒|いっしょ} に {行|い}こう 。|| The last gate. Let's go together.
?(comp=ren) !gesture comp palm 10,12
?(comp=ren) comp: {順番|じゅんばん} を {守|まも}る と 、{水|みず} も {礼儀|れいぎ} {正|ただ}しく {引|ひ}きます ね 。|| Keep the order, and even the water withdraws politely.
?(comp=suzu) !gesture comp palm pc
?(comp=suzu) comp: {最終幕|さいしゅうまく} へ の {花道|はなみち} 。…… {行|い}こう か 。|| The runway to the final act. …Shall we?
!autosave
!end
:surge
!sfx water
!shake
!gesture pc flinch prop:lf_lever
narr: {北|きた} の {栓|せん} に {手|て} を かけた とたん 、{床|ゆか} の {隙間|すきま} から {水|みず} が {噴|ふ}き{上|あ}がった 。|| The moment you grip the north plug, water spouts up through the cracks in the floor.
!gesture pc brow
narr: {全身|ぜんしん} ずぶ{濡|ぬ}れ だ 。{栓|せん} は 、{元|もと} の {位置|いち} に {戻|もど}って いる 。|| You are soaked from head to foot. The plug has sprung back into place.
?(comp=nao) !gesture comp shrug
?(comp=nao) comp: 「{触|さわ}って は いけない」 って 、{書|か}いて あった よね 。|| It did say "must not be touched", didn't it.
?(comp=mio) !gesture comp present pc prop=cloth
?(comp=mio) comp[laugh]: …… {拭|ふ}く もの 、ある よ 。{南|みなみ} の {栓|せん} が {先|さき} 、だった ね 。|| …I've got a towel. The south plug first, wasn't it.
?(comp=ren) !gesture comp point 2,14
?(comp=ren) comp: 「まで」 を {読|よ}み{落|お}としました ね 。{南|みなみ} を {抜|ぬ}く まで 、{北|きた} は {禁止|きんし} です 。|| We missed the まで. Until the south one's pulled, the north is off limits.
?(comp=suzu) !gesture comp laugh
?(comp=suzu) comp[laugh]: {水|みず} も {滴|したた}る いい {役者|やくしゃ} ！ …… {南|みなみ} が {先|さき} よ 。|| Dripping and handsome! …South first, darling.
!end
:done
!gesture pc observe prop:lf_lever
narr: {北|きた} の {栓|せん} は 、{抜|ぬ}けて いる 。|| The north plug is out.

@scene lf.waterline
# Staged: you lean in to the water lines ringing the pillar; your companion's own answer (Nao's slow shake of the
# head, Mio's head goes down, Ren leans in to the notch, Suzu looks away and back).
!gesture pc observe prop:pillar
narr: {柱|はしら} に 、{水|みず} の {跡|あと} が {何本|なんぼん} も {残|のこ}って いる 。{一番|いちばん} {上|うえ} の {線|せん} は 、{天井|てんじょう} の すぐ {下|した} だ 。|| Water lines ring the pillar, one above another. The highest is just below the ceiling.
narr: その {線|せん} の {横|よこ} に 、{小|ちい}さな {刻|きざ}み 。「{六月|ろくがつ} {十二日|じゅうににち}」 。{誰|だれ} か が 、{後|あと} から {刻|きざ}んだ の だろう 。|| Beside it, a small notch: "June 12th". Someone must have cut it afterwards.
?(comp=nao) !gesture comp shake
?(comp=nao) comp: …… ここ まで {来|き}た のか 、{水|みず} が 。|| …The water came all the way up here.
?(comp=mio) !gesture comp lowered
?(comp=mio) comp[sad]: {息|いき} が できる {場所|ばしょ} なんて 、なかった ね 。|| There was nowhere left to breathe.
?(comp=ren) !gesture comp observe prop:pillar
?(comp=ren) comp: {刻|きざ}んだ の は 、きっと トクジ さん です 。{毎年|まいとし} {来|き}て いた の かも しれません 。|| I'd guess Tokuji cut that. Perhaps he came every year.
?(comp=suzu) !gesture comp avert
?(comp=suzu) comp: {一番|いちばん} {上|うえ} の {線|せん} だけ 、{誰|だれ} も {見|み}たく ない {台詞|せりふ} みたい に {深|ふか}い 。|| Only the top line is cut deep, like a line nobody wants to read.

# ---- the bell chamber ---------------------------------------------------------------------------------------------------------------
@scene lf.boss_intro
# Staged: you start as the water before the bell heaves up; your companion faces the keeper in their own way (Nao
# points to it, one move at a time; Mio's guarded hand; Ren holds the lamp forward; Suzu points it out). After the
# battle: you lean in to the bell as the pipes fall away; your companion's own answer (Nao's nod, Mio looks you
# over, Ren leans in to the writing on the bell, Suzu's open hand to it).
!if lf_boss_done -> end
!gesture pc flinch 8,7
narr: {鐘|かね} の {前|まえ} の {水|みず} が 、{盛|も}り{上|あ}がった 。|| The water in front of the bell heaves upwards.
narr: {管|くだ} が {絡|から}み{合|あ}い 、{鐘|かね} の {形|かたち} を した {何|なに} か が {立|た}ち{上|あ}がる 。{顔|かお} の {代|か}わり に 、{水門|すいもん} の {札|ふだ} が {付|つ}いて いる 。|| Pipes twist together and something shaped like a bell rises up. In place of a face, it wears a sluice-gate plate.
narr: 「{鳴|な}らして は いけません 。…… いえ 、どうぞ 。{鳴|な}らして も かまいません よ 。」|| "You must not ring it. …No — please. Go ahead and ring it, if you like."
?(comp=nao) !gesture comp point 8,7
?(comp=nao) comp[angry]: {言|い}ってる こと と やってる こと が 、{全然|ぜんぜん} {違|ちが}う 。…… {読|よ}んで いこう 、{一手|いって} ずつ 。|| What it says and what it does are completely different. …Let's read it one move at a time.
?(comp=mio) !gesture comp guard
?(comp=mio) comp: {怖|こわ}がってる 。{鐘|かね} が {鳴|な}る こと を 、{誰|だれ} より も 。|| It's frightened. Of the bell ringing — more than anyone.
?(comp=ren) !pose comp lampup
?(comp=ren) comp: しじま の {番人|ばんにん} です 。{灯|あか}り を {前|まえ} へ 。{鈴|すず} と {声|こえ} を 、{忘|わす}れず に 。|| The keeper of the Hush. Lamp forward. Don't forget the bell and the voice.
?(comp=suzu) !gesture comp point 8,7
?(comp=suzu) comp: 「はい」 で 「いいえ」 を {隠|かく}す {役者|やくしゃ} 。…… {化|ば}けの{皮|かわ} 、はがして あげましょう 。|| An actor who hides a "no" inside a "yes". …Let's peel off that disguise.
!battle lf.keeper noflee
!set lf_boss_done
!gesture pc observe 8,7
narr: {番人|ばんにん} が ほどけ 、{管|くだ} が {一本|いっぽん} ずつ {水|みず} に {沈|しず}んで いく 。|| The keeper comes apart, and its pipes sink into the water one by one.
narr: {鐘|かね} に {巻|ま}きついて いた {管|くだ} も 、{緩|ゆる}んで {落|お}ちた 。|| The pipes that were wound round the bell loosen and fall away too.
?(comp=nao) !gesture comp nod
?(comp=nao) comp: …… {鐘|かね} 、{自由|じゆう} に なった 。|| …The bell's free.
?(comp=mio) !gesture comp observe pc
?(comp=mio) comp[smile]: {怪我|けが} は ない ？ …… よかった 。|| Are you hurt? …Thank goodness.
?(comp=ren) !gesture comp observe 8,7
?(comp=ren) comp: {灯|あか}り で {照|て}らします 。{鐘|かね} に 、{字|じ} が {刻|きざ}んで あります 。|| I'll light it up. There's writing cast into the bell.
?(comp=suzu) !gesture comp palm 8,7
?(comp=suzu) comp[smile]: {拍手|はくしゅ} は 、{鐘|かね} が {鳴|な}って から ね 。|| Applause can wait until the bell rings.
!checkpoint lf.bellhall 8 4 down
!autosave

@scene lf.tower_key
# Staged: you lean in to the open padlock and bend to the rusted key and its tag; your companion's own answer (Nao
# looks between the lock and you, Mio's guarded hand, Ren's hand to the chin, Suzu's lowered head).
!gesture pc observe prop:lf_padlock
narr: {入|い}り{口|ぐち} の {横|よこ} の {柱|はしら} に 、{古|ふる}い {錠前|じょうまえ} が {鎖|くさり} で {下|さ}がって いる 。{開|あ}いた まま だ 。|| On the post beside the entrance, an old padlock hangs from a chain. It is open.
!gesture pc bend prop:lf_padlock
narr: {鍵|かぎ} が {差|さ}さった まま 、{錆|さび} で {固|かた}まって いる 。{鍵|かぎ} の {札|ふだ} に 「{鐘楼|しょうろう}」 。|| The key is still in it, rusted fast. Its tag reads "Bell tower".
narr: {鍵|かぎ} で {開|あ}けられた の だ 。{壊|こわ}された の で は なく 。|| It was opened with the key. Not broken.
?(comp=nao) !gesture comp lookbetween 9,2 and=pc
?(comp=nao) comp: {鍵|かぎ} が かかってた んだ 、この {塔|とう} 。…… {誰|だれ} か が {持|も}ち{出|だ}して 、{自分|じぶん} で {開|あ}けた 。|| So this tower was locked. …Someone took the key and opened it themselves.
?(comp=mio) !gesture comp guard
?(comp=mio) comp: {鍵|かぎ} を {開|あ}けた {人|ひと} は 、{閉|し}める {時間|じかん} が なかった ん だね 。|| Whoever opened it had no time to lock it again.
?(comp=ren) !gesture comp chin
?(comp=ren) comp: {議事録|ぎじろく} に は 、{鐘楼|しょうろう} は {施錠|せじょう} の まま と ありました 。{許可|きょか} なし で {鍵|かぎ} を {持|も}ち{出|だ}した 、と いう こと です 。|| The minutes said the tower was to stay locked. So the key was taken without permission.
?(comp=suzu) !gesture comp lowered
?(comp=suzu) comp: {立入|たちいり} {禁止|きんし} の {舞台|ぶたい} に 、{一人|ひとり} で {上|あ}がった {役者|やくしゃ} が いた の ね 。|| An actor went up alone onto a stage that was closed to everyone.

@scene lf.bell_plate
narr: {鐘|かね} の {台|だい} の {札|ふだ} 。「{灯落|ひおち} {警鐘|けいしょう} 。{鋳造|ちゅうぞう} 、{百年前|ひゃくねんまえ} 。」|| The plate on the bell's stand. "Lanternfall Warning Bell. Cast one hundred years ago."

@scene lf.bell_touch
!if !lf_boss_done -> guard
narr: {緑|みどり} に くすんだ {大|おお}きな {鐘|かね} 。{表面|ひょうめん} に 、{文字|もじ} が {鋳|い}{込|こ}まれて いる 。|| A great bell gone green with age. Words are cast into its surface.
!lesson kana
!challenge lf.ch_bell
narr: 「この {鐘|かね} が {鳴|な}ったら 、{高|たか}い {所|ところ} へ {逃|に}げよ 。」|| "When this bell rings, flee to high ground."
?(comp=nao) comp: 「{逃|に}げろ」 か 。…… {町|まち} {全部|ぜんぶ} に {向|む}かって 、「ここ に いる な」 って {言|い}う {鐘|かね} だ 。|| "Run," huh. …A bell that tells a whole town "don't stay here".
?(comp=mio) comp: {人|ひと} を {助|たす}ける ため の 「いいえ」 。…… この {鐘|かね} は 、ずっと それ を {言|い}いたかった ん だね 。|| A "no" that exists to save people. …This bell has been wanting to say that all along.
?(comp=ren) comp: {灯|あか}り は {道|みち} を {示|しめ}し 、{鐘|かね} は {危|あぶ}ない と {告|つ}げる 。{灯守|ひもり} と {鐘|かね} は 、{親戚|しんせき} の よう な もの です 。|| Lanterns show the way; bells warn of danger. Lantern keepers and bells are practically relatives.
?(comp=suzu) comp: {開演|かいえん} の {合図|あいず} じゃ なくて 、{避難|ひなん} の {合図|あいず} 。{一番|いちばん} {大事|だいじ} な {音|おと} ね 。|| Not a curtain-up bell — an evacuation bell. The most important sound there is.
!choice
* {鐘|かね} を {鳴|な}らす || Ring the bell -> ring
* まだ {待|ま}つ || Not yet -> end
:ring
!music -
!sfx bell
!shake
narr: ごおおん …… 。|| GONNNG…
narr: {低|ひく}い {音|おと} が 、{水|みず} を {震|ふる}わせ 、{石|いし} を {震|ふる}わせ 、{管|くだ} の {中|なか} を {駆|か}け{上|あ}がって いく 。|| The low note shakes the water, shakes the stone, and races up through the pipes.
!sfx bell
narr: {二度|にど} 、{三度|さんど} 。{三十年|さんじゅうねん} {分|ぶん} の {音|おと} が 、{一度|いちど} に {出|で}て いく よう に 。|| Twice. Three times. As if thirty years of sound were leaving all at once.
narr: {管|くだ} の {中|なか} の {声|こえ} が 、{向|む}き を {変|か}えた 。{上|うえ} で は なく 、{下|した} へ 。{町|まち} へ 。|| The voices in the pipes turn around. Not up, but down. Towards the town.
lf_toya: …… {鳴|な}った 。やっと 。|| …It rang. At last.
narr: {誰|だれ} の {声|こえ} か 、わからない 。{振|ふ}り{返|かえ}って も 、{水|みず} の {上|うえ} に は {誰|だれ} も いない 。|| You can't tell whose voice it was. When you turn, there's no one on the water.
?(comp=nao) comp[closed]: …… {今|いま} の 。{聞|き}こえた よね 。|| …That. You heard it too, right?
?(comp=nao) comp: {届|とど}いた よ 。{三十年|さんじゅうねん} {遅|おく}れ でも 、{届|とど}いた 。|| It got there. Thirty years late, but it got there.
?(comp=mio) comp[sad]: …… うん 。{聞|き}こえた 。|| …Yes. I heard.
?(comp=mio) comp[smile]: {町|まち} の {皆|みな}さん の 「いいえ」 、{帰|かえ}って いく ね 。{元|もと} の {持|も}ち{主|ぬし} の ところ へ 。|| Everyone's "no"s are going home. Back to where they belong.
?(comp=ren) comp[closed]: …… {灯守|ひもり} の {教|おし}え に 、こう あります 。「{名前|なまえ} を {呼|よ}ばれた {灯|ひ} は 、{消|き}えない 」 。|| …There's a lantern keepers' teaching. "A light whose name is called does not go out."
?(comp=ren) comp: {今|いま} の は 、{誰|だれ} か が {誰|だれ} か の {名前|なまえ} を {呼|よ}んだ {音|おと} でした 。|| That was the sound of someone calling someone's name.
?(comp=suzu) comp[sad]: …… {幕|まく} が 、{下|お}りた わ 。{三十年|さんじゅうねん} {待|ま}って いた {芝居|しばい} の 。|| …The curtain's come down. On a play that waited thirty years.
?(comp=suzu) comp[smile]: {拍手|はくしゅ} 、しても いい かな 。…… {小|ちい}さく ね 。|| May I applaud? …Just softly.
!set lf_bell_rung
!note lf_bell
!quest lf_main 9
?(quest.lf_akari&!quest.lf_akari=done) !quest lf_akari 1
?(quest.lf_fence>=2&!quest.lf_fence=done) !quest lf_fence 3
?(comp=nao&quest.lf_nao>=1&!quest.lf_nao=done) !quest lf_nao 2
!music lf_bell
!autosave
narr: {湖|みずうみ} の {水|みず} が 、{少|すこ}し ずつ {引|ひ}いて いく 。{舟|ふね} へ {戻|もど}ろう 。|| The lake is slowly drawing back. Time to get back to the boat.
!fade out
!warp lf.sluice 19 16 up
!fade in
narr: {岸|きし} で 、トクジ が {待|ま}って いた 。|| Tokuji is waiting on the shore.
lf_tokuji: …… {聞|き}こえた 。{町|まち} じゅう に 、{聞|き}こえた ぞ 。|| …I heard it. The whole town heard it.
lf_tokuji[angry]: …… {遅|おそ}い ん だ よ 、{三十年|さんじゅうねん} も 。…… ばか やろう 。|| …Thirty years late, you know. …You damn fool.
narr: {誰|だれ} に {言|い}った の か 。トクジ は {湖|みずうみ} を {見|み}た まま 、{鼻|はな} を すすった 。|| Who was that for? Tokuji keeps looking out at the lake, and sniffs.
lf_tokuji: {町|まち} へ {戻|もど}れ 。{今|いま}ごろ 、うるさく なってる はず だ 。|| Go back to town. It'll be getting noisy about now.
!checkpoint lf.sluice 15 2 up
!autosave
!end
:guard
!call lf.boss_intro

@scene lf.bell_after
narr: {鐘|かね} は {金色|きんいろ} に {光|ひか}り 、まだ かすか に {震|ふる}えて いる 。|| The bell gleams gold and is still faintly trembling.
narr: もう 、{管|くだ} は {一本|いっぽん} も {巻|ま}きついて いない 。|| Not a single pipe is wound around it now.
`, 'ch5/tower');
