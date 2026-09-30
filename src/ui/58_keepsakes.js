/* Roadside Keepsakes (addendum §17): a Journey page of the folio listing
 * every keepsake in the one registry RB.content.keepsakes (field puzzles,
 * choice milestones and cases define their own entries there; companion
 * mementos carry category 'shared'). What has been found is historical
 * (s.discovery.keepsakes), never the current inventory.
 *
 *   - collected entries: original pixel art (whole-number zoom, never
 *     blurred), name with reading, description, where and how, the
 *     companion's comment when they made one, a link to the related memory
 *     or case, and "Put on display" (s.discovery.display, one at a time);
 *   - counts of found keepsakes and known regions, which the player can hide
 *     (settings.keepsakeCounts); the total without the names of what is
 *     still to come; places not yet visited grouped anonymously;
 *   - for a keepsake not yet found in a known place: a broad hint, then a
 *     more specific one, only on request and without cost;
 *   - Shared Journey counts only the current companion's mementos;
 *   - Atlas Finds lists what the Unwritten Atlas actually gave (owned items,
 *     their effects unchanged);
 *   - a brief notice the first time a keepsake is found (non-blocking).
 * Nothing here awards anything: RB.discovery.keepsake does, once. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.keepsakes = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => RB.ui.folio.icon(n);
  const j = (t) => (t ? RB.ui.jhtml(t) : '');
  const K = () => RB.content.keepsakes;
  // the regions of the road, in the order they are reached; a keepsake's
  // `region` names one (or several); others may be added (addRegion)
  const REGIONS = [
    { id: 'reedwake', en: 'Reedwake', jp: '{葦|あし}ノ{瀬|せ}', maps: ['rw.', 'lq.'] },
    { id: 'saltglass', en: 'Saltglass', jp: '{潮|しお}{硝子|がらす}', maps: ['sg.'] },
    { id: 'cinder', en: 'Cinder Orchard', jp: '{灰実|はいみ} の {里|さと}', maps: ['co.'] },
    { id: 'snowbell', en: 'Snowbell', jp: '{雪鈴|ゆきすず}', maps: ['sb.'] },
    { id: 'lanternfall', en: 'Lanternfall', jp: '{灯落|ひおち}', maps: ['lf.'] },
    { id: 'archive_road', en: 'The Still Archive', jp: '{静寂|しじま} の {書庫|しょこ}', maps: ['sa.'] },
  ];
  function addRegion(def) { const i = REGIONS.findIndex((r) => r.id === def.id); if (i >= 0) REGIONS[i] = def; else REGIONS.push(def); }
  const regionOf = (id) => REGIONS.find((r) => r.id === id) || null;
  function regionKnown(s, id) {
    const r = regionOf(id);
    if (!r) return true; // a region this page does not know the maps of: shown by name once anything there is found
    return Object.keys(s.visited || {}).some((m) => r.maps.some((p) => m.indexOf(p) === 0));
  }
  const found = (s, id) => !!(s.discovery && s.discovery.keepsakes && s.discovery.keepsakes[id]);
  const regionsOfK = (k) => [].concat(k.region || []);
  // every entry except companion mementos, which belong to Shared Journey
  const roadIds = () => Object.keys(K()).filter((id) => K()[id].category !== 'shared');
  // a memento names its companion as `comp` (or `companion`); one without a name belongs to any
  const compOf = (k) => k.comp || k.companion || null;
  const sharedIds = (s) => Object.keys(K()).filter((id) => K()[id].category === 'shared' && (!compOf(K()[id]) || compOf(K()[id]) === s.comp));
  function counts(s) {
    const ids = roadIds();
    const known = REGIONS.filter((r) => regionKnown(s, r.id));
    return { found: ids.filter((id) => found(s, id)).length, total: ids.length, regions: known.length, regionTotal: REGIONS.length };
  }

  // ---- pixel art at whole-number sizes ------------------------------------------------------------------
  const ART = 32;
  function artCanvas(id, scale, dim) {
    const k = K()[id];
    const cv = document.createElement('canvas');
    cv.width = ART; cv.height = ART;
    const g = cv.getContext('2d');
    g.imageSmoothingEnabled = false;
    try { if (k && typeof k.art === 'function') k.art(g, cv); } catch (e) { /* drawing only */ }
    if (dim) {
      // an unfound keepsake: its outline only, as a silhouette of paper
      const d = g.getImageData(0, 0, ART, ART);
      for (let i = 0; i < d.data.length; i += 4) if (d.data[i + 3] > 0) { d.data[i] = 150; d.data[i + 1] = 138; d.data[i + 2] = 112; d.data[i + 3] = 130; }
      g.putImageData(d, 0, 0);
    }
    cv.className = 'ks-art';
    cv.style.width = ART * scale + 'px';
    cv.style.height = ART * scale + 'px';
    cv.setAttribute('aria-hidden', 'true');
    return cv;
  }

  // ---- the page -----------------------------------------------------------------------------------------------
  let sel = null, zoom = 4;
  function render(A, B, two, api) {
    const s = api.s, st = RB.game.settings;
    const showCounts = st.keepsakeCounts !== false;
    const c = counts(s);
    const d = s.discovery || {};
    let h = '<h3>' + I('keepsake') + ' Roadside Keepsakes <span class="jp-sub">' + j('{道|みち} の {記念品|きねんひん}') + '</span></h3>';
    h += '<p class="muted small">Small things you found or were given along the road. Finding one never depends on how you solved something, or on help you asked for.</p>';
    h += '<div class="ks-counts">' + (showCounts ? '<span data-ks-count>' + c.found + ' of ' + c.total + ' found · ' + c.regions + ' of ' + c.regionTotal + ' regions known</span>' : '<span class="muted">Counts hidden</span>') +
      '<button type="button" class="pbtn quiet" data-ks="counts" aria-pressed="' + !showCounts + '">' + (showCounts ? 'Hide counts' : 'Show counts') + '</button></div>';
    const disp = d.display && K()[d.display] && found(s, d.display) ? d.display : null;
    h += '<div class="ks-display"><span class="lab">On display</span>' + (disp ? '<button type="button" class="ks-disp" data-ks-sel="' + disp + '"><span class="ks-slot" data-art="' + disp + '"></span>' + j(K()[disp].name.jp) + ' <span class="en">' + esc(K()[disp].name.en) + '</span></button>' : '<span class="muted">Nothing on display. Choose a keepsake and put it on display.</span>') + '</div>';
    // by region: known regions first (in road order), each with its found and unfound entries
    const ids = roadIds();
    const unknownIds = [];
    for (const r of REGIONS) {
      const here = ids.filter((id) => regionsOfK(K()[id]).indexOf(r.id) >= 0);
      if (!here.length) continue;
      if (!regionKnown(s, r.id) && !here.some((id) => found(s, id))) { unknownIds.push(...here); continue; }
      h += '<h4 class="ks-region">' + j(r.jp) + ' <span class="en">' + esc(r.en) + '</span></h4><div class="ks-grid">' + here.map((id) => cell(s, id)).join('') + '</div>';
    }
    // entries whose region this page has no map list for: shown once found, otherwise counted anonymously
    for (const id of ids) {
      if (regionsOfK(K()[id]).some((x) => regionOf(x))) continue;
      if (found(s, id)) h += '<div class="ks-grid">' + cell(s, id) + '</div>'; else unknownIds.push(id);
    }
    if (unknownIds.length) h += '<h4 class="ks-region">Places not yet visited</h4><p class="muted small ks-unknown">' + (showCounts ? unknownIds.length + ' more keepsake' + (unknownIds.length > 1 ? 's wait' : ' waits') + ' further along the road.' : 'More wait further along the road.') + '</p>';
    // Shared Journey: only the current companion's
    const sh = sharedIds(s);
    if (s.comp && sh.length) {
      const comp = RB.content.chars[s.comp];
      h += '<h4 class="ks-region">Shared Journey <span class="en">with ' + esc(comp ? comp.name.en : s.comp) + '</span></h4>' +
        (showCounts ? '<p class="muted small">' + sh.filter((id) => found(s, id)).length + ' of ' + sh.length + '</p>' : '') +
        '<div class="ks-grid">' + sh.map((id) => cell(s, id)).join('') + '</div>';
    }
    // Atlas Finds: what the unwritten roads actually gave (owned items)
    const atlas = atlasFinds(s);
    if (atlas.length || (s.atlas && s.atlas.unlocked)) {
      h += '<h4 class="ks-region">Atlas Finds <span class="en">from the Unwritten Atlas</span></h4>' +
        (atlas.length ? '<ul class="entries ks-atlas">' + atlas.map((it) => '<li class="entry"><span class="mark">' + I(it.slot === 'charm' ? 'charm' : 'keepsake') + '</span><div><div class="t">' + j(it.name.jp) + ' <span class="en">' + esc(it.name.en) + '</span></div><div class="muted small">' + esc(it.desc || '') + (it.slot === 'charm' ? ' <span class="tag">Charm (Satchel)</span>' : it.slot === 'cosmetic' ? ' <span class="tag">Worn (Satchel)</span>' : '') + '</div></div></li>').join('') + '</ul>'
          : '<p class="muted small">Nothing yet. What the unwritten roads give you will be listed here.</p>');
    }
    const holder = RB.ui.el('div', 'ks-page');
    holder.innerHTML = h;
    A.appendChild(holder);
    paintArt(holder);
    // the detail: beside the list on a wide spread, below it on a phone
    if (!sel || !K()[sel]) sel = disp || ids.find((id) => found(s, id)) || null;
    const det = RB.ui.el('div', 'ks-detail');
    if (two) { B.innerHTML = ''; B.appendChild(det); } else if (sel) holder.appendChild(det);
    if (sel) detail(det, s, sel, api);
    const wire = (root) => root.addEventListener('click', (e) => onClick(e, s, api));
    wire(holder);
    if (two) wire(B);
  }
  function cell(s, id) {
    const k = K()[id], got = found(s, id);
    return '<button type="button" class="ks-cell' + (got ? '' : ' unfound') + (sel === id ? ' on' : '') + '" data-ks-sel="' + id + '" aria-pressed="' + (sel === id) + '">' +
      '<span class="ks-slot" data-art="' + id + '"' + (got ? '' : ' data-dim="1"') + '></span>' +
      (got ? '<span class="nm">' + j(k.name.jp) + '<span class="en">' + esc(k.name.en) + '</span></span>' : '<span class="nm muted">Not yet found</span>') + '</button>';
  }
  function paintArt(root) {
    root.querySelectorAll('.ks-slot[data-art]').forEach((sl) => { sl.innerHTML = ''; sl.appendChild(artCanvas(sl.dataset.art, sl.closest('.ks-display') ? 1 : 2, !!sl.dataset.dim)); });
  }
  function atlasFinds(s) {
    const A = RB.content.atlas || {};
    const order = A.rewardOrder || [];
    const owned = (id) => (s.inv && s.inv[id] > 0) || Object.values(s.equip || {}).indexOf(id) >= 0;
    return order.filter((id) => RB.content.items[id] && owned(id)).map((id) => RB.content.items[id]);
  }
  // what the companion said at the time (the reaction kept for that result), if anything
  function comment(s, k) {
    if (!k.source || !s.company || !s.company.react) return null;
    const key = k.source.kind === 'puzzle' ? 'puzzle:' + k.source.id + ':done' : k.source.kind === 'case' ? 'case:' + k.source.id + ':done' : null;
    const rid = key && s.company.react[key];
    const r = rid && RB.company && RB.company.reactions.find((x) => x.id === rid);
    return r && r.lines && r.lines[0] ? { who: r.comp, line: r.lines[0] } : null;
  }
  function memoryFor(s, k) {
    const m = (s.company && s.company.memories) || [];
    return m.find((x) => x.ref === 'keepsake:' + k.id || (k.source && (x.ref === k.source.kind + ':' + k.source.id))) || null;
  }
  function detail(el, s, id, api) {
    const k = Object.assign({ id }, K()[id]), rec = s.discovery.keepsakes[id], got = !!rec;
    let h = '';
    if (got) {
      const place = rec.map && RB.content.maps[rec.map] ? RB.content.maps[rec.map].name : null;
      h += '<div class="ks-big"><span class="ks-slot-big"></span><div class="ks-zoom" role="group" aria-label="Zoom">' +
        [2, 4, 8].map((z) => '<button type="button" class="pbtn quiet" data-ks-zoom="' + z + '" aria-pressed="' + (zoom === z) + '">×' + z + '</button>').join('') + '</div></div>' +
        '<h3 class="ks-name">' + j(k.name.jp) + ' <span class="en">' + esc(k.name.en) + '</span></h3>' +
        '<p>' + esc(k.desc ? k.desc.en : '') + '</p>' +
        (k.how ? '<p class="muted small">' + I('here') + ' ' + esc(k.how.en) + (place ? ' (' + esc(place.en) + ')' : '') + '</p>' : '');
      const cm = comment(s, k);
      if (cm) { const ch = RB.content.chars[cm.who]; h += '<div class="ks-comment">' + I('companion') + '<div><div class="who">' + esc(ch ? ch.name.en : cm.who) + '</div>' + j(cm.line.jp) + '<div class="en">' + esc(RB.script.enVars(cm.line.en)) + '</div></div></div>'; }
      const mem = memoryFor(s, k);
      const acts = [];
      acts.push('<button type="button" class="pbtn" data-ks-pin="' + id + '" aria-pressed="' + (s.discovery.display === id) + '">' + I('keepsake') + (s.discovery.display === id ? 'On display (take down)' : 'Put on display') + '</button>');
      if (mem) acts.push('<button type="button" class="pbtn quiet" data-ks-go="memories">' + I('journey') + 'The memory</button>');
      if (k.source && k.source.kind === 'case') acts.push('<button type="button" class="pbtn quiet" data-ks-go="cases">' + I('scroll') + 'The case</button>');
      h += '<div class="row-acts">' + acts.join('') + '</div>';
    } else {
      const lv = (s.discovery.hints && s.discovery.hints['keepsake:' + id]) || 0;
      const known = regionsOfK(k).some((r) => regionKnown(s, r));
      h += '<div class="ks-big"><span class="ks-slot-big dim"></span></div><h3 class="ks-name muted">Not yet found</h3>';
      if (known) {
        h += '<p class="muted small">Still somewhere along the road. A hint costs nothing.</p>';
        if (lv >= 1 && k.hint && k.hint.broad) h += '<p class="ks-hint"><span class="lv">A nudge</span>' + esc(k.hint.broad.en) + '</p>';
        if (lv >= 2 && k.hint && k.hint.specific) h += '<p class="ks-hint"><span class="lv">Closer</span>' + esc(k.hint.specific.en) + '</p>';
        if (lv < 2 && k.hint) h += '<div class="row-acts"><button type="button" class="pbtn" data-ks-hint="' + id + '">' + I('bulb') + (lv ? 'A closer hint' : 'A hint') + '</button></div>';
      }
    }
    el.innerHTML = h;
    const big = el.querySelector('.ks-slot-big');
    if (big) big.appendChild(artCanvas(id, got ? zoom : 4, !got));
    void api;
  }
  function onClick(e, s, api) {
    const b = e.target.closest('button');
    if (!b) return;
    const st = RB.game.settings;
    if (b.dataset.ks === 'counts') { st.keepsakeCounts = !(st.keepsakeCounts !== false); RB.game.saveSettings(); api.render(); return; }
    if (b.dataset.ksSel) { sel = b.dataset.ksSel; api.render(); return; }
    if (b.dataset.ksZoom) { zoom = +b.dataset.ksZoom; api.render(); return; }
    if (b.dataset.ksPin) { const id = b.dataset.ksPin; s.discovery.display = s.discovery.display === id ? null : (found(s, id) ? id : null); RB.save.autosave('progress'); api.render(); return; }
    if (b.dataset.ksHint) { const key = 'keepsake:' + b.dataset.ksHint; s.discovery.hints[key] = Math.min(2, (s.discovery.hints[key] || 0) + 1); api.render(); return; }
    if (b.dataset.ksGo === 'memories') { api.go('company', 'memories'); return; }
    if (b.dataset.ksGo === 'cases') { api.go('journey', 'cases'); return; }
  }
  RB.ui.menu.addPage('journey', { id: 'keepsakes', en: 'Keepsakes', icon: 'keepsake', render });
  if (RB.ui.settings && RB.ui.settings.addRows) RB.ui.settings.addRows('display', ({ sw }) => sw('keepsakeCounts', 'Counts in Roadside Keepsakes', 'Off shows the keepsakes without found / total numbers.'));

  // ---- the pinned keepsake on the Company › Shared memories page -------------------------------------------------
  // (drawn by this page's owner if it calls displayHtml(); otherwise added at the top of the page here)
  function displayHtml(s) {
    const id = s.discovery && s.discovery.display;
    if (!id || !K()[id] || !found(s, id)) return '';
    return '<div class="ks-display ks-company"><span class="lab">On display</span><span class="ks-slot" data-art="' + id + '"></span>' + j(K()[id].name.jp) + ' <span class="en">' + esc(K()[id].name.en) + '</span></div>';
  }
  const api0 = { companyDecor: true };
  if (RB.ui.company && RB.ui.company.render) {
    const orig = RB.ui.company.render;
    RB.ui.company.render = function (A, B, two, api) {
      orig(A, B, two, api);
      if (!api0.companyDecor || !api || !api.view || api.view.page !== 'memories' || A.querySelector('.ks-company')) return;
      const h = displayHtml(api.s);
      if (!h) return;
      const box = RB.ui.el('div', null, h);
      const page = A.querySelector('.co-page') || A;
      page.insertBefore(box.firstChild, page.firstChild);
      paintArt(page);
    };
  }

  // ---- first discovery: a brief notice that never blocks -----------------------------------------------------------
  const queue = [];
  function notice(id) {
    const k = K()[id];
    if (!k || typeof document === 'undefined') return;
    const host = document.querySelector('#overlay .notices');
    if (!host) return;
    const n = RB.ui.el('div', 'toast ks-toast');
    n.setAttribute('role', 'status');
    n.innerHTML = '<span class="kind">Keepsake found</span><span class="ks-slot"></span>' + j(k.name.jp) + '<span class="en">' + esc(k.name.en) + ' — see Journey › Keepsakes</span>';
    n.querySelector('.ks-slot').appendChild(artCanvas(id, 1));
    host.appendChild(n);
    RB.audio && RB.audio.sfx('discover', { vol: 0.4 });
    setTimeout(() => { n.style.opacity = '0'; n.style.transition = 'opacity .5s'; }, 4200);
    setTimeout(() => n.remove(), 4800);
  }
  function pump(t0) {
    if (!queue.length) return;
    // wait while a field action is still being shown (at most a few seconds)
    if (RB.weave && RB.weave.busy && RB.weave.busy() && performance.now() - t0 < 6000) { setTimeout(() => pump(t0), 250); return; }
    notice(queue.shift());
    if (queue.length) setTimeout(() => pump(performance.now()), 600);
  }
  RB.bus.on('keepsake:found', (e) => { if (!e || !e.id) return; queue.push(e.id); if (queue.length === 1) setTimeout(() => pump(performance.now()), 400); });

  return { render, counts, addRegion, regions: REGIONS, displayHtml, artCanvas, settings: api0, found };
})();
