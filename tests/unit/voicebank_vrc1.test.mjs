// VR-C1 (Astra's voice runtime audit, 2026-10-16): the audit's cases, reproduced against the full module
// src/audio/52_voicebank.js (not excerpts), with the real script runner (src/engine/70_script.js), the real condition
// test (src/engine/05_state.js) and the real text functions. The network, Cache Storage and the Audio element are
// controlled substitutes (each request logged, any of them held open, failed or corrupted); nothing here plays sound or
// uses a browser. tests/e2e/voice_runtime.mjs covers the same behaviour in Chromium on the built page.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import crypto from 'node:crypto';
import { root } from '../lib/load.mjs';

const sha = (b) => crypto.createHash('sha256').update(typeof b === 'string' ? Buffer.from(b) : Buffer.from(b)).digest('hex');
const tick = () => new Promise((r) => setImmediate(r));
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const gate = () => { let release; const p = new Promise((r) => (release = r)); return { p, release }; };
async function until(fn, ms = 3000) { const t0 = Date.now(); while (!fn()) { if (Date.now() - t0 > ms) return false; await delay(5); } return true; }

const FILES = ['src/core/00_ns.js', ...fs.readdirSync(path.join(root, 'src/lang')).sort().filter((f) => f.endsWith('.js')).map((f) => 'src/lang/' + f),
  'src/engine/05_state.js', 'src/engine/70_script.js'];
const VOICEBANK = fs.readFileSync(path.join(root, 'src/audio/52_voicebank.js'), 'utf8');

const SCRIPT = `
@scene t.linear
narr: いち || one
narr: に || two
narr: さん || three
narr: よん || four
@scene t.cond
?(flag_never_set) narr: むり || impossible
narr: とどく || reachable
@scene t.choice
!choice
* えー || A -> a
* びー || B -> b
:a
narr: えーの みち || branch A
!end
:b
narr: びーの みち || branch B
@scene t.ended
narr: まえ || before
!end
narr: あと || after
@scene t.if
!if flag_x -> yes
narr: いいえ || no
!end
:yes
narr: はい || yes
!set flag_y
!if flag_y -> later
narr: まだ || not yet
:later
narr: のちほど || later
@scene t.goto
narr: とぶ || jump
!goto there
narr: とばない || skipped
:there
narr: ついた || arrived
@scene t.call
narr: よぶ || call
!call t.sub
narr: もどる || back
@scene t.sub
narr: なか いち || inside one
narr: なか に || inside two
@scene t.battle
narr: たたかう || fight
!battle slime
narr: かった || won
@scene t.dirty
!set flag_z
narr: そのご || after the set
?(flag_z) narr: たぶん || maybe
`;
const RAPID = Array.from({ length: 8 }, (_, i) => `@scene t.r${i}\nnarr: はやい ${i} || fast ${i}\nnarr: つぎ ${i} || next ${i}`).join('\n');

