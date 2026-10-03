// Manual advancement in the illustrated sequences (src/ui/43_sequence.js; the Harmony & Expressive Storytelling
// addendum §18; docs/expressive/CONTRACT.md HX46–HX51, HX69, HX70), in the BUILT game, headless Chromium, with real
// clicks, taps and keys. Scenes run from synthetic starting points (RB.game.debugStart at the scene's place with the
// flags its caller sets), and a few synthetic test scenes are added at run time for what the real scenes lack
// (a choice inside a sequence, a !shake inside one, a short scene for the cycles). Checks:
//  - a minute's idle on a prologue shot, a Chapter 1 shot and a Chapter 2 shot moves nothing on (same beat, line,
//    shot; holding), with the word-help card left open on one of them;
//  - Next: one click reveals the line, a second advances it; a held key (key repeat) advances at most once;
//    rapid clicks never cross more than one beat per two presses; a press during a shot's dissolve only
//    completes it; a click on a word opens help and never advances;
//  - touch: taps on Next reveal then advance; a tap on the picture never advances (it brings hidden text back);
//  - keys: Enter, P / ←, R, I, Escape (opens the skip control; never skips), and Escape on that control keeps
//    watching; remapped keys (Previous on B, Next on N) work and the keys they replaced do nothing;
//  - Previous is read-only: looking back, replaying the shot and hiding the text change no campaign state and
//    resolve no line; Next rejoins the live line without moving on;
//  - Skip scene: asked first when part of the scene is new; "Keep watching" keeps the beat; confirmed, it runs the
//    scene's state commands once and stops where the sequence ends; a seen scene skips without asking; a skip
//    stops at a choice and answers nothing;
//  - reduced motion: each action's end state at once after the dissolve; a !shake inside a sequence never shakes;
//  - the prologue: Escape asks, Keep watching stays; Previous / Replay / Hide; seen before on this device: Skip
//    without asking;
//  - the focal area of every shot stays above the dialogue sheet at 1280×720, 390×844 and 844×390;
//  - 20 enter/exit cycles (and 6 prologue views) leave no listener, timer, layer or overlay of the player's, and the
//    page-wide listener and node counts stay flat.
// Usage: node tests/e2e/sequence_manual.mjs [--quick]   (--quick: 8 s instead of 60 s idle, 6 cycles)
import { serve, launch, page } from './lib.mjs';

