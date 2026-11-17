// A scene's walk of someone whose step is still under way (src/engine/52_staging.js walkTo; CC-629, CC-631, CL-876,
// CL-878; Agnes 6933304922): the step finishes on its own tile before the walk is planned, so the plan never starts
// from the tile being left; a figure still moving at the bound (1 s), or a walk whose scene, map or figure has gone
// meanwhile, does not walk at all. In Chromium on the built game, on Playhouse Row's bank on the festival night, calling
// RB.staging.walkTo directly inside a scene token of the test's own:
//   settled       no step under way: no wait, the first step is sent in the same task as the call (as before)
//   mid-step      a step under way: the walk waits for it, then plans and steps from the tile it landed on
//   same-frame    the tap's order (CC-629): the step lands right after the walk is called, as the world update's next
//                 line (50_world.js:909) lands it after your arrival; the walk still starts from the landed tile
//   cap           a step that cannot land within the bound: false, one fallback, no step sent, the figure where it was,
//                 its facing unchanged, and the target free again for someone else
//   departure     the target is the tile being left: no arrival is claimed until the figure is back on it
//   scene-end, new-scene      the scene ends, or ends and another begins, during the wait: false, no step, no facing
//   comp-replaced, comp-replaced-landed, map-entered   your companion placed afresh, or the map entered afresh (a new
//                 you), during the wait: false, no step, no facing and no sync of the new figure
//   skip-in-wait, skip-in-wait-taken   Skip begins during the wait: read again only after the checks, then the placement
//                 rule as always (onto the target if free, else no move); no step sent
//   skip-at-entry, now-at-entry, skip-at-entry-other   Skip (or `now`) already on: no wait, as before; a target that is
//                 the tile being left is a placement onto it (if free), not an arrival claimed mid-step
//   walked-in, walked-in-same-frame   someone the game is still walking in (a speaker who was missing, 50_world.js
//                 ensureSpeaker) is set where their walk-in was going, its step under way ended there (as scriptMove takes
//                 over from a walk-in): no wait, the walk starts from there; and the step under way, landed right after
//                 the call as in same-frame, no longer takes them back onto the way in (co.bell_ring's Tokiwa); both
//                 then stay where they arrived once the scene has ended (a walked-in figure is no one's to send back)
//   walked-in-at-end, walked-in-unreachable, walked-in-skip   the same walk-in with no scripted step after it: the
//                 target is where the walk-in was going (an arrival, no step sent), a place no way reaches (a fallback,
//                 left there), or Skip on at the call (set on the target): in each the old step is gone at once and
//                 nothing later drags them back onto the way in (CC-632; Agnes 6935037108)
// Test instrumentation, disclosed: RB.world.scriptMove is wrapped in the page to log each step the walk sends (who,
// which way, their tile then, and whether a step was still under way); the step under way is begun with the game's own
// scriptMove before the walk is called; same-frame lands it by setting what stepActor sets when a step ends;
// comp-replaced-landed clears the old figure's step (it is out of the world, so nothing lands it) to show the
// liveness check deciding before the bound; the walked-in cases call RB.world.ensureSpeaker('co_goro') on the bank to
// have someone walk in, and walked-in-same-frame lands their step under way as same-frame does. Usage: node tools/build.mjs && node tests/e2e/walk_settle.mjs [case]
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const only = process.argv[2] || '';
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const FL = { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb_ichi_found: true, mb1_done: true, mp_arrived: true, mp_sobe_met: true,
  mp_press_open: true, mp_theatre_seen: true, mp_rehearsal_done: true, mp_fest_night: true, mp_yukata: true, mp_fest_walked: true, mp_st_bank: true };

async function start() {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 757 } });
  await p.evaluate((FL) => {
    const s = RB.game.debugStart('mp.playhouse', 26, 25, { comp: 'nao', flags: FL, dir: 'left', edition: 2 });
    s.learn.profile = 'E'; s.learn.kanaKnown = 'both';
    RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
  }, FL);
  await p.waitForTimeout(700);
  return { p, errors };
}

