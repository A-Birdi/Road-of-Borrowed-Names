// The exploration actions in a journey (C-87, LW-07; src/content/zzz_verbs/ over src/engine/55b_verbs.js): the
// production instances, not the fixtures, on the built game in synthetic journey states (isolated profiles):
//  - each is absent before its own gate and opens its sheet from its own prop once the gate holds (the world waits);
//  - one of each kind played to its outcome with real clicks: a notice at Manybridge's noodle stalls people follow
//    (and they move), the barges' courier round, the vent pipe's repair (the steam stops), the Understage's lift watched
//    and adjusted, the ferry scene blocked on Playhouse Row's stage, East Landing's old plan compared at its marks, a
//    Leafling moved off the keepers' path by a word, the Undercroft's sluices worked across three maps, the coast's post
//    by sea, the Steam Vents' dampers (steam, not water) and the Root Hollows' tide;
//  - phone width: every sheet fits; no errors, no network.
// Usage: node tests/e2e/verbs_journey.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
async function test(name, fn) {
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 300 s')), 300000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1200)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const noOverflow = (p) => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
async function settle(p) {
  for (let i = 0; i < 300; i++) {
    const st = await p.evaluate(() => ({ mode: RB.game.mode(), dlg: RB.ui.dialogue.isOpen(), ch: document.querySelectorAll('.choice').length, sheet: !!document.querySelector('.verb-sheet') }));
    if (st.sheet) return;
    if (st.mode === 'world' && !st.dlg && !st.ch) { await p.waitForTimeout(120); if (await p.evaluate(() => RB.game.mode() === 'world' && !RB.ui.dialogue.isOpen())) return; continue; }
    if (st.ch) await p.evaluate(() => document.querySelector('.choice').click());
    else if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(60);
  }
  throw new Error('the world did not come back: ' + await p.evaluate(() => RB.game.mode()));
}

// A journey state where an action's gate holds (or, with `before`, where it does not), standing beside its prop on its
// map (`at`: { map, x, y } to stand somewhere else, a network's other gates; `keep`: go there in the same journey). The gate's plain terms are made true:
// flags, quest.<id>=done, ed>=2 (a twelve-chapter journey). The maps' arrival scenes are marked as met.
async function journey(p, id, o) {
  o = o || {};
  await p.evaluate(async ([id, o]) => {
    const spec = RB.verbs.get(id);
    let at = o.at;
    if (!at) {
      if (spec.kind === 'network') { const g = spec.gates[Object.keys(spec.gates)[0]]; at = { map: g.map, x: g.x, y: g.y }; }
      else if (spec.kind === 'route') { const m = spec.means[0].obj; at = { map: spec.map, x: m.x, y: m.y }; }
      else if (spec.kind === 'layers') at = { map: spec.map, x: spec.plan.x, y: spec.plan.y };
      else at = { map: spec.map, x: spec.x, y: spec.y };
    }
    const flags = { departed: true }, quests = {};
    if (!o.before) for (const t of String(spec.if || '').split('&')) {
      let m;
      if ((m = /^quest\.(\w+)=done$/.exec(t))) quests[m[1]] = { stage: 9, done: true };
      else if (/^[A-Za-z_]\w*$/.test(t)) flags[t] = true;
    }
    for (const mid of Object.keys(RB.content.maps)) for (const ev of RB.content.maps[mid].onEnter || []) flags['enter:' + mid + ':' + ev.scene] = true;
    const m = RB.maps.compile(at.map);
    let f = null;
    for (const [dx, dy, dir] of [[0, 1, 'up'], [-1, 0, 'right'], [1, 0, 'left'], [0, -1, 'down']]) {
      const nx = at.x + dx, ny = at.y + dy;
      if (nx >= 0 && ny >= 0 && nx < m.w && ny < m.h && !RB.maps.blockedStatic(m, nx, ny)) { f = { x: nx, y: ny, dir }; break; }
    }
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.lightbulb = false;
    if (o.keep) { await RB.game.transition(at.map, f.x, f.y, f.dir); RB.test.place(f.x, f.y, f.dir); return; } // the same journey, walked on
    const s = RB.game.debugStart(at.map, f.x, f.y, { flags, dir: f.dir, edition: RB.edition.forNew() });
    Object.assign(s.quests, quests);
    for (const w of ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'ishi', 'suzu', 'koe']) if (s.words.indexOf(w) < 0) s.words.push(w);
    RB.world.W.quietUntil = 1e15;
    RB.world.refreshActors();
    await new Promise((r) => setTimeout(r, 300));
    RB.test.place(f.x, f.y, f.dir);
  }, [id, o]);
  await settle(p);
}
// the action's props live on this map now (a gate that holds)
const live = (p, id) => p.evaluate((id) => RB.world.W.map.props.filter((x) => x.o && x.o.vb === id && (!x.if || RB.state.test(RB.game.s, x.if))).length, id);
async function openSheet(p) {
  await p.evaluate(() => RB.world.interact());
  try { await p.waitForSelector('.verb-sheet', { timeout: 8000 }); }
  catch (e) { throw new Error('no sheet: ' + JSON.stringify(await p.evaluate(() => { const W = RB.world.W; return { map: W.map.id, x: W.player.x, y: W.player.y, dir: W.player.dir, mode: RB.game.mode(), dlg: RB.ui.dialogue.isOpen() ? (RB.ui.dialogue.shown() || {}).en : null }; }))); }
  assert(await p.evaluate(() => RB.game.mode() !== 'world'), 'the world waits while the sheet is open');
}
async function closeSheet(p) {
  await p.click('.verb-sheet [data-a="close"]');
  await p.waitForFunction(() => !document.querySelector('.verb-sheet'), null, { timeout: 8000 });
  await settle(p);
}
const said = (p) => p.evaluate(() => (document.querySelector('.vb-said') || {}).textContent || '');
const done = (p) => p.evaluate(() => !!document.querySelector('.vb-done'));
const click = async (p, sel) => { await p.click(sel); await p.waitForTimeout(80); };
const production = (p) => p.evaluate(() => RB.verbs.list().filter((v) => !/^vb_/.test(v.id)).map((v) => v.id));

