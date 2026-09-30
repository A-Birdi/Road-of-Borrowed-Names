/* Company › Pet (addendum §6.3): the cosmetic animal travelling with you, if any.
 *
 * Left leaf: the animals you have met, as cards (Select / Selected), and "No
 * pet" (a complete way to travel). Right leaf (on a phone, a detail page with
 * Back): the chosen animal — its portrait, a live preview (still with reduced
 * motion), a fixed personality line, where and how you met, Rename (with an
 * optional reading and Reset to default), Appearance (three looks), a Pat /
 * Greet preview (animation only, no reward), and "Greet together" with your
 * companion at a safe moment. Plainly: a cosmetic companion — no battle or
 * puzzle effects; no health, bond, strength or happiness meter.
 *
 * Names and readings are the player's own plain text: escaped everywhere,
 * never markup, never passed through the Japanese renderer. Animals not yet
 * met are not shown at all (no silhouettes). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  if (!RB.ui || !RB.ui.company) return;
  const esc = RB.util.esc;
  const I = (n) => RB.ui.folio.icon(n);
  const lab = (jp, en) => RB.ui.label(jp, en);
  const P = () => RB.pets;

  // A small pixel hand (the player's own skin tone) for the Pat preview.
  function hand(c, x, y, k, skin) {
    const R = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x + a * k), Math.round(y + b * k), Math.ceil(w * k), Math.ceil(h * k)); };
    const ol = '#241c20', sk = skin[0], sd = skin[1] || RB.petArt.shade(sk, -1), hl = RB.petArt.shade(sk, 1);
    R(1, 0, 9, 1, ol); R(0, 1, 1, 6, ol); R(10, 1, 1, 7, ol); R(1, 7, 3, 1, ol); R(4, 8, 6, 1, ol);
    R(1, 1, 9, 6, sk); R(4, 7, 6, 1, sd); R(1, 1, 9, 1, hl);
    R(3, 3, 1, 3, sd); R(5, 3, 1, 3, sd); R(7, 3, 1, 3, sd); // fingers
    R(10, 2, 3, 4, ol); R(10, 3, 2, 2, RB.petArt.shade(sk, -1)); // the sleeve's edge
  }
  function skinOf(s) {
    try { const col = RB.sprites.colorsOf(RB.equip.look(s)); return col.skin; } catch (e) { return ['#e8b894', '#c8906c']; }
  }

  // ---- the live preview: a canvas that animates while it is on the page ----------------------------------
  // o: { sp, look, pat (a start time: play the affection), still }
  function preview(cv, s, sp, look) {
    const c = cv.getContext('2d');
    const A = RB.petArt, W = cv.width, H = cv.height;
    const t0 = performance.now();
    let seed = 7 + sp.length * 13;
    const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    let next = 1600, idle = null;
    const st = { pat: null };
    function frame(now) {
      if (!cv.isConnected) return;
      const t = now - t0;
      const still = RB.game.reducedMotion();
      let po = { sit: sp === 'bird' ? 0 : 1 };
      if (!still) {
        if (t > next && !idle) { idle = { k: ['blink', 'ear', 'tail', 'look'][Math.floor(rnd() * 4)], t }; next = t + 2400 + rnd() * 2600; }
        if (idle && t - idle.t > 700) idle = null;
        if (idle) {
          if (idle.k === 'blink' && t - idle.t < 160) po.blink = 1;
          if (idle.k === 'ear') po.earR = 0.8;
          if (idle.k === 'tail') po[sp === 'dog' ? 'wag' : 'tFlick'] = sp === 'dog' ? Math.sin((t - idle.t) / 80) * 0.6 : 26;
          if (idle.k === 'look') po.hy = -22;
        }
        if (sp !== 'bird' && ((t / 3200) % 1) < 0.45) po.breath = 0.6;
      }
      let handAt = null;
      if (st.pat != null) {
        const k = (now - st.pat) / (still ? 1400 : 1900);
        if (k >= 1) st.pat = null;
        else {
          const aff = P().AFFECTION[sp];
          po = Object.assign(po, still ? aff.key : aff.pose(k));
          const reach = still ? 1 : Math.min(1, k / 0.25) * (k > 0.8 ? 1 - (k - 0.8) / 0.2 : 1);
          handAt = reach;
        }
      }
      const f = A.frame(sp, look, { kind: 'preview' }, quant(po));
      const sc = Math.max(1, Math.floor(Math.min(W / f.w, H / f.h)));
      c.imageSmoothingEnabled = false;
      c.clearRect(0, 0, W, H);
      // a patch of ground and its shadow
      c.fillStyle = 'rgba(80,60,30,0.16)';
      c.beginPath(); c.ellipse(W / 2, (f.ay + 1) * sc + (H - f.h * sc) / 2, (sp === 'bird' ? 7 : 13) * sc, 3 * sc, 0, 0, Math.PI * 2); c.fill();
      const ox = Math.round((W - f.w * sc) / 2), oy = Math.round((H - f.h * sc) / 2);
      c.drawImage(f.cv, ox, oy, f.w * sc, f.h * sc);
      if (handAt != null && f.head) {
        const hx = ox + f.head.x * sc + (1 - handAt) * 24 * sc - 3 * sc, hy = oy + f.head.y * sc - (sp === 'bird' ? 10 : 12) * sc - (1 - handAt) * 14 * sc;
        hand(c, hx, hy, sc, skinOf(s));
      }
      cv.dataset.frame = String((+cv.dataset.frame || 0) + 1);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return st;
  }
  function quant(po) { const o = {}; for (const k in po) { const v = po[k]; o[k] = typeof v === 'number' ? (/^(hy|hp|hr|tFlick|tUp|tSide)$/.test(k) ? Math.round(v / 4) * 4 : Math.round(v * 10) / 10) : v; } return o; }

  // ---- the page ----------------------------------------------------------------------------------------------
  function placeOf(r) {
    const m = r && r.met && r.met.map && RB.content.maps[r.met.map];
    return m && m.name ? m.name : null;
  }
  function card(s, sp, sel) {
    const r = P().record(s, sp), d = P().species(sp);
    const on = P().active(s) === sp;
    return '<li class="pet-card' + (on ? ' on' : '') + '"><button class="entry pet-pick" data-pet-sel="' + sp + '" aria-current="' + (sel === sp) + '" aria-label="' + esc(r.name + ', ' + d.label.en + (on ? ', travelling with you' : '')) + '">' +
      '<canvas class="pet-face" width="48" height="48" data-pet-face="' + sp + '" aria-hidden="true"></canvas>' +
      '<span class="body"><span class="t pet-name">' + esc(r.name) + '</span>' + (r.reading ? ' <span class="pet-reading" lang="ja">' + esc(r.reading) + '</span>' : '') +
      '<span class="kind">' + lab(d.label.jp, d.label.en) + '</span>' +
      '<span class="pet-state">' + (on ? I('done') + '<span>Travelling with you</span>' : '<span class="muted">Resting (not travelling)</span>') + '</span></span></button>' +
      '<button class="pbtn pet-choose" data-pet-choose="' + sp + '" aria-pressed="' + on + '" aria-label="' + esc((on ? 'Selected: ' : 'Select ') + r.name) + '">' + (on ? I('done') + 'Selected' : 'Select') + '</button></li>';
  }
  function list(s, V) {
    const met = P().met(s);
    const act = P().active(s);
    let h = '<h3>' + I('paw') + ' ' + lab('{動物|どうぶつ}', 'Animals you have met') + ' <span class="count">' + met.length + '</span></h3>';
    h += '<ul class="entries pet-cards">' + met.map((sp) => card(s, sp, V.petSel)).join('') +
      '<li class="pet-card none' + (!act ? ' on' : '') + '"><div class="entry"><span class="mark">' + I('companion') + '</span><span class="body"><span class="t">No pet</span><span class="muted small">Travel with no animal. Their names and looks are kept.</span></span></div>' +
      '<button class="pbtn pet-choose" data-pet-choose="" aria-pressed="' + !act + '">' + (!act ? I('done') + 'Selected' : 'Select') + '</button></li></ul>';
    const unknown = Object.keys((s.company && s.company.pets) || {}).filter((k) => !P().SPECIES[k]);
    if (unknown.length || (s.company && s.company.pet && !P().SPECIES[s.company.pet])) h += '<p class="note-slip">An animal recorded by a different version of the game is kept safely in this campaign, but cannot be shown here.</p>';
    return h;
  }
  const COSMETIC = '<p class="pet-cosmetic" role="note">' + I('help') + '<span><b>Cosmetic companion — no battle or puzzle effects.</b> It has no health, bond level, strength or happiness to look after. Petting is only a moment together.</span></p>';
  function detail(s, sp, V, two) {
    const r = P().record(s, sp), d = P().species(sp);
    if (!r) return '<p class="muted">Choose an animal to see it.</p>';
    const on = P().active(s) === sp;
    const where = placeOf(r), how = P().howMet(sp);
    const look = P().lookOf(s, sp);
    let h = (two ? '' : '<div class="backline"><button class="pbtn quiet" data-pet-back>' + I('back') + 'All animals</button></div>') +
      '<div class="pet-head"><canvas class="pet-live" width="192" height="192" data-pet-live="' + sp + '" role="img" aria-label="' + esc(r.name + ', ' + d.label.en + ', ' + RB.petArt.LOOKS[sp][look].en.toLowerCase() + (RB.game.reducedMotion() ? ' (still: reduced motion)' : ' (moving a little)')) + '"></canvas>' +
      '<div class="pet-id"><h3 class="pet-title"><span class="pet-name">' + esc(r.name) + '</span></h3>' + (r.reading ? '<div class="pet-reading" lang="ja">' + esc(r.reading) + ' <span class="muted small">(reading)</span></div>' : '') +
      '<div class="kind">' + lab(d.label.jp, d.label.en) + ' · ' + esc(RB.petArt.LOOKS[sp][look].en) + '</div>' +
      '<div class="pet-state">' + (on ? I('done') + '<span>Travelling with you</span>' : '<span class="muted">Resting (not travelling)</span>') + '</div>' +
      '<button class="pbtn' + (on ? '' : ' primary') + '" data-pet-choose="' + (on ? '' : sp) + '" aria-pressed="' + on + '">' + (on ? 'Travel without a pet' : 'Travel with ' + esc(r.name)) + '</button></div></div>' +
      '<p class="pet-about">' + esc(d.about.en) + '</p>' +
      (where || how ? '<h4>' + I('map') + ' Where you met</h4><p>' + (where ? '<span class="jt">' + RB.ui.jhtml(where.jp) + '</span> <span class="en">' + esc(where.en) + '</span>' : '') + (how ? '<br><span class="muted">' + esc(how.en) + '</span>' : '') + (r.nameAtMeet && r.nameAtMeet !== r.name ? '<br><span class="muted small">You called it ' + esc(r.nameAtMeet) + ' then.</span>' : '') + '</p>' : '');
    // rename
    h += '<h4>' + I('note') + ' Name</h4>';
    if (V.rename === sp) {
      h += '<form class="pet-rename" data-pet-form novalidate><div class="field"><label class="lab" for="pet-name">Name <span class="muted small">(up to ' + P().MAX + ' characters; any language)</span></label>' +
        '<input id="pet-name" type="text" autocomplete="off" spellcheck="false" value="' + esc(V.draft != null ? V.draft : r.name) + '" aria-describedby="pet-name-err pet-name-n"></div>' +
        '<div class="field"><label class="lab" for="pet-reading">Reading <span class="muted small">(optional, how you say it)</span></label><input id="pet-reading" type="text" autocomplete="off" spellcheck="false" lang="ja" value="' + esc(V.draftR != null ? V.draftR : r.reading || '') + '"></div>' +
        '<p class="pet-err" id="pet-name-err" role="alert">' + esc(V.err || '') + '</p><p class="muted small" id="pet-name-n"></p>' +
        '<div class="row-acts"><button class="pbtn primary" type="submit" data-pet-save>Save name</button><button class="pbtn" type="button" data-pet-cancel>Cancel</button><button class="pbtn" type="button" data-pet-reset>Reset to ' + esc(d.name) + '</button></div></form>';
    } else {
      h += '<div class="row-acts"><button class="pbtn" data-pet-rename="' + sp + '" aria-label="' + esc('Rename ' + r.name) + '">' + I('note') + 'Rename</button>' + (r.name !== d.name ? '<button class="pbtn" data-pet-reset>Reset to ' + esc(d.name) + '</button>' : '') + '</div>';
    }
    // appearance
    h += '<fieldset class="pet-looks"><legend><span>' + I('worn') + ' Appearance</span></legend><div class="pet-look-row">' + RB.petArt.LOOK_ORDER[sp].map((k) =>
      '<label class="pet-look' + (k === look ? ' on' : '') + '"><input type="radio" name="pet-look-' + sp + '" value="' + k + '" data-pet-look="' + k + '"' + (k === look ? ' checked' : '') + '><canvas width="48" height="48" data-pet-lookcv="' + k + '" aria-hidden="true"></canvas><span>' + esc(RB.petArt.LOOKS[sp][k].en) + (k === look ? ' <span class="chosen">(chosen)</span>' : '') + '</span></label>').join('') + '</div></fieldset>';
    // pat / greet
    const comp = s.comp && RB.content.chars[s.comp];
    h += '<h4>' + I('paw') + ' A moment together</h4><div class="row-acts"><button class="pbtn" data-pet-pat>' + I('paw') + 'Pat ' + esc(r.name) + '</button>' +
      (comp && on ? '<button class="pbtn" data-pet-greet>' + I('companion') + 'Greet together with ' + esc(comp.name.en) + '</button>' : '') + '</div>' +
      '<p class="muted small">' + (comp && on ? 'Greeting together closes the folio and plays a short moment in the world (only where it is safe: not during a scene or a puzzle).' : comp ? 'Select this animal to greet it together with ' + esc(comp.name.en) + '.' : 'Pat plays a short animation. Nothing is gained or lost.') + '</p>' +
      '<p class="pet-live-msg sr" aria-live="polite"></p>';
    return h + COSMETIC;
  }
  function render(A, B, two, api) {
    const s = api.s, V = api.view;
    const met = P().met(s);
    if (!met.length) {
      A.innerHTML += '';
      A.insertAdjacentHTML('beforeend', '<p>You haven’t met an animal on the road yet.</p><p class="muted">Travelling without one is a complete way to travel. An animal you befriend will be listed here, and can join you or rest.</p>' + COSMETIC);
      return;
    }
    if (!V.petSel || met.indexOf(V.petSel) < 0) V.petSel = P().active(s) || met[0];
    if (two) {
      A.insertAdjacentHTML('beforeend', list(s, V));
      B.innerHTML = '<div class="xpage co-page pet-detail">' + detail(s, V.petSel, V, true) + '</div>';
    } else if (V.detail && met.indexOf(V.detail) >= 0) {
      V.petSel = V.detail;
      A.insertAdjacentHTML('beforeend', '<div class="pet-detail">' + detail(s, V.detail, V, false) + '</div>');
    } else {
      V.detail = null;
      A.insertAdjacentHTML('beforeend', list(s, V));
    }
    const root = A.closest('.spread') || A.parentNode;
    // portraits, look swatches and the live preview
    for (const cv of root.querySelectorAll('[data-pet-face]')) P().thumb(cv, cv.dataset.petFace, P().lookOf(s, cv.dataset.petFace));
    for (const cv of root.querySelectorAll('[data-pet-lookcv]')) P().thumb(cv, V.petSel, cv.dataset.petLookcv);
    const live = root.querySelector('[data-pet-live]');
    const pv = live ? preview(live, s, V.petSel, P().lookOf(s, V.petSel)) : null;
    const say = (t) => { const m = root.querySelector('.pet-live-msg'); if (m) m.textContent = t; };
    const refocus = (sel) => { const n = root.ownerDocument.querySelector('#folio-page ' + sel); if (n) n.focus({ preventScroll: true }); };
    const counter = () => {
      const i = root.querySelector('#pet-name'), n = root.querySelector('#pet-name-n');
      if (i && n) { const c = P().cleanName(i.value); n.textContent = c.count + ' of ' + P().MAX + ' characters'; }
    };
    counter();
    const onClick = (e) => {
      const t = e.target;
      const sel = t.closest('[data-pet-sel]'), ch = t.closest('[data-pet-choose]');
      if (ch) {
        const sp = ch.dataset.petChoose || null;
        P().select(s, sp);
        RB.audio && RB.audio.sfx('confirm');
        api.remember(); api.render();
        refocus(sp ? '[data-pet-choose="' + sp + '"]' : '[data-pet-choose=""]');
        const r2 = sp && P().record(s, sp);
        const m = root.ownerDocument.querySelector('#folio-page .pet-live-msg');
        if (m) m.textContent = sp ? r2.name + ' is travelling with you.' : 'Travelling without a pet.';
        return;
      }
      if (sel) { V.petSel = sel.dataset.petSel; if (!two) V.detail = V.petSel; V.rename = null; V.err = null; api.remember(); api.render(); refocus(two ? '[data-pet-sel="' + V.petSel + '"]' : '.pet-detail .pet-title'); return; }
      if (t.closest('[data-pet-back]')) { V.detail = null; V.rename = null; api.render(); refocus('[data-pet-sel="' + V.petSel + '"]'); return; }
      const rn = t.closest('[data-pet-rename]');
      if (rn) { V.rename = rn.dataset.petRename; V.err = null; V.draft = null; V.draftR = null; api.remember(); api.render(); const i = root.ownerDocument.querySelector('#pet-name'); if (i) { i.focus(); i.select(); } return; }
      if (t.closest('[data-pet-cancel]')) { V.rename = null; V.err = null; V.draft = null; V.draftR = null; api.render(); refocus('[data-pet-rename]'); return; }
      if (t.closest('[data-pet-reset]')) { P().resetName(s, V.petSel); V.rename = null; V.err = null; V.draft = null; V.draftR = null; api.render(); refocus('[data-pet-rename]'); say('Name reset to ' + P().species(V.petSel).name + '.'); return; }
      if (t.closest('[data-pet-pat]')) { if (pv) pv.pat = performance.now(); P().sound(V.petSel, 'pat'); say('You pat ' + P().record(s, V.petSel).name + '.'); return; }
      if (t.closest('[data-pet-greet]')) {
        const why = P().canGreet(s);
        if (why !== true) { say(why); const m = root.querySelector('.pet-live-msg'); if (m) { m.classList.remove('sr'); m.classList.add('note-slip'); } return; }
        api.close();
        P().greet(s);
        return;
      }
    };
    const onSubmit = (e) => {
      if (!e.target.matches('[data-pet-form]')) return;
      e.preventDefault();
      const name = root.querySelector('#pet-name').value, reading = root.querySelector('#pet-reading').value;
      const r = P().rename(s, V.petSel, name, reading);
      if (!r.ok) { V.err = r.error; V.draft = name; V.draftR = reading; api.render(); const i = root.ownerDocument.querySelector('#pet-name'); if (i) i.focus(); return; }
      V.rename = null; V.err = null; V.draft = null; V.draftR = null;
      api.remember(); api.render(); refocus('[data-pet-rename]');
      const m = root.ownerDocument.querySelector('#folio-page .pet-live-msg'); if (m) m.textContent = 'Name saved: ' + r.value + '.';
    };
    const onChange = (e) => {
      const lk = e.target.closest('[data-pet-look]');
      if (lk) { P().setLook(s, V.petSel, lk.dataset.petLook); api.remember(); api.render(); refocus('[data-pet-look="' + lk.dataset.petLook + '"]'); }
    };
    for (const L of [A, B]) { L.addEventListener('click', onClick); L.addEventListener('submit', onSubmit); L.addEventListener('change', onChange); L.addEventListener('input', (e) => { if (e.target.id === 'pet-name') counter(); }); }
    // a phone detail: the folio's Back leaves it first
    if (!two && V.detail) api.view.detail = V.detail;
  }
  RB.ui.company.addPage({ id: 'pet', en: 'Pet', jp: '{動物|どうぶつ}', icon: 'paw', render });

  // ---- naming at acquisition: a small paper sheet (plain text, the same rules as Rename) ------------------------
  // Resolves with the name it will be called (the default kept if the sheet is closed).
  RB.ui.petName = function (s, sp) {
    return new Promise((res) => {
      const d = P().species(sp), r = P().record(s, sp);
      if (!d || !r) { res(r ? r.name : ''); return; }
      const el = RB.ui.el;
      const scrim = el('div', 'scrim confirm-scrim');
      const panel = el('div', 'csheet pet-namesheet');
      const tid = 'pn' + Math.random().toString(36).slice(2, 7);
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      panel.setAttribute('aria-labelledby', tid);
      panel.innerHTML = '<form data-pet-nameform novalidate><canvas class="pet-live" width="144" height="144" aria-hidden="true"></canvas>' +
        '<p class="q" id="' + tid + '">What will you call the ' + esc(d.label.en.toLowerCase()) + '?</p>' +
        '<div class="field"><label class="lab" for="pn-name">Name <span class="muted small">(up to ' + P().MAX + ' characters; any language)</span></label><input id="pn-name" type="text" autocomplete="off" spellcheck="false" value="' + esc(r.name) + '" aria-describedby="pn-err"></div>' +
        '<div class="field"><label class="lab" for="pn-reading">Reading <span class="muted small">(optional)</span></label><input id="pn-reading" type="text" autocomplete="off" spellcheck="false" lang="ja" value="' + esc(r.reading || '') + '"></div>' +
        '<p class="pet-err" id="pn-err" role="alert"></p>' +
        '<div class="foot"><button class="pbtn primary" type="submit">Use this name</button><button class="pbtn" type="button" data-keep>Keep ' + esc(d.name) + '</button></div></form>';
      const layer = { el: scrim, name: 'pet-name' };
      const done = (name) => { RB.ui.popLayer(layer); res(name); };
      layer.onCancel = () => { P().resetName(s, sp); done(P().record(s, sp).name); };
      panel.querySelector('[data-keep]').onclick = () => { P().resetName(s, sp); done(P().record(s, sp).name); };
      panel.querySelector('form').onsubmit = (e) => {
        e.preventDefault();
        const out = P().rename(s, sp, panel.querySelector('#pn-name').value, panel.querySelector('#pn-reading').value);
        if (!out.ok) { panel.querySelector('#pn-err').textContent = out.error; panel.querySelector('#pn-name').focus(); return; }
        done(out.value);
      };
      scrim.appendChild(panel);
      RB.ui.pushLayer(layer);
      preview(panel.querySelector('canvas'), s, sp, P().lookOf(s, sp));
      setTimeout(() => { const i = panel.querySelector('#pn-name'); if (i) { i.focus(); i.select(); } }, 30);
    });
  };
})();
