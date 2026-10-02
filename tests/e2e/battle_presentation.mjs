// The battle presentation contract (battle addendum §12–§16, §23.2–§23.3) on the built
// index.html in Chromium, with real mouse and keyboard input in synthetic campaigns:
//   - the action banner: hidden while choosing, during the language task, while choosing the
//     companion's support, between actions and after; shown only during each performed action,
//     blue for the party and red for a creature, with that action's actor and name; gone by the
//     action's own end, also when the finishing response is followed by the settling
//   - Battle animations Normal / Fast / Instant: Fast plays shorter; Instant shows no banner and
//     no movement at all and lands the same results; Text speed changes nothing in battle
//   - Skip settles the rest of the exchange (results once, in order)
//   - the menus withdraw on commitment and come back once for the next decision; withdrawn
//     controls cannot be reached by keyboard or pointer; Keep visible leaves them, disabled
//   - Resolve and Harmony stay visible in every state, the language task included
//   - per-creature intent badges open by hover, focus and tap; reading-critical wording stays visible
// Usage: node tests/e2e/battle_presentation.mjs [filter]
import { serve, launch, page } from './lib.mjs';

const only = process.argv[2];
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const results = [];
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 240 s')), 240000))]); pass++; results.push('PASS ' + name); console.log('PASS ' + name); }
  catch (e) { fail++; results.push('FAIL ' + name + '\n   ' + String((e && e.message) || e).slice(0, 1200)); console.log('FAIL ' + name + ': ' + String((e && e.message) || e).slice(0, 700)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const wait = (p, ms) => p.waitForTimeout(ms);

// A synthetic campaign placed in the mill, then the Flour Moth there (as walking into it would start it).
// A recorder samples, every animation frame, the banner, the phase and whether the menus are out.
async function battle(p, o) {
  await p.evaluate((o) => {
    const s = RB.game.debugStart(o.map || 'rw.mill1', 7, 9, { comp: o.comp || null, flags: Object.assign({ rw_gears: true }, o.flags || {}) });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
    if (o.diff) s.learn.difficulty = o.diff;
    s.words = (o.words || ['mizu', 'iyasu', 'mamoru']).slice();
    s.tips = { harmony: 1, harmonyFull: 1, cturn: 1, group: 1 };
    for (const k of ['strike', 'sweep', 'shroud', 'rest', 'heat', 'charge', 'lie', 'mirror', 'plea']) s.tips['intent:' + k] = 1;
    for (const w of s.words) s.tips['word:' + w] = 1;
    RB.game.settings.input = 'choice';
    RB.game.settings.battleAnim = o.anim || 'normal';
    RB.game.settings.battleControls = o.controls || 'adaptive';
    RB.game.settings.intentDisplay = o.intents || 'adaptive';
    RB.game.settings.textSpeed = o.text || 'normal';
    RB.game.settings.reducedMotion = !!o.reduce; RB.game.applySettings();
    window.__rec = [];
    window.__recOn = true;
    const tick = () => {
      if (!window.__recOn) return;
      const bs = RB.battleBanner ? RB.battleBanner.state() : {};
      const ui = document.querySelector('.combat-ui');
      // Resolve and Harmony: the party slip on screen and not covered, or the status inset on the language sheet
      const pe = document.querySelector('.cb-party');
      let party = 0, cover = null;
      if (pe) { const r = pe.getBoundingClientRect(), cs = getComputedStyle(pe); const top = document.elementFromPoint(r.left + Math.min(40, r.width / 2), r.top + Math.min(20, r.height / 2)); party = r.height > 20 && r.top >= -1 && r.bottom <= innerHeight + 1 && cs.visibility === 'visible' && +cs.opacity > 0.9 && top && pe.contains(top) ? 1 : 0; if (!party) cover = { top: top ? (top.id || top.className || top.tagName) + '' : null, r: [Math.round(r.top), Math.round(r.bottom)], vis: cs.visibility, op: cs.opacity, scroll: ui ? ui.scrollTop : 0 }; }
      const inset = document.querySelector('.chal .chal-status');
      const insetOk = !!(inset && inset.getBoundingClientRect().height > 10 && /\d/.test(inset.textContent));
      window.__rec.push({ t: performance.now(), phase: RB.combat.phase(), busy: RB.battleSeq.busy(), banner: bs.visible ? bs.side + ':' + bs.id : null, shown: !!bs.shown, acting: !!(ui && ui.classList.contains('cb-acting')), chal: !!document.querySelector('.chal'), dlg: RB.ui.dialogue.isOpen(), party, cover, inset: insetOk, text: bs.visible ? bs.text : null });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    const place = o.place || RB.content.maps[o.map || 'rw.mill1'].foes.find((f) => f.id === (o.foe || 'm1a'));
    window.__result = null;
    const group = o.dupes ? Array(o.dupes).fill(place.enemy) : o.group;
    RB.game.startBattle(place.enemy, Object.assign({ place, where: { map: o.map || 'rw.mill1', x: place.x, y: place.y }, foeKey: 'foe:' + (o.map || 'rw.mill1') + ':' + place.id }, group ? { group } : {})).then((r) => { window.__result = r || 'done'; });
  }, o);
  await toCards(p);
}
async function toCards(p) {
  for (let i = 0; i < 600; i++) {
    const s = await p.evaluate(() => ({ r: window.__result, dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal') && !RB.battleSeq.busy() }));
    if (s.cards || s.r) return s;
    if (s.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await wait(p, 40);
  }
  throw new Error('no response cards');
}
async function pick(p, re) {
  const i = await p.evaluate((m) => { const c = [...document.querySelectorAll('.rcard[data-i]')].find((x) => !x.disabled && new RegExp(m, 'i').test(x.textContent.replace(/\s+/g, ' '))); return c ? c.getAttribute('data-i') : null; }, re);
  assert(i != null, 'no card matching ' + re);
  await p.click('.rcard[data-i="' + i + '"]');
}
// answer the open task with its right option (real click), then continue
async function answerRight(p) {
  await p.waitForSelector('.chal .mc .btn, .chal .tiles', { timeout: 10000 });
  await p.mouse.move(2, 2);
  const idx = await p.evaluate(() => {
    const st = window.__lastStep;
    const bs = [...document.querySelectorAll('.chal .mc .btn')];
    const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => (o.text != null ? RB.tasks.plain(o.text) : o.en || ''));
    const txt = (el) => { const c = el.cloneNode(true); c.querySelectorAll('rt,.enline').forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, ''); };
    return bs.findIndex((b) => right.some((r) => txt(b) === r.replace(/\s+/g, '') || (b.querySelector('.enline') && right.includes(b.querySelector('.enline').textContent.trim()))));
  });
  assert(idx >= 0, 'the right option is on screen');
  await p.locator('.chal .mc .btn').nth(idx).click();
  await p.waitForSelector('.fbwrap .fb-go', { timeout: 10000 });
  await p.click('.fbwrap .fb-go');
}
async function hookSteps(p) { await p.evaluate(() => { const run = RB.challenge.runStep; RB.challenge.runStep = (step, o) => { window.__lastStep = step; return run(step, o); }; }); }
// one exchange: a response by its card text, answered right; the companion's turn skipped if offered
async function exchange(p, re, o) {
  o = o || {};
  await pick(p, re);
  await answerRight(p);
  if (o.support) {
    await p.waitForSelector('.ccard', { timeout: 8000 });
    // (the pointer, left on Continue, can rest on a word whose hover help then covers a card)
    await p.mouse.move(2, 2);
    await wait(p, 300); // the companion's menu ignores presses in its first 250 ms (a double click on Continue)
    const i = await p.evaluate((m) => { const c = [...document.querySelectorAll('.ccard[data-a]')].find((x) => !x.disabled && new RegExp(m, 'i').test(x.textContent)); return c ? c.getAttribute('data-a') : null; }, o.support);
    assert(i != null, 'no support ' + o.support);
    await p.click('.ccard[data-a="' + i + '"]');
  }
  // the exchange plays out
  for (let i = 0; i < 900; i++) {
    const s = await p.evaluate(() => ({ r: window.__result, busy: RB.battleSeq.busy(), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal'), dlg: RB.ui.dialogue.isOpen(), ph: RB.combat.phase() }));
    if (s.r || (!s.busy && s.cards && s.ph === 'choose')) return s;
    if (s.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await wait(p, 30);
  }
  throw new Error('the exchange did not finish');
}
const rec = (p) => p.evaluate(() => window.__rec.slice());

await test('banner: hidden while choosing and during the language task; blue for your response, red for the creature\'s move; never between actions; gone after', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await battle(p, {});
  await hookSteps(p);
  await p.evaluate(() => { window.__rec = []; });
  await exchange(p, 'unravel');
  const R = await rec(p);
  const during = (ph) => R.filter((x) => x.phase === ph);
  const bad = R.filter((x) => x.banner && (x.phase === 'choose' || x.phase === 'challenge' || x.phase === 'companion' || x.chal || !x.busy));
  assert(!bad.length, 'no banner outside a performed action (' + bad.length + ' frames): ' + JSON.stringify(bad.slice(0, 3)));
  const party = R.filter((x) => x.banner && x.banner.startsWith('party:'));
  const enemy = R.filter((x) => x.banner && x.banner.startsWith('enemy:'));
  assert(party.length > 5 && party.every((x) => x.phase === 'player' || x.phase === 'finish'), 'a blue banner during your response only (' + party.length + ' frames)');
  assert(enemy.length > 5 && enemy.every((x) => x.phase === 'enemy'), 'a red banner during the creature\'s move only (' + enemy.length + ' frames)');
  const ids = [...new Set(R.filter((x) => x.banner).map((x) => x.banner))];
  assert(ids.length === 2, 'one banner per performed action, no previews or leftovers: ' + JSON.stringify(ids));
  // a gap: frames between the two actions with no banner
  const firstEnemy = R.findIndex((x) => x.banner && x.banner.startsWith('enemy:'));
  const lastParty = R.map((x) => x.banner && x.banner.startsWith('party:')).lastIndexOf(true);
  assert(firstEnemy > lastParty + 1, 'the banner is gone before the next action begins');
  const text = await p.evaluate(() => RB.battleBanner.state());
  assert(!text.visible && !text.shown && !text.text, 'and gone after the exchange: ' + JSON.stringify(text));
  void during;
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('Instant: no banner and no movement at any frame; the same results; Text speed never changes battle timing', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await battle(p, { anim: 'instant', text: 'normal' });
  await hookSteps(p);
  await p.evaluate(() => { window.__rec = []; window.__G = { before: JSON.stringify(RB.combat.shown()) }; });
  await exchange(p, 'unravel');
  const R = await rec(p);
  assert(!R.some((x) => x.banner || x.shown), 'never a banner frame in Instant');
  const st = await p.evaluate(() => ({ seq: RB.battleSeq.stats().counters, trace: RB.battleSeq.trace().slice(-3).map((t) => t.settled) }));
  assert(st.trace.every((x) => x === 'instant'), 'each sequence settled at once: ' + JSON.stringify(st));
  const log = await p.evaluate(() => (document.querySelector('.clog') || {}).textContent || '');
  assert(/knot/i.test(log), 'the last exchange is readable (recap): ' + log.slice(0, 200));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
  // Text speed: the same Normal sequence lasts the same with Instant text
  const dur = async (text) => {
    const { p, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
    await battle(p, { anim: 'normal', text });
    await hookSteps(p);
    await exchange(p, 'unravel');
    const d = await p.evaluate(() => RB.battleSeq.trace().filter((t) => t.kind === 'player' || t.kind === 'enemy').map((t) => ({ k: t.kind, end: t.meta.end })));
    await ctx.close();
    return d;
  };
  const a = await dur('normal'), c = await dur('instant');
  assert(JSON.stringify(a) === JSON.stringify(c), 'Text speed has no say in battle timing: ' + JSON.stringify({ normal: a, instant: c }));
});

await test('Fast plays shorter than Normal; Skip settles the rest of the exchange with no banner left', async () => {
  const wall = async (anim) => {
    const { p, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
    await battle(p, { anim });
    await hookSteps(p);
    await exchange(p, 'unravel');
    const d = await p.evaluate(() => RB.battleSeq.trace().filter((t) => t.kind === 'player').map((t) => t.dur));
    await ctx.close();
    return d[0];
  };
  const n = await wall('normal'), f = await wall('fast');
  assert(f < n * 0.85, 'Fast is shorter: ' + JSON.stringify({ normal: n, fast: f }));
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await battle(p, {});
  await hookSteps(p);
  await pick(p, 'unravel');
  await answerRight(p);
  await p.waitForFunction(() => RB.battleSeq.busy() && RB.battleBanner.state().visible, null, { timeout: 8000 });
  await p.waitForSelector('.cb-skip:not([hidden])', { timeout: 4000 });
  await wait(p, 200);
  await p.click('.cb-skip');
  await p.waitForFunction(() => RB.combat.phase() === 'choose' && !RB.battleSeq.busy(), null, { timeout: 8000 });
  const s = await p.evaluate(() => ({ banner: RB.battleBanner.state(), trace: RB.battleSeq.trace().slice(-2).map((t) => t.settled), skipping: RB.battleSeq.skipping() }));
  assert(!s.banner.visible && !s.banner.text && s.trace.every((x) => x === 'skip') && !s.skipping, 'skipped: settled, no banner, cleared for the next decision ' + JSON.stringify(s));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---- per-creature intent badges (§13) ----------------------------------------------------------
const IB = (p) => p.evaluate(() => RB.battleIntents.state());
const ibCenter = async (p, i) => { const b = (await IB(p)).badges.find((x) => x.i === i); return { x: b.x + b.w / 2, y: b.y + b.h / 2 }; };
const overlap = (a, c) => a.x < c.x + c.w && c.x < a.x + a.w && a.y < c.y + c.h && c.y < a.y + a.h;

await test('intent badges: one per creature at its slot, marked where names repeat; hover, focus and press open it; it never targets', async () => {
  for (const vp of [{ width: 1280, height: 800 }, { width: 390, height: 844 }, { width: 320, height: 640 }]) {
    const { p, errors, ctx } = await page(b, url, { viewport: vp });
    await battle(p, { diff: 'hard', dupes: 2 });
    await p.waitForFunction(() => RB.battleIntents.state().badges.length === 3, null, { timeout: 8000 });
    await wait(p, 300);
    const S = await IB(p);
    const geo = await p.evaluate(() => ({ hits: RB.battleStage.stats().hits, stage: (() => { const r = document.querySelector('.combat-ui > .cb-stage').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; })(), slips: [...document.querySelectorAll('.cb-foe .fs')].map((x) => ({ i: +x.dataset.foe, mark: (x.querySelector('.ib-m') || {}).textContent || '' })) }));
    const tag = vp.width + 'x' + vp.height + ': ';
    const marks = S.badges.map((x) => x.label.match(/ ([A-C]): about to/)).map((m) => m && m[1]);
    assert(marks.every(Boolean) && new Set(marks).size === 3, tag + 'three creatures of one name: each badge says which (A, B, C): ' + JSON.stringify(S.badges.map((x) => x.label)));
    for (const bd of S.badges) {
      const sl = geo.slips.find((x) => x.i === bd.i);
      assert(sl && bd.label.includes(' ' + sl.mark + ':'), tag + 'the badge and the slip of creature ' + bd.i + ' carry the same mark');
      assert(bd.w >= 44 && bd.h >= 44, tag + 'a 44 px target: ' + JSON.stringify(bd));
      assert(bd.x >= geo.stage.x - 1 && bd.x + bd.w <= geo.stage.x + geo.stage.w + 1 && bd.y >= geo.stage.y - 1 && bd.y + bd.h <= geo.stage.y + geo.stage.h + 1, tag + 'inside the scene: ' + JSON.stringify({ bd, stage: geo.stage }));
      if (!S.rail) { const h = geo.hits.find((q) => q.i === bd.i); const cx = bd.x + bd.w / 2; assert(cx >= h.x - 40 && cx <= h.x + h.w + 40, tag + 'over its own creature: ' + JSON.stringify({ bd, h })); }
    }
    for (let a = 0; a < 3; a++) for (let c = a + 1; c < 3; c++) assert(!overlap(S.badges[a], S.badges[c]), tag + 'badges never overlap: ' + JSON.stringify(S.badges));
    if (vp.width !== 1280) { assert(!errors.length, errors.join('; ')); await ctx.close(); continue; }
    // hover: a preview after a short delay, kept while the pointer moves into it, gone after both are left
    const before = await p.evaluate(() => ({ cur: RB.combat.state().cur, phase: RB.combat.phase() }));
    const other = S.badges.find((x) => x.i !== before.cur).i;
    const c1 = await ibCenter(p, other);
    await p.mouse.move(c1.x, c1.y);
    await wait(p, 60);
    assert(!(await IB(p)).open, 'no card the instant the pointer arrives');
    await p.waitForFunction(() => { const o = RB.battleIntents.state().open; return o && o.how === 'preview'; }, null, { timeout: 2000 });
    const card = (await IB(p)).card;
    assert(card && card.text.includes('Details') === false && card.w > 100, 'a preview card: ' + JSON.stringify(card));
    await p.mouse.move(c1.x, card.y + 12, { steps: 6 });
    await wait(p, 600);
    assert((await IB(p)).open, 'the card stays while the pointer is in it');
    await p.mouse.move(geo.stage.x + 4, geo.stage.y + geo.stage.h - 4, { steps: 4 });
    await p.waitForFunction(() => !RB.battleIntents.state().open, null, { timeout: 2000 });
    // press: pinned; nothing targeted, chosen or started
    await p.mouse.click(c1.x, c1.y);
    let st = await IB(p);
    assert(st.open && st.open.how === 'pin' && st.open.i === other, 'a press pins the card: ' + JSON.stringify(st.open));
    const after = await p.evaluate(() => ({ cur: RB.combat.state().cur, phase: RB.combat.phase(), chal: !!document.querySelector('.chal'), busy: RB.battleSeq.busy() }));
    assert(after.cur === before.cur && after.phase === 'choose' && !after.chal && !after.busy, 'inspecting never targets, chooses or plays anything: ' + JSON.stringify({ before, after }));
    const party = await p.evaluate(() => { const r = document.querySelector('.cb-party').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
    assert(!overlap(st.card, party), 'the card never covers the party slip: ' + JSON.stringify({ card: st.card, party }));
    assert(await p.$('#cb-icard [data-ic-close]'), 'the card has a Close button');
    // another badge switches; Escape closes and returns focus to the badge
    const third = S.badges.find((x) => x.i !== other).i;
    const c2 = await ibCenter(p, third);
    await p.mouse.click(c2.x, c2.y);
    st = await IB(p);
    assert(st.open && st.open.i === third && st.open.how === 'pin', 'pressing another badge switches to it');
    await p.keyboard.press('Escape');
    st = await IB(p);
    const foc = await p.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-ib'));
    assert(!st.open && foc === String(third), 'Escape closes it; focus is back on its badge: ' + JSON.stringify({ open: st.open, foc }));
    assert(await p.evaluate(() => RB.combat.phase() === 'choose' && !document.querySelector('.chal')), 'Escape on the card did not step back from anything');
    // keyboard focus: the same card without a pointer
    await p.keyboard.press('Tab');
    await p.keyboard.press('Shift+Tab');
    await p.waitForFunction(() => { const o = RB.battleIntents.state().open; return o && o.how === 'focus'; }, null, { timeout: 2000 });
    // Close by its button
    await p.mouse.click(c2.x, c2.y);
    await p.click('#cb-icard [data-ic-close]');
    assert(!(await IB(p)).open, 'Close closes it');
    // committed: the card closes and the badges go quiet (no input) for the whole exchange; the acting creature is marked
    await p.mouse.click(c1.x, c1.y);
    await hookSteps(p);
    await pick(p, 'unravel');
    st = await IB(p);
    assert(!st.open, 'choosing a response closes the card');
    await answerRight(p);
    await p.waitForFunction(() => RB.combat.phase() === 'enemy' && RB.battleIntents.state().badges.some((x) => x.acting), null, { timeout: 15000 });
    st = await IB(p);
    const inert = await p.evaluate(() => document.querySelector('.cb-badges').inert);
    assert(st.quiet && inert && !st.open, 'quiet and inert while the exchange plays: ' + JSON.stringify({ quiet: st.quiet, inert }));
    for (let i = 0; i < 400 && !(await p.evaluate(() => RB.combat.phase() === 'choose' && !RB.battleSeq.busy())); i++) await wait(p, 40);
    st = await IB(p);
    assert(!st.quiet && !st.badges.some((x) => x.acting || x.answered), 'back for the next decision, fresh: ' + JSON.stringify(st.badges));
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  }
});

await test('reading-critical intents: a promise keeps its wording in view under a neutral name; Expanded shows every telegraph; a settled creature takes its badge', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await battle(p, { diff: 'normal', dupes: 1 });
  await p.waitForFunction(() => RB.battleIntents.state().badges.length === 2, null, { timeout: 8000 });
  const blocks = () => p.evaluate(() => [...document.querySelectorAll('.intent .it-block')].map((x) => ({ i: +x.dataset.foe, tag: (x.querySelector('.it-tag') || {}).textContent || '', jp: (x.querySelector('.it-jp') || {}).textContent || '' })));
  // a strike on the other: Adaptive shows the target's telegraph only
  await p.evaluate(() => { const st = RB.combat.state(); st.foes[1].intent = RB.combatLogic.intentDef(RB.content.enemies[st.foes[1].enemyId], 'strike'); RB.combat.target(0); RB.combat.refresh(); });
  let B = await blocks();
  assert(B.length === 1 && B[0].i === 0, 'Adaptive: the target\'s telegraph: ' + JSON.stringify(B));
  // a promise on the other: its words stay on screen, named; nothing says it is false
  await p.evaluate(() => { const st = RB.combat.state(); st.foes[1].intent = RB.combatLogic.intentDef(RB.content.enemies['sb.ghost'], 'lie:1'); RB.combat.refresh(); });
  B = await blocks();
  const other = B.find((x) => x.i === 1);
  assert(B.length === 2 && other && /Also to read/.test(other.tag) && other.jp.length > 4, 'its passage is in view with whose it is: ' + JSON.stringify(B));
  const txt = await p.evaluate(() => document.querySelector('.combat-ui').textContent);
  assert(!/False promise/i.test(txt), 'nothing on screen names it a false promise');
  const S = await IB(p);
  const lb = S.badges.find((x) => x.i === 1);
  assert(/A promise/.test(lb.label), 'its badge names it neutrally: ' + lb.label);
  // Expanded: every creature's telegraph while deciding
  await p.evaluate(() => { const st = RB.combat.state(); st.foes[1].intent = RB.combatLogic.intentDef(RB.content.enemies[st.foes[1].enemyId], 'strike'); RB.game.settings.intentDisplay = 'expanded'; RB.combat.refresh(); });
  B = await blocks();
  assert(B.length === 2 && !B.some((x) => x.tag), 'Expanded: both telegraphs: ' + JSON.stringify(B));
  // a creature that has settled: no badge left above it
  await p.evaluate(() => { const st = RB.combat.state(); st.foes[1].knots = 0; RB.combat.refresh(); });
  const S2 = await IB(p);
  assert(S2.badges.length === 1 && S2.badges[0].i === 0, 'a settled creature has no badge: ' + JSON.stringify(S2.badges));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
  // one creature: one badge, and its telegraph as before
  const one = await page(b, url, { viewport: { width: 390, height: 844 } });
  await battle(one.p, {});
  const S3 = await IB(one.p);
  assert(S3.badges.length === 1 && S3.badges[0].w >= 44 && !/ [A-C]:/.test(S3.badges[0].label), 'one creature: one badge, no mark: ' + JSON.stringify(S3.badges));
  assert(!one.errors.length, one.errors.join('; '));
  await one.ctx.close();
});

// ---- the banner's truth table, continued (§15.4, §23.2) ----------------------------------------
await test('banner: your companion\'s support is its own blue action; a shared technique is one blue action; tokens keep a late hide from clearing a newer title', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await battle(p, { comp: 'mio' });
  await hookSteps(p);
  // tokens: a late hide from an earlier action cannot clear or overwrite the newer one
  const tok = await p.evaluate(() => {
    const B = RB.battleBanner;
    const a = B.show({ id: 'old', side: 'party', actor: { en: 'A' }, label: { en: 'One' } });
    const c = B.show({ id: 'new', side: 'enemy', actor: { en: 'B' }, label: { en: 'Two' } });
    const late = B.hide(a, true);
    const st1 = B.state();
    const mine = B.hide(c, true);
    const st2 = B.state();
    const again = B.hide(c, true);
    return { late, st1: { v: st1.visible, id: st1.id, side: st1.side }, mine, v2: st2.visible, again };
  });
  assert(tok.late === false && tok.st1.v && tok.st1.id === 'new' && tok.st1.side === 'enemy' && tok.mine === true && !tok.v2 && tok.again === false, 'only the token on screen can hide it: ' + JSON.stringify(tok));
  // Harmony full now: the cards on screen were dealt before, so the technique is offered from the next exchange
  await p.evaluate(() => { const st = RB.combat.state(); st.harmony = st.harmonyMax; window.__rec = []; });
  await exchange(p, 'unravel', { support: 'Warm draught' });
  let R = await rec(p);
  const ids = [...new Set(R.filter((x) => x.banner).map((x) => x.banner))];
  const comp = R.filter((x) => x.banner && /:comp:/.test(x.banner));
  assert(comp.length > 5 && comp.every((x) => x.banner.startsWith('party:') && x.phase === 'companion-act' && /Mio/.test(x.text) && /Warm draught/.test(x.text)), 'Mio\'s support: blue, hers, named, during her action only (' + comp.length + ' frames) ' + JSON.stringify(comp[0]));
  assert(ids.filter((x) => /:pc:/.test(x)).length === 1 && ids.filter((x) => /:comp:/.test(x)).length === 1, 'one banner each for your response and hers: ' + JSON.stringify(ids));
  assert(!R.some((x) => x.banner && (x.phase === 'companion' || x.phase === 'challenge')), 'never while her support is being chosen');
  // the technique: Harmony full, one blue banner naming the pair and the technique
  await toCards(p);
  await p.evaluate(() => { window.__rec = []; });
  await p.waitForFunction(() => [...document.querySelectorAll('.rcard[data-i]')].some((x) => /With Mio/.test(x.textContent)), null, { timeout: 4000 });
  await exchange(p, 'With Mio', { support: 'Join' });
  R = await rec(p);
  const tech = [...new Set(R.filter((x) => x.banner && x.banner.startsWith('party:')).map((x) => x.banner))];
  const techText = R.find((x) => x.banner && x.banner.startsWith('party:'));
  assert(tech.length === 1 && /&/.test(techText.text) && /Mio/.test(techText.text), 'the technique is one blue action of you both: ' + JSON.stringify({ tech, text: techText && techText.text }));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('banner: the finishing response leaves before the settling; the creature\'s planned move never shows; a hidden tab clears it; nothing is left after the encounter', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await battle(p, {});
  await hookSteps(p);
  // a hidden tab during a performed action: the banner goes at once and does not come back
  await pick(p, 'unravel');
  await answerRight(p);
  await p.waitForFunction(() => RB.battleBanner.state().visible, null, { timeout: 8000 });
  const hid = await p.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    const s = RB.battleBanner.state();
    return { visible: s.visible, shown: s.shown, text: s.text };
  });
  await p.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
  assert(!hid.visible && !hid.shown && !hid.text, 'hidden: no banner, cleared ' + JSON.stringify(hid));
  await toCards(p);
  const back = await p.evaluate(() => RB.battleBanner.state());
  assert(!back.visible && !back.text, 'and it does not come back on return');
  // the finishing response: the last knot
  await p.evaluate(() => { const st = RB.combat.state(); st.foes[0].knots = 1; st.knots = 1; RB.combat.refresh(); window.__rec = []; });
  await exchange(p, 'unravel');
  const R = await rec(p);
  const fin = R.filter((x) => x.phase === 'finish');
  const lastB = fin.map((x) => !!x.banner).lastIndexOf(true);
  const after = fin.slice(lastB + 1).filter((x) => x.busy);
  assert(lastB >= 0 && after.length >= 5, 'the finishing response\'s banner is gone while the settling still plays (' + after.length + ' frames after it)');
  assert(!R.some((x) => x.banner && x.banner.startsWith('enemy:')), 'the creature\'s planned move never ran: no red banner');
  const end = await p.evaluate(() => ({ r: window.__result, b: RB.battleBanner.state(), el: !!document.querySelector('.cb-banner') }));
  assert(end.r === 'win' && !end.b.visible && !end.el, 'after the encounter: no banner state or element ' + JSON.stringify(end));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---- input ownership and the withdrawn menus (§14.5, §14.6, §16, §23.3) --------------------------
await test('menus: a held Enter that submitted the answer cannot choose in the next menu; focus returns to the last response; a fresh press chooses', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await battle(p, {});
  await hookSteps(p);
  await pick(p, 'unravel');
  await p.waitForSelector('.chal .mc .btn', { timeout: 10000 });
  await p.mouse.move(2, 2);
  const idx = await p.evaluate(() => {
    const st = window.__lastStep, bs = [...document.querySelectorAll('.chal .mc .btn')];
    const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => (o.text != null ? RB.tasks.plain(o.text) : o.en || ''));
    const txt = (el) => { const c = el.cloneNode(true); c.querySelectorAll('rt,.enline').forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, ''); };
    return bs.findIndex((b) => right.some((r) => txt(b) === r.replace(/\s+/g, '') || (b.querySelector('.enline') && right.includes(b.querySelector('.enline').textContent.trim()))));
  });
  await p.locator('.chal .mc .btn').nth(idx).click();
  await p.waitForSelector('.fbwrap .fb-go', { timeout: 10000 });
  await p.focus('.fbwrap .fb-go');
  await p.keyboard.down('Enter'); // submits (Continue), and stays held through the exchange
  await p.waitForFunction(() => RB.combat.phase() === 'choose' && !RB.battleSeq.busy() && document.querySelector('.rcard[data-i]'), null, { timeout: 20000 });
  await wait(p, 100);
  const foc = await p.evaluate(() => { const a = document.activeElement; return a && a.matches('.rcard') ? a.getAttribute('data-cid') : a && (a.className || a.tagName); });
  assert(foc === 'unravel', 'focus is back on the response chosen last time: ' + foc);
  await p.keyboard.down('Enter'); // the held key repeats
  await wait(p, 400);
  let s = await p.evaluate(() => ({ phase: RB.combat.phase(), chal: !!document.querySelector('.chal') }));
  assert(s.phase === 'choose' && !s.chal, 'a repeating held Enter chooses nothing: ' + JSON.stringify(s));
  await p.keyboard.up('Enter');
  await p.keyboard.press('Enter'); // a fresh press
  await p.waitForSelector('.chal', { timeout: 8000 });
  s = await p.evaluate(() => ({ phase: RB.combat.phase() }));
  assert(s.phase === 'challenge', 'a fresh Enter chooses the focused response');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('menus: withdrawn (Adaptive) or disabled (Keep visible) controls cannot be reached by keyboard or pointer while an exchange plays; Resolve and Harmony stay visible throughout', async () => {
  for (const controls of ['adaptive', 'keep']) {
    for (const vp of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
      const { p, errors, ctx } = await page(b, url, { viewport: vp });
      await battle(p, { comp: 'mio', controls });
      await hookSteps(p);
      const cardAt = await p.evaluate(() => { const r = document.querySelector('.rcard[data-i]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + Math.min(20, r.height / 2) }; });
      await p.evaluate(() => { window.__rec = []; });
      await pick(p, 'unravel');
      await answerRight(p);
      await p.waitForSelector('.ccard', { timeout: 8000 });
      await p.mouse.move(2, 2);
      await wait(p, 300);
      const i = await p.evaluate(() => { const c = [...document.querySelectorAll('.ccard[data-a]')].find((x) => !x.disabled && /Warm draught/.test(x.textContent)); return c.getAttribute('data-a'); });
      await p.click('.ccard[data-a="' + i + '"]');
      await p.waitForFunction(() => document.querySelector('.combat-ui').classList.contains('cb-acting') && RB.battleSeq.busy(), null, { timeout: 8000 });
      await wait(p, 260);
      const tag = controls + ' ' + vp.width + ': ';
      const vis = await p.evaluate(() => { const d = document.querySelector('.cb-dock'); const cs = getComputedStyle(d); return { inert: d.inert, vis: cs.visibility, op: +cs.opacity }; });
      if (controls === 'keep') assert(vis.inert && vis.vis === 'visible' && vis.op > 0.3, tag + 'Keep visible: the menus stay readable, inert ' + JSON.stringify(vis));
      else assert(vis.inert && vis.vis === 'hidden', tag + 'Adaptive: the menus are away and inert ' + JSON.stringify(vis));
      // keyboard: Tab never lands in the menus
      for (let k = 0; k < 12 && (await p.evaluate(() => RB.battleSeq.busy())); k++) {
        await p.keyboard.press('Tab');
        const inMenu = await p.evaluate(() => { const a = document.activeElement; return !!(a && a.closest && a.closest('.cb-dock, .intent')); });
        assert(!inMenu, tag + 'Tab reached a withdrawn control');
      }
      // pointer: a press where a response card was does nothing
      const ph0 = await p.evaluate(() => RB.combat.phase());
      if (await p.evaluate(() => RB.battleSeq.busy())) {
        await p.mouse.click(cardAt.x, cardAt.y);
        const s = await p.evaluate(() => ({ chal: !!document.querySelector('.chal'), cards: document.querySelector('.combat-ui').classList.contains('cb-acting') }));
        assert(!s.chal, tag + 'a press on a withdrawn card opened something ' + JSON.stringify({ ph0, s }));
      }
      for (let k = 0; k < 600 && !(await p.evaluate(() => RB.combat.phase() === 'choose' && !RB.battleSeq.busy() && !!document.querySelector('.rcard[data-i]'))); k++) { if (await p.evaluate(() => RB.ui.dialogue.isOpen())) await p.evaluate(() => RB.ui.dialogue.advance(true)); await wait(p, 30); }
      const R = await rec(p);
      const bad = R.filter((x) => !x.dlg && !(x.chal ? x.inset : x.party));
      assert(R.length > 30 && !bad.length, tag + 'Resolve and Harmony visible in every frame (' + bad.length + ' of ' + R.length + ' missing): ' + JSON.stringify(bad.slice(0, 3)));
      assert(!errors.length, errors.join('; '));
      await ctx.close();
    }
  }
});

console.log('\n' + results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
