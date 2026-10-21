// A preparation question or task on screen when the campaign changes (RBN-QA-078; Agnes 6321731391, 6322108981; Local
// CL-124, CL-125): the battle still starting owns the sheet or task it is showing, and leaving it takes that down
// unanswered: nothing of it stays over the journey that comes next, nothing of it is recorded or introduced there, the
// old start never resolves, and a newer start is untouched. A latent engine defect: in the shipped content only the
// development fixture fx.prep has a preparation (no map, scene or quest starts it). In Chromium on the built game,
// from a synthetic campaign of the shipped edition on the Mill road (never a player's save), each case on a fresh page:
//  1. on screen when the load comes: the first question (fx.prep's "Look around first?"), its task (the window), and
//     with a test-local encounter offering two things, the second question ("Anything else before you begin?") and its
//     task; each with a load that works, one that fails (an empty slot) and one that is cancelled (the slot open in
//     another tab: Cancel):
//     - after the load: no preparation sheet or task in the page, no layer open, no task active, the mode `world`,
//       and the encounter's start unresolved;
//     - then the stale surface answered through its own (now detached) buttons: the journey's learning record (its
//       items, introductions and counts) unchanged, no page error; and Enter and Escape reach the map as always
//       (Escape opens the game's menu, and closes it again); nothing left open, the start still unresolved;
//     - a newer encounter started then asks its own first question, and Begin now opens its battle.
//  2. ordinary preparation, unchanged: the window's task answered opens the battle without the mist, and records
//     the task (c:fx_prep seen and answered once more); with two things offered, both answered, the battle opens.
// (Begin now, the task's Not now and Escape on the question, and a load in the opening fade after the questions,
// are battle_start_abandon's case 7.)
// Usage: node tools/build.mjs && node tests/e2e/prep_abandon.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

// a fresh page on the Mill road: the journey saved in slots 1 and 2; helpers for the cases
async function fresh() {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(async () => {
    RB.game.debugStart('rw.millroad', 10, 22, { edition: RB.edition.forNew(), comp: 'suzu', flags: { departed: true } });
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.battleAnim = 'instant'; RB.game.applySettings();
    await RB.save.manualSave(2);
    await RB.save.manualSave(1);
    await new Promise((r) => setTimeout(r, 300));
    const T = (window.__t = {});
    // fx.prep with a second thing to do (test-local: the shipped fixture offers one), so a second question is asked
    const fx = RB.content.encounters['fx.prep'];
    T.two = Object.assign({}, fx, { prep: fx.prep.concat([{ id: 'door', label: { jp: '{戸|と} を {開|あ}ける', en: 'Prop the door open' }, task: fx.prep[0].task, effect: {} }]) });
    T.go = (def) => { T.enc = 'pending'; RB.game.startEncounter(def, {}).then((r) => { T.enc = 'resolved ' + r; }, (e) => { T.enc = 'rejected ' + (e && e.message); }); };
    T.load = (slot) => { T.res = 'pending'; return RB.game.loadCampaign(slot, 'manual').then((v) => { T.res = 'ok ' + v; }, () => { T.res = 'failed'; }); };
    // the journey's learning record as it stands (its items, introductions and counts)
    T.learn = () => JSON.stringify(RB.game.s.learn);
    T.item = () => { const r = RB.game.s.learn.items['c:fx_prep']; return r ? { seen: r.seen, ok: r.ok, box: r.box } : null; };
    T.look = () => ({
      sheets: [...document.querySelectorAll('.csheet')].filter((e) => e.isConnected).length, tasks: [...document.querySelectorAll('.chal')].filter((e) => e.isConnected).length,
      top: RB.ui.topLayer() ? RB.ui.topLayer().name : null, active: RB.challenge.active(), panel: document.body.classList.contains('in-panel'),
      mode: RB.game.mode(), combat: !!RB.combat.state(), enc: T.enc, res: T.res,
    });
  });
  return { p, errors, ctx };
}
const sheet = (p) => p.waitForFunction(() => [...document.querySelectorAll('.csheet .pbtn')].map((x) => x.textContent.trim()).join('|') || null, null, { timeout: 15000 }).then((h) => h.jsonValue(), () => null);
const pick = (p, re) => p.evaluate((m) => { const x = [...document.querySelectorAll('.csheet .pbtn')].find((e) => new RegExp(m, 'i').test(e.textContent)); if (x) x.click(); return !!x; }, re);
const task = (p) => p.waitForSelector('.chal .mc .btn', { timeout: 15000 }).then(() => true, () => false);
// the window's (and the door's) task answered rightly, then Continue
async function answer(p) {
  await p.locator('.chal .mc .btn').filter({ hasText: /開/ }).first().click();
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go', { timeout: 8000 });
  await p.click('.fbwrap[data-fb=ok] .fb-go');
}
const open = (p) => p.waitForFunction(() => !!RB.combat.state() && !!document.querySelector('.combat-ui') && RB.combat.phase() !== 'idle', null, { timeout: 15000 }).then(() => true, () => false);

