// Late revisits and the banters that look ahead (Agnes 6558574216, 6558734019, 6558899693; Local CL-615, CL-616, CL-617;
// Cloud CC-452, CC-454). In Chromium on the built game, on throwaway journeys (never a real save), talking to the
// companion the game's own way, every other banter there already heard (so the one asked about comes first whenever it is
// offered), every line said recorded with the voice key the voicebank gives it:
//  1. Saltglass with Nao, twelve chapters: after the boss with Manybridge ahead, not "Cinder Orchard next"; once
//     Manybridge is behind you, it plays as before (its two lines, their keys); after the story, not;
//  2. Saltglass with Suzu, six chapters: after the boss, her "Cinder Orchard next" as before; arrived in Cinder Orchard, not;
//  3. Cinder Orchard after the story: Nao's and Ren's fifth not played; Mio's as before;
//  4. Snowbell after the story: Nao's fifth and the bench not played; the bench with Lanternfall arrived but Akari not
//     met, as before;
//  every talk went to the banter list: after the story, its ending conversation already had and the journey
//  reflections heard, so no waiting conversation takes it;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/banter_guards.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const STORY = ['departed', 'ch1_done', 'sg_boss_done', 'ch2_done', 'mb1_done', 'mb2_done', 'co_arrived', 'ch3_done', 'sb_arrived', 'sb_lamp_lit', 'ch4_done', 'kr_done', 'lf_arrived', 'ch5_done', 'ko_done', 'cr_done', 'yn_done', 'ch6_done', 'postgame'];

// on `map` with `comp`, edition `ed`, the flags, seen scenes and quests given; then the companion talked to, the game's
// own way; the scene it starts and the lines said
async function talk(p, o) {
  return p.evaluate(async (o) => {
    const f = {};
    for (const k of o.flags) f[k] = true;
    const s = RB.game.debugStart(o.map, o.x, o.y, { edition: o.ed, comp: o.comp, flags: f });
    RB.game.settings.textSpeed = 'instant';
    for (const k of o.seen || []) s.seen[k] = true;
    for (const [q, v] of Object.entries(o.quests || {})) RB.state.setQuest(s, q, v);
    // after the story, its ending conversation already had, as a finished journey has (no waiting Pages talk)
    if (s.flags.postgame) RB.company.memory(s, { id: 'ending:' + o.comp, kind: 'reflections', title: { jp: '{橋|はし}', en: 'x' }, pq: true, comp: o.comp });
    for (const bn of RB.content.banter) if (bn.comp === o.comp && bn.scene !== o.ask) s.seen[bn.scene] = true;
    RB.test.enable({});
    await new Promise((r) => setTimeout(r, 700));
    await RB.test.idle();
    // the two journey reflections already heard (as tests/e2e/nao_banter.mjs: they would otherwise take this talk
    // first) and none pending, set just before the talk, after the arrival has settled
    const talks = s.company.talk;
    for (const id of ['reflect:travel', 'reflect:keep']) talks[id] = { st: 'done' };
    talks._pending = null;
    const runs = [], said = [];
    const run0 = RB.script.run;
    RB.script.run = function (id) { runs.push(id); return run0.apply(this, arguments); };
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) { if (l) said.push({ who: l.who, en: l.en || '', key: l.jp ? RB.voicebank.keyOf(l.sceneId, l.jp) : null }); return say.apply(this, arguments); };
    try {
      RB.game.companionTalk();
      await new Promise((r) => setTimeout(r, 300));
      await RB.test.idle();
    } finally { RB.script.run = run0; RB.ui.dialogue.say = say; }
    return { runs, said, banter: RB.content.banter.filter((bn) => bn.comp === o.comp).map((bn) => bn.scene) };
  }, o);
}
const played = (r, ask) => r.runs[0] === ask;
// the talk went to the banter list (a banter or nothing): no waiting conversation, Pages talk or reflection, took it
const banterTalk = (r) => !r.runs[0] || r.banter.indexOf(r.runs[0]) >= 0;
const keys = (r, ask) => r.said.filter((x) => x.key && x.key.indexOf(ask + '#') === 0).map((x) => x.key);

