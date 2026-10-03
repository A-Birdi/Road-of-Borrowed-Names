// Idle life in the world (the paired addendum, World Idle Life and Character Mannerisms; docs/expressive/
// CONTRACT.md WI rows), in the BUILT game, headless Chromium, synthetic campaigns started on a map
// (RB.game.debugStart — fixtures, not a campaign played to that point):
// - in a representative area of every chapter (Reedwake, the Saltglass harbour, the Cinder Orchard eve,
//   the Snowbell square, the Lanternfall gardens, the Last Lamp Hut) people show life outside dialogue: their
//   drawn pose changes over time by their own profile (a resting stance, habits, occupations), and no area is
//   over-animated (never more than its cap of people busy at once, never more than four);
// - the idle life yields at once to a scene (the next frame has no habit running) and to the player moving;
// - two neighbours turn to each other for a word (social ambience: they face each other while it lasts);
// - a wanderer pauses on their round (a route habit);
// - shared stillness: standing still facing something, your companion looks at it too, a beat after you;
// - people off screen do nothing; with reduced motion nobody starts a habit and the picture holds still;
// - the same seed gives the same choices per person in two fresh pages; another seed does not;
// - frame time with the actor system on and off on the busiest square, the per-tick cost of the scheduler,
//   and the posed-frame cache (bounded) are measured and printed.
// Evidence: docs/screenshots/actors/ (contact sheets from the dev viewer, a still per chapter; with --video a
// short clip of a town's idle life).
// Usage: node tests/e2e/actor_life.mjs [--video]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const VIDEO = process.argv.includes('--video');
const out = path.join(root, 'docs/screenshots/actors');
fs.mkdirSync(out, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

const F1 = { rw_arrived: true, rw_road_lit: true, rw_echo_done: true, departed: true };
const F2 = { rw_arrived: true, rw_road_lit: true, departed: true, ch1_done: true };
const F3 = { ch1_done: true, ch2_done: true, departed: true };
const F4 = { ch1_done: true, ch2_done: true, ch3_done: true, departed: true };
const F5 = { ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, departed: true, lf_town_intro: true };
const F6 = { ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, ch5_done: true, departed: true, sa_descent: true, end_kasane_trial: true };
const AREAS = [
  { ch: 1, map: 'rw.village', flags: F1, comp: 'mio' },
  { ch: 2, map: 'sg.harbor', flags: F2, comp: 'nao' },
  { ch: 3, map: 'co.eve', flags: F3, comp: 'ren' },
  { ch: 4, map: 'sb.hamlet', flags: F4, comp: 'suzu' },
  { ch: 5, map: 'lf.gardens', flags: F5, comp: 'mio' },
  { ch: 6, map: 'sa.camp', flags: F6, comp: 'nao', seen: ['sa.camp_descent'] },
];

// start on a map, the player placed beside the densest group of people there
async function start(p, a, o) {
  o = o || {};
  await p.evaluate(async ([a, o]) => {
    RB.game.debugStart(a.map, null, null, { comp: a.comp, flags: a.flags, dir: 'down' });
    for (const id of a.seen || []) RB.game.s.seen[id] = true;
    // the map's arrival scenes count as already played (a scene ending runs them otherwise)
    for (const m of [a.map]) for (const ev of RB.content.maps[m].onEnter || []) RB.game.s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.reducedMotion = !!o.reduce; RB.game.applySettings();
    const W = RB.world.W, m = W.map;
    let best = null, bn = -1;
    for (const n of W.npcs) { const c = W.npcs.filter((q) => Math.abs(q.x - n.x) <= 5 && Math.abs(q.y - n.y) <= 4).length; if (c > bn) { bn = c; best = n; } }
    const free = (x, y) => x > 0 && y > 0 && x < m.w - 1 && y < m.h - 1 && !RB.maps.blockedStatic(m, x, y) && !RB.maps.exitAt(m, x, y) && !W.npcs.some((n) => n.x === x && n.y === y) && !m.triggers.some((t) => x >= t.x && x < t.x + t.w && y >= t.y && y < t.y + t.h);
    let spot = null;
    if (best) for (let r = 2; r < 8 && !spot; r++) for (let dy = -r; dy <= r && !spot; dy++) for (let dx = -r; dx <= r && !spot; dx++) if (Math.max(Math.abs(dx), Math.abs(dy)) === r && free(best.x + dx, best.y + dy)) spot = [best.x + dx, best.y + dy];
    if (spot) RB.world.enter(a.map, spot[0], spot[1], 'down');
    if (o.seed != null) RB.staging.seed(o.seed);
    await new Promise((r) => setTimeout(r, 200));
    for (let i = 0; i < 40 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 40)); }
    RB.staging.resetStats();
  }, [a, o]);
}
// sample every 120 ms: each person's drawn key (what RB.staging tells the renderer), who is busy, on screen
const sample = (p, ms) => p.evaluate(async (ms) => {
  const W = RB.world.W, keys = {}, busyMax = { n: 0 }, offBusy = [];
  const onScreen = (a) => { const v = RB.render.viewSize(), c = RB.render.cam; const x = a.fx * 16 - c.x, y = a.fy * 16 - c.y; return x > -24 && y > -24 && x < v.w + 8 && y < v.h + 40; };
  const t0 = performance.now();
  let visMax = 0;
  while (performance.now() - t0 < ms) {
    let vis = 0;
    const evs = new Set();
    for (const a of W.npcs) {
      if (a.look && a.look.pet) continue;
      const v = onScreen(a);
      if (v) vis++;
      const r = a.stg && a.stg.run;
      // what is happening on screen, counted as events (a word between two people is one)
      if (r && r.owner === 'idle' && !r.done && W.time >= r.t0) { evs.add(r.ev); if (!v) offBusy.push(a.id); }
      const f = RB.staging.frameOf(a, performance.now(), RB.game.reducedMotion(), 'i0');
      (keys[a.id] = keys[a.id] || new Set()).add(f ? f.dir + '|' + (f.key || '') + '|' + f.ox + ',' + f.oy : 'plain');
    }
    busyMax.n = Math.max(busyMax.n, evs.size); visMax = Math.max(visMax, vis);
    await new Promise((r) => setTimeout(r, 120));
  }
  const per = {};
  for (const id in keys) per[id] = keys[id].size;
  const st = RB.staging.stats();
  return { per, busyMax: busyMax.n, visMax, cap: st.cap, offBusy, habits: st.habits, route: st.route, social: st.social, react: st.react, compIdle: st.compIdle, playerIdle: st.playerIdle, trace: RB.staging.trace(),
    cls: Object.fromEntries(RB.staging.state().actors.map((x) => [x.id, x.cls + (x.tier ? '/' + x.tier : '') + (x.rest ? ' rest ' + x.rest : '')])) };
}, ms);

