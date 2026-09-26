// RB.voice against a mocked speechSynthesis (node). Checks the honesty rules:
// only local Japanese voices are used, previous speech is cancelled before new
// speech, music is ducked while speaking, and status() explains limitations.
import { load } from '../lib/load.mjs';

function makeEnv(voices) {
  const spoken = [];
  const env = {
    spoken,
    cancels: 0,
    listeners: {},
  };
  env.synth = {
    speaking: false,
    pending: false,
    paused: false,
    getVoices: () => voices,
    speak(u) { spoken.push(u); this.speaking = true; },
    cancel() { env.cancels++; this.speaking = false; },
    resume() {},
    addEventListener(ev, fn) { env.listeners[ev] = fn; },
  };
  env.Utt = class { constructor(text) { this.text = text; } };
  return env;
}

const LOCAL = { voiceURI: 'local-ja', name: 'Kyoko', lang: 'ja-JP', localService: true, default: false };
const LOCAL2 = { voiceURI: 'local-ja-2', name: 'Otoya', lang: 'ja_JP', localService: true, default: false };
const NET = { voiceURI: 'net-ja', name: 'Google 日本語', lang: 'ja-JP', localService: false, default: true };
const EN = { voiceURI: 'en', name: 'Alex', lang: 'en-US', localService: true, default: true };
const tick = () => new Promise((r) => setTimeout(r, 0));

export default async (t) => {
  // --- no speech synthesis at all
  {
    const RB = load(['core/00_ns.js', 'audio']);
    t.ok(RB.voice.supported() === false, 'unsupported without speechSynthesis');
    t.eq(RB.voice.japaneseVoices(), [], 'no voices when unsupported');
    let ended = null;
    t.ok(RB.voice.speak('こんにちは', { onend: (r) => { ended = r; } }) === false, 'speak refuses when unsupported');
    await tick();
    t.ok(ended && ended.spoken === false, 'onend still reported (spoken:false) so callers never hang');
    const s = RB.voice.status();
    t.ok(!s.supported && /not offer speech/.test(s.note), 'status note explains missing synthesis');
  }

  // --- only a network Japanese voice: must never be used
  {
    const env = makeEnv([NET, EN]);
    const RB = load(['core/00_ns.js', 'audio'], { speechSynthesis: env.synth, SpeechSynthesisUtterance: env.Utt });
    t.eq(RB.voice.japaneseVoices(), [], 'network voice is not listed');
    RB.voice.setVoice('net-ja');
    t.ok(RB.voice.speak('こんにちは') === false, 'speak refuses with only a network voice, even if selected');
    t.ok(env.spoken.length === 0, 'nothing was sent to the synthesiser');
    const s = RB.voice.status();
    t.ok(s.localJaCount === 0 && s.networkJaCount === 1 && /never uses online voices/.test(s.note), 'status explains online voices are not used');
  }

  // --- local voices present
  {
    const env = makeEnv([NET, EN, LOCAL, LOCAL2]);
    const RB = load(['core/00_ns.js', 'audio'], { speechSynthesis: env.synth, SpeechSynthesisUtterance: env.Utt });
    const ducks = [];
    RB.audio.duck = (on) => ducks.push(on);
    const list = RB.voice.japaneseVoices();
    t.eq(list.map((v) => v.voiceURI), ['local-ja', 'local-ja-2'], 'lists only local ja voices (ja-JP and ja_JP)');
    t.ok(list.every((v) => v.local === true), 'listed voices are marked local');

    RB.voice.setRate(3);
    t.ok(RB.voice.getRate() === 1.5, 'rate clamps to 1.5');
    RB.voice.setRate(0.1);
    t.ok(RB.voice.getRate() === 0.5, 'rate clamps to 0.5');
    RB.voice.setRate(0.9);

    let end1 = 0;
    t.ok(RB.voice.speak('ひとつめ', { onend: () => end1++ }) === true, 'speak starts');
    const u1 = env.spoken[0];
    t.ok(u1.voice === LOCAL, 'utterance voice set explicitly to the local voice');
    t.ok(u1.lang === 'ja-JP', 'utterance lang is ja-JP');
    t.ok(u1.rate === 0.9 && u1.volume > 0, 'rate and volume applied');
    t.eq(ducks, [true], 'music ducked while speaking');
    t.ok(RB.voice.speaking(), 'speaking() true');

    const cancelsBefore = env.cancels;
    RB.voice.speak('ふたつめ', { pitch: 1.2 });
    t.ok(env.cancels > cancelsBefore, 'new speech cancels the previous utterance first');
    const u2 = env.spoken[1];
    t.ok(u2.pitch === 1.2, 'pitch option applied');
    u1.onend && u1.onend(); // stale utterance ending must not affect the new one
    t.ok(end1 === 0, 'superseded utterance does not fire its onend');
    t.ok(RB.voice.speaking(), 'still speaking the newer utterance');
    let end2 = null;
    RB.voice.speak('みっつめ', { onend: (r) => { end2 = r; } });
    const u3 = env.spoken[2];
    u3.onend();
    t.ok(end2 && end2.spoken === true, 'onend fires when speech finishes');
    t.ok(ducks[ducks.length - 1] === false, 'music unducked after speech');
    t.ok(!RB.voice.speaking(), 'speaking() false after end');

    RB.voice.setVoice('local-ja-2');
    RB.voice.speak('よっつめ');
    t.ok(env.spoken[3].voice === LOCAL2, 'setVoice selects another local voice');
    RB.voice.setVoice('net-ja');
    RB.voice.speak('いつつめ');
    t.ok(env.spoken[4].voice.localService === true, 'selecting a network voice falls back to a local one');
    RB.voice.cancel();
    t.ok(!RB.voice.speaking() && ducks[ducks.length - 1] === false, 'cancel stops and unducks');

    t.ok(RB.voice.speak('   ') === false, 'empty text is not spoken');

    RB.audio.setMuted(true);
    t.ok(RB.voice.speak('むっつめ') === false, 'muted audio: speech not started');
    RB.audio.setMuted(false);
    RB.audio.setVolume('voice', 0.5);
    RB.voice.speak('ななつめ');
    const last = env.spoken[env.spoken.length - 1];
    t.ok(Math.abs(last.volume - 0.8 * 0.5) < 1e-9, 'utterance volume = master × voice volume');
    RB.voice.speak('やっつめ');
    const cancelsAtMute = env.cancels;
    RB.audio.setMuted(true);
    t.ok(env.cancels > cancelsAtMute, 'muting cancels current speech');
    RB.audio.setMuted(false);

    let changed = null;
    const off = RB.voice.onChange((l) => { changed = l; });
    env.listeners.voiceschanged && env.listeners.voiceschanged();
    t.ok(Array.isArray(changed) && changed.length === 2, 'onChange fires on voiceschanged with local ja voices');
    off();

    const s = RB.voice.status();
    t.ok(s.supported && s.localJaCount === 2 && s.networkJaCount === 1, 'status counts local vs network voices');
    t.ok(/not recorded voice acting/.test(s.note), 'status note labels synthesis honestly');
  }
};
