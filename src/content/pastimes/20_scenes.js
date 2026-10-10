/* The pastimes' places (K7: "place games start at their place"): Fuku's bench above Saltglass harbour, where she and
 * Isamu used to play (canon: sg.fuku_idle, sg.bench_fuku). In a twelve-chapter journey, once her nameplate is home,
 * she comes down and offers a game; the board opens after the scene (src/ui/88_shogi.js, hook pt_play). */
var RB = (globalThis.RB = globalThis.RB || {});
(function () {
  'use strict';
  RB.script.add(`
@scene pt.fuku_bench
narr: {家|いえ} の {方|ほう} から 、 フク さん が {降|お}りて くる 。 || Fuku comes down the path from her house.
!walkto fuku 41 9 left
!look fuku pc
fuku: その {歩|ふ} 、 イサム さん と {指|さ}して いた {頃|ころ} の {忘|わす}れ{物|もの} な の 。 || That pawn was left behind from when Isamu and I used to play.
fuku: {相手|あいて} が いない と 、 {駒|こま} が {寂|さび}しがる わ 。 {一局|いっきょく} 、 どう ？ {初|はじ}めて なら 、 {教|おし}えて あげる 。 || The pieces get lonely with no one to play. A game? If it's your first time, I'll teach you.
!choice
* {お願|ねが}い します 。 || Yes, please. -> play
* {今|いま} は いい です 。 || Not just now. -> later
:play
fuku: じゃあ 、 {駒|こま} を {並|なら}べましょう 。 || Then let's set out the pieces.
!hook pt_play shogi fuku
!end
:later
fuku: いつ でも どうぞ 。 {私|わたし} は たいてい {家|いえ} に いる から 。 || Any time. I'm usually at home.
`, 'pastimes/20_scenes.js');
})();
