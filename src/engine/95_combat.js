/* Inkweaving — combat logic (pure state transitions; UI is src/ui/80_combat.js).
 *
 * Each exchange: the enemy telegraphs an intent (in Japanese at the player's
 * level). The player picks a response — an inscription word whose ordinary
 * meaning answers the intent (water cools, light reveals, protect wards…),
 * an Unravel that restores one of the enemy's tangled words, or a
 * companion technique — then expresses it in Japanese. Nothing is timed and
 * the enemy never acts while the player writes. Recognition uncertainty
 * never costs anything; a genuine mistake costs at most 1 resolve per
 * exchange (none in Assisted mode). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.combatLogic = (function () {
  'use strict';

  // Default intents. `counters` lists word tags that cancel the intent.
  const INTENTS = {
    strike: { icon: '⚔', label: 'Strike', power: 2, counters: ['ward'], target: 'rand' },
    sweep: { icon: '〰', label: 'Sweep', power: 1, counters: ['ward'], target: 'both' },
    heat: { icon: '🔥', label: 'Heat', counters: ['water'], effect: 'heat' },
    shroud: { icon: '☁', label: 'Shroud', counters: ['light', 'wind'], effect: 'shroud' },
    charge: { icon: '⏳', label: 'Gathering', counters: ['bind'], effect: 'charge' },
    gust: { icon: '🌀', label: 'Gust', power: 1, counters: ['anchor'], effect: 'stripWard', target: 'both' },
    mend: { icon: '🧵', label: 'Re-tying', counters: ['bind', 'light'], effect: 'mend' },
    lie: { icon: '🎭', label: 'False promise', counters: ['truth'], effect: 'lie', power: 1, target: 'rand' },
    plea: { icon: '💬', label: 'Plea', counters: ['answer'], effect: 'plea' },
    rest: { icon: '…', label: 'Waiting', counters: [], effect: 'rest' },
    flood: { icon: '🌊', label: 'Flood', power: 2, counters: ['ward', 'stone', 'anchor'], target: 'both' },
    chill: { icon: '❄', label: 'Chill', counters: ['fire', 'warm'], effect: 'chill', power: 1, target: 'rand' },
    silence: { icon: '🔇', label: 'Hush', counters: ['voice', 'bell'], effect: 'silence' },
    mirror: { icon: '🪞', label: 'Mirror', counters: ['truth', 'light'], effect: 'mirror', power: 2, target: 'rand' },
  };
  const DIFF = {
    relaxed: { powerMod: -1, resolve: 14, knotMod: 0 },
    normal: { powerMod: 0, resolve: 12, knotMod: 0 },
    hard: { powerMod: 1, resolve: 10, knotMod: 1 },
  };

  function init(enemy, s, opts) {
    const d = DIFF[s.learn.difficulty] || DIFF.normal;
    const comp = s.comp || null;
    const knots = Math.max(1, (enemy.knots || 2) + d.knotMod);
    const st = {
      enemyId: enemy.id, knots, maxKnots: knots,
      pattern: (enemy.pattern || ['strike', 'rest']).slice(), pi: 0, phase: -1,
      pc: Math.min(s.resolve.pc, s.resolve.max), comp: comp ? Math.min(s.resolve.comp, s.resolve.max) : 0, max: s.resolve.max,
      ward: { pc: 0, comp: 0 }, harmony: 0, harmonyMax: 3,
      heat: 0, shroud: false, charged: false, silenced: 0,
      compId: comp, misdirectUsed: false, openingBonus: false,
      round: 0, intent: null, nextIntents: [], log: [], over: null, diff: d, mistakeCostThisRound: 0,
      assist: s.learn.assist === 'assist',
    };
    if (comp === 'ren') st.ward.pc = 1, st.ward.comp = 1;
    st.intent = drawIntent(enemy, st);
    return st;
  }

  function intentDef(enemy, key) {
    const base = INTENTS[key.split(':')[0]] || INTENTS.strike;
    const o = (enemy.intents && enemy.intents[key]) || {};
    return Object.assign({ key, kind: key.split(':')[0] }, base, o);
  }
  function drawIntent(enemy, st) {
    // phase changes
    if (enemy.phases) {
      for (let i = enemy.phases.length - 1; i >= 0; i--) {
        const ph = enemy.phases[i];
        if (st.knots <= ph.at && st.phase < i) {
          st.phase = i;
          st.pattern = ph.pattern.slice();
          st.pi = 0;
          st.phaseChanged = ph;
          break;
        }
      }
    }
    const key = st.pattern[st.pi % st.pattern.length];
    st.pi++;
    const it = intentDef(enemy, key);
    // resolve random targets now so the telegraph can name them
    if (it.target === 'rand') it.target = st.compId && (st.round * 7 + st.pi * 3 + st.knots) % 2 ? 'comp' : 'pc';
    if (!st.compId && it.target === 'comp') it.target = 'pc';
    if (st.charged && (it.kind === 'strike' || it.kind === 'sweep')) it.power = (it.power || 2) + 2;
    st.nextIntents = [];
    for (let k = 0; k < 2; k++) st.nextIntents.push(intentDef(enemy, st.pattern[(st.pi + k) % st.pattern.length]));
    return it;
  }

  // Available response cards. words: array of word defs (with id, tags).
  function responses(st, words) {
    const out = [];
    const it = st.intent;
    out.push({ id: 'unravel', kind: 'unravel', icon: '🪢', jp: 'ほどく', en: 'Unravel', desc: 'Restore one of its tangled words — frees a knot.', disabled: st.shroud ? 'Shrouded: you can\'t see the knots.' : null });
    if (it && it.kind === 'plea') out.push({ id: 'answer', kind: 'answer', icon: '💬', jp: 'こたえる', en: 'Answer', desc: 'Reply to what it is really asking.' });
    if (it && (it.kind === 'lie' || it.kind === 'mirror')) out.push({ id: 'truth', kind: 'truth', icon: '🔍', jp: 'みぬく', en: 'See through', desc: 'Point out what is false in what it said.' });
    for (const w of words) {
      if (w.tags.indexOf('ward') >= 0) {
        out.push({ id: 'w:' + w.id + ':pc', kind: 'word', word: w, target: 'pc', icon: w.icon || '🛡', jp: w.jp, en: w.en, desc: w.effect + ' (you)' });
        if (st.compId) out.push({ id: 'w:' + w.id + ':comp', kind: 'word', word: w, target: 'comp', icon: w.icon || '🛡', jp: w.jp, en: w.en, desc: w.effect + ' (companion)' });
      } else {
        out.push({ id: 'w:' + w.id, kind: 'word', word: w, icon: w.icon || '✦', jp: w.jp, en: w.en, desc: w.effect });
      }
    }
    if (st.harmony >= st.harmonyMax && st.compId) out.push({ id: 'tech', kind: 'tech', icon: '✧', jp: 'あわせ', en: 'Coordinated technique', desc: 'A single inscription the two of you weave together.' });
    return out;
  }

  // Apply the player's resolved action. result: {ok, mistakes, assisted}
  function playerAct(st, card, result, enemy) {
    const it = st.intent;
    const fx = [];
    let countered = false;
    st.mistakeCostThisRound = 0;
    if (result.mistakes > 0 && !st.assist) {
      // small, capped consequence: one point of resolve, once per exchange
      st.mistakeCostThisRound = 1;
      st.pc = Math.max(0, st.pc - 1);
      fx.push({ t: 'cost', en: 'A slip of the brush costs a little resolve (−1).' });
    }
    const perfect = result.ok && result.firstTry !== false;
    if (card.kind === 'unravel' || card.kind === 'tech') {
      let n = 1;
      if (st.openingBonus) { n = 2; st.openingBonus = false; fx.push({ t: 'comp', who: 'nao', en: 'Nao saw the opening — two knots come loose.' }); }
      if (card.kind === 'tech') n = techUnravel(st);
      st.knots = Math.max(0, st.knots - n);
      fx.push({ t: 'unravel', n });
      if (card.kind === 'tech') { applyTech(st, fx); countered = true; st.harmony = 0; }
      if (it.kind === 'rest') countered = true;
    } else if (card.kind === 'answer') {
      if (it.kind === 'plea') { countered = true; st.knots = Math.max(0, st.knots - 1); fx.push({ t: 'settle', en: 'It listens. One knot loosens on its own.' }); }
    } else if (card.kind === 'truth') {
      if (it.kind === 'lie' || it.kind === 'mirror') { countered = true; fx.push({ t: 'reveal', en: 'The false promise falls apart.' }); if (it.kind === 'mirror') st.knots = Math.max(0, st.knots - 1); }
    } else if (card.kind === 'word') {
      const tags = card.word.tags;
      if (tags.indexOf('ward') >= 0) {
        // A ward raised in front of the telegraphed target blocks that blow;
        // otherwise it lingers (2 points) for later blows.
        const blocks = it.counters.indexOf('ward') >= 0 && it.target === card.target && it.kind !== 'charge';
        if (blocks) { countered = true; fx.push({ t: 'ward', target: card.target, block: true }); }
        else { st.ward[card.target] += 2; fx.push({ t: 'ward', target: card.target }); }
      }
      if (tags.indexOf('heal') >= 0) { st.pc = Math.min(st.max, st.pc + 3); if (st.compId) st.comp = Math.min(st.max, st.comp + 3); fx.push({ t: 'heal' }); }
      if (tags.indexOf('water') >= 0) { if (st.heat) fx.push({ t: 'water' }); st.heat = 0; }
      if (tags.indexOf('light') >= 0 || tags.indexOf('wind') >= 0) { if (st.shroud) fx.push({ t: 'light' }); st.shroud = false; }
      if (tags.indexOf('bind') >= 0) { if (st.charged) fx.push({ t: 'bind' }); st.charged = false; }
      if (tags.indexOf('warm') >= 0 || tags.indexOf('fire') >= 0) fx.push({ t: 'warm' });
      if (tags.indexOf('bell') >= 0 || tags.indexOf('voice') >= 0) { st.silenced = 0; fx.push({ t: 'bell' }); }
      for (const tg of tags) if (it.counters.indexOf(tg) >= 0 && tg !== 'ward') countered = true;
      if (it.kind === 'charge' && st.compId === 'ren' && result.ok) { countered = true; fx.push({ t: 'comp', who: 'ren', en: 'Ren\'s lamp flares and interrupts the gathering force.' }); }
    }
    if (it.kind === 'lie' && st.compId === 'suzu' && result.ok && !countered && card.kind !== 'word') { countered = true; fx.push({ t: 'comp', who: 'suzu', en: 'Suzu laughs at the promise until it sounds as hollow as it is.' }); }
    // harmony builds on clean, meaningful play
    if (perfect && (countered || card.kind === 'unravel')) st.harmony = Math.min(st.harmonyMax, st.harmony + 1);
    if (perfect && countered && st.compId === 'nao' && card.kind !== 'unravel' && card.kind !== 'tech') st.openingBonus = true;
    st.lastCountered = countered;
    return { fx, countered };
  }
  function techUnravel(st) {
    return st.compId === 'nao' || st.compId === 'suzu' ? 2 : 1;
  }
  function applyTech(st, fx) {
    const c = st.compId;
    if (c === 'nao') fx.push({ t: 'tech', who: 'nao', en: 'Read the Opening: you strike where it was about to move.' });
    if (c === 'mio') { st.pc = st.max; st.comp = st.max; st.heat = 0; st.shroud = false; st.charged = false; fx.push({ t: 'tech', who: 'mio', en: 'Clearwater Draught: both of you steady, every lingering effect washed away.' }); }
    if (c === 'ren') { st.ward.pc += 3; st.ward.comp += 3; fx.push({ t: 'tech', who: 'ren', en: 'Lantern Ward: light stands between you and the next two blows.' }); }
    if (c === 'suzu') fx.push({ t: 'tech', who: 'suzu', en: 'Curtain Call: its own intent turns back on it.' });
  }

  // Enemy resolves its telegraphed intent unless countered.
  function enemyAct(st, countered) {
    const it = st.intent;
    const fx = [];
    const dmg = (who, p) => {
      if (who === 'comp' && !st.compId) who = 'pc';
      let power = Math.max(0, p + st.diff.powerMod + (st.heat ? 1 : 0));
      if (st.compId === 'suzu' && !st.misdirectUsed && power > 0 && ((who === 'pc' ? st.pc : st.comp) - power <= 2)) {
        st.misdirectUsed = true;
        fx.push({ t: 'comp', who: 'suzu', en: 'Suzu steps into the blow with a flourish — it meets empty air.' });
        return;
      }
      const w = st.ward[who];
      const absorbed = Math.min(w, power);
      st.ward[who] -= absorbed;
      power -= absorbed;
      if (absorbed) fx.push({ t: 'block', who, n: absorbed });
      if (power > 0) {
        if (who === 'pc') st.pc = Math.max(0, st.pc - power); else st.comp = Math.max(0, st.comp - power);
        fx.push({ t: 'hit', who, n: power });
      }
    };
    if (!countered) {
      switch (it.kind) {
        case 'strike': case 'lie': case 'mirror': case 'chill':
          dmg(it.target, it.power || 2); break;
        case 'sweep': case 'flood':
          dmg('pc', it.power || 1); if (st.compId) dmg('comp', it.power || 1); break;
        case 'gust':
          st.ward.pc = 0; st.ward.comp = 0; fx.push({ t: 'stripWard' }); dmg('pc', it.power || 1); break;
        case 'heat': st.heat = Math.min(3, st.heat + 1); fx.push({ t: 'heat', n: st.heat }); break;
        case 'shroud': st.shroud = true; fx.push({ t: 'shroud' }); break;
        case 'charge': st.charged = true; fx.push({ t: 'charge' }); break;
        case 'mend': if (st.knots < st.maxKnots) { st.knots++; fx.push({ t: 'mend' }); } break;
        case 'silence': st.silenced = 1; fx.push({ t: 'silence' }); break;
        case 'plea': fx.push({ t: 'plea' }); break;
        default: break;
      }
    } else {
      fx.push({ t: 'countered', kind: it.kind });
      if (it.kind === 'charge') st.charged = false;
    }
    if (it.kind === 'strike' || it.kind === 'sweep') st.charged = false;
    // companion passives at the end of the exchange
    if (st.compId === 'mio' && st.pc + st.comp > 0) {
      const before = st.pc + st.comp;
      st.pc = Math.min(st.max, st.pc + (st.pc > 0 ? 1 : 0));
      st.comp = Math.min(st.max, st.comp + (st.comp > 0 ? 1 : 0));
      if (st.pc + st.comp > before) fx.push({ t: 'comp', who: 'mio', en: 'Mio presses a warm draught into your hands (+1).' });
    }
    return fx;
  }

  function endRound(st, enemy) {
    st.round++;
    if (st.knots <= 0) { st.over = 'win'; return; }
    const partyDown = st.pc <= 0 && (!st.compId || st.comp <= 0);
    if (partyDown || st.pc <= 0) {
      // If the player falls but the companion stands, the companion helps them up once.
      if (st.pc <= 0 && st.compId && st.comp > 0 && !st.revived) {
        st.revived = true;
        st.pc = Math.ceil(st.max / 3);
        st.log.push({ t: 'revive' });
      } else { st.over = 'lose'; return; }
    }
    st.phaseChanged = null;
    st.intent = drawIntent(enemy, st);
  }
  return { INTENTS, DIFF, init, responses, playerAct, enemyAct, endRound, intentDef };
})();
