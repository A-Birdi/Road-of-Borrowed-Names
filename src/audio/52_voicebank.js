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
 * device voice, or stays silent, and play goes on. A kept copy is checked as a fresh one is (size and SHA-256; an
 * index by the hash in its name) before it is used. Writing a copy is never waited for: the line plays from what
 * arrived. The bookkeeping (each kept file's size and last use) is changed one step at a time, under a Web Lock
 * across the game's tabs, by merging each tab's own changes into what is stored; it is checked once a session against
 * what the cache really holds (an interrupted write leaves files it does not list).
 *
 * Looking ahead (VR-C1): from the runner's position (src/engine/70_script.js position()), only the lines that will
 * certainly come next, in order (conditions read without running anything; a called scene, then back to its caller);
 * it stops at a choice, at a condition it cannot know yet (after anything that changes the state), and at a battle,
 * a lesson or anything else that hands the scene to another part of the game. One queue for the whole game, one
 * transfer at a time, within LOOK lines and LOOK_BYTES: a new plan drops what it no longer needs (a transfer for a
 * line no longer ahead is aborted, unless the line on screen is waiting for it), and nothing ahead starts while the
 * line asked for is loading.
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
  // Where the hosted game finds its voice site, relative to the page (docs/hosting/RUNTIME_PUBLISHING.md, 4a): the
  // voices' own Pages repository on the same origin, https://a-birdi.github.io/Road-of-Borrowed-Names-voices/ (Robin,
  // 2026-10-19). Asked only when a line is about to be spoken; a site that does not answer is a passing miss, and
  // Prepared voices then falls back to the device's voice.
  const HOSTED_BASE = '../Road-of-Borrowed-Names-voices/ja-JP/';
  const CACHE = 'rbn-voice-v1';
  const META = '__rbn_voice_meta__.json';
  const START_MS = 2000; // C-83: a prepared clip has about 2 s to start
  const FETCH_MS = 10000;
  const MAX_FILE = 4 * 1024 * 1024;
  const MEM = 16 * 1024 * 1024; // encoded recordings held in memory
  const STORE_MS = 1500; // one Cache Storage step (open, read, write, delete) before it counts as failed
  const HIT_MS = 600; // reading a kept copy for a line: past this the network is asked instead
  const SLOW_MS = 60000; // once a kept copy is that slow to read, the network goes first for this long (VT-1)
  const OVERHEAD = 512; // what one kept entry costs beyond its bytes (its address and headers), in the limit
  const PUTS = 8; // copies being written at once; past this a recording is simply not kept
  const LOCK = 'rbn-voice-v1:ledger'; // the Web Lock the game's tabs share for the bookkeeping
  const S = {
    base: HOSTED_BASE, embedded: null, limit: 150 * 1024 * 1024, look: 3, lookBytes: 1.5 * 1024 * 1024,
    idx: null, scenes: new Map(), refs: null, refsP: null, retry: new Map(),
    mem: new Map(), inflight: new Map(), fails: new Map(),
    cache: null, cacheP: null, meta: { v: 1, e: {} }, delta: { put: new Map(), del: new Set() }, chain: Promise.resolve(), metaTimer: 0, puts: 0, slowUntil: 0,
    gen: 0, fg: 0, el: null, url: null, played: new Set(), log: [], requests: 0, plan: [],
  };
  // the one speculative queue: its lifetime (a newer plan or a stop ends the older), what is queued, what is running
  const Q = { life: 0, items: [], active: 0, shardBusy: false };
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
    S.idx = null; S.scenes.clear(); S.refs = null; S.refsP = null; S.retry.clear();
  }
  // a passing failure (the index, a scene's index) is asked again after a back-off: 1 s, 2 s, 4 s … up to a minute
  function backoff(k) {
    const r = S.retry.get(k) || { n: 0, until: 0 };
    r.n++;
    r.until = Date.now() + Math.min(60000, 1000 * Math.pow(2, r.n - 1));
    S.retry.set(k, r);
  }
  const waiting = (k) => { const r = S.retry.get(k); return !!(r && r.until > Date.now()); };

  // ---- the game's own cache (Cache Storage), with its own LRU bookkeeping inside it -------------------------------
  // Opened once, shared by every caller (none is told "no cache" while it opens); a cache that would not open is
  // tried again a while later.
  function cache() {
    if (!S.cacheP) S.cacheP = open();
    return S.cacheP;
  }
  async function open() {
    const later = () => { setTimeout(() => { if (!S.cache) S.cacheP = null; }, 30000); return null; };
    try {
      if (!hosted() || !G.caches || !G.caches.open) return null;
      const c = await timeout(G.caches.open(CACHE), STORE_MS);
      if (!c) { note('cache-unavailable', { why: 'timeout' }); return later(); }
      S.cache = c;
      ledger(() => settle(c, true)); // this session's check of the bookkeeping against what is kept
      return c;
    } catch (e) {
      note('cache-unavailable', { why: String((e && e.message) || e) });
      return later();
    }
  }
  // every change to the bookkeeping, one at a time in this tab and under one Web Lock across the game's tabs (where
  // the browser has none, one at a time in this tab, each a fresh read, merge and write)
  function ledger(fn) {
    const run = () => locked(fn).catch((e) => note('ledger-failed', { why: String((e && e.message) || e) }));
    S.chain = S.chain.then(run, run);
    return S.chain;
  }
  async function locked(fn) {
    const L = G.navigator && G.navigator.locks;
    if (!L || typeof L.request !== 'function') return fn();
    const ac = typeof AbortController === 'function' ? new AbortController() : null;
    const t = setTimeout(() => ac && ac.abort(), 4000); // (another tab holding it that long: this round is skipped)
    try { return await L.request(LOCK, ac ? { signal: ac.signal } : {}, () => fn()); } catch (e) { if (e && e.name === 'AbortError') { note('ledger-busy', {}); return undefined; } throw e; } finally { clearTimeout(t); }
  }
  async function readLedger(c) {
    try {
      const r = await timeout(c.match(abs(META)), STORE_MS);
      const m = r ? JSON.parse(await timeout(r.text(), STORE_MS)) : null;
      return m && m.v === 1 && m.e && typeof m.e === 'object' ? m : null;
    } catch (e) { return null; }
  }
  async function writeLedger(c, m) {
    try { return !!(await timeout(c.put(abs(META), new Response(JSON.stringify(m), { headers: { 'content-type': 'application/json' } })).then(() => true), STORE_MS)); } catch (e) { note('meta-failed', {}); return false; }
  }
  // the stored bookkeeping, this tab's changes merged into it, checked against what the cache holds (`full`: once a
  // session, or when nothing readable is stored), trimmed to the limit, written back
  async function settle(c, full, squeeze) {
    let m = await readLedger(c);
    if (!m || full) m = await reconcile(c, m || { v: 1, e: {} });
    const put = S.delta.put, del = S.delta.del;
    S.delta = { put: new Map(), del: new Set() };
    for (const [u, v] of put) { const o = m.e[u]; m.e[u] = [v[0], Math.max(v[1], o ? o[1] : 0)]; }
    for (const u of del) delete m.e[u];
    await trimIn(c, m, squeeze);
    if (!(await writeLedger(c, m))) { for (const [u, v] of put) if (!S.delta.put.has(u)) S.delta.put.set(u, v); for (const u of del) S.delta.del.add(u); }
    // (what this tab changed while that ran stays in the view)
    for (const [u, v] of S.delta.put) m.e[u] = v;
    for (const u of S.delta.del) delete m.e[u];
    S.meta = m;
  }
  // what is really kept: a file the bookkeeping does not list (a write cut short, or not yet recorded by another tab)
  // is counted by its size header (else measured, a few per session) and goes first; an entry for a file that is gone
  // is dropped
  async function reconcile(c, m) {
    const reqs = await timeout(c.keys(), 3 * STORE_MS);
    if (!reqs) return m;
    const meta = abs(META), have = new Set();
    let measured = 0;
    for (const q of reqs) {
      const u = typeof q === 'string' ? q : q.url;
      if (u === meta) continue;
      have.add(u);
      if (m.e[u]) continue;
      let n = 0;
      try {
        const r = await timeout(c.match(q), STORE_MS);
        if (r) n = +r.headers.get('x-rbn-bytes') || 0;
        if (r && !n && measured < 64) { measured++; const b = await timeout(r.arrayBuffer(), STORE_MS); n = b ? b.byteLength : 0; }
      } catch (e) { n = 0; }
      if (n > 0) { m.e[u] = [n, 0]; note('unlisted', { url: u.slice(-40) }); }
      else { try { await timeout(c.delete(q), STORE_MS); } catch (e) { /* tried again next session */ } } // (only a copy)
    }
    for (const u of Object.keys(m.e)) if (!have.has(u)) delete m.e[u];
    return m;
  }
  // least recently used out first, down to 80 % of the limit (`squeeze`, after the browser refused a write: to half of
  // what is kept); only this cache's own entries
  async function trimIn(c, m, squeeze) {
    const cost = (v) => v[0] + OVERHEAD;
    let total = 0;
    for (const v of Object.values(m.e)) total += cost(v);
    if (total <= S.limit && !squeeze) return;
    const goal = squeeze ? Math.min(S.limit * 0.8, total * 0.5) : S.limit * 0.8;
    for (const [url, v] of Object.entries(m.e).sort((a, b) => a[1][1] - b[1][1])) {
      if (total <= goal) break;
      let gone;
      try { gone = await timeout(c.delete(url).then(() => true), STORE_MS); } catch (e) { gone = false; }
      if (!gone) continue; // (stays counted until next time)
      delete m.e[url];
      total -= cost(v);
      note('evict', { url: url.slice(-40) });
    }
  }
  function touch(url, bytes) {
    const v = [bytes, Date.now()];
    S.meta.e[url] = v;
    S.delta.put.set(url, v);
    S.delta.del.delete(url);
    later();
  }
  function forget(url) {
    delete S.meta.e[url];
    S.delta.put.delete(url);
    S.delta.del.add(url);
    later();
  }
  function later() { clearTimeout(S.metaTimer); S.metaTimer = setTimeout(flush, 1500); }
  function flush() {
    clearTimeout(S.metaTimer);
    return ledger(() => (S.cache && (S.delta.put.size || S.delta.del.size) ? settle(S.cache, false) : undefined));
  }
  // a copy kept for next time, never waited for by the line: written in the background, recorded once it is in
  function persist(c, url, b, type) {
    if (S.puts >= PUTS) { note('cache-busy', {}); return; }
    S.puts++;
    const put = () => c.put(url, new Response(b.slice(0), { headers: { 'content-type': type, 'x-rbn-bytes': String(b.byteLength) } }));
    put().catch((e) => {
      if (!e || e.name !== 'QuotaExceededError') throw e;
      note('cache-full', {});
      return ledger(() => settle(c, false, true)).then(put);
    }).then(() => touch(url, b.byteLength), (e) => note('cache-put-failed', { why: String((e && e.name) || e) })).finally(() => { S.puts--; });
  }
  function dropKept(c, url) {
    S.mem.delete(url);
    forget(url);
    try { c.delete(url).catch(() => {}); } catch (e) { /* tried again when it is next read */ }
  }
  async function clearKept() {
    const c = await cache();
    if (!c) return false;
    let ok = false;
    await ledger(async () => {
      try {
        const reqs = await timeout(c.keys(), 3 * STORE_MS);
        if (!reqs) return;
        for (const q of reqs) await timeout(c.delete(q), STORE_MS);
        ok = true;
      } catch (e) { return; }
      S.meta = { v: 1, e: {} };
      S.delta = { put: new Map(), del: new Set() };
    });
    S.mem.clear();
    return ok;
  }
  async function kept() {
    await cache();
    await flush();
    let bytes = 0, n = 0;
    for (const v of Object.values(S.meta.e)) { bytes += v[0]; n++; }
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
    // (o.signal: the speculative queue no longer needs it)
    if (o.signal && ac) { if (o.signal.aborted) ac.abort(); else o.signal.addEventListener('abort', () => ac.abort(), { once: true }); }
    try {
      S.requests++;
      note('fetch', { url: url.slice(-60) });
      const resp = await fetch(url, { signal: ac && ac.signal, redirect: 'error', credentials: 'same-origin', cache: o.revalidate ? 'no-cache' : 'default' });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      if (resp.type && resp.type !== 'basic' && resp.type !== 'default') throw new Error('not same-origin');
      return await readCapped(resp, o.max || MAX_FILE);
    } finally { clearTimeout(t); }
  }
  // immutable files (content-named): cache first; the site's index: the network first, the cache if it fails. Every
  // file is checked before it is used, kept or fresh: its size and SHA-256 when the index gives them (a recording), or
  // the hash its name carries (an index, <name>.<sha12>.json). A kept copy that fails is removed and fetched again.
  // (the browser's own digest where it has one: the reference index is about 1.9 MB, ~70 ms for the page's own hash on
  // a desktop and more on a phone)
  async function digest(b) {
    const sub = G.crypto && G.crypto.subtle;
    if (sub && typeof sub.digest === 'function') {
      try { return Array.from(new Uint8Array(await sub.digest('SHA-256', b)), (x) => x.toString(16).padStart(2, '0')).join(''); } catch (e) { /* the page's own, below */ }
    }
    return sha256(b);
  }
  async function get(rel, o) {
    o = o || {};
    const url = abs(rel);
    const m12 = !o.sha && /\.([0-9a-f]{12})\.json$/.exec(rel);
    const good = async (b) => {
      if (o.bytes && b.byteLength !== o.bytes) return false;
      if (!o.sha && !m12) return true;
      const h = await digest(b);
      return o.sha ? h === o.sha : h.slice(0, 12) === m12[1];
    };
    // A slow store is not waited on twice for one line (VT-1: with every read 3 s late, the index, the scene's index and
    // the recording each waited their own timeout, 1.5–2.2 s in all, past the 2 s a clip has to start): a file asked
    // for fresh (the site's index) goes to the network without waiting for the store to open, the store is only
    // asked again after the network fails; and once a kept copy is too slow to read, the network goes first for a
    // minute (copies are still kept, and read again after).
    // (a cache still opening is not waited for long: this file comes from the network, later ones from the cache)
    const c = o.revalidate ? S.cache : (await timeout(cache(), 400)) || null;
    let late = !!(c && !o.revalidate && Date.now() < S.slowUntil); // the kept copy was not read (or not in time)
    if (c && !o.revalidate && !late) {
      try {
        const hit = await timeout(c.match(url).then((r) => r || null), HIT_MS);
        if (hit === undefined) { late = true; S.slowUntil = Date.now() + SLOW_MS; note('cache-slow', { url: url.slice(-40) }); }
        const b = hit ? await timeout(hit.arrayBuffer(), HIT_MS) : null;
        if (b && (await good(b))) { touch(url, b.byteLength); return b; }
        if (b) { note('kept-bad', { url: url.slice(-40) }); dropKept(c, url); }
      } catch (e) { note('cache-miss', { why: 'error' }); }
    }
    let b;
    try {
      b = await net(url, o);
    } catch (e) {
      // offline, or the site unreachable: a kept copy that was passed over (fresh asked, or the store slow) is better than nothing
      const kept = o.revalidate ? (await timeout(cache(), 400)) || null : c;
      if (kept && (o.revalidate || late) && !(o.signal && o.signal.aborted)) {
        try { const hit = await timeout(kept.match(url), late ? STORE_MS : HIT_MS); const b2 = hit ? await timeout(hit.arrayBuffer(), STORE_MS) : null; if (b2 && (await good(b2))) return b2; } catch (err) { /* nothing kept */ }
      }
      throw e;
    }
    if (o.bytes && b.byteLength !== o.bytes) throw new Error('size ' + b.byteLength + ' != ' + o.bytes);
    if (!(await good(b))) throw new Error('content hash differs');
    const keep = c || (o.revalidate ? (await timeout(cache(), 400)) || null : null);
    if (keep) persist(keep, url, b, o.type || 'application/octet-stream');
    return b;
  }
  const json = async (rel, o) => JSON.parse(new TextDecoder().decode(await get(rel, Object.assign({ type: 'application/json' }, o))));

  // ---- the site's indexes -------------------------------------------------------------------------------------------
  // A failure to load an index is passing (null now, asked again after a back-off); only a valid index that does not
  // list a scene, or lists no reference readings, is a real absence, and that is remembered.
  const NO_INDEX = 'no voice index';
  function index() {
    if (S.embedded) return Promise.resolve(S.embedded.index);
    if (S.idx) return S.idx;
    if (waiting('index')) return Promise.resolve(null);
    S.idx = json('index.json', { revalidate: true, max: 2 * 1024 * 1024 }).then((ix) => {
      if (!ix || ix.schema !== 'rbn.voice.site/1') throw new Error('not a voice site index');
      note('index', { build: ix.voiceBuild });
      S.retry.delete('index');
      return ix;
    }).catch((e) => { note('index-failed', { why: String((e && e.message) || e) }); backoff('index'); S.idx = null; return null; });
    return S.idx;
  }
  function shard(sceneId) {
    if (S.embedded) return Promise.resolve((S.embedded.scenes && S.embedded.scenes[sceneId]) || null);
    if (S.scenes.has(sceneId)) return S.scenes.get(sceneId);
    if (waiting('s:' + sceneId)) return Promise.resolve(null);
    const p = index().then((ix) => {
      if (!ix) throw new Error(NO_INDEX);
      return ix.scenes && ix.scenes[sceneId] ? json(ix.scenes[sceneId], { max: 8 * 1024 * 1024 }) : null;
    }).then((sh) => {
      const done = Promise.resolve(sh);
      done.value = sh;
      S.scenes.set(sceneId, done);
      S.retry.delete('s:' + sceneId);
      return sh;
    }, (e) => {
      if (S.scenes.get(sceneId) === p) S.scenes.delete(sceneId);
      if (!(e && e.message === NO_INDEX)) { note('scene-index-failed', { scene: sceneId, why: String((e && e.message) || e) }); backoff('s:' + sceneId); } // (the index keeps its own back-off)
      return null;
    });
    S.scenes.set(sceneId, p);
    return p;
  }
  function refs() {
    if (S.embedded) return Promise.resolve(S.embedded.refs || null);
    if (S.refs) return Promise.resolve(S.refs);
    if (S.refsP) return S.refsP;
    if (waiting('refs')) return Promise.resolve(null);
    S.refsP = index().then((ix) => {
      if (!ix) throw new Error(NO_INDEX);
      return ix.refs ? json(ix.refs, { max: 8 * 1024 * 1024 }) : {};
    }).then((r) => { S.refs = r || {}; S.retry.delete('refs'); return S.refs; }, (e) => {
      S.refsP = null;
      if (!(e && e.message === NO_INDEX)) { note('refs-index-failed', { why: String((e && e.message) || e) }); backoff('refs'); }
      return null;
    });
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
  // the playing line stops (a new line, Voice again, a reading); what is queued ahead stays
  function halt() { S.gen++; release(); }
  // stop(): the reader moved on, the scene closed, the settings changed: playing stops and the queue ahead is dropped
  // (a transfer already running may finish: it is most often the next line; when nothing can be heard any more, or
  // the voices are off, it is aborted too)
  function stop() { halt(); drop(!active() ? 'off' : !audible() ? 'silent' : false); }
  async function sourceOf(e, budget) {
    if (S.embedded) return { src: new URL(e.f, new URL(S.embedded.base, G.location.href)).href };
    // the line asked for comes first: nothing ahead starts while it loads
    S.fg++;
    let b;
    try { b = await timeout(bytes(e), budget); } finally { S.fg--; pump(); }
    if (!b) return null;
    S.url = URL.createObjectURL(new Blob([b], { type: 'audio/ogg' }));
    return { src: S.url };
  }
  // one recording's bytes: from memory, the transfer already running for it (shared; once a line waits for it, it is
  // never aborted), the cache, or the network. o.spec: asked by the queue ahead (abortable).
  function bytes(e, o) {
    o = o || {};
    const url = abs(e.f);
    const m = S.mem.get(url);
    if (m) { m.used = Date.now(); return Promise.resolve(m.b); }
    const run = S.inflight.get(url);
    if (run) { if (!o.spec) run.fg = true; return run.p; }
    const f = S.fails.get(url);
    if (f && f.until > Date.now()) return Promise.resolve(null);
    const job = { url, fg: !o.spec, cancelled: false, ac: typeof AbortController === 'function' ? new AbortController() : null };
    job.p = get(e.f, { bytes: e.b, sha: e.h, type: 'audio/ogg', max: Math.min(MAX_FILE, (e.b || MAX_FILE) + 64), signal: job.ac && job.ac.signal }).then((b) => {
      S.mem.set(url, { b, used: Date.now() });
      let total = 0;
      for (const v of S.mem.values()) total += v.b.byteLength;
      if (total > MEM) for (const [k, v] of Array.from(S.mem.entries()).sort((x, y) => x[1].used - y[1].used)) { if (total <= MEM) break; S.mem.delete(k); total -= v.b.byteLength; }
      S.fails.delete(url);
      return b;
    }).catch((err) => {
      if (job.cancelled) { note('ahead-aborted', { url: url.slice(-40) }); return null; } // (not a failure of the file)
      const g = S.fails.get(url) || { n: 0, until: 0 };
      g.n++;
      if (g.n >= 2) g.until = Date.now() + 5 * 60 * 1000;
      S.fails.set(url, g);
      note('fail', { url: url.slice(-40), why: String((err && err.message) || err) });
      return null;
    }).finally(() => { if (S.inflight.get(url) === job) S.inflight.delete(url); });
    S.inflight.set(url, job);
    return job.p;
  }
  function abortJob(job, why) {
    if (job.fg || job.cancelled) return;
    job.cancelled = true;
    note('abort', { url: job.url.slice(-40), why });
    if (S.inflight.get(job.url) === job) S.inflight.delete(job.url);
    if (job.ac) job.ac.abort();
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
    halt();
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
    halt();
    const gen = S.gen, t0 = Date.now();
    if (!active() || !audible()) return 'none';
    const r = await timeout(refs(), START_MS);
    if (gen !== S.gen) return 'cancelled';
    const k = r ? keys(key).find((x) => r[x]) : null;
    return playEntry(k ? r[k] : null, gen, t0, o);
  }

  // ---- looking ahead: the lines that will certainly come next, fetched (never decoded or played) ---------------------
  const autoOn = () => vs().autoRec !== false;
  // commands that change neither the state a condition reads nor where the scene goes
  const INERT = new Set(['gesture', 'look', 'pose', 'prop', 'beat', 'ambience', 'music', 'sfx', 'emote', 'face', 'faceplayer', 'wait', 'fade', 'interlude', 'shot', 'shake', 'speakerless', 'refresh', 'card', 'toast']);
  // commands that may change what a condition reads; the scene still goes on to the next command
  const CHANGES = new Set(['set', 'unset', 'var', 'give', 'take', 'word', 'technique', 'note', 'quest', 'journal', 'checkpoint', 'chapter', 'travel', 'heal', 'postgame', 'autosave', 'walkto', 'move', 'warp', 'sequence']);
  // The runner's way through the scene, read and never run (src/engine/70_script.js exec): from `stack` (innermost
  // frame first: { sceneId, pc: the next command, called }), up to `max` lines that will be shown, in order. A condition
  // is read (RB.state.peek: plain reads only) while nothing on the way could have changed it; a choice, a condition
  // that cannot be known yet, and anything that hands the scene to another part of the game (a battle, a challenge, a
  // lesson, a shop, a hook, a recruit …) end the plan there.
  function plan(stack, max) {
    const s = RB.game && RB.game.s;
    let known = !!(s && RB.state && RB.state.peek);
    // true / false when it can be known now without touching anything (RB.state.peek), else null
    const read = (cond) => { if (!known) return null; try { return RB.state.peek(s, cond); } catch (e) { return null; } };
    const out = [];
    const st = [];
    for (const f of stack) { const sc = RB.content.scenes[f.sceneId]; if (!sc) break; st.push({ sc, pc: f.pc, called: !!f.called }); }
    const to = (f, label) => {
      if (label === 'end') { f.pc = f.sc.cmds.length; return true; }
      const p = f.sc.labels && f.sc.labels[label];
      if (p == null) return false;
      f.pc = p;
      return true;
    };
    let steps = 0;
    while (st.length && out.length < max && steps++ < 500) {
      const f = st[0], cmds = f.sc.cmds || [];
      if (f.pc >= cmds.length) {
        // a called scene returns to its caller, which marks it seen; a scene run on its own ends here
        if (!f.called) break;
        st.shift();
        known = false;
        continue;
      }
      const c = cmds[f.pc++], a = c.args || [];
      if (c.if) { const v = read(c.if); if (v === null) break; if (!v) continue; }
      if (c.op === 'say') { if (c.jp && !/\$\w+/.test(c.jp)) out.push({ sceneId: f.sc.id, c }); continue; }
      if (c.op === 'end') { f.pc = cmds.length; continue; }
      if (c.op === 'goto') { if (to(f, a[0])) continue; break; }
      if (c.op === 'if') {
        const i = a.indexOf('->');
        const v = i < 0 ? null : read(a.slice(0, i).join(' '));
        if (v === null) break;
        if (v && !to(f, a[i + 1])) break;
        continue;
      }
      if (c.op === 'call') { const sub = RB.content.scenes[a[0]]; if (!sub) continue; if (st.length >= 4) break; st.unshift({ sc: sub, pc: 0, called: true }); continue; }
      if (INERT.has(c.op)) continue;
      if (CHANGES.has(c.op)) { known = false; continue; }
      break;
    }
    return out;
  }
  // where the runner is for the line on screen: its own frames when they agree with the line (and the callers a
  // called scene returns to), else the line found in its scene
  function position(source) {
    const sc = RB.content.scenes[source.sceneId];
    if (!sc) return null;
    const pos = RB.script && RB.script.position ? RB.script.position() : null;
    if (pos && pos.length && pos[0].sceneId === source.sceneId) {
      const c = sc.cmds[pos[0].pc - 1];
      if (c && c.jp === source.jp && (source.line == null || c.line === source.line)) {
        const out = [pos[0]];
        for (let i = 1; i < pos.length && pos[i - 1].called; i++) out.push(pos[i]);
        return out;
      }
    }
    const at = (sc.cmds || []).findIndex((c) => c.jp === source.jp && (source.line == null || c.line === source.line));
    return at < 0 ? null : [{ sceneId: source.sceneId, pc: at + 1, called: false }];
  }
  function scene(sceneId) {
    if (!active() || !audible()) return;
    S.usedScene = null;
    drop(false); // (what was queued for another scene is not this one's)
    if (S.embedded || S.look <= 0 || !autoOn()) { shard(sceneId); return; }
    ahead([{ sceneId, pc: 0, called: false }]);
  }
  function lookahead(display, source) {
    if (!active() || !audible() || !source || !source.sceneId || S.embedded || S.look <= 0) return;
    if (!(autoOn() || S.usedScene === source.sceneId)) return;
    const stack = position(source);
    if (!stack) return;
    // the line on screen keeps its own transfer (it may be about to play it)
    const w = wanted(display, source), have = S.scenes.get(source.sceneId);
    const cur = w && !w.silent && have && 'value' in have ? pick(have.value, w) : null;
    ahead(stack, cur ? abs(cur.f) : null);
  }
  // the plan's recordings (the selected speaker, dialect, voice and pitch), within S.look lines and S.lookBytes, become
  // the queue; an older plan still waiting for an index is dropped
  async function ahead(stack, keep) {
    const life = ++Q.life;
    const lines = plan(stack, S.look);
    const s = RB.game && RB.game.s;
    const items = [];
    let total = 0;
    for (const l of lines) {
      const who = l.c.who === 'comp' ? (s && (s.comp || s.provisional)) || 'narr' : l.c.who;
      const source = { sceneId: l.sceneId, jp: l.c.jp, who, line: l.c.line };
      const display = RB.dialect && RB.dialect.line ? RB.dialect.line(who, source) : source;
      const w = wanted(display, source);
      if (!w || w.silent) continue;
      const have = S.scenes.get(l.sceneId);
      let sh = have && 'value' in have ? have.value : undefined;
      if (sh === undefined) {
        // the scene being played may always load its index; another scene's (a called one), one at a time
        const own = l.sceneId === stack[0].sceneId;
        if (!own && Q.shardBusy) break;
        if (!own) Q.shardBusy = true;
        try { sh = await shard(l.sceneId); } finally { if (!own) Q.shardBusy = false; }
        if (life !== Q.life) return;
      }
      const e = pick(sh, w);
      if (!e) continue;
      if (total + (e.b || 0) > S.lookBytes) break;
      total += e.b || 0;
      items.push(e);
    }
    if (life !== Q.life || !active() || !audible()) return;
    S.plan = items.map((e) => e.f);
    // a transfer for a line no longer ahead is aborted (not one a line on screen waits for)
    const want = new Set(items.map((e) => abs(e.f)));
    if (keep) want.add(keep);
    for (const j of Array.from(S.inflight.values())) if (!j.fg && !want.has(j.url)) abortJob(j, 'not ahead');
    Q.items = items;
    pump();
  }
  // one transfer ahead at a time, and none while the line asked for is loading
  function pump() {
    while (Q.active < 1 && Q.items.length && !S.fg) {
      if (!active() || !audible()) { Q.items = []; return; }
      const e = Q.items.shift(), url = abs(e.f);
      if (S.mem.has(url) || S.inflight.has(url)) continue;
      Q.active++;
      bytes(e, { spec: true }).finally(() => { Q.active--; pump(); });
    }
    if (!Q.items.length && !Q.active && !S.fg) idle();
  }
  // the queue emptied (a newer plan will fill it); `abort`: its transfers stop too
  function drop(abort) {
    Q.life++;
    Q.items = [];
    if (abort) for (const j of Array.from(S.inflight.values())) abortJob(j, abort);
  }
  // nothing to do ahead and nothing waited for: the reference readings' index, so a learning control has it at hand
  // (it is never loaded before the scene's own lines, and asked for at once by a control that needs it)
  function idle() {
    if (S.embedded || S.refs || S.refsP || !S.idx || waiting('refs') || !active() || !audible()) return;
    refs();
  }

  async function status() {
    const ix = configured() && (S.embedded || S.idx) ? await index() : null;
    return {
      mode: mode(), configured: configured(), hosted: hosted(), embedded: !!S.embedded, opus: canPlay(), active: active(),
      voiceBuild: ix ? ix.voiceBuild : null, timing: ix ? ix.timing || 'estimated' : null, kept: S.embedded ? null : await kept(), requests: S.requests,
      ahead: { queued: Q.items.length, running: Q.active, plan: S.plan.length },
    };
  }
  if (RB.audio && RB.audio._ && RB.audio._.hooks) {
    RB.audio._.hooks.mute.push((muted) => { if (muted) stop(); });
    RB.audio._.hooks.vol.push(() => { const v = volume(); if (v <= 0) stop(); else if (S.el) S.el.volume = v; });
  }
  // a campaign left (title, load, new journey): nothing of it is fetched any more
  if (RB.bus && RB.bus.on) RB.bus.on('campaign:changing', () => { halt(); drop('campaign'); });
  if (G.addEventListener) G.addEventListener('pagehide', () => { stop(); flush(); });
  return {
    configure, active, audible, scene, lineFor, hasLine, playLine, lookahead, hasRef, playRef, stop, clearKept, kept, status,
    sha256, spokenOf, keyOf, mode, configured,
    _: { S, Q, wanted, pick, index, shard, refs, bytes, get, cache, flush, plan, position, CACHE, META },
  };
})();
