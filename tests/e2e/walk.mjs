// A modal-aware driver for native walks through the built game (Cloud CC-598, CC-599; Local CL-833, CL-834, CL-835;
// Agnes 6883082806, 6883793139). Not a test by itself: hall_native_walk.mjs and hall_native_readback.mjs use it.
//
// What it does, and only this:
//  - it moves and uses things with the real keyboard (arrow keys, Enter), and answers what the game shows with real
//    clicks (the Hall card's buttons, a confirm sheet's buttons, a challenge's options and its "Come back later");
//  - it presses a key only while the game is idle in the world: world mode, no dialogue open, no layer on top, no
//    challenge showing, and no scene running (RB.script.isRunning(), as the game's own prompts check);
//  - after each action it answers only the layers the caller said to expect, in order; any other layer (a sheet with
//    other buttons, a second card, an unplanned challenge, the New Game+ offer, a teaching card), a missing expected
//    control, an ambiguous answer or a timeout throws: nothing is guessed or dismissed;
//  - a challenge is answered from the step's own data (RB.challenge.current()): the one option marked right, found
//    as exactly one rendered button (its markup, the render counter data-src removed from both); a step with no
//    options, more or fewer than one right option, or not exactly one matching button throws. The one deliberate
//    wrong pick ('wrong-later') takes the first option not marked right, found the same way, and then
//    "Come back later";
//  - it never calls a helper that moves the player or runs a scene (no RB.script.run, RB.world.enter, RB.test.place,
//    RB.test.step, RB.ui.hall.goIn or leave). It reads the game's state to decide and to check (the map's collision
//    and exits to plan a route, the Hall record, the visit, flags), and it records the lines said by wrapping
//    RB.ui.dialogue.say (instrumentation only).
//
// The setup a caller may declare (begin): a throwaway journey after the story (RB.game.debugStart in the Hall's
// foyer, slot 4 of a fresh browser context, never a player's saves; the story's flags with ngp_offered, so the
// completed-story New Game+ offer is not made; each floor's first-arrival scene is not marked seen and plays), the
// wing's pattern and the level (learn.profile), both set in the foyer before the wing is entered, and the companion.
// EVIDENCE=<dir> keeps each run's step log and a few screenshots there (not committed).
import fs from 'node:fs';
import path from 'node:path';

export const DONE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true, postgame: true, hall_ledger: true, hall_foyer_seen: true, ngp_offered: true };
const DIRK = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
const sleep = (p, ms) => p.waitForTimeout(ms);

// ---- evidence (EVIDENCE=<dir>) -----------------------------------------------------------------------------------------
const EV = process.env.EVIDENCE || null;
if (EV) fs.mkdirSync(EV, { recursive: true });
export function evidence(name) {
  const file = EV ? path.join(EV, name + '.log') : null;
  return {
    note: (msg) => { if (file) fs.appendFileSync(file, new Date().toISOString() + ' ' + msg + '\n'); },
    shot: async (p, what) => { if (EV) await p.screenshot({ path: path.join(EV, name + '-' + what + '.png') }); },
  };
}

// ---- the journey -------------------------------------------------------------------------------------------------------
// o: { w, pat, prof, comp } (comp: undefined is Mio; null is alone)
export async function begin(p, o) {
  await p.evaluate(({ DONE, o }) => {
    const s = RB.game.debugStart('hall.foyer', 1, 10, { dir: 'right', comp: o.comp === undefined ? 'mio' : o.comp, flags: Object.assign({}, DONE) });
    s.edition = 2; s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both'; s.learn.profile = o.prof || 'E';
    if (o.w) RB.hall.wrec(s, o.w).pat = o.pat;
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.settings.lightbulb = false;
    RB.game.applySettings();
    RB.save.setCurrent(4, 0);
    window.__lines = [];
    if (!RB.ui.dialogue.__kept) {
      const say = RB.ui.dialogue.say;
      RB.ui.dialogue.say = function (l) { window.__lines.push({ who: l.who || '', jp: l.jp || '', en: l.en || '' }); return say.apply(this, arguments); };
      RB.ui.dialogue.__kept = true;
    }
  }, { DONE, o });
  await waitIdle(p, 8000);
}
export const lines = (p) => p.evaluate(() => window.__lines.splice(0));

