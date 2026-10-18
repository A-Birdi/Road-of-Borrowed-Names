// CW-1, the traveller's setup book (Robin, 2026-10-18), in the built index.html with Chromium: the brief's functional
// cases (F01-F20) and motion and lifecycle cases (M01-M18), each line tagged with its id. Headless Chromium's timing is
// recorded, not offered as proof of smoothness on a player's machine. Usage: node tests/e2e/cw1_setup_book.mjs
import { serve, launch, page, settled } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0, pass = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const T = {}; // timings, reported at the end

const STEPS = ['identity', 'appearance', 'background', 'learning', 'summary'];
const step = async (p) => { await settled(p); return p.evaluate(() => document.querySelector('.folio-create').getAttribute('data-step')); };
// the real New Game route: title, slot, the prologue skipped (asked first)
async function toCreation(p, slot) {
  await p.click('text=New Game');
  await p.click('.slot[data-slot="' + (slot || 1) + '"] [data-a=start]');
  await p.waitForSelector('text=Skip prologue');
  await p.click('text=Skip prologue');
  await p.click('.csheet button:has-text("Skip the prologue")');
  await p.waitForSelector('.folio-create #nm');
}
// the setup book on its own, from the title (the motion cases: no story is begun)
async function openBook(p) {
  await p.evaluate(() => { window.__W = RB.ui.create.wizard(['identity', 'appearance', 'background', 'learning', 'summary']); window.__W.then((r) => { window.__R = r; }); });
  await p.waitForSelector('.folio-create #nm');
  await p.fill('#nm', 'Robin');
}
const next = async (p) => { await p.click('.folio-create .folio-foot .cr-primary:not([hidden])'); await settled(p); };
const toStep = async (p, i) => { await p.click('.cr-route button[data-step="' + i + '"]'); await settled(p); };
// spies: campaigns built and started, reviews opened, page sounds, mounts of the live spread
const spy = (p) => p.evaluate(() => {
  window.__s = { nc: 0, start: 0, review: 0, sfx: [], mounts: 0 };
  const nc = RB.state.newCampaign; RB.state.newCampaign = function () { __s.nc++; return nc.apply(this, arguments); };
  const st = RB.game.startNewCampaign; RB.game.startNewCampaign = function () { __s.start++; return st.apply(this, arguments); };
  const rv = RB.ui.settings.review; RB.ui.settings.review = function () { __s.review++; return rv.apply(this, arguments); };
  const sf = RB.audio && RB.audio.sfx; if (sf) RB.audio.sfx = function (n) { __s.sfx.push(n); return sf.apply(this, arguments); };
});
const watchMounts = (p) => p.evaluate(() => { window.__m = 0; const b = document.querySelector('.cr-body'); new MutationObserver((l) => { if (l.some((r) => r.type === 'childList' && r.addedNodes.length)) window.__m++; }).observe(b, { childList: true }); });
// a move timed in the page: from the press to the live destination, and how many leaves turned
async function timed(p, press) {
  await p.evaluate(() => {
    window.__t = { leaves: 0, t0: 0, c0: 0, f0: 0, l0: 0 };
    // the moment the stage is emptied (the live destination shown), stamped in the page, not after a round trip
    if (!window.__tm) { window.__tm = true; const st = document.querySelector('.cr-stage'); new MutationObserver(() => { const t = window.__t; if (t && t.f0 && !t.l0 && !st.classList.contains('lt-on')) t.l0 = performance.now(); }).observe(st, { attributes: true, attributeFilter: ['class'] }); }
    if (!window.__tc) { window.__tc = true; document.addEventListener('click', () => { if (!window.__t.c0) window.__t.c0 = performance.now(); }, true); }
    // the first frame that shows a leaf: preparation (printing the pages) ends there and the turn itself begins
    const look = () => { const t = window.__t; if (!t.f0 && t.c0 && document.querySelector('.cr-stage .lt-leaf')) t.f0 = performance.now(); if (!t.f0) requestAnimationFrame(look); };
    requestAnimationFrame(look);
    const run = RB.ui.leafTurn.run;
    if (!run.__w) { RB.ui.leafTurn.run = function (o) { const h = run.call(this, o); window.__t.leaves = h.plan.n; return h; }; RB.ui.leafTurn.run.__w = true; }
  });
  await p.evaluate(() => { window.__t.t0 = performance.now(); });
  await press();
  await p.waitForFunction(() => document.querySelector('.cr-stage.lt-on'), null, { timeout: 2000 }).catch(() => {});
  await p.waitForFunction(() => !document.querySelector('.cr-stage.lt-on') && !document.querySelector('.folio-create.cr-turning'), null, { timeout: 5000 });
  // ms: from before the press (Playwright's own round trip included); page: from the click event to the live destination;
  // prep: from the click to the first frame with a leaf (the pages printed: package 05 bounds warm preparation near
  // 50 ms); turn: from that frame to the live destination (the contract's timing, ±15 %)
  return p.evaluate(() => { const t = window.__t, end = t.l0 || performance.now(); return { leaves: t.leaves, ms: Math.round(performance.now() - t.t0), page: Math.round(end - t.c0), prep: Math.round(t.f0 - t.c0), turn: Math.round(end - t.f0) }; });
}

