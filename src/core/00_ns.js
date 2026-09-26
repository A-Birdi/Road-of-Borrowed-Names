/* Core namespace and small shared utilities.
 * Every source file attaches to the global RB object. Files only *define*
 * things at load time; src/main.js (loaded last) boots the game. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.VERSION = '0.1.0';
RB.SAVE_SCHEMA = 1;

RB.util = (function () {
  'use strict';
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
  }
  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  // Deterministic PRNG (mulberry32) for procedural art and expeditions.
  function rng(seed) {
    let s = seed >>> 0;
    const f = function () {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    f.int = (n) => Math.floor(f() * n);
    f.pick = (arr) => arr[Math.floor(f() * arr.length)];
    f.shuffle = (arr) => {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(f() * (i + 1));
        const tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
      }
      return a;
    };
    return f;
  }
  function hashStr(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function deepClone(o) {
    return o == null ? o : JSON.parse(JSON.stringify(o));
  }
  // Minimal event bus.
  function emitter() {
    const map = new Map();
    return {
      on(ev, fn) {
        if (!map.has(ev)) map.set(ev, new Set());
        map.get(ev).add(fn);
        return () => map.get(ev).delete(fn);
      },
      emit(ev, data) {
        const set = map.get(ev);
        if (set) for (const fn of Array.from(set)) fn(data);
      },
    };
  }
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
  function fmtTime(sec) {
    sec = Math.floor(sec || 0);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return h + ':' + String(m).padStart(2, '0');
  }
  return { esc, clamp, lerp, rng, hashStr, deepClone, emitter, uid, fmtTime };
})();

RB.bus = RB.util.emitter();
