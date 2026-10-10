/* The Keepers' Road's records (expansion P10; 09_RECORDS.md K1; R8): the chapter stamp and the "everyone helped" stamp,
 * pressed at the road's one stand by the lodge, and the three lantern shrines' seals (The Pilgrim's Stamp Book), pressed
 * as soon as each is earned (no stand: they are the road's own stamps). Twelve-chapter journeys only. The chapter's
 * travel-volume pages (the stone-lantern road at dusk, the vigil's ninety-nine wicks and one shadow, the lodge relit)
 * are illustrated sequences: art work for P16 under AC-1 (F-39's rule). */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  C.stamps = C.stamps || {};
  C.stampStands = C.stampStands || {};
  C.stampStands.keepers = { map: 'kr.lodge', x: 24, y: 21, title: T('the Keepers\' Road', '{灯守|ひもり} の {道|みち}') };
  const sidesDone = (s) => {
    const qs = Object.keys(C.quests).filter((id) => C.quests[id].chapter === 'kr' && !C.quests[id].main);
    return qs.length > 0 && qs.every((id) => (C.questOnly && C.questOnly[id] && !RB.state.test(s, C.questOnly[id])) || (s.quests[id] && s.quests[id].done));
  };
  C.stamps['ch.kr'] = { id: 'ch.kr', family: 'chapter', chapter: 'kr', title: T('The Keepers\' Road', '{灯守|ひもり} の {道|みち}'),
    criteria: T('Chapter 7: the main story.', '{第|だい}7{章|しょう}'), hidden: true, when: 'ed>=2&kr_done', stand: 'keepers',
    design: { shape: 'round', motif: 'lantern', ink: '#3e4a2e' } };
  C.stamps['side.kr'] = { id: 'side.kr', family: 'region', chapter: 'kr', title: T('The Keepers\' Road: everyone helped', '{灯守|ひもり} の {道|みち} の {頼|たの}み'),
    criteria: T('Every side story in Chapter 7 that your journey could have.', '{第|だい}7{章|しょう} の {寄|よ}り{道|みち}'), hidden: true,
    when: (s) => RB.edition.of(s) >= 2 && sidesDone(s), stand: 'keepers', design: { shape: 'square', motif: 'path', ink: '#3e4a2e' } };
  const shrine = (n, en, jp) => (C.stamps['kr.shrine' + n] = { id: 'kr.shrine' + n, family: 'milestone', chapter: 'kr', title: T(en, jp),
    criteria: T('A lantern shrine on the Keepers\' Road.', '{灯守|ひもり} の {道|みち} の {祠|ほこら}'), hidden: true, when: 'ed>=2&kr_seal_' + n,
    design: { shape: 'round', motif: n === 3 ? 'leaf' : n === 2 ? 'stairs' : 'lantern', ink: '#a8462e' } });
  shrine(1, 'The shrine at the foot of the road', '{麓|ふもと} の {祠|ほこら}');
  shrine(2, 'The shrine above the cedar steps', '{石段|いしだん} の {祠|ほこら}');
  shrine(3, 'The fox shrine at the bridge', '{狐|きつね} の {祠|ほこら}');
  const m = C.maps['kr.lodge'];
  m.props = (m.props || []).concat([{ p: 'rb_stampstand', x: 24, y: 21, scene: 'rb.stand', o: { stand: 'keepers' }, if: 'ed>=2' }]);
})(RB.content);
