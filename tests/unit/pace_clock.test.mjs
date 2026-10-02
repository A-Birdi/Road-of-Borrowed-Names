// Fishing pace: the active-entry clock (Practice addendum §7.2, §7.3, §23.3), with
// an injected fake monotonic clock. Covers active-time accumulation, nested pause
// reasons, the deadline exactly on the boundary, a submission just before it,
// evaluation finishing after it, pointer cancellation (an interruption) versus
// processing, in-progress input at expiry (soft: frozen, then untimed), hidden
// tabs, resize, consent to resume, conversion to untimed and a reported misread.
// The interface-level parts (the pad's stroke lifecycle, IME composition, the
// deferred expiry sheet) run in the browser: tests/e2e/pace.mjs.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine'], { __RB_TEST__: true });
  const C = RB.paceCore;
  let T = 0;
  const now = () => T;
  const at = (ms) => { T = ms; };
  const mk = (budgetMs, o) => C.clock(Object.assign({ now, budgetMs }, o || {}));

  // ---- before Ready nothing runs ------------------------------------------------------------
  at(0);
  let c = mk(10000);
  at(5000);
  t.eq([c.state(), c.active()], ['ready', 0], 'before Ready: no time accumulates (reading is free)');
  c.pause('help'); c.release('help');
  t.ok(!c.hold, 'a pause before Ready does not ask for a continuation (Ready is the explicit start)');

  // ---- active-time accumulation -------------------------------------------------------------
  at(1000); c = mk(10000);
  c.start();
  at(2500);
  t.eq(c.active(), 1500, 'running: active time accumulates from Ready');
  c.pause('help');
  at(9000);
  t.eq([c.active(), c.state()], [1500, 'paused'], 'word help stops it');
  c.release('help');
  at(12000);
  t.eq([c.active(), c.state(), c.hold], [1500, 'paused', true], 'closing help does not restart it: an explicit continuation is required');
  t.ok(c.resume(), 'Continue resumes');
  at(12400);
  t.eq(c.active(), 1900, 'and time accumulates again from the continuation only');
  t.eq(c.snapshot().pauseReasons, { help: 1 }, 'the pause reason is recorded');

  // ---- nested pause reasons ------------------------------------------------------------------
  at(0); c = mk(60000); c.start();
  at(100); c.pause('help');
  at(150); c.pause('hidden');
  at(200); c.release('help');
  t.eq([c.state(), c.reasons()], ['paused', ['hidden']], 'two reasons nest: releasing one keeps the other');
  at(300); c.resume();
  t.ok(!c.running(), 'Continue while the tab is still hidden does not start it');
  at(400); c.release('hidden');
  t.ok(!c.running() && c.hold, 'back from the hidden tab: still waiting for consent');
  at(500); c.resume();
  at(700);
  t.eq(c.active(), 300, 'only the running stretches count (100 + 200)');
  c.pause('modal'); c.pause('modal'); c.release('modal');
  t.ok(c.has('modal'), 'the same reason held twice needs two releases');
  c.release('modal'); c.resume();
  t.ok(c.running(), 'and then it can continue');

  // ---- processing-only exclusions: silent, counted once -------------------------------------
  at(0); c = mk(60000); c.start();
  at(1000); c.pause('processing');
  at(1040); c.release('processing');
  t.ok(c.running() && !c.hold, 'a processing-only exclusion restores the run silently');
  at(2000);
  t.eq(c.active(), 1960, 'its 40 ms are subtracted once');
  c.pause('help');
  at(2100); c.pause('processing');
  at(2150); c.release('processing');
  at(2300); c.release('help'); c.resume();
  at(2400);
  t.eq(c.active(), 2060, 'processing inside a help pause is not subtracted twice (no overlapping credit)');

  // ---- expiry exactly on the boundary --------------------------------------------------------
  at(0); c = mk(1000); c.start();
  at(999); c.tick();
  t.eq([c.state(), c.expired], ['running', false], '1 ms before the budget: still running');
  at(1000); c.tick();
  t.eq([c.state(), c.expired, c.snapshot().expiredAt], ['expired', true, 1000], 'activeEntryMs >= budgetMs expires exactly on the boundary');
  at(5000);
  t.eq(c.active(), 1000, 'at expiry the pace is frozen');
  t.ok(!c.resume(), 'Continue cannot restart an expired pace');
  t.ok(c.continueUntimed() && !c.timed() && c.converted === 'expired', 'Continue untimed: the same attempt goes on untimed');
  at(6000);
  t.eq(c.active(), 2000, 'and its active time is still measured (records only)');
  c.tick();
  t.eq(c.state(), 'running', 'an untimed attempt never expires again');
  const s1 = c.submit();
  t.eq([s1.onTime, c.expired], [null, true], 'a later submission is untimed; the attempt stays marked expired');

  // ---- a submission just before the deadline; evaluation after it ----------------------------
  at(0); c = mk(1000); c.start();
  at(999);
  const st = c.submit();
  t.eq([st.onTime, st.activeMs], [true, 999], 'submitted at 999 of 1000 ms: on time');
  at(1600); c.tick();
  t.eq([c.expired, c.state()], [false, 'paused'], 'evaluation running past the deadline cannot expire it (processing is excluded)');
  c.release('evaluating'); c.finish();
  t.eq([c.snapshot().lastSubmit.onTime, c.active()], [true, 999], 'the recorded order holds after evaluation finishes late');
  at(0); c = mk(1000); c.start();
  at(1000);
  t.eq(c.submit().onTime, false, 'a submission exactly at the deadline is not on time');

  // ---- interruptions: pointer cancellation, resize ---------------------------------------------
  at(0); c = mk(30000); c.start();
  at(500); c.interrupt('pointer-cancel');
  at(4000);
  t.eq([c.active(), c.hold, c.snapshot().pauseReasons['pointer-cancel']], [500, true, 1], 'an unexpected pointer cancellation stops it until Continue');
  c.resume(); at(4500); c.interrupt('layout');
  at(9000);
  t.eq([c.active(), c.state()], [1000, 'paused'], 'a layout or orientation change stops it until Continue');
  c.resume(); at(9500);
  t.eq(c.active(), 1500, 'continuing after the resize');

  // ---- hidden tab -------------------------------------------------------------------------------
  at(0); c = mk(30000); c.start();
  at(2000); c.pause('hidden');
  at(60000);
  t.ok(!c.expired && c.active() === 2000, 'a hidden tab never runs the pace down (60 s away, 2 s used)');
  c.release('hidden');
  at(61000); c.tick();
  t.eq([c.active(), c.hold], [2000, true], 'coming back does not restart it on its own');

  // ---- the player's own pause states --------------------------------------------------------------
  at(0); c = mk(30000); c.start();
  at(100); c.pause('candidate-review');
  at(900); c.resume();
  at(1000);
  t.eq(c.active(), 200, '"Confirm character & continue" ends a candidate review in one action');
  c.pause('recognition-repair');
  at(5000); c.pause('help'); c.resume();
  t.ok(!c.running() && c.has('help') && !c.has('recognition-repair'), 'continuing leaves repair, but help still open keeps it stopped');

  // ---- convert to untimed; a reported misread costs nothing ---------------------------------------
  at(0); c = mk(5000); c.start();
  at(1000); c.submit(); c.release('evaluating');
  t.ok(c.convert('content-correction') && !c.timed(), 'a confirmed content error: continue the same catch untimed');
  t.ok(c.unconvert('content-correction') && c.timed() && c.has('recognition-repair') && c.hold, 'reported as a misread instead: the pace comes back, stopped for repair');
  at(9000); c.resume(); at(9500);
  t.eq([c.active(), c.expired], [1500, false], 'the repair time is not charged');
  at(0); c = mk(5000); c.start(); at(100);
  t.ok(c.convert('player') && !c.timed(), 'the player can always make the attempt untimed');
  at(20000); c.tick();
  t.ok(!c.expired && c.snapshot().converted === 'player', 'and it can no longer expire');
  t.ok(!c.unconvert('content-correction'), 'a player conversion is not undone by a misread report');

  // ---- untimed measuring (Off, or Gentle/Brisk still being prepared) -------------------------------
  at(0); c = mk(null, { consent: false }); c.start();
  at(1000); c.pause('help');
  at(3000); c.release('help');
  t.ok(c.running() && !c.hold, 'untimed measuring needs no Continue (there is no clock to restart unexpectedly)');
  at(3500);
  t.eq(c.active(), 1500, 'but still leaves help time out of the measurement');
  c.tick();
  t.ok(!c.expired && c.remaining() === null, 'untimed: no deadline');

  // ---- no other clock: only RB.pace.attempt creates one ---------------------------------------------
  const before = C.created();
  mk(1000);
  t.eq(C.created(), before + 1, 'every clock is counted (the browser test proves ordinary challenges create none)');
};
