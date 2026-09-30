/* Companionship: the rules that make the committed companion a person with a
 * perspective (the Living Company addendum, §6–9 and §19; docs/addendum/company.md).
 * Built on the shared core in 06_company.js (award, memory, react).
 *
 * Bond (§8): unique story events only, never negative, capped at 12.
 *   ch2 … ch5   +1 each  a chapter completed with the committed companion (not Chapter 1)
 *   pq          +3       the committed companion's own quest completed
 *   puzzle:<r>  +1       a substantial puzzle or case solved together: one per region, three in all
 *   reflect:travel / reflect:keep  +1 each  the two journey reflections (content/company)
 *   ending +2, project:1..3 +1 each  (the ending and The Pages We Keep call award themselves)
 *   Recruitment is zero. No deductions, decay, timers, gifts, petting or loops.
 *   Older saves: a load-time migration reconstructs the verified milestones
 *   (chapter flags, the companion's quest) silently and once; nothing else.
 *
 * Presence (§7.3–7.5, §19):
 *   thought(s)            what is on their mind now (recent result > quest > rest > place)
 *   pending(s)/openPending  one proactive topic (an invitation or a journey reflection)
 *   say(s, ev)            the one short remark for a resolved event; the longer thought is filed
 *   react(s, ev)          replaces the core's: + once, cooldown, required facts, tone, recency
 *   restHere(s)           a safe rest setting (inn, teahouse, hut, camp) or null
 *   addRestOption(fn)     more choices for the rest menu (the pet greeting)
 *   safeHere()            may a conversation be played here and now?
 *
 * Nothing here touches battle, support actions, Harmony, rewards, answers,
 * difficulty or the personal ending. Presentation happens after the state is
 * committed and never writes award-bearing state. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.hooks = RB.hooks || {};
RB.content.company = RB.content.company || {
  bios: {},      // comp -> { summary: [{ when?, jp, en }], first: { jp, en } }
  mem: {},       // story memory texts: key -> { title, text, place, reply: { comp: {jp,en} }, keep: { comp: {jp,en} } }
  thoughts: [],  // { comp, kind: 'recent'|'quest'|'rest'|'any', on?, when?, prio?, text: {jp,en} }
  places: [],    // { comp, where: key | [keys], when?, lines: [{ jp, en, expr? }] }
  invites: [],   // { id, comp?, when, solved?, expire?, scene: { comp: id }, after?: { comp: id }, prio? }
  topics: [],    // { id, comp, slot 1..6, stage, title: {jp,en}, when, scene, reflect? }
  rituals: {},   // comp -> { title: {jp,en}, scene }
  decisions: [], // { id, flags: [..], scene?, record?: { label: value } } watched campaign decisions
  pets: {},      // comp -> { species | '*': {jp,en} } words on meeting an animal
};

(function (K) {
  'use strict';
  const CC = RB.content.company;
  const PQ = { suzu: 'co_suzu', nao: 'lf_nao', mio: 'lf_mio', ren: 'ren_ushio' };
  const C = (s) => s.company || (s.company = RB.state.newCampaign().company);
  const T = (s) => C(s).talk;
  const game = () => (RB.game && RB.game.s ? RB.game : null);
  const hasDom = () => typeof document !== 'undefined';

  // ---- where are we ------------------------------------------------------------------------------
  // a place key for thoughts and "Talk about this place": the region, with the interiors and the
  // side areas put back where they belong
  const PREFIX = { rw: 'reedwake', sg: 'saltglass', co: 'cinder', sb: 'snowbell', lf: 'lanternfall', sa: 'sa_mount' };
  function placeKey(s) {
    const id = String(s.map || '');
    if (id.startsWith('lq.koharu')) return 'koharuno';
    if (id.startsWith('sg.da_')) return 'archive';
    const m = RB.content.maps[id];
    const r = m && m.region;
    if (r && r !== 'interior') return r;
    return PREFIX[id.split('.')[0]] || r || 'road';
  }
  function placeName(s) {
    const m = RB.content.maps[s.map];
    return m && m.name ? { jp: m.name.jp || '', en: m.name.en || '' } : null;
  }
  // safe rest settings that already exist: inns, the teahouse, huts, camps (never a dungeon corridor)
  const REST = {
    'rw.tea': 'tea', 'sg.inn': 'inn', 'co.inn': 'inn', 'sb.inn': 'inn', 'sb.inn_room': 'room', 'lf.inn': 'inn',
    'sa.hut': 'hut', 'sa.camp': 'camp', 'lq.koharu_hut': 'hut',
  };
  function restHere(s) {
    if (!s || !s.map) return null;
    if (REST[s.map]) return { kind: REST[s.map], map: s.map };
    const m = RB.content.maps[s.map];
    // an Atlas camp: the generated camp room carries the camp's own scene on its stump
    if (m && m.region === 'atlas' && (m.props || []).some((p) => p.scene === 'atlas.camp')) return { kind: 'camp', map: s.map, atlas: true };
    return null;
  }
  // May a conversation be played here and now? Never in a battle, a scene, a transition or a
  // challenge; never when the companion is not beside you (nobody is walked in or teleported);
  // never with a creature close by. Called from the folio too (the 'menu' mode over the world).
  function safeHere() {
    const g = game();
    if (!g || !hasDom()) return { ok: false, why: 'none' };
    const modes = (g.G.modes || []).filter((m) => m !== 'menu');
    if (modes[modes.length - 1] !== 'world') return { ok: false, why: 'busy' };
    if (RB.script.isRunning()) return { ok: false, why: 'busy' };
    const W = RB.world.W;
    if (!W.map || !W.comp || !g.s.comp) return { ok: false, why: 'apart' };
    if ((W.foes || []).some((f) => Math.abs(f.x - W.player.x) + Math.abs(f.y - W.player.y) <= 6)) return { ok: false, why: 'danger' };
    return { ok: true };
  }

  // ---- conditions: talk.<id>[=value]  rest[=kind] ------------------------------------------------
  RB.state.addTerm('talk', (s, rest, op, val, num, cmp) => {
    const r = s.company && s.company.talk && s.company.talk[rest];
    if (!op) return !!r;
    const v = r == null ? 'none' : typeof r === 'object' ? (r.v != null ? r.v : r.choice != null ? r.choice : r.st) : r;
    return cmp(String(v), op, String(val));
  });
  RB.state.addTerm('rest', (s, rest, op, val) => {
    const r = restHere(s);
    if (!op) return !!r;
    return !!r && (op === '!=' ? r.kind !== val : r.kind === val);
  });

  // ---- memories ------------------------------------------------------------------------------------
  // A story memory from authored text, kept once. `how` 'load' marks one reconstructed from a
  // verified milestone when an older journey was loaded: its wording is the companion's view now.
  // authored text may vary with the recorded state: [{ when, jp, en }, …] — the first that holds
  function resolve(s, v) {
    if (!Array.isArray(v)) return v || null;
    const hit = v.find((x) => !x.when || RB.state.test(s, x.when));
    return hit ? { jp: hit.jp, en: hit.en } : null;
  }
  const byComp = (s, o) => resolve(s, o && (o[s.comp] || o['*']));
  function storyMemory(s, key, how, extra) {
    const def = CC.mem[key];
    const comp = s.comp;
    if (!def || !comp) return false;
    const id = 'story:' + key;
    if (C(s).memories.some((m) => m.id === id)) return false;
    const m = Object.assign({
      id, kind: def.kind || 'together', title: def.title, text: byComp(s, def.texts) || resolve(s, def.text), reply: byComp(s, def.reply), place: def.place || placeName(s),
    }, extra || {});
    if (how === 'load') m.retro = true;
    return K.memory(s, m);
  }

  // ---- bond: verified milestones ----------------------------------------------------------------------
  function milestones(s) {
    const out = [];
    if (!s || !s.comp) return out;
    const f = s.flags || {};
    for (const n of [2, 3, 4, 5]) if (f['ch' + n + '_done']) out.push({ id: 'ch' + n, pts: 1 });
    const q = (s.quests || {})[PQ[s.comp]];
    if (q && q.done) out.push({ id: 'pq', pts: 3 });
    return out;
  }
  // Award the milestones that the save verifiably records, and keep their memories. Idempotent.
  // how: 'live' (after a scene settled) or 'load' (an older journey being loaded).
  function sync(s, how) {
    if (!s || !s.comp || !s.flags) return [];
    const got = [];
    if (s.flags.departed) storyMemory(s, 'recruit', how);
    if (s.flags.lq_ally1) storyMemory(s, 'lq1', how);
    if (s.flags.lq_ally2) storyMemory(s, 'lq2', how);
    for (const m of milestones(s)) {
      if (K.award(s, m.id, m.pts)) got.push(m.id);
      const key = m.id === 'pq' ? 'pq_' + s.comp : m.id;
      const q = m.id === 'pq' ? s.quests[PQ[s.comp]] : null;
      storyMemory(s, key, how, q && q.t ? { t: q.t } : null);
    }
    return got;
  }
  // campaign decisions the companion may think about afterwards (content/company/60_decisions.js)
  function watchDecisions(s, how) {
    const t = T(s);
    for (const d of CC.decisions) {
      if (!d.flags || !d.flags.some((f) => s.flags[f])) continue;
      if (t['seen:' + d.id]) continue;
      t['seen:' + d.id] = how === 'load' ? 'legacy' : Date.now();
      if (how !== 'load') markRecent(s, 'dec:' + d.id, 'decision');
    }
  }
  function markRecent(s, id, kind) {
    T(s)._recent = { id, kind, pt: Math.round(s.playtime || 0), where: placeKey(s) };
  }
  // older journeys: rebuild only what the save verifiably records; no memories of events it
  // cannot prove, no reactions, nothing for the unchosen companions. Registered with
  // RB.save.addMigration by src/content/company/10_core.js (the save module loads after this file).
  function migrate(st) {
    if (!st || !st.company || !st.flags) return;
    if (!st.company.talk || typeof st.company.talk !== 'object') st.company.talk = {};
    sync(st, 'load');
    watchDecisions(st, 'load');
  }

  // ---- reactions (§7.5): the core's selection, with the policy the addendum asks for -------------------
  // An entry may add: once (at most once per campaign across events), cooldown (not again within the
  // last n remarks while another fits), known (a condition naming facts the companion must know),
  // tone (preferred when the event asks for one), thought ({jp,en}: the longer thought for Company).
  function react(s, ev) {
    const comp = s.comp || s.provisional;
    if (!comp || !ev || !ev.id) return null;
    const c = C(s);
    const kept = c.react[ev.id];
    if (kept) return K.reactions.find((r) => r.id === kept) || null;
    const facts = ev.facts || {};
    const used = new Set(Object.values(c.react));
    let ok = K.reactions.filter((r) => r.comp === comp && r.event === ev.event &&
      (!r.when || RB.state.test(s, r.when)) && (!r.known || RB.state.test(s, r.known)) &&
      (!r.facts || Object.keys(r.facts).every((k) => facts[k] === r.facts[k])) &&
      (!r.once || !used.has(r.id)));
    if (!ok.length) return null;
    const recent = c.talk._recent_r || [];
    const fresh = ok.filter((r) => { const i = recent.lastIndexOf(r.id); return i < 0 || recent.length - i > (r.cooldown != null ? r.cooldown : 3); });
    if (fresh.length) ok = fresh;
    const top = Math.max(...ok.map((r) => r.priority || 0));
    let best = ok.filter((r) => (r.priority || 0) === top);
    if (ev.tone) { const tb = best.filter((r) => r.tone === ev.tone); if (tb.length) best = tb; }
    const pick = best[RB.util.hashStr(ev.id) % best.length]; // deterministic; never the game's random stream
    c.react[ev.id] = pick.id;
    c.talk._recent_r = recent.concat(pick.id).slice(-8);
    return pick;
  }
  // the longer thought behind a remark, kept for Company (ids only: the words stay in the content)
  function fileThought(s, ev, r) {
    if (!r || !r.thought) return;
    const t = T(s);
    const list = (t._filed || []).filter((x) => x.id !== ev.id);
    list.push({ id: ev.id, r: r.id, t: Date.now() });
    t._filed = list.slice(-6);
  }
  function canShow() {
    const g = game();
    if (!g || !hasDom()) return false;
    return RB.script.isRunning() || g.mode() === 'world';
  }
  // The one automatic remark for a resolved event (§7.4): chosen once (react), said at most once,
  // the longer thought filed for Company. Not safe to speak now (a battle, the folio): it waits for
  // the next quiet moment. Returns the reaction (or null when nothing is authored).
  async function say(s, ev) {
    const r = react(s, ev);
    if (!r) return null;
    fileThought(s, ev, r);
    const t = T(s);
    if (t['said:' + ev.id]) return r;
    if (!game() || s !== RB.game.s) { t['said:' + ev.id] = 1; return r; }
    if (!canShow()) { t._remark = { id: ev.id, event: ev.event, facts: ev.facts || null }; return r; }
    t['said:' + ev.id] = 1;
    if (t._remark && t._remark.id === ev.id) delete t._remark;
    const comp = s.comp || s.provisional;
    const lines = (r.lines || []).map((l) => ({ who: l.who || comp, expr: l.expr || r.expr || null, jp: l.jp, en: l.en }));
    if (!lines.length) return r;
    if (RB.script.isRunning()) { for (const l of lines) await RB.ui.dialogue.say(l); }
    else await RB.script.runInline(lines);
    return r;
  }
  function flushRemark() {
    const g = game();
    if (!g) return;
    const s = g.s, t = T(s);
    if (!t._remark) return;
    if (g.mode() !== 'world' || RB.script.isRunning()) return;
    const ev = t._remark;
    if (t['said:' + ev.id]) { delete t._remark; return; }
    say(s, ev);
  }

  // Describers let the systems that own a puzzle or a case name it for the memory:
  // addDescriber('puzzle', (id, ev) => ({ title:{jp,en}, text:{jp,en}, ref?:{kind,id} }))
  const DESCRIBE = {};
  function addDescriber(kind, fn) { DESCRIBE[kind] = fn; }
  // a case names itself from its own record (RB.cases, src/engine/59_cases.js) when present
  function describeCase(ev) {
    if (ev.kind !== 'case' || !RB.cases || !RB.cases.def) return null;
    const cd = RB.cases.def(ev.id);
    if (!cd) return null;
    const jt = (o) => (o && o.jp != null && o.en != null ? { jp: o.jp, en: o.en } : null);
    return { title: jt(cd.title), text: jt(cd.result), ref: { kind: 'case', id: ev.id } };
  }
  // A substantial puzzle or case resolved (discovery:resolved, after the result is committed):
  // bond once per region (three in all), the reaction chosen once (the same stored choice the
  // owning system reads), a Discoveries memory, the longer thought filed for Company. This
  // listener never speaks: the system that owns the moment shows the line (a field puzzle's
  // completion shows the reaction's first line, src/ui/57_weave.js; a case's scene calls say()
  // through its case_react hook), so the remark is never said twice.
  function onResolved(s, ev) {
    if (!s || !ev || !ev.kind || !ev.id) return;
    // the event is '<kind>:<id>' (what reactions are authored for); the resolution id is the
    // contract's id2 ('case:<id>:done') when given, so a say() from the system's own scene and
    // this listener pick, store and speak the same single remark
    const evName = ev.kind + ':' + ev.id;
    const rid = ev.id2 || evName;
    if (s.comp && !ev.minor) {
      const region = ev.region || rid;
      const used = Object.keys(C(s).bond).filter((k) => k.startsWith('puzzle:'));
      if (used.length < 3 && !used.includes('puzzle:' + region)) K.award(s, 'puzzle:' + region, 1);
    }
    const r = react(s, { id: rid, event: evName, facts: Object.assign({ method: ev.method }, ev.preserved != null ? { preserved: ev.preserved } : {}) });
    if (r) fileThought(s, { id: rid }, r);
    const d = (DESCRIBE[ev.kind] && DESCRIBE[ev.kind](ev.id, ev)) || describeCase(ev) || {};
    const words = r && r.lines && r.lines[0] ? { jp: r.lines.map((l) => l.jp).join(' '), en: r.lines.map((l) => l.en).join(' ') } : null;
    K.memory(s, {
      id: 'disc:' + evName, kind: 'discoveries',
      title: d.title || ev.title || (ev.kind === 'case' ? { jp: '{解|と}けた {謎|なぞ}', en: 'A case worked out together' } : { jp: '{解|と}けた {仕掛|しか}け', en: 'A puzzle solved together' }),
      text: d.text || ev.text || null, reply: words, place: ev.place || placeName(s), method: ev.method || null,
      ref: d.ref || (ev.kind === 'case' ? { kind: 'case', id: ev.id } : ev.keepsake ? { kind: 'keepsake', id: ev.keepsake } : null),
      react: r ? r.id : null,
    });
    markRecent(s, rid, 'discovery');
  }
  RB.bus.on('discovery:resolved', (ev) => { const g = game(); if (g) onResolved(g.s, ev); });

  // an animal met on the road: a Pets memory with the companion's words then (the pet worker
  // records the meeting itself; the name kept here is the one it had that day)
  function onPetMet(s, ev) {
    const comp = s && (s.comp || s.provisional);
    if (!comp || !ev || !ev.species) return;
    // an authored meeting (src/content/pets/) keeps its own memory once the animal is named: one
    // meeting, one memory, with the name the player chose; these words are for a meeting without one
    if (RB.pets && RB.pets.meeting && RB.pets.meeting[ev.species]) return;
    const p = (C(s).pets || {})[ev.species] || {};
    const sp = RB.pets && RB.pets.species ? RB.pets.species(ev.species) : null;
    const words = (CC.pets[comp] && (CC.pets[comp][ev.species] || CC.pets[comp]['*'])) || null;
    K.memory(s, {
      id: 'pet:' + ev.species, kind: 'pets', species: ev.species, petName: p.nameAtMeet || p.name || null,
      title: { jp: '{出会|であ}い', en: 'Meeting ' + (sp && sp.label ? sp.label.en || ev.species : ev.species) },
      text: sp && sp.label ? { jp: sp.label.jp || '', en: 'A ' + (sp.label.en || ev.species).toLowerCase() + ' found its way to you.' } : null,
      reply: words, place: placeName(s),
    });
  }
  RB.bus.on('pet:met', (ev) => { const g = game(); if (g) onPetMet(g.s, ev); });

  // ---- thoughts (§6.2, §7.3): an interpretation of the present, never a hint ---------------------------
  const RECENT_SECONDS = 25 * 60;
  function recent(s) {
    const r = T(s)._recent;
    if (!r) return null;
    if ((s.playtime || 0) - (r.pt || 0) > RECENT_SECONDS) return null;
    if (r.where && r.where !== placeKey(s)) return null;
    return r;
  }
  const holds = (s, e) => !e.when || RB.state.test(s, e.when);
  const choose = (s, list, salt) => {
    if (!list.length) return null;
    const top = Math.max(...list.map((e) => e.prio || 0));
    const best = list.filter((e) => (e.prio || 0) === top);
    return best[RB.util.hashStr(salt) % best.length];
  };
  function placeEntries(s, comp) {
    const k = placeKey(s);
    return CC.places.filter((e) => e.comp === comp && [].concat(e.where).includes(k) && holds(s, e));
  }
  function thought(s) {
    const comp = s.comp || s.provisional;
    if (!comp) return null;
    const salt = comp + ':' + s.map + ':' + (s.chapter || 0);
    const rc = recent(s);
    if (rc) {
      // a remark's filed thought, or an authored thought about that result
      const f = (T(s)._filed || []).find((x) => x.id === rc.id);
      const r = f && K.reactions.find((x) => x.id === f.r);
      if (r && r.thought && r.comp === comp) return { kind: 'recent', id: rc.id, text: r.thought };
      const e = choose(s, CC.thoughts.filter((x) => x.comp === comp && x.on === rc.id && holds(s, x)), salt);
      if (e) return { kind: 'recent', id: rc.id, text: e.text };
    }
    const q = choose(s, CC.thoughts.filter((x) => x.comp === comp && x.kind === 'quest' && holds(s, x)), salt);
    if (q) return { kind: 'quest', text: q.text };
    const rest = restHere(s);
    if (rest) {
      const e = choose(s, CC.thoughts.filter((x) => x.comp === comp && x.kind === 'rest' && holds(s, x)), salt);
      if (e) return { kind: 'rest', text: e.text };
    }
    const p = choose(s, placeEntries(s, comp), salt);
    if (p) return { kind: 'place', text: p.lines[0] };
    const a = choose(s, CC.thoughts.filter((x) => x.comp === comp && x.kind === 'any' && holds(s, x)), salt);
    return a ? { kind: 'any', text: a.text } : null;
  }
  // "Talk about this place": the lines for here (a short exchange), or null
  function placeTalk(s) {
    const comp = s.comp;
    if (!comp) return null;
    const e = choose(s, placeEntries(s, comp), comp + ':' + s.map + ':talk:' + (s.chapter || 0));
    return e ? e.lines.map((l) => ({ who: l.who || comp, expr: l.expr || null, jp: l.jp, en: l.en })) : null;
  }

  // ---- proactive topics (§7.4): one pending at a time ---------------------------------------------------
  // Story invitations (a context predicate, an expiry, the result-aware reflection when solved first)
  // and the two journey reflections (How We Travel after Chapter 2, What We Keep after Chapter 4).
  const REFLECT = [
    { id: 'reflect:travel', when: 'ch2_done', scene: (c) => 'co.reflect_travel_' + c },
    { id: 'reflect:keep', when: 'ch4_done', scene: (c) => 'co.reflect_keep_' + c },
  ];
  const inviteOf = (id) => CC.invites.find((x) => x.id === id) || null;
  const forComp = (x, comp) => !x.comp || x.comp === comp;
  function refresh(s) {
    if (!s || !s.comp) return;
    const t = T(s);
    const comp = s.comp;
    const cur = t._pending;
    if (cur) {
      const inv = inviteOf(cur);
      const rec = t[cur] || {};
      if (inv) {
        if ((rec.st === 'pending' || rec.st === 'deferred') && inv.solved && RB.state.test(s, inv.solved)) {
          t[cur] = Object.assign({}, rec, { st: inv.after ? 'after' : 'closed', solvedFirst: true, t: Date.now() });
          if (!inv.after) t._pending = null;
        } else if ((rec.st === 'pending' || rec.st === 'deferred') && inv.expire && RB.state.test(s, inv.expire)) {
          t[cur] = Object.assign({}, rec, { st: 'expired', t: Date.now() });
          t._pending = null;
        } else if (rec.st === 'after' && inv.expire2 && RB.state.test(s, inv.expire2)) {
          t[cur] = Object.assign({}, rec, { st: 'closed' });
          t._pending = null;
        }
      } else if (!REFLECT.some((r) => r.id === cur)) t._pending = null; // content removed: let it go
      else if (t[cur] && /^(answered|done)$/.test(t[cur].st)) t._pending = null;
    }
    // a new story invitation whose moment is now (it has a moment; a waiting journey reflection can
    // step aside for it and come back afterwards)
    const invs = CC.invites.filter((x) => forComp(x, comp) && !t[x.id] && RB.state.test(s, x.when) &&
      !(x.solved && RB.state.test(s, x.solved)) && !(x.expire && RB.state.test(s, x.expire)));
    invs.sort((a, b) => (b.prio || 0) - (a.prio || 0));
    if (t._pending && !(invs[0] && REFLECT.some((r) => r.id === t._pending))) return;
    if (invs[0]) { t._pending = invs[0].id; t[invs[0].id] = { st: 'pending', t: Date.now() }; return; }
    // otherwise a journey reflection that is due (late journeys too: retrospective wording in the scene)
    for (const r of REFLECT) {
      const rec = t[r.id];
      if (RB.state.test(s, r.when) && (!rec || rec.st === 'pending' || rec.st === 'deferred') && RB.content.scenes[r.scene(comp)]) {
        t._pending = r.id;
        if (!rec) t[r.id] = { st: 'pending', t: Date.now() };
        return;
      }
    }
  }
  // what is pending: { id, st, scene, reflect?, quiet } or null. quiet: deferred (no world indicator)
  function pending(s) {
    if (!s || !s.comp) return null;
    const t = T(s);
    const id = t._pending;
    if (!id) return null;
    const rec = t[id] || { st: 'pending' };
    const inv = inviteOf(id);
    const rf = REFLECT.find((r) => r.id === id);
    const pick = (o) => (typeof o === 'string' ? o : o && (o[s.comp] || o['*']));
    const scene = inv ? pick(rec.st === 'after' ? inv.after : inv.scene) : rf ? rf.scene(s.comp) : null;
    if (!scene || !RB.content.scenes[scene]) return null;
    return { id, st: rec.st, scene, reflect: !!rf, quiet: rec.st === 'deferred', title: inv ? inv.title : null };
  }
  // world indicator and the HUD: a pending, not deferred topic, in plain walking
  function indicator(s) {
    const p = pending(s);
    return !!(p && !p.quiet);
  }

  // ---- rest (§19.2) ----------------------------------------------------------------------------------------
  const REST_OPTS = [];
  function addRestOption(fn) { REST_OPTS.push(fn); }
  function restOptions(s, setting) {
    const out = [];
    for (const f of REST_OPTS) {
      try { const o = f(s, setting); if (o) out.push(o); } catch (e) { console.warn('rest option', e); }
    }
    return out;
  }
  // the six rest topics (content/company/40_topics.js): unlocked by real progress, tense by state
  function topics(s) {
    const comp = s && s.comp;
    if (!comp) return [];
    return CC.topics.filter((x) => x.comp === comp && RB.state.test(s, x.when)).sort((a, b) => a.slot - b.slot)
      .map((x) => Object.assign({ heard: !!(T(s)['t:' + x.id] || (x.reflect && T(s)[x.reflect] && /^(answered|done)$/.test(T(s)[x.reflect].st))) }, x));
  }
  function nextTopic(s) { return topics(s).find((x) => !x.heard) || null; }

  // ---- scene hooks ---------------------------------------------------------------------------------------------
  const S = () => RB.game.s;
  // !hook co_answer <topic> <choice>: the player answered an invitation or reflection
  RB.hooks.co_answer = async (a) => {
    const s = S(), t = T(s), id = a[0];
    t[id] = Object.assign({}, t[id] || {}, { st: 'answered', choice: a[1] || null, t: Date.now() });
    // answered: the slot is free again (what they said is remembered: talk.<id>=<choice>)
    if (t._pending === id) t._pending = null;
    RB.bus.emit('company:changed', { id });
  };
  // !hook co_defer <topic>: Not now. Free; the topic stays (quietly) while it is relevant
  RB.hooks.co_defer = async (a) => {
    const s = S(), t = T(s), id = a[0];
    t[id] = Object.assign({}, t[id] || {}, { st: 'deferred', t: Date.now() });
    RB.bus.emit('company:changed', { id });
  };
  // !hook co_done <topic>: a conversation finished (a follow-up, a rest topic)
  RB.hooks.co_done = async (a) => {
    const s = S(), t = T(s), id = a[0];
    const prev = t[id] || {};
    t[id] = Object.assign({}, prev, { st: 'done', t: Date.now() });
    if (t._pending === id) t._pending = null;
    refresh(s);
    RB.bus.emit('company:changed', { id });
  };
  // !hook co_heard <topicId> [choice]: a rest topic heard (no bond: companionship, not points)
  RB.hooks.co_heard = async (a) => {
    const s = S(), t = T(s);
    const prev = t['t:' + a[0]];
    t['t:' + a[0]] = { t: Date.now(), n: ((prev && prev.n) || 0) + 1, choice: a[1] || (prev && prev.choice) || null };
  };
  // !hook co_bond <reflect:travel|reflect:keep>: the two journey reflections, once each
  RB.hooks.co_bond = async (a) => {
    const s = S();
    if (a[0] !== 'reflect:travel' && a[0] !== 'reflect:keep') return;
    K.award(s, a[0], 1);
  };
  // !hook co_note <decision> <value>: forward recording of a choice the story keeps no flag for
  // (kept as talk['d.<decision>'], so conditions can read it: talk.d.<decision>=<value>)
  RB.hooks.co_note = async (a) => {
    const s = S(), t = T(s);
    if (t['d.' + a[0]]) return;
    t['d.' + a[0]] = { v: a[1] || null, t: Date.now() };
    if (CC.decisions.some((d) => d.id === a[0])) markRecent(s, 'dec:' + a[0], 'decision');
  };
  // Forward recording for a choice the story keeps no flag for: a `!hook co_note <id> <value>` is
  // placed at the start of each reply's branch (each branch is only ever reached by its jump; the
  // unit test company_bond checks every placement). Old saves simply have no record: a neutral line.
  function recordAt(sceneId, label, id, value) {
    const sc = RB.content.scenes[sceneId];
    const i = sc && sc.labels[label];
    if (i == null) return false;
    const prev = sc.cmds[i - 1];
    if (!prev || !/^(goto|end|choice)$/.test(prev.op)) return false; // a fall-through would record the wrong reply
    if (Object.keys(sc.labels).some((k) => k !== label && sc.labels[k] === i)) return false;
    const c = sc.cmds[i];
    if (c && c.op === 'hook' && c.args[0] === 'co_note') return true; // already placed
    sc.cmds.splice(i, 0, { op: 'hook', args: ['co_note', id, value], if: null, line: c ? c.line : 0, file: 'company/record' });
    for (const k in sc.labels) if (sc.labels[k] > i) sc.labels[k]++;
    return true;
  }
  // !hook co_keep_recall: What We Keep names one moment the save actually records (or says honestly
  // that it is the whole road); the lines come from the memory's authored callback
  RB.hooks.co_keep_recall = async () => {
    const s = S();
    const m = keepMoment(s);
    const t = T(s);
    t['reflect:keep'] = Object.assign({}, t['reflect:keep'] || {}, { moment: m ? m.id : null });
    for (const l of keepLines(s, m)) await RB.ui.dialogue.say(l);
  };
  // !hook co_remember <kind> <id>: keep a reflection as a memory, with what was said then
  RB.hooks.co_remember = async (a) => {
    const s = S();
    const def = CC.mem[a[1]];
    if (!def || !s.comp) return;
    const t = T(s);
    const rec = t[a[2] || a[1]] || {};
    const lines = (s.backlog || []).slice(-12).filter((l) => l.jp || l.en).slice(-8).map((l) => ({ who: l.who, jp: l.jp, en: RB.script.enVars(l.en), choice: !!l.choice }));
    const m = t['reflect:keep'] && t['reflect:keep'].moment;
    K.memory(s, {
      id: 'story:' + a[1], kind: a[0] || 'reflections', title: def.title, text: byComp(s, def.texts) || resolve(s, def.text),
      reply: byComp(s, def.reply), place: placeName(s), lines, choice: rec.choice || null, about: m || null,
    });
  };
  // What We Keep: prefer the companion's own story, then something solved together, a meeting,
  // the long roads, then a chapter; only moments this journey actually recorded
  const KEEP_ORDER = ['story:pq_', 'disc:', 'pet:', 'story:lq2', 'story:lq1', 'story:ch4', 'story:ch3', 'story:ch2'];
  function keepMoment(s) {
    const ms = C(s).memories.filter((m) => m.comp === s.comp || m.comp == null);
    for (const pre of KEEP_ORDER) {
      const hit = ms.filter((m) => m.id.startsWith(pre)).pop();
      if (hit) return hit;
    }
    return null;
  }
  function keepLines(s, m) {
    const comp = s.comp;
    const def = CC.keep || {};
    const say = (o, expr) => o ? [{ who: comp, expr: expr || null, jp: o.jp, en: o.en }] : [];
    if (!m) return say(def.none && def.none[comp], 'think');
    const key = m.id.startsWith('story:') ? m.id.slice(6) : null;
    const own = key && CC.mem[key] && CC.mem[key].keep && byComp(s, CC.mem[key].keep);
    if (own) return say(own, 'smile');
    // a discovery or a meeting: the companion's framing around the recorded title
    const frame = def.frame && def.frame[comp];
    if (!frame || !m.title) return say(def.none && def.none[comp], 'think');
    const title = m.kind === 'pets' && m.petName ? null : m.title;
    const jpT = title ? title.jp : '';
    const enT = title ? title.en : (m.petName || '');
    return say({ jp: frame.jp.replace('%T', jpT ? '「 ' + jpT + ' 」' : 'あの {日|ひ}'), en: frame.en.replace('%T', enT ? '"' + enT + '"' : 'that day') }, 'smile');
  }

  // Company and world entry points into conversations (all run through the normal dialogue runner)
  async function openPending() {
    const s = S();
    const p = pending(s);
    if (!p) return false;
    await RB.script.run(p.scene);
    refresh(s);
    RB.bus.emit('company:talk', { id: p.id });
    return true;
  }
  RB.hooks.co_place = async () => {
    const lines = placeTalk(S());
    if (!lines) return;
    for (const l of lines) await RB.ui.dialogue.say(l);
  };
  RB.hooks.co_thought = async () => {
    const s = S(), th = thought(s);
    if (th) await RB.ui.dialogue.say({ who: s.comp, jp: th.text.jp, en: th.text.en });
  };
  // the game's own banter for here (90_game.js companionTalk uses the same filter)
  let chatBypass = false;
  function banterHere(s) {
    return (RB.content.banter || []).some((b) => b.comp === s.comp && (!b.map || b.map === s.map || (b.map.endsWith('*') && String(s.map).startsWith(b.map.slice(0, -1)))) && (!b.if || RB.state.test(s, b.if)));
  }
  // the rest menu: a small ritual, the next rest topic, anything added (the pet greeting), or just rest
  RB.hooks.co_rest = async () => {
    const s = S();
    const setting = restHere(s);
    if (!setting || !s.comp) return;
    const rit = CC.rituals[s.comp];
    const top = nextTopic(s);
    const extra = restOptions(s, setting);
    const opts = [];
    // the ordinary talk comes first where there is some (the ritual and the topic are opt-in extras,
    // §19.2: confirming straight away does what talking to the companion always did)
    if (banterHere(s)) opts.push({ jp: '{少|すこ}し {話|はな}す', en: 'Just chat', run: () => { chatBypass = true; try { RB.game.companionTalk(); } finally { chatBypass = false; } } });
    if (rit) opts.push({ jp: rit.title.jp, en: rit.title.en, run: () => RB.script.run(rit.scene) });
    if (top) opts.push({ jp: '{話|はな}す ： ' + top.title.jp, en: 'Talk: ' + top.title.en, run: () => RB.script.run(top.scene) });
    for (const o of extra) opts.push({ jp: o.label.jp, en: o.label.en, run: o.run });
    opts.push({ jp: '{今|いま} は いい', en: 'Not now', run: null });
    const i = await RB.ui.dialogue.choose(opts, {});
    const o = opts[i];
    s.backlog.push({ who: 'pc', jp: o.jp, en: o.en, choice: true });
    if (o && o.run) await o.run();
  };
  // !hook co_topic: the next rest topic here (used by Company's "Rest together")
  RB.hooks.co_topic = async () => {
    const s = S(), top = nextTopic(s);
    if (top) await RB.script.run(top.scene);
  };

  // ---- the story settles: milestones, decisions, invitations, a waiting remark --------------------------------
  function settle() {
    const g = game();
    if (!g || !g.s) return;
    const s = g.s;
    const got = sync(s, 'live');
    for (const id of got) markRecent(s, 'bond:' + id, 'milestone');
    watchDecisions(s, 'live');
    refresh(s);
    RB.bus.emit('company:changed', {});
    if (hasDom() && T(s)._remark) setTimeout(flushRemark, 0);
  }
  RB.bus.on('story:settled', settle);
  RB.bus.on('map:enter', () => { const g = game(); if (g && g.s) { refresh(g.s); RB.bus.emit('company:changed', {}); if (hasDom() && T(g.s)._remark) setTimeout(flushRemark, 30); } });
  // talking to the companion in the world: a pending topic first, the rest menu at a rest setting;
  // otherwise the usual banter (90_game.js companionTalk)
  RB.bus.on('companion:chat', (ev) => {
    const g = game();
    if (!g || !g.s || !g.s.comp || ev.handled || chatBypass) return;
    const s = g.s;
    refresh(s);
    const p = pending(s);
    if (p && !p.quiet && safeHere().ok) { ev.handled = true; openPending(); return; }
    if (restHere(s) && safeHere().ok) { ev.handled = true; RB.script.run('co.rest'); }
  });

  // ---- the world indicator: a small folded note over the companion while a topic waits ------------------------
  let noteArt = null;
  function makeNote() {
    // 15×15 buffer px: an inked, folded paper slip with lines of writing and a small tail toward the
    // companion (the shape carries it, not the colour; drawn 1:1 like the emote bubbles)
    const cv = RB.sprites.makeCanvas(15, 15), g = cv.getContext('2d');
    const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    R(1, 0, 13, 12, '#2a2024'); R(0, 1, 15, 10, '#2a2024');
    R(1, 1, 13, 10, '#fffaf0'); R(2, 1, 11, 1, '#ffffff'); R(1, 10, 13, 1, '#e3d7bf');
    R(10, 1, 4, 4, '#e3d7bf'); R(10, 1, 1, 4, '#2a2024'); R(10, 4, 4, 1, '#2a2024'); // the folded corner
    R(3, 4, 6, 1, '#2a2024'); R(3, 6, 9, 1, '#2a2024'); R(3, 8, 7, 1, '#6a5a48');
    R(2, 12, 3, 2, '#2a2024'); R(3, 12, 1, 1, '#fffaf0'); R(1, 14, 2, 1, '#2a2024');
    return cv;
  }
  function drawIndicator(c, v, t) {
    const g = game();
    if (!g || g.mode() !== 'world') return;
    const W = RB.world.W;
    if (!W.comp || !indicator(g.s)) return;
    if (!noteArt) noteArt = makeNote();
    const bob = RB.game.reducedMotion() ? 0 : Math.round(Math.sin(t / 420) * 1.5);
    const ATS = v.TS * v.ART;
    const x = v.ax(W.comp.fx * v.TS) + ATS / 2 + 5;
    const y = v.ay(W.comp.fy * v.TS) - v.HEAD - 16 + bob;
    c.drawImage(noteArt, Math.round(x), Math.round(y));
    last.t = typeof performance !== 'undefined' ? performance.now() : 0;
  }
  const last = { t: -1e9 };

  Object.assign(K, {
    react, say, sync, milestones, thought, placeTalk, placeKey, restHere, safeHere, refresh, pending, indicator,
    openPending, addRestOption, restOptions, topics, nextTopic, addDescriber, keepMoment, keepLines, drawIndicator,
    settle, onResolved, onPetMet, resolve, migrate, recordAt, PQ, REFLECT, REST, indicatorShown: () => typeof performance !== 'undefined' && performance.now() - last.t < 400,
  });
})(RB.company);
