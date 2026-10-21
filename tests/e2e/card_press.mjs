// RBN-QA-057 (Cloud, found while testing RBN-QA-056): a response card's Japanese label is drawn as word-help tokens
// (`.jt`, each with its own `data-i`: its place in the line), and the battle screen and the encounter screen looked up
// the card a press was on with `closest('[data-i]')`. A press on the Japanese words therefore chose the card at the
// word's index: in an ordinary battle, pressing "みず" on the water card opened Unravel's step. Now the card is found
// by the card itself. In Chromium on the built game, pressing the last word of each card's Japanese label:
//  1. an ordinary battle: each card chosen is the card pressed (the task slip's "You chose …"), then chosen again;
//  2. a conversation on the battle screen (the Teller's Shadow): the bell's correction gives the bell's question;
//  3. a conversation on its own screen (the missing basket): asking where gives the "where" question;
//  4. the keyboard in a group battle: ] or [ changes the target and deals the cards again; the focus comes back to the
//     card it was in, from the card itself or from a word of its Japanese label (Local CL-081, Agnes 6310914454);
//  no page errors. (The hover preview's lookup gets the same correction; it is read in source, not measured here.)
// Usage: node tools/build.mjs && node tests/e2e/card_press.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const WORDS = ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'ishi'];

async function begin(o) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(([o, WORDS]) => {
    const s = RB.game.debugStart('rw.millroad', 10, 22, { edition: RB.edition.forNew(), comp: 'suzu' });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.words = WORDS.slice();
    RB.game.settings.input = 'choice'; RB.game.settings.battleAnim = 'instant'; RB.game.settings.compPlan = 'ask'; RB.game.applySettings();
    window.__steps = []; const rs = RB.challenge.runStep; RB.challenge.runStep = function (st) { window.__steps.push({ title: st.title, prompt: st.prompt && st.prompt.en }); return rs.apply(this, arguments); };
    if (o.enc) RB.game.startEncounter(o.enc, {}); else RB.game.startBattle(o.enemy, {});
  }, [o, WORDS]);
  // to the first choice: the opening lines read, the first-time note closed
  for (let i = 0; i < 150; i++) {
    const s = await p.evaluate(() => { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); return { ph: RB.combat.state() ? RB.combat.phase() : 'none', cards: document.querySelectorAll('.rcard[data-i]').length }; });
    if ((s.ph === 'choose' || s.ph === 'none') && s.cards) break;
    await p.waitForTimeout(100);
  }
  await p.waitForTimeout(700);
  if (await p.evaluate(() => !!document.querySelector('[data-coach-ok]'))) { await p.mouse.move(2, 2); await p.waitForTimeout(300); await p.click('[data-coach-ok]'); await p.waitForTimeout(300); }
  return { p, errors };
}
// the point of the last word of a card's Japanese label (a word-help token), the card found by its English label
const jpPoint = (p, en) => p.evaluate((en) => {
  const c = [...document.querySelectorAll('.rcard[data-i]:not([disabled])')].find((x) => ((x.querySelector('.rc-en') || {}).textContent || '').trim() === en);
  const ts = c ? [...c.querySelectorAll('.rc-jp .jt')] : [];
  const t = ts[ts.length - 1];
  if (!t) return null;
  t.scrollIntoView({ block: 'nearest' });
  const r = t.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, tokenI: t.getAttribute('data-i'), cardI: c.getAttribute('data-i') };
}, en);
async function press(p, pt) {
  await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(700);
  // a word taught another way asks how to say it first: its own word (the first choice)
  if (await p.evaluate(() => !!document.querySelector('.csheet .pbtn'))) { await p.evaluate(() => document.querySelector('.csheet .pbtn').click()); await p.waitForTimeout(700); }
}

