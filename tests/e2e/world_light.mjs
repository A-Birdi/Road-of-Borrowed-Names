// Light and shadow on every map (C-86; src/engine/65_worldlook.js, src/engine/66_worldkit.js), against the built
// index.html in Chromium, with synthetic sessions (never a real save):
//  - every map of the twelve chapters and the postgame is lit: outdoors under its region's own sun (each region in
//    SUNS has its own), indoors as a room; a frame draws on each with no page error (first-frame cost recorded);
//    what the light builds for a map (its shadows, its room's light) goes when the map's art goes;
//  - a room has windows only if the building it is entered from has them, and only on timber walls; its shadows
//    fall into the room and never over a wall; by night its windows give no shadows, and a dim room by day keeps
//    its daylight;
//  - a dark place's lamps the darkness did not count before (a stove, the festival lanterns) now open it;
//  - with Settings' "Light and shadow" Off, none of it is drawn and nothing is built.
// Usage: node tests/e2e/world_light.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
async function test(name, fn) {
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 900s')), 900000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.message || e).slice(0, 1200)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const DESK = { viewport: { width: 1440, height: 900 } };
// enter a map at its first spawn (or its middle), creatures held off, the arrival scenes passed
const ENTER = (id, flags) => {
  const def = RB.content.maps[id], m = RB.maps.compile(id);
  const sp = def.spawn || {}, k = Object.keys(sp)[0];
  const [x, y] = k && Array.isArray(sp[k]) ? sp[k] : [m.w >> 1, m.h >> 1];
  RB.game.debugStart(id, x, y, { comp: 'nao', flags: Object.assign({ departed: true }, flags || {}) });
  RB.world.W.quietUntil = 1e15;
  for (let i = 0; i < 200 && RB.ui.dialogue.isOpen(); i++) RB.ui.dialogue.advance(true);
  return RB.world.W.map;
};

await test('every map is lit: outdoors under its region\'s own sun, indoors as a room; a frame draws on each with no page error; what the light built is let go with each map\'s art', async () => {
  const { p, ctx, errors } = await page(b, url, DESK);
  const r = await p.evaluate((ENTER) => {
    const enter = new Function('return ' + ENTER)();
    const out = { n: 0, outdoor: 0, indoor: 0, bad: [], regions: {}, slow: [] };
    for (const id of Object.keys(RB.content.maps)) {
      const m = enter(id);
      RB.render.invalidate();
      const t0 = performance.now();
      RB.render.frame(5000);
      const ms = performance.now() - t0;
      out.n++;
      const c = RB.worldLook.cfg(m), enc = RB.render.enclosed(m);
      if (!c || !RB.worldLook.active(m)) { out.bad.push(id + ': not lit'); continue; }
      if (!!c.indoor !== enc) out.bad.push(id + ': indoor ' + !!c.indoor + ' but enclosed ' + enc);
      if (c.indoor) out.indoor++;
      else {
        out.outdoor++;
        if (!c.sun) out.bad.push(id + ': no sun');
        else (out.regions[m.region] = out.regions[m.region] || new Set()).add(c.sun.id);
      }
      out.slow.push([id, Math.round(ms)]);
    }
    for (const k in out.regions) out.regions[k] = [...out.regions[k]];
    // what the light built is let go with each map's art: only the last maps visited keep any
    out.kept = { layers: 0, masks: 0, rooms: 0, decor: 0 };
    for (const id of Object.keys(RB.content.maps)) {
      const m = RB.maps.compile(id);
      if (m.staticLayer) out.kept.layers++;
      if (m.look && m.look.cv) out.kept.masks++;
      if (m.lookRoom) out.kept.rooms++;
      if (m.kitDecor) out.kept.decor++;
    }
    out.slow.sort((a, b) => b[1] - a[1]);
    out.slow = out.slow.slice(0, 5);
    out.suns = Object.keys(RB.worldLook.SUNS);
    return out;
  }, ENTER.toString());
  console.log('  ' + r.n + ' maps: ' + r.outdoor + ' outdoors, ' + r.indoor + ' rooms; slowest first frames (ms, with the static layer and the shadows built): ' + r.slow.map((s) => s.join(' ')).join(', '));
  assert(r.n > 200, 'expected every map: ' + r.n);
  assert(!r.bad.length, 'maps not lit as expected: ' + r.bad.slice(0, 20).join('; '));
  // each region with its own entry in SUNS is lit by that sun (the Hall's wings share the Hall's)
  for (const [region, suns] of Object.entries(r.regions)) {
    const want = r.suns.includes(region) ? region : 'hall';
    assert(suns.length === 1 && suns[0] === want, region + ' should be lit by ' + want + ': ' + suns.join(','));
  }
  assert(Object.keys(r.regions).length >= 18, 'regions outdoors: ' + Object.keys(r.regions).join(', '));
  assert(r.kept.layers <= 2 && r.kept.masks <= 2 && r.kept.rooms <= 2 && r.kept.decor <= 2, 'after every map, the light\'s layers of maps left behind should be let go: ' + JSON.stringify(r.kept));
  assert(!errors.length, 'page errors: ' + errors.slice(0, 5).join('; '));
  await ctx.close();
});

await test('a room: windows only from its building\'s own, only on timber walls; shadows fall into the room and never over a wall; by night no window shadows; a dim room by day keeps its daylight', async () => {
  const { p, ctx, errors } = await page(b, url, DESK);
  const r = await p.evaluate((ENTER) => {
    const enter = new Function('return ' + ENTER)();
    const out = {};
    // the teahouse: its building has two windows; the room has them at the back and the front
    let m = enter('rw.tea');
    RB.render.frame(5000);
    const win = RB.worldLook.windowsOf(m);
    out.tea = { back: win.filter((w) => w.back).length, front: win.filter((w) => !w.back).length, mode: m.look && m.look.mode, winLight: !!(m.look && m.look.lights.some((l) => l.win)) };
    // no shadow pixel lies on a wall tile
    const L = m.look, g = L.cv.getContext('2d'), d = g.getImageData(0, 0, L.cv.width, L.cv.height).data;
    let onWall = 0, onFloor = 0;
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const wall = m.tiles[y * m.w + x].id === 'wall';
      for (let yy = 2; yy < 32; yy += 5) for (let xx = 2; xx < 32; xx += 5) {
        const a = d[(((y + L.gm.y) * 32 + yy) * L.cv.width + (x + L.gm.x) * 32 + xx) * 4 + 3];
        if (a) { if (wall) onWall++; else onFloor++; }
      }
    }
    out.tea.onWall = onWall; out.tea.onFloor = onFloor;
    // by night: the windows cast nothing (only the room's lamps and fires); by day they do
    const night = RB.worldLook.stateOf(m, { amb: {}, mapNight: true }), day = RB.worldLook.stateOf(m, { amb: {}, mapNight: false });
    out.night = { night: night.night, winByNight: RB.worldLook.castLights(m, night).filter((l) => l.win).length, winByDay: RB.worldLook.castLights(m, day).filter((l) => l.win).length, lamps: RB.worldLook.castLights(m, night).length };
    // a building with no windows gives a room none; a stone-walled room has none whatever its building
    const noWin = [], stone = [];
    for (const id of Object.keys(RB.content.maps)) {
      const def = RB.content.maps[id];
      for (const st of def.structs || []) if (st.to && RB.content.maps[st.to] && (!st.windows || !st.windows.length)) noWin.push(st.to);
    }
    out.noWin = noWin.filter((id) => !Object.values(RB.content.maps).some((d) => (d.structs || []).some((s) => s.to === id && s.windows && s.windows.length))).map((id) => [id, RB.worldLook.windowsOf(RB.maps.compile(id)).length]).filter((x) => x[1]);
    for (const id of Object.keys(RB.content.maps)) {
      const mm = RB.maps.compile(id);
      if (RB.render.enclosed(mm) && RB.tileArt.wallStyleOf(mm) !== 'timber' && RB.worldLook.windowsOf(mm).length) stone.push(id);
    }
    out.stone = stone;
    // the Lantern Hall is dim by day (its own darkness): its windows still give daylight, and open the darkness
    m = enter('rw.hall');
    RB.render.frame(5000);
    const st = RB.worldLook.stateOf(m, { amb: m.def.ambient, night: true, mapNight: false });
    out.hall = { night: st.night, holes: RB.worldLook.holes(m, { amb: m.def.ambient, night: true, mapNight: false }).length, windows: RB.worldLook.windowsOf(m).length };
    return out;
  }, ENTER.toString());
  assert(r.tea.back === 2 && r.tea.front === 2, 'the teahouse\'s windows (two at the back, two at the front): ' + JSON.stringify(r.tea));
  assert(r.tea.mode === 'room:d' && r.tea.winLight, 'by day the teahouse\'s back windows cast its shadows: ' + JSON.stringify(r.tea));
  assert(r.tea.onFloor > 0 && r.tea.onWall === 0, 'shadows on the floor only: ' + JSON.stringify(r.tea));
  assert(r.night.night === true && r.night.winByNight === 0 && r.night.winByDay === 2 && r.night.lamps > 0, 'by night only the teahouse\'s stove casts: ' + JSON.stringify(r.night));
  assert(!r.noWin.length, 'rooms with windows their building does not have: ' + JSON.stringify(r.noWin));
  assert(!r.stone.length, 'windows on stone walls: ' + r.stone.join(', '));
  assert(r.hall.night === false && r.hall.windows > 0 && r.hall.holes >= r.hall.windows, 'the dim hall keeps its daylight at the windows: ' + JSON.stringify(r.hall));
  assert(!errors.length, 'page errors: ' + errors.join('; '));
  await ctx.close();
});

