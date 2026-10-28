// The Bell Without a Rope after Chapter 3 (Agnes 6457243012; Local CL-513; Cloud CC-367). In Chromium on the built game,
// with throwaway journeys after the story's end (never a real save), talking as a player does (pressed at the person,
// the automated player answering), wherever Gorō's routine has him:
//  1. the square, the rope held: his thanks, the quest done, the rope taken; talked to again: his after-chapter line,
//     nothing twice;
//  2. the inn (his tea), the quest still at Tamotsu's step: the inn's own line, then his thanks, the quest done;
//  3. the top terrace in the postgame, the rope held: the terrace's own line, then his thanks, the quest done, the rope
//     taken; talked to again: his postgame line;
//  4. no page errors.
// At each place, the restored scene's look to the lookout's tile on the square (lookroad 11,11): Gorō turns toward that
// tile as the staging reckons it from where he stands (up at the square, right at the inn, left on the top terrace) and
// stays on his own tile (Agnes 6457522523).
// Usage: node tools/build.mjs && node tests/e2e/co_bell_recover.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const errorsAll = [];
const AFTER = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, co_arrived: true, co_restored: true, ch3_done: true };
const THANKS = /you were the first to take my asking seriously/;

async function begin(p, o) {
  await p.evaluate(async (o) => {
    const s = RB.game.debugStart(o.map, o.x, o.y, { dir: 'up', edition: RB.edition.forNew(), flags: o.flags });
    s.comp = null;
    s.quests.co_main = { stage: 9, done: true, t: 1 };
    s.quests.co_bell = o.quest;
    s.seen['co.goro_first'] = true;
    if (o.rope) s.inv.co_rope = 1;
    s.world = s.world || {};
    s.world.towns = Object.assign(s.world.towns || {}, { cinder: { tick: 1, slots: { co_goro: o.slot }, leftAt: null, flags: {}, rests: 0 } });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.save.autosave = async () => {};
    RB.test.enable();
    await new Promise((r) => setTimeout(r, 800));
    RB.world.refreshActors();
    window.__said = []; window.__toasts = [];
    if (!window.__wrapped) {
      window.__wrapped = true;
      const say = RB.ui.dialogue.say, toast = RB.ui.toast;
      RB.ui.dialogue.say = function (l) { if (l) window.__said.push((l.who || '') + ': ' + (l.en || '')); return say.apply(this, arguments); };
      RB.ui.toast = function (o) { if (o && o.kind) window.__toasts.push(o.kind + ':' + (o.en || '')); return toast.apply(this, arguments); };
    }
  }, o);
}
const talk = (p, id) => p.evaluate(async (id) => { window.__said = []; await RB.test.talk(id); await RB.test.idle(); return window.__said.slice(); }, id);
// the same, recording every gesture staged on Gorō as it is cued (RB.staging.cue returns its run at once, and a turning
// gesture's facing is drawn from that run: src/engine/52_staging.js, run.dir), so a short gesture is never missed
// between frames (Local CL-516); and every tile he stands on, read at each cue and on every frame
const watched = (p, id) => p.evaluate(async (id) => {
  const n = RB.world.W.npcs.find((a) => a.id === id), runs = [], tiles = new Set(), cue = RB.staging.cue;
  let on = true;
  RB.staging.cue = function () {
    const before = n.stg && n.stg.run, r = cue.apply(this, arguments), run = n.stg && n.stg.run;
    if (run && run !== before) runs.push(run.id + (run.dir ? ':' + run.dir : ''));
    tiles.add(n.x + ',' + n.y);
    return r;
  };
  const tick = () => { if (!on) return; tiles.add(n.x + ',' + n.y); requestAnimationFrame(tick); };
  tick();
  try { window.__said = []; await RB.test.talk(id); await RB.test.idle(); } finally { on = false; RB.staging.cue = cue; }
  tiles.add(n.x + ',' + n.y);
  const P = RB.world.W.player; // (the helper stands you below him where it can)
  return { said: window.__said.slice(), runs, tiles: [...tiles], home: [n.def.x, n.def.y].join(','), pc: P.x + ',' + P.y };
}, id);
const state = (p) => p.evaluate(() => { const s = RB.game.s; return { q: s.quests.co_bell, rope: s.inv.co_rope || 0, done: window.__toasts.filter((x) => x === 'quest_done:The Bell Without a Rope').length, here: RB.world.W.npcs.filter((n) => /^co_goro/.test(n.id)).map((n) => n.id) }; });

