// MT-1, the music performance (Original / Ensemble; docs/MUSIC_PERFORMANCE.md), in the built game (Chromium).
// The checks are MT-1's acceptance register (MT-Txx). The two pilots play their real recordings from
// assets/music/ensemble/ through the catalog the build embedded; failures (404, wrong type, redirect, a corrupt or
// oversized body, a timeout, a late one-shot) are made with request routing or a fixture catalog, never by pretending a
// recording exists. Every assertion reads the director's own state (which cue owns which sources, the gains, the
// clock), the requests the page made, or audio rendered through the game's own graph.
// Usage: node tools/build.mjs && node tests/e2e/music_performance.mjs [filter]
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';
import { PAGE_LIB } from '../../tools/music/ensemble/page_lib.mjs';

const only = process.argv[2];
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const results = [];
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  const t0 = Date.now();
  try { await fn(); pass++; results.push(['PASS', name]); console.log('PASS', name, `(${((Date.now() - t0) / 1000).toFixed(0)} s)`); }
  catch (e) { fail++; results.push(['FAIL', name]); console.log('FAIL', name + ':', e.message.split('\n')[0]); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const MUSIC = /\/assets\/music\/ensemble\//;

// a page with the requests to the music directory counted, and the director's state at hand
async function open(o = {}) {
  const context = await b.newContext({ viewport: o.viewport || { width: 1280, height: 800 } });
  if (o.rate) await context.addInitScript((r) => { const A = window.AudioContext; window.AudioContext = function (opts) { return new A(Object.assign({}, opts || {}, { sampleRate: r })); }; window.AudioContext.prototype = A.prototype; }, o.rate);
  if (o.init) await context.addInitScript(o.init);
  const music = [];
  if (o.route) await context.route(MUSIC, o.route);
  const pg = await page(b, o.url || url, { context });
  pg.p.on('request', (r) => { if (MUSIC.test(r.url())) music.push(r.url()); });
  await pg.p.evaluate(() => {
    window.__cue = () => {
      const _ = RB.audio._, P = _.perf, c = P.cue, p = _.curPlayer && _.curPlayer();
      const ctx = _.st.ctx;
      return {
        song: RB.audio.currentSong(), now: ctx && ctx.currentTime, rate: ctx && ctx.sampleRate, status: RB.audio.performanceStatus(), pref: RB.audio.performance(),
        cue: c && { id: c.id, state: c.state, active: c.active, want: c.want, segs: c.segs ? c.segs.length : 0, horizon: c.horizon, gain: c.gain && c.gain.gain.value, codec: c.fmt && c.fmt.codec, owner: !!(p && c.player === p),
          segments: (c.segs || []).map((r) => ({ when: r.when, until: r.until, offset: r.offset, role: r.role, fadeIn: r.fadeIn })) },
        player: p && { id: p.song.id, anchor0: p.anchor0, cycle: p.cycle, idx: p.idx, out: p.out.gain.value, stopping: !!p.stopping },
        revGate: _.st.g && _.st.g.revGate.gain.value, mem: RB.audio.ensembleMemory(), err: _.st.lastError, log: P.log.slice(-8).map((x) => x.k + (x.why ? ':' + x.why : '')),
        ringing: P.ringing && { id: P.ringing.id, state: P.ringing.state, segs: P.ringing.segs.length, gain: P.ringing.gain && P.ringing.gain.gain.value },
      };
    };
  });
  return Object.assign(pg, { music, context });
}
const cue = (p) => p.evaluate(() => window.__cue());
// (MT-2: every song has a recording; a song without one is made by taking it out of the page's catalog, as a build
// whose manifest left it out would have it)
const noRecording = (p, id) => p.evaluate((id) => { const c = RB.audio.ensembleCatalog; if (c && c.songs && c.songs[id]) delete c.songs[id]; return !RB.audio.ensembleSongs().includes(id); }, id);
const until = (p, fn, arg, ms = 20000) => p.waitForFunction(fn, arg, { timeout: ms, polling: 100 });
const ensembleOn = (p, id, ms) => until(p, (id) => { const c = window.__cue(); return c.cue && c.cue.id === id && c.cue.active && c.cue.state === 'sounding'; }, id, ms);
// the game's settings, as the player's choice (applied and saved by the game's own path)
const choose = (p, v) => p.evaluate((v) => { RB.game.settings.musicPerformance = v; return RB.game.saveSettings(); }, v);

// ---- settings --------------------------------------------------------------------------------------------------
await test('MT-T01/T02 settings: Original by default and for an older record; an unknown value is Original, never a path', async () => {
  const { p, errors } = await open();
  const r = await p.evaluate(async () => {
    const def = RB.game.defaultSettings().musicPerformance;
    const now = RB.game.settings.musicPerformance;
    // an older record without the field, and a forged one
    const older = Object.assign({}, RB.game.settings); delete older.musicPerformance; older.vol = Object.assign({}, older.vol, { music: 0.55 });
    await RB.save.saveSettings(older);
    return { def, now };
  });
  assert(r.def === 'original' && r.now === 'original', 'default Original: ' + JSON.stringify(r));
  await p.reload(); await p.waitForFunction(() => window.__RB_READY__ === true);
  const r2 = await p.evaluate(() => ({ perf: RB.game.settings.musicPerformance, music: RB.game.settings.vol.music, audio: RB.audio.performance() }));
  assert(r2.perf === 'original' && r2.music === 0.55 && r2.audio === 'original', 'an older record: Original, its volume kept: ' + JSON.stringify(r2));
  await p.evaluate(async () => { const s = Object.assign({}, RB.game.settings, { musicPerformance: './assets/music/ensemble/../../index.html' }); await RB.save.saveSettings(s); });
  await p.reload(); await p.waitForFunction(() => window.__RB_READY__ === true);
  const r3 = await p.evaluate(() => ({ perf: RB.game.settings.musicPerformance, audio: RB.audio.performance() }));
  assert(r3.perf === 'original' && r3.audio === 'original', 'a forged value is Original: ' + JSON.stringify(r3));
  assert(!errors.length, 'page errors: ' + errors.join(' | '));
  await p.context().close();
});

await test('MT-T04/T06/T45 the control: real clicks and keys, exclusive, kept on reload, a truthful status line, no overflow at 360 px', async () => {
  const { p, errors } = await open({ viewport: { width: 360, height: 740 } });
  await p.evaluate(() => RB.audio.init());
  await p.evaluate(() => RB.ui.settings.open());
  await p.waitForTimeout(300);
  // the Audio group (the index is its own page on a phone)
  await p.evaluate(() => { const g = document.querySelector('[data-grp="audio"]'); if (g) g.click(); });
  await p.waitForSelector('input[data-set="musicPerformance"]', { timeout: 5000 });
  const f = await p.evaluate(() => {
    const fs_ = document.querySelector('input[data-set="musicPerformance"]').closest('fieldset');
    const st = document.querySelector('[data-mp-status]');
    return { legend: fs_.querySelector('legend') && fs_.querySelector('legend').textContent, options: [...fs_.querySelectorAll('label.opt')].map((l) => l.textContent.trim()), checked: fs_.querySelector('input:checked').value, overflow: fs_.scrollWidth > fs_.clientWidth + 1, status: st && st.textContent, live: st && st.getAttribute('aria-live'), page: document.documentElement.scrollWidth <= innerWidth };
  });
  assert(/Music performance/.test(f.legend) && f.options.join('|') === 'Original|Ensemble' && f.checked === 'original', 'two options, Original chosen: ' + JSON.stringify(f));
  assert(!f.overflow && f.page, 'no overflow at 360 px: ' + JSON.stringify(f));
  assert(f.live === 'polite' && /Original/.test(f.status) && !/Remaster|Low quality|Recommended/i.test(f.status), 'a polite status line: ' + JSON.stringify(f));
  // keyboard: focus Original, arrow to Ensemble (a native radio group)
  await p.focus('input[data-set="musicPerformance"][value="original"]');
  await p.keyboard.press('ArrowRight');
  await p.waitForFunction(() => RB.game.settings.musicPerformance === 'ensemble' && RB.audio.performance() === 'ensemble', null, { timeout: 4000 });
  const k = await p.evaluate(() => ({ focus: document.activeElement && document.activeElement.getAttribute('data-set') + ':' + document.activeElement.value, n: document.querySelectorAll('input[data-set="musicPerformance"]:checked').length }));
  assert(k.focus === 'musicPerformance:ensemble' && k.n === 1, 'the key chose Ensemble and focus stayed on it: ' + JSON.stringify(k));
  // a real click back and forth
  await p.click('label.opt:has(input[data-set="musicPerformance"][value="original"])');
  await p.waitForFunction(() => RB.game.settings.musicPerformance === 'original');
  await p.click('label.opt:has(input[data-set="musicPerformance"][value="ensemble"])');
  await p.waitForFunction(() => RB.game.settings.musicPerformance === 'ensemble');
  const line = await p.evaluate(() => document.querySelector('[data-mp-status]').textContent);
  const [nr, ns] = await p.evaluate(() => [RB.audio.ensembleSongs().length, Object.keys(RB.audio._.songDefs).length]);
  const reach = nr >= ns ? /Ensemble is available for every track\./ : new RegExp((nr === 2 ? 'two tracks' : nr + ' tracks') + ' so far');
  assert(/Ensemble selected|No music|Ensemble playing|Ensemble loads/.test(line) && reach.test(line), 'the line says what is chosen and how far Ensemble reaches (' + nr + ' of ' + ns + '): ' + line);
  // (the choice is stored before the page is reloaded: the write is asynchronous)
  await p.waitForFunction(async () => { const s = await RB.save.loadSettings(); return !!s && s.musicPerformance === 'ensemble'; }, null, { timeout: 5000, polling: 100 });
  await p.reload(); await p.waitForFunction(() => window.__RB_READY__ === true);
  const kept = await p.evaluate(() => ({ s: RB.game.settings.musicPerformance, a: RB.audio.performance() }));
  assert(kept.s === 'ensemble' && kept.a === 'ensemble', 'kept on reload: ' + JSON.stringify(kept));
  assert(!errors.length, 'page errors: ' + errors.join(' | '));
  await p.context().close();
});

await test('MT-T03 storage refused: the choice applies for the session, nothing throws', async () => {
  // the browser refuses every write once the page is up (as a full or blocked store would)
  const { p, errors } = await open();
  await p.evaluate(() => {
    const no = function () { throw new DOMException('refused (test)', 'QuotaExceededError'); };
    IDBObjectStore.prototype.put = no; IDBObjectStore.prototype.add = no;
    try { Storage.prototype.setItem = no; } catch (e) { /* ignore */ }
  });
  await p.evaluate(() => RB.ui.settings.open());
  await p.waitForTimeout(300);
  await p.evaluate(() => { const g = document.querySelector('[data-grp="audio"]'); if (g) g.click(); });
  await p.waitForSelector('input[data-set="musicPerformance"]');
  await p.click('label.opt:has(input[data-set="musicPerformance"][value="ensemble"])');
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => ({ s: RB.game.settings.musicPerformance, a: RB.audio.performance() }));
  assert(r.s === 'ensemble' && r.a === 'ensemble', 'applied for the session: ' + JSON.stringify(r));
  assert(!errors.some((e) => /pageerror/.test(e)), 'no uncaught error: ' + errors.join(' | '));
  await p.context().close();
});

