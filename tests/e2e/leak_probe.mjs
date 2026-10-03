// Per-encounter leak probe (a diagnostic, not in the default suite): which code adds event listeners, or keeps
// DOM, that outlive an encounter? It wraps addEventListener/removeEventListener with weak references (so the
// probe itself retains nothing) and records each adding call site, mapped back to its src/ file through the
// build's section markers. It runs N cycles of: a fresh synthetic campaign -> a battle -> (optionally one full
// exchange: a response, its language task answered right, Continue, the companion's turn) -> Step back. After
// each cycle (garbage collected) it prints Chrome's own counters and the live listeners grouped by call site,
// target and whether the target is still in the page, and at the end what grew.
// Note: never keep a Playwright element handle across cycles (waitForSelector returns one): a kept handle
// holds that element's detached subtree alive and reads exactly like a leak.
// Usage: node tests/e2e/leak_probe.mjs [cycles=10] [mode=battle|answer|answer-normal|nobattle] [--root <checkout>]
//        LK_DEBUG=1 prints each cycle's states.
import fs from 'node:fs';
const ri = process.argv.indexOf('--root');
const root = ri > 0 ? process.argv[ri + 1] : new URL('../..', import.meta.url).pathname.replace(/\/$/, '');
const pos = process.argv.slice(2).filter((a, i, all) => a !== '--root' && all[i - 1] !== '--root');
const N = +(pos[0] || 10);
const MODE = pos[1] || 'battle';
const { serve, launch } = await import(root + '/tests/e2e/lib.mjs');
const html = fs.readFileSync(root + '/index.html', 'utf8').split('\n');
const marks = [];
html.forEach((l, i) => { const m = l.match(/^\/\* ==== (src\/[^ ]+) ==== \*\/$/); if (m) marks.push([i + 1, m[1]]); });
const where = (line) => { let f = '?', s = 0; for (const [ln, file] of marks) { if (ln <= line) { f = file; s = ln; } else break; } return f + ':' + (line - s); };

