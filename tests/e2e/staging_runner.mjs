// A data-driven runner for staged overworld scenes (docs/expressive/SCENES.md "Performed overworld"; the
// expressive addendum §11–§13, §16), used by tests/e2e/staging_chapters.mjs. Each case is a synthetic fixture
// of the moment a scene plays — its map, where you stand, your companion, the flags, quests and items it needs —
// not a campaign played to it. Each case lists the branches that matter (choice picks, companions, flags); every
// branch is played through, answering choices in order, and a challenge, activity, battle, lesson, card, rest,
// shop or menu inside a scene is answered by a stand-in (their own runners are tested elsewhere). The same stand-ins
// serve the staged, the reduced-motion and the unstaged runs, so the three can be compared.
//
// Per branch (staged, normal motion):
// - the scene plays to its end;
// - every cue (!gesture, !look, !pose, !prop, !walkto) names somebody who is there (no cue dropped on the floor);
// - every authored position is reached (each !walkto arrives; nobody is left stuck on the way);
// - no two people share a tile and nobody stands on furniture, at any frame;
// - nobody's idle life plays during the scene;
// - afterwards everyone is where the world expects them: people moved for the scene are back at their places
//   (or on their way, unstuck), nobody is left walking, your companion is beside you;
// - the gestures the case expects are cued (what the scene is about).
// Per case (its first branch, unless --branches): the same branch with reduced motion cues the same people with the
// same gestures in the same order and ends in the same state; and with staging switched off it ends in exactly the
// same state (flags, inventory, quests, variables, notes, seen scenes): direction changes nothing.
// the in-page run of one branch of one case
export async function runBranch(p, c, v, o) {
  return p.evaluate(async ([c, v, o]) => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const flags = Object.assign({}, c.flags || {}, v.flags || {});
    const comp = v.comp !== undefined ? v.comp : c.comp;
    const at = v.at || c.at;
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.reducedMotion = !!o.reduced; RB.game.applySettings();
    RB.game.debugStart(v.map || c.map, at ? at[0] : null, at ? at[1] : null, { comp: comp || undefined, flags, dir: at ? at[2] : 'up' });
    const s = RB.game.s;
    if (!comp) { s.comp = null; RB.world.placeCompanion(); }
    for (const [k, n] of Object.entries(Object.assign({}, c.items || {}, v.items || {}))) RB.state.give(s, k, n);
    for (const [k, st] of Object.entries(Object.assign({}, c.quests || {}, v.quests || {}))) RB.state.setQuest(s, k, st);
    Object.assign(s.vars, c.vars || {}, v.vars || {});
    // deduction cases already open, or solved, at the moment the scene plays (src/engine/59_cases.js)
    for (const [id, st] of Object.entries(Object.assign({}, c.cases || {}, v.cases || {}))) { const r = RB.cases.open(s, id); if (r && st === 'done') r.stage = 'done'; }
    // the companion's bond at that moment (src/engine/06_company.js: 3 rhythm, 6 trusted, 10 lasting)
    const bond = v.bond != null ? v.bond : c.bond;
    if (bond != null && s.company) s.company.bond = { fixture: bond };
    // records the company keeps at that moment, e.g. The Pages We Keep's project (src/content/pages/10_pages.js)
    for (const [k, val] of Object.entries(Object.assign({}, c.company || {}, v.company || {}))) if (s.company) s.company[k] = JSON.parse(JSON.stringify(val));
    Object.assign(s.player, c.player || {}, v.player || {});
    for (const w of (c.words || []).concat(v.words || [])) if (!s.words.includes(w)) s.words.push(w);
    // the creatures on the maps stay out of it (a patrol reaching you would start a battle mid-scene)
    for (const m in RB.content.maps) for (const f of RB.content.maps[m].foes || []) s.flags['foe:' + m + ':' + f.id] = true;
    // no map's arrival scene runs on its own around the scene under test
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    if (c.prov || v.prov) s.provisional = v.prov || c.prov;
    RB.world.refreshActors();
    if (comp) RB.world.placeCompanion();
    // stand-ins for what a scene hands over to other screens (the same in every run)
    const pass = !(v.fail || c.fail);
    RB.challenge.run = async () => ({ ok: pass });
    RB.activities.run = async () => ({ ok: pass });
    RB.game.startBattle = async () => 'win';
    if (RB.lessons) { RB.lessons.run = async () => {}; RB.lessons.grammarCard = async () => {}; }
    RB.ui.card = async () => {}; RB.game.rest = async () => {};
    RB.ui.shop = async () => {}; if (RB.ui.menu) RB.ui.menu.open = async () => {};
    RB.save.autosave = async () => {};
    if (RB.hooks) RB.hooks.suzu_speech = async () => {}; // (her speech setting is asked in its own panel)
    RB.staging.enabled(!!o.staged);
    RB.staging.seed(7);
    await sleep(300);
    const W = RB.world.W;
    const name = (ref) => (typeof ref === 'string' ? ref : ref === W.player ? 'pc' : ref === W.comp ? 'comp' : ref && ref.id);
    // the cue log, and whether each cue named somebody who is there
    const log = [], lost = [], walks = [], unfit = [];
    // a companion who arrived on your tile by the follow rule (a doorway, nothing free behind you), until the scene
    // moves it off or gives it anything else to do
    const start0 = W.comp && W.comp.x === W.player.x && W.comp.y === W.player.y ? [W.comp.x, W.comp.y] : null;
    let compCued = false;
    const wrap = (fn, kind) => {
      const f0 = RB.staging[fn];
      RB.staging[fn] = function (ref, a1) {
        const here = !!RB.staging.actor(ref);
        if (kind !== 'walkto' && W.comp && RB.staging.actor(ref) === W.comp) compCued = true;
        if (!here) lost.push(kind + ' ' + name(ref) + ' ' + (a1 == null ? '' : a1));
        if (kind === 'gesture') log.push(name(ref) + ':' + a1);
        const r = f0.apply(this, arguments);
        // a gesture this person cannot make, with nothing in its place (a non-human figure asked for a hand gesture)
        if (kind === 'gesture' && here && o.staged && a1 !== '-' && !r) unfit.push(name(ref) + ':' + a1);
        if (kind === 'walkto') { const rec = { who: name(ref), to: a1 + ',' + arguments[2] }; walks.push(rec); return Promise.resolve(r).then((ok) => { rec.ok = ok; return ok; }); }
        return r;
      };
      return () => { RB.staging[fn] = f0; };
    };
    const unwrap = [wrap('cue', 'gesture'), wrap('look', 'look'), wrap('pose', 'pose'), wrap('prop', 'prop'), wrap('walkTo', 'walkto')];
    // every frame: nobody shares a tile, nobody stands on furniture, nobody idles
    const clash = [], walkin = [], furn = [], idle = [];
    let watching = true;
    const watch = () => {
      if (!watching) return;
      // (a following companion on your own tile at a doorway is the game's follow rule, not staging)
      const same = W.comp && W.comp.x === W.player.x && W.comp.y === W.player.y;
      const follow = same && (!RB.staging.owned(W.comp) || (start0 && !compCued && W.comp.x === start0[0] && W.comp.y === start0[1]));
      const all = W.npcs.concat(W.extras || [], W.comp && !follow ? [W.comp] : [], [W.player]);
      const seen = new Map();
      for (const a of all) for (const [x, y] of [[a.x, a.y]].concat(a.mv ? [[a.mv.tx, a.mv.ty]] : [])) {
        const k = W.map.id + '@' + x + ',' + y;
        // (the world's comings and goings — a speaker walking in, someone the story moves to a new place — step
        // round people since the walk-round fix, 50_world.js routeRound/followRoute: passing through someone
        // now fails like any clash. Only a walker who found no way round and waited its 2.4 s before going on
        // through (a.forced) is recorded apart, as the world's fallback, not staging's)
        const world = (b) => !!b.forced;
        if (seen.has(k) && seen.get(k) !== a) (world(a) || world(seen.get(k)) ? walkin : clash).push(k + ' ' + (a.id || 'pc') + '/' + (seen.get(k).id || 'pc'));
        seen.set(k, a);
        if (RB.maps.blockedStatic(W.map, x, y)) furn.push((a.id || 'pc') + '@' + k);
      }
      if (RB.script.isRunning()) for (const a of all) if (a.stg && a.stg.run && a.stg.run.owner === 'idle') idle.push(a.id || 'pc');
      requestAnimationFrame(watch);
    };
    requestAnimationFrame(watch);
    let done = false, err = null;
    // talked to: the person you talk to turns to you (50_world.js talkTo) and the scene knows who they are
    const talk = v.talk !== undefined ? v.talk : c.talk;
    if (talk) { const n = RB.staging.actor(talk); if (n) RB.world.faceTo(n, W.player.x, W.player.y); }
    // (the history length is taken before the scene starts: a hook's narration can be its first line, shown in the
    // same tick as the run begins)
    let seenLines = s.backlog.length;
    RB.script.run(c.scene, talk ? { npc: (RB.staging.actor(talk) || {}).id || talk } : undefined).then(() => { done = true; }, (e) => { err = String(e); done = true; });
    const picks = (v.picks || c.picks || []).slice();
    const lines = [], chose = [];
    const t0 = performance.now();
    while (!done && performance.now() - t0 < 60000) {
      await sleep(25);
      const bs = document.querySelectorAll('.choices:not(.hidden) button');
      if (bs.length) {
        const k = picks.length ? picks.shift() : 0;
        chose.push(k);
        (bs[k] || bs[0]).click();
        await sleep(80);
        continue;
      }
      const sh = RB.ui.dialogue.shown();
      if (!sh || !RB.ui.dialogue.isOpen() || s.backlog.length === seenLines) continue;
      seenLines = s.backlog.length;
      await sleep(o.dwell);
      lines.push((sh.who || '') + ': ' + (sh.en || '').slice(0, 48));
      if (o.shots && o.shots.includes(lines.length - 1)) { window.__shotReady = lines.length - 1; const ts = performance.now(); while (window.__shotReady != null && performance.now() - ts < 8000) await sleep(30); }
      RB.ui.dialogue.advance(true);
    }
    // afterwards: those moved for the scene walk back; wait until nobody is walking (bounded)
    const t1 = performance.now();
    // (a wanderer's own steps on their round are their life, not a walk the scene left unfinished)
    const walking = (a) => a.route || (a.mv && !(a.def && a.def.wander));
    const busy = () => W.npcs.concat(W.extras || [], W.comp ? [W.comp] : []).some(walking);
    // (still for a moment: a walk of several steps is briefly between steps, neither moving nor routed)
    await sleep(120);
    // (bounded at 5 s; a case whose story moves someone across the map — the world walks them there, 50_world.js
    // shiftTo — names a longer bound, `settle`, with the reason in its fixture; they must still arrive)
    const bound = v.settle || c.settle || 5000;
    for (let calm = 0; calm < 5 && performance.now() - t1 < bound; await sleep(60)) calm = busy() ? 0 : calm + 1;
    await sleep(150);
    watching = false;
    unwrap.forEach((u) => u());
    const stuck = W.npcs.concat(W.extras || [], W.comp ? [W.comp] : []).filter(walking).map((a) => (a.id || 'comp') + '@' + a.x + ',' + a.y);
    const quests = Object.fromEntries(Object.entries(s.quests).map(([k, q]) => [k, { stage: q.stage, done: q.done }]));
    const state = JSON.stringify({ map: W.map.id, flags: Object.keys(s.flags).filter((f) => !/^enter:|^named:|^trig:|^foe:/.test(f)).sort(), inv: s.inv, quests, vars: s.vars, notes: s.notebook.map((x) => x.id).sort(), seen: Object.keys(s.seen).sort(), comp: s.comp || null });
    const away = W.npcs.filter((a) => a.home && (a.x !== a.home[0] || a.y !== a.home[1]) && !(a.def && a.def.wander)).map((a) => a.id + '@' + a.x + ',' + a.y + '≠' + a.home.join(','));
    const compGap = W.comp ? Math.abs(W.comp.x - W.player.x) + Math.abs(W.comp.y - W.player.y) : 0;
    return { done, err, lines, chose, log, lost, unfit, walks, state, clash: [...new Set(clash)], walkin: [...new Set(walkin)], furn: [...new Set(furn)], idle: [...new Set(idle)], away, stuck, compGap, map: W.map.id };
  }, [c, v, o]);
}

