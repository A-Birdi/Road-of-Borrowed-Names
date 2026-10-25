// A battle card's first press is not lost to the fold of another card (a sweep finding: harmony_cutin's geometry at
// 200 % text, bisected to FR-1's fold; CC-192, CC-193). A card under keyboard focus shows its whole description (FR-1
// F14); a mouse press that moved focus to another card used to fold it while the press was held, so the Respond list's
// height and scroll offset changed under the press and the tap guard (RB.learnUi.guardTaps, unchanged) rejected it as a
// scroll. The list now keeps the unfolding as a class a pointer press does not change. In Chromium on the built game,
// real input, 200 % text unless said:
//  1. the defect: keyboard focus on the first card (unfolded), the list wheeled to its end, one mouse press on the
//     technique card (the last) at 1648×840 and at 1280×720 — while the press is held nothing folds and the list's
//     offset and height stay, and the press chooses the card (its task opens, nothing ignored); and part way down, the
//     focused card out of view above, a middle card's press chooses it;
//  2. the fold itself, as before: keyboard focus moving to the next card unfolds that one and folds the first; Shift+Tab
//     out of the list folds it;
//  3. the guard, unchanged, with the same keyboard focus: a press with a wheel turn, a resize that moves the list, or a
//     script scroll before the release chooses nothing; a 30 px touch drag and a cancelled touch choose nothing; Enter
//     and Space choose;
//  4. 1648×840 at 100 % text (Local CL-328): nothing folds and the first press chooses;
//  5. (Local CL-330) mouse only from the start: no card is whole and the first press chooses; after a 30 px touch drag
//     that chose nothing, the next arrow key leaves exactly one card whole; with two creatures, "]" re-deals the cards
//     with keyboard focus kept, and only the refocused card is whole;
//  6. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/card_fold_press.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const J = JSON.stringify;
const wait = (p, ms) => p.waitForTimeout(ms);
const allErrors = [];

