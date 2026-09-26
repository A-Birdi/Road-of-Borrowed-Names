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
    document.addEventListener('keydown', (e) => {
      // keep Tab focus inside the top layer
      if (e.key === 'Tab' && layers.length) {
        const f = focusables(layers[layers.length - 1].el);
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
      const f = focusables(top.el);
      if (f[0] && !top.el.contains(document.activeElement)) f[0].focus({ preventScroll: true });
    }
  }
  function topLayer() {
    return layers[layers.length - 1] || null;
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
    const top = topLayer();
    if (top) {
      if (top.onAction && top.onAction(a, e)) return;
      if (a === 'cancel') { if (top.onCancel) top.onCancel(); return; }
      if (a === 'up' || a === 'down' || a === 'left' || a === 'right') { moveFocus(top.el, a); return; }
      if (a === 'ok') {
        const f = document.activeElement;
        if (f && top.el.contains(f) && (f.tagName === 'BUTTON' || f.getAttribute('role') === 'button')) f.click();
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
      n.innerHTML = '<span class="kind">' + esc(TOAST_LABEL[t.kind] || '') + '</span>' + (t.jp ? jhtml(t.jp) : '') + '<span class="en">' + esc(t.en || '') + (t.n > 1 ? ' ×' + t.n : '') + '</span>';
      notices.appendChild(n);
      RB.audio && RB.audio.sfx(t.kind === 'quest_done' ? 'quest_update' : t.kind === 'word' ? 'discover' : 'page');
      setTimeout(() => { n.style.opacity = '0'; n.style.transition = 'opacity .5s'; }, 2600);
      setTimeout(() => n.remove(), 3200);
      setTimeout(res, RB.game.fastForward() ? 50 : 350);
    });
  }
  function fade(out, ms) {
    return new Promise((res) => {
      fadeEl.style.transitionDuration = (ms || 220) + 'ms';
      fadeEl.classList.toggle('on', !!out);
      setTimeout(res, ms || 220);
    });
  }
  function card(jp, en) {
    return new Promise((res) => {
      const c = el('div', 'card');
      c.innerHTML = (jp ? jhtml(jp) : '') + '<div class="en">' + esc(RB.script.enVars(en)) + '</div><button class="btn small" style="margin-top:1em">Continue</button>';
      const layer = { el: c, name: 'card' };
      const done = () => { popLayer(layer); clearTimeout(tm); res(); };
      layer.onAction = (a) => { if (a === 'ok' || a === 'cancel') { done(); return true; } return false; };
      c.querySelector('button').onclick = done;
      pushLayer(layer);
      const tm = setTimeout(done, RB.game.fastForward() ? 300 : 4200);
    });
  }
  function placeName(name) {
    const p = el('div', 'place');
    p.innerHTML = jhtml(name.jp) + '<div class="en">' + esc(name.en) + '</div>';
    overlay.appendChild(p);
    setTimeout(() => (p.style.opacity = '0'), 2400);
    setTimeout(() => p.remove(), 3100);
  }
  function confirm(text, buttons, opts) {
    opts = opts || {};
    return new Promise((res) => {
      const scrim = el('div', 'scrim');
      const panel = el('div', 'panel');
      panel.style.width = 'min(520px, calc(100vw - 16px))';
      panel.setAttribute('role', 'alertdialog');
      panel.innerHTML = '<div class="body"><p>' + (opts.html ? text : esc(text)) + '</p></div><div class="foot"></div>';
      const foot = panel.querySelector('.foot');
      const layer = { el: scrim, name: 'confirm' };
      buttons.forEach((b, i) => {
        const btn = el('button', 'btn' + (i === 0 && opts.danger ? ' danger' : i === 0 ? ' primary' : ''), esc(b));
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
  function tick() {}

  return {
    init, el, pushLayer, popLayer, topLayer, focusables, moveFocus, onAction, jhtml, ehtml, plainJp, label,
    notice, toast, fade, card, placeName, confirm, shake, tick, get root() { return root; }, get overlay() { return overlay; },
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

  function init() {
    on = true;
    document.addEventListener('pointerover', (e) => {
      if (!enabled() || pinned || e.pointerType === 'touch') return;
      const t = e.target.closest && e.target.closest('.jt');
      if (t) showFor(t);
    });
    document.addEventListener('pointerout', (e) => {
      if (pinned || e.pointerType === 'touch') return;
      const t = e.target.closest && e.target.closest('.jt');
      if (t && panel && !panel.contains(e.relatedTarget)) {
        setTimeout(() => { if (!pinned && panel && !panel.matches(':hover') && cur === t) hide(); }, 250);
      }
    });
    document.addEventListener('click', (e) => {
      const t = e.target.closest && e.target.closest('.jt');
      if (t && enabled()) { e.stopPropagation(); showFor(t); return; }
      if (panel && !panel.contains(e.target) && !pinned) hide();
    }, true);
    document.addEventListener('focusin', (e) => {
      if (!enabled()) return;
      const t = e.target.closest && e.target.closest('.jt');
      if (t && t.matches(':focus-visible')) showFor(t);
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
    let html = '<div class="hw">' + esc(surface) + (reading && reading !== surface ? ' <span class="hr">【' + esc(reading) + '】</span>' : '') + '</div>';
    if (RB.game.settings.romaji !== false && info.romaji) html += '<div class="rom">' + esc(info.romaji) + '</div>';
    if (info.gloss) html += '<div class="mean"><b>Here:</b> ' + esc(info.gloss) + '</div>';
    if (e) html += '<div class="mean">' + (info.gloss ? '<span class="dim small">Dictionary: </span>' : '') + esc(e.m) + (info.lemma && info.lemma !== surface ? ' <span class="small">(' + esc(info.lemma) + ')</span>' : '') + '</div>';
    if (info.forms && info.forms.length) html += '<div class="note">Form: ' + esc(info.forms.join(' → ')) + '</div>';
    if (info.parts && info.parts.length) html += '<div class="note">Parts: ' + info.parts.map((p) => esc(p.surface || p.w || '') + (p.m ? ' (' + esc(p.m) + ')' : '')).join(' + ') + '</div>';
    if (e && e.n) html += '<div class="note">' + esc(e.n) + '</div>';
    if (!e && !info.gloss) html += '<div class="note">No dictionary note is recorded for this piece of text. The reading above is still accurate.</div>';
    if (mora && mora.length > 1) html += '<div class="note">Beats (morae): <span class="mora">' + mora.map((m) => '<span>' + esc(m) + '</span>').join('') + '</span></div>';
    if (surface.indexOf('っ') >= 0 || surface.indexOf('ッ') >= 0) html += '<div class="note">Small っ is a held beat: the next consonant is doubled.</div>';
    if (surface.indexOf('ー') >= 0) html += '<div class="note">ー lengthens the vowel before it by one beat.</div>';
    html += '<div class="acts">';
    if (RB.voice && RB.voice.japaneseVoices && RB.voice.japaneseVoices().length) html += '<button class="btn small" data-a="say">🔊 Say</button>';
    html += '<button class="btn small" data-a="pin">' + (pinned ? 'Unpin' : '📌 Pin') + '</button>';
    if (RB.game.s) html += '<button class="btn small" data-a="note">＋ Notebook</button>';
    html += '<button class="btn small" data-a="close">Close</button></div>';
    panel.innerHTML = html;
    panel.classList.toggle('pinned', pinned);
    panel.onclick = (ev) => {
      const b = ev.target.closest('[data-a]');
      if (!b) return;
      const a = b.getAttribute('data-a');
      if (a === 'say') RB.voice.speak(reading || surface);
      if (a === 'pin') { pinned = !pinned; render(tok, anchor, r); }
      if (a === 'close') { pinned = false; hide(); }
      if (a === 'note') addToNotebook(tok, info);
    };
    position(anchor);
  }
  function position(anchor) {
    const padOpen = document.querySelector('.pad-box') && document.querySelector('.chal');
    panel.classList.toggle('docked', !!padOpen);
    if (padOpen) { panel.style.left = ''; panel.style.top = ''; return; }
    const r = anchor.getBoundingClientRect();
    const pw = Math.min(380, window.innerWidth - 16);
    let left = Math.min(window.innerWidth - pw - 8, Math.max(8, r.left + r.width / 2 - pw / 2));
    panel.style.left = left + 'px';
    panel.style.width = '';
    const ph = panel.offsetHeight || 180;
    let top = r.top - ph - 10;
    if (top < 8) top = r.bottom + 10;
    if (top + ph > window.innerHeight - 8) top = Math.max(8, window.innerHeight - ph - 8);
    panel.style.top = top + 'px';
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

/* ---- HUD --------------------------------------------------------------------------- */
RB.ui.hud = (function () {
  'use strict';
  let box = null;
  const BULB = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2zm-2 18h4v1a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1z"/></svg>';
  function show() {
    if (!box) {
      box = RB.ui.el('div', 'hud');
      box.innerHTML = '<button class="btn bulb" aria-label="Lightbulb help (H)" title="Lightbulb help (H)">' + BULB + '</button>' +
        '<button class="btn menu-b" aria-label="Menu (C)" title="Menu (C)">≡</button>';
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
    if (box) box.querySelector('.bulb').classList.toggle('on', !!on);
  }
  return { show, hide, refresh };
})();
