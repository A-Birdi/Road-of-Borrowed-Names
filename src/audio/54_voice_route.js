/* Which voice speaks (C-83's runtime rule; Robin 2026-10-16: "Recorded-audio availability must be independent of
 * installed Japanese TTS, including the learning/reference-reading controls"). Every place that speaks Japanese asks
 * here, not RB.voice.speak directly:
 *  - Prepared voices (the default): the game's recording when there is one (src/audio/52_voicebank.js), else the
 *    device's Japanese voice when the device has one, else silence;
 *  - Device voice: the device's voice only, as before the recordings;
 *  - No voice: nothing speaks, and the buttons that would speak are hidden.
 * The player's own lines follow the player's voice (A / B / None); None keeps them silent while the recordings are
 * playing (C-83: an unset choice reads as None).
 *
 * API (on RB.voice): mode(), autoOn(), sayLine(display, source, opts), sayRef(key, text, opts), canSayLine(display,
 * source), canSayRef(key), canSpeak() (device), cancel() (both). opts as RB.voice.speak, plus follow(getTime, duration)
 * for a recording's clock, and rate (a recording keeps its pitch when slowed). Reference keys: 'word:<written>|<reading>',
 * 'kana:<k>|<k>', 'kanji:<k>|<readings joined with 、>', 'phrase:<reading without spaces>' (production_manifest.mjs). */
var RB = (globalThis.RB = globalThis.RB || {});
RB.voice = RB.voice || {};

(function (V) {
  'use strict';
  const B = () => RB.voicebank;
  const vs = () => (RB.game && RB.game.settings && RB.game.settings.voice) || {};
  V.mode = () => (['prepared', 'device', 'none'].includes(vs().mode) ? vs().mode : 'prepared');
  const prepared = () => V.mode() === 'prepared' && B() && B().active();
  // the device's voice may speak: not "No voice", and a local Japanese voice exists
  V.canSpeak = () => V.mode() !== 'none' && !!(V.japaneseVoices && V.japaneseVoices().length);
  // lines spoken as they appear: the recordings by default (Settings: "Play the voices automatically"); the device's
  // voice only when the player turned it on, as before
  V.autoOn = () => {
    if (V.mode() === 'none') return false;
    if (prepared()) return vs().autoRec !== false;
    return !!vs().auto;
  };

  const deviceCancel = V.cancel;
  V.cancel = function () {
    if (B()) B().stop();
    return deviceCancel.apply(V, arguments);
  };
  const report = (o, ok) => { if (o && typeof o.onend === 'function') { try { o.onend({ spoken: ok }); } catch (e) { /* ignore */ } } };
  const device = (text, o) => (V.canSpeak() ? V.speak(text, o) : (Promise.resolve().then(() => report(o, false)), false));

  // a dialogue line: display is what shows (Suzu's Kansai), source the script's line (its scene and markup)
  V.sayLine = async function (display, source, o) {
    o = o || {};
    if (V.mode() === 'none') { report(o, false); return 'none'; }
    deviceCancel.call(V);
    if (prepared()) {
      const r = await B().playLine(display, source, o);
      if (r === 'playing') return 'recorded';
      if (r === 'cancelled') return 'cancelled';
      if (r === 'silent') { report(o, false); return 'silent'; }
    }
    const text = o.text || (RB.jp && RB.jp.reading ? RB.jp.reading((display && display.jp) || source.jp, RB.script && RB.script.jpVars ? RB.script.jpVars() : undefined) : (display || source).jp);
    return device(text, o) ? 'device' : 'none';
  };
  // a reference reading or a phrase: the recording, else the device saying text
  V.sayRef = async function (key, text, o) {
    o = o || {};
    if (V.mode() === 'none') { report(o, false); return 'none'; }
    deviceCancel.call(V);
    if (prepared() && key) {
      const r = await B().playRef(key, o);
      if (r === 'playing') return 'recorded';
      if (r === 'cancelled') return 'cancelled';
    }
    return device(text, o) ? 'device' : 'none';
  };
  // whether a control that speaks should show: the device can speak, or a recording exists (null from the
  // voicebank, an index still loading, counts as yes while the recordings are active)
  V.canSayLine = (display, source) => {
    if (V.mode() === 'none') return false;
    if (prepared()) { const h = B().hasLine(display, source); if (h !== false) return true; }
    return V.canSpeak();
  };
  V.canSayRef = (key) => {
    if (V.mode() === 'none') return false;
    if (prepared() && key && B().hasRef(key) !== false) return true;
    return V.canSpeak();
  };
  // the keys the controls use (the same as tools/voice/production_manifest.mjs)
  V.refKey = {
    word: (w, r) => 'word:' + w + '|' + r,
    kana: (k) => 'kana:' + k + '|' + k,
    kanji: (k, readings) => 'kanji:' + k + '|' + readings.join('、'),
    phrase: (jp) => 'phrase:' + String(RB.jp.reading(jp)).replace(/\s+/g, '').normalize('NFC'),
    // a listening step or a caller's text: its phrase, else the lexicon word it is (written form and reading)
    spoken: (jp) => {
      const out = [V.refKey.phrase(jp)];
      const plain = String(RB.jp.plain(jp)).replace(/\s+/g, ''), reading = String(RB.jp.reading(jp)).replace(/\s+/g, '');
      const es = RB.lex && RB.lex.bySurface ? RB.lex.bySurface(plain) || [] : [];
      const e = es.find((x) => x.r === reading);
      if (e) out.push(V.refKey.word(e.w, e.r));
      return out;
    },
  };
})(RB.voice);
