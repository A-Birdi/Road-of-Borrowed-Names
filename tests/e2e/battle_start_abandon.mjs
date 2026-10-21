// A battle still starting when the campaign changes (RBN-QA-077; Agnes 6320303759, 6320312808; Local CL-118): a load
// in the battle's opening moments (its opening fade, before its state exists) leaves nothing of it running over the
// journey that comes next. In Chromium on the built game, from a synthetic campaign of the shipped edition on the
// Mill road (never a player's save), each case on a fresh page:
//  1. a load that works at 0, 50 and 150 ms into a battle's start: 2.5 s later no battle state and no battle screen,
//     the map drawn and not darkened, the mode `world`, the map's song (not the battle's), the creature's flag unset,
//     and the old start never resolved (nothing of it ran on into the loaded journey);
//  2. the established control, a load at 400 ms (the battle open by then): the same;
//  3. a load that fails (an empty slot) and a load that is cancelled (the slot open in another tab; Cancel) at 50 ms:
//     the same, and the journey is the one that was playing, on its map with its song;
//  4. the old start's fade finishing late, after a new battle has opened: the new battle alone on screen, the old
//     start still unresolved;
//  5. the old start's fade failing late while a newer start is itself starting: a load then takes the newer one down
//     too (its mark was not erased), and neither runs on when its own fade ends;
//  6. a start that throws (the mode stack refusing once): a failed load after it changes nothing (no mark left
//     behind), and the next battle opens normally;
//  7. an encounter's preparation question (fx.prep, which offers one thing) as before: Begin now, the window's task
//     then Not now, and Escape each open the battle with the mist still in the room; a load in that battle's opening fade (after the
//     questions) leaves nothing of it.
// Not covered here (a separate item): a load while a preparation question or its task is on screen; that layer is
// not taken down by this change.
// Usage: node tools/build.mjs && node tests/e2e/battle_start_abandon.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const A = 'rw.reedling', B = 'rw.dustmoth';

// a fresh page on the Mill road: the journey saved in slot 1 (and slot 2), its song noted; helpers for the cases
async function fresh() {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const base = await p.evaluate(async () => {
    RB.game.debugStart('rw.millroad', 10, 22, { edition: RB.edition.forNew(), comp: 'suzu', flags: { departed: true } });
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.battleAnim = 'instant'; RB.game.applySettings();
    await RB.save.manualSave(2);
    await RB.save.manualSave(1);
    await new Promise((r) => setTimeout(r, 300));
    const T = (window.__t = { runs: {}, s0: RB.game.s, held: [] });
    // a battle started as play starts one (a creature on the map: its flag set when it is settled); its outcome kept
    T.go = (name, enemy, opts) => { const r = (T.runs[name] = { out: 'pending' }); RB.game.startBattle(enemy, Object.assign({ foeKey: 'qa077_' + name }, opts)).then((v) => { r.out = 'resolved ' + v; }, (e) => { r.out = 'rejected ' + (e && e.message); }); return r; };
    // the next opening fade held until the case lets it go (resolve or reject), the screen fading as usual
    T.hold = () => { const f = RB.ui.fade; RB.ui.fade = (out, ms) => { if (!out) return f(out, ms); RB.ui.fade = f; f(out, ms); return new Promise((res, rej) => T.held.push({ res, rej })); }; };
    T.load = (slot) => { T.res = 'pending'; return RB.game.loadCampaign(slot, 'manual').then((v) => { T.res = 'ok ' + v; }, (e) => { T.res = 'failed'; }); };
    T.now = () => ({ st: !!RB.combat.state(), mode: RB.game.mode(), song: RB.audio.currentSong() });
    T.look = () => {
      const fade = document.querySelector('#overlay > .fade');
      return { combat: !!RB.combat.state(), ui: document.querySelectorAll('.combat-ui').length, mode: RB.game.mode(), drawn: RB.render.worldVisible() && !RB.render.getOverride(), dark: !!fade && fade.classList.contains('on'), veiled: document.body.classList.contains('veiled'), song: RB.audio.currentSong(), map: RB.world.W.map && RB.world.W.map.id, foeFlags: Object.keys(RB.game.s.flags).filter((k) => /^qa077_/.test(k)), inBattle: RB.game.inBattle(), same: RB.game.s === T.s0, res: T.res, runs: Object.fromEntries(Object.entries(T.runs).map(([k, v]) => [k, v.out])) };
    };
    return { song: RB.audio.currentSong(), map: RB.world.W.map.id };
  });
  return { p, errors, ctx, base };
}
const wait = (p, ms) => p.waitForTimeout(ms);
// nothing of a battle left: no state, no screen, the map drawn and not darkened, the mode `world`, the map's song,
// no creature's flag, no battle open, and every start of the case still unresolved
const clean = (a, base, extra) => !a.combat && !a.ui && a.drawn && !a.dark && !a.veiled && a.mode === 'world' && a.song === base.song && a.map === base.map && !a.foeFlags.length && !a.inBattle && Object.values(a.runs).every((o) => o === 'pending') && (!extra || extra(a));
const open = (p) => p.waitForFunction(() => !!RB.combat.state() && !!document.querySelector('.combat-ui') && RB.combat.phase() !== 'idle', null, { timeout: 15000 }).then(() => true, () => false);

