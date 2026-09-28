/* The pause folio: four paper tabs — Journey (quests, notes, dialogue
 * history), Words (inscriptions, noted words, kana, grammar, lore, progress,
 * guide), Satchel (equipment and carried items), Map (route chart and fast
 * travel) — plus Save & Load and Settings as plain utility actions on the
 * folio's foot. Old section names still open the right place
 * (journal, log, notebook, guide, items, settings, save). */
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
  ];
  // old tab ids → [section, sub-view] or a utility
  const ALIAS = {
    journal: ['journey', 'quests'], journey: ['journey'], log: ['journey', 'history'], history: ['journey', 'history'],
    notebook: ['words'], words: ['words'], guide: ['words', 'guide'], items: ['satchel'], satchel: ['satchel'], map: ['map'],
    settings: '@settings', save: '@save',
  };
  const COMPANION_QUESTS = { co_suzu: 'suzu', lf_nao: 'nao', lf_mio: 'mio', ren_ushio: 'ren' };
  const view = {
    section: 'journey',
    journey: { view: 'quests', sel: null },
    words: { sub: null, guide: 'basics' },
    satchel: { sel: null },
    map: {},
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
    if (view.section === 'journey' && j.view === 'history') { remember(); j.view = 'quests'; render(); return; }
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
  }
  function key() {
    const s = view.section;
    return s + ':' + (s === 'journey' ? view.journey.view : s === 'words' ? view.words.sub || 'index' : '');
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
    ({ journey, words, satchel, map })[view.section](A, B, two);
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
      (x.q.done ? '<p class="muted">' + I('done') + ' Finished.</p>' : '<div class="ph small-ph">What to do now</div>' + stageOf(x)) +
      (earlier.length && !x.q.done ? '<div class="ph small-ph">Earlier on this road</div><ol class="earlier">' + earlier.map((st) => '<li>' + j(st.jp) + en(st.en) + '</li>').join('') + '</ol>' : '') +
      (x.q.done && earlier.length ? '<div class="ph small-ph">The steps you took</div><ol class="earlier">' + earlier.map((st) => '<li>' + j(st.jp) + en(st.en) + '</li>').join('') + '</ol>' : '') +
      '</div>';
  }
  function journey(A, B, two) {
    const s = RB.game.s;
    const J = view.journey;
    const sub = '<div class="subnav" role="group" aria-label="Journey pages">' +
      '<button class="subbtn" data-jv="quests" aria-pressed="' + (J.view === 'quests') + '">' + I('journey') + 'Quests &amp; notes</button>' +
      '<button class="subbtn" data-jv="history" aria-pressed="' + (J.view === 'history') + '">' + I('history') + 'Dialogue history</button></div>';
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
      const qs = Object.keys(s.quests).map((id) => ({ id, q: s.quests[id], d: RB.content.quests[id] })).filter((x) => x.d);
      const active = qs.filter((x) => !x.q.done).sort((a, b) => (a.d.main ? -1 : 1) - (b.d.main ? -1 : 1) || b.q.t - a.q.t);
      const done = qs.filter((x) => x.q.done).sort((a, b) => b.q.t - a.q.t);
      const mains = active.filter((x) => x.d.main), others = active.filter((x) => !x.d.main);
      if (!J.sel || !qs.find((x) => x.id === J.sel)) J.sel = (mains[0] || others[0] || done[0] || {}).id || null;
      const row = (x) => {
        const [k, kl] = questKind(x.id, x.d);
        const sel = two && x.id === J.sel;
        return '<li><button class="entry' + (x.q.done ? ' done' : x.d.main ? ' current' : '') + '" data-q="' + x.id + '" aria-current="' + sel + '"' + (two ? '' : ' aria-expanded="' + (x.id === J.open) + '"') + '>' +
          '<span class="mark">' + I(x.q.done ? 'done' : k) + '</span>' +
          '<span class="body"><span class="kind">' + esc(x.q.done ? 'Completed' : kl) + '</span><span class="t">' + j(x.d.title.jp) + ' <span class="en">' + esc(x.d.title.en) + '</span></span>' +
          (x.q.done ? '' : stageOf(x)) + '</span></button>' + (!two && x.id === J.open ? '<div class="inline-detail">' + questDetail(x) + '</div>' : '') + '</li>';
      };
      let h = sub;
      h += '<h3>' + I('main') + ' Now <span class="count">the main road</span></h3>';
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
    A.onclick = (e) => {
      const v = e.target.closest('[data-jv]');
      if (v) { remember(); J.view = v.dataset.jv; render(); return; }
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
      ['grammar', 'Grammar met on the road', '{文法|ぶんぽう}', gram],
      ['lore', 'Lore & histories', '{言|い}い{伝|つた}え', lore.length],
      ['progress', 'How your learning is going', '{進|すす}み{具合|ぐあい}', null],
      ['guide', 'Guide: how things work', '{手引|てび}き', null],
    ];
  }
  function words(A, B, two) {
    const s = RB.game.s;
    const W = view.words;
    const subs = wordSubs(s);
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
    return '';
  }
  function wireWords(el, s) {
    el.onclick = (e) => {
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
  const SLOTS = [['charm', 'Charm'], ['tool', 'Tool'], ['cosmetic', 'Keepsake (appearance only)']];
  function itemDetail(x, s) {
    const d = x.d;
    const eqd = d.slot && s.equip[d.slot] === x.id;
    return '<div class="idetail"><div class="ibig">' + I(F().itemIcon(x.id, d)) + '</div><h3>' + j(d.name.jp) + ' <span class="en">' + esc(d.name.en) + '</span>' + (x.n > 1 ? ' <span class="count">×' + x.n + '</span>' : '') + '</h3>' +
      '<p>' + esc(RB.script.enVars(d.desc || '')) + '</p>' +
      (d.key ? '<p class="note-slip">' + I('key') + ' Important: it can’t be sold, used up or lost.</p>' : '') +
      (d.slot ? '<p class="muted small">Worn as: ' + esc(SLOTS.find((z) => z[0] === d.slot)[1]) + (eqd ? ' — equipped now.' : '.') + '</p><div class="acts"><button class="pbtn' + (eqd ? '' : ' primary') + '" data-' + (eqd ? 'unequip="' + d.slot : 'equip="' + x.id) + '">' + (eqd ? 'Take it off' : 'Equip') + '</button></div>' : '') +
      '</div>';
  }
  function satchel(A, B, two) {
    const s = RB.game.s;
    const S = view.satchel;
    const inv = Object.keys(s.inv).map((id) => ({ id, n: s.inv[id], d: RB.content.items[id] })).filter((x) => x.d);
    if (!S.sel || !inv.find((x) => x.id === S.sel)) S.sel = inv[0] ? inv[0].id : null;
    let h = '<h3>' + I('charm') + ' Equipped</h3><ul class="entries">' + SLOTS.map(([k, l]) => {
      const it = s.equip[k] && RB.content.items[s.equip[k]];
      return '<li class="entry"><span class="mark">' + I(it ? F().itemIcon(s.equip[k], it) : k === 'cosmetic' ? 'keepsake' : k) + '</span><div><div class="kind">' + esc(l) + '</div><div class="t">' + (it ? j(it.name.jp) + ' <span class="en">' + esc(it.name.en) + '</span>' : '<span class="muted">Nothing</span>') + '</div></div>' +
        (it ? '<button class="pbtn" data-unequip="' + k + '">Take off</button>' : '<span></span>') + '</li>';
    }).join('') + '</ul>';
    h += '<h3>' + I('satchel') + ' Carried <span class="count">' + inv.length + '</span></h3>';
    if (!inv.length) h += '<p class="muted">Your pack is light.</p>';
    else h += '<ul class="entries">' + inv.map((x) => '<li><button class="entry item-row" data-it="' + x.id + '" aria-current="' + (two && S.sel === x.id) + '"' + (two ? '' : ' aria-expanded="' + (S.open === x.id) + '"') + '>' +
      '<span class="mark">' + I(F().itemIcon(x.id, x.d)) + '</span><span class="body"><span class="t">' + j(x.d.name.jp) + ' <span class="en">' + esc(x.d.name.en) + '</span>' + (x.n > 1 ? ' <span class="count">×' + x.n + '</span>' : '') + '</span>' +
      (x.d.key ? '<span class="kind">' + I('key') + ' important</span>' : x.d.slot ? '<span class="kind">' + (s.equip[x.d.slot] === x.id ? 'equipped' : 'can be worn') + '</span>' : '') + '</span></button>' +
      (!two && S.open === x.id ? '<div class="inline-detail">' + itemDetail(x, s) + '</div>' : '') + '</li>').join('') + '</ul>';
    h += '<p class="muted small">Important items cannot be sold or used up. Nothing essential can be lost.</p>';
    A.innerHTML = h;
    const selX = inv.find((x) => x.id === S.sel);
    B.innerHTML = selX ? itemDetail(selX, s) : '<p class="muted">Choose something to look at it closely.</p>';
    const handler = (e) => {
      const it = e.target.closest('[data-it]');
      const eq = e.target.closest('[data-equip]'), un = e.target.closest('[data-unequip]');
      if (eq) { const id = eq.dataset.equip; s.equip[RB.content.items[id].slot] = id; RB.audio && RB.audio.sfx('confirm'); refreshLook(s); remember(); render(); return; }
      if (un) { s.equip[un.dataset.unequip] = null; refreshLook(s); remember(); render(); return; }
      if (it) { if (two) S.sel = it.dataset.it; else S.open = S.open === it.dataset.it ? null : it.dataset.it; remember(); render(); }
    };
    A.onclick = handler; B.onclick = handler;
  }
  function refreshLook(s) {
    const W = RB.world.W;
    if (!W.player) return;
    const look = Object.assign({}, s.player.look);
    const c = s.equip.cosmetic && RB.content.items[s.equip.cosmetic];
    if (c && c.acc) look.acc = (look.acc || []).concat([c.acc]);
    W.player.look = look;
  }

  // ---- Map ------------------------------------------------------------------------------------
  function chartSvg(s, curMap) {
    const places = Object.keys(RB.content.places).map((id) => Object.assign({ id }, RB.content.places[id]));
    const Wd = 520, H = 320;
    const fs = Math.round(14 * Math.min(1.5, Math.max(1, (RB.game.settings && RB.game.settings.textScale) || 1)));
    let svg = '<svg class="chart" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Route chart. Known places: ' + esc(places.filter((p) => s.travel[p.id]).map((p) => p.name.en).join(', ') || 'none yet') + '">';
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
      const here = curMap.place === p.id || (curMap.region && p.region === curMap.region && p.hub);
      svg += '<circle cx="' + p.pos[0] + '" cy="' + p.pos[1] + '" r="' + (here ? 8 : 6) + '" fill="' + (known ? '#2a2217' : '#efe3c6') + '" stroke="#2a2217" stroke-width="1.5"/>';
      if (here) svg += '<path d="M' + p.pos[0] + ' ' + (p.pos[1] - 12) + ' l-6 -12 h12 z" fill="#a83e27"/>';
      // labels near the right edge sit left of their dot so they are never cut off; size follows the text-size setting
      const right = p.pos[0] > Wd * 0.62;
      svg += '<text x="' + (p.pos[0] + (right ? -11 : 11)) + '" y="' + (p.pos[1] + 5) + '"' + (right ? ' text-anchor="end"' : '') + ' fill="' + (known ? '#261f15' : '#62553f') + '" font-size="' + fs + '" font-family="Georgia, serif" stroke="#efe3c6" stroke-width="3" paint-order="stroke">' + esc(known ? p.name.en : '? unexplored') + '</text>';
    }
    return svg + '</svg>';
  }
  function map(A, B, two) {
    const s = RB.game.s;
    const curMap = RB.content.maps[s.map] || {};
    const canTravel = !curMap.noTravel && RB.game.mode() === 'menu';
    const places = Object.keys(RB.content.places).map((id) => Object.assign({ id }, RB.content.places[id])).filter((p) => s.travel[p.id]);
    const chart = '<div class="chartbox">' + chartSvg(s, curMap) + '</div><p class="muted small">Solid lines are roads you have walked; dashed lines are roads you have heard of. The red mark is where you are.</p>';
    const list = '<h3>' + I('travel') + ' Travel <span class="count">' + places.length + ' known</span></h3>' +
      (canTravel ? '' : '<p class="note-slip warn">You can’t travel quickly from here. Step outside first.</p>') +
      '<ul class="entries">' + places.map((p) => {
        const here = curMap.region && p.region === curMap.region && p.hub;
        return '<li class="entry"><span class="mark">' + I(here ? 'here' : 'map') + '</span><div><div class="t">' + j(p.name.jp) + ' <span class="en">' + esc(p.name.en) + '</span></div>' + (p.desc ? '<div class="muted small">' + esc(p.desc) + '</div>' : '') + (here ? '<div class="kind">you are in this region</div>' : '') + '</div>' +
          (canTravel ? '<button class="pbtn" data-go="' + p.id + '">Travel</button>' : '<span></span>') + '</li>';
      }).join('') + '</ul><p class="muted small">Roads you have walked can be travelled quickly.</p>';
    if (two) { A.innerHTML = chart; B.innerHTML = list; } else { A.innerHTML = chart + list; }
    const handler = async (e) => {
      const b = e.target.closest('[data-go]');
      if (!b) return;
      const p = RB.content.places[b.dataset.go];
      close();
      await RB.game.transition(p.map, p.x, p.y, p.dir || 'down');
    };
    A.onclick = handler; B.onclick = handler;
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

  return { open, close, closeAll, settingsStandalone, isOpen: () => !!layer, current: () => ({ section: view.section, journey: view.journey.view, words: view.words.sub }) };
})();

RB.ui.credits = function () {
  return RB.ui.card('{終|お}わり ── そして 、 {道|みち} は {続|つづ}く 。', 'The end — and the road goes on.');
};
RB.ui.shop = function () { return Promise.resolve(); };
