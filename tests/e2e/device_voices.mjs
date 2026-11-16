// The device's Japanese voices, decided by the test before the game starts (CC-617, CL-859, CC-618; Agnes 6920360412).
// A browser lists whatever voices its host has, so a check that depends on them passes on one machine and fails on
// another. voiceContext() opens a browser context (with the options tests/e2e/lib.mjs's page() gives its own) whose
// pages see only the fixture's voices, installed by an init script before any of the page's own scripts run, and again
// on every reload:
//  - 'absent': no voice at all;
//  - 'present': four voices from the start: two local Japanese ones (one with a long name), one online Japanese one
//    (localService false) and one local English one, so the game's own filter (src/audio/50_voice.js 39-40) is what
//    leaves two;
//  - 'present-late': the same four, but the first ask returns none and they are listed lateMs later, with one
//    voiceschanged event, as one Windows host did (about 100 ms; CL-859): a model of that host, not a guarantee of
//    any browser's timing.
// Speaking stays inside the page: speechSynthesis.speak and cancel, and SpeechSynthesisUtterance, are replaced by
// stand-ins, so nothing a test does reaches the host's speech engine; what was spoken is recorded. The page's own start
// and end handlers are called each in its own task, uncaught, and recorded with their returns (see speak below).
// window.__voiceFixture says what was installed and what happened: applied (false where the browser has no speech
// synthesis to replace: a lane must then fail, not pass), the kind, each ask's answer, whether the late list is ready
// (set after its voiceschanged has been dispatched, so its listeners have run), the host engine's own voiceschanged
// events (trusted ones), and every spoken text.
// Usage: const ctx = await voiceContext(b, 'absent', { viewport: { width: 1280, height: 800 } });
//        const { p, errors } = await page(b, url, { context: ctx });
// (Not tests/e2e/voice_fixture.mjs, which builds a small recorded-voice site for other tests.)
import { engine } from './lib.mjs';

export const FIXTURE_VOICES = [
  { voiceURI: 'fixture-ja-a', name: 'Fixture Japanese A', lang: 'ja-JP', localService: true, default: false },
  { voiceURI: 'fixture-ja-b', name: 'Fixture Japanese B, with the long name some systems give a voice', lang: 'ja-JP', localService: true, default: false },
  { voiceURI: 'fixture-ja-online', name: 'Fixture Japanese Online', lang: 'ja-JP', localService: false, default: false },
  { voiceURI: 'fixture-en', name: 'Fixture English', lang: 'en-US', localService: true, default: true },
];

function install(cfg) {
  const G = window;
  const fx = (G.__voiceFixture = { kind: cfg.kind, applied: false, asks: 0, answers: [], listed: cfg.kind !== 'present-late', ready: cfg.kind !== 'present-late', events: 0, hostEvents: 0, spoken: [], cancels: 0, callbacks: [], speechDone: 0 });
  const s = G.speechSynthesis;
  if (!s || typeof s.getVoices !== 'function' || typeof G.SpeechSynthesisUtterance !== 'function') return;
  const hostVoices = s.getVoices.bind(s);
  const voices = (cfg.kind === 'absent' ? [] : cfg.voices).map((v) => Object.freeze(Object.assign({}, v)));
  // the host engine's own list still arrives (asking it starts that); the game reads only the fixture's
  s.addEventListener('voiceschanged', (e) => { if (e.isTrusted) fx.hostEvents++; });
  fx.askHost = () => { try { return hostVoices().length; } catch (e) { return -1; } };
  Object.defineProperty(s, 'getVoices', {
    configurable: true,
    value: () => {
      fx.asks++;
      if (!fx.listed && fx.asks === 1) {
        setTimeout(() => { fx.listed = true; s.dispatchEvent(new Event('voiceschanged')); fx.events++; fx.ready = true; }, cfg.lateMs);
      }
      const out = fx.listed ? voices.slice() : [];
      if (fx.answers.length < 12) fx.answers.push(out.length);
      return out;
    },
  });
  class Utterance extends EventTarget {
    constructor(text) {
      super();
      this.text = text == null ? '' : String(text);
      this.lang = ''; this.voice = null; this.rate = 1; this.pitch = 1; this.volume = 1;
      this.onstart = this.onend = this.onerror = this.onboundary = this.onpause = this.onresume = this.onmark = null;
    }
  }
  Object.defineProperty(G, 'SpeechSynthesisUtterance', { configurable: true, writable: true, value: Utterance });
  Object.defineProperty(s, 'speak', {
    configurable: true,
    value: (u) => {
      fx.spoken.push(u ? u.text : null);
      // the page's own start and end handlers, each in its own task as a real engine fires its events, and nothing
      // catches them: an error in one is the page's own uncaught error (Playwright's pageerror, which tests/e2e/lib.mjs's
      // page() collects) and doesn't stop the other. callbacks records each call and then its return, so a handler that
      // threw has no 'returned' entry; speechDone is counted in a task after both (Agnes 6921972297, 6922668177; CL-862,
      // CL-863)
      const fire = (name) => { const f = u && u[name]; if (typeof f !== 'function') return; fx.callbacks.push(name); f.call(u, { utterance: u }); fx.callbacks.push(name + ' returned'); };
      setTimeout(() => fire('onstart'), 0);
      setTimeout(() => fire('onend'), 0);
      setTimeout(() => { fx.speechDone++; }, 0);
    },
  });
  Object.defineProperty(s, 'cancel', { configurable: true, value: () => { fx.cancels++; } });
  fx.applied = true;
}

