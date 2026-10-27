/* Persistence: twenty campaign slots in IndexedDB (localStorage fallback,
 * session-only as last resort), bounded recovery snapshots, schema
 * validation, revision checks and cross-tab ownership (spec §14).
 * There is deliberately no export/import of saves for players; the one exception, a QA backup behind the
 * development gate ?dev=saves (SPECIFICATION §14), is at the end. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.save = (function () {
  'use strict';
  const DB_NAME = 'road-of-borrowed-names';
  const DB_VER = 1;
  // Twenty slots (Robin, 2026-10-25, superseding SPECIFICATION §14's six for thorough testing): records are keyed by
  // slot number, so slots 1–6 and their recovery records read as before; no schema change
  const SLOTS = 20;
  const AUTO_KEEP = 3;
  let mode = 'unknown'; // 'idb' | 'local' | 'session'
  let db = null;
  const mem = new Map(); // session-only store
  let current = { slot: null, rev: 0, readOnly: false, lockRelease: null };
  // load-time normalisers registered by later systems (addMigration); each must
  // be idempotent and must never invent history the save does not record
  const MIGRATIONS = [];
  function addMigration(f) { MIGRATIONS.push(f); }
  let chan = null;
  const tabId = Math.random().toString(36).slice(2);
  let persisted = null;
  let lastError = null;

  // ---- low-level stores ---------------------------------------------------
  function openDb() {
    return new Promise((res, rej) => {
      let req;
      try {
        req = indexedDB.open(DB_NAME, DB_VER);
      } catch (e) {
        rej(e);
        return;
      }
      req.onupgradeneeded = () => {
        const d = req.result;
        if (!d.objectStoreNames.contains('slots')) d.createObjectStore('slots', { keyPath: 'slot' });
        if (!d.objectStoreNames.contains('recovery')) {
          const r = d.createObjectStore('recovery', { keyPath: 'key' });
          r.createIndex('slot', 'slot');
        }
        if (!d.objectStoreNames.contains('settings')) d.createObjectStore('settings', { keyPath: 'k' });
      };
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
      req.onblocked = () => rej(new Error('blocked'));
    });
  }
  function tx(stores, modeRW, fn) {
    return new Promise((res, rej) => {
      let t;
      try {
        t = db.transaction(stores, modeRW);
      } catch (e) {
        rej(e);
        return;
      }
      let out;
      t.oncomplete = () => res(out);
      t.onerror = () => rej(t.error || new Error('transaction error'));
      t.onabort = () => rej(t.error || new Error('transaction aborted'));
      Promise.resolve(fn(t, (v) => (out = v))).catch((e) => {
        try { t.abort(); } catch (_) { /* already finished */ }
        rej(e);
      });
    });
  }
  const reqP = (r) => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

  // Generic key-value layer so the rest of the code is mode-agnostic.
  const LS_PREFIX = 'rbn:';
  async function kvGet(store, key) {
    if (mode === 'idb') return tx([store], 'readonly', async (t, done) => done(await reqP(t.objectStore(store).get(key))));
    if (mode === 'local') { const v = localStorage.getItem(LS_PREFIX + store + ':' + key); return v ? JSON.parse(v) : undefined; }
    return mem.has(store + ':' + key) ? RB.util.deepClone(mem.get(store + ':' + key)) : undefined;
  }
  async function kvAll(store) {
    if (mode === 'idb') return tx([store], 'readonly', async (t, done) => done(await reqP(t.objectStore(store).getAll())));
    const out = [];
    if (mode === 'local') {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k.startsWith(LS_PREFIX + store + ':')) { try { out.push(JSON.parse(localStorage.getItem(k))); } catch (e) { out.push({ corrupt: true, key: k }); } }
      }
      return out;
    }
    for (const [k, v] of mem) if (k.startsWith(store + ':')) out.push(RB.util.deepClone(v));
    return out;
  }

  // ---- detection -------------------------------------------------------------
  async function detect() {
    // IndexedDB: a real write/read/delete round trip.
    try {
      if (typeof indexedDB === 'undefined') throw new Error('no indexedDB');
      db = await openDb();
      const probe = { k: '__probe', v: tabId + Date.now() };
      await tx(['settings'], 'readwrite', (t) => { t.objectStore('settings').put(probe); });
      const back = await tx(['settings'], 'readonly', async (t, done) => done(await reqP(t.objectStore('settings').get('__probe'))));
      if (!back || back.v !== probe.v) throw new Error('probe mismatch');
      await tx(['settings'], 'readwrite', (t) => { t.objectStore('settings').delete('__probe'); });
      mode = 'idb';
    } catch (e) {
      db = null;
      lastError = String(e && e.message || e);
      try {
        const k = LS_PREFIX + '__probe';
        const v = tabId + Date.now();
        localStorage.setItem(k, v);
        if (localStorage.getItem(k) !== v) throw new Error('ls mismatch');
        localStorage.removeItem(k);
        mode = 'local';
      } catch (e2) {
        mode = 'session';
      }
    }
    try {
      if (navigator.storage && navigator.storage.persisted) persisted = await navigator.storage.persisted();
    } catch (e) { persisted = null; }
    setupChannel();
    return mode;
  }
  function status() {
    return {
      mode, persisted, lastError,
      fileMode: typeof location !== 'undefined' && location.protocol === 'file:',
      readOnly: current.readOnly, slot: current.slot,
    };
  }
  async function requestPersist() {
    try {
      if (navigator.storage && navigator.storage.persist) persisted = await navigator.storage.persist();
    } catch (e) { persisted = false; }
    return persisted;
  }

  // ---- validation -----------------------------------------------------------
  function validate(st) {
    const errs = [];
    if (!st || typeof st !== 'object') return ['not an object'];
    if (typeof st.v !== 'number') errs.push('missing schema version');
    else if (st.v > RB.SAVE_SCHEMA) errs.push('saved by a newer version (schema ' + st.v + ')');
    if (!st.player || typeof st.player.name !== 'string') errs.push('player missing');
    if (typeof st.map !== 'string' || !RB.content.maps[st.map]) errs.push('unknown map ' + st.map);
    if (typeof st.x !== 'number' || typeof st.y !== 'number') errs.push('bad position');
    for (const k of ['flags', 'vars', 'quests', 'inv', 'learn', 'seen']) if (!st[k] || typeof st[k] !== 'object') errs.push('missing ' + k);
    if (!Array.isArray(st.words)) errs.push('missing words');
    if (st.comp && !RB.content.chars[st.comp]) errs.push('unknown companion');
    // optional records added later: absent is fine (migrate fills them), the wrong shape is not
    for (const k of ['company', 'discovery', 'creatures', 'awarded', 'practice']) if (k in st && (!st[k] || typeof st[k] !== 'object' || Array.isArray(st[k]))) errs.push('bad ' + k);
    if ('bookmarks' in st && !Array.isArray(st.bookmarks)) errs.push('bad bookmarks');
    return errs;
  }
  function migrate(st) {
    // Schema 1 is current. Fill any fields added since with defaults.
    const base = RB.state.newCampaign();
    for (const k in base) if (!(k in st)) st[k] = RB.util.deepClone(base[k]);
    for (const k in base.learn) if (!(k in st.learn)) st.learn[k] = RB.util.deepClone(base.learn[k]);
    for (const k in base.atlas) if (!(k in st.atlas)) st.atlas[k] = RB.util.deepClone(base.atlas[k]);
    for (const ns of ['company', 'discovery']) for (const k in base[ns]) if (!(k in st[ns])) st[ns][k] = RB.util.deepClone(base[ns][k]);
    // later systems normalise their own records on load (derived milestones, unknown ids kept, ...)
    if (RB.practice) RB.practice.of(st); // practice: empty for an older save, pace Off (nothing inferred)
    // the expansion's records and streams: empty for an older save; a save without an edition is the six-chapter one
    // (the base fill above would give it a new journey's, so it is set from the save as it was read)
    if (RB.foundations) RB.foundations.normalise(st);
    for (const f of MIGRATIONS) f(st);
    return st;
  }
  function metaOf(st) {
    const m = RB.content.maps[st.map];
    const ch = st.comp && RB.content.chars[st.comp];
    return {
      name: st.player.name,
      comp: ch ? ch.name.en : null,
      compId: st.comp || null,
      chapter: RB.edition ? RB.edition.number(st) : st.chapter,
      edition: st.edition || 1,
      chapterKey: RB.edition ? RB.edition.key(st) : null,
      // the traveller as they look now, for the Main Menu (S3; H3): the base look and what is worn
      look: st.player && st.player.look ? RB.util.deepClone(st.player.look) : null,
      worn: st.equip ? RB.util.deepClone(st.equip) : null,
      place: m && m.name ? m.name.en : st.map,
      placeJp: m && m.name ? m.name.jp : '',
      playtime: Math.floor(st.playtime),
      savedAt: Date.now(),
      post: !!(st.flags && st.flags.postgame),
      id: st.id,
    };
  }
  function trimForSave(st) {
    if (st.backlog && st.backlog.length > 200) st.backlog = st.backlog.slice(-200);
    return st;
  }

  // ---- slot API -----------------------------------------------------------------
  async function list() {
    const out = [];
    let rows = [], rec = [];
    let readError = null;
    try { rows = await kvAll('slots'); rec = await kvAll('recovery'); } catch (e) { lastError = readError = String(e.message || e); }
    for (let i = 1; i <= SLOTS; i++) {
      const r = rows.find((x) => x && x.slot === i);
      const autos = rec.filter((x) => x && x.slot === i && x.kind === 'auto').sort((a, b) => b.savedAt - a.savedAt);
      const pre = rec.find((x) => x && x.slot === i && x.kind === 'predeparture');
      const sus = rec.find((x) => x && x.slot === i && x.kind === 'suspend');
      const corrupt = r && (!r.state || validate(r.state).length > 0);
      out.push({
        slot: i,
        empty: !r && !autos.length,
        meta: r ? r.meta : autos[0] ? autos[0].meta : null,
        thumb: r ? r.thumb : autos[0] ? autos[0].thumb : null,
        manual: !!r,
        corrupt: !!corrupt,
        corruptWhy: corrupt ? (r.state ? validate(r.state).join('; ') : 'no data') : null,
        auto: autos[0] ? { savedAt: autos[0].savedAt, meta: autos[0].meta } : null,
        autoNewer: !!(autos[0] && (!r || autos[0].savedAt > r.meta.savedAt)),
        pre: pre ? { savedAt: pre.savedAt, meta: pre.meta } : null,
        // suspended in the Hall of a Hundred Tales: resumed from there when it is the newest
        suspend: sus ? { savedAt: sus.savedAt, meta: sus.meta } : null,
        // (written after the save it suspends from, so a tie in the clock goes to the suspend point)
        suspendNewer: !!(sus && (!r || sus.savedAt >= r.meta.savedAt) && (!autos[0] || sus.savedAt >= autos[0].savedAt)),
        rev: r ? r.rev : 0,
      });
    }
    // a failed read is not a ledger of empty slots: the ledger shows an error with Try again
    if (readError) out.readError = readError;
    return out;
  }

  class ConflictError extends Error {}

  // No saving while a battle is open, by any route (the folio, a scene's !autosave, an activity, a
  // timer): the playing campaign is written only once the encounter is over (src/engine/90_game.js
  // inBattle(); the battle's settings sheet says "Saving is available after the encounter.").
  // Copying or deleting slots in the ledger writes no playing state and is not affected.
  const battling = () => !!(RB.game && RB.game.inBattle && RB.game.inBattle());
  const IN_BATTLE = 'Saving is available after the encounter.';
  async function writeSlot(slot, st, opts) {
    opts = opts || {};
    if (battling() && st === RB.game.s) throw new Error(IN_BATTLE);
    if (current.readOnly && slot === current.slot && !opts.force) throw new Error('This tab is read-only for this campaign.');
    const clean = trimForSave(RB.util.deepClone(st));
    const rec = { slot, rev: 0, meta: metaOf(clean), thumb: opts.thumb || null, state: clean };
    if (mode === 'idb') {
      await tx(['slots'], 'readwrite', async (t) => {
        const os = t.objectStore('slots');
        const prev = await reqP(os.get(slot));
        const prevRev = prev ? prev.rev : 0;
        if (!opts.force && opts.expectRev != null && prevRev !== opts.expectRev) throw new ConflictError('Slot changed elsewhere (revision ' + prevRev + ').');
        rec.rev = prevRev + 1;
        os.put(rec);
      });
    } else if (mode === 'local') {
      const prev = await kvGet('slots', slot);
      const prevRev = prev ? prev.rev : 0;
      if (!opts.force && opts.expectRev != null && prevRev !== opts.expectRev) throw new ConflictError('Slot changed elsewhere.');
      rec.rev = prevRev + 1;
      localStorage.setItem(LS_PREFIX + 'slots:' + slot, JSON.stringify(rec)); // throws on quota
    } else {
      const prev = mem.get('slots:' + slot);
      rec.rev = (prev ? prev.rev : 0) + 1;
      mem.set('slots:' + slot, RB.util.deepClone(rec));
    }
    if (slot === current.slot) current.rev = rec.rev;
    if (chan) chan.postMessage({ type: 'saved', slot, rev: rec.rev, tab: tabId });
    return rec;
  }

  async function writeRecovery(slot, st, kind, thumb) {
    if (battling() && st === RB.game.s) throw new Error(IN_BATTLE);
    const clean = trimForSave(RB.util.deepClone(st));
    const now = Date.now();
    // one predeparture point and one suspend point per slot (the Hall's suspend, D9: replaced, never a seventh save)
    const key = kind === 'predeparture' ? slot + ':predeparture' : kind === 'suspend' ? slot + ':suspend' : slot + ':auto:' + now;
    const rec = { key, slot, kind, savedAt: now, meta: metaOf(clean), thumb: thumb || null, state: clean };
    if (mode === 'idb') {
      await tx(['recovery'], 'readwrite', async (t) => {
        const os = t.objectStore('recovery');
        os.put(rec);
        if (kind === 'auto') {
          const all = await reqP(os.index('slot').getAll(slot));
          const autos = all.filter((r) => r.kind === 'auto').sort((a, b) => b.savedAt - a.savedAt);
          for (const old of autos.slice(AUTO_KEEP)) os.delete(old.key);
        }
      });
    } else if (mode === 'local') {
      const all = (await kvAll('recovery')).filter((r) => r.slot === slot && r.kind === 'auto').sort((a, b) => b.savedAt - a.savedAt);
      for (const old of all.slice(AUTO_KEEP - 1)) localStorage.removeItem(LS_PREFIX + 'recovery:' + old.key);
      localStorage.setItem(LS_PREFIX + 'recovery:' + key, JSON.stringify(rec));
    } else {
      const all = [...mem.entries()].filter(([k, v]) => k.startsWith('recovery:') && v.slot === slot && v.kind === 'auto').sort((a, b) => b[1].savedAt - a[1].savedAt);
      for (const [k] of all.slice(AUTO_KEEP - 1)) mem.delete(k);
      mem.set('recovery:' + key, RB.util.deepClone(rec));
    }
    return rec;
  }

  async function read(slot, which) {
    let rec;
    if (which === 'auto' || which === 'predeparture' || which === 'suspend') {
      const all = (await kvAll('recovery')).filter((r) => r && r.slot === slot && r.kind === which).sort((a, b) => b.savedAt - a.savedAt);
      rec = all[0];
    } else rec = await kvGet('slots', slot);
    if (!rec) throw new Error('Nothing saved there.');
    // Generated maps (Unwritten Atlas) are rebuilt from their seed before validation.
    if (RB.atlas && RB.atlas.prepare && rec.state) { try { RB.atlas.prepare(rec.state); } catch (e) { console.warn('atlas prepare failed', e); } }
    const errs = validate(rec.state);
    if (errs.length) throw new Error('This save could not be read safely: ' + errs.join('; ') + '. It has been left untouched.');
    return { state: migrate(RB.util.deepClone(rec.state)), rev: which === 'manual' || !which ? rec.rev : null, meta: rec.meta };
  }

  async function del(slot) {
    if (mode === 'idb') {
      await tx(['slots', 'recovery'], 'readwrite', async (t) => {
        t.objectStore('slots').delete(slot);
        const os = t.objectStore('recovery');
        const keys = await reqP(os.index('slot').getAllKeys(slot));
        for (const k of keys) os.delete(k);
      });
    } else if (mode === 'local') {
      const kill = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k === LS_PREFIX + 'slots:' + slot) kill.push(k);
        if (k.startsWith(LS_PREFIX + 'recovery:' + slot + ':')) kill.push(k);
      }
      kill.forEach((k) => localStorage.removeItem(k));
    } else {
      for (const k of [...mem.keys()]) if (k === 'slots:' + slot || k.startsWith('recovery:' + slot + ':')) mem.delete(k);
    }
    if (chan) chan.postMessage({ type: 'deleted', slot, tab: tabId });
  }

  // a suspend point is used once: resuming from it removes it (the journey goes on saving as usual)
  async function dropSuspend(slot) {
    const key = slot + ':suspend';
    if (mode === 'idb') await tx(['recovery'], 'readwrite', async (t) => { t.objectStore('recovery').delete(key); });
    else if (mode === 'local') localStorage.removeItem(LS_PREFIX + 'recovery:' + key);
    else mem.delete('recovery:' + key);
  }
  async function suspend() {
    if (current.slot == null || current.readOnly || battling()) return null;
    return writeRecovery(current.slot, RB.game.s, 'suspend', RB.render && RB.render.thumbnail ? RB.render.thumbnail() : null);
  }

  async function copy(from, to) {
    // Independent deep copy with a fresh campaign id; recovery data is copied too.
    const src = await kvGet('slots', from);
    const recs = (await kvAll('recovery')).filter((r) => r && r.slot === from);
    if (!src && !recs.length) throw new Error('Nothing to copy.');
    await del(to);
    const newId = RB.util.uid();
    if (src) {
      const st = RB.util.deepClone(src.state);
      st.id = newId;
      await writeSlot(to, st, { thumb: src.thumb, force: true });
    }
    for (const r of recs) {
      const st = RB.util.deepClone(r.state);
      st.id = newId;
      await writeRecovery(to, st, r.kind, r.thumb);
    }
  }

  // ---- settings ------------------------------------------------------------------
  async function loadSettings() {
    try {
      const r = await kvGet('settings', 'global');
      return r ? r.v : null;
    } catch (e) { return null; }
  }
  async function saveSettings(v) {
    try {
      if (mode === 'idb') await tx(['settings'], 'readwrite', (t) => { t.objectStore('settings').put({ k: 'global', v }); });
      else if (mode === 'local') localStorage.setItem(LS_PREFIX + 'settings:global', JSON.stringify({ k: 'global', v }));
      else mem.set('settings:global', { k: 'global', v });
    } catch (e) { lastError = String(e.message || e); }
  }

  // ---- cross-tab ownership -------------------------------------------------------------
  function setupChannel() {
    try {
      chan = new BroadcastChannel('rbn-saves');
      chan.onmessage = (ev) => {
        const m = ev.data || {};
        if (m.tab === tabId) return;
        if (m.type === 'takeover' && m.slot === current.slot && !current.readOnly) {
          current.readOnly = true;
          releaseLock();
          RB.bus.emit('save:takenover', { slot: m.slot });
        }
        if (m.type === 'saved' && m.slot === current.slot && !current.readOnly) {
          RB.bus.emit('save:conflict', { slot: m.slot });
        }
        if (m.type === 'deleted' && m.slot === current.slot) RB.bus.emit('save:deletedElsewhere', { slot: m.slot });
      };
    } catch (e) { chan = null; }
  }
  function releaseLock() {
    if (current.lockRelease) { current.lockRelease(); current.lockRelease = null; current.lockSlot = null; }
  }
  // Try to become the only tab writing to this slot. Returns 'owned' | 'busy' | 'unsupported'.
  function claim(slot) {
    // Already holding this slot's lock in this tab: keep it (no false warning).
    if (current.lockRelease && current.lockSlot === slot) {
      current.slot = slot;
      current.readOnly = false;
      return Promise.resolve('owned');
    }
    releaseLock();
    current.slot = slot;
    current.readOnly = false;
    if (!navigator.locks || mode === 'session') return Promise.resolve('unsupported');
    return new Promise((resolve) => {
      navigator.locks.request('rbn-slot-' + slot, { ifAvailable: true }, (lock) => {
        if (!lock) { resolve('busy'); return undefined; }
        resolve('owned');
        current.lockSlot = slot;
        return new Promise((rel) => (current.lockRelease = rel));
      }).catch(() => resolve('unsupported'));
    });
  }
  async function takeOver(slot) {
    if (chan) chan.postMessage({ type: 'takeover', slot, tab: tabId });
    // wait for the other tab to release, but never hang forever
    const r = await Promise.race([
      new Promise((resolve) => {
        navigator.locks.request('rbn-slot-' + slot, (lock) => {
          resolve('owned');
          current.lockSlot = slot;
          return new Promise((rel) => (current.lockRelease = rel));
        });
      }),
      new Promise((resolve) => setTimeout(() => resolve('timeout'), 3000)),
    ]);
    current.slot = slot;
    current.readOnly = r !== 'owned';
    return r;
  }
  function setReadOnly(v) { current.readOnly = v; }
  function setCurrent(slot, rev) { current.slot = slot; current.rev = rev || 0; }

  // ---- high-level helpers used by the game ------------------------------------------------
  let skippedInBattle = 0; // autosaves asked for while a battle was open (none was written; tests)
  async function manualSave(slot) {
    if (battling()) throw new Error(IN_BATTLE);
    const st = RB.game.s;
    const same = slot === current.slot;
    const rec = await writeSlot(slot, st, { thumb: RB.render.thumbnail(), expectRev: same ? current.rev : null });
    if (!same) { await claim(slot); current.rev = rec.rev; }
    if (persisted == null || persisted === false) requestPersist();
    return rec;
  }
  async function autosave(kind) {
    if (current.slot == null || current.readOnly) return null;
    if (battling()) { skippedInBattle++; return null; } // (quietly: the next safe place autosaves)
    try {
      return await writeRecovery(current.slot, RB.game.s, kind === 'predeparture' ? 'predeparture' : 'auto', RB.render.thumbnail());
    } catch (e) {
      lastError = String(e.message || e);
      RB.bus.emit('save:error', { error: e });
      return null;
    }
  }

  // ---- QA save backups (SPECIFICATION §14's one exception: Robin, 2026-10-27, via Agnes 6431800544 and 6431813219) ---
  // Defined only behind the development gate ?dev=saves (or __RB_DEV_SAVES__ set before the scripts load, for tests):
  // one slot's manual save and recovery records to a checksummed file, and such a file into an EMPTY slot, on IndexedDB
  // only, in one transaction. Not a player feature, not a share code or cloud save; without the gate nothing is defined.
  const QA_FORMAT = 'road-qa-save', QA_FV = 1;
  const QA_MAX_TEXT = 16 * 1024 * 1024, QA_MAX_STATE = 4 * 1024 * 1024, QA_MAX_NAME = 64, QA_MAX_FIELD = 80;
  const QA_KINDS = { manual: 1, auto: AUTO_KEEP, predeparture: 1, suspend: 1 };
  const QA_ORDER = { manual: 0, auto: 1, predeparture: 2, suspend: 3 };
  const QA_KEYS = ['exportedAt', 'format', 'fv', 'gameVersion', 'label', 'payload', 'saveSchema', 'sha256', 'sourceSlot'];
  function qaGate() {
    if (globalThis.__RB_DEV_SAVES__ === true) return true;
    return typeof window !== 'undefined' && !!window.location && /[?&]dev=saves\b/.test(window.location.search || '');
  }
  const qaPlain = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
  const qaBytes = (text) => new TextEncoder().encode(text).length;
  async function qaHash(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
  }
  // every record of a payload, all or nothing, before anything is claimed or written: its fields, kind and count, a
  // finite saved time, no duplicate recovery key, bounded sizes; then the save's own checks on a copy, with the Unwritten
  // Atlas rebuilt first as read() does (an atlas map is registered only then), and migration tried on another copy
  function qaRecords(recs) {
    const errs = [], previews = [], counts = {}, seen = new Set();
    if (!Array.isArray(recs) || !recs.length || recs.length > 6) return { errs: ['the payload is not a list of 1 to 6 records'], previews };
    recs.forEach((r, i) => {
      const at = 'record ' + (i + 1);
      if (!qaPlain(r) || Object.keys(r).sort().join() !== 'kind,savedAt,state') { errs.push(at + ': unexpected fields'); return; }
      if (!Object.prototype.hasOwnProperty.call(QA_KINDS, r.kind)) { errs.push(at + ': unknown kind'); return; }
      counts[r.kind] = (counts[r.kind] || 0) + 1;
      if (counts[r.kind] > QA_KINDS[r.kind]) errs.push(at + ': more ' + r.kind + ' records than a slot keeps');
      if (!Number.isInteger(r.savedAt) || r.savedAt <= 0) errs.push(at + ': saved time is not a finite whole number');
      const key = r.kind === 'auto' ? 'auto:' + r.savedAt : r.kind;
      if (seen.has(key)) errs.push(at + ': duplicates ' + key);
      seen.add(key);
      if (!qaPlain(r.state)) { errs.push(at + ': state missing'); return; }
      let size = 0;
      try { size = qaBytes(JSON.stringify(r.state)); } catch (e) { errs.push(at + ': state is not plain data'); return; }
      if (size > QA_MAX_STATE) { errs.push(at + ': state too large'); return; }
      if (r.state.player && typeof r.state.player.name === 'string' && r.state.player.name.length > QA_MAX_NAME) { errs.push(at + ': player name too long'); return; }
      const c = RB.util.deepClone(r.state);
      if (RB.atlas && RB.atlas.prepare) { try { RB.atlas.prepare(c); } catch (e) { errs.push(at + ': its atlas map could not be rebuilt'); return; } }
      const v = validate(c);
      if (v.length) { errs.push(at + ': ' + v.join('; ')); return; }
      try { migrate(RB.util.deepClone(c)); } catch (e) { errs.push(at + ': does not migrate (' + String((e && e.message) || e) + ')'); return; }
      const meta = metaOf(c);
      meta.savedAt = r.savedAt;
      previews.push({ kind: r.kind, savedAt: r.savedAt, meta, bytes: size, keys: Object.keys(r.state).map((k) => [k, qaBytes(JSON.stringify(r.state[k] === undefined ? null : r.state[k]))]) });
    });
    return { errs, previews };
  }
  // a file, checked in order: its size; the outer object; its version and schema; the checksum over the payload
  // string's exact UTF-8 bytes (before the payload is parsed, validated or migrated); then every record (qaRecords)
  async function qaCheck(text) {
    const fail = (why) => ({ ok: false, errors: [why] });
    if (typeof text !== 'string' || !text.length) return fail('no file text');
    if (text.length > QA_MAX_TEXT) return fail('the file is too large');
    let f;
    try { f = JSON.parse(text); } catch (e) { return fail('the file is not JSON (truncated?)'); }
    if (!qaPlain(f) || f.format !== QA_FORMAT) return fail('not a QA save file');
    if (Object.keys(f).some((k) => QA_KEYS.indexOf(k) < 0)) return fail('the file has unexpected fields');
    if (f.fv !== QA_FV) return fail('unknown file version ' + JSON.stringify(f.fv));
    if (!Number.isInteger(f.saveSchema) || f.saveSchema < 1) return fail('bad save schema');
    if (f.saveSchema > RB.SAVE_SCHEMA) return fail('saved by a newer version (schema ' + f.saveSchema + ')');
    if (!Number.isInteger(f.sourceSlot) || f.sourceSlot < 1 || f.sourceSlot > SLOTS) return fail('bad source slot');
    for (const k of ['label', 'exportedAt', 'gameVersion']) if (typeof f[k] !== 'string' || f[k].length > QA_MAX_FIELD) return fail('bad ' + k);
    if (typeof f.payload !== 'string' || typeof f.sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(f.sha256)) return fail('payload or checksum missing');
    if ((await qaHash(f.payload)) !== f.sha256) return fail('checksum mismatch: the file was changed or cut short');
    let recs;
    try { recs = JSON.parse(f.payload); } catch (e) { return fail('the payload is not JSON'); }
    const { errs, previews } = qaRecords(recs);
    if (errs.length) return { ok: false, errors: errs };
    return { ok: true, errors: [], file: f, records: recs, previews };
  }
  // one slot as stored (as copy() reads it): the manual save first, then recovery points by kind and time; key, rev,
  // slot, meta and thumb are left out (restore derives them), and nothing else is read (no settings, no other slot)
  async function qaExport(slot, label) {
    if (!Number.isInteger(slot) || slot < 1 || slot > SLOTS) throw new Error('No such slot.');
    const src = await kvGet('slots', slot);
    const recs = (await kvAll('recovery')).filter((r) => r && r.slot === slot);
    const out = [];
    if (src) out.push({ kind: 'manual', savedAt: src.meta && src.meta.savedAt, state: src.state });
    recs.sort((a, b) => (QA_ORDER[a.kind] - QA_ORDER[b.kind]) || (a.savedAt - b.savedAt));
    for (const r of recs) out.push({ kind: r.kind, savedAt: r.savedAt, state: r.state });
    if (!out.length) throw new Error('Nothing saved there.');
    const payload = JSON.stringify(out);
    const chk = qaRecords(JSON.parse(payload));
    if (chk.errs.length) throw new Error('This slot cannot be exported: ' + chk.errs.join('; '));
    const sha256 = await qaHash(payload);
    const file = { format: QA_FORMAT, fv: QA_FV, gameVersion: String(RB.VERSION || ''), saveSchema: RB.SAVE_SCHEMA, exportedAt: new Date().toISOString(), sourceSlot: slot, label: String(label || '').slice(0, QA_MAX_FIELD), payload, sha256 };
    return { text: JSON.stringify(file), sha256, payloadBytes: qaBytes(payload), previews: chk.previews };
  }
  // the target slot's write lock for the restore alone (claim() would make it this tab's journey; the tab's own current
  // slot and lock stay as they were). request() settles only once the lock is released, after success or failure.
  function qaWithLock(slot, fn) {
    if (current.lockRelease && current.lockSlot === slot) return fn();
    if (typeof navigator === 'undefined' || !navigator.locks) return fn();
    return navigator.locks.request('rbn-slot-' + slot, { ifAvailable: true }, (lock) => {
      if (!lock) throw new Error('Slot ' + slot + ' is open in another tab.');
      return fn();
    });
  }
  // a checked file into an empty slot: IndexedDB only; the slot empty (no manual save and no recovery record), checked
  // again inside the one transaction that writes every record; any failure aborts it, so nothing is written
  async function qaRestore(text, target) {
    if (mode !== 'idb') throw new Error('Restore needs IndexedDB storage, and this browser is ' + (mode === 'local' ? 'using its smaller localStorage instead.' : 'session-only.'));
    if (!Number.isInteger(target) || target < 1 || target > SLOTS) throw new Error('No such slot.');
    const c = await qaCheck(text);
    if (!c.ok) throw new Error('Not restored: ' + c.errors.join('; '));
    const slotsNow = await kvAll('slots'), recsNow = await kvAll('recovery');
    if (slotsNow.some((s) => s && s.slot === target)) throw new Error('Slot ' + target + ' is not empty.');
    if (recsNow.some((r) => r && r.slot === target)) throw new Error('Slot ' + target + ' still has recovery points (an autosave, pre-departure or suspend point).');
    // the campaign keeps its id unless another slot here holds it; then a fresh one, as copy() gives
    const ids = new Set();
    for (const r of slotsNow.concat(recsNow)) if (r && r.state) ids.add(r.state.id);
    const states = c.records.map((r) => RB.util.deepClone(r.state));
    const fresh = states.some((st) => ids.has(st.id)) ? RB.util.uid() : null;
    if (fresh) states.forEach((st) => { st.id = fresh; });
    const recs = c.records.map((r, i) => { const meta = metaOf(states[i]); meta.savedAt = r.savedAt; return { kind: r.kind, savedAt: r.savedAt, meta, state: states[i] }; });
    await qaWithLock(target, () => tx(['slots', 'recovery'], 'readwrite', async (t) => {
      const os = t.objectStore('slots'), rs = t.objectStore('recovery');
      if (await reqP(os.get(target))) throw new Error('Slot ' + target + ' was filled meanwhile.');
      if ((await reqP(rs.index('slot').getAllKeys(target))).length) throw new Error('Slot ' + target + ' has recovery points now.');
      for (const r of recs) {
        if (r.kind === 'manual') os.put({ slot: target, rev: 1, meta: r.meta, thumb: null, state: r.state });
        else rs.put({ key: r.kind === 'auto' ? target + ':auto:' + r.savedAt : target + ':' + r.kind, slot: target, kind: r.kind, savedAt: r.savedAt, meta: r.meta, thumb: null, state: r.state });
      }
    }));
    if (chan) chan.postMessage({ type: 'saved', slot: target, rev: 1, tab: tabId });
    return { slot: target, kinds: recs.map((r) => r.kind), idChanged: !!fresh };
  }

  const api = {
    detect, status, requestPersist, list, read, writeSlot, writeRecovery, del, copy, validate, migrate, addMigration,
    loadSettings, saveSettings, claim, takeOver, releaseLock, setReadOnly, setCurrent, manualSave, autosave, suspend, dropSuspend,
    ConflictError, SLOTS, current: () => current, _mode: () => mode, skippedInBattle: () => skippedInBattle,
  };
  if (qaGate()) api.qa = { exportSlot: qaExport, check: qaCheck, restore: qaRestore };
  return api;
})();
