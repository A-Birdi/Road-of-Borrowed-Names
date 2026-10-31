// The kana lesson before the Chronicle Hall's two puzzles (Robin's approval of D: Agnes 6544426511, 6544575390; Cloud
// CC-397; Local CL-553). In Chromium on the built game, on a throwaway Foundations journey seeded in the Chronicle Hall
// (never a real save), the desk and the reading table used through the world's own interact, the lesson's real pages
// pressed through one by one, and every line, page and practice step recorded in order (the puzzles themselves are
// stood in for: they are not what moved):
//  1. the desk: the calm beat; then the lesson's own sheet, 20 pages (the hiragana dakuten row), Next on each and
//     "Practice these" on the last; then its practice, three steps, each offering "Skip practice"; then Tokiwa's
//     first line and the reading; then the puzzle;
//  2. the reading table, next: the calm beat; the next row's sheet, 5 pages (handakuten); its practice; then the
//     books laid out and Tokiwa's "…Let us look. Fairly."; then the puzzle;
//  no page errors.
// Usage: node tools/build.mjs && node tests/e2e/lesson_pacing.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

async function begin(p) {
  await p.evaluate(async () => {
    const s = RB.game.debugStart('co.hall', 6, 7, { dir: 'up', edition: RB.edition.forNew(), flags: { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, co_met_sayo: true, co_suspect: true } });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    // Foundations, every row before the hiragana dakuten taught
    s.learn.profile = 'F'; s.learn.kanaKnown = 'none'; s.learn.taught = {};
    const G = RB.lessons.groups(), stop = G.findIndex((g) => g.id === 'h_dakuten');
    for (let i = 0; i < stop; i++) for (const c of RB.lessons.groupChars(G[i])) s.learn.taught[c.ch] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.save.autosave = async () => {};
    // what was said, in order, with the lesson's sheet and its practice; the puzzles themselves stood in for
    window.__ev = [];
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) { if (l) window.__ev.push('say:' + (l.en || '')); return say.apply(this, arguments); };
    RB.challenge.run = async (id) => { window.__ev.push('challenge:' + id); return { ok: true }; };
    await new Promise((r) => setTimeout(r, 600));
    RB.world.refreshActors();
  });
}
// stand at (x, y) facing the thing, press it, then play the scene through as a player: dialogue advanced, the lesson's
// pages pressed one by one, each practice step skipped; what was pressed, in order
async function use(p, x, y, dir) {
  await p.evaluate(([x, y, dir]) => { RB.test.place(x, y, dir); RB.world.interact(); }, [x, y, dir]);
  const out = { pages: 0, labels: [], skips: [] };
  let open = false;
  for (let i = 0; i < 1200; i++) {
    const v = await p.evaluate(() => {
      const next = document.querySelector('.lesson [data-a=next]');
      return { next: next ? next.textContent.replace(/\s+/g, ' ').trim() : null, skip: [...document.querySelectorAll('.chal [data-a=leave]')].map((x) => x.textContent.replace(/\s+/g, ' ').trim()), dlg: RB.ui.dialogue.isOpen(), running: RB.script.isRunning() };
    });
    if (v.next != null) {
      if (!open) { open = true; await p.evaluate(() => window.__ev.push('lesson:open')); }
      out.pages++; out.labels.push(v.next);
      await p.evaluate(() => document.querySelector('.lesson [data-a=next]').click());
      await p.waitForTimeout(60);
      continue;
    }
    if (open) { open = false; await p.evaluate(() => window.__ev.push('lesson:closed')); }
    if (v.skip.length) {
      out.skips.push(v.skip[0]);
      await p.evaluate(() => { window.__ev.push('practice'); document.querySelector('.chal [data-a=leave]').click(); });
      await p.waitForTimeout(120);
      continue;
    }
    if (v.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(40); continue; }
    if (!v.running && i > 5) break;
    await p.waitForTimeout(60);
  }
  out.ev = await p.evaluate(() => window.__ev.splice(0));
  return out;
}
const at = (ev, re) => ev.findIndex((x) => (re instanceof RegExp ? re.test(x) : x === re));
const inOrder = (xs) => xs.every((x) => x >= 0) && xs.every((x, i) => !i || x > xs[i - 1]);

{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p);
  // ---- 1. the desk
  const d = await use(p, 5, 4, 'up');
  const dIdx = [at(d.ev, 'say:Before you read, you take a breath.'), at(d.ev, 'lesson:open'), at(d.ev, 'lesson:closed'), at(d.ev, 'practice'), at(d.ev, /^say:The chronicle\. From the founding/), at(d.ev, 'challenge:co.c_chronicle')];
  const dLabels = d.labels.slice(0, -1).every((l) => l === 'Next') && d.labels[d.labels.length - 1] === 'Practice these';
  ok(inOrder(dIdx) && d.pages === 20 && dLabels && d.skips.length === 3 && d.skips.every((x) => x === 'Skip practice') && d.ev.filter((x) => x === 'lesson:open').length === 1,
    '1 the desk: the beat; the lesson\'s sheet, 20 pages, Next on each and "Practice these" on the last; three practice steps, each with "Skip practice"; then Tokiwa, then the puzzle (' + JSON.stringify({ dIdx, pages: d.pages, last: d.labels.slice(-1), skips: d.skips }) + ')');
  // ---- 2. the reading table, next
  await p.evaluate(() => { RB.game.s.quests.co_main = { stage: 4, done: false, t: 1 }; });
  const r = await use(p, 9, 7, 'up');
  const rIdx = [at(r.ev, 'say:Before you lay the books out, you take a breath.'), at(r.ev, 'lesson:open'), at(r.ev, 'lesson:closed'), at(r.ev, 'practice'), at(r.ev, /^say:On the reading table/), at(r.ev, /^say:…Let us look\. Fairly\./), at(r.ev, 'challenge:co.c_records')];
  ok(inOrder(rIdx) && r.pages === 5 && r.labels[r.labels.length - 1] === 'Practice these' && r.skips.length === 3 && r.skips.every((x) => x === 'Skip practice'),
    '2 the reading table: the beat; the next row\'s sheet, 5 pages; its practice; then the books and Tokiwa, then the puzzle (' + JSON.stringify({ rIdx, pages: r.pages, skips: r.skips }) + ')');
  ok(!errors.length, 'the Chronicle Hall: no page errors ' + errors.slice(0, 3).join(' | '));
  await p.close();
}

console.log(`\nlesson_pacing: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
