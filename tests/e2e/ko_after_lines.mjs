// The Kotonoha townsfolk after the Gardener, in Chromium (editorial row 2: Cloud CC-523 note 2 and CC-525; Agnes
// 6639995441; Local CL-689). On the built game, on throwaway journeys (never a real save): the Gardener reached
// through its own root arch, with only the encounter's result given by the test (the encounter itself is played with
// the real buttons in social_battle.mjs); the people talked to through the world's own interact; the moves between
// maps by the game's own transition; a save made and loaded through the game's own save and load:
//  1. before the Gardener (step 4), with Nao: Nami, Hamaji and Nana in the village and Mitsu at the lodge say their
//     roots lines;
//  2. the Gardener done, with Mio; a save and load: step 7, no ko_done; the four say their after-lines, Nami without
//     "Tetsu's boat is at the jetty";
//  3. after Otoha's ending (synthetic ko_done), with Ren: Nami's after-line and the boat line;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/ko_after_lines.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const DONE = ['departed', 'ch1_done', 'ch2_done', 'ch3_done', 'ch4_done', 'ch5_done', 'ko_ch9', 'ko_otoha_met'];

async function at(p, map, x, y, comp, main, flags) {
  await p.evaluate(async ({ DONE, map, x, y, comp, main, flags }) => {
    const f = Object.assign({}, flags);
    for (const k of DONE) f[k] = true;
    const s = RB.game.debugStart(map, x, y, { comp, dir: 'up', edition: 2, flags: f });
    s.quests.ko_main = typeof main === 'object' ? main : { stage: main, done: false, t: 1 };
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.test.enable({});
    window.__enc = [];
    RB.game.startEncounter = async (id) => { window.__enc.push(id); return { result: 'win', outcome: '' }; };
    await new Promise((r) => setTimeout(r, 900));
    RB.world.refreshActors();
    window.__said = [];
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) { if (l) window.__said.push([l.who || 'narr', l.en || '']); return say.apply(this, arguments); };
  }, { DONE, map, x, y, comp, main, flags });
}
const go = (p, map, x, y) => p.evaluate(async ({ map, x, y }) => {
  await RB.test.idle();
  await RB.game.transition(map, x, y, 'up', {});
  await new Promise((r) => setTimeout(r, 800));
  await RB.test.idle();
  return { map: RB.world.W.map.id, npcs: RB.world.W.npcs.map((n) => n.id) };
}, { map, x, y });
const act = (p, who) => p.evaluate(async (who) => {
  window.__said = [];
  await RB.test.idle();
  if (!RB.world.W.npcs.some((n) => n.id === who)) return { absent: true, said: [] };
  await RB.test.talk(who);
  await RB.test.idle(); await new Promise((r) => setTimeout(r, 400)); await RB.test.idle();
  return { said: window.__said.slice(), mode: RB.game.mode() };
}, who);
const useArch = (p) => p.evaluate(async () => {
  window.__said = [];
  await RB.test.idle();
  await RB.test.use(12, 5);
  await RB.test.idle(); await new Promise((r) => setTimeout(r, 400)); await RB.test.idle();
  return { enc: window.__enc.slice(), mode: RB.game.mode() };
});
const state = (p) => p.evaluate(() => { const s = RB.game.s; return { main: s.quests.ko_main.done ? 'done' : s.quests.ko_main.stage, gardener: !!s.flags.ko_gardener_done, done: !!s.flags.ko_done }; });
const saveLoad = (p) => p.evaluate(async () => {
  await RB.test.idle();
  await RB.save.manualSave(1);
  await RB.game.loadCampaign(1, 'manual');
  await new Promise((r) => setTimeout(r, 800));
  await RB.test.idle();
  return RB.world.W.map.id;
});
const has = (said, re) => said.some(([, en]) => re.test(en));
const ROOTS = { ko_nami: /^You're going down into the Root Hollows\?/, ko_hamaji: /^Under the roots, it joins the sea\./, ko_nana: /^You're going under the roots\? It's dark there\./, ko_mitsu: /^You're going under the roots\? …I'll have something warm/ };
const AFTER = { ko_nami: /^The leaves are back to as many as I can row/, ko_hamaji: /^One more story to tell the grandchildren/, ko_nana: /^Welcome back! Tell me about under the roots/, ko_mitsu: /^Welcome back! Here, the soup I promised/ };
const BOAT = /^If you're going back to the mainland, Tetsu's boat is at the jetty\.$/;
const VILLAGE = ['ko_nami', 'ko_hamaji', 'ko_nana'];
async function four(p) {
  const got = {};
  const v = await go(p, 'ko.village', 24, 15);
  for (const id of VILLAGE) { const t = await act(p, id); got[id] = { absent: !!t.absent, roots: has(t.said, ROOTS[id]), after: has(t.said, AFTER[id]), boat: has(t.said, BOAT) }; }
  const l = await go(p, 'ko.lodge', 7, 5);
  const t = await act(p, 'ko_mitsu');
  got.ko_mitsu = { absent: !!t.absent, roots: has(t.said, ROOTS.ko_mitsu), after: has(t.said, AFTER.ko_mitsu), boat: false };
  return { got, maps: [v.map, l.map] };
}

// 1. before the Gardener, with Nao
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 'ko.village', 24, 15, 'nao', 4, {});
  const r = await four(p);
  ok(flat(r.maps) === '["ko.village","ko.lodge"]' && Object.entries(r.got).every(([, g]) => !g.absent && g.roots && !g.after),
    '1 before the Gardener (step 4): the four say their roots lines ' + flat(r));
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// 2. the Gardener done, with Mio; a save and load; the four
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 'ko.garden', 19, 16, 'mio', 6, {});
  const g = await useArch(p);
  const s1 = await state(p);
  const m = await saveLoad(p);
  const r = await four(p);
  ok(flat(g.enc) === '["ko.gardener"]' && s1.gardener && !s1.done && s1.main === 7 && m === 'ko.garden',
    '2 the Gardener through its arch: step 7, no ko_done; a save and load ' + flat({ g, s1, m }));
  ok(flat(r.maps) === '["ko.village","ko.lodge"]' && Object.entries(r.got).every(([, x]) => !x.absent && x.after && !x.roots && !x.boat),
    '2 then the four say their after-lines, Nami without the boat ' + flat(r));
  ok(!errors.length, '2 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// 3. after Otoha's ending (synthetic), with Ren
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, 'ko.village', 24, 15, 'ren', { stage: 7, done: true, t: 1 }, { ko_gardener_done: true, ko_done: true });
  const t = await act(p, 'ko_nami');
  ok(!t.absent && has(t.said, AFTER.ko_nami) && has(t.said, BOAT), '3 after Otoha\'s ending: Nami\'s after-line and the boat line ' + flat(t.said));
  ok(!errors.length, '3 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

await b.close();
srv.close();
console.log(`\nko_after_lines: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
