// Batch 3 Row 3, Wings 1 and 4 (Cloud CC-591; Local CL-824; Agnes 6874584737), in Chromium on the built game: once each
// wing's card trial is passed, what its line says is true on the floor. A throwaway journey after the story (slot 4 of a
// fresh browser context, never a player's saves; each floor's first-arrival scene marked as seen), both patterns of each
// wing at E. Each time:
//  1. before the trial: the four cards (Wing 4) or plaques (Wing 1) are there: standing next to each and using it, as a
//     player does (the world's own interaction), says its name and its saying; each tile blocks;
//  2. the trial passed through its scene, the task answered in the real challenge (choice mode), the floor's other
//     trials counted first by the game's hooks: Wing 4, the card the trial had wrong is gone (using its tile finds
//     nothing; the tile no longer blocks) and the other three as before; Wing 1, that plaque says only "A stone plaque.",
//     the other three their saying;
//  3. Suspend from the Hall's sheet, then loading the slot: the same;
//  4. leaving (no reprieve), going in again (the next floor, the first counted), and walking back down (a world-entry
//     call, not the stairs): every card is back with its saying, and the trial is still done ("The carving asks nothing
//     more.");
//  no page errors.
// Usage: node tools/build.mjs && node tests/e2e/hall_wrong_card.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);

const CARDS = { w4: { map: 'hall.w4f1', at: [[5, 3], [7, 3], [9, 3], [11, 3]], name: "One of the peddler's cards." }, w1: { map: 'hall.w1f1', at: [[34, 8], [34, 11], [34, 14], [34, 17]], name: 'A stone plaque.' } };

