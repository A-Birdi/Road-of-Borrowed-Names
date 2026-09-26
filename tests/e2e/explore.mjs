// Generic story explorer: plays from a start map until a target flag is set,
// by talking to NPCs, examining scripted props, stepping on triggers and
// taking exits, with seeded random choices. Uses RB.test auto mode (answers
// and battles solved by the harness; battles with Unravel only).
// Usage: node tests/e2e/explore.mjs <startMap> <x> <y> <targetFlag[>flag2>…]> [comp] [profile] [seed] [maxActions] [flags,comma,sep] [words,comma,sep] [mapPrefix]
// Several targets separated by '>' are reached in order in one continuous run
// (maxActions applies to each leg); per-leg action counts are reported.
// mapPrefix (e.g. 'lf.') keeps the explorer inside one chapter's maps; a
// target may carry its own prefix as flag@prefix (e.g. ch1_done@rw.>ch2_done@sg.),
// which restricts exits during that leg to maps with that prefix.
import { serve, launch, page } from './lib.mjs';

const [startMap, sx, sy, target, comp = 'none', profile = 'E', seed = '1', maxActions = '900', flagList = '', wordList = '', prefix = ''] = process.argv.slice(2);
const { srv, url } = await serve();
const b = await launch();
const { p, errors } = await page(b, url);
const t0 = Date.now();
const res = await p.evaluate(async (a) => {
  const T = RB.test;
  const rng = RB.util.rng(+a.seed);
  // choices: mostly the first option (authors put "do it" first), sometimes any
  T.enable({ battle: 'unravel', choose: (opts) => (rng() < 0.75 ? 0 : rng.int(opts.length)) });
  const flags = {};
  for (const f of a.flagList.split(',').filter(Boolean)) flags[f] = true;
  const s = RB.game.debugStart(a.startMap, +a.sx, +a.sy, { comp: a.comp === 'none' ? null : a.comp, profile: a.profile, flags });
  s.learn.kanaKnown = a.profile === 'F' ? 'hira' : 'both';
  for (const w of a.wordList.split(',').filter(Boolean)) if (!s.words.includes(w)) s.words.push(w);
  s.chapter = 2;
  await T.idle();
  RB.game.runEnterEvents();
  await T.idle();
  const tried = new Map(); // stateKey|action -> count
  const visited = new Set();
  const trail = [];
  const W = RB.world.W;
  // state signature: story flags, quest stages, companion (provisional or committed) and script vars
  const sig = () => Object.keys(s.flags).filter((k) => !k.startsWith('enter:') && !k.startsWith('named:') && !k.startsWith('trig:')).sort().join(',') + '|' + JSON.stringify(s.quests) + '|' + s.comp + '/' + s.provisional + '|' + Object.entries(s.vars || {}).filter(([k]) => k[0] !== '_').map((e) => e.join('=')).sort().join(',') + '|' + Object.keys(s.inv || {}).sort().join(',');
  let actions = 0;
  const flagsSeen = new Set(Object.keys(s.flags));
  const progress = [];
  const targets = a.target.split('>').map((t) => t.split('@')[0]);
  const legPrefix = a.target.split('>').map((t) => t.split('@')[1] || a.prefix || '');
  const legs = [];
  let leg = 0, legStart = 0;
  for (;;) {
    while (leg < targets.length && s.flags[targets[leg]]) { legs.push({ target: targets[leg], actions: actions - legStart, map: W.map.id }); leg++; legStart = actions; }
    if (leg >= targets.length || actions - legStart >= +a.maxActions) break;
    actions++;
    const m = W.map;
    visited.add(m.id);
    const cands = [];
    for (const n of W.npcs) if (n.def.talk) cands.push({ k: 'talk:' + n.id, run: () => T.talk(n.id) });
    for (const pr of m.props) if (pr.scene && (!pr.if || RB.state.test(s, pr.if))) cands.push({ k: 'use:' + pr.x + ',' + pr.y, run: () => T.use(pr.x, pr.y) });
    for (const f of W.foes) cands.push({ k: 'foe:' + f.id, run: async () => { await RB.game.startBattle(f.def.enemy, { foeKey: 'foe:' + m.id + ':' + f.def.id, scene: f.def.scene }); await T.idle(); } });
    for (const tr of m.triggers) if (!tr.if || RB.state.test(s, tr.if)) cands.push({ k: 'trig:' + tr.x + ',' + tr.y, run: async () => { T.place(tr.x, tr.y); RB.script.run(tr.scene); await T.idle(); } });
    const pfx = legPrefix[leg] || '';
    for (const ex of m.exits) if ((!ex.if || RB.state.test(s, ex.if)) && (!pfx || ex.to.startsWith(pfx))) {
      cands.push({ k: 'exit:' + ex.to, exit: true, run: async () => {
        if (ex.locked && (!ex.unlock || !RB.state.test(s, ex.unlock))) { RB.script.run(ex.locked); await T.idle(); return; }
        await T.go(ex.to, ex.tx, ex.ty, ex.dir);
        if (ex.tx == null) { /* named spawn */ }
      } });
    }
    const key = sig();
    // prefer actions not yet tried in this state; exits get lower priority unless nothing else
    const tk = (c) => key + '|' + m.id + '|' + c.k;
    let pool = cands.filter((c) => !tried.get(tk(c)));
    // nothing new here: half the time retry the least-tried interaction (a
    // choice may have declined it, e.g. "Leave it"), otherwise move on
    if (!pool.length) {
      const inter = cands.filter((c) => !c.exit);
      const least = Math.min(...inter.map((c) => tried.get(tk(c)) || 0));
      pool = inter.length && rng() < 0.5 ? inter.filter((c) => (tried.get(tk(c)) || 0) === least) : cands.filter((c) => c.exit);
    }
    if (!pool.length) pool = cands;
    const nonExit = pool.filter((c) => !c.exit);
    const pick = (nonExit.length && rng() < 0.85 ? nonExit : pool)[rng.int((nonExit.length && rng() < 0.85 ? nonExit : pool).length)] || cands[rng.int(cands.length)];
    if (!pick) break;
    tried.set(tk(pick), (tried.get(tk(pick)) || 0) + 1);
    try {
      if (pick.k.startsWith('exit:')) {
        const ex = m.exits.find((e) => 'exit:' + e.to === pick.k);
        if (ex && ex.tx == null) { await RB.game.transition(ex.to, null, null, ex.dir, { sp: ex.sp }); await T.idle(); }
        else await pick.run();
      } else await pick.run();
    } catch (e) { trail.push('ERR ' + pick.k + ' ' + e.message); }
    for (const f of Object.keys(s.flags)) if (!flagsSeen.has(f)) { flagsSeen.add(f); if (!/^(enter|named|trig|foe):/.test(f)) progress.push(actions + ':' + f); }
    trail.push(m.id + ' ' + pick.k);
    if (trail.length > 40) trail.shift();
  }
  return {
    reached: leg >= targets.length, legs, stuckOn: targets[leg] || null, actions, comp: s.comp, visited: [...visited], progress, trail, problems: T.problems,
    quests: Object.fromEntries(Object.entries(s.quests).map(([k, q]) => [k, q.done ? 'done' : q.stage])),
    battles: T.log.filter((l) => l.t === 'battle').map((l) => l.enemy + ':' + l.result + '/' + l.rounds),
    map: W.map.id, words: s.words,
  };
}, { startMap, sx, sy, target, comp, profile, seed, maxActions, flagList, wordList, prefix }).catch((e) => ({ error: String(e && e.stack || e) }));
console.log(JSON.stringify({ target, comp, profile, seed, seconds: Math.round((Date.now() - t0) / 1000), ...res, pageErrors: errors.slice(0, 8) }, null, 1));
await b.close(); srv.close();
process.exit(res.reached && !(res.problems || []).length && !errors.length ? 0 : 1);
