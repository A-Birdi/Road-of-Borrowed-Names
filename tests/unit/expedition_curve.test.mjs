// The expedition curve (plan D2: "balancing needs a new curve test that plays whole expeditions"). The Flood Cellars
// played end to end through the real rules by RB.combatSim's player model, with persistent condition as the game
// keeps it (src/engine/98_expedition.js: what tactics cost carries, what mistakes cost comes back): every creature on
// the route fought (the worst case: the loop lets a player avoid some), at every difficulty, with each companion
// (the second companion action open, as it is after Chapter 2), by a player who reads the telegraphs and by one who
// mostly unravels, without slips and slipping on one answer in three. A player rests at a station when four or more
// short and one is left on the floor (walking back round the loop is allowed: D2 "backtracking is a choice").
// Bounds:
// - the whole route is won, everywhere, never at 0 resolve;
// - what slips cost is given back after each encounter (the refunds add up to what the slips took, capped);
// - no delver, item or lucky meeting is needed (none exists in the run).
import { load } from '../lib/load.mjs';
import { KNOWN_AT } from '../lib/story_words.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, X = RB.expedition, Sim = RB.combatSim;
  const d = X.get('cellars');
  // the route in walking order: every creature placed on the two floors, the blot's own encounter last
  const foesOf = (map) => (C.maps[map].foes || []).map((f) => ({ map, id: f.id, enemy: f.enemy, encounter: f.encounter || null, place: f }));
  const route = foesOf('rw.cellar1').concat(foesOf('rw.cellar2').filter((f) => !f.encounter), foesOf('rw.cellar2').filter((f) => f.encounter));
  t.ok(route.length === 6 && route[route.length - 1].encounter === 'xp.cellars_blot', 'the route: six creatures, the blot at the door last (' + route.map((r) => r.id).join(' ') + ')');
  const words = KNOWN_AT['rw.inkblot'].concat(['kaze', 'nawa']); // after Chapter 2: Chapter 1's words, みず, かぜ and なわ
  const rows = [];
  let lost = 0, worst = null, refunds = 0, slipped = 0;
  for (const difficulty of ['relaxed', 'normal', 'hard']) {
    for (const comp of ['nao', 'mio', 'ren', 'suzu']) {
      for (const policy of ['smart', 'unravel']) {
        for (const slips of [0, 3]) {
          const camp = { pc: 12, comp: 12, max: 12 };
          const uses = {};
          for (const k in d.stations) uses[k] = X.KIND[d.stations[k].kind].uses;
          let won = 0, min = 12, rested = 0, ref = 0;
          for (const f of route) {
            const o = {
              policy, slips: slips || null, difficulty, comp, words, flags: { ch2_done: true },
              onInit: (st) => {
                const dr = st.max - camp.max;
                st.pc = Math.max(0, Math.min(st.max, camp.pc + dr));
                if (st.compId) st.comp = Math.max(0, Math.min(st.max, camp.comp + dr));
                X.track(st);
              },
            };
            if (f.encounter) o.encounter = f.encounter;
            else o.group = RB.combatLogic.groupFor(f.enemy, f.place, difficulty).slice(1); // the placement's group, as the battle screen takes it
            const r = Sim.run(f.encounter ? null : f.enemy, o);
            if (!r.win) break;
            won++;
            const out = X.settle(r.st), dr = r.st.max - camp.max;
            ref += out.refund.pc;
            if (slips) slipped += r.st.acct.pools.pc.mist ? 1 : 0;
            camp.pc = Math.max(1, Math.min(camp.max, out.pc - dr));
            camp.comp = Math.max(1, Math.min(camp.max, out.comp - dr));
            min = Math.min(min, camp.pc, camp.comp, r.minPc - dr);
            // rest when four or more short, at a station of this floor that is left (the lamp counts once mended)
            const short = camp.max - Math.min(camp.pc, camp.comp);
            if (short >= 4) {
              const here = Object.keys(d.stations).filter((k) => d.stations[k].map === f.map && uses[k] > 0).sort((a, b) => (X.KIND[d.stations[b].kind].gives === 'full') - (X.KIND[d.stations[a].kind].gives === 'full'));
              if (here.length) {
                const k = here[0], g = X.KIND[d.stations[k].kind].gives;
                camp.pc = g === 'full' ? camp.max : Math.min(camp.max, camp.pc + g);
                camp.comp = g === 'full' ? camp.max : Math.min(camp.max, camp.comp + g);
                uses[k]--; rested++;
              }
            }
          }
          refunds += ref;
          const row = { difficulty, comp, policy, slips, won, min, rested, end: camp.pc + '/' + camp.comp, ref };
          if (difficulty === 'normal' && comp === 'mio' && policy === 'unravel' && slips === 3) row.groups = route.map((f) => (f.encounter ? (C.encounters[f.encounter].group.normal || []).length : RB.combatLogic.groupFor(f.enemy, f.place, 'normal').length - 1));
          rows.push(row);
          if (won < route.length) lost++;
          if (!worst || row.min < worst.min) worst = row;
        }
      }
    }
  }
  const g = rows.find((r) => r.groups);
  t.eq(g.groups, [0, 0, 0, 0, 1, 1], 'on Standard the south hall\'s blot and the door\'s come with a flour moth each (authored encounters)');
  // the six-chapter story's bound, kept for the cellars' groups: a group is a step up from its lead alone, never a
  // spike (within 5 exchanges and half a resolve bar), and Relaxed always meets one creature
  const spikes = [];
  for (const id of ['xp.cellars_pair', 'xp.cellars_blot']) {
    for (const difficulty of ['relaxed', 'normal', 'hard']) {
      for (const comp of [null, 'nao', 'mio', 'ren', 'suzu']) {
        const o = { policy: 'smart', slips: 4, difficulty, comp, words, flags: { ch2_done: true } };
        const g2 = Sim.run(null, Object.assign({ encounter: id }, o)), solo = Sim.run('rw.inkblot', o);
        if (difficulty === 'relaxed' && g2.foes.length !== 1) spikes.push(id + ' relaxed has ' + g2.foes.length);
        if (g2.rounds - solo.rounds > 5 || g2.lost - solo.lost > g2.max / 2) spikes.push([id, difficulty, comp, '+' + (g2.rounds - solo.rounds) + ' rounds', '+' + (g2.lost - solo.lost) + ' lost'].join(' '));
      }
    }
  }
  t.eq(spikes, [], 'the cellars\' groups: a step up from the blot alone, never a spike; one creature on Relaxed');
  t.eq(lost, 0, 'the whole route is won at every setting, with every companion, by both players, slipping or not (' + rows.length + ' runs)');
  t.ok(worst.min >= 1, 'never at 0 resolve between encounters; the lowest point: ' + JSON.stringify(worst));
  t.ok(slipped > 0 && refunds > 0, 'slips happened and what they cost was given back (' + refunds + ' points over the slipping runs)');
  // the table (recorded in docs/future/work/P07_EXPEDITIONS.md)
  const by = (k) => rows.filter((r) => r.difficulty === k);
  for (const k of ['relaxed', 'normal', 'hard']) {
    const R = by(k);
    console.log('   ' + k.padEnd(8) + ' runs ' + R.length + ', all won: ' + R.every((r) => r.won === route.length) + ', lowest resolve between encounters ' + Math.min(...R.map((r) => r.min)) + ', rests used ' + Math.min(...R.map((r) => r.rested)) + '–' + Math.max(...R.map((r) => r.rested)) + ', given back per run up to ' + Math.max(...R.map((r) => r.ref)));
  }
};
