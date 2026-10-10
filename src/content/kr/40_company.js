/* The Keepers' Road, Chapter 7: the companion (expansion P10; plan R8 and the companion beats of 08_COMPANIONS.md).
 * Two bond events within the existing Bond table (RB.company.award through !hook co_bond, once a journey each):
 *   kr:makeup  the quarrel at Hisae's lamp made up (Nao, Mio or Suzu: kr.makeup);
 *   kr:night   Ren's night apart ended at the Ridge Light, the lamp they never reached as an apprentice (kr.ren_lantern).
 * Ren's night is also a kept memory (!hook co_remember together kr_ridge), with Ren's own words for What We Keep; it
 * never touches Ren's personal quest (pq_ren), which keeps its own place first in What We Keep. Twelve-chapter
 * journeys only: the scenes are in Chapter 7. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  const CC = C.company;
  CC.bondEvents = Object.assign(CC.bondEvents || {}, { 'kr:makeup': 1, 'kr:night': 1 });
  CC.mem.kr_ridge = {
    kind: 'together', title: T('{尾根|おね} の {灯|ひ}', 'The Ridge Light'), place: T('{灯守|ひもり} の {道|みち}', 'The Keepers\' Road'),
    text: T('{尾根|おね} の {灯|ひ} を 、 {一緒|いっしょ} に {点|つ}けた 。', 'You lit the Ridge Light together.'),
    texts: {
      ren: T('{尾根|おね} の {暗|くら}い {灯籠|とうろう} の {前|まえ} で 、 レン と {名前|なまえ} を {呼|よ}んだ 。 {見習|みなら}い の {頃|ころ} に {着|つ}けなかった {灯|ひ} に 、 {何十年|なんじゅうねん} ぶり に {灯|ひ} が ともった 。', 'Before the dark lantern on the ridge, you and Ren called its name. The lamp Ren never reached as an apprentice caught, for the first time in decades.'),
    },
    keep: {
      ren: T('{尾根|おね} の {灯|ひ} 。 {見習|みなら}い の {頃|ころ} に {着|つ}けなかった {灯|ひ} を 、 あなた と {点|つ}けた {夜|よる} です 。 ヒサエ さん へ の {答|こた}え は 、 まだ {持|も}って います 。', 'The Ridge Light. The night I lit the lamp I never reached as an apprentice, with you. I still have my answer for Hisae.'),
    },
  };
})(RB.content);
