// The Living World on the journey's own content (C-87; docs/future/work/LW1_ROLLOUT.md), in Chromium on the built
// game: ordinary URL (no development switch), throwaway sessions, nothing synthetic put in.
//  - LW-01: Yasu fishes, Tomo folds, Kiyo sells in an ordinary journey; a whole round; a conversation interrupts and
//    the round begins again; Light and shadow Off leaves the work alone; a story's evening and a placement of Yasu
//    elsewhere (by the lost path) carry no work and draw no rod.
//  - LW-02: people at work in several regions: their action plays (several poses), yields to talk, reduced motion
//    holds one pose.
//  - LW-03/04: Reedwake after setting out: Oto in his routine's place, his place's first line said once then his
//    usual talk; Hana asked "Have you seen…?" about him.
//  - LW-05: the Journey names Reedwake as changed after the festival elsewhere.
//  - LW-06: walking onto the Reedwake road from the village: the pedlar's cart; a load on the road: nothing. The
//    flood stone: a hint, then (once waiting is learned) it opens.
//  - LW-08: on the harbour, someone across the map is not "seen" on arrival; brought into view, they are.
//  - LW-09: Ashihara's smith, whose placement moves (same id) when the forge moves while you watch, walks to it.
// Usage: node tests/e2e/living_world.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
async function test(name, fn) {
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 240 s')), 240000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1200)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const DONE = { departed: true, ch1_done: true, sg_arrived: true };
async function start(p, map, x, y, flags, o) {
  await p.evaluate(([map, x, y, flags, o]) => {
    const def = RB.content.maps[map], f = Object.assign({}, flags || {});
    for (const ev of def.onEnter || []) f['enter:' + map + ':' + ev.scene] = true;
    const s = RB.game.debugStart(map, x, y, { comp: 'nao', flags: f, dir: (o && o.dir) || 'down', edition: RB.edition.forNew() });
    if (o && o.vars) Object.assign(s.vars, o.vars);
    if (o && o.slots) { RB.town.rec(s); for (const t in o.slots) s.world.towns[t] = { tick: 1, slots: o.slots[t], leftAt: null, flags: {}, rests: 0 }; }
    RB.world.W.quietUntil = 1e15;
    RB.game.settings.textSpeed = 'instant';
    RB.game.applySettings();
    RB.world.refreshActors();
  }, [map, x, y, flags || {}, o || null]);
  for (let i = 0; i < 100 && await p.evaluate(() => RB.ui.dialogue.isOpen()); i++) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(30); }
  await p.waitForTimeout(500);
}
// the lines said until the world is back (choices: the first)
async function lines(p, max) {
  const out = [];
  for (let i = 0; i < (max || 300); i++) {
    const st = await p.evaluate(() => ({ cur: RB.ui.dialogue.isOpen() ? RB.ui.dialogue.shown() : null, mode: RB.game.mode(), run: RB.script.isRunning(), ch: [...document.querySelectorAll('.choice')].map((c) => c.textContent.trim()) }));
    if (st.ch.length) { out.push({ choice: st.ch }); await p.evaluate(() => document.querySelector('.choice').click()); }
    else if (st.cur) { if (!out.length || out[out.length - 1].en !== st.cur.en) out.push(st.cur); await p.evaluate(() => RB.ui.dialogue.advance(true)); }
    else if (!st.run && st.mode === 'world') return out;
    await p.waitForTimeout(60);
  }
  return out;
}
// face someone and talk: from a free tile beside them, or across their counter
const talkTo = (p, id) => p.evaluate((id) => {
  const W = RB.world.W, n = W.npcs.find((a) => a.id === id), m = W.map;
  const free = (x, y) => !RB.maps.blockedStatic(m, x, y) && !RB.maps.exitAt(m, x, y) && !W.npcs.some((o) => o !== n && o.x === x && o.y === y);
  const counter = (x, y) => (m.def.props || []).some((pr) => (pr.p === 'counter' || pr.across) && x >= pr.x && x < pr.x + ((RB.props.P[pr.p] || {}).w || pr.w || 1) && y === pr.y);
  const D = [[1, 0, 'left'], [-1, 0, 'right'], [0, 1, 'up'], [0, -1, 'down']];
  let at = D.find(([dx, dy]) => free(n.x + dx, n.y + dy));
  if (at) RB.test.place(n.x + at[0], n.y + at[1], at[2]);
  else { at = D.find(([dx, dy]) => counter(n.x + dx, n.y + dy) && free(n.x + 2 * dx, n.y + 2 * dy)); if (!at) return false; RB.test.place(n.x + 2 * at[0], n.y + 2 * at[1], at[2]); }
  RB.world.interact();
  return true;
}, id);

