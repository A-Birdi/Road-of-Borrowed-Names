// Settings in battle (owner's request of 2026-10-03; docs/COMBAT_NOTES.md "Settings in battle"), on
// the built index.html at 1280×800 and on a phone (390×844), with real clicks and keys:
//   1. sheet: a clearly labelled Settings button in the battle (and the menu key, C) opens the same
//      settings, presentation only (speed and motion, audio, reading, display, battle display); the
//      rest is listed read-only "until the encounter is over"; no saving ("Saving is available after
//      the encounter."). Allowed changes apply at once and never touch the battle: the rules' state,
//      the telegraphs, the response cards and Harmony are the same after every change, and after
//      opening and closing ten times (no re-roll: the creature then does exactly what it telegraphed).
//      Closing never chooses anything: a double click on the dim area over a response card, a held
//      Enter and a Space on "Back to the encounter".
//   2. exchange: opened while an exchange plays, the encounter is paused (the presentation clock,
//      the beats, the displayed state and the creature's move stand still); a new text size keeps the
//      stage where it is; a window resize meanwhile breaks nothing; closing resumes and the exchange
//      ends on the rules' state. Instant chosen while paused shows the rest at once.
//   3. task: the sheet cannot open over the language task (no button, C does nothing) and the typed
//      draft is intact; the sheet never submits, steps back or skips.
//   4. saves: no saving by any route while the battle is open (the save functions, a scene's
//      !autosave, the ledger's Save), the folio cannot open, and the sheet refuses rule settings
//      (assistance, difficulty, Japanese level, way to answer) even from a forged control.
//   5. boss: the mill boss (no stepping back): Escape and X do not leave; Load from the battle's
//      sheet asks first, a cancelled ledger returns to the encounter, and loading the save made just
//      before the boss brings back the map with the boss intact (nothing written: no win, no scene
//      seen, no battle state, no layers, the map's music, the frame loop running); the boss starts
//      again from its trigger; Return to title from the battle, then Continue: no remnants.
// Scripted only to set up a session campaign (place the player, keep other creatures still, the
// pre-boss save) and to read state; every action under test is a real click or key.
// Usage: node tests/e2e/battle_settings.mjs [filter] [--desk-only|--phone-only]
import { serve, launch, page, companionTurn } from './lib.mjs';

