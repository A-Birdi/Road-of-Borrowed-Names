// Rest stops in the twelve-chapter regions (Agnes 6442276500, 6442579050, 6442960189; Local CL-489; CC-349), in Chromium
// on the built game, a synthetic twelve-chapter journey with Nao (never a real save):
//  1. Kawaya by day: the Company page offers "Rest together", and Nao's rest topic ("The right-hand pier") has its
//     Talk button; a real click plays it; talking to Nao in the world opens the rest menu;
//  2. with a creature close by: Talk is refused with the usual notice and nothing plays, and talking to Nao opens no
//     rest menu (the same safety as every rest stop);
//  3. Kawaya on the night Ichi is lost (mb_night): no rest offers; after the rescue, they are back;
//  4. the Upper House: no rest offers before your room there is yours; after yn_rooms_done, "Rest together" and Talk;
//  5. the Gull, as before (the control).
// Usage: node tools/build.mjs && node tests/e2e/rest_stops.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

// a twelve-chapter journey with Nao on `map`, Chapter 3 (Nao's early rest topics are open: ch>=2), before ch2_done's
// journey reflection (so talking to Nao is not taken by a pending topic), the notices recorded
async function at(p, map, x, y, flags) {
  await p.evaluate(([map, x, y, flags]) => {
    RB.game.inBattle = () => false;
    const def = RB.content.maps[map] || {}, seen = {};
    for (const ev of def.onEnter || []) seen['enter:' + map + ':' + ev.scene] = true;
    const s = RB.game.debugStart(map, x, y, { edition: 2, comp: 'nao', flags: Object.assign({ departed: true, ch1_done: true }, seen, flags || {}) });
    s.chapter = 3;
    RB.company.sync(s, 'live'); RB.company.refresh(s); RB.bus.emit('company:changed', {});
    window.__notes = window.__notes || [];
    if (!RB.ui.notice.__rec) { const n = RB.ui.notice; RB.ui.notice = (t, k) => { window.__notes.push(String(t)); return n(t, k); }; RB.ui.notice.__rec = true; }
    // the scenes the game runs (the rest menu is co.rest)
    window.__runs = window.__runs || [];
    if (!RB.script.run.__rec) { const r = RB.script.run; RB.script.run = function (id, ...a) { window.__runs.push(String(id)); return r.call(this, id, ...a); }; RB.script.run.__rec = true; }
  }, [map, x, y, flags || {}]);
  await p.waitForTimeout(150);
}
// the Company page, once the folio has finished opening (its finite animations)
async function company(p) {
  await p.evaluate(() => RB.ui.menu.open('company'));
  await p.waitForSelector('.co-page');
  await p.waitForFunction(() => !document.getAnimations().some((a) => { const el = a.effect && a.effect.target; return (a.playState === 'running' || a.pending) && el && el.closest && el.closest('.folio') && a.effect.getComputedTiming().endTime !== Infinity; }), null, { timeout: 5000 });
  return p.evaluate(() => {
    const row = Array.from(document.querySelectorAll('.co-topics .entry')).find((e) => /right-hand pier/.test(e.textContent));
    return { rest: !!document.querySelector('[data-co-act=rest]'), talk: !!document.querySelector('[data-co-topic="t.nao.pier"]'), row: row ? row.querySelector('.kind').textContent : null };
  });
}
const close = (p) => p.evaluate(() => RB.ui.menu.close());
// the scene over; a Company page reopened after it (as a talk from the page does) closed again; back in the world
const quiet = async (p) => {
  await p.waitForFunction(() => !RB.script.isRunning(), null, { timeout: 15000 });
  await p.waitForTimeout(150);
  await p.evaluate(() => { if (RB.ui.menu.isOpen && RB.ui.menu.isOpen()) RB.ui.menu.close(); });
  await p.waitForFunction(() => RB.game.mode() === 'world', null, { timeout: 15000 });
};
// play a dialogue through with real clicks on Next (the first reply on any choice)
async function playThrough(p) {
  const lines = [];
  for (let i = 0; i < 80; i++) {
    const st = await p.evaluate(() => ({ ch: document.querySelectorAll('.choices:not(.hidden) .choice').length, dlg: !!document.querySelector('.dlg:not(.hidden)'), run: RB.script.isRunning(), line: (document.querySelector('.dlg:not(.hidden) .main') || {}).textContent || '' }));
    if (st.ch) { await p.waitForTimeout(150); await p.locator('.choices .choice').first().click(); await p.waitForTimeout(100); continue; }
    if (st.dlg) { lines.push(st.line); await p.locator('.dlg .b-next').click(); await p.waitForTimeout(90); continue; }
    if (!st.run) break;
    await p.waitForTimeout(80);
  }
  return lines;
}
// talking to Nao in the world: whether the rest menu (co.rest) ran, and its choices; then Not now (or the line played
// through)
async function talkToNao(p) {
  await p.evaluate(() => { window.__runs.length = 0; RB.game.companionTalk(); });
  await p.waitForTimeout(200);
  const r = await p.evaluate(() => ({ rest: window.__runs.includes('co.rest'), runs: window.__runs.slice(), choices: Array.from(document.querySelectorAll('.choices:not(.hidden) .choice')).map((c) => c.textContent.replace(/\s+/g, ' ').trim()) }));
  const i = r.choices.findIndex((c) => /Not now/.test(c));
  if (i >= 0) { await p.waitForTimeout(150); await p.locator('.choices .choice').nth(i).click(); }
  await playThrough(p);
  await quiet(p);
  return r;
}

