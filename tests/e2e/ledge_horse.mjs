// RBN-QA-101 (Agnes 6337740054; Local CL-182; Cloud CC-111 §7): the pack horse stuck on the ledge (cr.leg4, 11,3).
// Choosing to unload it and walk it back, the narration told of taking its load off and backing it out step by step
// while the loaded horse stood still on the ledge, and it vanished under your companion's reaction. Now the unloading
// and the walk back happen in the dark: the screen fades out, the same narration is read over black, the horse is
// gone (cr_horse_safe) while it is dark, and the light comes back on the ledge without it for the reactions. In
// Chromium on the built game, from the real interaction with the horse:
//  1. both ways ("Take off its load…" at once, and "Talk to it, calm it down" first), with each companion: the loaded
//     horse there and the screen lit for every line before the unloading; the unloading line read over black; the horse
//     taken off the ledge in the dark; the reactions lit with the ledge empty; the horse at Umagaeshi (30,16) afterwards;
//  2. seen before and passed over with "Skip seen": it ends with the horse safe and the screen lit;
//  3. Reduce motion: the same order, ending lit;
//  4. a load in the middle (while the screen is dark): nothing left dark, the horse back on the ledge, the scene not
//     counted as done; told again, it ends as before; and with the save read held back 2.5 s (RBN-QA-102), no line of
//     the scene goes on while it loads;
//  5. no page errors.
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const allErrors = [];
const DONE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_called: true };
for (let n = 1; n <= 4; n++) Object.assign(DONE, { ['cr_st' + n]: true, ['cr_lamp' + n]: true, ['cr_given' + n]: true, ['cr_plan' + n]: true });

async function start(p, o) {
  await p.evaluate(([DONE, o]) => {
    const s = RB.game.debugStart('cr.leg4', 12, 4, { dir: 'up', edition: RB.edition.forNew(), comp: o.comp, flags: Object.assign({}, DONE) });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    s.quests.cr_main = { stage: 2, done: false, t: 1 };
    if (o.seen) s.seen['cr.horse'] = true;
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.skipSeen = !!o.skip; RB.game.settings.reducedMotion = !!o.reduce;
    RB.game.settings.suzuSpeech = 'standard';
    RB.game.applySettings();
    // every line as it is shown: the screen dark or lit, and the horse on the ledge or not
    if (!window.__wrap) {
      const say = RB.ui.dialogue.say;
      RB.ui.dialogue.say = function (l) {
        const f = document.querySelector('#overlay > .fade'), s = RB.game.s;
        const ledge = RB.world.W.map.id === 'cr.leg4' && RB.world.W.map.props.some((q) => q.p === 'cr_horse' && q.x === 11 && q.y === 3 && (!q.if || RB.state.test(s, q.if)));
        window.__lines.push({ en: String(l.en || '').slice(0, 50), who: l.who, dark: !!(f && f.classList.contains('on')), horse: ledge });
        return say.apply(this, arguments);
      };
      window.__wrap = true;
    }
    window.__lines = [];
  }, [DONE, o]);
  await p.waitForTimeout(900);
}
// the horse from where you can stand beside it, then the scene: lines read, choices picked by their words
async function play(p, picks, onLine) {
  const spot = await p.evaluate(() => {
    const m = RB.world.W.map, B = (x, y) => RB.maps.blockedStatic(m, x, y);
    return [[11, 4, 'up'], [10, 3, 'right'], [12, 3, 'left'], [11, 2, 'down']].find((q) => !B(q[0], q[1])) || null;
  });
  await p.evaluate((sp) => RB.world.enter('cr.leg4', sp[0], sp[1], sp[2], {}), spot);
  await p.waitForTimeout(400);
  await p.evaluate(() => RB.world.interact());
  let k = 0, n = 0, last = null;
  for (let i = 0; i < 400; i++) {
    const st = await p.evaluate(() => { const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(); return { d: !!d, en: d ? String(d.en || '') : null, run: RB.script.isRunning(), ch: [...document.querySelectorAll('.choices:not(.hidden) .choice')].map((x) => x.textContent) }; });
    if (st.ch.length) { const re = picks[k++]; if (!re) break; await p.locator('.choices:not(.hidden) .choice').filter({ hasText: re }).first().click(); await p.waitForTimeout(250); continue; }
    if (st.d) {
      // (only a line not yet handled: the one before stays up while the screen fades, and is not advanced twice)
      if (st.en === last) { await p.waitForTimeout(80); continue; }
      last = st.en;
      n++;
      if (onLine && (await onLine(n))) return { spot, stopped: true };
      await p.waitForTimeout(120); await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance()); await p.waitForTimeout(80); continue;
    }
    if (!st.run && n) break;
    await p.waitForTimeout(80);
  }
  await p.waitForTimeout(700);
  return { spot };
}
const after = (p) => p.evaluate(() => {
  const s = RB.game.s, f = document.querySelector('#overlay > .fade'), U = RB.content.maps['cr.umagaeshi'];
  return { safe: !!s.flags.cr_horse_safe, dark: !!(f && f.classList.contains('on')), run: RB.script.isRunning(), ff: RB.game.fastForward(),
    umagaeshi: U.props.some((q) => q.p === 'cr_horse' && q.x === 30 && q.y === 16 && RB.state.test(s, q.if)), seen: !!s.seen['cr.horse'] };
});
const UNLOAD = /You take off the load/;
function order(L) {
  const i = L.findIndex((l) => UNLOAD.test(l.en));
  const before = L.slice(0, i), at = L[i], rest = L.slice(i + 1);
  // (the horse is taken off the ledge in the dark after the unloading line, as agreed: while that line is read the screen
  // is black, so whether it is still there is not seen)
  return { i, ok: i > 0 && before.every((l) => l.horse && !l.dark) && at && at.dark && rest.length > 0 && rest.every((l) => !l.horse && !l.dark), before: before.map((l) => [l.horse, l.dark]), at, rest: rest.map((l) => [l.who, l.horse, l.dark]) };
}

