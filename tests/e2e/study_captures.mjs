// The fidelity study's captures (expansion P01, C-80; src/engine/68*_study*.js; docs/future/work/P01_STUDY.md):
// stills at the game's camera, the closer one and the portrait, on a desktop, a wide desktop and a phone; the lens
// switched off and on; Suzu's idle frames; close-ups; the game as it is at the mill for comparison; and recordings
// at normal speed. No journey is loaded (never a real save). Everything goes to docs/screenshots/world/study/.
// Usage: node tests/e2e/study_captures.mjs [stills] [frames] [record]   (default: all three)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { serve, launch, page, root } from './lib.mjs';

const want = process.argv.slice(2);
const doing = (s) => !want.length || want.includes(s);
const D = 'docs/screenshots/world/study';
const OUT = path.join(root, D);
fs.mkdirSync(OUT, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
const written = [];

async function webp(p, png, file, scale = 1) {
  const data = await p.evaluate(async ({ b64, scale }) => {
    const i = new Image(); i.src = 'data:image/png;base64,' + b64; await i.decode();
    const c = document.createElement('canvas'); c.width = i.naturalWidth * scale; c.height = i.naturalHeight * scale;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    g.drawImage(i, 0, 0, c.width, c.height);
    return c.toDataURL('image/webp', 0.92);
  }, { b64: png.toString('base64'), scale });
  fs.writeFileSync(path.join(OUT, file), Buffer.from(data.split(',')[1], 'base64'));
  written.push(path.join(D, file));
}
// the study open at a fixed instant of its loop (the clock held), the given camera and layers
async function study(o) {
  const { p, ctx, errors } = await page(b, url + '?dev=world', { viewport: o.viewport || { width: 1440, height: 900 }, dpr: o.dpr || 1, mobile: o.mobile, touch: o.mobile });
  await p.addStyleTag({ content: '#wl-dev,#study-ui{display:none!important}' });
  await p.evaluate((set) => { RB.study.open(); RB.study.set(set || {}); }, o.set || null);
  await p.waitForTimeout(400);
  if (o.at != null) { await p.clock.install(); await p.clock.pauseAt(await p.evaluate(() => Date.now() + 20)); await p.evaluate((at) => RB.render.frame(RB.study.t0() + at), o.at); }
  return { p, ctx, errors };
}

if (doing('stills')) {
  const shots = [
    ['study_game_1440', { at: 5200 }],
    ['study_close_1440', { at: 5200, set: { close: true } }],
    ['study_portrait_1440', { at: 5200, set: { portrait: true } }],
    ['study_wide_2048', { at: 5200, viewport: { width: 2048, height: 1046 }, dpr: 1.25 }],
    ['study_phone_375', { at: 5200, viewport: { width: 375, height: 667 }, dpr: 3, mobile: true }],
    ['study_lens_off_1440', { at: 5200, set: { close: true, light: false, focus: false, bloom: false } }],
  ];
  for (const [name, o] of shots) {
    const { p, ctx, errors } = await study(o);
    await webp(p, await p.screenshot(), name + '.webp');
    if (name === 'study_close_1440') {
      // close-ups at 2× of the close camera: the mill's wall and door, the wheel, the roof's thatch
      for (const [tag, clip] of [['wall', { x: 330, y: 230, width: 560, height: 200 }], ['wheel', { x: 1000, y: 80, width: 440, height: 300 }], ['thatch', { x: 420, y: 0, width: 480, height: 230 }]]) await webp(p, await p.screenshot({ clip }), 'closeup_' + tag + '.webp', 2);
    }
    if (errors.length) console.log(name, 'page errors:', errors.join('; '));
    await ctx.close();
  }
  // the game as it is at the mill (its own camera; Suzu travelling with you), for comparison
  const { p, ctx } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  await p.evaluate(() => { RB.game.debugStart('rw.millroad', 10, 7, { comp: 'suzu', flags: { rw_mill_open: true, rw_echo_done: true, 'enter:rw.millroad:rw.mr_enter': true } }); });
  await p.waitForTimeout(2200);
  await webp(p, await p.screenshot(), 'game_today_mill_1440.webp');
  await ctx.close();
}

if (doing('frames')) {
  // Suzu alone: her still frame at 8×, and her idle as a strip at 5× (one frame every 400 ms, then a blink, a glance)
  const { p, ctx } = await page(b, url + '?dev=world', { viewport: { width: 900, height: 700 } });
  const strip = async (times, z, cols, file, bg) => {
    const data = await p.evaluate(({ times, z, cols, bg }) => {
      const S = RB.studySuzu; S.build();
      const W = S.FW * z, H = S.FH * z, pad = 6, rows = Math.ceil(times.length / cols);
      const c = document.createElement('canvas'); c.width = cols * (W + pad) - pad; c.height = rows * (H + pad) - pad;
      const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
      g.fillStyle = '#20262b'; g.fillRect(0, 0, c.width, c.height);
      times.forEach((t, k) => {
        const x = (k % cols) * (W + pad), y = Math.floor(k / cols) * (H + pad);
        g.fillStyle = bg; g.fillRect(x, y, W, H);
        g.drawImage(S.frameFor(S.poseAt(Math.max(0, t), t < 0)).cv, 0, 0, S.FW, S.FH, x, y, W, H);
      });
      return c.toDataURL('image/webp', 0.95);
    }, { times, z, cols, bg });
    fs.writeFileSync(path.join(OUT, file), Buffer.from(data.split(',')[1], 'base64'));
    written.push(path.join(D, file));
  };
  await strip([-1], 8, 1, 'suzu_still_8x.webp', '#6f8f63');
  await strip([0, 400, 800, 1200, 1600, 2000, 2400, 2800, 4400, 8200], 5, 5, 'suzu_idle_strip_5x.webp', '#6f8f63');
  await ctx.close();
}

if (doing('record')) {
  // normal speed, 1280×720, each camera; the lead-in (the title, before the study opens) trimmed when ffmpeg is at hand
  const ff = ['/opt/pw-browsers/ffmpeg-1011/ffmpeg-linux'].find((f) => fs.existsSync(f));
  for (const [name, set] of [['rec_game', null], ['rec_close', { close: true }], ['rec_portrait', { portrait: true }]]) {
    const dir = path.join(OUT, '.rec');
    fs.mkdirSync(dir, { recursive: true });
    const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir, size: { width: 1280, height: 720 } } });
    const t0 = Date.now();
    const { p } = await page(b, url + '?dev=world', { context: ctx });
    await p.addStyleTag({ content: '#wl-dev,#study-ui{display:none!important}' });
    await p.evaluate((set) => { RB.study.open(); if (set) RB.study.set(set); }, set);
    await p.waitForTimeout(400);
    const lead = (Date.now() - t0) / 1000 + 0.2;
    await p.waitForTimeout(12500);
    const v = p.video();
    await ctx.close();
    const raw = await v.path(), dst = path.join(OUT, name + '.webm');
    if (ff) execFileSync(ff, ['-hide_banner', '-loglevel', 'error', '-y', '-ss', lead.toFixed(2), '-i', raw, '-t', '12', '-c:v', 'libvpx', '-b:v', '2400k', '-crf', '6', '-qmin', '2', '-qmax', '30', '-an', dst]);
    else fs.renameSync(raw, dst);
    fs.rmSync(dir, { recursive: true, force: true });
    written.push(path.join(D, name + '.webm') + ' (' + Math.round(fs.statSync(dst).size / 1024) + ' KB)');
  }
}

await b.close();
srv.close();
console.log('wrote ' + written.length + ' files:\n  ' + written.join('\n  '));
