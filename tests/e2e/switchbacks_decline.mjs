// The Switchbacks' retaining log (Agnes 6552850704; Local CL-586; Cloud CC-424). "Leave it as it is" steps you back two
// tiles, and from x 23 the first step was still inside the trigger, which started the same scene again before the
// retreat had finished. Its condition now holds only while the scene is not already running. In Chromium on the built
// game, on throwaway journeys at the slide (never a real save), stepping into the trigger through the world's own step,
// every scene start counted (and how many ran at once):
//  1. into each of the trigger's four tiles (x 22 and x 23, rows 22 and 23), with Nao and alone: "Leave it as it is"
//     with no further input gives one offer, one scene at a time, and the retreat ends outside the trigger (row 23 is
//     walled at x 24, so its x 23 tile is reached only from inside: that case starts there and steps to x 22);
//  2. waiting there afterwards: no further offer;
//  3. stepping back in on purpose: offered again, once;
//  4. declined twice, then "Lever the log free": cleared, and walking through the trigger again offers nothing;
//  5. a keyboard press into the trigger (the game's own key handling): one offer, the retreat outside;
//  6. a save written after a decline and loaded: stepping in offers it once;
//  no page errors.
// Usage: node tools/build.mjs && node tests/e2e/switchbacks_decline.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const FLAGS = { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_called: true, cr_slide_seen: true };
const IN = (x, y) => x >= 22 && x <= 23 && y >= 22 && y <= 23;

// a journey at (x, y), the scene's starts counted; pick: the answers to give, in order ("leave" or "lever")
async function begin(p, x, y, dir, comp, picks) {
  await p.evaluate(async ([x, y, dir, comp, flags, picks]) => {
    const s = RB.game.debugStart('cr.pass1', x, y, { edition: RB.edition.forNew(), dir, comp: comp || undefined, flags });
    if (!comp) s.comp = null;
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.save.autosave = async () => {};
    window.__picks = picks.slice();
    RB.test.enable({ choose: (opts) => { const want = window.__picks.length ? window.__picks.shift() : 'leave'; const i = opts.findIndex((o) => (want === 'lever' ? /Lever/ : /Leave/).test(o.en || '')); return i < 0 ? 0 : i; } });
    await new Promise((r) => setTimeout(r, 500));
    RB.world.refreshActors();
    window.__runs = []; window.__live = 0; window.__max = 0;
    if (!window.__wrapped) {
      window.__wrapped = true;
      const run0 = RB.script.run;
      RB.script.run = function (id) {
        const pl = RB.world.W.player;
        if (id === 'cr.pass1_clear') { window.__runs.push(pl.x + ',' + pl.y); window.__live++; window.__max = Math.max(window.__max, window.__live); }
        const r = run0.apply(this, arguments);
        if (id === 'cr.pass1_clear') Promise.resolve(r).finally(() => { window.__live--; });
        return r;
      };
    }
  }, [x, y, dir, comp, FLAGS, picks || []]);
}
const settle = (p) => p.evaluate(async () => {
  for (let i = 0; i < 120 && (RB.script.isRunning() || RB.world.W.player.mv); i++) await new Promise((r) => setTimeout(r, 50));
  await RB.test.idle();
  const pl = RB.world.W.player;
  return { runs: window.__runs.slice(), max: window.__max, at: [pl.x, pl.y], cleared: !!RB.game.s.flags.cr_turn_cleared };
});
const step = (p, dir) => p.evaluate((dir) => RB.test.step(dir), dir);

// 1–2: each tile, with Nao and alone
const CASES = [
  { name: 'x 23 row 22, from the goat path', at: [24, 22], dir: 'left' },
  { name: 'x 23 row 23 (reached only from inside: from there, to x 22)', at: [23, 23], dir: 'left' },
  { name: 'x 22 row 22, from the road', at: [21, 22], dir: 'right' },
  { name: 'x 22 row 23', at: [21, 23], dir: 'right' },
];
for (const comp of ['nao', null]) for (const c of CASES) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, c.at[0], c.at[1], c.dir, comp, ['leave']);
  const start = await p.evaluate(() => [RB.world.W.player.x, RB.world.W.player.y]);
  await step(p, c.dir);
  const r = await settle(p);
  await p.waitForTimeout(1500);
  const later = await settle(p);
  const who = comp ? 'with Nao' : 'alone';
  ok(flat(start) === flat(c.at) && r.runs.length === 1 && r.max === 1 && !IN(r.at[0], r.at[1]) && !r.cleared,
    '1 ' + c.name + ', ' + who + ': one offer, one scene at a time, the retreat ends outside the trigger ' + flat({ start, r }));
  ok(later.runs.length === 1, '2 ' + c.name + ', ' + who + ': waiting there afterwards, no further offer ' + flat(later.runs));
  ok(!errors.length, '1–2 ' + c.name + ', ' + who + ': no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

// 3–4: back in on purpose; twice declined, then levered
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, 24, 22, 'left', 'nao', ['leave', 'leave', 'lever']);
  await step(p, 'left'); const r1 = await settle(p);
  await p.evaluate(() => RB.test.place(21, 22, 'right')); await step(p, 'right'); const r2 = await settle(p);
  ok(r1.runs.length === 1 && r2.runs.length === 2 && r2.max === 1, '3 stepping back in on purpose: offered again, once ' + flat({ r1: r1.runs, r2: r2.runs }));
  await p.evaluate(() => RB.test.place(21, 22, 'right')); await step(p, 'right'); const r3 = await settle(p);
  await p.evaluate(() => RB.test.place(21, 23, 'right')); await step(p, 'right'); await step(p, 'right'); const r4 = await settle(p);
  ok(r3.runs.length === 3 && r3.cleared && r4.runs.length === 3, '4 declined twice, then levered: cleared, and the trigger offers nothing after ' + flat({ r3, r4: r4.runs }));
  ok(!errors.length, '3–4 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

// 5: a keyboard press into the trigger
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, 24, 22, 'left', 'nao', ['leave']);
  await p.keyboard.down('ArrowLeft'); await p.waitForTimeout(120); await p.keyboard.up('ArrowLeft');
  const r = await settle(p);
  ok(r.runs.length === 1 && r.max === 1 && !IN(r.at[0], r.at[1]), '5 a keyboard press into the trigger: one offer, the retreat outside ' + flat(r));
  ok(!errors.length, '5 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

// 6: a save after a decline
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, 24, 22, 'left', 'nao', ['leave']);
  await step(p, 'left'); await settle(p);
  await p.evaluate(async () => { RB.save.setCurrent(6, 0); await RB.save.writeSlot(6, RB.game.s, { force: true }); await RB.game.loadCampaign(6, 'manual'); await new Promise((r) => setTimeout(r, 600)); window.__runs = []; window.__max = 0; window.__live = 0; window.__picks = ['leave']; });
  const at = await p.evaluate(() => [RB.world.W.player.x, RB.world.W.player.y]);
  await p.evaluate(() => RB.test.place(24, 22, 'left')); await step(p, 'left');
  const r = await settle(p);
  ok(!IN(at[0], at[1]) && r.runs.length === 1 && r.max === 1 && !IN(r.at[0], r.at[1]), '6 a save written after a decline and loaded: stepping in offers it once ' + flat({ loadedAt: at, r }));
  ok(!errors.length, '6 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

console.log(`\nswitchbacks_decline: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
