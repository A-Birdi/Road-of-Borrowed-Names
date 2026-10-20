/* Spoken lines in panels (Robin, 2026-10-19: "every line in-game should have spoken lines with properly highlightable
 * text as well"; 2026-10-20: "If something isn't set up to be spoken yet, explain why and find a proper way to resolve it
 * completely"). A sentence someone says in a panel outside the dialogue strip (a companion's remark by the water, at the
 * shiritori table, what you notice working an exploration action's sheet) is shown as the strip shows it: Suzu's
 * Kansai when chosen, word help on every word, pointing at a word marks its counterpart (src/ui/22_speech_mark.js). It
 * has a Voice button that says it from its recording, found by the line's scene id and its Japanese like any line
 * (src/audio/52_voicebank.js), or the device's voice (src/audio/54_voice_route.js); the spoken word is marked as it is
 * said. When lines are spoken automatically, the panel says a new line as it appears (autoIn). Each line's scene id is
 * listed for recording by the part of the game that makes it (RB.content.spokenSources, tools/voice/lines.mjs).
 *
 *   RB.ui.spoken.html(line, o) → markup for one line. line: the line as authored { who, jp, en, sceneId, expr? } (a
 *        shown Kansai line is taken back to its standard words, which are the recording's key; it is shown as the
 *        speaker speaks: Suzu's Kansai when chosen); o: { tag ('div'), cls, jpCls ('jp'), enCls ('en'), whoHtml (the
 *        speaker's name, already escaped), asIs (shown in the words given, never another dialect's), noEn (the
 *        Japanese alone: the place showing it keeps its own English, as a battle's telegraph does behind Translate) }
 *   RB.ui.spoken.speak(el)     say the line of a .say-line (or of the element inside one)
 *   RB.ui.spoken.autoIn(root)  say the first line in root, when lines are spoken automatically (a new line has appeared)
 *   RB.ui.spoken.stop()        quiet (the panel closed)
 *   RB.ui.spoken.lineOf(el)    the shown line of a .say-line (pointing at a word: src/ui/22_speech_mark.js)
 */
var RB = (globalThis.RB = globalThis.RB || {});
RB.ui = RB.ui || {};

RB.ui.spoken = (function () {
  'use strict';
  const esc = (t) => RB.util.esc(t == null ? '' : String(t));
  const LINES = new Map(); // id -> { display, source }; the newest few hundred (a panel re-renders its lines)
  const MAX = 400;
  let seq = 0;
  function keep(display, source) {
    const id = 'sl' + (++seq);
    LINES.set(id, { display, source });
    if (LINES.size > MAX) LINES.delete(LINES.keys().next().value);
    return id;
  }
  const icon = () => (RB.ui.folio && RB.ui.folio.icon ? RB.ui.folio.icon('sound') : '');
  function html(line, o) {
    o = o || {};
    if (!line || !line.jp) return '';
    const who = line.who || 'narr';
    const std = RB.dialect && RB.dialect.std ? RB.dialect.std(line) : line;
    const source = { who, jp: std.jp, en: std.en || '', sceneId: line.sceneId || null, expr: line.expr || null };
    const display = o.asIs ? Object.assign({}, source, line.dia ? { jp: line.jp, en: line.en, dia: line.dia } : {})
      : RB.dialect && RB.dialect.line ? RB.dialect.line(who, source) : source;
    const id = keep(display, source);
    const can = !!(RB.voice && RB.voice.canSayLine && RB.voice.canSayLine(display, source));
    const tag = o.tag || 'div';
    const en = RB.game && RB.game.s && RB.script && RB.script.enVars ? RB.script.enVars(display.en || '') : display.en || '';
    return '<' + tag + ' class="say-line' + (o.cls ? ' ' + o.cls : '') + '" data-say="' + id + '">' +
      (o.whoHtml ? '<span class="who">' + o.whoHtml + '</span>' : '') +
      (can ? '<button type="button" class="say-voice" data-say-voice title="Say this line" aria-label="Voice: say this line">' + icon() + '</button>' : '') +
      '<span class="' + (o.jpCls || 'jp') + ' main">' + RB.ui.jhtml(display.jp) + '</span>' +
      (o.noEn ? '' : '<span class="' + (o.enCls || 'en') + ' sub"><span class="enline">' + esc(en) + '</span></span>') +
      '</' + tag + '>';
  }
  const boxOf = (el) => (el && el.closest ? el.closest('.say-line[data-say]') : null);
  function lineOf(el) {
    const box = boxOf(el);
    const l = box && LINES.get(box.getAttribute('data-say'));
    return l ? l.display : null;
  }
  function stop() {
    if (RB.ui.speechMark) RB.ui.speechMark.stop();
    if (RB.voice && RB.voice.cancel) RB.voice.cancel();
  }
  // as the dialogue strip says a line (src/ui/20_dialogue.js speak): its reading, the speaker's pitch, the word marked
  function speak(el) {
    const box = boxOf(el);
    const l = box && LINES.get(box.getAttribute('data-say'));
    if (!l || !RB.voice || !RB.voice.sayLine) return false;
    const vars = RB.game && RB.game.s && RB.script && RB.script.jpVars ? RB.script.jpVars() : undefined;
    const text = RB.jp && RB.jp.reading ? RB.jp.reading(l.display.jp, vars) : l.display.jp;
    const ch = RB.content.chars && RB.content.chars[l.source.who];
    const mark = RB.ui.speechMark ? RB.ui.speechMark.begin(box, l.display, text) : null;
    RB.voice.sayLine(l.display, l.source, {
      text, pitch: ch && ch.voice ? ch.voice.pitch : 1,
      onstart: mark ? () => mark.start() : undefined,
      onboundary: mark ? (ci) => mark.at(ci) : undefined,
      follow: mark ? (get, dur) => mark.follow(get, dur) : undefined,
      onend: mark ? () => mark.end() : undefined,
    });
    return true;
  }
  // (a line shown twice at once, over a stage and in its panel, is said once)
  let lastAuto = { k: null, t: 0 };
  function autoIn(root) {
    if (!root || !RB.voice || !RB.voice.autoOn || !RB.voice.autoOn()) return false;
    if (RB.game && RB.game.fastForward && RB.game.fastForward()) return false;
    const box = root.matches && root.matches('.say-line[data-say]') ? root : root.querySelector ? root.querySelector('.say-line[data-say]') : null;
    const l = box && LINES.get(box.getAttribute('data-say'));
    if (!l) return false;
    const k = l.source.sceneId + '|' + l.source.who + '|' + l.source.jp, now = Date.now();
    if (lastAuto.k === k && now - lastAuto.t < 2000) return false;
    lastAuto = { k, t: now };
    return speak(box);
  }
  // the Voice button, wherever a panel shows it (before the panel's own click handling, which it is not part of)
  if (typeof document !== 'undefined') {
    document.addEventListener('click', (e) => {
      const b = e.target && e.target.closest && e.target.closest('[data-say-voice]');
      if (!b) return;
      e.stopPropagation();
      e.preventDefault();
      speak(b);
    }, true);
  }
  return { html, speak, autoIn, stop, lineOf, _lines: LINES };
})();
