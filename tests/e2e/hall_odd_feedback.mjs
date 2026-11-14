// The Hall's odd-one-out tasks on screen (Batch 2, row 3: CL-739 (a); Cloud CC-581, CC-582, CC-583; Local CL-812,
// CL-814, CL-816; Agnes 6868287302). In Chromium on the built game, on a throwaway journey, with the real buttons. One
// task per wing (a different level and card set across the ten; eight of the ten odd-card notes, Wing 3 set 2 Advanced's
// among them, carry readings over kanji), each answered five ways:
//  1. a wrong card first: "Not that one.", that card's own note (a reason ending "This one follows the rule."), "Try
//     another."; no "Yes." and no odd-card note; then the odd card: "Yes." and the odd card's note; not first try, not
//     helped, recorded once, as before;
//  2. the odd card at once: "Yes." and the odd card's note, no help line; first try, recorded once, not assisted;
//  3. with word help (a word of the plaques looked up) and then the odd card: "Yes.", "Practiced with word help.", the
//     odd card's note; assisted, not revealed, recorded once as helped;
//  4. "I don't know": the answer and the odd card's note; Continue: right, assisted, revealed, recorded once, as before;
//  5. left untouched ("Come back later"): no note of any kind, nothing recorded, cancelled;
// every note shown as written, with readings over the kanji where it has them and no brace, bar or tag showing;
// and through the Hall itself (Wing 3, its hook, at Advanced): the odd card counts (_res 1, the task recorded done),
// with the note shown; "Come back later" there counts nothing (_res 0); Wing 1's Grow stretch question (outside this
// change) shows no odd-card note. No page errors.
// Usage: node tools/build.mjs && node tests/e2e/hall_odd_feedback.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const FOLLOWS = 'This one follows the rule.';
const TASKS = [['hall.w1.counter1', 'E'], ['hall.w2.counter0', 'F'], ['hall.w3.counter1', 'A'], ['hall.w4.counter0', 'I'], ['hall.w5.counter1', 'E'],
  ['hall.w6.counter0', 'A'], ['hall.w7.counter1', 'I'], ['hall.w8.counter0', 'E'], ['hall.w9.counter1', 'A'], ['hall.w10.counter0', 'F']];
const base = (s) => String(s || '').replace(/\{([^|}]+)\|[^}]*\}/g, '$1');

async function begin(p) {
  await p.evaluate(() => {
    const done = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true, postgame: true, hall_ledger: true, hall_foyer_seen: true, ngp_offered: true };
    const s = RB.game.debugStart('hall.foyer', 40, 14, { comp: 'mio', flags: done });
    s.edition = 2; s.learn.kanaKnown = 'both'; s.learn.profile = 'A';
    RB.game.settings.input = 'choice'; RB.game.settings.reducedMotion = true; RB.game.settings.textSpeed = 'instant'; RB.game.settings.lightbulb = true;
    RB.game.applySettings();
    const rec = RB.learn.record;
    window.__recs = [];
    RB.learn.record = (id, r) => { window.__recs.push({ ids: [].concat(id), ok: r.ok, assisted: !!r.assisted, help: r.help || null }); return rec(id, r); };
  });
  await p.waitForTimeout(200);
}
// open a step as the Hall's tasks run it (RB.challenge.runStep), not awaited
async function open(p, id, tier, stretch) {
  await p.evaluate(([id, tier, stretch]) => {
    window.__res = null; window.__recs.length = 0;
    RB.game.pushMode('challenge');
    const c = RB.content.challenges[id];
    const st = RB.tasks.prepare(RB.util.deepClone(stretch ? c.stretchA[0] : c.tiers[tier][0]));
    window.__item = [].concat(st.item)[0];
    RB.challenge.runStep(st, { ctxTag: 'hall', cancelLabel: 'Come back later' }).then((r) => { RB.game.popMode('challenge'); window.__res = r; });
  }, [id, tier, !!stretch]);
  await p.waitForSelector('.chal [data-a=reveal]', { timeout: 8000 });
  await p.waitForTimeout(80);
}
// press a card's button: the odd one (right) or the first that follows the rule (wrong)
const press = (p, right) => p.evaluate((right) => {
  const st = RB.challenge.current();
  const norm = (h) => h.replace(/ data-src="[^"]*"/g, '');
  // a card's button shows its Japanese; an English option (the stretch questions) shows its English
  const opts = st.options.filter((o) => !!o.ok === right);
  const same = (x, o) => (o.jp ? norm(x.innerHTML) === norm(RB.ui.jhtml(o.jp)) : x.textContent.indexOf(o.en.slice(0, 40)) >= 0);
  const bn = [...document.querySelectorAll('.chal .mc .btn')].find((x) => !x.disabled && opts.some((o) => same(x, o)));
  if (!bn) return null;
  const o = opts.find((q) => same(bn, q));
  bn.click();
  // the card pressed, and its own note
  return { why: o.why ? o.why.en : null };
}, right);
// what the feedback shows: its kind and head, the note under it (readings removed, and whether any markup shows)
const seen = (p) => p.evaluate(() => {
  const w = document.querySelector('.chal .fbwrap[data-fb]');
  const read = (el) => { if (!el) return null; const c = el.cloneNode(true); c.querySelectorAll('rt').forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, ' ').trim(); };
  const ex = document.querySelector('.chal .fb-ex'), why = document.querySelector('.chal .fb-why');
  return {
    fb: w ? w.getAttribute('data-fb') : null, all: w ? w.textContent : '', ex: read(ex), exRuby: ex ? ex.querySelectorAll('ruby').length : 0,
    exRaw: ex ? /[{}|<>]/.test(read(ex)) : false, why: read(why), whyRaw: why ? /[{}|<>]/.test(read(why)) : false,
    help: (document.querySelector('.chal .fb-help') || {}).textContent || null,
  };
});
const cont = async (p) => {
  await p.click('.chal .fbwrap [data-a=continue]');
  await p.waitForFunction(() => window.__res, null, { timeout: 5000 });
  return p.evaluate(() => ({ res: window.__res, recs: window.__recs.filter((r) => r.ids.includes(window.__item)) }));
};
const notes = (p, id, tier) => p.evaluate(([id, tier]) => {
  const st = RB.content.challenges[id].tiers[tier][0];
  return { odd: st.options.find((o) => o.ok).why.en };
}, [id, tier]);
const norm = (s) => base(s).replace(/\s+/g, ' ').trim();

