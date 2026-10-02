/* Companion shiritori: the views around the table — the Roadside House Rules,
 * browsing a bank, the first-time demonstration, the "Learn a few more words
 * together" primer, and looking back at a chain (Practice addendum §10, §11.4,
 * §13.5). Looking back is a transcript of what was committed: it never changes
 * a result, never awards anything and never claims foresight a search did not
 * have (a forced finish is named only when an exhaustive search proved it). */
var RB = (globalThis.RB = globalThis.RB || {});
RB.ui = RB.ui || {};
RB.ui.wordplay = RB.ui.wordplay || {};

(function (U) {
  'use strict';
  const esc = RB.util.esc;
  const WP = () => RB.wordplay;
  const SH = () => RB.shiritori;
  const I = (n) => (RB.ui.folio ? RB.ui.folio.icon(n) : '');
  const J = (jp) => (jp ? RB.ui.jhtml(jp) : '');
  const lab = (k, en) => U.lab(k, en);
  const KANA = (k) => U.KANA(k);
  const chr = (id) => ((RB.content && RB.content.chars) || {})[id] || null;
  const who = (comp) => (chr(comp) ? chr(comp).name.en : 'your companion');

  // ---- the Roadside House Rules (§10): an accessible summary ------------------------------------------------
  function rulesHtml(s) {
    const uniq = ((RB.content.wordplay && RB.content.wordplay.lines) || []).filter((l) => l.comp === s.comp && l.cat === 'rules');
    return '<section class="wp-rules"><h3 tabindex="-1">' + lab('rules') + ' <span class="en">The Roadside House Rules</span></h3>' +
      uniq.map((l) => '<div class="wp-say"><span class="who">' + esc(who(s.comp)) + '</span><span class="jp">' + J(l.jp) + '</span><span class="en">' + esc(l.en) + '</span></div>').join('') +
      '<ol class="wp-rulelist">' +
      '<li>A game starts from a neutral <b>starter</b> word. The table says who responds first; then you take turns.</li>' +
      '<li>Each word must <b>begin with the last kana of the word before</b> — of its reading, never the last kanji or a romaji letter. The kana you need is always shown.</li>' +
      '<li>Hiragana and katakana count the same (' + KANA('ネコ') + ' = ' + KANA('ねこ') + '). Voicing marks count: ' + KANA('か') + ', ' + KANA('が') + ' and ' + KANA('ぱ') + ' are different.</li>' +
      '<li>A final small kana passes its full-size form: ' + KANA('おもちゃ') + ' passes ' + KANA('や') + '. A final ' + KANA('ー') + ' passes the vowel before it: ' + KANA('コーヒー') + ' passes ' + KANA('い') + ', ' + KANA('スーパー') + ' passes ' + KANA('あ') + '. Written vowels count as written: ' + KANA('ぎゅうにゅう') + ' passes ' + KANA('う') + '.</li>' +
      '<li>A word ending in ' + KANA('ん') + ' ends the game: whoever plays it loses (the table warns you first).</li>' +
      '<li><b>No repeats.</b> A word, its other spellings, its other readings and words sharing its reading (' + KANA('はし') + ': bridge and chopsticks) are used up together.</li>' +
      '<li>Only this match\'s <b>word bank</b> counts: common nouns, the same bank for both of you. A word outside it may be perfectly good Japanese; it just isn\'t in this game.</li>' +
      '<li>If a move leaves the other side no unused word that is safe to play, that side has lost: no playable continuation remains <i>in this bank</i>.</li>' +
      '<li>An unknown word, a wrong kana or a repeat is a draft, not a move: it is explained and your turn is kept. A recognised character is not a move either — <b>Play word</b> is.</li>' +
      '<li>No timer. If you are stuck: Find a word, keep thinking, or concede. Leaving the table can keep the match for later, or end it without a result.</li>' +
      '</ol><p class="muted small">These are this game\'s published house rules; households play shiritori in different ways.</p></section>';
  }
  U.rulesView = async function (V) {
    await U.show(V, rulesHtml(V.s) + '<div class="row-acts"><button class="pbtn primary" data-wp="back" data-autofocus>' + I('back') + lab('back') + '</button></div>',
      (el, done) => el.addEventListener('click', (e) => { if (e.target.closest('[data-wp=back]')) done({ act: 'back' }); }), { closeAct: 'back' });
  };
  // from the table: a sheet over it, so the game underneath is untouched
  U.rulesSheet = function () {
    return new Promise((res) => {
      const s = RB.game.s;
      const fr = RB.ui.folio.frame({ cls: 'wp-folio wp-sheet', onClose: () => close(), closeLabel: 'Back to the table' });
      fr.setTitle(lab('rules'), '');
      fr.box.innerHTML = '<div class="leaf wp-leaf" tabindex="-1">' + rulesHtml(s) + '</div>';
      const layer = { el: fr.scrim, name: 'wordplay-rules', onCancel: () => close() };
      function close() { RB.ui.popLayer(layer); res(); }
      RB.ui.pushLayer(layer);
    });
  };

  // ---- browsing a bank before play (§9.3: all banks can be browsed) -----------------------------------------
  U.bankView = async function (V, setup) {
    const s = V.s;
    let band = setup.band === 'journey' ? 'journey' : setup.band;
    let filter = '';
    for (;;) {
      const bf = WP().bankFor(s, { band });
      const bank = bf.ok ? bf.bank : null;
      const key = SH().norm(filter);
      const list = bank ? bank.entries.filter((e) => !key || SH().readingsOf(e).some((r) => r.indexOf(key) === 0) || e.display.en.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
        .sort((x, y) => SH().readingsOf(x)[0].localeCompare(SH().readingsOf(y)[0], 'ja') || (x.id < y.id ? -1 : 1)) : [];
      const h = '<section class="wp-browse"><h3 tabindex="-1">' + lab('browse') + '</h3>' +
        '<div class="wp-tabs" role="group" aria-label="Word bank">' + ['pocket', 'everyday', 'extended', 'journey'].map((b) => '<button class="pbtn wp-tab" data-wp-band="' + b + '" aria-pressed="' + (b === band) + '">' + esc(WP().BAND[b].en) + '</button>').join('') + '</div>' +
        (bank ? '<p class="muted small">' + esc(bank.groupCount + ' words (distinct repeat-groups), ' + bank.entries.length + ' entries; version ' + bank.version + '.' + (band === 'journey' ? ' Only words you have met; nothing here claims you have mastered them.' : '')) + '</p>' +
          '<label for="wp-bfilter">Search by reading or meaning</label> <input id="wp-bfilter" class="wp-filter" lang="ja" autocomplete="off" value="' + esc(filter) + '">' +
          '<ul class="wp-bank">' + list.map((e) => '<li><div class="wp-word"><span class="w">' + J(e.display.jp) + '</span><span class="r" lang="ja">' + esc(SH().readingsOf(e).join(' / ')) + '</span><span class="m">' + esc(e.display.en) + '</span>' +
            (SH().readingsOf(e).every((r) => SH().boundary(r).terminal) ? '<span class="tag n">' + lab('endsN') + '</span>' : '') + '</div></li>').join('') + '</ul>'
          : '<p>' + esc(bf.why || 'Not installed.') + '</p>') +
        '<div class="row-acts"><button class="pbtn primary" data-wp="back">' + I('back') + lab('back') + '</button></div></section>';
      const r = await U.show(V, h, (el, done) => {
        el.addEventListener('click', (e) => {
          const b = e.target.closest('[data-wp-band]');
          if (b) { done({ act: 'band', band: b.dataset.wpBand }); return; }
          if (e.target.closest('[data-wp=back]')) done({ act: 'back' });
        });
        const f = el.querySelector('#wp-bfilter');
        if (f) f.addEventListener('change', () => done({ act: 'filter', v: f.value }));
        if (f) f.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); done({ act: 'filter', v: f.value }); } });
      }, { closeAct: 'back' });
      if (r.act === 'band') { band = r.band; continue; }
      if (r.act === 'filter') { filter = r.v; continue; }
      return;
    }
  };

  // ---- the first-time demonstration (§9.2): a few real turns from the chosen bank ------------------------
  U.demoView = async function (V, setup) {
    const s = V.s;
    const bf = WP().bankFor(s, setup.band === 'journey' ? { band: 'pocket' } : setup);
    const bank = bf.ok ? bf.bank : null;
    let steps = '';
    if (bank) {
      const st = (bank.starters || [])[0] || bank.entries[0].id;
      const g = SH().newGame(bank, { starter: st, first: 'pc' });
      const h0 = g.history[0];
      const e0 = bank.entryById[h0.entry];
      const rep = SH().safeReplies(g, bank).slice().sort((x, y) => (x.id < y.id ? -1 : 1))[0];
      steps += '<li>The starter: ' + J(e0.display.jp) + ' <span lang="ja">' + esc(h0.reading) + '</span> (' + esc(e0.display.en) + '). It ends in ' + KANA(h0.tail) + ', so the next word begins with ' + KANA(h0.tail) + '.</li>';
      if (rep) {
        const e1 = bank.entryById[rep.entry];
        steps += '<li>For example ' + J(e1.display.jp) + ' <span lang="ja">' + esc(rep.reading) + '</span> (' + esc(e1.display.en) + '). Now the next word begins with ' + KANA(rep.tail) + '.</li>';
      }
      steps += '<li>You can write it on the pad, type it, or (Open-book) choose it from the bank. Nothing is played until you press <b>Play word</b>.</li>';
      steps += '<li>A word ending in ' + KANA('ん') + ' would end the game as a loss — the table warns you and lets you edit.</li>';
      steps += '<li>Leave the other side no unused word for their kana, and you win.</li>';
    }
    const l = WP().line(s, 'rules', 'demo');
    await U.show(V, '<section class="wp-demo"><h3 tabindex="-1">' + lab('demo') + '</h3>' +
      (l ? '<div class="wp-say"><span class="who">' + esc(who(s.comp)) + '</span><span class="jp">' + J(l.jp) + '</span><span class="en">' + esc(l.en) + '</span></div>' : '') +
      (steps ? '<ol class="wp-rulelist">' + steps + '</ol>' : '<p class="muted">The word banks are not installed, so there is nothing to show yet.</p>') +
      '<div class="row-acts"><button class="pbtn primary" data-wp="go" data-autofocus>' + I('practice') + lab('start') + '</button></div></section>',
    (el, done) => el.addEventListener('click', (e) => { if (e.target.closest('[data-wp=go]')) done({ act: 'go' }); }), { closeAct: 'go' });
  };

  // ---- "Learn a few more words together" (§11.4): shown outside a match, then counted as met ---------------
  U.primerView = async function (V) {
    const s = V.s;
    const words = WP().primer(s);
    const h = '<section class="wp-primer"><h3 tabindex="-1">' + lab('primer') + '</h3>' +
      (words.length ? '<p>' + esc(who(s.comp) + ' sets out a few slips. Read them together; from now on they count as words you have met (not words you have mastered), and the next From my journey game is rebuilt with them.') + '</p>' +
        '<ul class="wp-bank">' + words.map((e) => '<li><div class="wp-word"><span class="w">' + J(e.display.jp) + '</span><span class="r" lang="ja">' + esc(SH().readingsOf(e).join(' / ')) + '</span><span class="m">' + esc(e.display.en) + '</span></div></li>').join('') + '</ul>'
        : '<p class="muted">Every word in the Pocket bank is already among the words you have met.</p>') +
      '<div class="row-acts"><button class="pbtn primary" data-wp="done" data-autofocus>' + I('done') + 'Done</button></div></section>';
    const r = await U.show(V, h, (el, done) => el.addEventListener('click', (e) => { if (e.target.closest('[data-wp=done]')) done({ act: 'done' }); }), { closeAct: 'done' });
    // shown → met (only after being displayed; no mastery event)
    if (r.act !== 'dead') WP().markEncountered(s, words.map((e) => e.id));
  };

  // ---- looking back at a chain (§13.5): non-mutating ---------------------------------------------------------------
  const ACTOR = (t, a) => (a === 'start' ? 'Starter' : a === 'pc' ? 'You' : who(t.comp));
  U.reviewHtml = function (s, t, sel) {
    const n = t.moves.length;
    const i = sel == null ? n - 1 : Math.max(0, Math.min(n - 1, sel));
    const m = t.moves[i];
    const usedBefore = t.moves.slice(0, i).map((x) => x.r);
    const coop = t.format === 'cooperative';
    const head = (WP().BAND[t.band] ? WP().BAND[t.band].en : t.band) + ' · ' + (WP().LEVEL[t.level] ? WP().LEVEL[t.level].en : t.level) + (coop ? ' · aiming for ' + t.goal : '');
    const res = t.result || {};
    const outcome = coop ? (res.reason === 'cooperative-goal' ? 'Chain complete' : 'Chain ended') : res.winner === 'pc' ? 'You won' : res.winner === 'cpu' ? who(t.comp) + ' won' : res.reason === 'incompatible-resume' ? 'Unfinished (could not be resumed)' : 'No result';
    const when = t.t1 ? new Date(t.t1).toLocaleDateString() : '';
    let h = '<section class="wp-review"><h3 tabindex="-1">' + I('history') + esc(outcome) + ' <span class="muted small">' + esc(head + (when ? ' · ' + when : '')) + '</span></h3>' +
      '<p class="wp-reason">' + U.reasonText(s, Object.assign({ format: t.format, cmoves: res.cmoves }, res)) + '</p>' +
      '<p class="muted small">' + esc(WP().supportLabel(t.support)) + ' · Rules ' + esc(t.rules) + ' · Bank ' + esc(t.bank.id + ' v' + t.bank.version) + (t.moves.some((x) => x.prov) ? ' · opponent provisional (' + esc(t.ai) + ')' : '') + '</p>' +
      '<p class="muted small">A record of what was played. Reading it changes nothing.</p>' +
      '<ol class="wp-chain wp-review-chain">' + t.moves.map((x, k) => '<li class="wp-slip' + (k === i ? ' sel' : '') + (k < i ? ' before' : '') + '" data-actor="' + x.a + '"><button class="wp-turnbtn" data-wp-turn="' + k + '" aria-pressed="' + (k === i) + '">' +
        '<span class="by">' + esc(ACTOR(t, x.a)) + '</span><span class="w">' + J(x.j || x.r) + '</span><span class="r" lang="ja">' + (x.j && SH().norm(RB.ui.plainJp(x.j)) === x.r ? '' : esc(x.r)) + '</span><span class="m">' + esc(x.en || '') + '</span>' +
        (x.t && x.t !== 'ん' ? '<span class="t">→ ' + KANA(x.t) + '</span>' : '<span class="t">' + KANA('ん') + '</span>') + '</button></li>').join('') + '</ol>';
    // the selected turn: the required kana then, the words already used, and plain counts
    const req = i > 0 ? t.moves[i - 1].t : null;
    h += '<div class="wp-turninfo" aria-live="polite"><h4>' + esc(i === 0 ? 'The starter' : 'Turn ' + i + ' · ' + ACTOR(t, m.a)) + '</h4>' +
      (req ? '<p>Required kana: ' + KANA(req) + '. ' + (m.sr != null ? esc(m.sr + ' unused safe word' + (m.sr === 1 ? '' : 's') + ' began with it then') + ' (counted in this match\'s bank).' : '') + '</p>' : '') +
      (m.left != null && m.t !== 'ん' ? '<p>' + esc('After this word, the other side had ' + m.left + ' safe repl' + (m.left === 1 ? 'y' : 'ies') + ' beginning with ') + KANA(m.t) + '.</p>' : '') +
      (m.a === 'cpu' && m.d != null ? '<p class="muted small">' + esc(m.x ? 'This move came from a search that ' + (m.d ? 'checked ' + m.d + ' ply exhaustively' : 'finished exactly') + '.' : m.d ? 'This move looked stronger within the checked moves (' + m.d + ' ply); not an exhaustive proof.' : 'This move was chosen without search (Casual).') + '</p>' : '') +
      (usedBefore.length ? '<p class="small">Already used before this word: ' + usedBefore.map((r) => '<span lang="ja">' + esc(r) + '</span>').join('、 ') + '</p>' : '') + '</div>';
    h += '<div class="wp-analysis muted small"></div>';
    return h + '</section>';
  };
  // further analysis, opt-in: only claims of the search that actually ran (§13.5)
  async function analysis(el, s, t) {
    const box = el.querySelector('.wp-analysis');
    if (!box) return;
    let bank = null;
    for (const b of WP().BANDS) { const bk = SH().bank(b); if (bk && bk.hash === t.bank.hash) bank = bk; }
    if (!bank || !SH().analyse) { box.textContent = 'Further analysis needs this match\'s exact word bank; it is not available for this record.'; return; }
    let r = null;
    try {
      const g = SH().newGame(bank, { starter: t.moves[0].e, first: t.moves[1] ? t.moves[1].a : 'pc' });
      for (const x of t.moves.slice(1)) { const e = bank.edges.find((y) => y.entry === x.e && y.reading === x.r); if (!e || g.over) break; SH().play(g, bank, e, x.a); }
      r = await SH().analyse(g, bank);
    } catch (e) { r = null; }
    const notes = (r && r.notes) || [];
    if (!notes.length) { box.textContent = r && r.provisional ? 'No further analysis is available in this build (the analysis is provisional).' : 'No further notes for this chain.'; return; }
    box.innerHTML = '<ul>' + notes.map((n) => '<li>' + esc(n.en || n.text || '') + ' <i>' + esc(noteTag(n)) + '</i></li>').join('') + '</ul>';
  }
  // how sure a note is, in the engine's own terms: a fact of the chain, a proven result, or a
  // preference within a bounded search (never stated as proof). Older notes carry only `exact`.
  function noteTag(n) {
    if (n.label === 'fact') return '(a fact of this chain)';
    if (n.label === 'proven' || n.proven === true) return '(proven)';
    if (n.label === 'checked' || n.proven === false) return '(within the checked moves; not proven)';
    return n.exact ? '(proven by an exhaustive search of that position)' : '(looked stronger within the checked moves)';
  }
  // Optional ordinary practice from the look back (§4.3): words of this chain that have a word
  // card, asked through the shared challenge runner and the practice adapter, so each gives at
  // most one ordinary assessment event of its own. Playing them in the game never did.
  function practiseKeys(t) {
    const out = [];
    for (const m of t.moves.slice(1)) {
      if (!m.j || out.length >= 3 || m.t === 'ん') continue;
      const w = RB.jp && RB.jp.plain ? RB.jp.plain(m.j).replace(/\s/g, '') : m.r;
      const key = w + '|' + m.r;
      if (RB.tasks && RB.tasks.findWord && RB.tasks.findWord(key) && !out.includes(key)) out.push(key);
    }
    return out;
  }
  async function practise(t) {
    const keys = practiseKeys(t);
    const ob = RB.practice.objectives({ kind: 'wordplay-review' });
    for (const key of keys) {
      const step = RB.tasks.vocabStep(key);
      if (!step) continue;
      RB.game.pushMode('challenge');
      let res = null;
      try { res = await RB.challenge.runStep(RB.tasks.prepare ? RB.tasks.prepare(step) : step, { noRecord: true, cancelLabel: 'Stop practising' }); } finally { RB.game.popMode('challenge'); }
      if (!res || res.cancelled) break;
      ob.assess('wordplay:' + t.id + ':' + key, step.item, res, { kind: 'wordplay-review' });
    }
  }
  U.practiseKeys = practiseKeys;
  U.reviewView = async function (V, t, o) {
    o = o || {};
    const s = V.s;
    let sel = null;
    for (;;) {
      const r0 = WP().peek(s, t.comp) || { pinned: [] };
      const pinned = r0.pinned.some((x) => x.id === t.id);
      const canPractise = practiseKeys(t).length > 0;
      const h = U.reviewHtml(s, t, sel) + '<div class="row-acts">' +
        '<button class="pbtn" data-wp="analyse">' + I('lens') + 'More analysis</button>' +
        (canPractise ? '<button class="pbtn" data-wp="practise">' + I('practice') + 'Practise words from this chain</button>' : '') +
        (t.comp === s.comp ? '<button class="pbtn quiet" data-wp="' + (pinned ? 'unpin' : 'pin') + '">' + I('keepsake') + lab(pinned ? 'unpin' : 'pin', pinned ? 'Unpin this chain' : 'Pin this chain') + '</button>' : '') +
        '<button class="pbtn primary" data-wp="back" data-autofocus>' + I('back') + esc(o.back || 'Back') + '</button></div>';
      const r = await U.show(V, h, (el, done) => {
        el.addEventListener('click', (e) => {
          const tb = e.target.closest('[data-wp-turn]');
          if (tb) { done({ act: 'turn', k: +tb.dataset.wpTurn }); return; }
          const b = e.target.closest('[data-wp]');
          if (!b) return;
          if (b.dataset.wp === 'analyse') { analysis(el, s, t); return; }
          done({ act: b.dataset.wp });
        });
      }, { closeAct: 'back' });
      if (r.act === 'turn') { sel = r.k; continue; }
      if (r.act === 'practise') { await practise(t); continue; }
      if (r.act === 'unpin') { WP().unpin(s, t.id); continue; }
      if (r.act === 'pin') { await pinFlow(s, t); continue; }
      return;
    }
  };
  // five pinned at most: an explicit replacement (§13.6)
  async function pinFlow(s, t) {
    let res = WP().pin(s, t.id);
    if (res.ok || res.why !== 'full') return res;
    const list = (WP().peek(s) || { pinned: [] }).pinned;
    const labels = list.map((x) => 'Replace: ' + (x.result && x.result.winner === 'pc' ? 'a win' : x.format === 'cooperative' ? 'a chain' : 'a game') + ' (' + (WP().BAND[x.band] ? WP().BAND[x.band].en : x.band) + ', ' + new Date(x.t1 || 0).toLocaleDateString() + ')');
    const c = await RB.ui.confirm('Five chains are already pinned. Replace one of them with this chain?', labels.concat('Keep them all'));
    if (c >= 0 && c < list.length) res = WP().pin(s, t.id, list[c].id);
    return res;
  }
  U.pinFlow = pinFlow;
})(RB.ui.wordplay);