await test('LW-01: Yasu, Tomo and Kiyo at work in an ordinary journey; a round, an interruption, light Off; not on an evening, not away from the pier', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'rw.village', 30, 24, DONE);
  const r = await p.evaluate(() => {
    const W = RB.world.W, y = W.npcs.find((n) => n.id === 'yasu'), t = W.npcs.find((n) => n.id === 'tomo');
    const keys = new Set(), phases = new Set();
    y._act = null;
    const T = 500000, len = RB.worldActs.fishRound(1).reduce((s, q) => s + q[1], 0);
    for (let k = 0; k < len; k += 150) { const f = RB.worldActs.frameOf(y, T + k, false); if (f && f.key) keys.add(f.key.split('/')[0]); phases.add(RB.worldActs.where(y, 'fish', T + k).phase); }
    return { dev: RB.worldLook.allowed(), yasu: RB.worldActs.working(y), tomo: RB.worldActs.working(t), poses: keys.size, phases: [...phases] };
  });
  assert(!r.dev && r.yasu && r.tomo, 'working on the ordinary page: ' + JSON.stringify(r));
  assert(r.poses >= 5 && ['cast', 'wait', 'reel'].every((x) => r.phases.includes(x)), 'a whole round of fishing: ' + JSON.stringify(r));
  // a conversation interrupts, and afterwards the round begins again
  await talkTo(p, 'yasu');
  await p.waitForTimeout(200);
  const mid = await p.evaluate(() => ({ mode: RB.game.mode(), f: RB.worldActs.frameOf(RB.world.W.npcs.find((n) => n.id === 'yasu'), performance.now(), false) }));
  assert(mid.mode !== 'world' && mid.f === null, 'talking: the work yields: ' + JSON.stringify(mid));
  await lines(p);
  await p.waitForTimeout(300);
  const back = await p.evaluate(() => { const y = RB.world.W.npcs.find((n) => n.id === 'yasu'); const t = performance.now(); RB.worldActs.frameOf(y, t, false); return RB.worldActs.where(y, 'fish', t + 10).phase; });
  assert(back === 'ready', 'afterwards it begins again from the start of a round: ' + back);
  const off = await p.evaluate(() => { RB.game.settings.worldLight = false; RB.game.applySettings(); const ok = RB.worldActs.working(RB.world.W.npcs.find((n) => n.id === 'yasu')); RB.game.settings.worldLight = true; RB.game.applySettings(); return ok; });
  assert(off, 'Light and shadow Off does not decide who works');
  // a story's evening: no rod out; Yasu waiting by the lost path: no work there
  await start(p, 'rw.village', 30, 24, Object.assign({ rw_night: true }, DONE));
  assert(await p.evaluate(() => !RB.worldActs.working(RB.world.W.npcs.find((n) => n.id === 'yasu'))), 'on the evening, no fishing');
  await start(p, 'rw.village', 44, 19, DONE, { vars: {} });
  const bank = await p.evaluate(() => { RB.game.s.quests.lq_road = { stage: 4, done: false, t: 1 }; RB.world.refreshActors(); const W = RB.world.W; return { here: W.npcs.map((n) => n.id).filter((x) => /yasu/.test(x)), work: W.npcs.filter((n) => /yasu/.test(n.id)).map((n) => RB.worldActs.kindOf(n, W.map)) }; });
  assert(bank.here.join() === 'yasu_bank' && bank.work.every((k) => k === null), 'Yasu by the lost path: no rod there: ' + JSON.stringify(bank));
  await start(p, 'sg.harbor', 30, 20, Object.assign({ ch2_done: true }, DONE));
  assert(await p.evaluate(() => RB.worldActs.working(RB.world.W.npcs.find((n) => n.id === 'kiyo'))), 'Kiyo at her stall');
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('LW-02: people at work across the regions: the action plays, yields to talk, holds one pose with reduced motion', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const ALL = Object.assign({}, DONE, { ch2_done: true, mb1_done: true, mb2_done: true, mp_sobe_met: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, co_firebreak_cut: true });
  for (const [map, who, x, y] of [['rw.carpenter', 'bunta', 3, 6], ['sg.inn', 'tamae', 7, 6], ['lf.bakery', 'lf_masaru', 4, 5], ['sb.post', 'sousuke', 4, 5], ['mb.exchange', 'mb_masa', 16, 28], ['ko.village', 'ko_hamaji', 12, 25], ['cr.nakayama', 'cr_otaki', 8, 14], ['yn.lower', 'yn_onatsu', 17, 14]]) {
    await start(p, map, x, y, ALL);
    const r = await p.evaluate((who) => {
      const a = RB.world.W.npcs.find((n) => n.id === who);
      if (!a) return { err: 'no ' + who };
      const keys = new Set();
      const T = 700000;
      a._pf = null;
      for (let k = 0; k < 16000; k += 200) { const f = RB.perform.frameOf(a, T + k, false); if (f && f.key) keys.add(f.key.split('~')[0]); }
      RB.game.settings.reducedMotion = true; RB.game.applySettings();
      const s1 = JSON.stringify(RB.perform.frameOf(a, T, true)), s2 = JSON.stringify(RB.perform.frameOf(a, T + 5000, true));
      RB.game.settings.reducedMotion = false; RB.game.applySettings();
      return { working: RB.perform.working(a), poses: keys.size, still: s1 === s2 };
    }, who);
    assert(!r.err && r.working && r.poses >= 3 && r.still, map + ' ' + who + ': ' + JSON.stringify(r));
    await talkTo(p, who);
    await p.waitForTimeout(250);
    assert(await p.evaluate((who) => RB.game.mode() !== 'world' && RB.perform.frameOf(RB.world.W.npcs.find((n) => n.id === who), performance.now(), false) === null, who), who + ': talking, the work yields');
    await lines(p);
  }
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('LW-03/04/05: Reedwake after setting out: Oto in his routine\'s place says its line once, then his own; Hana asked after him; the Journey names Reedwake as changed', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'rw.village', 24, 19, DONE, { slots: { reedwake: { oto: 2, kiku: 1, mame: 1 } } });
  const at = await p.evaluate(() => { const o = RB.world.W.npcs.find((n) => (n.def.char || n.id) === 'oto'); return o ? [o.id, o.x, o.y] : null; });
  assert(at && at[1] === 22 && at[2] === 18, 'Oto by the well (his routine\'s second place): ' + JSON.stringify(at));
  await talkTo(p, at[0]);
  const said = await lines(p);
  assert(said.length >= 2 && said[0].who === 'oto' && /well/.test(said[0].en), 'the place\'s own line first: ' + JSON.stringify(said.slice(0, 2)));
  assert(said.slice(1).some((l) => l.who === 'oto' && !/well/.test(l.en || '')), 'then what he always says: ' + JSON.stringify(said));
  await talkTo(p, at[0]);
  const again = await lines(p);
  assert(!again.some((l) => /well/.test(l.en || '')), 'the place\'s line is said once: ' + JSON.stringify(again));
  // Hana, asked after Oto (seen just now), in her teahouse
  await start(p, 'rw.tea', 4, 6, DONE, { slots: { reedwake: { oto: 2, kiku: 1, mame: 1 } } });
  await p.evaluate(() => { RB.town.seen(RB.game.s, 'oto', 'rw.village'); RB.game.s.seen[RB.world.W.npcs.find((n) => n.id === 'hana').def.talk.find((o) => !o.if || RB.state.test(RB.game.s, o.if)).scene] = true; });
  await talkTo(p, 'hana');
  const menu = await p.evaluate(async () => { for (let i = 0; i < 40; i++) { const c = [...document.querySelectorAll('.choice')].map((b) => b.textContent.trim()); if (c.length) return c; if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 60)); } return null; });
  assert(menu && menu.some((c) => /Have you seen/.test(c)), 'Hana can be asked after people: ' + JSON.stringify(menu));
  await p.evaluate(() => [...document.querySelectorAll('.choice')].find((b) => /Have you seen/.test(b.textContent)).click());
  await p.waitForTimeout(200);
  await p.evaluate(() => { const c = [...document.querySelectorAll('.choice')].find((b) => /Oto/.test(b.textContent)); if (c) c.click(); });
  const ans = await lines(p);
  assert(ans.some((l) => l.who === 'hana' && /Oto|just now|over by|Reedwake/.test(l.en || '')), 'Hana answers about Oto: ' + JSON.stringify(ans));
  // the Journey: Reedwake has changed (the festival elsewhere put a printed sheet up)
  await start(p, 'sg.harbor', 30, 20, Object.assign({ ch2_done: true, mb1_done: true, mb2_done: true }, DONE));
  await p.evaluate(() => RB.ui.menu.open('journey'));
  await p.waitForTimeout(400);
  const j = await p.evaluate(() => document.body.textContent.replace(/\s+/g, ' '));
  assert(/Reedwake/.test(j) && /changed/i.test(j), 'the Journey says Reedwake has changed');
  await p.evaluate(() => RB.ui.menu.close());
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('LW-06: walking onto the Reedwake road meets the pedlar (a load on the road does not); the flood stone waits for waiting', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'rw.road', 20, 10, DONE);
  assert(await p.evaluate(() => RB.game.mode() === 'world' && !RB.ui.dialogue.isOpen()), 'starting on the road: no event');
  await start(p, 'rw.village', 2, 30, DONE, { dir: 'left' });
  // (the test's own player answers the wheel card: RB.test's automatic mode solves a challenge's steps)
  await p.evaluate(() => { RB.test.enable(); RB.game.transition('rw.road', 30, 9, 'left'); });
  for (let i = 0; i < 100 && !(await p.evaluate(() => !!RB.game.s.flags.lw_rw_cart_done)); i++) await p.waitForTimeout(200);
  const st = await p.evaluate(() => { RB.test.disable(); return { road: RB.game.s.world.roads.rw_road, said: RB.game.s.backlog.filter((l) => l.who === 'lw_kohachi').length, note: RB.game.s.notebook.some((e) => e.id === 'lw_carters_cards') }; });
  assert(st.said >= 2 && st.road && st.road.unique === 'solved' && st.note, 'walking onto the road: the pedlar\'s cart, the card read, solved, and a note: ' + JSON.stringify(st));
  await lines(p);
  // the flood stone
  await start(p, 'rw.village', 42, 18, DONE, { dir: 'down' });
  await p.evaluate(() => { RB.test.place(42, 18, 'down'); RB.world.interact(); });
  const hint = await lines(p);
  assert(hint.some((l) => /wait/i.test(l.en || '')), 'a hint: ' + JSON.stringify(hint));
  await p.evaluate(() => { RB.game.s.flags.learn_wait = true; RB.test.place(42, 18, 'down'); RB.world.interact(); });
  const open = await lines(p);
  assert(open.some((l) => /came this high/.test(l.en || '')) && await p.evaluate(() => !!RB.game.s.flags.lw_rw_flood_open), 'once waiting is learned, it opens: ' + JSON.stringify(open));
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('LW-08: on the harbour, someone across the map is not "seen" on arrival; brought into view, they are', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, 'sg.harbor', 10, 34, Object.assign({ ch2_done: true }, DONE));
  await p.waitForTimeout(1200);
  const first = await p.evaluate(() => ({ fuku: RB.game.s.world.lastSeen.fuku || null, near: Object.keys(RB.game.s.world.lastSeen) }));
  assert(!first.fuku, 'Fuku, across the harbour, is not seen on arrival: ' + JSON.stringify(first));
  await p.evaluate(() => RB.test.place(47, 11, 'up'));
  await p.waitForTimeout(1500);
  const then = await p.evaluate(() => RB.game.s.world.lastSeen.fuku || null);
  assert(then && then.map === 'sg.harbor', 'walking up to her: seen: ' + JSON.stringify(then));
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('LW-09: the smith\'s placement moves (same id) as the forge moves while you watch: he walks to it; leaving and coming back, he is there', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const AS = Object.assign({}, DONE, { postgame: true, as_arrived: true, as_streets: true, as_dp_noise: true });
  await start(p, 'as.village', 20, 10, AS, { vars: { as_forge: 'hours' }, slots: { ashihara: { as_sho: 1 } } });
  const a0 = await p.evaluate(() => { const a = RB.world.W.npcs.find((n) => n.id === 'as_sho'); return a ? [a.x, a.y] : null; });
  assert(a0 && a0[0] === 13 && a0[1] === 8, 'Shō at the old forge: ' + JSON.stringify(a0));
  await p.waitForTimeout(1200);
  await p.evaluate(() => { RB.game.s.vars.as_forge = 'moved'; RB.world.refreshActors(); });
  const mid = await p.evaluate(() => { const a = RB.world.W.npcs.find((n) => n.id === 'as_sho'); return { home: a.home, x: a.x, y: a.y, route: !!a.route }; });
  assert(mid.home[0] === 33 && mid.home[1] === 9 && (mid.route || (mid.x === 33 && mid.y === 9)), 'his new place, and on his way to it: ' + JSON.stringify(mid));
  for (let i = 0; i < 80; i++) { if (await p.evaluate(() => { const a = RB.world.W.npcs.find((n) => n.id === 'as_sho'); return a.x === 33 && a.y === 9 && !a.route; })) break; await p.waitForTimeout(250); }
  const end = await p.evaluate(() => { const a = RB.world.W.npcs.find((n) => n.id === 'as_sho'); return [a.x, a.y]; });
  assert(end[0] === 33 && end[1] === 9, 'he arrives: ' + JSON.stringify(end));
  await start(p, 'as.village', 20, 10, AS, { vars: { as_forge: 'moved' } });
  const again = await p.evaluate(() => { const a = RB.world.W.npcs.find((n) => n.id === 'as_sho'); return [a.x, a.y]; });
  assert(again[0] === 33 && again[1] === 9, 'coming back, he is there: ' + JSON.stringify(again));
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