const { srv, url } = await serve();
const b = await launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
await ctx.addInitScript(() => {
  const ET = EventTarget.prototype, add = ET.addEventListener, rem = ET.removeEventListener;
  const targets = new Set(), lists = new WeakMap();
  const capOf = (o) => (typeof o === 'boolean' ? o : !!(o && o.capture));
  const site = () => {
    const fr = String(new Error().stack).split('\n').filter((l) => /https?:\/\/127\.0\.0\.1:\d+\/[^:)]*:\d+:\d+/.test(l)).slice(0, 3);
    return fr.map((l) => { const m = l.match(/127\.0\.0\.1:\d+\/[^:)]*:(\d+):\d+/); const fn = (l.match(/at ([^\s(]+) \(/) || [])[1] || ''; return m[1] + (fn ? '@' + fn : ''); }).join(' < ') || '?';
  };
  const desc = (t) => {
    if (t === window) return 'window'; if (t === document) return 'document';
    if (t instanceof Element) return t.tagName.toLowerCase() + (t.id ? '#' + t.id : '') + (t.className && typeof t.className === 'string' ? '.' + t.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
    return (t && t.constructor && t.constructor.name) || 'object';
  };
  ET.addEventListener = function (type, fn, o) {
    if (fn && !(o && o.once)) {
      let L = lists.get(this);
      if (!L) { L = []; lists.set(this, L); targets.add(new WeakRef(this)); }
      const cap = capOf(o);
      if (!L.some((e) => e.type === type && e.cap === cap && e.lref.deref() === fn)) {
        const ent = { type, cap, lref: new WeakRef(fn), site: site(), desc: desc(this) };
        L.push(ent);
        if (o && o.signal) { const me = this; o.signal.addEventListener('abort', () => { const i = L.indexOf(ent); if (i >= 0) L.splice(i, 1); }, { once: true }); void me; }
      }
    }
    return add.call(this, type, fn, o);
  };
  ET.removeEventListener = function (type, fn, o) {
    const L = lists.get(this);
    if (L) { const cap = capOf(o); const i = L.findIndex((e) => e.type === type && e.cap === cap && e.lref.deref() === fn); if (i >= 0) L.splice(i, 1); }
    return rem.call(this, type, fn, o);
  };
  window.__LK = {
    snapshot() {
      const by = {};
      for (const w of [...targets]) {
        const t = w.deref();
        if (!t) { targets.delete(w); continue; }
        const L = lists.get(t) || [];
        const conn = t instanceof Node ? (t.isConnected ? 'on' : 'DETACHED') : 'obj';
        for (const e of L) { const k = e.site + ' | ' + e.type + ' | ' + conn + ' | ' + e.desc.slice(0, 40); by[k] = (by[k] || 0) + 1; }
      }
      return by;
    },
  };
});
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(url);
await p.waitForFunction(() => window.__RB_READY__ === true, null, { timeout: 20000 });
const cdp = await ctx.newCDPSession(p);
await cdp.send('Performance.enable');
const wait = (ms) => p.waitForTimeout(ms);

async function cycle(k) {
  await p.evaluate((o) => {
    const s = RB.game.debugStart('rw.mill1', 7, 9, { comp: o.comp, flags: { rw_gears: true } });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
    s.words = ['mizu', 'iyasu', 'mamoru'];
    s.tips = { harmony: 1, harmonyFull: 1, cturn: 1, group: 1 };
    for (const k of ['strike', 'sweep', 'shroud', 'rest', 'heat', 'charge', 'lie', 'mirror', 'plea']) s.tips['intent:' + k] = 1;
    for (const w of s.words) s.tips['word:' + w] = 1;
    Object.assign(RB.game.settings, { input: 'choice', textSpeed: o.mode === 'answer-normal' ? 'normal' : 'instant', battleAnim: o.mode === 'answer-normal' ? 'normal' : 'fast' });
    RB.game.applySettings();
    window.__result = null;
    if (o.mode === 'nobattle') { window.__result = 'none'; return; }
    const place = RB.content.maps['rw.mill1'].foes.find((f) => f.id === 'm1a');
    RB.game.startBattle(place.enemy, { place, where: { map: 'rw.mill1', x: place.x, y: place.y }, foeKey: 'lk:' + Math.random() }).then((r) => { window.__result = r || 'done'; });
  }, { comp: ['nao', 'mio', 'ren', 'suzu'][k % 4], mode: MODE });
  if (MODE === 'nobattle') { await wait(600); return; }
  // to the cards (advance any lines), then Step back
  for (let i = 0; i < 400; i++) {
    const s = await p.evaluate(() => ({ r: window.__result, dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.rcard[data-i]') && !RB.battleSeq.busy() }));
    if (s.r || s.cards) break;
    if (s.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await wait(25);
  }
  if (MODE === 'answer' || MODE === 'answer-normal') {
    // choose the first response card, answer its language task correctly, and let the exchange play
    await p.evaluate(() => { if (!window.__wrapStep) { window.__wrapStep = true; const run = RB.challenge.runStep; RB.challenge.runStep = (st, o) => { window.__lastStep = st; return run(st, o); }; } });
    await p.evaluate(() => { const c = [...document.querySelectorAll('.rcard[data-i]')].find((x) => !x.disabled); if (c) c.click(); });
    const answer = () => p.evaluate(() => {
      const st = window.__lastStep, bs = [...document.querySelectorAll('.chal .btn.choice, .chal .mc .btn')].filter((x) => !x.disabled && x.offsetParent);
      if (!st || !bs.length) return 'none';
      const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => (o.text != null ? RB.tasks.plain(o.text) : o.en || ''));
      const txt = (el) => { const c = el.cloneNode(true); c.querySelectorAll('rt,.enline').forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, ''); };
      const k = bs.findIndex((x) => right.some((r) => txt(x) === r.replace(/\s+/g, '') || (x.querySelector('.enline') && right.includes(x.querySelector('.enline').textContent.trim()))));
      if (k < 0) return 'no-match:' + right.join('/');
      bs[k].click(); return 'ok';
    });
    const log = [];
    for (let i = 0; i < 600; i++) {
      const s = await p.evaluate(() => ({ r: window.__result, dlg: RB.ui.dialogue.isOpen(), go: [...document.querySelectorAll('.fbwrap .fb-go')].some((e) => e.offsetParent), cc: [...document.querySelectorAll('.ccard:not([disabled])')].some((e) => e.offsetParent), btn: [...document.querySelectorAll('.chal .btn.choice:not([disabled]), .chal .mc .btn:not([disabled])')].some((e) => e.offsetParent) && ![...document.querySelectorAll('.fbwrap .fb-go')].some((e) => e.offsetParent), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal') && !RB.battleSeq.busy() && RB.combat.phase && RB.combat.phase() === 'choose' }));
      const sig = JSON.stringify(s);
      if (process.env.LK_DEBUG && sig !== globalThis.__lastSig) { globalThis.__lastSig = sig; console.log('     state ' + i + ': ' + sig + ' chal=' + (await p.evaluate(() => { const c = document.querySelector('.chal'); return c ? c.className + ' btns:' + [...c.querySelectorAll('button')].filter((b) => b.offsetParent).map((b) => (b.className + ':' + b.textContent.trim().slice(0, 14))).join('|') : '-'; }))); }
      if (s.r) break;
      if (s.cards && log.length) break;
      if (s.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
      else if (s.go) { await p.evaluate(() => [...document.querySelectorAll('.fbwrap .fb-go')].find((e) => e.offsetParent).click()); log.push('go'); await wait(150); }
      else if (s.cc) { await wait(320); await p.evaluate(() => { const c = document.querySelector('.ccard:not([disabled])'); if (c) c.click(); }); log.push('comp'); await wait(150); }
      else if (s.btn) { log.push(await answer()); await wait(150); }
      await wait(25);
    }
    if (k === 0 || log.some((x) => !['ok', 'go', 'comp'].includes(x))) console.log('   steps: ' + log.join(', '));
  }
  await p.evaluate(() => { const f = document.querySelector('.cb-dock [data-flee]'); if (f) f.click(); });
  await p.waitForSelector('.csheet button', { timeout: 4000 }).then((h) => h && h.dispose()).catch(() => null);
  await p.evaluate(() => { const bs = [...document.querySelectorAll('.csheet button')].filter((x) => /Step back/.test(x.textContent)); if (bs.length) bs[bs.length - 1].click(); });
  for (let i = 0; i < 300 && !(await p.evaluate(() => !!window.__result)); i++) await wait(20);
  for (let i = 0; i < 100 && (await p.evaluate(() => RB.game.mode() !== 'world')); i++) { await p.evaluate(() => { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); }); await wait(30); }
  await wait(300);
}
async function measure() {
  await cdp.send('HeapProfiler.collectGarbage').catch(() => {});
  await wait(200);
  await cdp.send('HeapProfiler.collectGarbage').catch(() => {});
  const m = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((x) => [x.name, x.value]));
  const snap = await p.evaluate(() => __LK.snapshot());
  const el = await p.evaluate(() => document.getElementsByTagName('*').length);
  const left = await p.evaluate(() => ({ chal: document.querySelectorAll('.chal').length, combat: document.querySelectorAll('.combat-ui').length, scrim: document.querySelectorAll('.scrim,.csheet').length, mode: RB.game.mode(), stack: RB.game.modes ? RB.game.modes() : null, chalParent: [...document.querySelectorAll('.chal')].map((c) => (c.parentElement && (c.parentElement.id || c.parentElement.className)) || '?').join(',') }));
  console.log('   left: ' + JSON.stringify(left));
  return { listeners: m.JSEventListeners, nodes: m.Nodes, el, snap };
}
const rows = [];
for (let k = 0; k < N; k++) {
  await cycle(k);
  const r = await measure();
  rows.push(r);
  console.log('cycle ' + (k + 1) + ': JSEventListeners ' + r.listeners + ', Nodes ' + r.nodes + ', connected elements ' + r.el + ', tracked ' + Object.values(r.snap).reduce((a, b) => a + b, 0));
}
// what grows between cycle 3 and the last
const a = rows[Math.min(2, rows.length - 1)].snap, z = rows[rows.length - 1].snap;
const keys = new Set([...Object.keys(a), ...Object.keys(z)]);
const grow = [...keys].map((k) => [k, (z[k] || 0) - (a[k] || 0)]).filter(([, d]) => d !== 0).sort((x, y) => y[1] - x[1]);
const pretty = (k) => k.replace(/(\d+)(@[^ <|]*)?/g, (m0, ln, fn) => (+ln > 100 ? where(+ln) + (fn || '') : m0));
console.log('\nGrowth of tracked listeners from cycle 3 to ' + rows.length + ' (' + (rows.length - 3) + ' cycles):');
for (const [k, d] of grow.slice(0, 40)) console.log((d > 0 ? '+' : '') + d + '  ' + pretty(k));
console.log('\nerrors: ' + errors.length + (errors.length ? ' ' + errors.slice(0, 3).join(' | ') : ''));
await b.close(); srv.close();
