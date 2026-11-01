// Nao at the Shuttered Hall (Agnes 6547089952; Cloud CC-403; Local CL-561; Agnes 6547199277). In Chromium on the built
// game, on throwaway journeys (never a real save), arriving at the hall through the ridge's own exit, every line said
// recorded with the voice key the voicebank gives it:
//  1. with Nao: the narration, then Nao's line, its Japanese and key as before (kr.hall_first#0a5fa5d0a8), its English
//     "It's closed. A building with no address."; never "Shut up.";
//  2. with Mio: her line as before; Nao's never said;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/kr_hall_nao.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const FLAGS = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_arrived: true };

async function arrive(p, comp) {
  return p.evaluate(async ([comp, FLAGS]) => {
    RB.game.debugStart('kr.ridge', 14, 2, { comp, dir: 'up', edition: RB.edition.forNew(), flags: FLAGS });
    RB.game.settings.textSpeed = 'instant';
    RB.save.autosave = async () => {};
    RB.test.enable({});
    await new Promise((r) => setTimeout(r, 700));
    await RB.test.idle();
    const said = [];
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) { if (l) said.push({ who: l.who, en: l.en || '', key: l.jp ? RB.voicebank.keyOf(l.sceneId, l.jp) : null }); return say.apply(this, arguments); };
    // through the ridge's own exit to the hall: the transition stepping onto it makes (src/engine/50_world.js)
    const ex = RB.world.W.map.exits.find((e) => e.to === 'kr.hall');
    await RB.game.transition(ex.to, ex.tx, ex.ty, ex.dir || 'up', { sp: ex.sp });
    await new Promise((r) => setTimeout(r, 400));
    await RB.test.idle();
    RB.ui.dialogue.say = say;
    return { map: RB.game.s.map, seen: !!RB.game.s.flags.kr_hall_seen, said };
  }, [comp, FLAGS]);
}

// 1. with Nao
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const r = await arrive(p, 'nao');
  const nao = r.said.filter((x) => x.who === 'nao');
  ok(r.map === 'kr.hall' && r.seen && r.said[0] && r.said[0].who === 'narr' && nao.length === 1 && nao[0].key === 'kr.hall_first#0a5fa5d0a8' && nao[0].en === 'It\'s closed. A building with no address.' && !r.said.some((x) => /Shut up/.test(x.en)),
    '1 with Nao: the narration, then Nao\'s line under its key as before, "It\'s closed." ' + flat(r));
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

// 2. with Mio
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const r = await arrive(p, 'mio');
  const mio = r.said.filter((x) => x.who === 'mio');
  ok(r.map === 'kr.hall' && mio.length === 1 && /Too quiet/.test(mio[0].en) && !r.said.some((x) => x.who === 'nao'), '2 with Mio: her line as before; Nao\'s never said ' + flat(r.said.map((x) => [x.who, x.key])));
  ok(!errors.length, '2 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

console.log(`\nkr_hall_nao: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
