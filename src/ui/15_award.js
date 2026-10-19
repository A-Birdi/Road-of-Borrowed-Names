/* Award slips (LI-3, Robin 2026-10-16): what you are given, what you keep and what the travel volume records, each
 * announced by one slip of the same family:
 *   - item ("Received"): the item's own icon (src/ui/11_item_art.js), its name, how many, and a line on how it can be
 *     worn; every gift says so, quest rewards included;
 *   - keepsake ("Keepsake found"): the keepsake's picture in a mount, its name; an item that is also a keepsake gets
 *     one slip, the item's, marked as a keepsake too;
 *   - moment ("Moment recorded"): a page of the travel volume witnessed for the first time, pressed with your seal,
 *     with its own sound;
 *   - stamp ("Stamp pressed"): a stamp of the Road Stamp Book pressed at once (the field guide's): the stamp's own
 *     design comes down onto the slip and lands with a ring of its ink; the slip's edge is in that ink.
 * Each slides in from the top in a few quick frames, a gold flare runs round its border from the top-left and the
 * bottom-right corners (twice, or three times for what matters most) and trails off; it stays for a set time (paused
 * while pointed at or focused) and closes at once with its × or a tap. One sound each, no more. Reduce motion: no
 * slide, no flare and no press. Nothing here changes what was given.
 *
 *   RB.ui.award({ kind: 'item' | 'keepsake' | 'moment' | 'stamp', id, jp, en, n, note, art, level, sound, ink }) → Promise
 *       (resolves when the slip is placed, as RB.ui.toast does, so a scene goes on at once) */
var RB = (globalThis.RB = globalThis.RB || {});
RB.ui = RB.ui || {};

