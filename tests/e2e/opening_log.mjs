// Nao's opening, told once (Agnes 6543444529, 6543603576; Local CL-547, CL-548, CL-549; Cloud CC-394, CC-395): an
// Unravel with Nao's opening ready was logged "…Nao saw the opening — two knots come loose." and then "Two knots come
// loose.", and "two" whatever came loose (one knot left; a weakened creature). In Chromium on the built game, the log
// recorded line by line as it is written:
//  A. real exchanges with the Glass Golem and Nao (co.golem; seeded: the opening, the knots and the weakening are set
//     in the battle state, then the Unravel card is pressed and its exercise answered right through the real screen):
//     1. three knots: Nao's acknowledgment and exactly one count sentence, "Two knots come loose."; 3 → 1; Nao's spot
//        and both threads still drawn;
//     2. one knot left: the acknowledgment and "A knot comes loose."; 1 → 0;
//     3. weakened, four knots: the acknowledgment and "Three knots come loose."; 4 → 1;
//     4. a plain Unravel: "A knot comes loose." and no acknowledgment; 3 → 2;
//  B. the release beat on its own, its events played through the battle screen's own beat (seeded, not play):
//     5. four freed: "Four knots come loose."; a release with no n, or n 0: "A knot comes loose."; none left: no count;
//     6. two releases in turn on one creature: "A knot comes loose." twice, 3 → 1;
//     7. in a group (the Wick Moths), creatures with different knots: each line names its creature and counts its own
//        (one, when two were asked and one was left; three of four);
//  no page errors.
// Usage: node tools/build.mjs && node tests/e2e/opening_log.mjs
import { serve, launch, page, companionTurn } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const WORDS = ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'ishi', 'iyasu', 'honoo', 'suzu', 'koe'];
const SAW = 'Nao saw the opening.';
// every count sentence in the recorded lines (a release said in words, whatever its case)
const counts = (lines) => lines.flatMap((l) => l.match(/\b(?:a knot comes loose|(?:two|three|four|five|six|seven|eight|nine|ten|\d+) knots come loose)\./gi) || []);

