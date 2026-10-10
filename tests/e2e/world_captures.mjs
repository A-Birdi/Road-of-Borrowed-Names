// The world proof's captures (expansion P01, src/engine/65_worldlook.js; docs/future/work/P01_WORLD.md): the same
// place, the same moment, drawn by the game as it is and by the proof, at actual size, with each layer switched
// off in turn. A synthetic session (never a real save). Each section writes WebP files to its own folder.
// Usage: node tests/e2e/world_captures.mjs [section ...]   (default: every section)
//   camera   near and far views at 1440×900, 2048×1046 (1.25) and 375×667 (3)   → docs/screenshots/world/w00/
//   light    the illumination and atmosphere layers on and off, day and night, desktop and phone
//            (the kit off: W01 alone)                                              → docs/screenshots/world/w01/
//   kit      Reedwake's kit: the game as it is beside the proof (paired, actual size), the kit on and off, close-ups
//            at 3× (the square, the river and bridge, a house front), night, the phone  → docs/screenshots/world/w02/
//   acts     the two purposeful actions as labelled key-frame strips at 3×, one frame from the middle of each
//            phase: Yasu's catch and miss rounds, Tomo's folding and clearing rounds   → docs/screenshots/world/w03/
//   saltglass the harbour reusing the method: the game beside the proof (desktop, 2048, phone), close-ups at 3× (the
//            market, the quay, the piers), the evening, and Kiyo's strips              → docs/screenshots/world/w05/
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

if (doing('acts')) {
  const D = 'docs/screenshots/world/w03';
  const strip = async (file, who, n, clipOf) => {
    const { p, ctx, errors } = await page(b, url + '?dev=world', { viewport: { width: 1440, height: 900 } });
    await square(p);
    await p.clock.install();
    await p.clock.pauseAt(await p.evaluate(() => Date.now() + 50));
    const info = await p.evaluate(({ who, n }) => {
      const a = RB.world.W.npcs.find((q) => q.id === who), T = 100000, kind = who === 'yasu' ? 'fish' : 'fold';
      a._act = { kind, t0: T, n };
      const r = kind === 'fish' ? RB.worldActs.fishRound(n) : RB.worldActs.foldRound(n);
      let acc = 0;
      const marks = r.map(([ph, ms]) => { const m = [ph, T + acc + ms * 0.5]; acc += ms; return m; });
      return { marks, c: RB.render.tileToCss(a.x, a.y) };
    }, { who, n });
    const frames = [];
    for (const [ph, at] of info.marks) {
      await p.evaluate((at) => RB.render.frame(at), at);
      frames.push([ph, (await p.screenshot({ clip: clipOf(info.c) })).toString('base64')]);
    }
    const data = await p.evaluate(async (frames) => {
      const imgs = await Promise.all(frames.map(async ([ph, b64]) => { const i = new Image(); i.src = 'data:image/png;base64,' + b64; await i.decode(); return [ph, i]; }));
      const s = 3, cols = 4, w = imgs[0][1].naturalWidth * s, h = imgs[0][1].naturalHeight * s;
      const c = document.createElement('canvas'); c.width = cols * (w + 6); c.height = Math.ceil(imgs.length / cols) * (h + 22);
      const g = c.getContext('2d'); g.fillStyle = '#1b2030'; g.fillRect(0, 0, c.width, c.height); g.imageSmoothingEnabled = false;
      imgs.forEach(([ph, i], k) => { const x = (k % cols) * (w + 6), y = Math.floor(k / cols) * (h + 22); g.drawImage(i, x, y + 18, w, h); g.fillStyle = '#fff'; g.font = '14px sans-serif'; g.fillText((k + 1) + '. ' + ph, x + 4, y + 14); });
      return c.toDataURL('image/webp', 0.9);
    }, frames);
    fs.mkdirSync(path.join(root, D), { recursive: true });
    fs.writeFileSync(path.join(root, D, file), Buffer.from(data.split(',')[1], 'base64'));
    written.push(path.join(D, file));
    if (errors.length) console.log(file, 'page errors:', errors.join('; '));
    await ctx.close();
  };
  const yclip = (c) => ({ x: c.x - 40, y: c.y - 50, width: 175, height: 90 });
  const tclip = (c) => ({ x: c.x - 34, y: c.y - 30, width: 76, height: 66 });
  await strip('yasu_catch.webp', 'yasu', 3, yclip);   // rounds 0 and 1 miss, 2 onward catch (by hash)
  await strip('yasu_miss.webp', 'yasu', 0, yclip);
  await strip('tomo_fold.webp', 'tomo', 2, tclip);    // the stack two → three
  await strip('tomo_clear.webp', 'tomo', 4, tclip);   // four folded cloths lifted into the basket
}

