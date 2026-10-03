// Captures for the props and environment balance pass (docs/expressive/reports/props_review.md), from a BUILT
// page through the real renderer and camera at 1280×800 (two device px per art px). Synthetic campaigns in a
// fresh browser profile; no player save is used. Each shot is a crop round the prop, in a story state; an
// animated one is a strip of frames taken from the running game at a fixed step (left to right), so a
// flicker's pace shows on a still page. Writes WebP files to docs/screenshots/props_balance/ named
// <tag>_<shot>.webp, each under about 90 KB.
// Usage: node tests/e2e/props_balance_shots.mjs --tag before --html tests/e2e/out/before_index.html
//        node tests/e2e/props_balance_shots.mjs --tag after [--only a,b] [--outdir dir]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const argv = process.argv.slice(2);
const arg = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
const TAG = arg('--tag', 'after');
const HTML = arg('--html', 'index.html');
const ONLY = arg('--only', null);
const OUT = path.resolve(arg('--outdir', path.join(root, 'docs/screenshots/props_balance')));
fs.mkdirSync(OUT, { recursive: true });

const F1 = { rw_arrived: true, rw_road_lit: true, rw_echo_done: true, departed: true, rw_lantern_s: true, rw_lantern_b: true };
const F2 = { rw_arrived: true, rw_road_lit: true, departed: true, ch1_done: true };
const F2B = Object.assign({ sg_boss_done: true, sg_returned: true }, F2);
const F3 = { ch1_done: true, ch2_done: true, departed: true };
const F5 = { ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, departed: true, lf_town_intro: true };
const F6 = { ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, ch5_done: true, departed: true, sa_descent: true, end_kasane_trial: true };
// [shot, map, player x, y, facing, flags, crop in tiles [x0, y0, x1, y1], frames (count, step ms) or null]
const SHOTS = [
  ['glassworks_furnace_before_ash', 'sg.glass', 6, 6, 'up', F2, [0.5, 0, 5, 4.6], null],
  ['glassworks_furnace_after_ash', 'sg.glass', 6, 6, 'up', F2B, [0.5, 0.6, 4.5, 4.4], [6, 340]],
  ['lighthouse_lens_rationed', 'sg.lighthouse', 6, 7, 'up', F2, [3, 0.5, 6, 3.4], [6, 160]],
  ['lighthouse_lens_full', 'sg.lighthouse', 6, 7, 'up', F2B, [3, 0.5, 6, 3.4], [6, 160]],
  ['nobu_kiln', 'co.village', 45, 25, 'up', F3, [45.5, 18.5, 51, 23.4], null],
  ['oldworks_kiln_and_seal', 'co.oldworks', 15, 9, 'up', F3, [9.6, 0, 23.5, 7.4], null],
  ['lookout_glints', 'co.lookout', 7, 6, 'up', F3, [0, 0, 16, 12], null],
  ['conduits_basin', 'sa.conduits', 12, 9, 'down', F6, [9, 10, 20, 16], null],
  ['potters_wheel', 'co.pottery', 6, 7, 'up', F3, [2, 2.4, 6, 5.4], null],
  ['pottery_order_slip_table', 'co.pottery', 6, 7, 'up', F3, [7.2, 3.6, 10, 6.4], null],
  ['harbour_office_desk', 'sg.office', 5, 7, 'up', F2, [3.4, 2.4, 8.2, 5.6], null],
  ['yukimiya_shogi_table', 'sb.inn', 11, 10, 'up', { ch1_done: true, ch2_done: true, ch3_done: true, departed: true }, [12.2, 6.6, 15, 9.4], null],
  ['tokuji_cups', 'lf.tokuji', 3, 6, 'up', F5, [4, 1.6, 7, 4.4], null],
  ['lanternfall_lampposts', 'lf.town', 26, 20, 'down', F5, [21.5, 15.6, 23.5, 17.6], [10, 150]],
  ['reedwake_lantern', 'rw.village', 22, 16, 'down', F1, [19.5, 19.5, 21.5, 22.6], [10, 150]],
  ['camp_fire', 'sa.camp', 14, 12, 'down', F6, [15.5, 10.5, 17.5, 13], [8, 90]],
  ['cinder_furnace', 'co.glass', 6, 8, 'up', F3, [1.5, 0.6, 4.5, 4], [8, 150]],
];

