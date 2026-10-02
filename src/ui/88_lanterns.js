/* Lantern tending on screen (Practice addendum §15; rules in
 * src/engine/77_lanterns.js). One sheet carries the whole session:
 *   preparation  Review familiar material / Focus on a topic / Introduce
 *                something new; three or six lamps (three by default); what
 *                the pool allows, said plainly (a short pool, a short session)
 *   each lamp    an authored step in the ordinary challenge runner (choose,
 *                type with an IME, or write), then the lamp lights; a mistake
 *                is explained and continued; help never dims a lamp
 *   the end      the lamps together, an optional list of what was reviewed,
 *                and the first session's one notebook note
 * Leave at any time: between lamps, or "Leave the lamps" inside a step.
 * Entered from the rack in the Lantern Hall (scene pa.lamps) or Words › Ways
 * to practise when standing in the Hall; never from anywhere else.
 *
 * RB.practiceA (shared with the writing desk): worldSafe(), afterScene(fn),
 * launch(kind, ctx), lampCanvas(state). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.practiceA = (function () {
  'use strict';
  // Safe to start an activity here and now: plain walking (the folio may be open over
  // it), no scene, no creature within six tiles. Unlike RB.company.safeHere this does
  // not need the companion beside you: the lamps and the desk are not conversations.
  function worldSafe() {
    const g = RB.game;
    if (!g || !g.s) return { ok: false, why: 'none' };
    const modes = ((g.G && g.G.modes) || []).filter((m) => m !== 'menu');
    if (modes[modes.length - 1] !== 'world') return { ok: false, why: 'busy' };
    if (RB.script && RB.script.isRunning && RB.script.isRunning()) return { ok: false, why: 'busy' };
    const W = RB.world && RB.world.W;
    if (W && W.player && (W.foes || []).some((f) => Math.abs(f.x - W.player.x) + Math.abs(f.y - W.player.y) <= 6)) return { ok: false, why: 'danger' };
    return { ok: true };
  }
  const whyText = (w) => (w === 'danger' ? 'Not with a creature close by.' : 'Not just now.');
  // A scene (the rack, the desk, the rest menu) offers the activity; it starts once
  // that scene has ended and the world has settled, never on top of it.
  function afterScene(fn) {
    if (!(RB.script && RB.script.isRunning && RB.script.isRunning())) { setTimeout(fn, 0); return; }
    const off = RB.bus.on('story:settled', () => { off(); setTimeout(fn, 30); });
  }
  async function launch(kind, ctx) {
    const r = await RB.activity.launch(kind, ctx);
    if (!r.ok && r.why && RB.ui && RB.ui.notice) RB.ui.notice(r.why, 'info');
    return r;
  }

  // ---- a small lamp, drawn in pixels (16×24), lit or waiting ---------------------------------
  function drawLamp(cv, lit) {
    cv.width = 16; cv.height = 24;
    const g = cv.getContext('2d');
    if (!g) return cv;
    g.imageSmoothingEnabled = false;
    const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
    g.clearRect(0, 0, 16, 24);
    R(7, 0, 2, 2, '#2a2226'); R(5, 2, 6, 1, '#2a2226');
    R(3, 3, 10, 2, '#3a2e2a'); R(4, 3, 8, 1, '#5a463a');
    if (lit) { R(3, 5, 10, 12, '#e28a34'); R(4, 6, 8, 10, '#ffbf5c'); R(5, 7, 6, 8, '#ffe196'); R(6, 9, 4, 4, '#fff8dc'); }
    else { R(3, 5, 10, 12, '#857a66'); R(4, 6, 8, 10, '#d6ccae'); R(5, 7, 6, 8, '#ebe3ca'); }
    R(3, 5, 1, 12, '#2a2226'); R(12, 5, 1, 12, '#2a2226'); R(4, 10, 8, 1, lit ? '#e28a34' : '#b3a78a');
    R(4, 17, 8, 2, '#3a2e2a'); R(5, 19, 6, 1, '#2a2226'); R(6, 20, 4, 1, '#5a463a');
    return cv;
  }
  function lampCanvas(lit) {
    const cv = document.createElement('canvas');
    cv.className = 'pa-lampart';
    cv.setAttribute('aria-hidden', 'true');
    return drawLamp(cv, lit);
  }
  return { worldSafe, whyText, afterScene, launch, drawLamp, lampCanvas };
})();

RB.ui.lanterns = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => RB.learnUi.icon(n);
  const J = (t) => (t ? RB.ui.jhtml(t) : '');
  const TX = () => RB.content.practiceA.lanterns;
  const L = () => RB.lanterns;
  let open = null; // the sheet while a session runs (disposed on a campaign change)
  let curStep = null; // the lamp's step on screen (browser tests read its answer)

  // ---- the sheet -----------------------------------------------------------------------------
  function sheet() {
    const t = TX().title;
    const fr = RB.learnUi.sheet({ cls: 'activity pa-lamps', title: J(t.jp) + ' ' + esc(t.en) });
    const lay = { el: fr.scrim, name: 'lanterns' };
    RB.learnUi.guardTaps(fr.leaf);
    let onCancel = null;
    lay.onCancel = () => { if (onCancel) onCancel(); };
    RB.ui.pushLayer(lay);
    const api = {
      fr, lay, leaf: fr.leaf, foot: fr.foot,
      cancel(fn) { onCancel = fn; },
      meta(m) { fr.setTitle(J(t.jp) + ' ' + esc(t.en), m || ''); },
      close() { if (lay.el.isConnected) RB.ui.popLayer(lay); open = null; },
      focus(sel) { setTimeout(() => { const b = fr.el.querySelector(sel); if (b && lay.el.isConnected) b.focus({ preventScroll: true }); }, 0); },
    };
    open = api;
    return api;
  }

  // the lamps in a row, each with a text equivalent (never colour alone)
  function row(lamps, now, glowing) {
    const ul = RB.ui.el('ol', 'pa-lamprow');
    ul.setAttribute('aria-label', 'Lamps');
    lamps.forEach((l, i) => {
      const li = RB.ui.el('li', 'pa-lamp' + (l.lit ? ' lit' : '') + (i === now ? ' now' : '') + (i === glowing ? ' glow-in' : ''));
      li.appendChild(RB.practiceA.lampCanvas(l.lit));
      const state = l.lit ? 'lit' : i === now ? 'next' : l.left ? 'not tended this time' : 'waiting';
      li.appendChild(RB.ui.el('span', 'pa-lamplab', '<span class="n">' + (i + 1) + '</span><span class="st">' + esc(state) + '</span>'));
      li.setAttribute('aria-label', 'Lamp ' + (i + 1) + ': ' + state);
      ul.appendChild(li);
    });
    return ul;
  }

  // ---- 1 · preparation -----------------------------------------------------------------------
  function prep(ui, s) {
    return new Promise((resolve) => {
      const last = L().state(s).last || {};
      const sel = { mode: last.mode || 'review', topic: last.topic || null, count: last.count || 3 };
      const tx = TX();
      function counts() {
        const tops = L().topics(s);
        if (sel.mode === 'topic' && !tops.some((t) => t.id === sel.topic)) sel.topic = tops[0] ? tops[0].id : null;
        return { tops, review: L().pool(s, { mode: 'review' }).length, fresh: L().pool(s, { mode: 'new' }).length };
      }
      function render() {
        const c = counts();
        const plan = L().plan(s, sel);
        ui.meta('Getting ready');
        const opt = (v, label, hint, n, dis) => '<label class="pa-mode' + (dis ? ' off' : '') + '"><input type="radio" name="pa-mode" value="' + v + '"' + (sel.mode === v ? ' checked' : '') + (dis ? ' disabled' : '') + '><span class="pa-mode-t">' + label + '</span><span class="pa-mode-h">' + esc(hint) + (n != null ? ' <b>' + n + ' ready</b>' : '') + '</span></label>';
        ui.leaf.innerHTML =
          '<div class="pa-intro"><div class="pa-introrow"></div>' +
            '<p>Small practice lamps wait on the rack, apart from the travelling lantern. Each lamp you tend is one short question about something you have already met on the road.</p>' +
            '<p class="muted small">Nothing here keeps a streak or a clock, and nothing is lost by stopping: leave whenever you like.</p></div>' +
          '<fieldset class="field pa-modes"><legend>What to practise</legend>' +
            opt('review', J(tx.modes.review.jp) + ' <span class="en">' + esc(tx.modes.review.en) + '</span>', 'Things you have met, in the order your review schedule suggests.', c.review, false) +
            opt('topic', J(tx.modes.topic.jp) + ' <span class="en">' + esc(tx.modes.topic.en) + '</span>', 'One kind of thing, or one place along the road.', null, !c.tops.length) +
            (sel.mode === 'topic' && c.tops.length ? '<div class="pa-topic"><label for="pa-topic">Topic</label><select id="pa-topic">' + c.tops.map((t) => '<option value="' + esc(t.id) + '"' + (t.id === sel.topic ? ' selected' : '') + '>' + esc(t.en + ' (' + t.n + ')') + '</option>').join('') + '</select></div>' : '') +
            opt('new', J(tx.modes.new.jp) + ' <span class="en">' + esc(tx.modes.new.en) + '</span>', 'A word you have not met yet: its card first, then its lamp (practice, since you have just seen it).', c.fresh, !c.fresh) +
          '</fieldset>' +
          '<fieldset class="field"><legend>How many lamps</legend><div class="opts">' +
            L().COUNTS.map((n) => '<label class="opt"><input type="radio" name="pa-count" value="' + n + '"' + (sel.count === n ? ' checked' : '') + '><span>' + n + ' lamps</span></label>').join('') +
          '</div><div class="hint">A suggestion, not a promise: you can stop after any lamp.</div></fieldset>' +
          '<p class="pa-pool" aria-live="polite">' + esc(poolText(sel, plan, c)) + '</p>';
        const deco = row([{ lit: true }, { lit: false }, { lit: false }], -1);
        deco.setAttribute('aria-hidden', 'true');
        ui.leaf.querySelector('.pa-introrow').appendChild(deco);
        ui.foot.innerHTML = '<button class="cbtn" data-pa="leave">' + I('back') + '<span>Leave</span></button><span class="spacer"></span>' +
          '<button class="cbtn go" data-pa="begin"' + (plan.items.length ? '' : ' disabled') + '>' + I('lantern') + '<span>' + (plan.items.length ? 'Tend ' + plan.items.length + ' lamp' + (plan.items.length > 1 ? 's' : '') : 'Nothing to tend') + '</span></button>';
      }
      ui.leaf.onchange = (e) => {
        const t = e.target;
        if (t.name === 'pa-mode') { sel.mode = t.value; render(); ui.focus('input[name=pa-mode][value="' + sel.mode + '"]'); }
        else if (t.name === 'pa-count') { sel.count = +t.value; render(); ui.focus('input[name=pa-count][value="' + sel.count + '"]'); }
        else if (t.id === 'pa-topic') { sel.topic = t.value; render(); ui.focus('#pa-topic'); }
      };
      ui.foot.onclick = (e) => {
        const b = e.target.closest('[data-pa]');
        if (!b || b.disabled) return;
        if (b.dataset.pa === 'leave') resolve(null);
        if (b.dataset.pa === 'begin') resolve(Object.assign({}, sel));
      };
      ui.cancel(() => resolve(null));
      render();
      ui.focus('[data-pa=begin]:not([disabled])');
    });
  }
  function poolText(sel, plan, c) {
    const n = plan.items.length;
    if (sel.mode === 'new') {
      if (!c.fresh) return 'Nothing new is waiting to be introduced here just now.';
      return n < sel.count ? 'Only ' + n + ' new word' + (n > 1 ? 's are' : ' is') + ' ready, so this session has ' + n + ' lamp' + (n > 1 ? 's' : '') + '.' : 'Each of the ' + n + ' lamps begins with a new word\'s card.';
    }
    if (!plan.pool) return sel.mode === 'topic' ? 'Nothing in this topic is ready yet.' : 'Nothing familiar is ready to review yet. Try Introduce something new, or come back after more of the road.';
    if (!n) return 'What you could review here is resting after recent mistakes. It comes back after a few more questions, wherever you answer them.';
    if (n < sel.count) return 'Only ' + n + ' familiar item' + (n > 1 ? 's are' : ' is') + ' ready, so this session has ' + n + ' lamp' + (n > 1 ? 's' : '') + ' rather than repeating any.';
    return plan.pool + ' familiar item' + (plan.pool > 1 ? 's are' : ' is') + ' ready. This session lights ' + n + ' lamps.';
  }

  // ---- 2 · the lamps -------------------------------------------------------------------------
  function between(ui, lamps, i, lastRes) {
    return new Promise((resolve) => {
      ui.meta('Lamp ' + (i + 1) + ' of ' + lamps.length + ' lit');
      ui.leaf.innerHTML = '';
      ui.leaf.appendChild(row(lamps, i + 1, i));
      const p = RB.ui.el('p', 'pa-litline', esc('Lamp ' + (i + 1) + ' is lit.') + (lastRes && lastRes.firstTry === false ? ' <span class="muted small">A slip along the way is part of tending; the light is the same.</span>' : ''));
      p.setAttribute('aria-live', 'polite');
      ui.leaf.appendChild(p);
      ui.foot.innerHTML = '<button class="cbtn" data-pa="stop">' + I('back') + '<span>Stop here</span></button><span class="spacer"></span>' +
        '<button class="cbtn go" data-pa="next">' + I('lantern') + '<span>Tend lamp ' + (i + 2) + '</span></button>';
      ui.foot.onclick = (e) => { const b = e.target.closest('[data-pa]'); if (b) resolve(b.dataset.pa === 'next'); };
      ui.cancel(() => resolve(false));
      ui.focus('[data-pa=next]');
      RB.audio && RB.audio.sfx('lantern', { vol: 0.35 });
    });
  }
  async function tendLamps(ui, s, session, ob, lamps, sel) {
    const reviewed = [];
    for (let i = 0; i < lamps.length; i++) {
      const l = lamps[i];
      ui.meta('Lamp ' + (i + 1) + ' of ' + lamps.length);
      ui.leaf.innerHTML = '';
      ui.leaf.appendChild(row(lamps, i));
      if (sel.mode === 'new') {
        const t = L().teachFor(l.id);
        if (t) await RB.challenge.teachCard(t);
        if (!session.alive()) return reviewed;
      }
      const step = L().stepFor(s, l.id, session.id * 31 + i);
      if (!step) { l.left = true; continue; }
      step.title = 'Tend a lamp (' + (i + 1) + ' of ' + lamps.length + ')';
      step.titleJp = '{灯|あか}り';
      const header = '<span class="pa-hdr">' + I('lantern') + esc('Lamp ' + (i + 1) + ' of ' + lamps.length) + '</span>';
      curStep = step;
      const res = await RB.challenge.runStep(step, { noRecord: true, ctxTag: 'lanterns', cancelLabel: 'Leave', header });
      curStep = null;
      if (!session.alive()) return reviewed;
      if (!res || res.cancelled) { for (let k = i; k < lamps.length; k++) lamps[k].left = true; break; }
      const r = L().tend(s, ob, 'lamp:' + session.id + ':' + i, l.id, step, res, { exposed: sel.mode === 'new' });
      l.lit = r.lit;
      reviewed.push({ id: l.id, label: L().labelOf(l.id, step), help: !!res.assisted, slip: res.firstTry === false, counted: r.counted });
      if (i < lamps.length - 1) {
        const go = await between(ui, lamps, i, res);
        if (!session.alive()) return reviewed;
        if (!go) { for (let k = i + 1; k < lamps.length; k++) lamps[k].left = true; break; }
      }
    }
    return reviewed;
  }

  // ---- 3 · the end ---------------------------------------------------------------------------
  function endView(ui, s, lamps, reviewed, fin, plan) {
    return new Promise((resolve) => {
      const lit = lamps.filter((l) => l.lit).length;
      const tx = TX();
      ui.meta(lit ? lit + ' lamp' + (lit > 1 ? 's' : '') + ' lit' : 'No lamps tended');
      ui.leaf.innerHTML = '';
      ui.leaf.appendChild(RB.ui.el('h3', 'pa-endh', J(tx.end.jp) + ' <span class="en">' + esc(lit ? tx.end.en : 'The lamps wait') + '</span>'));
      const lastLit = lamps.map((l) => l.lit).lastIndexOf(true);
      ui.leaf.appendChild(row(lamps, -1, lastLit));
      const left = lamps.length - lit;
      let h = '<p aria-live="polite">' + esc(lit ? 'You tended ' + lit + ' lamp' + (lit > 1 ? 's' : '') + '.' : 'You left before tending a lamp. That is fine.') +
        (left && lit ? ' ' + esc('The other ' + (left > 1 ? left + ' wait' : 'one waits') + ' as they are; they keep no schedule.') : '') + '</p>';
      if (plan && plan.short && lit === lamps.length) h += '<p class="muted small">Only ' + lamps.length + ' ' + (lamps.length > 1 ? 'were' : 'was') + ' ready, so this was a short session rather than a repeated one.</p>';
      if (fin && fin.firstNote) h += '<p class="pa-note">' + I('note') + ' A note about the practice lamps is in your notebook (Words › Lore &amp; histories).</p>';
      if (reviewed.length) {
        h += '<details class="pa-reviewed"><summary>What you reviewed (' + reviewed.length + ')</summary><ul class="entries">' +
          reviewed.map((r) => '<li class="entry"><span class="mark">' + I('lantern') + '</span><div><div class="t">' + (r.label.jp ? J(r.label.jp) + ' ' : '') + '<span class="en">' + esc(r.label.en || '') + '</span></div>' +
            ((r.help || r.slip) ? '<div class="muted small">' + esc([r.slip ? 'worked out after a second look' : '', r.help ? 'with help' : ''].filter(Boolean).join(', ')) + '</div>' : '') + '</div></li>').join('') +
          '</ul></details>';
      }
      const box = RB.ui.el('div', 'pa-end', h);
      ui.leaf.appendChild(box);
      ui.foot.innerHTML = '<button class="cbtn" data-pa="leave">' + I('back') + '<span>Leave the lamps</span></button><span class="spacer"></span>' +
        '<button class="cbtn go" data-pa="again">' + I('lantern') + '<span>Tend a few more</span></button>';
      ui.foot.onclick = (e) => { const b = e.target.closest('[data-pa]'); if (b) resolve(b.dataset.pa === 'again'); };
      ui.cancel(() => resolve(false));
      ui.focus('[data-pa=leave]');
      if (lit) RB.audio && RB.audio.sfx('lantern', { vol: 0.4 });
      if (fin && fin.firstNote) {
        const nd = RB.content.notes[L().NOTE];
        if (nd) RB.ui.toast({ kind: 'note', jp: nd.title.jp, en: nd.title.en });
      }
    });
  }

  // ---- the session ---------------------------------------------------------------------------
  async function run(session) {
    const s = RB.game.s;
    const ob = RB.practice.objectives(session);
    const ui = sheet();
    let total = 0;
    try {
      while (session.alive()) {
        session.set('preparing');
        const sel = await prep(ui, s);
        if (!sel || !session.alive()) break;
        L().remember(s, sel);
        const plan = L().plan(s, sel);
        if (!plan.items.length) continue;
        session.set('active');
        const lamps = plan.items.map((id) => ({ id, lit: false }));
        const reviewed = await tendLamps(ui, s, session, ob, lamps, sel);
        if (!session.alive()) break;
        session.set('resolving');
        const lit = lamps.filter((l) => l.lit).length;
        const fin = L().finish(s, lit);
        total += lit;
        session.set('result');
        if (lit && RB.save && RB.save.autosave && RB.save.current && RB.save.current().slot != null) RB.save.autosave('progress');
        const again = await endView(ui, s, lamps, reviewed, fin, plan);
        if (!again || !session.alive()) break;
      }
    } finally {
      ui.close();
    }
    return { lamps: total };
  }
  function dispose() {
    // a campaign change while the lamps are open: close a running step, then the sheet
    const leave = typeof document !== 'undefined' && document.querySelector('.chal [data-a=leave]');
    if (leave) leave.click();
    if (open) open.close();
  }

  // ---- registration: the activity, the rack's scene hook, Words › Ways to practise -------------
  function eligible(s) {
    if (!L().unlocked(s)) return { ok: false, why: 'The practice lamps are offered once Chapter 1 has ended.' };
    if (!L().here(s)) return { ok: false, why: 'The practice lamps are in the Lantern Hall in Reedwake.' };
    const w = RB.practiceA.worldSafe();
    return w.ok ? { ok: true } : { ok: false, why: RB.practiceA.whyText(w.why) };
  }
  RB.activity.register('lanterns', { title: { en: 'Tend a few lamps', jp: '{灯|あか}り の {手入|てい}れ' }, eligible, run, dispose });
  RB.hooks = RB.hooks || {};
  RB.hooks.pa_lamps = async () => {
    if (RB.test && RB.test.auto) { RB.test.log.push({ t: 'activity', kind: 'lanterns', skipped: 'auto' }); return; }
    RB.practiceA.afterScene(() => RB.practiceA.launch('lanterns', { source: 'world-prop' }));
  };
  RB.practice.addActivity({
    id: 'lanterns', en: 'Tend a few lamps', jp: '{灯|あか}り の {手入|てい}れ', icon: 'lantern', order: 30,
    where: { en: 'The practice lamps in the Lantern Hall, Reedwake', jp: '{葦|あし}ノ{瀬|せ} の {灯|あか}り{堂|どう}' },
    available: (s) => L().unlocked(s),
    here: (s) => L().here(s),
    note: (s) => (!L().unlocked(s) ? 'Offered once Chapter 1 has ended.' : L().here(s) ? '' : 'Offered at the rack of practice lamps in the Lantern Hall.'),
    begin: (ctx) => RB.practiceA.launch('lanterns', Object.assign({ source: 'words' }, ctx || {})),
  });

  return { run, prep, row, eligible, _open: () => open, _step: () => curStep };
})();
