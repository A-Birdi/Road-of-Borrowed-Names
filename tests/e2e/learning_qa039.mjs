// Agnes's learning findings, in Chromium on the built game:
//  RBN-QA-039: a combined kana's lesson page (きゃ, ファ, ティ) showed blank paper under "Numbered strokes": each of its
//    kana now has its own box, numbered from 1, with its own label ("Stroke order for き", "… for small ゃ"), drawn,
//    inside the space one box takes (a phone too); a single kana (あ) is as before; the animation of every box stops
//    when the page changes (Back, Next) and when the lesson closes.
//  RBN-QA-042 (the lesson page): っ and ー are labelled in words (the group's own label), not "read '" / "read -".
//  RBN-QA-040: after a letter is delivered the feedback scrolls the page down; "Next letter" now starts the next letter
//    at the top, focused (and the order activity's "Next customer", the same pattern, likewise).
// Usage: node tools/build.mjs && node tests/e2e/learning_qa039.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

// open the lesson whose group holds `ch`, every earlier group taught
async function lessonWith(p, ch, o = {}) {
  await p.evaluate(([ch, o]) => {
    const s = RB.game.debugStart('rw.village', 22, 30, {});
    s.learn.profile = 'F'; s.learn.kanaKnown = 'none'; s.learn.taught = {};
    RB.game.settings.reducedMotion = !!o.reduced; RB.game.applySettings();
    const gs = RB.lessons.groups();
    const gi = gs.findIndex((g) => RB.lessons.groupChars(g).some((c) => c.ch === ch));
    for (let i = 0; i < gi; i++) for (const c of RB.lessons.groupChars(gs[i])) { s.learn.taught[c.ch] = true; for (const x of Array.from(c.ch)) s.learn.taught[x] = true; }
    RB.lessons.run('kana');
  }, [ch, o]);
  await p.waitForSelector('.lsheet.lesson .kbig');
  // to the page of `ch`
  // (the combinations' group has 33 pages: ぴょ is the last)
  for (let i = 0; i < 60; i++) {
    const cur = await p.evaluate(() => document.querySelector('.lsheet.lesson .kbig').textContent);
    if (cur === ch) break;
    await p.click('.lsheet.lesson [data-a=next]');
    await p.waitForFunction((cur) => document.querySelector('.lsheet.lesson .kbig').textContent !== cur, cur);
  }
  await p.waitForTimeout(900);
  return p.evaluate(async () => {
    const fig = document.querySelector('.lsheet.lesson .lesson-demo'), cvs = fig ? [...fig.querySelectorAll('canvas')] : [];
    // the ink, at its most over a few moments: the demonstration loops, and between loops a box is blank for an instant
    const ink = () => cvs.map((cv) => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] < 120 && d[i + 1] < 120) n++; return n; });
    let inked = ink();
    for (let k = 0; k < 6; k++) { await new Promise((r) => setTimeout(r, 250)); inked = ink().map((n, j) => Math.max(n, inked[j])); }
    const set = fig && fig.querySelector('.lesson-demo-set'), leaf = document.querySelector('.lsheet.lesson .leaf') || document.querySelector('.lsheet.lesson');
    return {
      ch: document.querySelector('.lsheet.lesson .kbig').textContent,
      rom: document.querySelector('.lsheet.lesson .lesson-char figcaption').textContent.trim(),
      labels: cvs.map((c) => c.getAttribute('aria-label')), inked,
      caption: fig ? fig.querySelector('figcaption').textContent : null,
      setW: set ? Math.round(set.getBoundingClientRect().width) : null, oneW: cvs[0] ? Math.round(cvs[0].getBoundingClientRect().width) : null,
      overflow: leaf ? leaf.scrollWidth > leaf.clientWidth + 1 : null, nodemo: !!document.querySelector('.lsheet.lesson .lesson-nodemo'),
    };
  });
}

