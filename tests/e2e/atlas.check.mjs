// Browser test: a complete Unwritten Atlas expedition, driven through the real UI.
// Usage: node tools/build.mjs && node tests/e2e/atlas.check.mjs [--mod N] [--seed S] [--profile F|E|I|A] [--shots]
//
// Starts a session-only post-game campaign in the Lantern Hall, calls
// RB.hooks.atlas_start, then walks every room with the game's own tap-to-move
// and interaction: dialogue is advanced with the Next button, choices take the
// first option, language steps are answered through the challenge UI's
// "I don't know — show me" + Continue (recorded as assisted), battles use the
// Unravel card. It checks that extraction returns to rw.hall with rewards and
// that no console errors occurred. The wall-clock time is that of a scripted
// run with instant text; it is NOT a measurement of human play time.
import { serve, launch, page, root } from './lib.mjs';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const MOD = +arg('--mod', '0');
const SEED = arg('--seed', null);
const PROFILE = arg('--profile', 'F');
const COMP = arg('--comp', 'mio');
const SHOTS = args.includes('--shots');
const outDir = path.join(root, 'tests', 'e2e', 'out');
fs.mkdirSync(outDir, { recursive: true });

const { srv, url } = await serve();
const browser = await launch();
const { p, errors, requests } = await page(browser, url, { viewport: { width: 1280, height: 800 } });
const log = (...a) => console.log('  ', ...a);
let fails = 0;
const check = (cond, msg) => { if (cond) log('ok  ', msg); else { fails++; log('FAIL', msg); } };

// One UI action if something is waiting for input; returns what was done.
async function uiStep() {
  return p.evaluate(() => {
    const shown = (el) => el && !el.classList.contains('hidden') && el.offsetParent !== null;
    const chal = document.querySelector('.chal');
    if (chal) {
      const cont = [...chal.querySelectorAll('.fbwrap button')].find((b) => /Continue/.test(b.textContent));
      if (cont) { cont.click(); return 'challenge:continue'; }
      const rev = chal.querySelector('[data-a=reveal]');
      if (rev) { rev.click(); return 'challenge:reveal'; }
    }
    const panelBtn = [...document.querySelectorAll('.panel .foot .btn.primary, .panel [data-ok]')].find(shown);
    if (panelBtn) { panelBtn.click(); return 'panel'; }
    const ch = document.querySelector('.choices');
    if (shown(ch)) { const b = ch.querySelector('button'); if (b) { b.click(); return 'choice:' + b.textContent.slice(0, 40); } }
    const card = document.querySelector('.combat-ui .responses [data-i]');
    if (card && !card.disabled) { card.click(); return 'battle:card'; }
    const dlg = document.querySelector('.dlg');
    if (shown(dlg)) { dlg.querySelector('.b-next').click(); return 'dialogue'; }
    const c = document.querySelector('.card button');
    if (c) { c.click(); return 'card'; }
    return null;
  });
}
const counts = { dialogue: 0, choice: 0, challenge: 0, battle: 0, panel: 0 };
async function settle(ms = 60000) {
  const t0 = Date.now();
  let idle = 0;
  while (Date.now() - t0 < ms) {
    const a = await uiStep();
    if (a) { idle = 0; const k = a.split(':')[0]; counts[k] = (counts[k] || 0) + 1; await p.waitForTimeout(40); continue; }
    const st = await p.evaluate(() => ({ mode: RB.game.mode(), moving: !!(RB.world.W.player && (RB.world.W.player.mv || RB.world.W.path)), running: RB.script.isRunning() }));
    if (st.mode === 'world' && !st.moving && !st.running) { idle++; if (idle > 3) return true; }
    await p.waitForTimeout(60);
  }
  await p.screenshot({ path: path.join(outDir, 'atlas_timeout.png') });
  const dump = await p.evaluate(() => ({ modes: RB.game.G.modes.slice(), running: RB.script.isRunning(), map: RB.game.s.map, pos: [RB.game.s.x, RB.game.s.y], path: RB.world.W.path, ui: [...document.querySelectorAll('#ui > *')].filter((e) => !e.classList.contains('hidden')).map((e) => e.className).join(','), chal: !!document.querySelector('.chal'), combat: !!document.querySelector('.combat-ui') }));
  console.log('TIMEOUT', JSON.stringify(dump));
  throw new Error('timed out waiting for the world');
}
async function state() {
  return p.evaluate(() => {
    const s = RB.game.s, run = s.atlas.run;
    const plan = run ? RB.atlas._debug.plan() : null;
    const room = run ? plan[run.room] : null;
    const present = (pp) => !pp.if || RB.state.test(s, pp.if);
    if (room) { room.props = room.props.filter(present); room.npcs = room.npcs.filter((n) => { const d = RB.content.maps[s.map].npcs.find((x) => x.id === n.id); return !d.if || RB.state.test(s, d.if); }); room.foes = room.foes.filter((f) => !s.flags['foe:' + s.map + ':' + f.id]); }
    return { map: s.map, key: run && run.room, room, pos: [s.x, s.y], run: run ? { mods: run.mods, relics: run.relics, path: run.path, stats: run.stats, lantern: run.lantern } : null };
  });
}
async function tap(x, y, label) {
  for (let tries = 0; tries < 3; tries++) {
    const before = await p.evaluate(() => [RB.game.s.map, RB.game.s.x, RB.game.s.y, RB.game.s.backlog.length].join('|'));
    await p.evaluate(([x, y]) => RB.world.tapTile(x, y), [x, y]);
    await p.waitForTimeout(80);
    await settle();
    const after = await p.evaluate(() => [RB.game.s.map, RB.game.s.x, RB.game.s.y, RB.game.s.backlog.length].join('|'));
    if (after !== before) return true;
  }
  log('warn: tap had no effect', label, x, y);
  return false;
}
async function shot(name) { if (SHOTS) await p.screenshot({ path: path.join(outDir, 'atlas_' + name + '.png') }); }

