// The opt-in `!walkto` options (RBN-QA-020; src/engine/52_staging.js walkPath, 70_script.js), in Chromium on the built
// game, on Playhouse Row on the festival night (the bank's row-wide trigger strip, row 21), with small scenes of the
// test's own:
//  1. the default is unchanged: without options a walk keeps off every trigger, even one whose condition is false
//     (no way over the strip: no walk), and your companion stays where they are;
//  2. `cross` goes over a trigger whose condition is false now; one whose condition holds is kept off; and a trigger
//     that comes true during the walk is not stepped onto (the walk stops before it);
//  3. `party`: your companion follows, and when the walk resolves (the next line) they stand beside you, their last
//     step settled;
//  4. `party` stops at once when its scene ends mid-walk or mid catch-up, or the map changes: no new step of theirs
//     (or yours) starts after that.
// Usage: node tools/build.mjs && node tests/e2e/walkto_options.mjs [default|cross|party|end-walk|end-catchup|map]
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const only = process.argv[2] || '';
const want = (k) => !only || k.includes(only);
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const FL = { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb_ichi_found: true, mb1_done: true, mp_arrived: true, mp_sobe_met: true,
  mp_press_open: true, mp_theatre_seen: true, mp_rehearsal_done: true, mp_fest_night: true, mp_yukata: true, mp_fest_walked: true, mp_st_bank: true };

async function start(x, y, o = {}) {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 757 } });
  await p.evaluate(([x, y, o, FL]) => {
    const s = RB.game.debugStart('mp.playhouse', x, y, { comp: 'nao', flags: Object.assign({}, FL, o.flags || {}), dir: 'down', edition: 2 });
    s.learn.profile = 'E'; s.learn.kanaKnown = 'both';
    RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
    const W = RB.world.W;
    if (o.comp) { W.comp.x = W.comp.fx = o.comp[0]; W.comp.y = W.comp.fy = o.comp[1]; W.comp.mv = null; }
    if (o.trigger) W.map.triggers.push(o.trigger);
  }, [x, y, o, FL]);
  await p.waitForTimeout(700);
  return { p, errors };
}
// run a small scene of the test's own: its first op is the walk, then one line (the walk has resolved when it shows)
async function walk(p, op, during) {
  return p.evaluate(async ([op, during]) => {
    const W = RB.world.W, wait = (ms) => new Promise((r) => setTimeout(r, ms));
    RB.content.scenes['t.walk'] = RB.script.parse('@scene t.walk\n' + op + '\nnarr: ついた 。 || Arrived.\n', 'test').scenes['t.walk'];
    const f0 = RB.staging.stats().walkFallbacks, c0 = [W.comp.x, W.comp.y];
    const run = RB.script.run('t.walk');
    const out = { c0 };
    if (during === 'flag') {
      // a trigger comes true after your first step
      const x0 = W.player.x;
      for (let i = 0; i < 400 && W.player.x === x0; i++) await wait(5);
      RB.game.s.flags.qa_t = true;
    }
    if (during === 'end-walk' || during === 'end-catchup' || during === 'map') {
      if (during === 'end-walk') await wait(1500);
      else if (during === 'end-catchup') { for (let i = 0; i < 2000 && !(W.player.x === 24 && W.player.y === 25 && !W.player.mv); i++) await wait(2); }
      else await wait(1200);
      out.cut = { pl: [W.player.x, W.player.y], c: [W.comp.x, W.comp.y], cmv: !!W.comp.mv };
      if (during === 'map') await RB.game.transition('mp.blockprint', 40, 15, 'down', { inScript: true });
      else { const tok = RB.staging.begin('t.cut'); RB.staging.end(tok); RB.staging.end(tok); } // the scene ends (as a skip or an abort does)
      await wait(300);
      const comp = W.comp;
      out.a = { pl: [W.player.x, W.player.y], c: comp && [comp.x, comp.y], map: W.map.id };
      await wait(1000);
      out.b = { pl: [W.player.x, W.player.y], c: comp && [comp.x, comp.y], cmv: !!(comp && comp.mv), map: W.map.id };
    }
    for (let i = 0; i < 600; i++) {
      const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown();
      if (d && /Arrived/.test(d.en || '')) {
        out.atLine = { pl: [W.player.x, W.player.y, W.player.dir], c: [W.comp.x, W.comp.y], cmv: !!W.comp.mv, pmv: !!W.player.mv };
        RB.ui.dialogue.advance(true);
      } else if (d) RB.ui.dialogue.advance(true);
      if (!RB.script.isRunning() && RB.game.mode() === 'world' && (out.atLine || out.cut)) break;
      if (out.cut && i > 150) break;
      await wait(20);
    }
    out.finished = await Promise.race([run.then(() => true), wait(8000).then(() => false)]); // (a map changed under a scene: it need not end by itself)
    out.fallbacks = RB.staging.stats().walkFallbacks - f0;
    out.end = { pl: [W.player.x, W.player.y], c: W.comp && [W.comp.x, W.comp.y] };
    return out;
  }, [op, during]);
}
const adj = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;

