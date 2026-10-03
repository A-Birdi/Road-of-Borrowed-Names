// The top of the lighthouse (the owner's report of 2026-10-03: told "I'll show you the top", the screen
// faded and we stayed on the ground floor while the lines described the top floor). In the BUILT game,
// headless Chromium, synthetic campaigns in fresh browser contexts (never a player's save), at 1280×800
// and 390×844 (touch):
// - talking to Genzō at sg_main 6 (the real scene; the test harness answers the challenge with its
//   canonical answer) ends with you on sg.lighthouse_top beside the weather vane, Genzō, your companion
//   and your pet up there with you; the lines about the top are said on the top;
// - one Genzō: at every sampled moment (every frame, every refresh) exactly one of his two placements
//   (ground floor, top) holds; while the screen is not dark the figure drawn matches the placement of the
//   map you are on, he is never seen fading away or walking (to a door or anywhere), never walks in as an
//   extra speaker and is never drawn twice;
// - the vane is drawn, one picture while it is stuck, several once the wind is back, one again with
//   reduced motion; outside the map is the sea (blue-green, not the timber round the room below), glassy
//   before, with whitecaps after; the sea's frames stop with reduced motion;
// - the "later" branch leaves you at the top with Genzō; talking to him there again does not climb again;
// - down the stairhead and back up by real movement: Genzō is back in his place downstairs (exactly once,
//   not fading in, not walking); the stairs lead up only once the vane scene has happened;
// - a save made at the top loads at the top with Genzō there;
// - no page errors, no requests off the test origin.
// Usage: node tests/e2e/lighthouse_top.mjs [--shots] [--slow]
//   --shots also writes docs/screenshots/lighthouse_top/*.webp; --slow runs the game's clock at a quarter
//   of real time (a machine too busy for 20 frames a second), which the waits must survive.
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const SHOTS = process.argv.includes('--shots');
const SLOW = process.argv.includes('--slow');
const OUT = path.join(root, 'docs/screenshots/lighthouse_top');
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

const BASE = { rw_arrived: true, rw_road_lit: true, rw_echo_done: true, rw_mill_open: true, departed: true, ch1_done: true,
  sg_arrived: true, sg_harbor_seen: true, sg_tide_read: true, sg_tide_low: true };
const VIEWS = [
  { name: '1280x800', opts: { viewport: { width: 1280, height: 800 } } },
  { name: '390x844', opts: { viewport: { width: 390, height: 844 }, touch: true, mobile: true } },
];

// A synthetic Chapter 2 campaign at the vane step (sg_main 6), in this page's fresh profile.
async function start(p, o) {
  await p.evaluate(async (o) => {
    // --slow: the game's clock at a quarter of real time, as on a machine too busy to draw 20 frames a second
    if (o.slow && !window.__slow) { window.__slow = true; const up = RB.world.update; RB.world.update = function (dt, c) { return up.call(this, dt / 4, c); }; }
    if (o.auto === false) RB.test.disable(); else RB.test.enable({ battle: 'unravel', choose: () => 0 });
    RB.test.departures = []; RB.test.twice = []; RB.test.extras = []; RB.test.absentSpeakers = [];
    const s = RB.game.debugStart(o.map || 'sg.lighthouse', o.x == null ? 4 : o.x, o.y == null ? 7 : o.y, { comp: o.comp === undefined ? 'mio' : o.comp, flags: Object.assign({}, o.base, o.flags || {}), dir: o.dir || 'up' });
    s.chapter = 2;
    s.quests.sg_main = { stage: o.stage == null ? 6 : o.stage, done: false, t: 1 };
    for (const k of o.seen || []) s.seen[k] = true;
    if (o.follow) s.follow = o.follow;
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.reducedMotion = !!o.reduce; RB.game.applySettings();
    if (o.pet) { RB.pets.meet(s, o.pet); RB.pets.select(s, o.pet); }
    RB.world.refreshActors();
    await new Promise((r) => setTimeout(r, 1000)); // past the map's settling-in moment
  }, Object.assign({ base: BASE, slow: SLOW }, o));
}