const args = process.argv.slice(2);
const only = args.find((a) => !a.startsWith('--'));
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const results = [];
const VIEWS = [
  { tag: '1280×800', size: { width: 1280, height: 800 } },
  { tag: 'phone 390×844', size: { width: 390, height: 844 }, phone: true },
].filter((v) => !(args.includes('--desk-only') && v.phone) && !(args.includes('--phone-only') && !v.phone));
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 180 s')), 180000))]); pass++; results.push('PASS ' + name); console.log('PASS ' + name); }
  catch (e) { fail++; results.push('FAIL ' + name + '\n   ' + String((e && e.message) || e).slice(0, 1200)); console.log('FAIL ' + name + ': ' + String((e && e.message) || e).slice(0, 900)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const wait = (p, ms) => p.waitForTimeout(ms);

// a fresh page with instrumentation that only watches: frames drawn, notices shown, the last task step
async function open(v) {
  const P = await page(b, url, { viewport: v.size, touch: !!v.phone, mobile: !!v.phone, dpr: 1 });
  await P.p.evaluate(() => {
    const T = (window.__T = { frames: 0, notices: [], clicks: [] });
    const frame = RB.render.frame;
    RB.render.frame = function () { T.frames++; return frame.apply(this, arguments); };
    const notice = RB.ui.notice;
    RB.ui.notice = function (t) { T.notices.push(String(t)); return notice.apply(this, arguments); };
    const run = RB.challenge.runStep;
    RB.challenge.runStep = (step, o) => { window.__step = step; return run(step, o); };
    document.addEventListener('click', (e) => { T.clicks.push((e.target && e.target.className && String(e.target.className)) || (e.target && e.target.tagName) || '?'); }, true);
  });
  return P;
}
// a session-only Chapter 2 campaign with Suzu at the Saltglass cove (never a real save); one-time
// notes already seen so nothing covers the cards
async function cove(p, x, y, dir, o) {
  await p.evaluate(([x, y, dir, o]) => {
    const s = RB.game.debugStart('sg.cove', x, y, { dir, comp: 'suzu', flags: { ch1_done: true, departed: true } });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.learn.assist = 'normal'; s.learn.difficulty = 'normal';
    s.words = ['mamoru', 'iyasu', 'hikari'];
    s.tips = { harmony: 1, harmonyFull: 1, cturn: 1, group: 1 };
    for (const k of ['strike', 'sweep', 'shroud', 'rest', 'heat', 'charge', 'lie', 'mirror', 'plea']) s.tips['intent:' + k] = 1;
    for (const w of s.words) s.tips['word:' + w] = 1;
    const st = RB.game.settings;
    st.input = o.input || 'choice'; st.textSpeed = 'instant'; st.battleAnim = o.anim || 'normal'; st.battleControls = 'adaptive'; st.intentDisplay = 'adaptive';
    st.reducedMotion = false; st.contrast = 'normal'; st.textScale = 1; st.muted = false;
    RB.game.applySettings();
  }, [x, y, dir, o || {}]);
  await wait(p, 250);
}
// setup only: a placed creature stands at x,y and does not wander off on its own
const hold = (p, id, x, y) => p.evaluate(([id, x, y]) => { const f = RB.world.W.foes.find((q) => q.id === id); if (!f) return; if (x != null) { f.x = x; f.y = y; f.fx = x; f.fy = y; f.mv = null; } f.wt = 1e9; }, [id, x, y]);
// one step with a real arrow key
async function step(p, key) {
  const moving = () => p.evaluate(() => !!RB.world.W.player.mv);
  await p.keyboard.down(key);
  for (let i = 0; i < 25 && !(await moving()); i++) await wait(p, 16);
  await p.keyboard.up(key);
  for (let i = 0; i < 30 && (await moving()); i++) await wait(p, 16);
  await wait(p, 80);
}
// a real click on the middle of an element's visible part
async function clickEl(p, sel, o) {
  const pt = await p.evaluate((sel) => {
    const el = [...document.querySelectorAll(sel)].find((e) => e.offsetParent !== null) || document.querySelector(sel);
    if (!el) return null;
    el.scrollIntoView({ block: 'nearest' });
    const r = el.getBoundingClientRect(), x = r.left + r.width / 2;
    for (let y = Math.max(r.top, 0) + 4; y < Math.min(r.bottom, innerHeight); y += 4) { const t = document.elementFromPoint(x, y); if (t && (t === el || el.contains(t))) return { x, y }; }
    return null;
  }, sel);
  if (!pt) return false;
  if (o && o.dbl) await p.mouse.dblclick(pt.x, pt.y); else await p.mouse.click(pt.x, pt.y);
  return true;
}
// the opening lines (Z) until the responses are offered
async function toChoice(p, ms) {
  const t0 = Date.now();
  while (Date.now() - t0 < (ms || 20000)) {
    const s = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), ph: RB.combat.phase(), cards: !!document.querySelector('.rcard[data-i]:not([disabled])'), busy: RB.battleSeq.busy(), coach: !!document.querySelector('[data-coach-ok]') }));
    if (s.coach) { await clickEl(p, '[data-coach-ok]'); await wait(p, 150); continue; }
    if (s.ph === 'choose' && s.cards && !s.dlg && !s.busy) { await wait(p, 350); return true; }
    if (s.dlg) await p.keyboard.press('z');
    await wait(p, 120);
  }
  return false;
}
// walk into the Label Crab (real arrow key): one battle, its responses offered
async function crabBattle(p, o) {
  await cove(p, 12, 8, 'right', o);
  await hold(p, 'c1', 14, 8);
  await step(p, 'ArrowRight');
  await p.waitForFunction(() => RB.game.mode() === 'combat', null, { timeout: 8000 });
  assert(await toChoice(p), 'the responses are offered');
}
// what the battle is: the rules' state, the cards offered, the telegraphs, Harmony (JSON)
const battleKey = (p) => p.evaluate(() => JSON.stringify({
  st: RB.combat.state(), shown: RB.combat.shown(), phase: RB.combat.phase(),
  cards: [...document.querySelectorAll('.rcard[data-i]')].map((c) => (c.disabled ? 'off ' : '') + c.textContent.replace(/\s+/g, ' ').trim()),
  runs: RB.battleSeq.stats().counters.runs,
}));
const sheetOpen = (p) => p.evaluate(() => !!(RB.ui.settings.inBattle && RB.ui.settings.inBattle()) && !!document.querySelector('.folio-bset'));
// a group of the sheet (the index on a phone is its own page)
async function group(p, id) {
  if (await p.evaluate((id) => { const b = document.querySelector('.folio-bset [data-grp="' + id + '"]'); return !!(b && b.offsetParent); }, id)) { await clickEl(p, '.folio-bset [data-grp="' + id + '"]'); await wait(p, 150); return; }
  await clickEl(p, '.folio-bset [data-grp=""]');
  await wait(p, 150);
  await clickEl(p, '.folio-bset [data-grp="' + id + '"]');
  await wait(p, 150);
}
const radio = async (p, k, v) => { await clickEl(p, '.folio-bset label.opt:has(input[data-set="' + k + '"][value="' + v + '"])'); await wait(p, 150); };
const toggle = async (p, k) => { await clickEl(p, '.folio-bset label.switch:has([data-sw="' + k + '"])'); await wait(p, 150); };
// the battle's Settings button, pressed with the mouse (moved off first: a pointer resting on a
// keyword shows its note, which may lie over the button)
async function openByButton(p) { await p.mouse.move(2, 2); await wait(p, 320); return clickEl(p, '.combat-ui .cb-set'); }
// the moment after closing in which a press is held (the closing shield) has passed
async function settledClose(p) { await wait(p, 420); await p.waitForFunction(() => !document.querySelector('.bset-shield'), null, { timeout: 5000 }); await wait(p, 30); }
// close with "Back to the encounter" (real click), then wait out the moment the closing press is held
async function closeSheet(p) { await clickEl(p, '.folio-bset [data-folio-close]'); await settledClose(p); }
// the right option of the open task (real click), then Continue
async function answerRight(p) {
  await p.waitForSelector('.chal .mc .btn', { timeout: 10000 });
  await p.mouse.move(2, 2);
  await p.evaluate(() => {
    const st = window.__step;
    const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
    const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.util.esc(o.en) + '</span>' : '');
    const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => txt(html(o)));
    const el = [...document.querySelectorAll('.chal .mc .btn')].find((x) => right.includes(x.textContent.replace(/\s+/g, ' ').trim()));
    if (el) el.setAttribute('data-test-right', '1');
  });
  assert(await clickEl(p, '[data-test-right]'), 'the right option is on screen');
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go', { timeout: 10000 });
  await clickEl(p, '.fbwrap[data-fb=ok] .fb-go');
}
// a response by its card text (real click)
async function pick(p, re) {
  const ok = await p.evaluate((m) => { const c = [...document.querySelectorAll('.rcard[data-i]')].find((x) => !x.disabled && new RegExp(m, 'i').test(x.textContent.replace(/\s+/g, ' '))); if (!c) return false; document.querySelectorAll('[data-test-card]').forEach((x) => x.removeAttribute('data-test-card')); c.setAttribute('data-test-card', '1'); return true; }, re);
  assert(ok, 'no card matching ' + re);
  await clickEl(p, '[data-test-card]');
}
// the battle's state as the rules hold it equals the screen's (after an exchange)
const reconciled = (p) => p.evaluate(() => JSON.stringify(RB.combat.shown()) === JSON.stringify(RB.combatLogic.snapshot(RB.combat.state())));
async function untilChoose(p, ms) {
  await p.waitForFunction(() => RB.combat.phase() === 'choose' && !RB.battleSeq.busy() && !!document.querySelector('.rcard[data-i]:not([disabled])'), null, { timeout: ms || 20000 });
  await wait(p, 300);
}
// no battle left anywhere: the screen, the rules, the modes, the layers, the body, the scene runner
const remnants = (p) => p.evaluate(() => ({
  ui: document.querySelectorAll('.combat-ui, .cb-set, .folio-bset').length, st: !!RB.combat.state(), phase: RB.combat.phase(), inBattle: RB.game.inBattle(),
  modes: RB.game.G.modes.join('>'), top: RB.ui.topLayer() && RB.ui.topLayer().name, body: document.body.className, script: RB.script.isRunning(),
  world: RB.render.worldVisible(), paused: RB.battleSeq.paused(), seq: RB.battleSeq.stats(), dlg: RB.ui.dialogue.isOpen(), song: RB.audio && RB.audio.currentSong(),
}));
const clean = (r, base) => r.ui === 0 && !r.st && r.phase === 'idle' && !r.inBattle && r.modes === (base || 'world') && !r.top && !/in-panel|in-dialogue|veiled/.test(r.body) && !r.script && !r.paused && !r.seq.running && !r.seq.attached && !r.seq.layer && !r.dlg;
async function framesAlive(p) { const a = await p.evaluate(() => window.__T.frames); await wait(p, 500); const c = await p.evaluate(() => window.__T.frames); return c - a; }