// 1. an ordinary battle
{
  const { p, errors } = await begin({ enemy: 'rw.reedling' });
  const labels = await p.evaluate(() => [...document.querySelectorAll('.rcard[data-i]:not([disabled])')].map((x) => ((x.querySelector('.rc-en') || {}).textContent || '').trim()).filter((t) => t && !/^Wait/.test(t)).slice(0, 5));
  for (const en of labels) {
    const pt = await jpPoint(p, en);
    if (!pt) { ok(false, 'ordinary battle: no Japanese label on ' + en); continue; }
    await press(p, pt);
    const chose = await p.evaluate(() => ((document.querySelector('.chal .cs-chose b') || {}).textContent || '').trim());
    // (a press can open the word's own note instead, which chooses nothing; never another card)
    const note = !chose && await p.evaluate(() => RB.combat.phase() === 'choose' && [...document.querySelectorAll('button')].some((x) => x.offsetParent && /Add to notebook|Keep open/.test(x.textContent)));
    ok(chose === en || note, 'ordinary battle: pressing the Japanese of "' + en + '" (card ' + pt.cardI + ', word ' + pt.tokenI + ') chooses it, or opens the word\'s note; never another card (' + JSON.stringify({ chose, note }) + ')');
    if (note) { await p.keyboard.press('Escape'); await p.mouse.move(2, 2); await p.waitForTimeout(400); continue; }
    // back out: "Choose a different response"
    await p.evaluate(() => { const bt = [...document.querySelectorAll('.chal button')].find((x) => /Choose a different response/.test(x.textContent)); if (bt) bt.click(); });
    for (let i = 0; i < 40; i++) { await p.waitForTimeout(100); if (await p.evaluate(() => RB.combat.phase() === 'choose' && !document.querySelector('.chal'))) break; }
    await p.waitForTimeout(500);
  }
  ok(!errors.length, 'ordinary battle: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 2. a conversation on the battle screen
{
  const { p, errors } = await begin({ enc: 'kr.shadow_gate' });
  const pt = await jpPoint(p, 'Correct it: the bell was last');
  await press(p, pt);
  const st = await p.evaluate(() => ({ chose: ((document.querySelector('.chal .cs-chose b') || {}).textContent || '').trim(), steps: window.__steps }));
  ok(pt && st.chose === 'Correct it: the bell was last' && st.steps.some((x) => /bell/i.test(x.prompt || '')), 'the Teller\'s Shadow: pressing the Japanese of the bell\'s correction gives the bell\'s question (' + JSON.stringify({ word: pt && pt.tokenI, st }) + ')');
  ok(!errors.length, 'the Teller\'s Shadow: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 3. a conversation on its own screen
{
  const { p, errors } = await begin({ enc: 'fx.dispute' });
  const pt = await jpPoint(p, 'Ask the runner where they picked them up');
  await press(p, pt);
  const steps = await p.evaluate(() => window.__steps);
  ok(pt && steps.length && /where/i.test(steps[steps.length - 1].prompt || ''), 'the missing basket: pressing the Japanese of "where" gives the "where" question (' + JSON.stringify({ word: pt && pt.tokenI, steps }) + ')');
  ok(!errors.length, 'the missing basket: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 4. the keyboard in a group: the target changed with ] or [ deals the cards again; the focus comes back to the card it
// was in, whether on the card or on a word of its Japanese label (Agnes 6310914454)
{
  const { p, errors } = await begin({ enc: 'fx.ordinary' });
  for (const [what, key] of [['a word of its label', ']'], ['the card itself', '[']]) {
    const f0 = await p.evaluate((what) => {
      const c = [...document.querySelectorAll('.rcard[data-i]:not([disabled])')][3];
      const el = what === 'the card itself' ? c : c.querySelector('.rc-jp .jt');
      el.focus();
      return { en: ((c.querySelector('.rc-en') || {}).textContent || '').trim(), cur: RB.combat.state().cur, onToken: document.activeElement.classList.contains('jt') };
    }, what);
    await p.keyboard.press(key);
    await p.waitForTimeout(500);
    const f1 = await p.evaluate(() => { const a = document.activeElement; const c = a && a.closest && a.closest('.rcard[data-i]'); return { en: c ? ((c.querySelector('.rc-en') || {}).textContent || '').trim() : null, cur: RB.combat.state().cur }; });
    ok(f1.cur !== f0.cur && f1.en === f0.en, 'a group battle, focus on ' + what + ' of "' + f0.en + '": ' + key + ' changes the target and the focus is back in that card (' + JSON.stringify({ before: f0, after: f1 }) + ')');
  }
  ok(!errors.length, 'keyboard: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
console.log(`\ncard_press: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