const QUICK = process.argv.includes('--quick');
const IDLE = QUICK ? 8000 : 60000, CYCLES = QUICK ? 6 : 20;
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const wait = (p, ms) => p.waitForTimeout(ms);
// element handles from waitForSelector are let go at once (held ones keep detached DOM alive)
const waitSel = (p, sel, o) => p.waitForSelector(sel, o).then((h) => { if (h) return h.dispose(); });
const BASE = { rw_arrived: true, rw_road_lit: true, departed: true, ch1_done: true };
const SETUP = {
  'rw.bridge_scene': { at: ['rw.village', 31, 17], flags: { rw_echo_done: true, bridge_fixed: true } },
  'sg.omi_wataru': { at: ['sg.office', 5, 6], comp: 'mio', flags: Object.assign({}, BASE, { sg_wataru_confessed: true, sg_clue_asahi: true, sg_clue_genzo: true, sg_clue_kiyo: true }), give: 'sg_notice' },
  'sg.asahi_name': { at: ['sg.glass', 6, 6], comp: 'suzu', flags: BASE, give: 'sg_registry' },
};
// the synthetic test scenes (never in the shipped content): a choice inside a sequence, a !shake inside one, a short one
const TEST_SCENES = `
@scene test.seq_choice
!sequence ch1.bridge begin
!shot reach
narr: はし || One: the river runs high and brown under the bridge this afternoon, and the light is low.
!shot reach door
narr: こや || Two: a door opens on the far bank, and someone steps out into the last of the sun.
!shot cup
narr: ちゃや || Three: the teahouse door slides open on our side of the river, warm light behind it.
!choice
* あ || A -> a
* い || B -> a
:a
narr: あと || after
!sequence ch1.bridge end
@scene test.seq_shake
!sequence ch2.plate begin
!shot card
narr: カード || one
!shake
!shot card know
narr: ふね || two
!sequence ch2.plate end
@scene test.seq_cycle
!sequence ch2.notice begin
!shot faults
narr: いち || one
!shot notice
narr: に || two
!shot notice seal
narr: さん || three
!sequence ch2.notice end
`;
async function start(p, scene, o) {
  o = o || {};
  await p.evaluate(async ([scene, S, o, TS]) => {
    const st = S[scene] || { at: ['rw.village', 31, 17], flags: {} };
    RB.game.debugStart(st.at[0], st.at[1], st.at[2], { comp: st.comp, flags: Object.assign({}, st.flags), dir: 'up' });
    if (st.give) RB.state.give(RB.game.s, st.give, 1);
    if (!RB.content.scenes['test.seq_cycle']) RB.script.add(TS, 'test');
    RB.game.settings.textSpeed = o.speed || 'instant';
    RB.game.settings.reducedMotion = !!o.reduce; RB.game.applySettings();
    await new Promise((r) => setTimeout(r, 400));
    window.__done = false;
    RB.script.run(scene).then(() => { window.__done = true; });
  }, [scene, SETUP, o, TEST_SCENES]);
  try { await p.waitForFunction((late) => late ? RB.ui.dialogue.isOpen() : !!document.querySelector('#ui > .dlg:not(.hidden) .seq-ctrl'), scene === 'sg.omi_wataru', { timeout: 10000 }); } // (its sequence starts at the pivot, after lines in the world)
  catch (e) { console.log('     (no sequence controls for ' + scene + ': ' + JSON.stringify(await p.evaluate(() => ({ st: RB.sequence.state(), mode: RB.game.mode(), shown: RB.ui.dialogue.shown(), err: RB.content.scriptErrors && RB.content.scriptErrors.slice(-3) }))) + ')'); throw e; }
}
const S = (p) => p.evaluate(() => ({ seq: RB.sequence.state(), en: (RB.ui.dialogue.shown() || {}).en || null, n: RB.game.s.backlog.length, done: window.__done, hidden: document.querySelectorAll('#ui .dlg .reveal-hide').length, help: !!(RB.ui.help.isOpen && RB.ui.help.isOpen()), reviewing: document.querySelector('#ui .dlg').classList.contains('reviewing'), confirm: !!document.querySelector('.csheet'), choices: !!document.querySelector('.choices:not(.hidden) .choice') }));
// wait until the shot on screen has finished dissolving in (a press during a dissolve only completes it)
const settled = (p) => p.waitForFunction(() => { const s = RB.sequence.state(); return !s || s.state !== 'entering'; }, null, { timeout: 5000 });
const clickNext = async (p) => { await p.click('#ui .dlg .b-next'); };
const campaign = (p) => p.evaluate(() => { const s = RB.game.s; const q = Object.fromEntries(Object.entries(s.quests).map(([k, v]) => [k, { stage: v.stage, done: v.done }])); return JSON.stringify({ flags: s.flags, vars: s.vars, inv: s.inv, q, notes: s.notebook.map((n) => n.id), company: s.company, words: s.words, learn: Object.keys(s.learn.items).length, seq: s.seq, map: s.map, x: s.x, y: s.y }); });
// advance (real clicks) until the line in English matches re, settling each shot first
async function reach(p, re, max) {
  for (let i = 0; i < (max || 40); i++) {
    const s = await S(p);
    if (s.en && re.test(s.en)) return s;
    if (s.done) return s;
    await settled(p).catch(() => {});
    await clickNext(p);
    await wait(p, 60);
  }
  return S(p);
}

// ---- 1. a minute's idle: prologue, Chapter 1, Chapter 2 (three pages side by side) ---------------------------
{
  const A = await page(b, url, { viewport: { width: 1280, height: 720 } });
  const B = await page(b, url, { viewport: { width: 1280, height: 720 } });
  const Cp = await page(b, url, { viewport: { width: 1280, height: 720 } });
  // the prologue: on its walking shot (the traveller's walk is its action; then it holds)
  await A.p.click('text=New Game');
  await A.p.click('.slot[data-slot="1"] [data-a=start]');
  await waitSel(A.p, '.cr-prologue .slip');
  for (let i = 0; i < 12 && (await A.p.evaluate(() => RB.sequence.viewState().i)) < 5; i++) { await A.p.waitForFunction(() => RB.sequence.viewState() && RB.sequence.viewState().state !== 'entering'); await A.p.click('.cr-prologue [data-a=next]'); }
  await start(B.p, 'rw.bridge_scene');
  await start(Cp.p, 'sg.omi_wataru');
  await reach(Cp.p, /final notice back/);
  // the word-help card left open on a word of the Chapter 1 line
  await settled(B.p);
  await B.p.click('#ui .dlg .txt .jt');
  await wait(B.p, 300);
  const a0 = await A.p.evaluate(() => RB.sequence.viewState()), b0 = await S(B.p), c0 = await S(Cp.p);
  ok(b0.help, 'the word-help card opens on a word of the line (a click on a word never advances)');
  ok(b0.n === 1 && b0.seq.beats === 1, 'the click on the word did not move the line on (' + b0.n + ' lines, ' + b0.seq.beats + ' beats)');
  await wait(A.p, IDLE);
  const a1 = await A.p.evaluate(() => RB.sequence.viewState()), b1 = await S(B.p), c1 = await S(Cp.p);
  ok(a1.i === a0.i && a1.shot === 'walker' && a1.state === 'holding' && a1.beats === a0.beats, 'prologue: ' + IDLE / 1000 + ' s idle on the last shot — still on it, holding (' + JSON.stringify([a0.i, a1.i, a1.shot, a1.state]) + ')');
  ok(b1.n === b0.n && b1.en === b0.en && b1.seq.shot === b0.seq.shot && b1.seq.beats === b0.seq.beats && b1.seq.state === 'holding', 'Chapter 1: ' + IDLE / 1000 + ' s idle with the word help open — same line, same shot, holding (' + b1.seq.shot + '/' + b1.seq.phase + ')');
  ok(b1.help, 'Chapter 1: the word-help card is still open after the idle');
  ok(c1.n === c0.n && c1.en === c0.en && c1.seq.shot === 'notice' && c1.seq.state === 'holding', 'Chapter 2: ' + IDLE / 1000 + ' s idle on the notice — same line, holding');
  for (const X of [A, B, Cp]) { ok(!X.errors.length, 'no page errors ' + X.errors.slice(0, 2).join(' | ')); await X.ctx.close(); }
}

