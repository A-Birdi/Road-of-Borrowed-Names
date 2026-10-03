// Screenshots of Settings in battle for docs/screenshots/battle_settings/ (WebP): the battle with
// its Settings button, the sheet (Speed & motion; "Until the encounter is over"), and the question
// Load asks, at 1280×800 and 390×844, on the built index.html in a session-only campaign.
// Usage: node tests/e2e/battle_settings_shots.mjs
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const out = path.join(root, 'docs', 'screenshots', 'battle_settings');
fs.mkdirSync(out, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
async function webp(p, name, scale) {
  const png = await p.screenshot();
  const conv = await b.newPage();
  const b64 = await conv.evaluate(async ([data, k]) => {
    const img = new Image(); img.src = data; await img.decode();
    const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/webp', 0.8).split(',')[1];
  }, ['data:image/png;base64,' + png.toString('base64'), scale]);
  await conv.close();
  fs.writeFileSync(path.join(out, name + '.webp'), Buffer.from(b64, 'base64'));
  console.log(name + '.webp', Math.round(Buffer.from(b64, 'base64').length / 1024) + ' KiB');
}
for (const v of [{ tag: '1280x800', size: { width: 1280, height: 800 }, k: 0.75 }, { tag: '390x844', size: { width: 390, height: 844 }, phone: true, k: 1 }]) {
  const { p, ctx } = await page(b, url, { viewport: v.size, touch: !!v.phone, mobile: !!v.phone, dpr: 1 });
  await p.evaluate(() => {
    const s = RB.game.debugStart('sg.cove', 17, 6, { dir: 'right', comp: 'suzu', flags: { ch1_done: true, departed: true } });
    s.learn.profile = 'E'; s.words = ['mamoru', 'iyasu', 'hikari'];
    s.tips = { harmony: 1, harmonyFull: 1, cturn: 1, group: 1, 'intent:strike': 1, 'word:mamoru': 1, 'word:iyasu': 1, 'word:hikari': 1 };
    RB.game.settings.input = 'choice'; RB.game.settings.textSpeed = 'instant';
    RB.game.startBattle('sg.crab', {});
  });
  for (let i = 0; i < 80; i++) { const s = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), ph: RB.combat.phase() })); if (s.ph === 'choose' && !s.dlg) break; if (s.dlg) await p.keyboard.press('z'); await p.waitForTimeout(150); }
  await p.mouse.move(2, 2);
  await p.waitForTimeout(900);
  await webp(p, 'battle_' + v.tag, v.k);
  await p.keyboard.press('c');
  await p.waitForTimeout(400);
  if (v.phone) { await webp(p, 'sheet_' + v.tag, v.k); await p.click('.folio-bset [data-grp="motion"]'); await p.waitForTimeout(300); }
  await p.mouse.move(2, 2);
  await webp(p, 'sheet_motion_' + v.tag, v.k);
  if (v.phone) { await p.click('.folio-bset [data-grp=""]'); await p.waitForTimeout(200); }
  await p.click('.folio-bset [data-grp="fixed"]');
  await p.waitForTimeout(300);
  await p.mouse.move(2, 2);
  await webp(p, 'sheet_fixed_' + v.tag, v.k);
  await p.click('.folio-bset [data-leave="load"]');
  await p.waitForSelector('.confirm-scrim .csheet');
  await p.waitForTimeout(300);
  await webp(p, 'leave_' + v.tag, v.k);
  await ctx.close();
}
await b.close();
srv.close();
