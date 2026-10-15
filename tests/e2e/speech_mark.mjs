// Spoken-word highlighting (PT-1c: a new learner's report, 2026-10-15): while a dialogue line is spoken, the word
// being said is marked in the Japanese and its English counterpart in the translation; the mark follows the voice's
// own positions, or an estimate when the voice gives none; it clears when the line ends or the next line comes; and
// Settings can turn it off. Headless Chromium has no Japanese voice, so the page gets a stand-in speech engine that
// behaves like a device voice (a local ja-JP voice; start, boundary positions, end) — the game's code is unchanged.
// Usage: node tests/e2e/speech_mark.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };

const FAKE_VOICE = () => {
  const voices = [{ name: 'Test Japanese', lang: 'ja-JP', localService: true, voiceURI: 'test-ja', default: true }];
  const synth = {
    speaking: false, pending: false, paused: false, _cur: null, _t: 0,
    getVoices: () => voices,
    cancel() { this.speaking = false; clearTimeout(this._t); this._cur = null; },
    resume() {}, pause() {}, addEventListener() {}, removeEventListener() {},
    speak(u) {
      this.speaking = true; this._cur = u;
      const text = u.text;
      window.__SPOKEN = text;
      setTimeout(() => { if (this._cur === u && u.onstart) u.onstart({}); }, 20);
      if (window.__VOICE_MODE === 'silent') {
        this._t = setTimeout(() => { if (this._cur === u) { this.speaking = false; if (u.onend) u.onend({}); } }, 4000);
        return;
      }
      let i = 0;
      const step = () => {
        if (this._cur !== u) return;
        if (i >= text.length) { this.speaking = false; if (u.onend) u.onend({}); return; }
        if (u.onboundary) u.onboundary({ charIndex: i, name: 'word' });
        i += 2;
        this._t = setTimeout(step, 110);
      };
      this._t = setTimeout(step, 60);
    },
  };
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
  // (the browser's own utterance accepts only its own voice objects)
  window.SpeechSynthesisUtterance = function (text) { this.text = text; };
};

const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.addInitScript(FAKE_VOICE);
const { p, errors } = await page(b, url, { context: ctx });
await p.waitForFunction(() => window.__RB_READY__);
await p.evaluate(() => {
  RB.game.debugStart('rw.village', 22, 30, { comp: 'mio' });
  const st = RB.game.settings;
  st.lead = 'ja'; st.secondary = 'always'; st.voice.auto = false; st.voice.highlight = true; st.textSpeed = 'instant';
  RB.game.applySettings();
});
await p.waitForTimeout(600);
// a real line of Tsuru's (rw.village_first): the traveller, the mud, the road
const LINE = { who: 'tsuru', jp: 'そこ の {旅|たび} の {人|ひと} 。 {泥|どろ} だらけ だ ね 。 {灯|あかり} の {道|みち} から {来|き}た の かい 。', en: 'You there, traveller. Covered in mud. Did you come by the lantern road?' };
const say = (line) => p.evaluate((l) => { window.__SAID = RB.ui.dialogue.say(Object.assign({ sceneId: 'test.mark' }, l)); }, line);
const marks = () => p.evaluate(() => ({ jp: [...document.querySelectorAll('.dlg .jline .jt.spk')].map((e) => e.textContent.replace(/\s+/g, '')).join(''), en: [...document.querySelectorAll('.dlg .enline .ew.spk')].map((e) => e.textContent).join(' ') }));
async function watch(ms) {
  const seen = [];
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const m = await marks();
    const last = seen[seen.length - 1];
    if (!last || last.jp !== m.jp || last.en !== m.en) seen.push(m);
    await p.waitForTimeout(40);
  }
  return seen;
}

