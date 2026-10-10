/* The Cloudroad, Chapter 10: the companion (expansion P12; plan R2 and 14_COMPANIONS.md). Two bond events within the
 * existing Bond table (RB.company.award through !hook co_bond, once a journey each):
 *   cr:surety  the reunion at the Mist Barrier, after the companion stayed as surety (every companion: cr.barrier_back);
 *   cr:night   Nao's night apart ended on Kirishita's porch, the answer given to Sakichi's face (cr.porch_nao).
 * Nao's night is also a kept memory (!hook co_remember together cr_porch, in the scene's last lines), with Nao's own
 * words for What We Keep. Twelve-chapter journeys only: the scenes are in Chapter 10. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  const CC = C.company;
  CC.bondEvents = Object.assign(CC.bondEvents || {}, { 'cr:surety': 1, 'cr:night': 1 });
  CC.mem.cr_porch = {
    kind: 'together', title: T('{霧下|きりした} の {縁側|えんがわ}', 'The porch at Kirishita'), place: T('{雲路|くもじ}', 'The Cloudroad'),
    text: T('{霧下|きりした} の {縁側|えんがわ} で 、 {夜|よる} の {沢|さわ} の {音|おと} を {聞|き}いた 。', 'On the porch at Kirishita you listened to the stream at night.'),
    texts: {
      nao: T('{霧下|きりした} の {縁側|えんがわ} 。 ナオ は {最後|さいご} の {区間|くかん} を {一人|ひとり} で {走|はし}り 、 {答|こた}え を サキチ さん の {顔|かお} を {見|み}て {言|い}った 。 {沢|さわ} で カジカ が {鳴|な}いて いた 。', 'The porch at Kirishita. Nao ran the last leg alone and gave Sakichi their answer face to face. Kajika frogs sang in the stream.'),
    },
    keep: {
      nao: T('{霧下|きりした} の {縁側|えんがわ} 。 {手紙|てがみ} に {隠|かく}れず に 、 {顔|かお} を {見|み}て {言|い}えた {夜|よる} だ 。 …… {宛先|あてさき} の こと は 、 まだ {考|かんが}えて いる 。', 'The porch at Kirishita. The night I said it to his face instead of hiding in a letter. …I\'m still thinking about the forwarding address.'),
    },
  };
})(RB.content);
