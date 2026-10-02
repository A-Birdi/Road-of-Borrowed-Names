/* Journey › Practice mementos (Practice addendum §8.1, §16.3, §20.1): every
 * entry from RB.practice.mementos(s) — the writing desk's kept pages, the
 * fishing survey's rod ribbon and framed illustration, the proofreader's kept
 * page — from whichever sources registered with RB.practice.addMementoSource.
 * They are their own small display, never among the twelve Roadside
 * Keepsakes (whose collection rules are unchanged).
 *
 *   - "On the practice shelf": one optional display selection, kept in
 *     s.practice.mementoDisplay.shelf. It never touches s.discovery.display.
 *   - "Show on Shared memories": only by an explicit choice, a practice memento
 *     can be the pinned display on Company › Shared memories instead of a
 *     keepsake; if a keepsake is up, the player is asked first and the keepsake
 *     goes back into the catalogue (still found, never removed). Putting a
 *     keepsake on display later takes the practice memento down again.
 *   - The desk's pages: rename, remove (asked first; never silently), and
 *     "Try saving again" for a page that is not saved.
 * Art: an entry's html() (typeset pages: real ruby) or draw(canvas). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.practiceMementos = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => RB.ui.folio.icon(n);
  const J = (t) => (t ? RB.ui.jhtml(t) : '');
  const key = (m) => m.source + ':' + m.id;
  const all = (s) => RB.practice.mementos(s);
  const disp = (s) => RB.practice.of(s).mementoDisplay;
  const TX = () => (RB.content.practiceA && RB.content.practiceA.mementos) || { title: { jp: '', en: 'Practice mementos' }, shelf: { jp: '', en: 'On the practice shelf' } };
  let sel = null, renaming = null;

  // a keepsake on display on Shared memories (the catalogue's own record)
  function keepsakeUp(s) {
    const id = s.discovery && s.discovery.display;
    return !!(id && RB.content.keepsakes && RB.content.keepsakes[id] && RB.ui.keepsakes && RB.ui.keepsakes.found && RB.ui.keepsakes.found(s, id));
  }
  // one pinned display on Shared memories: a keepsake put up after a practice memento
  // was pinned takes its place (pinning a memento took the keepsake down, so both set
  // means the keepsake is the later choice); a pin whose memento is gone is cleared
  function syncPin(s) {
    const d = disp(s);
    if (!d || !d.pin) return;
    if (keepsakeUp(s) || !all(s).some((m) => key(m) === d.pin)) d.pin = null;
  }

  function art(m, cls) {
    const box = RB.ui.el('span', 'pm-art' + (cls ? ' ' + cls : ''));
    try {
      if (m.html) box.innerHTML = m.html();
      else if (m.draw) { const cv = document.createElement('canvas'); m.draw(cv, { cell: cls === 'big' ? 150 : 40 }); cv.classList.add('pm-cv'); box.appendChild(cv); }
      else box.innerHTML = I('keepsake');
    } catch (e) { box.innerHTML = I('keepsake'); }
    return box;
  }
  // a source may give a short kind id ('proof') or a sentence ('Your handwriting · traced')
  const KIND = { proof: 'Proofreading page — typeset, not handwriting', desk: 'Writing desk page' };
  const kindText = (m) => KIND[m.kind] || m.kind || '';
  function title(m) { return (m.title && m.title.jp ? J(m.title.jp) + ' ' : '') + '<span class="en">' + esc((m.title && m.title.en) || m.id) + '</span>'; }

  function render(A, B, two, api) {
    const s = api.s;
    syncPin(s);
    const ms = all(s), d = disp(s);
    const tx = TX();
    let h = '<h3>' + I('keepsake') + ' ' + esc(tx.title.en) + ' <span class="jp-sub">' + J(tx.title.jp) + '</span></h3>' +
      '<p class="muted small">Pages kept at the writing desk and small mementos from other pastimes. This is a display of your own, apart from the Roadside Keepsakes: choosing something here never takes a keepsake down unless you ask it to.</p>';
    const shelf = ms.find((m) => key(m) === d.shelf);
    h += '<div class="pm-shelf"><span class="lab">' + J(tx.shelf.jp) + ' <span class="en">' + esc(tx.shelf.en) + '</span></span>' +
      (shelf ? '<button type="button" class="pm-shelfitem" data-pm-sel="' + esc(key(shelf)) + '"><span class="pm-slot" data-pm-art="' + esc(key(shelf)) + '"></span><span class="nm">' + title(shelf) + '</span></button>' : '<span class="muted">Nothing on the shelf. Choose a memento and put it there.</span>') + '</div>';
    if (!ms.length) h += '<p class="muted">Nothing here yet. Pages you keep at the writing desk, and mementos from other pastimes, will be shown here.</p>';
    else h += '<div class="pm-grid">' + ms.map((m) => '<button type="button" class="pm-cell' + (sel === key(m) ? ' on' : '') + '" data-pm-sel="' + esc(key(m)) + '" aria-pressed="' + (sel === key(m)) + '"><span class="pm-slot" data-pm-art="' + esc(key(m)) + '"></span><span class="nm">' + title(m) + '</span><span class="k">' + esc(kindText(m)) + (m.note && m.source === 'desk' ? ' · ' + esc(m.note) : '') + '</span></button>').join('') + '</div>';
    const holder = RB.ui.el('div', 'pm-page');
    holder.innerHTML = h;
    A.appendChild(holder);
    holder.querySelectorAll('[data-pm-art]').forEach((sl) => { const m = ms.find((x) => key(x) === sl.dataset.pmArt); if (m) sl.appendChild(art(m, 'small')); });
    if (!sel || !ms.some((m) => key(m) === sel)) sel = d.shelf && ms.some((m) => key(m) === d.shelf) ? d.shelf : ms[0] ? key(ms[0]) : null;
    const det = RB.ui.el('div', 'pm-detail');
    if (two) { B.innerHTML = ''; B.appendChild(det); } else if (sel) holder.appendChild(det);
    const m = ms.find((x) => key(x) === sel);
    if (m) detail(det, s, m);
    const wire = (root) => root.addEventListener('click', (e) => onClick(e, s, api));
    wire(holder);
    if (two) wire(B);
  }
  function detail(el, s, m) {
    const d = disp(s), k = key(m);
    const page = m.source === 'desk' && m.page ? m.page : null;
    let h = '<div class="pm-big"></div><h3 class="pm-name">' + title(m) + '</h3><p class="muted small">' + esc(kindText(m)) + '</p>' + (m.note && m.source !== 'desk' ? '<p class="small">' + esc(m.note) + '</p>' : '');
    if (page && page.saved === false) h += '<p class="pm-unsaved">' + I('warn') + ' Not saved yet: it is kept in this journey but has not been written to storage. <button type="button" class="pbtn" data-pm-save>' + I('save') + 'Try saving again</button></p>';
    const acts = [];
    acts.push('<button type="button" class="pbtn" data-pm-shelf="' + esc(k) + '" aria-pressed="' + (d.shelf === k) + '">' + I('keepsake') + (d.shelf === k ? 'On the shelf (take it off)' : 'Put on the practice shelf') + '</button>');
    acts.push('<button type="button" class="pbtn" data-pm-pin="' + esc(k) + '" aria-pressed="' + (d.pin === k) + '">' + I('companion') + (d.pin === k ? 'Shown on Shared memories (take down)' : 'Show on Shared memories') + '</button>');
    if (page) {
      acts.push('<button type="button" class="pbtn" data-pm-rename="' + esc(page.id) + '">' + I('note') + 'Rename</button>');
      acts.push('<button type="button" class="pbtn danger" data-pm-remove="' + esc(page.id) + '">' + I('trash') + 'Remove this page</button>');
    }
    h += '<div class="row-acts">' + acts.join('') + '</div>';
    if (page && renaming === page.id) h += '<div class="field pm-rename"><label class="lab" for="pm-label">New label</label><input id="pm-label" type="text" maxlength="' + RB.practiceDesk.MAX_LABEL + '" value="' + esc(page.label || '') + '"><div class="row-acts"><button type="button" class="pbtn primary" data-pm-rename-ok="' + esc(page.id) + '">' + I('done') + 'Save the label</button><button type="button" class="pbtn" data-pm-rename-x>Cancel</button></div></div>';
    if (d.pin === k) h += '<p class="muted small">This is the display on Company › Shared memories. Putting a keepsake on display there takes it down again.</p>';
    el.innerHTML = h;
    el.querySelector('.pm-big').appendChild(art(m, 'big'));
    if (renaming) setTimeout(() => { const i = el.querySelector('#pm-label'); if (i) i.focus(); }, 0);
  }
  async function onClick(e, s, api) {
    const b = e.target.closest('button');
    if (!b) return;
    const d = disp(s);
    if (b.dataset.pmSel) { sel = b.dataset.pmSel; renaming = null; api.render(); return; }
    if (b.dataset.pmShelf) { d.shelf = d.shelf === b.dataset.pmShelf ? null : b.dataset.pmShelf; save(); api.render(); return; }
    if (b.dataset.pmPin) {
      const k = b.dataset.pmPin;
      if (d.pin === k) { d.pin = null; save(); api.render(); return; }
      if (keepsakeUp(s)) {
        const kp = RB.content.keepsakes[s.discovery.display];
        const r = await RB.ui.confirm('Show this on Shared memories instead of the keepsake “' + ((kp && kp.name && kp.name.en) || 'on display') + '”? The keepsake goes back into your catalogue; it stays found.', ['Show this instead', 'Keep the keepsake up']);
        if (r !== 0) return;
        s.discovery.display = null;
      }
      d.pin = k; save(); api.render(); return;
    }
    if (b.dataset.pmRename) { renaming = b.dataset.pmRename; api.render(); return; }
    if (b.hasAttribute('data-pm-rename-x')) { renaming = null; api.render(); return; }
    if (b.dataset.pmRenameOk) {
      const inp = document.getElementById('pm-label');
      if (inp && RB.practiceDesk.rename(s, b.dataset.pmRenameOk, inp.value)) { renaming = null; await RB.practiceDesk.persist(s); }
      api.render(); return;
    }
    if (b.dataset.pmRemove) {
      const p = RB.practiceDesk.pages(s).find((x) => x.id === b.dataset.pmRemove);
      const r = await RB.ui.confirm('Remove the page “' + ((p && p.label) || 'Practice page') + '” from this journey? This cannot be undone.', ['Remove it', 'Keep it'], { danger: true });
      if (r !== 0) return;
      RB.practiceDesk.removePage(s, b.dataset.pmRemove);
      await RB.practiceDesk.persist(s);
      sel = null; api.render(); return;
    }
    if (b.hasAttribute('data-pm-save')) {
      b.disabled = true;
      const r = await RB.practiceDesk.persist(s);
      RB.ui.notice(r.saved ? 'Saved.' : 'Still not saved' + (r.why === 'session' ? ': this browser is not keeping saves.' : r.why === 'no-slot' ? ': this journey has no save slot yet.' : r.why === 'read-only' ? ': this tab is read-only.' : '.'), r.saved ? 'info' : 'warn');
      api.render();
    }
  }
  function save() { if (RB.save && RB.save.autosave && RB.save.current && RB.save.current().slot != null) RB.save.autosave('progress'); }

  RB.ui.menu.addPage('journey', { id: 'mementos', en: 'Practice mementos', icon: 'keepsake', available: (s) => all(s).length > 0, render });

  // ---- the pinned practice memento on Company › Shared memories ------------------------------------------
  // Shown only when the player chose it there and no keepsake is on display (the page draws a
  // displayed keepsake itself); with a way to this page.
  function pinnedHtml(s) {
    syncPin(s);
    const d = disp(s);
    if (!d || !d.pin || keepsakeUp(s)) return null;
    const m = all(s).find((x) => key(x) === d.pin);
    return m || null;
  }
  if (RB.ui.company && RB.ui.company.render) {
    const orig = RB.ui.company.render;
    RB.ui.company.render = function (A, B, two, api) {
      orig(A, B, two, api);
      if (!api || !api.view || api.view.page !== 'memories' || !api.s || A.querySelector('.co-pinned, .pm-company')) return;
      if (!two && api.view.detail === 'recall') return; // a memory open on a phone: the list (and the display) is not shown
      const m = pinnedHtml(api.s);
      if (!m) return;
      const box = RB.ui.el('div', 'co-pinned pm-company');
      box.innerHTML = '<div class="ks-display"><span class="lab">On display</span><span class="pm-slot"></span>' + title(m) + '</div><button type="button" class="pbtn quiet" data-pm-go>See it</button>';
      box.querySelector('.pm-slot').appendChild(art(m, 'small'));
      box.querySelector('[data-pm-go]').onclick = () => { sel = key(m); if (api.go) api.go('journey', 'mementos'); };
      const scope = A.querySelector('.co-page') || A;
      const head = scope.querySelector('h3');
      if (head && head.parentNode) head.parentNode.insertBefore(box, head.nextSibling); else scope.insertBefore(box, scope.firstChild);
    };
  }

  return { render, pinned: pinnedHtml, syncPin, keepsakeUp };
})();
