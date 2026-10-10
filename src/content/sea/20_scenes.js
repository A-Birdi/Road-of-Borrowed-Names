/* The sea's scenes (expansion P11c; src/engine/72v_sail.js): the boat at her mooring (the chart, the cabin, the yard's
 * mending), bringing her into a port, the crew taking over, and the cabin below deck. The voyage's situations are in
 * 21_situations.js. The boat's name is `$boat {丸|まる}` (its kana, and 丸 with its reading). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene sea.boat
# The boat at her mooring in any port she can reach: where next, below to the cabin, or the yard's mending.
narr: $boat {丸|まる} が 、 {桟橋|さんばし} に {繋|つな}いで ある 。 || The $boat lies at her mooring.
?(sea_dmg) narr: {直|なお}す ところ が {一|ひと}つ ある 。 {港|みなと} の {人|ひと} に {頼|たの}めば 、 すぐ {直|なお}る 。 || There's one thing to mend. The harbour's people would see to it in no time.
!choice
* {海図|かいず} を {広|ひろ}げる 。 || Open the chart. -> chart
* {船室|せんしつ} へ {下|お}りる 。 || Go below to the cabin. -> cabin
* [sea_dmg] {港|みなと} の {人|ひと} に {直|なお}して もらう 。 || Have the harbour's people mend her. -> mend
* {今|いま} は いい 。 || Not now. -> end
:chart
!hook sail_chart
!end
:cabin
!hook sail_cabin
!end
:mend
narr: {港|みなと} の {人|ひと} が {手早|てばや}く {直|なお}して くれた 。 「いい {船|ふね} だ 。 {大事|だいじ} に しな 。」 || The harbour's people see to it quickly. "She's a good boat. Look after her."
!hook sail_mend

# ---- bringing her in --------------------------------------------------------------------------------------------------
@scene sea.dock_saltglass
?(var.sea_to=saltglass) narr: {潮硝子|しおがらす} の {港|みなと} が {見|み}えて きた 。 || Saltglass harbour, dead ahead.
?(!var.sea_to=saltglass) narr: {潮硝子|しおがらす} の {港|みなと} の {前|まえ} を {通|とお}る 。 ここ に {寄|よ}る ？ || You're passing Saltglass harbour. Put in here?
!choice
* {港|みなと} に {入|はい}る 。 || Bring her in. -> in
* このまま {進|すす}む 。 || Sail on. -> end
:in
!hook sail_dock
@scene sea.dock_manybridge
?(var.sea_to=manybridge) narr: {川口|かわぐち} の {向|む}こう に 、 {八百橋|やおばし} の {橋|はし} が {並|なら}んで いる 。 || Beyond the river mouth, Manybridge's bridges stand in a row.
?(!var.sea_to=manybridge) narr: {八百橋|やおばし} の {川口|かわぐち} の {前|まえ} を {通|とお}る 。 ここ に {寄|よ}る ？ || You're passing the river mouth below Manybridge. Put in here?
!choice
* {港|みなと} に {入|はい}る 。 || Bring her in. -> in
* このまま {進|すす}む 。 || Sail on. -> end
:in
!hook sail_dock
@scene sea.dock_kotonoha
?(var.sea_to=kotonoha) narr: {大|おお}きな {木|き} の {島|しま} 。 {東|ひがし} の {桟橋|さんばし} が {見|み}えて きた 。 || The island of the great tree. Its east jetty comes into sight.
?(!var.sea_to=kotonoha) narr: {言|こと}の{葉|は}{島|じま} の {桟橋|さんばし} の {前|まえ} を {通|とお}る 。 ここ に {寄|よ}る ？ || You're passing Kotonoha's jetty. Put in here?
!choice
* {桟橋|さんばし} に {着|つ}ける 。 || Bring her in. -> in
* このまま {進|すす}む 。 || Sail on. -> end
:in
!hook sail_dock

# ---- the crew ---------------------------------------------------------------------------------------------------------
@scene sea.crew_take
# "Let the crew sail" at sea: they take the tiller; anything still to happen on the voyage still happens.
narr: {乗組員|のりくみいん} に {舵|かじ} を {任|まか}せた 。 「{任|まか}せて ください 。 {風|かぜ} は {読|よ}めて ます から 。」 || You hand the tiller to the crew. "Leave her to us. We've got the wind's measure."
!hook sail_crew
@scene sea.crew_arrive
narr: {乗組員|のりくみいん} が {帆|ほ} を {下|お}ろし 、 {船|ふね} を {静|しず}か に {着|つ}けた 。 || The crew lowers the sail and brings her gently alongside.

# ---- the cabin --------------------------------------------------------------------------------------------------------
@scene sea.cabin_shelf
!gesture pc observe
narr: {旅|たび} の {記念品|きねんひん} を {並|なら}べる {棚|たな} 。 || A shelf for the journey's keepsakes.
!hook sail_open keepsakes
@scene sea.cabin_volume
!gesture pc read
narr: {小|ちい}さな {机|つくえ} に 、 {旅|たび} の {本|ほん} が {開|ひら}いて ある 。 {航海|こうかい} {日誌|にっし} も 、 {一緒|いっしょ} に {綴|と}じて ある 。 || On the little desk, the travel volume lies open, with the voyages' log bound in.
!hook sail_open volume
@scene sea.cabin_corner
narr: {将棋盤|しょうぎばん} 、 かるた 、 {花札|はなふだ} 。 {波|なみ} の {音|おと} を {聞|き}きながら 、 {一局|いっきょく} どう ？ || A shogi board, karuta, hanafuda. A game, with the waves for company?
!hook sail_open distractions
@scene sea.cabin_bunk
narr: {狭|せま}い {寝台|しんだい} 。 {波|なみ} が 、 {揺|ゆ}り{籠|かご} の よう に {揺|ゆ}らす 。 || A narrow bunk. The waves rock it like a cradle.
!heal
!checkpoint
narr: よく {眠|ねむ}れた 。 || You slept well.
@scene sea.cabin_up
!hook sail_ashore
`);
