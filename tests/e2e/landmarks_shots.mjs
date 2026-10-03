// Captures for the landmark and room work (World review WR-04/WR-05, the observatory's
// headroom, Nao's missing floorboard), from a BUILT page through the real renderer and camera
// at normal game scale. Synthetic campaigns in a fresh browser profile; no player save is used.
// Writes WebP files to docs/screenshots/landmarks/ and docs/screenshots/bakery/, each named
// <tag>_<place>_<width>x<height>.webp, and a 3× close-up sheet of the four landmark props
// (<tag>_closeup_3x.webp: the real renderer at 3 device px per art px, cropped round each prop).
// Usage: node tests/e2e/landmarks_shots.mjs --tag before --html tests/e2e/out/before_index.html
//        node tests/e2e/landmarks_shots.mjs --tag after
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const argv = process.argv.slice(2);
const arg = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
const TAG = arg('--tag', 'after');
const HTML = arg('--html', 'index.html');
const ONLY = arg('--only', null);
const OUTDIR = arg('--outdir', null); // (for drafts: everything into one directory)
const DIRS = OUTDIR ? { landmarks: path.resolve(OUTDIR), bakery: path.resolve(OUTDIR) } : { landmarks: path.join(root, 'docs/screenshots/landmarks'), bakery: path.join(root, 'docs/screenshots/bakery') };
for (const d of Object.values(DIRS)) fs.mkdirSync(d, { recursive: true });

const FX5 = {
  rw_arrived: true, rw_road_lit: true, rw_met_tsuru: true, rw_mill_open: true, rw_echo_done: true, bridge_fixed: true, rw_koji_back: true,
  rw_evening: true, rw_hall_gather: true, departed: true, ch1_done: true,
  sg_arrived: true, sg_harbor_seen: true, sg_boss_done: true, sg_returned: true, sg_main_done: true, sg_road_open_seen: true, ch2_done: true,
  co_restored: true, ch3_done: true, sb_arrived: true, sb_lamp_lit: true, ch4_done: true, lq_kh_seen: true,
};
// [dir, name, map, player x, y, facing, flags]
const PLACES = [
  ['landmarks', 'koharuno_tree', 'lq.koharu', 22, 10, 'up', FX5],
  ['landmarks', 'koharuno_stone', 'lq.koharu', 23, 13, 'left', FX5],
  ['landmarks', 'teastall', 'sb.road', 10, 12, 'up', FX5],
  ['landmarks', 'kayo_tree', 'lf.gardens', 29, 13, 'right', FX5],
  ['bakery', 'bakery', 'lf.bakery', 3, 6, 'up', FX5],
  ['landmarks', 'warehouse_floorboard', 'rw.warehouse', 5, 7, 'up', { rw_arrived: true, rw_road_lit: true }],
];
const SIZES = [[1280, 800], [390, 844]];
const OBS_SIZES = [[2000, 1090], [1440, 900], [390, 844], [844, 390]];
// close-ups: prop crop in tiles [x0, y0, x1, y1] and where the player waits out of frame
const CLOSE = [
  ['lq.koharu', [18.5, 4, 23.5, 9.6], [25, 9, 'left']],
  ['lq.koharu', [19.5, 12.4, 24, 15.6], [26, 12, 'left']],
  ['sb.road', [7.6, 7.2, 12.4, 11.8], [14, 13, 'left']],
  ['lf.gardens', [29.4, 9.6, 33, 13.6], [27, 14, 'right']],
];

let n = 0;
async function webp(p2, png, q) {
  return p2.evaluate(async ([src, q]) => {
    const im = new Image(); im.src = src; await im.decode();
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0);
    return c.toDataURL('image/webp', q);
  }, ['data:image/png;base64,' + png.toString('base64'), q]);
}
// Save as WebP, lowering the quality until it is under ~80 KB (or the floor is reached).
async function save(p2, png, dir, name) {
  let q = 0.82, b64;
  for (;;) {
    b64 = (await webp(p2, png, q)).split(',')[1];
    if (b64.length * 0.75 < 80 * 1024 || q <= 0.5) break;
    q -= 0.08;
  }
  const f = path.join(DIRS[dir], name + '.webp');
  fs.writeFileSync(f, Buffer.from(b64, 'base64'));
  n++;
  console.log('wrote ' + path.relative(root, f) + ' (' + Math.round(fs.statSync(f).size / 1024) + ' KB, q ' + q.toFixed(2) + ')');
}
async function setup(p, map, x, y, dir, flags, still) {
  await p.evaluate(async ([map, x, y, dir, flags, still]) => {
    const s = RB.game.debugStart(map, x, y, { profile: 'E', flags, dir });
    s.learn.kanaKnown = 'both'; s.chapter = 5;
    RB.game.settings.reducedMotion = !!still;
    RB.render.invalidate();
    // wait until the place name has gone (on the condition, not a fixed time)
    const t0 = Date.now();
    await new Promise((r) => setTimeout(r, 300));
    while (document.querySelector('.place') && Date.now() - t0 < 9000) await new Promise((r) => setTimeout(r, 100));
    await new Promise((r) => setTimeout(r, 500));
    document.querySelectorAll('.notice,.toast').forEach((e) => e.remove());
  }, [map, x, y, dir, flags, still]);
}