// ---- 2. Next: reveal then advance; held key; rapid clicks; dissolve; keys; Previous read-only; Hide; Replay ---------------
{
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 720 } });
  await start(p, 'rw.bridge_scene', { speed: 'normal' });
  // to a line on the same shot as the one before it (no dissolve): Kōji's "Hey, sis"
  await reach(p, /Kōji\?/);
  await settled(p);
  await clickNext(p); await wait(p, 20); // reveals or advances "…Kōji?"
  let s = await S(p);
  if (!/Hey, sis/.test(s.en)) { await clickNext(p); await wait(p, 20); s = await S(p); }
  // the line has just appeared and is still revealing
  const r0 = await S(p);
  await clickNext(p); await wait(p, 30);
  const r1 = await S(p);
  ok(r0.hidden > 0 && r1.hidden === 0 && r1.n === r0.n && r1.en === r0.en, 'one click reveals the line in full and stays on it (' + r0.hidden + ' words hidden → ' + r1.hidden + ')');
  await clickNext(p); await wait(p, 40);
  const r2 = await S(p);
  ok(r2.n === r0.n + 1 && /own cup is the rule/.test(r2.en), 'a second click moves on one line');
  // a held key: one keydown and twenty repeats
  await wait(p, 900); // revealed
  const h0 = await S(p);
  await p.evaluate(() => { const fire = (rep) => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', key: 'Enter', repeat: rep, bubbles: true })); fire(false); for (let i = 0; i < 20; i++) fire(true); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter', key: 'Enter', bubbles: true })); });
  await wait(p, 200);
  const h1 = await S(p);
  ok(h1.n - h0.n <= 1, 'a held key (key repeat) moves on at most one line (' + (h1.n - h0.n) + ')');
  // a press during a shot's dissolve only completes it: Next on the last line of a shot, then at once again
  await settled(p); await wait(p, 900);
  for (let i = 0; i < 6; i++) { const x = await S(p); if (/own cup is the rule/.test(x.en || '')) break; await clickNext(p); await wait(p, 900); }
  await clickNext(p); await wait(p, 40);
  const d0 = await S(p);
  await clickNext(p); await wait(p, 40);
  const d1 = await S(p);
  ok(d0.seq.state === 'entering' && d0.seq.shot === 'close' && d1.n === d0.n && d1.seq.state !== 'entering', 'a press while a new shot dissolves in completes the dissolve and moves nothing on (' + [d0.seq.state, d1.seq.state].join(' → ') + ')');
  // rapid clicks: six in a sixth of a second
  await settled(p);
  const q0 = await S(p);
  for (let i = 0; i < 6; i++) { await p.click('#ui .dlg .b-next', { delay: 0 }); await wait(p, 25); }
  await wait(p, 200);
  const q1 = await S(p);
  ok(q1.n - q0.n <= 3 && q1.seq, 'six rapid clicks move on at most three lines (reveal first, dissolves absorb): ' + (q1.n - q0.n));
  // Previous is read-only; Next rejoins; Replay; Hide/Show; all by keys
  await settled(p); await wait(p, 900);
  const before = await campaign(p), live = await S(p);
  await p.keyboard.press('KeyP'); await wait(p, 60);
  const v1 = await S(p);
  await p.keyboard.press('ArrowLeft'); await wait(p, 60);
  const v2 = await S(p);
  ok(v1.reviewing && v1.en !== live.en && v1.seq.review >= 0 && v2.seq.review === v1.seq.review - 1, 'P and ← look back over earlier lines (' + [v1.seq.review, v2.seq.review].join(' → ') + ')');
  await p.keyboard.press('KeyR'); await wait(p, 60);
  const v3 = await S(p);
  ok(v3.seq.replaying && v3.seq.state === 'reviewing', 'R replays the shot being looked at');
  await p.keyboard.press('Enter'); await wait(p, 60);
  await p.keyboard.press('Enter'); await wait(p, 60);
  const v4 = await S(p);
  ok(!v4.reviewing && v4.en === live.en && v4.n === live.n && v4.seq.beats === live.seq.beats, 'Next walks forward and rejoins the live line without moving it on');
  await p.keyboard.press('KeyI'); await wait(p, 60);
  const hid = await p.evaluate(() => ({ cls: document.querySelector('#ui .dlg').classList.contains('seq-hidden'), txt: getComputedStyle(document.querySelector('#ui .dlg .txt')).display, label: document.querySelector('#ui .dlg .b-hide').textContent.trim(), pressed: document.querySelector('#ui .dlg .b-hide').getAttribute('aria-pressed') }));
  ok(hid.cls && hid.txt === 'none' && /Show text/.test(hid.label) && hid.pressed === 'true', 'I hides the text and the button offers Show text');
  await clickNext(p); await wait(p, 60);
  const v5 = await S(p);
  ok(v5.n === live.n && !(await p.evaluate(() => document.querySelector('#ui .dlg').classList.contains('seq-hidden'))), 'Next with the text hidden shows it again and does not move on');
  await p.keyboard.press('KeyR'); await wait(p, 60);
  const after = await campaign(p);
  ok(after === before, 'looking back, replaying and hiding changed no campaign state (flags, items, quests, notes, Company, learning, seen record, place)');
  // Escape opens the skip control; Escape there keeps watching
  await p.keyboard.press('Escape'); await wait(p, 120);
  const e1 = await S(p);
  ok(e1.confirm && e1.n === live.n, 'Escape opens the skip control (it never skips by itself)');
  await p.keyboard.press('Escape'); await wait(p, 120);
  const e2 = await S(p);
  ok(!e2.confirm && e2.n === live.n && e2.seq && e2.seq.id === 'ch1.bridge', 'Escape on the control keeps watching, on the same line');
  // remapped keys (as Settings › Controls stores them): Previous on B, Next on N; the old keys then do nothing.
  // Keyboard focus is taken off the buttons first: Enter on a focused button activates it natively (as anywhere
  // in the game), which is not the binding under test.
  const focused = await p.evaluate(() => { const a = document.activeElement; const d = a && a !== document.body ? (a.className || a.tagName) : ''; if (a && a.blur) a.blur(); return d; });
  await p.evaluate(() => RB.input.setBinds(Object.assign({}, RB.input.getBinds(), { prev: ['KeyB'], ok: ['KeyN'] })));
  await p.keyboard.press('KeyP'); await wait(p, 60);
  const m0 = await S(p);
  await p.keyboard.press('KeyB'); await wait(p, 60);
  const m1 = await S(p);
  await p.keyboard.press('Enter'); await wait(p, 60);
  const m2 = await S(p);
  await p.keyboard.press('KeyN'); await wait(p, 60);
  const m3 = await S(p);
  await p.evaluate(() => RB.input.setBinds(RB.game.settings.binds || {}));
  ok(!m0.reviewing && m1.reviewing && m2.reviewing && !m3.reviewing && m3.n === live.n && m3.en === live.en, 'remapped keys: B looks back, N comes back to the live line without moving on; P and Enter, no longer bound, do nothing (' + [m0.reviewing, m1.reviewing, m2.reviewing, m3.reviewing].join(' ') + '; focus was on ' + (focused || 'the page') + ')');
  ok(!errors.length, 'no page errors ' + errors.slice(0, 2).join(' | '));
  await ctx.close();
}
{
  // Skip scene: asked first (unseen); Keep watching; then skip: the state lines run once, it stops after the sequence
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 720 } });
  await start(p, 'rw.bridge_scene');
  await settled(p);
  const live = await S(p);
  await p.click('#ui .dlg .b-sskip'); await wait(p, 150);
  ok((await S(p)).confirm, 'Skip scene asks first when part of the scene is new');
  await p.click('.csheet button:has-text("Keep watching")'); await wait(p, 100);
  ok((await S(p)).n === live.n && (await S(p)).seq, 'Keep watching keeps the line');
  await p.click('#ui .dlg .b-sskip'); await wait(p, 150);
  await p.click('.csheet button:has-text("Skip scene")');
  await p.waitForFunction(() => !RB.sequence.active(), null, { timeout: 8000 });
  await wait(p, 1500);
  const k1 = await S(p);
  const flags = await p.evaluate(() => ({ back: !!RB.game.s.flags.rw_koji_back, mill: !!(RB.game.s.quests.rw_mill && RB.game.s.quests.rw_mill.done), seen: RB.game.s.seq['ch1.bridge'] }));
  ok(!k1.seq && /bridge doesn't wave/.test(k1.en || '') && !k1.done, 'the skip stops where the sequence ends: the next line (in the world) waits for you');
  ok(flags.back && flags.mill && flags.seen && flags.seen.n === 1, 'the scene\'s state commands ran once (Kōji back, the quest done); the sequence counted once ' + JSON.stringify(flags.seen && flags.seen.n));
  // to the scene's end, then the same scene again in this campaign: everything seen — Skip scene does not ask
  for (let i = 0; i < 30 && !(await p.evaluate(() => window.__done)); i++) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await wait(p, 120); }
  await p.evaluate(async () => { await new Promise((r) => setTimeout(r, 300)); window.__done = false; RB.script.run('rw.bridge_scene').then(() => { window.__done = true; }); });
  await waitSel(p, '#ui .dlg .seq-ctrl');
  await settled(p);
  await p.click('#ui .dlg .b-sskip'); await wait(p, 150);
  const k2 = await S(p);
  ok(!k2.confirm, 'a scene seen before skips without asking');
  ok(!errors.length, 'no page errors ' + errors.slice(0, 2).join(' | '));
  await ctx.close();
}

