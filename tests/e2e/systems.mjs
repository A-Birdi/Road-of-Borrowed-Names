// Game-system checks in the built index.html through the real UI:
// fast travel from the map tab, stepping back from an encounter, defeat
// returning to the checkpoint with learning kept, and every hub's travel
// arrival tile. Usage: node tests/e2e/systems.mjs [filter]
import { serve, launch, page } from './lib.mjs';

const only = process.argv[2];
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 120s')), 120000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.message || e).slice(0, 400)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
// click through any dialogue (first choice) until the world is back
async function settle(p) {
  for (let i = 0; i < 400; i++) {
    const st = await p.evaluate(() => ({ mode: RB.game.mode(), dlg: RB.ui.dialogue.isOpen(), choice: !!document.querySelector('.choices:not(.hidden) button') }));
    if (st.mode === 'world' && !st.dlg) return true;
    if (st.choice) await p.click('.choices:not(.hidden) button >> nth=0');
    else if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(50);
  }
  throw new Error('did not return to the world');
}

await test('fast travel from the map tab to every known hub', async () => {
  const { p, errors } = await page(b, url);
  const hubs = await p.evaluate(() => {
    const s = RB.game.debugStart('sg.harbor', 20, 22, { comp: 'mio', flags: { departed: true } });
    for (const id in RB.content.places) if (RB.content.places[id].hub) s.travel[id] = true;
    return Object.keys(RB.content.places).filter((id) => RB.content.places[id].hub);
  });
  assert(hubs.length >= 5, 'at least five hubs: ' + hubs.join(','));
  for (const id of hubs) {
    await p.evaluate(() => RB.ui.menu.open('map'));
    await p.waitForSelector('[data-go="' + id + '"]', { timeout: 5000 });
    await p.click('[data-go="' + id + '"]');
    await p.waitForTimeout(300);
    await settle(p);
    await p.waitForTimeout(400);
    const at = await p.evaluate((id) => {
      const pl = RB.content.places[id], W = RB.world.W;
      return { want: pl.map, got: W.map.id, x: W.player.x, y: W.player.y, blocked: RB.maps.blockedStatic(W.map, W.player.x, W.player.y), mode: RB.game.mode() };
    }, id);
    assert(at.got === at.want, id + ': arrived on ' + at.got + ' not ' + at.want);
    assert(!at.blocked, id + ': arrival tile blocked at ' + at.x + ',' + at.y);
    // can take a step somewhere from the arrival tile
    const moved = await p.evaluate(() => { const W = RB.world.W; return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !RB.maps.blockedStatic(W.map, W.player.x + dx, W.player.y + dy)); });
    assert(moved, id + ': no free tile around arrival');
  }
  assert(!errors.length, 'page errors: ' + errors.join('; '));
  await p.context().close();
});

await test('step back from a regular encounter in the combat UI (nothing lost)', async () => {
  const { p, errors } = await page(b, url);
  await p.evaluate(() => {
    const s = RB.game.debugStart('rw.millroad', 10, 22, { comp: 'suzu' });
    s.learn.kanaKnown = 'both'; s.words.push('mamoru', 'mizu', 'hikari');
    window.__learnBefore = JSON.stringify(s.learn.items || {});
    RB.game.startBattle('rw.reedling', { foeKey: 'foe:test:x' }).then((r) => { window.__res = r; });
  });
  let fled = false;
  for (let i = 0; i < 200 && !fled; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), flee: !!document.querySelector('[data-flee]'), confirm: !!document.querySelector('.confirm, .modal') }));
    if (st.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(60); continue; }
    if (st.flee) {
      await p.click('[data-flee]');
      await p.waitForSelector('[role=alertdialog] .foot button', { timeout: 5000 });
      await p.click('[role=alertdialog] .foot button >> nth=0');
      fled = true;
      break;
    }
    await p.waitForTimeout(100);
  }
  assert(fled, 'flee button reached');
  await p.waitForFunction(() => window.__res, null, { timeout: 10000 });
  const r = await p.evaluate(() => ({ res: window.__res, mode: RB.game.mode(), foe: !!RB.game.s.flags['foe:test:x'], pc: RB.game.s.resolve && RB.game.s.resolve.pc }));
  assert(r.res === 'flee', 'battle result flee, got ' + r.res);
  assert(r.mode === 'world', 'back in the world');
  assert(!r.foe, 'the foe is not marked defeated (can return)');
  assert(!errors.length, 'page errors: ' + errors.join('; '));
  await p.context().close();
});

await test('bosses cannot be stepped back from (no flee button)', async () => {
  const { p } = await page(b, url);
  await p.evaluate(() => {
    const s = RB.game.debugStart('rw.mill2', 5, 5, { comp: 'nao' });
    s.learn.kanaKnown = 'both'; s.words.push('mamoru', 'mizu', 'hikari');
    RB.game.startBattle('rw.mill_echo', {});
  });
  let sawCards = false;
  for (let i = 0; i < 200 && !sawCards; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.resp[data-i="0"]'), flee: !!document.querySelector('[data-flee]') }));
    if (st.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(60); continue; }
    if (st.cards) { sawCards = true; assert(!st.flee, 'no flee button on a boss'); }
    await p.waitForTimeout(80);
  }
  assert(sawCards, 'boss response cards shown');
  await p.context().close();
});

await test('defeat returns to the last checkpoint with resolve restored and learning kept (combat result stubbed)', async () => {
  const { p, errors } = await page(b, url);
  const r = await p.evaluate(async () => {
    const s = RB.game.debugStart('rw.mill1', 6, 6, { comp: 'ren' });
    s.checkpoint = { map: 'rw.millroad', x: 10, y: 22, dir: 'up' };
    s.resolve.pc = 1; s.resolve.comp = 0;
    RB.learn.record('k:あ', { ok: true, mode: 'hand' });
    const before = JSON.stringify(RB.learn.rec('k:あ'));
    const orig = RB.combat.start;
    RB.combat.start = async () => 'lose';
    const res = await RB.game.startBattle('rw.dustmoth', {});
    RB.combat.start = orig;
    await RB.test.idle(20000);
    return { res, map: RB.world.W.map.id, x: RB.world.W.player.x, y: RB.world.W.player.y, pc: s.resolve.pc, comp: s.resolve.comp, max: s.resolve.max, learn: JSON.stringify(RB.learn.rec('k:あ')) === before };
  });
  assert(r.res === 'lose', 'lose result');
  assert(r.map === 'rw.millroad' && r.x === 10 && r.y === 22, 'at checkpoint: ' + JSON.stringify(r));
  assert(r.pc === r.max && r.comp === r.max, 'resolve restored');
  assert(r.learn, 'learning record unchanged by defeat');
  assert(!errors.length, 'page errors: ' + errors.join('; '));
  await p.context().close();
});

console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