// ---- F01-F05, F07, F09, F15, F17: a fresh journey through the real route ---------------------------------------
{
  const { p, errors, requests } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  await p.evaluate(async () => { RB.game.settings.input = 'ime'; await RB.game.saveSettings(); }); // (F02: an existing preference)
  await toCreation(p);
  await spy(p);
  const route = await p.evaluate(() => [...document.querySelectorAll('.cr-route .lbl')].map((x) => x.firstChild.textContent).join(','));
  ok(route === 'Identity,Appearance,Background,Learning,Summary', 'F01 five stations: ' + route);
  await p.fill('#nm', 'Robin');
  await p.fill('#nj', 'ろびん'); // F07: a Japanese name of their own
  await p.click('input[data-set=pron][data-v=she]');
  await next(p);
  for (const a of ['glasses', 'flower', 'hat']) await p.click('input[data-acc=' + a + ']');
  ok(await p.evaluate(() => [...document.querySelectorAll('input[data-acc]:checked')].map((i) => i.dataset.acc).join()) === 'flower,hat', 'F09 a third accessory takes off the oldest (scarf, then glasses)');
  await next(p);
  await p.click('input[data-set=bg][data-v=student]');
  await next(p);
  const L0 = await p.evaluate(() => ({ assist: document.querySelector('input[data-k=assist]:checked').dataset.v, input: document.querySelector('input[data-k=input]:checked').dataset.v, kana: !document.querySelector('[data-group=kana]').hidden }));
  ok(L0.assist === 'assist' && L0.input === 'ime' && L0.kana, 'F02 Assisted by default, the answer mode inherited (ime), kana asked for Foundations: ' + JSON.stringify(L0));
  await p.click('input[data-k=kana][data-v=none]');
  await p.click('input[data-k=difficulty][data-v=hard]');
  ok(await p.evaluate(() => /Elementary/.test(document.querySelector('.cr-lp').innerText)), 'F05 Elementary named on Learning');
  await p.click('[data-a=back]'); await settled(p); await next(p); // F07: back and forth
  await next(p);
  ok(await step(p) === 'summary', 'F01 the fifth step is the Summary');
  const sum = await p.evaluate(() => ({ l: document.querySelector('.cr-sumsheet').innerText, r: document.querySelector('.cr-sumpage').innerText }));
  ok(/Robin/.test(sum.l) && /ろびん/.test(sum.l) && /she\/her/.test(sum.l) && /Wandering student/.test(sum.l), 'F07 the Summary shows the names once, the Japanese name as written');
  ok(/Foundations · kana from the start/.test(sum.r) && /Assisted: no learning-error battle cost/.test(sum.r) && /Demanding/.test(sum.r) && /Keyboard \/ IME/.test(sum.r), 'F03 F + no kana + Demanding + Assisted on the Summary');
  ok(/Recorded voices \(none in this copy; your device’s voice instead\)/.test(sum.r) && /Your lines: silent/.test(sum.r), 'F17 sound: the mode chosen, and what this copy can play, told apart');
  // F15: a double click and a held Enter on Begin: one journey
  await p.focus('.folio-create [data-a=go]');
  await p.evaluate(() => { const g = document.querySelector('.folio-create [data-a=go]'); g.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 })); g.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 2 })); g.click(); });
  for (let i = 0; i < 5; i++) await p.keyboard.press('Enter');
  await p.waitForFunction(() => RB.game.G.playing === true, null, { timeout: 15000 });
  await p.waitForTimeout(800);
  const s = await p.evaluate(() => ({ s: window.__s, learn: { profile: RB.game.s.learn.profile, assist: RB.game.s.learn.assist, difficulty: RB.game.s.learn.difficulty, kana: RB.game.s.learn.kanaKnown }, input: RB.game.settings.input, voice: RB.game.settings.voice.mode, player: RB.game.s.player, journal: RB.game.s.journal.length }));
  ok(s.s.nc === 1 && s.s.start === 1 && s.s.review === 0, 'F15/F01 one campaign built and started, no review after the Summary: ' + JSON.stringify(s.s));
  ok(s.learn.profile === 'F' && s.learn.assist === 'assist' && s.learn.difficulty === 'hard' && s.learn.kana === 'none' && s.input === 'ime', 'F03 the journey: ' + JSON.stringify(s.learn) + ' ' + s.input);
  ok(s.player.nameJp === 'ろびん' && s.player.pron === 'she' && s.player.bg === 'student' && s.player.look.acc.join() === 'flower,hat', 'F07/F09 the traveller as chosen');
  ok(s.voice === 'prepared', 'F17 the voice mode kept (no voicebank here; nothing installed or generated)');
  ok(s.journal === 1, 'F15 one opening journal entry');
  ok(!errors.length && !requests.length, 'no page errors, nothing fetched ' + errors.concat(requests).join('; '));
  await p.context().close();
}

