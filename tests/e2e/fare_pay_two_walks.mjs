// The fare repaid at the teahouse (lq.fare_pay, rw.tea): the two staging walks of CC-644 (Agnes 6946332830, 6946843685;
// Akashi CL-889, CL-895, CL-896, CL-897). On Chigusa's route, Oto, when he is in the room at his teahouse place (4,4),
// steps one tile west to (3,4) before the scene's first walk; on the route through Koji, your companion's walk to the
// door (3,7) is tried again once you have stepped aside to (5,7). In Chromium on the built game, Suzu with you, two
// samples of each case, in a fresh page each:
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
// Two outcomes are kept apart (Agnes 6946843685):
//  (a) the targeted staging fix, checked (ok/FAIL, the exit code): Chigusa reaches her mark (4,6) by the coins; where
//      your companion and Oto are then; the walk fallbacks counted (the nook keeps one more, diagnostic only); Oto is
//      never in a shared tile, never stepped onto, never forced through, and never steps onto anyone; nobody shares a
//      tile while the scene runs (every frame);
//  (b) the post-scene quality, watched every frame from the talk until 3 s after the scene's end: shared tiles (who,
//      where, onset after the end, how long), steps onto a standing figure, anyone forced through, the departing
//      Chigusa's trail, the final tiles, and whether she was still in the room when the watch ended. Every outstanding
//      collision is printed as a QUALITY FAIL line. They are reported, not counted in the exit code, and never as ok:
//      some are present on the parent page too (the departing figure's tile is not counted as taken by staging,
//      CL-897); which are new is judged by comparing this run with the parent's (RB_PAGE) case by case.
// REC <json> lines carry each run's whole record for that comparison. RB_PAGE=<file> runs the same against another
// build in the tree's root (the parent's page as the control); CASES=C1,C2 and SAMPLES=n narrow a run.
// Usage: node tools/build.mjs && node tests/e2e/fare_pay_two_walks.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0, qfail = 0, qruns = 0;
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

