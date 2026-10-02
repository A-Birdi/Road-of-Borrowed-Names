/* The one foreground activity session (Practice addendum §3). Fishing,
 * shiritori, the lamps, the writing desk, letters, the proofreader's tray and
 * the comparisons all start, run and end through here, so exactly one owns the
 * screen at a time and every way out returns the game to a valid state.
 *
 *   RB.activity.register(kind, def)   def: { title:{en,jp},
 *        eligible(s, ctx) -> { ok, why },     checked again at the moment of launch
 *        run(session) -> Promise<result>,     the activity's own UI and rules
 *        dispose?(session) }                  tear down overlays/workers/timers
 *   RB.activity.launch(kind, ctx) -> Promise<{ ok, why?, result? }>
 *        ctx: { source: 'company'|'companion-talk'|'world-prop'|'words', returnView? }
 *   RB.activity.active()              the current session or null
 *   RB.activity.eligible(kind, ctx)   { ok, why } without launching
 *
 * A session: { id, kind, ctx, state, campaignId, companionId, mapId, alive(),
 *   set(state), result }. States: eligible → preparing → active → resolving →
 *   result → (preparing again | exiting), or suspended / converted-to-untimed /
 *   abandoned. alive() is false once the campaign changes or the session ended:
 *   an asynchronous callback must check it before writing anything.
 *
 * While a session runs the game is in mode 'activity': the world (movement,
 * wandering people, patrols, triggers) is paused under it. Ending it briefly
 * holds input so the closing click or key cannot also walk, talk or start
 * another session. Events: activity:session-start, activity:session-resolved
 * { kind, id, result }. Never discovery:resolved (that one awards bond). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.activity = (function () {
  'use strict';
  const DEFS = {};
  let cur = null;
  let lastEnd = -1e9;
  const STATES = ['eligible', 'preparing', 'active', 'resolving', 'result', 'suspended', 'converted-to-untimed', 'abandoned', 'exiting'];

  function register(kind, def) { DEFS[kind] = def; }
  const game = () => RB.game && RB.game.s;

  // world safety shared by every activity: the companionship module's check when present
  function safe() {
    if (RB.company && RB.company.safeHere) return RB.company.safeHere();
    return { ok: RB.game.mode() === 'world' };
  }
  function eligible(kind, ctx) {
    const def = DEFS[kind], s = game();
    if (!def) return { ok: false, why: 'unknown' };
    if (!s) return { ok: false, why: 'Not in a campaign.' };
    if (cur) return { ok: false, why: 'Something else is already open.' };
    if (RB.script && RB.script.isRunning && RB.script.isRunning()) return { ok: false, why: 'Not in the middle of a scene.' };
    try { return def.eligible ? def.eligible(s, ctx || {}) || { ok: false, why: 'Not here.' } : { ok: true }; }
    catch (e) { return { ok: false, why: 'Not here.' }; }
  }

  async function launch(kind, ctx) {
    ctx = Object.assign({ source: 'world-prop' }, ctx || {});
    const s = game();
    // menus may have been open while deciding: the folio is closed before play
    const menuOpen = RB.ui && RB.ui.menu && RB.ui.menu.isOpen && RB.ui.menu.isOpen();
    if (menuOpen && !ctx.returnView) ctx.returnView = { page: RB.ui.menu.current(), scroll: scrollNow() };
    if (menuOpen) RB.ui.menu.close();
    // checked again now, atomically: reading the Ledger reserves nothing (§3.2)
    const el = eligible(kind, ctx);
    if (!el.ok) return { ok: false, why: el.why };
    const def = DEFS[kind];
    const session = {
      id: RB.practice.seq(s), kind, ctx, state: 'preparing', result: null,
      campaignId: s.id, companionId: s.comp || null, mapId: s.map,
      _dead: false,
      alive() { return !this._dead && cur === this && game() && game().id === this.campaignId; },
      set(st) { if (STATES.indexOf(st) < 0) throw new Error('activity state ' + st); if (!this._dead) this.state = st; },
    };
    cur = session;
    RB.game.pushMode('activity');
    RB.input && RB.input.clearHeld && RB.input.clearHeld();
    RB.bus.emit('activity:session-start', { kind, id: session.id, source: ctx.source });
    let result = null;
    try {
      result = await def.run(session);
    } catch (e) {
      console.error('activity ' + kind, e);
      result = { abandoned: true, error: String(e && e.message || e) };
    }
    if (session._dead) return { ok: false, why: 'The campaign changed.' };
    finish(session, result);
    return { ok: true, result };
  }

  function scrollNow() {
    const pg = typeof document !== 'undefined' && document.querySelector('#folio-page');
    return pg ? pg.scrollTop : 0;
  }

  function finish(session, result) {
    session.result = result;
    session.set('exiting');
    session._dead = true;
    try { if (DEFS[session.kind].dispose) DEFS[session.kind].dispose(session); } catch (e) { console.error(e); }
    cur = null;
    lastEnd = typeof performance !== 'undefined' ? performance.now() : Date.now();
    RB.game.popMode('activity');
    // hold input for a moment: the click/key that closed the activity does nothing else
    RB.game.pushMode('activity-exit');
    RB.input && RB.input.clearHeld && RB.input.clearHeld();
    setTimeout(() => { RB.game.popMode('activity-exit'); RB.input && RB.input.clearHeld && RB.input.clearHeld(); reopen(session); }, 220);
    RB.bus.emit('activity:session-resolved', { kind: session.kind, id: session.id, result });
  }
  // back to the page it was opened from, only when the world is safe to show it over
  function reopen(session) {
    const rv = session.ctx && session.ctx.returnView;
    if (!rv || !rv.page || !game() || game().id !== session.campaignId) return;
    if (RB.game.mode() !== 'world' || !safe().ok) return;
    try {
      RB.ui.menu.open(rv.page);
      if (rv.scroll) setTimeout(() => { const pg = document.querySelector('#folio-page'); if (pg) pg.scrollTop = rv.scroll; }, 0);
    } catch (e) { /* the page may have gone: the world is a valid place to be */ }
  }

  // a campaign change (load, new game, title, debug start) disposes the old session first (§3.5)
  function disposeAll() {
    const s0 = cur;
    if (!s0) return;
    s0._dead = true;
    s0.state = 'abandoned';
    try { if (DEFS[s0.kind].dispose) DEFS[s0.kind].dispose(s0); } catch (e) { console.error(e); }
    cur = null;
    RB.game.popMode('activity');
    RB.game.popMode('activity-exit');
  }
  if (RB.bus) RB.bus.on('campaign:changing', disposeAll);

  return {
    register, launch, eligible, safe, STATES,
    active: () => cur,
    kinds: () => Object.keys(DEFS),
    sinceEnd: () => (typeof performance !== 'undefined' ? performance.now() : Date.now()) - lastEnd,
    _dispose: disposeAll,
  };
})();
