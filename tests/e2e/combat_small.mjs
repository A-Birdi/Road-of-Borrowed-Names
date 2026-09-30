// After an exchange on a small phone (320×640 and 390×844, normal and 200 % text), the
// "Last exchange" recap and a one-time note never cover Step back: the responses keep
// their room, the recap gives way, and the button is reachable and on top.
import { serve, launch, page } from './lib.mjs';
let fail = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const { srv, url } = await serve(); const b = await launch();
for (const [w, h, sc] of [[320, 640, 2], [390, 844, 2], [320, 640, 1]]) {
  const { p, errors } = await page(b, url, { viewport: { width: w, height: h }, touch: true, mobile: true, dpr: 2 });
  await p.evaluate((sc) => { RB.game.settings.textScale = sc; RB.game.applySettings(); const s = RB.game.debugStart('rw.millroad', 11, 10, { dir: 'up', flags: { rw_mill_open: true } }); s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.words = ['mamoru']; RB.game.settings.input = 'choice'; RB.game.settings.textSpeed = 'instant'; s.tips = { harmony: 1, harmonyFull: 1 };
    const run = RB.challenge.runStep; RB.challenge.runStep = (st, o) => { window.__step = st; return run(st, o); };
    window.__r = null; RB.game.startBattle('rw.reedling').then((r) => { window.__r = r || 'done'; }); }, sc);
  const wait = (ms) => p.waitForTimeout(ms);
  for (let i = 0; i < 200; i++) { const st = await p.evaluate(() => ({ c: !!document.querySelector('.rcard[data-i]') && RB.combat.phase() === 'choose', d: RB.ui.dialogue.isOpen() })); if (st.c) break; if (st.d) await p.evaluate(() => RB.ui.dialogue.advance(true)); await wait(60); }
  // one exchange: Unravel, the right choice
  await p.evaluate(() => { const c = [...document.querySelectorAll('.rcard[data-i]')].find((x) => /unravel/i.test(x.textContent)); c.click(); });
  await p.waitForSelector('.chal .mc .btn, .chal .tiles [data-add]', { timeout: 10000 });
  await p.evaluate(() => { const st = window.__step; const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); }; const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.util.esc(o.en) + '</span>' : ''); const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => txt(html(o))); const el = [...document.querySelectorAll('.chal .mc .btn')].find((x) => right.includes(x.textContent.replace(/\s+/g, ' ').trim())); el.click(); });
  await p.waitForSelector('.fbwrap .fb-go', { timeout: 10000 }); await p.click('.fbwrap .fb-go');
  for (let i = 0; i < 300; i++) { const st = await p.evaluate(() => ({ c: !!document.querySelector('.rcard[data-i]') && RB.combat.phase() === 'choose' && !RB.battleSeq.busy(), d: RB.ui.dialogue.isOpen(), cc: !!document.querySelector('.ccard') })); if (st.c) break; if (st.cc) await p.evaluate(() => document.querySelector('.ccard').click()); if (st.d) await p.evaluate(() => RB.ui.dialogue.advance(true)); await wait(60); }
  await wait(400);
  const r = await p.evaluate(() => { const q = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom) }; }; const f = q('[data-flee]'), c = q('.clog.recap'); const top = f ? document.elementFromPoint((f.l + f.r) / 2, (f.t + f.b) / 2) : null; return { flee: f, recap: c, topIsFlee: !!(top && top.closest('[data-flee]')), topCls: top ? top.className : null, vh: innerHeight }; });
  const tag = w + 'x' + h + (sc !== 1 ? ' at ' + sc * 100 + ' % text' : '');
  assert(r.flee && r.recap && (r.flee.b <= r.recap.t + 1 || r.recap.b <= r.flee.t + 1), tag + ': the recap and Step back do not overlap (' + JSON.stringify(r) + ')');
  const sc2 = await p.evaluate(() => { const f = document.querySelector('[data-flee]'); if (!f) return null; f.scrollIntoView({ block: 'center' }); const b = f.getBoundingClientRect(); const top = document.elementFromPoint((b.left + b.right) / 2, (b.top + b.bottom) / 2); return { t: Math.round(b.top), b: Math.round(b.bottom), inView: b.top >= 0 && b.bottom <= innerHeight, hit: !!(top && top.closest('[data-flee]')) }; });
  assert(sc2 && sc2.inView && sc2.hit, tag + ': Step back can be scrolled to and is on top (' + JSON.stringify(sc2) + ')');
  assert(!errors.length, tag + ': no page errors ' + errors.join('; '));
  await p.context().close();
}
await b.close(); srv.close();
console.log(fail ? fail + ' failed' : 'all ok');
process.exit(fail ? 1 : 0);
