/* Wayfarer's Folio — shared interface pieces: a small inline icon set (no
 * emoji), the cloth frame, layered paper tabs (APG tabs pattern with roving
 * tabindex, automatic activation, one moving ribbon), and helpers for
 * two-page spreads. Screens (pause folio, settings, ledger…) build on these. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.folio = (function () {
  'use strict';
  const esc = RB.util.esc;

  // ---- icons: 24×24 line drawings in currentColor --------------------------------
  const P = {
    journey: '<path d="M4 20c3-1 4-4 7-5s6 1 8-3"/><path d="M6 20c1-2 0-3-2-4"/><circle cx="18" cy="6" r="2.5"/><path d="M18 8.5v3"/>',
    words: '<path d="M5 19c2-6 6-11 12-14"/><path d="M17 5l2 2-9 9-3 1 1-3z"/><path d="M5 19h7"/>',
    satchel: '<path d="M5 9h14l-1.2 10H6.2z"/><path d="M8 9V7a4 4 0 0 1 8 0v2"/><path d="M5 9l2 4h10l2-4"/><path d="M11 13h2v2h-2z"/>',
    map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/><path d="M5.5 11c1.5-1 3 1 4.5 0s3 1 4.5 0 2.5 1 3.5 0" stroke-dasharray="1.5 1.8"/>',
    ledger: '<path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6z"/><path d="M6 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2"/><path d="M9 8h7M9 12h7M9 16h4"/>',
    settings: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/><path d="M4 12h5M13 12h7"/><circle cx="11" cy="12" r="2"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    next: '<path d="M9 5l7 7-7 7"/>',
    main: '<path d="M7 3h10v18l-5-4-5 4z"/>',
    side: '<circle cx="12" cy="12" r="6.5"/><path d="M12 8.5v4l2.5 1.5"/>',
    companion: '<circle cx="9" cy="8" r="3"/><circle cx="16" cy="9" r="2.5"/><path d="M3.5 19c.8-4 3-6 5.5-6s4.7 2 5.5 6"/><path d="M14 14c2.6 0 4.5 1.8 5 5"/>',
    done: '<path d="M4 12.5l5 5L20 6.5"/>',
    note: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 11h7M9 15h7"/>',
    history: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
    pouch: '<path d="M8 6h8l-1 2c3 1.5 4 4 4 7a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5c0-3 1-5.5 4-7z"/><path d="M9 6c1-2 5-2 6 0"/>',
    letter: '<rect x="3.5" y="6" width="17" height="12" rx="1"/><path d="M4 7l8 6 8-6"/>',
    bell: '<path d="M12 3a1 1 0 0 1 1 1v1.2c2.8.6 4.5 3 4.5 6V15l1.5 2.5H5L6.5 15v-3.8c0-3.2 1.7-5.6 4.5-6.1V4a1 1 0 0 1 1-1z"/><path d="M10 19.5a2 2 0 0 0 4 0"/>',
    key: '<circle cx="8" cy="12" r="3.5"/><path d="M11.5 12H21M17 12v3M20 12v2"/>',
    charm: '<path d="M8 4h8v13l-4 3-4-3z"/><path d="M10 4V2.5h4V4"/><path d="M10 9h4M12 7v6"/>',
    shard: '<path d="M7 4l9 2 3 7-7 8-7-6z"/><path d="M7 4l5 9 7 0M12 13l0 8"/>',
    tool: '<path d="M14 4a4 4 0 0 0 5 5l-9 9a2 2 0 0 1-3-3z"/><path d="M13 5l6 6"/>',
    keepsake: '<circle cx="12" cy="9" r="2"/><path d="M12 7c0-3 4-4 4-1s-4 3-4 3M12 7c0-3-4-4-4-1s4 3 4 3M12 11c0 3 4 4 4 1s-4-3-4-3M12 11c0 3-4 4-4 1s4-3 4-3"/><path d="M12 13v8"/>',
    book: '<path d="M4 5c3-1 6-1 8 1v14c-2-2-5-2-8-1z"/><path d="M20 5c-3-1-6-1-8 1v14c2-2 5-2 8-1z"/>',
    lantern: '<path d="M9 5h6M12 3v2M8 7h8l1 4-1 6H8l-1-6z"/><path d="M9 20h6M12 17v3"/>',
    scroll: '<path d="M6 5h11a2 2 0 0 1 0 4H8"/><path d="M6 5a2 2 0 0 0 0 4v10h11a2 2 0 0 0 0-4"/><path d="M10 13h5"/>',
    food: '<path d="M12 4c4 0 7 6 7 10a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3c0-4 3-10 7-10z"/><path d="M9 14h6v3H9z"/>',
    stone: '<path d="M5 15c0-5 3-9 8-9 3 0 6 3 6 7 0 4-3 6-7 6-4 0-7-1-7-4z"/><path d="M9 11c1-1 2-1 3 0"/>',
    travel: '<path d="M5 19c4-9 8-13 14-14"/><path d="M14 5h5v5"/>',
    here: '<path d="M12 21s-6-6-6-11a6 6 0 0 1 12 0c0 5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
    sound: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9c1.5 1.5 1.5 4.5 0 6M18.5 7c3 3 3 7 0 10"/>',
    help: '<path d="M9 9a3 3 0 1 1 4 2.8c-.7.3-1 1-1 1.7V15"/><circle cx="12" cy="18" r=".6"/><circle cx="12" cy="12" r="9"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
    menu: '<path d="M5 7h14M5 12h14M5 17h14"/>',
    warn: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/>',
    copy: '<rect x="8" y="8" width="11" height="12" rx="1"/><path d="M5 16V4h11"/>',
    trash: '<path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13"/>',
    save: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
    load: '<path d="M4 7h7l2 2h7v10H4z"/><path d="M12 12v5M9.5 14.5L12 17l2.5-2.5"/>',
    title: '<path d="M4 11l8-6 8 6"/><path d="M6 10v10h12V10"/><path d="M10 20v-5h4v5"/>',
    practice: '<path d="M4 19l4-1L19 7l-3-3L5 15z"/><path d="M14 6l3 3"/>',
  };
  function icon(name, title) {
    const d = P[name] || P.pouch;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"' +
      (title ? ' role="img" aria-label="' + esc(title) + '"' : ' aria-hidden="true" focusable="false"') + '>' + d + '</svg>';
  }
  // A recognisable icon for an item from its slot, id and name.
  function itemIcon(id, d) {
    const k = (id + ' ' + ((d && d.name && d.name.en) || '')).toLowerCase();
    if (d && d.slot === 'charm') return 'charm';
    if (d && d.slot === 'tool') return 'tool';
    if (d && d.slot === 'cosmetic') return 'keepsake';
    const R = [[/letter|reply|note|postcard|envelope|message|tag/, 'letter'], [/bell/, 'bell'], [/key/, 'key'], [/glass|shard|crystal/, 'shard'],
      [/book|folio|registry|ledger|minutes|record|diary|notebook|log\b|page/, 'book'], [/lantern|lamp|candle/, 'lantern'], [/map|chart|sketch|scroll|poster/, 'scroll'],
      [/rice|mochi|tea|food|bread|persimmon|dumpling|fish|cake|bun|soup/, 'food'], [/stone|tile|seal|pebble|rock/, 'stone'], [/tool|hammer|needle|brush/, 'tool']];
    for (const [re, n] of R) if (re.test(k)) return n;
    return 'pouch';
  }

  // ---- frame -------------------------------------------------------------------
  // Returns the pieces of a folio: scrim > .folio > head / tab slot / leafbox / foot.
  function frame(opts) {
    const scrim = RB.ui.el('div', 'folio-scrim');
    const f = RB.ui.el('div', 'folio' + (opts.cls ? ' ' + opts.cls : ''));
    f.setAttribute('role', 'dialog');
    f.setAttribute('aria-modal', 'true');
    const hid = 'fh' + Math.random().toString(36).slice(2, 7);
    f.setAttribute('aria-labelledby', hid);
    f.innerHTML = '<div class="folio-head"><h2 id="' + hid + '"></h2><span class="meta"></span>' +
      (opts.onClose ? '<button class="cbtn" data-folio-close>' + icon(opts.closeIcon || 'close') + '<span>' + esc(opts.closeLabel || 'Close') + '</span></button>' : '') + '</div>' +
      '<div class="tabslot"></div><div class="leafbox"></div><div class="folio-foot"></div>';
    scrim.appendChild(f);
    const api = {
      scrim, el: f,
      head: f.querySelector('.folio-head'), tabslot: f.querySelector('.tabslot'), box: f.querySelector('.leafbox'), foot: f.querySelector('.folio-foot'),
      setTitle(html, meta) { f.querySelector('h2').innerHTML = html; f.querySelector('.meta').innerHTML = meta || ''; },
    };
    if (opts.onClose) f.querySelector('[data-folio-close]').onclick = opts.onClose;
    // clicks on the dim area outside the book close it (like Back), never on the page
    scrim.addEventListener('pointerdown', (e) => { if (e.target === scrim && opts.onClose) { scrim.__outside = true; } });
    scrim.addEventListener('click', (e) => { if (e.target === scrim && scrim.__outside && opts.onClose) opts.onClose(); scrim.__outside = false; });
    return api;
  }

  // ---- paper tabs -----------------------------------------------------------------
  // items: [{id, en, jp, icon}] · onSelect(id, how) where how is 'click' | 'key'
  function tabs(slot, items, selected, onSelect, opts) {
    opts = opts || {};
    const wrap = RB.ui.el('div', 'tabrail-wrap');
    const pid = opts.panelId || 'folio-page';
    wrap.innerHTML = '<button class="rail-arrow l" tabindex="-1" aria-hidden="true">' + icon('back') + '</button>' +
      '<div class="tabrail" role="tablist" aria-label="' + esc(opts.label || 'Sections') + '">' +
      items.map((t) => '<button class="ptab" role="tab" id="tab-' + t.id + '" data-id="' + t.id + '" aria-controls="' + pid + '" aria-selected="false" tabindex="-1">' +
        icon(t.icon) + '<span class="tl">' + RB.ui.label(t.jp, t.en) + '</span></button>').join('') +
      '<span class="ribbon" aria-hidden="true"></span></div>' +
      '<button class="rail-arrow r" tabindex="-1" aria-hidden="true">' + icon('next') + '</button>';
    slot.innerHTML = '';
    slot.appendChild(wrap);
    const rail = wrap.querySelector('.tabrail');
    const ribbon = rail.querySelector('.ribbon');
    const btns = Array.from(rail.querySelectorAll('.ptab'));
    let cur = null;
    // keep the selected tab clear of the rail's edge arrows without moving the page
    function reveal(b) {
      const pad = wrap.classList.contains('overflowing') ? 44 : 8;
      const l = b.offsetLeft - rail.scrollLeft, r = l + b.offsetWidth;
      if (l < pad) rail.scrollLeft += l - pad; else if (r > rail.clientWidth - pad) rail.scrollLeft += r - rail.clientWidth + pad;
    }
    function place() {
      const b = btns.find((x) => x.dataset.id === cur);
      if (!b) return;
      ribbon.style.transform = 'translateX(' + (b.offsetLeft + b.offsetWidth - 28) + 'px)';
      // natural width of the tabs (independent of the arrows' extra padding)
      const first = btns[0], last = btns[btns.length - 1];
      const need = last.offsetLeft + last.offsetWidth - first.offsetLeft + 24;
      wrap.classList.toggle('overflowing', need > rail.clientWidth + 1);
      reveal(b);
    }
    function select(id, how, focus) {
      const changed = id !== cur;
      cur = id;
      for (const b of btns) {
        const on = b.dataset.id === id;
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
        b.classList.toggle('autofocus', on); // the folio opens with focus on its selected tab
        if (on && changed && how) { b.classList.remove('lift'); void b.offsetWidth; b.classList.add('lift'); }
      }
      const b = btns.find((x) => x.dataset.id === id);
      if (b) {
        if (focus) b.focus({ preventScroll: true });
        reveal(b);
      }
      requestAnimationFrame(place);
      if (changed && how && onSelect) onSelect(id, how);
    }
    rail.addEventListener('click', (e) => {
      const b = e.target.closest('.ptab');
      if (!b || b.getAttribute('aria-disabled') === 'true') return;
      if (b.dataset.id !== cur) RB.audio && RB.audio.sfx('page');
      select(b.dataset.id, 'click', false);
    });
    rail.addEventListener('keydown', (e) => {
      const i = btns.findIndex((b) => b === document.activeElement);
      if (i < 0) return;
      let j = null;
      if (e.key === 'ArrowRight') j = (i + 1) % btns.length;
      else if (e.key === 'ArrowLeft') j = (i - 1 + btns.length) % btns.length;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = btns.length - 1;
      if (j == null) return;
      // the tablist owns Left/Right/Home/End; the game's global keys must not also act
      e.preventDefault();
      e.stopPropagation();
      RB.audio && RB.audio.sfx('page');
      select(btns[j].dataset.id, 'key', true);
    });
    wrap.querySelector('.rail-arrow.l').onclick = () => { rail.scrollLeft -= rail.clientWidth * 0.6; };
    wrap.querySelector('.rail-arrow.r').onclick = () => { rail.scrollLeft += rail.clientWidth * 0.6; };
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => place()) : null;
    if (ro) ro.observe(rail);
    select(selected, null, false);
    return { el: wrap, select: (id) => select(id, null, false), current: () => cur, destroy() { if (ro) ro.disconnect(); } };
  }

  // Two-page spread available at this width (matches the CSS breakpoint).
  function wide() {
    return typeof matchMedia !== 'undefined' && matchMedia('(min-width: 860px)').matches;
  }

  return { icon, itemIcon, frame, tabs, wide, ICONS: P };
})();
