// The fare repaid at the teahouse (lq.fare_pay, rw.tea): the two staging walks of CC-644 (Agnes 6946332830, 6946843685;
// Akashi CL-889, CL-895, CL-896, CL-897). On Chigusa's route, Oto, when he is in the room at his teahouse place (4,4),
// steps one tile west to (3,4) before the scene's first walk; on the route through Koji, your companion's walk to the
// door (3,7) is tried again once you have stepped aside to (5,7). And the scene's last command, `!refresh gone`, waits
// until Chigusa has walked out of the door before the scene ends (at once when skipping), so your companion's rejoin at
// the end never crosses her way out (CC-652; Agnes 6952032829). In Chromium on the built game, Suzu with you, two samples
// of each case, in a fresh page each:
//  C1 Koji's west side (you on (4,6)), your companion on (4,5)                       (CL-889 case 1)
//  C2 Chigusa's west side (you on (5,4)), your companion on (5,5), Oto on (4,4)      (CL-889 case 2)
//  C3 Chigusa's west side, your companion above you on (5,3), Oto on (4,4)
//  C4 the nook: Koji's side below (you on (5,7)), your companion on (6,7) by the bed
//  C5 C2 with Skip seen pressed at "Let's begin." (the scene seen before): Oto's step and your companion's door walk
//     come before the first line, so they are walks; what follows the line is placed (CL-896)
//  C6 C1 with Skip seen pressed at "Let's begin."
//  C7 C2 without Oto in the room (the ordinary success)
//  C8 Koji's west side with your companion on (4,7): their first door walk gets there, so the retry takes no step
//     (a control for C1's end: the same end-of-scene positions reached without the retry moving anyone)
// (the committed tests/e2e/fare_pay_staging.mjs covers every side, route and companion besides.)
// SYNTHETIC setup, disclosed: the journey (flags, the quest at step 4) is made with debugStart on the tile you speak
// from; your companion's tile is set directly; Oto's routine record (the teahouse slot) is written directly into the
// journey's town record, so his routine figure stands on (4,4). The talk is the game's own interact (what OK does);
// lines go on by the dialogue's Next button, Skip seen by its own button. Text instant.
// Two outcomes are kept apart (Agnes 6946843685, 6952032829), and each fails the run on its own:
//  (a) the targeted checks (ok/FAIL; "N passed, M failed"): Chigusa reaches her mark (4,6) by the coins; where your
//      companion and Oto are then; the walk fallbacks counted (the nook keeps one more, diagnostic only); Oto is never in
//      a shared tile, never stepped onto, never forced through, and never steps onto anyone; nobody shares a tile while
//      the scene runs; she walks out before the scene ends (with Skip seen she is gone by then, at once); Oto walks home
//      to (4,4) after it; and where you and your companion end, as on 4d5776b;
//  (b) the QUALITY GATE, a separate verdict per run ("QUALITY GATE clean/FAIL"; "quality gate: N of M runs fail"):
//      watched every frame from before the talk, so from before the scene's last command, until her departure is
//      complete and you, your companion and Oto (when he is there) have settled (or 12 s after the end: right-censored).
//      A run fails the gate on (Agnes 6952032829, 6952813949):
//       - a missing observation: the watch never finished, never saw the scene end, or never saw her;
//       - any shared tile, any step onto a standing figure, any forced passage (a step taken with the world's `forced`
//         flag, or a figure seen forced);
//       - a departure not complete: she is still in the room, or the watch reached its cap before everyone settled;
//       - her departure record for THIS run absent (only records written after the watch starts count: one already in
//         the world's list, from an earlier run, never does), more than one, naming no way out, or with a fallback
//         (the 4 s bound cut her walk, or no way out); its own fallback text is printed.
//      Leaving on foot and Skip's removal at once are both complete departures, each with its record. Each run's
//      metrics are kept apart and summed apart: shared-tile intervals and their summed ms, steps onto a standing
//      figure, forced steps, forced figures seen, departure records, fallbacks. Some failures are on the parent pages
//      too (the departing figure is not counted as there by staging, CL-897): a failing gate there is a control, not a
//      claim that they are new.
//  (c) a saved journey (S1 Koji's route, S2 Chigusa's with Oto; one each): the journey is claimed as save slot 1
//      before the talk (SYNTHETIC: so the scene's own `!autosave`, before the refresh as always, writes), then the game
//      is opened afresh and that autosave loaded: where you are, the fare paid and the quest step, who is in the room,
//      nobody leaving, no scene left running, and a step of input moves you. No save code is changed.
//  (d) SYNTHETIC gate controls, labelled so and kept apart from (a)-(c) ("synthetic gate controls: N of M detected"),
//      each expected to FAIL the gate (Agnes 6952813949): the gate given fabricated records (a fallback with the
//      engine's own text, no record from this run with an earlier one present, right-censored, a missing observation;
//      and the fabricated base they each change one thing of, which must be clean); and, in the built game on C1's
//      setup, the real recorder and gate on two runs the test itself spoils: 'hold' keeps her departing figure where
//      it stands (test code sets its set-off delay very long), so the scene's own 4 s bound cuts her walk and the world
//      writes its fallback; 'drop' puts a clean record of her leaving in the world's list before the watch starts (as
//      an earlier run would) and takes this run's record out of it when she sets off. No game code is changed; these
//      runs are never counted as candidate runs. SYNTH=0 leaves the two game runs out (for the parent pages, where the
//      scene does not wait for her and there is no bound to cut).
// REC <json> lines carry each run's whole record. RB_PAGE=<file> runs the same against another build in the tree's
// root (4d5776b's or 7e7e272's page as controls); CASES=C1,C2, SAMPLES=n and SAVES=0 narrow a run.
// Usage: node tools/build.mjs && node tests/e2e/fare_pay_two_walks.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0, gfail = 0, gruns = 0, sdet = 0, sall = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const J = JSON.stringify;
const FL = { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, rw_koji_back: true, rw_echo_done: true, lq_fare_found: true };
const SAMPLES = Number(process.env.SAMPLES || 2);
const CASES = [
  { id: 'C1', why: "Koji's west side, your companion on (4,5)", at: [4, 6, 'right'], comp: [4, 5, 'down'], oto: false },
  { id: 'C2', why: "Chigusa's west side, your companion on (5,5), Oto on (4,4)", at: [5, 4, 'right'], comp: [5, 5, 'up'], oto: true },
  { id: 'C3', why: "Chigusa's west side, your companion above on (5,3), Oto on (4,4)", at: [5, 4, 'right'], comp: [5, 3, 'down'], oto: true },
  { id: 'C4', why: "the nook: Koji's side below, your companion on (6,7)", at: [5, 7, 'up'], comp: [6, 7, 'left'], oto: false },
  { id: 'C5', why: 'C2 with Skip seen at "Let\'s begin."', at: [5, 4, 'right'], comp: [5, 5, 'up'], oto: true, skip: true },
  { id: 'C6', why: 'C1 with Skip seen at "Let\'s begin."', at: [4, 6, 'right'], comp: [4, 5, 'down'], oto: false, skip: true },
  { id: 'C7', why: "Chigusa's west side, your companion on (5,5), no Oto (the ordinary success)", at: [5, 4, 'right'], comp: [5, 5, 'up'], oto: false },
  { id: 'C8', why: "Koji's west side, your companion on (4,7) (their door walk gets through: the retry takes no step)", at: [4, 6, 'right'], comp: [4, 7, 'up'], oto: false },
].filter((c) => !process.env.CASES || process.env.CASES.split(',').includes(c.id));
// where you and your companion end once everyone has settled, as on 4d5776b (CL-902's 15 s records): unchanged
const END = { C1: [[5, 7], [4, 7]], C2: [[5, 4], [4, 5]], C3: [[5, 4], [4, 5]], C4: [[5, 7], [6, 7]], C5: [[5, 4], [4, 5]], C6: [[5, 7], [4, 7]], C7: [[5, 4], [4, 4]], C8: [[5, 7], [4, 7]] };
const CAP = 12000; // how long after the scene's end the watch waits for everyone to settle before it calls the run incomplete

