/* Modifier words (expansion E27; Robin's C-70, C-72, C-74; docs/future/work/P04_ENCOUNTERS.md "Modifiers").
 *
 * A modifier never acts alone: it changes who, how many, what kinds, how much or how long a response reaches, and
 * the response still does what it always did. Each permitted pairing is data (src/content/encounters/10_modifiers.js:
 * the modifier, the response, the natural phrase, the option it asks for, the effect, the trade, how it is taught);
 * a pairing that is not listed is not offered, and the response with no modifier stays exactly as it was.
 *
 * Every modifier is a trade, never an upgrade: reaching more makes each part lighter (すべて); fitting each target
 * lasts only this round (それぞれ); doing more means one target only (全部, たくさん); lasting means it can be broken
 * (永遠に); no limit means this round only (無限に). The phrase is longer to write, so a modifier is used when it is
 * worth it.
 *
 * Only encounters whose rules allow modifiers offer them (st.rules.modifiers), and only those the player has been
 * taught (a concept, RB.phase), never on Relaxed's first meeting with a word. A Hush can silence the modifiers for a
 * few exchanges (st.hushed.modifiers): the player's words reach one at a time until it ends. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.modifiers = (function () {
  'use strict';
  const L = () => RB.combatLogic;
  const C = () => RB.content.modifiers || { families: {}, pairs: [] };

  // the pairings for a response card (by its word, or 'unravel')
  const respOf = (card) => (card.kind === 'word' ? card.word.id : card.kind === 'unravel' ? 'unravel' : null);
  function pairsFor(card) {
    const r = respOf(card);
    return r ? C().pairs.filter((p) => p.resp === r) : [];
  }
  // what the player knows: the encounter allows modifiers, and each is taught (or the encounter grants them all:
  // a development fixture, or a Tactics Board study of modifiers)
  function known(st, s) {
    if (!st.rules || !st.rules.modifiers) return [];
    const fams = C().families;
    return Object.keys(fams).filter((id) => st.rules.modifiers === 'all' || [].concat(st.rules.modifiers).indexOf(id) >= 0 || (s && RB.phase && RB.phase.knows(s, 'mod_' + id)));
  }
  // The modifiers on offer this exchange: [{ id, family, hushed (why, if silenced) }]
  // The breath (E27's fallback, adopted after the curve test: lead's decision F-12): an extended response cannot be
  // extended again the very next exchange.
  const breathing = (st) => st.modRound != null && st.modRound === st.round - 1;
  function offered(st, s) {
    const out = [];
    for (const id of known(st, s)) {
      const left = st.hushed && st.hushed.modifiers;
      const why = left ? 'Hushed for ' + left + ' more exchange' + (left > 1 ? 's' : '') + ': your words reach one at a time. A bell or a voice ends it now.'
        : breathing(st) ? 'Catching your breath: a modifier cannot extend a response two exchanges running.' : null;
      out.push({ id, family: C().families[id], hushed: why });
    }
    return out;
  }
  // The card a modifier makes of a response (or null when it does not pair): the same card, with `mod` and the
  // phrase to write. opt: the pairing's option (whom, which two, which to leave out).
  function extend(card, modId, opt) {
    const p = C().pairs.find((x) => x.mod === modId && x.resp === respOf(card));
    if (!p) return null;
    const out = Object.assign({}, card, { mod: { id: modId, pair: p, opt: opt == null ? null : opt }, id: card.id + '+' + modId });
    return out;
  }
  // Why a response does not pair with a modifier (for the dimmed card)
  function why(card, modId) {
    const f = C().families[modId];
    if (!f) return 'Not a modifier.';
    const ok = C().pairs.filter((p) => p.mod === modId).map((p) => p.respEn);
    return f.en + ' does not read naturally with this response' + (ok.length ? '; it goes with ' + ok.join(', ') : '') + '.';
  }

  // ---- what an extended response reaches (for the screen's marks and the preview) --------------------------------
  function reach(st, card, base) {
    const p = card.mod.pair, up = L().standing(st), T = st.cur;
    const both = st.compId ? ['pc', 'comp'] : ['pc'];
    const o = { foes: base.foes.slice(), allies: base.allies.slice(), all: false };
    switch (p.effect) {
      case 'ward_each': case 'ward_fit': case 'ward_per_blow': case 'ward_unlimited': case 'ward_party': o.allies = both; o.foes = []; break;
      case 'ward_any': o.allies = [card.mod.opt === 'comp' && st.compId ? 'comp' : 'pc']; o.foes = []; break;
      case 'heal_full': o.allies = [card.mod.opt === 'comp' && st.compId ? 'comp' : 'pc']; o.foes = []; break;
      case 'light_all': case 'rope_all': case 'rope_group': o.foes = up.slice(); break;
      case 'rope_most': o.foes = up.filter((i) => i !== card.mod.opt); break;
      case 'unravel_two': o.foes = [].concat(card.mod.opt || [T]).filter((i) => up.indexOf(i) >= 0); break;
      case 'water_more': o.foes = up.indexOf(T) >= 0 ? [T] : []; break;
      case 'wind_forever': o.foes = up.slice(); break;
      default: break;
    }
    o.all = up.length > 1 && o.foes.length === up.length;
    return o;
  }

  // ---- what it does (called by the rules' playerAct, which keeps the slip cost and Harmony) ----------------------
  function act(st, card, answered, fx) {
    const p = card.mod.pair, up = L().standing(st), T = st.cur;
    st.modRound = st.round;
    const both = st.compId ? ['pc', 'comp'] : ['pc'];
    st.mods = st.mods || {};
    const strikeAt = (who) => up.find((i) => { const it = st.foes[i].intent; return it && !answered[i] && it.counters.indexOf('ward') >= 0 && it.target === who && it.target !== 'both' && it.kind !== 'charge'; });
    const tag = { mod: card.mod.id };
    switch (p.effect) {
      case 'ward_each':
        // すべて: a ward before each of you; each blocks a Strike aimed at that person and soaks 1 later, not 2
        for (const who of both) {
          const b = strikeAt(who);
          if (b != null) { answered[b] = true; fx.push(Object.assign({ t: 'ward', target: who, block: true, foe: b }, tag)); }
          else { st.ward[who] = (st.ward[who] || 0) + 1; fx.push(Object.assign({ t: 'ward', target: who, n: 1 }, tag)); }
        }
        break;
      case 'ward_any': {
        // あらゆる: before one of you, the next blow of any kind is stopped (not only a Strike); it soaks nothing else
        const who = card.mod.opt === 'comp' && st.compId ? 'comp' : 'pc';
        st.mods.any = Object.assign({}, st.mods.any, { [who]: true });
        fx.push(Object.assign({ t: 'ward', target: who, any: true, en: 'A ward against every kind of blow rises before ' + (who === 'comp' ? 'your companion' : 'you') + '.' }, tag));
        break;
      }
      case 'ward_party':
        // 全体: one ward around the party: the first blow to land on either of you
        st.mods.shield = true;
        fx.push(Object.assign({ t: 'ward', target: 'party', party: true, en: 'One ward closes around you both: it will take the first blow that lands.' }, tag));
        break;
      case 'ward_fit': {
        // それぞれ: before each of you, a ward fitted to the blow aimed at that person (any kind: a Strike at one, a
        // Chill at the other; a Sweep at both meets both wards), this round only; it soaks nothing later
        const used = {};
        for (const i of up) {
          const it = st.foes[i].intent;
          if (!it || answered[i] || !L().basePower(it)) continue;
          const bl = L().withFoe(st, i, () => L().blowOf(st, it));
          if (!bl || !bl.who.length || bl.who.some((w) => used[w] || (w !== 'pc' && w !== 'comp'))) continue;
          for (const w of bl.who) used[w] = true;
          answered[i] = true;
          fx.push(Object.assign({ t: 'ward', target: bl.who.length > 1 ? 'party' : bl.who[0], block: true, foe: i, fit: true }, tag));
        }
        if (!Object.keys(used).length) fx.push(Object.assign({ t: 'ward', target: 'party', fit: true, none: true, en: 'No blow is aimed at either of you: the fitted wards have nothing to meet.' }, tag));
        break;
      }
      case 'ward_per_blow':
        // ごとに: a small ward renewed before every blow this round, whoever it is aimed at (each soaks 1)
        st.mods.perBlow = st.round;
        fx.push(Object.assign({ t: 'ward', target: 'party', perBlow: true, en: 'A small ward will rise before every blow this exchange (each soaks 1).' }, tag));
        break;
      case 'ward_unlimited':
        // 無限に: the ward blocks every Strike this round, at either of you, then it is gone
        for (const i of up) { const it = st.foes[i].intent; if (it && it.kind === 'strike' && !answered[i]) { answered[i] = true; fx.push(Object.assign({ t: 'ward', target: it.target === 'comp' && st.compId ? 'comp' : 'pc', block: true, foe: i }, tag)); } }
        st.mods.unlimited = st.round;
        break;
      case 'heal_full': {
        // 全部: all of one person's resolve, instead of some to both
        const who = card.mod.opt === 'comp' && st.compId ? 'comp' : 'pc';
        const was = { pc: st.pc, comp: st.comp };
        if (who === 'pc') st.pc = st.max; else st.comp = st.max;
        const d = { pc: st.pc - was.pc, comp: st.comp - was.comp };
        fx.push(Object.assign({ t: 'heal', n: d[who], aim: [who], who: d[who] > 0 ? [who] : [], d, gain: d.pc + d.comp }, tag));
        break;
      }
      case 'light_all':
        // すべて + light: the mist on every creature clears, and every Shroud is answered; spread this thin it stops
        // no Re-tying and no Mirror
        for (const i of up) {
          const f = st.foes[i];
          if (f.shroud) { f.shroud = false; fx.push(Object.assign({ t: 'light', foe: i }, tag)); }
          if (f.intent && f.intent.kind === 'shroud' && !answered[i]) answered[i] = true;
        }
        break;
      case 'rope_all':
        // すべて + rope: every creature's Gathering stops; spread this thin it holds no Re-tying
        for (const i of up) {
          const f = st.foes[i];
          if (f.charged) { f.charged = false; fx.push(Object.assign({ t: 'bind', foe: i }, tag)); }
          if (f.intent && f.intent.kind === 'charge' && !answered[i]) answered[i] = true;
        }
        break;
      case 'rope_most':
        // 大半: every creature but the one you leave out, each at full strength (Gathering and Re-tying)
        for (const i of up) {
          if (i === card.mod.opt) continue;
          const f = st.foes[i];
          if (f.charged) { f.charged = false; fx.push(Object.assign({ t: 'bind', foe: i }, tag)); }
          if (f.intent && (f.intent.kind === 'charge' || f.intent.kind === 'mend') && !answered[i]) answered[i] = true;
        }
        break;
      case 'rope_group':
        // 全体 + rope: what the group does together (a signal and the moves cued on it) and nothing else
        for (const i of up) { const it = st.foes[i].intent; if (it && (it.signal || it.cue) && !answered[i]) { answered[i] = true; fx.push(Object.assign({ t: 'bind', foe: i, group: true }, tag)); } }
        break;
      case 'unravel_two': {
        // いくつか: Unravel on two creatures of your choice, a knot each
        const two = [].concat(card.mod.opt || [T]).filter((i) => up.indexOf(i) >= 0).slice(0, 2);
        for (const i of two) {
          const f = st.foes[i];
          let n = 1;
          if (f.loose) { n += f.loose; f.loose = 0; }
          f.knots = Math.max(0, f.knots - n);
          fx.push(Object.assign({ t: 'unravel', n, foe: i }, tag));
          if (f.intent && f.intent.kind === 'rest') answered[i] = true;
        }
        break;
      }
      case 'water_more': {
        // たくさん: one creature only (water usually reaches all): its Heat goes, and soaked through it cannot raise
        // Heat next exchange
        if (up.indexOf(T) < 0) break;
        const f = st.foes[T];
        if (f.heat) fx.push(Object.assign({ t: 'water', foe: T }, tag));
        f.heat = 0;
        if (f.intent && f.intent.kind === 'heat' && !answered[T]) answered[T] = true;
        st.mods.soaked = Object.assign({}, st.mods.soaked, { [T]: st.round + 1 });
        fx.push(Object.assign({ t: 'water', foe: T, soaked: true, en: 'Soaked through: it cannot raise Heat next exchange.' }, tag));
        break;
      }
      case 'wind_forever':
        // 永遠に: the wind does what wind does, and goes on blowing: no creature can raise a Shroud until a Gust breaks it
        for (const i of up) {
          const f = st.foes[i];
          if (f.shroud) { f.shroud = false; fx.push(Object.assign({ t: 'light', foe: i, by: 'wind' }, tag)); }
          if (f.intent && f.intent.kind === 'shroud' && !answered[i]) answered[i] = true;
        }
        st.mods.wind = true;
        fx.push(Object.assign({ t: 'wind', lasting: true, en: 'The wind keeps blowing: no mist can gather while it does. A Gust would break it.' }, tag));
        break;
      default: break;
    }
  }

  // ---- lasting effects meet the creatures' moves (called by the rules' foeAct) ----------------------------------
  // A blow about to land on `who` with `power`: returns the power left (0 when stopped), adding what happened to fx.
  function onBlow(st, who, power, it, fx) {
    const m = st.mods;
    if (!m || power <= 0) return power;
    if (who !== 'pc' && who !== 'comp') return power;
    if (m.unlimited === st.round && it.kind === 'strike') { fx.push({ t: 'block', who, n: power, mod: 'mugen' }); return 0; }
    if (m.any && m.any[who]) { m.any = Object.assign({}, m.any, { [who]: false }); fx.push({ t: 'block', who, n: power, mod: 'arayuru' }); return 0; }
    if (m.shield) { m.shield = false; fx.push({ t: 'block', who, n: power, mod: 'zentai' }); return 0; }
    if (m.perBlow === st.round) { fx.push({ t: 'block', who, n: 1, mod: 'goto' }); return power - 1; }
    return power;
  }
  // A move that a lasting effect turns away before it happens: returns a reason, or null
  function stops(st, it) {
    const m = st.mods;
    if (!m) return null;
    if (it.kind === 'shroud' && m.wind) return 'wind';
    if (it.kind === 'heat' && m.soaked && m.soaked[st.cur] === st.round) return 'soaked';
    return null;
  }
  // a Gust breaks the everlasting wind
  function broken(st, it, fx) {
    if (st.mods && st.mods.wind && it.kind === 'gust') { st.mods.wind = false; fx.push({ t: 'wind', broken: true, en: 'The gust breaks the wind\'s long blowing.' }); }
  }
  // the close of an exchange: what lasted this round only ends
  function tick(st) {
    const m = st.mods;
    if (!m) return;
    if (m.soaked) for (const k of Object.keys(m.soaked)) if (m.soaked[k] < st.round) delete m.soaked[k];
  }

  // ---- the phrase to write (the language step) -------------------------------------------------------------------
  // Typed: the whole phrase; handwritten: the modifier (and its particle) with the rest shown; the pieces route
  // assembles it (construction, never handwriting). Only what was written counts as written: displayed nouns and
  // verbs earn no production credit (`items` differ by route).
  function step(card) {
    const p = card.mod.pair;
    const fam = C().families[card.mod.id];
    const plain = (m) => RB.jp.plain(m).replace(/\s+/g, '');
    const read = (m) => RB.jp.reading(m).replace(/\s+/g, '');
    const accept = Array.from(new Set([read(p.jp), plain(p.jp)].concat(p.accept || [])));
    const H = p.hand;
    const hAccept = Array.from(new Set([read(H.write), plain(H.write)]));
    return {
      kind: 'write', item: p.items, answer: read(p.jp), accept, mode: 'reading',
      title: 'Weave the phrase: ' + fam.en + ' and ' + p.respEn,
      prompt: { en: 'Write the whole phrase for “' + p.en + '”.' },
      explain: { jp: p.jp, en: p.en + ' — ' + p.does },
      choices: [read(p.jp)].concat(p.wrong || []).slice(0, 3),
      // handwritten: the modifier and its particle; the rest is shown and earns nothing
      byMode: { hand: { item: H.items, answer: read(H.write), accept: hAccept, template: { before: H.before || '', after: H.after || '' }, prompt: { en: 'Write the missing words (' + fam.en + ') for “' + p.en + '”.' }, choices: null } },
    };
  }

  return { pairsFor, known, offered, extend, why, reach, act, onBlow, stops, broken, tick, step, respOf, breathing };
})();