// ---- life in a representative area of every chapter ------------------------------------------------------
const perChapter = [];
for (const a of AREAS) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, a, { seed: 1000 + a.ch });
  const s = await sample(p, 16000);
  const people = Object.keys(s.per).filter((id) => s.per[id] >= 2);
  const habits = s.trace.filter((e) => e.why === 'idle' || e.why === 'route' || e.why === 'social' || e.why === 'companion' || e.why === 'player');
  ok(people.length >= 1 && habits.length >= 2, 'Ch' + a.ch + ' ' + a.map + ': people live outside dialogue — ' + people.length + ' of ' + Object.keys(s.per).length + ' changed their drawn pose in 16 s; ' + habits.length + ' habits (' + [...new Set(habits.map((e) => e.h))].join(', ') + ')');
  ok(s.busyMax <= Math.min(4, Math.max(1, s.cap)), 'Ch' + a.ch + ': never over-animated — at most ' + s.busyMax + ' thing(s) happening at once (cap ' + s.cap + ', up to ' + s.visMax + ' people on screen)');
  ok(s.offBusy.length === 0, 'Ch' + a.ch + ': nobody off screen does anything');
  perChapter.push({ ch: a.ch, map: a.map, people: Object.keys(s.per).length, changed: people.length, habits: habits.length, busyMax: s.busyMax, cap: s.cap, kinds: [...new Set(habits.map((e) => e.h))], cls: s.cls });
  await p.screenshot({ path: path.join(out, 'life_ch' + a.ch + '_' + a.map.replace('.', '_') + '.png') });
  ok(errors.length === 0, 'Ch' + a.ch + ': no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await p.context().close();
}
console.log('     per chapter: ' + JSON.stringify(perChapter.map((x) => ({ ch: x.ch, map: x.map, people: x.people, changed: x.changed, habits: x.habits, busyMax: x.busyMax, kinds: x.kinds }))));
// profiles: the people met in these areas, by class and tier
const tiers = {};
for (const x of perChapter) for (const id in x.cls) tiers[x.cls[id].split(' ')[0]] = (tiers[x.cls[id].split(' ')[0]] || 0) + 1;
console.log('     profiles met: ' + JSON.stringify(tiers));

