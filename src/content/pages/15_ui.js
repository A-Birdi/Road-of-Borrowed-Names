/* The Pages We Keep, made visible: the four companion mementos (Shared
 * Journey keepsakes with pixel art), the finished page pinned up in an
 * existing place in Reedwake, the Journey page that shows the project, a
 * small shared-page panel on Company's Companion page, and the Lantern Hall's
 * automatic offers (each at most once; afterwards: talk to your companion).
 * Player-written text (a pet's name) is always escaped plain text. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const PG = RB.pages;
  const J = (jp, en) => ({ jp, en });

  // ---- pixel art: a 16×16 drawing, scaled up by whole pixels, never blurred ----------------------
  const INK = '#2a2420', PAPER = '#f4ecd8', PAPER2 = '#e2d6b8', SHADE = '#c9b994';
  const ART = {
    // Nao: a folded route card — ochre band, a dotted route with an arrow, the fold down the middle
    nao(R) {
      R(2, 3, 12, 10, SHADE); R(2, 2, 12, 10, PAPER); R(8, 2, 6, 10, PAPER2); R(8, 2, 1, 10, SHADE);
      R(2, 2, 12, 2, '#c8962e'); R(2, 3, 12, 1, '#a8781e');
      for (const [x, y] of [[3, 10], [4, 9], [5, 9], [6, 8], [7, 7], [9, 7], [10, 6], [11, 6]]) R(x, y, 1, 1, '#5a6a4a');
      R(12, 5, 1, 3, INK); R(11, 5, 3, 1, INK);
      R(3, 5, 3, 1, INK); R(3, 6, 2, 1, '#8a7a5a');
    },
    // Mio: a rest card with two cups and steam, a green border (her apron)
    mio(R) {
      R(2, 3, 12, 11, SHADE); R(2, 2, 12, 11, PAPER); R(2, 2, 12, 1, '#6a8a7a'); R(2, 12, 12, 1, '#6a8a7a'); R(2, 2, 1, 11, '#6a8a7a'); R(13, 2, 1, 11, '#6a8a7a');
      for (const x of [4, 9]) { R(x, 8, 4, 3, '#e8e0c8'); R(x, 8, 4, 1, '#8aa89a'); R(x + 1, 10, 2, 1, SHADE); R(x + 4, 9, 1, 1, '#8aa89a'); }
      R(5, 5, 1, 2, '#b8b0a0'); R(6, 4, 1, 2, '#b8b0a0'); R(10, 5, 1, 2, '#b8b0a0'); R(11, 4, 1, 2, '#b8b0a0');
      R(3, 11, 10, 1, '#a8906a');
    },
    // Ren: a lantern page — a lantern drawn in ink and gold, notes down the margin
    ren(R) {
      R(3, 2, 11, 12, SHADE); R(2, 1, 11, 12, PAPER); R(10, 1, 1, 12, '#c8b890');
      R(5, 3, 2, 1, INK); R(4, 4, 4, 1, '#3a3e6a'); R(4, 5, 4, 4, '#d8b060'); R(5, 6, 2, 2, '#f4d890'); R(4, 9, 4, 1, '#3a3e6a'); R(5, 10, 2, 1, INK);
      for (const y of [3, 5, 7, 9, 11]) R(11, y, 1, 1, INK);
      R(3, 11, 5, 1, '#8a7a5a');
    },
    // Suzu: a folded programme — a little curtained stage and her ribbon's pink
    suzu(R) {
      R(3, 3, 11, 11, SHADE); R(2, 2, 11, 11, PAPER);
      R(4, 4, 7, 5, '#3a2634'); R(4, 4, 2, 5, '#8a3a5a'); R(9, 4, 2, 5, '#8a3a5a'); R(4, 4, 7, 1, '#6a2a44');
      R(6, 7, 3, 2, '#e8c070');
      R(4, 10, 6, 1, INK); R(4, 11, 4, 1, '#8a7a5a');
      R(11, 1, 2, 5, '#c8a0a8'); R(12, 6, 1, 2, '#c8a0a8'); R(10, 1, 1, 1, '#a88088');
    },
  };
  function drawArt(which, target) {
    const g = target && target.getContext ? target.getContext('2d') : target;
    if (!g || !ART[which]) return;
    const cv = g.canvas || { width: 32, height: 32 };
    const k = Math.max(1, Math.floor(Math.min(cv.width, cv.height) / 16));
    const ox = Math.floor((cv.width - 16 * k) / 2), oy = Math.floor((cv.height - 16 * k) / 2);
    g.imageSmoothingEnabled = false;
    ART[which]((x, y, w, h, c) => { g.fillStyle = c; g.fillRect(ox + x * k, oy + y * k, w * k, h * k); });
  }

  // ---- the mementos: Shared Journey keepsakes, one per companion (only yours counts) ---------------
  const MEM = {
    nao: { name: J('{折|お}り{畳|たた}んだ {道順|みちじゅん} の {札|ふだ}', 'Folded Route Card'), desc: 'A route card Nao folded from one real outing on the unwritten roads, with a caption you chose together.' },
    mio: { name: J('お{茶|ちゃ} の {席|せき} の {札|ふだ}', 'Tea-Place Card'), desc: 'A small rest card Mio drew with two cups on it, from one real pause on the unwritten roads.' },
    ren: { name: J('{書|か}き{込|こ}み の ある {灯|ひ} の {頁|ページ}', 'Annotated Lantern Page'), desc: 'A lantern page you and Ren annotated together in the margin, from one real outing on the unwritten roads.' },
    suzu: { name: J('{幕間|まくあい} の {番付|ばんづけ}', 'Interval Programme'), desc: 'A little programme Suzu illustrated for a scene between adventures — one that really happened.' },
  };
  C.keepsakes = C.keepsakes || {};
  for (const c of PG.COMPS) {
    C.keepsakes['pages_' + c] = {
      name: MEM[c].name, desc: { en: MEM[c].desc }, region: 'reedwake', category: 'shared', comp: c,
      source: { kind: 'project', id: 'pages:' + c },
      art: (target) => drawArt(c, target),
      hint: { broad: { en: 'Something the two of you make together after the story, from a day on the unwritten roads.' },
        specific: { en: 'Talk with your companion in the Lantern Hall about keeping a page, then bring one moment home from an outing.' } },
    };
  }

  // ---- the finished page, pinned up in an existing place --------------------------------------------
  // A small card on the back wall (a wall tile: it adds no new obstacle and
  // changes no path). Shown only once that companion's page is finished.
  if (RB.props && RB.props.P) {
    const COL = { nao: ['#c8962e', '#5a6a4a'], mio: ['#6a8a7a', '#e8e0c8'], ren: ['#3a3e6a', '#d8b060'], suzu: ['#8a3a5a', '#c8a0a8'] };
    RB.props.P.pages_card = { id: 'pages_card', w: 1, h: 1, block: true, draw(c, x, y, p, t, o) {
      const col = COL[(o && o.kind) || 'nao'] || COL.nao;
      c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x + 5, y + 5, 8, 9);
      c.fillStyle = PAPER; c.fillRect(x + 4, y + 4, 8, 9);
      c.fillStyle = col[0]; c.fillRect(x + 4, y + 4, 8, 2);
      c.fillStyle = col[1]; c.fillRect(x + 6, y + 8, 4, 2);
      c.fillStyle = INK; c.fillRect(x + 5, y + 11, 5, 1); c.fillRect(x + 7, y + 3, 2, 2);
    } };
    const pa = RB.propArt, K = RB.propKit;
    if (pa && K) {
      pa.art('pages_card', {
        box: [0, 0, 32, 32],
        v: (o) => Math.max(0, PG.COMPS.indexOf((o && o.kind) || 'nao')),
        draw(g, M, v) {
          const R = K.R;
          const w = PG.COMPS[v] || 'nao';
          R(g, 9, 9, 17, 19, 'rgba(0,0,0,0.28)');
          R(g, 7, 7, 17, 19, PAPER);
          R(g, 7, 7, 17, 1, '#fffaf0');
          const k = { x0: 8, y0: 9 };
          // the memento itself, drawn small on the card
          ART[w]((x, y, ww, hh, col) => R(g, k.x0 + Math.round(x * 15 / 16), k.y0 + Math.round(y * 15 / 16), Math.max(1, Math.round(ww * 15 / 16)), Math.max(1, Math.round(hh * 15 / 16)), col));
          R(g, 14, 4, 3, 3, '#b84a3a'); R(g, 15, 5, 1, 1, '#f0a090'); // the pin
        },
      });
    }
  }
  const wallCard = (kind, x, y) => ({ p: 'pages_card', x, y, o: { kind }, if: 'comp=' + kind + '&keepsake.pages_' + kind, scene: 'pages.display' });
  if (C.maps['rw.hall']) {
    const m = C.maps['rw.hall'];
    m.props = (m.props || []).concat([wallCard('nao', 7, 1), wallCard('ren', 2, 1)]);
    // offered automatically at most once each; afterwards they wait to be asked for
    // (talk to your companion). Only after Tsuru has introduced the Atlas, and
    // never straight after another of these conversations.
    m.onEnter = (m.onEnter || []).concat([
      { scene: 'pages.enter_retro', if: 'post&pages.retro&seen.rw.atlas_intro' },
      { scene: 'pages.enter_unfinished', if: 'post&pages.unfinished&seen.rw.atlas_intro' },
      { scene: 'pages.enter_offer', if: 'post&pages.offer&seen.rw.atlas_intro&!pages.fresh' },
    ]);
  }
  if (C.maps['rw.tea']) {
    const m = C.maps['rw.tea'];
    m.props = (m.props || []).concat([wallCard('mio', 4, 1), wallCard('suzu', 5, 1)]);
  }

  // ---- the Journey page -------------------------------------------------------------------------------
  const esc = (t) => RB.util.esc(t);
  const jh = (t) => (t ? RB.ui.jhtml(t) : '');
  const I = (n) => RB.ui.folio.icon(n);
  const chr = (id) => RB.content.chars[id];
  function canvasFor(c, px) {
    if (typeof document === 'undefined') return null;
    const cv = document.createElement('canvas');
    cv.width = cv.height = px;
    cv.style.cssText = 'width:' + px + 'px;height:' + px + 'px;image-rendering:pixelated;display:block;margin:0.4em 0';
    cv.setAttribute('role', 'img');
    cv.setAttribute('aria-label', MEM[c].name.en);
    drawArt(c, cv);
    return cv;
  }
  function petText(pet) {
    if (!pet) return '';
    const sp = RB.pets && RB.pets.species ? RB.pets.species(pet.species) : null;
    const label = sp && sp.label ? sp.label.en : pet.species;
    return (pet.name ? esc(pet.name) + ' (' + esc(label) + ')' : esc(label)) + ' was with you.';
  }
  const row = (icon, t, sub) => '<li class="entry"><span class="mark">' + I(icon) + '</span><div><div class="t">' + t + '</div>' + (sub ? '<div class="muted small">' + sub + '</div>' : '') + '</div></li>';
  function statusHtml(s) {
    const c = s.comp, P = PG.PROJECT[c], p = PG.state(s), name = chr(c) ? chr(c).name.en : c;
    const pend = PG.pending(s, 'hall');
    let h = '<h3>' + jh(P.title.jp) + ' <span class="en">' + esc(P.title.en) + '</span></h3>' +
      '<p class="muted small">A page you and ' + esc(name) + ' keep from one real day on the unwritten roads. Optional, finite, and never in a hurry.</p><ul class="entries">';
    if (!p) h += row('note', 'Page I — What Shall We Keep?', esc(name) + ' would like to start one. Talk to ' + esc(name) + ' in the Lantern Hall whenever you like.');
    else {
      h += row('done', 'Page I — What Shall We Keep?', jh(P.themes[p.theme].jp) + ' <span class="en">' + esc(P.themes[p.theme].en) + '</span>');
      const ev = p.ev;
      if (!ev) h += row('journey', 'Page II — A Moment Worth Keeping', 'On your next outing, anything you mend or answer on the road can become this page.' + (p.lastEmpty ? ' (The last road set you home before anything happened. There will be another.)' : ''));
      else {
        const route = [];
        const A = C.atlas || {};
        if (ev.mods && ev.mods.length) route.push(ev.mods.map((m) => (A.modifiers && A.modifiers[m] ? A.modifiers[m].name.en : m)).join(' + '));
        else route.push('a quiet road');
        if (ev.branch && A.branchTypes && A.branchTypes[ev.branch]) route.push(A.branchTypes[ev.branch].name.en);
        const ret = PG.retOf(s);
        const sub = 'You ' + esc(ev.desc.en) + '. Route: ' + esc(route.join(', ')) + '.' + (ret ? ' ' + esc(PG.RET[ret].en) + '.' : ' (You are still out on that road.)') + (ev.pet ? ' ' + petText(ev.pet) : '');
        h += row(p.stage >= 2 ? 'done' : 'journey', 'Page II — A Moment Worth Keeping', jh(ev.title.jp) + ' <span class="en">' + esc(ev.title.en) + '</span><div class="muted small">' + sub + '</div>' +
          (p.stage >= 2 ? '<div class="small">To keep: ' + esc(P.aspects[p.aspect].en) + '</div>' : ''));
      }
      if (p.stage >= 3) {
        const cap = P.captions[p.theme][p.caption];
        h += row('done', 'Page III — Put It Somewhere Real', '“' + jh(cap.jp) + '” <span class="en">' + esc(cap.en) + '</span><div class="muted small">Pinned up on ' + esc(P.place.en) + '. The ' + esc(MEM[c].name.en) + ' is in your keepsakes (Shared Journey).</div>');
      } else h += row('note', 'Page III — Put It Somewhere Real', p.stage === 2 ? 'Once you are home from that road, finish it together.' : 'After the moment is written, you finish it together at home.');
    }
    h += '</ul>';
    if (pend && /offer|home2|home3/.test(pend.id)) h += '<p class="note-slip">' + I('companion') + ' Waiting: ' + esc(pend.en) + ' — talk to ' + esc(name) + ' in the Lantern Hall.</p>';
    if (p && p.stage >= 3) h += '<p class="muted small">' + I('companion') + ' The page is finished. ' + esc(name) + ' still likes to talk about the road — at a camp, or back at the Lantern Hall after an outing.</p>';
    return h;
  }
  if (RB.ui && RB.ui.menu && RB.ui.menu.addPage) {
    RB.ui.menu.addPage('journey', {
      id: 'pages', en: 'The Pages We Keep', icon: 'book',
      available: (s) => !!(s && s.comp && PG.PROJECT[s.comp] && (PG.state(s) || PG.offerOpen(s))),
      render(A, B, two, api) {
        const s = api.s, c = s.comp, p = PG.state(s);
        const wrap = RB.ui.el('div', 'pages-page');
        wrap.innerHTML = statusHtml(s);
        A.appendChild(wrap);
        const side = two ? B : A;
        if (p && p.stage >= 3) {
          const box = RB.ui.el('div', 'pages-memento');
          const cap = PG.PROJECT[c].captions[p.theme][p.caption];
          box.innerHTML = '<h4>' + I('keepsake') + ' ' + jh(MEM[c].name.jp) + ' <span class="en">' + esc(MEM[c].name.en) + '</span></h4>';
          const cv = canvasFor(c, 96);
          if (cv) box.appendChild(cv);
          box.insertAdjacentHTML('beforeend', '<p>“' + jh(cap.jp) + '”</p><p class="en small">' + esc(cap.en) + '</p><p class="muted small">' + esc(MEM[c].desc) + '</p>');
          side.appendChild(box);
        } else if (two) B.innerHTML = '<p class="muted">The finished page will appear here.</p>';
      },
    });
  }

  // ---- Company: a small shared page on the Companion page (whoever draws that page) ---------------
  if (RB.ui && RB.ui.company && RB.ui.company.pages && RB.ui.company.pages.companion) {
    const base = RB.ui.company.pages.companion;
    RB.ui.company.addPage(Object.assign({}, base, {
      render(A, B, two, api) {
        base.render(A, B, two, api);
        try {
          const s = api.s, p = PG.state(s);
          if (!p) return;
          const c = s.comp, P = PG.PROJECT[c];
          const box = RB.ui.el('div', 'pages-shared note-slip');
          const cap = p.stage >= 3 ? P.captions[p.theme][p.caption] : null;
          box.innerHTML = '<div class="t">' + I('book') + ' ' + jh(P.title.jp) + ' <span class="en">' + esc(P.title.en) + '</span></div>' +
            (cap ? '<div class="small">“' + jh(cap.jp) + '” <span class="en">' + esc(cap.en) + '</span></div>' : '<div class="small muted">Page ' + ['I', 'II', 'III'][Math.min(2, p.stage)] + ' is next, whenever you are both ready.</div>') +
            '<div class="row-acts"><button class="pbtn" data-pages-open>' + I('next') + 'The Pages We Keep</button></div>';
          if (cap) { const cv = canvasFor(c, 48); if (cv) box.insertBefore(cv, box.firstChild.nextSibling); }
          A.appendChild(box);
          const btn = box.querySelector('[data-pages-open]');
          if (btn) btn.onclick = () => api.go('journey', 'pages');
        } catch (e) { /* the companion page stands on its own */ }
      },
    }));
  }

  RB.pages.drawArt = drawArt;
  RB.pages.MEM = MEM;
})(RB.content);