// 1. a load while each surface is on screen
const SURFACES = [
  { at: 'the first question', two: false, steps: [] },
  { at: 'the first task', two: false, steps: ['window'] },
  { at: 'the second question', two: true, steps: ['window', 'answer'] },
  { at: 'the second task', two: true, steps: ['window', 'answer', 'door'] },
];
const LOADS = [['works', 1], ['fails (an empty slot)', 3], ['is cancelled (open in another tab: Cancel)', 2]];
for (const S of SURFACES) for (const [how, slot] of LOADS) {
  const { p, errors, ctx } = await fresh();
  const cancel = slot === 2;
  const held = cancel ? await p.evaluate(() => new Promise((res) => { navigator.locks.request('rbn-slot-2', { ifAvailable: true }, (lock) => { res(!!lock); return lock ? new Promise(() => {}) : undefined; }); })) : true;
  await p.evaluate((two) => __t.go(two ? __t.two : 'fx.prep'), S.two);
  let shown = await sheet(p);
  for (const s of S.steps) {
    if (s === 'window') { await pick(p, 'Open the window'); shown = (await task(p)) ? 'task' : null; }
    else if (s === 'answer') { await answer(p); shown = await sheet(p); }
    else if (s === 'door') { await pick(p, 'Prop the door'); shown = (await task(p)) ? 'task' : null; }
  }
  const isTask = /task/.test(S.at);
  const second = /second/.test(S.at);
  // the stale surface's own controls, kept to be answered after the load
  const before = await p.evaluate((isTask) => {
    window.__stale = isTask ? { right: [...document.querySelectorAll('.chal .mc .btn')].find((e) => /開/.test(e.textContent)), leave: document.querySelector('.chal [data-a=leave]') } : { btns: [...document.querySelectorAll('.csheet .pbtn')] };
    return Object.assign(__t.look(), { item: __t.item() });
  }, isTask);
  await p.evaluate((slot) => { __t.load(slot); }, slot);
  let asked = null;
  if (cancel) {
    asked = await p.waitForFunction(() => [...document.querySelectorAll('.csheet .pbtn')].map((x) => x.textContent.trim()).filter((t) => /Cancel/.test(t)).join('|') || null, null, { timeout: 10000 }).then((h) => h.jsonValue(), () => null);
    await p.evaluate(() => { const x = [...document.querySelectorAll('.csheet .pbtn')].find((e) => /^Cancel$/.test(e.textContent.trim())); if (x) x.click(); });
  }
  await p.waitForFunction(() => __t.res !== 'pending', null, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(600);
  const after = await p.evaluate(() => Object.assign(__t.look(), { learn: __t.learn(), item: __t.item() }));
  const want = slot === 1 ? 'ok true' : cancel ? 'ok false' : 'failed';
  const surfaceOk = isTask ? before.tasks === 1 && before.active : before.sheets === 1 && (second ? /Prop the door/.test(shown || '') && !/Open the window/.test(shown || '') : /Open the window/.test(shown || ''));
  ok(held && surfaceOk && after.res === want && !after.sheets && !after.tasks && !after.top && !after.active && !after.panel && after.mode === 'world' && !after.combat && after.enc === 'pending' && (!cancel || /Cancel/.test(asked || '')),
    `${S.at} on screen (${isTask ? 'a task' : shown}), a load that ${how} (${after.res}${cancel ? '; its own question answered: ' + asked : ''}): taken down, nothing open, the start unresolved (${JSON.stringify(Object.assign({}, after, { learn: undefined }))})`);
  // the stale surface answered through its own detached buttons, then Enter and Escape
  await p.evaluate(async (isTask) => {
    const z = window.__stale;
    if (isTask) {
      if (z.right) z.right.click();
      await new Promise((r) => setTimeout(r, 300));
      const go = z.right && z.right.closest('.chal') && z.right.closest('.chal').querySelector('.fb-go');
      if (go) go.click();
    } else if (z.btns[0]) z.btns[0].click();
  }, isTask);
  // then the keys go to the map as they always do: Enter (nothing in front of you), Escape (the game's menu opens),
  // Escape again (it closes)
  await p.keyboard.press('Enter');
  await p.waitForTimeout(200);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(400);
  const keys = await p.evaluate(() => __t.look());
  await p.keyboard.press('Escape');
  await p.waitForTimeout(500);
  const late = await p.evaluate(() => Object.assign(__t.look(), { learn: __t.learn(), item: __t.item() }));
  ok(late.learn === after.learn && keys.top === 'menu' && !keys.sheets && !keys.tasks && !keys.active && !late.sheets && !late.tasks && !late.top && !late.active && late.mode === 'world' && !late.combat && late.enc === 'pending',
    `  answered late through its own buttons, then Enter and Escape: the ${slot === 1 ? 'loaded' : 'same'} journey's learning record unchanged (c:fx_prep ${JSON.stringify(after.item)} → ${JSON.stringify(late.item)}); the keys reach the map (Escape opened ${keys.top}, and closed it); nothing left open, the start still unresolved (${JSON.stringify(Object.assign({}, late, { learn: undefined, item: undefined }))})`);
  // a newer start: its own first question, and Begin now opens its battle
  await p.evaluate(() => { __t.go('fx.prep'); });
  const q = await sheet(p);
  await pick(p, '^Begin now$');
  const opened = await open(p);
  ok(/Open the window/.test(q || '') && /Begin now/.test(q || '') && opened && (await p.evaluate(() => document.querySelectorAll('.combat-ui').length === 1)),
    `  a newer encounter asks its own question (${q}) and Begin now opens its battle (${opened})`);
  ok(!errors.length, `  no page errors ${errors.slice(0, 2).join(' | ')}`);
  await ctx.close();
}

// 2. ordinary preparation: the task answered opens the battle without the mist, and is recorded; two things, both
{
  const { p, errors, ctx } = await fresh();
  const i0 = await p.evaluate(() => __t.item());
  await p.evaluate(() => __t.go('fx.prep'));
  await sheet(p);
  await pick(p, 'Open the window');
  await task(p);
  await answer(p);
  const opened = await open(p);
  const a = await p.evaluate(() => ({ mist: RB.combat.shown().foes[0].shroud, enc: RB.combat.state().enc.def.id, item: __t.item(), intro: !!(RB.game.s.learn.intro || {})['c:fx_prep'] }));
  ok(opened && a.enc === 'fx.prep' && a.mist === false && a.item && a.item.seen === ((i0 && i0.seen) || 0) + 1 && a.item.ok === ((i0 && i0.ok) || 0) + 1 && a.intro,
    `ordinary preparation: the window's task answered, the battle opens without the mist, the task recorded and introduced (c:fx_prep ${JSON.stringify(i0)} → ${JSON.stringify(a.item)})`);
  ok(!errors.length, `  no page errors ${errors.slice(0, 2).join(' | ')}`);
  await ctx.close();
}
{
  const { p, errors, ctx } = await fresh();
  await p.evaluate(() => __t.go(__t.two));
  const q1 = await sheet(p);
  await pick(p, 'Open the window'); await task(p); await answer(p);
  const q2 = await sheet(p);
  await pick(p, 'Prop the door'); await task(p); await answer(p);
  const opened = await open(p);
  const a = await p.evaluate(() => ({ mist: RB.combat.shown().foes[0].shroud, item: __t.item() }));
  ok(/Open the window/.test(q1 || '') && /Prop the door/.test(q1 || '') && /Prop the door/.test(q2 || '') && !/Open the window/.test(q2 || '') && opened && a.mist === false && a.item && a.item.seen === 2,
    `ordinary preparation, two things offered: asked twice (${q1} / ${q2}), both answered, the battle opens without the mist (c:fx_prep ${JSON.stringify(a.item)})`);
  ok(!errors.length, `  no page errors ${errors.slice(0, 2).join(' | ')}`);
  await ctx.close();
}

console.log(`\nprep_abandon: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
