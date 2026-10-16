/* Prepared voices: the game's recorded lines and reference readings (C-83, C-91, C-93; Robin 2026-10-16: "plays the
 * selected cast without installing Japanese system voices, manually importing a voicebank, or downloading the entire
 * corpus before play"). docs/future/voice/production/VOICE_RUNTIME.md.
 *
 * Where the recordings come from:
 *  - the hosted game (http/https) with a voice site configured (HOSTED_BASE, a path relative to the page on the same
 *    origin): the site's small index, then one index per scene as it begins, then each recording when it is about to
 *    be needed; nothing is fetched before play, and a standalone copy of index.html (file:) never asks for anything;
 *  - an offline voiced package (tools/publish/offline_package.mjs): its page embeds the site's index and plays the
 *    recordings from the folder beside it.
 * Recordings are named by their content (rec/<speaker>/<id>.<sha12>.opus), so a recording that did not change keeps
 * its address across game and voice updates, and anything kept for it stays good.
 *
 * Kept on the device: the encoded recordings and the indexes go into one Cache Storage cache of the game's own
 * ("rbn-voice-v1"), bounded (LIMIT, least recently used out first). Only that cache is ever opened, trimmed or
 * cleared: never another cache of this origin (other projects share a-birdi.github.io), never the saves (IndexedDB /
 * localStorage), never anything else. Any failure of the cache is a miss: the line is fetched, or played from the
 * device voice, or stays silent, and play goes on.
 *
 * Respected: the voice mode (Prepared / Device / None), Mute, the master and voice levels (silent: nothing is
 * fetched), the player's Voice A / B / None and High / Low, Suzu's Kansai, the companion who travels with you. A
 * recording plays only when the displayed line's spoken text hashes to the recording's (textHash): a line changed since
 * it was recorded is never played as "close enough". A recording has START_MS to begin, else the caller falls back.
 *
 * API: configure(o), active(), audible(), scene(id), lineFor(display, source) → Promise<entry|null>,
 *      hasLine(display, source) → true|false|null, playLine(display, source, opts) → Promise<'playing'|'none'|
 *      'silent'|'cancelled'>, lookahead(display, source), hasRef(key), playRef(key, opts), stop(), clearKept(),
 *      status(), sha256(textOrBytes), spokenOf(jp), keyOf(sceneId, jp), _ (tests). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.voicebank = (function () {
  'use strict';
  const G = globalThis;
  // Where the hosted game finds its voice site, relative to the page (docs/hosting/RUNTIME_PUBLISHING.md: Robin's
  // choice). null: no voice site yet; Prepared voices then falls back to the device's voice for every line.
  const HOSTED_BASE = null;
  const CACHE = 'rbn-voice-v1';
  const META = '__rbn_voice_meta__.json';
  const START_MS = 2000; // C-83: a prepared clip has about 2 s to start
  const FETCH_MS = 10000;
  const MAX_FILE = 4 * 1024 * 1024;
  const MEM = 16 * 1024 * 1024; // encoded recordings held in memory
  const S = {
    base: HOSTED_BASE, embedded: null, limit: 150 * 1024 * 1024, look: 3, lookBytes: 1.5 * 1024 * 1024,
    idx: null, scenes: new Map(), refs: null, refsP: null,
    mem: new Map(), inflight: new Map(), fails: new Map(),
    cache: undefined, meta: null, metaDirty: false, metaTimer: 0,
    gen: 0, el: null, url: null, played: new Set(), log: [], requests: 0,
  };
  // the voiced offline package embeds its site's indexes (tools/publish/offline_package.mjs)
  if (G.__RBN_VOICE_EMBED__ && G.__RBN_VOICE_EMBED__.schema === 'rbn.voice.site/1') S.embedded = G.__RBN_VOICE_EMBED__;
  const note = (k, d) => { S.log.push(Object.assign({ k, t: Date.now() }, d || {})); if (S.log.length > 60) S.log.shift(); };

  // ---- SHA-256 (synchronous: line keys, text hashes, and checking a downloaded recording, also from file:) ------
  const KK = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
  function sha256(input) {
    const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
    const l = bytes.length, n = ((l + 9 + 63) >> 6) << 6;
    const m = new Uint8Array(n);
    m.set(bytes);
    m[l] = 0x80;
    const dv = new DataView(m.buffer);
    dv.setUint32(n - 4, (l * 8) >>> 0);
    dv.setUint32(n - 8, Math.floor(l / 0x20000000));
    const h = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
    const w = new Uint32Array(64);
    const r = (x, k) => (x >>> k) | (x << (32 - k));
    for (let o = 0; o < n; o += 64) {
      for (let i = 0; i < 16; i++) w[i] = dv.getUint32(o + i * 4);
      for (let i = 16; i < 64; i++) {
        const a = w[i - 15], b = w[i - 2];
        w[i] = (w[i - 16] + (r(a, 7) ^ r(a, 18) ^ (a >>> 3)) + w[i - 7] + (r(b, 17) ^ r(b, 19) ^ (b >>> 10))) >>> 0;
      }
      let a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], k = h[7];
      for (let i = 0; i < 64; i++) {
        const t1 = (k + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + KK[i] + w[i]) >>> 0;
        const t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
        k = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      h[0] += a; h[1] += b; h[2] += c; h[3] += d; h[4] += e; h[5] += f; h[6] += g; h[7] += k;
    }
    return Array.from(h, (x) => x.toString(16).padStart(8, '0')).join('');
  }
  // the same as tools/voice/lines.mjs and tools/voice/production_manifest.mjs
  const keyOf = (sceneId, jp) => sceneId + '#' + sha256(String(jp)).slice(0, 10);
  const spokenOf = (jp) => String(RB.jp.plain(jp)).replace(/\s+/g, '').normalize('NFC');

  // ---- settings and state ---------------------------------------------------------------------------------------
  const vs = () => (RB.game && RB.game.settings && RB.game.settings.voice) || {};
  const mode = () => (['prepared', 'device', 'none'].includes(vs().mode) ? vs().mode : 'prepared');
  const hosted = () => typeof location !== 'undefined' && /^https?:$/.test(location.protocol);
  const base = () => (S.embedded ? S.embedded.base : hosted() && S.base ? S.base : null);
  const configured = () => !!base();
  const active = () => mode() === 'prepared' && configured() && canPlay();
  function canPlay() {
    if (S.canPlay == null) {
      try { S.canPlay = typeof G.Audio === 'function' && !!new G.Audio().canPlayType('audio/ogg; codecs=opus'); } catch (e) { S.canPlay = false; }
    }
    return S.canPlay;
  }
  function volume() {
    const A = RB.audio;
    if (!A || !A.getVolume) return 1;
    if (A.isMuted && A.isMuted()) return 0;
    const m = A.getVolume('master'), v = A.getVolume('voice');
    return Math.max(0, Math.min(1, (m == null ? 1 : m) * (v == null ? 1 : v)));
  }
  const audible = () => volume() > 0;
  const abs = (rel) => new URL(rel, new URL(base(), G.location.href)).href;
  const timeout = (p, ms) => Promise.race([p, new Promise((res) => setTimeout(() => res(undefined), ms))]);

  function configure(o) {
    o = o || {};
    if ('base' in o) S.base = o.base;
    if ('embedded' in o) S.embedded = o.embedded || null;
    if (o.limitBytes > 0) S.limit = o.limitBytes;
    if (o.lookahead >= 0) S.look = o.lookahead;
    S.idx = null; S.scenes.clear(); S.refs = null; S.refsP = null;
  }

  // ---- the game's own cache (Cache Storage), with its own LRU bookkeeping inside it -------------------------------
  async function cache() {
    if (S.cache !== undefined) return S.cache;
    S.cache = null;
    try {
      if (!hosted() || !G.caches || !G.caches.open) return null;
      const c = await timeout(G.caches.open(CACHE), 1500);
      if (!c) { note('cache-unavailable', { why: 'timeout' }); return null; }
      S.cache = c;
      const r = await timeout(c.match(abs(META)), 1500);
      S.meta = r ? await r.json() : null;
    } catch (e) {
      note('cache-unavailable', { why: String((e && e.message) || e) });
      S.cache = null;
    }
    if (!S.meta || typeof S.meta.e !== 'object') S.meta = { v: 1, e: {} };
    return S.cache;
  }
  function touch(url, bytes) {
    if (!S.meta) return;
    S.meta.e[url] = [bytes, Date.now()];
    S.metaDirty = true;
    clearTimeout(S.metaTimer);
    S.metaTimer = setTimeout(saveMeta, 1500);
  }
  async function saveMeta() {
    const c = S.cache;
    if (!c || !S.metaDirty) return;
    S.metaDirty = false;
    try { await c.put(abs(META), new Response(JSON.stringify(S.meta), { headers: { 'content-type': 'application/json' } })); } catch (e) { note('meta-failed', {}); }
  }
  // least recently used out first, down to 80 % of the limit; only this cache's own entries
  async function trim() {
    const c = S.cache;
    if (!c || !S.meta) return;
    let total = 0;
    for (const v of Object.values(S.meta.e)) total += v[0];
    if (total <= S.limit) return;
    const order = Object.entries(S.meta.e).sort((a, b) => a[1][1] - b[1][1]);
    for (const [url, v] of order) {
      if (total <= S.limit * 0.8) break;
      try { await c.delete(url); } catch (e) { /* a failed delete stays counted until next time */ continue; }
      delete S.meta.e[url];
      total -= v[0];
      note('evict', { url: url.slice(-40) });
    }
    S.metaDirty = true;
    saveMeta();
  }
  async function clearKept() {
    const c = await cache();
    if (!c) return false;
    try { for (const req of await c.keys()) await c.delete(req); } catch (e) { return false; }
    S.meta = { v: 1, e: {} };
    S.mem.clear();
    return true;
  }
  async function kept() {
    await cache();
    let bytes = 0, n = 0;
    if (S.meta) for (const v of Object.values(S.meta.e)) { bytes += v[0]; n++; }
    return { ok: !!S.cache, files: n, bytes, limit: S.limit };
  }

  // ---- reading: a capped, checked same-origin fetch, through the cache ----------------------------------------------
  async function readCapped(resp, max) {
    if (!resp.body || !resp.body.getReader) { const b = await resp.arrayBuffer(); if (b.byteLength > max) throw new Error('too large'); return b; }
    const rd = resp.body.getReader();
    const parts = [];
    let n = 0;
    for (;;) {
      const { done, value } = await rd.read();
      if (done) break;
      n += value.byteLength;
      if (n > max) { try { rd.cancel(); } catch (e) { /* ignore */ } throw new Error('too large'); }
      parts.push(value);
    }
    const out = new Uint8Array(n);
    let o = 0;
    for (const p of parts) { out.set(p, o); o += p.byteLength; }
    return out.buffer;
  }
  async function net(url, o) {
    const ac = typeof AbortController === 'function' ? new AbortController() : null;
    const t = setTimeout(() => ac && ac.abort(), FETCH_MS);
    try {
      S.requests++;
      note('fetch', { url: url.slice(-60) });
      const resp = await fetch(url, { signal: ac && ac.signal, redirect: 'error', credentials: 'same-origin', cache: o.revalidate ? 'no-cache' : 'default' });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      if (resp.type && resp.type !== 'basic' && resp.type !== 'default') throw new Error('not same-origin');
      return await readCapped(resp, o.max || MAX_FILE);
    } finally { clearTimeout(t); }
  }
  // immutable files (content-named): cache first; the site's index: the network first, the cache if it fails
  async function get(rel, o) {
    o = o || {};
    const url = abs(rel);
    const c = await cache();
    if (c && !o.revalidate) {
      try {
        const hit = await timeout(c.match(url), 1500);
        if (hit) { const b = await hit.arrayBuffer(); if (!o.bytes || b.byteLength === o.bytes) { touch(url, b.byteLength); return b; } }
      } catch (e) { note('cache-miss', { why: 'error' }); }
    }
    let b;
    try {
      b = await net(url, o);
    } catch (e) {
      if (c && o.revalidate) { try { const hit = await c.match(url); if (hit) return await hit.arrayBuffer(); } catch (err) { /* nothing kept */ } }
      throw e;
    }
    if (o.bytes && b.byteLength !== o.bytes) throw new Error('size ' + b.byteLength + ' != ' + o.bytes);
    if (o.sha && sha256(b) !== o.sha) throw new Error('content hash differs');
    if (c) {
      try {
        await c.put(url, new Response(b.slice(0), { headers: { 'content-type': o.type || 'application/octet-stream' } }));
        touch(url, b.byteLength);
        trim();
      } catch (e) { note('cache-put-failed', { why: String((e && e.name) || e) }); }
    }
    return b;
  }
  const json = async (rel, o) => JSON.parse(new TextDecoder().decode(await get(rel, Object.assign({ type: 'application/json' }, o))));

  // ---- the site's indexes -------------------------------------------------------------------------------------------
  function index() {
    if (S.embedded) return Promise.resolve(S.embedded.index);
    if (!S.idx) S.idx = json('index.json', { revalidate: true, max: 2 * 1024 * 1024 }).then((ix) => {
      if (!ix || ix.schema !== 'rbn.voice.site/1') throw new Error('not a voice site index');
      note('index', { build: ix.voiceBuild });
      return ix;
    }).catch((e) => { note('index-failed', { why: String((e && e.message) || e) }); S.idxFailedAt = Date.now(); S.idx = null; return null; });
    return S.idx;
  }
  function shard(sceneId) {
    if (S.embedded) return Promise.resolve((S.embedded.scenes && S.embedded.scenes[sceneId]) || null);
    if (!S.scenes.has(sceneId)) {
      S.scenes.set(sceneId, index().then((ix) => (ix && ix.scenes && ix.scenes[sceneId] ? json(ix.scenes[sceneId], { max: 8 * 1024 * 1024 }) : null)).then((sh) => {
        S.scenes.set(sceneId, Promise.resolve(sh));
        S.scenes.get(sceneId).value = sh;
        return sh;
      }).catch(() => { S.scenes.delete(sceneId); return null; }));
    }
    return S.scenes.get(sceneId);
  }
  function refs() {
    if (S.embedded) return Promise.resolve(S.embedded.refs || null);
    if (S.refs) return Promise.resolve(S.refs);
    if (!S.refsP) S.refsP = index().then((ix) => (ix && ix.refs ? json(ix.refs, { max: 8 * 1024 * 1024 }) : null)).then((r) => { S.refs = r; return r; }).catch(() => { S.refsP = null; return null; });
    return S.refsP;
  }

  // ---- which recording says this line -------------------------------------------------------------------------------
  function speakerOf(source) {
    const who = source.who || 'narr';
    if (who === 'narr') return 'narrator';
    if (who === 'comp') { const s = RB.game && RB.game.s; return (s && (s.comp || s.provisional)) || null; }
    return who;
  }
  function wanted(display, source) {
    if (!source || !source.sceneId || !source.jp || /\$\w+/.test(source.jp)) return null;
    const sp = speakerOf(source);
    if (!sp) return null;
    const said = spokenOf((display && display.jp) || source.jp);
    // (a Kansai line that says the same as the standard one was recorded once, as standard)
    const w = { key: keyOf(source.sceneId, source.jp), sp, d: display && display.dia === 'kansai' && said !== spokenOf(source.jp) ? 'k' : 's', th: sha256(said).slice(0, 16) };
    if (sp === 'pc') {
      const v = vs().player;
      if (v !== 'A' && v !== 'B') return { silent: true };
      w.v = v;
      w.p = vs().pitch === 'low' ? 'l' : 'h';
    }
    return w;
  }
  function pick(sh, w) {
    const list = sh && sh.lines && sh.lines[w.key];
    if (!list) return null;
    const e = list.find((x) => x.sp === w.sp && x.d === w.d && (w.sp !== 'pc' || (x.v === w.v && x.p === w.p)));
    return e && e.th === w.th ? e : null; // the displayed line is the line that was recorded, or nothing
  }
  async function lineFor(display, source) {
    const w = wanted(display, source);
    if (!w || w.silent || !configured()) return null;
    return pick(await shard(source.sceneId), w);
  }
  function hasLine(display, source) {
    if (!active()) return false;
    const w = wanted(display, source);
    if (!w) return false;
    if (w.silent) return false;
    const p = S.embedded ? { value: S.embedded.scenes && S.embedded.scenes[source.sceneId] } : S.scenes.get(source.sceneId);
    // (while sound is off nothing is loaded, not even an index: the answer is "not known")
    if (!p || !('value' in p)) { if (audible()) shard(source.sceneId); return null; }
    return !!pick(p.value, w);
  }

  // ---- playing ------------------------------------------------------------------------------------------------------
  function duck(on) { if (RB.audio && RB.audio.duck) RB.audio.duck(on); }
  function release() {
    const el = S.el;
    S.el = null;
    if (el) { try { el.onended = el.onerror = el.onplaying = null; el.pause(); el.removeAttribute('src'); el.load(); } catch (e) { /* ignore */ } duck(false); }
    if (S.url) { try { URL.revokeObjectURL(S.url); } catch (e) { /* ignore */ } S.url = null; }
  }
  function stop() { S.gen++; release(); }
  async function sourceOf(e, budget) {
    if (S.embedded) return { src: new URL(e.f, new URL(S.embedded.base, G.location.href)).href };
    const b = await timeout(bytes(e), budget);
    if (!b) return null;
    S.url = URL.createObjectURL(new Blob([b], { type: 'audio/ogg' }));
    return { src: S.url };
  }
  function bytes(e) {
    const url = abs(e.f);
    const m = S.mem.get(url);
    if (m) { m.used = Date.now(); return Promise.resolve(m.b); }
    if (S.inflight.has(url)) return S.inflight.get(url);
    const f = S.fails.get(url);
    if (f && f.until > Date.now()) return Promise.resolve(null);
    const job = get(e.f, { bytes: e.b, sha: e.h, type: 'audio/ogg', max: Math.min(MAX_FILE, (e.b || MAX_FILE) + 64) }).then((b) => {
      S.mem.set(url, { b, used: Date.now() });
      let total = 0;
      for (const v of S.mem.values()) total += v.b.byteLength;
      if (total > MEM) for (const [k, v] of Array.from(S.mem.entries()).sort((x, y) => x[1].used - y[1].used)) { if (total <= MEM) break; S.mem.delete(k); total -= v.b.byteLength; }
      S.fails.delete(url);
      return b;
    }).catch((err) => {
      const g = S.fails.get(url) || { n: 0, until: 0 };
      g.n++;
      if (g.n >= 2) g.until = Date.now() + 5 * 60 * 1000;
      S.fails.set(url, g);
      note('fail', { url: url.slice(-40), why: String((err && err.message) || err) });
      return null;
    }).finally(() => S.inflight.delete(url));
    S.inflight.set(url, job);
    return job;
  }
  // 'playing' | 'none' (no recording: the caller may use the device's voice) | 'silent' (deliberately unvoiced: the
  // player with Voice None) | 'cancelled' (something newer took over: the caller does nothing)
  async function playEntry(e, gen, t0, o) {
    if (!e) return gen === S.gen ? 'none' : 'cancelled';
    const s = await sourceOf(e, Math.max(50, START_MS - (Date.now() - t0)));
    if (gen !== S.gen) { if (S.url && (!S.el)) { URL.revokeObjectURL(S.url); S.url = null; } return 'cancelled'; }
    if (!s) return 'none';
    const vol = volume();
    if (vol <= 0) { release(); return 'silent'; }
    const el = new G.Audio();
    S.el = el;
    el.preload = 'auto';
    el.volume = vol;
    if (o.rate && o.rate !== 1) { el.playbackRate = o.rate; el.preservesPitch = true; }
    let done = false;
    const fin = (ok) => {
      if (done) return;
      done = true;
      if (S.el === el) release();
      if (typeof o.onend === 'function') { try { o.onend({ spoken: ok, recorded: true }); } catch (err) { /* ignore */ } }
    };
    el.onplaying = () => {
      if (S.el !== el) return;
      if (typeof o.onstart === 'function') { try { o.onstart(); } catch (err) { /* ignore */ } }
      if (typeof o.follow === 'function') { try { o.follow(() => el.currentTime, isFinite(el.duration) && el.duration > 0 ? el.duration : e.t || 0); } catch (err) { /* ignore */ } }
    };
    el.onended = () => fin(true);
    el.onerror = () => { note('play-error', { f: e.f }); fin(false); };
    el.src = s.src;
    duck(true);
    S.played.add(e.id);
    note('play', { id: e.id, f: e.f });
    try {
      const started = await timeout(el.play().then(() => true, () => false), Math.max(300, START_MS - (Date.now() - t0) + 1000));
      if (!started) { if (S.el === el) release(); return gen === S.gen ? 'none' : 'cancelled'; }
    } catch (err) { if (S.el === el) release(); return 'none'; }
    return 'playing';
  }
  async function playLine(display, source, o) {
    o = o || {};
    stop();
    const gen = S.gen, t0 = Date.now();
    if (!active() || !audible()) return 'none';
    const w = wanted(display, source);
    if (w && w.silent) return 'silent';
    const e = await timeout(lineFor(display, source), START_MS);
    if (gen !== S.gen) return 'cancelled';
    const r = await playEntry(e || null, gen, t0, o);
    if (r === 'playing') { S.lastScene = source.sceneId; S.usedScene = source.sceneId; }
    return r;
  }
  // key: one reference key or several to try in order (a listening step: its phrase, else the word it is)
  const keys = (k) => (Array.isArray(k) ? k : [k]).filter(Boolean);
  function hasRef(key) {
    if (!active()) return false;
    const r = S.embedded ? S.embedded.refs : S.refs;
    if (!r) { if (!S.embedded && audible()) refs(); return S.embedded ? false : null; }
    return keys(key).some((k) => !!r[k]);
  }
  async function playRef(key, o) {
    o = o || {};
    stop();
    const gen = S.gen, t0 = Date.now();
    if (!active() || !audible()) return 'none';
    const r = await timeout(refs(), START_MS);
    if (gen !== S.gen) return 'cancelled';
    const k = r ? keys(key).find((x) => r[x]) : null;
    return playEntry(k ? r[k] : null, gen, t0, o);
  }

  // ---- looking ahead: the next few lines of the scene, fetched (never decoded or played) -----------------------------
  const autoOn = () => vs().autoRec !== false;
  function scene(sceneId) {
    if (!active() || !audible()) return;
    S.usedScene = null;
    shard(sceneId).then((sh) => { if (sh) ahead(sceneId, -1); });
    if (!S.embedded) refs();
  }
  function lookahead(display, source) {
    if (!active() || !audible() || !source || !source.sceneId) return;
    const sc = RB.content.scenes[source.sceneId];
    if (!sc) return;
    const at = (sc.cmds || []).findIndex((c) => c.jp === source.jp && (source.line == null || c.line === source.line));
    ahead(source.sceneId, at);
  }
  async function ahead(sceneId, at) {
    if (S.embedded || !(autoOn() || S.usedScene === sceneId) || S.look <= 0) return;
    const sc = RB.content.scenes[sceneId];
    const cmds = (sc && sc.cmds) || [];
    const gen = (S.aheadGen = (S.aheadGen || 0) + 1);
    let n = 0, total = 0;
    for (let i = at + 1; i < cmds.length && n < S.look; i++) {
      const c = cmds[i];
      if (!c.jp || /\$\w+/.test(c.jp)) continue;
      n++;
      const source = { sceneId, jp: c.jp, who: c.who, line: c.line };
      const display = RB.dialect && RB.dialect.line ? RB.dialect.line(source.who, source) : source;
      const e = await lineFor(display, source);
      if (gen !== S.aheadGen || !active() || !audible()) return;
      if (!e || S.mem.has(abs(e.f))) continue;
      if (total + (e.b || 0) > S.lookBytes) return;
      total += e.b || 0;
      await bytes(e);
      if (gen !== S.aheadGen) return;
    }
  }

  async function status() {
    const ix = configured() && (S.embedded || S.idx) ? await index() : null;
    return {
      mode: mode(), configured: configured(), hosted: hosted(), embedded: !!S.embedded, opus: canPlay(), active: active(),
      voiceBuild: ix ? ix.voiceBuild : null, timing: ix ? ix.timing || 'estimated' : null, kept: S.embedded ? null : await kept(), requests: S.requests,
    };
  }
  if (RB.audio && RB.audio._ && RB.audio._.hooks) {
    RB.audio._.hooks.mute.push((muted) => { if (muted) stop(); });
    RB.audio._.hooks.vol.push(() => { if (S.el) { const v = volume(); if (v <= 0) stop(); else S.el.volume = v; } });
  }
  if (G.addEventListener) G.addEventListener('pagehide', () => { stop(); saveMeta(); });
  return {
    configure, active, audible, scene, lineFor, hasLine, playLine, lookahead, hasRef, playRef, stop, clearKept, kept, status,
    sha256, spokenOf, keyOf, mode, configured,
    _: { S, wanted, pick, index, shard, refs, bytes, cache, trim, CACHE, META },
  };
})();
