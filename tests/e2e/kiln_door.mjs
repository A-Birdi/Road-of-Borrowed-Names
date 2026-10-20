// Agnes, RBN-QA-025 (HIGH): in the Old Workshop Row, once the glass seal was broken the Great Kiln's doorway still
// would not let you in ("The door is shut. Nobody comes to it."): the kiln's house had no way in of its own, and the
// separate exit laid on its doorway could never be walked onto (the house kept the tile solid). The doorway is now the
// house's own door into the kiln, shut by the seal until co_seal_broken; and the main quest's step names where it
// leads (the guide had fallen back on the festival's lookout, a later step). In the game, in a twelve-chapter journey:
//  1. sealed, before the ice word: walking up is blocked; the seal's scene says why; no way in;
//  2. sealed, with the ice word: the seal's task breaks it; then the doorway takes you into the kiln;
//  3. a save with the seal already broken (Agnes's), loaded: the doorway takes you in, nothing asked again;
//  4. the way back: the kiln's door leads out to the doorway; in again;
//  5. the guide: the glass seal while it holds, then the Great Kiln, inside nothing marked; never the festival lookout.
// Usage: node tools/build.mjs && node tests/e2e/kiln_door.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

const BASE = { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb1_done: true, mb2_done: true, co_arrived: true, co_met_sayo: true,
  co_suspect: true, co_chronicle_read: true, co_upper_open: true, co_oldworks_seen: true };
const SEALED = /doorway is sealed with melted glass/, BROKE = /Act two: inside the kiln/;

async function start(p, o) {
  await p.evaluate(async (o) => {
    RB.test.enable({ battle: 'unravel', choose: () => 0 });
    const s = RB.game.debugStart(o.map, o.x, o.y, { comp: 'suzu', flags: Object.assign({}, o.flags), dir: 'up', edition: 2 });
    s.chapter = 5;
    s.learn.kanaKnown = 'both';
    if (o.ice) s.words = (s.words || []).concat(['koori']);
    s.quests.co_main = { stage: 6, done: false, t: 1 };
    RB.game.settings.textSpeed = 'instant';
    RB.game.applySettings();
    RB.world.refreshActors();
    const W = RB.world.W, t0 = performance.now();
    while (W.time - W.enteredAt < 1100 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50));
  }, o);
}
const where = (p) => p.evaluate(() => ({ map: RB.world.W.map.id, x: RB.world.W.player.x, y: RB.world.W.player.y, broken: !!RB.game.s.flags.co_seal_broken, step: RB.game.s.quests.co_main.stage }));
// stand at x,y facing `dir`, take one real step (exits, doors, locks); settle; the lines shown
async function step(p, x, y, dir) {
  const n = await p.evaluate(async ([x, y, dir]) => { await RB.test.idle(); const n = RB.game.s.backlog.length; RB.test.place(x, y, dir); await RB.test.step(dir); await RB.test.idle(); return n; }, [x, y, dir]);
  await p.waitForFunction(() => RB.world.W.map && !RB.world.W.player.mv && RB.game.mode() === 'world' && !RB.script.isRunning(), null, { timeout: 20000, polling: 50 }).catch(() => {});
  await p.waitForTimeout(400);
  return { at: await where(p), lines: await p.evaluate((n) => RB.game.s.backlog.slice(n).map((l) => l.en || ''), n) };
}
const use = (p, x, y) => p.evaluate(async ([x, y]) => { const n = RB.game.s.backlog.length; await RB.test.use(x, y); await RB.test.idle(); return RB.game.s.backlog.slice(n).map((l) => l.en || ''); }, [x, y]);
const guide = (p) => p.evaluate(() => {
  const t = RB.questGuide.targets('co_main', RB.game.s);
  return { how: t.how, tg: (t.targets || []).map((x) => x.kind + ':' + x.map + (x.x != null ? '@' + x.x + ',' + x.y : '')), lines: RB.questGuide.nextLines(t).map((l) => l.en) };
});
async function saveAndLoad(p) {
  await p.evaluate(async () => { await RB.test.idle(); await RB.save.writeSlot(1, RB.game.s, { force: true }); await RB.game.loadCampaign(1); });
  await p.waitForFunction(() => RB.game.s && RB.world.W.map && RB.game.mode() === 'world' && !RB.script.isRunning(), null, { timeout: 20000 });
  await p.waitForTimeout(600);
  return where(p);
}
const noLookout = (g) => !g.tg.some((t) => /co\.festival/.test(t)) && !g.lines.some((l) => /lookout/i.test(l));