// 1-2. a load that works, during the opening fade (0, 50, 150 ms) and once the battle is open (400 ms, the control)
for (const delay of [0, 50, 150, 400]) {
  const { p, errors, ctx, base } = await fresh();
  const at = await p.evaluate(async (delay) => { __t.go('a', 'rw.reedling'); await new Promise((r) => setTimeout(r, delay)); const at = __t.now(); await __t.load(1); return at; }, delay);
  await wait(p, 2500);
  const a = await p.evaluate(() => __t.look());
  const starting = delay < 400;
  ok((starting ? !at.st : at.st) && at.mode === 'combat' && at.song !== base.song && a.res === 'ok true' && clean(a, base),
    `a load that works ${delay} ms into a battle's start (${starting ? 'still starting' : 'open'}: ${JSON.stringify(at)}): 2.5 s later nothing of it left, the map's song "${base.song}" (${JSON.stringify(a)})`);
  ok(!errors.length, `  no page errors ${errors.slice(0, 2).join(' | ')}`);
  await ctx.close();
}

// 3. a load that fails (an empty slot) and one that is cancelled (the slot open in another tab), at 50 ms
for (const how of ['fails (an empty slot)', 'is cancelled (open in another tab: Cancel)']) {
  const { p, errors, ctx, base } = await fresh();
  const cancel = /cancelled/.test(how);
  // (another tab holds the slot: the load asks, and Cancel keeps the journey)
  const held = cancel ? await p.evaluate(() => new Promise((res) => { navigator.locks.request('rbn-slot-2', { ifAvailable: true }, (lock) => { res(!!lock); return lock ? new Promise(() => {}) : undefined; }); })) : true;
  const at = await p.evaluate(async (slot) => { __t.go('a', 'rw.reedling'); await new Promise((r) => setTimeout(r, 50)); const at = __t.now(); __t.load(slot); return at; }, cancel ? 2 : 3);
  let asked = null;
  if (cancel) {
    asked = await p.waitForFunction(() => [...document.querySelectorAll('.csheet .pbtn')].map((x) => x.textContent.trim()).join('|'), null, { timeout: 10000 }).then((h) => h.jsonValue(), () => null);
    await p.evaluate(() => { const x = [...document.querySelectorAll('.csheet .pbtn')].find((e) => /^Cancel$/.test(e.textContent.trim())); if (x) x.click(); });
  }
  await wait(p, 2500);
  const a = await p.evaluate(() => __t.look());
  ok(held && !at.st && at.mode === 'combat' && (!cancel || /Cancel/.test(asked || '')) && a.res === (cancel ? 'ok false' : 'failed') && clean(a, base, (x) => x.same),
    `a load that ${how} 50 ms into a battle's start (${JSON.stringify(at)}${cancel ? ', asked: ' + asked : ''}): the journey that was playing goes on, on its map with its song "${base.song}", nothing of the battle left (${JSON.stringify(a)})`);
  ok(!errors.length, `  no page errors ${errors.slice(0, 2).join(' | ')}`);
  await ctx.close();
}

