/* Side activities with their own decisions and feedback:
 *  orders   — prepare a tray from what customers say (counts matter)
 *  letters  — deliver storm-smudged letters by reading their contents
 *  signpost — restore a signpost's arms by reading directions
 *  history  — reassemble an oral history, then record it
 * Lines can be tiered by learning profile: {F:{jp,en}, E:…, I:…, A:…}. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.content.activities = RB.content.activities || {};

RB.activities = (function () {
  'use strict';
  const esc = RB.util.esc;
  const LV = ['F', 'E', 'I', 'A'];

  function tier(o) {
    if (!o) return null;
    if (o.jp != null || o.en != null) return o;
    const p = RB.game.s.learn.profile;
    for (let i = LV.indexOf(p); i >= 0; i--) if (o[LV[i]]) return o[LV[i]];
    for (let i = LV.indexOf(p) + 1; i < 4; i++) if (o[LV[i]]) return o[LV[i]];
    return null;
  }
  // A full activity sheet: cloth frame, one paper page, "Stop for now" on the
  // cloth header, the main action on the cloth foot.
  function panel(title) {
    const I = (n) => RB.learnUi.icon(n);
    const fr = RB.learnUi.sheet({ cls: 'activity', title, headBtn: { html: I('back') + '<span>Stop for now</span>', attrs: { 'data-x': '' } } });
    const lay = { el: fr.scrim, name: 'activity' };
    RB.learnUi.guardTaps(fr.leaf);
    return { scrim: fr.scrim, pn: fr.el, lay, body: fr.leaf, foot: fr.foot, fr };
  }
  function showEnDefault() {
    return RB.game.s.learn.profile === 'F';
  }
  function trButton() {
    return '<button class="pbtn quiet tr" data-tr title="Show the English (counts as assisted)">' + RB.learnUi.icon('note') + '<span>Translate <span class="aside">(assisted)</span></span></button>';
  }
  function fbSet(el, kind, head, html) {
    el.className = 'fbwrap fb ' + kind;
    el.setAttribute('data-fb', kind);
    el.innerHTML = RB.learnUi.fbHead(kind, head) + '<div class="fb-b">' + html + '</div>';
    requestAnimationFrame(() => { if (el.isConnected && el.scrollIntoView) { const leaf = el.closest('.leaf'); if (leaf) { const lr = leaf.getBoundingClientRect(), r = el.getBoundingClientRect(); if (r.bottom > lr.bottom) leaf.scrollTop += r.bottom - lr.bottom + 12; } } });
  }
  const goBtn = (attr, label) => '<button class="cbtn go" ' + attr + ' data-ok><span>' + esc(label) + '</span>' + RB.learnUi.icon('next') + '</button>';

  // ---- orders ----------------------------------------------------------------------------
  function orders(a) {
    return new Promise((resolve) => {
      const P = panel(RB.ui.jhtml(a.title.jp) + ' ' + esc(a.title.en));
      const custs = a.customers.map((c) => Object.assign({}, c));
      let i = 0, tray = {}, showEn = showEnDefault(), assisted = false, mistakes = 0, firstTry = true;
      const results = [];
      function render() {
        const c = custs[i];
        const l = tier(c.line);
        const who = RB.content.chars[c.who];
        P.fr.setTitle(RB.ui.jhtml(a.title.jp) + ' ' + esc(a.title.en), 'Customer ' + (i + 1) + ' of ' + custs.length);
        const n = Object.keys(tray).reduce((t, k) => t + tray[k], 0);
        P.body.innerHTML =
          '<section class="act-say">' + (who ? '<canvas width="48" height="48" class="act-face" aria-hidden="true"></canvas>' : '') +
            '<div class="act-line"><div class="act-who">' + esc(who ? who.name.en : c.name || 'Customer') + '</div>' +
            '<div class="act-jp">' + RB.ui.jhtml(l.jp) + '</div>' + (showEn ? '<div class="act-en">' + esc(RB.script.enVars(l.en)) + '</div>' : trButton()) + '</div></section>' +
          '<h3>' + RB.learnUi.icon('tray') + '<span>The tray</span><span class="count">' + (n ? n + ' item' + (n > 1 ? 's' : '') : 'empty') + '</span></h3>' +
          '<div class="act-tray">' + (n ? Object.keys(tray).map((k) => { const m = a.menu.find((x) => x.id === k); return '<button class="tile placed" data-rm="' + k + '" aria-label="Take one ' + esc(m.en) + ' off the tray">' + RB.ui.jhtml(m.jp) + '<span class="qty">×' + tray[k] + '</span></button>'; }).join('') : '<span class="muted small">Tap the kitchen items below to add them; tap an item on the tray to take one off.</span>') + '</div>' +
          '<h3>' + RB.learnUi.icon('food') + '<span>The kitchen</span></h3>' +
          '<div class="act-menu">' + a.menu.map((m) => '<button class="tile" data-add="' + m.id + '">' + RB.ui.jhtml(m.jp) + (showEn || m.always ? '<span class="en">' + esc(m.en) + '</span>' : '') + '</button>').join('') + '</div>' +
          '<div class="fbwrap" aria-live="polite"></div>';
        P.foot.innerHTML = '<span class="spacer"></span>' + '<button class="cbtn go" data-serve data-ok>' + RB.learnUi.icon('done') + '<span>Serve</span></button>';
        const cv = P.body.querySelector('canvas');
        if (who && cv) RB.portraits.draw(cv, c.who, 'neutral');
      }
      P.pn.onclick = (e) => {
        if (e.target.closest('[data-x]')) { RB.ui.popLayer(P.lay); resolve({ ok: false, cancelled: true }); return; }
        if (e.target.closest('[data-tr]')) { showEn = true; assisted = true; render(); return; }
        const add = e.target.closest('[data-add]'), rm = e.target.closest('[data-rm]');
        if (add) { const k = add.getAttribute('data-add'); tray[k] = (tray[k] || 0) + 1; RB.audio && RB.audio.sfx('cursor'); render(); return; }
        if (rm) { const k = rm.getAttribute('data-rm'); tray[k]--; if (!tray[k]) delete tray[k]; render(); return; }
        if (e.target.closest('[data-serve]')) {
          const c = custs[i];
          const want = c.want;
          const diffs = [];
          for (const k of new Set(Object.keys(want).concat(Object.keys(tray)))) {
            const m = a.menu.find((x) => x.id === k);
            const w = want[k] || 0, h = tray[k] || 0;
            if (w !== h) diffs.push({ m, w, h });
          }
          const fb = P.body.querySelector('.fbwrap');
          if (!diffs.length) {
            RB.audio && RB.audio.sfx('answer_right');
            results.push({ ok: firstTry });
            if (c.items) RB.learn.record(c.items, { ok: firstTry, mode: 'choice', assisted });
            const thanks = tier(c.thanks) || { jp: 'ありがとう ！', en: 'Thank you!' };
            fbSet(fb, 'ok', 'Just right.', '<div class="fb-jp">' + RB.ui.jhtml(thanks.jp) + '</div><div class="muted">' + esc(thanks.en) + '</div>');
            P.body.querySelectorAll('[data-add], [data-rm]').forEach((x) => (x.disabled = true));
            P.foot.innerHTML = '<span class="spacer"></span>' + goBtn('data-next', i < custs.length - 1 ? 'Next customer' : 'Finish');
            P.foot.querySelector('[data-next]').onclick = () => {
              i++; tray = {}; firstTry = true; showEn = showEnDefault();
              if (i >= custs.length) { RB.ui.popLayer(P.lay); resolve({ ok: true, mistakes, results }); } else render();
            };
            P.foot.querySelector('[data-next]').focus({ preventScroll: true });
          } else {
            mistakes++; firstTry = false;
            RB.audio && RB.audio.sfx('answer_wrong');
            const hint = tier(c.hint);
            fbSet(fb, 'no', 'Not quite what they asked for.', '<ul class="fb-list">' + diffs.map((d) => '<li>' + esc(d.m ? d.m.en : '?') + ': you put ' + d.h + (d.w === 0 ? ', but they didn\'t ask for it' : '') + '</li>').join('') + '</ul>' + (hint ? '<div class="fb-why">' + (hint.jp ? RB.ui.jhtml(hint.jp) + ' ' : '') + esc(hint.en) + '</div>' : '') + '<p class="muted small">Listen again and adjust the tray.</p>');
          }
        }
      };
      P.lay.onCancel = () => {};
      render();
      RB.ui.pushLayer(P.lay);
    });
  }

  // ---- letters ------------------------------------------------------------------------------
  function letters(a) {
    return new Promise((resolve) => {
      const P = panel(RB.ui.jhtml(a.title.jp) + ' ' + esc(a.title.en));
      const list = a.letters.slice();
      let i = 0, showEn = showEnDefault(), assisted = false, firstTry = true, mistakes = 0;
      function render() {
        const L = list[i];
        const t = tier(L.text);
        P.fr.setTitle(RB.ui.jhtml(a.title.jp) + ' ' + esc(a.title.en), 'Letter ' + (i + 1) + ' of ' + list.length);
        P.body.innerHTML = '<p class="muted small act-lead">The address has run in the rain. Read the letter: who is it for?</p>' +
          '<article class="letter" aria-label="The letter">' + RB.learnUi.icon('letter') + '<div class="letter-jp">' + RB.ui.jhtml(t.jp) + '</div>' + (showEn ? '<div class="act-en">' + esc(RB.script.enVars(t.en)) + '</div>' : '') + '</article>' +
          (showEn ? '' : '<div class="act-tr">' + trButton() + '</div>') +
          '<h3>' + RB.learnUi.icon('companion') + '<span>Deliver to…</span></h3><ul class="entries recips">' + a.recipients.map((r) => '<li><button class="entry recip" data-to="' + r.id + '"><span class="mark">' + RB.learnUi.icon('here') + '</span><span class="body"><span class="t">' + esc(r.name.en) + ' ' + RB.ui.jhtml(r.name.jp) + '</span><span class="d">' + RB.ui.jhtml(tier(r.desc).jp) + (showEn ? '<span class="en">' + esc(tier(r.desc).en) + '</span>' : '') + '</span></span></button></li>').join('') + '</ul>' +
          '<div class="fbwrap" aria-live="polite"></div>';
        P.foot.innerHTML = '';
      }
      P.pn.onclick = (e) => {
        if (e.target.closest('[data-x]')) { RB.ui.popLayer(P.lay); resolve({ ok: false, cancelled: true }); return; }
        if (e.target.closest('[data-tr]')) { showEn = true; assisted = true; render(); return; }
        const b = e.target.closest('[data-to]');
        if (!b || b.disabled) return;
        const L = list[i];
        const fb = P.body.querySelector('.fbwrap');
        if (b.getAttribute('data-to') === L.to) {
          RB.audio && RB.audio.sfx('answer_right');
          if (L.items) RB.learn.record(L.items, { ok: firstTry, mode: 'choice', assisted });
          const why = tier(L.why);
          b.classList.add('on');
          fbSet(fb, 'ok', 'Delivered.', why ? (why.jp ? '<div class="fb-jp">' + RB.ui.jhtml(why.jp) + '</div>' : '') + '<div>' + esc(why.en) + '</div>' : '');
          P.foot.innerHTML = '<span class="spacer"></span>' + goBtn('data-next', i < list.length - 1 ? 'Next letter' : 'Done');
          P.foot.querySelector('[data-next]').onclick = () => { i++; firstTry = true; showEn = showEnDefault(); if (i >= list.length) { RB.ui.popLayer(P.lay); resolve({ ok: true, mistakes }); } else render(); };
          P.body.querySelectorAll('[data-to]').forEach((x) => (x.disabled = true));
          P.foot.querySelector('[data-next]').focus({ preventScroll: true });
        } else {
          mistakes++; firstTry = false;
          RB.audio && RB.audio.sfx('answer_wrong');
          const r = a.recipients.find((x) => x.id === b.getAttribute('data-to'));
          const hint = tier(L.hint);
          b.disabled = true;
          b.classList.add('tried');
          fbSet(fb, 'no', 'Not for ' + r.name.en + '.', '<p>' + esc(r.name.en) + ' reads a line and hands it back: “Not mine, I think.”</p>' + (hint ? '<div class="fb-why">' + (hint.jp ? RB.ui.jhtml(hint.jp) + ' ' : '') + esc(hint.en) + '</div>' : '<div class="fb-why">Look again for who, where and what.</div>'));
        }
      };
      P.lay.onCancel = () => {};
      render();
      RB.ui.pushLayer(P.lay);
    });
  }

  // ---- signpost -------------------------------------------------------------------------------
  async function signpost(a) {
    const arms = a.arms.map((x) => Object.assign({}, x, { done: false }));
    RB.game.pushMode('challenge');
    try {
      for (const arm of arms) {
        const place = a.places.find((p) => p.id === arm.to);
        const clue = tier(arm.clue);
        const header = '<div class="small dim">Signpost arm pointing <b>' + esc(arm.dir) + '</b>. Arms restored: ' + arms.filter((x) => x.done).map((x) => esc(a.places.find((p) => p.id === x.to).en)).join(', ') + '</div>';
        const step = RB.tasks.prepare({
          kind: 'write', item: place.item || ('v:' + RB.tasks.plain(place.jp)),
          ctx: { jp: clue.jp, en: clue.en },
          prompt: { en: 'Which place does this arm point to? Write its name on the arm.' },
          answer: place.r || RB.tasks.readingOf(place.jp), accept: [place.r || RB.tasks.readingOf(place.jp), RB.tasks.plain(place.jp)], mode: 'reading',
          choices: a.places.map((p) => p.r || RB.tasks.readingOf(p.jp)),
          explain: { jp: place.jp, en: place.en + (arm.why ? ' — ' + arm.why : '') },
        });
        const r = await RB.challenge.runStep(step, { header, cancelLabel: 'Stop for now', ctxTag: 'signpost' });
        if (r.cancelled) return { ok: false, cancelled: true };
        arm.done = true;
      }
      return { ok: true };
    } finally {
      RB.game.popMode('challenge');
    }
  }

  // ---- oral history ------------------------------------------------------------------------------
  async function history(a) {
    RB.game.pushMode('challenge');
    try {
      const frags = a.fragments.map((f) => tier(f));
      if (a.teller) for (const f of frags) await RB.ui.dialogue.say({ who: a.teller, jp: f.jp, en: f.en });
      RB.ui.dialogue.hide();
      const order = {
        kind: 'order', title: a.title.en, titleJp: a.title.jp,
        prompt: { en: 'Put the story back in the order it happened.' },
        tiles: frags.map((f) => f.short || f.jp), answer: frags.map((f) => f.short || f.jp),
        orderHint: { en: 'Listen for time words and cause-and-effect.' }, item: a.item,
      };
      const r1 = await RB.challenge.runStep(order, { cancelLabel: 'Stop for now', ctxTag: 'history' });
      if (r1.cancelled) return { ok: false, cancelled: true };
      if (a.question) {
        const q = RB.tasks.prepare(tier(a.question) || a.question);
        const r2 = await RB.challenge.runStep(q, { cancelLabel: 'Stop for now', ctxTag: 'history' });
        if (r2.cancelled) return { ok: false, cancelled: true };
      }
      if (a.note && !RB.game.s.notebook.find((n) => n.id === a.note)) {
        RB.game.s.notebook.push({ kind: 'lore', id: a.note, t: Date.now() });
        const nd = RB.content.notes[a.note];
        if (nd) await RB.ui.toast({ kind: 'note', jp: nd.title.jp, en: nd.title.en });
      }
      return { ok: true };
    } finally {
      RB.game.popMode('challenge');
    }
  }

  async function run(id, ctx) {
    const a = RB.content.activities[id];
    if (!a) { console.warn('missing activity', id); return { ok: true }; }
    if (RB.test && RB.test.auto) {
      if (a.type === 'history' && a.question) RB.test.solveStep(tier(a.question) || a.question, 'activity ' + id);
      if (a.note && !RB.game.s.notebook.find((n) => n.id === a.note)) RB.game.s.notebook.push({ kind: 'lore', id: a.note, t: Date.now() });
      return { ok: true };
    }
    void ctx;
    RB.ui.dialogue.hide();
    if (a.type === 'orders') { RB.game.pushMode('challenge'); try { return await orders(a); } finally { RB.game.popMode('challenge'); } }
    if (a.type === 'letters') { RB.game.pushMode('challenge'); try { return await letters(a); } finally { RB.game.popMode('challenge'); } }
    if (a.type === 'signpost') return signpost(a);
    if (a.type === 'history') return history(a);
    console.warn('unknown activity type', a.type);
    return { ok: true };
  }
  return { run, tier };
})();
