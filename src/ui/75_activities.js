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
  function panel(title) {
    const scrim = RB.ui.el('div', 'scrim');
    const pn = RB.ui.el('div', 'panel');
    scrim.appendChild(pn);
    pn.innerHTML = '<header><h2>' + title + '</h2><button class="btn small" data-x>Stop for now</button></header><div class="body"></div><div class="foot"></div>';
    const lay = { el: scrim, name: 'activity' };
    return { scrim, pn, lay, body: pn.querySelector('.body'), foot: pn.querySelector('.foot') };
  }
  function showEnDefault() {
    return RB.game.s.learn.profile === 'F';
  }
  function lineHtml(l, showEn, onTr) {
    void onTr;
    return '<div style="font-size:1.25em">' + RB.ui.jhtml(l.jp) + '</div>' + (showEn ? '<div class="en dim">' + esc(RB.script.enVars(l.en)) + '</div>' : '<button class="btn small" data-tr>Show translation (assisted)</button>');
  }

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
        P.body.innerHTML = '<div class="row" style="align-items:flex-start"><canvas width="48" height="48" style="width:72px;height:72px;image-rendering:pixelated;border-radius:8px"></canvas><div class="grow"><div class="small" style="color:var(--accent)">' + esc(who ? who.name.en : c.name || 'Customer') + ' (' + (i + 1) + '/' + custs.length + ')</div>' + lineHtml(l, showEn) + '</div></div>' +
          '<h3>Tray</h3><div class="built">' + (Object.keys(tray).length ? Object.keys(tray).map((k) => { const m = a.menu.find((x) => x.id === k); return '<button class="btn" data-rm="' + k + '">' + RB.ui.jhtml(m.jp) + ' ×' + tray[k] + '</button>'; }).join('') : '<span class="dim small">empty — tap items below to add; tap tray items to remove one</span>') + '</div>' +
          '<h3>Kitchen</h3><div class="tiles">' + a.menu.map((m) => '<button class="btn" data-add="' + m.id + '">' + RB.ui.jhtml(m.jp) + '<div class="small dim">' + esc(showEn || m.always ? m.en : '') + '</div></button>').join('') + '</div>' +
          '<div class="fbwrap"></div>';
        P.foot.innerHTML = '<button class="btn primary" data-serve>Serve ▶</button>';
        const cv = P.body.querySelector('canvas');
        if (who) RB.portraits.draw(cv, c.who, 'neutral'); else cv.remove();
      }
      P.pn.onclick = (e) => {
        if (e.target.closest('.jt') && RB.ui.help.enabled()) return;
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
            fb.className = 'fbwrap fb ok';
            fb.innerHTML = '✓ ' + RB.ui.jhtml(thanks.jp) + ' <span class="dim">' + esc(thanks.en) + '</span>';
            P.foot.innerHTML = '<button class="btn primary" data-next>' + (i < custs.length - 1 ? 'Next customer ▶' : 'Finish ▶') + '</button>';
            P.foot.querySelector('[data-next]').onclick = () => {
              i++; tray = {}; firstTry = true; showEn = showEnDefault();
              if (i >= custs.length) { RB.ui.popLayer(P.lay); resolve({ ok: true, mistakes, results }); } else render();
            };
          } else {
            mistakes++; firstTry = false;
            RB.audio && RB.audio.sfx('answer_wrong');
            const hint = tier(c.hint);
            fb.className = 'fbwrap fb no';
            fb.innerHTML = '<b>Not quite what they asked for.</b> ' + diffs.map((d) => esc(d.m ? d.m.en : '?') + ': you put ' + d.h + (d.w === 0 ? ', but they didn\'t ask for it' : '')).join('; ') + '.' + (hint ? '<div>' + (hint.jp ? RB.ui.jhtml(hint.jp) + ' ' : '') + esc(hint.en) + '</div>' : '') + '<div class="small dim">Listen again and adjust the tray.</div>';
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
        P.body.innerHTML = '<div class="small dim">Letter ' + (i + 1) + ' of ' + list.length + ' — the address has run in the rain. Who is it for?</div>' +
          '<div style="background:#f4ecd8;color:#2a2024;border-radius:8px;padding:0.8em 1em;margin:0.5em 0;box-shadow:inset 0 0 20px rgba(120,90,40,0.2)">' + RB.ui.jhtml(t.jp) + (showEn ? '<div class="en" style="color:#5a4a3a">' + esc(RB.script.enVars(t.en)) + '</div>' : '') + '</div>' +
          (showEn ? '' : '<button class="btn small" data-tr>Show translation (assisted)</button>') +
          '<h3>Deliver to…</h3><div class="grid2">' + a.recipients.map((r) => '<button class="btn item" data-to="' + r.id + '" style="text-align:left"><div class="t">' + esc(r.name.en) + ' ' + RB.ui.jhtml(r.name.jp) + '</div><div class="small">' + RB.ui.jhtml(tier(r.desc).jp) + (showEn ? '<div class="dim">' + esc(tier(r.desc).en) + '</div>' : '') + '</div></button>').join('') + '</div><div class="fbwrap"></div>';
        P.foot.innerHTML = '';
      }
      P.pn.onclick = (e) => {
        if (e.target.closest('.jt') && RB.ui.help.enabled()) return;
        if (e.target.closest('[data-x]')) { RB.ui.popLayer(P.lay); resolve({ ok: false, cancelled: true }); return; }
        if (e.target.closest('[data-tr]')) { showEn = true; assisted = true; render(); return; }
        const b = e.target.closest('[data-to]');
        if (!b) return;
        const L = list[i];
        const fb = P.body.querySelector('.fbwrap');
        if (b.getAttribute('data-to') === L.to) {
          RB.audio && RB.audio.sfx('answer_right');
          if (L.items) RB.learn.record(L.items, { ok: firstTry, mode: 'choice', assisted });
          const why = tier(L.why);
          fb.className = 'fbwrap fb ok';
          fb.innerHTML = '✓ Delivered. ' + (why ? (why.jp ? RB.ui.jhtml(why.jp) + ' ' : '') + esc(why.en) : '');
          P.foot.innerHTML = '<button class="btn primary" data-next>' + (i < list.length - 1 ? 'Next letter ▶' : 'Done ▶') + '</button>';
          P.foot.querySelector('[data-next]').onclick = () => { i++; firstTry = true; showEn = showEnDefault(); if (i >= list.length) { RB.ui.popLayer(P.lay); resolve({ ok: true, mistakes }); } else render(); };
          P.body.querySelectorAll('[data-to]').forEach((x) => (x.disabled = true));
        } else {
          mistakes++; firstTry = false;
          RB.audio && RB.audio.sfx('answer_wrong');
          const r = a.recipients.find((x) => x.id === b.getAttribute('data-to'));
          const hint = tier(L.hint);
          b.disabled = true;
          fb.className = 'fbwrap fb no';
          fb.innerHTML = esc(r.name.en) + ' reads a line and hands it back: “Not mine, I think.” ' + (hint ? (hint.jp ? RB.ui.jhtml(hint.jp) + ' ' : '') + esc(hint.en) : 'Look again for who, where and what.');
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
        kind: 'order', title: RB.ui.plainJp(a.title.jp) + ' — ' + a.title.en,
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
