/* Manybridge's second chapter's records (expansion P09; 09_RECORDS.md K1): its chapter stamp and its "everyone helped"
 * stamp, pressed at the city's one stand by the Tally Exchange (src/content/mb/40_records.js): one city, one stand. Twelve-chapter journeys only. The chapter's travel-volume pages (the blank woodblocks, the
 * Understage's roll call, the fireworks over the canals) are illustrated sequences: art work for P16 under AC-1
 * (F-39). A page counts as witnessed from the scene it shows. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  C.stamps = C.stamps || {};
  const sidesDone = (s) => {
    const qs = Object.keys(C.quests).filter((id) => C.quests[id].chapter === 'mb2' && !C.quests[id].main);
    return qs.length > 0 && qs.every((id) => (C.questOnly && C.questOnly[id] && !RB.state.test(s, C.questOnly[id])) || (s.quests[id] && s.quests[id].done));
  };
  C.stamps['ch.mb2'] = { id: 'ch.mb2', family: 'chapter', chapter: 'mb2', title: T('Blockprint and Footlights', '{版木|はんぎ} と {灯|あか}り'),
    criteria: T('Chapter 4: the main story.', '{第|だい}4{章|しょう}'), hidden: true, when: 'ed>=2&mb2_done', stand: 'manybridge',
    design: { shape: 'round', motif: 'firework', ink: '#6a2a3e' } };
  C.stamps['side.mb2'] = { id: 'side.mb2', family: 'region', chapter: 'mb2', title: T('Playhouse Row: everyone helped', '{芝居|しばい} の {通|とお}り の {頼|たの}み'),
    criteria: T('Every side story in Chapter 4 that your journey could have.', '{第|だい}4{章|しょう} の {寄|よ}り{道|みち}'), hidden: true,
    when: (s) => RB.edition.of(s) >= 2 && sidesDone(s), stand: 'manybridge', design: { shape: 'square', motif: 'brush', ink: '#6a2a3e' } };
})(RB.content);
