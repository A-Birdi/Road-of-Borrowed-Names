// An open encounter without creatures belongs to the journey it began in (Agnes 6856629013; Local CL-806, CL-807;
// Cloud CC-576, CC-577), in the browser, on journeys made for the test and the stand-in save slots of a fresh context
// (never a real save). Every sheet is driven by real clicks; the encounter is the fixture fx.dispute (a conversation
// with questions, a lasting choice, the companion's offer, Wait, and endings) and, for a procedure, fx.sluice.
//  1. controls, in one journey: Step away resolves 'flee' (and, from a scene, ends it); "Choose something else" on a
//     question offers the choices again; a procedure stepped away from keeps its position; an encounter played to its
//     end shows its conclusion, records its outcome and resolves, and the scene that started it goes on (_res, _enc);
//  2. another journey loaded (another slot, then the same slot) at each of its seven waits: the choices, the Step away
//     confirm, the Wait confirm, the question, the what-you-meant confirm, the companion's offer, the conclusion. Each
//     time: no encounter sheet, choice card, confirm or question is left; RB.encScreen.current() is null; the encounter's promise
//     has not resolved; the scene that started it has not gone on; no 'encounter' mode is left; the journey loaded is
//     exactly as it was once its load had finished, and still after the old controls (kept from before the load) are
//     pressed; the old journey in memory is exactly as it was at the interruption (no finish); its saved record is
//     unchanged. Compared fields, here and below: learn, meter, flags, vars, backlog, enc, notebook, inv;
//  3. at the question: untouched, after "I don't know" was pressed but before Continue, and after the right answer but
//     before Continue (what the answer already recorded stays; nothing more is written);
//  4. after an abandonment: a new encounter opens and runs in the journey loaded, and a battle starts there; an old
//     control pressed while a newer encounter is open leaves that encounter, its mode and RB.encScreen.current() alone;
//  5. a load after an encounter finished normally does nothing more to it;
//  6. a load that does not happen: the save cannot be read; "Cancel" when the save is open in another tab; the old
//     edition's offer declined (that last one stood in for: RB.edition.isOld and RB.ui.ngplus.fromOld). Started from a
//     scene and without one, and once after a question was answered: the same journey stays, the encounter is gone,
//     the mode is the world's, and the journey is exactly as it was at the interruption (what was done before stays);
//  7. no page errors.
// Not compared: playtime, and the load's own bookkeeping outside the named fields. Usage: node tools/build.mjs && node
// tests/e2e/encounter_owner.mjs   (RB_PAGE=<file> for another page)
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
const wait = (ms) => p.waitForTimeout(ms);
const flat = (x) => JSON.stringify(x);