// ---- F04: every field has a place; the editor offers every Settings key -----------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  // the keys the ordinary Settings book offers (no journey loaded)
  const keysIn = (sel) => p.evaluate(async (sel) => {
    const out = new Set();
    for (const t of ['reading', 'learning', 'play', 'audio', 'display', 'controls']) {
      RB.ui.settings.tab(t); await new Promise((r) => setTimeout(r, 120));
      document.querySelectorAll(sel + ' [data-set], ' + sel + ' [data-sw], ' + sel + ' [data-range], ' + sel + ' [data-suzu-speech], ' + sel + ' [data-voicehl], ' + sel + ' [data-voiceautorec], ' + sel + ' [data-bind]').forEach((e) => out.add(e.dataset.set || e.dataset.sw || e.dataset.range || e.dataset.bind || (e.hasAttribute('data-suzu-speech') ? 'suzuSpeech' : e.hasAttribute('data-voicehl') ? 'voice.highlight' : 'voice.autoRec')));
    }
    return [...out].sort();
  }, sel);
  await p.evaluate(() => RB.ui.settings.open('reading')); await p.waitForTimeout(300);
  const normal = await keysIn('.folio-settings');
  await p.evaluate(() => RB.ui.settings.close()); await p.waitForTimeout(200);
  await openBook(p);
  const fields = await p.evaluate(async () => {
    const seen = new Set();
    for (let i = 0; i < 5; i++) {
      document.querySelectorAll('.cr-body [data-set], .cr-body [data-k], .cr-body [data-acc], .cr-body #nm, .cr-body #nj, .cr-body [data-cp]').forEach((e) => seen.add(e.dataset.set || e.dataset.k || (e.dataset.acc ? 'acc' : e.dataset.cp ? 'cp:' + e.dataset.cp : e.id)));
      const nx = document.querySelector('.folio-create .folio-foot .cr-primary:not([hidden]):not([data-a=go])'); if (!nx) break; nx.click();
      await new Promise((r) => setTimeout(r, 900));
    }
    return [...seen].sort();
  });
  const want = ['acc', 'assist', 'bg', 'cp:plural', 'cp:their', 'cp:them', 'cp:they', 'difficulty', 'hair', 'hairColor', 'input', 'kana', 'lead', 'nj', 'nm', 'outfit', 'profile', 'pron', 'secondary', 'shape', 'skin', 'uiLang'];
  ok(want.every((k) => fields.includes(k)), 'F04 every setup field is on a page of the book: missing ' + want.filter((k) => !fields.includes(k)).join(','));
  await p.click('.cr-sumpage [data-a=more]');
  await p.waitForSelector('.folio-draft .ptab');
  const draft = await keysIn('.folio-draft');
  ok(normal.length > 20 && normal.every((k) => draft.includes(k)), 'F04 the Summary\'s editor offers every key ordinary Settings does (' + normal.length + '): missing ' + normal.filter((k) => !draft.includes(k)).join(','));
  ok(!errors.length, 'no page errors ' + errors.join('; '));
  await p.context().close();
}

// ---- F06, F08, F10, F11, F12, F16, M04: edits from the Summary ----------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  await openBook(p);
  await p.fill('#nm', 'Wayfarerwayfarer'); // F08: the longest name (16)
  await p.click('input[data-set=pron][data-v=custom]');
  await p.fill('#cp-they', 'xe'); await p.fill('#cp-them', 'xem'); await p.fill('#cp-their', 'xyr');
  await next(p); await next(p); await next(p);
  await p.click('input[data-k=profile][data-v=A]'); // F06: a direct choice keeps its established effects
  const f6 = await p.evaluate(() => [document.querySelector('input[data-k=lead]:checked').dataset.v, document.querySelector('input[data-k=secondary]:checked').dataset.v]);
  ok(f6.join() === 'ja,tap', 'F06 Advanced chosen directly: Japanese first, the other on a tap');
  await p.click('details.cr-readfold > summary');
  await p.click('input[data-k=lead][data-v=en]');
  await next(p);
  await toStep(p, 3);
  ok(await p.evaluate(() => document.querySelector('input[data-k=lead]:checked').dataset.v) === 'en', 'F06 showing the Summary and coming back re-applies no default (English first kept)');
  await next(p);
  const s8 = await p.evaluate(() => ({ t: document.querySelector('.cr-sumsheet').innerText, wide: [...document.querySelectorAll('.cr-sumsheet *, .cr-sumpage *')].filter((e) => e.getBoundingClientRect().right > document.querySelector('.cr-body').getBoundingClientRect().right + 1).length }));
  ok(/Wayfarerwayfarer/.test(s8.t) && /xe\/xem/.test(s8.t) && !s8.wide, 'F08 the longest name and custom pronouns read on the Summary, nothing outside the book');
  // F10: each learning group, Edit and Return
  for (const [row, input, val] of [['profile', 'profile', 'I'], ['input', 'input', 'choice'], ['assist', 'assist', 'normal'], ['difficulty', 'difficulty', 'relaxed']]) {
    await p.click('[data-row=' + row + '] .cr-edit'); await settled(p);
    const at = await p.evaluate((k) => ({ step: document.querySelector('.folio-create').dataset.step, focus: !!(document.activeElement && document.activeElement.closest('[data-group="' + k + '"]')), ret: !document.querySelector('.cr-ret').hidden }), input);
    await p.click('input[data-k=' + input + '][data-v=' + val + ']');
    await p.click('.cr-ret'); await settled(p);
    const back = await p.evaluate((row) => ({ step: document.querySelector('.folio-create').dataset.step, focus: !!(document.activeElement && document.activeElement.closest('[data-row="' + row + '"]')) }), row);
    ok(at.step === 'learning' && at.focus && at.ret && back.step === 'summary' && back.focus, 'F10 Edit ' + row + ': its group shown and focused, Return to summary, focus back on its Edit ' + JSON.stringify([at, back]));
  }
  const r10 = await p.evaluate(() => document.querySelector('.cr-sumpage').innerText);
  ok(/Intermediate/.test(r10) && /Choices/.test(r10) && /Standard: a small, capped cost/.test(r10) && /Relaxed/.test(r10), 'F10 every change shows on the Summary');
  // F12: Reading, its fold open
  await p.click('[data-row=reading] .cr-edit'); await settled(p);
  ok(await p.evaluate(() => document.querySelector('details.cr-readfold').open && document.activeElement && document.activeElement.tagName === 'SUMMARY'), 'F12 Edit reading opens the fold and focuses it');
  await p.click('.cr-ret'); await settled(p);
  // F11 + M04: Identity is four leaves back, and four forward to return
  const t1 = await timed(p, () => p.click('[data-sg=identity] .cr-edit'));
  ok(await step(p) === 'identity' && t1.leaves === 4, 'F11/M04 Edit identity: four leaves back (' + t1.leaves + ', ' + t1.ms + ' ms)');
  T['5→1'] = t1;
  ok(await p.inputValue('#nm') === 'Wayfarerwayfarer' && await p.isChecked('input[data-set=pron][data-v=custom]'), 'F11 the identity is as it was');
  // F16: a blank name stops the way back, with its own error, focused
  await p.fill('#nm', '   ');
  await p.click('.cr-ret'); await settled(p);
  ok(await step(p) === 'identity' && await p.isVisible('#nm-err') && await p.evaluate(() => document.activeElement.id === 'nm'), 'F16 a blank name: the error on Identity, focus in the field, no return');
  await p.fill('#nm', 'Wayfarer');
  const t2 = await timed(p, () => p.click('.cr-ret'));
  ok(await step(p) === 'summary' && t2.leaves === 4, 'M04 Return: four leaves forward (' + t2.leaves + ', ' + t2.ms + ' ms)');
  T['1→5'] = t2;
  const s11 = await p.evaluate(() => document.querySelector('.cr-sumpage').innerText + document.querySelector('.cr-sumsheet').innerText);
  ok(/Intermediate/.test(s11) && /Relaxed/.test(s11) && /Wayfarer/.test(s11), 'F11 nothing else lost on the way');
  ok(!errors.length, 'no page errors ' + errors.join('; '));
  await p.context().close();
}

