// QA-206: Ren's Archive banter about the gravestone (sa.b_ren3, "The gravestone Kasane carved. The lettering was
// good.") waits until the meeting with Kasane is finished (Agnes 6943588129; Local CL-887, CL-889; Cloud CC-640). In
// Chromium on the built game, on throwaway journeys in a fresh browser context each (never a real save), talking to
// Ren the game's own way (RB.game.companionTalk, what OK facing your companion calls), each talk's scene recorded.
// Every journey is twelve chapters, with the two journey reflections (after chapters 2 and 4) already had, as on a
// journey that reached the Archive (a pending one takes a talk first: src/engine/58_companion.js).
// Played (from the Archive's camp: the journey to it made directly; then the game's own map transitions, so each
// room's own first-entry scene plays; choices picked by the test helper, readings answered by it):
//  P1. Ren: into the Archive Gate, where the gate's first scene and the grave scene it calls with Ren play (the grave
//      read), then the twelve-chapter hushed voice at the gate (Ren's name read by the helper); two talks:
//      neither is the gravestone (the reported order took it second); into the Reading Room, where the meeting with
//      Kasane plays; at Ren's question at the gravestone line ("I saw the stone by the gate. Did you carve it?"),
//      after the meeting's marker is set and before it ends, the journey saved through the game's own save (slot 2);
//      after the meeting: the next talk is the gravestone; saved and loaded through the game's own save and load: the
//      gravestone again (the only Ren banter there); the mid-meeting save loaded (the state CL-889 characterized: the
//      marker set, the scene not seen, Kasane still in the room): a talk is not the gravestone; Kasane talked to, the
//      meeting plays again to its end: the next talk is the gravestone.
// Synthetic (at the gate, flags and scenes seen set directly, the gate's scenes and the hushed voice already had,
// every other Ren banter already heard so the gravestone comes first whenever it is offered; each also saved and
// loaded through the game's own save and load, the gravestone marked unheard again first, for the same reason):
//  S1 the grave read, not met: not the gravestone; S2 the meeting's marker set, the scene not finished: not the
//  gravestone; S3 the meeting finished: the gravestone; S4 after the Hush: Ren's after-the-Hush banter (sa.b_ren4).
// Every talk's scenes are printed, to compare with the parent's page (RB_PAGE); no page errors.
// Usage: node tools/build.mjs && node tests/e2e/ren_banter_meet.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const J = JSON.stringify;
const REN3 = 'sa.b_ren3';
const BASE = ['departed', 'ch1_done', 'ch2_done', 'ch3_done', 'ch4_done', 'ch5_done', 'sa_arrived'];

