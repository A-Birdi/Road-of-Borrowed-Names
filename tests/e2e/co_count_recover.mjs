// Thirty of What? after Chapter 3 (Agnes 6458259496; Local CL-515; Cloud CC-367 §2, CC-370). In Chromium on the built
// game, with throwaway journeys after the story's end (never a real save), talking as a player does (pressed at the
// person, the automated player answering):
//  1. one journey, the quest at Sayo's step: Sayo on the square (her step, and none of her festival-eve lines), Kotarō
//     on the terraces where his routine has him (its own line, then his step), Nobu at the pottery (the slip: the quest
//     done once, the cup once); each talked to again: their ordinary after-chapter lines, nothing twice;
//  2. the postgame, the slip's step, the clay swallow not yet given: Nobu gives the swallow first, then takes the slip;
//  3. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/co_count_recover.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const errorsAll = [];
const AFTER = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, co_arrived: true, co_restored: true, ch3_done: true, co_kiln_open: true, co_kiln_done: true };
const EVE = /calling everyone to the square at dusk|travelling performer wrote|If there's a performer here|The only worry is the lack of rain|fifty-two seats|laying out the seats/;

async function begin(p, o) {
  await p.evaluate(async (o) => {
    const s = RB.game.debugStart(o.map, o.x, o.y, { dir: 'up', edition: RB.edition.forNew(), flags: o.flags });
    s.comp = null;
    s.quests.co_main = { stage: 9, done: true, t: 1 };
    s.quests.co_count = o.quest;
    s.seen['co.nobu'] = true;
    if (o.swallow) { s.discovery = s.discovery || {}; s.discovery.keepsakes = Object.assign(s.discovery.keepsakes || {}, { clay_swallow: { t: 1 } }); }
    s.world = s.world || {};
    s.world.towns = Object.assign(s.world.towns || {}, { cinder: { tick: 1, slots: { co_kotaro: o.kotaro || 1 }, leftAt: null, flags: {}, rests: 0 } });
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
const go = (p, map, x, y) => p.evaluate(async ([map, x, y]) => { await RB.test.go(map, x, y, 'up'); await new Promise((r) => setTimeout(r, 300)); return RB.world.W.map.id; }, [map, x, y]);
const state = (p) => p.evaluate(() => { const s = RB.game.s; return { q: s.quests.co_count, cup: s.inv.co_ash_cup || 0, swallow: !!(s.discovery && s.discovery.keepsakes && s.discovery.keepsakes.clay_swallow), done: window.__toasts.filter((x) => x === 'quest_done:Thirty of What?').length }; });

// ---- 1. one journey after Chapter 3: Sayo, Kotarō on the terraces, Nobu --------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { map: 'co.village', x: 28, y: 24, flags: AFTER, quest: { stage: 0, done: false, t: 1 }, swallow: true, kotaro: 2 });
  const L1 = await talk(p, 'co_sayo');
  const a1 = await state(p);
  ok(L1.some((x) => /Thirty sake flasks\?/.test(x)) && !L1.some((x) => EVE.test(x)) && a1.q.stage === 1, '1 Sayo on the square: her step, and none of her festival-eve lines (' + JSON.stringify({ L1, q: a1.q }) + ')');
  const m2 = await go(p, 'co.terraces', 24, 26);
  const L2 = await talk(p, 'co_kotaro_r2');
  const a2 = await state(p);
  ok(m2 === 'co.terraces' && /white goat got out again/.test(L2[0] || '') && L2.some((x) => /Sayo's message\?/.test(x)) && a2.q.stage === 2, '1 Kotarō on the terraces: its own line, then his step (' + JSON.stringify({ m2, L2, q: a2.q }) + ')');
  const m3 = await go(p, 'co.pottery', 5, 7);
  const L3 = await talk(p, 'co_nobu');
  const a3 = await state(p);
  ok(m3 === 'co.pottery' && L3.some((x) => /Clear as day\. Thirty small plates/.test(x)) && a3.q.done && a3.cup === 1 && a3.done === 1, '1 Nobu at the pottery: the slip; the quest done once, the cup once (' + JSON.stringify({ m3, L3, a3 }) + ')');
  const L4 = await talk(p, 'co_nobu');
  const a4 = await state(p);
  ok(L4.length >= 1 && !L4.some((x) => /Clear as day/.test(x)) && a4.cup === 1 && a4.done === 1, '1 Nobu again: his after-chapter line, nothing twice (' + JSON.stringify({ L4, a4 }) + ')');
  await go(p, 'co.village', 28, 24);
  const L5 = await talk(p, 'co_sayo');
  ok(L5.some((x) => /I kept the seats at fifty-two/.test(x)) && !L5.some((x) => /Thirty sake flasks/.test(x)), '1 Sayo again: her after-chapter line (' + JSON.stringify(L5) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}

// ---- 2. the postgame, the slip's step, the clay swallow not yet given ---------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { map: 'co.pottery', x: 5, y: 7, flags: Object.assign({ postgame: true }, AFTER), quest: { stage: 2, done: false, t: 1 }, swallow: false });
  const L1 = await talk(p, 'co_nobu');
  const a1 = await state(p);
  const L2 = await talk(p, 'co_nobu');
  const a2 = await state(p);
  ok(L1.some((x) => /clay|swallow/i.test(x)) && a1.swallow && !a1.q.done && L2.some((x) => /Clear as day/.test(x)) && a2.q.done && a2.cup === 1 && a2.done === 1,
    '2 the postgame, the swallow not yet given: Nobu gives it first, then takes the slip (' + JSON.stringify({ L1, a1, L2, a2 }) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}

ok(!errorsAll.length, '3 no page errors' + (errorsAll.length ? ': ' + errorsAll.slice(0, 3).join(' | ') : ''));
console.log(`\nco_count_recover: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
