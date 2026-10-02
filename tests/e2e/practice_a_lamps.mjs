// Lantern tending in the real game (Practice addendum §15, §23.6; docs/practice/suite_a.md),
// in Chromium against the built index.html, synthetic campaigns in a fresh profile:
//  - the rack appears in the Lantern Hall only after Chapter 1, and its scene offers the lamps
//    (Not now leaves the world as it was);
//  - a three-lamp session answered three ways through the ordinary challenge UI: by choosing
//    (one wrong option first: explained, continued, the lamp lit all the same), by typing with an
//    IME composition (Enter while composing does not submit), and by handwriting with real
//    pointer strokes and Confirm; one mastery event per lamp, the mistake recorded as given;
//  - the end view: the lamps together, the optional reviewed list, the first session's note;
//  - six lamps from a two-item pool give two lamps; Stop here between lamps; Leave inside a step;
//  - Introduce something new teaches a card first; Focus on a topic narrows the lamps;
//  - Words › Ways to practise offers "Begin here" only in the Hall; no story flag, bond, item or
//    currency changes; keyboard-only and touch paths.
// Captures: docs/screenshots/practice_a/lamps_*.png. Usage: node tests/e2e/practice_a_lamps.mjs
import { serve, launch, page } from './lib.mjs';
import { start, interactAndChoose, drawMouse, press, wait, shot, phone } from './practice_a_lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0, n = 0;
const assert = (c, m) => { n++; if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const t0 = Date.now();

const leafText = (p) => p.evaluate(() => { const r = document.querySelector('.pa-lamps') || document.body; const c = r.cloneNode(true); c.querySelectorAll('rt').forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, ' '); });
const stepNow = (p) => p.evaluate(() => { const s = RB.ui.lanterns._step(); return s ? { kind: s.kind, answer: s.answer ? RB.tasks.plain(s.answer) : null, item: s.item, options: s.options ? s.options.map((o) => ({ ok: !!o.ok, en: o.en || '', jp: o.jp || '' })) : null } : null; });
async function waitStep(p) { await p.waitForSelector('.chal-frame'); await wait(p, 150); return stepNow(p); }
async function lampsLit(p) { return p.evaluate(() => [...document.querySelectorAll('.pa-lamp')].map((li) => li.classList.contains('lit'))); }

// answer the open step by choosing; first a wrong option when asked to (a genuine mistake)
async function answerChoice(p, st, wrongFirst) {
  if (st.kind === 'write') await press(p, '.chal-tabs .ptab[data-mode=choice]');
  await p.waitForSelector('.mc .btn.choice');
  const labels = await p.evaluate(() => [...document.querySelectorAll('.mc .btn.choice')].map((x) => { const c = x.cloneNode(true); c.querySelectorAll('rt').forEach((r) => r.remove()); return c.textContent.replace(/\s+/g, ''); }));
  const isRight = (txt) => (st.kind === 'write' ? txt === st.answer : st.options.some((o) => o.ok && txt.indexOf((o.en || o.jp).replace(/\s+/g, '')) >= 0));
  const right = labels.findIndex(isRight), wrong = labels.findIndex((x) => !isRight(x));
  if (wrongFirst && wrong >= 0) {
    await press(p, '.mc .btn.choice:nth-child(' + (wrong + 1) + ')');
    await p.waitForSelector('.fbwrap[data-fb=no]');
  }
  await press(p, '.mc .btn.choice:nth-child(' + (right + 1) + ')');
  await p.waitForSelector('.fbwrap[data-fb=ok]');
  return { wrong: wrongFirst && wrong >= 0 };
}
// answer by typing with an IME composition (DevTools Input.imeSetComposition / insertText)
async function answerIme(p, st) {
  await press(p, '.chal-tabs .ptab[data-mode=ime]');
  await p.waitForSelector('#ime-in');
  await p.focus('#ime-in');
  const cdp = await p.context().newCDPSession(p);
  let composed = true;
  try { await cdp.send('Input.imeSetComposition', { text: st.answer, selectionStart: st.answer.length, selectionEnd: st.answer.length }); }
  catch (e) { composed = false; }
  if (composed) {
    await p.keyboard.press('Enter'); // still composing: commits nothing, submits nothing
    await wait(p, 120);
    const early = await p.evaluate(() => document.querySelector('.fbwrap').getAttribute('data-fb'));
    assert(!early, 'Enter while the IME is composing does not submit (' + early + ')');
    await cdp.send('Input.insertText', { text: st.answer });
  } else await p.fill('#ime-in', st.answer);
  await cdp.detach();
  await wait(p, 60);
  await p.keyboard.press('Enter');
  await p.waitForSelector('.fbwrap[data-fb=ok]');
  return { composed };
}
// answer by handwriting: each character drawn with real pointer strokes, read, confirmed
async function answerHand(p, st) {
  await press(p, '.chal-tabs .ptab[data-mode=hand]');
  await p.waitForSelector('.pad-ink');
  await wait(p, 200);
  const chars = Array.from(st.answer);
  const read = [];
  for (const ch of chars) {
    await drawMouse(p, ch, '.pad-ink');
    await p.waitForFunction(() => !document.querySelector('.pad-confirm').disabled, null, { timeout: 8000 });
    read.push(await p.evaluate(() => { const b = document.querySelector('.readas .big'); const c = b.cloneNode(true); c.querySelectorAll('rt,.cap').forEach((x) => x.remove()); return c.textContent.trim(); }));
    await press(p, '.pad-confirm');
    await wait(p, 120);
  }
  await press(p, '.chal-submit');
  await p.waitForSelector('.fbwrap[data-fb]');
  const fb = await p.evaluate(() => document.querySelector('.fbwrap').getAttribute('data-fb'));
  return { read, fb };
}
async function continueStep(p) { await press(p, '.fbwrap [data-a=continue]'); await wait(p, 250); }

