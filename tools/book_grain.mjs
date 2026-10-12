// The book's paper grain, baked (LP-1, Robin's Firefox report): the tile the Ledger used to draw from an SVG
// feTurbulence filter, rasterized once here, in Chromium, from that same SVG, and written as an embedded PNG in
// src/styles/91_book_grain.css. The pages then paint a ready image instead of asking each browser to run the filter
// (Firefox rasterizes vector backgrounds again as their scale changes, as in the book's opening). The noise is the
// SVG's own: baseFrequency .85, two octaves, stitched tiles, the brown ink at 8.5 % strength. It is baked at twice the
// tile's size and declared 2x (-webkit-image-set, which Chromium, Safari and Firefox 90+ all read; the unprefixed
// form would drop the pages' whole layered background in an older Chromium), so it keeps 180 CSS px per tile.
// Usage: node tools/book_grain.mjs   (rewrites src/styles/91_book_grain.css; rerun only if the grain should change)
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pw;
try { pw = await import('playwright'); } catch { pw = await import('/opt/node22/lib/node_modules/playwright/index.mjs'); }
const TILE = 180, SCALE = 2;
// the original tile (as it stood in src/styles/90_book.css), drawn at SCALE in the same user space
export const SVG = (px) => `<svg xmlns='http://www.w3.org/2000/svg' width='${px}' height='${px}' viewBox='0 0 ${TILE} ${TILE}'><filter id='n' x='0' y='0'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .32 0 0 0 0 .24 0 0 0 0 .12 0 0 0 .085 0'/></filter><rect width='${TILE}' height='${TILE}' filter='url(#n)'/></svg>`;

const b = await pw.chromium.launch();
const p = await b.newPage();
const png = await p.evaluate(async ([svg, px]) => {
  const img = new Image();
  img.src = 'data:image/svg+xml,' + encodeURIComponent(svg);
  await img.decode();
  const c = document.createElement('canvas');
  c.width = px; c.height = px;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0, px, px);
  // the colour is the filter's constant brown; only the alpha carries the noise
  const d = g.getImageData(0, 0, px, px);
  return Array.from({ length: px * px }, (_, i) => d.data[i * 4 + 3]);
}, [SVG(TILE * SCALE), TILE * SCALE]);
await b.close();
// an indexed PNG: 256 entries of the filter's brown (.32 .24 .12 of 255), entry i at alpha i; a pixel is its alpha
const px = TILE * SCALE, BROWN = [82, 61, 31];
const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (buf) => { let c = 0xffffffff; for (const x of buf) c = crcT[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const t = Buffer.from(type, 'ascii'), len = Buffer.alloc(4), cr = Buffer.alloc(4); len.writeUInt32BE(data.length); cr.writeUInt32BE(crc(Buffer.concat([t, data]))); return Buffer.concat([len, t, data, cr]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(px, 0); ihdr.writeUInt32BE(px, 4); ihdr[8] = 8; ihdr[9] = 3; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
const plte = Buffer.alloc(256 * 3); for (let i = 0; i < 256; i++) plte.set(BROWN, i * 3);
const trns = Buffer.from(Array.from({ length: 256 }, (_, i) => i));
const raw = Buffer.alloc(px * (px + 1)); for (let y = 0; y < px; y++) { raw[y * (px + 1)] = 0; for (let x = 0; x < px; x++) raw[y * (px + 1) + 1 + x] = png[y * px + x]; }
const file = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('PLTE', plte), chunk('tRNS', trns), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
const meanAlpha = png.reduce((a, v) => a + v, 0) / png.length;
png.url = 'data:image/png;base64,' + file.toString('base64');
png.meanAlpha = meanAlpha;
const out = path.join(root, 'src', 'styles', '91_book_grain.css');
fs.writeFileSync(out, `/* The book's paper grain (LP-1): the tile src/styles/90_book.css used to draw with an SVG feTurbulence filter,
 * baked from that same SVG by tools/book_grain.mjs (${TILE}×${TILE} CSS px, drawn at ${SCALE}x). Generated: do not edit by hand. */
:root { --bk-tooth: -webkit-image-set(url("${png.url}") ${SCALE}x); }
`);
console.log('wrote ' + path.relative(root, out) + ': ' + Math.round(png.url.length / 1024) + ' KiB of data URI; mean alpha ' + png.meanAlpha.toFixed(2) + '/255');
