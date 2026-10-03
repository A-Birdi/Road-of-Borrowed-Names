/* Development-only viewer for the illustrated sequences (the addendum §20.4, HX57; docs/expressive/CONTRACT.md
 * §3.6). Not reachable in normal play: every entry point refuses unless the page was opened with
 * ?dev=sequences (or a test set window.__RB_DEV_SEQ__ first). Nothing is saved, nothing runs a scene.
 *
 * Every view says what it is. The contact sheet is a SYNTHETIC FIXTURE: each shot drawn directly from its
 * definition (RB.sequence.drawAt) at the end of each phase, with a fixture look for the player and a fixture
 * companion, at a chosen buffer size and sheet height — not gameplay and not a saved branch. "Play" runs the
 * standalone player (RB.sequence.view) over the scene's own lines for a fixture branch (the flags listed on
 * the page), read-only: no state command runs.
 *
 *   RB.seqDev.allowed()
 *   RB.seqDev.open({ seq?, w, h, vb })    the contact sheet (all sequences, or one) → the page element
 *   RB.seqDev.close()
 *   RB.seqDev.beatsOf(seqId, flags)        the beats a fixture branch of the scene would show (no scene runs)
 *   RB.seqDev.play(seqId, flags)           play those beats in the standalone player */
var RB = (globalThis.RB = globalThis.RB || {});

