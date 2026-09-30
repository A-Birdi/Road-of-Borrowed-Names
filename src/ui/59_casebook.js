/* Journey › Cases: the permanent case records (addendum §16; the rules are
 * in src/engine/59_cases.js, the cases themselves in src/content/cases/).
 *
 * A record shows the question; a factual "where you left off"; what was
 * Observed (each with who or what it came from, where, whether the speaker was
 * sure, the original Japanese with its reading, the translation and word
 * notes on request, and any picture with a text equivalent); what the player
 * Concluded (a hypothesis chosen from a bounded set, optional supporting
 * observations, tested wrong guesses with why they did not fit); a personal
 * note (plain text, at most 200 characters); two or three observations side
 * by side; and help kept apart: language help (never the answer), navigation
 * help (only to a place the player chose or a hint disclosed) and reasoning
 * help one step at a time, labelled by how much it gives away. Asking is free.
 *
 * A case may add a turnable translucent sheet (Case B): Turn over, Compare,
 * Reset and the ways to see its pressed mark, all as ordinary buttons.
 * Everything the player typed is escaped plain text. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.casebook = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => RB.ui.folio.icon(n);
  const j = (t) => (t ? RB.ui.jhtml(t) : '');
  const K = () => RB.cases;
  const V = { sel: null, compare: {}, lang: {}, warn: {}, draft: {}, status: '', focus: null };
  function select(id) { V.sel = id; }

  const KIND = { document: 'Written', object: 'Seen', speaker: 'Heard', place: 'Place', view: 'View' };
  const HINT = {
    nudge: 'A nudge — gives nothing away',
    compare: 'Something to compare — a small spoiler',
    step: 'A concrete next step — a clear pointer',
    solution: 'The answer — a full spoiler',
  };
  const placeName = (map) => { const m = RB.content.maps[map]; return m && m.name ? m.name.en : ''; };
  const art = (id) => (RB.content.caseArt && RB.content.caseArt[id]) || null;

  // ---- pieces --------------------------------------------------------------------------------
  function picture(s, c) {
    const f = c.diagram && art(c.diagram);
    if (!f) return '';
    const p = f(s, c);
    return '<figure class="cs-fig">' + p.svg + '<figcaption><span class="cs-alt-l">Picture:</span> ' + esc(p.text.en) + '</figcaption></figure>';
  }
  function source(c, x) {
    const pn = placeName((c.source && c.source.map) || (x && x.map));
    const said = c.source ? c.source.en : '';
    return '<div class="cs-src">' + esc(said) + (pn && !said.includes(pn) ? ' <span class="muted">· ' + esc(pn) + '</span>' : '') +
      (c.sure === false ? ' <span class="cs-unsure">' + I('help') + 'The speaker wasn’t sure</span>' : '') + '</div>';
  }
  function obsCard(s, id, cid, o) {
    const c = K().clueDef(cid), x = K()._D(s).clues[cid] || {};
    const r = K().rec(s, id);
    const cmp = !!(V.compare[id] && V.compare[id].includes(cid));
    const sup = !!(r && r.support.includes(cid));
    const lang = V.lang[cid];
    let h = '<article class="cs-obs' + (cmp ? ' cmp' : '') + '" data-cid="' + esc(cid) + '"><header><span class="cs-kind">' + esc(KIND[c.kind] || 'Noted') + '</span>' +
      (x.early ? ' <span class="cs-tag">noticed before you knew it mattered</span>' : '') + (x.legacy ? ' <span class="cs-tag">from an earlier visit</span>' : '') +
      '<h5>' + (c.title.jp ? j(c.title.jp) + ' ' : '') + '<span class="en">' + esc(c.title.en) + '</span></h5></header>' + source(c, x);
    if (c.jp) h += '<blockquote class="cs-orig">' + j(c.jp) + '<div class="en">' + esc(RB.script.enVars(c.en || '')) + '</div></blockquote>';
    if (c.obs) h += '<p class="cs-what"><span class="cs-alt-l">What you saw:</span> ' + esc(c.obs.en) + '</p>';
    h += picture(s, c);
    if (lang && c.lang && c.lang.length) h += '<ul class="cs-lang" aria-label="Language help">' + c.lang.map((l) => '<li>' + j(l.w) + ' <span class="en">— ' + esc(l.en) + '</span></li>').join('') + '</ul>';
    if (!o || !o.bare) {
      h += '<div class="cs-acts">' +
        '<button class="pbtn small" data-a="cmp" data-cid="' + esc(cid) + '" aria-pressed="' + cmp + '">' + I('copy') + '<span>Compare</span></button>' +
        (r && r.hypothesis && r.stage !== 'done' ? '<button class="pbtn small" data-a="sup" data-cid="' + esc(cid) + '" aria-pressed="' + sup + '">' + I('done') + '<span>Supports my hypothesis</span></button>' : '') +
        (c.lang && c.lang.length ? '<button class="pbtn small" data-a="lang" data-cid="' + esc(cid) + '" aria-pressed="' + !!lang + '">' + I('bulb') + '<span>Language help</span></button>' : '') +
        '</div>';
    }
    return h + '</article>';
  }
  function recapBlock(s, id) {
    const R = K().recap(s, id);
    if (!R) return '';
    const bits = [];
    bits.push(R.observed ? 'You have ' + R.observed + ' observation' + (R.observed > 1 ? 's' : '') + (R.places.length ? ', from ' + R.places.map((p) => p.en).join(', ') : '') + '.' : 'Nothing observed yet.');
    if (R.tried.length) bits.push('Tried and did not fit: ' + R.tried.map((l) => l.en).join('; ') + '.');
    bits.push(R.hypothesis ? 'Your current hypothesis: ' + R.hypothesis.en + '.' : 'You have not chosen a hypothesis.');
    return '<div class="cs-recap" role="note"><div class="kind">' + I('history') + ' Where you left off</div><p>' + esc(bits.join(' ')) + '</p></div>';
  }

  // ---- the sheet (a case with cd.sheet: Turn over / Compare / Reset) -----------------------------------
  function sheetOf(s, id) {
    const r = K().rec(s, id), cd = K().def(id);
    if (!r.sheet || typeof r.sheet !== 'object') r.sheet = { side: cd.sheet.start, seen: {} };
    if (r.sheet.side !== 'front' && r.sheet.side !== 'back') r.sheet.side = cd.sheet.start;
    if (!r.sheet.seen || typeof r.sheet.seen !== 'object') r.sheet.seen = {};
    return r.sheet;
  }
  function sheetBlock(s, id) {
    const cd = K().def(id), sh = cd.sheet, r = K().rec(s, id);
    const st = sheetOf(s, id);
    const shown = sh.revealed(s);
    const d = sh.draw(s, st.side, shown);
    const views = K().hyps(s, id);
    const cur = r.hypothesis && views.find((v) => v.id === r.hypothesis);
    let h = '<section class="cs-sheet" aria-labelledby="cs-sheet-h"><h4 id="cs-sheet-h">' + I('scroll') + ' ' + esc(sh.name.en) + '</h4>' +
      '<p class="muted small">' + esc(st.side === sh.start ? sh.startText.en : sh.turnedText.en) + '</p>' +
      '<div class="cs-pair"><figure class="cs-fig sheet">' + d.svg + '<figcaption><span class="cs-alt-l">As you hold it:</span> ' + esc(d.text.en) + '</figcaption></figure>';
    if (V.compare[id + ':view'] && cur) {
      const vc = K().clueDef(sh.viewOf(cur.id));
      const vp = vc && art(vc.diagram) ? art(vc.diagram)(s, vc) : null;
      if (vp) h += '<figure class="cs-fig view">' + vp.svg + '<figcaption><span class="cs-alt-l">' + esc(vc.title.en) + ':</span> ' + esc(vp.text.en) + '</figcaption></figure>';
    }
    h += '</div><div class="cs-acts" role="group" aria-label="The sketch">' +
      '<button class="pbtn" data-a="turn">' + I('next') + '<span>Turn over</span></button>' +
      '<button class="pbtn" data-a="cmpview" aria-pressed="' + !!V.compare[id + ':view'] + '"' + (views.length ? '' : ' disabled') + '>' + I('copy') + '<span>Compare</span></button>' +
      '<button class="pbtn" data-a="reset">' + I('back') + '<span>Reset</span></button></div>';
    if (!views.length) h += '<p class="muted small">Compare needs a view to compare with: look out from somewhere and it will be kept here.</p>';
    else if (!cur) h += '<p class="muted small">Choose a view below to compare the sketch with.</p>';
    // the ways to see the pressed mark (they all show the same thing)
    const ways = sh.reveals.filter((w) => !w.if || RB.state.test(s, w.if));
    h += '<div class="cs-ways"><div class="kind">' + I('look') + ' Look closer</div><div class="cs-acts">' + ways.map((w) =>
      '<button class="pbtn small" data-a="reveal" data-way="' + esc(w.id) + '" aria-pressed="' + !!st.seen[w.id] + '">' + esc(w.label.en) + '</button>').join('') + '</div>' +
      (shown ? '' : '<p class="muted small">' + esc(sh.revealHint.en) + '</p>') + '</div>';
    if (r.stage !== 'done') {
      h += '<div class="cs-acts"><button class="pbtn primary" data-a="confirm"' + (cur ? '' : ' disabled') + '>' + I('done') + '<span>' + esc(sh.confirmLabel.en) + '</span></button></div>';
      if (V.status && V.status.id === id && V.status.kind === 'sheet') h += '<p class="note-slip warn" role="status">' + esc(V.status.en) + '</p>';
    }
    return h + '</section>';
  }

  // ---- Concluded -----------------------------------------------------------------------------------------
  function concluded(s, id) {
    const cd = K().def(id), r = K().rec(s, id);
    let h = '<section class="cs-concl" aria-labelledby="cs-concl-h"><h4 id="cs-concl-h">' + I('done') + ' Concluded</h4>';
    if (r.stage === 'done') {
      const ev = r.evidence.map((cid) => K().clueDef(cid)).filter(Boolean);
      h += '<div class="cs-result">' + (cd.result ? j(cd.result.jp) + '<div class="en">' + esc(cd.result.en) + '</div>' : '') + '</div>' +
        '<p><b>It rested on:</b> ' + esc(ev.length ? ev.map((c) => c.title.en).join('; ') : 'your own recognition, before any record was kept') + '.</p>' +
        (cd.methods && cd.methods[r.method] ? '<p class="muted">' + esc(cd.methods[r.method].en) + '</p>' : '') +
        (cd.keepsake ? '<p><button class="pbtn" data-a="keepsake">' + I('keepsake') + '<span>See the keepsake</span></button></p>' : '');
      if (cd.remembered) h += '<div class="cs-remember">' + cd.remembered(s).svg + '<p class="muted small">' + esc(cd.remembered(s).text.en) + '</p></div>';
      return h + '</section>';
    }
    const hs = K().hyps(s, id);
    h += '<p class="muted small">' + esc(cd.hypPrompt ? cd.hypPrompt.en : 'Your own conclusion. Nothing here is marked right or wrong: the world will tell you.') + '</p>';
    h += '<fieldset class="cs-hyps"><legend>Your hypothesis</legend>' +
      '<label class="cs-hyp"><input type="radio" name="cs-hyp-' + esc(id) + '" value=""' + (r.hypothesis ? '' : ' checked') + '> <span>Not decided yet</span></label>' +
      hs.map((x) => '<label class="cs-hyp' + (x.tried ? ' tried' : '') + '"><input type="radio" name="cs-hyp-' + esc(id) + '" value="' + esc(x.id) + '"' + (x.chosen ? ' checked' : '') + '> <span>' +
        (x.label.jp ? j(x.label.jp) + ' ' : '') + '<span class="en">' + esc(x.label.en) + '</span>' +
        (x.tried ? '<span class="cs-tried">' + I('warn') + ' Tried: ' + esc(x.mismatch ? x.mismatch.en : 'it did not fit.') + '</span>' : '') + '</span></label>').join('') + '</fieldset>';
    if (!hs.length) h += '<p class="muted small">No possibility stands out yet.</p>';
    if (r.hypothesis && r.support.length) h += '<p class="small"><b>Supporting it:</b> ' + esc(r.support.map((cid) => K().clueDef(cid).title.en).join('; ')) + '</p>';
    // navigation help: only to the place chosen (or disclosed by a hint)
    const at = K().markAt(s, id);
    const gm = RB.questGuide.mode();
    if (at) {
      const following = cd.quest && RB.questGuide.followed(s) === cd.quest;
      h += '<div class="cs-nav"><button class="pbtn" data-a="nav" aria-pressed="' + following + '"' + (gm === 'full' ? '' : ' disabled') + '>' + I('follow') + '<span>' + (following ? 'Markers point there' : 'Mark the way there') + '</span></button>' +
        '<span class="muted small">' + esc(gm === 'full' ? 'Navigation help: markers lead to ' + (placeName(at.map) || 'the place') + ' — only because you chose it or asked.' : 'Markers are off (Settings › Quest guidance).') + '</span></div>';
    } else if (r.hypothesis) h += '<p class="muted small">You have not found where that is yet, so there is nothing to mark.</p>';
    return h + '</section>';
  }

  // ---- note and help --------------------------------------------------------------------------------------
  function noteBlock(s, id) {
    const r = K().rec(s, id);
    const draft = V.draft[id] != null ? V.draft[id] : r.note;
    const n = K().graphemes(draft).length, M = K().NOTE_MAX;
    return '<section class="cs-note"><h4>' + I('note') + ' Your note</h4><label class="sr" for="cs-note-' + esc(id) + '">Your note</label>' +
      '<textarea id="cs-note-' + esc(id) + '" data-note="' + esc(id) + '" rows="3" spellcheck="false">' + esc(draft) + '</textarea>' +
      '<div class="cs-note-foot"><span class="cs-count' + (n > M ? ' over' : '') + '" aria-live="polite">' + n + ' / ' + M + (n > M ? ' — only the first ' + M + ' characters will be kept' : '') + '</span>' +
      '<button class="pbtn small" data-a="savenote">' + I('save') + '<span>Keep note</span></button></div>' +
      '<p class="muted small">Just for you: plain words, kept with this journey. Never checked or graded.</p></section>';
  }
  function helpBlock(s, id) {
    const hs = K().hintsOf(id), n = K().hintLevel(s, id), r = K().rec(s, id);
    let h = '<section class="cs-help" aria-labelledby="cs-help-h"><h4 id="cs-help-h">' + I('help') + ' Reasoning help</h4>' +
      '<ol class="cs-hints" aria-live="polite">' + hs.slice(0, n).map((x, i) => '<li tabindex="-1"><span class="kind">Hint ' + (i + 1) + ' of ' + hs.length + ' · ' + esc(HINT[x.kind] || '') + '</span>' + j(x.jp) + '<div class="en">' + esc(x.en) + '</div></li>').join('') + '</ol>';
    if (n < hs.length && r.stage !== 'done') {
      const next = hs[n];
      if (next.kind === 'solution' && !V.warn[id]) h += '<div class="cs-acts"><button class="pbtn" data-a="hint">' + I('help') + '<span>Show hint ' + (n + 1) + ' of ' + hs.length + ' (' + esc(HINT[next.kind]) + ')</span></button></div>';
      else if (next.kind === 'solution') h += '<div class="note-slip warn" role="alert"><p>The next hint tells you the answer outright. Nothing is lost by reading it.</p><div class="cs-acts"><button class="pbtn primary" data-a="hintyes">' + I('help') + '<span>Show the answer</span></button><button class="pbtn" data-a="hintno"><span>Not yet</span></button></div></div>';
      else h += '<div class="cs-acts"><button class="pbtn" data-a="hint">' + I('help') + '<span>Show hint ' + (n + 1) + ' of ' + hs.length + ' (' + esc(HINT[next.kind]) + ')</span></button></div>';
    }
    return h + '<p class="muted small">Asking is free. Keepsakes, your companion and your journey’s ending are the same with or without help. Language help (on each observation) explains words and never the answer.</p></section>';
  }

  // ---- the record and the list ------------------------------------------------------------------------------
  function record(s, id, two) {
    const cd = K().def(id), r = K().rec(s, id);
    if (!cd || !r) return '<p class="muted">Choose a case.</p>';
    const ev = K().evidence(s, id);
    let h = (two ? '' : '<div class="backline"><button class="pbtn quiet" data-a="list">' + I('back') + 'All cases</button></div>') +
      '<div class="qdetail cs-record" data-case="' + esc(id) + '"><div class="kind">Case · ' + (r.stage === 'done' ? 'solved' : 'open') + '</div>' +
      '<h3>' + j(cd.title.jp) + '</h3><p class="en-title">' + esc(cd.title.en) + '</p>' +
      '<div class="cs-q"><div class="kind">The question</div>' + j(cd.question.jp) + '<div class="en">' + esc(cd.question.en) + '</div></div>' +
      recapBlock(s, id);
    h += '<section class="cs-observed" aria-labelledby="cs-obs-h"><h4 id="cs-obs-h">' + I('look') + ' Observed <span class="count">' + ev.length + '</span></h4>' +
      (ev.length ? ev.map((cid) => obsCard(s, id, cid)).join('') : '<p class="muted">Nothing yet.</p>') + '</section>';
    const cmp = (V.compare[id] || []).filter((cid) => ev.includes(cid));
    if (cmp.length >= 2) {
      h += '<section class="cs-compare" aria-label="Side by side"><h4>' + I('copy') + ' Side by side <button class="pbtn quiet small" data-a="cmpclear">Clear</button></h4><div class="cs-grid n' + cmp.length + '">' +
        cmp.map((cid) => obsCard(s, id, cid, { bare: true })).join('') + '</div></section>';
    } else if (cmp.length === 1) h += '<p class="muted small cs-cmp-hint">Choose one or two more observations to see them side by side.</p>';
    if (cd.sheet) h += sheetBlock(s, id);
    h += concluded(s, id) + noteBlock(s, id) + helpBlock(s, id) + '</div>';
    if (V.status && V.status.id === id && V.status.kind !== 'sheet') h += '<p class="sr" role="status">' + esc(V.status.en) + '</p>';
    return h;
  }
  function list(s, two) {
    const d = K()._D(s);
    const ids = Object.keys(d.cases).filter((id) => K().def(id)).sort((a, b) => (d.cases[a].stage === 'done') - (d.cases[b].stage === 'done') || d.cases[b].t - d.cases[a].t);
    let h = '<h3>' + I('book') + ' Cases <span class="count">' + ids.length + '</span></h3>';
    h += ids.length ? '<ul class="entries">' + ids.map((id) => {
      const cd = K().def(id), r = d.cases[id];
      return '<li><button class="entry' + (r.stage === 'done' ? ' done' : ' current') + '" data-case="' + esc(id) + '" aria-current="' + (two && V.sel === id) + '"><span class="mark">' + I(r.stage === 'done' ? 'done' : 'help') + '</span>' +
        '<span class="body"><span class="kind">' + (r.stage === 'done' ? 'Solved' : 'Open') + '</span><span class="t">' + j(cd.title.jp) + ' <span class="en">' + esc(cd.title.en) + '</span></span>' +
        '<span class="muted small">' + esc(cd.question.en) + '</span></span></button></li>';
    }).join('') + '</ul>' : '<p class="muted">No case yet.</p>';
    const lo = K().loose(s);
    if (lo.length) {
      h += '<h3>' + I('note') + ' Details you noted <span class="count">' + lo.length + '</span></h3><p class="muted small">Kept before you knew what they belong to.</p><ul class="entries">' +
        lo.map((cid) => { const c = K().clueDef(cid); return '<li class="entry"><span class="mark">' + I('note') + '</span><div><div class="t">' + esc(c.title.en) + '</div>' + source(c, d.clues[cid]) + (c.obs ? '<div class="muted small">' + esc(c.obs.en) + '</div>' : '') + '</div></li>'; }).join('') + '</ul>';
    }
    return h;
  }

  // ---- render and events ---------------------------------------------------------------------------------------
  function available(s) { return !!s && (Object.keys(K()._D(s).cases).some((id) => K().def(id)) || K().loose(s).length > 0); }
  function render(A, B, two, api) {
    const s = api.s;
    const d = K()._D(s);
    if (V.sel && !d.cases[V.sel]) V.sel = null;
    if (two && !V.sel) V.sel = Object.keys(d.cases).filter((id) => K().def(id)).sort((a, b) => (d.cases[a].stage === 'done') - (d.cases[b].stage === 'done') || d.cases[b].t - d.cases[a].t)[0] || null;
    if (two) { A.innerHTML = list(s, true); B.innerHTML = V.sel ? record(s, V.sel, true) : '<p class="muted">Choose a case to read its record.</p>'; }
    else A.innerHTML = V.sel ? record(s, V.sel, false) : list(s, false);
    const handler = (e) => click(e, s, api);
    A.onclick = handler; B.onclick = handler;
    const onInput = (e) => {
      const t = e.target.closest('[data-note]');
      if (!t) return;
      V.draft[t.dataset.note] = t.value;
      const n = K().graphemes(t.value).length, M = K().NOTE_MAX, cnt = t.parentNode.querySelector('.cs-count');
      if (cnt) { cnt.textContent = n + ' / ' + M + (n > M ? ' — only the first ' + M + ' characters will be kept' : ''); cnt.classList.toggle('over', n > M); }
    };
    A.oninput = onInput; B.oninput = onInput;
    const onChange = (e) => {
      const rb = e.target.closest('input[type=radio][name^="cs-hyp-"]');
      if (!rb) return;
      const id = rb.name.slice(7);
      K().choose(s, id, rb.value || null);
      RB.audio && RB.audio.sfx('cursor');
      V.status = { id, en: rb.value ? 'Hypothesis kept.' : 'No hypothesis.' };
      V.focus = 'input[name="cs-hyp-' + id + '"][value="' + rb.value + '"]';
      api.render();
    };
    A.onchange = onChange; B.onchange = onChange;
    if (V.focus) {
      const f = V.focus; V.focus = null;
      requestAnimationFrame(() => { const el = (two ? B : A).querySelector(f) || A.querySelector(f); if (el) el.focus({ preventScroll: true }); });
    }
  }
  function refocus(sel) { V.focus = sel; }
  async function click(e, s, api) {
    const cb = e.target.closest('[data-case]');
    if (cb && cb.tagName === 'BUTTON') { V.sel = cb.dataset.case; api.render(); return; }
    const b = e.target.closest('[data-a]');
    if (!b || b.disabled) return;
    const id = V.sel, a = b.dataset.a, cid = b.dataset.cid;
    const cd = id && K().def(id);
    switch (a) {
      case 'list': V.sel = null; api.render(); return;
      case 'cmp': {
        const L = V.compare[id] || (V.compare[id] = []);
        const i = L.indexOf(cid);
        if (i >= 0) L.splice(i, 1); else { L.push(cid); if (L.length > K().COMPARE_MAX) L.shift(); }
        refocus('[data-a="cmp"][data-cid="' + cid + '"]'); api.render(); return;
      }
      case 'cmpclear': V.compare[id] = []; api.render(); return;
      case 'sup': {
        const r = K().rec(s, id), L = r.support.slice(), i = L.indexOf(cid);
        if (i >= 0) L.splice(i, 1); else L.push(cid);
        K().setSupport(s, id, L);
        refocus('[data-a="sup"][data-cid="' + cid + '"]'); api.render(); return;
      }
      case 'lang': V.lang[cid] = !V.lang[cid]; if (V.lang[cid]) K().langHelp(s, cid); refocus('[data-a="lang"][data-cid="' + cid + '"]'); api.render(); return;
      case 'savenote': {
        const res = K().setNote(s, id, V.draft[id] != null ? V.draft[id] : K().rec(s, id).note);
        delete V.draft[id];
        V.status = { id, en: 'Note kept' + (res && res.cut ? ' (shortened to ' + K().NOTE_MAX + ' characters)' : '') + '.' };
        RB.audio && RB.audio.sfx('confirm');
        refocus('[data-note="' + id + '"]'); api.render(); return;
      }
      case 'hint': {
        const next = K().hintsOf(id)[K().hintLevel(s, id)];
        if (next && next.kind === 'solution') { V.warn[id] = true; refocus('[data-a="hintyes"]'); api.render(); return; }
        K().askHint(s, id); refocus('.cs-hints li:last-child'); api.render(); return;
      }
      case 'hintyes': K().askHint(s, id); V.warn[id] = false; refocus('.cs-hints li:last-child'); api.render(); return;
      case 'hintno': V.warn[id] = false; refocus('[data-a="hint"]'); api.render(); return;
      case 'nav': {
        const G = RB.questGuide;
        if (cd.quest) { if (G.followed(s) === cd.quest && G.chosen(s)) G.unfollow(cd.quest); else G.follow(cd.quest); }
        RB.questMarks && RB.questMarks.refresh();
        refocus('[data-a="nav"]'); api.render(); return;
      }
      case 'keepsake': api.go('journey', 'keepsakes'); return;
      // the sheet
      case 'turn': { const st = sheetOf(s, id); st.side = st.side === 'front' ? 'back' : 'front'; RB.audio && RB.audio.sfx('page'); V.status = null; refocus('[data-a="turn"]'); api.render(); return; }
      case 'reset': { const st = sheetOf(s, id); st.side = cd.sheet.start; V.compare[id + ':view'] = false; V.status = null; refocus('[data-a="reset"]'); api.render(); return; }
      case 'cmpview': V.compare[id + ':view'] = !V.compare[id + ':view']; refocus('[data-a="cmpview"]'); api.render(); return;
      case 'reveal': {
        const st = sheetOf(s, id), way = b.dataset.way;
        st.seen[way] = Date.now();
        const w = cd.sheet.reveals.find((x) => x.id === way);
        if (w && w.clue) K().observe(s, w.clue);
        refocus('[data-a="reveal"][data-way="' + way + '"]'); api.render(); return;
      }
      case 'confirm': {
        const st = sheetOf(s, id), r = K().rec(s, id);
        if (cd.sheet.matches(s, st.side, r.hypothesis)) {
          api.close();
          await RB.script.run(cd.sheet.solvedScene);
          return;
        }
        V.status = { id, kind: 'sheet', en: cd.sheet.mismatch(s, st.side, r.hypothesis).en };
        refocus('[data-a="confirm"]'); api.render(); return;
      }
    }
  }

  RB.ui.menu.addPage('journey', { id: 'cases', en: 'Cases', icon: 'book', available, render });
  if (RB.save && RB.save.addMigration) RB.save.addMigration((st) => RB.cases.migrate(st));
  return { select, render, V, sheetOf };
})();
