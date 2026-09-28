// Encounters fit their place, and the dialogue around a battle takes the
// mouse (player report of 2026-09-28, second round), in the real game:
// - the Flour Moth out on the mill road fights in the open by the mill and
//   leaves over the roof; the one inside the mill keeps its window line; the
//   Reedling in the wheel pit and the Frost Wisp on the observatory path have
//   lines and backdrops for where they are; the approach, the battle, the
//   lines and the return all agree, and the win is recorded once;
// - a battle's lines (its intro, and the last line that returns you to the
//   map) are advanced by clicking Next with the real mouse — with the
//   dialogue sheet already created before the battle, as in real play — and
//   separately by Z; one press advances one line; the click that finishes
//   an exchange does not also dismiss the line that follows it.
// Usage: node tests/e2e/encounters.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const { p, errors } = await page(b, url, { viewport: { width: 1600, height: 816 } });

// a fresh campaign placed on a map; the dialogue sheet exists before any
// battle (the opening scenes create it in real play)
async function start(map, x, y, flags) {
  await p.evaluate(async ([map, x, y, flags]) => {
    const s = RB.game.debugStart(map, x, y, { dir: 'up', flags });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.words = ['mamoru', 'iyasu', 'hikari'];
    RB.game.settings.input = 'choice';
    const pr = RB.ui.dialogue.say({ who: 'narr', en: 'An earlier line.', jp: '' });
    RB.ui.dialogue.advance(true); RB.ui.dialogue.advance(true); await pr; RB.ui.dialogue.hide();
    if (!window.__wrapped) { window.__wrapped = true; const run = RB.challenge.runStep; RB.challenge.runStep = (step, o) => { window.__step = step; return run(step, o); }; }
    window.__lines = 0;
  }, [map, x, y, flags || {}]);
  await p.waitForTimeout(300);
}
// walk up to a placed foe with the arrow keys and press Z at it
async function meet(foeId) {
  for (let k = 0; k < 60 && (await p.evaluate(() => RB.game.mode())) !== 'combat'; k++) {
    const st = await p.evaluate((id) => { const W = RB.world.W, f = W.foes.find((q) => q.id === id); return f ? { px: W.player.x, py: W.player.y, fx: f.x, fy: f.y, mv: !!W.player.mv } : null; }, foeId);
    if (!st) return false;
    if (st.mv) { await p.waitForTimeout(80); continue; }
    const dx = st.fx - st.px, dy = st.fy - st.py;
    if (Math.abs(dx) + Math.abs(dy) === 1) {
      await p.keyboard.press(dy < 0 ? 'ArrowUp' : dy > 0 ? 'ArrowDown' : dx < 0 ? 'ArrowLeft' : 'ArrowRight'); await p.waitForTimeout(60);
      await p.keyboard.press('z'); await p.waitForTimeout(350); continue;
    }
    const key = Math.abs(dy) >= Math.abs(dx) && dy !== 0 ? (dy < 0 ? 'ArrowUp' : 'ArrowDown') : (dx < 0 ? 'ArrowLeft' : 'ArrowRight');
    await p.keyboard.down(key); await p.waitForTimeout(150); await p.keyboard.up(key); await p.waitForTimeout(150);
  }
  return (await p.evaluate(() => RB.game.mode())) === 'combat';
}
const lineText = () => p.evaluate(() => { const d = document.querySelector('.dlg:not(.hidden)'); return d ? d.querySelector('.main').textContent : null; });
const backlog = () => p.evaluate(() => RB.game.s.backlog.length);
async function waitLine(ms) { await p.waitForFunction(() => RB.ui.dialogue.isOpen(), null, { timeout: ms || 15000 }); await p.waitForTimeout(150); }
// Next with the real mouse: what is on top of it, and whether one click moves on one line
async function mouseNext() {
  const r = await p.evaluate(() => { const b = document.querySelector('.dlg:not(.hidden) .b-next'); const q = b.getBoundingClientRect(); const x = q.left + q.width / 2, y = q.top + q.height / 2; const top = document.elementFromPoint(x, y); return { x, y, onTop: !!(top && top.closest('.b-next')), cover: top ? top.className : '' }; });
  await p.mouse.click(r.x, r.y);
  await p.waitForTimeout(250);
  return r;
}
// win the exchange: Unravel, the right choice, Continue (real mouse) until the battle ends or a line opens
async function answerRound() {
  const c = await p.evaluate(() => { const x = [...document.querySelectorAll('.rcard')].find((e) => /unravel/i.test(e.textContent) && !e.disabled); if (!x) return null; const q = x.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; });
  if (!c) return false;
  await p.mouse.click(c.x, c.y);
  await p.waitForSelector('.chal .mc .btn');
  const o = await p.evaluate(() => {
    const st = window.__step, bs = [...document.querySelectorAll('.chal .mc .btn')];
    const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
    const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.util.esc(o.en) + '</span>' : '');
    const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => txt(html(o)));
    const q = bs.find((x) => right.includes(x.textContent.replace(/\s+/g, ' ').trim())).getBoundingClientRect();
    return { x: q.left + q.width / 2, y: q.top + q.height / 2 };
  });
  await p.mouse.click(o.x, o.y);
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go');
  const g = await p.evaluate(() => { const q = document.querySelector('.fbwrap[data-fb=ok] .fb-go').getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; });
  await p.mouse.click(g.x, g.y);
  return true;
}
async function untilLineOrCards() {
  for (let i = 0; i < 200; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.rcard[data-i]:not([disabled])') && !document.querySelector('.chal'), mode: RB.game.mode() }));
    if (st.dlg || st.cards || st.mode !== 'combat') return st;
    await p.waitForTimeout(60);
  }
  return {};
}

