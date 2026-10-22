// RBN-QA-120 (Agnes 6346216453; Cloud CC-126 §1): Tsuneji takes his spring egg home to share with the ridge folk. In
// Chromium on the built game, from the real talk at the riverbank (the world's own interact), with throwaway journeys:
//  1. with each companion and none (you on either side of him): he is there for his line; then he walks to the Lower
//     House's door and fades there, and when the narration that says he went appears no figure of his is anywhere on
//     the street (standing, or going); his last place before fading is the doorway (9,10) or the tile before it, not
//     somewhere the bound cut short; his going is recorded as to the Lower House by that door; you are where you
//     stood; one egg fewer, the flag set, the quest still open with the other two eggs not given;
//  2. the Lower House after: he stands by the hearth at (9,7), and talking to him gives his own lines; the riverbank is
//     empty when you come back out;
//  3. a third egg: the quest is done after the narration;
//  4. "Skip seen" pressed at his line: the same, at once (nobody walking under the narration);
//  5. slow frames (the page's frames held to about seven a second): the narration still never shows him (the walk is
//     bounded: by the time it shows he has gone, walked or not);
//  6. a journey loaded while he walks: no figure of his left on the street, nothing running, no page error; that
//     journey (saved before the egg) has him at the riverbank with the egg still to give, and giving it again ends as
//     in 1;
//  7. saves: one with the egg given and the valley's story not done has the riverbank empty and him in the Lower
//     House; one with the story done has him in neither;
//  8. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/tsuneji_egg.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const YN = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_called: true, cr_done: true, cr_delivered: true, yn_called: true, yn_kami_seen: true, yn_rooms_done: true, yn_shimo_seen: true, yn_eggs_cooked: true };
const HIS = /^yn_tsuneji: …Can I share it/, WENT = /^narr: Tsuneji carries the egg/;
const allErrors = [];

async function start(p, o) {
  await p.evaluate(([YN, o]) => {
    const s = RB.game.debugStart(o.map, o.x, o.y, { dir: o.dir, edition: RB.edition.forNew(), comp: o.comp || null, flags: Object.assign({}, YN, o.flags || {}) });
    if (!o.comp) s.comp = null;
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    s.quests.yn_eggs = { stage: 0, done: false, t: Date.now() };
    if (o.eggs) s.inv.yn_eggs = o.eggs;
    if (o.seen) s.seen['yn.egg_tsuneji'] = true;
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.suzuSpeech = 'standard'; RB.game.settings.skipSeen = true;
    RB.world.enter(o.map, o.x, o.y, o.dir, { fresh: true });
    const isT = (a) => a.id === 'yn_tsuneji' || (a.def && a.def.char === 'yn_tsuneji');
    // every figure of his on this map at the moment each line is shown, and where his going figure has been
    if (!window.__lineWrap) {
      const say = RB.ui.dialogue.say;
      RB.ui.dialogue.say = function (l) {
        const W = RB.world.W;
        const all = W.npcs.concat(W.extras, W.leavers).filter(isT);
        window.__atLine.push({ en: l.en, map: W.map.id, figs: all.filter((a) => a.alpha == null || a.alpha > 0.02).map((a) => ({ at: [a.x, a.y], leaving: W.leavers.includes(a) })), any: all.length, ff: RB.game.fastForward() });
        return say.apply(this, arguments);
      };
      setInterval(() => { const W = RB.world.W; const g = W && W.leavers.find(isT); if (g) window.__trail.push([g.x, g.y, +(g.alpha || 0).toFixed(2), W.map.id]); }, 30);
      window.__lineWrap = true;
    }
    window.__atLine = []; window.__trail = [];
  }, [YN, o]);
  await p.waitForTimeout(800);
}
const look = () => {
  const W = RB.world.W, d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown();
  const t = W.npcs.find((a) => a.id === 'yn_tsuneji');
  return { d: d ? (d.who || '') + ': ' + String(d.en || '').slice(0, 60) : null, run: RB.script.isRunning(), choices: [...document.querySelectorAll('.choices:not(.hidden) .choice')].length,
    him: t ? [t.x, t.y] : null, going: W.leavers.some((a) => a.id === 'yn_tsuneji'), map: W.map.id, you: [W.player.x, W.player.y] };
};
async function play(p, onLine) {
  await p.evaluate(() => RB.world.interact());
  const lines = [];
  for (let i = 0; i < 400; i++) {
    const st = await p.evaluate(look);
    if (st.d) {
      if (!lines.length || lines[lines.length - 1].d !== st.d) {
        lines.push(st);
        if (onLine && (await onLine(st, lines.length - 1))) return { lines, stopped: true };
        await p.waitForTimeout(150);
        await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance());
      }
      await p.waitForTimeout(60);
      continue;
    }
    if (!st.run && lines.length) break;
    await p.waitForTimeout(60);
  }
  await p.waitForTimeout(500);
  return { lines };
}
const state = (p) => p.evaluate(() => {
  const s = RB.game.s, W = RB.world.W, dep = W.departures.filter((d) => d.id === 'yn_tsuneji').pop() || null;
  return { flag: !!s.flags.yn_egg_tsuneji, eggs: s.inv.yn_eggs || 0, q: s.quests.yn_eggs, dep, map: W.map.id, you: [W.player.x, W.player.y],
    here: W.npcs.filter((a) => a.id === 'yn_tsuneji').map((a) => a.x + ',' + a.y), going: W.leavers.filter((a) => a.id === 'yn_tsuneji').length,
    trail: window.__trail.slice(-1)[0] || null, atLine: window.__atLine, run: RB.script.isRunning(), dlg: RB.ui.dialogue.isOpen() };
});
const nearDoor = (tr) => !!tr && tr[3] === 'yn.lower' && Math.abs(tr[0] - 9) + Math.abs(tr[1] - 10) <= 1;

