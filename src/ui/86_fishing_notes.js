/* A Quiet Cast — Fishing notes, a Journey page (Practice addendum §8.1): a
 * peaceful-observation catalogue, not a list of kills. For each of the nine:
 * the name and reading, the original drawing, the survey line, where it was
 * first seen and who was there, and (optionally) how many times — counts
 * follow the existing "counts" setting (settings.keepsakeCounts). A fish not
 * yet seen shows the same plain outline as every other (nothing spoiled) and,
 * only on request, a broad hint at the waters it lives in.
 *
 * Also: Yasu's survey line, the rod ribbon (on/off: it only changes the rod in
 * fishing), the framed waterside illustration, the nine-fish spread, and the
 * Practice mementos source (RB.practice.addMementoSource; suite A renders it).
 *
 *   RB.ui.fishingNotes.html(s, o) / paint(el)   (also used inside the activity) */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.fishingNotes = (function () {
  'use strict';
  const esc = RB.util.esc;
  const F = RB.fishing;
  const I = (n) => RB.ui.folio.icon(n);
  const J = (t) => (t ? RB.ui.jhtml(t) : '');
  const T = (k) => F.text(k);
  const L = (k) => '<span class="jt-wrap">' + J(T(k).jp) + '</span> <span class="en">' + esc(T(k).en) + '</span>';
  const view = { sel: null, spread: false, hints: {} };
  const showCounts = () => RB.game.settings.keepsakeCounts !== false;

  function firstLine(s, e) {
    if (!e.first) return '';
    const f = e.first, S = F.site(f.site), P = S ? F.patchOf(f.site, f.patch) : null;
    const who = [];
    if (f.comp && RB.content.chars[f.comp]) who.push(RB.content.chars[f.comp].name.en);
    if (f.pet && f.pet.name) who.push(f.pet.name + ' the ' + ({ cat: 'cat', dog: 'dog', bird: 'small bird', tanuki: 'tanuki' }[f.pet.species] || 'pet'));
    return 'First seen at ' + (S ? S.name.en : 'a station') + (P ? ' (' + P.name.en.toLowerCase() + ')' : '') + (who.length ? ', with ' + who.join(' and ') : '') + '.';
  }
  function entryHtml(s, e) {
    if (e.unavailable) return '<div class="fn-detail"><p class="muted">An entry from another version of the game (' + esc(e.id) + '); kept, but it cannot be shown here.</p></div>';
    const d = e.def;
    if (!e.known) {
      const S = F.site(d.site);
      const h = view.hints[d.id];
      return '<div class="fn-detail"><div class="fn-plate" data-blank="1"></div><p class="fn-name">' + L('unseen') + '</p>' +
        (h ? '<p class="small">' + esc(d.hint.en) + (S ? ' (' + esc(S.name.en) + ')' : '') + '</p>' : '<button class="pbtn quiet" data-fn-hint="' + esc(d.id) + '">' + I('help') + 'A hint</button>') + '</div>';
    }
    return '<div class="fn-detail"><div class="fn-plate" data-plate="' + esc(d.id) + '"></div>' +
      '<p class="fn-name"><span lang="ja">' + esc(d.jp) + '</span> <span class="small muted">(' + esc(d.reading) + ', ' + esc(d.romaji) + ')</span> <span class="en">' + esc(d.en) + ' — ' + esc(d.common) + '</span></p>' +
      '<p class="small">' + J(d.survey.jp) + '<span class="en">' + esc(d.survey.en) + '</span></p>' +
      '<p class="muted small">' + esc(firstLine(s, e)) + (showCounts() ? ' Seen ' + e.count + ' time' + (e.count === 1 ? '' : 's') + '.' : '') + '</p></div>';
  }
  function html(s, o) {
    o = o || {};
    const A = F.st(s);
    const c = F.counts(s);
    const M = A.milestones;
    const list = F.entries(s);
    let h = '';
    if (!o.compact) h += '<h3>' + I('fish') + L('notes') + (showCounts() ? ' <span class="count">' + c.known + ' of ' + c.total + ' recorded</span>' : '') + '</h3>';
    h += '<p class="small">' + L('survey') + ': ' + (M.survey ? 'complete — three kinds recorded and left at the station for Yasu.' : M.intro ? (showCounts() ? c.survey + ' of 3 different fish recorded.' : 'three different fish to record.') : 'Yasu, on the Reedwake pier, has a small favour to ask (after the journey\'s end).') + '</p>';
    if (!o.compact) h += '<p class="muted small">Stations: the Reedwake riverbank below the bridge, the pond by the Lantern Road, the Saltglass quay. Every fish is let go into the same water.</p>';
    // the catalogue, by site (unseen: the same outline for all)
    h += '<div class="fn-grid">';
    for (const sid of F.SITE_ORDER) {
      const S = F.site(sid);
      h += '<div class="fn-site"><div class="fn-shead">' + J(S.name.jp) + ' <span class="en">' + esc(S.name.en) + '</span></div><div class="fn-cells">';
      for (const e of list.filter((x) => x.def && x.def.site === sid)) {
        const on = view.sel === e.id;
        h += '<button class="fn-cell' + (e.known ? '' : ' unseen') + (on ? ' on' : '') + '" data-fn-sel="' + esc(e.id) + '" aria-pressed="' + on + '">' +
          (e.known ? '<span class="fn-mini" data-plate="' + esc(e.id) + '" data-mini="1"></span><span lang="ja">' + esc(e.def.jp) + '</span>' : '<span class="fn-mini" data-blank="1" data-mini="1"></span><span class="muted">?</span>') + '</button>';
      }
      h += '</div></div>';
    }
    for (const e of list.filter((x) => x.unavailable)) h += '<p class="muted small">Kept from another version: ' + esc(e.id) + '.</p>';
    h += '</div>';
    const sel = list.find((e) => e.id === view.sel);
    if (sel && !o.noDetail) h += entryHtml(s, sel);
    // finite mementos: the ribbon, the framed illustration, the spread
    if (M.survey || M.frame || M.spread) {
      h += '<div class="fn-ms"><h4>' + I('keepsake') + 'Practice mementos</h4>';
      if (M.survey) h += '<p>' + L('ribbon') + ' — tied on the rod in fishing. <button class="pbtn small" data-fn-ribbon aria-pressed="' + F.ribbon(s) + '">' + (F.ribbon(s) ? 'Take it off' : 'Tie it on') + '</button></p>';
      if (M.frame) h += '<div class="fn-frame"><canvas class="fn-framecv" width="160" height="96" role="img" aria-label="A framed drawing of the waterside with the first six fish you recorded"></canvas><p>' + L('frame') + '</p></div>';
      if (M.spread) h += '<p>' + L('spread') + ' <button class="pbtn small" data-fn-spread aria-expanded="' + view.spread + '">' + (view.spread ? 'Close the spread' : 'Open the spread') + '</button>' +
        (M.reflection && (M.reflection.shared || M.reflection.solo) ? ' <span class="muted small">(looked back over' + (M.reflection.shared ? ' together' : '') + ')</span>' : '') + '</p>';
      h += '</div>';
      if (M.spread && view.spread) h += '<div class="fn-spread" role="group" aria-label="The nine-fish spread">' + F.FISH_ORDER.map((id) => '<figure><span class="fn-plate" data-plate="' + id + '"></span><figcaption lang="ja">' + esc(F.fish(id).jp) + '</figcaption></figure>').join('') + '</div>';
    }
    if (!o.compact) h += '<p class="muted small"><button class="pbtn small quiet" data-fn-counts>' + (showCounts() ? 'Hide counts' : 'Show counts') + '</button> (also Settings › Display)</p>';
    return h;
  }
  function plate(id, mini) {
    const d = F.fish(id);
    const cv = d ? RB.fishArt.canvas(d, { len: mini ? 30 : d.art.len, view: 'plate' }) : RB.fishArt.blankCanvas({ len: mini ? 30 : 64 });
    const c2 = document.createElement('canvas');
    c2.width = cv.width; c2.height = cv.height;
    c2.getContext('2d').drawImage(cv, 0, 0);
    c2.className = 'fp-art';
    c2.setAttribute('aria-hidden', 'true');
    return c2;
  }
  function paint(el) {
    el.querySelectorAll('[data-plate]').forEach((p) => { p.innerHTML = ''; p.appendChild(plate(p.dataset.plate, !!p.dataset.mini)); });
    el.querySelectorAll('[data-blank]').forEach((p) => { p.innerHTML = ''; p.appendChild(plate(null, !!p.dataset.mini)); });
    el.querySelectorAll('.fn-framecv').forEach((c) => drawFrame(c, RB.game.s));
  }
  // the framed waterside illustration: the first six fish you recorded, in a frame
  function drawFrame(c, s) {
    const g = c.getContext('2d');
    if (!c.width) { c.width = 160; c.height = 96; }
    const W = c.width, H = c.height;
    g.imageSmoothingEnabled = false;
    g.fillStyle = '#6e4428'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#a06c42'; g.fillRect(3, 3, W - 6, H - 6);
    g.fillStyle = '#dff1ff'; g.fillRect(7, 7, W - 14, Math.round(H * 0.3));
    g.fillStyle = '#4f8a40'; g.fillRect(7, 7 + Math.round(H * 0.24), W - 14, 4);
    for (let y = 7 + Math.round(H * 0.3); y < H - 7; y++) { g.fillStyle = y < H * 0.6 ? '#6fb0c8' : '#4f93b3'; g.fillRect(7, y, W - 14, 1); }
    const A = s ? F.st(s) : null;
    const seen = A ? F.FISH_ORDER.filter((id) => A.observed[id]).sort((a, b) => (A.observed[a].first.cast || 0) - (A.observed[b].first.cast || 0)).slice(0, 6) : [];
    seen.forEach((id, i) => {
      const d = F.fish(id);
      const cv = RB.fishArt.canvas(d, { len: Math.min(30, d.stage + 6), view: 'side', facing: i % 2 ? 'right' : 'left' });
      const x = 12 + (i % 3) * Math.round((W - 24) / 3), y = Math.round(H * 0.38) + Math.floor(i / 3) * Math.round(H * 0.26);
      g.drawImage(cv, x, y);
    });
  }

  // ---- the Journey page ---------------------------------------------------------------------------------------------------
  if (RB.ui.menu && RB.ui.menu.addPage) {
    RB.ui.menu.addPage('journey', {
      id: 'fishing', en: 'Fishing notes', icon: 'fish',
      available: (s) => !!(s && ((s.flags && s.flags.postgame) || (s.practice && s.practice.fishing && Object.keys(s.practice.fishing.observed || {}).length))),
      render(A, B, two, api) {
        const s = api.s;
        A.insertAdjacentHTML('beforeend', '<div class="fn-page">' + html(s, { noDetail: two }) + '</div>');
        paint(A);
        if (two) {
          const sel = F.entries(s).find((e) => e.id === view.sel);
          B.innerHTML = '<div class="fn-page">' + (sel ? entryHtml(s, sel) : '<p class="muted">Choose a fish to read its entry. A fish you have not seen yet shows only the same plain outline as the others.</p>') + '</div>';
          paint(B);
        }
        const click = (e) => {
          const b = e.target.closest('[data-fn-sel],[data-fn-hint],[data-fn-ribbon],[data-fn-spread],[data-fn-counts]');
          if (!b) return;
          if (b.dataset.fnSel) view.sel = view.sel === b.dataset.fnSel ? null : b.dataset.fnSel;
          else if (b.dataset.fnHint) view.hints[b.dataset.fnHint] = true;
          else if (b.hasAttribute('data-fn-ribbon')) F.ribbon(s, !F.ribbon(s));
          else if (b.hasAttribute('data-fn-spread')) view.spread = !view.spread;
          else if (b.hasAttribute('data-fn-counts')) { RB.game.settings.keepsakeCounts = !showCounts(); try { RB.game.saveSettings && RB.game.saveSettings(); } catch (er) { /* settings save is best effort */ } }
          api.render();
        };
        A.querySelector('.fn-page').addEventListener('click', click);
        if (two) B.onclick = click;
      },
    });
  }

  // ---- Practice mementos (finite, cosmetic; never Roadside Keepsakes) --------------------------------------------------------
  RB.practice.addMementoSource({
    id: 'fishing', order: 20,
    list(s) {
      const M = F.st(s).milestones, out = [];
      if (M.survey) out.push({ id: 'fish:ribbon', title: T('ribbon'), kind: 'cosmetic', note: 'From Yasu\'s survey (three kinds of fish). It changes only how the rod looks in fishing' + (F.ribbon(s) ? '; tied on now.' : '; taken off now.'),
        draw(c) { const g = c.getContext('2d'); if (!c.width) { c.width = 64; c.height = 64; } g.imageSmoothingEnabled = false; g.fillStyle = '#8a5a36'; for (let i = 0; i < 40; i++) g.fillRect(10 + i, 52 - i, 2, 2); g.fillStyle = '#c8344a'; g.fillRect(24, 34, 6, 5); g.fillRect(30, 38, 4, 9); g.fillRect(20, 39, 4, 8); } });
      if (M.frame) out.push({ id: 'fish:frame', title: T('frame'), kind: 'illustration', note: 'Six kinds of fish recorded. Drawn from the first six you saw.', draw(c) { drawFrame(c, s); } });
      return out;
    },
  });

  return { html, paint, drawFrame, view };
})();
