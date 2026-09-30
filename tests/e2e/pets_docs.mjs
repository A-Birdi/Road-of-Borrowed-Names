// Copies a curated set of pet captures (tests/e2e/out/pets/) into docs/screenshots/pets/ as WebP at
// full scale (pixel art is not smoothed), optionally cropped, and small videos as they are.
// Usage: node tests/e2e/pets_docs.mjs name[:x,y,w,h][@quality] …   (names without .png, from tests/e2e/out/pets/;
// quality 0–1, default 0.92)
import fs from 'node:fs';
import path from 'node:path';
import { chromium, root } from './lib.mjs';

const src = path.join(root, 'tests/e2e/out/pets');
const out = path.join(root, 'docs/screenshots/pets');
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
for (const arg of process.argv.slice(2)) {
  const [spec, qs] = arg.split('@');
  const [name, crop] = spec.split(':');
  const quality = qs ? Number(qs) : 0.92;
  const file = path.join(src, name + '.png');
  if (!fs.existsSync(file)) { console.log('missing ' + file); continue; }
  const data = 'data:image/png;base64,' + fs.readFileSync(file).toString('base64');
  const b64 = await page.evaluate(async ([data, crop, quality]) => {
    const img = new Image(); img.src = data; await img.decode();
    const [x, y, w, h] = crop ? crop.split(',').map(Number) : [0, 0, img.width, img.height];
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(img, x, y, w, h, 0, 0, w, h);
    return c.toDataURL('image/webp', quality).split(',')[1];
  }, [data, crop || null, quality]);
  const dst = path.join(out, name + '.webp');
  fs.writeFileSync(dst, Buffer.from(b64, 'base64'));
  console.log('wrote ' + path.relative(root, dst) + ' (' + Math.round(fs.statSync(dst).size / 1024) + ' KiB)');
}
await browser.close();