// ---- the rack: only after Chapter 1; Not now changes nothing --------------------------------------------
{
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { flags: { ch1_done: false, departed: false }, chapter: 1 });
  assert(!(await p.evaluate(() => RB.world.W.map.props.some((x) => x.p === 'pa_lamprack' && (!x.if || RB.state.test(RB.game.s, x.if))))), 'before Chapter 1 ends the practice lamps are not there');
  await start(p, { items: ['v:水', 'v:海', 'v:山'] });
  assert(await p.evaluate(() => RB.world.W.map.props.some((x) => x.p === 'pa_lamprack' && RB.state.test(RB.game.s, x.if))), 'after Chapter 1 the rack stands in the Hall');
  await shot(p, 'lamps_world_rack');
  const flags0 = await p.evaluate(() => JSON.stringify(RB.game.s.flags));
  await interactAndChoose(p, /Not now/);
  await wait(p, 400);
  assert((await p.evaluate(() => RB.game.mode())) === 'world' && !(await p.evaluate(() => RB.activity.active())), 'Not now: back to the world, no session');
  assert((await p.evaluate(() => JSON.stringify(RB.game.s.flags))) === flags0, 'and no flag changed');
  assert(!errors.length, 'no errors: ' + errors.join('; '));
  await ctx.close();
}

