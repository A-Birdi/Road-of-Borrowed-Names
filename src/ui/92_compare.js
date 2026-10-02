/* One Word, Two Moments (Practice addendum §19): Words › One word, two moments, and the
 * comparison session. docs/practice/suite_b.md.
 *
 * The page lists only comparisons whose two lines the player has actually seen
 * (RB.compare.unlocked); locked ones are counted, never shown. With none unlocked it says
 * why and offers a clearly labelled sample pair of teaching examples and the other ways
 * to practise. A comparison shows both quotations exactly as frozen (speaker, where it
 * was heard), asks one short interpretation question adapted to the learning profile
 * (Foundations: translations supplied, a simpler relation question), then gives one
 * explanation, an optional bookmark of the comparison (its quotations kept as they were
 * read; shown as a historical quotation if the story text later changes) and a link to
 * the grammar point or word. Three comparisons is a suggested sitting; one is complete.
 * No score, bond or collectible. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.compare = (function () {
  'use strict';
  const U = RB.ui.pb;
  const { esc, I, J, MX } = U;
  const CM = () => RB.compare;

  // opening the translations is help: the runner records the answer as assisted
  if (typeof document !== 'undefined') {
    document.addEventListener('toggle', (e) => {
      const t = e.target;
      if (t && t.matches && t.matches('details.pb-trq') && t.open && RB.challenge && RB.challenge.active()) RB.challenge.noteHelp();
    }, true);
  }

  function quote(src, showEn, side) {
    const sp = U.speakerOf(src);
    return '<figure class="pb-quote' + (src.teach ? ' teach' : '') + '" data-side="' + side + '">' +
      '<figcaption><span class="pb-q-who">' + (src.teach ? I('book') + '<b>Teaching example</b> — nobody in the story says this' : I('companion') + esc(sp.en) + (sp.jp ? ' ' + J(sp.jp) : '')) + '</span>' +
      (src.ctx ? '<span class="pb-q-ctx">' + esc(src.ctx.en) + '</span>' : '') + '</figcaption>' +
      '<blockquote class="pb-q-jp" lang="ja">' + J(src.jp) + '</blockquote>' + (showEn ? '<div class="pb-q-en">' + esc(src.en) + '</div>' : '') + '</figure>';
  }
  function pairHtml(d, showEn) {
    return '<div class="pb-hdr pair"><div class="kind">' + esc(d.catLabel.en) + ' · ' + J(d.word.jp) + '</div>' + quote(d.a, showEn, 'A') + quote(d.b, showEn, 'B') +
      (showEn ? '' : '<details class="pb-trq"><summary>Translations <span class="aside">(counts as help)</span></summary><p><b>A</b> ' + esc(d.a.en) + '</p><p><b>B</b> ' + esc(d.b.en) + '</p></details>') + '</div>';
  }
  function stepFor(d, t) {
    const title = RB.content.practiceB.ui.compare.en, titleJp = RB.content.practiceB.ui.compare.jp;
    if (t.kind === 'write') return U.writeStep(t.replies, { title, titleJp, prompt: t.prompt, what: 'answer' });
    return U.chooseStep(t.options.map((o) => ({ jp: o.jp, en: o.en, ok: o.ok, why: o.why })), { title, titleJp, prompt: t.prompt, showEn: t.lv === 'F' || !!t.showEn });
  }

  // ---- links back to the grammar point or the word ----------------------------------------------------
  function refSheet(ref) {
    return new Promise((resolve) => {
      let title = '', body = '';
      if (ref.grammar && RB.grammar) {
        const g = RB.grammar.get(ref.grammar);
        if (g) {
          title = esc('Grammar: ') + MX(g.title);
          body = '<p>' + MX(g.en) + '</p>' + (g.pat ? '<p class="pb-pat">' + J(g.pat) + '</p>' : '') + ((g.ex || []).length ? '<h3>Examples</h3><ul class="teach-ex">' + g.ex.slice(0, 3).map((e) => '<li>' + J(e.jp) + '<span class="en">' + esc(e.en) + '</span></li>').join('') + '</ul>' : '') + (g.notes ? '<p class="muted small">' + MX(g.notes) + '</p>' : '');
        }
      } else if (ref.word && RB.lex) {
        const e = (RB.lex.bySurface(ref.word) || [])[0];
        if (e) {
          title = esc('Word: ') + J(e.w !== e.r ? '{' + e.w + '|' + e.r + '}' : e.w);
          body = '<p class="jp big">' + J(e.w !== e.r ? '{' + e.w + '|' + e.r + '}' : e.w) + '</p><p>' + esc(e.r || '') + (RB.kana ? ' · <i>' + esc(RB.kana.romaji(e.r || e.w)) + '</i>' : '') + '</p><p>' + esc(e.m || '') + '</p>' + (e.n ? '<p class="muted small">' + MX(e.n) + '</p>' : '');
        }
      }
      if (!title) { resolve(); return; }
      const S = U.sheet(title, '', { cls: 'pb-ref', closeLabel: 'Back' });
      S.leaf.innerHTML = body + '<p class="muted small">Reading this is reference only; it records nothing.</p>';
      S.foot.innerHTML = '<span class="spacer"></span><button class="cbtn go" data-pb-ok data-ok>' + I('back') + '<span>Back</span></button>';
      const done = () => { U.pop(S.lay); resolve(); };
      S.el.addEventListener('click', (ev) => { if (ev.target.closest('[data-pb-ok], [data-pb-x]')) done(); });
      S.lay.onCancel = done;
      U.push(S.lay);
    });
  }
  const refLabel = (ref) => {
    if (ref.grammar && RB.grammar && RB.grammar.get(ref.grammar)) return 'Grammar: ' + U.kana(RB.grammar.get(ref.grammar).title);
    if (ref.word) { const e = RB.lex && (RB.lex.bySurface(ref.word) || [])[0]; return 'Word: ' + (e ? e.r || e.w : ref.word); }
    return '';
  };

  // ---- after the answer: one explanation, an optional bookmark, the link -----------------------------
  function explain(session, d, t, more, recorded, r) {
    return new Promise((resolve) => {
      const s = RB.game.s;
      const S = U.sheet(J(d.word.jp) + ' ' + esc(d.catLabel.en), d.sample ? 'Sample pair (teaching examples)' : '', { cls: 'pb-explain-sheet', close: false });
      function render() {
        const marked = !!CM().rec(s).marks[d.id];
        let h = (d.sample ? '<p class="note-slip" role="note">' + I('book') + ' <b>Teaching examples</b> — not lines from the story.</p>' : '') +
          '<div class="pb-pair-small">' + quote(d.a, true, 'A') + quote(d.b, true, 'B') + '</div>' +
          '<section class="fb-ex pb-explain"><h3>' + I('bulb') + '<span>The difference</span></h3><p>' + MX(d.explain.en) + '</p></section>' +
          '<p class="muted small">' + (recorded ? 'Recorded once in your learning progress.' : r.assisted ? 'Help was used, so this is kept as practice.' : 'Kept as practice.') + ' There is no score here.</p>' +
          '<div class="row-acts"><button class="pbtn" data-pb-mark aria-pressed="' + marked + '">' + I('bookmark') + '<span>' + (marked ? 'Bookmarked' : 'Bookmark this comparison') + '</span></button>' +
          (refLabel(d.ref) ? '<button class="pbtn" data-pb-ref>' + I('book') + '<span>' + esc(refLabel(d.ref)) + '</span></button>' : '') + '</div>' +
          '<p class="pb-live sr" aria-live="polite"></p>';
        S.leaf.innerHTML = h;
        S.foot.innerHTML = '<span class="spacer"></span><button class="cbtn go" data-pb-next data-ok>' + I('next') + '<span>' + (more ? 'Next comparison' : 'Done') + '</span></button>';
      }
      const done = (v) => { U.pop(S.lay); resolve(v); };
      S.el.addEventListener('click', async (e) => {
        if (e.target.closest('[data-pb-next]')) { done(true); return; }
        if (e.target.closest('[data-pb-mark]')) {
          const had = !!CM().rec(s).marks[d.id];
          if (had) CM().unmark(s, d.id); else if (!CM().mark(s, d.id)) RB.ui.notice('Bookmarks are full (' + CM().MAX_MARKS + '). Remove one in Words › One word, two moments.', 'info');
          render();
          const live = S.leaf.querySelector('.pb-live'); if (live) live.textContent = had ? 'Bookmark removed.' : 'Bookmarked.';
          const b = S.leaf.querySelector('[data-pb-mark]'); if (b) b.focus({ preventScroll: true });
          return;
        }
        if (e.target.closest('[data-pb-ref]')) { S.lay.el.classList.add('pb-hidden'); try { await refSheet(d.ref); } finally { S.lay.el.classList.remove('pb-hidden'); } }
      });
      S.lay.onCancel = () => done(false);
      render();
      U.push(S.lay);
      setTimeout(() => { const b = S.foot.querySelector('[data-pb-next]'); if (b) b.focus({ preventScroll: true }); }, 30);
    });
  }

  const available = (s, d) => !!d && (d.sample || (CM().valid(d) && CM().seen(s, d.a) && CM().seen(s, d.b)));
  function suggest(s, n) {
    const rec = CM().rec(s), cd = RB.practiceB.cooldown(rec);
    const un = CM().unlocked(s).filter((d) => cd.allow('compare:' + d.id));
    un.sort((a, b) => (rec.done[a.id] ? 1 : 0) - (rec.done[b.id] ? 1 : 0));
    return un.slice(0, n || 3).map((d) => d.id);
  }
  async function run(session) {
    session.set('active');
    const s = RB.game.s;
    const ctx = session.ctx || {};
    const rec = CM().rec(s);
    const cd = RB.practiceB.cooldown(rec);
    let queue = ctx.pairs || (ctx.pair ? [ctx.pair] : suggest(s, 3));
    if (!queue.length) queue = ['S01'];
    let done = 0;
    for (let i = 0; i < queue.length; i++) {
      const d = CM().byId(queue[i]);
      if (!available(s, d)) continue; // checked again now: never a pair whose lines have not been seen
      const t = CM().tier(d, U.prof());
      const showEn = t.lv === 'F' || !!t.showEn;
      const step = stepFor(d, t);
      session.set('active');
      const r = await RB.challenge.runStep(step, { header: pairHtml(d, showEn), noRecord: true, ctxTag: 'comparisons', cancelLabel: 'Stop comparing' });
      if (!session.alive()) return { abandoned: true };
      if (r.cancelled) break;
      session.set('resolving');
      const objId = 'compare:' + d.id;
      const fresh = cd.allow(objId);
      const recorded = fresh ? U.assess(session, rec, objId, d.item, r, { exposed: !!(r.assisted && !r.given), sample: !!d.sample }) : (RB.practice.tally(s, 'comparisons', { n: 1, replay: 1 }), false);
      RB.practiceB.note(rec, objId, r.firstTry === false, cd);
      CM().complete(s, d.id, { prof: t.lv });
      done++;
      session.set('result');
      const next = await explain(session, d, t, i < queue.length - 1, recorded, r);
      if (!session.alive()) return { abandoned: true };
      if (!next) break;
    }
    return { compared: done };
  }
  if (RB.activity) RB.activity.register('comparisons', {
    title: RB.content.practiceB.ui.compare,
    eligible: () => RB.compare.eligible(),
    run,
    dispose: () => U.closeAll(),
  });

  // ---- Words › One word, two moments ---------------------------------------------------------------------
  function html(s) {
    try { CM().scan(s); } catch (e) { console.error('compare scan', e); }
    const rec = CM().rec(s);
    const un = CM().unlocked(s), locked = CM().locked(s);
    let h = '<p class="wd-live sr" aria-live="polite"></p><p class="muted small">Two lines you have heard on the road that turn on the same word or form — and mean different things. Only lines you have actually seen appear here; one comparison is a complete sitting, three is a good one. There is no score.</p>';
    if (!un.length) {
      h += '<div class="note-slip pb-empty" role="note">' + I('look') + ' <p><b>No comparisons yet.</b> Each one needs two particular lines from the story, and you have not yet heard both lines of any pair. ' + locked + ' comparisons are waiting for their lines.</p></div>' +
        '<div class="row-acts"><button class="pbtn" data-cmp-sample>' + I('book') + '<span>Try a sample pair (teaching examples)</span></button>' +
        '<button class="pbtn" data-cmp-ways>' + I('practice') + '<span>Other ways to practise</span></button></div>';
    } else {
      h += '<div class="row-acts"><button class="pbtn primary" data-cmp-three>' + I('practice') + '<span>Compare (up to three)</span></button></div>';
      h += '<ul class="entries pb-cmp-list">' + un.map((d) => {
        const st = rec.done[d.id] ? 'Compared' + (rec.done[d.id].replays ? ' · again ' + rec.done[d.id].replays + '×' : '') : 'New';
        return '<li class="entry"><span class="mark">' + I(rec.done[d.id] ? 'done' : 'look') + '</span><div><div class="t">' + J(d.word.jp) + ' <span class="en">' + esc(d.catLabel.en) + '</span></div>' +
          '<div class="small muted">' + esc(U.speakerOf(d.a).en) + ' and ' + esc(U.speakerOf(d.b).en) + ' · ' + esc(st) + (rec.marks[d.id] ? ' · bookmarked' : '') + '</div>' +
          '<div class="row-acts"><button class="pbtn" data-cmp="' + esc(d.id) + '">' + I('look') + '<span>Compare</span></button></div></div></li>';
      }).join('') + '</ul>';
      if (locked) h += '<p class="muted small">' + locked + ' more will appear once you have heard both of their lines.</p>';
    }
    // bookmarked comparisons, with their quotations exactly as kept
    const marks = Object.keys(rec.marks);
    if (marks.length) {
      h += '<h4 class="wd-h">' + I('bookmark') + '<span>Bookmarked comparisons</span></h4><ul class="entries pb-marks">' + marks.map((id) => {
        const m = rec.marks[id], d = CM().byId(id), st = CM().markStatus(m);
        return '<li class="entry filed"><span class="mark">' + I('bookmark') + '</span><div>' + (d ? '<div class="t">' + J(d.word.jp) + ' <span class="en">' + esc(d.catLabel.en) + '</span></div>' : '<div class="t">' + esc(id) + '</div>') +
          (st === 'historical' || !d ? '<p class="note-slip warn" role="note">' + I('warn') + ' <b>Historical quotation.</b> The story text has changed since you kept this; these are the lines as you read them then.</p>' : '') +
          m.quotes.map((q, i) => quote(q, true, i ? 'B' : 'A')).join('') +
          '<div class="row-acts"><button class="pbtn danger" data-cmp-unmark="' + esc(id) + '">' + I('trash') + '<span>Remove bookmark</span></button></div></div></li>';
      }).join('') + '</ul>';
    }
    return h;
  }
  function wire(el, s, api) {
    el.onclick = async (e) => {
      const t = e.target;
      const live = (m) => { const a = el.querySelector('.wd-live'); if (a) { a.textContent = ''; setTimeout(() => { a.textContent = m; }, 30); } };
      if (t.closest('[data-cmp-ways]')) { api.go('words', 'practice'); return; }
      const um = t.closest('[data-cmp-unmark]');
      if (um) { CM().unmark(s, um.getAttribute('data-cmp-unmark')); api.render(); live('Bookmark removed.'); return; }
      const b = t.closest('[data-cmp], [data-cmp-three], [data-cmp-sample]');
      if (!b || b.disabled) return;
      b.disabled = true;
      const ctx = { source: 'words' };
      if (b.hasAttribute('data-cmp')) ctx.pairs = [b.getAttribute('data-cmp')];
      else if (b.hasAttribute('data-cmp-sample')) ctx.pairs = ['S01'];
      const r = await RB.activity.launch('comparisons', ctx);
      if (!r.ok) { b.disabled = false; RB.ui.notice(r.why || 'Not just now.', 'info'); }
    };
  }
  if (RB.ui.menu && RB.ui.menu.addPage) {
    RB.ui.menu.addPage('words', {
      id: 'compare', en: RB.content.practiceB.ui.compare.en, jp: RB.content.practiceB.ui.compare.jp,
      count: (s) => { try { return CM().unlocked(s).length; } catch (e) { return 0; } },
      html, wire,
    });
  }
  if (RB.practice && RB.practice.addActivity) {
    RB.practice.addActivity({
      id: 'comparisons', en: RB.content.practiceB.ui.compare.en, jp: RB.content.practiceB.ui.compare.jp, icon: 'look', order: 62,
      where: RB.content.practiceB.ui.compareWhere,
      available: () => true,
      here: () => true,
      note: (s) => { const n = CM().unlocked(s).length; return n ? n + ' comparison' + (n > 1 ? 's' : '') + ' of lines you have heard.' : 'None yet: they appear as you hear their lines. A labelled sample pair is in Words.'; },
      begin: (ctx) => RB.activity.launch('comparisons', ctx),
    });
  }
  return { run, html, wire, pairHtml, quote, suggest, refSheet };
})();
