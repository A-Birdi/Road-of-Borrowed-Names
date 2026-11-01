// The Courier Who Never Arrived, at the hut on the pass (Agnes 6553382240; Local CL-588, CL-590, CL-592; Cloud CC-427,
// CC-428). After the ten-round fade he steps you back two tiles, and from x 14–16 (and from Genta's talk) the first
// step was still inside the trigger, which started him again before the retreat had finished. His trigger now holds
// only while his own scene is not running. The retreat can still end inside (its stated limit): a later step there
// offers him again. In Chromium on the built game, on throwaway journeys at the hut (never a real save), the
// conversation played with the real buttons, every scene start and every encounter counted:
//  1. a genuine fade (Wait, ten rounds) from each way in: x 13 along the path (Suzu), x 14 from above (Nao), x 16
//     from above (Mio), x 15 from below (Ren), Genta's own talk from (15, 12) (Suzu): one start, one encounter, the
//     fade at round ten, two tiles left, one scene at a time; waiting there afterwards, no further start;
//  2. the retreat ending inside (x 16 from above): a deliberate step there offers him again, once; played to "relayed"
//     with Mio: done, Genta gone, Mio's line, and walking through the trigger again offers nothing;
//  3. a save written after a fade (x 14 from above, Nao) and loaded: stepping in offers him once; played to "heard"
//     with Nao's own action: done, Nao's line;
//  4. the conversation has no "Step back from this encounter", as before (a boss);
//  5. alone, Wait every round: he wins before the fade, and the scene ends there as before (no retreat, nothing set);
//     waiting there, no further start; a later step in offers him again, once, and (Wait again) ends the same way;
//  no page errors.
// Usage: node tools/build.mjs && node tests/e2e/courier_guard.mjs
import { serve, launch, page, companionTurn } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const FLAGS = { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_called: true, cr_hut_seen: true, cr_pass3_seen: true };
const WORDS = ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'ishi', 'iyasu', 'honoo', 'suzu', 'koe'];
const IN = (x, y) => x >= 13 && x <= 16 && y >= 12 && y <= 13;

