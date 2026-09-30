/* The pause folio: five paper tabs — Journey (quests, notes, dialogue
 * history), Words (inscriptions, noted words, kana, grammar, lore, progress,
 * guide), Satchel (equipment and carried items), Map (route chart and fast
 * travel), Company (the companion, the pet, shared memories: src/ui/52_company.js)
 * — plus Save & Load and Settings as plain utility actions on the folio's
 * foot. Old section names still open the right place (journal, log,
 * notebook, guide, items, settings, save).
 *
 * Later systems add pages without editing this file: addPage('journey' |
 * 'words' | 'map', def) (see docs/ADDENDUM_CONTRACTS.md). */
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
    settings: '@settings', save: '@save',
  };
  // pages added by later systems: journey views, words pages, map views
  //   journey/map: { id, en, icon, available?(s), render(A, B, two, api) }
  //   words:       { id, en, jp, count?(s), available?(s), html(s, api), wire?(el, s, api) }
  const EXT = { journey: [], words: [], map: [] };
  function addPage(section, def) { const L = EXT[section]; const i = L.findIndex((d) => d.id === def.id); if (i >= 0) L[i] = def; else L.push(def); }
  const extOf = (section, id) => EXT[section].find((d) => d.id === id);
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
  let layer = null, fr = null, tabsApi = null, mq = null, stopDemo = () => {};
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
    fr = F().frame({ onClose: close, closeLabel: 'Close' });
    fr.foot.innerHTML =
      '<button class="cbtn" data-util="save">' + I('ledger') + '<span>' + RB.ui.label('セーブ・ロード', 'Save & Load') + '</span></button>' +
      '<button class="cbtn" data-util="settings">' + I('settings') + '<span>' + RB.ui.label('{設定|せってい}', 'Settings') + '</span></button>';
    fr.foot.onclick = (e) => {
      const b = e.target.closest('[data-util]');
      if (!b) return;
      if (b.dataset.util === 'settings') RB.ui.settings.open();
      else saveSheet();
    };
    layer = { el: fr.scrim, name: 'menu' };
    layer.onCancel = back;
    layer.onAction = (act) => { if (act === 'menu') { close(); return true; } return false; };
    RB.ui.pushLayer(layer);
    if (a && a !== '@settings' && a !== '@save') { view.section = a[0]; applySub(a[0], a[1]); }
    tabsApi = F().tabs(fr.tabslot, SECTIONS, view.section, (id) => { remember(); view.section = id; render(); }, { label: 'Folio sections', panelId: 'folio-page' });
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
    remember();
    stopDemo();
    if (tabsApi) tabsApi.destroy();
    if (mq) mq.onchange = null;
    RB.ui.popLayer(layer);
    layer = null; fr = null; tabsApi = null;
    RB.game.popMode('menu');
    RB.audio && RB.audio.sfx('menu_close');
    RB.ui.help.hide(true);
    // give the keyboard back to the world without moving the character
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    RB.input.clearHeld && RB.input.clearHeld();
  }
  // leaving the game (loading another journey, returning to the title) closes the sheet too
  function closeAll() { if (sheet) { const sh = sheet; sheet = null; RB.ui.popLayer(sh); } close(); }
  // Back: leave a sub-page first (phones), otherwise close the folio.
  function back() {
    const w = view.words, j = view.journey;
    if (view.section === 'words' && w.sub && !F().wide()) { remember(); w.sub = null; render(); return; }
    if (view.section === 'journey' && j.view !== 'quests') { remember(); j.view = 'quests'; render(); return; }
    if (view.section === 'map' && view.map.view !== 'chart') { remember(); view.map.view = 'chart'; render(); return; }
    if (view.section === 'company' && RB.ui.company && RB.ui.company.back && RB.ui.company.back(api('company'))) return;
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
  }
  function key() {
    const s = view.section;
    return s + ':' + (s === 'journey' ? view.journey.view : s === 'words' ? view.words.sub || 'index' : s === 'map' ? view.map.view : s === 'company' ? view.company.page || '' : '');
  }
  function remember() {
    if (!fr) return;
    const leaves = fr.box.querySelectorAll('.leaf');
    if (leaves[0]) view.scroll[key()] = [leaves[0].scrollTop, leaves[1] ? leaves[1].scrollTop : 0];
  }

  // ---- rendering ---------------------------------------------------------------------------
  function render() {
    stopDemo(); stopDemo = () => {};
    const s = RB.game.s;
    const sec = SECTIONS.find((x) => x.id === view.section);
    const comp = s.comp && RB.content.chars[s.comp];
    fr.setTitle(RB.ui.label(sec.jp, sec.en), esc(s.player.name) + (comp ? ' &amp; ' + esc(comp.name.en) : '') + ' · ' + RB.util.fmtTime(s.playtime));
    const two = F().wide();
    fr.box.innerHTML = '<div class="spread' + (two ? ' two' : '') + '" id="folio-page" role="tabpanel" aria-labelledby="tab-' + view.section + '">' +
      '<div class="leaf" tabindex="0" aria-label="' + esc(sec.en) + ' page"></div><div class="leaf leaf-b" tabindex="0" aria-label="' + esc(sec.en) + ' detail page"></div></div>';
    const [A, B] = fr.box.querySelectorAll('.leaf');
    ({ journey, words, satchel, map, company })[view.section](A, B, two);
    const sc = view.scroll[key()];
    if (sc) { A.scrollTop = sc[0]; B.scrollTop = sc[1]; }
  }
  const j = (line) => (line ? RB.ui.jhtml(line) : '');
  const en = (t) => '<div class="en">' + esc(RB.script.enVars(t || '')) + '</div>';

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
      h += '<div class="follow-row"><button class="pbtn follow' + (on ? ' on' : '') + '" data-follow="' + x.id + '" aria-pressed="' + on + '">' + I('follow') + '<span>' + gl(on ? 'following' : 'follow') + '</span></button>' +
        '<span class="muted small">' + esc(on ? (G.chosen(s) ? 'Markers in the world and on the Map show the way to its next step. Press again to stop.' : 'Followed as the main road: markers show the way to its next step. Press to stop.') : 'Markers will show the way to this quest’s next step instead.') + '</span></div>';
      if (on) {
        const next = G.nextLines(N.result);
        h += next.length
          ? '<div class="qnext"><div class="kind">' + I('follow') + ' ' + gl('next') + '</div>' + next.map((l) => '<div class="nline">' + j(l.jp) + en(l.en) + '</div>').join('') + '</div>'
          : '<p class="muted small qnext-none">' + esc(N.result.how === 'many' ? 'No marker for this step: many places could help, so none is marked.' : 'No marker for this step yet.') + '</p>';
      }
    }
    h += '<div class="ph small-ph">' + I('help') + ' ' + gl('nudge') + '</div>';
    h += '<ol class="nudges" aria-live="polite">' + N.lines.slice(0, n).map((ls, i) => '<li tabindex="-1"><span class="kind">Nudge ' + (i + 1) + ' of ' + total + '</span>' +
      ls.map((l) => '<div class="nline">' + j(l.jp) + en(l.en) + '</div>').join('') + '</li>').join('') +
      (mapStep && n > N.lines.length ? '<li tabindex="-1"><span class="kind">Nudge ' + total + ' of ' + total + '</span><div class="nline"><span class="en">Shown on the map: this quest is followed, and its next step is marked.</span></div></li>' : '') + '</ol>';
    if (n < total) {
      const k = n === N.lines.length ? 'onmap' : n === 0 ? 'show' : 'more';
      h += '<div class="row-acts"><button class="pbtn" data-nudge="' + x.id + '">' + (k === 'onmap' ? I('map') : I('help')) + '<span>' + gl(k) + '</span> <span class="count">' + (n + 1) + ' of ' + total + '</span></button></div>';
    }
    return h + '<p class="muted small">Nudges are free: asking never counts as a mistake.</p></div>';
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
  function journey(A, B, two) {
    const s = RB.game.s;
    const J = view.journey;
    const sub = '<div class="subnav" role="group" aria-label="Journey pages">' +
      '<button class="subbtn" data-jv="quests" aria-pressed="' + (J.view === 'quests') + '">' + I('journey') + 'Quests &amp; notes</button>' +
      '<button class="subbtn" data-jv="history" aria-pressed="' + (J.view === 'history') + '">' + I('history') + 'Dialogue history</button>' +
      EXT.journey.filter((d) => avail(d, s)).map((d) => '<button class="subbtn" data-jv="' + d.id + '" aria-pressed="' + (J.view === d.id) + '">' + I(d.icon || 'journey') + esc(d.en) + '</button>').join('') + '</div>';
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
          return '<li class="entry"><span class="mark">' + I(l.choice ? 'next' : 'history') + '</span><div><div class="who">' + (l.choice ? 'You chose' : ch ? esc(ch.name.en) : '') + '</div>' + j(l.jp) + en(l.en) + '</div></li>';
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
      h += mains.length ? '<ul class="entries">' + mains.map(row).join('') + '</ul>' : '<p class="muted">Nothing pressing. Walk around; people will tell you what they need.</p>';
      if (others.length) h += '<h3>' + I('side') + ' Also on the way <span class="count">' + others.length + ' optional</span></h3><ul class="entries">' + others.map(row).join('') + '</ul>';
      const notes = (s.journal || []).slice(-8).reverse();
      if (notes.length) h += '<h3>' + I('note') + ' Notes to self</h3><ul class="entries">' + notes.map((e) => '<li class="entry"><span class="mark">' + I('note') + '</span><div>' + j(e.jp) + en(e.en) + '</div></li>').join('') + '</ul>';
      if (done.length) h += '<details class="done-list"' + (J.doneOpen ? ' open' : '') + '><summary><h3>' + I('done') + ' Completed <span class="count">' + done.length + '</span></h3></summary><ul class="entries">' + done.map(row).join('') + '</ul></details>';
      A.innerHTML = h;
      const selQ = qs.find((x) => x.id === J.sel);
      B.innerHTML = selQ ? questDetail(selQ) : '<p class="muted">Choose a quest to read its notes.</p>';
      const dl = A.querySelector('details.done-list');
      if (dl) dl.ontoggle = () => { J.doneOpen = dl.open; };
    }
    B.onclick = (e) => { guideClick(e); };
    A.onclick = (e) => {
      const v = e.target.closest('[data-jv]');
      if (v) { remember(); J.view = v.dataset.jv; render(); return; }
      if (guideClick(e)) return;
      const q = e.target.closest('[data-q]');
      if (q) {
        if (two) { J.sel = q.dataset.q; remember(); render(); }
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
      'An amber diamond marks where the quest you follow goes next (the main road, unless you choose another in the Journey); at the edge of the view it points the way, and an amber arrow shows the way out toward another place. The Journey says the same in words and offers nudges, one at a time, if you want them. Asking is free. Settings › Learning & Challenge › Quest guidance turns the markers or the hints off.',
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
      'Draw one character in the box. The pad shows what it thinks you wrote ("I read this as…") and alternatives. Nothing is submitted until you press Confirm, then Submit.',
      'Tap a character in the answer strip to replace it; tap a gap to insert. Undo removes a stroke; Clear wipes the box. Use 小 for small kana (ゃ, っ…) and the script buttons to choose hiragana or katakana.',
      'If the recogniser can\'t read you, pick the character from the chart. That counts as "assisted" — which is fine, it just isn\'t counted as unaided handwriting.',
      'The chart lists every kana and every kanji in the game, on pages by theme (water, nature, people…) and by use (nouns, verbs…), with a search by kanji, reading, rōmaji, meaning or word. Each kanji shows its readings, meaning, words from the game and its stroke order, and you can practise writing it. Words › Kanji chart opens it any time.',
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
    const index = '<h3>Contents</h3><ul class="index">' + subs.map(([id, l, jp, n]) =>
      '<li><button data-sub="' + id + '" aria-current="' + (two && (W.sub || 'inscriptions') === id) + '"><span class="lbl">' + esc(l) + '</span><span class="fill"></span>' + (n != null ? '<span class="n">' + n + '</span>' : '') + '</button></li>').join('') + '</ul>' +
      '<div class="row-acts"><button class="pbtn" data-a="practice">' + I('practice') + 'Practise (optional)</button>' +
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
      const canSpeak = RB.voice && RB.voice.status && RB.voice.status().localJaCount > 0;
      return saved.length ? '<ul class="entries notes">' + saved.map((n, i) => {
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
      return '<p>Every kanji in the game — ' + all + ' of them — on pages by theme and by use, with a search. Each one shows its readings, meaning, words from the game and its stroke order, and you can practise writing it.</p>' +
        '<p class="muted small">You have met ' + met + ' of them in the story so far; they come first on each page.</p>' +
        '<div class="row-acts"><button class="pbtn" data-kchart>' + I('grid') + 'Open the kanji chart</button></div>';
    }
    if (id === 'grammar') {
      const seen = Object.keys(s.learn.items).filter((k) => k.startsWith('g:')).map((k) => k.slice(2));
      const pts = (RB.grammar && RB.grammar.points ? RB.grammar.points : []).filter((g) => seen.includes(g.id));
      return pts.length ? '<ul class="entries notes">' + pts.map((g) => '<li class="entry filed"><span class="mark">' + I('book') + '</span><div><div class="written">' + j(g.title) + '</div><div class="t">' + esc(g.en) + '</div>' + (g.ex || []).slice(0, 2).map((e) => '<div class="ex">' + j(e.jp) + en(e.en) + '</div>').join('') + '</div></li>').join('') + '</ul>' : '<p class="muted">Grammar you meet on the road will be collected here.</p>';
    }
    if (id === 'lore') {
      const notes = s.notebook.filter((n) => n.kind === 'lore').map((n) => RB.content.notes[n.id]).filter(Boolean);
      return notes.length ? '<ul class="entries notes">' + notes.map((n) => '<li class="entry filed"><span class="mark">' + I('scroll') + '</span><div><div class="t">' + j(n.title.jp) + ' <span class="en">' + esc(n.title.en) + '</span>' + (n.fiction ? ' <span class="sealmark small">fictional term</span>' : '') + '</div>' + (n.jp ? '<div>' + j(n.jp) + '</div>' : '') + en(n.en) + '</div></li>').join('') + '</ul>' : '<p class="muted">Stories and inscriptions you collect will be kept here.</p>';
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
        h += '<p class="muted small">Choose a character to see its stroke order. Kana you have been taught are marked with a dot.</p><div class="kdemo-box"><canvas width="160" height="160" class="kdemo"></canvas><div class="kinfo muted">Stroke order appears here.</div></div>';
        for (const gr of groups) {
          h += '<div class="kgroup"><span class="kgl">' + esc(gr.title || '') + '</span><span class="kcells">' + RB.lessons.groupChars(gr).map((c) => {
            const taught = !RB.learn.taughtKana() || (s.learn.taught && s.learn.taught[c.ch]) || (s.learn.kanaKnown === 'hira' && RB.kana.isHira(c.ch));
            return '<button class="kcell' + (taught ? ' taught' : '') + '" lang="ja" data-k="' + esc(c.ch) + '" aria-label="' + esc(c.ch + ' ' + RB.kana.romaji(c.ch) + (taught ? ', taught' : '')) + '">' + esc(c.ch) + '</button>';
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
        const ch = k.dataset.k;
        stopDemo = RB.lessons.demo(el.querySelector('.kdemo'), ch);
        el.querySelector('.kinfo').innerHTML = '<div class="jp" lang="ja" style="font-size:2.4em;line-height:1.2">' + esc(ch) + '</div><div>' + esc(RB.kana.romaji(ch)) + '</div>';
        return;
      }
      const say = e.target.closest('[data-say]');
      if (say) { const n = s.notebook.filter((x) => x.kind === 'word')[+say.dataset.say]; if (n && RB.voice) RB.voice.speak(n.reading || n.surface); }
    };
  }
  function kanaChart(s) {
    const K = RB.kana;
    const groups = RB.lessons.groups();
    if (!groups.length) return '<p class="muted">Kana chart unavailable.</p>';
    const rec = s.learn.items;
    const LV = ['not met', 'met', 'practising', 'steady'];
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
    let h = '<div class="idetail' + (eqd ? ' worn' : '') + '"><div class="ibig">' + I(F().itemIcon(x.id, d)) + '</div><h3>' + j(d.name.jp) + ' <span class="en">' + esc(d.name.en) + '</span>' + (x.n > 1 ? ' <span class="count">×' + x.n + '</span>' : '') + '</h3>' +
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
      return '<li class="entry eq-slot ' + (it ? 'worn' : 'empty') + '" data-slot="' + z.id + '"><span class="mark">' + I(it ? F().itemIcon(id, it) : z.icon) + '</span><div class="eq-body">' +
        '<div class="kind">' + lab(z.jp, z.en) + ' · ' + esc(z.where) + '</div>' +
        (it ? '<div class="t">' + j(it.name.jp) + ' <span class="en">' + esc(it.name.en) + '</span></div>' +
            '<div class="eq-foot">' + tagRow(it) + '<button class="pbtn" data-unequip="' + z.id + '" aria-label="' + esc('Take off the ' + it.name.en) + '">' + lab('{外|はず}す', 'Take off') + '</button></div>'
          : '<div class="t muted">' + lab('{空|あ}き', 'Empty') + '</div><div class="muted small">' + (fits ? fits + (fits > 1 ? ' things' : ' thing') + ' you carry can go here.' : 'Nothing you carry fits here yet.') + '</div>') +
        '</div></li>';
    }).join('') + '</ul>';
    h += '<h3>' + I('satchel') + ' ' + lab('{持|も}ち{物|もの}', 'Carried') + ' <span class="count">' + inv.length + '</span></h3>';
    if (!inv.length) h += '<p class="muted">Your pack is light.</p>';
    else h += '<ul class="entries">' + inv.map((x) => {
      const worn = !!x.d.slot && EQ().isWorn(s, x.id), z = x.d.slot && EQ().slot(x.d.slot);
      return '<li><button class="entry item-row' + (worn ? ' worn' : z ? ' wearable' : '') + '" data-it="' + x.id + '" aria-current="' + (two && S.sel === x.id) + '"' + (two ? '' : ' aria-expanded="' + (S.open === x.id) + '"') + '>' +
        '<span class="mark">' + I(F().itemIcon(x.id, x.d)) + '</span><span class="body"><span class="t">' + j(x.d.name.jp) + ' <span class="en">' + esc(x.d.name.en) + '</span>' + (x.n > 1 ? ' <span class="count">×' + x.n + '</span>' : '') + '</span>' +
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
    A.innerHTML = h;
    const selX = inv.find((x) => x.id === S.sel);
    B.innerHTML = selX ? itemDetail(selX, s) : '<p class="muted">Choose something to look at it closely.</p>';
    drawPreviews(A, s); drawPreviews(B, s);
    // a polite announcement of what changed (the page itself is redrawn)
    let live = fr.el.querySelector('.eq-live');
    if (!live) { live = RB.ui.el('p', 'sr eq-live'); live.setAttribute('aria-live', 'polite'); fr.el.appendChild(live); }
    const handler = (e) => {
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
  function chartSvg(s, curMap) {
    const places = Object.keys(RB.content.places).map((id) => Object.assign({ id }, RB.content.places[id]));
    const Wd = 520, H = 320;
    const fs = Math.round(14 * Math.min(1.5, Math.max(1, (RB.game.settings && RB.game.settings.textScale) || 1)));
    const gm = guideMarks(s);
    // you are here: the place this map belongs to (rooms count as their village)
    const hereOld = places.find((p) => curMap.place === p.id || (curMap.region && p.region === curMap.region && p.hub));
    const hereId = hereOld ? hereOld.id : RB.questGuide.placeOf(s.map);
    const nextName = gm ? gm.places.map((id) => (s.travel[id] ? RB.content.places[id].name.en : 'an unexplored place')).join(', ') : '';
    let svg = '<svg class="chart" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Route chart. Known places: ' + esc(places.filter((p) => s.travel[p.id]).map((p) => p.name.en).join(', ') || 'none yet') +
      (hereId && RB.content.places[hereId] ? '. You are in or near ' + esc(RB.content.places[hereId].name.en) : '') + (gm ? '. The next step of the followed quest is in ' + esc(nextName) : '') + '.">';
    // paper, folds and the sea/mountain washes (decorative)
    svg += '<rect width="' + Wd + '" height="' + H + '" fill="#efe3c6"/><path d="M0 252 Q120 222 200 252 T 520 232 L520 320 L0 320Z" fill="#cfdbd6"/><path d="M60 0 L140 90 L230 60 L300 120 L420 40 L520 80 L520 0Z" fill="#e2d4b2"/>';
    svg += '<path d="M173 0V320M346 0V320M0 160H520" stroke="#b9a57a" stroke-width="1" stroke-dasharray="2 5" opacity="0.8"/>';
    for (const [a, b] of RB.content.roads || []) {
      const A = RB.content.places[a], B = RB.content.places[b];
      if (!A || !B) continue;
      const known = s.travel[a] && s.travel[b];
      const half = s.travel[a] || s.travel[b];
      svg += '<line x1="' + A.pos[0] + '" y1="' + A.pos[1] + '" x2="' + B.pos[0] + '" y2="' + B.pos[1] + '" stroke="' + (known ? '#3b2e1c' : '#9d8b66') + '" stroke-width="' + (known ? 2.5 : 1.6) + '" stroke-dasharray="' + (known ? '0' : half ? '6 5' : '2 6') + '"/>';
    }
    for (const p of places) {
      const known = s.travel[p.id];
      const here = p.id === hereId;
      const next = gm && gm.places.includes(p.id);
      if (next) svg += '<circle class="next-ring" cx="' + p.pos[0] + '" cy="' + p.pos[1] + '" r="14" fill="none" stroke="#c0761c" stroke-width="3" stroke-dasharray="5 3"/>';
      svg += '<circle cx="' + p.pos[0] + '" cy="' + p.pos[1] + '" r="' + (here ? 8 : 6) + '" fill="' + (known ? '#2a2217' : '#efe3c6') + '" stroke="#2a2217" stroke-width="1.5"/>';
      if (here) svg += '<path d="M' + p.pos[0] + ' ' + (p.pos[1] - 12) + ' l-6 -12 h12 z" fill="#a83e27"/>';
      // the quest marker: the same inked amber diamond as in the world (beside the red mark when both are here)
      if (next) { const dx = p.pos[0] + (here ? 19 : 0), dy = p.pos[1] - (here ? 14 : 16); svg += '<path class="next-mark" d="M' + dx + ' ' + (dy - 22) + ' l10 11 -10 11 -10 -11z" fill="#f0b43c" stroke="#2a2024" stroke-width="2"/><path d="M' + dx + ' ' + (dy - 11) + ' v8" stroke="#8a4e12" stroke-width="1.6"/><path d="M' + (dx - 4) + ' ' + (dy - 17) + ' l3 -3" stroke="#fff0b8" stroke-width="1.6"/>'; }
      // labels near the right edge sit left of their dot so they are never cut off; size follows the text-size setting
      const right = p.pos[0] > Wd * 0.62;
      svg += '<text x="' + (p.pos[0] + (right ? -11 : 11)) + '" y="' + (p.pos[1] + 5) + '"' + (right ? ' text-anchor="end"' : '') + ' fill="' + (known ? '#261f15' : '#62553f') + '" font-size="' + fs + '" font-family="Georgia, serif" stroke="#efe3c6" stroke-width="3" paint-order="stroke">' + esc(known ? p.name.en : '? unexplored') + '</text>';
    }
    return svg + '</svg>';
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
    const canTravel = !curMap.noTravel && RB.game.mode() === 'menu';
    const places = Object.keys(RB.content.places).map((id) => Object.assign({ id }, RB.content.places[id])).filter((p) => s.travel[p.id]);
    const gm = guideMarks(s);
    const chart = '<div class="chartbox" tabindex="-1">' + chartSvg(s, curMap) + '</div><p class="muted small">Solid lines are roads you have walked; dashed lines are roads you have heard of. The red mark is where you are.' +
      (gm ? ' The amber diamond marks where the next step of the quest you follow is.' : '') + '</p>' +
      (gm ? '<p class="note-slip next-note">' + I('follow') + ' <span>Next step of <b>' + esc(gm.title.en) + '</b>: ' + esc(gm.places.map((id) => (s.travel[id] ? RB.content.places[id].name.en : 'a place you have not reached yet')).join(', ')) + '.</span></p>' : '');
    const list = '<h3>' + I('travel') + ' Travel <span class="count">' + places.length + ' known</span></h3>' +
      (canTravel ? '' : '<p class="note-slip warn">You can’t travel quickly from here. Step outside first.</p>') +
      '<ul class="entries">' + places.map((p) => {
        const here = curMap.region && p.region === curMap.region && p.hub;
        const next = gm && gm.places.includes(p.id);
        return '<li class="entry"><span class="mark">' + I(here ? 'here' : 'map') + '</span><div><div class="t">' + j(p.name.jp) + ' <span class="en">' + esc(p.name.en) + '</span></div>' + (p.desc ? '<div class="muted small">' + esc(p.desc) + '</div>' : '') + (here ? '<div class="kind">you are in this region</div>' : '') + (next ? '<div class="kind next-kind">' + I('follow') + ' next step of the quest you follow</div>' : '') + '</div>' +
          (canTravel ? '<button class="pbtn" data-go="' + p.id + '">Travel</button>' : '<span></span>') + '</li>';
      }).join('') + '</ul><p class="muted small">Roads you have walked can be travelled quickly.</p>';
    if (two) { A.innerHTML = nav + chart; B.innerHTML = list; } else { A.innerHTML = nav + chart + list; }
    const handler = async (e) => {
      if (navClick(e)) return;
      const b = e.target.closest('[data-go]');
      if (!b) return;
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

  // ---- Save & Load (utility sheet) ---------------------------------------------------------------
  function saveSheet() {
    const st = RB.save.status();
    const popSheet = () => { sheet = null; RB.ui.popLayer(lay); };
    const f2 = F().frame({ onClose: () => popSheet(), closeLabel: 'Back', closeIcon: 'back', cls: 'folio-sheet' });
    f2.setTitle(RB.ui.label('セーブ・ロード', 'Save & Load'), '');
    f2.box.innerHTML = '<div class="spread"><div class="leaf" tabindex="0">' +
      (st.mode === 'session' ? '<p class="note-slip bad">' + I('warn') + ' Storage is unavailable here, so saves only last until this page closes.</p>' : '') +
      '<ul class="entries">' +
      '<li class="entry"><span class="mark">' + I('save') + '</span><div><div class="t">Save this journey</div><div class="muted small">Choose one of six slots in the ledger. Overwriting asks first.</div></div><button class="pbtn primary" data-a="save">Save…</button></li>' +
      '<li class="entry"><span class="mark">' + I('load') + '</span><div><div class="t">Load a journey</div><div class="muted small">Manual saves, autosaves and the pre-departure point.</div></div><button class="pbtn" data-a="load">Load…</button></li>' +
      '<li class="entry"><span class="mark">' + I('title') + '</span><div><div class="t">Return to the title</div><div class="muted small">Anything since your last save or autosave will be lost.</div></div><button class="pbtn" data-a="title">Return to title</button></li>' +
      '</ul><p class="muted small">Autosaves happen at safe places (arriving somewhere new, finishing a scene that matters). Manual saves are kept separately from them.</p></div></div>';
    const lay = { el: f2.scrim, name: 'savesheet' };
    lay.onCancel = () => popSheet();
    f2.box.onclick = async (e) => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      const a = b.dataset.a;
      if (a === 'save') RB.ui.title.slots('save', true);
      if (a === 'load') RB.ui.title.slots('load', true);
      if (a === 'title') {
        const r = await RB.ui.confirm('Return to the title screen? Anything since your last save or autosave will be lost.', ['Return to title', 'Cancel']);
        if (r === 0) { popSheet(); close(); RB.game.toTitle(); }
      }
    };
    sheet = lay;
    RB.ui.pushLayer(lay);
  }

  function settingsStandalone() { return RB.ui.settings.open(); }

  return { open, close, closeAll, settingsStandalone, addPage, isOpen: () => !!layer, current: () => ({ section: view.section, journey: view.journey.view, words: view.words.sub, map: view.map.view, company: view.company.page }) };
})();

RB.ui.credits = function () {
  return RB.ui.card('{終|お}わり ── そして 、 {道|みち} は {続|つづ}く 。', 'The end — and the road goes on.');
};
RB.ui.shop = function () { return Promise.resolve(); };
