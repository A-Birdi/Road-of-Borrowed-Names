// Props and environment balance (the paired addendum §9, §12.4; docs/expressive/CONTRACT.md WI18, WI27, §3.10),
// in the BUILT game, headless Chromium, synthetic campaigns (RB.game.debugStart) in a fresh profile.
// Props should support life without outclassing people; important props should read clearly; ambience should
// be intentional. Four parts:
//  1. Every prop kind placed in an authored map or in the Unwritten Atlas (three fixed seeds), for every option
//     set it is placed with, drawn alone over 12 s at 40 ms steps: how often it changes, how much of it changes,
//     how bright it is; with reduced motion it holds one frame. Checked against the balance policy:
//     - lamps (paper or glass over a flame: the kinds drawn with RB.propArt.kit.flick) hold steady and dip about
//       twice a second (at most 3 changes a second); the great lamp of Snowbell, the chapter's subject, keeps its
//       lively flame (5 or more);
//     - the campfire, Hiro's furnace and the lighthouse lens are calmer than before (limits below);
//     - every `sparkle` without a scene or text (scenery, not something to find) is the faint kind with no pool
//       of light (o.faint, o.lit === false), changes at most 1.5 times a second and is smaller than a pickup's.
//  2. Props that follow the story drawn in both states: Asahi's furnace is cold before the ash arrives
//     (sg_boss_done) and lit and turning slowly after; the lighthouse lens is small and dim until the oil arrives;
//     Nobu's kiln shows embers, not an open fire; the old workshop row's kiln is choked with ash (no glass-seal
//     mark), while the Great Kiln keeps its seal until opened.
//  3. Readability: at representative places of every chapter, the Atlas and Koharuno, each interactable prop on
//     screen (a scene or a text) is drawn with and without it at the same instant; how far its pixels stand from
//     the ground behind them: the mean channel difference, and the share of its pixels that differ from the
//     ground by more than a quarter of the ground's own brightness (sum of channels + 90, so a dark room is not
//     penalised for being dark); its contact shadow counts as its pixels. The lowest are
//     listed; the potter's wheel (its text: the clay is still damp) must stand apart from its floor.
//  4. With --places: how the on-screen motion splits between people (and animals) and the environment (props,
//     animated tiles, lights; the weather counted apart), 6 s each with and 6 s without the weather, at the
//     same places, printed (timing-sensitive on a shared machine, so reported, not asserted).
// Writes a JSON report with --report <file>. Usage:
//   node tests/e2e/props_balance.mjs [--html index.html] [--places] [--only place,place] [--report out.json]
import fs from 'node:fs';
import { serve, launch, page } from './lib.mjs';

const argv = process.argv.slice(2);
const arg = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
const HTML = arg('--html', 'index.html');
const PLACES_ON = argv.includes('--places');
const REPORT = arg('--report', null);
const ONLY = arg('--only', null); // places: a comma-separated list of names
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const report = {};

const { srv, url } = await serve();
const b = await launch();