// ---- 3. touch; a skip stops at a choice; reduced motion; no shake ---------------------------------------------------
{
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 390, height: 844 }, dpr: 3, mobile: true, touch: true });
  await start(p, 'test.seq_choice', { speed: 'normal' });
  await settled(p);
  const t0 = await S(p);
  await p.tap('#world'); await wait(p, 80);
  ok((await S(p)).n === t0.n, 'touch: a tap on the picture never moves on');
  await p.tap('#ui .dlg .b-next'); await wait(p, 40);
  const t1 = await S(p);
  await p.tap('#ui .dlg .b-next'); await wait(p, 60);
  const t2 = await S(p);
  ok(t1.n === t0.n && t2.n === t0.n + 1, 'touch: a tap reveals, the next tap moves on one line (' + [t0.n, t1.n, t2.n].join(' → ') + ')');
  // the secondary controls behind the labelled Scene button on a phone
  const ph = await p.evaluate(() => { const m = document.querySelector('#ui .dlg .seq-more'), g = document.querySelector('#ui .dlg .seq-g'); return { more: getComputedStyle(m).display !== 'none', label: g.getAttribute('aria-label'), role: g.getAttribute('role'), hiddenG: getComputedStyle(g).display === 'none' }; });
  ok(ph.more && ph.hiddenG && ph.role === 'group' && ph.label === 'Scene controls', 'phone: Previous / Replay / Hide / Skip sit behind a labelled "Scene" button (a group "Scene controls")');
  await p.tap('#ui .dlg .seq-more'); await wait(p, 80);
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('#ui .dlg .seq-g')).display !== 'none' && document.querySelector('#ui .dlg .seq-more').getAttribute('aria-expanded') === 'true'), 'phone: the Scene button opens them');
  await p.tap('#ui .dlg .b-hide'); await wait(p, 80);
  await p.tap('#world'); await wait(p, 80);
  const t3 = await S(p);
  ok(!(await p.evaluate(() => document.querySelector('#ui .dlg').classList.contains('seq-hidden'))) && t3.n === t2.n, 'touch: with the text hidden, a tap on the picture brings it back (and moves nothing on)');
  // skip: asked, then it stops at the choice and chooses nothing
  await p.evaluate(() => { document.querySelector('#ui .dlg .seq-ctrl').classList.add('open'); });
  await p.tap('#ui .dlg .b-sskip'); await wait(p, 120);
  await p.tap('.csheet button:has-text("Skip scene")');
  await p.waitForFunction(() => !!document.querySelector('.choices:not(.hidden) .choice'), null, { timeout: 6000 });
  await wait(p, 1200);
  const c1 = await S(p);
  ok(c1.choices && c1.seq && !c1.seq.skip && !/after/.test(c1.en || ''), 'a skip stops at a choice: the replies wait, nothing is chosen');
  await p.tap('.choices .choice'); await wait(p, 200);
  ok(/after/.test((await S(p)).en || ''), 'the reply you choose goes on as usual');
  ok(!errors.length, 'no page errors ' + errors.slice(0, 2).join(' | '));
  await ctx.close();
}
{
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 720 } });
  await start(p, 'test.seq_shake', { reduce: true });
  await settled(p);
  const r0 = await S(p);
  ok(r0.seq.state === 'holding' && r0.seq.k === 1, 'reduced motion: after the dissolve the shot is at its end state at once (' + r0.seq.state + ', k ' + r0.seq.k + ')');
  let shook = false;
  await p.evaluate(() => { window.__shook = false; new MutationObserver(() => { if (document.getElementById('world').classList.contains('shake')) window.__shook = true; }).observe(document.getElementById('world'), { attributes: true }); });
  await p.evaluate(() => { RB.game.settings.reducedMotion = false; RB.game.applySettings(); });
  await clickNext(p); await wait(p, 600);
  shook = await p.evaluate(() => window.__shook);
  ok(!shook, 'a !shake inside a sequence never shakes the screen (even with motion on)');
  ok(!errors.length, 'no page errors ' + errors.slice(0, 2).join(' | '));
  await ctx.close();
}

