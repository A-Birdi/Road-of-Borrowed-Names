// Screenshots of Settings as a book (ST-1) for docs/screenshots/settings/ (WebP): each tab at 1280×800 (¾ scale) and
// 390×844, and "Before you set out" as a new journey begins, on the built index.html in a session-only campaign.
// Usage: node tests/e2e/settings_shots.mjs
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const out = path.join(root, 'docs', 'screenshots', 'settings');
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
  await p.evaluate(() => { RB.game.debugStart('rw.village', 22, 30, { comp: 'suzu' }); RB.ui.settings.open(); });
  await p.waitForTimeout(800);
  for (const id of ['reading', 'learning', 'play', 'audio', 'display', 'controls']) {
    await p.evaluate((id) => RB.ui.settings.tab(id), id);
    await p.mouse.move(2, 2);
    await p.waitForTimeout(400);
    await webp(p, id + '_' + v.tag, v.k);
  }
  await ctx.close();
  // a new journey: the review before its story
  const n = await page(b, url, { viewport: v.size, touch: !!v.phone, mobile: !!v.phone, dpr: 1 });
  await n.p.evaluate(() => { const s = RB.state.newCampaign({ edition: RB.edition.forNew(), profile: 'E' }); s.player.name = 'Kit'; RB.ui.settings.review(s); });
  await n.p.waitForTimeout(900);
  await n.p.mouse.move(2, 2);
  await webp(n.p, 'review_' + v.tag, v.k);
  await n.ctx.close();
}
await b.close();
srv.close();
