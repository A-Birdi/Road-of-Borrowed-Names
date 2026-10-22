// RBN-QA-082 (Agnes 6332271452, wording and English 6332338068; Local CL-157; Cloud CC-086): Ao's second lesson asks,
// for every profile, about the particle は read わ (こんにちは, はな は, はは は はなし, why the particle kept its old
// spelling), but its shared success line taught "after a word". The line now names the particle. In Chromium on the
// built game, through the real lesson sheet (the scene, the challenge and its buttons, the dialogue, as played):
//  1. for each profile (F, E, I, A), the second lesson answered right at the first try: Ao says the new line, in
//     Japanese and English, and never the old one; the lessons count goes up once (1 → 2); the quest stays at the lessons;
//  2. a wrong choice first, then the right one: the sheet asks again, and the lesson still counts once (the line, 1 → 2);
//  3. "Come back later" from the sheet: Ao's "That'll do for today", no line, the count unchanged;
//  4. the line's furigana (助詞, 読む, 覚える) and its voice key: the new text has its own key, not the old recording's;
//     no page errors;
//  5. the harness: a scene that throws is kept as an error and fails, never credited as played to its end. (The runner
//     catches an error inside a scene itself: 70_script.js run logs 'scene error' and does not mark the scene seen; a
//     lesson counts as played to its end only when its run resolved, the scene was marked seen and no error was logged
//     while it ran. Agnes 6333523142, Local CL-169, CL-172: the rule given to yoshino_exhibit_line.)
// Usage: node tools/build.mjs && node tests/e2e/ao_lesson_line.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const { p, errors } = await page(b, url);
const wait = (ms) => p.waitForTimeout(ms);

const NEW = { jp: '{助詞|じょし} の 「は」 は 、 「わ」 って {読|よ}む んだ 。 …… ずるい けど 、 {覚|おぼ}えた 。', en: 'The particle は is read わ. …That\'s cheating, but I\'ve got it.' };
const OLD_EN = 'After a word, は is said わ. …That\'s cheating, but I\'ve got it.';
const KO = { ch2_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_ch9: true, ko_arrived: true, ko_otoha_met: true, ko_ao_helped: true };

