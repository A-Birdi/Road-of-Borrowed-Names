/* Companion shiritori: the ways in (Practice addendum §3.3–§3.4, §13.2, §14.3,
 * §20.1, §26.4). Company › Companion gets a Wordplay card (the 3×3 stage grid,
 * receipts, cooperative and custom rows kept apart, Play/Resume, Rules, Review a
 * saved chain, How we played when it is waiting). Play opens the same
 * preparation sheet as the rest-stop conversation, closes the folio first, and
 * the activity controller brings the folio back to the same page afterwards.
 * Nothing here intercepts talking to the companion: the rest-menu choices are
 * added after the existing ones (src/content/wordplay/90_hooks.js). */
var RB = (globalThis.RB = globalThis.RB || {});
RB.ui = RB.ui || {};
RB.ui.wordplay = RB.ui.wordplay || {};

(function (U) {
  'use strict';
  const esc = RB.util.esc;
  const WP = () => RB.wordplay;
  const I = (n) => (RB.ui.folio ? RB.ui.folio.icon(n) : '');
  const J = (jp) => (jp ? RB.ui.jhtml(jp) : '');
  const lab = (k, en) => U.lab(k, en);
  const chr = (id) => ((RB.content && RB.content.chars) || {})[id] || null;
  const hasDom = () => typeof document !== 'undefined';

  // ---- launching (one session; the controller re-checks eligibility at the moment of launch) ---------------
  U.launch = async function (ctx) {
    ctx = ctx || {};
    const r = await RB.activity.launch('shiritori', ctx);
    if (!r.ok && r.why && r.why !== 'The campaign changed.') RB.ui.notice(r.why, 'info');
    // the folio is reopened on the page it came from (09_activity.js); focus goes back to the card
    if (ctx.source === 'company' && hasDom()) {
      setTimeout(() => {
        if (!RB.ui.menu.isOpen()) return;
        const b = document.querySelector('[data-co-sec="wordplay"][data-wp-act="play"]') || document.querySelector('[data-co-sec="wordplay"][data-wp-act="resume"]');
        if (b) b.focus({ preventScroll: true });
      }, 340);
    }
    return r;
  };
  // from inside a conversation (the rest menu): wait until the scene has let go of the screen
  U.launchAfterScene = function (ctx) {
    const t0 = Date.now();
    const tick = () => {
      if (!RB.game || !RB.game.s) return;
      if (!RB.script.isRunning() && RB.game.mode() === 'world') { U.launch(ctx); return; }
      if (Date.now() - t0 < 4000) setTimeout(tick, 40);
    };
    setTimeout(tick, 0);
  };
  U.reflectionScene = (s) => (s && s.comp && RB.content.wordplay.reflections ? RB.content.wordplay.reflections[s.comp] : null);

  // ---- How we played: the scene hooks (src/content/wordplay/20_reflect.js) ----------------------------------------
  RB.hooks = RB.hooks || {};
  RB.hooks.wp_reflect = async (a) => {
    const s = RB.game.s;
    const bl = (s.backlog || []).slice(-12);
    const chose = bl.slice().reverse().find((l) => l.choice && l.who === 'pc');
    const reply = bl.slice().reverse().find((l) => !l.choice && l.who && l.who !== 'pc' && l.who !== 'narr' && (l.jp || l.en));
    const lines = bl.filter((l) => l.jp || l.en).slice(-8).map((l) => ({ who: l.who, jp: l.jp, en: RB.script.enVars(l.en), choice: !!l.choice }));
    WP().reflect(s, a[0], { said: chose ? { jp: chose.jp, en: chose.en } : null, reply: reply ? { jp: reply.jp, en: RB.script.enVars(reply.en) } : null, lines });
    RB.bus.emit('company:changed', { id: 'wordplay:reflection' });
  };
  RB.hooks.wp_reflect_defer = async () => { WP().deferReflection(RB.game.s); RB.bus.emit('company:changed', { id: 'wordplay:reflection' }); };

  // ---- Company › Companion › Wordplay (§13.2, §26.4) ----------------------------------------------------------------------
  const STATE_LABEL = { none: 'stateNone', played: 'statePlayed', won: 'stateWon' };
  const STAMP = { none: '', played: '<span class="wp-ink" aria-hidden="true">·</span>', won: '<span class="wp-ink won" aria-hidden="true">◎</span>' };
  const miniCache = {};
  function mini(comp) {
    if (!hasDom() || !RB.portraits) return '';
    if (!miniCache[comp]) {
      try { const cv = document.createElement('canvas'); cv.width = 96; cv.height = 96; RB.portraits.draw(cv, comp, 'smile'); miniCache[comp] = cv.toDataURL(); } catch (e) { miniCache[comp] = ''; }
    }
    return miniCache[comp] ? '<img class="wp-mini" src="' + miniCache[comp] + '" width="40" height="40" alt="">' : '';
  }
  const dateOf = (t) => { try { return new Date(t).toLocaleDateString(); } catch (e) { return ''; } };
  function receipt(c, rcp, what) {
    if (!rcp) return '';
    return '<li><b>' + esc(what) + '</b> ' + esc(WP().BAND[rcp.band].en + ' · ' + WP().LEVEL[rcp.level].en) + ' · won ' + esc(dateOf(rcp.t)) + ' · first winning chain ' + rcp.chain + ' played word' + (rcp.chain === 1 ? '' : 's') +
      '<div class="small">' + esc('Support: ' + WP().supportLabel(rcp.support)) + '</div><div class="small muted">' + esc('Rules ' + rcp.rules + ' · Bank ' + rcp.bank.id + ' v' + rcp.bank.version + (rcp.ai ? ' · opponent ' + rcp.ai : '')) + '</div>' +
      '<button class="pbtn quiet" data-co-sec="wordplay" data-wp-act="receipt" data-id="' + esc(rcp.transcript || rcp.session) + '">' + I('history') + 'See this chain</button></li>';
  }
  function card(s, comp, V) {
    const c = chr(comp);
    const r = WP().peek(s, comp);
    const el = WP().eligible(s);
    const active = s.practice && s.practice.shiritori && s.practice.shiritori.active && s.practice.shiritori.active.comp === comp ? s.practice.shiritori.active : null;
    const any = r && (r.recent.length || Object.keys(r.stages).length || r.cooperative.chains || r.customSummary.played || r.customSummary.coop);
    const name = esc(c ? c.name.en : comp);
    let h = '<section class="co-detail wp-card" aria-label="Wordplay"><h4>' + mini(comp) + I('talk') + lab('wordplay') + ' <span class="muted small">' + esc('shiritori with ' + (c ? c.name.en : comp)) + '</span></h4>';
    // actions: Play/Resume (only where it can be played), Rules, Review
    h += '<div class="row-acts">';
    if (active) h += '<button class="pbtn primary" data-co-sec="wordplay" data-wp-act="resume"' + (el.ok ? '' : ' disabled aria-describedby="wp-why"') + '>' + I('next') + lab('resume') + '</button>' +
      '<button class="pbtn" data-co-sec="wordplay" data-wp-act="end">' + lab('endMatch') + '</button>';
    else h += '<button class="pbtn primary" data-co-sec="wordplay" data-wp-act="play"' + (el.ok ? '' : ' disabled aria-describedby="wp-why"') + '>' + I('practice') + lab('play') + '</button>';
    h += '<button class="pbtn" data-co-sec="wordplay" data-wp-act="rules">' + I('note') + lab('rules') + '</button>' +
      '<button class="pbtn" data-co-sec="wordplay" data-wp-act="review"' + (r && WP().transcripts(s, comp).length ? '' : ' disabled') + '>' + I('history') + lab('review') + '</button></div>';
    if (!el.ok) h += '<p class="muted small" id="wp-why">' + esc(el.why + (el.code === 'rest' || el.code === 'apart' ? ' The records below can always be read.' : '')) + '</p>';
    if (active) h += '<p class="small">' + esc('A match is waiting: ' + WP().BAND[active.band].en + ' · ' + WP().LEVEL[active.level].en + ' · ' + RB.shiritori.moves(active.st) + ' words played.') + '</p>';
    // How we played, when it is waiting (an activity-owned flag; never the story's pending topic)
    const rf = WP().reflection(s);
    if (rf && comp === s.comp) {
      const safe = RB.company.safeHere();
      h += '<div class="co-pending wp-reflect" role="note">' + I('talk') + '<span>A conversation is available: ' + lab('reflectTitle') + (rf.st === 'deferred' ? ' <span class="muted small">(you said not now)</span>' : '') + '</span>' +
        '<button class="pbtn" data-co-sec="wordplay" data-wp-act="reflect"' + (safe.ok ? '' : ' disabled') + '>' + I('talk') + 'Talk now</button></div>';
    }
    // the nine stages (only this companion's; separate journeys keep their own)
    const cells = WP().cells(s, comp);
    h += '<table class="wp-grid"><caption class="sr">' + esc('Stage records with ' + (c ? c.name.en : comp)) + '</caption><thead><tr><th scope="col"><span class="sr">Words</span></th>' +
      WP().LEVELS.map((l) => '<th scope="col">' + RB.ui.label(WP().LEVEL[l].jp, WP().LEVEL[l].en) + '</th>').join('') + '</tr></thead><tbody>' +
      WP().BANDS.map((b) => '<tr><th scope="row">' + RB.ui.label(WP().BAND[b].jp, WP().BAND[b].en) + '</th>' + WP().LEVELS.map((l) => {
        const x = cells.find((y) => y.band === b && y.level === l);
        return '<td class="wp-cell" data-state="' + x.state + '" data-code="' + x.code + '"><span class="lv">' + RB.ui.label(WP().LEVEL[l].jp, WP().LEVEL[l].en) + '</span>' + STAMP[x.state] + '<span class="st">' + lab(STATE_LABEL[x.state]) + '</span>' +
          (x.cell && x.cell.noSuggest ? '<span class="wp-mark small" title="Also won without in-game word suggestions">no suggestions</span>' : '') + '</td>';
      }).join('') + '</tr>').join('') + '</tbody></table>';
    if (!any) h += '<p class="muted">No matches recorded.</p>';
    if (r && r.lastWin) {
      const lw = r.lastWin;
      h += '<div class="wp-latest"><p><b>Latest clear:</b> ' + esc(WP().BAND[lw.stage.split(':')[0]].en + ' · ' + WP().LEVEL[lw.stage.split(':')[1]].en) + '</p>' +
        '<p class="small">' + esc('Support: ' + WP().supportLabel(lw.support)) + '</p><p class="small">' + esc('Winning chain: ' + lw.chain + ' played words') + '</p>' +
        '<p class="small muted">' + esc('Rules ' + lw.rules + ' · Bank ' + lw.bank.id + ' v' + lw.bank.version) + '</p></div>';
    }
    // receipts of the won cells (expandable, so the page stays short)
    const won = cells.filter((x) => x.state === 'won');
    if (won.length) {
      h += '<details class="wp-receipts"><summary>' + esc('Stage receipts (' + won.length + ')') + '</summary><ul>' + won.map((x) => receipt(x.cell, x.cell.first, 'First win:') +
        (x.cell.current ? receipt(x.cell, x.cell.current, 'Under the current version:') : '') + (x.cell.noSuggest && x.cell.noSuggest !== x.cell.first ? receipt(x.cell, x.cell.noSuggest, 'Without in-game suggestions:') : '')).join('') + '</ul></details>';
    }
    // cooperative milestones and custom-bank play: their own rows, never in the nine stages
    if (r && r.cooperative.chains) {
      const gs = WP().GOALS.filter((n) => r.cooperative.goals[n]);
      h += '<p class="wp-row"><b>Learning partner:</b> ' + esc(gs.length ? gs.map((n) => 'chain of ' + n + ' completed' + (r.cooperative.goals[n].done > 1 ? ' ×' + r.cooperative.goals[n].done : '')).join(', ') : 'no chain completed yet') + esc(' · longest ' + r.cooperative.best + ' words') + '</p>';
    }
    if (r && (r.customSummary.played || r.customSummary.coop)) {
      const cs = r.customSummary;
      h += '<p class="wp-row"><b>From my journey:</b> ' + esc((cs.played ? cs.played + ' game' + (cs.played === 1 ? '' : 's') + (RB.game.settings && RB.game.settings.hideTotals ? '' : ' (' + cs.won + ' won, ' + cs.lost + ' lost)') : '') + (cs.coop ? (cs.played ? '; ' : '') + cs.coop + ' chain' + (cs.coop === 1 ? '' : 's') + ' completed' : '') + ' · custom banks, not stages') + '</p>';
    }
    if (r && r.totals.played && !(RB.game.settings && RB.game.settings.hideTotals)) {
      h += '<p class="wp-row muted small">' + esc('Fixed-bank games: ' + r.totals.played + ' (' + r.totals.won + ' won, ' + r.totals.lost + ' lost). Settings › Ways to practise can hide these totals.') + '</p>';
    }
    return h + '</section>';
  }
  if (RB.ui.companyPages && RB.ui.companyPages.addSection) {
    RB.ui.companyPages.addSection({
      id: 'wordplay', order: 60,
      html: (s, comp, V) => (comp && comp === s.comp ? card(s, comp, V) : ''),
      click: async (b, s, api) => {
        const act = b.dataset.wpAct;
        if (act === 'play' || act === 'resume') { await U.launch({ source: 'company', resume: act === 'resume' }); return; }
        if (act === 'end') {
          const c = await RB.ui.confirm('End the waiting match without a result? Its chain is kept in Review a saved chain. No win or loss is recorded.', ['End it', 'Keep it']);
          if (c === 0) { WP().abandon(s, 'abandoned'); await U.saveNow(s); api.render(); }
          return;
        }
        if (act === 'rules') { await U.rulesSheet(); return; }
        if (act === 'review') { await U.records(s); api.render(); return; }
        if (act === 'receipt') { await U.records(s, b.dataset.id); api.render(); return; }
        if (act === 'reflect') {
          const sc = U.reflectionScene(s);
          if (sc && RB.content.scenes[sc]) await RB.ui.companyPages.converse(api, () => RB.script.run(sc));
        }
      },
    });
  }
  U.card = card;

  // ---- Review a saved chain: a sheet over the folio (reading records needs no rest stop) -------------------------------
  U.records = function (s, openId) {
    return new Promise((res) => {
      const fr = RB.ui.folio.frame({ cls: 'wp-folio wp-sheet', onClose: () => V.onClose && V.onClose(), closeLabel: 'Close' });
      fr.setTitle(lab('review'), '');
      fr.box.innerHTML = '<div class="leaf wp-leaf" tabindex="-1"></div>';
      const layer = { el: fr.scrim, name: 'wordplay-records', noAutofocus: true, onCancel: () => V.onClose && V.onClose() };
      const V = { s, dead: false, session: { alive: () => !V.dead && RB.game.s === s }, leaf: fr.box.firstChild, timers: [], born: 0, lastDown: -1 };
      fr.scrim.addEventListener('pointerdown', () => { V.lastDown = performance.now(); }, true);
      fr.scrim.addEventListener('click', (e) => { if (e.detail > 0 && V.lastDown < V.born) { e.stopPropagation(); e.preventDefault(); } }, true);
      RB.ui.pushLayer(layer);
      const close = () => { if (V.dead) return; V.dead = true; RB.ui.popLayer(layer); res(); };
      (async () => {
        let first = openId || null;
        while (!V.dead) {
          const list = WP().transcripts(s, s.comp);
          const t = first ? list.find((x) => x.id === first) : null;
          first = null;
          if (t) { await U.reviewView(V, t, { back: 'Back to the list' }); continue; }
          const WHY = { pinned: 'pinned', 'first-clear': 'first stage clear', recent: '' };
          const h = '<section class="wp-records"><h3 tabindex="-1">' + lab('review') + '</h3>' + (list.length ? '<ul class="entries wp-trlist">' + list.map((x) => {
            const res = x.result || {};
            const what = x.format === 'cooperative' ? (res.reason === 'cooperative-goal' ? 'Chain complete' : 'Chain ended') : res.winner === 'pc' ? 'You won' : res.winner === 'cpu' ? (chr(x.comp) ? chr(x.comp).name.en : '') + ' won' : 'No result';
            return '<li class="entry"><button class="pbtn wp-tr" data-wp-tr="' + esc(x.id) + '"><span class="t">' + esc(what) + '</span> <span class="muted small">' + esc((WP().BAND[x.band] ? WP().BAND[x.band].en : x.band) + ' · ' + (WP().LEVEL[x.level] ? WP().LEVEL[x.level].en : x.level) + ' · ' + (res.cmoves || 0) + ' words · ' + dateOf(x.t1)) + '</span>' +
              (WHY[x.why] ? ' <span class="wp-mark small">' + esc(WHY[x.why]) + '</span>' : '') + '</button></li>';
          }).join('') + '</ul><p class="muted small">The last 20 chains, every first stage clear, and up to five you pin.</p>' : '<p class="muted">No matches recorded.</p>') +
            '<div class="row-acts"><button class="pbtn primary" data-wp="close" data-autofocus>' + I('back') + 'Close</button></div></section>';
          const r = await U.show(V, h, (el, done) => el.addEventListener('click', (e) => {
            const b = e.target.closest('[data-wp-tr]');
            if (b) { done({ act: 'open', id: b.dataset.wpTr }); return; }
            if (e.target.closest('[data-wp=close]')) done({ act: 'close' });
          }), { closeAct: 'close' });
          if (r.act === 'open') { first = r.id; continue; }
          break;
        }
        close();
      })();
    });
  };

  // ---- a memory's link to its record (Company › Shared memories) -------------------------------------------------------
  if (RB.ui.companyPages && RB.ui.companyPages.addRef) {
    RB.ui.companyPages.addRef('wordplay', {
      html: (m) => (m.ref && m.ref.session && RB.game && RB.game.s && WP().findTranscript(RB.game.s, m.ref.session, m.comp) ? '<button class="pbtn quiet" data-co-ref="wordplay" data-id="' + esc(m.ref.session) + '">' + I('history') + 'See the chain</button>' : ''),
      click: async (b, s, api) => { await U.records(s, b.dataset.id); api.render(); },
    });
  }
})(RB.ui.wordplay);
