/* Inkweaving — plain-language help for what is on the battle screen: the
 * telegraphed move, the states in play (Heat, mist, Gathering, Hush, wards)
 * and Harmony.
 *
 * - Keywords (`.kw[data-kw]` buttons) open a small note card on hover,
 *   keyboard focus or a tap/click. Wide screens: a card beside the keyword.
 *   Narrow screens, when tapped or focused: a sheet along the bottom edge.
 *   Close is always in its header; Escape closes it; a tap outside a card
 *   opened by a tap only closes the card (it never also chooses a response).
 *   Same materials as the word-help card.
 * - Every number in the text comes from RB.combatLogic (blowOf, heatBonus,
 *   HEAT, TECHS, answers), so it states the rules the exchange applies.
 * - One-time coach marks (a companion's Harmony, a full Harmony, the first
 *   time each kind of move is telegraphed) and the "New" response marker are
 *   recorded in the campaign as s.tips {key: 1}. The field is created on first
 *   use; saves from before it existed have their known words and (with a
 *   companion) the Harmony introduction marked as already seen, so a long
 *   campaign is not suddenly full of "New" labels. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.combatHelp = (function () {
  'use strict';
  const esc = RB.util.esc;
  const L = () => RB.combatLogic;
  const I = (n) => RB.learnUi.icon(n);
  const C = () => RB.content;

  // ---- words the player knows that answer a move --------------------------------
  const wj = (w) => '<span class="kwj" lang="ja">' + esc(w.jp) + '</span> (' + esc(w.en) + ')';
  const list = (ws) => ws.map(wj).join(' or ');
  const cancels = (words, kind) => words.filter((w) => L().answers(w).indexOf(kind) >= 0);
  const withTag = (words, tags) => words.filter((w) => (w.tags || []).some((t) => tags.indexOf(t) >= 0));
  function compName(st) {
    const c = st.compId && C().chars[st.compId];
    return c ? c.name.en : 'your companion';
  }

  // ---- the numbers of a blow --------------------------------------------------------
  function blowText(st, it) {
    const b = L().blowOf(st, it);
    if (!b) return null;
    const parts = [];
    const hb = L().heatBonus(st);
    if (hb) parts.push('+' + hb + ' from Heat');
    if (st.charged && (it.kind === 'strike' || it.kind === 'sweep')) parts.push('+2 from Gathering');
    return { n: b.per, extra: parts.length ? ' (' + parts.join(', ') + ')' : '' };
  }
  // A few words beside the move's name, so the telegraph reads at a glance.
  function gist(st, it) {
    const b = L().blowOf(st, it);
    const n = b ? b.per : 0;
    const H = L().HEAT;
    switch (it.kind) {
      case 'strike': case 'lie': case 'mirror': case 'chill':
        return st.compId ? n + ' to one of you' : n + ' to you';
      case 'sweep': case 'flood': return st.compId ? n + ' to each of you' : n + ' to you';
      case 'gust': return n + ' to you, strips wards';
      case 'heat': return (st.heat || 0) >= H.max ? 'already at its hottest (' + H.max + ')' : 'rises by 1 unless cooled';
      case 'shroud': return 'hides its knots';
      case 'charge': return 'next blow +2';
      case 'mend': return 're-ties a knot';
      case 'plea': return 'asks, does not attack';
      case 'rest': return 'does nothing';
      case 'silence': return 'blocks Unravel';
      default: return '';
    }
  }

  // ---- what a move does and what answers it --------------------------------------------
  // Returns {title, what, answer} (HTML strings).
  function intentInfo(st, it, words) {
    const b = blowText(st, it) || { n: 0, extra: '' };
    const duo = !!st.compId;
    const H = L().HEAT;
    const k = it.kind;
    const known = cancels(words, k);
    const noneYet = (what) => what + ' — you don\'t know one yet.';
    let title = it.label, what = '', answer = '';
    if (k === 'strike') {
      title = 'Strike — a blow at one of you';
      what = duo ? 'It hits one of you for ' + b.n + b.extra + '. The Japanese says who.' : 'It hits you for ' + b.n + b.extra + '.';
      answer = known.length ? 'Raise a ward in front of the one it is aiming at — use ' + list(known) + ': that blocks it completely.' : 'Nothing you know blocks it yet: Unravel and take the blow.';
    } else if (k === 'sweep') {
      title = duo ? 'Sweep — a group attack on both of you' : 'Sweep — a wide blow';
      what = duo ? 'It hits both of you at once: ' + b.n + ' each' + b.extra + '.' : 'It hits you for ' + b.n + b.extra + ' (with a companion, it would hit you both).';
      answer = 'Nothing cancels it outright. ' + (withTag(words, ['ward']).length ? 'A ward (use ' + list(withTag(words, ['ward'])) + ') soaks up to 2 of it for the one it guards.' : '');
    } else if (k === 'heat') {
      title = 'Heat — it is heating up';
      const lvl = st.heat || 0;
      what = lvl >= H.max
        ? 'It is already at Heat ' + H.max + ', the most: every blow it lands hits +' + H.max * H.per + ' harder until it is cooled.'
        : 'Left alone, its Heat rises to ' + (lvl + 1) + ': every blow it lands then hits +' + (lvl + 1) * H.per + ' harder, until it is cooled (+' + H.per + ' per level, at most +' + H.max * H.per + ').';
      answer = known.length ? 'Water cools it: use ' + list(known) + ' — that stops this and clears all Heat.' : noneYet('Water words cool it');
    } else if (k === 'shroud') {
      title = 'Shroud — it hides in mist';
      what = 'Left alone, mist hides its knots: while it is Shrouded you can\'t Unravel.';
      answer = known.length ? 'Light or wind clears it: use ' + list(known) + ' — that stops this and keeps the mist away.' : 'You know no light or wind word yet, so the mist can\'t block your Unravel.';
    } else if (k === 'charge') {
      title = 'Gathering — it is building up force';
      what = 'Left alone, its next Strike or Sweep hits +2 harder.';
      answer = (known.length ? 'Binding holds it: use ' + list(known) + ' — that stops it.' : noneYet('A binding word stops it')) +
        (st.compId === 'ren' ? ' Ren\'s lamp also interrupts it whenever you answer correctly.' : '');
    } else if (k === 'gust') {
      title = 'Gust — a wind that tears wards away';
      what = 'It strips every ward you have' + (duo ? ' (both of you)' : '') + ' and hits you for ' + b.n + b.extra + '.';
      answer = known.length ? 'Holding firm cancels it: use ' + list(known) + '.' : noneYet('A word that holds firm, like stone, cancels it');
    } else if (k === 'mend') {
      title = 'Re-tying — it ties a knot back up';
      what = 'Left alone, one knot you loosened is tied again.' + (st.knots >= st.maxKnots ? ' No knot is loose yet, so it would change nothing.' : '');
      answer = known.length ? 'Rope or light stops it: use ' + list(known) + '.' : noneYet('Rope or light stops it');
    } else if (k === 'lie') {
      title = 'False promise — a lie with a blow behind it';
      what = 'It says something untrue; if you let it stand, it hits ' + (duo ? 'one of you' : 'you') + ' for ' + b.n + b.extra + '.';
      answer = 'Choose See through (<span class="kwj" lang="ja">みぬく</span>) and say what is false: that stops the blow.' +
        (st.compId === 'suzu' ? ' With Suzu beside you, a correct Unravel also stops it.' : '');
    } else if (k === 'plea') {
      title = 'Plea — it is asking you something';
      what = 'It isn\'t attacking. If you don\'t answer, nothing happens — but the moment passes.';
      answer = 'Choose Answer (<span class="kwj" lang="ja">こたえる</span>) and reply to what it is really asking: that loosens a knot.';
    } else if (k === 'rest') {
      title = 'Waiting — it holds still';
      what = 'It does nothing this turn.';
      answer = 'A free moment: Unravel, heal, or raise a ward for later.';
    } else if (k === 'flood') {
      title = 'Flood — water at both of you';
      what = duo ? 'It hits both of you: ' + b.n + ' each' + b.extra + '.' : 'It hits you for ' + b.n + b.extra + '.';
      answer = (known.length ? 'Stone or earth banks it and cancels it: use ' + list(known) + '.' : noneYet('Stone or earth cancels it')) +
        (withTag(words, ['ward']).length ? ' A ward soaks up to 2 of it for the one it guards.' : '');
    } else if (k === 'chill') {
      title = 'Chill — a freezing breath at one of you';
      what = duo ? 'It hits one of you for ' + b.n + b.extra + '. The Japanese says who.' : 'It hits you for ' + b.n + b.extra + '.';
      answer = known.length ? 'Fire or warmth cancels it: use ' + list(known) + '.' : noneYet('A fire or warm word cancels it');
    } else if (k === 'silence') {
      title = 'Hush — it drains the sound away';
      what = 'Left alone, you are Hushed: your words can\'t reach its knots, so you can\'t Unravel until the hush breaks.';
      answer = known.length ? 'A bell or a voice breaks it: use ' + list(known) + ' — that stops this and breaks any hush.' : 'You know no bell or voice word yet, so the hush can\'t block your Unravel.';
    } else if (k === 'mirror') {
      title = 'Mirror — your words, turned inside out';
      what = 'It repeats something real but twists it, and hits ' + (duo ? 'one of you' : 'you') + ' for ' + b.n + b.extra + '.';
      const light = withTag(words, ['light']);
      answer = 'Choose See through (<span class="kwj" lang="ja">みぬく</span>) and say what it changed: that stops the blow and loosens a knot.' +
        (light.length ? ' Light also stops the blow: ' + list(light) + '.' : '');
    }
    return { title, what, answer };
  }

  // ---- states in play ------------------------------------------------------------------------
  // key: 'heat' | 'shroud' | 'charge' | 'silence' | 'ward:pc' | 'ward:comp'
  function statusInfo(st, key, words, names) {
    const H = L().HEAT;
    if (key === 'heat') {
      const w = cancels(words, 'heat');
      return {
        title: 'Heat ' + st.heat + ' of ' + H.max + ' — overheating',
        what: 'While it lasts, every blow it lands hits +' + L().heatBonus(st) + ' harder. It rises by 1 each time a Heat move is left unanswered (at most ' + H.max + ').',
        answer: w.length ? 'Water cools it completely: use ' + list(w) + '.' : 'Water words cool it — you don\'t know one yet.',
      };
    }
    if (key === 'shroud') {
      const w = cancels(words, 'shroud');
      return {
        title: 'Shrouded — its knots are hidden',
        what: w.length ? 'Mist hides its knots: you can\'t Unravel until the mist clears.' : 'Mist hides its knots, but while you know no light or wind word it can\'t block your Unravel.',
        answer: w.length ? 'Light or wind clears it: use ' + list(w) + '.' : '',
      };
    }
    if (key === 'charge') {
      const w = cancels(words, 'charge');
      return {
        title: 'Gathering — force held back',
        what: 'Its next Strike or Sweep hits +2 harder; then the force is spent.',
        answer: w.length ? 'Binding spills it away: use ' + list(w) + '.' : 'A binding word spills it away — you don\'t know one yet.',
      };
    }
    if (key === 'silence') {
      const w = cancels(words, 'silence');
      return {
        title: 'Hushed — words can\'t reach its knots',
        what: w.length ? 'You can\'t Unravel until the hush breaks.' : 'While you know no bell or voice word, it can\'t block your Unravel.',
        answer: w.length ? 'A bell or a voice breaks it: use ' + list(w) + '.' : '',
      };
    }
    if (key === 'ward:pc' || key === 'ward:comp') {
      const who = key.slice(5);
      const n = st.ward[who] || 0;
      const nm = names[who];
      return {
        title: 'Ward ' + n + ' — in front of ' + nm,
        what: 'It soaks up the next ' + n + ' damage aimed at ' + nm + '.',
        answer: 'Raised in front of the one a Strike is aiming at, a ward blocks that Strike completely. A Gust tears all wards away.',
      };
    }
    return null;
  }

  // ---- several creatures -----------------------------------------------------------------------
  // How a group works, in one note (the "More" of the first group encounter,
  // and every telegraph's card while there is more than one creature).
  function groupNote() {
    return 'More than one creature: each shows its own move before you choose, and each acts in turn after you. ' +
      'Your response acts on the one you target (the ink bracket at its feet) — press it, or its slip, or use the arrow keys on the slips, or [ and ]. ' +
      'Some responses reach further: water and wind reach every creature; stone, warmth, a bell or a voice guard you both against that move from every creature. ' +
      'Unravel, Answer, See through, light and rope act on your target alone; a ward stands before the one you raise it for. ' +
      'Each response card says whom it acts on, and pointing at one marks them. A creature whose knots are all free settles and stops; the encounter ends when every one has settled.';
  }

  // ---- Harmony ------------------------------------------------------------------------------
  function techOf(st) {
    return L().TECHS[st.compId] || { name: 'Coordinated technique', knots: 1, effect: '' };
  }
  function harmonyInfo(st) {
    const s = RB.game.s;
    const cn = compName(st);
    const T = techOf(st);
    const full = st.harmony >= st.harmonyMax;
    const charm = s && s.equip && s.equip.charm && C().items[s.equip.charm];
    const head = charm && charm.effect && charm.effect.harmonyStart ? ' Your ' + esc(charm.name.en) + ' starts it at ' + charm.effect.harmonyStart + '.' : '';
    return {
      title: 'Harmony — you and ' + esc(cn) + ', in step',
      now: full ? 'Full (' + st.harmony + ' of ' + st.harmonyMax + '): ' + esc(T.name) + ' is ready among your responses.'
        : 'Now ' + st.harmony + ' of ' + st.harmonyMax + ': ' + (st.harmonyMax - st.harmony) + ' more to go.',
      fills: 'It fills by 1 each time you answer right first time with a response that cancels its move — or with Unravel. A slip, or a response that cancels nothing, adds nothing.',
      offers: esc(cn) + '\'s coordinated technique joins your responses: <b>' + esc(T.name) + '</b>. ' + esc(T.effect) + ' It also cancels its move, and uses up Harmony.',
      more: 'Each companion has one technique; who travels with you decides which. Harmony starts from 0 in every encounter.' + head,
    };
  }

  // ---- the note card -----------------------------------------------------------------------
  let card = null, anchor = null, via = 'hover', provider = null, hideTimer = 0;
  function isOpen() { return !!card; }
  function ensure() {
    if (card) return card;
    card = document.createElement('div');
    card.className = 'kwcard';
    card.id = 'kwcard';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-labelledby', 'kwcard-t');
    card.addEventListener('click', (e) => { if (e.target.closest('[data-kwclose]')) { const a = anchor; hide(); if (a && a.isConnected && via !== 'hover') a.focus({ preventScroll: true }); } });
    card.addEventListener('pointerleave', (e) => { if (via === 'hover' && e.pointerType === 'mouse') later(); });
    card.addEventListener('pointerenter', () => clearTimeout(hideTimer));
    document.getElementById('overlay').appendChild(card);
    return card;
  }
  function render(a) {
    const key = a.getAttribute('data-kw');
    const info = provider ? provider(key) : null;
    if (!info) return false;
    ensure();
    card.innerHTML = '<div class="kw-h">' + (info.icon ? I(info.icon) : '') + '<h3 id="kwcard-t">' + info.title + '</h3>' +
      '<button class="kw-x" data-kwclose aria-label="Close this note">' + I('close') + '<span>Close</span></button></div>' +
      '<div class="kw-b" aria-live="polite">' + info.body + '</div>';
    return true;
  }
  function position(a) {
    const narrow = window.innerWidth < 600;
    const sheet = narrow && via !== 'hover';
    card.classList.toggle('sheet', sheet);
    if (sheet) { card.style.left = ''; card.style.top = ''; return; }
    const r = a.getBoundingClientRect();
    const w = Math.min(380, window.innerWidth - 16);
    card.style.width = w + 'px';
    card.style.left = Math.round(Math.min(window.innerWidth - w - 8, Math.max(8, r.left + r.width / 2 - w / 2))) + 'px';
    const h = card.offsetHeight || 160;
    // beside the panel the keyword sits in (below the telegraph, above the
    // party), so the card never covers the line being read
    let box = (a.closest('.intent, .cb-party, .cb-coach, .cb-foe') || a).getBoundingClientRect();
    // the foe's slip sits over the telegraph: open below both
    const tele = a.closest('.cb-foe') && document.querySelector('.combat-ui .intent');
    if (tele) { const t = tele.getBoundingClientRect(); box = { top: Math.min(box.top, t.top), bottom: Math.max(box.bottom, t.bottom) }; }
    let top = box.bottom + 8;
    if (top + h > window.innerHeight - 8) top = box.top - h - 8;
    if (top < 8) { top = r.bottom + 8; if (top + h > window.innerHeight - 8) top = Math.max(8, window.innerHeight - h - 8); }
    card.style.top = Math.round(top) + 'px';
  }
  function show(a, how) {
    clearTimeout(hideTimer);
    if (anchor && anchor !== a) anchor.setAttribute('aria-expanded', 'false');
    via = how;
    if (!render(a)) return;
    anchor = a;
    a.setAttribute('aria-expanded', 'true');
    position(a);
  }
  function hide() {
    clearTimeout(hideTimer);
    if (anchor) anchor.setAttribute('aria-expanded', 'false');
    anchor = null;
    if (card) { card.remove(); card = null; }
  }
  function later() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { if (via === 'hover' && card && !card.matches(':hover') && !(anchor && anchor.matches(':hover'))) hide(); }, 250);
  }
  // refresh an open card after the screen re-rendered (its keyword was replaced)
  function refresh(root) {
    if (!card || !anchor) return;
    const key = anchor.getAttribute('data-kw');
    const a = root && root.querySelector('.kw[data-kw="' + key + '"]');
    if (!a) { hide(); return; }
    anchor = a;
    a.setAttribute('aria-expanded', 'true');
    render(a);
    position(a);
  }
  // Delegated listeners, installed once; `provider(key)` supplies the text
  // for the battle on screen ({title, body, icon}).
  let installed = false, lastKey = 0;
  function attach(fn) {
    provider = fn;
    if (installed) return;
    installed = true;
    const kwOf = (e) => (provider && e.target && e.target.closest ? e.target.closest('.kw[data-kw]') : null);
    document.addEventListener('pointerover', (e) => {
      if (e.pointerType !== 'mouse') return;
      const a = kwOf(e);
      if (!a || (card && via !== 'hover')) return;
      show(a, 'hover');
    });
    document.addEventListener('pointerout', (e) => {
      if (e.pointerType !== 'mouse' || via !== 'hover') return;
      const a = kwOf(e);
      if (a && a === anchor && !(card && card.contains(e.relatedTarget))) later();
    });
    document.addEventListener('keydown', (e) => {
      lastKey = Date.now();
      if (e.key === 'Escape' && card) { const a = anchor; hide(); if (a && a.isConnected && document.activeElement !== a && via !== 'hover') a.focus({ preventScroll: true }); e.stopPropagation(); e.preventDefault(); }
    }, true);
    document.addEventListener('focusin', (e) => {
      const a = kwOf(e);
      if (!a || Date.now() - lastKey > 1500 || !a.matches(':focus-visible')) return;
      show(a, 'key');
    });
    document.addEventListener('focusout', (e) => {
      const a = kwOf(e);
      if (a && a === anchor && via === 'key' && !(card && card.contains(e.relatedTarget))) setTimeout(() => { if (anchor === a && document.activeElement !== a && !(card && card.contains(document.activeElement))) hide(); }, 0);
    });
    document.addEventListener('click', (e) => {
      const a = kwOf(e);
      if (a) {
        e.stopPropagation(); e.preventDefault();
        const how = e.detail === 0 ? 'key' : 'tap';
        if (card && anchor === a && via === how && how === 'tap') { hide(); return; }
        show(a, how);
        return;
      }
      if (card && !card.contains(e.target)) {
        // a card opened by a tap pauses what is under it: this tap only closes it
        const blocking = via === 'tap';
        hide();
        if (blocking) { e.stopPropagation(); e.preventDefault(); }
      }
    }, true);
    window.addEventListener('resize', () => { if (card && anchor && anchor.isConnected) position(anchor); else if (card) hide(); });
  }
  function detach() { hide(); provider = null; }

  // ---- one-time notes (s.tips) ---------------------------------------------------------------
  function tips(s) {
    if (!s.tips || typeof s.tips !== 'object') {
      s.tips = {};
      // a save from before these notes: what it has already used is not "new"
      if ((s.vars && s.vars.battlesWon) > 0) {
        for (const w of s.words || []) s.tips['word:' + w] = 1;
        if (s.comp) s.tips.harmony = 1;
      }
    }
    return s.tips;
  }
  function seen(s, key) { return !!tips(s)[key]; }
  function mark(s, key) { tips(s)[key] = 1; }

  return { gist, intentInfo, statusInfo, harmonyInfo, techOf, groupNote, compName, attach, detach, show, hide, isOpen, refresh, tips, seen, mark, list, cancels };
})();