// ---- reading the game ----------------------------------------------------------------------------------------------------
export const where = (p) => p.evaluate(() => {
  const W = RB.world.W, v = RB.hall.visitOf(RB.game.s);
  return { map: W.map.id, x: W.player.x, y: W.player.y, dir: W.player.dir, floor: v ? v.floor : null, practice: v ? !!v.practice : null };
});
export const peek = (p, w) => p.evaluate((w) => { const r = RB.hall.peek(RB.game.s, w); return r ? JSON.parse(JSON.stringify(r)) : null; }, w);
export const visit = (p) => p.evaluate(() => { const v = RB.hall.visitOf(RB.game.s); return v ? JSON.parse(JSON.stringify(v)) : null; });
export const wingFlags = (p, w) => p.evaluate((w) => Object.keys(RB.game.s.flags).filter((k) => k.indexOf('xp_hall_' + w + '_') === 0 && RB.game.s.flags[k]), w);
export const gone = (p, w) => p.evaluate((w) => [1, 2, 3, 4].filter((n) => RB.game.s.flags['xp_hall_' + w + '_f0_t3_gone' + n]), w);
export const blocked = (p, x, y) => p.evaluate(({ x, y }) => RB.maps.blockedStatic(RB.world.W.map, x, y), { x, y });
// where a scene is used on this map (its prop), from the map's own data: exactly one place, or it throws
export async function placeOf(p, scene) {
  const at = await p.evaluate((scene) => (RB.world.W.map.props || []).filter((e) => e && e.scene === scene).map((e) => [e.x, e.y]), scene);
  if (at.length !== 1) throw new Error('expected one place for ' + scene + ' on ' + (await where(p)).map + ', found ' + JSON.stringify(at));
  return at[0];
}
// the tile of the exit on this map that leads to `to`, from the map's own data: exactly one, or it throws
export async function exitTo(p, to) {
  const at = await p.evaluate((to) => (RB.maps.compile(RB.world.W.map.id).exits || []).filter((e) => e.to === to).map((e) => [e.x, e.y]), to);
  if (at.length !== 1) throw new Error('expected one exit to ' + to + ', found ' + JSON.stringify(at));
  return at[0];
}

// what is on screen: idle means the world waits for the player
const state = (p) => p.evaluate(() => {
  const top = RB.ui.topLayer && RB.ui.topLayer();
  const fb = document.querySelector('.chal .fbwrap');
  return {
    mode: RB.game.mode(), dlg: RB.ui.dialogue.isOpen(), top: top ? (top.name || '?') : null, running: RB.script.isRunning(),
    card: [...document.querySelectorAll('.hall-folio [data-a]')].map((b) => b.dataset.a),
    sheet: [...document.querySelectorAll('.csheet .foot button')].map((b) => b.textContent.trim()),
    chal: !!document.querySelector('.chal'), fb: fb ? fb.getAttribute('data-fb') : null,
  };
});
const isIdle = (st) => st.mode === 'world' && !st.dlg && !st.top && !st.running && !st.chal && !st.card.length && !st.sheet.length;
export async function waitIdle(p, ms = 6000) {
  const t0 = Date.now();
  let st;
  while (Date.now() - t0 < ms) { st = await state(p); if (isIdle(st)) return st; await sleep(p, 80); }
  throw new Error('not idle after ' + ms + ' ms: ' + JSON.stringify(st));
}
// the gate: a key is pressed only while the world is idle
async function gate(p) {
  const st = await state(p);
  if (!isIdle(st)) throw new Error('not idle where a key was to be pressed: ' + JSON.stringify(st));
}

