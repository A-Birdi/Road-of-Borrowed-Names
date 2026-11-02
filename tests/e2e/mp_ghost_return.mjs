// A Ghostwriter's Debt: Shinobu comes back, and the people panel shows her there (Agnes 6576022838, 6576640096; Local
// CL-645, CL-646; Cloud CC-482). In Chromium on the built game, on throwaway journeys (never a real save), on Playhouse
// Row, the conversation on its own screen, chosen with its own buttons (each choice's question answered right first
// time; the language is not what this is about):
//  1. repeated Wait, nothing shown (Mio): after the third exchange Shinobu is "Gone", as before; after the fourth she is
//     listening again, not marked gone, and the log has her return once; she stays there to the end, on the screen
//     that says how it ended too (unresolved, as before);
//  2. she goes, then Ren speaks of records (a companion's action that changes her stance first): she is back, the same;
//  3. she goes, then the Wait that draws Ryūsui's admission (the manuscript shown first): she is back, the same;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/mp_ghost_return.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const RETURN = 'Shinobu stops at the corner, and comes back.';

async function start(p, comp) {
  await p.evaluate((comp) => {
    const f = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mp_sobe_met: true, mp_theatre_seen: true };
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) f['enter:' + m + ':' + ev.scene] = true;
    RB.game.debugStart('mp.playhouse', 28, 16, { comp, flags: f, dir: 'up', edition: 2 });
    RB.game.settings.textSpeed = 'instant';
    RB.game.applySettings();
    RB.challenge.runStep = async () => ({ ok: true, firstTry: true, mistakes: 0, assisted: false, mode: 'choice' });
    window.__returns = 0;
    const ex = RB.encounter.exchange;
    window.__ex = 0;
    RB.encounter.exchange = function () { window.__ex++; const ev = ex.apply(this, arguments); for (const f of [].concat(ev.fx || [], ev.cfx || [], ev.gfx || [])) if (f.en === 'Shinobu stops at the corner, and comes back.') window.__returns++; return ev; };
    window.__res = null; RB.game.startEncounter('mp.ghost', {}).then((r) => { window.__res = r || 'done'; });
  }, comp);
  await p.waitForSelector('.enc-sheet .rcard[data-i]');
}
// one exchange: the card by its words; Wait's own question answered "Wait"; the companion's offer answered by name
// (or "Nothing this time"); a lasting choice's "Yes, do it"
async function exchange(p, words, comp) {
  const before = await p.evaluate(() => window.__ex);
  const okc = await p.evaluate((w) => { const c = [...document.querySelectorAll('.enc-sheet .rcard[data-i]')].find((x) => !x.disabled && x.textContent.replace(/\s+/g, ' ').includes(w)); if (c) c.click(); return !!c; }, words);
  if (!okc) throw new Error('no choice "' + words + '": ' + flat(await p.evaluate(() => [...document.querySelectorAll('.enc-sheet .rcard[data-i]')].map((x) => x.textContent.replace(/\s+/g, ' ').slice(0, 40)))));
  for (let k = 0; k < 100; k++) {
    const q = await p.evaluate(() => { const c = document.querySelector('.confirm-scrim .csheet'); return c ? { q: c.querySelector('.q').textContent, b: [...c.querySelectorAll('.foot button')].map((x) => x.textContent.trim()) } : null; });
    if (q) {
      const want = /^Wait:/.test(q.q) ? 'Wait' : /could add something/.test(q.q) ? (comp && q.b.includes(comp) ? comp : 'Nothing this time') : 'Yes, do it';
      await p.evaluate((want) => { const bt = [...document.querySelectorAll('.confirm-scrim .foot button')].find((x) => x.textContent.trim() === want); if (bt) bt.click(); }, want);
      await p.waitForTimeout(120);
      continue;
    }
    const s = await p.evaluate(() => ({ ex: window.__ex, cards: !!document.querySelector('.enc-sheet .rcard[data-i]'), end: !!document.querySelector('.enc-sheet .enc-end') }));
    if (s.ex > before && (s.end || s.cards)) break;
    await p.waitForTimeout(60);
  }
  await p.waitForTimeout(150);
}
// Shinobu as the people panel shows her, and the log's lines
const panel = (p) => p.evaluate(() => {
  const li = document.querySelector('.enc-sheet .enc-person[data-aid="n:shinobu"]');
  return { gone: !!li && li.classList.contains('left'), pill: li ? li.querySelector('.ep-st').textContent.trim() : null, log: [...document.querySelectorAll('.enc-sheet .enc-log li')].map((x) => x.textContent.replace(/\s+/g, ' ').trim()), end: !!document.querySelector('.enc-sheet .enc-end'), returns: window.__returns };
});

