/* The pause folio: five paper tabs — Journey (quests, notes, dialogue
 * history), Words (inscriptions, noted words, kana, grammar, lore, progress,
 * guide), Satchel (equipment and carried items), Map (route chart and fast
 * travel), Company (the companion, the pet, shared memories: src/ui/52_company.js)
 * — plus Save & Load and Settings as plain utility actions on the folio's
 * foot. Old section names still open the right place (journal, log,
 * notebook, guide, items, settings, save).
 *
 * Later systems add pages without editing this file: addPage('journey' |
 * 'words' | 'map', def) (see docs/ADDENDUM_CONTRACTS.md), and a tab of their
 * own with addSection(def), shown only where def.available(s) says so (the
 * twelve-chapter edition's Distractions, K7/K10). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.menu = (function () {
  'use strict';
  const esc = RB.util.esc;
  const F = () => RB.ui.folio;
  const I = (n, t) => RB.ui.folio.icon(n, t);
  const SECTIONS = [
    { id: 'journey', en: 'Journey', jp: '{旅路|たびじ}', icon: 'journey' },
    { id: 'words', en: 'Words', jp: '{言葉|ことば}', icon: 'words' },
    { id: 'satchel', en: 'Satchel', jp: '{荷物|にもつ}', icon: 'satchel' },
    { id: 'map', en: 'Map', jp: '{地図|ちず}', icon: 'map' },
    { id: 'company', en: 'Company', jp: '{道連|みちづ}れ', icon: 'companion' },
  ];
  // old tab ids → [section, sub-view] or a utility
  const ALIAS = {
    journal: ['journey', 'quests'], journey: ['journey'], log: ['journey', 'history'], history: ['journey', 'history'],
    notebook: ['words'], words: ['words'], guide: ['words', 'guide'], items: ['satchel'], satchel: ['satchel'], map: ['map'],
    company: ['company'], companion: ['company', 'companion'], pet: ['company', 'pet'], pets: ['company', 'pet'], memories: ['company', 'memories'],
    cases: ['journey', 'cases'], keepsakes: ['journey', 'keepsakes'], bookmarks: ['words', 'bookmarks'], creatures: ['words', 'creatures'], known: ['map', 'known'],
    practice: ['words', 'practice'], letters: ['words', 'letters'], compare: ['words', 'compare'], // practice suite B pages
    fishing: ['journey', 'fishing'], // A Quiet Cast's Fishing notes (src/ui/86_fishing_notes.js)
    stamps: ['journey', 'stamps'], volume: ['journey', 'volume'], // the journey's records (src/ui/66c_records.js)
    distractions: ['distractions'], pastimes: ['distractions'], // the pastimes' tab (src/ui/68b_distractions.js)
    expedition: ['map', 'expedition'], // an expedition's floors (src/ui/89b_expedition.js)
    settings: '@settings', save: '@save',
  };
  // pages added by later systems: journey views, words pages, map views
  //   journey/map: { id, en, icon, available?(s), render(A, B, two, api) }
  //   words:       { id, en, jp, count?(s), available?(s), html(s, api), wire?(el, s, api) }
  const EXT = { journey: [], words: [], map: [] };
  function addPage(section, def) { const L = EXT[section]; const i = L.findIndex((d) => d.id === def.id); if (i >= 0) L[i] = def; else L.push(def); }
  const extOf = (section, id) => EXT[section].find((d) => d.id === id);
  // tabs added by later systems: { id, en, jp, icon, available?(s), render(A, B, two, api), back?(api) → handled,
  // sub?(view, sub) }; each keeps its own view state in view[id]
  const XSEC = [];
  function addSection(def) { const i = XSEC.findIndex((d) => d.id === def.id); if (i >= 0) XSEC[i] = def; else XSEC.push(def); view[def.id] = view[def.id] || {}; }
  const xsec = (id) => XSEC.find((d) => d.id === id) || null;
  const sectionsFor = (s) => SECTIONS.concat(XSEC.filter((d) => { try { return !d.available || d.available(s); } catch (e) { return false; } }));
  const avail = (d, s) => !d.available || d.available(s);
  // what an added page may do: re-render (keeping scroll), close, go elsewhere
  function api(section) { return { s: RB.game.s, view: view[section], remember, render: () => { remember(); render(); }, close, go, two: F().wide() }; }
  const COMPANION_QUESTS = { co_suzu: 'suzu', lf_nao: 'nao', lf_mio: 'mio', ren_ushio: 'ren' };
  const view = {
    section: 'journey',
    journey: { view: 'quests', sel: null, nudge: {} }, // nudge: quest id + ':' + stage → nudges shown
    words: { sub: null, guide: 'basics' },
    satchel: { sel: null },
    map: { view: 'chart' },
    company: { page: null },
    scroll: {},
  };
  let layer = null, fr = null, tabsApi = null, mq = null, headRO = null, stopDemo = () => {};
  let lastSec = null; // the section last drawn: a change of section turns the page (the book)
  // the book (Settings › Display › The Wayfarer's Ledger): 'book' or 'flat' (the classic folio was retired in U06)
  const bookStyle = () => (RB.game.settings && RB.game.settings.ledgerStyle === 'flat' ? 'flat' : 'book');
  let sheet = null; // the Save & Load sheet, when open over the folio

  // ---- open / close -------------------------------------------------------------------
  function open(which) {
    const a = which ? ALIAS[which] : null;
    if (layer) {
      if (a === '@settings') return RB.ui.settings.open();
      if (a === '@save') return saveSheet();
      if (a) go(a[0], a[1]);
      return;
    }
    if (RB.game.mode() !== 'world' && RB.game.mode() !== 'dialogue') return;
    RB.game.pushMode('menu');
    RB.audio && RB.audio.sfx('menu_open');
    // a book still closing (its inert copy, below) goes at once: there is never more than one Ledger on screen
    document.querySelectorAll('.folio-scrim.closing').forEach((x) => x.remove());
    if (RB.bookType) RB.bookType.install(); // the book's type, if the idle start hasn't made it yet
    fr = F().frame({ onClose: close, closeLabel: 'Close', book: bookStyle() });
    lastSec = null;
    // Save & Load and Settings beside Close, where a reader looks first, rather than in the corner under the book
    // (PT-1b; Save & Load joined them in LI-5): the book's pages then reach the bottom of the cover
    const saveB = RB.ui.el('button', 'cbtn ledger-set ledger-save');
    saveB.dataset.util = 'save';
    saveB.setAttribute('aria-label', 'Save & Load');
    saveB.setAttribute('aria-haspopup', 'dialog');
    saveB.setAttribute('aria-expanded', 'false');
    saveB.innerHTML = I('ledger') + '<span>' + RB.ui.label('セーブ・ロード', 'Save & Load') + '</span>';
    fr.head.insertBefore(saveB, fr.head.querySelector('[data-folio-close]'));
    fr.el.classList.add('no-foot');
    const setB = RB.ui.el('button', 'cbtn ledger-set');
    setB.dataset.util = 'settings';
    setB.setAttribute('aria-label', 'Settings');
    setB.innerHTML = I('settings') + '<span>' + RB.ui.label('{設定|せってい}', 'Settings') + '</span>';
    fr.head.insertBefore(setB, fr.head.querySelector('[data-folio-close]'));
    // the tabs keep clear of the cover's buttons by their real width (text size, labels shown or not)
    const fitHead = () => { if (fr) fr.el.style.setProperty('--head-w', fr.head.offsetWidth + 'px'); }; // (its laid-out width: the opening book is scaled)
    fitHead();
    headRO = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fitHead) : null;
    if (headRO) headRO.observe(fr.head);
    fr.el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-util]');
      if (!b || !fr || !fr.el.contains(b)) return;
      if (b.dataset.util === 'settings') RB.ui.settings.open();
      else if (b.dataset.util === 'save') saveSheet();
    });
    layer = { el: fr.scrim, name: 'menu' };
    layer.onCancel = back;
    layer.onAction = (act) => { if (act === 'menu') { close(); return true; } return false; };
    RB.ui.pushLayer(layer);
    if (a && a !== '@settings' && a !== '@save') { view.section = a[0]; applySub(a[0], a[1]); }
    // a tab this journey does not have (another journey's, or not yet offered) opens the Journey instead
    const secs = sectionsFor(RB.game.s);
    if (!secs.some((x) => x.id === view.section)) { view.section = 'journey'; view.journey.view = 'quests'; }
    tabsApi = F().tabs(fr.tabslot, secs, view.section, (id) => { remember(); view.section = id; render(); }, { label: 'The Wayfarer\'s Ledger', panelId: 'folio-page' });
    render();
    if (typeof matchMedia !== 'undefined') {
      mq = matchMedia(RB.ui.folio.WIDE);
      mq.onchange = () => { if (layer) { remember(); render(); } };
    }
    if (a === '@settings') RB.ui.settings.open();
    else if (a === '@save') saveSheet();
  }
  function close() {
    if (!layer) return;
    closePick(false);
    closeSheet(false);
    if (view.section === 'satchel') seenSatchel();
    remember();
    stopDemo();
    if (tabsApi) tabsApi.destroy();
    if (headRO) { headRO.disconnect(); headRO = null; }
    if (chartRO) { chartRO.disconnect(); chartRO = null; }
    if (mq) mq.onchange = null;
    const el = layer.el, at = el.parentNode;
    RB.ui.popLayer(layer);
    // the book closes with a short motion: what is shown is a copy that can no longer be used (inert), removed
    // once the motion ends; the Ledger itself is already closed and the world already has the keyboard
    if (bookStyle() === 'book' && !RB.game.reducedMotion() && at && el.querySelector('.folio.book')) {
      el.querySelector('.folio.book').classList.add('closing');
      el.classList.add('closing');
      el.inert = true; el.setAttribute('aria-hidden', 'true');
      at.appendChild(el);
      setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 230);
    }
    layer = null; fr = null; tabsApi = null;
    RB.game.popMode('menu');
    RB.audio && RB.audio.sfx('menu_close');
    RB.ui.help.hide(true);
    // give the keyboard back to the world without moving the character
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    RB.input.clearHeld && RB.input.clearHeld();
  }
  // leaving the game (loading another journey, returning to the title) closes the sheet too
  function closeAll() { closeSheet(false); close(); }
  // Back: leave a sub-page first (phones), otherwise close the folio.
  function back() {
    const w = view.words, j = view.journey;
    if (view.section === 'words' && w.sub && !F().wide()) { remember(); w.sub = null; render(); return; }
    if (view.section === 'journey' && j.view !== 'quests') { remember(); j.view = 'quests'; render(); return; }
    if (view.section === 'map' && view.map.view !== 'chart') { remember(); view.map.view = 'chart'; render(); return; }
    if (view.section === 'company' && RB.ui.company && RB.ui.company.back && RB.ui.company.back(api('company'))) return;
    const xs = xsec(view.section);
    if (xs && xs.back && xs.back(api(view.section))) return;
    close();
  }
  function go(section, sub) {
    remember();
    view.section = section;
    applySub(section, sub);
    if (tabsApi) tabsApi.select(section);
    render();
  }
  function applySub(section, sub) {
    if (section === 'journey') view.journey.view = sub || 'quests';
    if (section === 'words') view.words.sub = sub || view.words.sub;
    if (section === 'map') view.map.view = sub || 'chart';
    if (section === 'company' && sub) view.company.page = sub;
    const xs = xsec(section);
    if (xs) { if (xs.sub) xs.sub(view[section], sub); else if (sub) view[section].page = sub; }
  }
  function key() {
    const s = view.section;
    return s + ':' + (s === 'journey' ? view.journey.view : s === 'words' ? view.words.sub || 'index' : s === 'map' ? view.map.view : s === 'company' ? view.company.page || '' : (view[s] && view[s].page) || '');
  }
  function remember() {
    if (!fr) return;
    const leaves = fr.box.querySelectorAll('.leaf');
    if (leaves[0]) view.scroll[key()] = [leaves[0].scrollTop, leaves[1] ? leaves[1].scrollTop : 0];
  }

  // ---- rendering ---------------------------------------------------------------------------
  // the "new" mark (LI-3): a glowing dot on the Satchel's tab and on each item given since the Satchel was last looked
  // at; leaving the Satchel (another tab, or closing the Ledger) counts as having looked
  function seenSatchel() { const s = RB.game.s; if (s && s.newItems && Object.keys(s.newItems).length) s.newItems = {}; if (RB.ui.award && RB.ui.award.newDot) RB.ui.award.newDot(); }
  function newMarks() {
    if (!tabsApi) return;
    const s = RB.game.s, any = !!(s && s.newItems && Object.keys(s.newItems).some((id) => s.inv[id] > 0));
    const t = tabsApi.el.querySelector('.ptab[data-id="satchel"]');
    if (!t) return;
    let d = t.querySelector('.new-dot');
    if (any && !d) { t.insertAdjacentHTML('beforeend', '<span class="new-dot" aria-hidden="true"></span>'); t.setAttribute('aria-description', 'New things'); }
    else if (!any && d) { d.remove(); t.removeAttribute('aria-description'); }
  }
  function render() {
    closePick(false);
    stopDemo(); stopDemo = () => {};
    const s = RB.game.s;
    if (lastSec === 'satchel' && view.section !== 'satchel') seenSatchel();
    newMarks();
    const sec = sectionsFor(s).find((x) => x.id === view.section) || SECTIONS[0];
    if (sec.id !== view.section) view.section = sec.id;
    const comp = s.comp && RB.content.chars[s.comp];
    fr.setTitle(RB.ui.label(sec.jp, sec.en), esc(s.player.name) + (comp ? ' &amp; ' + esc(comp.name.en) : '') + ' · ' + RB.util.fmtTime(s.playtime));
    const two = F().wide();
    const turn = lastSec && lastSec !== view.section;
    lastSec = view.section;
    // the spread stays from page to page (its shadow is drawn once); the two leaves are new each time, so what a page
    // put on them (listeners, scroll) never carries over. A turn after a turn names its motion afresh (tb), so it plays.
    let sp = fr.box.querySelector(':scope > .spread');
    if (!sp) { fr.box.innerHTML = '<div class="spread" id="folio-page" role="tabpanel"></div>'; sp = fr.box.firstChild; }
    const tb = turn && sp.classList.contains('turn') && !sp.classList.contains('tb');
    sp.className = 'spread' + (two ? ' two' : '') + (turn ? ' turn' + (tb ? ' tb' : '') : '');
    sp.setAttribute('aria-labelledby', 'tab-' + view.section);
    sp.innerHTML = '<div class="leaf" tabindex="0" aria-label="' + esc(sec.en) + ' page"></div><div class="leaf leaf-b" tabindex="0" aria-label="' + esc(sec.en) + ' detail page"></div>';
    const [A, B] = sp.querySelectorAll(':scope > .leaf');
    const builtIn = { journey, words, satchel, map, company }[view.section];
    if (builtIn) builtIn(A, B, two); else xsec(view.section).render(A, B, two, api(view.section));
    const mark = bookmarks(sp, A, two);
    runningHeads(A, B, two, sec, s, comp, mark);
    const sc = view.scroll[key()];
    if (sc) { A.scrollTop = sc[0]; B.scrollTop = sc[1]; }
  }
  const j = (line) => (line ? RB.ui.jhtml(line) : '');
  const en = (t) => '<div class="en">' + esc(RB.script.enVars(t || '')) + '</div>';
  // The book's running heads: the section's name at the top of the first page, who is travelling and for how long
  // at the top of the second (on a phone, both on the one page). They repeat the dialog's own title and meta for
  // the eye; the dialog keeps its accessible name, so these are hidden from assistive technology.
  // LI-5 (Robin 2026-10-16: "a bookmarker on the left edge of the pages, colored uniquely … hovering … slide out a
  // little to show the full text … clicking … brings it forefront over the top of the page, curled over the edge"):
  // the pages within Journey, Map and Company as ribbons tucked under the left page. Each ribbon is the page's own
  // button pressed on its behalf, so a section keeps its one way of turning to a page. Without a fine pointer to
  // hover with, or on one page, the same buttons stay on the page as coloured ribbon tags with their words.
  const MARK_SECS = { journey: 1, map: 1, company: 1 };
  const MARK_INK = {
    quests: '#a33b26', history: '#34507e', cases: '#6a4482', keepsakes: '#476e3e', mementos: '#476e3e', fishing: '#2a6b74',
    stamps: '#87591a', volume: '#2a6b74', chart: '#7a4f26', known: '#a33b26', board: '#34507e', expedition: '#476e3e',
    companion: '#9a4152', pet: '#87591a', memories: '#34507e',
  };
  const MARK_MORE = ['#a33b26', '#34507e', '#476e3e', '#87591a', '#6a4482', '#2a6b74', '#9a4152', '#7a4f26', '#4a5566'];
  const lastMark = {};
  const railable = (two) => two && typeof matchMedia !== 'undefined' && matchMedia('(hover: hover) and (pointer: fine)').matches;
  function bookmarks(sp, A, two) {
    const rail = railable(two);
    fr.el.classList.toggle('bm-room', rail); // the cover keeps the same strip on every section, so pages never shift
    const nav = MARK_SECS[view.section] && A.querySelector('.subnav:not(.sub2)');
    if (!nav) return null;
    const bs = [...nav.querySelectorAll(':scope > .subbtn')];
    const idOf = (b) => b.dataset.jv || b.dataset.mv || b.dataset.cp || '';
    const used = new Set();
    bs.forEach((b, i) => {
      let c = MARK_INK[idOf(b)];
      if (!c || used.has(c)) c = MARK_MORE.find((x) => !used.has(x)) || MARK_MORE[i % MARK_MORE.length];
      used.add(c);
      b.style.setProperty('--bm', c);
    });
    const on = bs.find((b) => b.getAttribute('aria-pressed') === 'true') || null;
    const cur = on ? idOf(on) : null;
    const prev = lastMark[view.section];
    lastMark[view.section] = cur;
    if (!rail) { nav.classList.add('bm-chips'); return null; }
    // the page's own buttons move out onto the cover as the ribbons (a <nav>, so the leaves stay the spread's first
    // two <div>s). A press is handed back to the page through a stand-in carrying the same data, so each section's
    // own listener on its page turns to it as before.
    const r = document.createElement('nav');
    r.className = 'subnav bk-marks';
    r.setAttribute('role', 'group');
    r.setAttribute('aria-label', nav.getAttribute('aria-label') || 'Pages');
    bs.forEach((b) => {
      const svg = b.querySelector('svg'), label = b.textContent.trim();
      b.classList.add('bm');
      if (b === on && prev && prev !== cur) b.classList.add('curl');
      b.innerHTML = '<span class="bm-tab" aria-hidden="true">' + (svg ? svg.outerHTML : '') + '</span><span class="bm-flap" aria-hidden="true"></span><span class="bm-label">' + esc(label) + '</span>';
      r.appendChild(b);
    });
    nav.remove();
    r.addEventListener('click', (e) => {
      const b = e.target.closest('.subbtn');
      if (!b || !r.contains(b)) return;
      const key = Object.keys(b.dataset).find((k) => k !== 'mark') || '';
      const back = document.activeElement === b;
      const proxy = document.createElement('button');
      proxy.type = 'button'; proxy.hidden = true;
      proxy.dataset[key] = b.dataset[key];
      A.appendChild(proxy);
      proxy.click();
      proxy.remove();
      const again = back && fr && fr.box.querySelector('.bk-marks [data-' + key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()) + '="' + b.dataset[key] + '"]');
      if (again) again.focus({ preventScroll: true });
    });
    sp.insertBefore(r, sp.firstChild);
    return on ? { en: on.querySelector('.bm-label').textContent, ink: on.style.getPropertyValue('--bm') } : null;
  }
  function runningHeads(A, B, two, sec, s, comp, mark) {
    // who is travelling: the Company page's summary line folds into this (the pet by the name you gave it)
    const pet = s.company && s.company.pet && s.company.pets && s.company.pets[s.company.pet];
    const meta = esc(s.player.name) + (comp ? ' &amp; ' + esc(comp.name.en) : '') + (pet && pet.name ? ', with ' + esc(pet.name) : '') + ' · ' + RB.util.fmtTime(s.playtime);
    // the title's furigana without word help: a running head is read, not studied (and it is hidden from assistive
    // technology, so nothing in it may take focus)
    const plain = RB.ui.jhtml(sec.jp).replace(/ data-(i|src)="[^"]*"/g, '').replace(/ tabindex="0"/g, '').replace(/class="jt"/g, 'class="jt-static"');
    A.insertAdjacentHTML('afterbegin', '<header class="bk-runhead" aria-hidden="true"><span class="bk-sec" lang="ja">' + plain + '</span>' +
      '<span class="bk-sec-en">' + esc(sec.en) + '</span>' + (mark ? '<span class="bk-subp" style="--bm:' + esc(mark.ink) + '">' + esc(mark.en) + '</span>' : '') +
      (two ? '' : '<span class="bk-meta">' + meta + '</span>') + '</header>');
    if (two) B.insertAdjacentHTML('afterbegin', '<header class="bk-runhead r" aria-hidden="true"><span class="bk-meta">' + meta + '</span></header>');
  }
  // Settings › Display changed the Ledger's look while it is open: redraw it in the new style
  function restyle() {
    if (!layer || !fr) return;
    if (RB.bookType) RB.bookType.install();
    fr.setBook(bookStyle());
    lastSec = null;
    remember();
    if (tabsApi) tabsApi.select(view.section);
    render();
  }

  // ---- Journey --------------------------------------------------------------------------------
  function questKind(id, d) {
    if (d.main) return ['main', 'Main road'];
    if (COMPANION_QUESTS[id] || d.companion) return ['companion', 'Companion'];
    return ['side', 'Side request'];
  }
  function stageOf(x) {
    const st = x.d.stages && x.d.stages[Math.min(x.q.stage, x.d.stages.length - 1)];
    return st ? '<div class="obj">' + j(st.jp) + en(st.en) + '</div>' : '';
  }
  function questDetail(x) {
    const [k, kl] = questKind(x.id, x.d);
    const cur = Math.min(x.q.stage, (x.d.stages || []).length - 1);
    const earlier = (x.d.stages || []).slice(0, x.q.done ? cur + 1 : cur);
    return '<div class="qdetail"><div class="kind">' + esc(kl) + (x.q.done ? ' · completed' : '') + '</div>' +
      '<h3>' + j(x.d.title.jp) + '</h3><p class="en-title">' + esc(x.d.title.en) + '</p>' +
      (x.q.done ? '<p class="muted">' + I('done') + ' Finished.</p>' : '<div class="ph small-ph">What to do now</div>' + stageOf(x) + guideBlock(x)) +
      (earlier.length && !x.q.done ? '<div class="ph small-ph">Earlier on this road</div><ol class="earlier">' + earlier.map((st) => '<li>' + j(st.jp) + en(st.en) + '</li>').join('') + '</ol>' : '') +
      (x.q.done && earlier.length ? '<div class="ph small-ph">The steps you took</div><ol class="earlier">' + earlier.map((st) => '<li>' + j(st.jp) + en(st.en) + '</li>').join('') + '</ol>' : '') +
      '</div>';
  }
  // Quest guidance (src/engine/56_questguide.js): follow a quest (markers in
  // the world and on the chart point to its next step), the words for those
  // markers ("Next: …"), and nudges revealed one at a time on request. A
  // nudge is free: nothing is recorded and nothing costs anything.
  const GL = {
    follow: ['これ を {追|お}う', 'Follow this quest'], following: ['{追|お}って いる', 'Following'],
    nudge: ['{手|て}がかり', 'Need a nudge?'], show: ['{手|て}がかり を {見|み}る', 'Show a nudge'], more: ['もう {一|ひと}つ', 'Another nudge'],
    onmap: ['{地図|ちず} で {見|み}る', 'Show on the map'], next: ['つぎ', 'Next'],
  };
  const gl = (k) => RB.ui.label(GL[k][0], GL[k][1]);
  function guideBlock(x) {
    const G = RB.questGuide, gm = G.mode(), s = RB.game.s;
    if (gm === 'off' || x.q.done) return '';
    const J = view.journey, key = x.id + ':' + x.q.stage, n = J.nudge[key] || 0;
    const N = G.nudges(x.id, s);
    const mapStep = gm === 'full' && N.markable;
    const total = N.lines.length + (mapStep ? 1 : 0);
    let h = '<div class="qguide">';
    if (gm === 'full') {
      const on = G.followed(s) === x.id;
      h += '<div class="ph small-ph qway">' + I('follow') + ' The way there</div>';
      h += '<div class="follow-row"><button class="pbtn follow' + (on ? ' on' : '') + '" data-follow="' + x.id + '" aria-pressed="' + on + '">' + I('follow') + '<span>' + gl(on ? 'following' : 'follow') + '</span></button>' +
        '<span class="muted small">' + esc(on ? (G.chosen(s) ? 'Markers in the world and on the Map show the way to its next step. Press again to stop.' : 'Followed as the main road: markers show the way to its next step. Press to stop.') : 'Markers will show the way to this quest’s next step instead.') + '</span></div>';
      if (on) {
        const next = G.nextLines(N.result);
        h += next.length
          ? '<div class="qnext"><div class="kind">' + I('follow') + ' ' + gl('next') + '</div>' + next.map((l) => '<div class="nline">' + j(l.jp) + en(l.en) + '</div>').join('') + '</div>'
          : '<p class="muted small qnext-none">' + esc(N.result.how === 'many' ? 'No marker for this step: many places could help, so none is marked.' : 'No marker for this step yet.') + '</p>';
      }
    }
    h += '<div class="nudge-slip"><div class="ph small-ph">' + I('help') + ' ' + gl('nudge') + '</div>';
    h += '<ol class="nudges" aria-live="polite">' + N.lines.slice(0, n).map((ls, i) => '<li tabindex="-1"><span class="kind">Nudge ' + (i + 1) + ' of ' + total + '</span>' +
      ls.map((l) => '<div class="nline">' + j(l.jp) + en(l.en) + '</div>').join('') + '</li>').join('') +
      (mapStep && n > N.lines.length ? '<li tabindex="-1"><span class="kind">Nudge ' + total + ' of ' + total + '</span><div class="nline"><span class="en">Shown on the map: this quest is followed, and its next step is marked.</span></div></li>' : '') + '</ol>';
    if (n < total) {
      const k = n === N.lines.length ? 'onmap' : n === 0 ? 'show' : 'more';
      h += '<div class="row-acts"><button class="pbtn" data-nudge="' + x.id + '">' + (k === 'onmap' ? I('map') : I('help')) + '<span>' + gl(k) + '</span> <span class="count">' + (n + 1) + ' of ' + total + '</span></button></div>';
    }
    return h + '<p class="muted small">Nudges are free: asking never counts as a mistake.</p></div></div>';
  }
  function guideClick(e, x) {
    const G = RB.questGuide, s = RB.game.s;
    const f = e.target.closest('[data-follow]');
    if (f) {
      const id = f.dataset.follow;
      if (G.followed(s) === id) G.unfollow(id); else G.follow(id);
      RB.questMarks && RB.questMarks.refresh();
      RB.audio && RB.audio.sfx('cursor');
      remember(); render();
      const again = fr && fr.box.querySelector('[data-follow="' + id + '"]');
      if (again) again.focus({ preventScroll: true });
      return true;
    }
    const b = e.target.closest('[data-nudge]');
    if (b) {
      const id = b.dataset.nudge, q = s.quests[id], key = id + ':' + q.stage, J = view.journey;
      const N = G.nudges(id, s);
      const n = (J.nudge[key] || 0) + 1;
      J.nudge[key] = n;
      if (G.mode() === 'full' && N.markable && n > N.lines.length) {
        // the last nudge: follow this quest and show its next step on the chart
        G.follow(id);
        RB.questMarks && RB.questMarks.refresh();
        go('map');
        const chart = fr && fr.box.querySelector('.chartbox');
        if (chart) chart.focus({ preventScroll: false });
        return true;
      }
      remember(); render();
      const next = fr && (fr.box.querySelector('[data-nudge="' + id + '"]') || [...fr.box.querySelectorAll('.nudges li')].pop());
      if (next) next.focus({ preventScroll: false });
      return true;
    }
    return false;
  }
  // The living world in the Journey (expansion W1, W5): one line for each town that has changed since you were last
  // there (never what changed; Settings can turn it off), and a road's first event you left unfinished. Only the new
  // chapters' towns and roads have either, so a six-chapter journey shows nothing here.
  function placesBlock(s) {
    if (!RB.town || !s.world) return '';
    const lines = [];
    if (RB.game.settings.townHints !== 'off') for (const c of RB.town.changed(s)) lines.push('<li class="entry"><span class="mark">' + I('map') + '</span><div>' + (c.name && c.name.jp ? j(c.name.jp) : '') + en((c.name ? c.name.en : c.town) + ' has changed since you were last there.') + '</div></li>');
    for (const r of RB.town.unfinished(s)) {
      const d = (RB.content.roadEvents || {})[r] || {}, u = d.unique || {}, m = RB.content.maps[(d.maps || [])[0]];
      lines.push('<li class="entry"><span class="mark">' + I('side') + '</span><div>' + (u.title && u.title.jp ? j(u.title.jp) : '') + en('Unfinished on ' + (m && m.name ? m.name.en : 'the road') + (u.title ? ': ' + u.title.en : '') + '. It will be there when you pass again.') + '</div></li>');
    }
    return lines.length ? '<h3>' + I('map') + ' Places <span class="count">' + lines.length + '</span></h3><ul class="entries">' + lines.join('') + '</ul>' : '';
  }
  // K10 (twelve-chapter journeys): the keepsakes, practice mementos and fishing notes under one Mementos entry, its
  // pages one row below; a six-chapter journey keeps its Journey as it was (F-21)
  const JOURNEY_GROUPS = { keepsakes: 'mementos', mementos: 'mementos', fishing: 'mementos' };
  const grouped = (s) => !!(RB.recordsUI && RB.recordsUI.inCampaign(s));
  function journeyNav(s, J) {
    const pages = EXT.journey.filter((d) => avail(d, s));
    const btn = (id, icon, label, on) => '<button class="subbtn" data-jv="' + id + '" aria-pressed="' + on + '">' + I(icon) + label + '</button>';
    let h = '<div class="subnav" role="group" aria-label="Journey pages">' + btn('quests', 'journey', 'Quests &amp; notes', J.view === 'quests') + btn('history', 'history', 'Dialogue history', J.view === 'history');
    if (!grouped(s)) return h + pages.map((d) => btn(d.id, d.icon || 'journey', esc(d.en), J.view === d.id)).join('') + '</div>';
    const inGroup = pages.filter((d) => JOURNEY_GROUPS[d.id]);
    let groupShown = false;
    for (const d of pages) {
      if (!JOURNEY_GROUPS[d.id]) { h += btn(d.id, d.icon || 'journey', esc(d.en), J.view === d.id); continue; }
      if (groupShown) continue;
      groupShown = true;
      h += btn(inGroup[0].id, 'keepsake', 'Mementos', !!JOURNEY_GROUPS[J.view]);
    }
    h += '</div>';
    if (JOURNEY_GROUPS[J.view] && inGroup.length > 1) h += '<div class="subnav sub2" role="group" aria-label="Mementos">' + inGroup.map((d) => btn(d.id, d.icon || 'journey', esc(d.en), J.view === d.id)).join('') + '</div>';
    return h;
  }
  function journey(A, B, two) {
    const s = RB.game.s;
    const J = view.journey;
    const sub = journeyNav(s, J);
    const xj = extOf('journey', J.view);
    if (xj && avail(xj, s)) {
      A.innerHTML = sub;
      const holder = RB.ui.el('div', 'xpage');
      A.appendChild(holder);
      xj.render(holder, B, two, api('journey'));
      A.addEventListener('click', (e) => { const v = e.target.closest('[data-jv]'); if (v) { remember(); J.view = v.dataset.jv; render(); } });
      return;
    }
    if (J.view !== 'quests' && J.view !== 'history') J.view = 'quests';
    if (J.view === 'history') {
      const lines = s.backlog.slice(-120);
      A.innerHTML = sub + '<h3>Dialogue history <span class="count">' + lines.length + ' lines, oldest first</span></h3>' +
        (lines.length ? '<ol class="entries history">' + lines.map((l) => {
          const ch = l.who === 'pc' ? { name: { en: s.player.name } } : RB.content.chars[l.who];
          // Suzu's lines as she speaks them now (the history itself keeps the standard line)
          const v = RB.dialect && !l.choice ? RB.dialect.line(l.who, l) : l;
          // a line kept with the scene it was said in is a spoken line: Voice says it from its recording (or the
          // device's voice), the spoken word marked (src/ui/22c_spoken_panel.js); a line from an older save, a reply
          // you chose, has none
          const said = l.sceneId && l.jp && !l.choice && RB.ui.spoken ? RB.ui.spoken.html({ who: l.who === 'comp' ? l.comp || 'comp' : l.who, jp: l.jp, en: l.en, sceneId: l.sceneId }, { cls: 'h-said', jpCls: 'jp', enCls: 'en' }) : '';
          return '<li class="entry"><span class="mark">' + I(l.choice ? 'next' : 'history') + '</span><div><div class="who">' + (l.choice ? 'You chose' : ch ? esc(ch.name.en) : '') + '</div>' + (said || j(v.jp) + en(v.en)) + '</div>' +
            (RB.ui.keep ? RB.ui.keep.historyButton(s, l) : '') + '</li>'; // Keep this sentence (src/ui/66_words_pages.js)
        }).join('') + '</ol>' : '<p class="muted">Nothing said yet.</p>');
      B.innerHTML = '<p class="muted">The history keeps the last 120 lines, in both languages. Replay a line’s voice from the dialogue box while it is on screen.</p>';
      requestAnimationFrame(() => { if (!view.scroll[key()]) A.scrollTop = A.scrollHeight; });
    } else {
      // a main-road quest from a chapter already left behind reads as completed
      // (saves from before its last stage was closed; the save is not changed)
      const past = (d) => d && d.main && d.chapter && s.chapter > d.chapter;
      const qs = Object.keys(s.quests).map((id) => {
        const d = RB.content.quests[id], q = s.quests[id];
        return { id, d, q: !q.done && past(d) ? Object.assign({}, q, { done: true }) : q };
      }).filter((x) => x.d);
      // the followed quest first (markers point to it), then the main road, then the most recently advanced
      const fid = RB.questGuide.mode() === 'full' ? RB.questGuide.followed(s) : null;
      const active = qs.filter((x) => !x.q.done).sort((a, b) => (b.id === fid) - (a.id === fid) || (a.d.main ? -1 : 1) - (b.d.main ? -1 : 1) || b.q.t - a.q.t);
      const done = qs.filter((x) => x.q.done).sort((a, b) => b.q.t - a.q.t);
      const mains = active.filter((x) => x.d.main || x.id === fid), others = active.filter((x) => !x.d.main && x.id !== fid);
      if (!J.sel || !qs.find((x) => x.id === J.sel)) J.sel = (mains[0] || others[0] || done[0] || {}).id || null;
      // the quest on the page finished since it was chosen while open: the page turns to the one followed now (FR-1
      // F08); a finished quest the player opened from the list stays
      const cur = qs.find((x) => x.id === J.sel);
      const next = (fid && active.find((x) => x.id === fid)) || mains[0] || others[0];
      if (cur && cur.q.done && J.selOpen && next) J.sel = next.id;
      J.selOpen = !!(qs.find((x) => x.id === J.sel) && !qs.find((x) => x.id === J.sel).q.done);
      const row = (x) => {
        const [k, kl] = questKind(x.id, x.d);
        const sel = two && x.id === J.sel;
        const fol = x.id === fid ? ' · <span class="ftag">' + I('follow') + 'Following</span>' : '';
        return '<li><button class="entry' + (x.q.done ? ' done' : x.d.main || x.id === fid ? ' current' : '') + (x.id === fid ? ' followed' : '') + '" data-q="' + x.id + '" aria-current="' + sel + '"' + (two ? '' : ' aria-expanded="' + (x.id === J.open) + '"') + '>' +
          '<span class="mark">' + I(x.q.done ? 'done' : k) + '</span>' +
          '<span class="body"><span class="kind">' + esc(x.q.done ? 'Completed' : kl) + fol + '</span><span class="t">' + j(x.d.title.jp) + ' <span class="en">' + esc(x.d.title.en) + '</span></span>' +
          (x.q.done ? '' : stageOf(x)) + '</span></button>' + (!two && x.id === J.open ? '<div class="inline-detail">' + questDetail(x) + '</div>' : '') + '</li>';
      };
      let h = sub;
      h += '<h3>' + I('main') + ' Now <span class="count">' + (fid && !RB.content.quests[fid].main ? 'followed, then the main road' : 'the main road') + '</span></h3>';
      // between chapters, no main quest open: the one just finished may name the way on (a main quest's `next`:
      // { jp, en, until }, or a list of them, the first whose `until` does not hold yet; Agnes, RBN-QA-033); nothing is
      // marked on the map
      const lastMain = active.some((x) => x.d.main) ? null : done.find((x) => x.d.main);
      const on = lastMain && lastMain.d.next ? [].concat(lastMain.d.next).find((n) => !RB.state.test(s, n.until)) || null : null;
      if (on) h += '<ul class="entries"><li class="entry current road-on"><span class="mark">' + I('main') + '</span><div><span class="kind">The road on</span>' + j(on.jp) + en(on.en) + '</div></li></ul>';
      h += mains.length ? '<ul class="entries">' + mains.map(row).join('') + '</ul>' : on ? '' : '<p class="muted">Nothing pressing. Walk around; people will tell you what they need.</p>';
      if (others.length) h += '<h3>' + I('side') + ' Also on the way <span class="count">' + others.length + ' optional</span></h3><ul class="entries">' + others.map(row).join('') + '</ul>';
      h += placesBlock(s);
      const notes = (s.journal || []).slice(-8).reverse();
      if (notes.length) h += '<h3>' + I('note') + ' Notes to self</h3><ul class="entries">' + notes.map((e) => '<li class="entry"><span class="mark">' + I('note') + '</span><div>' + j(e.jp) + en(e.en) + '</div></li>').join('') + '</ul>';
      if (done.length) h += '<details class="done-list"' + (J.doneOpen ? ' open' : '') + '><summary><h3>' + I('done') + ' Completed <span class="count">' + done.length + '</span></h3></summary><ul class="entries">' + done.map(row).join('') + '</ul></details>';
      A.innerHTML = h;
      const selQ = qs.find((x) => x.id === J.sel);
      // another quest on the page: one press back to the one followed (its markers are what the map shows)
      const back = two && fid && selQ && selQ.id !== fid && active.find((x) => x.id === fid)
        ? '<p class="j-followed"><button type="button" class="pbtn quiet" data-showq="' + esc(fid) + '">' + I('follow') + '<span>Show the followed quest</span></button></p>' : '';
      B.innerHTML = back + (selQ ? questDetail(selQ) : '<p class="muted">Choose a quest to read its notes.</p>');
      const dl = A.querySelector('details.done-list');
      if (dl) dl.ontoggle = () => { J.doneOpen = dl.open; };
    }
    B.onclick = (e) => {
      const sq = e.target.closest('[data-showq]');
      if (sq) { J.sel = sq.dataset.showq; J.selOpen = true; remember(); render(); return; }
      guideClick(e);
    };
    A.onclick = (e) => {
      const v = e.target.closest('[data-jv]');
      if (v) { remember(); J.view = v.dataset.jv; render(); return; }
      if (RB.ui.keep && RB.ui.keep.historyClick(e)) return;
      if (guideClick(e)) return;
      const q = e.target.closest('[data-q]');
      if (q) {
        if (two) { J.sel = q.dataset.q; J.selOpen = !(s.quests[J.sel] && s.quests[J.sel].done); remember(); render(); }
        else { J.open = J.open === q.dataset.q ? null : q.dataset.q; remember(); render(); }
      }
    };
  }

  // ---- Words ----------------------------------------------------------------------------------
  const GUIDE = {
    basics: ['Getting around', [
      'Move with the arrow keys or WASD, or tap/click where you want to walk. Hold Shift to walk faster. Z, Enter or Space talks and examines; X or Esc goes back; C opens this folio. Controls can be remapped in Settings.',
      'On a touch screen, use the movement pad and the action button labelled with what it will do (Talk, Look). The folio button opens this book.',
      'A small ▾ marker appears above things you can examine or people you can talk to. Talk to your companion by facing them and pressing Z.',
      'An amber diamond marks where the quest you follow goes next (the main road, unless you choose another in the Journey); at the edge of the view it points the way, and an amber arrow shows the way out toward another place. The Journey says the same in words and offers nudges, one at a time, if you want them. Asking is free. Settings › Play › Quest guidance turns the markers or the hints off.',
      'Nothing is timed. Take as long as you like to read, write or think.',
    ]],
    ink: ['Inkweaving (battles)', [
      'Enemies telegraph what they are about to do, in Japanese at your level. Read it: who is it aiming at? Is it heating up, hiding, or asking something?',
      'Pick a response. Ordinary words do what they mean: まもる (protect) raises a ward in front of whoever you choose, みず (water) cools heat, ひかり (light) burns off mist. Unravel restores one of its tangled words and frees a knot. Free every knot to settle the creature. Each response card says what it does and what it answers; one you have never used in battle is marked New.',
      'Point at, focus or tap a move or a state on the battle screen — Strike, Sweep, Heat, Shrouded, Gathering, Hushed, a Ward — to see what it does, how hard it hits and what answers it. Strike hits one of you; Sweep and Flood hit you both. Heat builds by one each time you leave it (at most 2) and makes every blow hit that much harder until water cools it.',
      'Then express your response in Japanese — by writing, choosing, or typing. The enemy never acts while you write or read help.',
      'Harmony is the band above your party. It fills by one each time you answer right first time with a response that cancels its move, or with Unravel. When it is full, your companion\'s coordinated technique joins your responses; using it cancels the move and empties Harmony. Each companion has one technique: Nao — Read the Opening (frees 2 knots); Mio — Clearwater Draught (restores you both, washes away Heat, mist and Gathering, frees 1 knot); Ren — Lantern Ward (a 3-point ward on each of you, frees 1 knot); Suzu — Curtain Call (frees 2 knots).',
      'A genuine mistake costs at most 1 resolve per exchange (nothing in Assisted mode). When the recogniser is unsure of your handwriting, it never costs anything. You can always step back from ordinary encounters, and defeat just returns you to the last safe place.',
    ]],
    pad: ['The writing pad', [
      'Draw one character in the box. The pad shows what it thinks you wrote ("I read this as…") and alternatives. Add character puts what you drew into your answer; nothing is sent until you press Submit.',
      'Tap a character in the answer strip to replace it; tap a gap to insert. Undo removes a stroke; Clear wipes the box. Use 小 for small kana (ゃ, っ…) and the script buttons to choose hiragana or katakana.',
      'If the recogniser can\'t read you, pick the character from the chart. That counts as "assisted" — which is fine, it just isn\'t counted as unaided handwriting.',
      'The chart lists every kana and every kanji in the game, on pages by theme (water, nature, people…) and by use (nouns, verbs…), with a search by kanji, reading, rōmaji, meaning or word. Each kanji shows its readings, meaning, words from the game and its stroke order, and you can practice writing it. Words › Kanji chart opens it any time.',
      'You can switch to choices or keyboard (IME) at any time without losing your place.',
    ]],
    bulb: ['Word help', [
      'Turn on word help with H or the lightbulb button. Then hover, focus or tap Japanese text in dialogue and notes to see its reading, romaji, meaning in context, beats (morae) and notes. On answer buttons, press and hold a word to look it up — a plain tap chooses the answer.',
      'Furigana (small readings over kanji) are always shown. Using help during a question marks that answer as assisted, with no penalty.',
    ]],
    saves: ['Saving', [
      'Six slots. Save from the folio’s Save & Load. The game also autosaves at safe places; those autosaves belong to their slot and are listed there.',
      'Before you set out with a companion, a special recovery point is kept so you can revisit that choice by loading it (a separate timeline).',
      'Saves live in this browser, for this page\'s address. Clearing site data or private browsing removes them. There is no export or cloud copy.',
    ]],
    kana: ['Kana reference', []],
  };
  // a kana's name in the Guide's chart: the lesson's own label where its group has one (っ/ッ "doubles the next
  // consonant", ー "long vowel", を "wo (o)"; romaji() writes っ as an apostrophe and ー as a dash, conventions for inside a
  // word), in words without the brackets, as on a lesson sheet (RBN-QA-039 follow-up)
  const kanaLabel = (ch, r) => { const t = r || RB.kana.romaji(ch); return /^\(.*\)$/.test(t) ? t.slice(1, -1) : t; };
  const WORD_SECTIONS = [['learning', 'My learning', '{自分|じぶん} の {学|まな}び'], ['reference', 'Reference', '{調|しら}べる'], ['practice', 'Practice', '{練習|れんしゅう}']];
  const WORD_GROUPS = { progress: 'learning', mastery: 'learning', cando: 'learning', noted: 'learning', bookmarks: 'learning', inscriptions: 'learning', practice: 'practice', letters: 'practice', compare: 'practice' };
  function wordSubs(s) {
    const lore = s.notebook.filter((n) => n.kind === 'lore' && RB.content.notes[n.id]);
    const gram = Object.keys(s.learn.items).filter((k) => k.startsWith('g:')).length;
    return [
      ['inscriptions', 'Inscriptions you can weave', '{言霊|ことだま}', s.words.filter((w) => RB.content.words[w]).length],
      ['noted', 'Words you noted', '{控|ひか}え', s.notebook.filter((n) => n.kind === 'word').length],
      ['kana', 'Kana chart', '{仮名|かな}', null],
      ['kanji', 'Kanji chart', '{漢字|かんじ}', null],
      ['grammar', 'Grammar met on the road', '{文法|ぶんぽう}', gram],
      ['lore', 'Lore & histories', '{言|い}い{伝|つた}え', lore.length],
      ['progress', 'How your learning is going', '{進|すす}み{具合|ぐあい}', null],
      ['guide', 'Guide: how things work', '{手引|てび}き', null],
    ].concat(EXT.words.filter((d) => avail(d, s)).map((d) => [d.id, d.en, d.jp, d.count ? d.count(s) : null]));
  }
  function words(A, B, two) {
    const s = RB.game.s;
    const W = view.words;
    const subs = wordSubs(s);
    if (W.sub && !subs.find((x) => x[0] === W.sub)) W.sub = null; // a page not (yet) available
    const ng = s.learn.profile === 'F' && s.learn.kanaKnown !== 'both' ? RB.lessons.nextGroup(s) : null;
    const item = ([id, l, jp, n]) => '<li><button data-sub="' + id + '" aria-current="' + (two && (W.sub || 'inscriptions') === id) + '"><span class="lbl">' + esc(l) + '</span><span class="fill"></span>' + (n != null ? '<span class="n">' + n + '</span>' : '') + '</button></li>';
    // K10 (twelve-chapter journeys): three sections; a six-chapter journey keeps its one list (F-21)
    let list = '<ul class="index">' + subs.map(item).join('') + '</ul>';
    if (grouped(s)) {
      const sec = (id) => WORD_GROUPS[id] || 'reference';
      list = WORD_SECTIONS.map(([k, en, jp]) => { const xs = subs.filter((x) => sec(x[0]) === k); return xs.length ? '<h4 class="index-sec"><span class="isec-jp" lang="ja">' + j(jp) + '</span><span class="isec-en">' + esc(en) + '</span></h4><ul class="index">' + xs.map(item).join('') + '</ul>' : ''; }).join('');
    }
    // (in sections, the sections' own headings stand for it: a "Contents" heading over "My learning" read as empty)
    const index = (grouped(s) ? '' : '<h3>Contents</h3>') + list +
      '<div class="row-acts"><button class="pbtn" data-a="practice">' + I('practice') + 'Practice (optional)</button>' +
      (ng ? '<button class="pbtn" data-a="nextkana">' + I('words') + 'Learn the next kana: ' + esc(ng.g.title || '') + '</button>' : '') + '</div>' +
      '<p class="muted small">Practice is optional review of items you are unsure of. The story teaches everything you need as you go.</p>';
    if (two) {
      const cur = W.sub || 'inscriptions';
      A.innerHTML = index;
      B.innerHTML = '<h3>' + esc(subs.find((x) => x[0] === cur)[1]) + '</h3>' + wordsSub(cur, s);
      wireWords(B, s);
    } else if (!W.sub) {
      A.innerHTML = index;
    } else {
      A.innerHTML = '<div class="backline"><button class="pbtn quiet" data-a="wback">' + I('back') + 'Contents</button></div><h3>' + esc(subs.find((x) => x[0] === W.sub)[1]) + '</h3>' + wordsSub(W.sub, s);
      wireWords(A, s);
    }
    A.addEventListener('click', async (e) => {
      const sb = e.target.closest('[data-sub]');
      if (sb) { remember(); W.sub = sb.dataset.sub; render(); return; }
      const a = e.target.closest('[data-a]');
      if (!a) return;
      if (a.dataset.a === 'wback') { remember(); W.sub = null; render(); }
      if (a.dataset.a === 'practice') { close(); await RB.challenge.practice(); }
      if (a.dataset.a === 'nextkana') { close(); await RB.lessons.run('kana'); }
    });
  }
  function wordsSub(id, s) {
    if (id === 'inscriptions') {
      const ws = s.words.map((w) => RB.content.words[w]).filter(Boolean);
      return ws.length ? '<ul class="entries notes">' + ws.map((w) => '<li class="entry filed"><span class="mark">' + I('words') + '</span><div><div class="written">' + j(w.jp) + '</div><div class="t">' + esc(w.en) + '</div>' + (w.effect ? '<div class="muted small">' + esc(w.effect) + '</div>' : '') + '</div></li>').join('') + '</ul>' : '<p class="muted">None yet.</p>';
    }
    if (id === 'noted') {
      const saved = s.notebook.filter((n) => n.kind === 'word');
      // a word's recording (its written form and reading) or the device's voice (src/audio/54_voice_route.js)
      const wkey = (n) => (RB.voice && RB.voice.refKey && n.surface && n.reading ? RB.voice.refKey.word(n.surface, n.reading) : null);
      const canSay = (n) => !!(RB.voice && RB.voice.canSayRef && RB.voice.canSayRef(wkey(n)));
      return saved.length ? '<ul class="entries notes">' + saved.map((n, i) => {
        const canSpeak = canSay(n);
        const hasKanji = /[一-鿿々]/.test(n.surface || '');
        const written = hasKanji && n.reading ? '{' + n.surface + '|' + n.reading + '}' : n.surface;
        return '<li class="entry filed"><span class="mark">' + I('note') + '</span><div><div class="written">' + j(written) + '</div>' +
          '<div class="reading">' + esc(n.reading || '') + (RB.kana && n.reading ? ' · <i>' + esc(RB.kana.romaji(n.reading)) + '</i>' : '') + '</div>' +
          '<div class="t">' + esc(n.m || '') + '</div>' + (canSpeak ? '<div class="acts"><button class="pbtn" data-say="' + i + '">' + I('sound') + 'Hear it</button></div>' : '') + '</div></li>';
      }).join('') + '</ul>' : '<p class="muted">Use word help on any Japanese text and choose “Add to notebook”.</p>';
    }
    if (id === 'kana') return kanaChart(s);
    if (id === 'kanji') {
      const met = RB.kanjiInfo ? RB.kanjiInfo.met(s).size : 0;
      const all = RB.kanjiInfo ? RB.kanjiInfo.all().length : 0;
      return '<p>Every kanji in the game — ' + all + ' of them — on pages by theme and by use, with a search. Each one shows its readings, meaning, words from the game and its stroke order, and you can practice writing it.</p>' +
        '<p class="muted small">You have met ' + met + ' of them in the story so far; they come first on each page.</p>' +
        '<div class="row-acts"><button class="pbtn" data-kchart>' + I('grid') + 'Open the kanji chart</button></div>';
    }
    if (id === 'grammar') {
      const seen = Object.keys(s.learn.items).filter((k) => k.startsWith('g:')).map((k) => k.slice(2));
      // in the order they were met; title and explanation are mixed text (English with {漢字|かな} groups)
      const pts = RB.grammar && RB.grammar.get ? seen.map((id) => RB.grammar.get(id)).filter(Boolean) : [];
      const mx = (t) => RB.learnUi.mixed(RB.script.enVars(t || ''));
      return pts.length ? '<ul class="entries notes">' + pts.map((g) => '<li class="entry filed"><span class="mark">' + I('book') + '</span><div><div class="written">' + mx(g.title) + '</div><div class="t">' + mx(g.en) + '</div>' + (g.ex || []).slice(0, 2).map((e) => '<div class="ex">' + j(e.jp) + en(e.en) + '</div>').join('') + '</div></li>').join('') + '</ul>' : '<p class="muted">Grammar you meet on the road will be collected here.</p>';
    }
    if (id === 'lore') {
      const notes = s.notebook.filter((n) => n.kind === 'lore').map((n) => RB.content.notes[n.id]).filter(Boolean);
      return notes.length ? '<ul class="entries notes">' + notes.map((n) => '<li class="entry filed"><span class="mark">' + I('scroll') + '</span><div><div class="t">' + j(n.title.jp) + ' <span class="en">' + esc(n.title.en) + '</span>' + (n.fiction ? ' <span class="sealmark small">fictional term</span>' : '') + '</div>' + (n.jp ? '<div>' + j(n.jp) + '</div>' : '') + '<div class="en">' + RB.learnUi.mixed(RB.script.enVars(n.en || '')) + '</div>' + '</div></li>').join('') + '</ul>' : '<p class="muted">Stories and inscriptions you collect will be kept here.</p>';
    }
    if (id === 'progress') {
      const L = s.learn;
      const items = Object.values(L.items);
      const by = (p) => items.filter((r) => r.id && r.id.startsWith(p));
      const strong = (arr) => arr.filter((r) => r.box >= 3).length;
      return '<dl class="stats">' + [['k:', 'Characters'], ['v:', 'Vocabulary'], ['g:', 'Grammar'], ['c:', 'Comprehension']].map(([p, l]) => '<dt>' + l + '</dt><dd>' + by(p).length + ' met · ' + strong(by(p)) + ' steady</dd>').join('') + '</dl>' +
        '<h3>How you answered</h3><dl class="stats"><dt>Recognised (chose from options)</dt><dd>' + L.stats.recog + '</dd><dt>Recalled and typed</dt><dd>' + L.stats.typed + '</dd><dt>Handwritten and recognised</dt><dd>' + L.stats.hand + '</dd><dt>Assisted (help or manual correction)</dt><dd>' + L.stats.assisted + '</dd></dl>' +
        '<p class="muted small">These are counted separately because choosing, typing and writing show different things. None of them is a lesser way to play.</p>';
    }
    if (id === 'guide') {
      const g = view.words.guide;
      let h = '<div class="subnav" role="group" aria-label="Guide topics">' + Object.keys(GUIDE).map((k) => '<button class="subbtn" data-g="' + k + '" aria-pressed="' + (g === k) + '">' + esc(GUIDE[k][0]) + '</button>').join('') + '</div>';
      if (g === 'kana') {
        const groups = RB.lessons.groups();
        h += '<p class="muted small">Choose a character to see its stroke order. Kana you have been taught are marked with a dot.</p><div class="kdemo-box"><div class="kdemo-fig"><canvas width="160" height="160" class="kdemo"></canvas></div><div class="kinfo muted">Stroke order appears here.</div></div>';
        for (const gr of groups) {
          h += '<div class="kgroup"><span class="kgl">' + esc(gr.title || '') + '</span><span class="kcells">' + RB.lessons.groupChars(gr).map((c) => {
            const taught = !RB.learn.taughtKana() || (s.learn.taught && s.learn.taught[c.ch]) || (s.learn.kanaKnown === 'hira' && RB.kana.isHira(c.ch));
            return '<button class="kcell' + (taught ? ' taught' : '') + '" lang="ja" data-k="' + esc(c.ch) + '"' + (c.r ? ' data-r="' + esc(c.r) + '"' : '') + ' aria-label="' + esc(c.ch + ' ' + kanaLabel(c.ch, c.r) + (taught ? ', taught' : '')) + '">' + esc(c.ch) + '</button>';
          }).join('') + '</span></div>';
        }
      } else {
        h += GUIDE[g][1].map((t) => '<p>' + esc(t) + '</p>').join('');
      }
      return h;
    }
    const xw = extOf('words', id);
    if (xw) return xw.html(s, api('words'));
    return '';
  }
  function wireWords(el, s) {
    const xw = extOf('words', view.words.sub || 'inscriptions');
    if (xw && xw.wire) { xw.wire(el, s, api('words')); return; }
    el.onclick = (e) => {
      if (e.target.closest('[data-kchart]')) { RB.kanjiChart.open({ mode: 'browse', kana: 'any' }); return; }
      const g = e.target.closest('[data-g]');
      if (g) { stopDemo(); view.words.guide = g.dataset.g; remember(); render(); return; }
      const k = e.target.closest('[data-k]');
      if (k) {
        stopDemo();
        const ch = k.dataset.k, at = leafY(k);
        stopDemo = RB.lessons.demoInto(el.querySelector('.kdemo-fig'), ch, 160, 'kdemo');
        el.querySelector('.kinfo').innerHTML = '<div class="jp" lang="ja" style="font-size:2.4em;line-height:1.2">' + esc(ch) + '</div><div>' + esc(kanaLabel(ch, k.dataset.r)) + '</div>';
        revealDemo(el, ch, at);
        return;
      }
      if (e.target.closest('[data-kback]')) { kanaBack(el); return; }
      const say = e.target.closest('[data-say]');
      if (say) { const n = s.notebook.filter((x) => x.kind === 'word')[+say.dataset.say]; if (n && RB.voice) RB.voice.sayRef(n.surface && n.reading && RB.voice.refKey ? RB.voice.refKey.word(n.surface, n.reading) : null, n.reading || n.surface); }
    };
  }
  // RBN-QA-067: the stroke-order box sits above the chart, so a kana chosen further down drew out of view. When the box
  // is not wholly in view, the Guide's own page (its scrolling leaf: never the window or the facing page) moves once,
  // at once, to show it, and "Back to ‹kana› in the chart" returns to where you were and to that kana. When the box is
  // in view nothing moves. (Back puts the kana where it was on the page when you chose it, whatever the box's height.)
  let kanaReturn = null;
  const leafY = (n) => { const leaf = n.closest('.leaf'); return leaf ? n.getBoundingClientRect().top - leaf.getBoundingClientRect().top : 0; };
  function revealDemo(el, ch, at) {
    const box = el.querySelector('.kdemo-box'), leaf = box && box.closest('.leaf');
    kanaReturn = null;
    if (!box || !leaf) return;
    const lr = leaf.getBoundingClientRect(), br = box.getBoundingClientRect();
    if (br.top >= lr.top && br.bottom <= lr.bottom) return;
    kanaReturn = { at, ch };
    leaf.scrollTo({ top: Math.max(0, leaf.scrollTop + br.top - lr.top - 8), behavior: 'instant' });
    const info = el.querySelector('.kinfo');
    info.insertAdjacentHTML('beforeend', '<button class="pbtn kback" data-kback>Back to <span lang="ja">' + esc(ch) + '</span> in the chart</button>');
    info.querySelector('[data-kback]').focus({ preventScroll: true });
  }
  function kanaBack(el) {
    const r = kanaReturn, box = el.querySelector('.kdemo-box'), leaf = box && box.closest('.leaf'), btn = el.querySelector('[data-kback]');
    kanaReturn = null;
    if (btn) btn.remove();
    const cell = r && leaf && [...el.querySelectorAll('.kcell')].find((x) => x.dataset.k === r.ch);
    if (!cell) return;
    leaf.scrollTo({ top: Math.max(0, leaf.scrollTop + leafY(cell) - r.at), behavior: 'instant' });
    cell.focus({ preventScroll: true });
  }
  function kanaChart(s) {
    const K = RB.kana;
    const groups = RB.lessons.groups();
    if (!groups.length) return '<p class="muted">Kana chart unavailable.</p>';
    const rec = s.learn.items;
    const LV = ['not met', 'met', 'practicing', 'steady'];
    const cell = (ch) => {
      const r = rec['k:' + ch];
      const lvl = !r ? 0 : r.box >= 3 ? 3 : r.box >= 1 ? 2 : 1;
      return '<span class="kc l' + lvl + '" lang="ja" title="' + esc(K.romaji(ch) + ' — ' + LV[lvl]) + '"><span class="ch">' + esc(ch) + '</span><span class="sr"> ' + esc(K.romaji(ch) + ', ' + LV[lvl]) + '</span></span>';
    };
    let h = '<p class="muted small">Each character’s underline shows how settled it is:</p><div class="klegend">' + LV.map((l, i) => '<span class="kc l' + i + '"><span class="ch">あ</span></span> ' + esc(l)).join(' &nbsp; ') + '</div>';
    for (const g of groups) h += '<div class="kgroup"><span class="kgl">' + esc(g.title || '') + '</span><span class="kcells">' + RB.lessons.groupChars(g).map((c) => cell(c.ch)).join('') + '</span></div>';
    return h;
  }

  // ---- Satchel -------------------------------------------------------------------------------
  // Slots, the worn look and each item's keyword tags come from RB.equip
  // (src/engine/07_equip.js), derived from the item data. Equipped things are
  // marked by shape and words (an "Equipped" tag on a faded, tinted row), never
  // by colour alone; the Key at the foot of the list explains every mark shown.
  const EQ = () => RB.equip;
  const lab = (jp, en) => RB.ui.label(jp, en);
  const tagChip = (t) => '<span class="etag ' + t.kind + '" data-tag="' + esc(t.id) + '">' + I(t.icon) + '<span>' + (t.kind === 'cost' ? '<span class="sr">Drawback: </span>' : '') + lab(t.jp, t.en) + '</span></span>';
  const tagRow = (d) => '<span class="etags">' + EQ().tags(d).map(tagChip).join('') + '</span>';
  const wornChip = () => '<span class="worn-tag">' + I('worn') + '<span>' + lab('{装備中|そうびちゅう}', 'Equipped') + '</span></span>';
  const ACC_WORD = { hat: 'hat', cap: 'cap', scarf: 'scarf', earrings: 'earrings', flower: 'flower', cape: 'cape' };
  // The book's Satchel (U04, UI-07): an appearance study facing the equipment folio: the traveller as they look now,
  // in portrait, on the road and in battle, and what each slot holds, named
  function appearanceStudy(s) {
    const cos = esc(s.equip.cosmetic || '');
    const F = RB.sprites.FRAME || { w: 40, h: 58 };
    const worn = EQ().SLOTS.map((z) => {
      const id = s.equip[z.id], it = id && RB.content.items[id];
      return '<li><span class="as-k">' + lab(z.jp, z.en) + '</span><span class="as-v">' + (it ? RB.itemArt.html(id, 2, 'as-ic') + j(it.name.jp) + ' <span class="en">' + esc(it.name.en) + '</span>' : '<span class="muted">nothing worn</span>') + '</span>' +
        changeBtn(s, z, true) + '</li>';
    }).join('');
    return '<figure class="as-study"><figcaption>' + lab('{旅姿|たびすがた}', 'As you travel') + '</figcaption><div class="as-figs">' +
      '<canvas width="96" height="96" data-prev="' + cos + '" data-dir="face" role="img" aria-label="Your portrait as you look now"></canvas>' +
      '<canvas width="' + F.w + '" height="' + F.h + '" data-prev="' + cos + '" data-dir="down" role="img" aria-label="You on the road"></canvas>' +
      '<canvas width="' + F.w + '" height="' + F.h + '" data-prev="' + cos + '" data-dir="battle" role="img" aria-label="You in battle"></canvas></div>' +
      '<ul class="as-worn">' + worn + '</ul></figure>';
  }
  function wearPreview(id, d, s) {
    const rep = EQ().replaces(s.player.look, id).map((a) => ACC_WORD[a] || a);
    // on the road (front, side and back, 40×58) and in battle (seen from behind, facing the foe), all at 2 CSS px per art px
    const views = [['down', 'Front'], ['right', 'Side'], ['up', 'Back'], ['battle', 'In battle']];
    const F = RB.sprites.FRAME || { w: 40, h: 58 };
    return '<figure class="wear-prev"><figcaption>How you look wearing it</figcaption><div class="wp-row">' +
      views.map(([dir, cap]) => '<div class="wp' + (dir === 'battle' ? ' wp-battle' : '') + '"><canvas width="' + F.w + '" height="' + F.h + '" data-prev="' + esc(id) + '" data-dir="' + dir + '" role="img" aria-label="' + esc('You wearing the ' + d.name.en + ': ' + cap.toLowerCase()) + '"></canvas><span>' + esc(cap) + '</span></div>').join('') +
      '<div class="wp wp-face"><canvas width="96" height="96" data-prev="' + esc(id) + '" data-dir="face" role="img" aria-label="' + esc('Your portrait wearing the ' + d.name.en) + '"></canvas><span>Portrait</span></div></div>' +
      (rep.length ? '<p class="muted small">You already wear a ' + esc(rep.join(' and ')) + '; this takes its place, in its own colours, while you wear it.</p>' : '') + '</figure>';
  }
  function drawPreviews(root, s) {
    for (const cv of root.querySelectorAll('canvas[data-prev]')) {
      const look = EQ().lookWith(s.player.look, cv.dataset.prev);
      if (cv.dataset.dir === 'face') { RB.portraits.drawPlayer(cv, look, 'smile'); continue; }
      if (cv.dataset.dir === 'battle') { battlePreview(cv, look); continue; }
      const art = RB.sprites.getArt(look, cv.dataset.dir, 0);
      const c = cv.getContext('2d');
      c.clearRect(0, 0, cv.width, cv.height);
      if (art) c.drawImage(art, 0, 0);
    }
  }
  // The battle figure in its ready stance (RB.battlers), trimmed to the figure and shown at the same
  // 2 CSS px per art px as the road sprites beside it.
  function battlePreview(cv, look) {
    const B = RB.battlers;
    if (!B) return;
    const src = B.preview(look, 'ready', null, 0, { who: 'pc', reduce: true });
    const d = src.getContext('2d').getImageData(0, 0, src.width, src.height).data;
    let x0 = src.width, y0 = src.height, x1 = -1, y1 = -1;
    for (let y = 0; y < src.height; y++) for (let x = 0; x < src.width; x++) if (d[(y * src.width + x) * 4 + 3]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    if (x1 < 0) return;
    x0 = Math.max(0, x0 - 2); y0 = Math.max(0, y0 - 2); x1 = Math.min(src.width - 1, x1 + 2); y1 = Math.min(src.height - 1, y1 + 2);
    cv.width = x1 - x0 + 1; cv.height = y1 - y0 + 1;
    cv.style.width = cv.width * 2 + 'px'; cv.style.height = cv.height * 2 + 'px';
    const c = cv.getContext('2d');
    c.imageSmoothingEnabled = false;
    c.drawImage(src, -x0, -y0);
  }
  function itemDetail(x, s) {
    const d = x.d;
    const eqd = !!d.slot && EQ().isWorn(s, x.id);
    const z = d.slot && EQ().slot(d.slot);
    let h = '<div class="idetail' + (eqd ? ' worn' : '') + '"><div class="ibig">' + RB.itemArt.html(x.id, 4) + '</div><h3>' + j(d.name.jp) + ' <span class="en">' + esc(d.name.en) + '</span>' + (x.n > 1 ? ' <span class="count">×' + x.n + '</span>' : '') + '</h3>' +
      (eqd ? '<p class="worn-line">' + wornChip() + '</p>' : '') +
      '<p>' + esc(RB.script.enVars(d.desc || '')) + '</p>' +
      (d.key ? '<p class="note-slip">' + I('key') + ' Important: it can’t be sold, used up or lost.</p>' : '');
    if (z) {
      const cur = s.equip[d.slot] && !eqd && RB.content.items[s.equip[d.slot]];
      h += '<div class="ph small-ph">What it does</div><ul class="tagx">' + EQ().tags(d).map((t) => '<li>' + tagChip(t) + '<span class="x">' + esc(t.key) + '</span></li>').join('') + '</ul>';
      if (d.acc) h += wearPreview(x.id, d, s);
      h += '<p class="muted small">Worn as: ' + esc(z.en.toLowerCase()) + ' (' + esc(z.where) + '). ' + (eqd ? 'Equipped now.' : cur ? 'Equipping it takes off the ' + esc(cur.name.en) + '.' : 'That slot is empty.') + '</p>' +
        '<div class="acts"><button class="pbtn' + (eqd ? '' : ' primary') + '" data-' + (eqd ? 'unequip="' + d.slot : 'equip="' + x.id) + '">' + (eqd ? lab('{外|はず}す', 'Take it off') : lab('{装備|そうび}する', 'Equip')) + '</button></div>';
    }
    return h + '</div>';
  }
  // ---- what a slot holds, chosen from a short list (LI-1, Robin 2026-10-16): each slot's Change… button (the Equipped
  // list, and the worn list under the appearance study) opens the things that fit it, the one worn now ticked, and
  // Nothing. Choosing one wears it at once (the study and the rows redraw); Escape or a click outside closes the list
  // and gives the keyboard back to the button. Equip and Take off on an item's own page work as before.
  function changeBtn(s, z, small) {
    const fits = Object.keys(s.inv).filter((id) => RB.content.items[id] && RB.content.items[id].slot === z.id).length;
    if (!fits && !s.equip[z.id]) return '';
    const word = s.equip[z.id] ? 'Change…' : 'Choose…';
    return '<button type="button" class="pbtn eq-change' + (small ? ' quiet small' : '') + '" data-pick-slot="' + z.id + '" aria-haspopup="menu" aria-expanded="false" aria-label="' + esc(word.replace('…', '') + ' your ' + z.en.toLowerCase()) + '">' + esc(word) + '</button>';
  }
  let pick = null;
  function closePick(refocus) {
    if (!pick) return;
    const p = pick;
    pick = null;
    RB.ui.popLayer(p.lay);
    if (p.anchor && p.anchor.isConnected) p.anchor.setAttribute('aria-expanded', 'false');
    if (refocus && fr) {
      const b = fr.box.querySelector('[data-pick-slot="' + p.slot + '"]' + (p.study ? '.small' : ':not(.small)')) || fr.box.querySelector('[data-pick-slot="' + p.slot + '"]');
      if (b) b.focus({ preventScroll: true });
    }
  }
  function pickFor(slotId, anchor) {
    closePick(false);
    const s = RB.game.s, z = EQ().slot(slotId);
    if (!z || !fr) return;
    const cur = s.equip[slotId] || null;
    const fits = Object.keys(s.inv).filter((id) => RB.content.items[id] && RB.content.items[id].slot === slotId);
    const row = (id) => {
      const d = id && RB.content.items[id], on = (id || null) === cur;
      const tags = d ? EQ().tags(d).map((t) => esc(t.en)).join(' · ') : 'Take off what is worn here';
      return '<button type="button" class="eq-opt' + (on ? ' on' : '') + '" role="menuitemradio" aria-checked="' + on + '" data-pick="' + (id || '') + '">' +
        '<span class="eq-tick" aria-hidden="true">' + (on ? I('done') : '') + '</span>' +
        (d ? RB.itemArt.html(id, 2) : '<span class="it-ic it-ic-line" aria-hidden="true">' + I('none') + '</span>') +
        '<span class="eq-opt-t">' + (d ? j(d.name.jp) + ' <span class="en">' + esc(d.name.en) + '</span>' : '<span class="en">' + lab('{何|なに}も なし', 'Nothing') + '</span>') +
        '<span class="eq-opt-k">' + tags + '</span></span></button>';
    };
    const wrap = RB.ui.el('div', 'eq-pick-wrap');
    const box = RB.ui.el('div', 'eq-pick');
    box.setAttribute('role', 'menu');
    box.setAttribute('aria-label', 'What to wear as your ' + z.en.toLowerCase());
    box.innerHTML = '<div class="eq-pick-h">' + lab(z.jp, z.en) + ' <span class="muted small">' + esc(z.where) + '</span></div>' + fits.map(row).join('') + row(null);
    wrap.appendChild(box);
    const lay = { el: wrap, name: 'equip-pick', parent: fr.el };
    lay.onCancel = () => { closePick(true); return true; };
    pick = { lay, slot: slotId, anchor, study: anchor.classList.contains('small') };
    RB.ui.pushLayer(lay);
    anchor.setAttribute('aria-expanded', 'true');
    // beside the button that opened it, kept inside the book
    const fb = fr.el.getBoundingClientRect(), ab = anchor.getBoundingClientRect();
    const w = Math.min(380, fb.width - 24);
    box.style.width = w + 'px';
    const left = Math.max(12, Math.min(fb.width - w - 12, ab.right - fb.left - w));
    const room = fb.bottom - ab.bottom - 16, above = ab.top - fb.top - 16;
    box.style.left = left + 'px';
    box.style.maxHeight = Math.max(160, Math.max(room, above)) + 'px';
    if (room >= Math.min(box.scrollHeight, 260) || room >= above) box.style.top = (ab.bottom - fb.top + 6) + 'px';
    else box.style.bottom = (fb.bottom - ab.top + 6) + 'px';
    const opts = () => Array.from(box.querySelectorAll('.eq-opt'));
    (box.querySelector('.eq-opt.on') || opts()[0]).focus({ preventScroll: true });
    box.addEventListener('keydown', (e) => {
      const o = opts(), i = o.indexOf(document.activeElement);
      let k = null;
      if (e.key === 'ArrowDown') k = (i + 1) % o.length; else if (e.key === 'ArrowUp') k = (i - 1 + o.length) % o.length;
      else if (e.key === 'Home') k = 0; else if (e.key === 'End') k = o.length - 1;
      else if (e.key === 'Tab') { e.preventDefault(); k = (i + (e.shiftKey ? -1 : 1) + o.length) % o.length; }
      if (k == null) return;
      e.preventDefault(); e.stopPropagation();
      o[k].focus();
    });
    wrap.addEventListener('pointerdown', (e) => { if (e.target === wrap) { e.preventDefault(); closePick(true); } });
    box.addEventListener('click', (e) => {
      const b = e.target.closest('[data-pick]');
      if (!b) return;
      const id = b.dataset.pick || null;
      const was = s.equip[slotId] || null, study = pick && pick.study;
      if (id && id !== was) EQ().equip(s, id);
      else if (!id && was) EQ().unequip(s, slotId);
      RB.audio && RB.audio.sfx(id !== was ? 'confirm' : 'cursor');
      closePick(false);
      remember(); render();
      const live = fr.el.querySelector('.eq-live');
      const d = RB.content.items[id || was];
      if (live && id !== was) live.textContent = id ? 'Equipped: ' + d.name.en + '.' : d ? 'Taken off: ' + d.name.en + '.' : '';
      const again = fr.box.querySelector('[data-pick-slot="' + slotId + '"]' + (study ? '.small' : ':not(.small)'));
      (again || fr.el).focus({ preventScroll: true });
    });
  }
  function satchel(A, B, two) {
    const s = RB.game.s;
    const S = view.satchel;
    const inv = Object.keys(s.inv).map((id) => ({ id, n: s.inv[id], d: RB.content.items[id] })).filter((x) => x.d);
    if (!S.sel || !inv.find((x) => x.id === S.sel)) S.sel = inv[0] ? inv[0].id : null;
    // the slots: what is worn, what it does, or what could go there
    const filled = EQ().SLOTS.filter((z) => s.equip[z.id] && RB.content.items[s.equip[z.id]]).length;
    let h = '<h3>' + I('worn') + ' ' + lab('{装備|そうび}', 'Equipped') + ' <span class="count">' + filled + ' of ' + EQ().SLOTS.length + ' slots</span></h3><ul class="entries eq-slots">' + EQ().SLOTS.map((z) => {
      const id = s.equip[z.id], it = id && RB.content.items[id];
      const fits = inv.filter((x) => x.d.slot === z.id && x.id !== id).length;
      return '<li class="entry eq-slot ' + (it ? 'worn' : 'empty') + '" data-slot="' + z.id + '"><span class="mark">' + (it ? RB.itemArt.html(id, 2) : I(z.icon)) + '</span><div class="eq-body">' +
        '<div class="kind">' + lab(z.jp, z.en) + ' · ' + esc(z.where) + '</div>' +
        (it ? '<div class="t">' + j(it.name.jp) + ' <span class="en">' + esc(it.name.en) + '</span></div>' +
            '<div class="eq-foot">' + tagRow(it) + changeBtn(s, z) + '</div>'
          : '<div class="t muted">' + lab('{空|あ}き', 'Empty') + '</div><div class="eq-foot"><span class="muted small">' + (fits ? fits + (fits > 1 ? ' things' : ' thing') + ' you carry can go here.' : 'Nothing you carry fits here yet.') + '</span>' + changeBtn(s, z) + '</div>') +
        '</div></li>';
    }).join('') + '</ul>';
    h += '<h3>' + I('satchel') + ' ' + lab('{持|も}ち{物|もの}', 'Carried') + ' <span class="count">' + inv.length + '</span></h3>';
    if (!inv.length) h += '<p class="muted">Your pack is light.</p>';
    else h += '<ul class="entries">' + inv.map((x) => {
      const worn = !!x.d.slot && EQ().isWorn(s, x.id), z = x.d.slot && EQ().slot(x.d.slot);
      return '<li><button class="entry item-row' + (worn ? ' worn' : z ? ' wearable' : '') + '" data-it="' + x.id + '" aria-current="' + (two && S.sel === x.id) + '"' + (two ? '' : ' aria-expanded="' + (S.open === x.id) + '"') + '>' +
        '<span class="mark">' + RB.itemArt.html(x.id, 2) + (s.newItems && s.newItems[x.id] ? '<span class="new-dot" title="New"><span class="sr">New</span></span>' : '') + '</span><span class="body"><span class="t">' + j(x.d.name.jp) + ' <span class="en">' + esc(x.d.name.en) + '</span>' + (x.n > 1 ? ' <span class="count">×' + x.n + '</span>' : '') + '</span>' +
        (x.d.key ? '<span class="kind">' + I('key') + ' important</span>' : '') +
        (z ? '<span class="kind slotline">' + (worn ? wornChip() : '') + '<span>' + lab(z.jp, z.en) + (worn ? '' : ' · can be worn') + '</span></span>' + tagRow(x.d) : '') +
        '</span></button>' + (!two && S.open === x.id ? '<div class="inline-detail">' + itemDetail(x, s) + '</div>' : '') + '</li>';
    }).join('') + '</ul>';
    // the key: every mark on this page, explained
    const seen = [];
    for (const x of inv) if (x.d.slot) for (const t of EQ().tags(x.d)) if (!seen.some((u) => u.id === t.id)) seen.push(t);
    if (seen.length) {
      h += '<h3>' + I('help') + ' ' + lab('{印|しるし} の {見方|みかた}', 'Key to the marks') + '</h3><ul class="tagx tag-key">' +
        '<li>' + wornChip() + '<span class="x">Worn now. Each slot holds one thing; equipping another takes it off.</span></li>' +
        seen.map((t) => '<li>' + tagChip(t) + '<span class="x">' + esc(t.key) + '</span></li>').join('') + '</ul>' +
        (seen.some((t) => t.kind === 'cost') ? '<p class="muted small">A dashed mark with a minus sign is the drawback that comes with a charm.</p>' : '');
    }
    h += '<p class="muted small">Important items cannot be sold or used up. Nothing essential can be lost.</p>';
    const selX = inv.find((x) => x.id === S.sel);
    // the study faces the folio (on a phone, it heads the page)
    if (two) { A.innerHTML = h; B.innerHTML = appearanceStudy(s) + (selX ? itemDetail(selX, s) : '<p class="muted">Choose something you carry to look at it closely.</p>'); }
    else A.innerHTML = appearanceStudy(s) + h;
    drawPreviews(A, s); drawPreviews(B, s);
    // a polite announcement of what changed (the page itself is redrawn)
    let live = fr.el.querySelector('.eq-live');
    if (!live) { live = RB.ui.el('p', 'sr eq-live'); live.setAttribute('aria-live', 'polite'); fr.el.appendChild(live); }
    const handler = (e) => {
      const pk = e.target.closest('[data-pick-slot]');
      if (pk) { pickFor(pk.dataset.pickSlot, pk); return; }
      const it = e.target.closest('[data-it]');
      const eq = e.target.closest('[data-equip]'), un = e.target.closest('[data-unequip]');
      const page = e.currentTarget;
      if (eq || un) {
        const id = eq ? eq.dataset.equip : s.equip[un.dataset.unequip];
        const d = RB.content.items[id], sl = eq ? d.slot : un.dataset.unequip;
        const inline = !!(eq || un).closest('.inline-detail');
        if (eq) { EQ().equip(s, id); RB.audio && RB.audio.sfx('confirm'); } else EQ().unequip(s, sl);
        remember(); render();
        live.textContent = d ? (eq ? 'Equipped: ' : 'Taken off: ') + d.name.en + '.' : '';
        // keep the keyboard where it was: the same control, now reading the other way
        const leaves = fr.box.querySelectorAll('.leaf'), again = leaves[page === B ? 1 : 0];
        const want = (inline ? '.inline-detail ' : '') + (eq ? '[data-unequip="' + sl + '"]' : '[data-equip="' + id + '"]');
        const next = again && (again.querySelector(want) || again.querySelector('[data-it="' + id + '"]'));
        (next || again || fr.el).focus({ preventScroll: true });
        return;
      }
      if (it) { if (two) S.sel = it.dataset.it; else S.open = S.open === it.dataset.it ? null : it.dataset.it; remember(); render(); }
    };
    A.onclick = handler; B.onclick = handler;
  }

  // ---- Map ------------------------------------------------------------------------------------
  // Where the followed quest's next step is, as chart places (quest guidance, markers on)
  function guideMarks(s) {
    const G = RB.questGuide;
    if (G.mode() !== 'full') return null;
    const qid = G.followed(s);
    if (!qid) return null;
    const r = G.targets(qid, s);
    const ids = [];
    for (const t of r.targets) { const p = G.placeOf(t.map); if (p && !ids.includes(p)) ids.push(p); }
    return ids.length ? { qid, places: ids, title: RB.content.quests[qid].title } : null;
  }
  // places and routes of this journey's edition (the twelve-chapter edition's places stay off a six-chapter chart)
  const inEd = (s, o) => !o || !o.edition || (RB.edition ? RB.edition.of(s) : 1) >= o.edition;
  // ---- the Route chart (LI-6, Robin 2026-10-16: "less cramped … allow it to scroll, with an option to zoom. Your
  // current location could be marked with an animated circle and the name always displayed … hovering over locations
  // could then display their name … if we're zoomed in and it makes sense spatially just display it normally.
  // Unexplored locations should still say such, just not get cut off").
  // The places' positions are the content's 520×320 chart; it is drawn taller (CH.SY) so the north's crowd spreads
  // out. Marks and words keep one size on screen at every zoom; a name is written beside its place when it has room
  // there, and otherwise appears when the place is pointed at. Drag moves the chart; +/−, Ctrl and the wheel, two
  // fingers or the keys zoom it.
  const CH = { W: 520, SY: 1.4, ZMAX: 4, LBL: 13 };
  CH.H = Math.round(320 * CH.SY);
  const cxy = (p) => [p.pos[0], p.pos[1] * CH.SY];
  // The coast, west to east, in the places' own units (before the chart's vertical stretch): the sea lies south of it.
  // Every place stands north of it but an island (src/ui/50_menu.js chart; tests/unit/chart_coast.test.mjs).
  const COAST = [[0, 284], [64, 274], [112, 268], [170, 282], [240, 290], [310, 288], [356, 286], [430, 278], [520, 276]];
  const ISLES = { kotonoha: [24, 11] }; // a place out at sea: its island's half-width and half-height
  // the coast's y at x (straight between its points: the curve drawn through them stays within a unit or two of it)
  const coastAt = (x) => { for (let i = 1; i < COAST.length; i++) if (x <= COAST[i][0]) { const [a, b] = [COAST[i - 1], COAST[i]]; return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); } return COAST[COAST.length - 1][1]; };
  // a smooth line through the coast's points (Catmull-Rom as cubic Béziers)
  function coastPath() {
    const P = COAST;
    let d = 'M' + P[0][0] + ' ' + P[0][1];
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ' C' + c1.map((v) => +v.toFixed(1)).join(' ') + ' ' + c2.map((v) => +v.toFixed(1)).join(' ') + ' ' + p2.join(' ');
    }
    return d;
  }
  let chartRO = null;
  function chartState() {
    const M = view.map;
    if (!M.chart) M.chart = { z: 1, cx: CH.W / 2, cy: CH.H / 2 };
    return M.chart;
  }
  function chartView(st) {
    const vw = CH.W / st.z, vh = CH.H / st.z;
    st.cx = Math.min(CH.W - vw / 2, Math.max(vw / 2, st.cx));
    st.cy = Math.min(CH.H - vh / 2, Math.max(vh / 2, st.cy));
    return [st.cx - vw / 2, st.cy - vh / 2, vw, vh];
  }
  function chartSvg(s, curMap) {
    const places = Object.keys(RB.content.places).map((id) => Object.assign({ id }, RB.content.places[id])).filter((p) => inEd(s, p));
    const gm = guideMarks(s);
    // you are here: the place this map belongs to (rooms count as their village)
    const hereOld = places.find((p) => curMap.place === p.id || (curMap.region && p.region === curMap.region && p.hub));
    const hereId = hereOld ? hereOld.id : RB.questGuide.placeOf(s.map);
    const nextName = gm ? gm.places.map((id) => (s.travel[id] ? RB.content.places[id].name.en : 'an unexplored place')).join(', ') : '';
    return '<svg class="chart" viewBox="' + chartView(chartState()).join(' ') + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Route chart. Known places: ' + esc(places.filter((p) => s.travel[p.id]).map((p) => p.name.en).join(', ') || 'none yet') +
      (hereId && RB.content.places[hereId] ? '. You are in or near ' + esc(RB.content.places[hereId].name.en) : '') + (gm ? '. The next step of the followed quest is in ' + esc(nextName) : '') + '.">' +
      chartInk(s, places, hereId, gm, 1, chartView(chartState())) + '</svg>';
  }
  // what is drawn on the chart at a scale of k chart units to one screen pixel, its names placed inside the part of
  // the chart in view (vb: x, y, width, height)
  function chartInk(s, places, hereId, gm, k, vb) {
    const W = CH.W, H = CH.H, NS = ' vector-effect="non-scaling-stroke"';
    const ts = Math.min(1.5, Math.max(1, (RB.game.settings && RB.game.settings.textScale) || 1));
    const fs = CH.LBL * ts * k;
    // paper, folds and the sea/mountain washes; the coast runs just below the coastal places, so the harbours and the
    // hamlets up the coast stand on land, and an island the ferry reaches (Kotonoha) is drawn as one (Robin, 2026-10-19:
    // Saltglass, Sazanami and the places near them were drawn in the sea)
    const isles = places.filter((p) => ISLES[p.id]).map((p) => '<ellipse cx="' + p.pos[0] + '" cy="' + p.pos[1] + '" rx="' + ISLES[p.id][0] + '" ry="' + ISLES[p.id][1] + '" fill="#efe3c6" stroke="#9fb5b0" stroke-width="1.2"' + NS + '/>').join('');
    let svg = '<rect width="' + W + '" height="' + H + '" fill="#efe3c6"/><g transform="scale(1 ' + CH.SY + ')"><path d="' + coastPath() + ' L520 320 L0 320Z" fill="#cfdbd6"/><path d="' + coastPath() + '" fill="none" stroke="#9fb5b0" stroke-width="1.2"' + NS + '/>' + isles + '<path d="M60 0 L140 90 L230 60 L300 120 L420 40 L520 80 L520 0Z" fill="#e2d4b2"/></g>';
    svg += '<path d="M173 0V' + H + 'M346 0V' + H + 'M0 ' + H / 2 + 'H520" stroke="#b9a57a" stroke-width="1" stroke-dasharray="2 5" opacity="0.8"' + NS + '/>';
    for (const [a, b, ro] of RB.content.roads || []) {
      const A = RB.content.places[a], B = RB.content.places[b];
      if (!A || !B || !inEd(s, ro) || !inEd(s, A) || !inEd(s, B) || (ro && ro.if && !RB.state.test(s, ro.if))) continue;
      const known = s.travel[a] && s.travel[b];
      const half = s.travel[a] || s.travel[b];
      const [ax, ay] = cxy(A), [bx, by] = cxy(B);
      // a ferry's route: a curve over the sea, in the sea's ink
      if (ro && ro.sea) {
        // (its middle well out from the coast: a quadratic's midpoint is a quarter of each end and half its control)
        const mx = (ax + bx) / 2, my = Math.max(Math.max(ay, by) + 36, 2 * (coastAt(mx) * CH.SY + 22) - (ay + by) / 2);
        svg += '<path d="M' + ax + ' ' + ay + ' Q' + mx + ' ' + my + ' ' + bx + ' ' + by + '" fill="none" stroke="' + (known ? '#2c5470' : '#7a98a8') + '" stroke-width="' + (known ? 2.2 : 1.6) + '" stroke-dasharray="' + (known ? '7 4' : '2 6') + '"' + NS + '/>';
        continue;
      }
      svg += '<line x1="' + ax + '" y1="' + ay + '" x2="' + bx + '" y2="' + by + '" stroke="' + (known ? '#3b2e1c' : '#9d8b66') + '" stroke-width="' + (known ? 2.5 : 1.6) + '" stroke-dasharray="' + (known ? '0' : half ? '6 5' : '2 6') + '"' + NS + '/>';
    }
    // the names: the place you are in first, then the next step, then the places you know, then the rest; each takes
    // the first side of its dot with room (inside the chart, clear of other names and dots), or waits to be pointed at
    const order = places.slice().sort((p, q) => rank(p) - rank(q));
    function rank(p) { return p.id === hereId ? 0 : gm && gm.places.includes(p.id) ? 1 : s.travel[p.id] ? 2 : 3; }
    const taken = places.map((p) => { const [x, y] = cxy(p); const r = 8 * k; return [x - r, y - r, x + r, y + r]; });
    const hit = (b) => taken.some((t) => b[0] < t[2] && b[2] > t[0] && b[1] < t[3] && b[3] > t[1]);
    const [vx, vy, vw, vh] = vb || [0, 0, W, H];
    const inside = (b) => b[0] >= vx + 3 * k && b[2] <= vx + vw - 3 * k && b[1] >= vy + 3 * k && b[3] <= vy + vh - 3 * k;
    // (the zoom buttons' corner, top left, is kept clear)
    taken.push([vx, vy, vx + 52 * k, vy + 132 * k]);
    const spot = {};
    for (const p of order) {
      const [x, y] = cxy(p), known = s.travel[p.id], here = p.id === hereId;
      const text = known ? p.name.en : '? unexplored';
      const w = text.length * fs * (here ? 0.6 : 0.55) + (here ? 12 * k : 0), h = fs * 1.15;
      const g = 11 * k;
      const sides = [
        { x: x + g, y: y + fs * 0.36, a: 'start', b: [x + g - 2 * k, y - h / 2, x + g + w + 2 * k, y + h / 2] },
        { x: x - g, y: y + fs * 0.36, a: 'end', b: [x - g - w - 2 * k, y - h / 2, x - g + 2 * k, y + h / 2] },
        { x: x, y: y - g - fs * 0.25, a: 'middle', b: [x - w / 2, y - g - h, x + w / 2, y - g] },
        { x: x, y: y + g + fs * 0.9, a: 'middle', b: [x - w / 2, y + g, x + w / 2, y + g + h] },
      ];
      const fits = sides.filter((c) => inside(c.b));
      const free = fits.find((c) => !hit(c.b));
      const c = free || fits[0] || sides[0];
      if (free || here) taken.push(c.b);
      spot[p.id] = { c, text, shown: !!free || here, w, h };
    }
    for (const p of places) {
      const [x, y] = cxy(p);
      const known = s.travel[p.id];
      const here = p.id === hereId;
      const next = gm && gm.places.includes(p.id);
      const L = spot[p.id];
      svg += '<g class="pl' + (here ? ' here' : '') + (L.shown ? '' : ' quiet') + '" data-place="' + p.id + '">';
      svg += '<rect class="pl-hit" x="' + (x - 13 * k) + '" y="' + (y - 13 * k) + '" width="' + 26 * k + '" height="' + 26 * k + '" fill="transparent"/>';
      if (next) svg += '<circle class="next-ring" cx="' + x + '" cy="' + y + '" r="' + 14 * k + '" fill="none" stroke="#c0761c" stroke-width="3" stroke-dasharray="5 3"' + NS + '/>';
      if (here) svg += '<circle class="here-pulse" cx="' + x + '" cy="' + y + '" r="' + 10 * k + '" fill="none" stroke="#a83e27" stroke-width="2.5"' + NS + '/>';
      svg += '<circle cx="' + x + '" cy="' + y + '" r="' + (here ? 6.5 : 6) * k + '" fill="' + (here ? '#a83e27' : known ? '#2a2217' : '#efe3c6') + '" stroke="' + (here ? '#fff6e2' : '#2a2217') + '" stroke-width="' + (here ? 2 : 1.5) + '"' + NS + '/>';
      // the quest marker: the same inked amber diamond as in the world, just above its place
      if (next) { const dx = x + (here ? 16 * k : 0), dy = y - (here ? 12 : 16) * k; svg += '<path class="next-mark" d="M' + dx + ' ' + (dy - 18 * k) + ' l' + 8 * k + ' ' + 9 * k + ' ' + -8 * k + ' ' + 9 * k + ' ' + -8 * k + ' ' + -9 * k + 'z" fill="#f0b43c" stroke="#2a2024" stroke-width="2"' + NS + '/>'; }
      const c = L.c;
      if (here) {
        // the name of where you are, always: on a small slip so it reads over anything
        const bx = c.a === 'start' ? c.x - 4 * k : c.a === 'end' ? c.x - L.w + 4 * k : c.x - L.w / 2;
        svg += '<rect class="here-slip" x="' + bx + '" y="' + (c.y - fs * 0.95) + '" width="' + L.w + '" height="' + fs * 1.35 + '" rx="' + 3 * k + '" fill="#fff6e2" stroke="#a83e27" stroke-width="1"' + NS + '/>';
        svg += '<text x="' + (c.a === 'start' ? c.x + 2 * k : c.a === 'end' ? c.x - 2 * k : c.x) + '" y="' + c.y + '" text-anchor="' + c.a + '" fill="#7a2a18" font-size="' + fs + '" font-weight="700" font-family="Georgia, serif">' + esc(L.text) + '</text>';
      } else {
        if (!L.shown) { const bx = c.a === 'start' ? c.x - 3 * k : c.a === 'end' ? c.x - L.w - 3 * k : c.x - L.w / 2 - 3 * k; svg += '<rect class="pl-slip" x="' + bx + '" y="' + (c.y - fs * 0.95) + '" width="' + (L.w + 6 * k) + '" height="' + fs * 1.35 + '" rx="' + 2 * k + '" fill="#fff8e8" stroke="#8a7650" stroke-width="1"' + NS + '/>'; }
        svg += '<text class="pl-name" x="' + c.x + '" y="' + c.y + '" text-anchor="' + c.a + '" fill="' + (known ? '#261f15' : '#62553f') + '" font-size="' + fs + '" font-family="Georgia, serif"' + (known ? '' : ' font-style="italic"') + ' stroke="#efe3c6" stroke-width="' + 3 * k + '" paint-order="stroke">' + esc(L.text) + '</text>';
      }
      svg += '</g>';
    }
    return svg;
  }
  // the chart once it is on the page: drawn for its real size, moved and zoomed
  function chartWire(box, s, curMap) {
    if (chartRO) { chartRO.disconnect(); chartRO = null; }
    const svg = box.querySelector('svg.chart');
    if (!svg) return;
    const st = chartState();
    const places = Object.keys(RB.content.places).map((id) => Object.assign({ id }, RB.content.places[id])).filter((p) => inEd(s, p));
    const gm = guideMarks(s);
    const hereOld = places.find((p) => curMap.place === p.id || (curMap.region && p.region === curMap.region && p.hub));
    const hereId = hereOld ? hereOld.id : RB.questGuide.placeOf(s.map);
    const scaleK = () => { const w = svg.clientWidth || box.clientWidth || CH.W, h = svg.clientHeight || w * CH.H / CH.W; return 1 / (Math.min(w / CH.W, h / CH.H) * st.z); };
    function draw() {
      const k = scaleK(), vb = chartView(st);
      svg.setAttribute('viewBox', vb.join(' '));
      svg.innerHTML = chartInk(s, places, hereId, gm, k, vb);
      box.classList.toggle('zoomed', st.z > 1.001);
      const out = box.querySelector('[data-cz="out"]'), inn = box.querySelector('[data-cz="in"]');
      if (out) out.disabled = st.z <= 1.001;
      if (inn) inn.disabled = st.z >= CH.ZMAX - 0.001;
    }
    // zoom by f, keeping the chart point under (px, py) (screen) where it is
    function zoomAt(f, px, py) {
      const z = Math.min(CH.ZMAX, Math.max(1, st.z * f));
      if (z === st.z) return;
      const r = svg.getBoundingClientRect(), [vx, vy, vw, vh] = chartView(st);
      const u = px == null ? 0.5 : (px - r.left) / r.width, v = py == null ? 0.5 : (py - r.top) / r.height;
      const ux = vx + u * vw, uy = vy + v * vh;
      st.z = z;
      const nw = CH.W / z, nh = CH.H / z;
      st.cx = ux - (u - 0.5) * nw; st.cy = uy - (v - 0.5) * nh;
      draw();
    }
    function panBy(dxPx, dyPx) {
      const r = svg.getBoundingClientRect(), [, , vw, vh] = chartView(st);
      st.cx -= dxPx * vw / Math.max(1, r.width); st.cy -= dyPx * vh / Math.max(1, r.height);
      svg.setAttribute('viewBox', chartView(st).join(' '));
      // the names find their sides again for what is now in view, once a frame
      if (!panRaf) panRaf = requestAnimationFrame(() => { panRaf = 0; if (svg.isConnected) draw(); });
    }
    let panRaf = 0;
    function home() {
      const p = hereId && RB.content.places[hereId];
      if (p) { const [x, y] = cxy(p); st.cx = x; st.cy = y; }
    }
    box.addEventListener('click', (e) => {
      const b = e.target.closest('[data-cz]');
      if (!b) return;
      e.stopPropagation();
      if (b.dataset.cz === 'in') zoomAt(1.5);
      else if (b.dataset.cz === 'out') zoomAt(1 / 1.5);
      else { home(); if (st.z < 2) st.z = 2; draw(); }
    });
    // Ctrl and the wheel (and a trackpad's pinch, which the browser sends as one) zoom; the plain wheel scrolls the page
    svg.addEventListener('wheel', (e) => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); zoomAt(Math.exp(-e.deltaY * 0.0025), e.clientX, e.clientY); }, { passive: false });
    const pts = new Map();
    let pinch = null, moved = false;
    svg.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pts.set(e.pointerId, [e.clientX, e.clientY]);
      moved = false;
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), z: st.z }; }
      if (st.z > 1.001 || pts.size === 2) { try { svg.setPointerCapture(e.pointerId); } catch (err) { /* (not capturable) */ } }
    });
    svg.addEventListener('pointermove', (e) => {
      const was = pts.get(e.pointerId);
      if (!was) return;
      pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2 && pinch) {
        const [a, b] = [...pts.values()];
        const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        zoomAt((pinch.z * d / Math.max(1, pinch.d)) / st.z, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
        return;
      }
      if (st.z <= 1.001) return;
      const dx = e.clientX - was[0], dy = e.clientY - was[1];
      if (Math.abs(dx) + Math.abs(dy) > 0) { moved = true; box.classList.add('dragging'); panBy(dx, dy); }
    });
    const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (!pts.size) box.classList.remove('dragging'); };
    svg.addEventListener('pointerup', up);
    svg.addEventListener('pointercancel', up);
    svg.addEventListener('click', (e) => { if (moved) { e.stopPropagation(); moved = false; } }, true);
    // the keys, on the chart: + and − zoom, the arrows move it, 0 shows it all, H finds you
    box.addEventListener('keydown', (e) => {
      const step = 40;
      let done = true;
      if (e.key === '+' || e.key === '=') zoomAt(1.5);
      else if (e.key === '-' || e.key === '_') zoomAt(1 / 1.5);
      else if (e.key === '0') { st.z = 1; draw(); }
      else if ((e.key === 'h' || e.key === 'H') && !e.ctrlKey && !e.metaKey) { home(); if (st.z < 2) st.z = 2; draw(); }
      else if (e.key === 'ArrowLeft') panBy(step, 0); else if (e.key === 'ArrowRight') panBy(-step, 0);
      else if (e.key === 'ArrowUp') panBy(0, step); else if (e.key === 'ArrowDown') panBy(0, -step);
      else done = false;
      if (done) { e.preventDefault(); e.stopPropagation(); }
    });
    // a name waiting for room shows when its place is pointed at
    svg.addEventListener('pointerover', (e) => { const g = e.target.closest('.pl.quiet'); svg.querySelectorAll('.pl.hov').forEach((x) => { if (x !== g) x.classList.remove('hov'); }); if (g) { g.classList.add('hov'); g.parentNode.appendChild(g); } });
    svg.addEventListener('pointerleave', () => svg.querySelectorAll('.pl.hov').forEach((x) => x.classList.remove('hov')));
    if (typeof ResizeObserver !== 'undefined') {
      let raf = 0;
      chartRO = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (svg.isConnected) draw(); }); });
      chartRO.observe(box);
    }
    draw();
  }
  function map(A, B, two) {
    const s = RB.game.s;
    const views = EXT.map.filter((d) => avail(d, s));
    if (!views.find((d) => d.id === view.map.view)) view.map.view = 'chart';
    const nav = views.length ? '<div class="subnav" role="group" aria-label="Map pages"><button class="subbtn" data-mv="chart" aria-pressed="' + (view.map.view === 'chart') + '">' + I('map') + 'Route chart</button>' +
      views.map((d) => '<button class="subbtn" data-mv="' + d.id + '" aria-pressed="' + (view.map.view === d.id) + '">' + I(d.icon || 'map') + esc(d.en) + '</button>').join('') + '</div>' : '';
    const navClick = (e) => { const v = e.target.closest('[data-mv]'); if (!v) return false; remember(); view.map.view = v.dataset.mv; render(); return true; };
    if (view.map.view !== 'chart') {
      A.innerHTML = nav;
      const holder = RB.ui.el('div', 'xpage');
      A.appendChild(holder);
      extOf('map', view.map.view).render(holder, B, two, api('map'));
      A.addEventListener('click', navClick);
      return;
    }
    mapChart(A, B, two, nav, navClick);
  }
  function mapChart(A, B, two, nav, navClick) {
    const s = RB.game.s;
    const curMap = RB.content.maps[s.map] || {};
    // out in the open with nothing under way; otherwise why not, in the place's own terms (src/engine/52_travel.js)
    const tr = RB.travel.status(s.map);
    const canTravel = tr.ok && RB.game.mode() === 'menu';
    const places = Object.keys(RB.content.places).map((id) => Object.assign({ id }, RB.content.places[id])).filter((p) => s.travel[p.id] && inEd(s, p));
    const gm = guideMarks(s);
    const zb = (k, icon, label) => '<button type="button" class="ch-z" data-cz="' + k + '" aria-label="' + label + '" title="' + label + '">' + icon + '</button>';
    const ZI = { in: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
      out: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
      here: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="3" fill="currentColor"/><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>' };
    const chart = '<div class="chartbox" tabindex="0" aria-describedby="chart-how">' + chartSvg(s, curMap) +
      '<div class="ch-zoom" role="group" aria-label="Zoom the chart">' + zb('in', ZI.in, 'Zoom in') + zb('out', ZI.out, 'Zoom out') + zb('here', ZI.here, 'Show where you are') + '</div></div>' +
      '<p class="muted small">Solid lines are roads you have walked; dashed lines are roads you have heard of' + ((RB.content.roads || []).some((r) => r[2] && r[2].sea && inEd(s, r[2]) && (!r[2].if || RB.state.test(s, r[2].if))) ? '; blue dashes are ferry routes' : '') + '. The red ring is where you are.' +
      (gm ? ' The amber diamond marks where the next step of the quest you follow is.' : '') + ' <span id="chart-how">' + (typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches ? 'Zoom with + and − or two fingers and drag to move around; touch a place to read its name.' : 'Zoom with + and − (or Ctrl and the wheel) and drag to move around; point at a place to read its name.') + '</span></p>' +
      (gm ? '<p class="note-slip next-note">' + I('follow') + ' <span>Next step of <b>' + esc(gm.title.en) + '</b>: ' + esc(gm.places.map((id) => (s.travel[id] ? RB.content.places[id].name.en : 'a place you have not reached yet')).join(', ')) + '.</span></p>' : '');
    const list = '<h3>' + I('travel') + ' Travel <span class="count">' + places.length + ' known</span></h3>' +
      (canTravel ? '' : '<p class="note-slip warn travel-why" data-kind="' + esc(tr.kind) + '">' + esc(tr.en || 'You can’t travel quickly from here just now.') + '</p>') +
      '<ul class="entries">' + places.map((p) => {
        const here = curMap.region && p.region === curMap.region && p.hub;
        const next = gm && gm.places.includes(p.id);
        return '<li class="entry"><span class="mark">' + I(here ? 'here' : 'map') + '</span><div><div class="t">' + j(p.name.jp) + ' <span class="en">' + esc(p.name.en) + '</span></div>' + (p.desc ? '<div class="muted small">' + esc(p.desc) + '</div>' : '') + (here ? '<div class="kind">you are in this region</div>' : '') + (next ? '<div class="kind next-kind">' + I('follow') + ' next step of the quest you follow</div>' : '') + '</div>' +
          (canTravel ? '<button class="pbtn" data-go="' + p.id + '">Travel</button>' : '<span></span>') + '</li>';
      }).join('') + '</ul><p class="muted small">Roads you have walked can be travelled quickly.</p>';
    if (two) { A.innerHTML = nav + chart; B.innerHTML = list; } else { A.innerHTML = nav + chart + list; }
    chartWire(A.querySelector('.chartbox'), s, curMap);
    const handler = async (e) => {
      if (navClick(e)) return;
      const b = e.target.closest('[data-go]');
      if (!b || !RB.travel.status(RB.game.s.map).ok) return;
      const p = RB.content.places[b.dataset.go];
      close();
      await RB.game.transition(p.map, p.x, p.y, p.dir || 'down');
    };
    A.onclick = handler; B.onclick = handler;
  }

  // ---- Company (src/ui/52_company.js draws it) ------------------------------------------------
  function company(A, B, two) {
    if (RB.ui.company) RB.ui.company.render(A, B, two, api('company'));
    else A.innerHTML = '<p class="muted">Nothing here yet.</p>';
  }

  // ---- Save & Load (LI-5, Robin 2026-10-16: "feels a bit out of place in the Ledger now. Find a new way to present
  // the choice"): beside Settings and Close on the cover, and its three choices on a slip that drops from it, as the
  // Satchel's Change… list does, rather than a second book over the first ------------------------------------------
  function saveSheet() {
    if (!fr) return;
    if (sheet) { closeSheet(true); return; }
    closePick(false);
    const st = RB.save.status();
    const anchor = fr.head.querySelector('[data-util="save"]');
    const opt = (a, icon, t, d) => '<button type="button" class="sv-opt' + (a === 'title' ? ' sv-leave' : '') + '" data-a="' + a + '">' +
      '<span class="sv-ic" aria-hidden="true">' + I(icon) + '</span><span class="sv-t"><b>' + t + '</b><span class="sv-d">' + d + '</span></span></button>';
    const wrap = RB.ui.el('div', 'eq-pick-wrap sv-wrap');
    const box = RB.ui.el('div', 'eq-pick sv-slip');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Save & Load');
    box.innerHTML = '<div class="eq-pick-h">' + lab('{宿帳|やどちょう}', 'The Inn Ledger') + '</div>' +
      (st.mode === 'session' ? '<p class="note-slip bad">' + I('warn') + ' Storage is unavailable here, so saves only last until this page closes.</p>' : '') +
      opt('save', 'save', 'Save this journey', 'Choose one of six slots. Overwriting asks first.') +
      opt('load', 'load', 'Load a journey', 'Manual saves, autosaves and the pre-departure point.') +
      opt('title', 'title', 'Return to the title', 'Anything since your last save or autosave will be lost.') +
      '<p class="sv-foot">Autosaves happen at safe places: arriving somewhere new, finishing a scene that matters. Manual saves are kept apart from them.</p>';
    wrap.appendChild(box);
    const lay = { el: wrap, name: 'savesheet', parent: fr.el };
    lay.onCancel = () => { closeSheet(true); return true; };
    sheet = lay;
    RB.ui.pushLayer(lay);
    if (anchor) anchor.setAttribute('aria-expanded', 'true');
    // under its button, its right edge with the button's, kept inside the book
    const fb = fr.el.getBoundingClientRect(), ab = (anchor || fr.head).getBoundingClientRect();
    const w = Math.min(380, fb.width - 24);
    box.style.width = w + 'px';
    box.style.left = Math.max(12, Math.min(fb.width - w - 12, ab.right - fb.left - w)) + 'px';
    box.style.top = (ab.bottom - fb.top + 6) + 'px';
    box.style.maxHeight = Math.max(160, fb.bottom - ab.bottom - 18) + 'px';
    const opts = () => Array.from(box.querySelectorAll('.sv-opt'));
    setTimeout(() => { if (sheet === lay) opts()[0].focus({ preventScroll: true }); }, 0);
    box.addEventListener('keydown', (e) => {
      const o = opts(), i = o.indexOf(document.activeElement);
      let k = null;
      if (e.key === 'ArrowDown') k = (i + 1) % o.length; else if (e.key === 'ArrowUp') k = (i - 1 + o.length) % o.length;
      else if (e.key === 'Home') k = 0; else if (e.key === 'End') k = o.length - 1;
      else if (e.key === 'Tab') { e.preventDefault(); k = (i + (e.shiftKey ? -1 : 1) + o.length) % o.length; }
      if (k == null) return;
      e.preventDefault(); e.stopPropagation();
      o[k].focus();
    });
    wrap.addEventListener('pointerdown', (e) => { if (e.target === wrap) { e.preventDefault(); closeSheet(true); } });
    box.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      const a = b.dataset.a;
      if (a === 'save') RB.ui.title.slots('save', true);
      if (a === 'load') RB.ui.title.slots('load', true);
      if (a === 'title') {
        const r = await RB.ui.confirm('Return to the title screen? Anything since your last save or autosave will be lost.', ['Return to title', 'Cancel']);
        if (r === 0) { closeSheet(false); close(); RB.game.toTitle(); }
      }
    });
  }
  function closeSheet(refocus) {
    if (!sheet) return;
    const sh = sheet;
    sheet = null;
    RB.ui.popLayer(sh);
    const a = fr && fr.head.querySelector('[data-util="save"]');
    if (a) { a.setAttribute('aria-expanded', 'false'); if (refocus) a.focus({ preventScroll: true }); }
  }

  function settingsStandalone() { return RB.ui.settings.open(); }

  return { open, close, closeAll, settingsStandalone, addPage, addSection, restyle, isBook: () => true, isOpen: () => !!layer, chartCoast: { COAST, ISLES, coastAt, coastPath }, current: () => ({ section: view.section, journey: view.journey.view, words: view.words.sub, map: view.map.view, company: view.company.page }) };
})();

// the project's credit (Robin's request, 2026-10-06): at the end of the story and at the top of About & credits
RB.CREDIT = { role: 'Project Development', name: 'Robin Amaral' };
RB.ui.credits = function () {
  return RB.ui.card('{終|お}わり ── そして 、 {道|みち} は {続|つづ}く 。', 'The end — and the road goes on.', { credit: RB.CREDIT.role + ': ' + RB.CREDIT.name });
};
RB.ui.shop = function () { return Promise.resolve(); };