// 1. the voice reports positions: the mark walks the line word by word, and English counterparts light up
await say(LINE);
await p.waitForTimeout(300);
const voiceBtn = await p.evaluate(() => { const b = document.querySelector('.dlg .b-voice'); return !!b && !b.classList.contains('hidden'); });
assert(voiceBtn, 'the Voice button shows (a local Japanese voice is listed)');
await p.click('.dlg .b-voice');
const seen = await watch(5500);
const jpSeq = seen.map((s) => s.jp).filter(Boolean);
const enSeq = seen.map((s) => s.en).filter(Boolean);
console.log('     Japanese marks: ' + [...new Set(jpSeq)].join(' → '));
console.log('     English marks:  ' + [...new Set(enSeq)].join(' → '));
const order = ['旅', '人', '泥', '灯', '道', '来'];
const firstAt = (w) => jpSeq.findIndex((x) => x.indexOf(w) >= 0);
assert(order.every((w) => firstAt(w) >= 0), 'each content word is marked while spoken: ' + order.filter((w) => firstAt(w) < 0).join(' ') + ' missing');
assert(order.every((w, k) => k === 0 || firstAt(w) > firstAt(order[k - 1])), 'in the order spoken');
assert(enSeq.some((x) => /mud/i.test(x)) && enSeq.some((x) => /road/i.test(x)), 'their English counterparts are marked (mud, road; 旅の人 → "traveller" is not one word to one word, so it is left unmarked)');
// a particle's turn never marks English
const pairs = seen.filter((s) => /^(の|だ|ね|から|かい)$/.test(s.jp));
assert(pairs.length && pairs.every((s) => !s.en), 'particles and endings have no English mark: ' + JSON.stringify(pairs.slice(0, 4)));
const after = await marks();
assert(!after.jp && !after.en, 'the marks clear when the voice ends: ' + JSON.stringify(after));

// 2. a voice that gives no positions: the estimate still walks the line
await p.evaluate(() => { window.__VOICE_MODE = 'silent'; });
await p.click('.dlg .b-voice');
const seen2 = await watch(2600);
const est = [...new Set(seen2.map((s) => s.jp).filter(Boolean))];
console.log('     estimated marks: ' + est.join(' → '));
assert(est.length >= 4, 'with no positions from the voice, the estimate marks word after word (' + est.length + ')');
// 3. the next line clears the mark at once
await p.keyboard.press('Enter');
await p.waitForTimeout(150);
await say({ who: 'tsuru', jp: '{手|て} を {貸|か}して おくれ 。', en: 'Lend me a hand.' });
await p.waitForTimeout(150);
const cleared = await marks();
assert(!cleared.jp && !cleared.en, 'a new line starts unmarked');
// 4. English-led: the English is the main line and the Japanese the second; both are marked
await p.evaluate(() => { window.__VOICE_MODE = ''; RB.game.settings.lead = 'en'; RB.game.applySettings(); RB.ui.dialogue.refresh(); });
await p.waitForTimeout(200);
await p.click('.dlg .b-voice');
const seen3 = await watch(1800);
assert(seen3.some((s) => /手/.test(s.jp)) && seen3.some((s) => /hand/i.test(s.en)), 'English-led: 手 and "hand" are marked: ' + JSON.stringify(seen3.slice(0, 6)));
// 5. Settings › Audio: off means no mark
await p.evaluate(() => { RB.game.settings.voice.highlight = false; });
await p.click('.dlg .b-voice');
const seen4 = await watch(1500);
assert(!seen4.some((s) => s.jp || s.en), 'with "Highlight each word as it is spoken" off, nothing is marked');
await p.evaluate(() => { RB.game.settings.voice.highlight = true; });
// the switch is in Settings › Audio
await p.keyboard.press('Enter');
await p.waitForTimeout(300);
const sw = await p.evaluate(async () => {
  RB.ui.settings.open();
  await new Promise((r) => setTimeout(r, 300));
  const g = [...document.querySelectorAll('.folio-settings [data-grp]')].find((x) => x.dataset.grp === 'audio');
  if (g) { g.click(); await new Promise((r) => setTimeout(r, 200)); }
  const i = document.querySelector('.folio-settings [data-voicehl]');
  return i ? { checked: i.checked, label: i.closest('label').textContent.replace(/\s+/g, ' ').trim() } : null;
});
assert(sw && sw.checked && /Highlight each word as it is spoken/.test(sw.label), 'Settings › Audio has the switch, on by default: ' + JSON.stringify(sw));
assert(!errors.length, 'no page errors: ' + errors.join(' | '));
await ctx.close();
await b.close();
srv.close();
console.log(fail ? fail + ' failed' : 'all speech-mark checks passed');
process.exit(fail ? 1 : 0);
