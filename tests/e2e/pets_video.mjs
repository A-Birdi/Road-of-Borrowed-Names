// A short screen recording of real play with a cosmetic pet (evidence; not in the default suite):
// on the mill road with your companion and the pet following, walk up to the Flour Moth, then whole
// exchanges answered with the real mouse — your response (the pet's reaction for its family), your
// companion's action (a short acknowledgement), the creature's move (its safe nearby reaction) — the
// finishing response (its settled-victory gesture with your cheer) and the last line clicked away.
// Writes a WebM (Playwright's recorder).
// Usage: node tests/e2e/pets_video.mjs [cat|dog|bird|tanuki] [out.webm] [--reduce]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, root } from './lib.mjs';

const sp = (process.argv[2] && /^(cat|dog|bird|tanuki)$/.test(process.argv[2])) ? process.argv[2] : 'cat';
const COMP = { cat: 'mio', dog: 'nao', bird: 'ren', tanuki: 'suzu' }[sp];
const reduce = process.argv.includes('--reduce');
const out = path.resolve(process.argv.slice(2).find((a) => a.endsWith('.webm')) || path.join(root, 'tests/e2e/out/pets/' + sp + '_battle' + (reduce ? '_reduced' : '') + '.webm'));
const { srv, url } = await serve();
const b = await launch();
const dir = path.join(path.dirname(out), 'raw-' + sp);
fs.mkdirSync(dir, { recursive: true });
const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir, size: { width: 960, height: 540 } } });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(url);
await p.waitForFunction(() => window.__RB_READY__ === true);
await p.evaluate(async ([sp, COMP, reduce]) => {
  const s = RB.game.debugStart('rw.millroad', 11, 13, { dir: 'up', comp: COMP, flags: { rw_mill_open: true } });
  s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.words = ['mamoru', 'iyasu', 'hikari', 'mizu'];
  RB.game.settings.input = 'choice'; RB.game.settings.textSpeed = 'fast';
  RB.game.settings.reducedMotion = reduce; RB.game.applySettings();
  s.tips = Object.assign({ harmony: 1, harmonyFull: 1 }, ...['strike', 'sweep', 'rest', 'heat', 'shroud', 'charge'].map((k) => ({ ['intent:' + k]: 1 })), ...s.words.map((w) => ({ ['word:' + w]: 1 })));
  RB.pets.meet(s, sp); RB.pets.select(s, sp);
  const run = RB.challenge.runStep; RB.challenge.runStep = (step, o) => { window.__step = step; return run(step, o); };
  // the moth telegraphs a Strike each round (so every exchange shows a blow and the pet's nearby reaction)
  RB.bus.on('present:scene', (e) => { if (e.phase === 'calm') setTimeout(() => { const st = RB.combat.state(); if (!st) return; st.intent = Object.assign(RB.combatLogic.intentDef({}, 'strike'), { target: 'pc' }); st.foes[0].intent = st.intent; st.shroud = false; st.foes[0].shroud = false; RB.combat.refresh(); }, 0); });
}, [sp, COMP, reduce]);
const pause = (ms) => p.waitForTimeout(ms);
const center = (sel) => p.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return null; const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, sel);
async function clickAt(pt) { await p.mouse.move(pt.x, pt.y, { steps: 12 }); await pause(150); await p.mouse.click(pt.x, pt.y); }
await pause(1200);
// walk up the road to the moth (the pet follows)
for (let k = 0; k < 80 && (await p.evaluate(() => RB.game.mode())) !== 'combat'; k++) {
  const st = await p.evaluate(() => { const W = RB.world.W, f = W.foes.find((q) => q.id === 'f3') || W.foes[0]; return f ? { px: W.player.x, py: W.player.y, fx: f.x, fy: f.y, mv: !!W.player.mv } : null; });
  if (!st) break;
  if (st.mv) { await pause(80); continue; }
  const dx = st.fx - st.px, dy = st.fy - st.py;
  if (Math.abs(dx) + Math.abs(dy) === 1) { await p.keyboard.press(dy < 0 ? 'ArrowUp' : dy > 0 ? 'ArrowDown' : dx < 0 ? 'ArrowLeft' : 'ArrowRight'); await pause(80); await p.keyboard.press('z'); await pause(400); continue; }
  const key = Math.abs(dy) >= Math.abs(dx) && dy !== 0 ? (dy < 0 ? 'ArrowUp' : 'ArrowDown') : (dx < 0 ? 'ArrowLeft' : 'ArrowRight');
  await p.keyboard.down(key); await pause(170); await p.keyboard.up(key); await pause(140);
}
async function nextLines() {
  for (let i = 0; i < 12 && (await p.evaluate(() => RB.ui.dialogue.isOpen())); i++) { await pause(900); const pt = await center('.dlg:not(.hidden) .b-next'); if (pt) await clickAt(pt); await pause(300); }
}
await pause(700);
await nextLines();
await p.evaluate(() => { const st = RB.combat.state(); if (st) { st.knots = st.maxKnots = 3; st.foes[0].knots = st.foes[0].maxKnots = 3; RB.combat.refresh(); } });
async function notes() { const g = await p.evaluate(() => { const b = [...document.querySelectorAll('.cb-coach button, [data-coach-ok]')].find((x) => /got it/i.test(x.textContent)); if (!b) return null; const q = b.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }); if (g) { await clickAt(g); await pause(300); } }
async function exchange(r) {
  await p.waitForFunction(() => !!document.querySelector('.rcard[data-i]') && RB.combat.phase && RB.combat.phase() === 'choose', null, { timeout: 20000 }).catch(() => {});
  await pause(1600); // calm while choosing: the pet's quiet idle
  await notes();
  const want = r === 1 ? /守る|protect/i : /unravel/i;
  const c = await p.evaluate((src) => {
    const re = new RegExp(src, 'i');
    const cards = [...document.querySelectorAll('.rcard')].filter((e) => !e.disabled);
    const x = cards.find((e) => re.test(e.textContent)) || cards.find((e) => /unravel/i.test(e.textContent));
    if (!x) return null;
    x.scrollIntoView({ block: 'nearest' });
    const q = x.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 };
  }, want.source);
  if (!c) return false;
  await clickAt(c);
  await p.waitForSelector('.chal .mc .btn, .chal [data-a=reveal]');
  await pause(1000);
  if (await p.$('.chal .mc .btn')) {
    const o = await p.evaluate(() => {
      const st = window.__step, bs = [...document.querySelectorAll('.chal .mc .btn')];
      const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
      const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.util.esc(o.en) + '</span>' : '');
      const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => txt(html(o)));
      const q = bs.find((x) => right.includes(x.textContent.replace(/\s+/g, ' ').trim())).getBoundingClientRect();
      return { x: q.left + q.width / 2, y: q.top + q.height / 2 };
    });
    await clickAt(o);
  } else await clickAt(await center('.chal [data-a=reveal]'));
  await p.waitForSelector('.fbwrap .fb-go');
  await pause(700);
  await clickAt(await center('.fbwrap .fb-go'));
  if (await p.waitForSelector('.ccard:not([disabled])', { timeout: 5000 }).catch(() => null)) {
    await pause(900);
    await notes();
    await clickAt(await center('.ccard:not([disabled])'));
  }
  await p.waitForFunction(() => RB.ui.dialogue.isOpen() || (RB.combat.phase && ['choose', 'idle', 'outro'].includes(RB.combat.phase()) && !document.querySelector('.chal')), null, { timeout: 30000 }).catch(() => {});
  await pause(500);
  return true;
}
for (let r = 0; r < 6 && (await p.evaluate(() => RB.game.mode())) === 'combat' && !(await p.evaluate(() => RB.ui.dialogue.isOpen())); r++) await exchange(r);
await pause(600);
const trace = await p.evaluate(() => { try { return RB.battlePets.stats().trace; } catch (e) { return null; } });
await nextLines();
await p.waitForFunction(() => RB.game.mode() === 'world', null, { timeout: 20000 }).catch(() => {});
await pause(1800);
const video = p.video();
await ctx.close();
const raw = await video.path();
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.copyFileSync(raw, out);
fs.rmSync(dir, { recursive: true, force: true });
console.log('wrote ' + path.relative(root, out) + ' (' + Math.round(fs.statSync(out).size / 1024) + ' KiB)' + (errors.length ? '; page errors: ' + errors.join(' | ') : '; no page errors'));
console.log('pet reactions: ' + JSON.stringify(trace));
await b.close(); srv.close();
