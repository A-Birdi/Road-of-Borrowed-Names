// Practice suite B (Practice addendum §17–§19, §20, §23.6) against the built index.html in
// Chromium, with real mouse, keyboard and touch input, in synthetic campaigns only:
// - a letter end to end from the post box in Shino's Post House: the world prop, its
//   scene and choice, the tray, a reply of another intention explained, a reply built
//   from pieces, the villager's closing, the Words folder; a typed (IME) reply with an
//   unsupported text first (a coverage note, never a mistake) and Enter held back while
//   composing; a practice copy answered by handwriting (real mouse strokes), not resent;
// - the Proofreader's Tray: a fine portion explained, the wrong one found by keyboard,
//   repaired by handwriting, the consequence shown, a page kept; P12 concluded as
//   insufficient evidence and answered with a question; letters not offered before the
//   journey's end;
// - One word, two moments: empty and honest at first (nothing of a locked pair shown),
//   then unlocked by actually hearing its two lines from Oto and Shino, compared,
//   bookmarked;
// - all four learning profiles (choice, pieces, typing), from Words › Ways to practise;
// - 320×640, 390×844, 844×390 (touch) and 1280×800, and 200 % text: nothing wider than
//   the screen, no control under 44 px, every kanji with its reading.
// Captures: tests/e2e/out/practice_b/ (and docs/screenshots/practice_b/ with --docs).
// Usage: node tests/e2e/practice_b.mjs [filter] [--docs]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const args = process.argv.slice(2);
const only = args.find((a) => !a.startsWith('--'));
const DOCS = args.includes('--docs');
const OUT = path.join(root, 'tests', 'e2e', 'out', 'practice_b');
const DOCDIR = path.join(root, 'docs', 'screenshots', 'practice_b');
fs.mkdirSync(OUT, { recursive: true });
if (DOCS) fs.mkdirSync(DOCDIR, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const results = [];
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 300s')), 300000))]); pass++; results.push('PASS ' + name); console.log('PASS ' + name); }
  catch (e) { fail++; results.push('FAIL ' + name + '\n   ' + String(e && e.stack || e).slice(0, 1200)); console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1200)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const wait = (p, ms) => p.waitForTimeout(ms);
const DESK = { viewport: { width: 1280, height: 800 } };
const PHONE = (w, h) => ({ viewport: { width: w, height: h }, touch: true, mobile: true, dpr: 2 });
async function shot(p, name, doc) {
  const f = path.join(OUT, name + '.png');
  // rest the pointer off the sheet first, so a hover word-help card does not hide the page
  // (and let a place-name card from walking in fade, so it does not sit over the sheet)
  if (doc) { await p.mouse.move(2, 2); await wait(p, 400); await p.waitForFunction(() => !document.querySelector('#overlay .place'), null, { timeout: 5000 }).catch(() => {}); }
  await p.screenshot({ path: f });
  if (DOCS && doc) fs.copyFileSync(f, path.join(DOCDIR, name + '.png'));
}
const MET = ['rw.hana_first', 'co.ume_first', 'co.goro_first', 'sb.sousuke', 'sg.tamae_first', 'lf.akari', 'sg.shiori_early', 'sb.hoshino', 'lf.tokuji_story', 'co.isao_first', 'rw.tsuru_first', 'sg.genzo_wind'];

// a synthetic campaign: postgame (or not), the correspondents met, a profile and an input preference
async function start(p, o) {
  o = o || {};
  await p.evaluate((o) => {
    const flags = Object.assign({}, o.flags || { postgame: true, ch2_done: true });
    const s = RB.game.debugStart(o.map || 'co.post', o.x != null ? o.x : 6, o.y != null ? o.y : 5, { comp: o.comp || 'nao', dir: o.dir || 'right', flags });
    s.player.name = 'Aki'; s.player.nameJp = 'アキ';
    s.learn.profile = o.profile || 'E'; s.learn.kanaKnown = 'both';
    if (o.met !== false) for (const k of o.metList) s.seen[k] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.input = o.input || 'hand';
    RB.game.settings.padKanji = 'off';
    if (o.bulb === false) { RB.game.settings.lightbulb = false; document.body.classList.remove('bulb-on'); }
    RB.game.settings.textScale = o.text || 1;
    RB.game.applySettings();
    window.__errs = [];
    // the story milestones the synthetic flags imply (e.g. 'ch2') are awarded first, so any
    // later bond event could only come from the activities under test
    RB.company.sync(s, 'live');
    window.__bond0 = JSON.stringify(s.company.bond);
    window.__bonds = 0;
    if (!window.__bondHooked) { window.__bondHooked = true; RB.bus.on('company:bond', () => window.__bonds++); }
  }, Object.assign({ metList: MET }, o));
  await wait(p, 350);
}
// a real press on the first visible, uncovered point of an element
async function press(p, sel, touch) {
  let pt = null;
  for (let k = 0; k < 20 && (!pt || pt.miss); k++) {
    if (k) await wait(p, 100);
    pt = await p.evaluate((q) => {
      const els = [...document.querySelectorAll(q)].filter((e) => e.getClientRects().length && !e.closest('.pb-hidden'));
      const el = els[0];
      if (!el) return { miss: 'absent' };
      el.scrollIntoView({ block: 'nearest' });
      const r = el.getBoundingClientRect();
      // as near the middle of the visible part as possible, as a person aims
      const top0 = Math.max(r.top, 0) + Math.min(6, r.height / 2), bot0 = Math.min(r.bottom, innerHeight) - 1, mid = (top0 + bot0) / 2;
      const ys = [];
      for (let d = 0; mid - d >= top0 || mid + d <= bot0; d += 6) { if (mid - d >= top0) ys.push(mid - d); if (d && mid + d <= bot0) ys.push(mid + d); }
      for (const x of [r.left + r.width / 2, r.left + Math.min(r.width / 2, 30), r.right - Math.min(r.width / 2, 30)]) {
        for (const y of ys) { const top = document.elementFromPoint(x, y); if (top && (top === el || el.contains(top))) return { x, y }; }
      }
      const at = document.elementFromPoint(r.left + r.width / 2, Math.max(2, Math.min(innerHeight - 2, r.top + 8)));
      return { miss: 'covered', hover: !!(at && at.closest('.help')), at: at && at.outerHTML.slice(0, 120) };
    }, sel);
    // a word-help card opened by hovering a word (the pointer still rests on it) covers the
    // target: move the pointer off, as a person reaching for the button would; it closes itself
    if (pt.hover && !touch) { await p.mouse.move(2, 2); await wait(p, 400); }
  }
  assert(pt && !pt.miss, sel + ' cannot be pressed: ' + JSON.stringify(pt));
  if (touch) await p.touchscreen.tap(pt.x, pt.y); else await p.mouse.click(pt.x, pt.y);
  await wait(p, 60);
}
// press the element whose text (spaces removed, readings removed) is `text`
async function pressText(p, sel, text, touch) {
  const id = await p.evaluate(([sel, text]) => {
    // the whole text (readings removed), or the Japanese alone (its English line removed too)
    const plain = (e, q) => { const c = e.cloneNode(true); c.querySelectorAll(q).forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, ''); };
    const el = [...document.querySelectorAll(sel)].find((e) => e.getClientRects().length && !e.disabled && (plain(e, 'rt, .sr') === text || plain(e, 'rt, .sr, .en, .enline') === text));
    if (!el) return null;
    const k = 'pk' + Math.random().toString(36).slice(2, 7);
    el.setAttribute('data-pk', k);
    return k;
  }, [sel, text]);
  assert(id, 'no "' + text + '" among ' + sel + ': ' + JSON.stringify(await p.evaluate((sel) => [...document.querySelectorAll(sel)].map((e) => e.textContent.replace(/\s+/g, '')), sel)));
  await press(p, '[data-pk="' + id + '"]', touch);
}
const fbText = (p, scope) => p.evaluate((s) => { const e = document.querySelector(s + ' .fbwrap'); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, scope);
// advance the dialogue to its choices and pick one by its English
async function chooseInDialogue(p, en) {
  for (let i = 0; i < 40; i++) {
    const has = await p.evaluate(() => !!document.querySelector('.choices .choice'));
    if (has) break;
    await press(p, '.dlg .b-next');
    await wait(p, 120);
  }
  const k = await p.evaluate((en) => { const b = [...document.querySelectorAll('.choices .choice')].find((x) => x.textContent.includes(en)); if (!b) return null; b.setAttribute('data-pk', 'dlgc'); return 'dlgc'; }, en);
  assert(k, 'no reply "' + en + '" among ' + JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.choices .choice')].map((x) => x.textContent))));
  await press(p, '[data-pk="dlgc"]');
}
async function finishDialogue(p) {
  for (let i = 0; i < 60; i++) {
    const st = await p.evaluate(() => ({ open: RB.ui.dialogue.isOpen(), run: RB.script.isRunning() }));
    if (!st.open && !st.run) return;
    if (st.open) await press(p, '.dlg .b-next'); else await wait(p, 100);
    await wait(p, 100);
  }
  throw new Error('the dialogue did not finish');
}
// write characters on the pad with the real mouse, from the reference strokes; pick the
// intended reading among the candidates when the top one differs ("not what I wrote")
async function writeChars(p, text) {
  for (const ch of Array.from(text)) {
    const strokes = await p.evaluate((ch) => { const r = RB.recog.reference(ch); return r.strokes.map((st) => st.map((pt) => [pt.x / r.box, pt.y / r.box])); }, ch);
    const box = await p.locator('.chal .pad-ink').boundingBox();
    for (const st of strokes) {
      const pt = (q) => [box.x + box.width * (0.12 + q[0] * 0.76), box.y + box.height * (0.12 + q[1] * 0.76)];
      await p.mouse.move(...pt(st[0]));
      await p.mouse.down();
      for (const q of st.slice(1)) await p.mouse.move(...pt(q), { steps: 2 });
      await p.mouse.up();
      await wait(p, 40);
    }
    await wait(p, 250);
    const read = await p.evaluate(() => { const r = RB.pad.__last._state.result; return r && r.candidates && r.candidates.length ? r.candidates[0].ch : null; });
    if (read !== ch) {
      const picked = await p.evaluate((ch) => { const c = [...document.querySelectorAll('.chal .cands .cand')].find((x) => x.textContent.includes(ch)); if (c) { c.click(); return true; } return false; }, ch);
      assert(picked, 'the pad read ' + read + ' for ' + ch + ' and offered no ' + ch);
    }
    await press(p, '.chal [data-a=confirm]');
    await wait(p, 120);
  }
}
// every kanji in the scope's visible text sits in a <ruby> with its reading
async function bareKanji(p, scope) {
  return p.evaluate((scope) => {
    const out = [];
    for (const rootEl of document.querySelectorAll(scope)) {
      const w = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) {
        if (!/[一-鿿々]/.test(n.nodeValue)) continue;
        const el = n.parentElement;
        if (!el || !el.getClientRects().length || el.closest('.sr, rt, input, textarea, [hidden], .pb-hidden')) continue;
        if (!el.closest('ruby')) out.push(n.nodeValue.trim().slice(0, 30));
      }
    }
    return out.slice(0, 10);
  }, scope);
}
// no control under 44 px, nothing wider than the screen, no sideways-scrolling page
async function audit(p, scope) {
  return p.evaluate((scope) => {
    const W = innerWidth;
    const vis = (e) => e.getClientRects().length && !e.closest('.sr, .pb-hidden') && getComputedStyle(e).visibility !== 'hidden';
    const roots = [...document.querySelectorAll(scope)].filter(vis);
    const small = [], wide = [];
    for (const r of roots) {
      for (const e of r.querySelectorAll('button, input, summary, textarea, [role=button]')) {
        if (!vis(e) || e.closest('.tabrail')) continue;
        const rc = e.getBoundingClientRect();
        if (rc.height < 43.5 || rc.width < 43.5) small.push((e.className || e.tagName) + ':' + e.textContent.replace(/\s+/g, ' ').trim().slice(0, 24) + ' ' + Math.round(rc.width) + 'x' + Math.round(rc.height));
      }
      for (const e of r.querySelectorAll('*')) {
        if (!vis(e) || e.closest('.tabrail') || e.matches('rt, rt *')) continue;
        const rc = e.getBoundingClientRect();
        if (rc.width && (rc.right > W + 1 || rc.left < -1)) wide.push((e.className && e.className.baseVal == null ? e.className : e.tagName) + ' ' + Math.round(rc.left) + '..' + Math.round(rc.right));
      }
    }
    const page = document.documentElement.scrollWidth > W + 1;
    const leaves = [...document.querySelectorAll('.folio .leaf, .chal-body')].filter((l) => vis(l) && l.scrollWidth > l.clientWidth + 1).map((l) => l.className + ' ' + l.scrollWidth + '>' + l.clientWidth);
    return { small: small.slice(0, 8), wide: wide.slice(0, 8), page, leaves };
  }, scope);
}
const clean = (a) => !a.small.length && !a.wide.length && !a.page && !a.leaves.length;
const launchAct = (p, kind, ctx) => p.evaluate(([k, c]) => { window.__act = null; RB.activity.launch(k, c).then((r) => (window.__act = r)); }, [kind, ctx || { source: 'world-prop' }]);
async function noBond(p, what) {
  const bond = await p.evaluate(() => ({ n: window.__bonds, same: JSON.stringify(RB.game.s.company.bond) === window.__bond0, bond: RB.game.s.company.bond }));
  assert(bond.n === 0 && bond.same, 'no bond from ' + what + ': ' + JSON.stringify(bond));
}
const rec = (p, k) => p.evaluate((k) => JSON.parse(JSON.stringify(RB.game.s.practice[k])), k);

// =====================================================================================================
await test('a letter end to end at the post box: pieces, another intention explained, the closing; IME with an unsupported reply; a practice copy by handwriting', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await start(p, { input: 'ime' });
  const front = await p.evaluate(() => ({ t: RB.world.frontTile(), a: RB.world.frontAction() }));
  assert(front.t[0] === 7 && front.t[1] === 5 && front.a && front.a.kind === 'prop', 'facing the post box: ' + JSON.stringify(front));
  await p.keyboard.press('Enter');
  await p.waitForFunction(() => RB.ui.dialogue.isOpen(), null, { timeout: 5000 });
  await chooseInDialogue(p, 'Answer the villagers');
  await p.waitForSelector('.pb-tray .pb-card', { timeout: 8000 });
  assert(await p.evaluate(() => RB.activity.active() && RB.activity.active().kind === 'letters' && RB.activity.active().ctx.source === 'world-prop' && RB.game.mode() === 'activity'), 'the letters run as one activity session from the world prop');
  assert((await p.$$('.pb-tray .pb-card')).length === 12, 'twelve letters on the tray');
  assert(!(await bareKanji(p, '.pb-tray')).length, 'kanji without readings on the tray: ' + (await bareKanji(p, '.pb-tray')));
  await shot(p, 'letters_tray_1280', true);
  await press(p, '[data-pb-letter="L01"]');
  await p.waitForSelector('.pb-letter .pb-pieces');
  assert(await p.evaluate(() => /can read \d+ replies/.test(document.querySelector('.pb-scope').textContent)), 'the scope is shown before entry');
  assert(!(await bareKanji(p, '.pb-letter')).length, 'kanji without readings on the letter: ' + (await bareKanji(p, '.pb-letter')));
  // another intention first: "the parcel didn't arrive"
  await pressText(p, '.pb-pieces .tile', '小包が');
  await pressText(p, '.pb-pieces .tile', '届きませんでした。');
  await press(p, '[data-pb-send]');
  const f1 = await fbText(p, '.pb-letter');
  assert(/says something else/.test(f1) && /lost/.test(f1), 'a reply of another intention says what it would say: ' + f1);
  await press(p, '[data-pb-clear]');
  await pressText(p, '.pb-pieces .tile', '届きました。');
  await shot(p, 'letters_built_1280', true);
  await press(p, '[data-pb-send]');
  await p.waitForSelector('.pb-close .pb-ack');
  const close1 = await p.evaluate(() => document.querySelector('.pb-close').textContent.replace(/\s+/g, ' '));
  assert(/安心/.test(close1) && /polite reply/.test(close1) && /exactly the same way/.test(close1), 'the closing: her acknowledgement and the tone note: ' + close1.slice(0, 200));
  assert(!(await bareKanji(p, '.pb-close')).length, 'kanji without readings in the closing');
  await shot(p, 'letters_closing_1280', true);
  let L = await rec(p, 'letters');
  assert(L.done.L01 && L.done.L01.st === 'sent' && L.done.L01.via === 'parts' && L.done.L01.tone === 'polite', 'L01 sent: ' + JSON.stringify(L.done.L01));
  const m1 = await p.evaluate(() => RB.game.s.learn.items['g:v_masu_forms']);
  assert(m1 && m1.seen === 1 && m1.ok === 0, 'one mastery event, honest about the first try: ' + JSON.stringify(m1));
  await press(p, '.pb-close [data-pb-ok]');
  // L02 by typing: an unsupported reply first, then Enter while composing, then a valid one
  await press(p, '[data-pb-letter="L02"]');
  await press(p, '[data-pb-write]');
  await p.waitForSelector('.chal #ime-in');
  await p.fill('.chal #ime-in', 'わかりました');
  await p.keyboard.press('Enter');
  await p.waitForSelector('.chal .fbwrap[data-fb=unsure]');
  const lim = await fbText(p, '.chal');
  assert(/Outside what this letter can read/.test(lim) && /not marked wrong/.test(lim), 'an unsupported reply gets the coverage note: ' + lim.slice(0, 160));
  await shot(p, 'letters_limit_1280', true);
  await p.fill('.chal #ime-in', 'はい、手伝いに行きます。');
  await p.evaluate(() => document.querySelector('#ime-in').dispatchEvent(new CompositionEvent('compositionstart')));
  await p.keyboard.press('Enter');
  await wait(p, 150);
  assert(await p.evaluate(() => document.querySelector('.chal .fbwrap').getAttribute('data-fb') === 'unsure'), 'Enter while composing submits nothing');
  await p.evaluate(() => document.querySelector('#ime-in').dispatchEvent(new CompositionEvent('compositionend')));
  await wait(p, 50);
  await p.keyboard.press('Enter');
  await p.waitForSelector('.chal .fbwrap[data-fb=ok]');
  await press(p, '.chal .fb-go');
  await p.waitForSelector('.pb-close');
  L = await rec(p, 'letters');
  assert(L.done.L02.via === 'ime' && L.done.L02.tone === 'polite', 'L02 typed: ' + JSON.stringify(L.done.L02));
  const m2 = await p.evaluate(() => RB.game.s.learn.items['g:v_mashou']);
  assert(m2 && m2.seen === 1 && m2.ok === 1 && m2.modes.recall === 1, 'a coverage note is not a mistake; typed recall recorded once: ' + JSON.stringify(m2));
  await press(p, '.pb-close [data-pb-ok]');
  // a practice copy of L01, by handwriting
  await press(p, '[data-pb-letter="L01"]');
  assert(await p.evaluate(() => /Practice copy — not sent/.test(document.querySelector('.pb-replay').textContent)), 'an answered letter opens as a practice copy');
  await press(p, '[data-pb-write]');
  await p.waitForSelector('.chal [data-mode=hand]');
  await press(p, '.chal .ptab[data-mode=hand]');
  await p.waitForSelector('.chal .pad-ink');
  await writeChars(p, 'とどいたよ');
  await shot(p, 'letters_hand_1280', true);
  await press(p, '.chal [data-a=submit]');
  await p.waitForSelector('.chal .fbwrap[data-fb=ok]', { timeout: 8000 });
  await press(p, '.chal .fb-go');
  await p.waitForSelector('.pb-close');
  const close2 = await p.evaluate(() => document.querySelector('.pb-close').textContent.replace(/\s+/g, ' '));
  assert(/not sent/.test(close2) && !/安心/.test(close2), 'a practice copy is not delivered again: ' + close2.slice(0, 160));
  L = await rec(p, 'letters');
  assert(L.done.L01.st === 'sent' && L.done.L01.via === 'parts' && L.done.L01.replays === 1 && L.done.L01.last.via === 'hand' && L.done.L01.last.tone === 'friendly', 'the first reply is kept; the copy is counted: ' + JSON.stringify(L.done.L01));
  const m3 = await p.evaluate(() => RB.game.s.learn.items['g:v_masu_forms']);
  assert(m3.seen === 1, 'no second mastery event for the same letter: ' + JSON.stringify(m3));
  await press(p, '.pb-close [data-pb-ok]');
  await press(p, '.pb-tray [data-pb-x]');
  await p.waitForFunction(() => !RB.activity.active() && RB.game.mode() === 'world', null, { timeout: 3000 });
  // the folder in Words
  await p.evaluate(() => RB.ui.menu.open('letters'));
  await p.waitForSelector('.pb-folder');
  const folder = await p.evaluate(() => document.querySelector('.pb-folder').textContent.replace(/\s+/g, ' '));
  assert(/2 of 12 answered|answered/.test(await p.evaluate(() => document.querySelector('#folio-page').textContent)) && /practised again 1×/.test(folder), 'the folder lists the answered letters: ' + folder.slice(0, 200));
  assert(!(await bareKanji(p, '#folio-page')).length, 'kanji without readings in the folder: ' + (await bareKanji(p, '#folio-page')));
  await shot(p, 'letters_folder_1280', true);
  await noBond(p, 'letters');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// =====================================================================================================
await test('the Proofreader\'s Tray: a fine portion explained, the wrong one found by keyboard, repaired by handwriting; P12 asks; a page kept', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await start(p, { flags: { ch2_done: true }, input: 'hand' });
  await p.keyboard.press('Space');
  await p.waitForFunction(() => RB.ui.dialogue.isOpen(), null, { timeout: 5000 });
  for (let i = 0; i < 10 && !(await p.$('.choices .choice')); i++) { await press(p, '.dlg .b-next'); await wait(p, 120); }
  const opts = await p.evaluate(() => [...document.querySelectorAll('.choices .choice')].map((b) => b.textContent));
  assert(opts.length === 2 && !opts.some((x) => /letters/.test(x)) && opts.some((x) => /proofreader/.test(x)), 'before the journey\'s end only the tray is offered: ' + JSON.stringify(opts));
  await chooseInDialogue(p, 'proofreader');
  await p.waitForSelector('.pb-tray [data-pb-task="P01"]', { timeout: 8000 });
  await press(p, '[data-pb-task="P01"]');
  await p.waitForSelector('.pb-proof .pb-notice.pick');
  assert(!(await bareKanji(p, '.pb-proof')).length, 'kanji without readings on the sheet: ' + (await bareKanji(p, '.pb-proof')));
  assert(await p.evaluate(() => document.querySelectorAll('.pb-proof .pb-evidence .pb-cell').length === 2 && /closed/.test(document.querySelector('.pb-proof .pb-evidence').textContent)), 'the plan is on the same sheet, with its states in words');
  await shot(p, 'proof_sheet_1280', true);
  await press(p, '[data-pb-seg="0"]');
  await press(p, '[data-pb-mark]');
  const f0 = await fbText(p, '.pb-proof');
  assert(/agrees with the evidence/.test(f0), 'a portion that agrees with the evidence is explained: ' + f0);
  // keyboard: focus the wrong portion, select it, move to the button, confirm
  await p.focus('[data-pb-seg="1"]');
  await p.keyboard.press('Enter');
  await wait(p, 80);
  assert(await p.evaluate(() => document.querySelector('[data-pb-seg="1"]').getAttribute('aria-pressed') === 'true'), 'the keyboard selects a portion');
  await p.focus('[data-pb-mark]');
  await p.keyboard.press('Enter');
  await p.waitForSelector('.chal .pad-ink', { timeout: 6000 });
  assert(await p.evaluate(() => !!document.querySelector('.chal .chal-situ .pb-ev .pb-cell')), 'the evidence stays in view during the repair');
  await writeChars(p, 'みぎ');
  await shot(p, 'proof_repair_hand_1280', true);
  await press(p, '.chal [data-a=submit]');
  await p.waitForSelector('.chal .fbwrap[data-fb=ok]', { timeout: 8000 });
  await press(p, '.chal .fb-go');
  await p.waitForSelector('.pb-result .pb-consequence');
  const res = await p.evaluate(() => ({ fixed: document.querySelector('.pb-result mark.pb-fixed').textContent, cons: document.querySelector('.pb-consequence').textContent }));
  assert(/右/.test(res.fixed) && /open door/.test(res.cons), 'the repair is marked and its consequence shown: ' + JSON.stringify(res));
  await shot(p, 'proof_result_1280', true);
  await press(p, '[data-pb-keep]');
  await p.waitForSelector('#pb-lab');
  await p.fill('#pb-lab', 'North door <b>');
  await press(p, '[data-pb-keepok]');
  await p.waitForFunction(() => document.querySelector('.pb-result .fbwrap[data-fb=ok]'), null, { timeout: 4000 });
  let pages = await p.evaluate(() => RB.game.s.practice.deskPages);
  // this synthetic campaign has no save slot: the page is kept in the journey and honestly marked
  // not saved (RB.practiceDesk.keepPage marks a page saved only after a slot write succeeds)
  assert(pages.length === 1 && pages[0].kind === 'proof' && pages[0].mode === 'proof' && pages[0].label === 'North door <b>' && pages[0].saved === false && pages[0].bytes > 0 && pages[0].typeset.lines.length, 'the page is kept, typeset, with its label as plain text: ' + JSON.stringify(pages));
  assert(await p.evaluate(() => /no save slot/.test((document.querySelector('.pb-result .pb-unsaved') || {}).textContent || '')), 'the tray says it is kept but not saved (no slot)');
  await press(p, '.pb-result [data-pb-ok]');
  // P12: nothing can be settled; ask
  await press(p, '[data-pb-task="P12"]');
  await p.waitForSelector('.pb-proof [data-pb-unsettled]');
  await press(p, '.pb-proof .pb-seg[data-pb-seg="1"]');
  await press(p, '[data-pb-mark]');
  assert(/would be a guess/.test(await fbText(p, '.pb-proof')), 'changing an unsupported detail would be a guess');
  await shot(p, 'proof_p12_sheet_1280', true);
  await press(p, '[data-pb-unsettled]');
  await p.waitForSelector('.chal [data-mode=choice]', { timeout: 6000 });
  await press(p, '.chal .ptab[data-mode=choice]');
  await p.waitForSelector('.chal .mc .btn');
  // a guess presented as settled is explained, then a real question
  await pressText(p, '.chal .mc .btn', 'じゅっぽんでいいですね。');
  assert(/agree/.test(await fbText(p, '.chal')), 'the leading question is explained');
  await pressText(p, '.chal .mc .btn', '「いつものぶん」はなんぼんですか。');
  await p.waitForSelector('.chal .fbwrap[data-fb=ok]');
  await press(p, '.chal .fb-go');
  await p.waitForSelector('.pb-result .pb-asked');
  assert(/Unchanged/.test(await p.evaluate(() => document.querySelector('.pb-repaired').textContent)), 'the notice is left unchanged and the question goes back');
  await shot(p, 'proof_p12_result_1280', true);
  await press(p, '.pb-result [data-pb-ok]');
  await press(p, '.pb-tray [data-pb-x]');
  const pr = await rec(p, 'proof');
  assert(pr.done.P01 && pr.done.P12 && pr.assessed['proof:P01'] && pr.assessed['proof:P12'], 'both tasks checked and assessed once: ' + JSON.stringify(pr));
  // the kept page in Journey › Practice mementos (when the mementos page exists) and its source
  const mem = await p.evaluate(() => RB.practice.mementos(RB.game.s).filter((m) => m.source === 'proof').map((m) => m.title.en + '|' + m.html()));
  assert(mem.length === 1 && /North door/.test(mem[0]) && /<ruby>/.test(mem[0]), 'a memento source lists the kept page: ' + mem);
  await noBond(p, 'proofreading');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// =====================================================================================================
await test('One word, two moments: honest when empty; unlocked by hearing Oto and Shino; compared and bookmarked', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await start(p, { map: 'rw.house1', x: 3, y: 5, dir: 'up', input: 'choice' });
  await p.evaluate(() => RB.ui.menu.open('compare'));
  await p.waitForSelector('.pb-empty');
  const empty = await p.evaluate(() => {
    const t = document.querySelector('#folio-page').textContent;
    const leak = RB.content.practiceB.compare.filter((d) => !d.sample).some((d) => [d.a, d.b].some((x) => t.includes(x.en.slice(0, 20))));
    return { t: t.replace(/\s+/g, ' '), leak };
  });
  assert(/No comparisons yet/.test(empty.t) && /12 comparisons are waiting/.test(empty.t) && !empty.leak, 'an honest empty page, nothing of a locked pair: ' + empty.t.slice(0, 200));
  assert(await p.$('[data-cmp-sample]'), 'a labelled sample pair is offered');
  await shot(p, 'compare_empty_1280', true);
  await p.evaluate(() => RB.ui.menu.close());
  await wait(p, 300);
  // hear Oto (rw.house1)
  await p.keyboard.press('Enter');
  await p.waitForFunction(() => RB.ui.dialogue.isOpen(), null, { timeout: 5000 });
  await finishDialogue(p);
  // walk in on Shino at the post house
  await p.evaluate(() => RB.game.transition('co.post', 4, 5, 'up'));
  await p.waitForFunction(() => RB.game.mode() === 'world' && RB.world.W.map.id === 'co.post', null, { timeout: 8000 });
  await wait(p, 400);
  await p.keyboard.press('Enter');
  await p.waitForFunction(() => RB.ui.dialogue.isOpen(), null, { timeout: 5000 });
  await finishDialogue(p);
  const seen = await p.evaluate(() => ({ un: RB.compare.unlocked(RB.game.s).map((d) => d.id), keys: Object.keys(RB.game.s.practice.compare.seen) }));
  assert(seen.un.length === 1 && seen.un[0] === 'C11' && seen.keys.length === 2, 'hearing both lines unlocks exactly their pair: ' + JSON.stringify(seen));
  await p.evaluate(() => RB.ui.menu.open('compare'));
  await p.waitForSelector('[data-cmp="C11"]');
  await shot(p, 'compare_list_1280', true);
  await press(p, '[data-cmp="C11"]');
  await p.waitForSelector('.chal .pb-hdr.pair');
  assert(!(await bareKanji(p, '.chal')).length, 'kanji without readings in the pair: ' + (await bareKanji(p, '.chal')));
  assert(await p.evaluate(() => /Oto/.test(document.querySelector('.pb-quote[data-side=A]').textContent) && /Shino/.test(document.querySelector('.pb-quote[data-side=B]').textContent)), 'both quotations, attributed to who said them');
  await shot(p, 'compare_question_1280', true);
  // a wrong answer first, then the right one
  await pressText(p, '.chal .mc .btn', 'Differentmeanings');
  await pressText(p, '.chal .mc .btn', 'Thesamemeaning;plainandpolite');
  await p.waitForSelector('.chal .fbwrap[data-fb=ok]');
  await press(p, '.chal .fb-go');
  await p.waitForSelector('.pb-explain-sheet .pb-explain');
  await press(p, '.pb-explain-sheet [data-pb-mark]');
  assert(await p.evaluate(() => document.querySelector('[data-pb-mark]').getAttribute('aria-pressed') === 'true'), 'bookmarked');
  await press(p, '.pb-explain-sheet [data-pb-ref]');
  await p.waitForSelector('.pb-ref');
  assert(/Polite and plain/.test(await p.evaluate(() => document.querySelector('.pb-ref').textContent)), 'the link opens the grammar point');
  await press(p, '.pb-ref [data-pb-ok]');
  await shot(p, 'compare_explain_1280', true);
  await press(p, '.pb-explain-sheet [data-pb-next]');
  await p.waitForFunction(() => !RB.activity.active(), null, { timeout: 3000 });
  await p.waitForSelector('#folio-page .pb-marks', { timeout: 4000 });
  const c = await rec(p, 'compare');
  const item = await p.evaluate(() => RB.game.s.learn.items['g:register_polite_plain']);
  assert(c.done.C11 && c.marks.C11 && c.marks.C11.quotes.length === 2 && item && item.seen === 1 && item.ok === 0, 'compared once (first try missed), bookmarked with frozen quotations: ' + JSON.stringify({ c, item }));
  await shot(p, 'compare_marked_1280', true);
  await noBond(p, 'comparisons');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// =====================================================================================================
await test('four profiles: a letter, a repair and the sample comparison in F, E, I and A, begun from Words › Ways to practise', async () => {
  for (const prof of ['F', 'E', 'I', 'A']) {
    const { p, errors, ctx } = await page(b, url, DESK);
    await start(p, { profile: prof, input: 'choice' });
    await p.evaluate(() => RB.ui.menu.open('practice'));
    await p.waitForSelector('[data-pr-begin="letters"]');
    await press(p, '[data-pr-begin="letters"]');
    await p.waitForSelector('.pb-tray .pb-card');
    await press(p, '[data-pb-letter="L03"]');
    await p.waitForSelector('.pb-letter');
    if (prof === 'F') {
      assert(await p.evaluate(() => !!document.querySelector('.pb-letter .letter .act-en')), 'Foundations shows the translation');
      await press(p, '[data-pb-choose]');
      await p.waitForSelector('.chal .mc .btn');
      const ok = await p.evaluate(() => { const L = RB.content.practiceB.letters[2].tiers.F; const f = L.replies.find((x) => x.ok); return RB.ui.plainJp(RB.practiceB.replyOf(f)).replace(/\s/g, ''); });
      await pressText(p, '.chal .mc .btn', ok + await p.evaluate(() => RB.content.practiceB.letters[2].tiers.F.replies.find((x) => x.ok).en.replace(/\s+/g, '')));
      await p.waitForSelector('.chal .fbwrap[data-fb=ok]');
      await press(p, '.chal .fb-go');
    } else {
      const parts = await p.evaluate((lv) => RB.content.practiceB.letters[2].tiers[lv].replies.find((x) => x.ok).parts.filter((q) => q[0] !== '?').map((q) => RB.ui.plainJp(q).replace(/\s/g, '')), prof);
      for (const q of parts) await pressText(p, '.pb-pieces .tile', q);
      await press(p, '[data-pb-send]');
    }
    await p.waitForSelector('.pb-close');
    assert(!(await bareKanji(p, '.pb-close')).length, prof + ': kanji without readings in the closing');
    await shot(p, 'profile_' + prof + '_letter', prof === 'A' || prof === 'F');
    await press(p, '.pb-close [data-pb-ok]');
    await press(p, '.pb-tray [data-pb-x]');
    await p.waitForFunction(() => !RB.activity.active(), null, { timeout: 3000 });
    await wait(p, 300);
    // a repair (P06, before/after): F chooses, the others write it (here: the Choose tab, in kana)
    await launchAct(p, 'proofreading');
    await p.waitForSelector('.pb-tray [data-pb-task="P06"]');
    await press(p, '[data-pb-task="P06"]');
    const badIdx = await p.evaluate((lv) => RB.content.practiceB.proof[5].tiers[lv].notice.segs.findIndex((g) => g.bad), prof);
    await press(p, '[data-pb-seg="' + badIdx + '"]');
    await press(p, '[data-pb-mark]');
    await p.waitForSelector('.chal .mc .btn', { timeout: 6000 });
    const fix = await p.evaluate(([lv, i]) => { const o = RB.content.practiceB.proof[5].tiers[lv].notice.segs[i].options.find((x) => x.ok); return lv === 'F' ? RB.ui.plainJp(o.jp).replace(/\s/g, '') + o.en.replace(/\s/g, '') : RB.jp.reading(o.jp).replace(/\s/g, ''); }, [prof, badIdx]);
    await pressText(p, '.chal .mc .btn', fix);
    await p.waitForSelector('.chal .fbwrap[data-fb=ok]');
    await press(p, '.chal .fb-go');
    await p.waitForSelector('.pb-result .pb-consequence');
    await shot(p, 'profile_' + prof + '_proof', prof === 'F');
    await press(p, '.pb-result [data-pb-ok]');
    await press(p, '.pb-tray [data-pb-x]');
    await p.waitForFunction(() => !RB.activity.active(), null, { timeout: 3000 });
    await wait(p, 300);
    // the sample pair (teaching examples), from Words
    await p.evaluate(() => RB.ui.menu.open('compare'));
    await press(p, '[data-cmp-sample]');
    await p.waitForSelector('.chal .pb-hdr.pair .pb-quote.teach');
    const right = await p.evaluate((lv) => { const q = RB.content.practiceB.compare.find((d) => d.id === 'S01').q[lv]; const o = q.options.find((x) => x.ok); return ((o.jp ? RB.ui.plainJp(o.jp) : '') + RB.ui.pb.kana(o.en)).replace(/\s/g, ''); }, prof);
    await pressText(p, '.chal .mc .btn', right);
    await p.waitForSelector('.chal .fbwrap[data-fb=ok]');
    await press(p, '.chal .fb-go');
    await p.waitForSelector('.pb-explain-sheet');
    assert(/Teaching examples/.test(await p.evaluate(() => document.querySelector('.pb-explain-sheet').textContent)), prof + ': the sample is labelled as teaching examples');
    await press(p, '.pb-explain-sheet [data-pb-next]');
    await p.waitForFunction(() => !RB.activity.active(), null, { timeout: 3000 });
    const r = await p.evaluate(() => ({ L: RB.game.s.practice.letters.done.L03, P: RB.game.s.practice.proof.done.P06, C: RB.game.s.practice.compare.done.S01, sampleItem: RB.game.s.learn.items['g:indirectness'] }));
    assert(r.L && r.L.prof === prof && r.P && r.P.prof === prof && r.C, prof + ': records ' + JSON.stringify(r));
    assert(!errors.length, prof + ': ' + errors.join('; '));
    await ctx.close();
  }
});

// =====================================================================================================
await test('layouts: 320×640, 390×844 and 844×390 by touch, 1280×800, and 200 % text — no overflow, 44 px controls, readings on every kanji', async () => {
  const sizes = [[320, 640, 1], [390, 844, 1], [844, 390, 1], [1280, 800, 1], [390, 844, 2], [1280, 800, 2]];
  for (const [w, h, k] of sizes) {
    const touch = w < 1000;
    const tag = w + 'x' + h + (k > 1 ? '_text200' : '');
    const { p, errors, ctx } = await page(b, url, touch ? PHONE(w, h) : { viewport: { width: w, height: h } });
    try {
    // Known shared defect (not suite B's code; docs/practice/suite_b.md › Findings): at 200 % text
    // on a desktop window, the hover word-help card (src/ui/10_ui.js position()) can open on top
    // of the very word under the pointer when it fits neither above nor below it, so a mouse
    // click on a piece or a notice portion lands on the card. Word help is a player setting;
    // it is switched off for the large-text desktop pass so the layout itself is what is tested.
    await start(p, { input: 'choice', text: k, bulb: !(k > 1 && !touch) });
    const problems = [];
    const check = async (scope, name) => { const a = await audit(p, scope); if (!clean(a)) { problems.push(name + ' ' + JSON.stringify(a)); await shot(p, 'problem_' + name.replace(/\W+/g, '_') + '_' + tag); } const bk = await bareKanji(p, scope); if (bk.length) problems.push(name + ' kanji without readings: ' + bk.join(' / ')); };
    await launchAct(p, 'letters');
    await p.waitForSelector('.pb-tray .pb-card');
    await check('.pb-tray', 'tray');
    await shot(p, 'layout_tray_' + tag, k > 1 || w === 320);
    await press(p, '[data-pb-letter="L05"]', touch);
    await p.waitForSelector('.pb-letter .pb-pieces');
    await check('.pb-letter', 'letter');
    await shot(p, 'layout_letter_' + tag, true);
    const parts = await p.evaluate(() => RB.content.practiceB.letters[4].tiers.E.replies.find((x) => x.ok).parts.filter((q) => q[0] !== '?').map((q) => RB.ui.plainJp(q).replace(/\s/g, '')));
    for (const q of parts) await pressText(p, '.pb-pieces .tile', q, touch);
    await press(p, '[data-pb-send]', touch);
    await p.waitForSelector('.pb-close');
    await check('.pb-close', 'closing');
    await press(p, '.pb-close [data-pb-ok]', touch);
    await press(p, '[data-pb-letter="L07"]', touch);
    await press(p, '[data-pb-write]', touch);
    await p.waitForSelector('.chal .pb-hdr');
    await check('.chal', 'letter write step');
    await shot(p, 'layout_letter_write_' + tag, w === 390 && k === 1);
    await press(p, '.chal [data-a=leave]', touch);
    await press(p, '.pb-letter [data-pb-aside]', touch);
    await press(p, '.pb-tray [data-pb-x]', touch);
    await p.waitForFunction(() => !RB.activity.active(), null, { timeout: 3000 });
    await wait(p, 300);
    await launchAct(p, 'proofreading');
    await p.waitForSelector('.pb-tray [data-pb-task="P10"]');
    await press(p, '[data-pb-task="P10"]', touch);
    await p.waitForSelector('.pb-proof .pb-measure');
    await check('.pb-proof', 'proof sheet');
    await shot(p, 'layout_proof_' + tag, true);
    await press(p, '[data-pb-seg="0"]', touch);
    await press(p, '[data-pb-mark]', touch);
    await p.waitForSelector('.chal .pb-hdr.proof', { timeout: 6000 });
    await check('.chal', 'proof repair step');
    await shot(p, 'layout_proof_repair_' + tag, w === 320 || k > 1);
    await press(p, '.chal [data-a=leave]', touch);
    await press(p, '.pb-proof [data-pb-x]', touch);
    await press(p, '.pb-tray [data-pb-x]', touch);
    await p.waitForFunction(() => !RB.activity.active(), null, { timeout: 3000 });
    await wait(p, 300);
    await p.evaluate(() => RB.ui.menu.open('compare'));
    await p.waitForSelector('[data-cmp-sample]');
    await check('#folio-page', 'compare page');
    await press(p, '[data-cmp-sample]', touch);
    await p.waitForSelector('.chal .pb-hdr.pair');
    await check('.chal', 'comparison');
    await shot(p, 'layout_compare_' + tag, w === 844 || k > 1);
    await press(p, '.chal [data-a=leave]', touch);
    await p.waitForFunction(() => !RB.activity.active(), null, { timeout: 3000 });
    assert(!problems.length, problems.join('\n'));
    assert(!errors.length, errors.join('; '));
    } catch (e) {
      await shot(p, 'problem_' + tag).catch(() => {});
      throw new Error(tag + ': ' + (e && e.message || e));
    }
    await ctx.close();
  }
});

// =====================================================================================================
await test('a campaign change mid-session disposes the sheets; the index never launches away from the post box', async () => {
  const { p, errors, ctx } = await page(b, url, DESK);
  await start(p, { map: 'co.village', x: 7, y: 26, dir: 'down' });
  await p.evaluate(() => RB.ui.menu.open('practice'));
  await p.waitForSelector('.pr-index');
  const idx = await p.evaluate(() => ({ begin: [...document.querySelectorAll('[data-pr-begin]')].map((b) => b.getAttribute('data-pr-begin')), text: document.querySelector('.pr-index').textContent.replace(/\s+/g, ' ') }));
  assert(!idx.begin.includes('letters') && !idx.begin.includes('proofreading') && /Shino's Post House/.test(idx.text), 'away from the post box: where to go, no Begin: ' + JSON.stringify(idx));
  const r = await p.evaluate(() => RB.activity.launch('letters', { source: 'words' }));
  assert(!r.ok && /post box/.test(r.why), 'a direct launch away from the place is refused: ' + JSON.stringify(r));
  await p.evaluate(() => RB.ui.menu.close());
  await wait(p, 300);
  await p.evaluate(() => RB.game.transition('co.post', 6, 5, 'right'));
  await p.waitForFunction(() => RB.game.mode() === 'world' && RB.world.W.map.id === 'co.post', null, { timeout: 8000 });
  await launchAct(p, 'letters');
  await p.waitForSelector('.pb-tray');
  await press(p, '[data-pb-letter="L09"]');
  await p.waitForSelector('.pb-letter');
  await start(p, { map: 'rw.village', x: 22, y: 30, dir: 'down' });
  const after = await p.evaluate(() => ({ sheets: document.querySelectorAll('.lsheet.pb').length, act: !!RB.activity.active(), mode: RB.game.mode(), open: RB.game.s.practice.letters.active }));
  assert(after.sheets === 0 && !after.act && after.mode === 'world' && after.open === null, 'nothing of the old session remains in the new campaign: ' + JSON.stringify(after));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

console.log('\n' + results.join('\n'));
console.log('\n' + pass + ' passed, ' + fail + ' failed');
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