// ---- F13, F14: the editor edits the setup, never the journey last played; a teardown puts the previews back ----------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  await p.evaluate(() => { RB.game.debugStart('rw.village', 22, 30, {}); RB.game.s.learn.profile = 'I'; RB.game.s.learn.difficulty = 'hard'; });
  await p.waitForTimeout(400);
  await p.evaluate(() => RB.game.toTitle()); await p.waitForTimeout(400);
  const before = await p.evaluate(async () => ({ master: RB.game.settings.vol.master, saved: ((await RB.save.loadSettings()) || { vol: {} }).vol.master, guide: RB.game.settings.questGuide, old: RB.game.s && RB.game.s.learn ? RB.game.s.learn.profile : null }));
  await openBook(p);
  for (let i = 0; i < 4; i++) await next(p);
  await p.click('.cr-sumpage [data-a=more]');
  await p.waitForSelector('.folio-draft .ptab');
  await p.evaluate(() => RB.ui.settings.tab('learning')); await p.waitForTimeout(150);
  const shown = await p.evaluate(() => (document.querySelector('.folio-draft input[data-set=profile]:checked') || {}).value);
  await p.click('.folio-draft label.opt:has(input[data-set="profile"][value="E"])');
  await p.evaluate(() => RB.ui.settings.tab('play')); await p.waitForTimeout(150);
  await p.click('.folio-draft label.opt:has(input[data-set="questGuide"][value="off"])');
  await p.evaluate(() => RB.ui.settings.tab('audio')); await p.waitForTimeout(150);
  await p.evaluate(() => { const x = document.querySelector('.folio-draft [data-range="vol.master"]'); x.value = '0.3'; x.dispatchEvent(new Event('input', { bubbles: true })); });
  const mid = await p.evaluate(() => ({ old: RB.game.s && RB.game.s.learn ? RB.game.s.learn.profile : null, guide: RB.game.settings.questGuide, master: RB.game.settings.vol.master }));
  ok(shown === 'F' && mid.old === before.old && mid.guide === before.guide && mid.master === 0.3, 'F13 the editor shows the setup (F), leaves the last journey (' + before.old + ') and the browser\'s guidance alone; the volume is previewed ' + JSON.stringify(mid));
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => !RB.ui.settings.isOpen() && document.querySelector('.folio-create').dataset.step === 'summary' && !RB.game.G.playing && !window.__R), 'F13 Escape returns to the Summary; nothing begins');
  ok(await p.evaluate(() => /Elementary/.test(document.querySelector('.cr-sumpage').innerText) && /quest markers and hints are off/.test(document.querySelector('.cr-sumpage').innerText)), 'F13 the Summary shows the editor\'s choices');
  await p.evaluate(() => RB.ui.create.dispose()); await p.waitForTimeout(200);
  const after = await p.evaluate(async () => ({ master: RB.game.settings.vol.master, saved: ((await RB.save.loadSettings()) || { vol: {} }).vol.master, guide: RB.game.settings.questGuide, r: window.__R, open: !!document.querySelector('.folio-create'), stage: document.querySelectorAll('.cr-stage').length }));
  ok(after.master === before.master && after.saved === before.saved && after.guide === before.guide && after.r === null && !after.open && !after.stage, 'F14 a teardown puts the previewed volume back, saves nothing, resolves no journey ' + JSON.stringify([before, after]));
  ok(!errors.length, 'no page errors ' + errors.join('; '));
  await p.context().close();
}