// 4. the old start's fade finishing late, after a new battle has opened
{
  const { p, errors, ctx, base } = await fresh();
  await p.evaluate(async () => { __t.hold(); __t.go('a', 'rw.reedling'); await new Promise((r) => setTimeout(r, 50)); await __t.load(1); __t.go('b', 'rw.dustmoth'); });
  const opened = await open(p);
  await p.evaluate(() => __t.held[0].res());
  await wait(p, 1500);
  const a = await p.evaluate(() => Object.assign(__t.look(), { who: RB.combat.context() && RB.combat.context().id, members: RB.combat.members() }));
  ok(opened && a.combat && a.ui === 1 && a.who === 'rw.dustmoth' && a.members[0] === 'rw.dustmoth' && a.mode === 'combat' && a.runs.a === 'pending' && a.runs.b === 'pending' && a.res === 'ok true',
    `the abandoned start's fade ends after a new battle opened: the new battle alone on screen, the old start unresolved (${JSON.stringify(a)})`);
  // the new battle, once open, is taken down by a load as an open battle always was
  await p.evaluate(() => __t.load(1));
  await wait(p, 2500);
  const c = await p.evaluate(() => __t.look());
  ok(clean(c, base, (x) => x.runs.b === 'pending'), `  then a load takes the new battle down whole (${JSON.stringify(c)})`);
  ok(!errors.length, `  no page errors ${errors.slice(0, 2).join(' | ')}`);
  await ctx.close();
}

// 5. the old start's fade failing late while a newer start is itself starting
{
  const { p, errors, ctx, base } = await fresh();
  const at = await p.evaluate(async () => {
    __t.hold(); __t.go('a', 'rw.reedling'); await new Promise((r) => setTimeout(r, 50)); await __t.load(1);
    __t.hold(); __t.go('b', 'rw.dustmoth'); await new Promise((r) => setTimeout(r, 50));
    __t.held[0].rej(new Error('a late failure of the old fade'));
    await new Promise((r) => setTimeout(r, 50));
    const at = __t.now();
    await __t.load(1);
    __t.held[1].res();
    return at;
  });
  await wait(p, 2500);
  const a = await p.evaluate(() => __t.look());
  ok(!at.st && at.mode === 'combat' && at.song !== base.song && clean(a, base, (x) => x.res === 'ok true'),
    `an old start's late failure while a newer one is starting (${JSON.stringify(at)}): a load still takes the newer one down, and neither runs on when its fade ends (${JSON.stringify(a)})`);
  ok(!errors.filter((e) => !/a late failure of the old fade/.test(e)).length, `  no page errors ${errors.slice(0, 2).join(' | ')}`);
  await ctx.close();
}

// 6. a start that throws (the mode stack refusing once), then a failed load, then the next battle
{
  const { p, errors, ctx, base } = await fresh();
  await p.evaluate(async () => {
    const push = RB.game.pushMode;
    RB.game.pushMode = () => { RB.game.pushMode = push; throw new Error('qa077: refused once'); };
    __t.go('a', 'rw.reedling');
    await new Promise((r) => setTimeout(r, 300));
    await __t.load(3);
  });
  await wait(p, 600);
  const a = await p.evaluate(() => __t.look());
  ok(/rejected qa077: refused once/.test(a.runs.a) && a.res === 'failed' && !a.combat && !a.ui && a.drawn && !a.dark && a.mode === 'world' && a.song === base.song && a.same,
    `a start that throws, then a failed load: nothing changed by it (the map's song "${base.song}" plays on, the screen not darkened) (${JSON.stringify(a)})`);
  await p.evaluate(() => __t.go('b', 'rw.dustmoth'));
  const opened = await open(p);
  const o = await p.evaluate(() => Object.assign(__t.look(), { who: RB.combat.context() && RB.combat.context().id }));
  ok(opened && o.ui === 1 && o.who === 'rw.dustmoth' && o.mode === 'combat' && o.song !== base.song && !o.dark,
    `  the next battle opens normally (${JSON.stringify(o)})`);
  ok(!errors.filter((e) => !/refused once/.test(e)).length, `  no page errors ${errors.slice(0, 2).join(' | ')}`);
  await ctx.close();
}