// a battle at the Old Mill with Ren beside you and Harmony full (the technique among the responses), at the text size
async function battle(w, h, o = {}) {
  const pg = await page(b, url, { viewport: { width: w, height: h }, touch: !!o.touch });
  const { p } = pg;
  if (o.mouseFirst) { await wait(p, 300); await p.mouse.click(2, 2); await wait(p, 100); } // (the player's last input a pointer)
  await p.evaluate(([text, foes]) => {
    const s = RB.game.debugStart('rw.mill1', 7, 9, { comp: 'ren', flags: { rw_gears: true } });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
    s.words = ['mizu', 'iyasu', 'mamoru'];
    s.tips = { harmony: 1, harmonyFull: 1, cturn: 1, group: 1 };
    for (const k of ['strike', 'sweep', 'shroud', 'rest', 'heat', 'charge', 'lie', 'mirror', 'plea']) s.tips['intent:' + k] = 1;
    for (const w of s.words) s.tips['word:' + w] = 1;
    Object.assign(RB.game.settings, { input: 'choice', textSpeed: 'instant', battleAnim: 'fast', textScale: text });
    RB.game.applySettings();
    RB.save.autosave = async () => {};
    const L = RB.combatLogic, init = L.init;
    L.init = function (...a) { const st = init.apply(this, a); st.harmony = st.harmonyMax; for (const f of st.foes) f.knots = f.maxKnots = 6; st.pc = 8; return st; };
    const place = RB.content.maps['rw.mill1'].foes.find((f) => f.id === 'm1a');
    RB.game.startBattle(place.enemy, Object.assign({ place, where: { map: 'rw.mill1', x: place.x, y: place.y }, foeKey: 'cfp:' + Math.random() }, foes > 1 ? { group: Array(foes - 1).fill(place.enemy) } : {}));
  }, [o.text || 2, o.foes || 1]);
  for (let i = 0; i < 600; i++) {
    const s = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal') && !RB.battleSeq.busy() && RB.combat.phase() === 'choose' }));
    if (s.cards) break;
    if (s.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await wait(p, 25);
  }
  await wait(p, 400); // (the menu ignores presses in its first 250 ms)
  // what the list did during each press, as the guard sees it (capture listeners before the guard's own)
  await p.evaluate(() => {
    window.__press = [];
    const L = () => document.querySelector('.rcards');
    const first = () => { const m = document.querySelector('.rcard[data-i] .rc-more.folded'); return m ? getComputedStyle(m).display : null; };
    const rec = (k) => (e) => { const l = L(); window.__press.push({ k, top: l ? Math.round(l.scrollTop) : null, h: l ? l.scrollHeight : null, first: first(), t: e.pointerType || null }); };
    for (const k of ['pointerdown', 'pointerup', 'pointercancel']) document.addEventListener(k, rec(k.replace('pointer', '')), true);
  });
  return pg;
}
const state = (p) => p.evaluate(() => {
  const l = document.querySelector('.rcards'), a = document.activeElement, cards = [...document.querySelectorAll('.rcard[data-i]')];
  const lr = l && l.getBoundingClientRect();
  const whole = (c) => { const m = c && c.querySelector('.rc-more.folded'); return m ? getComputedStyle(m).display === 'block' : null; };
  return {
    phase: RB.combat.phase(), chal: !!document.querySelector('.chal'), ignored: RB.combat.debug().pressesIgnored,
    list: l ? { top: Math.round(l.scrollTop), h: l.scrollHeight, view: l.clientHeight, max: l.scrollHeight - l.clientHeight } : null,
    focus: a ? cards.indexOf(a) : -1, fv: !!(a && a.matches(':focus-visible')), inList: !!(l && a && l.closest('.cb-dock') && l.closest('.cb-dock').contains(a)),
    whole: cards.map(whole), firstAbove: cards[0] && lr ? cards[0].getBoundingClientRect().bottom <= lr.top : null, n: cards.length,
  };
});
// a point of card i on screen and hit-testable (no scrolling here: the list stays where the test put it)
const pointOf = (p, i) => p.evaluate((i) => {
  const el = [...document.querySelectorAll('.rcard[data-i]')][i];
  if (!el) return null;
  const r = el.getBoundingClientRect(), x = r.left + r.width / 2;
  for (let y = Math.max(r.top, 0) + 8; y < Math.min(r.bottom, innerHeight) - 4; y += 6) { const t = document.elementFromPoint(x, y); if (t && t.closest('.rcard[data-i]') === el) return { x, y }; }
  return null;
}, i);
async function wheelTo(p, frac) {
  const c = await p.evaluate(() => { const r = document.querySelector('.rcards').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + Math.min(40, r.height / 2) }; });
  await p.mouse.move(c.x, c.y);
  for (let k = 0; k < 40; k++) {
    const s = await state(p);
    const want = Math.round(s.list.max * frac);
    if (Math.abs(s.list.top - want) <= 4 || (frac >= 1 && s.list.top >= s.list.max - 1)) break;
    await p.mouse.wheel(0, Math.max(-200, Math.min(200, want - s.list.top)));
    await wait(p, 120);
  }
  await wait(p, 200);
}
// keyboard focus on the first card, as a player who uses the keyboard leaves it (real key presses)
async function keyFocusFirst(p) {
  await p.keyboard.press('ArrowDown'); await wait(p, 80);
  await p.keyboard.press('ArrowUp'); await wait(p, 80);
  let s = await state(p);
  for (let k = 0; k < 8 && s.focus !== 0; k++) { await p.keyboard.press('ArrowUp'); await wait(p, 60); s = await state(p); }
  return s;
}
const chosen = async (p) => { for (let i = 0; i < 60; i++) { const s = await state(p); if (s.chal || s.phase !== 'choose') return s; await wait(p, 50); } return state(p); };
const presses = (p) => p.evaluate(() => { const r = window.__press.slice(); window.__press.length = 0; return r; });
async function run(name, w, h, o, fn) {
  const pg = await battle(w, h, o);
  try { await fn(pg.p, pg.ctx); } catch (e) { ok(false, name + ': ' + String(e && e.message || e).slice(0, 300)); }
  allErrors.push(...pg.errors);
  await pg.ctx.close();
}

