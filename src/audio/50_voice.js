/* Optional Japanese voice playback via the browser's speech synthesis.
 *
 * Honest by construction:
 *  - Only voices with localService === true and a ja* language are ever used.
 *    The utterance's voice is always set explicitly, so the browser can never
 *    silently substitute a default (possibly network) voice. If no local
 *    Japanese voice exists, speak() does nothing and returns false.
 *  - This is text-to-speech by the player's device, not recorded voice acting;
 *    status().note says so for the settings screen.
 *  - speak() cancels any previous utterance first (no backlog overlap) and
 *    ducks the music while speaking.
 *
 * API: supported(), japaneseVoices(), onChange(cb) -> unsubscribe,
 *      setVoice(voiceURI|null), setRate(0.5..1.5), speak(text, {onend,
 *      onstart, rate, pitch}), cancel(), speaking(), selected(), status().
 * onend({spoken:boolean}) fires when speech finishes or cannot start; it is
 * NOT called for an utterance that was cancelled or superseded. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.voice = RB.voice || {};

(function (V) {
  'use strict';
  const G = globalThis;
  const S = { uri: null, rate: 1, listeners: new Set(), hooked: false, gen: 0, speaking: false, watchdog: null };
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  function synth() {
    return G.speechSynthesis || null;
  }
  V.supported = () => !!(synth() && typeof G.SpeechSynthesisUtterance === 'function');

  function allVoices() {
    try {
      return (synth() && synth().getVoices()) || [];
    } catch (e) {
      return [];
    }
  }
  const isJa = (v) => /^ja(?:[-_]|$)/i.test((v && v.lang) || '');
  const localJa = () => allVoices().filter((v) => isJa(v) && v.localService === true);
  const plain = (v) => ({ voiceURI: v.voiceURI, name: v.name, lang: v.lang, default: !!v.default, local: true });

  function notify() {
    const list = V.japaneseVoices();
    for (const cb of Array.from(S.listeners)) {
      try { cb(list); } catch (e) { /* listener errors must not break speech */ }
    }
  }
  // Lazily attach listeners on first use (nothing happens at load time).
  function hook() {
    if (S.hooked || !V.supported()) return;
    S.hooked = true;
    const s = synth();
    if (s.addEventListener) s.addEventListener('voiceschanged', notify);
    else s.onvoiceschanged = notify;
    allVoices(); // some engines only start loading voices when asked
    if (G.addEventListener) G.addEventListener('pagehide', () => V.cancel());
    const A = RB.audio && RB.audio._;
    if (A && A.hooks) A.hooks.mute.push((muted) => { if (muted) V.cancel(); });
  }

  V.japaneseVoices = function () {
    if (!V.supported()) return [];
    hook();
    return localJa().map(plain);
  };
  V.onChange = function (cb) {
    hook();
    if (typeof cb === 'function') S.listeners.add(cb);
    return () => S.listeners.delete(cb);
  };
  V.setVoice = (uri) => { S.uri = uri || null; };
  V.setRate = (r) => {
    r = Number(r);
    if (r === r) S.rate = clamp(r, 0.5, 1.5);
  };
  V.getRate = () => S.rate;

  function pickVoice() {
    const list = localJa();
    if (!list.length) return null;
    if (S.uri) {
      const v = list.find((x) => x.voiceURI === S.uri);
      if (v) return v;
    }
    return list.find((x) => x.default) || list.find((x) => /^ja[-_]JP$/i.test(x.lang)) || list[0];
  }
  V.selected = () => {
    const v = V.supported() ? pickVoice() : null;
    return v ? { voiceURI: v.voiceURI, name: v.name, lang: v.lang } : null;
  };
  V.speaking = () => S.speaking;

  function volume() {
    const A = RB.audio;
    if (!A || !A.getVolume) return 1;
    if (A.isMuted && A.isMuted()) return 0;
    const m = A.getVolume('master');
    const v = A.getVolume('voice');
    return clamp((m == null ? 1 : m) * (v == null ? 1 : v), 0, 1);
  }
  function duck(on) {
    if (RB.audio && RB.audio.duck) RB.audio.duck(on);
  }
  const later = (fn) => Promise.resolve().then(fn);

  V.cancel = function () {
    S.gen++;
    clearTimeout(S.watchdog);
    const was = S.speaking;
    S.speaking = false;
    if (V.supported()) {
      try { synth().cancel(); } catch (e) { /* ignore */ }
    }
    if (was) duck(false);
  };

  V.speak = function (text, opts) {
    opts = opts || {};
    const report = (ok) => {
      if (typeof opts.onend === 'function') {
        try { opts.onend({ spoken: ok }); } catch (e) { /* ignore */ }
      }
    };
    text = String(text == null ? '' : text).trim();
    if (!V.supported() || !text) {
      later(() => report(false));
      return false;
    }
    hook();
    V.cancel(); // never let utterances queue up behind each other
    const voice = pickVoice();
    const vol = volume();
    if (!voice || vol <= 0) {
      later(() => report(false));
      return false;
    }
    const s = synth();
    const u = new G.SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.voice = voice;
    u.rate = clamp(Number(opts.rate) || S.rate, 0.5, 1.5);
    u.pitch = clamp(opts.pitch == null ? 1 : Number(opts.pitch) || 1, 0.5, 1.5);
    u.volume = vol;
    const gen = ++S.gen;
    const finish = (ok) => {
      if (gen !== S.gen) return; // superseded or cancelled
      S.gen++;
      S.speaking = false;
      clearTimeout(S.watchdog);
      duck(false);
      report(ok);
    };
    u.onstart = () => {
      if (gen === S.gen && typeof opts.onstart === 'function') {
        try { opts.onstart(); } catch (e) { /* ignore */ }
      }
    };
    u.onend = () => finish(true);
    u.onerror = () => finish(false);
    S.speaking = true;
    duck(true);
    // Watchdog: some engines occasionally never fire onend/onerror.
    const est = 2 + (text.length * 0.3) / u.rate;
    const check = () => {
      if (gen !== S.gen) return;
      if (s.speaking || s.pending) S.watchdog = setTimeout(check, 2000);
      else finish(false);
    };
    S.watchdog = setTimeout(check, est * 1000);
    try {
      if (s.paused) s.resume();
      s.speak(u);
    } catch (e) {
      finish(false);
      return false;
    }
    return true;
  };

  V.status = function () {
    const supported = V.supported();
    if (supported) hook();
    const all = supported ? allVoices() : [];
    const ja = all.filter(isJa);
    const local = ja.filter((v) => v.localService === true);
    const sel = supported ? pickVoice() : null;
    let note;
    if (!supported) {
      note = 'This browser does not offer speech synthesis. All Japanese text is still shown, with readings; voice playback is simply unavailable.';
    } else if (!all.length) {
      note = 'The browser has not listed any voices yet (some list them a moment after start-up). If none appear, no Japanese voice is installed on this device; all text stays readable.';
    } else if (!local.length) {
      note = ja.length
        ? 'Only online Japanese voices were found. The game never uses online voices, so nothing is sent anywhere; install a Japanese voice in your system settings to enable playback.'
        : 'No Japanese voice is installed on this device. All Japanese text stays readable; installing a Japanese system voice enables playback.';
    } else {
      note = 'Using “' + sel.name + '”: local text-to-speech from your device, not recorded voice acting. Synthetic speech can misread names and does not model pitch accent reliably — a convenience, not a pronunciation reference.';
    }
    return {
      supported,
      localJaCount: local.length,
      networkJaCount: ja.length - local.length,
      selected: sel ? { voiceURI: sel.voiceURI, name: sel.name, lang: sel.lang } : null,
      rate: S.rate,
      speaking: S.speaking,
      note,
    };
  };
})(RB.voice);
