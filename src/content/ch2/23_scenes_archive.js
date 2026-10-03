/* Chapter 2 dungeon: the Drowned Archive — receiving hall, stacks,
 * reading room (mid-point rest and shortcut), sluice channels (なわ), and
 * the returns counter with the Tide Clerk. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene sg.da_arrive
# Staged: you look up into the cold hall and lean to the wet letters on the shelves; your companion's own
# reaction (Nao holds out an envelope with a Reedwake postmark, Mio's hand to her chest at the lit lamps, Ren
# looks up at them, Suzu looks away).
!set sg_da_seen
!quest sg_main 8
!gesture pc lookroad up
narr: {中|なか} は {冷|つめ}たく 、 {湿|しめ}った {紙|かみ} の {匂|にお}い が した 。 || Inside it is cold and smells of damp paper.
!gesture pc observe up
narr: {床|ゆか} に は {水|みず}たまり 。 {壁|かべ} に は {棚|たな} 。 {棚|たな} に は 、 {濡|ぬ}れた {手紙|てがみ} が {整然|せいぜん} と {並|なら}んで いる 。 || Puddles on the floor. Shelves on the walls. On the shelves, wet letters stand in neat rows.
narr: {八十年|はちじゅうねん} {前|まえ} に {沈|しず}んだ {場所|ばしょ} に して は 、 {手紙|てがみ} が {新|あたら}しすぎる 。 || For a place that sank eighty years ago, the letters are far too new.
?(comp=nao) !prop comp letter
?(comp=nao) !gesture comp present pc hold
?(comp=mio) !gesture comp guard
?(comp=ren) !gesture comp lookroad up
?(comp=suzu) !gesture comp aside
?(comp=nao) comp[think]: …… {見|み}ろ 。 この {封筒|ふうとう} 、 {葦|あし}ノ{瀬|せ} の {消印|けしいん} だ 。 {先月|せんげつ} の 。 || …Look. This envelope's got a Reedwake postmark. From last month.
?(comp=mio) comp[worry]: {灯|あか}り が …… ついてる 。 {誰|だれ} も いない のに 。 || The lamps are… lit. And there's no one here.
?(comp=ren) comp: {灯|ひ} が {入|はい}って います 。 {誰|だれ} か が 、 {今|いま} も ここ を {使|つか}って いる 。 || The lamps are lit. Someone is still using this place.
?(comp=suzu) comp[worry]: {客|きゃく} の いない {劇場|げきじょう} で 、 {照明|しょうめい} だけ が ついてる みたい 。 {嫌|いや} な {感|かん}じ 。 || Like an empty theatre with the lights still on. I don't like it.
!autosave

@scene sg.da_sortdesk
narr: {仕分|しわ}け {台|だい} 。 {判子|はんこ} の {跡|あと} が 、 {数|かぞ}え{切|き}れない ほど {残|のこ}って いる 。 「{返送|へんそう}」 「{返送|へんそう}」 「{返送|へんそう}」 …… 。 || A sorting desk, covered in more stamp marks than you could count: "RETURNED", "RETURNED", "RETURNED"…

@scene sg.da_eastpile
narr: {封筒|ふうとう} の {山|やま} 。 {一番|いちばん} {上|うえ} の {手紙|てがみ} が {開|ひら}いて いる 。 「{祭|まつ}り に は {帰|かえ}る から 、 {席|せき} を {取|と}って おいて ね 」 。 || A heap of envelopes. The top letter lies open: "I'll be home for the festival, so save me a seat."
narr: {宛名|あてな} は {白|しろ}い 。 {誰|だれ} か が 、 {今|いま} も {席|せき} を {空|あ}けて {待|ま}って いる の だろう か 。 || The address is blank. Is someone still keeping that seat free?

@scene sg.da_innersign
narr: {扉|とびら} の {上|うえ} の {札|ふだ} 。 「{書架|しょか} ・ {関係者|かんけいしゃ} {以外|いがい} {立入|たちいり} {禁止|きんし}」 。 || A sign above the door: "Stacks — staff only".
?(comp=suzu) comp[smirk]: {関係者|かんけいしゃ} よ 。 {今|いま} から ね 。 || We're staff. As of now.

@scene sg.da_catalog
# Staged: you lean in to the jumbled drawers and follow the cord to the inner door; your companion's own way
# of explaining the order (Ren counts the kana off, Nao's open hand, Mio's laugh at herself, Suzu's shrug);
# when the lock clicks you look up at the door.
!if sg_da_catalog -> done
!gesture pc observe 11,3 hold
narr: {目録|もくろく} の {引|ひ}き{出|だ}し が {並|なら}んで いる 。 {引|ひ}き{出|だ}し の {札|ふだ} が 、 ばらばら に {差|さ}し{替|か}えられて いる 。 || A cabinet of catalogue drawers. Their labels have been pulled out and put back all jumbled.
!gesture pc lookbetween 11,3 and=11,1
narr: {奥|おく} の {扉|とびら} の {錠|じょう} は 、 {目録|もくろく} と {同|おな}じ {紐|ひも} で {繋|つな}がって いる 。 {目録|もくろく} が {正|ただ}しく {並|なら}べば 、 {開|ひら}く の だろう か 。 || The lock on the inner door is tied to the cabinet by a cord. Put the catalogue in order, and perhaps it opens.
?(comp=ren) !gesture comp count
?(comp=nao) !gesture comp palm pc
?(comp=mio) !gesture comp laugh
?(comp=suzu) !gesture comp shrug
?(comp=ren) comp: {目録|もくろく} は 、 {五十音|ごじゅうおん} {順|じゅん} が {基本|きほん} です 。 あいうえお 、 かきくけこ …… 。 || Catalogues are normally in gojūon order. A, i, u, e, o. Ka, ki, ku…
?(comp=nao) comp: {配達|はいたつ} の {箱|はこ} と {同|おな}じ だ 。 あ から {順|じゅん} に 、 {五十音|ごじゅうおん} で {並|なら}べる 。 || Like a courier's sorting box. Start from あ and go in gojūon order.
?(comp=mio) comp: {薬棚|くすりだな} も 、 あいうえお {順|じゅん} に {並|なら}べてる の 。 {任|まか}せて 。 …… {並|なら}べる の は あなた だ けど 。 || My medicine shelves are in a-i-u-e-o order too. Leave it to me. …Well, you do the sorting.
?(comp=suzu) comp: {楽屋|がくや} の {名札|なふだ} も 、 あいうえお {順|じゅん} だった わ 。 {主役|しゅやく} が いつも {一番|いちばん} {下|した} で 、 {揉|も}めた もの よ 。 || The dressing-room name cards were in a-i-u-e-o order too. The lead always ended up at the bottom. There were fights.
!note sg_gojuon
!lesson kana
!challenge sg.c_catalog
!if var._res=0 -> later
!set sg_da_catalog
!sfx discover
!gesture pc listen 11,1
narr: {最後|さいご} の {札|ふだ} を {差|さ}し{込|こ}む と 、 {紐|ひも} が {引|ひ}かれ 、 {奥|おく} で {錠|じょう} の {外|はず}れる {音|おと} が した 。 || As you slot in the last label, the cord pulls taut, and somewhere further in a lock clicks open.
!end
:later
narr: {札|ふだ} は 、 その まま に して おいた 。 || You leave the labels as they are for now.
!end
:done
!gesture pc observe 11,3
narr: {目録|もくろく} は {正|ただ}しい {順|じゅん} に {並|なら}んで いる 。 {引|ひ}き{出|だ}し を {開|あ}ける と 、 どれ も {空|から} だった 。 || The catalogue is in order. You open a drawer: every one of them is empty.

@scene sg.da_innerdoor
narr: {奥|おく} へ の {扉|とびら} は {閉|し}まって いる 。 {錠|じょう} から {紐|ひも} が {伸|の}びて 、 {目録|もくろく} の {棚|たな} に {繋|つな}がって いる 。 || The door further in is shut. A cord runs from its lock to the catalogue cabinet.

@scene sg.da_bolted
narr: {横|よこ} の {扉|とびら} 。 {向|む}こう {側|がわ} から 、 {閂|かんぬき} が {掛|か}かって いる 。 || A side door, barred from the other side.

@scene sg.da_stacks_first
# Staged: you look up along the channel where the paper cranes drift; your companion's own reaction (Mio's
# hand to her chest, Nao shakes their head, Ren points to the shelf labels, Suzu looks between the cranes and
# you).
!set sg_da_stacks_seen
!gesture pc lookroad up
narr: {書架|しょか} の {間|あいだ} を 、 {細|ほそ}い {水路|すいろ} が {流|なが}れて いる 。 {紙|かみ} の {鶴|つる} が 、 {水|みず} の {上|うえ} を ゆっくり {飛|と}んで いた 。 || A narrow channel runs between the stacks. Paper cranes drift slowly above the water.
?(comp=mio) !gesture comp guard
?(comp=nao) !gesture comp shake
?(comp=ren) !gesture comp point 16,14
?(comp=suzu) !gesture comp lookbetween up and=pc
?(comp=mio) comp[worry]: あの {鶴|つる} …… {全部|ぜんぶ} 、 {手紙|てがみ} を {折|お}った もの だ よ 。 || Those cranes… they're all folded from letters.
?(comp=nao) comp[angry]: {人|ひと} の {手紙|てがみ} で {鶴|つる} を {折|お}る な よ 。 || Don't fold people's letters into cranes.
?(comp=ren) comp: {棚|たな} の {札|ふだ} を {見|み}て ください 。 {五十音|ごじゅうおん} {順|じゅん} です 。 ここ は 、 {名前|なまえ} の {図書館|としょかん} だった の でしょう 。 || Look at the shelf labels. Gojūon order. This must have been a library of names.
?(comp=suzu) comp: {舞台|ぶたい} {裏|うら} の {迷路|めいろ} って とこ ね 。 {鶴|つる} に {気|き}を つけて 。 {目|め} が ない くせ に 、 よく {見|み}てる わ 。 || A backstage maze. Watch out for the cranes — no eyes, but they see plenty.

@scene sg.da_shelf_a
narr: {棚|たな} の {札|ふだ} 。 「あ{行|ぎょう}」 。 || A shelf label: "あ row".
narr: {一通|いっつう} だけ 、 {棚|たな} に {残|のこ}って いる 。 {宛名|あてな} は 「お{母|かあ}さん へ」 。 {名前|なまえ} では ない から 、 {返送|へんそう} も できなかった らしい 。 || Only one letter is left on this shelf. It's addressed "To Mum". Not a name — so, it seems, it couldn't be returned either.
?(comp=mio) comp[smile]: {名前|なまえ} じゃ なくて も 、 {誰|だれ} {宛|あて} か 、 {書|か}いた {人|ひと} に は {分|わ}かってる の に ね 。 || It's not a name, but the person who wrote it knows exactly who it's for.

@scene sg.da_shelf_ka
narr: {棚|たな} の {札|ふだ} 。 「か{行|ぎょう}」 。 {船|ふね} の {登録|とうろく} カード が {並|なら}んで いる 。 「かもめ{丸|まる}」 「こはる{丸|まる}」 …… 。 || A shelf label: "か row". Ship registry cards stand in a row: Kamome-maru, Koharu-maru…
narr: {船|ふね} の {名前|なまえ} まで 、 ここ に {集|あつ}められて いる 。 || Even boats' names have been gathered here.

@scene sg.da_shelf_sa
narr: {棚|たな} の {札|ふだ} 。 「さ{行|ぎょう}」 。 {看板|かんばん} の {板|いた} が {重|かさ}なって いる 。 「さかな{屋|や}」 「しお{屋|や}」 。 {店|みせ} の {名前|なまえ} だ 。 || A shelf label: "さ row". Shop signboards are stacked here: "Fishmonger", "Salt merchant". Shop names.

@scene sg.da_shelf_ta
narr: {棚|たな} の {札|ふだ} 。 「た{行|ぎょう}」 。 || A shelf label: "た row".
narr: 「ち」 の {所|ところ} だけ 、 {一枚|いちまい} {抜|ぬ}かれた {跡|あと} が ある 。 {誰|だれ} か が 、 {上|うえ} の {部屋|へや} へ {持|も}って いった らしい 。 || In the ち section, one card has been pulled out. Someone seems to have taken it up to the room above.

@scene sg.da_wetbooks
narr: {水|みず} を {吸|す}って {膨|ふく}らんだ {本|ほん} 。 {開|ひら}く と 、 {誰|だれ} か の {日記|にっき} だった 。 {名前|なまえ} の {所|ところ} だけ が 、 {全部|ぜんぶ} {白|しろ}い 。 || A book swollen with water. You open it: someone's diary. Everywhere a name should be, the page is blank.

@scene sg.da_reading_first
# Staged: your companion steps in from the doorway beside you; a breath out in the warm, dry room; your
# companion's own way of resting (Nao looks from one exit to the next, Mio hands you a ginger sweet, Ren leans
# to the lamp, Suzu stretches).
!set sg_da_reading_seen
!walkto comp 1 7 right
narr: {乾|かわ}いた {部屋|へや} だ 。 {床|ゆか} が {高|たか}く 、 {水|みず} が {入|はい}って いない 。 {絨毯|じゅうたん} の {上|うえ} に 、 {机|つくえ} と {椅子|いす} 。 || A dry room. The floor is raised; the water hasn't got in. Desks and chairs on a carpet.
!gesture pc exhale
narr: {灯|あか}り が {暖|あたた}かい 。 {少|すこ}し {休|やす}んで いこう 。 || The lamplight is warm. You rest for a while.
!heal
?(comp=nao) !gesture comp lookbetween 0,6 and=8,0
?(comp=mio) !gesture comp handover pc
?(comp=mio) !gesture pc receive comp
?(comp=ren) !gesture comp observe 2,4
?(comp=suzu) !gesture comp stretch
?(comp=nao) comp: {出口|でぐち} は {三|みっ}つ 。 {西|にし} 、 {北|きた} 、 {下|した} の {階段|かいだん} 。 …… {癖|くせ} だ よ 。 {気|き} に する な 。 || Three exits. West, north, the stairs down. …Habit. Don't mind me.
?(comp=mio) comp[smile]: {少|すこ}し {休|やす}もう 。 {生姜|しょうが} の {飴|あめ} 、 あげる 。 {体|からだ} が {温|あたた}まる よ 。 || Let's rest a little. Have a ginger sweet — it'll warm you up.
?(comp=ren) comp: ここ の {灯|あか}り は 、 {灯守|ひもり} の {灯|ひ} と {同|おな}じ {色|いろ} です 。 …… {誰|だれ} が {灯|とも}した の でしょう 。 || The lamps here burn the same colour as a keeper's flame. …I wonder who lit them.
?(comp=suzu) comp: {幕間|まくあい} ね 。 {水|みず} を {飲|の}んで 、 {背筋|せすじ} を {伸|の}ばして 。 {後半|こうはん} は {長|なが}い わ よ 。 || Intermission. Drink some water, straighten your back. The second act's a long one.
!autosave

@scene sg.da_readingsign
narr: {壁|かべ} の {札|ふだ} 。 「{閲覧室|えつらんしつ} ・ {私語|しご} を {慎|つつし}む こと」 。 || A sign on the wall: "Reading Room — silence, please."
?(comp=suzu) comp[smirk]: {私語|しご} を {慎|つつし}め 、 ね 。 {書庫|しょこ} って 、 {昔|むかし} から {静|しず}か な の が {好|す}き なの よ 。 || "Silence, please." Archives have always loved quiet.

@scene sg.da_ledger
# Staged: you lean in to the open register; your companion's own reaction to the head office's seal (Ren
# starts, then looks away from their master; Nao's flat hand; Mio's hand to her chest; Suzu's hand to her
# chin); you turn to your companion to say where the names go.
!if sg_da_ledger -> again
!gesture pc observe 5,5 hold
narr: {分厚|ぶあつ}い {台帳|だいちょう} が 、 {開|ひら}いた まま に なって いる 。 {最後|さいご} の {書|か}き{込|こ}み は …… {昨日|きのう} の {日付|ひづけ} だ 。 || A thick register lies open. The last entry is dated… yesterday.
narr: 「{潮硝子|しおがらす} {分|ぶん} 、 {宛名|あてな} {判読|はんどく} {不能|ふのう} {四十二通|よんじゅうにつう} 。 {返送|へんそう} {処理|しょり} {済|ず}み 。 {本庁|ほんちょう} {移管|いかん} {待|ま}ち 。」 || "Saltglass: forty-two items, addressee illegible. Processed as returned. Awaiting transfer to head office."
narr: {表紙|ひょうし} の {裏|うら} に 、 {古|ふる}い {規則|きそく} が {貼|は}って ある 。 || The old rules are pasted inside the front cover.
!challenge sg.c_notice
!if var._res=0 -> later
!set sg_da_ledger
narr: {規則|きそく} の {最後|さいご} に 、 {印|いん} が {押|お}して ある 。 「{静寂|しじま} の {書庫|しょこ} ・ {本庁|ほんちょう}」 。 || At the foot of the rules is a seal: "The Still Archive — Head Office".
!note sg_drowned_archive sg_still_archive
?(comp=ren) !gesture comp listen pc
?(comp=nao) !gesture comp emphatic
?(comp=mio) !gesture comp guard
?(comp=suzu) !gesture comp chin
?(comp=ren) comp[surprise]: {静寂|しじま} の {書庫|しょこ} …… 。 {灯守|ひもり} の {古|ふる}い {本|ほん} に {出|で}て くる {名|な} です 。 {名|な} と {約束|やくそく} の {写|うつ}し を {守|まも}る ため の {書庫|しょこ} 。 {山|やま} の {上|うえ} に ある と 。 || The Still Archive… The name appears in the keepers' old books. An archive built to protect copies of names and promises. They say it's in the mountains.
?(comp=ren) !gesture comp aside
?(comp=ren) comp[worry]: {師匠|ししょう} は …… いえ 。 {何|なん} でも ありません 。 || My master once… No. It's nothing.
?(comp=nao) comp[angry]: {昨日|きのう} の {日付|ひづけ} 。 {四十二通|よんじゅうにつう} 。 …… {誰|だれ} か が 、 {今|いま} も {手紙|てがみ} を {集|あつ}めて {仕舞|しま}い{込|こ}んでる 。 {配達|はいたつ} の {逆|ぎゃく} だ 。 || Yesterday's date. Forty-two letters. …Someone is still collecting letters and locking them away. Delivery in reverse.
?(comp=mio) comp[worry]: {守|まも}る ため の {書庫|しょこ} が 、 {名前|なまえ} を {取|と}り{上|あ}げてる …… 。 {薬|くすり} が {毒|どく} に なる の と 、 {同|おな}じ かも 。 {量|りょう} を {間違|まちが}えた だけ で 。 || An archive meant to protect is taking names away… Maybe it's like medicine turning to poison. Just the wrong dose.
?(comp=suzu) comp[think]: 「{本庁|ほんちょう} {移管|いかん} {待|ま}ち」 。 この {舞台|ぶたい} の {奥|おく} に 、 もう {一|ひと}つ {舞台|ぶたい} が ある って こと ね 。 || "Awaiting transfer to head office." So there's another stage behind this one.
!look pc comp
pc: {名前|なまえ} は 、 ここ で {終|お}わり じゃ ない 。 もっと {先|さき} へ {送|おく}られて いる 。 || The names don't end here. They're being sent further on.
!journal {静寂|しじま} の {書庫|しょこ} が 、 {今|いま} も {名前|なまえ} を {集|あつ}めて いる 。 || The Still Archive is still collecting names.
!autosave
!end
:later
narr: {台帳|だいちょう} は {逃|に}げない 。 {後|あと} で また {読|よ}もう 。 || The register isn't going anywhere. Read it later.
!end
:again
!gesture pc observe 5,5
narr: {台帳|だいちょう} 。 「{本庁|ほんちょう} {移管|いかん} {待|ま}ち」 の {文字|もじ} が 、 {何度|なんど} も {並|なら}んで いる 。 || The register. "Awaiting transfer to head office", over and over again.

@scene sg.da_registry
# Staged: you lean to the card on the desk, then pick it up and read it.
!if sg_registry_taken -> none
!gesture pc observe 11,5
narr: {机|つくえ} の {上|うえ} に 、 {船|ふね} の {登録|とうろく} カード が {一枚|いちまい} 。 「{返送|へんそう}」 の {判|はん} が {押|お}して ある 。 || A single ship registry card lies on the desk, stamped "RETURNED".
!prop pc paper
!gesture pc read hold
narr: 「{船名|せんめい} ： {千鳥丸|ちどりまる} 。 {船主|ふなぬし} ： ヘイキチ 。 {潮硝子|しおがらす}」 。 || "Vessel: Chidori-maru. Owner: Heikichi. Saltglass."
!give sg_registry
!set sg_registry_taken
?(quest.sg_seaglass=1) !quest sg_seaglass 2
?(quest.sg_seaglass>=1) pc: フク さん の {旦那|だんな} さん の {船|ふね} だ 。 アサヒ さん に {届|とど}けよう 。 || That's Fuku's husband's boat. Let's take it to Asahi.
?(!quest.sg_seaglass>=1) narr: {誰|だれ} か が 、 この {名前|なまえ} を {探|さが}して いる かも しれない 。 {持|も}って {帰|かえ}ろう 。 || Someone might be looking for this name. You take it with you.
!end
:none
narr: {何|なに} も ない {机|つくえ} 。 {判子|はんこ} の {跡|あと} だけ が {残|のこ}って いる 。 || An empty desk. Only stamp marks remain.

@scene sg.da_unbolt
narr: {下|した} へ {降|お}りる {狭|せま}い {階段|かいだん} 。 {扉|とびら} に {閂|かんぬき} が {掛|か}かって いる 。 こちら {側|がわ} から なら 、 {外|はず}せそう だ 。 || A narrow stair leading down. The door is barred — but it could be unbarred from this side.
!choice
* {閂|かんぬき} を {外|はず}す || Lift the bar -> open
* その まま に する || Leave it -> end
:open
!set sg_da_shortcut
!sfx door
narr: {閂|かんぬき} を {外|はず}した 。 {階段|かいだん} は 、 {受付|うけつけ} の {横|よこ} の {扉|とびら} へ {続|つづ}いて いる 。 {近道|ちかみち} だ 。 || You lift the bar. The stair leads down to the side door of the receiving hall — a shortcut.

@scene sg.da_sluice_first
!set sg_da_sluice_seen
narr: {水|みず} の {音|おと} が {大|おお}きく なった 。 {古|ふる}い {水門|すいもん} から 、 {海|うみ} の {水|みず} が {流|なが}れ{込|こ}んで いる 。 || The sound of water grows louder. Seawater pours in through an old sluice gate.
narr: {深|ふか}い {水路|すいろ} が 、 {部屋|へや} を {横|よこ} に {切|き}って いる 。 {奥|おく} の {扉|とびら} は 、 その {向|む}こう だ 。 || A deep channel cuts across the room. The far door lies beyond it.

@scene sg.da_channel
narr: {深|ふか}くて {流|なが}れ が {速|はや}い 。 {跳|と}び{越|こ}えられる {幅|はば} では ない 。 || Deep and fast. Far too wide to jump.
?(!sg_da_raft) narr: {近|ちか}く の {係船柱|けいせんちゅう} に 、 {何|なに} か {結|むす}べ そう だ 。 || You might be able to tie something to the bollard nearby.

@scene sg.da_sluicesign
narr: {錆|さ}びた {札|ふだ} 。 「{満潮|まんちょう} {時|じ} {閉門|へいもん}」 。 {今|いま} は {閉|し}まって いない 。 || A rusted sign: "Closed at high tide". It isn't closed now.

@scene sg.da_raft
# Staged: you look across the channel at the floating cabinet; with the rope in hand you reach to throw it,
# and it falls short; your companion's own way of suggesting the word (Nao's and Mio's open hand, Ren's
# glasses, Suzu's laugh); once the rope holds, their own pleasure (Nao's and Ren's nod, Mio's and Suzu's small
# celebration).
!if sg_da_raft -> done
!gesture pc observe 13,7 hold
narr: {水路|すいろ} の {向|む}こう に 、 {大|おお}きな {目録|もくろく} の {棚|たな} が {浮|う}かんで いる 。 {筏|いかだ} に なり そう だ が 、 {流|なが}れ に {揺|ゆ}られて 、 {近|ちか}づいて は {離|はな}れる 。 || Across the channel a large catalogue cabinet is floating. It would make a raft — but the current keeps nudging it closer and pulling it away.
!prop pc rope
!gesture pc handover 13,7
narr: テツ に もらった {縄|なわ} を 、 {係船柱|けいせんちゅう} に {結|むす}ぶ 。 でも 、 {投|な}げて も {棚|たな} まで は {届|とど}かない 。 || You tie Tetsu's rope to the bollard. But however you throw it, it won't reach the cabinet.
?(comp=nao) !gesture comp palm pc
?(comp=mio) !gesture comp palm pc
?(comp=ren) !gesture comp glasses
?(comp=suzu) !gesture comp laugh
?(comp=nao) comp: {投|な}げて {届|とど}かない なら 、 {縄|なわ} の ほう に {届|とど}いて もらう しか ない 。 …… {書|か}ける か ？ || If throwing won't reach, the rope'll have to reach by itself. …Can you write it?
?(comp=mio) comp: {縄|なわ} の {字|じ} 、 {書|か}いて みたら ？ {風|かぜ} の とき みたい に 。 || What if you wrote the word for rope? Like you did with the wind.
?(comp=ren) comp: {物|もの} の {名|な} を {書|か}けば 、 {物|もの} は その {名|な} を {思|おも}い{出|だ}す 。 {縄|なわ} なら …… {繋|つな}ぐ こと を 。 || Write a thing's name, and it remembers what it is. A rope would remember… how to hold.
?(comp=suzu) comp[smirk]: {縄|なわ}{抜|ぬ}け の {逆|ぎゃく} を やる の よ 。 {縄|なわ} で {捕|つか}まえる 、 ね 。 || We do the rope escape in reverse. The rope catches, for once.
!challenge sg.c_nawa
!if var._res=0 -> later
!prop pc -
!look pc 13,7
narr: 「{縄|なわ}」 。 {書|か}いた {字|じ} が {縄|なわ} に {染|し}み{込|こ}む と 、 {縄|なわ} は {蛇|へび} の よう に {水|みず} の {上|うえ} を {伸|の}びて 、 {棚|たな} に {巻|ま}き{付|つ}いた 。 || Nawa — rope. As the word soaks into it, the rope snakes out across the water and wraps itself around the cabinet.
!word nawa
!set sg_da_raft
!sfx ward
narr: {棚|たな} が {引|ひ}き{寄|よ}せられ 、 {水路|すいろ} に {橋|はし} の よう に {収|おさ}まった 。 || The cabinet is hauled in and settles across the channel like a bridge.
?(comp=nao) !gesture comp nod pc
?(comp=mio) !gesture comp celebrate
?(comp=ren) !gesture comp nod pc
?(comp=suzu) !gesture comp celebrate
?(comp=nao) comp[smile]: {縄|なわ} なし で {水|みず} に {近|ちか}づく の は {馬鹿|ばか} だけ 、 か 。 あの {爺|じい}さん 、 {正|ただ}しかった な 。 || "Only fools go near water without a rope." The old man was right.
?(comp=mio) comp[smile]: {繋|つな}がった ！ …… テツ さん に 、 お{礼|れい} を {言|い}わなきゃ 。 || It's holding! …We'll have to thank Tetsu.
?(comp=ren) comp[smile]: {繋|つな}ぐ {字|じ} です ね 。 {灯|ひ} の {道|みち} に も 、 {縄|なわ} は {欠|か}かせません 。 {灯籠|とうろう} を {吊|つ}る の に 。 || A word that joins things. The lantern roads couldn't do without rope either — for hanging the lanterns.
?(comp=suzu) comp[laugh]: {大成功|だいせいこう} ！ {縄|なわ} の {芸|げい} で {拍手|はくしゅ} を もらった の は 、 {初|はじ}めて よ 。 || A triumph! First time I've ever been applauded for a rope act.
!autosave
!end
:later
narr: {棚|たな} は 、 {流|なが}れ の {中|なか} で {揺|ゆ}れて いる 。 || The cabinet bobs in the current.
!end
:done
narr: {縄|なわ} は しっかり と 、 {棚|たな} を {繋|つな}ぎ{止|と}めて いる 。 || The rope holds the cabinet fast.

@scene sg.da_counter
!if sg_boss_done -> after
narr: {長|なが}い {窓口|まどぐち} 。 {返送|へんそう} を {待|ま}つ {手紙|てがみ} が 、 {整然|せいぜん} と {積|つ}まれて いる 。 || A long counter. Letters awaiting return are stacked neatly along it.
!end
:after
narr: {窓口|まどぐち} は {空|から} だ 。 {割|わ}れた {判子|はんこ} の {欠片|かけら} が 、 {小|ちい}さく {光|ひか}って いる 。 || The counter is empty. A fragment of the broken stamp glints faintly.

@scene sg.da_boss
# Staged: you walk up to the long counter towards the stamping; the Clerk (a figure that only turns and
# tilts) tilts to you at "Next"; you answer with an open hand; your companion's own reply (Nao's and Mio's
# flat hand, Ren's open hand, Suzu points at the Clerk); "Next" again.
!music sg_counter
!walkto pc 9 6 up
narr: {長|なが}い {窓口|まどぐち} の {向|む}こう で 、 {誰|だれ} か が {判子|はんこ} を {押|お}して いる 。 とん 。 とん 。 とん 。 || Behind the long counter, someone is stamping. Thump. Thump. Thump.
!gesture sg_clerk stiff pc
sg_clerk: {次|つぎ} 。 || Next.
sg_clerk: {宛名|あてな} {判読|はんどく} {不能|ふのう} 。 {返送|へんそう} 。 {次|つぎ} 。 || Addressee illegible. Returned. Next.
!gesture pc palm sg_clerk
pc: その {手紙|てがみ} は 、 {港|みなと} の {人|ひと} たち の もの です 。 || Those letters belong to the people of the harbour.
sg_clerk: {宛名|あてな} の ない {手紙|てがみ} は 、 {誰|だれ} の もの でも ない 。 {迷|まよ}う {手紙|てがみ} は 、 {人|ひと} を {迷|まよ}わせる 。 {返送|へんそう} し 、 {棚|たな} に {上|あ}げ 、 {静|しず}か に する 。 それ が {規定|きてい} だ 。 || A letter without an address belongs to no one. Stray letters lead people astray. Return it, shelve it, make it quiet. Those are the regulations.
sg_clerk: {宛名|あてな} を {消|け}した の は {私|わたし} では ない 。 {潮|しお} が {消|け}す 。 {静寂|しじま} が {消|け}す 。 {私|わたし} は 、 {片付|かたづ}ける だけ だ 。 || It was not I who erased the addresses. The tide erases them. The Hush erases them. I only tidy up.
?(comp=nao) !gesture comp emphatic sg_clerk
?(comp=mio) !gesture comp emphatic sg_clerk
?(comp=ren) !gesture comp palm sg_clerk
?(comp=suzu) !gesture comp point sg_clerk
?(comp=nao) comp[angry]: {片付|かたづ}ける 、 ね 。 {届|とど}ける の が {仕事|しごと} の {人間|にんげん} から {言|い}わせて もらう と 、 それ は {捨|す}てる って {言|い}う ん だ よ 。 || "Tidy up." Speaking as someone whose job is delivering: that's called throwing away.
?(comp=mio) comp[angry]: {片付|かたづ}ける ？ {人|ひと} の {手紙|てがみ} を ？ …… {失礼|しつれい} です が 、 あなた の {規定|きてい} 、 {間違|まちが}って います 。 || Tidy up? Other people's letters? …Excuse me, but your regulations are wrong.
?(comp=ren) comp: {記録|きろく} を {守|まも}る {者|もの} が 、 {記録|きろく} を {閉|と}じ{込|こ}める 。 …… それ は 、 {灯|ひ} を {守|まも}る と {言|い}って 、 {灯|ひ} を {消|け}す の と {同|おな}じ です 。 || A keeper of records locking records away. …It's like claiming to protect a flame by putting it out.
?(comp=suzu) comp[smirk]: その {規定|きてい} の {台本|だいほん} 、 ちょっと {古|ふる}い ん じゃ ない ？ {書|か}き{直|なお}して あげる わ よ 。 || That script of regulations is a bit dated, isn't it? We'll rewrite it for you.
!gesture sg_clerk stiff pc
sg_clerk: {窓口|まどぐち} は {一|ひと}つ 。 {順番|じゅんばん} を {守|まも}れ 。 {次|つぎ} 。 || One counter. Wait your turn. Next.
!battle sg.tideclerk
!set sg_boss_done
!call sg.da_boss_after

@scene sg.da_boss_after
# Staged: you look down at the broken stamp; the Clerk tilts to you; you explain with an open hand and ask
# after "the master"; you look up at the letters lifting off the shelves; your companion's own reaction (Nao's
# nod, Mio's and Suzu's lowered head, Ren's hand to their chin).
!gesture pc observe 9,5
narr: {割|わ}れた {判子|はんこ} が 、 {窓口|まどぐち} に {転|ころ}がった 。 || The broken stamp rolls across the counter.
!gesture sg_clerk stiff pc
sg_clerk: …… {読|よ}めない {宛名|あてな} を 、 {読|よ}める {人|ひと} が いる の か 。 || …There are people who can read an unreadable address?
!gesture pc palm sg_clerk
pc: {全部|ぜんぶ} では ない 。 でも 、 {中身|なかみ} を {読|よ}めば 、 {誰|だれ} の もの か {分|わ}かる {手紙|てがみ} も ある 。 || Not all of them. But some letters, if you read them, tell you whose they are.
sg_clerk: {規定|きてい} に は ない {方法|ほうほう} だ 。 || That method is not in the regulations.
sg_clerk: …… {本庁|ほんちょう} は 、 {納得|なっとく} しない だろう 。 {名|な} は {増|ふ}える ほど {争|あらそ}い を {生|う}む 、 と {本庁|ほんちょう} の {主|あるじ} は {言|い}う 。 {静|しず}か な ほう が 、 {人|ひと} は {傷|きず}つかない 、 と 。 || …Head office will not agree. The more names there are, the more quarrels they breed — so says the master of head office. People are hurt less when it is quiet.
!gesture pc listen sg_clerk
pc: {主|あるじ} ？ || The master?
sg_clerk: {書庫|しょこ} の {守|も}り{人|びと} 。 {山|やま} の {上|うえ} の 、 {静寂|しじま} の {書庫|しょこ} に いる 。 {名|な} は …… {棚|たな} に {上|あ}げて ある 。 || The keeper of the archive. In the Still Archive, up in the mountains. The name… has been shelved.
narr: {書記|しょき} の {姿|すがた} が 、 {水|みず} に {溶|と}ける {墨|すみ} の よう に {薄|うす}れて いく 。 || The Clerk's shape fades like ink dissolving in water.
sg_clerk: {手紙|てがみ} を {持|も}って いけ 。 {返送|へんそう} は …… {取|と}り{消|け}す 。 || Take the letters. The return… is cancelled.
!sfx reveal
!music sg_letters
!gesture pc lookroad up
narr: {棚|たな} から 、 {手紙|てがみ} が いっせい に {浮|う}かび{上|あ}がった 。 {紙|かみ} の {鶴|つる} が ほどけ 、 {封筒|ふうとう} に {戻|もど}って 、 {出口|でぐち} の ほう へ {流|なが}れて いく 。 || Letters lift off the shelves all at once. Paper cranes unfold into envelopes again and drift towards the way out.
!give sg_stamp
?(comp=nao) !gesture comp nod pc
?(comp=mio) !gesture comp lowered
?(comp=ren) !gesture comp chin
?(comp=suzu) !gesture comp lowered
?(comp=nao) comp: {全部|ぜんぶ} 、 {港|みなと} に {帰|かえ}る 。 …… {配達|はいたつ} {完了|かんりょう} 、 だ な 。 || They're all going home to the harbour. …Delivery complete.
?(comp=mio) comp[sad]: {静|しず}か な ほう が {傷|きず}つかない …… 。 その {気持|きも}ち が {少|すこ}し {分|わ}かる の が 、 {嫌|いや} 。 || "People are hurt less when it's quiet"… I hate that I understand that a little.
?(comp=ren) comp[think]: {書庫|しょこ} の {守|も}り{人|びと} 。 {山|やま} の {上|うえ} 。 …… いつか 、 {行|い}かなければ なりません ね 。 || The keeper of the archive. Up in the mountains. …Someday, we'll have to go.
?(comp=suzu) comp[closed]: {傷|きず}つけない ため に 、 {黙|だま}らせる 。 …… {優|やさ}しい {嘘|うそ} と 、 {似|に}てる わ ね 。 || Silencing people so they won't be hurt. …It's a lot like a kind lie.
!quest sg_main 9
narr: {手紙|てがみ} の {流|なが}れ に {導|みちび}かれる よう に して 、 {書庫|しょこ} を {出|で}た 。 {砂|すな} の {道|みち} は 、 まだ {乾|かわ}いて いた 。 || Led by the stream of letters, you make your way out of the archive. The sand road is still dry.
!warp sg.harbor 9 33 up
`, 'ch2/23_scenes_archive');
