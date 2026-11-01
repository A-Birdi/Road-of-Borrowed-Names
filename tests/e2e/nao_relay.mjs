// Nao's relay after the story (Agnes 6556347031, 6556470001; Local CL-608; Cloud CC-444, CC-445). In Chromium on the
// built game, on throwaway journeys (never a real save), with Nao, after the story: Sakichi and Sue talked to through
// the world's own interact, maps left through their own exits (the call stepping onto one makes) and the Map's Travel
// list, saves made and loaded through the game's own save and load:
//  1. the letter given to Nao (to Hiro): no reply on talking to Sakichi again, after a talk with Sue, in and out of the
//     station house, or after a save there loaded; then out to the Barrier and back: due, the reply once (from Hiro,
//     "Six days"), and not again on the next way round;
//  2. the town, the station house, a save there loaded, the town: still pending; the Fog Slope, a save there loaded,
//     then the town: due, the reply once;
//  3. away by the Map's Travel list, and back: due;
//  4. "Not now": nothing set, there or after the Barrier and back; Nao asks again;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/nao_relay.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const DONE = ['departed', 'ch1_done', 'ch2_done', 'mb1_done', 'mb2_done', 'ch3_done', 'ch4_done', 'kr_done', 'ch5_done', 'ko_done', 'cr_called', 'cr_done', 'cr_delivered', 'cr_passed',
  'yn_called', 'yn_done', 'ch6_done', 'mp_sobe_met', 'postgame', 'ngp_offered', 'cr_st6', 'cr_barrier_seen'];

// a journey after the story in Kirishita with Nao; every map's once-only arrival scene already seen but the relay's own
async function at(p) {
  await p.evaluate(async (DONE) => {
    const f = {};
    for (const k of DONE) f[k] = true;
    const s = RB.game.debugStart('cr.kirishita', 8, 11, { comp: 'nao', dir: 'down', edition: RB.edition.forNew(), flags: f });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) if (ev.scene !== 'rt.nao_due') s.flags['enter:' + m + ':' + ev.scene] = true;
    for (const id of Object.keys(RB.content.places)) s.travel[id] = true;
    RB.game.settings.textSpeed = 'instant';
    window.__pick = 0;
    RB.test.enable({ choose: () => window.__pick });
    await new Promise((r) => setTimeout(r, 900));
    RB.world.refreshActors();
    window.__said = [];
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) { if (l) window.__said.push(l.en || ''); return say.apply(this, arguments); };
  }, DONE);
}
const state = (p) => p.evaluate(() => { const s = RB.game.s, f = s.flags; return { map: s.map, sent: !!f.rt_nao_sent, away: !!f.rt_nao_away, due: !!f.rt_nao_due, told: !!f.rt_nao_told, to: s.vars.rt_nao_to || null }; });
const talk = (p, id) => p.evaluate(async (id) => { window.__said = []; await RB.test.talk(id); await RB.test.idle(); await new Promise((r) => setTimeout(r, 300)); await RB.test.idle(); return window.__said.slice(); }, id);
// through this map's own exit to `to`: the transition stepping onto it makes (src/engine/50_world.js)
const out = (p, to) => p.evaluate(async (to) => {
  await RB.test.idle();
  const s = RB.game.s;
  const ex = RB.world.W.map.exits.find((e) => e.to === to && (!e.if || RB.state.test(s, e.if)));
  if (!ex) throw new Error('no exit to ' + to + ' from ' + RB.world.W.map.id);
  await RB.game.transition(ex.to, ex.tx, ex.ty, ex.dir || 'down', { sp: ex.sp });
  await RB.test.idle();
  await new Promise((r) => setTimeout(r, 300));
  await RB.test.idle();
  return RB.world.W.map.id;
}, to);
// saved through the game's own save, and loaded through its own load
const saveLoad = (p) => p.evaluate(async () => {
  await RB.test.idle();
  await RB.save.manualSave(1);
  await RB.game.loadCampaign(1, 'manual');
  await new Promise((r) => setTimeout(r, 800));
  await RB.test.idle();
  return RB.world.W.map.id;
});
const reply = (said) => said.some((x) => /There's a reply for you too/.test(x));

// 1. sent; still pending there; the Barrier and back
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p);
  const t0 = await talk(p, 'cr_sakichi');
  const s0 = await state(p);
  const t1 = await talk(p, 'cr_sakichi');
  const t2 = await talk(p, 'cr_sue');
  const s1 = await state(p);
  ok(s0.sent && s0.to === 'hiro' && !s0.due && !s0.away && !reply(t1) && !s1.due && !s1.away && t0.some((x) => /Got anything to send/.test(x)),
    '1 the letter given to Nao; Sakichi again, then Sue: no reply, not due ' + flat({ s0, s1, t1: t1.slice(0, 2) }));
  const m1 = [await out(p, 'cr.kirishita_inn'), await out(p, 'cr.kirishita')];
  const t3 = await talk(p, 'cr_sakichi');
  const s2 = await state(p);
  ok(m1[0] === 'cr.kirishita_inn' && m1[1] === 'cr.kirishita' && !reply(t3) && !s2.due && !s2.away, '1 in and out of the station house: no reply ' + flat({ m1, s2 }));
  const m2 = await saveLoad(p);
  const t4 = await talk(p, 'cr_sakichi');
  const s3 = await state(p);
  ok(m2 === 'cr.kirishita' && !reply(t4) && !s3.due && !s3.away, '1 a save there, loaded, then Sakichi: no reply ' + flat({ m2, s3 }));
  const m3 = [await out(p, 'cr.barrier')];
  const s4 = await state(p);
  m3.push(await out(p, 'cr.kirishita'));
  const s5 = await state(p);
  const t5 = await talk(p, 'cr_sakichi');
  const t6 = await talk(p, 'cr_sakichi');
  const m4 = [await out(p, 'cr.barrier'), await out(p, 'cr.kirishita')];
  const t7 = await talk(p, 'cr_sakichi');
  const s6 = await state(p);
  ok(m3[0] === 'cr.barrier' && s4.away && !s4.due && m3[1] === 'cr.kirishita' && s5.due && !s5.told, '1 out to the Barrier (away recorded) and back: due ' + flat({ m3, s4, s5 }));
  ok(reply(t5) && t5.some((x) => /From Hiro/.test(x)) && t5.some((x) => /Six days/.test(x)) && !reply(t6) && !reply(t7) && s6.told && m4[1] === 'cr.kirishita',
    '1 the reply once, from Hiro, and not again, nor on the next way round ' + flat({ t5, t6: t6.slice(0, 2), t7: t7.slice(0, 2) }));
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