if (doing('saltglass')) {
  const D = 'docs/screenshots/world/w05';
  const harbour = async (p, flags) => {
    await p.evaluate((flags) => { RB.game.debugStart('sg.harbor', 30, 22, { comp: 'suzu', flags: Object.assign({ departed: true, ch1_done: true, sg_arrived: true }, flags || {}) }); }, flags || null);
    await p.waitForTimeout(1000);
    await p.addStyleTag({ content: '#wl-dev{display:none!important}' });
    await p.waitForTimeout(300);
  };
  const shot = async (name, query, o = {}) => {
    const { p, ctx, errors } = await page(b, url + query, { viewport: o.viewport || { width: 1440, height: 900 }, dpr: o.dpr || 1, mobile: o.mobile, touch: o.mobile });
    await harbour(p, o.flags);
    if (o.setup) await p.evaluate(o.setup);
    await p.waitForTimeout(500);
    await webp(p, await p.screenshot(), D, name + '.webp');
    for (const [tag, clip] of o.crops || []) await webp(p, await p.screenshot({ clip }), D, name + '_' + tag + '.webp', 3);
    if (errors.length) console.log(name, 'page errors:', errors.join('; '));
    await ctx.close();
  };
  const crops = [['market', { x: 680, y: 230, width: 360, height: 140 }], ['quay', { x: 140, y: 460, width: 420, height: 200 }], ['piers', { x: 300, y: 640, width: 640, height: 260 }]];
  await shot('d1440_game', '');
  await shot('d1440_proof', '?dev=world', { crops });
  await shot('d1440_camera_only', '?dev=world', { setup: () => RB.worldLook.set({ kit: false, light: false, atmos: false }) });
  await shot('d1440_proof_evening', '?dev=world', { flags: { sg_evening: true } });
  await shot('d2048_proof', '?dev=world', { viewport: { width: 2048, height: 1046 }, dpr: 1.25 });
  await shot('p375_game', '', { viewport: { width: 375, height: 667 }, dpr: 3, mobile: true });
  await shot('p375_proof', '?dev=world', { viewport: { width: 375, height: 667 }, dpr: 3, mobile: true });
  // Kiyo's two kinds of round (a sale, and handing the parcels across), one frame from the middle of each step
  for (const [file, n] of [['kiyo_sale.webp', 1], ['kiyo_handover.webp', 3]]) {
    const { p, ctx } = await page(b, url + '?dev=world', { viewport: { width: 1440, height: 900 } });
    await harbour(p);
    await p.clock.install();
    await p.clock.pauseAt(await p.evaluate(() => Date.now() + 50));
    const info = await p.evaluate((n) => { const a = RB.world.W.npcs.find((q) => q.id === 'kiyo'), T = 100000; a._act = { kind: 'sell', t0: T, n }; let acc = 0; const marks = RB.worldActs.sellRound(n).map(([ph, ms]) => { const m = [ph, T + acc + ms * 0.5]; acc += ms; return m; }); return { marks, c: RB.render.tileToCss(a.x, a.y) }; }, n);
    const frames = [];
    for (const [ph, at] of info.marks) { await p.evaluate((at) => RB.render.frame(at), at); frames.push([ph, (await p.screenshot({ clip: { x: info.c.x - 30, y: info.c.y - 40, width: 100, height: 80 } })).toString('base64')]); }
    const data = await p.evaluate(async (frames) => {
      const imgs = await Promise.all(frames.map(async ([ph, b64]) => { const i = new Image(); i.src = 'data:image/png;base64,' + b64; await i.decode(); return [ph, i]; }));
      const s = 3, cols = 4, w = imgs[0][1].naturalWidth * s, h = imgs[0][1].naturalHeight * s;
      const c = document.createElement('canvas'); c.width = cols * (w + 6); c.height = Math.ceil(imgs.length / cols) * (h + 22);
      const g = c.getContext('2d'); g.fillStyle = '#1b2030'; g.fillRect(0, 0, c.width, c.height); g.imageSmoothingEnabled = false;
      imgs.forEach(([ph, i], k) => { const x = (k % cols) * (w + 6), y = Math.floor(k / cols) * (h + 22); g.drawImage(i, x, y + 18, w, h); g.fillStyle = '#fff'; g.font = '14px sans-serif'; g.fillText((k + 1) + '. ' + ph, x + 4, y + 14); });
      return c.toDataURL('image/webp', 0.9);
    }, frames);
    fs.mkdirSync(path.join(root, D), { recursive: true });
    fs.writeFileSync(path.join(root, D, file), Buffer.from(data.split(',')[1], 'base64'));
    written.push(path.join(D, file));
    await ctx.close();
  }
}

await b.close();
srv.close();
console.log('wrote ' + written.length + ' captures:\n  ' + written.join('\n  '));
