/* Unwritten Atlas — tactics.
 * Route modifiers add intents to foes; temporary relics and permanent charm
 * sidegrades change how exchanges resolve. All of it is applied through
 * small wrappers around RB.combatLogic that are installed only for the
 * duration of a battle that needs them (an expedition battle, or any battle
 * while an atlas charm is equipped) and removed afterwards. The pure effect
 * functions are shared with the Unravel-only simulator used by selfCheck. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const AT = RB.atlas, C = RB.content, A = C.atlas;
  const L = RB.combatLogic;
  const orig = { init: L.init, playerAct: L.playerAct, foeAct: L.foeAct, enemyAct: L.enemyAct, endRound: L.endRound };

  // ---- context ---------------------------------------------------------------------------------
  function runActive(s) {
    s = s || (RB.game && RB.game.s);
    return !!(s && s.atlas && s.atlas.run && typeof s.map === 'string' && s.map.startsWith('atlas.'));
  }
  function charmOf(s) {
    const id = s && s.equip && s.equip.charm;
    const it = id && C.items[id];
    return (it && it.effect && it.effect.atlasCharm) || null;
  }
  function combosOf(relics, comp) {
    const out = [];
    for (const k in A.combos) {
      const need = A.combos[k].needs;
      const ok = need.every((r) => (r === '*comp' ? relics.some((x) => A.relics[x] && A.relics[x].comp && A.relics[x].comp === comp) : relics.indexOf(r) >= 0));
      if (ok) out.push(k);
    }
    return out;
  }
  function ctxNow() {
    const s = RB.game && RB.game.s;
    if (!s) return null;
    const active = runActive(s);
    const charm = charmOf(s);
    if (!active && !charm) return null;
    const run = active ? s.atlas.run : null;
    const relics = run ? run.relics.slice() : [];
    return { run, relics, mods: run ? run.mods.slice() : [], comp: s.comp || null, charm, combos: run ? combosOf(relics, s.comp) : [] };
  }
  const has = (ctx, r) => ctx.relics.indexOf(r) >= 0 && (!A.relics[r].comp || A.relics[r].comp === ctx.comp);
  const combo = (ctx, k) => ctx.combos.indexOf(k) >= 0;

  // ---- enemies under route modifiers ----------------------------------------------------------------
  const MOD_INTENT = { fog: 'shroud', echo: 'mirror:atlas', lowtide: 'flood', gusts: 'gust' };
  function applyEnemy(enemy, ctx) {
    const ins = [];
    for (const m of ctx.mods || []) if (MOD_INTENT[m]) ins.push(MOD_INTENT[m]);
    if (ins.length) {
      const add = (pat) => {
        const p = (pat || ['strike', 'rest']).slice();
        ins.forEach((k, i) => {
          const kind = k.split(':')[0];
          if (!p.some((x) => x.split(':')[0] === kind)) p.splice(Math.min(p.length, 1 + i * 2), 0, k);
        });
        return p;
      };
      enemy.pattern = add(enemy.pattern);
      if (enemy.phases) enemy.phases = enemy.phases.map((ph) => Object.assign({}, ph, { pattern: add(ph.pattern) }));
      if (ctx.mods.indexOf('echo') >= 0) enemy.intents = Object.assign({}, enemy.intents || {}, A.modIntents);
    }
    // Revisit weak items alongside the foe's own material (cooldowns still apply in RB.learn.pick).
    if (ctx.run && RB.game && RB.game.s && enemy.pool) {
      try {
        const P = RB.game.s.learn.profile;
        const weak = RB.learn.weakest(6).filter((id) => id !== ctx.run.lastWrong);
        if (weak.length) enemy.pool = Object.assign({}, enemy.pool, { [P]: (enemy.pool[P] || []).concat(weak) });
      } catch (e) { /* keep the authored pool */ }
    }
    return enemy;
  }

  // ---- effects -------------------------------------------------------------------------------------------
  const E = {};
  E.init = function (st, enemy, ctx) {
    st._a = { threadUsed: false, ink: 0, wickUsed: false, naoUsed: false, mask2: false, firstUnravel: true };
    if (has(ctx, 'letters')) { st.ward.pc += 1; if (st.compId) st.ward.comp += 1; }
    if (has(ctx, 'bell') && st.compId) st.harmony = Math.min(st.harmonyMax, 1);
    if (has(ctx, 'trim_ren')) { st.ward.pc = Math.max(st.ward.pc, 2); st.ward.comp = Math.max(st.ward.comp, 2); }
    if (ctx.charm === 'reed') { st.ward.pc += 1; st.harmonyMax = 4; }
    if (enemy.boss && ctx.run) {
      const k = Math.max(0, Math.min(ctx.run.bonusKnots || 0, st.knots - 2));
      if (k) { st.knots -= k; st.maxKnots -= k; }
    }
    if (has(ctx, 'tag_nao')) preview(st, enemy);
  };
  function preview(st, enemy) {
    st.nextIntents = [0, 1, 2].map((k) => L.intentDef(enemy, st.pattern[(st.pi + k) % st.pattern.length]));
  }
  const say = (out, en, t) => out.fx.push({ t: t || 'settle', en });
  const loosen = (st, n) => { st.knots = Math.max(0, st.knots - n); };
  E.player = function (st, card, result, enemy, ctx, out, kb, hb) {
    const perfect = result.ok && result.firstTry !== false;
    const freed = kb - st.knots;
    if (card.kind === 'unravel') {
      if (ctx.charm === 'mirror' && st._a.firstUnravel) {
        st.knots = kb;
        say(out, 'Through the mirror shard you find the thread — nothing comes loose yet.');
      } else if (result.ok && freed > 0) {
        if (has(ctx, 'thread') && !st._a.threadUsed) {
          st._a.threadUsed = true;
          const n = combo(ctx, 'taut') ? 2 : 1;
          loosen(st, n);
          say(out, combo(ctx, 'taut') ? 'Thread and inkstone together: the line pulls taut and two more knots give.' : 'The sturdy thread pulls a second knot loose.');
        }
        if (has(ctx, 'inkstone') && perfect) { st._a.ink++; if (st._a.ink % 2 === 0) { loosen(st, 1); say(out, 'The chipped inkstone gives the stroke an edge — another knot frees.'); } }
      }
      st._a.firstUnravel = false;
      if (ctx.charm === 'page' && perfect) st.harmony = Math.min(st.harmonyMax, st.harmony + 1);
      if (ctx.comp === 'nao' && has(ctx, 'tag_nao') && perfect && !st._a.naoUsed && st.knots > 0) {
        st._a.naoUsed = true; st.openingBonus = true;
        out.fx.push({ t: 'comp', who: 'nao', en: 'Nao taps the parcel tag: "Saw that. Next one\'s mine too."' });
      }
    }
    if ((card.kind === 'truth') && out.countered) {
      if (has(ctx, 'shell')) { loosen(st, 1); say(out, 'Through the spiral shell you hear what it really meant — a knot slips.'); }
      if (ctx.charm === 'mirror') { loosen(st, 1); say(out, 'The mirror shard catches the lie and cracks a knot with it.'); }
      if (combo(ctx, 'lamplit') && st.shroud) { st.shroud = false; say(out, 'Wick and shell: the echo is lit from inside and the mist goes.'); }
    }
    if (ctx.charm === 'page' && (card.kind === 'truth' || card.kind === 'answer')) st.harmony = Math.min(st.harmony, hb);
    if (ctx.charm === 'tide' && card.kind === 'word' && card.word && card.word.tags.indexOf('ward') >= 0) {
      const blocked = out.fx.some((f) => f.t === 'ward' && f.block);
      if (!blocked && st.ward[card.target] > 0) st.ward[card.target] -= 1;
    }
    if (has(ctx, 'inkstone') && result.mistakes > 0 && !st.assist) { st.pc = Math.max(0, st.pc - 1); say(out, 'The chipped inkstone bites: the slip costs a second point.', 'cost'); }
    if (card.kind === 'word' && ctx.comp === 'ren' && has(ctx, 'trim_ren') && result.ok && st.shroud) { st.shroud = false; out.fx.push({ t: 'comp', who: 'ren', en: 'Ren trims the wick. The lamp flares and the mist folds back.' }); }
    if (card.kind === 'tech') {
      if (ctx.comp === 'suzu' && has(ctx, 'mask_suzu')) { loosen(st, 1); out.fx.push({ t: 'comp', who: 'suzu', en: 'Suzu wears the understudy\'s mask for the bow — a third knot takes its curtain call.' }); }
      if (combo(ctx, 'duet')) st.harmony = Math.max(st.harmony, 1);
    }
  };
  // One creature's move (every creature of a group in turn): relics and charms soften it.
  E.move = function (st, countered, ctx) {
    const it = st.intent;
    let tmp = Object.assign({}, it);
    const pre = [];
    if (!countered) {
      if (has(ctx, 'weight') && (it.kind === 'flood' || it.kind === 'gust')) {
        tmp.power = (it.power || (it.kind === 'flood' ? 2 : 1)) - 1;
        if (it.kind === 'gust') { tmp.kind = 'strike'; tmp.target = 'pc'; }
        pre.push('The pickling weight holds you down: the ' + (it.kind === 'flood' ? 'flood' : 'gust') + ' loses its force.');
      }
      if (ctx.charm === 'tide' && (it.kind === 'flood' || it.kind === 'sweep')) { tmp.power = (tmp.power != null ? tmp.power : it.power || (it.kind === 'flood' ? 2 : 1)) - 1; pre.push('The tide-glass takes the edge off the wave.'); }
      if (combo(ctx, 'harbour') && it.kind === 'flood' && (st.ward.pc > 0 || st.ward.comp > 0)) { tmp.kind = 'rest'; pre.push('Harbour wall: your wards turn the whole flood aside.'); }
      if ((tmp.kind === 'flood' || tmp.kind === 'sweep' || tmp.kind === 'strike') && tmp.power != null && tmp.power <= 0) tmp.kind = 'rest';
    }
    if (ctx.comp === 'suzu' && has(ctx, 'mask_suzu') && st.misdirectUsed && !st._a.mask2) { st.misdirectUsed = false; st._a.mask2 = true; }
    const before = st.pc + st.comp;
    st.intent = tmp; // the telegraphed intent, softened by relics/charms for this exchange only
    let fx;
    try { fx = orig.foeAct(st, countered); } finally { st.intent = it; }
    for (const m of pre) fx.unshift({ t: 'settle', en: m });
    if (has(ctx, 'wick') && !countered && it.kind === 'shroud' && st.shroud && !st._a.wickUsed) { st.shroud = false; st._a.wickUsed = true; fx.push({ t: 'settle', en: 'The spare wick flares — the mist burns off at once.' }); }
    if (ctx.run && ctx.run.lantern && ctx.run.lantern.hp > 0 && st.pc + st.comp < before) {
      const lan = ctx.run.lantern;
      lan.hp -= 1;
      fx.push({ t: 'settle', en: lan.hp > 0 ? 'The little lantern gutters in the blow (' + lan.hp + '/' + lan.max + ').' : 'The little lantern goes out. The road carries on without it.' });
      if (AT.hud) AT.hud.update();
    }
    return fx;
  };
  // After every creature has acted: what happens once per exchange.
  E.exchange = function (st, fx, ctx) {
    if (ctx.comp === 'mio' && has(ctx, 'vial_mio')) {
      const b = st.pc + st.comp;
      if (st.pc > 0) st.pc = Math.min(st.max, st.pc + 1);
      if (st.comp > 0) st.comp = Math.min(st.max, st.comp + 1);
      for (const f of st.foes) if (f.heat > 0 && !f.settled) f.heat -= 1;
      if (st.pc + st.comp > b) fx.push({ t: 'comp', who: 'mio', en: 'Mio uncorks the spare vial: a mouthful each, and the air cools.' });
    }
    return fx;
  };
  // the whole exchange: every creature (each softened as above), then the exchange
  E.enemy = function (st, countered, ctx) {
    const fx = orig.enemyAct(st, countered, (x, c) => E.move(x, c, ctx));
    return E.exchange(st, fx, ctx);
  };
  E.endRound = function (st, enemy, ctx) {
    if (has(ctx, 'tag_nao') && st.intent) preview(st, enemy);
  };

  // ---- wrappers (installed only during battles that need them) -----------------------------------------------
  const W = {
    init(enemy, s, opts) {
      const ctx = ctxNow();
      opts = Object.assign({}, opts || {});
      // every creature of a group is on the same route: each gets the route's intents
      opts.group = (opts.group || []).map((g) => (typeof g === 'string' ? Object.assign({ id: g }, C.enemies[g] || {}) : g));
      if (ctx) { applyEnemy(enemy, ctx); for (const g of opts.group) applyEnemy(g, ctx); }
      const st = orig.init(enemy, s, opts);
      if (ctx) { E.init(st, enemy, ctx); st._ctx = true; }
      return st;
    },
    playerAct(st, card, result, enemy) {
      const ctx = ctxNow();
      const kb = st.knots, hb = st.harmony;
      const out = orig.playerAct(st, card, result, enemy);
      if (ctx && st._a) E.player(st, card, result, enemy, ctx, out, kb, hb);
      return out;
    },
    // one creature's move (the rules' enemyAct calls this for each creature in turn)
    foeAct(st, countered) {
      const ctx = ctxNow();
      if (!ctx || !st._a) return orig.foeAct(st, countered);
      return E.move(st, countered, ctx);
    },
    enemyAct(st, countered, act) {
      const fx = orig.enemyAct(st, countered, act);
      const ctx = ctxNow();
      if (ctx && st._a) E.exchange(st, fx, ctx);
      return fx;
    },
    endRound(st, enemy) {
      const r = orig.endRound(st, enemy);
      const ctx = ctxNow();
      if (ctx && st._a) E.endRound(st, enemy, ctx);
      return r;
    },
  };
  let installed = false;
  function install() {
    if (installed) return;
    for (const k in W) RB.combatLogic[k] = W[k];
    installed = true;
  }
  function uninstall() {
    if (!installed) return;
    for (const k in W) if (RB.combatLogic[k] === W[k]) RB.combatLogic[k] = orig[k];
    installed = false;
  }
  if (RB.combat && RB.combat.start) {
    const origStart = RB.combat.start;
    RB.combat.start = async function (enemyId, opts) {
      const need = !!ctxNow();
      if (need) install();
      try { return await origStart.call(RB.combat, enemyId, opts); } finally { uninstall(); }
    };
  }

  // ---- Unravel-only simulator (used by selfCheck and tests) ----------------------------------------------
  // The player answers correctly and only ever Unravels — except that when a
  // foe is shrouded and the player knows a light/wind word, the UI disables
  // Unravel, so the simulated player writes that word instead.
  function simBattle(enemyId, o) {
    o = o || {};
    const base = C.enemies[enemyId];
    if (!base) return { win: false, error: 'missing enemy ' + enemyId };
    const enemy = Object.assign({ id: enemyId }, base);
    const ctx = { run: o.run || null, relics: o.relics || [], mods: o.mods || [], comp: o.comp || null, charm: o.charm || null, combos: combosOf(o.relics || [], o.comp || null) };
    applyEnemy(enemy, Object.assign({}, ctx, { run: null }));
    const s = { learn: { difficulty: o.difficulty || 'normal', assist: 'normal', profile: 'E' }, resolve: { pc: 12, comp: 12, max: 12 }, comp: o.comp || null };
    const st = orig.init(enemy, s, {});
    E.init(st, enemy, ctx);
    const light = C.words.hikari || { id: 'hikari', tags: ['light'] };
    for (let round = 0; round < 120; round++) {
      const card = st.shroud && o.knowsLight ? { kind: 'word', word: light } : { kind: 'unravel' };
      const res = { ok: true, firstTry: true, mistakes: o.mistakes ? 1 : 0 };
      const kb = st.knots, hb = st.harmony;
      const out = orig.playerAct(st, card, res, enemy);
      E.player(st, card, res, enemy, ctx, out, kb, hb);
      if (st.knots <= 0) return { win: true, rounds: round + 1, pc: st.pc, comp: st.comp };
      E.enemy(st, out.answered, ctx);
      orig.endRound(st, enemy);
      E.endRound(st, enemy, ctx);
      if (st.over) return { win: st.over === 'win', rounds: round + 1, pc: st.pc, comp: st.comp };
    }
    return { win: false, stall: true, rounds: 120 };
  }
  function intentProblems(enemyId, mods) {
    const errs = [];
    const base = C.enemies[enemyId];
    if (!base) return ['missing enemy ' + enemyId];
    const enemy = applyEnemy(Object.assign({ id: enemyId }, base), { mods: mods || [], run: null });
    const keys = new Set((enemy.pattern || []).concat(...(enemy.phases || []).map((p) => p.pattern)));
    for (const k of keys) {
      const kind = k.split(':')[0];
      if (!L.INTENTS[kind]) errs.push(enemyId + ': unknown intent ' + k);
      if (kind === 'silence') errs.push(enemyId + ': silence would block Unravel for players who know bell/voice');
      const it = (enemy.intents || {})[k] || {};
      const tiers = ['F', 'E', 'I', 'A'];
      if (kind === 'plea' || kind === 'lie' || kind === 'mirror') {
        if (!it.text) errs.push(enemyId + ': ' + k + ' needs authored text');
        const steps = kind === 'plea' ? it.answer : it.truth;
        if (!steps) errs.push(enemyId + ': ' + k + ' needs ' + (kind === 'plea' ? 'an answer' : 'a truth') + ' step');
        for (const t of tiers) {
          if (it.text && !it.text[t]) errs.push(enemyId + ': ' + k + ' text missing tier ' + t);
          if (steps && !steps[t]) errs.push(enemyId + ': ' + k + ' step missing tier ' + t);
          if (steps && steps[t]) for (const e of AT.validStep(steps[t])) errs.push(enemyId + ' ' + k + '[' + t + ']: ' + e);
        }
      }
    }
    return errs;
  }

  // ---- Satchel keywords for the permanent charms --------------------------------------------------------------
  // Kept beside the effects above so the two stay in step. RB.equip (src/engine/07_equip.js) shows them in the
  // Satchel's list and its Key: each charm's benefit, and the drawback that comes with it.
  if (RB.equip) RB.equip.defineEffect('atlasCharm', (v, T) => ({
    reed: [T.boon('atlas_reed', 'ward', 'Battle start: ward +1 (you)', '{初|はじ}め から {守|まも}り ＋1', 'Every battle begins with a ward of 1 in front of you (not your companion).'),
      T.cost('atlas_reed_cost', 'Techniques need 4 harmony', '{技|わざ} に は {調和|ちょうわ} 4', 'A coordinated technique needs 4 harmony instead of 3.')],
    tide: [T.boon('atlas_tide', 'wave', 'Floods and sweeps −1', '{大波|おおなみ} と {薙|な}ぎ −1', 'Floods and sweeps hit for 1 less.'),
      T.cost('atlas_tide_cost', 'Word wards hold 1', '{言葉|ことば} の {守|まも}り は 1', 'A ward you raise with a word holds 1 point instead of 2.')],
    page: [T.boon('atlas_page', 'harmony', 'Clean Unravel: harmony ×2', 'ほどき で {調和|ちょうわ} ×2', 'A clean Unravel builds twice the harmony.'),
      T.cost('atlas_page_cost', 'Answers build no harmony', '{答|こた}え で は {調和|ちょうわ} なし', 'Answering and seeing through build no harmony.')],
    mirror: [T.boon('atlas_mirror', 'knot', 'Seeing through frees a knot', '{見破|みやぶ}る と {結|むす}び{目|め} が ほどける', 'Seeing through a lie or an echo frees a knot as well.'),
      T.cost('atlas_mirror_cost', 'First Unravel frees nothing', '{最初|さいしょ} の ほどき は {空振|からぶ}り', 'Your first Unravel in each battle only finds the thread; it frees nothing.')],
  })[v] || [T.special()]);

  AT.combat = { applyEnemy, effects: E, ctxNow, runActive, charmOf, combosOf, install, uninstall, installed: () => installed, orig };
  AT.simBattle = simBattle;
  AT.intentProblems = intentProblems;
})();
