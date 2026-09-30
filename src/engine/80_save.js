/* Persistence: six campaign slots in IndexedDB (localStorage fallback,
 * session-only as last resort), bounded recovery snapshots, schema
 * validation, revision checks and cross-tab ownership (spec §14).
 * There is deliberately no export/import of saves. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.save = (function () {
  'use strict';
  const DB_NAME = 'road-of-borrowed-names';
  const DB_VER = 1;
  const SLOTS = 6;
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
    for (const k of ['company', 'discovery', 'creatures', 'awarded']) if (k in st && (!st[k] || typeof st[k] !== 'object' || Array.isArray(st[k]))) errs.push('bad ' + k);
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
      chapter: st.chapter,
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
        rev: r ? r.rev : 0,
      });
    }
    // a failed read is not six empty slots: the ledger shows an error with Try again
    if (readError) out.readError = readError;
    return out;
  }

  class ConflictError extends Error {}

  async function writeSlot(slot, st, opts) {
    opts = opts || {};
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
    const clean = trimForSave(RB.util.deepClone(st));
    const now = Date.now();
    const key = kind === 'predeparture' ? slot + ':predeparture' : slot + ':auto:' + now;
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
    if (which === 'auto' || which === 'predeparture') {
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
  async function manualSave(slot) {
    const st = RB.game.s;
    const same = slot === current.slot;
    const rec = await writeSlot(slot, st, { thumb: RB.render.thumbnail(), expectRev: same ? current.rev : null });
    if (!same) { await claim(slot); current.rev = rec.rev; }
    if (persisted == null || persisted === false) requestPersist();
    return rec;
  }
  async function autosave(kind) {
    if (current.slot == null || current.readOnly) return null;
    try {
      return await writeRecovery(current.slot, RB.game.s, kind === 'predeparture' ? 'predeparture' : 'auto', RB.render.thumbnail());
    } catch (e) {
      lastError = String(e.message || e);
      RB.bus.emit('save:error', { error: e });
      return null;
    }
  }

  return {
    detect, status, requestPersist, list, read, writeSlot, writeRecovery, del, copy, validate, migrate, addMigration,
    loadSettings, saveSettings, claim, takeOver, releaseLock, setReadOnly, setCurrent, manualSave, autosave,
    ConflictError, SLOTS, current: () => current, _mode: () => mode,
  };
})();
