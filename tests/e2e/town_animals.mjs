// The animals in town (the owner's reports of 2026-10-03), in the BUILT game, headless Chromium, synthetic
// campaigns in fresh contexts (never a player's save):
// - at rest an animal keeps moving, as the people do: your pet (every species) breathes and its tail keeps
//   going — standing just after you stop, sitting, lying — and the picture changes with it; the cat by the
//   reed screen (not met yet) does the same between the moments its scene authors;
// - Mochi, Tomo's cat, is drawn with the same rig as every other cat (white, a red collar) and has the
//   same life at rest;
// - picking Mochi up (A Cat Called Mochi, with a real key press) she is gone where she was — she does not
//   walk off through the nearest door into Kōji's house, as she did; given back, she appears beside Tomo,
//   not out of a door;
// - her line at home says what is true: stretched out in the sun by day, curled up at Tomo's feet at night;
// - the poses step through a few phases, so the frame cache stops growing once a cycle has been seen;
// - with reduced motion no breath or tail movement is added.
// Usage: node tests/e2e/town_animals.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const COMPS = { cat: 'mio', dog: 'nao', bird: 'ren', tanuki: 'suzu' };
const TAIL = { cat: 'tSide', tanuki: 'tSide', dog: 'wag', bird: 'tUp' };
const LIFE_KEYS = ['breath', 'tSide', 'tFlick', 'wag', 'tUp'];
const BASE = { rw_arrived: true, rw_road_lit: true, rw_echo_done: true, departed: true, ch1_done: true };

async function world(p, o) {
  await p.evaluate(async ([o, BASE]) => {
    RB.game.debugStart('rw.village', o.x || 22, o.y || 22, { comp: o.comp === undefined ? 'mio' : o.comp, flags: Object.assign({}, BASE, o.flags || {}), dir: o.dir || 'up' });
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.reducedMotion = !!o.reduce; RB.game.applySettings();
    await new Promise((r) => setTimeout(r, 250));
    for (let i = 0; i < 60 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 40)); }
    if (o.sp) { RB.pets.meet(RB.game.s, o.sp); RB.pets.select(RB.game.s, o.sp); }
    if (o.vars) Object.assign(RB.game.s.vars, o.vars);
    if (o.quests) Object.assign(RB.game.s.quests, o.quests);
    RB.world.refreshActors();
  }, [o, BASE]);
  await p.waitForTimeout(400);
}
// sample a pose (your pet, the reed-screen cat, or an npc animal) and the picture, every 110 ms for ms
const sample = (p, ms, who) => p.evaluate(async ([ms, who]) => {
  const poses = [], pics = new Set();
  const cv = document.getElementById('world');
  const g = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  g.canvas.width = 320; g.canvas.height = 200;
  const t0 = performance.now();
  while (performance.now() - t0 < ms) {
    let po = null;
    if (who === 'pet') po = RB.petWorld.state().pose;
    else if (who === 'wild') po = ((RB.petWorld.wild('cat') || {}).last || {}).po;
    else { const a = RB.world.actorById(who); po = a && a.pose; }
    if (po) poses.push(JSON.stringify(po));
    g.drawImage(cv, 0, 0, 320, 200);
    const d = g.getImageData(0, 0, 320, 200).data;
    let h = 0; for (let i = 0; i < d.length; i += 4) h = (h * 31 + d[i] + d[i + 1] * 3 + d[i + 2] * 7) >>> 0;
    pics.add(h);
    await new Promise((r) => setTimeout(r, 110));
  }
  return { poses, pics: pics.size };
}, [ms, who]);
const values = (poses, k) => new Set(poses.map((s) => JSON.parse(s)[k]).filter((v) => v != null)).size;
const posture = (poses) => { const P = poses.map((s) => JSON.parse(s)); return P.some((x) => x.lie > 0.5) ? 'lying' : P.some((x) => x.sit > 0.5) ? 'sitting' : 'standing'; };
const cacheSize = (p) => p.evaluate(() => RB.petArt.cacheStats().size);

