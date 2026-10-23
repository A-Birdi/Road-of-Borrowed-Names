// RBN-QA-134 (Agnes 6353888589, 6354377552, 6354879437; Local CL-234, CL-235, CL-237): the lantern in the shallows
// (cr.lw_lf_lamps_open) ends "Tell Nagi, and there'll be one more shade to write", and Nagi never said anything of it.
// Now she does, once, wherever she is: one line at the head of her one talk list (L.talk), after the lantern's own scene,
// or after the lit lantern's (cr.lw_lf_lamps_after), which now gives the note too: a journey saved while the lantern's
// scene was still going recovers when the lit lantern is looked at again. No quest, item or flag. In node:
//  1. her placements (the avenue, the gardens, the Records Hall) share one talk list, and the line is at its head;
//  2. what she says first: before the lantern, as before; after it, the line; once heard, as before again; after the
//     ending, the line still comes first; an old save holding the note and the lantern seen, the line;
//  3. a journey saved while the lantern's scene was going (the lantern lit, the scene unseen), with the note not yet
//     given or given during its toast: not the line on load; the lit lantern looked at (its scene run by the real runner)
//     gives the note once, the line follows, once; looking again gives no second note or toast; after a completed
//     lantern, looking at the lit one changes nothing of hers;
//  4. at a routine slot it is said after the slot's own first line (not taken for talk from before the routine);
//  5. the scene: one line of hers that names Lower Town Street, nothing given or set; the lantern's scene as it was; the
//     lit lantern's line as it was, then the note.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, SC = 'cr.lw_lf_nagi_lower', OPEN = 'cr.lw_lf_lamps_open', AFTER = 'cr.lw_lf_lamps_after', NOTE = 'lw_lf_lower_town';
  const COND = 'seen.' + OPEN + '&!seen.' + SC + '|seen.' + AFTER + '&!seen.' + SC;
  // ---- 1.
  const all = Object.entries(C.maps).flatMap(([m, d]) => (d.npcs || []).filter((n) => n.id === 'lf_nagi' || n.char === 'lf_nagi').map((n) => [m, n]));
  const base = all.find(([m, n]) => m === 'lf.town' && n.id === 'lf_nagi')[1];
  t.ok(all.length === 3 && all.every(([, n]) => n.talk === base.talk), 'her three placements share one talk list (' + all.map(([m]) => m).join(', ') + ')');
  t.eq([base.talk[0].scene, base.talk[0].if], [SC, COND], 'the line is at its head, once, after the lantern\'s scene or the lit lantern\'s (the guard in both terms)');
  // ---- 2.
  const st = (o) => ({ flags: Object.assign({ ch5_done: true, cr_done: true }, o.flags || {}), seen: o.seen || {}, vars: {}, quests: {}, inv: {}, notebook: o.notes || [], comp: null });
  const first = (s) => { const o = base.talk.find((x) => !x.if || RB.state.test(s, x.if)); return o && o.scene; };
  const before = first(st({}));
  t.ok(before && before !== SC, 'before the lantern: what she said before (' + before + ')');
  t.eq(first(st({ seen: { [OPEN]: true } })), SC, 'after the lantern: the line');
  t.eq(first(st({ seen: { [OPEN]: true, [SC]: true } })), before, 'once heard: what she said before');
  t.eq(first(st({ seen: { [OPEN]: true, [AFTER]: true, [SC]: true } })), before, 'once heard, with the lit lantern looked at too: what she said before');
  t.eq(first(st({ flags: { postgame: true }, seen: { [OPEN]: true } })), SC, 'after the ending: the line still comes first');
  t.eq(first(st({ seen: { [OPEN]: true }, notes: [{ id: NOTE, kind: 'lore' }] })), SC, 'an old save holding the note, the lantern seen: the line');
  // ---- 3. the real runner on the lit lantern's scene
  let toasts = 0;
  RB.ui.dialogue.say = async () => {};
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => { toasts++; };
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  const journey = (o) => {
    const s = RB.state.newCampaign({ edition: 2 });
    s.id = 'qa134'; s.map = 'lf.sluice'; s.comp = null;
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true }, o.flags || {});
    Object.assign(s.seen, o.seen || {});
    if (o.note) s.notebook.push({ kind: 'lore', id: NOTE, t: 1 });
    RB.game.G.s = s;
    return s;
  };
  const notes = (s) => s.notebook.filter((e) => e.id === NOTE).length;
  for (const [tag, o] of [['saved before its note', { flags: { lw_lf_lamps_lit: true } }], ['saved during its note\'s toast', { flags: { lw_lf_lamps_lit: true }, note: true }]]) {
    const s = journey(o);
    const onLoad = first(s);
    toasts = 0;
    await RB.script.run(AFTER);
    const one = { notes: notes(s), toasts, seen: !!s.seen[AFTER], line: first(s) };
    await RB.script.run(AFTER);
    const two = { notes: notes(s), toasts, line: first(s) };
    s.seen[SC] = true;
    t.ok(onLoad !== SC && one.notes === 1 && one.toasts === (o.note ? 0 : 1) && one.seen && one.line === SC && two.notes === 1 && two.toasts === one.toasts && two.line === SC && first(s) !== SC,
      'the lantern\'s scene ' + tag + ': not the line on load (' + onLoad + '); the lit lantern looked at gives the note once (' + JSON.stringify(one) + '), again nothing more (' + JSON.stringify(two) + '); her line, then not again');
  }
  {
    const s = journey({ flags: { lw_lf_lamps_lit: true }, seen: { [OPEN]: true }, note: true });
    s.seen[SC] = true;
    const was = first(s);
    toasts = 0;
    await RB.script.run(AFTER);
    t.ok(notes(s) === 1 && toasts === 0 && first(s) === was && was !== SC, 'after a completed lantern and her line, looking at the lit lantern gives nothing and she says what she said before (' + was + ')');
  }
  // ---- 4.
  const s4 = st({ seen: { [OPEN]: true } });
  t.ok(RB.town.pastTalk(s4, 'lf_nagi', base.talk[0]) === false, 'at the gardens and the Records Hall it is said after the slot\'s own line, not taken for talk from before the routine');
  // ---- 5.
  const cmds = C.scenes[SC].cmds, says = cmds.filter((c) => c.op === 'say');
  t.ok(says.length === 1 && says[0].who === 'lf_nagi' && /下町/.test(says[0].jp) && /Lower Town Street/.test(says[0].en) && !cmds.some((c) => ['set', 'give', 'quest', 'note', 'unset', 'travel'].includes(c.op)), 'one line of hers naming Lower Town Street; nothing given or set (' + says.map((c) => c.en).join(' / ') + ')');
  const lamp = C.scenes[OPEN].cmds;
  t.ok(lamp[lamp.length - 1].op === 'note' && lamp[lamp.length - 1].args[0] === NOTE && lamp.some((c) => c.op === 'say' && /Tell Nagi/.test(c.en || '')), 'the lantern\'s scene as it was: its invitation, then the note');
  const lit = C.scenes[AFTER].cmds;
  t.ok(lit.length === 2 && lit[0].op === 'say' && /Lower Town Street/.test(lit[0].en) && lit[1].op === 'note' && lit[1].args[0] === NOTE, 'the lit lantern\'s line as it was, then the note');
};