const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 860 } });
await begin(p);
for (const [id, tier] of TASKS) {
  const tag = id.replace('hall.', '') + ' ' + tier;
  const n = await notes(p, id, tier);
  const ruby = /\{[^|}]+\|/.test(n.odd);
  const shows = (s) => s.ex === norm(n.odd) && !s.exRaw && (!ruby || s.exRuby > 0);
  // 1. wrong, then the odd card
  await open(p, id, tier);
  const wrong = await press(p, false);
  await p.waitForSelector('.chal .fbwrap[data-fb=no]');
  const w1 = await seen(p);
  ok(wrong && w1.fb === 'no' && /Not that one\./.test(w1.all) && /Try another\./.test(w1.all) && !/Yes\./.test(w1.all) && w1.ex === null && w1.why === norm(wrong.why) && w1.why.endsWith(FOLLOWS) && !/correct/i.test(w1.why) && !w1.whyRaw && w1.all.indexOf(norm(n.odd).slice(0, 30)) < 0,
    '1 ' + tag + ' wrong: "Not that one.", its own note, "Try another."; no "Yes.", no odd-card note ' + flat({ why: w1.why }));
  await press(p, true);
  await p.waitForSelector('.chal .fbwrap[data-fb=ok]');
  const w2 = await seen(p);
  const r1 = await cont(p);
  ok(/Yes\./.test(w2.all) && shows(w2) && r1.res.ok && r1.res.firstTry === false && r1.res.mistakes === 1 && !r1.res.assisted && r1.recs.length === 1 && !r1.recs[0].ok && !r1.recs[0].assisted,
    '1 ' + tag + ' then the odd card: "Yes." and the odd card\'s note; not first try, not helped, recorded once ' + flat({ ex: w2.ex, ruby: w2.exRuby, recs: r1.recs }));
  // 2. the odd card at once
  await open(p, id, tier);
  await press(p, true);
  await p.waitForSelector('.chal .fbwrap[data-fb=ok]');
  const u = await seen(p);
  const r2 = await cont(p);
  ok(/Yes\./.test(u.all) && shows(u) && !u.help && r2.res.ok && r2.res.firstTry === true && !r2.res.assisted && r2.recs.length === 1 && r2.recs[0].ok && !r2.recs[0].assisted,
    '2 ' + tag + ' unaided: "Yes." and the odd card\'s note, no help line; first try, recorded once ' + flat({ recs: r2.recs }));
  // 3. word help, then the odd card
  await open(p, id, tier);
  const tapped = await p.evaluate(() => { const t = document.querySelector('.chal [data-src] .jt'); if (!t) return false; t.dispatchEvent(new MouseEvent('click', { bubbles: true })); return true; });
  await p.waitForTimeout(150);
  // the word's card, opened by a tap, is closed with its own Close (a tap elsewhere would only close it)
  const closed = await p.evaluate(() => { const c = document.querySelector('.help [data-a=close]'); if (c) c.click(); return !!c; });
  await p.waitForTimeout(100);
  await press(p, true);
  await p.waitForSelector('.chal .fbwrap[data-fb=ok]');
  const h = await seen(p);
  const r3 = await cont(p);
  ok(tapped && closed && /Yes\./.test(h.all) && shows(h) && /word help/.test(h.help || '') && r3.res.ok && r3.res.assisted && !r3.res.revealed && r3.recs.length === 1 && r3.recs[0].ok && r3.recs[0].assisted && r3.recs[0].help !== 'supplied',
    '3 ' + tag + ' with word help: "Yes.", "Practiced with word help.", the odd card\'s note; assisted, recorded once as helped ' + flat({ help: h.help, recs: r3.recs }));
  // 4. "I don't know"
  await open(p, id, tier);
  await p.click('.chal [data-a=reveal]');
  await p.waitForSelector('.chal .fbwrap[data-fb=reveal]');
  const v = await seen(p);
  const r4 = await cont(p);
  ok(/The answer/.test(v.all) && shows(v) && r4.res.ok && r4.res.assisted && r4.res.revealed && !r4.res.cancelled && r4.recs.length === 1 && r4.recs[0].ok && r4.recs[0].assisted && r4.recs[0].help === 'supplied',
    '4 ' + tag + ' "I don\'t know": the answer and the odd card\'s note; Continue: right, assisted, revealed, recorded once ' + flat({ recs: r4.recs }));
  // 5. left untouched
  await open(p, id, tier);
  const before = await seen(p);
  await p.click('.chal [data-a=leave]');
  await p.waitForFunction(() => window.__res, null, { timeout: 5000 });
  const r5 = await p.evaluate(() => ({ res: window.__res, recs: window.__recs.filter((r) => r.ids.includes(window.__item)), ex: !!document.querySelector('.fb-ex') }));
  ok(before.fb === null && before.ex === null && !r5.ex && r5.res.cancelled && !r5.res.ok && r5.recs.length === 0,
    '5 ' + tag + ' left untouched: no note of any kind, nothing recorded, cancelled ' + flat({ fb: before.fb, res: { cancelled: r5.res.cancelled, ok: r5.res.ok }, recs: r5.recs }));
}