// one case in the page: your companion settled at (19,24) on the bank, you at (26,25)
function inPage(name) {
  return async (name) => {
    const W = RB.world.W, SG = RB.staging, G = RB.game, wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const c0 = W.comp, p0 = W.player;
    c0.x = c0.fx = 19; c0.y = c0.fy = 24; c0.mv = null; c0.route = null; c0.dir = 'down';
    await wait(120);
    const orig = RB.world.scriptMove, calls = [];
    // (test instrumentation: each step the walk sends, with the walker's tile then and whether a step was under way)
    RB.world.scriptMove = function (id, dir) {
      const a = RB.world.actorById(id);
      calls.push({ id, dir, at: a ? [a.x, a.y] : null, mv: !!(a && a.mv), t: Math.round(performance.now()) });
      return orig.apply(this, arguments);
    };
    // a step under way, begun with the game's own scripted move (not logged: it is the test's, before the walk)
    const begin = async (a, id, dir, dur) => { orig(id, dir, 1, dur); for (let i = 0; i < 50 && !a.mv; i++) await Promise.resolve(); return !!a.mv; };
    const tok = SG.begin('t.walk_settle');
    const f0 = SG.stats().walkFallbacks;
    const out = { name };
    let pr = null, t0 = 0;
    const call = (ref, x, y, dir, o) => { t0 = performance.now(); pr = SG.walkTo(ref, x, y, dir, o); out.sync = calls.length; return pr; };
    try {
      if (name === 'settled') {
        call('comp', 22, 24, 'up');
      } else if (name === 'mid-step' || name === 'departure') {
        out.began = await begin(c0, 'comp', 'right', 400);
        await wait(100);
        out.midAt = [c0.x, c0.y, !!c0.mv];
        call('comp', name === 'departure' ? 19 : 22, 24, 'up');
      } else if (name === 'same-frame') {
        out.began = await begin(c0, 'comp', 'right', 240);
        await wait(60);
        call('comp', 22, 24, 'up');
        // (what stepActor sets as a step ends, applied in the same task, before any promise callback runs)
        const m = c0.mv; c0.x = m.tx; c0.y = m.ty; c0.fx = c0.x; c0.fy = c0.y; c0.mv = null;
      } else if (name === 'cap') {
        out.began = await begin(c0, 'comp', 'right', 400);
        c0.mv.dur = 1e9; // a step that cannot land within the bound
        out.mvBefore = c0.mv;
        call('comp', 22, 24, 'up');
      } else if (name === 'scene-end' || name === 'new-scene') {
        out.began = await begin(c0, 'comp', 'right', 500);
        call('comp', 22, 24, 'up', { stay: true });
        await wait(150);
        SG.end(tok);
        if (name === 'new-scene') out.tok2 = SG.begin('t.walk_settle_2');
      } else if (name === 'comp-replaced' || name === 'comp-replaced-landed') {
        out.began = await begin(c0, 'comp', 'right', 500);
        call('comp', 22, 24, 'up');
        await wait(150);
        RB.world.placeCompanion();
        out.newComp = W.comp !== c0;
        out.newDir0 = W.comp && W.comp.dir;
        if (name === 'comp-replaced-landed') { c0.mv = null; c0.x = 20; c0.fx = 20; } // (the old figure's step, ended by the test)
      } else if (name === 'map-entered') {
        out.began = await begin(p0, 'pc', 'left', 600);
        call('pc', 23, 24, 'up'); // (a place you can walk to from either tile of the step; (23,25) is blocked)
        await wait(50);
        await G.transition('mp.blockprint', 40, 15, 'down', { inScript: true });
        out.newPlayer = W.player !== p0;
      } else if (name === 'skip-in-wait' || name === 'skip-in-wait-taken') {
        if (name === 'skip-in-wait-taken') { p0.x = p0.fx = 22; p0.y = p0.fy = 24; }
        out.began = await begin(c0, 'comp', 'right', 500);
        call('comp', 22, 24, 'up');
        await wait(150);
        G.setFastForward(true);
      } else if (name === 'skip-at-entry' || name === 'now-at-entry' || name === 'skip-at-entry-other') {
        out.began = await begin(c0, 'comp', 'right', 500);
        await wait(100);
        if (name !== 'now-at-entry') G.setFastForward(true);
        call('comp', name === 'skip-at-entry-other' ? 22 : 19, 24, 'up', name === 'now-at-entry' ? { now: true } : undefined);
      } else if (name.startsWith('walked-in')) {
        const g = RB.world.ensureSpeaker('co_goro', 't.walk_settle');
        for (let i = 0; i < 300 && g && !(g.route && g.route.length >= 2 && g.mv); i++) await wait(10);
        const e = g && g.route && g.route[g.route.length - 1];
        out.walkIn = g ? { at: [g.x, g.y], mv: g.mv ? [g.mv.tx, g.mv.ty] : null, end: e, n: g.route && g.route.length } : null;
        if (name === 'walked-in-skip') G.setFastForward(true);
        const to = name === 'walked-in-at-end' ? e : name === 'walked-in-unreachable' ? [23, 25] : [22, 24]; // ((23,25) is blocked)
        call('co_goro', to[0], to[1], 'up');
        out.justAfter = [g.x, g.y, !!g.mv]; // (in the same task as the call)
        if (name === 'walked-in-same-frame' && g.mv) { const m = g.mv; g.x = m.tx; g.y = m.ty; g.fx = g.x; g.fy = g.y; g.mv = null; }
        out.goro = () => [g.x, g.y, g.dir, !!g.mv];
      }
      const r = await Promise.race([pr, wait(6000).then(() => 'timeout')]);
      out.result = r;
      out.ms = Math.round(performance.now() - t0);
      const c = W.comp;
      out.atResolve = { comp: c && [c.x, c.y, c.dir, !!c.mv], old: [c0.x, c0.y, c0.dir, !!c0.mv], pc: [W.player.x, W.player.y, W.player.dir], map: W.map.id };
      out.fb = SG.stats().walkFallbacks - f0;
      if (out.goro) out.goroAt = out.goro();
      if (name === 'cap') out.sameMv = c0.mv === out.mvBefore && !!c0.mv;
      if (name === 'cap') { const r2 = await SG.walkTo('pc', 22, 24, null, { now: true }); out.targetFree = r2 && W.player.x === 22 && W.player.y === 24; }
      await wait(700);
      const c2 = W.comp;
      out.later = { comp: c2 && [c2.x, c2.y, c2.dir, !!c2.mv], old: [c0.x, c0.y, c0.dir], pc: [W.player.x, W.player.y, W.player.dir], s: [G.s.x, G.s.y, G.s.dir], map: W.map.id };
      if (out.goro) {
        out.goroLater = out.goro();
        SG.end(tok);
        await wait(700);
        out.goroAfterEnd = out.goro();
        delete out.goro;
      }
      out.calls = calls.slice();
    } finally {
      G.setFastForward(false);
      if (out.tok2) SG.end(out.tok2);
      SG.end(tok);
      RB.world.scriptMove = orig;
    }
    delete out.mvBefore;
    return out;
  };
}

