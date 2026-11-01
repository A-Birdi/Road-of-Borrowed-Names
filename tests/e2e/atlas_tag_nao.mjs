// The Atlas, Nao's own parcel tag found on an expedition (Agnes 6556292010; Local CL-607; Cloud CC-444). In Chromium on
// the built game, an expedition started with the game's own start (from the Lantern Hall, after the story, on a
// throwaway journey), a cache holding Nao's tag placed in the threshold room of that run's plan and opened through
// the game's own relic hook, every line said recorded with its speaker, expression and the voice key the voicebank
// gives it:
//  1. with Nao: the find, then Nao's reaction with 俺 (code.atlas#245cb8826e), shown with "think"; the tag in the
//     run's relics; the old key never said;
//  2. with Mio: the find, then Mio's general reaction under its own key as before (code.atlas#8921edecec);
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/atlas_tag_nao.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);

// an expedition with `comp`, the tag found in the threshold room through the relic hook
async function findTag(p, comp) {
  await p.evaluate(async (comp) => {
    RB.game.debugStart('rw.hall', 5, 5, { edition: RB.edition.forNew(), comp, flags: { post: true } });
    RB.game.settings.textSpeed = 'instant';
    RB.atlas._debug.flags.chooseMod = 0; // (no modifier: the start's own choice, answered as the Atlas lane does)
    RB.hooks.atlas_start([], {});
  }, comp);
  // the start's lines advanced and any choice answered with its first option, until the expedition's first room is still
  for (let i = 0, idle = 0; i < 400 && idle < 4; i++) {
    const st = await p.evaluate(() => {
      if (RB.ui.dialogue.isOpen()) { RB.ui.dialogue.advance(true); return 'line'; }
      const c = document.querySelector('.choices:not(.hidden) .choice');
      if (c) { c.click(); return 'choice'; }
      const s = RB.game.s;
      return s && s.atlas && s.atlas.run && s.map.startsWith('atlas.') && !RB.script.isRunning() && RB.game.mode() === 'world' ? 'still' : 'wait';
    });
    idle = st === 'still' ? idle + 1 : 0;
    await p.waitForTimeout(st === 'choice' ? 200 : 60);
  }
  await p.waitForTimeout(300);
  return p.evaluate(async () => {
    const s = RB.game.s, run = s.atlas.run;
    // the run's own plan (the one the relic hook reads, cached for the run), its room by the map's own key
    const room = RB.atlas.planOf(run).rooms[s.map.split('.')[2]];
    room.caches.push({ id: 'c_test_tag', kind: 'relic', relic: 'tag_nao', where: 'spot' });
    const said = [];
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) { if (l) said.push({ who: l.who, expr: l.expr || null, jp: l.jp || '', en: l.en || '', key: l.jp ? RB.voicebank.keyOf(l.sceneId, l.jp) : null }); return say.apply(this, arguments); };
    const adv = setInterval(() => { try { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); } catch (e) { /* closed */ } }, 50);
    try { await RB.hooks.atlas_relic([], { prop: { cache: 'c_test_tag' } }); } finally { clearInterval(adv); RB.ui.dialogue.say = say; }
    return { said, relics: run.relics.slice(), room: run.room };
  });
}

// 1. with Nao
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const r = await findTag(p, 'nao');
  const nao = r.said.filter((x) => x.who === 'nao');
  ok(r.said.length >= 2 && r.said[0].who === 'narr' && nao.length === 1 && nao[0].key === 'code.atlas#245cb8826e' && /俺/.test(nao[0].jp) && !/私/.test(nao[0].jp) && nao[0].expr === 'think' && nao[0].en === '…This is a tag I wrote. One of the ones I never delivered.',
    '1 with Nao: the find, then Nao\'s reaction with 俺 under code.atlas#245cb8826e, shown with "think" ' + flat({ room: r.room, said: r.said.map((x) => [x.who, x.key, x.expr]) }));
  ok(r.relics.includes('tag_nao') && !r.said.some((x) => x.key === 'code.atlas#6f07dc42ff'), '1 the tag in the run\'s relics; the old key never said ' + flat(r.relics));
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

// 2. with Mio
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const r = await findTag(p, 'mio');
  const mio = r.said.filter((x) => x.who === 'mio');
  ok(mio.length === 1 && mio[0].key === 'code.atlas#8921edecec' && !r.said.some((x) => x.who === 'nao'), '2 with Mio: her general reaction under its own key, as before ' + flat(r.said.map((x) => [x.who, x.key, x.expr])));
  ok(!errors.length, '2 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

console.log(`\natlas_tag_nao: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