// ---- your pet at rest, every species
for (const sp of ['cat', 'dog', 'tanuki', 'bird']) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await world(p, { sp, comp: COMPS[sp] });
  await p.keyboard.down('ArrowDown'); await p.waitForTimeout(700); await p.keyboard.up('ArrowDown');
  await p.waitForTimeout(900);
  const a = await sample(p, 2600, 'pet');
  const bb = await sample(p, 4000, 'pet');
  // sitting (or the bird standing) for a while: one more stretch of the same posture builds few new frames
  const c0 = await cacheSize(p);
  const cc = await sample(p, 4000, 'pet');
  const c1 = await cacheSize(p);
  void cc;
  const need = sp === 'bird' ? 2 : 3;
  ok(values(a.poses, 'breath') >= 2 && values(a.poses, TAIL[sp]) >= need, sp + ': at rest (' + posture(a.poses) + ') it breathes and its tail moves (breath ' + values(a.poses, 'breath') + ' steps, ' + TAIL[sp] + ' ' + values(a.poses, TAIL[sp]) + ' values in 2.6 s)');
  ok(values(bb.poses, 'breath') >= 2 && values(bb.poses, TAIL[sp]) >= need, sp + ': still at it later (' + posture(bb.poses) + '; breath ' + values(bb.poses, 'breath') + ', ' + TAIL[sp] + ' ' + values(bb.poses, TAIL[sp]) + ' in 4 s)');
  ok(bb.pics >= 6, sp + ': the picture changes with it (' + bb.pics + ' different pictures in 4 s)');
  ok(c1 - c0 <= 24, sp + ': the frames repeat from the cache (' + (c1 - c0) + ' new frames in a further 4 s of the same posture)');
  ok(!errors.length, sp + ': no page errors' + (errors.length ? ' ' + errors[0] : ''));
  await p.close();
}
// lying, after a long rest
{
  const { p } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await world(p, { sp: 'cat', comp: 'mio' });
  await p.keyboard.down('ArrowDown'); await p.waitForTimeout(700); await p.keyboard.up('ArrowDown');
  await p.waitForTimeout(15500);
  const r = await sample(p, 3600, 'pet');
  ok(posture(r.poses) === 'lying' && values(r.poses, 'breath') >= 2 && values(r.poses, 'tSide') >= 3, 'cat: lying after a long rest, it breathes and its tail swishes (breath ' + values(r.poses, 'breath') + ', tail ' + values(r.poses, 'tSide') + ')');
  await p.close();
}
// the cat by the reed screen, not met yet, dozing in its corner once the screen is steady
{
  const { p } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await world(p, { x: 17, y: 25, vars: { pet_cat: 2 } });
  const r = await sample(p, 3600, 'wild');
  ok(r.poses.length > 10 && posture(r.poses) === 'lying', 'the reed-screen cat is drawn, lying in its corner (' + r.poses.length + ' samples)');
  ok(values(r.poses, 'breath') >= 2 && values(r.poses, 'tSide') >= 3, 'the reed-screen cat breathes and swishes its tail (breath ' + values(r.poses, 'breath') + ', tail ' + values(r.poses, 'tSide') + ')');
  await p.close();
}

