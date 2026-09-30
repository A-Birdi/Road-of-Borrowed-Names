// Field Inkweaving, the Mill Road repair and the six field puzzles (addendum
// §13, §14, §17; docs/addendum/fieldweave.md): the rules engine and its three
// separate layers, every valid route of F1-F6 (including the mixed ones), the
// ineffective attempts and their explanations, reset, once-only completion
// and keepsakes, repair of invalid saved state, the condition terms, the Mill
// Road reachability matrix, map placement, companion reaction coverage and
// the Japanese of all the data (furigana, dictionary coverage).
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const FW = RB.fieldweave, S = RB.state;
  const fresh = (o) => { const s = S.newCampaign({}); s.map = 'rw.village'; Object.assign(s, o || {}); RB.game.s = s; return s; };
  const IDS = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'];
  const events = [];
  RB.bus.on('discovery:resolved', (e) => events.push(['resolved', e]));
  RB.bus.on('keepsake:found', (e) => events.push(['keepsake', e]));
  RB.bus.on('world:changed', (e) => events.push(['changed', e]));

  // a route: [['act', name] | ['weave', key, word] | ['arrange', patch] | ['reset']]
  function run(s, pz, steps) {
    const out = [];
    for (const st of steps) {
      if (st[0] === 'act') out.push(FW.act(s, pz, st[1]));
      else if (st[0] === 'weave') out.push(FW.weave(s, pz, st[1], st[2], { mode: 'choice', assisted: false }));
      else if (st[0] === 'arrange') out.push(FW.arrange(s, pz, st[1]));
      else if (st[0] === 'reset') out.push(FW.reset(s, pz));
    }
    return out;
  }

  // ---- definitions ------------------------------------------------------------------------------------------
  t.eq(FW.list().map((d) => d.id).sort(), IDS, 'six field puzzles are defined');
  for (const d of FW.list()) {
    t.ok(d.region && d.map && RB.content.maps[d.map], d.id + ': region and an existing map');
    t.ok(FW.match(d.init, d.init) && !FW.match(d.init, d.complete), d.id + ': the start is not already complete');
    t.ok(FW.match(d.solved, d.complete), d.id + ': the documented solved arrangement meets the outcome');
    for (const k in d.values) t.ok(d.values[k].indexOf(d.init[k]) >= 0 && d.values[k].indexOf(d.solved[k]) >= 0, d.id + ': init and solved use allowed values for ' + k);
    t.ok(d.hints && d.hints.length === 3, d.id + ': three layers of hints');
    t.ok(d.reward && RB.content.keepsakes[d.reward.keepsake], d.id + ': rewards a registered keepsake');
    t.ok(d.methods.length >= 2, d.id + ': at least two method classes');
    const scenes = new Set(Object.keys(RB.content.scenes));
    const props = (RB.content.maps[d.map].props || []).filter((p) => p.o && p.o.pz === d.id);
    t.ok(props.length >= 2, d.id + ': its props stand on ' + d.map);
    for (const p of props) {
      t.ok(RB.props.P[p.p] && RB.props.P[p.p].draw2, d.id + ': prop ' + p.p + ' has art at art resolution');
      if (p.scene) t.ok(scenes.has(p.scene), d.id + ': scene ' + p.scene + ' exists');
    }
  }

  // ---- F1: screen shut then clamp; or a ward then clamp -----------------------------------------------------------
  {
    const s = fresh();
    let r = run(s, 'f1', [['act', 'clamp']]);
    t.ok(!r[0].effective && /cannot close|can't close/i.test(r[0].say[0].en) && FW.peek(s, 'f1').seen.swing, 'F1: the clamp while the screen swings explains itself and changes nothing');
    r = run(s, 'f1', [['weave', 'screen', 'mizu']]);
    t.ok(!r[0].effective && r[0].neutral && FW.peek(s, 'f1').seen.dry, 'F1: water is neutral, never destroys the writing, and shows the sheet is dry');
    r = run(s, 'f1', [['weave', 'screen', 'hikari']]);
    t.ok(!r[0].effective && /doesn.t stop it/.test(r[0].say[0].en), 'F1: light shows the movement but does not fasten');
    t.eq(s.learn.stats.mistakes, 0, 'F1: ineffective responses are not language mistakes');
    r = run(s, 'f1', [['act', 'close'], ['act', 'clamp']]);
    t.ok(r[1].completed && r[1].method === 'screened' && r[1].keepsake === 'reed_boat', 'F1: screen then clamp completes (screened) and gives the Folded Reed Boat');
    t.eq(FW.stateOf(s, 'f1'), FW.get('f1').solved, 'F1: the lasting arrangement');
    const again = run(s, 'f1', [['act', 'clamp'], ['weave', 'screen', 'mamoru']]);
    t.ok(!again[0].effective && !again[0].completed && !again[1].completed && again[1].say[0].en === FW.get('f1').solvedSay.en, 'F1: nothing more happens afterwards (no second award)');
    t.eq(Object.keys(s.discovery.keepsakes), ['reed_boat'], 'F1: one keepsake');
    const s2 = fresh();
    r = run(s2, 'f1', [['weave', 'screen', 'mamoru'], ['act', 'clamp']]);
    t.ok(r[0].effective && FW.stateOf(s2, 'f1').held === false && r[1].completed && r[1].method === 'warded', 'F1: a ward then the clamp completes (warded); the ward lets go afterwards');
    t.eq(FW.stateOf(s2, 'f1'), FW.stateOf(s, 'f1'), 'F1: both routes end in the same arrangement');
    t.eq(s2.discovery.keepsakes.reed_boat.how.id, 'f1', 'F1: the keepsake records its source');
    // assisted language gives identical credit
    const s3 = fresh();
    FW.weave(s3, 'f1', 'screen', 'mamoru', { mode: 'choice', assisted: true });
    const r3 = FW.act(s3, 'f1', 'clamp');
    t.ok(r3.completed && r3.keepsake === 'reed_boat', 'F1: an assisted answer earns the same keepsake');
    const s4 = fresh();
    run(s4, 'f1', [['act', 'close'], ['act', 'open']]);
    t.eq(FW.stateOf(s4, 'f1').screen, 'swing', 'F1: the screen can be let go again before it is clamped');
    t.ok(FW.reset(s4, 'f1') && FW.peek(s4, 'f1').seen.still, 'F1: reset keeps what was observed');
  }

  // ---- F2: the signal float -------------------------------------------------------------------------------------------
  {
    const s = fresh({ map: 'sg.harbor' });
    let r = run(s, 'f2', [['weave', 'inlet', 'mizu']]);
    t.ok(!r[0].effective && FW.peek(s, 'f2').seen.vent && /nowhere to go/.test(r[0].say[0].en), 'F2: filling with the vent shut gurgles back; the level does not change');
    r = run(s, 'f2', [['act', 'crank']]);
    t.ok(!r[0].effective && /Nothing holds the line/.test(r[0].say[0].en), 'F2: cranking without the catch lets the float sink back');
    r = run(s, 'f2', [['act', 'vent_open'], ['weave', 'inlet', 'mizu']]);
    t.eq([FW.stateOf(s, 'f2').float, FW.stateOf(s, 'f2').level, FW.peek(s, 'f2').done], ['stop', 'high', false], 'F2: filled without the tether, the float rests safely against the stop, not lost');
    r = run(s, 'f2', [['act', 'crank']]);
    t.ok(!r[0].effective && /Set the tank back/.test(r[0].say[0].en), 'F2: a slack line explains the reset');
    t.ok(FW.reset(s, 'f2') && FW.stateOf(s, 'f2').float === 'cradle', 'F2: reset returns the float to its cradle');
    r = run(s, 'f2', [['act', 'vent_open'], ['act', 'catch_on'], ['weave', 'inlet', 'mizu']]);
    t.ok(r[2].completed && r[2].method === 'filled' && r[2].keepsake === 'cork_float', 'F2: vent, catch, water: filled (Painted Cork Float)');
    const s2 = fresh();
    r = run(s2, 'f2', [['act', 'catch_on'], ['act', 'crank']]);
    t.ok(r[1].completed && r[1].method === 'cranked', 'F2: catch and crank: cranked');
    const s3 = fresh();
    r = run(s3, 'f2', [['weave', 'post', 'kaze']]);
    t.ok(!r[0].effective && /Nothing holds the line/.test(r[0].say[0].en), 'F2: the vane without the catch lifts and drops');
    r = run(s3, 'f2', [['weave', 'crank', 'nawa'], ['weave', 'post', 'kaze']]);
    t.ok(r[0].effective && r[1].completed && r[1].method === 'vane' && FW.stateOf(s3, 'f2').bound === false && FW.stateOf(s3, 'f2').catch === 'on', 'F2: a woven rope for the catch, then wind on the vane: vane; the rope gives way to the catch');
    r = run(fresh(), 'f2', [['weave', 'tank', 'kaze']]);
    t.ok(!r[0].effective, 'F2: wind on the tank only ruffles the water');
  }

  // ---- F3: the maker's mark (support x light, any mix) ------------------------------------------------------------------
  {
    const routes = [
      [[['act', 'peg_set'], ['act', 'lamp_side']], 'ordinary'],
      [[['act', 'lamp_side'], ['act', 'peg_set']], 'ordinary'],
      [[['weave', 'tray', 'ishi'], ['weave', 'tray', 'hikari']], 'woven'],
      [[['weave', 'tray', 'tsuchi'], ['weave', 'tray', 'hikari']], 'woven'],
      [[['act', 'peg_set'], ['weave', 'tray', 'hikari']], 'mixed'],
      [[['weave', 'tray', 'ishi'], ['act', 'lamp_side']], 'mixed'],
      [[['weave', 'tray', 'hikari'], ['act', 'peg_set']], 'mixed'],
    ];
    for (const [steps, m] of routes) {
      const s = fresh();
      const r = run(s, 'f3', steps);
      t.ok(r[1].completed && r[1].method === m && r[1].keepsake === 'glass_leaf', 'F3: ' + steps.map((x) => x[1] + (x[2] ? ':' + x[2] : '')).join(' + ') + ' → ' + m);
      t.eq(FW.stateOf(s, 'f3'), { support: 'peg', light: 'side' }, 'F3: the lasting arrangement (' + m + ')');
    }
    const s = fresh();
    const r = run(s, 'f3', [['weave', 'tray', 'kaze'], ['weave', 'tray', 'honoo'], ['weave', 'tray', 'mamoru'], ['weave', 'lamp', 'hikari'], ['weave', 'tray', 'koori']]);
    t.ok(r.every((x) => !x.effective), 'F3: wind, broad heat, a ward, a brighter lamp from above and frost change nothing');
    t.ok(/hold the flame back/.test(r[1].say[0].en) && FW.peek(s, 'f3').seen.heat, 'F3: heat is declined safely');
    const half = fresh();
    run(half, 'f3', [['act', 'lamp_side']]);
    t.ok(!FW.peek(half, 'f3').done && FW.lookOf(half, 'f3', 'tray').en.indexOf('rocks') >= 0, 'F3: light alone blurs on the rocking tray');
  }

  // ---- F4: the frosted compartments -----------------------------------------------------------------------------------
  {
    const s = fresh({ map: 'sb.hamlet' });
    let r = run(s, 'f4', [['act', 'open_c']]);
    t.ok(!r[0].effective && FW.peek(s, 'f4').seen.frozen, 'F4: the frozen cover keeps every door shut');
    r = run(s, 'f4', [['weave', 'cover', 'koori'], ['weave', 'cover', 'hikari'], ['weave', 'cover', 'mizu']]);
    t.ok(r.every((x) => !x.effective), 'F4: cooling, light and water do not reveal the stamps');
    r = run(s, 'f4', [['act', 'wipe'], ['act', 'open_a'], ['act', 'open_b']]);
    t.ok(r[0].effective && !r[1].effective && !r[2].effective && !FW.peek(s, 'f4').done, 'F4: wrong boxes explain themselves and close; nothing is taken');
    t.ok(/Collected/.test(r[1].say[1].en) && /Please leave/.test(r[2].say[1].en), 'F4: each wrong box says why it is not the one');
    r = run(s, 'f4', [['act', 'open_c']]);
    t.ok(r[0].completed && r[0].method === 'cloth' && r[0].keepsake === 'snow_toggle', 'F4: cloth then box ③: cloth (Snowflake Toggle)');
    const s2 = fresh();
    r = run(s2, 'f4', [['weave', 'cover', 'honoo'], ['act', 'open_c']]);
    t.ok(r[1].completed && r[1].method === 'flame', 'F4: flame at the warming plate then box ③: flame');
    r = run(s2, 'f4', [['act', 'open_a']]);
    t.ok(r[0].say.length === 2 && !r[0].effective, 'F4: the boxes can still be looked in afterwards');
    {
      const s3 = fresh();
      run(s3, 'f4', [['act', 'wipe']]);
      const was = JSON.stringify(FW.peek(s3, 'f4').state);
      t.ok(FW.get('f4').noReset && FW.reset(s3, 'f4') === false && JSON.stringify(FW.peek(s3, 'f4').state) === was, 'F4: nothing to reset (the frost does not come back once cleared)');
    }
    // the relational evidence: Hayate's stamp and the unaddressed box with the same stamp
    const cov = FW.lookOf(s, 'f4', 'cover').lines.map((l) => l.en).join(' ');
    t.ok(/Hayate", with a round stamp/.test(cov) && /No name, with a round stamp/.test(cov) && /triangle/.test(cov), 'F4: once exposed, the labels state names and stamp shapes in words');
  }

  // ---- F5: the explicit channel model ---------------------------------------------------------------------------------
  {
    const s = fresh({ map: 'lf.gardens' });
    let r = run(s, 'f5', [['act', 'strike']]);
    t.ok(r[0].after.sent === 'nook' && !r[0].completed && /waits for quiet/.test(r[0].say[0].en), 'F5: the first test reaches the reading nook and is explained (no anger)');
    r = run(s, 'f5', [['act', 'mR_toggle'], ['act', 'strike']]);
    t.ok(r[1].after.sent === 'both' && !r[1].completed, 'F5: both mouths open splits the note (still disturbs the reader)');
    r = run(s, 'f5', [['act', 'mL_toggle'], ['act', 'mR_toggle'], ['act', 'strike']]);
    t.ok(r[2].after.sent === 'lost' && /arrives nowhere/.test(r[2].say[0].en), 'F5: both mouths curtained: nothing arrives');
    r = run(s, 'f5', [['act', 'mR_toggle'], ['act', 'strike']]);
    t.ok(r[1].completed && r[1].method === 'struck' && r[1].keepsake === 'bell_clapper', 'F5: left drawn, right open, strike: struck (Miniature Bell Clapper)');
    const s2 = fresh();
    r = run(s2, 'f5', [['act', 'B_toggle'], ['weave', 'alcove', 'suzu']]);
    t.ok(r[1].completed && r[1].method === 'rung' && /cross tube/.test(r[1].say[0].en), 'F5: the flap to the cross tube and a bell weave: rung, by the other arrangement');
    const s3 = fresh();
    r = run(s3, 'f5', [['act', 'B_toggle'], ['act', 'mR_toggle'], ['weave', 'alcove', 'koe']]);
    t.ok(r[2].completed && r[2].method === 'rung', 'F5: voice counts as the bell family; both tubes to the display is fine');
    r = run(fresh(), 'f5', [['weave', 'display', 'suzu']]);
    t.ok(!r[0].effective, 'F5: ringing a bell anywhere but the alcove sends nothing down the tubes');
    const s4 = fresh();
    run(s4, 'f5', [['act', 'mL_toggle'], ['act', 'mR_toggle'], ['act', 'strike']]);
    r = run(s4, 'f5', [['act', 'strike']]);
    t.ok(!r[0].effective && /right tube/.test(r[0].say[0].en), 'F5: the chime can still be struck afterwards, the confirmed way');
    t.ok(/Left mouth curtained/.test(FW.lookOf(s4, 'f5', 'diagram').lines[1].en), 'F5: the diagram shows the arrangement the player confirmed');
  }

  // ---- F6: reveal, then file by the rule --------------------------------------------------------------------------------
  {
    const s = fresh({ map: 'sa.hut' });
    const d = FW.get('f6');
    let r = run(s, 'f6', [['arrange', { s1: 'down', s2: 'held', s3: 'up' }]]);
    t.ok(r[0].effective && !r[0].completed, 'F6: a right arrangement without the stamps brought up is not yet complete');
    t.ok(d.check(FW.stateOf(s, 'f6')).some((x) => x.ok === null), 'F6: the check says the stamps are too faint to confirm');
    r = run(s, 'f6', [['act', 'rub']]);
    t.ok(r[0].completed && r[0].method === 'rubbed' && r[0].keepsake === 'paperweight', 'F6: rubbing completes the already-right arrangement (Pocket Paperweight)');
    const s2 = fresh();
    r = run(s2, 'f6', [['weave', 'slips', 'hikari'], ['arrange', { s2: 'up' }], ['arrange', { s1: 'up' }]]);
    const ck = d.check(FW.stateOf(s2, 'f6'));
    t.ok(ck.find((x) => x.k === 's2').ok === false && /notch/.test(ck.find((x) => x.k === 's2').en) && ck.find((x) => x.k === 's1').ok === false && /points down/.test(ck.find((x) => x.k === 's1').en), 'F6: wrong placements stay editable and name the visible rule they break');
    r = run(s2, 'f6', [['arrange', { s3: 'up' }], ['arrange', { s2: 'held' }], ['arrange', { s1: 'down' }]]);
    t.ok(r[2].completed && r[2].method === 'lit', 'F6: light, then any order of placements: lit');
    t.ok(run(fresh(), 'f6', [['arrange', { s9: 'up' }], ['arrange', { s1: 'sideways' }]]).every((x) => x === null), 'F6: only listed items and folders can be arranged');
    r = run(fresh(), 'f6', [['weave', 'slips', 'kaze'], ['weave', 'slips', 'honoo'], ['weave', 'slips', 'mizu']]);
    t.ok(r.every((x) => !x.effective) && /Nothing is lost/.test(r[0].say[0].en), 'F6: moving air, flame and water change nothing and harm nothing');
    const late = fresh(); late.flags.sa_descent = true;
    t.ok(!FW.eligible(late, 'f6') && FW.act(late, 'f6', 'rub') === null, 'F6: waits while the descent after the last battle is on');
    late.flags.sa_done = true;
    t.ok(FW.eligible(late, 'f6'), 'F6: open again once the walk home is over');
  }

  // ---- layers, once, events ---------------------------------------------------------------------------------------------
  {
    const s = fresh();
    events.length = 0;
    FW.act(s, 'f1', 'close'); FW.act(s, 'f1', 'clamp');
    t.ok(events.some((e) => e[0] === 'resolved' && e[1].kind === 'puzzle' && e[1].id === 'f1' && e[1].method === 'screened' && e[1].region === 'reedwake'), 'discovery:resolved carries kind, id, region and the method that resolved it');
    t.ok(events.some((e) => e[0] === 'changed' && e[1].map === 'rw.village' && e[1].prop === 'f1.screen'), 'world:changed tells the map what changed');
    t.eq(events.filter((e) => e[0] === 'keepsake').length, 1, 'one keepsake:found');
    t.ok(s.awarded['puzzle:f1:done'] && s.awarded['keepsake:reed_boat'], 'the completion and the keepsake are once-only commits');
    // a double commit (a second tab, a replayed promise) awards nothing more
    const rec = s.discovery.puzzles.f1; rec.done = false;
    const again = FW.act(s, 'f1', 'clamp');
    t.ok(!again.keepsake && Object.keys(s.discovery.keepsakes).length === 1, 'a repeated completion never awards twice');
    // routine repeats: the same word on the same object after it worked
    const s2 = fresh();
    t.ok(!FW.routine(s2, 'f1', 'screen', 'mamoru'), 'no routine before the first success');
    FW.weave(s2, 'f1', 'screen', 'mamoru', { mode: 'hand' });
    t.ok(FW.routine(s2, 'f1', 'screen', 'mamoru') && !FW.routine(s2, 'f1', 'screen', 'mizu'), 'a word that worked on an object becomes a routine action there');
    // applicability preview never says a word is "wrong": it only says whether the world would change
    t.ok(FW.applies(fresh(), 'f1', 'screen', 'mamoru') && !FW.applies(fresh(), 'f1', 'screen', 'mizu'), 'applies() matches the rules');
  }

  // ---- conditions ------------------------------------------------------------------------------------------------------
  {
    const s = fresh();
    t.ok(!S.test(s, 'puzzle.f1') && !S.test(s, 'puzzle.f1=done') && S.test(s, 'puzzle.f1.screen=swing') && S.test(s, '!puzzle.f1.held'), 'conditions read the start without writing the save');
    t.ok(!s.discovery.puzzles.f1, 'reading a puzzle never creates its record');
    FW.act(s, 'f1', 'close');
    t.ok(S.test(s, 'puzzle.f1') && S.test(s, 'puzzle.f1.screen=closed') && S.test(s, 'puzzle.f1.screen!=swing'), 'conditions follow the state');
    FW.act(s, 'f1', 'clamp');
    t.ok(S.test(s, 'puzzle.f1=done') && S.test(s, 'keepsake.reed_boat'), 'puzzle.f1=done and keepsake.reed_boat');
    t.ok(S.test(s, 'weave') === false, '`weave` is false before any word is known');
    s.words.push('mamoru');
    t.ok(S.test(s, 'weave'), '`weave` once a word is known');
  }

  // ---- saves: invalid state is repaired puzzle by puzzle, nothing else is touched --------------------------------------------
  {
    const s = fresh();
    s.discovery.puzzles = {
      f1: { state: { screen: 'upside-down', held: false, clamp: 'open' }, done: false, seen: { draft: 1 } },
      f2: { state: { float: 'slot', level: 'low', vent: 'shut', catch: 'on', bound: false }, done: true, method: 'cranked' },
      f3: { state: { support: 'none', light: 'top' }, done: true },
      f9: { anything: true },
      f4: 'broken',
    };
    s.discovery.keepsakes = { glass_leaf: { t: 1 } };
    const before = JSON.stringify(s.flags) + JSON.stringify(s.quests);
    RB.save.migrate(s);
    const P = s.discovery.puzzles;
    t.eq(P.f1.state, FW.get('f1').init, 'an impossible value goes back to the documented start');
    t.ok(P.f1.seen.draft && P.f1.repaired === 'start', 'what was observed is kept, and the repair is noted');
    t.eq([P.f2.state.float, P.f2.method, !!P.f2.repaired], ['slot', 'cranked', false], 'a valid finished state is left alone');
    t.eq([P.f3.state, P.f3.done, P.f3.repaired], [FW.get('f3').solved, true, 'solved'], 'a finished puzzle whose state does not meet its outcome gets the solved arrangement, still finished');
    t.eq(P.f9, { anything: true }, 'an unknown puzzle id is kept and ignored');
    t.eq(P.f4.state, FW.get('f4').init, 'a record of the wrong shape becomes a fresh start');
    t.ok(s.discovery.keepsakes.glass_leaf && JSON.stringify(s.flags) + JSON.stringify(s.quests) === before, 'keepsakes, flags and quests are untouched');
    const once = JSON.stringify(s.discovery);
    RB.save.migrate(s);
    t.eq(JSON.stringify(s.discovery), once, 'repair is idempotent');
  }

  // ---- companion reactions: all four companions, every method, a fallback ---------------------------------------------------
  {
    const R = RB.company.reactions;
    for (const d of FW.list()) for (const comp of ['nao', 'mio', 'ren', 'suzu']) {
      for (const m of d.methods) t.ok(R.some((r) => r.event === 'puzzle:' + d.id && r.comp === comp && r.facts && r.facts.method === m.id), d.id + ': ' + comp + ' reacts to ' + m.id);
      t.ok(R.some((r) => r.event === 'puzzle:' + d.id && r.comp === comp && !r.facts), d.id + ': ' + comp + ' has a plain fallback');
    }
    const s = fresh({ comp: 'ren' });
    const a = RB.company.react(s, { id: 'puzzle:f3:done', event: 'puzzle:f3', facts: { method: 'mixed' } });
    const b = RB.company.react(s, { id: 'puzzle:f3:done', event: 'puzzle:f3', facts: { method: 'ordinary' } });
    t.ok(a && a.id === 'f3.ren.mixed' && b.id === a.id, 'the reaction matches the method and stays the same once chosen');
    t.ok(R.filter((r) => /^f\d/.test(r.id)).every((r) => r.lines.length === 1), 'first reactions are one line (brief)');
  }

  // ---- keepsakes ----------------------------------------------------------------------------------------------------------
  {
    const mine = ['reed_boat', 'cork_float', 'glass_leaf', 'snow_toggle', 'bell_clapper', 'paperweight'];
    for (const id of mine) {
      const k = RB.content.keepsakes[id];
      t.ok(k && k.name.jp && k.name.en && k.desc.en && k.region && k.source && k.source.kind === 'puzzle' && k.hint.broad.en && k.hint.specific.en && typeof k.art === 'function', 'keepsake ' + id + ' has the full schema');
      // the painted pixels of the 32x32 cell (not the number of calls: some art uses long runs)
      const px = new Set();
      const g = { fillRect(x, y, w, h) { for (let i = x; i < x + w; i++) for (let j = y; j < y + h; j++) if (i >= 0 && j >= 0 && i < 32 && j < 32) px.add(i + ',' + j); }, set fillStyle(v) { this._f = v; }, get fillStyle() { return this._f; } };
      k.art(g);
      t.ok(px.size > 150 && px.size < 32 * 32, 'keepsake ' + id + ' draws its own pixel art (' + px.size + ' of 1024 pixels)');
    }
    t.eq(mine.map((id) => RB.content.keepsakes[id].source.id), IDS, 'each field puzzle gives exactly one keepsake');
  }

  // ---- map placement: objects on the maps, reachable to stand at, clear of exits ---------------------------------------------
  for (const d of FW.list()) {
    const s = fresh(); if (d.id === 'f6') s.flags.sa_done = true;
    const m = RB.maps.compile(d.map);
    for (const k in d.objects) {
      const o = d.objects[k];
      const inside = o.x >= 0 && o.y >= 0 && o.x + o.w <= m.w && o.y + o.h <= m.h;
      t.ok(inside && !RB.maps.exitAt(m, o.x, o.y), d.id + '.' + k + ': inside the map and not on an exit');
      // someone can stand next to it
      let stand = false;
      for (let x = o.x - 1; x <= o.x + o.w; x++) for (let y = o.y - 1; y <= o.y + o.h; y++) {
        const edge = (x === o.x - 1 || x === o.x + o.w) !== (y === o.y - 1 || y === o.y + o.h);
        if (edge && !RB.maps.blockedStatic(m, x, y)) stand = true;
      }
      t.ok(stand, d.id + '.' + k + ': there is a free tile beside it');
    }
    const npcBlocked = (RB.content.maps[d.map].npcs || []).filter((n) => !n.if || S.test(s, n.if)).filter((n) => RB.maps.blockedStatic(m, n.x, n.y));
    t.eq(npcBlocked.map((n) => n.id), [], d.id + ': no one stands on a blocked tile of ' + d.map);
  }

  // ---- the Mill Road: exactly two ways through, either enough, nobody trapped ----------------------------------------------------
  {
    const reach = (flags, from, allowNorthboundTrigger) => {
      const s = fresh(); s.flags.rw_mill_open = true;
      for (const f of flags) s.flags[f] = true;
      RB.maps.invalidate();
      const m = RB.maps.compile('rw.millroad');
      const trig = m.triggers.filter((tr) => !tr.if || S.test(s, tr.if));
      const inTrig = (x, y) => trig.some((tr) => x >= tr.x && x < tr.x + tr.w && y >= tr.y && y < tr.y + tr.h);
      const seen = new Set([from.join(',')]), q = [from];
      while (q.length) {
        const [x, y] = q.shift();
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
          if (seen.has(k) || RB.maps.blockedStatic(m, nx, ny)) continue;
          // the narrows push back only whoever walks up into them
          if (dy === -1 && inTrig(nx, ny) && !allowNorthboundTrigger) continue;
          seen.add(k); q.push([nx, ny]);
        }
      }
      return { seen, m };
    };
    const combos = [[], ['rw_mr_nao'], ['rw_mr_suzu'], ['rw_mr_nao', 'rw_mr_suzu'], ['rw_echo_done'], ['rw_mr_obs_echo', 'rw_mr_obs_reeds']];
    const standable = new Set([...reach(['rw_mr_nao', 'rw_echo_done'], [10, 24], true).seen, ...reach([], [9, 5], true).seen]);
    t.ok(standable.has('9,5') && standable.has('6,12') && !standable.has('15,1'), 'Mill Road: the tiles one can stand on include the mill door and the narrows, not the closed pond pocket');
    for (const f of combos) {
      const { seen, m } = reach(f, [10, 24]);
      const open = f.some((x) => x === 'rw_mr_nao' || x === 'rw_mr_suzu' || x === 'rw_echo_done');
      t.eq(seen.has('9,5'), open, 'Mill Road ' + JSON.stringify(f) + ': the mill door is ' + (open ? '' : 'not ') + 'reachable from the village road');
      // every tile anyone can stand on above the ridge (reached from the road with every way
      // open, or from the mill door) can walk back down to the village exit; the pond behind
      // the wheel is a closed pocket nobody can ever enter, before or after this change
      const back = [];
      for (let y = 0; y < 13; y++) for (let x = 0; x < m.w; x++) if (standable.has(x + ',' + y) && !RB.maps.exitAt(m, x, y)) {
        const r = reach(f, [x, y]);
        if (!r.seen.has('10,25') && !r.seen.has('11,25')) back.push(x + ',' + y);
      }
      t.eq(back, [], 'Mill Road ' + JSON.stringify(f) + ': no tile on the mill side is cut off from the way home (legacy positions, the mill door)');
    }
    // the ridge has exactly two openings, each one tile wide
    const s = fresh(); RB.maps.invalidate();
    const m = RB.maps.compile('rw.millroad');
    const gaps = [];
    for (let x = 0; x < m.w; x++) if ([13, 14, 15, 16].every((y) => !m.block[y * m.w + x])) gaps.push(x);
    t.eq(gaps, [6, 12], 'Mill Road: the ridge (rows 13-16) opens only at the narrows (x 6) and the animal track (x 12)');
    t.ok([14, 15, 16, 17].every((y) => RB.maps.blockedStatic(m, 12, y)) && (m.def.props || []).filter((p) => p.p === 'reeds' && p.x === 12).length === 4, 'Mill Road: the reed bed that closes the track is drawn where it blocks');
    t.ok(m.triggers.some((tr) => tr.x === 6 && tr.y === 16 && tr.scene === 'rw.mr_narrows'), 'Mill Road: the narrows trigger sits at its only mouth');
    s.flags.rw_mr_nao = true;
    t.ok(!RB.maps.blockedStatic(m, 12, 15), 'Mill Road: Nao\'s clearing opens the track');
    RB.maps.invalidate();
  }

  // ---- the Japanese of all the data: furigana everywhere, every token in a dictionary ----------------------------------------------
  {
    const errs = [], unknown = new Map();
    const jcheck = (line, where) => {
      if (!line) return;
      for (const p of RB.jp.validate(line)) errs.push(where + ': ' + (p.msg || JSON.stringify(p)));
      for (const tk of RB.jp.parse(line)) {
        if (tk.punct || tk.ph || !/[぀-ヿ一-鿿]/.test(tk.surface)) continue;
        let info; try { info = RB.jp.lookup(tk); } catch (e) { info = { unknown: true }; }
        if (info.unknown && !unknown.has(tk.surface)) unknown.set(tk.surface, where);
      }
    };
    const walk = (o, where) => {
      if (!o || typeof o !== 'object') return;
      if (Array.isArray(o)) { o.forEach((x, i) => walk(x, where + '[' + i + ']')); return; }
      if (typeof o.jp === 'string') { jcheck(o.jp, where); if (!o.en && !/name|folders|slips/.test(where)) errs.push(where + ': no English'); }
      for (const k in o) if (k !== 'jp' && o[k] && typeof o[k] === 'object') walk(o[k], where + '.' + k);
    };
    for (const d of FW.list()) {
      walk(d, 'puzzle ' + d.id);
      // computed text: every looks' function and the filing check, in the states they describe
      const states = [d.init, d.solved];
      for (const st of states) for (const k in d.objects) for (const l of d.objects[k].look || []) if (typeof l.fn === 'function') walk(l.fn(st, { done: true }), d.id + '.' + k + ' computed');
      for (const r of d.rules) if (typeof r.say === 'function') for (const st of states) walk(r.say(st, st), d.id + ' ' + r.id + ' computed');
      if (d.check) for (const st of [d.init, d.solved, Object.assign({}, d.solved, { s1: 'up', s2: 'down', s3: 'held' }), Object.assign({}, d.solved, { marks: 'hidden' })]) walk(d.check(st), d.id + ' check');
    }
    for (const r of RB.company.reactions.filter((x) => /^f\d\./.test(x.id))) walk(r, 'reaction ' + r.id);
    for (const id in RB.content.keepsakes) walk(RB.content.keepsakes[id], 'keepsake ' + id);
    for (const k in FW.PLAIN) walk(FW.PLAIN[k], 'plain ' + k);
    t.eq(errs, [], 'every Japanese string in the discovery data has furigana on every kanji (and English beside it)');
    t.eq([...unknown.keys()], [], 'every token in the discovery data has a dictionary entry');
  }

  // ---- the weave's language step accepts kana and kanji through the real checker ------------------------------------------------
  {
    for (const id of ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'ishi', 'honoo', 'suzu', 'koe']) {
      const w = RB.content.words[id];
      const step = { kind: 'write', answer: w.r, accept: [w.r, RB.tasks.plain(w.jpK || w.jp)], mode: 'reading' };
      t.ok(RB.challenge.check(w.r, step).ok && RB.challenge.check(RB.tasks.plain(w.jpK), step).ok && !RB.challenge.check('あいう', step).ok, 'the weave step for ' + id + ' uses the real answer checker (kana, kanji; a wrong answer is wrong)');
    }
    t.eq(Object.keys(FW.FAMILY).sort(), Object.keys(RB.content.words).sort(), 'every inscription word has an explicit response family');
  }
};
