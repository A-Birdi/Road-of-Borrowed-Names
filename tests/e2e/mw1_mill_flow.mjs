// MW-1 (Robin: a travel tile that is a door or a change of level is walked onto; the Old Mill follows the gears), in the
// built game with real keys where a step is taken. Before the gears: walking onto the stairs steps you back and says the
// pit is flooded because the gears are stopped; there is no ladder (its tile is bare floor); the millstone stands still.
// The gears scene, played for real: the pit drains, then the ladder drops with a thud, and it is there from that line
// on. After: walking onto the stairs goes down, walking onto the ladder climbs; the millstone turns; the wheel outside
// still will not turn and points to the loft. The Mill Echo meets you coming down from the loft; after a defeat you
// wake by the ladder and every way to the door or the stairs meets it again. Elsewhere: every stairs, ladder or door
// exit that plays a scene is walked onto (it asks, explains, or takes you through), and the two doors that used to be
// hidden until opened say why they are shut.
// Usage: node tools/build.mjs && node tests/e2e/mw1_mill_flow.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
let fails = 0;
const ok = (c, m) => { if (!c) fails++; console.log((c ? '  ok   ' : '  FAIL ') + m); };
const ENTER = { 'enter:rw.millroad:rw.mr_enter': true, 'enter:rw.mill1:rw.m1_enter': true, 'foe:rw.millroad:f1': true, 'foe:rw.millroad:f2': true, 'foe:rw.millroad:f3': true, 'foe:rw.mill0:p1': true, 'foe:rw.mill0:p2': true, 'foe:rw.mill1:m1a': true, rw_mill_open: true };

async function drain(pick) {
  for (let k = 0; k < 400; k++) {
    const s = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), ch: !!document.querySelector('.choices:not(.hidden) .choice'), mode: RB.game.mode(), run: RB.script.isRunning() }));
    if (s.ch) { await p.locator('.choices:not(.hidden) .choice').nth(pick || 0).click(); await p.waitForTimeout(60); continue; }
    if (s.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(25); continue; }
    if (s.mode === 'combat' || s.mode === 'encounter') return 'battle';
    if (s.mode === 'world' && !s.run) return 'world';
    await p.waitForTimeout(40);
  }
  return 'timeout';
}
async function start(map, x, y, dir, flags, more) {
  await p.evaluate(({ map, x, y, dir, flags, more }) => {
    const s = RB.game.debugStart(map, x, y, { dir, flags, comp: null });
    RB.game.settings.textSpeed = 'instant';
    s.learn.kanaKnown = 'both';
    Object.assign(s.inv, (more && more.inv) || {});
    Object.assign(s.quests, (more && more.quests) || {});
    window.__runs = [];
    if (!RB.script.__mw1) { const run = RB.script.run; RB.script.run = function (id) { (window.__runs = window.__runs || []).push(id); return run.apply(this, arguments); }; RB.script.__mw1 = true; }
  }, { map, x, y, dir, flags: Object.assign({}, ENTER, flags), more: more || null });
  await p.waitForTimeout(300);
  await drain();
}
const where = () => p.evaluate(() => ({ map: RB.world.W.map.id, x: RB.world.W.player.x, y: RB.world.W.player.y, mode: RB.game.mode() }));
const said = () => p.evaluate(() => RB.game.s.backlog.map((l) => l.en).join('\n'));
const runs = () => p.evaluate(() => window.__runs.slice());
const KEY = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
// one step with a real key press, facing that way already (start() faces you), then whatever it sets off
async function walk(dir, pick) {
  const m0 = (await where()).map;
  await p.keyboard.down(KEY[dir]); await p.waitForTimeout(90); await p.keyboard.up(KEY[dir]);
  const t0 = Date.now();
  for (;;) {
    await p.waitForTimeout(80);
    const s = await p.evaluate(() => ({ mv: !!RB.world.W.player.mv, mode: RB.game.mode(), run: RB.script.isRunning(), dlg: RB.ui.dialogue.isOpen(), map: RB.world.W.map && RB.world.W.map.id }));
    if (s.dlg || s.run) { const r = await drain(pick); if (r === 'battle') return 'battle'; }
    if (s.mode === 'combat' || s.mode === 'encounter') return 'battle';
    if (s.map !== m0) { await p.waitForTimeout(500); return drain(pick); }
    if (!s.mv && s.mode === 'world' && !s.run && Date.now() - t0 > 500) return 'world';
    if (Date.now() - t0 > 8000) return 'timeout';
  }
}
const ladderHere = () => p.evaluate(() => {
  const W = RB.world.W, s = RB.game.s;
  return { prop: W.map.props.some((q) => q.p === 'ladder' && q.x === 2 && q.y === 2 && (!q.if || RB.state.test(s, q.if))), exit: !!RB.maps.exitAt(W.map, 2, 2) };
});
// the millstone as drawn now (the instance whose condition holds), at two moments
const stoneFrames = () => p.evaluate(() => {
  const s = RB.game.s, pr = RB.world.W.map.props.find((q) => q.p === 'millstone' && (!q.if || RB.state.test(s, q.if)));
  const pal = RB.tiles.PAL.reedwake, P = RB.props.P.millstone;
  const shot = (t) => { const cv = document.createElement('canvas'); cv.width = 96; cv.height = 96; const g = cv.getContext('2d'); P.draw2(g, 12, 12, pal, t, Object.assign({ cx: 6, cy: 4 }, pr.o || {})); return cv.toDataURL(); };
  return { o: pr.o || null, same: shot(1000) === shot(1700) && shot(1000) === shot(2900) };
});

