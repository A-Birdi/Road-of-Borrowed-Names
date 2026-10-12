// The book's final review set (expansion P17: §15A U07, UI-A01, UI-A17, UI-A20): one concise set of captures of the
// finished interface for Robin's review at completion, on every page family and on the surfaces U05/U06 brought into
// the book (the title, the Inn Ledger, a confirmation, the dialogue, a battle's slips, typing and writing prompts), at
// desktop (1440×900) and phone (375×667) sizes, with the high-contrast, largest-text, flat and Japanese-interface
// variants. A synthetic fixture shaped like Robin's game (end of Chapter 2, Suzu, a cat called Samson), in a twelve-chapter
// journey so that every page the expansion added is there; never a real save. Each capture also checks that nothing is wider than the screen and that the page raised no error.
// Usage: node tests/e2e/book_final.mjs [outDir]   (default docs/screenshots/book/final)
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const outDir = path.resolve(root, process.argv[2] || 'docs/screenshots/book/final');
fs.mkdirSync(outDir, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
const written = [], problems = [];

const FIXTURE = (o) => {
  RB.game.settings.ledgerStyle = o.style || 'book';
  if (o.contrast) RB.game.settings.contrast = o.contrast;
  if (o.scale) RB.game.settings.textScale = o.scale;
  if (o.uiLang) RB.game.settings.uiLang = o.uiLang;
  RB.game.applySettings();
  const s = RB.game.debugStart('sg.harbor', 20, 22, { comp: 'suzu', flags: { departed: true, ch1_done: true, rw_echo_done: true, sg_arrived: true, sg_harbor_seen: true } }); // (the harbour's first look is long past at the end of Chapter 2)
  // a twelve-chapter journey, so the Ledger shows every page the expansion added (the travel volume, Distractions)
  s.edition = 2; s.player.name = 'Robin'; s.chapter = 2; s.playtime = 3 * 3600 + 27 * 60;
  s.quests = { rw_labels: { stage: 2, done: true, t: 1 }, rw_mill: { stage: 4, done: true, t: 2 }, rw_depart: { stage: 1, done: true, t: 3 }, sg_main: { stage: 8, done: false, t: 9 }, sg_cove: { stage: 1, done: false, t: 7 }, sg_seaglass: { stage: 1, done: false, t: 6 } };
  RB.pets.meet(s, 'cat', { map: 'sg.harbor' }); RB.pets.select(s, 'cat'); s.company.pets.cat.name = 'Samson';
  RB.company.sync && RB.company.sync(s, 'live');
  RB.questGuide.follow('sg_main');
};
const settle = (p) => p.evaluate(() => Promise.all(document.getAnimations().filter((a) => a.effect && a.effect.getComputedTiming().iterations !== Infinity).map((a) => a.finished.catch(() => null))));
const ready = async (p) => { await p.waitForTimeout(150); await settle(p); await p.evaluate(async () => { RB.bookType.install(); await document.fonts.ready; }); };
async function shot(p, file, tag) {
  const wide = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (wide > 1) problems.push(file + ': ' + wide + ' px wider than the screen');
  const png = await p.screenshot();
  const data = await p.evaluate(async (b64) => {
    const i = new Image(); i.src = 'data:image/png;base64,' + b64; await i.decode();
    const c = document.createElement('canvas'); c.width = i.naturalWidth; c.height = i.naturalHeight;
    c.getContext('2d').drawImage(i, 0, 0);
    return c.toDataURL('image/webp', 0.86);
  }, png.toString('base64'));
  fs.writeFileSync(path.join(outDir, file), Buffer.from(data.split(',')[1], 'base64'));
  written.push(file + (tag ? '  (' + tag + ')' : ''));
}
// close every sheet and the Ledger, and wait until none is left on the page (a closing Ledger leaves a copy for its animation)
async function closeAll(p) {
  for (let i = 0; i < 8; i++) {
    const left = await p.evaluate(() => !!document.querySelector('.folio-scrim, .folio-settings, .save-sheet, .csheet'));
    if (!left) return;
    await p.keyboard.press('Escape');
    await p.evaluate(() => { RB.ui.menu.close(); });
    await p.waitForTimeout(350);
  }
  problems.push('a sheet would not close');
}
async function open(p, which) {
  await p.evaluate((w) => { RB.ui.menu.close(); RB.ui.menu.open(w); }, which);
  await ready(p);
}
async function battle(p, input, o) {
  await p.evaluate(([input, o]) => {
    RB.ui.menu.close();
    const s = RB.game.debugStart('rw.millroad', 10, 22, { comp: 'suzu' });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'F'; s.words = ['mamoru', 'mizu', 'hikari'];
    RB.game.settings.input = input; if (o && o.scale) RB.game.settings.textScale = o.scale;
    RB.game.applySettings();
    RB.game.startBattle('rw.reedling', {});
  }, [input, o || null]);
  for (let i = 0; i < 200; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.resp[data-i]') }));
    if (st.cards) break;
    if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(60);
  }
  await p.waitForSelector('.resp[data-i]');
  await ready(p);
}
async function prompt(p) {
  await p.evaluate(() => { const c = [...document.querySelectorAll('.rcard[data-i]')].find((x) => !x.disabled); c.click(); });
  await p.waitForSelector('.chal', { timeout: 8000 });
  await ready(p);
}

const VIEWS = [
  { tag: 'desktop', vp: { width: 1440, height: 900 } },
  { tag: 'phone', vp: { width: 375, height: 667 }, mobile: true },
];
const PAGES = [['journey', 'journal'], ['volume', 'volume'], ['words', 'words'], ['satchel', 'satchel'], ['map', 'map'], ['company', 'company'], ['distractions', 'distractions'], ['inn_ledger', 'save'], ['settings', 'settings']];

for (const v of VIEWS) {
  const o = { viewport: v.vp, mobile: v.mobile, touch: v.mobile };
  // the title, before any journey
  {
    const { p, ctx, errors } = await page(b, url, o);
    await ready(p);
    await shot(p, v.tag + '_title.webp', 'UI-A17');
    if (errors.length) problems.push(v.tag + ' title: ' + errors.join('; '));
    await ctx.close();
  }
  const { p, ctx, errors } = await page(b, url, o);
  await p.evaluate(FIXTURE, {});
  for (const [name, which] of PAGES) {
    await open(p, which);
    const shown = await p.evaluate(() => !!document.querySelector('.folio:not(.closing), .folio-settings, .save-sheet, .folio-scrim:not(.closing)'));
    if (!shown) { problems.push(v.tag + ' ' + name + ': nothing opened'); continue; }
    await shot(p, v.tag + '_' + name + '.webp', name === 'inn_ledger' ? 'UI-A09' : 'UI-A01, UI-A03');
    await closeAll(p);
  }
  await closeAll(p);
  // the dialogue with Suzu's portrait
  await p.evaluate(() => {
    RB.script.add('@scene t.final\nsuzu: {港|みなと} の {客|きゃく} は {厳|きび}しい 。 {笑|わら}わせる なら 、 {本気|ほんき} で ね 。|| Harbour audiences are tough. If you want them laughing, mean it.\n', 't');
    RB.script.run('t.final');
  });
  await p.waitForSelector('.dlg:not(.hidden) .b-next');
  await p.waitForFunction(() => !document.querySelector('.dlg .reveal-hide'));
  await ready(p);
  await shot(p, v.tag + '_dialogue.webp', 'UI-A13');
  // (a companion's aside may follow the line in the living world: read on through it, as a player would)
  await p.evaluate(async () => { for (let i = 0; i < 40 && (RB.ui.dialogue.isOpen() || RB.script.isRunning()); i++) { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 200)); } });
  await p.waitForFunction(() => !RB.ui.dialogue.isOpen() && !RB.script.isRunning(), null, { timeout: 8000 }).catch(() => problems.push('the line would not close'));
  await p.waitForTimeout(300);
  // a confirmation (danger sealed and named; the safe answer first)
  await p.evaluate(() => { RB.ui.confirm('Delete this journey? This cannot be undone.', ['Delete', 'Keep it'], { danger: true }); });
  await p.waitForSelector('.csheet');
  await ready(p);
  await shot(p, v.tag + '_confirmation.webp', 'UI-A05');
  await closeAll(p);
  // a battle's decision: both people's bars, Harmony, the creature's plate, the response slips
  await battle(p, v.mobile ? 'ime' : 'hand');
  await shot(p, v.tag + '_battle.webp', 'UI-A16');
  await prompt(p);
  if (v.mobile) { await p.focus('#ime-in'); await p.keyboard.insertText('みず'); await p.waitForTimeout(200); }
  await shot(p, v.tag + (v.mobile ? '_typing.webp' : '_writing.webp'), 'UI-A14');
  if (errors.length) problems.push(v.tag + ': ' + errors.join('; '));
  await ctx.close();
}

