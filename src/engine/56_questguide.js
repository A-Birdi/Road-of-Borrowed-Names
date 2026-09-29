/* Quest guidance: where the next step of a quest happens, derived honestly
 * from the content itself, and the words that point there.
 *
 * Derivation (docs/CONTENT.md §4 "Where the next step happens"):
 * - Every scene entry point in the world is indexed: people you can talk to
 *   (each `talk` option), props with a scene, triggers, a map's onEnter
 *   events and foes whose defeat runs a scene. Each scene's effects — and
 *   those of every scene it `!call`s — are indexed too (quest stages set,
 *   flags set, items given, vars changed, scenes seen).
 * - A small interpreter walks the scene an entry would run, exactly as the
 *   script runner would, on a copy of the state: line conditions, `!if`,
 *   `!goto`, `!end`, `!call`, and every reply of a `!choice` (the player
 *   chooses). A challenge, activity or battle can go either way.
 * - A target is an entry that runs now (its conditions hold, it is the talk
 *   option that would be chosen) and whose scene can raise the quest past
 *   its current stage. Quest updates marked `quiet` (bookkeeping, no toast)
 *   count only when nothing else does.
 * - When nothing advances the quest yet, the interpreter also explores the
 *   way not taken at each condition and records what would have to become
 *   true ("needs"). The entries that can make those needs true now are the
 *   targets (two levels deep: a need of a need). Needs the player cannot
 *   bring about (a companion, a profile, a flag that would have to be unset,
 *   an earlier stage of this quest) are never followed.
 * - More than MAX_TARGETS places: none is marked (the objective says "ask
 *   around"); none at all: the quest is waiting on the journey.
 * - Authored per-stage fields override the derivation: `at` ({map, npc} |
 *   {map, prop, x, y} | {map, x, y} | {map}, or a list of those, or 'open')
 *   and `hint` ({jp, en}, shown as the second nudge).
 *
 * The same interpreter, run with every condition not about this quest
 * treated as unknown (both ways possible), gives the static per-stage
 * targets the unit test lists for every quest stage in the game.
 *
 * Which quest is followed is kept per campaign in the optional `s.follow`
 * (a quest id, '-' for none; absent in older saves: the main road). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.questGuide = (function () {
  'use strict';
  const MAX_TARGETS = 6;   // more candidate places than this: none is marked
  const PATHS = 260;       // paths explored per entry point
  const STEPS = 3000;      // commands walked per path
  const HYPO = 2;          // ways not taken per path (live analysis)
  const NEEDS = 6;         // missing conditions per path
  const UNK = '\u0000?';   // an outcome not known yet (var._res after a challenge)
  const OPS = { '>=': '<', '<=': '>', '!=': '=', '==': '!=', '=': '!=', '>': '<=', '<': '>=' };

  // ---- content index ---------------------------------------------------------------
  let IX = null;
  function index() {
    if (IX) return IX;
    const C = RB.content;
    const entries = [];
    for (const map in C.maps) {
      const d = C.maps[map];
      (d.npcs || []).forEach((n, i) => {
        if (!n.talk) return;
        const opts = typeof n.talk === 'string' ? [{ scene: n.talk }] : n.talk.filter((o) => o && o.scene);
        if (opts.length) entries.push({ kind: 'npc', map, id: n.id, who: n.char || n.id, x: n.x, y: n.y, if: n.if || null, opts, def: n, key: map + '|npc|' + n.id + '|' + i });
      });
      (d.props || []).forEach((p, i) => {
        if (p.scene) entries.push({ kind: 'prop', map, p: p.p, x: p.x, y: p.y, if: p.if || null, opts: [{ scene: p.scene }], def: p, key: map + '|prop|' + i });
      });
      (d.triggers || []).forEach((t, i) => {
        entries.push({ kind: 'trigger', map, x: t.x, y: t.y, w: t.w || 1, h: t.h || 1, if: t.if || null, once: t.once ? 'trig:' + map + ':' + (t.id || t.x + ',' + t.y) : null, opts: [{ scene: t.scene }], def: t, key: map + '|trigger|' + i });
      });
      (d.onEnter || []).forEach((ev, i) => {
        entries.push({ kind: 'enter', map, if: ev.if || null, once: ev.once === false ? null : 'enter:' + map + ':' + ev.scene, opts: [{ scene: ev.scene }], def: ev, key: map + '|enter|' + i });
      });
      (d.foes || []).forEach((f, i) => {
        if (f.scene) entries.push({ kind: 'foe', map, id: f.id, enemy: f.enemy, x: f.x, y: f.y, if: f.if || null, once: 'foe:' + map + ':' + f.id, opts: [{ scene: f.scene }], def: f, key: map + '|foe|' + i });
      });
    }
    // what each scene can change, with everything it calls
    const direct = {};
    for (const id in C.scenes) {
      const fx = new Set(['seen:' + id]), calls = [];
      for (const c of C.scenes[id].cmds) {
        const a = c.args || [];
        if (c.op === 'set' || c.op === 'unset') a.forEach((f) => fx.add('flag:' + f));
        else if (c.op === 'var') fx.add('var:' + a[0]);
        else if (c.op === 'give' || c.op === 'take') fx.add('item:' + a[0]);
        else if (c.op === 'quest') fx.add('quest:' + a[0]);
        else if (c.op === 'word') a.forEach((w) => fx.add('word:' + w));
        else if (c.op === 'postgame') fx.add('flag:postgame');
        else if (c.op === 'depart') { fx.add('flag:departed'); fx.add('comp'); }
        else if (c.op === 'recruit') fx.add('comp');
        else if (c.op === 'chapter') fx.add('ch');
        else if (c.op === 'call') calls.push(a[0]);
        else if (c.op === 'warp' && a[0]) fx.add('warp:' + a[0]);
      }
      direct[id] = { fx, calls };
    }
    const closure = {};
    const close = (id, seen) => {
      if (closure[id]) return closure[id];
      const out = new Set();
      if (!direct[id] || seen.has(id)) return out;
      seen.add(id);
      direct[id].fx.forEach((k) => out.add(k));
      for (const c of direct[id].calls) close(c, seen).forEach((k) => out.add(k));
      seen.delete(id);
      return (closure[id] = out);
    };
    const byEffect = {};
    for (const e of entries) {
      const fx = new Set();
      for (const o of e.opts) close(o.scene, new Set()).forEach((k) => fx.add(k));
      e.fx = fx;
      fx.forEach((k) => (byEffect[k] = byEffect[k] || []).push(e));
    }
    // scenes that take you somewhere else (`!warp`): links between maps
    const warpsFrom = {};
    for (const e of entries) {
      e.warps = [...e.fx].filter((k) => k.startsWith('warp:')).map((k) => k.slice(5)).filter((m) => m !== e.map);
      if (e.warps.length) (warpsFrom[e.map] = warpsFrom[e.map] || []).push(e);
    }
    IX = { entries, byEffect, closure, warpsFrom, byKey: Object.fromEntries(entries.map((e) => [e.key, e])) };
    return IX;
  }
  function reset() { IX = null; cache.clear(); passCache.clear(); }

  // ---- conditions, three-valued -------------------------------------------------------
  const termCache = new Map();
  function parseTerm(raw) {
    let p = termCache.get(raw);
    if (p) return p;
    let t = raw.trim(), neg = false;
    while (t[0] === '!') { neg = !neg; t = t.slice(1).trim(); }
    const m = t.match(/^([a-zA-Z_][\w.]*?)(>=|<=|!=|==|=|>|<)(.+)$/);
    const key = m ? m[1] : t, op = m ? m[2] : null, val = m ? m[3] : null;
    const parts = key.split('.'), head = parts[0], rest = parts.slice(1).join('.');
    let fx;
    switch (head) {
      case 'true': case 'false': case '': fx = 'const'; break;
      case 'comp': case 'prov': case 'party': fx = 'comp'; break;
      case 'quest': fx = 'quest:' + rest; break;
      case 'item': fx = 'item:' + rest; break;
      case 'var': fx = 'var:' + rest; break;
      case 'prof': fx = 'prof'; break;
      case 'ch': fx = 'ch'; break;
      case 'word': fx = 'word:' + rest; break;
      case 'seen': fx = 'seen:' + rest; break;
      case 'post': fx = 'flag:postgame'; break;
      case 'bg': fx = 'bg'; break;
      default: fx = op ? 'var:' + key : 'flag:' + key;
    }
    p = { raw, neg, head, rest, op, val, fx };
    termCache.set(raw, p);
    return p;
  }
  const dnfCache = new Map();
  function dnf(cond) {
    let d = dnfCache.get(cond);
    if (!d) { d = String(cond).split('|').map((c) => c.split('&').map((t) => t.trim()).filter(Boolean)); dnfCache.set(cond, d); }
    return d;
  }
  function negTerm(t) {
    t = t.trim();
    if (t[0] === '!') return t.slice(1).trim();
    const m = t.match(/^(.*?)(>=|<=|!=|==|=|>|<)(.+)$/);
    return m ? m[1] + OPS[m[2]] + m[3] : '!' + t;
  }
  // not(cond) as conjunctions: not(A|B) = not A & not B; not(a&b) = !a | !b
  function negDnf(cond) {
    let acc = [[]];
    for (const conj of dnf(cond)) {
      if (!conj.length) return []; // an always-true conjunct: never false
      const next = [];
      for (const a of acc) for (const t of conj) next.push(a.concat([negTerm(t)]));
      acc = next.slice(0, 48);
    }
    return acc;
  }
  // 1 true, 0 false, -1 unknown
  function tterm(ctx, st, raw) {
    const p = parseTerm(raw);
    if (p.fx === 'var:_res' && st.vars._res === UNK) return -1;
    if (ctx.static && p.fx !== 'const' && (p.fx !== 'quest:' + ctx.Q || ctx.passing) && !st.touched.has(p.fx)) return -1;
    return RB.state.test(st, raw) ? 1 : 0;
  }
  function tv(ctx, st, cond) {
    if (cond == null || cond === '') return 1;
    let res = 0;
    for (const conj of dnf(cond)) {
      let v = 1;
      for (const t of conj) {
        const x = tterm(ctx, st, t);
        if (x === 0) { v = 0; break; }
        if (x === -1) v = -1;
      }
      if (v === 1) return 1;
      if (v === -1) res = -1;
    }
    return res;
  }
  // Can the player bring this term about from here? Only things that grow:
  // flags set, items gained, counts raised, other quests advanced, scenes seen.
  function actionable(ctx, st, p) {
    if (p.neg || p.fx === 'quest:' + ctx.Q) return false;
    if (/^(flag|item|word|seen):/.test(p.fx)) return !p.op || ['>=', '>', '=', '=='].includes(p.op);
    if (/^var:/.test(p.fx)) return p.fx !== 'var:_res' && (!p.op || ['>=', '>', '=', '=='].includes(p.op));
    if (/^quest:/.test(p.fx)) {
      if (!p.op) return true;
      if (p.val === 'done' || p.val === 'active') return p.op === '=' || p.op === '==';
      return ['>=', '>', '=', '=='].includes(p.op);
    }
    return false;
  }
  // The fewest missing terms that would make one of these conjunctions true (null: none can).
  function needsOf(ctx, st, conjs) {
    let best = null;
    for (const conj of conjs) {
      const miss = [];
      let ok = true;
      for (const t of conj) {
        if (tterm(ctx, st, t) === 1) continue;
        if (!actionable(ctx, st, parseTerm(t))) { ok = false; break; }
        miss.push(t.trim());
      }
      if (ok && miss.length && (!best || miss.length < best.length)) best = miss;
    }
    return best;
  }

  // ---- the scene interpreter -------------------------------------------------------------
  function cloneSt(st) {
    const quests = {};
    for (const k in st.quests) quests[k] = Object.assign({}, st.quests[k]);
    return Object.assign({}, st, {
      flags: Object.assign({}, st.flags), vars: Object.assign({}, st.vars), inv: Object.assign({}, st.inv),
      quests, seen: Object.assign({}, st.seen), words: (st.words || []).slice(), touched: new Set(st.touched || []),
    });
  }
  function qval(st, id) { const q = st.quests[id]; return q ? (q.done ? 999 : q.stage) : -1; }
  function newPath(frames, st, needs, hypo) {
    return { frames, st, needs: needs || [], hypo: hypo || 0, steps: 0, loud: false, quiet: false, first: null, qs: [], jumps: {}, warps: [] };
  }
  function forkPath(p) {
    return {
      frames: p.frames.map((f) => ({ sc: f.sc, pc: f.pc })), st: cloneSt(p.st), needs: p.needs.slice(), hypo: p.hypo, steps: p.steps,
      loud: p.loud, quiet: p.quiet, first: p.first, qs: p.qs.slice(), jumps: Object.assign({}, p.jumps), warps: p.warps.slice(),
    };
  }
  // Walk one entry's scene(s). Returns finished paths: { st, needs, loud, quiet }.
  function walk(ctx, seeds) {
    const S = RB.content.scenes;
    const queue = [], done = [];
    let made = 0;
    const push = (p) => { if (made++ < PATHS) queue.push(p); };
    for (const sd of seeds) if (S[sd.scene]) push(newPath([{ sc: S[sd.scene], pc: 0 }], cloneSt(sd.st), sd.needs, sd.hypo));
    // a way not taken: explore it too, remembering what it needs (live analysis only)
    const hypo = (p, need, apply) => {
      if (ctx.static || !need || p.hypo >= HYPO) return;
      const n = p.needs.concat(need.filter((t) => !p.needs.includes(t)));
      if (n.length > NEEDS) return;
      const q = forkPath(p);
      q.needs = n; q.hypo++;
      apply(q);
      push(q);
    };
    // a label reached a third time in one path (a menu that loops back): that path stops there
    const jump = (p, label) => {
      const f = p.frames[p.frames.length - 1];
      const k = f.sc.id + ':' + label;
      if (label === 'end' || f.sc.labels[label] == null) f.pc = f.sc.cmds.length;
      else if ((p.jumps[k] = (p.jumps[k] || 0) + 1) > 2) { p.frames.length = 0; p.looped = true; }
      else f.pc = f.sc.labels[label];
    };
    const touch = (st, k) => st.touched.add(k);
    while (queue.length) {
      const p = queue.pop();
      const st = p.st;
      let alive = true;
      while (alive && p.frames.length) {
        if (++p.steps > STEPS) break;
        const f = p.frames[p.frames.length - 1];
        if (f.pc >= f.sc.cmds.length) {
          p.frames.pop();
          st.seen[f.sc.id] = true; touch(st, 'seen:' + f.sc.id);
          continue;
        }
        const c = f.sc.cmds[f.pc++];
        const op = c.op, a = c.args || [];
        if (op === 'say' || op === 'emote' || op === 'move' || op === 'face' || op === 'faceplayer' || op === 'wait' || op === 'fade' ||
          op === 'shake' || op === 'music' || op === 'sfx' || op === 'card' || op === 'toast' || op === 'journal' || op === 'speakerless') continue;
        if (c.if && !p.forceNext) {
          const v = tv(ctx, st, c.if);
          const control = op === 'end' || op === 'goto';
          if (v === -1) { const q = forkPath(p); push(q); } // this one runs the command; the copy skips it
          else if (v === 0) {
            // not run now; running it may be the way forward (the copy runs it)
            if (!control && op !== 'if') hypo(p, needsOf(ctx, st, dnf(c.if)), (q) => { q.frames[q.frames.length - 1].pc--; q.forceNext = true; });
            continue;
          } else if (control) hypo(p, needsOf(ctx, st, negDnf(c.if)), () => {}); // the copy goes on past it
        }
        p.forceNext = false;
        switch (op) {
          case 'set': a.forEach((x) => { st.flags[x] = true; touch(st, 'flag:' + x); }); break;
          case 'unset': a.forEach((x) => { delete st.flags[x]; touch(st, 'flag:' + x); }); break;
          case 'var': {
            const [name, o, val] = a, v = +val;
            if (st.vars[name] === UNK) st.vars[name] = 0;
            if (o === '=') st.vars[name] = isNaN(v) ? val : v;
            else if (o === '+') st.vars[name] = (st.vars[name] || 0) + v;
            else if (o === '-') st.vars[name] = (st.vars[name] || 0) - v;
            touch(st, 'var:' + name);
            break;
          }
          case 'give': RB.state.give(st, a[0], a[1] ? +a[1] : 1); touch(st, 'item:' + a[0]); break;
          case 'take': RB.state.take(st, a[0], a[1] ? +a[1] : 1); touch(st, 'item:' + a[0]); break;
          case 'word': a.forEach((w) => { if (!st.words.includes(w)) st.words.push(w); touch(st, 'word:' + w); }); break;
          case 'quest': {
            const before = qval(st, a[0]);
            RB.state.setQuest(st, a[0], a[1] || 'start');
            touch(st, 'quest:' + a[0]);
            if (a[0] === ctx.Q) {
              const now = qval(st, a[0]);
              p.qs.push(now);
              if (now > before && now > ctx.k) {
                if (a.includes('quiet')) p.quiet = true; else p.loud = true;
                if (p.first == null) p.first = now;
              }
            }
            break;
          }
          case 'if': {
            const arrow = a.indexOf('->');
            const cond = a.slice(0, arrow).join(' '), label = a[arrow + 1];
            const v = tv(ctx, st, cond);
            if (v === -1) { const q = forkPath(p); jump(q, label); push(q); }
            else if (v === 1) { hypo(p, needsOf(ctx, st, negDnf(cond)), () => {}); jump(p, label); }
            else hypo(p, needsOf(ctx, st, dnf(cond)), (q) => jump(q, label));
            break;
          }
          case 'goto': jump(p, a[0]); break;
          case 'end': f.pc = f.sc.cmds.length; break;
          case 'choice': {
            const opts = c.opts || [];
            let first = true;
            for (const o of opts) {
              const v = tv(ctx, st, o.if);
              if (v === 0) { hypo(p, needsOf(ctx, st, dnf(o.if)), (q) => { if (o.to) jump(q, o.to); }); continue; }
              if (first) { first = false; continue; }
              const q = forkPath(p); if (o.to) jump(q, o.to); push(q);
            }
            // this path takes the first reply that can be chosen now
            const o0 = opts.find((o) => tv(ctx, st, o.if) !== 0);
            if (!o0) { alive = false; break; }
            if (o0.to) jump(p, o0.to);
            break;
          }
          case 'call': {
            const sub = RB.content.scenes[a[0]];
            if (sub && p.frames.length < 16) p.frames.push({ sc: sub, pc: 0 });
            break;
          }
          case 'challenge': case 'activity': st.vars._res = UNK; break;
          case 'battle': {
            // a loss ends this scene (you wake at the last safe place); only a win goes on
            if (ctx.passing) { const q = forkPath(p); q.frames[q.frames.length - 1].pc = q.frames[q.frames.length - 1].sc.cmds.length; push(q); }
            st.vars._res = 1;
            break;
          }
          case 'warp': if (a[0]) p.warps.push(a[0]); break;
          case 'postgame': st.flags.postgame = true; touch(st, 'flag:postgame'); break;
          case 'chapter': st.chapter = +a[0]; touch(st, 'ch'); break;
          case 'recruit': if (!st.comp) st.provisional = a[0] === 'none' ? null : a[0]; touch(st, 'comp'); break;
          case 'depart': if (!st.comp && st.provisional) { st.comp = st.provisional; st.provisional = null; st.flags.departed = true; st.flags['comp_' + st.comp] = true; } touch(st, 'comp'); touch(st, 'flag:departed'); break;
          default: break; // staging, audio, lessons, hooks: nothing the conditions read
        }
      }
      done.push(p);
    }
    return done;
  }

  // Which scene an entry runs now (the first talk option that holds), and the
  // other options as ways not taken (what would have to change first).
  function seedsOf(ctx, e, st) {
    if (!ctx.static) {
      if (e.once && st.flags[e.once]) return [];
      if (e.kind === 'npc' && st.comp && e.id === st.comp && !e.def.alwaysShow) return [];
    }
    let base = [];
    const pv = tv(ctx, st, e.if);
    let hyp = 0;
    if (pv === 0) {
      if (ctx.static) return [];
      const n = needsOf(ctx, st, dnf(e.if));
      if (!n) return [];
      base = n; hyp = 1;
    }
    const seeds = [];
    let block = [];
    for (const o of e.opts) {
      const v = tv(ctx, st, o.if);
      if (v === 1) {
        const need = base.concat(block.filter((t) => !base.includes(t)));
        if (need.length <= NEEDS) seeds.push({ scene: o.scene, st, needs: need, hypo: hyp + (block.length ? 1 : 0) });
        if (ctx.static) break;
        const n = needsOf(ctx, st, negDnf(o.if));
        if (!n) break;
        block = block.concat(n.filter((t) => !block.includes(t)));
        if (block.length > NEEDS) break;
      } else if (v === -1) {
        seeds.push({ scene: o.scene, st, needs: base, hypo: hyp });
      } else if (!ctx.static) {
        const n = needsOf(ctx, st, dnf(o.if));
        if (!n) continue;
        const need = base.concat(block, n).filter((t, i, arr) => arr.indexOf(t) === i);
        if (need.length <= NEEDS) seeds.push({ scene: o.scene, st, needs: need, hypo: hyp + 1 });
      }
    }
    return seeds;
  }
  function pathsOf(ctx, e, st) {
    const key = e.key;
    if (ctx.memo.has(key)) return ctx.memo.get(key);
    const out = walk(ctx, seedsOf(ctx, e, st));
    ctx.memo.set(key, out);
    return out;
  }

  // ---- analysis ------------------------------------------------------------------------------
  function uniq(list) { const seen = new Set(); return list.filter((e) => (seen.has(e.key) ? false : seen.add(e.key))); }
  // Does a walk bring `term` about? True at the end, or (for a count that must
  // reach some number: var.x>=3, item.x>=3) raised by it: each step counts.
  function achieves(term, before, after) {
    if (RB.state.test(after, term)) return true;
    const p = parseTerm(term);
    if (p.op !== '>=' && p.op !== '>') return false;
    const key = p.fx.slice(p.fx.indexOf(':') + 1);
    if (/^var:/.test(p.fx)) return (+after.vars[key] || 0) > (+before.vars[key] || 0);
    if (/^item:/.test(p.fx)) return (after.inv[key] || 0) > (before.inv[key] || 0);
    return false;
  }
  // entries (on maps you can reach) that can bring `term` about now (direct),
  // and those that could once something else is true (with what they need)
  function achievers(ctx, st, term, R) {
    const p = parseTerm(term);
    const out = { direct: [], blocked: [] };
    for (const e of index().byEffect[p.fx] || []) {
      if (R && !R.has(e.map)) continue;
      for (const path of pathsOf(ctx, e, st)) {
        if (!achieves(term, st, path.st)) continue;
        if (!path.needs.length) out.direct.push(e);
        else out.blocked.push({ e, needs: path.needs });
      }
    }
    out.direct = uniq(out.direct);
    return out;
  }

  // ---- where you can get to ----------------------------------------------------------------------
  // Maps reachable from where you are: through exits and doors usable now
  // (the same rule as RB.world's map-link search), by fast travel to places
  // you know, and by the scenes that take you somewhere (a boat, a lift: an
  // entry present now whose scene has `!warp`). null when the state has no map.
  function usable(e, st) { return (!e.if || RB.state.test(st, e.if)) && (!e.locked || (e.unlock && RB.state.test(st, e.unlock))); }
  function presentNow(e, st) {
    if (e.if && !RB.state.test(st, e.if)) return false;
    if (e.once && st.flags[e.once]) return false;
    if (e.kind === 'npc' && st.comp && e.id === st.comp && !e.def.alwaysShow) return false;
    return true;
  }
  // the maps a scene run by entry `e` would really take you to now
  function warpsNow(e, st, wctx) {
    const seen = new Set();
    for (const p of pathsOf(wctx, e, st)) if (!p.needs.length) p.warps.forEach((m) => { if (m !== e.map) seen.add(m); });
    return [...seen];
  }
  function linksFrom(id, st, wctx) {
    const d = RB.content.maps[id], out = [];
    if (!d) return out;
    for (const e of d.exits || []) if (e.to && usable(e, st)) out.push({ to: e.to, exit: e });
    for (const b of d.structs || []) if (b.door != null && b.to && usable(b, st)) out.push({ to: b.to, exit: b, door: true });
    wctx = wctx || { Q: null, k: 0, static: false, memo: new Map() };
    for (const e of index().warpsFrom[id] || []) if (presentNow(e, st)) warpsNow(e, st, wctx).forEach((to) => out.push({ to, entry: e }));
    return out;
  }
  function reachable(st) {
    const C = RB.content;
    if (!st.map || !C.maps[st.map]) return null;
    const seen = new Set([st.map]), q = [st.map], wctx = { Q: null, k: 0, static: false, memo: new Map() };
    for (const id in C.places) {
      const pm = C.places[id].map;
      if (st.travel && st.travel[id] && pm && C.maps[pm] && !seen.has(pm)) { seen.add(pm); q.push(pm); }
    }
    while (q.length) {
      const id = q.shift();
      for (const l of linksFrom(id, st, wctx)) if (!seen.has(l.to) && C.maps[l.to]) { seen.add(l.to); q.push(l.to); }
    }
    return seen;
  }
  // The first hop from `from` toward the nearest of `dests`, counting scene
  // warps too: { entry } (someone or something here that takes you) or
  // { to, exit } through an exit. Used when RB.world.towards finds no way by exits.
  function firstHop(from, dests, st) {
    const want = new Set(dests), first = new Map([[from, null]]), wctx = { Q: null, k: 0, static: false, memo: new Map() };
    let q = [from];
    for (let hops = 0; q.length && hops < 14; hops++) {
      const next = [];
      for (const id of q) for (const l of linksFrom(id, st, wctx)) {
        if (first.has(l.to)) continue;
        first.set(l.to, id === from ? l : first.get(id));
        if (want.has(l.to)) return first.get(l.to);
        next.push(l.to);
      }
      q = next;
    }
    return null;
  }

  // The places where the next step of quest `qid` happens, for state `st`.
  // opts.static: every condition not about this quest counts as unknown.
  // → { stage, targets: [entry…], how: 'direct'|'needs'|'far'|'authored'|'open'|'many'|'waiting'|'passing', needs? }
  function analyse(qid, st, opts) {
    opts = opts || {};
    const d = RB.content.quests[qid];
    const q = st.quests[qid];
    if (!d || !q || q.done) return { stage: q ? q.stage : -1, targets: [], how: q && q.done ? 'done' : 'none' };
    const k = q.stage;
    const stage = d.stages && d.stages[Math.min(k, d.stages.length - 1)];
    if (stage && stage.at && !opts.derive) return authored(stage.at, st, k);
    const ctx = { Q: qid, k, static: !!opts.static, memo: new Map() };
    const base = cloneSt(st);
    const R = ctx.static ? null : reachable(st);
    const near = (e) => !R || R.has(e.map);
    const direct = [], blocked = [];
    for (const e of index().byEffect['quest:' + qid] || []) {
      for (const p of pathsOf(ctx, e, base)) {
        if (!p.loud && !p.quiet) continue;
        if (!p.needs.length) direct.push({ e, first: p.first, loud: p.loud });
        else blocked.push({ e, needs: p.needs, first: p.first, loud: p.loud });
      }
    }
    // the next step: of the ways forward, those that reach the nearest stage
    const nearest = (list) => {
      if (!list.length) return [];
      const m = Math.min.apply(null, list.map((x) => x.first));
      return list.filter((x) => x.first === m).map((x) => x.e);
    };
    const done = (list, how, extra) => {
      const t = uniq(list);
      if (t.length > MAX_TARGETS) return Object.assign({ stage: k, targets: [], many: t, how: 'many' }, extra || {});
      return Object.assign({ stage: k, targets: t, how }, extra || {});
    };
    const tryNeeds = (list) => {
      if (ctx.static || !list.length) return null;
      const r = resolveNeeds(ctx, base, list, R);
      return r.targets.length ? done(r.targets, 'needs', { needs: r.needs }) : null;
    };
    // in order: a real step you can get to now; what a real step is waiting
    // for; a bookkeeping (quiet) update now; what one of those is waiting
    // for; a step somewhere you cannot get to yet (named, not routed)
    const steps = [
      () => { const t = nearest(direct.filter((x) => x.loud && near(x.e))); return t.length ? done(t, 'direct') : null; },
      () => tryNeeds(blocked.filter((b) => b.loud)),
      () => { const t = nearest(direct.filter((x) => !x.loud && near(x.e))); return t.length ? done(t, 'direct') : null; },
      () => tryNeeds(blocked.filter((b) => !b.loud)),
      () => { const t = nearest(direct.filter((x) => x.loud)); return t.length ? done(t, 'far') : null; },
    ];
    for (const f of steps) { const r = f(); if (r) return r; }
    return { stage: k, targets: [], how: passing(qid, k) ? 'passing' : 'waiting' };
  }
  // A stage that is set and then passed within the same scene on every way
  // through it (never where a quest is left between scenes): nothing to mark.
  const passCache = new Map();
  function passing(qid, k) {
    const key = qid + '#' + k;
    if (passCache.has(key)) return passCache.get(key);
    const ctx = { Q: qid, k: 999, static: true, passing: true, memo: new Map() };
    const st = cloneSt(RB.state.newCampaign());
    let through = 0, stays = 0;
    for (const e of index().byEffect['quest:' + qid] || []) {
      for (const p of pathsOf(ctx, e, st)) {
        if (!p.qs.includes(k) || p.looped) continue;
        if (qval(p.st, qid) > k) through++; else stays++;
      }
    }
    const r = through > 0 && stays === 0;
    passCache.set(key, r);
    return r;
  }
  // Blocked ways forward: those toward the nearest stage, then the cheapest
  // (fewest missing terms); for each missing term the entries that can bring
  // it about now (or, one level further, what those need).
  function resolveNeeds(ctx, st, blocked, R) {
    const fm = Math.min.apply(null, blocked.map((b) => b.first));
    const atFirst = blocked.filter((b) => b.first === fm);
    const min = Math.min.apply(null, atFirst.map((b) => b.needs.length));
    const terms = [];
    for (const b of atFirst) if (b.needs.length === min) b.needs.forEach((t) => { if (!terms.includes(t)) terms.push(t); });
    const targets = [];
    for (const t of terms) {
      const r = achievers(ctx, st, t, R);
      if (r.direct.length) { targets.push.apply(targets, r.direct); continue; }
      // a need of a need: what the nearest blocked achievers are missing
      const bmin = r.blocked.length ? Math.min.apply(null, r.blocked.map((b) => b.needs.length)) : 0;
      for (const b of r.blocked) {
        if (b.needs.length !== bmin) continue;
        for (const t2 of b.needs) {
          if (t2 === t) continue;
          targets.push.apply(targets, achievers(ctx, st, t2, R).direct);
        }
      }
    }
    return { targets: uniq(targets), needs: terms };
  }
  // Authored `at`: { map, npc } | { map, prop, x, y } | { map, x, y } | { map } | [ … ] | 'open'
  function authored(at, st, k) {
    if (at === 'open') return { stage: k, targets: [], how: 'open' };
    const ix = index();
    const out = [];
    for (const a of [].concat(at)) {
      if (!a || !a.map || !RB.content.maps[a.map]) continue;
      if (a.npc) {
        const here = ix.entries.filter((e) => e.kind === 'npc' && e.map === a.map && e.id === a.npc);
        const live = here.find((e) => (!e.if || RB.state.test(st, e.if)) && !(st.comp && e.id === st.comp && !e.def.alwaysShow));
        const n = (RB.content.maps[a.map].npcs || []).find((x) => x.id === a.npc);
        out.push(live || here[0] || { kind: 'npc', map: a.map, id: a.npc, who: (n && (n.char || n.id)) || a.npc, x: n ? n.x : a.x, y: n ? n.y : a.y, key: a.map + '|at|' + a.npc, def: n || {} });
      } else if (a.x != null && a.y != null) {
        const pe = ix.entries.find((e) => e.kind === 'prop' && e.map === a.map && e.x === a.x && e.y === a.y);
        out.push(pe || { kind: a.prop ? 'prop' : 'spot', p: a.prop || null, map: a.map, x: a.x, y: a.y, key: a.map + '|at|' + a.x + ',' + a.y, def: {} });
      } else out.push({ kind: 'enter', map: a.map, key: a.map + '|at', def: {} });
    }
    return { stage: k, targets: out, how: out.length ? 'authored' : 'open' };
  }

  // ---- the followed quest --------------------------------------------------------------------
  function mode() {
    const m = RB.game && RB.game.settings && RB.game.settings.questGuide;
    return m === 'hints' || m === 'off' ? m : 'full';
  }
  function active(s, id) { const q = s && s.quests[id]; return !!(q && !q.done && RB.content.quests[id]); }
  // The quest the markers follow: the one chosen (s.follow), else the main
  // road (the most recently advanced main quest). '-' means none.
  function followed(s) {
    s = s || (RB.game && RB.game.s);
    if (!s) return null;
    if (s.follow === '-') return null;
    if (s.follow && active(s, s.follow)) return s.follow;
    let best = null;
    for (const id in s.quests) if (active(s, id) && RB.content.quests[id].main && (!best || s.quests[id].t >= s.quests[best].t)) best = id;
    return best;
  }
  function chosen(s) { s = s || RB.game.s; return !!(s && s.follow && s.follow !== '-' && active(s, s.follow)); }
  function follow(id) {
    const s = RB.game.s;
    if (!s || !id) return;
    s.follow = id;
  }
  // Stop following: a side quest hands back to the main road; the main road
  // itself leaves nothing followed (no markers) until you follow something.
  function unfollow(id) {
    const s = RB.game.s;
    if (!s || followed(s) !== id) return;
    const d = RB.content.quests[id];
    if (d && d.main) s.follow = '-';
    else delete s.follow;
  }

  // ---- cached live analysis ----------------------------------------------------------------------
  const cache = new Map();
  function signature(s) {
    let f = 0;
    for (const k in s.flags) if (s.flags[k]) f++;
    return (s.map || '') + '|' + JSON.stringify(s.quests) + '|' + f + '|' + JSON.stringify(s.inv) + '|' + JSON.stringify(s.vars) + '|' + (s.comp || '') + (s.provisional || '') +
      '|' + Object.keys(s.seen).length + '|' + (s.words || []).length + '|' + s.chapter + '|' + (s.learn && s.learn.profile);
  }
  function targets(qid, s) {
    s = s || RB.game.s;
    if (!s) return { targets: [], how: 'none' };
    const key = qid + '#' + signature(s);
    let r = cache.get(key);
    if (!r) {
      r = analyse(qid, s);
      if (cache.size > 40) cache.clear();
      cache.set(key, r);
    }
    return r;
  }

  // ---- where a target is, and which way from here ---------------------------------------------------
  // the fast-travel place (chart dot) a map belongs to
  function placeOf(mapId) {
    const C = RB.content, d = C.maps[mapId];
    if (!d) return null;
    const P = C.places;
    if (d.place && P[d.place]) return d.place;
    if (d.travel && P[d.travel]) return d.travel;
    const pre = mapId.split('.')[0];
    let hub = null;
    for (const id in P) if (P[id].map && P[id].map.split('.')[0] === pre) { if (P[id].hub || !hub) hub = id; }
    if (hub) return hub;
    for (const id in P) if (P[id].region && P[id].region === d.region) return id;
    return null;
  }
  // the live spot of a target on the current map (people move)
  function spotOf(t) {
    const W = RB.world.W;
    if (t.kind === 'npc' || t.kind === 'foe') {
      const list = t.kind === 'npc' ? W.npcs.concat(W.extras || []) : W.foes;
      const a = list.find((n) => n.id === t.id && (!n.map || n.map === t.map));
      if (a) return { x: a.fx, y: a.fy, actor: a };
    }
    if (t.kind === 'enter') return null;
    return t.x != null ? { x: t.x, y: t.y } : null;
  }
  // For the current map: the targets here, or the way out toward the nearest one.
  function wayFrom(r) {
    const W = RB.world.W;
    if (!W.map || !r || !r.targets.length) return null;
    const here = r.targets.filter((t) => t.map === W.map.id);
    if (here.length) return { here };
    const dests = r.targets.map((t) => t.map).filter((m, i, a) => a.indexOf(m) === i);
    let hop = RB.world.towards(W.map.id, dests);
    if (!hop || !hop.tiles.size) {
      // no way by exits alone: someone or something here may take you (a boat, a lift)
      const h = firstHop(W.map.id, dests, RB.game.s);
      if (h && h.entry && h.entry.map === W.map.id) return { here: [h.entry], via: h.to };
      if (!h || !h.exit) return { here: [], unreachable: true };
      const e = h.exit, tiles = new Set();
      if (h.door) tiles.add((e.x + e.door) + ',' + (e.y + e.h - 1));
      else for (let y = e.y; y < e.y + (e.h || 1); y++) for (let x = e.x; x < e.x + (e.w || 1); x++) tiles.add(x + ',' + y);
      hop = { tiles, via: h.to, to: h.to };
    }
    // the exit tile nearest to you, and the direction it leads
    const p = W.player;
    let best = null, bd = 1e9;
    hop.tiles.forEach((k) => {
      const [x, y] = k.split(',').map(Number);
      const d = (x - p.x) * (x - p.x) + (y - p.y) * (y - p.y);
      if (d < bd) { bd = d; best = [x, y]; }
    });
    const ex = RB.maps.exitAt(W.map, best[0], best[1]);
    let dir = ex && ex.dir;
    if (!ex || !ex.door) {
      if (best[0] === 0) dir = 'left'; else if (best[0] === W.map.w - 1) dir = 'right';
      else if (best[1] === 0) dir = 'up'; else if (best[1] === W.map.h - 1) dir = 'down';
    }
    return { here: [], exit: { x: best[0], y: best[1], dir: dir || 'down', to: hop.via, dest: hop.to } };
  }

  // ---- words -----------------------------------------------------------------------------------------
  const COMPASS = [
    ['east', '{東|ひがし}'], ['south-east', '{南東|なんとう}'], ['south', '{南|みなみ}'], ['south-west', '{南西|なんせい}'],
    ['west', '{西|にし}'], ['north-west', '{北西|ほくせい}'], ['north', '{北|きた}'], ['north-east', '{北東|ほくとう}'],
  ];
  function compass(dx, dy) {
    if (Math.abs(dx) + Math.abs(dy) <= 2) return null;
    const a = Math.atan2(dy, dx); // y grows southward
    const i = ((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8;
    return { en: COMPASS[i][0], jp: COMPASS[i][1] };
  }
  // Nouns for props that are quest targets (kept small; anything else is "something here")
  const PROP = {
    sign: ['{看板|かんばん}', 'the sign'], signblank: ['{道標|みちしるべ}', 'the signpost'], crate: ['{木箱|きばこ}', 'the crate'],
    desk: ['{机|つくえ}', 'the desk'], table: ['{台|だい}', 'the workbench'], smalltable: ['{机|つくえ}', 'the table'],
    bookpile: ['{本|ほん}', 'the books'], chest: ['{箱|はこ}', 'the chest'], deadlantern: ['{灯|あか}り', 'the lantern'],
    shelf: ['{棚|たな}', 'the shelf'], noticeboard: ['{掲示板|けいじばん}', 'the notice board'], net: ['{網|あみ}', 'the nets'],
    stone_marker: ['{石|いし}', 'the stone marker'], shrine: ['{祠|ほこら}', 'the shrine'], gears: ['{歯車|はぐるま}', 'the gears'],
    water: ['{水|みず}', 'the water'], mailbox: ['ポスト', 'the post box'], bell: ['{鐘|かね}', 'the bell'],
  };
  const PROP_PREFIX = [
    [/icewall/, '{氷|こおり}', 'the ice'], [/dial/, '{仕掛|しか}け', 'the dial mechanism'], [/crank/, 'ハンドル', 'the crank'], [/lamp/, '{灯|あか}り', 'the lamp'],
    [/bellpost/, '{鐘|かね} の {柱|はしら}', 'the bell-post'], [/bell/, '{鐘|かね}', 'the bell'], [/cabinet/, 'カード の {棚|たな}', 'the card shelves'], [/gate/, '{門|もん}', 'the gate'],
    [/tablet/, '{石|いし} の {板|いた}', 'the stone tablet'], [/chart/, '{星図|せいず}', 'the star chart'], [/grave/, '{墓|はか}', 'the grave'], [/conduit/, '{水路|すいろ}', 'the channel'],
    [/seat/, '{席|せき}', 'the seat'], [/bucket/, '{桶|おけ}', 'the buckets'], [/lookout/, '{櫓|やぐら}', 'the lookout'], [/beam/, '{梁|はり}', 'the beam'],
  ];
  function nameOf(t) {
    const C = RB.content;
    if (t.kind === 'npc') {
      const ch = C.chars[t.who] || C.chars[t.id];
      return ch && ch.name ? { jp: ch.name.jp, en: ch.name.en } : { jp: '{誰|だれ}か', en: 'someone' };
    }
    if (t.kind === 'foe') {
      const en = C.enemies[t.enemy];
      return en && en.name ? { jp: en.name.jp, en: 'the ' + en.name.en } : { jp: '{何|なに}か', en: 'something' };
    }
    if (t.kind === 'prop' && t.p) {
      if (PROP[t.p]) return { jp: PROP[t.p][0], en: PROP[t.p][1] };
      for (const [re, jp, en] of PROP_PREFIX) if (re.test(t.p)) return { jp, en };
    }
    return { jp: '{何|なに}か', en: 'something' };
  }
  function placeName(mapId) {
    const d = RB.content.maps[mapId];
    return d && d.name ? d.name : { jp: 'どこか', en: 'somewhere' };
  }
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  // Which way from the player: on this map, the compass toward it; on
  // another map, the compass toward the way out that starts the journey
  // there (or toward whoever here takes you); none when there is no way now.
  function direction(t) {
    const W = RB.world && RB.world.W;
    if (!W || !W.map || !W.player) return null;
    const p = W.player;
    let sp;
    if (t.map === W.map.id) {
      sp = spotOf(t);
      if (!sp) return { jp: 'ここ', en: 'here', here: true };
    } else {
      const w = wayFrom({ targets: [t] });
      if (!w || w.unreachable) return { unreachable: true };
      if (w.here && w.here.length) sp = spotOf(w.here[0]);
      else if (w.exit) sp = { x: w.exit.x, y: w.exit.y };
      if (!sp) return null;
      const c = compass(sp.x - p.x, sp.y - p.y);
      return c ? { jp: 'まず ' + c.jp + ' へ', en: 'head ' + c.en + ' first', dir: c, first: true } : { jp: 'まず すぐ {近|ちか}く の {出口|でぐち} へ', en: 'take the way out right by you first', first: true };
    }
    const c = compass(sp.x - p.x, sp.y - p.y);
    return c ? { jp: 'ここ から ' + c.jp, en: c.en + ' of you', dir: c } : { jp: 'すぐ {近|ちか}く', en: 'right by you', near: true };
  }
  const NOWAY = { jp: 'いま は ここ から {行|い}けない', en: 'no way there from here just now' };
  // targets in the order they are described: on this map (nearest first), then elsewhere
  function ordered(list) {
    const W = RB.world && RB.world.W;
    if (!W || !W.map || !W.player) return list.slice();
    const d = (t) => {
      if (t.map !== W.map.id) return 1e6;
      const sp = spotOf(t);
      return sp ? Math.abs(sp.x - W.player.x) + Math.abs(sp.y - W.player.y) : 0;
    };
    return list.slice().sort((a, b) => d(a) - d(b));
  }
  // Nudge 1: where and who.
  function whereLine(t) {
    const n = nameOf(t), pl = placeName(t.map);
    if (t.kind === 'npc' || t.kind === 'foe' || t.kind === 'prop') return { jp: pl.jp + ' で ' + n.jp + ' を {探|さが}そう 。', en: 'Look for ' + n.en + ' in ' + pl.en + '.' };
    return { jp: pl.jp + ' へ {行|い}こう 。', en: 'Go to ' + pl.en + '.' };
  }
  // Nudge 2: what to do there, and which way.
  function doLine(t) {
    const n = nameOf(t), pl = placeName(t.map), dir = direction(t);
    let jp, en;
    if (t.kind === 'npc') { jp = pl.jp + ' で ' + n.jp + ' と {話|はな}そう 。'; en = 'Talk to ' + n.en + ' in ' + pl.en + '.'; }
    else if (t.kind === 'prop') { jp = pl.jp + ' で ' + n.jp + ' を {見|み}て みよう 。'; en = 'Take a look at ' + n.en + ' in ' + pl.en + '.'; }
    else if (t.kind === 'foe') { jp = pl.jp + ' の ' + n.jp + ' に {近|ちか}づこう 。'; en = 'Go up to ' + n.en + ' in ' + pl.en + '.'; }
    else if (t.kind === 'trigger' || t.kind === 'spot') { jp = pl.jp + ' の ある {場所|ばしょ} へ {行|い}こう 。'; en = 'Go to a particular spot in ' + pl.en + '.'; }
    else { jp = pl.jp + ' へ {行|い}こう 。'; en = 'Go to ' + pl.en + '.'; }
    if (dir && dir.unreachable) { jp += ' ' + NOWAY.jp + ' 。'; en += ' ' + cap(NOWAY.en) + '.'; }
    else if (dir && !dir.here) { jp += ' ' + dir.jp + ' 。'; en += ' ' + cap(dir.en) + '.'; }
    return { jp, en };
  }
  // "Next: …" — the words for the markers (one line per marked place)
  function nextLines(r) {
    return ordered(r.targets || []).map((t) => {
      const n = nameOf(t), pl = placeName(t.map), dir = direction(t);
      const place = t.kind === 'enter' || t.kind === 'trigger' || t.kind === 'spot';
      let jp = 'つぎ ： ' + (place ? pl.jp : pl.jp + ' の ' + n.jp) + ' 。', en = 'Next: ' + (place ? pl.en : n.en + ', in ' + pl.en);
      if (dir && dir.unreachable) { jp += ' ' + NOWAY.jp + ' 。'; en += ' — ' + NOWAY.en; }
      else if (dir && dir.here && t.kind === 'enter') { jp = 'つぎ ： ここ 、 ' + pl.jp + ' 。'; en = 'Next: here, in ' + pl.en; }
      else if (dir && !dir.here) { jp += ' ' + dir.jp + ' 。'; en += ' — ' + dir.en; }
      return { jp, en: en + '.' };
    });
  }
  const WAIT = { jp: 'いま は まだ {先|さき} に {進|すす}めない 。 {旅|たび} を {続|つづ}けよう 。', en: 'You can’t take this further just yet. Carry on with your journey.' };
  // The nudges for a quest, in order: [ [lines of nudge 1], [lines of nudge 2] ].
  // 1: where and who; 2: the authored hint (if any), then what to do there and which way.
  function nudges(qid, s) {
    s = s || RB.game.s;
    const r = targets(qid, s);
    const d = RB.content.quests[qid];
    const stage = d && d.stages[Math.min(s.quests[qid].stage, d.stages.length - 1)];
    const list = ordered(r.targets);
    const out = [];
    if (r.how === 'many') {
      // too many places to mark: say where, and whether to talk or to look
      const maps = {};
      let people = 0;
      r.many.forEach((t) => { maps[t.map] = (maps[t.map] || 0) + 1; if (t.kind === 'npc') people++; });
      const top = Object.keys(maps).sort((a, b) => maps[b] - maps[a])[0];
      const pl = placeName(top);
      out.push([people * 2 >= r.many.length
        ? { jp: pl.jp + ' で いろいろ な {人|ひと} と {話|はな}そう 。', en: 'Talk to different people in ' + pl.en + '.' }
        : { jp: pl.jp + ' の あちこち を {見|み}て みよう 。', en: 'Look around all over ' + pl.en + '.' }]);
    } else if (!list.length) out.push([WAIT]);
    else out.push(list.map(whereLine));
    const second = [];
    if (stage && stage.hint) second.push({ jp: stage.hint.jp, en: stage.hint.en });
    if (list.length) second.push.apply(second, list.map(doLine));
    if (second.length) out.push(second);
    return { lines: out, result: r, markable: list.length > 0 };
  }

  return {
    MAX_TARGETS, index, reset, analyse, passing, reachable, firstHop, targets, followed, chosen, follow, unfollow, mode, placeOf, spotOf, wayFrom,
    nudges, nextLines, nameOf, placeName, compass, _needsOf: needsOf, _negDnf: negDnf, _parseTerm: parseTerm,
  };
})();