// the branches of a case: its listed variants (each optionally × the four companions)
export function branchesOf(c) {
  const vs = c.variants && c.variants.length ? c.variants : [{}];
  const out = [];
  for (const v of vs) {
    const comps = v.comps || c.comps;
    if (comps) for (const cp of comps) out.push(Object.assign({}, v, { comp: cp, name: (v.name ? v.name + ' · ' : '') + (cp || 'alone') }));
    else out.push(Object.assign({ name: v.name || '' }, v));
  }
  return out;
}

// play every case; o: { page, ok, dwell, branches (compare every branch, not only the first), filter }
export async function runCases(cases, o) {
  const { ok } = o;
  for (const c of cases) {
    if (o.filter && !o.filter(c)) continue;
    const bs = branchesOf(c);
    for (let i = 0; i < bs.length; i++) {
      const v = bs[i];
      const tag = (c.ch ? 'Ch' + c.ch + ' ' : '') + c.scene + (v.name ? ' (' + v.name + ')' : '');
      const p = await o.page();
      const r = await runBranch(p, c, v, { staged: true, dwell: o.dwell });
      const pre = tag + ': ';
      ok(r.done && !r.err && r.lines.length >= (v.minLines || c.minLines || 1), pre + 'plays to its end (' + r.lines.length + ' lines' + (r.err ? '; ' + r.err : '') + ')');
      ok(r.lost.length === 0 && r.unfit.length === 0, pre + 'every cue names somebody who is there and can make it' + (r.lost.length + r.unfit.length ? ' (' + r.lost.concat(r.unfit).slice(0, 4).join('; ') + ')' : ''));
      const bad = r.walks.filter((w) => !w.ok);
      ok(bad.length === 0, pre + 'every authored position is reached (' + r.walks.length + ' walks' + (bad.length ? '; not reached: ' + bad.map((w) => w.who + '→' + w.to).join(' ') : '') + ')');
      ok(r.clash.length === 0 && r.furn.length === 0, pre + 'nobody shares a tile or stands on furniture' + (r.clash.length + r.furn.length ? ' (' + r.clash.concat(r.furn).slice(0, 3).join(' ') + ')' : '') + (r.walkin.length ? ' [the world\'s fallback, no way round so it went on through after waiting: ' + r.walkin.slice(0, 2).join(' ') + ']' : ''));
      ok(r.idle.length === 0, pre + 'no idle life during the scene' + (r.idle.length ? ' (' + r.idle.join(' ') + ')' : ''));
      ok(r.away.length === 0 && r.stuck.length === 0 && r.compGap <= 2, pre + 'afterwards everyone is where the world expects them (' + (r.away.concat(r.stuck).join(' ') || 'at their places') + '; companion ' + r.compGap + ' tiles away)');
      const exp = Object.assign({}, c.expect || {}, v.expect || {});
      for (const [who, gs] of Object.entries(exp)) {
        const got = r.log.filter((x) => x.startsWith(who + ':') || (who === 'comp' && v.comp && x.startsWith(v.comp + ':'))).map((x) => x.split(':')[1]);
        ok(gs.every((g) => got.includes(g)), pre + who + ' performs ' + gs.join(', ') + ' (cued: ' + ([...new Set(got)].join(', ') || 'nothing') + ')');
      }
      if (i === 0 || o.branches) {
        const rm = await runBranch(p, c, v, { staged: true, reduced: true, dwell: o.dwell });
        ok(rm.done && rm.log.join(' ') === r.log.join(' ') && rm.state === r.state, pre + 'reduced motion keeps the cues and their order, and the outcome' + (rm.log.join(' ') === r.log.join(' ') ? '' : '\n      normal  ' + r.log.join(' ') + '\n      reduced ' + rm.log.join(' ')));
        const u = await runBranch(p, c, v, { staged: false, dwell: 15 });
        ok(u.done && u.state === r.state, pre + 'staged and unstaged end in the same state' + (u.state === r.state ? '' : '\n      staged   ' + r.state + '\n      unstaged ' + u.state));
      }
      if (o.after) await o.after(p, c, v, r);
    }
  }
}
