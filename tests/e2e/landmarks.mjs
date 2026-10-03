// The long-quest landmarks and the rooms redrawn with them, in the BUILT index.html
// (World review WR-04 and WR-05; docs/ART_DIRECTION.md §8 "Landmarks and the bakery").
//  - the four landmark props (the great persimmon of Koharuno, Kayo's young tree, the stone
//    of names, Chigusa's tea stall) have an art-resolution draw2 that renders without errors,
//    in their own region and in the real map;
//  - their footprints, blocking, placements, the blocking of the three maps they stand in and
//    the tiles you can use them from are exactly as recorded before the redraw
//    (tests/fixtures/landmarks_before.json, recorded from the build before it);
//  - the scenes still start from those tiles, through the real interact();
//  - Masaru's bakery: the order slips (lf.bakery_orders) and Masaru are reachable from the
//    door on foot, and every prop in the room is drawn at art resolution;
//  - the River Warehouse: the missing floorboard Nao warns about is drawn and blocks, and Nao
//    (rw.nao_first) and the crates (rw.crates) are still reachable from the door;
//  - the Star Stair path shows the observatory's dome: the camera may look one row above it.
// Usage: node tests/e2e/landmarks.mjs [--html path/inside/repo.html]
//        RECORD=1 node tests/e2e/landmarks.mjs --html <the build before the redraw>
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const FIX = path.join(root, 'tests/fixtures/landmarks_before.json');
const argv = process.argv.slice(2);
const htmlArg = argv.includes('--html') ? argv[argv.indexOf('--html') + 1] : null;
const RECORD = process.env.RECORD === '1';
let fails = 0, passes = 0;
const say = (ok, m) => { if (ok) passes++; else fails++; console.log((ok ? 'ok   ' : 'FAIL ') + m); };

const LANDMARKS = [
  { id: 'lq_kaki', map: 'lq.koharu', scene: 'lq.kh_tree' },
  { id: 'lq_namestone', map: 'lq.koharu', scene: 'lq.kh_stone' },
  { id: 'lq_teastall', map: 'sb.road', scene: 'lq.stall' },
  { id: 'lq_kaki_young', map: 'lf.gardens', scene: 'lq.kayo_tree' },
];
// a campaign at the start of chapter 5 (every earlier chapter done, the bell not yet rung)
const FX5 = {
  rw_arrived: true, rw_road_lit: true, rw_met_tsuru: true, rw_mill_open: true, rw_echo_done: true, bridge_fixed: true, rw_koji_back: true,
  rw_evening: true, rw_hall_gather: true, departed: true, ch1_done: true,
  sg_arrived: true, sg_harbor_seen: true, sg_boss_done: true, sg_returned: true, sg_main_done: true, sg_road_open_seen: true, ch2_done: true,
  co_restored: true, ch3_done: true, sb_arrived: true, sb_lamp_lit: true, ch4_done: true, lq_kh_seen: true,
};