// in the page: a recorder on every animation frame, from the talk (so from before the scene's last command) until her
// departure is complete and you, your companion and Oto have settled (held still for 400 ms), or CAP after the end
const RECORDER = ({ CAP, synth }) => {
  const W = RB.world.W, R = (window.__rec = { frames: 0, open: {}, overlaps: [], onto: [], forced: [], steps: [], trail: [], tEnd: null, done: false, complete: false, last: null, seenMv: new WeakSet(), wasRunning: false, leaveAt: null, goneAt: null, chAtEnd: null, stillFrom: null, sawChigusa: false, settleLog: [], synth: synth || null, synthAt: null });
  const t0 = performance.now();
  // the departure records already in the world's list when the watch starts (an earlier run's): never this run's
  const prior = new Set(W.departures || []);
  R.priorChigusa = [...prior].filter((d) => d.id === 'lq_chigusa' && !d.arriving).length;
  const figs = () => {
    const out = [];
    const add = (a, id, kind) => { if (a && a.x != null) out.push({ id, kind, x: a.x, y: a.y, mv: a.mv || null, tx: a.mv ? a.mv.tx : null, ty: a.mv ? a.mv.ty : null, forced: !!a.forced, a }); };
    add(W.player, 'you', 'player');
    add(W.comp, 'comp', 'comp');
    for (const n of W.npcs) add(n, n.id, 'npc');
    for (const n of W.extras) add(n, n.id, 'extra');
    for (const n of W.leavers) add(n, n.id + '~leaving', 'leaver');
    return out;
  };
  // still: not stepping, no route left, no staging run (a walk between its steps, or a gesture: its id and owner are
  // named), not waiting; what keeps one busy
  const busy = (a, n) => !a ? [] : [a.mv && n + ' stepping', a.route && a.route.length && n + ' on a route', a.stg && a.stg.run && n + ' in a staging run (' + a.stg.run.id + ', ' + a.stg.run.owner + ')', a.wait > 0 && n + ' waiting'].filter(Boolean);
  const tick = () => {
    const now = performance.now(), run = RB.script.isRunning();
    if (run) R.wasRunning = true;
    const F = figs();
    const ch = F.find((f) => f.id.startsWith('lq_chigusa'));
    if (R.wasRunning && !run && R.tEnd == null && RB.game.mode() === 'world') { R.tEnd = now; R.chAtEnd = ch ? ch.id + '@' + ch.x + ',' + ch.y : null; }
    const t = R.tEnd == null ? null : Math.round(now - R.tEnd);
    R.frames++;
    // where everyone is when the fare is marked paid (after the exchange, before the scene's end), with or without Skip
    if (!R.atPaid && RB.game.s.flags.lq_fare_paid) {
      const sst = RB.staging.state(), c = sst.actors.find((a) => a.id === 'lq_chigusa'), oto = W.npcs.find((n) => n.char === 'oto' || /^oto_r/.test(n.id));
      R.atPaid = { chigusa: c ? [c.x, c.y] : null, comp: [W.comp.x, W.comp.y], you: [W.player.x, W.player.y, W.player.dir], oto: oto ? [oto.x, oto.y, oto.dir] : null, stats: Object.assign({}, RB.staging.stats()) };
    }
    // shared tiles
    const tiles = {};
    for (const f of F) (tiles[f.x + ',' + f.y] = tiles[f.x + ',' + f.y] || []).push(f.id);
    const nowKeys = new Set();
    for (const [tile, ids] of Object.entries(tiles)) {
      if (ids.length < 2) continue;
      const key = tile + ' ' + ids.slice().sort().join('+');
      nowKeys.add(key);
      if (!R.open[key]) R.open[key] = { tile, ids: ids.slice().sort(), from: t, fromRun: Math.round(now - t0), during: R.tEnd == null };
    }
    for (const key of Object.keys(R.open)) if (!nowKeys.has(key)) { const o = R.open[key]; R.overlaps.push(Object.assign(o, { to: t, ms: Math.round(now - t0) - o.fromRun })); delete R.open[key]; }
    // every step as it starts, with its own forced flag (the world sets it just before a step through someone, 50_world.js);
    // and the steps onto a figure standing on the step's target
    for (const f of F) {
      if (!f.mv || R.seenMv.has(f.mv)) continue;
      R.seenMv.add(f.mv);
      R.steps.push({ who: f.id, from: [f.x, f.y], to: [f.tx, f.ty], forced: f.forced, t, run: Math.round(now - t0) });
      const there = F.filter((g) => g !== f && g.x === f.tx && g.y === f.ty).map((g) => g.id);
      if (there.length) R.onto.push({ who: f.id, onto: there, tile: [f.tx, f.ty], t, during: R.tEnd == null });
    }
    // forced through (the world's walkers mark it), each tile once
    for (const f of F) if (f.forced && !R.forced.some((x) => x.who === f.id && x.tile.join() === [f.x, f.y].join())) R.forced.push({ who: f.id, tile: [f.x, f.y], t });
    // the departing Chigusa: her trail, when she starts to leave and when she is gone (ms, relative to the scene's end)
    if (ch) R.sawChigusa = true;
    // SYNTHETIC controls only (never on a candidate run): when her departing figure first appears, 'hold' keeps it where
    // it stands (its set-off delay made very long: test code, no game code), so the scene's 4 s bound cuts her walk;
    // 'drop' takes this run's record of her departure out of the world's list, as if it had never been written
    if (synth && !R.synthAt && ch && ch.kind === 'leaver') {
      R.synthAt = { run: Math.round(now - t0), at: [ch.x, ch.y], moving: !!ch.mv };
      if (synth === 'hold') ch.a.wait = 1e9;
      if (synth === 'drop') for (let i = W.departures.length - 1; i >= 0; i--) { const d = W.departures[i]; if (!prior.has(d) && d.id === 'lq_chigusa') W.departures.splice(i, 1); }
    }
    const tile = ch ? ch.id + '@' + ch.x + ',' + ch.y : 'gone';
    if (R.trail[R.trail.length - 1] !== tile) R.trail.push(tile);
    if (ch && ch.kind === 'leaver' && R.leaveAt == null) R.leaveAt = now;
    if (R.leaveAt != null && !ch && R.goneAt == null) R.goneAt = now;
    R.last = F.map((f) => ({ id: f.id, at: [f.x, f.y], dir: f.a.dir, moving: !!f.mv, forced: f.forced }));
    if (R.tEnd != null) {
      const oto = W.npcs.find((n) => n.char === 'oto' || /^oto_r/.test(n.id));
      // what is not yet settled, each change logged (ms from the scene's end)
      const why = [].concat(ch ? ['Chigusa in the room'] : [], busy(W.player, 'you'), busy(W.comp, 'comp'), busy(oto, 'oto')).join(', ') || 'settled';
      if (!R.settleLog.length || R.settleLog[R.settleLog.length - 1].why !== why) R.settleLog.push({ t, why });
      const settled = why === 'settled';
      if (settled) { if (R.stillFrom == null) R.stillFrom = now; } else R.stillFrom = null;
      const over = now - R.tEnd >= CAP;
      if ((settled && now - R.stillFrom >= 400) || over) {
        for (const key of Object.keys(R.open)) { const o = R.open[key]; R.overlaps.push(Object.assign(o, { to: null, ms: Math.round(now - t0) - o.fromRun, open: true })); delete R.open[key]; }
        R.complete = settled && !over; R.chigusaInRoom = !!ch; R.watched = Math.round(now - R.tEnd);
        R.leaveRel = R.leaveAt == null ? null : Math.round(R.leaveAt - R.tEnd); R.goneRel = R.goneAt == null ? null : Math.round(R.goneAt - R.tEnd);
        R.oto = oto ? { id: oto.id, at: [oto.x, oto.y], dir: oto.dir, home: oto.home || null } : null;
        // her departure as the world recorded it in THIS run (who left this map, by which way, and any fallback): only
        // records written since the watch started; an earlier one still in the list is counted apart, never used
        R.departs = (W.departures || []).filter((d) => !prior.has(d) && d.id === 'lq_chigusa' && !d.arriving).map((d) => ({ map: d.map, from: d.from, to: d.to, exit: d.exit, reason: d.reason, fallback: d.fallback || null }));
        R.priorStill = (W.departures || []).filter((d) => prior.has(d) && d.id === 'lq_chigusa' && !d.arriving).length;
        R.done = true;
        return;
      }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

// a step of input (an arrow key) to a free tile next to you; true if you moved that way
async function stepOnce(p) {
  const pick = await p.evaluate(() => {
    const W = RB.world.W, pl = W.player, D = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] };
    for (const d of ['left', 'right', 'up', 'down']) { const x = pl.x + D[d][0], y = pl.y + D[d][1]; if (!RB.world.blocked(x, y, { except: pl }) && !RB.maps.exitAt(W.map, x, y)) return { d, from: [pl.x, pl.y], to: [x, y] }; }
    return null;
  });
  if (!pick) return { pick, at: null, moved: false };
  const key = { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown' }[pick.d];
  let at = null;
  for (let t = 0; t < 4; t++) {
    await p.keyboard.down(key); await p.waitForTimeout(150); await p.keyboard.up(key); await p.waitForTimeout(400);
    at = await p.evaluate(() => [RB.world.W.player.x, RB.world.W.player.y]);
    if (at.join() !== pick.from.join()) break;
  }
  const D = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] }[pick.d];
  const dx = at[0] - pick.from[0], dy = at[1] - pick.from[1], n = Math.abs(dx) + Math.abs(dy);
  return { pick, at, moved: n >= 1 && dx === D[0] * n && dy === D[1] * n };
}