const cases = [
  ['1 Saltglass, Nao, twelve chapters, after the boss, Manybridge ahead: not "Cinder Orchard next"', { map: 'sg.harbor', x: 19, y: 30, ed: 2, comp: 'nao', ask: 'sg.b_nao_after', flags: ['departed', 'ch1_done', 'sg_boss_done'] }, false],
  ['1 Saltglass, Nao, twelve chapters, Manybridge behind you: as before, its two lines', { map: 'sg.harbor', x: 19, y: 30, ed: 2, comp: 'nao', ask: 'sg.b_nao_after', flags: ['departed', 'ch1_done', 'sg_boss_done', 'ch2_done', 'mb1_done', 'mb2_done'] }, true, ['sg.b_nao_after#', 2]],
  ['1 Saltglass, Nao, after the story: not', { map: 'sg.harbor', x: 19, y: 30, ed: 2, comp: 'nao', ask: 'sg.b_nao_after', flags: STORY }, false],
  ['2 Saltglass, Suzu, six chapters, after the boss: as before', { map: 'sg.harbor', x: 19, y: 30, ed: 1, comp: 'suzu', ask: 'sg.b_suzu_after', flags: ['departed', 'ch1_done', 'sg_boss_done'] }, true, ['sg.b_suzu_after#', 3]],
  ['2 Saltglass, Suzu, six chapters, arrived in Cinder Orchard: not', { map: 'sg.harbor', x: 19, y: 30, ed: 1, comp: 'suzu', ask: 'sg.b_suzu_after', flags: ['departed', 'ch1_done', 'sg_boss_done', 'ch2_done', 'co_arrived'] }, false],
  ['3 Cinder Orchard after the story, Nao: the fifth not played', { map: 'co.village', x: 20, y: 20, ed: 2, comp: 'nao', ask: 'co.b_nao5', flags: STORY }, false],
  ['3 Cinder Orchard after the story, Ren: the fifth not played', { map: 'co.village', x: 20, y: 20, ed: 2, comp: 'ren', ask: 'co.b_ren5', flags: STORY }, false],
  ['3 Cinder Orchard after the story, Mio: her fifth as before', { map: 'co.village', x: 20, y: 20, ed: 2, comp: 'mio', ask: 'co.b_mio5', flags: STORY }, true, ['co.b_mio5#', 2]],
  ['4 Snowbell after the story, Nao: the fifth not played', { map: 'sb.road', x: 20, y: 13, ed: 2, comp: 'nao', ask: 'sb.bn_nao5', flags: STORY }, false],
  ['4 Snowbell after the story, Nao: the bench not played', { map: 'sb.road', x: 20, y: 13, ed: 2, comp: 'nao', ask: 'sb.bn_nao4', flags: STORY, seen: ['sb.path_bench'], quests: { lf_akari: 'done' } }, false],
  ['4 Snowbell, Lanternfall arrived, Akari not met, Nao: the bench as before', { map: 'sb.road', x: 20, y: 13, ed: 2, comp: 'nao', ask: 'sb.bn_nao4', flags: ['departed', 'ch1_done', 'sg_boss_done', 'ch2_done', 'mb1_done', 'mb2_done', 'co_arrived', 'ch3_done', 'sb_arrived', 'sb_lamp_lit', 'ch4_done', 'kr_done', 'lf_arrived'], seen: ['sb.path_bench'] }, true, ['sb.bn_nao4#', 1]],
];
for (const [label, o, want, lines] of cases) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const r = await talk(p, o);
  const k = keys(r, o.ask);
  ok(banterTalk(r) && played(r, o.ask) === want && (!want || !lines || k.length === lines[1]) && !errors.length, label + ' ' + flat({ runs: r.runs.slice(0, 3), keys: k, errors: errors.slice(0, 2) }));
  await p.context().close();
}

console.log(`\nbanter_guards: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
