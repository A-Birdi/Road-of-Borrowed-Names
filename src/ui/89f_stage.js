/* Rehearsal's stage (expansion P09; plan 06_WORLD.md W17, 07_REGIONS.md R1 "Rehearsal"): a choice step with
 * `stage: <id>` shows the stage above the task, seen from the seats, and whatever is chosen, the actors and props go
 * where that answer puts them. The language is judged as for any choice; this only shows the consequence (a token
 * per actor or prop at its place, and a line saying what that means). Nothing is timed or changes the result.
 *
 * A stage (RB.content.stages[id]): { cols: 5, rows: 3, tokens: { id: { jp, en } }, start: { token: [col, row] } }.
 * Columns run from 下手 (shimote, the audience's left) to 上手 (kamite, the audience's right); rows from 奥 (oku,
 * the back) to 前 (mae, the front). An option's `place` is { token: [col, row] } and its `means` ({ en }) says what
 * the staging looks like. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.ui = RB.ui || {};

RB.ui.stage = (function () {
  'use strict';
  const esc = (s) => RB.util.esc(String(s == null ? '' : s));
  const def = (step) => (RB.content.stages || {})[step.stage] || null;
  // (romanised: these lines are plain text in a caption and a label, where readings cannot be shown)
  const COL = ['the far left (shimote)', 'left of centre', 'centre', 'right of centre', 'the far right (kamite)'];
  const ROW = ['at the back (oku)', 'mid-stage', 'at the front (mae)'];

  function grid(d, place) {
    const cells = [];
    for (let r = 0; r < d.rows; r++) for (let c = 0; c < d.cols; c++) {
      const here = Object.keys(place || {}).filter((k) => place[k] && place[k][0] === c && place[k][1] === r);
      cells.push('<div class="st-cell" data-c="' + c + '" data-r="' + r + '">' + here.map((k) => {
        const tk = d.tokens[k] || { en: k };
        return '<span class="st-tok st-' + esc(k) + '"><span class="jp" lang="ja">' + RB.ui.jhtml(tk.jp || '') + '</span><span class="en">' + esc(tk.en) + '</span></span>';
      }).join('') + '</div>');
    }
    return cells.join('');
  }
  function said(d, place) {
    return Object.keys(place || {}).map((k) => (d.tokens[k] ? d.tokens[k].en : k) + ': ' + ROW[place[k][1]] + ', ' + COL[place[k][0]]).join('; ');
  }
  function html(step, at) {
    const d = def(step);
    if (!d) return '';
    const place = (at && at.place) || d.start || {};
    return '<figure class="st" data-stage="' + esc(step.stage) + '"' + (at && at.cls ? ' data-res="' + at.cls + '"' : '') + '>' +
      '<div class="st-wings" aria-hidden="true"><span>' + RB.ui.jhtml('{下手|しもて}') + '</span><span>' + RB.ui.jhtml('{上手|かみて}') + '</span></div>' +
      '<div class="st-board" role="img" aria-label="' + esc('The stage, seen from the seats. ' + (said(d, place) || 'Nobody is placed yet.')) + '" style="grid-template-columns: repeat(' + d.cols + ', 1fr)">' + grid(d, place) + '</div>' +
      '<div class="st-front muted small" aria-hidden="true">— the seats —</div>' +
      '<figcaption class="st-say muted small" aria-live="polite">' + esc(at && at.say ? at.say : 'The stage, seen from the seats.') + '</figcaption></figure>';
  }
  function mount(el, step, at) {
    if (!def(step) || !el) return;
    el.insertAdjacentHTML('afterbegin', html(step, at));
  }
  // show where an answer puts everyone; returns what to remember for a redraw
  function play(el, step, option) {
    const d = def(step), fig = el && el.querySelector('.st');
    if (!d || !fig || !option || !option.place) return null;
    const place = Object.assign({}, d.start || {}, option.place);
    const at = { place, cls: option.ok ? 'ok' : 'wrong', say: (option.means && option.means.en) || said(d, place) };
    fig.outerHTML = html(step, at);
    return at;
  }
  // every option of a stage step places only tokens the stage has, inside the stage
  function check(C) {
    const errs = [];
    for (const id in C.challenges || {}) for (const tier of Object.values(C.challenges[id].tiers || {})) for (const st of tier) {
      if (!st.stage) continue;
      const d = (C.stages || {})[st.stage];
      if (!d) { errs.push(id + ': no stage ' + st.stage); continue; }
      for (const o of st.options || []) for (const k in o.place || {}) {
        const p = o.place[k];
        if (!d.tokens[k]) errs.push(id + ': unknown token ' + k);
        if (!p || p[0] < 0 || p[0] >= d.cols || p[1] < 0 || p[1] >= d.rows) errs.push(id + ': ' + k + ' placed off the stage');
      }
      if (!(st.options || []).every((o) => o.place)) errs.push(id + ': an option with nowhere to put anyone');
    }
    return errs;
  }
  return { html, mount, play, check, COL, ROW };
})();
