/* The chart (RB.kanjiChart): every character the writing pad can read, on
 * pages to cycle through — the kana, then the kanji by theme (water and
 * liquids, nature and weather, …, a small "Other") and by use (nouns, verbs,
 * describing words, counters and numbers, names) — with a search by kanji,
 * word, kana reading, rōmaji or English meaning. A kanji opens its entry:
 * readings (with furigana), meaning, words from the game, the numbered
 * stroke-order demonstration, and a practice square where the player writes
 * it and gets the pad's reading and stroke-order notes.
 *
 * Opened from the pad (in a task, battles included: picking a character puts
 * it in the answer as "assisted"; opening an entry counts as help, like "How
 * to write") and from Words › Kanji chart (browsing and practice, no task).
 * Kanji the player has met come first on every page; the others follow,
 * dimmed, and their entries show no names or invented terms from later in
 * the story. Data: RB.kanjiInfo (src/lang/80_kanjiinfo.js). Practice reads
 * the drawing with RB.recog exactly as the pad does, without the character
 * being practised; that character is only used afterwards, to say whether
 * the reading matched and for the stroke-order notes. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.kanjiChart = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => RB.learnUi.icon(n);
  const KI = () => RB.kanjiInfo;
  const isKanji = (c) => !!c && RB.kana.isKanji(c);
  const H = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽぁぃぅぇぉっゃゅょゎ';
  const PART = 120; // kanji per page; longer lists are split ("Nouns · 2 of 11")
  const LVN = { F: 0, E: 1, I: 2, A: 3 };
  let lastPage = null; // the page the chart was last left on (this session)

  // A character with its reading as furigana (a single kanji: the reading the
  // game's words use most; 々 repeats the kanji before it and has none).
  function glyph(ch, r) {
    const rd = r || (isKanji(ch) && RB.answers && RB.answers.kanjiReading ? RB.answers.kanjiReading(ch) : null);
    return rd ? '<ruby>' + esc(ch) + '<rt>' + esc(rd) + '</rt></ruby>' : esc(ch);
  }
  function spoken(ch) {
    if (ch === '々') return 'the repeat mark 々';
    const r = isKanji(ch) && RB.answers && RB.answers.kanjiReading ? RB.answers.kanjiReading(ch) : null;
    return r ? 'the kanji ' + ch + ' (' + r + ')' : ch;
  }
  const wordHtml = (w, r) => RB.ui.jhtml(RB.jp.rubyize(w, r) || w);

  // ---- pages -------------------------------------------------------------------------
  function buildPages(opts, met) {
    const pages = [];
    const kana = opts.kana || 'any';
    if (kana !== 'kata') pages.push({ id: 'k:hira', group: 'Kana', en: 'Hiragana', jp: 'ひらがな', chars: Array.from(H) });
    if (kana !== 'hira') pages.push({ id: 'k:kata', group: 'Kana', en: 'Katakana', jp: 'カタカナ', chars: Array.from(RB.kana.toKata(H) + 'ー') });
    const order = (list) => {
      const rank = (e) => (met.has(e.ch) ? 0 : 1000) + (LVN[e.level] != null ? LVN[e.level] : 3) * 100 + Math.min(99, e.strokes);
      return list.slice().sort((a, b) => rank(a) - rank(b) || a.order - b.order).map((e) => e.ch);
    };
    const add = (group, id, en, jp, list) => {
      const chars = order(list);
      const parts = Math.max(1, Math.ceil(chars.length / PART));
      for (let p = 0; p < parts; p++) {
        pages.push({ id: id + (parts > 1 ? '#' + (p + 1) : ''), group, en: en + (parts > 1 ? ' · ' + (p + 1) + ' of ' + parts : ''), jp, chars: chars.slice(p * PART, (p + 1) * PART), kanji: true });
      }
    };
    for (const t of KI().themes()) add('Kanji by theme', 't:' + t.id, t.en, t.jp, KI().byTheme(t.id));
    for (const u of KI().uses()) add('Kanji by use', 'u:' + u.id, u.en, u.jp, KI().byUse(u.id));
    return pages;
  }

  // ---- the sheet -----------------------------------------------------------------------
  // opts: {mode: 'pick' | 'browse', kana: 'any'|'hira'|'kata', kanjiOn, onPick(ch), onLook(ch), start}
  function open(opts) {
    opts = opts || {};
    const pick = opts.mode === 'pick';
    const s = RB.game && RB.game.s;
    const met = KI().met(s);
    const pages = buildPages(opts, met);
    // where it opens: the page asked for, else where it was left; a pad that
    // reads kana only opens on its kana, anything else on a kanji page
    let pi = pages.findIndex((p) => p.id === (opts.start || lastPage));
    const kanaFirst = pick && !opts.kanjiOn;
    if (pi < 0 || (kanaFirst && !opts.start && pages[pi].kanji)) pi = pages.findIndex((p) => (kanaFirst ? !p.kanji : p.kanji));
    if (pi < 0) pi = 0;
    const lay = { name: 'chart' };
    let view = 'list'; // 'list' | 'entry' | 'practice'
    let entryCh = null, stopDemo = () => {}, practice = null, query = '', listScroll = 0;
    const close = () => { stopDemo(); if (practice) practice.destroy(); RB.ui.popLayer(lay); if (opts.onClose) opts.onClose(); };
    const fr = RB.learnUi.sheet({ cls: 'small chart kjc', title: 'Chart', meta: pick ? 'Kana and kanji' : 'Every kanji in the game', onClose: close, closeLabel: pick ? 'Back to writing' : 'Close' });
    fr.el.querySelector('[data-folio-close]').setAttribute('data-x', '');
    fr.setTitle('<span class="jline" lang="ja">' + RB.ui.jhtml('{文字|もじ}') + '</span> Chart', pick ? 'Kana and kanji' : 'Every kanji in the game');
    const fine = typeof matchMedia === 'function' && matchMedia('(pointer: fine)').matches;
    fr.leaf.innerHTML =
      '<div class="kc-top">' +
        '<div class="kc-search" role="search"><label for="kc-q" class="kc-q-lab">' + I('lens') + '<span class="sr">Search the chart</span></label>' +
          '<input id="kc-q" type="search" enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false" lang="ja" placeholder="Search: 守, まもる, mamoru, protect" aria-describedby="kc-q-help"' + (fine ? ' class="autofocus"' : '') + '>' +
          '<button type="button" class="pbtn kc-clear" data-kc="clear" hidden>' + I('close') + '<span class="sr">Clear the search</span></button></div>' +
        '<p id="kc-q-help" class="sr">Type a kanji, a word, a reading in kana or rōmaji, or an English meaning. Results appear as you type; Escape clears the search.</p>' +
        '<div class="kc-pager"><button type="button" class="pbtn kc-prev" data-kc="prev" aria-label="Previous page">' + I('back') + '</button>' +
          '<label class="kc-pagesel"><span class="sr">Page</span><select data-kc-page' + (fine ? '' : ' class="autofocus"') + '></select></label>' +
          '<button type="button" class="pbtn kc-next" data-kc="next" aria-label="Next page">' + I('next') + '</button></div>' +
      '</div>' +
      '<div class="kc-body" aria-live="off"></div>' +
      '<p class="sr" aria-live="polite" data-kc-live></p>';
    const $ = (q) => fr.leaf.querySelector(q);
    const input = $('#kc-q'), sel = $('[data-kc-page]'), body = $('.kc-body'), live = $('[data-kc-live]'), clearBtn = $('[data-kc=clear]');
    const top = $('.kc-top');
    // page select, grouped
    let optHtml = '', grp = null;
    pages.forEach((p, i) => {
      if (p.group !== grp) { if (grp) optHtml += '</optgroup>'; grp = p.group; optHtml += '<optgroup label="' + esc(grp) + '">'; }
      optHtml += '<option value="' + i + '">' + esc(p.en) + '</option>';
    });
    sel.innerHTML = optHtml + '</optgroup>';

    const note = () => pick
      ? '<p class="muted small kc-note">Using the chart counts as help for this question: a character picked here goes into your answer marked assisted.</p>'
      : '<p class="muted small kc-note">Every kanji in the game. Kanji you have met come first; the others are dimmed.</p>';

    function cellHtml(ch, isK) {
      const unmet = isK && !met.has(ch);
      const label = (isK ? spoken(ch) : ch) + (unmet ? ', not met yet' : '');
      return '<button type="button" class="kpick' + (unmet ? ' unmet' : '') + '" data-c="' + esc(ch) + '" lang="ja" aria-label="' + esc(label) + '">' + glyph(ch) + '</button>';
    }
    function renderList() {
      view = 'list';
      stopDemo();
      top.hidden = false;
      const p = pages[pi];
      sel.value = String(pi);
      lastPage = p.id;
      const metN = p.kanji ? p.chars.filter((c) => met.has(c)).length : null;
      body.innerHTML = note() +
        '<h3 class="kc-h"><span class="jline" lang="ja">' + RB.ui.jhtml(p.jp) + '</span> ' + esc(p.en) +
        ' <span class="count">' + (p.kanji ? p.chars.length + ' kanji' + (metN ? ', ' + metN + ' met' : '') : p.chars.length + ' kana') + '</span></h3>' +
        (p.kanji && metN && metN < p.chars.length ? '<p class="muted small kc-legend"><span class="kc-sw" aria-hidden="true"></span>Dimmed: not met in the story yet.</p>' : '') +
        '<div class="kchart" lang="ja" role="group" aria-label="' + esc(p.en) + '">' + p.chars.map((c) => cellHtml(c, !!p.kanji)).join('') + '</div>';
      $('.kc-prev').disabled = pi === 0;
      $('.kc-next').disabled = pi === pages.length - 1;
      live.textContent = 'Page ' + (pi + 1) + ' of ' + pages.length + ': ' + p.en + ', ' + p.chars.length + (p.kanji ? ' kanji' : ' kana');
    }
    function renderResults() {
      view = 'list';
      stopDemo();
      top.hidden = false;
      const q = query.trim();
      let res = [];
      const kanaQ = Array.from(q).filter((c) => RB.kana.isKana(c) && q.length === 1);
      try { res = KI().search(q, 60); } catch (e) { res = []; }
      // a single kana typed: that kana too (it can be picked or practised like any other)
      const kanaHit = kanaQ.length && RB.recog.knows(q, { kanji: false }) ? q : null;
      body.innerHTML = '<h3 class="kc-h">Results <span class="count">' + (res.length + (kanaHit ? 1 : 0)) + '</span></h3>' +
        (!res.length && !kanaHit ? '<p class="muted">No kanji found for “' + esc(q) + '”. Try a reading (まもる, mamoru), an English word (protect) or a word from the game (守る).</p>' : '') +
        '<ul class="kc-results" lang="ja">' +
        (kanaHit ? '<li><button type="button" class="kc-res" data-c="' + esc(kanaHit) + '"><span class="kc-rg">' + esc(kanaHit) + '</span><span class="kc-rt"><span class="en">' + (RB.kana.isHira(kanaHit) ? 'hiragana' : 'katakana') + ' · ' + esc(RB.kana.romaji(kanaHit)) + '</span></span></button></li>' : '') +
        res.map(({ e }) => {
          const unmet = !met.has(e.ch);
          const w = exampleWord(e, unmet);
          return '<li><button type="button" class="kc-res' + (unmet ? ' unmet' : '') + '" data-c="' + esc(e.ch) + '" aria-label="' + esc(spoken(e.ch) + (unmet ? ', not met yet' : '')) + '">' +
            '<span class="kc-rg">' + glyph(e.ch) + '</span><span class="kc-rt">' +
            (e.readings.length ? '<span class="kc-rds">' + esc(e.readings.join('・')) + '</span>' : '') +
            (w ? '<span class="kc-rw">' + wordHtml(w.w, w.r) + (w.m ? ' <span class="en">' + RB.learnUi.mixed(firstGloss(w.m)) + '</span>' : '') + '</span>' : '') +
            '</span></button></li>';
        }).join('') + '</ul>';
      live.textContent = (res.length + (kanaHit ? 1 : 0)) + ' results for ' + q;
    }
    const firstGloss = (m) => String(m || '').split(/[;；]/)[0];
    // The word shown for a kanji: the most basic word (for a kanji not met
    // yet, never a name or an invented term), else a word from the text.
    function exampleWord(e, unmet) {
      const ws = e.words.filter((w) => !unmet || (w.pos !== 'name' && !w.fic));
      if (ws.length) return ws[0];
      if (e.textWord) return e.textWord;
      return null;
    }
    function render() {
      if (query.trim()) renderResults(); else renderList();
      clearBtn.hidden = !query;
    }

    // ---- an entry --------------------------------------------------------------------
    function openEntry(ch, how) {
      if (pick && opts.onLook) opts.onLook(ch);
      listScroll = fr.leaf.scrollTop;
      entryCh = ch;
      view = 'entry';
      stopDemo();
      top.hidden = true;
      const kana = !isKanji(ch);
      const e = kana ? null : KI().get(ch);
      const unmet = !kana && !met.has(ch);
      const n = RB.recog.strokeCount(ch);
      let info = '';
      if (kana) {
        info = '<p><span class="kc-lab">Read</span> <b>' + esc(RB.kana.romaji(ch)) + '</b> · ' + (RB.kana.isHira(ch) ? 'hiragana' : 'katakana') + '</p>';
      } else if (e) {
        const words = e.words.filter((w) => !unmet || (w.pos !== 'name' && !w.fic)).slice(0, 4);
        const hidden = unmet && e.words.length && !words.length;
        info = (ch === '々' ? '<p>The repeat mark: it repeats the kanji before it, as in ' + wordHtml('人々', 'ひとびと') + ' and ' + wordHtml('時々', 'ときどき') + '.</p>' : '') +
          (e.readings.length ? '<p><span class="kc-lab">Readings in the game</span> <span lang="ja" class="kc-rds">' + esc(e.readings.join('・')) + '</span> <span class="muted small">(' + esc(e.readings.map((r) => RB.kana.romaji(r)).join(', ')) + ')</span></p>' : '') +
          (e.own ? '<p><span class="kc-lab">Meaning</span> ' + RB.learnUi.mixed(firstGloss(e.own.m)) + '</p>' : '') +
          (words.length ? '<p class="kc-lab">' + (e.own ? 'In words' : 'Meaning, through its words') + '</p><ul class="kc-words">' + words.map((w) => '<li><span class="jline" lang="ja">' + wordHtml(w.w, w.r) + '</span> <span class="en">' + RB.learnUi.mixed(firstGloss(w.m)) + (w.fic ? ' <span class="sealmark small">fictional</span>' : '') + '</span></li>').join('') + '</ul>' : '') +
          (!words.length && e.textWord ? '<p class="kc-lab">In the game</p><ul class="kc-words"><li><span class="jline" lang="ja">' + wordHtml(e.textWord.w, e.textWord.r) + '</span>' + (e.textWord.m ? ' <span class="en">' + RB.learnUi.mixed(firstGloss(e.textWord.m)) + '</span>' : '') + '</li></ul>' : '') +
          (hidden ? '<p class="muted small">Used in a name you haven\'t met yet.</p>' : '') +
          '<p class="muted small">' + esc(themeName(e.theme)) + (e.uses.length ? ' · ' + esc(e.uses.map(useName).join(', ')) : '') + '</p>';
      }
      const canUse = pick && (kana || opts.kanjiOn);
      body.innerHTML =
        '<div class="kc-back"><button type="button" class="pbtn quiet" data-kc="back">' + I('back') + '<span>' + (query.trim() ? 'Back to the results' : 'Back to the list') + '</span></button></div>' +
        '<div class="kc-entry">' +
          '<figure class="kc-big"><div class="kbig" lang="ja">' + glyph(ch) + '</div><figcaption class="muted small">' + n + ' stroke' + (n === 1 ? '' : 's') + (unmet ? ' · not met yet' : '') + '</figcaption></figure>' +
          '<figure class="kc-demo lesson-demo"><canvas width="360" height="360" role="img" aria-label="Stroke order for ' + esc(ch) + ': ' + n + ' numbered strokes"></canvas>' +
            '<figcaption class="muted small">Numbered strokes from KanjiVG, drawn in order.</figcaption></figure>' +
          '<div class="kc-info">' + info + '</div>' +
        '</div>' +
        '<div class="kc-acts">' +
          '<button type="button" class="pbtn primary" data-kc="practise">' + I('practice') + '<span>Practise writing it</span></button>' +
          (canUse ? '<button type="button" class="pbtn" data-kc="use">' + I('done') + '<span>Use in my answer</span></button>' : '') +
        '</div>' +
        (pick && !canUse ? '<p class="muted small">This pad reads kana only right now; choose <b>Kanji or kana</b> under Read as to write kanji in your answer.</p>' : '');
      stopDemo = RB.lessons.demo(body.querySelector('canvas'), ch);
      fr.leaf.scrollTop = 0;
      live.textContent = spoken(ch) + ', ' + n + ' strokes';
      const f = body.querySelector('[data-kc=practise]');
      if (f && how !== 'pointer') f.focus({ preventScroll: true });
    }
    const themeName = (id) => (KI().themes().find((t) => t.id === id) || { en: '' }).en;
    const useName = (id) => (KI().uses().find((u) => u.id === id) || { en: '' }).en.toLowerCase();

    // ---- practice ---------------------------------------------------------------------
    function openPractice(ch) {
      if (pick && opts.onLook) opts.onLook(ch);
      view = 'practice';
      stopDemo();
      top.hidden = true;
      if (practice) practice.destroy();
      body.innerHTML =
        '<div class="kc-back"><button type="button" class="pbtn quiet" data-kc="entry">' + I('back') + '<span>Back to <span lang="ja">' + glyph(ch) + '</span></span></button></div>' +
        '<h3 class="kc-h">Practise <span class="jline" lang="ja">' + glyph(ch) + '</span> <span class="count">' + RB.recog.strokeCount(ch) + ' strokes</span></h3>' +
        '<div class="kc-practice"></div>';
      practice = practicePad(body.querySelector('.kc-practice'), ch);
      fr.leaf.scrollTop = 0;
    }

    function back() {
      if (practice) { practice.destroy(); practice = null; }
      if (view === 'practice') { openEntry(entryCh, 'key'); return; }
      render();
      fr.leaf.scrollTop = listScroll;
      const b = body.querySelector('[data-c="' + CSS.escape(entryCh || '') + '"]');
      if (b) b.focus({ preventScroll: true });
      else input.focus({ preventScroll: true });
    }

    // ---- events -----------------------------------------------------------------------
    fr.leaf.addEventListener('click', (e) => {
      const a = e.target.closest('[data-kc]');
      if (a && !a.disabled) {
        const k = a.getAttribute('data-kc');
        if (k === 'prev' && pi > 0) { pi--; fr.leaf.scrollTop = 0; renderList(); }
        if (k === 'next' && pi < pages.length - 1) { pi++; fr.leaf.scrollTop = 0; renderList(); }
        if (k === 'clear') { query = ''; input.value = ''; render(); input.focus({ preventScroll: true }); }
        if (k === 'back') back();
        if (k === 'entry') { if (practice) { practice.destroy(); practice = null; } openEntry(entryCh, e.detail === 0 ? 'key' : 'pointer'); }
        if (k === 'practise') openPractice(entryCh);
        if (k === 'use') { close(); opts.onPick && opts.onPick(entryCh); }
        return;
      }
      const b = e.target.closest('[data-c]');
      if (!b) return;
      const ch = b.getAttribute('data-c');
      // kana in a task: one tap picks it, as ever; kanji (and kana outside a task) open their entry
      if (pick && !isKanji(ch)) { close(); opts.onPick && opts.onPick(ch); return; }
      openEntry(ch, e.detail === 0 ? 'key' : 'pointer');
    });
    RB.learnUi.guardTaps(fr.leaf);
    sel.onchange = () => { pi = +sel.value; fr.leaf.scrollTop = 0; query = ''; input.value = ''; renderList(); };
    let qTimer = null;
    input.addEventListener('input', () => {
      clearTimeout(qTimer);
      qTimer = setTimeout(() => { query = input.value; if (view !== 'list') view = 'list'; render(); }, 60);
    });
    input.addEventListener('keydown', (e) => {
      // typing here never reaches the game's keys; Tab still moves focus
      if (e.key === 'Tab') return;
      e.stopPropagation();
      if (e.isComposing || e.keyCode === 229) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        if (input.value) { input.value = ''; query = ''; render(); } else close();
      } else if (e.key === 'Enter' || e.key === 'ArrowDown') {
        clearTimeout(qTimer);
        query = input.value;
        render();
        const first = body.querySelector('[data-c]');
        if (first) { e.preventDefault(); first.focus(); }
      }
    });
    lay.el = fr.scrim;
    // Back/Escape outside the search: practice → entry → list; a search is cleared before the chart closes
    lay.onAction = (a) => {
      if (a !== 'cancel') return false;
      if (view === 'practice' || view === 'entry') { back(); return true; }
      if (query) { query = ''; input.value = ''; render(); input.focus({ preventScroll: true }); return true; }
      return false;
    };
    lay.onCancel = close;
    render();
    RB.ui.pushLayer(lay);
    return { close, el: fr.el, _state: () => ({ view, page: pages[pi] && pages[pi].id, query, entry: entryCh, pages: pages.map((p) => p.id) }), _practice: () => practice };
  }

  // ---- the practice square --------------------------------------------------------------
  // A small writing square for one character. Check reads the drawing with
  // the pad's recognizer (all kana and kanji, nothing about the target), then
  // says whether the reading is the character practised, and gives the
  // stroke-order notes for it (RB.recog.strokeOrderFeedback).
  function practicePad(host, target) {
    const BOX = 300;
    const el = RB.ui.el('div', 'kc-pp');
    el.innerHTML =
      '<div class="kc-pp-box"><canvas class="kc-pp-bg" aria-hidden="true"></canvas><canvas class="kc-pp-ink" role="img" aria-label="Practice square: write ' + esc(target) + '"></canvas></div>' +
      '<div class="kc-pp-side">' +
        '<div class="kc-pp-tools" role="group" aria-label="Practice tools">' +
          '<button type="button" class="pbtn" data-pp="undo">' + I('undo') + '<span>Undo stroke</span></button>' +
          '<button type="button" class="pbtn" data-pp="clear">' + I('erase') + '<span>Clear</span></button>' +
          '<button type="button" class="pbtn" data-pp="model" aria-pressed="false">' + I('eye') + '<span>Show the model</span></button>' +
        '</div>' +
        '<button type="button" class="pbtn primary" data-pp="check" disabled>' + I('seal') + '<span>Check</span></button>' +
        '<div class="kc-pp-fb" aria-live="polite"><p class="muted small">Write <span lang="ja">' + glyph(target) + '</span> in the square, then Check.</p></div>' +
      '</div>';
    host.appendChild(el);
    const bg = el.querySelector('.kc-pp-bg'), ink = el.querySelector('.kc-pp-ink'), box = el.querySelector('.kc-pp-box');
    const fb = el.querySelector('.kc-pp-fb'), checkBtn = el.querySelector('[data-pp=check]');
    const P = { strokes: [], cur: null, pid: null, model: false, dead: false, last: null };
    let dpr = 1;
    let C = { paper: '#fffaf0', ink: '#1c160e', guide: 'rgba(120,90,50,0.28)', model: 'rgba(168,62,39,0.38)', num: '#a83e27' };
    function colours() {
      const cs = getComputedStyle(el);
      const g = (k, d) => (cs.getPropertyValue(k) || '').trim() || d;
      C = { paper: g('--pad-paper', C.paper), ink: g('--pad-ink', C.ink), guide: g('--pad-guide', C.guide), model: g('--pad-model', C.model), num: g('--pad-num', C.num) };
    }
    function layout() {
      if (P.dead) return;
      const r = box.getBoundingClientRect();
      if (!r.width) return;
      dpr = window.devicePixelRatio || 1;
      const w = Math.round(r.width * dpr);
      colours();
      for (const c of [bg, ink]) if (c.width !== w || c.height !== w) { c.width = w; c.height = w; }
      drawBg(); redraw();
    }
    function drawBg() {
      const c = bg.getContext('2d'), w = bg.width;
      c.clearRect(0, 0, w, w);
      c.fillStyle = C.paper; c.fillRect(0, 0, w, w);
      c.strokeStyle = C.guide; c.lineWidth = Math.max(1, dpr); c.setLineDash([5 * dpr, 7 * dpr]);
      c.beginPath(); c.moveTo(w / 2, 0); c.lineTo(w / 2, w); c.moveTo(0, w / 2); c.lineTo(w, w / 2); c.stroke(); c.setLineDash([]);
      const ref = P.model && RB.recog.reference(target);
      if (ref) {
        const s = w / ref.box;
        c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = C.model; c.lineWidth = Math.max(3, w / 28);
        ref.strokes.forEach((st, i) => {
          c.beginPath(); st.forEach((p, j) => (j ? c.lineTo(p.x * s, p.y * s) : c.moveTo(p.x * s, p.y * s))); c.stroke();
          c.fillStyle = C.num; c.font = '600 ' + Math.round(w / 15) + 'px sans-serif'; c.fillText(String(i + 1), st[0].x * s + 4, st[0].y * s - 4);
        });
      }
    }
    function redraw() {
      const c = ink.getContext('2d');
      c.clearRect(0, 0, ink.width, ink.height);
      c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = C.ink; c.lineWidth = Math.max(3, ink.width / 36);
      const all = P.cur ? P.strokes.concat([P.cur]) : P.strokes;
      for (const st of all) {
        c.beginPath();
        st.forEach((p, i) => (i ? c.lineTo(p.x * ink.width, p.y * ink.height) : c.moveTo(p.x * ink.width, p.y * ink.height)));
        if (st.length === 1) c.lineTo(st[0].x * ink.width + 0.5, st[0].y * ink.height + 0.5);
        c.stroke();
      }
      checkBtn.disabled = !P.strokes.length;
    }
    const pos = (e) => { const r = ink.getBoundingClientRect(); return { x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)), t: Math.round(e.timeStamp || performance.now()) }; };
    ink.addEventListener('pointerdown', (e) => {
      if (P.pid != null || (e.pointerType === 'mouse' && e.button !== 0)) return;
      e.preventDefault(); e.stopPropagation();
      try { ink.setPointerCapture(e.pointerId); } catch (err) { /* synthetic pointers */ }
      P.pid = e.pointerId; P.cur = [pos(e)];
      RB.audio && RB.audio.sfx('pen_down', { vol: 0.4 });
      redraw();
    });
    ink.addEventListener('pointermove', (e) => {
      if (e.pointerId !== P.pid || !P.cur) return;
      e.preventDefault();
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of evs.length ? evs : [e]) { const p = pos(ev), l = P.cur[P.cur.length - 1]; if (Math.abs(p.x - l.x) + Math.abs(p.y - l.y) > 0.004) P.cur.push(p); }
      redraw();
    });
    const end = (e, cancel) => {
      if (e.pointerId !== P.pid) return;
      P.pid = null;
      if (!P.cur) return;
      if (!cancel) P.strokes.push(P.cur);
      P.cur = null;
      redraw();
      if (!cancel) RB.audio && RB.audio.sfx('pen_up', { vol: 0.3 });
    };
    ink.addEventListener('pointerup', (e) => end(e, false));
    ink.addEventListener('pointercancel', (e) => end(e, true));
    ink.addEventListener('lostpointercapture', (e) => { if (P.pid === e.pointerId) end(e, false); });
    for (const tn of ['touchstart', 'touchmove']) ink.addEventListener(tn, (e) => e.preventDefault(), { passive: false });
    ink.addEventListener('contextmenu', (e) => e.preventDefault());

    function check() {
      if (!P.strokes.length) return;
      const strokes = P.strokes.map((st) => st.map((p) => ({ x: p.x * BOX, y: p.y * BOX, t: p.t })));
      const kana = !isKanji(target);
      // the pad's reading: every kana and kanji (a kana: its own script's pad); nothing about the target
      const opt = kana ? { box: { w: BOX, h: BOX }, script: RB.kana.isHira(target) ? 'hira' : 'kata' } : { box: { w: BOX, h: BOX }, script: 'any', kanji: true };
      let r;
      try { r = RB.recog.recognize(strokes, opt); } catch (err) { r = { status: 'nonsense', candidates: [], notes: [] }; }
      let so = null;
      try { so = RB.recog.strokeOrderFeedback(strokes, target, { box: { w: BOX, h: BOX } }); } catch (err) { so = null; }
      P.last = { result: r, order: so };
      const cands = (r.candidates || []).map((c) => c.ch);
      const same = (c) => c === target || (RB.recog.sameShape(target) || []).indexOf(c) >= 0;
      const at = cands.findIndex(same);
      let head, kind, body = '';
      const T = '<span lang="ja">' + glyph(target) + '</span>', G = (c) => '<span lang="ja">' + glyph(c) + '</span>';
      const others = cands.filter((c) => !same(c)).slice(0, 4);
      if (r.status === 'nonsense' || !cands.length) {
        kind = 'unsure'; head = 'I can\'t read that clearly yet — try again.';
        if (r.kanjiLike) body = '<p>It looks like a kanji, but not one I can match. Compare with the model.</p>';
      } else if (at === 0) {
        kind = r.status === 'confident' ? 'ok' : 'unsure';
        head = r.status === 'confident' ? 'Read as ' + T + ' — that\'s it.' : 'Read as ' + T + ', though not with certainty.';
        if (cands[0] !== target) body = '<p>That shape is also <span lang="ja">' + glyph(cands[0]) + '</span>; written by hand they are one shape.</p>';
        else if (r.status !== 'confident' && others.length) body = '<p>It is close to <span lang="ja">' + others.slice(0, 3).map((c) => glyph(c)).join(' ') + '</span>.</p>';
      } else if (at > 0) {
        kind = 'unsure';
        head = 'Read first as ' + G(cands[0]) + '; ' + T + ' was reading ' + (at + 1) + '.';
        body = '<p>The pad read <span lang="ja">' + glyph(cands[0]) + '</span> first. Compare the two, or show the model.</p>';
      } else {
        kind = 'no';
        head = 'Read as ' + G(cands[0]) + ', not ' + T + '.';
        body = '<p>Other readings: <span lang="ja">' + others.map((c) => glyph(c)).join(' ') + '</span>. Compare with the model.</p>';
      }
      // stroke order: count, then order/direction notes when they are certain
      const want = RB.recog.strokeCount(target), got = P.strokes.length;
      const notes = [];
      if (got !== want) notes.push(T + ' has ' + want + ' stroke' + (want === 1 ? '' : 's') + '; you wrote ' + got + '.');
      if (so && so.confident) for (const x of so.issues) notes.push(esc(x.en));
      if (so && so.confident && !so.issues.length && got === want) notes.push('Stroke order and direction match the model.');
      else if (!(so && so.confident) && got === want && at >= 0) notes.push('The strokes could not be matched one by one with certainty, so there is no stroke-order note.');
      const mark = { ok: 'right', no: 'wrong', unsure: 'unsure' }[kind] || 'note';
      fb.innerHTML = '<div class="fb-h">' + I(mark) + '<span>' + head + '</span></div>' + body + (notes.length ? '<ul class="kc-pp-notes">' + notes.map((n) => '<li>' + n + '</li>').join('') + '</ul>' : '');
      fb.setAttribute('data-fb', kind);
      fb.className = 'kc-pp-fb fb ' + kind;
      RB.audio && RB.audio.sfx(kind === 'ok' ? 'recog_ok' : 'recog_unsure', { vol: 0.4 });
    }
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-pp]');
      if (!b || b.disabled) return;
      const a = b.getAttribute('data-pp');
      if (a === 'undo') { P.strokes.pop(); redraw(); }
      if (a === 'clear') { P.strokes = []; P.cur = null; redraw(); fb.innerHTML = '<p class="muted small">Write <span lang="ja">' + glyph(target) + '</span> in the square, then Check.</p>'; fb.removeAttribute('data-fb'); fb.className = 'kc-pp-fb'; }
      if (a === 'model') { P.model = !P.model; b.setAttribute('aria-pressed', String(P.model)); b.classList.toggle('on', P.model); drawBg(); }
      if (a === 'check') check();
    });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => layout()) : null;
    if (ro) ro.observe(box);
    requestAnimationFrame(layout);
    return (lastPP = {
      el,
      destroy() { P.dead = true; if (ro) ro.disconnect(); el.remove(); },
      _inject(strokes) { P.strokes = strokes; redraw(); }, // tests: strokes in 0..1 units
      check,
      state: P,
    });
  }
  let lastPP = null;

  return { open, glyph, practicePad, _lastPractice: () => lastPP };
})();
