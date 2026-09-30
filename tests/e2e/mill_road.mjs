// The Mill Road repair (addendum §14.1; docs/addendum/fieldweave.md), in the
// real game: a rocky ridge crosses the road with exactly two ways through —
// the echoing narrows (x 6; the voices push back whoever walks up into them
// until Suzu's round quiets them) and the animal track behind the reed bed
// (x 12; closed until Nao clears it). Either one alone is enough; neither is
// needed to come back down; nobody is ever held on the mill side.
//
// Checked with click-to-walk (a real mouse click on the mill door or the
// village exit, the game's own path-finding) and with held arrow keys, for
// every combination of the two flags (and the chapter's end), from the south
// and from the north, walking out of the mill, and from positions an older
// save could hold on the mill side. Also: the observation lines and flags,
// and asking Nao or Suzu stays a low-friction choice that awards no bond.
// Usage: node tests/e2e/mill_road.mjs
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const OUT = path.join(root, 'tests/e2e/out/mill_road');
fs.mkdirSync(OUT, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let fail = 0, n = 0;
const assert = (c, m) => { n++; if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
// the whole map fits on this screen, so every click lands on a visible tile
const { p, errors } = await page(b, url, { viewport: { width: 600, height: 900 } });
const t0 = Date.now();
// the arrival scenes are seen and the road's three creatures already settled, so a
// walk is only a walk (meeting one on the way home is ordinary play, not a trap)
const ENTER = { 'enter:rw.millroad:rw.mr_enter': true, 'enter:rw.mill1:rw.m1_enter': true, 'foe:rw.millroad:f1': true, 'foe:rw.millroad:f2': true, 'foe:rw.millroad:f3': true };

async function start(map, x, y, dir, flags) {
  await p.evaluate(({ map, x, y, dir, flags }) => {
    RB.game.debugStart(map, x, y, { dir, flags });
    RB.game.settings.textSpeed = 'instant';
  }, { map, x, y, dir, flags: Object.assign({ rw_mill_open: true }, ENTER, flags) });
  await p.waitForTimeout(200);
  await drain();
}
async function drain() {
  for (let k = 0; k < 200; k++) {
    const s = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), ch: !!document.querySelector('.choices:not(.hidden) .choice'), mode: RB.game.mode() }));
    if (s.ch) return 'choice';
    if (s.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(25); continue; }
    if (s.mode === 'world') return 'world';
    await p.waitForTimeout(50);
  }
  return 'timeout';
}
const where = () => p.evaluate(() => ({ map: RB.world.W.map.id, x: RB.world.W.player.x, y: RB.world.W.player.y, path: !!RB.world.W.path, mv: !!RB.world.W.player.mv, mode: RB.game.mode(), flags: Object.keys(RB.game.s.flags).filter((f) => /^rw_mr_|rw_echo/.test(f)) }));
const log = () => p.evaluate(() => RB.game.s.backlog.map((l) => l.en).join('\n'));
// click a tile with the real mouse; follow until the player has stopped (or the map changed)
async function clickWalk(tx, ty, maxMs = 30000) {
  const m0 = (await where()).map;
  const pt = await p.evaluate(([tx, ty]) => { const a = RB.render.tileToCss(tx, ty), c = RB.render.tileToCss(tx + 1, ty + 1); return { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 }; }, [tx, ty]);
  await p.mouse.click(pt.x, pt.y);
  const tEnd = Date.now() + maxMs;
  let last = '', still = 0;
  while (Date.now() < tEnd) {
    const d = await drain();
    if (d === 'choice') return { choice: true, ...(await where()) };
    const w = await where();
    if (w.map !== m0) { await p.waitForTimeout(500); await drain(); return where(); }
    const key = w.x + ',' + w.y + (w.path || w.mv ? '+' : '');
    still = key === last && !w.path && !w.mv ? still + 1 : 0;
    last = key;
    if (still >= 8) return w;
    await p.waitForTimeout(80);
  }
  return where();
}
// hold an arrow key until the player stops moving (a wall, a push back) or reaches `until`
async function holdKey(key, until, maxMs = 12000) {
  await p.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
  await p.keyboard.down(key);
  const tEnd = Date.now() + maxMs;
  let last = '', still = 0;
  try {
    while (Date.now() < tEnd) {
      const w = await where();
      if (w.mode !== 'world') { await p.keyboard.up(key); await drain(); await p.keyboard.down(key); still = 0; continue; }
      if (until && until(w)) break;
      const k = w.map + w.x + ',' + w.y;
      still = k === last && !w.mv ? still + 1 : 0;
      last = k;
      if (still >= 10) break;
      await p.waitForTimeout(60);
    }
  } finally { await p.keyboard.up(key); }
  await p.waitForTimeout(250);
  await drain();
  return where();
}
const DOOR = [9, 4], EXIT = [10, 25];
const COMBOS = [[], ['rw_mr_nao'], ['rw_mr_suzu'], ['rw_mr_nao', 'rw_mr_suzu'], ['rw_echo_done'], ['rw_mr_obs_echo', 'rw_mr_obs_reeds']];
const opens = (f) => f.some((x) => x === 'rw_mr_nao' || x === 'rw_mr_suzu' || x === 'rw_echo_done');
const flagsOf = (f) => Object.fromEntries(f.map((x) => [x, true]));

