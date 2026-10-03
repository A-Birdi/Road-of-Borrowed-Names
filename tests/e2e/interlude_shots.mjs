// Evidence for the interludes (not part of the default suite): the wait at the tide-watcher's window at
// 2000×1090 (the owner's window), 1280×800 and 390×844 — at the first line, ten seconds in, when Shiori
// says it is time, and with the fog — and a line said in the dark. Synthetic campaign, fresh context.
// Usage: node tests/e2e/interlude_shots.mjs [outDir]   (default docs/screenshots/interludes)
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const OUT = path.resolve(process.argv[2] || path.join(root, 'docs/screenshots/interludes'));
fs.mkdirSync(OUT, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
async function webp(p, file) {
  const png = await p.screenshot();
  const data = await p.evaluate(async (src) => { const im = new Image(); im.src = src; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); return c.toDataURL('image/webp', 0.88).split(',')[1]; }, 'data:image/png;base64,' + png.toString('base64'));
  fs.writeFileSync(path.join(OUT, file), Buffer.from(data, 'base64'));
  console.log('wrote', file);
}
const line = (p, re) => p.waitForFunction((src) => { const t = document.querySelector('#ui > .dlg:not(.hidden) .txt'); return !!t && new RegExp(src).test(t.innerText); }, re, { timeout: 8000 }).catch(() => {});
for (const [W, H] of [[2000, 1090], [1280, 800], [390, 844]]) {
  const tag = W + 'x' + H;
  const { p } = await page(b, url, { viewport: { width: W, height: H } });
  await p.evaluate(async () => {
    RB.game.debugStart('sg.tidehut', 4, 4, { comp: 'suzu', dir: 'up', flags: { ch1_done: true, departed: true, sg_tide_read: true } });
    RB.game.s.quests.sg_main = { stage: 5 };
    RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
    await new Promise((r) => setTimeout(r, 300));
    RB.script.run('sg.shiori_tide', { npc: 'shiori' });
  });
  await p.waitForFunction(() => !!document.querySelector('#ui > .choices:not(.hidden) .choice'), null, { timeout: 8000 });
  await p.evaluate(() => { const c = [...document.querySelectorAll('#ui > .choices .choice')].find((e) => /wait here/.test(e.innerText)); c.focus(); });
  await p.keyboard.press('Enter');
  await line(p, 'drinking the weak tea'); await p.waitForTimeout(1500);
  await webp(p, tag + '_1_wait.webp');
  await p.waitForTimeout(8500);
  await webp(p, tag + '_2_wait_10s.webp');
  for (let i = 0; i < 3 && !(await p.evaluate(() => /It's time/.test((document.querySelector('#ui > .dlg .txt') || {}).innerText || ''))); i++) { await p.keyboard.press('z'); await p.waitForTimeout(250); }
  await p.waitForTimeout(2800);
  await webp(p, tag + '_3_road.webp');
  await p.keyboard.press('z'); await line(p, 'white sand road'); await p.keyboard.press('z'); await line(p, 'thick white fog');
  await p.waitForTimeout(3200);
  await webp(p, tag + '_4_fog.webp');
  await p.keyboard.press('z'); await line(p, 'Windless fog'); await p.waitForTimeout(600);
  await webp(p, tag + '_5_room.webp');
  await p.close();
}
// a line said in the dark (Genzō's climb is one; any scene's `!fade out` behaves the same)
{
  const { p } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(async () => {
    RB.game.debugStart('sg.lighthouse', 4, 6, { comp: 'suzu', dir: 'up', flags: { ch1_done: true, departed: true } });
    RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
    RB.script.add('@scene shot.dark\n!fade out\nnarr: {螺旋|らせん} {階段|かいだん} を {上|のぼ}る 。 || You climb the spiral stairs.\n!fade in\n', 'shot');
    await new Promise((r) => setTimeout(r, 300));
    RB.script.run('shot.dark');
  });
  await line(p, 'spiral stairs'); await p.waitForTimeout(800);
  await webp(p, '1280x800_dark_line.webp');
  await p.close();
}
await b.close();
srv.close();