// one lesson through the real interface; mode: 'first' (right at once), 'miss' (wrong, then right), 'later' (step away),
// 'boom' (the harness check: the first line throws)
async function lesson(profile, mode) {
  const e0 = errors.length;
  await p.evaluate(([profile, flags, boom]) => {
    const s = RB.game.debugStart('ko.village', 20, 14, { dir: 'down', edition: RB.edition.forNew(), comp: 'suzu', profile, flags });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.state.setQuest(s, 'ko_ao', 0);
    s.vars.ko_ao_l = 1;
    // spies, not game changes: the lines said and the questions asked
    if (!window.__sayWrapped) {
      const say = RB.ui.dialogue.say;
      RB.ui.dialogue.say = function (l) {
        if (window.__boom) { window.__boom = false; throw new Error('a deliberate failure in the first line (the harness check)'); }
        window.__said.push({ who: l.who, jp: l.jp, en: l.en }); return say.apply(this, arguments);
      };
      window.__sayWrapped = true;
    }
    window.__said = []; window.__asked = []; window.__done = false; window.__err = null; window.__boom = !!boom;
    RB.script.run('ko.ao_lesson').then(() => { window.__done = true; }, (e) => { window.__err = String((e && e.stack) || e); });
  }, [profile, KO, mode === 'boom']);
  let missed = false, wrongClicks = 0, rightClicks = 0, leaves = 0;
  for (let i = 0; i < 400; i++) {
    const st = await p.evaluate(() => {
      const vis = (el) => !!(el && el.offsetParent);
      const coach = document.querySelector('[data-coach-ok]');
      const teach = Array.from(document.querySelectorAll('.teach .folio-foot [data-ok], .teach [data-ok]')).find(vis);
      const go = Array.from(document.querySelectorAll('.chal .fbwrap .fb-go, .chal [data-a=retry]')).find(vis);
      const btns = Array.from(document.querySelectorAll('.chal .mc .btn')).filter((x) => vis(x) && !x.disabled);
      const tab = document.querySelector('.chal .ptab[data-id="choice"]:not(.on)');
      return { done: window.__done || !!window.__err, coach: vis(coach), teach: !!teach, go: !!go, btns: btns.length, tab: vis(tab), chal: RB.challenge.active(), dlg: RB.ui.dialogue.isOpen() };
    });
    if (st.done) break;
    if (st.coach) { await p.click('[data-coach-ok]').catch(() => {}); await wait(100); continue; }
    if (st.teach) { await p.evaluate(() => { const b = Array.from(document.querySelectorAll('.teach .folio-foot [data-ok], .teach [data-ok]')).find((x) => x.offsetParent); if (b) b.click(); }); await wait(150); continue; }
    if (st.chal) {
      if (st.go) { await p.evaluate(() => { const g = Array.from(document.querySelectorAll('.chal .fbwrap .fb-go, .chal [data-a=retry]')).find((x) => x.offsetParent); if (g) g.click(); }); await wait(150); continue; }
      if (mode === 'later') { const lv = await p.$('.chal [data-a=leave]'); if (lv) { await lv.click(); leaves++; await wait(200); continue; } }
      if (st.tab) { await p.click('.chal .ptab[data-id="choice"]').catch(() => {}); await wait(150); continue; }
      if (st.btns) {
        const wrong = mode === 'miss' && !missed;
        await p.evaluate(() => { const s = RB.challenge.current(); const k = [].concat(s.item)[0]; const q = k + ' | ' + ((s.prompt && s.prompt.en) || ''); if (window.__asked[window.__asked.length - 1] !== q) window.__asked.push(q); });
        const clicked = await p.evaluate((wrong) => {
          // a button's words without their furigana, against the right option's (the order on screen is shuffled)
          const norm = (t) => String(t || '').replace(/\s+/g, '');
          const words = (x) => { const c = x.cloneNode(true); c.querySelectorAll('rt, rp').forEach((r) => r.remove()); return norm(c.textContent); };
          const s = RB.challenge.current(), good = (s.options || []).find((o) => o.ok);
          const want = good ? norm(RB.tasks.plain(good.text != null ? good.text : good.jp || '') + (good.text == null && good.en ? good.en : '')) : null;
          const bs = Array.from(document.querySelectorAll('.chal .mc .btn')).filter((x) => x.offsetParent && !x.disabled);
          const hits = bs.filter((x) => words(x) === want);
          const right = hits.length === 1 ? hits[0] : null;
          const b = wrong ? bs.find((x) => x !== right) : right;
          if (b) { b.click(); return wrong ? 'wrong' : 'right'; }
          return null;
        }, wrong);
        if (clicked === 'wrong') { missed = true; wrongClicks++; } else if (clicked === 'right') rightClicks++;
        await wait(200); continue;
      }
      await wait(100); continue;
    }
    if (st.dlg) { await p.evaluate(() => RB.ui.dialogue.advance()); await wait(60); continue; }
    await wait(100);
  }
  await wait(150); // (a console error reaches the page's log a moment later)
  const logged = errors.slice(e0);
  const r = await p.evaluate(([wrongClicks, rightClicks, leaves]) => {
    const s = RB.game.s;
    return { done: window.__done && !window.__err && !!s.seen['ko.ao_lesson'], err: window.__err, l: s.vars.ko_ao_l, stage: s.quests.ko_ao && s.quests.ko_ao.stage, said: window.__said.filter((x) => x.who === 'ko_ao'), asked: window.__asked.slice(), wrongClicks, rightClicks, leaves, profile: s.learn.profile };
  }, [wrongClicks, rightClicks, leaves]);
  if (logged.length) { r.done = false; r.err = [r.err].concat(logged).filter(Boolean).join(' | '); }
  return r;
}
const saysNew = (r) => r.said.filter((x) => x.jp === NEW.jp && x.en === NEW.en).length;
const saysOld = (r) => r.said.some((x) => x.en === OLD_EN || /{言葉\|ことば} の {後\|あと} の 「は」/.test(x.jp || ''));
const brief = (r) => JSON.stringify({ l: r.l, stage: r.stage, asked: r.asked, wrong: r.wrongClicks, right: r.rightClicks, leaves: r.leaves, ao: r.said.map((x) => x.en) });