await p.evaluate(async () => {
  RB.test.disable();
  const quiet = (s) => { for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true; };
  const o = RB.game.debugStart('rw.village', 22, 18, { edition: 2, comp: 'nao', flags: { departed: true, ch2_done: true } });
  quiet(o); o.player.name = 'Other'; o.learn.kanaKnown = 'both'; o.learn.profile = 'E';
  await RB.save.writeSlot(2, o, { force: true });
  const s = RB.game.debugStart('rw.village', 22, 18, { edition: 2, comp: 'mio', flags: { departed: true, ch2_done: true } });
  quiet(s); s.player.name = 'Enc'; s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
  await RB.save.writeSlot(1, s, { force: true });
  RB.script.add('@scene zz.enc_scene\n!encounter fx.dispute\n!var zz_after = 1\n', 'zz');
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  window.__sleep = sleep;
  window.__load = async (slot) => {
    try { await RB.game.loadCampaign(slot, 'manual'); } catch (e) { window.__loadErr = String(e && e.message || e); }
    Object.assign(RB.game.settings, { textSpeed: 'instant', input: 'choice' }); RB.game.applySettings();
    await sleep(500);
  };
  const F = ['learn', 'meter', 'flags', 'vars', 'backlog', 'enc', 'notebook', 'inv'];
  window.__snapOf = (s) => JSON.stringify(F.map((k) => s[k] === undefined ? null : s[k]));
  window.__snap = () => window.__snapOf(RB.game.s);
  window.__saved = async (slot) => { const r = await RB.save.read(slot, 'manual'); return window.__snapOf(r.state); };
  window.__modes = () => ((RB.game.G && RB.game.G.modes) || []).slice();
  // start fx.dispute (or another): directly, or from the test scene
  window.__start = (how, id) => {
    window.__res = 'pending';
    if (how === 'scene') RB.script.run('zz.enc_scene');
    else RB.game.startEncounter(id || 'fx.dispute', {}).then((v) => { window.__res = v; });
  };
  window.__st = () => ({ sheet: !!document.querySelector('.enc-sheet'), cards: document.querySelectorAll('.rcard').length, conf: [...document.querySelectorAll('.confirm-scrim .q')].map((x) => x.textContent), chal: !!document.querySelector('.chal'), end: !!document.querySelector('.enc-end') });
  const card = (re) => [...document.querySelectorAll('.enc-sheet .rcard:not([disabled])')].find((x) => re.test((x.querySelector('.rc-en') || x).textContent));
  const answer = async (how) => {
    const chal = document.querySelector('.chal');
    if (!chal) return 'no sheet';
    if (how === 'leave') { chal.querySelector('[data-a=leave]').click(); await sleep(500); return 'left'; }
    if (how === 'reveal') chal.querySelector('[data-a=reveal]').click();
    else {
      const tab = chal.querySelector('[data-mode=choice]');
      if (tab && tab.getAttribute('aria-selected') !== 'true') { tab.click(); await sleep(200); }
      const st = RB.challenge.current();
      const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
      const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.learnUi.mixed(o.en) + '</span>' : '');
      const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => txt(html(o)));
      const bt = [...chal.querySelectorAll('.mc .btn, .mc .choice')].find((x) => right.includes(x.textContent.replace(/\s+/g, ' ').trim()));
      if (!bt) { chal.querySelector('[data-a=reveal]').click(); how = 'revealed (no choice)'; } else bt.click();
    }
    await sleep(400);
    return how;
  };
  const cont = async () => { const c = [...document.querySelectorAll('.chal .fbwrap button')].find((x) => /Continue/.test(x.textContent)); if (c) c.click(); await sleep(600); };
  const confirmBtn = (re) => [...document.querySelectorAll('.confirm-scrim button')].find((x) => re.test(x.textContent));
  window.__answer = answer; window.__cont = cont;
  // bring the open encounter to one of its waits; what it is, and the controls on screen there (kept for later)
  window.__to = async (at) => {
    await sleep(500);
    if (at === 'away') { document.querySelector('.enc-sheet [data-away]').click(); await sleep(300); }
    else if (at === 'wait') { card(/^\s*Wait/).click(); await sleep(300); }
    else if (at === 'question' || at === 'q-reveal' || at === 'q-right') {
      card(/calm down/).click(); await sleep(600);
      if (at === 'q-reveal') await answer('reveal');
      if (at === 'q-right') await answer('right');
    } else if (at === 'companion') {
      card(/calm down/).click(); await sleep(600); await answer('reveal'); await cont();
    } else if (at === 'means') {
      card(/to blame/).click(); await sleep(600); await answer('reveal'); await cont();
    } else if (at === 'conclusion') {
      for (let k = 0; k < 25 && !document.querySelector('.enc-end'); k++) {
        const wc = card(/^\s*Wait/); if (!wc) break; wc.click(); await sleep(250);
        const yes = confirmBtn(/^Wait$/); if (yes) { yes.click(); await sleep(250); }
        const no = confirmBtn(/Nothing this time/); if (no) { no.click(); await sleep(250); }
      }
    }
    await sleep(300);
    window.__kept = [...document.querySelectorAll('.enc-sheet button, .confirm-scrim button, .chal button')];
    return window.__st();
  };
  // press every control kept from before the load (detached now), then let anything it set off settle
  window.__pressKept = async () => { let n = 0; for (const x of window.__kept || []) { try { x.click(); n++; } catch (e) { /* gone */ } } await sleep(900); return n; };
  window.__cardFor = card; window.__confirmBtn = confirmBtn;
});

const st = () => p.evaluate(() => window.__st());