const t0 = Date.now();
await p.evaluate(([prof, comp, mod, seed]) => {
  RB.game.debugStart('rw.hall', 5, 5, { comp, profile: prof, flags: { post: true } });
  RB.game.settings.textSpeed = 'instant';
  RB.atlas._debug.flags.chooseMod = mod;
  if (seed != null) RB.atlas._debug.flags.seed = +seed;
  RB.hooks.atlas_start([], {});
  return 1;
}, [PROFILE, COMP, MOD, SEED]);
await settle();
let st = await state();
check(st.map.startsWith('atlas.') && st.key === 't', 'expedition started in the threshold room (' + st.map + ', mods: ' + (st.run.mods.join('+') || 'none') + ')');
await shot('threshold');

const visited = [];
for (let guard = 0; guard < 20; guard++) {
  st = await state();
  if (!st.run) break;
  const r = st.room;
  visited.push(st.key + ':' + r.pattern);
  log('room', st.key, r.kind, r.pattern, r.branch || '', r.obj ? r.obj.type : '', r.boss || '');
  if (r.kind === 'fork') await shot('fork');
  if (r.kind === 'climax') await shot('climax');
  if (r.kind === 'extract') await shot('extract');
  // objectives and people first
  const fresh = async () => (await state()).room;
  if (r.obj && r.obj.type === 'doors') {
    const tab = r.props.find((pp) => pp.scene === 'atlas.doors.clue');
    await tap(tab.x, tab.y, 'clue');
    const wrong = r.exits.find((e) => !e.correct);
    await tap(wrong.x, wrong.y, 'wrong door');
    const right = r.exits.find((e) => e.correct);
    await tap(right.x, right.y, 'right door');
    continue;
  }
  for (let i = 0; i < 6; i++) {
    const rr = await fresh();
    const pr = rr.props.find((pp) => pp.scene === 'atlas.obj');
    if (!pr) break;
    await tap(pr.x, pr.y, 'objective');
  }
  for (let i = 0; i < 4; i++) {
    const rr = await fresh();
    const n = rr.npcs.find((x) => x.name);
    if (!n) break;
    await tap(n.x, n.y, 'name');
  }
  for (let i = 0; i < 3; i++) {
    const rr = await fresh();
    const g = rr.foes.find((f) => f.id === 'guard');
    if (!g) break;
    await tap(g.x, g.y, 'guard');
  }
  for (let i = 0; i < 4; i++) {
    const rr = await fresh();
    const c = rr.props.find((pp) => pp.scene === 'atlas.relic.find');
    if (!c) break;
    if (!(await tap(c.x, c.y, 'cache'))) break;
  }
  if (r.kind === 'camp') {
    const stump = r.props.find((pp) => pp.scene === 'atlas.camp');
    await tap(stump.x, stump.y, 'camp');
  }
  if (r.kind === 'climax') {
    const g = (await fresh()).npcs.find((n) => n.id === 'atlas_guardian');
    if (g) await tap(g.x, g.y, 'guardian');
    for (let i = 0; i < 3; i++) {
      const rr = await fresh();
      const c = rr.props.find((pp) => pp.scene === 'atlas.relic.find');
      if (!c) break;
      if (!(await tap(c.x, c.y, 'cache'))) break;
    }
  }
  if (r.kind === 'extract') {
    const w = r.props.find((pp) => pp.scene === 'atlas.extract.room');
    await tap(w.x, w.y, 'waystone');
    break;
  }
  const e = (await fresh()).exits[0];
  const beforeMap = (await state()).map;
  await tap(e.x, e.y, 'exit');
  const now = await state();
  if (now.map === beforeMap) { log('stuck in', now.key); break; }
}
const secs = ((Date.now() - t0) / 1000).toFixed(1);
st = await p.evaluate(() => {
  const s = RB.game.s;
  return { map: s.map, run: s.atlas.run, completed: s.atlas.completed, summary: s.atlas.lastSummary, restore1: !!s.flags.atlas_restore_1,
    atlasItems: Object.keys(s.inv).filter((k) => k.startsWith('atlas_')), notes: s.notebook.filter((n) => n.id.startsWith('atlas_')).map((n) => n.id),
    leftoverFlags: Object.keys(s.flags).filter((k) => k.startsWith('atlas_r_') || k.indexOf(':atlas.') >= 0), maps: Object.keys(RB.content.maps).filter((k) => k.startsWith('atlas.')).length,
    backlog: s.backlog.length, mastery: Object.keys(s.learn.items).length, patched: RB.combatLogic.init !== RB.atlas.combat.orig.init };
});
await p.waitForTimeout(300);
await p.screenshot({ path: path.join(outDir, 'atlas_home.png') });
check(visited.length >= 8, 'walked ' + visited.length + ' rooms: ' + visited.join(' → '));
check(st.map === 'rw.hall', 'extraction returned to rw.hall (now on ' + st.map + ')');
check(!st.run, 'run state cleared');
check(st.completed === 1, 'expedition counted as completed');
check(st.atlasItems.length >= 1, 'reward received: ' + st.atlasItems.join(', '));
check(st.restore1, 'settlement restoration flag atlas_restore_1 set');
check(st.notes.length >= 3, 'notebook discoveries: ' + st.notes.join(', '));
check(st.leftoverFlags.length === 0, 'no run flags left behind (' + st.leftoverFlags.length + ')');
check(st.maps === 0, 'generated maps unregistered after extraction (' + st.maps + ' left)');
check(!st.patched, 'combat patches removed after the run');
check(st.mastery > 0, 'learning records written (' + st.mastery + ' items)');
check(errors.length === 0, 'no console/page errors' + (errors.length ? ': ' + errors.slice(0, 5).join(' | ') : ''));
check(requests.length === 0, 'no external requests');
console.log('\nscripted run: ' + secs + ' s wall clock with instant text and auto-answers (NOT a human playtime measurement);',
  'UI actions:', JSON.stringify(counts), '; dialogue backlog lines:', st.backlog);
await browser.close();
srv.close();
process.exit(fails ? 1 : 0);
