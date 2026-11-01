// Kumazō on the Cedar Steps after the vigil (Agnes 6547898553; Local CL-566; Cloud CC-408; Agnes 6548029795). In
// Chromium on the built game, on throwaway journeys (never a real save), on the Cedar Steps with the cedar cleared,
// Kumazō talked to as a player does, every line said recorded with the voice key the voicebank gives it, and the steps'
// dawn lanterns read from the map as it stands:
//  1. after the vigil, before the chapter's end: the dawn lanterns lit, and the bright-steps line under its key, twice;
//     never the dark warning;
//  2. before the vigil: the dawn lanterns dark, and the dark warning under its key, as before;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/kumazo_after.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const FLAGS = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_arrived: true, kr_cedar_cleared: true };
const BRIGHT = 'The steps are bright at night. I wish my father could have seen it.';
const DARK = /^With the lanterns dark, things come down out of the hills/;

async function begin(p, flags) {
  await p.evaluate(async (flags) => {
    const s = RB.game.debugStart('kr.steps', 9, 25, { comp: 'ren', dir: 'up', edition: RB.edition.forNew(), flags });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.save.autosave = async () => {};
    RB.test.enable({});
    await new Promise((r) => setTimeout(r, 700));
    RB.world.refreshActors();
    await RB.test.idle();
  }, flags);
}
// the steps' dawn lanterns as the map stands: which instance shows at each place, and whether it is lit
const lanterns = (p) => p.evaluate(() => {
  const s = RB.game.s;
  return RB.world.W.map.props.filter((x) => x.p === 'kr_toro' && /kr_vigil_done/.test(x.if || '')).filter((x) => RB.state.test(s, x.if)).map((x) => [x.x, x.y, !!(x.o && x.o.lit)]);
});
const talk = (p) => p.evaluate(async () => {
  const said = [], say = RB.ui.dialogue.say;
  RB.ui.dialogue.say = function (l) { if (l) said.push({ en: l.en || '', key: l.jp ? RB.voicebank.keyOf(l.sceneId, l.jp) : null }); return say.apply(this, arguments); };
  try { await RB.test.talk('kr_kumazo'); await RB.test.idle(); } finally { RB.ui.dialogue.say = say; }
  return said;
});
const keyOf = (p, scene) => p.evaluate((scene) => { const c = RB.content.scenes[scene].cmds.find((x) => x.op === 'say'); return RB.voicebank.keyOf(scene, c.jp); }, scene);

// 1. after the vigil, before the chapter's end
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, Object.assign({ kr_vigil_done: true, kr_tale_closed: true }, FLAGS));
  const lit = await lanterns(p);
  const want = await keyOf(p, 'kr.kumazo_after');
  const a = await talk(p);
  const c = await talk(p);
  ok(lit.length === 2 && lit.every((x) => x[2]) && flat(a) === flat([{ en: BRIGHT, key: want }]) && flat(c) === flat(a) && !a.concat(c).some((x) => DARK.test(x.en)),
    '1 after the vigil: the dawn lanterns lit, and the bright-steps line under its key, twice ' + flat({ lit, want, a, c }));
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

// 2. before the vigil
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, FLAGS);
  const lit = await lanterns(p);
  const want = await keyOf(p, 'kr.kumazo_idle');
  const a = await talk(p);
  ok(lit.length === 2 && lit.every((x) => !x[2]) && a.length === 1 && DARK.test(a[0].en) && a[0].key === want, '2 before the vigil: the dawn lanterns dark, and the dark warning under its key, as before ' + flat({ lit, want, a }));
  ok(!errors.length, '2 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

console.log(`\nkumazo_after: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