async function begin(p, o) {
  await p.evaluate(([o, WORDS]) => {
    const s = RB.game.debugStart('rw.millroad', 10, 22, { comp: o.comp });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'F'; s.learn.difficulty = 'normal';
    s.words = WORDS.slice();
    RB.game.settings.input = 'choice'; RB.game.settings.battleAnim = o.anim || 'fast'; RB.game.settings.compPlan = 'ask';
    RB.game.applySettings();
    // the battle screen's own port to the sequencer (its beat), and the open language step, kept for the test
    const attach = RB.battleSeq.attach;
    RB.battleSeq.attach = function (port) { window.__port = port; return attach.apply(this, arguments); };
    const runStep = RB.challenge.runStep;
    RB.challenge.runStep = (step, x) => { window.__step = step; return runStep(step, x); };
    // the log, line by line as it is written
    window.__lines = [];
    new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1 && n.classList && n.classList.contains('cl-l')) window.__lines.push(n.textContent.replace(/\s+/g, ' ').trim()); })
      .observe(document.body, { childList: true, subtree: true });
    window.__res = null;
    (o.enc ? RB.game.startEncounter(o.enc, {}) : RB.game.startBattle(o.enemy, {})).then((r) => { window.__res = r || { result: null }; });
  }, [o, WORDS]);
}
// on to your next choice (dialogue advanced, notes closed, the companion's turn taken with its first move), or the end
async function toChoose(p, comp) {
  for (let i = 0; i < 400; i++) {
    const v = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), ph: RB.combat.phase(), cards: !!document.querySelector('.rcard[data-i]:not([disabled])'), coach: !!document.querySelector('[data-coach-ok]'), ccard: !!document.querySelector('.ccard'), res: window.__res }));
    if (v.res) return v;
    if (v.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(40); continue; }
    if (v.coach) { await p.mouse.move(2, 2); await p.waitForTimeout(300); await p.click('[data-coach-ok]').catch(() => {}); continue; }
    if (v.ccard) { await p.mouse.move(2, 2); await companionTurn(p, comp).catch(() => {}); continue; }
    if (v.ph === 'choose' && v.cards) { await p.waitForTimeout(250); return v; }
    await p.waitForTimeout(80);
  }
  return null;
}
const cardsNow = (p) => p.evaluate(() => [...document.querySelectorAll('.rcard[data-i]')].map((x) => ({ i: x.getAttribute('data-i'), en: ((x.querySelector('.rc-en') || {}).textContent || '').trim() })));
const pressCard = async (p, pick) => {
  for (let k = 0; k < 8; k++) {
    await p.evaluate((i) => { const c = document.querySelector('.rcard[data-i="' + i + '"]'); if (c) c.click(); }, pick.i);
    await p.waitForTimeout(250);
    if (await p.evaluate(() => RB.combat.phase() !== 'choose' || !!document.querySelector('.chal, .csheet .pbtn'))) return;
  }
};
// the open language step answered right first time, in choice mode (the option the step itself marks right)
async function answerRight(p) {
  await p.waitForSelector('.chal', { timeout: 15000 });
  await p.evaluate(() => { const tab = document.querySelector('.chal-tabs .ptab[data-mode="choice"]'); if (tab) tab.click(); });
  await p.waitForSelector('.chal .mc .btn');
  await p.evaluate(() => {
    const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
    const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.util.esc(o.en) + '</span>' : '');
    const right = RB.challenge.choicesFor(window.__step).filter((o) => o.ok).map((o) => txt(html(o)));
    const btn = [...document.querySelectorAll('.chal .mc .btn')].find((x) => right.includes(x.textContent.replace(/\s+/g, ' ').trim()));
    if (btn) btn.click();
  });
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go', { timeout: 15000 });
  await p.click('.fbwrap[data-fb=ok] .fb-go');
}
// one exchange: the state seeded, the Unravel pressed and answered right; what the log said, and the knots
async function exchange(p, seed) {
  await p.evaluate((seed) => {
    const st = RB.combat.state(), f = st.foes[st.cur];
    st.openingBonus = !!seed.opening; f.knots = seed.knots; st.knots = seed.knots; if (seed.loose) f.loose = seed.loose;
    RB.combat.refresh();
  }, seed);
  const un = (await cardsNow(p)).find((c) => /unravel/i.test(c.en));
  const before = await p.evaluate(() => { window.__lines = []; const st = RB.combat.state(); return st.foes[st.cur].knots; });
  await pressCard(p, un); await answerRight(p);
  await toChoose(p);
  return p.evaluate((before) => {
    const st = RB.combat.state(), tr = RB.battleSeq.trace().filter((r) => r.kind === 'player').pop();
    return { before, after: st && st.foes[st.cur] ? st.foes[st.cur].knots : 0, lines: window.__lines.slice(), fired: tr ? tr.fired : [] };
  }, before);
}

// ---- A. real exchanges with the Glass Golem
const real = [
  ['1 three knots, the opening ready', { opening: true, knots: 3 }, true, ['Two knots come loose.'], 1],
  ['2 one knot left, the opening ready', { opening: true, knots: 1 }, true, ['A knot comes loose.'], 0],
  ['3 weakened, four knots, the opening ready', { opening: true, knots: 4, loose: 1 }, true, ['Three knots come loose.'], 1],
  ['4 a plain Unravel, three knots', { opening: false, knots: 3 }, false, ['A knot comes loose.'], 2],
];
for (const [label, seed, saw, want, after] of real) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { enemy: 'co.golem', comp: 'nao' });
  await toChoose(p);
  const r = await exchange(p, seed);
  const ack = r.lines.filter((l) => l.endsWith(SAW)).length;
  ok(JSON.stringify(counts(r.lines)) === JSON.stringify(want) && ack === (saw ? 1 : 0) && r.after === after,
    label + ': ' + (saw ? 'the acknowledgment and ' : '') + 'exactly one count sentence, "' + want[0] + '"; ' + seed.knots + ' → ' + after + ' (' + JSON.stringify({ lines: r.lines, after: r.after }) + ')');
  if (label.startsWith('1')) {
    const threads = r.fired.filter((x) => x === 'fx:pThread').length;
    ok(r.fired.includes('fx:pSpot') && threads === 2, '1 Nao\'s spot and both threads still drawn (' + JSON.stringify({ threads, spot: r.fired.includes('fx:pSpot') }) + ')');
  }
  ok(!errors.length, label + ': no page errors ' + errors.slice(0, 3).join(' | '));
  await p.close();
}