// Watches Genzō on every frame, after every refresh of the people on a map and after every map entry;
// records each line said with the map it was said on and whether the screen was dark.
function install() {
  if (window.__gz) return;
  const person = (n) => (n.def && (n.def.char || n.def.id)) || n.id;
  const fade = () => { const f = document.querySelector('.fade'); return f ? +getComputedStyle(f).opacity : 0; };
  const S = (window.__gz = { samples: 0, visible: 0, bad: [], maps: {}, lines: [], transitions: 0 });
  const note = (m) => { if (S.bad.length < 20 && !S.bad.includes(m)) S.bad.push(m); };
  const sample = (why) => {
    const s = RB.game.s, W = RB.world.W;
    if (!s || !W.map || !RB.content.maps[W.map.id]) return;
    let defs = 0, here = 0;
    for (const id of ['sg.lighthouse', 'sg.lighthouse_top']) for (const n of RB.content.maps[id].npcs || []) {
      if ((n.char || n.id) !== 'genzo' || (n.if && !RB.state.test(s, n.if))) continue;
      defs++;
      if (id === W.map.id) here++;
    }
    S.samples++;
    S.maps[W.map.id] = (S.maps[W.map.id] || 0) + 1;
    if (defs !== 1) note(why + ': ' + defs + ' of his placements hold (on ' + W.map.id + ')');
    const figs = W.npcs.concat(W.extras || [], W.leavers || []).filter((a) => person(a) === 'genzo');
    if (figs.some((a) => a.route && a.route.length)) note(why + ': Genzō walking on ' + W.map.id);
    if (figs.length > 1) note(why + ': ' + figs.length + ' figures of Genzō on ' + W.map.id);
    if (fade() < 0.98 && RB.render.worldVisible()) {
      S.visible++;
      const seen = figs.filter((a) => (a.alpha == null ? 1 : a.alpha) > 0.05);
      if ((W.leavers || []).some((a) => person(a) === 'genzo')) note(why + ': Genzō seen going on ' + W.map.id);
      if (seen.length !== here) note(why + ': ' + seen.length + ' Genzō drawn on ' + W.map.id + ' where ' + here + ' placement holds');
    }
  };
  (function loop() { sample('frame'); requestAnimationFrame(loop); })();
  const refresh = RB.world.refreshActors;
  RB.world.refreshActors = function () { const r = refresh.apply(this, arguments); sample('refresh'); return r; };
  RB.bus.on('map:enter', () => sample('enter'));
  const say = RB.ui.dialogue.say;
  RB.ui.dialogue.say = function (line) {
    S.lines.push({ who: line.who, en: line.en || '', map: RB.world.W.map && RB.world.W.map.id, dark: fade() > 0.9 });
    const pr = say.apply(this, arguments);
    // a line the evidence capture waits on (--shots)
    if (window.__holdOn && window.__holdOn.test(line.en || '')) return pr.then(() => new Promise((r) => { window.__held = true; window.__release = () => { window.__held = false; r(); }; }));
    return pr;
  };
  const tr = RB.game.transition;
  RB.game.transition = function () { S.transitions++; return tr.apply(this, arguments); };
}
const gz = (p) => p.evaluate(() => ({ samples: window.__gz.samples, visible: window.__gz.visible, bad: window.__gz.bad.slice(), maps: window.__gz.maps }));
const linesSince = (p, n) => p.evaluate((n) => window.__gz.lines.slice(n), n);
const nLines = (p) => p.evaluate(() => window.__gz.lines.length);
const harness = (p) => p.evaluate(() => ({
  departures: (RB.test.departures || []).filter((d) => d.id === 'genzo'),
  extras: (RB.test.extras || []).filter((x) => /^genzo/.test(x)),
  absent: (RB.test.absentSpeakers || []).filter((x) => x.who === 'genzo'),
  twice: (RB.test.twice || []).filter((x) => /^genzo/.test(x)),
  problems: RB.test.problems.slice(0, 5),
}));
const where = (p) => p.evaluate(() => {
  const W = RB.world.W, s = RB.game.s;
  const person = (n) => (n.def && (n.def.char || n.def.id)) || n.id;
  const g = W.npcs.find((n) => person(n) === 'genzo');
  const [fx, fy] = RB.world.frontTile();
  const front = W.map.props.find((q) => q.x === fx && q.y === fy && (!q.if || RB.state.test(s, q.if)));
  return {
    map: W.map.id, x: W.player.x, y: W.player.y, dir: W.player.dir, front: front ? front.p : null,
    genzo: g ? { id: g.id, x: g.x, y: g.y, alpha: g.alpha == null ? 1 : +(+g.alpha).toFixed(2) } : null,
    leavers: W.leavers.map((a) => a.id), stage: (s.quests.sg_main || {}).stage, up: !!s.flags.sg_genzo_up, cleared: !!s.flags.sg_fog_cleared,
    comp: W.comp ? { id: W.comp.id, d: Math.abs(W.comp.x - W.player.x) + Math.abs(W.comp.y - W.player.y) } : null,
    pet: RB.petWorld ? (({ shown, map, x, y }) => ({ shown, map, d: Math.abs(x - W.player.x) + Math.abs(y - W.player.y) }))(RB.petWorld.state()) : null,
  };
});
async function talkTo(p, id) { await p.evaluate(async (id) => { await RB.test.talk(id); await RB.test.idle(); }, id); }
// One step by real movement from x,y, then wait for its outcome: on `map` (and, if given, at the tile
// `at`), nothing moving, no transition, no scene. The game's clock is capped at 50 ms a frame, so on a
// busy machine a step and the map change after it take longer than any fixed wait (that race failed
// three checks on the merged build); the outcome is what is waited for, then it is read.
async function walk(p, x, y, dir, map, at) {
  await p.evaluate(async ([x, y, dir]) => { await RB.test.idle(); RB.test.place(x, y, dir); await RB.test.step(dir); }, [x, y, dir]);
  const settled = () => p.waitForFunction(([m, at]) => {
    const W = RB.world.W;
    return W.map && W.map.id === m && (!at || (W.player.x === at[0] && W.player.y === at[1])) && !W.player.mv && RB.game.mode() === 'world' && !RB.script.isRunning();
  }, [map, at || null], { timeout: 20000, polling: 50 }).then(() => true, () => false);
  let ok = await settled();
  // still so a moment later (a change of map would have begun on arrival)
  await p.waitForTimeout(400);
  if (ok) ok = await settled();
  return ok;
}

