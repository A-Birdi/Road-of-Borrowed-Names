// The lookout's line about Suzu's dance, after hearing it from her (Agnes 6544235086, 6544575390; Local CL-552; Cloud
// CC-396). In Chromium on the built game, on throwaway journeys seeded on the festival night (never a real save), Suzu
// talked to and the lookout climbed through the world's own interact (the automated player taking the first choice,
// "Climb the lookout"), what is shown recorded as it is shown:
//  1. her festival talk heard in standard speech, then the lookout: only "Down on the stage, Suzu is dancing.";
//  2. the same in Kansai: her lines shown in Kansai, then only the short line;
//  3. never heard: the whole line, as before;
//  4. Suzu as your companion: no festival Suzu to talk to, and at the lookout her own lines, neither narration line;
//  5. after the lookout the night is over (the next morning in the village): her festival talk cannot come after it in
//     play (tests/unit/suzu_lookout_line.test.mjs runs it after, seeded);
//  no page errors.
// Usage: node tools/build.mjs && node tests/e2e/suzu_lookout.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const FULL = 'Down on the stage, Suzu is dancing. Later you\'ll hear it was the piece she was meant to dance twenty years ago.';
const SHORT = 'Down on the stage, Suzu is dancing.';

async function begin(p, o) {
  await p.evaluate(async (o) => {
    const s = RB.game.debugStart('co.festival', 24, 16, { dir: 'up', edition: RB.edition.forNew(), flags: { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, co_restored: true, co_bell_done: true } });
    s.comp = o.comp;
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.suzuSpeech = o.speech || 'standard';
    RB.save.autosave = async () => {};
    RB.test.enable({});
    await new Promise((r) => setTimeout(r, 600));
    RB.world.refreshActors();
    // what is said, and Suzu's lines as the dialogue box shows them (standard or Kansai)
    window.__said = []; window.__suzu = [];
    const say = RB.ui.dialogue.say, line = RB.dialect.line;
    RB.ui.dialogue.say = function (l) { if (l) window.__said.push(l.en || ''); return say.apply(this, arguments); };
    RB.dialect.line = function (who, obj) { const r = line.apply(this, arguments); if (who === 'suzu' && r) window.__suzu.push((r.dia || 'standard') + ':' + (r.en || '')); return r; };
  }, o);
}
const talkSuzu = (p) => p.evaluate(async () => {
  const there = RB.world.W.npcs.some((n) => n.id === 'suzu');
  if (there) await RB.test.talk('suzu');
  return { there, shown: window.__suzu.slice(), seen: !!RB.game.s.seen['co.fest_suzu_c'] };
});
const lookout = (p) => p.evaluate(async () => {
  window.__said = [];
  await RB.test.use(11, 11);
  await RB.test.idle();
  return { said: window.__said.slice(), map: RB.world.W.map.id, done: !!RB.game.s.flags.ch3_done };
});
const lines = (said) => said.filter((l) => l === FULL || l === SHORT);

for (const [label, o, want] of [
  ['1 her festival talk heard, standard speech', { comp: 'nao', speech: 'standard', talk: true }, [SHORT]],
  ['2 her festival talk heard, Kansai', { comp: 'nao', speech: 'kansai', talk: true }, [SHORT]],
  ['3 never heard', { comp: 'nao' }, [FULL]],
  ['4 Suzu as your companion', { comp: 'suzu', talk: true }, []],
]) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, o);
  const t = o.talk ? await talkSuzu(p) : { there: null, shown: [], seen: false };
  const l = await lookout(p);
  const heard = t.shown.filter((x) => /twenty years ago/.test(x));
  const talkOk = o.comp === 'suzu' ? t.there === false : !o.talk || (t.seen && heard.length === 1 && heard[0].startsWith(o.speech === 'kansai' ? 'kansai:' : 'standard:'));
  const own = o.comp === 'suzu' ? l.said.some((x) => /Want to see my book/.test(x)) : true;
  ok(talkOk && own && JSON.stringify(lines(l.said)) === JSON.stringify(want),
    label + ': ' + (want.length ? '"' + want[0] + '"' : 'neither line, her own instead') + ' (' + JSON.stringify({ talk: t, lookout: lines(l.said) }) + ')');
  if (label.startsWith('3')) ok(l.map === 'co.village' && l.done, '5 after the lookout the night is over, the next morning in the village: her festival talk cannot follow it in play (' + JSON.stringify({ map: l.map, done: l.done }) + ')');
  ok(!errors.length, label + ': no page errors ' + errors.slice(0, 3).join(' | '));
  await p.close();
}

console.log(`\nsuzu_lookout: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
