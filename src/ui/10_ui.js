/* UI core: DOM layers with keyboard/touch navigation, bilingual text
 * helpers, toasts, fades, confirmation dialogs and the lightbulb help. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui = (function () {
  'use strict';
  const esc = RB.util.esc;
  let root, overlay, notices, fadeEl;
  const layers = []; // {el, onAction, onCancel, name}

  function init() {
    root = document.getElementById('ui');
    overlay = document.getElementById('overlay');
    notices = el('div', 'notices');
    overlay.appendChild(notices);
    fadeEl = el('div', 'fade');
    overlay.appendChild(fadeEl);
    RB.input.buildTouchPad(root);
    RB.ui.help.init();
    // Software keyboard: the part of the layout viewport the visual viewport
    // no longer shows (ignored while pinch-zoomed), as --kb on :root and
    // body.kb-open, so fields and their buttons can stay above it.
    const vv = window.visualViewport;
    if (vv) {
      const upd = () => {
        const kb = vv.scale > 1.05 ? 0 : Math.max(0, Math.round(window.innerHeight - (vv.height + vv.offsetTop)));
        document.documentElement.style.setProperty('--kb', kb + 'px');
        document.body.classList.toggle('kb-open', kb > 80);
      };
      vv.addEventListener('resize', upd);
      vv.addEventListener('scroll', upd);
      upd();
    }
    document.addEventListener('keydown', (e) => {
      // keep Tab focus inside the top layer (or the wider `scope` it declares:
      // the battle's response list also lets focus reach the keywords above it)
      if (e.key === 'Tab' && layers.length) {
        const f = focusables(scopeOf(layers[layers.length - 1]));
        if (!f.length) return;
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
  }
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  // ---- layers & navigation -------------------------------------------------------
  function pushLayer(layer) {
    // a word-help card belongs to the layer it was opened from
    if (RB.ui.help) RB.ui.help.hide(true);
    layers.push(layer);
    (layer.parent || root).appendChild(layer.el);
    document.body.classList.add('in-panel');
    setTimeout(() => {
      if (layer.noAutofocus) return;
      const f = focusables(layer.el).filter((e) => !e.classList.contains('jt'));
      const pref = layer.el.querySelector('[autofocus], .autofocus');
      (pref || f[0]) && (pref || f[0]).focus({ preventScroll: true });
    }, 0);
    return layer;
  }
  function popLayer(layer) {
    if (RB.ui.help) RB.ui.help.hide(true);
    const i = layers.indexOf(layer);
    if (i >= 0) layers.splice(i, 1);
    if (layer.el.parentNode) layer.el.parentNode.removeChild(layer.el);
    if (!layers.length) document.body.classList.remove('in-panel');
    const top = layers[layers.length - 1];
    if (top) {
      // restored focus never lands on a Japanese word (that would pop its help card)
      const f = focusables(top.el).filter((e) => !e.classList.contains('jt'));
      if (f[0] && !top.el.contains(document.activeElement)) f[0].focus({ preventScroll: true });
    }
  }
  function topLayer() {
    return layers[layers.length - 1] || null;
  }
  // Where keyboard focus may move while a layer is on top: the layer itself,
  // or a larger `scope` element that contains it.
  function scopeOf(layer) {
    return (layer.scope && layer.scope.isConnected && layer.scope) || layer.el;
  }
  function focusables(container) {
    return Array.from(container.querySelectorAll('button:not([disabled]), [tabindex="0"], input, select, textarea')).filter((e) => e.offsetParent !== null && !e.closest('.hidden'));
  }
  function moveFocus(container, dir) {
    const f = focusables(container).filter((e) => !e.classList.contains('jt') || e === document.activeElement);
    if (!f.length) return;
    const cur = document.activeElement;
    if (!container.contains(cur)) { f[0].focus(); return; }
    const r0 = cur.getBoundingClientRect();
    const c0 = { x: r0.left + r0.width / 2, y: r0.top + r0.height / 2 };
    let best = null, bestD = Infinity;
    for (const e of f) {
      if (e === cur) continue;
      const r = e.getBoundingClientRect();
      const c = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      const dx = c.x - c0.x, dy = c.y - c0.y;
      const ok = dir === 'up' ? dy < -4 : dir === 'down' ? dy > 4 : dir === 'left' ? dx < -4 : dx > 4;
      if (!ok) continue;
      const along = dir === 'up' || dir === 'down' ? Math.abs(dy) : Math.abs(dx);
      const across = dir === 'up' || dir === 'down' ? Math.abs(dx) : Math.abs(dy);
      const d = along + across * 2.5;
      if (d < bestD) { bestD = d; best = e; }
    }
    if (!best) {
      // wrap in reading order
      const i = f.indexOf(cur);
      best = dir === 'up' || dir === 'left' ? f[(i - 1 + f.length) % f.length] : f[(i + 1) % f.length];
    }
    best.focus({ preventScroll: false });
  }
  function onAction(a, e) {
    // an open word-help card is dismissed before anything underneath acts
    if (a === 'cancel' && RB.ui.help && RB.ui.help.isOpen()) { RB.ui.help.hide(true); return; }
    const top = topLayer();
    if (top) {
      if (top.onAction && top.onAction(a, e)) return;
      if (a === 'cancel') { if (top.onCancel) top.onCancel(); return; }
      if (a === 'up' || a === 'down' || a === 'left' || a === 'right') { moveFocus(scopeOf(top), a); return; }
      if (a === 'ok') {
        const f = document.activeElement;
        if (f && scopeOf(top).contains(f) && (f.tagName === 'BUTTON' || f.getAttribute('role') === 'button')) f.click();
        else if (f && f.classList && f.classList.contains('jt')) RB.ui.help.showFor(f);
        return;
      }
      return;
    }
    if (RB.ui.dialogue && RB.ui.dialogue.onAction(a)) return;
  }

  // ---- text helpers ------------------------------------------------------------------
  function jhtml(line, opts) {
    opts = opts || {};
    if (!line) return '';
    const vars = Object.assign(RB.game.s ? RB.script.jpVars() : {}, opts.vars || {});
    if (!RB.jp || !RB.jp.render) return '<span class="jline" lang="ja">' + esc(String(line).replace(/\{([^|}]+)\|[^}]+\}/g, '$1').replace(/ /g, '')) + '</span>';
    const spacing = opts.spacing != null ? opts.spacing : RB.game.settings ? RB.game.settings.spacing : true;
    const r = RB.jp.render(line, { spacing, vars, furigana: true });
    const id = RB.ui.help.register(r.tokens, line, opts.ctx);
    return '<span class="jline" lang="ja" data-src="' + id + '">' + r.html + '</span>';
  }
  function ehtml(text) {
    return '<span class="enline">' + esc(RB.game.s ? RB.script.enVars(text) : text) + '</span>';
  }
  function plainJp(line) {
    if (RB.jp && RB.jp.plain) return RB.jp.plain(line, RB.game.s ? RB.script.jpVars() : {});
    return String(line || '').replace(/\{([^|}]+)\|[^}]+\}/g, '$1').replace(/ /g, '');
  }
  // UI label: English UI shows English; Japanese UI shows Japanese with the English as title.
  function label(jp, en) {
    const ja = RB.game.settings && RB.game.settings.uiLang === 'ja';
    if (ja && jp) return jhtml(jp) + '<span class="sr">' + esc(en) + '</span>';
    return esc(en);
  }

  // ---- ephemeral UI -------------------------------------------------------------------
  function notice(text, kind) {
    const n = el('div', 'notice ' + (kind || ''), esc(text));
    n.setAttribute('role', 'status');
    notices.appendChild(n);
    setTimeout(() => { n.style.opacity = '0'; n.style.transition = 'opacity .5s'; }, 4200);
    setTimeout(() => n.remove(), 4800);
  }
  const TOAST_LABEL = {
    item: 'Received', word: 'New inscription', note: 'Notebook', quest_new: 'New quest', quest_update: 'Journal updated',
    quest_done: 'Quest complete', info: '', lesson: 'Learned',
  };
  function toast(t) {
    return new Promise((res) => {
      const n = el('div', 'toast');
      n.setAttribute('role', 'status');
      n.innerHTML = '<span class="kind">' + esc(TOAST_LABEL[t.kind] || '') + '</span>' + (t.jp ? jhtml(t.jp) : '') + '<span class="en">' + esc(t.en || '') + (t.n > 1 ? ' ×' + t.n : '') + '</span>' + (t.note ? '<span class="tnote">' + esc(t.note) + '</span>' : '');
      notices.appendChild(n);
      RB.audio && RB.audio.sfx(t.kind === 'quest_done' ? 'quest_update' : t.kind === 'word' ? 'discover' : 'page');
      setTimeout(() => { n.style.opacity = '0'; n.style.transition = 'opacity .5s'; }, 2600);
      setTimeout(() => n.remove(), 3200);
      setTimeout(res, RB.game.fastForward() ? 50 : 350);
    });
  }
  // While the screen is dark (a scene's time passing, a climb, a night), what
  // is said over it stays in view above the black: the dialogue, its replies
  // and the history (body.veiled, from the moment it darkens until it has
  // fully cleared; see 50_play.css).
  function fade(out, ms) {
    return new Promise((res) => {
      fadeEl.style.transitionDuration = (ms || 220) + 'ms';
      fadeEl.classList.toggle('on', !!out);
      if (out) document.body.classList.add('veiled');
      setTimeout(() => {
        if (!fadeEl.classList.contains('on')) document.body.classList.remove('veiled');
        res();
      }, ms || 220);
    });
  }
  // Chapter openings and endings, and time passing ("The next morning"): a
  // paper banner at the top of the screen, not a page over everything. It
  // slides in from the left as it fades in, an ink flourish draws out from
  // the title, it stays long enough to read, then slides away to the right.
  // A click, tap or key moves it on; reduced motion fades without sliding.
  // The place-name label waits until it has gone.
  let bannerUp = null;
  function card(jp, en) {
    return new Promise((res) => {
      const c = el('div', 'banner-layer');
      const txt = (jp ? jhtml(jp) : '') + '<div class="en">' + esc(RB.script.enVars(en)) + '</div>';
      const stroke = (side) => '<svg class="flourish ' + side + '" viewBox="0 0 120 16" aria-hidden="true" focusable="false"><path d="M2 9 C 30 9, 60 3, 118 8" pathLength="1"/><path d="M40 11 C 60 12, 80 10, 104 11" pathLength="1"/></svg>';
      c.innerHTML = '<div class="banner" role="status" aria-live="polite">' + stroke('l') + '<div class="banner-txt">' + txt + '</div>' + stroke('r') + '</div>';
      const b = c.querySelector('.banner');
      const layer = { el: c, name: 'card', noAutofocus: true };
      const ff = RB.game.fastForward();
      const reduce = RB.game.reducedMotion();
      let out = false, tm = null;
      bannerUp = new Promise((r) => { layer.release = r; });
      const done = () => {
        if (out) return;
        out = true;
        clearTimeout(tm);
        b.classList.remove('in');
        b.classList.add('out');
        setTimeout(() => { popLayer(layer); layer.release(); bannerUp = null; res(); }, ff ? 60 : reduce ? 300 : 560);
      };
      layer.onAction = (a) => { if (a === 'ok' || a === 'cancel') { done(); return true; } return false; };
      c.addEventListener('pointerdown', (e) => { e.preventDefault(); done(); });
      pushLayer(layer);
      requestAnimationFrame(() => requestAnimationFrame(() => b.classList.add('in')));
      // time to read: a little longer for longer lines
      const read = 2600 + Math.min(1400, ((en || '').length + (jp || '').replace(/[{}|a-z\s]/g, '').length * 2) * 18);
      tm = setTimeout(done, ff ? 300 : read);
    });
  }
  function placeName(name) {
    const show = () => {
      const p = el('div', 'place');
      p.innerHTML = jhtml(name.jp) + '<div class="en">' + esc(name.en) + '</div>';
      overlay.appendChild(p);
      setTimeout(() => (p.style.opacity = '0'), 2400);
      setTimeout(() => p.remove(), 3100);
    };
    if (bannerUp) bannerUp.then(() => setTimeout(show, 250)); else show();
  }
  // A small paper sheet on the cloth: the question, then its answers. The
  // first button is the proposed action (danger-styled when destructive); the
  // last one is the safe way out and is what Back/Escape chooses.
  function confirm(text, buttons, opts) {
    opts = opts || {};
    return new Promise((res) => {
      const scrim = el('div', 'scrim confirm-scrim');
      const panel = el('div', 'csheet' + (opts.danger ? ' danger' : ''));
      const tid = 'cq' + Math.random().toString(36).slice(2, 7);
      panel.setAttribute('role', 'alertdialog');
      panel.setAttribute('aria-modal', 'true');
      panel.setAttribute('aria-labelledby', tid);
      panel.innerHTML = '<p class="q" id="' + tid + '">' + (opts.html ? text : esc(text)) + '</p><div class="foot"></div>';
      const foot = panel.querySelector('.foot');
      const layer = { el: scrim, name: 'confirm' };
      buttons.forEach((b, i) => {
        const btn = el('button', 'pbtn' + (i === 0 && opts.danger ? ' danger' : i === 0 && buttons.length > 1 ? ' primary' : ''), esc(b));
        if (i === buttons.length - 1 && buttons.length > 1) btn.classList.add('autofocus'); // the safe choice has focus first
        btn.onclick = () => { popLayer(layer); res(i); };
        foot.appendChild(btn);
      });
      layer.onCancel = () => { popLayer(layer); res(buttons.length - 1); };
      scrim.appendChild(panel);
      pushLayer(layer);
    });
  }
  function shake() {
    if (RB.game.reducedMotion()) return;
    const w = document.getElementById('world');
    w.classList.remove('shake');
    void w.offsetWidth;
    w.classList.add('shake');
  }

  return {
    init, el, pushLayer, popLayer, topLayer, focusables, moveFocus, onAction, jhtml, ehtml, plainJp, label,
    notice, toast, fade, card, placeName, confirm, shake, get root() { return root; }, get overlay() { return overlay; },
  };
})();

/* ---- Lightbulb help ------------------------------------------------------------
 * Hover, keyboard focus or tap on Japanese text shows reading, romaji,
 * contextual meaning, mora breakdown and notes. Opening help during a
 * challenge marks that answer as assisted (without penalty). */
