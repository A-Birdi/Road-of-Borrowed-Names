// RBN-QA-119 (Agnes 6345669438, 6345974122): after the quarrel on the bridge says "steam has gone from the river", the
// lower town's river still steamed. Now its two river plumes go at that line and come back when the Kettle settles:
//  1. the plumes standing on the river are exactly the two at (29, 6) and (28, 22), and only they carry the condition;
//     the land vents and every other map's steam are as they were;
//  2. the condition, state by state: before the quarrel, shown; the quarrel begun (yn_quarrel set as the scene opens)
//     and the boil line, still shown; from the "gone" line (yn_river_cold), hidden; a save past the quarrel's end
//     without the new flag (yn_quarrel and stage 4 or 5), hidden; a save between the line and stage 4 without it stays
//     as it was (shown: ambiguous, nothing inferred); once the Kettle is settled, shown again, at any stage after;
//  3. in the scene, the flag is set after the boil line and just before the "gone" line;
//  4. nothing in the scene or the condition changes quest state.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content;
  const m = C.maps['yn.lower'];
  const water = (mp, p) => '~w'.includes((mp.terrain[p.y] || '')[p.x]);
  // 1. which plumes
  const river = m.props.filter((p) => p.p === 'yn_steam' && water(m, p));
  t.ok(river.length === 2 && river.every((p) => (p.x === 29 && p.y === 6) || (p.x === 28 && p.y === 22)), 'the lower town\'s river plumes: (29, 6) and (28, 22)');
  const cond = river[0] && river[0].if;
  t.ok(cond && river.every((p) => p.if === cond), 'both carry the same condition: ' + cond);
  const others = [];
  for (const [id, mp] of Object.entries(C.maps)) for (const p of mp.props || []) if (p.p === 'yn_steam' && p.if === cond && !(id === 'yn.lower' && river.includes(p))) others.push(id + ' (' + p.x + ',' + p.y + ')');
  t.ok(!others.length, 'no other steam carries it (land vents, baths, the Vents, other maps)' + (others.length ? ': ' + others.join(' ') : ''));
  const land = m.props.filter((p) => p.p === 'yn_steam' && !water(m, p));
  t.ok(land.length === 4 && land.filter((p) => !p.if).length === 3, 'the lower town\'s land vents as they were (three always, the spring\'s with its own condition)');
  // 2. state by state
  const st = (flags, stage) => {
    const s = RB.state.newCampaign({ difficulty: 'normal' });
    Object.assign(s.flags, flags);
    if (stage != null) s.quests.yn_main = { stage, done: stage === 'done', t: 1 };
    if (stage === 'done') s.quests.yn_main.stage = 7;
    return s;
  };
  const shown = (s) => RB.state.test(s, cond);
  const CASES = [
    ['before the quarrel (stage 3)', st({ yn_rooms_done: true, yn_shimo_heard: true }, 3), true],
    ['the quarrel begun, the boil line (yn_quarrel, stage 3)', st({ yn_quarrel: true }, 3), true],
    ['from the "gone" line (yn_river_cold, stage 3)', st({ yn_quarrel: true, yn_river_cold: true }, 3), false],
    ['after the scene (stage 4)', st({ yn_quarrel: true, yn_river_cold: true }, 4), false],
    ['an older save past the quarrel, no new flag (stage 4)', st({ yn_quarrel: true }, 4), false],
    ['an older save, the Vents (stage 5)', st({ yn_quarrel: true }, 5), false],
    ['an older save between the line and stage 4 (ambiguous: as it was)', st({ yn_quarrel: true }, 3), true],
    ['the Kettle settled (stage 6)', st({ yn_quarrel: true, yn_river_cold: true, yn_kettle_settled: true }, 6), true],
    ['the Kettle settled, an older save (stage 6)', st({ yn_quarrel: true, yn_kettle_settled: true }, 6), true],
    ['the Kettle failed once and retried: not yet settled (stage 5)', st({ yn_quarrel: true, yn_river_cold: true }, 5), false],
    ['the chapter done', st({ yn_quarrel: true, yn_river_cold: true, yn_kettle_settled: true, yn_done: true }, 'done'), true],
    ['a journey that never reached Steamhollow', st({}, null), true],
  ];
  const bad = CASES.filter(([, s, want]) => shown(s) !== want).map(([n]) => n);
  t.ok(!bad.length, 'shown or hidden as each state should be (' + CASES.length + ' states)' + (bad.length ? ': wrong for ' + bad.join('; ') : ''));
  // 3. in the scene
  const cmds = (C.scenes['yn.bridge_quarrel'] || {}).cmds || [];
  const at = (pred) => cmds.findIndex(pred);
  const said = (c, re) => c.op === 'say' && re.test(String(c.jp || ''));
  const order = {
    boil: at((c) => said(c, /噴/)),
    setAt: at((c) => c.op === 'set' && (c.args || []).includes('yn_river_cold')),
    gone: at((c) => said(c, /消/)),
  };
  t.ok(order.boil >= 0 && order.setAt > order.boil && order.gone === order.setAt + 1, 'in the scene: after the boil line, just before the "gone" line ' + JSON.stringify(order));
  // 4. no quest state touched by the condition
  const s = st({ yn_quarrel: true }, 4);
  const before = JSON.stringify(s.quests);
  shown(s);
  t.ok(JSON.stringify(s.quests) === before, 'testing the condition changes nothing');
};
