// Overworld parity captures (battle addendum §20), from a BUILT game in headless Chromium with synthetic,
// session-only debug campaigns (never a player's save). Normal play scale: a 1280×800 window, where the world
// draws 2 device px per art px — the same density as the battle stage at that size.
//  - regions: one view per regional style (Reedwake village and mill, Saltglass harbour and drowned archive,
//    Cinder Orchard village and kiln, Snowbell hamlet and observatory, Lanternfall town and bell tower, the
//    Still Archive camp and reading room, an Atlas room), the player, the companion and a pet in each;
//  - interactables: every kind of ladder, stair, door, exit mat, mechanism and readable thing, each at its
//    first placement, plain and with the tile grid drawn over it (blocking tiles red, the prop's own tiles —
//    the ones you click — outlined in yellow), so legibility and the collision boundary can be compared.
// Usage: node tests/e2e/overworld_parity_shots.mjs <out-dir> [page path, default index.html] [--only regions|props]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const outDir = path.resolve(process.argv[2] || path.join(root, 'tests/e2e/out/battle_pets_overworld/shots'));
const pg = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : '';
const only = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7);
fs.mkdirSync(outDir, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
const wait = (p, ms) => p.waitForTimeout(ms);
const LATE = { rw_arrived: true, rw_road_lit: true, rw_echo_done: true, rw_mill_open: true, departed: true, ch1_done: true };
export const REGIONS = [
  ['reedwake', 'rw.village', null], ['reedwake-mill', 'rw.mill1', null], ['saltglass', 'sg.harbor', [27, 8]], ['drowned-archive', 'sg.da_sluice', null],
  ['cinder', 'co.village', [8, 18]], ['kiln', 'co.kiln', null], ['snowbell', 'sb.hamlet', null], ['observatory', 'sb.obs_hall', null],
  ['lanternfall', 'lf.town', [6, 17]], ['bell-tower', 'lf.tower_mid', null], ['still-mount', 'sa.camp', null], ['still-archive', 'sa.reading', null],
  ['interior', 'rw.tea', null],
];
export const KINDS = ['ladder', 'stairs', 'door', 'exitmat', 'gears', 'millstone', 'lf_lever', 'sb_crank', 'lf_wheel', 'co_wheel', 'sa_door', 'sa_gate', 'lf_sluicegate', 'lf_grate', 'hole', 'well', 'chest', 'mailbox', 'noticeboard', 'sign', 'millwheel', 'sb_dial', 'co_sluice', 'fw_winch', 'fw_pulleypost', 'fw_clamppost', 'fw_slipscreen', 'lf_padlock', 'cs_bellpost'];

async function start(p, map, at, o) {
  return p.evaluate(async ([map, at, o, LATE]) => {
    const m = RB.content.maps[map];
    const sp = at || (m.spawn && (m.spawn.default || Object.values(m.spawn)[0])) || [5, 5, 'down'];
    RB.game.debugStart(map, sp[0], sp[1], { dir: sp[2] || 'down', comp: o.comp || 'mio', flags: LATE });
    RB.game.settings.textSpeed = 'instant';
    await new Promise((r) => setTimeout(r, 200));
    for (let i = 0; i < 80 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 30)); }
    if (o.pet) { const s = RB.game.s; RB.pets.meet(s, o.pet); RB.pets.select(s, o.pet); }
    return { map, x: RB.world.W.player.x, y: RB.world.W.player.y };
  }, [map, at, o, LATE]);
}

