/* Kotonoha's leaves, back on the mainland (expansion P11; the scenes are ko.back_* in src/content/ko/21_scenes_village.js):
 * once a leaf has gone home through the Wind Stone, someone in the place that lost it notices, once. Twelve-chapter
 * journeys only (the ko_ret_* flags are only ever set there). This file runs after every chapter's content, so each
 * person's talk list is final and the line goes first. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const back = (mapId, npcId, k) => {
    const m = C.maps[mapId], n = m && (m.npcs || []).find((x) => x.id === npcId);
    if (!n) return;
    const e = { if: 'ko_ret_' + k + '&!seen.ko.back_' + k, scene: 'ko.back_' + k };
    if (typeof n.talk === 'string') n.talk = [e, { scene: n.talk }];
    else n.talk.unshift(e);
  };
  back('rw.tea', 'hana', 'rw'); back('sg.glass', 'asahi', 'sg'); back('mb.exchange', 'mb_take', 'mb'); back('mp.theatre', 'mp_manbe_a', 'mp');
  back('co.terraces', 'co_ume', 'co'); back('sb.post', 'sousuke', 'sb'); back('kr.foot_inn', 'kr_aya', 'kr'); back('lf.council', 'lf_yae', 'lf');
})(RB.content);