// 2. the town, the station house, a save there loaded, the town; then the Fog Slope, a save there loaded, the town
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p);
  await talk(p, 'cr_sakichi');
  const m1 = [await out(p, 'cr.kirishita_inn'), await saveLoad(p), await out(p, 'cr.kirishita')];
  const t1 = await talk(p, 'cr_sakichi');
  const s1 = await state(p);
  ok(flat(m1) === flat(['cr.kirishita_inn', 'cr.kirishita_inn', 'cr.kirishita']) && s1.sent && !s1.due && !s1.away && !reply(t1), '2 the town, the station house, a save there loaded, the town: still pending ' + flat({ m1, s1 }));
  const m2 = [await out(p, 'cr.leg5'), await saveLoad(p)];
  const s2 = await state(p);
  m2.push(await out(p, 'cr.kirishita'));
  const s3 = await state(p);
  const t2 = await talk(p, 'cr_sakichi');
  const t3 = await talk(p, 'cr_sakichi');
  ok(flat(m2) === flat(['cr.leg5', 'cr.leg5', 'cr.kirishita']) && s2.away && !s2.due && s3.due && reply(t2) && t2.some((x) => /From Hiro/.test(x)) && !reply(t3),
    '2 the Fog Slope, a save there loaded, then the town: due, the reply once ' + flat({ m2, s2, s3 }));
  ok(!errors.length, '2 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

// 3. away by the Map's Travel list
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p);
  await talk(p, 'cr_sakichi');
  const tr = await p.evaluate(async () => {
    await RB.test.idle();
    RB.ui.menu.open('map');
    await new Promise((r) => setTimeout(r, 600));
    const btn = document.querySelector('[data-go="lanternfall"]') || document.querySelector('[data-go]:not([data-go="cloudroad"])');
    const go = btn && btn.dataset.go;
    if (btn) btn.click();
    await new Promise((r) => setTimeout(r, 1500));
    await RB.test.idle();
    return { go, map: RB.world.W.map.id };
  });
  const s1 = await state(p);
  await p.evaluate(async () => { await RB.game.transition('cr.barrier', 1, 12, 'left'); await RB.test.idle(); });
  const m = await out(p, 'cr.kirishita');
  const s2 = await state(p);
  const t = await talk(p, 'cr_sakichi');
  ok(tr.go && !/^cr\./.test(tr.map) && s1.away && !s1.due && m === 'cr.kirishita' && s2.due && reply(t), '3 away by the Map\'s Travel list, and back: due, the reply ' + flat({ tr, s1, s2 }));
  ok(!errors.length, '3 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

// 4. "Not now"
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p);
  await p.evaluate(() => { window.__pick = 1; });
  const t0 = await talk(p, 'cr_sakichi');
  const s0 = await state(p);
  const m = [await out(p, 'cr.barrier'), await out(p, 'cr.kirishita')];
  const s1 = await state(p);
  await p.evaluate(() => { window.__pick = 1; });
  const t1 = await talk(p, 'cr_sakichi');
  ok(t0.some((x) => /The relay runs every morning/.test(x)) && !s0.sent && !s0.away && !s1.sent && !s1.away && !s1.due && m[1] === 'cr.kirishita' && t1.some((x) => /Got anything to send/.test(x)) && !reply(t1),
    '4 "Not now": nothing set, there or after the Barrier and back; Nao asks again ' + flat({ s0, s1, t1: t1.slice(0, 2) }));
  ok(!errors.length, '4 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

console.log(`\nnao_relay: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
