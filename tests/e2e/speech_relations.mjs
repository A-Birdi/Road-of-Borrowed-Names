// AG-1 in the built game: the dialogue's word pairs as relations (src/lang/88_speech_align.js, src/ui/22_speech_mark.js).
//   1. an English word shared part by part: pointing at "I'm" marks 私 (its meaning, amber) and です (the copula, blue);
//   2. a construction: pointing at ならない marks 行かなければ with it and "must", in the grammar colour, and not "go";
//   3. word help says what a word does in its line: は is a topic marker with no English word; ならない is part of the
//      obligation, with 行かなければ;
//   4. the spoken mark uses the same relations: while 行かない is spoken, "go" is marked (.spk) and "won't" in the
//      grammar's own mark (.spk2);
//   5. with Highlight off, pointing marks nothing.
// Usage: node tests/e2e/speech_relations.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const { p, errors, requests } = await page(b, url, { viewport: { width: 1280, height: 800 } });
await p.evaluate(() => {
  RB.game.debugStart('rw.village', 22, 30, { comp: 'mio' });
  const st = RB.game.settings; st.lead = 'ja'; st.secondary = 'always'; st.textSpeed = 'instant'; st.lightbulb = true; RB.game.applySettings();
  document.body.classList.add('bulb-on');
});
await p.waitForTimeout(500);
const say = async (jp, en) => {
  await p.mouse.move(2, 2);
  const before = await p.evaluate(() => { const l = document.querySelector('.dlg .main .jline[data-src]'); return l ? l.dataset.src : null; });
  await p.evaluate(([jp, en]) => { RB.ui.dialogue.say({ sceneId: 'test.ag1.' + Math.random(), who: 'ren', jp, en }); }, [jp, en]);
  await p.waitForFunction((before) => { const l = document.querySelector('.dlg .main .jline[data-src]'); return l && l.dataset.src !== before && l.querySelector('.jt[data-i]'); }, before);
  await p.waitForTimeout(350);
};
const at = (sel, txt) => p.evaluate(([sel, txt]) => { const e = [...document.querySelectorAll(sel)].find((x) => x.textContent.replace(/\s/g, '').replace(/[ぁ-ゖ]+(?=[ぁ-ゖ])/g, '') && (x.querySelector('rt') ? [...x.childNodes].map((n) => (n.nodeName === 'RUBY' ? n.firstChild.textContent : n.textContent)).join('') : x.textContent).replace(/\s/g, '').startsWith(txt)); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, [sel, txt]);
const marks = () => p.evaluate(() => {
  const base = (e) => (e.querySelector('rt') ? [...e.querySelectorAll('ruby')].map((r) => r.firstChild.textContent).join('') + [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('') : e.textContent).replace(/\s/g, '');
  return {
    jp: [...document.querySelectorAll('.dlg .jt.hov')].map(base), jp2: [...document.querySelectorAll('.dlg .jt.hov2')].map(base),
    en: [...document.querySelectorAll('.dlg .ew.hov')].map((e) => e.textContent), en2: [...document.querySelectorAll('.dlg .ew.hov2')].map((e) => e.textContent),
  };
});
const point = async (sel, txt) => {
  await p.mouse.move(2, 2); await p.waitForTimeout(60);
  // (the English words become pointable when the pointer first enters their line, as a player's would)
  if (/enline/.test(sel)) { const r = await p.evaluate(() => { const e = document.querySelector('.dlg .main .enline, .dlg .sub .enline').getBoundingClientRect(); return { x: e.left + 4, y: e.top + e.height / 2 }; }); await p.mouse.move(r.x, r.y); await p.waitForTimeout(60); }
  const pt = await at(sel, txt); if (!pt) return null; await p.mouse.move(pt.x, pt.y); await p.waitForTimeout(160); return marks(); };

// 1. a shared contraction
await say('{私|わたし} は レン です 。', "I'm Ren.");
let m = await point('.dlg .enline .ew', "I'm");
assert(m && m.en.includes("I'm") && m.jp.some((t) => /私/.test(t)) && m.jp2.some((t) => /です/.test(t)), '1. "I\'m" marks 私 (amber) and です (blue): ' + JSON.stringify(m));
m = await point('.dlg .main .jline .jt[data-i]', 'です');
assert(m && m.en2.includes("I'm") && !m.jp.some((t) => /私/.test(t)), '1. です marks the be-part of "I\'m" in blue, not 私: ' + JSON.stringify(m));
const topic = await p.evaluate(() => { const e = [...document.querySelectorAll('.dlg .main .jline .jt[data-i]')].find((x) => x.textContent.trim() === 'は'); RB.ui.help.showFor(e); const h = document.querySelector('.help .note.in-line'); return h ? h.textContent : ''; });
assert(/In this line/i.test(topic) && /Topic marker/.test(topic) && !/Not worked out/.test(topic), '3. word help on は: a topic marker, no English word of its own: ' + JSON.stringify(topic));
await p.evaluate(() => RB.ui.help.hide());

// 2. a construction
await say('{行|い}かなければ ならない 。', 'I must go.');
m = await point('.dlg .main .jline .jt[data-i]', 'ならない');
assert(m && m.jp2.some((t) => /行かなければ/.test(t)) && m.jp2.some((t) => /ならない/.test(t)) && m.en2.includes('must') && !m.en.includes('go') && !m.en2.includes('go'), '2. ならない marks 行かなければ with it and "must" (blue), not "go": ' + JSON.stringify(m));
m = await point('.dlg .main .jline .jt[data-i]', '行かなければ');
assert(m && m.en.includes('go') && m.en2.includes('must'), '2. 行かなければ marks "go" (its meaning) and "must" (the construction): ' + JSON.stringify(m));
const oblig = await p.evaluate(() => { const e = [...document.querySelectorAll('.dlg .main .jline .jt[data-i]')].find((x) => x.textContent.trim() === 'ならない'); RB.ui.help.showFor(e); const h = document.querySelector('.help .note.in-line'); return h ? h.textContent : ''; });
assert(/obligation/.test(oblig) && /行かなければ/.test(oblig) && /must/.test(oblig), '3. word help on ならない: part of the obligation, with 行かなければ, "must": ' + JSON.stringify(oblig));
await p.evaluate(() => RB.ui.help.hide());

// 4. the spoken mark from the same relations
await say('{明日|あした} は {行|い}かない 。', "I won't go tomorrow.");
const spoken = await p.evaluate(() => {
  const box = document.querySelector('.dlg');
  const line = RB.ui.dialogue.shown();
  const reading = RB.jp.reading(line.jp, {});
  const c = RB.ui.speechMark.begin(box, line, reading);
  c.at(reading.indexOf('いかない'));
  const out = { spk: [...document.querySelectorAll('.dlg .ew.spk')].map((e) => e.textContent), spk2: [...document.querySelectorAll('.dlg .ew.spk2')].map((e) => e.textContent) };
  c.end();
  out.after = document.querySelectorAll('.dlg .spk, .dlg .spk2').length;
  return out;
});
assert(spoken.spk.includes('go') && spoken.spk2.includes("won't") && spoken.after === 0, '4. while 行かない is spoken: "go" (.spk) and "won\'t" (.spk2); cleared at the end: ' + JSON.stringify(spoken));
const spk2Style = await p.evaluate(() => {
  const box = document.querySelector('.dlg'); const line = RB.ui.dialogue.shown(); const reading = RB.jp.reading(line.jp, {});
  const c = RB.ui.speechMark.begin(box, line, reading); c.at(reading.indexOf('いかない'));
  const e = document.querySelector('.dlg .ew.spk2'); const cs = e ? getComputedStyle(e) : null; const r = cs ? [cs.backgroundColor, cs.textDecorationStyle] : null; c.end(); return r;
});
assert(spk2Style && /60, 118, 170/.test(spk2Style[0]) && spk2Style[1] === 'dotted', '4. the spoken grammar mark is blue and dotted: ' + JSON.stringify(spk2Style));

// 5. Highlight off
await p.evaluate(() => { RB.game.settings.voice.highlight = false; });
m = await point('.dlg .main .jline .jt[data-i]', '行かない');
assert(m && !m.jp.length && !m.jp2.length && !m.en.length && !m.en2.length, '5. with Highlight off, pointing marks nothing');
await p.evaluate(() => { RB.game.settings.voice.highlight = true; });

assert(!errors.length && !requests.length, 'no page errors or network requests: ' + errors.concat(requests).join(' | '));
await b.close();
srv.close();
console.log(fail ? fail + ' failed' : 'all relation checks passed');
process.exit(fail ? 1 : 0);