async function run(c, o = {}) {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 757 } });
  await p.evaluate(([c, FL]) => {
    const s = RB.game.debugStart('rw.tea', c.at[0], c.at[1], { comp: 'suzu', dir: c.at[2], flags: FL, edition: RB.edition.forNew() });
    s.quests.lq_fare = { stage: 4, done: false, t: 1 };
    if (c.oto) {
      // SYNTHETIC: Oto's routine record at its teahouse slot (3), written into the journey's town record
      const T = RB.content.towns, id = Object.keys(T).find((k) => T[k].residents && T[k].residents.oto);
      s.world = s.world || {}; s.world.towns = s.world.towns || {};
      const tw = (s.world.towns[id] = s.world.towns[id] || { tick: 0, slots: {}, leftAt: null, flags: {}, rests: 0 });
      tw.slots = tw.slots || {}; tw.slots.oto = 3;
    }
    if (c.skip) { s.seen['lq.fare_pay'] = true; s.seen['lq.fare_pay_koji'] = true; RB.game.settings.skipSeen = true; }
    RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
    RB.world.refreshActors();
    const W = RB.world.W;
    Object.assign(W.comp, { x: c.comp[0], y: c.comp[1], fx: c.comp[0], fy: c.comp[1], mv: null, route: null, dir: c.comp[2] });
  }, [c, FL]);
  await p.waitForTimeout(1500);
  // (c) SYNTHETIC: the journey claimed as save slot 1, so the scene's own !autosave writes a recovery point for it
  if (o.save) await p.evaluate(async () => { await RB.save.manualSave(1); });
  const before = await p.evaluate(() => {
    const W = RB.world.W, oto = W.npcs.find((n) => n.char === 'oto' || n.id === 'oto' || /^oto_r/.test(n.id));
    return { you: [W.player.x, W.player.y, W.player.dir], comp: [W.comp.x, W.comp.y], oto: oto ? { id: oto.id, at: [oto.x, oto.y], dir: oto.dir, home: oto.home || null } : null, stats: Object.assign({}, RB.staging.stats()) };
  });
  // SYNTHETIC ('drop' control only): a clean record of her leaving, as an earlier run would have left it, put in the
  // world's list before the watch starts; it must never count as this run's
  if (o.stale) await p.evaluate(() => RB.world.W.departures.push({ id: 'lq_chigusa', map: 'rw.tea', from: '4,6', to: 'sg.inn', via: null, exit: '4,8', reason: "SYNTHETIC: an earlier run's record", arriving: false }));
  await p.evaluate(RECORDER, { CAP, synth: o.synth || null });
  await p.evaluate(() => RB.world.interact());
  let coins = null, skipped = false, held = 0, assists = 0, lastLine = null, lines = 0, otoAtFirstLine = null;
  for (let i = 0; i < 600; i++) {
    const st = await p.evaluate(() => {
      const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown();
      return { d: d ? (d.who || '') + ': ' + String(d.en || '').slice(0, 80) : null, run: RB.script.isRunning(), mode: RB.game.mode(), skip: !!document.querySelector('.dlg .b-skip'), done: !!(window.__rec && window.__rec.done) };
    });
    if (st.d) {
      if (st.d !== lastLine) {
        lastLine = st.d; held = 0; lines++;
        const snap = await p.evaluate(() => {
          const W = RB.world.W, sst = RB.staging.state(), f = (id) => sst.actors.find((a) => a.id === id);
          const ch = f('lq_chigusa'), oto = W.npcs.find((n) => n.char === 'oto' || /^oto_r/.test(n.id));
          return { chigusa: ch ? [ch.x, ch.y] : null, comp: [W.comp.x, W.comp.y], you: [W.player.x, W.player.y, W.player.dir], oto: oto ? [oto.x, oto.y, oto.dir] : null, stats: Object.assign({}, RB.staging.stats()) };
        });
        if (lines === 1) otoAtFirstLine = snap.oto;
        if (/Chigusa stands and lays coins/.test(st.d)) coins = snap;
        if (c.skip && !skipped && /Let's begin/.test(st.d) && st.skip) { skipped = true; await p.evaluate(() => document.querySelector('.dlg .b-skip').click()); await p.waitForTimeout(100); continue; }
        if (!skipped) await p.click('.dlg .b-next').catch(() => {});
      } else if (skipped && ++held > 20) { held = 0; assists++; await p.click('.dlg .b-next').catch(() => {}); }
      await p.waitForTimeout(skipped ? 50 : 120);
      continue;
    }
    if (st.done) break;
    await p.waitForTimeout(100);
  }
  const rec = await p.evaluate(() => { const R = window.__rec; return { frames: R.frames, tEnd: R.tEnd != null, done: R.done, complete: R.complete, watched: R.watched, leaveRel: R.leaveRel, goneRel: R.goneRel, chAtEnd: R.chAtEnd, atPaid: R.atPaid || null, overlaps: R.overlaps, onto: R.onto, forced: R.forced, steps: R.steps, trail: R.trail, last: R.last, chigusaInRoom: R.chigusaInRoom, oto: R.oto, departs: R.departs, priorChigusa: R.priorChigusa, priorStill: R.priorStill, sawChigusa: R.sawChigusa, settleLog: R.settleLog, synth: R.synth, synthAt: R.synthAt, stats: Object.assign({}, RB.staging.stats()), paid: !!RB.game.s.flags.lq_fare_paid }; });
  if (!o.keep) await p.context().close();
  return { p: o.keep ? p : null, before, coins, otoAtFirstLine, skipped, assists, rec, errors };
}

