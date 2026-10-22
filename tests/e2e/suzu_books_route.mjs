// RBN-QA-128 (Agnes 6347939181; Local CL-222; Cloud CC-129 §7): Suzu's books after her night apart play on coming
// out into either town, so going from the inn to the hall can no longer pass them by. In Chromium on the built game,
// with throwaway journeys:
//  1. both garden replies ("You're saying no?", "If you want to go back…"), each way out: from the Upper House into the
//     upper town, and from the Lower House into the lower town: the books play there (her first line over the troupe's
//     packing, in the playhouse), yn_suzu_books set, the bond event yn:settled once;
//  2. once only: coming into either town again plays nothing of them, and the bond is not given twice;
//  3. an old save, mediated, the books pending (written and loaded with the game's own save): the upper town plays the
//     books first; coming in again, the walk; a save past the chapter's end with the books pending: the lower town
//     plays them;
//  4. not for anyone else: Nao with the same flags: neither town plays them;
//  5. a journey loaded while the books play (saved before them): nothing left running or on screen, the books still
//     pending, and coming into the upper town plays them once;
//  6. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/suzu_books_route.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const BASE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_called: true, cr_done: true, cr_delivered: true,
  yn_called: true, yn_arrived: true, yn_kami_seen: true, yn_shimo_seen: true, yn_lower_seen: true, yn_rooms_done: true, yn_kettle_settled: true, yn_evening: true, yn_eve_started: true, yn_suzu_night: true, yn_apart: true, yn_playhouse_seen: true };
const FIRST = /^narr: The troupe is getting ready to leave|^narr: The troupe/, BOOKS_END = /^yn_koume: Without fail/;
const errorsAll = [];

async function start(p, map, x, y, comp, flags) {
  await p.evaluate(([map, x, y, comp, flags, BASE]) => {
    const s = RB.game.debugStart(map, x, y, { dir: 'down', edition: RB.edition.forNew(), comp, flags: Object.assign({}, BASE, flags) });
    if (!comp) s.comp = null;
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) if (ev.scene !== 'yn.suzu_books' && ev.scene !== 'yn.walk') s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.suzuSpeech = 'standard'; RB.game.settings.skipSeen = true;
    RB.save.autosave = async () => {};
    window.__scenes = [];
    if (!window.__runWrap) { const run0 = RB.script.run; RB.script.run = function (id) { window.__scenes.push(id); return run0.apply(this, arguments); }; window.__runWrap = true; }
  }, [map, x, y, comp, flags, BASE]);
  await p.waitForTimeout(400);
}
// play what is on screen to its end, choosing `pick` (0-based) at a choice; stop early when `until` matches a line
async function playOut(p, pick, until) {
  const lines = [];
  for (let i = 0; i < 300; i++) {
    const st = await p.evaluate(() => { const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(); return { d: d ? (d.who || '') + ': ' + String(d.en || '').slice(0, 70) : null, run: RB.script.isRunning(), ch: [...document.querySelectorAll('.choices:not(.hidden) .choice')].length }; });
    if (st.ch) { await p.evaluate((k) => document.querySelectorAll('.choices:not(.hidden) .choice')[k].click(), pick || 0); await p.waitForTimeout(150); continue; }
    if (st.d) {
      if (!lines.length || lines[lines.length - 1] !== st.d) { lines.push(st.d); if (until && until.test(st.d)) return lines; await p.waitForTimeout(80); await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance()); }
      await p.waitForTimeout(40);
      continue;
    }
    if (!st.run && i > 3) break;
    await p.waitForTimeout(60);
  }
  await p.waitForTimeout(300);
  return lines;
}
// coming out into a town by the game's own way in (RB.game.transition, as a door does): the map's enter events run there,
// never by placing you on it (RB.world.enter alone runs none, so the books could not have played)
async function enter(p, map, x, y) {
  await p.evaluate(async ([map, x, y]) => { window.__scenes = []; await RB.game.transition(map, x, y, 'down'); }, [map, x, y]);
  await p.waitForTimeout(600);
}
const state = (p) => p.evaluate(() => ({ books: !!RB.game.s.flags.yn_suzu_books, bond: (RB.game.s.company && RB.game.s.company.bond || {})['yn:settled'] || null, map: RB.world.W.map.id, scenes: window.__scenes.slice(), run: RB.script.isRunning() }));
const UP = ['yn.upper', 10, 12], LO = ['yn.lower', 9, 12];

