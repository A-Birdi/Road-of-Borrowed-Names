// The development-only sequence viewer (src/ui/43z_sequence_dev.js; HX57) in the BUILT game: refused without
// ?dev=sequences; with it, a contact sheet of every registered shot labelled SYNTHETIC FIXTURE that draws
// without errors at the wide, phone and phone-on-its-side buffers; "Play" opens the standalone player over a
// fixture branch, says on screen that it is a synthetic preview, and steps with Next.
// Usage: node tests/e2e/sequence_dev.mjs [--shots outDir]   (--shots: also write three screenshots there)
import path from 'node:path';
import { serve, launch, page } from './lib.mjs';

const si = process.argv.indexOf('--shots'), OUT = si >= 0 ? path.resolve(process.argv[si + 1]) : null;
const shot = (p, name) => (OUT ? p.screenshot({ path: path.join(OUT, name) }) : null);
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
{
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 720 } });
  const none = await p.evaluate(() => ({ allowed: RB.seqDev.allowed(), open: RB.seqDev.open(), el: !!document.querySelector('.seq-dev') }));
  ok(!none.allowed && none.open === null && !none.el, 'without ?dev=sequences the viewer refuses ' + JSON.stringify(none));
  await ctx.close();
}
{
  const { p, errors, ctx } = await page(b, url + '?dev=sequences', { viewport: { width: 1280, height: 720 } });
  await p.waitForSelector('.seq-dev').then((h) => h && h.dispose());
  const r = await p.evaluate(() => {
    const d = document.querySelector('.seq-dev');
    const caps = [...d.querySelectorAll('figcaption')].map((x) => x.textContent);
    return { head: d.firstChild.textContent.slice(0, 40), canvases: d.querySelectorAll('canvas').length, errs: caps.filter((c) => /ERROR/.test(c)), secs: d.querySelectorAll('section').length };
  });
  ok(/^SYNTHETIC FIXTURE/.test(r.head) && r.canvases > 20 && !r.errs.length, 'contact sheet: labelled synthetic, ' + r.canvases + ' pictures in ' + r.secs + ' sequences, no drawing errors ' + JSON.stringify(r.errs.slice(0, 2)));
  await shot(p, 'dev_sheet_wide.png');
  for (const lab of ['phone 390×844', 'phone on its side 507×234']) {
    await p.click('.seq-dev button:has-text("' + lab + '")');
    const e2 = await p.evaluate(() => [...document.querySelectorAll('.seq-dev figcaption')].filter((x) => /ERROR/.test(x.textContent)).length);
    ok(e2 === 0, lab + ': no drawing errors');
  }
  await shot(p, 'dev_sheet_land.png');
  // Play a sequence read-only
  await p.evaluate(() => { document.querySelectorAll('.seq-dev section button')[0].click(); });
  await p.waitForFunction(() => RB.sequence.viewState() && RB.sequence.viewState().state !== 'entering', null, { timeout: 8000 });
  const v0 = await p.evaluate(() => RB.sequence.viewState());
  await p.waitForTimeout(800);
  await shot(p, 'dev_play.png');
  for (let i = 0; i < 3; i++) { await p.waitForFunction(() => RB.sequence.viewState() && RB.sequence.viewState().state !== 'entering'); await p.click('.seq-view [data-a=next]'); await p.waitForTimeout(150); }
  const v1 = await p.evaluate(() => RB.sequence.viewState());
  ok(v0 && v1 && v1.i >= v0.i, 'Play opens the standalone player over the fixture branch and Next moves through it ' + JSON.stringify([v0 && v0.i, v1 && v1.i, v1 && v1.shot]));
  const lab = await p.evaluate(() => document.querySelector('.seq-view') && document.querySelector('.seq-view').textContent.includes('Synthetic preview'));
  ok(lab, 'the player says it is a synthetic preview');
  const under = await p.evaluate(() => ({ cls: document.body.classList.contains('seq-dev-play'), title: [...document.querySelectorAll('#ui > :not(.seq-view)')].filter((e) => getComputedStyle(e).visibility === 'visible' && e.getBoundingClientRect().width > 0).length }));
  ok(under.cls && under.title === 0, 'the page it was opened over is hidden while it plays ' + JSON.stringify(under));
  await p.click('.seq-view [data-a=skip]');
  await p.waitForFunction(() => !RB.sequence.viewState(), null, { timeout: 5000 }).catch(() => {});
  const after = await p.evaluate(() => ({ view: !!RB.sequence.viewState(), cls: document.body.classList.contains('seq-dev-play'), el: !!document.querySelector('.seq-view'), s: !!RB.game.s }));
  ok(!after.view && !after.cls && !after.el && !after.s, 'Close ends the preview (seen as a fixture: no question) and restores the page; no campaign was started ' + JSON.stringify(after));
  ok(!errors.length, 'no page errors ' + errors.slice(0, 2).join(' | '));
  await ctx.close();
}
await b.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