// the quality gate for one run's record R: its reasons (empty: clean) and its metrics, each kind kept apart
// (you and your companion on one tile at the watch's very first frame is the synthetic setup's, before the talk: set
// aside and counted as setupPairs)
const setupPair = (o) => o.ids.length === 2 && o.ids.includes('you') && o.ids.includes('comp') && o.fromRun === 0;
function gate(R) {
  const why = [];
  const missing = [!R.done && 'the watch never finished', !R.tEnd && "the scene's end never seen", !(R.frames > 0) && 'no frames', !R.sawChigusa && 'Chigusa never seen'].filter(Boolean);
  if (missing.length) why.push('observation missing: ' + missing.join(', '));
  const shared = (R.overlaps || []).filter((o) => !setupPair(o)), forcedSteps = (R.steps || []).filter((x) => x.forced), departs = R.departs || [];
  if (shared.length) why.push('shared tile ' + J(shared.map((o) => ({ tile: o.tile, ids: o.ids, from: o.from, ms: o.ms, open: !!o.open }))));
  if ((R.onto || []).length) why.push('step onto a standing figure ' + J(R.onto));
  if ((R.forced || []).length || forcedSteps.length) why.push('forced passage ' + J({ steps: forcedSteps, seen: R.forced }));
  const trailEnd = (R.trail || [])[(R.trail || []).length - 1];
  if (!R.complete || R.chigusaInRoom || trailEnd !== 'gone') why.push('incomplete departure (' + (R.complete ? '' : 'right-censored: the watch reached its cap, or never finished; ') + 'watched ' + R.watched + ' ms after the end; Chigusa still in the room: ' + !!R.chigusaInRoom + '; last seen: ' + trailEnd + ')');
  if (!departs.length) why.push('no departure record for Chigusa from this run (absent; earlier records in the list, not counted: ' + (R.priorChigusa || 0) + ')');
  if (departs.length > 1) why.push(departs.length + ' departure records for Chigusa from this run (one expected) ' + J(departs));
  for (const d of departs) if (!d.exit) why.push('departure record names no way out ' + J(d));
  for (const d of departs) if (d.fallback) why.push('departure fallback: "' + d.fallback + '" ' + J(d));
  const m = { sharedIntervals: shared.length, sharedMs: shared.reduce((n, o) => n + (o.ms || 0), 0), ontoSteps: (R.onto || []).length, forcedSteps: forcedSteps.length, forcedSeen: (R.forced || []).length, departRecords: departs.length, fallbacks: departs.filter((d) => d.fallback).length, setupPairs: (R.overlaps || []).length - shared.length };
  return { why, m };
}
// (d) a SYNTHETIC control: expected to fail the gate with a reason matching `want`
function synthetic(name, R, want) {
  sall++;
  const { why } = gate(R), hit = why.some((w) => want.test(w));
  if (hit) sdet++;
  console.log((hit ? 'SYNTHETIC CONTROL detected ' : 'SYNTHETIC CONTROL MISSED ') + name + ': ' + (why.length ? why.join('; ') : '(the gate passed it)'));
  return why;
}
const TOT = {};