async function start(p, o) {
  await p.evaluate(async ({ BASE, o }) => {
    const f = {};
    for (const k of BASE.concat(o.flags || [])) f[k] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.suzuSpeech = 'standard';
    const s = RB.game.debugStart(o.map, o.x, o.y, { comp: o.comp, dir: 'up', edition: 2, flags: f });
    s.quests.sa_main = { stage: 1, done: false, t: 1 };
    for (const k of o.seen || []) s.seen[k] = true;
    // the camp's own first scene already seen (a played lane starts there and walks on)
    s.seen['sa.camp_first'] = true; s.flags['enter:sa.camp:sa.camp_first'] = true;
    // the two journey reflections (after chapters 2 and 4) already had, as on a journey that reached the Archive,
    // so a talk goes to the banter list (src/engine/58_companion.js: a pending topic takes the talk first)
    const talkRec = RB.company && s.company ? s.company.talk : null;
    if (talkRec) for (const id of ['reflect:travel', 'reflect:keep']) talkRec[id] = { st: 'answered', choice: null, t: 1 };
    // synthetic lanes: the hushed voice at the gate (twelve chapters) already called back, so it does not play again
    if (o.voiceBack) { for (const k of ['sa2_hushed', 'sa2_voice_back', 'enter:sa.gate:sa.gate_first', 'enter:sa.gate:sa2.hushed']) s.flags[k] = true; s.seen['sa2.hushed'] = true; }
    if (o.heardOthers) for (const bb of RB.content.banter) if (bb.comp === o.comp && bb.scene !== 'sa.b_ren3') s.seen[bb.scene] = true;
    RB.test.enable({ choose: () => 0 });
    // every scene started, in order
    window.__runs = [];
    const run0 = RB.script.run;
    RB.script.run = function (id) { window.__runs.push(id); return run0.apply(this, arguments); };
    // a talk to the companion the game's own way: the scenes it started
    window.__talk = async () => {
      await RB.test.idle(30000);
      const n0 = window.__runs.length;
      RB.game.companionTalk();
      await RB.test.wait(60);
      await RB.test.idle(30000);
      return window.__runs.slice(n0);
    };
    window.__state = () => {
      const st = RB.game.s, W = RB.world.W;
      return { map: st.map, mode: RB.game.mode(), found: !!st.flags.sa_ushio_found, met: !!st.flags.sa_met_kasane, left: !!st.flags.sa_kasane_left, seenMeet: !!st.seen['sa.kasane_meet'], heard3: !!st.seen['sa.b_ren3'], kasane: !!(W && W.npcs && W.npcs.some((n) => n.id === 'kasane')) };
    };
    // mid-meeting: at Ren's question about the stone, the state read and the journey saved (slot 2)
    window.__mid = null;
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = async function (l) {
      if (l && o.mid && !window.__mid && /^I saw the stone by the gate\. Did you carve it\?/.test(l.en || '')) {
        try { window.__mid = window.__state(); await RB.save.manualSave(2); window.__mid.saved = true; } catch (e) { window.__mid = { error: String(e && e.stack || e).slice(0, 300) }; }
      }
      return say.apply(this, arguments);
    };
  }, { BASE, o });
}
const talk = (p) => p.evaluate(() => window.__talk());
const state = (p) => p.evaluate(() => window.__state());
const saveLoad = (p, slot) => p.evaluate(async (slot) => {
  await RB.test.idle();
  await RB.save.manualSave(slot);
  await RB.game.loadCampaign(slot, 'manual');
  await new Promise((r) => setTimeout(r, 900));
  await RB.test.idle();
  return RB.game.s.map;
}, slot);
const loadOnly = (p, slot) => p.evaluate(async (slot) => {
  await RB.test.idle();
  const list = await RB.save.list();
  if (!list[slot - 1] || list[slot - 1].empty) return { missing: true };
  await RB.game.loadCampaign(slot, 'manual');
  await new Promise((r) => setTimeout(r, 900));
  await RB.test.idle();
  return { map: RB.game.s.map, mode: RB.game.mode() };
}, slot);
async function fresh() { const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 757 } }); return { p, errors }; }

