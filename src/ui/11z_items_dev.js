/* Development-only viewer for the items' drawn icons (LI-2; Robin, 2026-10-16: "Is there a ?dev link I can use to
 * view the icon set?"). Not reachable in normal play: it opens only on a page opened with ?dev=items (or when a test
 * set window.__RB_DEV_ITEMS__ = true before the game loaded). It draws with the game's own RB.itemArt, at the sizes
 * the game uses (the Satchel's rows 32 px, its detail 64 px, the award slip 48 px) on the page's paper and on the
 * book's cloth. Nothing is saved and no journey starts; the title underneath gets no keys while it is open.
 * Robin plays without spoilers: only Reedwake's things show at first; the other places' are behind one button, and
 * the items' descriptions are off until asked for. ?dev=items&all shows everything (for the browser test).
 *
 *   RB.itemsDev.allowed() · open() · close() · state() */
var RB = (globalThis.RB = globalThis.RB || {});

RB.itemsDev = (function () {
  'use strict';
  function allowed() {
    try {
      if (typeof window === 'undefined') return false;
      if (window.__RB_DEV_ITEMS__ === true) return true;
      return /[?&]dev=items\b/.test(window.location.search || '');
    } catch (e) { return false; }
  }
  // the places, in the order the road reaches them (by the ids' first part); anything else goes last
  const GROUPS = [
    ['rw', 'Reedwake'], ['sg', 'Saltglass'], ['cs', 'The cases'], ['mb', 'Manybridge'], ['mp', 'Blockprint and Playhouse Rows'],
    ['co', 'Cinder Orchard'], ['sb', 'Snowbell'], ['kr', "The Keepers' Road"], ['lf', 'Lanternfall'], ['ko', 'Kotonoha'],
    ['sea', 'The open sea'], ['cr', 'The Cloudroad'], ['yn', 'Steamhollow'], ['sa', 'The Still Archive'], ['lq', 'The long roads'],
    ['lw', 'Keepsakes of the living world'], ['as', 'Ashihara Shinden'], ['gd', "The guardians' gifts"], ['hall', 'The Hall of a Hundred Tales'],
    ['atlas', 'The Unwritten Atlas'],
  ];
  const OPEN = ['rw'];
  let el = null, keys = null;
  const V = { later: false, desc: false };
  const esc = (t) => (RB.util && RB.util.esc ? RB.util.esc(t) : String(t));
  const descOf = (d) => (!d ? '' : typeof d.desc === 'string' ? d.desc : d.desc && d.desc.en ? d.desc.en : '');
  function groups() {
    const items = (RB.content && RB.content.items) || {};
    const by = {};
    for (const id of Object.keys(items)) { const p = id.split('_')[0]; (by[p] || (by[p] = [])).push(id); }
    const out = GROUPS.filter(([p]) => by[p]).map(([p, label]) => ({ p, label, ids: by[p] }));
    for (const p of Object.keys(by)) if (!GROUPS.some(([q]) => q === p)) out.push({ p, label: p, ids: by[p] });
    return out;
  }
  function card(id) {
    const d = RB.content.items[id];
    const name = d && d.name ? (RB.ui.jhtml ? RB.ui.jhtml(d.name.jp) : esc(d.name.jp)) : '';
    const tags = [d.slot ? d.slot : null, d.key ? 'important' : null].filter(Boolean).join(' · ');
    const art = (s) => RB.itemArt.html(id, s);
    return '<li class="idv-card" data-id="' + esc(id) + '"><div class="idv-art"><span class="idv-paper">' + art(4) + '</span><span class="idv-paper">' + art(3) +
      art(2) + '</span><span class="idv-cloth">' + art(2) + '</span></div><div class="idv-t"><code>' + esc(id) + '</code><span class="idv-jp" lang="ja">' + name +
      '</span><span class="idv-en">' + esc(d.name ? d.name.en : '') + '</span>' + (tags ? '<span class="idv-k">' + esc(tags) + '</span>' : '') +
      (V.desc ? '<span class="idv-d">' + esc(descOf(d)) + '</span>' : '') + '</div></li>';
  }
  function render() {
    if (!el) return;
    const G = groups();
    const shown = G.filter((g) => V.later || OPEN.includes(g.p));
    const total = G.reduce((n, g) => n + g.ids.length, 0);
    el.querySelector('.idv-count').textContent = shown.reduce((n, g) => n + g.ids.length, 0) + ' of ' + total + ' items shown';
    el.querySelector('[data-idv="later"]').hidden = V.later;
    el.querySelector('[data-idv="desc"]').setAttribute('aria-pressed', String(V.desc));
    el.querySelector('.idv-body').innerHTML = shown.map((g) => '<section class="idv-group" data-group="' + esc(g.p) + '"><h2>' + esc(g.label) + ' <span>' + g.ids.length + '</span></h2><ul>' + g.ids.map(card).join('') + '</ul></section>').join('') +
      (V.later ? '' : '<p class="idv-hidden">The other places’ things are hidden: their names and pictures would tell you where the road goes.</p>');
  }
  function open() {
    if (el || typeof document === 'undefined' || !RB.itemArt) return el;
    V.later = /[?&]dev=items&all\b|[?&]all\b/.test((window.location && window.location.search) || '') || !!window.__RB_DEV_ITEMS_ALL__;
    const css = document.createElement('style');
    css.id = 'idv-css';
    css.textContent = [
      '#items-dev{position:fixed;inset:0;z-index:99999;overflow:auto;background:#efe6cf;color:#2a2217;font:15px/1.45 Georgia,serif}',
      '#items-dev header{position:sticky;top:0;z-index:2;display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;padding:10px 16px;background:#1b2140;color:#f4ecd6;font-family:system-ui,sans-serif}',
      '#items-dev header h1{font:600 17px system-ui,sans-serif;margin:0}',
      '#items-dev header .idv-count{opacity:.8;font-size:13px}',
      '#items-dev header button{font:13px system-ui,sans-serif;min-height:34px;padding:0 12px;border-radius:4px;border:1px solid #9a8b66;background:#2c3561;color:#f4ecd6;cursor:pointer}',
      '#items-dev header button[aria-pressed=true]{background:#7a5a20}',
      '#items-dev header .idv-sp{flex:1}',
      '#items-dev .idv-body{padding:8px 16px 40px}',
      '#items-dev h2{font:600 18px Georgia,serif;margin:22px 0 8px;border-bottom:1px solid #b9a57a;padding-bottom:4px}',
      '#items-dev h2 span{font:13px system-ui,sans-serif;opacity:.6}',
      '#items-dev ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:10px}',
      '#items-dev .idv-card{display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px;align-items:center;padding:8px;border:1px solid #c9b88f;border-radius:4px;background:#f7f0de}',
      '#items-dev .idv-art{display:flex;align-items:center;gap:6px}',
      '#items-dev .idv-paper,#items-dev .idv-cloth{display:inline-flex;align-items:center;gap:6px;padding:6px;border-radius:3px}',
      '#items-dev .idv-paper{background:#efe3c6}',
      '#items-dev .idv-cloth{background:#1b2140}',
      '#items-dev .idv-t{display:flex;flex-direction:column;min-width:0}',
      '#items-dev code{font:12px ui-monospace,monospace;opacity:.7}',
      '#items-dev .idv-jp{font-size:16px}',
      '#items-dev .idv-en{font-style:italic}',
      '#items-dev .idv-k{font:12px system-ui,sans-serif;opacity:.7}',
      '#items-dev .idv-d{font-size:13px;margin-top:4px;color:#4a3f2e}',
      '#items-dev .idv-hidden{margin:24px 0;font-style:italic;opacity:.75}',
      '#items-dev img.it-ic{image-rendering:pixelated}',
      '#items-dev rt{color:#5a4a30;font-size:.55em}',
    ].join('');
    document.head.appendChild(css);
    el = document.createElement('div');
    el.id = 'items-dev';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Item icons (development)');
    el.innerHTML = '<header><h1>Item icons (development)</h1><span class="idv-count"></span><span class="idv-sp"></span>' +
      '<button type="button" data-idv="later">Show later places (spoilers)</button><button type="button" data-idv="desc" aria-pressed="false">Descriptions</button>' +
      '<button type="button" data-idv="close">Close</button></header><div class="idv-body"></div>';
    document.body.appendChild(el);
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-idv]');
      if (!b) return;
      if (b.dataset.idv === 'later') { V.later = true; render(); el.querySelector('[data-idv="desc"]').focus(); }
      else if (b.dataset.idv === 'desc') { V.desc = !V.desc; render(); }
      else close();
    });
    // the title underneath gets no keys while the viewer is open (Escape closes it)
    keys = (e) => {
      if (!el) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      e.stopPropagation();
    };
    window.addEventListener('keydown', keys, true);
    render();
    const first = el.querySelector('[data-idv="later"]:not([hidden])') || el.querySelector('[data-idv="desc"]');
    if (first) first.focus();
    return el;
  }
  function close() {
    if (!el) return;
    window.removeEventListener('keydown', keys, true);
    el.remove(); el = null;
    const css = document.getElementById('idv-css');
    if (css) css.remove();
  }
  function state() {
    if (!el) return { open: false };
    return { open: true, later: V.later, desc: V.desc, groups: [...el.querySelectorAll('.idv-group')].map((g) => g.dataset.group), cards: el.querySelectorAll('.idv-card').length, icons: el.querySelectorAll('.idv-card img.it-ic').length };
  }
  if (typeof window !== 'undefined' && typeof document !== 'undefined' && allowed()) {
    let tries = 0;
    const go = () => { if (window.__RB_READY__ === true && document.body) open(); else if (++tries < 300) setTimeout(go, 100); };
    setTimeout(go, 0);
  }
  return { allowed, open, close, state };
})();
