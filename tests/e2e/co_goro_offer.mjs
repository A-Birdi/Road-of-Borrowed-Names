// Gorō's first offer (Agnes 6586938396; Local CL-658, CL-659; Cloud CC-511). In Chromium on the built game, a throwaway
// journey in Chapter 3 saved and loaded through the game's own save (never a real save), talking as a player does
// (pressed at the person, the automated player choosing by the option's own words):
//  1. the first meeting: his introduction, his request, "Not right now": no quest;
//  2. talked to again (from beside him): his request only (no second introduction), turned to face you; "Not right now"
//     again; then a save and load; talked to again: his request only, "I'll find one": the quest at Tamotsu's step;
//  3. Tamotsu: his rope given; back to Gorō: the rope handed over, the bell rung, the quest done;
//  4. talked to again: the bell polishing;
//  5. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/co_goro_offer.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const CO1 = { departed: true, ch1_done: true, ch2_done: true, co_arrived: true, co_met_sayo: true };
const INTRO = /^co_goro: Ah, travellers\. I'm Gorō, keeper of the lookout/;
const ASK = 'co_goro: Traveller, would you do me a favour? Find me one good strong rope.';
const NO = 'co_goro: No matter. Whenever you like. The bell won\'t run off.';
const YES = 'co_goro: Much obliged. Tamotsu keeps rope for the water gates.';
const IDLE = 'co_goro: A bell has to be polished or its voice clouds over. Even a bell nobody rings.';

const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
await p.evaluate(async (CO1) => {
  const f = Object.assign({}, CO1);
  for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) f['enter:' + m + ':' + ev.scene] = true;
  const s = RB.game.debugStart('co.village', 12, 16, { dir: 'up', edition: RB.edition.forNew(), flags: f });
  s.comp = null;
  s.quests.co_main = { stage: 1, done: false, t: 1 };
  s.world = s.world || {};
  s.world.towns = Object.assign(s.world.towns || {}, { cinder: { tick: 1, slots: { co_goro: 1 }, leftAt: null, flags: {}, rests: 0 } });
  RB.game.settings.textSpeed = 'instant';
  RB.test.enable({ choose: (opts) => Math.max(0, opts.findIndex((o) => o.en === window.__pick)) });
  await new Promise((r) => setTimeout(r, 800));
  RB.world.refreshActors();
  window.__said = [];
  const say = RB.ui.dialogue.say;
  // each line as it is said, with which way Gorō faces then and which way you stand from him
  RB.ui.dialogue.say = function (l) {
    if (l) {
      const W = RB.world.W, n = W && W.npcs.find((a) => a.id === 'co_goro'), P = W && W.player;
      let toward = null;
      if (n && P) { const dx = P.x - n.x, dy = P.y - n.y; toward = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); }
      window.__said.push({ line: (l.who || '') + ': ' + (l.en || ''), dir: n ? n.dir : null, toward });
    }
    return say.apply(this, arguments);
  };
}, CO1);
const talk = (id, pick) => p.evaluate(async ([id, pick]) => { window.__pick = pick; window.__said = []; await RB.test.talk(id); await RB.test.idle(); return window.__said.slice(); }, [id, pick]);
// the same, pressed at him from beside him (left or right, whichever is free), so that facing you is a turn away from
// the way he stands (down)
const talkBeside = (id, pick) => p.evaluate(async ([id, pick]) => {
  window.__pick = pick; window.__said = [];
  await RB.test.idle();
  const W = RB.world.W, n = W.npcs.find((a) => a.id === id);
  const side = [[-1, 'right'], [1, 'left']].map(([dx, dir]) => ({ x: n.x + dx, y: n.y, dir }))
    .find((f) => !RB.maps.blockedStatic(W.map, f.x, f.y) && !RB.maps.exitAt(W.map, f.x, f.y) && !W.npcs.some((a) => a.x === f.x && a.y === f.y));
  if (!side) throw new Error('no free tile beside ' + id);
  const before = n.dir;
  RB.test.place(side.x, side.y, side.dir);
  RB.world.interact();
  await RB.test.idle();
  return { said: window.__said.slice(), side, before };
}, [id, pick]);
const lines = (L) => L.map((x) => x.line);
const state = () => p.evaluate(() => { const s = RB.game.s, q = s.quests.co_bell; return { q: q ? (q.done ? 'done' : q.stage) : 'none', seen: !!s.seen['co.goro_first'], rope: s.inv.co_rope || 0, rung: !!s.flags.co_bell_rung, map: s.map, mode: RB.game.mode() }; });

// ---- 1. the first meeting ------------------------------------------------------------------------------------------
{
  const L = await talk('co_goro', 'Not right now.');
  const a = await state();
  ok(INTRO.test(lines(L)[0] || '') && lines(L).slice(-2).join('|') === [ASK, NO].join('|') && a.q === 'none' && a.seen, '1 the first meeting: his introduction, his request, "Not right now": no quest ' + flat({ L: lines(L), a }));
}

// ---- 2. asked again, declined again; a save and load; asked again, taken ---------------------------------------------
{
  const B = await talkBeside('co_goro', 'Not right now.'), L = B.said;
  const a = await state();
  ok(flat(lines(L)) === flat([ASK, NO]) && a.q === 'none', '2 talked to again: his request only, no second introduction; "Not right now" again, still no quest ' + flat({ L: lines(L), a }));
  const asked = L.find((x) => x.line === ASK);
  ok(asked && B.before === 'down' && asked.toward !== 'down' && asked.dir === asked.toward, '2 pressed at him from beside him: he turns to face you as he asks again ' + flat({ asked, side: B.side, before: B.before }));
  await p.evaluate(async () => { await RB.save.manualSave(1); await RB.game.loadCampaign(1, 'manual'); await RB.test.idle(); });
  const a0 = await state();
  ok(a0.map === 'co.village' && a0.mode === 'world' && a0.q === 'none' && a0.seen, '2 declined twice, the save loaded: the square, no quest, the first meeting over ' + flat(a0));
  const L2 = await talk('co_goro', 'I\'ll find one.');
  const a2 = await state();
  ok(flat(lines(L2)) === flat([ASK, YES]) && a2.q === 0, '2 after the load, asked again: his request only; "I\'ll find one": his thanks, the quest at Tamotsu\'s step ' + flat({ L2: lines(L2), a2 }));
}

// ---- 3. Tamotsu's rope, and the bell ---------------------------------------------------------------------------------
{
  const T = await talk('co_tamotsu');
  const a = await state();
  ok(lines(T).some((x) => /I've a spare for the water gates/.test(x)) && a.rope === 1 && a.q === 1, '3 Tamotsu: his rope given, the quest at 1 ' + flat({ a }));
  const R = await talk('co_goro');
  const a2 = await state();
  ok(lines(R).some((x) => /Oh — a rope!/.test(x)) && a2.q === 'done' && a2.rung && a2.rope === 0, '3 back to Gorō: the rope handed over, the bell rung, the quest done ' + flat({ a2 }));
}

// ---- 4. the bell polishing -------------------------------------------------------------------------------------------
{
  const L = await talk('co_goro');
  ok(flat(lines(L)) === flat([IDLE]), '4 talked to again: the bell polishing ' + flat(lines(L)));
}

ok(!errors.length, '5 no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
await ctx.close();
console.log(`\nco_goro_offer: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