// ---- what is fetched, and when ------------------------------------------------------------------------------------
await test('MT-T07/T12 Original fetches nothing; Ensemble on a song without a recording fetches nothing either', async () => {
  const { p, music, errors } = await open();
  await p.evaluate(async () => { await RB.audio.init(); RB.audio.playSong('snowbell', { fade: 0 }); });
  await p.waitForTimeout(2500);
  let c = await cue(p);
  assert(c.status.state === 'original' && c.player && c.player.id === 'snowbell' && music.length === 0, 'Original, no request: ' + JSON.stringify({ s: c.status, n: music.length }));
  await choose(p, 'ensemble');
  assert(await noRecording(p, 'road'), 'road taken out of the catalog');
  await p.evaluate(() => RB.audio.playSong('road', { fade: 0 }));
  await p.waitForTimeout(1500);
  c = await cue(p);
  const before = music.length;
  assert(c.status.state === 'unsupported' && c.player.id === 'road' && c.status.actual === 'original', 'road has no recording: Original, Ensemble remembered: ' + JSON.stringify(c.status));
  assert(!music.some((u) => /road/.test(u)), 'no request for a recording that does not exist');
  assert(!errors.length, 'page errors: ' + errors.join(' | '));
  await p.context().close();
  void before;
});

await test('MT-T08/T09 music at zero or muted: nothing fetched while it is so; turning it back up loads and hands over', async () => {
  const { p, music } = await open();
  await p.evaluate(async () => { RB.game.settings.vol.music = 0; RB.game.settings.musicPerformance = 'ensemble'; RB.game.applySettings(); await RB.audio.init(); RB.audio.playSong('snowbell', { fade: 0 }); });
  await p.waitForTimeout(2500);
  let c = await cue(p);
  assert(music.length === 0 && c.status.state === 'off', 'music at zero: no request: ' + JSON.stringify({ n: music.length, s: c.status }));
  await p.evaluate(() => { RB.game.settings.vol.music = 0; RB.game.settings.muted = true; RB.game.applySettings(); RB.game.settings.vol.music = 0.7; RB.game.applySettings(); });
  await p.waitForTimeout(1500);
  c = await cue(p);
  assert(music.length === 0 && c.status.state === 'off', 'muted: still no request: ' + JSON.stringify({ n: music.length, s: c.status }));
  await p.evaluate(() => { RB.game.settings.muted = false; RB.game.applySettings(); });
  await ensembleOn(p, 'snowbell', 20000);
  c = await cue(p);
  assert(music.length >= 2 && c.cue.active, 'unmuted: the recording loads and sounds: ' + JSON.stringify({ n: music.length, cue: c.cue && c.cue.state }));
  await p.context().close();
});

