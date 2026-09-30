/* Field weaving: the Weave action beside ordinary Inspect, the target frame
 * and its readable list, the known response repertoire, the language step
 * (the real RB.challenge.runStep), and the field presentation of what the
 * rules decided (addendum §13; docs/addendum/fieldweave.md).
 *
 *   V (remappable: Settings › Keys › "Weave a word"), the HUD's Weave tag or
 *   the touch pad's Weave button opens the sheet when an authored puzzle
 *   object is within two tiles. Arrow keys / Tab move between nearby things
 *   and words; Escape, Cancel or V again closes it and changes nothing.
 *
 * Order of every field action: language step (only when one is needed) →
 * RB.fieldweave commits the result → this module shows it: anticipation,
 * gesture, the paper slip travelling to the actual target, the effect there
 * (the battle's own paper-and-ink effects, RB.battleFx), the object's change
 * at that beat, recovery; then the physical explanation, and on completion
 * the keepsake line and the companion's first, brief reaction. Presentation
 * never writes state; skipping or reduced motion show the same result. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.hooks = RB.hooks || {};

RB.weave = (function () {
  'use strict';
  const esc = RB.util.esc;
  const FW = () => RB.fieldweave;
  const S = () => RB.game.s;
  const I = (n) => (RB.ui.folio ? RB.ui.folio.icon(n) : '');
  const TAG_ICON = [['ward', 'shield'], ['water', 'drop'], ['light', 'sun'], ['heal', 'leaf'], ['wind', 'wind'], ['bind', 'rope'], ['anchor', 'stone'], ['stone', 'stone'], ['fire', 'flame'], ['warm', 'flame'], ['bell', 'bell'], ['voice', 'sound']];
  const wordIcon = (w) => { for (const [t, n] of TAG_ICON) if ((w.tags || []).indexOf(t) >= 0) return n; return 'words'; };
  const auto = () => !!(RB.test && RB.test.auto);

  let panel = null;       // the open sheet: { el, layer, targets, i }
  let busy = false;       // a field action is being chosen, written or shown
  let pendingOpen = null; // a Weave chosen from an inspection menu: open once the scene is over
  let cur = null;         // the running presentation
  let labelEl = null;

  // ---- what the player can weave -------------------------------------------------------------
  function known(s) {
    const order = Object.keys(RB.content.words);
    return (s.words || []).filter((w) => RB.content.words[w]).sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }
  function nearby() {
    const W = RB.world.W, s = S();
    if (!s || !W.map || !W.player) return [];
    const out = FW().near(s, W.map.id, W.player.x, W.player.y, W.player.dir);
    // an animal's meeting place (src/content/pets/): its restless cause can be settled by a gentle word
    // too (RB.pets.fieldTargets / fieldWeave); the ordinary way there needs no word at all
    if (RB.pets && RB.pets.fieldTargets) {
      for (const t of RB.pets.fieldTargets(s, W.map.id, W.player.x, W.player.y)) out.push({ pet: t.id, pz: null, key: 'pet:' + t.id, x: t.x, y: t.y, w: 1, h: 1, d: t.d, o: { name: t.label } });
    }
    return out;
  }
  // what the player sees of an animal's meeting place (the vignette's own words for its state)
  function petLook(T) {
    const v = RB.pets.vignettes[T.pet];
    const l = v && v.fieldNeutral && (v.fieldNeutral['*'] || null);
    return l ? { lines: [l] } : null;
  }
  function available() {
    return !!(RB.game.mode() === 'world' && !busy && S() && known(S()).length && nearby().length);
  }
  // a condition term for scenes: `weave` holds once any inscription word is known
  RB.state.addTerm('weave', (s) => (s.words || []).some((w) => RB.content.words[w]));

  // ---- the Weave button (HUD tag and touch pad), kept in step each tick ----------------------------
  let hudBtn = null, tpBtn = null, lastAvail = null;
  function ensureButtons() {
    const hud = document.querySelector('.hud');
    if (hud && !hudBtn) {
      hudBtn = RB.ui.el('button', 'hbtn weave-b hidden');
      hudBtn.type = 'button';
      hudBtn.innerHTML = I('practice') + '<span class="l">Weave</span><span class="st" aria-hidden="true">' + esc(keyLabel()) + '</span>';
      hudBtn.onclick = () => open();
      hud.insertBefore(hudBtn, hud.firstChild);
    }
    const acts = document.querySelector('.touchpad .tp-acts');
    if (acts && !tpBtn) {
      tpBtn = RB.ui.el('button', 'tp-weave hidden');
      tpBtn.type = 'button';
      tpBtn.setAttribute('aria-label', 'Weave a word on something nearby');
      tpBtn.innerHTML = '<span class="k" aria-hidden="true">' + I('practice') + '</span><span class="l">Weave</span>';
      tpBtn.addEventListener('click', () => open());
      acts.insertBefore(tpBtn, acts.firstChild);
    }
  }
  function keyLabel() {
    const b = RB.input.getBinds().weave;
    return b && b.length ? RB.input.keyName(b[0]) : '';
  }
  let acc = 0;
  function tick(dt) {
    acc += dt;
    if (pendingOpen && RB.game.mode() === 'world' && !RB.script.isRunning()) { const p = pendingOpen; pendingOpen = null; open(p); }
    if (acc < 150) return;
    acc = 0;
    ensureButtons();
    const on = available();
    if (on !== lastAvail) {
      lastAvail = on;
      if (hudBtn) { hudBtn.classList.toggle('hidden', !on); hudBtn.querySelector('.st').textContent = keyLabel(); }
      if (tpBtn) tpBtn.classList.toggle('hidden', !on);
      document.body.classList.toggle('can-weave', on);
    }
  }

  // ---- the sheet -----------------------------------------------------------------------------------
  // o: { pz, key } to start on a particular object (from its inspection menu)
  function open(o) {
    if (panel || busy || RB.game.mode() !== 'world') return false;
    const s = S();
    const targets = nearby();
    if (!targets.length) return false;
    if (!known(s).length) { RB.ui.notice('You do not know any inscription words yet.', 'info'); return false; }
    let i = 0;
    if (o) { const j = targets.findIndex((t) => t.pz === o.pz && t.key === o.key); if (j >= 0) i = j; }
    busy = true;
    RB.game.pushMode('weave');
    RB.audio && RB.audio.sfx('menu_open', { vol: 0.6 });
    const el = RB.ui.el('div', 'weave-sheet');
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-labelledby', 'wv-title');
    el.innerHTML = '<div class="wv-frame">' +
      '<div class="wv-head"><h2 id="wv-title">' + I('practice') + '<span>Weave</span></h2>' +
        '<button type="button" class="cbtn wv-cancel" data-a="cancel">' + I('close') + '<span>Cancel</span></button></div>' +
      '<div class="wv-body">' +
        '<div class="wv-near"><div class="wv-lab" id="wv-near-lab">Nearby</div><div class="wv-targets" role="radiogroup" aria-labelledby="wv-near-lab"></div></div>' +
        '<div class="wv-look slip" aria-live="polite"></div>' +
        '<div class="wv-lab" id="wv-words-lab">Your words</div>' +
        '<div class="wv-words" role="group" aria-labelledby="wv-words-lab"></div>' +
        '<div class="wv-foot"><button type="button" class="pbtn quiet" data-a="hint">' + I('bulb') + '<span>Think it over</span></button>' +
          '<button type="button" class="pbtn quiet hidden" data-a="reset">' + I('back') + '<span>Set it back as it was</span></button></div>' +
        '<div class="wv-hint" aria-live="polite"></div>' +
      '</div></div>';
    const layer = { el, name: 'weave', noAutofocus: true };
    panel = { el, layer, targets, i };
    layer.onCancel = () => close();
    layer.onAction = (a) => {
      if (a === 'weave') { close(); return true; }
      // in the list of nearby things the arrow keys change the target (a radio
      // group); elsewhere in the sheet they move the focus as usual
      const f = document.activeElement;
      if ((a === 'left' || a === 'right' || a === 'up' || a === 'down') && f && f.closest && f.closest('.wv-targets') && panel && panel.el.contains(f)) {
        select(panel.i + (a === 'left' || a === 'up' ? -1 : 1));
        const nb = panel.el.querySelector('.wv-t[aria-checked="true"]');
        if (nb) nb.focus({ preventScroll: true });
        return true;
      }
      return false;
    };
    el.addEventListener('click', onClick);
    RB.ui.pushLayer(layer);
    render();
    setTimeout(() => { const f = el.querySelector('.wv-t[aria-checked="true"]') || el.querySelector('.wv-w'); if (f && panel) f.focus({ preventScroll: true }); }, 0);
    return true;
  }
  function close(keepBusy) {
    if (!panel) return;
    const p = panel;
    panel = null;
    RB.ui.popLayer(p.layer);
    if (labelEl) { labelEl.remove(); labelEl = null; }
    if (!keepBusy) {
      busy = false;
      RB.game.popMode('weave');
      RB.input.clearHeld && RB.input.clearHeld();
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    }
  }
  function target() { return panel ? panel.targets[panel.i] : null; }
  function select(i) {
    if (!panel) return;
    panel.i = (i + panel.targets.length) % panel.targets.length;
    render(true);
    RB.audio && RB.audio.sfx('cursor', { vol: 0.5 });
  }
  function lookHtml(l) {
    if (!l) return '';
    const lines = l.lines || [l];
    return lines.map((x) => '<div class="wv-l">' + (x.jp ? RB.ui.jhtml(x.jp) : '') + '<div class="en">' + esc(RB.script.enVars(x.en || '')) + '</div></div>').join('');
  }
  function render(keepFocus) {
    if (!panel) return;
    const s = S(), el = panel.el, T = target();
    const had = keepFocus && document.activeElement && el.contains(document.activeElement) ? document.activeElement.getAttribute('data-t') : null;
    el.querySelector('.wv-targets').innerHTML = panel.targets.map((t, i) => {
      const n = t.o.name || { en: t.key };
      return '<button type="button" class="wv-t" role="radio" data-t="' + i + '" aria-checked="' + (i === panel.i) + '" tabindex="' + (i === panel.i ? 0 : -1) + '">' +
        (n.jp ? RB.ui.jhtml(n.jp) : '') + '<span class="en">' + esc(n.en) + '</span></button>';
    }).join('');
    const l = T.pet ? petLook(T) : FW().lookOf(s, T.pz, T.key);
    if (!T.pet && l && l.obs) FW().observe(s, T.pz, l.obs);
    const nm = T.o.name || { en: T.key };
    el.querySelector('.wv-look').innerHTML = '<div class="wv-name">' + (nm.jp ? RB.ui.jhtml(nm.jp) : '') + '<span class="en">' + esc(nm.en) + '</span></div>' + lookHtml(l);
    const hi = RB.pad && RB.pad.kanjiPreferred ? RB.pad.kanjiPreferred() : ['I', 'A'].indexOf(s.learn.profile) >= 0;
    el.querySelector('.wv-words').innerHTML = known(s).map((id) => {
      const w = RB.content.words[id];
      return '<button type="button" class="wv-w" data-w="' + id + '">' +
        '<span class="ic">' + I(wordIcon(w)) + '</span>' +
        '<span class="wv-wj">' + RB.ui.jhtml(hi && w.jpK ? w.jpK : w.jp) + '</span>' +
        '<span class="wv-we">' + esc(w.en) + '</span>' +
        (!T.pet && FW().routine(s, T.pz, T.key, id) ? '<span class="wv-wr">Done here before</span>' : '') + '</button>';
    }).join('');
    if (T.pet) {
      el.querySelector('[data-a=reset]').classList.add('hidden');
      el.querySelector('[data-a=hint]').classList.add('hidden');
      el.querySelector('.wv-hint').innerHTML = '';
      if (had != null) { const b = el.querySelector('[data-t="' + panel.i + '"]'); if (b) b.focus({ preventScroll: true }); }
      dock(); placeLabel();
      return;
    }
    const def = FW().get(T.pz), r = FW().peek(s, T.pz);
    const moved = !r.done && !r.virtual && JSON.stringify(r.state) !== JSON.stringify(def.init);
    el.querySelector('[data-a=reset]').classList.toggle('hidden', !moved || !!def.noReset);
    el.querySelector('[data-a=hint]').classList.toggle('hidden', !def.hints || !def.hints.length);
    renderHint(false);
    if (had != null) { const b = el.querySelector('[data-t="' + panel.i + '"]'); if (b) b.focus({ preventScroll: true }); }
    dock();
    placeLabel();
  }
  // Keep the player and the chosen thing in view: beside them on wide screens,
  // otherwise above or below them, whichever side they are not on (the camera
  // never moves for a panel).
  function dock() {
    if (!panel) return;
    const el = panel.el, T = target(), p = RB.world.W.player;
    const wide = window.innerWidth >= 900 || (window.innerHeight < 520 && window.innerWidth > window.innerHeight * 1.3);
    el.classList.toggle('side', wide);
    if (wide || !T || !p) { el.classList.remove('top'); return; }
    const ty = RB.render.tileToCss(T.x, T.y - (T.o.tall || 0.6)).y, tb = RB.render.tileToCss(T.x, T.y + T.h).y;
    const py = RB.render.tileToCss(p.x, p.y - 1).y, pb = RB.render.tileToCss(p.x, p.y + 1).y;
    const lowest = Math.max(tb, pb), highest = Math.min(ty, py), H = window.innerHeight;
    // room below the lowest of them vs. room above the highest
    el.classList.toggle('top', H - lowest < highest);
  }
  function renderHint(step) {
    if (target() && target().pet) return;
    const s = S(), T = target(), def = FW().get(T.pz), box = panel.el.querySelector('.wv-hint');
    if (step) FW().hint(s, T.pz);
    const n = FW().hintLevel(s, T.pz);
    box.innerHTML = n ? '<ol class="wv-hints">' + def.hints.slice(0, n).map((h, i) => '<li><span class="lv">' + ['A nudge', 'Closer', 'The whole way'][i] + '</span>' + (h.jp ? RB.ui.jhtml(h.jp) : '') + '<div class="en">' + esc(RB.script.enVars(h.en)) + '</div></li>').join('') + '</ol>' : '';
    const hb = panel.el.querySelector('[data-a=hint] span');
    hb.textContent = n >= (def.hints || []).length ? 'Thought over' : n ? 'Think a little more' : 'Think it over';
    panel.el.querySelector('[data-a=hint]').disabled = n >= (def.hints || []).length;
  }
  // the object's name over it in the world (text lives in the DOM, never the canvas)
  function placeLabel() {
    const T = target();
    if (!T) return;
    if (!labelEl) { labelEl = RB.ui.el('div', 'wv-label'); labelEl.setAttribute('aria-hidden', 'true'); document.getElementById('overlay').appendChild(labelEl); }
    const nm = T.o.name || { en: T.key };
    labelEl.innerHTML = '<span class="en">' + esc(nm.en) + '</span>';
    const a = RB.render.tileToCss(T.x, T.y - (T.o.tall || 0.6)), b = RB.render.tileToCss(T.x + T.w, T.y);
    labelEl.style.left = Math.round((a.x + b.x) / 2) + 'px';
    labelEl.style.top = Math.round(a.y - 10) + 'px';
  }
  function onClick(e) {
    const b = e.target.closest('button');
    if (!b || !panel || !panel.el.contains(b) || b.disabled) return;
    if (b.dataset.t != null) { select(+b.dataset.t); return; }
    if (b.dataset.w) { choose(b.dataset.w); return; }
    const a = b.dataset.a;
    if (a === 'cancel') close();
    else if (a === 'hint') { renderHint(true); RB.audio && RB.audio.sfx('page', { vol: 0.5 }); }
    else if (a === 'reset') resetTarget();
  }
  // clicking or tapping a nearby thing in the world selects it while the sheet is open
  function onCanvasPointer(e) {
    if (!panel) return;
    const cam = RB.render.cam, k = RB.render.viewSize().scale, r = e.target.getBoundingClientRect();
    const tx = Math.floor(((e.clientX - r.left) / k + cam.x) / RB.render.TS), ty = Math.floor(((e.clientY - r.top) / k + cam.y) / RB.render.TS);
    const j = panel.targets.findIndex((t) => tx >= t.x && tx < t.x + t.w && ty >= t.y - 1 && ty < t.y + t.h);
    if (j >= 0) { select(j); const b = panel.el.querySelector('.wv-t[aria-checked="true"]'); if (b) b.focus({ preventScroll: true }); }
  }

  // ---- choosing a word: language step, then the world decides -------------------------------------
  function stepFor(w, T) {
    const s = S();
    const hi = RB.pad && RB.pad.kanjiPreferred ? RB.pad.kanjiPreferred() : ['I', 'A'].indexOf(s.learn.profile) >= 0;
    return RB.tasks.prepare({
      kind: 'write', item: 'v:' + (w.lex || w.r), answer: w.r, accept: [w.r, RB.tasks.plain(w.jpK || w.jp)], mode: 'reading',
      title: 'Weave the inscription', prompt: { en: 'Write the word for “' + w.en + '”' + (hi ? ' (kana or kanji).' : '.') },
      explain: { jp: w.jpK || w.jp, en: w.en },
    });
    void T;
  }
  function situationHtml(w, T) {
    const nm = T.o.name || { en: T.key };
    return '<div class="wv-situ">' + I(wordIcon(w)) + '<span>You weave <b>' + esc(w.en) + '</b> on <b>' + esc(nm.en) + '</b>' + (nm.jp ? ' <span class="jp">' + RB.ui.jhtml(nm.jp) + '</span>' : '') + '. Nothing moves until you finish writing.</span></div>';
  }
  async function choose(word) {
    const s = S(), T = target(), w = RB.content.words[word];
    if (!T || !w) return;
    const direct = !T.pet && FW().routine(s, T.pz, T.key, word);
    let lang = null;
    if (!direct) {
      // the sheet steps aside for the writing (the frame stays on the target)
      panel.el.classList.add('hidden');
      if (labelEl) labelEl.classList.add('hidden');
      const res = await RB.challenge.runStep(stepFor(w, T), { header: situationHtml(w, T), allowCancel: true, cancelLabel: 'Choose a different word', ctxTag: 'weave:' + T.pz });
      if (!panel) return;
      panel.el.classList.remove('hidden');
      if (labelEl) labelEl.classList.remove('hidden');
      // backed out: back to the sheet, nothing changed
      if (res.cancelled) { const b = panel.el.querySelector('[data-w="' + word + '"]'); if (b) b.focus({ preventScroll: true }); return; }
      lang = { mode: res.mode, assisted: !!res.assisted, firstTry: res.firstTry !== false, mistakes: res.mistakes || 0 };
    } else lang = { mode: 'routine', assisted: false, firstTry: true, mistakes: 0, routine: true };
    // the language step is over; now only the world answers
    close(true);
    if (T.pet) {
      // an animal's meeting place: the same state the ordinary interaction reaches (or neutral words)
      const fam = RB.families && RB.families.ofResponse ? RB.families.ofResponse('w:' + word) : null;
      const r = RB.pets.fieldWeave(s, T.pet, fam) || { say: [] };
      try {
        if (r.say.length && !auto()) await RB.script.runInline(r.say.map((l) => ({ who: 'narr', jp: l.jp, en: l.en })));
      } finally { busy = false; RB.game.popMode('weave'); RB.input.clearHeld && RB.input.clearHeld(); }
      return;
    }
    const res = FW().weave(s, T.pz, T.key, word, lang);
    try { await present(res, T, {}); } finally { busy = false; RB.game.popMode('weave'); RB.input.clearHeld && RB.input.clearHeld(); }
  }
  async function resetTarget() {
    const s = S(), T = target();
    const def = FW().get(T.pz);
    close(true);
    const before = JSON.parse(JSON.stringify(FW().stateOf(s, T.pz)));
    if (FW().reset(s, T.pz)) {
      const res = { pz: T.pz, kind: 'reset', before, after: FW().stateOf(s, T.pz), effective: true, say: [def.resetSay || { jp: '{元|もと} の {形|かたち} に {戻|もど}した 。', en: 'You set everything back the way it was.' }], id: 'fw:' + T.pz + ':reset' };
      try { await present(res, T, {}); } finally { busy = false; RB.game.popMode('weave'); }
    } else { busy = false; RB.game.popMode('weave'); }
  }

  // ---- presentation --------------------------------------------------------------------------------
  // The rules have already committed `res`; this shows it and says why.
  async function present(res, T, o) {
    const s = S();
    const def = FW().get(res.pz);
    T = T || targetFor(res, o.prop);
    // the object keeps its old look until the effect's beat
    if (res.effective) FW().setHold(res.pz, res.before);
    RB.bus.emit('present:action', {
      scope: 'field', actor: 'pc', action: res.word || res.act || res.kind, family: res.family || (res.kind === 'act' ? 'support' : null),
      targets: T ? ['obj:' + res.pz + '.' + T.key] : [], at: T ? { map: def.map, x: T.x, y: T.y } : null,
      result: res.completed ? 'complete' : res.effective ? 'effective' : 'neutral', id: res.id,
    });
    await play(res, T);
    FW().setHold(res.pz, null);
    const lines = [];
    for (const l of res.say || []) lines.push({ who: 'narr', jp: l.jp, en: l.en });
    if (res.completed && res.first && def.reward && def.reward.say) for (const l of [].concat(def.reward.say)) lines.push({ who: l.who || 'narr', expr: l.expr, jp: l.jp, en: l.en });
    // the companion's first, brief reaction to what actually happened
    if (res.completed && res.first && s.comp && RB.company && RB.company.react) {
      const r = RB.company.react(s, { id: 'puzzle:' + res.pz + ':done', event: 'puzzle:' + res.pz, facts: { method: res.method } });
      if (r && r.lines && r.lines[0]) { lines.push({ who: r.comp, expr: r.expr || 'smile', jp: r.lines[0].jp, en: r.lines[0].en }); res.reaction = r.id; }
    }
    if (lines.length) {
      if (o.inScene) for (const l of lines) await RB.ui.dialogue.say(l);
      else await RB.script.runInline(lines);
    }
    if (res.effective || res.completed) RB.save.autosave('progress');
    if (RB.world.W.map) { RB.world.refreshActors(); RB.world.unstick(RB.world.W.player); }
    return res;
  }
  function targetFor(res, prop) {
    const def = FW().get(res.pz);
    const key = res.key || (prop && prop.o && prop.o.part);
    const o = key && def.objects[key];
    if (o) return { pz: res.pz, key, o, x: o.x, y: o.y, w: o.w, h: o.h };
    if (prop) return { pz: res.pz, key: null, o: {}, x: prop.x, y: prop.y, w: 1, h: 1 };
    return null;
  }
  // timings (ms) of the beats; reduced motion keeps the beats, drops the travel
  const BEATS = {
    weave: { dip: 0, raise: 220, send: 380, hit: 640, beat: 780, fx: 1260, rec: 1560 },
    act: { dip: 0, raise: 90, send: 90, hit: 200, beat: 260, fx: 420, rec: 560 },
    reset: { dip: 0, raise: 60, send: 60, hit: 120, beat: 160, fx: 360, rec: 420 },
  };
  function play(res, T) {
    const kind = res.kind === 'weave' ? 'weave' : res.kind === 'reset' ? 'reset' : 'act';
    const still = RB.game.reducedMotion();
    let B = BEATS[kind];
    if (still) B = kind === 'weave' ? { dip: 0, raise: 60, send: 60, hit: 120, beat: 160, fx: 520, rec: 600 } : { dip: 0, raise: 0, send: 0, hit: 0, beat: 0, fx: 220, rec: 260 };
    if (auto() || !T) { FW().setHold(res.pz, null); return Promise.resolve(); }
    const W = RB.world.W, p = W.player;
    // face what you are working on
    if (T) RB.world.faceTo(p, T.x + Math.floor((T.w - 1) / 2), T.y + T.h - 1);
    RB.audio && RB.audio.sfx(kind === 'weave' ? 'pen_stroke' : 'cursor', { vol: 0.5 });
    return new Promise((done) => {
      cur = { res, T, t0: performance.now(), B, still, kind, fam: res.family, done, beaten: false };
      p.overlay = (c, fx, fy, t) => drawHand(c, fx, fy, t);
      // a safety net: a hidden tab or a lost frame never strands the lock
      cur.timer = setTimeout(() => finish(), B.rec + 1500);
    });
  }
  function finish() {
    if (!cur) return;
    const c = cur;
    cur = null;
    clearTimeout(c.timer);
    const p = RB.world.W.player;
    if (p) { p.overlay = null; p.dy = 0; }
    FW().setHold(c.res.pz, null);
    c.done();
  }
  // Called each frame from the renderer (src/engine/60_render.js): the target
  // frame while choosing, persistent support marks, and the running action.
  function draw(c, env, t) {
    const W = RB.world.W, s = S();
    if (!W.map || !s) return;
    const A = { ax: env.ax, ay: env.ay, TS: env.TS };
    marks(c, A, s, W.map.id, t);
    if (panel && target()) frame(c, A, target(), t);
    if (!cur) return;
    const k = performance.now() - cur.t0, B = cur.B;
    if (!cur.hit && k >= B.hit && cur.kind === 'weave') { cur.hit = true; RB.audio && RB.audio.sfx(cur.res.effective ? FAM_SFX[cur.fam] || 'reveal' : 'cancel', { vol: 0.45 }); }
    if (!cur.beaten && k >= B.beat) { cur.beaten = true; FW().setHold(cur.res.pz, null); if (cur.res.completed) RB.audio && RB.audio.sfx('discover', { vol: 0.45 }); }
    const p = W.player;
    p.dy = k < B.raise ? 1 : k < B.fx ? 0 : 0;
    if (cur.kind === 'weave') weaveFx(c, A, cur, k, t);
    else if (cur.T && k >= B.hit && k < B.fx + 200) dust(c, A, cur.T, (k - B.hit) / (B.fx + 200 - B.hit));
    if (cur.res.completed && k >= B.beat) seal(c, A, cur.T, (k - B.beat) / Math.max(1, B.rec - B.beat), cur.still);
    if (k >= B.rec) finish();
  }
  // screen anchors for the battle's effects, adapted to the top-down world
  function anchors(A) {
    const W = RB.world.W, p = W.player, T = cur.T;
    const px = A.ax(p.fx * A.TS) + 16, py = A.ay(p.fy * A.TS) + 30;
    const side = { up: [7, -34], down: [9, -22], left: [-11, -24], right: [11, -24] }[p.dir] || [9, -22];
    const tx = A.ax((T.x + T.w / 2) * A.TS), ty = A.ay((T.y + T.h / 2) * A.TS) - 6;
    const at = { core: { x: tx, y: ty }, chest: { x: tx, y: ty }, top: { x: tx, y: ty - 12 }, head: { x: tx, y: ty - 12 }, base: { x: tx, y: ty + 10 }, feet: { x: tx, y: ty + 12 }, hand: { x: tx, y: ty } };
    const me = { hand: { x: px + side[0], y: py + side[1] }, chest: { x: px, y: py - 24 }, head: { x: px, y: py - 44 }, core: { x: px, y: py - 24 }, feet: { x: px, y: py }, top: { x: px, y: py - 50 }, base: { x: px, y: py } };
    return {
      u: 1, foeR: 14 * Math.max(T.w, T.h), wardR: 16 * Math.max(T.w, T.h), partyW: 24, knotSpan: 10,
      pt(id, part) { return (id === 'pc' ? me : at)[part] || (id === 'pc' ? me.core : at.core); },
    };
  }
  // quiet sounds that follow the effect (never the only sign of anything)
  const FAM_SFX = { protect: 'ward', water: 'water', light: 'light', wind: 'wind', bind: 'knot_untie', stone: 'bump', ice: 'water', fire: 'fire_out', bell: 'bell', heal: 'heal' };
  const FAM_FX = {
    protect: ['sealForm', { to: 'foe' }], water: ['splash', { from: 'pc' }], light: ['flash', { from: 'pc' }],
    wind: ['wind', { from: 'pc' }], bind: ['rope', {}], stone: ['stone', { who: ['foe'] }], ice: ['frost', { to: 'foe' }],
    fire: ['warm', { who: ['foe'] }], bell: ['rings', {}], heal: ['motes', { who: ['foe'] }],
  };
  function weaveFx(c, A, run, k, t) {
    const F = RB.battleFx && RB.battleFx.fx;
    if (!F) return;
    const B = run.B, An = anchors(A), still = run.still;
    const seg = (a, b) => Math.max(0, Math.min(1, (k - a) / Math.max(1, b - a)));
    // anticipation: ink gathers at the hand
    if (k < B.send + 80) halo(c, An.pt('pc', 'hand'), 2 + 5 * seg(B.dip, B.raise), 'rgba(42,32,36,', 0.6 * (1 - seg(B.send, B.send + 80)));
    // the written slip travels to the target
    if (!still && k >= B.send && k < B.hit + 60) try { F.note(c, { p: { from: 'pc', to: 'foe', fade: true } }, seg(B.send, B.hit + 60), An, t, false); } catch (e) { /* drawing only */ }
    if (k < B.hit) return;
    const kk = seg(B.hit, B.fx);
    if (run.res.effective) {
      const f = FAM_FX[run.fam];
      if (f && F[f[0]]) try { F[f[0]](c, { p: f[1] }, kk, An, t, still); } catch (e) { /* drawing only */ }
      if (still) ring(c, An.pt('foe', 'core'), 14, '#fff4c8', 0.8 * (1 - kk));
    } else {
      // the word took form, found nothing here to act on, and the paper settles
      const o = An.pt('foe', 'core');
      for (let i = 0; i < 5; i++) {
        const dx = (i - 2) * 5 + (still ? 0 : Math.sin(t / 160 + i) * 2), dy = still ? 4 : kk * 14 + i;
        c.globalAlpha = 0.85 * (1 - kk);
        c.fillStyle = i % 2 ? '#efe4c8' : '#dccb9e';
        c.fillRect(Math.round(o.x + dx), Math.round(o.y - 6 + dy), 3, 2);
      }
      c.globalAlpha = 1;
    }
  }
  function halo(c, p, r, col, a) {
    if (a <= 0.01) return;
    for (let i = 3; i >= 1; i--) { c.fillStyle = col + (a * 0.25 * i).toFixed(3) + ')'; const rr = Math.round(r * (1 + (3 - i) * 0.5)); c.fillRect(Math.round(p.x - rr), Math.round(p.y - rr), rr * 2, rr * 2); }
  }
  function ring(c, p, r, col, a) {
    if (a <= 0.01) return;
    c.globalAlpha = a; c.fillStyle = col;
    const n = Math.max(12, Math.round(r * 2));
    for (let i = 0; i < n; i++) { const g = (i / n) * Math.PI * 2; c.fillRect(Math.round(p.x + Math.cos(g) * r), Math.round(p.y + Math.sin(g) * r * 0.8), 2, 2); }
    c.globalAlpha = 1;
  }
  // a small puff where a hand moved something
  function dust(c, A, T, k) {
    const x = A.ax((T.x + T.w / 2) * A.TS), y = A.ay((T.y + T.h) * A.TS) - 6;
    c.globalAlpha = 0.5 * (1 - k); c.fillStyle = '#e8dcc0';
    for (let i = 0; i < 4; i++) c.fillRect(Math.round(x + (i - 1.5) * 6 * (0.5 + k)), Math.round(y - k * 6 - (i % 2) * 2), 2, 2);
    c.globalAlpha = 1;
  }
  // completion: a paper seal stamps quietly at the object (not fireworks)
  function seal(c, A, T, k, still) {
    if (!T || k > 1) return;
    const x = A.ax((T.x + T.w / 2) * A.TS), y = A.ay(T.y * A.TS) - 10;
    const a = still ? 0.9 * (1 - k) : Math.sin(Math.PI * Math.min(1, k)) * 0.95;
    c.globalAlpha = a;
    c.fillStyle = '#2a2024'; c.fillRect(x - 5, y - 5, 10, 10);
    c.fillStyle = '#c8503a'; c.fillRect(x - 4, y - 4, 8, 8);
    c.fillStyle = '#efe4c8'; c.fillRect(x - 2, y - 1, 4, 1); c.fillRect(x - 1, y - 2, 1, 4);
    c.globalAlpha = 1;
    if (!still) ring(c, { x, y }, 6 + k * 10, '#fff4c8', 0.7 * (1 - k));
  }
  // The raised hand with the brush (anticipation → gesture → recovery),
  // drawn over the player's own figure in its sleeve colour.
  function drawHand(c, fx, fy, t) {
    if (!cur) return;
    const k = performance.now() - cur.t0, B = cur.B, p = RB.world.W.player;
    if (k > B.rec) return;
    const up = Math.max(0, Math.min(1, k < B.raise ? k / Math.max(1, B.raise) : k < B.fx ? 1 : 1 - (k - B.fx) / Math.max(1, B.rec - B.fx)));
    if (up <= 0.02) return;
    const pal = RB.sprites._art && p.look && RB.sprites._art.palette ? RB.sprites._art.palette(p.look) : null;
    const sleeve = pal && pal.cl ? pal.cl : ['#3a2e48', '#4a3c5a', '#5a4a6a', '#6e5e80', '#8a7a9a'];
    const skin = pal && pal.sk ? pal.sk : ['#c89070', '#f0c8a0'];
    const dir = p.dir, sx = dir === 'left' ? -1 : 1;
    // shoulder on the side that faces the work; the forearm lifts toward it
    const sh = { up: [fx + 8, fy - 34], down: [fx + 9, fy - 32], left: [fx - 4, fy - 32], right: [fx + 4, fy - 32] }[dir] || [fx + 8, fy - 33];
    const reach = { up: [4, -16], down: [6, -12], left: [-12, -8], right: [12, -8] }[dir] || [4, -14];
    const hx = Math.round(sh[0] + reach[0] * up), hy = Math.round(sh[1] + reach[1] * up);
    const seg = (x0, y0, x1, y1, w, col) => {
      const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0)));
      c.fillStyle = col;
      for (let i = 0; i <= n; i++) c.fillRect(Math.round(x0 + ((x1 - x0) * i) / n - w / 2), Math.round(y0 + ((y1 - y0) * i) / n - w / 2), w, w);
    };
    seg(sh[0], sh[1], hx, hy, 5, '#241c20');
    seg(sh[0], sh[1], hx, hy, 3, sleeve[2]);
    seg(sh[0] - 1, sh[1], hx - 1, hy, 1, sleeve[3]);
    c.fillStyle = '#241c20'; c.fillRect(hx - 2, hy - 3, 5, 5);
    c.fillStyle = skin[2] || skin[0]; c.fillRect(hx - 1, hy - 2, 3, 3);
    if (cur.kind === 'weave') {
      // the brush held upright, its tip inked; a drop of ink at the tip while gathering
      const bx = hx + (dir === 'left' ? -1 : 1), by = hy - 3;
      c.fillStyle = '#241c20'; c.fillRect(bx - 1, by - 11, 3, 12);
      c.fillStyle = '#c89a58'; c.fillRect(bx, by - 9, 1, 9);
      c.fillStyle = '#e8dcc0'; c.fillRect(bx - 1, by - 13, 3, 2);
      c.fillStyle = '#1a1626'; c.fillRect(bx - 1, by - 16, 3, 3); c.fillRect(bx, by - 17, 1, 1);
      if (k < B.send + 60) { c.fillStyle = '#2a2024'; c.fillRect(bx - sx, by - 18 - Math.round((1 - up) * 2), 2, 2); }
    }
    void t;
  }
  // the chosen target: ink brackets round its footprint (and the art above it)
  function frame(c, A, T, t) {
    const still = RB.game.reducedMotion();
    const pulse = still ? 0 : Math.round((Math.sin(t / 260) + 1) * 0.8);
    const x0 = A.ax(T.x * A.TS) - 3 - pulse, x1 = A.ax((T.x + T.w) * A.TS) + 2 + pulse;
    const y0 = A.ay((T.y - (T.o.tall || 0.6)) * A.TS) - 3 - pulse, y1 = A.ay((T.y + T.h) * A.TS) + 2 + pulse;
    const L = 7;
    for (const [col, o, w] of [['#241c20', 0, 3], ['#fff4c8', 1, 1]]) {
      c.fillStyle = col;
      const r = (x, y, ww, hh) => c.fillRect(x + o, y + o, ww, hh);
      r(x0, y0, L, w); r(x0, y0, w, L);
      r(x1 - L - 2 * o, y0, L, w); r(x1 - w - 2 * o, y0, w, L);
      r(x0, y1 - w - 2 * o, L, w); r(x0, y1 - L - 2 * o, w, L);
      r(x1 - L - 2 * o, y1 - w - 2 * o, L, w); r(x1 - w - 2 * o, y1 - L - 2 * o, w, L);
    }
    if (labelEl && !labelEl.classList.contains('hidden')) placeLabel();
  }
  // persistent support drawn from the committed state (e.g. a ward that is
  // holding something until the ordinary fastening is done)
  function marks(c, A, s, mapId, t) {
    const still = RB.game.reducedMotion();
    for (const d of FW().list()) {
      if (d.map !== mapId || !d.marks || !FW().eligible(s, d.id)) continue;
      const st = FW().view(s, d.id);
      for (const m of d.marks) {
        if (!FW().match(st, m.if)) continue;
        const o = d.objects[m.obj];
        if (!o) continue;
        const x = A.ax((o.x + o.w / 2) * A.TS), y = A.ay((o.y + o.h / 2) * A.TS) - 6;
        if (m.mark === 'ward') {
          const r = 17 * Math.max(o.w, o.h), n = 22, ph = still ? 0 : t / 900;
          c.fillStyle = '#fff4c8';
          // (the ring's front arc is left out: it would cross whoever stands before it)
          for (let i = 0; i < n; i++) { if ((i + Math.floor(ph * 4)) % 3 === 0) continue; const g = (i / n) * Math.PI * 2; if (Math.sin(g) > 0.45) continue; c.globalAlpha = 0.75; c.fillRect(Math.round(x + Math.cos(g) * r), Math.round(y + Math.sin(g) * r * 0.75), 2, 2); }
          c.globalAlpha = 1;
          // a paper seal tag hung on the right-hand post of the thing held
          // (never over whoever stands in front of it)
          const tx = Math.round(x + 13 * Math.max(o.w, 1)), ty = Math.round(y - 12);
          c.fillStyle = '#241c20'; c.fillRect(tx - 3, ty - 4, 7, 10);
          c.fillStyle = '#efe4c8'; c.fillRect(tx - 2, ty - 3, 5, 8);
          c.fillStyle = '#c8503a'; c.fillRect(tx - 1, ty, 3, 2);
        } else if (m.mark === 'glow') {
          // a soft round glow (the light held where it was woven)
          const gr = 16 * Math.max(1, o.w), a = 0.32 + (still ? 0 : Math.sin(t / 400) * 0.08);
          const gy = y - 6, grad = c.createRadialGradient(x, gy, 1, x, gy, gr);
          grad.addColorStop(0, 'rgba(255,240,180,' + a.toFixed(3) + ')'); grad.addColorStop(1, 'rgba(255,240,180,0)');
          c.fillStyle = grad; c.fillRect(x - gr, gy - gr, gr * 2, gr * 2);
        } else if (m.mark === 'rope') {
          // a woven cord of ink wrapped round the handle and tied off (F2: the crank held)
          const w = 9 * Math.max(1, o.w), sh = still ? 0 : Math.round(Math.sin(t / 700));
          for (let i = 0; i < 4; i++) {
            const yy = y - 6 + i * 4;
            c.fillStyle = '#241c20'; c.fillRect(x - w, yy - 1, w * 2, 4);
            c.fillStyle = i % 2 ? '#d8c89a' : '#efe4c8'; c.fillRect(x - w + 1, yy, w * 2 - 2, 2);
            c.fillStyle = 'rgba(140,110,70,0.9)'; for (let k = -w + 3; k < w - 2; k += 4) c.fillRect(x + k, yy, 1, 2);
          }
          // the knot and its two loose ends
          c.fillStyle = '#241c20'; c.fillRect(x + w - 2, y - 3, 6, 6);
          c.fillStyle = '#efe4c8'; c.fillRect(x + w - 1, y - 2, 4, 4);
          c.fillStyle = '#d8c89a'; c.fillRect(x + w + 3, y + 2, 2, 6 + sh); c.fillRect(x + w + 6, y + 1, 2, 5 - sh);
        } else if (m.mark === 'stone') {
          // a small block of woven stone under the short foot (F3: the tray set level); the
          // tray art (fw_tray) leaves that foot short, art rows 27-30 under x 24-27
          const bx = A.ax(o.x * A.TS) + 22, by = A.ay(o.y * A.TS) + 27;
          c.fillStyle = '#241c20'; c.fillRect(bx - 1, by - 1, 9, 5);
          c.fillStyle = '#8a8c90'; c.fillRect(bx, by, 7, 3);
          c.fillStyle = '#b4b6ba'; c.fillRect(bx, by, 7, 1);
          c.fillStyle = '#5e6064'; c.fillRect(bx + 2, by + 2, 1, 1); c.fillRect(bx + 5, by + 1, 1, 1);
          // the faint ink seam that says it was woven, not fetched
          c.fillStyle = 'rgba(255,244,200,' + (still ? 0.7 : 0.55 + Math.sin(t / 500) * 0.15).toFixed(2) + ')';
          c.fillRect(bx, by + 3, 7, 1);
        }
      }
    }
  }

  // ---- scene hooks: ordinary actions and inspection --------------------------------------------------
  // !hook fw_act <puzzle> <action>   an ordinary action chosen in an inspection menu
  RB.hooks.fw_act = async (args, ctx) => {
    const [pz, name] = args, s = S();
    const res = FW().act(s, pz, name);
    if (!res) return;
    RB.ui.dialogue.hide();
    busy = true;
    try { await present(res, null, { inScene: true, prop: ctx && ctx.prop }); } finally { busy = false; }
  };
  // !hook fw_look <puzzle> <object>  what the player sees of it now (records the fact)
  RB.hooks.fw_look = async (args) => {
    const [pz, key] = args, s = S();
    const l = FW().lookOf(s, pz, key);
    if (!l) return;
    if (l.obs) FW().observe(s, pz, l.obs);
    for (const x of l.lines || [l]) await RB.ui.dialogue.say({ who: x.who || 'narr', jp: x.jp, en: x.en });
  };
  // !hook fw_hint <puzzle>           one more layer of hint (broad → specific → the route)
  RB.hooks.fw_hint = async (args) => {
    const [pz] = args, s = S(), def = FW().get(pz);
    if (!def || !def.hints) return;
    const n = FW().hint(s, pz);
    const h = def.hints[n - 1];
    if (h) await RB.ui.dialogue.say({ who: 'narr', jp: h.jp, en: h.en });
  };
  // !hook fw_reset <puzzle>          set a multi-step mechanism back to its start
  RB.hooks.fw_reset = async (args, ctx) => {
    const [pz] = args, s = S(), def = FW().get(pz);
    if (!def) return;
    const before = JSON.parse(JSON.stringify(FW().stateOf(s, pz)));
    if (!FW().reset(s, pz)) return;
    RB.ui.dialogue.hide();
    busy = true;
    try {
      await present({ pz, kind: 'reset', key: ctx && ctx.prop && ctx.prop.o && ctx.prop.o.part, before, after: FW().stateOf(s, pz), effective: true, say: [def.resetSay || { jp: '{元|もと} の {形|かたち} に {戻|もど}した 。', en: 'You set everything back the way it was.' }], id: 'fw:' + pz + ':reset' }, null, { inScene: true, prop: ctx && ctx.prop });
    } finally { busy = false; }
  };
  // !hook fw_open <puzzle> <object>  "Weave a word on it…" from the inspection menu
  RB.hooks.fw_open = async (args) => { pendingOpen = { pz: args[0], key: args[1] }; };
  // !hook fw_arrange <puzzle>        the filing sheet: each item into one place, editable,
  // with an on-request check that names the visible rule a placement breaks
  RB.hooks.fw_arrange = async (args) => {
    RB.ui.dialogue.hide();
    busy = true;
    try { await arrangeSheet(args[0]); } finally { busy = false; }
  };
  function arrangeSheet(pz) {
    const s = S(), def = FW().get(pz);
    if (!def || !def.arrange) return Promise.resolve();
    return new Promise((resolve) => {
      const el = RB.ui.el('div', 'weave-sheet arrange-sheet');
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-labelledby', 'ar-title');
      const layer = { el, name: 'arrange' };
      let closed = false;
      const slots = Object.keys(def.folders);
      function html() {
        const st = FW().stateOf(s, pz);
        const look = FW().lookOf(s, pz, def.arrangeObj);
        const rule = look && look.lines ? look.lines[look.lines.length - 1] : null;
        const items = FW().lookOf(s, pz, 'slips');
        const desc = items && items.lines ? items.lines.slice(1) : [];
        return '<div class="wv-frame"><div class="wv-head"><h2 id="ar-title">' + I('note') + '<span>File the slips</span></h2>' +
          '<button type="button" class="cbtn" data-a="done">' + I('done') + '<span>Done</span></button></div><div class="wv-body">' +
          (rule ? '<div class="wv-look slip">' + lookHtml(rule) + '</div>' : '') +
          def.arrange.map((k, i) => {
            const d = desc[i];
            return '<div class="ar-item"><div class="ar-desc">' + (d ? lookHtml(d) : esc(k)) + '</div>' +
              '<div class="ar-slots" role="radiogroup" aria-label="Folder for slip ' + (i + 1) + '">' +
              slots.concat(['loose']).map((f) => {
                const lab = f === 'loose' ? { en: 'Not filed', jp: '' } : def.folders[f];
                return '<button type="button" class="wv-t" role="radio" data-k="' + k + '" data-f="' + f + '" aria-checked="' + (st[k] === f) + '">' + (lab.jp ? RB.ui.jhtml(lab.jp) : '') + '<span class="en">' + esc(lab.en) + '</span></button>';
              }).join('') + '</div></div>';
          }).join('') +
          '<div class="wv-foot"><button type="button" class="pbtn" data-a="check">' + I('look') + '<span>Check against the rule</span></button></div>' +
          '<div class="wv-hint ar-check" aria-live="polite"></div></div></div>';
      }
      function render(focusK, focusF) {
        el.innerHTML = html();
        if (focusK) { const b = el.querySelector('[data-k="' + focusK + '"][data-f="' + focusF + '"]'); if (b) b.focus({ preventScroll: true }); }
      }
      function close(res, keep) {
        if (closed) return;
        closed = true;
        RB.ui.popLayer(layer);
        if (!keep) resolve(res || null);
      }
      el.addEventListener('click', async (e) => {
        const b = e.target.closest('button');
        if (!b || closed) return;
        if (b.dataset.k) {
          const res = FW().arrange(s, pz, { [b.dataset.k]: b.dataset.f });
          RB.audio && RB.audio.sfx('page', { vol: 0.5 });
          if (res && res.completed) {
            // the sheet closes; the scene waits until the result has been shown
            close(res, true);
            await present(res, null, { inScene: true, prop: { x: def.objects[def.arrangeObj].x, y: def.objects[def.arrangeObj].y, o: { part: def.arrangeObj } } });
            resolve(res);
            return;
          }
          if (res && res.effective) RB.save.autosave('progress');
          render(b.dataset.k, b.dataset.f);
        } else if (b.dataset.a === 'check') {
          const out = def.check ? def.check(FW().stateOf(s, pz)) : [];
          el.querySelector('.ar-check').innerHTML = '<ul class="ar-list">' + out.map((x) => '<li class="' + (x.ok ? 'ok' : x.ok === false ? 'no' : 'unsure') + '">' + RB.ui.jhtml(x.jp) + '<div class="en">' + esc(x.en) + '</div></li>').join('') + '</ul>';
          const box = el.querySelector('.ar-check');
          if (box.scrollIntoView) box.scrollIntoView({ block: 'nearest', behavior: RB.game.reducedMotion() ? 'auto' : 'smooth' });
        } else if (b.dataset.a === 'done') close();
      });
      layer.onCancel = () => close();
      render();
      RB.ui.pushLayer(layer);
    });
  }

  // ---- wiring ------------------------------------------------------------------------------------------
  // the remappable Weave key (src/engine/10_input.js asks here first)
  function onKey(a) {
    if (a !== 'weave') return false;
    if (RB.challenge && RB.challenge.active && RB.challenge.active()) return false; // writing: the key is not ours
    if (panel) { if (!panel.el.classList.contains('hidden')) close(); return true; }
    if (RB.game.mode() === 'world') { open(); return true; }
    return false;
  }
  const prevTick = RB.ui.tick;
  RB.ui.tick = function (dt, t) { if (prevTick) prevTick(dt, t); tick(dt); };
  if (typeof document !== 'undefined') {
    document.addEventListener('pointerdown', (e) => { if (panel && e.target && e.target.id === 'world') onCanvasPointer(e); }, true);
  }
  // leaving the map or the game closes the sheet and ends any presentation
  RB.bus.on('map:enter', () => { if (panel) close(); if (cur) finish(); });

  // What a prop may show while an action on its puzzle is being presented
  // (a vane spinning, a flower turning): { fx, family, kind, k (ms since the
  // effect's beat), result } or null. Drawing only.
  function cue(pz) {
    if (!cur || !cur.res || cur.res.pz !== pz) return null;
    const k = performance.now() - cur.t0;
    return { fx: cur.res.fx, family: cur.fam, kind: cur.kind, k: k - cur.B.hit, beat: k - cur.B.beat, res: cur.res };
  }

  return {
    open, close, onKey, draw, available, known, nearby, finish, cue,
    busy: () => busy || !!cur, isOpen: () => !!panel, target, select, choose,
    // tests: the sheet's current state
    state: () => ({ open: !!panel, busy, targets: panel ? panel.targets.map((t) => t.pz + '.' + t.key) : nearby().map((t) => t.pz + '.' + t.key), sel: panel && target() ? target().pz + '.' + target().key : null, anim: cur ? { kind: cur.kind, k: performance.now() - cur.t0 } : null }),
  };
})();
RB.weaveFx = { draw: (c, env, t) => RB.weave.draw(c, env, t) };
