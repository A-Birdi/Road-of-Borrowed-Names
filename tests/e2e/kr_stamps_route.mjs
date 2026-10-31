// The Pilgrim's Stamp Book (kr_stamps; Cloud CC-391; Local CL-544; Agnes 6542470604). In Chromium on the built game,
// with throwaway journeys seeded after the chapter's end (never a real save): the maps are reached by transition, not
// walked, but Iwa, the book and the shrines are each pressed through the world's own interact, as a player does:
//  1. begun after the chapter: her first meeting on the Foot of the Road, the book on the Cedar Steps, her thanks at
//     Fox Bridge, the three shrines (the guide marking those still to visit), her hand-in: done once, the book taken;
//     then her after-chapter line;
//  2. a stage-1 journey with one seal, in the postgame: her shrines line, the two shrines left, done once;
//  3. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/kr_stamps_route.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const KR = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_arrived: true, kr_fox_seen: true, kr_done: true };
const DONE = 'quest_done:The Pilgrim\'s Stamp Book';
const AFTER = 'A lit road is kinder on the knees. You can walk it at night.';
const THREE = 'Three shrines: at the foot, above the steps, and the fox shrine.';
// the three shrines and the book, where they stand
const AT = { foot: ['kr.foot', 2, 12, 26, 8], steps: ['kr.steps', 11, 34, 13, 2], fox: ['kr.fox', 8, 24, 18, 8], book: ['kr.steps', 11, 34, 13, 27] };

async function begin(p, o) {
  await p.evaluate(async (o) => {
    const s = RB.game.debugStart(o.map, o.x, o.y, { dir: 'up', edition: RB.edition.forNew(), flags: o.flags });
    s.comp = null;
    if (o.quest) s.quests.kr_stamps = o.quest;
    if (o.book) s.inv.kr_stampbook = 1;
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.save.autosave = async () => {};
    RB.test.enable({ choose: () => 0 });
    await new Promise((r) => setTimeout(r, 800));
    RB.world.refreshActors();
    window.__said = []; window.__toasts = [];
    if (!window.__wrapped) {
      window.__wrapped = true;
      const say = RB.ui.dialogue.say, toast = RB.ui.toast;
      RB.ui.dialogue.say = function (l) { if (l) window.__said.push(l.en || ''); return say.apply(this, arguments); };
      RB.ui.toast = function (x) { if (x && x.kind) window.__toasts.push(x.kind + ':' + (x.en || '')); return toast.apply(this, arguments); };
    }
  }, o);
}
// a step through the world: to a map (by transition), then pressed at a person or a thing; what was said, and after
const press = (p, where, who) => p.evaluate(async ([where, who]) => {
  window.__said = [];
  if (RB.world.W.map.id !== where[0]) await RB.test.go(where[0], where[1], where[2], 'up');
  if (who) await RB.test.talk(who); else await RB.test.use(where[3], where[4]);
  await RB.test.idle();
  const s = RB.game.s, q = s.quests.kr_stamps || null;
  RB.questGuide.reset();
  const r = RB.questGuide.targets('kr_stamps', s);
  return { said: window.__said.slice(), q, book: s.inv.kr_stampbook || 0, seals: [1, 2, 3].filter((i) => s.flags['kr_seal_' + i]), guide: (r.targets || []).map((x) => x.map + ':' + (x.id || x.p)), toasts: window.__toasts.slice() };
}, [where, who]);

// ---- 1. begun after the chapter, the whole route
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { map: 'kr.foot', x: 2, y: 12, flags: Object.assign({}, KR) });
  const first = await press(p, AT.foot, 'kr_iwa');
  const book = await press(p, AT.book);
  const thanks = await press(p, AT.fox, 'kr_iwa');
  const s3 = await press(p, AT.fox);
  const s2 = await press(p, AT.steps);
  const s1 = await press(p, AT.foot);
  const done = await press(p, AT.fox, 'kr_iwa');
  const after = await press(p, AT.fox, 'kr_iwa');
  ok(first.said.length > 0 && book.q && book.q.stage === 0 && book.book === 1 && thanks.q.stage === 1,
    '1 after the chapter: her first meeting, the book (stage 0, in the bag), her thanks (stage 1) (' + JSON.stringify({ first: first.said.slice(-1), book: book.q, thanks: thanks.q }) + ')');
  ok(JSON.stringify([thanks.guide, s3.guide, s2.guide, s1.guide]) === JSON.stringify([['kr.foot:shrine', 'kr.steps:shrine', 'kr.fox:shrine'], ['kr.foot:shrine', 'kr.steps:shrine'], ['kr.foot:shrine'], ['kr.fox:kr_iwa']]) && JSON.stringify(s1.seals) === '[1,2,3]',
    '1 the shrines, pressed: the guide marks those still to visit, then Iwa (' + JSON.stringify({ guide: [thanks.guide, s3.guide, s2.guide, s1.guide], seals: s1.seals }) + ')');
  ok(done.q && done.q.done && done.book === 0 && done.toasts.filter((x) => x === DONE).length === 1 && after.said.includes(AFTER) && after.toasts.filter((x) => x === DONE).length === 1 && !after.guide.length,
    '1 her hand-in: done once, the book taken; then her after-chapter line, nothing marked (' + JSON.stringify({ q: done.q, book: done.book, after: after.said, toasts: after.toasts.filter((x) => /quest/.test(x)) }) + ')');
  ok(!errors.length, 'begun after the chapter: no page errors ' + errors.slice(0, 3).join(' | '));
  await p.close();
}

// ---- 2. a stage-1 journey with one seal, in the postgame
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { map: 'kr.fox', x: 8, y: 24, flags: Object.assign({ kr_iwa_met: true, kr_iwa_book_found: true, kr_seal_1: true, postgame: true }, KR), quest: { stage: 1, done: false, t: 1 }, book: true });
  const asked = await press(p, AT.fox, 'kr_iwa');
  await press(p, AT.fox);
  await press(p, AT.steps);
  const done = await press(p, AT.fox, 'kr_iwa');
  ok(asked.said.includes(THREE) && !asked.q.done && done.q && done.q.done && done.book === 0 && done.toasts.filter((x) => x === DONE).length === 1,
    '2 the postgame, stage 1, one seal: her shrines line; the two shrines left; done once (' + JSON.stringify({ asked: asked.said, q: done.q, toasts: done.toasts.filter((x) => /quest/.test(x)) }) + ')');
  ok(!errors.length, 'the postgame: no page errors ' + errors.slice(0, 3).join(' | '));
  await p.close();
}

console.log(`\nkr_stamps_route: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