// ---- click-to-walk to the mill door, every combination --------------------------------------------------------------
for (const f of COMBOS) {
  await start('rw.millroad', 10, 24, 'up', flagsOf(f));
  const w = await clickWalk(...DOOR);
  if (opens(f)) assert(w.map === 'rw.mill1', 'click the mill door ' + JSON.stringify(f) + ': walked there and went in (' + w.map + ')');
  else {
    const said = await log();
    assert(w.map === 'rw.millroad' && w.y >= 17 && !w.path && w.mode === 'world', 'click the mill door ' + JSON.stringify(f) + ': no way past the ridge; the player stops south of it (' + w.x + ',' + w.y + ') and is free to move');
    assert(/push against you like a wall/.test(said) && w.flags.indexOf('rw_mr_obs_echo') >= 0, '  … the path led into the narrows, which pushed back and said why (observation noted)');
  }
}
await p.screenshot({ path: path.join(OUT, 'ridge_closed.png') });

// ---- held arrow keys ---------------------------------------------------------------------------------------------------------
{
  await start('rw.millroad', 6, 18, 'up', {});
  let w = await holdKey('ArrowUp', (w) => w.y <= 12);
  assert(w.map === 'rw.millroad' && w.y >= 17 && /push against you/.test(await log()), 'walking up into the narrows with no help: pushed back to ' + w.x + ',' + w.y);
  await start('rw.millroad', 12, 18, 'up', {});
  w = await holdKey('ArrowUp', (w) => w.y <= 12);
  assert(w.y === 18, 'walking up the animal track with no help: the reed bed stops you (' + w.x + ',' + w.y + ')');
  await p.keyboard.press('Enter');
  await drain();
  const sd = await log();
  w = await where();
  assert(/trodden line/.test(sd) && w.flags.indexOf('rw_mr_obs_reeds') >= 0, 'looking at the reeds: a trodden line at their roots (observation noted)');
  await p.screenshot({ path: path.join(OUT, 'reeds_look.png') });
  for (const [f, x] of [[['rw_mr_suzu'], 6], [['rw_mr_nao'], 12], [['rw_echo_done'], 6], [['rw_echo_done'], 12], [['rw_mr_nao'], 6]]) {
    await start('rw.millroad', x, 18, 'up', flagsOf(f));
    w = await holdKey('ArrowUp', (w) => w.y <= 12);
    const through = w.y <= 12;
    // the narrows fall quiet with Suzu's round (or the chapter's end); the reeds part only for Nao
    const expect = (x === 6 && (f.includes('rw_mr_suzu') || f.includes('rw_echo_done'))) || (x === 12 && f.includes('rw_mr_nao'));
    assert(through === expect, 'arrow keys up x ' + x + ' with ' + JSON.stringify(f) + ': ' + (expect ? 'through to ' : 'held at ') + w.x + ',' + w.y);
  }
}

