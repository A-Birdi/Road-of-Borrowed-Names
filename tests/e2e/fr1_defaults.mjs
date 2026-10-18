// FR-1 F17/F05: a new journey's learning mistakes default to Assisted (no battle cost) at any level, separate from the
// tactics; an explicit Standard choice is kept through the first autosave and a reload; the departure summary (since
// CW-1 the setup's fifth step, the Summary) says what is set, including a setting that is not the usual start (an
// inherited hidden second language), and the full set is one press away. Real clicks from New Game, on fresh browser
// profiles.
// Usage: node tools/build.mjs && node tests/e2e/fr1_defaults.mjs
import { serve, launch, page, settled } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fails = 0;
const ok = (c, m) => { if (!c) fails++; console.log((c ? '  ok   ' : '  FAIL ') + m); };
const wait = (p, ms) => p.waitForTimeout(ms);

// New Game to the Learning step; then `learn(p)` makes the choices; then the Summary
async function create(p, learn) {
  await p.click('text=New Game');
  await p.click('.slot[data-slot="1"] [data-a=start]');
  await p.waitForSelector('text=Skip prologue');
  await p.click('text=Skip prologue');
  await p.click('.csheet button:has-text("Skip the prologue")');
  await p.waitForSelector('.folio-create #nm');
  await p.fill('.folio-create #nm', 'Kit');
  for (let i = 0; i < 3; i++) { await p.click('.folio-foot .cr-primary:not([hidden])'); await settled(p); }
  await learn(p);
  await p.click('.folio-foot .cr-primary:not([hidden])');
  await settled(p);
  await p.waitForSelector('.folio-create[data-step=summary] .cr-sumpage', { timeout: 15000 });
}
const summary = (p) => p.evaluate(() => document.querySelector('.cr-sumpage').innerText);
const pick = (p, k, v) => p.evaluate(([k, v]) => { const i = document.querySelector('.cr-learn input[data-k="' + k + '"][data-v="' + v + '"]'); if (!i) return false; i.closest('label').click(); return true; }, [k, v]);
const more = (p) => p.evaluate(() => { const s = document.querySelector('.cr-learn details:not([open]) summary'); if (s) s.click(); });
const setOut = async (p) => { await p.click('.folio-create [data-a=go]'); await p.waitForFunction(() => RB.game.G.playing === true && !RB.ui.settings.isOpen(), null, { timeout: 15000 }); await wait(p, 900); };

// 1. Everyday, nothing else touched: Assisted, Standard tactics; the summary says so
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await create(p, async (p) => {
    ok(await p.evaluate(() => { const i = document.querySelector('.cr-learn input[data-k=assist][data-v=assist]'); return !!i && i.checked && i.closest('label').getBoundingClientRect().height > 0 && !i.closest('details'); }), 'Learning step: mistakes are in view, Assisted (CW-1: only the reading preferences fold)');
    ok(await pick(p, 'profile', 'E'), 'Elementary chosen');
  });
  const sum = await summary(p);
  ok(/Assisted: no learning-error battle cost/.test(sum) && /Tactical challenge\s*Standard/i.test(sum), 'the summary: no battle cost for learning mistakes, Standard tactics');
  ok(!/Selected settings to note/i.test(sum), 'nothing unusual to report on a plain start');
  await p.click('.cr-sumpage [data-a=more]');
  await p.waitForFunction(() => RB.ui.settings.drafting && RB.ui.settings.drafting());
  const all = [];
  for (const t of ['learning', 'play', 'reading']) { await p.evaluate((t) => RB.ui.settings.tab(t), t); await wait(p, 150); all.push(...(await p.evaluate(() => Array.from(document.querySelectorAll('.folio-draft input[data-set]')).map((i) => i.dataset.set)))); }
  ok(['profile', 'assist', 'difficulty', 'questGuide', 'lead', 'secondary'].every((k) => all.includes(k)), 'More journey settings shows every setting that shapes the road');
  await p.keyboard.press('Escape');
  await p.waitForFunction(() => !RB.ui.settings.isOpen());
  ok(await p.evaluate(() => document.querySelector('.folio-create').getAttribute('data-step')) === 'summary', 'closing it returns to the Summary');
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
    ok(await pick(p, 'assist', 'normal'), 'Standard mistakes chosen explicitly');
    ok(await pick(p, 'difficulty', 'hard'), 'Demanding tactics chosen');
  });
  const sum = await summary(p);
  ok(/Standard: a small, capped cost/.test(sum) && /Demanding/.test(sum), 'the summary says Standard mistakes and Demanding tactics');
  ok(/Selected settings to note[\s\S]*the other language is hidden/i.test(sum), 'the inherited hidden English line is said, not hidden');
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