// ---- before the gears ----
await start('rw.mill1', 12, 10, 'up', {});
let r = await walk('up');
let w = await where();
ok(r === 'world' && w.map === 'rw.mill1' && w.x === 12 && w.y === 10 && /No way down like this/.test(await said()) && (await runs()).filter((x) => x === 'rw.m1_stairs').length === 1, 'jammed: walking onto the stairs steps you back and says the pit is flooded (' + JSON.stringify(w) + ')');
ok(/gears stopped/.test(await said()) && /millrace/.test(await said()), 'it says why: with the gears stopped the water cannot run back into the millrace');
await start('rw.mill1', 11, 9, 'right', {});
await walk('right');
w = await where();
ok(w.map === 'rw.mill1' && w.x === 11 && w.y === 9 && /No way down like this/.test(await said()), 'from the side too (' + JSON.stringify(w) + ')');
await start('rw.mill1', 2, 3, 'up', {});
let l = await ladderHere();
ok(!l.prop && !l.exit, 'no ladder before the gears: it is still up in the loft ' + JSON.stringify(l));
await walk('up');
w = await where();
ok(w.map === 'rw.mill1' && w.x === 2 && w.y === 2, 'its tile is bare floor: you stand on it and stay on the ground floor (' + JSON.stringify(w) + ')');
let st = await stoneFrames();
ok(st.o && st.o.still && st.same, 'the millstone stands still before the gears ' + JSON.stringify(st));
await start('rw.mill1', 8, 5, 'left', {});
await p.evaluate(() => RB.world.interact()); await drain();
ok(/no one is turning it/.test(await said()), 'its look: warm, though no one is turning it');

// ---- the gears scene, played for real: the pit drains, then the ladder drops (and is there from that line) ----
await start('rw.mill1', 10, 3, 'up', {}, { inv: { rw_wheel_pin: 1 }, quests: { rw_mill: { stage: 1, done: false, t: 0 } } });
const seen = await p.evaluate(async () => {
  const rec = [];
  const say = RB.ui.dialogue.say;
  RB.ui.dialogue.say = function (l) {
    const W = RB.world.W, s = RB.game.s;
    rec.push({ en: String(l.en || '').slice(0, 200), gears: !!s.flags.rw_gears, ladder: W.map.props.some((q) => q.p === 'ladder' && (!q.if || RB.state.test(s, q.if))), exit: !!RB.maps.exitAt(W.map, 2, 2) });
    return say.apply(this, arguments);
  };
  RB.test.enable();
  try { await RB.test.use(10, 2); } finally { RB.test.disable(); RB.ui.dialogue.say = say; }
  return rec;
});
const iDrain = seen.findIndex((x) => /draining away/.test(x.en)), iThud = seen.findIndex((x) => /drops down with a thud/.test(x.en));
ok(iDrain >= 0 && iThud > iDrain, 'the scene: the water drains from under the stairs, then the ladder drops (' + [iDrain, iThud] + ')');
ok(iThud > 0 && seen.slice(0, iThud).every((x) => !x.ladder && !x.exit && !x.gears), 'no ladder up to the thud line');
ok(iThud > 0 && seen.slice(iThud).every((x) => x.ladder && x.exit && x.gears), 'the ladder (and the way up) from the thud line on ' + JSON.stringify(seen[iThud]));
st = await stoneFrames();
ok(!st.o && !st.same, 'the millstone turns once the gears are mended ' + JSON.stringify(st));

