// The world proof's captures (expansion P01, src/engine/65_worldlook.js; docs/future/work/P01_WORLD.md): the same
// place, the same moment, drawn by the game as it is and by the proof, at actual size, with each layer switched
// off in turn. A synthetic session (never a real save). Each section writes WebP files to its own folder.
// Usage: node tests/e2e/world_captures.mjs [section ...]   (default: every section)
//   camera   near and far views at 1440×900, 2048×1046 (1.25) and 375×667 (3)   → docs/screenshots/world/w00/
//   light    the illumination and atmosphere layers on and off, day and night, desktop and phone
//            (the kit off: W01 alone)                                              → docs/screenshots/world/w01/
//   kit      Reedwake's kit: the game as it is beside the proof (paired, actual size), the kit on and off, close-ups
//            at 3× (the square, the river and bridge, a house front), night, the phone  → docs/screenshots/world/w02/
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const want = process.argv.slice(2);
const doing = (s) => !want.length || want.includes(s);
const { srv, url } = await serve();
const b = await launch();
const written = [];

async function webp(p, png, dir, file, scale = 1) {
  const data = await p.evaluate(async ({ b64, scale }) => {
    const i = new Image(); i.src = 'data:image/png;base64,' + b64; await i.decode();
    const c = document.createElement('canvas'); c.width = i.naturalWidth * scale; c.height = i.naturalHeight * scale;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    g.drawImage(i, 0, 0, c.width, c.height);
    return c.toDataURL('image/webp', 0.9);
  }, { b64: png.toString('base64'), scale });
  const out = path.join(root, dir);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, file), Buffer.from(data.split(',')[1], 'base64'));
  written.push(path.join(dir, file));
}
// a fixed moment in the village square: Suzu travelling, the morning's people about, clocks held
async function square(p, x = 22, y = 18, flags = {}) {
  await p.evaluate(({ x, y, flags }) => { RB.game.debugStart('rw.village', x, y, { comp: 'suzu', flags: Object.assign({ departed: true }, flags) }); }, { x, y, flags });
  await p.waitForTimeout(900);
  await p.evaluate(() => { const el = document.getElementById('wl-dev'); if (el) el.style.display = 'none'; }); // the dev panel is not part of the picture
}
const look = (p, o) => p.evaluate((o) => RB.worldLook.set(Object.assign({ on: true, view: 'far', kit: true, light: true, atmos: true, soft: false }, o)), o);
const VIEWS = [
  { tag: 'd1440', viewport: { width: 1440, height: 900 }, dpr: 1 },
  { tag: 'd2048', viewport: { width: 2048, height: 1046 }, dpr: 1.25 },
  { tag: 'p375', viewport: { width: 375, height: 667 }, dpr: 3, mobile: true },
];

if (doing('camera')) {
  for (const v of VIEWS) {
    for (const dev of [false, true]) {
      const { p, ctx, errors } = await page(b, url + (dev ? '?dev=world' : ''), { viewport: v.viewport, dpr: v.dpr, mobile: v.mobile, touch: v.mobile });
      await square(p);
      if (dev) await p.evaluate(() => RB.worldLook.set({ kit: false, light: false, atmos: false, soft: false }));
      await p.waitForTimeout(400);
      const vs = await p.evaluate(() => { const s = RB.render.viewSize(); return (s.w / 16).toFixed(1) + '×' + (s.h / 16).toFixed(1) + ' tiles, ' + (s.scale * 16).toFixed(1) + ' css px per tile'; });
      console.log(v.tag, dev ? 'far ' : 'near', vs);
      await webp(p, await p.screenshot(), 'docs/screenshots/world/w00', 'camera_' + v.tag + (dev ? '_far' : '_near') + '.webp');
      if (errors.length) console.log('  page errors:', errors.join('; '));
      await ctx.close();
    }
  }
}

if (doing('light')) {
  const D = 'docs/screenshots/world/w01';
  const shots = [
    ['day_all', {}, {}], ['day_no_light', {}, { light: false }], ['day_no_atmos', {}, { atmos: false }], ['day_bare', {}, { light: false, atmos: false }],
    ['day_soft_edges', {}, { soft: true }], ['night_all', { rw_night: true }, {}], ['night_bare', { rw_night: true }, { light: false, atmos: false }],
  ];
  for (const [name, flags, o] of shots) {
    const { p, ctx, errors } = await page(b, url + '?dev=world', { viewport: { width: 1440, height: 900 } });
    await square(p, 22, 18, flags);
    await look(p, Object.assign({ kit: false }, o));
    await p.waitForTimeout(500);
    await webp(p, await p.screenshot(), D, 'd1440_' + name + '.webp');
    if (errors.length) console.log(name, 'page errors:', errors.join('; '));
    await ctx.close();
  }
  for (const [name, o] of [['day_all', {}], ['day_bare', { light: false, atmos: false }]]) {
    const { p, ctx } = await page(b, url + '?dev=world', { viewport: { width: 375, height: 667 }, dpr: 3, mobile: true, touch: true });
    await square(p);
    await look(p, Object.assign({ kit: false }, o));
    await p.waitForTimeout(700);
    await webp(p, await p.screenshot(), D, 'p375_' + name + '.webp');
    await ctx.close();
  }
}

if (doing('kit')) {
  const D = 'docs/screenshots/world/w02';
  const shot = async (name, query, setup, o = {}) => {
    const { p, ctx, errors } = await page(b, url + query, { viewport: o.viewport || { width: 1440, height: 900 }, dpr: o.dpr || 1, mobile: o.mobile, touch: o.mobile });
    await square(p, 22, 18, o.flags || {});
    if (setup) await p.evaluate(setup);
    await p.waitForTimeout(700);
    await webp(p, await p.screenshot(), D, name + '.webp');
    for (const [tag, clip] of o.crops || []) await webp(p, await p.screenshot({ clip }), D, name + '_' + tag + '.webp', 3);
    if (errors.length) console.log(name, 'page errors:', errors.join('; '));
    await ctx.close();
  };
  const crops = [['square', { x: 500, y: 300, width: 440, height: 250 }], ['river', { x: 1040, y: 360, width: 320, height: 380 }], ['house', { x: 860, y: 220, width: 230, height: 180 }]];
  // the game as it is (near view) and the proof (far view), the same moment; then the same with the camera only
  await shot('d1440_game', '', null);
  await shot('d1440_proof', '?dev=world', null, { crops });
  await shot('d1440_proof_kit_off', '?dev=world', () => RB.worldLook.set({ kit: false }));
  await shot('d1440_camera_only', '?dev=world', () => RB.worldLook.set({ kit: false, light: false, atmos: false }), { crops });
  await shot('d1440_proof_night', '?dev=world', null, { flags: { rw_night: true } });
  await shot('d2048_proof', '?dev=world', null, { viewport: { width: 2048, height: 1046 }, dpr: 1.25 });
  await shot('p375_proof', '?dev=world', null, { viewport: { width: 375, height: 667 }, dpr: 3, mobile: true });
  await shot('p375_game', '', null, { viewport: { width: 375, height: 667 }, dpr: 3, mobile: true });
}

await b.close();
srv.close();
console.log('wrote ' + written.length + ' captures:\n  ' + written.join('\n  '));
