/* Kotonoha's records (expansion P11f; 09_RECORDS.md K1): the chapter stamp and the "everyone helped" stamp, pressed at
 * the island's stand on the shore above the jetty; two of the island's own, pressed as soon as they are earned: every leaf
 * sent home, and the exhibition hung. Twelve-chapter journeys only. The chapter's travel-volume pages (the first sight
 * of the great tree, the leaves rising on the night wind, the exhibition of tellings, and after the ending the deepest
 * grove) are illustrated sequences: art work for P16 under AC-1 (F-39's rule). */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  C.stamps = C.stamps || {};
  C.stampStands = C.stampStands || {};
  C.stampStands.kotonoha = { map: 'ko.shore', x: 23, y: 12, title: T('Kotonoha', '{言|こと}の{葉|は}{島|じま}') };
  const sidesDone = (s) => {
    const qs = Object.keys(C.quests).filter((id) => C.quests[id].chapter === 'ko' && !C.quests[id].main);
    return qs.length > 0 && qs.every((id) => (C.questOnly && C.questOnly[id] && !RB.state.test(s, C.questOnly[id])) || (s.quests[id] && s.quests[id].done));
  };
  C.stamps['ch.ko'] = { id: 'ch.ko', family: 'chapter', chapter: 'ko', title: T('Kotonoha', '{言|こと}の{葉|は}{島|じま}'),
    criteria: T('Chapter 9: the main story.', '{第|だい}9{章|しょう}'), hidden: true, when: 'ed>=2&ko_done', stand: 'kotonoha',
    design: { shape: 'round', motif: 'leaf', ink: '#2e5a52' } };
  C.stamps['side.ko'] = { id: 'side.ko', family: 'region', chapter: 'ko', title: T('Kotonoha: everyone helped', '{言|こと}の{葉|は}{島|じま} の {頼|たの}み'),
    criteria: T('Every side story in Chapter 9 that your journey could have.', '{第|だい}9{章|しょう} の {寄|よ}り{道|みち}'), hidden: true,
    when: (s) => RB.edition.of(s) >= 2 && sidesDone(s), stand: 'kotonoha', design: { shape: 'square', motif: 'path', ink: '#2e5a52' } };
  C.stamps['ko.leaves'] = { id: 'ko.leaves', family: 'milestone', chapter: 'ko', title: T('Every leaf home', '{葉|は} を {全部|ぜんぶ} {返|かえ}した'),
    criteria: T('All eight drifted leaves sent home from the Wind Stone.', '{風石|かぜいし} から {八枚|はちまい}'), hidden: true, when: 'ed>=2&var.ko_ret>=8',
    design: { shape: 'round', motif: 'leaf', ink: '#a8822e' } };
  C.stamps['ko.exhibit'] = { id: 'ko.exhibit', family: 'milestone', chapter: 'ko', title: T('The island\'s legend, hung', '{島|しま} の {言|い}い{伝|つた}え'),
    criteria: T('The keepers\' hall\'s three panels, each with the telling you chose.', '{館|やかた} の {三枚|さんまい} の {板|いた}'), hidden: true, when: 'ed>=2&tell_ko.t_hall_ok',
    design: { shape: 'square', motif: 'scroll', ink: '#a8462e' } };
  const m = C.maps['ko.shore'];
  m.props = (m.props || []).concat([{ p: 'rb_stampstand', x: 23, y: 12, scene: 'rb.stand', o: { stand: 'kotonoha' }, if: 'ed>=2' }]);
})(RB.content);
