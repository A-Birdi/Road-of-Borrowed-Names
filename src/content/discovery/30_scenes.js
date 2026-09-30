/* Inspection scenes of the field puzzles' objects: what the player sees now
 * (from the definition, via !hook fw_look), the ordinary actions that fit
 * the object's current state, a way into Weave for this object, a layered
 * hint and, for multi-step mechanisms, a reset. The world's answer to each
 * action comes from the rules (src/content/discovery/10_puzzles.js). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene fw.f1.screen
!hook fw_look f1 screen
!if puzzle.f1=done -> read
!choice
* [puzzle.f1.screen=swing&!puzzle.f1.held] {衝|つい}{立|たて} を {柱|はしら} に {寄|よ}せて {閉|し}める || Swing the screen shut against its post. -> close
* [puzzle.f1.screen=closed] {手|て} を {放|はな}す || Let go of it. -> open
* [weave] {言葉|ことば} を {織|お}る …… || Weave a word on it… -> weave
* {考|かんが}えて みる || Think it over. -> hint
* そのまま に する || Leave it. -> end
:close
!hook fw_act f1 close
!end
:open
!hook fw_act f1 open
!end
:weave
!hook fw_open f1 screen
!end
:hint
!hook fw_hint f1
!end
:read
narr: {札|ふだ} に は 、 {倉|くら} の {棚|たな} ごと に 、 {物|もの} を {預|あず}けた {人|ひと} の {名前|なまえ} が {書|か}いて ある 。 || The slips name who has left things on each shelf of the warehouse.
narr: 「 {一|いち} の {棚|たな} 、 ハナ 、 {茶葉|ちゃば} 。 {二|に} の {棚|たな} 、 ブンタ 、 {釘|くぎ} 。 {三|さん} の {棚|たな} 、 ミオ 、 {干|ほ}した {薬草|やくそう} 。 」 || "Shelf one: Hana, tea leaves. Shelf two: Bunta, nails. Shelf three: Mio, dried herbs."
narr: {一番|いちばん} {下|した} に 、 {子|こ}ども の {字|じ} で 「 {四|よん} の {棚|たな} 、 こども たち 、 ふね 」 。 || At the bottom, in a child's hand: "Shelf four: the children, boats."

@scene fw.f1.clamp
!hook fw_look f1 clamp
!if puzzle.f1=done -> end
!choice
* {留|と}め{具|ぐ} で {衝|つい}{立|たて} の {端|はし} を {挟|はさ}む || Close the clamp on the screen's edge. -> clamp
* [weave] {言葉|ことば} を {織|お}る …… || Weave a word on it… -> weave
* そのまま に する || Leave it. -> end
:clamp
!hook fw_act f1 clamp
!end
:weave
!hook fw_open f1 clamp
!end

@scene fw.f2.diagram
!hook fw_look f2 diagram
!choice
* {考|かんが}えて みる || Think it over. -> hint
* {離|はな}れる || Step back. -> end
:hint
!hook fw_hint f2

@scene fw.f2.post
!hook fw_look f2 post
!if puzzle.f2=done -> end
!choice
* [weave] {言葉|ことば} を {織|お}る …… || Weave a word on it… -> weave
* {離|はな}れる || Step back. -> end
:weave
!hook fw_open f2 post

@scene fw.f2.crank
!hook fw_look f2 crank
!if puzzle.f2=done -> end
!choice
* [puzzle.f2.catch=off] {止|と}め{爪|づめ} を {掛|か}ける || Drop the catch onto the drum. -> on
* [puzzle.f2.catch=on&!puzzle.f2.bound&!puzzle.f2.float=slot] {止|と}め{爪|づめ} を {上|あ}げる || Lift the catch. -> off
* {取|と}っ{手|て} を {回|まわ}す || Wind the crank. -> crank
* [weave] {言葉|ことば} を {織|お}る …… || Weave a word on it… -> weave
* {離|はな}れる || Step back. -> end
:on
!hook fw_act f2 catch_on
!end
:off
!hook fw_act f2 catch_off
!end
:crank
!hook fw_act f2 crank
!end
:weave
!hook fw_open f2 crank

@scene fw.f2.inlet
!hook fw_look f2 inlet
!if puzzle.f2=done -> end
!choice
* [weave] {言葉|ことば} を {織|お}る …… || Weave a word on it… -> weave
* {離|はな}れる || Step back. -> end
:weave
!hook fw_open f2 inlet

@scene fw.f2.tank
!hook fw_look f2 tank
!if puzzle.f2=done -> end
!choice
* [puzzle.f2.float=stop|puzzle.f2.level=high|puzzle.f2.vent=open|puzzle.f2.catch=on] {水|みず} を {抜|ぬ}いて 、 {浮|う}き を {受|う}け{台|だい} に {戻|もど}す || Drain it and set the float back in its cradle. -> reset
* [weave] {言葉|ことば} を {織|お}る …… || Weave a word on it… -> weave
* {考|かんが}えて みる || Think it over. -> hint
* {離|はな}れる || Step back. -> end
:reset
!hook fw_reset f2
!end
:weave
!hook fw_open f2 tank
!end
:hint
!hook fw_hint f2

@scene fw.f2.vent
!hook fw_look f2 vent
!if puzzle.f2=done -> end
!choice
* [puzzle.f2.vent=shut] {蓋|ふた} を {緩|ゆる}める || Turn the cap back a turn. -> open
* [puzzle.f2.vent=open] {蓋|ふた} を {締|し}める || Screw the cap down. -> shut
* [weave] {言葉|ことば} を {織|お}る …… || Weave a word on it… -> weave
* {離|はな}れる || Step back. -> end
:open
!hook fw_act f2 vent_open
!end
:shut
!hook fw_act f2 vent_shut
!end
:weave
!hook fw_open f2 vent

@scene fw.f2_tobi
!faceplayer tobi
tobi: {浮|う}き 、 {上|あ}がってる ！ {窓|まど} の {字|じ} 、 {読|よ}めた よ 。 「 {見|み}えました か ？ 」 だって 。 {見|み}えた よ ！ || The float's up! I can read the window now. It says "Can you see this?" I can!
tobi: {予備|よび} の {浮|う}き 、 {僕|ぼく} も {塗|ぬ}る の {手伝|てつだ}った ん だ よ 。 {赤|あか}い の は {僕|ぼく} が {塗|ぬ}った 。 || I helped paint the spare floats, you know. The red ones are mine.

@scene fw.f3.tray
!hook fw_look f3 tray
!if puzzle.f3=done -> end
!choice
* [weave] {言葉|ことば} を {織|お}る …… || Weave a word on it… -> weave
* {考|かんが}えて みる || Think it over. -> hint
* {離|はな}れる || Step back. -> end
:weave
!hook fw_open f3 tray
!end
:hint
!hook fw_hint f3

@scene fw.f3.lamp
!hook fw_look f3 lamp
!if puzzle.f3=done -> end
!choice
* [puzzle.f3.light=top] {灯|あか}り の {腕|うで} を {横|よこ} に {下|さ}げる || Swing the lamp's arm down to the side. -> side
* [puzzle.f3.light=side] {灯|あか}り を {真上|まうえ} に {戻|もど}す || Swing the lamp back overhead. -> top
* [weave] {言葉|ことば} を {織|お}る …… || Weave a word on it… -> weave
* {離|はな}れる || Step back. -> end
:side
!hook fw_act f3 lamp_side
!end
:top
!hook fw_act f3 lamp_top
!end
:weave
!hook fw_open f3 lamp

@scene fw.f3.peg
!hook fw_look f3 peg
!if puzzle.f3=done -> end
!choice
* [puzzle.f3.support=none] {楔|くさび} を {台|だい} の {短|みじか}い {脚|あし} に {差|さ}す || Slide a wedge under the tray's short foot. -> set
* [puzzle.f3.support=peg] {楔|くさび} を {抜|ぬ}く || Take the wedge out again. -> take
* [weave] {言葉|ことば} を {織|お}る …… || Weave a word on it… -> weave
* {離|はな}れる || Step back. -> end
:set
!hook fw_act f3 peg_set
!end
:take
!hook fw_act f3 peg_take
!end
:weave
!hook fw_open f3 peg

@scene fw.f3.note
!hook fw_look f3 note

@scene fw.f3_isao
!faceplayer co_isao
co_isao: {見本|みほん} の {札|ふだ} 、 {戻|もど}した の は お{前|まえ} か 。 {客|きゃく} に {聞|き}かれて も 、 {俺|おれ} に は もう {印|しるし} が {読|よ}め なかった 。 || So you're the one who put the sample's card back. When customers asked, I couldn't read the mark any more.
co_isao: {楔|くさび} は その まま に して おけ 。 {灯|あか}り も な 。 {誰|だれ} が {見|み}て も {分|わ}かる よう に 。 || Leave the wedge where it is. The lamp too. So anyone who looks can tell.

@scene fw.f4.note
!hook fw_look f4 note
!choice
* {考|かんが}えて みる || Think it over. -> hint
* {離|はな}れる || Step back. -> end
:hint
!hook fw_hint f4

@scene fw.f4.box
!hook fw_look f4 cover
!choice
* {箱|はこ} ① を {開|あ}ける || Open box ①. -> a
* {箱|はこ} ② を {開|あ}ける || Open box ②. -> b
* {箱|はこ} ③ を {開|あ}ける || Open box ③. -> c
* [weave&puzzle.f4.frost=on] {覆|おお}い に {言葉|ことば} を {織|お}る …… || Weave a word on the cover… -> weave
* {離|はな}れる || Step back. -> end
:a
!hook fw_act f4 open_a
!end
:b
!hook fw_act f4 open_b
!end
:c
!hook fw_act f4 open_c
!end
:weave
!hook fw_open f4 cover

@scene fw.f4.cloth
!hook fw_look f4 cloth
!if puzzle.f4.frost=off -> end
!choice
* {温|あたた}かい {布|ぬの} を {覆|おお}い の {枠|わく} に {当|あ}てる || Press the warm cloth to the cover's frame. -> wipe
* {離|はな}れる || Step back. -> end
:wipe
!hook fw_act f4 wipe

@scene fw.f4_denji
!faceplayer denji
denji: おれ の {留|と}め{具|ぐ} 、 {見|み}つけた か 。 ボタン より {強|つよ}い ぞ 。 {吹雪|ふぶき} で も {外套|がいとう} が {開|ひら}かん@開く 。 || Found one of my toggles, did you. Stronger than a button. It'll keep a coat shut in a blizzard.

@scene fw.f5.alcove
!hook fw_look f5 alcove
!choice
* {撞木|しゅもく} で {鐘|かね} を {打|う}つ || Strike the chime. -> strike
* [weave] {言葉|ことば} を {織|お}る …… || Weave a word on it… -> weave
* [!puzzle.f5=done&puzzle.f5] {幕|まく} と {仕切|しき}り を {元|もと} に {戻|もど}す || Set the curtains and the flap back as they were. -> reset
* {考|かんが}えて みる || Think it over. -> hint
* {離|はな}れる || Step back. -> end
:strike
!hook fw_act f5 strike
!end
:weave
!hook fw_open f5 alcove
!end
:reset
!hook fw_reset f5
!end
:hint
!hook fw_hint f5

@scene fw.f5.mL
!hook fw_look f5 mL
!if puzzle.f5=done -> end
!choice
* [puzzle.f5.mL=open] {幕|まく} を {下|お}ろす || Let the curtain down. -> t
* [puzzle.f5.mL=drawn] {幕|まく} を {巻|ま}き{上|あ}げる || Roll the curtain up. -> t
* {離|はな}れる || Step back. -> end
:t
!hook fw_act f5 mL_toggle

@scene fw.f5.mR
!hook fw_look f5 mR
!if puzzle.f5=done -> end
!choice
* [puzzle.f5.mR=open] {幕|まく} を {下|お}ろす || Let the curtain down. -> t
* [puzzle.f5.mR=drawn] {幕|まく} を {巻|ま}き{上|あ}げる || Roll the curtain up. -> t
* {離|はな}れる || Step back. -> end
:t
!hook fw_act f5 mR_toggle

@scene fw.f5.B
!hook fw_look f5 B
!if puzzle.f5=done -> end
!choice
* {仕切|しき}り を {反対|はんたい} に {倒|たお}す || Flip the flap over. -> t
* {離|はな}れる || Step back. -> end
:t
!hook fw_act f5 B_toggle

@scene fw.f5.display
!hook fw_look f5 display

@scene fw.f5.diagram
!hook fw_look f5 diagram

@scene fw.f5_fumi
!faceplayer fw_fumi
?(!lf_bell_rung&!post) fw_fumi: かしこまりました 。 …… ええ 、 かしこまりました 。 || Certainly. …Yes, certainly.
?(!lf_bell_rung&!post) narr: フミ さん は {微笑|ほほえ}んで 、 また {本|ほん} に {目|め} を {落|お}とした 。 {何|なに} か {言|い}いたそう に も {見|み}えた 。 || Fumi smiles and looks back down at her book. She seemed to have something else to say.
?(lf_bell_rung|post) fw_fumi[smile]: {毎日|まいにち} 、 {昼|ひる} から ここ で {読|よ}む の 。 {鐘|かね} の {音|おと} は {好|す}き よ 。 でも {本|ほん} の {途中|とちゅう} に {鳴|な}る と 、 どこ まで {読|よ}んだ か {忘|わす}れて しまう の 。 || I read here every afternoon. I like the chime. But when it rings in the middle of a page, I lose my place.
?(puzzle.f5=done) fw_fumi: この {頃|ごろ} は 、 {鐘|かね} は {向|む}こう の {花|はな} だけ を {鳴|な}らす 。 {静|しず}か で 、 いい わ 。 || These days the chime rings only the flower over there. It's quiet. I like it.

@scene fw.f6.box
!hook fw_look f6 box
!if puzzle.f6=done -> end
!choice
* {札|ふだ} を {綴|つづ}り に {入|い}れる …… || File the slips in the folders… -> file
* [weave] {言葉|ことば} を {織|お}る …… || Weave a word on it… -> weave
* [puzzle.f6.s1!=loose|puzzle.f6.s2!=loose|puzzle.f6.s3!=loose] {札|ふだ} を {全部|ぜんぶ} {盆|ぼん} に {戻|もど}す || Take all the slips back out onto the tray. -> reset
* {考|かんが}えて みる || Think it over. -> hint
* {離|はな}れる || Step back. -> end
:file
!hook fw_arrange f6
!end
:weave
!hook fw_open f6 box
!end
:reset
!hook fw_reset f6
!end
:hint
!hook fw_hint f6

@scene fw.f6.slips
!hook fw_look f6 slips
!if puzzle.f6=done -> end
!choice
* [puzzle.f6.marks=hidden] {薄紙|うすがみ} を {当|あ}てて 、 {炭|すみ} で こする || Lay thin paper over them and rub with the charcoal. -> rub
* {札|ふだ} を {綴|つづ}り に {入|い}れる …… || File the slips in the folders… -> file
* [weave] {言葉|ことば} を {織|お}る …… || Weave a word on them… -> weave
* {離|はな}れる || Step back. -> end
:rub
!hook fw_act f6 rub
!end
:file
!hook fw_arrange f6
!end
:weave
!hook fw_open f6 slips

@scene fw.f6_oyone
!faceplayer sa_oyone
sa_oyone: {索引|さくいん} を {見|み}て {上|のぼ}って いく {人|ひと} が 、 また {増|ふ}えた よ 。 {札|ふだ} が {迷子|まいご} に なる と 、 {人|ひと} も {迷子|まいご} に なる から ね 。 || More folk are reading the index before they go up again. When the slips go astray, people do too.

@scene fw.f1_tomo
!faceplayer tomo
tomo[smile]: {倉|くら} の {脇|わき} の {衝|つい}{立|たて} 、 {留|と}めて くれた の ね 。 {夜中|よなか} まで ばたばた {揺|ゆ}れて いて 、 {気|き} に なって いた の 。 || You fastened the screen by the warehouse, didn't you. It flapped about half the night; it had been bothering me.
tomo: {棚|たな} の {舟|ふね} は 、 {子|こ}ども たち が {書|か}き{損|そこ}ない の {紙|かみ} で {折|お}った もの よ 。 {乾|かわ}いた {所|ところ} に {置|お}いて おかない と 、 すぐ {沈|しず}む ん です って 。 || The boats on that shelf are the children's, folded from spoiled paper. They say if you don't keep them somewhere dry, they sink straight away.
`, 'discovery/scenes');
