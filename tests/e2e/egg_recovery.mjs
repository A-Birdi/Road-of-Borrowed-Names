// RBN-QA-129 (Agnes 6348612003, 6348665949, 6348899693; Local CL-217; Cloud CC-131): Eggs for Everyone can be finished
// after the valley's story is done. In Chromium on the built game, with throwaway journeys:
//  1. an old save (the 2/3 state Agnes reported: Tsuneji's and Oshige's eggs given, Yasuke's owed, one egg held, the
//     story done), written by the game's own manual save, then loaded with the game's own load: Yasuke stands on the
//     descent at (9,16); the guide marks him and only him (not "can't take this further"); talking to him plays his
//     egg scene and the quest is done; afterwards he no longer stands there and nothing is marked; saved, the page
//     reloaded and that save loaded: still done, still nobody on the descent, still nothing marked. With
//     RB_OLD_PAGE=<a build without the repair> the first save is written by that build in the same browser (an old
//     save in the true sense); without it, by this build from the same state, and the log says which;
//  2. 1/3 with Oshige to give (Tsuneji's given): the guide marks Yasuke and Oshige; her egg; then Yasuke only; his egg;
//     done, nothing marked;
//  3. 1/3 with Tsuneji to give (Yasuke's given): he stands at (22,18); his egg: he walks to the Lower House's door as
//     QA-120 has him do (recorded so, no fallback), the riverbank is empty, and he is not placed by the hearth inside
//     (that ends with the chapter); the guide then marks Oshige only;
//  4. nothing given, after the end, with each companion and none: all three stand where they did and are marked;
//  5. the quest never begun, after the end: neither man stands there (a kept limitation: it cannot be begun late);
//     before the end, the quest under way: both stand as always;
//  6. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/egg_recovery.mjs   (RB_OLD_PAGE=zz_old.html for 1's old save)
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
const OLD = process.env.RB_OLD_PAGE || null;
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const YN = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_called: true, cr_done: true, cr_delivered: true, yn_called: true, yn_kami_seen: true, yn_rooms_done: true, yn_shimo_seen: true, yn_eggs_cooked: true };
const allErrors = [];
const pageAt = (file, opts) => page(b, file ? url + file : url, opts || {});

async function start(p, o) {
  await p.evaluate(([YN, o]) => {
    const f = Object.assign({}, YN, o.done ? { yn_done: true } : {});
    for (const w of o.given || []) f['yn_egg_' + w] = true;
    const s = RB.game.debugStart(o.map, o.x, o.y, { dir: o.dir, edition: RB.edition.forNew(), comp: o.comp || null, flags: f });
    if (!o.comp) s.comp = null;
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    if (o.quest !== 'none') { s.quests.yn_eggs = { stage: 0, done: false, t: Date.now() }; s.inv.yn_eggs = 3 - (o.given || []).length; }
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.suzuSpeech = 'standard'; RB.game.settings.skipSeen = true;
    RB.world.enter(o.map, o.x, o.y, o.dir, { fresh: true });
  }, [YN, o]);
  await settled(p);
}
async function settled(p) {
  await p.waitForFunction(() => RB.world.W && RB.world.W.time - RB.world.W.enteredAt > 1500, null, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(100);
}
async function go(p, map, x, y, dir) {
  await p.evaluate(([map, x, y, dir]) => RB.world.enter(map, x, y, dir, {}), [map, x, y, dir]);
  await settled(p);
}
const guide = (p) => p.evaluate(() => { const r = RB.questGuide.analyse('yn_eggs', RB.game.s); return { how: r.how, t: r.targets.map((e) => e.map + ':' + e.id).sort() }; });
const standing = (p, id) => p.evaluate((id) => RB.world.W.npcs.filter((a) => a.id === id && (a.alpha == null || a.alpha > 0.02)).map((a) => a.x + ',' + a.y), id);
const quest = (p) => p.evaluate(() => ({ q: RB.game.s.quests.yn_eggs || null, eggs: RB.game.s.inv.yn_eggs || 0, flags: ['yasuke', 'tsuneji', 'oshige'].filter((w) => RB.game.s.flags['yn_egg_' + w]), done: !!RB.game.s.flags.yn_done }));
async function play(p) {
  await p.evaluate(() => RB.world.interact());
  const lines = [];
  for (let i = 0; i < 400; i++) {
    const st = await p.evaluate(() => { const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(); return { d: d ? (d.who || '') + ': ' + String(d.en || '').slice(0, 70) : null, run: RB.script.isRunning() }; });
    if (st.d) {
      // (Next on every pass, not only on a new line: at any text speed the first press may only finish showing it)
      if (!lines.length || lines[lines.length - 1] !== st.d) { lines.push(st.d); await p.waitForTimeout(120); }
      await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance());
      await p.waitForTimeout(60);
      continue;
    }
    if (!st.run && lines.length) break;
    await p.waitForTimeout(60);
  }
  await p.waitForTimeout(600);
  return lines;
}
const DESCENT = 'yn.descent:yn_yasuke', LOWER = 'yn.lower:yn_tsuneji', KAMI = 'yn.kami:yn_oshige';
const YAS = /^yn_yasuke: …Warm\. The egg's warm/, ALL = /All three eggs handed out/, OSH = /^yn_oshige: Oh, a spring egg/, TSU = /^yn_tsuneji: …Can I share it/;

