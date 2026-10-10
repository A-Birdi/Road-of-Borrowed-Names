/* Barge routing's canal map (expansion P08; plan 07_REGIONS.md R1, 05_LANGUAGE.md L9): a forged sentence that sends
 * a barge (a forge step with `canal: <id>`) shows the canals above the task, and whatever is said, right or wrong,
 * the barge goes where that sentence sends it. The language is judged exactly as for any forge step (the challenge
 * screen, src/ui/65_challenge.js); this only shows the consequence: the route of the family the answer matched
 * (its `result`), drawn and travelled, and a line saying where the barge ended up. Nothing here is timed or
 * changes the result; with reduced motion the barge simply appears at the end of its route.
 *
 * A canal (RB.content.canals[id]): { vb: [w, h], water: [[x, y, w, h]], bridges: [{ id, x, y, w, h, name: { jp, en } }],
 *   places: { key: { x, y, jp, en } }, start: key, routes: { <result>: { path: [[x, y]…], to: key | null,
 *   say: { en } } } }. A bridge's name shows once its plaque reads again (flag mb_pl_<id>); until then, a "?". */
var RB = (globalThis.RB = globalThis.RB || {});
RB.ui = RB.ui || {};

RB.ui.canal = (function () {
  'use strict';
  const esc = (s) => RB.util.esc(String(s == null ? '' : s));
  const named = (b) => { const s = RB.game && RB.game.s; return !!(s && s.flags && s.flags['mb_pl_' + b.id]); };
  const still = () => !!(RB.game && RB.game.reducedMotion && RB.game.reducedMotion());
  const def = (step) => (RB.content.canals || {})[step.canal] || null;
  // the barge: a small boat shape, drawn at the origin and moved by a transform
  const BARGE = '<g class="cn-barge"><path d="M-7 -2 L6 -2 L8 0 L6 2 L-7 2 Z" fill="#7e5a3e" stroke="#2a2024" stroke-width="0.8"/><rect x="-4" y="-4" width="7" height="2.6" fill="#c6a150" stroke="#6a5022" stroke-width="0.5"/></g>';

  function html(step) {
    const d = def(step);
    if (!d) return '';
    const [W, H] = d.vb;
    const pct = (x, y) => 'left:' + ((x / W) * 100).toFixed(2) + '%;top:' + ((y / H) * 100).toFixed(2) + '%';
    let svg = '<svg class="cn-svg" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">';
    svg += '<rect width="' + W + '" height="' + H + '" fill="#efe6cc"/>';
    for (const [x, y, w, h] of d.water) svg += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#6a9a94" stroke="#3a6e6a" stroke-width="0.6"/>';
    for (const b of d.bridges || []) svg += '<rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h + '" fill="' + (named(b) ? '#7e5a3e' : '#b8ae98') + '" stroke="#2a2024" stroke-width="0.6"/>';
    for (const k in d.places) { const p = d.places[k]; svg += '<rect x="' + (p.x - 3) + '" y="' + (p.y - 3) + '" width="6" height="6" fill="#f6f2e6" stroke="#2a2024" stroke-width="0.8"/>'; }
    svg += '<path class="cn-trail" d="" fill="none" stroke="#a8462e" stroke-width="1.1" stroke-dasharray="2 1.5"/>';
    svg += BARGE + '</svg>';
    const labels = Object.keys(d.places).map((k) => { const p = d.places[k]; return '<span class="cn-lab cn-place" data-k="' + esc(k) + '" style="' + pct(p.x, p.y + 4) + '"><span class="jp" lang="ja">' + RB.ui.jhtml(p.jp) + '</span></span>'; }).join('') +
      (d.bridges || []).map((b) => '<span class="cn-lab cn-bridge' + (named(b) ? '' : ' blank') + '" style="' + pct(b.x + b.w / 2, b.y - 1) + '">' + (named(b) ? '<span class="jp" lang="ja">' + RB.ui.jhtml(b.name.jp) + '</span>' : '<span aria-label="a bridge whose plaque is blank">？</span>') + '</span>').join('');
    const names = Object.keys(d.places).map((k) => d.places[k].en).join(', ');
    return '<figure class="cn" data-canal="' + esc(step.canal) + '"><div class="cn-map" role="img" aria-label="' + esc('A map of the canals: ' + names + '. The barge starts at ' + d.places[d.start].en + '.') + '">' + svg + labels + '</div>' +
      '<figcaption class="cn-say muted small" aria-live="polite">The barge waits at ' + esc(d.places[d.start].en) + '.</figcaption></figure>';
  }
  // place the canal above the task; `at` keeps where the barge was (the context is redrawn when English is shown)
  function mount(el, step, at) {
    const d = def(step);
    if (!d || !el) return;
    el.insertAdjacentHTML('afterbegin', html(step));
    const fig = el.querySelector('.cn');
    const p = at && at.end ? at.end : d.places[d.start];
    move(fig, p.x, p.y, 0);
    if (at && at.path) trail(fig, at.path);
    if (at && at.say) fig.querySelector('.cn-say').textContent = at.say;
  }
  function move(fig, x, y, ang) { const b = fig && fig.querySelector('.cn-barge'); if (b) b.setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ') rotate(' + (ang || 0).toFixed(1) + ')'); }
  function trail(fig, path) { const t = fig.querySelector('.cn-trail'); if (t) t.setAttribute('d', path.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ')); }
  // the route a family's result takes; null when the canal has none for it (nothing is shown)
  function routeOf(step, fi) {
    const d = def(step), f = (step.families || [])[fi];
    return d && f && f.result && d.routes[f.result] ? d.routes[f.result] : null;
  }
  // travel the route of the family answered (index into step.families); returns what to remember for a redraw
  function play(el, step, fi) {
    const d = def(step), r = routeOf(step, fi), fig = el && el.querySelector('.cn');
    if (!d || !r || !fig) return null;
    const path = r.path, say = r.say ? r.say.en : '';
    const end = { x: path[path.length - 1][0], y: path[path.length - 1][1] };
    fig.classList.remove('cn-ok', 'cn-wrong');
    trail(fig, [path[0]]);
    const fin = () => {
      trail(fig, path); move(fig, end.x, end.y, 0);
      fig.classList.add((step.families[fi] || {}).ok ? 'cn-ok' : 'cn-wrong');
      const cap = fig.querySelector('.cn-say'); if (cap) cap.textContent = say;
      fig.querySelectorAll('.cn-place').forEach((n) => n.classList.toggle('cn-here', n.dataset.k === r.to));
    };
    if (still() || typeof requestAnimationFrame === 'undefined') { fin(); return { end, path, say }; }
    // constant speed along the polyline
    const seg = []; let total = 0;
    for (let i = 1; i < path.length; i++) { const L = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); seg.push(L); total += L; }
    const dur = Math.min(2200, 500 + total * 14), t0 = performance.now();
    const step1 = (now) => {
      if (!fig.isConnected) return;
      let dist = Math.min(1, (now - t0) / dur) * total, i = 0;
      while (i < seg.length - 1 && dist > seg[i]) { dist -= seg[i]; i++; }
      const a = path[i], b = path[i + 1], k = seg[i] ? dist / seg[i] : 1;
      const x = a[0] + (b[0] - a[0]) * k, y = a[1] + (b[1] - a[1]) * k;
      move(fig, x, y, (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI);
      trail(fig, path.slice(0, i + 1).concat([[x, y]]));
      if (now - t0 < dur) requestAnimationFrame(step1); else fin();
    };
    requestAnimationFrame(step1);
    return { end, path, say };
  }
  // every result a canal's step names has a route, and every route ends at a place or says where it went
  function check(C) {
    const errs = [];
    for (const id in C.challenges || {}) {
      const ch = C.challenges[id];
      for (const tier of Object.values(ch.tiers || {})) for (const st of tier) {
        if (!st.canal) continue;
        const d = (C.canals || {})[st.canal];
        if (!d) { errs.push(id + ': no canal ' + st.canal); continue; }
        for (const f of st.families || []) {
          if (!f.result || !d.routes[f.result]) errs.push(id + ' ' + st.id + ': the reply "' + f.en + '" has no route (' + f.result + ')');
          else if (d.routes[f.result].to && !d.places[d.routes[f.result].to]) errs.push(st.canal + ': route ' + f.result + ' ends at an unknown place');
        }
      }
    }
    return errs;
  }
  return { html, mount, play, routeOf, check };
})();
