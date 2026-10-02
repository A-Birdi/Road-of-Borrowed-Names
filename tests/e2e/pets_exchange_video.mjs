// A short real-time recording of battle exchanges with a pet reacting (evidence, battle addendum §11): the Flour
// Moth on the mill road with Mio and a pet, started straight into the battle (a diagnostic fixture); the real mouse
// picks Unravel and its answer, Mio's support, then the moth's Strike (the pet braces, flinches safely, settles),
// then 守る against the next Strike, then the last knot (the pet's victory gesture). Playwright's recorder.
// Usage: node tests/e2e/pets_exchange_video.mjs [cat|dog|bird|tanuki] [out.webm] [--size=800x450]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, root, companionTurn } from './lib.mjs';

const sp = (process.argv[2] && /^(cat|dog|bird|tanuki)$/.test(process.argv[2])) ? process.argv[2] : 'tanuki';
const out = path.resolve(process.argv.slice(2).find((a) => a.endsWith('.webm')) || path.join(root, 'tests/e2e/out/battle_pets_overworld/battle_pet_exchange.webm'));
const SZ = (process.argv.find((a) => a.startsWith('--size=')) || '--size=800x450').slice(7).split('x').map(Number);
const { srv, url } = await serve();
const b = await launch();
const dir = path.join(path.dirname(out), 'raw-exchange');
fs.mkdirSync(dir, { recursive: true });
const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir, size: { width: SZ[0], height: SZ[1] } } });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(url);
await p.waitForFunction(() => window.__RB_READY__ === true);
await p.evaluate((sp) => {
  const s = RB.game.debugStart('rw.millroad', 11, 13, { dir: 'up', comp: 'mio', flags: { rw_mill_open: true } });
  s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.words = ['mamoru', 'iyasu', 'hikari', 'mizu'];
  RB.game.settings.input = 'choice'; RB.game.settings.textSpeed = 'fast'; RB.game.applySettings();
  s.tips = Object.assign({ harmony: 1, harmonyFull: 1 }, ...['strike', 'sweep', 'rest', 'heat', 'shroud', 'charge'].map((k) => ({ ['intent:' + k]: 1 })), ...s.words.map((w) => ({ ['word:' + w]: 1 })));
  RB.pets.meet(s, sp); RB.pets.select(s, sp);
  const run = RB.challenge.runStep; RB.challenge.runStep = (step, o) => { window.__step = step; return run(step, o); };
  RB.bus.on('present:scene', (e) => { if (e.phase === 'calm') setTimeout(() => { const st = RB.combat.state(); if (!st) return; st.intent = Object.assign(RB.combatLogic.intentDef({}, 'strike'), { target: 'pc' }); st.foes[0].intent = st.intent; st.shroud = false; st.foes[0].shroud = false; RB.combat.refresh(); }, 0); });
  RB.game.startBattle('rw.dustmoth', {});
}, sp);
const pause = (ms) => p.waitForTimeout(ms);
const center = (sel) => p.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return null; const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, sel);
const clickAt = async (pt) => { await p.mouse.move(pt.x, pt.y, { steps: 10 }); await pause(120); await p.mouse.click(pt.x, pt.y); };
for (let i = 0; i < 60; i++) { const ok = await p.evaluate(() => !!document.querySelector('.rcard[data-i]') && RB.combat.phase() === 'choose'); if (ok) break; if (await p.evaluate(() => RB.ui.dialogue.isOpen())) await p.evaluate(() => RB.ui.dialogue.advance(true)); await pause(150); }
await p.evaluate(() => { const st = RB.combat.state(); st.knots = st.maxKnots = 2; st.foes[0].knots = st.foes[0].maxKnots = 2; RB.combat.refresh(); });
const notes = async () => { const g = await p.evaluate(() => { const x = [...document.querySelectorAll('.cb-coach button, [data-coach-ok]')].find((y) => /got it/i.test(y.textContent)); if (!x) return null; const q = x.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }); if (g) { await clickAt(g); await pause(200); } };
for (let r = 0; r < 3 && (await p.evaluate(() => RB.game.mode())) === 'combat'; r++) {
  const ready = await p.waitForFunction(() => (!!document.querySelector('.rcard[data-i]') && RB.combat.phase() === 'choose') || RB.combat.phase() === 'outro' || RB.game.mode() !== 'combat', null, { timeout: 30000 }).then(() => p.evaluate(() => !!document.querySelector('.rcard[data-i]') && RB.combat.phase() === 'choose')).catch(() => false);
  if (!ready) break;
  await pause(900); await notes();
  const want = r === 1 ? '守る|protect' : 'unravel';
  const c = await p.evaluate((src) => { const re = new RegExp(src, 'i'); const cards = [...document.querySelectorAll('.rcard')].filter((e) => !e.disabled); const x = cards.find((e) => re.test(e.textContent)) || cards.find((e) => /unravel/i.test(e.textContent)) || cards[0]; x.scrollIntoView({ block: 'nearest' }); const q = x.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, want);
  await clickAt(c);
  await p.waitForSelector('.chal .mc .btn, .chal [data-a=reveal]', { timeout: 15000 });
  await pause(700);
  if (await p.$('.chal .mc .btn')) {
    const pt = await p.evaluate(() => {
      const st = window.__step, bs = [...document.querySelectorAll('.chal .mc .btn')];
      const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
      const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.util.esc(o.en) + '</span>' : '');
      const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => txt(html(o)));
      const q = bs.find((x) => right.includes(x.textContent.replace(/\s+/g, ' ').trim())).getBoundingClientRect();
      return { x: q.left + q.width / 2, y: q.top + q.height / 2 };
    });
    await clickAt(pt);
  } else await clickAt(await center('.chal [data-a=reveal]'));
  await p.waitForSelector('.fbwrap .fb-go', { timeout: 15000 });
  await pause(500);
  await clickAt(await center('.fbwrap .fb-go'));
  await companionTurn(p, { delay: 600 });
  await p.waitForFunction(() => RB.ui.dialogue.isOpen() || (['choose', 'idle', 'outro'].includes(RB.combat.phase()) && !document.querySelector('.chal') && !RB.battleSeq.busy()), null, { timeout: 30000 }).catch(() => {});
  await pause(400);
}
await pause(1500);
const trace = await p.evaluate(() => RB.battlePets.stats().trace);
const video = p.video();
await ctx.close();
const raw = await video.path();
fs.copyFileSync(raw, out);
fs.rmSync(dir, { recursive: true, force: true });
console.log('wrote ' + path.relative(root, out) + ' (' + Math.round(fs.statSync(out).size / 1024) + ' KiB)' + (errors.length ? '; page errors: ' + errors.join(' | ') : '; no page errors'));
console.log('pet: ' + (trace || []).map((t) => t.kind + ':' + (t.family || t.impact || '') + (t.rate && t.rate !== 1 ? '×' + t.rate : '')).join(' '));
await b.close(); srv.close();
