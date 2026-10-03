/* Development-only gesture viewer and contact sheets for the overworld actor system (the owner's addendum
 * §20.4; docs/expressive/CONTRACT.md §3.6). Not reachable in normal play: every entry point refuses unless
 * the page was opened with ?dev=actors (or a test set window.__RB_DEV_ACTORS__ before calling). Nothing is
 * saved. Every view says what it is: a SYNTHETIC fixture (the sprite rig posed directly from the gesture
 * library and the mannerism profiles), never a recording of gameplay or a saved branch.
 *
 *   RB.actorDev.allowed()
 *   RB.actorDev.open({ sheet: 'primitives' | 'habits' | 'profiles', who: [ids], dir, scale, phases })
 *        a page over the game: rows of characters, columns of gestures (entry · peak · recovery keys), the
 *        labels as page text (nothing is written into the art); returns the page element
 *   RB.actorDev.close()
 *   RB.actorDev.frame(who, gesture, phase, dir) -> canvas of one key (for tests)
 */
var RB = (globalThis.RB = globalThis.RB || {});

RB.actorDev = (function () {
  'use strict';
  function allowed() {
    try {
      if (typeof window === 'undefined') return false;
      if (window.__RB_DEV_ACTORS__ === true) return true;
      return /[?&]dev=actors\b/.test(window.location.search || '');
    } catch (e) { return false; }
  }
  // the synthetic player fixture: a creation look with a satchel and glasses (so the strap and glasses
  // habits show), plus the companions and the bespoke cast
  const PC = { skin: 2, hair: 'ponytail', hairColor: 3, cloth: ['#4a6a8a', '#3a5470', '#c8a050'], pants: '#3a3440', shape: 'tunic', acc: ['satchel', 'glasses'] };
  const lookOf = (who) => (who === 'pc' ? PC : (RB.content.chars[who] || {}).look);
  const nameOf = (who) => (who === 'pc' ? 'Player (synthetic look)' : ((RB.content.chars[who] || {}).name || {}).en || who);
  const PROP_FOR = { present: 'ledger', read: 'book', handover: 'letter', receive: 'letter', check: 'letter' };
  // the pose key of one phase of a gesture: 'entry' (its first key), 'peak', 'recover' (its first recovery key)
  function keyFor(who, gid, phase, look) {
    const g = RB.gestures.get(gid);
    if (!g) return null;
    const k = phase === 'entry' ? g.entry[0] : phase === 'recover' ? g.recover[0] || g.peak : g.peak;
    const pose = k[0] || (RB.mannerisms.of(who, look).rest || 'stiff').split('.')[0];
    const x = k[2] || {};
    const prop = x.prop ? g.prop || PROP_FOR[g.id] || null : null;
    const gaze = x.gaze && /^[lrudc]$/.test(x.gaze) ? x.gaze : x.gaze === 'target' ? 'r' : x.gaze === 'away' ? 'l' : null;
    return RB.sprites._pose.key(pose, { prop, gaze });
  }
  function frame(who, gid, phase, dir) {
    const look = lookOf(who);
    if (!look) return null;
    const fit = RB.gestures.fit(gid, look, { prop: PROP_FOR[gid] });
    if (!fit) return null;
    return RB.sprites.getArt(look, dir || 'down', keyFor(who, fit, phase || 'peak', look));
  }
  let root = null;
  function close() { if (root) { root.remove(); root = null; } }
  function open(o) {
    if (!allowed()) return null;
    o = o || {};
    close();
    const sheet = o.sheet || 'primitives';
    const scale = o.scale || 2, dir = o.dir || 'down';
    const who = o.who || ['pc', 'nao', 'mio', 'ren', 'suzu'];
    const phases = o.phases || (sheet === 'primitives' ? ['entry', 'peak', 'recover'] : ['peak']);
    let cols;
    if (o.cols) cols = o.cols.slice();
    else if (sheet === 'primitives') cols = Object.keys(RB.gestures.PRIM).map((n) => RB.gestures.PRIM[n].id);
    else if (sheet === 'habits') cols = RB.gestures.list().filter((g) => g.kind === 'habit').map((g) => g.id);
    else cols = null; // profiles: per person their rest and their own habits
    root = document.createElement('div');
    root.className = 'actor-dev';
    root.setAttribute('style', 'position:fixed;inset:0;z-index:9999;overflow:auto;background:#d8c8a4;color:#2a2024;font:12px/1.3 sans-serif;padding:10px');
    const head = document.createElement('div');
    head.setAttribute('style', 'font-weight:bold;margin-bottom:6px');
    head.textContent = 'SYNTHETIC FIXTURE — the overworld sprite rig posed directly from RB.gestures and RB.mannerisms (not gameplay, not a saved branch). Sheet: ' + sheet + ', facing ' + dir + ', ' + scale + '× art px.';
    root.appendChild(head);
    const tbl = document.createElement('table');
    tbl.setAttribute('style', 'border-collapse:collapse');
    const cell = (cv, txt) => {
      const td = document.createElement('td');
      td.setAttribute('style', 'border:1px solid rgba(0,0,0,0.15);text-align:center;vertical-align:bottom;padding:2px');
      if (cv) { const c = document.createElement('canvas'); c.width = cv.width * scale; c.height = cv.height * scale; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(cv, 0, 0, c.width, c.height); td.appendChild(c); }
      if (txt) { const d = document.createElement('div'); d.textContent = txt; d.setAttribute('style', 'max-width:' + (40 * scale * (phases.length || 1)) + 'px'); td.appendChild(d); }
      return td;
    };
    if (cols) {
      const hr = document.createElement('tr');
      hr.appendChild(cell(null, ''));
      for (const id of cols) { const g = RB.gestures.get(id); hr.appendChild(cell(null, (g.n ? g.n + ' ' : '') + g.label + (g.legible ? ' [' + g.legible + ']' : ''))); }
      tbl.appendChild(hr);
      for (const w of who) {
        const tr = document.createElement('tr');
        tr.appendChild(cell(null, nameOf(w)));
        for (const id of cols) {
          const td = cell(null, null);
          const fit = RB.gestures.fit(id, lookOf(w), { prop: PROP_FOR[id] });
          const row = document.createElement('div');
          row.setAttribute('style', 'display:flex;gap:2px;justify-content:center');
          for (const ph of phases) { const cv = frame(w, id, ph, dir); if (cv) { const c = document.createElement('canvas'); c.width = cv.width * scale; c.height = cv.height * scale; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(cv, 0, 0, c.width, c.height); row.appendChild(c); } }
          td.appendChild(row);
          if (fit !== id) { const d = document.createElement('div'); d.textContent = fit ? '→ ' + fit : '—'; td.appendChild(d); }
          tr.appendChild(td);
        }
        tbl.appendChild(tr);
      }
    } else {
      for (const w of who) {
        const look = lookOf(w);
        if (!look) continue;
        const prof = RB.mannerisms.of(w, look);
        const tr = document.createElement('tr');
        tr.appendChild(cell(null, nameOf(w) + ' — ' + prof.class + (prof.tier ? ' (' + prof.tier + ')' : '')));
        const rest = (prof.rest || '').split('.')[0];
        tr.appendChild(cell(RB.sprites.getArt(look, dir, rest ? RB.sprites._pose.key(rest, { hand: (prof.rest || '').split('.')[1] || null, prop: prof.restProp || null }) : 'i0'), 'rest: ' + (prof.rest || 'standing')));
        for (const h of prof.idle || []) {
          const id = h[0], fit = RB.gestures.fit(id, look, { prop: (h[2] || {}).prop });
          tr.appendChild(cell(fit ? frame(w, fit, 'peak', dir) : null, id + (h[2] && h[2].at ? ' @' + h[2].at : '') + (fit ? '' : ' (not for this look)')));
        }
        const talk = (prof.talk || []).map((n) => (RB.gestures.PRIM[n] || {}).id).filter(Boolean);
        tr.appendChild(cell(null, 'talk: ' + talk.join(', ')));
        tbl.appendChild(tr);
      }
    }
    root.appendChild(tbl);
    const x = document.createElement('button');
    x.textContent = 'Close';
    x.setAttribute('style', 'position:fixed;top:6px;right:10px');
    x.onclick = close;
    root.appendChild(x);
    document.body.appendChild(root);
    return root;
  }
  return { allowed, open, close, frame, keyFor, PC };
})();
