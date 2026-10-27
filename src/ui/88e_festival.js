/* Festival games on screen (expansion P06 for P09; plan C10, C-17, C-55; the shell's rules in
 * src/engine/72f_festival.js). One activity, 'festival', for every booth game (ctx.game names it): the game's own
 * corner first, with Practice chosen (untimed, nothing kept) and Timed offered (a clock that stops for help; your own
 * best, shown here and nowhere else). The games draw themselves (RB.ui.festivalGames[id] = { start(el, api), stop() }).
 *   api: { mode, s, words, done({ score, streak }), say(line), pause(), resume(), timeLeft() } */
var RB = (globalThis.RB = globalThis.RB || {});
RB.ui.festivalGames = RB.ui.festivalGames || {};

RB.ui.festival = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => (RB.ui.folio ? RB.ui.folio.icon(n) : '');
  const F = () => RB.festival;
  const S = () => RB.game.s;
  let V = null;

  RB.activity.register('festival', {
    title: { en: 'Festival games', jp: '{祭|まつ}り の {遊|あそ}び' },
    eligible: (s, ctx) => {
      if (!ctx || !F().get(ctx.game)) return { ok: false, why: 'That game is not here.' };
      if (!ctx.with && !ctx.venue && !s.comp) return { ok: false, why: 'There is nobody to play with here.' };
      return RB.activity.safe ? RB.activity.safe(ctx.with || ctx.venue ? {} : { companion: true }) : { ok: true };
    },
    run: (session) => run(session),
    dispose: (session) => { if (V && V.session === session) close(); },
  });

  function run(session) {
    return new Promise((resolve) => {
      const ctx = (session && session.ctx) || {};
      const d = F().get(ctx.game);
      const fr = RB.ui.folio.frame({ cls: 'fv-folio', onClose: () => leave(), closeLabel: 'Leave', closeIcon: 'back' });
      fr.setTitle(RB.ui.label(d.title.jp, d.title.en), '');
      fr.box.innerHTML = '<div class="leaf fv-leaf" tabindex="-1"></div>';
      V = { session, d, fr, leaf: fr.box.firstChild, view: 'corner', mode: 'practice', resolve, paused: 0, hidden: false };
      V.layer = { el: fr.scrim, name: 'festival', noAutofocus: true, onCancel: () => leave() };
      V.leaf.addEventListener('click', onClick);
      V.leaf.addEventListener('change', (e) => { if (e.target.name === 'fv-mode') V.mode = e.target.value; });
      V.onVis = () => { if (!V) return; if (document.hidden) pause(); else resume(); };
      document.addEventListener('visibilitychange', V.onVis);
      RB.ui.pushLayer(V.layer);
      render();
    });
  }
  function stopGame() { if (!V) return; clearInterval(V.tick); const g = RB.ui.festivalGames[V.d.ui || V.d.id]; if (g && g.stop) try { g.stop(); } catch (e) { /* the game is gone with the screen */ } }
  function close() { if (!V) return; stopGame(); document.removeEventListener('visibilitychange', V.onVis); RB.ui.popLayer(V.layer); const r = V.resolve; V = null; r({ ok: true }); }
  function leave() { if (!V) return; if (V.view === 'corner') close(); else { stopGame(); V.view = 'corner'; render(); } }

  // ---- the corner: what the game is, the two modes, your best ----------------------------------------------------
  function cornerHtml() {
    const d = V.d, p = F().peek(S(), d.id);
    return '<p class="fv-about">' + RB.ui.jhtml(d.about.jp) + '<span class="en">' + esc(d.about.en) + '</span></p>' +
      '<fieldset class="sg-level"><legend>How to play this round</legend>' +
      '<label class="opt"><input type="radio" name="fv-mode" value="practice"' + (V.mode === 'practice' ? ' checked' : '') + '><span><b>Practice</b>: untimed; nothing is kept</span></label>' +
      '<label class="opt"><input type="radio" name="fv-mode" value="timed"' + (V.mode === 'timed' ? ' checked' : '') + '><span><b>Timed</b>: ' + d.seconds + ' seconds; your own best is kept' + (d.helpPause ? '. The clock stops for up to 2.5 seconds when you press ' + esc(d.helpPause.button) + ', then runs again; ' + esc(d.helpPause.stays) : '') + '</span></label></fieldset>' +
      '<div class="sg-acts"><button type="button" class="pbtn primary" data-a="begin">' + I('next') + '<span>Begin</span></button></div>' +
      (p.timed ? '<p class="muted small">' + esc('Your best: ' + p.best + (d.streaks && p.bestStreak ? '; longest run ' + p.bestStreak : '') + '. Just for fun: nothing is won by it.') + '</p>' : '<p class="muted small">Just for fun: no score here wins anything.</p>');
  }
  function begin() {
    V.view = 'play'; V.left = V.d.seconds * 1000; V.paused = 0; V.result = null;
    V.leaf.innerHTML = '<div class="fv-bar">' + (V.mode === 'timed' ? '<span class="fv-clock" role="timer" aria-live="off"></span>' : '<span class="muted small">Practice: untimed, nothing kept</span>') + '<span class="fv-say" role="status"></span></div><div class="fv-stage"></div>';
    const g = RB.ui.festivalGames[V.d.ui || V.d.id];
    const api = {
      mode: V.mode, s: S(), def: V.d,
      done: (r) => finish(r), say: (x) => { if (!V) return; const el = V.leaf.querySelector('.fv-say'); if (el) el.innerHTML = x; },
      pause, resume, timeLeft: () => (V ? V.left : 0),
    };
    g.start(V.leaf.querySelector('.fv-stage'), api);
    if (V.mode === 'timed') {
      let last = Date.now();
      const show = () => { const el = V && V.leaf.querySelector('.fv-clock'); if (el) el.textContent = Math.ceil(V.left / 1000) + ' s' + (V.paused ? ' (stopped)' : ''); };
      show();
      V.tick = setInterval(() => {
        if (!V) return;
        const now = Date.now();
        if (!V.paused) V.left -= now - last;
        last = now;
        show();
        if (V.left <= 0) { clearInterval(V.tick); const r = g.stop ? g.stop() : null; finish(r || { score: 0, streak: 0 }); }
      }, 200);
    }
  }
  function pause() { if (V) V.paused++; }
  function resume() { if (V && V.paused > 0) V.paused--; }
  function finish(r) {
    if (!V || V.view !== 'play') return;
    clearInterval(V.tick);
    V.view = 'over';
    let note = '';
    if (V.mode === 'timed') {
      const ch = F().timedResult(S(), V.d.id, r);
      const p = F().peek(S(), V.d.id);
      note = '<p><b>' + esc(r.score + ' this round.') + '</b> ' + esc(ch && ch.newBest ? 'Your best yet.' : 'Your best: ' + p.best + '.') + (V.d.streaks && r.streak ? ' ' + esc('Longest run this round: ' + r.streak + (ch && ch.newStreak ? ' (your longest yet).' : '.')) : '') + '</p>';
    } else note = '<p><b>' + esc('Practice round over.') + '</b> ' + esc('Nothing is kept from practice.') + '</p>';
    V.leaf.insertAdjacentHTML('beforeend', '<div class="hf-over fv-over">' + note + '<div class="sg-acts"><button type="button" class="pbtn primary" data-a="again">Again</button><button type="button" class="pbtn" data-a="corner">Back</button></div></div>');
  }
  function render() { if (!V) return; if (V.view === 'corner') V.leaf.innerHTML = cornerHtml(); }
  function onClick(e) {
    if (!V) return;
    const b = e.target.closest('[data-a]');
    if (!b || b.disabled || b.tagName === 'INPUT') return;
    const a = b.dataset.a;
    if (a === 'begin' || a === 'again') { stopGame(); begin(); return; }
    if (a === 'corner') { stopGame(); V.view = 'corner'; render(); }
  }
  // !hook fest_booth <game>: a booth on the festival night or in the festival hall (the venue: no companion needed)
  RB.hooks = RB.hooks || {};
  // The booth's scene is still running when it asks, and no activity starts on top of a scene, so the game opens once
  // that scene has ended (RB.practiceA.afterScene, as the press and the desk do), with every check of RB.activity.launch
  // and its refusal said in words (the safety codes as the Distractions page words them); only in the same journey on
  // the same map, and only the latest booth's (Agnes 6446511174). A change of journey begun meanwhile cancels it too,
  // even one that does not happen: a failed or cancelled load ends the scene but keeps the journey and its map
  // (src/engine/90_game.js keepJourney; Agnes 6446894553)
  const WHY = { danger: 'Not with a creature this close.', busy: 'Not just now.', none: 'Not just now.' };
  let asked = 0;
  if (RB.bus) RB.bus.on('campaign:changing', () => { asked++; });
  RB.hooks.fest_booth = async (a) => {
    const id = a && a[0];
    if (!F().get(id)) return;
    if (RB.test && RB.test.auto) { RB.test.log.push({ t: 'activity', kind: 'festival', game: id, skipped: 'auto' }); return; }
    const s = S(), map = s && s.map, n = ++asked;
    RB.practiceA.afterScene(async () => {
      if (n !== asked || !s || S() !== s || s.map !== map) return;
      const r = await RB.activity.launch('festival', { source: 'booth', game: id, venue: true });
      if (r && !r.ok && r.why && r.why !== 'The campaign changed.') RB.ui.notice(WHY[r.why] || r.why, 'info');
    });
  };
  return { run, close, state: () => (V ? { view: V.view, mode: V.mode, left: V.left, paused: V.paused } : null) };
})();
