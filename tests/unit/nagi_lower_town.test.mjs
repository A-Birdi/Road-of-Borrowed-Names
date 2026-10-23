// RBN-QA-134 (Agnes 6353888589; Local CL-234, CL-235): the lantern in the shallows (cr.lw_lf_lamps_open) ends "Tell Nagi,
// and there'll be one more shade to write", and Nagi never said anything of it. Now she does, once, wherever she is: one
// line at the head of her one talk list (L.talk), gated on the lantern's own scene, so a save that already holds its note
// (lw_lf_lower_town) has it too. No quest, item or flag. In node:
//  1. her placements (the avenue, the gardens, the Records Hall) share one talk list, and the line is at its head;
//  2. what she says first: before the lantern, as before; after it, the line; once heard, as before again; after the
//     ending, the line still comes first; an old save holding the note and the lantern seen, the line;
//  3. at a routine slot it is said after the slot's own first line (not taken for talk from before the routine);
//  4. the scene: one line of hers that names Lower Town Street, nothing given or set; the lantern's scene as it was.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, SC = 'cr.lw_lf_nagi_lower';
  // ---- 1.
  const all = Object.entries(C.maps).flatMap(([m, d]) => (d.npcs || []).filter((n) => n.id === 'lf_nagi' || n.char === 'lf_nagi').map((n) => [m, n]));
  const base = all.find(([m, n]) => m === 'lf.town' && n.id === 'lf_nagi')[1];
  t.ok(all.length === 3 && all.every(([, n]) => n.talk === base.talk), 'her three placements share one talk list (' + all.map(([m]) => m).join(', ') + ')');
  t.eq([base.talk[0].scene, base.talk[0].if], [SC, 'seen.cr.lw_lf_lamps_open&!seen.' + SC], 'the line is at its head, once, after the lantern');
  // ---- 2.
  const st = (o) => ({ flags: Object.assign({ ch5_done: true, cr_done: true }, o.flags || {}), seen: o.seen || {}, vars: {}, quests: {}, inv: {}, notebook: o.notes || [], comp: null });
  const first = (s) => { const o = base.talk.find((x) => !x.if || RB.state.test(s, x.if)); return o && o.scene; };
  const before = first(st({}));
  t.ok(before && before !== SC, 'before the lantern: what she said before (' + before + ')');
  t.eq(first(st({ seen: { 'cr.lw_lf_lamps_open': true } })), SC, 'after the lantern: the line');
  t.eq(first(st({ seen: { 'cr.lw_lf_lamps_open': true, [SC]: true } })), before, 'once heard: what she said before');
  t.eq(first(st({ flags: { postgame: true }, seen: { 'cr.lw_lf_lamps_open': true } })), SC, 'after the ending: the line still comes first');
  t.eq(first(st({ seen: { 'cr.lw_lf_lamps_open': true }, notes: [{ id: 'lw_lf_lower_town', kind: 'note' }] })), SC, 'an old save holding the note, the lantern seen: the line');
  // ---- 3.
  const s = st({ seen: { 'cr.lw_lf_lamps_open': true } });
  t.ok(RB.town.pastTalk(s, 'lf_nagi', base.talk[0]) === false, 'at the gardens and the Records Hall it is said after the slot\'s own line, not taken for talk from before the routine');
  // ---- 4.
  const cmds = C.scenes[SC].cmds, says = cmds.filter((c) => c.op === 'say');
  t.ok(says.length === 1 && says[0].who === 'lf_nagi' && /下町/.test(says[0].jp) && /Lower Town Street/.test(says[0].en) && !cmds.some((c) => ['set', 'give', 'quest', 'note', 'unset', 'travel'].includes(c.op)), 'one line of hers naming Lower Town Street; nothing given or set (' + says.map((c) => c.en).join(' / ') + ')');
  const lamp = C.scenes['cr.lw_lf_lamps_open'].cmds;
  t.ok(lamp[lamp.length - 1].op === 'note' && lamp[lamp.length - 1].args[0] === 'lw_lf_lower_town' && lamp.some((c) => c.op === 'say' && /Tell Nagi/.test(c.en || '')), 'the lantern\'s scene as it was: its invitation, then the note');
};