await test('MT-T10 the standalone file: Ensemble remembered, Original plays, no request at all', async () => {
  const fileUrl = 'file://' + path.join(root, process.env.RB_PAGE || 'index.html');
  const { p, requests, music, errors } = await open({ url: fileUrl });
  await p.evaluate(async () => { RB.game.settings.musicPerformance = 'ensemble'; RB.game.applySettings(); await RB.audio.init(); RB.audio.playSong('snowbell', { fade: 0 }); });
  await p.waitForTimeout(2500);
  const c = await cue(p);
  assert(c.status.state === 'standalone' && c.status.actual === 'original' && c.player.id === 'snowbell', 'standalone: Original: ' + JSON.stringify(c.status));
  assert(music.length === 0 && requests.length === 0, 'no request: ' + JSON.stringify({ music, requests }));
  assert(!errors.length, 'page errors: ' + errors.join(' | '));
  await p.context().close();
});

// ---- the handover, both ways, on the clock ---------------------------------------------------------------------
await test('MT-T11/T14/T15/T35 cold cache: Original at once, the recording takes over on the clock, and back: same player, same phrase', async () => {
  const { p, music, errors } = await open();
  await choose(p, 'ensemble');
  const t0 = await p.evaluate(async () => { await RB.audio.init(); RB.audio.playSong('snowbell', { fade: 0 }); return { song: RB.audio.currentSong(), st: RB.audio.performanceStatus().state }; });
  assert(t0.song === 'snowbell' && ['loading', 'original-only'].includes(t0.st), 'Original starts at once while the recording loads: ' + JSON.stringify(t0));
  const a = await cue(p);
  await ensembleOn(p, 'snowbell', 20000);
  const c = await cue(p);
  // the Original player is the one that started, still going (warm), unheard; the room's return closed
  assert(c.player.anchor0 === a.player.anchor0 && c.cue.owner && c.player.out < 0.01 && c.revGate < 0.01 && c.cue.gain > 0.99, 'Ensemble sounds over the warm Original: ' + JSON.stringify({ p: c.player, rg: c.revGate, g: c.cue.gain }));
  // each segment reads the file where the score clock is at its start time
  const chk = await p.evaluate(() => {
    const _ = RB.audio._, c = _.perf.cue, p = c.player, f = c.fmt;
    return c.segs.map((r) => {
      const k = _.clockAt(p, r.when);
      const want = r.role === 'first' ? f.first.start / f.first.rate + k.e : f.loop.start / f.loop.rate + (k.pos - p.song.loopStart);
      return { role: r.role, fadeIn: r.fadeIn, errMs: (r.offset - want) * 1000 };
    });
  });
  assert(chk.length >= 1 && chk.every((x) => Math.abs(x.errMs) < 0.01), 'every segment at the clock\'s position (< 0.01 ms): ' + JSON.stringify(chk));
  const n = music.length;
  // back to Original: the same player comes up, mid-phrase; the recording's sources go after the fade
  const idx0 = c.player.idx;
  await choose(p, 'original');
  await until(p, () => { const c = window.__cue(); return c.cue && !c.cue.active && c.cue.segs === 0; }, null, 5000);
  const d = await cue(p);
  assert(d.player.anchor0 === a.player.anchor0 && d.player.out > 0.99 && d.revGate > 0.99 && d.player.idx >= idx0, 'Original revealed, not restarted: ' + JSON.stringify({ p: d.player, rg: d.revGate }));
  // and over again, from the cache
  await choose(p, 'ensemble');
  await ensembleOn(p, 'snowbell', 5000);
  assert(music.length === n, 'the second handover reads the decoded cache: no new request (' + (music.length - n) + ')');
  assert(!errors.length && !(await cue(p)).err, 'no page or engine error: ' + errors.join(' | '));
  await p.context().close();
});

