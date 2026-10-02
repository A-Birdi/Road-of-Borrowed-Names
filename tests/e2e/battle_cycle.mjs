// Long-session cleanup (battle addendum §23.6) on the built index.html in Chromium: 20 battle
// entries and exits in one page, revisiting some fixtures and introducing others (alone and with
// each companion; one, two and three creatures; a pet shown; Normal, Fast and Instant playback;
// reduced motion; a skipped exchange; a hidden tab mid-action; a finishing response; Step back).
// After each exit (garbage collected) it records Chrome's own counters — event listeners, DOM nodes,
// JS heap — and the battle layers left in the page (banner, badges, cards, overlays, strips, effect
// layers). Listener and node counts must come back to a stable baseline instead of growing with
// every battle; no battle-only element may outlive its battle.
// Usage: node tests/e2e/battle_cycle.mjs [--out tests/e2e/out/battle_cycle.json]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page } from './lib.mjs';

const args = process.argv.slice(2);
const outAt = args.indexOf('--out');
const OUT = outAt >= 0 ? args[outAt + 1] : 'tests/e2e/out/battle_cycle.json';
const { srv, url } = await serve();
const b = await launch();
const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
const cdp = await ctx.newCDPSession(p);
await cdp.send('Performance.enable');

const COMPS = [null, 'nao', 'mio', 'ren', 'suzu'];
const plan = [];
for (let k = 0; k < 20; k++) {
  plan.push({
    comp: COMPS[k % 5], foes: 1 + (k % 3), anim: ['normal', 'fast', 'instant'][Math.floor(k / 3) % 3], reduce: k % 7 === 3, pet: k % 4 === 1 ? 'cat' : k % 4 === 2 ? 'dog' : null,
    end: ['flee', 'finish', 'skip', 'hidden'][k % 4],
  });
}

// (an element handle the test keeps would hold its DOM alive through the DevTools session and
// read as a leak: every wait disposes its handle)
const waitSel = async (sel, o) => { const h = await p.waitForSelector(sel, o); if (h) await h.dispose(); };
async function metrics() {
  await cdp.send('HeapProfiler.collectGarbage').catch(() => {});
  await p.waitForTimeout(150);
  const m = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((x) => [x.name, x.value]));
  const dom = await p.evaluate(() => ({
    combat: document.querySelectorAll('.combat-ui').length, banner: document.querySelectorAll('.cb-banner').length, badges: document.querySelectorAll('.cb-badges, .cb-ib').length,
    icard: document.querySelectorAll('#cb-icard').length, kwcard: document.querySelectorAll('.kwcard').length, strips: document.querySelectorAll('.cb-strip').length, fx: document.querySelectorAll('.cb-fx').length,
    chal: document.querySelectorAll('.chal').length, mode: RB.game.mode(), seqBusy: RB.battleSeq.busy(), banState: !!(RB.battleBanner && RB.battleBanner.state().visible), stage: RB.battleStage.active(),
    elements: document.getElementsByTagName('*').length,
  }));
  return { listeners: m.JSEventListeners, nodes: m.Nodes, heapMB: +(m.JSHeapUsedSize / 1048576).toFixed(1), docs: m.Documents, ...dom };
}