// ---- answering what the game shows -----------------------------------------------------------------------------------------
// plan: { card: data-a to choose on the Hall card, sheet: [button text, ...] in order, chal: ['right' | 'later' |
// 'wrong-later', ...] in order, timeout }. Every planned layer must appear; anything else throws.
export async function settle(p, plan = {}) {
  const log = { enter: 0, card: [], sheet: [], chal: [] };
  let card = plan.card || null;
  const sheets = [...(plan.sheet || [])], chals = [...(plan.chal || [])];
  const t0 = Date.now(), limit = plan.timeout || 60000;
  let quiet = 0;
  while (Date.now() - t0 < limit) {
    await sleep(p, 100);
    const st = await state(p);
    if (st.chal) {
      const how = chals.shift();
      if (!how) throw new Error('unexpected challenge');
      log.chal.push(await answer(p, how));
      quiet = 0; continue;
    }
    if (st.card.length) {
      if (!card) throw new Error('unexpected Hall card: ' + JSON.stringify(st.card));
      const sel = '.hall-folio [data-a="' + card + '"]';
      const n = await p.locator(sel).count();
      if (n !== 1) throw new Error('the Hall card has ' + n + ' buttons ' + card + ': ' + JSON.stringify(st.card));
      log.card.push((await p.locator(sel).textContent()).trim());
      await p.locator(sel).click();
      card = null; quiet = 0; continue;
    }
    if (st.sheet.length) {
      const want = sheets.shift();
      const k = want ? st.sheet.indexOf(want) : -1;
      if (k < 0 || st.sheet.indexOf(want, k + 1) >= 0) throw new Error('unexpected sheet ' + JSON.stringify(st.sheet) + (want ? ' (wanted "' + want + '")' : ''));
      log.sheet.push(want);
      await p.locator('.csheet .foot button').nth(k).click();
      quiet = 0; continue;
    }
    if (st.dlg) { log.enter++; await p.keyboard.press('Enter'); quiet = 0; continue; }
    if (st.top) throw new Error('unexpected layer ' + st.top);
    if (isIdle(st)) { if (++quiet >= 3) break; } else quiet = 0;
  }
  if (quiet < 3) throw new Error('did not settle in ' + limit + ' ms: ' + JSON.stringify(await state(p)));
  if (card || sheets.length || chals.length) throw new Error('expected but not shown: ' + JSON.stringify({ card, sheets, chals }));
  return log;
}
// one challenge step, answered as planned; returns { how, picks, fb: [...] }
async function answer(p, how) {
  const out = { how, picks: 0, fb: [] };
  const tab = p.locator('.chal-tabs .ptab[data-mode="choice"]');
  if (await tab.count() === 1 && !(await tab.evaluate((t) => t.classList.contains('on')))) await tab.click();
  await p.waitForSelector('.chal .mc .btn', { timeout: 5000 });
  if (how === 'later' || how === 'wrong-later') {
    if (how === 'wrong-later') {
      await pick(p, false);
      out.picks++;
      out.fb.push(await feedback(p));
      if (out.fb[0] !== 'no') throw new Error('the deliberate wrong pick was not shown as wrong: ' + out.fb[0]);
    }
    const leave = p.locator('.chal .cbtn[data-a="leave"]');
    if (await leave.count() !== 1 || (await leave.textContent()).trim() !== 'Come back later') throw new Error('no "Come back later" on the challenge');
    await leave.click();
  } else if (how === 'right') {
    await pick(p, true);
    out.picks++;
    out.fb.push(await feedback(p));
    if (out.fb[0] !== 'ok') throw new Error('the right option was not accepted: ' + out.fb[0]);
    const go = p.locator('.chal .fbwrap[data-fb="ok"] .fb-go');
    if (await go.count() !== 1) throw new Error('no Continue after the right answer');
    await go.click();
    // the step is over: the challenge closes, or its next step is shown (a new step clears the feedback)
    await p.waitForFunction(() => !document.querySelector('.chal') || !document.querySelector('.chal .fbwrap[data-fb]'), null, { timeout: 5000 });
  } else throw new Error('unknown plan for a challenge: ' + how);
  if (how !== 'right') await p.waitForFunction(() => !document.querySelector('.chal'), null, { timeout: 5000 });
  return out;
}
// the option marked right (or, deliberately, the first not marked right), as exactly one rendered button
async function pick(p, right) {
  const k = await p.evaluate((right) => {
    const norm = (h) => h.replace(/ data-src="\d+"/g, '');
    const st = RB.challenge.current();
    if (!st || !Array.isArray(st.options) || !st.options.length) return { err: 'a step without options' };
    const oks = st.options.filter((o) => o.ok);
    if (oks.length !== 1) return { err: oks.length + ' options marked right' };
    const o = right ? oks[0] : st.options.find((x) => !x.ok);
    if (!o) return { err: 'no option not marked right' };
    const want = norm(RB.ui.jhtml(o.text != null ? o.text : (o.jp || '')));
    const btns = [...document.querySelectorAll('.chal .mc .btn')];
    const hits = btns.map((b, i) => { const j = b.querySelector('.jline'); return j && norm(j.outerHTML) === want ? i : -1; }).filter((i) => i >= 0);
    if (hits.length !== 1) return { err: hits.length + ' buttons match the option' };
    return { i: hits[0] };
  }, right);
  if (k.err) throw new Error('cannot answer: ' + k.err);
  await p.locator('.chal .mc .btn').nth(k.i).click();
}
async function feedback(p) {
  await p.waitForFunction(() => { const f = document.querySelector('.chal .fbwrap'); return f && /^(ok|no)$/.test(f.getAttribute('data-fb') || ''); }, null, { timeout: 5000 });
  return p.evaluate(() => document.querySelector('.chal .fbwrap').getAttribute('data-fb'));
}

