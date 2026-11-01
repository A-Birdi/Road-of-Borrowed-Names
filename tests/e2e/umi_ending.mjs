// Lanternfall's ending, Umi with Nao after the letter (Agnes 6555618743, 6555704812; Local CL-604; Cloud CC-440). In
// Chromium on the built game, on throwaway journeys in Lanternfall (never a real save), the ending's Lanternfall scene
// played through the game's own runner and dialogue box, every line said recorded with its speaker and the voice key
// the game's own voicebank gives it:
//  1. Nao along, the letter delivered: Umi's new line (…"I read it." That's all I wrote. …), its key
//     sa.epi_lf#acc22579bc, then "You said I didn't have to decide." and Nao's answer; the old line never said;
//  2. Nao along, the quest started: "…Oh, the courier." and Nao's answer, as before;
//  3. Mio along, the letter delivered: no Umi line, and Mio's own lines;
//  4. a save written before the ending and loaded: the same as 1;
//  no page errors (the runner's own error log included).
// Usage: node tools/build.mjs && node tests/e2e/umi_ending.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const FLAGS = { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, lf_bell_rung: true, sa_met_kasane: true };
const NEW = 'sa.epi_lf#acc22579bc', OLD = 'sa.epi_lf#774096ea3d', NEXT = 'sa.epi_lf#7e437a2f8e';
const NEW_EN = '…"I read it." That\'s all I wrote. I still haven\'t decided whether I forgive him.';

async function begin(p, comp, quest) {
  await p.evaluate(async ([comp, flags, quest]) => {
    const s = RB.game.debugStart('lf.town', 10, 10, { edition: RB.edition.forNew(), comp, dir: 'down', flags });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    if (quest === 'done') { RB.state.setQuest(s, 'lf_nao', 'done'); s.flags.lf_nao_done = true; } else if (quest != null) RB.state.setQuest(s, 'lf_nao', quest);
    RB.game.settings.textSpeed = 'instant';
    RB.save.autosave = async () => {};
    RB.test.enable({});
    await new Promise((r) => setTimeout(r, 800));
    RB.world.refreshActors();
    if (!window.__wrapped) {
      window.__wrapped = true;
      const say = RB.ui.dialogue.say;
      RB.ui.dialogue.say = function (l) { if (l) window.__said.push({ who: l.who, en: l.en || '', key: l.jp ? RB.voicebank.keyOf(l.sceneId, l.jp) : null }); return say.apply(this, arguments); };
    }
    window.__said = [];
  }, [comp, FLAGS, quest]);
}
const ending = (p) => p.evaluate(async () => {
  window.__said = [];
  await RB.script.run('sa.epi_lf');
  await RB.test.idle();
  return window.__said.slice();
});
const umi = (l) => l.filter((x) => x.who === 'umi');

// 1. the letter delivered
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, 'nao', 'done');
  const l = await ending(p);
  const u = umi(l), i = l.findIndex((x) => x.key === NEW);
  ok(u.length === 2 && u[0].key === NEW && u[0].en === NEW_EN && u[1].key === NEXT && i >= 0 && l[i + 2] && l[i + 2].who === 'nao' && /^I did\. I still think so\./.test(l[i + 2].en) && !l.some((x) => x.key === OLD),
    '1 Nao along, the letter delivered: the new line under ' + NEW + ', then the same next exchange; the old line never said ' + flat(u));
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

// 2. started
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, 'nao', 1);
  const l = await ending(p);
  const u = umi(l);
  ok(u.length === 1 && u[0].key === 'sa.epi_lf#f0a0869abe' && l.some((x) => x.who === 'nao' && /^…I'll come soon\./.test(x.en)) && !l.some((x) => x.key === NEW || x.key === OLD),
    '2 Nao along, the quest started: "…Oh, the courier." and Nao\'s answer, as before ' + flat(u));
  ok(!errors.length, '2 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

// 3. Mio
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, 'mio', 'done');
  const l = await ending(p);
  ok(!umi(l).length && l.some((x) => x.who === 'mio' && /^…Did you hear that\? I said no\./.test(x.en)), '3 Mio along, the letter delivered: no Umi line, and Mio\'s own lines ' + flat(umi(l)));
  ok(!errors.length, '3 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

// 4. a save written before the ending, loaded
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, 'nao', 'done');
  await p.evaluate(async () => { RB.save.setCurrent(6, 0); await RB.save.writeSlot(6, RB.game.s, { force: true }); await RB.game.loadCampaign(6, 'manual'); await new Promise((r) => setTimeout(r, 800)); });
  const l = await ending(p);
  const u = umi(l);
  ok(u.length === 2 && u[0].key === NEW && u[0].en === NEW_EN && u[1].key === NEXT, '4 a save written before the ending and loaded: the same as 1 ' + flat(u));
  ok(!errors.length, '4 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

console.log(`\numi_ending: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