// ---- 1. both ways, each companion -------------------------------------------------------------------------------------
for (const comp of ['nao', 'mio', 'ren', 'suzu']) {
  for (const [way, picks] of [['back', [/Take off its load/]], ['calm first', [/Talk to it, calm it down/]]]) {
    const { p, errors } = await page(b, url);
    await start(p, { comp });
    await play(p, picks);
    const L = await p.evaluate(() => window.__lines), a = await after(p), o = order(L);
    const calmLine = L.find((l) => /turns an ear your way/.test(l.en));
    ok(o.ok && (way === 'back' ? !calmLine : calmLine && calmLine.horse && !calmLine.dark) && a.safe && !a.dark && !a.run && a.umagaeshi && L.some((l) => l.who === comp && !l.dark && !l.horse),
      comp + ', ' + way + ': the loaded horse there and the screen lit before the unloading; the unloading read over black; the reactions lit on the empty ledge; the horse at Umagaeshi (' + JSON.stringify({ o, a }) + ')');
    allErrors.push(...errors); await p.close();
  }
}

// ---- 2. Skip seen ----------------------------------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await start(p, { comp: 'suzu', seen: true, skip: true });
  let skipped = null;
  await play(p, [/Take off its load/], async () => {
    if (skipped) return false;
    skipped = await p.evaluate(() => { const k = document.querySelector('.dlg .b-skip'); const vis = !!(k && k.offsetParent && !k.classList.contains('hidden')); if (vis) k.click(); return { vis }; });
    return false;
  });
  const a = await after(p);
  ok(skipped && skipped.vis && a.safe && !a.dark && !a.run && !a.ff && a.umagaeshi, 'seen before, passed over with "Skip seen": the horse safe, the screen lit, fast-forward off (' + JSON.stringify({ skipped, a }) + ')');
  allErrors.push(...errors); await p.close();
}

// ---- 3. Reduce motion ----------------------------------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await start(p, { comp: 'mio', reduce: true });
  await play(p, [/Take off its load/]);
  const L = await p.evaluate(() => window.__lines), a = await after(p), o = order(L);
  ok(o.ok && a.safe && !a.dark && !a.run, 'Reduce motion: the same order, ending lit (' + JSON.stringify({ o, a }) + ')');
  allErrors.push(...errors); await p.close();
}

