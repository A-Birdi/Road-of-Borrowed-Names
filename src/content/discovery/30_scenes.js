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
* [puzzle.f1.screen=swing&!puzzle.f1.held] {衝立|ついたて} を {柱|はしら} に {寄|よ}せて {閉|し}める || Swing the screen shut against its post. -> close
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
* {留|と}め{具|ぐ} で {衝立|ついたて} の {端|はし} を {挟|はさ}む || Close the clamp on the screen's edge. -> clamp
* [weave] {言葉|ことば} を {織|お}る …… || Weave a word on it… -> weave
* そのまま に する || Leave it. -> end
:clamp
!hook fw_act f1 clamp
!end
:weave
!hook fw_open f1 clamp
!end

@scene fw.f1_tomo
!faceplayer tomo
tomo[smile]: {倉|くら} の {脇|わき} の {衝立|ついたて} 、 {留|と}めて くれた の ね 。 {夜中|よなか} まで ばたばた {揺|ゆ}れて いて 、 {気|き} に なって いた の 。 || You fastened the screen by the warehouse, didn't you. It flapped about half the night; it had been bothering me.
tomo: {棚|たな} の {舟|ふね} は 、 {子|こ}ども たち が {書|か}き{損|そこ}ない の {紙|かみ} で {折|お}った もの よ 。 {乾|かわ}いた {所|ところ} に {置|お}いて おかない と 、 すぐ {沈|しず}む ん です って 。 || The boats on that shelf are the children's, folded from spoiled paper. They say if you don't keep them somewhere dry, they sink straight away.
`, 'discovery/scenes');
