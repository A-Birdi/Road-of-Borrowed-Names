// One battle at a time (owner reports, Chapter 2, the Saltglass cove with the Label Crabs and
// the Harbour Fog): after a win, or after "Step back from this encounter", the creature that was
// still touching you started a second battle while the first was closing; the second battle's
// screen came up over the map with nothing queued (its creature list had been cleared by the
// first battle's ending) and the frame loop stopped. In the real game, at 1280×800 and on a phone:
// 1. after a win: the creature you beat is gone before the map comes back; no second battle,
//    exactly one battle screen ever, the map is drawn and keeps moving;
// 2. after stepping back: no second battle; the creature backs off and stays calm while you are
//    still touching (or standing on) it, so you can walk away; facing it on purpose later
//    starts one battle as usual;
// 3. a tap on a creature (walk beside it and face it) and its own contact in the same frame
//    start one battle, not two;
// 4. a tap on a sign beside a creature opens the sign, not a battle under it; a tap on a way
//    out beside a creature takes you through it, not into a battle during the fade; when a
//    scene ends the creatures stay where they are (they used to jump back to their places,
//    onto or beside you);
// 5. guards: a battle asked for while one is closing, or creature contact asked for while a
//    line, the menu or a map change is up, starts nothing;
// 6. a save and load in the same page leaves no battle state: no battle screen, the map drawn,
//    the frame loop running (it also survives a drawing error).
// Real arrow keys, Z and mouse clicks throughout; scripted only to place the player and a
// creature (and hold it still while the test sets up), to leave a creature one knot (the win),
// to play the driftwood's scene in 4 (the scene a Z press at the stump plays) and the attempts
// in 5. Fresh browser contexts and session-only campaigns; never a real player's save.
// Usage: node tests/e2e/battle_overlap.mjs [--desk-only|--phone-only]
import { serve, launch, page, companionTurn } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const VIEWS = [
  { tag: '1280×800', size: { width: 1280, height: 800 } },
  { tag: 'phone 390×844', size: { width: 390, height: 844 }, phone: true },
].filter((v) => !(process.argv.includes('--desk-only') && v.phone) && !(process.argv.includes('--phone-only') && !v.phone));

