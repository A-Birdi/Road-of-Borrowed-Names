// No story foe uses a move before the player can answer it (spec §7: "Bosses
// should test combinations of ideas already introduced, with new mechanics
// taught safely"; docs/AGENT_COMMON.md: "Use only words the player can know
// by then").
//
// KNOWN_AT records, for every story foe, the inscription words the player is
// guaranteed to have at its EARLIEST possible encounter, with the evidence.
// A new foe must be added here (the test fails otherwise). The gates that
// make the table true are checked below as well.
import { load } from '../lib/load.mjs';

import { CH2, SLUICE, CH5, CH6, KNOWN_AT } from '../lib/story_words.mjs';

// answered by a built-in response (See through, Answer) or nothing to answer
const BUILT_IN = new Set(['lie', 'plea', 'mirror', 'rest']);

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, L = RB.combatLogic;
  const kinds = (e) => new Set([...(e.pattern || ['strike', 'rest']), ...(e.phases || []).flatMap((p) => p.pattern)].map((k) => k.split(':')[0]));
  const answerable = (kind, words) => BUILT_IN.has(kind) || words.some((w) => (C.words[w].tags || []).some((tg) => L.INTENTS[kind].counters.indexOf(tg) >= 0));

  for (const id of Object.keys(C.enemies).filter((x) => !x.startsWith('atlas.'))) {
    const known = KNOWN_AT[id];
    t.ok(!!known, id + ' is in the fairness table (add it with the words known at its first encounter)');
    if (!known) continue;
    for (const k of kinds(C.enemies[id])) t.ok(answerable(k, known), `${id}: its ${L.INTENTS[k].label} can be answered with what is known by then (${known.join(', ')})`);
  }
  // the Unwritten Atlas opens after the ending: every word is known there
  for (const id of Object.keys(C.enemies).filter((x) => x.startsWith('atlas.'))) {
    for (const k of kinds(C.enemies[id])) t.ok(answerable(k, CH6), `${id}: ${k} is answerable in the Atlas`);
  }

  // ---- groups: every creature a placement brings (on Standard or Demanding) can be
  // answered with what is known where it is met — the lead's point in the story ----
  const groups = [];
  for (const [mid, m] of Object.entries(C.maps)) {
    for (const f of m.foes || []) {
      if (!f.group) continue;
      const known = KNOWN_AT[f.enemy];
      for (const gid of [...(f.group.normal || []), ...(f.group.hard || [])]) {
        groups.push(mid + ' ' + f.id + ': ' + gid);
        t.ok(!!C.enemies[gid], mid + ' ' + f.id + ' group: ' + gid + ' exists');
        if (!C.enemies[gid] || !known) continue;
        for (const k of kinds(C.enemies[gid])) t.ok(answerable(k, known), `${mid} ${f.id}: its group's ${gid} can use ${L.INTENTS[k].label}, answerable with what is known there (${known.join(', ')})`);
        // and no group creature is met earlier in the story than its own first encounter
        t.ok(KNOWN_AT[gid] && KNOWN_AT[gid].every((w) => known.indexOf(w) >= 0), mid + ' ' + f.id + ': ' + gid + ' is not brought before its own point in the story');
      }
    }
  }
  // groups appear only in the final stretch of the last chapter (and in the Atlas, generated)
  const where = new Set(groups.map((g) => g.split(' ')[0]));
  t.eq([...where].sort(), ['sa.conduits', 'sa.stacks'], 'story groups are authored only for the Stacks and the Conduits: ' + [...where].join(', '));
  // the Atlas generator's groups use the regular Atlas creatures (all answerable after the ending)
  t.ok(!!(RB.atlas && RB.atlas.plan), 'the Atlas generator is loaded');
  if (RB.atlas && RB.atlas.plan) {
    const s0 = RB.state.newCampaign({});
    for (let seed = 1; seed <= 12; seed++) {
      const run = RB.atlas.newRun(s0, [], { seed });
      const P = RB.atlas.plan(run);
      t.ok(P.rooms.x && P.rooms.x.attendants && P.rooms.x.attendants.normal.length === 1 && P.rooms.x.attendants.hard.length === 2, 'Atlas run ' + seed + ': the guardian brings one attendant on Standard, two on Demanding');
      for (const d of Object.values(P.rooms)) {
        for (const g of [d.guard && d.guard.group, ...d.foes.map((f) => f.group), d.attendants].filter(Boolean)) {
          for (const gid of [...(g.normal || []), ...(g.hard || [])]) {
            t.ok(C.atlas.regular.indexOf(gid) >= 0, 'Atlas run ' + seed + ' room ' + d.key + ': group creature ' + gid + ' is a regular Atlas creature');
            t.ok((g.normal || []).length <= 1 && (g.hard || []).length <= 2, 'Atlas run ' + seed + ' room ' + d.key + ': at most one more on Standard and two on Demanding');
          }
        }
      }
    }
  }

  // ---- the gates the table relies on --------------------------------------------------------
  const ops = (sc) => (C.scenes[sc] ? C.scenes[sc].cmds : []);
  const idx = (sc, pred) => ops(sc).findIndex(pred);
  t.ok(idx('rw.m1_gears', (c) => c.op === 'word' && c.args[0] === 'mizu') >= 0, 'みず is learned when the mill gears turn (rw.m1_gears)');
  const w = idx('rw.m1_boss', (c) => c.op === 'word' && c.args[0] === 'mizu');
  const b = idx('rw.m1_boss', (c) => c.op === 'battle' && c.args[0] === 'rw.mill_echo');
  t.ok(w >= 0 && b > w, 'the Echo scene makes sure みず is known before the fight (older saves past the gears)');
  t.ok(!(C.enemies['rw.mill_echo'].reward && (C.enemies['rw.mill_echo'].reward.words || []).includes('mizu')), 'みず is no longer only a reward for beating the Echo');
  const foeIf = (map, fid) => ((C.maps[map].foes || []).find((f) => f.id === fid) || {}).if || '';
  t.ok(/word\.nawa/.test(foeIf('sg.da_sluice', 'm2')), 'the sluice moth on the near bank waits for なわ');
  for (const fid of ['m1', 'g1']) t.ok((C.maps['sg.da_sluice'].foes.find((f) => f.id === fid) || {}).y < 8, 'sg.da_sluice ' + fid + ' is on the far bank (after the raft)');
  t.ok(/word\.suzu/.test(foeIf('lf.stacks', 'st2')), 'the stacks blot (Hush) waits for すず or こえ');
  const s = RB.state.newCampaign({});
  s.words = [...CH2];
  t.ok(!RB.state.test(s, foeIf('sg.da_sluice', 'm2')), 'the sluice moth is absent before なわ');
  s.words = [...SLUICE];
  t.ok(RB.state.test(s, foeIf('sg.da_sluice', 'm2')), 'the sluice moth appears once なわ is known');
  s.words = [...CH5];
  t.ok(!RB.state.test(s, foeIf('lf.stacks', 'st2')), 'the stacks blot is absent before すず');
  s.words.push('suzu');
  t.ok(RB.state.test(s, foeIf('lf.stacks', 'st2')), 'the stacks blot appears once すず is known');
  for (const [cid, fid] of [['co.upper', 'm1'], ['co.upper', 'm2']]) {
    const f = C.maps[cid].foes.find((x) => x.id === fid);
    t.ok(f && f.y < 22, cid + ' ' + fid + ' (Gust) is above the ridge that いし opens (y 22)');
  }
  t.ok((C.maps['sb.hamlet'].exits || []).some((e) => e.to === 'sb.obs_path' && /sb_stair_open/.test(e.if || '')), 'the Star Stair (chill foes) opens only with sb_stair_open');
};
