/* Development-only viewer for the Harmony cut-in and the four stage performances (Harmony addendum §20.4).
 * Not reachable in normal play: every entry point refuses unless the page was opened with ?dev=harmony (or a
 * test set window.__RB_DEV_HARMONY__ before calling). Everything it shows is a SYNTHETIC FIXTURE, and says so:
 * a session-only debug campaign, Harmony filled by the fixture, and a playback of a technique's presentation
 * (the real choreography, the real sequencer, the real cut-in and stage) with the rules' results left out —
 * no beat is applied, nothing is spent, no learning or reward is recorded. Evidence of real play comes from
 * the browser tests, never from this viewer.
 *
 *   RB.harmonyCutin.dev.allowed()                   → true only on a dev page
 *   RB.harmonyCutin.dev.battle({ comp, foes, look, reduce, anim, flourish, controls, intents })
 *                                                   → starts a synthetic dev encounter (debug campaign)
 *   RB.harmonyCutin.dev.play({ comp?, foes?, slip? }) → Promise: plays the companion's technique presentation
 *                                                   on the live stage (visual cues only; the menus withdraw as
 *                                                   for a committed exchange and come back after)
 *   RB.harmonyCutin.dev.panel()                     → the on-page controls (opened automatically on a dev page)
 *   RB.harmonyCutin.dev.status()                    → the art's approval state as the panel shows it (contract v3:
 *                                                   provisional, candidate, approved, verified; synthetic) */
var RB = (globalThis.RB = globalThis.RB || {});

