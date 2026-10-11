// Where the right answer sits, on the sheets that list answers as their authors wrote them (Robin's report on the
// letters: "letter 1 is option 1, letter 2 is option 2"; the letters themselves: tests/e2e/letters_order.mjs). Authors
// write the right answer first, or in the order that solves the task, so each of these sheets shows them dealt
// (RB.learnUi.deal), and this test opens every one of them in the built game, in Chromium, with a synthetic campaign
// (never a real save), and reads the order on screen against the written one:
//  - encounters run as procedures (machines, Hall trials, guardians): the right action is not always the first card;
//  - encounters run as conversations (Hall wings, mediation, disputes): the cards are not shown in the solving order,
//    and a labelled shortcut (Resolve, the companion's gesture) would still come first;
//  - the Cloudroad relay: the faithful way to say a part is not always first;
//  - the proofreading tray's "find" step: the right finding is not always first;
//  - the tellings: an order's chips never start in an order that already works; the best choice is not always first.
// Every card keeps the index the rules gave it, so the rules, the automated player and the other tests read the
// written order unchanged.
// Usage: node tests/e2e/answer_order.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
async function test(name, fn) {
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 600s')), 600000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.message || e).slice(0, 1400)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const DESK = { viewport: { width: 1280, height: 860 } };
const start = (p) => p.evaluate(() => {
  const s = RB.game.debugStart('rw.millroad', 10, 22, { comp: 'mio', flags: { departed: true } });
  s.edition = 2; s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
  RB.game.settings.battleAnim = 'instant'; RB.game.applySettings();
});

// open an encounter, press through what is said until its cards are on screen (the encounter sheet when nobody is
// there, the battle screen when someone is), read them, and step away
const CARDS = '.enc-card, .responses .rcards:not(.ccards) > .rcard[data-i]';
async function encounterOrder(p, id) {
  await p.evaluate((id) => { window.__res = null; RB.game.startEncounter(id, {}).then((r) => { window.__res = r || 'done'; }, () => { window.__res = 'failed'; }); }, id);
  for (let i = 0; i < 250; i++) {
    const st = await p.evaluate((q) => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector(q), done: !!window.__res }), CARDS);
    if (st.cards || st.done) break;
    if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(40);
  }
  const got = await p.evaluate((q) => {
    const sheet = RB.encScreen.current(), st = sheet ? sheet.st : RB.combat.state();
    if (!st || !st.enc || !document.querySelector(q)) return null;
    const s = RB.game.s, words = s.words.map((w) => RB.content.words[w]).filter(Boolean);
    const cards = RB.encounter.cards(st, s, words);
    const shown = [...document.querySelectorAll(q)].map((x) => +x.getAttribute('data-i')).filter((i) => cards[i]);
    return { screen: sheet ? 'sheet' : 'battle', shown: shown.map((i) => ({ i, kind: cards[i].kind, ok: !!(cards[i].action && cards[i].action.ok) })) };
  }, CARDS);
  const away = await p.$('.enc-sheet [data-away]') || await p.$('.responses [data-flee]');
  if (away) {
    await away.click();
    // "Step away? … Nothing is lost." / "Step back from this encounter? …": leave
    await p.waitForSelector('.csheet', { timeout: 5000 }).catch(() => {});
    await p.evaluate(() => { const x = [...document.querySelectorAll('.csheet .pbtn')].find((y) => /^\s*Step (away|back)\s*$/.test(y.textContent)); if (x) x.click(); });
  }
  await p.waitForFunction(() => window.__res, null, { timeout: 15000 }).catch(() => {});
  for (let i = 0; i < 80 && await p.evaluate(() => RB.ui.dialogue.isOpen() || RB.game.mode() !== 'world'); i++) { await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance(true)); await p.waitForTimeout(40); }
  return got;
}

