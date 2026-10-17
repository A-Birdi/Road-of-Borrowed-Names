// FR-1V (Astra's verification follow-up): the loft lantern's あしのせ, on Foundations with only the vowels met, is asked
// as one blank (あ, then しのせ shown). Answered through the real challenge sheet with the pen (drawn reference strokes,
// Add character, Submit), the keyboard and by choosing, the learning records afterwards credit k:あ and keep v:葦ノ瀬
// as met with the rest supplied: no box, no independent evidence, a log line marked p. Controls through the same sheet:
// every kana met, the whole word written is credited; none met, the copy model is supported practice; "I don't know"
// on the blank is supported for the kana too.
// Usage: node tools/build.mjs && node tests/e2e/fr1_partial_word.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
let fails = 0;
const ok = (c, m) => { if (!c) fails++; console.log((c ? '  ok   ' : '  FAIL ') + m); };
const wait = (ms) => p.waitForTimeout(ms);
const WORD = 'v:葦ノ瀬';

async function drawChar(ch) {
  const box = await p.evaluate(() => { const r = document.querySelector('.chal .pad-ink').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  const strokes = await p.evaluate((ch) => { const ref = RB.recog.reference(ch); return ref.strokes.map((s) => s.map((q) => ({ x: (q.x / ref.box) * 0.8 + 0.1, y: (q.y / ref.box) * 0.8 + 0.1 }))); }, ch);
  for (const s of strokes) {
    await p.mouse.move(box.x + s[0].x * box.w, box.y + s[0].y * box.h);
    await p.mouse.down();
    for (const q of s.slice(1)) await p.mouse.move(box.x + q.x * box.w, box.y + q.y * box.h, { steps: 2 });
    await p.mouse.up();
    await wait(50);
  }
}
// the mill lantern's challenge step on a fresh Foundations journey with `taught` met, through the sheet in `mode`
async function play(taught, mode, o) {
  o = o || {};
  await p.evaluate(([taught, mode]) => {
    const s = RB.game.debugStart('rw.village', 22, 30, {});
    s.learn.profile = 'F'; s.learn.kanaKnown = 'none'; s.learn.taught = {}; s.learn.items = {}; s.learn.intro = {};
    s.learn.stats = { recog: 0, recall: 0, hand: 0, assisted: 0, typed: 0, mistakes: 0 };
    Array.from(taught).forEach((c) => (s.learn.taught[c] = true));
    const step = RB.tasks.stepsOf(RB.content.challenges['rw.c_mill_lantern'])[0];
    window.__step = step; window.__res = null;
    RB.challenge.runStep(step, { mode, ctxTag: 'rw.c_mill_lantern' }).then((r) => { window.__res = r; });
  }, [taught, mode]);
  await p.waitForSelector('.chal');
  await wait(300);
  const step = await p.evaluate(() => ({ item: window.__step.item, exposure: window.__step.exposure || null, answer: RB.tasks.plain(window.__step.answer), copy: !!window.__step.copy }));
  if (o.reveal) {
    await p.click('.chal [data-a=reveal]');
    await wait(300);
  } else if (mode === 'choice') {
    await p.evaluate((ans) => { const bs = Array.from(document.querySelectorAll('.chal .mc .btn')); const r = bs.find((x) => RB.tasks.plain(x.textContent).trim() === ans); r.click(); }, step.answer);
  } else if (mode === 'ime') {
    await p.fill('#ime-in', step.answer);
    await p.click('.chal [data-a=submit]');
  } else {
    for (const ch of Array.from(step.answer)) { await drawChar(ch); await wait(250); await p.click('.chal [data-a=confirm]'); await wait(200); }
    await p.click('.chal [data-a=submit]');
  }
  await wait(400);
  const fb = await p.evaluate(() => { const f = document.querySelector('.chal .fbwrap'); return f ? f.getAttribute('data-fb') : null; });
  await p.click('.chal .fbwrap .fb-go');
  await p.waitForFunction(() => window.__res, null, { timeout: 8000 });
  const rec = await p.evaluate((W) => {
    const L = RB.game.s.learn, pick = (r) => r && { box: r.box, ok: r.ok, seen: r.seen, modes: r.modes, ev: r.ev || {}, evTry: r.evTry || {}, last: r.log && r.log[r.log.length - 1] };
    return { kana: pick(L.items['k:あ']), word: pick(L.items[W]), met: RB.learn.introduced(W), stats: L.stats, res: { ok: window.__res.ok, assisted: window.__res.assisted, mode: window.__res.mode } };
  }, WORD);
  return Object.assign({ step, fb }, rec);
}
const EV = { hand: 'hand', ime: 'typed', choice: 'recog' };
const none = (o) => !Object.keys(o || {}).length;

for (const mode of ['hand', 'ime', 'choice']) {
  const r = await play('あいうえお', mode);
  ok(r.step.answer === 'あ' && [].concat(r.step.item).join() === 'k:あ' && (r.step.exposure || []).join() === WORD, mode + ': the sheet asks for あ, assesses k:あ, the word is exposure');
  ok(r.fb === 'ok' && r.res.ok && !r.res.assisted && r.res.mode === mode, mode + ': answered right, unaided, in ' + mode + ' (' + JSON.stringify(r.res) + ')');
  ok(r.kana && r.kana.box === 1 && r.kana.ok === 1 && r.kana.ev[EV[mode]] === 1, mode + ': k:あ credited (box 1, independent ' + EV[mode] + ')');
  ok(r.word && r.word.box === 0 && r.word.ok === 0 && none(r.word.ev) && none(r.word.evTry) && r.word.modes.assisted === 1, mode + ': the word not promoted, no independent evidence, seen with support ' + JSON.stringify(r.word && { box: r.word.box, ok: r.word.ok, ev: r.word.ev, modes: r.word.modes }));
  ok(r.word && r.word.last && r.word.last.p === 1 && r.word.last.x === 1 && r.word.last.h === 'supplied' && r.met, mode + ': its log line is marked part-asked, the rest supplied; the word is met');
  const n = r.stats.hand + r.stats.typed + r.stats.recog + r.stats.assisted;
  ok(n === 1, mode + ': one answer in the totals (' + JSON.stringify(r.stats) + ')');
}
{
  const r = await play('あいうえおしのせ', 'hand');
  ok(r.step.answer === 'あしのせ' && !r.step.exposure && r.word.box === 1 && r.word.ok === 1 && r.word.ev.hand === 1, 'control: every kana met, the whole word written with the pen is credited ' + JSON.stringify(r.word && { box: r.word.box, ev: r.word.ev }));
}
{
  const r = await play('', 'hand');
  ok(r.step.copy && r.word.box === 0 && none(r.word.ev) && r.word.modes.assisted === 1 && r.word.last.x === 1 && !r.word.last.p, 'control: no kana met, copying the model is supported practice, not independent');
}
{
  const r = await play('あいうえお', 'choice', { reveal: true });
  ok(r.fb === 'reveal' && r.res.assisted && r.kana.box === 0 && none(r.kana.ev) && r.kana.modes.assisted === 1, '"I don\'t know" on the blank: the kana is supported, not credited');
  ok(r.word.box === 0 && none(r.word.ev) && r.word.last.p === 1, 'and the word is still only met');
}
ok(!errors.length, 'no page errors ' + errors.join('; '));
await b.close();
srv.close();
console.log(fails ? fails + ' failed' : 'fr1_partial_word: all passed');
process.exit(fails ? 1 : 0);