// Pixels of the world canvas (device px = css px here): a hash and the share of pixels unlike the floor in
// the vane's box, sampled over `ms`; the sea outside the map: its mean colour and its whitecaps.
const vaneBox = (p) => p.evaluate(() => {
  const k = RB.render.viewSize().scale / 2, t = RB.render.tileToCss(8, 4);
  return { x: Math.round(t.x - 16 * k), y: Math.round(t.y - 62 * k), w: Math.round(64 * k), h: Math.round(50 * k) };
});
const mapRect = (p) => p.evaluate(() => { const a = RB.render.tileToCss(0, 0), z = RB.render.tileToCss(11, 8); return { l: a.x, t: a.y, r: z.x, b: z.y, W: innerWidth, H: innerHeight }; });
const pixels = (p, box, ms, step) => p.evaluate(async ([box, ms, step]) => {
  const cv = document.getElementById('world');
  const g = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  g.canvas.width = box.w; g.canvas.height = box.h;
  const pics = new Set();
  let ink = 0, n = 0, sum = [0, 0, 0], caps = 0, warm = 0;
  const t0 = performance.now();
  do {
    g.clearRect(0, 0, box.w, box.h);
    g.drawImage(cv, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h);
    const d = g.getImageData(0, 0, box.w, box.h).data;
    let h = 0;
    for (let i = 0; i < d.length; i += 4) {
      h = (h * 31 + d[i] + d[i + 1] * 3 + d[i + 2] * 7) >>> 0;
      n++; sum[0] += d[i]; sum[1] += d[i + 1]; sum[2] += d[i + 2];
      // unlike the light grey floor: dark iron, rust, the groove
      if (d[i] + d[i + 1] + d[i + 2] < 330) ink++;
      if (d[i] >= 225 && d[i + 1] >= 235) caps++;
      if (d[i] > d[i + 2] + 25 && d[i] > 70) warm++;
    }
    pics.add(h);
    await new Promise((r) => setTimeout(r, step));
  } while (performance.now() - t0 < ms);
  return { pics: pics.size, ink: ink / n, mean: sum.map((v) => Math.round(v / n)), caps, warm: warm / n };
}, [box, ms, step]);
// a strip of open sea beside (wide screens) or above (tall screens) the map, clear of the rail and the edge shadow
function seaBox(r) {
  if (r.l > 140) return { x: 8, y: Math.max(8, Math.round(r.t)), w: Math.round(r.l - 90), h: Math.round(Math.min(r.b, r.H) - Math.max(8, r.t)) };
  return { x: 8, y: 70, w: r.W - 16, h: Math.round(r.t - 140) };
}
async function shot(p, name) {
  if (!SHOTS) return;
  fs.mkdirSync(OUT, { recursive: true });
  const png = await p.screenshot();
  const webp = await p.evaluate(async (src) => {
    const im = new Image(); im.src = src; await im.decode();
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0);
    return c.toDataURL('image/webp', 0.82);
  }, 'data:image/png;base64,' + png.toString('base64'));
  fs.writeFileSync(path.join(OUT, name + '.webp'), Buffer.from(webp.split(',')[1], 'base64'));
  console.log('     wrote docs/screenshots/lighthouse_top/' + name + '.webp');
}
const has = (lines, re) => lines.find((l) => re.test(l.en));