// ---- 1. controls, in one journey ------------------------------------------------------------------------------------
{
  await p.evaluate(() => window.__load(1));
  await p.evaluate(() => window.__start('direct'));
  await p.evaluate(() => window.__to('away'));
  await p.evaluate(() => window.__confirmBtn(/^Step away$/).click());
  await wait(700);
  const r = await p.evaluate(() => ({ res: window.__res, cur: RB.encScreen.current(), modes: window.__modes() }));
  ok(r.res && r.res.result === 'flee' && r.cur === null && !r.modes.includes('encounter'), '1 one journey: Step away resolves flee; nothing left ' + flat(r));
}
{
  await p.evaluate(() => window.__load(1));
  await p.evaluate(() => window.__start('scene'));
  await p.evaluate(() => window.__to('away'));
  await p.evaluate(() => window.__confirmBtn(/^Step away$/).click());
  await wait(900);
  const r = await p.evaluate(() => ({ res: RB.game.s.vars._res, after: RB.game.s.vars.zz_after, running: RB.script.isRunning(), modes: window.__modes() }));
  ok(r.res === 0 && !r.after && !r.running && !r.modes.includes('encounter'), '1 one journey, from a scene: Step away ends the scene (_res 0, nothing after it) ' + flat(r));
}
{
  await p.evaluate(() => window.__load(1));
  await p.evaluate(() => window.__start('direct'));
  await p.evaluate(() => window.__to('question'));
  const a = await p.evaluate(() => window.__answer('leave'));
  const r = await p.evaluate(() => ({ st: window.__st(), cards: document.querySelectorAll('.enc-sheet .rcard:not([disabled])').length, res: window.__res }));
  ok(a === 'left' && r.st.sheet && !r.st.chal && r.cards > 0 && r.res === 'pending', '1 one journey: "Choose something else" offers the choices again ' + flat(r));
  await p.evaluate(async () => { document.querySelector('.enc-sheet [data-away]').click(); await window.__sleep(300); window.__confirmBtn(/^Step away$/).click(); await window.__sleep(500); });
}
{
  await p.evaluate(() => window.__load(1));
  await p.evaluate(() => window.__start('direct', 'fx.sluice'));
  const r = await p.evaluate(async () => {
    await window.__sleep(500);
    const c = [...document.querySelectorAll('.enc-sheet .rcard:not([disabled])')][0]; c.click(); await window.__sleep(600);
    if (document.querySelector('.chal')) { await window.__answer('right'); await window.__cont(); }
    const yes = window.__confirmBtn(/Yes, do it/); if (yes) { yes.click(); await window.__sleep(500); }
    const step = RB.encScreen.current() && RB.encScreen.current().st.enc.proc ? RB.encScreen.current().st.enc.proc.step : null;
    document.querySelector('.enc-sheet [data-away]').click(); await window.__sleep(300);
    window.__confirmBtn(/^Step away$/).click(); await window.__sleep(600);
    // kept under the procedure's own id
    const procs = (RB.game.s.enc && RB.game.s.enc.proc) || {}, ids = Object.keys(procs);
    return { step, ids, kept: ids.length === 1 ? procs[ids[0]].step : null, res: window.__res };
  });
  ok(r.res && r.res.result === 'flee' && r.kept != null && r.kept === r.step, '1 one journey: a procedure stepped away from keeps its position ' + flat(r));
}
{
  await p.evaluate(() => window.__load(1));
  await p.evaluate(() => window.__start('scene'));
  const s0 = await p.evaluate(() => window.__to('conclusion'));
  await p.evaluate(async () => { const c = document.querySelector('.enc-sheet .enc-end') && document.querySelector('.enc-sheet [data-ok]'); if (c) c.click(); await window.__sleep(900); });
  const r = await p.evaluate(() => ({ res: RB.game.s.vars._res, enc: RB.game.s.vars._enc, after: RB.game.s.vars.zz_after, cur: RB.encScreen.current(), modes: window.__modes() }));
  ok(s0.end && r.enc && r.after === 1 && r.cur === null && !r.modes.includes('encounter'), '1 one journey, from a scene, to its end: the conclusion, then the scene goes on (_enc names it) ' + flat(r));
}