let n = 0;
const { srv, url } = await serve();
const b = await launch();
for (const [shot, map, px, py, dir, flags, crop, frames] of SHOTS) {
  if (ONLY && !ONLY.split(',').includes(shot)) continue;
  const { p, errors, ctx } = await page(b, url + HTML, { viewport: { width: 1280, height: 800 } });
  const data = await p.evaluate(async ([map, px, py, dir, flags, crop, frames]) => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    RB.game.debugStart(map, px, py, { comp: 'mio', flags, dir });
    for (const ev of RB.content.maps[map].onEnter || []) RB.game.s.flags['enter:' + map + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    await sleep(300);
    for (let i = 0; i < 60 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await sleep(40); }
    if (RB.world.W.map.id !== map) RB.world.enter(map, px, py, dir);
    await sleep(1200);
    const cv = document.querySelector('canvas'), k = cv.width / innerWidth;
    const a = RB.render.tileToCss(crop[0], crop[1]), z = RB.render.tileToCss(crop[2], crop[3]);
    const x0 = Math.max(0, Math.round(a.x * k)), y0 = Math.max(0, Math.round(a.y * k));
    const w = Math.min(cv.width - x0, Math.round((z.x - a.x) * k)), h = Math.min(cv.height - y0, Math.round((z.y - a.y) * k));
    const count = frames ? frames[0] : 1, step = frames ? frames[1] : 0, gap = 4;
    const out = document.createElement('canvas'); out.width = count * w + (count - 1) * gap; out.height = h;
    const g = out.getContext('2d'); g.fillStyle = '#1d2026'; g.fillRect(0, 0, out.width, out.height);
    for (let i = 0; i < count; i++) {
      if (i) await sleep(step);
      g.drawImage(cv, x0, y0, w, h, i * (w + gap), 0, w, h);
    }
    let q = 0.86, u;
    for (;;) { u = out.toDataURL('image/webp', q); if (u.length * 0.75 < 90 * 1024 || q <= 0.5) break; q -= 0.06; }
    return u;
  }, [map, px, py, dir, flags, crop, frames]);
  const file = path.join(OUT, TAG + '_' + shot + '.webp');
  fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
  console.log((errors.length ? 'ERR  ' : 'ok   ') + path.relative(root, file) + ' ' + Math.round(fs.statSync(file).size / 1024) + ' KB ' + errors.join('; '));
  n++;
  await ctx.close();
}
// The portraits of the speakers with the most lines in the scripts (WI26: cohesion and the eyes in practice), at
// the desktop's display size (96 CSS px, one device px per art px): for each, the neutral still, a blink (the lids
// closed), the face of the tag their lines use most, settled, and the peak of that tag's lead-in cue.
if (!ONLY || ONLY.split(',').includes('portraits_major_speakers')) {
  const { p, errors, ctx } = await page(b, url + HTML, { viewport: { width: 1280, height: 800 } });
  const data = await p.evaluate(() => {
    RB.game.debugStart('rw.village', 22, 16, { comp: 'mio', flags: { rw_arrived: true } });
    const C = RB.content, PA = RB.portraitAnim, PO = RB.portraits, COMPS = ['nao', 'mio', 'ren', 'suzu'];
    const lines = {}, tags = {};
    for (const id in C.scenes) for (const c of C.scenes[id].cmds || []) {
      if (c.op !== 'say' || !c.who || c.who === 'narr') continue;
      for (const w of c.who === 'comp' ? COMPS : [c.who]) { lines[w] = (lines[w] || 0) + (c.who === 'comp' ? 0.25 : 1); if (c.expr && c.expr !== 'neutral') { tags[w] = tags[w] || {}; tags[w][c.expr] = (tags[w][c.expr] || 0) + 1; } }
    }
    const who = Object.keys(lines).sort((a, b2) => lines[b2] - lines[a]).filter((w) => w !== 'pc').slice(0, 24);
    const S = 96, gap = 4, lab = 16, cols = 3, cellW = 4 * S + 3 * gap + 12;
    const rows = Math.ceil(who.length / cols);
    const cv = document.createElement('canvas'); cv.width = cols * cellW + 8; cv.height = rows * (S + lab + 10) + 8;
    const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#1d2026'; g.fillRect(0, 0, cv.width, cv.height);
    who.forEach((w, i) => {
      const sj = PO.subject(w), top = Object.entries(tags[w] || {}).sort((a, b2) => b2[1] - a[1])[0];
      const tag = top ? top[0] : 'smile';
      const blink = PA.timeline(w, 'neutral', { ms: 20000, seed: 3 }).frames.find((f) => f.fr && f.fr.lids === 'closed');
      const tl = PA.timeline(w, tag, { ms: 3000, seed: 3 });
      const beats = tl.frames.filter((f) => f.t < tl.cueEnd);
      const peak = beats.length ? beats[Math.min(beats.length - 1, Math.floor(beats.length / 2))] : null;
      const shots = [['neutral', null], ['neutral', blink ? blink.fr : null], [tag, null], [tag, peak ? peak.fr : null]];
      const x0 = 4 + (i % cols) * cellW, y0 = 4 + Math.floor(i / cols) * (S + lab + 10);
      g.fillStyle = '#e6e6e6'; g.font = '12px sans-serif';
      g.fillText(w + ' — ' + Math.round(lines[w]) + ' lines; still, blink, ' + tag + ', its cue', x0, y0 + 12);
      shots.forEach(([e, fr], k) => {
        const c2 = document.createElement('canvas'); c2.width = S; c2.height = S;
        PO.paintFrame(c2, sj, e, fr);
        g.drawImage(c2, x0 + k * (S + gap), y0 + lab);
      });
    });
    let q = 0.86, u;
    for (;;) { u = cv.toDataURL('image/webp', q); if (u.length * 0.75 < 160 * 1024 || q <= 0.5) break; q -= 0.06; }
    return u;
  });
  const file = path.join(OUT, TAG + '_portraits_major_speakers.webp');
  fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
  console.log((errors.length ? 'ERR  ' : 'ok   ') + path.relative(root, file) + ' ' + Math.round(fs.statSync(file).size / 1024) + ' KB ' + errors.join('; '));
  n++;
  await ctx.close();
}
console.log(n + ' captures');
await b.close(); srv.close();
