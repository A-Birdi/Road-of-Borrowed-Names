/* Shell messages on screen (expansion P11; the rules in src/engine/72s_shells.js). One sheet, opened by a scene with
 * `!hook shells <id>`; the scene reads the outcome in `var._shells` ('ok' or 'cancel'):
 *   1. Each conch's line (Japanese with its readings; the English a tap away; "Listen" when the device has a Japanese
 *      voice of its own, never needed: every line can always be read).
 *   2. For each line: who said it, and to whom (the people who were there, and the one who was not).
 *   3. "Put it together": each line placed wrongly says what it would mean said that way (often funny) and which clue
 *      points elsewhere; change it and try again. Done when every line has its speaker and listener.
 * In the test driver's automated runs every line is placed right at once (no screen). */
var RB = (globalThis.RB = globalThis.RB || {});
RB.ui = RB.ui || {};

RB.ui.shells = (function () {
  'use strict';
  const esc = (s) => RB.util.esc(String(s == null ? '' : s));
  const J = (t) => RB.ui.jhtml(t || '');
  const S = () => RB.game.s;
  const prof = () => (S() && S().learn && S().learn.profile) || 'F';
  const canListen = () => !!(RB.voice && RB.voice.supported && RB.voice.supported() && RB.voice.japaneseVoices && RB.voice.japaneseVoices().length);

  function open(id) {
    const H = RB.shells, d = H.def(id);
    if (!d) return Promise.resolve({ cancelled: true });
    return new Promise((resolve) => {
      const placed = {}, shownEn = {};
      let judged = null;
      const fr = RB.learnUi.sheet({ cls: 'activity sh-sheet', title: J(d.title.jp) + ' ' + esc(d.title.en) });
      const lay = { el: fr.scrim, name: 'shells' };
      RB.learnUi.guardTaps(fr.leaf);
      RB.ui.pushLayer(lay);
      let done = false;
      const finish = (r) => { if (done) return; done = true; if (RB.voice && RB.voice.cancel) RB.voice.cancel(); if (lay.el.isConnected) RB.ui.popLayer(lay); resolve(r); };
      lay.onCancel = () => finish({ cancelled: true });
      const person = (pid) => d.people.find((p) => p.id === pid) || { jp: pid, en: pid };

      function fragHtml(f) {
        const t = H.textAt(f, prof()), p = placed[f.id] || {}, j = judged && judged.frags[f.id];
        const chips = (role) => '<div class="sh-chips" role="radiogroup" aria-label="' + (role === 'who' ? 'Who said it?' : 'To whom?') + '">' +
          d.people.map((pp) => '<button class="sh-chip" role="radio" data-f="' + esc(f.id) + '" data-r="' + role + '" data-p="' + esc(pp.id) + '" aria-checked="' + (p[role] === pp.id) + '">' + J(pp.jp) + ' <span class="sh-en">' + esc(pp.en) + '</span></button>').join('') + '</div>';
        const fb = j && j.done && !j.ok ? '<p class="sh-why" role="note">' + (f.comic ? esc(f.comic.en) + ' ' : '') + RB.learnUi.mixed(f.cue.en) + '</p>' : (j && j.ok ? '<p class="sh-ok">✓ ' + esc(person(f.who).en) + ' → ' + esc(person(f.to).en) + '</p>' : '');
        return '<section class="sh-frag" data-f="' + esc(f.id) + '"><header class="sh-head"><span class="sh-shell">' + J('{法螺貝|ほらがい}') + ' ' + esc(String(f.shell).toUpperCase()) + '</span></header>' +
          '<p class="sh-text">' + J(t.jp) + '</p>' + (shownEn[f.id] ? '<p class="sh-entext">' + esc(t.en) + '</p>' : '') +
          '<p class="sh-acts"><button class="pbtn small sh-showen" data-f="' + esc(f.id) + '" aria-pressed="' + !!shownEn[f.id] + '">In English</button>' +
          (canListen() ? ' <button class="pbtn small sh-listen" data-f="' + esc(f.id) + '">Listen</button>' : '') + '</p>' +
          '<div class="sh-q"><span class="sh-ql">Who said it?</span>' + chips('who') + '<span class="sh-ql">To whom?</span>' + chips('to') + '</div>' + fb + '</section>';
      }
      function render() {
        const ready = d.frags.every((f) => placed[f.id] && placed[f.id].who && placed[f.id].to);
        const ok = judged && judged.ok;
        fr.leaf.innerHTML = '<p class="sh-intro">' + J(d.question.jp) + '<br><span class="muted">' + esc(d.question.en) + '</span></p>' +
          '<div class="sh-frags">' + d.frags.map(fragHtml).join('') + '</div>';
        fr.foot.innerHTML = '<button class="pbtn sh-cancel">Come back later</button> ' + (ok ? '<button class="pbtn primary sh-done">Done</button>' : '<button class="pbtn primary sh-go"' + (ready ? '' : ' disabled') + '>Put it together</button>');
      }
      function onClick(e) {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.classList.contains('sh-chip')) { const f = b.dataset.f; placed[f] = Object.assign({}, placed[f], { [b.dataset.r]: b.dataset.p }); if (judged && judged.frags[f]) judged.frags[f] = null; render(); focusSel('.sh-chip[data-f="' + f + '"][data-r="' + b.dataset.r + '"][data-p="' + b.dataset.p + '"]'); return; }
        if (b.classList.contains('sh-showen')) { shownEn[b.dataset.f] = !shownEn[b.dataset.f]; render(); focusSel('.sh-showen[data-f="' + b.dataset.f + '"]'); return; }
        if (b.classList.contains('sh-listen')) { const f = d.frags.find((x) => x.id === b.dataset.f); try { RB.voice.speak(RB.jp.reading(H.textAt(f, prof()).jp).replace(/\s/g, '')); } catch (err) { /* the voice is optional */ } return; }
        if (b.classList.contains('sh-cancel')) { finish({ cancelled: true }); return; }
        if (b.classList.contains('sh-go')) { judged = H.judge(d, placed); render(); focusSel(judged.ok ? '.sh-done' : '.sh-why'); return; }
        if (b.classList.contains('sh-done')) finish(H.judge(d, placed));
      }
      const focusSel = (sel) => setTimeout(() => { const n = fr.el.querySelector(sel); if (n && lay.el.isConnected) { if (!n.matches('button')) n.setAttribute('tabindex', '-1'); n.focus({ preventScroll: true }); } }, 0);
      fr.el.addEventListener('click', onClick);
      render();
      focusSel('.sh-showen, .sh-chip');
    });
  }

  // `!hook shells <id>`: open the sheet, keep the reconstruction, tell the scene how it went
  RB.hooks = RB.hooks || {};
  RB.hooks.shells = async (a) => {
    const s = S(), id = a && a[0], H = RB.shells, d = H.def(id);
    if (!d) { s.vars._shells = 'cancel'; return; }
    let r;
    if (RB.test && RB.test.auto) { r = H.judge(d, H.autoPlaced(d)); RB.test.log.push({ t: 'activity', kind: 'shells', id }); }
    else r = await open(id);
    if (r.cancelled) { s.vars._shells = 'cancel'; return; }
    H.keep(s, id, r);
    s.vars._shells = r.ok ? 'ok' : 'cancel';
  };
  return { open };
})();