// ---- 1. the square, the rope held ----------------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { map: 'co.village', x: 12, y: 16, flags: AFTER, quest: { stage: 1, done: false, t: 1 }, rope: 1, slot: 1 });
  const w = await watched(p, 'co_goro'), L = w.said;
  const a = await state(p);
  ok(L.some((x) => THANKS.test(x)) && a.q.done && a.rope === 0 && a.done === 1, '1 the square, the rope held: his thanks, the quest done, the rope taken (' + JSON.stringify({ L, a }) + ')');
  ok(w.runs.includes('lookroad:up') && w.tiles.length === 1 && w.tiles[0] === w.home, '1 the square: he looks up to the lookout (11,11) and keeps his tile (' + JSON.stringify(w) + ')');
  const L2 = await talk(p, 'co_goro');
  const a2 = await state(p);
  ok(L2.some((x) => /We ring the bell once at dusk now/.test(x)) && !L2.some((x) => THANKS.test(x)) && a2.done === 1 && a2.rope === 0, '1 talked to again: his after-chapter line, nothing twice (' + JSON.stringify({ L2, a2 }) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}

// ---- 2. the inn, the quest still at Tamotsu's step ------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { map: 'co.inn', x: 6, y: 7, flags: AFTER, quest: { stage: 0, done: false, t: 1 }, rope: 0, slot: 2 });
  const w = await watched(p, 'co_goro_r2'), L = w.said;
  const a = await state(p);
  ok(w.runs.includes('lookroad:right') && w.tiles.length === 1 && w.tiles[0] === w.home, '2 the inn: the look toward 11,11 turns him right, and he keeps his tile (' + JSON.stringify(w) + ')');
  ok(/Fusa's tea is always too hot/.test(L[0] || '') && L.some((x) => THANKS.test(x)) && a.q.done && a.done === 1, '2 the inn, at stage 0: the inn\'s own line, then his thanks, the quest done (' + JSON.stringify({ L, a }) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}

// ---- 3. the top terrace in the postgame, the rope held ---------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { map: 'co.terraces', x: 31, y: 5, flags: Object.assign({ postgame: true }, AFTER), quest: { stage: 1, done: false, t: 1 }, rope: 1, slot: 3 });
  const w = await watched(p, 'co_goro_r3'), L = w.said;
  const a = await state(p);
  ok(w.runs.includes('lookroad:left') && w.tiles.length === 1 && w.tiles[0] === w.home, '3 the top terrace: the look toward 11,11 turns him left, and he keeps his tile (' + JSON.stringify(w) + ')');
  ok(/you can see the whole village/.test(L[0] || '') && L.some((x) => THANKS.test(x)) && a.q.done && a.rope === 0 && a.done === 1, '3 the top terrace, postgame, the rope held: the terrace\'s own line, then his thanks, the quest done, the rope taken (' + JSON.stringify({ L, a }) + ')');
  const L2 = await talk(p, 'co_goro_r3');
  ok(L2.some((x) => /The bell carries further these days/.test(x)) && !L2.some((x) => THANKS.test(x)), '3 talked to again: his postgame line (' + JSON.stringify(L2) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}

ok(!errorsAll.length, '4 no page errors' + (errorsAll.length ? ': ' + errorsAll.slice(0, 3).join(' | ') : ''));
console.log(`\nco_bell_recover: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