// ---- 1, 2. both garden replies, each way out ----------------------------------------------------------------------------
for (const [pick, reply] of [[0, 'You\'re saying no?'], [1, 'If you want to go back']]) {
  for (const [inn, out, other] of [['yn.kami', UP, LO], ['yn.shimo', LO, UP]]) {
    const { p, errors } = await page(b, url);
    await start(p, inn, 7, 6, 'suzu', {});
    // (started, not awaited: the scene waits on its lines and its choice, which playOut gives it)
    await p.evaluate(() => { RB.script.run('yn.suzu_garden'); });
    await playOut(p, pick);
    const g = await p.evaluate(() => ({ back: !!RB.game.s.flags.yn_suzu_back, books: !!RB.game.s.flags.yn_suzu_books }));
    await enter(p, ...out);
    const lines = await playOut(p, 0);
    const s1 = await state(p);
    const tag = `"${reply}", ${inn} → ${out[0]}`;
    ok(g.back && !g.books && lines.some((l) => FIRST.test(l)) && lines.some((l) => BOOKS_END.test(l)) && s1.books && s1.bond === 1 && s1.map === 'yn.playhouse',
      tag + ': the books play on coming out, in the playhouse; yn:settled given (' + JSON.stringify({ first: lines[0], n: lines.length, books: s1.books, bond: s1.bond, map: s1.map }) + ')');
    await enter(p, ...out); const a = await state(p);
    await enter(p, ...other); const c = await state(p);
    ok(!a.scenes.includes('yn.suzu_books') && !c.scenes.includes('yn.suzu_books') && c.bond === 1, tag + ': once only: neither town plays them again; the bond not given twice (' + JSON.stringify([a.scenes, c.scenes, c.bond]) + ')');
    errorsAll.push(...errors);
    await p.close();
  }
}

// ---- 3. old saves ----------------------------------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url);
  await start(p, 'yn.guild', 7, 6, 'suzu', { yn_suzu_back: true, yn_eve_done: true, yn_mediated: true });
  await p.evaluate(async () => { await RB.save.manualSave(1); });
  await p.close();
  const q = await page(b, url, { context: ctx });
  const ld = await q.p.evaluate(async () => { try { await RB.game.loadCampaign(1, 'manual'); return 'loaded'; } catch (e) { return 'failed: ' + e.message; } });
  await q.p.evaluate(() => { RB.game.settings.textSpeed = 'instant'; RB.save.autosave = async () => {}; window.__scenes = []; const run0 = RB.script.run; RB.script.run = function (id) { window.__scenes.push(id); return run0.apply(this, arguments); }; });
  await enter(q.p, ...UP);
  const s1 = await state(q.p);
  await playOut(q.p, 0);
  await enter(q.p, ...UP);
  const s2 = await state(q.p);
  ok(ld === 'loaded' && s1.scenes[0] === 'yn.suzu_books' && s2.scenes[0] === 'yn.walk', 'a mediated save with the books pending: the upper town plays the books first, then the walk on coming in again (' + JSON.stringify([ld, s1.scenes, s2.scenes]) + ')');
  errorsAll.push(...errors, ...q.errors);
  await q.p.close();
  const r = await page(b, url);
  await start(r.p, 'yn.upper', 10, 12, 'suzu', { yn_suzu_back: true, yn_eve_done: true, yn_mediated: true, yn_done: true });
  await enter(r.p, ...LO);
  const s3 = await state(r.p);
  ok(s3.scenes[0] === 'yn.suzu_books', 'past the chapter\'s end with the books pending: the lower town plays them (' + JSON.stringify(s3.scenes) + ')');
  errorsAll.push(...r.errors);
  await r.p.close();
}

// ---- 4. not for anyone else ------------------------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await start(p, 'yn.kami', 7, 6, 'nao', { yn_suzu_back: true, yn_eve_done: true });
  await enter(p, ...UP); const a = await state(p);
  await enter(p, ...LO); const c = await state(p);
  ok(!a.scenes.includes('yn.suzu_books') && !c.scenes.includes('yn.suzu_books') && !c.books, 'Nao with the same flags: neither town plays them (' + JSON.stringify([a.scenes, c.scenes]) + ')');
  errorsAll.push(...errors);
  await p.close();
}

// ---- 5. a load while the books play ------------------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await start(p, 'yn.kami', 7, 6, 'suzu', { yn_suzu_back: true, yn_eve_done: true });
  await p.evaluate(async () => { await RB.save.manualSave(2); });
  await enter(p, ...UP);
  await playOut(p, 0, FIRST);
  const ld = await p.evaluate(async () => { try { await RB.game.loadCampaign(2, 'manual'); return 'loaded'; } catch (e) { return 'failed: ' + e.message; } });
  await p.waitForTimeout(800);
  const after = await p.evaluate(() => ({ run: RB.script.isRunning(), dlg: RB.ui.dialogue.isOpen(), books: !!RB.game.s.flags.yn_suzu_books, map: RB.world.W.map.id }));
  await p.evaluate(() => { window.__scenes = []; });
  await enter(p, ...UP);
  const lines = await playOut(p, 0);
  const s = await state(p);
  ok(ld === 'loaded' && !after.run && !after.dlg && !after.books && after.map === 'yn.kami' && lines.some((l) => FIRST.test(l)) && s.books && s.bond === 1,
    'loaded while the books play: nothing left running, the books still pending; coming out plays them once (' + JSON.stringify({ ld, after, n: lines.length, bond: s.bond }) + ')');
  errorsAll.push(...errors);
  await p.close();
}

ok(!errorsAll.length, 'no page errors' + (errorsAll.length ? ': ' + errorsAll.slice(0, 3).join(' | ') : ''));
await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
