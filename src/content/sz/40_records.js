/* The sea's and the ports' records (expansion P11b–d; 09_RECORDS.md K1): a stand at Sazanami for the hamlet's
 * "everyone helped"; the licence, the five ports reached by sea and East Landing rebuilt, pressed at Saltglass's
 * stand; the island reached in your own boat, at the island's. The voyages themselves are the travel log's (the
 * Records' volume). Twelve-chapter journeys only. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  C.stamps = C.stamps || {};
  C.stampStands = C.stampStands || {};
  C.stampStands.sazanami = { map: 'sz.hamlet', x: 38, y: 12, title: T('Sazanami', '{漣|さざなみ}') };
  const done = (s, ids) => ids.every((id) => s.quests[id] && s.quests[id].done);
  const PORTS = ['saltglass', 'manybridge', 'kotonoha', 'sazanami', 'eastlanding'];
  C.stamps['side.sz'] = { id: 'side.sz', family: 'region', chapter: 'ko', title: T('Sazanami: everyone helped', '{漣|さざなみ} の {頼|たの}み'),
    criteria: T('Every side story at the fishing hamlet up the coast.', '{漁村|ぎょそん} の {寄|よ}り{道|みち}'), hidden: true,
    when: (s) => RB.edition.of(s) >= 2 && done(s, ['sz_market', 'sz_nets', 'sz_school']), stand: 'sazanami', design: { shape: 'square', motif: 'path', ink: '#2e5a6a' } };
  C.stamps['sea.licence'] = { id: 'sea.licence', family: 'milestone', chapter: 'ko', title: T('A licence for the open sea', '{外海|そとうみ} の {免状|めんじょう}'),
    criteria: T('The harbourmaster\'s licence, and a boat of your own.', '{港長|こうちょう} の {免状|めんじょう}'), hidden: true, when: 'ed>=2&sea_boat', stand: 'saltglass',
    design: { shape: 'round', motif: 'wave', ink: '#2c5a8a' } };
  C.stamps['sea.ports'] = { id: 'sea.ports', family: 'milestone', chapter: 'ko', title: T('Every port by sea', '{全|すべ}て の {港|みなと} へ'),
    criteria: T('Five ports, each reached in your own boat.', '{五|いつ}つ の {港|みなと}'), hidden: true,
    when: (s) => RB.edition.of(s) >= 2 && PORTS.every((p) => s.flags['sea_port_' + p]), stand: 'saltglass', design: { shape: 'square', motif: 'wave', ink: '#2c5a8a' } };
  C.stamps['el.rebuilt'] = { id: 'el.rebuilt', family: 'milestone', chapter: 'ko', title: T('East Landing rebuilt', '{東|ひがし} の {渡|わた}し{場|ば}'),
    criteria: T('The old landing open to boats again.', '{渡|わた}し{場|ば} の {鐘|かね}'), hidden: true, when: 'ed>=2&el_done', stand: 'saltglass',
    design: { shape: 'round', motif: 'bell', ink: '#8a5a2a' } };
  C.stamps['sea.voyage'] = { id: 'sea.voyage', family: 'milestone', chapter: 'ko', title: T('The island in your own boat', '{自分|じぶん} の {船|ふね} で'),
    criteria: T('The harbourmaster\'s rumour followed all the way.', '{噂|うわさ} の {島|しま} へ'), hidden: true, when: 'ed>=2&quest.sea_licence=done', stand: 'kotonoha',
    design: { shape: 'round', motif: 'leaf', ink: '#2c5a8a' } };
  const m = C.maps['sz.hamlet'];
  m.props = (m.props || []).concat([{ p: 'rb_stampstand', x: 38, y: 12, scene: 'rb.stand', o: { stand: 'sazanami' }, if: 'ed>=2' }]);
})(RB.content);
