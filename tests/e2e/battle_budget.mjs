// The battle art's memory budget (battle addendum §21.5) measured on the built index.html in Chromium:
// one long session in one page — every creature family met in turn (alone, and in threes where a
// group is valid), with a companion and a pet, one exchange each (Unravel answered right, the
// companion's support), then Step back — and after each encounter the estimated resident pixels
// (w × h × 4 bytes per cached frame) of the three battle art caches:
//   party   RB.battlers.budget()          (the player and companions)
//   creatures RB.enemyArt.cacheStats()    (every creature family's idle and action frames; one shared cache)
//   pets    RB.petArt.cacheStats()
// against the 48 MiB budget for battle sprites and poses. Backdrop layers are reported separately by
// tests/e2e/battle_backdrops.mjs. These are pixel estimates, not measured process memory.
// Usage: node tests/e2e/battle_budget.mjs [--out tests/e2e/out/battle_budget.json]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page } from './lib.mjs';

const args = process.argv.slice(2);
const outAt = args.indexOf('--out');
const OUT = outAt >= 0 ? args[outAt + 1] : 'tests/e2e/out/battle_budget.json';
const { srv, url } = await serve();
const b = await launch();
const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
const waitSel = async (sel, o) => { const h = await p.waitForSelector(sel, o); if (h) await h.dispose(); };

