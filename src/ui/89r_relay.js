/* The relay on screen (expansion P12; the rules in src/engine/72r_relay.js). One sheet, opened by a scene with
 * `!hook relay <id>`; the scene waits for it and reads the outcome in `var._relay` ('ok', 'over', 'under' or 'cancel'):
 *   1. Who the message is for, and each part of it: what you have of it (what you saw, what someone told you, what the
 *      signs suggest, a rumour), in Japanese with its readings (the English a tap away).
 *   2. For each part, how you will say it: a few ways, each a different certainty (said plainly, と言っていました,
 *      そうです, らしい, ようです…), in a dealt order (they are written faithful first). Nothing is marked until it is said.
 *   3. "Pass it on": each part is shown with what it told the listener, and why, calmly. A part said with more
 *      certainty than you had is marked so (the station will act on it); one said with less is noted. Then Continue.
 * In the test driver's automated runs every part is said faithfully at once (no screen). */
var RB = (globalThis.RB = globalThis.RB || {});
RB.ui = RB.ui || {};

RB.ui.relay = (function () {
  'use strict';
  const esc = (s) => RB.util.esc(String(s == null ? '' : s));
  const J = (t) => RB.ui.jhtml(t || '');
  const S = () => RB.game.s;
  const prof = () => (S() && S().learn && S().learn.profile) || 'F';
  const MARK = { ok: 'Faithful', over: 'More than you know', under: 'Less than you know', off: 'Not what you have' };

  function open(id) {
    const R = RB.relay, d = R.def(id);
    if (!d) return Promise.resolve({ cancelled: true });
    return new Promise((resolve) => {
      const said = {}, shownEn = {};
      // the ways to say a part are written faithful first: dealt for this opening (RB.learnUi.deal), kept on redraws
      const D = RB.learnUi.deal('relay|' + id);
      let result = null;
      const fr = RB.learnUi.sheet({ cls: 'activity rl-sheet', title: J(d.title.jp) + ' ' + esc(d.title.en) });
      const lay = { el: fr.scrim, name: 'relay' };
      RB.learnUi.guardTaps(fr.leaf);
      RB.ui.pushLayer(lay);
      let done = false;
      const finish = (r) => { if (done) return; done = true; if (lay.el.isConnected) RB.ui.popLayer(lay); resolve(r); };
      lay.onCancel = () => finish(result ? { said, result } : { cancelled: true });
      const ps = () => R.parts(d, S());

      function partHtml(p, i) {
        const os = D.order(R.optsAt(p, prof()), (o) => o.id, p.id);
        const r = result && result.byPart[p.id];
        const opts = os.map((o) => {
          const on = said[p.id] === o.id;
          const st = r && on ? r.status : null;
          return '<button class="rl-opt' + (st ? ' rl-' + st : '') + '" role="radio" data-p="' + esc(p.id) + '" data-o="' + esc(o.id) + '" aria-checked="' + on + '"' + (result ? ' disabled' : '') + '>' +
            J(o.jp) + (shownEn[p.id] ? '<span class="rl-en">' + esc(o.en) + '</span>' : '') + '</button>';
        }).join('');
        return '<section class="rl-part" data-p="' + esc(p.id) + '" aria-labelledby="rl-h-' + esc(p.id) + '">' +
          '<h3 class="rl-n" id="rl-h-' + esc(p.id) + '">' + (i + 1) + '. What you have</h3>' +
          '<p class="rl-have">' + J(p.have.jp) + (shownEn[p.id] ? '<br><span class="rl-en">' + esc(p.have.en) + '</span>' : '') + '</p>' +
          '<p class="rl-acts"><button class="pbtn small rl-showen" data-p="' + esc(p.id) + '" aria-pressed="' + !!shownEn[p.id] + '">In English</button></p>' +
          '<div class="rl-opts" role="radiogroup" aria-label="How you will say it">' + opts + '</div>' +
          (r ? '<p class="rl-verdict rl-' + r.status + '" role="note"><span class="rl-tag">' + esc(MARK[r.status] || '') + '</span> ' + (r.why ? RB.learnUi.mixed(r.why.en) : 'Said as you have it.') + '</p>' : '') +
          '</section>';
      }
      function render() {
        const all = ps().every((p) => said[p.id]);
        fr.leaf.innerHTML = '<p class="rl-intro">' + (result ? 'What you passed on, and how it was heard.' : 'Pass the message on, part by part. Say each part with the certainty you really have: what you saw, what you were told, what you only suppose.') + '</p>' +
          '<p class="rl-to"><span class="rl-tag">To</span> ' + J(d.to.jp) + ' <span class="muted">' + esc(d.to.en) + '</span></p>' +
          ps().map(partHtml).join('');
        fr.foot.innerHTML = result
          ? '<button class="pbtn primary rl-done">Continue</button>'
          : '<button class="pbtn rl-cancel">Not yet</button> <button class="pbtn primary rl-go"' + (all ? '' : ' disabled') + '>Pass it on</button>';
      }
      function onClick(e) {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.classList.contains('rl-opt')) { said[b.dataset.p] = b.dataset.o; render(); focusSel('.rl-opt[data-p="' + b.dataset.p + '"][data-o="' + b.dataset.o + '"]'); return; }
        if (b.classList.contains('rl-showen')) { shownEn[b.dataset.p] = !shownEn[b.dataset.p]; render(); focusSel('.rl-showen[data-p="' + b.dataset.p + '"]'); return; }
        if (b.classList.contains('rl-cancel')) { finish({ cancelled: true }); return; }
        if (b.classList.contains('rl-go')) { result = R.judge(d, said, S(), prof()); render(); focusSel('.rl-done'); return; }
        if (b.classList.contains('rl-done')) finish({ said, result });
      }
      const focusSel = (sel) => setTimeout(() => { const n = fr.el.querySelector(sel); if (n && lay.el.isConnected) n.focus({ preventScroll: true }); }, 0);
      fr.el.addEventListener('click', onClick);
      render();
      focusSel('.rl-opt');
    });
  }

  // `!hook relay <id>`: open the sheet, keep what was said, tell the scene how it went
  RB.hooks = RB.hooks || {};
  RB.hooks.relay = async (a) => {
    const s = S(), id = a && a[0], R = RB.relay, d = R.def(id);
    if (!d) { s.vars._relay = 'cancel'; return; }
    let said, r;
    if (RB.test && RB.test.auto) { said = R.autoSaid(d, s, prof()); r = R.judge(d, said, s, prof()); RB.test.log.push({ t: 'activity', kind: 'relay', id, auto: said }); }
    else { const o = await open(id); if (o.cancelled) { s.vars._relay = 'cancel'; return; } said = o.said; r = o.result; }
    R.keep(s, d, said, r, prof());
    s.vars._relay = r.verdict;
  };
  return { open };
})();
