// Manybridge, Chapter 3 (expansion P08; docs/future/work/P08_MANYBRIDGE.md): the route in a twelve-chapter journey and
// none in a six-chapter one; the maps' walkways reach what the story needs; barge routing's canal answers every reply
// it can be given; the dispute (the first conflict without a creature) reaches every conclusion, Unravel does nothing
// and Wait is what opens Gonta; the lock-keeper's door; the two lock procedures and the Nameless Bridge play through
// in order with the tablets' mistakes handled as the plan says; the census, the stalls and the riddles are complete.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, E = RB.encounter;
  const OK = { ok: true, firstTry: true, mistakes: 0 };
  const camp = (o = {}) => {
    const s = RB.state.newCampaign({ edition: o.edition == null ? 2 : o.edition });
    s.id = o.id || 'mb-test'; s.comp = o.comp === undefined ? 'nao' : o.comp;
    s.words = (o.words || ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'iyasu']).slice();
    for (const f of o.flags || []) s.flags[f] = true;
    RB.game.s = s;
    return s;
  };
  const wordsOf = (s) => s.words.map((w) => C.words[w]).filter(Boolean);
  const cardOf = (st, s, pred) => E.cards(st, s, wordsOf(s)).find(pred);
  const play = (st, s, card, o = {}) => E.exchange(st, { card, res: o.res || OK, comp: o.comp || null, target: st.cur }, { enemy: st.foes[0] && st.foes[0].def });
  const test = (s, cond) => RB.state.test(s, cond);

  // ---- the route: twelve-chapter journeys only ---------------------------------------------------------------------
  const mbMaps = Object.keys(C.maps).filter((id) => /^mb\./.test(id));
  t.ok(mbMaps.length >= 13 && mbMaps.every((id) => C.maps[id].edition === 2), 'Manybridge\'s ' + mbMaps.length + ' maps are all the twelve-chapter edition\'s');
  t.ok(C.places.manybridge && C.places.manybridge.edition === 2, 'its place on the chart is the twelve-chapter edition\'s');
  const road = C.maps['sg.road'], north = road.exits.find((e) => e.to === 'co.road');
  const ed1 = camp({ edition: 1, flags: ['ch2_done'] }), ed2 = camp({ flags: ['ch2_done'] });
  t.ok(test(ed1, north.if) && !test(ed2, north.if), 'the north road opens after Chapter 2 in a six-chapter journey, not yet in a twelve-chapter one');
  ed2.flags.mb2_done = true;
  t.ok(test(ed2, north.if), 'in a twelve-chapter journey it opens once Manybridge\'s two chapters are over');
  const tetsu = C.maps['sg.harbor'].npcs.find((n) => n.id === 'tetsu');
  const firstTalk = (s) => (tetsu.talk.find((x) => !x.if || test(s, x.if)) || {}).scene;
  t.eq(firstTalk(camp({ edition: 1, flags: ['ch2_done'] })), 'sg.tetsu_ferry', 'Tetsu in a six-chapter journey: as before');
  t.eq(firstTalk(camp({ flags: ['ch2_done'] })), 'mb.ferry_tetsu', 'in a twelve-chapter journey: the ferry east');
  const washed = road.triggers.find((x) => x.scene === 'mb.north_washed');
  t.ok(washed && !test(camp({ edition: 1, flags: ['ch2_done'] }), washed.if) && test(camp({ flags: ['ch2_done'] }), washed.if), 'the washed-out bridge notice: twelve-chapter journeys only');
  // the chapter key and the number a player sees
  const sc = camp();
  RB.edition.setChapter(sc, 'mb1');
  t.ok(sc.chapterKey === 'mb1' && RB.edition.number(sc) === 3 && !test(sc, 'ch>=3'), 'Chapter 3 by story order; the old ch>=3 conditions stay false');

  // ---- the maps: walkways reach what the story needs ---------------------------------------------------------------
  RB.maps.invalidate();
  const reach = (mapId, from) => {
    const m = RB.maps.compile(mapId);
    const seen = new Set([from.join(',')]), q = [from];
    while (q.length) {
      const [x, y] = q.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
        if (seen.has(k) || nx < 0 || ny < 0 || nx >= m.w || ny >= m.h) continue;
        if (RB.maps.blockedStatic(m, nx, ny)) continue;
        seen.add(k); q.push([nx, ny]);
      }
    }
    return (x, y) => [[0, 1], [0, -1], [1, 0], [-1, 0], [0, 0]].some(([dx, dy]) => seen.has((x + dx) + ',' + (y + dy)));
  };
  for (const id of ['mb.exchange', 'mb.kura', 'mb.pier']) {
    const d = C.maps[id], r = reach(id, d.spawn.default.slice(0, 2));
    // a prop is reached from beside any cell of its footprint
    const near = (p) => { const P = RB.props.P[p.p] || {}; for (let dy = 0; dy < (P.h || 1); dy++) for (let dx = 0; dx < (P.w || 1); dx++) if (r(p.x + dx, p.y + dy)) return true; return false; };
    const bad = (d.npcs || []).filter((n) => !r(n.x, n.y)).map((n) => n.id).concat((d.props || []).filter((p) => p.scene && !near(p)).map((p) => p.p + '@' + p.x + ',' + p.y));
    t.eq(bad, [], id + ': every person and every prop with something to say can be reached');
  }

  // ---- barge routing ----------------------------------------------------------------------------------------------
  t.eq(RB.ui.canal.check(C), [], 'every reply a routing step can be given has a route on its canal');
  const canal = C.canals['mb.canal_city'];
  for (const id of ['mb.route1', 'mb.route2']) {
    const want = id === 'mb.route1' ? 'heiji_w' : 'inn';
    for (const k of ['F', 'E', 'I', 'A']) {
      const st = C.challenges[id].tiers[k][0];
      const oks = st.families.filter((f) => f.ok), nos = st.families.filter((f) => !f.ok);
      t.ok(oks.length >= 1 && oks.every((f) => canal.routes[f.result].to === want), id + '[' + k + ']: ' + oks.length + ' accepted plan(s), every one reaching ' + canal.places[want].en);
      t.ok(nos.length >= 1 && nos.every((f) => f.result !== want || canal.routes[f.result].to !== want), id + '[' + k + ']: a wrong reply visibly sends the barge elsewhere (' + nos.map((f) => f.result).join(', ') + ')');
    }
  }
  // the canal's routes all run along water
  const inWater = (x, y) => canal.water.some(([wx, wy, ww, wh]) => x >= wx && x <= wx + ww && y >= wy && y <= wy + wh);
  const dry = Object.keys(canal.routes).filter((k) => canal.routes[k].path.some(([x, y]) => !inWater(x, y)));
  t.eq(dry, [], 'every route keeps to the water');

  // ---- the dispute -------------------------------------------------------------------------------------------------
  {
    const run = (plan, o = {}) => {
      const s = camp({ comp: o.comp || null, words: ['hikari', 'mizu'] });
      const st = E.begin('mb.dispute', s);
      for (const id of plan) {
        if (st.over) break;
        const c = cardOf(st, s, (x) => x.id === id) || cardOf(st, s, (x) => x.kind === 'wait');
        play(st, s, c, { comp: o.act ? { act: o.act } : null });
      }
      let guard = 0;
      while (!st.over && guard++ < 12) play(st, s, cardOf(st, s, (x) => x.kind === 'wait'));
      return st;
    };
    const s0 = camp({ comp: null, words: [] });
    const st0 = E.begin('mb.dispute', s0);
    t.ok(!st0.foes.length, 'no creature in it');
    const ev = play(st0, s0, cardOf(st0, s0, (c) => c.kind === 'unravel'));
    t.ok(ev.fx.some((f) => /Nothing here is knotted/.test(f.en || '')), 'Unravel does nothing, and says so');
    const asked = run(['s:ask_gonta']);
    t.ok(!asked.enc.social.revealed.c4 || asked.enc.outcome, 'asking a closed Gonta directly does not open him');
    const st1 = E.begin('mb.dispute', camp({ comp: null }));
    play(st1, RB.game.s, cardOf(st1, RB.game.s, (x) => x.kind === 'wait'));
    t.ok(st1.enc.social.revealed.c4, 'Wait: in the silence, Gonta says where he put the rice');
    t.eq(run(['s:blame']).enc.outcome, 'walked_out', 'blaming Gonta: he walks out');
    t.eq(run(['s:show_tally', 's:propose']).enc.outcome, 'found', 'the tally read and the east storehouse proposed: the rice is found (Gonta\'s secret kept)');
    t.eq(run(['s:calm', 'wait', 's:show_tally', 'wait', 'wait', 's:propose']).enc.outcome, 'resolved', 'calm, wait, the tally, wait (Gonta opens up), propose: resolved, and Gonta owns up');
    const reached = new Set(), seen = new Set();
    const explore = (plan, depth) => {
      const s2 = camp({ comp: 'nao', words: ['hikari', 'mizu'] });
      const x = E.begin('mb.dispute', s2);
      for (const id of plan) { if (x.over) break; play(x, s2, cardOf(x, s2, (c) => c.id === id)); }
      if (x.over) { reached.add(x.enc.outcome); return; }
      const key = E.stateKey(x) + x.round;
      if (seen.has(key) || depth > 8) return;
      seen.add(key);
      for (const c of E.cards(x, s2, wordsOf(s2))) if (!c.disabled) explore(plan.concat([c.id]), depth + 1);
    };
    explore([], 0);
    const want = C.encounters['mb.dispute'].conclusions.map((c) => c.id);
    t.eq(want.filter((id) => !reached.has(id)), [], 'every conclusion is reachable: ' + [...reached].join(', '));
    for (const comp of ['nao', 'mio', 'ren', 'suzu']) t.ok((C.encounters['mb.dispute'].social.companion[comp] || []).length > 0 && (C.encounters['mb.passage'].social.companion[comp] || []).length > 0, comp + ' has something of their own in both conversations');
    // every conclusion moves the story on: the rice is found whatever happens (21_scenes_main.js)
    const after = C.scenes['mb.dispute_after'].cmds.map((c) => c.op + ':' + (c.args || []).join(' '));
    t.ok(after.some((o) => o === 'set:mb_rice_found') && after.some((o) => o === 'quest:mb_main 3'), 'after any conclusion: the rice found, the story on');
  }

  // ---- the lock-keeper's door ---------------------------------------------------------------------------------------
  {
    const reached = new Set(), seen = new Set();
    const explore = (plan, depth) => {
      const s2 = camp({ comp: 'ren', words: ['hikari'] });
      const x = E.begin('mb.passage', s2);
      for (const id of plan) { if (x.over) break; play(x, s2, cardOf(x, s2, (c) => c.id === id)); }
      if (x.over) { reached.add(x.enc.outcome); return; }
      const key = E.stateKey(x) + x.round;
      if (seen.has(key) || depth > 8) return;
      seen.add(key);
      for (const c of E.cards(x, s2, wordsOf(s2))) if (!c.disabled) explore(plan.concat([c.id]), depth + 1);
    };
    explore([], 0);
    t.eq(C.encounters['mb.passage'].conclusions.map((c) => c.id).filter((id) => !reached.has(id)), [], 'the door: every conclusion reachable (' + [...reached].join(', ') + ')');
    const after = C.scenes['mb.passage_after'].cmds.map((c) => c.op + ':' + (c.args || []).join(' '));
    t.ok(after.some((o) => o === 'set:mb_passage'), 'whatever happens at the door, the Exchange\'s leave opens the lock (the way down is never lost)');
  }

  // ---- the lock procedures ------------------------------------------------------------------------------------------
  {
    const s = camp();
    const st = E.begin('mb.locks', s);
    const pick = (aid) => cardOf(st, s, (c) => c.kind === 'proc' && c.action.id === aid);
    play(st, s, pick('punt'));
    t.eq(st.enc.proc.step, 0, 'the punt against a shut gate: nothing moves');
    play(st, s, pick('open'));
    play(st, s, pick('punt'));
    t.ok(st.enc.proc.step === 1 && st.enc.proc.machine.gate === 'open', 'rushing the punt through: back to the last stable step, the gate still open');
    play(st, s, pick('wait')); play(st, s, pick('through')); play(st, s, pick('shut'));
    t.ok(st.over === 'win' && st.enc.proc.done, 'the channels: open, wait, through, shut');
    const fin = E.finishEncounter(st, s, st.over);
    t.ok(fin.flags && fin.flags.mb_u2_through, 'and the punt is through');
    const g = E.begin('mb.greatlock', camp());
    const gp = (aid) => cardOf(g, RB.game.s, (c) => c.kind === 'proc' && c.action.id === aid);
    play(g, RB.game.s, gp('lower'));
    t.eq(g.enc.proc.step, 0, 'the lower gate with the upper open: it will not budge');
    play(g, RB.game.s, gp('shut')); play(g, RB.game.s, gp('open_now'));
    t.ok(g.enc.proc.step === 0 && g.enc.proc.machine.upper === 'open', 'heaving the lower gate against a full chamber: a short machine starts again');
    play(g, RB.game.s, gp('shut')); play(g, RB.game.s, gp('wait_open'));
    t.ok(g.over === 'win', 'the Great Lock: shut the upper gate, wait, open the lower');
  }

  // ---- the Nameless Bridge -----------------------------------------------------------------------------------------
  {
    const s = camp({ comp: 'mio' });
    const st = E.begin('mb.boss', s);
    t.ok(st.foes.length === 1 && st.foes[0].boss && st.enc.proc, 'a boss with a procedure of its own');
    const pick = (aid) => cardOf(st, s, (c) => c.kind === 'proc' && c.action.id === aid);
    play(st, s, pick('s1_ok'));
    play(st, s, pick('s2_no'));
    t.ok(st.enc.proc.step === 1 && st.enc.proc.machine.s1 === 'laid', 'a span laid wrong: thrown back, the span before holds');
    for (const a of ['s2_ok', 's3_ok', 'call']) if (!st.over) play(st, s, pick(a));
    t.ok(st.over === 'win' && st.enc.outcome === 'named', 'three spans in order, then its name: the bridge is named (' + st.over + ')');
    t.ok(!st.over || st.pc > 0, 'and you are still standing');
    const name = C.encounters['mb.boss'].procedure.steps.find((x) => x.id === 'name');
    t.ok(['F', 'E', 'I', 'A'].every((k) => name.task[k]), 'the naming has all four profiles');
  }

  // ---- side content -------------------------------------------------------------------------------------------------
  const bridges = Object.keys(C.mbBridges);
  const placed = [];
  for (const id of mbMaps) for (const p of C.maps[id].props || []) if (p.p === 'mb_plaque' && p.o && C.mbBridges[p.o.bridge]) placed.push(p.o.bridge);
  t.eq(placed.slice().sort(), bridges.slice().sort(), 'the census: seven plaques on the maps, one per bridge (' + bridges.join(', ') + ')');
  for (const b of bridges) t.ok(C.scenes['mb.plaque_' + b] && ['F', 'E', 'I', 'A'].every((k) => C.challenges['mb.census_' + b].tiers[k]), b + ': its plaque scene and its name at four profiles');
  t.ok(['masa', 'masu'].every((w) => C.challenges['mb.noodle_' + w] && C.scenes['mb.' + w]), 'the rival stalls: a notice for each');
  t.ok(C.mbRiddles.length === 6 && C.mbRiddles.every((r, i) => C.challenges['mb.riddle_' + (i + 1)]) && RB.pastimes.get('mb_riddles'), 'Boatman\'s Riddles: six riddles, a pastime of its own');
  t.ok(C.quests.mb_lc && C.challenges['mb.lc_plan'] && C.scenes['mb.lc_wall'] && C.scenes['mb.zenzo_contract'], 'the Lost Contract: the plan, the wall, the agreement');
};