// ---- yielding, social, routes, reduced motion, determinism ------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, AREAS[0], { seed: 7 });
  // the player's own idle (after standing 3 s) yields to a key press at once
  await p.waitForTimeout(800);
  const y1 = await p.evaluate(async () => {
    const W = RB.world.W;
    const t0 = performance.now();
    while (performance.now() - t0 < 16000 && !(W.player.stg && W.player.stg.run && W.player.stg.run.owner === 'idle')) await new Promise((r) => setTimeout(r, 50));
    return !!(W.player.stg && W.player.stg.run);
  });
  ok(y1, 'standing still, the player has small idles of their own (after a few seconds)');
  await p.keyboard.down('ArrowLeft');
  await p.waitForTimeout(60);
  const y2 = await p.evaluate(() => { const W = RB.world.W; return { pc: !!(W.player.stg && W.player.stg.run), comp: !!(W.comp && W.comp.stg && W.comp.stg.run && W.comp.stg.run.owner === 'idle') }; });
  await p.keyboard.up('ArrowLeft');
  ok(!y2.pc && !y2.comp, 'a key press clears the player\'s and the companion\'s idles at once');
  // a scene: every habit stops on the next frame
  await p.waitForTimeout(2500);
  const y3 = await p.evaluate(async () => {
    const W = RB.world.W;
    const t0 = performance.now();
    while (performance.now() - t0 < 15000 && !W.npcs.some((a) => a.stg && a.stg.run && a.stg.run.owner === 'idle' && W.time >= a.stg.run.t0)) await new Promise((r) => setTimeout(r, 40));
    const before = W.npcs.filter((a) => a.stg && a.stg.run && a.stg.run.owner === 'idle').map((a) => a.id);
    RB.script.runInline([{ who: 'narr', jp: 'テスト 。', en: 'A line.' }]);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const after = W.npcs.filter((a) => a.stg && a.stg.run && a.stg.run.owner === 'idle').map((a) => a.id);
    RB.ui.dialogue.advance(true);
    await new Promise((r) => setTimeout(r, 100));
    return { before, after };
  });
  ok(y3.before.length >= 1 && y3.after.length === 0, 'a line opening stops every habit by the next frame (' + y3.before.join(', ') + ' → none)');
  // social: two neighbours turn to each other
  const so = await p.evaluate(async () => {
    const W = RB.world.W;
    // two people within two tiles of each other, both on screen: walk the player near them first
    const pairs = [];
    const soc = (a) => !(a.look || {}).custom && !(a.look || {}).pet && !(a.def && a.def.wander) && (RB.staging.profileOf(a).social || 0) > 0;
    for (const a of W.npcs) for (const c of W.npcs) if (a.id < c.id && Math.max(Math.abs(a.x - c.x), Math.abs(a.y - c.y)) <= 2 && !(a.x === c.x && a.y === c.y) && soc(a) && soc(c)) pairs.push([a, c]);
    if (!pairs.length) return { none: true };
    const [A, B] = pairs[0];
    const m = W.map;
    let spot = null;
    for (let r = 2; r < 6 && !spot; r++) for (let dy = -r; dy <= r && !spot; dy++) for (let dx = -r; dx <= r && !spot; dx++) { const x = A.x + dx, y = A.y + dy; if (!RB.maps.blockedStatic(m, x, y) && !RB.maps.exitAt(m, x, y) && !W.npcs.some((n) => n.x === x && n.y === y) && Math.abs(x - A.x) + Math.abs(y - A.y) >= 3) spot = [x, y]; }
    RB.world.enter(m.id, spot[0], spot[1], 'down');
    await new Promise((r) => setTimeout(r, 2600));
    RB.staging.nudge({ social: true });
    const t0 = performance.now();
    let seen = null;
    while (performance.now() - t0 < 6000 && !seen) {
      for (const a of W.npcs) {
        const r = a.stg && a.stg.run;
        if (r && r.tag === 'social' && W.time >= r.t0) {
          const other = W.npcs.find((q) => q !== a && q.stg && q.stg.run && q.stg.run.tag === 'social');
          if (other) { const fa = RB.staging.frameOf(a, performance.now(), false, 'i0'), fo = RB.staging.frameOf(other, performance.now(), false, 'i0'); seen = { a: a.id, b: other.id, da: fa && fa.dir, db: fo && fo.dir, ax: a.x, ay: a.y, bx: other.x, by: other.y }; }
        }
      }
      await new Promise((r) => setTimeout(r, 60));
    }
    return seen;
  });
  const facing = (s) => { if (!s) return false; const dx = s.bx - s.ax, dy = s.by - s.ay; const toB = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : Math.abs(dx) === Math.abs(dy) && dy < 0 ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'; const toA = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'left' : 'right') : Math.abs(dx) === Math.abs(dy) && -dy < 0 ? (-dx > 0 ? 'right' : 'left') : -dy > 0 ? 'down' : 'up'; return s.da === toB && s.db === toA; };
  ok(so && !so.none && facing(so), 'two neighbours turn to face each other for a word (' + JSON.stringify(so) + ')');
  // route pauses: a wanderer stops on their round now and then
  const rp = await p.evaluate(async () => {
    const W = RB.world.W;
    const w = W.npcs.find((n) => n.def && n.def.wander && !(n.look || {}).custom);
    if (!w) return null;
    RB.world.enter(W.map.id, w.home[0] + 3 > W.map.w - 2 ? w.home[0] - 3 : w.home[0] + 3, w.home[1], 'down');
    RB.world.unstick(W.player);
    const t0 = performance.now();
    while (performance.now() - t0 < 30000) {
      if (RB.staging.trace().some((e) => e.why === 'route')) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    return RB.staging.trace().filter((e) => e.why === 'route').map((e) => e.who + ':' + e.h);
  });
  ok(rp && rp.length >= 1, 'a wanderer pauses on their round (' + (rp || []).slice(0, 4).join(', ') + ')');
  // shared stillness: you stand facing something you could look at; a beat later your companion looks too
  const sh = await p.evaluate(async () => {
    const W = RB.world.W, m = W.map;
    const free = (x, y) => !RB.maps.blockedStatic(m, x, y) && !RB.maps.exitAt(m, x, y) && !W.npcs.some((n) => n.x === x && n.y === y) && !m.triggers.some((t) => x >= t.x && x < t.x + t.w && y >= t.y && y < t.y + t.h);
    const pr = m.props.find((q) => (q.text || q.scene) && !q.if && free(q.x, q.y + 1) && free(q.x, q.y + 2));
    if (!pr) return null;
    RB.staging.seed(31);
    RB.world.enter(m.id, pr.x, pr.y + 1, 'up');
    const t0 = performance.now();
    let seen = null;
    while (performance.now() - t0 < 6000 && !seen) {
      const r = W.comp && W.comp.stg && W.comp.stg.run;
      if (r && r.tag === 'shared' && W.time >= r.t0) seen = { prop: pr.p, after: Math.round(performance.now() - t0), compDir: (RB.staging.frameOf(W.comp, performance.now(), false, 'i0') || {}).dir };
      await new Promise((r) => setTimeout(r, 50));
    }
    return seen;
  });
  ok(sh && sh.after >= 2000, 'standing still facing something, your companion turns to look at it too, a beat after you (' + JSON.stringify(sh) + ')');
  ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await p.context().close();
}
{
  // reduced motion: resting stances held, no habits, the picture holds
  const { p } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, AREAS[2], { seed: 3, reduce: true });
  await p.waitForTimeout(600);
  const s = await sample(p, 6000);
  const moved = Object.keys(s.per).filter((id) => s.per[id] > 1);
  ok(s.habits === 0 && s.busyMax === 0, 'reduced motion: nobody starts a habit (' + s.habits + ')');
  ok(moved.length === 0, 'reduced motion: every drawn pose holds still (' + moved.join(', ') + ')');
  const rests = Object.values(s.cls).filter((c) => / rest /.test(c));
  ok(rests.length >= 1, 'reduced motion still shows people\'s resting stances (' + rests.length + ')');
  await p.context().close();
}
{
  // the same seed, the same choices (two fresh pages); another seed, other choices
  const run = async (seed) => {
    const { p } = await page(b, url, { viewport: { width: 1280, height: 800 } });
    await start(p, AREAS[2], { seed });
    await p.waitForTimeout(14000);
    const tr = await p.evaluate(() => RB.staging.trace().filter((e) => e.why === 'idle'));
    await p.context().close();
    const per = {};
    for (const e of tr) (per[e.who] = per[e.who] || []).push(e.h);
    return per;
  };
  const r1 = await run(4242), r2 = await run(4242), r3 = await run(777);
  const common = (x, y) => { let n = 0, same = 0; for (const k in x) if (y[k]) { const m = Math.min(x[k].length, y[k].length); for (let i = 0; i < m; i++) { n++; if (x[k][i] === y[k][i]) same++; } } return { n, same }; };
  const c12 = common(r1, r2), c13 = common(r1, r3);
  ok(c12.n >= 3 && c12.same === c12.n, 'the same seed: each person makes the same choices in the same order (' + c12.same + '/' + c12.n + ')');
  ok(c13.n >= 3 && c13.same < c13.n, 'another seed: other choices (' + c13.same + '/' + c13.n + ' alike)');
}
{
  // frame time with many people on screen: the actor system on and off; the scheduler's cost; the cache
  const { p } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, AREAS[2], { seed: 11 });
  await p.waitForTimeout(3000);
  const perf = await p.evaluate(async () => {
    const W = RB.world.W;
    const time = async (n) => { const ts = []; for (let i = 0; i < n; i++) { const t0 = performance.now(); RB.world.update(16, true); RB.render.frame(performance.now()); ts.push(performance.now() - t0); await new Promise((r) => setTimeout(r, 0)); } ts.sort((a, b) => a - b); return { p50: ts[n >> 1], p95: ts[Math.floor(n * 0.95)], max: ts[n - 1] }; };
    RB.staging.resetStats();
    const on = await time(300);
    const st = RB.staging.stats();
    RB.staging.enabled(false);
    const off = await time(300);
    RB.staging.enabled(true);
    const people = W.npcs.length;
    return { people, on, off, tickAvg: st.tickMs / Math.max(1, st.tickN), tickMax: st.tickMax, cache: st.pose };
  });
  const r = (x) => Math.round(x * 100) / 100;
  console.log('     frame (world update + render), ' + perf.people + ' people: on p50 ' + r(perf.on.p50) + ' p95 ' + r(perf.on.p95) + ' max ' + r(perf.on.max) + ' ms; off p50 ' + r(perf.off.p50) + ' p95 ' + r(perf.off.p95) + ' ms; scheduler tick avg ' + r(perf.tickAvg) + ' max ' + r(perf.tickMax) + ' ms; posed-frame cache ' + perf.cache.entries + '/' + perf.cache.cap + ' (built ' + perf.cache.built + ', build max ' + r(perf.cache.buildMsMax) + ' ms)');
  ok(perf.on.p95 < 16 && perf.tickAvg < 1, 'the actor system fits the frame budget on the busiest square (p95 ' + r(perf.on.p95) + ' ms, scheduler ' + r(perf.tickAvg) + ' ms a tick)');
  ok(perf.cache.entries <= perf.cache.cap, 'the posed-frame cache stays within its cap');
  await p.context().close();
}
// ---- evidence: contact sheets from the dev viewer (synthetic fixtures, labelled so) ------------------------------
{
  const { p } = await page(b, url + '?dev=actors', { viewport: { width: 2000, height: 900 } });
  const groups = [['listen', 'nod', 'lookbetween', 'observe', 'chin', 'aside', 'glasses', 'halfraise'], ['palm', 'point', 'size', 'count', 'present', 'handover', 'kneel', 'read'],
    ['shrug', 'halfstep', 'guard', 'shake', 'recoil', 'folded', 'forehead', 'emphatic'], ['lowered', 'fidget', 'avert', 'bow', 'exhale', 'thanks', 'celebrate', 'laugh']];
  for (const dir of ['down', 'right']) for (let i = 0; i < groups.length; i++) {
    await p.evaluate(([cols, dir]) => RB.actorDev.open({ sheet: 'primitives', who: ['pc', 'nao', 'mio', 'ren', 'suzu', 'tsuru'], dir, scale: 2, cols }), [groups[i], dir]);
    await p.waitForTimeout(150);
    await (await p.$('.actor-dev')).screenshot({ path: path.join(out, 'gestures_' + (i * 8 + 1) + '-' + (i * 8 + 8) + '_' + dir + '.png') });
  }
  await p.evaluate(() => RB.actorDev.open({ sheet: 'profiles', who: ['pc', 'nao', 'mio', 'ren', 'suzu', 'omi', 'wataru', 'kasane', 'hoshino', 'tsuru', 'genzo', 'yae', 'hana', 'koji', 'lf_tokuji', 'akari'], dir: 'down', scale: 2 }));
  await p.waitForTimeout(150);
  await (await p.$('.actor-dev')).screenshot({ path: path.join(out, 'profiles_bespoke.png') });
  await p.evaluate(() => RB.actorDev.open({ sheet: 'profiles', who: ['kanta', 'co_tamotsu', 'sa_isamu', 'denji', 'lf_kinu', 'co_fusa', 'asahi', 'sousuke', 'tomo', 'natsume', 'sa_clerk'], dir: 'down', scale: 2 }));
  await p.waitForTimeout(150);
  await (await p.$('.actor-dev')).screenshot({ path: path.join(out, 'profiles_overlay.png') });
  ok(true, 'contact sheets written to docs/screenshots/actors/ (synthetic fixtures)');
  await p.context().close();
}
if (VIDEO) {
  const dir = path.join(out, 'video');
  fs.mkdirSync(dir, { recursive: true });
  const ctx = await b.newContext({ viewport: { width: 960, height: 600 }, recordVideo: { dir, size: { width: 960, height: 600 } } });
  const { p } = await page(b, url, { context: ctx });
  await start(p, AREAS[2], { seed: 5 });
  await p.waitForTimeout(14000);
  const v = p.video();
  await ctx.close();
  const f = await v.path();
  fs.renameSync(f, path.join(dir, 'idle_life_co_eve.webm'));
  console.log('     clip docs/screenshots/actors/video/idle_life_co_eve.webm');
}
await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