const fb = (s) => (s && s.walkFallbacks) || 0;
for (const c of CASES) {
  for (let k = 1; k <= SAMPLES; k++) {
    const r = await run(c);
    const tag = c.id + '#' + k;
    const d = (r.coins && r.coins.stats ? fb(r.coins.stats) : NaN) - fb(r.before.stats);
    // (Skip seen: the coins line is skipped, so where everyone is is read when the fare is marked paid)
    const at = c.skip ? r.rec.atPaid : r.coins, atName = c.skip ? 'when the fare is marked paid (Skip: the coins line is skipped)' : 'at the coins';
    console.log('REC ' + J({ case: c.id, sample: k, why: c.why, before: r.before, coins: r.coins, otoAtFirstLine: r.otoAtFirstLine, skipped: r.skipped, assists: r.assists, rec: r.rec, errors: r.errors.slice(0, 3) }));
    // (a) the targeted checks
    ok(r.rec.done && r.rec.tEnd && r.rec.paid, tag + ' the scene ran to its end (the fare paid) and the watch ended ' + J({ frames: r.rec.frames, watchedAfterEnd: r.rec.watched, complete: r.rec.complete }));
    if (c.skip) ok(r.skipped && r.assists === 0, tag + ' Skip seen pressed at "Let\'s begin." and carried through on its own (Next pressed for it: ' + r.assists + ')');
    ok(at && J(at.chigusa) === J([4, 6]), tag + ' Chigusa on her mark (4,6) ' + atName + ' ' + J(at && at.chigusa));
    if (c.id === 'C1' || c.id === 'C6' || c.id === 'C8') ok(at && J(at.comp) === J([3, 7]) && J(at.you.slice(0, 2)) === J([5, 7]), tag + ' your companion at the door (3,7) and you on (5,7) ' + atName + ' ' + J(at && { comp: at.comp, you: at.you }));
    if (c.id === 'C4') ok(r.coins && J(r.coins.comp) === J([6, 7]) && d === 2, tag + ' the nook: your companion still on (6,7) at the coins; 2 walk fallbacks recorded in the scene (the first walk and its retry, diagnostic only) ' + J({ comp: r.coins && r.coins.comp, fallbacks: d }));
    if (c.id === 'C1') ok(d === 1, tag + ' 1 walk fallback in the scene (the first door walk; the retry gets through) ' + J({ fallbacks: d }));
    if (c.id === 'C2' || c.id === 'C3' || c.id === 'C7' || c.id === 'C8') ok(d === 0, tag + ' no walk falls back in the scene ' + J({ fallbacks: d }));
    if (c.oto) ok(r.before.oto && J(r.before.oto.at) === J([4, 4]) && J(r.otoAtFirstLine) === J([3, 4, 'down']) && at && J(at.oto) === J([3, 4, 'down']), tag + ' Oto stood on (4,4) before the talk (synthetic routine record); on (3,4) facing down by the first line (a walk, before any Skip) and ' + atName + ' ' + J({ before: r.before.oto, firstLine: r.otoAtFirstLine, then: at && at.oto }));
    if (c.oto) ok(r.rec.complete && r.rec.oto && J(r.rec.oto.at) === J([4, 4]), tag + ' Oto walks home to (4,4) after the scene, and is still there once everyone has settled ' + J(r.rec.oto));
    if (!c.oto) ok(!r.before.oto, tag + ' Oto not in the room ' + J(r.before.oto));
    const otoIn = (x) => x.ids ? x.ids.some((i) => /^oto/.test(i)) : (/^oto/.test(x.who) || (x.onto || []).some((i) => /^oto/.test(i)));
    const otoEvents = r.rec.overlaps.filter(otoIn).concat(r.rec.onto.filter(otoIn), r.rec.forced.filter((x) => /^oto/.test(x.who)), r.rec.steps.filter((x) => /^oto/.test(x.who) && x.forced));
    ok(!otoEvents.length, tag + ' Oto in no shared tile, no step onto or by him, never forced, through the scene and until everyone has settled ' + J(otoEvents.slice(0, 3)));
    const inScene = r.rec.overlaps.filter((o) => o.during && !(o.ids.length === 2 && o.ids.includes('you') && o.ids.includes('comp') && o.fromRun === 0));
    ok(!inScene.length, tag + ' nobody shares a tile while the scene runs (every frame) ' + J(inScene.slice(0, 3)));
    if (c.skip) ok(r.rec.chAtEnd === null && (r.rec.leaveRel == null || r.rec.goneRel <= 0), tag + ' with Skip seen she is gone by the scene\'s end, at once (`!refresh gone` under fast-forward) ' + J({ atEnd: r.rec.chAtEnd, leave: r.rec.leaveRel, gone: r.rec.goneRel }));
    else ok(r.rec.chAtEnd === null && r.rec.leaveRel != null && r.rec.leaveRel < 0 && r.rec.goneRel != null && r.rec.goneRel <= 0, tag + ' she walks out of the door before the scene ends (ms from the end: she starts to leave, she is gone) ' + J({ leave: r.rec.leaveRel, gone: r.rec.goneRel, atEnd: r.rec.chAtEnd }));
    const fin = Object.fromEntries((r.rec.last || []).map((f) => [f.id, f.at]));
    ok(r.rec.complete && J(fin.you) === J(END[c.id][0]) && J(fin.comp) === J(END[c.id][1]), tag + ' where you and your companion end once everyone has settled, as on 4d5776b: you on ' + END[c.id][0] + ', your companion on ' + END[c.id][1] + ' ' + J({ you: fin.you, comp: fin.comp }));
    ok(!r.errors.length, tag + ' no page errors ' + J(r.errors.slice(0, 3)));
    // (b) the quality gate
    gruns++;
    const { why, m } = gate(r.rec);
    if (why.length) gfail++;
    for (const k of Object.keys(m)) TOT[k] = (TOT[k] || 0) + m[k];
    console.log((why.length ? 'QUALITY GATE FAIL ' : 'QUALITY GATE clean ') + tag + (why.length ? ': ' + why.join('; ') : '') + ' | metrics ' + J(m) + ' | departure ' + J(r.rec.departs) + ' | trail ' + J(r.rec.trail) + ' final ' + J((r.rec.last || []).map((f) => f.id + '@' + f.at.join(','))) + ' | settling ' + J(r.rec.settleLog));
  }
}