RB.ui.help = (function () {
  'use strict';
  const esc = RB.util.esc;
  const reg = new Map();
  let nextId = 1;
  let panel = null, pinned = false, cur = null, on = true;
  let via = 'hover'; // how the open card was requested: 'hover' | 'tap' | 'key'

  function init() {
    on = true;
    document.addEventListener('pointerover', (e) => {
      if (!enabled() || pinned || e.pointerType === 'touch' || (panel && via !== 'hover')) return;
      const t = e.target.closest && e.target.closest('.jt');
      if (t) { via = 'hover'; showFor(t); }
    });
    document.addEventListener('pointerout', (e) => {
      if (pinned || e.pointerType === 'touch' || via !== 'hover') return;
      const t = e.target.closest && e.target.closest('.jt');
      if (t && panel && !panel.contains(e.relatedTarget)) {
        setTimeout(() => { if (!pinned && panel && !panel.matches(':hover') && cur === t) hide(); }, 250);
      }
    });
    // Words inside buttons (answer choices, battle cards, dialogue choices,
    // menu items): a click/tap does the button's action; help for those words
    // comes from hover, keyboard focus, or a long press (touch). Words in
    // running text: a click/tap opens help.
    const CONTROL = 'button, a[href], [role=button]'; // (.jt tokens carry data-i themselves)
    let press = null, swallowClick = false;
    document.addEventListener('pointerdown', (e) => {
      const t = enabled() && e.target.closest && e.target.closest('.jt');
      if (!t || !t.closest(CONTROL)) return;
      const x = e.clientX, y = e.clientY;
      press = { t, x, y, timer: setTimeout(() => { press = null; swallowClick = true; via = 'tap'; showFor(t); }, 450) };
    }, true);
    const cancelPress = (e) => {
      if (!press) return;
      if (e.type === 'pointermove' && Math.hypot(e.clientX - press.x, e.clientY - press.y) < 10) return;
      clearTimeout(press.timer); press = null;
    };
    ['pointerup', 'pointercancel', 'pointermove'].forEach((ev) => document.addEventListener(ev, cancelPress, true));
    document.addEventListener('contextmenu', (e) => { if (swallowClick || press) e.preventDefault(); }, true);
    document.addEventListener('click', (e) => {
      if (swallowClick) { swallowClick = false; e.stopPropagation(); e.preventDefault(); return; } // the long press was a help request
      const t = e.target.closest && e.target.closest('.jt');
      if (t && enabled() && !t.closest(CONTROL)) { e.stopPropagation(); via = 'tap'; showFor(t); return; }
      if (panel && !panel.contains(e.target)) {
        // A card opened by a tap (or pinned) pauses what is under it: the tap
        // outside only closes the card and does not also press Next, choose an
        // answer or walk. Hover and keyboard-focus cards never block a click.
        const blocking = pinned || via === 'tap';
        pinned = false;
        hide();
        if (blocking) { e.stopPropagation(); e.preventDefault(); }
      }
    }, true);
    // a resize (rotation, window, keyboard) re-places an open card: a sheet on
    // narrow screens, a card beside its word on wide ones — never off-screen
    window.addEventListener('resize', () => { if (panel && cur && cur.isConnected) position(cur); else if (panel && !pinned) hide(); });
    // keyboard focus on a word opens its card only when the person is
    // actually navigating with keys (not when a screen places focus itself)
    let lastKey = 0;
    document.addEventListener('keydown', () => { lastKey = Date.now(); }, true);
    document.addEventListener('focusin', (e) => {
      if (!enabled() || Date.now() - lastKey > 1500) return;
      const t = e.target.closest && e.target.closest('.jt');
      if (t && t.matches(':focus-visible')) { via = 'key'; showFor(t); }
    });
  }
  function enabled() {
    return !!(RB.game.settings ? RB.game.settings.lightbulb : on);
  }
  function toggle(v) {
    const st = RB.game.settings;
    st.lightbulb = v != null ? v : !st.lightbulb;
    document.body.classList.toggle('bulb-on', st.lightbulb);
    if (!st.lightbulb) { pinned = false; hide(); }
    RB.game.saveSettings();
    RB.ui.hud && RB.ui.hud.refresh();
    RB.audio && RB.audio.sfx(st.lightbulb ? 'lantern' : 'cursor');
  }
  function register(tokens, line, ctx) {
    const id = nextId++;
    reg.set(id, { tokens, line, ctx });
    if (reg.size > 800) reg.delete(reg.keys().next().value);
    return id;
  }
  function showFor(elm) {
    const src = elm.closest('[data-src]');
    if (!src) return;
    const r = reg.get(+src.getAttribute('data-src'));
    if (!r) return;
    const tok = r.tokens[+elm.getAttribute('data-i')];
    if (!tok) return;
    if (cur) cur.classList.remove('active');
    cur = elm;
    elm.classList.add('active');
    render(tok, elm, r);
    if (RB.challenge && RB.challenge.active()) RB.challenge.noteHelp(tok, elm);
  }
  const HI = (n) => (RB.ui.folio ? RB.ui.folio.icon(n) : '');
  function render(tok, anchor, r) {
    let info;
    try { info = RB.jp.lookup(tok); } catch (e) { info = { unknown: true, reading: tok.reading || tok.surface }; }
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'help';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', 'Word help');
      document.getElementById('overlay').appendChild(panel);
    }
    const e = info.entry;
    const reading = info.reading || tok.reading || '';
    const surface = tok.surface || '';
    const mora = info.mora || (RB.kana && RB.kana.mora ? RB.kana.mora(reading) : []);
    // header: the word and its reading, with Close always in the same corner
    let html = '<div class="hhead"><div class="hw" lang="ja">' + esc(surface) + (reading && reading !== surface ? '<span class="hr">' + esc(reading) + '</span>' : '') + '</div>' +
      '<button class="hclose" data-a="close" aria-label="Close word help">' + HI('close') + '<span>Close</span></button></div><div class="hbody">';
    if (RB.game.settings.romaji !== false && info.romaji) html += '<div class="rom">' + esc(info.romaji) + '</div>';
    if (info.gloss) html += '<div class="mean"><span class="lab">Here</span>' + esc(info.gloss) + '</div>';
    if (e) html += '<div class="mean">' + (info.gloss ? '<span class="lab">Dictionary</span>' : '') + esc(e.m) + (info.lemma && info.lemma !== surface ? ' <span class="small" lang="ja">(' + esc(info.lemma) + ')</span>' : '') + '</div>';
    if (info.forms && info.forms.length) html += '<div class="note">Form: ' + esc(info.forms.join(' → ')) + '</div>';
    if (info.parts && info.parts.length) html += '<div class="note">Parts: ' + info.parts.map((p) => esc(p.surface || p.w || '') + (p.m ? ' (' + esc(p.m) + ')' : '')).join(' + ') + '</div>';
    if (e && e.n) html += '<div class="note">' + esc(e.n) + '</div>';
    if (!e && !info.gloss) html += '<div class="note">No dictionary note is recorded for this piece of text. The reading above is still accurate.</div>';
    if (mora && mora.length > 1) html += '<div class="note">Beats (morae): <span class="mora" lang="ja">' + mora.map((m) => '<span>' + esc(m) + '</span>').join('') + '</span></div>';
    if (surface.indexOf('っ') >= 0 || surface.indexOf('ッ') >= 0) html += '<div class="note">Small っ is a held beat: the next consonant is doubled.</div>';
    if (surface.indexOf('ー') >= 0) html += '<div class="note">ー lengthens the vowel before it by one beat.</div>';
    html += '</div><div class="acts">';
    if (RB.voice && RB.voice.japaneseVoices && RB.voice.japaneseVoices().length) html += '<button class="pbtn" data-a="say">' + HI('sound') + 'Say it</button>';
    html += '<button class="pbtn" data-a="pin" aria-pressed="' + pinned + '">' + HI('note') + (pinned ? 'Pinned' : 'Keep open') + '</button>';
    if (RB.game.s) html += '<button class="pbtn" data-a="note">' + HI('words') + 'Add to notebook</button>';
    html += '</div>';
    panel.innerHTML = html;
    panel.classList.toggle('pinned', pinned);
    panel.onclick = (ev) => {
      const b = ev.target.closest('[data-a]');
      if (!b) return;
      const a = b.getAttribute('data-a');
      if (a === 'say') RB.voice.speak(reading || surface);
      if (a === 'pin') { pinned = !pinned; render(tok, anchor, r); }
      if (a === 'close') { pinned = false; hide(); if (anchor && anchor.isConnected && via === 'key') anchor.focus({ preventScroll: true }); }
      if (a === 'note') addToNotebook(tok, info);
    };
    position(anchor);
  }
  // Narrow screens: a sheet along the bottom edge (it never sits on top of
  // the word's own line and always shows its Close). Wider screens: a bounded
  // note card beside the word, kept inside the viewport. With the writing pad
  // open the card docks to a corner so it never covers the strokes.
  function position(anchor) {
    const padOpen = document.querySelector('.pad-box') && document.querySelector('.chal');
    // (a hover card stays beside the word even in a narrow window: a sheet
    // would slide under the pointer and cover the word being read)
    const sheet = window.innerWidth < 600 && via !== 'hover';
    panel.classList.toggle('docked', !!padOpen && !sheet);
    panel.classList.toggle('sheet', sheet);
    panel.style.bottom = '';
    if (sheet || padOpen) {
      panel.style.left = ''; panel.style.top = ''; panel.style.maxHeight = '';
      // in a battle the sheet rises from the top of the party slip: Resolve and Harmony stay in view
      // (battle addendum §16.1; the language sheet carries its own status inset)
      const party = sheet && !document.querySelector('.chal') && document.querySelector('.combat-ui .cb-party');
      const pr = party ? party.getBoundingClientRect() : null;
      if (pr && pr.height > 0 && pr.top > window.innerHeight * 0.3 && pr.top < window.innerHeight) {
        panel.style.bottom = Math.round(window.innerHeight - pr.top + 4) + 'px';
        panel.style.maxHeight = Math.max(140, Math.min(Math.round(window.innerHeight * 0.62), Math.round(pr.top - 12))) + 'px';
      }
      return;
    }
    const r = anchor.getBoundingClientRect();
    const pw = Math.min(400, window.innerWidth - 16);
    const left = Math.min(window.innerWidth - pw - 8, Math.max(8, r.left + r.width / 2 - pw / 2));
    panel.style.left = left + 'px';
    // Never over the word itself (with large text the card can be taller than the room
    // above it, and a card under the pointer takes the clicks meant for the word's button):
    // the roomier side, the card's height capped to it and scrolled inside.
    panel.style.maxHeight = '';
    const ph = panel.offsetHeight || 180;
    const above = r.top - 20, below = window.innerHeight - r.bottom - 20;
    const up = ph <= above || (ph > below && above >= below);
    const room = Math.max(96, up ? above : below);
    const h = Math.min(ph, room);
    if (h < ph) { panel.style.maxHeight = room + 'px'; panel.style.overflowY = 'auto'; }
    panel.style.top = Math.max(8, up ? r.top - h - 12 : r.bottom + 12) + 'px';
  }
  function addToNotebook(tok, info) {
    const s = RB.game.s;
    const key = 'w:' + (info.lemma || tok.surface) + '|' + (info.reading || '');
    if (!s.notebook.find((n) => n.id === key)) {
      s.notebook.push({ kind: 'word', id: key, surface: tok.surface, reading: info.reading || '', m: info.gloss || (info.entry && info.entry.m) || '', t: Date.now() });
      RB.ui.notice('Added to your field notebook.', 'info');
    } else RB.ui.notice('Already in your notebook.', 'info');
  }
  function hide(force) {
    if (cur) cur.classList.remove('active');
    cur = null;
    if (force) pinned = false;
    if (panel && !pinned) { panel.remove(); panel = null; }
  }
  function isOpen() { return !!panel; }
  return { init, toggle, register, showFor, hide, enabled, isOpen };
})();

