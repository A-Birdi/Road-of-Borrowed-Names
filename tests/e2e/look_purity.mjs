// RBN-QA-058 and RBN-QA-059 (Cloud CC-050; proposal agreed by Agnes 6312193634 and Local CL-090): what the battle
// screen evaluates without acting leaves the battle as it was. In Chromium on the built game, with the real buttons:
//  1. the 全体 chip (fx.mods, Ren): after すべて is used once for real, pressing the 全体 chip deals its cards with
//     their "Here:" lines, and pressing it again puts them back: no ward is up; chosen and written, 全体 raises it;
//  2. kr.moss_steps with each plan (Protect, Reveal, Press) and Ask: "Call it by its name" is chosen and answered,
//     and is applied once, at its own step (the procedure's one step: it completes), with no page error;
//  3. the Cloud Ox Elder with Protect set: the rope chosen turns back what was coming up the path, each once, and the
//     screen says so;
//  4. the Sister Star with Protect set (her knots set low enough for the little lights to be coming, as the test's
//     state): the bell chosen calls them back, each once, and the screen says so.
// Usage: node tools/build.mjs && node tests/e2e/look_purity.mjs
import { serve, launch, page, companionTurn } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const WORDS = ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'ishi', 'iyasu', 'suzu'];

async function begin(o) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 860 } });
  await p.evaluate(([o, WORDS]) => {
    const s = RB.game.debugStart('rw.millroad', 10, 22, { edition: RB.edition.forNew(), comp: o.comp || 'ren' });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.words = WORDS.slice();
    RB.game.settings.input = 'choice'; RB.game.settings.battleAnim = 'instant'; RB.game.settings.compPlan = o.plan || 'ask'; RB.game.applySettings();
    // what your response did in the battle itself, as the screen then shows it (read only; a look ahead's own
    // copies are not the battle)
    window.__said = []; window.__proc = [];
    const P = RB.encounter.player;
    RB.encounter.player = function (st) {
      const was = st.enc && st.enc.proc ? st.enc.proc.step : null;
      const r = P.apply(this, arguments);
      if (st === RB.combat.state()) {
        window.__said.push(...(r.fx || []).map((f) => ({ t: f.t, en: f.en || '', step: f.step, ok: f.ok, done: f.done })));
        if (was != null) window.__proc.push([was, st.enc.proc.step]);
      }
      return r;
    };
    RB.game.startEncounter(o.enc, {});
  }, [o, WORDS]);
  return { p, errors };
}
// to the next choice: the opening lines read, the first-time notes closed
async function ready(p) {
  for (let i = 0; i < 200; i++) {
    const s = await p.evaluate(() => { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); return { ph: RB.combat.state() ? RB.combat.phase() : 'none', n: document.querySelectorAll('.rcard[data-i]:not([disabled])').length }; });
    if (s.ph === 'choose' && s.n) break;
    if (await p.evaluate(() => !!document.querySelector('[data-coach-ok]'))) { await p.mouse.move(2, 2); await p.waitForTimeout(300); await p.click('[data-coach-ok]').catch(() => {}); }
    if (await p.evaluate(() => !!document.querySelector('.ccard'))) { await p.mouse.move(2, 2); await p.waitForTimeout(320); await companionTurn(p).catch(() => {}); }
    await p.waitForTimeout(100);
  }
  await p.waitForTimeout(700);
  if (await p.evaluate(() => !!document.querySelector('[data-coach-ok]'))) { await p.mouse.move(2, 2); await p.waitForTimeout(300); await p.click('[data-coach-ok]').catch(() => {}); }
}
// choose the card whose text matches (pressed on its English label), confirm what it means, answer its step right
async function choose(p, re) {
  const i = await p.evaluate((re) => { const c = [...document.querySelectorAll('.rcard[data-i]:not([disabled])')].find((x) => new RegExp(re, 'i').test(x.textContent.replace(/\s+/g, ' '))); return c ? c.getAttribute('data-i') : null; }, re);
  if (i == null) return false;
  await p.click('.rcard[data-i="' + i + '"] .rc-en');
  await p.waitForTimeout(600);
  // a word taught another way asks how to say it first (its own word); a procedure's action, what it means
  for (let k = 0; k < 2; k++) if (await p.evaluate(() => !!document.querySelector('.csheet .pbtn'))) { await p.evaluate(() => { const bs = [...document.querySelectorAll('.csheet .pbtn')]; (bs.find((x) => /^Do it$/.test(x.textContent.trim())) || bs[0]).click(); }); await p.waitForTimeout(500); }
  await p.evaluate(() => { const tab = document.querySelector('.chal-tabs .ptab[data-mode="choice"]'); if (tab) tab.click(); });
  await p.waitForSelector('.chal .mc .btn', { timeout: 8000 });
  const n = await p.evaluate(() => document.querySelectorAll('.chal .mc .btn').length);
  for (let k = 0; k < n; k++) {
    await p.evaluate((k) => { const x = [...document.querySelectorAll('.chal .mc .btn')][k]; if (x && !x.disabled) x.click(); }, k);
    await p.waitForTimeout(120);
    if (await p.evaluate(() => !!document.querySelector('.fbwrap[data-fb=ok] .fb-go'))) break;
    await p.evaluate(() => { const g = document.querySelector('.fbwrap:not([data-fb=ok]) .fb-go, .fbwrap:not([data-fb=ok]) [data-a=retry]'); if (g) g.click(); });
    await p.waitForTimeout(150);
  }
  await p.click('.fbwrap[data-fb=ok] .fb-go');
  await p.mouse.move(2, 2); await p.waitForTimeout(500);
  // a procedure's action: what it means, before it is done
  if (await p.evaluate(() => !!document.querySelector('.csheet .pbtn'))) { await p.evaluate(() => { const bs = [...document.querySelectorAll('.csheet .pbtn')]; (bs.find((x) => /^Do it$/.test(x.textContent.trim())) || bs[0]).click(); }); await p.waitForTimeout(400); }
  // (with Ask, the companion's menu: its first action); then the exchange plays out to the next choice
  await companionTurn(p, { timeout: 2500 }).catch(() => {});
  await ready(p);
  return true;
}
const mods = (p) => p.evaluate(() => { const st = RB.combat.state(); return st && st.mods !== undefined ? JSON.stringify(st.mods) : 'none'; });
const chip = async (p, id) => { await p.click('.cb-mods .mod-chip[data-mod="' + id + '"]'); await p.mouse.move(2, 2); await p.waitForTimeout(400); };