// ---- F18: the partial wizards keep their contracts ------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  await p.evaluate(() => { RB.ui.create.creation().then((r) => { window.__C = r; }); });
  await p.waitForSelector('.folio-create #nm');
  const r3 = await p.evaluate(() => [...document.querySelectorAll('.cr-route .lbl')].map((x) => x.firstChild.textContent).join(','));
  await p.fill('#nm', 'Sora');
  await next(p); await next(p);
  ok(await p.isVisible('.folio-create [data-a=go]') && /Continue/.test(await p.textContent('.folio-create [data-a=go]')), 'F18 creation(): three steps, Continue at the end (' + r3 + ')');
  await p.click('.folio-create [data-a=go]');
  await p.waitForFunction(() => !!window.__C);
  const c = await p.evaluate(() => window.__C);
  ok(c.name === 'Sora' && !c.learn && !c.player && c.look, 'F18 creation() resolves the player alone');
  await p.evaluate(() => { RB.ui.create.setup().then((r) => { window.__U = r; }); });
  await p.waitForSelector('.folio-create .cr-learn');
  ok(!(await p.isVisible('.cr-route')) && await p.isVisible('.folio-create [data-a=go]'), 'F18 setup(): one step, no Summary');
  await p.click('.folio-create [data-a=go]');
  await p.waitForFunction(() => !!window.__U);
  const u = await p.evaluate(() => window.__U);
  ok(u.profile === 'F' && u.assist === 'assist' && !u.player, 'F18 setup() resolves the learning choices alone ' + JSON.stringify(u));
  ok(await p.evaluate(() => !RB.game.G.playing), 'F18 neither begins a journey');
  ok(!errors.length, 'no page errors ' + errors.join('; '));
  await p.context().close();
}

// ---- F20: ordinary Settings keeps applying and saving at once; no leaf turn there -----------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  await p.evaluate(() => { RB.game.debugStart('rw.village', 22, 30, {}); });
  await p.waitForTimeout(400);
  await p.evaluate(() => RB.ui.settings.open('play')); await p.waitForTimeout(300);
  await p.click('.folio-settings label.opt:has(input[data-set="questGuide"][value="hints"])');
  await p.waitForTimeout(300);
  const f20 = await p.evaluate(async () => ({ live: RB.game.settings.questGuide, saved: (await RB.save.loadSettings()).questGuide, stage: !!document.querySelector('.cr-stage'), draft: RB.ui.settings.drafting() }));
  ok(f20.live === 'hints' && f20.saved === 'hints' && !f20.stage && !f20.draft, 'F20 ordinary Settings applies and saves at once, as before; no setup stage ' + JSON.stringify(f20));
  ok(!errors.length, 'no page errors ' + errors.join('; '));
  await p.context().close();
}

