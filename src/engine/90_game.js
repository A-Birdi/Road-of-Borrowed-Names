/* Game controller: mode stack, main loop, global settings, transitions,
 * battles, companion recruitment/departure, and the campaign lifecycle. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.game = (function () {
  'use strict';
  const G = {
    s: null,              // current campaign state (JSON)
    modes: [],            // mode stack, top = active
    settings: null,       // global settings
    ff: false,            // fast-forward seen dialogue
    running: false,
    last: 0,
    playing: false,       // a campaign is loaded
  };

  function defaultSettings() {
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    return {
      lead: 'en', secondary: 'always', uiLang: 'en', spacing: true,
      textSpeed: 'normal', skipSeen: true, reducedMotion: reduce, textScale: 1, contrast: 'normal',
      vol: { master: 0.8, music: 0.55, sfx: 0.75, voice: 1 }, muted: false,
      voice: { auto: false, uri: null, rate: 0.95 }, lightbulb: true, input: 'hand',
      binds: null, touch: 'auto', strokePractice: false, romaji: true,
      // touch layout (older settings records lack these; the defaults keep the previous layout)
      touchHand: 'right', touchSize: 'normal',
      // handwriting pad reads kanji too: 'auto' (by Japanese level), 'on', 'off' (older records lack it: 'auto')
      padKanji: 'auto',
    };
  }

  // ---- mode stack ------------------------------------------------------------
  function mode() {
    return G.modes.length ? G.modes[G.modes.length - 1] : 'none';
  }
  // the current mode is mirrored on <body data-mode> so presentation (touch
  // controls, HUD) can follow it without polling
  function syncMode() {
    if (typeof document !== 'undefined' && document.body) document.body.dataset.mode = mode();
  }
  function pushMode(m) {
    G.modes.push(m);
    RB.input.clearHeld();
    syncMode();
  }
  function popMode(m) {
    const i = G.modes.lastIndexOf(m);
    if (i >= 0) G.modes.splice(i, 1);
    syncMode();
  }
  function setBase(m) {
    G.modes = [m];
    syncMode();
  }

  // ---- loop --------------------------------------------------------------------
  function loop(t) {
    const dt = Math.min(50, t - (G.last || t));
    G.last = t;
    if (G.playing && RB.world.W.map) {
      const m = mode();
      RB.world.update(dt, m === 'world');
      // play time: everything you do in a campaign — walking, talking,
      // writing, battles, lessons, the folio — while the page is visible and
      // you have touched a key, the pointer or the screen in the last five
      // minutes (a game left open does not count). It used to count walking
      // time only, so it read far less than the time actually played.
      if (!document.hidden && t - (G.lastInput || 0) < 300000) G.s.playtime += dt / 1000;
      if (m === 'world') RB.world.checkFoeContact();
    }
    RB.ui.tick && RB.ui.tick(dt, t);
    RB.render.frame(t);
    requestAnimationFrame(loop);
  }

  function onAction(a, e) {
    const m = mode();
    if (a === 'help' && G.playing) { RB.ui.help.toggle(); return; }
    if (m === 'world') {
      if (a === 'ok') RB.world.interact();
      else if (a === 'menu' || a === 'cancel') RB.ui.menu.open();
      else if (a === 'log') RB.ui.menu.open('log');
      else if (a === 'map') RB.ui.menu.open('map');
      return;
    }
    RB.ui.onAction(a, e);
  }

  // ---- boot -----------------------------------------------------------------------
  async function boot() {
    const canvas = document.getElementById('world');
    RB.ui.init();
    RB.render.init(canvas);
    await RB.save.detect();
    const saved = await RB.save.loadSettings();
    G.settings = Object.assign(defaultSettings(), saved || {});
    G.settings.vol = Object.assign(defaultSettings().vol, (saved && saved.vol) || {});
    G.settings.voice = Object.assign(defaultSettings().voice, (saved && saved.voice) || {});
    RB.input.setBinds(G.settings.binds);
    RB.input.attach(onAction);
    applySettings();
    const unlockAudio = () => {
      if (RB.audio) { RB.audio.init(); applyAudio(); }
    };
    window.addEventListener('pointerdown', unlockAudio, { capture: true });
    window.addEventListener('keydown', unlockAudio, { capture: true });
    const seen = () => { G.lastInput = performance.now(); };
    for (const ev of ['keydown', 'pointerdown', 'pointermove', 'touchstart', 'wheel']) window.addEventListener(ev, seen, { passive: true, capture: true });
    RB.bus.on('save:takenover', () => RB.ui.notice('Another tab took over this campaign. Saving is disabled in this tab.', 'warn'));
    RB.bus.on('save:conflict', () => RB.ui.notice('This campaign was saved from another tab. Saving here may overwrite it — you will be asked first.', 'warn'));
    RB.bus.on('save:error', (d) => RB.ui.notice('Autosave failed: ' + (d.error && d.error.message), 'warn'));
    G.running = true;
    requestAnimationFrame(loop);
    setBase('title');
    RB.ui.title.show();
    window.__RB_READY__ = true;
  }

  function applySettings() {
    const st = G.settings;
    document.documentElement.style.setProperty('--text-scale', String(st.textScale));
    document.body.classList.toggle('high-contrast', st.contrast === 'high');
    document.body.classList.toggle('reduced-motion', !!st.reducedMotion);
    document.body.classList.toggle('lead-ja', st.lead === 'ja');
    document.body.classList.toggle('ui-ja', st.uiLang === 'ja');
    const touch = st.touch === 'on' || (st.touch === 'auto' && typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches);
    document.body.classList.toggle('touch', touch);
    document.body.classList.toggle('touch-left', st.touchHand === 'left');
    document.body.classList.toggle('touch-large', st.touchSize === 'large');
    applyAudio();
  }
  function applyAudio() {
    if (!RB.audio || !G.settings) return;
    const v = G.settings.vol;
    RB.audio.setVolume('master', v.master);
    RB.audio.setVolume('music', v.music);
    RB.audio.setVolume('sfx', v.sfx);
    RB.audio.setVolume('voice', v.voice);
    RB.audio.setMuted(!!G.settings.muted);
    if (RB.voice) {
      if (G.settings.voice.uri) RB.voice.setVoice(G.settings.voice.uri);
      RB.voice.setRate(G.settings.voice.rate);
    }
  }
  function saveSettings() {
    applySettings();
    return RB.save.saveSettings(G.settings);
  }
  function reducedMotion() {
    return !!(G.settings && G.settings.reducedMotion);
  }
  function fastForward() {
    return G.ff || !!(RB.test && RB.test.auto);
  }
  function setFastForward(v) {
    G.ff = v;
  }

  // ---- campaign lifecycle ---------------------------------------------------------------
  async function startNewCampaign(slot, st) {
    G.s = st;
    RB.save.setCurrent(slot, 0);
    const claim = await RB.save.claim(slot);
    if (claim === 'busy') {
      const r = await RB.ui.confirm('This slot is open in another tab. Take it over? The other tab will stop saving.', ['Take over', 'Cancel']);
      if (r !== 0) return false;
      await RB.save.takeOver(slot);
    }
    G.playing = true;
    setBase('world');
    const start = RB.content.start || { map: 'rw.home', x: 3, y: 3, dir: 'down', scene: null };
    RB.world.enter(start.map, start.x, start.y, start.dir);
    // A successful campaign entry owns world rendering, regardless of caller.
    RB.input.clearHeld();
    RB.render.setOverride(null);
    st.checkpoint = { map: start.map, x: start.x, y: start.y, dir: start.dir };
    await RB.save.autosave('auto');
    RB.ui.hud.show();
    if (start.scene) RB.script.run(start.scene);
    return true;
  }

  async function loadCampaign(slot, which) {
    const r = await RB.save.read(slot, which);
    const claim = await RB.save.claim(slot);
    if (claim === 'busy') {
      const c = await RB.ui.confirm(
        'This campaign is already open in another tab. Two tabs writing the same save could lose progress.',
        ['Take over here', 'Open read-only', 'Cancel']
      );
      if (c === 2) { RB.save.releaseLock(); return false; }
      if (c === 0) await RB.save.takeOver(slot);
      else RB.save.setReadOnly(true);
    }
    // current revision of the manual record, for conflict checks
    const list = await RB.save.list();
    RB.save.setCurrent(slot, list[slot - 1].rev);
    RB.voice && RB.voice.cancel();
    G.s = r.state;
    G.playing = true;
    setBase('world');
    RB.maps.invalidate();
    RB.world.enter(G.s.map, G.s.x, G.s.y, G.s.dir);
    // Clear title/creation backdrops only after the saved map entered successfully.
    RB.input.clearHeld();
    RB.render.setOverride(null);
    RB.ui.hud.show();
    RB.ui.notice(which === 'auto' ? 'Continued from the latest autosave.' : which === 'predeparture' ? 'Restored the point before departure.' : 'Loaded.', 'info');
    return true;
  }
  async function toTitle() {
    RB.voice && RB.voice.cancel();
    RB.save.releaseLock();
    G.playing = false;
    G.s = null;
    RB.world.W.map = null;
    RB.render.setOverride(null);
    RB.ui.hud.hide();
    setBase('title');
    RB.ui.title.show();
  }

  // ---- transitions ------------------------------------------------------------------------
  let transitioning = false;
  async function transition(mapId, x, y, dir, opts) {
    if (transitioning) return;
    transitioning = true;
    opts = opts || {};
    pushMode('transition');
    try {
      RB.audio && RB.audio.sfx('door', { vol: 0.5 });
      await RB.ui.fade(true, reducedMotion() ? 80 : 220);
      const def = RB.content.maps[mapId];
      if (!def) throw new Error('unknown map ' + mapId);
      // test runs: walking out of a map while its story-state night is on, into
      // a map with no such state, is a continuity leak (see tests/e2e/pursue.mjs)
      if (RB.test && RB.test.auto && RB.world.W.map) {
        const nightHere = (RB.world.W.map.def.alt || []).some((a) => a.night && RB.state.test(G.s, a.if));
        const nightThere = (def.alt || []).some((a) => a.night && RB.state.test(G.s, a.if)) || def.region === 'interior' || def.night;
        if (nightHere && !nightThere) (RB.test.nightLeaks = RB.test.nightLeaks || []).push(RB.world.W.map.id + ' -> ' + mapId);
      }
      RB.world.enter(mapId, x, y, dir, { sp: opts.sp });
      RB.render.prewarm(); // build the new map's art while the screen is still dark
      await RB.ui.fade(false, reducedMotion() ? 80 : 220);
      if (def.name && !opts.inScript && !G.s.flags['named:' + mapId]) {
        G.s.flags['named:' + mapId] = true;
        RB.ui.placeName(def.name);
      }
    } finally {
      popMode('transition');
      transitioning = false;
    }
    if (!opts.inScript) {
      G.s.checkpoint = G.s.checkpoint && RB.content.maps[mapId].noCheckpoint ? G.s.checkpoint : { map: mapId, x: G.s.x, y: G.s.y, dir: G.s.dir };
      RB.save.autosave('auto');
      runEnterEvents();
    }
  }
  function runEnterEvents() {
    const m = RB.world.W.map;
    for (const ev of m.def.onEnter || []) {
      const key = 'enter:' + m.id + ':' + ev.scene;
      if (ev.if && !RB.state.test(G.s, ev.if)) continue;
      if (ev.once !== false && G.s.flags[key]) continue;
      G.s.flags[key] = true;
      RB.script.run(ev.scene);
      return;
    }
  }
  function afterScene() {
    if (!G.playing) return;
    if (mode() === 'world') {
      // conditional exits/props may have changed
      RB.world.unstick(RB.world.W.player);
      setTimeout(() => { if (mode() === 'world') runEnterEvents(); }, 0);
    }
  }

  // ---- battles ---------------------------------------------------------------------------
  async function startBattle(enemyId, opts) {
    opts = opts || {};
    // where the encounter happens: its backdrop and its lines follow the
    // place, not the species (a scripted battle happens where the player is)
    const W = RB.world.W;
    if (!opts.where && W && W.map && W.player) opts.where = { map: W.map.id, x: W.player.x, y: W.player.y };
    const res = await RB.combat.start(enemyId, opts);
    if (res === 'win' && opts.foeKey) G.s.flags[opts.foeKey] = true;
    if (res === 'win') {
      RB.world.refreshActors();
      if (opts.scene) await RB.script.run(opts.scene);
    }
    if (res === 'lose') {
      // Back to the last safe checkpoint; learning progress and items are kept.
      const cp = G.s.checkpoint || { map: G.s.map, x: G.s.x, y: G.s.y, dir: G.s.dir };
      G.s.resolve.pc = G.s.resolve.max;
      G.s.resolve.comp = G.s.resolve.max;
      await transition(cp.map, cp.x, cp.y, cp.dir, { inScript: true });
      RB.ui.notice('You wake at the last safe place you passed. Everything you learned is still with you.', 'info');
    }
    if (res === 'flee') RB.ui.notice('You stepped back from the encounter.', 'info');
    return res;
  }

  // ---- companions ------------------------------------------------------------------------
  async function recruit(id) {
    if (G.s.comp) return; // already committed: the lantern will not take a third name
    G.s.provisional = id === 'none' ? null : id;
    RB.world.refreshActors();
  }
  async function depart() {
    const s = G.s;
    if (s.comp || !s.provisional) return;
    // Safe recovery point BEFORE the permanent commitment.
    s.flags.predeparture_saved = true;
    await RB.save.autosave('predeparture');
    s.comp = s.provisional;
    s.provisional = null;
    s.flags.departed = true;
    s.flags['comp_' + s.comp] = true;
    RB.world.refreshActors();
    RB.world.placeCompanion();
  }
  function companionTalk() {
    const s = G.s;
    const c = s.comp;
    if (!c) return;
    const list = (RB.content.banter || []).filter((b) => b.comp === c && (!b.map || b.map === s.map || (b.map.endsWith('*') && s.map.startsWith(b.map.slice(0, -1)))) && (!b.if || RB.state.test(s, b.if)));
    const unseen = list.find((b) => !s.seen[b.scene]);
    const pick = unseen || list[Math.floor(Math.random() * list.length)];
    if (pick) RB.script.run(pick.scene);
  }
  async function rest() {
    const s = G.s;
    s.resolve.pc = s.resolve.max;
    s.resolve.comp = s.resolve.max;
    await RB.ui.fade(true, 500);
    RB.audio && RB.audio.sfx('heal');
    await new Promise((r) => setTimeout(r, 400));
    await RB.ui.fade(false, 500);
    s.checkpoint = { map: s.map, x: s.x, y: s.y, dir: s.dir };
    await RB.save.autosave('auto');
  }

  // Development/test helper: start a session-only campaign directly on a map.
  function debugStart(mapId, x, y, opts) {
    opts = opts || {};
    const st = RB.state.newCampaign(opts);
    Object.assign(st.flags, opts.flags || {});
    if (opts.comp) st.comp = opts.comp;
    G.s = st;
    RB.ui.title.hide();
    RB.render.setOverride(null);
    G.playing = true;
    setBase('world');
    RB.world.enter(mapId, x, y, opts.dir || 'down');
    RB.ui.hud.show();
    return st;
  }

  return {
    debugStart,
    get s() { return G.s; },
    set s(v) { G.s = v; },
    get settings() { return G.settings; },
    G, mode, pushMode, popMode, setBase, boot, applySettings, saveSettings, reducedMotion, fastForward, setFastForward,
    startNewCampaign, loadCampaign, toTitle, transition, afterScene, startBattle, recruit, depart, companionTalk, rest,
    defaultSettings, runEnterEvents,
  };
})();