// in the page: a recorder on every animation frame, from the talk until 3 s after the scene's end
const RECORDER = () => {
  const W = RB.world.W, R = (window.__rec = { frames: 0, open: {}, overlaps: [], onto: [], forced: [], trail: [], during: [], tEnd: null, done: false, last: null, seenMv: new WeakSet(), wasRunning: false });
  const t0 = performance.now();
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
  const tick = () => {
    const now = performance.now(), run = RB.script.isRunning();
    if (run) R.wasRunning = true;
    if (R.wasRunning && !run && R.tEnd == null && RB.game.mode() === 'world') R.tEnd = now;
    const t = R.tEnd == null ? null : Math.round(now - R.tEnd);
    const F = figs();
    R.frames++;
    // where everyone is when the fare is marked paid (after the exchange, before the scene's end), with or without Skip
    if (!R.atPaid && RB.game.s.flags.lq_fare_paid) {
      const sst = RB.staging.state(), ch = sst.actors.find((a) => a.id === 'lq_chigusa'), oto = W.npcs.find((n) => n.char === 'oto' || /^oto_r/.test(n.id));
      R.atPaid = { chigusa: ch ? [ch.x, ch.y] : null, comp: [W.comp.x, W.comp.y], you: [W.player.x, W.player.y, W.player.dir], oto: oto ? [oto.x, oto.y, oto.dir] : null, stats: Object.assign({}, RB.staging.stats()) };
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
    // steps onto a figure standing on the step's target, each step once
    for (const f of F) {
      if (!f.mv || R.seenMv.has(f.mv)) continue;
      R.seenMv.add(f.mv);
      const there = F.filter((g) => g !== f && g.x === f.tx && g.y === f.ty).map((g) => g.id);
      if (there.length) R.onto.push({ who: f.id, onto: there, tile: [f.tx, f.ty], t, during: R.tEnd == null });
    }
    // forced through (the world's walkers mark it)
    for (const f of F) if (f.forced && !R.forced.some((x) => x.who === f.id && x.tile.join() === [f.x, f.y].join())) R.forced.push({ who: f.id, tile: [f.x, f.y], t });
    // the departing Chigusa's trail
    const ch = F.find((f) => f.id.startsWith('lq_chigusa'));
    const tile = ch ? ch.id + '@' + ch.x + ',' + ch.y : 'gone';
    if (R.trail[R.trail.length - 1] !== tile) R.trail.push(tile);
    R.last = F.map((f) => ({ id: f.id, at: [f.x, f.y], dir: f.a.dir, moving: !!f.mv, forced: f.forced }));
    if (R.tEnd != null && now - R.tEnd >= 3000) {
      for (const key of Object.keys(R.open)) { const o = R.open[key]; R.overlaps.push(Object.assign(o, { to: null, ms: Math.round(now - t0) - o.fromRun, open: true })); delete R.open[key]; }
      R.chigusaInRoom = !!ch; R.done = true;
      return;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

async function run(c) {
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
  const before = await p.evaluate(() => {
    const W = RB.world.W, oto = W.npcs.find((n) => n.char === 'oto' || n.id === 'oto' || /^oto_r/.test(n.id));
    return { you: [W.player.x, W.player.y, W.player.dir], comp: [W.comp.x, W.comp.y], oto: oto ? { id: oto.id, at: [oto.x, oto.y], dir: oto.dir, home: oto.home || null } : null, stats: Object.assign({}, RB.staging.stats()) };
  });
  await p.evaluate(RECORDER);
  await p.evaluate(() => RB.world.interact());
  let coins = null, skipped = false, held = 0, assists = 0, lastLine = null, lines = 0, otoAtFirstLine = null;
  for (let i = 0; i < 500; i++) {
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
  const rec = await p.evaluate(() => { const R = window.__rec; return { frames: R.frames, tEnd: R.tEnd != null, done: R.done, atPaid: R.atPaid || null, overlaps: R.overlaps, onto: R.onto, forced: R.forced, trail: R.trail, last: R.last, chigusaInRoom: R.chigusaInRoom, stats: Object.assign({}, RB.staging.stats()), paid: !!RB.game.s.flags.lq_fare_paid } });
  await p.context().close();
  return { before, coins, otoAtFirstLine, skipped, assists, rec, errors: errors.slice(0, 3) };
}

const fb = (s) => (s && s.walkFallbacks) || 0;
for (const c of CASES) {
  for (let k = 1; k <= SAMPLES; k++) {
    const r = await run(c);
    const tag = c.id + '#' + k;
    const d = (r.coins && r.coins.stats ? fb(r.coins.stats) : NaN) - fb(r.before.stats);
    // (Skip seen: the coins line is skipped, so where everyone is is read when the fare is marked paid)
    const at = c.skip ? r.rec.atPaid : r.coins, atName = c.skip ? 'when the fare is marked paid (Skip: the coins line is skipped)' : 'at the coins';
    console.log('REC ' + J({ case: c.id, sample: k, why: c.why, before: r.before, coins: r.coins, otoAtFirstLine: r.otoAtFirstLine, skipped: r.skipped, assists: r.assists, rec: r.rec, errors: r.errors }));
    // (a) the targeted fix
    ok(r.rec.done && r.rec.tEnd && r.rec.paid, tag + ' the scene ran to its end (the fare paid) and the watch ran 3 s past it ' + J({ frames: r.rec.frames }));
    if (c.skip) ok(r.skipped && r.assists === 0, tag + ' Skip seen pressed at "Let\'s begin." and carried through on its own (Next pressed for it: ' + r.assists + ')');
    ok(at && J(at.chigusa) === J([4, 6]), tag + ' Chigusa on her mark (4,6) ' + atName + ' ' + J(at && at.chigusa));
    if (c.id === 'C1' || c.id === 'C6' || c.id === 'C8') ok(at && J(at.comp) === J([3, 7]) && J(at.you.slice(0, 2)) === J([5, 7]), tag + ' your companion at the door (3,7) and you on (5,7) ' + atName + ' ' + J(at && { comp: at.comp, you: at.you }));
    if (c.id === 'C4') ok(r.coins && J(r.coins.comp) === J([6, 7]) && d === 2, tag + ' the nook: your companion still on (6,7) at the coins; 2 walk fallbacks recorded in the scene (the first walk and its retry, diagnostic only) ' + J({ comp: r.coins && r.coins.comp, fallbacks: d }));
    if (c.id === 'C1') ok(d === 1, tag + ' 1 walk fallback in the scene (the first door walk; the retry gets through) ' + J({ fallbacks: d }));
    if (c.id === 'C2' || c.id === 'C3' || c.id === 'C7' || c.id === 'C8') ok(d === 0, tag + ' no walk falls back in the scene ' + J({ fallbacks: d }));
    if (c.oto) ok(r.before.oto && J(r.before.oto.at) === J([4, 4]) && J(r.otoAtFirstLine) === J([3, 4, 'down']) && at && J(at.oto) === J([3, 4, 'down']), tag + ' Oto stood on (4,4) before the talk (synthetic routine record); on (3,4) facing down by the first line (a walk, before any Skip) and ' + atName + ' ' + J({ before: r.before.oto, firstLine: r.otoAtFirstLine, then: at && at.oto }));
    if (!c.oto) ok(!r.before.oto, tag + ' Oto not in the room ' + J(r.before.oto));
    const otoIn = (x) => x.ids ? x.ids.some((i) => /^oto/.test(i)) : (/^oto/.test(x.who) || (x.onto || []).some((i) => /^oto/.test(i)));
    const otoEvents = r.rec.overlaps.filter(otoIn).concat(r.rec.onto.filter(otoIn), r.rec.forced.filter((x) => /^oto/.test(x.who)));
    ok(!otoEvents.length, tag + ' Oto in no shared tile, no step onto or by him, never forced, through the scene and 3 s past it ' + J(otoEvents.slice(0, 3)));
    const inScene = r.rec.overlaps.filter((o) => o.during && !(o.ids.length === 2 && o.ids.includes('you') && o.ids.includes('comp') && o.fromRun === 0));
    ok(!inScene.length, tag + ' nobody shares a tile while the scene runs (every frame) ' + J(inScene.slice(0, 3)));
    ok(!r.errors.length, tag + ' no page errors ' + J(r.errors));
    // (b) the post-scene quality: reported, never counted as ok
    qruns++;
    const post = r.rec.overlaps.filter((o) => !o.during), ontoPost = r.rec.onto.filter((o) => !o.during);
    const finalShared = (() => { const m = {}; for (const f of r.rec.last || []) (m[f.at.join()] = m[f.at.join()] || []).push(f.id); return Object.entries(m).filter(([, v]) => v.length > 1); })();
    const bad = post.length || ontoPost.length || r.rec.forced.length || finalShared.length;
    if (bad) qfail++;
    console.log((bad ? 'QUALITY FAIL ' : 'QUALITY clean ') + tag + ' after the scene: shared ' + J(post.map((o) => ({ tile: o.tile, ids: o.ids, from: o.from, ms: o.ms, open: !!o.open }))) + ' onto ' + J(ontoPost) + ' forced ' + J(r.rec.forced) + ' final-shared ' + J(finalShared) + ' chigusa-in-room-at-3s ' + r.rec.chigusaInRoom + ' trail ' + J(r.rec.trail) + ' final ' + J((r.rec.last || []).map((f) => f.id + '@' + f.at.join(','))));
  }
}

console.log(`\nquality: ${qfail} of ${qruns} runs with an outstanding collision after the scene (reported above as QUALITY FAIL; not counted below)`);
console.log(`${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