// ---- 4. the prologue's controls ----------------------------------------------------------------------------------
{
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 720 } });
  await p.click('text=New Game');
  await p.click('.slot[data-slot="1"] [data-a=start]');
  await waitSel(p, '.cr-prologue .slip');
  const V = () => p.evaluate(() => Object.assign(RB.sequence.viewState() || {}, { cap: document.querySelector('.cr-prologue .txt').textContent, confirm: !!document.querySelector('.csheet'), on: !!document.querySelector('.cr-prologue') }));
  await p.keyboard.press('Escape'); await wait(p, 120);
  ok((await V()).confirm, 'prologue: Escape asks before skipping (it used to skip at once)');
  await p.keyboard.press('Escape'); await wait(p, 120);
  const v0 = await V();
  ok(!v0.confirm && v0.on && v0.i === 0, 'prologue: Escape on the question keeps watching');
  await p.waitForFunction(() => RB.sequence.viewState().state !== 'entering');
  await p.click('.cr-prologue [data-a=next]');
  await p.waitForFunction(() => RB.sequence.viewState().state !== 'entering');
  const v1 = await V();
  await p.click('.cr-prologue [data-a=prev]'); await wait(p, 60);
  const v2 = await V();
  ok(v2.review === 0 && /lantern roads/.test(v2.cap) && v2.i === 1, 'prologue: Previous shows the first caption again (looking back)');
  await p.click('.cr-prologue [data-a=next]'); await wait(p, 60);
  const v3 = await V();
  ok(v3.review === -1 && v3.cap === v1.cap && v3.i === 1, 'prologue: Next returns to where you were, without moving on');
  await p.click('.cr-prologue [data-a=hide]'); await wait(p, 60);
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('.cr-prologue .slip')).visibility === 'hidden'), 'prologue: Hide text hides the caption slip (the controls stay)');
  await p.click('.cr-prologue [data-a=hide]');
  // on the lantern (its name leaving it is the shot's action), once it has played: Replay plays it again
  for (let i = 0; i < 2; i++) { await p.waitForFunction(() => RB.sequence.viewState().state !== 'entering'); await p.click('.cr-prologue [data-a=next]'); }
  await p.waitForFunction(() => RB.sequence.viewState().shot === 'lantern' && RB.sequence.viewState().state === 'holding', null, { timeout: 9000 });
  await p.click('.cr-prologue [data-a=replay]'); await wait(p, 40);
  const rp = await V();
  ok(rp.replaying && rp.k < 0.5 && rp.i === 3, 'prologue: Replay shot plays the shot\'s action again (the lantern\'s name, k ' + (rp.k || 0).toFixed(2) + ')');
  // seen through before on this device: Skip prologue no longer asks
  await p.evaluate(() => { RB.game.settings.prologueSeen = true; });
  await p.click('.cr-prologue [data-a=skip]');
  await waitSel(p, '.folio-create #nm', { timeout: 5000 });
  ok(!(await p.evaluate(() => !!document.querySelector('.csheet'))), 'prologue: seen through before, Skip prologue goes straight to creation');
  ok(!errors.length, 'no page errors ' + errors.slice(0, 2).join(' | '));
  await ctx.close();
}

