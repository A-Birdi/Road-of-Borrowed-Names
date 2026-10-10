// The combat rules' recorded results (expansion P04, "all existing combat results before feature activation"):
// every story and Atlas creature, alone and in every authored group, at every setting, alone and with each
// companion, by both player models of RB.combatSim, with one slip in four. Each case's whole round-by-round trace
// is hashed, so any change to what the rules do, in any battle, changes a hash.
//
//   node tools/combat_golden.mjs           write tests/fixtures/combat_golden.json
//   node tools/combat_golden.mjs --check   compare with it; exit 1 and name the cases that differ
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { load } from '../tests/lib/load.mjs';
import { KNOWN_AT, CH6 } from '../tests/lib/story_words.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'tests', 'fixtures', 'combat_golden.json');

export function cases(RB) {
  const C = RB.content, L = RB.combatLogic, Sim = RB.combatSim;
  const CHAPTER = { rw: 1, sg: 2, co: 3, sb: 4, lf: 5, sa: 6, atlas: 7 };
  const unlocks = (ch) => {
    const flags = {}, quests = {};
    if (ch >= 3) flags.ch2_done = true;
    if (ch >= 4) quests.co_suzu = { done: true, stage: 9 };
    if (ch >= 5) quests.ren_ushio = { done: true, stage: 9 };
    if (ch >= 6) { quests.lf_nao = { done: true, stage: 9 }; quests.lf_mio = { done: true, stage: 9 }; }
    if (ch >= 7) { flags.lq_ally1 = true; flags.lq_ally2 = true; }
    return { flags, quests };
  };
  const out = {};
  const run = (key, lead, o) => {
    const trace = [];
    const r = Sim.run(lead, Object.assign({ trace }, o));
    const sum = [r.win ? 'win' : r.lose ? 'lose' : 'stall', r.rounds, r.lost, r.minPc, r.minComp, r.techs, JSON.stringify(r.acts)].join(' ');
    out[key] = sum + ' ' + crypto.createHash('sha256').update(trace.join('\n')).digest('hex').slice(0, 16);
  };
  for (const diff of ['relaxed', 'normal', 'hard']) {
    for (const comp of [null, 'nao', 'mio', 'ren', 'suzu']) {
      for (const policy of ['smart', 'unravel']) {
        for (const id of Object.keys(C.enemies).sort()) {
          const pre = id.split('.')[0], ch = CHAPTER[pre];
          const words = pre === 'atlas' ? CH6 : KNOWN_AT[id];
          if (!ch || !words) continue;
          run([diff, comp || 'alone', policy, id].join('|'), id, Object.assign({ difficulty: diff, comp, words, policy, slips: 4 }, unlocks(ch)));
        }
        for (const [mid, m] of Object.entries(C.maps).sort()) {
          for (const f of m.foes || []) {
            if (!f.group) continue;
            const ids = L.groupFor(f.enemy, f, diff);
            run([diff, comp || 'alone', policy, 'group', mid, f.id].join('|'), f.enemy, Object.assign({ difficulty: diff, comp, words: CH6, policy, slips: 4, group: ids.slice(1) }, unlocks(6)));
          }
        }
      }
    }
  }
  return out;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const t0 = Date.now();
  const now = cases(RB);
  const n = Object.keys(now).length;
  if (process.argv.includes('--check')) {
    const was = JSON.parse(fs.readFileSync(OUT, 'utf8')).cases;
    const diff = Object.keys(Object.assign({}, was, now)).filter((k) => was[k] !== now[k]);
    for (const k of diff.slice(0, 40)) console.log('DIFFERS ' + k + '\n  was ' + was[k] + '\n  now ' + now[k]);
    console.log(n + ' cases, ' + diff.length + ' differ (' + ((Date.now() - t0) / 1000).toFixed(1) + ' s)');
    process.exit(diff.length ? 1 : 0);
  }
  fs.writeFileSync(OUT, JSON.stringify({ note: 'Written by tools/combat_golden.mjs from the combat rules as they stood before the expansion\'s encounter platform (P04); re-recorded once when the player model moved onto the shared exchange (src/engine/97_encounter.js): every result identical in all 1,710, every round identical except the final winning round of 102, where the old player model let the companion act after the last knot came free (the screen never did). Each value: result, rounds, resolve lost, lowest resolve (you, companion), techniques, companion actions, and a hash of the round-by-round trace.', cases: now }, null, 0).replace(/","/g, '",\n"') + '\n');
  console.log('wrote ' + n + ' cases (' + ((Date.now() - t0) / 1000).toFixed(1) + ' s)');
}
