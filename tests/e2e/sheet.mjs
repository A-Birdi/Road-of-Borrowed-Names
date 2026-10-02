// Compose labelled PNG/WebP contact sheets from screenshots (evidence tooling; uses the browser's canvas).
// Usage: node tests/e2e/sheet.mjs <out.png|out.webp> <cols> <scale> <label=file> [<label=file> ...]
import fs from 'node:fs';
import path from 'node:path';
import { launch } from './lib.mjs';

export async function sheet(out, items, o = {}) {
  const b = o.browser || await launch();
  const pg = await b.newPage();
  const list = items.map((q) => ({ label: q.label, d: 'data:image/png;base64,' + fs.readFileSync(q.f).toString('base64') }));
  const data = await pg.evaluate(async ([list, cols, sc, type, bg]) => {
    const imgs = [];
    for (const q of list) { const im = new Image(); im.src = q.d; await im.decode(); imgs.push(im); }
    const W = Math.max(...imgs.map((i) => i.width)) * sc, H = Math.max(...imgs.map((i) => i.height)) * sc;
    const cv = document.createElement('canvas'); cv.width = cols * (W + 8) + 8; cv.height = Math.ceil(imgs.length / cols) * (H + 26) + 8;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.fillStyle = bg; c.fillRect(0, 0, cv.width, cv.height);
    c.font = '14px sans-serif'; c.fillStyle = '#eee';
    imgs.forEach((im, i) => { const x = 8 + (i % cols) * (W + 8), y = 8 + Math.floor(i / cols) * (H + 26); c.fillText(list[i].label, x + 2, y + 15); c.drawImage(im, x, y + 20, im.width * sc, im.height * sc); });
    return cv.toDataURL(type, 0.92);
  }, [list, o.cols || 4, o.scale || 1, out.endsWith('.webp') ? 'image/webp' : 'image/png', o.bg || '#1c2530']);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(data.split(',')[1], 'base64'));
  await pg.close();
  if (!o.browser) await b.close();
  return out;
}
// convert one image to WebP (keeps pixels crisp: no resampling)
export async function webp(src, out, o = {}) {
  return sheet(out, [{ label: o.label || '', f: src }], { cols: 1, scale: o.scale || 1, browser: o.browser, bg: o.bg });
}

if (process.argv[1] && process.argv[1].endsWith('sheet.mjs') && process.argv.length > 4) {
  const [out, cols, scale, ...rest] = process.argv.slice(2);
  const items = rest.map((a) => { const i = a.indexOf('='); return { label: a.slice(0, i), f: a.slice(i + 1) }; });
  await sheet(path.resolve(out), items, { cols: +cols, scale: +scale });
  console.log('wrote', out);
}
