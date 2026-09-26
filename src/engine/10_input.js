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
  };
  const ACTION_LABELS = {
    up: 'Move up', down: 'Move down', left: 'Move left', right: 'Move right',
    ok: 'Confirm / talk', cancel: 'Back', menu: 'Menu', help: 'Lightbulb help',
    log: 'Dialogue history', map: 'Map', run: 'Walk faster (hold)',
  };
  let binds = RB.util.deepClone(DEFAULT_BINDS);
  const held = { up: 0, down: 0, left: 0, right: 0, run: 0 };
  const touchHeld = { up: 0, down: 0, left: 0, right: 0 };
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
    const a = actionFor(e.code);
    if (!a) return;
    if (a in held) {
      if (!held[a]) lastDirPressed = a;
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
  }
  // Direction currently held, favouring the most recently pressed.
  function dir() {
    const h = (k) => held[k] || touchHeld[k];
    if (lastDirPressed && h(lastDirPressed)) return lastDirPressed;
    for (const k of ['up', 'down', 'left', 'right']) if (h(k)) return k;
    return null;
  }
  function running() {
    return !!held.run;
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

  // ---- Touch pad -----------------------------------------------------------
  function buildTouchPad(root) {
    const pad = document.createElement('div');
    pad.className = 'touchpad';
    pad.innerHTML =
      '<div class="tp-dpad">' +
      '<button data-d="up" aria-label="Up">▲</button>' +
      '<button data-d="left" aria-label="Left">◀</button>' +
      '<button data-d="right" aria-label="Right">▶</button>' +
      '<button data-d="down" aria-label="Down">▼</button></div>' +
      '<div class="tp-btns"><button data-a="cancel" aria-label="Back">B</button>' +
      '<button data-a="ok" aria-label="Confirm">A</button>' +
      '<button data-a="menu" aria-label="Menu" class="tp-menu">≡</button></div>';
    const press = (d, v) => {
      touchHeld[d] = v;
      if (v) lastDirPressed = d;
    };
    pad.querySelectorAll('[data-d]').forEach((b) => {
      const d = b.getAttribute('data-d');
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); b.setPointerCapture(e.pointerId); press(d, 1); });
      const up = () => press(d, 0);
      b.addEventListener('pointerup', up);
      b.addEventListener('pointercancel', up);
      b.addEventListener('lostpointercapture', up);
    });
    pad.querySelectorAll('[data-a]').forEach((b) => {
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (handler) handler(b.getAttribute('data-a'), e);
      });
    });
    root.appendChild(pad);
    return pad;
  }

  return {
    attach, dir, running, clearHeld, setBinds, getBinds, captureNext, keyName,
    buildTouchPad, DEFAULT_BINDS, ACTION_LABELS, isTextTarget,
  };
})();
