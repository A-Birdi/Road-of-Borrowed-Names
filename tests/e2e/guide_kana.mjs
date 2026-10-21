// RBN-QA-039 follow-up (Local CL-076, agreed by Agnes 6310432291 and Cloud): the Ledger's Guide → Kana reference
// shows a combination as the lesson does, each kana in its own box with its own numbered strokes, in the Guide's
// 160 px, and names っ/ッ/ー in words. In Chromium on the built game:
//  1. a single kana (か) keeps its one 160 px canvas, as before, and its reading;
//  2. a combination (きゃ, and ティ): two boxes side by side inside the same 160 px, each labelled (small ゃ said so),
//     each drawn; pressing another kana stops every box's animation;
//  3. っ, ッ, ー: the info line and the cell's label in words ("doubles the next consonant", "long vowel"), no
//     apostrophe or dash; every other cell's label is its reading as before (を/ヲ: "wo (o)", as on the lesson sheet);
//  4. no demonstration for a character with no reference: the lesson's line, no blank canvas (the helper itself:
//     every kana in the chart has a reference);
//  5. on a phone (390 × 844): the boxes fit, nothing overflows; no page errors.
// Usage: node tools/build.mjs && node tests/e2e/guide_kana.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

async function open(viewport) {
  const { p, errors } = await page(b, url, { viewport });
  await p.evaluate(() => {
    const s = RB.game.debugStart('rw.millroad', 10, 22, { edition: RB.edition.forNew(), comp: 'suzu' });
    s.learn.kanaKnown = 'both';
    // (count the animations stopped)
    window.__cancels = 0; const caf = window.cancelAnimationFrame.bind(window); window.cancelAnimationFrame = (id) => { window.__cancels++; return caf(id); };
    RB.ui.menu.open('words');
  });
  await p.waitForTimeout(400);
  await p.click('.folio [data-sub="guide"]');
  await p.waitForTimeout(300);
  await p.click('.folio [data-g="kana"]');
  await p.waitForTimeout(300);
  return { p, errors };
}
const pick = async (p, ch) => { await p.evaluate((ch) => { const c = [...document.querySelectorAll('.kcell')].find((x) => x.dataset.k === ch); c.scrollIntoView({ block: 'center' }); }, ch); await p.click('.kcell[data-k="' + ch + '"]'); await p.waitForTimeout(1200); };
const shown = (p) => p.evaluate(() => {
  // (an older page has no .kdemo-fig: its one canvas sits in .kdemo-box)
  const fig = document.querySelector('.kdemo-fig') || document.querySelector('.kdemo-box');
  const cvs = [...fig.querySelectorAll('canvas')];
  const fr = (cvs[0] && !document.querySelector('.kdemo-fig') ? cvs[0] : fig).getBoundingClientRect();
  const inked = (cv) => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] < 120 && d[i + 1] < 120) n++; return n; };
  return {
    n: cvs.length, single: cvs.length === 1 && cvs[0].classList.contains('kdemo'),
    attrs: cvs.map((c) => c.width), boxes: cvs.map((c) => { const r = c.getBoundingClientRect(); return [Math.round(r.left - fr.left), Math.round(r.width), Math.round(r.height)]; }),
    figW: Math.round(fr.width), labels: cvs.map((c) => c.getAttribute('aria-label')), ink: cvs.map(inked),
    info: [...document.querySelectorAll('.kinfo div')].map((x) => x.textContent.trim()),
    line: ((fig.querySelector('.lesson-nodemo') || {}).textContent || '').trim(),
  };
});

