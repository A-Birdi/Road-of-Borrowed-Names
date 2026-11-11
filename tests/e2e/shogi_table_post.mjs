// Snowbell's abandoned game after the story (Agnes 6780860683 and 6781264736; Local CL-767, CL-768; Cloud CC-544;
// Agnes 6803414018): once the inn's puzzle was solved, a visit after the story still opened with the board "just as it
// was" and Yae's story of the unfinished game before its end. In Chromium on the built game, the inn's table scene run
// as its prop runs it (pt.sb_inn_table), with the real dialogue, on a synthetic journey after the story:
//  1. solved: exactly the two lines of its end; no choice, no board; the same on a second visit;
//  2. the same journey saved, the page reloaded and the journey Loaded: still exactly those two lines;
//  3. unsolved: the table's own line, the opening, then the choice (finish the game, or leave it be); "Leave it be": the board goes on
//     waiting, no board opened; "Finish the game": the puzzle's board opens;
//  no page errors.
// Usage: node tools/build.mjs && node tests/e2e/shogi_table_post.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const DONE_EN = ['The gold you dropped stands in front of the king. The game is over.', 'So it really was mate in one. That guest wasn\'t lying. …I think I\'ll leave clearing it away a little longer.'];
const BASE = 'Someone seems to have left in the middle of a game of shogi. One piece has rolled off the board.';
const OPENING = 'The board is just as it was when you saw it before. The piece that rolled off is a gold.';
// a finished story offers New Game+ once in a while (a confirmation over the screen): "Not now", as a player would
const notNow = (p) => p.evaluate(() => { const bt = [...document.querySelectorAll('.confirm-scrim button')].find((x) => /Not now/.test(x.textContent)); if (bt) bt.click(); return !!bt; });

async function begin(p, solved) {
  await p.evaluate((solved) => {
    const s = RB.game.debugStart('sb.inn', 8, 9, { edition: RB.edition.forNew(), comp: 'mio' });
    s.player.name = 'Haru';
    const DONE = ['departed', 'ch1_done', 'ch2_done', 'mb1_done', 'mb2_done', 'ch3_done', 'ch4_done', 'kr_done', 'ch5_done', 'ko_done', 'cr_done', 'yn_done', 'ch6_done', 'postgame'];
    for (const f of DONE) s.flags[f] = true;
    if (solved) s.flags.pt_tsume_sb_inn = true;
    RB.game.settings.reducedMotion = true; RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
  }, solved);
  await settle(p);
}
// let anything the map starts finish (its lines advanced) before the table is visited
async function settle(p) {
  for (let i = 0; i < 100; i++) {
    await notNow(p);
    const st = await p.evaluate(() => ({ run: RB.script.isRunning(), dlg: RB.ui.dialogue.isOpen(), conf: !!document.querySelector('.confirm-scrim') }));
    if (!st.run && !st.dlg && !st.conf) break;
    if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(60);
  }
  await p.waitForTimeout(150);
}
// the table's scene, as its prop runs it: every line advanced, the choice (if any) answered with its button
async function visit(p, pick) {
  await p.evaluate(() => {
    window.__lines = []; window.__asks = []; window.__done = false;
    if (!RB.ui.dialogue.__qa) {
      const say = RB.ui.dialogue.say, choose = RB.ui.dialogue.choose;
      RB.ui.dialogue.say = function (l) { window.__lines.push(l && l.en || ''); return say.apply(this, arguments); };
      RB.ui.dialogue.choose = function (ops) { window.__asks.push((ops || []).map((o) => o.en)); return choose.apply(this, arguments); };
      RB.ui.dialogue.__qa = true;
    }
    RB.script.run('pt.sb_inn_table').then(() => { window.__done = true; });
  });
  for (let i = 0; i < 300; i++) {
    if (await notNow(p)) { await p.waitForTimeout(80); continue; }
    const st = await p.evaluate(() => ({ done: window.__done, dlg: RB.ui.dialogue.isOpen(), ch: !!document.querySelector('.choices:not(.hidden) button.choice') }));
    if (st.done) break;
    if (st.ch) { await p.click('.choices:not(.hidden) button.choice >> nth=' + (pick || 0)); await p.waitForTimeout(80); continue; }
    if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(50);
  }
  await p.waitForTimeout(900); // a board would open once the scene has let go of the screen (RB.hooks.pt_tsume)
  return p.evaluate(() => ({ done: window.__done, lines: window.__lines.slice(), asks: window.__asks.slice(), board: !!document.querySelector('.sg-play'), mode: RB.game.mode() }));
}

// ---- 1 and 2. solved: its end, again, and after a save, a reload and a Load ---------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, true);
  const a = await visit(p);
  ok(a.done && flat(a.lines) === flat(DONE_EN) && !a.asks.length && !a.board, '1 solved: exactly the two lines of its end; no opening, no choice, no board ' + flat({ lines: a.lines, asks: a.asks.length, board: a.board }));
  const a2 = await visit(p);
  ok(a2.done && flat(a2.lines) === flat(DONE_EN) && !a2.asks.length && !a2.board, '1 and the same on a second visit ' + flat({ n: a2.lines.length }));
  await p.evaluate(async () => { await RB.save.writeSlot(2, RB.game.s, { force: true }); await RB.game.toTitle(); });
  await p.reload();
  await p.waitForSelector('.title [data-a=load]');
  await p.waitForTimeout(300);
  await p.evaluate(async () => { await RB.game.loadCampaign(2, 'manual'); });
  await p.waitForTimeout(400);
  await settle(p);
  const st = await p.evaluate(() => ({ map: RB.game.s.map, solved: !!RB.game.s.flags.pt_tsume_sb_inn, post: !!RB.game.s.flags.postgame }));
  const c = await visit(p);
  ok(st.map === 'sb.inn' && st.solved && st.post && c.done && flat(c.lines) === flat(DONE_EN) && !c.asks.length && !c.board, '2 saved, the page reloaded, Loaded: still exactly the two lines ' + flat({ st, lines: c.lines.length, asks: c.asks.length }));
  ok(!errors.length, '1-2 no page errors ' + errors.join('; '));
  await p.context().close();
}

// ---- 3. unsolved: the opening, the choice; Leave it be; Finish the game ---------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, false);
  const l = await visit(p, 1);
  ok(l.done && l.lines[0] === BASE && l.lines[1] === OPENING && l.lines.length === 5 && l.asks.length === 1 && flat(l.asks[0]) === flat(['Finish the game', 'Leave it be']) && l.lines.slice(-1)[0] === 'The board goes on waiting for someone.' && !l.board,
    '3 unsolved: the table as before, then the opening, Yae\'s story, the choice; "Leave it be": the board goes on waiting, no board ' + flat({ first: l.lines.slice(0, 2), n: l.lines.length, asks: l.asks, last: l.lines.slice(-1)[0] }));
  await settle(p);
  const f = await visit(p, 0);
  ok(f.done && f.lines[0] === BASE && f.lines[1] === OPENING && f.asks.length === 1 && f.board, '3 "Finish the game": the puzzle\'s board opens ' + flat({ n: f.lines.length, board: f.board, mode: f.mode }));
  ok(!errors.length, '3 no page errors ' + errors.join('; '));
  await p.context().close();
}

await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