// ---- 1. the defect --------------------------------------------------------------------------------------------------------
for (const [w, h] of [[1648, 840], [1280, 720]]) {
  await run(w + '×' + h, w, h, {}, async (p) => {
    const s0 = await keyFocusFirst(p);
    await wheelTo(p, 1);
    const s1 = await state(p);
    const pt = await pointOf(p, s1.n - 1);
    await presses(p);
    await p.mouse.move(pt.x, pt.y);
    await p.mouse.down();
    await wait(p, 120);
    const held = await state(p);
    await p.mouse.up();
    const s2 = await chosen(p);
    const pr = await presses(p);
    const dn = pr.find((x) => x.k === 'down'), up = pr.find((x) => x.k === 'up');
    ok(s0.focus === 0 && s0.fv && s0.whole[0] === true && s1.list.max > 0 && s1.list.top >= s1.list.max - 1 && pt, w + '×' + h + ': keyboard focus on the first card, its description whole; the list wheeled to its end, the technique card in view (' + J({ focus: s0.focus, fv: s0.fv, whole: s0.whole, list: s1.list, pt }) + ')');
    ok(held.whole[0] === true && dn && up && up.top === dn.top && up.h === dn.h, w + '×' + h + ': while the press is held the first card stays whole and the list does not move (' + J({ whole: held.whole, dn, up }) + ')');
    ok(s2.chal && s2.ignored === 0, w + '×' + h + ': the one press chose the technique: its task opened, nothing ignored (' + J({ phase: s2.phase, chal: s2.chal, ignored: s2.ignored }) + ')');
  });
}
await run('part way', 1648, 840, {}, async (p) => {
  await keyFocusFirst(p);
  await wheelTo(p, 0.55);
  const s1 = await state(p);
  let i = 1, pt = null;
  for (; i < s1.n; i++) { pt = await pointOf(p, i); if (pt) break; }
  await presses(p);
  if (pt) await p.mouse.click(pt.x, pt.y);
  const s2 = await chosen(p);
  const pr = await presses(p);
  ok(s1.focus === 0 && s1.fv && s1.whole[0] === true && s1.firstAbove && s1.list.top < s1.list.max - 40 && pt, 'part way down: the focused, whole first card out of view above, the list not at its end, card ' + i + ' in view (' + J({ focus: s1.focus, whole: s1.whole, above: s1.firstAbove, list: s1.list, pt }) + ')');
  ok(s2.chal && s2.ignored === 0, 'a press on card ' + i + ' chose it (' + J({ phase: s2.phase, chal: s2.chal, press: pr }) + ')');
});

// ---- 2. the fold itself ---------------------------------------------------------------------------------------------------
await run('fold', 1648, 840, {}, async (p) => {
  const s0 = await keyFocusFirst(p);
  await p.keyboard.press('ArrowDown'); await wait(p, 120);
  const s1 = await state(p);
  ok(s0.whole[0] === true && s1.focus === 1 && s1.fv && s1.whole[1] === true && s1.whole[0] === false, 'keyboard focus moving to the next card: that card whole, the first folded again (' + J({ before: s0.whole, focus: s1.focus, after: s1.whole }) + ')');
  await p.keyboard.press('ArrowUp'); await wait(p, 120);
  await p.keyboard.press('Shift+Tab'); await wait(p, 160);
  const s2 = await state(p);
  ok(s2.focus < 0 && s2.whole.every((x) => x !== true), 'Shift+Tab out of the cards: every card folded (' + J({ focus: s2.focus, whole: s2.whole }) + ')');
});