// ---- 1-2. sealed: blocked and told why; with the ice word, broken; then in --------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { map: 'co.oldworks', x: 20, y: 7, flags: BASE });
  let g = await guide(p);
  ok(g.how === 'authored' && g.tg.includes('prop:co.oldworks@20,5') && g.lines.some((l) => /the glass seal/.test(l)) && noLookout(g), '1 the guide: the glass seal (' + g.lines.join(' | ') + ')');
  let r = await step(p, 20, 6, 'up');
  ok(r.at.map === 'co.oldworks' && r.at.x === 20 && r.at.y === 6, '1 sealed: walking up into the doorway is blocked (' + r.at.map + ' ' + r.at.x + ',' + r.at.y + ')');
  let lines = await use(p, 20, 5);
  r = { at: await where(p) };
  ok(lines.some((l) => SEALED.test(l)) && !r.at.broken && r.at.map === 'co.oldworks', '1 the seal\'s scene says why (melted glass, still warm); still sealed, still outside');
  ok(errors.length === 0, '1 no page errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await p.context().close();
}
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { map: 'co.oldworks', x: 20, y: 7, flags: BASE, ice: true });
  const lines = await use(p, 20, 5);
  let at = await where(p);
  ok(at.broken && lines.some((l) => BROKE.test(l)), '2 with the ice word, the seal\'s task breaks it ("Act two: inside the kiln")');
  const g = await guide(p);
  ok(g.tg.includes('enter:co.kiln') && g.lines.some((l) => /The Great Kiln/.test(l)) && noLookout(g), '2 the guide now: the Great Kiln (' + g.lines.join(' | ') + ')');
  const r = await step(p, 20, 6, 'up');
  ok(r.at.map === 'co.kiln' && r.at.x === 14 && r.at.y === 22, '2 the doorway takes you into the kiln (' + r.at.map + ' ' + r.at.x + ',' + r.at.y + ')');
  ok(errors.length === 0, '2 no page errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await p.context().close();
}

// ---- 3-4. a save with the seal broken (Agnes's), loaded; in, out, in again ---------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { map: 'co.oldworks', x: 20, y: 7, flags: Object.assign({ co_seal_broken: true }, BASE), ice: true });
  let at = await saveAndLoad(p);
  ok(at.map === 'co.oldworks' && at.broken && at.step === 6, '3 the save loads by the doorway, seal broken, step 6');
  let r = await step(p, 20, 6, 'up');
  ok(r.at.map === 'co.kiln' && r.at.x === 14 && r.at.y === 22, '3 the doorway takes you in (' + r.at.map + ' ' + r.at.x + ',' + r.at.y + ')');
  ok(!r.lines.some((l) => SEALED.test(l) || BROKE.test(l)), '3 nothing asked again (no seal, no task)');
  const g = await guide(p);
  ok(g.how === 'open' && noLookout(g), '3 inside the kiln the guide marks nothing (' + g.how + ')');
  r = await step(p, 14, 22, 'down');
  ok(r.at.map === 'co.oldworks' && r.at.x === 20 && r.at.y === 6, '4 the kiln\'s door leads back out to the doorway (' + r.at.map + ' ' + r.at.x + ',' + r.at.y + ')');
  r = await step(p, 20, 6, 'up');
  ok(r.at.map === 'co.kiln', '4 and in again');
  ok(errors.length === 0, '3-4 no page errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await p.context().close();
}

console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
