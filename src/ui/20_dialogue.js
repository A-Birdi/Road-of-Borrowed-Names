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
  let current = null;       // current line data
  let showSub = false;

  function ensure() {
    if (box) return;
    box = RB.ui.el('div', 'dlg hidden');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-live', 'polite');
    box.innerHTML =
      '<canvas class="portrait" width="48" height="48" aria-hidden="true"></canvas>' +
      '<div class="txt"><div class="who"></div><div class="main"></div><div class="sub"></div></div>' +
      '<div class="ctrl">' +
      '<button class="btn b-voice" title="Replay voice" aria-label="Replay Japanese voice">🔊</button>' +
      '<button class="btn b-tr" title="Show/hide translation (T)">Aあ</button>' +
      '<button class="btn b-log" title="Dialogue history (L)">Log</button>' +
      '<button class="btn b-skip" title="Skip lines you have already seen">Skip seen ⏩</button>' +
      '<button class="btn b-next" aria-label="Next">Next <span class="next">▼</span></button></div>';
    box.addEventListener('click', (e) => {
      if (e.target.closest('.jt') || e.target.closest('.ctrl') || e.target.closest('.sub.tap')) return;
      advance();
    });
    box.querySelector('.b-next').onclick = () => advance();
    box.querySelector('.b-log').onclick = () => RB.ui.menu.open('log');
    box.querySelector('.b-voice').onclick = () => speak(true);
    box.querySelector('.b-tr').onclick = () => { showSub = !showSub; renderSub(); };
    box.querySelector('.b-skip').onclick = () => { RB.game.setFastForward(true); advance(); };
    RB.ui.root.appendChild(box);
    choicesEl = RB.ui.el('div', 'choices hidden');
    RB.ui.root.appendChild(choicesEl);
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
    current = line;
    showSub = RB.game.settings.secondary === 'always';
    const ch = charInfo(line.who);
    s.backlog.push({ who: line.who, jp: line.jp, en: line.en });
    if (s.backlog.length > 220) s.backlog.splice(0, s.backlog.length - 200);
    box.classList.remove('hidden');
    document.body.classList.add('in-dialogue');
    box.classList.toggle('noportrait', !ch || !!line.noPortrait);
    const cv = box.querySelector('.portrait');
    cv.classList.toggle('hidden', !ch);
    if (ch) {
      if (ch.pc) RB.portraits.drawPlayer(cv, s.player.look, line.expr);
      else RB.portraits.draw(cv, line.who, line.expr);
    }
    const whoEl = box.querySelector('.who');
    whoEl.innerHTML = ch ? '<span>' + esc(ch.name.en) + '</span>' + (ch.name.jp ? '<span class="jp">' + RB.ui.jhtml(ch.name.jp) + '</span>' : '') : '';
    const lead = RB.game.settings.lead;
    const main = box.querySelector('.main');
    const hasJp = !!line.jp;
    if (lead === 'ja' && hasJp) {
      main.className = 'main';
      main.innerHTML = RB.ui.jhtml(line.jp);
    } else {
      main.className = 'main en';
      main.innerHTML = RB.ui.ehtml(line.en || '');
    }
    renderSub();
    box.querySelector('.b-voice').classList.toggle('hidden', !(hasJp && RB.voice && RB.voice.japaneseVoices && RB.voice.japaneseVoices().length));
    box.querySelector('.b-skip').classList.toggle('hidden', !(seenScene && RB.game.settings.skipSeen));
    box.querySelector('.b-tr').classList.toggle('hidden', RB.game.settings.secondary === 'always' || !hasJp);
    if (RB.game.settings.voice.auto && hasJp && !RB.game.fastForward()) speak(false);
    reveal(main);
    RB.audio && RB.audio.sfx('text_blip', { vol: 0.35 });
    return new Promise((res) => {
      pending = res;
      if (RB.game.fastForward() && seenScene) setTimeout(() => advance(true), 40);
      else if (RB.test && RB.test.auto) setTimeout(() => advance(true), 5);
    });
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
    if (revealing && !auto) { revealing.finish(); return; }
    if (revealing) revealing.finish();
    RB.voice && RB.voice.cancel();
    const r = pending;
    pending = null;
    RB.ui.help.hide();
    r();
  }

  function choose(opts, o) {
    ensure();
    RB.game.setFastForward(false);
    if (RB.test && RB.test.auto) return Promise.resolve(RB.test.choose(opts));
    return new Promise((res) => {
      choicesEl.innerHTML = '';
      choicesEl.classList.remove('hidden');
      const layer = { el: choicesEl, name: 'choices', parent: RB.ui.root, noAutofocus: false };
      opts.forEach((op, i) => {
        const b = RB.ui.el('button', 'btn');
        const lead = RB.game.settings.lead;
        b.innerHTML = lead === 'ja' && op.jp
          ? RB.ui.jhtml(op.jp) + (op.en ? '<span class="en">' + esc(RB.script.enVars(op.en)) + '</span>' : '')
          : '<span class="enline">' + esc(RB.script.enVars(op.en || '')) + '</span>' + (op.jp ? '<span class="en">' + RB.ui.jhtml(op.jp) + '</span>' : '');
        b.onclick = (e) => {
          if (e.target.closest('.jt') && RB.ui.help.enabled()) return;
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

  function hide() {
    if (!box) return;
    box.classList.add('hidden');
    document.body.classList.remove('in-dialogue');
    RB.voice && RB.voice.cancel();
    RB.game.setFastForward(false);
    current = null;
  }
  function onAction(a) {
    if (!box || box.classList.contains('hidden') || !pending) return false;
    if (a === 'ok') { advance(); return true; }
    if (a === 'log') { RB.ui.menu.open('log'); return true; }
    if (a === 'cancel') { return true; }
    return false;
  }
  function isOpen() { return !!(box && !box.classList.contains('hidden')); }
  return { say, choose, hide, onAction, advance, isOpen };
})();
