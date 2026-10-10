/* The Wayfarer's Ledger's Distractions tab (expansion P06, K7, K10): one page per pastime the traveller has met
 * (RB.pastimes, src/engine/72c_pastimes.js), each drawn round a piece of key art made in code: what the game is, how
 * to play it, where it is played, your own records (never ranked, never a currency), and Play with your companion
 * where the two of you can play it now. A place's game says where to find it instead. Twelve-chapter journeys only
 * (F-21); in them the companion's games are offered here rather than on Company (K7).
 *   Two pages on a wide screen (the index, the chosen game); one on a phone, with a way back to the index. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.distractions = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => RB.ui.folio.icon(n);
  const J = (x) => (x && x.jp ? RB.ui.jhtml(x.jp) : '');
  const P = () => RB.pastimes;
  const compOf = (s) => (s.comp && RB.content.chars[s.comp] ? RB.content.chars[s.comp] : null);
  const SAFE_WHY = {
    apart: 'Your companion is not with you just here.', danger: 'Not with a creature this close.',
    busy: 'Not just now.', none: 'Not just now.',
  };

  // ---- key art: drawn in code, no text in it (every kanji on screen carries its reading) ----------------------------
  const ART = {
    shogi: (w, h) => {
      // a board's corner in wood, its lines, and a few pieces, one of them promoted (red)
      const cell = h / 4;
      let g = '<rect x="0" y="0" width="' + w + '" height="' + h + '" fill="#e6c27e"/><rect x="0" y="0" width="' + w + '" height="' + h + '" fill="url(#ds-grain)" opacity="0.35"/>';
      for (let x = cell * 0.6; x < w; x += cell) g += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="' + h + '" stroke="#5b3b16" stroke-width="1.2"/>';
      for (let y = cell * 0.5; y < h; y += cell) g += '<line x1="0" y1="' + y + '" x2="' + w + '" y2="' + y + '" stroke="#5b3b16" stroke-width="1.2"/>';
      const pc = (cx, cy, s, flip, red) => {
        const pts = flip ? [[-0.42, -0.5], [0.42, -0.5], [0.5, 0.36], [0, 0.5], [-0.5, 0.36]] : [[0, -0.5], [0.42, -0.36], [0.5, 0.5], [-0.5, 0.5], [-0.42, -0.36]];
        return '<polygon points="' + pts.map(([px, py]) => (cx + px * s).toFixed(1) + ',' + (cy + py * s * 1.1).toFixed(1)).join(' ') + '" fill="#f6e3b4" stroke="#7a5a2a" stroke-width="1"/>' +
          // an ink stroke or two, a brush's gesture rather than a character
          '<path d="M' + (cx - s * 0.17) + ' ' + (cy - s * 0.08) + ' q' + s * 0.17 + ' ' + (-s * 0.1) + ' ' + s * 0.34 + ' ' + s * 0.02 + ' M' + (cx - s * 0.12) + ' ' + (cy + s * 0.14) + ' q' + s * 0.12 + ' ' + s * 0.07 + ' ' + s * 0.24 + ' ' + (-s * 0.02) + '" fill="none" stroke="' + (red ? '#a51d12' : '#1d140a') + '" stroke-width="' + Math.max(1.3, s * 0.06) + '" stroke-linecap="round"/>';
      };
      g += pc(cell * 1.1, cell * 1.0, cell * 0.8, true) + pc(cell * 3.1, cell * 1.0, cell * 0.8, true, true) + pc(cell * 2.1, cell * 3.0, cell * 0.8) + pc(w - cell * 1.9, cell * 2.0, cell * 0.8) + pc(w - cell * 0.9, cell * 3.0, cell * 0.8);
      return g;
    },
    shiritori: (w, h) => {
      // a chain of words winding across the page, each link a stone
      const words = ['しりとり', 'りんご', 'ごりら', 'らっぱ', 'ぱん'];
      let g = '<rect width="' + w + '" height="' + h + '" fill="#efe2c4"/>';
      const n = words.length, pts = words.map((x, i) => [w * (0.1 + 0.8 * i / (n - 1)), h * (i % 2 ? 0.66 : 0.36)]);
      g += '<path d="M' + pts.map(([x, y]) => x.toFixed(1) + ' ' + y.toFixed(1)).join(' L') + '" fill="none" stroke="#8a2a5a" stroke-width="2" stroke-dasharray="4 4"/>';
      words.forEach((wd, i) => {
        const [x, y] = pts[i], r = Math.min(h * 0.2, w * 0.08);
        g += '<ellipse cx="' + x + '" cy="' + y + '" rx="' + r * 1.5 + '" ry="' + r + '" fill="#fbf4e2" stroke="' + (i === n - 1 ? '#a51d12' : '#8a2a5a') + '" stroke-width="1.6"/>' +
          '<text x="' + x + '" y="' + (y + r * 0.35) + '" text-anchor="middle" font-size="' + (r * 0.9).toFixed(1) + '" fill="#3a2410" lang="ja">' + wd + '</text>';
      });
      return g;
    },
    fishing: (w, h) => {
      // still water, a rod's line and float, and the rings it makes
      let g = '<defs><linearGradient id="ds-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bcd6d0"/><stop offset="1" stop-color="#7fa9a6"/></linearGradient></defs>' +
        '<rect width="' + w + '" height="' + h + '" fill="url(#ds-water)"/>';
      for (let i = 0; i < 6; i++) g += '<path d="M' + (w * (0.05 + i * 0.16)) + ' ' + (h * (0.3 + (i % 3) * 0.2)) + ' q' + w * 0.03 + ' -4 ' + w * 0.06 + ' 0" stroke="#e8f2ee" stroke-width="1.4" fill="none" opacity="0.8"/>';
      const fx = w * 0.62, fy = h * 0.62;
      g += '<path d="M' + w * 0.02 + ' ' + h * 0.04 + ' Q' + w * 0.45 + ' ' + h * 0.0 + ' ' + fx + ' ' + (fy - 10) + '" stroke="#3a2a1a" stroke-width="1.2" fill="none"/>' +
        [1, 2, 3].map((k) => '<ellipse cx="' + fx + '" cy="' + fy + '" rx="' + 10 * k + '" ry="' + 3.4 * k + '" fill="none" stroke="#f4faf8" stroke-width="1.2" opacity="' + (0.9 - k * 0.22) + '"/>').join('') +
        '<path d="M' + fx + ' ' + (fy - 10) + 'v8" stroke="#a51d12" stroke-width="3" stroke-linecap="round"/>';
      return g;
    },
    hanafuda: (w, h) => {
      // a few cards fanned on a dark red cloth: the crane, the curtain, the moon, the boar, the phoenix
      const HC = RB.ui.hanafudaCards;
      let g = '<rect width="' + w + '" height="' + h + '" fill="#6e1f1a"/><rect width="' + w + '" height="' + h + '" fill="url(#ds-grain)" opacity="0.18"/>';
      if (!HC || !RB.hanafuda) return g;
      g += '<defs><clipPath id="hf-clip"><rect width="' + HC.W + '" height="' + HC.H + '" rx="4"/></clipPath></defs>';
      const ch = h * 0.86, cw = ch * HC.W / HC.H, ids = ['c01', 'c09', 'c29', 'c25', 'c45'];
      ids.forEach((id, i) => {
        const a = (i - 2) * 11, x = w / 2 + (i - 2) * cw * 0.62 - cw / 2, y = h * 0.1 + Math.abs(i - 2) * 3;
        g += '<g transform="rotate(' + a + ' ' + (x + cw / 2) + ' ' + (y + ch) + ')">' + HC.svg(id).replace('<svg class="hf-svg"', '<svg x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + cw.toFixed(1) + '" height="' + ch.toFixed(1) + '"') + '</g>';
      });
      return g;
    },
  };
  function art(id, w, h, cls) {
    const f = ART[id];
    if (!f) return '';
    return '<svg class="' + cls + '" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
      '<defs><pattern id="ds-grain" width="12" height="6" patternUnits="userSpaceOnUse"><path d="M0 3 q3 -2 6 0 t6 0" stroke="#b08840" stroke-width="0.6" fill="none"/></pattern></defs>' + f(w, h) + '</svg>';
  }

  // ---- the pages ----------------------------------------------------------------------------------------------------
  const hideTotals = () => !!(RB.game.settings && RB.game.settings.hideTotals);
  function recordsOf(d, s) {
    let rows = [];
    try { rows = d.records ? d.records(s) || [] : []; } catch (e) { rows = []; }
    if (hideTotals()) rows = rows.filter((r) => !r.total);
    return rows;
  }
  function indexHtml(s, met, sel) {
    let h = '<p class="ds-intro">' + RB.ui.label('{遊|あそ}び', 'Games for a quiet moment') + '</p><p class="small muted">Records here are yours alone: never ranked, and nothing in the story needs a win.</p>';
    if (!met.length) return h + '<p class="muted">No games yet. You will meet them on the road.</p>';
    h += '<ul class="ds-list" role="list">';
    for (const d of met) {
      const r = recordsOf(d, s)[0];
      h += '<li><button type="button" class="ds-item' + (d.id === sel ? ' on' : '') + '" data-ds="' + d.id + '"' + (d.id === sel ? ' aria-current="true"' : '') + '>' + art(d.art, 64, 48, 'ds-thumb') +
        '<span class="ds-it"><span class="ds-t">' + J(d.title) + ' <span class="en">' + esc(d.title.en) + '</span></span>' + (r ? '<span class="small muted">' + esc(r.en + ': ' + r.value) + '</span>' : '') + '</span></button></li>';
    }
    return h + '</ul>';
  }
  function playBlock(d, s) {
    const comp = compOf(s);
    if (d.id === 'shiritori') return comp && RB.ui.wordplay && RB.ui.wordplay.card ? RB.ui.wordplay.card(s, s.comp, {}) : '<p class="muted">Shiritori is played with a companion.</p>';
    if (d.id === 'fishing') {
      // the Journey's Fishing notes open once there is something in them (or the survey has begun)
      const notes = !!(s.flags && s.flags.postgame) || (RB.fishing && RB.fishing.distinct(s) > 0);
      return notes ? '<div class="ds-acts"><button type="button" class="pbtn" data-ds-act="notes">' + I('book') + 'Open your Fishing notes</button></div>' : '';
    }
    if (!d.activity || !d.companion) return '';
    if (!comp) return '<p class="muted small">Travelling alone, it is played where the page says.</p>';
    const el = RB.activity.eligible(d.activity, { source: 'distractions' });
    const why = el.ok ? '' : SAFE_WHY[el.why] || el.why || 'Not just now.';
    return '<div class="ds-acts"><button type="button" class="pbtn primary" data-ds-act="play"' + (el.ok ? '' : ' disabled aria-describedby="ds-why"') + '>' + I('pastimes') + 'Play with ' + esc(comp.name.en) + '</button></div>' +
      (why ? '<p class="muted small" id="ds-why">' + esc(why) + ' The page can always be read.</p>' : '');
  }
  function pageHtml(d, s, back) {
    let h = (back ? '<button type="button" class="pbtn quiet ds-back" data-ds-act="index">' + I('back') + 'All games</button>' : '') +
      '<article class="ds-page" aria-label="' + esc(d.title.en) + '"><figure class="ds-art">' + art(d.art, 320, 110, 'ds-banner') + '</figure>' +
      '<h3 class="ds-h">' + J(d.title) + ' <span class="en">' + esc(d.title.en) + '</span></h3>';
    if (d.blurb) h += '<p class="ds-blurb">' + J(d.blurb) + '<span class="en">' + esc(d.blurb.en) + '</span></p>';
    h += playBlock(d, s);
    if (d.howto && d.howto.length) h += '<h4>' + RB.ui.label('{遊|あそ}び{方|かた}', 'How to play') + '</h4><ol class="ds-how">' + d.howto.map((x) => '<li>' + J(x) + '<span class="en">' + esc(x.en) + '</span></li>').join('') + '</ol>';
    if (d.venue || d.anywhere) {
      h += '<h4>' + RB.ui.label('{場所|ばしょ}', 'Where') + '</h4>';
      if (d.venue) h += '<p class="ds-where">' + J(d.venue) + '<span class="en">' + esc(d.venue.en) + '</span></p>';
      if (d.anywhere) h += '<p class="ds-where">' + J(d.anywhere) + '<span class="en">' + esc(d.anywhere.en) + '</span></p>';
    }
    const rows = recordsOf(d, s);
    h += '<h4>' + RB.ui.label('{記録|きろく}', 'Your records') + '</h4>' + (rows.length ? '<dl class="ds-rec">' + rows.map((r) => '<div><dt>' + esc(r.en) + '</dt><dd>' + esc(String(r.value)) + '</dd></div>').join('') + '</dl>' : '<p class="muted small">Nothing yet: records start with your first game.</p>');
    return h + '</article>';
  }

  // ---- the tab ------------------------------------------------------------------------------------------------------
  function render(A, B, two, api) {
    const s = api.s, v = api.view;
    const met = P().met(s);
    if (v.page && !met.some((d) => d.id === v.page)) v.page = null;
    const sel = v.page || (two && met[0] ? met[0].id : null);
    const d = sel ? P().get(sel) : null;
    if (two) { A.innerHTML = indexHtml(s, met, sel); B.innerHTML = d ? pageHtml(d, s, false) : ''; }
    else A.innerHTML = d ? pageHtml(d, s, true) : indexHtml(s, met, null);
    for (const el of [A, B]) el.onclick = (e) => click(e, s, api, d);
  }
  async function click(e, s, api, d) {
    const wp = e.target.closest('[data-co-sec="wordplay"]');
    if (wp && !wp.disabled && RB.ui.wordplay && RB.ui.wordplay.cardClick) { await RB.ui.wordplay.cardClick(wp, s, api, 'distractions'); return; }
    const it = e.target.closest('[data-ds]');
    if (it) { api.view.page = it.dataset.ds; api.render(); if (!api.two) { const L = document.querySelector('#folio-page .leaf'); if (L) L.scrollTop = 0; } return; }
    const b = e.target.closest('[data-ds-act]');
    if (!b || b.disabled) return;
    const act = b.dataset.dsAct;
    if (act === 'index') { api.view.page = null; api.render(); return; }
    if (act === 'notes') { api.go('journey', 'fishing'); return; }
    if (act === 'play' && d && d.activity) {
      const r = await RB.activity.launch(d.activity, { source: 'distractions' });
      if (r && !r.ok && r.why && r.why !== 'The campaign changed.') RB.ui.notice(r.why, 'info');
    }
  }
  if (RB.ui.menu && RB.ui.menu.addSection) {
    RB.ui.menu.addSection({
      id: 'distractions', en: 'Distractions', jp: '{遊|あそ}び', icon: 'pastimes',
      available: (s) => !!(RB.recordsUI && RB.recordsUI.inCampaign(s)),
      render,
      // Back on a phone: from a game's page to the index first
      back: (api) => { if (api.view.page && !api.two) { api.view.page = null; api.render(); return true; } return false; },
      sub: (v, sub) => { v.page = sub || v.page || null; },
    });
  }
  return { ART, render };
})();
