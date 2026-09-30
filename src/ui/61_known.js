/* Map › Known details (addendum §18.2): a compact local diagram and list for
 * the current map or one already visited. Authored annotations
 * (RB.content.knownDetails, src/content/cases/60_known.js) appear only once
 * their fact is discovered and take their state from the game's flags;
 * recorded notes (RB.known.note, used by other systems, updated on
 * `world:changed`) keep theirs in the save. The player may add up to 20 pins
 * per map — Return here, Question, View, Passage — each with a plain-text note
 * of at most 200 characters, and edit or remove them; limits are shown before
 * anything could be lost. Shapes and words carry every meaning, never colour
 * alone. Only the chosen (visited) map is drawn: nothing beyond its walls.
 *
 *   RB.known.note(s, map, id, { label, state, x, y })   record/update a detail
 *   RB.known.entries(s, map)                          what the page lists
 *   RB.known.addPin / editPin / removePin(s, map, …)  player pins
 * State: s.discovery.known[map][id] = { t, state, label?, x, y };
 *        s.discovery.pins[map] = [{ id, type, note, x, y, t }]. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.known = (function () {
  'use strict';
  const MAX_PINS = 20, NOTE_MAX = 200;
  const TYPES = [
    { id: 'return', en: 'Return here', jp: 'また {来|く}る' },
    { id: 'question', en: 'Question', jp: '{疑問|ぎもん}' },
    { id: 'view', en: 'View', jp: '{眺|なが}め' },
    { id: 'passage', en: 'Passage', jp: '{抜|ぬ}け{道|みち}' },
  ];
  const STATE_WORD = { question: 'Unexplained', barred: 'Barred', seen: 'Noted', solved: 'Solved', opened: 'Opened', view: 'A view', unreadable: 'Unreadable' };
  const D = (s) => RB.cases._D(s);
  function note(s, map, id, o) {
    if (!s || !map || !id) return null;
    const d = D(s), m = d.known[map] || (d.known[map] = {});
    const cur = m[id] || (m[id] = { t: Date.now() });
    if (o) {
      if (o.state) cur.state = String(o.state);
      if (o.label) cur.label = typeof o.label === 'string' ? { en: o.label } : { en: o.label.en || '', jp: o.label.jp || null };
      if (o.x != null) cur.x = +o.x;
      if (o.y != null) cur.y = +o.y;
    }
    return cur;
  }
  // D1's field puzzles report changes; a detail recorded for that prop follows its new state
  RB.bus.on('world:changed', (e) => {
    const s = RB.game && RB.game.s;
    if (!s || !e || !e.map) return;
    const id = e.prop || e.id;
    const rec = D(s).known[e.map];
    if (rec && rec[id]) { if (e.state) rec[id].state = String(e.state); }
    else if (e.label) note(s, e.map, id, e);
  });
  // authored details for a map, as known now; then recorded ones
  function entries(s, map) {
    const out = [];
    for (const d of RB.content.knownDetails || []) {
      if (d.map !== map || !RB.state.test(s, d.show)) continue;
      const st = d.states.find((x) => !x.if || RB.state.test(s, x.if)) || d.states[d.states.length - 1];
      out.push({ id: d.id, kind: d.kind, x: d.x, y: d.y, state: st.state, label: st.label, authored: true });
    }
    const rec = D(s).known[map] || {};
    for (const id in rec) {
      if (out.some((e) => e.id === id)) continue;
      const r = rec[id];
      if (!r.label) continue; // a state without words is not shown
      out.push({ id, kind: r.kind || 'mechanism', x: r.x, y: r.y, state: r.state || 'seen', label: r.label, authored: false });
    }
    return out;
  }
  // ---- pins -------------------------------------------------------------------------------------------------
  const pins = (s, map) => { const d = D(s); const L = d.pins[map]; return Array.isArray(L) ? L : []; };
  function check(s, map, o) {
    const m = RB.content.maps[map];
    if (!m) return 'unknown map';
    if (!TYPES.some((t) => t.id === o.type)) return 'unknown type';
    return null;
  }
  function addPin(s, map, o) {
    const L = pins(s, map);
    if (L.length >= MAX_PINS) return { ok: false, reason: 'full' };
    const bad = check(s, map, o);
    if (bad) return { ok: false, reason: bad };
    const c = RB.cases.clean(o.note, NOTE_MAX);
    const pin = { id: 'p' + Date.now().toString(36) + L.length, type: o.type, note: c.text, x: Math.round(+o.x || 0), y: Math.round(+o.y || 0), t: Date.now() };
    D(s).pins[map] = L.concat([pin]);
    return { ok: true, pin, cut: c.cut };
  }
  function editPin(s, map, id, o) {
    const p = pins(s, map).find((q) => q.id === id);
    if (!p) return { ok: false, reason: 'missing' };
    if (o.type && TYPES.some((t) => t.id === o.type)) p.type = o.type;
    let cut = false;
    if (o.note != null) { const c = RB.cases.clean(o.note, NOTE_MAX); p.note = c.text; cut = c.cut; }
    if (o.x != null) p.x = Math.round(+o.x);
    if (o.y != null) p.y = Math.round(+o.y);
    return { ok: true, pin: p, cut };
  }
  function removePin(s, map, id) {
    const L = pins(s, map), i = L.findIndex((q) => q.id === id);
    if (i < 0) return false;
    L.splice(i, 1);
    return true;
  }
  // older saves: pins and notes keep their shape; unknown maps are kept, never deleted
  function migrate(st) {
    const d = st.discovery;
    if (!d) return;
    if (!d.known || typeof d.known !== 'object' || Array.isArray(d.known)) d.known = {};
    if (!d.pins || typeof d.pins !== 'object' || Array.isArray(d.pins)) d.pins = {};
    for (const m in d.pins) if (!Array.isArray(d.pins[m])) delete d.pins[m];
  }
  if (RB.save && RB.save.addMigration) RB.save.addMigration(migrate);
  return { note, entries, pins, addPin, editPin, removePin, migrate, TYPES, STATE_WORD, MAX_PINS, NOTE_MAX };
})();

RB.ui.known = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => RB.ui.folio.icon(n);
  const KN = RB.known;
  const V = { map: null, form: null, status: '', focus: null };
  // shapes (SVG, in a 20×20 box): the meaning is also written beside each
  const INK = '#261f15';
  const SHAPE = {
    question: '<circle cx="10" cy="10" r="8" fill="#f7f0de" stroke="' + INK + '" stroke-width="2"/><text x="10" y="14.5" text-anchor="middle" font-size="12" font-weight="700" fill="' + INK + '" font-family="Georgia, serif">?</text>',
    barred: '<rect x="2" y="2" width="16" height="16" fill="#f7f0de" stroke="' + INK + '" stroke-width="2"/><path d="M2 10 H18" stroke="' + INK + '" stroke-width="3"/>',
    seen: '<path d="M10 1 L19 10 L10 19 L1 10 Z" fill="#f7f0de" stroke="' + INK + '" stroke-width="2"/>',
    solved: '<circle cx="10" cy="10" r="8" fill="#f7f0de" stroke="' + INK + '" stroke-width="2"/><path d="M5.5 10.5 L8.5 13.5 L14.5 6.5" fill="none" stroke="' + INK + '" stroke-width="2.4"/>',
    opened: '<rect x="2" y="2" width="16" height="16" fill="#f7f0de" stroke="' + INK + '" stroke-width="2" stroke-dasharray="3 2"/><path d="M5 10 H15 M11 6 L15 10 L11 14" fill="none" stroke="' + INK + '" stroke-width="2"/>',
    view: '<path d="M1 10 Q10 1 19 10 Q10 19 1 10 Z" fill="#f7f0de" stroke="' + INK + '" stroke-width="2"/><circle cx="10" cy="10" r="3" fill="' + INK + '"/>',
    unreadable: '<rect x="3" y="2" width="14" height="16" fill="#f7f0de" stroke="' + INK + '" stroke-width="2"/><path d="M6 7 H14 M6 11 H12 M6 15 H13" stroke="' + INK + '" stroke-width="1.5" stroke-dasharray="2 2"/>',
  };
  const PIN = {
    return: '<path d="M10 1 L18 8 V19 H2 V8 Z" fill="#fff4c8" stroke="' + INK + '" stroke-width="2"/><rect x="8" y="12" width="4" height="7" fill="' + INK + '"/>',
    question: '<rect x="2" y="2" width="16" height="16" rx="4" fill="#fff4c8" stroke="' + INK + '" stroke-width="2"/><text x="10" y="14.5" text-anchor="middle" font-size="12" font-weight="700" fill="' + INK + '" font-family="Georgia, serif">?</text>',
    view: '<path d="M10 2 L19 18 H1 Z" fill="#fff4c8" stroke="' + INK + '" stroke-width="2"/><circle cx="10" cy="13" r="2.5" fill="' + INK + '"/>',
    passage: '<rect x="1" y="4" width="18" height="12" fill="#fff4c8" stroke="' + INK + '" stroke-width="2"/><path d="M4 10 H16 M7 7 L4 10 L7 13 M13 7 L16 10 L13 13" fill="none" stroke="' + INK + '" stroke-width="1.8"/>',
  };
  const sym = (inner, label) => '<svg viewBox="0 0 20 20" role="img" aria-label="' + esc(label) + '">' + inner + '</svg>';
  const typeOf = (id) => KN.TYPES.find((t) => t.id === id) || KN.TYPES[0];
  const mapName = (id) => { const m = RB.content.maps[id]; return m && m.name ? m.name.en : id; };

  // the diagram: the map's own tiles, coarse (open ground, walls and solid things, water), with the marks
  function diagram(s, map, list, pinsL, form) {
    let m;
    try { m = RB.maps.compile(map); } catch (e) { return ''; }
    const k = 10, W = m.w * k, H = m.h * k;
    let b = '<rect width="' + W + '" height="' + H + '" fill="#efe3c6"/>';
    for (let y = 0; y < m.h; y++) {
      let x = 0;
      while (x < m.w) {
        const t = m.tiles[y * m.w + x], blk = RB.maps.blockedStatic(m, x, y);
        const cls = t && t.water ? 'w' : blk ? 'b' : null;
        let x2 = x + 1;
        while (x2 < m.w) { const t2 = m.tiles[y * m.w + x2], b2 = RB.maps.blockedStatic(m, x2, y); if ((t2 && t2.water ? 'w' : b2 ? 'b' : null) !== cls) break; x2++; }
        if (cls) b += '<rect x="' + x * k + '" y="' + y * k + '" width="' + (x2 - x) * k + '" height="' + k + '" fill="' + (cls === 'w' ? '#a9c4cf' : '#9d8b66') + '"/>';
        x = x2;
      }
    }
    // ways out (open now)
    for (const e of m.exits) { if (e.if && !RB.state.test(s, e.if)) continue; b += '<rect x="' + e.x * k + '" y="' + e.y * k + '" width="' + (e.w || 1) * k + '" height="' + (e.h || 1) * k + '" fill="none" stroke="#1f5a92" stroke-width="2"/>'; }
    // a mark: the shape (a 20-unit box) centred on the tile, and its number beside it
    const put = (x, y, inner, n) => '<g transform="translate(' + (x * k - 5) + ',' + (y * k - 5) + ')">' + inner + (n != null ? '<text x="22" y="9" font-size="10" font-weight="700" fill="' + INK + '" stroke="#efe3c6" stroke-width="3" paint-order="stroke" font-family="Georgia, serif">' + n + '</text>' : '') + '</g>';
    list.forEach((e, i) => { if (e.x != null) b += put(e.x, e.y, SHAPE[e.state] || SHAPE.seen, i + 1); });
    pinsL.forEach((p, i) => { b += put(p.x, p.y, PIN[p.type] || PIN.return, 'P' + (i + 1)); });
    if (form) b += '<g transform="translate(' + (form.x * k - 7) + ',' + (form.y * k - 7) + ')"><rect width="24" height="24" fill="none" stroke="#a83e27" stroke-width="3" stroke-dasharray="4 3"/></g>';
    if (s.map === map) {
      const px = s.x != null ? s.x : 0, py = s.y != null ? s.y : 0;
      b += '<path d="M' + (px * k + 5) + ' ' + (py * k - 2) + ' l6 10 h-12 z" fill="#a83e27" stroke="' + INK + '" stroke-width="1.5"/>';
    }
    return '<svg class="kd-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" tabindex="0" aria-label="' + esc('Diagram of ' + mapName(map) + ': ' + list.length + ' known details and ' + pinsL.length + ' pins, listed below.' + (s.map === map ? ' The red triangle is where you are.' : '')) + '">' + b + '</svg>';
  }
  function listBlock(list) {
    if (!list.length) return '<p class="muted">Nothing noted here yet. Details appear once you have found them: a barred door, a mechanism, an inscription, a shortcut.</p>';
    return '<ol class="kd-list">' + list.map((e, i) => '<li><span class="kd-sym">' + sym(SHAPE[e.state] || SHAPE.seen, KN.STATE_WORD[e.state] || e.state) + '</span><div><div class="kd-state">' + (i + 1) + ' · ' + esc(KN.STATE_WORD[e.state] || e.state) + '</div><div class="t">' + esc(e.label.en) + '</div></div></li>').join('') + '</ol>';
  }
  function pinBlock(s, map, pinsL) {
    const full = pinsL.length >= KN.MAX_PINS;
    let h = '<h4 class="kd-h">' + I('here') + ' Your pins <span class="kd-limit' + (full ? ' full' : '') + '">' + pinsL.length + ' of ' + KN.MAX_PINS + ' on this map</span></h4>';
    h += pinsL.length ? '<ol class="kd-list">' + pinsL.map((p, i) => '<li><span class="kd-sym">' + sym(PIN[p.type] || PIN.return, typeOf(p.type).en) + '</span><div><div class="kd-state">P' + (i + 1) + ' · ' + esc(typeOf(p.type).en) + '</div><div class="t kd-note">' + (p.note ? esc(p.note) : '<span class="muted">(no note)</span>') + '</div></div>' +
      '<div class="cs-acts"><button class="pbtn small" data-k="edit" data-pin="' + esc(p.id) + '">' + I('note') + '<span>Edit</span></button><button class="pbtn small danger" data-k="remove" data-pin="' + esc(p.id) + '">' + I('trash') + '<span>Remove</span></button></div></li>').join('') + '</ol>' : '<p class="muted small">No pins on this map.</p>';
    if (V.form && V.form.map === map) h += formBlock(s, map);
    else h += '<div class="cs-acts"><button class="pbtn" data-k="new"' + (full ? ' disabled aria-describedby="kd-full"' : '') + '>' + I('here') + '<span>Add a pin</span></button></div>' +
      (full ? '<p class="note-slip warn" id="kd-full">This map already has ' + KN.MAX_PINS + ' pins, the most it can keep. Remove one to add another; nothing is replaced on its own.</p>' : '');
    return h;
  }
  function formBlock(s, map) {
    const f = V.form, n = RB.cases.graphemes(f.note).length;
    return '<div class="kd-pinform" role="group" aria-label="' + (f.id ? 'Edit pin' : 'New pin') + '"><fieldset><legend>Kind of pin</legend>' +
      KN.TYPES.map((t) => '<label class="kd-type"><input type="radio" name="kd-type" value="' + t.id + '"' + (f.type === t.id ? ' checked' : '') + '><span class="kd-sym" aria-hidden="true" style="width:1.4em;height:1.4em;display:inline-block">' + sym(PIN[t.id], t.en) + '</span>' + esc(t.en) + '</label>').join('') + '</fieldset>' +
      '<p class="small">Position: ' + (f.x + ', ' + f.y) + (s.map === map && f.x === s.x && f.y === s.y ? ' (where you stand)' : '') + '. Tap the diagram to move it, or nudge: ' +
      '<button class="pbtn small" data-k="mv" data-d="-1,0" aria-label="Move the pin west">←</button><button class="pbtn small" data-k="mv" data-d="0,-1" aria-label="Move the pin north">↑</button><button class="pbtn small" data-k="mv" data-d="0,1" aria-label="Move the pin south">↓</button><button class="pbtn small" data-k="mv" data-d="1,0" aria-label="Move the pin east">→</button></p>' +
      '<label for="kd-note">Note (optional)</label><textarea id="kd-note" data-k="note" rows="2" spellcheck="false">' + esc(f.note) + '</textarea>' +
      '<div class="cs-note-foot"><span class="cs-count' + (n > KN.NOTE_MAX ? ' over' : '') + '" aria-live="polite">' + n + ' / ' + KN.NOTE_MAX + (n > KN.NOTE_MAX ? ' — only the first ' + KN.NOTE_MAX + ' characters will be kept' : '') + '</span>' +
      '<span><button class="pbtn small primary" data-k="save">' + I('save') + '<span>' + (f.id ? 'Save pin' : 'Place pin') + '</span></button> <button class="pbtn small" data-k="cancel"><span>Cancel</span></button></span></div>' +
      '<p class="muted small">Plain words, just for you. Up to ' + KN.MAX_PINS + ' pins on each map.</p></div>';
  }
  function maps(s) {
    const L = Object.keys(s.visited || {}).filter((id) => RB.content.maps[id]);
    if (s.map && RB.content.maps[s.map] && !L.includes(s.map)) L.unshift(s.map);
    return L;
  }
  function render(A, B, two, api) {
    const s = api.s;
    const L = maps(s);
    // the page opens on the map you are on; a map chosen from the list stays while you stay put
    if (V.here !== s.map) { V.here = s.map; V.map = null; V.form = null; }
    if (!V.map || !L.includes(V.map)) V.map = s.map && RB.content.maps[s.map] ? s.map : L[0];
    const map = V.map;
    if (!map) { A.innerHTML = '<p class="muted">No map yet.</p>'; return; }
    const list = KN.entries(s, map), pinsL = KN.pins(s, map);
    const sel = '<label class="small" for="kd-map">Map</label> <select id="kd-map" data-k="map">' + L.map((id) => '<option value="' + esc(id) + '"' + (id === map ? ' selected' : '') + '>' + esc(mapName(id)) + (id === s.map ? ' (here)' : '') + '</option>').join('') + '</select>';
    const head = '<h3>' + I('here') + ' ' + esc(mapName(map)) + '</h3><div class="kd-maps">' + sel + '</div>';
    const dia = '<div class="kd-map">' + diagram(s, map, list, pinsL, V.form && V.form.map === map ? V.form : null) + '</div><p class="muted small">The shapes: ? unexplained · barred · ◇ noted · ✓ solved · dashed arrow opened · eye a view; pins are pale: a house (return here), ? in a square (question), a triangle (view), arrows (passage). Blue outlines are ways out.</p>';
    const details = '<h4 class="kd-h">' + I('look') + ' Known details <span class="count">' + list.length + '</span></h4>' + listBlock(list);
    const status = V.status ? '<p class="sr" role="status">' + esc(V.status) + '</p>' : '';
    if (two) { A.innerHTML = head + dia; B.innerHTML = details + pinBlock(s, map, pinsL) + status; }
    else A.innerHTML = head + dia + details + pinBlock(s, map, pinsL) + status;
    const root = two ? [A, B] : [A];
    for (const el of root) {
      el.onclick = (e) => click(e, s, api);
      el.oninput = (e) => {
        const t = e.target.closest('[data-k="note"]');
        if (!t || !V.form) return;
        V.form.note = t.value;
        const n = RB.cases.graphemes(t.value).length, cnt = t.parentNode.querySelector('.cs-count');
        if (cnt) { cnt.textContent = n + ' / ' + KN.NOTE_MAX + (n > KN.NOTE_MAX ? ' — only the first ' + KN.NOTE_MAX + ' characters will be kept' : ''); cnt.classList.toggle('over', n > KN.NOTE_MAX); }
      };
      el.onchange = (e) => {
        const m = e.target.closest('[data-k="map"]');
        if (m) { V.map = m.value; V.form = null; V.focus = '#kd-map'; api.render(); return; }
        const r = e.target.closest('input[name="kd-type"]');
        if (r && V.form) V.form.type = r.value;
      };
    }
    if (V.focus) { const f = V.focus; V.focus = null; requestAnimationFrame(() => { const el = (two ? B.querySelector(f) : null) || A.querySelector(f); if (el) el.focus({ preventScroll: true }); }); }
  }
  function click(e, s, api) {
    const svg = e.target.closest('svg.kd-svg');
    if (svg && V.form && V.form.map === V.map) {
      const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
      V.form.x = Math.max(0, Math.min(vb.width / 10 - 1, Math.floor((e.clientX - r.left) / r.width * vb.width / 10)));
      V.form.y = Math.max(0, Math.min(vb.height / 10 - 1, Math.floor((e.clientY - r.top) / r.height * vb.height / 10)));
      api.render(); return;
    }
    const b = e.target.closest('[data-k]');
    if (!b || b.disabled || b.tagName === 'SELECT' || b.tagName === 'TEXTAREA') return;
    const map = V.map;
    switch (b.dataset.k) {
      case 'new': {
        const here = s.map === map;
        const m = RB.maps.compile(map);
        V.form = { map, id: null, type: 'return', note: '', x: here ? s.x : Math.floor(m.w / 2), y: here ? s.y : Math.floor(m.h / 2) };
        V.focus = 'input[name="kd-type"][value="return"]'; api.render(); return;
      }
      case 'edit': {
        const p = KN.pins(s, map).find((q) => q.id === b.dataset.pin);
        if (p) V.form = { map, id: p.id, type: p.type, note: p.note, x: p.x, y: p.y };
        V.focus = '#kd-note'; api.render(); return;
      }
      case 'remove': {
        const p = KN.pins(s, map).find((q) => q.id === b.dataset.pin);
        RB.ui.confirm('Remove this pin' + (p && p.note ? ' ("' + p.note.slice(0, 40) + (p.note.length > 40 ? '…' : '') + '")' : '') + '? Its note goes with it.', ['Remove', 'Keep it']).then((r) => {
          if (r === 0) { KN.removePin(s, map, b.dataset.pin); V.status = 'Pin removed.'; }
          V.focus = '[data-k="new"]'; api.render();
        });
        return;
      }
      case 'mv': {
        if (!V.form) return;
        const [dx, dy] = b.dataset.d.split(',').map(Number), m = RB.maps.compile(map);
        V.form.x = Math.max(0, Math.min(m.w - 1, V.form.x + dx)); V.form.y = Math.max(0, Math.min(m.h - 1, V.form.y + dy));
        V.focus = '[data-k="mv"][data-d="' + b.dataset.d + '"]'; api.render(); return;
      }
      case 'cancel': V.form = null; V.focus = '[data-k="new"]'; api.render(); return;
      case 'save': {
        const f = V.form;
        const res = f.id ? KN.editPin(s, map, f.id, f) : KN.addPin(s, map, f);
        V.status = res.ok ? (f.id ? 'Pin saved.' : 'Pin placed.') + (res.cut ? ' The note was shortened to ' + KN.NOTE_MAX + ' characters.' : '') : res.reason === 'full' ? 'This map is full.' : 'Not saved.';
        if (res.ok) { V.form = null; RB.audio && RB.audio.sfx('confirm'); }
        V.focus = '[data-k="new"]'; api.render(); return;
      }
    }
  }
  RB.ui.menu.addPage('map', { id: 'known', en: 'Known details', icon: 'here', render });
  return { render, V };
})();
