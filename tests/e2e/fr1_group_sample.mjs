// FR-1 F15: one later battle with several creatures, sampled through the real interface on Foundations + Demanding
// tactics + Assisted mistakes (the new default): the Stacks' fog wisps (Saltglass, Chapter 2) with Ren, the six words
// and the kana of the chapter-2 campaign fixture. One answer is wrong on purpose to show it costs nothing under
// Assisted; enemy moves still land. A sample for the record, not a balance verdict: it logs every turn and the result.
// Usage: node tools/build.mjs && node tests/e2e/fr1_group_sample.mjs [--out <dir>]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { serve, launch, page, root, companionTurn } from './lib.mjs';

const A = process.argv.slice(2);
const OUT = A.includes('--out') ? A[A.indexOf('--out') + 1] : path.join(os.tmpdir(), 'fr1-group');
fs.mkdirSync(OUT, { recursive: true });
const fx = JSON.parse(fs.readFileSync(path.join(root, 'tests', 'fixtures', 'campaign', 'F-ren-ch2_done.json'), 'utf8'));
const { srv, url } = await serve();
const b = await launch();
const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
const wait = (ms) => p.waitForTimeout(ms);
await p.evaluate((fx) => {
  const s = RB.game.debugStart('sa.stacks', 17, 6, { comp: 'ren' });
  s.learn.profile = 'F'; s.learn.kanaKnown = fx.learn.kanaKnown || 'none'; s.learn.taught = Object.assign({}, fx.learn.taught);
  s.learn.difficulty = 'hard'; s.learn.assist = 'assist';
  s.words = fx.words.slice();
  RB.game.settings.input = 'choice';
  // a spy, not a change: every cost the rules apply to a language slip
  const L = RB.combatLogic, pa = L.playerAct;
  window.__costs = [];
  L.playerAct = function () { const r = pa.apply(this, arguments); if (r && r.fx) r.fx.filter((f) => f.t === 'cost').forEach((f) => window.__costs.push(f)); return r; };
  const place = RB.content.maps['sa.stacks'].foes.find((f) => f.id === 'w1');
  window.__result = null;
  RB.game.startBattle(place.enemy, { place, where: { map: 'sa.stacks', x: place.x, y: place.y }, foeKey: 'foe:sa.stacks:w1' }).then((r) => { window.__result = r || 'done'; });
}, fx);
const log = [];
let wrongDone = false, turn = 0, shots = 0;
for (let i = 0; i < 1500; i++) {
  const st = await p.evaluate(() => {
    const top = RB.ui.topLayer && RB.ui.topLayer();
    return { r: window.__result, top: top && top.name, dlg: RB.ui.dialogue.isOpen(), chal: !!document.querySelector('.chal'), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal') && !RB.battleSeq.busy(), fb: (document.querySelector('.chal .fbwrap') || {}).getAttribute ? document.querySelector('.chal .fbwrap').getAttribute('data-fb') : null };
  });
  if (st.r) break;
  // the companion's turn: their first support move (and the first time, the note about it)
  if (await p.evaluate(() => !!document.querySelector('.ccard'))) { await companionTurn(p); await wait(200); continue; }
  if (await p.evaluate(() => { const b = document.querySelector('[data-coach-ok]'); return !!(b && b.offsetParent); })) { await p.mouse.move(2, 2); await wait(300); await p.click('[data-coach-ok]').catch(() => {}); await wait(100); continue; }
  if (st.top === 'teach') { await p.evaluate(() => { const b = Array.from(document.querySelectorAll('.folio-foot [data-ok]')).filter((x) => x.offsetParent).pop(); if (b) b.click(); }); await wait(200); continue; }
  if (st.chal) {
    if (st.fb === 'ok' || st.fb === 'reveal') { await p.click('.chal .fbwrap .fb-go').catch(() => {}); await wait(200); continue; }
    const q = await p.evaluate(() => { const s = RB.challenge.current(); return s && { kind: s.kind, answer: s.answer, options: s.options ? s.options.map((o) => ({ t: o.en || o.jp, ok: !!o.ok })) : null }; });
    if (!q) { await wait(100); continue; }
    if (q.kind === 'write') {
      const tab = await p.$('.chal .ptab[data-id="choice"]'); if (tab) { await tab.click(); await wait(150); }
      const ans = await p.evaluate((a) => RB.tasks.plain(a), q.answer);
      const pc0 = await p.evaluate(() => RB.combat.state() && RB.combat.state().pc);
      if (!wrongDone) {
        wrongDone = true;
        await p.evaluate((ans) => { const w = Array.from(document.querySelectorAll('.chal .mc .btn')).find((x) => RB.tasks.plain(x.textContent).trim() !== ans); if (w) w.click(); }, ans);
        await wait(400);
        log.push({ k: 'wrong-on-purpose', answer: ans, pc: pc0, fb: await p.evaluate(() => (document.querySelector('.chal .fbwrap') || {}).innerText || null) });
        const again = await p.$('.chal .fbwrap .fb-go, .chal [data-a=retry]'); if (again) await again.click().catch(() => {});
        await wait(200);
      }
      await p.evaluate((ans) => { const bs = Array.from(document.querySelectorAll('.chal .mc .btn')).filter((x) => !x.disabled); const r = bs.find((x) => RB.tasks.plain(x.textContent).trim() === ans); (r || bs[0]).click(); }, ans);
    } else if (q.options) {
      await p.evaluate(() => { const s = RB.challenge.current(); const o = s.options.find((x) => x.ok); const t = (o.en || RB.tasks.plain(o.jp || '')).replace(/\s+/g, ''); const bs = Array.from(document.querySelectorAll('.chal .mc .btn')); (bs.find((x) => x.textContent.replace(/\s+/g, '').includes(t)) || bs[0]).click(); });
    } else if (q.kind === 'order') {
      for (const piece of q.answer) { await p.evaluate((pc) => { const t = Array.from(document.querySelectorAll('.chal .tiles .tile')).find((x) => RB.tasks.plain(x.textContent).replace(/\s+/g, '') === RB.tasks.plain(pc).replace(/\s+/g, '')); if (t) t.click(); }, piece); await wait(100); }
      await p.click('.chal [data-a=submit]').catch(() => {});
    }
    await wait(350);
    continue;
  }
  if (st.cards) {
    const s = await p.evaluate(() => { const c = RB.combat.state(); return { pc: c.pc, max: c.max, comp: c.comp, foes: c.foes.map((f) => ({ id: f.id, knots: f.knots, intent: f.intent && f.intent.kind, down: !!f.settled || f.knots <= 0 })), cards: Array.from(document.querySelectorAll('.rcard[data-i]')).map((x) => (x.querySelector('.rc-en') || {}).textContent + ' | ' + ((x.querySelector('.rc-here') || {}).textContent || '')) }; });
    turn++;
    log.push(Object.assign({ k: 'turn', turn }, s));
    if (turn === 1 || turn === 3) await p.screenshot({ path: path.join(OUT, 'group-turn-' + turn + '.jpg'), type: 'jpeg', quality: 72 }), shots++;
    // a plain player: answer a shown blow with a guard, otherwise loosen knots; a card that says it does nothing here is skipped
    const pick = await p.evaluate(() => {
      const c = RB.combat.state(), cs = Array.from(document.querySelectorAll('.rcard[data-i]:not([disabled])'));
      const useful = cs.filter((x) => !(x.querySelector('.rc-here') && x.querySelector('.rc-here').classList.contains('none')));
      const blow = c.foes.some((f) => f.intent && /strike|heavy|lunge|charge/.test(f.intent.kind));
      const by = (re) => useful.find((x) => re.test(x.textContent));
      const card = (blow && by(/protect|guard|mamoru/i)) || by(/answers its|cools|clears|stops|frees/i) || by(/unravel/i) || useful[0] || cs[0];
      return card ? card.getAttribute('data-i') : null;
    });
    if (pick != null) await p.click('.rcard[data-i="' + pick + '"]').catch(() => {});
    await wait(300);
    continue;
  }
  if (st.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await wait(80); continue; }
  await wait(120);
}
const end = await p.evaluate(() => ({ result: window.__result, costs: window.__costs, pc: RB.game.s.resolve && RB.game.s.resolve.pc }));
log.push(Object.assign({ k: 'end' }, end));
await p.screenshot({ path: path.join(OUT, 'group-end.jpg'), type: 'jpeg', quality: 72 });
fs.writeFileSync(path.join(OUT, 'group.json'), JSON.stringify({ log, errors }, null, 1));
const turns = log.filter((x) => x.k === 'turn');
console.log('fr1_group_sample: ' + turns.length + ' turns; creatures ' + (turns[0] ? turns[0].foes.length : 0) + '; resolve by turn ' + JSON.stringify(turns.map((x) => x.pc)) + '; result ' + JSON.stringify(end.result).slice(0, 120) + '; slip costs applied ' + end.costs.length + '; page errors ' + errors.length);
const wrong = log.find((x) => x.k === 'wrong-on-purpose');
if (wrong) console.log('  the wrong answer on purpose: ' + JSON.stringify(wrong).slice(0, 300));
await b.close();
srv.close();
process.exit(errors.length || end.costs.length ? 1 : 0);
