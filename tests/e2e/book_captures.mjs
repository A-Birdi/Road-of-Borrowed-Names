// The book's review captures (expansion U01/U02): the Wayfarer's Ledger preview on Journey and Company at desktop,
// tablet and phone sizes, its flat, reduced-motion and high-contrast variants, the dialogue strip, and the opening,
// page-turn and closing recorded as filmstrips (frames sampled from the animations themselves, so the strip is the
// same on every run). Uses a synthetic fixture shaped like Robin's game (end of Chapter 2, Suzu, a cat called
// Samson); never a real save.
// Usage: node tests/e2e/book_captures.mjs [outDir]   (default docs/screenshots/book/u01)
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const outDir = path.resolve(root, process.argv[2] || 'docs/screenshots/book/u01');
fs.mkdirSync(outDir, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
const written = [];

const FIXTURE = (o) => {
  RB.game.settings.ledgerStyle = o.style;
  if (o.contrast) RB.game.settings.contrast = o.contrast;
  if (o.reduced) RB.game.settings.reducedMotion = true;
  if (o.scale) RB.game.settings.textScale = o.scale;
  RB.game.applySettings();
  const s = RB.game.debugStart('sg.harbor', 20, 22, { comp: 'suzu', flags: { departed: true, ch1_done: true, rw_echo_done: true, sg_arrived: true } });
  s.player.name = 'Robin'; s.chapter = 2; s.playtime = 3 * 3600 + 27 * 60;
  s.quests = { rw_labels: { stage: 2, done: true, t: 1 }, rw_mill: { stage: 4, done: true, t: 2 }, rw_depart: { stage: 1, done: true, t: 3 }, sg_main: { stage: 8, done: false, t: 9 }, sg_cove: { stage: 1, done: false, t: 7 }, sg_seaglass: { stage: 1, done: false, t: 6 } };
  RB.pets.meet(s, 'cat', { map: 'sg.harbor' }); RB.pets.select(s, 'cat'); s.company.pets.cat.name = 'Samson';
  RB.company.sync && RB.company.sync(s, 'live');
  RB.questGuide.follow('sg_main');
};
const settle = (p) => p.evaluate(() => Promise.all(document.getAnimations().filter((a) => a.effect && a.effect.getComputedTiming().iterations !== Infinity).map((a) => a.finished.catch(() => null))));
// PNG buffer(s) → one WebP (frames side by side at `scale`), encoded by the browser
async function webp(p, pngs, file, scale = 1) {
  const data = await p.evaluate(async ({ list, scale }) => {
    const imgs = await Promise.all(list.map(async (b64) => { const i = new Image(); i.src = 'data:image/png;base64,' + b64; await i.decode(); return i; }));
    const gap = imgs.length > 1 ? 8 : 0;
    const w = imgs.reduce((n, i) => n + Math.round(i.naturalWidth * scale), 0) + gap * (imgs.length - 1);
    const h = Math.max(...imgs.map((i) => Math.round(i.naturalHeight * scale)));
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.fillStyle = '#1b2030'; g.fillRect(0, 0, w, h);
    let x = 0;
    for (const i of imgs) { const iw = Math.round(i.naturalWidth * scale); g.drawImage(i, x, 0, iw, Math.round(i.naturalHeight * scale)); x += iw + gap; }
    return c.toDataURL('image/webp', 0.86);
  }, { list: pngs.map((x) => x.toString('base64')), scale });
  fs.writeFileSync(path.join(outDir, file), Buffer.from(data.split(',')[1], 'base64'));
  written.push(file);
}
async function open(p, which) {
  await p.evaluate((w) => { RB.ui.menu.close(); RB.ui.menu.open(w); }, which);
  await p.waitForTimeout(150); await settle(p); await p.evaluate(() => document.fonts.ready);
}
async function journeyQuest(p) {
  // the followed quest's page (on a phone the list and the page are one leaf; the quest opens in place)
  // by keyboard: a tap on the entry's middle can land on a word and open its word help instead
  const h = await p.$('.folio:not(.closing) button.entry.followed');
  if (h) { await h.focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(150); await settle(p); }
  // the quest opens inline under its entry (as in the classic folio); the capture scrolls it into view, the game does not
  await p.evaluate(() => { const d = document.querySelector('.folio:not(.closing) .qdetail'); if (d) d.scrollIntoView({ block: 'start' }); });
  await p.waitForTimeout(100);
}
const VIEWS = [
  { tag: 'desktop', vp: { width: 1440, height: 900 } },
  { tag: 'tablet', vp: { width: 1024, height: 768 } },
  { tag: 'phone', vp: { width: 375, height: 667 }, mobile: true },
  { tag: 'phone320', vp: { width: 320, height: 640 }, mobile: true },
];

for (const v of VIEWS) {
  const { p, ctx, errors } = await page(b, url, { viewport: v.vp, mobile: v.mobile, touch: v.mobile });
  await p.evaluate(FIXTURE, { style: 'book' });
  await open(p, 'journal');
  await webp(p, [await p.screenshot()], v.tag + '_journey.webp');
  if (v.mobile) { await journeyQuest(p); await webp(p, [await p.screenshot()], v.tag + '_journey_quest.webp'); }
  await open(p, 'company');
  await webp(p, [await p.screenshot()], v.tag + '_company.webp');
  // further down the same pages (the reference notes and records)
  await p.evaluate(() => { for (const l of document.querySelectorAll('.folio:not(.closing) .leaf')) l.scrollTop = l.scrollHeight; });
  await p.waitForTimeout(100);
  await webp(p, [await p.screenshot()], v.tag + '_company_end.webp');
  await p.evaluate(() => RB.ui.menu.close());
  if (v.tag === 'desktop' || v.tag === 'phone') {
    await p.evaluate(() => {
      RB.script.add('@scene t.cap\nsuzu: {港|みなと} の {客|きゃく} は {厳|きび}しい 。 {笑|わら}わせる なら 、 {本気|ほんき} で ね 。|| Harbour audiences are tough. If you want them laughing, mean it.\n', 't');
      RB.script.run('t.cap');
    });
    await p.waitForSelector('.dlg:not(.hidden) .b-next');
    await p.waitForFunction(() => !document.querySelector('.dlg .reveal-hide'));
    await p.waitForTimeout(300);
    await webp(p, [await p.screenshot()], v.tag + '_dialogue.webp');
  }
  if (errors.length) console.log(v.tag, 'page errors:', errors.join('; '));
  await ctx.close();
}

// variants at desktop size: flat, reduced motion, high contrast, the largest text setting
for (const [tag, o] of [['flat', { style: 'flat' }], ['reduced', { style: 'book', reduced: true }], ['contrast', { style: 'book', contrast: 'high' }], ['large', { style: 'book', scale: 1.4 }]]) {
  const { p, ctx } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  await p.evaluate(FIXTURE, o);
  await open(p, 'journal');
  await webp(p, [await p.screenshot()], 'desktop_journey_' + tag + '.webp');
  await open(p, 'company');
  await webp(p, [await p.screenshot()], 'desktop_company_' + tag + '.webp');
  await ctx.close();
}
// the classic folio, for side-by-side comparison (the default, unchanged)
{
  const { p, ctx } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  await p.evaluate(FIXTURE, { style: 'classic' });
  await open(p, 'journal');
  await webp(p, [await p.screenshot()], 'desktop_journey_classic.webp');
  await ctx.close();
}

// filmstrips: every running animation paused and stepped to the same instants
{
  const { p, ctx } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  await p.evaluate(FIXTURE, { style: 'book' });
  const strip = async (file, start, times) => {
    await p.evaluate(start);
    await p.evaluate(() => { for (const a of document.getAnimations()) if (a.effect && a.effect.getComputedTiming().iterations !== Infinity) a.pause(); });
    const frames = [];
    for (const t of times) {
      await p.evaluate((ms) => { for (const a of document.getAnimations()) if (a.effect && a.effect.getComputedTiming().iterations !== Infinity) a.currentTime = ms; }, t);
      await p.waitForTimeout(40);
      frames.push(await p.screenshot());
    }
    await p.evaluate(() => { for (const a of document.getAnimations()) if (a.playState === 'paused') a.play(); });
    await webp(p, frames, file, 0.34);
    await settle(p);
  };
  await strip('film_open.webp', () => { RB.ui.menu.open('journal'); }, [0, 80, 160, 240, 330]);
  await strip('film_turn.webp', () => { document.querySelector('.folio:not(.closing) .ptab[data-id="company"]').click(); }, [0, 50, 100, 150, 200]);
  // the closing book is removed by a timer: hold the page's clock so the frames are taken before it fires
  await p.clock.install();
  await p.clock.pauseAt(await p.evaluate(() => Date.now() + 20));
  await strip('film_close.webp', () => { RB.ui.menu.close(); }, [0, 50, 100, 150, 205]);
  await p.clock.runFor(1000);
  if (await p.$('.folio-scrim.closing')) console.log('warning: the closing book was still there after its timer');
  await ctx.close();
}

await b.close();
srv.close();
console.log('wrote ' + written.length + ' captures to ' + path.relative(root, outDir) + ':\n  ' + written.join('\n  '));
