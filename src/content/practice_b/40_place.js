/* The correspondence furniture for practice suite B (Practice addendum §17.1, §18.1):
 * the post box in Shino's Post House, Cinder Orchard (map co.post, prop 'mailbox' at
 * tile 7,5). It had no interaction of its own and carries no quest. A visitor reaches it
 * from the floor tiles around it (6,5 facing right; 7,4 facing down; 7,6 facing up).
 * Haimi has fast travel ('cinder'), so it stays reachable after the journey's end.
 *
 * The scene offers the practice letters after the journey's end (post) and the
 * proofreader's tray from the resolution of Chapter 2 (ch2_done); the activity starts
 * once the scene has ended (RB.practiceB.launchAfterScene via !hook pb_open). */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  const m = C.maps && C.maps['co.post'];
  if (m) {
    const box = (m.props || []).find((p) => p.p === 'mailbox' && p.x === 7 && p.y === 5);
    if (box && !box.scene && !box.text) box.scene = 'pb.postbox';
  }
  RB.script.add(`
@scene pb.postbox
narr: {郵便|ゆうびん} の {箱|はこ} 。 {横|よこ} の {棚|たな} に 、 {練習|れんしゅう} {用|よう} の {便箋|びんせん} と 、 {校正|こうせい} の {盆|ぼん} が {置|お}いて ある 。 || The post box. On the shelf beside it: practice letter paper, and a proofreader's tray.
?(!post&!ch2_done) narr: {今|いま} は 、 {使|つか}う {用事|ようじ} が ない 。 || There is nothing for you to use here yet.
!choice
* [post] {手紙|てがみ} の {返事|へんじ} を {書|か}く || Answer the villagers' letters -> letters
* [ch2_done] {校正|こうせい} の {盆|ぼん} を {見|み}る || Look at the proofreader's tray -> proof
* {今|いま} は いい || Not now -> end
:letters
!hook pb_open letters
!end
:proof
!hook pb_open proofreading
!end
`, 'practice_b/40_place');
})(RB.content);