RB.ui.award = (function () {
  'use strict';
  const esc = (t) => RB.util.esc(t);
  const LABEL = { item: 'Received', keepsake: 'Keepsake found', moment: 'Moment recorded', stamp: 'Stamp pressed' };
  const SOUND = { item: 'item_get', keepsake: 'discover', moment: 'moment', stamp: 'stamp' };
  const HOLD = { item: 6000, keepsake: 7000, moment: 7000, stamp: 7000 }; // (long enough to read a name and its line)
  const MAX = 3; // slips on screen at once; an older one gives way
  const live = []; // { el, kind, id, timer, close }
  const reduce = () => !!(RB.game && RB.game.reducedMotion && RB.game.reducedMotion());
  const host = () => (typeof document !== 'undefined' ? document.querySelector('#overlay .notices') : null);

  function award(t) {
    t = t || {};
    const kind = LABEL[t.kind] ? t.kind : 'item';
    return new Promise((res) => {
      const h = host();
      if (!h) { res(); return; }
      const d = kind === 'item' && t.id ? RB.content.items[t.id] : null;
      const jp = t.jp || (d && d.name.jp) || '', en = t.en || (d && d.name.en) || '';
      const n = RB.ui.el('div', 'toast award aw-' + kind + (t.badge ? ' aw-badged' : ''));
      n.setAttribute('role', 'status');
      n.dataset.kind = kind;
      if (t.id) n.dataset.id = t.id;
      if (t.ink) n.style.setProperty('--aw-ink', t.ink);
      const art = t.art != null ? t.art : kind === 'item' && t.id ? RB.itemArt.html(t.id, 3) : '';
      n.innerHTML = '<span class="aw-art" aria-hidden="true">' + (typeof art === 'string' ? art : '') + '</span>' +
        '<span class="aw-body"><span class="kind">' + esc(LABEL[kind]) + '</span>' +
        '<span class="aw-name">' + (jp ? RB.ui.jhtml(jp) : '') + '<span class="en">' + esc(en) + (t.n > 1 ? ' ×' + t.n : '') + '</span></span>' +
        (t.note ? '<span class="tnote">' + esc(t.note) + '</span>' : '') + '</span>' +
        '<button type="button" class="aw-x" aria-label="Dismiss">' + (RB.ui.folio ? RB.ui.folio.icon('close') : '×') + '</button>';
      if (art && typeof art !== 'string') n.querySelector('.aw-art').appendChild(art);
      while (live.length >= MAX) live[0].close(true);
      h.appendChild(n);
      const me = { el: n, kind, id: t.id || null, timer: 0, left: HOLD[kind], since: 0, close: null, level: t.level || (kind === 'item' && !(d && d.key) ? 2 : 3) };
      live.push(me);
      let gone = false;
      me.close = (quick) => {
        if (gone) return;
        gone = true;
        clearTimeout(me.timer);
        const i = live.indexOf(me);
        if (i >= 0) live.splice(i, 1);
        if (quick || reduce()) { n.remove(); return; }
        n.classList.add('aw-out');
        setTimeout(() => n.remove(), 220);
      };
      // the hold: paused while pointed at or focused
      const run = () => { me.since = Date.now(); clearTimeout(me.timer); me.timer = setTimeout(() => me.close(), me.left); };
      me.run = run;
      const pause = () => { if (gone) return; clearTimeout(me.timer); me.left = Math.max(1200, me.left - (Date.now() - me.since)); };
      n.addEventListener('pointerenter', pause);
      n.addEventListener('pointerleave', () => { if (!gone) run(); });
      n.addEventListener('focusin', pause);
      n.addEventListener('focusout', () => { if (!gone) run(); });
      n.addEventListener('click', () => me.close());
      run();
      if (!reduce()) { n.classList.add('aw-in'); flair(n, me.level); }
      if (t.sound !== false && RB.audio) RB.audio.sfx(SOUND[kind]);
      if (kind === 'item') newDot();
      setTimeout(res, RB.game && RB.game.fastForward && RB.game.fastForward() ? 50 : 350);
    });
  }

  // ---- the flare: two gold sparks from the top-left and bottom-right corners, clockwise round the border, trailing,
  // shedding a few pixel sparks; `revs` times round, the last turn fading ---------------------------------------------
  function flair(el, revs) {
    if (typeof requestAnimationFrame === 'undefined') return;
    const cv = document.createElement('canvas');
    cv.className = 'aw-flair';
    cv.setAttribute('aria-hidden', 'true');
    el.appendChild(cv);
    const PAD = 12, PX = 2, OFF = 1; // the canvas reaches past the slip; a 2-px pixel grid; the flare rides the edge
    let W = 0, H = 0, per = 0;
    const size = () => {
      const r = el.getBoundingClientRect();
      W = Math.round(r.width) + OFF * 2; H = Math.round(r.height) + OFF * 2;
      cv.width = W + PAD * 2; cv.height = H + PAD * 2;
      cv.style.left = -(PAD + OFF) + 'px'; cv.style.top = -(PAD + OFF) + 'px';
      per = 2 * (W + H);
    };
    size();
    const g = cv.getContext('2d');
    // a point at distance d along the border, clockwise from the top-left corner
    const at = (d) => {
      d = ((d % per) + per) % per;
      if (d < W) return [d, 0, 0, -1];
      if (d < W + H) return [W, d - W, 1, 0];
      if (d < 2 * W + H) return [W - (d - W - H), H, 0, 1];
      return [0, H - (d - 2 * W - H), -1, 0];
    };
    const LAP = 900; // ms for one turn of the border
    const total = LAP * revs;
    const sparks = [];
    let t0 = 0, last = 0, rnd = 1;
    const rand = () => { rnd = (rnd * 16807) % 2147483647; return rnd / 2147483647; };
    const dot = (x, y, c, a, sz) => { sz = sz || PX; g.globalAlpha = a; g.fillStyle = c; g.fillRect(Math.round((x + PAD) / PX) * PX - sz / 2, Math.round((y + PAD) / PX) * PX - sz / 2, sz, sz); };
    function frame(now) {
      if (!el.isConnected) return;
      if (!t0) { t0 = now; last = now; }
      const k = Math.min(1, (now - t0) / total);
      const dt = Math.min(50, now - last); last = now;
      g.clearRect(0, 0, cv.width, cv.height);
      // the last turn fades and the trail shortens
      const lastTurn = Math.max(0, (k * revs - (revs - 1)));
      const fade = 1 - lastTurn;
      const head = k * revs * per;
      const trail = per * 0.2 * (0.4 + 0.6 * fade);
      for (const start of [0, per / 2]) {
        // a soft glow round the head, then the trail: bright gold at the head, deepening to the ribbon's amber
        const [hx, hy] = at(start + head);
        dot(hx, hy, '#ffcf4a', 0.28 * fade, 10);
        dot(hx, hy, '#ffd75e', 0.5 * fade, 6);
        for (let s = 0; s <= trail; s += PX) {
          const [x, y] = at(start + head - s);
          const a = Math.pow(1 - s / trail, 1.3) * fade;
          dot(x, y, s < PX * 2 ? '#fff1b0' : s < trail * 0.3 ? '#f5b623' : '#c5841a', a, s < trail * 0.5 ? 3 : PX);
        }
        // sparks fly off outward from the head now and then
        if (fade > 0.05 && rand() < 0.35 * (dt / 16)) {
          const [x, y, nx, ny] = at(start + head);
          sparks.push({ x, y, vx: nx * (0.03 + rand() * 0.05) + (rand() - 0.5) * 0.04, vy: ny * (0.03 + rand() * 0.05) + (rand() - 0.5) * 0.04 + 0.01, life: 1 });
        }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 0.00012 * dt; p.life -= dt / 420;
        if (p.life <= 0) { sparks.splice(i, 1); continue; }
        dot(p.x, p.y, p.life > 0.5 ? '#ffd75e' : '#d4901c', p.life);
      }
      g.globalAlpha = 1;
      if (k < 1 || sparks.length) requestAnimationFrame(frame);
      else cv.remove();
    }
    requestAnimationFrame(frame);
  }

  // ---- an item that is also a keepsake: one slip, the item's, marked as a keepsake too ------------------------------
  function markKeepsake(itemId, ksName) {
    const me = live.find((x) => x.kind === 'item' && x.id === itemId);
    if (!me) return false;
    me.el.classList.add('aw-badged');
    const k = me.el.querySelector('.kind');
    if (k && !me.el.querySelector('.aw-badge')) k.insertAdjacentHTML('afterend', '<span class="aw-badge">Keepsake</span>');
    const body = me.el.querySelector('.aw-body');
    if (body && !me.el.querySelector('.aw-ks')) body.insertAdjacentHTML('beforeend', '<span class="tnote aw-ks">' + esc('Also kept in Journey › Keepsakes') + '</span>');
    // (it stays as long as a keepsake's slip would, from now)
    me.left = HOLD.keepsake;
    if (me.run) me.run();
    if (!reduce()) flair(me.el, 1);
    return true;
  }
  // ---- the "new" mark on the map's Ledger button: something given that the Satchel has not shown yet ------------------
  function newDot() {
    if (typeof document === 'undefined') return;
    const s = RB.game && RB.game.s;
    const any = !!(s && s.newItems && Object.keys(s.newItems).some((id) => s.inv && s.inv[id] > 0));
    for (const b of document.querySelectorAll('.hbtn.menu-b')) {
      const d = b.querySelector('.new-dot');
      if (any && !d) b.insertAdjacentHTML('beforeend', '<span class="new-dot" aria-hidden="true"></span>');
      else if (!any && d) d.remove();
      if (any) b.setAttribute('aria-description', 'Something new in the Satchel'); else b.removeAttribute('aria-description');
    }
  }

  // ---- the travel volume: a page witnessed for the first time is a moment recorded (after its scene has settled) ------
  // s.volSeen: the pages already announced in this journey; a journey from before has its witnessed pages taken as
  // known (nothing old is announced as new)
  function moments() {
    const s = RB.game && RB.game.s;
    if (!s || !RB.volume || !RB.recordsUI || !RB.recordsUI.inCampaign(s)) return;
    let pages = [];
    try { pages = RB.volume.pages().filter((p) => RB.volume.witnessed(s, p)); } catch (e) { return; }
    if (!Array.isArray(s.volSeen)) { s.volSeen = pages.map((p) => p.id); return; }
    const fresh = pages.filter((p) => s.volSeen.indexOf(p.id) < 0 && p.kind !== 'prologue');
    fresh.forEach((p, i) => {
      s.volSeen.push(p.id);
      const t = p.title || {};
      const seal = RB.seal && RB.seal.svg ? RB.seal.svg(RB.seal.of(s), 44, '') : '';
      setTimeout(() => award({ kind: 'moment', id: p.id, jp: t.jp || '', en: t.en || '', note: 'Kept in Journey › Travel volume, pressed with your seal', art: seal, level: 3 }), 250 + i * 900);
    });
  }
  if (RB.bus) {
    RB.bus.on('story:settled', () => { setTimeout(moments, 120); newDot(); });
    // a journey begun or loaded: what its volume already holds is not news
    RB.bus.on('campaign:changing', () => { live.slice().forEach((x) => x.close(true)); });
  }
  return Object.assign(award, { markKeepsake, moments, newDot, live: () => live.map((x) => ({ kind: x.kind, id: x.id })), closeAll: () => live.slice().forEach((x) => x.close(true)), HOLD });
})();
