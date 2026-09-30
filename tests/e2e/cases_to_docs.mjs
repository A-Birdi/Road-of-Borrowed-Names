// Copies the curated case / Known Details captures (tests/e2e/out/cases,
// tests/e2e/out/known — made by cases_shots.mjs and known.mjs) into
// docs/screenshots/cases/ as WebP. Usage: node tests/e2e/cases_to_docs.mjs
import fs from 'node:fs';
import path from 'node:path';
import { chromium, root } from './lib.mjs';

const PICK = [
  ['cases', 'world_quay_bench_1280x800'], ['cases', 'world_seto_house_1280x800'], ['cases', 'world_old_footing_1280x800'],
  ['cases', 'world_lighthouse_sketch_1280x800'], ['cases', 'world_star_stair_1280x800'], ['cases', 'world_seat_framed_1280x800'],
  ['cases', 'world_tideboard_chalk_1280x800'],
  ['cases', 'record_parcel_1280x800'], ['cases', 'record_parcel_compare_1280x800'], ['cases', 'record_view_sheet_1280x800'],
  ['cases', 'record_view_turned_1280x800'], ['cases', 'record_view_help_1280x800'], ['cases', 'record_view_solved_1280x800'],
  ['cases', 'record_list_390x844'], ['cases', 'record_view_390x844'], ['cases', 'record_view_sheet_390x844'],
  ['known', 'known_tower_solved_1280x800'], ['known', 'known_pins_1280x800'], ['known', 'known_harbour_390x844'], ['known', 'known_harbour_list_390x844'],
];
const out = path.join(root, 'docs', 'screenshots', 'cases');
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
let n = 0, bytes = 0;
for (const [dir, name] of PICK) {
  const src = path.join(root, 'tests/e2e/out', dir, name + '.png');
  if (!fs.existsSync(src)) { console.log('missing ' + src); continue; }
  const data = 'data:image/png;base64,' + fs.readFileSync(src).toString('base64');
  const b64 = await page.evaluate(async (data) => {
    const img = new Image(); img.src = data; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL('image/webp', 0.82).split(',')[1];
  }, data);
  const buf = Buffer.from(b64, 'base64');
  fs.writeFileSync(path.join(out, name + '.webp'), buf);
  n++; bytes += buf.length;
}
await browser.close();
console.log(n + ' images, ' + Math.round(bytes / 1024) + ' KiB');
