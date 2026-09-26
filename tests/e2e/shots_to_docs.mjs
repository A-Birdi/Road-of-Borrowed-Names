// Copies a before/after screenshot pair set into docs/screenshots as
// half-scale WebP (small enough to keep in the repository), and writes an
// index. Usage: node tests/e2e/shots_to_docs.mjs <beforeDir> <afterDir> [state,state...]
import fs from 'node:fs';
import path from 'node:path';
import { chromium, root } from './lib.mjs';

const [beforeDir, afterDir, list] = process.argv.slice(2);
const STATES = (list || 'title,slots,create,create2,journey,words,satchel,map,settings,dialogue,help,chal,combat,world_rw,world_sg,world_co,world_sb,world_lf,world_sa').split(',');
const VPS = ['390x844', '1280x800'];
const out = path.join(root, 'docs', 'screenshots');
const browser = await chromium.launch();
const page = await browser.newPage();
async function toWebp(src, dst) {
  const data = 'data:image/png;base64,' + fs.readFileSync(src).toString('base64');
  const b64 = await page.evaluate(async (data) => {
    const img = new Image(); img.src = data; await img.decode();
    const c = document.createElement('canvas'); c.width = Math.round(img.width / 2); c.height = Math.round(img.height / 2);
    const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/webp', 0.9).split(',')[1];
  }, data);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, Buffer.from(b64, 'base64'));
}
const rows = [];
for (const st of STATES) for (const vp of VPS) {
  const name = st + '_' + vp;
  const b = path.join(beforeDir, name + '.png'), a = path.join(afterDir, name + '.png');
  const hasB = fs.existsSync(b), hasA = fs.existsSync(a);
  if (hasB) await toWebp(b, path.join(out, 'before', name + '.webp'));
  if (hasA) await toWebp(a, path.join(out, 'after', name + '.webp'));
  rows.push({ st, vp, hasB, hasA });
}
await browser.close();
console.log(rows.filter((r) => r.hasA).length + ' after, ' + rows.filter((r) => r.hasB).length + ' before');