// ---- P1, played ----
{
  const { p, errors } = await fresh();
  await start(p, { comp: 'ren', map: 'sa.camp', x: 13, y: 3, mid: true });
  await p.evaluate(async () => { await new Promise((r) => setTimeout(r, 1200)); await RB.test.go('sa.gate', 14, 19, 'up'); });
  const g = await state(p);
  const gateRuns = await p.evaluate(() => window.__runs.slice());
  const gs = await p.evaluate(() => ({ grave: !!RB.game.s.seen['sa.ushio_grave'], quest: RB.game.s.quests.ren_ushio || null }));
  ok(g.found && !g.met && gateRuns[0] === 'sa.gate_first' && gs.grave && gs.quest && gs.quest.stage === 1, 'P1 the gate\'s first scene played, and the grave scene it calls with Ren: the grave read, Kasane not met ' + J({ g, gateRuns, gs }));
  const t1 = await talk(p), t2 = await talk(p);
  console.log('     P1 at the gate, talks ' + J([t1, t2]));
  ok(!t1.includes(REN3) && !t2.includes(REN3) && t1.includes('sa.b_ren1'), 'P1 the grave read, not met: two talks, neither the gravestone ' + J([t1, t2]));
  await p.evaluate(async () => { await RB.test.go('sa.reading', 14, 17, 'up'); });
  const mid = await p.evaluate(() => window.__mid);
  const m = await state(p);
  console.log('     P1 mid-meeting ' + J(mid) + ' after ' + J(m));
  ok(mid && mid.saved && mid.met && !mid.seenMeet && m.met && m.left && m.seenMeet, 'P1 the meeting played: its marker set mid-scene (saved there), finished after ' + J({ mid, m }));
  const t3 = await talk(p);
  ok(t3.includes(REN3), 'P1 the meeting finished: the next talk is the gravestone ' + J(t3));
  await saveLoad(p, 1);
  const t4 = await talk(p);
  ok(t4.includes(REN3), 'P1 saved and loaded: the gravestone (the only Ren banter there) ' + J(t4));
  const lm = await loadOnly(p, 2);
  const l = await state(p);
  console.log('     P1 the mid-meeting save loaded ' + J(lm) + ' ' + J(l));
  const t5 = await talk(p);
  ok(l.met && !l.seenMeet && !l.left && l.kasane && lm.mode === 'world' && !t5.includes(REN3), 'P1 the mid-meeting save loaded (marker set, scene not seen, Kasane in the room): the talk is not the gravestone ' + J({ l, t5 }));
  await p.evaluate(async () => { await RB.test.talk('kasane'); });
  const k = await state(p);
  const t6 = await talk(p);
  ok(k.seenMeet && k.left && t6.includes(REN3), 'P1 Kasane talked to, the meeting played to its end: the next talk is the gravestone ' + J({ k, t6 }));
  ok(errors.length === 0, 'P1 no page errors ' + J(errors.slice(0, 3)));
  await p.context().close();
}

// ---- synthetic lanes ----
const LANES = [
  { n: 'S1 the grave read, not met', o: { flags: ['sa_ushio_found'], seen: ['sa.gate_first'] }, want: (t) => !t.includes(REN3) },
  { n: 'S2 the meeting\'s marker set, the scene not finished', o: { flags: ['sa_ushio_found', 'sa_met_kasane'], seen: ['sa.gate_first'] }, want: (t) => !t.includes(REN3) },
  { n: 'S3 the meeting finished', o: { flags: ['sa_ushio_found', 'sa_met_kasane', 'sa_kasane_left'], seen: ['sa.gate_first', 'sa.kasane_meet'] }, want: (t) => t.includes(REN3) },
  { n: 'S4 after the Hush', o: { flags: ['sa_ushio_found', 'sa_met_kasane', 'sa_kasane_left', 'sa_hush_down'], seen: ['sa.gate_first', 'sa.kasane_meet'] }, want: (t) => !t.includes(REN3) && t.includes('sa.b_ren4') },
];
for (const L of LANES) {
  const { p, errors } = await fresh();
  await start(p, Object.assign({ comp: 'ren', map: 'sa.gate', x: 14, y: 19, heardOthers: true, voiceBack: true }, L.o));
  await p.evaluate(async () => { await new Promise((r) => setTimeout(r, 1200)); await RB.test.idle(); });
  const t = await talk(p);
  ok(L.want(t), L.n + ': ' + J(t));
  // the gravestone unheard again before the save, so that after the load it still comes first whenever it is offered
  await p.evaluate(() => { delete RB.game.s.seen['sa.b_ren3']; });
  await saveLoad(p, 1);
  const u = await talk(p);
  ok(L.want(u), L.n + ', saved and loaded: ' + J(u));
  ok(errors.length === 0, L.n + ': no page errors ' + J(errors.slice(0, 3)));
  await p.context().close();
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