// a journey at (x, y), the scene's starts and the encounters counted
async function begin(p, x, y, dir, comp) {
  await p.evaluate(async ([x, y, dir, comp, flags, WORDS]) => {
    const s = RB.game.debugStart('cr.hut', x, y, { edition: RB.edition.forNew(), dir, comp: comp || undefined, flags });
    if (!comp) s.comp = null;
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.words = WORDS.slice();
    RB.game.settings.input = 'choice'; RB.game.settings.battleAnim = 'instant'; RB.game.settings.textSpeed = 'instant'; RB.game.settings.compPlan = 'ask'; RB.game.applySettings();
    // (the test autoplayer stays off: with it on, the battle screen hands every battle to it, src/ui/80_combat.js)
    await new Promise((r) => setTimeout(r, 500));
    RB.world.refreshActors();
    window.__runs = []; window.__live = 0; window.__max = 0; window.__encs = []; window.__said = []; window.__round = 0;
    if (!window.__wrapped) {
      window.__wrapped = true;
      const run0 = RB.script.run;
      RB.script.run = function (id) {
        const pl = RB.world.W.player;
        if (id === 'cr.courier') { window.__runs.push(pl.x + ',' + pl.y); window.__live++; window.__max = Math.max(window.__max, window.__live); }
        const r = run0.apply(this, arguments);
        if (id === 'cr.courier') Promise.resolve(r).finally(() => { window.__live--; });
        return r;
      };
      const se = RB.game.startEncounter;
      RB.game.startEncounter = function (id) {
        const rec = { id, res: null, flee: null };
        window.__encs.push(rec);
        const r = se.apply(this, arguments);
        Promise.resolve(r).then((v) => { rec.res = v ? { result: v.result, outcome: v.outcome || null } : { result: null }; }, (e) => { rec.res = { error: String(e) }; });
        return r;
      };
      const say = RB.ui.dialogue.say;
      RB.ui.dialogue.say = function (l) { if (l) window.__said.push(l.en || ''); return say.apply(this, arguments); };
    }
  }, [x, y, dir, comp, FLAGS, WORDS]);
}
const view = (p) => p.evaluate(() => {
  const st = RB.combat.state(), E = st && st.enc;
  if (st && st.round) window.__round = Math.max(window.__round, st.round);
  const enc = window.__encs[window.__encs.length - 1];
  if (enc && st && enc.flee === null) enc.flee = !!document.querySelector('[data-flee]');
  return { combat: !!st, phase: RB.combat.phase(), u: E && E.social ? E.social.understanding : null,
    chal: !!document.querySelector('.chal'), ccard: !!document.querySelector('.ccard'), sheet: !!document.querySelector('.csheet .pbtn'),
    cards: [...document.querySelectorAll('.rcard[data-i]')].filter((x) => !x.disabled).map((x) => ((x.querySelector('.rc-en') || {}).textContent || '').trim()),
    dlg: RB.ui.dialogue.isOpen(), mode: RB.game.mode(), running: RB.script.isRunning(), mv: !!(RB.world.W.player && RB.world.W.player.mv) };
});
// the open language step, answered right (choice mode)
async function answer(p) {
  await p.evaluate(() => { const tab = document.querySelector('.chal-tabs .ptab[data-mode="choice"]'); if (tab) tab.click(); });
  await p.waitForSelector('.chal .mc .btn', { timeout: 8000 });
  const n = await p.evaluate(() => document.querySelectorAll('.chal .mc .btn').length);
  for (let k = 0; k < n; k++) {
    await p.evaluate((k) => { const b = [...document.querySelectorAll('.chal .mc .btn')][k]; if (b && !b.disabled) b.click(); }, k);
    await p.waitForTimeout(120);
    if (await p.evaluate(() => !!document.querySelector('.fbwrap[data-fb=ok] .fb-go'))) break;
    const again = await p.evaluate(() => { const g = document.querySelector('.fbwrap:not([data-fb=ok]) .fb-go, .fbwrap:not([data-fb=ok]) [data-a=retry]'); if (g) { g.click(); return true; } return false; });
    if (again) await p.waitForTimeout(150);
  }
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go', { timeout: 8000 });
  await p.click('.fbwrap[data-fb=ok] .fb-go');
}
// "Nothing this time", pressed with the real pointer
async function decline(p) {
  await p.waitForTimeout(320);
  if (await p.evaluate(() => !!document.querySelector('[data-coach-ok]'))) { await p.mouse.move(2, 2); await p.waitForTimeout(300); await p.click('[data-coach-ok]'); await p.waitForTimeout(80); }
  const pt = await p.evaluate(() => {
    const el = document.querySelector('.cq-none[data-none]');
    if (!el) return null;
    el.scrollIntoView({ block: 'nearest' });
    const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, top = document.elementFromPoint(x, y);
    return top && top.closest('[data-none]') ? { x, y } : null;
  });
  if (!pt) throw new Error('"Nothing this time" is not there to press');
  await p.mouse.click(pt.x, pt.y);
  await p.waitForTimeout(120);
}
// a card pressed on its English label, with the real pointer, until the choice is taken
async function press(p, label) {
  for (let k = 0; k < 8; k++) {
    for (let q = 0; q < 40; q++) { if (await p.evaluate(() => [...document.querySelectorAll('.rcard')].every((el) => el.getAnimations().every((a) => a.playState !== 'running')))) break; await p.waitForTimeout(80); }
    const pt = await p.evaluate((label) => {
      const el = [...document.querySelectorAll('.rcard[data-i]:not([disabled])')].find((x) => ((x.querySelector('.rc-en') || {}).textContent || '').trim() === label);
      const en = el && el.querySelector('.rc-en');
      if (!en) return null;
      en.scrollIntoView({ block: 'nearest' });
      const r = en.getBoundingClientRect(), x = r.left + Math.min(r.width / 2, 40), y = r.top + r.height / 2;
      const hit = document.elementFromPoint(x, y);
      return hit && hit.closest('.rcard[data-i]') === el && !hit.closest('.jt') ? { x, y } : null;
    }, label);
    if (pt) { await p.mouse.move(pt.x, pt.y); await p.waitForTimeout(150); await p.mouse.click(pt.x, pt.y); }
    await p.waitForTimeout(250);
    if (await p.evaluate(() => RB.combat.phase() !== 'choose' || !!document.querySelector('.chal, .csheet .pbtn'))) return true;
  }
  return false;
}
// the conversation, played with the real buttons until the scene is over and the player is still: plan 'wait' (Wait
// every round, the companion's turn declined), 'relay' (the four answers in turn, the turn declined) or 'heard' (the
// hearth lit, when offered, the companion's own action, then the three answers); n: the scene starts expected by then
async function play(p, plan, n) {
  await p.waitForFunction((n) => window.__runs.length >= n, n, { timeout: 8000 }).catch(() => {});
  const ACTS = ['Show it the seal on the bag', 'Point to the sandals by the hearth', 'Read it the note on the wall'].concat(plan === 'relay' ? ['Offer to carry the rest of the run'] : []);
  const done = new Set();
  const t0 = Date.now();
  for (let i = 0; i < 900 && Date.now() - t0 < 240000; i++) {
    const v = await view(p);
    if (!v.combat && !v.running && !v.mv && !v.dlg && v.mode === 'world' && i > 2) break;
    if (v.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(60); continue; }
    if (!v.combat) { await p.waitForTimeout(80); continue; }
    if (v.chal) { await answer(p); continue; }
    if (v.ccard) {
      await p.mouse.move(2, 2); await p.waitForTimeout(320);
      if (plan === 'heard' && !done.has('comp')) { done.add('comp'); await companionTurn(p).catch(() => {}); } else await decline(p).catch(() => {});
      continue;
    }
    if (v.sheet) { await p.evaluate(() => { const bs = [...document.querySelectorAll('.csheet .pbtn')]; const bt = bs.find((x) => /^Wait$/.test(x.textContent.trim())) || bs[0]; if (bt) bt.click(); }); await p.waitForTimeout(100); continue; }
    if (v.phase === 'choose' && v.cards.length) {
      if (await p.evaluate(() => !!document.querySelector('[data-coach-ok]'))) { await p.mouse.move(2, 2); await p.waitForTimeout(300); await p.click('[data-coach-ok]').catch(() => {}); continue; }
      let pick = null;
      if (plan === 'heard' && !done.has('hearth') && v.cards.includes('Light the hearth')) { pick = 'Light the hearth'; done.add('hearth'); }
      if (!pick && plan !== 'wait') { const a = ACTS.find((x) => !done.has(x) && v.cards.includes(x)); if (a) { pick = a; done.add(a); } }
      if (!pick) pick = v.cards.find((c) => /^Wait/.test(c)) || v.cards[0];
      await press(p, pick);
      continue;
    }
    await p.waitForTimeout(80);
  }
  return p.evaluate(() => {
    const pl = RB.world.W.player, s = RB.game.s;
    return { runs: window.__runs.slice(), max: window.__max, encs: window.__encs.map((e) => ({ res: e.res, flee: e.flee })), round: window.__round, at: [pl.x, pl.y], done: !!s.flags.cr_courier_done,
      relayed: !!s.flags.cr_courier_relayed, genta: RB.world.W.npcs.some((n) => n.id === 'cr_genta'), said: window.__said.slice() };
  });
}
const stepIn = (p, dir) => p.evaluate((dir) => { const pl = RB.world.W.player; pl.dir = dir; RB.world._tryMove(dir); }, dir);
const talkGenta = (p) => p.evaluate(() => { RB.test.place(15, 12, 'up'); RB.world.interact(); });
const quiet = async (p) => { await p.waitForTimeout(1500); return p.evaluate(() => ({ runs: window.__runs.length, encs: window.__encs.length, combat: !!RB.combat.state() })); };
const FADE = (r) => r.encs.length === 1 && r.encs[0].res && r.encs[0].res.result === 'end' && r.encs[0].res.outcome === 'fades' && r.round === 10;