// one controlled world: the game's modules in a fresh context, a voice site, a network, Cache Storage, an Audio stub
function world(o = {}) {
  const H = { log: [], pending: 0, maxPending: 0, recPending: 0, maxRecPending: 0, aborted: [], gates: new Map(), fail: null, putGate: null, quota: o.quota || Infinity, stores: o.stores || new Map(), corrupt: null };
  const ctx = {
    console, setTimeout, clearTimeout, performance, TextEncoder, TextDecoder, URL, Blob, Response, Request, Headers, AbortController, DOMException,
    crypto: o.noSubtle ? undefined : globalThis.crypto,
    __RB_TEST__: true,
    location: new URL('https://example.test/game/index.html'),
    navigator: o.navigator || {},
    fetch: async (url, opts) => {
      const rel = String(url).replace('https://example.test/game/voices/ja-JP/', '');
      const rec = /^rec\//.test(rel);
      H.log.push(rel); H.pending++; H.maxPending = Math.max(H.maxPending, H.pending);
      if (rec) { H.recPending++; H.maxRecPending = Math.max(H.maxRecPending, H.recPending); }
      try {
        const g = H.gates.get(rel) || (rec && H.gates.get('rec/*'));
        if (g) {
          await new Promise((res, rej) => {
            g.p.then(res);
            if (opts && opts.signal) { if (opts.signal.aborted) rej(new DOMException('aborted', 'AbortError')); opts.signal.addEventListener('abort', () => { H.aborted.push(rel); rej(new DOMException('aborted', 'AbortError')); }); }
          });
        }
        if (H.fail && H.fail(rel)) throw new TypeError('temporary offline');
        const b = H.site.get(rel);
        if (!b) return new Response('', { status: 404 });
        return new Response(b.slice(0), { status: 200 });
      } finally { H.pending--; if (rec) H.recPending--; }
    },
  };
  // Cache Storage: named stores of { url: { body, headers } }
  const store = (name) => { if (!H.stores.has(name)) H.stores.set(name, new Map()); return H.stores.get(name); };
  const keyOfReq = (x) => (typeof x === 'string' ? x : x.url);
  ctx.caches = {
    open: async (name) => {
      if (o.openFails) throw new Error('broken for the test');
      if (o.openDelay) await delay(o.openDelay);
      const m = store(name);
      return {
        async match(x) { const e = m.get(keyOfReq(x)); return e ? new Response(e.body.slice(0), { headers: e.headers }) : undefined; },
        async put(x, resp) {
          const u = keyOfReq(x);
          const body = new Uint8Array(await resp.arrayBuffer());
          if (H.putGate && !/__rbn_voice_meta__/.test(u)) await H.putGate.p;
          let total = 0; for (const e of m.values()) total += e.body.byteLength;
          if (total + body.byteLength > H.quota) throw new DOMException('quota', 'QuotaExceededError');
          m.set(u, { body, headers: Object.fromEntries(resp.headers.entries()) });
        },
        async delete(x) { return m.delete(keyOfReq(x)); },
        async keys() { return Array.from(m.keys(), (u) => new Request(u)); },
      };
    },
    keys: async () => Array.from(H.stores.keys()),
  };
  class AudioStub {
    constructor() { this.currentTime = 0; this.duration = NaN; this.paused = true; this.volume = 1; }
    canPlayType() { return 'probably'; }
    play() { this.paused = false; setTimeout(() => this.onplaying && this.onplaying(), 1); return Promise.resolve(); }
    pause() { this.paused = true; }
    load() {}
    removeAttribute() {}
  }
  ctx.Audio = AudioStub;
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
  const RB = ctx.RB;
  const parsed = RB.script.parse(SCRIPT + '\n' + RAPID, 't.rbs');
  if (parsed.errors.length) throw new Error(parsed.errors.join('\n'));
  Object.assign(RB.content.scenes, parsed.scenes);
  RB.game = {
    s: { flags: { flag_x: true }, vars: {}, quests: {}, inv: {}, words: [], seen: {}, comp: null, provisional: null, player: { name: 'Robin' }, learn: {}, backlog: [] },
    settings: { voice: { mode: 'prepared', autoRec: true, player: 'none', pitch: 'high' } },
    pushMode() {}, popMode() {}, afterScene() {}, fastForward: () => false,
  };
  if (o.muted) RB.audio = { getVolume: () => 1, isMuted: () => true };
  // the voice site, built as tools/voice/voice_site.mjs builds it (content-named files, variants with text hashes)
  H.site = new Map();
  const scenes = {};
  const sizes = o.sizes || ((i) => 2000 + i * 37);
  let i = 0;
  for (const [id, sc] of Object.entries(parsed.scenes)) {
    const lines = {};
    for (const c of sc.cmds) {
      if (c.op !== 'say' || !c.jp) continue;
      const sp = c.who === 'narr' || !c.who ? 'narrator' : c.who;
      const rid = 'r1-' + sha(sp + '\u0001' + c.jp).slice(0, 16);
      const bytes = crypto.createHash('sha512').update(rid).digest();
      const body = new Uint8Array(sizes(i++)); for (let k = 0; k < body.length; k++) body[k] = bytes[k % bytes.length] ^ (k & 255);
      const f = 'rec/' + sp + '/' + rid + '.' + sha(body).slice(0, 12) + '.opus';
      H.site.set(f, body);
      lines[id + '#' + sha(c.jp).slice(0, 10)] = [{ id: rid, sp, d: 's', f, b: body.length, h: sha(body), t: 1, th: sha(String(RB.jp.plain(c.jp)).replace(/\s+/g, '').normalize('NFC')).slice(0, 16) }];
    }
    const text = JSON.stringify({ lines });
    const p = 'idx/s/' + id + '.' + sha(text).slice(0, 12) + '.json';
    H.site.set(p, new TextEncoder().encode(text));
    scenes[id] = p;
  }
  const refBody = new Uint8Array(1500).fill(7);
  const refF = 'rec/ref/r1-ref-aaaa.' + sha(refBody).slice(0, 12) + '.opus';
  H.site.set(refF, refBody);
  const refsText = JSON.stringify({ 'kana:あ|あ': { id: 'r1-ref-aaaa', f: refF, b: refBody.length, h: sha(refBody), t: 0.5 } });
  const refsP = 'idx/refs.' + sha(refsText).slice(0, 12) + '.json';
  H.site.set(refsP, new TextEncoder().encode(refsText));
  H.site.set('index.json', new TextEncoder().encode(JSON.stringify({ schema: 'rbn.voice.site/1', voiceBuild: 'vrc1-test', scenes, refs: refsP })));
  const instance = () => { vm.runInContext(VOICEBANK, ctx, { filename: 'src/audio/52_voicebank.js' }); const vb = RB.voicebank; vb.configure(Object.assign({ base: './voices/ja-JP/' }, o.cfg || {})); return vb; };
  const vb = instance();
  const sc = (id) => RB.content.scenes[id];
  const say = (id, n) => { const c = sc(id).cmds.filter((x) => x.op === 'say')[n]; return { who: c.who, jp: c.jp, en: c.en, sceneId: id, line: c.line }; };
  const fileOf = (id, n) => { const s = say(id, n); const sh = JSON.parse(new TextDecoder().decode(H.site.get(scenes[id]))); return sh.lines[id + '#' + sha(s.jp).slice(0, 10)][0].f; };
  const recs = () => H.log.filter((r) => /^rec\//.test(r));
  return { RB, ctx, H, vb, instance, say, fileOf, recs, scenes };
}

export default async function (t) {
  const results = [];
  const check = (name, ok, facts) => { results.push({ name, ok: !!ok, facts }); t.ok(ok, name + ' ' + JSON.stringify(facts)); };

  // ---- A · lookahead follows only lines that can be reached ---------------------------------------------------------
  {
    const w = world();
    w.vb.scene('t.linear');
    await until(() => w.recs().length >= 3); await delay(60);
    check('sequential_lookahead_cap', w.recs().length === 3 && [0, 1, 2].every((n) => w.recs().includes(w.fileOf('t.linear', n))), { requested: w.recs() });
  }
  {
    const w = world();
    w.vb.scene('t.cond');
    await until(() => w.recs().length >= 1); await delay(80);
    check('skip_false_condition', w.recs().length === 1 && w.recs()[0] === w.fileOf('t.cond', 1), { requested: w.recs() });
  }
  {
    const w = world();
    w.vb.scene('t.choice');
    await until(() => w.H.log.some((r) => /idx\/s\/t\.choice/.test(r))); await delay(120);
    check('stop_at_unresolved_choice', w.recs().length === 0, { requested: w.recs() });
  }
  {
    const w = world();
    w.vb.scene('t.ended');
    await until(() => w.recs().length >= 1); await delay(120);
    check('stop_at_end', w.recs().length === 1 && w.recs()[0] === w.fileOf('t.ended', 0), { requested: w.recs() });
  }
  {
    // !if with a state that can be read now follows the branch it takes; after a !set nothing conditional is guessed
    const w = world();
    w.vb.scene('t.if');
    await until(() => w.recs().length >= 1); await delay(150);
    const yes = w.fileOf('t.if', 1), no = w.fileOf('t.if', 0);
    check('if_follows_known_branch_and_stops_after_a_change', w.recs().length === 1 && w.recs()[0] === yes && !w.recs().includes(no), { requested: w.recs(), yes, no });
  }
  {
    const w = world();
    w.vb.scene('t.goto');
    await until(() => w.recs().length >= 2); await delay(120);
    check('goto_skips_what_it_jumps_over', w.recs().length === 2 && !w.recs().includes(w.fileOf('t.goto', 1)), { requested: w.recs() });
  }
  {
    const w = world();
    w.vb.scene('t.battle');
    await until(() => w.recs().length >= 1); await delay(120);
    check('stop_at_battle', w.recs().length === 1, { requested: w.recs() });
  }
  {
    const w = world();
    w.vb.scene('t.dirty');
    await until(() => w.recs().length >= 1); await delay(120);
    check('condition_after_a_state_change_is_not_guessed', w.recs().length === 1 && w.recs()[0] === w.fileOf('t.dirty', 0), { requested: w.recs() });
  }
  {
    // the real runner: a called scene's lines, then back to the caller's next line (the runner's own position)
    const w = world();
    const shown = [];
    let next = null;
    w.RB.world = { ensureSpeaker() {}, whenArrived: async () => {} };
    w.RB.ui = { dialogue: { say: (line) => { shown.push(line.jp); w.vb.lookahead(line, line); return new Promise((r) => (next = r)); }, hide() {}, choose: async () => 0 } };
    w.RB.world.dismissExtras = () => {}; w.RB.world.refreshActors = () => {};
    const run = w.RB.script.run('t.call');
    await until(() => shown.length === 1); await delay(200);
    const first = w.recs().slice(), planFirst = (w.vb._.S.plan || []).slice();
    next(); await until(() => shown.length === 2); await delay(150);
    next(); await until(() => shown.length === 3); await delay(150);
    // on the called scene's last line: the runner's frames, and a plan that goes back to the caller's next line
    const pos = w.RB.script.position ? w.RB.script.position() : null, planLast = (w.vb._.S.plan || []).slice();
    next(); await until(() => shown.length === 4); next(); await run;
    check('nested_call_then_back_to_the_caller', !!pos && pos.length === 2 && pos[0].sceneId === 't.sub' && pos[0].called && pos[1].sceneId === 't.call' &&
      planFirst.join() === [w.fileOf('t.sub', 0), w.fileOf('t.sub', 1), w.fileOf('t.call', 1)].join() && planLast.join() === w.fileOf('t.call', 1) && first.includes(w.fileOf('t.sub', 0)),
    { position: pos, planAtFirstLine: planFirst.length, planAtLastInside: planLast, requested: first.length });
  }

  // ---- B · one bounded speculative queue -------------------------------------------------------------------------------
  {
    const w = world();
    const g = gate(); w.H.gates.set('rec/*', g);
    w.vb.scene('t.linear');
    await until(() => w.recs().length >= 1); await tick();
    w.vb.stop();
    g.release(); await delay(150);
    check('stop_cancels_old_lookahead', w.recs().length === 1, { requested: w.recs() });
  }
  for (const warm of [false, true]) {
    const w = world();
    if (warm) { for (let i = 0; i < 8; i++) await w.vb._.shard('t.r' + i); }
    const g = gate(); w.H.gates.set('rec/*', g);
    for (let i = 0; i < 8; i++) { w.vb.scene('t.r' + i); await tick(); }
    await delay(150);
    const pendingRec = w.H.maxRecPending;
    g.release(); await delay(200);
    const finished = w.recs().filter((r) => !w.H.aborted.includes(r));
    check('global_inflight_bound' + (warm ? '_warm' : ''), pendingRec <= 1 && finished.every((r) => /t\.r7|はやい 7|つぎ 7/.test(r) || r === w.fileOf('t.r7', 0) || r === w.fileOf('t.r7', 1)), { maxSimultaneousRecordingRequests: pendingRec, requested: w.recs().length, aborted: w.H.aborted.length, finished: finished.length });
  }
  {
    // the line asked for comes first: its own transfer, already running ahead, is shared and never aborted; nothing
    // speculative starts while it waits
    const w = world();
    const g = gate(); w.H.gates.set('rec/*', g);
    w.vb.scene('t.linear');
    await until(() => w.recs().length >= 1);
    const l0 = w.say('t.linear', 0);
    const play = w.vb.playLine(l0, l0, {});
    w.vb.lookahead(l0, l0);
    await delay(60);
    const during = w.recs().slice();
    g.release();
    const r = await play;
    await until(() => w.recs().length >= 3); await delay(60);
    check('foreground_shares_and_comes_first', r === 'playing' && during.length === 1 && w.H.aborted.length === 0 && w.recs().filter((x) => x === w.fileOf('t.linear', 0)).length === 1, { result: r, whileWaiting: during, aborted: w.H.aborted, requested: w.recs() });
  }
  {
    // a transfer for a line no longer ahead is aborted, and an abort is not a failure (no cool-down for that file)
    const w = world();
    const g = gate(); w.H.gates.set('rec/*', g);
    w.vb.scene('t.linear');
    await until(() => w.recs().length >= 1);
    w.vb.scene('t.goto');
    await delay(80);
    const aborted = w.H.aborted.slice();
    g.release(); await delay(150);
    const f = w.vb._.S.fails.get('https://example.test/game/voices/ja-JP/' + w.fileOf('t.linear', 0));
    check('obsolete_transfer_aborted_without_a_failure', aborted.includes(w.fileOf('t.linear', 0)) && !f, { aborted, fail: f || null });
  }
  {
    const w = world({ muted: true });
    w.vb.scene('t.linear');
    await delay(150);
    check('muted_no_audio_prefetch', w.H.log.length === 0, { requested: w.H.log });
  }

  // ---- C · a passing index failure is not remembered for the session ----------------------------------------------------
  {
    const w = world();
    let failing = true; w.H.fail = () => failing;
    const a = await w.vb._.shard('t.linear'), r = await w.vb._.refs();
    failing = false;
    await delay(1100); // (past the first back-off)
    await w.vb._.index();
    const sh = await w.vb._.shard('t.linear'), rf = await w.vb._.refs();
    check('retry_scene_and_refs_after_index_recovery', a === null && r === null && !!sh && !!rf, { scene: !!sh, references: !!rf, network: w.H.log.length });
    // and a burst of asks while it is failing makes at most one request per back-off
    const w2 = world();
    w2.H.fail = () => true;
    for (let i = 0; i < 20; i++) { await w2.vb._.shard('t.linear'); w2.vb.hasLine(w2.say('t.linear', 0), w2.say('t.linear', 0)); }
    check('no_request_storm_while_failing', w2.H.log.length <= 2, { requests: w2.H.log.length });
  }
  {
    // a scene the valid index does not list is a real absence: asked again, no new request
    const w = world();
    await w.vb._.shard('t.nowhere'); const n = w.H.log.length; await w.vb._.shard('t.nowhere');
    check('absent_scene_remembered', w.H.log.length === n, { requests: w.H.log });
  }

  // ---- D · a kept recording is checked as well as a fresh one --------------------------------------------------------------
  {
    const w = world();
    const f = w.fileOf('t.linear', 0), body = w.H.site.get(f);
    const e = { f, b: body.length, h: sha(body) };
    const good = await w.vb._.bytes(e);
    check('network_hash_validation_control', !!good && sha(new Uint8Array(good)) === e.h, { ok: !!good });
    const w2 = world();
    const bad = new Uint8Array(body.length).fill(9);
    w2.H.site.set(f, bad);
    const r = await w2.vb._.bytes({ f, b: body.length, h: sha(body) });
    check('network_hash_validation', r === null, { rejected: r === null });
  }
  for (const noSubtle of [false, true]) {
    const w = world({ noSubtle });
    const f = w.fileOf('t.linear', 0), body = w.H.site.get(f), url = 'https://example.test/game/voices/ja-JP/' + f;
    const store = new Map(); w.H.stores.set('rbn-voice-v1', store);
    store.set(url, { body: new Uint8Array(body.length).fill(5), headers: {} });
    const got = await w.vb._.bytes({ f, b: body.length, h: sha(body) });
    const kept = store.get(url);
    await delay(50);
    check('cache_hit_hash_validation' + (noSubtle ? '_own_hash' : ''), !!got && sha(new Uint8Array(got)) === sha(body) && w.recs().length === 1 && sha(store.get(url).body) === sha(body), { networkRequests: w.recs().length, returnedGood: !!got && sha(new Uint8Array(got)) === sha(body), keptFixed: !!kept && sha(store.get(url).body) === sha(body) });
  }
  {
    const w = world();
    const f = w.fileOf('t.linear', 0), body = w.H.site.get(f), e = { f, b: body.length, h: sha(body) };
    await w.vb._.bytes(e); w.vb._.S.mem.clear(); await delay(30);
    await w.vb._.bytes(e);
    check('ordinary_cache_reuse', w.recs().length === 1, { networkRequests: w.recs().length });
  }

  // ---- E · the cache's bookkeeping matches what it holds ---------------------------------------------------------------
  {
    // a recording kept with no bookkeeping (an interrupted write) counts, and is trimmed like any other
    const w = world({ cfg: { limitBytes: 10000 } });
    const store = new Map(); w.H.stores.set('rbn-voice-v1', store);
    store.set('https://example.test/game/voices/ja-JP/rec/narrator/old.000000000000.opus', { body: new Uint8Array(8500), headers: {} });
    const f = w.fileOf('t.linear', 0), body = w.H.site.get(f);
    await w.vb._.bytes({ f, b: body.length, h: sha(body) });
    await delay(1800);
    let actual = 0; for (const [u, v] of store) if (/\/rec\//.test(u)) actual += v.body.byteLength;
    const k = await w.vb.kept();
    check('cache_bound_with_missing_metadata', actual <= 10000 && Math.abs(k.bytes - actual) <= 2048, { actualRecordingBytes: actual, reportedBytes: k.bytes, limit: 10000 });
  }
  {
    const w = world({ cfg: { limitBytes: 10000 } });
    const store = new Map(); w.H.stores.set('rbn-voice-v1', store);
    const old = 'https://example.test/game/voices/ja-JP/rec/narrator/old.000000000000.opus';
    store.set(old, { body: new Uint8Array(8500), headers: {} });
    store.set('https://example.test/game/voices/ja-JP/__rbn_voice_meta__.json', { body: new TextEncoder().encode(JSON.stringify({ v: 1, e: { [old]: [8500, 1] } })), headers: {} });
    const f = w.fileOf('t.linear', 0), body = w.H.site.get(f);
    await w.vb._.bytes({ f, b: body.length, h: sha(body) });
    await delay(1800);
    let actual = 0; for (const [u, v] of store) if (/\/rec\//.test(u)) actual += v.body.byteLength;
    check('ordinary_lru_bound', actual <= 10000 && !store.has(old), { actualRecordingBytes: actual, reportedBytes: (await w.vb.kept()).bytes });
  }
  {
    // two tabs: one cache, two copies of the game; neither loses the other's entries, and the limit holds for both
    const stores = new Map();
    const a = world({ stores, cfg: { limitBytes: 1 << 20 } }), b = world({ stores, cfg: { limitBytes: 1 << 20 } });
    for (let n = 0; n < 4; n++) { const f = a.fileOf('t.linear', n), body = a.H.site.get(f); await a.vb._.bytes({ f, b: body.length, h: sha(body) }); }
    for (let n = 0; n < 2; n++) { const f = b.fileOf('t.goto', n), body = b.H.site.get(f); await b.vb._.bytes({ f, b: body.length, h: sha(body) }); }
    await delay(1800);
    const meta = stores.get('rbn-voice-v1').get('https://example.test/game/voices/ja-JP/__rbn_voice_meta__.json');
    const e = meta ? JSON.parse(new TextDecoder().decode(meta.body)).e : {};
    const recKeys = [...stores.get('rbn-voice-v1').keys()].filter((u) => /\/rec\//.test(u));
    check('two_tabs_keep_each_others_entries', recKeys.length === 6 && recKeys.every((u) => e[u]), { kept: recKeys.length, inLedger: recKeys.filter((u) => e[u]).length });
  }
  {
    // two tabs sharing one Web Lock, a limit both together pass: the trim sees both tabs' entries, and afterwards the
    // ledger lists exactly what the cache holds
    const stores = new Map(), queue = new Map();
    const locks = { request: (name, opts, cb) => { const prev = queue.get(name) || Promise.resolve(); const run = prev.then(() => cb()); queue.set(name, run.catch(() => {})); return run; } };
    const a = world({ stores, navigator: { locks }, cfg: { limitBytes: 12000 } }), b = world({ stores, navigator: { locks }, cfg: { limitBytes: 12000 } });
    for (let n = 0; n < 4; n++) { const f = a.fileOf('t.linear', n), body = a.H.site.get(f); await a.vb._.bytes({ f, b: body.length, h: sha(body) }); }
    await a.vb._.flush();
    for (let n = 0; n < 3; n++) { const f = b.fileOf('t.goto', n), body = b.H.site.get(f); await b.vb._.bytes({ f, b: body.length, h: sha(body) }); }
    await b.vb._.flush(); await a.vb._.flush();
    const st = stores.get('rbn-voice-v1');
    const e = JSON.parse(new TextDecoder().decode(st.get('https://example.test/game/voices/ja-JP/__rbn_voice_meta__.json').body)).e;
    const recKeys = [...st.keys()].filter((u) => /\/rec\//.test(u));
    let actual = 0; for (const u of recKeys) actual += st.get(u).body.byteLength;
    check('two_tabs_one_lock_trim_sees_both', actual + recKeys.length * 512 <= 12000 && recKeys.length === Object.keys(e).length && recKeys.every((u) => e[u]), { kept: recKeys.length, bytes: actual, inLedger: Object.keys(e).length });
  }
  {
    // a ledger that cannot be read (a write cut short) is rebuilt from what the cache holds
    const w = world({ cfg: { limitBytes: 1 << 20 } });
    const store = new Map(); w.H.stores.set('rbn-voice-v1', store);
    const old = 'https://example.test/game/voices/ja-JP/rec/narrator/old.000000000000.opus';
    store.set(old, { body: new Uint8Array(3000), headers: { 'x-rbn-bytes': '3000' } });
    store.set('https://example.test/game/voices/ja-JP/__rbn_voice_meta__.json', { body: new TextEncoder().encode('{"v":1,"e":{"'), headers: {} });
    const k = await w.vb.kept();
    check('corrupt_ledger_rebuilt', k.files === 1 && k.bytes === 3000, { kept: k });
  }
  {
    // concurrent first uses of the cache all get it (none is told "no cache" while it opens)
    const w = world({ openDelay: 60 });
    const f0 = w.fileOf('t.linear', 0), f1 = w.fileOf('t.linear', 1);
    await Promise.all([w.vb._.bytes({ f: f0, b: w.H.site.get(f0).length, h: sha(w.H.site.get(f0)) }), w.vb._.bytes({ f: f1, b: w.H.site.get(f1).length, h: sha(w.H.site.get(f1)) })]);
    await delay(100);
    const keys = [...(w.H.stores.get('rbn-voice-v1') || new Map()).keys()].filter((u) => /\/rec\//.test(u));
    check('concurrent_cache_open', keys.length === 2, { kept: keys.length });
  }
  {
    // a full disk: the line still plays; only this cache is trimmed; another project's cache is untouched
    const stores = new Map([['another-project', new Map([['https://example.test/x', { body: new Uint8Array(10), headers: {} }]])]]);
    const w = world({ stores, quota: 7000 });
    for (let n = 0; n < 4; n++) { const f = w.fileOf('t.linear', n), body = w.H.site.get(f); const r = await w.vb._.bytes({ f, b: body.length, h: sha(body) }); if (!r) t.ok(false, 'quota: a line failed to load'); }
    await delay(300);
    check('quota_error_handled_within_own_cache', stores.get('another-project').size === 1, { other: stores.get('another-project').size, mine: (stores.get('rbn-voice-v1') || new Map()).size });
  }

  // ---- F · playable bytes are not held behind an optional write ---------------------------------------------------------
  {
    const w = world();
    w.H.putGate = gate();
    const f = w.fileOf('t.linear', 0), body = w.H.site.get(f);
    let done = false;
    const p = w.vb._.bytes({ f, b: body.length, h: sha(body) }).then((x) => { done = true; return x; });
    await delay(80);
    const before = done;
    w.H.putGate.release(); await p;
    check('audio_not_delayed_by_cache_write', before, { availableBeforeWriteFinished: before });
  }
  {
    const w = world();
    w.H.putGate = gate(); // a write that never finishes
    const l0 = w.say('t.linear', 0);
    const t0 = Date.now();
    const r = await w.vb.playLine(l0, l0, {});
    check('stalled_write_does_not_cost_the_start_budget', r === 'playing' && Date.now() - t0 < 1000, { result: r, ms: Date.now() - t0 });
  }

  // ---- the reference readings' index: not loaded by a scene's start --------------------------------------------------------
  {
    const w = world();
    const g = gate(); w.H.gates.set('rec/*', g);
    w.vb.scene('t.linear');
    await until(() => w.recs().length >= 1); await delay(50);
    const early = w.H.log.some((r) => /idx\/refs/.test(r));
    g.release();
    check('refs_index_deferred_behind_dialogue', !early, { refsWhileLinesLoad: early });
  }

  t.log('VR-C1 cases: ' + results.filter((r) => r.ok).length + ' of ' + results.length + ' as intended');
  for (const r of results) t.log((r.ok ? 'ok   ' : 'FAIL ') + r.name);
}