// ---- 1. the old save -------------------------------------------------------------------------------------------------
{
  const first = await pageAt(OLD);
  await start(first.p, { map: 'yn.descent', x: 9, y: 17, dir: 'up', done: true, given: ['tsuneji', 'oshige'] });
  const before = { yasuke: await standing(first.p, 'yn_yasuke'), guide: await guide(first.p) };
  await first.p.evaluate(async () => { await RB.save.manualSave(1); });
  console.log('     the old save written by ' + (OLD ? OLD + ' (a build without the repair): there Yasuke ' + JSON.stringify(before.yasuke) + ', guide ' + JSON.stringify(before.guide) : 'this build from the same state (RB_OLD_PAGE not given)'));
  allErrors.push(...first.errors.map((e) => 'old page: ' + e));
  await first.p.close();
  const { p, errors } = await pageAt(null, { context: first.ctx });
  const ld = await p.evaluate(async () => { try { await RB.game.loadCampaign(1, 'manual'); return 'loaded'; } catch (e) { return 'failed: ' + e.message; } });
  // (this page's settings as the other cases' are: device settings, not the save's)
  await p.evaluate(() => { RB.game.settings.textSpeed = 'instant'; RB.game.settings.suzuSpeech = 'standard'; RB.game.settings.skipSeen = true; });
  await settled(p);
  const q0 = await quest(p);
  ok(ld === 'loaded' && q0.done && q0.q && !q0.q.done && q0.eggs === 1 && q0.flags.join() === 'tsuneji,oshige', 'the old save loads with the story done, the quest open, one egg held, Tsuneji\'s and Oshige\'s given (' + ld + ' ' + JSON.stringify(q0) + ')');
  ok((await standing(p, 'yn_yasuke')).join() === '9,16', 'Yasuke stands on the descent at (9,16)');
  const g0 = await guide(p);
  ok(g0.how !== 'waiting' && g0.t.join() === DESCENT, 'the guide marks Yasuke and only him (' + JSON.stringify(g0) + ')');
  const lines = await play(p);
  const q1 = await quest(p);
  ok(lines.some((l) => YAS.test(l)) && lines.some((l) => ALL.test(l)) && q1.q && q1.q.done && q1.eggs === 0, 'his egg scene plays and the quest is done (' + JSON.stringify(lines.slice(0, 4)) + ')');
  // (his own egg is recorded given, beside the other two: Local CL-235)
  ok(q1.flags.join() === 'yasuke,tsuneji,oshige', 'his egg is recorded given (yn_egg_yasuke), with the other two (' + q1.flags.join() + ')');
  await p.waitForTimeout(3000);
  const after = await p.evaluate(() => ({ npcs: RB.world.W.npcs.filter((a) => a.id === 'yn_yasuke' && (a.alpha == null || a.alpha > 0.02)).length, dep: RB.world.W.departures.filter((d) => d.id === 'yn_yasuke').pop() || null }));
  ok(after.npcs === 0, 'afterwards he no longer stands there (his going recorded as ' + JSON.stringify(after.dep && { to: after.dep.to, exit: after.dep.exit, reason: after.dep.reason, fallback: after.dep.fallback }) + ')');
  const g1 = await guide(p);
  ok(g1.how === 'done' && !g1.t.length, 'nothing is marked (' + JSON.stringify(g1) + ')');
  await p.evaluate(async () => { await RB.save.manualSave(2); });
  await p.reload();
  await p.waitForFunction(() => window.__RB_READY__ === true, null, { timeout: 15000 });
  const ld2 = await p.evaluate(async () => { try { await RB.game.loadCampaign(2, 'manual'); return 'loaded'; } catch (e) { return 'failed: ' + e.message; } });
  await settled(p);
  const q2 = await quest(p), g2 = await guide(p);
  ok(ld2 === 'loaded' && q2.q && q2.q.done && !(await standing(p, 'yn_yasuke')).length && g2.how === 'done' && !g2.t.length, 'saved, reloaded and loaded: still done, nobody on the descent, nothing marked (' + JSON.stringify({ ld2, q: q2.q, g2 }) + ')');
  allErrors.push(...errors);
  await p.close();
}