// 7. an encounter's preparation questions, unchanged; and a load in its battle's opening fade after them
const pick = (p, re) => p.waitForFunction(() => !!document.querySelector('.csheet .pbtn'), null, { timeout: 15000 })
  .then(() => p.evaluate((m) => { const x = [...document.querySelectorAll('.csheet .pbtn')].find((e) => new RegExp(m, 'i').test(e.textContent)); x.click(); return x.textContent.trim(); }, re));
for (const how of ['Begin now', 'the window\'s task, then Not now', 'Escape']) {
  const { p, errors, ctx } = await fresh();
  await p.evaluate(() => { __t.enc = 'pending'; RB.game.startEncounter('fx.prep', {}).then((r) => { __t.enc = r; }); });
  const asked = [];
  if (how === 'Escape') {
    await p.waitForFunction(() => !!document.querySelector('.csheet .pbtn'), null, { timeout: 15000 });
    asked.push(await p.evaluate(() => [...document.querySelectorAll('.csheet .pbtn')].map((x) => x.textContent.trim()).join('|')));
    await p.keyboard.press('Escape');
  } else if (how === 'Begin now') asked.push(await pick(p, '^Begin now$'));
  else {
    asked.push(await pick(p, 'Open the window'));
    await p.waitForSelector('.chal [data-a=leave]', { timeout: 15000 });
    await p.click('.chal [data-a=leave]');
    asked.push('Not now'); // (fx.prep offers one thing only, so no second question follows)
  }
  const opened = await open(p);
  const a = await p.evaluate(() => ({ enc: RB.combat.state() && RB.combat.state().enc && RB.combat.state().enc.def.id, mist: RB.combat.shown().foes[0].shroud, mode: RB.game.mode(), ui: document.querySelectorAll('.combat-ui').length, out: __t.enc }));
  ok(opened && a.enc === 'fx.prep' && a.mist === true && a.mode === 'combat' && a.ui === 1 && a.out === 'pending',
    `preparation, ${how} (${asked.join(' → ')}): the battle opens with the mist still in the room (${JSON.stringify(a)})`);
  ok(!errors.length, `  no page errors ${errors.slice(0, 2).join(' | ')}`);
  await ctx.close();
}
{
  const { p, errors, ctx, base } = await fresh();
  await p.evaluate(() => { __t.enc = 'pending'; RB.game.startEncounter('fx.prep', {}).then((r) => { __t.enc = r; }); });
  await pick(p, '^Begin now$');
  const at = await p.evaluate(async () => { await new Promise((r) => setTimeout(r, 50)); const at = __t.now(); await __t.load(1); return at; });
  await wait(p, 2500);
  const a = await p.evaluate(() => Object.assign(__t.look(), { enc: __t.enc }));
  ok(!at.st && at.mode === 'combat' && clean(a, base, (x) => x.enc === 'pending'),
    `a load 50 ms after Begin now (the encounter's opening fade: ${JSON.stringify(at)}): nothing of it left, the encounter unresolved (${JSON.stringify(a)})`);
  ok(!errors.length, `  no page errors ${errors.slice(0, 2).join(' | ')}`);
  await ctx.close();
}

console.log(`\nbattle_start_abandon: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
