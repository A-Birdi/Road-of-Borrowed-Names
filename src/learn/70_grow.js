/* Growth offered, never imposed: the Grow route (expansion L18; Robin [R0, R1]; docs/future/plan/05_LANGUAGE.md).
 * A task can be offered one level up: "This one uses a form you haven't learned yet. It will teach it first. Try it?"
 * Accepting teaches before relying (each step's teaching card first), then runs that level's version; it is recorded as
 * stretch evidence (place "stretch") and never changes the campaign's level. Declining returns the player to where
 * they were, with no record of it at all. For Advanced, growth is nuance, genres and other perspectives, written as a
 * task's own `stretchA` steps: never an invented level above Advanced.
 *   RB.grow.next(profile)            the level one up, or 'A+' (Advanced's own stretch), or null
 *   RB.grow.stepsFor(ch, profile)    that level's steps for a challenge, or null when it has none
 *   RB.grow.offer(id, o)             asks, then runs it; { declined } | { ok, results } | { cancelled } */
var RB = (globalThis.RB = globalThis.RB || {});

RB.grow = (function () {
  'use strict';
  const UP = { F: 'E', E: 'I', I: 'A', A: 'A+' };
  const next = (p) => UP[p] || null;
  function stepsFor(ch, p) {
    const n = next(p);
    if (!ch || !n) return null;
    if (n === 'A+') return ch.stretchA ? ch.stretchA.map((st) => RB.tasks.prepare(st)) : null;
    return ch.tiers && ch.tiers[n] ? RB.tasks.stepsOf(ch, { profile: n }) : null;
  }
  async function offer(id, o) {
    o = o || {};
    const ch = RB.content.challenges[id];
    const s = RB.game.s;
    if (!ch || !s) return { declined: true };
    const steps = stepsFor(ch, s.learn.profile);
    if (!steps || !steps.length) return { declined: true };
    const ask = 'This one uses a form you haven\'t learned yet. It will teach it first. Try it?';
    const pick = RB.test && RB.test.auto ? (o.accept === false ? 1 : 0) : await RB.ui.confirm(ask, ['Try it', 'Not now']);
    if (pick !== 0) return { declined: true };
    const results = [];
    for (const st of steps) {
      if (st.teach && RB.challenge.teachCard) await RB.challenge.teachCard(st.teach);
      const r = await RB.challenge.runStep(st, { ctxTag: 'stretch:' + id, cancelLabel: 'Back for now' });
      if (r.cancelled) return { cancelled: true, results };
      results.push(r);
    }
    return { ok: true, results };
  }
  return { next, stepsFor, offer };
})();
