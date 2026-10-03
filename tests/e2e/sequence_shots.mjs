// Evidence for the illustrated sequences (not part of the default suite): each sequence played in the BUILT game
// from a synthetic starting point (RB.game.debugStart at the scene's place with the flags its caller sets; a
// fixture companion), advanced line by line, and each shot captured at its hold — the dialogue sheet and the
// controls on screen as a player sees them — at 1280×720, 390×844 and 844×390; and the prologue's six shots the
// same way. Written as small WebP files (encoded by the browser) to docs/screenshots/sequences/.
// Usage: node tests/e2e/sequence_shots.mjs [outDir] [--only ch1.bridge,prologue]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const args = process.argv.slice(2);
const OUT = path.resolve(args[0] && !args[0].startsWith('--') ? args[0] : path.join(root, 'docs/screenshots/sequences'));
const oi = args.indexOf('--only'), ONLY = oi >= 0 ? args[oi + 1].split(',') : null;
fs.mkdirSync(OUT, { recursive: true });
const VPS = [['1280x720', { width: 1280, height: 720 }, 1], ['390x844', { width: 390, height: 844 }, 3], ['844x390', { width: 844, height: 390 }, 3]];
const BASE = { rw_arrived: true, rw_road_lit: true, departed: true, ch1_done: true };
const RUNS = [
  { seq: 'ch1.bridge', scene: 'rw.bridge_scene', at: ['rw.village', 31, 17], flags: { rw_echo_done: true, bridge_fixed: true } },
  { seq: 'ch2.notice', scene: 'sg.omi_wataru', at: ['sg.office', 5, 6], comp: 'mio', flags: Object.assign({}, BASE, { sg_wataru_confessed: true, sg_wataru_self: true }), give: 'sg_notice' },
  { seq: 'ch2.plate', scene: 'sg.asahi_name', at: ['sg.glass', 6, 6], comp: 'suzu', flags: BASE, give: 'sg_registry' },
];
const { srv, url } = await serve();
const b = await launch();
let n = 0, bytes = 0;
async function save(p, file) {
  const png = await p.screenshot();
  const webp = await p.evaluate(async (b64) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL('image/webp', 0.82);
  }, png.toString('base64'));
  const buf = Buffer.from(webp.split(',')[1], 'base64');
  fs.writeFileSync(path.join(OUT, file), buf);
  n++; bytes += buf.length;
}
for (const [tag, vp, dpr] of VPS) {
  for (const R of RUNS) {
    if (ONLY && !ONLY.includes(R.seq)) continue;
    const { p, ctx } = await page(b, url, { viewport: vp, dpr, mobile: dpr > 1, touch: dpr > 1 });
    await p.evaluate(async (R) => {
      RB.game.debugStart(R.at[0], R.at[1], R.at[2], { comp: R.comp, flags: Object.assign({}, R.flags), dir: 'up' });
      if (R.give) RB.state.give(RB.game.s, R.give, 1);
      RB.game.settings.textSpeed = 'instant';
      await new Promise((r) => setTimeout(r, 500));
      window.__done = false;
      RB.script.run(R.scene).then(() => { window.__done = true; });
    }, R);
    const shot = {};
    for (let i = 0; i < 60; i++) {
      const st = await p.evaluate(() => ({ done: window.__done, s: RB.sequence.state() }));
      if (st.done) break;
      if (st.s) {
        await p.waitForFunction(() => { const s = RB.sequence.state(); return !s || s.state === 'holding'; }, null, { timeout: 6000 }).catch(() => {});
        await p.waitForTimeout(250);
        const s = await p.evaluate(() => RB.sequence.state());
        if (s) { await save(p, R.seq + '_' + s.shot + '_' + tag + '.webp'); shot[s.shot] = s.phase; }
      }
      await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance(true));
      await p.waitForTimeout(st.s ? 60 : 30);
    }
    console.log(tag + ' ' + R.seq + ': ' + Object.entries(shot).map(([k, v]) => k + '@' + v).join(', '));
    await ctx.close();
  }
  if (!ONLY || ONLY.includes('prologue')) {
    const { p, ctx } = await page(b, url, { viewport: vp, dpr, mobile: dpr > 1, touch: dpr > 1 });
    await p.click('text=New Game');
    await p.click('.slot[data-slot="1"] [data-a=start]');
    await p.waitForSelector('.cr-prologue .slip').then((h) => h && h.dispose());
    for (let i = 0; i < 6; i++) {
      await p.waitForFunction(() => { const v = RB.sequence.viewState(); return v && v.state === 'holding'; }, null, { timeout: 9000 }).catch(() => {});
      await p.waitForTimeout(250);
      const v = await p.evaluate(() => RB.sequence.viewState());
      await save(p, 'prologue_' + (v.i + 1) + '_' + v.shot + '_' + tag + '.webp');
      if (i < 5) await p.click('.cr-prologue [data-a=next]');
    }
    console.log(tag + ' prologue: 6 shots');
    await ctx.close();
  }
}
await b.close(); srv.close();
console.log(n + ' images, ' + Math.round(bytes / 1024) + ' KiB → ' + path.relative(root, OUT));
