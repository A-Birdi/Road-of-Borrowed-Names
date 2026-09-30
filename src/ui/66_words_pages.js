/* Words › Kept sentences and Words › Creatures met (addendum §20), and the
 * Keep control on dialogue lines.
 *
 * Keep (RB.ui.keep):
 * - In the dialogue box a paper tab on the sheet's top edge, at the right
 *   (the speaker's tab is on the left): "Keep" / "Kept". It sits in the
 *   sheet's tab row, outside the text and outside the control row, so Next
 *   keeps its place and a press on the tab never advances the line. K keeps
 *   the line on screen from the keyboard (when K is not bound to anything).
 *   Pressing Kept again, before you have written a title or a note for it,
 *   un-keeps it; once it has your words it is removed only from its page.
 * - In Journey › Dialogue history, a Keep button on each line
 *   (src/ui/50_menu.js calls historyButton / historyClick).
 *
 * Kept sentences (Words page 'bookmarks'): each kept line with its reading
 * markup and faithful English as it was shown, who said it or what it was
 * written on, where, and when; your own title and note (plain text, set apart
 * from the game's words); Hear it through the device's local Japanese voice
 * when there is one; Remove; optional practice of its words (the game's
 * recognition template, recorded nowhere). A noted word (Words › Words you
 * noted) lists the kept sentences that use it — never a line you have not
 * seen. A kept line whose source has changed or gone is marked as a saved
 * excerpt.
 *
 * Other pages (evidence, memories) link to an entry with
 * RB.ui.wordsPages.show('bookmarks' | 'creatures', id).
 *
 * Creatures met (Words page 'creatures'): each creature you have encountered,
 * drawn with its own battle art, its name and reading, where you met it
 * (indoors or out, and near where), what you saw it do and what answered it,
 * how it changed, and how it settled. Only what happened; no counts. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.keep = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => RB.ui.folio.icon(n);
  const F = RB.ui.folio;
  // two icons of our own for the folio set
  if (F && F.ICONS) {
    if (!F.ICONS.bookmark) F.ICONS.bookmark = '<path d="M7 3h10v18l-5-4.2L7 21z"/><path d="M10 7h4"/>';
    if (!F.ICONS.creature) F.ICONS.creature = '<path d="M4 15c2-6 6-9 10-8 3 .7 5 3 6 6-2-1-4-1-5 0 1 2 0 5-3 6-3 .8-6-.5-8-4z"/><circle cx="14.5" cy="10.5" r="1"/>';
  }
  let tab = null, box = null, entry = null, told = false;
  const say = (msg) => { if (RB.ui.notice) RB.ui.notice(msg, 'info'); };
  // a quiet announcement for screen readers (the tab's own label says Keep / Kept)
  function announce(msg) {
    if (typeof document === 'undefined' || !RB.ui.root) return;
    let a = document.getElementById('keep-live');
    if (!a) { a = document.createElement('div'); a.id = 'keep-live'; a.className = 'sr'; a.setAttribute('aria-live', 'polite'); RB.ui.root.appendChild(a); }
    a.textContent = '';
    setTimeout(() => { a.textContent = msg; }, 30);
  }
  const hasUserText = (b) => !!(b && (b.title || b.note));

  // ---- the dialogue box's Keep tab ----------------------------------------------------------------
  function attach(b) {
    try {
      if (tab || !b) return;
      box = b;
      tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'dlg-keep hidden';
      tab.setAttribute('aria-pressed', 'false');
      tab.title = 'Keep this sentence (K)';
      tab.innerHTML = I('bookmark') + '<span class="kl">Keep</span>';
      // its own press: never the text's (which advances) and never Next's
      tab.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
      box.insertBefore(tab, box.querySelector('.dlg-sheet'));
    } catch (err) { console.error('keep tab', err); }
  }
  // A line is on screen (and its dialogue-history entry has just been added).
  function line(l, e) {
    try {
      entry = e || null;
      if (e && RB.bookmarks) RB.bookmarks.capture(l, e, RB.game.s);
      sync();
    } catch (err) { console.error('keep line', err); }
  }
  function chose(op) {
    try { if (RB.bookmarks) RB.bookmarks.chose(op, RB.game.s); } catch (err) { console.error('keep reply', err); }
  }
  function sync() {
    if (!tab) return;
    const s = RB.game.s;
    const ok = !!(s && entry && RB.bookmarks && RB.bookmarks.eligible(entry));
    tab.classList.toggle('hidden', !ok);
    if (box) box.classList.toggle('has-keep', ok);
    if (!ok) return;
    const kept = !!RB.bookmarks.find(s, entry);
    tab.classList.toggle('kept', kept);
    tab.setAttribute('aria-pressed', kept ? 'true' : 'false');
    tab.querySelector('.kl').textContent = kept ? 'Kept' : 'Keep';
    tab.setAttribute('aria-label', kept ? 'Kept — in Words, Kept sentences' : 'Keep this sentence');
  }
  // keep or un-keep a history entry; returns 'kept' | 'removed' | 'held' | 'full' | null
  function toggleEntry(s, e) {
    const B = RB.bookmarks;
    const had = B.find(s, e);
    if (had) {
      if (hasUserText(had)) { say('This kept sentence has your own words with it: remove it from Words › Kept sentences.'); return 'held'; }
      B.remove(s, had.id);
      announce('No longer kept.');
      return 'removed';
    }
    const r = B.keep(s, e);
    if (!r.ok) { if (r.why === 'full') say('Your kept sentences are full (' + r.max + '). Remove one in Words › Kept sentences to keep another.'); return r.why === 'full' ? 'full' : null; }
    RB.audio && RB.audio.sfx && RB.audio.sfx('cursor', { vol: 0.5 });
    // where to find it, once a session; after that the label says it
    if (!told) { told = true; say('Kept. Find it in Words › Kept sentences.'); } else announce('Kept.');
    return 'kept';
  }
  function toggle() {
    try {
      const s = RB.game.s;
      if (!s || !entry || !RB.bookmarks.eligible(entry)) return;
      toggleEntry(s, entry);
      sync();
    } catch (err) { console.error('keep', err); }
  }
  // K keeps the line on screen (only while the dialogue is the top thing, and
  // only when K is not one of the player's bound keys)
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', (e) => {
      if (e.code !== 'KeyK' || e.repeat || e.altKey || e.ctrlKey || e.metaKey || e.isComposing) return;
      const t = e.target, tag = t && t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
      if (!RB.ui.dialogue || !RB.ui.dialogue.isOpen() || (RB.ui.topLayer && RB.ui.topLayer())) return;
      const binds = RB.input && RB.input.getBinds ? RB.input.getBinds() : {};
      for (const a in binds) if ((binds[a] || []).indexOf('KeyK') >= 0) return;
      if (!tab || tab.classList.contains('hidden')) return;
      e.preventDefault();
      toggle();
    });
  }

  // ---- Journey › Dialogue history (50_menu.js) ------------------------------------------------------
  function historyButton(s, l) {
    try {
      if (!RB.bookmarks || !RB.bookmarks.eligible(l)) return '';
      const i = s.backlog.lastIndexOf(l);
      if (i < 0) return '';
      const kept = !!RB.bookmarks.find(s, l);
      return '<button type="button" class="pbtn hkeep' + (kept ? ' kept' : '') + '" data-hkeep="' + i + '" aria-pressed="' + kept + '" aria-label="' + (kept ? 'Kept — in Words, Kept sentences' : 'Keep this sentence') + '">' +
        I('bookmark') + '<span>' + (kept ? 'Kept' : 'Keep') + '</span></button>';
    } catch (err) { console.error('keep history', err); return ''; }
  }
  function historyClick(e) {
    const b = e.target && e.target.closest && e.target.closest('[data-hkeep]');
    if (!b) return false;
    try {
      const s = RB.game.s, l = s.backlog[+b.getAttribute('data-hkeep')];
      if (!l) return true;
      toggleEntry(s, l);
      const kept = !!RB.bookmarks.find(s, l);
      b.classList.toggle('kept', kept);
      b.setAttribute('aria-pressed', kept ? 'true' : 'false');
      b.setAttribute('aria-label', kept ? 'Kept — in Words, Kept sentences' : 'Keep this sentence');
      b.querySelector('span').textContent = kept ? 'Kept' : 'Keep';
      if (entry === l) sync();
    } catch (err) { console.error('keep history', err); }
    return true;
  }

  return { attach, line, chose, sync, toggle, historyButton, historyClick, _entry: () => entry };
})();

RB.ui.wordsPages = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => RB.ui.folio.icon(n);
  const j = (t, vars) => (t ? RB.ui.jhtml(t, vars ? { vars } : undefined) : '');
  const TX = () => RB.content.wordsText || { pages: {}, heads: {}, setting: {}, objects: {} };
  const lab = (x) => (x ? RB.ui.label(x.jp, x.en) : '');
  const head = (k, icon) => { const h = TX().heads[k]; return '<h4 class="wd-h">' + I(icon) + '<span>' + lab(h) + '</span></h4>'; };
  const date = (t) => { try { return new Date(t).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); } catch (e) { return ''; } };
  // player-authored text: always escaped, always marked as the player's own
  const utext = (t, cls) => '<span class="utext' + (cls ? ' ' + cls : '') + '">' + esc(t).replace(/\n/g, '<br>') + '</span>';
  // the folio re-draws a page on change: put the keyboard back where it was
  function again(api, sel) {
    api.render();
    if (!sel) return;
    const el = document.querySelector('#folio-page ' + sel);
    if (el) el.focus({ preventScroll: false });
  }
  function live(msg) {
    let a = document.querySelector('#folio-page .wd-live');
    if (!a) return;
    a.textContent = '';
    setTimeout(() => { a.textContent = msg; }, 30);
  }

  // =================================================================================================
  // Kept sentences
  // =================================================================================================
  const B = () => RB.bookmarks;
  const PAGE = 40;
  function speakerLine(b) {
    const T = TX();
    if (b.who === 'narr') {
      if (b.obj) { const o = T.objects[b.obj] || T.thing; return { icon: 'look', html: lab(o), sr: 'Written on or seen: ' + o.en }; }
      return { icon: 'scroll', html: lab(T.narration), sr: 'Narration' };
    }
    const n = b.wn || { en: b.who, jp: '' };
    // the player's name is their own text (escaped); a character's name is the game's
    if (b.who === 'pc') return { icon: 'companion', html: (b.choice ? 'You replied' : 'You') + ' <span class="muted">(' + utext(n.en, 'nm') + ')</span>', sr: '' };
    return { icon: 'companion', html: esc(n.en) + (n.jp ? ' <span class="wd-jpn">' + j(n.jp) + '</span>' : ''), sr: '' };
  }
  function placeHtml(b) {
    const p = b.place;
    return p ? esc(p.en) + (p.jp ? ' <span class="wd-jpn">' + j(p.jp) + '</span>' : '') : '<span class="muted">not recorded</span>';
  }
  function statusHtml(b) {
    const st = B().status(b);
    let h = '';
    if (st === 'changed' || st === 'removed') {
      h += '<p class="note-slip warn bm-excerpt" role="note">' + I('warn') + ' <b>Saved excerpt.</b> ' +
        (st === 'removed' ? 'Where this line came from is no longer in the game.' : 'The line where this came from has changed since you kept it.') +
        ' This is the text exactly as you kept it.</p>';
    }
    if (b.approx) h += '<p class="muted small bm-approx">Kept from a history line recorded before sentences could be kept: any names in it are shown as they are now.</p>';
    return h;
  }
  function noted(s) { return (s.notebook || []).filter((n) => n.kind === 'word'); }
  function notedHtml(n) {
    const hasKanji = /[一-鿿々]/.test(n.surface || '');
    return j(hasKanji && n.reading ? '{' + n.surface + '|' + n.reading + '}' : n.surface || '');
  }
  function bmRow(b, open, s) {
    const who = speakerLine(b);
    const title = b.title ? '<span class="bm-title">' + I('note') + '<span class="sr">Your title: </span>' + utext(b.title) + '</span>' : '';
    return '<li class="bm-item' + (open ? ' open' : '') + '"><button type="button" class="entry bm-row" data-bm-open="' + esc(b.id) + '" aria-expanded="' + open + '">' +
      '<span class="mark">' + I('bookmark') + '</span><span class="body">' + title +
      '<span class="bm-jp">' + j(b.jp, b.v) + '</span><span class="bm-en">' + esc(b.en) + '</span>' +
      '<span class="kind">' + (who.sr ? '<span class="sr">' + esc(who.sr) + ' — </span>' : '') + '<span aria-hidden="' + (who.sr ? 'true' : 'false') + '">' + who.html + '</span> · ' + placeHtml(b) + '</span></span></button>' +
      (open ? bmDetail(b, s) : '') + '</li>';
  }
  function bmDetail(b, s) {
    const who = speakerLine(b);
    const canSpeak = RB.voice && RB.voice.status && RB.voice.status().localJaCount > 0;
    const words = B().wordsOf(b).filter((w) => w.entry && w.entry.m && ['prt', 'aux', 'suf', 'cop'].indexOf(w.entry.pos) < 0);
    const uniq = [];
    for (const w of words) if (!uniq.some((u) => u.entry.w === w.entry.w)) uniq.push(w);
    const practice = B().practiceSteps(b, 1).length > 0;
    const id = esc(b.id);
    let h = '<div class="bm-detail inline-detail" role="region" aria-label="Kept sentence">';
    h += '<dl class="bm-meta">' +
      '<dt>' + (b.who === 'narr' ? (b.obj ? 'Read on' : 'From') : 'Said by') + '</dt><dd>' + I(who.icon) + ' ' + who.html + '</dd>' +
      '<dt>Where</dt><dd>' + I('map') + ' ' + placeHtml(b) + '</dd>' +
      '<dt>Kept</dt><dd>' + esc(date(b.t)) + '</dd></dl>';
    h += statusHtml(b);
    if (uniq.length) {
      h += '<div class="bm-words"><div class="kind">Words in it</div><ul class="bm-wl">' + uniq.slice(0, 8).map((w) =>
        '<li><span class="bm-w">' + j(w.entry.w !== w.entry.r ? '{' + w.entry.w + '|' + w.entry.r + '}' : w.entry.w) + '</span> <span class="muted">' + esc(w.entry.m) + '</span></li>').join('') + '</ul></div>';
    }
    // the player's own words, set apart from the game's
    h += '<div class="bm-user" role="group" aria-label="Your own words for this sentence">' + head('yours', 'note') +
      '<form class="bm-form" data-bm-form="title" data-id="' + id + '"><label for="bmt-' + id + '">Your title <span class="muted small">(up to ' + B().TITLE_MAX + ' characters)</span></label>' +
      '<div class="bm-in"><input id="bmt-' + id + '" type="text" maxlength="' + B().TITLE_MAX + '" autocomplete="off" spellcheck="false" value="' + esc(b.title || '') + '">' +
      '<button type="submit" class="pbtn" data-bm-save="title">Save title</button></div></form>' +
      '<form class="bm-form" data-bm-form="note" data-id="' + id + '"><label for="bmn-' + id + '">Your note <span class="muted small">(up to ' + B().NOTE_MAX + ' characters)</span></label>' +
      '<textarea id="bmn-' + id + '" rows="3" maxlength="' + B().NOTE_MAX + '" spellcheck="false">' + esc(b.note || '') + '</textarea>' +
      '<div class="bm-in end"><button type="submit" class="pbtn" data-bm-save="note">Save note</button></div></form></div>';
    h += '<div class="acts bm-acts">' +
      (canSpeak ? '<button type="button" class="pbtn" data-bm-hear="' + id + '">' + I('sound') + '<span>Hear it</span></button>' : '') +
      (practice ? '<button type="button" class="pbtn" data-bm-practice="' + id + '">' + I('practice') + '<span>Practise its words</span></button>' : '') +
      '<button type="button" class="pbtn danger" data-bm-remove="' + id + '">' + I('trash') + '<span>Remove</span></button></div>';
    if (practice) h += '<p class="muted small">Practice here is optional and just for you: it is not counted in your learning record.</p>';
    if (!canSpeak) h += '<p class="muted small">No Japanese voice on this device, so there is nothing to play; the sentence is kept all the same.</p>';
    return h + '</div>';
  }
  // another page may link here: show('bookmarks' | 'creatures', id) opens the folio at that entry
  const pending = { bm: null, cr: null };
  function show(kind, id) {
    if (kind === 'creatures') pending.cr = id || null; else pending.bm = id || null;
    RB.ui.menu.open(kind === 'creatures' ? 'creatures' : 'bookmarks');
  }
  function bmHtml(s, api) {
    const V = api.view;
    if (pending.bm) { V.bmOpen = pending.bm; V.bmWord = null; V.bmLimit = PAGE; pending.bm = null; }
    const L = (s.bookmarks || []).filter((b) => b && typeof b.jp === 'string');
    let h = '<p class="wd-live sr" aria-live="polite"></p>';
    if (!L.length) {
      return h + '<p class="muted">Nothing kept yet.</p><p>Press <b>Keep</b> on the tab above a line in the dialogue box (or <kbd>K</kbd>), or <b>Keep</b> beside a line in Journey › Dialogue history. Signs, notices and tablets you read can be kept the same way.</p>' +
        '<p class="muted small">A kept sentence stays as it was when you saw it, with your own title and note if you like. Keeping one records nothing about your learning.</p>';
    }
    // noted words that these sentences use (only sentences you kept)
    const nt = noted(s), idx = nt.length ? B().wordIndex(s) : null;
    const nw = nt.map((n) => ({ n, uses: B().usesOf(s, n, idx) })).filter((x) => x.uses.length);
    if (V.bmWord && !nw.some((x) => x.n.id === V.bmWord)) V.bmWord = null;
    if (nw.length) {
      h += '<div class="bm-filter">' + head('words', 'words') + '<div class="bm-chips" role="group" aria-label="Show the kept sentences that use a word you noted">' +
        '<button type="button" class="bm-chip" data-bm-word="" aria-pressed="' + !V.bmWord + '">All <span class="n">' + L.length + '</span></button>' +
        nw.map((x) => '<button type="button" class="bm-chip" data-bm-word="' + esc(x.n.id) + '" aria-pressed="' + (V.bmWord === x.n.id) + '"><span class="jp">' + notedHtml(x.n) + '</span> <span class="n">' + x.uses.length + '</span></button>').join('') + '</div></div>';
    }
    let shown = L.slice().reverse();
    if (V.bmWord) {
      const x = nw.find((y) => y.n.id === V.bmWord);
      shown = x.uses.slice().reverse();
      h += '<p class="muted small bm-for">Kept sentences that use <span class="jp">' + notedHtml(x.n) + '</span> (' + esc(x.n.m || '') + '): ' + shown.length + '.</p>';
    }
    h += '<p class="muted small">Newest first. ' + L.length + ' of at most ' + B().MAX + ' kept.</p>';
    // a page of them at a time (a full notebook would otherwise redraw hundreds of lines on every press)
    let limit = V.bmLimit || PAGE;
    const at = V.bmOpen ? shown.findIndex((b) => b.id === V.bmOpen) : -1;
    if (at >= limit) limit = Math.ceil((at + 1) / PAGE) * PAGE;
    V.bmLimit = limit;
    h += '<ol class="entries bm-list">' + shown.slice(0, limit).map((b) => bmRow(b, V.bmOpen === b.id, s)).join('') + '</ol>';
    if (shown.length > limit) h += '<div class="row-acts"><button type="button" class="pbtn" data-bm-more>' + I('down') + '<span>Show older ones (' + Math.min(PAGE, shown.length - limit) + ' more of ' + (shown.length - limit) + ')</span></button></div>';
    return h;
  }
  async function practise(s, id) {
    const b = B().byId(s, id);
    if (!b) return;
    const steps = B().practiceSteps(b, 3);
    if (!steps.length) return;
    RB.ui.menu.close();
    RB.game.pushMode('challenge');
    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]; // no learning item: nothing is recorded (and noRecord below)
        step.title = 'Words from a kept sentence ' + (i + 1) + ' / ' + steps.length + ' (optional)';
        const header = '<div class="bm-ctx"><div class="kind">From your kept sentence</div>' + j(b.jp, b.v) + '</div>';
        const r = await RB.challenge.runStep(step, { header, noRecord: true, ctxTag: 'bookmark', cancelLabel: 'Stop practising' });
        if (r.cancelled) break;
      }
    } finally {
      RB.game.popMode('challenge');
    }
    RB.ui.menu.open('bookmarks');
  }
  function bmWire(el, s, api) {
    const V = api.view;
    el.onclick = async (e) => {
      const t = e.target;
      const op = t.closest('[data-bm-open]');
      if (op) { const id = op.getAttribute('data-bm-open'); V.bmOpen = V.bmOpen === id ? null : id; again(api, '[data-bm-open="' + id + '"]'); return; }
      const w = t.closest('[data-bm-word]');
      if (w) { V.bmWord = w.getAttribute('data-bm-word') || null; V.bmOpen = null; V.bmLimit = PAGE; again(api, '[data-bm-word="' + (V.bmWord || '') + '"]'); return; }
      if (t.closest('[data-bm-more]')) {
        const n = el.querySelectorAll('.bm-list > li').length;
        V.bmLimit = (V.bmLimit || PAGE) + PAGE;
        api.render();
        // the keyboard goes to the first of the newly shown ones
        const next = document.querySelectorAll('#folio-page .bm-list > li .bm-row')[n];
        if (next) next.focus({ preventScroll: false });
        return;
      }
      const hr = t.closest('[data-bm-hear]');
      if (hr) {
        const b = B().byId(s, hr.getAttribute('data-bm-hear'));
        if (b && RB.voice) {
          const vars = Object.assign({}, RB.script.jpVars(), b.v || {});
          const ch = RB.content.chars[b.who];
          RB.voice.speak(RB.jp && RB.jp.reading ? RB.jp.reading(b.jp, vars) : RB.ui.plainJp(b.jp), { pitch: ch && ch.voice ? ch.voice.pitch : 1 });
        }
        return;
      }
      const pr = t.closest('[data-bm-practice]');
      if (pr) { await practise(s, pr.getAttribute('data-bm-practice')); return; }
      const rm = t.closest('[data-bm-remove]');
      if (rm) {
        const id = rm.getAttribute('data-bm-remove'), b = B().byId(s, id);
        if (!b) return;
        const r = await RB.ui.confirm('Remove this kept sentence?' + (hasUser(b) ? ' Your title and note go with it.' : ''), ['Remove', 'Keep it'], { danger: true });
        if (r !== 0) { const back = document.querySelector('#folio-page [data-bm-remove="' + id + '"]'); if (back) back.focus(); return; }
        B().remove(s, id);
        V.bmOpen = null;
        RB.ui.keep.sync();
        again(api, '.bm-list .bm-row, [data-bm-word], .leaf');
        live('Removed.');
      }
    };
    el.onsubmit = (e) => {
      const f = e.target.closest('[data-bm-form]');
      if (!f) return;
      e.preventDefault();
      const id = f.getAttribute('data-id'), kind = f.getAttribute('data-bm-form');
      const v = f.querySelector(kind === 'title' ? 'input' : 'textarea').value;
      const b = kind === 'title' ? B().rename(s, id, v) : B().setNote(s, id, v);
      if (!b) return;
      again(api, kind === 'title' ? '#bmt-' + cssId(id) : '#bmn-' + cssId(id));
      live(kind === 'title' ? (b.title ? 'Title saved.' : 'Title cleared.') : (b.note ? 'Note saved.' : 'Note cleared.'));
    };
  }
  const hasUser = (b) => !!(b.title || b.note);
  const cssId = (id) => (typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(id) : id.replace(/[^\w-]/g, '\\$&'));

  // =================================================================================================
  // Creatures met
  // =================================================================================================
  const INTENT_ICON = { strike: 'strike', sweep: 'sweep', heat: 'flame', shroud: 'cloud', charge: 'hourglass', gust: 'gust', mend: 'needle', lie: 'mask', plea: 'history', rest: 'rest', flood: 'waves', chill: 'snow', silence: 'mute', mirror: 'mirror' };
  // the move's name and what it is, as the battle's own help puts it (RB.combatHelp)
  function moveTitle(kind, s) {
    const L = RB.combatLogic;
    const it = Object.assign({ key: kind, kind }, (L && L.INTENTS[kind]) || { label: kind });
    try {
      const st = { compId: s.comp || null, foes: [{ soften: 0, drawn: false }], cur: 0, diff: L.DIFF.normal, heat: 0, knots: 1, maxKnots: 1, ward: { pc: 0, comp: 0 }, charged: false };
      const inf = RB.combatHelp.intentInfo(st, it, []);
      return inf && inf.title ? inf.title : it.label;
    } catch (e) { return it.label; }
  }
  const compName = (id) => (RB.content.chars[id] ? RB.content.chars[id].name.en : 'your companion');
  function howHtml(how) {
    if (!how) return '';
    if (how.startsWith('comp:')) return esc(compName(how.slice(5)));
    if (how.startsWith('tech:')) { const T = RB.combatLogic.TECHS[how.slice(5)]; return T ? esc(T.name) + ' (with ' + esc(compName(how.slice(5))) + ')' : 'a coordinated technique'; }
    if (how === 'answer') return '<b>Answer</b> (<span lang="ja">こたえる</span>)';
    if (how === 'truth') return '<b>See through</b> (<span lang="ja">みぬく</span>)';
    if (how === 'unravel') return '<b>Unravel</b>';
    const w = RB.content.words[how];
    return w ? '<span class="cm-w">' + j(w.jpK || w.jp) + '</span> (' + esc(w.en) + ')' : esc(how);
  }
  // one observation, in words taken from the battle's own messages
  function noteHtml(key, n, c) {
    const p = key.split(':');
    const how = p.slice(2).join(':');
    let h = '';
    switch (p[0]) {
      case 'i': h = 'It showed this move.'; break;
      case 's': h = ({ heat: 'Left unanswered, it overheated: its blows hit harder until it was cooled.', shroud: 'Left unanswered, mist hid its knots.', charge: 'Left unanswered, it gathered force for a harder blow.', silence: 'Left unanswered, sound drained out of the air: you were Hushed.', stripWard: 'Its gust tore your wards away.', mend: 'It tied a loosened knot back up.' })[p[1]] || ''; break;
      case 'a': h = (p[1] === 'strike' && RB.content.words[how] && (RB.content.words[how].tags || []).indexOf('ward') >= 0 ? 'A ward in front of the one it aimed at blocked it: ' : how.startsWith('comp:') ? 'Its move came to nothing, thanks to ' : 'Answered with ') + howHtml(how) + '.'; break;
      case 'c': h = ({ heat: 'Its Heat was cooled by ', shroud: 'Its mist was cleared by ', charge: 'The force it gathered was spilled by ' })[p[1]] + howHtml(how) + '.'; break;
      case 'w': h = 'A standing ward soaked some of its blow.'; break;
      default: h = '';
    }
    const where = c && Object.keys(c.maps || {}).length > 1 && n.m && c.maps[n.m] && c.maps[n.m].name ? ' <span class="muted small">(seen at ' + esc(c.maps[n.m].name.en) + ')</span>' : '';
    return h ? '<li>' + h + where + '</li>' : '';
  }
  function lineHtml(l) {
    if (!l) return '';
    const who = l.who && l.who !== 'narr' && RB.content.chars[l.who] ? '<span class="kind">' + esc(RB.content.chars[l.who].name.en) + '</span>' : '';
    return '<div class="cm-line">' + who + (l.jp ? '<div class="cm-jp">' + j(l.jp) + '</div>' : '') + (l.en ? '<div class="cm-en">' + esc(RB.script.enVars(l.en)) + '</div>' : '') + '</div>';
  }
  // the first place where its opening line was seen: { k, intro, ... } or null
  function firstSight(c) {
    const ps = Object.keys(c.maps || {}).map((k) => Object.assign({ k }, c.maps[k])).sort((a, b) => (a.t || 0) - (b.t || 0));
    return ps.find((p) => p.intro) || null;
  }
  function artAlt(id, c) {
    const f = firstSight(c);
    const nm = (c.name && c.name.en) || id;
    return 'Picture of the ' + nm + ' as it looks in battle' + (f && f.intro && f.intro.en ? '. First seen: ' + RB.script.enVars(f.intro.en) : '.');
  }
  function crRow(id, c, open, s) {
    const d = RB.content.enemies[id];
    const nm = c.name || (d && d.name) || { en: id, jp: '' };
    const places = Object.keys(c.maps || {}).map((k) => c.maps[k]).sort((a, b) => (a.t || 0) - (b.t || 0));
    const first = places[0];
    return '<li class="cm-item' + (open ? ' open' : '') + '"><button type="button" class="entry cm-row" data-cr-open="' + esc(id) + '" aria-expanded="' + open + '">' +
      '<span class="cm-thumbbox" aria-hidden="true">' + (d ? '<canvas class="cm-art" data-cr-art="' + esc(id) + '" data-max="56" width="8" height="8"></canvas>' : I('creature')) + '</span>' +
      '<span class="body"><span class="t">' + j(nm.jp) + ' <span class="en">' + esc(nm.en) + '</span></span>' +
      '<span class="kind">' + (first && first.name ? 'First met: ' + esc(first.name.en) : 'Met') + (places.length > 1 ? ' · ' + places.length + ' places' : '') + (c.settled ? ' · settled' : '') + '</span>' +
      (d ? '' : '<span class="muted small">No longer drawn in this version of the game; your notes are kept.</span>') + '</span></button>' +
      (open ? crDetail(id, c, s) : '') + '</li>';
  }
  function crDetail(id, c, s) {
    const T = TX();
    const d = RB.content.enemies[id];
    const places = Object.keys(c.maps || {}).map((k) => Object.assign({ k }, c.maps[k])).sort((a, b) => (a.t || 0) - (b.t || 0));
    const f = firstSight(c);
    let h = '<div class="cm-detail inline-detail" role="region" aria-label="' + esc(((c.name && c.name.en) || id) + ': what you have seen') + '">';
    h += '<figure class="cm-fig">' + (d ? '<div class="cm-frame"><canvas class="cm-art" data-cr-art="' + esc(id) + '" data-max="176" width="8" height="8" role="img" aria-label="' + esc(artAlt(id, c)) + '"></canvas></div>' : '') +
      '<figcaption>' + (f ? '<div class="kind">First seen</div>' + lineHtml(f.intro) : '<span class="muted">You met it alongside another creature and saw no opening words of its own.</span>') + '</figcaption></figure>';
    // where: the species is one thing; each place you met it is another
    h += head('places', 'map') + '<ul class="cm-places">' + places.map((p) => {
      const set = p.set && T.setting[p.set] ? '<span class="cm-set">' + I(p.set === 'indoor' ? 'here' : 'travel') + lab(T.setting[p.set]) + '</span>' : '';
      const nm = p.name ? esc(p.name.en) + (p.name.jp ? ' <span class="wd-jpn">' + j(p.name.jp) + '</span>' : '') : '<span class="muted">a place not recorded</span>';
      const near = p.near && p.name && p.near.en !== p.name.en ? ' <span class="muted small">near ' + esc(p.near.en) + '</span>' : '';
      const withL = p.with && RB.content.enemies[p.with] && p.with !== id ? '<div class="muted small">Met alongside the ' + esc(RB.content.enemies[p.with].name.en) + '.</div>' : '';
      return '<li><div class="cm-pl">' + nm + near + ' ' + set + '</div>' + withL + (p.intro && (!f || p.k !== f.k) ? lineHtml(p.intro) : '') + '</li>';
    }).join('') + '</ul>';
    const mv = RB.creatures.moves(c);
    if (mv.length) {
      h += head('moves', 'look') + '<ul class="cm-moves">' + mv.map((m) =>
        '<li><div class="cm-mv">' + I(INTENT_ICON[m.kind] || 'strike') + '<b>' + esc(moveTitle(m.kind, s)) + '</b></div><ul class="cm-notes">' + m.notes.filter((n) => n.key[0] !== 'i').map((n) => noteHtml(n.key, n, c)).join('') + '</ul></li>').join('') + '</ul>';
    } else h += head('moves', 'look') + '<p class="muted small">Nothing yet: you have not seen it make a move.</p>';
    const ph = RB.creatures.phases(c);
    if (ph.length) h += head('changes', 'next') + '<ul class="cm-phases">' + ph.map((p) => '<li>' + (p.line ? lineHtml(p.line) : 'It changed its ways partway through.') + '</li>').join('') + '</ul>';
    if (c.settled) {
      const sp = places.find((p) => p.settle);
      h += head('settled', 'done') + (sp ? lineHtml(sp.settle) : '<p>You settled it.</p>');
    }
    h += '<p class="muted small cm-foot">Only what you have seen is written here. Reading it changes nothing in a battle.</p>';
    return h + '</div>';
  }
  function crHtml(s, api) {
    const V = api.view;
    if (pending.cr) { V.crOpen = pending.cr; pending.cr = null; }
    const ids = RB.creatures.met(s);
    let h = '<p class="wd-live sr" aria-live="polite"></p>';
    if (!ids.length) return h + '<p class="muted">No creatures yet.</p><p>When you meet one on the road, it is noted here: how it looks, where you met it, and what you saw it do.</p>';
    h += '<p class="muted small">In the order you met them. Choose one to read your notes.</p>';
    h += '<ul class="entries cm-list">' + ids.map((id) => crRow(id, s.creatures[id], V.crOpen === id, s)).join('') + '</ul>';
    return h;
  }
  // a creature's battle art, cropped to the creature, whole pixels when enlarged
  function drawArt(cv) {
    const id = cv.getAttribute('data-cr-art'), d = RB.content.enemies[id];
    const EA = RB.enemyArt;
    if (!d || !EA) return;
    const art = d.art || 'wisp', o = d.artOpts || {};
    const pad = 4;
    if (EA.has(art) || !EA.A[art]) {
      const e = EA.extent(EA.has(art) ? art : 'wisp', o);
      cv.width = Math.max(8, Math.ceil(e.right - e.left) + pad * 2 + 1);
      cv.height = Math.max(8, Math.ceil(e.bottom - e.top) + pad * 2);
      const c = cv.getContext('2d');
      c.clearRect(0, 0, cv.width, cv.height);
      EA.drawArt(c, art, 0, o, pad - e.left, pad - e.top, 1, true);
    } else {
      cv.width = 132; cv.height = 132;
      const c = cv.getContext('2d');
      c.clearRect(0, 0, cv.width, cv.height);
      c.save(); c.translate(66, 70); c.scale(2, 2); EA.draw(c, art, 0, o); c.restore();
    }
    const max = +cv.getAttribute('data-max') || 96;
    const k = Math.min(max / cv.width, max / cv.height);
    const kk = k >= 1 ? Math.floor(k) : k;
    cv.style.width = Math.round(cv.width * kk) + 'px';
    cv.style.height = Math.round(cv.height * kk) + 'px';
    cv.classList.toggle('px', kk >= 1);
  }
  function crWire(el, s, api) {
    const V = api.view;
    for (const cv of el.querySelectorAll('canvas[data-cr-art]')) { try { drawArt(cv); } catch (err) { console.error('creature art', err); } }
    el.onclick = (e) => {
      const op = e.target.closest('[data-cr-open]');
      if (op) { const id = op.getAttribute('data-cr-open'); V.crOpen = V.crOpen === id ? null : id; again(api, '[data-cr-open="' + id + '"]'); }
    };
  }

  // ---- registration -----------------------------------------------------------------------------------
  if (RB.ui.menu && RB.ui.menu.addPage) {
    RB.ui.menu.addPage('words', {
      id: 'bookmarks', en: 'Kept sentences', jp: '{栞|しおり}',
      count: (s) => (Array.isArray(s.bookmarks) ? s.bookmarks.length : 0),
      html: bmHtml, wire: bmWire,
    });
    RB.ui.menu.addPage('words', {
      id: 'creatures', en: 'Creatures met', jp: '{見|み}た もの の {記録|きろく}',
      count: (s) => (RB.creatures ? RB.creatures.met(s).length : 0),
      html: crHtml, wire: crWire,
    });
  }
  return { bmHtml, crHtml, moveTitle, drawArt, show };
})();