// ---- B. the release beat on its own, through the battle screen's own beat
// each event played on the beat and its line recorded; the knots it leaves, as the screen shows them
const beats = (p, set, evs) => p.evaluate(async ([set, evs]) => {
  const st = RB.combat.state();
  set.forEach((k, i) => { if (k != null && st.foes[i]) st.foes[i].knots = k; });
  window.__port.reconcile();
  window.__lines = [];
  for (const f of evs) window.__port.beat(f, null);
  const shown = RB.combat.shown().foes.map((f) => f.knots);
  window.__port.reconcile();
  // (the log's observer is told of the lines after this task: let it)
  await new Promise((r) => setTimeout(r, 50));
  return { lines: window.__lines.slice(), shown };
}, [set, evs]);
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { enemy: 'co.golem', comp: 'nao', anim: 'instant' });
  await toChoose(p);
  const four = await beats(p, [6], [{ t: 'unravel', n: 4, foe: 0 }]);
  const none = await beats(p, [3], [{ t: 'unravel', foe: 0 }]);
  const zero = await beats(p, [3], [{ t: 'unravel', n: 0, foe: 0 }]);
  const left0 = await beats(p, [0], [{ t: 'unravel', n: 1, foe: 0 }]);
  ok(JSON.stringify([four.lines, four.shown[0]]) === JSON.stringify([['Four knots come loose.'], 2]),
    '5 four freed: "Four knots come loose."; 6 → 2 (' + JSON.stringify(four) + ')');
  ok(JSON.stringify([none.lines, zero.lines]) === JSON.stringify([['A knot comes loose.'], ['A knot comes loose.']]),
    '5 a release with no n, or n 0: "A knot comes loose." (' + JSON.stringify({ none: none.lines, zero: zero.lines }) + ')');
  ok(!counts(left0.lines).length && left0.shown[0] === 0, '5 none left: no count claimed (' + JSON.stringify(left0) + ')');
  const twice = await beats(p, [3], [{ t: 'unravel', n: 1, foe: 0 }, { t: 'unravel', n: 1, foe: 0 }]);
  ok(JSON.stringify([twice.lines, twice.shown[0]]) === JSON.stringify([['A knot comes loose.', 'A knot comes loose.'], 1]),
    '6 two releases in turn on one creature: "A knot comes loose." twice; 3 → 1 (' + JSON.stringify(twice) + ')');
  ok(!errors.length, 'the beat on its own: no page errors ' + errors.slice(0, 3).join(' | '));
  await p.close();
}
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { enc: 'kr.wick_ridge', comp: 'nao', anim: 'instant' });
  await toChoose(p);
  const g = await beats(p, [4, 1], [{ t: 'unravel', n: 2, foe: 1 }, { t: 'unravel', n: 3, foe: 0 }]);
  ok(g.lines.length === 2 && /^The .+: A knot comes loose\.$/.test(g.lines[0]) && /^The .+: Three knots come loose\.$/.test(g.lines[1]) && g.lines[0].split(':')[0] !== g.lines[1].split(':')[0] && g.shown[1] === 0 && g.shown[0] === 1,
    '7 in a group: each line names its creature and counts its own (one, when two were asked and one was left; three of four) (' + JSON.stringify(g) + ')');
  ok(!errors.length, 'the group: no page errors ' + errors.slice(0, 3).join(' | '));
  await p.close();
}

console.log(`\nopening_log: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