await test('lamps the darkness did not count now open it; with "Light and shadow" Off nothing is drawn or built', async () => {
  const { p, ctx, errors } = await page(b, url, DESK);
  const r = await p.evaluate((ENTER) => {
    const enter = new Function('return ' + ENTER)();
    // a dark place holding one of the lights the darkness did not count (a stove, a kiln, the festival lanterns)
    const extra = { stove: 1, kiln: 1, lf_oven: 1, mp_lanterns: 1, fw_clamppost: 1, fw_armlamp: 1, sg_lamproom: 1, co_kilnwall: 1 };
    let found = null;
    for (const id of Object.keys(RB.content.maps)) {
      const def = RB.content.maps[id];
      if (!((def.ambient || {}).dark > 0)) continue;
      if ((def.props || []).some((q) => extra[q.p] && !q.if)) { found = id; break; }
    }
    if (!found) return { found };
    const m = enter(found);
    RB.render.frame(5000);
    const amb = m.def.ambient, env = { amb, night: amb.dark >= 0.3, mapNight: !!m.def.night };
    const holes = RB.worldLook.holes(m, env);
    const ex = RB.worldLook.emitters(m).filter((e) => e.extra);
    // a shadow cast by lamplight points away from the lamp: the lights the mask was cast from
    const lit = m.look && m.look.lights ? m.look.lights.length : 0;
    // Off: nothing is built or drawn
    RB.game.settings.worldLight = false; RB.game.applySettings();
    const before = RB.worldLook.stats().masks;
    const m2 = enter('rw.village');
    RB.render.frame(5000);
    const off = { active: RB.worldLook.active(m2), look: !!m2.look, masks: RB.worldLook.stats().masks - before };
    RB.game.settings.worldLight = true; RB.game.applySettings();
    return { found, holes: holes.length, extra: ex.length, lit, off };
  }, ENTER.toString());
  assert(r.found, 'expected a dark place with a stove, kiln or festival lantern');
  assert(r.extra > 0 && r.holes >= r.extra, 'the extra lights open the darkness in ' + r.found + ': ' + JSON.stringify(r));
  assert(r.off.active === false && r.off.look === false && r.off.masks === 0, 'Off builds and draws nothing: ' + JSON.stringify(r.off));
  assert(!errors.length, 'page errors: ' + errors.join('; '));
  await ctx.close();
});

console.log(pass + ' passed, ' + fail + ' failed');
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
