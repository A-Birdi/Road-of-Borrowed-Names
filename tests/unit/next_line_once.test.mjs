// The Journey's "Next" box says one destination once (found in Robin's screenshot of 2026-10-09, U00 inventory):
// a step whose guidance targets lead to the same scene on the same map (a person and the doorway strip in front of
// them) gets one line, naming the person. Different scenes or places stay separate lines, and no destination is
// dropped. The nudges follow the same rule.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, G = RB.questGuide;

  // ---- Robin's case: "go deeper into the archive" ----
  // (RBN-QA-069: until the catalogue is done the inner door is locked, and the step names the floor in front of it, one
  // target; the Tide Clerk and the strip before them are its targets once the door is open, so that is this case)
  const s0 = RB.state.newCampaign({ profile: 'E' });
  s0.chapter = 2;
  Object.assign(s0.flags, { departed: true, ch1_done: true, rw_echo_done: true, sg_arrived: true });
  s0.quests.sg_main = { stage: 8, done: false, t: 1 };
  const N0 = G.nudges('sg_main', s0);
  t.ok(N0.result.targets.length === 1 && N0.result.targets[0].map === 'sg.da_entry', 'before the catalogue: one target, in the Receiving Hall before the inner door: ' + JSON.stringify(N0.result.targets.map((x) => x.map + '@' + x.x + ',' + x.y)));
  const s = RB.state.newCampaign({ profile: 'E' });
  s.chapter = 2;
  Object.assign(s.flags, { departed: true, ch1_done: true, rw_echo_done: true, sg_arrived: true, sg_da_catalog: true });
  s.quests.sg_main = { stage: 8, done: false, t: 1 };
  const N = G.nudges('sg_main', s);
  t.eq(N.result.targets.length, 2, 'the step has two guidance targets (the Tide Clerk and the strip before them)');
  const lines = G.nextLines(N.result);
  t.eq(lines.length, 1, 'one "Next" line: ' + JSON.stringify(lines.map((l) => l.en)));
  t.ok(/Tide Clerk/.test(lines[0].en), 'the line names the person: ' + lines[0].en);
  t.eq(N.lines[0].length, 1, 'the first nudge says where once');

  // ---- every step of every quest: each destination once, none lost ----
  const scenes = (x) => (x.opts || []).map((o) => o && o.scene).filter(Boolean);
  let steps = 0, merged = 0;
  for (const qid in C.quests) {
    C.quests[qid].stages.forEach((stg, k) => {
      const st = RB.state.newCampaign({ profile: 'E' });
      st.quests[qid] = { stage: k, done: false, t: 1 };
      const r = G.analyse(qid, st);
      if (!r.targets || !r.targets.length) return;
      steps++;
      // destinations: targets grouped when they share a map and a scene
      const groups = [];
      for (const x of r.targets) {
        const g = groups.find((gr) => gr.some((y) => y.map === x.map && scenes(y).some((sc) => scenes(x).includes(sc))));
        if (g) g.push(x); else groups.push([x]);
      }
      const n = G.nextLines(r).length;
      if (n < r.targets.length) merged++;
      t.ok(n === groups.length, qid + '[' + k + ']: ' + n + ' lines for ' + groups.length + ' destinations (' + r.targets.length + ' targets)');
    });
  }
  t.ok(steps > 50, 'steps with targets checked: ' + steps);
  t.ok(merged >= 1, 'at least one step merges targets that share a destination: ' + merged);
};
