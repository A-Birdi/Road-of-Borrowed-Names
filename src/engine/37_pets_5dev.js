/* Development-only playback and coverage gallery for the pets (worker P). Not reachable in normal play: every
 * entry point refuses unless the page was opened with ?dev=pets (or a test has set window.__RB_DEV_PETS__ before
 * calling). Nothing here is saved; the dev battle is a session-only debug campaign.
 *
 *   RB.pets.dev.allowed()                    -> true only in a dev page
 *   RB.pets.dev.rows(sp)                     -> the timelines the gallery covers (families, impacts, victory,
 *                                               calm variants, ready, stances)
 *   RB.pets.dev.sheet({ species?, looks?, reduce?, scale? }) -> canvas: the coverage matrix (rows × species,
 *                                               three full-motion moments and the reduced-motion hold per cell)
 *   RB.pets.dev.cells(...)                   -> the same, as data (pixel hashes per cell) for tests
 *   RB.pets.dev.battle({ species, look, comp, reduce }) -> starts a dev encounter with that animal
 *   RB.pets.dev.play({ family | kind, actor, result, targets, reduce }) -> emits the semantic events the battle
 *                                               would (present:action / present:enemy / present:scene), so the
 *                                               real observer reacts on the real stage
 *   RB.pets.dev.panel()                      -> the on-page controls (species, look, family, actor, result, target
 *                                               count, viewport, motion); opened automatically with ?dev=pets
 * Viewport: the window is the viewport; the panel's viewport buttons open the same dev page in a window of that
 * size (wide 1280×800, phone 390×844, small 320×640). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.pets = RB.pets || {};
RB.pets.dev = (function () {
  'use strict';
  function allowed() {
    try {
      if (typeof window === 'undefined') return false;
      if (window.__RB_DEV_PETS__ === true) return true;
      return /[?&]dev=pets\b/.test(window.location.search || '');
    } catch (e) { return false; }
  }
  const SP = () => RB.pets.ORDER.slice();
  const BP = () => RB.battlePets;

  // ---- the gallery ----------------------------------------------------------------------------------------------
  function rows(sp) {
    const out = [];
    for (const f of RB.families.LIST) out.push({ kind: 'react', name: f, label: f });
    for (const k of ['hit', 'soft', 'status']) out.push({ kind: 'impact', name: k, label: 'creature: ' + k });
    out.push({ kind: 'victory', name: null, label: 'settled victory' });
    (BP().CALM[sp] || []).forEach((_, i) => out.push({ kind: 'calm', name: i, label: 'calm idle ' + (i + 1) }));
    out.push({ kind: 'ready', name: 0, label: 'ready idle' });
    for (const st of ['calm', 'ready', 'defeat', 'victory']) out.push({ kind: 'stance', name: st, label: 'stance: ' + st });
    return out;
  }
  // the moments drawn per cell: three along the timeline (full motion) and the reduced-motion hold
  const MOMENTS = [0.12, 0.45, 0.85];
  function poseFor(sp, row, m, reduce) {
    const B = BP();
    if (row.kind === 'stance') return B.sampleAny(sp, row.name, null, null, {});
    const ms = B.sampleAny(sp, row.kind, row.name, 0, {}).ms || 800;
    return B.sampleAny(sp, row.kind, row.name, reduce ? ms * 0.5 : ms * m, { reduce, actor: row.kind === 'react' ? 'pc' : null });
  }
  function frameOf(sp, look, q) { return RB.petArt.frame(sp, look, { kind: 'battle' }, q.po); }
  const CW = 58, CH = 60, LW = 150;
  // the sheet's rows: every species' timelines by label (a species with fewer calm idles leaves a gap)
  function layout(species) {
    const all = [];
    for (const sp of species) {
      let at = -1;
      for (const r of rows(sp)) {
        const i = all.indexOf(r.label);
        if (i >= 0) at = i; else { all.splice(at + 1, 0, r.label); at++; }
      }
    }
    return all;
  }
  // where a cell is on the sheet (sheet pixels), for tests
  function cellRect(species, sp, label, ci, sc) {
    sc = sc || 2;
    const cols = MOMENTS.length + 1, si = species.indexOf(sp), ri = layout(species).indexOf(label);
    return { x: LW + si * (cols * CW * sc + 10) + ci * CW * sc, y: 40 + ri * CH * sc, w: CW * sc, h: CH * sc };
  }
  function cells(o) {
    o = o || {};
    const species = o.species || SP();
    const out = {};
    for (const sp of species) {
      const look = (o.looks && o.looks[sp]) || RB.petArt.LOOK_ORDER[sp][0];
      out[sp] = rows(sp).map((row) => {
        const qs = MOMENTS.map((m) => poseFor(sp, row, m, false)).concat([poseFor(sp, row, 0, true)]);
        return { label: row.label, kind: row.kind, name: row.name, keys: qs.map((q) => JSON.stringify(q.po) + '|' + q.lift) };
      });
    }
    return out;
  }
  function sheet(o) {
    o = o || {};
    if (!allowed()) return null;
    const species = o.species || SP();
    const sc = o.scale || 2;
    const L = layout(species);
    const nRows = L.length;
    const cols = MOMENTS.length + 1;
    const W = LW + species.length * (cols * CW * sc + 10), H = 40 + nRows * CH * sc;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.fillStyle = '#26303a'; g.fillRect(0, 0, W, H);
    g.font = '13px sans-serif'; g.textBaseline = 'middle';
    species.forEach((sp, si) => {
      const look = (o.looks && o.looks[sp]) || RB.petArt.LOOK_ORDER[sp][0];
      const x0 = LW + si * (cols * CW * sc + 10);
      g.fillStyle = '#e8e2cf';
      g.fillText(RB.pets.species(sp).label.en + ' (' + look + ')', x0 + 4, 12);
      MOMENTS.forEach((m, i) => { g.fillStyle = '#9fb0bf'; g.fillText(Math.round(m * 100) + '%', x0 + i * CW * sc + 4, 30); });
      g.fillStyle = '#f0c870'; g.fillText('reduced', x0 + MOMENTS.length * CW * sc + 4, 30);
      const base = frameOf(sp, look, BP().sampleAny(sp, 'calm', null, null, {}));
      const off = BP().centreOf(base);
      if (si === 0) L.forEach((label, ri) => { const y0 = 40 + ri * CH * sc; g.fillStyle = ri % 2 ? '#2c3843' : '#303d49'; g.fillRect(0, y0, W, CH * sc); g.fillStyle = '#e8e2cf'; g.fillText(label, 6, y0 + (CH * sc) / 2); });
      rows(sp).forEach((row) => {
        const y0 = 40 + L.indexOf(row.label) * CH * sc;
        for (let ci = 0; ci < cols; ci++) {
          const reduce = ci === MOMENTS.length;
          const q = poseFor(sp, row, MOMENTS[ci] || 0, reduce);
          const f = frameOf(sp, look, q);
          if (!f) continue;
          const cx = x0 + ci * CW * sc + (CW * sc) / 2, by = y0 + CH * sc - 8 * sc;
          if (reduce) { g.fillStyle = 'rgba(240,200,112,0.10)'; g.fillRect(x0 + ci * CW * sc, y0, CW * sc, CH * sc); }
          g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(cx, by, 12 * sc, 2.5 * sc, 0, 0, Math.PI * 2); g.fill();
          g.drawImage(f.cv, Math.round(cx - (f.ax + off) * sc), Math.round(by - (f.ay + (q.lift || 0)) * sc), f.w * sc, f.h * sc);
        }
      });
    });
    return cv;
  }

  // ---- playback on the real stage ---------------------------------------------------------------------------------
  let EX = 1000;
  async function battle(o) {
    if (!allowed()) return false;
    o = o || {};
    const sp = o.species || 'cat';
    const s = RB.game.debugStart('rw.millroad', 10, 22, { comp: o.comp || 'mio' });
    s.learn.profile = 'E'; s.learn.kanaKnown = 'both'; s.words = ['mamoru', 'mizu', 'hikari'];
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.reducedMotion = !!o.reduce; RB.game.applySettings();
    RB.pets.meet(s, sp); RB.pets.select(s, sp);
    if (o.look) RB.pets.setLook(s, sp, o.look);
    RB.game.startBattle(o.enemy || 'rw.dustmoth', {});
    return true;
  }
  function play(o) {
    if (!allowed()) return false;
    o = o || {};
    if (o.reduce != null && !!RB.game.settings.reducedMotion !== !!o.reduce) { RB.game.settings.reducedMotion = !!o.reduce; RB.game.applySettings(); }
    const t0 = RB.battleSeq ? RB.battleSeq.now() : 0;
    const n = Math.max(1, Math.min(3, o.targets || 1));
    const who = ['pc', 'comp', 'foe:0'];
    const targets = o.actor === 'foe' ? who.slice(0, Math.min(2, n)) : Array.from({ length: n }, (_, i) => 'foe:' + i);
    const kind = o.kind || 'react';
    if (kind === 'calm' || kind === 'ready' || kind === 'defeat' || kind === 'enter' || kind === 'exit') { RB.bus.emit('present:scene', { scope: 'battle', phase: kind, t0 }); return true; }
    if (kind === 'victory') {
      RB.bus.emit('present:action', { scope: 'battle', actor: 'pc', action: 'dev', family: o.family || 'unravel', targets, result: 'hit', exchange: ++EX, t0, beat: 300, won: true, victory: 900 });
      setTimeout(() => RB.bus.emit('present:scene', { scope: 'battle', phase: 'victory', t0: t0 + 900 }), 900);
      return true;
    }
    if (o.actor === 'foe' || kind === 'impact') {
      RB.bus.emit('present:enemy', { scope: 'battle', actor: 'foe:0', kind: 'strike', id: 'dev', targets, outcome: o.result || 'hit', at: 200, t0 });
      return true;
    }
    RB.bus.emit('present:action', { scope: 'battle', actor: o.actor || 'pc', action: 'dev', family: o.family || 'unravel', targets, result: o.result || 'hit', exchange: o.exchange || ++EX, t0, beat: 300 });
    return true;
  }

  // ---- the on-page controls ------------------------------------------------------------------------------------
  function panel() {
    if (!allowed() || typeof document === 'undefined') return null;
    let el = document.getElementById('pets-dev');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'pets-dev';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Pet playback (development)');
    el.style.cssText = 'position:fixed;left:8px;top:8px;z-index:99999;background:#1c2530;color:#eee;font:13px sans-serif;padding:8px;border:1px solid #567;border-radius:6px;max-width:300px;display:grid;grid-template-columns:auto 1fr;gap:4px 6px;align-items:center';
    const sel = (id, label, opts) => '<label for="pd-' + id + '">' + label + '</label><select id="pd-' + id + '">' + opts.map((v) => '<option>' + v + '</option>').join('') + '</select>';
    const fams = RB.families.LIST.map((f) => 'react:' + f).concat(['impact', 'victory', 'calm', 'ready', 'defeat']);
    el.innerHTML = '<strong style="grid-column:1/-1">Pet playback (dev)</strong>' +
      sel('sp', 'Species', SP()) + sel('look', 'Look', RB.petArt.LOOK_ORDER.cat) + sel('fam', 'Family', fams) +
      sel('actor', 'Actor', ['pc', 'comp', 'foe']) + sel('result', 'Result', ['hit', 'absorbed', 'blocked', 'status']) +
      sel('n', 'Targets', ['1', '2', '3']) + sel('motion', 'Motion', ['full', 'reduced']) +
      '<span>Viewport</span><span>' + ['wide', 'phone', 'small'].map((v) => '<button type="button" data-vp="' + v + '">' + v + '</button>').join(' ') + '</span>' +
      '<button type="button" id="pd-start" style="grid-column:1/-1">Start a dev encounter</button>' +
      '<button type="button" id="pd-play" style="grid-column:1/-1">Play</button>' +
      '<button type="button" id="pd-sheet" style="grid-column:1/-1">Open the coverage sheet</button>';
    document.body.appendChild(el);
    const $ = (id) => el.querySelector('#pd-' + id);
    const syncLooks = () => { $('look').innerHTML = RB.petArt.LOOK_ORDER[$('sp').value].map((v) => '<option>' + v + '</option>').join(''); };
    $('sp').addEventListener('change', syncLooks);
    $('start').addEventListener('click', () => battle({ species: $('sp').value, look: $('look').value, reduce: $('motion').value === 'reduced' }));
    $('play').addEventListener('click', () => {
      const f = $('fam').value;
      const kind = f.startsWith('react:') ? 'react' : f;
      play({ kind, family: kind === 'react' ? f.slice(6) : null, actor: kind === 'impact' ? 'foe' : $('actor').value, result: $('result').value, targets: +$('n').value, reduce: $('motion').value === 'reduced' });
    });
    $('sheet').addEventListener('click', () => {
      const cv = sheet({ reduce: $('motion').value === 'reduced' });
      const w = window.open('', 'petsheet');
      if (w && cv) w.document.body.innerHTML = '<img alt="Pet coverage sheet" src="' + cv.toDataURL() + '">';
    });
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-vp]');
      if (!b) return;
      const [w, h] = { wide: [1280, 800], phone: [390, 844], small: [320, 640] }[b.dataset.vp];
      window.open(window.location.href, 'pets-dev-' + b.dataset.vp, 'width=' + w + ',height=' + h);
    });
    return el;
  }
  if (typeof window !== 'undefined' && typeof document !== 'undefined' && /[?&]dev=pets\b/.test((window.location && window.location.search) || '')) {
    // the panel appears only on a dev page, once the game is ready
    let tries = 0;
    const open = () => { if (window.__RB_READY__ === true && document.body) panel(); else if (++tries < 300) setTimeout(open, 100); };
    setTimeout(open, 0);
  }
  return { allowed, rows, layout, cellRect, cells, sheet, battle, play, panel, MOMENTS };
})();
