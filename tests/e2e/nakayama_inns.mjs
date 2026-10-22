// RBN-QA-100 (Agnes 6337082188; Cloud CC-106; Local CL-181): Nakayama's two inns stand side by side (cr/10_maps.js:
// the same row, y6, at x3 and x14), and the arrival has always said so (「{並|なら}んで」), but the lamp, Otaki and Seibe
// said they face each other across the way, and the seal line pictured two inns facing each other. Those four lines now
// say side by side / next door; nothing else changed. In Chromium on the built game, read in play at Nakayama:
//  1. the arrival (on entering the station for the first time): the two inns side by side, as before;
//  2. the lamp, relit by its name (the name challenge itself is not under test here: it is answered by a stub so the
//     lamp's own lines play): "the two inns standing side by side";
//  3. Otaki and Seibe, each talked to with the world's own interact: "next door", the rivalry otherwise word for word;
//  4. the seal (Otaki, with Tome's seal book): two inns side by side on it;
//  5. no line read at Nakayama says the inns face each other (「{向|む}かい」, "across the way", "facing each other");
//     every kanji in the dialogue box's Japanese line has its furigana; no page errors.
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else fail++; console.log((c ? 'ok   ' : 'FAIL ') + m); };
const allErrors = [];

async function start(p, flags, inv) {
  // on the ford road below (cr.leg3), then into the station by the game's own transition (the way you arrive in play)
  await p.evaluate(([flags, inv]) => {
    const done = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_called: true, cr_st1: true, cr_st2: true, cr_st3: true };
    const s = RB.game.debugStart('cr.leg3', 30, 12, { dir: 'right', comp: 'suzu', flags: Object.assign(done, flags) });
    s.edition = 2; s.quests.cr_main = { stage: 2, done: false };
    Object.assign(s.inv, inv || {});
    for (const m in RB.content.maps) if (m !== 'cr.nakayama') for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice';
    RB.game.applySettings();
  }, [flags, inv]);
  await p.waitForTimeout(600);
  await p.evaluate(() => { RB.game.transition('cr.nakayama', 1, 12, 'right', {}); });
}
// every line shown until the scene ends: [jp, en, bare kanji in the box]
async function readAll(p) {
  const lines = [];
  await p.waitForFunction(() => RB.ui.dialogue.isOpen(), null, { timeout: 8000 }).catch(() => {});
  for (let i = 0; i < 40; i++) {
    const open = await p.evaluate(() => RB.ui.dialogue.isOpen());
    if (!open) {
      if (!(await p.evaluate(() => RB.script.isRunning()))) break;
      await p.waitForTimeout(150); continue;
    }
    const l = await p.evaluate(() => {
      const d = RB.ui.dialogue.shown(), bare = [];
      // the box's Japanese line (main or sub, by the learner's profile): the one that carries kana
      const box = [...document.querySelectorAll('.dlg .txt .main, .dlg .txt .sub')].find((e) => /[ぁ-ゟ゠-ヿ]/.test(e.textContent));
      if (box) {
        const w = document.createTreeWalker(box, NodeFilter.SHOW_TEXT); let n;
        while ((n = w.nextNode())) {
          if (!/[一-鿿々]/.test(n.nodeValue)) continue;
          const el = n.parentElement;
          if (!el || !el.getClientRects().length || el.closest('.sr, rt, [hidden], [aria-hidden="true"]')) continue;
          if (!el.closest('ruby')) bare.push(n.nodeValue.trim().slice(0, 20));
        }
      }
      return d ? [String(d.jp || ''), String(d.en || ''), bare] : null;
    });
    if (l && !(lines.length && lines[lines.length - 1][0] === l[0] && lines[lines.length - 1][1] === l[1])) lines.push(l);
    await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance());
    await p.waitForTimeout(200);
  }
  return lines;
}
async function talkTo(p, x, y, dir) {
  await p.evaluate(([x, y, dir]) => RB.world.enter('cr.nakayama', x, y, dir, {}), [x, y, dir]);
  await p.waitForTimeout(400);
  await p.evaluate(() => RB.world.interact());
  return readAll(p);
}
// a person standing at (x,y): talk from the first side the map leaves open (below, left, right), facing them
async function talkToPerson(p, x, y) {
  const spot = await p.evaluate(([x, y]) => {
    const m = RB.world.W.map, B = (x, y) => RB.maps.blockedStatic(m, x, y);
    return [[x, y + 1, 'up'], [x - 1, y, 'right'], [x + 1, y, 'left']].find((q) => !B(q[0], q[1])) || null;
  }, [x, y]);
  return spot ? talkTo(p, ...spot) : [];
}
// facing each other, in the line's markup ({向|む}かい, {向|む}かい{合|あ}う) or its English
const FACING_JP = /\{向\|む\}かい|向かい/, FACING_EN = /across the way|facing each other|face each other/i;
const seen = [];