// ---- 1. the Flour Moth out on the mill road --------------------------------
await start('rw.millroad', 11, 9, { rw_mill_open: true });
assert(await meet('f3'), 'walked up to the Flour Moth on the mill road and faced it');
await waitLine();
const ctx1 = await p.evaluate(() => RB.combat.context());
assert(ctx1 && ctx1.setting === 'outdoor' && ctx1.bg === 'reedwake' && ctx1.where && ctx1.where.map === 'rw.millroad', 'the battle is out of doors by the mill (backdrop ' + (ctx1 && ctx1.bg) + ', ' + (ctx1 && ctx1.setting) + ')');
const intro1 = await lineText();
assert(/drifts out of the mill/.test(intro1 || ''), 'its intro fits the place: "' + (intro1 || '').slice(0, 60) + '"');
// intro: an intermediate page, advanced by the real mouse (a first click may only finish the typing)
let r = await mouseNext();
assert(r.onTop, 'the battle overlay does not cover Next (top element: ' + (r.onTop ? 'the button' : r.cover) + ')');
if (await p.evaluate(() => RB.ui.dialogue.isOpen())) r = await mouseNext();
assert(!(await p.evaluate(() => RB.ui.dialogue.isOpen())), 'the intro line is advanced by clicking Next');
await p.evaluate(() => { RB.combat.state().knots = 1; RB.combat.state().shroud = false; RB.combat.refresh(); });
await untilLineOrCards();
assert(await answerRound(), 'answered with the mouse');
const s1 = await untilLineOrCards();
assert(s1.dlg, 'the win opens the last line');
const settle1 = await lineText();
assert(/over the mill roof/.test(settle1 || '') && !/window/.test(settle1 || ''), 'it leaves over the roof, not through a window: "' + (settle1 || '').slice(0, 70) + '"');
// the click on Continue that finished the exchange did not also dismiss it
await p.waitForTimeout(400);
assert(await p.evaluate(() => RB.ui.dialogue.isOpen()), 'the click that finished the exchange did not pass through to the new line');
// complete the typing, then one click = one advance, back to the map
const b0 = await backlog();
await p.evaluate(() => RB.ui.dialogue.onAction && 0);
r = await mouseNext();
if (await p.evaluate(() => RB.ui.dialogue.isOpen())) r = await mouseNext();
await p.waitForFunction(() => RB.game.mode() === 'world' && RB.game.s.flags['foe:rw.millroad:f3'], null, { timeout: 15000 }).catch(() => {});
await p.waitForTimeout(400); // the battle's closing fade has finished
const back = await p.evaluate(() => ({ map: RB.world.W.map.id, x: RB.world.W.player.x, y: RB.world.W.player.y, flag: !!RB.game.s.flags['foe:rw.millroad:f3'], foe: RB.world.W.foes.some((f) => f.id === 'f3'), dlg: RB.ui.dialogue.isOpen() }));
assert(r.onTop && back.map === 'rw.millroad' && back.flag && !back.foe && !back.dlg, 'the last line is clicked away with the mouse; back on the mill road where it happened, the moth gone and recorded (' + JSON.stringify(back) + ')');
assert((await backlog()) === b0, 'no extra line was skipped or added on the way out');

