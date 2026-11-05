// The Hush in the Here preview and the battle log, in Chromium (Agnes 6549129992; Cloud CC-413; Local CL-572; Agnes
// 6549259814). With a Hush on you and no Hush coming, a bell or a voice card's Here said "No effect here: nothing for
// it to answer.", though it breaks the Hush; and the log said "A clear note breaks the hush." after every bell or voice,
// with a Hush on you or not. Now the bell event says whether one was cleared, and the Here line and the log follow it.
// On the built game, real exchanges through the real battle screen (the card pressed, its exercise answered right in
// choice mode; the companion on its Protect plan), the battle state seeded as it starts; the log recorded line by line
// as it is written:
//  The Conduit Spirit (lf.conduit), with Mio:
//  1. a Hush on you, a Sweep coming: the "Hushed" badge and Unravel locked; すず's and こえ's Here: "Breaks the Hush.";
//     すず chosen: "A clear note breaks the hush." once; the badge gone and Unravel back;
//  2. no Hush on you, its Hush coming: Here "Answers its Hush." as before; こえ chosen: no clearing line, and "You
//     answered it — its move comes to nothing." still said;
//  3. a Hush on you and its Hush coming: Here, one phrase, "Breaks the Hush, and answers its next one."; すず chosen:
//     the clearing line once, and the answered line;
//  4. a Hush on one family only (water), a Sweep coming: Here "Breaks the Hush."; すず chosen: the clearing line once;
//  5. nothing on you, a Sweep coming: Here "No effect here: nothing for it to answer." as before; すず chosen: no
//     clearing line;
//  The Wick Moths (kr.wick_ridge), with Nao:
//  6. a Hush on you and every moth's Hush coming: すず's Here clears once and names each moth it answers, in one
//     phrase; chosen: the clearing line once;
//  no page errors.
// Usage: node tools/build.mjs && node tests/e2e/hush_preview.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const WORDS = ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'ishi', 'iyasu', 'honoo', 'suzu', 'koe'];
const CLEAR = 'A clear note breaks the hush.';
const ANSWERED = /You answered it — its move comes to nothing\./;

async function begin(p, o) {
  await p.evaluate(([o, WORDS]) => {
    const s = RB.game.debugStart('rw.millroad', 10, 22, { comp: o.comp });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'F'; s.learn.difficulty = 'normal';
    s.words = WORDS.slice();
    RB.game.settings.input = 'choice'; RB.game.settings.battleAnim = 'instant'; RB.game.settings.compPlan = 'protect';
    RB.game.applySettings();
    const runStep = RB.challenge.runStep;
    RB.challenge.runStep = (step, x) => { window.__step = step; return runStep(step, x); };
    window.__lines = [];
    new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1 && n.classList && n.classList.contains('cl-l')) window.__lines.push(n.textContent.replace(/\s+/g, ' ').trim()); })
      .observe(document.body, { childList: true, subtree: true });
    // the battle state seeded as it starts (the Hush on you, each creature's coming move), so the first choice is
    // drawn from it: its cards, their Here lines, Unravel's lock and the badge
    const L = RB.combatLogic, init = L.init;
    L.init = function () {
      const st = init.apply(this, arguments), sd = o.seed;
      if (sd) {
        st.silenced = sd.silenced ? 1 : 0; st.hushed = Object.assign({}, sd.hushed || {});
        st.foes.forEach((f) => { f.intent = Object.assign({ key: sd.intent, kind: sd.intent }, L.INTENTS[sd.intent]); });
        if (st.foes.length === 1) st.intent = st.foes[0].intent;
      }
      return st;
    };
    window.__res = null;
    (o.enc ? RB.game.startEncounter(o.enc, {}) : RB.game.startBattle(o.enemy, {})).then((r) => { window.__res = r || { result: null }; });
  }, [o, WORDS]);
}
async function toChoose(p, comp) {
  for (let i = 0; i < 400; i++) {
    const v = await p.evaluate(() => { const co = document.querySelector('[data-coach-ok]'); return { dlg: RB.ui.dialogue.isOpen(), ph: RB.combat.phase(), cards: !!document.querySelector('.rcard[data-i]:not([disabled])'), coach: !!(co && co.offsetParent), ccard: !!document.querySelector('.ccard'), res: window.__res }; });
    if (v.res) return v;
    if (v.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(40); continue; }
    // a coach's note, when one is showing: closed by its own button (clicked in the page, so a hidden one never waits)
    if (v.coach) { await p.mouse.move(2, 2); await p.waitForTimeout(300); await p.evaluate(() => { const co = document.querySelector('[data-coach-ok]'); if (co && co.offsetParent) co.click(); }); continue; }
    // (the companion acts on its plan; should its menu still open, its first action)
    if (v.ccard) { await p.waitForTimeout(400); await p.evaluate(() => { const c = document.querySelector('.ccard:not([disabled])'); if (c) c.click(); }); continue; }
    if (v.ph === 'choose' && v.cards) { await p.waitForTimeout(250); return v; }
    await p.waitForTimeout(80);
  }
  return null;
}
// what the screen shows: each card's Here line and lock, and the creature's state badges
const screen = (p) => p.evaluate(() => {
  const cards = [...document.querySelectorAll('.rcard[data-i]')].map((x) => ({ i: x.getAttribute('data-i'), en: ((x.querySelector('.rc-en') || {}).textContent || '').trim(),
    here: ((x.querySelector('.rc-here') || {}).textContent || '').replace(/^Here:\s*/, '').trim(), off: x.disabled }));
  const states = [...document.querySelectorAll('.it-states .pill')].map((x) => x.textContent.trim());
  return { cards, states, foes: RB.combat.state().foes.length };
});
const card = (sc, re) => sc.cards.find((c) => re.test(c.en)) || {};
async function answerRight(p) {
  await p.waitForSelector('.chal', { timeout: 15000 });
  await p.evaluate(() => { const tab = document.querySelector('.chal-tabs .ptab[data-mode="choice"]'); if (tab) tab.click(); });
  await p.waitForSelector('.chal .mc .btn');
  await p.evaluate(() => {
    const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
    const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.util.esc(o.en) + '</span>' : '');
    const right = RB.challenge.choicesFor(window.__step).filter((o) => o.ok).map((o) => txt(html(o)));
    const btn = [...document.querySelectorAll('.chal .mc .btn:not([disabled])')].find((x) => right.includes(x.textContent.replace(/\s+/g, ' ').trim()));
    if (btn) btn.click();
  });
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go', { timeout: 15000 });
  await p.click('.fbwrap[data-fb=ok] .fb-go');
}
async function choose(p, c, comp) {
  await p.evaluate(() => { window.__lines = []; });
  for (let k = 0; k < 8; k++) {
    await p.evaluate((i) => { const x = document.querySelector('.rcard[data-i="' + i + '"]'); if (x) x.click(); }, c.i);
    await p.waitForTimeout(250);
    if (await p.evaluate(() => RB.combat.phase() !== 'choose' || !!document.querySelector('.chal'))) break;
  }
  await answerRight(p);
  await toChoose(p, comp);
  return p.evaluate(() => window.__lines.slice());
}
const n = (lines, s) => lines.filter((l) => (s instanceof RegExp ? s.test(l) : l.includes(s))).length;