// ---- 2. 1/3 with Oshige to give --------------------------------------------------------------------------------------
{
  const { p, errors } = await pageAt(null);
  await start(p, { map: 'yn.kami', x: 10, y: 6, dir: 'right', comp: 'nao', done: true, given: ['tsuneji'] });
  const g0 = await guide(p);
  ok(g0.how !== 'waiting' && g0.t.join() === [DESCENT, KAMI].sort().join(), '1/3 (Tsuneji\'s given): the guide marks Yasuke and Oshige (' + JSON.stringify(g0) + ')');
  ok((await standing(p, 'yn_oshige')).join() === '11,6', 'Oshige stands in the Upper House');
  const l1 = await play(p);
  const g1 = await guide(p);
  ok(l1.some((l) => OSH.test(l)) && g1.t.join() === DESCENT, 'her egg; then the guide marks Yasuke only (' + JSON.stringify(g1) + ')');
  await go(p, 'yn.descent', 9, 17, 'up');
  ok((await standing(p, 'yn_yasuke')).join() === '9,16', 'Yasuke stands on the descent');
  const l2 = await play(p);
  const q = await quest(p), g2 = await guide(p);
  ok(l2.some((l) => YAS.test(l)) && l2.some((l) => ALL.test(l)) && q.q && q.q.done && g2.how === 'done' && !g2.t.length, 'his egg: done, nothing marked (' + JSON.stringify({ q: q.q, g2 }) + ')');
  allErrors.push(...errors);
  await p.close();
}

// ---- 3. 1/3 with Tsuneji to give -------------------------------------------------------------------------------------
{
  const { p, errors } = await pageAt(null);
  await start(p, { map: 'yn.lower', x: 21, y: 18, dir: 'right', comp: 'mio', done: true, given: ['yasuke'] });
  const g0 = await guide(p);
  ok((await standing(p, 'yn_tsuneji')).join() === '22,18' && g0.t.join() === [KAMI, LOWER].sort().join(), '1/3 (Yasuke\'s given): Tsuneji stands at (22,18); the guide marks him and Oshige (' + JSON.stringify(g0) + ')');
  const l1 = await play(p);
  await p.waitForTimeout(2500);
  const dep = await p.evaluate(() => RB.world.W.departures.filter((d) => d.id === 'yn_tsuneji').pop() || null);
  ok(l1.some((l) => TSU.test(l)) && dep && dep.to === 'yn.shimo' && dep.exit === '9,10' && !dep.fallback, 'his egg: he walks to the Lower House\'s door, no fallback (' + JSON.stringify(dep && { to: dep.to, exit: dep.exit, reason: dep.reason, fallback: dep.fallback }) + ')');
  ok(!(await standing(p, 'yn_tsuneji')).length, 'the riverbank is empty');
  const g1 = await guide(p);
  ok(g1.t.join() === KAMI, 'the guide then marks Oshige only (' + JSON.stringify(g1) + ')');
  await go(p, 'yn.shimo', 9, 8, 'up');
  ok(!(await standing(p, 'yn_tsuneji')).length, 'inside the Lower House he is not placed by the hearth after the chapter\'s end');
  allErrors.push(...errors);
  await p.close();
}

// ---- 4. nothing given, after the end, with each companion and none -----------------------------------------------------
for (const comp of [null, 'nao', 'mio', 'ren', 'suzu']) {
  const who = comp || 'no companion';
  const { p, errors } = await pageAt(null);
  await start(p, { map: 'yn.descent', x: 9, y: 17, dir: 'up', comp, done: true, given: [] });
  const y = await standing(p, 'yn_yasuke'), g = await guide(p);
  await go(p, 'yn.lower', 21, 18, 'right');
  const t = await standing(p, 'yn_tsuneji');
  await go(p, 'yn.kami', 10, 6, 'right');
  const o = await standing(p, 'yn_oshige');
  ok(y.join() === '9,16' && t.join() === '22,18' && o.join() === '11,6' && g.t.join() === [DESCENT, KAMI, LOWER].sort().join(), who + ': nothing given after the end: all three stand where they did and are marked (' + JSON.stringify({ y, t, o, g }) + ')');
  allErrors.push(...errors);
  await p.close();
}

// ---- 5. never begun after the end; under way before it -------------------------------------------------------------------
{
  const { p, errors } = await pageAt(null);
  await start(p, { map: 'yn.descent', x: 9, y: 17, dir: 'up', done: true, quest: 'none' });
  const y = await standing(p, 'yn_yasuke');
  await go(p, 'yn.lower', 21, 18, 'right');
  const t = await standing(p, 'yn_tsuneji');
  ok(!y.length && !t.length, 'the quest never begun, after the end: neither man stands there (' + JSON.stringify({ y, t }) + ')');
  await start(p, { map: 'yn.descent', x: 9, y: 17, dir: 'up', done: false, given: [] });
  const y2 = await standing(p, 'yn_yasuke');
  await go(p, 'yn.lower', 21, 18, 'right');
  const t2 = await standing(p, 'yn_tsuneji');
  ok(y2.join() === '9,16' && t2.join() === '22,18', 'before the end, the quest under way: both stand as always (' + JSON.stringify({ y2, t2 }) + ')');
  allErrors.push(...errors);
  await p.close();
}

ok(!allErrors.length, 'no page errors' + (allErrors.length ? ': ' + allErrors.slice(0, 3).join(' | ') : ''));
await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