for (const v of VIEWS) {
  const tag = v.tag;

  await test(tag + ' — sheet: presentation only, no saving, changes touch nothing in the battle, open/close re-rolls nothing, closing never chooses', async () => {
    const { p, ctx, errors } = await open(v);
    await crabBattle(p);
    // the button is in the battle, clearly labelled, and opens the sheet (real click)
    const btn = await p.evaluate(() => { const b = document.querySelector('.combat-ui .cb-set'); if (!b) return null; const r = b.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { text: b.textContent.trim(), vis: !b.hidden && r.width >= 44 && r.height >= 44 && r.bottom <= innerHeight && r.right <= innerWidth, top: !!(top && b.contains(top)) }; });
    assert(btn && btn.vis && btn.top && /Settings/.test(btn.text), 'a visible, labelled Settings button in the battle, not covered: ' + JSON.stringify(btn));
    const k0 = await battleKey(p);
    await openByButton(p);
    await wait(p, 300);
    assert(await sheetOpen(p), 'the button opens the battle settings sheet');
    const c = await p.evaluate(() => {
      const f = document.querySelector('.folio-bset');
      const txt = f.textContent.replace(/\s+/g, ' ');
      return { paused: RB.battleSeq.paused(), top: RB.ui.topLayer().name, groups: [...f.querySelectorAll('[data-grp]')].map((x) => x.getAttribute('data-grp')).filter(Boolean),
        foot: f.querySelector('.folio-foot').textContent.replace(/\s+/g, ' ').trim(), save: !!f.querySelector('[data-a="save"], [data-util="save"]'), learn: !!f.querySelector('[data-obj="learn"]'),
        locked: [...f.querySelectorAll('[data-set="input"], [data-set="padKanji"], [data-set="questGuide"], [data-sw="strokePractice"], [data-bind], [data-set="profile"], [data-set="assist"], [data-set="difficulty"]')].length, flee: /Step back/i.test(txt) };
    });
    assert(c.paused && c.top === 'battle-settings', 'the battle is paused under the sheet: ' + JSON.stringify(c));
    assert(JSON.stringify(c.groups) === JSON.stringify(['motion', 'audio', 'reading', 'display', 'battle', 'fixed']), 'groups: speed & motion, audio, reading, display, battle display, fixed: ' + c.groups);
    assert(/Saving is available after the encounter\./.test(c.foot) && /Load a journey/.test(c.foot) && /Return to title/.test(c.foot) && !c.save, 'the foot: no saving, Load and Return to title: ' + c.foot);
    assert(!c.learn && !c.locked && !c.flee, 'no rule, learning or step-back control in the sheet: ' + JSON.stringify(c));
    // the fixed list: read-only, with the current values and why
    await group(p, 'fixed');
    const fx = await p.evaluate(() => { const f = document.querySelector('.folio-bset .bset-fixed'); return f ? { text: f.textContent.replace(/\s+/g, ' '), inputs: f.querySelectorAll('input, select, button').length } : null; });
    assert(fx && /Japanese level: Elementary/.test(fx.text) && /Mistakes in battle: Standard/.test(fx.text) && /Tactical challenge: Standard/.test(fx.text) && /Default way to answer: Choices/.test(fx.text) && fx.inputs === 0, 'the fixed settings are listed read-only: ' + JSON.stringify(fx));
    // allowed changes, by real clicks and keys: each applies at once, the battle stays as it was
    await group(p, 'motion');
    await radio(p, 'battleAnim', 'fast');
    await radio(p, 'textSpeed', 'normal');
    await toggle(p, 'reducedMotion');
    await group(p, 'audio');
    await toggle(p, 'muted');
    await group(p, 'display');
    await toggle(p, 'contrast');
    await p.focus('.folio-bset [data-range="textScale"]');
    for (let i = 0; i < 3; i++) { await p.keyboard.press('ArrowRight'); await wait(p, 60); }
    await group(p, 'battle');
    await radio(p, 'intentDisplay', 'expanded');
    await radio(p, 'battleControls', 'keep');
    await group(p, 'reading');
    await toggle(p, 'lightbulb');
    await radio(p, 'secondary', 'tap');
    await wait(p, 400);
    const s1 = await p.evaluate(() => { const st = RB.game.settings; return { anim: st.battleAnim, text: st.textSpeed, rm: st.reducedMotion && document.body.classList.contains('reduced-motion'), muted: st.muted, hc: document.body.classList.contains('high-contrast'), scale: +getComputedStyle(document.documentElement).getPropertyValue('--text-scale'), intents: st.intentDisplay, controls: st.battleControls, bulb: st.lightbulb, secondary: st.secondary }; });
    assert(s1.anim === 'fast' && s1.text === 'normal' && s1.rm && s1.muted && s1.hc && Math.abs(s1.scale - 1.15) < 0.01 && s1.intents === 'expanded' && s1.controls === 'keep' && s1.bulb === false && s1.secondary === 'tap', 'each change applied at once: ' + JSON.stringify(s1));
    assert(await p.evaluate(() => RB.battleSeq.paused()), 'still paused while changing settings');
    await closeSheet(p);
    const k1 = await battleKey(p);
    const a0 = JSON.parse(k0), a1 = JSON.parse(k1);
    assert(JSON.stringify(a0.st) === JSON.stringify(a1.st) && a0.phase === a1.phase && a1.phase === 'choose' && a0.runs === a1.runs, 'the rules\' state, the phase and the sequences are exactly as before the sheet');
    assert(JSON.stringify(a0.cards) === JSON.stringify(a1.cards), 'the same responses are offered');
    assert(await p.evaluate(() => !RB.battleSeq.paused() && !document.querySelector('.combat-ui .intent').classList.contains('it-none')), 'closing resumes; Expanded shows the telegraph at once');
    // open and close ten times, by the button, the menu key (C) and Escape: nothing is re-rolled
    for (let i = 0; i < 10; i++) {
      if (i % 2) assert(await openByButton(p), 'the button can be pressed (' + i + ')'); else await p.keyboard.press('c');
      await wait(p, 160);
      assert(await sheetOpen(p), 'opened (' + i + ')');
      if (i % 3 === 0) await p.keyboard.press('Escape'); else if (i % 3 === 1) await p.keyboard.press('c'); else await clickEl(p, '.folio-bset [data-folio-close]');
      await settledClose(p);
      assert(!(await sheetOpen(p)), 'closed (' + i + ')');
    }
    const k2 = JSON.parse(await battleKey(p));
    assert(JSON.stringify(k2.st) === JSON.stringify(a0.st) && JSON.stringify(k2.cards) === JSON.stringify(a0.cards) && k2.runs === a0.runs && k2.phase === 'choose', 'ten openings later: the same state, telegraphs, cards and Harmony; no sequence played');
    // closing never chooses: a double click on the dim area over a response card (wide screens),
    // a double click on Back, a held Enter and a Space on Back
    const pressed0 = await p.evaluate(() => RB.combat.debug().pressesIgnored);
    if (!v.phone) {
      await p.keyboard.press('c'); await wait(p, 250);
      const pt = await p.evaluate(() => { const card = document.querySelector('.rcard[data-i]:not([disabled])'), f = document.querySelector('.folio-bset').getBoundingClientRect(); const r = card.getBoundingClientRect(); const x = Math.max(f.right + 20, r.left + r.width * 0.75); const y = r.top + r.height / 2; const top = document.elementFromPoint(x, y); return { x, y, scrim: !!(top && top.classList.contains('folio-scrim')), under: x < r.right }; });
      assert(pt.scrim && pt.under, 'a point on the dim area that lies over a response card: ' + JSON.stringify(pt));
      await p.evaluate(() => { window.__T.clicks = []; });
      await p.mouse.dblclick(pt.x, pt.y);
      await settledClose(p); await wait(p, 100);
      const d = await p.evaluate(() => ({ open: !!document.querySelector('.folio-bset'), phase: RB.combat.phase(), chal: !!document.querySelector('.chal'), clicks: window.__T.clicks.slice() }));
      assert(!d.open && d.phase === 'choose' && !d.chal, 'a double click on the dim area closes the sheet and chooses no card under it: ' + JSON.stringify(d));
      assert(d.clicks.length === 2 && /bset-shield/.test(d.clicks[1]), 'the second click landed on the closing shield: ' + JSON.stringify(d.clicks));
    }
    await p.keyboard.press('c'); await wait(p, 250);
    await p.evaluate(() => { window.__T.clicks = []; });
    await clickEl(p, '.folio-bset [data-folio-close]', { dbl: true });
    await settledClose(p); await wait(p, 100);
    let d = await p.evaluate(() => ({ open: !!document.querySelector('.folio-bset'), phase: RB.combat.phase(), chal: !!document.querySelector('.chal'), card: RB.battleIntents.isOpen(), clicks: window.__T.clicks.slice() }));
    assert(!d.open && d.phase === 'choose' && !d.chal && !d.card && /bset-shield/.test(d.clicks[1] || ''), 'a double click on Back closes the sheet; the second click lands on the shield: ' + JSON.stringify(d));
    await p.keyboard.press('c'); await wait(p, 250);
    await p.focus('.folio-bset [data-folio-close]');
    await p.keyboard.down('Enter'); await wait(p, 40);
    for (let i = 0; i < 4; i++) { await p.keyboard.down('Enter'); await wait(p, 40); } // (repeats)
    await p.keyboard.up('Enter');
    await settledClose(p); await wait(p, 100);
    d = await p.evaluate(() => ({ open: !!document.querySelector('.folio-bset'), phase: RB.combat.phase(), chal: !!document.querySelector('.chal') }));
    assert(!d.open && d.phase === 'choose' && !d.chal, 'a held Enter on Back closes the sheet and chooses nothing: ' + JSON.stringify(d));
    await p.keyboard.press('c'); await wait(p, 250);
    await p.focus('.folio-bset [data-folio-close]');
    await p.keyboard.press('Space');
    await settledClose(p); await wait(p, 100);
    d = await p.evaluate(() => ({ open: !!document.querySelector('.folio-bset'), phase: RB.combat.phase(), chal: !!document.querySelector('.chal') }));
    assert(!d.open && d.phase === 'choose' && !d.chal, 'Space on Back closes the sheet and its release chooses nothing: ' + JSON.stringify(d));
    const k3 = JSON.parse(await battleKey(p));
    assert(JSON.stringify(k3.st) === JSON.stringify(a0.st) && k3.runs === a0.runs, 'after all of that the battle is untouched');
    void pressed0;
    // and the creature then does exactly what it telegraphed: one exchange, played out
    const tele = await p.evaluate(() => RB.combat.state().foes.map((f) => f.intent && f.intent.kind));
    const r0 = await p.evaluate(() => RB.combat.state().round);
    await p.evaluate(() => { RB.game.settings.battleAnim = 'instant'; });
    await pick(p, 'heal|iyasu|癒');
    await answerRight(p);
    await companionTurn(p);
    await untilChoose(p);
    const after = await p.evaluate(() => ({ round: RB.combat.state().round, enemy: RB.battleSeq.trace().filter((t) => t.kind === 'enemy').map((t) => t.meta.kind) }));
    assert(after.round === r0 + 1 && JSON.stringify(after.enemy.slice(-tele.length)) === JSON.stringify(tele), 'one exchange: the creature did the move it telegraphed before the sheet was ever opened: ' + JSON.stringify({ tele, after }));
    assert(await reconciled(p), 'the screen shows the rules\' state');
    assert(!errors.length, 'no page errors: ' + errors.join('; '));
    await ctx.close();
  });

  await test(tag + ' — exchange: opened mid-exchange it pauses everything; text size and a resize keep the battle; closing resumes; Instant while paused settles at once', async () => {
    const { p, ctx, errors } = await open(v);
    await crabBattle(p);
    const r0 = await p.evaluate(() => RB.combat.state().round);
    await pick(p, 'heal|iyasu|癒');
    await answerRight(p);
    await companionTurn(p);
    await p.waitForFunction(() => RB.battleSeq.busy() && RB.battleSeq.current() && RB.battleSeq.current().t > 60, null, { timeout: 8000 });
    await p.keyboard.press('c');
    await wait(p, 120);
    assert(await sheetOpen(p), 'the menu key opens the sheet while an exchange plays');
    const m0 = await p.evaluate(() => ({ cur: RB.battleSeq.current(), beats: RB.battleSeq.stats().counters.beats, shown: JSON.stringify(RB.combat.shown()), traceN: RB.battleSeq.trace().length, phase: RB.combat.phase(), wd: RB.battleSeq.stats().counters.watchdogs, stage: (() => { const r = document.querySelector('.cb-stage').getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round).join(','); })(), acting: document.querySelector('.combat-ui').classList.contains('cb-acting') }));
    await wait(p, 1500);
    const m1 = await p.evaluate(() => ({ cur: RB.battleSeq.current(), beats: RB.battleSeq.stats().counters.beats, shown: JSON.stringify(RB.combat.shown()), traceN: RB.battleSeq.trace().length, phase: RB.combat.phase() }));
    assert(m0.cur && m1.cur && m0.cur.kind === m1.cur.kind && m0.cur.t === m1.cur.t && m0.beats === m1.beats && m0.shown === m1.shown && m0.traceN === m1.traceN && m0.phase === m1.phase, 'for 1.5 s nothing moves on: the same action at the same moment, no beat, the same displayed state, no further move: ' + JSON.stringify({ m0: { cur: m0.cur, beats: m0.beats, phase: m0.phase }, m1: { cur: m1.cur, beats: m1.beats, phase: m1.phase } }));
    // a new text size while the action stands paused: the stage keeps its place and size
    await group(p, 'display');
    await p.focus('.folio-bset [data-range="textScale"]');
    for (let i = 0; i < 4; i++) { await p.keyboard.press('ArrowRight'); await wait(p, 60); }
    await wait(p, 300);
    const st1 = await p.evaluate(() => { const r = document.querySelector('.cb-stage').getBoundingClientRect(); return { stage: [r.left, r.top, r.width, r.height].map(Math.round).join(','), scale: RB.game.settings.textScale }; });
    assert(m0.acting && st1.stage === m0.stage && st1.scale > 1.15, 'text size changed mid-action, the stage did not move: ' + JSON.stringify({ before: m0.stage, after: st1 }));
    // a window resize meanwhile
    const big = v.size, small = v.phone ? { width: 400, height: 760 } : { width: 1100, height: 720 };
    await p.setViewportSize(small); await wait(p, 300);
    await p.setViewportSize(big); await wait(p, 300);
    const m2 = await p.evaluate(() => ({ cur: RB.battleSeq.current(), paused: RB.battleSeq.paused(), open: !!document.querySelector('.folio-bset') }));
    assert(m2.paused && m2.open && m2.cur && m2.cur.t === m0.cur.t, 'a resize leaves the sheet open and the action paused where it was: ' + JSON.stringify(m2));
    await closeSheet(p);
    await untilChoose(p, 25000);
    const e = await p.evaluate(([traceN]) => ({ round: RB.combat.state().round, tr: RB.battleSeq.trace().slice(Math.max(0, traceN - 1)).map((t) => t.kind + ':' + (t.settled || 'played')), wd: RB.battleSeq.stats().counters.watchdogs }), [m0.traceN]);
    assert(e.round === r0 + 1 && e.wd === m0.wd && e.tr.every((x) => /:(played|null)$/.test(x)) && e.tr.some((x) => x.startsWith('enemy')), 'closing resumed the exchange where it was; it played to its end, nothing settled by the watchdog: ' + JSON.stringify(e));
    assert(await reconciled(p), 'the screen shows the rules\' state after the exchange');
    // Instant chosen while an action stands paused: the rest of it shows at once
    await p.evaluate(() => { RB.game.settings.textScale = 1; RB.game.applySettings(); });
    await pick(p, 'heal|iyasu|癒');
    await answerRight(p);
    await companionTurn(p);
    await p.waitForFunction(() => RB.battleSeq.busy() && RB.battleSeq.current() && RB.battleSeq.current().t > 60, null, { timeout: 8000 });
    await openByButton(p);
    await wait(p, 200);
    assert(await sheetOpen(p), 'the button opens the sheet while an exchange plays');
    const n0 = await p.evaluate(() => ({ traceN: RB.battleSeq.trace().length, round: RB.combat.state().round }));
    await group(p, 'motion');
    await radio(p, 'battleAnim', 'instant');
    await closeSheet(p);
    await untilChoose(p, 8000);
    const i1 = await p.evaluate(([n]) => RB.battleSeq.trace().slice(n).map((t) => t.kind + ':' + t.settled), [n0.traceN]);
    assert(i1[0] && /:settings$/.test(i1[0]) && i1.slice(1).every((x) => /:instant$/.test(x)), 'the paused action settled at once on closing, the rest of the exchange played instantly: ' + JSON.stringify(i1));
    assert(await p.evaluate(([r]) => RB.combat.state().round === r + 1, [n0.round]) && await reconciled(p), 'one exchange, the screen on the rules\' state');
    assert(!errors.length, 'no page errors: ' + errors.join('; '));
    await ctx.close();
  });

  await test(tag + ' — task: the sheet cannot open over the language task; the draft is intact; the sheet never submits, steps back or skips', async () => {
    const { p, ctx, errors } = await open(v);
    await crabBattle(p, { input: 'ime' });
    await pick(p, 'heal|iyasu|癒');
    await p.waitForSelector('.chal #ime-in', { timeout: 10000 });
    await p.click('.chal #ime-in');
    await p.keyboard.type('abc');
    await clickEl(p, '.chal .chal-title, .chal h2, .chal .slip');
    await wait(p, 150);
    await p.keyboard.press('c');
    await wait(p, 250);
    const s = await p.evaluate(() => { const b = document.querySelector('.combat-ui .cb-set'); return { open: !!document.querySelector('.folio-bset'), ready: RB.ui.settings.battleReady(), btn: !!b && !b.hidden, chal: RB.challenge.active(), draft: document.querySelector('#ime-in') && document.querySelector('#ime-in').value, phase: RB.combat.phase(), forced: RB.ui.settings.openBattle() }; });
    assert(!s.open && !s.ready && !s.btn && !s.forced && s.chal && s.draft === 'abc' && s.phase === 'challenge', 'over the task: no sheet (button, C or a direct call) and the draft is kept: ' + JSON.stringify(s));
    // back out of the task (no cost); then the sheet offers nothing that answers, steps back or skips,
    // and moving through it and pressing its controls with the keyboard plays nothing
    await clickEl(p, '.chal [data-a="leave"]');
    await untilChoose(p);
    const k0 = await battleKey(p);
    await p.keyboard.press('c'); await wait(p, 250);
    assert(await sheetOpen(p), 'at the choice again, the sheet opens');
    const ctrls = await p.evaluate(() => [...document.querySelectorAll('.folio-bset button, .folio-bset input, .folio-bset select')].map((x) => (x.textContent || x.getAttribute('data-set') || x.getAttribute('data-sw') || x.getAttribute('data-range') || x.getAttribute('data-grp') || x.tagName).replace(/\s+/g, ' ').trim()));
    assert(ctrls.length > 5 && !ctrls.some((t) => /submit|step back|skip|flee|answer|respond|unravel/i.test(t)), 'no control in the sheet answers, steps back or skips: ' + JSON.stringify(ctrls));
    for (let i = 0; i < 6; i++) { await p.keyboard.press('Tab'); await p.keyboard.press('ArrowDown'); await wait(p, 60); }
    const mid = await p.evaluate(() => ({ chal: !!document.querySelector('.chal'), phase: RB.combat.phase(), runs: RB.battleSeq.stats().counters.runs, inSheet: !!(document.activeElement && document.activeElement.closest('.folio-bset')) }));
    await p.keyboard.press('Escape'); await settledClose(p);
    if (await sheetOpen(p)) { await p.keyboard.press('Escape'); await settledClose(p); }
    const k1 = await battleKey(p);
    const a0 = JSON.parse(k0), a1 = JSON.parse(k1);
    assert(!mid.chal && mid.phase === 'choose' && mid.inSheet && !(await sheetOpen(p)) && a1.phase === 'choose' && JSON.stringify(a0.st) === JSON.stringify(a1.st) && a0.runs === a1.runs && (await p.evaluate(() => RB.game.mode() === 'combat')), 'keys in the sheet stay in the sheet: nothing chosen, nothing played, still in the encounter: ' + JSON.stringify({ mid, phase: a1.phase }));
    assert(!errors.length, 'no page errors: ' + errors.join('; '));
    await ctx.close();
  });

  await test(tag + ' — saves: none by any route in battle; the folio cannot open; rule settings refused even from a forged control', async () => {
    const { p, ctx, errors } = await open(v);
    await cove(p, 12, 8, 'right');
    await p.evaluate(async () => { await RB.save.manualSave(1); RB.save.setCurrent(1, (await RB.save.list())[0].rev); });
    await hold(p, 'c1', 14, 8);
    await step(p, 'ArrowRight');
    await p.waitForFunction(() => RB.game.mode() === 'combat', null, { timeout: 8000 });
    assert(await toChoice(p), 'the responses are offered');
    const before = await p.evaluate(async () => JSON.stringify((await RB.save.list()).map((s) => [s.slot, s.empty, s.manual && s.manual.rev, s.auto && s.auto.savedAt])));
    const r = await p.evaluate(async () => {
      const out = {};
      try { await RB.save.manualSave(2); out.manual = 'saved'; } catch (e) { out.manual = e.message; }
      out.auto = await RB.save.autosave('auto');
      out.progress = await RB.save.autosave('progress');
      try { await RB.save.writeSlot(3, RB.game.s, { force: true }); out.write = 'saved'; } catch (e) { out.write = e.message; }
      // a scene's !autosave while the battle is open
      RB.script.add('@scene test.bset_save\n!autosave\n', 'test');
      await RB.script.run('test.bset_save');
      out.skipped = RB.save.skippedInBattle();
      // the folio (Save & Load lives there) cannot open in battle
      RB.ui.menu.open('save'); out.folio = RB.ui.menu.isOpen();
      return out;
    });
    assert(r.manual === 'Saving is available after the encounter.' && r.auto === null && r.progress === null && r.write === 'Saving is available after the encounter.' && r.skipped >= 3 && !r.folio, 'the save functions refuse, autosaves (also a scene\'s) write nothing, the folio stays shut: ' + JSON.stringify(r));
    // the ledger's Save (a route the battle never offers, opened directly here): refused with a notice
    await p.evaluate(() => { RB.ui.title.slots('save', true); });
    await p.waitForSelector('.folio-ledger .rec[data-slot="4"] [data-a="save"]', { timeout: 5000 });
    await clickEl(p, '.folio-ledger .rec[data-slot="4"] [data-a="save"]');
    await wait(p, 500);
    const n = await p.evaluate(() => window.__T.notices.slice(-2));
    await clickEl(p, '.folio-ledger [data-folio-close]');
    await wait(p, 300);
    const after = await p.evaluate(async () => JSON.stringify((await RB.save.list()).map((s) => [s.slot, s.empty, s.manual && s.manual.rev, s.auto && s.auto.savedAt])));
    assert(before === after && n.some((x) => /after the encounter/.test(x)), 'nothing was written to any slot or autosave; the ledger said why: ' + JSON.stringify({ before, after, n }));
    // the menu key opens the battle's sheet (never the folio), and so does a direct call to Settings
    await p.keyboard.press('c'); await wait(p, 250);
    const o = await p.evaluate(() => ({ sheet: !!document.querySelector('.folio-bset'), folio: RB.ui.menu.isOpen(), learning: !!document.querySelector('[data-grp="learning"], [data-grp="controls"], [data-grp="storage"]') }));
    assert(o.sheet && !o.folio && !o.learning, 'C opens the battle sheet, not the folio or the full Settings: ' + JSON.stringify(o));
    await p.keyboard.press('Escape'); await settledClose(p);
    await p.evaluate(() => RB.ui.settings.open()); await wait(p, 250);
    assert(await sheetOpen(p) && !(await p.evaluate(() => !!document.querySelector('[data-grp="learning"]'))), 'Settings opened by any route during a battle is the battle sheet');
    // forged rule controls dispatched in the sheet are refused
    const k0 = await battleKey(p);
    const f = await p.evaluate(async () => {
      const leaf = document.querySelector('.folio-bset .leaf');
      const s = RB.game.s, st = RB.game.settings;
      const was = { assist: s.learn.assist, difficulty: s.learn.difficulty, profile: s.learn.profile, input: st.input, stroke: st.strokePractice, quest: st.questGuide, padKanji: st.padKanji };
      const forge = (html) => { const d = document.createElement('div'); d.innerHTML = html; const el = d.firstChild; leaf.appendChild(el); const inp = el.matches('input') ? el : el.querySelector('input'); inp.checked = !inp.checked || inp.type === 'radio'; inp.dispatchEvent(new Event('change', { bubbles: true })); };
      forge('<input type="radio" data-set="assist" data-obj="learn" value="assist">');
      forge('<input type="radio" data-set="difficulty" data-obj="learn" value="relaxed">');
      forge('<input type="radio" data-set="profile" data-obj="learn" value="F">');
      forge('<input type="radio" data-set="input" value="choice">');
      forge('<input type="radio" data-set="questGuide" value="off">');
      forge('<input type="radio" data-set="padKanji" value="off">');
      forge('<label class="switch"><input type="checkbox" data-sw="strokePractice"></label>');
      await new Promise((r) => setTimeout(r, 300));
      const now = { assist: s.learn.assist, difficulty: s.learn.difficulty, profile: s.learn.profile, input: st.input, stroke: st.strokePractice, quest: st.questGuide, padKanji: st.padKanji };
      return { was, now, stAssist: RB.combat.state().assist, note: document.querySelector('.combat-ui .pm-note').textContent };
    });
    assert(JSON.stringify(f.was) === JSON.stringify(f.now) && f.stAssist === false && /at most 1/.test(f.note), 'assistance, difficulty, level and the way to answer stay as they were: ' + JSON.stringify(f));
    await closeSheet(p);
    const k1 = JSON.parse(await battleKey(p)), a0 = JSON.parse(k0);
    assert(JSON.stringify(k1.st) === JSON.stringify(a0.st), 'the battle is untouched');
    assert(!errors.length, 'no page errors: ' + errors.join('; '));
    await ctx.close();
  });

  await test(tag + ' — boss: no stepping back; Load from mid-boss restores the pre-fight save with the boss intact; Return to title then Continue leaves no battle behind', async () => {
    const { p, ctx, errors } = await open(v);
    // the mill, the loft lit: the Mill Echo waits at the millstone (Chapter 1, no companion yet)
    await p.evaluate(() => {
      const s = RB.game.debugStart('rw.mill1', 7, 9, { dir: 'up', flags: { rw_loft_done: true, rw_mill_open: true } });
      s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.words = ['mizu', 'iyasu', 'mamoru'];
      s.tips = { harmony: 1, harmonyFull: 1, cturn: 1, group: 1 };
      for (const k of ['strike', 'sweep', 'shroud', 'rest', 'heat', 'charge', 'lie', 'mirror', 'plea']) s.tips['intent:' + k] = 1;
      for (const w of s.words) s.tips['word:' + w] = 1;
      RB.game.settings.input = 'choice'; RB.game.settings.textSpeed = 'instant'; RB.game.settings.battleAnim = 'normal';
    });
    await wait(p, 250);
    await hold(p, 'm1b');
    // the save made right before the boss (slot 1)
    await p.evaluate(async () => { await RB.save.manualSave(1); });
    const pre = await p.evaluate(() => ({ x: RB.game.s.x, y: RB.game.s.y, flags: Object.keys(RB.game.s.flags).sort().join(','), seen: Object.keys(RB.game.s.seen).length, won: RB.game.s.vars.battlesWon || 0, quest: JSON.stringify(RB.game.s.quests.rw_mill || null) }));
    // walk onto the millstone floor (real arrow keys): the scene, then the boss
    await step(p, 'ArrowUp'); await step(p, 'ArrowUp');
    await p.waitForFunction(() => RB.game.mode() === 'dialogue' || RB.game.mode() === 'combat', null, { timeout: 6000 });
    assert(await toChoice(p, 30000), 'the boss battle reaches its first choice');
    const b0 = await p.evaluate(() => ({ id: RB.combat.context().id, noFlee: RB.combat.state().noFlee, flee: !!document.querySelector('[data-flee]'), modes: RB.game.G.modes.join('>'), script: RB.script.isRunning(), song: RB.audio && RB.audio.currentSong() }));
    assert(b0.id === 'rw.mill_echo' && b0.noFlee && !b0.flee && b0.modes === 'world>dialogue>combat' && b0.script, 'the Mill Echo, no stepping back offered, inside its scene: ' + JSON.stringify(b0));
    // Escape and X do not leave it
    await p.keyboard.press('Escape'); await wait(p, 200); await p.keyboard.press('x'); await wait(p, 300);
    assert(await p.evaluate(() => RB.combat.phase() === 'choose' && RB.game.mode() === 'combat' && !document.querySelector('.confirm-scrim')), 'Escape and X do not leave the boss');
    const k0 = await battleKey(p);
    // the sheet: no step back in it either; Load asks first; a ledger closed returns to the encounter
    await openByButton(p); await wait(p, 300);
    assert(await sheetOpen(p) && !(await p.evaluate(() => /Step back/i.test(document.querySelector('.folio-bset').textContent))), 'the sheet opens over the boss, with no way to step back');
    await clickEl(p, '.folio-bset [data-leave="load"]', { dbl: true });
    await p.waitForSelector('.confirm-scrim .csheet', { timeout: 4000 });
    const q = await p.evaluate(() => ({ n: document.querySelectorAll('.confirm-scrim').length, text: document.querySelector('.confirm-scrim .q').textContent, focus: document.activeElement && document.activeElement.textContent }));
    assert(q.n === 1 && /Leave this encounter and load another journey\? This battle won’t count — the creature will still be there\./.test(q.text) && /Stay/.test(q.focus), 'one question (a double click asks once), the safe answer focused: ' + JSON.stringify(q));
    await clickEl(p, '.confirm-scrim .pbtn.primary');
    await p.waitForSelector('.folio-ledger .rec[data-slot="1"] [data-a="load"]', { timeout: 5000 });
    await clickEl(p, '.folio-ledger [data-folio-close]'); await wait(p, 300);
    assert(await sheetOpen(p) && (await p.evaluate(() => RB.battleSeq.paused() && RB.combat.phase() === 'choose')), 'the ledger closed: back in the sheet, the encounter still paused');
    await closeSheet(p);
    const k1 = await battleKey(p);
    assert(JSON.parse(k1).st && JSON.stringify(JSON.parse(k1).st) === JSON.stringify(JSON.parse(k0).st), 'a load not taken leaves the boss battle exactly as it was');
    // now Load for real: the pre-boss save
    await p.keyboard.press('c'); await wait(p, 250);
    await clickEl(p, '.folio-bset [data-leave="load"]');
    await p.waitForSelector('.confirm-scrim .pbtn.primary', { timeout: 4000 });
    await clickEl(p, '.confirm-scrim .pbtn.primary');
    await p.waitForSelector('.folio-ledger .rec[data-slot="1"] [data-a="load"]', { timeout: 5000 });
    await clickEl(p, '.folio-ledger .rec[data-slot="1"] [data-a="load"]');
    await p.waitForSelector('.confirm-scrim .pbtn.primary', { timeout: 4000 });
    assert(/Load slot 1\?/.test(await p.evaluate(() => document.querySelector('.confirm-scrim .q').textContent)), 'the ledger asks before loading');
    await clickEl(p, '.confirm-scrim .pbtn.primary');
    await p.waitForFunction(() => RB.game.mode() === 'world' && !document.querySelector('.combat-ui'), null, { timeout: 8000 });
    await wait(p, 700);
    const l = await remnants(p);
    const s1 = await p.evaluate(() => ({ x: RB.game.s.x, y: RB.game.s.y, flags: Object.keys(RB.game.s.flags).sort().join(','), seen: Object.keys(RB.game.s.seen).length, won: RB.game.s.vars.battlesWon || 0, quest: JSON.stringify(RB.game.s.quests.rw_mill || null), echo: !!RB.game.s.flags.rw_echo_done, bossSeen: !!RB.game.s.seen['rw.m1_boss'], res: RB.game.s.vars._res, notices: window.__T.notices.slice() }));
    assert(clean(l), 'after loading: no battle screen, rules, modes, layers, paused sequence, line or running scene: ' + JSON.stringify(l));
    assert(l.world && l.song === 'mill' && (await framesAlive(p)) > 10, 'the map is drawn with its own music and the frame loop runs: ' + JSON.stringify({ world: l.world, song: l.song }));
    assert(s1.x === pre.x && s1.y === pre.y && s1.flags === pre.flags && s1.seen === pre.seen && s1.won === pre.won && s1.quest === pre.quest && !s1.echo && !s1.bossSeen && s1.res === undefined, 'the pre-boss save as it was: nothing of the battle written (no win, no flag, no scene seen): ' + JSON.stringify({ pre, s1 }));
    assert(!s1.notices.some((x) => /stepped back|wake at the last safe place/i.test(x)), 'no step-back or defeat followed it: ' + JSON.stringify(s1.notices));
    // the boss is still there: walking onto the millstone floor again starts it
    await hold(p, 'm1b');
    await step(p, 'ArrowUp'); await step(p, 'ArrowUp');
    await p.waitForFunction(() => RB.game.mode() === 'dialogue' || RB.game.mode() === 'combat', null, { timeout: 6000 });
    assert(await toChoice(p, 30000), 'the boss battle starts again');
    assert(await p.evaluate(() => RB.combat.context().id === 'rw.mill_echo' && RB.combat.state().foes[0].knots === RB.combat.state().foes[0].maxKnots), 'the Mill Echo again, untouched');
    // Return to title from the battle, then Continue from the title
    await p.keyboard.press('c'); await wait(p, 250);
    await clickEl(p, '.folio-bset [data-leave="title"]');
    await p.waitForSelector('.confirm-scrim .pbtn.primary', { timeout: 4000 });
    assert(/return to the title\? This battle won’t count/.test(await p.evaluate(() => document.querySelector('.confirm-scrim .q').textContent)), 'Return to title asks first');
    await clickEl(p, '.confirm-scrim .pbtn.primary');
    await p.waitForFunction(() => RB.game.mode() === 'title', null, { timeout: 6000 });
    await wait(p, 600);
    const t = await remnants(p);
    assert(t.ui === 0 && !t.st && !t.inBattle && t.modes === 'title' && t.top === 'title' && !t.script && !t.paused && !t.seq.attached && !(await p.evaluate(() => RB.game.s)) && t.song === 'title', 'at the title: no battle left, the title\'s music: ' + JSON.stringify(t));
    await clickEl(p, '.title [data-a="continue"], [data-a="continue"]');
    await p.waitForFunction(() => RB.game.mode() === 'world' && RB.game.s, null, { timeout: 8000 });
    await wait(p, 700);
    const c = await remnants(p);
    assert(clean(c) && c.world && (await framesAlive(p)) > 10, 'Continue: the journey from the save, no battle remnants, the frame loop running: ' + JSON.stringify(c));
    const s2 = await p.evaluate(() => ({ x: RB.game.s.x, y: RB.game.s.y, echo: !!RB.game.s.flags.rw_echo_done }));
    await step(p, 'ArrowLeft');
    const w = await p.evaluate(() => [RB.world.W.player.x, RB.world.W.player.y, RB.game.mode()]);
    assert(s2.x === pre.x && s2.y === pre.y && !s2.echo && w[0] === pre.x - 1 && w[2] === 'world', 'you walk on from where you saved, the boss not beaten: ' + JSON.stringify({ s2, w }));
    assert(!errors.length, 'no page errors: ' + errors.join('; '));
    await ctx.close();
  });
}

await b.close();
srv.close();
console.log('\n' + results.join('\n'));
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