// ---- 5. the focal area of every shot stays above the sheet, at three screen shapes ------------------------------------
for (const [tag, vp, dpr] of [['1280x720', { width: 1280, height: 720 }, 1], ['390x844', { width: 390, height: 844 }, 3], ['844x390', { width: 844, height: 390 }, 3]]) {
  const { p, ctx } = await page(b, url, { viewport: vp, dpr, mobile: dpr > 1, touch: dpr > 1 });
  await start(p, 'rw.bridge_scene');
  await settled(p);
  const r = await p.evaluate(() => {
    const vs = RB.render.viewSize(), w = Math.round(vs.w * 2), h = Math.round(vs.h * 2);
    const a = document.getElementById('world').getBoundingClientRect(), s = document.querySelector('#ui > .dlg').getBoundingClientRect();
    const vb = Math.round(((s.top - a.top) * h) / a.height);
    const out = [];
    const cast = RB.sequence.state().cast;
    for (const id of ['ch1.bridge', 'ch2.notice', 'ch2.plate']) {
      const def = RB.sequence.get(id);
      for (const shot of Object.keys(def.shots)) {
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const st = RB.sequence.drawAt(c.getContext('2d'), w, h, { seq: id, shot, phase: def.shots[shot].phases[def.shots[shot].phases.length - 1].id, k: 1, vb, cast: { pc: RB.equip.look(RB.game.s), comp: cast.comp ? { id: cast.comp, look: RB.content.chars[cast.comp].look } : null } });
        const f = st && st.focusRect;
        out.push({ id: id + '/' + shot, f, ok: !!f && f.y >= -2 && f.y + f.h <= vb + 4 && f.x >= -4 && f.x + f.w <= w + 4 });
      }
    }
    return { w, h, vb, out };
  });
  const bad = r.out.filter((x) => !x.ok);
  ok(!bad.length, tag + ': every shot\'s focal area sits above the sheet (buffer ' + r.w + '×' + r.h + ', sheet top ' + r.vb + ')' + (bad.length ? ' ' + JSON.stringify(bad.slice(0, 3)) : ''));
  await ctx.close();
}

