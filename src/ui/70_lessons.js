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
  const known = (L, ch) => L.taught[ch] || (L.kanaKnown === 'hira' && RB.kana.isHira(ch)) || L.kanaKnown === 'both';
  function nextGroup(s) {
    const L = s.learn;
    L.taught = L.taught || {};
    const gs = groups();
    for (let i = 0; i < gs.length; i++) {
      const cs = groupChars(gs[i]);
      if (!cs.length) continue;
      if (!cs.every((c) => known(L, c.ch))) return { g: gs[i], i };
    }
    return null;
  }
  // A group with only the kana this player hasn't met (a row's kana met earlier, just in time, aren't shown twice).
  function untaughtOf(s, g) {
    const L = s.learn;
    return Object.assign({}, g, { kana: groupChars(g).filter((c) => !known(L, c.ch)) });
  }

  // Just in time (FR-1 F01/F02): the kana a story challenge's answer needs that this player hasn't met, and only
  // those, instead of a whole new row the task doesn't use. Read from the raw tier, so looking creates no record.
  function rawSteps(ch) {
    if (!ch) return [];
    if (!ch.tiers) return ch.steps || [];
    const LV = RB.tasks.LV, p = RB.game.s.learn.profile, keys = Object.keys(LV);
    for (let l = LV[p]; l >= 0; l--) { const k = keys.find((x) => LV[x] === l); if (ch.tiers[k]) return ch.tiers[k]; }
    for (let l = LV[p] + 1; l <= 3; l++) { const k = keys.find((x) => LV[x] === l); if (ch.tiers[k]) return ch.tiers[k]; }
    return [];
  }
  // the kana words a step's answer is made of: an order tile 'よん=(four)' is the word よん, meaning four
  function answerWords(st) {
    const out = [];
    const add = (t, m) => {
      const [w, gl] = String(t).split('=');
      const ww = RB.tasks.plain(w).replace(/\s+/g, '');
      if (ww) out.push({ w: ww, m: m || (gl ? gl.replace(/[()]/g, '') : '') });
    };
    if (st.kind === 'order') [].concat(st.answer || st.tiles || []).forEach((t) => add(t));
    else if (st.kind === 'write') add(st.answer, st.explain && st.explain.en);
    return out;
  }
  const JIT_MAX = 4;
  function kanaFor(s, id) {
    const L = s.learn;
    L.taught = L.taught || {};
    const order = [];
    groups().forEach((g) => groupChars(g).forEach((c) => { if (c.ch.length === 1 && !order.includes(c.ch)) order.push(c.ch); }));
    const words = [].concat(...rawSteps(RB.content.challenges[id]).map(answerWords));
    const need = new Set();
    words.forEach((x) => Array.from(x.w).forEach((ch) => { if (order.includes(ch) && !known(L, ch)) need.add(ch); }));
    return { chars: order.filter((ch) => need.has(ch)).slice(0, JIT_MAX), words };
  }
  function noteOf(ch) {
    for (const g of groups()) { const k = (g.kana || []).find((x) => (x.k || x.ch) === ch); if (k) return k.note; }
    return '';
  }

  // Animated numbered stroke demonstration on a small canvas. Plain writing
  // paper, faint quarter guides, dark ink; the stroke being drawn and the
  // stroke numbers in vermilion.
  const DEMO = { paper: '#fffaf0', guide: 'rgba(120,90,50,0.3)', ink: '#261f15', cur: '#a83e27' };
  function demo(canvas, ch) {
    const ref = RB.recog && RB.recog.reference(ch);
    const c = canvas.getContext('2d');
    const W = canvas.width;
    if (!ref) { c.fillStyle = DEMO.paper; c.fillRect(0, 0, W, W); return () => {}; }
    const s = W / ref.box;
    let t0 = performance.now(), raf = 0;
    const total = ref.strokes.length;
    function frame(now) {
      const k = RB.game.reducedMotion() ? total : ((now - t0) / 700) % (total + 1.5);
      c.fillStyle = DEMO.paper; c.fillRect(0, 0, W, W);
      c.strokeStyle = DEMO.guide; c.lineWidth = Math.max(1, W / 180); c.setLineDash([W / 45, W / 32]); c.beginPath(); c.moveTo(W / 2, 0); c.lineTo(W / 2, W); c.moveTo(0, W / 2); c.lineTo(W, W / 2); c.stroke(); c.setLineDash([]);
      c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = Math.max(3, W / 22);
      ref.strokes.forEach((st, i) => {
        const part = Math.max(0, Math.min(1, k - i));
        if (part <= 0) return;
        const n = Math.max(2, Math.round(st.length * part));
        c.strokeStyle = i === Math.floor(k) ? DEMO.cur : DEMO.ink;
        c.beginPath();
        st.slice(0, n).forEach((p, j) => (j ? c.lineTo(p.x * s, p.y * s) : c.moveTo(p.x * s, p.y * s)));
        c.stroke();
        c.fillStyle = DEMO.cur;
        c.font = '600 ' + Math.round(W / 9) + 'px sans-serif';
        c.fillText(String(i + 1), st[0].x * s - W / 14, st[0].y * s);
      });
      if (!RB.game.reducedMotion()) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }

  // One new kana per page of a lesson sheet: the character and its romaji,
  // the numbered stroke demonstration, the note, and words that use it.
  function showGroup(g) {
    return new Promise((resolve) => {
      const cs = groupChars(g);
      const I = (n) => RB.learnUi.icon(n);
      const lay = { name: 'lesson' };
      const fr = RB.learnUi.sheet({ cls: 'small lesson' });
      lay.el = fr.scrim;
      let idx = 0;
      let stop = () => {};
      function render() {
        stop();
        const c = cs[idx];
        const rom = RB.kana.romaji(c.ch);
        const ex = (g.examples || g.words || []).filter((e) => (e.w || e.r || '').indexOf(c.ch) >= 0).slice(0, 3);
        fr.setTitle((g.jp ? RB.ui.jhtml(g.jp) + ' ' : '') + esc(g.title || g.name || 'Kana'), cs.length > 1 ? 'Kana ' + (idx + 1) + ' of ' + cs.length : '');
        fr.leaf.innerHTML =
          '<ol class="lesson-row" aria-label="Kana in this lesson">' + cs.map((x, i) => '<li lang="ja"' + (i === idx ? ' aria-current="true"' : '') + '>' + esc(x.ch) + '</li>').join('') + '</ol>' +
          '<div class="lesson-main">' +
            '<figure class="lesson-char"><div class="kbig" lang="ja">' + esc(c.ch) + '</div><figcaption><span class="muted small">read</span> <b class="rom">' + esc(rom) + '</b></figcaption></figure>' +
            '<figure class="lesson-demo"><canvas width="360" height="360" role="img" aria-label="Stroke order for ' + esc(c.ch) + '"></canvas>' +
              '<figcaption class="muted small">Numbered strokes from the reference data. The adventure accepts readable variants; order matters only in optional practice.</figcaption></figure>' +
          '</div>' +
          '<div class="lesson-side">' +
          (g.lede && idx === 0 ? '<p class="lesson-lede">' + esc(g.lede) + '</p>' : '') +
          (c.note ? '<p class="lesson-note">' + RB.learnUi.mixed(c.note.en || c.note) + '</p>' : '') +
          (ex.length ? '<h3>In words</h3><ul class="lesson-ex">' + ex.map((e) => '<li>' + RB.ui.jhtml(e.jp || e.w) + '<span class="en">' + esc(e.m || e.en || '') + '</span></li>').join('') + '</ul>' : '') +
          '</div>';
        fr.foot.innerHTML = (idx > 0 ? '<button class="cbtn" data-a="prev">' + I('back') + '<span>Back</span></button>' : '') +
          '<button class="cbtn" data-a="say">' + I('sound') + '<span>Say it</span></button>' +
          '<button class="cbtn go" data-a="next" data-ok>' + '<span>' + (idx < cs.length - 1 ? 'Next' : g.doneLabel || 'Practice these') + '</span>' + I('next') + '</button>';
        stop = demo(fr.leaf.querySelector('canvas'), c.ch);
        const say = fr.foot.querySelector('[data-a=say]');
        if (!(RB.voice && RB.voice.canSayRef && RB.voice.canSayRef(RB.voice.refKey.kana(c.ch)))) say.classList.add('hidden');
        fr.leaf.scrollTop = 0;
      }
      fr.el.addEventListener('click', (e) => {
        const b = e.target.closest('[data-a]');
        if (!b || !fr.foot.contains(b)) return;
        const a = b.getAttribute('data-a');
        if (a === 'say') RB.voice.sayRef(RB.voice.refKey.kana(cs[idx].ch), cs[idx].ch);
        if (a === 'prev') { idx--; render(); }
        if (a === 'next') { if (idx < cs.length - 1) { idx++; render(); } else { stop(); RB.ui.popLayer(lay); resolve(); } }
      });
      lay.onCancel = () => {};
      render();
      RB.ui.pushLayer(lay);
    });
  }

  // !lesson kana                 the next row (only its kana not met yet), then a short practice pass
  // !lesson kana for <challenge>  just the kana that challenge's answer needs and this player hasn't met (at most
  //                               four), straight before it: the task is the practice. Nothing needed, nothing shown.
  async function run(which, args) {
    const s = RB.game.s;
    if (which === 'kana' || which === 'kana_next' || !which) {
      if (s.learn.profile !== 'F' || s.learn.kanaKnown === 'both') return;
      if (args && args[0] === 'for' && args[1]) return justInTime(s, args[1]);
      const ng = nextGroup(s);
      if (!ng) return;
      const g = untaughtOf(s, ng.g);
      if (RB.test && RB.test.auto) { groupChars(g).forEach((c) => { s.learn.taught[c.ch] = true; RB.learn.markIntroduced('k:' + c.ch); }); s.learn.kanaGroup = ng.i + 1; return; }
      RB.game.pushMode('challenge');
      try {
        await showGroup(g);
        const cs = groupChars(g);
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
  async function justInTime(s, id) {
    const { chars, words } = kanaFor(s, id);
    if (!chars.length) return;
    const mark = () => chars.forEach((ch) => { s.learn.taught[ch] = true; RB.learn.markIntroduced('k:' + ch); });
    if (RB.test && RB.test.auto) { mark(); return; }
    const g = {
      title: chars.length > 1 ? 'New kana for this task' : 'A new kana for this task',
      lede: 'This task uses ' + (chars.length > 1 ? chars.length + ' kana' : 'a kana') + ' you haven\u2019t met yet. The rest of ' + (chars.length > 1 ? 'their rows' : 'its row') + ' can wait.',
      kana: chars.map((ch) => ({ k: ch, note: noteOf(ch) })),
      words, doneLabel: 'On to the task',
    };
    RB.game.pushMode('challenge');
    try { await showGroup(g); mark(); } finally { RB.game.popMode('challenge'); }
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
    await RB.challenge.teachCard({ title: 'Grammar:', titleMixed: g.title, jpMixed: g.title, en: g.en, ex: (g.ex || []).slice(0, 3) });
  }
  return { run, grammarCard, groups, groupChars, nextGroup, kanaFor, teachAll, demo };
})();