// 1. combined kana
for (const [ch, parts] of [['きゃ', ['き', 'small ゃ']], ['ぴょ', ['ぴ', 'small ょ']], ['キャ', ['キ', 'small ャ']], ['ファ', ['フ', 'small ァ']], ['ティ', ['テ', 'small ィ']]]) {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 800 } });
  const r = await lessonWith(p, ch);
  ok(r.ch === ch && r.labels.length === 2 && r.labels[0] === 'Stroke order for ' + parts[0] && r.labels[1] === 'Stroke order for ' + parts[1], ch + ': one box per kana, each labelled (' + JSON.stringify(r.labels) + ')');
  ok(r.inked.every((n) => n > 20), ch + ': both boxes drawn (' + JSON.stringify(r.inked) + ')');
  ok(/Each kana with its own numbered strokes/.test(r.caption || ''), ch + ': the caption says each kana is numbered on its own');
  ok(r.setW && r.setW <= 242, ch + ': the two boxes fit the space of one (' + r.setW + 'px)');
  ok(!errors.length, ch + ': no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// a phone, reduced motion
{
  const { p, errors } = await page(b, url, { viewport: { width: 390, height: 844 } });
  const r = await lessonWith(p, 'きょ', { reduced: true });
  ok(r.labels.length === 2 && r.inked.every((n) => n > 20) && !r.overflow, 'a phone, reduced motion: きょ has two drawn boxes and the page does not overflow (' + JSON.stringify({ inked: r.inked, setW: r.setW, overflow: r.overflow }) + ')');
  ok(!errors.length, 'phone: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// a single kana, as before; っ and ー labelled in words
{
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 800 } });
  const r = await lessonWith(p, 'あ');
  ok(r.labels.length === 1 && r.labels[0] === 'Stroke order for あ' && r.inked[0] > 20 && /^Numbered strokes from the reference data/.test(r.caption) && r.rom === 'read a', 'あ: one box, its caption and "read a" as before (' + JSON.stringify(r) + ')');
  await p.close();
  const q = await page(b, url, { viewport: { width: 1180, height: 800 } });
  const t = await lessonWith(q.p, 'っ');
  ok(t.ch === 'っ' && /doubles the next consonant/.test(t.rom) && !/'|read/.test(t.rom), 'っ: labelled "doubles the next consonant", no apostrophe (' + t.rom + ')');
  ok(t.labels.length === 1 && t.labels[0] === 'Stroke order for small っ' && t.inked[0] > 5, 'っ: its own box, "small っ" (' + JSON.stringify(t.labels) + ')');
  await q.p.close();
  const v = await page(b, url, { viewport: { width: 1180, height: 800 } });
  const u = await lessonWith(v.p, 'ー');
  ok(u.ch === 'ー' && /long vowel/.test(u.rom) && !/-|read/.test(u.rom.replace('long vowel', '')), 'ー: labelled "long vowel", no dash (' + u.rom + ')');
  await v.p.close();
  ok(!errors.length && !q.errors.length && !v.errors.length, 'single kana: no page errors');
}
// the animation of every box stops when the page changes (Back, Next) and when the lesson closes (its last page)
{
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 800 } });
  const hash = () => p.evaluate(() => (window.__cv || []).map((cv) => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let h = 0; for (let i = 0; i < d.length; i += 97) h = (h * 31 + d[i]) | 0; return h; }).join(','));
  const grab = () => p.evaluate(() => { window.__cv = [...document.querySelectorAll('.lsheet.lesson .lesson-demo canvas')]; return window.__cv.length; });
  const moving = async () => { const a = await hash(); await p.waitForTimeout(450); return a !== (await hash()); };
  const still = async () => { await p.waitForTimeout(150); const a = await hash(); await p.waitForTimeout(900); return a === (await hash()); };
  await lessonWith(p, 'きゅ');
  const n1 = await grab(), m1 = await moving();
  await p.click('.lsheet.lesson [data-a=prev]');
  ok(n1 === 2 && m1 && (await still()), 'Back: both boxes of the page left stop drawing (' + JSON.stringify({ boxes: n1, movingBefore: m1 }) + ')');
  const n2 = await grab(), m2 = await moving();
  await p.click('.lsheet.lesson [data-a=next]');
  ok(n2 === 2 && m2 && (await still()), 'Next: both boxes of the page left stop drawing (' + JSON.stringify({ boxes: n2, movingBefore: m2 }) + ')');
  await p.close();
  const q = await page(b, url, { viewport: { width: 1180, height: 800 } });
  const r = await lessonWith(q.p, 'ぴょ');
  const n3 = await q.p.evaluate(() => { window.__cv = [...document.querySelectorAll('.lsheet.lesson .lesson-demo canvas')]; return window.__cv.length; });
  const label = await q.p.evaluate(() => document.querySelector('.lsheet.lesson [data-a=next]').textContent.trim());
  await q.p.click('.lsheet.lesson [data-a=next]');
  const closed = await q.p.waitForFunction(() => !document.querySelector('.lsheet.lesson'), null, { timeout: 5000 }).then(() => true, () => false);
  const h = () => q.p.evaluate(() => window.__cv.map((cv) => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let h = 0; for (let i = 0; i < d.length; i += 97) h = (h * 31 + d[i]) | 0; return h; }).join(','));
  await q.p.waitForTimeout(150); const a = await h(); await q.p.waitForTimeout(900); const z = await h();
  ok(r.ch === 'ぴょ' && n3 === 2 && closed && a === z, 'the last page (' + label + '): the lesson closes and both boxes stop drawing (' + JSON.stringify({ ch: r.ch, boxes: n3, closed, same: a === z }) + ')');
  ok(!errors.length && !q.errors.length, 'stopping: no page errors ' + errors.concat(q.errors).slice(0, 2).join(' | '));
  await q.p.close();
}
// 2. Next letter / Next customer start at the top
async function nextAtTop(kind) {
  const { p, errors } = await page(b, url, { viewport: { width: 390, height: 640 } });
  await p.evaluate((kind) => { const s = RB.game.debugStart('co.village', 20, 18, {}); s.learn.profile = 'E'; RB.activities.run(kind === 'letters' ? 'co.a_letters' : 'co.a_orders'); }, kind);
  await p.waitForSelector('.lsheet.activity [data-tr]');
  // editing the current one keeps the page where it was: Translate (letters), a tile on the tray (orders)
  const keep = await p.evaluate(async (kind) => {
    const el = document.querySelector('.lsheet.activity .leaf'); el.scrollTop = 60; const at = el.scrollTop;
    document.querySelector(kind === 'letters' ? '.lsheet.activity [data-tr]' : '.lsheet.activity [data-add]').click();
    await new Promise((r) => setTimeout(r, 200));
    const now = el.scrollTop;
    if (kind === 'orders') { document.querySelector('.lsheet.activity [data-rm]').click(); await new Promise((r) => setTimeout(r, 100)); }
    el.scrollTop = 0;
    return { at, now };
  }, kind);
  if (kind === 'letters') {
    const to = await p.evaluate(() => {
      const flat = (el) => el.textContent.replace(/\s+/g, '');
      const shown = flat(document.querySelector('.lsheet.activity .letter-jp'));
      const txt = (jp) => { const d = document.createElement('div'); d.innerHTML = RB.ui.jhtml(jp); return flat(d); };
      const cands = (t) => (t.jp ? [t.jp] : Object.values(t).filter((v) => v && v.jp).map((v) => v.jp));
      const L = RB.content.activities['co.a_letters'].letters.find((x) => cands(x.text).some((jp) => txt(jp) === shown));
      return L && L.to;
    });
    await p.click('.lsheet.activity [data-to="' + to + '"]');
  } else {
    const want = await p.evaluate(() => RB.content.activities['co.a_orders'].customers[0].want);
    for (const k of Object.keys(want)) for (let n = 0; n < want[k]; n++) await p.click('.lsheet.activity [data-add="' + k + '"]');
    await p.click('.lsheet.activity [data-serve]');
  }
  await p.waitForSelector('.lsheet.activity [data-next]');
  await p.waitForTimeout(400);
  const body = () => p.evaluate(() => { const el = document.querySelector('.lsheet.activity .leaf'); return el ? el.scrollTop : null; });
  const down = await body();
  await p.click('.lsheet.activity [data-next]');
  await p.waitForTimeout(400);
  const top = await body();
  const focus = await p.evaluate(() => { const a = document.activeElement; return a ? (a.className || a.tagName) : null; });
  await p.close();
  return { keep, down, top, focus, errors };
}
{
  const r = await nextAtTop('letters');
  ok(r.down > 0, 'letters: the delivered feedback scrolled the page down (' + r.down + ')');
  ok(r.top === 0 && /letter/.test(r.focus || ''), 'letters: "Next letter" starts at the top, the letter focused (' + JSON.stringify(r) + ')');
  ok(r.keep.at > 0 && r.keep.now === r.keep.at, 'letters: Translate (the same letter) keeps the page where it was (' + JSON.stringify(r.keep) + ')');
  ok(!r.errors.length, 'letters: no page errors ' + r.errors.slice(0, 2).join(' | '));
  const o = await nextAtTop('orders');
  // (the sibling, reproduced on its own: the order activity's feedback scrolls the page as the letters' does)
  ok(o.down > 0, 'orders: the served feedback scrolled the page down (' + o.down + ')');
  ok(o.top === 0 && /act-say/.test(o.focus || ''), 'orders: "Next customer" starts at the top, the customer focused (' + JSON.stringify(o) + ')');
  ok(o.keep.at > 0 && o.keep.now === o.keep.at, 'orders: a tile added to the tray (the same customer) keeps the page where it was (' + JSON.stringify(o.keep) + ')');
  ok(!o.errors.length, 'orders: no page errors ' + o.errors.slice(0, 2).join(' | '));
}
console.log(`\nlearning_qa039: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
