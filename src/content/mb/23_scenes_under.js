/* Manybridge, Chapter 3: the Undercroft Locks and the First Bridge (expansion P08), and the chapter's end. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene mb.under_go
narr: {階段|かいだん} は 、 {水|みず} の {音|おと} の する {暗|くら}がり へ {続|つづ}いて いる 。 || The stairs lead down into a darkness full of the sound of water.
!choice
* {下|お}りる 。 || Go down. -> go
* まだ {下|お}りない 。 || Not yet. -> end
:go
!warp mb.under1 3 3 down
:end

@scene mb.under_up
narr: {上|うえ} の {閘門番|こうもんばん} の {家|いえ} へ {戻|もど}る {階段|かいだん} 。 || The stairs back up to the lock-keeper's house.
!choice
* {上|あ}がる 。 || Go up. -> go
* まだ {上|あ}がらない 。 || Stay. -> end
:go
!warp mb.lockhouse 8 5 down
:end

@scene mb.under_arrive
# Staged: down the last steps onto the wet walkway; you raise your light over the basin; the companion's first look.
!set mb_under_seen
narr: {札場|ふだば} の {下|した} 。 {石|いし} の {通路|つうろ} が 、 {黒|くろ}い {水|みず} の {池|いけ} を {囲|かこ}んで いる 。 {壁|かべ} に {石板|せきばん} が {埋|う}め{込|こ}んで ある 。 || Beneath the Exchange. Stone walkways ring a basin of black water. Tablets are set into the walls.
?(comp=nao) comp: {水|みず} の {道|みち} の {地図|ちず} が 、 {壁|かべ} に {書|か}いて ある の か 。 {読|よ}めなければ {進|すす}めない 、 か 。 || The water's map is written on the walls, eh. Can't go on without reading it.
?(comp=mio) comp: {寒|さむ}い ね 。 …… {足元|あしもと} 、 {滑|すべ}らない よう に 。 || It's cold. …Mind your step, it's slippery.
?(comp=ren) comp: {石板|せきばん} の {字|じ} は 、 {消|き}えて いません 。 {彫|ほ}った {字|じ} は 、 {札|ふだ} より {強|つよ}い の でしょう か 。 || The tablets' writing hasn't faded. Perhaps carved letters are stronger than plaques.
?(comp=suzu) comp: {舞台|ぶたい} の {奈落|ならく} みたい ね 。 …… {観客|かんきゃく} が {水|みず} だけ って いう の が 、 {寂|さび}しい けど 。 || Like the pit under a stage. …Only, the audience is all water, which is a bit lonely.
!journal {閘門|こうもん} の {下|した} 。 {石板|せきばん} を {読|よ}んで 、 {水|みず} の {高|たか}さ を {変|か}えて {進|すす}む 。 || Below the lock. Read the tablets and change the water levels to go on.

@scene mb.tablet1
!gesture pc read
narr: {一|いち} の {石板|せきばん} 。 || The first tablet.
!challenge mb.tablet1
!set mb_tab1
narr: {西|にし} の {水門|すいもん} は 、 {南|みなみ} の {通路|つうろ} の {奥|おく} に ある 。 || The west sluice is at the far end of the south walkway.

@scene mb.gate1
?(mb_u1_low) narr: {水門|すいもん} は {開|あ}いて いる 。 {池|いけ} の {水|みず} は {下|した} へ {流|なが}れた 。 || The sluice is open; the basin has drained below.
?(mb_u1_low) !end
?(!mb_tab1) narr: {大|おお}きな {車輪|しゃりん} が ある 。 {何|なに} の {車輪|しゃりん} か {分|わ}からない まま {回|まわ}す の は 、 やめて おこう 。 || A great wheel. Better not turn it without knowing what it does.
?(!mb_tab1) !end
narr: {西|にし} の {水門|すいもん} の {車輪|しゃりん} 。 {石板|せきばん} の {通|とお}り なら 、 これ を {開|あ}ける と 、 {池|いけ} の {水|みず} が {下|した} へ {流|なが}れる 。 || The west sluice wheel. If the tablet is right, opening this sends the basin's water down below.
!choice
* {水門|すいもん} を {開|あ}ける 。 || Open the sluice. -> go
* まだ {開|あ}けない 。 || Not yet. -> end
:go
!shake 2
!sfx water
narr: {車輪|しゃりん} が {重|おも}く {回|まわ}り 、 {池|いけ} の {水|みず} が ごうごう と {下|した} へ {流|なが}れて いく 。 {東|ひがし} の {通路|つうろ} が {水|みず} の {中|なか} から {現|あらわ}れた 。 || The wheel turns heavily and the basin roars away below. The east walkway rises out of the water.
!set mb_u1_low
!refresh
:end

@scene mb.under_lamp
?(!mb_matsu_lamp) narr: {灯籠|とうろう} の {掛|か}け{金|がね} 。 {灯|あか}り は {掛|か}かって いない 。 || A lamp hook. No lamp hangs there.
?(!mb_matsu_lamp) !end
narr: マツ さん の {灯|あか}り を {掛|か}けた 。 {暗|くら}い {水|みず} の {上|うえ} に 、 {暖|あたた}かい {光|ひかり} が {広|ひろ}がる 。 || You hang Matsu's lamp. Warm light spreads over the dark water.
!set mb_lamp_hung
!refresh
!call mb.under_lamp_rest

@scene mb.under_lamp_rest
narr: マツ さん の {灯|あか}り の {下|した} で 、 {少|すこ}し {休|やす}む 。 || You rest a while under Matsu's lamp.
!heal
narr: {疲|つか}れ が {取|と}れた 。 || You feel rested.

@scene mb.under_down1
?(!mb_u1_low) narr: {水|みず} に {沈|しず}んだ {通路|つうろ} の {先|さき} だ 。 {行|い}けない 。 || It's past the drowned walkway. You can't get there.
?(!mb_u1_low) !end
!warp mb.under2 3 3 down

@scene mb.under_up2
!warp mb.under1 30 3 left

@scene mb.tablet2
!gesture pc read
narr: {二|に} の {石板|せきばん} ： 「{真|ま}ん{中|なか} の {門|もん} を {開|あ}けたら 、 {高|たか}い {池|いけ} から {低|ひく}い {池|いけ} へ {水|みず} が {移|うつ}る 。 {高|たか}さ が {同|おな}じ に なる まで {待|ま}って から 、 {舟|ふね} を {通|とお}す こと 。」 || The second tablet: "Open the middle gate, and the water moves from the high basin to the low one. Wait until the heights are the same, then take the boat through."
?(comp=nao) comp: {順番|じゅんばん} が {全部|ぜんぶ} {書|か}いて ある 。 {親切|しんせつ} な {番人|ばんにん} だ な 。 || The whole order's written out. A considerate keeper.
?(comp=ren) comp: {待|ま}って から 。 …… {急|いそ}ぐ と 、 {舟|ふね} が {流|なが}される 、 と いう こと でしょう 。 || "Wait, then." …Rush it and the boat's swept away, I suppose.

@scene mb.locks_go
?(mb_u2_through) narr: {真|ま}ん{中|なか} の {門|もん} は {閉|し}まって いる 。 {舟|ふね} は {東|ひがし} に ある 。 || The middle gate is shut. The punt is on the east side.
?(mb_u2_through) !end
narr: {真|ま}ん{中|なか} の {門|もん} の {車輪|しゃりん} 。 {西|にし} の {池|いけ} は {高|たか}く 、 {東|ひがし} の {池|いけ} は {低|ひく}い 。 {舟|ふね} は {西|にし} に ある 。 || The middle gate's wheel. The west basin stands high, the east low. The punt is on the west side.
!encounter mb.locks
?(mb_u2_through) narr: {舟|ふね} が {東|ひがし} の {通路|つうろ} に {着|つ}いた 。 {南|みなみ} の {通路|つうろ} の {端|はし} も 、 {水|みず} から {出|で}た 。 || The punt has reached the east walkway; the south walkway's end is clear of the water too.
?(mb_u2_through) !refresh

@scene mb.under_bench
narr: {番人|ばんにん} が {座|すわ}った らしい {石|いし} の {腰掛|こしか}け 。 {一休|ひとやす}み できる 。 || A stone seat the keeper must have used. A place to catch your breath.
!heal

@scene mb.under_down2
!warp mb.under3 3 3 down

@scene mb.under_up3
!warp mb.under2 34 3 down

@scene mb.tablet3
!gesture pc read
narr: {三|さん} の {石板|せきばん} 。 || The third tablet.
!challenge mb.tablet3
!set mb_tab3

@scene mb.greatlock_go
?(mb_u3_down) narr: {大閘門|だいこうもん} の {車輪|しゃりん} 。 {舟|ふね} は {下|した} に ある 。 || The Great Lock's wheel. The punt is below.
?(mb_u3_down) !end
narr: {大閘門|だいこうもん} 。 {舟|ふね} に {乗|の}って 、 {門|もん} を {動|うご}かせば 、 {一番|いちばん} {下|した} の {水|みず} まで {下|お}りられる 。 || The Great Lock. Aboard the punt, working the gates, you can go down to the lowest water.
!encounter mb.greatlock
?(mb_u3_down) !warp mb.under3 7 17 right

@scene mb.firstbridge_door
?(!mb_u3_down) narr: {古|ふる}い {戸|と} 。 {下|した} の {岸|きし} に しか {届|とど}かない 。 || An old door, reachable only from the lower quay.
?(!mb_u3_down) !end
!warp mb.firstbridge 13 14 up

@scene mb.firstbridge_back
!warp mb.under3 23 17 up

@scene mb.firstbridge_arrive
# Staged: through the old door onto a stone bank; the oldest canal; across it, the first bridge, its planks torn up and
# held like a wall by something tall and grey in the water; the companion steps to your side.
!set mb_firstbridge_seen
!gesture pc observe 13,8
narr: {一番|いちばん} {古|ふる}い {運河|うんが} 。 {向|む}こう {岸|ぎし} へ {架|か}かって いた {橋|はし} は 、 {板|いた} が {全部|ぜんぶ} {剥|は}がされて いる 。 || The oldest canal. The bridge that once spanned it has had every plank torn up.
narr: {剥|は}がされた {板|いた} を {抱|かか}えて 、 {灰色|はいいろ} の {影|かげ} が {水|みず} の {中|なか} に {立|た}って いる 。 || Clutching the torn planks, a grey shape stands in the water.
mb_bridgespirit: …… {渡|わた}るな 。 {間違|まちが}った {所|ところ} へ 、 {誰|だれ} も {渡|わた}らせない 。 {私|わたし} は …… {私|わたし} は 、 {何|なん} と いう {橋|はし} だった か 。 || …Do not cross. I will let no one cross to the wrong place. I am… what bridge was I?
?(comp=nao) comp: {名前|なまえ} を {失|な}くした から 、 {自分|じぶん} を {閉|と}じた の か 。 …… {届|とど}け{先|さき} の ない {荷|に} と {同|おな}じ だ 。 || It lost its name, so it shut itself off. …Like a parcel with no address.
?(comp=mio) comp: {怖|こわ}がって いる の かも 。 {自分|じぶん} が どこ に {繋|つな}がって いる か 、 {分|わ}からなく なって 。 || Maybe it's frightened. It doesn't know any more where it leads.
?(comp=ren) comp: {灯|ひ} を {失|うしな}った {灯籠|とうろう} が 、 {道|みち} を {塞|ふさ}ぐ の と {同|おな}じ です 。 {名前|なまえ} を {返|かえ}せば 、 きっと 。 || Like a lantern that's lost its light and blocks the road. Give it back its name, and surely…
?(comp=suzu) comp: {役|やく} の {名前|なまえ} を {忘|わす}れた {役者|やくしゃ} は 、 {舞台|ぶたい} に {立|た}てない の よ 。 {思|おも}い{出|だ}させて あげましょう 。 || An actor who's forgotten their part's name can't go on. Let's help it remember.

@scene mb.firstbridge_plaque
?(mb_bridge_named) narr: {古|ふる}い {札|ふだ} に 、 「{結|むす}び{橋|ばし}」 と {彫|ほ}って ある 。 || The old plaque reads: "Musubi Bridge."
?(mb_bridge_named) !end
narr: {一番|いちばん} {古|ふる}い {札|ふだ} 。 {真|ま}っ{白|しろ} だ 。 || The oldest plaque of all. Blank.

@scene mb.firstbridge_shrine
narr: {小|ちい}さな {祠|ほこら} 。 {橋|はし} を {守|まも}る {人|ひと} が 、 {毎晩|まいばん} {手|て} を {合|あ}わせた {場所|ばしょ} らしい 。 || A small shrine, where whoever kept the bridge must have put their hands together every night.

@scene mb.boss_go
# Staged: you step to the water's edge; the spirit rears up with its planks; the encounter.
mb_bridgespirit: {近|ちか}づくな 。 {名|な} の ない {橋|はし} を 、 {誰|だれ} も {渡|わた}って は ならない 。 || Come no closer. No one may cross a bridge with no name.
pc: {名前|なまえ} を {返|かえ}しに {来|き}た 。 || We've come to give you back your name.
!encounter mb.boss noflee
?(mb_bridge_named) !call mb.bridge_named

@scene mb.bridge_named
# Staged: the spans lie down end to end; the spirit becomes the bridge again, a warm light along its rails; up above,
# all over the city, the plaques' first letters come back (heard as a murmur); the companion's line; Sen's register.
!set mb_bridge_named
!refresh
narr: 「{結|むす}び{橋|ばし}」 。 {名前|なまえ} を {呼|よ}ぶ と 、 {灰色|はいいろ} の {影|かげ} は {静|しず}か に {水|みず} に {沈|しず}み 、 {三|みっ}つ の {橋桁|はしげた} が {向|む}こう {岸|ぎし} まで {並|なら}んだ 。 || "Musubi Bridge." At the name, the grey shape sinks quietly into the water, and the three spans lie end to end to the far bank.
narr: {橋|はし} の {札|ふだ} に 、 {字|じ} が {戻|もど}って いる 。 {遠|とお}く 、 {上|うえ} の {町|まち} から 、 {人|ひと} の {声|こえ} が かすか に {聞|き}こえる 。 「{読|よ}める ぞ ！」 || Letters have come back to the bridge's plaque. Far above, faintly, voices in the city: "I can read it!"
?(comp=nao) comp[smile]: …… {届|とど}いた な 。 {四十年|よんじゅうねん} {遅|おく}れ の {宛名|あてな} が 。 || …It got there. An address forty years late.
?(comp=mio) comp[smile]: {町|まち} の {人|ひと} たち 、 これ で {帰|かえ}り{道|みち} が {分|わ}かる ね 。 イチ くん も 。 || Now the people up there can find their way home. Ichi too.
?(comp=ren) comp[smile]: {橋|はし} も {灯|ひ} も 、 {名前|なまえ} を {呼|よ}ばれて 、 {初|はじ}めて {道|みち} に なる 。 …… {覚|おぼ}えて おきます 。 || A bridge, a lantern: called by name, they become a road. …I'll remember that.
?(comp=suzu) comp[laugh]: {名台詞|めいぜりふ} は 、 {名前|なまえ} {一|ひと}つ で {十分|じゅうぶん} ね 。 {幕|まく} ！ || The best line was just a name. Curtain!
!quest mb_main 7
!journal {一番|いちばん} の {橋|はし} の {名前|なまえ} は 「{結|むす}び{橋|ばし}」 。 {町|まち} の {札|ふだ} が {読|よ}める よう に なった 。 {札場|ふだば} の セン に {伝|つた}えよう 。 || The first bridge's name is Musubi Bridge. The city's plaques can be read again. Tell Sen at the Tally Exchange.
!warp mb.lockhouse 5 5 down
!call mb.chapter_end

@scene mb.chapter_end
# Staged: up into Matsu's house, then out into the evening: the Exchange's boards filling, barges running, porters
# calling bridge names; Sen comes running with the register; the companion beside you; then a printer's apprentice
# with a blank woodblock: the way into Chapter 4.
?(mb_matsu_letter) mb_matsu: …… {聞|き}こえた よ 。 {下|した} から 、 {橋|はし} の {名前|なまえ} が 。 {四十年|よんじゅうねん} ぶり に 。 || …I heard it. From below, the bridge's name. For the first time in forty years.
?(!mb_matsu_letter) mb_matsu: …… {下|した} から 、 {懐|なつ}かしい {名前|なまえ} が {聞|き}こえた 。 {礼|れい} を {言|い}う よ 。 || …I heard a name I know, from below. I owe you thanks.
!warp mb.exchange 52 18 down
narr: {夕暮|ゆうぐ}れ の {八百橋|やおばし} 。 {荷舟|にぶね} が {走|はし}り 、 {船頭|せんどう} が {橋|はし} の {名前|なまえ} を {呼|よ}び{合|あ}って いる 。 {札場|ふだば} の {板|いた} に 、 {札|ふだ} が {次々|つぎつぎ} {掛|か}かって いく 。 || Manybridge at dusk. Barges run; boatmen call out the bridges' names to each other. Tally after tally goes up on the Exchange's boards.
mb_sen: {帳面|ちょうめん} の {一番|いちばん} に 、 「{結|むす}び{橋|ばし}」 と {書|か}きました 。 …… {二番|にばん} から {先|さき} も 、 {少|すこ}し ずつ {字|じ} が {戻|もど}って います 。 || I've written "Musubi Bridge" at number one in the register. …From number two on, the letters are coming back too, bit by bit.
mb_sen: ただ …… {札|ふだ} を {彫|ほ}り{直|なお}す {版木|はんぎ} の {方|ほう} が 、 {変|へん} なん です 。 || Only… something's odd with the woodblocks the plaques are cut from.
narr: {人込|ひとご}み を {分|わ}けて 、 {墨|すみ} で {手|て} を {汚|よご}した {少年|しょうねん} が {走|はし}って くる 。 {手|て} に は 、 {真|ま}っ{白|しろ} な {版木|はんぎ} 。 || Pushing through the crowd comes a boy with ink-stained hands, carrying a woodblock worn completely blank.
narr: 「{親方|おやかた} の {版木|はんぎ} が 、 {棚|たな} の {上|うえ} で {白|しろ}く なって いく ん です ！ {札|ふだ} の {版木|はんぎ} も 、 {灯籠|とうろう} の {名札|なふだ} の {版木|はんぎ} も ！」 || "The master's woodblocks are going blank on the racks! The blocks for the plaques, and the ones for the lantern name slips too!"
?(comp=nao) comp: {版木|はんぎ} …… {刷|す}る {元|もと} が {消|き}えたら 、 {刷|す}った もの も {全部|ぜんぶ} だ 。 || Woodblocks… If the source is going, everything printed from it goes too.
?(comp=mio) comp[surprise]: {灯籠|とうろう} の {名札|なふだ} も ？ それ じゃ 、 どの {道|みち} も …… 。 || The lantern name slips too? Then every road…
?(comp=ren) comp[surprise]: {灯籠|とうろう} の {名札|なふだ} を {刷|す}る {所|ところ} が 、 ここ に ある の です か 。 …… {行|い}かなければ 。 || The place that prints the lantern name slips is here? …Then we have to go.
?(comp=suzu) comp: {刷|す}り{物|もの} の {通|とお}り 、 {版木|はんぎ} の {町|まち} 。 {川上|かわかみ} ね 。 {次|つぎ} の {幕|まく} は 、 そこ よ 。 || Blockprint Row, upriver. That's where the next act is.
pc: {村|むら} {一|ひと}つ の {話|はなし} じゃ ない 。 {名前|なまえ} が 、 {刷|す}る {所|ところ} から {消|き}えて いる 。 || This isn't one village's trouble. The names are fading at the place they're printed.
!set mb1_done
!quest mb_main done
!journal {八百橋|やおばし} の {橋|はし} に {名前|なまえ} が {戻|もど}った 。 でも 、 {川上|かわかみ} の {版木|はんぎ} が {白|しろ}く なって いる 。 || Manybridge's bridges have their names back. But upriver, the printers' woodblocks are going blank.
`, 'mb/23_scenes_under.js');
