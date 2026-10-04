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
//   reduced motion;
// - the view from height (the owner's feedback: "more like an island surrounded by water"): past the
//   gallery is Saltglass itself far below, the harbour map drawn small — landmarks (the sea past the
//   point, the quay, the forest, the causeway) are found at their projected places in their own colours;
//   the stone shaft drops from the gallery's south edge to its foot in the town; the sea there is glassy
//   before the wind and has whitecaps after, the causeway's fog lifts below when the wind comes back (the
//   backdrop is patched, not rebuilt); the town shifts a little as you walk (parallax) but not with
//   reduced motion, when the sea holds still too; the backdrop is released when you leave;
// - the fire lookout (co.lookout, Chapter 3) gets the same: the festival village below at night with its
//   lanterns shining through the dark, the timber legs dropping to the lookout's foot, the village (not
//   the festival) once that evening is over; its bell and its way down work as before;
// - the "later" branch leaves you at the top with Genzō; talking to him there again does not climb again;
// - down the stairhead and back up by real movement: Genzō is back in his place downstairs (exactly once,
//   not fading in, not walking); the stairs lead up only once the vane scene has happened;
// - a save made at the top loads at the top with Genzō there;
// - no page errors, no requests off the test origin.
// Usage: node tests/e2e/lighthouse_top.mjs [--shots] [--slow]
//   --shots also writes docs/screenshots/lighthouse_top/*.webp and docs/screenshots/lookout/*.webp;
//   --slow runs the game's clock at a quarter
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
    s.chapter = o.chapter || 2;
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
    comp: W.comp ? { id: W.comp.id, d: Math.abs(W.comp.x - W.player.x) + Math.abs(W.comp.y - W.player.y), near: Math.max(Math.abs(W.comp.x - W.player.x), Math.abs(W.comp.y - W.player.y)) } : null,
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
async function shot(p, name, dir) {
  if (!SHOTS) return;
  const out = dir ? path.join(root, 'docs/screenshots', dir) : OUT;
  fs.mkdirSync(out, { recursive: true });
  const png = await p.screenshot();
  const webp = await p.evaluate(async (src) => {
    const im = new Image(); im.src = src; await im.decode();
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0);
    return c.toDataURL('image/webp', 0.82);
  }, 'data:image/png;base64,' + png.toString('base64'));
  fs.writeFileSync(path.join(out, name + '.webp'), Buffer.from(webp.split(',')[1], 'base64'));
  console.log('     wrote docs/screenshots/' + (dir || 'lighthouse_top') + '/' + name + '.webp');
}
const has = (lines, re) => lines.find((l) => re.test(l.en));