// ---- 4. a load in the middle, while it is dark -----------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await start(p, { comp: 'nao' });
  await p.evaluate(async () => { await RB.save.writeSlot(4, RB.game.s, { force: true }); });
  const r = await play(p, [/Take off its load/], async () => p.evaluate(() => { const L = window.__lines; return L.length > 0 && /You take off the load/.test(L[L.length - 1].en); }));
  const mid = await p.evaluate(() => { const f = document.querySelector('#overlay > .fade'); return { dark: !!(f && f.classList.contains('on')) }; });
  await p.evaluate(async () => { await RB.game.loadCampaign(4); });
  await p.waitForTimeout(1500);
  const loaded = await after(p);
  const ledge = await p.evaluate(() => RB.world.W.map.id === 'cr.leg4' && RB.world.W.map.props.some((q) => q.p === 'cr_horse' && q.x === 11 && q.y === 3 && RB.state.test(RB.game.s, q.if)));
  ok(r.stopped && mid.dark && !loaded.dark && !loaded.safe && !loaded.seen && !loaded.run && ledge, 'a load while it is dark: nothing left dark, the horse back on the ledge, not counted as done (' + JSON.stringify({ stopped: r.stopped, mid, loaded, ledge }) + ')');
  await p.evaluate(() => { window.__lines = []; });
  await play(p, [/Take off its load/]);
  const L = await p.evaluate(() => window.__lines), a = await after(p), o = order(L);
  ok(o.ok && a.safe && !a.dark && !a.run && a.umagaeshi, 'told again after the load: it ends as before (' + JSON.stringify({ o, a }) + ')');
  allErrors.push(...errors); await p.close();
}

// ---- 4b. the same, the save read held back (RBN-QA-102): nothing of the scene goes on while it loads ----------------------------
{
  const { p, errors } = await page(b, url);
  await start(p, { comp: 'mio' });
  await p.evaluate(async () => {
    await RB.save.writeSlot(4, RB.game.s, { force: true });
    const L = (window.__held = { lines: [], loading: 0, results: [] });
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) { if (L.loading) L.lines.push(String((l && l.en) || '').slice(0, 40)); return say.apply(this, arguments); };
    const read = RB.save.read;
    RB.save.read = async function () { await new Promise((r) => setTimeout(r, 2500)); return read.apply(this, arguments); };
  });
  const r = await play(p, [/Take off its load/], async () => p.evaluate(() => { const L = window.__lines; return L.length > 0 && /You take off the load/.test(L[L.length - 1].en); }));
  await p.evaluate(() => { const L = window.__held; L.loading++; RB.game.loadCampaign(4).then((x) => { L.loading--; L.results.push(x); }, (e) => { L.loading--; L.results.push('error ' + e); }); });
  // (a line offered meanwhile is advanced, as a player would)
  for (let i = 0; i < 80 && (await p.evaluate(() => window.__held.loading > 0)); i++) { await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance()); await p.waitForTimeout(100); }
  await p.waitForTimeout(1500);
  const H = await p.evaluate(() => window.__held), loaded = await after(p);
  const ledge = await p.evaluate(() => RB.world.W.map.id === 'cr.leg4' && RB.world.W.map.props.some((q) => q.p === 'cr_horse' && q.x === 11 && q.y === 3 && RB.state.test(RB.game.s, q.if)));
  ok(r.stopped && H.results.length === 1 && H.results[0] === true && H.lines.length === 0 && !loaded.dark && !loaded.safe && !loaded.seen && !loaded.run && ledge,
    'a load while it is dark, its save read held back: no line of the scene while it loads, nothing left dark, the horse back on the ledge, not counted as done (' + JSON.stringify({ stopped: r.stopped, H, loaded, ledge }) + ')');
  allErrors.push(...errors); await p.close();
}

ok(allErrors.length === 0, 'no page errors' + (allErrors.length ? ' (' + allErrors.slice(0, 3).join(' | ') + ')' : ''));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
