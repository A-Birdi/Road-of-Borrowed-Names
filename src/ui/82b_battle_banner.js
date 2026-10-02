/* The top action banner (battle addendum §15): it names the action being performed and
 * animated now, and nothing else — never while choosing, reading, writing, choosing your
 * companion's support, between actions, during a result, in exploration or with Instant
 * playback. Blue for an action of the party (you, your companion, a technique you share),
 * red for a creature's (its own buff included); the colour is never alone: the actor's name
 * and a party / creature mark say it too.
 *
 *   RB.battleBanner.attach(root) / detach()   one per encounter (the combat overlay)
 *   RB.battleBanner.show(action) → token       action: { id, side: 'party'|'enemy', actor: {en, jp?},
 *                                               label: {en, jp?} } — the sequencer calls it at the
 *                                               action's first frame
 *   RB.battleBanner.hide(token, now)           only the token that showed it can hide it (a late
 *                                               callback from an earlier action cannot clear or
 *                                               overwrite a newer one); `now` drops it at once
 *   RB.battleBanner.clear()                    scene exit, campaign change, an error path
 *   RB.battleBanner.state()                    { visible, id, side, text } (tests)
 *
 * It is not clickable, takes no input, reserves no space (it overlays the scene) and is
 * announced to assistive technology once per action. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.battleBanner = (function () {
  'use strict';
  const esc = (t) => RB.util.esc(t == null ? '' : String(t));
  let el = null, sr = null, cur = null, gen = 0, outT = null, host = null;
  const counters = { shown: 0, hidden: 0, refused: 0 };

  function attach(root) {
    detach();
    if (!root || typeof document === 'undefined') return;
    el = document.createElement('div');
    el.className = 'cb-banner';
    el.setAttribute('aria-hidden', 'true');
    el.inert = true; // no focus, no pointer: its Japanese words are not word-help targets
    sr = document.createElement('div');
    sr.className = 'sr cb-banner-sr';
    sr.setAttribute('role', 'status');
    sr.setAttribute('aria-live', 'polite');
    root.appendChild(el);
    root.appendChild(sr);
    // the overlay scrolls with large text: the banner keeps to the top of what is in view
    host = root;
    host.addEventListener('scroll', follow, { passive: true });
  }
  function detach() {
    clear();
    if (host) host.removeEventListener('scroll', follow);
    if (el) el.remove();
    if (sr) sr.remove();
    el = sr = host = null;
  }
  function follow() { if (el && host) el.style.setProperty('--bn-scroll', host.scrollTop + 'px'); }
  function blank() {
    if (outT) { clearTimeout(outT); outT = null; }
    if (!el) return;
    el.className = 'cb-banner';
    el.innerHTML = '';
    delete el.dataset.action;
    delete el.dataset.side;
  }
  function show(a) {
    if (!el || !a) { counters.refused++; return null; }
    blank();
    const token = { n: ++gen, id: a.id || '', side: a.side === 'enemy' ? 'enemy' : 'party' };
    cur = token;
    const actor = a.actor || {}, label = a.label || {};
    const jp = (x) => (x && x.jp ? '<span class="bn-jp" lang="ja">' + RB.ui.jhtml(x.jp) + '</span> ' : '');
    el.innerHTML =
      '<span class="bn-mark" aria-hidden="true">' + (RB.learnUi ? RB.learnUi.icon(token.side === 'enemy' ? 'strike' : 'join') : '') + '</span>' +
      '<span class="bn-actor">' + esc(actor.en || '') + '</span><span class="bn-sep" aria-hidden="true">—</span>' +
      '<span class="bn-act">' + jp(label) + '<span class="bn-en">' + esc(label.en || '') + '</span></span>';
    el.dataset.action = token.id;
    el.dataset.side = token.side;
    el.className = 'cb-banner on side-' + token.side;
    follow();
    if (sr) sr.textContent = (actor.en ? actor.en + ': ' : '') + (label.en || '');
    counters.shown++;
    return token;
  }
  function hide(token, now) {
    if (!token || token !== cur) return false; // not the action on screen now
    cur = null;
    counters.hidden++;
    if (!el) return true;
    if (now || (RB.game && RB.game.reducedMotion && RB.game.reducedMotion())) { blank(); return true; }
    el.classList.remove('on');
    el.classList.add('off');
    // the exit fits inside the action's last moments: blank when it has run (never after a newer one)
    const mine = gen;
    outT = setTimeout(() => { outT = null; if (!cur && gen === mine) blank(); }, 140);
    return true;
  }
  function clear() { cur = null; blank(); if (sr) sr.textContent = ''; }
  function state() {
    return { visible: !!cur, id: cur ? cur.id : null, side: cur ? cur.side : null, shown: !!(el && el.classList.contains('on')), text: el ? el.textContent.replace(/\s+/g, ' ').trim() : '', counters: Object.assign({}, counters) };
  }
  return { attach, detach, show, hide, clear, state };
})();
