/* Steamhollow's records (expansion P13g; 09_RECORDS.md K1): the chapter stamp and the "everyone helped" stamp, pressed at
 * the valley's stand by the town footbath; two of the valley's own, pressed as soon as they are earned: both inns' house
 * rules read, and the spring agreement that keeps the disagreement honest. Twelve-chapter journeys only. The chapter's
 * travel-volume pages (the steaming valley at dusk, the private bath with the companion, the settled spring) are
 * illustrated sequences: art work for P16 under AC-1 (F-39's rule). */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  C.stamps = C.stamps || {};
  C.stampStands = C.stampStands || {};
  C.stampStands.steamhollow = { map: 'yn.upper', x: 27, y: 19, title: T('Steamhollow', '{湯|ゆ}ノ{谷|たに}') };
  const sidesDone = (s) => {
    const qs = Object.keys(C.quests).filter((id) => C.quests[id].chapter === 'yn' && !C.quests[id].main);
    return qs.length > 0 && qs.every((id) => (C.questOnly && C.questOnly[id] && !RB.state.test(s, C.questOnly[id])) || (s.quests[id] && s.quests[id].done));
  };
  C.stamps['ch.yn'] = { id: 'ch.yn', family: 'chapter', chapter: 'yn', title: T('Steamhollow', '{湯|ゆ}ノ{谷|たに}'),
    criteria: T('Chapter 11: the main story.', '{第|だい}11{章|しょう}'), hidden: true, when: 'ed>=2&yn_done', stand: 'steamhollow',
    design: { shape: 'round', motif: 'steam', ink: '#8a3a2e' } };
  C.stamps['side.yn'] = { id: 'side.yn', family: 'region', chapter: 'yn', title: T('Steamhollow: everyone helped', '{湯|ゆ}ノ{谷|たに} の {頼|たの}み'),
    criteria: T('Every side story in Chapter 11 that your journey could have.', '{第|だい}11{章|しょう} の {寄|よ}り{道|みち}'), hidden: true,
    when: (s) => RB.edition.of(s) >= 2 && sidesDone(s), stand: 'steamhollow', design: { shape: 'square', motif: 'path', ink: '#8a3a2e' } };
  C.stamps['yn.rules'] = { id: 'yn.rules', family: 'milestone', chapter: 'yn', title: T('House rules', '{宿|やど} の {決|き}まり'),
    criteria: T('Both inns\' house rules read, and understood as different.', '{上|かみ}の{湯|ゆ} と {下|しも}の{湯|ゆ}'), hidden: true,
    when: 'ed>=2&yn_rules_kami&yn_rules_shimo', design: { shape: 'square', motif: 'plaque', ink: '#4a5e8e' } };
  C.stamps['yn.agreement'] = { id: 'yn.agreement', family: 'milestone', chapter: 'yn', title: T('Agreeing to differ', '{違|ちが}う まま {決|き}める'),
    criteria: T('The spring agreement written with the disagreement kept, and a bath for the newcomers.', '{湯|ゆ} の {取|と}り{決|き}め'), hidden: true,
    when: 'ed>=2&yn_med_together', design: { shape: 'round', motif: 'scroll', ink: '#a8822e' } };
  const m = C.maps['yn.upper'];
  m.props = (m.props || []).concat([{ p: 'rb_stampstand', x: 27, y: 19, scene: 'rb.stand', o: { stand: 'steamhollow' }, if: 'ed>=2' }]);
})(RB.content);