// ---- the Conduit Spirit, with Mio
const solo = [
  ['1 a Hush on you, a Sweep coming', { silenced: 1, intent: 'sweep' }, /bell/i, 'Breaks the Hush.', 'Breaks the Hush.', 1, 0],
  ['2 no Hush on you, its Hush coming', { silenced: 0, intent: 'silence' }, /voice/i, 'Answers its Hush.', 'Answers its Hush.', 0, 1],
  ['3 a Hush on you and its Hush coming', { silenced: 1, intent: 'silence' }, /bell/i, 'Breaks the Hush, and answers its next one.', 'Breaks the Hush, and answers its next one.', 1, 1],
  ['4 a Hush on water only, a Sweep coming', { silenced: 0, hushed: { water: 3 }, intent: 'sweep' }, /bell/i, 'Breaks the Hush.', 'Breaks the Hush.', 1, 0],
  ['5 nothing on you, a Sweep coming', { silenced: 0, intent: 'sweep' }, /bell/i, 'No effect here: nothing for it to answer.', 'No effect here: nothing for it to answer.', 0, 0],
];
for (const [label, s, pick, bellHere, voiceHere, clear, answered] of solo) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { enemy: 'lf.conduit', comp: 'mio', seed: s });
  await toChoose(p, 'mio');
  const before = await screen(p);
  const bell = card(before, /bell/i), voice = card(before, /voice/i), un = card(before, /unravel/i);
  const lines = await choose(p, card(before, pick), 'mio');
  const after = await screen(p);
  const unAfter = card(after, /unravel/i);
  const shown = { bell: bell.here, voice: voice.here, states: before.states, unravel: un.off, lines };
  ok(bell.here === bellHere && voice.here === voiceHere, label + ': すず\'s and こえ\'s Here ' + flat({ bell: bell.here, voice: voice.here }));
  ok(n(lines, CLEAR) === clear && n(lines, ANSWERED) === answered, label + ': chosen, the clearing line ' + clear + ', the answered line ' + answered + ' ' + flat(lines));
  if (label.startsWith('1')) ok(before.states.includes('Hushed') && un.off && !after.states.includes('Hushed') && !unAfter.off,
    '1 the "Hushed" badge and Unravel locked before; after すず, the badge gone and Unravel back ' + flat({ before: before.states, un: un.off, after: after.states, unAfter: unAfter.off }));
  ok(!errors.length, label + ': no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// ---- the Wick Moths, with Nao
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { enc: 'kr.wick_ridge', comp: 'nao', seed: { silenced: 1, intent: 'silence' } });
  await toChoose(p, 'nao');
  const sc = await screen(p);
  const bell = card(sc, /bell/i);
  const standing = await p.evaluate(() => RB.combatLogic.standing(RB.combat.state()).length);
  const named = (bell.here.match(/the [^,;]+?'s next one/g) || []).length;
  ok(sc.foes > 1 && /^Breaks the Hush, and answers the .+'s next one\.$/.test(bell.here) && (bell.here.match(/Breaks the Hush/g) || []).length === 1 && named === standing && !/answers the [^;]*'s Hush/.test(bell.here),
    '6 the Wick Moths, a Hush on you and every moth\'s Hush coming: the Hush broken once, each moth it answers named, in one phrase ' + flat({ here: bell.here, standing, named }));
  const lines = await choose(p, bell, 'nao');
  ok(n(lines, CLEAR) === 1, '6 chosen: the clearing line once ' + flat(lines));
  ok(!errors.length, '6 no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

await b.close();
srv.close();
console.log(`\nhush_preview: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