const CASES = ['settled', 'mid-step', 'same-frame', 'cap', 'departure', 'scene-end', 'new-scene', 'comp-replaced', 'comp-replaced-landed', 'map-entered',
  'skip-in-wait', 'skip-in-wait-taken', 'skip-at-entry', 'now-at-entry', 'skip-at-entry-other', 'walked-in', 'walked-in-same-frame',
  'walked-in-at-end', 'walked-in-unreachable', 'walked-in-skip'];
const J = JSON.stringify;
const fromLanded = (r, x, y) => r.calls.length > 0 && r.calls[0].at[0] === x && r.calls[0].at[1] === y && !r.calls[0].mv;
for (const name of CASES.filter((k) => !only || k === only)) {
  const { p, errors } = await start();
  const r = await p.evaluate(inPage(name), name);
  const d = name + ': ' + J({ result: r.result, ms: r.ms, sync: r.sync, fb: r.fb, atResolve: r.atResolve, later: r.later, walkIn: r.walkIn, justAfter: r.justAfter, goroAt: r.goroAt, goroLater: r.goroLater, goroAfterEnd: r.goroAfterEnd, calls: r.calls.map((k) => k.dir + '@' + k.at + (k.mv ? '(mv)' : '')) });
  if (r.began === false) ok(false, name + ': the step under way did not begin ' + d);
  if (name === 'settled') {
    ok(r.sync === 1, 'settled: no wait, the first step is sent in the same task as the call (' + r.sync + ')');
    ok(r.result === true && r.atResolve.comp.join() === '22,24,up,false' && r.fb === 0, 'settled: arrives at (22,24), facing up, no fallback ' + d);
    ok(fromLanded(r, 19, 24) && r.calls.length === 3, 'settled: three steps, the first from (19,24) ' + d);
  } else if (name === 'mid-step') {
    ok(r.midAt && r.midAt.join() === '19,24,true', 'mid-step: called while the step (19,24) -> (20,24) is under way (' + J(r.midAt) + ')');
    ok(r.sync === 0, 'mid-step: no step sent while the step under way lasts (' + r.sync + ')');
    ok(fromLanded(r, 20, 24), 'mid-step: the first step is sent from the landed tile (20,24), with no step under way ' + d);
    ok(r.result === true && r.atResolve.comp.join() === '22,24,up,false' && r.fb === 0 && r.calls.length === 2, 'mid-step: arrives at (22,24) in two steps, no fallback ' + d);
  } else if (name === 'same-frame') {
    ok(fromLanded(r, 20, 24), 'same-frame: the first step is sent from the landed tile (20,24) ' + d);
    ok(r.result === true && r.atResolve.comp.join() === '22,24,up,false' && r.fb === 0, 'same-frame: arrives at (22,24), no fallback ' + d);
  } else if (name === 'cap') {
    ok(r.result === false && r.fb === 1, 'cap: false, one fallback ' + d);
    ok(r.ms >= 950 && r.ms < 1600, 'cap: it ends at the bound, about 1 s (' + r.ms + ' ms)');
    ok(r.calls.length === 0, 'cap: no step sent ' + d);
    ok(r.atResolve.old.join() === '19,24,right,true' && r.sameMv, 'cap: still on (19,24) with the same step under way, facing unchanged (right, not up) ' + d);
    ok(r.targetFree === true, 'cap: the target is free again: you can be set on (22,24)');
  } else if (name === 'departure') {
    ok(r.sync === 0 && r.result === true && r.atResolve.comp.join() === '19,24,up,false', 'departure: arrival only once back on (19,24), the step settled ' + d);
    ok(fromLanded(r, 20, 24) && r.calls.length === 1 && r.calls[0].dir === 'left', 'departure: one step back, sent from (20,24) ' + d);
    ok(r.later.comp.slice(0, 2).join() === '19,24', 'departure: still on (19,24) after 0.7 s ' + d);
  } else if (name === 'scene-end' || name === 'new-scene') {
    ok(r.result === false && r.fb === 1 && r.calls.length === 0, name + ': false, one fallback, no step sent ' + d);
    ok(r.atResolve.old.join() === '20,24,right,false' && r.later.old.join() === '20,24,right', name + ': the step under way lands on (20,24); facing unchanged ' + d);
  } else if (name === 'comp-replaced' || name === 'comp-replaced-landed') {
    ok(r.newComp, name + ': your companion was placed afresh (a new figure)');
    ok(r.result === false && r.fb === 1 && r.calls.length === 0, name + ': false, one fallback, no step sent ' + d);
    ok(r.later.comp[2] === r.newDir0 && !r.later.comp[3] && r.later.old[2] !== 'up', name + ': no facing set on either figure, the new one not moved ' + d);
    if (name === 'comp-replaced') ok(r.ms >= 950, 'comp-replaced: the old figure is out of the world and its step never lands: it ends at the bound (' + r.ms + ' ms)');
    else ok(r.ms < 900, 'comp-replaced-landed: the liveness check decides before the bound (' + r.ms + ' ms)');
  } else if (name === 'map-entered') {
    ok(r.newPlayer && r.atResolve.map === 'mp.blockprint', 'map-entered: the map was entered afresh, with a new you');
    ok(r.result === false && r.fb === 1 && r.calls.length === 0, 'map-entered: false, one fallback, no step sent ' + d);
    ok(r.later.pc.join() === '40,15,down' && r.later.s.join() === '40,15,down', 'map-entered: the new you neither turned nor synced by the old walk ' + d);
  } else if (name === 'skip-in-wait') {
    ok(r.result === true && r.atResolve.comp.join() === '22,24,up,false' && r.calls.length === 0 && r.fb === 0, 'skip-in-wait: once the step lands, set on the free target, no step sent ' + d);
  } else if (name === 'skip-in-wait-taken') {
    ok(r.result === false && r.fb === 1 && r.calls.length === 0 && r.atResolve.comp.slice(0, 2).join() === '20,24', 'skip-in-wait-taken: the target is yours: no move, one fallback, no step sent ' + d);
  } else if (name === 'skip-at-entry' || name === 'now-at-entry') {
    ok(r.ms < 50 && r.result === true && r.calls.length === 0, name + ': no wait, no step sent ' + d);
    ok(r.atResolve.comp.join() === '19,24,up,false' && r.later.comp.slice(0, 2).join() === '19,24', name + ': set back on (19,24), the step under way ended there, and still there after 0.7 s ' + d);
  } else if (name === 'walked-in' || name === 'walked-in-same-frame') {
    const e = r.walkIn && r.walkIn.end;
    ok(!!(r.walkIn && r.walkIn.mv && r.walkIn.n >= 2), name + ': called while they walk in, a step under way and the way in not done (' + J(r.walkIn) + ')');
    ok(r.sync === 1 && !!e && fromLanded(r, e[0], e[1]), name + ': no wait; the first step is sent from where the walk-in was going, ' + J(e) + ', with no step under way ' + d);
    ok(r.result === true && r.goroAt && r.goroAt.join() === '22,24,up,false' && r.fb === 0, name + ': arrives at (22,24), no fallback ' + d);
    ok(r.goroLater && r.goroLater.join() === '22,24,up,false' && r.goroAfterEnd && r.goroAfterEnd.slice(0, 2).join() === '22,24', name + ': still on (22,24) 0.7 s later, and 0.7 s after the scene has ended ' + d);
  } else if (name === 'walked-in-at-end' || name === 'walked-in-unreachable' || name === 'walked-in-skip') {
    const e = r.walkIn && r.walkIn.end, where = name === 'walked-in-skip' ? [22, 24] : e;
    ok(!!(r.walkIn && r.walkIn.mv && r.walkIn.n >= 2), name + ': called while they walk in, a step under way and the way in not done (' + J(r.walkIn) + ')');
    ok(!!r.justAfter && !r.justAfter[2] && !!where && r.justAfter[0] === where[0] && r.justAfter[1] === where[1], name + ': at once (in the same task as the call) on ' + J(where) + ' with the old step gone ' + d);
    if (name === 'walked-in-at-end') ok(r.result === true && r.fb === 0 && r.calls.length === 0, name + ': an arrival where the walk-in was going, no step sent, no fallback ' + d);
    if (name === 'walked-in-unreachable') ok(r.result === false && r.fb === 1 && r.calls.length === 0, name + ': no way to (23,25): one fallback, no step sent, left where the walk-in was going ' + d);
    if (name === 'walked-in-skip') ok(r.result === true && r.fb === 0 && r.calls.length === 0, name + ': Skip on at the call: set on the free target, no step sent ' + d);
    const same = (k) => !!k && !!where && k[0] === where[0] && k[1] === where[1];
    ok(same(r.goroAt) && same(r.goroLater) && !r.goroLater[3] && same(r.goroAfterEnd), name + ': nothing drags them back onto the way in: still on ' + J(where) + ' when the walk resolves, 0.7 s later and 0.7 s after the scene has ended ' + d);
  } else if (name === 'skip-at-entry-other') {
    ok(r.ms < 50 && r.result === true && r.calls.length === 0 && r.atResolve.comp.join() === '22,24,up,false' && r.later.comp.slice(0, 2).join() === '22,24', 'skip-at-entry-other: no wait, set on (22,24) as before ' + d);
  }
  ok(!errors.length, name + ': no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
console.log(`\nwalk_settle: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