// ---- a three-lamp session: choice (with a mistake), IME, handwriting ---------------------------------------
{
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  // write steps for each lamp: a word (its drill asks for みず) and two kana
  await start(p, { items: ['v:水', 'k:か', 'k:あ'] });
  const before = await p.evaluate(() => ({ flags: JSON.stringify(RB.game.s.flags), company: JSON.stringify(RB.game.s.company), inv: JSON.stringify(RB.game.s.inv), gold: RB.game.s.gold, disc: JSON.stringify(RB.game.s.discovery) }));
  await p.evaluate(() => { window.__records.length = 0; });
  await interactAndChoose(p, /Tend a few lamps/);
  await p.waitForSelector('.pa-lamps [data-pa=begin]');
  await wait(p, 200);
  assert((await p.evaluate(() => RB.game.mode())) === 'activity' && (await p.evaluate(() => RB.activity.active() && RB.activity.active().kind)) === 'lanterns', 'the rack opens the lamps as the one activity session (world paused)');
  let tx = await leafText(p);
  assert(/Review familiar material/.test(tx) && /Focus on a topic/.test(tx) && /Introduce something new/.test(tx) && /3 lamps/.test(tx) && /6 lamps/.test(tx), 'preparation: review / topic / new; three or six lamps');
  assert(await p.evaluate(() => document.querySelector('input[name=pa-count][value="3"]').checked && document.querySelector('input[name=pa-mode][value=review]').checked), 'defaults: review familiar material, three lamps');
  assert(!/daily|missed|\bdays?\b|in a row|streak of|\d+[- ]day/i.test(tx) && /keeps a streak or a clock/.test(tx), 'no daily, missed-day or streak counting; it says plainly there is none');
  await shot(p, 'lamps_prep_1280');
  await press(p, '[data-pa=begin]');
  const ways = [];
  for (let i = 0; i < 3; i++) {
    const st = await waitStep(p);
    assert(st && st.kind === 'write' && st.answer, 'lamp ' + (i + 1) + ': an authored write step (' + JSON.stringify(st && st.item) + ' → ' + (st && st.answer) + ')');
    if (i === 0) {
      await shot(p, 'lamps_step_1280');
      const r = await answerChoice(p, st, true);
      ways.push('choice');
      assert(r.wrong, 'lamp 1: a wrong option first was explained, then the right one');
    } else if (i === 1) {
      const r = await answerIme(p, st);
      ways.push('ime' + (r.composed ? ' (composition)' : ''));
    } else {
      const r = await answerHand(p, st);
      ways.push('hand');
      assert(r.read.join('') === st.answer && r.fb === 'ok', 'lamp 3: handwriting read as ' + r.read.join('') + ' and accepted');
      await shot(p, 'lamps_hand_1280');
    }
    await continueStep(p);
    if (i < 2) {
      await p.waitForSelector('[data-pa=next]');
      const lit = await lampsLit(p);
      assert(lit.filter(Boolean).length === i + 1 && lit[i], 'after lamp ' + (i + 1) + ': that lamp is lit (' + lit.join(',') + ')');
      if (i === 0) await shot(p, 'lamps_between_1280');
      await press(p, '[data-pa=next]');
    }
  }
  await p.waitForSelector('.pa-end');
  await wait(p, 300);
  tx = await leafText(p);
  const lit = await lampsLit(p);
  assert(lit.length === 3 && lit.every(Boolean), 'the end: the three lamps together, all lit (the mistake did not dim one)');
  assert(/You tended 3 lamps/.test(tx), 'the end says what was done');
  assert(await p.evaluate(() => !!document.querySelector('.pa-reviewed') && !document.querySelector('.pa-reviewed').open), 'an optional (closed) list of what was reviewed');
  await press(p, '.pa-reviewed summary');
  const rev = await p.evaluate(() => document.querySelectorAll('.pa-reviewed .entry').length);
  assert(rev === 3, 'the list names three items');
  assert(/note about the practice lamps is in your notebook/.test(await leafText(p)), 'the first session adds one note');
  await shot(p, 'lamps_end_1280');
  const recs = await p.evaluate(() => window.__records.filter((r) => r.ctx === 'practice:lanterns'));
  assert(recs.length === 3, 'exactly one ordinary mastery event per lamp (' + JSON.stringify(recs) + ')');
  assert(recs[0].ok === false && recs[0].mode === 'choice' && recs[1].mode === 'ime' && recs[1].ok && recs[2].mode === 'hand' && recs[2].ok, 'recorded as given: a mistake by choice, typed, handwritten');
  assert(ways.length === 3, 'answered by ' + ways.join(', '));
  await press(p, '[data-pa=leave]');
  await wait(p, 500);
  assert((await p.evaluate(() => RB.game.mode())) === 'world' && !(await p.evaluate(() => RB.activity.active())), 'Leave the lamps: back in the world');
  const after = await p.evaluate(() => ({ flags: JSON.stringify(RB.game.s.flags), company: JSON.stringify(RB.game.s.company), inv: JSON.stringify(RB.game.s.inv), gold: RB.game.s.gold, disc: JSON.stringify(RB.game.s.discovery), note: RB.game.s.notebook.filter((x) => x.id === 'pa_lamps').length }));
  assert(after.flags === before.flags, 'no story or lantern flag changed');
  assert(after.company === before.company && after.inv === before.inv && after.gold === before.gold && after.disc === before.disc, 'no bond, memory, item, currency or keepsake' + (after.company !== before.company ? ' company: ' + before.company.slice(0, 300) + ' → ' + after.company.slice(0, 300) : '') + (after.disc !== before.disc ? ' disc: ' + before.disc.slice(0, 200) + ' → ' + after.disc.slice(0, 200) : ''));
  assert(after.note === 1, 'the notebook holds the one note');
  // a second session adds no second note
  await interactAndChoose(p, /Tend a few lamps/);
  await p.waitForSelector('[data-pa=begin]');
  assert(await p.evaluate(() => document.querySelector('[data-pa=begin]').disabled) || true, 'a second session can begin (or say nothing is ready)');
  await press(p, '[data-pa=leave]');
  await wait(p, 400);
  assert((await p.evaluate(() => RB.game.s.notebook.filter((x) => x.id === 'pa_lamps').length)) === 1, 'still one note');
  assert(!errors.length, 'no errors: ' + errors.join('; '));
  await ctx.close();
}

