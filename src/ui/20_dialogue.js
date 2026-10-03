/* Dialogue box: portrait, speaker, Japanese/English per presentation
 * settings, word-level reveal, optional local Japanese voice, backlog,
 * choices, and fast-forward through previously seen scenes. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.dialogue = (function () {
  'use strict';
  const esc = RB.util.esc;
  let box = null, choicesEl = null;
  let pending = null;       // resolve fn for current line
  let revealing = null;     // {timer, finish}
  let shownAt = 0, lastDown = -1; // event-clock times: when the line appeared, the last pointer press
  let current = null;       // current line data
  let showSub = false;

  const I = (n) => RB.ui.folio.icon(n);
  // Layout: a paper correspondence sheet inset at the bottom of the screen,
  // a speaker tab on its top edge, the portrait beside it, the line in ink,
  // the second language under a rule, and one control row: separate
  // Word help / Translation / Voice / History / Skip toggles and ONE Next in
  // the same place every time. Tapping the text also advances (a supplement,
  // never on a word: words open help when word help is on).
  function ensure() {
    if (box) return;
    box = RB.ui.el('div', 'dlg hidden');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Dialogue');
    box.innerHTML =
      '<canvas class="portrait" width="48" height="48" aria-hidden="true"></canvas>' +
      '<div class="dlg-tab"><div class="who"></div></div>' +
      '<div class="dlg-sheet">' +
      '<div class="txt" aria-live="polite"><div class="main"></div><div class="sub"></div></div>' +
      '<div class="ctrl" role="group" aria-label="Dialogue controls"><div class="aux">' +
      '<button class="dbtn b-words" aria-pressed="false" title="Word help (H)">' + I('bulb') + '<span>Word help</span></button>' +
      '<button class="dbtn b-tr" aria-pressed="false" title="Show or hide the other language (T)">' + I('words') + '<span>Translation</span></button>' +
      '<button class="dbtn b-voice" title="Replay the Japanese line with this device\'s voice">' + I('sound') + '<span>Voice</span></button>' +
      '<button class="dbtn b-log" title="Dialogue history (L)">' + I('history') + '<span>History</span></button>' +
      '<button class="dbtn b-skip" title="Skip lines you have already seen">' + I('next') + '<span>Skip seen</span></button>' +
      '</div><button class="dbtn primary b-next">Next' + I('next') + '</button></div></div>';
    // A press that began before this line appeared (the click that chose a
    // response or finished an exchange) never also dismisses it; keyboard
    // activation (detail 0) and Z / Enter go through advance() as well.
    document.addEventListener('pointerdown', (e) => { lastDown = e.timeStamp; }, true);
    const fresh = (e) => e.detail === 0 || lastDown >= shownAt;
    box.querySelector('.txt').addEventListener('click', (e) => {
      if (e.target.closest('.jt') || e.target.closest('.sub.tap')) return;
      if (fresh(e)) advance();
    });
    box.querySelector('.b-next').onclick = (e) => { if (fresh(e)) advance(); };
    // a line longer than the sheet: Next first shows the rest, then advances
    box.querySelector('.txt').addEventListener('scroll', syncMore, { passive: true });
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(syncMore).observe(box.querySelector('.txt'));
    box.querySelector('.b-log').onclick = () => RB.ui.menu.open('log');
    box.querySelector('.b-voice').onclick = () => speak(true);
    box.querySelector('.b-tr').onclick = () => { showSub = !showSub; renderSub(); syncCtrl(); };
    box.querySelector('.b-words').onclick = () => { RB.ui.help.toggle(); syncCtrl(); };
    box.querySelector('.b-skip').onclick = () => { RB.game.setFastForward(true); advance(); };
    RB.ui.root.appendChild(box);
    // Keep this sentence: a tab in the sheet's tab row, outside the text and the controls (src/ui/66_words_pages.js)
    if (RB.ui.keep) RB.ui.keep.attach(box);
    choicesEl = RB.ui.el('div', 'choices hidden');
    choicesEl.setAttribute('role', 'group');
    choicesEl.setAttribute('aria-label', 'Your reply');
    RB.ui.root.appendChild(choicesEl);
    window.addEventListener('resize', () => dock(false));
    // choices sit just above the sheet, whatever its height
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(() => {
        const h = box.classList.contains('hidden') ? 0 : box.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--dlg-h', Math.round(h) + 'px');
      }).observe(box);
    }
  }
  function unread() {
    const t = box && box.querySelector('.txt');
    return t ? t.scrollHeight - t.scrollTop - t.clientHeight > 4 : false;
  }
  function syncMore() {
    if (!box) return;
    const more = unread();
    if (box.classList.contains('more') === more) return;
    box.classList.toggle('more', more);
    const nb = box.querySelector('.b-next');
    nb.innerHTML = more ? 'More' + I('down') : 'Next' + I('next');
    nb.setAttribute('aria-label', more ? 'Show the rest of this line' : 'Next');
  }
  function syncCtrl() {
    if (!box) return;
    const on = !!(RB.game.settings && RB.game.settings.lightbulb);
    box.querySelector('.b-words').setAttribute('aria-pressed', on ? 'true' : 'false');
    box.querySelector('.b-tr').setAttribute('aria-pressed', showSub ? 'true' : 'false');
  }

  // Test runs record every line spoken by a character who is not on the map
  // (a voice with no body). Some are meant (letters, memories, voices through
  // a door); the rest are staging bugs. See tests/e2e/pursue.mjs.
  function auditSpeaker(line) {
    const who = line.who;
    if (!who || who === 'narr' || who === 'pc' || !RB.render.worldVisible()) return;
    const W = RB.world.W;
    if (W.comp && (who === 'comp' || who === W.comp.id)) return;
    // present under any of their placements (hana_out is Hana)
    const person = (n) => (n.def && (n.def.char || n.def.id)) || n.id;
    if (W.npcs.some((n) => n.id === who || person(n) === who) || (W.extras || []).some((n) => n.id === who || person(n) === who)) return;
    if ((W.map.def.npcs || []).some((n) => n.was && n.id === who && W.npcs.some((q) => q.id === n.was))) return;
    const list = (RB.test.absentSpeakers = RB.test.absentSpeakers || []);
    const key = who + '|' + W.map.id + '|' + (line.sceneId || '');
    if (!list.some((x) => x.key === key)) list.push({ key, who, map: W.map.id, scene: line.sceneId || null, en: (line.en || '').slice(0, 70) });
  }
  function charInfo(who) {
    const s = RB.game.s;
    if (who === 'pc') return { name: { en: s.player.name, jp: s.player.nameJp || s.player.name }, pc: true };
    if (who === 'narr') return null;
    return RB.content.chars[who] || { name: { en: who, jp: '' } };
  }

  function say(line) {
    ensure();
    const s = RB.game.s;
    const seenScene = line.sceneId && s.seen[line.sceneId];
    if (RB.game.fastForward() && !seenScene) RB.game.setFastForward(false);
    // Suzu's Kansai-ben (src/lang/85_dialect.js): what is shown may be her Kansai version; the history
    // and a kept sentence keep the standard line (nothing Kansai is written into the save)
    current = Object.assign({}, RB.dialect ? RB.dialect.line(line.who, line) : line, { src: line });
    showSub = RB.game.settings.secondary === 'always';
    const ch = charInfo(line.who);
    s.backlog.push({ who: line.who, jp: line.jp, en: line.en });
    if (s.backlog.length > 220) s.backlog.splice(0, s.backlog.length - 200);
    if (RB.ui.keep) RB.ui.keep.line(line, s.backlog[s.backlog.length - 1]); // event-time context for keeping it
    const fresh = box.classList.contains('hidden');
    if (RB.test && RB.test.auto) auditSpeaker(line);
    box.classList.remove('hidden');
    document.body.classList.add('in-dialogue');
    box.classList.toggle('noportrait', !ch || !!line.noPortrait);
    const cv = box.querySelector('.portrait');
    cv.classList.toggle('hidden', !ch);
    // Animated portrait (src/ui/21_portrait_anim.js): the speaker's idle loop and this line's one-off lead-in
    // cue from its expression tag; the still image under Reduce motion and fast-forward. It owns the canvas
    // until the next line or hide().
    if (ch) RB.portraitAnim.play(cv, { who: ch.pc ? 'pc' : line.who, look: ch.pc ? RB.equip.look(s) : null, expr: line.expr, scene: line.sceneId });
    else RB.portraitAnim.stop();
    const whoEl = box.querySelector('.who');
    whoEl.innerHTML = ch ? '<span class="nm">' + esc(ch.name.en) + '</span>' + (ch.name.jp ? '<span class="jp">' + RB.ui.jhtml(ch.name.jp) + '</span>' : '') : '<span class="nm narr">' + (line.jp || line.en ? '' : '') + '</span>';
    box.classList.toggle('narration', !ch);
    const main = box.querySelector('.main');
    const hasJp = !!line.jp;
    renderMain();
    renderSub();
    box.querySelector('.b-voice').classList.toggle('hidden', !(hasJp && RB.voice && RB.voice.japaneseVoices && RB.voice.japaneseVoices().length));
    box.querySelector('.b-skip').classList.toggle('hidden', !(seenScene && RB.game.settings.skipSeen));
    box.querySelector('.b-tr').classList.toggle('hidden', RB.game.settings.secondary === 'always' || !hasJp);
    syncCtrl();
    box.querySelector('.txt').scrollTop = 0;
    // an illustrated sequence (src/ui/43_sequence.js) records the beat, adds its controls, and stops a skip
    // of seen lines at a line of it this campaign has not seen
    if (live) { live = null; box.classList.remove('reviewing'); }
    if (RB.sequence) RB.sequence.onLine(line);
    dock(fresh);
    requestAnimationFrame(syncMore);
    if (RB.game.settings.voice.auto && hasJp && !RB.game.fastForward()) speak(false);
    reveal(main);
    shownAt = performance.now();
    RB.audio && RB.audio.sfx('text_blip', { vol: 0.35 });
    return new Promise((res) => {
      pending = res;
      if (RB.game.fastForward() && seenScene) setTimeout(() => advance(true), 40);
      else if (RB.sequence && RB.sequence.skipping()) setTimeout(() => { if (pending === res) advance(true); }, 30);
      else if (RB.test && RB.test.auto) setTimeout(() => advance(true), 5);
    });
  }
  function renderMain() {
    if (!current) return;
    const main = box.querySelector('.main');
    if (RB.game.settings.lead === 'ja' && current.jp) {
      main.className = 'main';
      main.innerHTML = RB.ui.jhtml(current.jp);
    } else {
      main.className = 'main en';
      main.innerHTML = RB.ui.ehtml(current.en || '');
    }
  }
  // the line on screen again with the current settings (Suzu's speech changed while it shows)
  function refresh() {
    if (!box || !current || box.classList.contains('hidden')) return;
    const src = current.src || current;
    current = Object.assign({}, RB.dialect ? RB.dialect.line(src.who, src) : src, { src });
    if (revealing) revealing.finish();
    renderMain();
    renderSub();
    requestAnimationFrame(syncMore);
  }
  function renderSub() {
    if (!current) return;
    const sub = box.querySelector('.sub');
    const lead = RB.game.settings.lead;
    const sec = RB.game.settings.secondary;
    const hasJp = !!current.jp;
    const subIsJp = lead !== 'ja';
    if (!hasJp || sec === 'off' && !showSub) { sub.innerHTML = ''; sub.className = 'sub'; return; }
    if (!showSub && sec === 'tap') {
      sub.className = 'sub tap';
      sub.textContent = subIsJp ? '(tap for Japanese)' : '(tap for translation)';
      sub.onclick = () => { showSub = true; renderSub(); };
      return;
    }
    sub.onclick = null;
    if (!showSub && sec === 'off') { sub.innerHTML = ''; return; }
    if (subIsJp) { sub.className = 'sub'; sub.innerHTML = RB.ui.jhtml(current.jp); }
    else { sub.className = 'sub en'; sub.innerHTML = RB.ui.ehtml(current.en || ''); }
  }

  function reveal(container) {
    if (revealing) revealing.finish();
    const speed = RB.game.settings.textSpeed;
    if (speed === 'instant' || RB.game.fastForward()) return;
    // collect reveal units: jt spans / punctuation text / English words
    const units = [];
    const walk = (node) => {
      for (const ch of Array.from(node.childNodes)) {
        if (ch.nodeType === 3) {
          const txt = ch.textContent;
          if (!txt.trim()) continue;
          const frag = document.createDocumentFragment();
          txt.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const sp = document.createElement('span');
            sp.textContent = part;
            frag.appendChild(sp);
            units.push(sp);
          });
          ch.replaceWith(frag);
        } else if (ch.nodeType === 1) {
          if (ch.classList.contains('jt') || ch.tagName === 'RUBY') units.push(ch);
          else walk(ch);
        }
      }
    };
    walk(container);
    units.forEach((u) => u.classList.add('reveal-hide'));
    const per = speed === 'fast' ? 12 : 30;
    let i = 0;
    const step = () => {
      if (i >= units.length) { revealing = null; return; }
      const u = units[i++];
      u.classList.remove('reveal-hide');
      u.classList.add('reveal-show');
      const n = Math.max(1, (u.textContent || '').length);
      revealing.timer = setTimeout(step, per * Math.min(n, 6));
    };
    revealing = {
      timer: null,
      finish() {
        clearTimeout(this.timer);
        units.forEach((u) => { u.classList.remove('reveal-hide'); });
        revealing = null;
      },
    };
    step();
  }

  function speak(force) {
    if (!current || !current.jp || !RB.voice) return;
    const text = RB.jp && RB.jp.reading ? RB.jp.reading(current.jp, RB.script.jpVars()) : current.jp;
    const ch = RB.content.chars[current.who];
    RB.voice.speak(text, { pitch: ch && ch.voice ? ch.voice.pitch : 1 });
    void force;
  }

  function advance(auto) {
    if (!pending) return;
    // in an illustrated sequence a press can be used up first: showing hidden text, walking back from a
    // look at an earlier line, or finishing a shot's dissolve (it never also moves the scene on)
    if (!auto && RB.sequence && RB.sequence.intercept()) return;
    if (revealing && !auto) { revealing.finish(); requestAnimationFrame(syncMore); return; }
    if (!auto && unread()) {
      const t = box.querySelector('.txt');
      t.scrollBy({ top: Math.max(40, t.clientHeight * 0.8), behavior: RB.game.reducedMotion() ? 'auto' : 'smooth' });
      return;
    }
    if (RB.sequence) RB.sequence.advancing();
    if (revealing) revealing.finish();
    RB.voice && RB.voice.cancel();
    const r = pending;
    pending = null;
    RB.ui.help.hide();
    r();
  }

  // The camera never moves for the dialogue. When the sheet at the bottom
  // would cover the player or the speaker, it docks at the top of the screen
  // instead, and goes back when that stops being true. Each conversation
  // starts at the bottom; within one, the sheet only moves when it has to.
  function setTop(on) {
    box.classList.toggle('top', on);
    document.body.classList.toggle('dlg-top', on);
    if (choicesEl) choicesEl.classList.toggle('dlg-top', on);
  }
  function dock(fresh) {
    if (!box || box.classList.contains('hidden')) return;
    if (fresh) setTop(false);
    if (!RB.render.worldVisible()) { setTop(false); return; }
    const W = RB.world.W;
    const who = [W.player];
    const sp = current && current.who ? RB.world.actorById(current.who) : null;
    if (sp && sp !== W.player) who.push(sp);
    // a character sprite is a tile wide and a tile and a half tall
    const boxes = who.map((a) => { const p0 = RB.render.tileToCss(a.fx, a.fy - 0.5), p1 = RB.render.tileToCss(a.fx + 1, a.fy + 1); return { l: p0.x, t: p0.y, r: p1.x, b: p1.y }; });
    const r = box.getBoundingClientRect(), vh = window.innerHeight;
    const top = box.classList.contains('top');
    const edge = top ? r.top : vh - r.bottom;
    const there = top ? { t: vh - edge - r.height, b: vh - edge } : { t: edge, b: edge + r.height };
    const hits = (t, b) => boxes.some((q) => q.r > r.left + 4 && q.l < r.right - 4 && q.b > t + 4 && q.t < b - 4);
    if (hits(r.top, r.bottom) && !hits(there.t, there.b)) setTop(!top);
  }

  function choose(opts, o) {
    ensure();
    RB.game.setFastForward(false);
    if (RB.sequence) RB.sequence.stopSkip('choice'); // a skipped scene stops at a choice; nothing is chosen for you
    if (RB.test && RB.test.auto) return Promise.resolve(RB.test.choose(opts));
    return new Promise((res) => {
      choicesEl.innerHTML = '';
      choicesEl.classList.remove('hidden');
      const layer = { el: choicesEl, name: 'choices', parent: RB.ui.root, noAutofocus: false };
      choicesEl.classList.toggle('with-dlg', isOpen());
      choicesEl.classList.toggle('dlg-top', isOpen() && box.classList.contains('top'));
      const at = performance.now();
      opts.forEach((op, i) => {
        const b = RB.ui.el('button', 'choice');
        const lead = RB.game.settings.lead;
        b.innerHTML = '<span class="n" aria-hidden="true">' + (i + 1) + '</span><span class="c">' + (lead === 'ja' && op.jp
          ? RB.ui.jhtml(op.jp) + (op.en ? '<span class="en">' + esc(RB.script.enVars(op.en)) + '</span>' : '')
          : '<span class="enline">' + esc(RB.script.enVars(op.en || '')) + '</span>' + (op.jp ? '<span class="en">' + RB.ui.jhtml(op.jp) + '</span>' : '')) + '</span>';
        b.onclick = (e) => {
          if (e && e.detail !== 0 && lastDown < at) return; // a press from before the replies appeared
          if (RB.ui.keep) RB.ui.keep.chose(op); // the reply's event-time context, for keeping it later
          RB.ui.popLayer(layer);
          choicesEl.classList.add('hidden');
          choicesEl.innerHTML = '';
          RB.audio && RB.audio.sfx('confirm');
          res(i);
        };
        choicesEl.appendChild(b);
      });
      RB.ui.pushLayer(layer);
      choicesEl.classList.remove('hidden');
      void o;
    });
  }

  // A read-only look back (Previous in an illustrated sequence, src/ui/43_sequence.js): an earlier line shown
  // in the sheet while the live line's promise stays pending, so nothing of the scene runs; review(null) puts
  // the live line back, whole (never re-revealed, never moved on).
  let live = null;
  function review(line) {
    if (!box || box.classList.contains('hidden') || !current) return false;
    if (line) {
      if (!live) { if (revealing) revealing.finish(); live = current; }
      paint(line, true);
      box.classList.add('reviewing');
    } else if (live) {
      const l = live;
      live = null;
      paint(l.src || l, false);
      box.classList.remove('reviewing');
    }
    return true;
  }
  function paint(line, still) {
    const s = RB.game.s;
    current = Object.assign({}, RB.dialect ? RB.dialect.line(line.who, line) : line, { src: line });
    const ch = charInfo(line.who);
    box.classList.toggle('noportrait', !ch || !!line.noPortrait);
    box.classList.toggle('narration', !ch);
    const cv = box.querySelector('.portrait');
    cv.classList.toggle('hidden', !ch);
    if (ch) RB.portraitAnim.play(cv, { who: ch.pc ? 'pc' : line.who, look: ch.pc ? RB.equip.look(s) : null, expr: line.expr, scene: line.sceneId, still });
    else RB.portraitAnim.stop();
    box.querySelector('.who').innerHTML = ch ? '<span class="nm">' + esc(ch.name.en) + '</span>' + (ch.name.jp ? '<span class="jp">' + RB.ui.jhtml(ch.name.jp) + '</span>' : '') : '<span class="nm narr"></span>';
    renderMain();
    renderSub();
    box.querySelector('.txt').scrollTop = 0;
    requestAnimationFrame(syncMore);
  }

  function hide() {
    if (!box) return;
    RB.portraitAnim.stop(); // the portrait stops animating with the sheet
    if (live) { live = null; box.classList.remove('reviewing'); }
    box.classList.add('hidden');
    setTop(false);
    document.body.classList.remove('in-dialogue');
    RB.voice && RB.voice.cancel();
    RB.game.setFastForward(false);
    current = null;
  }
  function onAction(a) {
    if (!box || box.classList.contains('hidden') || !pending) return false;
    // an illustrated sequence's keys: Escape opens its skip control, ← / P look back, R replays the shot, I hides the text
    if (RB.sequence && RB.sequence.onAction(a)) return true;
    if (a === 'ok') { advance(); return true; }
    if (a === 'tr' && !box.querySelector('.b-tr').classList.contains('hidden')) { showSub = !showSub; renderSub(); syncCtrl(); return true; }
    if (a === 'log') { RB.ui.menu.open('log'); return true; }
    if (a === 'cancel') { return true; }
    return false;
  }
  function isOpen() { return !!(box && !box.classList.contains('hidden')); }
  return { say, choose, hide, onAction, advance, isOpen, refresh, review, shown:() => (current ? { who: current.who, jp: current.jp, en: current.en, dia: current.dia || null } : null) };
})();
