/* Words › Mastery and Words › What I can do (expansion L3, L4, L5): the learning record shown honestly.
 *  - Mastery: groups (kana rows, kanji by theme, a region's words, grammar families) once most of each is met; four
 *    stars side by side (Write, Choose, Type, Listen where a device voice exists), none above another; an exam in one
 *    input type; "completed with help" kept honestly; a retake of just the assisted and missed questions.
 *  - Each item has a page: an evidence profile with its denominators, never a single percentage, never red.
 *  - What I can do: abilities shown by evidence in different situations, with help noted.
 * Stars are just for the player: they unlock nothing (Robin, C-13). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui = RB.ui || {};
RB.ui.mastery = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => RB.ui.folio.icon(n);
  const J = (m) => RB.ui.jhtml(m);
  const X = () => RB.exams;
  const V = { open: null, item: null };
  const MODE_EN = { hand: 'Write', choice: 'Choose', ime: 'Type', listen: 'Listen' };
  const PLACE_EN = { story: 'the story', battle: 'battles', field: 'field puzzles', activity: 'activities', practice: 'practice', atlas: 'the Atlas', exam: 'exams' };

  // ---- an item's page (L4) -------------------------------------------------------------------------------
  function labelOf(id) {
    const k = id.slice(0, 1), v = id.slice(2);
    if (k === 'g') { const g = RB.grammar.get(v); return g ? esc(g.title) : esc(v); }
    if (k === 'v') { const e = RB.tasks.findWord(v); return e ? J(e.w !== e.r ? '{' + e.w + '|' + e.r + '}' : e.w) + ' <span class="muted small">' + esc(e.m) + '</span>' : esc(v); }
    if (k === 'j') { const inf = RB.kanjiInfo && RB.kanjiInfo.get(v); return J(inf && inf.readings[0] ? '{' + v + '|' + inf.readings[0] + '}' : v); }
    if (k === 'k') return '<span lang="ja">' + esc(v) + '</span>';
    return esc(v);
  }
  function itemHtml(s, id) {
    const k = id.slice(0, 1), v = id.slice(2);
    let h = '<div class="ms-item"><div class="t">' + labelOf(id) + '</div>';
    if (k === 'j') {
      const K = s.learn.kanji && s.learn.kanji[v];
      if (!K) return h + '<p class="muted small">Not met in an answer yet.</p></div>';
      const words = Object.entries(K.words).sort((a, b) => b[1] - a[1]).slice(0, 6);
      h += '<p class="small">Met in ' + words.map(([w, n]) => '<span lang="ja">' + esc(w) + '</span> ×' + n).join(', ') + '.</p>' +
        '<p class="small">Handwritten in an answer: ' + (K.hand ? K.handOk + ' of ' + K.hand + ' on your own' : 'not practised yet') + (K.practice ? ' · in the chart: ' + K.practice.memory + ' from memory, ' + K.practice.traced + ' traced' : '') + '.</p>' +
        '<p class="muted small">Each reading counts on its own: meeting this kanji in one word says nothing about its other readings.</p>';
      return h + '</div>';
    }
    const p = RB.evidence.profile(s, id);
    if (!p) return h + '<p class="muted small">Not met in an answer yet.</p></div>';
    const m = p.modes;
    const row = (lab, x) => (x.tries ? x.independent + ' of ' + x.tries + ' on your own' : 'not practised');
    h += '<ul class="ms-ev small">' +
      '<li><b>Recognised:</b> ' + (p.recogRecent.of ? p.recogRecent.ok + ' of the last ' + p.recogRecent.of + ' times asked' : 'not asked yet') + '</li>' +
      '<li><b>Used in a sentence:</b> ' + row('', m.construct) + '</li>' +
      '<li><b>Typed:</b> ' + row('', m.typed) + ' · <b>Handwritten:</b> ' + row('', m.hand) + '</li>' +
      (m.listen.tries ? '<li><b>Listening practice (device voice):</b> ' + row('', m.listen) + '</li>' : '') +
      '<li><b>Where:</b> ' + (p.contexts.length ? p.contexts.map((c) => esc(PLACE_EN[c] || c)).join(', ') : 'nowhere on your own yet') + (p.transfer ? ' · used in a new kind of place ' + p.transfer + ' time' + (p.transfer > 1 ? 's' : '') : '') + '</li>' +
      (p.helped ? '<li class="muted">With help: ' + p.helped + ' of the recent attempts (that\'s fine)</li>' : '') +
      '</ul>' + (p.limited ? '<p class="muted small">Limited evidence so far.</p>' : '');
    return h + '</div>';
  }

  // ---- Mastery (L3) --------------------------------------------------------------------------------------
  function masteryHtml(s) {
    const G = X().groups(s).filter((g) => X().offered(s, g));
    const voice = !!(RB.voice && RB.voice.status && RB.voice.status().localJaCount > 0);
    const modes = X().MODES.filter((m) => m.id !== 'listen' || voice);
    let h = '<p class="ms-note">These stars are just for you: a way to see what you\'ve grasped. They don\'t unlock anything. A star in one way of answering is as bright as in any other. ' +
      'An exam is up to ten questions in one way of answering; hints stay available. A star needs fewer than 3 in 10 answered with help or after a first miss.</p>';
    if (!G.length) return h + '<p class="muted">Groups appear here once you have met most of their words, kana or kanji.</p>';
    const kinds = [['kana', 'Kana'], ['kanji', 'Kanji'], ['words', 'Words'], ['grammar', 'Grammar']];
    for (const [k, en] of kinds) {
      const L = G.filter((g) => g.kind === k);
      if (!L.length) continue;
      h += '<h3>' + esc(en) + '</h3><ul class="entries ms-groups">';
      for (const g of L) {
        const any = modes.some((m) => X().state(s, g, m.id).star);
        h += '<li class="entry"><span class="mark">' + (any ? '★' : I('practice')) + '</span><div><div class="t">' + esc(g.en) + (g.jp ? ' <span lang="ja" class="small ms-jp">' + J(g.jp) + '</span>' : '') + '</div><div class="ms-stars" role="group" aria-label="Stars for ' + esc(g.en) + '">';
        for (const m of modes) {
          const ok = X().modeOk(s, g, m.id);
          const st = X().state(s, g, m.id);
          const mark = st.star ? '★' : st.helped ? '◐' : '☆';
          const what = st.star ? 'Star' : st.helped ? 'Completed with help' : 'Not taken';
          h += '<button class="pbtn ms-star' + (st.star ? ' on' : '') + '" data-exam="' + esc(g.id) + '" data-mode="' + m.id + '"' + (ok ? '' : ' disabled') + ' aria-label="' + esc(m.en + ': ' + what + (ok ? (st.retake && !st.star ? ', retake ' + st.retake : st.star ? '' : ', take the exam') : ', no questions of this kind')) + '">' +
            '<span class="mk" aria-hidden="true">' + mark + '</span><span>' + esc(MODE_EN[m.id]) + '</span>' + (st.retake && !st.star ? '<span class="small"> · retake ' + st.retake + '</span>' : '') + '</button>';
        }
        h += '</div><button class="pbtn quiet small" data-open="' + esc(g.id) + '" aria-expanded="' + (V.open === g.id) + '">' + (V.open === g.id ? 'Hide' : 'Show') + ' its ' + g.items.length + '</button>';
        if (V.open === g.id) h += '<div class="ms-list">' + g.items.map((id) => '<button class="ms-it" data-item="' + esc(id) + '">' + labelOf(id) + '</button>').join('') + '</div>' + (V.item && g.items.indexOf(V.item) >= 0 ? itemHtml(s, V.item) : '');
        h += '</div></li>';
      }
      h += '</ul>';
    }
    return h;
  }
  async function runExam(s, gid, mode, again) {
    const g = X().groups(s).find((x) => x.id === gid);
    if (!g) return;
    const st = X().state(s, g, mode);
    const retake = !st.star && st.retake > 0;
    const ids = retake ? X().retakeItems(s, g, mode) : X().plan(s, g, mode);
    const tries = st.rec ? st.rec.tries : 0;
    const slots = [];
    for (let i = 0; i < ids.length; i++) {
      const q = X().question(s, ids[i], mode, tries + i + 1);
      if (!q) continue;
      q.title = (retake ? 'Retake · ' : 'Exam · ') + g.en + ' (' + (i + 1) + '/' + ids.length + ')';
      const r = await RB.challenge.runStep(q, { ctxTag: 'exam', mode: mode === 'listen' ? undefined : mode, cancelLabel: 'Stop the exam (nothing is kept)' });
      const res = X().slotOf(r);
      if (!res) return; // stopped: nothing recorded for the exam (the answers given stay in the learning record)
      slots.push({ item: ids[i], r: res });
    }
    const out = X().finish(s, g, mode, slots, retake);
    const msg = out.star ? (out.newStar ? 'A star: ' : 'Your star stands: ') + out.indep + ' of ' + out.n + ' on your own.' : 'Completed with help: ' + out.off + ' of ' + out.n + ' needed help or a second try. You can retake just those.';
    RB.ui.notice(msg, 'info');
    if (again) again();
  }

  // ---- What I can do (L5) -----------------------------------------------------------------------------------
  function canDoState(s, st) {
    const places = new Set();
    let ok = 0, helped = 0;
    for (const id of st.items) {
      const it = s.learn.items[id];
      if (!it) continue;
      for (const p of it.okIn || []) places.add(p);
      ok += Object.values(it.ev || {}).reduce((a, b) => a + b, 0);
      helped += (it.log || []).filter((e) => e.h).length;
    }
    return { places: places.size, ok, helped, status: places.size >= 2 ? 'shown' : ok ? 'begun' : 'notyet' };
  }
  function canDoHtml(s) {
    const T = RB.content.canDoThemes || [], L = RB.content.canDo || [];
    let h = '<p class="ms-note">Things you have shown you can do with Japanese, from your own answers in different situations. Inspired by the "can-do" statements of Japanese teaching; not a test, a level or a certificate.</p>';
    for (const th of T) {
      const list = L.filter((x) => x.theme === th.id);
      h += '<h3>' + esc(th.en) + ' <span lang="ja" class="small">' + J(th.jp) + '</span></h3><ul class="entries ms-cando">';
      for (const st of list) {
        const c = canDoState(s, st);
        const mark = c.status === 'shown' ? I('done') : c.status === 'begun' ? I('next') : '';
        h += '<li class="entry cd-' + c.status + '"><span class="mark">' + mark + '</span><div><div class="t">' + esc(st.en) + '</div><div class="small muted">' +
          (c.status === 'shown' ? 'Shown in ' + c.places + ' kinds of place' : c.status === 'begun' ? 'Begun: shown once' : 'Not yet: try it when it comes up') + (c.helped ? ' · with help ' + c.helped + ' time' + (c.helped > 1 ? 's' : '') + ' (that\'s fine)' : '') + '</div></div></li>';
      }
      h += '</ul>';
    }
    return h;
  }

  function wire(el, s, api) {
    el.onclick = async (e) => {
      const ex = e.target.closest('[data-exam]');
      if (ex && !ex.disabled) { ex.disabled = true; try { await runExam(s, ex.dataset.exam, ex.dataset.mode, () => api && api.render && api.render()); } finally { ex.disabled = false; } return; }
      const op = e.target.closest('[data-open]');
      if (op) { V.open = V.open === op.dataset.open ? null : op.dataset.open; V.item = null; if (api && api.render) api.render(); return; }
      const it = e.target.closest('[data-item]');
      if (it) { V.item = V.item === it.dataset.item ? null : it.dataset.item; if (api && api.render) api.render(); }
    };
  }
  if (RB.ui.menu && RB.ui.menu.addPage) {
    RB.ui.menu.addPage('words', {
      id: 'mastery', en: 'Mastery', jp: '{習熟|しゅうじゅく}',
      count: (s) => Object.keys((s.records && s.records.stars) || {}).length,
      html: masteryHtml, wire,
    });
    RB.ui.menu.addPage('words', {
      id: 'cando', en: 'What I can do', jp: 'できる こと',
      count: (s) => (RB.content.canDo || []).filter((x) => canDoState(s, x).status === 'shown').length,
      html: canDoHtml, wire,
    });
  }
  return { itemHtml, masteryHtml, canDoHtml, canDoState, runExam, labelOf };
})();
