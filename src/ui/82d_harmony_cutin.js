/* Harmony portrait flourish — the paired cut-in (Harmony addendum §5, §7, §8, §20.2–§20.3).
 *
 * When a real, legal, committed Harmony technique reaches its own animation interval, the choreography
 * (src/ui/84p_party_choreo.js) places ONE `cutin` cue at the technique's start — one per technique, whatever
 * the number of targets, and only with a committed companion. The battle sequencer (src/ui/82_battle_seq.js)
 * fires it on its presentation clock (never in Instant playback, never while an exchange is being skipped),
 * advances it every frame on that same clock, and disposes it whenever it settles a sequence (Skip, a hidden
 * tab, the watchdog, an overlap, the scene's exit). Nothing here reads or changes a rule: the cue carries the
 * companion and the action; the stage performance below it is identical with the portrait shown or not.
 * It is never started by meter fill, hover, selection, preview, recognition or a menu — there is no other
 * entry point.
 *
 * Lifecycle (one instance at a time, each with its own token):
 *   inactive → entering → holding → fading → disposed
 *   Timing (Robin's decision, 2026-10-05; RB.battleSeq.T.cutin in presentation ms, RB.harmonyContract.SEGMENTS in
 *   wall ms): Normal slides in from beyond the left edge 0–220 ms (ease-out, overshooting 3 art px to the right),
 *   holds 220–1,040 (the art's 'enter' drawing resolves into its 'hold' gesture once; painted art plays its seven-state
 *   timeline) with a small motion — it settles back from the overshoot, leans 2.5 art px left as the peak lands, drifts
 *   1.5 left (MOTION) — and fades in place 1,040–1,400 as the drift ends; the layer is removed at zero. Fast plays what
 *   Normal played before: 180 / 380 / 220 ms of wall time (257 / 543 / 315 presentation ms on its ×1.43 clock), the
 *   plain slide and fade, no motion. The technique's stage waits for it (src/ui/84p_party_choreo.js: its first result
 *   comes ≥ 120 presentation ms after the portrait is gone; the cue carries that moment as `first`). Reduced motion: a
 *   short fade in where it stands (no travel, no motion), the held drawing, the same smooth fade out — with painted art
 *   (contract v3) two held poses instead of one: `peak`, then `settle_b`, joined by one restrained cross-fade
 *   (RB.harmonyContract.REDUCED_MOTION: 100 presentation ms at the middle of the mode's hold). Instant, or the setting
 *   "Harmony portrait flourish" Off: nothing (and the choreography places no cue). Hurried playback (×4) runs the same
 *   ramps and the same motion faster. An older instance's callbacks can never touch a newer one (every path checks
 *   the token).
 *
 * Placement (§5.2–§5.4), measured every time from the live layout (CSS px):
 *   protected: the Resolve/Harmony dock (.cb-party), the action banner, the telegraph and the response dock
 *   unless Adaptive has withdrawn them (Keep visible: they count as occupied; withdrawn, their region is free,
 *   but the portrait stays unseen until they have actually left it — they leave on a 200 ms CSS transition of
 *   wall time, the entrance runs on the presentation clock — and then makes its whole entrance), the creatures' plates and
 *   badges, each creature's silhouette with its knots (the impact destination), the on-field party, Skip,
 *   the battle's Settings button, an open intent card — each kept 12 px clear, tested against the composition's own visible rows (its
 *   transparent corners are not footprint; its hands, glow and backing are), each row widened by the motion's reach at
 *   Normal (ENVELOPE: 3 art px × the scale to the right, the overshoot, and to the left, the lean and drift) so the
 *   motion never brings it nearer than 12 px; a placement that fits only without that reach gives way to the next
 *   candidate. A dialogue, the language task,
 *   word help or another reading layer means no cut-in starts (and an open one is removed at once).
 *   Candidates: the standard pair in the left-middle space (at RB.harmonyArt.fitScale); the same moved
 *   up or down on the left; the authored compact pair (with its backing, then without backing and
 *   effects, then at smaller scales while faces stay ≥ 24 px). They are tried in the order of the face size
 *   each gives at its own fitted scale (each variant inside its own footprint limits), larger first, that list's
 *   order breaking ties — so 1366–1600 px desktops get the compact pair at 2× where it fits (faces ~100 CSS px) rather than the
 *   standard at 1×, a tall tablet the compact pair (§5.4's narrow-screen case), and views where both give the
 *   same faces the standard pair. If none can be placed: no portrait for this action — recorded in
 *   stats().fallbacks. The composition always enters from the left edge it bleeds from. It never moves the dock, menus, creatures, camera or backdrop.
 *   On resize or orientation change the same instance is placed again (no replay, nothing spent again); if
 *   no placement remains it fades out quickly and the stage action continues.
 *
 * Sizes come only from RB.harmonyArt (NATIVE, fitScale, footprint, the composed canvas's own width and height) and
 * the art's phase list is data (PHASES): the busts may be replaced by other art behind the same API. Painted art is
 * scaled by its visible footprint (RB.harmonyArt.footprint: the union of the pairing's drawn pixels across its whole
 * timeline), so the scale is fixed for the performance and the protected-region rules below apply unchanged.
 *
 * API
 *   RB.harmonyCutin.start(cue, atPt, rec) → token | null      (the sequencer only)
 *   RB.harmonyCutin.frame(pt)                                 (the sequencer's clock, every frame)
 *   RB.harmonyCutin.dispose(why) → boolean
 *   RB.harmonyCutin.plays(), duration([mode])   (the choreography: can a portrait play now — the setting On and the
 *                                               playback not Instant — and its length in presentation ms; 0 when not)
 *   RB.harmonyCutin.enabled(), place(o), state(), stats(), last(), reset()   (tests, the dev viewer) */
var RB = (globalThis.RB = globalThis.RB || {});

