// Wataru's outcome in the Company's thoughts (Agnes 6561292860; Local CL-620; Cloud CC-458). In Chromium on the built
// game, on throwaway journeys (never a real save), in Saltglass after the confession, the decision recorded the game's
// own way (the route's flags set and the story settled) and the Company page opened as a player opens it:
//  1. for each companion, on Wataru's own route ("Tell the harbourmaster yourself": both flags) and on the other route
//     ("We'll tell the harbourmaster ourselves"), at three Saltglass places (each its own hash): the page's "On …'s
//     mind" shows that route's thought, and its spoken line is that thought under its own voice key;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/wataru_thought.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const ROUTES = { self: ['sg_wataru_self', 'sg_wataru_confessed'], us: ['sg_wataru_confessed'] };
const PLACES = [['sg.harbor', 12, 12], ['sg.inn', 6, 6], ['sg.office', 5, 6]];

const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
async function shown(comp, route, at) {
  return p.evaluate(async ([comp, flags, at]) => {
    if (RB.ui.menu.isOpen()) RB.ui.menu.close();
    const f = { departed: true, ch1_done: true, sg_wataru_met: true };
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) f['enter:' + m + ':' + ev.scene] = true;
    const s = RB.game.debugStart(at[0], at[1], at[2], { comp, edition: RB.edition.forNew(), flags: f });
    s.chapter = 2;
    RB.game.settings.textSpeed = 'instant';
    RB.save.autosave = async () => {};
    RB.company.sync(s, 'live');
    for (const k of flags) s.flags[k] = true;
    RB.bus.emit('story:settled', {});
    await new Promise((r) => setTimeout(r, 200));
    while (RB.ui.dialogue.isOpen()) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 40)); }
    RB.ui.menu.open('company');
    for (let i = 0; i < 50 && !document.querySelector('.co-page .co-thought'); i++) await new Promise((r) => setTimeout(r, 60));
    const sec = document.querySelector('.co-page .co-thought');
    const line = sec && sec.querySelector('.say-line');
    const kept = line && RB.ui.spoken._lines.get(line.getAttribute('data-say'));
    const en = sec ? ((sec.querySelector('.en') || {}).textContent || '').replace(/\s+/g, ' ').trim() : null;
    const src = kept && kept.source;
    const want = Object.fromEntries(RB.content.company.thoughts.filter((x) => x.comp === comp && x.on === 'dec:sg_wataru').map((x) => [x.when === 'sg_wataru_self' ? 'self' : 'us', { en: x.text.en, key: RB.voicebank.keyOf('code.comp', x.text.jp) }]));
    RB.ui.menu.close();
    return { en, key: src ? RB.voicebank.keyOf(src.sceneId, src.jp) : null, scene: src && src.sceneId, want };
  }, [comp, ROUTES[route], at]);
}

for (const comp of ['nao', 'mio', 'ren', 'suzu']) {
  for (const route of ['self', 'us']) {
    const got = [];
    for (const at of PLACES) got.push(await shown(comp, route, at));
    const want = got[0].want[route];
    ok(got.every((g) => g.en === want.en && g.key === want.key && g.scene === 'code.comp'),
      '1 ' + comp + ', ' + (route === 'self' ? 'Wataru\'s own route' : 'the other route') + ': "' + want.en.slice(0, 40) + '…" under ' + want.key + ' at ' + PLACES.map((x) => x[0]).join(', ') + ' ' + flat(got.map((g) => [g.en && g.en.slice(0, 30), g.key])));
  }
}
ok(!errors.length, 'no page errors ' + errors.slice(0, 3).join(' | '));

console.log(`\nwataru_thought: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