// ---- 1. every placed kind ----------------------------------------------------------------------------------
{
  const { p, errors, ctx } = await page(b, url + HTML);
  const kinds = await p.evaluate(() => {
    const C = RB.content;
    const uses = {};
    const scan = (id) => { const m = RB.maps.compile(id); for (const q of m.props) (uses[q.p] = uses[q.p] || []).push({ map: id, x: q.x, y: q.y, o: q.o || null, region: m.region, use: !!(q.scene || q.text) }); };
    for (const id of Object.keys(C.maps)) scan(id);
    for (const seed of [11, 4242, 90001]) {
      const s = RB.state.newCampaign({}); s.id = 'props-' + seed;
      const run = RB.atlas.newRun(s, [], { seed }); run.started = 0;
      const built = RB.atlas.buildMaps(run);
      for (const id in built.maps) { C.maps[id] = built.maps[id]; RB.maps.invalidate(); try { scan(id); } catch (e) { /* a room that does not compile alone */ } delete C.maps[id]; }
      RB.maps.invalidate();
    }
    const groups = [];
    for (const kind of Object.keys(uses).sort()) {
      const seen = {};
      for (const u of uses[kind]) { const k = JSON.stringify(u.o || {}); if (!seen[k]) { seen[k] = 1; groups.push([kind, u, k]); } }
    }
    const W = 640, H = 640, OX = 224, OY = 400;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d', { willReadFrequently: true });
    const out = [];
    for (const [kind, u, okey] of groups) {
      const pd = RB.props.P[kind];
      const n = uses[kind].filter((q) => JSON.stringify(q.o || {}) === okey).length;
      if (!pd || !pd.draw2) { out.push({ kind, o: okey, n, noArt: true }); continue; }
      const pal = RB.tiles.PAL[u.region] || RB.tiles.PAL.reedwake;
      const draw = (t, still) => { c.clearRect(0, 0, W, H); pd.draw2(c, OX, OY, pal, t, Object.assign({ cx: u.x, cy: u.y, still }, u.o || {})); };
      let x0 = W, y0 = H, x1 = 0, y1 = 0;
      for (const t of [1, 333, 777, 1500, 2600, 4100]) {
        draw(t, false);
        const d = c.getImageData(0, 0, W, H).data;
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      }
      if (x1 < x0) { out.push({ kind, o: okey, n, empty: true }); continue; }
      x0 = Math.max(0, x0 - 4); y0 = Math.max(0, y0 - 4); x1 = Math.min(W - 1, x1 + 4); y1 = Math.min(H - 1, y1 + 4);
      const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
      const DUR = 12000, STEP = 40;
      let prev = null, changes = 0, changedPx = 0, opaque = 0, bright = 0, maxBright = 0;
      const hashes = new Set();
      for (let t = 1; t <= DUR; t += STEP) {
        draw(t, false);
        const d = c.getImageData(x0, y0, bw, bh).data;
        let hsh = 0, br = 0;
        for (let i = 0; i < d.length; i += 4) {
          hsh = (hsh * 31 + d[i] * 7 + d[i + 1] * 13 + d[i + 2] * 17 + d[i + 3]) | 0;
          if (d[i + 3] > 128 && (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) > 204) br++;
        }
        hashes.add(hsh);
        if (br > maxBright) maxBright = br;
        if (t === 1) for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 128) { opaque++; if ((0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) > 204) bright++; }
        if (prev) {
          let ch = 0;
          for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - prev[i]) + Math.abs(d[i + 1] - prev[i + 1]) + Math.abs(d[i + 2] - prev[i + 2]) + Math.abs(d[i + 3] - prev[i + 3]) > 24) ch++;
          if (ch) { changes++; changedPx += ch; }
        }
        prev = d;
      }
      const still = new Set();
      for (const t of [1, 400, 1300, 2900, 5100, 7700]) { draw(t, true); const d = c.getImageData(x0, y0, bw, bh).data; let hsh = 0; for (let i = 0; i < d.length; i += 4) hsh = (hsh * 31 + d[i] + d[i + 1] * 3 + d[i + 2] * 5 + d[i + 3] * 7) | 0; still.add(hsh); }
      out.push({
        kind, o: okey, n, maps: [...new Set(uses[kind].map((q) => q.map))].length, first: u.map, w: bw, h: bh, opaque,
        distinct: hashes.size, chPerS: +(changes / (DUR / 1000)).toFixed(2), pxPerS: Math.round(changedPx / (DUR / 1000)),
        meanFrac: changes ? +((changedPx / changes) / Math.max(1, opaque)).toFixed(3) : 0, brightFrac: +(bright / Math.max(1, opaque)).toFixed(3), maxBright,
        stillOk: still.size === 1,
      });
    }
    // decor sparkles: every sparkle placement and whether it is something to find
    const sparkles = [];
    for (const id of Object.keys(C.maps)) for (const q of C.maps[id].props || []) if (q.p === 'sparkle') sparkles.push({ map: id, x: q.x, y: q.y, use: !!(q.scene || q.text), faint: !!(q.o && q.o.faint), unlit: !!(q.o && q.o.lit === false) });
    return { out, sparkles };
  });
  report.kinds = kinds.out;
  const K = kinds.out.filter((r) => !r.noArt && !r.empty);
  const get = (kind, pred) => K.filter((r) => r.kind === kind && (!pred || pred(JSON.parse(r.o))));
  const anim = K.filter((r) => r.distinct > 1).sort((a, b2) => b2.pxPerS - a.pxPerS);
  console.log('     placed kinds × option sets: ' + kinds.out.length + ', animated: ' + anim.length);
  for (const r of anim) console.log('     ' + (r.kind + (r.o !== '{}' ? ' ' + r.o : '')).padEnd(44) + ' ' + String(r.chPerS).padStart(5) + '/s ' + String(r.pxPerS).padStart(6) + ' px/s  ' + String(Math.round(r.meanFrac * 100)).padStart(3) + '% of it  bright ' + Math.round(r.brightFrac * 100) + '%  (' + r.n + ' placed, ' + r.first + ')');
  ok(K.length > 150 && K.every((r) => r.stillOk), 'reduced motion: every placed prop kind holds one frame (' + K.length + ' kinds × option sets; ' + K.filter((r) => !r.stillOk).map((r) => r.kind).join(', ') + ')');
  const LAMPS = ['lantern', 'lamppost', 'shrine', 'pa_lamprack', 'co_glasslantern', 'sa_lamp', 'atlas_lamp', 'atlas_waystone'];
  const lamps = K.filter((r) => LAMPS.includes(r.kind) && r.distinct > 1);
  ok(lamps.length >= 6 && lamps.every((r) => r.chPerS <= 3), 'lamps hold steady and dip about twice a second (at most 3 changes/s): ' + lamps.map((r) => r.kind + ' ' + r.chPerS).join(', '));
  const lit = get('sb_greatlamp', (o) => o.lit);
  ok(lit.length && lit[0].chPerS >= 5, 'the great lamp of Snowbell keeps its lively flame (' + (lit[0] && lit[0].chPerS) + ' changes/s)');
  const fire = get('campfire')[0], furn = get('co_furnace')[0];
  ok(fire && fire.chPerS <= 8.5 && fire.distinct >= 6, 'the campfire is lively but calmer than 11 changes/s (' + (fire && fire.chPerS) + ')');
  ok(furn && furn.chPerS <= 4.5 && furn.distinct >= 3, 'the furnace mouth in Hiro\'s workshop throbs slowly (' + (furn && furn.chPerS) + ' changes/s, was 6.6)');
  const pick = get('sparkle', (o) => !o.faint)[0], faint = get('sparkle', (o) => o.faint)[0];
  ok(pick && faint && faint.chPerS <= 1.5 && faint.maxBright * 3 < pick.maxBright, 'a scenery glint is slower and smaller than a sparkle that marks something to find (' + (faint && faint.chPerS) + '/s, ' + (faint && faint.maxBright) + ' bright px against ' + (pick && pick.maxBright) + ')');
  const badSparkle = kinds.sparkles.filter((q) => !q.use && !(q.faint && q.unlit)).map((q) => q.map + ' ' + q.x + ',' + q.y);
  ok(kinds.sparkles.some((q) => q.use) && !badSparkle.length, 'every sparkle with no scene or text is the faint kind with no pool of light (' + kinds.sparkles.length + ' placed; ' + badSparkle.join('; ') + ')');
  ok(!errors.length, 'no page errors (kinds) ' + errors.join('; '));
  await ctx.close();
}