// ---- in-page helpers (installed as window.LM; the game's CSP forbids eval) ----
function installLM() {
  const DIR = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
  window.LM = {
    start(map, x, y, dir, flags) {
      const s = RB.game.debugStart(map, x, y, { profile: 'E', flags, dir: dir || 'up' });
      s.learn.kanaKnown = 'both'; s.chapter = 5;
      return s;
    },
    // tiles reachable on foot from (x, y): static blocking and the people standing about
    reach(x, y) {
      const seen = new Set([x + ',' + y]), q = [[x, y]];
      while (q.length) {
        const [cx, cy] = q.shift();
        for (const d in DIR) {
          const nx = cx + DIR[d][0], ny = cy + DIR[d][1], k = nx + ',' + ny;
          if (seen.has(k) || RB.world.blocked(nx, ny, { ignorePlayer: true })) continue;
          seen.add(k); q.push([nx, ny]);
        }
      }
      return seen;
    },
    // What interact() starts from (x, y) facing dir (the scene is recorded, not played).
    tryAt(x, y, dir) {
      const ran = [];
      const run = RB.script.run, runInline = RB.script.runInline;
      RB.script.run = (id) => { ran.push(id); return Promise.resolve(); };
      RB.script.runInline = (lines) => { ran.push('inline:' + (lines[0] && lines[0].en || '').slice(0, 40)); return Promise.resolve(); };
      try { RB.test.place(x, y, dir); RB.world.interact(); } finally { RB.script.run = run; RB.script.runInline = runInline; }
      return ran[0] || null;
    },
    // Every tile next to a footprint you can reach from the spawn, and what using it from there starts.
    useTiles(px, py, pw, ph, from) {
      const R = LM.reach(from[0], from[1]), out = [];
      for (let y = py - 1; y <= py + ph; y++) for (let x = px - 1; x <= px + pw; x++) {
        const inside = x >= px && x < px + pw && y >= py && y < py + ph;
        if (inside || !R.has(x + ',' + y)) continue;
        for (const d in DIR) {
          const fx = x + DIR[d][0], fy = y + DIR[d][1];
          if (fx < px || fx >= px + pw || fy < py || fy >= py + ph) continue;
          out.push([x, y, d, LM.tryAt(x, y, d)]);
        }
      }
      return out.sort((a, b) => (a[1] - b[1]) || (a[0] - b[0]) || a[2].localeCompare(b[2]));
    },
    rows(m, fn) { const r = []; for (let y = 0; y < m.h; y++) { let s = ''; for (let x = 0; x < m.w; x++) s += fn(x, y) ? '#' : '.'; r.push(s); } return r; },
    // Render a prop's draw2 on its own (every option it is placed with, still and moving); count its pixels.
    renderProp(id, region, opts) {
      const pd = RB.props.P[id];
      const pal = RB.tiles.PAL[region] || RB.tiles.PAL.reedwake;
      const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256;
      const g = cv.getContext('2d');
      const res = [];
      for (const o of opts) for (const t of [0, 1234, 98765]) {
        g.clearRect(0, 0, 256, 256);
        let err = null;
        try { pd.draw2(g, 96, 128, pal, t, Object.assign({ cx: 3, cy: 4 }, o)); } catch (e) { err = String(e); }
        const d = g.getImageData(0, 0, 256, 256).data;
        let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
        for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 0) { n++; const x = (i >> 2) % 256, y = (i >> 2) >> 8; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
        res.push({ o, t, err, n, box: [x0 - 96, y0 - 128, x1 - 96, y1 - 128] });
      }
      return res;
    },
  };
  window.LM.OPP = OPP;
}

const { srv, url } = await serve();
const b = await launch();
const target = url + (htmlArg ? htmlArg.replace(/^\/+/, '') : 'index.html');
console.log('build under test: ' + (htmlArg || 'index.html') + (RECORD ? '  (RECORD)' : ''));
const { p, ctx, errors } = await page(b, target);
await p.evaluate(installLM);

// ---- 1. the record: props, placements, blocking, the tiles each landmark is used from ----
const rec = await p.evaluate(async ([LANDMARKS, FX5]) => {
  const out = { props: {}, placements: {}, maps: {}, use: {} };
  for (const L of LANDMARKS) {
    const d = RB.props.P[L.id];
    out.props[L.id] = { w: d.w, h: d.h, block: !!d.block, light: d.light || null };
    out.placements[L.id] = (RB.content.maps[L.map].props || []).filter((q) => q.p === L.id).map((q) => ({ map: L.map, x: q.x, y: q.y, scene: q.scene || null, if: q.if || null, o: q.o || null, w: q.w || null, h: q.h || null }));
  }
  for (const map of [...new Set(LANDMARKS.map((L) => L.map))]) {
    const sp = RB.content.maps[map].spawn.default;
    LM.start(map, sp[0], sp[1], sp[2], FX5);
    const m = RB.world.W.map;
    out.maps[map] = { w: m.w, h: m.h, static: LM.rows(m, (x, y) => m.block[y * m.w + x]), now: LM.rows(m, (x, y) => RB.maps.blockedStatic(m, x, y)) };
    for (const L of LANDMARKS.filter((L) => L.map === map)) {
      const d = RB.props.P[L.id];
      out.use[L.id] = out.placements[L.id].map((q) => LM.useTiles(q.x, q.y, q.w || d.w, q.h || d.h, sp));
    }
  }
  return out;
}, [LANDMARKS, FX5]);

if (RECORD) {
  const fixture = Object.assign({ recordedFrom: htmlArg || 'index.html', note: 'Recorded before the landmark redraw (WR-04). Geometry and use tiles must not change.' }, rec);
  fs.mkdirSync(path.dirname(FIX), { recursive: true });
  fs.writeFileSync(FIX, JSON.stringify(fixture, null, 1) + '\n');
  console.log('recorded ' + path.relative(root, FIX));
  for (const L of LANDMARKS) console.log('  ' + L.id + ': ' + JSON.stringify(rec.props[L.id]) + ' use from ' + rec.use[L.id].map((u) => u.map((t) => t.join(' ')).join('; ')).join(' | '));
  await ctx.close(); await b.close(); srv.close();
  process.exit(0);
}