RB.seqDev = (function () {
  'use strict';
  function allowed() {
    try {
      if (typeof window === 'undefined') return false;
      if (window.__RB_DEV_SEQ__ === true) return true;
      return /[?&]dev=sequences\b/.test(window.location.search || '');
    } catch (e) { return false; }
  }
  // the fixture: a creation look with a satchel and glasses, Mio travelling with you
  const PC = { skin: 2, hair: 'ponytail', hairColor: 3, cloth: ['#4a6a8a', '#3a5470', '#c8a050'], pants: '#3a3440', shape: 'tunic', acc: ['satchel', 'glasses'] };
  const FIX = { comp: 'mio', flags: { sg_wataru_self: true, sg_boss_done: true } };
  const cast = () => ({ pc: PC, comp: { id: FIX.comp, look: (RB.content.chars[FIX.comp] || {}).look || {} } });
  // a fixture branch: conditions read against the fixture's flags and companion only
  function test(cond, flags) {
    if (!cond) return true;
    return cond.split('|').some((alt) => alt.split('&').every((t) => {
      t = t.trim();
      const neg = t[0] === '!'; if (neg) t = t.slice(1);
      let v;
      if (t.startsWith('comp=')) v = t.slice(5) === FIX.comp;
      else v = !!(flags || FIX.flags)[t];
      return neg ? !v : v;
    }));
  }
  function beatsOf(seqId, flags) {
    const def = RB.sequence.get(seqId);
    const sc = def && def.scene && RB.content.scenes[def.scene];
    if (!sc) return [];
    const out = [];
    let on = false, shot = null, phase = null;
    for (const c of sc.cmds) {
      if (c.if && !test(c.if, flags)) continue;
      const a = c.args || [];
      if (c.op === 'sequence' && a[0] === seqId) { on = (a[1] || 'begin') === 'begin'; if (!on) break; continue; }
      if (!on) continue;
      if (c.op === 'shot') { if (a[0] !== shot) { shot = a[0]; phase = a[1] || null; } else if (a[1]) phase = a[1]; continue; }
      if (c.op === 'say' && shot) out.push({ shot, phase, line: { who: c.who === 'comp' ? FIX.comp : c.who, jp: c.jp, en: c.en } });
    }
    return out;
  }
  function play(seqId, flags) {
    if (!allowed()) return null;
    close();
    // whatever page it was opened over (the title, a menu) is hidden while the preview plays
    document.body.classList.add('seq-dev-play');
    const done = (r) => { document.body.classList.remove('seq-dev-play'); return r; };
    return RB.sequence.view({ seq: seqId, beats: beatsOf(seqId, flags), cast: cast(), label: 'Synthetic preview: ' + seqId, tag: 'Synthetic preview (dev) — fixture branch ' + JSON.stringify(flags || FIX.flags) + ', read-only; not gameplay, not a saved branch', name: 'seq-dev', seen: () => true, skip: { label: 'Close' }, replay: true, speakers: true }).then(done, done);
  }
  let root = null;
  function close() { if (root) { root.remove(); root = null; } }
  function open(o) {
    if (!allowed()) return null;
    o = o || {};
    close();
    const w = o.w || 640, h = o.h || 360, vb = o.vb || Math.round(h * 0.68), scale = o.scale || (w > 500 ? 0.5 : 0.4);
    root = document.createElement('div');
    root.className = 'seq-dev';
    root.setAttribute('style', 'position:fixed;inset:0;z-index:9999;overflow:auto;background:#d8c8a4;color:#2a2024;font:12px/1.3 sans-serif;padding:10px');
    const head = document.createElement('div');
    head.setAttribute('style', 'font-weight:bold;margin-bottom:6px');
    head.textContent = 'SYNTHETIC FIXTURE — every shot drawn directly from its definition at the end of each phase (fixture look, companion ' + FIX.comp + ', flags ' + Object.keys(FIX.flags).join(', ') + '); buffer ' + w + '×' + h + ', the sheet\'s top at ' + vb + ' (shaded). Not gameplay, not a saved branch.';
    root.appendChild(head);
    const bar = document.createElement('div');
    bar.setAttribute('style', 'margin:4px 0 8px;display:flex;gap:6px;flex-wrap:wrap');
    for (const [label, ww, hh] of [['wide 640×360', 640, 360], ['phone 390×844', 390, 844], ['phone on its side 507×234', 507, 234]]) {
      const bt = document.createElement('button'); bt.textContent = label; bt.onclick = () => open(Object.assign({}, o, { w: ww, h: hh, vb: Math.round(hh * (hh < 300 ? 0.32 : 0.68)) })); bar.appendChild(bt);
    }
    const x = document.createElement('button'); x.textContent = 'Close'; x.onclick = close; bar.appendChild(x);
    root.appendChild(bar);
    for (const id of (o.seq ? [o.seq] : RB.sequence.ids())) {
      const def = RB.sequence.get(id);
      const sec = document.createElement('section');
      const h3 = document.createElement('h3');
      h3.setAttribute('style', 'margin:10px 0 4px;font-size:14px');
      h3.textContent = id + (def.title ? ' — ' + def.title.en : '') + (def.scene ? ' (' + def.scene + ')' : '');
      sec.appendChild(h3);
      if (def.scene) { const pb = document.createElement('button'); pb.textContent = 'Play (synthetic branch, read-only)'; pb.onclick = () => play(id); sec.appendChild(pb); }
      const row = document.createElement('div');
      row.setAttribute('style', 'display:flex;flex-wrap:wrap;gap:6px;margin-top:4px');
      for (const shot of Object.keys(def.shots)) {
        for (const ph of def.shots[shot].phases) {
          const fig = document.createElement('figure');
          fig.setAttribute('style', 'margin:0');
          const c = document.createElement('canvas'); c.width = w; c.height = h;
          c.setAttribute('style', 'width:' + Math.round(w * scale) + 'px;height:' + Math.round(h * scale) + 'px;image-rendering:pixelated;display:block');
          const g = c.getContext('2d');
          let err = null;
          try { RB.sequence.drawAt(g, w, h, { seq: id, shot, phase: ph.id, k: 1, vb, t: 4000, cast: cast(), test: (cond) => test(cond) }); } catch (e) { err = String(e); }
          g.fillStyle = 'rgba(240,230,210,0.3)'; g.fillRect(0, vb, w, h - vb);
          const cap = document.createElement('figcaption');
          cap.textContent = shot + ' · ' + ph.id + (ph.ms ? ' (' + ph.ms + ' ms)' : '') + (err ? ' — ERROR ' + err : '');
          fig.appendChild(c); fig.appendChild(cap); row.appendChild(fig);
        }
      }
      sec.appendChild(row);
      root.appendChild(sec);
    }
    document.body.appendChild(root);
    return root;
  }
  if (typeof window !== 'undefined' && typeof document !== 'undefined' && /[?&]dev=sequences\b/.test((window.location && window.location.search) || '')) {
    let tries = 0;
    const go = () => { if (window.__RB_READY__ === true && document.body) open(); else if (++tries < 300) setTimeout(go, 100); };
    setTimeout(go, 0);
  }
  return { allowed, open, close, beatsOf, play, PC, FIX };
})();