const made = { regions: [], props: [] };
if (!only || only === 'regions') {
  for (const [name, map, at] of REGIONS) {
    const { p, errors, ctx } = await page(b, url + pg, { viewport: { width: 1280, height: 800 } });
    await start(p, map, at, { pet: 'cat' });
    // a few steps so the companion and the pet fall in behind
    for (const k of ['ArrowUp', 'ArrowUp', 'ArrowRight']) { await p.keyboard.down(k); await wait(p, 200); await p.keyboard.up(k); await wait(p, 80); }
    await wait(p, 1400);
    const f = path.join(outDir, 'region_' + name + '.png');
    await p.screenshot({ path: f });
    made.regions.push({ name, map, f, errors: errors.slice(0, 3) });
    await ctx.close();
  }
}
if (!only || only === 'props') {
  const { p, errors, ctx } = await page(b, url + pg, { viewport: { width: 1280, height: 800 } });
  const places = await p.evaluate(([KINDS, LATE]) => {
    const out = [];
    const s = RB.state.newCampaign({}); Object.assign(s.flags, LATE);
    for (const k of KINDS) {
      let hit = null;
      for (const id of Object.keys(RB.content.maps).sort()) {
        const d = RB.content.maps[id];
        const pr = (d.props || []).find((q) => q.p === k && (!q.if || RB.state.test(s, q.if)));
        if (pr) { hit = { kind: k, map: id, x: pr.x, y: pr.y, w: pr.w || RB.props.P[k].w, h: pr.h || RB.props.P[k].h, block: !!(RB.props.P[k].block && pr.block !== false), act: !!(pr.scene || pr.text) }; break; }
      }
      if (hit) out.push(hit);
    }
    return out;
  }, [KINDS, LATE]);
  for (const q of places) {
    // stand two tiles below it if that is floor, else search a ring
    const at = await p.evaluate(([q, LATE]) => {
      const m = RB.maps.compile(q.map);
      const prev = RB.game.s; const s = RB.state.newCampaign({}); Object.assign(s.flags, LATE); RB.game.s = s;
      let best = null;
      for (let r = 1; r < 6 && !best; r++) for (let dy = -r; dy <= r && !best; dy++) for (let dx = -r; dx <= r && !best; dx++) {
        const x = q.x + dx, y = q.y + q.h - 1 + 1 + dy;
        if (Math.abs(dx) + Math.abs(dy) < r) continue;
        if (!RB.maps.blockedStatic(m, x, y) && !RB.maps.exitAt(m, x, y) && !(x >= q.x && x < q.x + q.w && y >= q.y && y < q.y + q.h)) best = [x, y, 'up'];
      }
      RB.game.s = prev;
      return best;
    }, [q, LATE]);
    await start(p, q.map, at, { pet: null });
    await wait(p, 500);
    const r = await p.evaluate((q) => {
      const a = RB.render.tileToCss(q.x - 2, q.y - 3), c = RB.render.tileToCss(q.x + q.w + 2, q.y + q.h + 1);
      return { x: Math.max(0, Math.round(a.x)), y: Math.max(0, Math.round(a.y)), w: Math.round(c.x - a.x), h: Math.round(c.y - a.y), tile: Math.round(RB.render.tileToCss(1, 0).x - RB.render.tileToCss(0, 0).x) };
    }, q);
    const clip = { x: r.x, y: r.y, width: Math.min(r.w, 1280 - r.x), height: Math.min(r.h, 800 - r.y) };
    if (clip.width < 40 || clip.height < 40) continue;
    const f0 = path.join(outDir, 'prop_' + q.kind + '.png');
    await p.screenshot({ path: f0, clip });
    // the grid: blocking tiles red, the prop's own tiles yellow
    await p.evaluate(([q, LATE]) => {
      const m = RB.maps.compile(q.map);
      const ov = document.createElement('div'); ov.id = 'parity-grid'; ov.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999';
      for (let y = q.y - 3; y < q.y + q.h + 1; y++) for (let x = q.x - 2; x < q.x + q.w + 2; x++) {
        const a = RB.render.tileToCss(x, y), c = RB.render.tileToCss(x + 1, y + 1);
        const own = x >= q.x && x < q.x + q.w && y >= q.y && y < q.y + q.h;
        const d = document.createElement('div');
        d.style.cssText = 'position:absolute;left:' + a.x + 'px;top:' + a.y + 'px;width:' + (c.x - a.x) + 'px;height:' + (c.y - a.y) + 'px;box-sizing:border-box;border:1px solid rgba(255,255,255,0.35);' + (RB.maps.blockedStatic(m, x, y) ? 'background:rgba(220,40,40,0.28);' : '') + (own ? 'outline:3px solid #ffd23c;outline-offset:-3px;' : '');
        ov.appendChild(d);
      }
      document.body.appendChild(ov);
    }, [q, LATE]);
    const f1 = path.join(outDir, 'prop_' + q.kind + '_grid.png');
    await p.screenshot({ path: f1, clip });
    await p.evaluate(() => document.getElementById('parity-grid').remove());
    made.props.push(Object.assign({}, q, { f0, f1 }));
  }
  if (errors.length) console.log('page errors', errors.slice(0, 3));
  await ctx.close();
}
fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(made, null, 1));
console.log('regions', made.regions.length, 'props', made.props.length, '->', outDir);
await b.close(); srv.close();
