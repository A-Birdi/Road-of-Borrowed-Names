// The base chapters' title cards in the twelve-chapter edition (Agnes 6548127532; Local CL-568; Cloud CC-410). In
// Chromium on the built game, on throwaway journeys (never a real save), each arrival played as it plays, its card read
// from the screen as shown:
//  1. Lanternfall's arrival in a twelve-chapter journey: the card says 第八章 and "Chapter 8 — Lanternfall", and a save
//     written there lists Chapter 8;
//  2. the same arrival in a six-chapter journey: 第五章 and "Chapter 5 — Lanternfall", as before, and the save lists
//     Chapter 5;
//  3. Cinder Orchard, Snowbell and the Still Archive in a twelve-chapter journey: Chapter 5, 6 and 12;
//  no page errors.
// Usage: node tools/build.mjs && node tests/e2e/ed2_chapter_cards.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);

// the arrival's scene played on its map, the cards shown recorded as the screen shows them
async function arrive(scene, map, ed, slot) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const r = await p.evaluate(async ([scene, map, ed, slot]) => {
    const flags = { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, ch5_done: true };
    const s = RB.game.debugStart(map, 10, 10, { edition: ed === 2 ? RB.edition.forNew() : 1, comp: 'nao', flags });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.save.autosave = async () => {};
    RB.test.enable({});
    await new Promise((res) => setTimeout(res, 600));
    const cards = [];
    const seen = new Set();
    const watch = setInterval(() => {
      for (const c of document.querySelectorAll('.banner-layer .banner')) {
        if (seen.has(c)) continue;
        seen.add(c);
        const en = (c.querySelector('.en') || {}).textContent || '';
        const jp = [...c.querySelectorAll('.banner-txt rt')].map((x) => x.textContent).join('|');
        const kanji = (c.querySelector('.banner-txt') || { textContent: '' }).textContent;
        cards.push({ en, rt: jp, has: (kanji.match(/第[一二三四五六七八九十]+章/) || [''])[0] });
      }
    }, 25);
    await RB.script.run(scene, {});
    await new Promise((res) => setTimeout(res, 400));
    clearInterval(watch);
    RB.save.setCurrent(slot, 0);
    await RB.save.writeSlot(slot, RB.game.s, { force: true });
    // the slot list's metadata, as the load screen shows it (src/engine/80_save.js metaOf: RB.edition.number)
    const row = (await RB.save.list())[slot - 1];
    return { cards, edition: RB.game.s.edition, chapter: RB.game.s.chapter, key: RB.game.s.chapterKey, saved: row && row.meta ? row.meta.chapter : null };
  }, [scene, map, ed, slot]);
  await p.context().close();
  return { r, errors };
}

{
  const { r, errors } = await arrive('lf.arrive', 'lf.road', 2, 6);
  ok(r.cards.length === 1 && r.cards[0].has === '第八章' && r.cards[0].en === 'Chapter 8 — Lanternfall' && r.saved === 8 && r.chapter === 5 && r.key === 'lf',
    '1 Lanternfall, twelve chapters: 第八章, "Chapter 8 — Lanternfall", and the save lists Chapter 8 (internal chapter 5, lf) ' + flat(r));
  ok(!errors.length, '1 no page errors ' + errors.slice(0, 3).join(' | '));
}
{
  const { r, errors } = await arrive('lf.arrive', 'lf.road', 1, 6);
  ok(r.cards.length === 1 && r.cards[0].has === '第五章' && r.cards[0].en === 'Chapter 5 — Lanternfall' && r.saved === 5 && r.edition === 1,
    '2 Lanternfall, six chapters: 第五章, "Chapter 5 — Lanternfall" as before, and the save lists Chapter 5 ' + flat(r));
  ok(!errors.length, '2 no page errors ' + errors.slice(0, 3).join(' | '));
}
for (const [scene, map, has, en, n] of [
  ['co.arrive', 'co.road', '第五章', 'Chapter 5 — Cinder Orchard', 5],
  ['sb.arrive', 'sb.road', '第六章', 'Chapter 6 — Snowbell', 6],
  ['sa.arrive', 'sa.road', '第十二章', 'Chapter 12 — The Still Archive', 12],
]) {
  const { r, errors } = await arrive(scene, map, 2, 6);
  ok(r.cards.length === 1 && r.cards[0].has === has && r.cards[0].en === en && r.saved === n,
    '3 ' + scene + ', twelve chapters: ' + has + ', "' + en + '", and the save lists Chapter ' + n + ' ' + flat(r));
  ok(!errors.length, '3 ' + scene + ': no page errors ' + errors.slice(0, 3).join(' | '));
}

console.log(`\ned2_chapter_cards: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
