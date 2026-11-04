// Mio's recipe (lf_mio, step 1): "Come back later" is not the recipe read, and the recipe is read again from the
// Company page (Agnes 6639438614; Cloud CC-522, CC-527; Local CL-692, CL-693, CL-694; Agnes 6640720415, 6641511048).
// In Chromium on the built game, on throwaway journeys (never a real save), Mio in the party: the first telling
// reached by walking into the avenue from the Lantern Road (the game's own transition and arrival events); the recipe
// left on the real exercise sheet by its own "Come back later" button (the test helper's answering switched off for
// it), answered by the helper otherwise; the retry clicked on the real Company page; saves made and loaded through
// the game's own save and load:
//  1. the first telling from the avenue's arrival, the recipe left: the telling up to her request, nothing of her
//     reading, step 1, the paper not left in her hand, the world's own controls back;
//  2. nothing starts it by itself: the queued after-scene scans, walking, the folio opened and closed, other people's
//     talk, world talk to Mio, the road and back, a save and load;
//  3. the Company page: "The recipe to read together" under Talk with Mio, with her quest's name beside it;
//  4. refused while it is not safe (Mio not beside you; a creature close by, in the stacks under the Records Hall):
//     the page stays, the action stays, nothing runs;
//  5. a stale click (the step moved on behind the page): nothing runs, and the page is drawn without it;
//  6. Not now: her request only; the folio back on the Company page; the action still there;
//  7. read and left: her request only; the action still there;
//  8. read, by a double click: the scene once, her reading once, step 2, the action gone, Tadashi next;
//  9. off Lanternfall, an interior and an outdoor map: the retry walks no one and moves no one, brings no townsfolk,
//     leaves no paper in her hand, and reads it: step 2;
// 10. after the bell (the town's after-bell scene first on arrival): still offered, and read;
// 11. not offered: a finished quest, or another companion;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/lf_mio_retry.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const DONE = ['departed', 'ch1_done', 'ch2_done', 'mb1_done', 'mb2_done', 'ch3_done', 'ch4_done', 'kr_done', 'lf_arrived', 'lf_town_intro'];
const B = { first: /As you walk down the avenue/, ask: /Will you read the recipe with me/, read: /This isn't medicine/, come: /Will you come with me\? If my voice/ };
const has = (said, re) => said.some((x) => re.test(x));
const count = (said, re) => said.filter((x) => re.test(x)).length;

// a throwaway journey on `map`: the main story at Lanternfall's second step, every arrival scene marked seen except
// those in `fresh`; exercises named in window.__leave are played on the real sheet and left by "Come back later";
// window.__choose picks in a choice; window.__scenes lists every scene started, window.__said every line shown
async function at(p, o) {
  await p.evaluate(async ({ DONE, o }) => {
    const f = Object.assign({}, o.flags || {});
    for (const k of DONE) f[k] = true;
    const s = RB.game.debugStart(o.map, o.x, o.y, { comp: o.comp || 'mio', dir: o.dir || 'right', edition: 2, flags: f });
    s.quests.lf_main = { stage: 2, done: false, t: 1 };
    if (o.stage !== undefined) s.quests.lf_mio = o.stage === 'done' ? { stage: 2, done: true, t: 1 } : { stage: o.stage, done: false, t: 1 };
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) if (!(o.fresh || []).includes(m + ':' + ev.scene)) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    window.__choose = 0;
    const opts = { choose: () => window.__choose };
    RB.test.enable(opts);
    window.__leave = new Set();
    window.__runs = [];
    const run = RB.challenge.run;
    RB.challenge.run = async function (id) {
      if (!window.__leave.has(id)) { const r = await run.apply(this, arguments); window.__runs.push([id, !!(r && r.ok)]); return r; }
      RB.test.disable();
      let label = null;
      const tick = setInterval(() => {
        const teach = document.querySelector('.teach [data-ok]');
        if (teach && teach.offsetParent) { teach.click(); return; }
        const leave = document.querySelector('.chal [data-a=leave]');
        if (leave && leave.offsetParent) { label = leave.textContent.trim(); leave.click(); }
      }, 150);
      try { const r = await run.apply(this, arguments); window.__runs.push([id, !!(r && r.ok), !!(r && r.cancelled), label]); return r; } finally { clearInterval(tick); RB.test.enable(opts); }
    };
    if (!window.__wrapped) {
      window.__wrapped = true;
      const srun = RB.script.run;
      RB.script.run = function (id) { (window.__scenes = window.__scenes || []).push(id); return srun.apply(this, arguments); };
      const say = RB.ui.dialogue.say;
      RB.ui.dialogue.say = function (l) { if (l) (window.__said = window.__said || []).push(l.en || ''); return say.apply(this, arguments); };
      const notice = RB.ui.notice;
      RB.ui.notice = function (text) { (window.__notices = window.__notices || []).push(String(text)); return notice.apply(this, arguments); };
      const cue = RB.staging.cue;
      RB.staging.cue = function (who, g) { (window.__cues = window.__cues || []).push(g); return cue.apply(this, arguments); };
    }
    await new Promise((r) => setTimeout(r, 900));
    RB.world.refreshActors();
  }, { DONE, o });
}
// what happened while `fn` ran (in the page), once the world is quiet again
const watch = (p, fn, arg, leave) => p.evaluate(async ({ fn, arg, leave }) => {
  window.__said = []; window.__runs = []; window.__scenes = []; window.__notices = []; window.__cues = []; window.__leave = new Set(leave || []);
  await (0, eval)('(' + fn + ')')(arg);
  await new Promise((r) => setTimeout(r, 300));
  if (!RB.ui.menu.isOpen()) await RB.test.idle();
  await new Promise((r) => setTimeout(r, 300));
  const s = RB.game.s, W = RB.world.W;
  const q = s.quests.lf_mio;
  return {
    said: window.__said.slice(), runs: window.__runs.slice(), scenes: window.__scenes.slice(), notices: window.__notices.slice(), cues: window.__cues.slice(),
    stage: q ? (q.done ? 'done' : q.stage) : null, mode: RB.game.mode(), map: W.map.id, menu: RB.ui.menu.isOpen() ? RB.ui.menu.current() : null,
    held: !!(W.comp && W.comp.stg && W.comp.stg.held), button: !!document.querySelector('[data-co-act=retry]'),
  };
}, { fn: fn.toString(), arg, leave });
// the Company page's retry: the page opened, then its button clicked (twice when `twice`)
const clickRetry = async (twice) => {
  RB.ui.menu.open('company');
  await new Promise((r) => setTimeout(r, 250));
  const btn = document.querySelector('[data-co-act=retry]');
  if (!btn) return;
  btn.click();
  if (twice) btn.click();
  // to the scene's end, then the folio coming back (src/ui/53_company_pages.js converse); not RB.test.idle, which
  // would close it again
  const t0 = Date.now();
  do await new Promise((r) => setTimeout(r, 50)); while (Date.now() - t0 < 20000 && (RB.script.isRunning() || !(RB.ui.menu.isOpen() || RB.game.mode() === 'world')));
  await new Promise((r) => setTimeout(r, 250));
};
const saveLoad = (p) => p.evaluate(async () => {
  await RB.test.idle();
  await RB.save.manualSave(1);
  await RB.game.loadCampaign(1, 'manual');
  await new Promise((r) => setTimeout(r, 800));
  await RB.test.idle();
  return RB.world.W.map.id;
});

