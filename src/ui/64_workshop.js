/* The Language Workshop (expansion L7–L17b): one worked example of each new task family, at any of the four levels,
 * from Words › Ways to practise. Practice only: it records like any practice (src/learn/40_evidence.js, context
 * "practice"), never changes the campaign's level, and a level above yours is offered as a stretch, never imposed
 * (L18). Content: src/content/workshop/. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui = RB.ui || {};
RB.ui.workshop = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => (RB.ui.folio ? RB.ui.folio.icon(n) : '');
  const J = (m) => RB.ui.jhtml(m);
  const LV = [['F', 'Foundations'], ['E', 'Elementary'], ['I', 'Intermediate'], ['A', 'Advanced']];
  let lay = null;

  function open() {
    if (lay) return;
    const s = RB.game.s;
    const mine = (s && s.learn.profile) || 'E';
    let lv = mine;
    const opener = document.activeElement;
    const close = () => {
      if (!lay) return;
      if (opener && opener.focus && document.contains(opener)) opener.focus({ preventScroll: true });
      RB.ui.popLayer(lay);
      lay = null;
    };
    const fr = RB.ui.folio.frame({ onClose: close, closeLabel: 'Back', closeIcon: 'back', cls: 'folio-sheet folio-workshop' });
    fr.setTitle(RB.ui.label('{言葉|ことば} の {工房|こうぼう}', 'The workshop'), 'One example of each way to use Japanese');
    function render() {
      const fams = (RB.content.workshop && RB.content.workshop.families) || [];
      fr.box.innerHTML = '<div class="spread"><div class="leaf" tabindex="0" aria-label="The workshop">' +
        '<p>Each of these is a way the new chapters ask you to use Japanese: to get something done, not just to recognise it. Try any of them at any level. It is practice: nothing here changes your journey or your level.</p>' +
        '<fieldset class="field"><legend>Level</legend><div class="opts">' + LV.map(([k, en]) => '<label class="opt"><input type="radio" name="ws-lv" value="' + k + '"' + (k === lv ? ' checked' : '') + '><span>' + esc(en) + (k === mine ? ' (yours)' : LV.findIndex((x) => x[0] === k) > LV.findIndex((x) => x[0] === mine) ? ' (a stretch)' : '') + '</span></label>').join('') + '</div></fieldset>' +
        '<ul class="entries ws-list">' + fams.map((f) => '<li class="entry"><span class="mark">' + I('practice') + '</span><div><div class="t">' + J(f.jp) + '<span class="en">' + esc(f.en) + '</span></div>' +
          '<div class="small muted">' + esc(f.what) + '</div><div class="row-acts"><button class="pbtn" data-ws="' + esc(f.id) + '">' + I('practice') + '<span>Try it</span></button></div></div></li>').join('') + '</ul>' +
        '</div></div>';
      fr.box.querySelectorAll('input[name=ws-lv]').forEach((r) => { r.onchange = () => { lv = r.value; }; });
      fr.box.onclick = async (e) => {
        const b = e.target.closest('[data-ws]');
        if (!b || b.disabled) return;
        const f = fams.find((x) => x.id === b.dataset.ws);
        if (!f) return;
        b.disabled = true;
        try { await tryFamily(f, lv, close); } finally { b.disabled = false; }
      };
    }
    lay = { el: fr.scrim, name: 'workshop' };
    lay.onCancel = close;
    RB.ui.pushLayer(lay);
    render();
  }
  async function tryFamily(f, lv, close) {
    if (f.scene) {
      // asking back is a scene: it plays in the dialogue box, with Ask back on its harder lines
      close();
      if (RB.ui.menu && RB.ui.menu.isOpen && RB.ui.menu.isOpen()) RB.ui.menu.closeAll ? RB.ui.menu.closeAll() : RB.ui.menu.close();
      await new Promise((r) => setTimeout(r, 60));
      if (RB.game.mode() === 'world') await RB.script.run(f.scene);
      return;
    }
    const ch = RB.content.challenges['ws.' + f.id];
    if (!ch) return;
    const steps = (ch.tiers && (ch.tiers[lv] || ch.tiers.E)) || [];
    for (const st of steps) {
      const step = Object.assign({}, st, { title: (ch.title && ch.title.en) || f.en, titleJp: ch.title && ch.title.jp });
      const r = await RB.challenge.runStep(step, { ctxTag: 'practice:workshop', cancelLabel: 'Back to the workshop' });
      if (r.cancelled) return;
    }
  }
  if (RB.practice && RB.practice.addActivity) {
    RB.practice.addActivity({
      id: 'workshop', en: 'The workshop', jp: '{言葉|ことば} の {工房|こうぼう}', icon: 'practice', order: 20,
      available: () => true,
      here: () => true,
      note: () => 'One example of each new way to use Japanese, at any level.',
      begin: () => open(),
    });
  }
  return { open, tryFamily };
})();
