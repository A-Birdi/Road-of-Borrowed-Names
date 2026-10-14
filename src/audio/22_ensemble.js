/* Music performance: Original and Ensemble (Robin's MT-1; docs/MUSIC_PERFORMANCE.md).
 *
 * Original is the game's own procedural score (20_sequencer.js): always there, offline, in every copy of the game.
 * Ensemble is an optional recorded performance of the same score, for the songs that have one, loaded from static
 * files beside the hosted page (assets/music/ensemble/, listed in the embedded catalog RB.audio.ensembleCatalog).
 * The preference is the player's (settings.musicPerformance); what actually sounds is reported apart from it.
 *
 * One director, two performances of one cue:
 *  - The cue's clock is the Original player's own: score time e = ctx.currentTime - player.anchor0 (the audio clock,
 *    so a suspended context pauses it; no wall time). The score position is e in the first pass, then
 *    L + ((e - D) mod (D - L)) (D the compiled length, L the loop start: Snowbell loops from 0, the Keepers' battle
 *    from its third bar), as in the MT-1 annex.
 *  - Original stays warm while Ensemble sounds: the same player goes on (its notes, its seeded humanisation, its loop
 *    count, its room), unheard behind its own output gain and the music room's return gate (g.revGate). Coming back
 *    reveals it mid-phrase: no restart, no cut chord, no new attacks. Only the current cue is kept warm.
 *  - Ensemble plays two files per format (assets/music/ensemble/<id>/, made by tools/music/ensemble/): a short first
 *    pass from silence up to a join J, and one steady cycle of the repeat [L, D), circular (it holds the tails of the
 *    cycle before), each with guard samples beyond its playable frames. Past J the first pass and the steady cycle are
 *    the same music, so the cue goes over to the cycle there; each cycle is its own source, started on the audio clock
 *    at the score's cycle boundary and crossfaded (XJ) with the one before over matching phases (the guard after a
 *    cycle is the start of the next): the rhythm keeps the score's length, no cycle drifts from the Original's clock,
 *    and a lossy codec's two renderings of the same instant are blended rather than butted. It enters the music bus
 *    before the user's music volume, the ducking and the master chain, as the Original does, with its own room baked in
 *    (it never reaches the game's music room), at a calibrated trim.
 *  - A handover is scheduled on the audio clock: at least LEAD ahead, on the next beat if one comes within BEAT_WAIT,
 *    then a complementary equal-power crossfade of XF seconds (MT-2: the two performances, the same score on different
 *    instruments, are uncorrelated over a fade; MT-1's linear fade sagged about 3 dB at its middle).
 *  - Loading never holds up play: Original sounds at once; the recording replaces it when it is ready and still wanted
 *    (a generation check after every await). Nothing is fetched for Original, with music off or muted, for a song
 *    without an eligible recording, or in a standalone file: copy. Files are same-origin, in the music directory,
 *    content-hashed, size-capped, SHA-256 checked, decoded and measured before use; a failure keeps Original.
 *  - The cue's completion (audio:songend) stays the sequencer's, once; nothing here emits it. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.audio = RB.audio || {};

(function (A) {
  'use strict';
  const _ = (A._ = A._ || {});
  const st = _.st;
  const XF = 0.2; // the crossfade between performances (seconds)
  const XJ = 0.05; // the crossfade at a join or a cycle boundary, over matching phases
  const MAX_PPM = 50; // a steady cycle's length against the score's period
  const LEAD = 0.12; // the earliest handover (the scheduler's lookahead is 0.2 s)
  const BEAT_WAIT = 0.6; // a handover waits for the next beat if it comes this soon
  const TIMEOUT_MS = 15000; // per file
  const MAX_ENCODED = 24 * 1024 * 1024; // per file, enforced while reading
  const RETAIN = 128 * 1024 * 1024; // decoded music kept in memory
  const COOLDOWN_MS = 5 * 60 * 1000; // after a file failed twice
  const DIR = '/assets/music/ensemble/';
  const EXT = /\.(ogg|opus|mp3|wav|flac)$/;
  const PERFS = ['original', 'ensemble'];

  const P = (_.perf = {
    pref: 'original',
    cue: null, // { player, id, gen, entry, fmt, bufs, segs, horizon, timer, gain, trim, active, want, state, retries, at }
    gen: 0,
    cache: new Map(), // sha256 -> { buffer, bytes, used, refs }
    inflight: new Map(), // sha256 -> Promise<AudioBuffer>
    fails: new Map(), // sha256 -> { n, until }
    fp: new Map(), // songId -> Promise<string> (the current score's fingerprint)
    requests: 0, // optional music files requested (tests: none for Original)
    log: [],
  });
  const note = (k, d) => {
    P.log.push(Object.assign({ k, t: Date.now() }, d || {}));
    if (P.log.length > 40) P.log.shift();
  };

  // ---- the catalog ---------------------------------------------------------------------------------------------
  const catalog = () => A.ensembleCatalog || null;
  // a ready entry whose files describe a playable layout for its song's timeline (the build checked this too)
  const span = (r) => r && r.rate > 0 && r.end > r.start && r.start >= 0 && r.end <= r.frames ? (r.end - r.start) / r.rate : 0;
  function entryOf(id) {
    const c = catalog();
    const e = c && c.songs && c.songs[id];
    if (!e || e.releaseStatus !== 'ready' || !Array.isArray(e.formats) || !e.formats.length) return null;
    for (const f of e.formats) {
      if (!span(f.first) || (e.loop && !span(f.loop))) return null;
      if (e.loop && Math.abs(span(f.loop) / (e.durationSec - e.loopStartSec) - 1) * 1e6 > MAX_PPM) return null;
    }
    return e;
  }
  A.ensembleSongs = () => {
    const c = catalog();
    return c && c.songs ? Object.keys(c.songs).filter((id) => entryOf(id)) : [];
  };
  // a standalone copy (file:) never fetches: it plays Original
  const hosted = () => typeof location !== 'undefined' && /^https?:$/.test(location.protocol);
  const musicOn = () => !st.muted && st.vol.master > 0 && st.vol.music > 0;

  // ---- the score's fingerprint (mt1-score-v1, as tools/music/ensemble/fingerprint.mjs computes it at build time) --
  function normalize(v) {
    if (v === null || typeof v === 'string' || typeof v === 'boolean') return v;
    if (typeof v === 'number') {
      if (!isFinite(v)) throw new TypeError('nonfinite');
      const n = Math.round(v * 1e9) / 1e9;
      return Object.is(n, -0) ? 0 : n;
    }
    if (Array.isArray(v)) return v.map(normalize);
    if (v && typeof v === 'object') {
      const r = {};
      for (const k of Object.keys(v).sort()) if (v[k] !== undefined) r[k] = normalize(v[k]);
      return r;
    }
    throw new TypeError('unsupported');
  }
  _.canonicalScore = function (song) {
    const s = JSON.parse(JSON.stringify(song));
    const f = { fingerprintVersion: 'mt1-score-v1' };
    for (const k of ['id', 'length', 'loop', 'loopStart', 'loopIdx', 'bpm', 'echo', 'tracks', 'sections', 'events']) f[k] = s[k] === undefined ? null : s[k];
    return JSON.stringify(normalize(f));
  };
  const hex = (buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  async function sha256(bytes) {
    const c = globalThis.crypto && globalThis.crypto.subtle;
    if (!c) throw new Error('no SubtleCrypto');
    return hex(await c.digest('SHA-256', bytes));
  }
  function fingerprint(id) {
    if (!P.fp.has(id)) {
      P.fp.set(id, (async () => 'sha256:' + (await sha256(new TextEncoder().encode(_.canonicalScore(_.getSong(id))))))().catch((e) => { P.fp.delete(id); throw e; }));
    }
    return P.fp.get(id);
  }

  // ---- the musical clock ---------------------------------------------------------------------------------------
  // elapsed score time at audio time T for a cue's Original player, and where that falls in the score
  function clockAt(p, T) {
    const s = p.song, e = T - p.anchor0;
    const D = s.length, L = s.loopStart;
    if (!s.loop) return { e, pos: Math.min(e, D), cycle: 0, done: e >= D };
    if (e < D) return { e, pos: e, cycle: 0, done: false };
    const Pd = D - L, k = Math.floor((e - D) / Pd);
    let r = e - D - k * Pd;
    if (r < 0) r = 0;
    if (r >= Pd) r = Pd - 1e-9;
    return { e, pos: L + r, cycle: k + 1, done: false };
  }
  _.clockAt = clockAt;
  // the transport, for tests and the status line
  A.transport = function () {
    const p = _.curPlayer && _.curPlayer();
    if (!p || !st.ctx) return null;
    const c = clockAt(p, st.ctx.currentTime);
    return { song: p.song.id, elapsed: c.e, position: c.pos, cycle: c.cycle, done: c.done, length: p.song.length, loopStart: p.song.loopStart, loop: p.song.loop };
  };
  // the handover time: at least LEAD ahead, on the next beat of the section sounding then if it comes soon
  function handoverAt(p) {
    const now = st.ctx.currentTime, T0 = now + LEAD;
    const c = clockAt(p, T0);
    const sec = (p.song.sections || []).find((x) => c.pos >= x.start - 1e-9 && c.pos < x.start + x.seconds + 1e-9);
    if (!sec || !(sec.spb > 0)) return T0;
    const k = Math.ceil((c.pos - sec.start) / sec.spb - 1e-6);
    const wait = sec.start + k * sec.spb - c.pos;
    return wait >= 0 && wait <= BEAT_WAIT ? T0 + wait : T0;
  }

  // ---- loading -----------------------------------------------------------------------------------------------------
  // a catalog reference made into a URL: relative to the page (./assets/music/ensemble/...), http(s), this page's
  // origin, inside the music directory, a known extension; no traversal, encoded separators, query or fragment
  function assetUrl(ref) {
    let raw = String(ref && ref.url || '');
    if (raw.slice(0, 2) === './') raw = raw.slice(2);
    if (!raw || raw.slice(0, 22) !== 'assets/music/ensemble/' || /(^|\/)\.\.?(\/|$)|%|\\|[?#]|^\/|^[a-z][a-z0-9+.-]*:|\/\//i.test(raw)) throw new Error('rejected asset path');
    const u = new URL(raw, document.baseURI);
    if (!/^https?:$/.test(u.protocol) || u.origin !== location.origin) throw new Error('rejected asset origin');
    if (u.pathname.indexOf(DIR) < 0 || !EXT.test(u.pathname)) throw new Error('rejected asset location');
    return u.href;
  }
  async function readCapped(resp, cap, signal) {
    if (!resp.body || !resp.body.getReader) {
      const b = await resp.arrayBuffer();
      if (b.byteLength > cap) throw new Error('too large');
      return b;
    }
    const rd = resp.body.getReader(), parts = [];
    let n = 0;
    for (;;) {
      if (signal.aborted) throw new Error('aborted');
      const { done, value } = await rd.read();
      if (done) break;
      n += value.byteLength;
      if (n > cap) { try { rd.cancel(); } catch (e) { /* ignore */ } throw new Error('too large'); }
      parts.push(value);
    }
    const out = new Uint8Array(n);
    let o = 0;
    for (const p of parts) { out.set(p, o); o += p.byteLength; }
    return out.buffer;
  }
  // fetch, check and decode one file (deduplicated by its hash, cached within the budget)
  function loadAsset(ref, signal) {
    const key = ref.sha256;
    const hit = P.cache.get(key);
    if (hit) { hit.used = Date.now(); return Promise.resolve(hit.buffer); }
    if (P.inflight.has(key)) return P.inflight.get(key);
    const f = P.fails.get(key);
    if (f && f.until > Date.now()) return Promise.reject(new Error('cooling down'));
    const job = (async () => {
      const url = assetUrl(ref);
      const ac = new AbortController();
      const onAbort = () => ac.abort();
      signal.addEventListener('abort', onAbort);
      const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
      try {
        P.requests++;
        note('fetch', { url: ref.url });
        const resp = await fetch(url, { signal: ac.signal, redirect: 'error', credentials: 'same-origin', cache: 'default' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        if (resp.type && resp.type !== 'basic' && resp.type !== 'default') throw new Error('not same-origin');
        const ct = (resp.headers.get('content-type') || '').toLowerCase();
        if (/text\/|html|json|xml/.test(ct)) throw new Error('not audio (' + ct + ')');
        const bytes = await readCapped(resp, Math.min(MAX_ENCODED, (ref.bytes || MAX_ENCODED) + 64), ac.signal);
        if (ref.bytes && bytes.byteLength !== ref.bytes) throw new Error('size ' + bytes.byteLength + ' != ' + ref.bytes);
        const h = await sha256(bytes);
        if (h !== key) throw new Error('content hash differs');
        if (!st.ctx) throw new Error('no audio context');
        const buf = await st.ctx.decodeAudioData(bytes.slice(0));
        // measured, not trusted: two channels, the playable length the catalog states, finite sound
        const want = ref.frames / ref.rate;
        if (buf.numberOfChannels !== 2) throw new Error('channels ' + buf.numberOfChannels);
        if (Math.abs(buf.duration - want) > 0.002 + 2 / buf.sampleRate) throw new Error('decoded ' + buf.duration.toFixed(5) + ' s, catalog ' + want.toFixed(5) + ' s');
        const ch = buf.getChannelData(0);
        let peak = 0;
        for (let i = 0; i < ch.length; i += 97) { const v = ch[i]; if (!isFinite(v)) throw new Error('nonfinite audio'); if (Math.abs(v) > peak) peak = Math.abs(v); }
        if (!(peak > 1e-4)) throw new Error('silent audio');
        const bytesDecoded = buf.length * buf.numberOfChannels * 4;
        P.cache.set(key, { buffer: buf, bytes: bytesDecoded, used: Date.now(), refs: 0 });
        P.fails.delete(key);
        evict();
        note('ready', { url: ref.url, seconds: +buf.duration.toFixed(4), rate: buf.sampleRate });
        return buf;
      } catch (e) {
        const g = P.fails.get(key) || { n: 0, until: 0 };
        if (!signal.aborted) { g.n++; if (g.n >= 2) g.until = Date.now() + COOLDOWN_MS; P.fails.set(key, g); }
        note('fail', { url: ref.url, why: String(e && e.message || e) });
        throw e;
      } finally {
        clearTimeout(timer);
        signal.removeEventListener('abort', onAbort);
        P.inflight.delete(key);
      }
    })();
    P.inflight.set(key, job);
    return job;
  }
  // the decoded-music budget: least recently used first, never a buffer a cue holds
  function evict() {
    let total = 0;
    for (const v of P.cache.values()) total += v.bytes;
    if (total <= RETAIN) return;
    const order = Array.from(P.cache.entries()).filter(([, v]) => !v.refs).sort((a, b) => a[1].used - b[1].used);
    for (const [k, v] of order) {
      if (total <= RETAIN) break;
      P.cache.delete(k);
      total -= v.bytes;
      note('evict', { sha: k.slice(0, 12) });
    }
  }
  A.ensembleMemory = () => {
    let decoded = 0;
    for (const v of P.cache.values()) decoded += v.bytes;
    return { decodedBytes: decoded, buffers: P.cache.size, inflight: P.inflight.size, requests: P.requests };
  };
  // the formats this browser says it can play, in the catalog's order of preference
  function formatsFor(entry) {
    const a = typeof Audio !== 'undefined' ? new Audio() : null;
    return (entry.formats || []).filter((f) => !a || !f.type || a.canPlayType(f.type));
  }

  // ---- the director ------------------------------------------------------------------------------------------------
  function cueOf(p) { return P.cue && P.cue.player === p ? P.cue : null; }
  function status() {
    const c = P.cue, p = _.curPlayer && _.curPlayer();
    const pref = P.pref;
    const songId = p ? p.song.id : null;
    let state;
    if (!musicOn()) state = 'off';
    else if (!p) state = 'none';
    else if (pref === 'original') state = 'original';
    else if (c && c.active) state = 'ensemble';
    else if (!hosted()) state = 'standalone';
    else if (!entryOf(songId)) state = 'unsupported';
    else if (c && c.state === 'failed') state = 'failed';
    else if (c && (c.state === 'loading' || c.state === 'checking' || c.state === 'handover')) state = 'loading';
    else state = 'original-only';
    return { pref, state, song: songId, actual: c && c.active ? 'ensemble' : p ? 'original' : null, available: A.ensembleSongs().length };
  }
  A.performanceStatus = status;
  let lastSig = '';
  function announce() {
    const s = status(), sig = s.pref + s.state + s.song;
    if (sig === lastSig) return;
    lastSig = sig;
    if (RB.bus) RB.bus.emit('audio:performance', s);
  }

  // the player's preference (settings.musicPerformance): anything but 'ensemble' is Original
  A.setPerformance = function (pref) {
    pref = PERFS.indexOf(pref) >= 0 ? pref : 'original';
    const changed = pref !== P.pref;
    P.pref = pref;
    refresh(changed);
  };
  A.performance = () => P.pref;
  // what the director should do now, given the preference, the cue and whether music is on
  function refresh(changed) {
    const p = _.curPlayer && _.curPlayer();
    if (!p || !st.ctx) { announce(); return; }
    let c = cueOf(p);
    if (!c) c = adopt(p);
    if (P.pref === 'ensemble') {
      if (c.active || c.state === 'handover') { if (c.want !== 'ensemble') retarget(c, 'ensemble'); }
      else if (c.state === 'idle' || (changed && c.state === 'failed')) { if (changed) c.retries = 0; prepare(c); }
    } else if (c.active || c.state === 'handover') {
      if (c.want !== 'original') retarget(c, 'original');
    } else if (c.abort) { c.abort.abort(); c.state = 'idle'; }
    announce();
  }
  A.refreshPerformance = () => refresh(false);
  function adopt(p) {
    if (P.cue) release(P.cue, 0);
    P.cue = { player: p, id: p.song.id, gen: ++P.gen, entry: entryOf(p.song.id), fmt: null, bufs: null, segs: [], horizon: null, timer: null, gain: null, trim: null, active: false, want: 'original', state: 'idle', retries: 0, abort: null };
    return P.cue;
  }
  // a new cue (the sequencer's playSong): Original is sounding; the recording follows if wanted and possible
  _.assetUrl = assetUrl; // (tests)
  _.hooks.cue.push((p, fade) => {
    const old = P.cue;
    if (old && old.player !== p) release(old, fade);
    adopt(p);
    refresh(false);
  });
  // the cue stopped (stopSong, or a one-shot's natural end): its recording goes with it
  _.hooks.cueStop.push((fade) => {
    if (P.cue) release(P.cue, fade);
    P.cue = null;
    announce();
  });
  // a new audio context (the old one was closed): a cue whose player belongs to the old one is let go; the sequencer
  // starts the wanted song on the new context and the cue hook adopts it (decoded buffers outlive their context)
  _.hooks.init.push(() => {
    if (P.cue && P.cue.player && P.cue.player.g && P.cue.player.g.ctx !== st.ctx) {
      try { release(P.cue, 0); } catch (e) { /* its nodes went with the old context */ }
      P.cue = null;
    }
    announce();
  });
  _.hooks.mute.push(() => refresh(false));
  _.hooks.vol.push((bus) => { if (bus === 'master' || bus === 'music') refresh(false); });

  // fetch what this cue's song needs, then hand over if it is still wanted
  async function prepare(c) {
    const p = c.player, gen = c.gen;
    const live = () => P.cue === c && c.gen === gen && _.curPlayer && _.curPlayer() === p && !p.stopping && P.pref === 'ensemble';
    if (!hosted() || !musicOn() || !c.entry) { c.state = 'idle'; announce(); return; }
    c.state = 'checking';
    announce();
    if (c.bufs) { handover(c, 'ensemble'); return; } // (already loaded for this cue: a return and a second change)
    try {
      // the recording must be of this score: checked before anything is downloaded
      const fp = await fingerprint(c.id);
      if (!live()) return;
      if (fp !== c.entry.fingerprint) { c.state = 'failed'; note('stale', { song: c.id }); announce(); return; }
      const fmts = formatsFor(c.entry);
      if (!fmts.length) { c.state = 'failed'; note('noformat', { song: c.id }); announce(); return; }
      c.state = 'loading';
      announce();
      const ac = (c.abort = new AbortController());
      let last = null;
      for (const fmt of fmts) {
        try {
          const [first, loop] = await Promise.all([loadAsset(fmt.first, ac.signal), c.entry.loop ? loadAsset(fmt.loop, ac.signal) : Promise.resolve(null)]);
          if (!live()) return;
          c.fmt = fmt;
          c.bufs = { first, loop };
          for (const r of [fmt.first, fmt.loop]) { const h = r && P.cache.get(r.sha256); if (h) h.refs++; }
          handover(c, 'ensemble');
          return;
        } catch (e) {
          if (!live()) return;
          last = e; // (the next format, if there is one)
        }
      }
      throw last || new Error('no format loaded');
    } catch (e) {
      if (!live()) return;
      if (c.retries < 1) { c.retries++; note('retry', { song: c.id }); c.state = 'idle'; return prepare(c); }
      c.state = 'failed';
      announce();
    }
  }

  // ---- the two performances on one clock ---------------------------------------------------------------------------
  function trimNode(c) {
    if (c.gain) return;
    const ctx = st.ctx;
    c.gain = ctx.createGain();
    c.gain.gain.value = 0;
    c.trim = ctx.createGain();
    c.trim.gain.value = Math.max(0, Math.min(4, +c.entry.trim || 1));
    c.gain.connect(c.trim);
    c.trim.connect(st.g.music); // before the music volume, the ducking and the master chain, as the Original
  }
  // one stretch of a file, on the audio clock: from `when`, at `offset` seconds into the buffer, faded in over XJ (a
  // join or a cycle boundary) or not (the first stretch of a handover: the handover's own crossfade covers it), and
  // faded out over XJ from `until` (the next stretch starts there, on the same phase)
  // Times are put on the context's frame grid, the offset moved by the same amount: a source started between frames is
  // read interpolated for its whole length (Chromium, measured), which would dull the top of a cycle whose period is
  // not a whole number of frames; on the grid it is read sample for sample, within half a frame of the clock.
  function segment(c, buf, when, offset, fadeIn, until) {
    const ctx = st.ctx, s = ctx.createBufferSource(), g = ctx.createGain(), sr = ctx.sampleRate;
    const w = Math.round(when * sr) / sr;
    offset += w - when;
    when = w;
    if (until != null) until = Math.round(until * sr) / sr;
    s.buffer = buf;
    s.connect(g);
    g.connect(c.gain);
    // (silent from creation: an automation event on the very frame the source starts can let that one frame through
    // at the gain before it, measured in Chromium as a single full-level sample at the seam)
    if (fadeIn) { g.gain.value = 0; g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(1, when + XJ); }
    if (until != null) { g.gain.setValueAtTime(1, until); g.gain.linearRampToValueAtTime(0, until + XJ); }
    s.start(when, Math.max(0, offset));
    if (until != null) s.stop(until + XJ + 0.01);
    const rec = { s, g, when, until, offset: Math.max(0, offset), fadeIn: !!fadeIn, role: buf === c.bufs.first ? 'first' : 'loop' };
    s.onended = () => {
      const i = c.segs.indexOf(rec);
      if (i >= 0) c.segs.splice(i, 1);
      try { s.disconnect(); g.disconnect(); } catch (e) { /* ignore */ }
    };
    c.segs.push(rec);
    return rec;
  }
  // the steady cycles, each from the score's cycle boundary (c.horizon), scheduled one cycle ahead of `until`
  function cycles(c, until) {
    const song = c.player.song, f = c.fmt.loop, Pd = song.length - song.loopStart;
    while (c.horizon != null && c.horizon < until) {
      segment(c, c.bufs.loop, c.horizon, f.start / f.rate, true, c.horizon + Pd);
      c.horizon += Pd;
    }
  }
  function keepCycling(c) {
    clearTimeout(c.timer);
    if (!c.player.song.loop || !st.ctx || st.ctx.state === 'closed') return;
    const Pd = c.player.song.length - c.player.song.loopStart;
    cycles(c, st.ctx.currentTime + Pd + 2);
    // (idempotent, so an early wake while the context is suspended does no harm; a throttled timer still has a cycle)
    c.timer = setTimeout(() => { if (c.segs.length) keepCycling(c); }, Math.min(Pd / 2, 20) * 1000);
  }
  // start the recording so that the score position at audio time T sounds at T; false if there is nothing to play
  function startSources(c, T, until) {
    const p = c.player, song = p.song, clk = clockAt(p, T);
    const fr = c.fmt.first, s0 = fr.start / fr.rate, J = (fr.end - fr.start) / fr.rate; // J: the join, score seconds
    const L = song.loopStart, D = song.length, Pd = D - L;
    c.segs = c.segs || [];
    c.horizon = null;
    if (!song.loop) {
      if (clk.done || clk.e >= J) return false;
      segment(c, c.bufs.first, T, s0 + clk.e, false, null);
    } else if (clk.cycle === 0 && clk.e < J) {
      // the first pass from silence, then the steady cycle from the join (the same music there)
      const Tj = T + (J - clk.e), lf = c.fmt.loop;
      segment(c, c.bufs.first, T, s0 + clk.e, false, Tj);
      segment(c, c.bufs.loop, Tj, lf.start / lf.rate + (J - L), true, T + (D - clk.e));
      c.horizon = T + (D - clk.e);
    } else {
      // in the steady cycle (or the first pass beyond the join, which is the same music)
      const ph = clk.pos - L, lf = c.fmt.loop;
      segment(c, c.bufs.loop, T, lf.start / lf.rate + ph, false, T + (Pd - ph));
      c.horizon = T + (Pd - ph);
    }
    if (until != null) cycles(c, until);
    else keepCycling(c);
    note('start', { song: c.id, at: +T.toFixed(4), e: +clk.e.toFixed(4), pos: +clk.pos.toFixed(4), cycle: clk.cycle });
    return true;
  }
  // the handover's fade shape (MT-2): equal power. The two performances are the same score but different instruments,
  // and over a fade's 200 ms they are uncorrelated (measured: median correlation about 0, spread +-0.5), so a linear
  // fade sagged about 3 dB at its middle; sine and cosine keep the sum's power. A gain at v moving to 1 follows
  // sin(a0 + (pi/2 - a0) x) with a0 = asin v; moving to 0, sin(a0 (1 - x)): a complementary pair stays complementary
  // when a fade under way is retargeted from where it is.
  const CURVE_N = 65;
  function powerCurve(v, to) {
    const a0 = Math.asin(Math.min(1, Math.max(0, v))), c = new Float32Array(CURVE_N);
    for (let i = 0; i < CURVE_N; i++) {
      const x = i / (CURVE_N - 1);
      c[i] = to >= 1 ? Math.sin(a0 + (Math.PI / 2 - a0) * x) : Math.sin(a0 * (1 - x));
    }
    c[CURVE_N - 1] = to >= 1 ? 1 : 0;
    return c;
  }
  _.powerCurve = powerCurve;
  // a gain moved from where it is now to `to` over [T, T + XF] (retargeting a fade under way holds its value)
  function rampAt(param, to, T) {
    const now = st.ctx.currentTime;
    const v = param.value, at = Math.max(now, T);
    param.cancelScheduledValues(now);
    param.setValueAtTime(v, now);
    try {
      if (at > now) param.setValueAtTime(v, at);
      param.setValueCurveAtTime(powerCurve(v, to), at, XF);
    } catch (e) {
      // (a browser refusing the curve fades linearly, as before)
      param.cancelScheduledValues(now);
      param.setValueAtTime(v, now);
      param.setValueAtTime(v, at);
      param.linearRampToValueAtTime(to, at + XF);
    }
  }
  function handover(c, to) {
    const p = c.player;
    if (!st.ctx || !st.g || p.stopping) return;
    const T = handoverAt(p);
    c.want = to;
    if (to === 'ensemble') {
      trimNode(c);
      if (!c.segs || !c.segs.length) {
        if (!startSources(c, T)) { c.state = 'idle'; return; }
      }
      rampAt(c.gain.gain, 1, T);
      rampAt(p.out.gain, 0, T);
      rampAt(st.g.revGate.gain, 0, T);
      c.active = true;
      c.state = 'handover';
      c.at = T;
      settleLater(c, T, 'ensemble');
    } else {
      rampAt(p.out.gain, 1, T);
      rampAt(st.g.revGate.gain, 1, T);
      if (c.gain) rampAt(c.gain.gain, 0, T);
      c.state = 'handover';
      c.at = T;
      settleLater(c, T, 'original');
    }
    note('handover', { song: c.id, to, at: +T.toFixed(4) });
    announce();
  }
  // when the fade is over: the outgoing performance's sources go (Ensemble), or the state settles (Original stays warm)
  function settleLater(c, T, to) {
    const gen = c.gen, ms = Math.max(0, (T + XF - st.ctx.currentTime) * 1000) + 60;
    setTimeout(() => {
      if (P.cue !== c || c.gen !== gen || c.want !== to) return;
      if (to === 'original') { stopSources(c); c.active = false; c.state = 'idle'; }
      else c.state = 'sounding';
      announce();
    }, ms);
  }
  function retarget(c, to) {
    if (to === 'ensemble' && !(c.segs && c.segs.length)) {
      // the recording's sources were let go after a return: start them again on the clock
      if (!c.bufs) { c.state = 'idle'; prepare(c); return; }
    }
    handover(c, to);
  }
  function stopSources(c) {
    clearTimeout(c.timer);
    for (const r of c.segs || []) { try { r.s.stop(); } catch (e) { /* ignore */ } try { r.s.disconnect(); r.g.disconnect(); } catch (e) { /* ignore */ } }
    c.segs = [];
    c.horizon = null;
  }
  // a cue ends (a song change, a stop, a one-shot's end): its recording fades with it, its warm Original says nothing
  function release(c, fade) {
    c.gen = -1;
    if (c.abort) { try { c.abort.abort(); } catch (e) { /* ignore */ } }
    const ctx = c.gain ? c.gain.context : st.ctx; // (the cue's own context, which may not be the current one)
    if (ctx && c.gain && ctx.state !== 'closed') {
      const now = ctx.currentTime, f = Math.max(0.02, fade || 0);
      c.gain.gain.cancelScheduledValues(now);
      c.gain.gain.setValueAtTime(c.gain.gain.value, now);
      c.gain.gain.linearRampToValueAtTime(0, now + f);
      clearTimeout(c.timer);
      for (const r of c.segs || []) { try { r.s.stop(now + f + 0.02); } catch (e) { /* ignore */ } }
      const g = c.gain, t = c.trim, segs = (c.segs || []).slice();
      setTimeout(() => { for (const r of segs) { try { r.s.disconnect(); r.g.disconnect(); } catch (e) { /* ignore */ } } try { g.disconnect(); t.disconnect(); } catch (e) { /* ignore */ } }, (f + 0.2) * 1000);
    }
    // the warm Original was unheard: its room sends stop now, so nothing of it comes back through the open return
    if (c.active && ctx && ctx.state !== 'closed') {
      try { c.player.wet.gain.cancelScheduledValues(ctx.currentTime); c.player.wet.gain.setTargetAtTime(0, ctx.currentTime, 0.01); } catch (e) { /* ignore */ }
      if (st.g && st.ctx === ctx) { st.g.revGate.gain.cancelScheduledValues(ctx.currentTime); st.g.revGate.gain.setTargetAtTime(1, ctx.currentTime + 0.05, 0.05); }
    }
    for (const r of c.fmt ? [c.fmt.first, c.fmt.loop] : []) { const h = r && P.cache.get(r.sha256); if (h && h.refs > 0) h.refs--; }
    c.segs = [];
    c.horizon = null;
    c.active = false;
    c.state = 'released';
  }
  // ---- offline: a recording through the game's own graph (calibration and tests) -----------------------------------
  // Renders `seconds` of a song's Ensemble recording from elapsed cue time `from` (decoded buffers {first, loop} in
  // `bufs`; the entry and format given or the catalog's), every cycle scheduled up front, through the same mix graph
  // as live play. Options:
  //   original: the warm Original too, in phase, as live: mix 0 sounds the recording (the Original behind its output
  //     gain and the room's gate), mix 1 the Original (the recording silent); handovers: [{at, to}] crossfades as live
  //     (XF, linear, all three gains) at render times `at`;
  //   raw: the recording's own output only (no graph, no trim): the scheduler's placement, for tests;
  //   vol, duck: the user's volumes and the speech ducking, as live.
  // Resolves the rendered AudioBuffer (2 channels).
  A.renderEnsembleOffline = function (id, bufs, seconds, opts) {
    opts = opts || {};
    const O = _.OAC(), song = _.getSong(id), entry = opts.entry || entryOf(id);
    if (!O || !song || !entry) return Promise.reject(new Error('cannot render ' + id));
    const sr = opts.sampleRate || 48000;
    const ctx = new O({ numberOfChannels: 2, length: Math.ceil(sr * seconds), sampleRate: sr });
    const T = opts.start != null ? opts.start : 0.05, from = opts.from || 0;
    const fake = { song, anchor0: T - from };
    const c = { entry, fmt: opts.fmt || entry.formats[0], bufs, player: fake, gain: ctx.createGain(), id, segs: [] };
    const keep = st.ctx;
    st.ctx = ctx; // (the scheduler reads the context)
    try {
      if (opts.raw) {
        c.gain.connect(ctx.destination);
        startSources(c, T, seconds + 1);
        opts.segments = c.segs.map((r) => ({ when: r.when, until: r.until, offset: r.offset, fadeIn: r.fadeIn, role: r.role }));
        return ctx.startRendering();
      }
      const g = _.buildGraph(ctx, Object.assign({}, _.DEFAULT_VOL, opts.vol || {}), false);
      g.out.connect(ctx.destination);
      if (opts.duck) g.duck.gain.value = 0.3; // (music under speech, as A.duck)
      const tr = ctx.createGain();
      tr.gain.value = opts.trim != null ? opts.trim : entry.trim || 1;
      c.gain.connect(tr);
      tr.connect(g.music);
      const mix = opts.mix == null ? 0 : +opts.mix;
      c.gain.gain.value = 1 - mix;
      g.revGate.gain.value = mix;
      startSources(c, T, seconds + 1);
      if (opts.original) {
        const p = new _.Player(g, song, T - from, false);
        p.out.gain.value = mix;
        for (const h of opts.handovers || []) {
          const e = h.to === 'ensemble';
          // (the same equal-power fade as in play)
          for (const [prm, v] of [[c.gain.gain, e ? 1 : 0], [p.out.gain, e ? 0 : 1], [g.revGate.gain, e ? 0 : 1]]) {
            prm.setValueAtTime(1 - v, h.at);
            prm.setValueCurveAtTime(powerCurve(1 - v, v), h.at, XF);
          }
        }
        p.pump(seconds);
      }
    } finally { st.ctx = keep; }
    return ctx.startRendering();
  };
})(RB.audio);
