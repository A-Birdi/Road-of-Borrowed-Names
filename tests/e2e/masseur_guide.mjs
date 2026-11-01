// The Masseur's Lost Words: the Journey's "Next" line while the verses are gathered (Agnes 6554356273, 6554439890,
// 6554533740; Local CL-598, CL-600; Cloud CC-433). In Chromium on the built game, on throwaway journeys (never a real
// save), the quest followed, Kihachi, Oshige and Bunkichi talked to through the world's own interact:
//  1. after the story, Okiyo's verse given, the geta not yet: "Next" names Kihachi, not "can't take this further"; the
//     first talk gives the geta (a keepsake record, the satchel unchanged) and "Next" still names him; the next talk
//     is his verse, and "Next" names Oshige;
//  2. Mio's night, Okiyo's and Kihachi's verses given: "Next" never names Oshige while she is away, and names the
//     footbath ("the footbath", not "something");
//  3. Bunkichi at stage 0: his line asks for all three lines;
//  no page errors.
// Usage: node tools/build.mjs && node tests/e2e/masseur_guide.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const BEFORE = ['departed', 'ch1_done', 'ch2_done', 'mb1_done', 'mb2_done', 'ch3_done', 'ch4_done', 'kr_done', 'ch5_done', 'ko_done', 'cr_called', 'cr_done', 'cr_delivered', 'yn_called', 'yn_kami_seen', 'yn_rooms_done'];

async function at(p, map, x, y, comp, flags, o) {
  await p.evaluate(async ([map, x, y, comp, flags, BEFORE, o]) => {
    const f = Object.assign({}, flags);
    for (const k of BEFORE) f[k] = true;
    const s = RB.game.debugStart(map, x, y, { comp, dir: 'up', edition: RB.edition.forNew(), flags: f });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    if (o.done) RB.state.setQuest(s, 'yn_main', 'done'); else s.quests.yn_main = { stage: o.main || 6, done: false, t: 1 };
    s.quests.yn_masseur = { stage: 0, done: false, t: 1 };
    RB.game.settings.textSpeed = 'instant';
    RB.save.autosave = async () => {};
    RB.questGuide.follow('yn_masseur');
    RB.test.enable({});
    await new Promise((r) => setTimeout(r, 900));
    RB.world.refreshActors();
    window.__said = [];
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) { if (l) window.__said.push({ jp: l.jp || '', en: l.en || '' }); return say.apply(this, arguments); };
  }, [map, x, y, comp, flags, BEFORE, o || {}]);
}
// the Journey's page for the quest: its "Next" lines, as shown
async function next(p) {
  await p.evaluate(() => { if (RB.ui.menu.isOpen()) RB.ui.menu.close(); RB.questGuide.reset(); RB.ui.menu.open('journal'); });
  await p.waitForTimeout(300);
  await p.evaluate(() => { const e = document.querySelector('.leaf button.entry[data-q="yn_masseur"]'); if (e) e.click(); });
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => [...document.querySelectorAll('.qnext .nline')].map((e) => e.textContent));
  await p.evaluate(() => RB.ui.menu.close());
  await p.waitForTimeout(200);
  return r;
}
const talk = (p, id) => p.evaluate(async (id) => {
  window.__said = [];
  await RB.test.talk(id);
  const s = RB.game.s;
  return { said: window.__said.map((l) => l.en), verse2: !!s.flags.yn_verse2, geta: !!(s.discovery.keepsakes || {}).ks_yn_geta, inv: JSON.stringify(s.inv) };
}, id);

// 1. after the story: the geta, then the verse
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 'yn.upper', 34, 13, 'nao', { yn_done: true, yn_verse1: true }, { done: true });
  const inv0 = await p.evaluate(() => JSON.stringify(RB.game.s.inv));
  const n0 = await next(p);
  const t1 = await talk(p, 'yn_kihachi');
  const n1 = await next(p);
  const t2 = await talk(p, 'yn_kihachi');
  const n2 = await next(p);
  ok(n0.some((x) => /Kihachi/.test(x)) && !n0.some((x) => /can.t take this further/.test(x)), '1 after the story, Okiyo\'s verse given, no geta: "Next" names Kihachi ' + flat(n0));
  ok(t1.geta && !t1.verse2 && t1.inv === inv0 && n1.some((x) => /Kihachi/.test(x)), '1 the first talk gives the geta (a keepsake record, the satchel unchanged), and "Next" still names him ' + flat({ said: t1.said.slice(0, 2), n1 }));
  ok(t2.verse2 && t2.said.some((x) => /A knot is a stone/.test(x)) && n2.some((x) => /Oshige/.test(x)), '1 the next talk is his verse, and "Next" names Oshige ' + flat({ n2 }));
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

// 2. Mio's night
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 'yn.kami', 12, 8, 'mio', { yn_verse1: true, yn_verse2: true, yn_mio_night: true }, { main: 6 });
  const n = await next(p);
  ok(n.length > 0 && !n.some((x) => /Oshige/.test(x)) && n.some((x) => /the footbath/.test(x)) && !n.some((x) => /something/i.test(x)) && !n.some((x) => /can.t take this further/.test(x)),
    '2 Mio\'s night: "Next" never names Oshige while she is away, and names the footbath ' + flat(n));
  ok(!errors.length, '2 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

// 3. Bunkichi's line
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 'yn.upper', 10, 18, 'nao', { yn_verse1: true }, { main: 6 });
  await p.evaluate(() => { const n = RB.world.W.npcs.find((x) => x.id === 'yn_bunkichi'); if (n) { RB.world.W.player.x = n.x + 1; RB.world.W.player.y = n.y; } });
  const t = await talk(p, 'yn_bunkichi');
  ok(flat(t.said) === flat(['When you have all three lines, let me hear them. One at a time, they won\'t fit the tune.']), '3 Bunkichi at stage 0: his line asks for all three lines ' + flat(t.said));
  ok(!errors.length, '3 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

console.log(`\nmasseur_guide: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
