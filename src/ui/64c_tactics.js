/* The Tactics Board (expansion E15): optional compact studies with a known set of tools and a goal within a number of
 * committed exchanges; instant retry, with what changed explained; a personal best per study (exchanges, never
 * time). Studies are encounters of kind 'study' (src/engine/97_encounter.js); the board stands in Manybridge's
 * Exchange hall and on the boat (P08), and opens from RB.ui.tactics.open(). Development fixtures are listed only
 * on a development page. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.ui = RB.ui || {};

RB.ui.tactics = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => RB.learnUi.icon(n);
  function studies() {
    const C = RB.content.encounters || {};
    const dev = RB.encDev && RB.encDev.allowed();
    return Object.keys(C).filter((id) => C[id].kind === 'study' && (!C[id].fixture || dev)).map((id) => C[id]);
  }
  function open(o) {
    o = o || {};
    return new Promise((resolve) => {
      const fr = RB.learnUi.sheet({ cls: 'tactics-sheet', title: 'The Tactics Board', headBtn: { html: I('back') + '<span>Close</span>', attrs: { 'data-x': '' } } });
      const lay = { el: fr.scrim, name: 'tactics' };
      const close = () => { RB.ui.popLayer(lay); resolve(); };
      lay.onCancel = close;
      const render = (note) => {
        const s = RB.game.s;
        const best = (RB.encounter.rec(s).studies) || {};
        const list = studies();
        fr.leaf.innerHTML = '<p class="muted">Each study gives you a few words and a goal. Reach it within the exchanges allowed; try again at once as often as you like. Your best is kept, in exchanges.</p>' +
          (note ? '<div class="fbwrap fb info">' + note + '</div>' : '') +
          (list.length ? '<ol class="tb-list">' + list.map((d) => {
            const b = best[d.id] || {};
            const tools = (d.study.tools || []).map((w) => RB.content.words[w]).filter(Boolean);
            return '<li class="tb-study"><div class="tb-h"><span class="tb-n">' + RB.ui.jhtml(d.name.jp || '') + ' <span class="en">' + esc(d.name.en) + '</span></span>' +
              '<span class="tb-best">' + (b.best ? 'Best: ' + b.best + ' exchange' + (b.best > 1 ? 's' : '') : b.tries ? 'Not solved yet' : 'New') + '</span></div>' +
              '<div class="tb-tools">' + I('words') + '<span>Words: ' + tools.map((w) => RB.ui.jhtml(w.jpK || w.jp) + ' (' + esc(w.en) + ')').join(', ') + ' · within ' + d.study.turns + ' exchanges</span></div>' +
              '<button type="button" class="cbtn" data-play="' + esc(d.id) + '">' + I('next') + '<span>' + (b.tries ? 'Try again' : 'Try it') + '</span></button></li>';
          }).join('') + '</ol>' : '<p class="muted">No studies here yet.</p>');
      };
      fr.el.onclick = async (e) => {
        if (e.target.closest('[data-x]')) { close(); return; }
        const b = e.target.closest('[data-play]');
        if (!b) return;
        const id = b.getAttribute('data-play');
        // the board steps aside while the study plays, and comes back when it ends
        RB.ui.popLayer(lay);
        let r = null;
        try { r = await RB.game.startEncounter(id, {}); } finally { RB.ui.pushLayer(lay); }
        const d = RB.content.encounters[id];
        render(r && r.result === 'win' ? I('done') + '<span>Solved in ' + (RB.encounter.rec(RB.game.s).studies[id] || {}).best + ' — try for fewer, or another study.</span>' : esc((d.study.explain && d.study.explain.en) || 'Not this time. Try again.'));
      };
      RB.ui.pushLayer(lay);
      render(o.note || '');
    });
  }
  return { open, studies };
})();