// 1. repeated Wait, nothing shown
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 860 } });
  await start(p, 'mio');
  const seen = [];
  for (let i = 0; i < 7; i++) { await exchange(p, 'Wait'); seen.push(await panel(p)); }
  const at3 = seen[2], at4 = seen[3];
  ok(at3.gone && at3.pill === 'Gone' && !at4.gone && at4.pill === 'Listening' && at4.log.filter((x) => x.includes(RETURN)).length === 1,
    '1 repeated Wait: "Gone" after the third exchange, as before; after the fourth, listening, not marked gone, and her return once in the log ' + flat({ at3: [at3.gone, at3.pill], at4: [at4.gone, at4.pill], logged: at4.log.filter((x) => x.includes(RETURN)).length }));
  const last = seen[6];
  ok(seen.slice(3).every((x) => !x.gone && x.pill !== 'Gone') && last.end && last.returns === 1,
    '1 and she stays there to the end, on the screen that says how it ended too; her return said once in all ' + flat({ after: seen.slice(3).map((x) => x.pill), end: last.end, returns: last.returns }));
  await p.evaluate(() => { const bt = document.querySelector('.enc-sheet [data-ok]'); if (bt) bt.click(); });
  await p.waitForFunction(() => window.__res, null, { timeout: 10000 }).catch(() => {});
  const res = await p.evaluate(() => ({ res: window.__res, outcome: RB.game.s && RB.game.s.flags && Object.keys(RB.game.s.flags).filter((k) => /mp_ghost/.test(k)) }));
  ok(!!res.res && !res.outcome.length, '1 the conversation ends unresolved, as before (no outcome flag) ' + flat(res));
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// 2. she goes, then Ren speaks of records
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 860 } });
  await start(p, 'ren');
  for (let i = 0; i < 3; i++) await exchange(p, 'Wait');
  const at3 = await panel(p);
  await exchange(p, 'Wait', 'Speak of records');
  const at4 = await panel(p);
  ok(at3.gone && !at4.gone && at4.pill === 'Listening' && at4.returns === 1 && at4.log.some((x) => x.includes(RETURN)),
    '2 she goes, then Ren speaks of records: she is back, listening, with her return once ' + flat({ at3: at3.pill, at4: at4.pill, returns: at4.returns }));
  ok(!errors.length, '2 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// 3. she goes, then the Wait that draws his admission
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 860 } });
  await start(p, 'mio');
  await exchange(p, 'Wait'); await exchange(p, 'Wait'); await exchange(p, 'Show the manuscript');
  const at3 = await panel(p);
  await exchange(p, 'Wait');
  const at4 = await panel(p);
  ok(at3.gone && !at4.gone && at4.pill === 'Listening' && at4.returns === 1 && at4.log.some((x) => /ten years/.test(x)),
    '3 she goes, then the Wait that draws Ryūsui\'s admission: she is back, listening, with her return once ' + flat({ at3: at3.pill, at4: at4.pill, returns: at4.returns }));
  ok(!errors.length, '3 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

console.log(`\nmp_ghost_return: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
