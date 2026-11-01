// Nao's relay after the story (Agnes 6556347031, 6556470001; Local CL-608; Cloud CC-444, CC-445). Nao runs a letter
// of yours down the relay and the reply is waiting "next time", but Kirishita's arrival events run again after every
// scene, so the reply was due the moment the letter went. Now leaving is recorded (rt_nao_away) on entering anywhere
// but Kirishita (its station house is Kirishita) once the letter has gone, and the reply is due on coming to Kirishita
// after that. With synthetic campaigns only: the real scene runner (the dialogue stubbed, each task answered by the
// test), the game's own arrival events and map-entry event, and saves round-tripped through the save's own migration:
//  1. the arrival event as agreed;
//  2. straight after sending, still pending: Sakichi again, another scene there, a save there loaded; the station
//     house in and out; the town, the station house, a save there loaded, the town;
//  3. out and back (the Fog Slope, the Barrier, a journey elsewhere): due once, then the reply once, and not again;
//  4. a save written away and loaded, then Kirishita: due once; a save written there, loaded, then out and back: due;
//  5. "Not now", and a send that failed: nothing set, there or away, and Nao asks again;
//  6. the three recipients and the station-address line, the new way round;
//  7. saves from before: sent and not yet due, loaded there or away; due already; told already;
//  8. Elsewhere's el_away as before, and neither listener sets the other's flag;
//  no scene ended on an error from the runner.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);

  // ---- a minimal stage (as tests/unit/returns.test.mjs) ----------------------------------------------------------------
  let lines = [], forge = {}, choice = 0, fail = {};
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async () => choice;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.notice = () => {};
  RB.ui.shake = () => {};
  RB.ui.fade = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.world.emote = () => {};
  RB.game.afterScene = () => {};
  RB.world.W = RB.world.W || {};
  RB.game.inBattle = () => false;
  RB.game.transition = async () => {};
  RB.save.autosave = async () => {};
  if (RB.staging) RB.staging.walkTo = async () => {};
  RB.challenge.run = async (id) => { const s = RB.game.G.s; if (forge[id] !== undefined) s.vars._forge = forge[id]; return { ok: !fail[id] }; };
  const DONE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true, mp_sobe_met: true,
    postgame: true, ngp_offered: true, cr_st6: true, yn_called: true, cr_barrier_seen: true, el_seen: true };
  let s;
  const use = (st) => { s = st; RB.game.G.s = st; RB.game.s = st; RB.world.W.map = { id: st.map, def: C.maps[st.map] }; return st; };
  const fresh = (o = {}) => {
    const st = S.newCampaign({ edition: 2 });
    st.id = 'nao-relay-test'; st.map = 'cr.kirishita'; st.comp = o.comp === undefined ? 'nao' : o.comp;
    st.player.name = 'Haru'; st.player.nameJp = 'ハル';
    st.learn.profile = 'E';
    Object.assign(st.flags, DONE, o.flags || {});
    st.vars = Object.assign({}, o.vars || {});
    return use(st);
  };
  // the runner's own error log (src/engine/70_script.js logs a scene that ends on an error), and anything thrown
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };
  const run = async (id, o = {}) => { lines = []; choice = o.choice || 0; forge = o.forge || {}; fail = o.fail || {}; try { await RB.script.run(id); } catch (e) { errors.push(id + ': ' + String((e && e.message) || e)); } return lines; };
  const has = (re) => lines.some((l) => re.test(l.en) || re.test(l.jp));
  const here = (map) => (C.maps[map].npcs || []).filter((n) => !n.if || S.test(s, n.if));
  const talkOf = (map, id) => { const n = here(map).find((x) => x.id === id); return n ? ((n.talk || []).find((x) => !x.if || S.test(s, x.if)) || {}).scene : null; };
  // the scenes the game's own arrival events start (src/engine/90_game.js runEnterEvents), each run to its end
  let started = null;
  const realRun = RB.script.run;
  RB.script.run = function (id) { const p = realRun.apply(this, arguments); if (started) started.push({ id, p }); return p; };
  const events = async () => { started = []; RB.game.runEnterEvents(); const mine = started; started = null; for (const x of mine) await x.p; return mine.map((x) => x.id); };
  // arriving on a map: the entry event (src/engine/50_world.js), then its arrival events
  const go = (id) => { s.map = id; RB.world.W.map = { id, def: C.maps[id] }; RB.bus.emit('map:enter', { id }); return events(); };
  // a scene in the place you are, and the arrival events again after it, as after every scene
  const scene = async (id, o) => { await run(id, o); return events(); };
  const talk = (map, id, o) => scene(talkOf(map, id), o);
  // a save of the journey as it is, loaded: the state the save's own migration gives back, its map entered as loading
  // does (the entry event; no arrival events until the next scene: src/engine/90_game.js loadCampaign)
  const saved = () => JSON.stringify(s);
  const loadSave = (text) => { use(RB.save.migrate(JSON.parse(text))); RB.bus.emit('map:enter', { id: s.map }); };
  const f = () => ({ sent: !!s.flags.rt_nao_sent, away: !!s.flags.rt_nao_away, due: !!s.flags.rt_nao_due, told: !!s.flags.rt_nao_told });
  const pending = () => s.flags.rt_nao_sent && !s.flags.rt_nao_due && talkOf('cr.kirishita', 'cr_sakichi') === 'cr.sakichi_after';
  const send = (to) => scene('rt.nao_sakichi', { choice: 0, forge: { 'rt.nao_send': to || 'hiro' } });

  // 1. the arrival event
  const due = C.maps['cr.kirishita'].onEnter.filter((x) => x.scene === 'rt.nao_due');
  t.ok(due.length === 1 && due[0].if === 'ed>=2&postgame&rt_nao_sent&rt_nao_away&!rt_nao_due' && due[0].once === undefined, '1 the reply is due on arriving in Kirishita once you have been away, once ' + flat(due));

  // 2. straight after sending, still pending
  {
    fresh();
    const trace = [];
    const ran = await send();
    trace.push(['sent', ran, f()]);
    t.ok(s.flags.rt_nao_sent && s.vars.rt_nao_to === 'hiro' && !ran.includes('rt.nao_due') && pending() && !s.flags.rt_nao_away, '2 sent, and the arrival events after the scene: not due, Sakichi has nothing yet ' + flat(trace));
    trace.push(['Sakichi again', await talk('cr.kirishita', 'cr_sakichi'), f()]);
    trace.push(['Sue', await talk('cr.kirishita', 'cr_sue'), f()]);
    t.ok(pending() && !trace.some((x) => x[1].includes('rt.nao_due')), '2 Sakichi again, then another scene there (Sue): still pending ' + flat(trace.slice(1)));
    loadSave(saved());
    trace.push(['loaded there, then Sakichi', await talk('cr.kirishita', 'cr_sakichi'), f()]);
    t.ok(pending() && !s.flags.rt_nao_away && !trace[3][1].includes('rt.nao_due'), '2 a save there loaded, then a scene: still pending ' + flat(trace[3]));
    trace.push(['the station house', await go('cr.kirishita_inn'), f()]);
    trace.push(['the town', await go('cr.kirishita'), f()]);
    t.ok(pending() && !s.flags.rt_nao_away && !trace.slice(4).some((x) => x[1].includes('rt.nao_due')), '2 the station house in and out: still pending ' + flat(trace.slice(4)));
  }
  {
    fresh();
    await send();
    const trace = [['the station house', await go('cr.kirishita_inn'), f()]];
    loadSave(saved());
    trace.push(['loaded there', s.map, f()]);
    trace.push(['the town', await go('cr.kirishita'), f()]);
    t.ok(pending() && !s.flags.rt_nao_away && !trace.some((x) => Array.isArray(x[1]) && x[1].includes('rt.nao_due')), '2 the town, the station house, a save there loaded, the town: still pending ' + flat(trace));
  }

  // 3. out and back: due once, then the reply once
  for (const [out, what] of [['cr.leg5', 'the Fog Slope'], ['cr.barrier', 'the Barrier'], ['co.village', 'a journey elsewhere (Cinder Orchard)']]) {
    fresh();
    await send();
    const trace = [[out, await go(out), f()]];
    const awayOk = s.flags.rt_nao_away && !s.flags.rt_nao_due;
    trace.push(['back', await go('cr.kirishita'), f()]);
    const dueOk = trace[1][1].filter((x) => x === 'rt.nao_due').length === 1 && s.flags.rt_nao_due && talkOf('cr.kirishita', 'cr_sakichi') === 'rt.nao_reply';
    await talk('cr.kirishita', 'cr_sakichi');
    const replyOk = has(/From Hiro/) && has(/Six days/) && s.flags.rt_nao_told && talkOf('cr.kirishita', 'cr_sakichi') === 'cr.sakichi_after';
    trace.push(['again', await go(out), await go('cr.kirishita'), f()]);
    const onceOk = !trace[2][1].includes('rt.nao_due') && !trace[2][2].includes('rt.nao_due') && talkOf('cr.kirishita', 'cr_sakichi') === 'cr.sakichi_after';
    t.ok(awayOk && dueOk && replyOk && onceOk, '3 out to ' + what + ' and back: due once, the reply once (from Hiro, six days), and not again on the next way round ' + flat({ awayOk, dueOk, replyOk, onceOk, trace }));
  }

  // 4. saves written away, or there
  {
    fresh();
    await send();
    await go('cr.barrier');
    const text = saved();
    await go('cr.kirishita'); // (played on past the save, then the save loaded)
    loadSave(text);
    const trace = [['loaded at the Barrier', s.map, f()], ['Kirishita', await go('cr.kirishita'), f()]];
    const dueOk = trace[1][1].filter((x) => x === 'rt.nao_due').length === 1 && talkOf('cr.kirishita', 'cr_sakichi') === 'rt.nao_reply';
    await talk('cr.kirishita', 'cr_sakichi');
    t.ok(dueOk && has(/From Hiro/) && s.flags.rt_nao_told, '4 a save written at the Barrier and loaded, then Kirishita: due once, the reply ' + flat(trace));
  }
  {
    fresh();
    await send();
    loadSave(saved());
    const trace = [['loaded in Kirishita', s.map, f()], ['the Barrier', await go('cr.barrier'), f()], ['Kirishita', await go('cr.kirishita'), f()]];
    t.ok(!trace[0][2].away && trace[2][1].includes('rt.nao_due') && talkOf('cr.kirishita', 'cr_sakichi') === 'rt.nao_reply', '4 a save written in Kirishita after sending and loaded, then out and back: due ' + flat(trace));
  }

  // 5. "Not now", and a send that failed
  for (const [what, o] of [['"Not now"', { choice: 1 }], ['a send that failed', { choice: 0, forge: { 'rt.nao_send': 'hiro' }, fail: { 'rt.nao_send': true } }]]) {
    fresh();
    const trace = [['letter', await scene('rt.nao_sakichi', o), f()]];
    trace.push(['the Barrier', await go('cr.barrier'), f()], ['back', await go('cr.kirishita'), f()]);
    t.ok(s.flags.rt_nao_read && !s.flags.rt_nao_sent && !s.vars.rt_nao_to && !s.flags.rt_nao_away && !s.flags.rt_nao_due && !trace.some((x) => x[1].includes('rt.nao_due')) && talkOf('cr.kirishita', 'cr_sakichi') === 'rt.nao_write',
      '5 ' + what + ': nothing set, there or after the Barrier and back, and Nao asks again ' + flat(trace));
  }

  // 6. the three recipients and the station-address line
  for (const [r, re] of [['hiro', /From Hiro/], ['tsuru', /From Tsuru/], ['hisae', /From Hisae/]]) {
    fresh();
    await send(r);
    await go('cr.barrier');
    await go('cr.kirishita');
    await talk('cr.kirishita', 'cr_sakichi');
    t.ok(s.vars.rt_nao_to === r && has(re) && has(/Six days/) && !has(/came to collect it/) && s.flags.rt_nao_told, '6 to ' + r + ': the reply from them ' + flat(lines.map((l) => l.en)));
  }
  {
    fresh();
    await RB.hooks.co_note(['nao_address', 'station']);
    await send();
    await go('cr.leg5');
    await go('cr.kirishita');
    await talk('cr.kirishita', 'cr_sakichi');
    t.ok(has(/From Hiro/) && has(/came to collect it/), '6 with the forwarding address at Kirishita: Nao collects their own too ' + flat(lines.map((l) => l.en)));
  }

  // 7. saves from before this change
  {
    // sent, and saved before the arrival events ran after the scene (Agnes 6556470001): loaded in Kirishita
    fresh({ flags: { rt_nao_read: true, rt_nao_sent: true }, vars: { rt_nao_to: 'tsuru' } });
    loadSave(saved());
    const trace = [['loaded in Kirishita, then Sue', await talk('cr.kirishita', 'cr_sue'), f()], ['the Barrier', await go('cr.barrier'), f()], ['Kirishita', await go('cr.kirishita'), f()]];
    t.ok(!trace[0][1].includes('rt.nao_due') && trace[2][1].includes('rt.nao_due') && talkOf('cr.kirishita', 'cr_sakichi') === 'rt.nao_reply', '7 sent and not yet due, loaded in Kirishita: pending until out and back, then due ' + flat(trace));
  }
  {
    fresh({ flags: { rt_nao_read: true, rt_nao_sent: true }, vars: { rt_nao_to: 'tsuru' } });
    s.map = 'cr.leg5';
    loadSave(saved());
    const trace = [['loaded on the Fog Slope', s.map, f()], ['Kirishita', await go('cr.kirishita'), f()]];
    await talk('cr.kirishita', 'cr_sakichi');
    t.ok(trace[0][2].away && trace[1][1].includes('rt.nao_due') && has(/From Tsuru/), '7 sent and not yet due, loaded on the Fog Slope: due on coming to Kirishita, the reply ' + flat(trace));
  }
  {
    fresh({ flags: { rt_nao_read: true, rt_nao_sent: true, rt_nao_due: true, 'enter:cr.kirishita:rt.nao_due': true }, vars: { rt_nao_to: 'hisae' } });
    loadSave(saved());
    const before = talkOf('cr.kirishita', 'cr_sakichi');
    await talk('cr.kirishita', 'cr_sakichi');
    t.ok(before === 'rt.nao_reply' && has(/From Hisae/) && s.flags.rt_nao_told, '7 due already: Sakichi has the reply, as before ' + flat({ before }));
  }
  {
    fresh({ flags: { rt_nao_read: true, rt_nao_sent: true, rt_nao_due: true, rt_nao_told: true, 'enter:cr.kirishita:rt.nao_due': true }, vars: { rt_nao_to: 'hiro' } });
    loadSave(saved());
    const trace = [await go('cr.barrier'), await go('cr.kirishita')];
    t.ok(!s.flags.rt_nao_away && !trace.some((x) => x.includes('rt.nao_due')) && talkOf('cr.kirishita', 'cr_sakichi') === 'cr.sakichi_after', '7 told already: nothing more, and away not recorded ' + flat(trace));
  }

  // 8. Elsewhere's el_away
  {
    fresh({ flags: { el_pending: true } });
    await go('cr.barrier');
    const a = { el_away: !!s.flags.el_away, rt_nao_away: !!s.flags.rt_nao_away };
    fresh({ flags: { el_pending: true } });
    await send();
    await go('el.landing');
    const b = { el_away: !!s.flags.el_away, rt_nao_away: !!s.flags.rt_nao_away };
    fresh();
    await send();
    await go('cr.barrier');
    const c = { el_away: !!s.flags.el_away, rt_nao_away: !!s.flags.rt_nao_away };
    t.ok(a.el_away && !a.rt_nao_away && !b.el_away && b.rt_nao_away && !c.el_away && c.rt_nao_away,
      '8 a job pending in Elsewhere: away recorded on leaving for the Barrier, as before; Nao\'s only once the letter went; the landing is away for the relay, home for Elsewhere ' + flat({ a, b, c }));
  }

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
