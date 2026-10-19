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
      // battle presentation (battle addendum §14.2): its own speed, never derived from Text speed
      // (an older record lacks them: Normal / Adaptive / Adaptive)
      battleAnim: 'normal', battleControls: 'adaptive', intentDisplay: 'adaptive', compPlan: 'ask', outcomeView: 'shown', townHints: 'on',
      // bathing scenes at the hot springs (expansion P13, R3): shown, or told in a sentence (older records: shown)
      bathScenes: 'shown',
      // Harmony portrait flourish (Harmony addendum §7.4): the paired portrait as a technique starts; presentation
      // only — Off suppresses that layer alone (older records lack it: On)
      harmonyFlourish: true,
      // light and shadow on the maps (src/engine/65_worldlook.js, C-86): presentation only (older records: On)
      worldLight: true,
      vol: { master: 0.8, music: 0.55, sfx: 0.75, voice: 1 }, muted: false,
      // music performance (MT-1, src/audio/22_ensemble.js): the procedural score, or a recorded Ensemble performance
      // of it where one exists; a device preference (older records lack it: Original)
      musicPerformance: 'original',
      // highlight: the word being spoken marked in the line and its English (PT-1c; older records lack it: On)
      // mode: 'prepared' (the recordings, else the device's voice), 'device', 'none'; player: 'none' | 'A' | 'B' and its
      // pitch 'high' | 'low' (C-83: unset reads as None); autoRec: the recordings speak each line as it appears
      voice: { auto: false, uri: null, rate: 0.95, highlight: true, mode: 'prepared', player: 'none', pitch: 'high', autoRec: true }, lightbulb: true, input: 'hand',
      binds: null, touch: 'auto', strokePractice: false, romaji: true,
      // touch layout (older settings records lack these; the defaults keep the previous layout)
      touchHand: 'right', touchSize: 'normal',
      // handwriting pad reads kanji too: 'auto' (by Japanese level), 'on', 'off' (older records lack it: 'auto')
      padKanji: 'auto',
      // quest guidance (src/engine/56_questguide.js): 'full' markers and hints, 'hints' only, 'off' objectives only
      // (older records lack it: 'full')
      questGuide: 'full',
      // cosmetic pets (docs/ADDENDUM_CONTRACTS.md): shown in exploration / in battle once one is
      // met; quiet pet sounds follow the effects volume and are never an essential cue
      petWorld: true, petBattle: true, petSounds: true,
      // the Roadside Keepsakes catalogue may hide its completion counts
      keepsakeCounts: true,
      activityChatter: 'normal', // roadside activities: 'quiet' drops incidental remarks, never rule information
      hideTotals: false,         // shiritori win/loss totals (stage receipts stay visible)
      fishSeconds: false,        // fishing pace: a numeric seconds display beside the line
      fishWait: true,            // fishing: the short waiting animation before a bite
      // the Wayfarer's Ledger as a book (expansion plan 15_INTERFACE; playbook §15A U01–U06): 'book', or 'flat' (the
      // book without depth, texture or motion). Presentation only: nothing about the journey changes. The classic folio
      // was retired when the book reached every page (U06; C-79, F-142): an older record's 'classic', or none, reads
      // as 'book'.
      ledgerStyle: 'book',
      // the edition new journeys begin in (src/engine/05a_edition.js; the development switch until the release):
      // '6' or '12' (older records lack it: six chapters)
      edition: '6',
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
    if (RB.bus && RB.bus.emit) RB.bus.emit('mode:change', mode());
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
  // The frame loop never stops: an error in one part of a frame (the world, the
  // interface, whatever the screen shows) is reported and the next frame still
  // comes. (A drawing error used to end the loop for good: the screen froze on
  // its last picture and only reloading the page brought it back.)
  let loopErrAt = -1e9;
  function loopErr(where, err) {
    const now = typeof performance !== 'undefined' ? performance.now() : 0;
    if (now - loopErrAt > 5000) { loopErrAt = now; console.error('frame (' + where + ')', err); }
  }
  function loop(t) {
    try {
      const dt = Math.min(50, t - (G.last || t));
      G.last = t;
      try {
        if (G.playing && RB.world.W.map) {
          RB.world.update(dt, mode() === 'world');
          // play time: everything you do in a campaign — walking, talking,
          // writing, battles, lessons, the folio — while the page is visible and
          // you have touched a key, the pointer or the screen in the last five
          // minutes (a game left open does not count). It used to count walking
          // time only, so it read far less than the time actually played.
          if (!document.hidden && t - (G.lastInput || 0) < 300000) G.s.playtime += dt / 1000;
          // the mode as it is now: the step just taken may have opened a scene,
          // a map change or a battle (a tap's walk ends by facing what was tapped)
          if (mode() === 'world') RB.world.checkFoeContact();
        }
      } catch (err) { loopErr('world', err); }
      try { RB.ui.tick && RB.ui.tick(dt, t); } catch (err) { loopErr('ui', err); }
      // under the Ledger the world is only glimpsed, dimmed, round the book's edges: it is drawn on one frame in four
      // there (LP-1: drawing it every frame competed with the book for the main thread); it goes on living all the
      // same (above), and every frame is drawn again the moment the Ledger closes
      const under = mode() === 'menu';
      G.underN = under ? (G.underN || 0) + 1 : 0;
      if (!under || G.underN % 4 === 1) { try { RB.render.frame(t); } catch (err) { loopErr('render', err); } }
    } finally {
      requestAnimationFrame(loop);
    }
  }

  function onAction(a, e) {
    const m = mode();
    if (a === 'help' && G.playing) { RB.ui.help.toggle(); return; }
    // an open word-help card is dismissed before anything else acts, in the world too (Back never opens the Ledger
    // from under it)
    if (a === 'cancel' && RB.ui.help && RB.ui.help.isOpen && RB.ui.help.isOpen()) { RB.ui.help.hide(true); return; }
    if (m === 'world') {
      // a sheet raised over the walking world (the New Game+ offer once the story settles) takes the keys, as it does
      // everywhere else: Back answers it rather than opening the Ledger, OK presses its button, not what is behind it
      if (RB.ui.topLayer && RB.ui.topLayer()) { RB.ui.onAction(a, e); return; }
      if (a === 'ok') RB.world.interact();
      else if (a === 'menu' || a === 'cancel') RB.ui.menu.open();
      else if (a === 'log') RB.ui.menu.open('log');
      else if (a === 'map') RB.ui.menu.open('map');
      else if (a === 'sail' && RB.ui.sail) RB.ui.sail.cycleTrim(); // at sea: set the sail (src/ui/89v_sail.js)
      return;
    }
    // in battle the menu key opens the battle's settings sheet (presentation only; src/ui/55_settings.js)
    if (a === 'menu' && m === 'combat' && RB.ui.settings && RB.ui.settings.openBattle && !RB.ui.settings.isOpen() && RB.ui.settings.openBattle()) return;
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
    document.documentElement.classList.toggle('text-large', +st.textScale >= 1.4);
    document.body.classList.toggle('high-contrast', st.contrast === 'high');
    document.body.classList.toggle('reduced-motion', !!st.reducedMotion);
    // the book (src/styles/90_book.css): every page, the dialogue and what is shown over the world; 'flat' drops its
    // texture, depth and motion. (A record from before U06 may still say 'classic': that is the book now.)
    if (st.ledgerStyle !== 'flat') st.ledgerStyle = 'book';
    document.body.classList.add('book-ui');
    document.body.classList.toggle('book-flat', st.ledgerStyle === 'flat');
    warmBookType();
    document.body.classList.toggle('lead-ja', st.lead === 'ja');
    document.body.classList.toggle('ui-ja', st.uiLang === 'ja');
    const touch = st.touch === 'on' || (st.touch === 'auto' && typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches);
    document.body.classList.toggle('touch', touch);
    document.body.classList.toggle('touch-left', st.touchHand === 'left');
    document.body.classList.toggle('touch-large', st.touchSize === 'large');
    if (RB.worldLook && RB.worldLook.applySetting) RB.worldLook.applySetting();
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
    // (anything but the two known values is Original: a stored value is never a path or a name)
    if (G.settings.musicPerformance !== 'ensemble') G.settings.musicPerformance = 'original';
    if (RB.audio.setPerformance) RB.audio.setPerformance(G.settings.musicPerformance);
    if (RB.voice) {
      if (G.settings.voice.uri) RB.voice.setVoice(G.settings.voice.uri);
      RB.voice.setRate(G.settings.voice.rate);
    }
  }
  function saveSettings() {
    applySettings();
    return RB.save.saveSettings(G.settings);
  }
  // The book's embedded type (src/ui/13_booktype.js): made into fonts once, when the browser is idle after start-up,
  // so the first page drawn in it doesn't wait on it.
  let bookTypeWarm = false;
  function warmBookType() {
    if (bookTypeWarm || !RB.bookType) return;
    bookTypeWarm = true;
    (typeof requestIdleCallback === 'function' ? requestIdleCallback : setTimeout)(() => RB.bookType.install(), { timeout: 1500 });
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
    RB.bus.emit('campaign:changing', { to: 'new' }); // an open activity is disposed first (src/engine/09_activity.js)
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
    if (RB.town) RB.town.visited(G.s, start.map); // (being in a town is a visit: its changes so far are seen)
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
    RB.bus.emit('campaign:changing', { to: 'load', slot });
    let r;
    // suspended in the Hall of a Hundred Tales (D9) after the save being loaded: resume exactly there, once
    let resumed = false;
    if (which !== 'predeparture' && which !== 'suspend') {
      try { const ls = await RB.save.list(); if (ls[slot - 1] && ls[slot - 1].suspendNewer) { which = 'suspend'; resumed = true; } } catch (e) { /* the save as asked */ }
    }
    try { r = await RB.save.read(slot, which); } catch (err) { keepJourney(); throw err; }
    // a journey from the six-chapter edition, now that the twelve-chapter one has shipped (C-54, C-84): it cannot
    // continue, so loading it explains the fresh start first and offers New Game+ from it; until the player accepts,
    // nothing is written (the save is read, never claimed or changed)
    if (RB.edition && RB.edition.isOld(r.state) && RB.ui && RB.ui.ngplus && RB.ui.ngplus.fromOld) {
      const began = await RB.ui.ngplus.fromOld(r.state, slot);
      if (!began) keepJourney();
      return began;
    }
    const claim = await RB.save.claim(slot);
    if (claim === 'busy') {
      const c = await RB.ui.confirm(
        'This campaign is already open in another tab. Two tabs writing the same save could lose progress.',
        ['Take over here', 'Open read-only', 'Cancel']
      );
      if (c === 2) { RB.save.releaseLock(); keepJourney(); return false; }
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
    if (RB.town) RB.town.visited(G.s, G.s.map); // (being in a town is a visit: its changes so far are seen)
    // Clear title/creation backdrops only after the saved map entered successfully.
    RB.input.clearHeld();
    RB.render.setOverride(null);
    RB.ui.hud.show();
    if (which === 'suspend') { try { await RB.save.dropSuspend(slot); } catch (e) { /* kept: resumed again next time */ } }
    RB.ui.notice(which === 'auto' ? 'Continued from the latest autosave.' : which === 'predeparture' ? 'Restored the point before departure.' : which === 'suspend' ? (resumed ? 'Resumed where you suspended in the Hall.' : 'Resumed.') : 'Loaded.', 'info');
    return true;
  }
  // A load that did not happen (cancelled, or the save could not be read) after the campaign
  // change had begun: a battle open then was already left (src/ui/80_combat.js abandon(), which
  // keeps 'combat' on the mode stack and the screen dark) and the scene that asked for it has
  // ended (src/engine/70_script.js), so the journey goes on from the map, where the creature
  // still is. Nothing else was changed.
  function keepJourney() {
    if (!G.playing || G.modes.indexOf('combat') < 0 || (RB.combat && RB.combat.state())) return;
    setBase('world');
    RB.input.clearHeld();
    RB.ui.dialogue.hide();
    RB.render.setOverride(null);
  }
  async function toTitle() {
    RB.bus.emit('campaign:changing', { to: 'title' });
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
      // the living world (src/engine/53_town.js): a town's routine may move on as you come back to it; never on a load
      if (RB.town) RB.town.beforeEnter(G.s, mapId, { inScript: !!opts.inScript });
      RB.world.enter(mapId, x, y, dir, { sp: opts.sp });
      if (RB.town) RB.town.visited(G.s, mapId);
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
      if (RB.town) RB.town.storyOnArrival(m.id);
      RB.script.run(ev.scene);
      return;
    }
    // a road's event (W5): the unique one until it is solved, then now and then a variant
    const re = RB.town && RB.town.roadEventAt(G.s, m.id);
    if (re && RB.content.scenes[re]) RB.script.run(re);
  }
  function afterScene() {
    if (!G.playing) return;
    if (G.s) RB.state.autoQuests(G.s);
    // the story has settled (chapter ends, quests done): src/engine/58_companion.js follows milestones here
    RB.bus.emit('story:settled', { mode: mode() });
    if (mode() === 'world') {
      // conditional exits/props may have changed
      RB.world.unstick(RB.world.W.player);
      setTimeout(() => { if (mode() === 'world') runEnterEvents(); }, 0);
    }
  }

  // ---- battles ---------------------------------------------------------------------------
  // One battle at a time. A battle is open from the moment it is asked for until
  // its screen has handed the map back (its closing fade included); while it is,
  // another is refused (null). Two battles at once shared the battle screen's
  // state: the second one came up over the map with an empty creature list and
  // the frame loop stopped (owner's report, Chapter 2, Saltglass cove).
  let battleOpen = 0, battleN = 0;
  function inBattle() { return battleOpen !== 0; }
  // a campaign changing (new, loaded, back to the title) leaves no battle open behind it
  if (RB.bus) RB.bus.on('campaign:changing', () => { battleOpen = 0; });
  async function startBattle(enemyId, opts) {
    if (battleOpen) { console.warn('a battle is already open; not starting', enemyId); return null; }
    const me = (battleOpen = ++battleN);
    opts = Object.assign({}, opts);
    // where the encounter happens: its backdrop and its lines follow the
    // place, not the species (a scripted battle happens where the player is)
    const W = RB.world.W;
    if (!opts.where && W && W.map && W.player) opts.where = { map: W.map.id, x: W.player.x, y: W.player.y };
    // While the screen is dark at the end (src/ui/80_combat.js), before the map
    // comes back: a creature you settled is gone from it, and whoever asked for
    // the battle (a creature on the map) settles its side of it.
    const closing = opts.closing;
    opts.closing = (res) => {
      if (res === 'win' && opts.foeKey && G.s) { G.s.flags[opts.foeKey] = true; RB.world.refreshActors(); }
      if (closing) closing(res);
    };
    let res = null;
    try {
      res = await RB.combat.start(enemyId, opts);
    } finally {
      if (battleOpen === me) battleOpen = 0;
      // a moment after any battle in which no creature engages (src/engine/50_world.js)
      RB.world.hush && RB.world.hush();
    }
    if (res === 'win' && opts.foeKey) G.s.flags[opts.foeKey] = true;
    // what the world keeps when a roaming creature is settled (expansion E24): only new content carries any of it
    if (res === 'win' && opts.place && RB.encounter && opts.where) {
      for (const e of RB.encounter.roamingWon(G.s, opts.place, opts.where.map)) {
        if (e.t === 'lostWord') RB.ui.toast({ kind: 'word', jp: e.jp, en: 'A lost word comes back: ' + e.en });
        else if (e.t === 'item' && RB.content.items[e.id]) RB.ui.toast({ kind: 'item', id: e.id, note: RB.equip.note(RB.content.items[e.id]) });
        else if (e.t === 'cleared') RB.ui.notice('The way is clear now: people will start using it again.', 'info');
        else if (e.t === 'stamp' && RB.content.stamps[e.id]) {
          // the Stamp Book's slip: the stamp's own design pressed onto it (src/ui/15_award.js)
          const d = RB.content.stamps[e.id];
          RB.ui.award({ kind: 'stamp', id: e.id, jp: d.title.jp, en: d.title.en, note: (d.note || d.criteria).en + ' Kept in Journey › Stamp book.', art: RB.ui.records ? RB.ui.records.stampSvg(d, 'pressed', d.title.en) : '', ink: d.design.ink });
        }
      }
    }
    if (res === 'win') {
      RB.world.refreshActors();
      if (opts.scene) await RB.script.run(opts.scene);
    }
    if (res === 'lose') {
      // Back to the last safe checkpoint; learning progress and items are kept. In an expedition, its own rule
      // (D3): an optional dungeon starts again from its entrance, everything learned kept.
      const xp = RB.expedition ? RB.expedition.onDefeat(G.s) : null;
      const cp = xp || G.s.checkpoint || { map: G.s.map, x: G.s.x, y: G.s.y, dir: G.s.dir };
      G.s.resolve.pc = G.s.resolve.max;
      G.s.resolve.comp = G.s.resolve.max;
      await transition(cp.map, cp.x, cp.y, cp.dir, { inScript: true });
      RB.ui.notice(xp ? xp.note || 'The expedition starts again from its entrance. Everything you learned is still with you, and so is the map.' : 'You wake at the last safe place you passed. Everything you learned is still with you.', 'info');
    }
    if (res === 'flee') RB.ui.notice('You stepped back from the encounter.', 'info');
    return res;
  }

  // An authored encounter (expansion P04; src/engine/97_encounter.js): with creatures, on the battle screen; a
  // conversation or a machine without them, on the encounter screen (src/ui/80s_encounter.js). Returns
  // { result: 'win' | 'end' | 'lose' | 'flee', outcome (the conclusion's id) }.
  async function startEncounter(id, opts) {
    opts = Object.assign({}, opts);
    const def = typeof id === 'string' ? RB.content.encounters[id] : id;
    if (!def) { console.warn('unknown encounter', id); return null; }
    let outcome = null, fin = null;
    const closing = opts.closing;
    opts.encounterDone = (o, f) => { outcome = o; fin = f || null; };
    // after a severe outcome, the companion and the player reflect on it in a written scene (E17, C-11)
    const reflect = async () => { if (fin && fin.reflect && RB.content.scenes[fin.reflect]) await RB.script.run(fin.reflect); };
    if (def.lead) {
      opts.encounter = def;
      opts.closing = (res) => { if (closing) closing(res); };
      const res = await startBattle(typeof def.lead === 'string' ? def.lead : def.lead.enemy, opts);
      await reflect();
      return { result: res, outcome: outcome || (res === 'win' ? 'settled' : null) };
    }
    if (battleOpen) { console.warn('a battle is already open; not starting', def.id); return null; }
    const me = (battleOpen = ++battleN);
    let res = null;
    try { res = await RB.encScreen.start(def, opts); } finally { if (battleOpen === me) battleOpen = 0; }
    await reflect();
    return { result: res ? res.result : null, outcome: res ? res.outcome : null };
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
    // a waiting topic or a rest setting first (src/engine/58_companion.js); otherwise banter
    const chat = { handled: false }; RB.bus.emit('companion:chat', chat); if (chat.handled) return;
    const list = (RB.content.banter || []).filter((b) => b.comp === c && (!b.map || b.map === s.map || (b.map.endsWith('*') && s.map.startsWith(b.map.slice(0, -1)))) && (!b.if || RB.state.test(s, b.if)));
    const unseen = list.find((b) => !s.seen[b.scene]);
    const pick = unseen || list[Math.floor(Math.random() * list.length)];
    if (pick) RB.script.run(pick.scene);
  }
  async function rest() {
    const s = G.s;
    if (RB.town) RB.town.rested(s); // routines may move on while you sleep
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
    RB.bus.emit('campaign:changing', { to: 'debug' });
    const st = RB.state.newCampaign(opts);
    Object.assign(st.flags, opts.flags || {});
    if (opts.comp) st.comp = opts.comp;
    G.s = st;
    RB.ui.title.hide();
    RB.render.setOverride(null);
    G.playing = true;
    setBase('world');
    RB.world.enter(mapId, x, y, opts.dir || 'down');
    if (RB.town) RB.town.visited(G.s, mapId); // (being in a town is a visit: its changes so far are seen)
    RB.ui.hud.show();
    return st;
  }

  return {
    debugStart,
    get s() { return G.s; },
    set s(v) { G.s = v; },
    get settings() { return G.settings; },
    G, mode, pushMode, popMode, setBase, boot, applySettings, saveSettings, reducedMotion, fastForward, setFastForward,
    startNewCampaign, loadCampaign, toTitle, transition, afterScene, startBattle, startEncounter, inBattle, recruit, depart, companionTalk, rest,
    defaultSettings, runEnterEvents,
  };
})();