const { srv, url } = await serve();
const b = await launch();
const target = url + HTML.replace(/^\/+/, '');
const blank = await (await b.newContext()).newPage();
console.log('build: ' + HTML + '  tag: ' + TAG);

for (const [w, h] of SIZES) {
  const { p, ctx, errors } = await page(b, target, { viewport: { width: w, height: h } });
  for (const [dir, name, map, x, y, f, flags] of PLACES) {
    if (ONLY && !name.includes(ONLY)) continue;
    await setup(p, map, x, y, f, flags, false);
    await save(blank, await p.screenshot(), dir, `${TAG}_${name}_${w}x${h}`);
  }
  if (errors.length) console.log('page errors: ' + errors.slice(0, 3).join(' | '));
  await ctx.close();
}
if (!ONLY || 'observatory'.includes(ONLY)) for (const [w, h] of OBS_SIZES) {
  const { p, ctx, errors } = await page(b, target, { viewport: { width: w, height: h } });
  await setup(p, 'sb.obs_path', 13, 6, 'up', FX5, false);
  await save(blank, await p.screenshot(), 'landmarks', `${TAG}_observatory_${w}x${h}`);
  if (errors.length) console.log('page errors: ' + errors.slice(0, 3).join(' | '));
  await ctx.close();
}
// 3× close-up sheet: 2000×1090 draws 3 device px per art px
if (!ONLY || 'closeup'.includes(ONLY)) {
  const { p, ctx, errors } = await page(b, target, { viewport: { width: 2000, height: 1090 } });
  const crops = [];
  for (const [map, [x0, y0, x1, y1], [px, py, pd]] of CLOSE) {
    await setup(p, map, px, py, pd, FX5, true);
    const r = await p.evaluate(([x0, y0, x1, y1]) => { const a = RB.render.tileToCss(x0, y0), c = RB.render.tileToCss(x1, y1); return { x: Math.round(a.x), y: Math.round(a.y), w: Math.round(c.x - a.x), h: Math.round(c.y - a.y), k: RB.render.viewSize().scale }; }, [x0, y0, x1, y1]);
    if (r.k !== 6) console.log('warning: ' + r.k / 2 + ' device px per art px (expected 3)');
    const png = await p.screenshot({ clip: { x: r.x, y: r.y, width: r.w, height: r.h } });
    if (OUTDIR) fs.writeFileSync(path.join(DIRS.landmarks, `${TAG}_closeup_${crops.length}.png`), png);
    crops.push('data:image/png;base64,' + png.toString('base64'));
  }
  if (errors.length) console.log('page errors: ' + errors.slice(0, 3).join(' | '));
  await ctx.close();
  const sheet = await blank.evaluate(async (srcs) => {
    const ims = await Promise.all(srcs.map(async (s) => { const im = new Image(); im.src = s; await im.decode(); return im; }));
    const gap = 12, W = ims.reduce((a, im) => a + im.width, 0) + gap * (ims.length + 1), H = Math.max(...ims.map((im) => im.height)) + gap * 2;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); g.fillStyle = '#1a1626'; g.fillRect(0, 0, W, H);
    let x = gap;
    for (const im of ims) { g.drawImage(im, x, gap + (H - gap * 2 - im.height)); x += im.width + gap; }
    return c.toDataURL('image/png');
  }, crops);
  await save(blank, Buffer.from(sheet.split(',')[1], 'base64'), 'landmarks', `${TAG}_closeup_3x`);
}
await b.close(); srv.close();
console.log(n + ' files');
