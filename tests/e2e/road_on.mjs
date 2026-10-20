// Agnes, RBN-QA-033: after Cinder Orchard's festival night the morning narration points north to Snowbell, but the
// Journey's "Now" said "Nothing pressing. Walk around; people will tell you what they need." until Snowbell's own
// story began in the hamlet, and north from the square leads to the terraces, not Snowbell (the way is west to the
// Orchard Road, then its north road). A main quest may now name the way on once it is done (`next`), shown in "Now"
// until `next.until` holds. Nothing is marked on the map (between chapters no quest is followed, as in RBN-QA-011).
// In the game:
//  1. the lookout scene played to its end (co.reflection, the next morning): Now shows the way on, west to the Orchard
//     Road and north, in Japanese with readings and in English; no "Nothing pressing"; no quest followed, no marker;
//  2. the same with a side quest on the way (A Fare Thirty Years Owed) followed: the way on stays, beside it;
//  3. on Snowbell's road (sb_arrived) before the hamlet: the note turns to the climb north to the hamlet (Agnes,
//     20:53Z: the gap lasted until the hamlet's arrival scene);
//  4. Snowbell's story begun (sb_lamp): its quest is Now, no way-on note;
//  5. another seam with no `next` (the end of Chapter 2, twelve chapters): unchanged, "Nothing pressing".
// Usage: node tools/build.mjs && node tests/e2e/road_on.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

const CO = {
  departed: true, ch1_done: true, ch2_done: true, mb_arrived: true, mb1_done: true, mb2_done: true, co_arrived: true, co_met_sayo: true,
  co_records_done: true, co_seal_broken: true, co_kiln_open: true, co_kiln_seen: true, co_warden_down: true, co_logpage_taken: true,
  co_kiln_done: true, co_kiln_return: true, co_festival: true,
};
async function start(p, o) {
  await p.evaluate(async (o) => {
    RB.test.enable({ battle: 'unravel' });
    const s = RB.game.debugStart(o.map, o.x, o.y, { comp: 'suzu', flags: o.flags, dir: 'down', edition: 2 });
    s.chapter = o.chapter || 3; // the old chapter number (src/engine/05a_edition.js): Cinder Orchard 3, Snowbell 4
    for (const [id, st, done] of o.quests || []) s.quests[id] = { stage: st, done: !!done, t: o.t ? o.t[id] || 1 : 1 };
    if (o.follow) RB.questGuide.follow(o.follow);
    RB.game.settings.textSpeed = 'instant';
    RB.game.applySettings();
    RB.world.refreshActors();
    const W = RB.world.W, t0 = performance.now();
    while (W.time - W.enteredAt < 1100 && performance.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 50));
  }, o);
}
async function journey(p) {
  await p.evaluate(() => { if (RB.ui.menu.isOpen()) RB.ui.menu.close(); RB.ui.menu.open('journal'); });
  await p.waitForTimeout(400);
  return p.evaluate(() => {
    const ro = document.querySelector('.road-on');
    const body = document.querySelector('.folio') ? document.querySelector('.folio').innerText : document.body.innerText;
    return {
      roadOn: ro ? ro.innerText.replace(/\s+/g, ' ') : null,
      rubies: ro ? ro.querySelectorAll('ruby').length : 0,
      nothing: /Nothing pressing/.test(body),
      now: Array.from(document.querySelectorAll('.entries button.entry.current .t .en')).map((e) => e.innerText),
      followed: RB.questGuide.followed(RB.game.s),
      marks: (RB.questMarks.marks() || {}).qid || null,
    };
  });
}

// 1. the lookout scene to its end, then the Journey
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { map: 'co.lookout', x: 7, y: 6, flags: CO, quests: [['co_main', 9, false]] });
  await p.evaluate(async () => { await RB.script.run('co.reflection'); await RB.test.idle(); });
  const st = await p.evaluate(() => ({ map: RB.world.W.map.id, done: RB.game.s.quests.co_main.done, ch3: !!RB.game.s.flags.ch3_done }));
  ok(st.map === 'co.village' && st.done && st.ch3, 'the lookout scene ends the chapter: the next morning in the village, co_main done (' + JSON.stringify(st) + ')');
  const j = await journey(p);
  ok(j.roadOn && /the road on/i.test(j.roadOn) && /west road to the Orchard Road/.test(j.roadOn) && /north road/.test(j.roadOn), 'Now names the way on: ' + j.roadOn);
  ok(j.roadOn && /雪鈴/.test(j.roadOn) && j.rubies >= 8, 'in Japanese too, every kanji with its reading (' + j.rubies + ' readings)');
  ok(!j.nothing, 'no "Nothing pressing"');
  ok(j.followed === null && j.marks === null, 'no quest followed and no marker (followed ' + j.followed + ', marks ' + j.marks + ')');
  ok(!errors.length, 'no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}
// 2. a side quest on the way, followed
{
  const { p } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { map: 'co.village', x: 24, y: 20, flags: Object.assign({ ch3_done: true }, CO), quests: [['co_main', 9, true], ['lq_fare', 1, false]], t: { co_main: 1, lq_fare: 2 }, follow: 'lq_fare' });
  const j = await journey(p);
  ok(j.roadOn && /Orchard Road/.test(j.roadOn), 'with a side quest followed, the way on stays');
  ok(j.now.some((t) => /Fare/.test(t)) && j.followed === 'lq_fare', 'and the followed side quest is beside it (' + j.now.join(' / ') + ')');
  await p.context().close();
}
// 3. on Snowbell's road, before the hamlet
{
  const { p } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { map: 'co.village', x: 24, y: 20, flags: Object.assign({ ch3_done: true, sb_arrived: true }, CO), quests: [['co_main', 9, true]] });
  const j = await journey(p);
  ok(j.roadOn && /Climb the Snowbell Road north to the hamlet/.test(j.roadOn) && !/Orchard Road/.test(j.roadOn) && !j.nothing, 'on Snowbell\'s road (sb_arrived): the climb to the hamlet (' + j.roadOn + ')');
  await p.context().close();
}
// 4. Snowbell's story begun
{
  const { p } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { map: 'co.village', x: 24, y: 20, flags: Object.assign({ ch3_done: true, sb_arrived: true, sb_hamlet_seen: true }, CO), quests: [['co_main', 9, true], ['sb_lamp', 0, false]], t: { co_main: 1, sb_lamp: 2 }, chapter: 4 });
  const j = await journey(p);
  ok(j.roadOn === null && j.now.some((t) => /Light Above Snowbell/.test(t)), 'Snowbell\'s story begun: its quest is Now, no way-on note (' + j.now.join(' / ') + ')');
  await p.context().close();
}
// 5. another seam with no `next`: unchanged
{
  const { p } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { map: 'sg.harbor', x: 10, y: 10, flags: { departed: true, ch1_done: true, ch2_done: true }, quests: [['sg_main', 9, true]], chapter: 2 });
  const j = await journey(p);
  ok(j.roadOn === null && j.nothing, 'the end of Chapter 2 (no `next`): "Nothing pressing" as before, the journal is the guidance');
  await p.context().close();
}
console.log(`\nroad_on: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