// one case on its own page: a case that stops on an error (a battle left open, say) is a failure, and the run goes on
async function kase(name, body) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  try { await body(p, errors); } catch (e) { ok(false, name + ': the case stopped: ' + String((e && e.message) || e).split('\n')[0].slice(0, 200)); }
  await p.context().close();
}

// 1. a genuine fade from each way in
const CASES = [
  { name: 'x 13 along the path', at: [12, 12], dir: 'right', comp: 'suzu', end: [11, 12] },
  { name: 'x 14 from above', at: [14, 11], dir: 'down', comp: 'nao', end: [12, 12] },
  { name: 'x 16 from above', at: [16, 11], dir: 'down', comp: 'mio', end: [14, 12], retry: true },
  { name: 'x 15 from below', at: [15, 14], dir: 'up', comp: 'ren', end: [13, 13] },
  { name: 'Genta\'s talk from (15, 12)', at: [15, 12], dir: 'up', comp: 'suzu', end: [13, 12], talk: true },
];
for (const c of CASES) await kase('1 ' + c.name, async (p, errors) => {
  await begin(p, c.at[0], c.at[1], c.dir, c.comp);
  if (c.talk) await talkGenta(p); else await stepIn(p, c.dir);
  const r = await play(p, 'wait', 1);
  const later = await quiet(p);
  const who = c.comp || 'alone';
  ok(r.runs.length === 1 && r.max === 1 && FADE(r) && flat(r.at) === flat(c.end) && !r.done && r.genta,
    '1 ' + c.name + ' (' + who + '): one start, one encounter, the fade at round ten, two tiles left to ' + flat(c.end) + (IN(c.end[0], c.end[1]) ? ' (still inside: the stated limit)' : '') + ', one scene at a time ' + flat({ runs: r.runs, max: r.max, encs: r.encs, round: r.round, at: r.at }));
  ok(later.runs === 1 && later.encs === 1 && !later.combat, '1 ' + c.name + ' (' + who + '): waiting there afterwards, no further start ' + flat(later));
  if (c.comp === 'nao') ok(r.encs[0] && r.encs[0].flee === false, '4 the conversation has no "Step back from this encounter", as before ' + flat(r.encs[0]));
  // 2. the retreat ending inside: a deliberate step there, then relayed
  if (c.retry) {
    await stepIn(p, 'right');
    const r2 = await play(p, 'relay', 2);
    ok(r2.runs.length === 2 && r2.max === 1 && r2.encs.length === 2 && r2.encs[1].res && r2.encs[1].res.result === 'win' && r2.encs[1].res.outcome === 'relayed',
      '2 the retreat ended inside: a deliberate step there offers him again, once; played to "relayed" ' + flat({ runs: r2.runs, max: r2.max, encs: r2.encs }));
    ok(r2.done && r2.relayed && !r2.genta && r2.said.some((x) => /I hope he's gone somewhere warm/.test(x)), '2 relayed with Mio: done, Genta gone, Mio\'s line ' + flat({ done: r2.done, relayed: r2.relayed, genta: r2.genta }));
    await p.evaluate(() => RB.test.place(12, 12, 'right'));
    for (let k = 0; k < 5; k++) await p.evaluate(() => RB.test.step('right'));
    const after = await quiet(p);
    ok(after.runs === 2 && after.encs === 2, '2 walking through the trigger again offers nothing ' + flat(after));
  }
  ok(!errors.length, '1 ' + c.name + ': no page errors ' + errors.slice(0, 3).join(' | '));
});

// 3. a save written after a fade, loaded; then heard with Nao's own action
await kase('3', async (p, errors) => {
  await begin(p, 14, 11, 'down', 'nao');
  await stepIn(p, 'down');
  const r1 = await play(p, 'wait', 1);
  await p.evaluate(async () => { RB.save.setCurrent(6, 0); await RB.save.writeSlot(6, RB.game.s, { force: true }); await RB.game.loadCampaign(6, 'manual'); await new Promise((r) => setTimeout(r, 600)); window.__runs = []; window.__max = 0; window.__live = 0; window.__encs = []; window.__said = []; window.__round = 0; });
  const at = await p.evaluate(() => [RB.world.W.player.x, RB.world.W.player.y]);
  await p.evaluate(() => RB.test.place(14, 11, 'down'));
  await stepIn(p, 'down');
  const r = await play(p, 'heard', 1);
  ok(FADE(r1) && flat(at) === flat([12, 12]) && r.runs.length === 1 && r.max === 1 && r.encs.length === 1 && r.encs[0].res && r.encs[0].res.result === 'win' && r.encs[0].res.outcome === 'heard',
    '3 a save written after a fade and loaded: stepping in offers him once; played to "heard" ' + flat({ loadedAt: at, runs: r.runs, encs: r.encs }));
  ok(r.done && !r.genta && r.said.some((x) => /Received\. We'll take it on\./.test(x)), '3 heard with Nao\'s own action: done, Genta gone, Nao\'s line ' + flat({ done: r.done, genta: r.genta }));
  ok(!errors.length, '3 no page errors ' + errors.slice(0, 3).join(' | '));
});

// 5. alone: a loss, as before, then a later step in
await kase('5', async (p, errors) => {
  await begin(p, 12, 12, 'right', null);
  await stepIn(p, 'right');
  const r = await play(p, 'wait', 1);
  const later = await quiet(p);
  ok(r.runs.length === 1 && r.max === 1 && r.encs.length === 1 && r.encs[0].res && r.encs[0].res.result === 'lose' && r.round < 10 && flat(r.at) === flat([13, 12]) && !r.done && r.genta && !r.said.some((x) => /fades into the snow/.test(x)),
    '5 alone, Wait every round: he wins before the fade, and the scene ends there as before (no retreat, nothing set) ' + flat({ runs: r.runs, encs: r.encs, round: r.round, at: r.at }));
  ok(later.runs === 1 && later.encs === 1 && !later.combat, '5 waiting there, no further start ' + flat(later));
  await stepIn(p, 'right');
  const r2 = await play(p, 'wait', 2);
  const later2 = await quiet(p);
  ok(r2.runs.length === 2 && r2.max === 1 && r2.encs.length === 2 && r2.encs[1].res && r2.encs[1].res.result === 'lose' && flat(r2.at) === flat([14, 12]) && !r2.done && later2.runs === 2,
    '5 a later step in offers him again, once, and (Wait again) ends the same way; nothing more while waiting ' + flat({ runs: r2.runs, encs: r2.encs, at: r2.at, later: later2 }));
  ok(!errors.length, '5 no page errors ' + errors.slice(0, 3).join(' | '));
});

console.log(`\ncourier_guard: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
