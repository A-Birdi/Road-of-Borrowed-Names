// Whether a line or a reference reading may be spoken: the voice route's two answers (src/audio/54_voice_route.js 70-79,
// canSayLine and canSayRef), which decide whether a Say button is offered (src/ui/22c_spoken_panel.js 46/51). Over every
// combination of who speaks (Settings: recorded voices, the device's voice, no voice), whether the recordings are
// active, what the voicebank answers for the line or key (it has it, it has not, or null: its index still loading) and
// whether the device has a local Japanese voice (CC-617, CL-859, Agnes 6920360412). The voicebank and the device's voice
// list are stand-ins for the length of each answer; nothing is loaded, fetched or spoken.
//  1. 36 rows, each with both answers (a reference with a key):
//     - "No voice": never;
//     - recorded voices with the recordings active: yes when the voicebank has it or is still loading (null), whatever
//       the device has; when the voicebank says it has not, the device decides;
//     - otherwise (the recordings inactive, or the device's voice chosen): the device decides;
//  2. a reference with no key: the voicebank is not asked, and the device decides, even where it would have said yes;
//  3. the settings, the voicebank and the device's list are restored afterwards.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const V = RB.voice, G = RB.game.G;
  const real = { settings: G.settings, voicebank: RB.voicebank, japaneseVoices: V.japaneseVoices };
  let asked = [];
  const stage = (mode, active, answer, devices) => {
    G.settings = { voice: { mode } };
    RB.voicebank = {
      active: () => active,
      hasLine: () => { asked.push('line'); return answer; },
      hasRef: (key) => { asked.push('ref:' + key); return answer; },
      stop: () => {},
    };
    V.japaneseVoices = () => Array.from({ length: devices }, (_, i) => ({ voiceURI: 'stand-in-' + i, name: 'stand-in ' + i, lang: 'ja-JP', default: false, local: true }));
    asked = [];
  };
  const display = { who: 'mio', jp: 'x', en: 'x' }, source = { who: 'mio', jp: 'x', en: 'x', sceneId: 'stand.in' };
  const KEY = 'word:x|x';
  // what the route should answer
  const expected = (mode, active, answer, devices) => (mode === 'none' ? false : mode === 'prepared' && active && answer !== false ? true : devices > 0);

  try {
    // 1. the 36 rows
    for (const mode of ['prepared', 'device', 'none']) for (const active of [true, false]) for (const answer of [true, false, null]) for (const devices of [0, 2]) {
      const want = expected(mode, active, answer, devices);
      stage(mode, active, answer, devices);
      const line = V.canSayLine(display, source);
      const lineAsked = asked.slice();
      stage(mode, active, answer, devices);
      const ref = V.canSayRef(KEY);
      t.ok(line === want && ref === want,
        '1 ' + mode + ', recordings ' + (active ? 'active' : 'inactive') + ', voicebank ' + String(answer) + ', ' + devices + ' device voices: ' + (want ? 'may be spoken' : 'not spoken') + ' ' + JSON.stringify({ line, ref, lineAsked, refAsked: asked }));
    }
    // 2. a reference with no key
    for (const answer of [true, null]) for (const devices of [0, 2]) {
      stage('prepared', true, answer, devices);
      const ref = V.canSayRef('');
      t.ok(ref === devices > 0 && !asked.length, '2 a reference with no key (recordings active, the voicebank would answer ' + String(answer) + '), ' + devices + ' device voices: the device decides, the voicebank not asked ' + JSON.stringify({ ref, asked }));
    }
  } finally {
    G.settings = real.settings; RB.voicebank = real.voicebank; V.japaneseVoices = real.japaneseVoices;
  }
  // 3. restored
  t.ok(G.settings === real.settings && RB.voicebank === real.voicebank && V.japaneseVoices === real.japaneseVoices, '3 the settings, the voicebank and the device\'s list are restored');
};
