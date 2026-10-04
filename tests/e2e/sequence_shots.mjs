// Evidence for the illustrated sequences (not part of the default suite): each sequence played in the BUILT game
// from a synthetic starting point (RB.game.debugStart at the scene's place with the flags its caller sets; a
// fixture companion), advanced line by line, and each shot captured at its hold — the dialogue sheet and the
// controls on screen as a player sees them — at 1280×720, 390×844 and 844×390; and the prologue's six shots the
// same way. Written as small WebP files (encoded by the browser) to docs/screenshots/sequences/.
// Usage: node tests/e2e/sequence_shots.mjs [outDir] [--only ch1.bridge,prologue,ch3.assembly,ch4.lamp,ch4.inn,…]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const args = process.argv.slice(2);
const OUT = path.resolve(args[0] && !args[0].startsWith('--') ? args[0] : path.join(root, 'docs/screenshots/sequences'));
const oi = args.indexOf('--only'), ONLY = oi >= 0 ? args[oi + 1].split(',') : null;
fs.mkdirSync(OUT, { recursive: true });
const VPS = [['1280x720', { width: 1280, height: 720 }, 1], ['390x844', { width: 390, height: 844 }, 3], ['844x390', { width: 844, height: 390 }, 3]];
const BASE = { rw_arrived: true, rw_road_lit: true, departed: true, ch1_done: true };
// (the Chapter 3–4 runs: the challenges and the kana lesson are stubbed to pass, a choice is picked by its text, and
// `shots` limits a branch run to the shots only that branch has; `also` names further sequences the scene calls)
const CH3 = Object.assign({}, BASE, { ch2_done: true, co_arrived: true, co_kiln_done: true, co_tokiwa_page: true, co_suzu_done: true });
const CH4 = Object.assign({}, BASE, { ch2_done: true, ch3_done: true, sb_storm: true, sb_morning: true, sb_quiet_done: true, sb_obs_open: true, sb_boss_done: true });
const RUNS = [
  { seq: 'ch1.bridge', scene: 'rw.bridge_scene', at: ['rw.village', 31, 17], flags: { rw_echo_done: true, bridge_fixed: true } },
  { seq: 'ch2.notice', scene: 'sg.omi_wataru', at: ['sg.office', 5, 6], comp: 'mio', flags: Object.assign({}, BASE, { sg_wataru_confessed: true, sg_wataru_self: true }), give: 'sg_notice' },
  { seq: 'ch2.plate', scene: 'sg.asahi_name', at: ['sg.glass', 6, 6], comp: 'suzu', flags: BASE, give: 'sg_registry' },
  { seq: 'ch3.assembly', also: ['ch3.firebreaks'], scene: 'co.assembly', at: ['co.village', 23, 17], comp: 'mio', flags: Object.assign({ co_bell_rung: true }, CH3), pick: 'names of the dead' },
  { seq: 'ch3.assembly', scene: 'co.assembly', at: ['co.village', 23, 17], comp: 'nao', flags: CH3, pick: 'firebreaks', shots: ['living'] },
  { seq: 'ch3.assembly', scene: 'co.assembly', at: ['co.village', 23, 17], comp: 'suzu', flags: CH3, pick: 'Grandma Ume', shots: ['ume'] },
  { seq: 'ch4.lamp', also: ['ch4.reply'], scene: 'sb.lamp_name', at: ['sb.obs_dome', 7, 9], comp: 'ren', flags: CH4, pick: 'even when no one' },
  { seq: 'ch4.lamp', also: ['ch4.reply'], scene: 'sb.lamp_name', at: ['sb.obs_dome', 7, 9], comp: 'mio', flags: CH4, pick: 'waiting for, not the lamp', shots: ['go', 'give'] }, // (line 120, only on this branch, holds the handover)
  { seq: 'ch4.lamp', scene: 'sb.lamp_name', at: ['sb.obs_dome', 7, 9], comp: 'suzu', flags: CH4, pick: 'leave the lamp', shots: ['both'] },
  { seq: 'ch4.inn', scene: 'sb.next_day_inn', at: ['sb.inn', 8, 9], comp: 'nao', flags: Object.assign({ sb_evening: true, sb_lamp_lit: true, ch4_done: true }, CH4) },
  { seq: 'ch4.morning', scene: 'sb.quiet_morning', at: ['sb.inn_room', 6, 5], comp: 'mio', flags: Object.assign({}, BASE, { ch2_done: true, ch3_done: true, sb_storm: true, sb_hearth_done: true }) },
];
const { srv, url } = await serve();
const b = await launch();
let n = 0, bytes = 0;
// Phone captures are taken at the device's pixel ratio (3) and written at CSS size, so the files stay small.
async function save(p, file) {
  const png = await p.screenshot();
  const webp = await p.evaluate(async (b64) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const d = window.devicePixelRatio || 1;
    const c = document.createElement('canvas'); c.width = Math.round(img.width / d); c.height = Math.round(img.height / d);
    const g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/webp', 0.8);
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
      if (R.pick || R.also) { RB.challenge.run = async () => ({ ok: true }); RB.lessons.run = async () => {}; }
      RB.game.settings.textSpeed = 'instant';
      await new Promise((r) => setTimeout(r, 500));
      window.__done = false;
      RB.script.run(R.scene).then(() => { window.__done = true; });
    }, R);
    const shot = {};
    const mine = [R.seq].concat(R.also || []);
    // Next is pressed once per line shown (a second press in the gap before a fade could carry the next line on unseen)
    let lastN = -1;
    for (let i = 0; i < 600; i++) {
      const st = await p.evaluate(() => ({ done: window.__done, s: RB.sequence.state(), n: RB.game.s.backlog.length, open: RB.ui.dialogue.isOpen(), choice: !!document.querySelector('.choices:not(.hidden) .choice'), card: !!document.querySelector('.banner-layer') }));
      if (st.done) break;
      if (st.choice) {
        const k = await p.evaluate((t) => [...document.querySelectorAll('.choices:not(.hidden) .choice')].findIndex((c) => c.textContent.includes(t)), R.pick || '');
        await p.locator('.choices:not(.hidden) .choice').nth(Math.max(0, k)).click();
        await p.waitForTimeout(150);
        continue;
      }
      if (st.card) { await p.locator('.banner-layer').click().catch(() => {}); await p.waitForTimeout(600); continue; }
      if (st.s && mine.includes(st.s.id) && (!R.shots || R.shots.includes(st.s.shot))) {
        await p.waitForFunction(() => { const s = RB.sequence.state(); return !s || s.state === 'holding'; }, null, { timeout: 6000 }).catch(() => {});
        await p.waitForTimeout(250);
        const s = await p.evaluate(() => RB.sequence.state());
        if (s) { await save(p, s.id + '_' + s.shot + '_' + tag + '.webp'); shot[s.id + '/' + s.shot] = s.phase; }
      }
      if (st.open && st.n !== lastN) { lastN = st.n; await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance(true)); }
      await p.waitForTimeout(st.s ? 60 : 30);
    }
    console.log(tag + ' ' + R.seq + (R.shots ? ' (' + R.shots.join(',') + ')' : '') + ': ' + Object.entries(shot).map(([k, v]) => k + '@' + v).join(', '));
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