// ---- M01-M03, M05, M06, M15, M16: the leaves ---------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  await openBook(p);
  await spy(p);
  await watchMounts(p);
  // M01: one forward leaf, its printed faces, the title once
  await p.evaluate(() => { window.__said = []; const live = document.querySelector('.cr-live'); new MutationObserver(() => { if (live.textContent) window.__said.push(live.textContent); }).observe(live, { childList: true, characterData: true, subtree: true }); });
  const press = () => p.evaluate(() => document.querySelector('.folio-foot .cr-primary:not([hidden])').click());
  await press();
  await p.waitForFunction(() => document.getAnimations().some((a) => a.effect && a.effect.target && a.effect.target.classList && a.effect.target.classList.contains('lt-leaf')));
  await p.evaluate(() => document.getAnimations().forEach((a) => a.pause()));
  const faces = async () => p.evaluate(() => { const s = document.querySelector('.cr-stage'); const f = (c) => { const e = s.querySelector(c + ' > .lt-print'); return e ? (e.className.match(/cr-s-(\w+)/) || [])[1] + ':' + (e.classList.contains('cr-l') ? 'L' : 'R') : null; }; return [f('.lt-slot.lt-l'), f('.lt-slot.lt-r'), f('.lt-front'), f('.lt-back')].join(' '); });
  const fz = [];
  for (const fr of [0.25, 0.5, 0.75]) {
    await p.evaluate((fr) => document.getAnimations().forEach((a) => { a.currentTime = a.effect.getComputedTiming().duration * fr; }), fr);
    fz.push(await faces());
  }
  const inert = await p.evaluate(() => [...document.querySelectorAll('.cr-stage .lt-print')].every((e) => e.hasAttribute('inert') && e.getAttribute('aria-hidden') === 'true') && ![...document.querySelectorAll('.cr-stage [id]')].some((e) => document.querySelectorAll('#' + CSS.escape(e.id)).length > 1) && !document.querySelector('.cr-stage input[name^="cr-"]'));
  await p.evaluate(() => document.getAnimations().forEach((a) => a.play()));
  await settled(p);
  ok(fz.every((x) => x === 'identity:L appearance:R identity:R appearance:L'), 'M01/M16 1→2 at 25/50/75 %: L(1) and R(2) beneath, R(1) on the front, L(2) on the back ' + JSON.stringify(fz));
  ok(inert, 'M16 the printed pages are inert and hidden, with no live id or radio group repeated');
  await p.waitForTimeout(100);
  ok(await p.evaluate(() => window.__said.filter((x) => /Step 2 of 5/.test(x)).length === 1 && window.__m === 1), 'M01 the destination mounted once and announced once ' + JSON.stringify(await p.evaluate(() => [window.__said, window.__m])));
  // M02: one backward leaf
  await p.click('[data-a=back]');
  await p.waitForFunction(() => document.querySelector('.cr-stage.lt-on'));
  await p.evaluate(() => document.getAnimations().forEach((a) => a.pause()));
  await p.evaluate(() => document.getAnimations().forEach((a) => { a.currentTime = a.effect.getComputedTiming().duration * 0.5; }));
  const f2 = await faces();
  await p.evaluate(() => document.getAnimations().forEach((a) => a.play()));
  await settled(p);
  ok(f2 === 'identity:L appearance:R appearance:L identity:R', 'M02 2→1: L(1) and R(2) beneath, L(2) on the front, R(1) on the back ' + f2);
  // M03: 4→1 is three leaves, about 604 ms; only Identity becomes live
  for (let i = 0; i < 3; i++) await next(p);
  await p.evaluate(() => { window.__m = 0; window.__s.sfx = []; });
  const t3 = await timed(p, () => p.click('.cr-route button[data-step="0"]'));
  T['4→1'] = t3;
  const m3 = await p.evaluate(() => ({ step: document.querySelector('.folio-create').dataset.step, mounts: window.__m, page: window.__s.sfx.filter((x) => x === 'page').length }));
  ok(t3.leaves === 3 && m3.step === 'identity' && m3.mounts === 1, 'M03 4→1: three leaves, Identity alone mounted ' + JSON.stringify([t3, m3]));
  ok(Math.abs(t3.turn - 604) <= 604 * 0.15, 'M03 about 604 ms: the turn took ' + t3.turn + ' ms after ' + t3.prep + ' ms of preparation (headless Chromium; the nominal plan 604, ±15 %)');
  ok(m3.page === 1, 'one page sound for the three leaves');
  // M05: the current station: nothing
  await p.evaluate(() => { window.__s.sfx = []; window.__said = []; window.__m = 0; });
  await p.click('.cr-route button[data-step="0"]');
  await p.waitForTimeout(500);
  ok(await p.evaluate(() => !window.__s.sfx.length && !window.__m && !document.querySelector('.cr-stage.lt-on')), 'M05 the current station: no turn, no sound, no announcement');
  // M06: rapid presses and ten repeated Enters: one destination
  await p.evaluate(() => { window.__m = 0; });
  await p.focus('.cr-next');
  await p.evaluate(() => { const n = document.querySelector('.cr-next'); for (let i = 0; i < 5; i++) n.click(); });
  for (let i = 0; i < 10; i++) await p.keyboard.down('Enter');
  await p.keyboard.up('Enter');
  await settled(p);
  await p.waitForTimeout(300);
  ok(await step(p) === 'appearance' && await p.evaluate(() => window.__m) === 1, 'M06 five presses and a held Enter: one step on (' + await step(p) + ')');
  // M15: the page left as it stands is the page printed: its scroll and its open fold
  await toStep(p, 3);
  await p.evaluate(() => { const d = document.querySelector('details.cr-readfold'); d.open = true; const r = document.querySelector('.cr-body .cr-r'); r.scrollTop = 140; });
  await p.waitForTimeout(100);
  const liveTop = await p.evaluate(() => document.querySelector('.cr-body .cr-r').scrollTop);
  await p.click('[data-a=back]');
  await p.waitForFunction(() => document.querySelector('.cr-stage.lt-on'));
  await p.evaluate(() => document.getAnimations().forEach((a) => a.pause()));
  const pr = await p.evaluate(() => { const e = document.querySelector('.cr-stage .lt-slot.lt-r > .lt-print'); return e ? { top: e.scrollTop, open: !!e.querySelector('details[open]') } : null; });
  await p.evaluate(() => document.getAnimations().forEach((a) => a.play()));
  await settled(p);
  ok(pr && Math.abs(pr.top - liveTop) <= 1 && pr.open, 'M15 the outgoing right page is printed scrolled as it was (' + liveTop + ') with its fold open ' + JSON.stringify(pr));
  await toStep(p, 3);
  ok(await p.evaluate(() => document.querySelector('details.cr-readfold').open && Math.abs(document.querySelector('.cr-body .cr-r').scrollTop - 140) <= 1), 'M15 coming back, the page is as it was left');
  ok(!errors.length, 'no page errors ' + errors.join('; '));
  await p.context().close();
}