// 1 to 8: Lanternfall, from the Lantern Road
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, { map: 'lf.road', x: 33, y: 12, fresh: ['lf.town:lf.mio_start'] });
  const t1 = await watch(p, async () => { await RB.test.go('lf.town', 1, 17, 'right'); }, null, ['lf.ch_recipe']);
  ok(t1.scenes.includes('lf.mio_start') && has(t1.said, B.first) && count(t1.said, B.ask) === 1 && !has(t1.said, B.read) && flat(t1.runs) === flat([['lf.ch_recipe', false, true, 'Come back later']]) &&
    t1.stage === 1 && !t1.held && t1.mode === 'world' && t1.map === 'lf.town',
    '1 the first telling from the avenue\'s arrival, the recipe left by "Come back later": up to her request, nothing of her reading, step 1, the paper not in her hand, the world\'s controls back ' + flat({ runs: t1.runs, stage: t1.stage, held: t1.held, mode: t1.mode }));

  // 2. nothing starts it by itself
  const t2 = await watch(p, async () => {
    await new Promise((r) => setTimeout(r, 1200)); // the queued after-scene scans (src/engine/90_game.js afterScene)
    for (const d of ['right', 'right', 'down', 'up', 'left']) await RB.test.step(d);
    RB.ui.menu.open('journey'); await new Promise((r) => setTimeout(r, 200)); RB.ui.menu.close(); await RB.test.idle();
    RB.ui.menu.open('company'); await new Promise((r) => setTimeout(r, 200)); RB.ui.menu.close(); await RB.test.idle();
    const ids = (RB.content.maps['lf.town'].npcs || []).filter((n) => n.talk && (!n.if || RB.state.test(RB.game.s, n.if))).map((n) => n.id);
    const other = RB.world.W.npcs.find((n) => ids.includes(n.id));
    window.__other = other ? other.id : null;
    if (other) await RB.test.talk(other.id);
    RB.game.companionTalk(); await new Promise((r) => setTimeout(r, 300)); await RB.test.idle();
    await RB.test.go('lf.road', 33, 12, 'left');
    await RB.test.go('lf.town', 1, 17, 'right');
  });
  const m2 = await saveLoad(p);
  const t2b = await watch(p, async () => { await new Promise((r) => setTimeout(r, 1200)); });
  ok(!t2.scenes.includes('lf.mio_start') && !t2b.scenes.includes('lf.mio_start') && !t2.runs.some((r) => r[0] === 'lf.ch_recipe') && t2.stage === 1 && t2b.stage === 1 && m2 === 'lf.town' && t2.mode === 'world',
    '2 nothing starts it by itself: the after-scene scans, walking, the folio, other people\'s talk, world talk to Mio, the road and back, a save and load ' + flat({ scenes: t2.scenes, after: t2b.scenes, stage: [t2.stage, t2b.stage] }));

  // 3. the Company page
  const page3 = await p.evaluate(async () => {
    RB.ui.menu.open('company');
    await new Promise((r) => setTimeout(r, 250));
    const btn = document.querySelector('[data-co-act=retry]');
    const ul = btn && btn.closest('ul.co-acts');
    let h = ul && ul.previousElementSibling;
    while (h && h.tagName !== 'H4') h = h.previousElementSibling;
    const r = { label: btn ? btn.textContent.trim() : null, note: btn ? (btn.parentElement.querySelector('.muted') || {}).textContent : null, heading: h ? h.textContent.trim() : null };
    RB.ui.menu.close();
    await RB.test.idle();
    return r;
  });
  ok(page3.label === 'The recipe to read together' && page3.note === 'A No, Out Loud' && /Talk with Mio/.test(page3.heading || ''),
    '3 the Company page: "The recipe to read together" under Talk with Mio, her quest\'s name beside it ' + flat(page3));

  // 4. refused with Mio not beside you (with a creature close by: below, in the stacks)
  const t4 = await watch(p, async () => {
    const W = RB.world.W;
    RB.ui.menu.open('company');
    await new Promise((r) => setTimeout(r, 250));
    const comp = W.comp;
    W.comp = null;
    window.__why = RB.company.safeHere().why;
    (document.querySelector('[data-co-act=retry]') || { click() {} }).click(); // (none on a page without it: nothing to click)
    await new Promise((r) => setTimeout(r, 200));
    W.comp = comp;
    window.__open = RB.ui.menu.isOpen() && !!document.querySelector('[data-co-act=retry]');
  });
  const open4 = await p.evaluate(() => [window.__why, window.__open]);
  ok(t4.notices.length === 1 && /beside you/.test(t4.notices[0]) && flat(open4) === '["apart",true]' && !t4.scenes.length && t4.stage === 1 && t4.button,
    '4 refused with Mio not beside you: the page and the action stay, nothing runs ' + flat({ notices: t4.notices, open: open4, scenes: t4.scenes }));
  await p.evaluate(async () => { RB.ui.menu.close(); await RB.test.idle(); });

  // 5. a stale click
  const t5 = await watch(p, async () => {
    const s = RB.game.s;
    RB.ui.menu.open('company');
    await new Promise((r) => setTimeout(r, 250));
    const btn = document.querySelector('[data-co-act=retry]');
    s.quests.lf_mio.stage = 2; // the step moved on behind the page
    if (btn) btn.click();
    await new Promise((r) => setTimeout(r, 250));
    window.__gone = !document.querySelector('[data-co-act=retry]') && RB.ui.menu.isOpen();
    s.quests.lf_mio.stage = 1;
    RB.ui.menu.close();
  });
  const gone5 = await p.evaluate(() => window.__gone);
  ok(!t5.scenes.length && !t5.said.length && gone5 && t5.stage === 1, '5 a stale click (the step moved on behind the page): nothing runs, and the page is drawn without it ' + flat({ scenes: t5.scenes, gone: gone5 }));

  // 6. Not now
  await p.evaluate(() => { window.__choose = 1; });
  const t6 = await watch(p, clickRetry);
  ok(flat(t6.scenes) === '["lf.mio_start"]' && t6.said.length === 1 && has(t6.said, B.ask) && !t6.runs.length && t6.stage === 1 && t6.menu && t6.menu.section === 'company' && t6.button && !t6.held,
    '6 Not now: her request only, nothing asked; the folio back on the Company page, the action still there ' + flat({ scenes: t6.scenes, said: t6.said, menu: t6.menu, button: t6.button }));
  await p.evaluate(async () => { RB.ui.menu.close(); await RB.test.idle(); window.__choose = 0; });

  // 7. read and left
  const t7 = await watch(p, clickRetry, false, ['lf.ch_recipe']);
  ok(t7.said.length === 1 && has(t7.said, B.ask) && flat(t7.runs) === flat([['lf.ch_recipe', false, true, 'Come back later']]) && t7.stage === 1 && t7.button && !t7.held,
    '7 read and left by "Come back later": her request only; step 1, the action still there ' + flat({ runs: t7.runs, stage: t7.stage, button: t7.button }));
  await p.evaluate(async () => { RB.ui.menu.close(); await RB.test.idle(); });

  // 8. read, by a double click
  const t8 = await watch(p, clickRetry, true);
  const next8 = await p.evaluate(() => ({ tadashi: ((RB.content.maps['lf.records'].npcs.find((n) => n.id === 'lf_tadashi').talk).find((x) => !x.if || RB.state.test(RB.game.s, x.if)) || {}).scene,
    guide: RB.questGuide.targets('lf_mio').targets.map((e) => e.map + ':' + e.kind + ':' + (e.id || '')) }));
  ok(t8.scenes.filter((x) => x === 'lf.mio_start').length === 1 && count(t8.said, B.ask) === 1 && count(t8.said, B.read) === 1 && count(t8.said, B.come) === 1 && flat(t8.runs) === flat([['lf.ch_recipe', true]]) &&
    t8.stage === 2 && !t8.button && !t8.held && next8.tadashi === 'lf.mio_refuse' && next8.guide.includes('lf.records:npc:lf_tadashi'),
    '8 read, by a double click: the scene once, her reading once, step 2, the action gone, Tadashi next ' + flat({ scenes: t8.scenes, runs: t8.runs, stage: t8.stage, button: t8.button, next8 }));
  await p.evaluate(async () => { RB.ui.menu.close(); await RB.test.idle(); });
  ok(!errors.length, '1-8 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// 4 (continued). refused with a creature close by: the stacks under the Records Hall, its creature in reach
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, { map: 'lf.stacks', x: 10, y: 10, stage: 1 });
  const t4b = await watch(p, async () => {
    const W = RB.world.W;
    const f = W.foes.find((x) => x.id === 'st1');
    if (f) { f.x = f.fx = W.player.x + 3; f.y = f.fy = W.player.y; f.mv = null; }
    RB.ui.menu.open('company');
    await new Promise((r) => setTimeout(r, 250));
    window.__why = RB.company.safeHere().why;
    (document.querySelector('[data-co-act=retry]') || { click() {} }).click(); // (none on a page without it: nothing to click)
    await new Promise((r) => setTimeout(r, 200));
    window.__open = RB.ui.menu.isOpen() && !!document.querySelector('[data-co-act=retry]');
  });
  const open4b = await p.evaluate(() => [window.__why, window.__open]);
  ok(t4b.notices.length === 1 && /creature/.test(t4b.notices[0]) && flat(open4b) === '["danger",true]' && !t4b.scenes.length && t4b.stage === 1 && t4b.button,
    '4 refused with a creature close by: the page and the action stay, nothing runs ' + flat({ notices: t4b.notices, open: open4b, scenes: t4b.scenes }));
  ok(!errors.length, '4 (the stacks) no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// 9. off Lanternfall: an interior and an outdoor map
for (const [map, x, y] of [['sg.office', 5, 6], ['cr.nakayama', 10, 13]]) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, { map, x, y, stage: 1, flags: { ch5_done: map === 'cr.nakayama', cr_called: map === 'cr.nakayama' } });
  const before = await p.evaluate(() => { const W = RB.world.W; return { pc: [W.player.x, W.player.y], comp: W.comp ? [W.comp.x, W.comp.y] : null, npcs: W.npcs.map((n) => n.id).sort(), extras: (W.extras || []).length }; });
  const t9 = await watch(p, clickRetry);
  const after = await p.evaluate(() => { const W = RB.world.W; return { pc: [W.player.x, W.player.y], comp: W.comp ? [W.comp.x, W.comp.y] : null, npcs: W.npcs.map((n) => n.id).sort(), extras: (W.extras || []).length }; });
  ok(t9.map === map && flat(after.pc) === flat(before.pc) && flat(after.comp) === flat(before.comp) && flat(after.npcs) === flat(before.npcs) && after.extras === 0 && !t9.cues.includes('lookroad') &&
    count(t9.said, B.ask) === 1 && count(t9.said, B.read) === 1 && !has(t9.said, B.first) && t9.stage === 2 && !t9.held && !t9.button,
    '9 off Lanternfall (' + map + '): no one walked or moved, no townsfolk, no facing towards the avenue, no paper left in her hand; read: step 2 ' + flat({ before, after, cues: t9.cues, stage: t9.stage }));
  await p.evaluate(async () => { RB.ui.menu.close(); await RB.test.idle(); });
  ok(!errors.length, '9 (' + map + ') no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// 10. after the bell; 11. not offered
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, { map: 'lf.road', x: 33, y: 12, stage: 1, flags: { lf_bell_rung: true }, fresh: ['lf.town:lf.after_town', 'lf.town:lf.mio_start'] });
  const t10a = await watch(p, async () => { await RB.test.go('lf.town', 1, 17, 'right'); await new Promise((r) => setTimeout(r, 1200)); await RB.test.idle(); });
  const t10 = await watch(p, clickRetry);
  ok(t10a.scenes[0] === 'lf.after_town' && !t10a.scenes.includes('lf.mio_start') && t10a.stage === 1 && count(t10.said, B.read) === 1 && t10.stage === 2 && !t10.button,
    '10 after the bell, the town\'s after-bell scene first on arrival, nothing of the recipe; then the retry, read: step 2 ' + flat({ arrival: t10a.scenes, stage: t10.stage }));
  await p.evaluate(async () => { RB.ui.menu.close(); await RB.test.idle(); });
  const none = [];
  for (const o of [{ stage: 'done', flags: { lf_mio_done: true } }, { stage: 1, comp: 'nao' }]) {
    await at(p, Object.assign({ map: 'lf.town', x: 20, y: 17 }, o));
    none.push(await p.evaluate(async () => { RB.ui.menu.open('company'); await new Promise((r) => setTimeout(r, 250)); const r = !!document.querySelector('[data-co-act=retry]'); RB.ui.menu.close(); await RB.test.idle(); return r; }));
  }
  ok(flat(none) === '[false,false]', '11 not offered: a finished quest, or another companion ' + flat(none));
  ok(!errors.length, '10-11 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

await b.close();
srv.close();
console.log(`\nlf_mio_retry: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