// ---- after the gears: walk down the stairs, walk up the ladder; the millstone's and the wheel's looks ----
await start('rw.mill1', 12, 10, 'up', { rw_gears: true });
await walk('up');
w = await where();
ok(w.map === 'rw.mill0' && w.x === 2 && w.y === 7, 'mended: walking onto the stairs goes down to the Wheel Pit (' + JSON.stringify(w) + ')');
await start('rw.mill1', 11, 9, 'right', { rw_gears: true });
await walk('right');
w = await where();
ok(w.map === 'rw.mill0', 'from the side too (' + JSON.stringify(w) + ')');
await start('rw.mill1', 2, 3, 'up', { rw_gears: true });
await walk('up');
w = await where();
ok(w.map === 'rw.mill2' && w.x === 2 && w.y === 6, 'walking onto the ladder climbs to the loft (' + JSON.stringify(w) + ')');
await start('rw.mill1', 8, 5, 'left', { rw_gears: true });
await p.evaluate(() => RB.world.interact()); await drain();
ok(/turns, heavily/.test(await said()), 'the millstone after the gears: it turns, heavily, almost hot');
await start('rw.millroad', 14, 4, 'up', { rw_gears: true });
await p.evaluate(() => RB.world.interact()); await drain();
const wheel = await said();
ok(/still won't turn/.test(wheel) && /loft/.test(wheel) && !/waterwheel is still/.test(wheel), 'the wheel after the gears: it strains but will not turn; something in the loft holds it back');
await start('rw.millroad', 14, 4, 'up', {});
await p.evaluate(() => RB.world.interact()); await drain();
ok(/waterwheel is still/.test(await said()) && !/loft/.test(await said()), 'before the gears it is only still');

// ---- the Mill Echo: met coming down from the loft; after a defeat, every way out meets it again ----
const ECHO = { rw_gears: true, rw_loft_done: true, 'word.mizu': true };
await p.evaluate(() => { window.__fights = 0; RB.combat.__start = RB.combat.__start || RB.combat.start; RB.combat.start = async () => { window.__fights++; return 'lose'; }; });
await start('rw.mill2', 2, 7, 'down', ECHO);
await walk('down');
await drain();
await p.waitForTimeout(800);
await drain();
w = await where();
let f = await p.evaluate(() => window.__fights);
const cp = await p.evaluate(() => RB.game.s.checkpoint);
ok(f === 1 && w.map === 'rw.mill1' && w.mode === 'world', 'down the loft ladder, the Echo meets you at its foot (a fight: ' + f + '; lost, you wake at ' + JSON.stringify(w) + ')');
ok(cp && cp.map === 'rw.mill1' && cp.x === 2 && cp.y === 4 && w.x === 2 && w.y === 4, 'and you wake by the ladder ' + JSON.stringify(cp));
for (const [tx, ty, name] of [[7, 11, 'the door'], [12, 9, 'the stairs'], [13, 10, 'the far corner by the stairs'], [1, 9, 'the near corner']]) {
  await p.evaluate(() => { const W = RB.world.W, s = RB.game.s; W.player.x = 2; W.player.y = 4; W.player.fx = 2; W.player.fy = 4; s.x = 2; s.y = 4; window.__fights = 0; });
  await p.evaluate(([tx, ty]) => RB.world.tapTile(tx, ty), [tx, ty]);
  for (let k = 0; k < 60; k++) { await p.waitForTimeout(100); if (await p.evaluate(() => window.__fights > 0)) break; }
  await drain(); await p.waitForTimeout(400); await drain();
  f = await p.evaluate(() => window.__fights);
  w = await where();
  ok(f === 1 && w.map === 'rw.mill1', 'walking from the ladder to ' + name + ' meets the Echo (' + f + ', ' + JSON.stringify(w) + ')');
}
await p.evaluate(() => { RB.combat.start = RB.combat.__start; });

// ---- elsewhere: every scene exit is walked onto ----
const exits = await p.evaluate(() => {
  const out = [];
  for (const [id, m] of Object.entries(RB.content.maps)) for (const e of m.exits || []) if (e.scene) out.push({ id, x: e.x, y: e.y, to: e.to, if: e.if || null, scene: e.scene });
  return out;
});
const D = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const OPEN = { kr_moths_done: true, kr_cave2_open: true, mb_passage: true, mb_u1_low: true, mb_u3_down: true, mp_u3_raised: true, xpk_cellars_sc_ladder: true };
let walked = 0;
for (const e of exits) {
  // a free tile beside it to step from (stairs in a wall are bumped into from the tile in front)
  const from = await p.evaluate(({ e, flags, D }) => {
    RB.game.debugStart(e.id, 0, 0, { flags: Object.assign({}, flags), comp: null });
    const W = RB.world.W;
    for (const d of ['down', 'up', 'left', 'right']) {
      const fx = e.x - D[d][0], fy = e.y - D[d][1];
      if (fx < 0 || fy < 0 || fx >= W.map.w || fy >= W.map.h) continue;
      if (RB.world.blocked(fx, fy, { except: W.player, ignorePlayer: true }) || RB.maps.exitAt(W.map, fx, fy)) continue;
      return { x: fx, y: fy, dir: d };
    }
    return null;
  }, { e, flags: Object.assign({}, ENTER, OPEN), D });
  if (!from) { ok(false, e.id + ' ' + e.x + ',' + e.y + ': no tile to walk onto it from'); continue; }
  await start(e.id, from.x, from.y, from.dir, OPEN);
  await p.evaluate(() => { const s = RB.game.s; for (const k of Object.keys(s.flags)) if (k.startsWith('enter:')) s.flags[k] = true; });
  r = await walk(from.dir, 0);
  w = await where();
  const ran = (await runs()).includes(e.scene);
  ok(ran && w.map === e.to, e.id + ' ' + e.x + ',' + e.y + ': walking onto it (' + e.scene + ') takes you to ' + e.to + ' (' + JSON.stringify(w) + ')');
  if (ran && w.map === e.to) walked++;
}
ok(walked === exits.length, 'every scene exit walked through: ' + walked + '/' + exits.length);
// a way on that asks first: "not yet" leaves you where you stood, off the stairs
await start('mb.lockhouse', 8, 5, 'down', { mb_passage: true });
await walk('down', 1);
w = await where();
ok(w.map === 'mb.lockhouse' && w.x === 8 && w.y === 5, 'the lockhouse stairs ask first; "not yet" leaves you beside them (' + JSON.stringify(w) + ')');
// gated: the cave before the moths are dealt with explains and keeps you
await start('kr.lodge', 20, 4, 'up', {});
await walk('up');
w = await where();
ok(w.map === 'kr.lodge' && (await runs()).includes('kr.cave_go'), 'the lodge\'s cave door before the moths: it says why, and you stay (' + JSON.stringify(w) + ')');

// ---- the two doors that were hidden until opened: walked onto while shut, they say so ----
for (const [map, sc, flag] of [['yn.lower', 'yn.vents_door', 'yn_vents_open'], ['lf.records', 'lf.stacks_door', 'lf_stacks_open']]) {
  const e = await p.evaluate(([map, sc]) => RB.content.maps[map].exits.find((x) => x.locked === sc), [map, sc]);
  const from = await p.evaluate(({ map, e, D }) => {
    RB.game.debugStart(map, 0, 0, { comp: null });
    const W = RB.world.W;
    for (const d of ['up', 'down', 'left', 'right']) {
      const fx = e.x - D[d][0], fy = e.y - D[d][1];
      if (fx < 0 || fy < 0 || fx >= W.map.w || fy >= W.map.h) continue;
      if (RB.world.blocked(fx, fy, { except: W.player, ignorePlayer: true }) || RB.maps.exitAt(W.map, fx, fy)) continue;
      return { x: fx, y: fy, dir: d };
    }
    return null;
  }, { map, e, D });
  await start(map, from.x, from.y, from.dir, {});
  await p.evaluate(() => { const s = RB.game.s; for (const k of Object.keys(s.flags)) if (k.startsWith('enter:')) s.flags[k] = true; });
  await walk(from.dir);
  w = await where();
  ok(w.map === map && w.x === from.x && w.y === from.y && (await runs()).includes(sc), map + ': walking onto the shut door plays ' + sc + ' and you stay (' + JSON.stringify(w) + ')');
  await start(map, from.x, from.y, from.dir, { [flag]: true });
  await walk(from.dir);
  w = await where();
  ok(w.map === e.to, map + ': open, it takes you to ' + e.to + ' (' + JSON.stringify(w) + ')');
}

ok(!errors.length, 'no page errors ' + errors.join('; '));
await b.close();
srv.close();
console.log(fails ? fails + ' failed' : 'mw1_mill_flow: all passed');
process.exit(fails ? 1 : 0);