RB.harmonyCutin = RB.harmonyCutin || {};
RB.harmonyCutin.dev = (function () {
  'use strict';
  const LABEL = 'Synthetic fixture — development viewer (no rules applied)';
  function allowed() {
    try {
      if (typeof window === 'undefined') return false;
      if (window.__RB_DEV_HARMONY__ === true) return true;
      return /[?&]dev=harmony\b/.test(window.location.search || '');
    } catch (e) { return false; }
  }
  let opts = { comp: 'suzu', foes: 1 };
  function battle(o) {
    if (!allowed()) return false;
    o = Object.assign({ comp: 'suzu', foes: 1 }, o || {});
    opts = o;
    const s = RB.game.debugStart('rw.mill1', 7, 9, { comp: o.comp, flags: { rw_gears: true } });
    s.learn.profile = 'E'; s.learn.kanaKnown = 'both'; s.words = ['mamoru', 'mizu', 'iyasu'];
    s.tips = { harmony: 1, harmonyFull: 1, cturn: 1, group: 1 };
    for (const k of ['strike', 'sweep', 'shroud', 'rest', 'heat', 'charge', 'lie', 'mirror', 'plea']) s.tips['intent:' + k] = 1;
    if (o.look) s.player.look = o.look;
    const st = RB.game.settings;
    Object.assign(st, { textSpeed: 'instant', input: 'choice' });
    if (o.reduce != null) st.reducedMotion = !!o.reduce;
    if (o.anim) st.battleAnim = o.anim;
    if (o.flourish != null) st.harmonyFlourish = !!o.flourish;
    if (o.controls) st.battleControls = o.controls;
    if (o.intents) st.intentDisplay = o.intents;
    RB.game.applySettings();
    // (the fixture fills Harmony once, for this encounter only)
    const L = RB.combatLogic, init = L.init;
    L.init = function (...a) { L.init = init; const r = init.apply(this, a); r.harmony = r.harmonyMax; return r; };
    const place = RB.content.maps['rw.mill1'].foes.find((f) => f.id === 'm1a');
    RB.game.startBattle(place.enemy, Object.assign({ place, where: { map: 'rw.mill1', x: place.x, y: place.y }, foeKey: 'dev:harmony' }, o.foes > 1 ? { group: Array(o.foes - 1).fill(place.enemy) } : {}));
    return true;
  }
  const KNOTS = { nao: 2, mio: 1, ren: 1, suzu: 2 };
  // the presentation of a technique, visuals only (synthetic: what the rules would return for this fixture)
  async function play(o) {
    if (!allowed() || !RB.combat || !RB.combat.state() || RB.battleSeq.busy()) return false;
    o = Object.assign({}, opts, o || {});
    const st = RB.combat.state(), comp = st.compId;
    if (!comp) return false;
    const v = RB.combat.shown();
    const up = v.foes.map((f, i) => (f.knots > 0 ? i : -1)).filter((i) => i >= 0);
    const T = v.cur != null ? v.cur : up[0] || 0;
    const fx = [];
    if (o.slip) fx.push({ t: 'cost', en: 'slip' });
    fx.push({ t: 'unravel', n: KNOTS[comp], foe: T });
    const others = up.filter((i) => i !== T);
    fx.push({ t: 'tech', who: comp, en: '', foe: T, all: others.length > 0 });
    if (comp === 'suzu') for (const i of others) fx.push({ t: 'unravel', n: 1, foe: i, by: 'suzu' });
    const reach = { foes: comp === 'suzu' || comp === 'mio' ? up : [T], allies: ['pc', 'comp'] };
    const ctx = { comp, reduce: RB.game.reducedMotion(), view: v, group: v.foes.length > 1, foe: T, reach };
    const card = { id: 'tech', kind: 'tech', jp: 'あわせ', en: (RB.combatHelp.techOf(st) || {}).name || 'Technique', tech: comp };
    const P = RB.battleSeq.choreo.player(card, fx, ctx);
    const VIS = { pose: 1, foe: 1, fx: 1, strip: 1, sfx: 1, cutin: 1 };
    const cues = P.cues.filter((c) => VIS[c.type]);
    // the menus withdraw (or stay, disabled) as they would for a committed exchange; restored after
    const root = document.querySelector('.combat-ui'), keep = RB.game.settings.battleControls === 'keep';
    const surf = root ? [root.querySelector('.intent'), root.querySelector('.cb-dock')] : [];
    if (root) { root.classList.add('cb-acting'); root.classList.toggle('cb-keep', keep); for (const e of surf) if (e) e.inert = true; }
    const action = { id: 'dev:harmony:' + comp + ':' + Date.now(), side: 'party', actor: { en: 'Synthetic preview' }, label: { jp: 'あわせ', en: card.en }, end: P.end };
    try { return await RB.battleSeq.run('dev', cues, { end: P.end, action, synthetic: true }); }
    finally { if (root) { root.classList.remove('cb-acting', 'cb-keep'); for (const e of surf) if (e) e.inert = false; } }
  }
  // the art's approval state (RB.harmonyArt.approval(), contract v3): development only, never shown to players
  function status() {
    if (!allowed()) return null;
    try {
      const a = RB.harmonyArt.approval(), L = a.labels;
      return 'Art status — player kit: ' + L[a.kit] + '; ' + Object.entries(a.pairings).map(([c, v]) => c + ': ' + L[v]).join('; ');
    } catch (e) { return 'Art status: unknown'; }
  }
  function panel() {
    if (!allowed() || typeof document === 'undefined') return null;
    let el = document.getElementById('harmony-dev');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'harmony-dev';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Harmony playback (development)');
    el.style.cssText = 'position:fixed;right:8px;bottom:8px;z-index:99999;background:rgba(28,37,48,0.94);color:#eee;font:13px sans-serif;padding:8px;border:1px solid #567;border-radius:6px;max-width:320px;display:grid;grid-template-columns:auto 1fr;gap:4px 6px;align-items:center';
    const css = document.createElement('style');
    css.textContent = '#harmony-dev button,#harmony-dev select{font:13px sans-serif;color:#f4f0e6;background:#34485c;border:1px solid #7a90a6;border-radius:4px;min-height:28px;padding:2px 8px}#harmony-dev .lbl{grid-column:1/-1;color:#ffd27a;font-weight:700}#harmony-dev.min>*:not(#hd-toggle){display:none}#harmony-dev.min{grid-template-columns:auto}';
    document.head.appendChild(css);
    const sel = (id, label, o) => '<label for="hd-' + id + '">' + label + '</label><select id="hd-' + id + '">' + o.map((v) => '<option>' + v + '</option>').join('') + '</select>';
    el.innerHTML = '<button type="button" id="hd-toggle" aria-expanded="true" style="grid-column:1/-1">Harmony (dev) — hide</button><span class="lbl">' + LABEL + '</span>' +
      '<span id="hd-status" style="grid-column:1/-1;color:#c8d4e0;font-size:12px"></span>' +
      sel('comp', 'Companion', ['suzu', 'ren', 'nao', 'mio']) + sel('foes', 'Creatures', ['1', '2', '3']) + sel('anim', 'Playback', ['normal', 'fast', 'instant']) +
      sel('motion', 'Motion', ['full', 'reduced']) + sel('flourish', 'Portrait', ['on', 'off']) + sel('controls', 'Controls', ['adaptive', 'keep']) +
      '<span>Viewport</span><span>' + ['1648x840', '1280x720', '768x1024', '390x844', '844x390'].map((v) => '<button type="button" data-vp="' + v + '">' + v + '</button>').join(' ') + '</span>' +
      '<button type="button" id="hd-start" style="grid-column:1/-1">Start a synthetic encounter</button>' +
      '<button type="button" id="hd-play" style="grid-column:1/-1">Play the technique (visuals only)</button>' +
      '<button type="button" id="hd-slip" style="grid-column:1/-1">Play it after a slip of the brush</button>';
    document.body.appendChild(el);
    const $ = (id) => el.querySelector('#hd-' + id);
    const fold = (min) => { el.classList.toggle('min', min); $('toggle').textContent = min ? 'Harmony (dev) — show' : 'Harmony (dev) — hide'; $('toggle').setAttribute('aria-expanded', String(!min)); };
    $('toggle').addEventListener('click', () => fold(!el.classList.contains('min')));
    fold(window.innerHeight < 500);
    const settings = () => ({ comp: $('comp').value, foes: +$('foes').value, anim: $('anim').value, reduce: $('motion').value === 'reduced', flourish: $('flourish').value === 'on', controls: $('controls').value });
    const apply = () => { const o = settings(); Object.assign(RB.game.settings, { battleAnim: o.anim, reducedMotion: o.reduce, harmonyFlourish: o.flourish, battleControls: o.controls }); RB.game.applySettings(); };
    const showStatus = () => { $('status').textContent = status() || ''; };
    showStatus();
    $('start').addEventListener('click', () => { battle(settings()); showStatus(); });
    $('play').addEventListener('click', () => { apply(); showStatus(); play({}); });
    $('slip').addEventListener('click', () => { apply(); play({ slip: true }); });
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-vp]');
      if (!b) return;
      const [w, h] = b.dataset.vp.split('x').map(Number);
      window.open(window.location.href, 'harmony-dev-' + b.dataset.vp, 'width=' + w + ',height=' + h);
    });
    return el;
  }
  if (typeof window !== 'undefined' && typeof document !== 'undefined' && /[?&]dev=harmony\b/.test((window.location && window.location.search) || '')) {
    let tries = 0;
    const open = () => { if (window.__RB_READY__ === true && document.body) panel(); else if (++tries < 300) setTimeout(open, 100); };
    setTimeout(open, 0);
  }
  return { allowed, battle, play, panel, status, LABEL };
})();