// ---- 1, 2. each companion and none, from either side ----------------------------------------------------------------
for (const [comp, x, dir] of [[null, 21, 'right'], ['nao', 23, 'left'], ['mio', 21, 'right'], ['ren', 23, 'left'], ['suzu', 21, 'right']]) {
  const who = comp || 'no companion';
  const { p, errors } = await page(b, url);
  await start(p, { map: 'yn.lower', x, y: 18, dir, comp, eggs: 3 });
  const r = await play(p);
  const s = await state(p);
  const his = r.lines.find((l) => HIS.test(l.d)), went = s.atLine.filter((l) => /Tsuneji carries the egg/.test(l.en));
  ok(his && his.him && his.him.join() === '22,18' && went.length === 1 && went[0].figs.length === 0 && went[0].any === 0, who + ': he is there for his line; when the narration says he went, no figure of his is on the street (' + JSON.stringify({ his: his && his.him, went }) + ')');
  ok(nearDoor(s.trail) && s.dep && s.dep.to === 'yn.shimo' && s.dep.exit === '9,10', who + ': he walked to the Lower House\'s door and faded there (last seen going at ' + JSON.stringify(s.trail) + '; recorded ' + JSON.stringify(s.dep && { to: s.dep.to, exit: s.dep.exit, reason: s.dep.reason }) + ')');
  ok(s.you.join() === x + ',18' && s.flag && s.eggs === 2 && s.q && s.q.stage === 0 && !s.q.done && !s.here.length && !s.going, who + ': you where you stood; one egg fewer, the flag set, the quest still open; the riverbank empty (' + JSON.stringify({ you: s.you, eggs: s.eggs, q: s.q, here: s.here }) + ')');
  if (!comp || comp === 'mio') {
    await p.evaluate(() => RB.world.enter('yn.shimo', 9, 8, 'up', {}));
    await p.waitForTimeout(700);
    const inside = await state(p);
    const r2 = await play(p);
    ok(inside.here.join() === '9,7' && /^yn_tsuneji: …I brought six from the village/.test((r2.lines[0] || {}).d || ''), who + ': in the Lower House he stands by the hearth at (9,7) and talks his own lines (' + JSON.stringify({ here: inside.here, first: r2.lines[0] && r2.lines[0].d }) + ')');
    await p.evaluate(() => RB.world.enter('yn.lower', 9, 11, 'down', {}));
    await p.waitForTimeout(700);
    const back = await state(p);
    ok(back.map === 'yn.lower' && !back.here.length, who + ': back on the street, the riverbank is empty');
  }
  allErrors.push(...errors); await p.close();
}

// ---- 3. a third egg -------------------------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await start(p, { map: 'yn.lower', x: 21, y: 18, dir: 'right', comp: 'ren', eggs: 1, flags: { yn_egg_yasuke: true, yn_egg_oshige: true } });
  const r = await play(p);
  const s = await state(p);
  const iw = r.lines.findIndex((l) => WENT.test(l.d)), ia = r.lines.findIndex((l) => /All three eggs handed out/.test(l.d));
  ok(iw >= 0 && ia > iw && s.q && s.q.done && s.eggs === 0 && nearDoor(s.trail), 'a third egg: he walks home, then the quest is done (' + JSON.stringify({ q: s.q, eggs: s.eggs, order: [iw, ia] }) + ')');
  allErrors.push(...errors); await p.close();
}

