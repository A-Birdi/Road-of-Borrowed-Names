/* Fishing pace (Practice addendum §7): the optional response-entry clock.
 *
 * PROVISIONAL (foundation): untimed only. attempt() runs the step through the
 * ordinary challenge runner with nothing recorded to mastery (the caller's
 * RB.practice.objectives adapter decides), and reports paced: { kind: 'off' }.
 * The full implementation keeps this contract:
 *
 *   RB.pace.attempt(step, o) -> Promise<result>
 *     o: { pace: 'off'|'gentle'|'brisk'|'custom', budgetSec?, header?, ctxTag?, representation?,
 *          session? }   (the clock starts only on Ready, after the task is shown)
 *     result: the runStep result + paced: { kind, budgetMs, activeMs, expired,
 *          pauseReasons, inputMode, pointerClass, representation, recognitionRepair,
 *          assistance, convertedToUntimed, onTime }
 *   RB.pace.budgets(s, ctx) -> { gentle, brisk, samples, needed, reason }
 *   RB.pace.available(s, ctx) -> bool     a pace other than Off can be offered */
RB.pace = (function () {
  'use strict';
  async function attempt(step, o) {
    o = o || {};
    const res = await RB.challenge.runStep(step, Object.assign({ noRecord: true, allowCancel: true }, o.runOpts || {}, { header: o.header, ctxTag: o.ctxTag || 'fishing' }));
    res.paced = { kind: 'off', budgetMs: null, activeMs: null, expired: false, pauseReasons: [], inputMode: res.mode || null, pointerClass: null, representation: o.representation || null, recognitionRepair: false, assistance: !!res.assisted, convertedToUntimed: false, onTime: null, provisional: true };
    return res;
  }
  const budgets = () => ({ gentle: null, brisk: null, samples: 0, needed: 12, reason: 'provisional' });
  return { attempt, budgets, available: () => false, provisional: true };
})();
