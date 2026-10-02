/* Per-creature intent badges and the intent inspector (battle addendum §13).
 *
 * Each creature still standing has one badge at its place in the formation: where it rests, not
 * its animated body, so a badge never chases a lunge. A badge shows the move's symbol, the strength
 * the telegraph already states and, where names repeat, the instance mark ("A", "B") that the
 * creature's slip and the banner carry too. A badge never targets, chooses or hurries anything:
 * targeting stays on the creature itself and on its slip.
 *
 *   pointer resting on a badge (200 ms) or keyboard focus on it → a preview card; a press → the
 *   card pinned (one at a time: pressing another badge switches; pressing the pinned badge again
 *   closes). Close, or Escape, closes. The pointer can move into a preview; it closes once the
 *   pointer has left both badge and card. Word help or a keyword note opened from the card does
 *   not close it.
 *
 *   RB.battleIntents.attach(root, env) / detach()     one per encounter (the combat overlay)
 *     env.cardHtml(i) → the card's HTML for creature i (80_combat.js builds it from what the
 *     telegraph reveals, never from hidden rules data)
 *   RB.battleIntents.render(items, { quiet })        items: [{ i, mark, name, icon, label, short,
 *     reading, answered, actor }] for the creatures standing; quiet: an exchange is playing (no
 *     input; large cards closed)
 *   RB.battleIntents.place(rects, bounds, cardBounds) rects: [{ i, x, y, w }] where each creature
 *     rests; bounds: { x, y, w, h } where badges may sit (the scene); cardBounds: where the card
 *     may open (never over the party slip or the writing pad); all in page px
 *   RB.battleIntents.close(back) / isOpen() / state()
 *
 * Badges and the card are scoped to the overlay; nothing here reads or changes the rules. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.battleIntents = (function () {
  'use strict';
  const HOVER_MS = 200, LEAVE_MS = 280, GAP = 4, EDGE = 4;
  const esc = (t) => RB.util.esc(t == null ? '' : String(t));
  const I = (n) => (RB.learnUi ? RB.learnUi.icon(n) : '');
  let root = null, layer = null, card = null, env = null, onKey = null;
  let items = [], open = null, quiet = false, hoverT = null, leaveT = null, key = '';
  let geo = { rects: [], bounds: null, card: null };
  const counters = { previews: 0, pins: 0, closes: 0 };

  function attach(r, e) {
    detach();
    if (!r || typeof document === 'undefined') return;
    root = r; env = e || {};
    layer = document.createElement('div');
    layer.className = 'cb-badges';
    layer.setAttribute('role', 'group');
    layer.setAttribute('aria-label', 'What each creature is about to do');
    card = document.createElement('div');
    card.className = 'cb-icard paper';
    card.id = 'cb-icard';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'false');
    card.hidden = true;
    root.appendChild(layer);
    root.appendChild(card);
    layer.addEventListener('pointerover', over);
    layer.addEventListener('pointerout', out);
    layer.addEventListener('click', press);
    layer.addEventListener('focusin', focusIn);
    layer.addEventListener('focusout', focusOut);
    card.addEventListener('pointerover', (ev) => { if (ev.pointerType === 'mouse') stopLeave(); });
    card.addEventListener('pointerout', out);
    card.addEventListener('focusout', focusOut);
    card.addEventListener('click', (ev) => { if (ev.target.closest && ev.target.closest('[data-ic-close]')) close(true); });
    // Escape closes the card (after an open keyword note or word help has taken its own Escape)
    onKey = (ev) => {
      if (ev.key !== 'Escape' || !open || ev.defaultPrevented) return;
      if (RB.ui && RB.ui.help && RB.ui.help.isOpen && RB.ui.help.isOpen()) return;
      close(open.how !== 'preview');
      ev.preventDefault(); ev.stopPropagation();
    };
    document.addEventListener('keydown', onKey, true);
  }
  function detach() {
    clearTimers();
    if (onKey) document.removeEventListener('keydown', onKey, true);
    if (layer) layer.remove();
    if (card) card.remove();
    root = layer = card = env = onKey = null;
    items = []; open = null; quiet = false; key = ''; geo = { rects: [], bounds: null, card: null };
  }
  function clearTimers() { clearTimeout(hoverT); clearTimeout(leaveT); hoverT = leaveT = null; }
  function stopLeave() { clearTimeout(leaveT); leaveT = null; }
  const badgeOf = (t) => (t && t.closest && layer && layer.contains(t) ? t.closest('.cb-ib') : null);
  const idx = (b) => +b.getAttribute('data-ib');
  // help opened from inside the card belongs to it
  const inside = (t) => !!(t && ((card && card.contains(t)) || badgeOf(t) || (t.closest && t.closest('.kwcard, #overlay > .help'))));

  // ---- the badges ----------------------------------------------------------------------------
  function render(list, o) {
    if (!layer) return;
    o = o || {};
    const wasQuiet = quiet;
    quiet = !!o.quiet;
    items = (list || []).slice();
    if (quiet && !wasQuiet) close(false); // committed: inspection cards close (§13.5)
    layer.classList.toggle('quiet', quiet);
    layer.inert = quiet;
    if (quiet) layer.setAttribute('aria-hidden', 'true'); else layer.removeAttribute('aria-hidden');
    const k = JSON.stringify(items.map((x) => [x.i, x.mark, x.icon, x.label, x.short, x.answered, x.actor, x.reading, open && open.i === x.i ? open.how : '']));
    if (k === key) return;
    key = k;
    const focused = document.activeElement && layer.contains(document.activeElement) ? idx(document.activeElement.closest('.cb-ib') || document.activeElement) : null;
    layer.innerHTML = items.map((x) => {
      const on = open && open.i === x.i;
      const lbl = x.name + (x.mark ? ' ' + x.mark : '') + ': about to ' + x.label + (x.answered ? ' (answered)' : '') + '. Details';
      return '<button type="button" class="cb-ib' + (x.answered ? ' answered' : '') + (x.actor ? ' acting' : '') + (x.reading ? ' reading' : '') + (on ? ' open' : '') + '" data-ib="' + x.i + '"' +
        ' aria-expanded="' + (on ? 'true' : 'false') + '" aria-controls="cb-icard" aria-label="' + esc(lbl) + '">' +
        '<span class="ib-ic" aria-hidden="true">' + I(x.answered ? 'done' : x.icon) + '</span>' +
        (x.short ? '<span class="ib-s" aria-hidden="true">' + esc(x.short) + '</span>' : '') +
        (x.mark ? '<span class="ib-m" aria-hidden="true">' + esc(x.mark) + '</span>' : '') + '</button>';
    }).join('');
    if (focused != null) { const b = layer.querySelector('[data-ib="' + focused + '"]'); if (b) b.focus({ preventScroll: true }); }
    // a creature that settled takes its badge (and its card) with it
    if (open && !items.some((x) => x.i === open.i)) close(false);
    else if (open) fill(open.i);
    layout();
  }
  function place(rects, bounds, cardBounds) {
    if (!layer) return;
    geo = { rects: rects || [], bounds: bounds || null, card: cardBounds || bounds || null };
    // no scene to put them in (a stage squeezed to nothing): the badges stand down and the
    // creatures' slips carry their moves alone
    layer.classList.toggle('nostage', !geo.bounds);
    if (!geo.bounds) { close(false); return; }
    layout();
  }
  function rel() {
    const r = root.getBoundingClientRect();
    return { x: r.left - root.scrollLeft, y: r.top - root.scrollTop };
  }
  // Each badge centred above its creature's resting place, inside the safe area; neighbours that
  // would overlap are pushed apart in formation order, and when the row cannot fit they line up
  // as a rail along the top of the scene (still in formation order, each with its mark).
  function layout() {
    if (!layer || !geo.bounds) return;
    const o = rel(), B = geo.bounds;
    const bs = [...layer.querySelectorAll('.cb-ib')];
    if (!bs.length) return;
    const ws = bs.map((b) => b.offsetWidth || 44), hs = bs.map((b) => b.offsetHeight || 44);
    const at = bs.map((b, k) => {
      const q = geo.rects.find((r) => r.i === idx(b));
      const cx = q ? q.x + q.w / 2 : B.x + B.w * (0.5 + k * 0.15);
      const top = q ? q.y - hs[k] - GAP : B.y + EDGE;
      return { k, x: cx - ws[k] / 2, y: Math.max(B.y + EDGE, Math.min(top, B.y + B.h - hs[k] - EDGE)) };
    }).sort((a, b) => a.x - b.x || a.k - b.k);
    const lo = B.x + EDGE, hi = B.x + B.w - EDGE;
    let total = 0;
    for (const a of at) total += ws[a.k] + GAP;
    const rail = total - GAP > hi - lo;
    if (rail) {
      let x = lo;
      for (const a of at) { a.x = x; a.y = B.y + EDGE; x += ws[a.k] + GAP; }
    } else {
      for (let n = 0; n < at.length; n++) {
        const a = at[n];
        a.x = Math.max(lo, a.x);
        if (n) { const p = at[n - 1]; if (Math.abs(p.y - a.y) < hs[a.k] && a.x < p.x + ws[p.k] + GAP) a.x = p.x + ws[p.k] + GAP; }
      }
      // overflow at the right edge: shift the row back left
      for (let n = at.length - 1; n >= 0; n--) {
        const a = at[n], lim = n === at.length - 1 ? hi : at[n + 1].x - GAP;
        if (a.x + ws[a.k] > lim) a.x = Math.max(lo, lim - ws[a.k]);
      }
    }
    layer.classList.toggle('rail', rail);
    layer.classList.add('placed');
    for (const a of at) {
      const b = bs[a.k];
      b.style.left = Math.round(a.x - o.x) + 'px';
      b.style.top = Math.round(a.y - o.y) + 'px';
    }
    if (open) position();
  }

  // ---- the card ------------------------------------------------------------------------------
  function fill(i) {
    const x = items.find((q) => q.i === i);
    if (!x || !card) return;
    let body = '';
    try { body = env && env.cardHtml ? env.cardHtml(i) : ''; } catch (e) { console.error('intent card', e); body = ''; }
    card.innerHTML = '<div class="ic-h"><span class="ic-ic" aria-hidden="true">' + I(x.icon) + '</span>' +
      '<b id="cb-icard-h">' + esc(x.name) + (x.mark ? ' <span class="ib-m">' + esc(x.mark) + '</span>' : '') + '</b>' +
      '<button type="button" class="pbtn quiet ic-x" data-ic-close aria-label="Close">' + I('close') + '</button></div>' +
      '<div class="ic-b">' + body + '</div>';
    card.setAttribute('aria-labelledby', 'cb-icard-h');
    card.dataset.foe = String(i);
  }
  function show(i, how) {
    if (!card || quiet || !geo.bounds || !items.some((x) => x.i === i)) return;
    clearTimers();
    const was = open;
    open = { i, how };
    if (how === 'pin') counters.pins++; else counters.previews++;
    if (!was || was.i !== i || !card.innerHTML) fill(i);
    card.hidden = false;
    card.classList.toggle('pinned', how === 'pin');
    for (const b of layer.querySelectorAll('.cb-ib')) {
      const on = idx(b) === i;
      b.classList.toggle('open', on);
      b.setAttribute('aria-expanded', on ? 'true' : 'false');
    }
    key = '';
    position();
  }
  function close(back) {
    clearTimers();
    if (!open) return;
    const i = open.i;
    open = null;
    counters.closes++;
    if (card) { card.hidden = true; card.innerHTML = ''; card.classList.remove('pinned'); delete card.dataset.foe; }
    if (layer) for (const b of layer.querySelectorAll('.cb-ib')) { b.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); }
    key = '';
    // focus returns to the badge when it was inside the card (or the card was pinned from it)
    if (back && layer && !quiet) {
      const a = document.activeElement;
      if (!a || a === document.body || (card && card.contains(a)) || badgeOf(a)) { const b = layer.querySelector('[data-ib="' + i + '"]'); if (b) b.focus({ preventScroll: true }); }
    }
  }
  // Below the badge where there is room, otherwise above it; always inside the safe area (never
  // over the party slip or the writing pad). A card taller than the room scrolls inside itself.
  function position() {
    if (!card || card.hidden || !open || !geo.card) return;
    const b = layer.querySelector('[data-ib="' + open.i + '"]');
    if (!b) return;
    const o = rel(), B = geo.card;
    const br = b.getBoundingClientRect();
    const w = Math.min(340, B.w - 2 * EDGE);
    card.style.width = Math.max(160, w) + 'px';
    card.style.maxHeight = '';
    const below = B.y + B.h - EDGE - (br.bottom + GAP), above = br.top - GAP - (B.y + EDGE);
    const h0 = card.scrollHeight;
    let y, room;
    if (h0 <= below || below >= above) { y = br.bottom + GAP; room = below; } else { room = above; y = br.top - GAP - Math.min(h0, room); }
    card.style.maxHeight = Math.max(80, Math.floor(room)) + 'px';
    const cw = card.offsetWidth;
    const x = Math.max(B.x + EDGE, Math.min(br.left + br.width / 2 - cw / 2, B.x + B.w - EDGE - cw));
    card.style.left = Math.round(x - o.x) + 'px';
    card.style.top = Math.round(y - o.y) + 'px';
  }

  // ---- input -----------------------------------------------------------------------------------
  function over(ev) {
    if (ev.pointerType !== 'mouse' || quiet) return;
    const b = badgeOf(ev.target);
    if (!b) return;
    stopLeave();
    if (open && (open.how === 'pin' || open.i === idx(b))) return; // a pinned card stays until closed or switched
    clearTimeout(hoverT);
    hoverT = setTimeout(() => { hoverT = null; if (b.isConnected) show(idx(b), 'preview'); }, HOVER_MS);
  }
  function out(ev) {
    if (ev.pointerType !== 'mouse') return;
    if (inside(ev.relatedTarget)) return;
    clearTimeout(hoverT); hoverT = null;
    if (open && open.how === 'preview') { stopLeave(); leaveT = setTimeout(() => { leaveT = null; if (open && open.how === 'preview') close(false); }, LEAVE_MS); }
  }
  function press(ev) {
    const b = badgeOf(ev.target);
    if (!b || quiet) return;
    const i = idx(b);
    if (open && open.i === i && open.how === 'pin') { close(false); return; }
    show(i, 'pin');
  }
  function focusIn(ev) {
    const b = badgeOf(ev.target);
    if (!b || quiet || (open && open.how === 'pin')) return;
    let kb = false;
    try { kb = b.matches(':focus-visible'); } catch (e) { kb = false; }
    if (kb) show(idx(b), 'focus');
  }
  function focusOut(ev) {
    if (!open || open.how === 'pin' || inside(ev.relatedTarget)) return;
    if (open.how === 'focus') close(false);
  }

  function state() {
    const bs = layer ? [...layer.querySelectorAll('.cb-ib')] : [];
    return {
      badges: bs.map((b) => { const r = b.getBoundingClientRect(); return { i: idx(b), label: b.getAttribute('aria-label'), text: b.textContent, open: b.classList.contains('open'), acting: b.classList.contains('acting'), answered: b.classList.contains('answered'), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; }),
      open: open ? { i: open.i, how: open.how } : null, quiet, rail: !!(layer && layer.classList.contains('rail')),
      card: card && !card.hidden ? (() => { const r = card.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), text: card.textContent.replace(/\s+/g, ' ').trim() }; })() : null,
      counters: Object.assign({}, counters),
    };
  }
  return { attach, detach, render, place, close, isOpen: () => !!open, state, HOVER_MS };
})();
