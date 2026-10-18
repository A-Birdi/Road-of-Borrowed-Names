/* Printed leaf turns for the traveller's setup book (CW-1, Robin 2026-10-18; docs: the CW-1 package, 05). Only the
 * creation flow (src/ui/40_create.js) uses this, by choice; every other page keeps its own motion.
 *
 * A move of n steps is n leaves turned one after another around the spine, quicker the further it goes: 360 ms for
 * one, 230 / 180 / 155 ms each for two, three or four, 12 ms between them, then 40 ms to settle. Each leaf carries
 * printed pages: going forward from step i, the leaf lifts from the right carrying R(i) on its front and lands on the
 * left showing L(i+1) on its back, over L(i) (left) and R(i+1) (right); going back, the leaf lifts from the left
 * carrying L(i) and lands on the right showing R(i-1), over L(i-1) and R(i). The pages are inert copies made by the
 * caller (a page's own printed copy: its text, choices, open folds, scroll window and drawn canvases); nothing on them
 * can be focused, read out or pressed, and nothing they show is entered: the destination alone is mounted live at the
 * end. The stage sits over the spread, outside the scrolling pages, and is emptied when the turn ends, however it
 * ends: skipped (Escape, a resize, the page hidden, Reduce motion), failed or torn down. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui = RB.ui || {};
RB.ui.leafTurn = (function () {
  'use strict';
  const LEAF = { 1: 360, 2: 230, 3: 180, 4: 155 };
  const GAP = 12, SETTLE = 40;
  const EASE_ONE = 'cubic-bezier(.32,.04,.22,1)', EASE_RIFFLE = 'cubic-bezier(.35,.05,.40,1)';

  // the plan for a move from step `from` to step `to`: how many leaves, which way, how long (pure)
  function plan(from, to) {
    const n = Math.abs(to - from);
    if (!n) return { n: 0, forward: false, leafMs: 0, gapMs: 0, settleMs: 0, totalMs: 0, hops: [] };
    const forward = to > from;
    const leafMs = LEAF[Math.min(n, 4)] || LEAF[4];
    const hops = [];
    for (let k = 0; k < n; k++) { const a = forward ? from + k : from - k; hops.push({ from: a, to: forward ? a + 1 : a - 1 }); }
    return { n, forward, leafMs, gapMs: n > 1 ? GAP : 0, settleMs: SETTLE, totalMs: n * leafMs + (n - 1) * GAP + SETTLE, easing: n > 1 ? EASE_RIFFLE : EASE_ONE, hops };
  }
  // which printed page goes where for one leaf from step a to step b (pure): [step, side] pairs
  function faces(a, b) {
    const f = b > a;
    return {
      forward: f,
      underLeft: [f ? a : b, 'l'], underRight: [f ? b : a, 'r'],
      front: [a, f ? 'r' : 'l'], back: [b, f ? 'l' : 'r'],
      origin: f ? 'left center' : 'right center', angle: f ? -180 : 180,
    };
  }

  // ---- printed copies ------------------------------------------------------------------------------------------
  let snapN = 0;
  // An inert printed copy of a page element: its current values, ticks and open folds (cloneNode keeps those on
  // inputs and <details>), its canvases' pixels (cloneNode does not), and its scroll window (st). Ids, labels' targets
  // and radio groups are renamed before the copy is ever in the document, so it can never change a live choice.
  function print(el, st) {
    const c = el.cloneNode(true);
    const tag = 'pv' + (++snapN) + '-';
    const src = el.querySelectorAll('canvas'), dst = c.querySelectorAll('canvas');
    dst.forEach((cv, k) => {
      const s = src[k];
      if (!s || !s.width || !s.height) return;
      try { const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(s, 0, 0); } catch (e) { /* a tainted or lost canvas: left blank */ }
    });
    c.querySelectorAll('[id]').forEach((n) => { n.id = tag + n.id; });
    c.querySelectorAll('[for]').forEach((n) => n.setAttribute('for', tag + n.getAttribute('for')));
    c.querySelectorAll('input[name]').forEach((n) => { n.name = tag + n.name; });
    c.querySelectorAll('[aria-live]').forEach((n) => n.removeAttribute('aria-live'));
    c.querySelectorAll('[autofocus]').forEach((n) => n.removeAttribute('autofocus'));
    if (c.id) c.id = tag + c.id;
    c.setAttribute('inert', '');
    c.setAttribute('aria-hidden', 'true');
    c.tabIndex = -1;
    c.classList.add('lt-print');
    c.__st = st || 0;
    return c;
  }

  // ---- the turn ----------------------------------------------------------------------------------------------------
  // o: { stage, from, to, page(step, side) → printed element, live: () => boolean (still wanted), reduce: () => boolean,
  //      landed?: () => void (the last leaf is down: build the destination beneath the stage) }
  // Returns a handle { done: Promise<'turned'|'skipped'|'failed'>, skip() }. The caller mounts the destination when
  // done settles, whatever it says, and calls clear().
  function run(o) {
    const P = plan(o.from, o.to);
    let skipped = false, current = null, wake = null;
    const anims = new Set();
    const stop = () => { skipped = true; anims.forEach((a) => { try { a.finish(); } catch (e) { /* already gone */ } }); if (wake) wake(); };
    const onVis = () => { if (document.hidden) stop(); };
    const onResize = () => stop();
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('resize', onResize);
    // Reduce motion turned on (the game's or the system's) settles at once; a turn that never finishes is settled too
    const mo = typeof MutationObserver !== 'undefined' ? new MutationObserver(() => { if (o.reduce()) stop(); }) : null;
    if (mo) mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    const mq = typeof matchMedia !== 'undefined' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
    const onMq = () => { if (mq.matches) stop(); };
    if (mq && mq.addEventListener) mq.addEventListener('change', onMq);
    const dog = setTimeout(stop, P.totalMs + 1500);
    const wait = (ms) => new Promise((r) => { wake = r; setTimeout(() => { wake = null; r(); }, Math.max(0, ms)); });
    // The first leaf starts when it is first shown (t0: however long its pages took to print, it never starts part-way
    // through); every later leaf is placed on the document's timeline from that start, leaf k at t0 + k·(leaf + gap),
    // and the turn settles at t0 + total. A late frame (a slow machine, a busy page) is absorbed by the next leaf, never
    // added to the sum: the riffle keeps the contract's length rather than growing by a frame or two per leaf.
    let t0 = null;
    const put = (slot, el) => { slot.appendChild(el); if (el.__st) el.scrollTop = el.__st; };
    async function go() {
      const S = o.stage;
      S.innerHTML = '';
      S.classList.add('lt-on');
      const base = document.createElement('div');
      base.className = 'lt-base';
      S.appendChild(base);
      for (let k = 0; k < P.hops.length; k++) {
        if (skipped || !o.live() || o.reduce()) return 'skipped';
        // the next leaf waits for its place on the timeline with the last one still lying where it landed; its pages
        // and its motion then appear together, in one task
        if (k) { await wait(t0 + k * (P.leafMs + P.gapMs) - performance.now()); if (skipped || !o.live() || o.reduce()) return 'skipped'; }
        const h = P.hops[k], F = faces(h.from, h.to);
        // the stationary pages beneath, and the moving leaf with its two printed faces
        base.innerHTML = '';
        S.querySelectorAll('.lt-leaf').forEach((n) => n.remove());
        const L = document.createElement('div'), R = document.createElement('div');
        L.className = 'lt-slot lt-l'; R.className = 'lt-slot lt-r';
        base.appendChild(L); base.appendChild(R);
        put(L, o.page(F.underLeft[0], 'l'));
        put(R, o.page(F.underRight[0], 'r'));
        const shL = document.createElement('div'), shR = document.createElement('div');
        shL.className = 'lt-shade'; shR.className = 'lt-shade';
        L.appendChild(shL); R.appendChild(shR);
        const leaf = document.createElement('div');
        leaf.className = 'lt-leaf ' + (F.forward ? 'lt-fwd' : 'lt-bwd');
        leaf.style.transformOrigin = F.origin;
        const front = document.createElement('div'), back = document.createElement('div');
        front.className = 'lt-face lt-front lt-' + F.front[1]; back.className = 'lt-face lt-back lt-' + F.back[1];
        leaf.appendChild(front); leaf.appendChild(back);
        const edge = document.createElement('div');
        edge.className = 'lt-edge';
        leaf.appendChild(edge);
        S.appendChild(leaf);
        put(front, o.page(F.front[0], F.front[1]));
        put(back, o.page(F.back[0], F.back[1]));
        const fsh = document.createElement('div'), bsh = document.createElement('div');
        fsh.className = 'lt-shade lt-fsh'; bsh.className = 'lt-shade lt-bsh';
        front.appendChild(fsh); back.appendChild(bsh);
        const t = { duration: P.leafMs, easing: P.easing, fill: 'forwards' };
        // the leaf crosses the spine without stopping edge-on; the shade falls on the page it uncovers, then lifts
        const turnA = leaf.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(' + F.angle + 'deg)' }], t);
        const reveal = F.forward ? shR : shL, cover = F.forward ? shL : shR;
        const a2 = reveal.animate([{ opacity: 0.55 }, { opacity: 0.18, offset: 0.5 }, { opacity: 0 }], t);
        const a3 = cover.animate([{ opacity: 0 }, { opacity: 0.12, offset: 0.55 }, { opacity: 0.32, offset: 0.86 }, { opacity: 0 }], t);
        const a4 = fsh.animate([{ opacity: 0 }, { opacity: 0.5, offset: 0.48 }, { opacity: 0.5 }], t);
        const a5 = bsh.animate([{ opacity: 0.5 }, { opacity: 0.45, offset: 0.52 }, { opacity: 0 }], t);
        [turnA, a2, a3, a4, a5].forEach((a) => { anims.add(a); if (k) try { a.startTime = t0 + k * (P.leafMs + P.gapMs); } catch (e) { /* no timeline: plays from now */ } });
        current = turnA;
        if (!k) {
          // (whichever comes first: the leaf shown, the leaf done, or a stop. A leaf paused and resumed before it is
          // shown may never settle its first ready promise, so ready alone could wait for ever)
          await Promise.race([turnA.ready, turnA.finished, new Promise((r) => { wake = r; })].map((q) => q.catch(() => {})));
          wake = null;
          t0 = typeof turnA.startTime === 'number' ? turnA.startTime : performance.now();
        }
        try { await turnA.finished; } catch (e) { /* cancelled: settle below */ }
        [turnA, a2, a3, a4, a5].forEach((a) => anims.delete(a));
      }
      if (skipped || !o.live()) return 'skipped';
      // the last leaf has landed: the caller may build the live destination now, beneath the stage (which still shows
      // its printed copy), so the settle covers that work instead of following it
      if (o.landed) { try { o.landed(); } catch (e) { /* the caller mounts when the turn ends instead */ } }
      await wait(t0 + P.totalMs - performance.now());
      return skipped ? 'skipped' : 'turned';
    }
    const done = go().catch(() => 'failed').finally(() => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('resize', onResize);
      if (mo) mo.disconnect();
      if (mq && mq.removeEventListener) mq.removeEventListener('change', onMq);
      clearTimeout(dog);
      anims.forEach((a) => { try { a.cancel(); } catch (e) { /* gone */ } });
      anims.clear();
      current = null;
    });
    return { done, skip: stop, plan: P, get animating() { return !!current; } };
  }
  function clear(stage) {
    if (!stage) return;
    stage.getAnimations && stage.getAnimations({ subtree: true }).forEach((a) => { try { a.cancel(); } catch (e) { /* gone */ } });
    stage.innerHTML = '';
    stage.classList.remove('lt-on');
  }

  return { plan, faces, print, run, clear, LEAF, GAP, SETTLE, EASE_ONE, EASE_RIFFLE };
})();