// ---- 5b. a kept memory and its read-only replay (Company › Shared memories) ----------------------------------------------
{
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 720 } });
  await start(p, 'sg.asahi_name');
  for (let i = 0; i < 30 && !(await p.evaluate(() => window.__done)); i++) { await settled(p).catch(() => {}); await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance()); await wait(p, 150); }
  const mem = await p.evaluate(() => (RB.game.s.company.memories || []).find((m) => m.id === 'seq:ch2.plate') || null);
  ok(mem && mem.kind === 'together' && mem.ref && mem.ref.kind === 'seq' && mem.ref.beats.length === 5 && mem.comp === 'suzu' && JSON.stringify(mem).length < 2500, 'the moment is kept as a Shared memory (the beats seen and the look of the moment, ' + (mem ? JSON.stringify(mem).length : 0) + ' bytes; no picture)');
  const before = await campaign(p);
  await p.evaluate(() => RB.ui.menu.open('memories'));
  await waitSel(p, '[data-co-ref="seq"]', { timeout: 5000 });
  await p.click('[data-co-ref="seq"]');
  await waitSel(p, '.seq-view .slip', { timeout: 5000 });
  const r0 = await p.evaluate(() => ({ v: RB.sequence.viewState(), cap: document.querySelector('.seq-view .txt').textContent, menu: !!document.querySelector('.folio-scrim, .folio') && !!document.querySelector('.co-page') }));
  ok(r0.v && r0.v.seq === 'ch2.plate' && r0.v.n === 5 && /registry card/.test(r0.cap) && !r0.menu, 'Watch it again: the folio steps aside and the same beats play again from the first');
  for (let i = 0; i < 4; i++) { await p.waitForFunction(() => RB.sequence.viewState() && RB.sequence.viewState().state !== 'entering'); await p.click('.seq-view [data-a=next]'); }
  const r1 = await p.evaluate(() => ({ v: RB.sequence.viewState(), cap: document.querySelector('.seq-view .txt').textContent }));
  ok(r1.v.i === 4 && r1.v.shot === 'done' && /Take it to Fuku/.test(r1.cap), 'the replay walks the kept beats, shot by shot, to the end');
  await p.keyboard.press('Escape');
  await waitSel(p, '.co-page', { timeout: 5000 });
  const vs1 = await p.evaluate(() => ({ v: RB.sequence.viewState(), top: RB.ui.topLayer() && RB.ui.topLayer().name, view: !!document.querySelector('.seq-view') }));
  ok(!vs1.v && !vs1.view, 'Escape closes the replay and the memories page comes back ' + JSON.stringify(vs1));
  ok((await campaign(p)) === before, 'the replay changed nothing in the campaign (flags, items, quests, Company, learning, seen record)');
  ok(!errors.length, 'no page errors ' + errors.slice(0, 2).join(' | '));
  await ctx.close();
}

