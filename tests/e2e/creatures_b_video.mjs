// A real-time Normal-speed recording of guardian exchanges (Creatures B evidence): the Drowned
// Bell's Keeper's Flood (its signature) and its Strike, answered with the real mouse, then the
// Lamp That Waited's Chill. DIAGNOSTIC FIXTURE: a synthetic campaign starts each battle directly
// with Mio as the companion, and the guardian's next move is set as its intent so the recording
// shows it; nothing here is a natural encounter. Writes WebM (Playwright's recorder).
// Usage: node tests/e2e/creatures_b_video.mjs [out.webm] [enemy:move,move …] [map:x:y]
//   (map: where the battle happens — its backdrop is composed from that place; default rw.millroad:10:22)
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, root } from './lib.mjs';

const out = path.resolve(process.argv[2] || path.join(root, 'tests/e2e/out/battle_creatures_b/boss_exchange.webm'));
const plan = (process.argv[3] || 'lf.keeper:flood,strike').split(':');
const enemy = plan[0], moves = plan[1].split(',');
const [mapId, mx, my] = (process.argv[4] || 'rw.millroad:10:22').split(':');
const { srv, url } = await serve();
const b = await launch();
const dir = path.join(path.dirname(out), 'raw_' + path.basename(out, '.webm'));
fs.mkdirSync(dir, { recursive: true });
const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir, size: { width: 960, height: 540 } } });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(url);
await p.waitForFunction(() => window.__RB_READY__ === true);
const pause = (ms) => p.waitForTimeout(ms);
await p.evaluate(([enemy, mapId, mx, my]) => {
  const s = RB.game.debugStart(mapId, +mx, +my, { comp: 'mio' });
  s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.words = ['mamoru', 'mizu', 'hikari'];
  s.tips = Object.assign({ harmony: 1, harmonyFull: 1, cturn: 1, group: 1 }, ...['strike', 'sweep', 'rest', 'heat', 'shroud', 'charge', 'gust', 'mend', 'lie', 'plea', 'flood', 'chill', 'silence', 'mirror'].map((k) => ({ ['intent:' + k]: 1 })), ...s.words.map((w) => ({ ['word:' + w]: 1 })));
  RB.game.settings.input = 'choice'; RB.game.settings.textSpeed = 'normal';
  const run = RB.challenge.runStep; RB.challenge.runStep = (step, o) => { window.__step = step; return run(step, o); };
  window.__result = null;
  RB.game.startBattle(enemy, {}).then((r) => { window.__result = r || 'done'; });
}, [enemy, mapId, mx, my]);
const center = (sel) => p.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, sel);
async function clickAt(pt) { await p.mouse.move(pt.x, pt.y, { steps: 10 }); await pause(120); await p.mouse.click(pt.x, pt.y); }
async function settle() {
  for (let i = 0; i < 400; i++) {
    const s = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal') && !RB.battleSeq.busy(), teach: !!document.querySelector('button[data-ok]'), coach: !!document.querySelector('[data-coach-ok]') }));
    if (s.cards) return;
    if (s.teach) { await pause(700); const g = await center('button[data-ok]'); if (g) await clickAt(g); }
    if (s.coach) { const g = await center('[data-coach-ok]'); if (g) await clickAt(g); }
    if (s.dlg) { await pause(900); const g = await center('.dlg:not(.hidden) .b-next'); if (g) await clickAt(g); else await p.evaluate(() => RB.ui.dialogue.advance(true)); }
    await pause(60);
  }
}
await settle();
for (const kind of moves) {
  // (diagnostic) the guardian's next move, shown in its telegraph; you both start fresh
  await p.evaluate((k) => { const st = RB.combat.state(); st.pc = st.max; st.comp = st.max; st.silenced = 0; const it = RB.combatLogic.intentDef({}, k); if (it.target === 'rand') it.target = 'pc'; st.intent = it; RB.combat.refresh(); }, kind);
  await pause(1600); // reading the telegraph
  const c = await p.evaluate(() => { const x = [...document.querySelectorAll('.rcard')].find((e) => !e.disabled && /unravel|ほどく/i.test(e.textContent)) || [...document.querySelectorAll('.rcard')].find((e) => !e.disabled && /water|水/i.test(e.textContent)); if (!x) return null; x.scrollIntoView({ block: 'nearest' }); const q = x.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; });
  await clickAt(c);
  await p.waitForSelector('.chal');
  await pause(1100);
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
  } else { await clickAt(await center('.chal [data-a=reveal]')); }
  await p.waitForSelector('.fbwrap .fb-go');
  await pause(800);
  await clickAt(await center('.fbwrap .fb-go'));
  // Mio's turn (a draught: no language step)
  if (await p.waitForSelector('.ccard:not([disabled])', { timeout: 5000 }).catch(() => null)) {
    await pause(800);
    const coach = await center('[data-coach-ok]'); if (coach) { await clickAt(coach); await pause(300); }
    const cc = await p.evaluate(() => { const x = [...document.querySelectorAll('.ccard:not([disabled])')].find((e) => /draught|salve|tonic|beside/i.test(e.textContent)) || document.querySelector('.ccard:not([disabled])'); x.scrollIntoView({ block: 'nearest' }); const q = x.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; });
    await clickAt(cc);
  }
  // the exchange plays out at Normal speed: your response, Mio's action, the guardian's move
  await p.waitForFunction(() => !RB.battleSeq.busy() && (!!document.querySelector('.rcard[data-i]') || RB.ui.dialogue.isOpen() || RB.game.mode() !== 'combat'), null, { timeout: 30000 }).catch(() => {});
  await settle();
  await pause(600);
}
await pause(800);
const video = p.video();
await ctx.close();
const raw = await video.path();
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.copyFileSync(raw, out);
fs.rmSync(dir, { recursive: true, force: true });
console.log('wrote ' + path.relative(root, out) + ' (' + Math.round(fs.statSync(out).size / 1024) + ' KiB)' + (errors.length ? '; page errors: ' + errors.join(' | ') : '; no page errors'));
await b.close(); srv.close();