RB.harmonyCutin = (function () {
  'use strict';
  const SEP = 12;
  const COMPS = ['nao', 'mio', 'ren', 'suzu'];
  const LOG_CAP = 24, TRACE_CAP = 160, FALLBACK_CAP = 24;
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const easeOut = (k) => 1 - Math.pow(1 - clamp01(k), 3);
  const smooth = (k) => { k = clamp01(k); return k * k * (3 - 2 * k); };
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const A = () => RB.harmonyArt;
  let cur = null, N = 0, onResize = null;
  const S = { started: 0, shown: 0, displayed: 0, disposed: 0, suppressed: {}, fallbacks: [], log: [], maxLive: 0, replaced: 0, relaid: 0, menuWaits: 0, cost: { start: [], frameMax: 0, frameSum: 0, frames: 0 } };
  const keep = (a, v) => { a.push(Math.round(v * 100) / 100); if (a.length > 40) a.shift(); };

  // ---- the motion at Normal (Robin's decision, 2026-10-05) ----------------------------------------------------
  // Offsets in art px of the composition (+ is right), × its display scale, rounded to whole CSS px; h = ms since the
  // hold began. In: from beyond the left edge, x = −W + (W + over)·easeOut(k) (W: the travel, as before), so it
  // overshoots `over` to the right. Hold: it settles back, + over·(1 − smooth(h / settle)); it leans as the peak lands
  // (q = h − the peak's start in the hold: for q ≥ 0, − lean·(q < leanIn ? smooth(q / leanIn) : 1 − smooth((q − leanIn)
  // / leanOut))); it drifts, − drift·smooth(h / (hold + out)), which the fade continues to its end. Fast keeps the plain
  // slide and fade; reduced motion has neither travel nor motion. Hurried, the same on the faster clock.
  const MOTION = { normal: { over: 3, settle: 140, lean: 2.5, leanIn: 50, leanOut: 260, drift: 1.5 } };
  // How far that motion reaches either side of where the composition stands (art px), for placement: right, the
  // overshoot (3); left, the lean and the drift together (4: with the default timelines it reaches about 2.6, but a
  // manifest's override may put the peak late in the hold, where both add up).
  const ENVELOPE = { normal: { r: MOTION.normal.over, l: MOTION.normal.lean + MOTION.normal.drift } };
  const NO_ENVELOPE = { r: 0, l: 0 };
  const widen = (sp, e) => (e.r || e.l ? sp.map((q) => (q ? [q[0] - e.l, q[1] + e.r] : null)) : sp);
  const seqMode = () => (RB.battleSeq && RB.battleSeq.mode ? RB.battleSeq.mode() : 'normal');
  // the in-slide's x (art px, unrounded) at k (0–1 of the in) for a travel of W art px: Normal overshoots, Fast does not
  function slideAt(M, W, k) { const e = easeOut(k); return M ? -W + (W + M.over) * e : -(1 - e) * W; }
  // the x offset (art px, unrounded) at h ms into the hold (continuing through the fade); noOver: no overshoot to
  // settle from (a late placement faded in where it stands)
  function motionAt(M, d, peakH, h, noOver) {
    if (!M) return 0;
    let x = noOver ? 0 : M.over * (1 - smooth(h / M.settle));
    const q = h - peakH;
    if (q >= 0) x -= M.lean * (q < M.leanIn ? smooth(q / M.leanIn) : 1 - smooth((q - M.leanIn) / M.leanOut));
    x -= M.drift * smooth(h / (d.hold + d.out));
    return x;
  }

  // ---- the setting and the moments it must not start -------------------------------------------------
  // "Harmony portrait flourish" (default On): presentation only; older settings records lack it (= On).
  const enabled = () => !(RB.game && RB.game.settings && RB.game.settings.harmonyFlourish === false);
  // Can a portrait play now (for the choreography, which makes the stage wait for it): the setting On and the playback
  // not Instant. (Whether it then shows — a reading layer, the space — is decided when it starts; the stage waits anyway.)
  const plays = () => enabled() && seqMode() !== 'instant';
  // its length in presentation ms at a playback mode (default: the current one); 0 at Instant
  function duration(mode) {
    const m = mode || seqMode(), d = RB.battleSeq && RB.battleSeq.T && RB.battleSeq.T.cutin && RB.battleSeq.T.cutin[m];
    return d ? d.in + d.hold + d.out : 0;
  }
  function readingOpen() {
    try {
      if (RB.ui && RB.ui.dialogue && RB.ui.dialogue.isOpen && RB.ui.dialogue.isOpen()) return 'dialogue';
      if (RB.ui && RB.ui.help && RB.ui.help.isOpen && RB.ui.help.isOpen()) return 'help';
      if (RB.combatHelp && RB.combatHelp.isOpen && RB.combatHelp.isOpen()) return 'help';
      if (RB.ui && RB.ui.settings && RB.ui.settings.isOpen && RB.ui.settings.isOpen()) return 'settings';
      if (typeof document !== 'undefined') {
        // the language task, a confirmation, the folio or any other modal sheet on screen
        for (const e of document.querySelectorAll('.chal, .confirm-scrim, [aria-modal="true"]')) if (visRect(e)) return 'sheet';
      }
    } catch (e) { return 'unknown'; }
    return null;
  }
  // the art's phases over an instance's life (data: a third 'flourish' drawing may appear between them)
  function phases() { const P = A() && A().PHASES; return Array.isArray(P) && P.length ? P.slice() : ['enter', 'hold']; }
  // An authored performance of the portrait, where the art provides one: RB.harmonyArt.timeline(comp, mode) →
  // [{ phase, seg: 'in'|'hold'|'out', from, to }] (fractions of that segment's duration in RB.battleSeq.T.cutin
  // for the playback mode, whose own fractions they are) — e.g. prep_a, prep_b while it arrives; cue, cue_b, peak,
  // settle_a while it holds; settle_b through the hold's end and the fade. A state the art leaves out holds the one
  // before. Without a timeline the two drawings above are used ('enter' arriving, then 'hold'). Each entry gets its
  // place on one line: in 0–1, hold 1–2, out 2–3.
  const SEG = { in: 0, hold: 1, out: 2 };
  function timelineOf(comp, mode) {
    try {
      const T = A() && typeof A().timeline === 'function' ? A().timeline(comp, mode) : null;
      if (!Array.isArray(T) || !T.length) return null;
      const out = T.filter((e) => e && e.phase && SEG[e.seg] != null).map((e) => ({ phase: e.phase, at: SEG[e.seg] + Math.max(0, Math.min(1, +e.from || 0)) }));
      out.sort((a, b) => a.at - b.at);
      return out.length ? out : null;
    } catch (e) { return null; }
  }
  // the drawings a composition can show over its life (the footprint is their union; prepare builds them all)
  function phaseList(comp, still) {
    const T = timelineOf(comp);
    if (T) { const u = [...new Set(T.map((e) => e.phase))]; return still ? reducedStates(u) : u; }
    return still ? ['hold'] : phases();
  }
  // Reduced motion with a painted timeline: the held poses (contract v3: peak, then settle_b) that the timeline has;
  // with only one of them, the last state alone.
  function reducedStates(u) {
    const RM = RB.harmonyContract && RB.harmonyContract.REDUCED_MOTION;
    const st = RM ? RM.states.filter((x) => u.indexOf(x) >= 0) : [];
    return st.length >= 2 ? st : [u[u.length - 1]];
  }
  // the cross-fade between them: { a, b, at, fade } in presentation ms from the start (null: a single held pose)
  function reducedPlan(c) {
    const RM = RB.harmonyContract && RB.harmonyContract.REDUCED_MOTION;
    if (!c.reduce || !c.tl || !RM) return null;
    const st = reducedStates([...new Set(c.tl.map((e) => e.phase))]);
    if (st.length < 2) return null;
    const segAt = { in: 0, hold: c.d.in, out: c.d.in + c.d.hold }, segLen = { in: c.d.in, hold: c.d.hold, out: c.d.out };
    return { a: st[0], b: st[1], at: segAt[RM.at.seg] + segLen[RM.at.seg] * RM.at.from, fade: Math.min(120, RM.crossFade) };
  }
  const holdPhase = (comp) => { const T = timelineOf(comp); return T ? T[T.length - 1].phase : 'hold'; };
  // Where the peak begins on the in–hold–out line (0–3): the painted timeline's own, else the contract's at the mode (the
  // code busts have no peak drawing; their lean lands on the same beat). peakH: that, in ms from the hold's start.
  function peakLine(tl, mode) {
    const e = tl && tl.find((x) => x.phase === 'peak');
    if (e) return e.at;
    try { const p = RB.harmonyContract.timeline(null, null, mode).find((x) => x.phase === 'peak'); if (p) return SEG[p.seg] + p.from; } catch (err) { /* no contract */ }
    return 1.19;
  }
  const peakH = (c) => { const a = c.peakAt, d = c.d; return a < 1 ? (a - 1) * d.in : a < 2 ? (a - 1) * d.hold : d.hold + (a - 2) * d.out; };

  // ---- measuring ------------------------------------------------------------------------------------
  // (fading: an element whose opacity is running up from 0 — the banner as it appears — still counts)
  function visRect(el, fading) {
    if (!el || !el.getBoundingClientRect) return null;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return null;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || (!fading && +cs.opacity < 0.05)) return null;
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  }
  // Every rectangle the portrait must keep clear of (CSS px, viewport), with what it is.
  function protectedRects() {
    const out = [];
    const root = document.querySelector('.combat-ui');
    const add = (id, r) => { if (r && r.w > 0 && r.h > 0) out.push(Object.assign({ id }, r)); };
    if (!root) return out;
    const withdrawn = root.classList.contains('cb-acting') && !root.classList.contains('cb-keep');
    add('status', visRect(root.querySelector('.cb-party')));
    // the banner as it appears (its fade starts at 0, and it drops 6 px into place): where it will stand
    for (const b of root.querySelectorAll('.cb-banner')) if (b.classList.contains('on') || b.classList.contains('off')) { const r = visRect(b, true); if (r) { r.h += 8; add('banner', r); } }
    // the telegraph and the responses: occupied unless Adaptive has withdrawn them for the exchange
    if (!withdrawn) { add('intent', visRect(root.querySelector('.intent'))); add('responses', visRect(root.querySelector('.cb-dock'))); }
    add('skip', visRect(root.querySelector('.cb-skip')));
    // the battle's Settings button (src/ui/55_settings.js: the stage's lower right, shown while it may open)
    add('settings', visRect(root.querySelector('.cb-set')));
    for (const e of root.querySelectorAll('.cb-foe [data-foe], .cb-foe')) add('plate', visRect(e));
    for (const e of root.querySelectorAll('.cb-ib')) add('badge', visRect(e));
    add('intentCard', visRect(root.querySelector('.cb-icard')));
    // the stage: each creature's silhouette and its knots (where the technique lands), the party performing
    const St = RB.battleStage;
    const lay = St && St.lay && St.lay();
    if (lay) {
      const cp = St.cssPerArt ? St.cssPerArt() : 1;
      for (const f of lay.foes || []) {
        const e = f.ext, sc = lay.scale;
        const top = f.ey + e.top * sc, bottom = Math.max(f.ey + e.bottom * sc, (f.ky || 0) + 12 * sc);
        const half = Math.max((e.right - e.left) * sc / 2, (f.knotSpan || 0) * 0.6);
        add('creature', { x: Math.min(f.ex + e.left * sc, f.ex - half) * cp, y: top * cp, w: (Math.max(f.ex + e.right * sc, f.ex + half) - Math.min(f.ex + e.left * sc, f.ex - half)) * cp, h: (bottom - top) * cp });
      }
      if (lay.party) add('party', { x: lay.party.x * cp, y: lay.party.y * cp, w: lay.party.w * cp, h: lay.party.h * cp });
    }
    // a touch control or a HUD left on screen (normally hidden in battle)
    for (const e of document.querySelectorAll('.touchpad, .hud')) add('control', visRect(e));
    return out;
  }
  // The rows of a composition that are drawn (art px): for each row, its leftmost and rightmost opaque pixel —
  // the union over the phases shown, so a hand that moves between drawings is footprint in both.
  const spanCache = new Map();
  function spansOf(spec) {
    const ph = phaseList(spec.comp, spec.still);
    const tl = !!timelineOf(spec.comp);
    const comps = ph.map((p) => A().compose(Object.assign({}, spec, { phase: p, still: spec.still && !tl })));
    const key = comps.map((c) => c.key).join('#');
    let sp = spanCache.get(key);
    if (sp) return { sp, comp: comps[comps.length - 1], all: comps };
    const w = comps[0].w, h = comps[0].h;
    sp = new Array(h).fill(null);
    for (const c of comps) {
      let data = null;
      try { data = c.cv.getContext('2d').getImageData(0, 0, c.w, c.h).data; } catch (e) { data = null; }
      for (let y = 0; y < h; y++) {
        let x0 = -1, x1 = -1;
        if (data) {
          for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 8) { if (x0 < 0) x0 = x; x1 = x; }
        } else if (y >= c.bounds.y && y < c.bounds.y + c.bounds.h) { x0 = c.bounds.x; x1 = c.bounds.x + c.bounds.w - 1; } // (no pixels to read: its bounds)
        if (x0 < 0) continue;
        const o = sp[y];
        sp[y] = o ? [Math.min(o[0], x0), Math.max(o[1], x1)] : [x0, x1];
      }
    }
    spanCache.set(key, sp);
    while (spanCache.size > 8) spanCache.delete(spanCache.keys().next().value);
    return { sp, comp: comps[comps.length - 1], all: comps };
  }
  // does the composition at (x, y, s) draw anything inside one of the rects (each inflated by SEP)?
  // (path: each drawn row also covers everything to its left — the way the composition slides in from the left edge)
  const BLEED_FACE = 8; // CSS px of every face kept in view when the pair is slid past the left edge (place())
  function hits(sp, x, y, s, rects, path) {
    for (const R of rects) {
      const rx0 = R.x - SEP, rx1 = R.x + R.w + SEP, ry0 = R.y - SEP, ry1 = R.y + R.h + SEP;
      for (let r = 0; r < sp.length; r++) {
        const q = sp[r];
        if (!q) continue;
        const y0 = y + r * s, y1 = y0 + s;
        if (y1 <= ry0 || y0 >= ry1) continue;
        if (x + (q[1] + 1) * s <= rx0 || (!path && x + q[0] * s >= rx1)) continue;
        return R.id;
      }
    }
    return null;
  }
  // The menus Adaptive has withdrawn that are still on screen: the response dock and the telegraph leave through
  // their edge on a CSS transition (200 ms of wall time), measured as drawn (the rectangle moves with the slide;
  // gone once hidden or under 5 % opacity — the same test as visRect).
  function withdrawing() {
    const root = document.querySelector('.combat-ui');
    if (!root || !root.classList.contains('cb-acting') || root.classList.contains('cb-keep')) return [];
    const out = [];
    for (const e of root.querySelectorAll('.intent, .cb-dock')) { const r = visRect(e); if (r) out.push(Object.assign({ id: e.classList.contains('cb-dock') ? 'responses' : 'intent' }, r)); }
    return out;
  }
  // The placement for a companion's pair in the current layout, the candidates tried larger faces first (see the header).
  // o: { comp, look, still?, mode?, view?: {w, h} } → { ok, variant, scale, x, y, w, h, fit, footprint, envelope, faceH,
  //      backing, fx, tried: [...], reason }. mode (default: the playback's): at Normal, not still, every drawn row is
  //      tested widened by the motion's reach (ENVELOPE, art px × the scale) — the width check too.
  function envelopeOf(o) { return (!o.still && ENVELOPE[o.mode || seqMode()]) || NO_ENVELOPE; }
  function place(o) {
    const vw = (o.view && o.view.w) || window.innerWidth, vh = (o.view && o.view.h) || window.innerHeight;
    const env = envelopeOf(o);
    const rects = o.rects || protectedRects();
    const stage = visRect(document.querySelector('.combat-ui .cb-stage'));
    const party = rects.find((r) => r.id === 'party');
    const top = stage ? stage.y : 0, bottom = party ? party.y : stage ? stage.y + stage.h : vh;
    const midY = (top + bottom) / 2;
    const N = A().NATIVE, still = !!o.still;
    const faceOf = (spec, s) => { const c = A().compose(Object.assign({}, spec, { phase: holdPhase(spec.comp) })); return Math.min(...c.faces.map((f) => f.h)) * s; };
    const base = { comp: o.comp, look: o.look, still };
    // painted art is fitted on its visible footprint across the whole performance (null for the code busts: their
    // canvas is their footprint, as before)
    const foot = (v) => { try { return A().footprint ? A().footprint({ comp: o.comp, look: o.look, variant: v }) : null; } catch (e) { return null; } };
    const sStd = A().fitScale(vw, vh, 'standard', undefined, foot('standard')), sCmp = A().fitScale(vw, vh, 'compact', undefined, foot('compact'));
    const std = [], cmp = [];
    if (sStd > 0) { std.push({ variant: 'standard', scale: sStd, fit: 'standard', at: 'mid' }); std.push({ variant: 'standard', scale: sStd, fit: 'standard-moved', at: 'scan' }); }
    if (sCmp > 0) {
      cmp.push({ variant: 'compact', scale: sCmp, fit: 'compact', at: 'scan' });
      cmp.push({ variant: 'compact', scale: sCmp, fit: 'compact-bare', at: 'scan', backing: false, fx: false });
      for (let s = Math.ceil(sCmp) - 1; s >= 1; s--) cmp.push({ variant: 'compact', scale: s, fit: 'compact-small', at: 'scan' });
    }
    // The larger faces first: each candidate at its own fitted scale (inside its variant's footprint limits) is tried
    // in the order of the face size it gives, the fixed order above breaking ties (the standard pair, mid, first). So a
    // desktop between about 1366 and 1600 px wide shows the compact pair at 2× where it fits (faces ~100 CSS px)
    // rather than the standard at 1× (~52 px), a tall tablet the compact pair, and a view where both give the same
    // faces (2048 × 1046, 1920 × 1080; the code busts at 1648 × 840) the standard pair. One that cannot be placed
    // gives way to the next.
    const faceAt = {};
    const fz = (st) => { const k = st.variant + '@' + st.scale; if (faceAt[k] == null) faceAt[k] = faceOf(Object.assign({ variant: st.variant }, base), st.scale); return faceAt[k]; };
    const order = std.concat(cmp).map((st, i) => ({ st, i, f: fz(st) })).sort((a, b) => b.f - a.f || a.i - b.i).map((x) => x.st);
    const tried = [];
    // Two passes. First every candidate against the left edge (x 0), as always. Only when none fits there, the same
    // candidates again, slid further past the left edge the composition bleeds from (§5.2, HX1), in steps of 2 art
    // px, never so far that a face leaves the screen (each face, widened by the motion's reach to the left, stays at
    // least BLEED_FACE px in view): a group of large creatures can leave the left edge's column only just too narrow
    // for the painted pair (2048 × 1046 with three, 2026-10-06), where the portrait would otherwise be left out.
    for (const pass of [0, 1]) {
      for (const st of order) {
        const spec = Object.assign({}, base, { variant: st.variant, backing: st.backing !== false, fx: st.fx !== false });
        const { sp: sp0, comp } = spansOf(spec);
        const sp = widen(sp0, env);
        const s = st.scale, b = comp.bounds;
        const faceH = Math.min(...comp.faces.map((f) => f.h)) * s, faceW = Math.min(...comp.faces.map((f) => f.w)) * s;
        if (faceH < 24) { if (!pass) tried.push({ fit: st.fit, scale: s, why: 'faces too small' }); continue; }
        const w = comp.w * s, h = comp.h * s;
        if ((b.x + b.w + env.r) * s > vw) { if (!pass) tried.push({ fit: st.fit, scale: s, why: 'too wide' }); continue; }
        const yMin = Math.ceil(-b.y * s), yMax = Math.floor(vh - (b.y + b.h) * s);
        if (yMax < yMin) { if (!pass) tried.push({ fit: st.fit, scale: s, why: 'too tall' }); continue; }
        const pref = Math.round(midY - (b.y + b.h / 2) * s);
        const cand = [];
        if (st.at === 'mid') cand.push(Math.max(yMin, Math.min(yMax, pref)));
        else {
          const step = Math.max(1, Math.round(s));
          for (let y = yMin; y <= yMax; y += step) cand.push(y);
          cand.sort((p, q) => Math.abs(p - pref) - Math.abs(q - pref) || p - q);
        }
        const xs = [];
        if (!pass) xs.push(0);
        else {
          const xMin = Math.ceil(BLEED_FACE + env.l * s - Math.min(...comp.faces.map((f) => f.x)) * s);
          for (let x = -2 * s; x >= xMin; x -= 2 * s) xs.push(x);
          if (!xs.length) continue;
        }
        let blocked = null;
        for (const x of xs) for (const y of cand) {
          const hit = hits(sp, x, y, s, rects);
          if (hit) { blocked = blocked || hit; continue; }
          return { ok: true, variant: st.variant, scale: s, x, y, w, h, fit: st.fit, bleed: -x, backing: spec.backing, fx: spec.fx, faceH, faceW, footprint: { x: x + b.x * s, y: y + b.y * s, w: b.w * s, h: b.h * s }, envelope: { l: env.l, r: env.r }, view: { w: vw, h: vh }, tried, rects: rects.map((r) => r.id) };
        }
        tried.push({ fit: st.fit + (pass ? '-bled' : ''), scale: s, why: 'overlaps ' + blocked });
      }
    }
    return { ok: false, fit: 'omitted', reason: tried.length ? tried[tried.length - 1].why : 'no variant fits the view', tried, view: { w: vw, h: vh }, rects: rects.map((r) => ({ id: r.id, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.w), h: Math.round(r.h) })) };
  }

  // ---- the instance ---------------------------------------------------------------------------------
  function note(why) { S.suppressed[why] = (S.suppressed[why] || 0) + 1; }
  function mark(c, state, pt) { c.marks.push({ state, at: Math.round((pt - c.t0) * 10) / 10, wall: Math.round(now() - c.wall0) }); }
  function start(cue, at, rec) {
    const tStart = now();
    if (cur) { S.replaced++; dispose('replaced'); }
    const comp = cue && cue.comp;
    const why = !enabled() ? 'off' : COMPS.indexOf(comp) < 0 ? 'nocomp' : !A() ? 'noart' : RB.battleSeq && RB.battleSeq.mode() === 'instant' ? 'instant'
      : typeof document === 'undefined' || document.hidden ? 'hidden' : !document.querySelector('.combat-ui') ? 'noroot' : readingOpen();
    if (why) { note(why); return null; }
    // the player's worn look, as it is now (snapshot: a change later in the action never reaches this one)
    let look = {};
    try { look = JSON.parse(JSON.stringify(RB.equip.look(RB.game.s) || {})); } catch (e) { look = {}; }
    const mode = RB.battleSeq.mode();
    const T = (RB.battleSeq.T.cutin || {})[mode] || { in: 220, hold: 820, out: 360 };
    const reduce = !!(RB.game.reducedMotion && RB.game.reducedMotion());
    const action = rec && rec.meta && rec.meta.action ? rec.meta.action.id : null;
    let pl;
    try { pl = place({ comp, look, still: reduce, mode }); } catch (e) { pl = { ok: false, fit: 'omitted', reason: 'error: ' + (e && e.message), tried: [] }; }
    if (!pl.ok) {
      note('fallback');
      S.fallbacks.push({ action, comp, view: pl.view, reason: pl.reason, tried: pl.tried, rects: pl.rects, at: new Date().toISOString() });
      while (S.fallbacks.length > FALLBACK_CAP) S.fallbacks.shift();
      return null;
    }
    const el = document.createElement('canvas');
    el.className = 'cb-cutin';
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('role', 'presentation');
    el.inert = true;
    el.tabIndex = -1;
    el.dataset.comp = comp;
    const root = document.querySelector('.combat-ui');
    root.insertBefore(el, root.querySelector('.cb-banner'));
    N++;
    const tl = timelineOf(comp, mode), total = T.in + T.hold + T.out;
    // until: by when (presentation ms from the cue) the portrait must be gone, 60 ms before the technique's first result
    // (the cue's `first`; the choreography places that ≥ 120 ms after the portrait's end, src/ui/84p_party_choreo.js)
    const first = cue && cue.first > 0 ? cue.first : total + ((RB.battleSeq.T && RB.battleSeq.T.cutinGap) || 120);
    cur = { n: N, tl, rm: null, mixQ: null, state: 'inactive', action, comp, tech: cue.tech || comp, look, reduce, mode, d: { in: T.in, hold: T.hold, out: T.out }, t0: at, wall0: now(), el, pl, phase: null, opacity: 0, dx: 0, marks: [], trace: [], dirty: false, cut: null,
      // the motion (Normal, not reduced) and where its lean begins: the peak's place on the in–hold–out line
      motion: (!reduce && MOTION[mode]) || null, peakAt: peakLine(tl, mode), until: first - 60, squeezed: 0,
      // with large text (or an overlay that scrolls) the layout may still reflow as the menus withdraw: the
      // portrait waits, unseen, until it has held still for a few frames (within its entrance), then takes its
      // place — or, if none is left, is not shown at all (never a flash over what then moves under it)
      settle: root.scrollHeight > root.clientHeight + 1 || ((RB.game.settings && RB.game.settings.textScale) || 1) > 1.25 ? { sig: null, n: 0 } : null,
      // the menus withdrawn for the exchange may still be leaving (frame1): until they are gone from where the portrait
      // will be, it stays unseen
      menus: root.classList.contains('cb-acting') && !root.classList.contains('cb-keep') ? { waited: false } : null };
    cur.rm = reducedPlan(cur);
    mark(cur, 'inactive', at);
    S.started++; S.shown++;
    S.maxLive = Math.max(S.maxLive, document.querySelectorAll('.cb-cutin').length);
    onResize = () => { if (cur) cur.dirty = true; };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    frame(RB.battleSeq.now());
    keep(S.cost.start, now() - tStart); // (placement and the first drawing: what starting it costs the frame)
    return cur ? cur.n : null;
  }
  function layout(c) {
    const p = c.pl, el = c.el;
    // viewport px (position: fixed — it never adds to the overlay's scrollable area, so it cannot cause a reflow)
    el.style.left = p.x + 'px';
    el.style.top = p.y + 'px';
    el.style.width = p.w + 'px';
    el.style.height = p.h + 'px';
  }
  function draw(c, ph) {
    const spec = { comp: c.comp, look: c.look, variant: c.pl.variant, phase: ph, still: c.reduce && !c.tl, backing: c.pl.backing, fx: c.pl.fx };
    const comp = A().compose(spec);
    if (c.el.width !== comp.w || c.el.height !== comp.h) { c.el.width = comp.w; c.el.height = comp.h; }
    // (a CPU-backed canvas: it is drawn only when the drawing changes, and the browser tests read it back)
    const g = c.el.getContext('2d', { willReadFrequently: true });
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, comp.w, comp.h);
    g.drawImage(comp.cv, 0, 0);
    c.phase = ph;
    c.mixQ = null;
    c.drawn = comp.key;
    layout(c);
  }
  // Reduced motion's cross-fade between two held poses (painted art): the one fading out at 1 − k, the one fading in
  // at k, added ('lighter'), so a pixel both share keeps full opacity and one only either has fades with it. Drawn
  // only when k moves on by a sixteenth.
  function drawMix(c, mx) {
    const q = Math.round(mx.k * 16) / 16;
    if (c.mixQ === q && c.phase === mx.ph) return;
    const spec = (ph) => ({ comp: c.comp, look: c.look, variant: c.pl.variant, phase: ph, still: false, backing: c.pl.backing, fx: c.pl.fx });
    const ca = A().compose(spec(mx.a)), cb = A().compose(spec(mx.b));
    if (c.el.width !== ca.w || c.el.height !== ca.h) { c.el.width = ca.w; c.el.height = ca.h; }
    const g = c.el.getContext('2d', { willReadFrequently: true });
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, ca.w, ca.h);
    g.save();
    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = 1 - q; g.drawImage(ca.cv, 0, 0);
    g.globalAlpha = q; g.drawImage(cb.cv, 0, 0);
    g.restore();
    c.phase = mx.ph; c.mixQ = q;
    c.drawn = ca.key + '~' + cb.key;
    layout(c);
  }
  // reduced motion with painted art: the cross-fade under way at elapsed el, or null
  function mixAt(c, el) {
    const R = c.rm !== undefined ? c.rm : reducedPlan(c);
    if (!R) return null;
    const k = (el - (R.at - R.fade / 2)) / R.fade;
    if (k <= 0 || k >= 1) return null;
    return { a: R.a, b: R.b, k, ph: k < 0.5 ? R.a : R.b };
  }
  // which drawing shows at elapsed el (presentation ms): the arrival, then (shortly after it has arrived) the
  // one gesture resolved into the hold; a 'flourish' drawing, where the art has one, between them
  function phaseAt(c, el) {
    const T = c.tl !== undefined ? c.tl : timelineOf(c.comp, c.mode);
    if (T) {
      // reduced motion: held poses (peak, then settle_b at the middle of the hold), else the last state only;
      // otherwise the latest state whose start has been reached
      if (c.reduce) { const R = c.rm !== undefined ? c.rm : reducedPlan(Object.assign({ tl: T }, c)); return R ? (el < R.at ? R.a : R.b) : T[T.length - 1].phase; }
      const pos = el < c.d.in ? Math.max(0, el) / c.d.in : el < c.d.in + c.d.hold ? 1 + (el - c.d.in) / c.d.hold : 2 + Math.min(1, (el - c.d.in - c.d.hold) / c.d.out);
      let ph = T[0].phase;
      for (const e of T) if (e.at <= pos + 1e-9) ph = e.phase;
      return ph;
    }
    if (c.reduce) return 'hold';
    const P = phases(), resolveAt = c.d.in + Math.min(60, c.d.hold / 4);
    if (el < resolveAt && P.indexOf('enter') >= 0) return 'enter';
    if (P.indexOf('flourish') >= 0 && el < c.d.in + c.d.hold * 0.5) return 'flourish';
    return 'hold';
  }
  // A cheap signature of what the placement depends on: the stage's layout, the overlay's scroll, the banner
  // and the status dock. Large text can make the overlay scroll or reflow as the menus withdraw; the same
  // instance is then placed again (as on a resize).
  function layoutSig() {
    const St = RB.battleStage, L = St && St.lay && St.lay();
    const root = document.querySelector('.combat-ui');
    const r = (e) => { if (!e) return ''; const q = e.getBoundingClientRect(); return Math.round(q.left) + ',' + Math.round(q.top) + ',' + Math.round(q.width) + ',' + Math.round(q.height); };
    const sz = (e) => { if (!e) return ''; const q = e.getBoundingClientRect(); return Math.round(q.width) + ',' + Math.round(q.height); }; // (the banner drops into place: its size only)
    return (L ? L.foes.map((f) => f.ex + ',' + f.ey).join(';') + '|' + L.scale + '|' + (L.party ? L.party.x + ',' + L.party.y + ',' + L.party.w + ',' + L.party.h : '') : '') + '|' + (St && St.cssPerArt ? St.cssPerArt() : 1) +
      '|' + (root ? root.scrollTop + '|' + r(root.querySelector('.cb-party')) + '|' + sz(root.querySelector('.cb-banner.on')) + '|' + root.classList.contains('cb-acting') + '|' + r(root.querySelector('.cb-set:not([hidden])')) : '');
  }
  function frame(pt) {
    const c = cur;
    if (!c) return;
    const tf = now();
    try { frame1(c, pt); } finally { const ms = now() - tf; S.cost.frameMax = Math.max(S.cost.frameMax, ms); S.cost.frameSum += ms; S.cost.frames++; }
  }
  function frame1(c, pt) {
    // the setting turned Off in the battle's settings sheet while it stood paused: gone on resuming
    if (!enabled()) { dispose('off'); return; }
    const lay = readingOpen();
    if (lay) { dispose('layer:' + lay); return; }
    if (c.settle) {
      const sg = layoutSig();
      if (sg === c.settle.sig) c.settle.n++; else { c.settle.sig = sg; c.settle.n = 0; }
      const el0 = pt - c.t0;
      if (c.settle.n < 6 || el0 < Math.min(c.d.in, 120)) {
        if (el0 >= c.d.in + c.d.hold / 2) { note('unsettled'); S.fallbacks.push({ action: c.action, comp: c.comp, view: c.pl.view, reason: 'the layout did not settle in time', at: new Date().toISOString() }); dispose('unsettled'); return; }
        c.el.style.opacity = '0';
        return;
      }
      // placed now, in the settled layout; it comes in with a short fade where it stands (no slide)
      c.settle = null; c.sig = sg; c.dirty = true; c.lateAt = el0;
    }
    if (!c.cut) { const sg = layoutSig(); if (c.sig !== sg) { if (c.sig != null) c.dirty = true; c.sig = sg; } }
    if (c.dirty) {
      c.dirty = false;
      S.relaid++;
      let pl;
      try { pl = place({ comp: c.comp, look: c.look, still: c.reduce, mode: c.mode }); } catch (e) { pl = { ok: false }; }
      if (pl.ok) { const redraw = pl.variant !== c.pl.variant || pl.backing !== c.pl.backing; c.pl = pl; if (redraw) { c.phase = null; c.mixQ = null; } layout(c); }
      else {
        // no safe place any more: a short fade where it stands — or, if what it must keep clear of has moved
        // under it (large text reflowing the overlay), gone at once: it never stays over protected content
        S.fallbacks.push({ action: c.action, comp: c.comp, view: pl.view, reason: 'placed again: ' + (pl.reason || 'no safe space'), tried: pl.tried, at: new Date().toISOString() });
        while (S.fallbacks.length > FALLBACK_CAP) S.fallbacks.shift();
        let over = null;
        try { const { sp } = spansOf({ comp: c.comp, look: c.look, still: c.reduce, variant: c.pl.variant, backing: c.pl.backing, fx: c.pl.fx }); over = hits(sp, c.pl.x + (c.dx || 0), c.pl.y, c.pl.scale, protectedRects()); } catch (e) { over = 'unknown'; }
        if (over) { dispose('relayout-overlap'); return; }
        if (!c.cut) c.cut = { pt, d: Math.min(120, c.d.out), op: c.opacity, why: 'resize-invalid' };
      }
    }
    // The withdrawn menus' region is free for the placement, but they leave on a CSS transition of wall time (200 ms)
    // while the entrance runs on the presentation clock (Normal 220 ms; Fast 180 ms of wall time): under load one frame
    // could show the portrait over a dock that is still visibly leaving. So the portrait claims that region only once
    // every withdrawn menu its rows (and the path it slides in along, and the motion's reach) reach is gone — measured
    // each frame, as drawn; until then it stays unseen and its state does not advance. Its whole entrance then plays from
    // that moment (its own clock starts late by the wait: c.lag), so it still slides in; after a late placement (large
    // text) it fades in where it stands instead. The stage waits for the portrait's planned end (≥ 120 ms before the
    // first result, cue.first), so a late start must still end by c.until (60 ms before that result): when it would
    // not, the hold is shortened by the difference (c.squeezed; the states keep their fractions of it). If the wait
    // would leave too little — past the middle of the hold, or less than half the hold before c.until — it is not
    // shown at all (recorded). Reduced motion has no such transition (the menus go at once), so it never waits.
    if (c.menus) {
      const el0 = pt - c.t0, wr = withdrawing();
      let over = null;
      if (wr.length) { try { over = hits(widen(spansOf({ comp: c.comp, look: c.look, still: c.reduce, variant: c.pl.variant, backing: c.pl.backing, fx: c.pl.fx }).sp, c.pl.envelope || NO_ENVELOPE), c.pl.x, c.pl.y, c.pl.scale, wr, true); } catch (e) { over = 'unknown'; } }
      if (over) {
        if (el0 >= Math.min(c.d.in + c.d.hold / 2, c.until - (c.d.in + c.d.hold / 2 + c.d.out))) {
          note('menus');
          S.fallbacks.push({ action: c.action, comp: c.comp, view: c.pl.view, reason: 'the withdrawn ' + over + ' stayed on screen', at: new Date().toISOString() });
          while (S.fallbacks.length > FALLBACK_CAP) S.fallbacks.shift();
          dispose('menus');
          return;
        }
        if (!c.menus.waited) { c.menus.waited = true; S.menuWaits++; }
        c.el.style.opacity = '0';
        return;
      }
      if (c.menus.waited) {
        c.waited = Math.round(el0 * 10) / 10;
        if (c.lateAt != null) c.lateAt = el0;
        else {
          c.lag = el0;
          // still gone by c.until: the hold gives up what the wait took beyond the slack (at most half of it, above)
          const late = c.d.in + c.d.hold + c.d.out + el0 - c.until;
          if (late > 0) { c.squeezed = Math.round(late * 10) / 10; c.d = { in: c.d.in, hold: c.d.hold - late, out: c.d.out }; }
        }
      }
      c.menus = null;
    }
    const el = pt - c.t0 - (c.lag || 0), d = c.d, total = d.in + d.hold + d.out;
    let state, op, dx = 0;
    const s = c.pl.scale;
    if (c.cut) {
      const k = (pt - c.cut.pt) / c.cut.d;
      if (k >= 1) { dispose(c.cut.why); return; }
      state = 'fading'; op = c.cut.op * (1 - smooth(k));
    } else if (el < d.in) {
      state = 'entering';
      const k = Math.max(0, el) / d.in;
      if (c.lateAt != null) op = smooth((el - c.lateAt) / 80);
      else if (c.reduce) op = smooth(k);
      else {
        op = 1;
        const travel = c.pl.footprint.x + c.pl.footprint.w + 4;
        // from beyond the left edge, eased out. Normal: x = −W + (W + over)·easeOut(k) art px (W the travel), × the
        // scale, to whole CSS px — it overshoots to the right. Fast: as before, in whole art pixels, no overshoot.
        if (c.motion) dx = Math.round(slideAt(c.motion, travel / s, k) * s);
        else dx = -Math.round(-slideAt(null, travel / s, k)) * s; // (whole art pixels, exactly as before)
      }
    } else if (el < d.in + d.hold) {
      state = 'holding'; op = c.lateAt != null ? smooth((el - c.lateAt) / 80) : 1;
      if (c.motion) dx = Math.round(motionAt(c.motion, d, peakH(c), el - d.in, c.lateAt != null) * s);
    } else if (el < total) {
      state = 'fading'; op = 1 - smooth((el - d.in - d.hold) / d.out);
      // (the fade continues the drift to its end: h runs on through the fade)
      if (c.motion) dx = Math.round(motionAt(c.motion, d, peakH(c), el - d.in, c.lateAt != null) * s);
    } else { dispose('done'); return; }
    if (dx === 0) dx = 0; // (no −0 in the record)
    if (state !== c.state) { c.state = state; mark(c, state, pt); }
    const ph = phaseAt(c, el), mx = c.reduce ? mixAt(c, el) : null;
    if (mx) drawMix(c, mx);
    else if (ph !== c.phase || c.mixQ != null) draw(c, ph);
    c.opacity = op; c.dx = dx;
    if (op > 0 && !c.seen) { c.seen = true; S.displayed++; }
    c.el.style.opacity = String(Math.round(op * 1000) / 1000);
    c.el.style.transform = dx ? 'translate(' + dx + 'px,0)' : '';
    if (c.trace.length < TRACE_CAP) c.trace.push([Math.round(el * 10) / 10, state[0], Math.round(op * 1000) / 1000, dx, ph, mx ? Math.round(mx.k * 1000) / 1000 : null]);
  }
  function dispose(why) {
    const c = cur;
    if (!c) return false;
    cur = null;
    if (onResize) { window.removeEventListener('resize', onResize); window.removeEventListener('orientationchange', onResize); onResize = null; }
    if (c.el && c.el.parentNode) c.el.parentNode.removeChild(c.el);
    const pt = RB.battleSeq ? RB.battleSeq.now() : c.t0;
    c.state = 'disposed';
    mark(c, 'disposed', pt);
    S.disposed++;
    S.log.push({ n: c.n, action: c.action, comp: c.comp, why: why || 'done', displayed: !!c.seen, mode: c.mode, reduce: c.reduce, variant: c.pl.variant, scale: c.pl.scale, fit: c.pl.fit, x: c.pl.x, bleed: c.pl.bleed || 0, footprint: roundRect(c.pl.footprint), envelope: c.pl.envelope || null, view: c.pl.view, faceH: c.pl.faceH, faceW: c.pl.faceW, tried: c.pl.tried || [], reducedPlan: c.rm, motion: !!c.motion, segments: { in: c.d.in, hold: Math.round(c.d.hold * 10) / 10, out: c.d.out }, until: c.until, squeezed: c.squeezed || 0, waitedForMenus: c.waited != null ? c.waited : c.menus && c.menus.waited ? -1 : null, opacityAtEnd: Math.round(c.opacity * 1000) / 1000, marks: c.marks, trace: c.trace, look: c.look });
    while (S.log.length > LOG_CAP) S.log.shift();
    return true;
  }
  const roundRect = (r) => (r ? { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.w), h: Math.round(r.h) } : null);

  function state() {
    const c = cur;
    if (!c) return { state: 'inactive', token: null };
    const r = c.el.getBoundingClientRect();
    return { state: c.state, token: c.n, action: c.action, comp: c.comp, variant: c.pl.variant, scale: c.pl.scale, fit: c.pl.fit, opacity: c.opacity, dx: c.dx, phase: c.phase, rect: { x: r.left, y: r.top, w: r.width, h: r.height }, footprint: roundRect({ x: c.pl.footprint.x + c.dx, y: c.pl.footprint.y, w: c.pl.footprint.w, h: c.pl.footprint.h }), t: Math.round((RB.battleSeq.now() - c.t0) * 10) / 10 };
  }
  function stats() {
    let cache = null;
    try { const s = A() && A().stats(); cache = s ? { busts: s.busts, compositions: s.compositions, bytes: s.bytes, builds: s.builds, hits: s.hits } : null; } catch (e) { cache = null; }
    const cost = { startMs: S.cost.start.slice(), frameMaxMs: Math.round(S.cost.frameMax * 100) / 100, frameMeanMs: S.cost.frames ? Math.round((S.cost.frameSum / S.cost.frames) * 1000) / 1000 : 0, frames: S.cost.frames };
    return { cost, started: S.started, shown: S.shown, displayed: S.displayed, disposed: S.disposed, live: cur ? 1 : 0, layers: typeof document !== 'undefined' ? document.querySelectorAll('.cb-cutin').length : 0, maxLive: S.maxLive, replaced: S.replaced, relaid: S.relaid, menuWaits: S.menuWaits, suppressed: Object.assign({}, S.suppressed), fallbacks: S.fallbacks.slice(), spans: spanCache.size, listening: !!onResize, cache };
  }
  const last = () => (S.log.length ? S.log[S.log.length - 1] : null);
  function reset() { dispose('reset'); S.started = S.shown = S.displayed = S.disposed = S.maxLive = S.replaced = S.relaid = S.menuWaits = 0; S.suppressed = {}; S.fallbacks = []; S.log = []; S.cost = { start: [], frameMax: 0, frameSum: 0, frames: 0 }; }

  // ---- preparation at a safe moment (§21) and cleanup ------------------------------------------------
  // At an encounter's start the committed companion's pair is built in idle slices (both variants, every
  // phase), and the technique's battle-figure frames are drawn ahead too — never when the technique fires.
  let prepTok = 0;
  function prepare(comp) {
    // (in a page only: node tests that play an encounter's events have no canvas to draw into)
    if (typeof document === 'undefined' || !A() || COMPS.indexOf(comp) < 0 || !RB.game || !RB.game.s) return;
    const tok = ++prepTok;
    let look = null;
    try { look = RB.equip.look(RB.game.s); } catch (e) { return; }
    const still = !!(RB.game.reducedMotion && RB.game.reducedMotion());
    try {
      const list = [];
      const tl = !!timelineOf(comp);
      for (const variant of ['standard', 'compact']) for (const phase of phaseList(comp, still)) list.push({ comp, look, variant, phase, still: still && !tl });
      A().prepare(list, { async: true });
    } catch (e) { /* presentation only */ }
    // the battle figures' frames for this technique (the cache keeps only this encounter's actors)
    const B = RB.battlers, MV = RB.battlerMoves, TC = RB.partyChoreo && RB.partyChoreo.TECH[comp];
    if (!B || !MV || !TC || !B.preview) return;
    const list = [];
    const add = (lk, who, id, g) => { const q = MV.qkOf(id, g) || B.QK || 12; for (const p of ['anticipate', 'act', 'recover']) for (let i = 0; i <= q; i++) list.push([lk, p, g, i / q, { who, id, reduce: still }]); };
    add(look, 'pc', 'pc', TC.g);
    if (RB.content.chars[comp]) add(RB.content.chars[comp].look, 'comp', comp, TC.p);
    let i = 0;
    const step = () => {
      if (tok !== prepTok || !RB.battleStage || !RB.battleStage.active()) return;
      const t0 = now();
      while (i < list.length && now() - t0 < 4) { const [lk, p, g, k, o] = list[i++]; try { B.preview(lk, p, g, k, o); } catch (e) { i = list.length; } }
      if (i < list.length) (typeof requestIdleCallback === 'function' ? requestIdleCallback : setTimeout)(step);
    };
    (typeof requestIdleCallback === 'function' ? requestIdleCallback : setTimeout)(step);
  }
  if (RB.bus && RB.bus.on) {
    RB.bus.on('present:scene', (e) => {
      if (!e) return;
      if (e.phase === 'enter' && e.comp) prepare(e.comp);
      if (e.phase === 'exit' || e.phase === 'defeat') { prepTok++; dispose(e.phase); }
    });
    // a campaign changing (new, loaded, back to the title): nothing of the last one's portrait stays
    RB.bus.on('campaign:changing', () => { prepTok++; dispose('campaign'); spanCache.clear(); });
  }

  return { start, frame, dispose, enabled, plays, duration, place, protectedRects, state, stats, last, reset, prepare, SEP, MOTION, ENVELOPE, phases, _: { spansOf, hits, widen, envelopeOf, readingOpen, phaseAt, phaseList, timelineOf, mixAt, reducedPlan, slideAt, motionAt, peakLine, peakH } };
})();
