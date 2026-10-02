// Creatures A restyle: in-battle captures of an enemy at the decision moment and at its Strike's
// (or first move's) contact, at 1920 × 1080, 1280 × 800 and 390 × 844, from the current build and
// (with --before) an earlier build, in synthetic campaigns (fresh contexts, never a player's save).
// Writes PNGs to tests/e2e/out/creatures_a_restyle/battle/ and, with --docs, WebP copies to
// docs/screenshots/battle/creatures_a_restyle/.
// Usage: node tests/e2e/creatures_a_restyle_battle.mjs [enemy-id …] [--before <html>] [--docs] [--docs-before]
//        [--vp 1920x1080,…] [--moments decide,contact]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';
import { helpers, battle, respond, idle, wait } from './creatures_a_lib.mjs';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const ids = args.filter((a, i) => !a.startsWith('--') && !['--before', '--vp', '--moments'].includes(args[i - 1]));
const beforeHtml = opt('--before');
const toDocs = args.includes('--docs'), docsBefore = args.includes('--docs-before');
const moments = (opt('--moments') || 'decide,contact').split(',');
const VPS = (opt('--vp') || '1920x1080,1280x800,390x844').split(',').map((s) => { const [w, h] = s.split('x').map(Number); return { width: w, height: h }; });
const outDir = path.join(root, 'tests', 'e2e', 'out', 'creatures_a_restyle', 'battle');
const docDir = path.join(root, 'docs', 'screenshots', 'battle', 'creatures_a_restyle');
fs.mkdirSync(outDir, { recursive: true });
if (toDocs) fs.mkdirSync(docDir, { recursive: true });
// where each item is met (a placement where there is one, else its region's map)
const WHERE = {
  'rw.dustmoth': { map: 'rw.mill1', x: 7, y: 8, foe: 'm1a', flags: { rw_gears: true } },
  'rw.mill_echo': { map: 'rw.mill1', x: 7, y: 8, enemy: 'rw.mill_echo' },
  'rw.reedling': { map: 'rw.millroad', x: 11, y: 10, enemy: 'rw.reedling' },
  'rw.inkblot': { map: 'rw.mill1', x: 7, y: 8, enemy: 'rw.inkblot' },
  'sa.echo': { map: 'sa.stacks', enemy: 'sa.echo' },
  'sg.crab': { map: 'sg.road', enemy: 'sg.crab' },
  'sa.crane': { map: 'sa.road', enemy: 'sa.crane' },
  'co.golem': { map: 'co.kiln', enemy: 'co.golem' },
  'sg.letter': { map: 'sg.da_reading', enemy: 'sg.letter' },
  'lf.stamp': { map: 'lf.stacks', enemy: 'lf.stamp' },
  'sg.tideclerk': { map: 'sg.road', enemy: 'sg.tideclerk' },
  'co.warden': { map: 'co.kiln', enemy: 'co.warden' },
};
const WORDS = ['mamoru', 'hikari', 'mizu', 'kaze'];
const { srv, url } = await serve();
const b = await launch();
let errs = [];
async function shoot(p, file) {
  const png = await p.screenshot();
  fs.writeFileSync(path.join(outDir, file + '.png'), png);
  if (toDocs && (!file.startsWith('before_') || docsBefore)) {
    const webp = await p.evaluate(async (b64) => { const im = new Image(); await new Promise((r) => { im.onload = r; im.src = 'data:image/png;base64,' + b64; }); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); return c.toDataURL('image/webp', 0.88); }, png.toString('base64'));
    fs.writeFileSync(path.join(docDir, file + '.webp'), Buffer.from(webp.split(',')[1], 'base64'));
  }
}
for (const id of ids.length ? ids : ['rw.dustmoth', 'rw.mill_echo']) {
  const w = WHERE[id] || { map: 'rw.millroad', x: 11, y: 10, enemy: id };
  for (const vp of VPS) for (const build of beforeHtml ? ['before', 'after'] : ['after']) {
    const { p, errors, ctx } = await page(b, url + (build === 'before' ? beforeHtml.replace(/^\/+/, '') : ''), { viewport: vp });
    await helpers(p);
    await battle(p, Object.assign({ words: WORDS }, w));
    await p.evaluate(() => { const st = RB.combat.state(); st.knots = st.maxKnots = 6; RB.combat.refresh(); CA.setIntent('strike', 'pc'); });
    await wait(p, 900);
    const tag = (build === 'before' ? 'before_' : '') + 'battle_' + id.replace(/\./g, '-') + '_' + vp.width + 'x' + vp.height;
    if (moments.includes('decide')) await shoot(p, tag + '_decide');
    if (!moments.includes('contact')) { errs = errs.concat(errors.map((e) => id + ' ' + build + ': ' + e)); await ctx.close(); console.log(tag); continue; }
    // the Strike's contact, on a slowed presentation clock
    await p.evaluate(() => { RB.battleSeq.setTimeScale(0.12); });
    await respond(p, 'unravel', { comp: false });
    await p.waitForFunction(() => RB.combat.phase() === 'enemy', null, { timeout: 40000, polling: 'raf' }).catch(() => {});
    await p.evaluate(() => { window.__b1 = RB.battleSeq.stats().counters.beats; });
    await p.waitForFunction(() => RB.combat.phase() === 'enemy' && RB.battleSeq.stats().counters.beats > window.__b1, null, { timeout: 40000, polling: 'raf' }).catch(() => {});
    await shoot(p, tag + '_contact');
    await p.evaluate(() => RB.battleSeq.setTimeScale(1));
    await idle(p);
    errs = errs.concat(errors.map((e) => id + ' ' + build + ': ' + e));
    await ctx.close();
    console.log(tag);
  }
}
console.log(errs.length ? 'page errors: ' + errs.join(' | ') : 'no page errors');
await b.close(); srv.close();
process.exit(errs.length ? 1 : 0);