async function start(p, w, pat) {
  await p.evaluate(({ w, pat }) => {
    const done = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true, postgame: true, hall_ledger: true, hall_foyer_seen: true, ngp_offered: true, hall_w1_f1_seen: true, hall_w4_f1_seen: true, hall_w1_f2_seen: true, hall_w4_f2_seen: true };
    const s = RB.game.debugStart('hall.foyer', 40, 14, { comp: 'mio', flags: done });
    s.edition = 2; s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
    RB.hall.wrec(s, w).pat = pat;
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.settings.lightbulb = false;
    RB.game.applySettings();
    RB.save.setCurrent(4, 0);
    window.__lines = [];
    if (!RB.ui.dialogue.__kept) {
      const say = RB.ui.dialogue.say;
      RB.ui.dialogue.say = function (l) { window.__lines.push({ who: l.who || '', jp: l.jp || '', en: l.en || '' }); return say.apply(this, arguments); };
      RB.ui.dialogue.__kept = true;
    }
  }, { w, pat });
}
async function settle(p) {
  for (let i = 0; i < 80 && await p.evaluate(() => RB.game.mode() !== 'world' || RB.ui.dialogue.isOpen()); i++) { await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance(true)); await p.waitForTimeout(80); }
  await p.waitForTimeout(250);
}
// a scene through the game: dialogue advanced, the language task answered in choice mode (the options tried in turn)
async function scene(p, id) {
  await p.evaluate((id) => { window.__done = false; window.__lines = []; RB.script.run(id).then(() => { window.__done = true; }); }, id);
  for (let i = 0; i < 600; i++) {
    const st = await p.evaluate(() => ({ done: window.__done, open: RB.ui.dialogue.isOpen(), chal: !!document.querySelector('.chal'), ok: !!document.querySelector('.fbwrap[data-fb=ok] .fb-go') }));
    if (st.done) return p.evaluate(() => window.__lines.slice());
    if (st.ok) { await p.click('.fbwrap[data-fb=ok] .fb-go'); continue; }
    if (st.chal) {
      await p.evaluate(() => { const tab = document.querySelector('.chal-tabs .ptab[data-mode="choice"]'); if (tab) tab.click(); });
      const n = await p.evaluate(() => document.querySelectorAll('.chal .mc .btn').length);
      for (let k = 0; k < n; k++) {
        await p.evaluate((k) => { const x = [...document.querySelectorAll('.chal .mc .btn')][k]; if (x && !x.disabled) x.click(); }, k);
        await p.waitForTimeout(80);
        if (await p.evaluate(() => !!document.querySelector('.fbwrap[data-fb=ok] .fb-go'))) break;
      }
      continue;
    }
    if (st.open) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(40);
  }
  throw new Error('scene ' + id + ' did not finish');
}
// each card: does its tile block, and what does using it say (standing on a free tile next to it, facing it)
async function cards(p, w) {
  const out = [];
  for (const [x, y] of CARDS[w].at) {
    const r = await p.evaluate(({ x, y }) => {
      const W = RB.world.W;
      const blocked = RB.maps.blockedStatic(W.map, x, y);
      let f = null;
      for (const [dx, dy, dir] of [[0, 1, 'up'], [-1, 0, 'right'], [1, 0, 'left'], [0, -1, 'down']]) {
        const nx = x + dx, ny = y + dy;
        if (!RB.maps.blockedStatic(W.map, nx, ny) && !RB.maps.exitAt(W.map, nx, ny) && !W.npcs.some((n) => n.x === nx && n.y === ny)) { f = { x: nx, y: ny, dir }; break; }
      }
      if (!f) return { blocked, stand: null };
      RB.test.place(f.x, f.y, f.dir);
      window.__lines = [];
      RB.world.interact();
      return { blocked, stand: f };
    }, { x, y });
    await settle(p);
    r.said = await p.evaluate(() => window.__lines.map((l) => l.en));
    out.push(r);
  }
  return out;
}
const gone = (p, w) => p.evaluate((w) => [1, 2, 3, 4].filter((n) => RB.game.s.flags['xp_hall_' + w + '_f0_t3_gone' + n]).map((n) => n - 1), w);
const where = (p) => p.evaluate(() => { const v = RB.hall.visitOf(RB.game.s); return { map: RB.world.W.map.id, floor: v ? v.floor : null, mode: RB.game.mode() }; });
const full = (c, w) => c.said[0] === CARDS[w].name && c.said.filter((t) => /^"/.test(t)).length === 1;
const bare = (c, w) => c.said.length === 1 && c.said[0] === CARDS[w].name;
const none = (c) => c.said.length === 0;
async function sheet(p, pick) {
  await settle(p);
  await p.evaluate(() => document.querySelector('.hall-chip').click());
  await p.waitForSelector('.csheet .foot button', { timeout: 5000 });
  const opts = await p.evaluate(() => [...document.querySelectorAll('.csheet .foot button')].map((x) => x.textContent.trim()));
  const k = opts.findIndex((t) => new RegExp(pick, 'i').test(t));
  await p.evaluate((k) => document.querySelectorAll('.csheet .foot button')[k].click(), k);
  await p.waitForTimeout(900);
  return opts;
}

for (const w of ['w4', 'w1']) for (const pat of [0, 1]) {
  const tag = ' (' + w + ', pattern ' + pat + ')';
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 820 } });
  await start(p, w, pat);
  await p.evaluate(async (w) => { await RB.save.manualSave(4); await RB.ui.hall.goIn(w); }, w);
  await settle(p);
  // 1. before
  const before = await cards(p, w);
  ok((await where(p)).map === CARDS[w].map && before.every((c) => full(c, w) && c.blocked), '1 before the trial: each says its name and its saying when used, and its tile blocks' + tag + ' ' + flat(before.map((c) => [c.blocked, c.said.length])));
  // 2. the trial passed (the floor's other trials counted first, by the game's hooks)
  await p.evaluate(async (w) => { for (const t of RB.hall.get(w).trials.filter((x) => x.floor === 0 && x.id !== 't3')) await RB.hooks.hall_trial([w, t.id]); }, w);
  const lines = await scene(p, 'hall.' + w + '.t3');
  await settle(p);
  const g = await gone(p, w);
  const after = await cards(p, w);
  const counted = await p.evaluate((w) => !!RB.hall.peek(RB.game.s, w).floors[0], w);
  const passOk = g.length === 1 && counted && lines.some((l) => /melts away|fade away/.test(l.en)) && after.every((c, i) => (i === g[0]
    ? (w === 'w4' ? none(c) && !c.blocked : bare(c, w) && c.blocked === before[i].blocked)
    : full(c, w) && c.blocked === before[i].blocked));
  ok(passOk, '2 the trial passed in the challenge: ' + (w === 'w4' ? 'the wrong card gone (its tile finds nothing and no longer blocks), the other three as before' : 'the wrong plaque says only its name, the other three their saying') + tag + ' ' + flat({ g, counted, after: after.map((c) => [c.blocked, c.said.length]) }));
  // 3. Suspend, then loading the slot
  await sheet(p, 'Suspend');
  const title = await p.evaluate(() => RB.game.mode() === 'title');
  await p.evaluate(async () => { await RB.game.loadCampaign(4); });
  await p.waitForTimeout(900);
  await settle(p);
  const g2 = await gone(p, w);
  const again = await cards(p, w);
  ok(title && flat(g2) === flat(g) && flat(again.map((c) => [c.blocked, c.said])) === flat(after.map((c) => [c.blocked, c.said])), '3 suspended, then loaded: the same' + tag + ' ' + flat({ title, g2 }));
  // 4. leaving, going in again, walking back down
  await p.evaluate(async () => { await RB.ui.hall.leave(false); });
  await settle(p);
  await p.evaluate(async (w) => { await RB.ui.hall.goIn(w); }, w);
  await settle(p);
  const next = await where(p);
  await p.evaluate((w) => { const f = RB.hall.get(w).floors[0]; RB.world.enter(f.map, f.entry.x, f.entry.y, f.entry.dir || 'up'); }, w);
  await settle(p);
  const back = await cards(p, w);
  const done = await scene(p, 'hall.' + w + '.t3');
  ok(next.floor === 1 && !(await gone(p, w)).length && back.every((c, i) => full(c, w) && c.blocked === before[i].blocked) && done.some((l) => /asks nothing more/.test(l.en)),
    '4 left, in again (the next floor), walked back down: every card back with its saying, the trial still done' + tag + ' ' + flat({ next, back: back.map((c) => c.said.length), done: done.map((l) => l.en) }));
  ok(errors.length === 0, 'no page errors' + tag + ': ' + errors.join(' | '));
  await p.close();
}
await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