// ---- from the north: down through the narrows is never stopped -----------------------------------------------------------
{
  await start('rw.millroad', 6, 12, 'down', {});
  let w = await holdKey('ArrowDown', (w) => w.y >= 18);
  const sd = await log();
  assert(w.y >= 17 && /don't stop you going down/.test(sd) && w.flags.indexOf('rw_mr_down_seen') >= 0, 'walking down the narrows with no flags: you pass, and hear once that the voices only push those heading up');
  await p.evaluate(() => RB.test.place(6, 12, 'down'));
  const before = (await log()).split('\n').length;
  w = await holdKey('ArrowDown', (w) => w.y >= 18);
  const extra = (await log()).split('\n').slice(before);
  assert(w.y >= 17 && !extra.length, 'the second time down: no line at all' + (extra.length ? ' (' + extra.join(' / ') + ')' : ''));
}

// ---- walking out of the mill and home, with each combination ----------------------------------------------------------------
for (const f of [[], ['rw_mr_nao'], ['rw_mr_suzu'], ['rw_echo_done']]) {
  await start('rw.mill1', 7, 10, 'down', flagsOf(f));
  let w = await holdKey('ArrowDown', (w) => w.map === 'rw.millroad');
  const out = w.map === 'rw.millroad' && Math.abs(w.x - 9) + Math.abs(w.y - 5) <= 2;
  if (!out) console.log('  (came out at ' + w.map + ' ' + w.x + ',' + w.y + ')');
  w = await clickWalk(...EXIT);
  // a click on the far side of the ridge may need a second click after a scene (e.g. none here)
  if (w.map === 'rw.millroad') w = await clickWalk(...EXIT);
  assert(out && w.map === 'rw.village', 'out of the mill ' + JSON.stringify(f) + ': outside its door, then one click on the village exit walks all the way home (' + w.map + ')');
}

// ---- positions an older save could hold on the mill side ---------------------------------------------------------------------
for (const [x, y] of [[3, 8], [15, 10], [11, 11], [9, 5], [6, 13], [6, 15], [6, 16], [12, 13], [12, 16], [17, 12]]) {
  await start('rw.millroad', x, y, 'down', {});
  const w0 = await where();
  let w = await clickWalk(...EXIT);
  if (w.map === 'rw.millroad') w = await clickWalk(...EXIT);
  assert(w.map === 'rw.village', 'an older save standing at ' + x + ',' + y + ' (placed at ' + w0.x + ',' + w0.y + ') walks home with a click (' + w.map + ')');
}

// ---- asking Nao or Suzu: a low-friction choice, an optional reading, no bond ---------------------------------------------------
{
  await start('rw.millroad', 11, 20, 'up', { rw_mr_obs_reeds: true });
  await p.evaluate(() => { RB.test.place(11, 20, 'up'); });
  await p.keyboard.press('Enter');
  let d = await drain();
  const firstMenu = await p.evaluate(() => [...document.querySelectorAll('.choices .choice')].map((b) => b.textContent));
  assert(d === 'choice' && firstMenu.some((t) => /track underneath/.test(t)) && firstMenu.some((t) => /plain reeds/.test(t)), 'Nao asks what you made of the reeds (both answers lead on)');
  await p.locator('.choices .choice').filter({ hasText: /plain reeds/ }).click();
  d = await drain();
  await p.locator('.choices .choice').filter({ hasText: /clear the reeds/ }).click();
  await drain();
  let s = await p.evaluate(() => ({ nao: !!RB.game.s.flags.rw_mr_nao, bond: Object.keys(RB.game.s.company.bond), comp: RB.game.s.comp }));
  assert(s.nao && !s.bond.length && !s.comp, 'asking Nao clears the reeds and awards no bond to a companion not yet chosen');
  const w = await holdKey('ArrowUp', (w) => w.y <= 12);
  void w;
  await start('rw.millroad', 5, 20, 'up', { rw_mr_obs_echo: true });
  await p.evaluate(() => { RB.test.place(5, 19, 'up'); });
  await p.keyboard.press('Enter');
  await drain();
  await p.locator('.choices .choice').filter({ hasText: /last sound they caught/ }).click();
  await drain();
  await p.locator('.choices .choice').filter({ hasText: /Sing with her/ }).click();
  await drain();
  s = await p.evaluate(() => ({ suzu: !!RB.game.s.flags.rw_mr_suzu, bond: Object.keys(RB.game.s.company.bond), comp: RB.game.s.comp, log: RB.game.s.backlog.map((l) => l.en).join('\n') }));
  assert(s.suzu && !s.bond.length && !s.comp && /One at a time/.test(s.log), 'the reading that matches what you heard: Suzu takes it up; singing quiets the voices; no bond');
  await p.screenshot({ path: path.join(OUT, 'suzu_round.png') });
}

assert(!errors.length, 'no console or page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
console.log('\n' + (n - fail) + '/' + n + ' checks passed in ' + Math.round((Date.now() - t0) / 1000) + ' s' + (fail ? ' — ' + fail + ' FAILED' : ''));
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
