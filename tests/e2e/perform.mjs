// The performance library on screen (expansion P05, playbook V5; src/engine/67a_perform.js), in Chromium on the built
// game, in the throwaway gallery session (seven people at work on the Saltglass road, flag dev_perform):
//  - each person is at work (a phase of their action drawn, the held object in hand), and remains findable;
//  - talking to someone stops their work at once; afterwards it begins again from the anticipation;
//  - the carry action's crates move between the stacks at the touch (three moments captured);
//  - reduced motion holds one still pose; a scene's one-shot gesture plays once and ends;
//  - captures of each at gameplay size (docs/screenshots/perform/), desktop and phone; no errors, no network.
// Usage: node tests/e2e/perform.mjs
import path from 'node:path';
import fs from 'node:fs';
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
const out = path.join(process.cwd(), 'docs', 'screenshots', 'perform');
fs.mkdirSync(out, { recursive: true });
let pass = 0, fail = 0;
async function test(name, fn) {
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 240 s')), 240000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1200)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const PEOPLE = ['pf_sweep', 'pf_sort', 'pf_carry', 'pf_tie', 'pf_tend', 'pf_read', 'pf_grind'];
async function gallery(p) {
  await p.evaluate(async () => { RB.game.settings.textSpeed = 'instant'; RB.game.settings.lightbulb = false; await RB.verbsDev.gallery(); });
  await p.waitForTimeout(500);
}
// stand two tiles below someone (the camera follows the player), facing them
const standBy = (p, id) => p.evaluate((id) => { const a = RB.world.W.npcs.find((n) => n.id === id); RB.test.place(a.x, a.y + 2, 'up'); return [a.x, a.y]; }, id);
const frame = (p, id) => p.evaluate((id) => { const a = RB.world.W.npcs.find((n) => n.id === id); const f = RB.perform.frameOf(a, performance.now(), RB.game.reducedMotion()); return f ? { phase: f.phase || null, key: f.key } : null; }, id);

await test('seven people at work, each drawn mid-action and findable; captures at gameplay size', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 960, height: 600 } });
  await gallery(p);
  const here = await p.evaluate(() => RB.world.W.npcs.filter((n) => /^pf_/.test(n.id)).map((n) => n.id));
  assert(PEOPLE.every((id) => here.indexOf(id) >= 0), 'the gallery: ' + here.join(', '));
  assert(await p.evaluate(() => RB.perform.check('sg.road').length === 0), 'every person\'s work in front of them, each reachable');
  for (const id of PEOPLE) {
    await standBy(p, id);
    await p.waitForTimeout(700);
    const phases = new Set();
    for (let k = 0; k < 50 && phases.size < 3; k++) { const f = await frame(p, id); if (f && f.phase) phases.add(f.phase); await p.waitForTimeout(200); }
    assert(phases.size >= 2, id + ': at work, through more than one phase: ' + [...phases].join(' → '));
    await p.screenshot({ path: path.join(out, id.replace('pf_', '') + '.png') });
  }
  // the carry: crates move from one stack to the other at the touch
  await standBy(p, 'pf_carry');
  const shots = [];
  for (let k = 0; k < 40 && shots.length < 3; k++) {
    const f = await frame(p, 'pf_carry');
    const want = ['stoop', 'turn', 'set'][shots.length];
    if (f && f.phase === want) { await p.screenshot({ path: path.join(out, 'carry_' + (shots.length + 1) + '_' + want + '.png') }); shots.push(want); }
    await p.waitForTimeout(90);
  }
  assert(shots.length === 3, 'the carry seen at its stoop, turn and set: ' + shots.join(', '));
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  assert(!requests.length, 'no network: ' + requests.join(' '));
  await ctx.close();
});

await test('talking stops the work at once; afterwards it begins again from the anticipation', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 960, height: 600 } });
  await gallery(p);
  await p.evaluate(() => { const a = RB.world.W.npcs.find((n) => n.id === 'pf_sweep'); RB.test.place(a.x, a.y + 1, 'up'); });
  await p.waitForTimeout(300);
  await p.evaluate(() => RB.world.interact());
  const diag = () => p.evaluate(() => { const a = RB.world.W.npcs.find((n) => n.id === 'pf_sweep'); const W = RB.world.W; return { a: [a.x, a.y, !!a.mv], pl: [W.player.x, W.player.y, W.player.dir, !!W.player.mv], mode: RB.game.mode(), dlg: RB.ui.dialogue.isOpen(), run: RB.script.isRunning() }; });
  try { await p.waitForFunction(() => RB.ui.dialogue.isOpen(), null, { timeout: 8000 }); } catch (e) { throw new Error('no conversation: ' + JSON.stringify(await diag())); }
  assert(await frame(p, 'pf_sweep') === null, 'while you talk: no action (the person is the game\'s own, facing you)');
  assert(await p.evaluate(() => /stop what they are doing/.test((RB.ui.dialogue.shown() || {}).en || '')), 'and they say so');
  await p.screenshot({ path: path.join(out, 'interrupted.png') });
  for (let k = 0; k < 40 && await p.evaluate(() => RB.ui.dialogue.isOpen()); k++) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(100); }
  try { await p.waitForFunction(() => RB.game.mode() === 'world' && !RB.ui.dialogue.isOpen(), null, { timeout: 8000 }); } catch (e) { throw new Error('the conversation did not end: ' + JSON.stringify(await diag())); }
  const f = await frame(p, 'pf_sweep');
  assert(f && f.phase === 'grip', 'afterwards: from the grip again (' + JSON.stringify(f) + ')');
  // a one-shot gesture from a scene: plays once
  await p.evaluate(() => { RB.script.add('@scene pf.point\n!hook perform pf_read pointway\n', 'test'); });
  const run = p.evaluate(() => RB.script.run('pf.point'));
  await p.waitForTimeout(700);
  const g = await frame(p, 'pf_read');
  assert(g && /^p:point/.test(g.key || ''), 'a scene cues a gesture: pointing along the way (' + JSON.stringify(g) + ')');
  await run;
  await p.waitForTimeout(300);
  assert(await p.evaluate(() => !RB.world.W.npcs.find((n) => n.id === 'pf_read')._pfOnce), 'then it is over, and they go back to reading');
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('reduced motion: one still pose each; phone width', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 390, height: 844 }, mobile: true, touch: true });
  await gallery(p);
  await p.evaluate(() => { RB.game.settings.reducedMotion = true; RB.game.applySettings(); });
  await standBy(p, 'pf_tend');
  await p.waitForTimeout(400);
  const keys = new Set();
  for (let k = 0; k < 6; k++) { keys.add((await frame(p, 'pf_tend') || {}).key); await p.waitForTimeout(300); }
  assert(keys.size === 1 && [...keys][0], 'one still, readable pose: ' + [...keys].join(' | '));
  await p.screenshot({ path: path.join(out, 'tend_still_phone.png') });
  await p.evaluate(() => { RB.game.settings.reducedMotion = false; RB.game.applySettings(); });
  await standBy(p, 'pf_sort');
  await p.waitForTimeout(600);
  await p.screenshot({ path: path.join(out, 'sort_phone.png') });
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await b.close();
srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
