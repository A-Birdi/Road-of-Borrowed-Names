/* Development-only viewer for the animated dialogue portraits (World Idle Life addendum §7; docs/expressive/PORTRAITS.md).
 * Not reachable in normal play: it opens only when the page was opened with ?dev=portraits (or a test or a review
 * page set window.__RB_DEV_PORTRAITS__ = true before the game loaded). It uses the game's own renderer
 * (RB.portraits) and the game's own animation timeline (RB.portraitAnim.timeline, the same frameAt the dialogue
 * plays), so what it shows is what a line shows. Nothing is saved: no campaign starts, settings are not written
 * (sound is muted for this page only), and the title screen underneath gets no keys or clicks.
 *
 *   RB.portraitDev.allowed()   → true only on a dev page
 *   RB.portraitDev.open()      → the full-page viewer (opened automatically on a dev page)
 *   RB.portraitDev.state()     → what is shown (for the browser test)
 *
 * Every display size the game uses is shown at once: the three dialogue layouts (desktop 116 CSS px, a landscape
 * phone 84, a phone 64; src/styles/50_play.css) at the common device pixel ratios, each fitted by the game's own
 * RB.portraitAnim.fitSize and drawn at real device pixels, so an uneven scale shows as it would on that screen.
 * Later chapters' characters stay hidden until revealed (the owner plays without spoilers). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.portraitDev = (function () {
  'use strict';
  function allowed() {
    try {
      if (typeof window === 'undefined') return false;
      if (window.__RB_DEV_PORTRAITS__ === true) return true;
      return /[?&]dev=portraits\b/.test(window.location.search || '');
    } catch (e) { return false; }
  }

  // who is shown openly, and who stays hidden until revealed (by where they first speak)
  const GROUPS = [
    { id: 'you', label: 'You', ids: ['pc'] },
    { id: 'comp', label: 'Companions', ids: ['nao', 'mio', 'ren', 'suzu'] },
    { id: 'ch1', label: 'Chapter 1', ids: ['tsuru', 'hana', 'koji', 'oto', 'bunta', 'kiku', 'yasu', 'mame', 'sae', 'tomo', 'echo'] },
    { id: 'ch2', label: 'Chapter 2', hidden: 'Hidden: you may not have met everyone yet.', ids: ['omi', 'wataru', 'tamae', 'tetsu', 'shiori', 'genzo', 'asahi', 'kiyo', 'sota', 'fuku', 'daigo', 'tobi', 'nagisa', 'sg_clerk'] },
    { id: 'later', label: 'Later chapters and side stories', hidden: 'Hidden: spoilers for later chapters.', ids: null },
  ];
  // the dialogue layouts (src/styles/50_play.css: .dlg .portrait) and the device pixel ratios shown
  const LAYOUTS = [
    { id: 'desk', name: 'Desktop and tablet', note: 'wider than 600 px and taller than 440 px', target: 116, grow: true, border: 4 },
    { id: 'land', name: 'Landscape phone', note: '440 px tall or less', target: 84, grow: true, border: 4 },
    { id: 'phone', name: 'Phone, upright', note: 'narrower than 600 px', target: 64, grow: false, border: 3 },
  ];
  const DPRS = [1, 1.25, 1.5, 2, 2.625, 3];
  const SKIN_NAMES = ['Very light', 'Light', 'Light-medium', 'Medium', 'Medium-deep', 'Deep', 'Very deep'];
  const CLOTH_NAMES = ['Indigo', 'Rust red', 'Moss green', 'Wisteria', 'Ochre', 'Charcoal', 'Undyed linen', 'Deep teal'];
  const SHAPES = ['tunic', 'robe', 'coat', 'apron', 'dress'];
  const cap = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  const S = { who: 'suzu', expr: 'smile', look: { skin: 1, hair: 'ponytail', hairColor: 3, outfit: 2, shape: 'coat', acc: ['glasses', 'flower'] },
    playing: true, speed: 1, still: false, repeat: false, prev: '', seed: null, zoom: 4, mag: 1, extraDpr: null,
    revealed: {}, t: 0, base: 0, wall: 0, tl: null, idx: -1, key: null };
  let root = null, src = null, raf = 0;

  // ---- data -------------------------------------------------------------------------------------------------
  function hasPortrait(id) { try { return id === 'pc' || !!RB.portraits.subject(id); } catch (e) { return false; } }
  function groups() {
    const listed = new Set();
    GROUPS.forEach((g) => (g.ids || []).forEach((id) => listed.add(id)));
    const all = Object.keys(RB.content.chars || {}).filter((id) => !listed.has(id) && hasPortrait(id));
    return GROUPS.map((g) => Object.assign({}, g, { ids: (g.ids || all).filter(hasPortrait) }));
  }
  const nameOf = (id) => (id === 'pc' ? 'You (the player)' : ((RB.content.chars[id] || {}).name || {}).en || id);
  const subj = () => RB.portraits.subject(S.who, S.who === 'pc' ? S.look : null);
  function rebuild() {
    const o = { ms: 600000, look: S.who === 'pc' ? S.look : null, cue: !S.repeat, prevTag: S.prev || null };
    if (S.seed != null) o.seed = S.seed;
    S.tl = RB.portraitAnim.timeline(S.who, S.expr, o);
    S.base = 0; S.wall = now(); S.idx = -1; S.key = null;
  }
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  function timeNow() {
    if (!S.playing) return S.base;
    return S.base + (now() - S.wall) * S.speed;
  }
  function frameIndex(t) {
    const f = S.tl.frames;
    let lo = 0, hi = f.length - 1;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (f[m].t <= t) lo = m; else hi = m - 1; }
    return lo;
  }

  // ---- painting ---------------------------------------------------------------------------------------------
  function paint(force) {
    if (!root || !S.tl) return;
    let t = timeNow();
    const end = S.tl.frames.length ? S.tl.frames[S.tl.frames.length - 1].t + 2000 : 600000;
    if (t > end) { S.base = 0; S.wall = now(); t = 0; } // (the ten-minute line starts over)
    S.t = t;
    const i = S.still ? -1 : frameIndex(t);
    const fr = i >= 0 ? S.tl.frames[i].fr : null;
    const key = S.still ? 'still' : S.tl.frames[i].k;
    if (!force && key === S.key) { readout(fr, false); return; }
    S.idx = i; S.key = key;
    RB.portraits.paintFrame(src, subj(), RB.portraits.exprName(S.expr), fr);
    root.querySelectorAll('canvas[data-dev]').forEach((cv) => {
      const c = cv.getContext('2d');
      c.imageSmoothingEnabled = false;
      c.clearRect(0, 0, cv.width, cv.height);
      c.drawImage(src, 0, 0, cv.width, cv.height);
    });
    readout(fr, true);
  }
  function readout(fr, changed) {
    const el = root.querySelector('#pd-time');
    const cue = S.tl.cueEnd && !S.still ? (S.t < S.tl.cueEnd ? ' · lead-in cue until ' + (S.tl.cueEnd / 1000).toFixed(2) + ' s' : ' · lead-in cue done, the loop') : (S.still ? '' : ' · no lead-in cue');
    el.textContent = (S.still ? 'Still image' : (S.t / 1000).toFixed(2) + ' s' + (S.playing ? '' : ' (paused)')) + cue;
    if (!changed) return;
    const parts = [];
    if (fr) for (const k of ['lids', 'look', 'wink', 'eyes', 'brow', 'mouth', 'blush', 'head', 'body', 'sway', 'glint', 'glassDy']) {
      const v = fr[k];
      if (v == null || v === 0 || v === false || (Array.isArray(v) && !v[0] && !v[1])) continue;
      parts.push(k + ' ' + (Array.isArray(v) ? v.join(',') : v));
    }
    root.querySelector('#pd-frame').textContent = S.still ? 'The expression held, as with Reduce motion, fast-forward or instant text.' : (parts.length ? 'This frame: ' + parts.join(' · ') : 'This frame: at rest');
  }
  function loop() {
    raf = 0;
    if (!root || root.hidden) return;
    paint(false);
    raf = requestAnimationFrame(loop);
  }

  // ---- the page ---------------------------------------------------------------------------------------------
  const CSS = `
#por-dev{position:fixed;inset:0;z-index:99999;overflow:auto;background:#1b2027;color:#e9e6df;font:14px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif}
#por-dev *{box-sizing:border-box}
#por-dev .pd-wrap{display:grid;grid-template-columns:270px minmax(0,1fr);gap:16px;padding:14px 16px 28px;max-width:1500px;margin:0 auto}
@media (max-width:820px){#por-dev .pd-wrap{grid-template-columns:minmax(0,1fr)}}
#por-dev h1{grid-column:1/-1;margin:0;font-size:19px;font-weight:650}
#por-dev .pd-sub{grid-column:1/-1;margin:-8px 0 0;color:#b8b3a8;max-width:90ch}
#por-dev .pd-side,#por-dev .pd-card{background:#242b34;border:1px solid #3a4553;border-radius:8px;padding:10px 12px;min-width:0}
#por-dev .pd-side{display:grid;gap:10px;align-content:start}
#por-dev h2{margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#d8b46a;font-weight:650}
#por-dev h3{margin:8px 0 4px;font-size:13px;color:#c9c3b6;font-weight:600}
#por-dev .pd-who{display:flex;flex-wrap:wrap;gap:4px}
#por-dev .pd-who button{display:grid;grid-template-columns:32px auto;align-items:center;gap:6px;padding:2px 8px 2px 2px;text-align:left}
#por-dev .pd-who canvas{width:32px;height:32px;image-rendering:pixelated;border-radius:3px}
#por-dev .pd-mask canvas{filter:blur(6px) grayscale(1)}
#por-dev button,#por-dev select,#por-dev input[type=number]{font:inherit;font-size:13px;color:#f4f0e6;background:#33404e;border:1px solid #64768a;border-radius:6px;min-height:32px;padding:3px 10px;cursor:pointer}
#por-dev button:hover{border-color:#a9b8c8}
#por-dev button:focus-visible,#por-dev select:focus-visible,#por-dev input:focus-visible{outline:2px solid #ffd27a;outline-offset:2px}
#por-dev button[aria-pressed=true]{background:#d8b46a;color:#1b2027;border-color:#d8b46a}
#por-dev .pd-row{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;margin:4px 0}
#por-dev .pd-lbl{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#a9a397;min-width:84px}
#por-dev .pd-sw{width:26px;min-width:26px;height:26px;min-height:26px;padding:0;border-radius:50%}
#por-dev .pd-sw[aria-pressed=true]{outline:2px solid #ffd27a;outline-offset:2px}
#por-dev .pd-main{display:grid;gap:14px;align-content:start;min-width:0}
#por-dev .pd-stage{display:flex;flex-wrap:wrap;gap:18px;align-items:flex-start}
#por-dev .pd-big{background:#11151a;border-radius:6px;padding:12px;display:grid;place-items:center}
#por-dev .pd-big canvas{image-rendering:pixelated;display:block}
#por-dev .pd-info{flex:1 1 280px;min-width:0;display:grid;gap:6px;align-content:start}
#por-dev .pd-time{font:600 15px ui-monospace,Menlo,monospace;color:#ffd27a}
#por-dev .pd-note{color:#b8b3a8;font-size:13px;margin:0}
#por-dev .pd-cue{font-size:10px;vertical-align:super;color:#ffd27a;margin-left:2px}
#por-dev table{border-collapse:collapse;width:100%}
#por-dev th,#por-dev td{border-top:1px solid #3a4553;padding:8px 8px 10px;vertical-align:top;text-align:left}
#por-dev th{font-weight:600;font-size:13px;width:150px}
#por-dev th small{display:block;color:#a9a397;font-weight:400}
#por-dev .pd-scroll{overflow-x:auto}
#por-dev .pd-cell{display:grid;gap:4px;justify-items:start}
#por-dev .pd-frame{display:inline-block;background:#d9cfb6;border-style:solid;border-color:#efe6cf;outline:1px solid #a8966c;line-height:0}
#por-dev .pd-frame canvas{display:block;image-rendering:pixelated}
#por-dev .pd-dim{font:12px ui-monospace,Menlo,monospace;color:#c9c3b6}
#por-dev .pd-even{color:#8fd19e}
#por-dev .pd-uneven{color:#f0b46a}
#por-dev .pd-mine{box-shadow:inset 0 0 0 2px #ffd27a;border-radius:4px}
#por-dev kbd{font:12px ui-monospace,Menlo,monospace;border:1px solid #64768a;border-bottom-width:2px;border-radius:4px;padding:0 5px}
`;
  function swatch(kind, i, col, label) { return '<button type="button" class="pd-sw" data-' + kind + '="' + i + '" title="' + esc(label) + '" aria-label="' + esc(label) + '" style="background:' + esc(col) + '"></button>'; }
  function lookPanel() {
    const sp = RB.sprites;
    const skins = (sp.SKIN || []).map((c, i) => swatch('skin', i, Array.isArray(c) ? c[0] : c, SKIN_NAMES[i] || 'Tone ' + (i + 1))).join('');
    const hairs = (sp.HAIR || []).map((c, i) => swatch('hcol', i, Array.isArray(c) ? c[1] || c[0] : c, cap((sp.HAIR_NAMES || [])[i] || 'colour ' + (i + 1)))).join('');
    const cloth = (sp.CLOTH || []).map((c, i) => swatch('cloth', i, Array.isArray(c) ? c[0] : c, CLOTH_NAMES[i] || 'Colour ' + (i + 1))).join('');
    return '<div id="pd-look"><h2>Your look</h2>' +
      '<h3>Skin</h3><div class="pd-row">' + skins + '</div>' +
      '<h3>Hairstyle</h3><div class="pd-row"><select id="pd-hair" aria-label="Hairstyle">' + (sp.HAIRSTYLES || []).map((h) => '<option value="' + h + '">' + cap(h === 'twintails' ? 'twin tails' : h === 'wrap' ? 'head wrap' : h) + '</option>').join('') + '</select></div>' +
      '<h3>Hair colour</h3><div class="pd-row">' + hairs + '</div>' +
      '<h3>Clothing colour</h3><div class="pd-row">' + cloth + '</div>' +
      '<h3>Cut</h3><div class="pd-row"><select id="pd-shape" aria-label="Cut">' + SHAPES.map((s) => '<option value="' + s + '">' + cap(s) + '</option>').join('') + '</select></div>' +
      '<h3>Wearing</h3><div class="pd-row">' + (sp.ACCESSORIES || []).map((a) => '<button type="button" data-acc="' + a + '" aria-pressed="false">' + cap(a) + '</button>').join('') + '</div>' +
      '<div class="pd-row"><button type="button" id="pd-rand">A random look</button></div></div>';
  }
  function whoPanel() {
    return '<div><h2>Who</h2>' + groups().map((g) => {
      if (!g.ids.length) return '';
      const masked = g.hidden && !S.revealed[g.id];
      return '<h3>' + esc(g.label) + ' (' + g.ids.length + ')</h3>' +
        (masked ? '<p class="pd-note">' + esc(g.hidden) + '</p><div class="pd-row"><button type="button" data-reveal="' + g.id + '">Reveal ' + esc(g.label) + '</button></div>'
          : '<div class="pd-who">' + g.ids.map((id) => '<button type="button" data-who="' + id + '" aria-pressed="' + (id === S.who) + '"><canvas width="96" height="96" data-thumb="' + id + '"></canvas><span>' + esc(nameOf(id)) + '</span></button>').join('') + '</div>');
    }).join('') + '</div>';
  }
  function exprRow() {
    const cues = RB.portraitAnim.CUES || {};
    return RB.portraits.EXPRESSIONS.map((e) => '<button type="button" data-expr="' + e + '" aria-pressed="' + (e === S.expr) + '">' + cap(e) + (cues[e] ? '<span class="pd-cue" title="Has a lead-in cue">●</span>' : '') + '</button>').join('');
  }
  function dprList() { const l = DPRS.slice(); if (S.extraDpr && l.indexOf(S.extraDpr) < 0) l.push(S.extraDpr); return l.sort((a, b) => a - b); }
  function resTable() {
    const mine = (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1;
    const list = dprList();
    let h = '<table><thead><tr><th scope="col">Layout</th>' + list.map((d) => '<th scope="col" class="' + (Math.abs(d - mine) < 0.01 ? 'pd-mine' : '') + '">Ratio ' + d + (Math.abs(d - mine) < 0.01 ? '<small>your screen</small>' : '') + '</th>').join('') + '</tr></thead><tbody>';
    for (const L of LAYOUTS) {
      h += '<tr><th scope="row">' + esc(L.name) + '<small>' + esc(L.note) + '; layout size ' + L.target + ' CSS px</small></th>';
      for (const d of list) {
        const css = RB.portraitAnim.fitSize(L.target, d, L.grow);
        const dev = css * d, W = Math.round(dev), per = dev / 96, even = Math.abs(per - Math.round(per)) < 0.01;
        const px = (v) => (v * S.mag / mine).toFixed(3) + 'px';
        h += '<td class="' + (Math.abs(d - mine) < 0.01 ? 'pd-mine' : '') + '"><div class="pd-cell"><span class="pd-frame" style="border-width:' + px(L.border * d) + '"><canvas data-dev="1" width="' + W + '" height="' + W + '" style="width:' + px(W) + ';height:' + px(W) + '"></canvas></span>' +
          '<span class="pd-dim">' + css + ' CSS px · ' + W + ' device px</span><span class="pd-dim ' + (even ? 'pd-even' : 'pd-uneven') + '">' + per.toFixed(2) + ' device px per art px · ' + (even ? 'even' : 'uneven') + '</span></div></td>';
      }
      h += '</tr>';
    }
    return h + '</tbody></table>';
  }
  function bigCanvas() {
    const mine = (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1;
    const css = (96 * S.zoom / mine).toFixed(3) + 'px';
    return '<canvas data-dev="1" width="96" height="96" style="width:' + css + ';height:' + css + '" aria-label="The portrait, ' + S.zoom + ' screen pixels per art pixel"></canvas>';
  }
  function render() {
    root.innerHTML = '<div class="pd-wrap"><h1>Portraits — development viewer</h1>' +
      '<p class="pd-sub">The game\'s own portrait renderer and animation timeline, as a dialogue line plays it. Nothing is saved; no game runs. Choose a person and an expression; each expression with a <span class="pd-cue">●</span> opens with a one-off lead-in cue, then settles into its loop.</p>' +
      '<div class="pd-side">' + whoPanel() + (S.who === 'pc' ? lookPanel() : '') + '</div>' +
      '<div class="pd-main">' +
      '<section class="pd-card" aria-label="Expression and playback"><h2>' + esc(nameOf(S.who)) + '</h2>' +
      '<div class="pd-row"><span class="pd-lbl">Expression</span>' + exprRow() + '</div>' +
      '<div class="pd-row"><span class="pd-lbl">Playback</span><button type="button" id="pd-play">' + (S.playing ? 'Pause' : 'Play') + '</button><button type="button" id="pd-replay" title="Show the line again: the lead-in cue, then the loop (R)">Replay the line</button><button type="button" id="pd-back" title="Previous frame change (←)">◀ Step</button><button type="button" id="pd-step" title="Next frame change (→)">Step ▶</button></div>' +
      '<div class="pd-row"><span class="pd-lbl">Speed</span>' + [1, 0.5, 0.25].map((v) => '<button type="button" data-speed="' + v + '" aria-pressed="' + (S.speed === v) + '">' + (v === 1 ? 'Real time' : v === 0.5 ? '½ speed' : '¼ speed') + '</button>').join('') + '</div>' +
      '<div class="pd-row"><span class="pd-lbl">The line</span><label>Previous line was <select id="pd-prev"><option value="">another speaker or none</option>' + RB.portraits.EXPRESSIONS.map((e) => '<option value="' + e + '"' + (S.prev === e ? ' selected' : '') + '>' + cap(e) + ' (same speaker)</option>').join('') + '</select></label>' +
      '<button type="button" id="pd-repeat" aria-pressed="' + S.repeat + '" title="The same speaker with the same expression again: the game plays no lead-in, the loop goes on">Same expression again (no lead-in)</button>' +
      '<button type="button" id="pd-still" aria-pressed="' + S.still + '" title="Reduce motion, fast-forward and instant text show the still image">Still (Reduce motion)</button>' +
      '<button type="button" id="pd-seed" title="A different seed: the same rules, other moments for blinks and glances">Other timing</button></div>' +
      '<div class="pd-stage"><div class="pd-big">' + bigCanvas() + '</div><div class="pd-info"><div class="pd-time" id="pd-time"></div><p class="pd-note" id="pd-frame"></p><p class="pd-note" id="pd-prof"></p>' +
      '<div class="pd-row"><span class="pd-lbl">Close view</span>' + [3, 4, 6, 8].map((z) => '<button type="button" data-zoom="' + z + '" aria-pressed="' + (S.zoom === z) + '">' + z + '×</button>').join('') + '</div>' +
      '<p class="pd-note"><kbd>Space</kbd> play or pause · <kbd>R</kbd> replay · <kbd>←</kbd> <kbd>→</kbd> step</p></div></div></section>' +
      '<section class="pd-card" aria-label="Every display size"><h2>Every display size the game uses</h2>' +
      '<p class="pd-note">Each cell is drawn at that screen\'s real device pixels, sized by the game\'s own fit (whole device pixels per art pixel where one is close to the layout\'s size). "Uneven" means some art pixels get one device pixel more than others. The column for your own screen is outlined.</p>' +
      '<div class="pd-row"><span class="pd-lbl">Magnify</span>' + [1, 2, 3].map((m) => '<button type="button" data-mag="' + m + '" aria-pressed="' + (S.mag === m) + '">' + (m === 1 ? 'Actual size' : m + '× device pixels') + '</button>').join('') +
      '<label>Another ratio <input type="number" id="pd-dpr" min="0.5" max="5" step="0.125" value="' + (S.extraDpr || '') + '" placeholder="e.g. 1.75" style="width:90px"></label></div>' +
      '<div class="pd-scroll">' + resTable() + '</div></section></div></div>';
    // thumbnails
    root.querySelectorAll('canvas[data-thumb]').forEach((cv) => {
      const id = cv.dataset.thumb;
      try { RB.portraits.paintFrame(cv, id === 'pc' ? RB.portraits.subject('pc', S.look) : RB.portraits.subject(id), 'neutral', null); } catch (e) { /* none */ }
    });
    if (S.who === 'pc') syncLook();
    const pr = S.tl && S.tl.profile;
    if (pr) {
      const r = (a) => (a ? (a[0] / 1000).toFixed(1) + '–' + (a[1] / 1000).toFixed(1) + ' s' : 'none');
      root.querySelector('#pd-prof').textContent = 'Profile: ' + (pr.cls || pr.id || 'base') + ' · blinks every ' + r(pr.blink) + ' · a breath every ' + (pr.breath ? (pr.breath / 1000).toFixed(1) + ' s' : 'none') + (pr.glance ? ' · glances every ' + r(pr.glance.every) : '') + (pr.habit ? ' · habit: ' + pr.habit.kind : '');
    }
    paint(true);
  }
  function syncLook() {
    const L = S.look, q = (s) => root.querySelector(s);
    root.querySelectorAll('[data-skin]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.skin === L.skin)));
    root.querySelectorAll('[data-hcol]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.hcol === L.hairColor)));
    root.querySelectorAll('[data-cloth]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.cloth === L.outfit)));
    root.querySelectorAll('[data-acc]').forEach((b) => b.setAttribute('aria-pressed', String((L.acc || []).indexOf(b.dataset.acc) >= 0)));
    if (q('#pd-hair')) q('#pd-hair').value = L.hair;
    if (q('#pd-shape')) q('#pd-shape').value = L.shape;
  }
  function restart() { rebuild(); render(); }

  function onClick(e) {
    const b = e.target.closest('button');
    if (!b || !root.contains(b)) return;
    const d = b.dataset, L = S.look;
    if (d.who) { S.who = d.who; S.seed = null; return restart(); }
    if (d.reveal) { S.revealed[d.reveal] = true; return render(); }
    if (d.expr) { S.expr = d.expr; return restart(); }
    if (d.speed) { S.base = timeNow(); S.wall = now(); S.speed = +d.speed; return render(); }
    if (d.zoom) { S.zoom = +d.zoom; return render(); }
    if (d.mag) { S.mag = +d.mag; return render(); }
    if (d.skin != null) { L.skin = +d.skin; return restart(); }
    if (d.hcol != null) { L.hairColor = +d.hcol; return restart(); }
    if (d.cloth != null) { L.outfit = +d.cloth; return restart(); }
    if (d.acc) { const a = L.acc || (L.acc = []), i = a.indexOf(d.acc); if (i >= 0) a.splice(i, 1); else a.push(d.acc); return restart(); }
    switch (b.id) {
      case 'pd-play': return toggle();
      case 'pd-replay': S.base = 0; S.wall = now(); S.key = null; return paint(true);
      case 'pd-step': return step(1);
      case 'pd-back': return step(-1);
      case 'pd-repeat': S.repeat = !S.repeat; return restart();
      case 'pd-still': S.still = !S.still; return render();
      case 'pd-seed': S.seed = Math.floor(Math.random() * 1e9); return restart();
      case 'pd-rand': S.look = Object.assign(RB.sprites.randomLook(Math.floor(Math.random() * 1e9)), { acc: [] }); return restart();
      default: return undefined;
    }
  }
  function onChange(e) {
    const t = e.target;
    if (t.id === 'pd-hair') { S.look.hair = t.value; restart(); }
    else if (t.id === 'pd-shape') { S.look.shape = t.value; restart(); }
    else if (t.id === 'pd-prev') { S.prev = t.value; restart(); }
    else if (t.id === 'pd-dpr') { const v = parseFloat(t.value); S.extraDpr = v >= 0.5 && v <= 5 ? Math.round(v * 1000) / 1000 : null; render(); }
  }
  function toggle() { if (S.playing) { S.base = timeNow(); S.playing = false; } else { S.wall = now(); S.playing = true; } render(); }
  function step(dir) {
    if (S.still) return;
    const f = S.tl.frames, i = frameIndex(timeNow());
    const j = Math.max(0, Math.min(f.length - 1, i + dir));
    S.playing = false; S.base = f[j].t; render();
  }
  function onKey(e) {
    if (!root || root.hidden) return;
    // the title screen underneath gets no keys while the viewer is open
    e.stopImmediatePropagation();
    const tag = (e.target && e.target.tagName) || '';
    if (e.type !== 'keydown' || /INPUT|SELECT/.test(tag)) return;
    if (e.key === ' ' && !/BUTTON/.test(tag)) { e.preventDefault(); toggle(); }
    else if (e.key === 'r' || e.key === 'R') { S.base = 0; S.wall = now(); S.key = null; paint(true); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  }

  function open() {
    if (!allowed() || typeof document === 'undefined' || !RB.portraits || !RB.portraitAnim) return null;
    if (root) { root.hidden = false; return root; }
    const css = document.createElement('style');
    css.textContent = CSS;
    document.head.appendChild(css);
    root = document.createElement('div');
    root.id = 'por-dev';
    root.setAttribute('role', 'main');
    root.setAttribute('aria-label', 'Portraits (development viewer)');
    document.body.appendChild(root);
    src = document.createElement('canvas');
    // sound off for this page only (the settings are not written)
    try { if (RB.audio && RB.audio.setMuted) RB.audio.setMuted(true); } catch (e) { /* none */ }
    root.addEventListener('click', onClick);
    root.addEventListener('change', onChange);
    for (const k of ['keydown', 'keyup', 'keypress']) window.addEventListener(k, onKey, true);
    rebuild();
    render();
    raf = requestAnimationFrame(loop);
    return root;
  }
  function state() {
    if (!root) return null;
    return { who: S.who, expr: S.expr, still: S.still, frames: S.tl ? S.tl.frames.length : 0, cueEnd: S.tl ? S.tl.cueEnd : 0, key: S.key,
      cells: [...root.querySelectorAll('td canvas[data-dev]')].map((c) => c.width),
      masked: [...root.querySelectorAll('[data-reveal]')].map((b) => b.dataset.reveal),
      shown: [...root.querySelectorAll('[data-who]')].map((b) => b.dataset.who) };
  }
  if (typeof window !== 'undefined' && typeof document !== 'undefined' && allowed()) {
    let tries = 0;
    const go = () => { if (window.__RB_READY__ === true && document.body) open(); else if (++tries < 300) setTimeout(go, 100); };
    setTimeout(go, 0);
  }
  return { allowed, open, state, LAYOUTS, DPRS, GROUPS };
})();
