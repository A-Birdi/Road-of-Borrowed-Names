/* Input: remappable keyboard actions, held directions, virtual touch pad.
 * Text fields and the handwriting pad swallow input so typing/drawing never
 * moves the character (spec §18). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.input = (function () {
  'use strict';
  const DEFAULT_BINDS = {
    up: ['ArrowUp', 'KeyW'],
    down: ['ArrowDown', 'KeyS'],
    left: ['ArrowLeft', 'KeyA'],
    right: ['ArrowRight', 'KeyD'],
    ok: ['Enter', 'Space', 'KeyZ'],
    cancel: ['Escape', 'KeyX', 'Backspace'],
    menu: ['KeyC', 'Tab'],
    help: ['KeyH'],
    log: ['KeyL'],
    map: ['KeyM'],
    run: ['ShiftLeft', 'ShiftRight'],
    tr: ['KeyT'],
  };
  const ACTION_LABELS = {
    up: 'Move up', down: 'Move down', left: 'Move left', right: 'Move right',
    ok: 'Confirm / talk', cancel: 'Back', menu: 'Menu', help: 'Lightbulb help',
    log: 'Dialogue history', map: 'Map', run: 'Walk faster (hold)', tr: 'Show or hide the translation',
  };
  let binds = RB.util.deepClone(DEFAULT_BINDS);
  const DIRECTIONS = ['up', 'down', 'left', 'right'];
  const held = { up: 0, down: 0, left: 0, right: 0, run: 0 };
  const touchHeld = { up: 0, down: 0, left: 0, right: 0, run: 0 };
  let handler = null; // (action, event) => void
  let lastDirPressed = null;
  let capturing = null; // remap capture callback

  function setBinds(b) {
    binds = Object.assign(RB.util.deepClone(DEFAULT_BINDS), b || {});
  }
  function getBinds() {
    return binds;
  }
  function actionFor(code) {
    for (const a in binds) if (binds[a].indexOf(code) >= 0) return a;
    return null;
  }
  function isTextTarget(el) {
    if (!el) return false;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
  }
  function onKeyDown(e) {
    if (capturing) {
      e.preventDefault();
      const cb = capturing;
      capturing = null;
      cb(e.code);
      return;
    }
    // Never act while an IME is composing or when typing into a field.
    if (e.isComposing || e.keyCode === 229) return;
    if (isTextTarget(e.target)) {
      if (e.code === 'Escape' && handler) handler('cancel', e);
      return;
    }
    // Inside menus and dialogs Tab moves keyboard focus as usual; it only
    // opens the menu from the world.
    if (e.key === 'Tab' && typeof document !== 'undefined' && document.body.classList.contains('in-panel')) return;
    const a = actionFor(e.code);
    if (!a) return;
    if (a in held) {
      // Running is a speed modifier, never a movement direction.
      if (!held[a] && DIRECTIONS.includes(a)) lastDirPressed = a;
      held[a] = 1;
    }
    // Space/arrow/Tab must not scroll the page or move focus unexpectedly.
    if (a !== 'run') e.preventDefault();
    if (e.repeat && !(a in held)) return;
    if (handler) handler(a, e);
  }
  function onKeyUp(e) {
    const a = actionFor(e.code);
    if (a && a in held) held[a] = 0;
  }
  function clearHeld() {
    for (const k in held) held[k] = 0;
    for (const k in touchHeld) touchHeld[k] = 0;
    lastDirPressed = null;
  }
  // Direction currently held, favouring the most recently pressed.
  function dir() {
    const h = (k) => held[k] || touchHeld[k];
    if (DIRECTIONS.includes(lastDirPressed) && h(lastDirPressed)) return lastDirPressed;
    for (const k of DIRECTIONS) if (h(k)) return k;
    return null;
  }
  function running() {
    return !!(held.run || touchHeld.run);
  }
  function attach(onAction) {
    handler = onAction;
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearHeld);
    document.addEventListener('visibilitychange', clearHeld);
  }
  function captureNext(cb) {
    capturing = cb;
  }
  function keyName(code) {
    return code.replace(/^Key/, '').replace(/^Arrow/, '').replace(/^Digit/, '').replace('Left', ' L').replace('Right', ' R');
  }

  // ---- Touch controls ------------------------------------------------------
  // A movement pad (slide the thumb between directions; a centre dead zone),
  // a Run button (hold) and an Action button whose label says what it will do
  // ("Talk", "Read", "Look" …). The folio/menu is reached from the HUD's one
  // Menu button, not duplicated here. touch-action: none only on these.
  const SVG = (d) => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  function buildTouchPad(root) {
    const pad = document.createElement('div');
    pad.className = 'touchpad';
    pad.innerHTML =
      '<div class="tp-move" role="group" aria-label="Move">' +
      '<span class="tp-ring" aria-hidden="true"></span>' +
      '<button data-d="up" aria-label="Move up">' + SVG('<path d="M6 15l6-6 6 6"/>') + '</button>' +
      '<button data-d="left" aria-label="Move left">' + SVG('<path d="M15 6l-6 6 6 6"/>') + '</button>' +
      '<button data-d="right" aria-label="Move right">' + SVG('<path d="M9 6l6 6-6 6"/>') + '</button>' +
      '<button data-d="down" aria-label="Move down">' + SVG('<path d="M6 9l6 6 6-6"/>') + '</button></div>' +
      '<div class="tp-acts">' +
      '<button class="tp-run" data-hold="run" aria-label="Run (hold)"><span class="k" aria-hidden="true">B</span><span class="l">Run</span></button>' +
      '<button class="tp-act" data-a="ok"><span class="k" aria-hidden="true">A</span><span class="l">Look</span></button></div>';
    const move = pad.querySelector('.tp-move');
    let movePtr = null;
    const setDir = (d) => {
      for (const k of DIRECTIONS) touchHeld[k] = 0;
      if (d) { touchHeld[d] = 1; lastDirPressed = d; }
      move.dataset.dir = d || '';
    };
    const dirFrom = (e) => {
      const r = move.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) < r.width * 0.12) return null; // dead zone in the centre
      return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    };
    move.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      movePtr = e.pointerId;
      try { move.setPointerCapture(e.pointerId); } catch (err) { /* capture is best effort */ }
      setDir(dirFrom(e));
    });
    move.addEventListener('pointermove', (e) => { if (e.pointerId === movePtr) setDir(dirFrom(e)); });
    const endMove = (e) => { if (e.pointerId === movePtr) { movePtr = null; setDir(null); } };
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => move.addEventListener(ev, endMove));
    // keyboard/switch users can still press the arrow buttons one step at a time
    move.addEventListener('click', (e) => { if (e.detail === 0) { const b = e.target.closest('[data-d]'); if (b && handler) handler(b.dataset.d, e); } });
    const run = pad.querySelector('.tp-run');
    const runOn = (v) => { touchHeld.run = v; run.classList.toggle('on', !!v); };
    run.addEventListener('pointerdown', (e) => { e.preventDefault(); try { run.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } runOn(1); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => run.addEventListener(ev, () => runOn(0)));
    const act = pad.querySelector('.tp-act');
    act.addEventListener('pointerdown', (e) => { e.preventDefault(); act.classList.add('down'); });
    act.addEventListener('pointerup', (e) => { if (act.classList.contains('down') && handler) handler('ok', e); act.classList.remove('down'); });
    ['pointercancel', 'pointerleave'].forEach((ev) => act.addEventListener(ev, () => act.classList.remove('down')));
    act.addEventListener('click', (e) => { if (e.detail === 0 && handler) handler('ok', e); });
    root.appendChild(pad);
    return pad;
  }
  // Label the Action button with what it would do now ('Talk', 'Read', …).
  function setActionLabel(text, active) {
    const b = document.querySelector('.touchpad .tp-act');
    if (!b) return;
    const l = b.querySelector('.l');
    if (l.textContent !== text) l.textContent = text;
    b.setAttribute('aria-label', text + ' (A)');
    b.classList.toggle('idle', !active);
  }

  return {
    attach, dir, running, clearHeld, setBinds, getBinds, captureNext, keyName,
    buildTouchPad, setActionLabel, DEFAULT_BINDS, ACTION_LABELS, isTextTarget,
  };
})();
