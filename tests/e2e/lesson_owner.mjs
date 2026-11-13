// A kana lesson belongs to the journey it was opened in (Agnes 6852801783, 6853081234; Local CL-799, CL-801; Cloud
// CC-573, CC-574), in the browser, on Foundations journeys made for the test and the stand-in save slots of a fresh
// context (never a real save). The lesson's real sheet is pressed through page by page and its real practice sheets
// are answered by click:
//  1. positive controls, in one journey: the next row's sheet, then its practice pass of three steps: "Skip practice"
//     moves on to the next step, a right answer and "I don't know" are both recorded; the row is taught, introduced
//     and counted. The kana for one task (`!lesson kana for <challenge>`): its sheet, then those kana taught and
//     introduced;
//  2. another journey loaded while the row's sheet is up (another slot, then the same slot), and the sheet then
//     pressed through to its end; another journey loaded while a practice step is up with more to come (another
//     slot with "I don't know", another slot with "Skip practice", the same slot with the right answer), and that
//     step then finished; the kana for one task with its sheet up (another slot, the same slot). Each time: no
//     further sheet of the old lesson opens; the journey loaded is exactly as it was once its load had finished
//     (compared: learn as a whole, i.e. taught, intro, kanaGroup, items and their evidence, stats, clock; the
//     top-level meter; flags; vars; the History backlog); the old journey's saved record is unchanged (compared: its
//     learn and flags);
//     the lesson's promise resolves;
//  3. no page errors.
// Not compared: playtime and the load's own bookkeeping outside those fields. Usage: node tools/build.mjs && node
// tests/e2e/lesson_owner.mjs   (RB_PAGE=<file> for another page)
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
const wait = (ms) => p.waitForTimeout(ms);
const flat = (x) => JSON.stringify(x);

await p.evaluate(async () => {
  RB.test.disable();
  const mk = (name) => {
    const s = RB.game.debugStart('rw.village', 22, 18, { edition: 2, comp: 'mio', flags: { departed: true } });
    s.learn.profile = 'F'; s.learn.kanaKnown = 'none'; s.learn.taught = {}; s.player.name = name;
    return s;
  };
  await RB.save.writeSlot(1, mk('Lesson A'), { force: true });
  await RB.save.writeSlot(2, mk('Lesson B'), { force: true });
  window.__load = async (slot) => {
    await RB.game.loadCampaign(slot, 'manual');
    Object.assign(RB.game.settings, { textSpeed: 'instant', input: 'choice' }); RB.game.applySettings();
    await new Promise((r) => setTimeout(r, 500));
  };
  window.__snap = () => { const s = RB.game.s; return JSON.stringify({ learn: s.learn, meter: s.meter, flags: s.flags, vars: s.vars, backlog: s.backlog }); };
  window.__saved = async (slot) => { const r = await RB.save.read(slot, 'manual'); return JSON.stringify(r.state.learn) + JSON.stringify(r.state.flags); };
  // a task whose answer needs kana this journey hasn't met (for `!lesson kana for <challenge>`)
  window.__jitId = Object.keys(RB.content.challenges).find((id) => { try { return RB.lessons.kanaFor(RB.game.s, id).chars.length >= 2; } catch (e) { return false; } });
  window.__start = (args) => { window.__ldone = false; window.__sheets = 0; RB.lessons.run('kana', args).then(() => { window.__ldone = true; }); };
  window.__card = () => !!document.querySelector('.lesson [data-a=next]');
  window.__sheet = () => !!document.querySelector('.chal');
  window.__pages = async () => {
    let n = 0;
    for (let i = 0; i < 40; i++) { const x = document.querySelector('.lesson [data-a=next]'); if (!x) break; x.click(); n++; await new Promise((r) => setTimeout(r, 60)); }
    return n;
  };
  // the right option's button on the sheet on screen (choice input)
  window.__rightBtn = () => {
    const st = RB.challenge.current();
    if (!st) return null;
    const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
    const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.learnUi.mixed(o.en) + '</span>' : '');
    const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => txt(html(o)));
    return [...document.querySelectorAll('.chal .mc .btn, .chal .mc .choice')].find((x) => right.includes(x.textContent.replace(/\s+/g, ' ').trim())) || null;
  };
  // finish the practice sheet on screen: 'right' | 'reveal' | 'leave'; what it was about
  window.__finish = async (how) => {
    const chal = document.querySelector('.chal');
    if (!chal) return { r: 'no sheet' };
    const st = RB.challenge.current(), item = st && st.item;
    if (how === 'leave') chal.querySelector('[data-a=leave]').click();
    else if (how === 'reveal') chal.querySelector('[data-a=reveal]').click();
    else {
      const ch = chal.querySelector('[data-mode=choice]');
      if (ch && ch.getAttribute('aria-selected') !== 'true') { ch.click(); await new Promise((r) => setTimeout(r, 200)); }
      // a step with no choices to make: answered with "I don't know" instead, which also completes it (reported)
      const btn = window.__rightBtn();
      if (btn) btn.click(); else { chal.querySelector('[data-a=reveal]').click(); how = 'revealed (no choice in a ' + (st && st.kind) + ' step)'; }
    }
    await new Promise((r) => setTimeout(r, 400));
    const c = [...document.querySelectorAll('.chal .fbwrap button')].find((x) => /Continue/.test(x.textContent));
    if (c) c.click();
    await new Promise((r) => setTimeout(r, 600));
    return { r: how === 'right' ? 'done' : how, item };
  };
});
const settle = async (ms = 3000) => { for (let i = 0; i < ms / 100 && !(await p.evaluate(() => window.__ldone || window.__sheet() || window.__card())); i++) await wait(100); };