// ---- 2. keyboard, separately: Z advances the intro and the last line -------------
await start('rw.millroad', 11, 9, { rw_mill_open: true });
assert(await meet('f3'), 'met the moth again');
await waitLine();
await p.keyboard.press('z'); await p.waitForTimeout(200);
if (await p.evaluate(() => RB.ui.dialogue.isOpen())) { await p.keyboard.press('z'); await p.waitForTimeout(200); }
assert(!(await p.evaluate(() => RB.ui.dialogue.isOpen())), 'Z advances the intro');
await p.evaluate(() => { RB.combat.state().knots = 1; RB.combat.state().shroud = false; RB.combat.refresh(); });
await untilLineOrCards();
await answerRound();
await untilLineOrCards();
const lz = await backlog();
await p.keyboard.press('z'); await p.waitForTimeout(250);
if (await p.evaluate(() => RB.ui.dialogue.isOpen())) { await p.keyboard.press('z'); await p.waitForTimeout(250); }
await p.waitForFunction(() => RB.game.mode() === 'world' && RB.game.s.flags['foe:rw.millroad:f3'], null, { timeout: 15000 }).catch(() => {});
await p.waitForTimeout(400);
assert((await backlog()) === lz && (await p.evaluate(() => !RB.ui.dialogue.isOpen())), 'Z advances the last line once and returns to the map');

// ---- 3. the same moth inside the mill keeps the window line ------------------------
await start('rw.mill1', 3, 6, { rw_mill_open: true, rw_gears: true });
assert(await meet('m1a'), 'met the Flour Moth inside the mill');
await waitLine();
const ctx3 = await p.evaluate(() => RB.combat.context());
assert(ctx3.setting === 'indoor' && ctx3.bg === 'mill' && /hiding the letters/.test(ctx3.intro.en) && /window/.test(ctx3.settle.en), 'inside the mill: the mill interior, the window line (' + ctx3.bg + ')');
await p.keyboard.press('z'); await p.waitForTimeout(150); await p.keyboard.press('z');

// ---- 4. the wheel pit's Reedling, the observatory path's Frost Wisp --------------------
const direct = async (map, x, y, flags, foe) => {
  await start(map, x, y, flags);
  return p.evaluate(async (foe) => {
    const W = RB.world.W, f = W.foes.find((q) => q.id === foe);
    RB.game.startBattle(f.def.enemy, { where: { map: W.map.id, x: f.x, y: f.y }, place: f.def });
    await new Promise((r) => setTimeout(r, 900));
    return RB.combat.context();
  }, foe);
};
const pit = await direct('rw.mill0', 2, 7, { rw_mill_open: true }, 'p2');
assert(pit.setting === 'indoor' && pit.bg === 'mill' && /wet stones/.test(pit.intro.en) && /millrace/.test(pit.settle.en), 'the wheel pit Reedling: indoors, no reeds (' + pit.bg + ')');
await p.evaluate(() => { for (let i = 0; i < 4; i++) RB.ui.dialogue.advance(true); });
const path = await direct('sb.obs_path', 14, 14, { sb_arrived: true }, 'wisp1');
assert(path.setting === 'outdoor' && path.bg === 'snowbell' && /frozen path/.test(path.intro.en) && /on the path/.test(path.settle.en), 'the observatory path Frost Wisp: out of doors, on the path (' + path.bg + ')');

assert(!errors.length, 'no page errors ' + errors.slice(0, 3).join(' | '));
await b.close(); srv.close();
console.log(fail ? fail + ' FAILED' : 'all ok');
process.exit(fail ? 1 : 0);