// ---- 2, 3. another journey loaded at a wait --------------------------------------------------------------------------
async function staleCase(name, o) {
  await p.evaluate(() => window.__load(1));
  await p.evaluate((how) => window.__start(how), o.how || 'direct');
  const at = await p.evaluate((at) => window.__to(at), o.at);
  const savedA = await p.evaluate(() => window.__saved(1));
  await p.evaluate(() => { window.__old = RB.game.s; window.__oldAt = window.__snapOf(window.__old); });
  await p.evaluate((slot) => window.__load(slot), o.into);
  const into = await p.evaluate(() => RB.game.s.player.name);
  const before = await p.evaluate(() => window.__snap());
  const left = await p.evaluate(() => ({ st: window.__st(), cur: RB.encScreen.current(), modes: window.__modes() }));
  const pressed = await p.evaluate(() => window.__pressKept());
  const after = await p.evaluate(() => window.__snap());
  const r = await p.evaluate(() => ({ st: window.__st(), res: window.__res, cur: RB.encScreen.current(), modes: window.__modes(), oldSame: window.__snapOf(window.__old) === window.__oldAt, after: RB.game.s.vars.zz_after, r: RB.game.s.vars._res }));
  const savedA2 = await p.evaluate(() => window.__saved(1));
  const gone = (x) => !x.sheet && !x.cards && !x.conf.length && !x.chal;
  const good = o.check(at) && gone(left.st) && left.cur === null && !left.modes.includes('encounter') && gone(r.st) && r.res === 'pending' && r.cur === null && !r.modes.includes('encounter')
    && before === after && r.oldSame && savedA === savedA2 && r.after === undefined && r.r === undefined;
  ok(good, '2 ' + name + ' (into ' + into + '): nothing left on screen or as a mode; current() null; not resolved; the journey loaded unchanged, also after ' + pressed + ' old controls were pressed; the old journey as at the interruption; its saved record unchanged '
    + flat({ at, left, r, same: before === after, savedSame: savedA === savedA2 }));
}
const AT = [
  ['the choices', 'choices', (s) => s.sheet && !s.conf.length && !s.chal],
  ['the Step away confirm', 'away', (s) => s.conf.some((q) => /Step away/.test(q))],
  ['the Wait confirm', 'wait', (s) => s.conf.some((q) => /^Wait/.test(q))],
  ['the question', 'question', (s) => s.chal],
  ['the what-you-meant confirm', 'means', (s) => s.conf.length > 0 && !s.conf.some((q) => /could add/.test(q))],
  ['the companion\'s offer', 'companion', (s) => s.conf.some((q) => /could add/.test(q))],
  ['the conclusion', 'conclusion', (s) => s.end],
];
for (const [name, at, check] of AT) {
  await staleCase(name + ', another slot loaded', { at, into: 2, check });
  await staleCase(name + ', the same slot loaded again', { at, into: 1, check });
}
await staleCase('from a scene, at the choices, another slot loaded (the scene does not go on)', { how: 'scene', at: 'choices', into: 2, check: (s) => s.sheet });
await staleCase('3 the question after "I don\'t know", before Continue, another slot loaded', { at: 'q-reveal', into: 2, check: (s) => s.chal });
await staleCase('3 the question after the right answer, before Continue, the same slot loaded again', { at: 'q-right', into: 1, check: (s) => s.chal });

// ---- 4. after an abandonment ----------------------------------------------------------------------------------------
{
  await p.evaluate(() => window.__load(1));
  await p.evaluate(() => window.__start('direct'));
  await p.evaluate(() => window.__to('away'));
  await p.evaluate(() => window.__load(2));
  // a new encounter in the journey loaded, then the old controls pressed while it is open
  const r = await p.evaluate(async () => {
    const res2 = { v: 'pending' };
    RB.game.startEncounter('fx.dispute', {}).then((v) => { res2.v = v; });
    await window.__sleep(600);
    const open = !!document.querySelector('.enc-sheet');
    const curNew = RB.encScreen.current();
    await window.__pressKept();
    const still = { sheet: !!document.querySelector('.enc-sheet'), same: RB.encScreen.current() === curNew && curNew !== null, mode: window.__modes().includes('encounter') };
    // it runs: Step away
    document.querySelector('.enc-sheet [data-away]').click(); await window.__sleep(300);
    window.__confirmBtn(/^Step away$/).click(); await window.__sleep(600);
    return { open, still, res2: res2.v, oldRes: window.__res, modes: window.__modes() };
  });
  ok(r.open && r.still.sheet && r.still.same && r.still.mode && r.res2 && r.res2.result === 'flee' && r.oldRes === 'pending' && !r.modes.includes('encounter'),
    '4 after an abandonment: a new encounter opens and runs in the journey loaded; old controls pressed meanwhile leave it, its mode and current() alone ' + flat(r));
  const bt = await p.evaluate(async () => {
    const lead = Object.values(RB.content.encounters).find((d) => d.lead);
    const enemy = typeof lead.lead === 'string' ? lead.lead : lead.lead.enemy;
    let started = false;
    RB.game.startBattle(enemy, {}).then(() => {});
    for (let i = 0; i < 40 && !started; i++) { await window.__sleep(150); started = !!(RB.combat && RB.combat.state && RB.combat.state()); }
    return { enemy, started };
  });
  ok(bt.started, '4 after an abandonment: a battle starts in the journey loaded ' + flat(bt));
  await p.evaluate(() => window.__load(2));
}