// variants at desktop size: high contrast, the largest text, flat, the Japanese interface
for (const [tag, fx, which] of [['contrast', { contrast: 'high' }, 'journal'], ['large', { scale: 1.5 }, 'journal'], ['flat', { style: 'flat' }, 'company'], ['ja', { uiLang: 'ja' }, 'company']]) {
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  await p.evaluate(FIXTURE, fx);
  await open(p, which);
  await shot(p, 'desktop_' + (which === 'journal' ? 'journey' : which) + '_' + tag + '.webp', tag === 'ja' ? 'UI-A10' : tag === 'large' ? 'UI-A02' : 'UI-A05');
  if (errors.length) problems.push(tag + ': ' + errors.join('; '));
  await ctx.close();
}
// a phone at the smallest width and the largest text
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 320, height: 640 }, mobile: true, touch: true });
  await p.evaluate(FIXTURE, { scale: 1.5 });
  await open(p, 'journal');
  await shot(p, 'phone320_journey_large.webp', 'UI-A15');
  if (errors.length) problems.push('phone320: ' + errors.join('; '));
  await ctx.close();
}

await b.close();
srv.close();
console.log('wrote ' + written.length + ' captures to ' + path.relative(root, outDir) + ':\n  ' + written.join('\n  '));
console.log(problems.length ? 'problems:\n  ' + problems.join('\n  ') : 'no problems (nothing wider than the screen, no page errors)');
process.exit(problems.length ? 1 : 0);