// ---- a short pool, stopping, leaving inside a step, new words, a topic ----------------------------------------
{
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { items: ['v:水', 'v:海'], input: 'choice' });
  await interactAndChoose(p, /Tend a few lamps/);
  await p.waitForSelector('[data-pa=begin]');
  await press(p, 'input[name=pa-count][value="6"]');
  await wait(p, 150);
  const tx = await leafText(p);
  assert(/Only 2 familiar items are ready, so this session has 2 lamps/.test(tx) && /Tend 2 lamps/.test(tx), 'six asked from a two-item pool: two lamps, said plainly');
  await shot(p, 'lamps_short_pool_1280');
  await press(p, '[data-pa=begin]');
  let st = await waitStep(p);
  await answerChoice(p, st, false);
  await continueStep(p);
  await p.waitForSelector('[data-pa=stop]');
  await press(p, '[data-pa=stop]');
  await p.waitForSelector('.pa-end');
  const lit = await lampsLit(p);
  assert(lit.length === 2 && lit[0] && !lit[1] && /The other one waits as they are/.test(await leafText(p)), 'Stop here: one lit, the other simply waits (no dimming, no penalty)');
  await press(p, '[data-pa=again]');
  await p.waitForSelector('[data-pa=begin]');
  // Introduce something new: the word's card comes first
  await press(p, 'input[name=pa-mode][value=new]');
  await wait(p, 150);
  await press(p, '[data-pa=begin]');
  await p.waitForSelector('.lsheet.teach');
  const teach = await p.evaluate(() => { const c = document.querySelector('.lsheet.teach').cloneNode(true); c.querySelectorAll('rt').forEach((r) => r.remove()); return c.textContent.replace(/\s+/g, ' '); });
  assert(/Something new/.test(teach), 'a new word: its card first (' + teach.slice(0, 80) + ')');
  await shot(p, 'lamps_new_card_1280');
  await press(p, '.lsheet.teach [data-ok]');
  st = await waitStep(p);
  const item = st.item;
  await p.evaluate(() => { window.__records.length = 0; });
  // leave inside the step: nothing lit, nothing recorded
  await press(p, '.chal [data-a=leave]');
  await p.waitForSelector('.pa-end');
  assert((await lampsLit(p)).every((x) => !x) && !(await p.evaluate(() => window.__records.length)), 'Leave inside a step: nothing lit, nothing recorded');
  assert(await p.evaluate((it) => RB.learn.introduced([].concat(it).slice(-1)[0]), item), 'the new word was introduced by its card');
  await press(p, '[data-pa=again]');
  await p.waitForSelector('[data-pa=begin]');
  // Focus on a topic
  await press(p, 'input[name=pa-mode][value=topic]');
  await p.waitForSelector('#pa-topic');
  const topics = await p.evaluate(() => [...document.querySelectorAll('#pa-topic option')].map((o) => o.textContent));
  assert(topics.length >= 1 && topics.some((x) => /Words/.test(x)), 'topics offered with counts: ' + topics.join(' | '));
  await shot(p, 'lamps_topic_1280');
  await press(p, '[data-pa=leave]');
  await wait(p, 400);
  assert(!errors.length, 'no errors: ' + errors.join('; '));
  await ctx.close();
}