// ---- 3. the guard, unchanged ----------------------------------------------------------------------------------------------
// a press held on a card in view while something moves the list, then released
async function heldPress(p, during) {
  await keyFocusFirst(p);
  await wheelTo(p, 1);
  const s1 = await state(p);
  const pt = await pointOf(p, s1.n - 1);
  await presses(p);
  await p.mouse.move(pt.x, pt.y);
  await p.mouse.down();
  await during();
  await wait(p, 250);
  await p.mouse.up();
  await wait(p, 600);
  const s2 = await state(p);
  const pr = await presses(p);
  return { s1, s2, dn: pr.find((x) => x.k === 'down'), up: pr.find((x) => x.k === 'up') };
}
await run('wheel', 1648, 840, {}, async (p) => {
  const r = await heldPress(p, () => p.mouse.wheel(0, -160));
  ok(r.dn && r.up && Math.abs(r.up.top - r.dn.top) > 2 && !r.s2.chal && r.s2.phase === 'choose', 'a press with a wheel turn before the release chooses nothing (' + J({ dn: r.dn, up: r.up, phase: r.s2.phase }) + ')');
});
await run('resize', 1648, 840, {}, async (p) => {
  const r = await heldPress(p, () => p.setViewportSize({ width: 1648, height: 1000 }));
  ok(r.dn && r.up && Math.abs(r.up.top - r.dn.top) > 2 && !r.s2.chal && r.s2.phase === 'choose', 'a press with a resize that moves the list before the release chooses nothing (' + J({ dn: r.dn, up: r.up, phase: r.s2.phase }) + ')');
});
await run('script scroll', 1648, 840, {}, async (p) => {
  const r = await heldPress(p, () => p.evaluate(() => { document.querySelector('.rcards').scrollTop -= 120; }));
  ok(r.dn && r.up && Math.abs(r.up.top - r.dn.top) > 2 && !r.s2.chal && r.s2.phase === 'choose', 'a press with the list scrolled by script before the release chooses nothing (' + J({ dn: r.dn, up: r.up, phase: r.s2.phase }) + ')');
});
for (const kind of ['drag', 'cancel']) {
  await run('touch ' + kind, 1648, 840, { touch: true }, async (p, ctx) => {
    await wheelTo(p, 0);
    const pt = await pointOf(p, 1);
    const cdp = await ctx.newCDPSession(p);
    const tp = (type, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' || type === 'touchCancel' ? [] : [{ x: pt.x, y }] });
    await presses(p);
    await tp('touchStart', pt.y);
    if (kind === 'drag') { for (let k = 1; k <= 5; k++) { await tp('touchMove', pt.y - k * 6); await wait(p, 16); } await tp('touchEnd'); }
    else { await wait(p, 60); await tp('touchCancel'); }
    await wait(p, 600);
    const s2 = await state(p);
    const pr = await presses(p);
    ok(!s2.chal && s2.phase === 'choose' && (kind === 'drag' || pr.some((x) => x.k === 'cancel')), (kind === 'drag' ? 'a 30 px touch drag over a card' : 'a cancelled touch on a card (pointercancel)') + ' chooses nothing (' + J({ phase: s2.phase, press: pr.map((x) => x.k) }) + ')');
  });
}
for (const key of ['Enter', 'Space']) {
  await run(key, 1648, 840, {}, async (p) => {
    const s0 = await keyFocusFirst(p);
    await p.keyboard.press(key === 'Space' ? ' ' : 'Enter');
    const s2 = await chosen(p);
    ok(s0.focus === 0 && s2.chal, key + ' on the focused card chooses it (' + J({ focus: s0.focus, phase: s2.phase, chal: s2.chal }) + ')');
  });
}

// ---- 4. 100 % text ---------------------------------------------------------------------------------------------------------
await run('100 %', 1648, 840, { text: 1 }, async (p) => {
  const s0 = await keyFocusFirst(p);
  await wheelTo(p, 1);
  const s1 = await state(p);
  const pt = await pointOf(p, s1.n - 1);
  await presses(p);
  if (pt) await p.mouse.click(pt.x, pt.y);
  const s2 = await chosen(p);
  const pr = await presses(p);
  const dn = pr.find((x) => x.k === 'down'), up = pr.find((x) => x.k === 'up');
  ok(s0.focus === 0 && s0.fv && s1.list.top >= s1.list.max - 1 && pt && dn && up && up.top === dn.top && up.h === dn.h && s2.chal && s2.ignored === 0, '1648×840 at 100 %: keyboard focus on the first card, the list at its end, nothing moved during the press, and the one press chose the technique (' + J({ list: s1.list, dn, up, chal: s2.chal }) + ')');
});

// ---- 5. Local CL-330 ------------------------------------------------------------------------------------------------------
await run('mouse only', 1648, 840, { mouseFirst: true }, async (p) => {
  const s0 = await state(p);
  await wheelTo(p, 1);
  const s1 = await state(p);
  const pt = await pointOf(p, s1.n - 1);
  await presses(p);
  if (pt) await p.mouse.click(pt.x, pt.y);
  const s2 = await chosen(p);
  ok(!s0.fv && s0.whole.every((x) => x !== true) && s1.whole.every((x) => x !== true) && pt && s2.chal && s2.ignored === 0, 'mouse only from the start: no card whole, and the first press on the last card chose it (' + J({ focus: s0.focus, fv: s0.fv, whole: s1.whole, list: s1.list, chal: s2.chal }) + ')');
});
await run('touch drag, then a key', 1648, 840, { touch: true }, async (p, ctx) => {
  await keyFocusFirst(p);
  await wheelTo(p, 0);
  const pt = await pointOf(p, 1);
  const cdp = await ctx.newCDPSession(p);
  const tp = (type, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: pt.x, y }] });
  await tp('touchStart', pt.y);
  for (let k = 1; k <= 5; k++) { await tp('touchMove', pt.y - k * 6); await wait(p, 16); }
  await tp('touchEnd');
  await wait(p, 500);
  const s1 = await state(p);
  await p.keyboard.press('ArrowDown'); await wait(p, 150);
  const s2 = await state(p);
  ok(!s1.chal && s1.phase === 'choose' && s2.focus >= 0 && s2.whole.filter((x) => x === true).length === 1 && s2.whole[s2.focus] === true, 'after a touch drag that chose nothing, the next arrow key: exactly one card whole, the focused one (' + J({ after_drag: s1.whole, focus: s2.focus, whole: s2.whole }) + ')');
});
await run('a re-deal', 1648, 840, { foes: 2 }, async (p) => {
  await keyFocusFirst(p);
  await p.keyboard.press('ArrowDown'); await wait(p, 120);
  const s0 = await state(p);
  const old = await p.evaluate(() => { window.__oldCard = document.querySelector('.rcard[data-i]'); return true; });
  await p.keyboard.press(']'); await wait(p, 250);
  const s1 = await state(p);
  const redealt = await p.evaluate(() => !!window.__oldCard && !window.__oldCard.isConnected && !!document.querySelector('.rcard[data-i]')); // (the cards drawn anew)
  ok(old && s0.focus === 1 && s1.focus === s0.focus && s1.fv && s1.whole.filter((x) => x === true).length === 1 && s1.whole[s1.focus] === true && redealt, 'two creatures: "]" re-deals the cards with keyboard focus kept, and only the refocused card is whole (' + J({ before: { focus: s0.focus, whole: s0.whole }, after: { focus: s1.focus, fv: s1.fv, whole: s1.whole } }) + ')');
});

ok(!allErrors.length, 'no page errors (' + J(allErrors).slice(0, 300) + ')');
await b.close(); srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