await test('MT-T13/T21/T25/T38 cue changes: same song twice, a change while loading, re-entry from the cache, memory bounded', async () => {
  const { p, music } = await open();
  await choose(p, 'ensemble');
  assert(await noRecording(p, 'road'), 'road taken out of the catalog');
  await p.evaluate(async () => { await RB.audio.init(); RB.audio.playSong('snowbell', { fade: 0 }); });
  await p.waitForTimeout(30);
  await p.evaluate(() => RB.audio.playSong('snowbell', { fade: 0 }));
  await ensembleOn(p, 'snowbell', 20000);
  const per = {}; for (const u of music) per[u] = (per[u] || 0) + 1;
  assert(Object.values(per).every((k) => k === 1) && Object.keys(per).length === 2, 'the same song twice: one request per file: ' + JSON.stringify(per));
  // a change while the next song loads: the old download never takes over the new cue
  await p.evaluate(() => RB.audio.playSong('battle_keepers', { fade: 0 }));
  await p.waitForTimeout(40);
  await p.evaluate(() => RB.audio.playSong('road', { fade: 0 }));
  await p.waitForTimeout(4000);
  let c = await cue(p);
  assert(c.player.id === 'road' && c.cue.id === 'road' && !c.cue.active && c.status.state === 'unsupported', 'the new cue keeps its Original: ' + JSON.stringify(c.cue));
  // re-entry from the cache, and a stress of switches between the two pilots and a song without one
  const n0 = music.length;
  for (let i = 0; i < 4; i++) {
    for (const id of ['snowbell', 'battle_keepers', 'road']) {
      await p.evaluate((id) => RB.audio.playSong(id, { fade: 300 }), id);
      if (id !== 'road') await ensembleOn(p, id, 20000);
      else await p.waitForTimeout(300);
    }
  }
  c = await cue(p);
  const kp = music.filter((u) => /battle_keepers/.test(u)).length;
  assert(music.length - n0 <= 2 && kp <= 2, 'the decoded files are reused: ' + (music.length - n0) + ' new requests');
  assert(c.mem.decodedBytes <= 128 * 1024 * 1024 && c.mem.inflight === 0, 'memory within the 128 MiB budget: ' + JSON.stringify(c.mem));
  await p.evaluate(() => RB.audio.playSong('snowbell', { fade: 0 }));
  await ensembleOn(p, 'snowbell', 5000);
  c = await cue(p);
  assert(c.cue.segs <= 3, 'a cue holds at most its current and next segments: ' + c.cue.segs);
  await p.context().close();
});

await test('MT-T20/T22/T24 rapid changes: the latest wins, no gain jumps or orphans; a decode after a change of mind does not play; a stop mid-fade stays stopped', async () => {
  const { p } = await open();
  await choose(p, 'ensemble');
  await p.evaluate(async () => { await RB.audio.init(); RB.audio.playSong('battle_keepers', { fade: 0 }); });
  await p.waitForTimeout(60);
  await choose(p, 'original'); // (the decode lands after this)
  await p.waitForTimeout(6000);
  let c = await cue(p);
  assert(!c.cue.active && c.cue.segs === 0 && c.player.out > 0.99, 'a late decode does not start the recording: ' + JSON.stringify(c.cue));
  await choose(p, 'ensemble');
  await ensembleOn(p, 'battle_keepers', 15000);
  // seven changes within 300 ms, ending on Ensemble, then on Original
  for (const v of ['original', 'ensemble', 'original', 'ensemble', 'original', 'ensemble', 'ensemble']) { await p.evaluate((v) => RB.audio.setPerformance(v), v); await p.waitForTimeout(40); }
  await p.waitForTimeout(900);
  c = await cue(p);
  assert(c.cue.active && c.cue.want === 'ensemble' && c.cue.segs <= 3 && c.player.out < 0.01 && Math.abs(c.cue.gain - 1) < 1e-3, 'Ensemble won, gains settled: ' + JSON.stringify(c.cue) + ' out ' + c.player.out);
  for (const v of ['ensemble', 'original', 'ensemble', 'original']) { await p.evaluate((v) => RB.audio.setPerformance(v), v); await p.waitForTimeout(30); }
  await p.waitForTimeout(900);
  c = await cue(p);
  assert(!c.cue.active && c.cue.segs === 0 && c.player.out > 0.99 && c.revGate > 0.99, 'Original won, the recording\'s sources gone: ' + JSON.stringify(c.cue));
  // a stop in the middle of a handover
  await p.evaluate(() => RB.audio.setPerformance('ensemble'));
  await p.waitForTimeout(50);
  await p.evaluate(() => RB.audio.stopSong({ fade: 0 }));
  await p.waitForTimeout(1500);
  c = await cue(p);
  assert(!c.song && !c.cue && !c.player, 'stopped, and nothing came back: ' + JSON.stringify(c));
  await p.context().close();
});

await test('MT-T23 a one-shot that ends while its recording loads stays ended (one completion, nothing replayed) — fixture', async () => {
  // a fixture catalog for 'victory' (a 6 s one-shot, fingerprinted as the game does) naming a real file, whose
  // response is held until the cue has ended
  let release = null;
  const held = new Promise((r) => (release = r));
  const { p } = await open();
  const first = await p.evaluate(async () => {
    const real = RB.audio.ensembleCatalog.songs.snowbell.formats[0].first, _ = RB.audio._;
    const fp = 'sha256:' + Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(_.canonicalScore(_.getSong('victory')))))).map((x) => x.toString(16).padStart(2, '0')).join('');
    RB.audio.ensembleCatalog = { version: 1, songs: { victory: { releaseStatus: 'ready', fingerprint: fp, durationSec: 6, loop: false, loopStartSec: 0, trim: 1, formats: [{ codec: 'opus', type: 'audio/ogg; codecs="opus"', first: real, loop: null }] } } };
    window.__ends = 0;
    RB.bus.on('audio:songend', (e) => { if (e.id === 'victory') window.__ends++; });
    return real.url.slice(1); // ('./assets/…' → '/assets/…')
  });
  let asked = 0;
  await p.route((u) => u.pathname.endsWith(first), async (route) => { asked++; await held; try { await route.continue(); } catch (e) { /* the request was given up */ } });
  await p.evaluate(async () => { RB.game.settings.musicPerformance = 'ensemble'; RB.game.applySettings(); await RB.audio.init(); RB.audio.playSong('victory', { fade: 0 }); });
  await p.waitForTimeout(7500);
  release();
  await p.waitForTimeout(2500);
  const c = await cue(p);
  const ends = await p.evaluate(() => window.__ends);
  assert(asked >= 1, 'the fixture\'s file was asked for while the one-shot played');
  assert(ends === 1 && !c.song && !c.cue && !c.player, 'one completion, nothing replayed: ' + JSON.stringify({ ends, song: c.song, cue: c.cue, player: c.player }));
  await p.context().close();
});