/* ---- HUD ---------------------------------------------------------------------------
 * One Menu entry point and the word-help switch, as labelled cloth tags at the
 * top edge. Hidden whenever a panel, the folio or dialogue is up (those carry
 * their own controls). Also keeps the touch Action label and the camera's
 * bottom inset in step with what is on screen. */
RB.ui.hud = (function () {
  'use strict';
  let box = null;
  const I = (n) => RB.ui.folio.icon(n);
  function show() {
    if (!box) {
      box = RB.ui.el('div', 'hud');
      box.setAttribute('role', 'toolbar');
      box.setAttribute('aria-label', 'Game');
      box.innerHTML = '<button class="hbtn bulb" aria-pressed="false" title="Word help (H)">' + I('bulb') + '<span class="l">Word help</span><span class="st" aria-hidden="true"></span></button>' +
        '<button class="hbtn menu-b" title="Menu (C)">' + I('menu') + '<span class="l">Menu</span></button>';
      box.querySelector('.bulb').onclick = () => RB.ui.help.toggle();
      box.querySelector('.menu-b').onclick = () => { if (RB.game.mode() === 'world') RB.ui.menu.open(); };
      RB.ui.root.appendChild(box);
    }
    box.classList.remove('hidden');
    refresh();
  }
  function hide() { if (box) box.classList.add('hidden'); }
  function refresh() {
    const on = RB.game.settings && RB.game.settings.lightbulb;
    document.body.classList.toggle('bulb-on', !!on);
    if (box) {
      const b = box.querySelector('.bulb');
      b.classList.toggle('on', !!on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.querySelector('.st').textContent = on ? 'On' : 'Off';
    }
  }
  // ---- per-frame bookkeeping (cheap; DOM reads only when something changed) ----
  let acc = 0, lastLabel = '', lastInset = -1;
  function tick(dt) {
    acc += dt;
    if (acc < 120) return;
    acc = 0;
    const body = document.body;
    const world = RB.game.mode && RB.game.mode() === 'world' && RB.world.W.map;
    if (world && body.classList.contains('touch')) {
      const fa = RB.world.frontAction ? RB.world.frontAction() : null;
      const label = fa ? fa.label : 'Look';
      if (label + !!fa !== lastLabel) { lastLabel = label + !!fa; RB.input.setActionLabel(label, !!fa); }
    }
    // on a touch device the camera keeps the player clear of the touch
    // controls. It is measured while they show and kept while they are hidden
    // (dialogue, menus), so nothing that opens or closes moves the map.
    if (world && body.classList.contains('touch')) {
      const tp = document.querySelector('.touchpad .tp-move');
      if (tp && tp.offsetParent) {
        const r = Math.max(0, window.innerHeight - tp.getBoundingClientRect().top) * 0.75;
        if (Math.abs(r - lastInset) > 2) { lastInset = r; RB.render.setReserve(r); }
      }
    } else if (!body.classList.contains('touch') && lastInset) { lastInset = 0; RB.render.setReserve(0); }
  }
  return { show, hide, refresh, tick };
})();
RB.ui.tick = function (dt, t) { RB.ui.hud.tick(dt, t); };
