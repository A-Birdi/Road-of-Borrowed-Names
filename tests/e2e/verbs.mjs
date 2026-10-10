// The exploration actions on screen (expansion P05; src/ui/57b_verbs.js over src/engine/55b_verbs.js), in Chromium
// on the built game, in a throwaway development session (RB.verbsDev: the flag dev_verbs brings the fixtures):
//  - a journey has none of the fixtures' props, people or creatures;
//  - each sheet opens from its prop, inside a scene (the world waits), and plays to its outcome with real clicks:
//    a notice people follow (and they move), a courier round checked then delivered, a repair with a wrong tool
//    explained, water across two maps (the far ford floods, then drains), a machine watched step by step and
//    adjusted, a paper boat folded, a creature's sheet handing over to the Weave sheet, an old plan compared where
//    its marks are and concluded with a second valid reading, a rehearsal that misses then matches;
//  - phone width: no horizontal overflow; captures; no errors, no network.
// Usage: node tests/e2e/verbs.mjs
import path from 'node:path';
import fs from 'node:fs';
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
const out = path.join(process.cwd(), 'docs', 'screenshots', 'verbs');
fs.mkdirSync(out, { recursive: true });
let pass = 0, fail = 0;
async function test(name, fn) {
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 180 s')), 180000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1200)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const noOverflow = (p) => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
// whatever the road says on arriving (a scene of the map's own): read through it, back to the world
async function settle(p) {
  for (let i = 0; i < 200; i++) {
    const st = await p.evaluate(() => ({ mode: RB.game.mode(), dlg: RB.ui.dialogue.isOpen(), ch: document.querySelectorAll('.choice').length, sheet: !!document.querySelector('.verb-sheet') }));
    if (st.sheet) return;
    if (st.mode === 'world' && !st.dlg && !st.ch) { await p.waitForTimeout(120); if (await p.evaluate(() => RB.game.mode() === 'world' && !RB.ui.dialogue.isOpen())) return; continue; }
    if (st.ch) await p.evaluate(() => document.querySelector('.choice').click());
    else if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(80);
  }
  throw new Error('the world did not come back: ' + await p.evaluate(() => RB.game.mode()));
}
async function goTo(p, id) {
  await p.evaluate(async (id) => { RB.game.settings.textSpeed = 'instant'; RB.game.settings.lightbulb = false; await RB.verbsDev.go(id); }, id); // (word help on hover would cover the next button)
  await p.waitForTimeout(350);
  await settle(p);
  await p.evaluate(async (id) => { await RB.verbsDev.go(id); }, id); // stand beside it again (a scene may have moved you)
  await settle(p);
}
// examine what is in front: the action's sheet opens (inside a scene)
async function openSheet(p) {
  await p.evaluate(() => RB.world.interact());
  try { await p.waitForSelector('.verb-sheet', { timeout: 8000 }); }
  catch (e) { throw new Error('no sheet: ' + JSON.stringify(await p.evaluate(() => { const W = RB.world.W; return { map: W.map.id, x: W.player.x, y: W.player.y, dir: W.player.dir, mode: RB.game.mode(), dlg: RB.ui.dialogue.isOpen() ? (RB.ui.dialogue.shown() || {}).en : null }; }))); }
  assert(await p.evaluate(() => RB.game.mode() !== 'world'), 'the world waits while the sheet is open');
}
async function closeSheet(p) {
  await p.click('.verb-sheet [data-a="close"]');
  await p.waitForFunction(() => !document.querySelector('.verb-sheet'), null, { timeout: 8000 });
  await settle(p);
}
const said = (p) => p.evaluate(() => (document.querySelector('.vb-said') || {}).textContent || '');
const done = (p) => p.evaluate(() => !!document.querySelector('.vb-done'));
const click = async (p, sel) => { await p.click(sel); await p.waitForTimeout(80); };

await test('a journey has none of the fixtures', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(() => RB.game.debugStart('rw.road', 5, 9, { flags: { departed: true } }));
  await p.waitForTimeout(300);
  const here = await p.evaluate(() => ({ props: RB.world.W.map.props.filter((x) => x.o && x.o.vb && (!x.if || RB.state.test(RB.game.s, x.if))).length, npcs: RB.world.W.npcs.filter((n) => /^vbp_/.test(n.id)).length, objs: RB.fieldweave.objectsOn(RB.game.s, 'rw.road').filter((o) => o.def.verb).length }));
  assert(here.props === 0 && here.npcs === 0 && here.objs === 0, 'nothing of the fixtures on the Lantern Road: ' + JSON.stringify(here));
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('a notice people follow; a courier round; a repair', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await goTo(p, 'vb_notice');
  await openSheet(p);
  assert(await p.evaluate(() => document.querySelector('.verb-sheet [data-a="post"]').disabled), 'Post it waits for a finished notice');
  await click(p, '[data-g="where"][data-v="left"]'); await click(p, '[data-g="do"][data-v="run"]');
  assert(/{走|はし}|走/.test(await p.evaluate(() => document.querySelector('.vb-notice-preview').textContent)), 'the notice as it reads');
  await click(p, '[data-a="post"]');
  assert(/stay where they were/.test(await said(p)) && !(await done(p)), 'unclear words: nobody moves, not done');
  await click(p, '[data-g="do"][data-v="line"]'); await click(p, '[data-a="post"]');
  assert(/line up along the left/.test(await said(p)) && await done(p), 'a notice people follow: done');
  await p.screenshot({ path: path.join(out, 'notice_desktop.png') });
  await closeSheet(p);
  await p.waitForTimeout(1500);
  const tobi = await p.evaluate(() => { const n = RB.world.W.npcs.find((a) => a.id && /^vbp_vb_notice/.test(a.id) && a.def.char === 'tobi'); return n ? [n.x, n.y] : null; });
  assert(tobi && tobi[0] <= 24, 'and they move to where it said: ' + JSON.stringify(tobi));
  // courier
  await goTo(p, 'vb_courier');
  await openSheet(p);
  assert(await p.evaluate(() => /Who is where/.test(document.querySelector('.vb-table caption').textContent)), 'who is where on each leg');
  for (const [g, v] of [['leg0', 'tea'], ['leg1', 'tea'], ['leg2', 'inn']]) await click(p, `[data-g="${g}"][data-v="${v}"]`);
  await click(p, '[data-a="check"]');
  assert(await p.evaluate(() => document.querySelectorAll('.ar-list li.no').length >= 1), 'a round that misses someone says who, and where they are');
  for (const [g, v] of [['leg0', 'harbour'], ['leg1', 'tea'], ['leg2', 'square']]) await click(p, `[data-g="${g}"][data-v="${v}"]`);
  await click(p, '[data-a="go"]');
  assert(await done(p), 'a round that reaches everyone: delivered');
  await closeSheet(p);
  // repair
  await goTo(p, 'vb_repair');
  await openSheet(p);
  await click(p, '[data-a="read"]');
  assert(/Wipe the glass/.test(await said(p)), 'the instructions');
  await click(p, '[data-g="tool"][data-v="scissors"]'); await click(p, '[data-a="use"][data-part="glass"]');
  assert(/does not suit the glass/.test(await said(p)), 'the wrong tool: explained');
  for (const [tl, pt] of [['cloth', 'glass'], ['scissors', 'wick'], ['oil', 'well']]) { await click(p, `[data-g="tool"][data-v="${tl}"]`); await click(p, `[data-a="use"][data-part="${pt}"]`); }
  await click(p, '[data-a="test"]');
  assert(await done(p) && /lights/.test(await said(p)), 'mended and tested');
  await closeSheet(p);
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  assert(!requests.length, 'no network: ' + requests.join(' '));
  await ctx.close();
});

await test('water across two maps; a machine watched and adjusted; a paper boat', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await goTo(p, 'vb_network');
  await openSheet(p);
  assert(await p.evaluate(() => /Out of reach from here/.test(document.querySelector('.vb-gates').textContent)), 'the sluices on the other road are out of reach from here');
  await click(p, '[data-a="open:g1"]');
  const t1 = await said(p);
  assert(/Somewhere off in the ford fills/.test(t1), 'the effect, traced to the other road: ' + t1);
  assert(await p.evaluate(() => /under water/.test(document.querySelector('.verb-sheet').textContent)), 'the way across the ford is under water');
  await closeSheet(p);
  // to the Saltglass road: the ford is barred; close its sluice there
  await p.evaluate(async () => { const g = RB.verbs.get('vb_network').gates.g2; await RB.game.transition('sg.road', g.x, g.y + 1, 'up'); });
  await p.waitForTimeout(400);
  await settle(p);
  assert(await p.evaluate(() => RB.maps.blocked ? true : true) && await p.evaluate(() => RB.world.W.map.props.some((x) => x.o && x.o.barrier && RB.state.test(RB.game.s, x.if))), 'the flooded ford is barred on the map');
  await p.evaluate(() => { const g = RB.verbs.get('vb_network').gates.g2; RB.test.place(g.x, g.y + 1, 'up'); });
  await openSheet(p);
  await click(p, '[data-a="shut:g2"]');
  assert(await done(p), 'the channel full, the ford drained: done');
  await closeSheet(p);
  assert(await p.evaluate(() => !RB.world.W.map.props.some((x) => x.o && x.o.barrier && RB.state.test(RB.game.s, x.if))), 'and the ford is open again');
  // the machine
  await goTo(p, 'vb_observe');
  await openSheet(p);
  await click(p, '[data-a="play"]'); // pause
  const seen = [];
  for (let k = 0; k < 4; k++) {
    seen.push(await p.evaluate(() => document.querySelector('.vb-pattern li.now').textContent.trim()));
    const note = await p.$('.verb-sheet [data-a^="note:"]');
    if (note) await click(p, '.verb-sheet [data-a^="note:"]');
    await click(p, '[data-a="step"]');
  }
  assert(new Set(seen).size === 4, 'step by step, every movement of the pattern: ' + seen.join(' | '));
  assert(await p.evaluate(() => document.querySelectorAll('.verb-sheet .ar-list li').length >= 2), 'what was noticed is kept in the sheet');
  for (const a of ['order', 'oil', 'ring']) await click(p, `[data-a="adjust:${a}"]`);
  assert(await done(p), 'adjusted: done');
  await p.screenshot({ path: path.join(out, 'observe_desktop.png') });
  await closeSheet(p);
  // the paper boat
  await goTo(p, 'vb_follow');
  await openSheet(p);
  await click(p, '[data-a="do:0:corner"]');
  assert(/in half first/.test(await said(p)), 'a wrong fold: explained');
  for (const a of ['do:0:half', 'do:1:corners', 'do:2:open']) await click(p, `[data-a="${a}"]`);
  assert(await done(p), 'folded');
  await closeSheet(p);
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('a creature moved with a word; an old plan compared; a rehearsal', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await goTo(p, 'vb_route');
  await openSheet(p);
  assert(/hangs in front of the way down/.test(await p.evaluate(() => document.querySelector('.verb-sheet').textContent)), 'where the creature is');
  await click(p, '[data-a="weave"]');
  await p.waitForFunction(() => RB.weave.isOpen(), null, { timeout: 8000 });
  const targets = await p.evaluate(() => RB.weave.state().targets);
  assert(targets.some((x) => x === 'vb_route.lamp'), 'handed over to the Weave sheet, the lamp among its targets: ' + targets.join(', '));
  await p.evaluate(() => RB.weave.close());
  await p.evaluate(() => { RB.fieldweave.weave(RB.game.s, 'vb_route', 'lamp', 'hikari', { mode: 'choice' }); RB.world.refreshActors(); });
  await p.waitForTimeout(300);
  const foes = await p.evaluate(() => RB.world.W.foes.filter((f) => /^vbf_/.test(f.id)).map((f) => f.home.join(',')));
  assert(foes.length === 1 && foes[0] === '16,18', 'the creature is in the shade now, one of it: ' + foes.join(' '));
  // the old plan
  await goTo(p, 'vb_layers');
  await openSheet(p);
  assert(await p.evaluate(() => document.querySelectorAll('.vb-plan .vb-oldmark').length === 3), 'the plan\'s three marks over today\'s road');
  assert(await p.evaluate(() => !!document.querySelector('.vb-nohyp') && !document.querySelector('[data-a^="conclude:"]')), 'no readings to choose before anything is compared');
  await closeSheet(p);
  const compare = async (mk) => {
    // walk one step onto the marked place (the real movement code: the place's trigger fires)
    await p.evaluate((mk) => {
      const m = RB.verbs.get('vb_layers').plan.marks.find((x) => x.id === mk);
      RB.test.place(m.x, m.y + 2, 'up');
      RB.world.W.player.dir = 'up';
      RB.world._tryMove('up');
    }, mk);
    for (let i = 0; i < 40 && !(await p.evaluate(() => RB.ui.dialogue.isOpen())); i++) await p.waitForTimeout(50);
    const line = await p.evaluate(() => (RB.ui.dialogue.shown() || {}).en || '');
    assert(line.length > 10, 'at the ' + mk + ', the comparison is made there: ' + line);
    await settle(p);
  };
  await compare('well');
  await goTo(p, 'vb_layers');
  await openSheet(p);
  await click(p, '[data-a="conclude:covered"]');
  assert(/not seen enough/.test(await said(p)), 'one comparison is not enough to say');
  await closeSheet(p);
  await compare('stone');
  await goTo(p, 'vb_layers');
  await openSheet(p);
  await click(p, '[data-a="conclude:never"]');
  assert(/ring of stones/i.test(await said(p)), 'a reading that does not fit: why, from what was seen');
  await click(p, '[data-a="conclude:covered"]');
  assert(await done(p), 'a second valid reading concludes it');
  await closeSheet(p);
  // the rehearsal
  await goTo(p, 'vb_blocking');
  await openSheet(p);
  await click(p, '[data-g="piece"][data-v="hana"]'); await click(p, '[data-cell="2,2"]');
  await click(p, '[data-g="piece"][data-v="lantern"]'); await click(p, '[data-cell="3,2"]');
  await click(p, '[data-g="piece"][data-v="tetsu"]'); await click(p, '[data-cell="wing:left"]');
  assert(await p.evaluate(() => document.querySelector('.vb-cell[data-cell="0,0"]').disabled), 'nobody stands in the scenery');
  await click(p, '[data-a="rehearse"]');
  await p.waitForFunction(() => document.querySelector('.vb-dirs li.no'), null, { timeout: 8000 });
  assert(/Not as directed/.test(await said(p)) && !(await done(p)), 'a rehearsal that misses: which direction');
  await click(p, '[data-cell="wing:right"]');
  await click(p, '[data-a="rehearse"]');
  await p.waitForFunction(() => document.querySelector('.vb-done'), null, { timeout: 8000 });
  await p.screenshot({ path: path.join(out, 'blocking_desktop.png') });
  await closeSheet(p);
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('phone width: the sheets fit', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 390, height: 844 }, mobile: true, touch: true });
  for (const [id, name] of [['vb_blocking', 'blocking_phone'], ['vb_courier', 'courier_phone'], ['vb_layers', 'layers_phone'], ['vb_network', 'network_phone']]) {
    await goTo(p, id);
    await openSheet(p);
    assert(await noOverflow(p), id + ': no horizontal overflow');
    await p.screenshot({ path: path.join(out, name + '.png') });
    await closeSheet(p);
  }
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await b.close();
srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