// 1 and 2: Kawaya by day
{
  const { p, errors, requests, ctx } = await page(b, url, {});
  await at(p, 'mb.inn', 6, 7);
  ok(await p.evaluate(() => { const r = RB.company.restHere(RB.game.s); return !!r && r.kind === 'inn' && !RB.company.pending(RB.game.s); }), '1 Kawaya is a rest stop (and no topic is pending to take the talk)');
  let c = await company(p);
  ok(c.rest && c.talk && /talk about this now/.test(c.row || ''), '1 the Company page: "Rest together", and the pier topic with its Talk button (' + c.row + ')');
  // (where there is no Talk button, nothing to click: recorded as a failure, and the test goes on)
  let heard = [];
  if (c.talk) {
    await p.click('[data-co-topic="t.nao.pier"]');
    await p.waitForFunction(() => RB.script.isRunning() || !!document.querySelector('.dlg:not(.hidden)'), null, { timeout: 5000 });
    heard = await playThrough(p);
  }
  await quiet(p);
  ok(heard.length >= 3, '1 a real click on Talk plays the topic (' + heard.length + ' lines)');
  const menu = await talkToNao(p);
  ok(menu.rest && menu.choices.some((m) => /Not now/.test(m)), '1 talking to Nao in the world opens the rest menu (co.rest): ' + menu.choices.join(' | '));
  // 2: a creature close by (a probe, added and removed around each attempt: the world is not left with it)
  c = await company(p);
  const refused = await p.evaluate(() => {
    const W = RB.world.W, foe = { id: 'probe', x: W.player.x + 1, y: W.player.y, fx: W.player.x + 1, fy: W.player.y };
    window.__notes.length = 0;
    W.foes.push(foe);
    try { const b = document.querySelector('[data-co-topic="t.nao.pier"]'); if (!b) return { notes: ['(no Talk button)'], running: false, safe: RB.company.safeHere() }; b.click(); return { notes: window.__notes.slice(), running: RB.script.isRunning(), safe: RB.company.safeHere() }; }
    finally { W.foes.splice(W.foes.indexOf(foe), 1); }
  });
  ok(refused.notes.some((n) => /creature this close/.test(n)) && !refused.running && refused.safe.why === 'danger', '2 with a creature close by, Talk is refused with the usual notice and nothing plays (' + refused.notes.join(' | ') + ')');
  await close(p);
  const danger = await p.evaluate(() => {
    const W = RB.world.W, foe = { id: 'probe', x: W.player.x + 1, y: W.player.y, fx: W.player.x + 1, fy: W.player.y };
    W.foes.push(foe);
    try { const ev = { handled: false }; RB.bus.emit('companion:chat', ev); return { handled: ev.handled, choices: document.querySelectorAll('.choices:not(.hidden) .choice').length }; }
    finally { W.foes.splice(W.foes.indexOf(foe), 1); }
  });
  ok(!danger.handled && danger.choices === 0, '2 with a creature close by, talking to Nao opens no rest menu');
  ok(!errors.length && !requests.length, '1, 2: no page errors, no network' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await ctx.close();
}

// 3: the night Ichi is lost, then the morning after
{
  const { p, errors, requests, ctx } = await page(b, url, {});
  await at(p, 'mb.inn', 6, 7, { mb_night: true, mb_ichi_lost: true });
  let c = await company(p);
  ok(!c.rest && !c.talk && /for a rest stop/.test(c.row || ''), '3 on the night Ichi is lost: no "Rest together", no Talk (' + c.row + ')');
  await close(p);
  const night = await talkToNao(p);
  ok(!night.rest, '3 talking to Nao opens no rest menu that night (ran: ' + night.runs.join(' ') + ')');
  await p.evaluate(() => { RB.game.s.flags.mb_night = false; });
  c = await company(p);
  ok(c.rest && c.talk, '3 after the rescue (mb_night cleared): "Rest together" and Talk again');
  await close(p);
  ok(!errors.length && !requests.length, '3: no page errors, no network' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await ctx.close();
}

// 4: the Upper House, before and after your room
{
  const { p, errors, requests, ctx } = await page(b, url, {});
  await at(p, 'yn.kami', 7, 7);
  let c = await company(p);
  ok(!c.rest && !c.talk, '4 the Upper House before your room there: no "Rest together", no Talk');
  await close(p);
  await p.evaluate(() => { RB.game.s.flags.yn_rooms_done = true; });
  c = await company(p);
  ok(c.rest && c.talk, '4 once your room is yours (yn_rooms_done): "Rest together" and Talk');
  await close(p);
  ok(!errors.length && !requests.length, '4: no page errors, no network' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await ctx.close();
}

// 5: the Gull, as before
{
  const { p, errors, requests, ctx } = await page(b, url, {});
  await at(p, 'sg.inn', 6, 7);
  const c = await company(p);
  ok(c.rest && c.talk, '5 the Gull: "Rest together" and Talk, as before');
  await close(p);
  const menu = await talkToNao(p);
  ok(menu.rest && menu.choices.some((m) => /Not now/.test(m)), '5 the Gull: talking to Nao opens the rest menu (co.rest), as before: ' + menu.choices.join(' | '));
  ok(!errors.length && !requests.length, '5: no page errors, no network' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await ctx.close();
}

console.log(`\nrest_stops: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