// ---- failures --------------------------------------------------------------------------------------------------
async function failing(name, route, expect) {
  const { p, music } = await open({ route });
  await choose(p, 'ensemble');
  await p.evaluate(async () => { await RB.audio.init(); RB.audio.playSong('battle_keepers', { fade: 0 }); });
  await until(p, () => { const c = window.__cue(); return c.cue && (c.cue.state === 'sounding' || c.cue.state === 'failed'); }, null, expect.ms || 25000);
  const c = await cue(p);
  await p.context().close();
  return { c, music };
}
await test('MT-T26/T27/T28/T30/T44 a missing, wrong-typed, oversized, redirected or altered Opus file: the MP3 alternative plays', async () => {
  const cases = {
    missing: (r) => (/\.opus$/.test(r.request().url()) ? r.fulfill({ status: 404, body: 'no' }) : r.continue()),
    html: (r) => (/\.opus$/.test(r.request().url()) ? r.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>x</title>' }) : r.continue()),
    oversized: (r) => (/\.opus$/.test(r.request().url()) ? r.fulfill({ status: 200, contentType: 'audio/ogg', body: Buffer.alloc(26 * 1024 * 1024, 1) }) : r.continue()),
    redirect: (r) => (/\.opus$/.test(r.request().url()) ? r.fulfill({ status: 302, headers: { location: '/index.html' } }) : r.continue()),
    altered: async (r) => { if (!/\.opus$/.test(r.request().url())) return r.continue(); const resp = await r.fetch(); const body = Buffer.from(await resp.body()); body[body.length >> 1] ^= 0xff; return r.fulfill({ status: 200, contentType: 'audio/ogg', body }); },
  };
  const out = {};
  for (const [k, route] of Object.entries(cases)) {
    const { c } = await failing(k, route, {});
    out[k] = c.cue && c.cue.state + ':' + c.cue.codec;
    assert(c.cue && c.cue.state === 'sounding' && c.cue.codec === 'mp3' && c.player.id === 'battle_keepers', k + ': MP3 plays: ' + JSON.stringify(c.cue) + ' ' + c.log.join(','));
  }
  console.log('   ', JSON.stringify(out));
});

await test('MT-T26 every file missing: Original stays, the retry is bounded, the line says the recording is unavailable', async () => {
  const { c, music } = await failing('all', (r) => r.fulfill({ status: 404, body: 'no' }), {});
  assert(c.cue.state === 'failed' && c.status.state === 'failed' && c.status.actual === 'original' && c.player.out > 0.99, 'failed, Original playing: ' + JSON.stringify(c.status));
  assert(music.length <= 8, 'bounded: two tries of two formats of two files at most: ' + music.length);
});

await test('MT-T29 a recording of a different score is refused before anything is downloaded', async () => {
  const { p, music } = await open();
  await p.evaluate(() => { const s = RB.audio.ensembleCatalog.songs.snowbell; s.fingerprint = 'sha256:' + '0'.repeat(64); });
  await choose(p, 'ensemble');
  await p.evaluate(async () => { await RB.audio.init(); RB.audio.playSong('snowbell', { fade: 0 }); });
  await p.waitForTimeout(2500);
  const c = await cue(p);
  assert(music.length === 0 && c.cue.state === 'failed' && c.status.actual === 'original', 'stale: refused, no request: ' + JSON.stringify({ n: music.length, s: c.status, log: c.log }));
  await p.context().close();
});

await test('MT-T26 a file that never arrives: given up after its timeout, the other format plays', async () => {
  const { c } = await failing('timeout', (r) => (/\.opus$/.test(r.request().url()) ? new Promise(() => {}) : r.continue()), { ms: 40000 });
  assert(c.cue.state === 'sounding' && c.cue.codec === 'mp3', 'after the 15 s timeout, MP3: ' + JSON.stringify(c.cue) + ' ' + c.log.join(','));
});

// ---- the clock and the context ---------------------------------------------------------------------------------
await test('MT-T31/T33 a suspended context pauses the clock (no wall-time jump); at 44.1 kHz the files decode to the same seconds', async () => {
  const { p } = await open({ rate: 44100 });
  await choose(p, 'ensemble');
  await p.evaluate(async () => { await RB.audio.init(); RB.audio.playSong('battle_keepers', { fade: 0 }); });
  await ensembleOn(p, 'battle_keepers', 20000);
  const a = await p.evaluate(() => ({ rate: RB.audio._.st.ctx.sampleRate, bufs: [RB.audio._.perf.cue.bufs.first.sampleRate, RB.audio._.perf.cue.bufs.loop.duration], f: RB.audio._.perf.cue.fmt.loop }));
  assert(a.rate === 44100 && a.bufs[0] === 44100 && Math.abs(a.bufs[1] - a.f.frames / a.f.rate) < 0.001, '44.1 kHz context, files resampled to it, same duration: ' + JSON.stringify(a));
  const t1 = await p.evaluate(async () => { await RB.audio._.st.ctx.suspend(); return RB.audio.transport().elapsed; });
  await p.waitForTimeout(1500);
  const t2 = await p.evaluate(async () => { const e = RB.audio.transport().elapsed; await RB.audio._.st.ctx.resume(); return e; });
  assert(Math.abs(t2 - t1) < 0.05, 'suspended: the clock held (' + (t2 - t1).toFixed(3) + ' s)');
  await p.waitForTimeout(800);
  const c = await cue(p);
  assert(c.cue.active && c.cue.state === 'sounding' && c.player.out < 0.01, 'resumed: the recording still owns the cue: ' + JSON.stringify(c.cue));
  await p.context().close();
});

await test('MT-T32 a closed context is replaced: the old cue is let go, the recording comes back on the new context', async () => {
  const { p, errors } = await open();
  await choose(p, 'ensemble');
  await p.evaluate(async () => { await RB.audio.init(); RB.audio.playSong('snowbell', { fade: 0 }); });
  await ensembleOn(p, 'snowbell', 20000);
  const old = await p.evaluate(async () => { const c = RB.audio._.st.ctx; await c.close(); return c.state; });
  await p.evaluate(async () => { await RB.audio.init(); RB.audio.playSong('snowbell', { fade: 0, restart: true }); });
  await p.waitForTimeout(300);
  const fresh = await p.evaluate(() => ({ state: RB.audio._.st.ctx.state, cueCtx: RB.audio._.perf.cue && RB.audio._.perf.cue.player.g.ctx === RB.audio._.st.ctx }));
  await ensembleOn(p, 'snowbell', 10000);
  const c = await cue(p);
  assert(old === 'closed' && fresh.state === 'running' && fresh.cueCtx && c.cue.active && c.cue.owner, 'a new context, the cue on it, the recording sounding: ' + JSON.stringify({ old, fresh, cue: c.cue }));
  assert(!errors.length && !c.err, 'no error: ' + errors.join(' | ') + ' ' + c.err);
  await p.context().close();
});

await test('MT-T16/T17/T18/T19 the loop policy and the seams, offline, through the game\'s own scheduler (nearest-frame model)', async () => {
  const { p } = await open();
  await p.addScriptTag({ content: PAGE_LIB });
  const r = await p.evaluate(async () => {
    const out = {};
    for (const id of ['snowbell', 'battle_keepers']) {
      const e = RB.audio.ensembleCatalog.songs[id], f = e.formats[0];
      for (const u of [f.first.url, f.loop.url]) await window.__mtDecode(u, [48000]);
      const D = e.durationSec, L = e.loopStartSec, P = D - L;
      const at = [D - 0.0001, D, D + 0.0001, D + 2 * P - 0.5, D + 5 * P - 0.01, D + 10 * P - 0.02];
      out[id] = [];
      for (const from of at) {
        const x = await window.__mtPlace(id, e, 0, from, 1.2);
        out[id].push({ from, snr: x.modelSnrDb, model: x.model, seams: x.seams.length, first: x.segments[0] && x.segments[0].offset });
      }
      out[id].L = L;
    }
    return out;
  });
  for (const id of ['snowbell', 'battle_keepers']) {
    assert(r[id].every((x) => x.snr > 100), id + ': the scheduler reads exactly where the clock says around boundaries 1, 3, 6 and 11: ' + JSON.stringify(r[id]));
  }
  // the repeat enters at L: just after D the steady file is read from its loop start (+ the time past D)
  const kp = r.battle_keepers.find((x) => Math.abs(x.from - 71.57894736842104) < 1e-9);
  assert(kp && kp.first != null, 'Keepers at D: ' + JSON.stringify(kp));
  await p.context().close();
});

await test('MT-T34/T36/T37 levels through the game graph: matched to the Original, following the music volume and the speech ducking', async () => {
  const { p } = await open();
  await p.addScriptTag({ content: fs.readFileSync(path.join(root, 'tools/music/ensemble/loudness.mjs'), 'utf8').replace(/export function/g, 'function') + '\nwindow.__lufs = loudness;' });
  await p.addScriptTag({ content: PAGE_LIB });
  const r = await p.evaluate(async () => {
    const out = {};
    for (const id of ['snowbell', 'battle_keepers']) {
      const e = RB.audio.ensembleCatalog.songs[id], f = e.formats[0];
      for (const u of [f.first.url, f.loop.url]) await window.__mtDecode(u, [48000]);
      const o = await window.__mtGraph(id, e, 0, 40.05, { mix: 1, until: 40 });
      const n = await window.__mtGraph(id, e, 0, 40.05, { mix: 0, until: 40, trim: e.trim });
      const half = await window.__mtGraph(id, e, 0, 40.05, { mix: 0, until: 40, trim: e.trim, vol: { music: 0.35 } });
      const duck = await window.__mtGraph(id, e, 0, 40.05, { mix: 0, until: 40, trim: e.trim, duck: true });
      out[id] = { original: o.integrated, ensemble: n.integrated, halfVolume: half.integrated, ducked: duck.integrated, peak: n.peak, nan: n.nan };
    }
    return out;
  });
  for (const [id, x] of Object.entries(r)) {
    assert(Math.abs(x.original - x.ensemble) <= 1, id + ': within 1 LU of the Original over its first 40 s: ' + JSON.stringify(x));
    assert(x.halfVolume < x.ensemble - 4 && x.ducked < x.ensemble - 6 && x.peak <= 1 && !x.nan, id + ': the user\'s music volume and the ducking act on the recording: ' + JSON.stringify(x));
  }
  console.log('   ', JSON.stringify(r));
  await p.context().close();
});

await test('MT-T39 the warm Original: rendering cost with the recording over it, against the Original alone (offline)', async () => {
  const { p } = await open();
  await p.addScriptTag({ content: fs.readFileSync(path.join(root, 'tools/music/ensemble/loudness.mjs'), 'utf8').replace(/export function/g, 'function') + '\nwindow.__lufs = loudness;' });
  await p.addScriptTag({ content: PAGE_LIB });
  const r = await p.evaluate(async () => {
    const out = {};
    for (const id of ['snowbell', 'battle_keepers']) {
      const e = RB.audio.ensembleCatalog.songs[id], f = e.formats[0];
      for (const u of [f.first.url, f.loop.url]) await window.__mtDecode(u, [48000]);
      const t = async (fn) => { const a = performance.now(); await fn(); return performance.now() - a; };
      const bufs = { first: window.__mt.bufs[f.first.url], loop: window.__mt.bufs[f.loop.url] };
      const alone = await t(() => RB.audio.renderOffline(id, 30, { sampleRate: 48000 }));
      const warm = await t(() => RB.audio.renderEnsembleOffline(id, bufs, 30, { entry: e, fmt: f, original: true, mix: 0 }));
      const rec = await t(() => RB.audio.renderEnsembleOffline(id, bufs, 30, { entry: e, fmt: f }));
      out[id] = { originalAloneMs: Math.round(alone), warmOriginalPlusRecordingMs: Math.round(warm), recordingAloneMs: Math.round(rec), ratio: +(warm / alone).toFixed(2) };
    }
    return out;
  });
  console.log('   ', JSON.stringify(r), '(30 s of music each, 48 kHz offline; the Original alone renders 4 channels for its own analysis)');
  for (const x of Object.values(r)) assert(x.ratio < 2, 'the warm Original costs less than twice the Original alone: ' + JSON.stringify(x));
  await p.context().close();
});

// ---- the pilots in ordinary play ------------------------------------------------------------------------------
await test('MT-T41 Snowbell in ordinary play: the area\'s music, the real Settings menu, the recording sounds', async () => {
  const { p, errors } = await open();
  await p.evaluate(async () => {
    await RB.audio.init();
    const m = RB.content.maps['sb.hamlet'], sp = m.spawn.default;
    const s = RB.game.debugStart('sb.hamlet', sp[0], sp[1], { comp: 'mio' });
    s.learn.kanaKnown = 'both';
  });
  await p.waitForTimeout(800);
  const s0 = await cue(p);
  assert(s0.song === 'snowbell', 'Snowbell plays its own music: ' + s0.song);
  await p.evaluate(() => RB.ui.menu && RB.ui.menu.open ? RB.ui.menu.open() : null);
  await p.waitForTimeout(300);
  await p.evaluate(() => RB.ui.settings.open());
  await p.waitForTimeout(300);
  await p.evaluate(() => { const g = document.querySelector('[data-grp="audio"]'); if (g) g.click(); });
  await p.waitForSelector('input[data-set="musicPerformance"]');
  await p.click('label.opt:has(input[data-set="musicPerformance"][value="ensemble"])');
  await ensembleOn(p, 'snowbell', 20000);
  const c = await cue(p);
  const line = await p.evaluate(() => (document.querySelector('[data-mp-status]') || {}).textContent);
  assert(c.cue.active && c.player.out < 0.01 && c.cue.segs >= 1, 'the recording owns the cue: ' + JSON.stringify(c.cue));
  assert(/Ensemble playing/.test(line), 'the line says so: ' + line);
  assert(!errors.length, 'page errors: ' + errors.join(' | '));
  await p.context().close();
});

await test('MT-T05/T42 a Keepers\' Road battle: battle_keepers, the battle\'s own settings sheet, both ways, and out of the battle', async () => {
  const { p, errors } = await open();
  await p.evaluate(async () => {
    await RB.audio.init();
    const m = RB.content.maps['kr.ridge'], sp = (m.spawn && m.spawn.default) || [1, 1, 'down'];
    const s = RB.game.debugStart('kr.ridge', sp[0], sp[1], { comp: 'mio' });
    s.learn.kanaKnown = 'both';
    RB.game.settings.input = 'choice';
    window.__res = null;
    RB.game.startBattle('kr.sandal', {}).then((x) => { window.__res = x; });
  });
  await p.waitForFunction(() => RB.audio.currentSong() === 'battle_keepers', null, { timeout: 8000 });
  for (let i = 0; i < 200; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.rcard[data-i], .resp[data-i]') }));
    if (st.cards) break;
    if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(60);
  }
  await p.mouse.move(2, 2); await p.waitForTimeout(320);
  await p.click('.combat-ui .cb-set');
  await p.waitForSelector('.folio-bset');
  const grp = await p.evaluate(() => { const g = document.querySelector('.folio-bset [data-grp="audio"]'); if (g && g.offsetParent) { g.click(); return 'audio'; } const i = document.querySelector('.folio-bset [data-grp=""]'); if (i) i.click(); return 'index'; });
  if (grp === 'index') { await p.waitForTimeout(150); await p.click('.folio-bset [data-grp="audio"]'); }
  await p.waitForSelector('.folio-bset input[data-set="musicPerformance"]', { timeout: 5000 });
  const paused = await p.evaluate(() => RB.battleSeq.paused());
  await p.click('.folio-bset label.opt:has(input[data-set="musicPerformance"][value="ensemble"])');
  await ensembleOn(p, 'battle_keepers', 20000);
  let c = await cue(p);
  assert(paused && c.cue.active && c.player.id === 'battle_keepers', 'offered in battle (paused under the sheet), the recording sounds: ' + JSON.stringify({ paused, cue: c.cue }));
  await p.click('.folio-bset label.opt:has(input[data-set="musicPerformance"][value="original"])');
  await until(p, () => { const c = window.__cue(); return c.cue && !c.cue.active && c.cue.segs === 0; }, null, 5000);
  await p.click('.folio-bset label.opt:has(input[data-set="musicPerformance"][value="ensemble"])');
  await ensembleOn(p, 'battle_keepers', 5000);
  await p.click('.folio-bset [data-folio-close]');
  await p.waitForTimeout(600);
  // step back from the fight: the map's music returns (MT-2: with its own recording), the battle's recording released
  await p.waitForSelector('[data-flee]', { timeout: 10000 });
  await p.click('[data-flee]');
  await p.waitForSelector('.csheet .pbtn');
  await p.evaluate(() => [...document.querySelectorAll('.csheet .pbtn')].find((x) => /step back/i.test(x.textContent)).click());
  await p.waitForFunction(() => window.__res === 'flee' && RB.game.mode() === 'world', null, { timeout: 15000 });
  await p.waitForTimeout(1200);
  c = await cue(p);
  // (MT-2: the map's music has its own recording now: its own cue takes over, the battle's recording released)
  assert(c.song !== 'battle_keepers' && c.cue && c.cue.id === c.song && c.cue.want === 'ensemble' && c.status.pref === 'ensemble', 'after the battle the map\'s own cue: ' + JSON.stringify({ song: c.song, cue: c.cue, s: c.status }));
  await ensembleOn(p, c.song, 20000);
  c = await cue(p);
  assert(c.cue.id === c.song && c.cue.active && c.status.state === 'ensemble', 'the map\'s recording sounds: ' + JSON.stringify({ cue: c.cue, s: c.status }));
  assert(!errors.length, 'page errors: ' + errors.join(' | '));
  await p.context().close();
});

// ---- hosted under a sub-path, with the built policy -------------------------------------------------------------
await test('MT-T43 hosted under a project sub-path: the files resolve beside the page and the built CSP admits only this origin', async () => {
  const html = fs.readFileSync(path.join(root, process.env.RB_PAGE || 'index.html'), 'utf8');
  const csp = (html.match(/Content-Security-Policy" content="([^"]+)"/) || [])[1] || '';
  assert(/connect-src 'self'/.test(csp) && /default-src 'none'/.test(csp) && !/connect-src[^;]*(\*|https?:)/.test(csp), 'the built policy: connect-src \'self\' only: ' + csp);
  const sub = http.createServer((req, res) => {
    let pth = decodeURIComponent(req.url.split('?')[0]);
    if (!pth.startsWith('/game/')) { res.writeHead(404); res.end(); return; }
    pth = pth.slice(5);
    if (pth === '/' || pth === '/index.html') pth = '/' + (process.env.RB_PAGE || 'index.html');
    const f = path.join(root, pth);
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html; charset=utf-8' : f.endsWith('.mp3') ? 'audio/mpeg' : f.endsWith('.opus') ? 'audio/ogg' : 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  await new Promise((r) => sub.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${sub.address().port}/game/`;
  const { p, music, errors } = await open({ url: base });
  await choose(p, 'ensemble');
  await p.evaluate(async () => { await RB.audio.init(); RB.audio.playSong('snowbell', { fade: 0 }); });
  await ensembleOn(p, 'snowbell', 20000);
  assert(music.length >= 2 && music.every((u) => u.startsWith(base + 'assets/music/ensemble/')), 'the files came from beside the page: ' + JSON.stringify(music));
  assert(!errors.length, 'page errors (a CSP refusal would show): ' + errors.join(' | '));
  await p.context().close();
  sub.close();
});

// ---- MT-2: every song ------------------------------------------------------------------------------------------
await test('MT2-T01 coverage: the build offers exactly the manifest\'s ready recordings, every song if all are ready', async () => {
  const { p, errors } = await open();
  const man = JSON.parse(fs.readFileSync(path.join(root, 'assets/music/ensemble/manifest.json'), 'utf8'));
  const ready = man.tracks.filter((t) => t.releaseStatus === 'ready').map((t) => t.songId).sort();
  const r = await p.evaluate(() => ({ offered: RB.audio.ensembleSongs().slice().sort(), all: Object.keys(RB.audio._.songDefs).sort() }));
  assert(JSON.stringify(r.offered) === JSON.stringify(ready), 'offered = ready: ' + r.offered.length + ' vs ' + ready.length);
  const missing = r.all.filter((id) => !r.offered.includes(id));
  console.log('   coverage', r.offered.length, 'of', r.all.length, missing.length ? '(Original only: ' + missing.join(', ') + ')' : '(every song)');
  assert(!errors.length, 'page errors: ' + errors.join(' | '));
  await p.context().close();
});

await test('MT2-T02 the main menu theme (title) plays its recording, and the line says so', async () => {
  const { p, music, errors } = await open();
  await choose(p, 'ensemble');
  await p.evaluate(async () => { await RB.audio.init(); RB.audio.playSong('title', { fade: 0 }); });
  await ensembleOn(p, 'title', 20000);
  const c = await cue(p);
  assert(c.status.state === 'ensemble' && c.status.actual === 'ensemble' && c.player.id === 'title' && c.player.out === 0, 'Ensemble playing over the warm Original: ' + JSON.stringify(c.status));
  assert(music.length >= 1 && music.every((u) => /\/assets\/music\/ensemble\/title\//.test(u)), 'only the title\'s files were fetched: ' + JSON.stringify(music));
  assert(!errors.length && !c.err, 'no page or engine error: ' + errors.join(' | '));
  await p.context().close();
});

await test('MT2-T03 a cue that does not loop (the victory sting): one file, no steady cycle, it plays out and ends', async () => {
  const { p, music, errors } = await open();
  await choose(p, 'ensemble');
  const e = await p.evaluate(() => { const e = RB.audio.ensembleCatalog && RB.audio.ensembleCatalog.songs.victory; return e && { loop: e.loop, D: e.durationSec, f: e.formats.map((f) => ({ loop: f.loop, span: (f.first.end - f.first.start) / f.first.rate })) }; });
  assert(e && e.loop === false && e.f.every((f) => f.loop === null && f.span >= e.D), 'the catalog entry is one file covering the cue: ' + JSON.stringify(e));
  await p.evaluate(async () => { await RB.audio.init(); RB.audio.playSong('victory', { fade: 0 }); });
  await ensembleOn(p, 'victory', 15000);
  let c = await cue(p);
  assert(c.cue.segs === 1 && c.cue.segments[0].role === 'first' && c.cue.segments[0].until == null && c.cue.horizon == null, 'one segment, no cycle scheduled: ' + JSON.stringify(c.cue.segments));
  assert(music.length >= 1 && music.every((u) => /victory\.first\./.test(u)), 'only the single file was fetched: ' + JSON.stringify(music));
  // the score ends (the sequencer's one completion): the recording plays out its own decay, then lets go
  const ends = [];
  await p.evaluate(() => { window.__ends = []; RB.bus.on('audio:songend', (e) => window.__ends.push(e.id)); });
  await until(p, () => !RB.audio.currentSong(), null, 15000);
  await until(p, () => window.__cue().revGate > 0.99, null, 2000); // (the room's return reopens over about 0.3 s)
  c = await cue(p);
  assert(!c.cue && c.ringing && c.ringing.id === 'victory' && c.ringing.state === 'ringing' && c.ringing.segs === 1 && c.ringing.gain > 0.99 && c.revGate > 0.99, 'at the score\'s end the recording rings on, the room\'s return open for what follows: ' + JSON.stringify({ r: c.ringing, rg: c.revGate }));
  await until(p, () => !window.__cue().ringing, null, 15000);
  c = await cue(p);
  ends.push(...(await p.evaluate(() => window.__ends)));
  assert(ends.length === 1 && ends[0] === 'victory' && c.mem.inflight === 0, 'one completion, and the recording let go when its file ended: ' + JSON.stringify({ ends, mem: c.mem }));
  // the next song while the sting rings out (as the Original's ended notes ring under it): its own cue starts, the
  // ringing recording still lets go on its own
  await p.evaluate(() => RB.audio.playSong('victory', { fade: 0 }));
  await ensembleOn(p, 'victory', 15000);
  await until(p, () => !!window.__cue().ringing, null, 15000);
  await p.evaluate(() => RB.audio.playSong('title', { fade: 0 }));
  await ensembleOn(p, 'title', 20000);
  c = await cue(p);
  assert(c.cue.id === 'title' && c.revGate < 0.01 && c.player.id === 'title', 'the next song\'s recording sounds while the sting rings out: ' + JSON.stringify({ cue: c.cue, r: c.ringing }));
  await until(p, () => !window.__cue().ringing, null, 15000);
  c = await cue(p);
  assert(c.cue.id === 'title' && c.cue.active && c.status.state === 'ensemble', 'the sting let go on its own, the title untouched: ' + JSON.stringify({ cue: c.cue, s: c.status }));
  assert(!errors.length && !c.err, 'no page or engine error: ' + errors.join(' | '));
  await p.context().close();
});

await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
