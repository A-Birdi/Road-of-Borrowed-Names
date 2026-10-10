/* The exploration actions' development panel (expansion P05): only on a page opened with ?dev=verbs (or a test that
 * sets window.__RB_DEV_VERBS__ before the game starts). It starts a throwaway session (never saved: offered only
 * while no journey is loaded) with the flag dev_verbs, which alone brings the fixtures of
 * src/content/verbs/00_fixtures.js onto the Lantern Road and the Saltglass road, and stands you beside one. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.verbsDev = (function () {
  'use strict';
  function allowed() {
    try {
      if (typeof window === 'undefined') return false;
      if (window.__RB_DEV_VERBS__) return true;
      return /[?&]dev=verbs\b/.test(window.location.search || '');
    } catch (e) { return false; }
  }
  // where to stand for a fixture: beside its prop (the first gate, lamp or plan for the ones with several)
  function spotOf(spec) {
    if (spec.kind === 'network') { const g = spec.gates[Object.keys(spec.gates)[0]]; return { map: g.map, x: g.x, y: g.y }; }
    if (spec.kind === 'route') { const m = spec.means[0].obj; return { map: spec.map, x: m.x, y: m.y }; }
    if (spec.kind === 'layers') return { map: spec.map, x: spec.plan.x, y: spec.plan.y };
    return { map: spec.map, x: spec.x, y: spec.y };
  }
  function freeBeside(map, x, y) {
    let m;
    try { m = RB.maps.compile(map); } catch (e) { return { x, y: y + 1, dir: 'up' }; }
    for (const [dx, dy, dir] of [[0, 1, 'up'], [-1, 0, 'right'], [1, 0, 'left'], [0, -1, 'down'], [2, 0, 'left'], [0, 2, 'up']]) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < m.w && ny < m.h && !RB.maps.blockedStatic(m, nx, ny)) return { x: nx, y: ny, dir };
    }
    return { x, y: y + 1, dir: 'up' };
  }
  async function go(id) {
    const cur = RB.save && RB.save.current && RB.save.current();
    if (cur && cur.slot != null) return null; // a journey is loaded: never risk an autosave over it
    const spec = RB.verbs.get(id);
    if (!spec) return null;
    const at = spotOf(spec), f = freeBeside(at.map, at.x, at.y);
    if (!RB.game.s || RB.game.mode() !== 'world' || !RB.game.s.flags.dev_verbs) {
      const s = RB.game.debugStart(at.map, f.x, f.y, { flags: { dev_verbs: true, departed: true, ch2_done: true } });
      s.edition = 2;
      for (const w of ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'ishi', 'suzu', 'koe']) if (s.words.indexOf(w) < 0) s.words.push(w);
      await new Promise((r) => setTimeout(r, 300));
    } else await RB.game.transition(at.map, f.x, f.y, f.dir);
    if (RB.test && RB.test.place) RB.test.place(f.x, f.y, f.dir);
    return f;
  }
  function panel() {
    if (!allowed() || typeof document === 'undefined') return null;
    let el = document.getElementById('vb-dev');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'vb-dev';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Exploration action fixtures (development)');
    el.style.cssText = 'position:fixed;right:8px;top:8px;z-index:99999;background:rgba(28,37,48,0.94);color:#eee;font:13px sans-serif;padding:8px;border:1px solid #567;border-radius:6px;max-width:300px;max-height:90vh;overflow:auto;display:grid;gap:6px';
    const css = document.createElement('style');
    css.textContent = '#vb-dev button{font:13px sans-serif;color:#f4f0e6;background:#34485c;border:1px solid #7a90a6;border-radius:4px;min-height:28px;padding:2px 8px;text-align:left}#vb-dev.min>*:not(#vb-toggle){display:none}';
    document.head.appendChild(css);
    el.innerHTML = '<button type="button" id="vb-toggle">Exploration fixtures (dev): hide</button>' +
      RB.verbs.list().filter((v) => v.fixture).map((v) => '<button type="button" data-vb="' + v.id + '">' + v.kind + ' · ' + v.id + '</button>').join('');
    document.body.appendChild(el);
    el.addEventListener('click', (e) => {
      const x = e.target.closest('[data-vb]');
      if (x) go(x.dataset.vb);
      if (e.target.id === 'vb-toggle') { el.classList.toggle('min'); e.target.textContent = 'Exploration fixtures (dev): ' + (el.classList.contains('min') ? 'show' : 'hide'); }
    });
    return el;
  }
  if (typeof window !== 'undefined' && typeof document !== 'undefined' && allowed()) {
    let tries = 0;
    const open = () => { if (window.__RB_READY__ === true && document.body) panel(); else if (++tries < 300) setTimeout(open, 100); };
    setTimeout(open, 0);
  }
  return { allowed, panel, go, spotOf };
})();