async function one(c) {
  await p.evaluate((o) => {
    const s = RB.game.debugStart('rw.mill1', 7, 9, { comp: o.comp, flags: { rw_gears: true } });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.learn.difficulty = o.foes > 2 ? 'hard' : 'normal';
    s.words = ['mizu', 'iyasu', 'mamoru'];
    s.tips = { harmony: 1, harmonyFull: 1, cturn: 1, group: 1 };
    for (const k of ['strike', 'sweep', 'shroud', 'rest', 'heat', 'charge', 'lie', 'mirror', 'plea']) s.tips['intent:' + k] = 1;
    for (const w of s.words) s.tips['word:' + w] = 1;
    if (o.pet) { RB.pets.meet(s, o.pet); RB.pets.select(s, o.pet); }
    Object.assign(RB.game.settings, { input: 'choice', battleAnim: o.anim, reducedMotion: o.reduce });
    RB.game.applySettings();
    const run = RB.challenge.runStep;
    if (!RB.challenge.__cyc) { RB.challenge.__cyc = true; RB.challenge.runStep = (step, op) => { window.__lastStep = step; return run(step, op); }; }
    const place = RB.content.maps['rw.mill1'].foes.find((f) => f.id === 'm1a');
    window.__result = null;
    RB.game.startBattle(place.enemy, { place, where: { map: 'rw.mill1', x: place.x, y: place.y }, foeKey: 'cyc', group: o.foes > 1 ? Array(o.foes - 1).fill(place.enemy) : undefined }).then((r) => { window.__result = r || 'done'; });
  }, c);
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
  // the badges: open one and leave it open into the exchange
  await p.evaluate(() => { const ib = document.querySelector('.cb-ib'); if (ib) ib.click(); });
  if (c.end === 'finish') await p.evaluate(() => { const st = RB.combat.state(); for (const f of st.foes) f.knots = 1; st.knots = 1; RB.combat.target(st.cur); });
  if (c.end !== 'flee') {
    await p.evaluate(() => [...document.querySelectorAll('.rcard[data-i]')].find((x) => !x.disabled && /unravel/i.test(x.textContent)).click());
    await waitSel('.chal .mc .btn', { timeout: 10000 });
    await p.evaluate(() => {
      const st = window.__lastStep;
      const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => (o.text != null ? RB.tasks.plain(o.text) : o.en || ''));
      const txt = (el) => { const c = el.cloneNode(true); c.querySelectorAll('rt,.enline').forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, ''); };
      const bs = [...document.querySelectorAll('.chal .mc .btn')];
      bs[bs.findIndex((x) => right.some((r) => txt(x) === r.replace(/\s+/g, '') || (x.querySelector('.enline') && right.includes(x.querySelector('.enline').textContent.trim()))))].click();
    });
    await waitSel('.fbwrap .fb-go', { timeout: 10000 });
    await p.evaluate(() => document.querySelector('.fbwrap .fb-go').click());
    if (c.comp) { await waitSel('.ccard[data-a]', { timeout: 8000 }); await p.waitForTimeout(280); await p.evaluate(() => [...document.querySelectorAll('.ccard[data-a]')].find((x) => !x.disabled).click()); }
    if (c.anim !== 'instant' && (c.end === 'skip' || c.end === 'hidden')) {
      await p.waitForFunction(() => RB.battleSeq.busy(), null, { timeout: 8000 }).catch(() => null);
      if (c.end === 'skip') { await waitSel('.cb-skip:not([hidden])', { timeout: 4000 }).catch(() => null); await p.waitForTimeout(200); await p.evaluate(() => { const k = document.querySelector('.cb-skip:not([hidden])'); if (k) k.click(); }); }
      else await p.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
    }
    await decision();
  }
  // leave: Step back (unless it was won)
  if (!(await p.evaluate(() => window.__result))) {
    await p.evaluate(() => { const f = document.querySelector('.cb-dock [data-flee]'); if (f) f.click(); });
    await p.waitForTimeout(300);
    await p.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter((x) => /^\s*Step back\s*$/.test(x.textContent)); if (bs.length) bs[bs.length - 1].click(); });
  }
  for (let i = 0; i < 400 && !(await p.evaluate(() => !!window.__result && RB.game.mode() !== 'combat')); i++) { if (await p.evaluate(() => RB.ui.dialogue.isOpen())) await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(25); }
  await p.waitForTimeout(500);
  return p.evaluate(() => window.__result);
}

const rows = [];
rows.push({ k: 0, label: 'before any battle', ...(await metrics()) });
for (let k = 0; k < plan.length; k++) {
  const c = plan[k];
  let result = null, error = null;
  try { result = await one(c); } catch (e) { error = String((e && e.message) || e).slice(0, 300); }
  const m = await metrics();
  rows.push({ k: k + 1, label: `${c.comp || 'alone'} ×${c.foes} ${c.anim}${c.reduce ? ' reduced' : ''}${c.pet ? ' pet ' + c.pet : ''} → ${c.end}`, result, error, ...m });
  console.log(`${String(k + 1).padStart(2)} ${rows[rows.length - 1].label}: ${result || error} · listeners ${m.listeners}, nodes ${m.nodes}, heap ${m.heapMB} MB, left: combat ${m.combat}, banner ${m.banner}, badges ${m.badges}, cards ${m.icard + m.kwcard}, strips ${m.strips}, fx ${m.fx}`);
}
const tail = rows.slice(5);
const span = (key) => Math.max(...tail.map((r) => r[key])) - Math.min(...tail.map((r) => r[key]));
const first = rows[5], last = rows[rows.length - 1];
const problems = [];
for (const r of rows.slice(1)) {
  if (r.error) problems.push(r.k + ': ' + r.error);
  if (r.combat || r.banner || r.badges || r.icard || r.kwcard || r.strips || r.fx || r.chal || r.seqBusy || r.banState || r.stage || r.mode === 'combat') problems.push(r.k + ': battle-only state left behind ' + JSON.stringify({ combat: r.combat, banner: r.banner, badges: r.badges, icard: r.icard, kwcard: r.kwcard, strips: r.strips, fx: r.fx, chal: r.chal, busy: r.seqBusy, stage: r.stage, mode: r.mode }));
}
// stable: no steady climb from battle 5 to battle 20 (a leak of one listener or node set per battle would add 15+)
if (last.listeners - first.listeners > 10) problems.push('listeners grew from ' + first.listeners + ' (battle 5) to ' + last.listeners + ' (battle 20)');
if (last.nodes - first.nodes > 400) problems.push('DOM nodes grew from ' + first.nodes + ' to ' + last.nodes);
if (errors.length) problems.push('page errors: ' + errors.slice(0, 3).join('; '));
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ when: new Date().toISOString(), browser: 'Chromium (Playwright, headless)', rows, spanFrom5: { listeners: span('listeners'), nodes: span('nodes'), heapMB: +span('heapMB').toFixed(1) }, problems }, null, 1));
console.log(`\nfrom battle 5 to 20: listeners ${first.listeners} → ${last.listeners}, nodes ${first.nodes} → ${last.nodes}, heap ${first.heapMB} → ${last.heapMB} MB`);
console.log(problems.length ? 'PROBLEMS:\n  ' + problems.join('\n  ') : 'stable: every battle-only element gone after each exit, no growth in listeners or nodes');
await ctx.close();
await b.close();
srv.close();
process.exit(problems.length ? 1 : 0);