{
  const { p, errors } = await page(b, url);

  // ---- 1. the arrival ----------------------------------------------------------------------------------------------------
  await start(p, { cr_guest_started: true }, {});
  const arrive = await readAll(p);
  seen.push(...arrive);
  ok(arrive.some((l) => /並/.test(l[0]) && /Two inns side by side/.test(l[1])), 'the arrival: two inns side by side, as before (' + JSON.stringify(arrive.map((l) => l[1].slice(0, 50))) + ')');

  // ---- 2. the lamp ------------------------------------------------------------------------------------------------------
  // the lamp at (32,15); stand beside it where the map lets you, face it
  const spot = await p.evaluate(() => {
    const m = RB.world.W.map, B = (x, y) => RB.maps.blockedStatic(m, x, y);
    return [[32, 16, 'up'], [31, 15, 'right'], [33, 15, 'left'], [32, 14, 'down']].find((q) => !B(q[0], q[1])) || null;
  });
  await p.evaluate(() => { const s = RB.game.s; s.inv.cr_ledger = 1; window.__chal = RB.challenge.run; RB.challenge.run = async () => ({ ok: true }); });
  const lamp = spot ? await talkTo(p, ...spot) : [];
  await p.evaluate(() => { RB.challenge.run = window.__chal; });
  seen.push(...lamp);
  const lampLit = await p.evaluate(() => !!RB.game.s.flags.cr_lamp4);
  ok(lampLit && lamp.some((l) => /並|なら/.test(l[0]) && l[1] === 'The same light falls on the two inns standing side by side.'),
    'the lamp: "the two inns standing side by side" (' + JSON.stringify({ spot, lampLit, lines: lamp.map((l) => l[1].slice(0, 60)) }) + ')');

  // ---- 3. Otaki and Seibe ------------------------------------------------------------------------------------------------
  const otaki = await talkToPerson(p, 8, 11);
  seen.push(...otaki);
  ok(otaki.length >= 1 && /隣/.test(otaki[0][0]) && /松葉屋/.test(otaki[0][0]) && otaki[0][1] === 'Welcome to the Matsuba. Our futons are one layer thicker than the Take\'s next door.',
    'Otaki: next door, the futons as before (' + JSON.stringify(otaki.map((l) => l[1].slice(0, 80))) + ')');
  const seibe = await talkToPerson(p, 18, 11);
  seen.push(...seibe);
  ok(seibe.length >= 1 && /隣/.test(seibe[0][0]) && /竹屋/.test(seibe[0][0]) && seibe[0][1] === 'This is the Take. Our bath is hotter than the Matsuba\'s next door.',
    'Seibe: next door, the bath as before (' + JSON.stringify(seibe.map((l) => l[1].slice(0, 80))) + ')');

  // ---- 4. the seal --------------------------------------------------------------------------------------------------------
  await p.evaluate(() => { RB.game.s.inv.cr_sealbook = 1; });
  const seal = await talkToPerson(p, 8, 11);
  seen.push(...seal);
  const sealed = await p.evaluate(() => !!RB.game.s.flags.cr_seal4);
  ok(sealed && seal.some((l) => /並/.test(l[0]) && /two inns side by side on it/.test(l[1])), 'the seal: two inns side by side on it (' + JSON.stringify({ sealed, lines: seal.map((l) => l[1].slice(0, 90)) }) + ')');

  // ---- 5. nothing faces; furigana everywhere --------------------------------------------------------------------------------
  const facing = seen.filter((l) => FACING_JP.test(l[0]) || FACING_EN.test(l[1]));
  ok(seen.length >= 6 && facing.length === 0, 'no line read at Nakayama says the inns face each other (' + seen.length + ' lines; ' + JSON.stringify(facing.map((l) => l[1].slice(0, 60))) + ')');
  const bare = seen.filter((l) => l[2].length);
  ok(bare.length === 0, 'every kanji in the dialogue box\'s Japanese line has its furigana (' + JSON.stringify(bare.map((l) => l[2])) + ')');
  allErrors.push(...errors);
  await p.close();
}

ok(allErrors.length === 0, 'no page errors' + (allErrors.length ? ' (' + allErrors.slice(0, 3).join(' | ') + ')' : ''));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