// ---- M07-M14: interruptions ----------------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  const unhandled = [];
  p.on('console', (m) => { if (/Unhandled|unhandled/.test(m.text())) unhandled.push(m.text()); });
  await openBook(p);
  for (let i = 0; i < 4; i++) await next(p);
  const turning = () => p.waitForFunction(() => document.querySelector('.cr-stage.lt-on'), null, { timeout: 2000 });
  // M07: Escape while turning: straight to where it was going; a later Escape steps back as usual
  await p.click('.cr-route button[data-step="0"]'); await turning();
  const t7 = Date.now();
  await p.keyboard.press('Escape');
  await settled(p);
  ok(await step(p) === 'identity' && Date.now() - t7 < 400, 'M07 Escape mid-turn lands on the destination at once, nothing more (' + (Date.now() - t7) + ' ms)');
  await next(p);
  await p.keyboard.press('Escape');
  ok(await step(p) === 'identity', 'M07 a later Escape steps back one page, as before');
  // M08: a resize while turning settles it; the live page is whole
  await next(p);
  await p.click('[data-a=next]'); await turning();
  await p.setViewportSize({ width: 1366, height: 768 });
  await settled(p);
  const m8 = await p.evaluate(() => ({ step: document.querySelector('.folio-create').dataset.step, vis: getComputedStyle(document.querySelector('.cr-body')).visibility, leaves: document.querySelectorAll('.cr-body > .cr-l, .cr-body > .cr-r').length }));
  ok(m8.step === 'background' && m8.vis === 'visible' && m8.leaves === 2, 'M08 resize mid-turn: settled on the destination, both pages live ' + JSON.stringify(m8));
  await p.setViewportSize({ width: 1440, height: 900 });
  // M09: the page hidden while turning: no backlog, one completion
  await p.evaluate(() => { window.__m = 0; const b = document.querySelector('.cr-body'); new MutationObserver((l) => { if (l.some((r) => r.addedNodes.length)) window.__m++; }).observe(b, { childList: true }); });
  await p.click('[data-a=next]'); await turning();
  await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
  await settled(p);
  await p.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
  await p.waitForTimeout(500);
  ok(await step(p) === 'learning' && await p.evaluate(() => window.__m) === 1, 'M09 hidden mid-turn: settled once on the destination');
  // M10: Reduce motion turned on mid-turn settles at once; afterwards no leaf turns
  await p.click('[data-a=back]'); await turning();
  await p.evaluate(() => { RB.game.settings.reducedMotion = true; RB.game.applySettings(); });
  await settled(p);
  ok(await step(p) === 'background', 'M10 Reduce motion mid-turn: settled');
  await p.click('[data-a=next]');
  ok(!(await p.evaluate(() => !!document.querySelector('.cr-stage.lt-on'))) && await step(p) === 'learning', 'M10 with Reduce motion the step changes directly');
  await p.evaluate(() => { RB.game.settings.reducedMotion = false; RB.game.settings.ledgerStyle = 'flat'; RB.game.applySettings(); });
  // M11: the book flat: no turn, every control usable
  await p.click('[data-a=back]');
  ok(!(await p.evaluate(() => !!document.querySelector('.cr-stage.lt-on'))) && await step(p) === 'background', 'M11 flat: the step changes directly');
  await p.click('input[data-set=bg][data-v=craft]');
  ok(await p.isChecked('input[data-set=bg][data-v=craft]'), 'M11 flat: the controls work');
  await p.evaluate(() => { RB.game.settings.ledgerStyle = 'book'; RB.game.applySettings(); });
  // M12: a page that cannot be printed: the move happens directly, nothing left locked
  await p.evaluate(() => { window.__print = RB.ui.leafTurn.print; RB.ui.leafTurn.print = () => { throw new Error('test: no print'); }; });
  await p.click('[data-a=next]');
  await settled(p);
  const m12 = await p.evaluate(() => ({ step: document.querySelector('.folio-create').dataset.step, stage: document.querySelector('.cr-stage').childElementCount, busy: document.querySelector('.folio-create').classList.contains('cr-turning') }));
  await p.evaluate(() => { RB.ui.leafTurn.print = window.__print; });
  ok(m12.step === 'learning' && !m12.stage && !m12.busy, 'M12 printing fails: direct to the destination, nothing locked ' + JSON.stringify(m12));
  await p.click('input[data-k=difficulty][data-v=hard]');
  ok(await p.isChecked('input[data-k=difficulty][data-v=hard]'), 'M12 the destination\'s controls work');
  // M14: twenty turns, then nothing left behind
  const n0 = await p.evaluate(() => document.querySelectorAll('*').length);
  for (let i = 0; i < 10; i++) { await p.click('[data-a=back]'); await settled(p); await p.click('[data-a=next]'); await settled(p); }
  const m14 = await p.evaluate(() => ({ nodes: document.querySelectorAll('*').length, stage: document.querySelector('.cr-stage').childElementCount, anims: document.getAnimations().filter((a) => a.playState === 'running' || a.playState === 'paused').filter((a) => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.cr-stage')).length }));
  ok(Math.abs(m14.nodes - n0) <= 4 && !m14.stage && !m14.anims, 'M14 twenty turns: no printed pages, leaves or animations left (' + n0 + ' → ' + m14.nodes + ' nodes) ' + JSON.stringify(m14));
  // M13: torn down while a leaf turns: no late mount, everything gone
  await p.click('.cr-route button[data-step="0"]'); await turning();
  await p.evaluate(() => RB.ui.create.dispose());
  await p.waitForTimeout(900);
  const m13 = await p.evaluate(() => ({ folio: !!document.querySelector('.folio-create'), stage: !!document.querySelector('.cr-stage'), r: window.__R, top: RB.ui.topLayer() && RB.ui.topLayer().name }));
  ok(!m13.folio && !m13.stage && m13.r === null && m13.top !== 'create', 'M13 torn down mid-turn: nothing mounted late, nothing left ' + JSON.stringify(m13));
  ok(!errors.length && !unhandled.length, 'M12/M13 no page errors and no unhandled rejection ' + errors.concat(unhandled).join('; '));
  await p.context().close();
}

// ---- M17, M18: the corners ---------------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  await openBook(p);
  await next(p);
  ok(await p.evaluate(() => { const r = document.querySelector('.cr-corner.r'), l = document.querySelector('.cr-corner.l'); return !!r && !!l && r.title === 'Next: Background' && l.title === 'Back: Identity' && r.getAttribute('aria-hidden') === 'true' && r.tabIndex === -1; }), 'M17 the corners name where they go; the buttons stay the keyboard\'s way');
  await p.hover('.cr-corner.r');
  await p.waitForTimeout(10000);
  const m17 = await p.evaluate(() => ({ step: document.querySelector('.folio-create').dataset.step, running: document.getAnimations().filter((a) => a.playState === 'running' && /cr-fold-pulse/.test(a.animationName || '')).length }));
  ok(m17.step === 'appearance' && m17.running === 0, 'M17 ten seconds under the pointer: no navigation, the pulse has finished ' + JSON.stringify(m17));
  await p.click('.cr-corner.r'); await settled(p);
  ok(await step(p) === 'background', 'M17 pressing the corner turns the page, as Next does');
  for (let i = 0; i < 2; i++) await next(p);
  ok(await p.evaluate(() => !document.querySelector('.cr-corner.r') && !!document.querySelector('.cr-corner.l') && document.querySelector('.folio-create').dataset.step === 'summary'), 'M18 the Summary\'s right page has no corner: Begin is the button alone');
  ok(!errors.length, 'no page errors ' + errors.join('; '));
  await p.context().close();
}

// ---- keyboard: the reading fold's summary answers Enter and Space once; Enter while composing never moves on ----------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  await openBook(p);
  await p.focus('#nm');
  await p.evaluate(() => { const nm = document.querySelector('#nm'); nm.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 229, isComposing: true, bubbles: true })); });
  ok(await step(p) === 'identity' && await p.evaluate(() => document.activeElement.id === 'nm'), 'IME: Enter that completes a composition neither moves focus nor the step');
  for (let i = 0; i < 3; i++) await next(p);
  await p.focus('details.cr-readfold > summary');
  await p.keyboard.press('Enter');
  const o1 = await p.evaluate(() => document.querySelector('details.cr-readfold').open);
  await p.keyboard.press('Space');
  const o2 = await p.evaluate(() => document.querySelector('details.cr-readfold').open);
  ok(o1 === true && o2 === false, 'the reading fold: Enter opens it, Space closes it, once each');
  await p.focus('input[data-k=assist][data-v=assist]');
  await p.keyboard.press('ArrowDown');
  ok(await p.isChecked('input[data-k=assist][data-v=normal]') && await step(p) === 'learning', 'arrows change the choice, never the page');
  ok(!errors.length, 'no page errors ' + errors.join('; '));
  await p.context().close();
}