// 1. the 全体 chip
{
  const { p, errors } = await begin({ enc: 'fx.mods' });
  await ready(p);
  await chip(p, 'subete'); const used = await choose(p, 'すべて を 守');
  const m1 = await mods(p);
  await choose(p, '^守まもるprotect');
  const m2 = await mods(p);
  await chip(p, 'zentai');
  const here = await p.evaluate(() => [...document.querySelectorAll('.rcard .rc-here')].map((x) => x.textContent.trim()).find((t) => /One ward closes around you both/.test(t)) || null);
  const on = await mods(p);
  await chip(p, 'zentai');
  const off = await mods(p), pressed = await p.evaluate(() => document.querySelector('.mod-chip[data-mod="zentai"]').getAttribute('aria-pressed'));
  ok(used && m1 === '{}' && here && on === '{}' && off === '{}' && pressed === 'false', 'the 全体 chip after すべて was used: its cards say what it would do, and pressing it on and off raises no ward (' + JSON.stringify({ m1, m2, here, on, off, pressed }) + ')');
  await chip(p, 'zentai'); const chose = await choose(p, '全体ぜんたい を 守');
  const after = await p.evaluate(() => ({ closes: window.__said.filter((f) => f.t === 'ward' && /One ward closes/.test(f.en)).length }));
  ok(chose && after.closes === 1, '全体 chosen and answered: the ward closes around you both, once (' + JSON.stringify(after) + ')');
  ok(!errors.length, 'the 全体 chip: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 2. kr.moss_steps with each plan, and Ask
for (const [plan, comp] of [['protect', 'nao'], ['reveal', 'ren'], ['press', 'mio'], ['ask', 'suzu']]) {
  const { p, errors } = await begin({ enc: 'kr.moss_steps', plan, comp });
  await ready(p);
  const before = await p.evaluate(() => { const E = RB.combat.state().enc; return { step: E.proc.step, id: E.proc.steps[E.proc.step].id }; });
  const chose = await choose(p, 'Call it by its name');
  // (the moss steps have one step: the right action completes them, and the encounter ends as authored)
  const after = await p.evaluate(() => ({ proc: window.__proc, applied: window.__said.filter((f) => f.t === 'proc' && f.ok).map((f) => f.step), done: window.__said.some((f) => f.t === 'proc' && f.done) }));
  ok(chose && JSON.stringify(after.proc) === JSON.stringify([[before.step, before.step + 1]]) && JSON.stringify(after.applied) === JSON.stringify([before.id]) && !errors.length, 'kr.moss_steps with ' + plan + ' (' + comp + '): "Call it by its name" chosen is applied once, at its own step, with no page error (' + JSON.stringify({ before, after, errors: errors.slice(0, 1) }) + ')');
  await p.close();
}
// 3. the Cloud Ox Elder, 4. the Sister Star
for (const [enc, word, setup] of [['gd.cr', '^縄なわrope', null], ['gd.sb', '^鈴すずbell', 4]]) {
  const { p, errors } = await begin({ enc, plan: 'protect' });
  await ready(p);
  if (setup) await p.evaluate((k) => { RB.combat.state().foes[0].knots = k; }, setup);
  const near = await p.evaluate(() => RB.encounter.coming(RB.combat.state()).length);
  const chose = await choose(p, word);
  const after = await p.evaluate(() => { const E = RB.combat.state().enc; return { turned: E.arrivals.filter((a) => a.state === 'prevented').length, prevented: E.prevented, said: window.__said.filter((f) => f.t === 'prevent').length }; });
  ok(chose && near && after.turned >= 1 && after.prevented === after.turned && after.said === after.turned && !errors.length, enc + ' with Protect set: the ' + (setup ? 'bell' : 'rope') + ' chosen turns back what was coming, each once, and says so for each (' + JSON.stringify({ near, after, errors: errors.slice(0, 1) }) + ')');
  await p.close();
}
console.log(`\nlook_purity: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
