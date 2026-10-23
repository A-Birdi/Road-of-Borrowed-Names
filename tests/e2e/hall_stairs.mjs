// RBN-QA-164 (Agnes 6375619829): the Hall of a Hundred Tales' stairs, in the browser, with throwaway journeys after the
// story, walking as a player does (the real movement code: exits, conditions). On each of the twenty floors with a way up:
//  1. the floor cleared: from beside the stairs as drawn, one step onto them takes you up, to the next floor;
//  2. the floor not yet cleared (standing past the rope, as no player can): the step lands on the stairs and nothing
//     more, the way stays shut;
//  3. the first wing's first floor, through a save and a load: cleared, the stairs take you up; not cleared, they don't;
//  4. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/hall_stairs.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const errorsAll = [];
const DONE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true, postgame: true, hall_ledger: true, hall_foyer_seen: true, ngp_offered: true };

// a journey on that floor, standing beside its stairs (as drawn), the floor cleared or not; returns the step to take
async function beside(p, id, clear) {
  return p.evaluate(async ([id, clear, DONE]) => {
    const m = RB.content.maps[id], st = m.props.find((q) => q.p === 'stairs'), cm = RB.maps.compile(id);
    const [w, f] = id.match(/^hall\.(w\d+)f(\d)$/).slice(1);
    let from = null;
    for (const [dx, dy, dir] of [[0, 1, 'up'], [1, 0, 'left'], [-1, 0, 'right'], [0, -1, 'down']]) {
      const x = st.x + dx, y = st.y + dy;
      if (!RB.maps.blockedStatic(cm, x, y) && !RB.maps.exitAt(cm, x, y) && !m.props.some((q) => q.x === x && q.y === y && (RB.props.P[q.p] || {}).block !== false)) { from = { x, y, dir }; break; }
    }
    if (!from) return { err: 'no free tile beside the stairs' };
    const flags = Object.assign({}, DONE);
    for (const mid in RB.content.maps) for (const ev of RB.content.maps[mid].onEnter || []) flags['enter:' + mid + ':' + ev.scene] = true;
    for (let k = 1; k <= 10; k++) for (const n of [1, 2, 3]) flags['hall_w' + k + '_f' + n + '_seen'] = true;
    const s = RB.game.debugStart(id, from.x, from.y, { dir: from.dir, comp: null, flags });
    s.edition = 2; s.learn.kanaKnown = 'both';
    // (the floor cleared: its trials done, as the Hall's record keeps them)
    if (clear) for (const t of RB.hall.floorTrials(w, +f - 1)) RB.hall.wrec(s, w).trials[t.id] = true;
    const shut = RB.state.test(s, 'hall.' + w + '.f' + (+f - 1) + '.clear') !== clear;
    if (shut) return { err: 'the floor\'s clear state did not take' };
    RB.world.refreshActors && RB.world.refreshActors();
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice';
    RB.test.enable();
    await new Promise((r) => setTimeout(r, 400));
    return { stairs: [st.x, st.y], from, next: 'hall.' + w + 'f' + (+f + 1) };
  }, [id, clear, DONE]);
}
const stepOn = (p, dir) => p.evaluate(async (dir) => {
  await RB.test.step(dir);
  await RB.test.idle();
  const W = RB.world.W;
  return { map: W.map.id, at: [W.player.x, W.player.y] };
}, dir);

const FLOORS = [];
for (let w = 1; w <= 10; w++) FLOORS.push('hall.w' + w + 'f1', 'hall.w' + w + 'f2');

// ---- 1. and 2. ---------------------------------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const up = [], shut = [];
  for (const id of FLOORS) {
    const a = await beside(p, id, true);
    if (a.err) { up.push(id + ': ' + a.err); continue; }
    const r = await stepOn(p, a.from.dir);
    if (r.map !== a.next) up.push(id + ': stairs ' + a.stairs + ', stepped ' + a.from.dir + ' from ' + a.from.x + ',' + a.from.y + ', now on ' + r.map + ' at ' + r.at);
    const c = await beside(p, id, false);
    if (c.err) { shut.push(id + ': ' + c.err); continue; }
    const q = await stepOn(p, c.from.dir);
    if (!(q.map === id && q.at[0] === c.stairs[0] && q.at[1] === c.stairs[1])) shut.push(id + ': now on ' + q.map + ' at ' + q.at);
  }
  ok(!up.length, 'the floor cleared: one step onto the stairs as drawn takes you up, on all twenty floors' + (up.length ? ' (' + up.length + ' not: ' + up.slice(0, 4).join(' | ') + ')' : ''));
  ok(!shut.length, 'the floor not cleared: the step lands on the stairs and the way stays shut, on all twenty' + (shut.length ? ' (' + shut.slice(0, 4).join(' | ') + ')' : ''));
  errorsAll.push(...errors); await ctx.close();
}
// ---- 3. through a save and a load ------------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const res = {};
  for (const clear of [true, false]) {
    const a = await beside(p, 'hall.w1f1', clear);
    const ld = await p.evaluate(async () => { try { await RB.save.manualSave(3); await RB.game.toTitle(); await RB.game.loadCampaign(3, 'manual'); RB.test.enable(); await new Promise((r) => setTimeout(r, 800)); return 'loaded'; } catch (e) { return 'failed: ' + e.message; } });
    const back = await p.evaluate(() => ({ map: RB.world.W.map.id, at: [RB.world.W.player.x, RB.world.W.player.y], clear: RB.state.test(RB.game.s, 'hall.w1.f0.clear') }));
    const r = await stepOn(p, a.from.dir);
    res[clear ? 'cleared' : 'not cleared'] = { ld, back, now: r.map };
  }
  ok(res.cleared.ld === 'loaded' && res.cleared.back.map === 'hall.w1f1' && res.cleared.back.clear && res.cleared.now === 'hall.w1f2' &&
    res['not cleared'].ld === 'loaded' && !res['not cleared'].back.clear && res['not cleared'].now === 'hall.w1f1',
    'the first floor through a save and a load: cleared, the stairs take you up; not cleared, they do not (' + JSON.stringify(res) + ')');
  errorsAll.push(...errors); await ctx.close();
}

ok(!errorsAll.length, 'no page errors' + (errorsAll.length ? ': ' + errorsAll.slice(0, 3).join(' | ') : ''));
await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
