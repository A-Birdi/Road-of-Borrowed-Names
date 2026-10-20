// RBN audit T01 and T02 (owner-approved, revised per Agnes's review), in the game's own challenge runner and Mastery
// exam runner, with typed and chosen answers:
//  T01: じ/ぢ, ず/づ, ジ/ヂ, ズ/ヅ are never asked by rōmaji alone. The bare question names the base kana and dakuten;
//       the other kana of the pair is wrong, with a note that both are read alike; the target is right. The だ and ダ
//       rows' exams, over several sittings (bare and word questions), never ask "ji" or "zu" alone.
//  T02: a kanji exam names the target's place among the kanji of a word with more than one; the word's other kanji
//       is wrong and the target right; choice options never include another character of the word.
// Usage: node tools/build.mjs && node tests/e2e/kana_homophones.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const PAIRS = { じ: ['ぢ', 'し'], ぢ: ['じ', 'ち'], ず: ['づ', 'す'], づ: ['ず', 'つ'], ジ: ['ヂ', 'シ'], ヂ: ['ジ', 'チ'], ズ: ['ヅ', 'ス'], ヅ: ['ズ', 'ツ'] };
const ROMAJI_ONLY = /for “(ji|zu)”|\((ji|zu)\)/;

async function setup(p) {
  await p.evaluate(() => {
    const s = RB.game.debugStart('rw.village', 22, 30, { comp: 'mio' });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
    RB.game.settings.input = 'ime';
    // the steps the runner is given, seen as the player sees them (the runner itself is not changed)
    window.__steps = [];
    const run = RB.challenge.runStep;
    RB.challenge.runStep = (step, o) => { window.__steps.push(step); return run(step, o); };
  });
}
const prompt = (p) => p.evaluate(() => document.querySelector('.chal-prompt').textContent);
async function type(p, text) {
  await p.waitForSelector('#ime-in');
  await p.fill('#ime-in', '');
  await p.type('#ime-in', text);
  await p.press('#ime-in', 'Enter');
}
// the options on screen, as their base text (furigana left out)
const options = (p) => p.evaluate(() => Array.from(document.querySelectorAll('.mc .btn')).map((x) => { const c = x.cloneNode(true); c.querySelectorAll('rt, .enline').forEach((r) => r.remove()); return c.textContent.replace(/\s/g, ''); }));
// answer the open question right (typed, or by choosing the option) and continue
async function answer(p, step, mode) {
  if (mode === 'choice') {
    await p.waitForSelector('.mc .btn');
    const want = step.kind === 'choose' ? step.options.find((o) => o.ok).jp.replace(/^\{([^|]+)\|.*$/, '$1') : step.answer;
    const i = (await options(p)).indexOf(want);
    if (i < 0) throw new Error('no option ' + want + ' in ' + (await options(p)).join(' '));
    await p.locator('.mc .btn').nth(i).click();
  } else await type(p, step.answer);
  await p.waitForSelector('.fbwrap[data-fb=ok] [data-a=continue]');
  await p.click('.fbwrap [data-a=continue]');
}
// the next question of a sitting, or null when the sitting is over
async function next(p, i) {
  try { await p.waitForFunction((n) => window.__done || (window.__steps.length > n && document.querySelector('.chal-prompt')), i, { timeout: 15000 }); }
  catch (e) { await p.screenshot({ path: 'tests/e2e/out/kana_homophones_stall.png' }); console.log(await p.evaluate(() => JSON.stringify({ steps: window.__steps.length, done: window.__done, err: window.__err, ret: window.__ret, modes: RB.game.modes || null, text: document.body.innerText.slice(0, 600) }))); throw e; }
  return p.evaluate((n) => (window.__steps.length > n ? window.__steps[n] : null), i);
}

// ---- T01: the bare questions, typed ----------------------------------------------------------------------
{
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await setup(p);
  for (const ch in PAIRS) {
    const [other, base] = PAIRS[ch];
    await p.evaluate((ch) => { window.__res = null; RB.game.pushMode('challenge'); RB.challenge.runStep(RB.tasks.kanaStep(ch, { bare: true }), {}).then((r) => { RB.game.popMode('challenge'); window.__res = r; }); }, ch);
    await p.waitForSelector('#ime-in');
    const pr = await prompt(p);
    ok(pr.indexOf(base + ' with dakuten') >= 0 && pr.indexOf(ch) < 0 && pr.indexOf(other) < 0 && !ROMAJI_ONLY.test(pr), ch + ': the question names ' + base + ' and dakuten, without either kana of the pair: "' + pr + '"');
    await type(p, other);
    await p.waitForSelector('.fbwrap[data-fb=no]');
    const why = await p.evaluate(() => document.querySelector('.fbwrap').textContent);
    ok(/both read/.test(why) && why.indexOf(base + ' with dakuten') >= 0, ch + ': ' + other + ' is wrong, and the note says both are read alike and names ' + base);
    await type(p, ch);
    await p.waitForSelector('.fbwrap[data-fb=ok]');
    const ex = await p.evaluate(() => document.querySelector('.fbwrap').textContent);
    ok(ex.indexOf(ch + ' is ' + base + ' with dakuten') >= 0, ch + ': right, and the explanation after answering names it');
    await p.click('.fbwrap [data-a=continue]');
    await p.waitForFunction(() => window.__res);
    const r = await p.evaluate(() => window.__res);
    ok(r.ok && r.firstTry === false, ch + ': recorded as right on the second try');
  }
  ok(!errors.length, 'T01 bare: no page errors ' + errors.join('; '));
  await ctx.close();
}

// ---- T01: the だ and ダ rows' exams, through the Mastery runner ----------------------------------------------
{
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await setup(p);
  const shown = [];
  for (const gid of ['kana:h:da', 'kana:k:da']) {
    for (const [mode, sittings] of [['ime', 4], ['choice', 1]]) {
      for (let k = 0; k < sittings; k++) {
        await p.evaluate(([gid, mode]) => { window.__done = false; window.__steps = []; RB.ui.mastery.runExam(RB.game.s, gid, mode, () => { window.__done = true; }).then((x) => { window.__ret = x; }, (e) => { window.__err = String(e && e.stack || e); }); }, [gid, mode]);
        for (let i = 0; ; i++) {
          const step = await next(p, i);
          if (!step) break;
          const pr = await prompt(p);
          if (PAIRS[step.answer]) shown.push(step.answer + ' ' + mode + ': ' + pr);
          ok(!PAIRS[step.answer] || (!ROMAJI_ONLY.test(pr) && pr.indexOf(step.answer) < 0 && pr.indexOf(PAIRS[step.answer][1] + ' with dakuten') >= 0), gid + ' ' + mode + ' sitting ' + (k + 1) + ', ' + step.answer + ': "' + pr + '"');
          await answer(p, step, mode);
        }
        await p.waitForFunction(() => window.__done);
      }
    }
  }
  const forms = new Set(shown.map((x) => (/Complete the word/.test(x) ? 'word' : 'bare')));
  ok(shown.length >= 20 && forms.has('bare'), 'the pair kana were asked ' + shown.length + ' times (' + Array.from(forms).join(' and ') + ' questions)');
  console.log('   ' + shown.slice(0, 6).join('\n   '));
  ok(!errors.length, 'T01 exams: no page errors ' + errors.join('; '));
  await ctx.close();
}

// ---- T02: a kanji exam names the place; the word's other kanji is wrong -------------------------------------
{
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await setup(p);
  // kanji met through words practised (a synthetic record: every kanji with example words counts as met)
  const gid = await p.evaluate(() => {
    const s = RB.game.s;
    for (const e of RB.kanjiInfo.all()) if ((e.words || []).length) RB.learn.rec('j:' + e.ch).seen = 1;
    const g = RB.exams.groups(s).find((x) => x.id === 'kanji:time');
    return g ? g.id : null;
  });
  ok(!!gid, 'a kanji group is offered: ' + gid);
  let multi = 0, otherTried = 0;
  for (const [mode, sittings] of [['ime', 2], ['choice', 2]]) {
    for (let k = 0; k < sittings; k++) {
      await p.evaluate(([gid, mode]) => { window.__done = false; window.__steps = []; RB.ui.mastery.runExam(RB.game.s, gid, mode, () => { window.__done = true; }).then((x) => { window.__ret = x; }, (e) => { window.__err = String(e && e.stack || e); }); }, [gid, mode]);
      for (let i = 0; ; i++) {
        const step = await next(p, i);
        if (!step) break;
        const v = step.item.slice(2);
        const pr = await prompt(p);
        const m = /(?:Write|Which is) the (\w+) kanji of (\S+) \(“/.exec(pr);
        const word = await p.evaluate(([v, r]) => (RB.kanjiInfo.get(v).words || []).filter((w) => w.r === r).map((w) => w.w), [v, m ? m[2] : '']);
        if (m) {
          multi++;
          const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'];
          const fits = word.some((w) => Array.from(w).filter((c) => RB_isKanji(c))[ORD.indexOf(m[1])] === v);
          ok(fits, mode + ': "' + pr + '" names a place that holds ' + v + ' (' + word.join('/') + ')');
          if (mode === 'choice') {
            const opts = await options(p);
            const inWord = opts.filter((o) => o !== v && word.some((w) => w.indexOf(o) >= 0));
            ok(inWord.length === 0, 'choice: no option is another character of ' + word.join('/') + ' (' + opts.join(' ') + ')');
          } else {
            const others = Array.from(word[0] || '').filter((c) => RB_isKanji(c) && c !== v);
            if (others.length) {
              otherTried++;
              await type(p, others[0]);
              await p.waitForSelector('.fbwrap[data-fb=no]');
              ok(true, 'ime: the word\'s other kanji ' + others[0] + ' is wrong for "' + pr + '"');
            }
          }
        } else {
          // the old wording stays only for a word whose kanji is the target alone
          const r1 = (/^(?:Write the kanji in|Which kanji is in) (\S+) \(“/.exec(pr) || [])[1];
          const ws = await p.evaluate(([v, r]) => (RB.kanjiInfo.get(v).words || []).filter((w) => w.r === r).map((w) => w.w), [v, r1 || '']);
          ok(!!r1 && ws.length > 0 && ws.every((w) => Array.from(w).filter((c) => RB_isKanji(c)).length === 1), mode + ': a one-kanji word keeps its wording: "' + pr + '" (' + ws.join('/') + ')');
        }
        if (mode !== 'choice') {
          await type(p, v);
          await p.waitForSelector('.fbwrap[data-fb=ok]');
          if (m) ok((await p.evaluate(() => document.querySelector('.fbwrap').textContent)).indexOf('The answer is its ' + m[1] + ' kanji.') >= 0, 'the explanation names the ' + m[1] + ' kanji');
          await p.click('.fbwrap [data-a=continue]');
        } else await answer(p, step, mode);
      }
      await p.waitForFunction(() => window.__done);
    }
  }
  ok(multi >= 10 && otherTried >= 3, 'words with more than one kanji asked: ' + multi + '; the other kanji typed ' + otherTried + ' times');
  ok(!errors.length, 'T02 exams: no page errors ' + errors.join('; '));
  await ctx.close();
}

function RB_isKanji(c) { const n = c.codePointAt(0); return (n >= 0x4e00 && n <= 0x9fff) || (n >= 0x3400 && n <= 0x4dbf) || n === 0x3005; }

console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