const base = JSON.parse(fs.readFileSync(FIX, 'utf8'));
for (const L of LANDMARKS) {
  say(JSON.stringify(rec.props[L.id]) === JSON.stringify(base.props[L.id]), L.id + ': footprint, blocking and light as before ' + JSON.stringify(rec.props[L.id]));
  say(JSON.stringify(rec.placements[L.id]) === JSON.stringify(base.placements[L.id]), L.id + ': placement, scene and conditions as before ' + JSON.stringify(rec.placements[L.id]));
  const u = rec.use[L.id], bu = base.use[L.id];
  say(JSON.stringify(u) === JSON.stringify(bu), L.id + ': used from the same tiles, starting the same scene (' + u.map((l) => l.length + ' tiles').join(', ') + ')');
  say(u.every((l) => l.length > 0 && l.every((t) => t[3] === L.scene)), L.id + ': every one of those tiles starts ' + L.scene + ' through interact()');
}
for (const map of Object.keys(base.maps)) {
  const a = rec.maps[map], bm = base.maps[map];
  const diff = [];
  for (const k of ['static', 'now']) a[k].forEach((r, y) => { if (r !== bm[k][y]) diff.push(k + ' row ' + y); });
  say(a.w === bm.w && a.h === bm.h && !diff.length, map + ': walkable and blocked tiles unchanged (' + a.w + '×' + a.h + ')' + (diff.length ? ': ' + diff.join(', ') : ''));
}

// the same through the keyboard: the action key (Z) at the great tree, from below and from above
for (const [x, y, dir] of [[20, 9, 'up'], [21, 6, 'down']]) {
  const got = await p.evaluate(async ([x, y, dir, FX5]) => {
    LM.start('lq.koharu', x, y, dir, FX5);
    await new Promise((r) => setTimeout(r, 400));
    window.__ran = [];
    const run = RB.script.run;
    RB.script.run = (id) => { window.__ran.push(id); return Promise.resolve(); };
    window.__restore = () => { RB.script.run = run; };
    return null;
  }, [x, y, dir, FX5]);
  await p.keyboard.press('KeyZ');
  await p.waitForTimeout(250);
  const ran = await p.evaluate(() => { window.__restore(); return window.__ran.slice(); });
  say(ran[0] === 'lq.kh_tree', 'lq_kaki: the action key at ' + x + ',' + y + ' facing ' + dir + ' starts ' + (ran[0] || 'nothing'));
}

// ---- 2. the art: a draw2 for each landmark, drawn without errors in its region and in its map ----
const REGION = { 'lq.koharu': 'reedwake', 'sb.road': 'snowbell', 'lf.gardens': 'lanternfall' };
for (const L of LANDMARKS) {
  const r = await p.evaluate(([id, region, opts]) => {
    const pd = RB.props.P[id];
    if (typeof pd.draw2 !== 'function') return { none: true };
    return { res: LM.renderProp(id, region, opts) };
  }, [L.id, REGION[L.map], [{ still: true }, { still: false }]]);
  if (r.none) { say(false, L.id + ': has an art-resolution draw2'); continue; }
  say(true, L.id + ': has an art-resolution draw2');
  const errs = r.res.filter((x) => x.err);
  say(!errs.length, L.id + ': draw2 renders without errors (' + r.res.length + ' draws: still and moving, three times)' + (errs.length ? ': ' + errs[0].err : ''));
  const min = Math.min(...r.res.map((x) => x.n));
  say(min > 400, L.id + ': draws a real sprite (' + min + '+ art px, box ' + JSON.stringify(r.res[0].box) + ')');
}
// in the real map, through the real renderer
const VIEW = { lq_kaki: [22, 10, 'up'], lq_namestone: [23, 15, 'left'], lq_teastall: [10, 12, 'up'], lq_kaki_young: [31, 13, 'up'] };
for (const L of LANDMARKS) {
  const n0 = errors.length;
  const drawn = await p.evaluate(async ([L, v, FX5]) => {
    const pd = RB.props.P[L.id], orig = pd.draw2;
    let n = 0;
    if (orig) pd.draw2 = function () { n++; return orig.apply(this, arguments); };
    LM.start(L.map, v[0], v[1], v[2], FX5);
    await new Promise((r) => setTimeout(r, 700));
    if (orig) pd.draw2 = orig;
    return n;
  }, [L, VIEW[L.id], FX5]);
  say(drawn > 0 && errors.length === n0, L.id + ': drawn in ' + L.map + ' by the renderer through draw2 (' + drawn + ' frames), no page errors');
}