// ---- Mochi
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  // stand beside her (on a free tile next to her spot), facing her
  await world(p, { x: 44, y: 20, dir: 'right' });
  const m0 = await p.evaluate(() => { const a = RB.world.actorById('mochi'); return a ? { x: a.x, y: a.y, look: a.look, hasArt: !!RB.petArt.LOOKS.cat[a.look.look] } : null; });
  ok(m0 && m0.look.pet === 'cat' && m0.hasArt, 'Mochi is drawn with the same cat rig as the others (' + JSON.stringify(m0 && m0.look) + ')');
  const r = await sample(p, 4000, 'mochi');
  const P = r.poses.map((s) => JSON.parse(s));
  ok(P.length > 30, 'Mochi is drawn (' + P.length + ' poses sampled)');
  ok(values(r.poses, 'breath') >= 2 && values(r.poses, 'tSide') >= 3, 'Mochi breathes and her tail swishes at rest (breath ' + values(r.poses, 'breath') + ', tail ' + values(r.poses, 'tSide') + ')');
  ok(P.every((x) => x.lie > 0.5), 'Mochi is curled up where she was found, as the scene says (' + [...new Set(P.map((x) => (x.lie ? 'lie' : x.sit ? 'sit' : x.gait ? 'walk' : 'stand')))].join(' → ') + ')');
  // pick her up, with a real key press, facing her
  const before = await p.evaluate(() => {
    const W = RB.world.W, a = RB.world.actorById('mochi');
    // step beside her where she is now and face her
    const free = [[a.x - 1, a.y, 'right'], [a.x + 1, a.y, 'left'], [a.x, a.y + 1, 'up'], [a.x, a.y - 1, 'down']].find(([x, y]) => !RB.world.blocked(x, y, {}));
    W.player.x = free[0]; W.player.y = free[1]; W.player.fx = free[0]; W.player.fy = free[1]; W.player.dir = free[2]; W.player.mv = null;
    a.mv = null; a.fx = a.x; a.fy = a.y;
    return { x: a.x, y: a.y, nDep: W.departures.length };
  });
  // every frame from now on: where Mochi is drawn while she goes (the leaving figure)
  await p.evaluate(() => {
    window.__trk = []; const end = performance.now() + 8000;
    (function loop() {
      const l = RB.world.W.leavers.find((e) => e.id === 'mochi');
      if (l) window.__trk.push({ x: l.x, y: l.y, fx: l.fx, fy: l.fy, alpha: +(+l.alpha).toFixed(2), route: (l.route || []).length });
      if (performance.now() < end) requestAnimationFrame(loop);
    })();
  });
  await p.keyboard.press('z');
  for (let i = 0; i < 30; i++) {
    const open = await p.evaluate(() => RB.ui.dialogue.isOpen());
    if (!open) break;
    await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(80);
  }
  await p.waitForTimeout(1500);
  const track = await p.evaluate(() => window.__trk);
  const after = await p.evaluate(([n]) => { const W = RB.world.W; return { carried: !!RB.game.s.flags.rw_mochi_carried, stage: RB.game.s.quests.rw_mochi, npc: !!RB.world.actorById('mochi'), dep: W.departures.slice(n).filter((d) => d.id === 'mochi') }; }, [before.nDep]);
  const seen = track.filter(Boolean);
  ok(after.carried && after.stage && after.stage.stage === 1 && !after.npc, 'picked up: the quest moves on and she is no longer on the ground (' + JSON.stringify({ carried: after.carried, stage: after.stage }) + ')');
  ok(after.dep.length === 1 && /gone where they were/.test(after.dep[0].reason) && !after.dep[0].exit, 'she is gone where she was, not off to a door (' + JSON.stringify(after.dep) + ')');
  ok(seen.length > 3 && seen.every((q) => q.route === 0 && q.x === before.x && q.y === before.y && Math.round(q.fx) === before.x && Math.round(q.fy) === before.y), 'she does not move while she goes (' + seen.length + ' frames, all at ' + before.x + ',' + before.y + ')');
  ok(seen.length > 3 && seen[seen.length - 1].alpha < seen[0].alpha, 'she fades out on the spot (alpha ' + (seen[0] || {}).alpha + ' → ' + (seen[seen.length - 1] || {}).alpha + ')');
  ok(!errors.length, 'Mochi: no page errors' + (errors.length ? ' ' + errors[0] : ''));
  await p.close();
}
// given back: she appears beside Tomo (not out of a door); her line by day and by night
for (const night of [false, true]) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await world(p, { x: 9, y: 25, dir: 'left', flags: night ? { rw_night: true, rw_mochi_carried: true } : { rw_mochi_carried: true }, quests: { rw_mochi: { stage: 1, done: false, t: 1 } } });
  const arr = await p.evaluate(async () => {
    const W = RB.world.W, n = W.departures.length;
    await new Promise((r) => setTimeout(r, 1000));
    RB.game.s.quests.rw_mochi = { stage: 1, done: true, t: Date.now() }; delete RB.game.s.flags.rw_mochi_carried;
    RB.world.refreshActors();
    const a = RB.world.actorById('mochi_home');
    return { at: a ? [a.x, a.y] : null, route: a && a.route ? a.route.length : 0, fadeIn: !!(a && a.fadeIn), dep: W.departures.slice(n).filter((d) => d.id === 'mochi') };
  });
  if (!night) {
    ok(arr.at && arr.at[0] === 8 && arr.at[1] === 25 && !arr.route && arr.fadeIn, 'given back, Mochi appears beside Tomo, not out of a door (' + JSON.stringify(arr) + ')');
    ok(arr.dep.length === 1 && /appears where they are/.test(arr.dep[0].reason), 'recorded as appearing in place (' + JSON.stringify(arr.dep) + ')');
  }
  // talk to her: the line says what is true at this hour
  await p.waitForTimeout(600);
  await p.evaluate(() => { const W = RB.world.W; W.player.x = 9; W.player.y = 25; W.player.fx = 9; W.player.fy = 25; W.player.dir = 'left'; W.player.mv = null; const a = RB.world.actorById('mochi_home'); a.x = 8; a.y = 25; a.fx = 8; a.fy = 25; a.mv = null; });
  const n0 = await p.evaluate(() => RB.game.s.backlog.length);
  await p.keyboard.press('z');
  await p.waitForTimeout(300);
  for (let i = 0; i < 8 && (await p.evaluate(() => RB.ui.dialogue.isOpen())); i++) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(120); }
  // what was said in this conversation (the dialogue's history)
  const lines = await p.evaluate((n0) => RB.game.s.backlog.slice(n0).map((e) => e.en || ''), n0);
  const all = lines.join(' | ');
  ok(night ? /curled up at Tomo's feet/.test(all) && !/in the sun/.test(all) : /stretched out in the sun/.test(all), (night ? 'at night' : 'by day') + ', her line says so: ' + (all.match(/Mochi is [^.]*\./) || ['(not found) ' + all.slice(0, 200)])[0]);
  ok(!errors.length, (night ? 'night' : 'day') + ': no page errors' + (errors.length ? ' ' + errors[0] : ''));
  await p.close();
}

// ---- reduced motion: nothing added
for (const sp of ['cat', 'dog']) {
  const { p } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await world(p, { sp, comp: COMPS[sp], reduce: true });
  await p.keyboard.down('ArrowDown'); await p.waitForTimeout(700); await p.keyboard.up('ArrowDown');
  await p.waitForTimeout(1500);
  const r = await sample(p, 2500, 'pet');
  const added = r.poses.map((s) => JSON.parse(s)).filter((x) => LIFE_KEYS.some((k) => x[k] != null));
  ok(r.poses.length > 10 && !added.length, sp + ': with reduced motion no breath or tail movement is added (' + added.length + ' of ' + r.poses.length + ')');
  await p.close();
}
{
  const { p } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await world(p, { x: 44, y: 20, reduce: true });
  const r = await sample(p, 3000, 'mochi');
  const added = r.poses.map((s) => JSON.parse(s)).filter((x) => LIFE_KEYS.some((k) => x[k] != null));
  ok(r.poses.length > 10 && !added.length, 'Mochi: with reduced motion no breath or tail movement is added (' + added.length + ' of ' + r.poses.length + ')');
  await p.close();
}
await b.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