// ---- 2. props that follow the story -------------------------------------------------------------------------
{
  const { p, errors, ctx } = await page(b, url + HTML);
  const st = await p.evaluate(() => {
    const W = 640, H = 640, OX = 224, OY = 400;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d', { willReadFrequently: true });
    // the placement of that kind (at x, y) that shows in the campaign's state
    const place = (map, kind, x, y) => RB.maps.compile(map).props.find((q) => q.p === kind && (x == null || (q.x === x && q.y === y)) && (!q.if || RB.state.test(RB.game.s, q.if)));
    // warm pixels (fire), seal-glass pixels, distinct frames and changes per second over 6 s
    function look(map, kind, x, y, flags) {
      RB.game.s = RB.state.newCampaign({}); Object.assign(RB.game.s.flags, flags || {});
      const q = place(map, kind, x, y), m = RB.maps.compile(map);
      const pal = RB.tiles.PAL[m.region] || RB.tiles.PAL.reedwake;
      const draw = (t) => { c.clearRect(0, 0, W, H); RB.props.P[kind].draw2(c, OX, OY, pal, t, Object.assign({ cx: q.x, cy: q.y, still: false }, q.o || {})); return c.getImageData(0, 0, W, H).data; };
      let warm = 0, seal = 0, bright = 0, changes = 0, prev = null;
      const hs = new Set();
      for (let t = 1; t <= 6000; t += 40) {
        const d = draw(t);
        let h = 0, ch = 0;
        for (let i = 0; i < d.length; i += 4) {
          if (!d[i + 3]) continue;
          h = (h * 31 + d[i] + d[i + 1] * 3 + d[i + 2] * 5) | 0;
          if (prev && Math.abs(d[i] - prev[i]) + Math.abs(d[i + 1] - prev[i + 1]) + Math.abs(d[i + 2] - prev[i + 2]) > 24) ch++;
          if (t === 1) {
            if (d[i] > 200 && d[i + 1] > 110 && d[i + 2] < 140 && d[i + 3] > 200) warm++;
            if (Math.abs(d[i] - 0x8f) < 12 && Math.abs(d[i + 1] - 0xb8) < 12 && Math.abs(d[i + 2] - 0xb0) < 12) seal++;
            if (d[i + 3] > 200 && (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) > 215) bright++;
          }
        }
        if (ch) changes++;
        hs.add(h); prev = d;
      }
      return { warm, seal, bright, frames: hs.size, chPerS: +(changes / 6).toFixed(2) };
    }
    return {
      furnaceBefore: look('sg.glass', 'kiln', null, null, {}),
      furnaceAfter: look('sg.glass', 'kiln', null, null, { sg_boss_done: true }),
      lensBefore: look('sg.lighthouse', 'sg_lens', null, null, {}),
      lensAfter: look('sg.lighthouse', 'sg_lens', null, null, { sg_boss_done: true }),
      nobu: look('co.village', 'kiln', 47, 21, {}),
      ashKiln: look('co.oldworks', 'kiln', 11, 3, {}),
      greatSealed: look('co.kiln', 'kiln', 18, 2, {}),
      greatOpen: look('co.kiln', 'kiln', 18, 2, { co_kiln_open: true }),
    };
  });
  report.story = st;
  console.log('     ' + JSON.stringify(st));
  ok(st.furnaceBefore.warm < 10 && st.furnaceBefore.frames === 1, 'Asahi\'s furnace is cold before the ash arrives ("The fire is out"): ' + st.furnaceBefore.warm + ' warm px, still');
  ok(st.furnaceAfter.warm > 120 && st.furnaceAfter.frames >= 6 && st.furnaceAfter.chPerS <= 4, 'and lit after, the gather turning slowly ("Orange glass turns slowly"): ' + st.furnaceAfter.warm + ' warm px, ' + st.furnaceAfter.frames + ' frames, ' + st.furnaceAfter.chPerS + ' changes/s');
  ok(st.lensBefore.bright * 2 < st.lensAfter.bright && st.lensAfter.chPerS <= 4.2, 'the lighthouse lens is small and dim while the oil is rationed (' + st.lensBefore.bright + ' bright px, then ' + st.lensAfter.bright + '), and glows rather than blinks (' + st.lensAfter.chPerS + ' changes/s)');
  ok(st.nobu.warm * 5 < st.greatOpen.warm && st.nobu.frames === 1 && st.nobu.warm > 0, 'Nobu\'s kiln ("still faintly warm") shows a few embers, not an open fire (' + st.nobu.warm + ' warm px against ' + st.greatOpen.warm + ')');
  ok(st.ashKiln.seal === 0 && st.ashKiln.warm < 10, 'the old workshop row\'s kiln is choked with ash, without the Great Kiln\'s glass-seal mark (' + st.ashKiln.seal + ' seal px)');
  ok(st.greatSealed.seal > 20 && st.greatSealed.warm < 10 && st.greatOpen.warm > 120 && st.greatOpen.seal === 0, 'the Great Kiln keeps its seal until it is opened, then glows (' + st.greatSealed.seal + ' seal px; then ' + st.greatOpen.warm + ' warm px)');
  ok(!errors.length, 'no page errors (story states) ' + errors.join('; '));
  await ctx.close();
}

