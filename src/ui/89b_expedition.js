/* Expeditions on screen (expansion P07; plan 04_DUNGEONS.md D1–D4, D10; the rules in src/engine/98_expedition.js):
 *   - the entrance preview card (D4): what is practised, the size, the rules in words, never the solutions; Go down
 *     or Not now. What the card says is read from the same definition the expedition then runs by.
 *   - a chip at the top of the map while on an expedition: carried resolve (persistent condition, D2), the floor.
 *   - the Ledger's Map › Expedition page: each floor seen (map knowledge, kept across restarts), the stations with
 *     their uses left, the shortcuts open or not, where you are (D10: "the auto-map marks stations with their
 *     remaining uses").
 *   - the scenes' hooks: xp_preview <id> (_res 1 to go down), xp_enter <id>, xp_station <station>, xp_shortcut
 *     <exp> <id>, xp_leave (climb out: the next visit starts fresh). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.expedition = (function () {
  'use strict';
  const esc = RB.util.esc;
  const X = () => RB.expedition;
  const S = () => RB.game.s;
  const I = (n) => (RB.ui.folio ? RB.ui.folio.icon(n) : '');
  const KIND_NAME = { bench: 'Rest bench', spring: 'Spring', shelter: 'Shelter', lamp: 'Lamp' };
  const KIND_ICON = { bench: 'resolve', spring: 'wave', shelter: 'here', lamp: 'lantern' };

  // ---- the preview card ----------------------------------------------------------------------------------------
  function cardHtml(id, s) {
    const pv = X().preview(id), d = X().get(id);
    const done = s && s.flags && s.flags['xpk_' + id + '_done'];
    const open = Object.keys(d.shortcuts).filter((k) => X().shortcutOpen(s, id, k)).length;
    const row = (label, html) => '<div class="xp-row"><div class="xp-k">' + esc(label) + '</div><div class="xp-v">' + html + '</div></div>';
    return '<div class="xp-card">' +
      '<p class="xp-kind">' + esc(d.kind === 'side' ? 'A side expedition: entirely optional' : d.kind === 'story' ? 'Part of the story' : 'An expedition') + '</p>' +
      row('Language', (pv.language.jp ? '<span class="jp">' + RB.ui.jhtml(pv.language.jp) + '</span> ' : '') + esc(pv.language.en)) +
      row('Size', esc(pv.size.en) + ' ' + esc(d.floors.length + ' floor' + (d.floors.length === 1 ? '' : 's') + ': ') + d.floors.map((f) => (f.name ? RB.ui.jhtml(f.name.jp) + ' <span class="en">' + esc(f.name.en) + '</span>' : esc(f.id))).join(', ')) +
      (pv.suggested ? row('Suggested', esc(pv.suggested.en)) : '') +
      row('Rules', '<ul class="xp-rules">' + pv.rules.map((r) => '<li>' + esc(r.en) + '</li>').join('') + '</ul>') +
      (done || open ? '<p class="note-slip">' + I('done') + ' ' + esc((done ? 'You have been through to the end before. ' : '') + (open ? open + ' shortcut' + (open === 1 ? '' : 's') + ' open from earlier visits.' : '')) + '</p>' : '') +
      '</div>';
  }
  let PV = null;
  function preview(id) {
    return new Promise((resolve) => {
      const d = X().get(id);
      if (!d) { resolve(false); return; }
      const finish = (ok) => { if (!PV) return; RB.ui.popLayer(PV.layer); PV = null; resolve(ok); };
      const fr = RB.ui.folio.frame({ cls: 'xp-folio', onClose: () => finish(false), closeLabel: 'Not now', closeIcon: 'back' });
      fr.setTitle(RB.ui.label(d.title.jp, d.title.en), 'Before you go down');
      fr.box.innerHTML = '<div class="leaf xp-leaf" tabindex="-1">' + cardHtml(id, S()) +
        '<div class="sg-acts"><button type="button" class="pbtn primary" data-a="go">' + I('next') + '<span>Go down</span></button><button type="button" class="pbtn autofocus" data-a="no">Not now</button></div></div>';
      fr.box.addEventListener('click', (e) => { const b = e.target.closest('[data-a]'); if (b) finish(b.dataset.a === 'go'); });
      PV = { layer: { el: fr.scrim, name: 'xp-preview', onCancel: () => finish(false) } };
      RB.ui.pushLayer(PV.layer);
    });
  }

  // ---- the chip: carried resolve while on an expedition ------------------------------------------------------------
  let chip = null, last = '';
  function ensureChip() {
    if (chip || typeof document === 'undefined' || !RB.ui.root) return chip;
    chip = RB.ui.el('button', 'hbtn atlas-chip xp-chip hidden');
    chip.setAttribute('aria-label', 'Expedition: floors, rests and shortcuts');
    chip.onclick = () => { if (RB.game.mode() === 'world') RB.ui.menu.open('expedition'); };
    RB.ui.root.appendChild(chip);
    return chip;
  }
  function sync() {
    const s = S();
    const e = s && RB.game.G && RB.game.G.playing ? X().of(s) : null;
    const show = !!(e && RB.game.mode() !== 'combat' && RB.game.mode() !== 'title');
    if (!show) { if (chip) chip.classList.add('hidden'); last = ''; return; }
    const c = ensureChip();
    if (!c) return;
    const f = X().floorOf(s);
    const who = s.comp && RB.content.chars[s.comp] ? RB.content.chars[s.comp].name.en : null;
    const html = I('map') + '<span class="l">' + esc(f && f.name ? f.name.en : X().get(e.id).title.en) + '</span>' +
      (X().persistent(s) ? '<span class="st">' + I('resolve') + esc('You ' + s.resolve.pc + '/' + s.resolve.max) + '</span>' + (who ? '<span class="st">' + esc(who + ' ' + s.resolve.comp + '/' + s.resolve.max) + '</span>' : '') : '');
    if (html !== last) { c.innerHTML = html; last = html; }
    c.classList.remove('hidden');
  }
  if (typeof setInterval !== 'undefined' && typeof document !== 'undefined') setInterval(sync, 400);

  // ---- the Map page: the floors seen, stations, shortcuts -------------------------------------------------------
  function floorSvg(d, f, s, here) {
    const m = RB.content.maps[f.map];
    if (!m) return '';
    const rows = m.terrain, H = rows.length, W = rows[0].length, c = 6;
    const T = RB.tiles.T, L = RB.tiles.LEGEND;
    let out = '<svg class="xp-plan" viewBox="0 0 ' + W * c + ' ' + H * c + '" role="img" aria-label="' + esc('Plan of ' + (f.name ? f.name.en : f.id)) + '">';
    out += '<rect width="' + W * c + '" height="' + H * c + '" class="xp-rock"/>';
    for (let y = 0; y < H; y++) {
      let x = 0;
      while (x < W) {
        const ch = rows[y][x], t = (L[ch] || {}).tile, td = T[t] || {};
        const cls = td.walk === false ? (td.water ? 'xp-water' : null) : td.water ? 'xp-wet' : 'xp-ground';
        let x2 = x + 1;
        while (x2 < W && rows[y][x2] === ch) x2++;
        if (cls) out += '<rect x="' + x * c + '" y="' + y * c + '" width="' + (x2 - x) * c + '" height="' + c + '" class="' + cls + '"/>';
        x = x2;
      }
    }
    // the ways between floors and out
    for (const ex of m.exits || []) {
      if (ex.if && !RB.state.test(s, ex.if)) continue;
      out += '<rect x="' + (ex.x * c + 1) + '" y="' + (ex.y * c + 1) + '" width="' + (c - 2) + '" height="' + (c - 2) + '" class="xp-exit"/>';
    }
    // stations, with their uses left
    for (const k in d.stations) {
      const st = d.stations[k];
      if (st.map !== f.map) continue;
      const ready = !st.requires || RB.state.test(s, st.requires);
      const left = X().stationLeft(s, k);
      out += '<circle cx="' + (st.x * c + c / 2) + '" cy="' + (st.y * c + c / 2) + '" r="' + (c * 0.75) + '" class="xp-st ' + (ready && left > 0 ? 'on' : 'off') + '"/>' +
        '<text x="' + (st.x * c + c / 2) + '" y="' + (st.y * c - 2) + '" class="xp-uses" text-anchor="middle">' + (!ready ? '?' : left === Infinity ? '∞' : left) + '</text>';
    }
    for (const k in d.shortcuts) {
      const sc = d.shortcuts[k];
      for (const end of [sc, sc.to].filter(Boolean)) {
        if (end.map !== f.map || end.x == null) continue;
        out += '<rect x="' + (end.x * c) + '" y="' + (end.y * c) + '" width="' + c + '" height="' + c + '" class="xp-sc ' + (X().shortcutOpen(s, d.id, k) ? 'on' : 'off') + '"/>';
      }
    }
    if (here) out += '<circle cx="' + (s.x * c + c / 2) + '" cy="' + (s.y * c + c / 2) + '" r="' + (c * 0.9) + '" class="xp-here"/>';
    return out + '</svg>';
  }
  function pageHtml(s) {
    const e = X().of(s);
    if (!e) return '<p class="muted">You are not on an expedition.</p>';
    const d = X().get(e.id);
    let h = '<h3>' + I('map') + ' ' + RB.ui.jhtml(d.title.jp) + ' <span class="en">' + esc(d.title.en) + '</span></h3>';
    if (X().persistent(s)) h += '<p class="note-slip">' + I('resolve') + ' ' + esc('Resolve carries between encounters here: you ' + s.resolve.pc + '/' + s.resolve.max + (s.comp && RB.content.chars[s.comp] ? ', ' + RB.content.chars[s.comp].name.en + ' ' + s.resolve.comp + '/' + s.resolve.max : '') + '. What mistakes cost always comes back after each encounter.') + '</p>';
    d.floors.forEach((f, i) => {
      const seen = X().floorSeen(s, d.id, f.id), here = i === e.floor && s.map === f.map;
      h += '<div class="xp-floor"><h4>' + (f.name ? RB.ui.jhtml(f.name.jp) + ' <span class="en">' + esc(f.name.en) + '</span>' : esc(f.id)) + (here ? ' <span class="kind">you are here</span>' : '') + '</h4>' +
        (seen ? floorSvg(d, f, s, here) : '<p class="muted small">Not seen yet.</p>') + '</div>';
    });
    const st = Object.keys(d.stations).map((k) => {
      const x = d.stations[k], ready = !x.requires || RB.state.test(s, x.requires), left = X().stationLeft(s, k);
      const fl = d.floors.find((f) => f.map === x.map);
      return '<li class="entry"><span class="mark">' + I(KIND_ICON[x.kind] || 'resolve') + '</span><div><div class="t">' + esc(KIND_NAME[x.kind] || x.kind) + (fl && fl.name ? ' <span class="muted small">' + esc(fl.name.en) + '</span>' : '') + '</div><div class="small">' + esc(!ready ? 'Not ready yet: something here can be mended.' : left === Infinity ? 'As often as you like.' : left > 0 ? left + ' use' + (left === 1 ? '' : 's') + ' left this expedition.' : 'Used up this expedition.') + '</div></div></li>';
    }).join('');
    const sc = Object.keys(d.shortcuts).map((k) => '<li class="entry"><span class="mark">' + I('follow') + '</span><div><div class="t">' + esc('Shortcut') + '</div><div class="small">' + esc(X().shortcutOpen(s, d.id, k) ? 'Open: it stays open on every visit.' : 'Not opened yet: it opens from the far side.') + '</div></div></li>').join('');
    h += '<h3>' + I('resolve') + ' Places to rest</h3><ul class="entries">' + st + '</ul>' + (sc ? '<h3>' + I('follow') + ' Shortcuts</h3><ul class="entries">' + sc + '</ul>' : '') +
      '<p class="muted small">' + esc('Key: pale floor, blue water, dashed squares the ways between floors, circles the places to rest (the number: uses left), the ringed dot: you.') + '</p>';
    return h;
  }
  if (RB.ui.menu && RB.ui.menu.addPage) {
    RB.ui.menu.addPage('map', {
      id: 'expedition', en: 'Expedition', icon: 'map',
      available: (s) => X().active(s),
      render(A) { A.innerHTML = pageHtml(S()); },
    });
  }

  // ---- the hooks ---------------------------------------------------------------------------------------------------
  RB.hooks = RB.hooks || {};
  RB.hooks.xp_preview = async (a) => { const s = S(); const ok = await preview(a && a[0]); s.vars._res = ok ? 1 : 0; };
  RB.hooks.xp_enter = async (a) => {
    const s = S(), d = X().get(a && a[0]);
    if (!d) return;
    X().enter(s, d.id);
    const f = d.floors[0];
    await RB.game.transition(f.map, f.entry.x, f.entry.y, f.entry.dir || 'down', { inScript: true });
    await RB.save.autosave('auto');
  };
  const NOTE = {
    bench: (r) => 'You sit on the bench a while: resolve +' + Math.max(r.gave.pc, r.gave.comp) + '.',
    spring: () => 'The cold water clears your heads: resolve full again.',
    lamp: (r) => 'You rest in the lamp\'s light: resolve +' + Math.max(r.gave.pc, r.gave.comp) + '.',
    shelter: () => 'A dry corner: whatever clung to you is gone.',
  };
  RB.hooks.xp_station = async (a) => {
    const s = S();
    const r = X().useStation(s, a && a[0]);
    s.vars._res = r.ok ? 1 : 0;
    if (!r.ok) { RB.ui.notice(r.why, 'info'); return; }
    RB.audio && RB.audio.sfx('heal');
    RB.ui.notice((NOTE[r.kind] || NOTE.bench)(r) + ' ' + (r.left === Infinity ? '' : r.left > 0 ? r.left + ' more here this expedition.' : 'That was the last rest here this expedition.'), 'info');
  };
  RB.hooks.xp_shortcut = async (a) => {
    const s = S();
    if (X().openShortcut(s, a && a[0], a && a[1])) RB.ui.notice('A shortcut is open: it stays open on every visit.', 'info');
  };
  RB.hooks.xp_leave = async () => {
    const s = S(), e = X().of(s);
    if (!e) return;
    const d = X().get(e.id);
    X().leave(s);
    if (d.exit) {
      s.checkpoint = { map: d.exit.map, x: d.exit.x, y: d.exit.y, dir: d.exit.dir || 'down' };
      await RB.game.transition(d.exit.map, d.exit.x, d.exit.y, d.exit.dir || 'down', { inScript: true });
      await RB.save.autosave('auto');
    }
  };
  return { preview, cardHtml, pageHtml, floorSvg, sync };
})();
