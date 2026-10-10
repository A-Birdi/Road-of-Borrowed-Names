/* Sailing on screen (expansion P11c; the rules in src/engine/72v_sail.js):
 *   - the sea chart at the boat (`!hook sail_chart <port>`): the ports reached, drawn where they lie, the boat's name
 *     and anything to mend; choose where, then how: sail yourself, or let the crew sail (each voyage chooses again);
 *   - at sea, a strip at the top of the map: the wind (where it comes from, an arrow and a pennant that streams with
 *     it), the sail's three settings (帆を絞る, 帆を半分, 帆を張る; the Q key steps through them), the heading to the
 *     destination, and "Let the crew sail"; the strip says, calmly, when the sail would draw better set another way
 *     or something is waiting to be mended, never a warning;
 *   - the boat under the traveller and the companion (RB.sailDraw.push, called by src/engine/60_render.js);
 *   - the travel log, a section of the travel volume (Journey › Travel volume): an entry per voyage. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.ui = RB.ui || {};

RB.ui.sail = (function () {
  'use strict';
  const esc = (s) => RB.util.esc(String(s == null ? '' : s));
  const J = (t) => RB.ui.jhtml(t || '');
  const I = (n) => (RB.ui.folio ? RB.ui.folio.icon(n) : '');
  const S = () => RB.game && RB.game.s;
  const SL = () => RB.sail;
  const ARROW = { up: '↓', down: '↑', left: '→', right: '←' }; // the wind blows away from where it comes from
  const PT_EN = { run: 'the wind behind you', reach: 'the wind on the beam', beat: 'the wind ahead' };
  const DMG_EN = { sail: 'the torn sail', line: 'the frayed line', rudder: 'the loose rudder pin', hatch: 'the leaking hatch' };
  const portName = (id) => { const p = SL().port(id); return p ? p.name : { jp: id, en: id }; };

  // ---- the chart ---------------------------------------------------------------------------------------------------
  function chartSvg(s, from, list) {
    const P = RB.content.places, pts = SL().portIds().map((id) => ({ id, pos: (P[SL().port(id).place] || {}).pos })).filter((x) => x.pos);
    if (!pts.length) return '';
    const xs = pts.map((p) => p.pos[0]), ys = pts.map((p) => p.pos[1]);
    const x0 = Math.min.apply(null, xs) - 30, y0 = Math.min.apply(null, ys) - 30, w = Math.max.apply(null, xs) - x0 + 30, h = Math.max.apply(null, ys) - y0 + 30;
    let g = '<svg class="sea-chart" viewBox="' + x0 + ' ' + y0 + ' ' + w + ' ' + h + '" role="img" aria-label="The sea chart: the ports you have reached">';
    g += '<rect x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + h + '" class="sea-water"/>';
    for (const p of pts) {
      const can = p.id === from || list.indexOf(p.id) >= 0;
      if (!can) continue;
      if (p.id !== from) { const f = pts.find((q) => q.id === from); if (f) g += '<line x1="' + f.pos[0] + '" y1="' + f.pos[1] + '" x2="' + p.pos[0] + '" y2="' + p.pos[1] + '" class="sea-route"/>'; }
    }
    for (const p of pts) {
      const here = p.id === from, can = list.indexOf(p.id) >= 0;
      if (!here && !can) continue;
      g += '<circle cx="' + p.pos[0] + '" cy="' + p.pos[1] + '" r="' + (here ? 7 : 5) + '" class="sea-port' + (here ? ' here' : '') + '"/>' +
        '<text x="' + p.pos[0] + '" y="' + (p.pos[1] - 10) + '" text-anchor="middle" class="sea-name">' + esc(portName(p.id).en) + '</text>';
    }
    return g + '</svg>';
  }
  function chart(s, from) {
    if (RB.ui.dialogue) RB.ui.dialogue.hide();
    return new Promise((resolve) => {
      const list = SL().destinations(s, from), q = SL().of(s);
      let to = null, done = false;
      const fr = RB.ui.folio.frame({ cls: 'sea-folio', onClose: () => finish(null), closeLabel: 'Not now', closeIcon: 'back' });
      const name = SL().boatName(s).en;
      fr.setTitle(RB.ui.label('{海図|かいず}', 'The sea chart'), name ? 'The ' + name + ', at ' + portName(from).en : 'At ' + portName(from).en);
      const layer = { el: fr.scrim, name: 'sea-chart', onCancel: () => finish(null) };
      function finish(r) { if (done) return; done = true; RB.ui.popLayer(layer); resolve(r); }
      function render() {
        let h = '<div class="leaf sea-leaf" tabindex="-1">' + chartSvg(s, from, list);
        if (q.dmg) h += '<p class="note-slip">' + I('repair') + ' ' + esc('Something to mend: ' + DMG_EN[q.dmg] + '. She sails a little slower until then; any port\'s yard will see to it, or you can mend it at sea.') + '</p>';
        if (!list.length) h += '<p class="muted">There is nowhere else the boat can go yet: ports join the chart once you have been there.</p>';
        else if (!to) {
          h += '<h3>Where to?</h3><div class="sea-dests">' + list.map((id) => '<button type="button" class="pbtn sea-dest" data-to="' + esc(id) + '">' + J(portName(id).jp) + ' <span class="en">' + esc(portName(id).en) + '</span><span class="muted small"> ' + esc(SL().distance(from, id) > 40 ? 'a long day\'s sail' : SL().distance(from, id) > 22 ? 'a morning\'s sail' : 'a short hop') + '</span></button>').join('') + '</div>';
        } else {
          h += '<h3>' + J(portName(to).jp) + ' <span class="en">' + esc(portName(to).en) + '</span></h3><p>How would you like to go?</p><div class="sea-modes">' +
            '<button type="button" class="pbtn primary sea-mode" data-mode="self">' + I('wave') + '<span>Sail her yourself</span><span class="muted small">Steer, and set the sail to the wind. Take as long as you like.</span></button>' +
            '<button type="button" class="pbtn sea-mode" data-mode="crew">' + I('next') + '<span>Let the crew sail</span><span class="muted small">Straight to ' + esc(portName(to).en) + '. Anything that happens on the way still happens.</span></button>' +
            '</div><p><button type="button" class="pbtn small sea-back">Somewhere else</button></p>';
        }
        fr.box.innerHTML = h + '</div>';
        const f = fr.box.querySelector('.sea-dest, .sea-mode');
        if (f) setTimeout(() => f.focus({ preventScroll: true }), 0);
      }
      fr.box.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.classList.contains('sea-dest')) { to = b.dataset.to; render(); return; }
        if (b.classList.contains('sea-back')) { to = null; render(); return; }
        if (b.classList.contains('sea-mode')) finish({ to, mode: b.dataset.mode });
      });
      RB.ui.pushLayer(layer);
      render();
    });
  }

  // ---- the strip at sea ------------------------------------------------------------------------------------------
  let strip = null, last = '';
  function ensure() {
    if (strip || typeof document === 'undefined' || !RB.ui.root) return strip;
    strip = RB.ui.el('div', 'sea-strip hidden');
    strip.setAttribute('role', 'group');
    strip.setAttribute('aria-label', 'At sea: the wind and the sail');
    strip.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b || RB.game.mode() !== 'world') return;
      if (b.dataset.trim != null) { SL().setTrim(S(), +b.dataset.trim); sync(true); }
      if (b.dataset.a === 'crew') { RB.script.run('sea.crew_take'); }
    });
    RB.ui.root.appendChild(strip);
    return strip;
  }
  function heading(s) {
    const W = RB.world.W, v = SL().of(s).voyage, P = v && SL().port(v.to);
    if (!P || !W.player) return '';
    const dx = P.sea.x - W.player.x, dy = P.sea.y - W.player.y;
    if (Math.abs(dx) + Math.abs(dy) < 3) return 'close by';
    const ns = dy < -2 ? 'north' : dy > 2 ? 'south' : '', ew = dx < -2 ? 'west' : dx > 2 ? 'east' : '';
    return (ns + (ns && ew ? '-' : '') + ew) || 'close by';
  }
  function sync(force) {
    const s = S();
    const W = RB.world && RB.world.W;
    const show = !!(s && RB.game.G && RB.game.G.playing && W && W.map && SL() && SL().onSea(W.map) && SL().active(s) && RB.game.mode() !== 'title');
    if (!show) { if (strip) strip.classList.add('hidden'); last = ''; return; }
    const el = ensure();
    if (!el) return;
    const v = SL().of(s).voyage, st = SL().sailState(s, W.player.dir);
    const trims = SL().TRIMS.map((t) => '<button type="button" class="pbtn small sea-trim" data-trim="' + t.id + '" aria-pressed="' + (st.trim === t.id) + '">' + J(t.jp) + '<span class="en">' + esc(t.en) + '</span></button>').join('');
    const hint = st.good ? 'The sail draws well with ' + PT_EN[st.point] + '.' : 'With ' + PT_EN[st.point] + ', she would go better ' + SL().TRIMS[st.best].en.toLowerCase() + '.';
    const html = '<div class="sea-wind" title="' + esc('Wind from the ' + st.windName.en) + '"><span class="sea-arrow" aria-hidden="true">' + ARROW[st.wind] + '</span>' +
      '<span class="sea-pennant ' + (st.good ? 'good' : 'off') + '" aria-hidden="true"></span><span>' + J(st.windName.jp + ' の {風|かぜ}') + ' <span class="en">wind from the ' + esc(st.windName.en) + '</span></span></div>' +
      '<div class="sea-trims" role="group" aria-label="The sail (Q)">' + trims + '</div>' +
      '<p class="sea-hint" aria-live="polite">' + esc(hint + (st.dmg ? ' ' + DMG_EN[st.dmg][0].toUpperCase() + DMG_EN[st.dmg].slice(1) + ' can wait for port.' : '')) + '</p>' +
      '<div class="sea-dest-line">' + I('map') + '<span>' + esc('To ' + portName(v.to).en + ': ' + heading(s)) + '</span><button type="button" class="pbtn small" data-a="crew">Let the crew sail</button></div>';
    if (force || html !== last) { el.innerHTML = html; last = html; }
    el.classList.remove('hidden');
  }
  if (typeof setInterval !== 'undefined' && typeof document !== 'undefined') setInterval(sync, 300);
  function cycleTrim() {
    const s = S(), W = RB.world && RB.world.W;
    if (!s || !SL() || !SL().active(s) || !SL().onSea(W.map)) return;
    const q = SL().of(s);
    SL().setTrim(s, ((q.trim | 0) + 1) % 3);
    sync(true);
  }

  // ---- the travel log (a section of the travel volume) -----------------------------------------------------------
  function logHtml(s) {
    const q = s && s.sea;
    if (!q || !Array.isArray(q.log) || !q.log.length) return '';
    const how = { self: 'You sailed her.', crew: 'The crew sailed.', both: 'You sailed, then the crew took over.' };
    const name = SL().boatName(s).en;
    let h = '<h4 class="rb-fam">' + J('{航海|こうかい} {日誌|にっし}') + ' <span class="en">The travel log' + (name ? ': the ' + esc(name) : '') + '</span></h4><ol class="sea-log">';
    for (const e of q.log.slice().reverse()) {
      const sit = (e.sits || []).map((id) => { const d = (RB.content.seaSituations || {})[id]; return d && d.log ? d.log.en : null; }).filter(Boolean);
      h += '<li class="sea-entry"><div class="t">' + esc('Voyage ' + e.n + ': ' + portName(e.from).en + ' to ' + portName(e.to).en) + '</div>' +
        '<div class="muted small">' + esc(how[e.mode] || '') + ' ' + esc('Wind from the ' + ((SL().WIND_NAME[e.wind] || {}).en || '?') + '.') + '</div>' +
        (sit.length ? '<ul class="sea-sights">' + sit.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') +
        ((e.words || []).length ? '<div class="small">' + esc('Words: ') + e.words.map((w) => J(w)).join('、') + '</div>' : '') +
        ((e.people || []).length ? '<div class="small">' + esc('People: ' + e.people.join(', ')) + '</div>' : '') + '</li>';
    }
    return h + '</ol>';
  }
  // ---- naming the boat (the yards; A Licence for the Open Sea) --------------------------------------------------------
  // A sheet of kana tiles: the name is put together a kana at a time (one to five, hiragana), shown painted on the
  // bow with 丸 after it, read aloud in romaji; the sign-writers' rules are checked as it grows. Resolves with the
  // name, or null when put off ("Not yet"). `keep` offers the hull's old name.
  const KANA_ROWS = ['あいうえお', 'かきくけこ', 'さしすせそ', 'たちつてと', 'なにぬねの', 'はひふへほ', 'まみむめも', 'や・ゆ・よ', 'らりるれろ', 'わ・を・ん',
    'がぎぐげご', 'ざじずぜぞ', 'だぢづでど', 'ばびぶべぼ', 'ぱぴぷぺぽ', 'ゃゅょっ・'];
  function nameBoat(s, o) {
    o = o || {};
    if (RB.ui.dialogue) RB.ui.dialogue.hide(); // the line before it (and its Keep tab) give way to the sheet
    return new Promise((resolve) => {
      let name = Array.from(o.current || ''), done = false, err = null;
      const fr = RB.ui.folio.frame({ cls: 'sea-folio sea-namefolio', onClose: () => finish(null), closeLabel: 'Not yet', closeIcon: 'back' });
      fr.setTitle(RB.ui.label('{船|ふね} の {名前|なまえ}', 'Naming the boat'), 'In kana, one to five; the sign-writers add 丸');
      const layer = { el: fr.scrim, name: 'sea-name', onCancel: () => finish(null) };
      function finish(r) { if (done) return; done = true; RB.ui.popLayer(layer); resolve(r); }
      const ro = (k) => (RB.kana && RB.kana.romaji ? RB.kana.romaji(k) : k);
      function render(focusSel) {
        const k = name.join(''), prob = k ? SL().nameProblem(k) : null;
        let h = '<div class="leaf sea-leaf sea-name" tabindex="-1">';
        h += '<div class="sea-bow" aria-live="polite"><span class="sea-paint" lang="ja">' + (k ? esc(k) : '<span class="muted">…</span>') + '<span class="maru">丸</span></span>' +
          '<span class="en">' + (k ? esc(ro(k).charAt(0).toUpperCase() + ro(k).slice(1) + '-maru') : 'No name yet') + '</span></div>';
        if (err || prob) h += '<p class="sea-name-err" role="alert">' + J((err || prob).jp) + ' <span class="en">' + esc((err || prob).en) + '</span></p>';
        h += '<div class="sea-kana" role="group" aria-label="Kana">' + KANA_ROWS.map((row) => '<div class="sea-kana-row">' + Array.from(row).map((c) => c === '・' ? '<span class="sea-kana-gap"></span>' :
          '<button type="button" class="pbtn sea-k" data-k="' + c + '" lang="ja" aria-label="' + c + ' (' + esc(ro(c)) + ')"' + (name.length >= 5 ? ' disabled' : '') + '>' + c + '</button>').join('') + '</div>').join('') + '</div>';
        h += '<div class="sea-name-foot"><button type="button" class="pbtn small" data-a="back"' + (name.length ? '' : ' disabled') + '>' + I('back') + ' Take back a kana</button>' +
          '<button type="button" class="pbtn small" data-a="clear"' + (name.length ? '' : ' disabled') + '>Start again</button>' +
          (o.keep ? '<button type="button" class="pbtn small" data-a="keep" lang="ja">Keep ' + esc(o.keep) + '</button>' : '') +
          '<button type="button" class="pbtn primary" data-a="paint"' + (k && !prob ? '' : ' disabled') + '>' + I('brush') + ' Paint this name</button></div>';
        fr.box.innerHTML = h + '</div>';
        const f = fr.box.querySelector(focusSel || '.sea-k');
        if (f) setTimeout(() => f.focus({ preventScroll: true }), 0);
      }
      fr.box.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b || b.disabled) return;
        err = null;
        if (b.dataset.k) { if (name.length < 5) name.push(b.dataset.k); render('[data-k="' + b.dataset.k + '"]'); return; }
        const a = b.dataset.a;
        if (a === 'back') { name.pop(); render('[data-a="back"]'); return; }
        if (a === 'clear') { name = []; render(); return; }
        if (a === 'keep') { finish(o.keep); return; }
        if (a === 'paint') { const k = name.join(''), p = SL().nameProblem(k); if (p) { err = p; render('[data-a="paint"]'); return; } finish(k); }
      });
      RB.ui.pushLayer(layer);
      render();
    });
  }

  return { chart, sync, cycleTrim, logHtml, nameBoat };
})();

// ---- the boat, drawn under the traveller and the companion at sea ------------------------------------------------
RB.sailDraw = (function () {
  'use strict';
  const WOOD = ['#5e4430', '#7a5a3e', '#9a7650', '#b8946a'], CANVAS = ['#d8ccb2', '#ece2ca', '#faf4e4'], INK = '#2a2024';
  function push(list, c, ax, ay, t) {
    const W = RB.world.W, s = RB.game.s, p = W.player;
    if (!p || !RB.sail) return;
    const TS = RB.tiles.TS, A = ax((p.fx + 1) * TS) - ax(p.fx * TS); // one tile at art resolution
    const still = RB.game.reducedMotion && RB.game.reducedMotion();
    // the hull lies from the companion (aft) to the traveller (forward), or a tile behind the traveller alone
    const D = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[p.dir] || [0, -1];
    const cmp = W.comp && Math.abs(W.comp.fx - p.fx) + Math.abs(W.comp.fy - p.fy) <= 1.2 ? W.comp : null;
    const aft = cmp ? { x: cmp.fx, y: cmp.fy } : { x: p.fx - D[0], y: p.fy - D[1] };
    const horiz = Math.abs(p.fx - aft.x) >= Math.abs(p.fy - aft.y) && (cmp ? Math.abs(p.fx - aft.x) > 0.3 : D[0] !== 0);
    const cx = (p.fx + aft.x) / 2, cy = (p.fy + aft.y) / 2;
    const X = (x) => ax(x * TS) + A / 2, Y = (y) => ay(y * TS) + A * 0.78;
    const mx = X(cx), my = Y(cy);
    const L = A * 1.25, Wd = A * 0.46; // half-length, half-beam
    const bob = still ? 0 : Math.sin(t / 420) * A * 0.03;
    // the traveller and companion stand still in the boat
    p.frame = 0; if (cmp) cmp.frame = 0;
    const hull = (g, inset, col) => {
      g.fillStyle = col;
      g.beginPath();
      if (horiz) {
        const fw = D[0] >= 0 ? 1 : -1; // the bow points the way the traveller faces
        g.moveTo(mx - fw * (L - inset), my - Wd + inset + bob);
        g.lineTo(mx + fw * (L * 0.62), my - Wd + inset + bob);
        g.quadraticCurveTo(mx + fw * (L + A * 0.25 - inset), my + bob, mx + fw * (L * 0.62), my + Wd - inset + bob);
        g.lineTo(mx - fw * (L - inset), my + Wd - inset + bob);
      } else {
        const fw = D[1] >= 0 ? 1 : -1;
        g.moveTo(mx - Wd + inset, my - fw * (L - inset) + bob);
        g.lineTo(mx - Wd + inset, my + fw * (L * 0.62) + bob);
        g.quadraticCurveTo(mx, my + fw * (L + A * 0.25 - inset) + bob, mx + Wd - inset, my + fw * (L * 0.62) + bob);
        g.lineTo(mx + Wd - inset, my - fw * (L - inset) + bob);
      }
      g.closePath();
      g.fill();
    };
    const st = RB.sail.sailState(s, p.dir);
    // under the people: wake, hull, deck, mast and sail
    list.push({ z: Math.min(p.fy, aft.y) * TS + TS - 0.6, draw: () => {
      // a wake and a little foam
      c.fillStyle = 'rgba(240,250,250,0.35)';
      for (let i = 0; i < 3; i++) {
        const k = still ? i : (i + t / 300) % 3;
        c.beginPath();
        c.ellipse(X(aft.x - D[0] * (0.8 + k * 0.5)), Y(aft.y - D[1] * (0.8 + k * 0.5)) + A * 0.1, A * (0.28 - k * 0.06), A * 0.1, 0, 0, Math.PI * 2);
        c.fill();
      }
      c.fillStyle = 'rgba(0,0,0,0.22)';
      c.beginPath(); c.ellipse(mx, my + Wd * 0.7, horiz ? L * 1.05 : Wd * 1.2, horiz ? Wd * 0.6 : L * 0.6, 0, 0, Math.PI * 2); c.fill();
      hull(c, 0, INK);
      hull(c, A * 0.04, WOOD[1]);
      hull(c, A * 0.12, WOOD[3]);
      c.fillStyle = WOOD[2];
      for (let i = -2; i <= 2; i++) {
        if (horiz) c.fillRect(mx - L * 0.7, my + bob + i * Wd * 0.3, L * 1.4, 1);
        else c.fillRect(mx + i * Wd * 0.3, my + bob - L * 0.7, 1, L * 1.4);
      }
    } });
    // the mast stands amidships when she lies east-west; heading north or south it steps to the bow, clear of faces
    const bowY = p.fy + D[1] * 0.55;
    list.push({ z: horiz ? Math.min(p.fy, aft.y) * TS + TS - 0.5 : bowY * TS + TS + 0.05, draw: () => {
      const mx = horiz ? X(cx) : X(p.fx), my = horiz ? Y(cy) : Y(bowY);
      // the mast, amidships, and the sail: sheeted in, half out or full, filled downwind
      const down = { up: [0, 1], down: [0, -1], left: [1, 0], right: [-1, 0] }[st.wind]; // where the wind blows to
      const top = my - A * 1.6 + bob;
      c.fillStyle = WOOD[0];
      c.fillRect(mx - 1.5, top, 3, my - top + bob);
      const full = [0.35, 0.65, 1][st.trim];
      const sw = A * 0.9 * full, sh = A * 1.25;
      const bx = down[0] * sw * 0.35, by = down[1] * A * 0.12;
      c.fillStyle = INK;
      c.beginPath(); c.moveTo(mx, top + 2); c.quadraticCurveTo(mx + sw + bx, top + sh * 0.45 + by, mx + 2, top + sh); c.lineTo(mx - sw * 0.5 + bx * 0.4, top + sh * 0.92 + by); c.closePath(); c.fill();
      c.fillStyle = CANVAS[st.good ? 2 : 1];
      c.beginPath(); c.moveTo(mx + 1, top + 4); c.quadraticCurveTo(mx + sw * 0.9 + bx, top + sh * 0.45 + by, mx + 2, top + sh - 2); c.lineTo(mx - sw * 0.42 + bx * 0.4, top + sh * 0.9 + by); c.closePath(); c.fill();
      if (st.dmg === 'sail') { c.fillStyle = INK; c.fillRect(mx + sw * 0.25, top + sh * 0.4, 2, A * 0.25); }
      // the pennant at the masthead streams downwind
      const wav = still ? 0 : Math.sin(t / 160) * 2;
      c.fillStyle = '#c8404e';
      c.beginPath(); c.moveTo(mx, top); c.lineTo(mx + down[0] * A * 0.45, top + down[1] * A * 0.2 + wav); c.lineTo(mx, top + 4); c.closePath(); c.fill();
    } });
    // over the people's feet: the near gunwale
    list.push({ z: Math.max(p.fy, aft.y) * TS + TS + 0.2, draw: () => {
      c.save();
      c.beginPath();
      if (horiz) c.rect(mx - L * 1.3, my + bob - Wd * 0.05, L * 2.6, Wd * 1.2);
      else c.rect(mx - Wd * 1.2, my + bob + L * 0.15 - (D[1] < 0 ? 0 : L * 0.3), Wd * 2.4, L * 1.2);
      c.clip();
      hull(c, 0, INK);
      hull(c, A * 0.04, WOOD[0]);
      hull(c, A * 0.1, WOOD[1]);
      c.restore();
    } });
  }
  return { push };
})();