await test('procedures: the right action is dealt among the step\'s cards, not always first', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await start(p);
  const ids = await p.evaluate(() => Object.keys(RB.content.encounters).filter((id) => RB.content.encounters[id].procedure).sort());
  const firsts = [], seen = [];
  for (const id of ids) {
    const g = await encounterOrder(p, id);
    if (!g) continue;
    const proc = g.shown.filter((c) => c.kind === 'proc');
    if (proc.length < 2) continue;
    seen.push(id);
    firsts.push(proc[0].ok);
    // the shortcut, when offered, is before the dealt cards; the general responses after them
    const kinds = g.shown.map((c) => c.kind), lastDealt = kinds.lastIndexOf('proc');
    assert(kinds.indexOf('resolve') < 0 || kinds.indexOf('resolve') < kinds.indexOf('proc'), id + ': Resolve comes before the dealt cards: ' + kinds);
    assert(!kinds.slice(0, lastDealt).some((k) => ['unravel', 'word', 'wait'].indexOf(k) >= 0), id + ': the general responses come after the dealt cards: ' + kinds);
  }
  const atFirst = firsts.filter(Boolean).length;
  console.log('  ' + seen.length + ' procedures opened; the right action first in ' + atFirst + ' (written first in all of them)');
  assert(seen.length >= 20, 'procedures opened: ' + seen.length + ' of ' + ids.length);
  assert(atFirst < seen.length * 0.8, 'the right action is first in ' + atFirst + ' of ' + seen.length);
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('conversations: the cards are not shown in the order that solves them', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await start(p);
  const ids = await p.evaluate(() => Object.keys(RB.content.encounters).filter((id) => RB.content.encounters[id].social).sort());
  // a talk offers its cards as it goes (most open with one; the rest come as people are heard), so the order is read
  // for each talk's whole set through the order both screens use (RB.encScreen.shownOrder) ...
  const sets = await p.evaluate((ids) => ids.map((id) => {
    const d = RB.content.encounters[id], acts = d.social.actions || [];
    const cards = acts.map((a) => ({ id: 's:' + a.id, kind: 'social', action: a }));
    const order = RB.encScreen.shownOrder({ enc: { def: d } }, cards);
    const again = RB.encScreen.shownOrder({ enc: { def: d } }, cards);
    return { id, n: cards.length, order, again, lasting: acts.map((a, k) => (a.lasting ? k : -1)).filter((k) => k >= 0) };
  }), ids);
  let written = 0, badLast = 0, withBad = 0, n = 0;
  for (const x of sets) {
    if (x.n < 3) continue;
    n++;
    assert(JSON.stringify(x.order.slice().sort((a, c) => a - c)) === JSON.stringify(x.order.map((v, k) => k)), x.id + ': every card shown once: ' + x.order);
    if (x.order.every((v, k) => v === k)) written++;
    if (x.lasting.length) { withBad++; if (x.lasting.indexOf(x.order[x.order.length - 1]) >= 0) badLast++; }
  }
  console.log('  ' + n + ' talks with three or more cards; shown in the written order: ' + written + '; the move that ends the talk badly last in ' + badLast + ' of ' + withBad + ' (written last in most)');
  assert(n >= 20 && written < n * 0.3, 'shown in the written (solving) order in ' + written + ' of ' + n);
  assert(badLast < withBad * 0.6, 'the move that ends the talk badly is still last in ' + badLast + ' of ' + withBad);
  // ... and on screen: a talk that opens with several cards shows them dealt, the general responses after them
  let onScreen = 0;
  for (const id of ids) {
    const g = await encounterOrder(p, id);
    if (!g) continue;
    const soc = g.shown.filter((c) => c.kind === 'social').map((c) => c.i);
    const kinds = g.shown.map((c) => c.kind);
    assert(kinds.indexOf('gesture') < 0 || kinds.indexOf('gesture') < kinds.indexOf('social'), id + ': the gesture comes before the dealt cards: ' + kinds);
    assert(!kinds.slice(0, kinds.lastIndexOf('social')).some((k) => ['unravel', 'word', 'wait', 'truth'].indexOf(k) >= 0), id + ': the general responses come after the dealt cards: ' + kinds);
    if (soc.length >= 2 && !soc.every((x, k) => k === 0 || x > soc[k - 1])) onScreen++;
  }
  console.log('  on screen, talks opening with their cards out of written order: ' + onScreen);
  assert(onScreen >= 1, 'no talk on screen showed its cards dealt');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('the relay: the faithful way to say a part is not always first', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await start(p);
  const ids = await p.evaluate(() => Object.keys(RB.content.relay || {}).sort());
  let parts = 0, faithfulFirst = 0;
  for (const id of ids) {
    await p.evaluate((id) => { window.__rl = null; RB.ui.relay.open(id).then((r) => { window.__rl = r || 'closed'; }); }, id);
    await p.waitForSelector('.rl-opt');
    const o = await p.evaluate((id) => {
      const d = RB.relay.def(id), prof = RB.game.s.learn.profile;
      return RB.relay.parts(d, RB.game.s).map((pt) => {
        const written = RB.relay.optsAt(pt, prof).map((x) => x.id);
        const shown = [...document.querySelectorAll('.rl-opt[data-p="' + pt.id + '"]')].map((x) => x.getAttribute('data-o'));
        return { written, shown };
      });
    }, id);
    for (const x of o) {
      assert(JSON.stringify(x.written.slice().sort()) === JSON.stringify(x.shown.slice().sort()), id + ': every way offered once: ' + JSON.stringify(x));
      if (x.written.length < 2) continue;
      parts++;
      if (x.shown[0] === x.written[0]) faithfulFirst++;
    }
    // a redraw (In English) keeps the order
    const before = await p.evaluate(() => [...document.querySelectorAll('.rl-opt')].map((x) => x.getAttribute('data-o')).join());
    await p.click('.rl-showen');
    const after = await p.evaluate(() => [...document.querySelectorAll('.rl-opt')].map((x) => x.getAttribute('data-o')).join());
    assert(before === after, id + ': showing the English dealt the ways again');
    await p.click('.rl-cancel');
    await p.waitForFunction(() => window.__rl, null, { timeout: 5000 });
  }
  console.log('  ' + ids.length + ' relays, ' + parts + ' parts; the faithful way first in ' + faithfulFirst + ' (written first in all of them)');
  assert(parts >= 10 && faithfulFirst < parts * 0.8, 'the faithful way first in ' + faithfulFirst + ' of ' + parts);
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('proofreading: the right finding is not always first', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await start(p);
  const tasks = await p.evaluate(() => { const out = []; for (const d of RB.proof.defs()) for (const lv of ['F', 'E', 'I', 'A']) { const t = RB.proof.tier(d, lv); if (t && t.find && t.lv === lv) out.push([d.id, lv]); } return out; });
  let first = 0;
  for (const [id, lv] of tasks) {
    await p.evaluate(([id, lv]) => {
      const d = RB.proof.byId(id), t = RB.proof.tier(d, lv), session = { alive: () => true, set: () => {} };
      window.__pf = null; RB.ui.proof.task(session, d, t, false).then((r) => { window.__pf = r || 'closed'; });
    }, [id, lv]);
    await p.waitForSelector('[data-pb-find]');
    const o = await p.evaluate(([id, lv]) => {
      const t = RB.proof.tier(RB.proof.byId(id), lv);
      const shown = [...document.querySelectorAll('[data-pb-find]')].map((x) => +x.getAttribute('data-pb-find'));
      return { shown, okAt: shown.findIndex((i) => t.find.options[i].ok), n: t.find.options.length };
    }, [id, lv]);
    assert(o.shown.length === o.n && new Set(o.shown).size === o.n, id + ' ' + lv + ': every finding offered once: ' + o.shown);
    if (o.okAt === 0) first++;
    await p.keyboard.press('Escape');
    await p.waitForFunction(() => window.__pf, null, { timeout: 5000 }).catch(() => {});
    await p.evaluate(() => { document.querySelectorAll('.pb-proof').forEach((x) => { const s = x.closest('.scrim, .lsheet-scrim') || x; s.remove(); }); });
  }
  console.log('  ' + tasks.length + ' tiers with a find step; the right finding first in ' + first + ' (written first in all of them)');
  assert(tasks.length >= 5 && first < tasks.length, 'the right finding first in ' + first + ' of ' + tasks.length);
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('tellings: an order\'s chips never start in an order that works; the best way to act is not always first', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await start(p);
  const ids = await p.evaluate(() => Object.keys(RB.content.tellings || {}).filter((id) => ['order', undefined, 'choice'].indexOf(RB.content.tellings[id].answer.kind) >= 0 || RB.content.tellings[id].answer.options).sort());
  let choices = 0, bestFirst = 0, orders = 0;
  for (const id of ids) {
    await p.evaluate((id) => { window.__tl = null; RB.ui.tellings.open(id).then((r) => { window.__tl = r || 'closed'; }); }, id);
    await p.waitForSelector('.tl-sheet .tl-go');
    const o = await p.evaluate((id) => {
      const d = RB.tellings.def(id);
      if (d.answer.kind === 'order') { const chips = [...document.querySelectorAll('.tl-chip')].map((x) => x.getAttribute('data-x')); return { kind: 'order', chips, works: RB.tellings.judge(d, chips).ok, n: d.answer.items.length }; }
      if (d.answer.options) { const shown = [...document.querySelectorAll('.tl-opt')].map((x) => x.getAttribute('data-o')); const best = d.answer.options.filter((x) => x.best).map((x) => x.id); return { kind: 'choice', shown, written: d.answer.options.map((x) => x.id), best }; }
      return { kind: d.answer.kind };
    }, id);
    if (o.kind === 'order') { orders++; assert(o.chips.length === o.n && !o.works, id + ': the chips start in an order that already works: ' + o.chips); }
    if (o.kind === 'choice' && o.shown.length > 1) {
      assert(JSON.stringify(o.shown.slice().sort()) === JSON.stringify(o.written.slice().sort()), id + ': every way offered once');
      choices++;
      if (o.best.indexOf(o.shown[0]) >= 0) bestFirst++;
    }
    await p.click('.tl-cancel');
    await p.waitForFunction(() => window.__tl, null, { timeout: 5000 });
  }
  console.log('  ' + orders + ' order(s), none starting in a working order; ' + choices + ' choices, the best first in ' + bestFirst);
  assert(orders >= 1 && choices >= 5 && bestFirst < choices, 'tellings: ' + JSON.stringify({ orders, choices, bestFirst }));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

console.log(pass + ' passed, ' + fail + ' failed');
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
