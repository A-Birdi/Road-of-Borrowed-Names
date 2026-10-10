/* Weighing tellings on screen (expansion P10; the rules in src/engine/72k_tellings.js). One sheet, opened by a scene
 * with `!hook tellings <id>`; the scene waits for it and reads the outcome in `var._tell` ('best', 'ok', 'no' or
 * 'cancel'):
 *   1. The sources side by side (stacked on a phone): what kind of source each is, who it comes from, what it says
 *      (Japanese with its readings; the English a tap away), and "Read it closely": the source's own reading task
 *      through the ordinary language runner, recorded as evidence like any other.
 *   2. Under each, what it claims: the player marks whether this source can vouch for it, or can't say. A mark the
 *      other way says why (an inscription vouches for what is carved and can still be read; a memory for what the
 *      person saw and is sure of; a rhyme for its words, not their order; a teller's scroll for the teller's
 *      tradition). Marks are never a gate.
 *   3. Act on it: put the things in order, or choose what to do. The sheet closes with the reading; the scene shows
 *      what happens (a wrong telling leads to a dead end that explains itself, never a trap).
 * In the test driver's automated runs the best supported reading is taken at once (no screen). */
var RB = (globalThis.RB = globalThis.RB || {});
RB.ui = RB.ui || {};

RB.ui.tellings = (function () {
  'use strict';
  const esc = (s) => RB.util.esc(String(s == null ? '' : s));
  const J = (t) => RB.ui.jhtml(t || '');
  const S = () => RB.game.s;
  const KIND = {
    inscription: { en: 'An inscription', jp: '{碑|いしぶみ}', vouch: 'what is carved, and can still be read' },
    memory: { en: 'A memory', jp: '{思|おも}い{出|で}', vouch: 'what the person saw, and is sure of' },
    rhyme: { en: 'A rhyme', jp: '{歌|うた}', vouch: 'its words, not the order they come in' },
    scroll: { en: 'A teller\'s scroll', jp: '{絵巻|えまき}', vouch: 'the teller\'s tradition, told for listeners' },
    board: { en: 'A notice', jp: '{掲示|けいじ}', vouch: 'what whoever wrote it knew' },
    record: { en: 'A record', jp: '{記録|きろく}', vouch: 'what was written down at the time' },
  };
  const prof = () => (S() && S().profile) || 'F';

  function open(id) {
    const T = RB.tellings, d = T.def(id);
    if (!d) return Promise.resolve({ cancelled: true });
    return new Promise((resolve) => {
      const marks = {}, read = {};
      let order = [], choice = null, shownEn = {};
      const fr = RB.learnUi.sheet({ cls: 'activity tl-sheet', title: J(d.title.jp) + ' ' + esc(d.title.en) });
      const lay = { el: fr.scrim, name: 'tellings' };
      RB.learnUi.guardTaps(fr.leaf);
      RB.ui.pushLayer(lay);
      let done = false;
      const finish = (r) => { if (done) return; done = true; if (lay.el.isConnected) RB.ui.popLayer(lay); resolve(r); };
      lay.onCancel = () => finish({ cancelled: true });

      function sourceHtml(src) {
        const k = KIND[src.kind] || KIND.record, t = T.textAt(src, prof());
        const cl = (src.claims || []).map((c) => {
          const m = marks[c.id], fb = m == null ? null : T.markFeedback(d, { [c.id]: m })[c.id];
          return '<li class="tl-claim" data-c="' + esc(c.id) + '"><span class="tl-cjp">' + J(c.jp) + '</span><span class="tl-cen">' + esc(c.en) + '</span>' +
            '<span class="tl-marks" role="group" aria-label="Can this source vouch for it?">' +
            '<button class="tl-mark" data-m="1" aria-pressed="' + (m === true) + '">Can vouch</button>' +
            '<button class="tl-mark" data-m="0" aria-pressed="' + (m === false) + '">Can\'t say</button></span>' +
            (fb && !fb.right && fb.why ? '<span class="tl-why" role="note">' + RB.learnUi.mixed(fb.why.en) + '</span>' : '') +
            (fb && fb.right ? '<span class="tl-ok" aria-label="Agreed">✓</span>' : '') + '</li>';
        }).join('');
        return '<section class="tl-src" data-s="' + esc(src.id) + '" aria-labelledby="tl-h-' + esc(src.id) + '">' +
          '<header class="tl-head"><span class="tl-kind">' + J(k.jp) + ' ' + esc(k.en) + '</span>' +
          '<h3 class="tl-who" id="tl-h-' + esc(src.id) + '">' + J(src.who.jp) + ' <span class="tl-whoen">' + esc(src.who.en) + '</span></h3></header>' +
          '<p class="tl-text">' + J(t.jp) + '</p>' +
          (t.gloss ? '<p class="tl-gloss"><span class="tl-tag">Classical</span> ' + J(t.gloss.jp) + '</p>' : '') +
          (shownEn[src.id] ? '<p class="tl-en">' + esc(t.en) + '</p>' : '') +
          '<p class="tl-acts"><button class="pbtn small tl-showen" data-s="' + esc(src.id) + '" aria-pressed="' + !!shownEn[src.id] + '">In English</button>' +
          (src.read ? ' <button class="pbtn small tl-read" data-s="' + esc(src.id) + '">' + (read[src.id] ? 'Read again' : 'Read it closely') + '</button>' + (read[src.id] ? ' <span class="tl-done">read</span>' : '') : '') + '</p>' +
          '<p class="tl-vouch muted small">' + esc(k.en) + ' can vouch for ' + esc(k.vouch) + '.</p>' +
          (cl ? '<ul class="tl-claims">' + cl + '</ul>' : '') + '</section>';
      }
      function actHtml() {
        if (d.answer.kind === 'order') {
          const items = d.answer.items;
          const chips = items.map((x) => { const i = order.indexOf(x.id); return '<button class="tl-chip" data-x="' + esc(x.id) + '" aria-pressed="' + (i >= 0) + '">' + (i >= 0 ? '<span class="tl-n">' + (i + 1) + '</span>' : '') + J(x.jp) + ' <span class="tl-chipen">' + esc(x.en) + '</span></button>'; }).join('');
          return '<p>' + J(d.question.jp) + '<br><span class="muted">' + esc(d.question.en) + '</span></p><div class="tl-chips" role="group" aria-label="Tap them in order">' + chips + '</div>' +
            '<p class="tl-order" aria-live="polite">' + (order.length ? order.map((xid, i) => (i + 1) + '. ' + esc(items.find((x) => x.id === xid).en)).join('  ') : 'Tap them in the order you will light them.') + '</p>' +
            '<p><button class="pbtn tl-clear"' + (order.length ? '' : ' disabled') + '>Start the order again</button></p>';
        }
        return '<p>' + J(d.question.jp) + '<br><span class="muted">' + esc(d.question.en) + '</span></p><div class="tl-opts" role="radiogroup">' +
          d.answer.options.map((o) => '<button class="tl-opt" role="radio" data-o="' + esc(o.id) + '" aria-checked="' + (choice === o.id) + '">' + J(o.jp) + '<span class="tl-chipen">' + esc(o.en) + '</span></button>').join('') + '</div>';
      }
      function render() {
        const ready = d.answer.kind === 'order' ? order.length === d.answer.items.length : !!choice;
        fr.leaf.innerHTML = '<p class="tl-intro">Set the tellings side by side. Mark what each one can really vouch for, then act on what holds.</p>' +
          '<div class="tl-srcs">' + d.sources.map(sourceHtml).join('') + '</div>' +
          '<section class="tl-act" aria-label="Act on it"><h3>Act on it</h3>' + actHtml() + '</section>';
        fr.foot.innerHTML = '<button class="pbtn tl-cancel">Come back later</button> <button class="pbtn primary tl-go"' + (ready ? '' : ' disabled') + '>' + (d.answer.kind === 'order' ? 'Light them in this order' : 'Do it') + '</button>';
      }
      async function onClick(e) {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.classList.contains('tl-mark')) { const c = b.closest('.tl-claim').dataset.c; marks[c] = b.dataset.m === '1'; render(); focusSel('.tl-claim[data-c="' + c + '"] .tl-mark[data-m="' + b.dataset.m + '"]'); return; }
        if (b.classList.contains('tl-showen')) { shownEn[b.dataset.s] = !shownEn[b.dataset.s]; render(); focusSel('.tl-showen[data-s="' + b.dataset.s + '"]'); return; }
        if (b.classList.contains('tl-read')) {
          const src = d.sources.find((x) => x.id === b.dataset.s);
          if (src && src.read && RB.challenge) { const r = await RB.challenge.run(src.read); if (r && r.ok) read[src.id] = true; }
          render(); focusSel('.tl-read[data-s="' + b.dataset.s + '"]'); return;
        }
        if (b.classList.contains('tl-chip')) { const x = b.dataset.x, i = order.indexOf(x); if (i >= 0) order = order.slice(0, i); else order.push(x); render(); focusSel('.tl-chip[data-x="' + x + '"]'); return; }
        if (b.classList.contains('tl-clear')) { order = []; render(); focusSel('.tl-chip'); return; }
        if (b.classList.contains('tl-opt')) { choice = b.dataset.o; render(); focusSel('.tl-opt[data-o="' + choice + '"]'); return; }
        if (b.classList.contains('tl-cancel')) { finish({ cancelled: true }); return; }
        if (b.classList.contains('tl-go')) {
          const r = T.judge(d, d.answer.kind === 'order' ? order : choice);
          r.marks = Object.assign({}, marks);
          finish(r);
        }
      }
      const focusSel = (sel) => setTimeout(() => { const n = fr.el.querySelector(sel); if (n && lay.el.isConnected) n.focus({ preventScroll: true }); }, 0);
      fr.el.addEventListener('click', onClick);
      render();
      focusSel('.tl-showen, .tl-mark');
    });
  }

  // `!hook tellings <id>`: open the sheet, keep the reading, tell the scene how it went
  RB.hooks = RB.hooks || {};
  RB.hooks.tellings = async (a) => {
    const s = S(), id = a && a[0], T = RB.tellings, d = T.def(id);
    if (!d) { s.vars._tell = 'cancel'; return; }
    let r;
    if (RB.test && RB.test.auto) { r = T.judge(d, T.autoReading(d)); RB.test.log.push({ t: 'activity', kind: 'tellings', id, auto: r.reading }); }
    else r = await open(id);
    if (r.cancelled) { s.vars._tell = 'cancel'; return; }
    T.keep(s, id, r);
    s.vars._tell = r.ok ? (r.best ? 'best' : 'ok') : 'no';
  };
  return { open };
})();
