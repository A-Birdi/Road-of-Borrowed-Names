/* Manybridge's records (expansion P08; 09_RECORDS.md K1): its chapter stamp and its region stamp ("everyone helped"),
 * pressed at a stand a few steps from where the ferry passengers come up into the city (free ground, cutting off
 * nothing: tests/unit/records). Twelve-chapter journeys only. The chapter's travel-volume pages (the arrival under the
 * bridges, the Exchange in uproar, the Nameless Bridge given its name) are illustrated sequences: art work for P16
 * under AC-1 (F-39). A page counts as witnessed from the scene it shows, so a journey played before the art exists
 * keeps its pages. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  C.stamps = C.stamps || {};
  C.stampStands = C.stampStands || {};
  C.stampStands.manybridge = { map: 'mb.exchange', x: 25, y: 40, title: T('Manybridge', '{八百橋|やおばし}') };
  // every side story of the chapter this journey could have, finished
  const sidesDone = (s) => {
    const qs = Object.keys(C.quests).filter((id) => C.quests[id].chapter === 'mb1' && !C.quests[id].main);
    return qs.length > 0 && qs.every((id) => (C.questOnly && C.questOnly[id] && !RB.state.test(s, C.questOnly[id])) || (s.quests[id] && s.quests[id].done));
  };
  C.stamps['ch.mb1'] = { id: 'ch.mb1', family: 'chapter', chapter: 'mb1', title: T('Eight Hundred Bridges', '{八百|はっぴゃく} の {橋|はし}'),
    criteria: T('Chapter 3: the main story.', '{第|だい}3{章|しょう}'), hidden: true, when: 'ed>=2&mb1_done', stand: 'manybridge',
    design: { shape: 'round', motif: 'plaque', ink: '#2c3e6a' } };
  C.stamps['side.mb1'] = { id: 'side.mb1', family: 'region', chapter: 'mb1', title: T('Manybridge: everyone helped', '{八百橋|やおばし} の {頼|たの}み'),
    criteria: T('Every side story in Chapter 3 that your journey could have.', '{第|だい}3{章|しょう} の {寄|よ}り{道|みち}'), hidden: true,
    when: (s) => RB.edition.of(s) >= 2 && sidesDone(s), stand: 'manybridge', design: { shape: 'square', motif: 'plaque', ink: '#2c3e6a' } };
  const m = C.maps['mb.exchange'];
  m.props = (m.props || []).concat([{ p: 'rb_stampstand', x: 25, y: 40, scene: 'rb.stand', o: { stand: 'manybridge' }, if: 'ed>=2' }]);
})(RB.content);