// one enemy per family (the first id that uses it), and every family once more in threes
const plan = await p.evaluate(() => {
  const by = {};
  for (const id of Object.keys(RB.content.enemies).sort()) { const e = RB.content.enemies[id]; if (e.art && !by[e.art] && !e.boss) by[e.art] = id; }
  const one = Object.values(by);
  return one.map((id) => ({ id, foes: 1 })).concat(one.map((id) => ({ id, foes: 3 })));
});
const COMPS = ['nao', 'mio', 'ren', 'suzu'];
const PETS = ['cat', 'dog', 'tanuki', 'bird'];
const rows = [];
for (let k = 0; k < plan.length; k++) {
  const c = plan[k];
  const comp = COMPS[k % 4], pet = PETS[k % 4];
  let error = null;
  try {
    await p.evaluate((o) => {
      const s = RB.game.debugStart('rw.mill1', 7, 9, { comp: o.comp, flags: { rw_gears: true } });
      s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.learn.difficulty = o.foes > 2 ? 'hard' : 'normal';
      s.words = ['mizu', 'iyasu', 'mamoru'];
      s.tips = { harmony: 1, harmonyFull: 1, cturn: 1, group: 1 };
      for (const kk of ['strike', 'sweep', 'shroud', 'rest', 'heat', 'charge', 'lie', 'mirror', 'plea', 'gust', 'mend', 'flood', 'chill', 'silence']) s.tips['intent:' + kk] = 1;
      for (const w of s.words) s.tips['word:' + w] = 1;
      try { RB.pets.meet(s, o.pet); RB.pets.select(s, o.pet); } catch (e) { /* no pet */ }
      Object.assign(RB.game.settings, { input: 'choice', battleAnim: 'normal' });
      RB.battleSeq.setTimeScale(4);
      const run = RB.challenge.runStep;
      if (!RB.challenge.__bud) { RB.challenge.__bud = true; RB.challenge.runStep = (step, op) => { window.__lastStep = step; return run(step, op); }; }
      window.__result = null;
      RB.game.startBattle(o.id, { group: o.foes > 1 ? Array(o.foes - 1).fill(o.id) : undefined }).then((r) => { window.__result = r || 'done'; });
    }, { ...c, comp, pet });
    const decision = async () => {
      for (let i = 0; i < 1500; i++) {
        const s = await p.evaluate(() => ({ r: window.__result, dlg: RB.ui.dialogue.isOpen(), ok: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal') && !RB.battleSeq.busy() && RB.combat.phase() === 'choose' }));
        if (s.ok || s.r) return s;
        if (s.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
        await p.waitForTimeout(20);
      }
      throw new Error('no decision');
    };
    await decision();
    const card = await p.evaluate(() => { const x = [...document.querySelectorAll('.rcard[data-i]')].find((y) => !y.disabled && /unravel/i.test(y.textContent)); if (x) x.click(); return !!x; });
    if (card) {
      await waitSel('.chal .mc .btn, .chal [data-a=reveal]', { timeout: 10000 });
      await p.evaluate(() => {
        const r = document.querySelector('.chal [data-a=reveal]');
        if (!document.querySelector('.chal .mc .btn') && r) { r.click(); return; }
        const st = window.__lastStep;
        const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => (o.text != null ? RB.tasks.plain(o.text) : o.en || ''));
        const txt = (el) => { const cc = el.cloneNode(true); cc.querySelectorAll('rt,.enline').forEach((y) => y.remove()); return cc.textContent.replace(/\s+/g, ''); };
        const bs = [...document.querySelectorAll('.chal .mc .btn')];
        const k2 = bs.findIndex((x) => right.some((rr) => txt(x) === rr.replace(/\s+/g, '') || (x.querySelector('.enline') && right.includes(x.querySelector('.enline').textContent.trim()))));
        (bs[k2] || bs[0]).click();
      });
      await waitSel('.fbwrap .fb-go', { timeout: 10000 });
      await p.evaluate(() => document.querySelector('.fbwrap .fb-go').click());
      await p.waitForTimeout(150);
      if (await p.$('.ccard[data-a]').then((h) => { if (h) h.dispose(); return !!h; })) { await p.waitForTimeout(300); await p.evaluate(() => { const x = [...document.querySelectorAll('.ccard[data-a]')].find((y) => !y.disabled); if (x) x.click(); }); }
      await decision();
    }
  } catch (e) { error = String((e && e.message) || e).slice(0, 200); }
  const m = await p.evaluate(() => {
    const pa = RB.battlers.budget(), cr = RB.enemyArt.cacheStats(), pe = RB.petArt.cacheStats();
    return { party: +(pa.bytes / 1048576).toFixed(2), partyFrames: pa.frames, creatures: cr.mib, creatureFrames: cr.frames, pets: +(pe.bytes / 1048576).toFixed(2), petFrames: pe.size };
  });
  m.total = +(m.party + m.creatures + m.pets).toFixed(2);
  rows.push({ k: k + 1, enemy: c.id, foes: c.foes, comp, pet, error, ...m });
  console.log(`${String(k + 1).padStart(2)} ${c.id} ×${c.foes} (${comp}, ${pet}): party ${m.party} MiB (${m.partyFrames}), creatures ${m.creatures} MiB (${m.creatureFrames}), pets ${m.pets} MiB (${m.petFrames}) → ${m.total} MiB${error ? '  ERROR ' + error : ''}`);
  // leave the encounter (Step back) if it is still on
  if (!(await p.evaluate(() => window.__result))) {
    await p.evaluate(() => { const f = document.querySelector('.cb-dock [data-flee]'); if (f) f.click(); });
    await p.waitForTimeout(300);
    await p.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter((x) => /^\s*Step back\s*$/.test(x.textContent)); if (bs.length) bs[bs.length - 1].click(); });
  }
  for (let i = 0; i < 300 && !(await p.evaluate(() => !!window.__result && RB.game.mode() !== 'combat')); i++) { if (await p.evaluate(() => RB.ui.dialogue.isOpen())) await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(25); }
}
const max = rows.reduce((a, r) => (r.total > a.total ? r : a), { total: 0 });
const caps = await p.evaluate(() => ({ party: RB.battlers.budget().capMib, creatures: RB.enemyArt.cacheStats().cap, pets: RB.petArt.cacheStats().cap }));
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ when: new Date().toISOString(), browser: 'Chromium (Playwright, headless)', budgetMib: 48, caps, rows, max }, null, 1));
console.log(`\nlargest estimated residency: ${max.total} MiB after ${max.enemy} ×${max.foes} (party ${max.party}, creatures ${max.creatures}, pets ${max.pets}); budget 48 MiB; caps: party ${caps.party} MiB, creature cache ${caps.creatures} frames, pet cache ${caps.pets} frames`);
const bad = rows.filter((r) => r.error).length + (max.total > 48 ? 1 : 0) + errors.length;
if (errors.length) console.log('page errors: ' + errors.slice(0, 3).join('; '));
await ctx.close(); await b.close(); srv.close();
process.exit(bad ? 1 : 0);
