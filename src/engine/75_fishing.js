/* A Quiet Cast — the fishing rules and records (Practice addendum §5, §6, §8,
 * §21; docs/practice/fishing.md). Presentation lives in src/ui/86_fishing*.js;
 * the sites, fish, situations and remarks are content (src/content/fishing/).
 *
 *   RB.fishing.addSite(def) / addFish(def) / addSituation(def) / addRemarks(comp, def)
 *   RB.fishing.st(s)                     s.practice.fishing, normalised (bounded records)
 *   RB.fishing.eligible(s, ctx)          { ok, why }: postgame, a registered site, safe placement
 *   RB.fishing.siteHere(s)               the site whose station the player stands at (or null)
 *   RB.fishing.preview(s, site, how, patch, look)  which fish a cast would bring (no change)
 *   RB.fishing.beginCast(s, o)           freeze species + situation + profile into fishing.active
 *   RB.fishing.abandon(s)                let an unresolved cast go (nothing observed or consumed)
 *   RB.fishing.commitCatch(s, seq, o)    the catch and its learning outcome, exactly once
 *   RB.fishing.entries(s) / counts(s)    the catalogue (Fishing notes)
 *   RB.fishing.remark(s, comp, kind, seed)  one authored remark (or null)
 *
 * Species are chosen when the cast is committed (Cast pressed) and frozen in
 * fishing.active: correctness, timing, neatness, companion, pet and animation
 * cannot change them. A per-site seeded queue of unseen species makes the first
 * three discovery catches reveal the three entries; afterwards a shuffled bag.
 * Abandoning consumes nothing. A monotonic cast sequence and the
 * lastCommittedCatchSeq watermark make a catch commit idempotent; the finite
 * milestones use RB.state.once. Nothing here awards bond. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.fishing = (function () {
  'use strict';
  const SITES = {}, FISH = {}, SITU = {}, REMARKS = {}, TEXT = {};
  const FISH_ORDER = [];
  const SITE_ORDER = [];
  const LIMITS = { recent: 50, situations: 12, count: 9999 };
  const PROFILES = ['F', 'E', 'I', 'A'];
  const MS = ['first', 'survey', 'frame', 'spread'];
  const now = () => Date.now();

  // ---- content registries ----------------------------------------------------------------------
  function addSite(def) { SITES[def.id] = def; if (SITE_ORDER.indexOf(def.id) < 0) SITE_ORDER.push(def.id); }
  function addFish(def) { FISH[def.id] = def; if (FISH_ORDER.indexOf(def.id) < 0) FISH_ORDER.push(def.id); }
  function addSituation(def) { SITU[def.id] = def; }
  function addRemarks(comp, def) { REMARKS[comp] = Object.assign(REMARKS[comp] || {}, def); }
  // interface labels with Japanese (validated like any other Japanese text)
  function addText(o) { Object.assign(TEXT, o); }
  const text = (k) => TEXT[k] || { jp: '', en: k };
  const site = (id) => SITES[id] || null;
  const fish = (id) => FISH[id] || null;
  const situation = (id) => SITU[id] || null;
  const situationsAt = (sid) => Object.keys(SITU).filter((k) => SITU[k].site === sid).sort();
  const patchOf = (sid, pid) => { const S = SITES[sid]; return S ? S.patches.find((p) => p.id === pid) || null : null; };

  // ---- state ------------------------------------------------------------------------------------------
  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  // The record lives in s.practice.fishing (created by RB.practice); this fills
  // the fields fishing adds and trims anything over its bounds. Unknown fish
  // ids from a later content change are kept (and shown as unavailable).
  function st(s) {
    const P = RB.practice.of(s);
    if (!P) return null;
    let F = P.fishing;
    if (!isObj(F)) F = P.fishing = RB.practice.fresh().fishing;
    if (!isObj(F.observed)) F.observed = {};
    if (!isObj(F.siteQueues)) F.siteQueues = {};
    if (!isObj(F.milestones)) F.milestones = {};
    if (!isObj(F.calibration)) F.calibration = {};
    if (!Array.isArray(F.recentAttempts)) F.recentAttempts = [];
    if (F.recentAttempts.length > LIMITS.recent) F.recentAttempts.splice(0, F.recentAttempts.length - LIMITS.recent);
    if (typeof F.lastCommittedCatchSeq !== 'number') F.lastCommittedCatchSeq = 0;
    if (typeof F.castSeq !== 'number') F.castSeq = F.lastCommittedCatchSeq || 0;
    if (F.castSeq < F.lastCommittedCatchSeq) F.castSeq = F.lastCommittedCatchSeq;
    if (typeof F.catches !== 'number') F.catches = 0;
    if (!Array.isArray(F.recentSituations)) F.recentSituations = [];
    if (F.recentSituations.length > LIMITS.situations) F.recentSituations.splice(0, F.recentSituations.length - LIMITS.situations);
    if (!isObj(F.outings)) F.outings = {};
    if (F.active && (!isObj(F.active) || typeof F.active.seq !== 'number' || F.active.seq <= F.lastCommittedCatchSeq)) F.active = null;
    if (F.active === undefined) F.active = null;
    return F;
  }
  function queue(s, sid) {
    const F = st(s), S = SITES[sid];
    let q = F.siteQueues[sid];
    if (!isObj(q)) q = F.siteQueues[sid] = {};
    if (!Array.isArray(q.order) || !S || q.order.length !== S.species.length || S.species.some((f) => q.order.indexOf(f) < 0)) {
      // the seeded order of this site's species, fixed for the campaign
      q.order = S ? RB.practice.stream(s, 'fish.queue', sid).shuffle(S.species) : [];
    }
    if (!isObj(q.bags)) q.bags = {};
    if (typeof q.refills !== 'number') q.refills = 0;
    if (q.look && (!FISH[q.look] || !F.observed[q.look])) q.look = null;
    return q;
  }
  const known = (s, id) => !!st(s).observed[id];
  const distinct = (s) => FISH_ORDER.filter((id) => known(s, id)).length;

  // ---- where you may fish (§3.2) -----------------------------------------------------------------
  // The player stands at the site's station (on its tile or one step away from it).
  function siteHere(s) {
    if (!s || !s.map) return null;
    for (const id of SITE_ORDER) {
      const S = SITES[id];
      if (S.map !== s.map) continue;
      const W = RB.world && RB.world.W && RB.world.W.player;
      const x = W ? W.x : s.x, y = W ? W.y : s.y;
      if (Math.abs(x - S.stand.x) + Math.abs(y - S.stand.y) <= 1) return id;
    }
    return null;
  }
  // World safety without requiring the companion (fishing can be played alone):
  // the plain world, no scene, no creature within six tiles.
  function worldSafe() {
    const G = RB.game;
    if (!G || !G.s) return { ok: false, why: 'Not in a campaign.' };
    const modes = ((G.G && G.G.modes) || []).filter((m) => m !== 'menu');
    if (modes[modes.length - 1] !== 'world') return { ok: false, why: 'Not just now.' };
    if (RB.script && RB.script.isRunning && RB.script.isRunning()) return { ok: false, why: 'Not in the middle of a scene.' };
    const W = RB.world && RB.world.W;
    if (W && W.player && (W.foes || []).some((f) => Math.abs(f.x - W.player.x) + Math.abs(f.y - W.player.y) <= 6)) return { ok: false, why: 'Not with a creature close by.' };
    return { ok: true };
  }
  function eligible(s, ctx) {
    ctx = ctx || {};
    if (!s) return { ok: false, why: 'Not in a campaign.' };
    if (!s.flags || !s.flags.postgame) return { ok: false, why: 'Yasu\'s survey begins once the journey has reached its end.' };
    const sid = ctx.site || siteHere(s);
    const S = sid && SITES[sid];
    if (!S) return { ok: false, why: 'Fishing is offered at its three stations: the Reedwake riverbank, the pond by the Lantern Road and the Saltglass quay.' };
    if (s.map !== S.map) return { ok: false, why: 'Go to the station first.' };
    if (siteHere(s) !== sid) return { ok: false, why: 'Stand at the station first.' };
    if (ctx.skipWorld) return { ok: true, site: sid };
    const w = worldSafe();
    return w.ok ? { ok: true, site: sid } : w;
  }

  // ---- choosing the fish (§5.4) -----------------------------------------------------------------------
  // how: 'discover' (the site's queue of unseen species; picks a compatible patch),
  //      'patch' (the chosen patch's fish, unseen first, then its bag),
  //      'look' (a known fish: guided to its patch, guaranteed there).
  // Returns { fish, patch, how, from } without changing anything.
  function preview(s, sid, how, pid, lookId) {
    const S = SITES[sid];
    if (!S) return null;
    const F = st(s), q = queue(s, sid);
    const patchFor = (f, prefer) => {
      const pp = prefer && patchOf(sid, prefer);
      if (pp && pp.fish.indexOf(f) >= 0) return pp.id;
      const p = S.patches.find((x) => x.fish.indexOf(f) >= 0);
      return p ? p.id : S.patches[0].id;
    };
    if (how === 'look') {
      const f = lookId || q.look;
      if (f && F.observed[f] && S.species.indexOf(f) >= 0) return { fish: f, patch: patchFor(f), how: 'look', from: 'look' };
      how = 'discover';
    }
    if (how === 'discover') {
      const unseen = q.order.filter((f) => !F.observed[f]);
      if (unseen.length) return { fish: unseen[0], patch: patchFor(unseen[0], pid), how: 'discover', from: 'queue' };
      // everything here is known: the site's bag, at a patch that has it
      const f = bagPeek(s, sid, null);
      return { fish: f, patch: patchFor(f, pid), how: 'discover', from: 'bag', bag: '*' };
    }
    const P = patchOf(sid, pid) || S.patches[0];
    // a pending "Look for this fish" is guaranteed on the next catch at its own patch
    if (q.look && P.fish.indexOf(q.look) >= 0) return { fish: q.look, patch: P.id, how: 'look', from: 'look' };
    const unseenHere = q.order.filter((f) => P.fish.indexOf(f) >= 0 && !F.observed[f]);
    if (unseenHere.length) return { fish: unseenHere[0], patch: P.id, how: 'patch', from: 'queue' };
    return { fish: bagPeek(s, sid, P.id), patch: P.id, how: 'patch', from: 'bag', bag: P.id };
  }
  // The next fish of a shuffled bag (per patch, or '*' for the whole site); refilled
  // from its own seeded stream when empty. Peeking never consumes.
  function bagPeek(s, sid, pid) {
    const S = SITES[sid], q = queue(s, sid);
    const key = pid || '*';
    const pool = pid ? patchOf(sid, pid).fish : S.species;
    let bag = q.bags[key];
    if (!Array.isArray(bag) || !bag.length || bag.some((f) => pool.indexOf(f) < 0)) {
      bag = q.bags[key] = RB.practice.stream(s, 'fish.bag', sid + '|' + key + '|' + q.refills).shuffle(pool);
      q.refills++;
    }
    return bag[0];
  }
  function bagTake(s, sid, key, f) {
    const q = queue(s, sid), bag = q.bags[key];
    if (!Array.isArray(bag)) return;
    const i = bag.indexOf(f);
    if (i >= 0) bag.splice(i, 1);
  }

  // ---- the situation (§6.2) and caller-side cooldown (§4.4) ----------------------------------------------
  // Never the identical situation twice running; one answered after a mistake waits
  // four casts; otherwise the least recently met, then a seeded choice.
  function pickSituation(s, sid, seq) {
    const F = st(s), all = situationsAt(sid);
    if (!all.length) return null;
    const hist = F.recentSituations;
    const last = hist.length ? hist[hist.length - 1].id : null;
    const allow = (id) => id !== last && !hist.slice(-4).some((h) => h.id === id && h.missed);
    let cands = all.filter(allow);
    if (!cands.length) cands = all.filter((id) => id !== last);
    if (!cands.length) cands = all;
    const age = (id) => { for (let i = hist.length - 1; i >= 0; i--) if (hist[i].id === id) return hist.length - i; return 1e6; };
    cands.sort((a, b) => age(b) - age(a) || (a < b ? -1 : 1));
    const top = cands.filter((id) => age(id) === age(cands[0]));
    return RB.practice.stream(s, 'fish.situation', sid + '|' + seq).pick(top.length ? top : cands);
  }

  // ---- who attended (snapshots at the time; never rewritten later) ------------------------------------------
  function attendance(s) {
    const W = RB.world && RB.world.W;
    const comp = s.comp && W && W.comp ? s.comp : null;
    let pet = null;
    try {
      const sp = RB.pets && RB.pets.active(s);
      if (sp && RB.pets.visible(s, 'world')) pet = { species: sp, name: (s.company.pets[sp] || {}).name || null, look: RB.pets.lookOf(s, sp) };
    } catch (e) { pet = null; }
    return { comp, pet };
  }

  // ---- a cast (§6.1 steps 1–2) ------------------------------------------------------------------------------
  // o: { site, how, patch, look, inputMode, pace: {kind, budgetSec}, attend? }
  function beginCast(s, o) {
    const F = st(s);
    const S = SITES[o.site];
    if (!S) return null;
    const pv = preview(s, o.site, o.how || 'patch', o.patch, o.look);
    if (!pv || !pv.fish) return null;
    const seq = ++F.castSeq;
    const sit = pickSituation(s, o.site, seq);
    const profile = PROFILES.indexOf(s.learn && s.learn.profile) >= 0 ? s.learn.profile : 'F';
    const att = o.attend || attendance(s);
    F.active = {
      seq, campaign: s.id || null, site: o.site, patch: pv.patch, fish: pv.fish, how: pv.how, from: pv.from, bag: pv.bag || null,
      situation: sit, profile, variant: sit ? sit + ':' + profile : null,
      inputMode: o.inputMode || null, representation: null,
      phase: 'cast', pace: { kind: (o.pace && o.pace.kind) || 'off', budgetMs: o.pace && o.pace.budgetSec ? o.pace.budgetSec * 1000 : null, activeMs: null },
      pauseReasons: [], expired: false, assistance: false, recognitionRepair: false, committed: false, draft: null,
      comp: att.comp, pet: att.pet ? { species: att.pet.species, name: att.pet.name } : null, t: now(),
    };
    if (pv.how === 'look') queue(s, o.site).look = pv.fish;
    return F.active;
  }
  function setPhase(s, seq, phase) { const F = st(s); if (F.active && F.active.seq === seq) F.active.phase = phase; }
  function abandon(s, seq) {
    const F = st(s);
    if (!F.active || (seq != null && F.active.seq !== seq)) return false;
    F.active = null;
    return true;
  }

  // ---- the catch, exactly once (§6.1 step 8, §21.2) ---------------------------------------------------------
  // o: { result (the step's result), paced, exposed, assess() -> the learning adapter's one event }
  function commitCatch(s, seq, o) {
    o = o || {};
    const F = st(s);
    if (typeof seq !== 'number' || seq <= F.lastCommittedCatchSeq) return { ok: false, dup: true };
    const a = F.active;
    if (!a || a.seq !== seq) return { ok: false, why: 'no-active' };
    const res = o.result || {};
    // the learning outcome: at most one ordinary mastery event (the adapter decides; a
    // paced, exposed or repaired attempt never touches mastery)
    let learned = false;
    try { learned = typeof o.assess === 'function' ? !!o.assess(a) : false; } catch (e) { learned = false; }
    const t = now();
    const prev = F.observed[a.fish];
    const isNew = !prev;
    if (isNew) F.observed[a.fish] = { first: { cast: a.seq, site: a.site, patch: a.patch, t, comp: a.comp || null, pet: a.pet || null, situation: a.situation }, count: 1 };
    else prev.count = Math.min(LIMITS.count, (prev.count | 0) + 1);
    // the queue moves by observation alone; a bag gives up the fish it gave
    if (a.from === 'bag' && a.bag) bagTake(s, a.site, a.bag, a.fish);
    const q = queue(s, a.site);
    if (a.how === 'look' && q.look === a.fish) q.look = null;
    const paced = o.paced || { kind: 'off' };
    F.recentAttempts.push({
      seq: a.seq, site: a.site, patch: a.patch, fish: a.fish, situation: a.situation, profile: a.profile,
      inputMode: res.mode || a.inputMode || null, ok: !!res.ok, firstTry: res.firstTry !== false, mistakes: res.mistakes | 0,
      assisted: !!res.assisted, exposed: !!o.exposed, recognitionRepair: !!(res.recogRepairs || res.misreads || paced.recognitionRepair),
      paceKind: paced.kind || 'off', budgetMs: paced.budgetMs == null ? null : paced.budgetMs, activeMs: paced.activeMs == null ? null : paced.activeMs,
      expired: !!paced.expired, learned, comp: a.comp || null, t,
    });
    if (F.recentAttempts.length > LIMITS.recent) F.recentAttempts.splice(0, F.recentAttempts.length - LIMITS.recent);
    F.recentSituations.push({ id: a.situation, missed: res.firstTry === false });
    if (F.recentSituations.length > LIMITS.situations) F.recentSituations.splice(0, F.recentSituations.length - LIMITS.situations);
    F.catches = (F.catches | 0) + 1;
    if (a.comp) F.outings[a.comp] = (F.outings[a.comp] | 0) + 1;
    F.lastCommittedCatchSeq = a.seq;
    F.active = null;
    // finite milestones, once each (§8.1)
    const n = distinct(s);
    const got = [];
    const mark = (k, extra) => { if (!F.milestones[k] && RB.state.once(s, 'fish:' + k)) { F.milestones[k] = Object.assign({ t, cast: a.seq, fish: a.fish }, extra || {}); got.push(k); } };
    mark('first');
    if (n >= 3) mark('survey', { ribbon: true });
    if (n >= 6) mark('frame');
    if (n >= 9) mark('spread');
    // a first completed outing together is a shared memory (no bond)
    let memory = null;
    if (a.comp && s.comp === a.comp && RB.company && RB.company.memory) {
      const M = memoryText('outing', a.comp);
      if (M && RB.company.memory(s, Object.assign({ id: 'fish:outing', kind: 'together', place: placeOf(a.site), ref: { kind: 'fishing', id: a.fish } }, M))) memory = 'fish:outing';
    }
    RB.bus && RB.bus.emit('fishing:catch', { seq: a.seq, fish: a.fish, site: a.site, isNew, milestones: got.slice() });
    return { ok: true, seq: a.seq, fish: a.fish, site: a.site, patch: a.patch, situation: a.situation, isNew, distinct: n, milestones: got, memory, learned, comp: a.comp, pet: a.pet };
  }
  const placeOf = (sid) => { const S = SITES[sid]; return S ? { en: S.name.en, jp: S.name.jp } : null; };
  // memory texts are authored with the remarks (content); comp-specific replies optional
  function memoryText(kind, comp) {
    const R = REMARKS.__memories && REMARKS.__memories[kind];
    if (!R) return null;
    return { title: R.title, text: R.text, reply: comp && R.reply ? R.reply[comp] || null : null };
  }
  // The shared reflection after all nine (§8.1): companion version only when they are there.
  function reflect(s, o) {
    const F = st(s);
    if (!F.milestones.spread) return { ok: false, why: 'Not yet: all nine first.' };
    const r = F.milestones.reflection || (F.milestones.reflection = {});
    const t = now();
    if (o && o.comp) {
      if (r.shared) return { ok: false, dup: true };
      r.shared = { t, comp: o.comp, choice: o.choice || null };
      const M = memoryText('reflection', o.comp);
      if (M && RB.company && RB.company.memory) RB.company.memory(s, Object.assign({ id: 'fish:reflection', kind: 'reflections', place: placeOf(o.site), lines: o.lines || null }, M));
      return { ok: true, shared: true };
    }
    if (r.solo) return { ok: false, dup: true };
    r.solo = { t, choice: (o && o.choice) || null };
    return { ok: true, shared: false };
  }
  // the survey's introduction: from Yasu himself, or from his signed note at a station
  function intro(s, via) {
    const F = st(s);
    if (F.milestones.intro) return false;
    F.milestones.intro = { t: now(), via: via || 'note' };
    return true;
  }
  function ribbon(s, on) {
    const F = st(s);
    if (!F.milestones.survey) return false;
    if (on != null) F.milestones.survey.ribbon = !!on;
    return F.milestones.survey.ribbon !== false;
  }

  // ---- the catalogue (§8.1) ------------------------------------------------------------------------------------
  function entries(s) {
    const F = st(s);
    const list = FISH_ORDER.map((id) => {
      const o = F.observed[id];
      return { id, def: FISH[id], known: !!o, count: o ? o.count : 0, first: o ? o.first : null };
    });
    // a later content change may have dropped an id: kept, shown as unavailable
    for (const id in F.observed) if (!FISH[id]) list.push({ id, def: null, known: true, count: F.observed[id].count, first: F.observed[id].first, unavailable: true });
    return list;
  }
  function counts(s) {
    const n = distinct(s);
    return { known: n, total: FISH_ORDER.length, catches: st(s).catches | 0, survey: Math.min(3, n) };
  }

  // ---- companion remarks (§8.3) -------------------------------------------------------------------------------------
  // kinds: first, wait, catch, discover, stop, survey (+ reflection lines). seed picks a variant.
  function remark(s, comp, kind, seed) {
    const R = REMARKS[comp];
    const L = R && R[kind];
    if (!L || !L.length) return null;
    const pick = L[((seed | 0) % L.length + L.length) % L.length];
    return RB.dialect ? RB.dialect.line(comp, pick) : pick; // shown as she speaks (Suzu's Kansai-ben, src/lang/85_dialect.js)
  }

  // ---- conditions: fish.intro, fish.survey, fish.frame, fish.spread, fish.count>=n, fish.seen.<id> ---------------
  if (RB.state && RB.state.addTerm) {
    RB.state.addTerm('fish', (s, rest, op, val, num, cmp) => {
      if (!s || !s.practice) return op ? cmp(0, op, num(val)) : false;
      const F = st(s);
      if (rest === 'count') return cmp(distinct(s), op || '>=', num(val || 1));
      if (rest && rest.indexOf('seen.') === 0) return !!F.observed[rest.slice(5)];
      if (rest === 'intro') return !!F.milestones.intro;
      if (rest === 'reflection') return !!(F.milestones.reflection && (F.milestones.reflection.shared || F.milestones.reflection.solo));
      if (MS.indexOf(rest) >= 0) return !!F.milestones[rest];
      return false;
    });
  }

  // everything authored, for the content validator (tools/validate.mjs) and the tests
  const content = () => ({ sites: SITES, fish: FISH, situations: SITU, remarks: REMARKS, text: TEXT });

  return {
    LIMITS, PROFILES, MS, SITES, FISH, SITU, FISH_ORDER, SITE_ORDER,
    addSite, addFish, addSituation, addRemarks, addText, text, site, fish, situation, situationsAt, patchOf,
    st, queue, known, distinct, siteHere, worldSafe, eligible, preview, pickSituation, attendance,
    beginCast, setPhase, abandon, commitCatch, reflect, intro, ribbon, entries, counts, remark, memoryText, content,
  };
})();