// ---- 3. Masaru's bakery ----
const bk = await p.evaluate(async (FX5) => {
  LM.start('lf.bakery', 3, 6, 'up', FX5);
  await new Promise((r) => setTimeout(r, 300));
  const m = RB.world.W.map, R = LM.reach(3, 6);
  const table = m.props.find((q) => q.scene === 'lf.bakery_orders');
  const orders = table ? LM.useTiles(table.x, table.y, 2, 1, [3, 6]).filter((t) => t[3] === 'lf.bakery_orders') : [];
  const mas = RB.world.W.npcs.find((n) => n.id === 'lf_masaru');
  let talk = [];
  if (mas) {
    const run = RB.script.run; const got = [];
    RB.script.run = (id) => { got.push(id); return Promise.resolve(); };
    try {
      for (const [dx, dy, dir] of [[0, 1, 'up'], [0, -1, 'down'], [1, 0, 'left'], [-1, 0, 'right']]) {
        const x = mas.x + dx, y = mas.y + dy;
        if (!R.has(x + ',' + y)) continue;
        got.length = 0; RB.test.place(x, y, dir); RB.world.interact();
        if (got[0]) talk.push([x, y, dir, got[0]]);
        mas.dir = 'down';
      }
    } finally { RB.script.run = run; }
  }
  const noArt = m.props.filter((q) => !RB.props.P[q.p].draw2).map((q) => q.p);
  const kinds = [...new Set(m.props.map((q) => q.p))];
  return { orders, talk, noArt, kinds, door: R.has('3,7'), mas: mas ? [mas.x, mas.y] : null, table: table ? [table.x, table.y, table.p] : null };
}, FX5);
say(!!bk.table && bk.table[0] === 5 && bk.table[1] === 3 && bk.table[2] === 'table', 'bakery: the order table is where it was (5,3) ' + JSON.stringify(bk.table));
say(bk.orders.length > 0, 'bakery: lf.bakery_orders starts from ' + bk.orders.length + ' tile(s) you can walk to from the door: ' + bk.orders.map((t) => t.slice(0, 3).join(' ')).join('; '));
say(bk.talk.length > 0 && bk.talk.every((t) => /^lf\.masaru/.test(t[3])), 'bakery: Masaru (' + bk.mas + ') can be talked to from ' + bk.talk.map((t) => t.slice(0, 3).join(' ')).join('; '));
say(bk.door, 'bakery: the way out is reachable');
say(!bk.noArt.length, 'bakery: every prop in the room has art-resolution draw2 (' + bk.kinds.join(', ') + ')' + (bk.noArt.length ? ' — missing: ' + bk.noArt.join(', ') : ''));
say(bk.kinds.some((k) => /oven/.test(k)) && bk.kinds.some((k) => /bread/.test(k)) && bk.kinds.some((k) => /knead/.test(k)), 'bakery: an oven, a bread display and a kneading bench are placed');

// ---- 4. the River Warehouse's missing floorboard ----
const wh = await p.evaluate(async () => {
  LM.start('rw.warehouse', 5, 7, 'up', { rw_arrived: true, rw_road_lit: true });
  await new Promise((r) => setTimeout(r, 300));
  const m = RB.world.W.map, R = LM.reach(5, 7);
  const gap = m.props.find((q) => /floorgap|board/.test(q.p));
  const nao = RB.world.W.npcs.find((n) => n.id === 'nao');
  const got = [], run = RB.script.run;
  RB.script.run = (id) => { got.push(id); return Promise.resolve(); };
  const naoFrom = [];
  try {
    for (const [dx, dy, dir] of [[0, 1, 'up'], [0, -1, 'down'], [1, 0, 'left'], [-1, 0, 'right']]) {
      const x = nao.x + dx, y = nao.y + dy;
      if (!R.has(x + ',' + y)) continue;
      got.length = 0; RB.test.place(x, y, dir); RB.world.interact();
      if (got[0]) naoFrom.push([x, y, dir, got[0]]);
    }
  } finally { RB.script.run = run; }
  const crates = LM.useTiles(8, 5, 2, 1, [5, 7]).filter((t) => t[3] === 'rw.crates');
  return { gap: gap ? { p: gap.p, x: gap.x, y: gap.y, block: RB.maps.blockedStatic(m, gap.x, gap.y), art: typeof RB.props.P[gap.p].draw2 } : null, naoFrom, crates, nao: [nao.x, nao.y], out: R.has('5,8') };
});
say(!!wh.gap && wh.gap.art === 'function' && wh.gap.block && wh.gap.y === 5, 'warehouse: the missing third floorboard is drawn at art resolution and you cannot step on it ' + JSON.stringify(wh.gap));
say(wh.naoFrom.length > 0 && wh.naoFrom.every((t) => t[3] === 'rw.nao_first'), 'warehouse: Nao (' + wh.nao + ') — rw.nao_first starts from ' + wh.naoFrom.map((t) => t.slice(0, 3).join(' ')).join('; '));
say(wh.crates.length > 0, 'warehouse: rw.crates starts from ' + wh.crates.map((t) => t.slice(0, 3).join(' ')).join('; '));
say(wh.out, 'warehouse: the door is reachable');

