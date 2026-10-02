// Recordings of the battle presentation contract (battle addendum Phase F, §25.1) in the built game,
// not part of the default suite: the Mill's Flour Moth with Mio — Unravel, answered right with real
// clicks at an unhurried pace, Mio's Warm draught, then the exchange as it plays — under each setting:
//   normal_1280.webm    Battle animations Normal (the banner per action, the menus withdrawing and returning)
//   fast_1280.webm      Fast
//   instant_1280.webm   Instant (no movement, no banner; the recap in the log)
//   reduced_1280.webm   Normal with reduced motion
//   narrow_390.webm     a 390×844 phone, three Flour Moths: a badge pressed open and closed, then an exchange
// Synthetic campaigns in fresh profiles (a diagnostic placement: the party in the Mill); no save touched.
// Usage: node tests/e2e/battle_presentation_video.mjs [outDir]   (default docs/screenshots/battle/presentation)
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, root } from './lib.mjs';

const outDir = path.resolve(process.argv[2] || path.join(root, 'docs/screenshots/battle/presentation'));
fs.mkdirSync(outDir, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
const raw = path.join(root, 'tests/e2e/out/battle_presentation_video/raw');
fs.mkdirSync(raw, { recursive: true });
const problems = [];

async function clip(name, o) {
  const vp = o.vp || { width: 1280, height: 720 };
  const size = vp.width > 600 ? { width: 960, height: 540 } : { width: vp.width, height: vp.height };
  const ctx = await b.newContext({ viewport: vp, recordVideo: { dir: raw, size }, ...(o.mobile ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}) });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(url);
  await p.waitForFunction(() => window.__RB_READY__ === true);
  const pause = (ms) => p.waitForTimeout(ms);
  await p.evaluate((o) => {
    const s = RB.game.debugStart('rw.mill1', 7, 9, { comp: 'mio', flags: { rw_gears: true } });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.learn.difficulty = o.foes > 1 ? 'hard' : 'normal';
    s.words = ['mizu', 'iyasu', 'mamoru'];
    s.tips = { harmony: 1, harmonyFull: 1, cturn: 1, group: 1 };
    for (const k of ['strike', 'sweep', 'shroud', 'rest', 'heat', 'charge', 'lie', 'mirror', 'plea']) s.tips['intent:' + k] = 1;
    for (const w of s.words) s.tips['word:' + w] = 1;
    Object.assign(RB.game.settings, { input: 'choice', battleAnim: o.anim, reducedMotion: !!o.reduce });
    RB.game.applySettings();
    const run = RB.challenge.runStep;
    RB.challenge.runStep = (step, op) => { window.__lastStep = step; return run(step, op); };
    const place = RB.content.maps['rw.mill1'].foes.find((f) => f.id === 'm1a');
    window.__result = null;
    RB.game.startBattle(place.enemy, { place, where: { map: 'rw.mill1', x: place.x, y: place.y }, foeKey: 'video', group: o.foes > 1 ? Array(o.foes - 1).fill(place.enemy) : undefined }).then((r) => { window.__result = r || 'done'; });
  }, o);
  const decision = async () => {
    for (let i = 0; i < 600; i++) {
      const s = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), ok: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal') && !RB.battleSeq.busy() && RB.combat.phase() === 'choose' }));
      if (s.ok) return;
      if (s.dlg) { await pause(700); await p.evaluate(() => RB.ui.dialogue.advance(true)); }
      await pause(40);
    }
    throw new Error(name + ': no decision');
  };
  const at = (sel) => p.evaluate((q) => { const e = typeof q === 'string' ? document.querySelector(q) : null; if (!e) return null; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
  const press = async (sel) => { const pt = await at(sel); if (!pt) throw new Error(name + ': nothing at ' + sel); await p.mouse.move(pt.x, pt.y, { steps: 8 }); await pause(250); await p.mouse.click(pt.x, pt.y); };
  await decision();
  await pause(1200);
  if (o.badge) {
    // a badge pressed open, read, and closed again
    await p.evaluate(() => { const b = [...document.querySelectorAll('.cb-ib')][1] || document.querySelector('.cb-ib'); b.setAttribute('data-video', '1'); });
    await press('.cb-ib[data-video="1"]');
    await pause(2200);
    await press('#cb-icard [data-ic-close]');
    await pause(700);
  }
  await p.evaluate(() => { const c = [...document.querySelectorAll('.rcard[data-i]')].find((x) => !x.disabled && /unravel/i.test(x.textContent)); c.setAttribute('data-video', 'card'); });
  await press('.rcard[data-video="card"]');
  await p.waitForFunction(() => document.querySelector('.chal .mc .btn'));
  await pause(1600);
  await p.evaluate(() => {
    const st = window.__lastStep;
    const right = RB.challenge.choicesFor(st).filter((x) => x.ok).map((x) => (x.text != null ? RB.tasks.plain(x.text) : x.en || ''));
    const txt = (el) => { const c = el.cloneNode(true); c.querySelectorAll('rt,.enline').forEach((y) => y.remove()); return c.textContent.replace(/\s+/g, ''); };
    const bs = [...document.querySelectorAll('.chal .mc .btn')];
    bs[bs.findIndex((x) => right.some((r) => txt(x) === r.replace(/\s+/g, '') || (x.querySelector('.enline') && right.includes(x.querySelector('.enline').textContent.trim()))))].setAttribute('data-video', 'right');
  });
  await press('.chal .mc .btn[data-video="right"]');
  await p.waitForFunction(() => document.querySelector('.fbwrap .fb-go'));
  await pause(1300);
  await press('.fbwrap .fb-go');
  await p.mouse.move(2, 2);
  await p.waitForFunction(() => document.querySelector('.ccard[data-a]'));
  await pause(1300);
  await p.evaluate(() => { const c = [...document.querySelectorAll('.ccard[data-a]')].find((x) => !x.disabled && /Warm draught/.test(x.textContent)) || document.querySelector('.ccard[data-a]:not([disabled])'); c.setAttribute('data-video', 'support'); });
  await press('.ccard[data-video="support"]');
  await p.mouse.move(2, 2);
  await decision();
  await pause(2500);
  const v = p.video();
  await ctx.close();
  const src = await v.path();
  const dst = path.join(outDir, name + '.webm');
  fs.copyFileSync(src, dst);
  if (errors.length) problems.push(name + ': ' + errors.join('; '));
  console.log('recorded ' + path.relative(root, dst) + ' (' + Math.round(fs.statSync(dst).size / 1024) + ' KiB)');
}

await clip('normal_1280', { anim: 'normal' });
await clip('fast_1280', { anim: 'fast' });
await clip('instant_1280', { anim: 'instant' });
await clip('reduced_1280', { anim: 'normal', reduce: true });
await clip('narrow_390', { anim: 'normal', foes: 3, badge: true, vp: { width: 390, height: 844 }, mobile: true });
await b.close();
srv.close();
if (problems.length) { console.log('page errors:\n  ' + problems.join('\n  ')); process.exit(1); }