// ---- 4. "Skip seen" ---------------------------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await start(p, { map: 'yn.lower', x: 23, y: 18, dir: 'left', comp: 'suzu', eggs: 3, seen: true });
  let skipped = null;
  await play(p, async (l) => {
    if (skipped || !HIS.test(l.d)) return false;
    skipped = await p.evaluate(() => { const k = document.querySelector('.dlg .b-skip'); const vis = !!(k && k.offsetParent && !k.classList.contains('hidden')); if (vis) k.click(); return { vis, ff: RB.game.fastForward() }; });
    return false;
  });
  const s = await state(p);
  const went = s.atLine.filter((l) => /Tsuneji carries the egg/.test(l.en));
  ok(skipped && skipped.vis && went.length === 1 && went[0].any === 0 && s.flag && s.eggs === 2 && !s.here.length && !s.going && s.you.join() === '23,18', '"Skip seen" at his line: gone at once, nobody under the narration, the same journey after (' + JSON.stringify({ skipped, went, eggs: s.eggs }) + ')');
  allErrors.push(...errors); await p.close();
}

// ---- 5. slow frames ---------------------------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await start(p, { map: 'yn.lower', x: 21, y: 18, dir: 'right', comp: 'nao', eggs: 3 });
  let slowed = null;
  await play(p, async (l) => {
    if (slowed || !HIS.test(l.d)) return false;
    slowed = await p.evaluate(() => { window.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 150); return true; });
    return false;
  });
  const s = await state(p);
  const went = s.atLine.filter((l) => /Tsuneji carries the egg/.test(l.en));
  ok(slowed && went.length === 1 && went[0].any === 0 && s.flag && !s.here.length && !s.going, 'slow frames: the narration still never shows him (' + JSON.stringify({ went, last: s.trail }) + ')');
  allErrors.push(...errors); await p.close();
}

// ---- 6. a journey loaded while he walks; 7. saves -----------------------------------------------------------------------
{
  const { p, errors } = await page(b, url);
  await start(p, { map: 'yn.lower', x: 21, y: 18, dir: 'right', comp: 'mio', eggs: 3 });
  await p.evaluate(async () => { await RB.save.writeSlot(3, RB.game.s, { force: true }); });
  let mid = null;
  const r = await play(p, async (l) => {
    if (!HIS.test(l.d)) return false;
    await p.evaluate(() => RB.ui.dialogue.advance());
    await p.waitForTimeout(1500);
    mid = await p.evaluate(() => RB.world.W.leavers.filter((a) => a.id === 'yn_tsuneji').map((a) => [a.x, a.y]));
    await p.evaluate(async () => { await RB.game.loadCampaign(3); });
    await p.waitForTimeout(1500);
    return true;
  });
  const s = await state(p);
  ok(r.stopped && mid && mid.length === 1 && s.map === 'yn.lower' && !s.going && !s.run && !s.dlg && !s.flag && s.eggs === 3 && s.here.join() === '22,18', 'a journey loaded while he walks: nothing of his walk left, nothing running; that journey has him at the riverbank with the egg to give (' + JSON.stringify({ mid, here: s.here, going: s.going, eggs: s.eggs }) + ')');
  await p.evaluate(() => { RB.world.enter('yn.lower', 21, 18, 'right', {}); window.__trail = []; window.__atLine = []; });
  await p.waitForTimeout(500);
  await play(p);
  const s2 = await state(p);
  ok(s2.flag && s2.eggs === 2 && !s2.here.length && nearDoor(s2.trail), 'given again, it ends as before (' + JSON.stringify({ eggs: s2.eggs, trail: s2.trail }) + ')');
  // saves
  for (const [name, flags, lower, shimo] of [['the egg given, the valley\'s story not done', { yn_egg_tsuneji: true }, '', '9,7'], ['the valley\'s story done', { yn_egg_tsuneji: true, yn_done: true }, '', ''], ['the story done, no egg given', { yn_done: true }, '', '']]) {
    await start(p, { map: 'yn.lower', x: 21, y: 18, dir: 'right', comp: 'ren', eggs: 1, flags });
    await p.evaluate(async () => { await RB.save.writeSlot(4, RB.game.s, { force: true }); });
    await p.evaluate(async () => { await RB.game.loadCampaign(4); });
    await p.waitForTimeout(1200);
    const a = await state(p);
    await p.evaluate(() => RB.world.enter('yn.shimo', 9, 8, 'up', {}));
    await p.waitForTimeout(700);
    const c = await state(p);
    ok(a.map === 'yn.lower' && a.here.join() === lower && c.here.join() === shimo, 'a save with ' + name + ': the riverbank ' + (lower || 'empty') + ', the Lower House ' + (shimo ? 'has him at ' + shimo : 'without him') + ' (' + JSON.stringify({ lower: a.here, shimo: c.here }) + ')');
  }
  allErrors.push(...errors); await p.close();
}

ok(allErrors.length === 0, 'no page errors' + (allErrors.length ? ' (' + allErrors.slice(0, 3).join(' | ') + ')' : ''));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