// 1-4 on a desktop
{
  const { p, errors } = await open({ width: 1280, height: 860 });
  await pick(p, 'か');
  const ka = await shown(p);
  ok(ka.single && ka.attrs[0] === 160 && ka.boxes[0][1] === 160 && ka.boxes[0][2] === 160 && ka.ink[0] > 0 && ka.info[1] === 'ka', 'か: one 160 px canvas as before, drawn, read "ka" (' + JSON.stringify(ka) + ')');
  const c0 = await p.evaluate(() => window.__cancels);
  await pick(p, 'きゃ');
  const kya = await shown(p);
  const c1 = await p.evaluate(() => window.__cancels);
  ok(kya.n === 2 && kya.attrs.every((w) => w === 80) && kya.boxes.every((x) => x[0] >= 0 && x[0] + x[1] <= 160 && Math.abs(x[1] - x[2]) <= 1) && kya.ink.every((n) => n > 0) && kya.labels[0] === 'Stroke order for き' && kya.labels[1] === 'Stroke order for small ゃ' && kya.info[1] === 'kya', 'きゃ: two square boxes inside the 160 px, each drawn and labelled, read "kya" (' + JSON.stringify(kya) + ')');
  ok(c1 - c0 === 1, 'from か to きゃ: its one animation stopped (' + (c1 - c0) + ')');
  await pick(p, 'ティ');
  const ti = await shown(p);
  const c2 = await p.evaluate(() => window.__cancels);
  ok(ti.n === 2 && ti.labels[1] === 'Stroke order for small ィ' && ti.ink.every((n) => n > 0) && ti.info[1] === 'ti' && c2 - c1 === 2, 'ティ: two boxes, both drawn; from きゃ, both animations stopped (' + JSON.stringify({ ti, stopped: c2 - c1 }) + ')');
  for (const [ch, want] of [['っ', 'doubles the next consonant'], ['ッ', 'doubles the next consonant'], ['ー', 'long vowel']]) {
    await pick(p, ch);
    const v = await shown(p);
    const aria = await p.evaluate((ch) => document.querySelector('.kcell[data-k="' + ch + '"]').getAttribute('aria-label'), ch);
    ok(v.info[1] === want && aria.indexOf(ch + ' ' + want) === 0 && !/['’-]/.test(v.info[1]), ch + ': named in words in the info line and the cell\'s label (' + JSON.stringify({ info: v.info[1], aria }) + ')');
  }
  const others = await p.evaluate(() => [...document.querySelectorAll('.kcell')].filter((x) => 'っッーをヲ'.indexOf(x.dataset.k) < 0).filter((x) => x.getAttribute('aria-label').replace(/, taught$/, '') !== x.dataset.k + ' ' + RB.kana.romaji(x.dataset.k)).map((x) => x.getAttribute('aria-label')));
  const wo = await p.evaluate(() => ['を', 'ヲ'].map((k) => document.querySelector('.kcell[data-k="' + k + '"]').getAttribute('aria-label').replace(/, taught$/, '')));
  ok(!others.length && wo.every((l) => / wo \(o\)$/.test(l)), 'every other cell\'s label is its reading as before; を/ヲ "wo (o)" as on the lesson sheet (' + JSON.stringify({ others: others.slice(0, 5), wo }) + ')');
  const none = await p.evaluate(() => { if (!RB.lessons.demoInto) return { line: null, canvases: null, helper: 'none' }; const d = document.createElement('div'); const stop = RB.lessons.demoInto(d, '☆', 160, 'kdemo'); stop(); return { line: (d.textContent || '').trim(), canvases: d.querySelectorAll('canvas').length }; });
  ok(none.line === 'No stroke demonstration for this one.' && !none.canvases, 'no reference: the lesson\'s line, no blank canvas (' + JSON.stringify(none) + ')');
  ok(!errors.length, 'desktop: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 5. a phone
{
  const { p, errors } = await open({ width: 390, height: 844 });
  await pick(p, 'きゃ');
  const v = await shown(p);
  const fit = await p.evaluate(() => { const box = document.querySelector('.kdemo-box'); const pg = box.closest('.folio') || document.body; return { box: [box.scrollWidth, box.clientWidth], page: [document.documentElement.scrollWidth, document.documentElement.clientWidth] }; });
  ok(v.n === 2 && v.boxes.every((x) => x[0] >= 0 && x[0] + x[1] <= 160) && v.ink.every((n) => n > 0) && fit.box[0] <= fit.box[1] && fit.page[0] <= fit.page[1] && !errors.length, 'phone: きゃ\'s boxes fit, drawn, nothing overflows, no page errors (' + JSON.stringify({ v, fit }) + ')');
  await p.close();
}
console.log(`\nguide_kana: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
