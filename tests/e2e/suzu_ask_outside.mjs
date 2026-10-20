// Agnes, RBN-QA-027: in "A Seat Kept Until Spring", after Hiro tells the story of the empty seat (co.suzu_ask), the
// narrator says "Outside the workshop, Suzu looks back just once." and Suzu speaks to you alone; but the scene only
// walked the two of you a few steps inside, by Hiro and Isao, and left you there. Now, with Suzu, the two of you go
// out of the workshop's door into the village for her lines, and you are left there, by the door. In the game:
//  1. Suzu, the seat asked about at the workshop: Hiro's story inside; "Outside the workshop" and Suzu's two lines
//     in the village by the workshop's door (you at 43,19, Suzu beside you); co_suzu_asked, the quest's step 2;
//  2. after it, free in the village by the door; Suzu once (your companion), no Hiro or Isao outside; the door free;
//  3. back in through the door: Hiro and Isao once each; Hiro's idle line knows you asked;
//  4. saved after the scene and loaded: in the village, the quest at step 2;
//  5. with another companion (Nao), the scene has no outside lines and leaves you inside, as before.
// Usage: node tools/build.mjs && node tests/e2e/suzu_ask_outside.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const FL = { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb1_done: true, mb2_done: true, co_arrived: true, co_met_sayo: true, 'seen.co.hiro_first': true };
const OUT = /Outside the workshop, Suzu looks back/, RIB = /He remembers only the ribbon/, WAIT = /I'll wait until the kiln gives its record back/, MOTHER = /My mother's/;

async function start(p, comp) {
  await p.evaluate(async (comp) => {
    RB.test.enable({ battle: 'unravel', choose: () => 0 });
    const s = RB.game.debugStart('co.glass', 4, 7, { comp, flags: {}, dir: 'up', edition: 2 });
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb1_done: true, mb2_done: true, co_arrived: true, co_met_sayo: true });
    s.seen['co.hiro_first'] = true;
    s.chapter = 5;
    s.learn.kanaKnown = 'both';
    s.quests.co_main = { stage: 2, done: false, t: 1 };
    s.quests.co_suzu = { stage: 1, done: false, t: 1 };
    RB.game.settings.textSpeed = 'instant';
    RB.game.applySettings();
    RB.world.refreshActors();
    const W = RB.world.W, t0 = performance.now();
    while (W.time - W.enteredAt < 1100 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50));
  }, comp);
}
const state = (p) => p.evaluate(() => {
  const W = RB.world.W, s = RB.game.s;
  return { map: W.map.id, x: W.player.x, y: W.player.y, comp: W.comp ? [W.comp.x, W.comp.y] : null, asked: !!s.flags.co_suzu_asked, step: s.quests.co_suzu.stage,
    npcs: W.npcs.map((n) => n.id), mode: RB.game.mode(), running: RB.script.isRunning() };
});
// talk to Hiro and play what follows; each line shown with the map it was shown on
async function talkHiro(p) {
  return p.evaluate(async () => {
    await RB.test.idle();
    const shown = [];
    const orig = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l, ...r) { shown.push({ en: (l && l.en) || '', map: RB.world.W.map && RB.world.W.map.id, px: RB.world.W.player.x, py: RB.world.W.player.y, comp: RB.world.W.comp ? [RB.world.W.comp.x, RB.world.W.comp.y] : null }); return orig.call(this, l, ...r); };
    await RB.test.talk('hiro');
    await RB.test.idle();
    RB.ui.dialogue.say = orig;
    return shown;
  });
}
async function settle(p) {
  await p.waitForFunction(() => RB.world.W.map && !RB.world.W.player.mv && RB.game.mode() === 'world' && !RB.script.isRunning(), null, { timeout: 20000, polling: 50 });
  await p.waitForTimeout(400);
}

// ---- 1-4. with Suzu ---------------------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 757 } });
  await start(p, 'suzu');
  const lines = await talkHiro(p);
  await settle(p);
  const at = (re) => lines.find((l) => re.test(l.en));
  const m = at(MOTHER), o = at(OUT), r = at(RIB), w = at(WAIT);
  ok(m && m.map === 'co.glass', '1 Hiro\'s story is told inside the workshop (' + (m && m.map) + ')');
  ok(o && o.map === 'co.village' && o.px === 43 && o.py === 19, '1 "Outside the workshop" is said outside, by its door (' + (o && o.map + ' ' + o.px + ',' + o.py) + ')');
  ok(o && o.comp && o.comp[0] === 42 && o.comp[1] === 19, '1 Suzu beside you there (' + (o && o.comp) + ')');
  ok(r && w && r.map === 'co.village' && w.map === 'co.village', '1 her two lines to you are said outside too');
  let st = await state(p);
  ok(st.asked && st.step === 2, '1 co_suzu_asked; the quest\'s step 2 (' + st.step + ')');
  ok(st.map === 'co.village' && st.x === 43 && st.y === 19 && st.mode === 'world' && !st.running, '2 free in the village by the workshop\'s door');
  ok(!st.npcs.includes('hiro') && !st.npcs.includes('co_isao') && !st.npcs.includes('suzu'), '2 no Hiro, Isao or a second Suzu outside (' + st.npcs.filter((n) => /hiro|isao|suzu/.test(n)).join(',') + ')');
  const doorFree = await p.evaluate(() => { const W = RB.world.W, at = (x, y) => W.npcs.concat(W.comp ? [W.comp] : []).some((a) => a.x === x && a.y === y); return !at(42, 18) && !at(42, 17); });
  ok(doorFree, '2 nobody stands in the door or on its step');
  // 4. saved and loaded
  await p.evaluate(async () => { await RB.test.idle(); await RB.save.writeSlot(1, RB.game.s, { force: true }); await RB.game.loadCampaign(1); });
  await settle(p);
  st = await state(p);
  ok(st.map === 'co.village' && st.asked && st.step === 2, '4 saved and loaded: in the village, step 2');
  // 3. back in through the door
  await p.evaluate(async () => { RB.test.place(42, 18, 'up'); await RB.test.step('up'); });
  await settle(p);
  st = await state(p);
  ok(st.map === 'co.glass', '3 the door takes you back into the workshop (' + st.map + ')');
  ok(st.npcs.filter((n) => n === 'hiro').length === 1 && st.npcs.filter((n) => n === 'co_isao').length === 1 && !st.npcs.includes('suzu'), '3 Hiro and Isao once each, no second Suzu (' + st.npcs.join(',') + ')');
  const again = await talkHiro(p);
  ok(again.some((l) => /Nobody had ever asked me about the seat/.test(l.en)) && !again.some((l) => OUT.test(l.en)), '3 Hiro\'s idle line knows you asked; nothing replayed');
  ok(errors.length === 0, '1-4 no page errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await p.context().close();
}

// ---- 5. with Nao: inside, as before ---------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 757 } });
  await start(p, 'nao');
  const lines = await talkHiro(p);
  await settle(p);
  const st = await state(p);
  ok(lines.some((l) => MOTHER.test(l.en)) && !lines.some((l) => OUT.test(l.en)) && st.map === 'co.glass' && st.asked, '5 with Nao: Hiro\'s story, no outside lines, still inside');
  ok(errors.length === 0, '5 no page errors' + (errors.length ? ': ' + errors.slice(0, 2).join(' | ') : ''));
  await p.context().close();
}

console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
