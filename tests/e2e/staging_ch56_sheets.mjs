// Evidence frame sheets for the Chapter 5–6 staging pass (docs/expressive/reports/staging_ch5_ch6.md): a few staged
// scenes played by tests/e2e/staging_runner.mjs on their real fixtures (tests/e2e/staging_ch56_cases.mjs), staged,
// normal motion, in the BUILT game at 960×640, with the frame taken at chosen lines (while the line is shown and its
// cues have played) and cropped around you; four frames side by side in one PNG, no text drawn.
// Usage: node tests/e2e/staging_ch56_sheets.mjs [--only=<sheet name prefix>]
// Writes docs/screenshots/staging/ch5_ch6/<name>.png
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';
import { runBranch, branchesOf } from './staging_runner.mjs';
import { CH56 } from './staging_ch56_cases.mjs';

const ONLY = ((process.argv.find((a) => a.startsWith('--only=')) || '').slice(7)).split(',').filter(Boolean);
const OUT = path.join(root, 'docs/screenshots/staging/ch5_ch6');
fs.mkdirSync(OUT, { recursive: true });
// name, scene, the branch (its name in the cases), the lines to take (the start of their English text)
const SHEETS = [
  { name: 'ch5_lf.tokuji_story_nao', scene: 'lf.tokuji_story', branch: 'nao', at: ['…The minutes, eh.', 'While I was hesitating', 'Thirty years, and I never', 'You shake the little bell'] },
  { name: 'ch5_lf.nao_deliver', scene: 'lf.nao_deliver', branch: 'met before', at: ['So I\'m asking now', 'I\'ll take it. I could refuse', 'The sound of the seal breaking', 'Will you deliver this?'] },
  { name: 'ch5_lf.yae_after_mio', scene: 'lf.yae_after', branch: 'the council back · mio', at: ['Order!', 'Now I can say it', 'One for, one against', '…If you meet Kasane'] },
  { name: 'ch6_sa.ushio_grave_ren', scene: 'sa.ushio_grave', branch: 'Ren', at: ['"Here sleeps Ushio', 'No wonder they never came back', 'Ren sets the lamp down', '…Let\'s go. I have some questions'] },
  { name: 'ch6_sa.end_comp_suzu', scene: 'sa.end_comp', branch: 'suzu', at: ['I\'ve closed my ledger', 'I\'m writing a new play', 'And — this.', 'Suzu unties the faded ribbon'] },
];
const W = 360, H = 260;

const { srv, url } = await serve();
const b = await launch();
let fail = 0;
for (const sh of SHEETS) {
  if (ONLY.length && !ONLY.some((o) => sh.name.startsWith(o))) continue;
  const c = CH56.find((x) => x.scene === sh.scene);
  const v = branchesOf(c).find((x) => x.name === sh.branch);
  if (!v) { console.log('FAIL no branch ' + sh.branch + ' in ' + sh.scene); fail++; continue; }
  // which lines: a quick run first (on its own page, so nothing of it is left on screen), then the run that takes them
  const pd = await page(b, url, { viewport: { width: 960, height: 640 } });
  const dry = await runBranch(pd.p, c, v, { staged: true, dwell: 15 });
  await pd.p.context().close();
  sh.lines = sh.at.map((t) => dry.lines.findIndex((l) => l.slice(l.indexOf(': ') + 2).startsWith(t.slice(0, 40))));
  if (sh.lines.includes(-1)) { console.log('FAIL ' + sh.name + ': no line ' + sh.at[sh.lines.indexOf(-1)] + ' in ' + dry.lines.join(' / ')); fail++; continue; }
  const { p, errors } = await page(b, url, { viewport: { width: 960, height: 640 } });
  const frames = [];
  let stop = false;
  const shooter = (async () => {
    while (!stop) {
      const n = await p.evaluate(() => window.__shotReady).catch(() => null);
      if (n != null) {
        // centred on the people near you (within 6 tiles), their figures standing about a tile above their feet
        const at = await p.evaluate(() => {
          const W = RB.world.W, pl = W.player, r = document.querySelector('canvas').getBoundingClientRect();
          const near = W.npcs.concat(W.extras || [], W.comp ? [W.comp] : [], [pl]).filter((a) => Math.abs(a.fx - pl.fx) <= 6 && Math.abs(a.fy - pl.fy) <= 6);
          const xs = near.map((a) => a.fx), ys = near.map((a) => a.fy);
          const t = RB.render.tileToCss((Math.min(...xs) + Math.max(...xs)) / 2 + 0.5, (Math.min(...ys) + Math.max(...ys)) / 2);
          return { x: r.left + t.x, y: r.top + t.y };
        });
        const clip = { x: Math.max(0, Math.min(960 - W, Math.round(at.x - W / 2))), y: Math.max(0, Math.min(640 - H, Math.round(at.y - H / 2))), width: W, height: H };
        frames.push((await p.screenshot({ clip })).toString('base64'));
        await p.evaluate(() => { window.__shotReady = null; });
      }
      await p.waitForTimeout(40);
    }
  })();
  const r = await runBranch(p, c, v, { staged: true, dwell: 550, shots: sh.lines });
  stop = true;
  await shooter;
  if (!r.done || frames.length !== sh.lines.length) { console.log('FAIL ' + sh.name + ': ' + frames.length + ' frames of ' + sh.lines.length + (r.err ? ' (' + r.err + ')' : '')); fail++; await p.context().close(); continue; }
  // the sheet, composed in the page
  const png = await p.evaluate(async ([frames, W, H]) => {
    const cv = document.createElement('canvas');
    cv.width = W * frames.length + 6 * (frames.length - 1); cv.height = H;
    const g = cv.getContext('2d');
    g.fillStyle = '#20202a'; g.fillRect(0, 0, cv.width, cv.height);
    for (let i = 0; i < frames.length; i++) {
      const im = new Image();
      await new Promise((res) => { im.onload = res; im.src = 'data:image/png;base64,' + frames[i]; });
      g.drawImage(im, i * (W + 6), 0);
    }
    return cv.toDataURL('image/png').split(',')[1];
  }, [frames, W, H]);
  fs.writeFileSync(path.join(OUT, sh.name + '.png'), Buffer.from(png, 'base64'));
  console.log('ok   ' + sh.name + '.png (' + r.lines.length + ' lines; frames at ' + sh.lines.join(', ') + ')' + (errors.length ? ' page errors: ' + errors.slice(0, 2).join(' | ') : ''));
  if (errors.length) fail++;
  await p.context().close();
}
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
