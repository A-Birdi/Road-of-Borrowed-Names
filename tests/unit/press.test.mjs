// The press (expansion P09; plan C15, W10, C-24; src/engine/72p_press.js, content src/content/mp/30_press.js):
// bounded blocks, any combination printable, reactions only from the blocks' tags (3–5 per version, the specific
// first, fallbacks only to reach three), revisions replace reactions, a reaction heard once, readers only once met,
// typesetting pieces rebuild the printed line exactly, and nothing for a six-chapter journey.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const P = RB.press, C = RB.content;
  t.ok(P && C.press, 'the press and its content are loaded');
  t.eq(P.check(), [], 'the content is consistent (every slot offers a block from the start; readers wait only for real tags)');

  const camp = (flags) => { const s = RB.state.newCampaign({}); s.edition = 2; Object.assign(s.flags, { mb_arrived: true, mb_ichi_found: true, mb_ev_letter: true }, flags || {}); RB.game.s = s; return s; };
  const s = camp();
  // every slot of both kinds offers blocks; unlocks wait for the journey
  for (const k of ['story', 'notice']) for (const slot of P.kind(k).slots) t.ok(P.offered(s, slot).length >= 2, k + ' › ' + slot + ': at least two blocks from the start');
  const actor = P.block('s_actor');
  t.ok(!P.offered(s, 'who').some((b) => b.id === 's_actor'), 'the actor waits for the playhouse');
  s.flags.mp_theatre_seen = true;
  t.ok(P.offered(s, 'who').some((b) => b.id === 's_actor') && actor.tags.includes('actor'), 'and is offered once it has been seen');

  // typesetting pieces put the printed line back together exactly
  let bad = [];
  for (const slot in C.press.blocks) for (const b of C.press.blocks[slot]) if ((b.pieces || []).join(' ').replace(/\s+/g, ' ') !== b.jp.replace(/\s+/g, ' ')) bad.push(b.id);
  t.eq(bad, [], 'every block\'s pieces rebuild its sentence exactly');

  // any combination prints; incomplete ones do not
  const story = { kind: 'story', blocks: { who: 's_cat', where: 's_canal', want: 's_soba', trouble: 's_wallet', turn: 's_laugh', end: 's_mayor' } };
  t.ok(P.complete(s, story), 'an absurd story is complete');
  t.ok(!P.complete(s, { kind: 'story', blocks: { who: 's_cat' } }), 'a half-made one is not');
  t.ok(P.circulate(s, { kind: 'story', blocks: { who: 's_cat' } }, 'board') === null && !s.practice.press, 'nothing is printed or recorded from an incomplete page');

  // reactions: from tags only; 3–5; the specific first
  const rec = P.circulate(s, story, 'stall');
  t.ok(rec && rec.version === 1 && rec.tags.includes('cat') && rec.tags.includes('funny') && rec.tags.includes('kind:story'), 'printed: version 1, its tags from its blocks');
  const ids = Object.keys(rec.rx);
  t.ok(ids.length >= P.MIN_RX && ids.length <= P.MAX_RX, 'between three and five readers (' + ids.length + ')');
  t.ok(rec.rx.mb_masa === 0, 'given out at the stall, the stall-keeper says so first (her most specific rule)');
  for (const id of ids) t.ok(s.flags['press_rx_' + id], id + ': waiting to be heard');
  // a reader not yet met reads nothing: Yoshi waits for the dead-letter office
  const s2 = camp({ mb_ev_letter: false });
  const rec2 = P.circulate(s2, { kind: 'story', blocks: { who: 's_courier', where: 's_canal', want: 's_letter', trouble: 's_storm', turn: 's_back', end: 's_home' } }, 'board');
  t.ok(!('mb_yoshi' in rec2.rx), 'a reader the journey has not met reads nothing');
  const s3 = camp();
  const rec3 = P.circulate(s3, { kind: 'story', blocks: { who: 's_courier', where: 's_canal', want: 's_letter', trouble: 's_storm', turn: 's_back', end: 's_home' } }, 'board');
  t.ok(rec3.rx.mb_yoshi === 0, 'once met, she reads a story about a letter as one about a letter');
  t.ok(Object.values(rec3.rx).length >= 3, 'and a story touching several readers reaches several');

  // heard once; a revision replaces what was waiting
  const w = P.hear(s, ids[0]);
  t.ok(w && w.rule && w.rule.jp && !s.flags['press_rx_' + ids[0]], 'heard: the reader\'s line, then taken off');
  t.ok(P.hear(s, ids[0]) === null, 'and not heard twice');
  const notice = { kind: 'notice', blocks: { what: 'n_festival', when: 'n_evening', place: 'n_bank', ask: 'n_keepback' } };
  const rec4 = P.circulate(s, notice, 'board');
  t.ok(rec4.version === 2 && rec4.kind === 'notice' && s.flags.press_notice, 'a revision: version 2, a notice');
  t.ok(rec4.rx.mb_kansuke === 1, 'the boatman reads a festival notice as one');
  t.ok(ids.filter((id) => !(id in rec4.rx)).every((id) => !s.flags['press_rx_' + id]), 'the old version\'s waiting reactions are taken off');
  // a reaction never comments on language: the rules are about content (no rule waits on a language tag)
  t.ok(C.press.readers.every((r) => r.rules.every((ru) => ru.when.every((x) => !/lang|grammar|mistake/.test(x)))), 'no reader reacts to the language');
  // each reader's talk waits on their flag, first; every reader is someone who exists
  for (const r of C.press.readers) {
    const n = (C.maps[r.map].npcs || []).filter((x) => x.id === r.npc);
    t.ok(n.length && n.every((x) => x.talk[0].if === 'press_rx_' + r.id && x.talk[0].scene === 'mp.rx_' + r.id) && C.scenes['mp.rx_' + r.id] && C.chars[r.npc], r.id + ': a talk option waiting on the reaction, a scene, a person');
  }
  // the six-chapter game never meets the press: its flags are set only by printing, in a twelve-chapter journey
  const six = RB.state.newCampaign({});
  t.eq(RB.edition.of(six), 1, 'a new campaign without the switch is a six-chapter journey');
  RB.game.s = six;
  t.ok(!RB.activity.eligible('press', {}).ok, 'the press is not offered outside a twelve-chapter journey');
};
