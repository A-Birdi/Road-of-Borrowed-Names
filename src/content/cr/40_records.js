/* The Cloudroad's records (expansion P12e; 09_RECORDS.md K1): the chapter stamp and the "everyone helped" stamp,
 * pressed at the road's stand in Oiwake's street; two of the road's own, pressed as soon as they are earned: the Seven
 * Seals' book filled (its stand is the seal book itself, shown in the records), and every station's lamp named and
 * every relay message carried as it was given. Twelve-chapter journeys only. The chapter's travel-volume pages (the
 * cedar avenue in rain, the Mist Barrier at dawn, the cloud sea from the pass) are illustrated sequences: art work for
 * P16 under AC-1 (F-39's rule). */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  C.stamps = C.stamps || {};
  C.stampStands = C.stampStands || {};
  C.stampStands.cloudroad = { map: 'cr.oiwake', x: 20, y: 16, title: T('The Cloudroad', '{雲路|くもじ}') };
  const sidesDone = (s) => {
    const qs = Object.keys(C.quests).filter((id) => C.quests[id].chapter === 'cr' && !C.quests[id].main);
    return qs.length > 0 && qs.every((id) => (C.questOnly && C.questOnly[id] && !RB.state.test(s, C.questOnly[id])) || (s.quests[id] && s.quests[id].done));
  };
  C.stamps['ch.cr'] = { id: 'ch.cr', family: 'chapter', chapter: 'cr', title: T('The Cloudroad', '{雲路|くもじ}'),
    criteria: T('Chapter 10: the main story.', '{第|だい}10{章|しょう}'), hidden: true, when: 'ed>=2&cr_done', stand: 'cloudroad',
    design: { shape: 'round', motif: 'mountain', ink: '#3e5446' } };
  C.stamps['side.cr'] = { id: 'side.cr', family: 'region', chapter: 'cr', title: T('The Cloudroad: everyone helped', '{雲路|くもじ} の {頼|たの}み'),
    criteria: T('Every side story in Chapter 10 that your journey could have.', '{第|だい}10{章|しょう} の {寄|よ}り{道|みち}'), hidden: true,
    when: (s) => RB.edition.of(s) >= 2 && sidesDone(s), stand: 'cloudroad', design: { shape: 'square', motif: 'path', ink: '#3e5446' } };
  C.stamps['cr.seals'] = { id: 'cr.seals', family: 'milestone', chapter: 'cr', title: T('The Seven Seals', '{七|なな}つ の {印|いん}'),
    criteria: T('A seal from every station on the Cloudroad, from Oiwake up to Kumoi.', '{追分|おいわけ} から {雲居|くもい} まで'), hidden: true,
    when: 'ed>=2&cr_seal1&cr_seal2&cr_seal3&cr_seal4&cr_seal5&cr_seal6&cr_seal7', design: { shape: 'square', motif: 'seal', ink: '#a8462e' } };
  C.stamps['cr.relay'] = { id: 'cr.relay', family: 'milestone', chapter: 'cr', title: T('Passed on as given', '{聞|き}いた まま に'),
    criteria: T('Every relay message on the Cloudroad carried with the certainty it was given.', '{継|つ}ぎ{飛脚|びきゃく} の {伝言|でんごん}'), hidden: true,
    when: 'ed>=2&relay_cr_r1_done&relay_cr_r2_done&relay_cr_r3_done&relay_cr_r4_done&relay_cr_r5_done&!cr_r2_crew&!cr_r3_rescue&!cr_r4_ledge&!cr_r5_snow',
    design: { shape: 'round', motif: 'letter', ink: '#a8822e' } };
  const m = C.maps['cr.oiwake'];
  m.props = (m.props || []).concat([{ p: 'rb_stampstand', x: 20, y: 16, scene: 'rb.stand', o: { stand: 'cloudroad' }, if: 'ed>=2' }]);
})(RB.content);