export async function voiceContext(browser, kind, opts = {}) {
  if (!['absent', 'present', 'present-late'].includes(kind)) throw new Error('voice fixture: unknown kind ' + kind);
  const ctx = await browser.newContext(Object.assign({ viewport: opts.viewport || { width: 1280, height: 800 }, hasTouch: !!opts.touch, deviceScaleFactor: opts.dpr || 1 }, engine === 'firefox' ? {} : { isMobile: !!opts.mobile }));
  await ctx.addInitScript(install, { kind, voices: FIXTURE_VOICES, lateMs: opts.lateMs == null ? 100 : opts.lateMs });
  return ctx;
}

// what the page has now: the fixture's record, and what the game reports of it (asking the game counts as an ask)
export const voiceState = (p) => p.evaluate(() => {
  const fx = window.__voiceFixture || null;
  const st = window.RB && RB.voice && RB.voice.status ? RB.voice.status() : null;
  const vb = window.RB && RB.voicebank;
  return {
    installed: !!fx, applied: !!(fx && fx.applied), kind: fx && fx.kind, asks: fx ? fx.asks : 0, answers: fx ? fx.answers.slice() : [],
    ready: !!(fx && fx.ready), events: fx ? fx.events : 0, hostEvents: fx ? fx.hostEvents : 0, spoken: fx ? fx.spoken.slice() : [],
    localJa: st ? st.localJaCount : -1, networkJa: st ? st.networkJaCount : -1,
    names: RB.voice && RB.voice.japaneseVoices ? RB.voice.japaneseVoices().map((v) => v.name) : [],
    vbConfigured: !!(vb && vb.configured && vb.configured()), vbActive: !!(vb && vb.active && vb.active()),
  };
});

// 'present-late': wait until the late list is out and its voiceschanged has been handled (no fixed sleep)
export const voicesReady = (p, timeout = 5000) => p.waitForFunction(() => !!(window.__voiceFixture && window.__voiceFixture.ready && window.__voiceFixture.events >= 1), null, { timeout });

// ask the host engine for its own list (which starts it listing on hosts that list late) and give its voiceschanged
// up to waitMs to arrive; returns the host's count (never the names) and its events so far. On a host with no voices
// no event may come; the caller then checks the game still sees only the fixture's voices.
export async function hostListing(p, waitMs = 1500) {
  await p.evaluate(() => window.__voiceFixture && window.__voiceFixture.askHost && window.__voiceFixture.askHost());
  await p.waitForFunction(() => !!(window.__voiceFixture && window.__voiceFixture.hostEvents > 0), null, { timeout: waitMs }).catch(() => null);
  return p.evaluate(() => ({ hostCount: window.__voiceFixture && window.__voiceFixture.askHost ? window.__voiceFixture.askHost() : -1, hostEvents: window.__voiceFixture ? window.__voiceFixture.hostEvents : 0 }));
}