for (const V of VIEWS) {
  const tag = V.name + ': ';
  // ---- 1. the scene: up the stairs with Genzō, the vane turns, and you are left at the top ----------------
  {
    const { p, errors, requests } = await page(b, url, V.opts);
    await start(p, { pet: 'cat' });
    await p.evaluate(install);
    const before = await where(p);
    ok(before.map === 'sg.lighthouse' && before.genzo && before.genzo.id === 'genzo' && !before.up, tag + 'start: Genzō on the ground floor at sg_main 6 (' + JSON.stringify(before.genzo) + ')');
    if (SHOTS) await p.evaluate(() => { window.__holdOn = /^The top of the lighthouse/; });
    const talking = talkTo(p, 'genzo');
    if (SHOTS) {
      for (let i = 0; i < 200 && !(await p.evaluate(() => !!window.__held)); i++) await p.waitForTimeout(25);
      await p.waitForTimeout(250);
      await shot(p, 'scene_' + V.name);
      await p.evaluate(() => { window.__holdOn = null; window.__release && window.__release(); });
    }
    await talking;
    const after = await where(p);
    ok(after.map === 'sg.lighthouse_top' && after.x === 8 && after.y === 5 && after.dir === 'up' && /^sg_vane/.test(after.front || ''), tag + 'the scene ends on the top, beside the vane and facing it (' + [after.map, after.x, after.y, after.dir, after.front].join(' ') + ')');
    ok(after.stage === 7 && after.cleared && after.up, tag + 'the quest moved on, the fog is cleared, Genzō is up there (' + JSON.stringify({ stage: after.stage, cleared: after.cleared, up: after.up }) + ')');
    ok(after.genzo && after.genzo.id === 'genzo_top' && after.genzo.x === 9 && after.genzo.y === 5 && after.genzo.alpha === 1, tag + 'Genzō is beside you at the top (' + JSON.stringify(after.genzo) + ')');
    await p.waitForTimeout(700);
    const pet = (await where(p)).pet;
    ok(after.comp && after.comp.id === 'mio' && after.comp.d <= 1, tag + 'your companion came up with you (' + JSON.stringify(after.comp) + ')');
    ok(pet && pet.shown && pet.map === 'sg.lighthouse_top' && pet.d <= 3, tag + 'your pet came up with you (' + JSON.stringify(pet) + ')');
    const L = await linesSince(p, 0);
    const climb = has(L, /^You climb the spiral stairs/), topLine = has(L, /^The top of the lighthouse\./), ask = has(L, /^Can you write it\?/), turned = has(L, /^…It turned\./), first = has(L, /^The wind\?/);
    ok(first && first.map === 'sg.lighthouse' && climb && climb.map === 'sg.lighthouse' && climb.dark, tag + 'downstairs he talks of the wind; the climb is told over the dark (' + JSON.stringify([first, climb]) + ')');
    ok([topLine, ask, turned].every((l) => l && l.map === 'sg.lighthouse_top' && !l.dark), tag + 'the lines about the top are said on the top, in the light (' + [topLine, ask, turned].map((l) => l && l.map).join(', ') + ')');
    const G = await gz(p), H = await harness(p);
    ok(!G.bad.length && G.samples > 60 && G.visible > 20 && G.maps['sg.lighthouse'] && G.maps['sg.lighthouse_top'], tag + 'one Genzō at every sampled moment (' + G.samples + ' samples, ' + G.visible + ' in the light, on ' + Object.keys(G.maps).join(' + ') + ')' + (G.bad.length ? ': ' + G.bad.join(' | ') : ''));
    ok(!H.departures.some((d) => d.exit) && !H.extras.length && !H.absent.length && !H.twice.length, tag + 'he never walks to a door, never walks in as an extra, is never drawn twice (' + JSON.stringify(H.departures.map((d) => d.reason)) + ')');
    ok(!H.problems.length, tag + 'no harness problems ' + JSON.stringify(H.problems));
    if (SHOTS) { await p.waitForTimeout(4500); await shot(p, 'after_' + V.name); } // once the notes about the word and the journal have gone

    // ---- 4. down the stairhead and back up (real movement) -------------------------------------------------
    await walk(p, 1, 2, 'up', 'sg.lighthouse', [1, 3]);
    const down = await where(p);
    ok(down.map === 'sg.lighthouse' && down.x === 1 && down.y === 3 && !down.up, tag + 'down the stairhead: on the ground floor below the stairs, Genzō no longer up (' + [down.map, down.x, down.y, down.up].join(' ') + ')');
    ok(down.genzo && down.genzo.id === 'genzo' && down.genzo.x === 5 && down.genzo.y === 4 && down.genzo.alpha === 1 && !down.leavers.length, tag + 'he came down with you: in his place, not fading in, nobody leaving (' + JSON.stringify(down.genzo) + ')');
    await walk(p, 1, 3, 'up', 'sg.lighthouse_top', [1, 2]);
    const up = await where(p);
    ok(up.map === 'sg.lighthouse_top' && up.x === 1 && up.y === 2 && !up.genzo && !up.up, tag + 'up the stairs again: at the stairhead, alone this time (' + [up.map, up.x, up.y, JSON.stringify(up.genzo)].join(' ') + ')');
    const G2 = await gz(p), H2 = await harness(p);
    ok(!G2.bad.length && !H2.departures.some((d) => d.exit), tag + 'still one Genzō, nobody walked to a door (' + G2.samples + ' samples)' + (G2.bad.length ? ': ' + G2.bad.join(' | ') : ''));
    ok(!errors.length, tag + 'no page errors' + (errors.length ? ' ' + errors.slice(0, 3).join(' | ') : ''));
    ok(!requests.length, tag + 'no network requests off the test origin' + (requests.length ? ' ' + requests.slice(0, 3).join(' ') : ''));
    await p.close();
  }

  // ---- 2. the vane and the sea, by their pixels ------------------------------------------------------------
  {
    const { p, errors } = await page(b, url, V.opts);
    // the room below: its surround is the dark timber of the building
    await start(p, { comp: null, x: 4, y: 7, follow: '-' });
    const r0 = await mapRect(p);
    const room = await pixels(p, r0.l > 140 ? { x: 8, y: Math.max(8, Math.round(r0.t)), w: Math.round(r0.l - 60), h: 120 } : { x: 8, y: 70, w: r0.W - 16, h: Math.max(20, Math.round(r0.t - 120)) }, 300, 150);
    // the top, before the wind: nobody near the vane, no quest marks
    await start(p, { map: 'sg.lighthouse_top', comp: null, x: 2, y: 6, dir: 'down', follow: '-' });
    const box = await vaneBox(p), r = await mapRect(p), sea = seaBox(r);
    const v0 = await pixels(p, box, 2400, 150), s0 = await pixels(p, sea, 2600, 130);
    ok(v0.ink > 0.12 && v0.warm > 0.02, tag + 'the vane is drawn, rust on it (' + Math.round(v0.ink * 100) + '% iron and groove, ' + Math.round(v0.warm * 100) + '% rust in its box)');
    ok(v0.pics === 1, tag + 'stuck: one picture of it in 2.4 s (' + v0.pics + ')');
    const blueGreen = (m) => m[2] > m[0] + 40 && m[1] > m[0] + 25 && m[1] > 60 && m[2] > 80;
    ok(blueGreen(s0.mean) && !blueGreen(room.mean) && s0.mean[1] - room.mean[1] > 25, tag + 'outside the map: the sea, blue-green (' + s0.mean + ') — not the timber round the room below (' + room.mean + ')');
    ok(s0.caps === 0 && s0.pics >= 2, tag + 'the sea is glassy before the wind: no whitecaps, its glints come and go (' + s0.caps + ' whitecap px, ' + s0.pics + ' pictures)');
    // the wind is back
    await p.evaluate(() => { RB.game.s.flags.sg_fog_cleared = true; RB.world.refreshActors(); });
    await p.waitForTimeout(300);
    const v1 = await pixels(p, box, 3200, 120), s1 = await pixels(p, sea, 2600, 130);
    ok(v1.ink > 0.12 && v1.warm < v0.warm, tag + 'free: still drawn, the rust gone from it (' + Math.round(v1.ink * 100) + '% iron, ' + Math.round(v1.warm * 100) + '% rust)');
    ok(v1.pics >= 3, tag + 'free: it swings — ' + v1.pics + ' different pictures in 3.2 s');
    ok(blueGreen(s1.mean) && s1.caps > 0 && s1.pics >= 2, tag + 'the sea with the wind back: still blue-green (' + s1.mean + '), small whitecaps (' + s1.caps + ' px), moving (' + s1.pics + ' pictures)');
    // reduced motion holds the vane and the sea
    await p.evaluate(() => { RB.game.settings.reducedMotion = true; RB.game.applySettings(); });
    await p.waitForTimeout(200);
    const v2 = await pixels(p, box, 2400, 150), s2 = await pixels(p, sea, 2000, 150);
    ok(v2.pics === 1 && v2.ink > 0.12, tag + 'reduced motion: the vane is held still (' + v2.pics + ' picture in 2.4 s)');
    ok(s2.pics === 1 && s2.caps > 0, tag + 'reduced motion: the sea is held still too, whitecaps and all (' + s2.pics + ' picture)');
    ok(!errors.length, tag + 'no page errors (pixels)' + (errors.length ? ' ' + errors[0] : ''));
    await p.close();
  }

  // ---- 3. "later": left at the top with Genzō; asked again up there, no second climb ------------------------
  {
    const { p, errors, requests } = await page(b, url, V.opts);
    await start(p, {});
    await p.evaluate(install);
    // the player puts the brush down ("Come back later") the first time
    await p.evaluate(() => { const run = RB.challenge.run; RB.challenge.run = async function () { RB.challenge.run = run; return { ok: false, cancelled: true }; }; });
    await talkTo(p, 'genzo');
    const a = await where(p);
    const L1 = await linesSince(p, 0);
    ok(a.map === 'sg.lighthouse_top' && a.stage === 6 && a.up && !a.cleared && a.genzo && a.genzo.id === 'genzo_top', tag + 'later: you are left at the top with Genzō, the vane still stuck (' + JSON.stringify({ map: a.map, stage: a.stage, genzo: a.genzo && a.genzo.id }) + ')');
    const later = has(L1, /^Tell me when you're ready/);
    ok(later && later.map === 'sg.lighthouse_top', tag + 'he says so up there: "' + (later ? later.en : '(missing)') + '"');
    await p.waitForTimeout(400);
    await shot(p, 'before_' + V.name);
    const n0 = await nLines(p), t0 = await p.evaluate(() => window.__gz.transitions);
    await talkTo(p, 'genzo_top');
    const L2 = await linesSince(p, n0), b2 = await where(p), t1 = await p.evaluate(() => window.__gz.transitions);
    ok(L2.length && /^Can you write it\?/.test(L2[0].en) && !has(L2, /^You climb/) && !has(L2, /^The wind\?/) && t1 === t0, tag + 'asked again at the top: straight to "Can you write it?", no second climb (' + L2.length + ' lines, ' + (t1 - t0) + ' map changes)');
    ok(L2.every((l) => l.map === 'sg.lighthouse_top') && b2.stage === 7 && b2.cleared && b2.map === 'sg.lighthouse_top', tag + 'the vane turns and you are still at the top (' + JSON.stringify({ stage: b2.stage, map: b2.map }) + ')');
    // talked to after the wind: his own line up there
    const n1 = await nLines(p);
    await talkTo(p, 'genzo_top');
    const L3 = await linesSince(p, n1);
    ok(L3.length && L3.every((l) => l.who === 'genzo' && l.map === 'sg.lighthouse_top') && has(L3, /come with you/), tag + 'after the wind he says he will come down with you (' + L3.map((l) => l.en).join(' / ') + ')');

    // ---- 5. a save made at the top loads at the top, Genzō with you ------------------------------------------
    const saved = await p.evaluate(async () => { await RB.save.writeSlot(5, RB.game.s); return RB.save.validate(RB.util.deepClone(RB.game.s)); });
    await p.evaluate(async () => { await RB.game.transition('sg.harbor', 27, 20, 'down', { inScript: true }); await new Promise((r) => setTimeout(r, 400)); });
    const away = await where(p);
    await p.evaluate(async () => { await RB.game.loadCampaign(5); await new Promise((r) => setTimeout(r, 1000)); });
    const back = await where(p);
    ok(!away.up && away.map === 'sg.harbor', tag + 'leaving the top any other way brings him down too (' + JSON.stringify({ map: away.map, up: away.up }) + ')');
    ok(!saved.length && back.map === 'sg.lighthouse_top' && back.up && back.genzo && back.genzo.id === 'genzo_top' && back.stage === 7, tag + 'the save made at the top (valid: ' + JSON.stringify(saved) + ') loads there, with Genzō (' + JSON.stringify({ map: back.map, x: back.x, y: back.y, genzo: back.genzo && back.genzo.id }) + ')');
    const G = await gz(p), H = await harness(p);
    ok(!G.bad.length && !H.departures.some((d) => d.exit) && !H.extras.length && !H.absent.length, tag + 'later/again/save/load: one Genzō throughout, never at a door (' + G.samples + ' samples)' + (G.bad.length ? ': ' + G.bad.join(' | ') : ''));
    ok(!errors.length && !requests.length, tag + 'no page errors, no requests (later)' + (errors.length ? ' ' + errors[0] : '') + (requests.length ? ' ' + requests[0] : ''));
    await p.close();
  }

  // ---- 6. before the vane scene the stairs are only looked at ----------------------------------------------
  {
    const { p, errors } = await page(b, url, V.opts);
    await start(p, { x: 1, y: 3, dir: 'up' });
    await walk(p, 1, 3, 'up', 'sg.lighthouse', [1, 2]);
    const w = await where(p);
    ok(w.map === 'sg.lighthouse' && w.x === 1 && w.y === 2, tag + 'before Genzō has shown you the top, the stairs do not take you up (' + [w.map, w.x, w.y].join(' ') + ')');
    ok(!errors.length, tag + 'no page errors (stairs)');
    await p.close();
  }
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
