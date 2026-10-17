// AR-1 Mill: compare two capture folders made by tools/review/ar1_mill_capture.mjs from two builds. For each PNG in
// both: identical, or the count of differing pixels and their bounding box; with --masks <dir>, a mask per pair (white:
// a difference over 12 levels, dark red: a smaller one). Reads pixels through ffmpeg (rgb24).
// Usage: node tools/review/ar1_mill_compare.mjs <dirA> <dirB> [--masks <dir>]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [, , A, B] = process.argv;
const mi = process.argv.indexOf('--masks'), masks = mi > 0 ? process.argv[mi + 1] : null;
if (masks) fs.mkdirSync(masks, { recursive: true });
const raw = (f) => {
  const [w, h] = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', f]).toString().trim().split(',').map(Number);
  return { w, h, d: execFileSync('ffmpeg', ['-loglevel', 'error', '-i', f, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 28 }) };
};
const out = {};
for (const f of fs.readdirSync(A).filter((f) => f.endsWith('.png')).sort()) {
  if (!fs.existsSync(path.join(B, f))) { out[f] = 'missing'; continue; }
  const a = raw(path.join(A, f)), b = raw(path.join(B, f)), m = masks ? Buffer.alloc(a.w * a.h * 3) : null;
  let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < a.h; y++) for (let x = 0; x < a.w; x++) {
    const i = (y * a.w + x) * 3, dd = Math.abs(a.d[i] - b.d[i]) + Math.abs(a.d[i + 1] - b.d[i + 1]) + Math.abs(a.d[i + 2] - b.d[i + 2]);
    if (!dd) continue;
    n++; if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y;
    if (m) { m[i] = dd > 12 ? 255 : 120; m[i + 1] = m[i + 2] = dd > 12 ? 255 : 0; }
  }
  out[f] = n ? { px: n, box: [x0, y0, x1, y1] } : 'identical';
  if (m && n) {
    const ppm = path.join(masks, f + '.ppm');
    fs.writeFileSync(ppm, Buffer.concat([Buffer.from('P6\n' + a.w + ' ' + a.h + '\n255\n'), m]));
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', ppm, path.join(masks, 'mask_' + f)]);
    fs.unlinkSync(ppm);
  }
}
console.log(JSON.stringify(out, null, 1));
