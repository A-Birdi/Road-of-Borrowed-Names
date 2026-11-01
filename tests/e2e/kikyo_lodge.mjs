// Kikyō at the lodge after the vigil (Agnes 6547835197; Cloud CC-407; Local CL-565; Agnes 6548029795). In Chromium on
// the built game, on throwaway journeys (never a real save), at the Keepers' Lodge with the scroll told, Kikyō talked to
// as a player does, every line said recorded with the scene it is shown under and the voice key the voicebank gives it:
//  1. after the vigil, before the chapter's end: her reflection on endings, shown under its own scene
//     (kr.vigil_kikyo) and key, so its own recording is the one that plays; never the cave line; twice;
//  2. the vigil not yet: the cave line under its key, as before;
//  no page errors (console errors included).
// (That the recording itself plays at the lodge needs a voice site; this test checks the scene and key it is asked for.)
// Usage: node tools/build.mjs && node tests/e2e/kikyo_lodge.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const FLAGS = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_arrived: true, kr_kikyo_met: true, kr_ridge_ghost_done: true, kr_kikyo_lodge: true, kr_scroll_done: true };
const CAVE = 'I hope the scroll\'s story is some use in the cave.';
const ENDING = 'In telling, the ending is the hardest part. Anyone can begin.';

async function begin(p, flags) {
  await p.evaluate(async (flags) => {
    const s = RB.game.debugStart('kr.lodge', 22, 13, { comp: 'mio', dir: 'right', edition: RB.edition.forNew(), flags });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.save.autosave = async () => {};
    RB.test.enable({});
    await new Promise((r) => setTimeout(r, 700));
    RB.world.refreshActors();
    await RB.test.idle();
  }, flags);
}
const talk = (p) => p.evaluate(async () => {
  const said = [], say = RB.ui.dialogue.say;
  RB.ui.dialogue.say = function (l) { if (l) said.push({ en: l.en || '', scene: l.sceneId || null, key: l.jp ? RB.voicebank.keyOf(l.sceneId, l.jp) : null }); return say.apply(this, arguments); };
  try { await RB.test.talk('kr_kikyo'); await RB.test.idle(); } finally { RB.ui.dialogue.say = say; }
  return said;
});
const keyOf = (p, scene, en) => p.evaluate(([scene, en]) => { const c = RB.content.scenes[scene].cmds.find((x) => x.en === en); return c ? RB.voicebank.keyOf(scene, c.jp) : null; }, [scene, en]);

// 1. after the vigil
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, Object.assign({ kr_vigil_done: true, kr_tale_closed: true }, FLAGS));
  const want = await keyOf(p, 'kr.vigil_kikyo', ENDING);
  const a = await talk(p);
  const c = await talk(p);
  ok(want && flat(a) === flat([{ en: ENDING, scene: 'kr.vigil_kikyo', key: want }]) && flat(c) === flat(a),
    '1 after the vigil: the reflection under its own scene and key, twice; never the cave line ' + flat({ want, a, c }));
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

// 2. the vigil not yet
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, FLAGS);
  const want = await keyOf(p, 'kr.kikyo_lodge', CAVE);
  const a = await talk(p);
  ok(want && flat(a) === flat([{ en: CAVE, scene: 'kr.kikyo_lodge', key: want }]), '2 the vigil not yet: the cave line under its key, as before ' + flat({ want, a }));
  ok(!errors.length, '2 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

console.log(`\nkikyo_lodge: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
