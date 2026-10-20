/* New Game+ from the end of a journey (expansion P06, K9; Robin's C-54, C-66): offered when the story ends (and from
 * Journey › Travel volume afterwards), in a journey of the twelve-chapter edition (F-21). What carries is defined
 * once (RB.ngplus.carry, src/engine/05b_foundations.js). The new journey goes to the slot you choose: this journey's
 * own (the finished story leaves the slot) or another (erasing what it held, after its own confirmation; an empty
 * one asks nothing). Whichever you choose, the farewell is the ending journey's companion's (C-66), and it is only
 * spoken: nothing in the ending journey changes. The Inn Ledger's New Game+ (src/ui/40_create.js) plays the same
 * farewell. A journey from the six-chapter edition, loaded once the twelve-chapter one shipped (C-54, C-84), comes
 * here too (`fromOld`): the fresh start is explained first, and it is begun the same way, with that journey's own
 * farewell (the solo one if no companion was chosen yet). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.ngplus = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => (RB.ui.folio ? RB.ui.folio.icon(n) : '');
  // The farewell is spoken lines like any other: shown under one scene id, so their recordings are found, and every
  // line of it listed for recording (RB.content.spokenSources, read by tools/voice/lines.mjs): each companion's goodbye,
  // the solo one, and the narration after it (src/content/records/10_ngplus.js)
  const SCENE = 'code.ngplus';
  RB.content.spokenSources = RB.content.spokenSources || [];
  RB.content.spokenSources.push(() => {
    const F = RB.content.ngFarewell || {}, out = [];
    for (const k in F) for (const l of F[k] || []) out.push({ scene: SCENE, who: l.who || 'narr', jp: l.jp, en: l.en || '', expr: l.expr || null, file: 'records/10_ngplus' });
    for (const l of [].concat(RB.content.ngFarewellEnd || [])) out.push({ scene: SCENE, who: l.who || 'narr', jp: l.jp, en: l.en || '', expr: l.expr || null, file: 'records/10_ngplus' });
    return out;
  });
  // The farewell: the companion of the journey that ended, then a line of narration. Spoken in that journey's
  // context (names and looks), read only.
  async function farewell(from) {
    if (!from) return;
    const F = RB.content.ngFarewell || {};
    const lines = (F[from.comp] || F.solo || []).concat(RB.content.ngFarewellEnd ? [].concat(RB.content.ngFarewellEnd) : []);
    if (!lines.length) return;
    const keep = RB.game.s;
    RB.game.s = from;
    RB.game.pushMode('dialogue');
    try { for (const l of lines) await RB.ui.dialogue.say(Object.assign({ sceneId: SCENE }, l)); }
    finally { RB.ui.dialogue.hide(); RB.game.popMode('dialogue'); RB.game.s = keep; }
  }
  // which slot: [{ slot, label, origin, empty }] → the chosen slot, or null
  function chooseSlot(list, origin, o) {
    o = o || {};
    return new Promise((resolve) => {
      let close = null;
      const fr = RB.ui.folio.frame({ cls: 'folio-ngplus', onClose: () => close(null) });
      fr.setTitle('New Game+', 'Choose where the new journey is kept');
      fr.box.innerHTML = '<section class="leaf cr-ngplus"><p id="ngp-d">The new journey carries your learning record and stars, stamps and seals, the illustrations you witnessed, your pastime records, noted words, kept sentences and your traveller as they are. Story, companion, quests and items start fresh.</p><ul class="ng-list">' +
        list.map((x) => {
          const m = x.meta || {};
          const what = x.empty ? 'Empty' : x.slot === origin ? (o.old ? 'This journey (six-chapter edition): the new one takes its place' : 'This journey (finished): the new one takes its place') : (m.name || 'A journey') + (m.comp ? ' & ' + m.comp : '') + (m.chapter ? ', Chapter ' + m.chapter : '') + ': erased';
          return '<li><button type="button" class="ng-opt" data-slot="' + x.slot + '"><span class="mk">' + I(x.empty ? 'journey' : x.slot === origin ? 'lantern' : 'warn') + '</span><span class="t">Slot ' + x.slot + '</span><span class="d">' + esc(what) + '</span></button></li>';
        }).join('') + '</ul></section>';
      const layer = { el: fr.scrim, name: 'ngplus-slot' };
      close = (v) => { RB.ui.popLayer(layer); resolve(v); };
      layer.onCancel = () => close(null);
      fr.box.addEventListener('click', (e) => { const b = e.target.closest('[data-slot]'); if (b) { RB.audio && RB.audio.sfx('cursor'); close(+b.dataset.slot); } });
      RB.ui.pushLayer(layer);
    });
  }
  // the whole step, from a finished journey `from` (kept in slot `origin`, or none); `o.old`: a journey from the
  // six-chapter edition, finished or not (C-54), which can only go on as New Game+
  async function begin(from, origin, o) {
    o = o || {};
    if (!from || !(o.old || (from.flags && from.flags.postgame))) return false;
    const list = await RB.save.list();
    const slot = await chooseSlot(list, origin, o);
    if (slot == null) return false;
    const x = list[slot - 1];
    if (!x.empty) {
      const msg = slot === origin
        ? (o.old ? 'The new journey will be kept in slot ' + slot + ' in place of this six-chapter one. What carries goes with you; the old journey itself will no longer be in the slot.'
          : 'The new journey will be kept in slot ' + slot + ' in place of this finished one. What carries goes with you; the finished story itself will no longer be in the slot.')
        : 'Slot ' + slot + ' holds ' + ((x.meta && x.meta.name) ? x.meta.name + '\'s journey' : 'a journey') + '. Starting the new journey there erases it and its autosaves.';
      const r = await RB.ui.confirm(msg, [slot === origin ? 'Begin here' : 'Erase and begin', 'Choose again'], { danger: slot !== origin });
      if (r !== 0) return begin(from, origin, o);
    }
    await farewell(from);
    if (!x.empty) await RB.save.del(slot);
    const s = RB.ui.create.carry(from);
    if (RB.ui.menu && RB.ui.menu.isOpen && RB.ui.menu.isOpen()) RB.ui.menu.close();
    // a new journey: its settings are looked over before it begins (ST-1b)
    if (RB.ui.settings && RB.ui.settings.review) await RB.ui.settings.review(s);
    await RB.game.startNewCampaign(slot, s);
    return true;
  }
  // A journey from the six-chapter edition, continued or loaded once the twelve-chapter one has shipped (C-54, C-84):
  // it says so first; "Not now" leaves the save exactly as it was. Called by RB.game.loadCampaign; true once the new
  // journey has begun.
  async function fromOld(from, origin) {
    const r = await RB.ui.confirm('This journey began in the six-chapter edition. The road now runs through twelve chapters, so it cannot go on from here: it begins again at the start, as New Game+ \u2014 a fresh start, without satchel equipment or items. What comes with you: your settings, your learning record and stars, stamps and seals, the illustrations you witnessed, your pastime records, noted words and kept sentences; your name, pronouns and appearance stay as they are. Nothing in this saved journey changes unless you begin.', ['Begin New Game+\u2026', 'Not now']);
    if (r !== 0) return false; // "Not now" (the safe answer, focused first; Escape) or closed
    return begin(from, origin, { old: true });
  }
  // offered once when the story ends (the story settles with the journey finished)
  async function offer(s) {
    if (!s || !RB.recordsUI.inCampaign(s) || !s.flags.postgame || s.flags.ngp_offered) return;
    s.flags.ngp_offered = true;
    // (the proposed action first, the safe way out last: Back and the first focus choose "Not now")
    const r = await RB.ui.confirm('Your story is complete. Begin a new journey now with New Game+? You can also begin it later from Journey › Travel volume.', ['Begin New Game+…', 'Not now']);
    if (r === 0) begin(s, RB.save.current ? RB.save.current().slot : null);
  }
  if (RB.bus) RB.bus.on('story:settled', (e) => {
    const s = RB.game && RB.game.s;
    // (only while that journey is still the one being played: one loaded or begun in the meantime is not offered
    // another journey's New Game+)
    if (s && s.flags && s.flags.postgame && !s.flags.ngp_offered && RB.recordsUI.inCampaign(s) && e && e.mode === 'world') setTimeout(() => { if (RB.game.mode() === 'world' && RB.game.s === s) offer(s); }, 400);
  });
  return { farewell, chooseSlot, begin, offer, fromOld, SCENE };
})();