// ---- 1. positive controls, in one journey ----------------------------------------------------------------------------
{
  await p.evaluate(() => window.__load(1));
  const row = await p.evaluate(() => { const ng = RB.lessons.nextGroup(RB.game.s); return { i: ng.i, chars: RB.lessons.groupChars(RB.lessons.groups()[ng.i]).map((c) => c.ch) }; });
  await p.evaluate(() => window.__start()); await wait(500);
  const card = await p.evaluate(() => window.__card());
  const pages = await p.evaluate(() => window.__pages()); await wait(500);
  const s1 = await p.evaluate(() => window.__sheet());
  const f1 = await p.evaluate(() => window.__finish('leave')); await wait(300);
  const s2 = await p.evaluate(() => window.__sheet());
  const f2 = await p.evaluate(() => window.__finish('right')); await wait(300);
  const s3 = await p.evaluate(() => window.__sheet());
  const f3 = await p.evaluate(() => window.__finish('reveal')); await settle();
  const got = await p.evaluate(([chars, a, b, c]) => {
    const l = RB.game.s.learn, intro = JSON.stringify(l.intro || {});
    const rec = (it) => !!(it && l.items[it] && l.items[it].seen > 0);
    return { taught: chars.every((ch) => l.taught[ch]), intro: chars.every((ch) => intro.includes('k:' + ch)), group: l.kanaGroup, skipped: !rec(a), right: rec(b), revealed: rec(c), done: window.__ldone, sheet: window.__sheet() };
  }, [row.chars, f1.item, f2.item, f3.item]);
  ok(card && pages === row.chars.length && s1 && s2 && s3 && (f2.r === 'done' || /^revealed/.test(f2.r)) && got.taught && got.intro && got.group === row.i + 1 && got.skipped && got.right && got.revealed && got.done && !got.sheet,
    '1 one journey: the row\'s sheet (' + pages + ' pages), then its practice: "Skip practice" moves on, a right answer and "I don\'t know" recorded; taught, introduced, counted ' + flat({ card, s: [s1, s2, s3], items: [f1.item, f2.item, f3.item], f2: f2.r, got }));
}
{
  await p.evaluate(() => window.__load(1));
  const id = await p.evaluate(() => window.__jitId);
  const chars = await p.evaluate((id) => RB.lessons.kanaFor(RB.game.s, id).chars, id);
  await p.evaluate((id) => window.__start(['for', id]), id); await wait(500);
  const card = await p.evaluate(() => window.__card());
  await p.evaluate(() => window.__pages()); await settle();
  const got = await p.evaluate((chars) => { const l = RB.game.s.learn, intro = JSON.stringify(l.intro || {}); return { taught: chars.every((ch) => l.taught[ch]), intro: chars.every((ch) => intro.includes('k:' + ch)), done: window.__ldone, sheet: window.__sheet() }; }, chars);
  ok(!!id && card && got.taught && got.intro && got.done && !got.sheet, '1 one journey, the kana for one task (' + id + ': ' + chars.join(' ') + '): its sheet, then taught and introduced ' + flat(got));
}

