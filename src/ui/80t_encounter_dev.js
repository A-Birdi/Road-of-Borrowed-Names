/* The encounter platform's development panel (expansion P04): only on a page opened with ?dev=enc (or a test that sets
 * window.__RB_DEV_ENC__ before the game starts). It plays the fixtures (src/content/encounters/00_fixtures.js) in a
 * session that is never saved: offered only while no journey is loaded, so no save slot is current and nothing can be
 * autosaved. Never shown to a player otherwise. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.encDev = (function () {
  'use strict';
  function allowed() {
    try {
      if (typeof window === 'undefined') return false;
      if (window.__RB_DEV_ENC__) return true;
      return /[?&]dev=enc\b/.test(window.location.search || '');
    } catch (e) { return false; }
  }
  const pick = { comp: 'ren', difficulty: 'normal' };
  async function play(id) {
    const cur = RB.save && RB.save.current && RB.save.current();
    if (cur && cur.slot != null) return null; // a journey is loaded: never risk an autosave over it
    if (!RB.game.s || RB.game.mode() !== 'world') {
      RB.game.debugStart('rw.village', 22, 18, { comp: pick.comp === 'none' ? null : pick.comp, flags: { departed: true, ch2_done: true } });
      await new Promise((r) => setTimeout(r, 300));
    }
    const s = RB.game.s;
    s.learn.difficulty = pick.difficulty;
    s.comp = pick.comp === 'none' ? null : pick.comp;
    for (const w of ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'ishi', 'iyasu', 'koori', 'honoo', 'suzu', 'koe']) if (s.words.indexOf(w) < 0) s.words.push(w);
    return RB.game.startEncounter(id, {});
  }
  function panel() {
    if (!allowed() || typeof document === 'undefined') return null;
    let el = document.getElementById('enc-dev');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'enc-dev';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Encounter fixtures (development)');
    el.style.cssText = 'position:fixed;right:8px;top:8px;z-index:99999;background:rgba(28,37,48,0.94);color:#eee;font:13px sans-serif;padding:8px;border:1px solid #567;border-radius:6px;max-width:300px;max-height:90vh;overflow:auto;display:grid;gap:6px';
    const css = document.createElement('style');
    css.textContent = '#enc-dev button{font:13px sans-serif;color:#f4f0e6;background:#34485c;border:1px solid #7a90a6;border-radius:4px;min-height:28px;padding:2px 8px;text-align:left}#enc-dev button[aria-pressed="true"]{background:#7a5a2a;border-color:#e0b060}#enc-dev .row{display:flex;flex-wrap:wrap;gap:4px}#enc-dev.min>*:not(#enc-toggle){display:none}';
    document.head.appendChild(css);
    const C = RB.content.encounters || {};
    const ids = Object.keys(C).filter((k) => C[k].fixture);
    el.innerHTML = '<button type="button" id="enc-toggle">Encounter fixtures (dev): hide</button>' +
      '<div class="row">' + ['none', 'nao', 'mio', 'ren', 'suzu'].map((c) => '<button type="button" data-comp="' + c + '">' + c + '</button>').join('') + '</div>' +
      '<div class="row">' + ['relaxed', 'normal', 'hard'].map((d) => '<button type="button" data-diff="' + d + '">' + d + '</button>').join('') + '</div>' +
      ids.map((id) => '<button type="button" data-enc="' + id + '">' + id + ' · ' + C[id].name.en + '</button>').join('');
    document.body.appendChild(el);
    const sync = () => {
      for (const b of el.querySelectorAll('[data-comp]')) b.setAttribute('aria-pressed', String(b.dataset.comp === pick.comp));
      for (const b of el.querySelectorAll('[data-diff]')) b.setAttribute('aria-pressed', String(b.dataset.diff === pick.difficulty));
    };
    el.addEventListener('click', (e) => {
      const c = e.target.closest('[data-comp]'), d = e.target.closest('[data-diff]'), x = e.target.closest('[data-enc]');
      if (c) { pick.comp = c.dataset.comp; sync(); }
      if (d) { pick.difficulty = d.dataset.diff; sync(); }
      if (x) play(x.dataset.enc);
      if (e.target.id === 'enc-toggle') { el.classList.toggle('min'); e.target.textContent = 'Encounter fixtures (dev): ' + (el.classList.contains('min') ? 'show' : 'hide'); }
    });
    sync();
    return el;
  }
  if (typeof window !== 'undefined' && typeof document !== 'undefined' && allowed()) {
    let tries = 0;
    const open = () => { if (window.__RB_READY__ === true && document.body) panel(); else if (++tries < 300) setTimeout(open, 100); };
    setTimeout(open, 0);
  }
  return { allowed, panel, play, pick };
})();