// ---- 5. the observatory's dome above the Star Stair path ----
const obs = await p.evaluate(async () => {
  LM.start('sb.obs_path', 13, 6, 'up', { sb_arrived: true, sb_lamp_lit: true, ch4_done: true });
  await new Promise((r) => setTimeout(r, 400));
  const m = RB.world.W.map, pr = m.props.find((q) => q.p === 'sb_observatory');
  return { head: m.def.headroom || 0, camY: RB.render.cam.y, at: pr ? [pr.x, pr.y] : null };
});
say(obs.head >= 1 && obs.camY < 0, 'sb.obs_path: the camera may show the row above the map, so the dome is not cut off (headroom ' + obs.head + ', camera y ' + obs.camY + ')');
say(JSON.stringify(obs.at) === '[10,1]', 'sb.obs_path: the observatory stays at (10,1) ' + JSON.stringify(obs.at));
// at the four screen shapes of the review: standing at its door (13,6) the dome's top is on screen;
// whether the HUD buttons cover the apex is reported, not changed (the HUD is not moved for it)
for (const [w, h] of [[2000, 1090], [1440, 900], [390, 844], [844, 390]]) {
  const q = await page(b, target, { viewport: { width: w, height: h } });
  await q.p.evaluate(installLM);
  const r = await q.p.evaluate(async () => {
    LM.start('sb.obs_path', 13, 6, 'up', { sb_arrived: true, sb_lamp_lit: true, ch4_done: true });
    await new Promise((r) => setTimeout(r, 600));
    const k = RB.render.viewSize().scale, t = RB.render.tileToCss(10, 1);
    // the dome's apex: the topmost drawn pixel of the observatory's own sprite (as placed now)
    const pr = RB.world.W.map.props.find((q) => q.p === 'sb_observatory' && (!q.if || RB.state.test(RB.game.s, q.if)));
    const cv = document.createElement('canvas'); cv.width = 400; cv.height = 400;
    const g = cv.getContext('2d');
    RB.props.P.sb_observatory.draw2(g, 100, 200, RB.tiles.PAL.snowbell, 0, Object.assign({ cx: 10, cy: 1, still: true }, pr.o || {}));
    const d = g.getImageData(0, 0, 400, 400).data;
    let top = null;
    for (let y = 0; y < 400 && !top; y++) for (let x = 0; x < 400; x++) if (d[(y * 400 + x) * 4 + 3] > 0) { top = { x: x - 100, y: y - 200 }; break; }
    // (art px → logical px: half; the apex column is where the topmost pixel run starts, plus a little)
    const apex = { x: t.x + ((top.x + 2) / 2) * k, y: t.y + (top.y / 2) * k };
    const hud = [...document.querySelectorAll('button')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && r.top < 80 && r.left > innerWidth / 3; }).map((e) => e.getBoundingClientRect());
    const covered = hud.some((r) => apex.x >= r.left && apex.x <= r.right && apex.y >= r.top - 2 && apex.y <= r.bottom + 2);
    const gap = hud.length ? Math.round(Math.min(...hud.map((r) => apex.y - r.bottom))) : null;
    return { apexY: Math.round(apex.y), apexX: Math.round(apex.x), covered, gap, camY: RB.render.cam.y };
  });
  say(r.apexY >= 0, `sb.obs_path ${w}×${h}: the dome's apex is on screen (y ${r.apexY} css px, camera y ${r.camY})`);
  console.log(`info sb.obs_path ${w}×${h}: HUD buttons ${r.covered ? 'COVER' : 'do not cover'} the apex (apex at ${r.apexX},${r.apexY}; ${r.gap == null ? 'no HUD button above it' : 'nearest button bottom ' + r.gap + ' css px above'})`);
  if (q.errors.length) say(false, 'page errors at ' + w + '×' + h + ': ' + q.errors.slice(0, 2).join(' | '));
  await q.ctx.close();
}

say(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
await ctx.close(); await b.close(); srv.close();
console.log('\n' + passes + ' passed, ' + fails + ' failed');
process.exit(fails ? 1 : 0);