// ---- 6. cycles: listeners, timers, layers and caches stay bounded ------------------------------------------------------
{
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 720 } });
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Performance.enable');
  const rows = [];
  for (let k = 0; k < CYCLES; k++) {
    await start(p, 'test.seq_cycle', { reduce: k % 3 === 2 });
    // a few presses, one Previous, one Replay, then through to the end
    await p.click('#ui .dlg .b-prev').catch(() => {});
    await p.evaluate(() => { const d = RB.ui.dialogue; for (let i = 0; i < 12 && d.isOpen(); i++) d.advance(true); });
    for (let i = 0; i < 10 && !(await p.evaluate(() => window.__done)); i++) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await wait(p, 40); }
    await p.waitForFunction(() => window.__done === true, null, { timeout: 8000 });
    await wait(p, 450);
    await cdp.send('HeapProfiler.collectGarbage').catch(() => {});
    const m = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((x) => [x.name, x.value]));
    const st = await p.evaluate(() => { const S = RB.sequence.stats(); return { live: S.live, listeners: S.listeners, timers: S.timers, overlays: S.overlays, layers: S.kit.layers, sprites: S.kit.sprites, ctrl: document.querySelectorAll('.seq-ctrl').length, out: document.querySelectorAll('.seq-out').length, begun: S.begun, ended: S.ended }; });
    rows.push(Object.assign({ k: k + 1, jsl: m.JSEventListeners, nodes: m.Nodes }, st));
  }
  // and the prologue's player, opened and left six times
  for (let k = 0; k < 6; k++) {
    await p.evaluate(() => { RB.sequence.view({ seq: 'prologue', beats: [{ shot: 'road', line: { jp: 'みち', en: 'a' } }, { shot: 'lantern', line: { jp: 'あかり', en: 'b' } }], seen: () => true, skip: { label: 'Skip' } }); });
    await wait(p, 300);
    await p.click('.seq-view [data-a=skip]');
    await wait(p, 200);
  }
  const vst = await p.evaluate(() => { const S = RB.sequence.stats(); return { view: S.view, listeners: S.listeners, timers: S.timers, nodes: document.querySelectorAll('.seq-view').length }; });
  // a campaign change in the middle of a sequence (Return to title): it is disposed with everything it owns
  await start(p, 'test.seq_cycle');
  await settled(p);
  await p.evaluate(async () => { await RB.game.toTitle(); });
  await wait(p, 400);
  const tt = await p.evaluate(() => { const S = RB.sequence.stats(); return { active: RB.sequence.active(), listeners: S.listeners, timers: S.timers, ctrl: document.querySelectorAll('.seq-ctrl').length, title: !!document.querySelector('.title, .ttl, [class*="title"]'), mode: RB.game.mode() }; });
  ok(!tt.active && tt.listeners === 0 && tt.timers === 0 && tt.ctrl === 0 && tt.mode === 'title', 'Return to title mid-sequence: the sequence is gone with its controls and listeners; the title is back ' + JSON.stringify(tt));
  const a = rows[Math.min(4, rows.length - 1)], z = rows[rows.length - 1];
  console.log('     cycles ' + rows.length + ': JS listeners ' + a.jsl + ' → ' + z.jsl + ', nodes ' + a.nodes + ' → ' + z.nodes + ', sprite cache ' + z.sprites + ', begun ' + z.begun + ' ended ' + z.ended);
  ok(rows.every((r) => r.live === 0 && r.listeners === 0 && r.timers === 0 && r.overlays === 0 && r.ctrl === 0 && r.out === 0 && r.layers === 0), 'after every cycle: no sequence, listener, timer, dissolve overlay, control row or cached layer of the player is left ' + JSON.stringify(rows.find((r) => r.live || r.listeners || r.timers || r.overlays || r.ctrl || r.out || r.layers) || {}));
  ok(z.begun === CYCLES && z.ended === CYCLES, 'each cycle began and ended its sequence once (' + z.begun + '/' + z.ended + ')');
  ok(z.jsl - a.jsl <= 10 && z.nodes - a.nodes <= 60, 'page-wide counters stay flat from cycle 5 on: listeners ' + a.jsl + ' → ' + z.jsl + ', nodes ' + a.nodes + ' → ' + z.nodes);
  ok(vst.view === 0 && vst.listeners === 0 && vst.timers === 0 && vst.nodes === 0, 'six prologue-player views opened and closed: nothing left ' + JSON.stringify(vst));
  ok(!errors.length, 'no page errors ' + errors.slice(0, 2).join(' | '));
  await ctx.close();
}

await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