// 1. the default
if (want('default')) {
  const { p, errors } = await start(24, 20);
  const r = await walk(p, '!walkto pc 24 25 down');
  ok(r.atLine && r.atLine.pl[0] === 24 && r.atLine.pl[1] === 20 && r.fallbacks === 1, 'default: the strip (its condition false) is still kept off: no walk over it, a fallback (' + JSON.stringify(r.atLine) + ')');
  ok(!errors.length, 'default (strip): no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
if (want('default')) {
  const { p, errors } = await start(20, 24, { comp: [19, 24] });
  const r = await walk(p, '!walkto pc 26 25 down');
  ok(r.atLine && r.atLine.pl[0] === 26 && r.atLine.pl[1] === 25 && r.fallbacks === 0, 'default: a walk along the bank arrives (' + JSON.stringify(r.atLine) + ')');
  ok(r.atLine && r.atLine.c[0] === 19 && r.atLine.c[1] === 24, 'default: your companion does not follow during the walk (' + JSON.stringify(r.atLine && r.atLine.c) + ')');
  ok(!errors.length, 'default (bank): no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 2. cross
if (want('cross')) {
  const { p, errors } = await start(24, 20);
  const r = await walk(p, '!walkto pc 24 25 down cross');
  ok(r.atLine && r.atLine.pl.join() === '24,25,down' && r.fallbacks === 0, 'cross: over the strip whose condition is false, to the rail (' + JSON.stringify(r.atLine) + ')');
  ok(!errors.length, 'cross: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
if (want('cross')) {
  const { p, errors } = await start(24, 20, { flags: { mp_fest_walked: false } });
  const r = await walk(p, '!walkto pc 24 25 down cross');
  ok(r.atLine && r.atLine.pl[0] === 24 && r.atLine.pl[1] === 20 && r.fallbacks === 1, 'cross: a trigger whose condition holds is kept off: no walk (' + JSON.stringify(r.atLine) + ')');
  ok(!errors.length, 'cross (active): no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
if (want('cross')) {
  const T = { x: 22, y: 0, w: 1, h: 34, scene: 'mp.fest_night', if: 'qa_t' };
  const { p, errors } = await start(18, 24, { trigger: T });
  const r = await walk(p, '!walkto pc 25 24 down cross', 'flag');
  ok(r.atLine && r.atLine.pl[0] < 22 && r.fallbacks === 1, 'cross: a trigger that comes true during the walk is not stepped onto; the walk stops before it (' + JSON.stringify(r.atLine) + ')');
  ok(!errors.length, 'cross (came true): no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 3. party: settled beside you when the walk resolves
for (const x of want('party') ? [1, 24, 50] : []) {
  const { p, errors } = await start(x, 20, { comp: [x, 19] });
  const r = await walk(p, '!walkto pc 24 25 down cross party max=9000');
  ok(r.atLine && r.atLine.pl.join() === '24,25,down' && adj(r.atLine.pl, r.atLine.c) && !r.atLine.cmv, 'party from column ' + x + ': at the next line you are at the rail and your companion stands beside you, settled (' + JSON.stringify(r.atLine) + ')');
  ok(!errors.length, 'party ' + x + ': no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 4. party stops when its scene ends or the map changes
for (const during of ['end-walk', 'end-catchup', 'map'].filter(want)) {
  const { p, errors } = await start(1, 20, { comp: [1, 19] });
  const r = await walk(p, '!walkto pc 24 25 down cross party max=9000', during);
  const still = r.a && r.b && JSON.stringify(r.a.c) === JSON.stringify(r.b.c) && JSON.stringify(r.a.pl) === JSON.stringify(r.b.pl) && !r.b.cmv;
  ok(still, during + ': after the cut no new step starts, yours or your companion\'s (cut ' + JSON.stringify(r.cut) + ', +0.3 s ' + JSON.stringify(r.a) + ', +1.3 s ' + JSON.stringify(r.b) + ')');
  ok(!errors.length, during + ': no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
console.log(`\nwalkto_options: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