// through the Hall itself: Wing 3, its hook, at Advanced (set 2 at that level: the note with readings over kanji)
{
  const want = await notes(p, 'hall.w3.counter1', 'A');
  const viaHook = async (pick) => {
    await p.evaluate(() => { window.__done = false; RB.game.s.vars._res = null; delete RB.game.s.flags['chal:hall.w3.counter1']; RB.hooks.hall_challenge(['hall.w3.counter1']).then(() => { window.__done = true; }); });
    for (let i = 0; i < 40 && !(await p.evaluate(() => !!document.querySelector('.chal [data-a=reveal]'))); i++) {
      await p.evaluate(() => { const g = document.querySelector('.teach [data-ok]'); if (g) g.click(); });
      await p.waitForTimeout(100);
    }
    let s = null;
    if (pick === 'odd') { await press(p, true); await p.waitForSelector('.chal .fbwrap[data-fb=ok]'); s = await seen(p); await p.click('.chal .fbwrap [data-a=continue]'); }
    else { s = await seen(p); await p.click('.chal [data-a=leave]'); }
    await p.waitForFunction(() => window.__done, null, { timeout: 8000 });
    const out = await p.evaluate(() => ({ res: RB.game.s.vars._res, done: !!RB.game.s.flags['chal:hall.w3.counter1'] }));
    return Object.assign(out, { s });
  };
  const a = await viaHook('odd');
  ok(a.res === 1 && a.done && a.s.ex === norm(want.odd) && a.s.exRuby > 0 && !a.s.exRaw, 'H through the Hall (Wing 3, Advanced): the odd card counts (_res 1, recorded done), its note shown with readings over the kanji ' + flat({ res: a.res, done: a.done, ex: a.s.ex, ruby: a.s.exRuby }));
  const c = await viaHook('leave');
  ok(c.res === 0 && !c.done && c.s.fb === null && c.s.ex === null, 'H "Come back later" there: nothing counted (_res 0), no note ' + flat({ res: c.res, done: c.done }));
}
// Wing 1's Grow stretch question (Advanced): outside this change, no odd-card note
{
  await open(p, 'hall.w1.counter0', 'A', true);
  await press(p, true);
  await p.waitForSelector('.chal .fbwrap[data-fb=ok]');
  const s = await seen(p);
  await cont(p);
  ok(/Yes\./.test(s.all) && s.ex === null, 'G Wing 1\'s Grow stretch question: "Yes.", no odd-card note ' + flat({ ex: s.ex }));
}
ok(errors.length === 0, 'no page errors (console errors included): ' + errors.join(' | '));
await p.close();
await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