// A fresh browser context with test instrumentation (it only watches): battles started (calls
// that reached RB.combat.start), the most battle screens ever in the page at once, frames drawn,
// and the world at each moment a battle hands the screen back.
async function open(v) {
  const P = await page(b, url, { viewport: v.size, touch: !!v.phone, mobile: !!v.phone, dpr: v.phone ? 2 : 1 });
  await P.p.evaluate(() => {
    const T = (window.__T = { starts: [], maxUi: 0, frames: 0, returns: [] });
    const start = RB.combat.start;
    RB.combat.start = function (id) { T.starts.push({ id, modes: RB.game.G.modes.join('>') }); return start.apply(this, arguments); };
    const count = () => { const n = document.querySelectorAll('.combat-ui').length; if (n > T.maxUi) T.maxUi = n; };
    new MutationObserver(count).observe(document.body, { childList: true, subtree: true });
    const frame = RB.render.frame;
    RB.render.frame = function () { T.frames++; return frame.apply(this, arguments); };
    const pop = RB.game.popMode;
    RB.game.popMode = function (m) {
      const r = pop.apply(this, arguments);
      if (m === 'combat') T.returns.push({ modes: RB.game.G.modes.join('>'), foes: RB.world.W.foes.map((f) => f.id + '@' + f.x + ',' + f.y), player: RB.world.W.player.x + ',' + RB.world.W.player.y, worldVisible: RB.render.worldVisible() });
      return r;
    };
    const run = RB.challenge.runStep;
    RB.challenge.runStep = (step, o) => { window.__step = step; return run(step, o); };
  });
  return P;
}
// a session-only Chapter 2 campaign with Suzu on a map (never a real save)
async function campaign(p, map, x, y, dir) {
  await p.evaluate(([map, x, y, dir]) => {
    const s = RB.game.debugStart(map, x, y, { dir, comp: 'suzu', flags: { ch1_done: true, departed: true } });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.words = ['mamoru', 'iyasu', 'hikari'];
    RB.game.settings.input = 'choice'; RB.game.settings.textSpeed = 'instant';
  }, [map, x, y, dir]);
  await p.waitForTimeout(250);
}
// setup only: a placed creature stands at x,y and does not wander off on its own while the test sets up
const hold = (p, id, x, y) => p.evaluate(([id, x, y]) => { const f = RB.world.W.foes.find((q) => q.id === id); if (x != null) { f.x = x; f.y = y; f.fx = x; f.fy = y; f.mv = null; } f.wt = 1e9; }, [id, x, y]);
const T = (p) => p.evaluate(() => {
  const W = RB.world.W, T = window.__T;
  return {
    starts: T.starts.length, maxUi: T.maxUi, ui: document.querySelectorAll('.combat-ui').length, frames: T.frames, modes: RB.game.G.modes.join('>'),
    phase: RB.combat.phase(), st: !!RB.combat.state(), world: RB.render.worldVisible(), dlg: RB.ui.dialogue.isOpen(), map: W.map && W.map.id,
    player: [W.player.x, W.player.y], foes: Object.fromEntries(W.foes.map((f) => [f.id, [f.x, f.y]])), returns: T.returns,
  };
});
const dist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
// one step with a real arrow key: held until the step (or the turn and then the step) begins,
// then released (a step into something solid just bumps)
async function step(p, key) {
  const moving = () => p.evaluate(() => !!RB.world.W.player.mv);
  await p.keyboard.down(key);
  for (let i = 0; i < 25 && !(await moving()); i++) await p.waitForTimeout(16);
  await p.keyboard.up(key);
  for (let i = 0; i < 30 && (await moving()); i++) await p.waitForTimeout(16);
  await p.waitForTimeout(80);
}
// a real click on the middle of an element's visible part
async function clickEl(p, sel) {
  const pt = await p.evaluate((sel) => {
    const el = [...document.querySelectorAll(sel)].find((e) => e.offsetParent !== null) || document.querySelector(sel);
    if (!el) return null;
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect(), x = r.left + r.width / 2;
    for (let y = Math.max(r.top, 0) + 4; y < Math.min(r.bottom, innerHeight); y += 4) { const t = document.elementFromPoint(x, y); if (t && (t === el || el.contains(t))) return { x, y }; }
    return null;
  }, sel);
  if (!pt) return false;
  await p.mouse.click(pt.x, pt.y);
  return true;
}
// a real click on a map tile (once the camera has come to rest, so the tile is where it is drawn)
async function tapTile(p, x, y) {
  const at = () => p.evaluate(([x, y]) => { const a = RB.render.tileToCss(x, y), c = RB.render.tileToCss(x + 1, y + 1), r = document.getElementById('world').getBoundingClientRect(); return { x: Math.round(r.left + (a.x + c.x) / 2), y: Math.round(r.top + (a.y + c.y) / 2) }; }, [x, y]);
  let pt = await at();
  for (let i = 0; i < 30; i++) { await p.waitForTimeout(100); const q = await at(); if (q.x === pt.x && q.y === pt.y) break; pt = q; }
  await p.mouse.click(pt.x, pt.y);
}
// the opening lines (Z) until the responses are offered; false if they never are
async function toChoice(p) {
  for (let i = 0; i < 120; i++) {
    const s = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), ph: RB.combat.phase(), cards: !!document.querySelector('.rcard[data-i]:not([disabled])'), coach: !!document.querySelector('[data-coach-ok]') }));
    if (s.coach) { await clickEl(p, '[data-coach-ok]'); await p.waitForTimeout(120); continue; }
    if (s.ph === 'choose' && s.cards && !s.dlg) { await p.waitForTimeout(350); return true; }
    if (s.dlg) await p.keyboard.press('z');
    await p.waitForTimeout(120);
  }
  return false;
}
// Step back: the button, then "Step back" in the question (real mouse)
async function stepBack(p) {
  if (!(await clickEl(p, '[data-flee]'))) return false;
  await p.waitForSelector('.confirm-scrim .pbtn', { timeout: 5000 });
  await p.waitForTimeout(120);
  const i = await p.evaluate(() => [...document.querySelectorAll('.confirm-scrim .pbtn')].findIndex((x) => /Step back/.test(x.textContent)));
  return clickEl(p, '.confirm-scrim .pbtn:nth-child(' + (i + 1) + ')');
}
// win the exchange: Unravel, the right choice, Continue, the companion's action (real mouse)
async function winRound(p) {
  await p.evaluate(() => { const st = RB.combat.state(); for (const f of st.foes) f.knots = 1; RB.combat.refresh(); }); // shortcut: one knot left
  await p.waitForTimeout(200);
  // (a press in the cards' first moments is ignored on purpose: press again if nothing opened;
  // a step that is not a multiple choice is left with "Choose a different response" and Unravel
  // chosen again)
  let opened = false;
  for (let k = 0; k < 8 && !opened; k++) {
    if (await p.evaluate(() => !!document.querySelector('[data-coach-ok]'))) { await clickEl(p, '[data-coach-ok]'); await p.waitForTimeout(150); }
    const ok = await p.evaluate(() => { const x = [...document.querySelectorAll('.rcard[data-i]')].find((e) => /unravel/i.test(e.textContent) && !e.disabled); if (!x) return false; x.setAttribute('data-test-unravel', '1'); return true; });
    if (ok) await clickEl(p, '[data-test-unravel]');
    opened = await p.waitForSelector('.chal .mc .btn', { timeout: 2500 }).then(() => true, () => false);
    if (!opened && (await p.evaluate(() => RB.combat.phase() === 'challenge' && !!document.querySelector('[data-a="leave"]')))) {
      await clickEl(p, '[data-a="leave"]');
      await p.waitForFunction(() => RB.combat.phase() === 'choose' && !!document.querySelector('.rcard[data-i]:not([disabled])'), null, { timeout: 5000 }).catch(() => {});
      await p.waitForTimeout(400);
    }
  }
  if (!opened) { console.log('  (no challenge opened: ' + JSON.stringify(await p.evaluate(() => ({ ph: RB.combat.phase(), modes: RB.game.G.modes, cards: [...document.querySelectorAll('.rcard')].map((c) => (c.disabled ? 'off ' : '') + c.textContent.replace(/\s+/g, ' ').slice(0, 30)), coach: !!document.querySelector('[data-coach-ok]'), layers: [...document.querySelectorAll('.scrim, .csheet')].length }))) + ')'); return false; }
  await p.evaluate(() => {
    const st = window.__step;
    const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
    const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.util.esc(o.en) + '</span>' : '');
    const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => txt(html(o)));
    [...document.querySelectorAll('.chal .mc .btn')].find((x) => right.includes(x.textContent.replace(/\s+/g, ' ').trim())).setAttribute('data-test-right', '1');
  });
  await clickEl(p, '[data-test-right]');
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go', { timeout: 10000 });
  await clickEl(p, '.fbwrap[data-fb=ok] .fb-go');
  await companionTurn(p);
  return true;
}
// lines (Z) until the battle has handed the screen back, or `ms` passes
async function toWorld(p, ms) {
  const t0 = Date.now();
  while (Date.now() - t0 < (ms || 20000)) {
    const s = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), m: RB.game.mode(), ph: RB.combat.phase() }));
    if (s.m === 'world' && s.ph === 'idle' && !s.dlg) return true;
    if (s.dlg) await p.keyboard.press('z');
    await p.waitForTimeout(120);
  }
  return false;
}
// the map is back and alive: exploration mode only, no battle screen, the world drawn, frames moving
async function settled(p, tag, before) {
  const a = await T(p);
  await p.waitForTimeout(600);
  const c = await T(p);
  assert(c.modes === 'world' && c.ui === 0 && !c.st && c.phase === 'idle', tag + ': the map is back with no battle screen and no battle state (modes ' + c.modes + ', battle screens ' + c.ui + ', phase ' + c.phase + ')');
  assert(c.world && c.frames - a.frames > 10, tag + ': the map is drawn and the frame loop runs (' + (c.frames - a.frames) + ' frames in 600 ms, world drawn ' + c.world + ')');
  assert(c.starts === before && c.maxUi === 1, tag + ': one battle, one battle screen (battles started ' + c.starts + ', expected ' + before + '; most battle screens at once ' + c.maxUi + ')');
  return c;
}

