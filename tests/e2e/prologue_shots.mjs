// Evidence for the prologue's shots (docs/screenshots/prologue/): stills of the
// real flow (each with its own caption) at 1920×1080, 2000×1090 and 390×844 —
// each shot held at one moment so the stills are repeatable; the traveller at
// the start, middle and end of the walk — and, with --video, two real-time
// clips at 1280×720 (the lantern's name going; the traveller's walk).
// Usage: node tests/e2e/prologue_shots.mjs [--video]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const out = path.join(root, 'docs', 'screenshots', 'prologue', 'after');
fs.mkdirSync(out, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
const KINDS = ['road', 'tea', 'cup', 'lantern', 'bridge', 'walker'];
const MOMENT = { road: 0.5, tea: 0.5, cup: 0.5, lantern: 0.45, bridge: 0.5, walker: 0.15 };
async function webp(p, png, file) {
  const data = await p.evaluate(async (src) => { const im = new Image(); im.src = src; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); return c.toDataURL('image/webp', 0.9).split(',')[1]; }, 'data:image/png;base64,' + png.toString('base64'));
  fs.writeFileSync(path.join(out, file), Buffer.from(data, 'base64'));
}
// hold the current shot at moment k (the prologue's own clock is set aside; Next still turns the captions)
const pin = (p, kind, k) => p.evaluate(({ kind, k }) => {
  const vis = (h) => { const a = document.getElementById('world').getBoundingClientRect(), s = document.querySelector('.cr-prologue .slip').getBoundingClientRect(); return ((s.top - a.top) * h) / a.height; };
  const fn = (c, w, h) => RB.prologueArt.draw(kind, c, w, h, 4000, k, { vb: vis(h), still: RB.game.reducedMotion() });
  fn.art = true;
  RB.render.setOverride(fn);
}, { kind, k });

for (const [tag, vp, dpr] of [['1920x1080', { width: 1920, height: 1080 }, 1], ['2000x1090', { width: 2000, height: 1090 }, 1], ['390x844', { width: 390, height: 844 }, 3]]) {
  const { p } = await page(b, url, { viewport: vp, dpr, mobile: dpr > 1, touch: dpr > 1 });
  await p.click('text=New Game');
  await p.click('.slot[data-slot="1"] [data-a=start]');
  await p.waitForSelector('.cr-prologue .slip');
  for (let i = 0; i < KINDS.length; i++) {
    if (i) await p.click('.cr-prologue [data-a=next]');
    const kind = KINDS[i];
    for (const k of kind === 'walker' ? [0, 0.5, 1] : [MOMENT[kind]]) {
      await pin(p, kind, k);
      await p.mouse.move(2, 2);
      await p.waitForTimeout(350);
      await webp(p, await p.screenshot(), tag + '_' + (i + 1) + '_' + kind + (kind === 'walker' ? '_' + Math.round(k * 100) : '') + '.webp');
    }
  }
  console.log('stills', tag);
  await p.close();
}

if (process.argv.includes('--video')) {
  for (const [name, nexts] of [['lantern_1280', 3], ['walker_1280', 5]]) {
    const dir = path.join(root, 'tests', 'e2e', 'out', 'prologue_video');
    fs.mkdirSync(dir, { recursive: true });
    const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir, size: { width: 1280, height: 720 } } });
    const { p } = await page(b, url, { context: ctx });
    await p.click('text=New Game');
    await p.click('.slot[data-slot="1"] [data-a=start]');
    await p.waitForSelector('.cr-prologue .slip');
    for (let i = 0; i < nexts; i++) { await p.click('.cr-prologue [data-a=next]'); await p.waitForTimeout(120); }
    await p.mouse.move(2, 2);
    await p.waitForTimeout(8300);
    const v = p.video();
    await ctx.close();
    fs.copyFileSync(await v.path(), path.join(out, name + '.webm'));
    console.log('clip', name);
  }
}
await b.close(); srv.close();