// The ground far below (src/engine/61_below.js). Landmarks of the ground map, each with the kind of
// colour it is drawn in; one is checked where it is visible (on screen, clear of the deck, its railing
// and the shaft): the backdrop's own colour there and the screen pixel at its projected place.
const KIND = {
  sea: (c) => c[2] > c[0] + 40 && c[2] >= c[1],
  sand: (c) => c[0] > 165 && c[1] > 155 && c[0] >= c[2],
  green: (c) => c[1] > c[0] + 12 && c[1] >= c[2],
  stone: (c) => Math.abs(c[0] - c[1]) < 26 && Math.abs(c[1] - c[2]) < 26 && c[0] > 110,
  warm: (c) => c[0] > c[2] + 18 && c[0] > 45,
  water: (c) => c[2] > c[0] + 15 && c[2] >= c[1] - 5,
};
// at night the deck's darkness lies over the ground below: on screen a landmark keeps its colour's
// leaning (warm stays warm, water stays blue), however dim
const NIGHT = { warm: (c) => c[0] > c[2] + 4 && c[0] > 25, water: (c) => c[2] > c[0] + 8 };
const TOP_MARKS = [['open sea to the west', 'sea', -28, 16], ['sea past the point', 'sea', -20, 20], ['sea by the point', 'sea', -6, 36], ['sea in the harbour', 'sea', 24, 37], ['the quay', 'stone', 26, 26.5], ['forest to the north', 'green', 30, -4], ['the causeway', 'sand', 8.5, 38]];
const LOOK_MARKS = [['the inn\'s roof', 'warm', 7, 11.6], ['the post house\'s roof', 'warm', 6, 21.6], ['the stage', 'warm', 23, 12.5], ['the terraces', 'warm', 10, 2], ['the orchard', 'warm', 6, 30], ['the terraces to the west', 'warm', 1, 1.5], ['the terraces to the east', 'warm', 30, 5], ['the channel', 'water', 34.5, 10]];
const below = (p, marks) => p.evaluate((marks) => {
  const st = RB.below.state(), W = RB.world.W, D = RB.below.deckOf(W.map);
  const a = RB.render.tileToCss(D.x0 - 1.2, D.y0 - 1.5), z = RB.render.tileToCss(D.x1 + 1.2, D.y1 + 1);
  const cv = document.getElementById('world');
  const g = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  g.canvas.width = cv.width; g.canvas.height = cv.height; g.drawImage(cv, 0, 0);
  const px = (x, y) => Array.from(g.getImageData(Math.round(x), Math.round(y), 1, 1).data.slice(0, 3));
  const inShaft = (x, y) => st.shaftTop && y >= st.shaftTop.y - 4 && y <= st.shaftFoot.y + 30 && x >= Math.min(st.shaftTop.x0, st.shaftFoot.x0) - 30 && x <= Math.max(st.shaftTop.x1, st.shaftFoot.x1) + 60;
  const rows = marks.map(([name, kind, gx, gy]) => {
    const q = RB.below.project(gx, gy), mini = RB.below.sample(gx, gy);
    const visible = !!(q && mini && q.x > 10 && q.y > 10 && q.x < cv.width - 10 && q.y < cv.height - 10 && !(q.x > a.x && q.x < z.x && q.y > a.y && q.y < z.y) && !inShaft(q.x, q.y));
    return { name, kind, at: q && [Math.round(q.x), Math.round(q.y)], mini, scr: visible ? px(q.x, q.y) : null, visible };
  });
  // the shaft: down its middle, and beside it at the same height
  let shaft = null;
  if (st.shaftTop) {
    const y = st.shaftTop.y + (st.shaftFoot.y - st.shaftTop.y) * 0.62, k = 0.62;
    const xl = st.shaftTop.x0 + (st.shaftFoot.x0 - st.shaftTop.x0) * k, xr = st.shaftTop.x1 + (st.shaftFoot.x1 - st.shaftTop.x1) * k;
    if (y < cv.height - 2) shaft = { y: Math.round(y), mid: px((xl + xr) / 2 - (xr - xl) * 0.2, y), beside: px(Math.max(2, xl - 40), y), inView: st.shaftFoot.y < cv.height };
  }
  return { st, rows, shaft };
}, marks);
const fmt = (r) => r.name + (r.visible ? ' ' + r.kind + ' ' + r.scr : ' (not in view)');

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
    // (staged in the Ch1–2 pass: you write at the vane's side, at 7,4 facing right; before that, 8,5 facing up)
    ok(after.map === 'sg.lighthouse_top' && /^sg_vane/.test(after.front || ''), tag + 'the scene ends on the top, beside the vane and facing it (' + [after.map, after.x, after.y, after.dir, after.front].join(' ') + ')');
    ok(after.stage === 7 && after.cleared && after.up, tag + 'the quest moved on, the fog is cleared, Genzō is up there (' + JSON.stringify({ stage: after.stage, cleared: after.cleared, up: after.up }) + ')');
    ok(after.genzo && after.genzo.id === 'genzo_top' && after.genzo.x === 9 && after.genzo.y === 5 && after.genzo.alpha === 1, tag + 'Genzō is beside you at the top (' + JSON.stringify(after.genzo) + ')');
    await p.waitForTimeout(700);
    const pet = (await where(p)).pet;
    // (beside you, a diagonal included: the staging puts them out from under the dialogue box on this small roof)
    ok(after.comp && after.comp.id === 'mio' && after.comp.near <= 1, tag + 'your companion came up with you (' + JSON.stringify(after.comp) + ')');
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

  // ---- 2. the vane, and Saltglass far below, by their pixels -------------------------------------------------
  {
    const { p, errors } = await page(b, url, V.opts);
    // the top, before the wind: nobody near the vane, no quest marks
    await start(p, { map: 'sg.lighthouse_top', comp: null, x: 2, y: 6, dir: 'down', follow: '-' });
    const box = await vaneBox(p);
    const v0 = await pixels(p, box, 2400, 150);
    ok(v0.ink > 0.12 && v0.warm > 0.02, tag + 'the vane is drawn, rust on it (' + Math.round(v0.ink * 100) + '% iron and groove, ' + Math.round(v0.warm * 100) + '% rust in its box)');
    ok(v0.pics === 1, tag + 'stuck: one picture of it in 2.4 s (' + v0.pics + ')');
    const B0 = await below(p, TOP_MARKS), ph = B0.st.phases || {};
    console.log('     cold build of the backdrop: ' + B0.st.lastMs + ' ms (tiles ' + ph.tiles + ', props and buildings ' + ph.things + ', shrink ' + ph.shrink + '; ' + (ph.size || []).join('×') + ' ground tiles)');
    ok(B0.st.active && B0.st.ground === 'sg.harbor' && B0.st.cached === 1 && B0.st.builds >= 1, tag + 'past the gallery is the harbour map itself, drawn small (built once, ' + B0.st.lastMs + ' ms)');
    const vis0 = B0.rows.filter((r) => r.visible);
    ok(vis0.length >= 2 && vis0.every((r) => KIND[r.kind](r.mini) && KIND[r.kind](r.scr)), tag + 'landmarks at their places below: ' + B0.rows.map(fmt).join('; '));
    const sh = B0.shaft;
    ok(sh && sh.inView && KIND.stone(sh.mid) && Math.abs(sh.mid[0] - sh.beside[0]) + Math.abs(sh.mid[1] - sh.beside[1]) + Math.abs(sh.mid[2] - sh.beside[2]) > 40, tag + 'the stone shaft drops from the gallery to its foot in the town (' + JSON.stringify(sh) + ')');
    // the sea's own life, near a piece of sea in view
    const seaMark = vis0.find((r) => r.kind === 'sea');
    const R0 = await p.evaluate(() => ({ W: innerWidth, H: innerHeight }));
    const seaBox = seaMark && { x: Math.max(4, Math.min(R0.W - 124, seaMark.at[0] - 60)), y: Math.max(4, Math.min(R0.H - 124, seaMark.at[1] - 60)), w: 120, h: 120 };
    const s0 = seaBox && await pixels(p, seaBox, 2600, 130);
    ok(s0 && KIND.sea(s0.mean) && s0.caps === 0 && s0.pics >= 2, tag + 'the sea below is glassy before the wind: its glints come and go, no whitecaps (' + (s0 ? s0.mean + ', ' + s0.pics + ' pictures, ' + s0.caps + ' whitecap px' : 'no sea in view') + ')');
    const fog0 = await p.evaluate(() => RB.below.sample(8.5, 39));
    // the wind is back: the vane turns, the sea breaks, the fog lifts off the causeway below
    await p.evaluate(() => { RB.game.s.flags.sg_fog_cleared = true; RB.world.refreshActors(); });
    await p.waitForTimeout(300);
    const v1 = await pixels(p, box, 3200, 120), s1 = seaBox && await pixels(p, seaBox, 2600, 130);
    const B1 = await below(p, TOP_MARKS), fog1 = await p.evaluate(() => RB.below.sample(8.5, 39));
    ok(v1.ink > 0.12 && v1.warm < v0.warm, tag + 'free: still drawn, the rust gone from it (' + Math.round(v1.ink * 100) + '% iron, ' + Math.round(v1.warm * 100) + '% rust)');
    ok(v1.pics >= 3, tag + 'free: it swings — ' + v1.pics + ' different pictures in 3.2 s');
    ok(s1 && KIND.sea(s1.mean) && s1.caps > 0 && s1.pics >= 2, tag + 'the sea below with the wind back: small whitecaps (' + (s1 ? s1.caps + ' px, ' + s1.pics + ' pictures' : '-') + ')');
    ok(B1.st.patches >= 1 && B1.st.builds === B0.st.builds && B1.st.lastPatchMs < 200 && (fog0 == null || fog1 == null || fog0.join() !== fog1.join()), tag + 'the causeway\'s fog lifts below: the backdrop patched where it changed (' + B1.st.lastPatchMs + ' ms), not rebuilt; the causeway ' + JSON.stringify(fog0) + ' → ' + JSON.stringify(fog1));
    // parallax: the town shifts a little as you walk, not at all with reduced motion
    const f0 = (await below(p, [])).st.foot;
    await p.evaluate(() => { RB.test.place(9, 6, 'down'); });
    await p.waitForTimeout(250);
    const f1 = (await below(p, [])).st.foot;
    ok(Math.abs(f1.x - f0.x) >= 4 && Math.abs(f1.x - f0.x) < 120, tag + 'parallax: walking across the gallery shifts the town below a little (' + Math.round(f1.x - f0.x) + ' css px)');
    await p.evaluate(() => { RB.game.settings.reducedMotion = true; RB.game.applySettings(); RB.test.place(2, 6, 'down'); });
    await p.waitForTimeout(250);
    const f2 = (await below(p, [])).st.foot;
    await p.evaluate(() => { RB.test.place(9, 6, 'down'); });
    await p.waitForTimeout(250);
    const f3 = (await below(p, [])).st.foot;
    ok(f2.x === f3.x && f2.y === f3.y, tag + 'reduced motion: the town below stays put as you walk (' + JSON.stringify([f2, f3]) + ')');
    await p.evaluate(() => { RB.test.place(2, 6, 'down'); });
    await p.waitForTimeout(200);
    const v2 = await pixels(p, box, 2400, 150), s2 = seaBox && await pixels(p, seaBox, 2000, 150);
    ok(v2.pics === 1 && v2.ink > 0.12, tag + 'reduced motion: the vane is held still (' + v2.pics + ' picture in 2.4 s)');
    ok(s2 && s2.pics === 1 && s2.caps > 0, tag + 'reduced motion: the sea below is held still too, whitecaps and all (' + (s2 ? s2.pics : '-') + ' picture)');
    // leaving releases it
    await p.evaluate(async () => { await RB.game.transition('sg.lighthouse', 1, 3, 'down', { inScript: true }); await new Promise((r) => setTimeout(r, 300)); });
    const gone = (await p.evaluate(() => RB.below.state()));
    ok(gone.cached === 0 && gone.released >= 1 && !gone.active, tag + 'down in the room the backdrop is released (' + JSON.stringify({ cached: gone.cached, released: gone.released }) + ')');
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

  // ---- 7. the fire lookout: the village far below at night ------------------------------------------------
  {
    const { p, errors, requests } = await page(b, url, V.opts);
    const LOOK = { ch1_done: true, departed: true, ch2_done: true, co_arrived: true, co_met_sayo: true, co_firebreak_cut: true, co_bell_done: true, co_kiln_done: true };
    await start(p, { map: 'co.lookout', x: 7, y: 6, dir: 'up', base: LOOK, chapter: 3, comp: 'mio', follow: '-' });
    const B = await below(p, LOOK_MARKS), ph = B.st.phases || {};
    console.log('     cold build of the backdrop: ' + B.st.lastMs + ' ms (tiles ' + ph.tiles + ', props and buildings ' + ph.things + ', shrink ' + ph.shrink + '; ' + (ph.size || []).join('×') + ' ground tiles)');
    ok(B.st.active && B.st.ground === 'co.festival', tag + 'lookout: below is the village on the festival night, drawn small (' + B.st.ground + ', ' + B.st.lastMs + ' ms)');
    const vis = B.rows.filter((r) => r.visible);
    ok(vis.length >= 2 && vis.every((r) => KIND[r.kind](r.mini) && NIGHT[r.kind](r.scr)), tag + 'lookout: landmarks at their places below: ' + B.rows.map(fmt).join('; '));
    // the lanterns shine through the night
    const lit = await p.evaluate(() => {
      const cv = document.getElementById('world'), g = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      g.canvas.width = cv.width; g.canvas.height = cv.height; g.drawImage(cv, 0, 0);
      let n = 0, seen = 0;
      for (const [x, y] of RB.below.state().lights) {
        const q = RB.below.project(x, y);
        if (!q || q.x < 4 || q.y < 4 || q.x > cv.width - 4 || q.y > cv.height - 4) continue;
        seen++;
        const d = g.getImageData(Math.round(q.x) - 2, Math.round(q.y) - 2, 4, 4).data;
        let best = 0;
        for (let i = 0; i < d.length; i += 4) if (d[i] > d[i + 2] + 40) best = Math.max(best, d[i]);
        if (best > 200) n++;
      }
      return { n, seen };
    });
    ok(lit.seen >= 3 && lit.n >= Math.min(3, lit.seen) && lit.n >= lit.seen * 0.6, tag + 'lookout: the lanterns and lit windows below shine through the dark (' + lit.n + ' of ' + lit.seen + ' in view bright and warm)');
    // the timber legs: along the front-left leg, against the ground beside it
    const leg = await p.evaluate(() => {
      const L = RB.below.state().legs && RB.below.state().legs[0], cv = document.getElementById('world');
      if (!L) return null;
      const g = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      g.canvas.width = cv.width; g.canvas.height = cv.height; g.drawImage(cv, 0, 0);
      const out = [];
      for (const k of [0.55, 0.7, 0.85]) {
        const x = L.x0 + (L.x1 - L.x0) * k, y = L.y0 + (L.y1 - L.y0) * k;
        if (y > cv.height - 2) continue;
        const on = Array.from(g.getImageData(Math.round(x), Math.round(y), 1, 1).data.slice(0, 3)), off = Array.from(g.getImageData(Math.round(x) - 9, Math.round(y), 1, 1).data.slice(0, 3));
        out.push({ on, off, d: Math.abs(on[0] - off[0]) + Math.abs(on[1] - off[1]) + Math.abs(on[2] - off[2]) });
      }
      return out;
    });
    ok(leg && leg.length >= 2 && leg.filter((q) => q.d > 24 && q.on[0] > q.on[2]).length >= 2, tag + 'lookout: its timber legs drop from the platform to its foot in the village (' + JSON.stringify(leg) + ')');
    await shot(p, 'festival_' + V.name, 'lookout');
    // nothing to do with the platform has changed: its bell, its fences, its one way down
    const geo = await p.evaluate(() => { const m = RB.world.W.map; return { exits: m.exits.length, triggers: m.triggers.map((t) => [t.x, t.y, t.scene, t.if]), scenes: m.def.props.filter((q) => q.scene).map((q) => q.p + '@' + q.x + ',' + q.y), walk: [...Array(m.w * m.h).keys()].filter((i) => !RB.maps.blockedStatic(m, i % m.w, (i / m.w) | 0)).length }; });
    ok(geo.exits === 0 && JSON.stringify(geo.triggers) === JSON.stringify([[10, 7, 'co.lookout_down', 'ch3_done']]) && JSON.stringify(geo.scenes) === JSON.stringify(['bell@7,3']) && geo.walk === 22, tag + 'lookout: the platform is as it was (' + JSON.stringify(geo) + ')');
    const n0 = await p.evaluate(() => RB.game.s.backlog.length);
    await p.evaluate(async () => { await RB.test.use(7, 3); });
    const bell = await p.evaluate((n0) => RB.game.s.backlog.slice(n0).map((e) => e.en || ''), n0);
    ok(bell.some((t) => /The lookout bell/.test(t)) && (await p.evaluate(() => RB.world.W.map.id)) === 'co.lookout', tag + 'lookout: the bell is looked at as before (' + bell.length + ' lines)');
    // once that evening is over, the village as it is
    await p.evaluate(() => { const s = RB.game.s; s.flags.ch3_done = true; s.seen['co.reflection'] = true; });
    await p.waitForTimeout(400);
    const B2 = await below(p, LOOK_MARKS);
    ok(B2.st.ground === 'co.village' && B2.rows.filter((r) => r.visible).length >= 2, tag + 'lookout: after the festival night, the village below (' + B2.st.ground + ')');
    await shot(p, 'village_' + V.name, 'lookout');
    // and down, by the way down (the trigger on the hatch, as before)
    const down = await walk(p, 9, 7, 'right', 'co.village', [12, 14]);
    const after = await p.evaluate(() => ({ map: RB.world.W.map.id, x: RB.world.W.player.x, y: RB.world.W.player.y, below: RB.below.state() }));
    ok(down && after.map === 'co.village' && after.below.cached === 0 && !after.below.active, tag + 'lookout: climbing down still works, and the backdrop is released (' + JSON.stringify({ map: after.map, x: after.x, y: after.y, cached: after.below.cached }) + ')');
    ok(!errors.length && !requests.length, tag + 'lookout: no page errors, no requests' + (errors.length ? ' ' + errors[0] : '') + (requests.length ? ' ' + requests[0] : ''));
    await p.close();
  }
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
