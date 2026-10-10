/* Mastery records and item scheduling.
 * Separate records per item id; ids are prefixed by kind:
 *   k:<kana>  characters · v:<word>  vocabulary · g:<grammar id>  grammar ·
 *   c:<passage id>  comprehension.
 * Recognition (choosing), recall (typing), handwriting and assisted answers
 * are tallied separately. Promotion needs repeated success over time, so a
 * single lucky answer never escalates an item (spec §10). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.learn = (function () {
  'use strict';
  const INTERVALS = [1, 3, 7, 16, 36, 80]; // in learning events
  const COOLDOWN = 3;                      // events before the same item can reappear
  const MISTAKE_COOLDOWN = 4;              // don't hammer an item right after a mistake

  function L() {
    return RB.game.s.learn;
  }
  function clock() {
    const l = L();
    return l.clock || 0;
  }
  function tick() {
    const l = L();
    l.clock = (l.clock || 0) + 1;
    return l.clock;
  }
  function rec(id) {
    const items = L().items;
    return items[id] || (items[id] = { id, box: 0, seen: 0, ok: 0, bad: 0, streak: 0, last: -99, lastOk: -99, due: 0, cool: 0, modes: { recog: 0, recall: 0, hand: 0, assisted: 0 }, ctx: [] });
  }
  function kindOf(id) {
    return id.slice(0, 1);
  }

  // result: {ok, mode:'choice'|'ime'|'hand', assisted, ctx}
  function record(id, result) {
    if (!id) return null;
    const ids = Array.isArray(id) ? id : [id];
    const now = tick();
    const st = L().stats;
    let r0 = null;
    for (const i of ids) {
      const r = rec(i);
      r0 = r0 || r;
      r.seen++;
      if (result.assisted) {
        r.modes.assisted++;
      } else if (result.mode === 'choice') r.modes.recog++;
      else if (result.mode === 'ime') r.modes.recall++;
      else if (result.mode === 'hand') r.modes.hand++;
      if (result.ok && !result.assisted) {
        r.ok++;
        r.streak++;
        // Promotion rules: boxes 0-1 move on any clean success; beyond that
        // the item must be answered correctly on two separate occasions and
        // not merely by choosing from options twice in a row: the current run
        // of clean answers must include a clean typed or handwritten one.
        // (r.vary is that run's flag. r.modes counts every attempt, wrong ones
        // too, so it can't stand in for it. Records made before r.vary existed
        // keep their box; their next typed or written success sets it.)
        if (result.mode === 'ime' || result.mode === 'hand') r.vary = true;
        const spaced = now - r.lastOk >= 2;
        const varied = r.box < 2 || !!r.vary;
        if (r.box < 2 || (r.streak >= 2 && spaced && varied)) r.box = Math.min(5, r.box + 1);
        r.lastOk = now;
        if (result.ctx && r.ctx.indexOf(result.ctx) < 0) { r.ctx.push(result.ctx); if (r.ctx.length > 6) r.ctx.shift(); }
      } else if (!result.ok) {
        r.bad++;
        r.streak = 0;
        r.vary = false;
        r.box = Math.max(0, r.box - 1);
        r.cool = now + MISTAKE_COOLDOWN;
      }
      r.last = now;
      r.due = now + INTERVALS[r.box];
    }
    if (result.assisted) st.assisted++;
    else if (result.mode === 'choice') st.recog++;
    else if (result.mode === 'ime') st.typed++;
    else if (result.mode === 'hand') st.hand++;
    if (!result.ok) st.mistakes++;
    return r0;
  }
  function introduced(id) {
    const l = L();
    l.intro = l.intro || {};
    return !!l.intro[id] || !!l.items[id];
  }
  function markIntroduced(id) {
    const l = L();
    l.intro = l.intro || {};
    l.intro[id] = true;
  }
  function taughtKana() {
    const l = L();
    l.taught = l.taught || {};
    if (l.kanaKnown === 'both' || l.profile !== 'F') return null; // null = everything is fair game
    return l.taught;
  }
  function kanaKnown(ch) {
    const t = taughtKana();
    if (!t) return true;
    if (L().kanaKnown === 'hira' && RB.kana && RB.kana.isHira(ch)) return true;
    return !!t[ch];
  }

  // Choose up to n items from pool, favouring due and weak items, never the
  // same item twice in a row, and not an item just answered wrongly.
  // days between reviews by box, for spacing that notices days (L6)
  const DAY_GAP = [1, 1, 2, 4, 9, 20];
  function pick(pool, n, opts) {
    opts = opts || {};
    const now = clock();
    const today = Math.floor((opts.now != null ? opts.now : Date.now()) / 86400000);
    const seen = new Set();
    const cands = [];
    for (const id of pool) {
      if (!id || seen.has(id)) continue;
      seen.add(id);
      const r = L().items[id];
      let score;
      if (!r) score = opts.allowNew === false ? -1 : 2 + Math.random();
      else {
        if (now - r.last < COOLDOWN && !opts.ignoreCooldown) continue;
        if (r.cool > now && !opts.ignoreCooldown) continue;
        const overdue = now - r.due;
        // L6 (expansion; C-36): spacing also notices days. An item last met on an earlier day, longer ago than its
        // box's gap, counts as due too, so an evening's many events don't stand in for remembering it next week.
        // It only orders suggestions: nothing shows an overdue count, a streak or a reminder.
        const dueByDays = r.lastDay != null && today - r.lastDay >= DAY_GAP[Math.min(r.box, DAY_GAP.length - 1)];
        score = (overdue >= 0 ? 4 + Math.min(overdue, 10) * 0.2 : 0) + (dueByDays ? 2.5 : 0) + (5 - r.box) * 0.8 + Math.random();
        if (r.box >= 4 && overdue < 0 && !dueByDays) score -= 4; // already solid: rarely drill
      }
      if (score >= 0) cands.push({ id, score });
    }
    cands.sort((a, b) => b.score - a.score);
    let out = cands.slice(0, n).map((c) => c.id);
    if (out.length < n && !opts.ignoreCooldown) {
      // fall back to anything in the pool rather than failing
      const extra = pool.filter((id) => out.indexOf(id) < 0);
      out = out.concat(RB.util.rng((now * 31) | 0).shuffle(extra).slice(0, n - out.length));
    }
    return out;
  }
  function weakest(n) {
    const items = Object.values(L().items).filter((r) => r.seen > 0);
    items.sort((a, b) => a.box - b.box || b.bad - a.bad);
    return items.slice(0, n).map((r) => r.id);
  }
  function summary() {
    const items = Object.values(L().items);
    const by = (k) => items.filter((r) => kindOf(r.id) === k);
    return { k: by('k').length, v: by('v').length, g: by('g').length, c: by('c').length, steady: items.filter((r) => r.box >= 3).length };
  }
  return { DAY_GAP, record, rec, pick, weakest, summary, introduced, markIntroduced, taughtKana, kanaKnown, clock, tick, kindOf };
})();