// 1. every profile, right at the first try (each profile's own question: four different prompts)
const prompts = {};
for (const prof of ['F', 'E', 'I', 'A']) {
  const r = await lesson(prof, 'first');
  prompts[prof] = r.asked[0];
  ok(r.done && !r.err && r.profile === prof && r.asked.length === 1 && r.asked[0].indexOf('c:ko_kana_wa | ') === 0 && r.wrongClicks === 0 && r.rightClicks === 1, 'profile ' + prof + ': the second lesson is asked (は said わ) and answered right at once (' + brief(r) + ')');
  ok(saysNew(r) === 1 && !saysOld(r), 'profile ' + prof + ': Ao says the new line once, in Japanese and English, never the old one (' + brief(r) + ')');
  ok(r.l === 2 && r.stage === 0, 'profile ' + prof + ': the lesson counts once (1 → 2), the quest stays at the lessons (' + brief(r) + ')');
}
ok(new Set(Object.values(prompts)).size === 4, 'each profile was asked its own question (' + JSON.stringify(prompts) + ')');
// 2. a wrong choice first, then the right one
{
  const r = await lesson('F', 'miss');
  ok(r.done && !r.err && r.wrongClicks === 1 && r.rightClicks === 1, 'a wrong choice first: the sheet asks again and takes the right one (' + brief(r) + ')');
  ok(saysNew(r) === 1 && !saysOld(r) && r.l === 2, 'after a miss and the right answer: the new line once, the lesson counts once (1 → 2) (' + brief(r) + ')');
}
// 3. "Come back later"
{
  const r = await lesson('F', 'later');
  ok(r.done && !r.err && r.leaves === 1 && r.rightClicks === 0, '"Come back later" leaves the sheet (' + brief(r) + ')');
  ok(saysNew(r) === 0 && !saysOld(r) && r.said.some((x) => /That'll do for today/.test(x.en)) && r.l === 1 && r.stage === 0, 'stepping away: "That\'ll do for today", no line, the count unchanged (' + brief(r) + ')');
}
// 4. the line in the content: furigana and its voice key
{
  const r = await p.evaluate((NEW) => {
    const c = RB.content.scenes['ko.ao_lesson'].cmds.filter((x) => x.jp === NEW.jp);
    const kanji = (NEW.jp.replace(/\{[^}]*\}/g, '').match(/[一-鿿]/g) || []);
    const VB = RB.voicebank;
    return { n: c.length, en: c.map((x) => x.en), bare: kanji, key: VB && VB.keyOf ? VB.keyOf('ko.ao_lesson', NEW.jp) : null };
  }, NEW);
  ok(r.n === 1 && r.en[0] === NEW.en && r.bare.length === 0, 'the scene holds the line once, with its English, and every kanji has furigana (' + JSON.stringify(r) + ')');
  ok(r.key === 'ko.ao_lesson#b20d57a6f7' && r.key !== 'ko.ao_lesson#e8ee49be3b', 'the new text has its own voice key, not the old recording\'s (' + r.key + ')');
}

// 5. the harness itself
{
  const r = await lesson('F', 'boom');
  ok(!r.done && /deliberate failure/.test(r.err || '') && saysNew(r) === 0, 'the harness: a scene that throws is kept as an error and is not credited as done (' + JSON.stringify({ done: r.done, err: (r.err || '').split('\n')[0] }) + ')');
}

const real = errors.filter((e) => !/deliberate failure/.test(e));
ok(!real.length, 'no page errors ' + real.slice(0, 3).join(' | '));
await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
