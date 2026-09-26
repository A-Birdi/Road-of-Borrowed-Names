/* Lessons: kana teaching (Foundations) with numbered stroke demonstrations
 * from real reference paths, and grammar cards. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.lessons = (function () {
  'use strict';
  const esc = RB.util.esc;

  function groups() {
    const KL = RB.kanaLessons;
    if (!KL) return [];
    return KL.groups || KL.GROUPS || (KL.all ? KL.all() : []);
  }
  function groupChars(g) {
    return (g.kana || g.chars || []).map((c) => (typeof c === 'string' ? { ch: c } : Object.assign({ ch: c.ch || c.k || c.kana }, c)));
  }
  function nextGroup(s) {
    const L = s.learn;
    L.taught = L.taught || {};
    const gs = groups();
    for (let i = 0; i < gs.length; i++) {
      const cs = groupChars(gs[i]);
      if (!cs.length) continue;
      const allTaught = cs.every((c) => L.taught[c.ch] || (L.kanaKnown === 'hira' && RB.kana.isHira(c.ch)) || L.kanaKnown === 'both');
      if (!allTaught) return { g: gs[i], i };
    }
    return null;
  }

  // Animated numbered stroke demonstration on a small canvas.
  function demo(canvas, ch) {
    const ref = RB.recog && RB.recog.reference(ch);
    const c = canvas.getContext('2d');
    const W = canvas.width;
    if (!ref) { c.fillStyle = '#fbf7ea'; c.fillRect(0, 0, W, W); return () => {}; }
    const s = W / ref.box;
    let t0 = performance.now(), raf = 0;
    const total = ref.strokes.length;
    function frame(now) {
      const k = RB.game.reducedMotion() ? total : ((now - t0) / 700) % (total + 1.5);
      c.fillStyle = '#fbf7ea'; c.fillRect(0, 0, W, W);
      c.strokeStyle = 'rgba(160,120,80,0.3)'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(W / 2, 0); c.lineTo(W / 2, W); c.moveTo(0, W / 2); c.lineTo(W, W / 2); c.stroke(); c.setLineDash([]);
      c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = Math.max(3, W / 22);
      ref.strokes.forEach((st, i) => {
        const part = Math.max(0, Math.min(1, k - i));
        if (part <= 0) return;
        const n = Math.max(2, Math.round(st.length * part));
        c.strokeStyle = i === Math.floor(k) ? '#c0392b' : '#2a2024';
        c.beginPath();
        st.slice(0, n).forEach((p, j) => (j ? c.lineTo(p.x * s, p.y * s) : c.moveTo(p.x * s, p.y * s)));
        c.stroke();
        c.fillStyle = '#c0392b';
        c.font = Math.round(W / 9) + 'px sans-serif';
        c.fillText(String(i + 1), st[0].x * s - W / 14, st[0].y * s);
      });
      if (!RB.game.reducedMotion()) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }

  function showGroup(g) {
    return new Promise((resolve) => {
      const cs = groupChars(g);
      const scrim = RB.ui.el('div', 'scrim');
      const pn = RB.ui.el('div', 'panel');
      scrim.appendChild(pn);
      const lay = { el: scrim, name: 'lesson' };
      let idx = 0;
      let stop = () => {};
      function render() {
        stop();
        const c = cs[idx];
        const rom = RB.kana.romaji(c.ch);
        const ex = (g.examples || g.words || []).filter((e) => (e.w || e.r || '').indexOf(c.ch) >= 0).slice(0, 3);
        pn.innerHTML = '<header><h2>' + esc(g.title || g.name || 'Kana') + ' — ' + (idx + 1) + ' / ' + cs.length + '</h2></header><div class="body"><div class="row" style="align-items:flex-start;gap:1.2em">' +
          '<div style="text-align:center"><div class="jp" lang="ja" style="font-size:5em;line-height:1.1">' + esc(c.ch) + '</div><div style="font-size:1.3em;color:var(--accent)">' + esc(rom) + '</div></div>' +
          '<div><canvas width="180" height="180" style="width:180px;height:180px;border-radius:8px" aria-label="Stroke order for ' + esc(c.ch) + '"></canvas><div class="small dim">Numbered strokes from the reference data. The adventure accepts readable variants; order matters only in optional practice.</div></div>' +
          '<div class="grow" style="min-width:200px">' + (c.note ? '<p>' + esc(c.note.en || c.note) + '</p>' : '') +
          (ex.length ? '<h3>In words</h3>' + ex.map((e) => '<div>' + RB.ui.jhtml(e.jp || e.w) + ' <span class="dim">' + esc(e.m || e.en || '') + '</span></div>').join('') : '') + '</div></div></div>' +
          '<div class="foot">' + (idx > 0 ? '<button class="btn" data-a="prev">◀ Back</button>' : '') + '<button class="btn" data-a="say">🔊</button><button class="btn primary" data-a="next">' + (idx < cs.length - 1 ? 'Next ▶' : 'Practise these ▶') + '</button></div>';
        stop = demo(pn.querySelector('canvas'), c.ch);
        const say = pn.querySelector('[data-a=say]');
        if (!(RB.voice && RB.voice.japaneseVoices && RB.voice.japaneseVoices().length)) say.classList.add('hidden');
      }
      pn.onclick = (e) => {
        const b = e.target.closest('[data-a]');
        if (!b) return;
        const a = b.getAttribute('data-a');
        if (a === 'say') RB.voice.speak(cs[idx].ch);
        if (a === 'prev') { idx--; render(); }
        if (a === 'next') { if (idx < cs.length - 1) { idx++; render(); } else { stop(); RB.ui.popLayer(lay); resolve(); } }
      };
      lay.onCancel = () => {};
      render();
      RB.ui.pushLayer(lay);
    });
  }

  async function run(which) {
    const s = RB.game.s;
    if (which === 'kana' || which === 'kana_next' || !which) {
      if (s.learn.profile !== 'F' || s.learn.kanaKnown === 'both') return;
      const ng = nextGroup(s);
      if (!ng) return;
      if (RB.test && RB.test.auto) { groupChars(ng.g).forEach((c) => { s.learn.taught[c.ch] = true; RB.learn.markIntroduced('k:' + c.ch); }); s.learn.kanaGroup = ng.i + 1; return; }
      RB.game.pushMode('challenge');
      try {
        await showGroup(ng.g);
        const cs = groupChars(ng.g);
        cs.forEach((c) => { s.learn.taught[c.ch] = true; RB.learn.markIntroduced('k:' + c.ch); });
        s.learn.kanaGroup = ng.i + 1;
        // one gentle practice pass over the new characters
        for (const c of RB.util.rng(ng.i + 3).shuffle(cs).slice(0, Math.min(3, cs.length))) {
          const step = RB.tasks.kanaStep(c.ch, { bare: Math.random() < 0.5 });
          step.title = 'New kana practice';
          await RB.challenge.runStep(step, { allowCancel: true, cancelLabel: 'Skip practice' });
        }
      } finally {
        RB.game.popMode('challenge');
      }
      return;
    }
  }
  // Teach every remaining group at once (used when a player switches to Foundations mid-game).
  function teachAll(s) {
    for (const g of groups()) for (const c of groupChars(g)) { s.learn.taught = s.learn.taught || {}; s.learn.taught[c.ch] = true; }
  }

  async function grammarCard(id) {
    const g = RB.grammar && (RB.grammar.get ? RB.grammar.get(id) : (RB.grammar.points || []).find((p) => p.id === id));
    if (!g) { console.warn('missing grammar point', id); return; }
    if (RB.learn.introduced('g:' + id)) return;
    RB.learn.markIntroduced('g:' + id);
    RB.learn.rec('g:' + id);
    await RB.challenge.teachCard({ title: 'Grammar: ' + RB.ui.plainJp(g.title), jp: g.title, en: g.en, ex: (g.ex || []).slice(0, 3) });
  }
  return { run, grammarCard, groups, groupChars, nextGroup, teachAll, demo };
})();