// ---- 2. another journey loaded while the lesson is up -------------------------------------------------------------
function diff(a, b) {
  const x = JSON.parse(a), y = JSON.parse(b), out = [];
  const walk = (u, v, path) => {
    if (JSON.stringify(u) === JSON.stringify(v)) return;
    if (u && v && typeof u === 'object' && typeof v === 'object') { for (const k of new Set([...Object.keys(u), ...Object.keys(v)])) walk(u[k], v[k], path + '.' + k); return; }
    out.push(path + ': ' + JSON.stringify(u) + ' -> ' + JSON.stringify(v));
  };
  walk(x, y, '');
  return out.slice(0, 8).join(' | ');
}
// at: 'card' (the row's sheet) | 'practice' (its first practice step, two more to come) | 'jit' (the kana for one task)
async function staleCase(name, o) {
  await p.evaluate(() => window.__load(1));
  if (o.at === 'jit') await p.evaluate(() => window.__start(['for', window.__jitId]));
  else await p.evaluate(() => window.__start());
  await wait(500);
  if (o.at === 'practice') { await p.evaluate(() => window.__pages()); await wait(500); }
  const open = await p.evaluate((at) => (at === 'practice' ? window.__sheet() : window.__card()), o.at);
  await p.evaluate((slot) => window.__load(slot), o.into);
  const savedA = await p.evaluate(() => window.__saved(1));
  const before = await p.evaluate(() => window.__snap());
  const into = await p.evaluate(() => RB.game.s.player.name);
  // finish the old lesson's interface
  if (o.at === 'practice') await p.evaluate((f) => window.__finish(f), o.finish);
  else await p.evaluate(() => window.__pages());
  await wait(1200);
  const after = await p.evaluate(() => window.__snap());
  const left = await p.evaluate(() => ({ sheet: window.__sheet(), card: window.__card(), done: window.__ldone }));
  const savedA2 = await p.evaluate(() => window.__saved(1));
  ok(open && before === after && !left.sheet && !left.card && left.done && savedA === savedA2,
    '2 ' + name + ': no further sheet of the old lesson; the journey loaded (' + into + ') exactly as before; the old journey\'s saved record unchanged '
      + flat({ open, same: before === after, left, savedSame: savedA === savedA2 }) + (before === after ? '' : ' DIFF ' + diff(before, after)));
}
await staleCase('the row\'s sheet up, another slot loaded, the sheet then pressed through', { at: 'card', into: 2 });
await staleCase('the row\'s sheet up, the same slot loaded again, the sheet then pressed through', { at: 'card', into: 1 });
await staleCase('a practice step up (two more to come), another slot loaded, then "I don\'t know"', { at: 'practice', into: 2, finish: 'reveal' });
await staleCase('a practice step up (two more to come), another slot loaded, then "Skip practice"', { at: 'practice', into: 2, finish: 'leave' });
await staleCase('a practice step up (two more to come), the same slot loaded again, then the right answer', { at: 'practice', into: 1, finish: 'right' });
await staleCase('the kana for one task, its sheet up, another slot loaded', { at: 'jit', into: 2 });
await staleCase('the kana for one task, its sheet up, the same slot loaded again', { at: 'jit', into: 1 });

ok(!errors.length, '3 no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
await ctx.close(); await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
