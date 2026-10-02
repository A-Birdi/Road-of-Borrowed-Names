/* Companion shiritori: the table (Practice addendum §9–§14, §20). One activity
 * session (RB.activity, 'shiritori') holds the preparation sheet, the table, the
 * result and the look back; the rules of record are RB.wordplay (73_wordplay.js),
 * the house rules and opponents RB.shiritori (71/72).
 *
 * The table always shows the required kana, the chain with readings, meanings and
 * furigana, the used words and whose turn it is. Words go in by handwriting (the
 * shared pad; it never sees a target — in shiritori there is none), by Japanese
 * IME (Enter during composition only finishes the composition), or by choosing
 * from the bank (Open-book: the whole legal bank, searchable by kana; Recall:
 * hidden until Find a word, which marks the game for good). A recognizer
 * candidate is never a move: Play word is. An invalid draft is explained and the
 * turn kept. No clock: the companion's short thinking gesture can be skipped.
 * Other views (rules, the bank, look back, the primer) are in 87_wordplay_views.js;
 * Company, Ways to practise and the rest menu in 87_wordplay_links.js. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.ui = RB.ui || {};
RB.ui.wordplay = RB.ui.wordplay || {};

(function (U) {
  'use strict';
  const esc = RB.util.esc;
  const WP = () => RB.wordplay;
  const SH = () => RB.shiritori;
  const LB = () => (RB.content.wordplay && RB.content.wordplay.labels) || {};
  const lab = (k, en) => { const l = LB()[k]; return l ? RB.ui.label(l.jp, en || l.en) : esc(en || k); };
  const I = (n) => (RB.ui.folio ? RB.ui.folio.icon(n) : '');
  const J = (jp) => (jp ? RB.ui.jhtml(jp) : '');
  const chr = (id) => ((RB.content && RB.content.chars) || {})[id] || null;
  const who = (s) => (chr(s.comp) ? chr(s.comp).name.en : 'your companion');
  const tnow = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const ff = () => !!(RB.game && RB.game.fastForward && RB.game.fastForward());
  const reduce = () => !!(RB.game && RB.game.reducedMotion && RB.game.reducedMotion());
  const KANA = (k) => '<span class="wp-kana" lang="ja">' + esc(k) + '</span>';
  U.lab = lab; U.KANA = KANA; U.J = J;

  // ---- the activity ------------------------------------------------------------------------------------
  if (RB.activity && RB.activity.register) {
    RB.activity.register('shiritori', {
      title: { en: 'Shiritori', jp: 'しりとり' },
      eligible: (s, ctx) => WP().eligible(s, ctx),
      run: (session) => run(session),
      dispose: (session) => dispose(session),
    });
  }
  let CUR = null; // the mounted view (one session at a time)

  // ---- the frame ----------------------------------------------------------------------------------------
  function mount(session) {
    const s = RB.game.s;
    const V = { session, s, dead: false, resolve: null, timers: [], born: tnow(), lastDown: -1, pad: null };
    const fr = RB.ui.folio.frame({ cls: 'wp-folio', onClose: () => V.onClose && V.onClose(), closeLabel: 'Leave', closeIcon: 'back' });
    fr.box.innerHTML = '<div class="leaf wp-leaf" tabindex="-1"></div>';
    V.fr = fr;
    V.leaf = fr.box.firstChild;
    const place = RB.content.maps && RB.content.maps[s.map] && RB.content.maps[s.map].name;
    fr.setTitle(lab('title') + ' <span class="wp-with">' + esc('with ' + who(s)) + '</span>', place ? esc(place.en || '') : '');
    V.layer = { el: fr.scrim, name: 'wordplay', noAutofocus: true, onCancel: () => V.onClose && V.onClose() };
    // a press that began before the current view appeared never activates a control it created (§3.4)
    fr.scrim.addEventListener('pointerdown', () => { V.lastDown = tnow(); }, true);
    fr.scrim.addEventListener('click', (e) => { if (e.detail > 0 && V.lastDown < V.born) { e.stopPropagation(); e.preventDefault(); } }, true);
    RB.ui.pushLayer(V.layer);
    CUR = V;
    return V;
  }
  function dispose(session) {
    const V = CUR;
    if (!V || V.session !== session) return;
    V.dead = true;
    for (const t of V.timers) clearTimeout(t);
    if (V.pad) { try { V.pad.destroy(); } catch (e) { /* gone */ } V.pad = null; }
    if (V.layer) RB.ui.popLayer(V.layer);
    if (V.resolve) { const r = V.resolve; V.resolve = null; r({ act: 'dead' }); }
    CUR = null;
  }
  const alive = (V) => !V.dead && V.session.alive();
  function later(V, ms) { return new Promise((r) => { const t = setTimeout(r, ms); V.timers.push(t); }); }
  // one view at a time in the leaf; resolves with what the player chose
  // (each view gets a fresh container, so listeners of an earlier view can never act on a later one)
  function fresh(V) {
    V.leaf.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'wp-view';
    V.leaf.appendChild(box);
    V.leaf.scrollTop = 0;
    V.born = tnow();
    return box;
  }
  function show(V, html, wire, o) {
    return new Promise((res) => {
      if (!alive(V)) { res({ act: 'dead' }); return; }
      if (V.resolve) { const r = V.resolve; V.resolve = null; r({ act: 'replaced' }); }
      const done = (v) => { if (V.resolve === done) { V.resolve = null; res(v); } };
      V.resolve = done;
      const box = fresh(V);
      box.innerHTML = html;
      V.onClose = () => done({ act: (o && o.closeAct) || 'leave' });
      if (wire) wire(box, done);
      const f = box.querySelector('[data-autofocus]') || box.querySelector('h3[tabindex]');
      if (f) setTimeout(() => { if (!V.dead && f.isConnected) f.focus({ preventScroll: true }); }, 0);
    });
  }
  U.show = show; U.alive = alive; U.later = later; U.fresh = fresh;

  // ---- the session: prepare → (demo) → table → result → … ----------------------------------------------------
  async function run(session) {
    const V = mount(session);
    const s = V.s;
    const games = [];
    session.set('preparing');
    let next = session.ctx && session.ctx.resume && WP().ns(s).active ? 'resume' : 'prep';
    let setup = null;
    try {
      while (alive(V)) {
        if (next === 'prep') {
          session.set('preparing');
          const r = await prep(V);
          if (r.act === 'start') { setup = r.setup; next = 'start'; continue; }
          if (r.act === 'resume') { next = 'resume'; continue; }
          break;
        }
        if (next === 'start' || next === 'rematch') {
          const st = WP().start(s, setup, { ctx: session.ctx });
          if (!st.ok) { RB.ui.notice(st.why || 'That game could not start.', 'info'); next = 'prep'; continue; }
          next = 'table';
          continue;
        }
        if (next === 'resume') {
          const lv = WP().live(s);
          if (!lv.ok) {
            // an old match that can no longer be finished: kept as unfinished, no loss (§21.5)
            WP().abandon(s, 'incompatible-resume');
            await U.saveNow(s);
            await notice(V, 'This match can\'t be resumed', (lv.why || 'Its word bank or rules have changed.') + ' Its chain is kept, unfinished, in Review a saved chain. Nothing was counted as a loss.');
            next = 'prep';
            continue;
          }
          V.resumeDraft = WP().resumed(s);
          V.resumed = true;
          next = 'table';
          continue;
        }
        if (next === 'table') {
          session.set('active');
          const out = await table(V);
          if (out.act === 'result') {
            session.set('resolving');
            games.push({ session: out.result.session, winner: out.result.winner, reason: out.result.reason, stage: out.result.stage || null });
            session.set('result');
            const rr = await resultView(V, out.result);
            if (rr.act === 'rematch') { setup = setupOf(out.result); next = 'rematch'; continue; }
            if (rr.act === 'change') { next = 'prep'; continue; }
            break;
          }
          if (out.act === 'prep') { next = 'prep'; continue; }
          if (out.act === 'suspended') { session.set('suspended'); break; }
          if (out.act === 'abandoned') { session.set('abandoned'); break; }
          break;
        }
        break;
      }
    } finally {
      if (CUR === V && !V.dead) dispose(session);
    }
    return { games, suspended: !!WP().ns(s).active };
  }
  // a rematch keeps the finished game's setup (support as currently selected)
  const setupOf = (r) => ({ format: r.format, band: r.band, level: r.level, goal: r.goal || 12 });

  async function notice(V, title, text) {
    await show(V, '<section class="wp-note"><h3 tabindex="-1">' + esc(title) + '</h3><p>' + esc(text) + '</p><div class="row-acts"><button class="pbtn primary" data-wp="ok" data-autofocus>' + lab('back', 'Continue') + '</button></div></section>',
      (el, done) => { el.querySelector('[data-wp=ok]').onclick = () => done({ act: 'ok' }); }, { closeAct: 'ok' });
  }

  // ---- the preparation sheet (§9.2, §20.3) ------------------------------------------------------------------------
  const BAND_NOTE = { pocket: 'common concrete nouns', everyday: 'a broader everyday set, Pocket included', extended: 'broader still, Everyday included', journey: 'only words you have met on the road' };
  const LEVEL_NOTE = { casual: 'varied legal moves, no deep planning', thoughtful: 'looks ahead through your reply', sharp: 'searches deeper, keeps its escapes, uses real traps' };
  function radio(name, value, cur, html, o) {
    o = o || {};
    return '<label class="wp-opt' + (o.disabled ? ' off' : '') + '"><input type="radio" name="' + name + '" value="' + esc(value) + '"' + (String(cur) === String(value) ? ' checked' : '') + (o.disabled ? ' disabled' : '') + '><span>' + html + '</span></label>';
  }
  function face(canvas, comp, expr) {
    try { if (canvas && RB.portraits) RB.portraits.draw(canvas, comp, expr || 'neutral'); } catch (e) { /* no art */ }
  }
  U.face = face;
  async function prep(V) {
    const s = V.s;
    const r0 = WP().rec(s);
    const firstOpen = !r0.firsts.invited;
    r0.firsts.invited = r0.firsts.invited || 1;
    for (;;) {
      if (!alive(V)) return { act: 'dead' };
      const st = RB.practice.settings(s);
      const setup = WP().normSetup(s, {});
      const banks = WP().installed();
      const active = WP().ns(s).active;
      const jb = setup.band === 'journey' ? WP().bankFor(s, setup) : null;
      const prov = /^provisional/.test(WP().strategyVersion());
      const line = firstOpen ? WP().line(s, 'invite', 'invite') : null;
      const g = (RB.content.wordplay.gestures || {})[s.comp] || {};
      let h = '<section class="wp-prep"><div class="wp-head"><canvas class="wp-face" width="96" height="96" role="img" aria-label="' + esc(who(s)) + '"></canvas><div>' +
        '<h3 tabindex="-1">' + lab('title') + ' <span class="en">' + esc('with ' + who(s)) + '</span></h3>' +
        (line ? '<div class="wp-say"><span class="jp">' + J(line.jp) + '</span><span class="en">' + esc(line.en) + '</span></div>' : '<p class="muted">' + esc(g.seat || '') + '</p>') +
        '<p class="muted small">Optional, untimed, and never needed for the story. Choose any setup; nothing is locked and the computer never changes level by itself.</p></div></div>';
      if (active) {
        const n = SH().moves(active.st);
        h += '<div class="wp-waiting" role="note">' + I('history') + '<div><b>A match is waiting.</b> ' + esc(WP().BAND[active.band].en + ' · ' + WP().LEVEL[active.level].en + ' · ' + n + ' word' + (n === 1 ? '' : 's') + ' played') + '<div class="row-acts">' +
          '<button class="pbtn primary" data-wp="resume" data-autofocus>' + I('next') + lab('resume') + '</button><button class="pbtn" data-wp="end">' + lab('endMatch') + '</button></div>' +
          '<p class="muted small">Only one match is kept at a time. Ending it records no win or loss.</p></div></div>';
      }
      if (!banks.length) {
        h += '<div class="wp-nobank" role="note">' + I('words') + '<div><b>The shiritori word banks are not installed in this copy of the game.</b> Nothing can be played yet. The rules can still be read.</div></div>';
      }
      h += '<fieldset class="wp-field"><legend>' + lab('format') + '</legend>' +
        radio('format', 'competitive', setup.format, lab('competitive') + '<span class="muted small"> a real win or loss; fixed banks fill the stage records</span>') +
        radio('format', 'cooperative', setup.format, lab('cooperative') + '<span class="muted small"> a shared chain; ' + esc(who(s)) + ' avoids dead ends when a reply exists</span>') + '</fieldset>';
      h += '<fieldset class="wp-field"><legend>' + lab('words') + '</legend>' + ['pocket', 'everyday', 'extended', 'journey'].map((b) => {
        const bk = b === 'journey' ? null : SH().bank(b);
        const size = bk ? ' <span class="muted small">' + bk.groupCount + ' words</span>' : b !== 'journey' ? ' <span class="muted small">not installed</span>' : '';
        return radio('band', b, setup.band, esc(WP().BAND[b].en) + size + '<span class="muted small"> — ' + esc(BAND_NOTE[b]) + (b === 'journey' ? ' (free play: a custom record, never a stage)' : '') + '</span>', { disabled: b !== 'journey' ? !bk : !banks.length });
      }).join('') + '</fieldset>';
      if (jb) {
        h += '<div class="wp-journey" role="note">' + (jb.ok
          ? '<p>' + esc(jb.size + ' word' + (jb.size === 1 ? '' : 's') + ' you have met on the road are in the banks (frozen when the game starts).') + '</p>' +
            (jb.small ? '<p><b>Small bank; some chains may end quickly.</b> ' + esc(jb.size < WP().LIMITS.smallBank ? 'With fewer than ' + WP().LIMITS.smallBank + ' words, ' : 'With no certified opening, ') + 'Learning partner or a fixed bank will play better. You can still play it.</p>' : '')
          : '<p>' + esc(jb.why) + '</p>') +
          (banks.length ? '<button class="pbtn" data-wp="primer">' + I('words') + lab('primer') + '</button>' : '') + '</div>';
      }
      if (setup.format === 'competitive') {
        h += '<fieldset class="wp-field"><legend>' + lab('opponent') + '</legend>' + WP().LEVELS.map((l) => radio('level', l, setup.level, esc(WP().LEVEL[l].en) + '<span class="muted small"> — ' + esc(LEVEL_NOTE[l]) + '</span>')).join('') +
          '<p class="muted small">The same level plays the same way for every companion. Word breadth and opponent strength are separate choices.</p>' +
          (prov ? '<p class="wp-prov small">' + I('note') + 'In this build the opponents are provisional: every level currently plays the Casual policy. Records name the version that played.</p>' : '') + '</fieldset>';
      } else {
        h += '<fieldset class="wp-field"><legend>' + lab('chain') + '</legend>' + WP().GOALS.map((n) => radio('goal', n, setup.goal, n + ' words together')).join('') + '</fieldset>';
      }
      h += '<fieldset class="wp-field"><legend>' + lab('support') + '</legend>' +
        radio('support', 'open', setup.support, lab('open') + '<span class="muted small"> — the whole bank is on the table, searchable by kana</span>') +
        radio('support', 'recall', setup.support, lab('recall') + '<span class="muted small"> — no word suggestions unless you ask (Find a word); asking is recorded, never penalised</span>') + '</fieldset>';
      const canStart = !active && (setup.band === 'journey' ? !!(jb && jb.ok) : !!SH().bank(setup.band));
      h += '<div class="row-acts wp-prep-acts"><button class="pbtn primary" data-wp="start"' + (canStart ? (active ? '' : ' data-autofocus') : ' disabled') + '>' + I('practice') + lab('start') + '</button>' +
        '<button class="pbtn" data-wp="rules">' + I('note') + lab('rules') + '</button>' +
        '<button class="pbtn" data-wp="browse"' + (banks.length ? '' : ' disabled') + '>' + I('list') + lab('browse') + '</button>' +
        '<button class="pbtn quiet" data-wp="leave">' + I('back') + lab('leave') + '</button></div></section>';
      const r = await show(V, h, (el, done) => {
        face(el.querySelector('.wp-face'), s.comp, line ? line.expr || 'smile' : 'neutral');
        el.addEventListener('change', (e) => {
          const t = e.target;
          if (!t || t.type !== 'radio') return;
          const key = { format: 'shiritoriFormat', band: 'shiritoriBand', level: 'shiritoriLevel', support: 'shiritoriSupport', goal: 'shiritoriChain' }[t.name];
          if (!key) return;
          RB.practice.set(s, key, t.name === 'goal' ? +t.value : t.value);
          done({ act: 'refresh', focus: t.name + '=' + t.value });
        });
        el.addEventListener('click', (e) => {
          const b = e.target.closest('[data-wp]');
          if (!b || b.disabled) return;
          done({ act: b.dataset.wp });
        });
      });
      if (r.act === 'refresh') { refocus(V, r.focus); continue; }
      if (r.act === 'rules') { await U.rulesView(V); continue; }
      if (r.act === 'browse') { await U.bankView(V, setup); continue; }
      if (r.act === 'primer') { await U.primerView(V); continue; }
      if (r.act === 'end') {
        const c = await RB.ui.confirm('End this match without a result? Its chain is kept in Review a saved chain. No win or loss is recorded.', ['End it', 'Keep it']);
        if (c === 0) { WP().abandon(s, 'abandoned'); await U.saveNow(s); }
        continue;
      }
      if (r.act === 'resume') return { act: 'resume' };
      if (r.act === 'start') {
        if (!st.demoSeen) {
          RB.practice.set(s, 'demoSeen', true);
          const d = await show(V, '<section class="wp-demo-offer"><h3 tabindex="-1">' + lab('rules') + '</h3><p>' + esc('Before the first game, ' + who(s) + ' can show how a few turns go — about a minute. You can read the rules any time from the table.') + '</p>' +
            '<div class="row-acts"><button class="pbtn primary" data-wp="demo" data-autofocus>' + lab('demo') + '</button><button class="pbtn" data-wp="skip">' + lab('skipDemo') + '</button></div></section>',
          (el, done) => el.addEventListener('click', (e) => { const b = e.target.closest('[data-wp]'); if (b) done({ act: b.dataset.wp }); }), { closeAct: 'skip' });
          if (d.act === 'dead') return d;
          if (d.act === 'demo') await U.demoView(V, setup);
        }
        return { act: 'start', setup };
      }
      return { act: r.act === 'dead' ? 'dead' : 'leave' };
    }
  }
  function refocus(V, key) {
    setTimeout(() => {
      if (V.dead || !key) return;
      const [n, v] = key.split('=');
      const el = V.leaf.querySelector('input[name="' + n + '"][value="' + v + '"]');
      if (el) el.focus({ preventScroll: false });
    }, 0);
  }

  // ---- the table (§13.1, §10.4, §26.3) ----------------------------------------------------------------------------------
  const MODE_LABEL = { hand: 'written', ime: 'typed', select: 'chosen from the bank' };
  function table(V) {
    const s = V.s;
    return new Promise((resolveTable) => {
      let finished = false;
      const T = { tab: null, dtext: '', dmode: null, pick: {}, repaired: false, busy: false, warn: false, stuck: false, filter: null, analysis: null, skip: null, line: null };
      const L0 = WP().live(s);
      if (!L0.ok) { resolveTable({ act: 'prep' }); return; }
      const a = L0.active, bank = L0.bank;
      const end = (v) => { if (finished) return; finished = true; resolveTable(v); };
      const g = (RB.content.wordplay.gestures || {})[s.comp] || {};
      const prefTab = (RB.game.settings && RB.game.settings.input) || 'hand';
      T.tab = a.support === 'open' && prefTab === 'choice' ? 'select' : prefTab === 'ime' ? 'ime' : 'hand';
      const petId = RB.pets && RB.pets.visible && RB.pets.visible(s, 'world') ? RB.pets.active(s) : null;
      const html = '<div class="wp-table" data-format="' + a.format + '">' +
        '<section class="wp-scene" aria-label="The table">' +
          '<figure class="wp-seat wp-cpu" data-motion="' + esc(g.motion || '') + '"><canvas class="wp-face" width="96" height="96" role="img" aria-label="' + esc(who(s)) + '"></canvas><figcaption>' + esc(who(s)) + '</figcaption></figure>' +
          '<div class="wp-board" aria-hidden="true"><div class="wp-slips"></div></div>' +
          '<figure class="wp-seat wp-pc"><canvas class="wp-face-pc" width="96" height="96" role="img" aria-label="You"></canvas><figcaption>' + esc(s.player.name) + '</figcaption></figure>' +
          (petId ? '<canvas class="wp-pet" width="64" height="64" role="img" aria-label="' + esc('Your ' + ((RB.pets.species(petId) || {}).label || { en: 'pet' }).en.toLowerCase() + ', resting beside the table') + '"></canvas>' : '') +
          '<div class="wp-say" aria-live="polite"></div><p class="wp-gesture muted small"></p>' +
        '</section>' +
        '<section class="wp-status" aria-label="Whose turn"><div class="wp-turn" aria-live="polite"></div><div class="wp-req"></div><div class="wp-count muted small"></div>' +
          '<button class="pbtn quiet wp-skip" data-wp="skip" hidden>' + lab('skip') + '</button><div class="wp-restslip" hidden></div></section>' +
        '<section class="wp-chainbox" aria-label="The chain"><h4>' + I('list') + 'The chain <span class="muted small wp-used"></span></h4><ol class="wp-chain"></ol></section>' +
        '<section class="wp-entry" aria-label="Your word">' +
          '<div class="wp-tabs" role="group" aria-label="How to enter your word">' +
            '<button class="pbtn wp-tab" data-wp-tab="hand" aria-pressed="false">' + I('practice') + lab('write') + '</button>' +
            '<button class="pbtn wp-tab" data-wp-tab="ime" aria-pressed="false">' + I('keyboard') + lab('type') + '</button>' +
            '<button class="pbtn wp-tab" data-wp-tab="select" aria-pressed="false">' + I('list') + lab('choose') + '</button></div>' +
          '<div class="wp-pane" data-pane="hand" hidden></div>' +
          '<div class="wp-pane" data-pane="ime" hidden><label class="ime-lab" for="wp-ime">Type a word in Japanese (kana or kanji)</label>' +
            '<input id="wp-ime" type="text" lang="ja" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done">' +
            '<p class="muted small">Enter plays the word once the composition is finished; Enter while composing only finishes it.</p></div>' +
          '<div class="wp-pane" data-pane="select" hidden></div>' +
          '<div class="wp-draft"><div class="wp-dline"></div><div class="wp-dmsg" role="status" aria-live="polite"></div><div class="wp-dpick"></div>' +
            '<div class="row-acts wp-dacts"><button class="pbtn" data-wp="notwrote" hidden>' + I('unsure') + lab('notWrote') + '</button>' +
            '<button class="pbtn quiet" data-wp="clear">' + I('erase') + lab('clear') + '</button>' +
            '<button class="pbtn primary" data-wp="play">' + I('seal') + lab('playWord') + '</button></div>' +
            '<div class="wp-warn" role="alertdialog" aria-labelledby="wp-warn-t" hidden></div></div>' +
        '</section>' +
        '<section class="wp-help"><div class="row-acts"><button class="pbtn" data-wp="stuck" aria-expanded="false">' + I('help') + lab('stuck') + '</button>' +
          '<button class="pbtn quiet" data-wp="rules">' + I('note') + lab('rules') + '</button>' +
          '<button class="pbtn quiet" data-wp="leave">' + I('back') + 'Leave the table</button></div><div class="wp-stuckbox" hidden></div></section>' +
      '</div>';
      if (V.resolve) { const r = V.resolve; V.resolve = null; r({ act: 'replaced' }); }
      const root = fresh(V);
      root.innerHTML = html;
      const $ = (q) => root.querySelector(q);
      const faceCv = $('.wp-face'), pcCv = $('.wp-face-pc'), petCv = $('.wp-pet');
      face(faceCv, s.comp, 'neutral');
      try { if (pcCv && RB.portraits && RB.equip) RB.portraits.drawPlayer(pcCv, RB.equip.look(s), 'neutral'); } catch (e) { /* no art */ }
      try { if (petCv) RB.pets.thumb(petCv, petId, RB.pets.lookOf(s, petId), { sit: petId === 'bird' ? 0 : 1 }); } catch (e) { /* no art */ }
      V.onClose = () => leave();

      // ---- small renderers
      function setLine(l, cat) {
        const box = $('.wp-say');
        if (!l) { box.innerHTML = ''; return; }
        box.innerHTML = '<span class="who">' + esc(who(s)) + '</span><span class="jp">' + J(l.jp) + '</span><span class="en">' + esc(l.en) + '</span>';
        face(faceCv, s.comp, l.expr || (cat === 'thinking' ? 'think' : 'neutral'));
        if (l.gesture) $('.wp-gesture').textContent = l.gesture;
      }
      function gesture(text) { $('.wp-gesture').textContent = text || ''; }
      function motion(kind) {
        const seat = $('.wp-cpu');
        if (!seat || reduce() || ff()) return;
        seat.classList.remove('mv');
        void seat.offsetWidth;
        seat.classList.add('mv');
        V.timers.push(setTimeout(() => seat.classList.remove('mv'), 700));
      }
      function petReact(kind) {
        if (!petCv || reduce() || ff()) return;
        petCv.classList.remove('tilt', 'hop');
        void petCv.offsetWidth;
        petCv.classList.add(kind);
        V.timers.push(setTimeout(() => petCv.classList.remove(kind), 650));
      }
      function wordOf(id) { const e = bank.entryById[id]; return e ? e.display : { jp: id, en: '' }; }
      function renderStatus(mode) {
        const n = SH().moves(a.st);
        const coop = a.format === 'cooperative';
        $('.wp-turn').innerHTML = mode === 'thinking' ? esc(who(s) + ' is thinking…') : a.st.next === 'pc' ? '<b>' + lab('yourTurn') + '</b>' : esc(who(s) + '\'s turn');
        $('.wp-req').innerHTML = '<span class="lbl">Next word begins with</span> ' + KANA(a.st.required);
        $('.wp-count').textContent = (coop ? 'Chain: ' + n + ' of ' + a.goal : n + ' word' + (n === 1 ? '' : 's') + ' played') + ' · ' + WP().BAND[a.band].en + ' · ' + WP().LEVEL[a.level].en + ' · ' + (a.support === 'open' ? 'Open-book' : 'Recall' + (a.flags.suggested ? ' (suggestions used)' : ''));
        $('.wp-used').textContent = '(' + a.st.history.length + ' word' + (a.st.history.length === 1 ? '' : 's') + ' used, the starter included)';
        root.querySelector('.wp-table').setAttribute('data-turn', mode === 'thinking' ? 'cpu' : a.st.next);
      }
      function renderChain() {
        const ol = $('.wp-chain');
        ol.innerHTML = a.st.history.map((h, i) => {
          const w = wordOf(h.entry);
          const grp = bank.groups[h.group];
          const others = grp ? grp.entries.filter((x) => x !== h.entry).map((x) => wordOf(x)) : [];
          const by = h.actor === 'start' ? lab('starter') : h.actor === 'pc' ? lab('you') : esc(who(s));
          return '<li class="wp-slip' + (i === a.st.history.length - 1 ? ' last' : '') + '" data-actor="' + h.actor + '"><span class="by">' + by + '</span>' +
            '<span class="w">' + J(w.jp) + '</span><span class="r" lang="ja">' + esc(h.reading) + '</span><span class="m">' + esc(w.en) + '</span>' +
            (h.tail && h.tail !== 'ん' ? '<span class="t">→ ' + KANA(h.tail) + '</span>' : '<span class="t">' + KANA('ん') + '</span>') +
            (others.length ? '<span class="also small">also uses ' + others.map((o) => J(o.jp)).join(', ') + ' (the same reading)</span>' : '') + '</li>';
        }).join('');
        const last = ol.lastElementChild;
        if (last && last.scrollIntoView && !ff()) last.scrollIntoView({ block: 'nearest' });
        // the three latest slips on the little table
        $('.wp-slips').innerHTML = a.st.history.slice(-3).map((h) => '<span class="slip" data-actor="' + h.actor + '" lang="ja">' + esc(h.reading) + '</span>').join('');
      }
      // ---- input panes
      let pad = null, ime = null, composing = false;
      function ensurePad() {
        if (pad || !RB.pad) return;
        pad = RB.pad.create($('[data-pane=hand]'), {
          maxLen: 10, script: 'any',
          onChange: () => { if (T.tab === 'hand') setDraft(pad.text(), 'hand'); },
          onAssist: (why) => { if (why === 'correction' || why === 'chart') { T.repaired = true; WP().noteInputAssist(s); } },
        });
        V.pad = pad;
        const lb = pad.compose && pad.compose.querySelector('.pad-lab');
        if (lb) lb.textContent = 'Your word';
      }
      function ensureIme() {
        if (ime) return;
        ime = $('#wp-ime');
        ime.addEventListener('compositionstart', () => (composing = true));
        ime.addEventListener('compositionend', () => setTimeout(() => (composing = false), 0));
        ime.addEventListener('input', () => { if (T.tab === 'ime') setDraft(ime.value, 'ime'); });
        ime.addEventListener('keydown', (e) => {
          if (e.key !== 'Enter') return;
          if (composing || e.isComposing || e.keyCode === 229) return; // the IME is still composing: let it finish
          e.preventDefault();
          onPlay();
        });
      }
      function setTab(t) {
        T.tab = t;
        root.querySelectorAll('.wp-tab').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.wpTab === t)));
        root.querySelectorAll('.wp-pane').forEach((p) => (p.hidden = p.dataset.pane !== t));
        if (t === 'hand') { ensurePad(); requestAnimationFrame(() => pad && pad.layout()); }
        if (t === 'ime') { ensureIme(); if (!ime.value && T.dtext) ime.value = T.dtext; }
        if (t === 'select') renderBank();
        $('[data-wp=notwrote]').hidden = t !== 'hand';
      }
      // ---- the bank (selection input): the full legal bank, searchable by kana (§13.1, §25)
      function renderBank() {
        const p = $('[data-pane=select]');
        if (a.support === 'recall' && !a.flags.suggested) {
          p.innerHTML = '<div class="wp-locked"><p>' + esc('Recall: the word bank stays hidden unless you ask. Find a word shows all of it; this game will then be recorded as "in-game word suggestions used" — it still counts in full, and nothing is lost.') + '</p>' +
            '<button class="pbtn" data-wp="find">' + I('lens') + lab('find') + '</button></div>';
          return;
        }
        const f = T.filter == null ? a.st.required : T.filter;
        const key = SH().norm(f);
        const list = bank.entries.filter((e) => SH().readingsOf(e).some((r) => !key || r.indexOf(key) === 0))
          .sort((x, y) => SH().readingsOf(x)[0].localeCompare(SH().readingsOf(y)[0], 'ja') || (x.id < y.id ? -1 : 1));
        const open = list.filter((e) => bank.edges.some((x) => x.entry === e.id && !a.st.used[x.group] && x.head === key));
        p.innerHTML = '<div class="wp-pickhead"><label for="wp-filter">Words beginning with</label> <input id="wp-filter" class="wp-filter" lang="ja" maxlength="4" autocomplete="off" value="' + esc(f) + '">' +
          (f !== a.st.required ? '<button class="pbtn quiet" data-wp="filter-req">' + esc('Back to ') + KANA(a.st.required) + '</button>' : '') + '</div>' +
          '<p class="muted small wp-pickcount">' + esc(list.length + ' word' + (list.length === 1 ? '' : 's') + ' in this match\'s bank' + (key ? ' begin with ' + f : '') + (key ? '; ' + open.length + ' still unused' : '') + '. Sorted by reading; the whole bank is here.') + '</p>' +
          '<ul class="wp-bank">' + list.map((e) => {
            const used = bank.edges.some((x) => x.entry === e.id && a.st.used[x.group]);
            const term = SH().readingsOf(e).every((r) => SH().boundary(r).terminal);
            return '<li><button class="wp-word" data-wp-pick="' + esc(e.id) + '"' + (used ? ' aria-disabled="true"' : '') + '><span class="w">' + J(e.display.jp) + '</span><span class="r" lang="ja">' + esc(SH().readingsOf(e).join(' / ')) + '</span><span class="m">' + esc(e.display.en) + '</span>' +
              (used ? '<span class="tag">' + lab('used') + '</span>' : '') + (term ? '<span class="tag n">' + lab('endsN') + '</span>' : '') + '</button></li>';
          }).join('') + '</ul>';
        const inp = p.querySelector('#wp-filter');
        inp.addEventListener('input', () => { T.filter = inp.value; const pos = inp.selectionStart; renderBank(); const i2 = p.querySelector('#wp-filter'); i2.focus(); try { i2.setSelectionRange(pos, pos); } catch (e) { /* ok */ } });
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing) e.preventDefault(); });
      }
      // ---- the draft: what the input could be; never a move until Play word
      function setDraft(text, mode, o) {
        o = o || {};
        T.dtext = String(text || '');
        T.dmode = T.dtext ? mode : null;
        if (!o.keepPick) T.pick = {};
        T.warn = false;
        $('.wp-warn').hidden = true;
        renderDraft();
      }
      function renderDraft() {
        const d = T.analysis = WP().draft(s, T.dtext, T.pick);
        const line = $('.wp-dline'), msg = $('.wp-dmsg'), pick = $('.wp-dpick');
        line.innerHTML = '<span class="k">' + lab('playWord', 'Your word') + ':</span> ' + (T.dtext ? '<b class="w" lang="ja">' + esc(T.dtext) + '</b> <span class="how muted small">(' + esc(MODE_LABEL[T.dmode] || '') + ')</span>' : '<span class="muted">nothing yet</span>');
        pick.innerHTML = '';
        let m = '';
        const req = a.st.required;
        if (d.status === 'empty' || d.status === 'none') m = a.st.next === 'pc' ? 'Write, type or choose a word beginning with ' + req + '.' : '';
        else if (d.status === 'script') m = 'This table reads Japanese kana and kanji; that text isn\'t a word in this match\'s bank.';
        else if (d.status === 'outside') m = 'That word is outside this match\'s word bank. It may be perfectly good Japanese; this game only uses its own bank. Your turn is kept.';
        else if (d.status === 'needs-reading') {
          m = 'Which reading do you mean? Choose one of the approved readings.';
          pick.innerHTML = '<div class="wp-readings" role="group" aria-label="Approved readings">' + d.readings.map((r) => '<button class="pbtn" data-wp-reading="' + esc(r) + '" lang="ja">' + esc(r) + '</button>').join('') + '</div>';
        } else {
          const w = wordOf(d.entry);
          const desc = J(w.jp) + ' <span lang="ja">' + esc(d.reading) + '</span> · ' + esc(w.en);
          if (d.readings && d.readings.length > 1) pick.innerHTML += '<div class="wp-readings" role="group" aria-label="Approved readings">' + d.readings.map((r) => '<button class="pbtn" data-wp-reading="' + esc(r) + '" aria-pressed="' + (r === d.reading) + '" lang="ja">' + esc(r) + '</button>').join('') + '</div>';
          if (d.senses) pick.innerHTML += '<div class="wp-senses" role="group" aria-label="Which meaning (optional; one play either way)">' + d.senses.map((x) => '<button class="pbtn quiet" data-wp-sense="' + esc(x.entry) + '" aria-pressed="' + (d.sense === x.entry) + '">' + J(x.jp) + ' ' + esc(x.en) + '</button>').join('') + '<span class="muted small">Same reading, one play: choosing a meaning is optional.</span></div>';
          if (d.status === 'ok') m = desc + (d.terminal ? ' — ends in ん.' : ' — begins with ' + esc(req) + '. Play word when you are ready.');
          else if (d.status === 'wrong-head') m = desc + ' — ' + esc('this needs to begin with ' + req + '; it begins with ' + d.head + '. Your turn is kept.');
          else if (d.status === 'repeat') m = desc + ' — ' + esc('already played in this game (or a word with the same reading was). Your turn is kept.');
          else m = desc;
          msg.innerHTML = m;
          syncPlay();
          return;
        }
        msg.textContent = m;
        syncPlay();
      }
      function syncPlay() {
        const ok = !T.busy && a.st.next === 'pc' && !a.st.over && !!T.dtext;
        $('[data-wp=play]').disabled = !ok;
        $('[data-wp=clear]').disabled = !T.dtext && !(pad && pad.hasPending());
        $('[data-wp=stuck]').disabled = T.busy;
      }
      function clearDraft() {
        if (pad) pad.reset();
        if (ime) ime.value = '';
        T.repaired = false;
        setDraft('', null);
      }
      // ---- moves
      async function onPlay() {
        if (T.busy || finished || a.st.next !== 'pc' || a.st.over) return;
        if (T.tab === 'hand' && pad && pad.hasPending()) { $('.wp-dmsg').textContent = 'Confirm or clear the character you are writing first: a recognised character is not yet part of your word.'; return; }
        const d = T.analysis || WP().draft(s, T.dtext, T.pick);
        if (d.status !== 'ok') { renderDraft(); flash($('.wp-dmsg')); return; } // an invalid draft is explained; the turn is kept
        if (d.terminal && !T.warn) { openWarn(d); return; }
        commitPlayer(d);
      }
      function openWarn(d) {
        T.warn = true;
        const box = $('.wp-warn');
        const coop = a.format === 'cooperative';
        box.innerHTML = '<p id="wp-warn-t">' + I('unsure') + esc(coop ? 'This ends in ん, so playing it ends our chain here.' : 'This ends in ん, so playing it ends the game as your loss.') + '</p>' +
          '<div class="row-acts"><button class="pbtn primary" data-wp="edit">' + lab('edit') + '</button><button class="pbtn" data-wp="anyway">' + lab('playAnyway') + '</button></div>';
        box.hidden = false;
        setTimeout(() => { const b = box.querySelector('[data-wp=edit]'); if (b && !V.dead) b.focus({ preventScroll: false }); }, 0);
      }
      function commitPlayer(d) {
        $('.wp-warn').hidden = true;
        const r = WP().playWord(s, d.edge, { mode: T.dmode || 'ime', repaired: T.repaired, sense: d.sense });
        if (!r.ok) { renderDraft(); return; }
        const h = a.st.history[a.st.history.length - 1];
        clearDraft();
        renderChain();
        petReact('tilt');
        if (r.over) { renderStatus(); return end({ act: 'result', result: r.result }); }
        T.playerEscape = h.sr === 1;
        cpuTurn();
      }
      function flash(el) { if (!el || reduce()) return; el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
      // the companion's turn: the move is chosen and stored first, then shown (§12.3)
      async function cpuTurn() {
        T.busy = true;
        syncPlay();
        renderStatus('thinking');
        const think = WP().line(s, 'thinking', a.session + ':' + a.st.history.length);
        if (think && WP().mayComment(s, 'thinking')) { face(faceCv, s.comp, think.expr || 'think'); gesture(think.gesture || ''); }
        motion('think');
        const cm = await WP().cpuChoose(s);
        if (!alive(V) || finished) return;
        // a short, skippable gesture (0.4–0.8 s, the decorative stream): never a timer for you
        const deco = RB.practice.stream(s, 'shiritori:deco', a.session + ':' + a.st.history.length);
        const ms = ff() ? 0 : reduce() ? 400 : 400 + Math.round(deco() * 400);
        if (ms) {
          const sk = $('.wp-skip');
          sk.hidden = false;
          await new Promise((res) => { T.skip = res; V.timers.push(setTimeout(res, ms)); });
          T.skip = null;
          sk.hidden = true;
        }
        if (!alive(V) || finished) return;
        const was = new Set(Object.keys(WP().ns(s).encountered));
        const r = WP().cpuCommit(s);
        if (!r.ok) { T.busy = false; renderStatus(); syncPlay(); return; }
        renderChain();
        petReact('tilt');
        if (r.over) { renderStatus(); return end({ act: 'result', result: r.result }); }
        // one optional remark per four combined moves, never while you write (§14.4)
        const h = a.st.history[a.st.history.length - 1];
        const salt = a.session + ':' + a.st.history.length;
        let cat = null, facts = null;
        if (T.playerEscape) { cat = 'escape'; facts = { by: 'pc' }; }
        else if (cm && cm.sr === 1) { cat = 'escape'; facts = { by: 'cpu' }; }
        else if (r.edge && !was.has(r.edge.entry) && !encounteredBefore(r.edge.entry)) cat = 'newword';
        else cat = 'move';
        T.playerEscape = false;
        const l = WP().line(s, cat, salt, facts);
        if (l && WP().mayComment(s, cat)) setLine(l, cat);
        else { face(faceCv, s.comp, 'neutral'); gesture(g.write || ''); }
        T.busy = false;
        renderStatus();
        renderBankIfOpen();
        renderDraft();
        restPrompt();
        focusEntry();
      }
      const encounteredBefore = (id) => {
        const e = bank.entryById[id];
        if (!e) return true;
        const L = s.learn || {}, intro = L.intro || {}, items = L.items || {};
        return e.forms.concat(SH().readingsOf(e)).some((f) => intro['v:' + f] || items['v:' + f]);
      };
      function renderBankIfOpen() { if (T.tab === 'select') { T.filter = null; renderBank(); } }
      function focusEntry() {
        if (V.dead) return;
        const el = T.tab === 'ime' ? $('#wp-ime') : T.tab === 'select' ? $('#wp-filter') || $('[data-wp=find]') : $('.wp-turn');
        if (el && el.focus) { if (el === $('.wp-turn')) el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); }
      }
      // a low-key offer to rest after 24 combined words; nothing ends by itself (§10.5)
      function restPrompt() {
        if (a.flags.restPrompted || SH().moves(a.st) < WP().LIMITS.restPrompt) return;
        a.flags.restPrompted = true;
        const box = $('.wp-restslip');
        box.innerHTML = '<p>' + esc(SH().moves(a.st) + ' words so far. Keep going, or rest and pick this match up later?') + '</p><div class="row-acts"><button class="pbtn" data-wp="restkeep">' + lab('keepPlaying') + '</button><button class="pbtn quiet" data-wp="restlater">' + lab('restLater') + '</button></div>';
        box.hidden = false;
      }
      // ---- stuck: Find a word / Keep thinking / Concede (no timer; §10.5)
      function toggleStuck(open) {
        T.stuck = open == null ? !T.stuck : open;
        const box = $('.wp-stuckbox');
        $('[data-wp=stuck]').setAttribute('aria-expanded', String(T.stuck));
        if (!T.stuck) { box.hidden = true; return; }
        const coop = a.format === 'cooperative';
        box.innerHTML = '<p>' + esc(coop ? 'There is no timer. You can look through the bank, take your time, or end the chain here (that is not a loss).' : 'There is no timer. You can look through the bank, take your time, or concede (a loss; leaving without a result is under Leave the table).') + '</p>' +
          '<div class="row-acts"><button class="pbtn" data-wp="find">' + I('lens') + lab('find') + '</button><button class="pbtn" data-wp="keep">' + lab('keep') + '</button>' +
          (coop ? '<button class="pbtn quiet" data-wp="endchain">' + lab('endChain') + '</button>' : '<button class="pbtn quiet danger" data-wp="concede">' + lab('concede') + '</button>') + '</div>';
        box.hidden = false;
      }
      function find() {
        if (a.support === 'recall' && !a.flags.suggested) WP().noteSuggestion(s);
        else if (a.support === 'recall') WP().noteSuggestion(s);
        toggleStuck(false);
        T.filter = null;
        setTab('select');
        renderStatus();
        setTimeout(() => { const f = $('#wp-filter'); if (f && !V.dead) f.focus({ preventScroll: false }); }, 0);
      }
      async function leave() {
        if (finished) return;
        const c = await RB.ui.confirm('Leave the table? You can keep this match for later — resume it at a rest stop or from Company — or end it without a result. Neither counts as a loss.', [RB.content.wordplay.labels.keepLater.en, RB.content.wordplay.labels.endMatch.en, RB.content.wordplay.labels.keepPlaying.en]);
        if (!alive(V) || finished) return;
        if (c === 0) {
          WP().suspend(s, T.dtext ? { text: T.dtext, mode: T.dmode } : null);
          await U.saveNow(s);
          return end({ act: 'suspended' });
        }
        if (c === 1) {
          WP().abandon(s, 'abandoned');
          await U.saveNow(s);
          return end({ act: 'abandoned' });
        }
        focusEntry();
      }
      // ---- clicks and keys
      root.addEventListener('click', async (e) => {
        if (finished) return;
        const tb = e.target.closest('[data-wp-tab]');
        if (tb) { setTab(tb.dataset.wpTab); if (tb.dataset.wpTab === 'ime') setTimeout(() => ime && ime.focus(), 0); return; }
        const pk = e.target.closest('[data-wp-pick]');
        if (pk) {
          if (pk.getAttribute('aria-disabled') === 'true') { $('.wp-dmsg').textContent = 'That word has already been played in this game.'; return; }
          const en = bank.entryById[pk.dataset.wpPick];
          if (!en) return;
          T.pick = { entry: en.id };
          const rs = SH().readingsOf(en);
          if (rs.length === 1) T.pick.reading = rs[0];
          setDraft(rs.length === 1 ? rs[0] : en.forms[0], 'select', { keepPick: true });
          setTimeout(() => { const b = $('[data-wp=play]'); if (b && !b.disabled && !V.dead) b.focus({ preventScroll: true }); }, 0);
          return;
        }
        const rd = e.target.closest('[data-wp-reading]');
        if (rd) { T.pick.reading = rd.dataset.wpReading; renderDraft(); return; }
        const sn = e.target.closest('[data-wp-sense]');
        if (sn) { T.pick.entry = sn.dataset.wpSense; renderDraft(); return; }
        const b = e.target.closest('[data-wp]');
        if (!b || b.disabled) return;
        const act = b.dataset.wp;
        if (act === 'play') onPlay();
        else if (act === 'clear') clearDraft();
        else if (act === 'edit') { T.warn = false; $('.wp-warn').hidden = true; focusEntry(); }
        else if (act === 'anyway') { const d = T.analysis; if (d && d.status === 'ok' && d.terminal) commitPlayer(d); }
        else if (act === 'notwrote') notWrote();
        else if (act === 'stuck') toggleStuck();
        else if (act === 'keep') { toggleStuck(false); focusEntry(); }
        else if (act === 'find') find();
        else if (act === 'concede') {
          const c = await RB.ui.confirm('Concede this game? It counts as a loss. (Leave the table instead to stop without a result.)', ['Concede', 'Keep playing']);
          if (c === 0 && !finished) { const r = WP().concede(s); if (r) end({ act: 'result', result: r }); }
        } else if (act === 'endchain') {
          const r = WP().stopChain(s);
          if (r) end({ act: 'result', result: r });
        } else if (act === 'rules') { await U.rulesSheet(); }
        else if (act === 'leave') leave();
        else if (act === 'skip') { if (T.skip) T.skip(); }
        else if (act === 'filter-req') { T.filter = null; renderBank(); }
        else if (act === 'restkeep') { $('.wp-restslip').hidden = true; focusEntry(); }
        else if (act === 'restlater') { WP().suspend(s, T.dtext ? { text: T.dtext, mode: T.dmode } : null); await U.saveNow(s); end({ act: 'suspended' }); }
      });
      // clicking the scene while the companion thinks skips the gesture (never the move)
      $('.wp-scene').addEventListener('click', () => { if (T.skip) T.skip(); });
      // "That is not what I wrote" (§4.2): repair the recognition; it costs no turn and is input
      // assistance, never a word suggestion
      function notWrote() {
        if (!pad) return;
        T.repaired = true;
        WP().noteInputAssist(s);
        if (pad.hasPending()) {
          const ex = pad.el.querySelector('.pad-extra');
          pad.el.querySelectorAll('.cands .cand').forEach((c) => (c.hidden = false));
          $('.wp-dmsg').textContent = 'Pick what you wrote from the other readings beside the box, or clear it and write it again. Your turn is kept.';
          if (ex) pad.el.classList.add('more-open');
          return;
        }
        if (pad.text()) {
          pad.remove();
          setDraft(pad.text(), 'hand');
          $('.wp-dmsg').textContent = 'The last character is cleared: write it again (or switch to Type or Choose). Your turn is kept.';
          return;
        }
        $('.wp-dmsg').textContent = 'Nothing has been read yet. Write a character in the box first.';
      }

      // ---- begin (a resumed game finishes a stored companion move first)
      renderChain();
      renderStatus();
      setTab(T.tab);
      if (V.resumed) {
        V.resumed = false;
        const l = WP().line(s, 'resume', a.session + ':resume:' + (a.resumes || 0));
        setLine(l, 'resume');
      } else gesture(g.seat || '');
      // a draft kept when the match was set aside comes back as a draft, typed (never a move)
      if (V.resumeDraft && V.resumeDraft.text) {
        const d = V.resumeDraft;
        V.resumeDraft = null;
        setTab('ime');
        ime.value = d.text;
        setDraft(d.text, 'ime');
      }
      if (a.st.history.length === 1 && a.st.next === 'pc') $('.wp-dmsg').textContent = 'The starter is ' + bank.entryById[a.starter].display.en + ' (' + a.st.history[0].reading + '). You respond first: a word beginning with ' + a.st.required + '.';
      else if (a.st.history.length === 1) $('.wp-dmsg').textContent = 'The starter is ' + bank.entryById[a.starter].display.en + ' (' + a.st.history[0].reading + '). ' + who(s) + ' responds first.';
      syncPlay();
      if (a.st.next === 'cpu' || a.cpuMove) cpuTurn();
      else setTimeout(focusEntry, 0);
    });
  }

  // ---- the result (§13.4): nothing is executed automatically ---------------------------------------------------------
  async function resultView(V, result) {
    const s = V.s;
    // the record is committed; its persistence is known before anything is celebrated (§21.2)
    fresh(V).innerHTML = '<p class="muted wp-saving" role="status">Recording the result…</p>';
    const saved = await U.saveNow(s);
    if (!alive(V)) return { act: 'dead' };
    const coop = result.format === 'cooperative';
    const reasonText = U.reasonText(s, result);
    let title, cat, facts = null;
    if (coop) { title = result.reason === 'cooperative-goal' ? 'Chain complete' : 'The chain ends here'; cat = result.reason === 'cooperative-goal' ? 'coop' : 'stop'; }
    else if (result.winner === 'pc') { title = 'You won'; cat = 'win'; }
    else if (result.winner === 'cpu') { title = who(s) + ' won'; cat = result.reason === 'no-safe-reply' ? 'trap' : 'loss'; facts = { reason: result.reason }; }
    else { title = 'No result'; cat = 'stop'; }
    const l = WP().line(s, cat, result.session + ':end', facts);
    const fc = result.firstClear ? WP().line(s, 'firstclear', result.session) : null;
    const G = (RB.content.wordplay.gestures || {})[s.comp] || {};
    let h = '<section class="wp-result" data-cat="' + cat + '"><div class="wp-head"><canvas class="wp-face" width="96" height="96" role="img" aria-label="' + esc(who(s)) + '"></canvas><div>' +
      '<h3 tabindex="-1">' + esc(title) + '</h3><p class="wp-reason">' + reasonText + '</p>' +
      (l ? '<div class="wp-say"><span class="jp">' + J(l.jp) + '</span><span class="en">' + esc(l.en) + '</span></div>' : '') +
      '<p class="muted small">' + esc(G.end || '') + '</p></div></div>';
    if (result.stage) {
      h += '<div class="wp-stamp" role="note">' + I('seal') + '<div><b>' + esc((result.firstClear ? 'Stage won for the first time: ' : 'Stage won again: ') + WP().BAND[result.band].en + ' · ' + WP().LEVEL[result.level].en) + '</b>' +
        '<div class="small">Kept in Company › ' + esc(who(s)) + ' › Wordplay. ' + (result.noSuggestClear ? 'Also marked: no in-game word suggestions used.' : '') + '</div>' +
        (fc ? '<div class="wp-say"><span class="jp">' + J(fc.jp) + '</span><span class="en">' + esc(fc.en) + '</span></div>' : '') + '</div></div>';
    } else if (!coop && result.winner === 'pc' && result.band === 'journey') {
      h += '<p class="muted small">From my journey is free play: kept as a custom-bank result, not a stage.</p>';
    } else if (!coop && result.winner === 'pc' && !result.verified) {
      h += '<p class="muted small">This result could not be checked against its word bank, so no stage record was made.</p>';
    }
    if (result.bond && result.bond.together) {
      h += '<p class="wp-bond">' + I('companion') + esc(result.bond.together === 'raised' ? 'A first proper game together — kept in Shared memories. Your bond with ' + who(s) + ' grew a little.' : 'A shared moment recorded in Shared memories.') + '</p>';
      if (result.bond.reflection) h += '<p class="muted small">' + esc(who(s) + ' would like to talk about how you played, whenever you like: at a rest stop, or from Company.') + '</p>';
    }
    h += '<p class="muted small wp-saved">' + esc(saved.text) + '</p>';
    h += '<div class="row-acts wp-result-acts"><button class="pbtn primary" data-wp="rematch">' + I('next') + lab('rematch') + '</button>' +
      '<button class="pbtn" data-wp="change">' + I('settings') + lab('change') + '</button>' +
      '<button class="pbtn" data-wp="look">' + I('history') + lab('look') + '</button>' +
      '<button class="pbtn quiet" data-wp="leave">' + I('back') + lab('leave') + '</button></div></section>';
    for (;;) {
      const r = await show(V, h, (el, done) => {
        face(el.querySelector('.wp-face'), s.comp, l ? l.expr || 'smile' : 'neutral');
        el.addEventListener('click', (e) => { const b = e.target.closest('[data-wp]'); if (b && !b.disabled) done({ act: b.dataset.wp }); });
      });
      if (r.act === 'look') {
        const t = WP().findTranscript(s, result.session);
        if (t) await U.reviewView(V, t, { back: 'Back to the result' });
        continue;
      }
      return r;
    }
  }
  // truthful reasons (§10.5, §26.2): about this match's bank, never about Japanese
  U.reasonText = function (s, r) {
    const n = r.note || {};
    const name = who(s);
    const k = (x) => '<span lang="ja">' + esc(x) + '</span>';
    if (r.reason === 'no-safe-reply') {
      const used = (n.used || []).map((u) => k(u.r)).join(', ');
      const base = 'No playable continuation remained in this match\'s bank' + (n.head ? ' for ' + k(n.head) : '') + '.';
      return base + (used ? ' Its ' + k(n.head) + ' words had already been used: ' + used + '.' : '');
    }
    if (r.reason === 'terminal-n') return (n.actor === 'pc' || r.winner === 'cpu' ? 'Your word ' : name + '\'s word ') + (n.reading ? k(n.reading) + ' ' : '') + 'ends in ' + k('ん') + (r.format === 'cooperative' ? ', so the chain stopped there.' : ', which ends the game under the house rules.');
    if (r.reason === 'human-concession') return 'You conceded.' + (n.n ? ' ' + n.n + ' unused word' + (n.n === 1 ? '' : 's') + ' beginning with ' + k(n.head) + ' were still in the bank' + (n.examples && n.examples.length ? ', for example ' + n.examples.map((x) => k(x.r)).join(', ') : '') + '.' : '');
    if (r.reason === 'cooperative-goal') return 'Together you reached ' + r.cmoves + ' words, the length you aimed for.';
    if (r.reason === 'incompatible-resume') return 'The match could not be resumed; its chain is kept as unfinished.';
    if (r.stopped) return 'You ended the chain together after ' + r.cmoves + ' words. No loss is recorded.';
    return 'Ended without a result.';
  };

  // ---- persistence: the result is shown once its save is known (§21.2) -------------------------------------------------
  U.saveNow = async function (s) {
    let res = null;
    try { res = RB.save && RB.save.autosave ? await RB.save.autosave('auto') : null; } catch (e) { res = null; }
    const st = RB.save && RB.save.status ? RB.save.status() : {};
    if (res) return { ok: true, text: st.mode === 'session' ? 'Recorded for this session only: this browser is not keeping saves.' : 'Recorded and saved.' };
    if (st.slot == null) return { ok: false, text: 'Recorded in this journey; it has no save slot, so nothing was written to storage.' };
    if (st.readOnly) return { ok: false, text: 'Recorded in this journey; it is open read-only here, so nothing was written to storage.' };
    return { ok: false, text: 'Recorded in this journey, but the save did not complete' + (st.lastError ? ' (' + st.lastError + ')' : '') + '. Save from the folio to keep it.' };
  };
  U.who = who;
  U.run = run;
  U.current = () => CUR;
})(RB.ui.wordplay);