// (c) a saved journey: the scene's own autosave (written before its last command, as always), loaded with the game
// opened afresh
const SAVES = [{ id: 'S1', base: 'C1', mark: [5, 7] }, { id: 'S2', base: 'C2', mark: [5, 4] }].filter(() => process.env.SAVES !== '0');
const ALL = { C1: { id: 'C1', at: [4, 6, 'right'], comp: [4, 5, 'down'], oto: false }, C2: { id: 'C2', at: [5, 4, 'right'], comp: [5, 5, 'up'], oto: true } };
for (const sv of SAVES) {
  const c = ALL[sv.base], tag = sv.id + ' (' + sv.base + "'s setup)";
  const r = await run(c, { save: true, keep: true });
  const p = r.p;
  ok(r.rec.done && r.rec.paid, tag + ' the scene ran to its end with the journey claimed as slot 1 (synthetic)');
  const auto = await p.evaluate(async () => {
    try { const x = await RB.save.read(1, 'auto'); const s = x.state; return { map: s.map, at: [s.x, s.y], checkpoint: s.checkpoint || null, paid: !!s.flags.lq_fare_paid, stage: s.quests.lq_fare && s.quests.lq_fare.stage, seen: !!s.seen['lq.fare_pay'] }; } catch (e) { return { error: String(e.message || e) }; }
  });
  console.log('SAVE ' + J({ case: sv.id, autosave: auto }));
  ok(auto && !auto.error && auto.map === 'rw.tea' && auto.paid && auto.stage === 5 && J(auto.checkpoint && [auto.checkpoint.x, auto.checkpoint.y]) === J(sv.mark), tag + ' the scene\'s !autosave wrote a recovery point for slot 1: rw.tea, the fare paid, quest step 5, its checkpoint where you stood (' + sv.mark + ') ' + J(auto));
  // (the autosave is written before the scene's end, so the scene is not yet marked seen in it: the existing order, unchanged)
  console.log('note ' + tag + ': in that autosave lq.fare_pay is ' + (auto && auto.seen ? '' : 'not yet ') + 'marked seen (it is written before the scene ends, as before)');
  await p.reload();
  await p.waitForFunction(() => window.RB && RB.game && RB.save, null, { timeout: 30000 });
  const got = await p.evaluate(() => Promise.race([RB.game.loadCampaign(1, 'auto').then((v) => v !== false), new Promise((res) => setTimeout(() => res('timed out'), 15000))]));
  await p.waitForTimeout(1500);
  const w = await p.evaluate(() => {
    const W = RB.world.W, s = RB.game.s, sst = RB.staging.state(), oto = W.npcs.find((n) => n.char === 'oto' || /^oto_r/.test(n.id)), koji = W.npcs.find((n) => n.id === 'koji');
    return { map: s.map, you: [W.player.x, W.player.y], comp: W.comp ? [W.comp.x, W.comp.y] : null, paid: !!s.flags.lq_fare_paid, stage: s.quests.lq_fare && s.quests.lq_fare.stage, chigusa: W.npcs.some((n) => /^lq_chigusa/.test(n.id)) || W.extras.some((n) => /^lq_chigusa/.test(n.id)), leavers: W.leavers.length, koji: koji ? [koji.x, koji.y] : null, oto: oto ? { id: oto.id, at: [oto.x, oto.y] } : null, run: RB.script.isRunning(), mode: RB.game.mode(), stagingScene: sst.scene ? sst.scene.id : null, dialogue: !!(RB.ui.dialogue.isOpen && RB.ui.dialogue.isOpen()) };
  });
  ok(got === true && w.map === 'rw.tea' && J(w.you) === J(sv.mark) && w.paid && w.stage === 5, tag + ' the game opened afresh and that autosave loaded: rw.tea, you on ' + sv.mark + ', the fare paid, quest step 5 ' + J({ load: got, map: w.map, you: w.you, paid: w.paid, stage: w.stage }));
  ok(!w.chigusa && w.leavers === 0 && J(w.koji) === J([5, 6]) && (c.oto ? w.oto && J(w.oto.at) === J([4, 4]) : true) && !!w.comp, tag + ' who is in the room: no Chigusa (her teahouse place needs !lq_fare_paid), nobody leaving, Koji on (5,6)' + (c.oto ? ', Oto on his teahouse place (4,4)' : '') + ', and your companion with you ' + J({ chigusa: w.chigusa, leavers: w.leavers, koji: w.koji, oto: w.oto, comp: w.comp }));
  // (where loading places your companion is the follow rule's, unchanged here: behind you, or on your own tile when that is
  // taken, as by the wall behind (5,7) or Oto behind (5,4); they step off it with your first step)
  console.log('note ' + tag + ': on loading, your companion is placed on ' + w.comp + (J(w.comp) === J(w.you) ? ' (your own tile: the follow rule, the place behind you being taken)' : ''));
  ok(!w.run && w.mode === 'world' && !w.stagingScene && !w.dialogue, tag + ' no scene left running: no script, the world in play, no staging scene held, no dialogue open ' + J({ run: w.run, mode: w.mode, stagingScene: w.stagingScene, dialogue: w.dialogue }));
  const stepped = await stepOnce(p);
  await p.waitForTimeout(600);
  const after = await p.evaluate(() => { const W = RB.world.W; return { you: [W.player.x, W.player.y], comp: W.comp ? [W.comp.x, W.comp.y] : null }; });
  ok(stepped.pick && stepped.moved && after.comp && J(after.comp) !== J(after.you), tag + ' control is yours: a step of input moves you that way, and your companion follows, off your tile ' + J({ stepped, after }));
  ok(!r.errors.length, tag + ' no page errors ' + J(r.errors.slice(0, 3)));
  await p.context().close();
}