await test('every exploration action of the journey: absent before its gate, its sheet from its own prop after', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const all = await production(p);
  assert(all.length >= 19, 'the production instances are there: ' + all.join(' '));
  // (one whose gate is more than flags and finished quests lives inside another system: Hall wing 3's clock is part
  // of a run, tests/unit/hall_w3.test.mjs)
  const ids = await p.evaluate((all) => all.filter((id) => String(RB.verbs.get(id).if || '').split('&').every((x) => /^(ed>=2|[A-Za-z_]\w*|quest\.\w+=done)$/.test(x))), all);
  assert(ids.length >= all.length - 1, 'all but the Hall\'s are reachable from a journey state here: ' + all.filter((x) => ids.indexOf(x) < 0).join(' '));
  for (const id of ids) {
    await journey(p, id, { before: true });
    assert((await live(p, id)) === 0, id + ': nothing of it before its gate');
    await journey(p, id);
    assert((await live(p, id)) > 0, id + ': its prop once the gate holds');
    await openSheet(p);
    assert(await noOverflow(p), id + ': the sheet fits');
    await closeSheet(p);
  }
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  assert(!requests.length, 'no network: ' + requests.join(' '));
  await ctx.close();
});

await test('a notice at the noodle stalls; the barges\' round; the vent pipe mended', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  // the notice: "in front of the bridge" is followed and makes it worse; "in front of the stalls" works
  await journey(p, 'mb_vb_queue');
  await openSheet(p);
  await click(p, '[data-g="where"][data-v="bridge"]'); await click(p, '[data-g="do"][data-v="line"]'); await click(p, '[data-a="post"]');
  assert(!(await done(p)) && (await said(p)).length > 10, 'a notice followed to the letter that does not help: not done (' + await said(p) + ')');
  await click(p, '[data-g="where"][data-v="front"]'); await click(p, '[data-a="post"]');
  assert(await done(p), 'in front of the stalls, in single file: done');
  await closeSheet(p);
  await p.waitForTimeout(2500);
  const people = await p.evaluate(() => RB.world.W.npcs.filter((n) => /^vbp_mb_vb_queue/.test(n.id)).map((n) => [n.x, n.y]));
  assert(people.length >= 3 && people.every(([x, y]) => y >= 26), 'the customers have moved down to the stalls: ' + JSON.stringify(people));
  // the barges: a plan that reaches everyone
  await journey(p, 'mb_vb_barges');
  await openSheet(p);
  for (const [g, v] of [['leg0', 'tally'], ['leg1', 'tally'], ['leg2', 'tally']]) await click(p, `[data-g="${g}"][data-v="${v}"]`);
  await click(p, '[data-a="check"]');
  assert(await p.evaluate(() => document.querySelectorAll('.ar-list li.no').length >= 1), 'a round that misses someone says who, and where they are');
  for (const [g, v] of [['leg0', 'kawaya'], ['leg1', 'tally'], ['leg2', 'fujiya']]) await click(p, `[data-g="${g}"][data-v="${v}"]`);
  await click(p, '[data-a="go"]');
  assert(await done(p), 'Kawaya, the Tally Exchange, Fujiya: everyone reached');
  await closeSheet(p);
  // the vent pipe: the wrong tool explained, the steps in order, tested; the steam stops
  await journey(p, 'yn_vent_pipe');
  const steamy = () => p.evaluate(() => RB.world.W.map.props.some((x) => x.p === 'yn_steam' && /puzzle\.yn_vent_pipe/.test(x.if || '') && RB.state.test(RB.game.s, x.if)));
  const steam0 = await steamy();
  assert(steam0, 'steam hisses from the joint');
  await openSheet(p);
  await click(p, '[data-a="read"]');
  await click(p, '[data-g="tool"][data-v="spanner"]'); await click(p, '[data-a="use"][data-part="valve"]');
  assert(!(await done(p)) && (await said(p)).length > 5, 'the wrong tool: explained, nothing changed');
  for (const [tl, pt] of [['handle', 'valve'], ['hemp', 'joint'], ['spanner', 'clamp']]) { await click(p, `[data-g="tool"][data-v="${tl}"]`); await click(p, `[data-a="use"][data-part="${pt}"]`); }
  await click(p, '[data-a="test"]');
  assert(await done(p), 'mended and tested');
  await closeSheet(p);
  assert(!(await steamy()), 'and the steam has stopped');
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('the Understage\'s lift; the ferry scene blocked; East Landing\'s old plan', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await journey(p, 'mp_koseri');
  await openSheet(p);
  await click(p, '[data-a="play"]');
  for (let k = 0; k < 3; k++) {
    const note = await p.$('.verb-sheet [data-a^="note:"]');
    if (note) await click(p, '.verb-sheet [data-a^="note:"]');
    await click(p, '[data-a="step"]');
  }
  await click(p, '[data-a="adjust:weight"]');
  assert(!(await done(p)), 'a second weight: not what it needs');
  for (const a of ['cord', 'spring']) await click(p, `[data-a="adjust:${a}"]`);
  await p.waitForTimeout(200);
  if (!(await done(p))) { await click(p, '[data-a="adjust:weight"]'); } // (the decoy taken off again, where the sheet keeps it)
  assert(await done(p), 'the cord on its cam and a new spring: the lift waits, rises on the cue and holds');
  await closeSheet(p);
  // the stage: the boat front kamite, the boatman beside it, the daughter at the back in the middle, the lantern by her
  await journey(p, 'mp_vb_stage');
  await openSheet(p);
  for (const [pc, cell] of [['boat', '4,2'], ['sendo', '3,2'], ['hina', '2,0'], ['lantern', '1,0'], ['saku', 'wing:left']]) { await click(p, `[data-g="piece"][data-v="${pc}"]`); await click(p, `[data-cell="${cell}"]`); }
  assert(await p.evaluate(() => document.querySelector('.vb-cell[data-cell="0,0"]').disabled), 'nobody stands in the scenery');
  await click(p, '[data-a="rehearse"]');
  await p.waitForFunction(() => document.querySelector('.vb-done'), null, { timeout: 10000 });
  await closeSheet(p);
  // the old plan: compared where its marks are, then concluded
  // walk into a mark's place from just outside it (its trigger's area, from a free tile beside it)
  const compare = async (mk) => {
    const how = await p.evaluate((mk) => {
      const W = RB.world.W, m = W.map, tr = m.triggers.find((x) => x.vb === 'el_old_plan' && x.mark === mk);
      const inside = (x, y) => x >= tr.x && x < tr.x + tr.w && y >= tr.y && y < tr.y + tr.h;
      const D = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
      for (let y = tr.y; y < tr.y + tr.h; y++) for (let x = tr.x; x < tr.x + tr.w; x++) {
        if (RB.maps.blockedStatic(m, x, y)) continue;
        for (const d in D) {
          const ox = x - D[d][0], oy = y - D[d][1];
          if (inside(ox, oy) || ox < 0 || oy < 0 || ox >= m.w || oy >= m.h || RB.maps.blockedStatic(m, ox, oy)) continue;
          RB.test.place(ox, oy, d); W.player.dir = d; RB.world._tryMove(d);
          return [ox, oy, d];
        }
      }
      return null;
    }, mk);
    assert(how, 'a way into the ' + mk + '\'s place');
    for (let i = 0; i < 40 && !(await p.evaluate(() => RB.ui.dialogue.isOpen())); i++) await p.waitForTimeout(50);
    const line = await p.evaluate(() => (RB.ui.dialogue.shown() || {}).en || '');
    assert(line.length > 10, 'at the ' + mk + ', the comparison is made there: ' + line);
    await settle(p);
  };
  await journey(p, 'el_old_plan');
  await openSheet(p); // the plan, looked at first: then its marks can be compared where they are
  assert(await p.evaluate(() => document.querySelectorAll('.vb-plan .vb-oldmark').length === 3), 'the plan\'s three marks over today\'s landing');
  await closeSheet(p);
  await compare('wall');
  await compare('workshop');
  await journey(p, 'el_old_plan', { keep: true });
  await openSheet(p);
  await click(p, '[data-a="conclude:wall"]');
  assert(await done(p), 'the breakwater fell: concluded from what was seen');
  await closeSheet(p);
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('a Leafling moved by a word; the Undercroft\'s sluices across three maps', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await journey(p, 'ko_leafling');
  const before = await p.evaluate(() => RB.world.W.foes.filter((f) => /^vbf_/.test(f.id)).map((f) => f.home.join(',')));
  assert(before.length === 1 && before[0] === '18,10', 'the Leafling sits on the keepers\' path: ' + before.join(' '));
  await openSheet(p);
  await click(p, '[data-a="weave"]');
  await p.waitForFunction(() => RB.weave.isOpen(), null, { timeout: 8000 });
  assert((await p.evaluate(() => RB.weave.state().targets)).some((x) => x === 'ko_leafling.current'), 'handed over to the Weave sheet, the rising air among its targets');
  await p.evaluate(() => RB.weave.close());
  await settle(p);
  await p.evaluate(() => { RB.fieldweave.weave(RB.game.s, 'ko_leafling', 'current', 'kaze', { mode: 'choice' }); RB.world.refreshActors(); });
  await p.waitForTimeout(300);
  const after = await p.evaluate(() => RB.world.W.foes.filter((f) => /^vbf_/.test(f.id)).map((f) => f.home.join(',')));
  assert(after.length === 1 && after[0] === '25,13', 'wind on the rising air: it sits by the leaf heap now: ' + after.join(' '));
  // the sluices: open ga (the Upper Basin into the west), open gb (west into east), shut ga, open and shut gc (east into
  // the lock: the shallows flood, then the lock drains down), open gd
  let started = false;
  const at = async (gate, acts) => {
    const g = await p.evaluate((gate) => { const x = RB.verbs.get('mb_under_sluices').gates[gate]; return { map: x.map, x: x.x, y: x.y }; }, gate);
    await journey(p, 'mb_under_sluices', { at: g, keep: gate !== 'ga' || started });
    started = true;
    await openSheet(p);
    for (const a of acts) await click(p, `[data-a="${a}"]`);
  };
  await at('ga', ['open:ga']); await closeSheet(p);
  await at('gb', ['open:gb']); await closeSheet(p);
  await at('ga', ['shut:ga']); await closeSheet(p);
  await at('gc', ['open:gc', 'shut:gc', 'open:gd']);
  assert(await done(p), 'both channel basins at half, the shallows clear: done');
  await closeSheet(p);
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('the coast\'s post by sea; the vents\' dampers; the roots\' tide', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  // the mailbag: three tides, four letters, each addressee where the letter's tag says
  await journey(p, 'sea_vb_post');
  await openSheet(p);
  for (const [g, v] of [['leg0', 'manybridge'], ['leg1', 'eastlanding'], ['leg2', 'sazanami']]) await click(p, `[data-g="${g}"][data-v="${v}"]`);
  await click(p, '[data-a="go"]');
  assert(await done(p), 'Manybridge, East Landing, Sazanami: every letter delivered');
  await closeSheet(p);
  // a network worked gate by gate, walking between its maps in one journey
  const run = async (id, steps) => {
    let first = true;
    for (const [gate, acts] of steps) {
      const g = await p.evaluate(([id, gate]) => { const x = RB.verbs.get(id).gates[gate]; return { map: x.map, x: x.x, y: x.y }; }, [id, gate]);
      await journey(p, id, { at: g, keep: !first });
      first = false;
      await openSheet(p);
      for (const a of acts) await click(p, `[data-a="${a}"]`);
      if (steps[steps.length - 1][0] !== gate || steps[steps.length - 1][1] !== acts) await closeSheet(p);
    }
  };
  // the steam: the Kettle's breath into the hub, a third each to the two houses, the lid open to the sky
  await run('yn_vent_air', [['da', ['open:da', 'open:db', 'shut:da']], ['dc', ['open:dc']], ['db', ['shut:db']], ['dc', ['shut:dc', 'open:dd']]]);
  assert(await done(p), 'both houses\' pipes at half, the stair foot clear: done');
  assert(/steam/i.test(await p.evaluate(() => document.querySelector('.verb-sheet').textContent)) && !/under water/.test(await p.evaluate(() => document.querySelector('.verb-sheet').textContent)), 'the sheet speaks of steam, not water');
  await closeSheet(p);
  // the tide: in by the sea gate to the Whispering Hollow, across to the Long Way Round, the channel let out to the crack
  await run('ko_root_tide', [['g1', ['open:g1']], ['g2', ['open:g2']], ['g1', ['shut:g1']], ['g3', ['open:g3']], ['g2', ['shut:g2']], ['g5', ['open:g5']]]);
  assert(await done(p), 'half in each root pool, the root bridge out of the tide: done');
  await closeSheet(p);
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await b.close();
srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
