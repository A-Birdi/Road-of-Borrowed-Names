// P18 Plan B (Robin's C-89): the narration that depends on the Japanese level, selected by the game's own condition
// test (RB.state.test, with the Hall's terms) at every level, with the Hall's Grow route on and off. The lines are
// enumerated from the compiled scenes, not counted by hand: every `say` whose condition reads the level (prof…).
// A line's variants are the level-conditioned lines next to it in its scene with the same speaker and the same other
// terms (a Hall pattern, a flag…); each set of variants, in a state where those other terms hold, must be shown
// exactly once at every level and Grow setting (no level sees two variants or none), or be an extra line for one end
// only (Foundations only, or Advanced only: a help line, an older wording). A self-test first proves the check reports
// two variants shown together, a level that sees none, and a line no level sees.
// Rendering of these lines in the dialogue at the required sizes is tests/e2e/profile_narration.mjs.
import { load } from '../lib/load.mjs';
import { narration } from '../lib/narration.mjs';

export default async (t) => {
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const { analyse, kindOf } = narration(RB);

  // ---- self-test ----------------------------------------------------------------------------------------------------
  {
    const say = (cond, jp) => ({ op: 'say', who: 'narr', if: cond, jp, en: jp });
    const good = analyse({ x: [say('prof=F', 'f'), say('prof=E', 'e'), say('prof>=I', 'i')] });
    t.ok(good.sets.length === 1 && kindOf(good.sets[0]) === 'complete' && !good.overlaps.length, 'self-test: three variants that cover every level are one complete set');
    const both = analyse({ x: [say('prof=F', 'f'), say('prof<=E', 'e'), say('prof>=I', 'i')] });
    t.ok(both.overlaps.length === 1, 'self-test: two variants shown together at Foundations are reported');
    const gap = analyse({ x: [say('prof=F', 'f'), say('prof=E', 'e'), say('prof=A', 'a')] });
    t.ok(gap.sets.some((st) => /^gap/.test(kindOf(st))), 'self-test: a level that sees no variant is reported');
    const none = analyse({ x: [say('prof=F&prof=A', 'x')] });
    t.ok(none.never.length === 1, 'self-test: a line no level sees is reported');
    const grow = analyse({ x: [say('prof=F&!hall.w1.route=grow', 'f'), say('prof=E&!hall.w1.route=grow|prof=F&hall.w1.route=grow', 'e'), say('prof=I&!hall.w1.route=grow|prof=E&hall.w1.route=grow', 'i'), say('prof=A|prof=I&hall.w1.route=grow', 'a')] });
    t.ok(grow.sets.length === 1 && kindOf(grow.sets[0]) === 'complete', 'self-test: the Hall\'s Grow route lifts each level by one and the set stays complete');
  }

  // ---- the game's scenes --------------------------------------------------------------------------------------------
  const scenes = {};
  for (const id in RB.content.scenes) scenes[id] = RB.content.scenes[id].cmds || [];
  const r = analyse(scenes);
  const kinds = {};
  for (const st of r.sets) { const k = kindOf(st); kinds[k] = (kinds[k] || 0) + st.lines.length; }
  const sceneCount = new Set(r.sets.map((st) => st.scene)).size;
  t.log('level-dependent narration: ' + r.lines + ' lines in ' + sceneCount + ' scenes; ' + r.sets.length + ' sets of variants: ' + JSON.stringify(kinds));
  const families = {};
  for (const st of r.sets) { const f = st.scene.replace(/^(hall\.w\d+|[a-z]+)\..*$/, '$1'); families[f] = (families[f] || 0) + st.lines.length; }
  t.log('by place: ' + JSON.stringify(families));
  for (const st of r.sets.filter((x) => kindOf(x) !== 'complete')) t.log('  ' + kindOf(st) + ': ' + st.scene + ' line ' + st.at + ' (' + st.lines.map((l) => l.if).join(' / ') + ')');
  t.ok(r.lines > 0 && r.sets.length > 0, 'the scenes have level-dependent narration (' + r.lines + ' lines)');
  t.eq(r.never, [], 'every level-dependent line is seen at some level');
  t.eq(r.overlaps, [], 'no level sees two variants of one line');
  t.eq(r.sets.filter((st) => /^gap/.test(kindOf(st))).map((st) => st.scene + ' line ' + st.at + ': ' + kindOf(st)), [], 'every set of variants is seen once at every level and Grow setting, or is an extra for Foundations only or Advanced only');
};
