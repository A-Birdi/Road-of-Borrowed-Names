/* Kotonoha on the mainland (expansion P11; twelve-chapter journeys only). This file runs after every chapter's
 * content, so each person's talk list is final when the island's lines go in.
 *   Leaves back home: once a leaf has gone home through the Wind Stone, someone in the place that lost it notices,
 *   once (the scenes are ko.back_* in src/content/ko/21_scenes_village.js; the ko_ret_* flags are only ever set in
 *   twelve-chapter journeys). The line goes first.
 *   The island's rumour, told several ways (R4; src/content/ko/25_scenes_comp.js): Tetsu's sailors' version at
 *   Saltglass once Manybridge is reached, before Lanternfall is over (it leads into his ferry board as usual); the
 *   playwright Shinobu's at Playhouse Row once her play is her own. Once each. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const person = (mapId, npcId) => { const m = C.maps[mapId]; return m && (m.npcs || []).find((x) => x.id === npcId); };
  const back = (mapId, npcId, k) => {
    const n = person(mapId, npcId);
    if (!n) return;
    const e = { if: 'ko_ret_' + k + '&!seen.ko.back_' + k, scene: 'ko.back_' + k };
    if (typeof n.talk === 'string') n.talk = [e, { scene: n.talk }];
    else n.talk.unshift(e);
  };
  back('rw.tea', 'hana', 'rw'); back('sg.glass', 'asahi', 'sg'); back('mb.exchange', 'mb_take', 'mb'); back('mp.theatre', 'mp_manbe_a', 'mp');
  back('co.terraces', 'co_ume', 'co'); back('sb.post', 'sousuke', 'sb'); back('kr.foot_inn', 'kr_aya', 'kr'); back('lf.council', 'lf_yae', 'lf');

  const tetsu = person('sg.harbor', 'tetsu');
  if (tetsu) {
    const at = tetsu.talk.findIndex((t) => t.scene === 'mb.ferry_tetsu_again');
    if (at >= 0) tetsu.talk.splice(at, 0, { if: 'ed>=2&mb_arrived&!ch5_done&!seen.ko.rumour_tetsu&!post', scene: 'ko.rumour_tetsu' });
  }
  const shinobu = person('mp.tenement', 'mp_shinobu');
  if (shinobu) {
    if (typeof shinobu.talk === 'string') shinobu.talk = [{ scene: shinobu.talk }];
    shinobu.talk.unshift({ if: 'ed>=2&quest.mp_ghost=done&!seen.ko.rumour_shinobu', scene: 'ko.rumour_shinobu' });
  }
})(RB.content);