// (d) SYNTHETIC gate controls (Agnes 6952813949): each must FAIL the gate. Never counted as candidate runs.
// The gate given fabricated records: a base like a clean run's, and four copies each changed in one thing
const BASE = { done: true, tEnd: true, frames: 500, sawChigusa: true, complete: true, chigusaInRoom: false, watched: 1200, trail: ['lq_chigusa@4,6', 'lq_chigusa~leaving@4,6', 'lq_chigusa~leaving@4,7', 'lq_chigusa~leaving@4,8', 'gone'], overlaps: [], onto: [], forced: [], steps: [], departs: [{ map: 'rw.tea', from: '4,6', to: 'sg.inn', exit: '4,8', reason: 'destination', fallback: null }], priorChigusa: 0 };
{
  const base = gate(BASE).why;
  if (base.length) sall++;
  console.log((base.length ? 'SYNTHETIC CONTROL MISSED the fabricated base is not clean: ' + base.join('; ') : 'SYNTHETIC base (fabricated, not a run) is clean, so each copy below fails by its one change'));
  synthetic('[fabricated] a timeout fallback on her record (the engine\'s own text)', Object.assign({}, BASE, { departs: [Object.assign({}, BASE.departs[0], { fallback: 'faded where they were at 4,7: the walk was cut at 4000 ms' })] }), /^departure fallback: "faded where they were at 4,7: the walk was cut at 4000 ms"/);
  synthetic('[fabricated] no record from this run, one from an earlier run in the list', Object.assign({}, BASE, { departs: [], priorChigusa: 1 }), /^no departure record for Chigusa from this run \(absent; earlier records in the list, not counted: 1\)/);
  synthetic('[fabricated] right-censored: still in the room at the cap', Object.assign({}, BASE, { complete: false, chigusaInRoom: true, watched: 12000, trail: BASE.trail.slice(0, 3) }), /^incomplete departure \(right-censored/);
  synthetic("[fabricated] a missing observation: the scene's end never seen", Object.assign({}, BASE, { done: false, tEnd: false, complete: false }), /^observation missing: the watch never finished, the scene's end never seen/);
}
// the real recorder and gate in the built game, on C1's setup, on two runs the test spoils (test code only)
if (process.env.SYNTH !== '0') {
  const c1 = { id: 'C1', at: [4, 6, 'right'], comp: [4, 5, 'down'], oto: false };
  const h = await run(c1, { synth: 'hold' });
  console.log('REC ' + J({ case: 'SYNTHETIC hold', rec: h.rec, errors: h.errors.slice(0, 3) }));
  const hw = synthetic("[game, SYNTHETIC hold] her departing figure kept where it stands: the scene's 4 s bound cuts her walk", h.rec, /^departure fallback: "faded where they were at 4,[67]: the walk was cut at 4000 ms"/);
  console.log('note SYNTHETIC hold: held from ' + J(h.rec.synthAt) + '; she started to leave ' + (-h.rec.leaveRel) + ' ms and was gone ' + (-h.rec.goneRel) + ' ms before the scene ended (the 4 s bound, then up to 400 ms for her to settle) ' + J({ departure: h.rec.departs, reasons: hw }));
  const d = await run(c1, { synth: 'drop', stale: true });
  console.log('REC ' + J({ case: 'SYNTHETIC drop', rec: d.rec, errors: d.errors.slice(0, 3) }));
  synthetic('[game, SYNTHETIC drop] a clean record from an earlier run in the list, and this run\'s taken out', d.rec, /^no departure record for Chigusa from this run \(absent; earlier records in the list, not counted: 1\)/);
  console.log('note SYNTHETIC drop: the earlier record was still in the list at the end (' + d.rec.priorStill + '), and was not counted');
}

console.log(`\nquality gate: ${gfail} of ${gruns} runs fail (a missing observation, a shared tile, a step onto a standing figure, a forced passage, an incomplete departure, or her departure record for this run absent or with a fallback; watched from before the talk until everyone settled)`);
console.log('quality metrics, summed over the ' + gruns + ' runs and kept apart: ' + J(TOT));
console.log(`synthetic gate controls: ${sdet} of ${sall} detected (labelled SYNTHETIC; each expected to fail the gate; not candidate runs)`);
console.log(`${pass} passed, ${fail} failed`);
console.log('exit ' + (fail || gfail || sdet < sall ? 1 : 0) + ': targeted checks ' + fail + ' failed; quality gate ' + gfail + ' of ' + gruns + ' runs fail; synthetic controls missed ' + (sall - sdet));
await b.close(); srv.close();
process.exit(fail || gfail || sdet < sall ? 1 : 0);