// ---- 3 and 4. places: readability of the props you use; motion split ------------------------------------------
const F1 = { rw_arrived: true, rw_road_lit: true, rw_echo_done: true, departed: true, rw_lantern_s: true, rw_lantern_b: true };
const F2 = { rw_arrived: true, rw_road_lit: true, departed: true, ch1_done: true };
const F3 = { ch1_done: true, ch2_done: true, departed: true };
const F4 = { ch1_done: true, ch2_done: true, ch3_done: true, departed: true };
const F5 = { ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, departed: true, lf_town_intro: true };
const F6 = { ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, ch5_done: true, departed: true, sa_descent: true, end_kasane_trial: true };
// [name, kind of place, map, x, y, flags]
const PLACES = [
  ['rw_village', 'town square', 'rw.village', 22, 16, F1], ['rw_tea', 'shop', 'rw.tea', 4, 6, F1], ['rw_hall', 'interior', 'rw.hall', 5, 7, F1],
  ['rw_road', 'roadside', 'rw.road', 14, 10, F1], ['rw_millroad', 'mill', 'rw.millroad', 12, 8, F1], ['rw_mill1', 'mill', 'rw.mill1', 7, 9, F1],
  ['sg_harbor', 'harbour', 'sg.harbor', 28, 26, F2], ['sg_glass', 'workshop', 'sg.glass', 5, 7, F2], ['sg_inn', 'inn', 'sg.inn', 6, 8, F2],
  ['sg_office', 'interior', 'sg.office', 5, 7, F2], ['sg_lighthouse', 'interior', 'sg.lighthouse', 4, 8, F2], ['sg_da_entry', 'archive', 'sg.da_entry', 12, 12, F2],
  ['co_village', 'town square', 'co.village', 26, 20, F3], ['co_glass', 'workshop', 'co.glass', 6, 8, F3], ['co_pottery', 'workshop', 'co.pottery', 5, 7, F3],
  ['co_lookout', 'view from height', 'co.lookout', 7, 6, F3], ['co_oldworks', 'dungeon', 'co.oldworks', 12, 6, F3],
  ['sb_road', 'roadside', 'sb.road', 10, 12, F4], ['sb_hamlet', 'town square', 'sb.hamlet', 22, 18, F4], ['sb_inn', 'inn', 'sb.inn', 8, 9, F4],
  ['lf_town', 'town square', 'lf.town', 26, 20, F5], ['lf_bakery', 'shop', 'lf.bakery', 3, 6, F5], ['lf_gardens', 'quest', 'lf.gardens', 27, 14, F5], ['lf_records', 'interior', 'lf.records', 8, 9, F5],
  ['sa_camp', 'camp', 'sa.camp', 14, 12, F6], ['sa_reading', 'archive', 'sa.reading', 14, 14, F6], ['sa_conduits', 'archive', 'sa.conduits', 12, 9, F6],
  ['lq_koharu', 'quest', 'lq.koharu', 22, 12, F5], ['atlas', 'atlas', '@atlas', 0, 0, { post: true }],
];
const contrast = [], motion = [];
for (const [name, kindOf, map0, x0, y0, flags] of PLACES) {
  if (ONLY && !ONLY.split(',').includes(name)) continue;
  const { p, errors, ctx } = await page(b, url + HTML, { viewport: { width: 1280, height: 800 } });
  const r = await p.evaluate(async ([map, x, y, flags, doMotion]) => {
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    if (map === '@atlas') {
      RB.game.debugStart('rw.hall', 5, 5, { comp: 'mio', flags });
      RB.game.settings.textSpeed = 'instant';
      RB.atlas._debug.flags.seed = 4242; RB.atlas._debug.flags.chooseMod = 0;
      RB.hooks.atlas_start([], {});
      for (let i = 0; i < 80 && !/^atlas\./.test(RB.world.W.map.id); i++) { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); await sleep(60); }
      map = RB.world.W.map.id; x = RB.world.W.player.x; y = RB.world.W.player.y;
    } else {
      RB.game.debugStart(map, x, y, { comp: 'mio', flags, dir: 'down' });
      for (const ev of RB.content.maps[map].onEnter || []) RB.game.s.flags['enter:' + map + ':' + ev.scene] = true;
    }
    // the creatures that patrol a dungeon are not props, and touching one would start a battle
    const calm = () => { if (RB.world.W.foes) RB.world.W.foes.length = 0; };
    calm();
    RB.game.settings.textSpeed = 'instant';
    await sleep(300);
    for (let i = 0; i < 60 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await sleep(40); }
    if (RB.world.W.map.id !== map) RB.world.enter(map, x, y, 'down');
    calm();
    await sleep(1200);
    const battle = !!(RB.game.inBattle && RB.game.inBattle());
    const cv = document.querySelector('canvas');
    const W = cv.width, H = cv.height, k = W / innerWidth;
    const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H;
    const tc = tmp.getContext('2d', { willReadFrequently: true });
    const grab = () => { tc.drawImage(cv, 0, 0); return tc.getImageData(0, 0, W, H).data; };
    const m = RB.world.W.map;
    // 3. each interactable prop on screen, with and without it, at one instant (its own light kept off in both;
    // no weather while measuring: the particles move on every draw)
    const out = [];
    const keep = [m.def.ambient, (m.def.alt || []).map((a) => a.ambient)];
    const noWeather = (o) => (o ? Object.assign({}, o, { weather: null }) : o);
    m.def.ambient = noWeather(m.def.ambient); (m.def.alt || []).forEach((a) => { a.ambient = noWeather(a.ambient); });
    const t0 = performance.now();
    for (const q of m.props) {
      if (!(q.scene || q.text) || (q.if && !RB.state.test(RB.game.s, q.if))) continue;
      const pd = RB.props.P[q.p];
      if (!pd || !pd.draw2) continue;
      const a = RB.render.tileToCss(q.x, q.y), a2 = RB.render.tileToCss(q.x + (pd.w || 1), q.y + (pd.h || 1));
      if (a.x < 0 || a.y < 40 || a2.x > innerWidth || a2.y > innerHeight - 10) continue;
      const light = pd.light, cond = q.if;
      // nobody in the picture while measuring (an idle pose could cross the prop at that instant)
      const Wd = RB.world.W, crowd = [Wd.npcs, Wd.extras, Wd.leavers, Wd.comp];
      Wd.npcs = []; Wd.extras = []; Wd.leavers = []; Wd.comp = null;
      pd.light = 0;
      RB.render.frame(t0); const A = grab();
      q.if = '__props_balance_hidden__';
      RB.render.frame(t0); const B = grab();
      q.if = cond; pd.light = light;
      [Wd.npcs, Wd.extras, Wd.leavers, Wd.comp] = crowd;
      let n = 0, sum = 0, apart = 0;
      const X0 = Math.max(0, Math.floor((a.x - 64) * k)), X1 = Math.min(W, Math.ceil((a2.x + 64) * k)), Y0 = Math.max(0, Math.floor((a.y - 160) * k)), Y1 = Math.min(H, Math.ceil((a2.y + 16) * k));
      for (let yy = Y0; yy < Y1; yy++) for (let xx = X0; xx < X1; xx++) {
        const i = (yy * W + xx) * 4;
        const dd = Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]);
        if (dd < 6) continue;
        n++; sum += dd; if (dd / (B[i] + B[i + 1] + B[i + 2] + 90) > 0.25) apart++;
      }
      if (n < 40) continue; // hidden behind someone or something
      out.push({ kind: q.p, x: q.x, y: q.y, px: n, mean: Math.round(sum / n / 3), apart: +(apart / n).toFixed(3), rect: [X0, Y0, X1 - X0, Y1 - Y0] });
    }
    m.def.ambient = keep[0]; (m.def.alt || []).forEach((a, i) => { a.ambient = keep[1][i]; });
    RB.render.frame(performance.now());
    if (!doMotion) return { map: m.id, battle, contrast: out };
    // 4. motion split, people and animals against everything else
    const actorMask = () => {
      const mk = new Uint8Array(W * H), Wd = RB.world.W;
      const list = [...Wd.npcs, ...(Wd.extras || []), ...(Wd.leavers || []), Wd.player].concat(Wd.comp ? [Wd.comp] : []);
      const ps = RB.petWorld && RB.petWorld.state(); if (ps && ps.shown && ps.fx != null) list.push({ fx: ps.fx, fy: ps.fy });
      for (const d of (RB.petWorld && RB.petWorld.WILD) || []) if (d.map === Wd.map.id && d.last) list.push({ fx: d.last.x, fy: d.last.y });
      for (const a of list) {
        const q0 = RB.render.tileToCss(a.fx - 0.35, a.fy - 1.5), q1 = RB.render.tileToCss(a.fx + 1.35, a.fy + 1.1);
        const x0 = Math.max(0, Math.floor(q0.x * k)), y0 = Math.max(0, Math.floor(q0.y * k)), x1 = Math.min(W, Math.ceil(q1.x * k)), y1 = Math.min(H, Math.ceil(q1.y * k));
        if (!(x1 > x0 && y1 > y0)) continue; // off screen (a negative end would make fill() count from the end)
        for (let yy = y0; yy < y1; yy++) mk.fill(1, yy * W + x0, yy * W + x1);
      }
      return mk;
    };
    const run = async (ms) => {
      let prev = grab(), people = 0, env = 0, n = 0;
      const t1 = performance.now();
      while (performance.now() - t1 < ms) {
        await sleep(100);
        const cur = grab(), am = actorMask();
        for (let i = 0, j = 0; i < cur.length; i += 4, j++) if (Math.abs(cur[i] - prev[i]) + Math.abs(cur[i + 1] - prev[i + 1]) + Math.abs(cur[i + 2] - prev[i + 2]) > 30) { if (am[j]) people++; else env++; }
        prev = cur; n++;
      }
      return { people: people / n, env: env / n };
    };
    const A = await run(6000);
    const saved = [m.def.ambient, (m.def.alt || []).map((a) => a.ambient)];
    const strip = (o) => (o ? Object.assign({}, o, { weather: null }) : o);
    m.def.ambient = strip(m.def.ambient); (m.def.alt || []).forEach((a) => { a.ambient = strip(a.ambient); });
    await sleep(300);
    const B = await run(6000);
    m.def.ambient = saved[0]; (m.def.alt || []).forEach((a, i) => { a.ambient = saved[1][i]; });
    const people = RB.world.W.npcs.filter((n) => { const q = RB.render.tileToCss(n.fx, n.fy); return q.x > -20 && q.y > -20 && q.x < innerWidth && q.y < innerHeight; }).length;
    return { map: m.id, battle, contrast: out, motion: { people, peoplePerFrame: Math.round(B.people), envPerFrame: Math.round(B.env), weatherPerFrame: Math.round(Math.max(0, A.env - B.env)), peopleShare: Math.round((100 * B.people) / Math.max(1, B.people + B.env)) } };
  }, [map0, x0, y0, flags, PLACES_ON]);
  for (const c of r.contrast) contrast.push(Object.assign({ place: name, kindOf, map: r.map }, c));
  if (r.motion) { motion.push(Object.assign({ place: name, kindOf, map: r.map }, r.motion)); console.log('     motion ' + name.padEnd(13) + ' ' + kindOf.padEnd(16) + ' people on screen ' + r.motion.people + ', px/frame: people ' + r.motion.peoplePerFrame + ', environment ' + r.motion.envPerFrame + ', weather ' + r.motion.weatherPerFrame + ' (people ' + r.motion.peopleShare + '%)'); }
  ok(!errors.length && !r.battle && (map0 !== '@atlas' || /^atlas\./.test(r.map)), 'place ' + name + ' (' + r.map + ', ' + r.contrast.length + ' props you can use on screen) without page errors ' + errors.join('; '));
  await ctx.close();
}
report.contrast = contrast; report.motion = motion;
contrast.sort((a, b2) => a.apart - b2.apart || a.mean - b2.mean);
console.log('     the props you can use that stand least apart from their ground (share of pixels apart, mean distance):');
for (const c of contrast.slice(0, 12)) console.log('       ' + (c.place + ' ' + c.kind + ' ' + c.x + ',' + c.y).padEnd(36) + ' ' + Math.round(c.apart * 100) + '%  ' + c.mean);
const find = (place, kind) => contrast.find((c) => c.place === place && c.kind === kind);
const pct = (c) => (c ? Math.round(c.apart * 100) + '% of its pixels, mean ' + c.mean : 'not measured');
if (!ONLY) ok(contrast.length >= 40, 'props you can use measured at the places (' + contrast.length + ')');
// thresholds between the build before this pass (wheel 40 %, order-slip table 30 %, harbourmaster's desk 35 %) and after
const wheel = find('co_pottery', 'co_wheel'), slip = find('co_pottery', 'smalltable'), omi = find('sg_office', 'desk');
if (!ONLY) ok(wheel && wheel.apart >= 0.45, 'the potter\'s wheel, its clay still damp, stands apart from the wood floor (' + pct(wheel) + ')');
if (!ONLY) ok(slip && slip.apart >= 0.35, 'the order slip shows on the pottery\'s small table, which its scene reads from (' + pct(slip) + ')');
if (!ONLY) ok(omi && omi.apart >= 0.4, 'the harbourmaster\'s desk shows its mountain of papers and three cold cups (' + pct(omi) + ')');

if (REPORT) fs.writeFileSync(REPORT, JSON.stringify(report, null, 1));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
