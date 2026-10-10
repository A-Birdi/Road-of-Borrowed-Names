/* ヨーヨー釣り, water-balloon fishing (expansion P06 for P09; src/content/pastimes/50_festival.js): balloons bob in
 * a tub, each with a word and its reading; you are asked for one in English and hook the balloon that says it. In
 * practice a round is eight balloons, at your own pace; in a timed round they drift and you hook as many as you can.
 * A wrong balloon says what it is; a hint shows the word's first sound (the clock stops while it is shown). */
var RB = (globalThis.RB = globalThis.RB || {});
RB.ui.festivalGames = RB.ui.festivalGames || {};

RB.ui.festivalGames.yoyo = (function () {
  'use strict';
  const esc = RB.util.esc;
  const COLORS = ['#e2574c', '#4a90d9', '#f2c14e', '#6cbf6a', '#c06cd6', '#f28fb0'];
  let G = null;
  const words = () => RB.content.festival.yoyo.words;
  const reduced = () => !!(RB.game.reducedMotion && RB.game.reducedMotion());
  function rng(seed) { let x = (seed >>> 0) || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
  function start(el, api) {
    const seed = (RB.util.hashStr(String(api.s.id || 'fv') + '|yoyo|' + Date.now()) >>> 0) || 1;
    G = { el, api, r: rng(seed), tub: [], target: null, score: 0, streak: 0, best: 0, asked: 0, practiceOf: 8, hint: null };
    for (let i = 0; i < 6; i++) G.tub.push(newBalloon());
    pickTarget();
    el.addEventListener('click', onClick);
    draw();
  }
  function newBalloon() {
    const used = new Set(G.tub.map((b) => b.w.en));
    const pool = words().filter((w) => !used.has(w.en));
    const w = pool[Math.floor(G.r() * pool.length)];
    return { w, color: COLORS[Math.floor(G.r() * COLORS.length)], drift: (G.r() * 4).toFixed(2), id: 'b' + Math.floor(G.r() * 1e9) };
  }
  function pickTarget() { G.target = G.tub[Math.floor(G.r() * G.tub.length)].w; G.asked++; }
  function draw() {
    if (!G) return;
    const timed = G.api.mode === 'timed';
    G.el.innerHTML = '<p class="fv-ask">Hook the balloon that says <b>“' + esc(G.target.en) + '”</b>.' + (G.hint ? ' <span class="fv-hint">It begins 「' + esc(G.hint) + '」.</span>' : '') + '</p>' +
      '<div class="fv-tub' + (timed && !reduced() ? ' drift' : '') + '" role="group" aria-label="The tub">' + G.tub.map((b) =>
        '<button type="button" class="fv-balloon" data-b="' + b.id + '" style="--c:' + b.color + ';--d:' + b.drift + 's" aria-label="' + esc('A balloon') + '"><span class="fv-ball" aria-hidden="true"></span><span class="fv-label">' + RB.ui.jhtml(b.w.jp) + '</span></button>').join('') + '</div>' +
      '<div class="sg-acts"><button type="button" class="pbtn small" data-y="hint"' + (G.hint ? ' disabled' : '') + '>Hint</button>' + (timed ? '' : '<button type="button" class="pbtn small" data-y="finish">Finish</button>') +
      '<span class="muted small">' + esc(timed ? 'Hooked: ' + G.score : 'Balloon ' + Math.min(G.asked, G.practiceOf) + ' of ' + G.practiceOf) + '</span></div>';
  }
  function onClick(e) {
    if (!G) return;
    const y = e.target.closest('[data-y]');
    if (y) {
      if (y.dataset.y === 'finish') return end();
      if (y.dataset.y === 'hint' && !G.hint) {
        G.hint = RB.jp.reading(G.target.jp).replace(/\s/g, '').charAt(0);
        G.api.pause(); draw();
        G.hintTimer = setTimeout(() => { if (!G) return; G.api.resume(); G.hintShown = true; draw(); }, 2500);
      }
      return;
    }
    const b = e.target.closest('[data-b]');
    if (!b) return;
    const ball = G.tub.find((x) => x.id === b.dataset.b);
    if (!ball) return;
    if (ball.w.en === G.target.en) {
      G.score++; G.streak++; G.best = Math.max(G.best, G.streak);
      G.api.say(RB.ui.jhtml(ball.w.jp) + ' <span class="en">' + esc('Hooked: ' + ball.w.en + '.') + '</span>');
      G.tub[G.tub.indexOf(ball)] = newBalloon();
      if (G.api.mode !== 'timed' && G.asked >= G.practiceOf) return end();
      clearTimeout(G.hintTimer); if (G.hint && !G.hintShown) G.api.resume();
      G.hint = null; G.hintShown = false;
      pickTarget(); draw();
    } else {
      G.streak = 0;
      G.api.say('<span class="en">' + esc('That one says ') + '</span>' + RB.ui.jhtml(ball.w.jp) + '<span class="en">' + esc(': ' + ball.w.en + '.') + '</span>');
    }
  }
  function end() { if (!G) return null; const r = { score: G.score, streak: G.best }; const api = G.api; stop(); api.done(r); return r; }
  // the clock ran out (timed), or the screen closed: what was done
  function stop() {
    if (!G) return null;
    clearTimeout(G.hintTimer);
    const r = { score: G.score, streak: G.best };
    G.el.removeEventListener('click', onClick);
    G = null;
    return r;
  }
  return { start, stop, state: () => (G ? { target: G.target, tub: G.tub.map((b) => ({ id: b.id, en: b.w.en })), score: G.score, streak: G.streak, hint: G.hint } : null) };
})();