// ---- reduced motion from the start, and a phone: no leaves, the same five steps ------------------------------------------
for (const [w, h, rm] of [[1440, 900, true], [390, 844, false]]) {
  const { p, errors } = await page(b, url, { viewport: { width: w, height: h }, touch: w < 700, mobile: w < 700 });
  await p.emulateMedia({ reducedMotion: rm ? 'reduce' : 'no-preference' });
  await openBook(p);
  let turned = 0;
  await p.evaluate(() => { window.__lt = 0; new MutationObserver(() => { if (document.querySelector('.cr-stage.lt-on')) window.__lt++; }).observe(document.querySelector('.cr-stage'), { attributes: true, childList: true }); });
  for (let i = 0; i < 4; i++) await next(p);
  await p.click('.cr-route button[data-step="0"]');
  turned = await p.evaluate(() => window.__lt);
  ok(turned === 0 && await step(p) === 'identity', (rm ? 'the system\'s reduced motion' : 'a phone, 390×844') + ': every step changes directly (' + turned + ' turns)');
  ok(!errors.length, 'no page errors ' + errors.join('; '));
  await p.context().close();
}

// the contract's totals (4 leaves 696 ms, 3 leaves 604 ms), within the brief's ±15 %, measured in the page from the first
// frame with a leaf; the preparation before it (printing the pages) is reported beside it
for (const [k, want] of [['5→1', 696], ['1→5', 696], ['4→1', 604]]) if (T[k]) ok(Math.abs(T[k].turn - want) <= want * 0.15, 'timing ' + k + ': the turn ' + T[k].turn + ' ms (contract ' + want + ' ms ±15 %), after ' + T[k].prep + ' ms of preparation; ' + T[k].page + ' ms from the click to the live page');
console.log('timings (headless Chromium; ms = from before the press; page = click event to live destination; prep = click to the first leaf frame; turn = first leaf frame to live destination): ' + JSON.stringify(T));
await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
