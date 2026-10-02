/* The Proofreader's Tray (Practice addendum §18): the interface. docs/practice/suite_b.md.
 *
 * One sheet holds the notice and all the evidence it must agree with, untimed. The
 * player first finds the portion that disagrees (tap a portion, then "This part
 * disagrees"), answers what a vague or shortened notice is missing, or — for P12 —
 * concludes that the evidence cannot settle anything. The repair then runs through the
 * ordinary challenge runner, with the evidence and the notice repeated in its task slip
 * so they stay in view: approved pieces to choose (Foundations), a short supported
 * replacement to write or type (its authored answer space, stylistic alternatives
 * included), pieces to rearrange, a better version to choose, or (P12) a question to ask.
 * The repaired notice is shown with the change marked and its consequence spelled out.
 * A finished sheet can be kept as a typeset practice page in the shared six places. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.proof = (function () {
  'use strict';
  const U = RB.ui.pb;
  const { esc, I, J, MX } = U;
  const P = () => RB.proof;
  const bi = (x, cls) => (x ? '<span class="pb-bi' + (cls ? ' ' + cls : '') + '">' + J(x.jp) + ' <span class="en">' + esc(x.en) + '</span></span>' : '');

  // ---- evidence, drawn with words beside every picture (never colour alone) ------------------------
  const SVG = (inner, label) => '<svg viewBox="0 0 48 48" class="pb-ico" ' + (label ? 'role="img" aria-label="' + esc(label) + '"' : 'aria-hidden="true" focusable="false"') + ' fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
  const SHAPES = {
    open: '<path d="M10 42V8h28v34"/><path d="M16 42V14l14-3v31" fill="currentColor" fill-opacity=".12"/><path d="M4 42h40"/>',
    closed: '<path d="M10 42V8h28v34z" fill="currentColor" fill-opacity=".18"/><path d="M12 12l24 26M36 12L12 38"/><path d="M4 42h40"/>',
    fruit: '<circle cx="24" cy="27" r="13"/><path d="M24 14c0-4 3-6 6-6M18 14c3-2 9-2 12 0"/>',
    bottle: '<path d="M19 6h10v6l4 6v24H15V18l4-6z"/><path d="M15 26h18"/>',
    can: '<rect x="12" y="10" width="24" height="32" rx="2"/><path d="M12 16h24M12 36h24M30 6h5v4"/>',
    house: '<path d="M6 24L24 8l18 16"/><path d="M11 21v21h26V21"/><path d="M21 42V30h6v12"/>',
    lantern: '<path d="M18 8h12M24 4v4M16 12h16l2 10-2 12H16l-2-12z"/><path d="M19 40h10M24 34v6"/>',
    round: '<ellipse cx="24" cy="28" rx="15" ry="14"/><path d="M17 12h14v4H17z"/>',
    square: '<rect x="9" y="14" width="30" height="28" rx="1"/><path d="M15 8h18v6H15z"/>',
    long: '<circle cx="11" cy="24" r="6"/><path d="M17 24h28M38 24v6M43 24v4"/>',
    short: '<circle cx="15" cy="24" r="7"/><path d="M22 24h14M31 24v5"/>',
    cap: '<path d="M18 4h12v8H18z" fill="currentColor" fill-opacity=".3"/><path d="M17 12h14l3 6v24H14V18z"/>',
    cork: '<path d="M20 4h8l-1 8h-6z" fill="currentColor" fill-opacity=".15"/><path d="M19 12h10l4 6v24H15V18z"/><path d="M20 6h8M20 9h8"/>',
    path: '<path d="M4 34c8-6 16-6 24-2s12 2 16-2" stroke-dasharray="1 0"/><path d="M6 22h36" stroke-dasharray="4 3"/><path d="M4 40h40"/>',
    nopath: '<path d="M4 18c6 3 10 3 14 0s10-3 14 0 8 3 12 0M4 28c6 3 10 3 14 0s10-3 14 0 8 3 12 0M4 38c6 3 10 3 14 0s10-3 14 0 8 3 12 0"/>',
  };
  const STATE = { open: RB.content.practiceB.ui.open, closed: RB.content.practiceB.ui.closed };
  function evidenceHtml(ev) {
    const title = ev.title ? '<div class="pb-ev-t">' + bi(ev.title) + '</div>' : '';
    let body = '';
    switch (ev.k) {
      case 'plan':
        body = '<div class="pb-plan" role="group" aria-label="' + esc(ev.alt || '') + '">' + ev.cells.map((c) =>
          '<div class="pb-cell" data-state="' + esc(c.state) + '">' + SVG(SHAPES[c.state] || SHAPES.open) +
          '<div class="pb-cell-l">' + bi(c.label, 'pos') + '</div><div class="pb-cell-n">' + bi(c.name) + '</div>' +
          '<div class="pb-cell-s">' + (c.state === 'closed' ? I('wrong') : I('right')) + bi(STATE[c.state]) + '</div></div>').join('') + '</div>';
        break;
      case 'count': {
        const n = ev.n | 0, icon = SHAPES[ev.icon] || SHAPES.fruit;
        if (ev.per) {
          body = '<div class="pb-count per" role="img" aria-label="' + esc(ev.alt || '') + '">' + Array.from({ length: n }, () => '<span class="pb-unit">' + SVG(SHAPES[ev.icon] || SHAPES.house) + '<span class="pb-sub">' + Array.from({ length: ev.per }, () => SVG(SHAPES[ev.perIcon] || SHAPES.lantern)).join('') + '</span></span>').join('') + '</div>';
        } else body = '<div class="pb-count" role="img" aria-label="' + esc(ev.alt || '') + '">' + Array.from({ length: n }, () => SVG(icon)).join('') + '</div>';
        body += '<div class="pb-ev-cap">' + bi(ev.label) + '</div>';
        break;
      }
      case 'slip': body = '<div class="pb-slip">' + ev.lines.map((l) => '<div>' + bi(l) + '</div>').join('') + '</div>'; break;
      case 'rule': case 'note': body = '<div class="pb-rule"><div class="jp">' + J(ev.text.jp) + '</div><div class="en">' + esc(ev.text.en) + '</div></div>'; break;
      case 'steps': body = '<ol class="pb-steps">' + ev.steps.map((x) => '<li>' + bi(x) + '</li>').join('') + '</ol>' + (ev.note ? '<div class="pb-rule small"><div class="jp">' + J(ev.note.jp) + '</div><div class="en">' + esc(ev.note.en) + '</div></div>' : ''); break;
      case 'seq': body = '<ol class="pb-seq" aria-label="' + esc(ev.alt || '') + '">' + ev.steps.map((x, i) => '<li>' + (i ? '<span class="pb-arrow" aria-hidden="true">' + I('next') + '</span>' : '') + '<span class="pb-box"><span class="pb-n">' + (i + 1) + '</span>' + bi(x) + '</span></li>').join('') + '</ol>'; break;
      case 'objects': body = '<div class="pb-objs">' + ev.items.map((o) => '<div class="pb-obj">' + SVG(SHAPES[o.shape] || SHAPES.round) + '<div class="pb-obj-n">' + bi(o.name) + '</div><div class="pb-obj-d">' + bi(o.desc) + '</div></div>').join('') + '</div>'; break;
      case 'table': body = '<table class="pb-table"><thead><tr>' + ev.head.map((h) => '<th scope="col">' + bi(h) + '</th>').join('') + '</tr></thead><tbody>' + ev.rows.map((r) => '<tr>' + r.map((c, i) => (i ? '<td>' : '<th scope="row">') + bi(c) + (i ? '</td>' : '</th>')).join('') + '</tr>').join('') + '</tbody></table>'; break;
      case 'measure': {
        const max = Math.max.apply(null, ev.items.map((x) => x.value));
        body = '<div class="pb-measure" role="group" aria-label="' + esc(ev.alt || '') + '">' + ev.items.map((x) => '<div class="pb-bar"><div class="pb-bar-n">' + bi(x.name) + '</div><div class="pb-bar-track"><span class="pb-bar-fill" style="width:' + Math.round((x.value / max) * 100) + '%"></span></div><div class="pb-bar-v">' + x.value + ' ' + bi(ev.unit) + '</div></div>').join('') + '</div>';
        break;
      }
      default: body = '';
    }
    return '<div class="pb-ev" data-k="' + esc(ev.k) + '">' + title + body + (ev.alt ? '<p class="sr">' + esc(ev.alt) + '</p>' : '') + '</div>';
  }
  function noticeHtml(t, sel, o) {
    o = o || {};
    const segs = t.notice.segs;
    const inner = (g, i) => (o.fixed && o.fixed[i] != null ? '<mark class="pb-fixed">' + J(o.fixed[i]) + '<span class="sr"> (changed)</span></mark>' : J(g.jp));
    if (o.static) {
      if (t.notice.list) return '<ol class="pb-notice list">' + (o.order || segs.map((g) => g.jp)).map((x) => '<li>' + J(x) + '</li>').join('') + '</ol>';
      return '<p class="pb-notice">' + segs.map((g, i) => '<span class="pb-seg' + (sel === i ? ' sel' : '') + '">' + inner(g, i) + '</span>').join(' ') + '</p>';
    }
    if (t.find || t.notice.segs.length === 1) return '<p class="pb-notice">' + segs.map((g) => J(g.jp)).join(' ') + '</p>';
    const tag = t.notice.list ? 'ol' : 'p';
    return '<' + tag + ' class="pb-notice pick' + (t.notice.list ? ' list' : '') + '" role="group" aria-label="The notice, in parts: choose the part that disagrees">' + segs.map((g, i) =>
      (t.notice.list ? '<li>' : '') + '<button type="button" class="pb-seg" data-pb-seg="' + i + '" aria-pressed="' + (sel === i) + '">' + J(g.jp) + '</button>' + (t.notice.list ? '</li>' : '')).join(t.notice.list ? '' : ' ') + '</' + tag + '>';
  }

  // ---- the tray ---------------------------------------------------------------------------------------
  function tray() {
    return new Promise((resolve) => {
      const s = RB.game.s;
      const S = U.sheet(J(RB.content.practiceB.ui.tray.jp) + ' ' + esc(RB.content.practiceB.ui.tray.en), '', { cls: 'pb-tray', closeLabel: 'Leave the tray' });
      const list = P().list(s);
      const n = list.filter((x) => x.rec).length;
      S.fr.setTitle(J(RB.content.practiceB.ui.tray.jp) + ' ' + esc(RB.content.practiceB.ui.tray.en), n + ' of ' + list.length + ' checked');
      S.leaf.innerHTML = '<p class="muted small act-lead">Short notices to check against the evidence beside them. Usually one detail is wrong for its purpose — but not always. Nothing is timed; the evidence stays on the sheet.</p>' +
        '<ul class="entries pb-cards">' + list.map((x) => '<li><button class="entry pb-card" data-pb-task="' + esc(x.id) + '"><span class="mark">' + I(x.rec ? 'done' : 'scroll') + '</span><span class="body">' +
          '<span class="t">' + J(x.def.title.jp) + ' <span class="en">' + esc(x.def.title.en) + '</span></span><span class="d">' + esc(x.def.gist) + '</span>' +
          '<span class="kind">' + (x.rec ? 'Checked · try again (practice)' : 'Not checked yet') + '</span></span></button></li>').join('') + '</ul>' +
        (P().kept(s).length ? '<p class="muted small">' + P().kept(s).length + ' kept proofreading page(s): Journey › Practice mementos.</p>' : '');
      const done = (v) => { U.pop(S.lay); resolve(v); };
      S.el.addEventListener('click', (e) => {
        if (e.target.closest('[data-pb-x]')) { done({ leave: true }); return; }
        const b = e.target.closest('[data-pb-task]');
        if (b) done({ open: b.getAttribute('data-pb-task') });
      });
      S.lay.onCancel = () => done({ leave: true });
      U.push(S.lay);
    });
  }

  // ---- one sheet: find, then repair ---------------------------------------------------------------------
  function header(t, sel, showEn) {
    return '<div class="pb-hdr proof"><div class="kind">The notice</div>' + noticeHtml(t, sel, { static: true }) + (showEn ? '<div class="act-en">' + esc(t.notice.en) + '</div>' : '') +
      '<details class="pb-hdr-ev" open><summary>The evidence</summary>' + t.evidence.map(evidenceHtml).join('') + '</details></div>';
  }
  function task(session, d, t, replay) {
    return new Promise((resolve) => {
      const s = RB.game.s;
      let sel = -1, showEn = U.showEnDefault(), mistakes = 0, assisted = false, found = false, busy = false;
      const S = U.sheet(J(d.title.jp) + ' ' + esc(d.title.en), replay ? 'Practice (checked before)' : '', { cls: 'pb-proof', closeLabel: 'Back to the tray' });
      function render() {
        let h = '<section class="pb-purpose"><div class="slip-lab">What this notice is for</div><p>' + esc(t.purpose.en) + '</p><p class="jp">' + J(t.purpose.jp) + '</p></section>';
        h += '<div class="pb-sheet"><section class="pb-notice-wrap" aria-label="The notice"><div class="slip-lab">' + bi(t.notice.title) + '</div>' + noticeHtml(t, sel) +
          (showEn ? '<div class="act-en">' + esc(t.notice.en) + '</div>' : '<div class="act-tr"><button class="pbtn quiet tr" data-pb-tr title="Show the English (counts as assisted)">' + I('note') + '<span>Translate <span class="aside">(assisted)</span></span></button></div>') + '</section>' +
          '<section class="pb-evidence" aria-label="The evidence"><div class="slip-lab">The evidence</div>' + t.evidence.map(evidenceHtml).join('') + '</section></div>';
        if (t.find) {
          h += '<section class="pb-find"><div class="slip-lab">Your finding</div><p>' + esc(t.find.prompt.en) + ' <span class="jp">' + J(t.find.prompt.jp) + '</span></p><div class="mc pb-find-opts" role="group" aria-label="Choices">' +
            t.find.options.map((o, i) => '<button class="btn choice" data-pb-find="' + i + '">' + (o.jp ? J(o.jp) : '') + '<span class="enline">' + esc(o.en) + '</span></button>').join('') + '</div></section>';
        } else {
          h += '<section class="pb-find"><div class="slip-lab">Your finding</div><p class="small">' + (t.notice.segs.length > 1 ? 'Tap the part of the notice that disagrees with the evidence, then confirm. ' : '') + 'If the evidence cannot settle it, say so instead.</p><div class="row-acts">' +
            (t.notice.segs.length > 1 ? '<button class="pbtn primary" data-pb-mark' + (sel < 0 ? ' disabled' : '') + '>' + I('look') + '<span>This part disagrees</span></button>' : '') +
            '<button class="pbtn" data-pb-unsettled>' + I('help') + '<span>The evidence can\'t settle this</span></button></div></section>';
        }
        h += '<div class="fbwrap" aria-live="polite"></div>';
        S.leaf.innerHTML = h;
      }
      const fbEl = () => S.leaf.querySelector('.fbwrap');
      const done = (v) => { U.pop(S.lay); resolve(v); };
      function miss(head, html) { mistakes++; RB.audio && RB.audio.sfx('answer_wrong'); U.fb(fbEl(), 'no', head, html); }
      async function repair() {
        if (busy) return;
        busy = true;
        found = true;
        const rp = t.repair;
        const hdr = header(t, t.insufficient ? -1 : sel, showEn);
        let step;
        if (rp.kind === 'replace') {
          const seg = t.notice.segs[sel];
          const fams = seg.options.map((o) => ({ ok: !!o.ok, parts: [o.jp], en: o.en, why: o.why, note: o.note }));
          step = t.lv === 'F'
            ? U.chooseStep(seg.options.map((o) => ({ jp: o.jp, en: o.en, ok: o.ok, why: o.why })), { title: d.title.en, titleJp: d.title.jp, prompt: rp.prompt, showEn: true })
            : U.writeStep(fams, { title: d.title.en, titleJp: d.title.jp, prompt: rp.prompt, what: 'repair' });
        } else if (rp.kind === 'order') {
          step = { kind: 'order', title: d.title.en, titleJp: d.title.jp, prompt: { en: U.kana(rp.prompt.en), jp: rp.prompt.jp }, tiles: rp.tiles.slice(), answer: rp.answer.slice(), alts: rp.alts || [], orderHint: { en: 'Check the evidence for what has to come first.' } };
        } else if (rp.kind === 'choose') {
          step = U.chooseStep(rp.options, { title: d.title.en, titleJp: d.title.jp, prompt: rp.prompt, showEn: t.lv === 'F' });
        } else if (rp.kind === 'ask') {
          step = U.writeStep(rp.replies, { title: d.title.en, titleJp: d.title.jp, prompt: rp.prompt, what: 'question' });
        }
        S.lay.el.classList.add('pb-hidden');
        let r;
        try { r = await RB.challenge.runStep(step, { header: hdr, noRecord: true, ctxTag: 'proofreading', cancelLabel: 'Back to the sheet' }); }
        finally { S.lay.el.classList.remove('pb-hidden'); busy = false; }
        if (!session.alive()) return;
        if (r.cancelled) { mistakes += r.mistakes || 0; return; }
        mistakes += r.mistakes || 0;
        if (r.assisted) assisted = true;
        const exposed = !!(r.assisted && !r.given);
        // what the notice now says
        let fixedText = null, order = null, asked = null;
        if (rp.kind === 'replace') {
          const seg = t.notice.segs[sel];
          let opt = null;
          if (r.given && r.given.option && r.given.option._src) opt = r.given.option._src;
          if (r.given && r.given.family != null) opt = seg.options[r.given.family];
          if (!opt || !opt.ok) opt = seg.options.find((o) => o.ok);
          fixedText = opt.jp;
        } else if (rp.kind === 'order') order = (r.given && r.given.order) || rp.answer;
        else if (rp.kind === 'choose') { const o = (r.given && r.given.option && r.given.option._src) || rp.options.find((x) => x.ok); fixedText = o.jp; }
        else if (rp.kind === 'ask') { const f = r.given && r.given.family != null ? rp.replies[r.given.family] : rp.replies.find((x) => x.ok); asked = (r.given && r.given.text) || RB.ui.plainJp(RB.practiceB.replyOf(f)); }
        done({ done: true, firstTry: mistakes === 0, assisted, exposed, mode: r.mode, fixedText, order, asked });
      }
      S.el.addEventListener('click', async (e) => {
        const tg = e.target;
        if (tg.closest('[data-pb-x]')) { done({ stop: true }); return; }
        if (busy) return;
        if (tg.closest('[data-pb-tr]')) { showEn = true; assisted = true; render(); return; }
        const sg = tg.closest('[data-pb-seg]');
        if (sg) { sel = +sg.getAttribute('data-pb-seg'); render(); const b = S.leaf.querySelector('[data-pb-seg="' + sel + '"]'); if (b) b.focus({ preventScroll: true }); return; }
        if (tg.closest('[data-pb-unsettled]')) {
          if (t.insufficient) { RB.audio && RB.audio.sfx('answer_right'); U.fb(fbEl(), 'ok', 'Right: the tray can\'t settle it', '<p>Nothing here contradicts the slip — and nothing confirms it either. The honest repair is a question.</p>'); setTimeout(() => repair(), 600); return; }
          miss('The evidence does settle this', '<p>Look again: something in the notice disagrees with what the tray shows.</p>');
          return;
        }
        if (tg.closest('[data-pb-mark]') && sel >= 0) {
          const g = t.notice.segs[sel];
          if (t.insufficient) { miss('That would be a guess', '<p>Nothing on the tray contradicts this part — but nothing confirms it either. Changing it would be a guess.</p>'); return; }
          if (g.bad) {
            RB.audio && RB.audio.sfx('answer_right');
            if (t.repair.kind === 'replace' && !g.options) { const k = t.notice.segs.findIndex((x) => x.bad && x.options); if (k >= 0) sel = k; }
            U.fb(fbEl(), 'ok', 'Found it', '<p>' + (g.group ? 'These parts have swapped.' : 'This part disagrees with the evidence.') + ' Now repair it.</p>');
            setTimeout(() => repair(), 500);
            return;
          }
          if (g.style) { miss('That wording is fine', '<p>' + MX(g.style) + '</p><p class="muted small">Style is not what this tray checks: look for information that disagrees with the evidence.</p>'); return; }
          miss('That part agrees with the evidence', '<p>' + MX(g.ok || 'Compare it with the evidence: it matches.') + '</p>');
          return;
        }
        const fo = tg.closest('[data-pb-find]');
        if (fo) {
          const o = t.find.options[+fo.getAttribute('data-pb-find')];
          if (o.ok) { fo.classList.add('on'); RB.audio && RB.audio.sfx('answer_right'); U.fb(fbEl(), 'ok', 'Yes', '<p>' + esc(o.en) + '.</p>'); setTimeout(() => repair(), 500); return; }
          fo.disabled = true; fo.classList.add('tried');
          miss('Not that', '<p>' + MX(o.why ? o.why.en : '') + '</p>');
        }
      });
      S.lay.onCancel = () => done({ stop: true });
      render();
      U.push(S.lay);
    });
  }

  // ---- the result: the repaired notice and what it now does --------------------------------------------
  function result(session, d, t, out, recorded) {
    return new Promise((resolve) => {
      const s = RB.game.s;
      const S = U.sheet(J(d.title.jp) + ' ' + esc(d.title.en), 'Checked', { cls: 'pb-result', close: false });
      let lines;
      let h = '';
      if (out.asked) {
        h += '<section class="pb-repaired"><div class="slip-lab">Unchanged — your question goes back to the sender</div>' + noticeHtml(t, -1, { static: true }) +
          '<p class="pb-asked">' + I('help') + ' <span class="jp" lang="ja">' + U.own(out.asked) + '</span></p></section>';
        lines = [t.notice.segs.map((g) => g.jp).join(' '), out.asked];
      } else if (out.order) {
        h += '<section class="pb-repaired"><div class="slip-lab">The repaired notice</div>' + noticeHtml(t, -1, { static: true, order: out.order }) + '</section>';
        lines = out.order.map((x, i) => (i + 1) + '. ' + x);
      } else if (t.repair.kind === 'choose') {
        h += '<section class="pb-repaired"><div class="slip-lab">The repaired notice</div><p class="pb-notice"><mark class="pb-fixed">' + J(out.fixedText) + '<span class="sr"> (revised)</span></mark></p></section>';
        lines = [out.fixedText];
      } else {
        const sel = t.notice.segs.findIndex((g) => g.bad && g.options && g.options.some((o) => o.jp === out.fixedText));
        const fixed = {}; fixed[sel] = out.fixedText;
        h += '<section class="pb-repaired"><div class="slip-lab">The repaired notice</div>' + noticeHtml(t, -1, { static: true, fixed }) + '</section>';
        lines = [t.notice.segs.map((g, i) => (i === sel ? out.fixedText : g.jp)).join(' ')];
      }
      h += '<section class="pb-consequence" role="note">' + I('right') + '<div><p class="en"><b>' + esc(t.consequence.en) + '</b></p><p class="jp">' + J(t.consequence.jp) + '</p></div></section>';
      h += '<section class="fb-ex pb-explain"><h3>' + I('bulb') + '<span>Why</span></h3><p>' + MX(t.explain.en) + '</p></section>';
      h += '<p class="muted small">' + (recorded ? 'Recorded once in your learning progress.' : out.exposed ? 'The answer was shown, so this is kept as practice, not as recall.' : 'Kept as practice.') + ' The tray gives no rewards.</p>';
      h += '<div class="fbwrap" aria-live="polite"></div>';
      S.leaf.innerHTML = h;
      S.foot.innerHTML = '<button class="cbtn" data-pb-keep>' + I('save') + '<span>Keep this page</span></button><span class="spacer"></span><button class="cbtn go" data-pb-ok data-ok>' + I('next') + '<span>Back to the tray</span></button>';
      const done = () => { U.pop(S.lay); resolve(); };
      S.foot.querySelector('[data-pb-ok]').onclick = done;
      S.foot.querySelector('[data-pb-keep]').onclick = async (e) => {
        const b = e.currentTarget;
        b.disabled = true;
        const page = P().pageFor(d, t, d.title.en, lines);
        S.lay.el.classList.add('pb-hidden');
        let r;
        try { r = await U.keepFlow(s, page); } finally { S.lay.el.classList.remove('pb-hidden'); }
        if (!session.alive()) return;
        const fbel = S.leaf.querySelector('.fbwrap');
        // kept but not written to a save slot (no slot, a read-only tab, session-only storage): say so
        const unsaved = r.ok && r.saved === false ? (RB.ui.desk && RB.ui.desk.statusText ? RB.ui.desk.statusText(r) : 'Kept in this journey, but not saved yet.') : '';
        if (r.ok) { U.fb(fbel, 'ok', r.replaced ? 'Kept (a page was replaced, as you chose)' : 'Kept', '<p>Find it in Journey › Practice mementos. It is typeset, not handwriting.</p>' + (unsaved ? '<p class="muted small pb-unsaved">' + unsaved + '</p>' : '')); b.querySelector('span').textContent = 'Kept'; }
        else { b.disabled = false; U.fb(fbel, 'info', r.why === 'cancelled' ? 'Not kept' : 'Could not keep it', '<p>' + (r.why === 'cancelled' ? 'Nothing was changed.' : 'Your other pages are untouched; this sheet stays on screen but is not saved.') + '</p>'); }
      };
      S.lay.onCancel = done;
      U.push(S.lay);
      setTimeout(() => { const b = S.foot.querySelector('[data-pb-ok]'); if (b) b.focus({ preventScroll: true }); }, 30);
    });
  }

  async function run(session) {
    session.set('active');
    const s = RB.game.s;
    const rec = P().rec(s);
    const cd = RB.practiceB.cooldown(rec);
    let checked = 0;
    for (;;) {
      if (!session.alive()) return { abandoned: true };
      const pick = await tray();
      if (!session.alive()) return { abandoned: true };
      if (pick.leave) return { checked };
      const d = P().byId(pick.open), t = P().tier(d, U.prof());
      const replay = !!rec.done[d.id];
      if (!cd.allow('proof:' + d.id)) RB.ui.notice('You have just done this one: it counts as practice this time.', 'info');
      session.set('active');
      const out = await task(session, d, t, replay);
      if (!session.alive()) return { abandoned: true };
      if (out.stop) continue;
      session.set('resolving');
      const recorded = cd.allow('proof:' + d.id) ? U.assess(session, rec, 'proof:' + d.id, t.item, { firstTry: out.firstTry, mode: out.mode, assisted: out.assisted }, { exposed: out.exposed || replay }) : (RB.practice.tally(s, 'proofreading', { n: 1, replay: 1 }), false);
      RB.practiceB.note(rec, 'proof:' + d.id, !out.firstTry, cd);
      const c = P().complete(s, d.id, { prof: t.lv });
      if (c.first) checked++;
      session.set('result');
      await result(session, d, Object.assign({ lv: t.lv }, t), out, recorded);
      if (!session.alive()) return { abandoned: true };
    }
  }
  if (RB.activity) RB.activity.register('proofreading', {
    title: RB.content.practiceB.ui.tray,
    eligible: (s) => RB.proof.eligible(s),
    run,
    dispose: () => U.closeAll(),
  });

  // ---- Journey › Practice mementos: the kept proofreading pages -----------------------------------------
  if (RB.practice && RB.practice.addMementoSource) {
    RB.practice.addMementoSource({
      id: 'proof', order: 60,
      list: (s) => P().kept(s).map((p) => {
        const d = p.typeset && P().byId(p.typeset.task);
        return {
          id: p.id, kind: 'proof',
          title: { jp: d ? d.title.jp : RB.content.practiceB.ui.tray.jp, en: p.label || (d ? d.title.en : 'Proofreading page') },
          note: 'A proofreading page, typeset in the game\'s lettering (not handwriting).' + (d ? '' : ' Its task is no longer in this version of the game; the page is kept as it was.'),
          html: () => '<div class="pb-kept">' + ((p.typeset && p.typeset.lines) || []).map((l) => '<p>' + J(l) + '</p>').join('') + '</div>',
        };
      }),
    });
  }

  // ---- Words › Ways to practise ---------------------------------------------------------------------------
  const PL = () => RB.practiceB.PLACE;
  if (RB.practice && RB.practice.addActivity) {
    RB.practice.addActivity({
      id: 'proofreading', en: RB.content.practiceB.ui.tray.en, jp: RB.content.practiceB.ui.tray.jp, icon: 'scroll', order: 61,
      where: { en: PL().name.en, jp: PL().name.jp },
      available: (s) => P().available(s),
      here: (s) => RB.practiceB.atPlace(s),
      note: (s) => (!P().available(s) ? 'Once Saltglass\'s trouble is settled: twelve notices to check against their evidence.' : Object.keys(P().rec(s).done).length + ' of 12 checked. Offered at the post box.'),
      begin: (ctx) => RB.activity.launch('proofreading', ctx),
    });
  }

  return { run, tray, task, result, evidenceHtml, noticeHtml };
})();
