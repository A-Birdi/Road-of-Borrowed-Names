// FR-1 F17/F05: a new journey's learning mistakes default to Assisted (no battle cost) at any level, separate from the
// tactics; an explicit Standard choice is kept through the first autosave and a reload; the departure summary says
// what is set, including a setting that is not the usual start (an inherited hidden second language), and the full
// set is one press away. Real clicks from New Game, on fresh browser profiles.
// Usage: node tools/build.mjs && node tests/e2e/fr1_defaults.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fails = 0;
const ok = (c, m) => { if (!c) fails++; console.log((c ? '  ok   ' : '  FAIL ') + m); };
const wait = (p, ms) => p.waitForTimeout(ms);

// New Game to the Learning step; then `learn(p)` makes the choices; then the review
async function create(p, learn) {
  await p.click('text=New Game');
  await p.click('.slot[data-slot="1"] [data-a=start]');
  await p.waitForSelector('text=Skip prologue');
  await p.click('text=Skip prologue');
  await p.click('.csheet button:has-text("Skip the prologue")');
  await p.waitForSelector('.folio-create #nm');
  await p.fill('.folio-create #nm', 'Kit');
  for (let i = 0; i < 3; i++) { await p.click('.folio-foot .cr-primary:not([hidden])'); await wait(p, 300); }
  await learn(p);
  await p.click('.folio-foot .cr-primary:not([hidden])');
  await p.waitForSelector('.folio-review', { timeout: 15000 });
  await wait(p, 400);
}
const pick = (p, k, v) => p.evaluate(([k, v]) => { const i = document.querySelector('.cr-learn input[data-k="' + k + '"][data-v="' + v + '"]'); if (!i) return false; i.closest('label').click(); return true; }, [k, v]);
const more = (p) => p.evaluate(() => { const s = document.querySelector('.cr-learn details:not([open]) summary'); if (s) s.click(); });
const setOut = async (p) => { await p.click('.folio-review [data-review-go]'); await p.waitForFunction(() => RB.game.G.playing === true && !RB.ui.settings.isOpen(), null, { timeout: 15000 }); await wait(p, 900); };

// 1. Everyday, nothing else touched: Assisted, Standard tactics; the summary says so
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await create(p, async (p) => {
    ok(await p.evaluate(() => !!document.querySelector('.cr-learn details.cr-more:not([open])')), 'Learning step: mistakes, tactics and reading are folded under one line');
    ok(await p.evaluate(() => /Mistakes: Assisted/.test((document.querySelector('.cr-more-sum') || {}).textContent || '')), 'the folded line says Mistakes: Assisted');
    ok(await pick(p, 'profile', 'E'), 'Everyday chosen');
  });
  const sum = await p.evaluate(() => document.querySelector('.folio-review').innerText);
  ok(/No battle cost/.test(sum) && /Battles\s*Standard/.test(sum), 'the summary: no battle cost for mistakes, Standard battles');
  ok(!/Not the usual start/.test(sum), 'nothing unusual to report on a plain start');
  await p.click('.folio-review [data-a="details"]');
  await wait(p, 300);
  ok(await p.evaluate(() => ['profile', 'assist', 'difficulty', 'questGuide', 'lead', 'secondary'].every((k) => !!document.querySelector('.folio-review input[data-set="' + k + '"]'))), 'Adjust details shows every setting that shapes the road');
  await setOut(p);
  const s = await p.evaluate(() => ({ assist: RB.game.s.learn.assist, diff: RB.game.s.learn.difficulty, prof: RB.game.s.learn.profile }));
  ok(s.assist === 'assist' && s.diff === 'normal' && s.prof === 'E', 'a new Everyday journey: Assisted mistakes, Standard tactics ' + JSON.stringify(s));
  ok(!errors.length, 'no page errors ' + errors.join('; '));
  await p.context().close();
}

// 2. an inherited hidden English line; Foundations with an explicit Standard and Demanding: kept through a reload
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(async () => { RB.game.settings.secondary = 'off'; RB.game.applySettings(); await RB.save.saveSettings(RB.game.settings); });
  await p.reload();
  await p.waitForFunction(() => window.RB && RB.game && RB.ui);
  await create(p, async (p) => {
    await more(p);
    ok(await pick(p, 'assist', 'normal'), 'Standard mistakes chosen explicitly');
    ok(await pick(p, 'difficulty', 'hard'), 'Demanding tactics chosen');
  });
  const sum = await p.evaluate(() => document.querySelector('.folio-review').innerText);
  ok(/Standard: a wrong answer costs/.test(sum) && /Demanding/.test(sum), 'the summary says Standard mistakes and Demanding battles');
  ok(/Not the usual start: the other language is hidden/.test(sum), 'the inherited hidden English line is said, not hidden');
  await setOut(p);
  const s1 = await p.evaluate(async () => { const r = await RB.save.read(1, 'auto').catch(() => null); return { live: RB.game.s.learn.assist, diff: RB.game.s.learn.difficulty, auto: r && r.state && r.state.learn.assist }; });
  ok(s1.live === 'normal' && s1.diff === 'hard' && s1.auto === 'normal', 'the journey and its first autosave keep Standard with Demanding ' + JSON.stringify(s1));
  await p.reload();
  await p.waitForFunction(() => window.RB && RB.save && RB.save.read);
  const s2 = await p.evaluate(async () => { const r = await RB.save.read(1, 'auto').catch(() => null); return r && r.state && r.state.learn.assist; });
  ok(s2 === 'normal', 'after a reload, the save still has Standard (' + s2 + ')');
  ok(!errors.length, 'no page errors ' + errors.join('; '));
  await p.context().close();
}
await b.close();
srv.close();
console.log(fails ? fails + ' failed' : 'fr1_defaults: all passed');
process.exit(fails ? 1 : 0);