// ---- moving -------------------------------------------------------------------------------------------------------------------
// one arrow key, pressed only while idle; returns where the player is after
export async function press(p, dir) {
  await gate(p);
  await p.keyboard.down(DIRK[dir]); await sleep(p, 50); await p.keyboard.up(DIRK[dir]);
  for (let i = 0; i < 40; i++) { await sleep(p, 60); if (await p.evaluate(() => !RB.world.W.player.mv)) break; }
  await sleep(p, 80);
  return where(p);
}
// a route over the floor as the world blocks it (static collision, props as their conditions stand, people),
// stepping on no exit but the target
async function route(p, tx, ty) {
  return p.evaluate(({ tx, ty }) => {
    const W = RB.world.W, m = W.map;
    const busy = (x, y) => RB.maps.blockedStatic(m, x, y) || (RB.maps.exitAt(m, x, y) && !(x === tx && y === ty)) || W.npcs.some((n) => n.x === x && n.y === y && !n.follower && n.id !== (RB.game.s.comp || ''));
    const k = (x, y) => x + ',' + y, prev = new Map([[k(W.player.x, W.player.y), null]]), q = [[W.player.x, W.player.y]];
    const D = [[0, -1, 'up'], [0, 1, 'down'], [-1, 0, 'left'], [1, 0, 'right']];
    while (q.length) {
      const [x, y] = q.shift();
      if (x === tx && y === ty) { const out = []; let c = k(x, y); while (prev.get(c)) { out.unshift(prev.get(c)[1]); c = prev.get(c)[0]; } return out; }
      for (const [dx, dy, d] of D) { const nx = x + dx, ny = y + dy, kk = k(nx, ny); if (prev.has(kk) || nx < 0 || ny < 0 || nx >= m.w || ny >= m.h || busy(nx, ny)) continue; prev.set(kk, [k(x, y), d]); q.push([nx, ny]); }
    }
    return null;
  }, { tx, ty });
}
// walk to a tile with the arrow keys; returns where the player is (the walk stops when the map changes)
export async function walkTo(p, tx, ty) {
  for (let tries = 0; tries < 6; tries++) {
    const r = await route(p, tx, ty);
    if (!r) throw new Error('no route to ' + tx + ',' + ty + ' from ' + JSON.stringify(await where(p)));
    let clear = true;
    for (const d of r) {
      const before = await where(p);
      let after = await press(p, d);
      if (after.x === before.x && after.y === before.y && after.map === before.map) after = await press(p, d); // a turn first
      if (after.map !== before.map) return after;
      if (after.x === before.x && after.y === before.y) { clear = false; break; } // someone in the way: route again
    }
    const w = await where(p);
    if (clear || (w.x === tx && w.y === ty)) return w;
  }
  throw new Error('could not reach ' + tx + ',' + ty);
}
// stand on a free tile beside (x, y), face it, press Enter, answer what follows as planned; returns what was said
export async function useAt(p, x, y, plan) {
  const spot = await p.evaluate(({ x, y }) => {
    const W = RB.world.W, m = W.map;
    for (const [dx, dy, dir] of [[0, 1, 'up'], [-1, 0, 'right'], [1, 0, 'left'], [0, -1, 'down']]) {
      const nx = x + dx, ny = y + dy;
      if (!RB.maps.blockedStatic(m, nx, ny) && !RB.maps.exitAt(m, nx, ny) && !W.npcs.some((n) => n.x === nx && n.y === ny && !n.follower)) return { x: nx, y: ny, dir };
    }
    return null;
  }, { x, y });
  if (!spot) throw new Error('nowhere to stand beside ' + x + ',' + y);
  const at = await walkTo(p, spot.x, spot.y);
  if (at.x !== spot.x || at.y !== spot.y) throw new Error('did not reach ' + JSON.stringify(spot) + ': ' + JSON.stringify(at));
  if (at.dir !== spot.dir) {
    const t = await press(p, spot.dir); // the tile ahead: this turns to face it
    if (t.x !== spot.x || t.y !== spot.y || t.dir !== spot.dir) throw new Error('could not face ' + x + ',' + y + ': ' + JSON.stringify(t));
  }
  await gate(p);
  await lines(p);
  await p.keyboard.press('Enter');
  const log = await settle(p, plan);
  return { spot, log, said: await lines(p) };
}
// walk onto an exit's tile and answer what follows (the next floor's arrival)
export async function takeExit(p, x, y, plan) {
  const before = await where(p);
  await walkTo(p, x, y);
  const log = await settle(p, plan); // the way through (its fade) and the arrival
  const at = await where(p);
  if (at.map === before.map) throw new Error('the exit at ' + x + ',' + y + ' did not lead off ' + before.map);
  return { log, at };
}
export const quoted = (said) => said.filter((l) => /^"/.test(l.en)).map((l) => l.en.replace(/^"|"$/g, ''));
