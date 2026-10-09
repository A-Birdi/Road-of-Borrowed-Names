// The world proof's captures (expansion P01, src/engine/65_worldlook.js; docs/future/work/P01_WORLD.md): the same
// place, the same moment, drawn by the game as it is and by the proof, at actual size, with each layer switched
// off in turn. A synthetic session (never a real save). Each section writes WebP files to its own folder.
// Usage: node tests/e2e/world_captures.mjs [section ...]   (default: every section)
//   camera   near and far views at 1440×900, 2048×1046 (1.25) and 375×667 (3)   → docs/screenshots/world/w00/
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const want = process.argv.slice(2);
const doing = (s) => !want.length || want.includes(s);
const { srv, url } = await serve();
const b = await launch();
const written = [];

async function webp(p, png, dir, file) {
  const data = await p.evaluate(async (b64) => {
    const i = new Image(); i.src = 'data:image/png;base64,' + b64; await i.decode();
    const c = document.createElement('canvas'); c.width = i.naturalWidth; c.height = i.naturalHeight;
    c.getContext('2d').drawImage(i, 0, 0);
    return c.toDataURL('image/webp', 0.9);
  }, png.toString('base64'));
  const out = path.join(root, dir);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, file), Buffer.from(data.split(',')[1], 'base64'));
  written.push(path.join(dir, file));
}
// a fixed moment in the village square: Suzu travelling, the morning's people about, clocks held
async function square(p, x = 22, y = 18) {
  await p.evaluate(({ x, y }) => { RB.game.debugStart('rw.village', x, y, { comp: 'suzu', flags: { departed: true } }); }, { x, y });
  await p.waitForTimeout(900);
}
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

await b.close();
srv.close();
console.log('wrote ' + written.length + ' captures:\n  ' + written.join('\n  '));