for (const v of VIEWS) {
  console.log('== ' + v.tag);

  // ---- 1. after a win: the Label Crab you beat is gone before the map comes back -------------
  {
    const { p, ctx, errors } = await open(v);
    await campaign(p, 'sg.cove', 12, 8, 'right');
    await hold(p, 'c1', 14, 8);
    await step(p, 'ArrowRight'); // to 13,8: touching the crab; it engages
    await p.waitForFunction(() => RB.game.mode() === 'combat', null, { timeout: 8000 }).catch(() => {});
    assert((await T(p)).starts === 1, v.tag + ' win: walking up to the Label Crab starts one battle');
    assert(await toChoice(p), v.tag + ' win: the responses are offered');
    assert(await winRound(p), v.tag + ' win: answered with the mouse');
    const back = await toWorld(p, 20000);
    assert(back, v.tag + ' win: the battle ends and hands the screen back');
    await p.waitForTimeout(1500); // standing still where the crab touched you
    const c = await settled(p, v.tag + ' win', 1);
    const r = c.returns[0] || {};
    assert(r.foes && !r.foes.some((f) => f.startsWith('c1@')), v.tag + ' win: the crab you beat was gone before the map came back (creatures then: ' + JSON.stringify(r.foes) + ')');
    assert(!('c1' in c.foes) && (await p.evaluate(() => !!RB.game.s.flags['foe:sg.cove:c1'])), v.tag + ' win: it stays gone and the win is recorded');
    // and you walk on with the arrow keys
    await step(p, 'ArrowLeft');
    const w = await T(p);
    assert(w.player[0] === 12 && w.modes === 'world', v.tag + ' win: you walk on with the arrow keys (at ' + w.player + ')');
    assert(!errors.length, v.tag + ' win: no page errors ' + errors.join('; '));
    await ctx.close();
  }

  // ---- 2. after stepping back: the Harbour Fog backs off and stays calm --------------------
  {
    const { p, ctx, errors } = await open(v);
    await campaign(p, 'sg.cove', 17, 6, 'right');
    await hold(p, 'w1', 19, 6);
    await step(p, 'ArrowRight'); // to 18,6: touching the fog; it engages
    await p.waitForFunction(() => RB.game.mode() === 'combat', null, { timeout: 8000 }).catch(() => {});
    assert((await T(p)).starts === 1, v.tag + ' step back: walking up to the Harbour Fog starts one battle');
    assert(await toChoice(p), v.tag + ' step back: the responses are offered');
    assert(await stepBack(p), v.tag + ' step back: "Step back from this encounter", then "Step back" (real mouse)');
    const back = await toWorld(p, 8000);
    assert(back, v.tag + ' step back: the battle hands the screen back');
    await p.waitForTimeout(1500); // standing still beside it
    let c = await settled(p, v.tag + ' step back', 1);
    assert(c.foes.w1 && dist(c.foes.w1, c.player) >= 2, v.tag + ' step back: the fog has backed off, not touching you (fog ' + c.foes.w1 + ', you ' + c.player + ')');
    // even when it is right beside you, or on your tile, it does not start a fight while you are still there
    await hold(p, 'w1', c.player[0] + 1, c.player[1]);
    await p.waitForTimeout(1200);
    c = await T(p);
    assert(c.starts === 1 && c.modes === 'world', v.tag + ' step back: beside you again it stays calm (battles ' + c.starts + ', modes ' + c.modes + ')');
    await hold(p, 'w1', c.player[0], c.player[1]);
    await p.waitForTimeout(1200);
    c = await T(p);
    assert(c.starts === 1 && c.modes === 'world', v.tag + ' step back: on your very tile it stays calm (battles ' + c.starts + ')');
    // you walk away with the arrow keys (the first step leaves it right beside you)
    const from = c.player;
    for (let k = 0; k < 3; k++) await step(p, 'ArrowDown');
    c = await T(p);
    assert(c.starts === 1 && c.modes === 'world' && c.player[1] >= from[1] + 3, v.tag + ' step back: you walk away with no battle (from ' + from + ' to ' + c.player + ', battles ' + c.starts + ')');
    // later, walking up to it again starts one battle as usual
    await p.waitForTimeout(2500);
    await hold(p, 'w1', c.player[0], c.player[1] + 2);
    await step(p, 'ArrowDown');
    await p.waitForFunction(() => RB.game.mode() === 'combat', null, { timeout: 4000 }).catch(() => {});
    c = await T(p);
    assert(c.starts === 2 && c.modes === 'world>combat', v.tag + ' step back: walking up to it again later starts one battle (battles ' + c.starts + ', modes ' + c.modes + ')');
    if (await toChoice(p)) { await stepBack(p); await toWorld(p, 8000); await p.waitForTimeout(800); }
    c = await T(p);
    assert(c.starts === 2 && c.maxUi === 1 && c.modes === 'world' && c.ui === 0, v.tag + ' step back: and stepping back from that one returns you cleanly (battles ' + c.starts + ', screens at once ' + c.maxUi + ')');
    // ---- 6. a save and load in the same page leaves no battle state ----
    await p.evaluate(async () => { await RB.save.manualSave(1); });
    const l = await p.evaluate(async () => {
      // a drawing error in whatever the screen shows must not stop the frame loop
      const f0 = window.__T.frames;
      RB.render.setOverride(() => { throw new Error('test: a broken overlay'); });
      await new Promise((r) => setTimeout(r, 300));
      const f1 = window.__T.frames;
      const ok = await RB.game.loadCampaign(1, 'manual');
      await new Promise((r) => setTimeout(r, 500));
      return { ok, alive: f1 - f0, after: window.__T.frames - f1 };
    });
    assert(l.alive > 5, v.tag + ' save/load: the frame loop keeps running through a drawing error (' + l.alive + ' frames in 300 ms)');
    c = await T(p);
    assert(l.ok && c.modes === 'world' && c.ui === 0 && !c.st && c.phase === 'idle' && c.world && l.after > 10, v.tag + ' save/load: loading in the same page leaves no battle state and the map drawn (' + JSON.stringify({ ok: l.ok, modes: c.modes, ui: c.ui, phase: c.phase, world: c.world, frames: l.after }) + ')');
    await step(p, 'ArrowDown');
    const c2 = await T(p);
    assert(c2.player[1] === c.player[1] + 1 || c2.player[0] !== c.player[0], v.tag + ' save/load: you walk after loading (' + c.player + ' → ' + c2.player + ')');
    const real = errors.filter((e) => !/test: a broken overlay/.test(e));
    assert(!real.length, v.tag + ' step back: no page errors ' + real.join('; '));
    await ctx.close();
  }

  // ---- 3. a tap on a creature and its contact in the same frame: one battle ----------------
  {
    const { p, ctx, errors } = await open(v);
    await campaign(p, 'sg.cove', 11, 8, 'right');
    await hold(p, 'c1', 14, 8);
    await tapTile(p, 14, 8); // walk beside it and face it
    await p.waitForFunction(() => RB.game.mode() === 'combat', null, { timeout: 8000 }).catch(() => {});
    await p.waitForTimeout(1200);
    let c = await T(p);
    assert(c.starts === 1 && c.modes === 'world>combat' && c.maxUi <= 1, v.tag + ' tap: a tap on the Label Crab starts one battle, not two (battles ' + c.starts + ', modes ' + c.modes + ', screens at once ' + c.maxUi + ')');
    if (await toChoice(p)) { await stepBack(p); await toWorld(p, 8000); }
    await p.waitForTimeout(1200);
    await settled(p, v.tag + ' tap', 1);
    assert(!errors.length, v.tag + ' tap: no page errors ' + errors.join('; '));
    await ctx.close();
  }

  // ---- 4. a sign beside a creature; a way out beside a creature --------------------------
  {
    const { p, ctx, errors } = await open(v);
    await campaign(p, 'sg.cove', 6, 7, 'left');
    await hold(p, 'c1', 4, 8); // beside the tile in front of the plaque at 3,7
    await tapTile(p, 3, 7);
    await p.waitForFunction(() => RB.ui.dialogue.isOpen() || window.__T.starts.length > 0, null, { timeout: 5000 }).catch(() => {});
    await p.waitForTimeout(300);
    let c = await T(p);
    assert(c.dlg && c.starts === 0 && !/combat/.test(c.modes), v.tag + ' sign: a tap on the plaque beside a crab opens the plaque, not a battle under it (battles ' + c.starts + ', modes ' + c.modes + ', line open ' + c.dlg + ')');
    // the plaque read, the crab may engage — one battle at a time
    for (let i = 0; i < 30 && (await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.game.mode() === 'dialogue')); i++) { await p.keyboard.press('z'); await p.waitForTimeout(150); }
    await p.waitForTimeout(800);
    c = await T(p);
    assert(c.starts <= 1 && c.maxUi <= 1 && (c.modes.match(/combat/g) || []).length <= 1, v.tag + ' sign: after the plaque, at most one battle (battles ' + c.starts + ', modes ' + c.modes + ')');
    assert(!errors.length, v.tag + ' sign: no page errors ' + errors.join('; '));
    await ctx.close();
  }
  {
    const { p, ctx, errors } = await open(v);
    await campaign(p, 'sg.cove', 2, 9, 'left');
    await hold(p, 'c1', 0, 8); // standing on the other half of the way out to the harbour
    await tapTile(p, 0, 9);
    await p.waitForFunction(() => RB.world.W.map.id !== 'sg.cove' || window.__T.starts.length > 0, null, { timeout: 6000 }).catch(() => {});
    await p.waitForTimeout(1200);
    const c = await T(p);
    assert(c.starts === 0 && c.map === 'sg.harbor' && c.ui === 0 && c.maxUi === 0, v.tag + ' way out: a tap on the way out beside a crab takes you to the harbour, no battle during the fade (battles ' + c.starts + ', map ' + c.map + ', modes ' + c.modes + ')');
    assert(!errors.length, v.tag + ' way out: no page errors ' + errors.join('; '));
    await ctx.close();
  }

  // ---- 4b. when a scene ends, the creatures stay where they are (they used to jump back to
  // their places, onto or beside you)
  {
    const { p, ctx, errors } = await open(v);
    await campaign(p, 'sg.cove', 19, 6, 'right'); // where the Harbour Fog usually floats
    await hold(p, 'w1', 21, 6); // it has drifted two tiles off
    await p.waitForTimeout(300);
    // the driftwood's lines (the scene a Z press at the stump plays), advanced with Z
    await p.evaluate(() => { RB.script.run('sg.cove_driftwood'); });
    await p.waitForTimeout(200);
    for (let i = 0; i < 40 && (await p.evaluate(() => RB.game.mode() === 'dialogue')); i++) { await p.keyboard.press('z'); await p.waitForTimeout(150); }
    await p.waitForTimeout(400);
    let c = await T(p);
    assert(c.modes === 'world' && c.foes.w1 && c.foes.w1[0] === 21 && c.foes.w1[1] === 6, v.tag + ' scene end: the fog stays where it was, not back on your tile (fog ' + c.foes.w1 + ', you ' + c.player + ')');
    await step(p, 'ArrowDown');
    await p.waitForTimeout(600);
    c = await T(p);
    assert(c.starts === 0 && c.modes === 'world', v.tag + ' scene end: stepping off starts no battle with a creature that jumped onto you (battles ' + c.starts + ')');
    assert(!errors.length, v.tag + ' scene end: no page errors ' + errors.join('; '));
    await ctx.close();
  }

  // ---- 5. guards: nothing starts a battle while one is closing, or while a line, the menu or a map change is up
  {
    const { p, ctx, errors } = await open(v);
    await campaign(p, 'sg.cove', 18, 6, 'right');
    await hold(p, 'w1', 19, 6);
    await p.waitForFunction(() => RB.game.mode() === 'combat', null, { timeout: 8000 }).catch(() => {});
    // while the battle closes (the map coming back), something asks for a battle at once
    await p.evaluate(() => {
      window.__closing = [];
      const pop = RB.game.popMode;
      RB.game.popMode = function (m) {
        const r = pop.apply(this, arguments);
        if (m === 'combat' && !window.__closingDone) {
          window.__closingDone = true;
          const res = RB.game.startBattle('sg.crab', {});
          window.__closing.push(RB.game.G.modes.join('>'));
          RB.world.checkFoeContact(); RB.world.interact();
          Promise.resolve(res).then((x) => window.__closing.push('result ' + x));
        }
        return r;
      };
    });
    assert(await toChoice(p), v.tag + ' guard: a battle with the fog is open');
    await stepBack(p);
    await toWorld(p, 8000);
    await p.waitForTimeout(1500);
    let c = await T(p);
    const closing = await p.evaluate(() => window.__closing);
    assert(c.starts === 1 && c.maxUi === 1 && c.modes === 'world' && closing.includes('result null'), v.tag + ' guard: a battle asked for while one is closing is refused (battles ' + c.starts + ', modes ' + c.modes + ', ' + JSON.stringify(closing) + ')');
    // a creature beside you while a line, the menu, or a map change is up: the contact check
    // (as the frame loop used to run it, with the mode from before the step) starts nothing;
    // the crab is set beside you only while each is up, and taken away before it closes
    await p.evaluate(() => { window.__closingDone = true; });
    const g = await p.evaluate(async () => {
      const out = {}, W = RB.world.W;
      const n0 = () => window.__T.starts.length;
      const crab = (near) => { const f = W.foes.find((q) => q.id === 'c1'); f.wt = 1e9; f.mv = null; if (near) { f.x = W.player.x; f.y = W.player.y + 1; } else { f.x = 27; f.y = 13; } f.fx = f.x; f.fy = f.y; };
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      await wait(1200); // past the moment after the last battle
      // a line
      let n = n0(); const line = RB.script.runInline([{ who: 'narr', en: 'A line.', jp: '' }]);
      await wait(50); crab(true);
      RB.world.checkFoeContact(); out.dialogue = { modes: RB.game.G.modes.join('>'), started: n0() - n };
      crab(false); RB.ui.dialogue.advance(true); RB.ui.dialogue.advance(true); await line;
      // the menu
      n = n0(); RB.ui.menu.open(); await wait(50); crab(true);
      RB.world.checkFoeContact(); out.menu = { modes: RB.game.G.modes.join('>'), started: n0() - n };
      crab(false); RB.ui.menu.close(); await wait(50);
      // a map change, during its fade
      n = n0(); const tr = RB.game.transition('sg.cove', W.player.x, W.player.y, 'down', { inScript: true });
      await wait(30); crab(true);
      RB.world.checkFoeContact(); out.transition = { modes: RB.game.G.modes.join('>'), started: n0() - n };
      crab(false);
      await tr;
      return out;
    });
    for (const k of ['dialogue', 'menu', 'transition']) assert(g[k] && g[k].started === 0 && g[k].modes === 'world>' + k, v.tag + ' guard: creature contact during ' + k + ' starts nothing (' + JSON.stringify(g[k]) + ')');
    await p.waitForTimeout(400);
    c = await T(p);
    assert(c.maxUi <= 1 && (c.modes.match(/combat/g) || []).length <= 1, v.tag + ' guard: never more than one battle screen (most at once ' + c.maxUi + ')');
    assert(!errors.length, v.tag + ' guard: no page errors ' + errors.join('; '));
    await ctx.close();
  }
}

await b.close();
srv.close();
console.log(fail ? fail + ' failed' : 'all ok');
process.exit(fail ? 1 : 0);