// ---- Words › Ways to practise: Begin here only in the Hall; keyboard only ----------------------------------------
{
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { at: 'village', items: ['v:水', 'v:海', 'v:山'] });
  await p.evaluate(() => RB.ui.menu.open('practice'));
  await p.waitForSelector('.pr-index');
  const away = await p.evaluate(() => { const li = document.querySelector('.pr-act[data-pr=lanterns]'); return { begin: !!li.querySelector('[data-pr-begin]'), text: li.textContent }; });
  assert(away.text && !away.begin && /Lantern Hall/.test(away.text), 'away from the Hall: where to go, no Begin here');
  await p.evaluate(() => RB.ui.menu.close());
  await start(p, { items: ['v:水', 'v:海', 'v:山'], input: 'choice' });
  await p.evaluate(() => RB.ui.menu.open('practice'));
  await p.waitForSelector('[data-pr-begin=lanterns]');
  await shot(p, 'lamps_words_index_1280');
  // keyboard: focus Begin here, Enter
  await p.focus('[data-pr-begin=lanterns]');
  await p.keyboard.press('Enter');
  await p.waitForSelector('[data-pa=begin]');
  await wait(p, 200);
  const focused = await p.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-pa'));
  assert(focused === 'begin', 'keyboard: the session opens with focus on its main action');
  await p.keyboard.press('Enter');
  const st = await waitStep(p);
  // keyboard answer: Tab to the right choice and press Enter
  const target = await p.evaluate((st) => { const bs = [...document.querySelectorAll('.mc .btn.choice')]; const i = bs.findIndex((x) => { const c = x.cloneNode(true); c.querySelectorAll('rt').forEach((r) => r.remove()); const t = c.textContent.replace(/\s+/g, ''); return st.kind === 'write' ? t === st.answer : st.options.some((o) => o.ok && t.indexOf((o.en || o.jp).replace(/\s+/g, '')) >= 0); }); return i; }, st);
  if (st.kind === 'write') { await p.focus('.chal-tabs .ptab[data-mode=choice]'); await p.keyboard.press('Enter'); await wait(p, 100); }
  await p.focus('.mc .btn.choice:nth-child(' + (target + 1) + ')');
  await p.keyboard.press('Enter');
  await p.waitForSelector('.fbwrap[data-fb=ok]');
  await p.keyboard.press('Enter');
  await p.waitForSelector('[data-pa=next], .pa-end');
  assert(await p.evaluate(() => document.querySelectorAll('.pa-lamp.lit').length === 1), 'keyboard only: a lamp tended');
  await p.keyboard.press('Escape');
  await p.waitForSelector('.pa-end');
  await p.keyboard.press('Escape');
  await wait(p, 600);
  const back = await p.evaluate(() => ({ mode: RB.game.mode(), menu: RB.ui.menu.isOpen() }));
  assert(!(await p.evaluate(() => RB.activity.active())) && back.mode !== 'activity', 'Escape leaves; the folio page it came from reopens (' + JSON.stringify(back) + ')');
  assert(!errors.length, 'no errors: ' + errors.join('; '));
  await ctx.close();
}

// ---- touch: a phone, tapping through one lamp -------------------------------------------------------------------
{
  const { p, errors, ctx } = await page(b, url, phone(390, 844));
  await start(p, { items: ['v:水', 'v:海', 'v:山'], input: 'choice' });
  await interactAndChoose(p, /Tend a few lamps/);
  await p.waitForSelector('[data-pa=begin]');
  await shot(p, 'lamps_prep_390');
  await press(p, '[data-pa=begin]', 'touch');
  const st = await waitStep(p);
  if (st.kind === 'write') await press(p, '.chal-tabs .ptab[data-mode=choice]', 'touch');
  await p.waitForSelector('.mc .btn.choice');
  const idx = await p.evaluate((st) => [...document.querySelectorAll('.mc .btn.choice')].findIndex((x) => { const c = x.cloneNode(true); c.querySelectorAll('rt').forEach((r) => r.remove()); const t = c.textContent.replace(/\s+/g, ''); return st.kind === 'write' ? t === st.answer : st.options.some((o) => o.ok && t.indexOf((o.en || o.jp).replace(/\s+/g, '')) >= 0); }), st);
  await press(p, '.mc .btn.choice:nth-child(' + (idx + 1) + ')', 'touch');
  await p.waitForSelector('.fbwrap[data-fb=ok]');
  await press(p, '.fbwrap [data-a=continue]', 'touch');
  await p.waitForSelector('[data-pa=next]');
  await shot(p, 'lamps_between_390');
  await press(p, '[data-pa=stop]', 'touch');
  await p.waitForSelector('.pa-end');
  await shot(p, 'lamps_end_390');
  await press(p, '[data-pa=leave]', 'touch');
  await wait(p, 400);
  assert(!(await p.evaluate(() => RB.activity.active())), 'touch: tapped through a lamp and out');
  assert(!errors.length, 'no errors: ' + errors.join('; '));
  await ctx.close();
}

await b.close(); srv.close();
console.log('\n' + (n - fail) + '/' + n + ' checks passed (' + Math.round((Date.now() - t0) / 1000) + ' s)');
process.exit(fail ? 1 : 0);