// ---- 5. a load after a normal finish ----------------------------------------------------------------------------------
{
  await p.evaluate(() => window.__load(1));
  await p.evaluate(() => window.__start('direct'));
  await p.evaluate(() => window.__to('away'));
  await p.evaluate(() => window.__confirmBtn(/^Step away$/).click());
  await wait(700);
  await p.evaluate(() => { window.__old = RB.game.s; window.__oldAt = window.__snapOf(window.__old); window.__res1 = window.__res; });
  await p.evaluate(() => window.__load(2));
  const r = await p.evaluate(() => ({ oldSame: window.__snapOf(window.__old) === window.__oldAt, res: window.__res === window.__res1, st: window.__st(), modes: window.__modes() }));
  ok(r.oldSame && r.res && !r.st.sheet && !r.modes.includes('encounter'), '5 a load after an encounter finished normally does nothing more to it ' + flat(r));
}

// ---- 6. a load that does not happen ---------------------------------------------------------------------------------
async function failedCase(name, o) {
  await p.evaluate(() => window.__load(1));
  await p.evaluate((how) => window.__start(how), o.how);
  await p.evaluate((at) => window.__to(at), o.at);
  if (o.answered) await p.evaluate(async () => { await window.__answer('right'); await window.__cont(); const no = window.__confirmBtn(/Nothing this time/); if (no) { no.click(); await window.__sleep(400); } });
  await p.evaluate(() => { window.__old = RB.game.s; window.__oldAt = window.__snapOf(window.__old); window.__loadErr = null; });
  const learned = await p.evaluate(() => Object.keys(RB.game.s.learn.items || {}).length);
  await p.evaluate(async (kind) => {
    if (kind === 'unreadable') { await window.__load(7); return; }
    if (kind === 'busy') {
      const claim = RB.save.claim; RB.save.claim = async () => { RB.save.claim = claim; return 'busy'; };
      const pr = window.__load(2);
      await window.__sleep(400);
      const c = window.__confirmBtn(/^Cancel$/); if (c) c.click();
      await pr; return;
    }
    if (kind === 'old') {
      const isOld = RB.edition.isOld, from = RB.ui.ngplus.fromOld;
      RB.edition.isOld = () => true; RB.ui.ngplus.fromOld = async () => false;
      try { await window.__load(2); } finally { RB.edition.isOld = isOld; RB.ui.ngplus.fromOld = from; }
    }
  }, o.kind);
  await wait(600);
  const r = await p.evaluate(() => ({ same: RB.game.s === window.__old, name: RB.game.s.player.name, st: window.__st(), cur: RB.encScreen.current(), modes: window.__modes(), mode: RB.game.mode(), snapSame: window.__snapOf(RB.game.s) === window.__oldAt, res: window.__res, after: RB.game.s.vars.zz_after, err: window.__loadErr }));
  ok(r.same && !r.st.sheet && !r.st.conf.length && !r.st.chal && r.cur === null && !r.modes.includes('encounter') && r.mode === 'world' && r.snapSame && r.res === 'pending' && r.after === undefined && (!o.answered || learned > 0),
    '6 ' + name + ': the same journey; the encounter gone; the world\'s mode; the journey as at the interruption ' + flat(Object.assign({ learned }, r)));
}
await failedCase('a save that cannot be read, from a scene, at the choices', { kind: 'unreadable', how: 'scene', at: 'choices' });
await failedCase('a save that cannot be read, started without a scene, at the Step away confirm', { kind: 'unreadable', how: 'direct', at: 'away' });
await failedCase('"Cancel" when the save is open in another tab, from a scene, at the question', { kind: 'busy', how: 'scene', at: 'question' });
await failedCase('"Cancel" when the save is open in another tab, started without a scene, after a question answered', { kind: 'busy', how: 'direct', at: 'question', answered: true });
await failedCase('the old edition\'s offer declined (stood in for), started without a scene, at the choices', { kind: 'old', how: 'direct', at: 'choices' });

ok(!errors.length, '7 no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
await ctx.close(); await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
