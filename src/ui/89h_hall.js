/* The Hall of a Hundred Tales on screen (expansion P15; plan 04_DUNGEONS.md D9, D4; the rules in
 * src/engine/98h_hall.js):
 *   - a wing's card at its hearth (D4, D9 "Three choices per wing"): the tale, its language theme and folklore label,
 *     the size, the rules in words, the trials counted so far, and the choices (the campaign's profile, shown; the
 *     route, Consolidate or Grow, with what Grow introduces; the tactical setting), changed only here at the hearth;
 *     Go in, Go back to where you left off (a held floor) or Not now.
 *   - a chip on the map while in a wing: the wing, the trials counted, a reprieve earned; it opens the sheet below.
 *   - the sheet: leave the Hall (this floor starts again next time; earlier floors and wings stay), leave keeping
 *     this floor (a reprieve), suspend (close the game here and resume exactly here), or stay.
 *   - when the page is hidden in a wing, outside a battle, the place is kept as a suspend point (the same record).
 *   - the scenes' hooks: hall_card <w> (_res 1 go in, 2 go back to the held floor, 0 not now), hall_enter <w> [held],
 *     hall_trial <w> <t> (_res 1 when that finished the wing), hall_challenge <id> (Grow: a level up, as stretch),
 *     hall_return (the return lantern at a floor's entry), hall_station <id>. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.hall = (function () {
  'use strict';
  const esc = RB.util.esc;
  const H = () => RB.hall;
  const S = () => RB.game.s;
  const I = (n) => (RB.ui.folio ? RB.ui.folio.icon(n) : '');
  const PROF = { F: 'Foundations', E: 'Elementary', I: 'Intermediate', A: 'Advanced' };
  const TAC = { relaxed: 'Relaxed', normal: 'Standard', hard: 'Demanding' };

  // ---- the wing's card -----------------------------------------------------------------------------------------------
  function cardHtml(w, s, pick) {
    const d = H().get(w), r = H().peek(s, w);
    const row = (label, html) => '<div class="xp-row"><div class="xp-k">' + esc(label) + '</div><div class="xp-v">' + html + '</div></div>';
    const counted = H().doneCount(s, w), n = d.trials.length;
    const rules = [
      'Resolve carries from encounter to encounter in a wing (what mistakes cost always comes back).',
      'A floor\'s trials count once every trial on it is done; from then on they stay done.',
      'Defeat starts the current floor again; earlier floors stay done.',
      'You can leave at any time outside a battle: the floor you were on starts again next time.',
      'Some trials earn a reprieve: leave with the floor kept exactly as it is.',
      'You can suspend anywhere outside a battle and resume exactly there.',
      'Every creature is in plain sight. Help is always there, and nothing gets harder after a mistake.',
    ];
    const radio = (name, val, label, sub) => '<label class="hall-opt"><input type="radio" name="' + name + '" value="' + val + '"' + (pick[name] === val ? ' checked' : '') + '> <span>' + esc(label) + '</span>' + (sub ? '<span class="muted small"> ' + esc(sub) + '</span>' : '') + '</label>';
    const growNext = RB.grow ? RB.grow.next(s.learn.profile) : null;
    return '<div class="xp-card hall-card">' +
      '<p class="xp-kind">' + esc('The ' + ordinal(d.n) + ' lantern of the Hall: entirely optional') + '</p>' +
      row('Tale', RB.ui.jhtml(d.title.jp) + ' <span class="en">' + esc(d.title.en) + '</span>') +
      row('Language', (d.theme.jp ? '<span class="jp">' + RB.ui.jhtml(d.theme.jp) + '</span> ' : '') + esc(d.theme.en)) +
      row('Folklore', esc(d.folklore.en)) +
      row('Size', esc(d.floors.length + ' floors, ' + n + ' trials.')) +
      row('Counted', esc(counted + ' of ' + n + ' trials' + (r && r.done ? ': the lantern is relit.' : '.'))) +
      row('Rules', '<ul class="xp-rules">' + rules.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>') +
      '<fieldset class="hall-choices"><legend>' + esc('Your choices for this wing (changed only here, at the hearth)') + '</legend>' +
      row('Profile', esc((PROF[s.learn.profile] || s.learn.profile) + ': your journey\'s, as everywhere.')) +
      row('Route', radio('route', 'consolidate', 'Consolidate', 'Use what you already have.') +
        radio('route', 'grow', 'Grow', growNext ? (growNext === 'A+' ? 'Nuance, genres and other perspectives: ' : 'A step up, taught first: ') + (d.grow ? d.grow.en : '') : '')) +
      row('Tactics', radio('tactics', 'relaxed', TAC.relaxed) + radio('tactics', 'normal', TAC.normal) + radio('tactics', 'hard', TAC.hard)) +
      '</fieldset>' +
      (r && r.held ? '<p class="note-slip">' + I('here') + ' ' + esc('A floor is waiting exactly as you left it.') + '</p>' : '') +
      '</div>';
  }
  const ordinal = (n) => ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'][n - 1] || n + 'th';
  let CARD = null;
  function card(w) {
    return new Promise((resolve) => {
      const s = S(), d = H().get(w);
      if (!d) { resolve(0); return; }
      const pick = Object.assign({}, H().choice(s, w));
      const finish = (v) => { if (!CARD) return; RB.ui.popLayer(CARD.layer); CARD = null; resolve(v); };
      const fr = RB.ui.folio.frame({ cls: 'xp-folio hall-folio', onClose: () => finish(0), closeLabel: 'Not now', closeIcon: 'back' });
      fr.setTitle(RB.ui.label(d.title.jp, d.title.en), 'At the hearth');
      const r = H().peek(s, w);
      const draw = () => {
        fr.box.innerHTML = '<div class="leaf xp-leaf" tabindex="-1">' + cardHtml(w, s, pick) +
          '<div class="sg-acts">' + (r && r.held ? '<button type="button" class="pbtn primary" data-a="held">' + I('next') + '<span>Go back to where you left off</span></button>' : '') +
          '<button type="button" class="pbtn' + (r && r.held ? '' : ' primary') + '" data-a="go">' + I('next') + '<span>' + esc(r && r.held ? 'Start the floor afresh' : r && r.done ? 'Walk the tale again' : 'Go in') + '</span></button>' +
          '<button type="button" class="pbtn autofocus" data-a="no">Not now</button></div></div>';
      };
      draw();
      fr.box.addEventListener('change', (e) => { const t = e.target; if (t && t.name && (t.name === 'route' || t.name === 'tactics')) pick[t.name] = t.value; });
      fr.box.addEventListener('click', (e) => {
        const b = e.target.closest('[data-a]');
        if (!b) return;
        if (b.dataset.a === 'no') { finish(0); return; }
        H().setChoice(s, w, pick);
        if (b.dataset.a === 'go' && r && r.held) r.held = null; // starting afresh lets the held floor go
        finish(b.dataset.a === 'held' ? 2 : 1);
      });
      CARD = { layer: { el: fr.scrim, name: 'hall-card', onCancel: () => finish(0) } };
      RB.ui.pushLayer(CARD.layer);
    });
  }

  // ---- in, out, and the sheet ----------------------------------------------------------------------------------------
  async function goIn(w, held) {
    const s = S();
    const at = H().enter(s, w, { held: !!held });
    if (!at) return;
    await RB.game.transition(at.map, at.x, at.y, at.dir, { inScript: true });
    if (!at.held) await RB.save.autosave('auto');
  }
  async function leave(keep) {
    const s = S();
    const v = H().visitOf(s);
    if (!v) return;
    const hearth = H().retreat(s, { keep: !!keep });
    if (hearth) {
      s.checkpoint = { map: hearth.map, x: hearth.x, y: hearth.y, dir: hearth.dir || 'down' };
      await RB.game.transition(hearth.map, hearth.x, hearth.y, hearth.dir || 'down', { inScript: true });
      await RB.save.autosave('auto');
    }
    RB.ui.notice(keep ? 'You leave the Hall with the reprieve: the floor will be exactly as you left it.' : 'You leave the Hall. The floor you were on starts again next time; earlier floors stay done.', 'info');
  }
  async function suspend() {
    const s = S();
    if (!H().visitOf(s) || RB.game.inBattle()) return false;
    try { await RB.save.suspend(); } catch (e) { RB.ui.notice('Could not keep a suspend point: ' + (e.message || e), 'bad'); return false; }
    RB.ui.notice('Suspended. Loading this journey resumes exactly here.', 'info');
    await RB.game.toTitle();
    return true;
  }
  async function sheet() {
    const s = S(), v = H().visitOf(s);
    if (!v || RB.game.inBattle()) return;
    const d = H().get(v.wing);
    const opts = ['Leave the Hall', v.reprieve > 0 ? 'Use the reprieve: leave, keeping this floor' : null, 'Suspend: close the game here', 'Stay'].filter(Boolean);
    const text = d.title.en + ': ' + H().doneCount(s, v.wing) + ' of ' + d.trials.length + ' trials counted' + (v.practice ? ' (walking the tale again: nothing changes your records)' : '') + '. Leaving now starts this floor again next time; earlier floors stay done.' + (v.reprieve > 0 ? ' You have earned a reprieve.' : '');
    const k = await RB.ui.confirm(text, opts);
    const pickd = opts[k];
    if (pickd === 'Leave the Hall') await leave(false);
    else if (pickd && pickd.indexOf('Use the reprieve') === 0) await leave(true);
    else if (pickd && pickd.indexOf('Suspend') === 0) await suspend();
  }

  // ---- the chip ------------------------------------------------------------------------------------------------------
  let chip = null, last = '';
  function ensureChip() {
    if (chip || typeof document === 'undefined' || !RB.ui.root) return chip;
    chip = RB.ui.el('button', 'hbtn atlas-chip hall-chip hidden');
    chip.setAttribute('aria-label', 'The Hall: leave, keep the floor, or suspend');
    chip.onclick = () => { if (RB.game.mode() === 'world') sheet(); };
    RB.ui.root.appendChild(chip);
    return chip;
  }
  function sync() {
    const s = S();
    const v = s && RB.game.G && RB.game.G.playing ? H().visitOf(s) : null;
    const show = !!(v && RB.game.mode() !== 'combat' && RB.game.mode() !== 'title');
    if (!show) { if (chip) chip.classList.add('hidden'); last = ''; return; }
    const c = ensureChip();
    if (!c) return;
    const d = H().get(v.wing);
    const n = d.trials.filter((t) => H().trialDone(s, v.wing, t.id)).length;
    const html = I('lantern') + '<span class="l">' + esc(d.title.en) + '</span><span class="st">' + esc(n + '/' + d.trials.length) + '</span>' + (v.reprieve > 0 ? '<span class="st">' + esc('reprieve') + '</span>' : '');
    if (html !== last) { c.innerHTML = html; last = html; }
    c.classList.remove('hidden');
  }
  if (typeof setInterval !== 'undefined' && typeof document !== 'undefined') setInterval(sync, 400);
  // the page hidden in a wing (the tab closed, the device asleep): keep the place as the suspend point
  if (typeof document !== 'undefined' && typeof window !== 'undefined') {
    const keep = () => { try { const s = S(); if (s && H().visitOf(s) && RB.game.G && RB.game.G.playing && !RB.game.inBattle()) RB.save.suspend(); } catch (e) { /* best effort */ } };
    window.addEventListener('pagehide', keep);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') keep(); });
  }

  // ---- the hooks -------------------------------------------------------------------------------------------------------
  RB.hooks = RB.hooks || {};
  RB.hooks.hall_card = async (a) => {
    const s = S(), w = a && a[0];
    if (!H().get(w)) { RB.ui.notice('This tale is not ready to be told yet.', 'info'); s.vars._res = 0; return; }
    s.vars._res = RB.test && RB.test.auto ? (H().peek(s, w) && H().peek(s, w).held ? 2 : 1) : await card(w);
  };
  RB.hooks.hall_enter = async (a) => { await goIn(a && a[0], a && a[1] === 'held'); };
  RB.hooks.hall_trial = async (a) => {
    const s = S(), w = a && a[0], t = a && a[1];
    const r = H().markTrial(s, w, t);
    s.vars._res = r.wingDone ? 1 : 0;
    if (!r.ok || !r.first) return;
    const tr = H().trialOf(w, t);
    RB.audio && RB.audio.sfx('item_get');
    const msgs = ['A lantern is lit: ' + (tr.title ? tr.title.en : 'a trial') + '.'];
    if (r.reprieve) msgs.push('A reprieve earned: you may leave with this floor kept exactly as it is.');
    if (r.floorCleared && !r.wingDone) msgs.push('The floor is cleared: its trials count now, and stay counted.');
    RB.ui.notice(msgs.join(' '), 'info');
    if (r.wingDone && RB.stampBook) RB.stampBook.settle(s);
  };
  RB.hooks.hall_challenge = async (a) => {
    const s = S(), id = a && a[0], ch = RB.content.challenges[id], v = H().visitOf(s);
    let ctx = { scene: 'hall' };
    if (ch && v && H().choice(s, v.wing).route === 'grow' && RB.grow) {
      const steps = RB.grow.stepsFor(ch, s.learn.profile);
      if (steps && steps.length) ctx = { scene: 'hall', steps, stretch: true };
    }
    RB.ui.dialogue.hide();
    const res = await RB.challenge.run(id, ctx);
    s.vars._res = res && res.ok ? 1 : 0;
  };
  RB.hooks.hall_return = async () => {
    const s = S(), v = H().visitOf(s);
    if (!v) return;
    const opts = ['Return to the hearth', v.reprieve > 0 ? 'Return keeping this floor (the reprieve)' : null, 'Stay'].filter(Boolean);
    const k = RB.test && RB.test.auto ? opts.length - 1 : await RB.ui.confirm('The return lantern. Going back now starts this floor again next time; earlier floors stay done.' + (v.reprieve > 0 ? ' With your reprieve, the floor can be kept exactly as it is.' : ''), opts);
    if (opts[k] === 'Return to the hearth') await leave(false);
    else if (opts[k] && opts[k].indexOf('keeping') >= 0) await leave(true);
  };
  // the tale finished: back to its hearth, where its lantern now burns (nothing is reset: every floor is counted)
  RB.hooks.hall_finish = async () => {
    const s = S(), v = H().visitOf(s);
    if (!v) return;
    const d = H().get(v.wing);
    const hearth = H().retreat(s, { keep: false });
    if (hearth) {
      s.checkpoint = { map: hearth.map, x: hearth.x, y: hearth.y, dir: hearth.dir || 'down' };
      await RB.game.transition(hearth.map, hearth.x, hearth.y, hearth.dir || 'down', { inScript: true });
      await RB.save.autosave('auto');
    }
    RB.ui.notice(d.title.en + ': the tale is done, and its lantern burns in the hall again.', 'info');
  };
  RB.hooks.hall_station = async (a) => { if (RB.hooks.xp_station) await RB.hooks.xp_station(a); };
  RB.hooks.hall_sheet = async () => { await sheet(); };
  return { card, cardHtml, goIn, leave, suspend, sheet, sync };
})();
