// Nao's road topic on packing the bag (Agnes 6558179644; Local CL-614; Cloud CC-451). In Chromium on the built game,
// on throwaway journeys (never a real save): after the story, with Nao, the Pages project set at its third page and
// Nao's topics before this one heard, every line said recorded with the voice key the voicebank gives it:
//  1. at an Atlas camp, its second visit: an expedition begun with the game's own start, the run's own camp room
//     entered and its fire used through the world's own interact; Nao's camp thought on the bag, then "Talk about this
//     road" from the camp's own menu plays this topic, Trusted: the first two lines as before, then the new line
//     (road.nao.h3#157475c882); the old one (#893af51a4d) never said;
//  2. at home, in the Lantern Hall after an outing, talking to Nao the game's own way: the same three lines;
//  3. below Trusted, at home: the first two lines only;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/nao_bag_topic.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const OLD = 'road.nao.h3#893af51a4d', NEW = 'road.nao.h3#157475c882';
const FIRST_TWO = ['road.nao.h3#970d718322', 'road.nao.h3#1b6f2164e9'];

// a journey after the story with Nao, the project at its third page, the topics before this one heard
async function journey(p, bond) {
  await p.evaluate(async (bond) => {
    const s = RB.game.debugStart('rw.hall', 5, 5, { edition: RB.edition.forNew(), comp: 'nao', flags: { post: true, postgame: true, lf_bell_rung: true } });
    RB.game.settings.textSpeed = 'instant';
    s.seen['rw.atlas_intro'] = true; s.atlas.unlocked = true;
    s.quests.lf_nao = { stage: 99, done: true };
    RB.company.memory(s, { id: 'ending:nao', kind: 'reflections', title: { jp: '{橋|はし}', en: 'x' }, pq: true, comp: 'nao' });
    s.company.project = { comp: 'nao', stage: 3, caption: 0, theme: Object.keys(RB.pages.PROJECT.nao.themes)[0], ev: { run: 'x', id: 'y', kind: 'inscription', desc: { jp: '', en: '' }, title: { jp: '', en: '' }, ret: 'early' }, road: {} };
    for (const sl of ['h1', 'r1', 'o1', 'h2', 'r2', 'o2']) s.company.talk['road:nao.' + sl] = { t: 1, variant: 'base', variants: ['base'] };
    s.company.bond = {};
    for (let i = 0; i < bond; i++) s.company.bond['t' + i] = 1;
    window.__picks = [];
    RB.test.enable({ choose: (opts) => { const want = window.__picks.shift(); const i = want ? opts.findIndex((o) => (o.en || '').indexOf(want) >= 0) : -1; return i >= 0 ? i : 0; } });
    await new Promise((r) => setTimeout(r, 600));
    window.__said = [];
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) { if (l) window.__said.push({ who: l.who, en: l.en || '', key: l.jp ? RB.voicebank.keyOf(l.sceneId, l.jp) : null }); return say.apply(this, arguments); };
  }, bond);
}
const h3 = (said) => said.filter((x) => x.key && x.key.indexOf('road.nao.h3#') === 0).map((x) => x.key);

// 1. at an Atlas camp, its second visit
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await journey(p, 6);
  await p.evaluate(() => { RB.atlas._debug.flags.chooseMod = 0; RB.hooks.atlas_start([], {}); });
  // the start's lines advanced and any choice answered, until the expedition's first room is still
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
  const r = await p.evaluate(async () => {
    const s = RB.game.s, run = s.atlas.run;
    s.atlas.camps = 1; // one camp already on this journey: the fire here is the second
    await RB.game.transition('atlas.' + run.id + '.c', null, null, 'down');
    await RB.test.idle();
    const fire = RB.world.W.map.props.find((pp) => pp.scene === 'atlas.camp');
    window.__said = [];
    window.__picks = ['Talk about this road', 'Go on'];
    await RB.test.use(fire.x, fire.y);
    await RB.test.idle();
    return { map: s.map, campI: s.vars.atlas_camp_i, said: window.__said.slice(), heard: !!s.company.talk['road:nao.h3'] };
  });
  const bag = r.said.findIndex((x) => /This bag's heavy, right\?/.test(x.en));
  const first = r.said.findIndex((x) => x.key && x.key.indexOf('road.nao.h3#') === 0);
  ok(/\.c$/.test(r.map) && r.campI === 1 && bag >= 0 && first > bag, '1 at the camp, its second visit: Nao\'s thought on the bag, then this topic ' + flat({ map: r.map, campI: r.campI, bag, first }));
  ok(flat(h3(r.said)) === flat(FIRST_TWO.concat([NEW])) && !r.said.some((x) => x.key === OLD) && r.heard, '1 Trusted: the first two lines as before, then the new line under ' + NEW + '; the old never said ' + flat(h3(r.said)));
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

// 2 and 3. at home, after an outing, talking to Nao the game's own way: Trusted, and below
for (const [bond, want, label] of [[6, FIRST_TWO.concat([NEW]), '2 at home, Trusted: the same three lines'], [5, FIRST_TWO, '3 at home, below Trusted: the first two lines only']]) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await journey(p, bond);
  const r = await p.evaluate(async () => {
    const s = RB.game.s;
    s.company.project.road = { lastEnd: 'r0', home: null }; // home from an outing: the homecoming's topic waits
    const pend = RB.pages.pending(s, 'hall');
    window.__said = [];
    RB.game.companionTalk();
    await new Promise((r) => setTimeout(r, 300));
    await RB.test.idle();
    return { pend: pend && pend.id, said: window.__said.slice(), heard: !!s.company.talk['road:nao.h3'] };
  });
  ok(r.pend === 'road' && flat(h3(r.said)) === flat(want) && !r.said.some((x) => x.key === OLD) && r.heard, label + ' ' + flat({ pend: r.pend, h3: h3(r.said) }));
  ok(!errors.length, label.slice(0, 1) + ' no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

console.log(`\nnao_bag_topic: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
