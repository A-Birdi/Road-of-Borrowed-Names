/* Party choreography (battle addendum §8, §10, §18.3): how the player's responses, every companion
 * support action and each coordinated technique are performed, and how the party reacts to what the
 * rules actually did. src/ui/82_battle_seq.js asks for these (choreo.player, choreo.companion,
 * choreo.finish, choreo.revive, planOf, and the party-side cases of reactions); this file only turns
 * the rules' committed fx events into cues. It never computes, rerolls or applies a result: each
 * result is still one `beat` cue, placed once, in the rules' order.
 *
 * Every response family has its own gesture (RB.battlerMoves), its own motion of the written word on
 * the strip (`motif`, placed by RB.partyWord) and its own effect on the actual targets (RB.battleFx.fx,
 * the 'p…' effects of src/ui/84p_party_fx.js beside the shared ones). Every companion support action
 * (src/content/02_companions.js) and technique has a deliberate entry; a generic fallback is marked
 * `mapped: false` and reported by RB.partyChoreo.coverage() (tests/unit/battle_party.test.mjs fails on
 * one). Times are presentation ms at Normal playback (the sequencer's clock scales them).
 *
 * The word on the strip is the response's resolved Japanese with its reading: a word card's own word;
 * for Unravel, a technique, an answer or a seeing-through, the restored word or phrase when the combat
 * screen passes it (ctx.resolved, from the task that was answered), else the response's own Japanese.
 * A wrong attempt is never shown: only what the task accepted. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.partyChoreo = (function () {
  'use strict';
  const MV = () => RB.battlerMoves;

  // ---- the player's responses: families ------------------------------------------------------------------
  // by word id (stable; never a translated label); tags are the fallback for a word added later
  const WORD_FAMILY = { mamoru: 'protect', hikari: 'light', iyasu: 'heal', mizu: 'water', koori: 'ice', kaze: 'wind', nawa: 'bind', ishi: 'stone', tsuchi: 'stone', honoo: 'fire', suzu: 'bell', koe: 'voice' };
  function familyByTags(tags) {
    const has = (x) => (tags || []).indexOf(x) >= 0;
    return has('ward') ? 'protect' : has('heal') ? 'heal' : has('bind') ? 'bind' : has('anchor') || has('stone') ? 'stone' : has('fire') || has('warm') ? 'fire' : has('voice') ? 'voice' : has('bell') ? 'bell' : has('wind') ? 'wind' : has('water') ? 'water' : has('light') ? 'light' : null;
  }
  function familyOf(card) {
    if (!card) return { family: null, mapped: false };
    if (card.kind === 'unravel') return { family: 'unravel', mapped: true };
    if (card.kind === 'tech') return { family: 'technique', mapped: !!TECH[card.tech] };
    if (card.kind === 'answer') return { family: 'answer', mapped: true };
    if (card.kind === 'truth') return { family: 'truth', mapped: true };
    if (card.kind === 'word' && card.word) {
      const f = WORD_FAMILY[card.word.id];
      return f ? { family: f, mapped: true } : { family: familyByTags(card.word.tags) || 'light', mapped: false };
    }
    return { family: 'unravel', mapped: false };
  }
  // g: the player's gesture; motif: how the word moves (RB.partyWord); ant/act: gesture durations;
  // word: the strip's timing from its own start (at); contact: the first result; rec/recD: recovery;
  // end: the response's own end. (Protect is the §18.3 prototype: 1,500 ms, the word fully visible
  // ≈700 ms, the ward taking shape at 620 ms.)
  const W = (at, travel, unfurl, inkAt, inkEnd, fadeAt, end) => ({ at, travel, unfurl, inkAt, inkEnd, fadeAt, end });
  const FAM = {
    protect: { g: 'ward', motif: 'seal', ant: 200, act: 440, word: W(160, 0, 240, 140, 400, 1100, 1280), contact: 620, rec: 1100, recD: 400, end: 1500 },
    unravel: { g: 'thread', motif: 'thread', ant: 220, act: 560, word: W(120, 320, 220, 120, 440, 1180, 1360), contact: 760, rec: 1120, recD: 380, end: 1540 },
    light: { g: 'raise', motif: 'radiance', ant: 220, act: 440, word: W(140, 300, 200, 120, 420, 1160, 1340), contact: 700, rec: 1080, recD: 380, end: 1500 },
    heal: { g: 'restore', motif: 'gather', ant: 240, act: 540, word: W(140, 260, 220, 120, 420, 1150, 1330), contact: 760, rec: 1120, recD: 400, end: 1540 },
    water: { g: 'flow', motif: 'flow', ant: 200, act: 560, word: W(120, 380, 240, 120, 440, 1160, 1340), contact: 760, rec: 1100, recD: 380, end: 1500 },
    ice: { g: 'crystal', motif: 'crystal', ant: 200, act: 420, word: W(120, 200, 140, 80, 300, 1040, 1200), contact: 640, rec: 1000, recD: 360, end: 1400 },
    wind: { g: 'sweep', motif: 'drift', ant: 220, act: 540, word: W(120, 420, 240, 120, 440, 1180, 1360), contact: 760, rec: 1120, recD: 380, end: 1540 },
    bind: { g: 'trace', motif: 'wrap', ant: 200, act: 640, word: W(120, 320, 220, 120, 440, 1180, 1360), contact: 840, rec: 1160, recD: 360, end: 1560 },
    stone: { g: 'plant', motif: 'settle', ant: 240, act: 560, word: W(140, 300, 220, 120, 420, 1160, 1340), contact: 760, rec: 1150, recD: 400, end: 1560 },
    fire: { g: 'open', motif: 'ember', ant: 220, act: 480, word: W(140, 260, 220, 120, 420, 1140, 1320), contact: 700, rec: 1080, recD: 380, end: 1500 },
    bell: { g: 'ring', motif: 'pulse', ant: 200, act: 460, word: W(120, 240, 200, 120, 420, 1120, 1300), contact: 700, rec: 1060, recD: 380, end: 1460 },
    voice: { g: 'call', motif: 'voice', ant: 220, act: 460, word: W(120, 240, 200, 120, 420, 1120, 1300), contact: 700, rec: 1060, recD: 380, end: 1460 },
    answer: { g: 'book', motif: 'note', ant: 240, act: 560, word: W(160, 520, 200, 120, 440, 1200, 1380), contact: 840, rec: 1160, recD: 380, end: 1560 },
    truth: { g: 'lens', motif: 'split', ant: 220, act: 520, word: W(140, 320, 200, 120, 440, 1160, 1340), contact: 760, rec: 1100, recD: 380, end: 1500 },
  };
  // Coordinated techniques (§8.5): one named action, two real participants with complementary phases
  // (not the same gesture at the same time): the partner's own move (`p`, starting at pAt), the
  // player's (`g`, starting at gAt), one culmination (contact).
  const TECH = {
    nao: { g: 'thread', gAt: 260, p: 'point', pAt: 0, motif: 'join', word: W(320, 300, 220, 120, 440, 1260, 1440), contact: 980, rec: 1360, recD: 380, end: 1820, note: 'Nao points out where it will move; you send the thread exactly there: two knots.' },
    mio: { g: 'restore', gAt: 0, p: 'pour', pAt: 220, motif: 'join', word: W(160, 260, 220, 120, 440, 1260, 1440), contact: 980, rec: 1360, recD: 380, end: 1820, note: 'You write; Mio pours the draught into the ink as it is released: both restored, lingering effects washed off.' },
    ren: { g: 'ward', gAt: 200, p: 'ward', pAt: 0, motif: 'join', word: W(240, 0, 240, 140, 420, 1260, 1440), contact: 920, rec: 1360, recD: 380, end: 1800, note: 'Ren raises the lamp; your seal forms in its light before you both.' },
    suzu: { g: 'thread', gAt: 300, p: 'flourish', pAt: 0, motif: 'join', word: W(340, 300, 220, 120, 440, 1260, 1440), contact: 1000, rec: 1380, recD: 380, end: 1840, note: 'Suzu turns its move back on it with a flourish; your thread lands in the opening she makes.' },
  };

  // ---- companion support actions (src/content/02_companions.js), every one mapped ---------------------------
  // g: the companion's gesture; ant/act/rel: timing; contact: when its result arrives; travel: the visual
  // that carries it ('voice', 'pour', 'vapour', 'lamp', 'thread', 'attention', 'share', 'spot', 'salts',
  // 'clap', 'headoff'); to: where it goes ('foe', 'foes', 'allies', 'aimed', 'lower', 'pc', 'none').
  const S = (g, travel, to, ant, act, contact, end, note) => ({ g, travel, to, ant, act, contact, end, note });
  const SUPPORT = {
    nao_opening: S('spot', 'spot', 'foe', 180, 520, 620, 1240, 'A hand shading his eyes, a sweep of the look, a finger to the place — the opening marked on it only when there is one.'),
    nao_warn: S('call', 'voice', 'foe', 160, 420, 560, 1160, 'A shout with a cupped hand: the call carries to it, its blow marked softer.'),
    nao_hand: S('reach', 'thread', 'foe', 200, 560, 700, 1300, 'A step in, a low reach, the fingers closing on the knot and pulling — a thread to the very knot when it gives.'),
    nao_route: S('lunge', 'headoff', 'foe', 180, 420, 520, 1180, 'A crouch and a lunge on the opening: its move is crossed out before it starts.'),
    nao_mark: S('shoulder', 'share', 'allies', 180, 440, 560, 1180, 'A step to your side, braced, a hand out to you: a cord binds the two of you for the round.'),
    mio_draught: S('pour', 'pour', 'allies', 220, 600, 760, 1380, 'The vial from her hip, uncorked, poured: drops reach only those it restores, with their real amounts.'),
    mio_salve: S('dab', 'pour', 'lower', 220, 480, 680, 1300, 'Two careful dabs toward the one with less resolve.'),
    mio_vapour: S('waft', 'vapour', 'foe', 200, 520, 680, 1320, 'The open vial held up, the vapour fanned on: it washes off only what is actually there.'),
    mio_salts: S('salts', 'salts', 'allies', 180, 420, 540, 1160, 'The salts out before you ask, held to you both: a sharp sparkle, no recovery number.'),
    mio_tonic: S('tonic', 'pour', 'allies', 220, 600, 760, 1400, 'A step to your side, the tonic held out, a hand to your shoulder.'),
    ren_shade: S('shade', 'lamp', 'aimed', 180, 440, 600, 1220, 'The lamp lifted toward the one it aims at; the ward forms in its light.'),
    ren_flare: S('flare', 'lamp', 'foe', 200, 440, 580, 1240, 'Drawn back low, thrust up at it: the lamp flares and burns off what it holds.'),
    ren_vigil: S('vigil', 'lamp', 'allies', 220, 520, 680, 1300, 'The lamp held high at his side over you both; a ward before each.'),
    ren_lanterns: S('lanterns', 'lamp', 'foes', 220, 620, 760, 1420, 'The lamp raised and swung across over every one of them.'),
    ren_chime: S('front', 'lamp', 'pc', 200, 520, 660, 1300, 'A step in front of you, the lamp held out, his free arm across you.'),
    suzu_heckle: S('heckle', 'voice', 'foe', 160, 420, 540, 1160, 'A hand at her mouth, the other on her hip: the heckle carries to it.'),
    suzu_eye: S('beckon', 'attention', 'foe', 180, 520, 600, 1240, 'A step into the light, a wave: its attention turns to her (a line from it to her).'),
    suzu_encore: S('clap', 'clap', 'none', 160, 440, 520, 1140, 'A clap, then the hands flung open — and the thread between you brightens if Harmony rises.'),
    suzu_feint: S('feint', 'headoff', 'foe', 180, 460, 560, 1200, 'A dip, a quick step and a mock lunge: it lunges at nothing.'),
    suzu_finale: S('grand', 'attention', 'foes', 220, 640, 740, 1480, 'Gathered low, then both arms flung wide and held: every eye turns to her.'),
  };
  // a companion's own move inside an exchange (fx 'comp'): Nao's second thread, Suzu turning a blow
  // aside, Mio's vial at the end of the exchange (Atlas), Nao taking half
  const PASSIVE = { nao: 'point', mio: 'pour', ren: 'ward', suzu: 'flourish' };
  // the companion's way of helping you up (the existing revive) and the duration of their settle
  const REVIVE = { nao: 'help', mio: 'help', ren: 'help', suzu: 'help', comp: 'help' };

  // ---- helpers ------------------------------------------------------------------------------------------
  // the response's own Japanese, or the restored word or phrase (ctx.resolved) where the response is about it
  function wordOf(card, ctx) {
    const cmdJp = card.kind === 'word' ? card.word.jpK || card.word.jp : card.jp;
    const cmd = { jp: cmdJp, en: card.en, html: RB.ui.jhtml(cmdJp) };
    const r = ctx && ctx.resolved;
    if (r && r.jp && card.kind !== 'word') {
      const shown = { jp: r.jp, en: r.en || card.en, html: RB.ui.jhtml(r.jp), resolved: true };
      // the recap keeps the action's own word and the restored one
      const log = { jp: cmdJp, en: card.en + (r.en ? ' — ' + r.en : ''), html: cmd.html + ' · ' + shown.html };
      return { shown, log, cmd };
    }
    return { shown: cmd, log: cmd, cmd };
  }
  const stillWord = (w) => ({ motif: w.motif, travel: 0, unfurl: 0, inkAt: 0, inkEnd: 0, fadeAt: Math.max(880, w.fadeAt - w.inkEnd), end: Math.max(980, w.end - w.inkEnd), still: 1 });

  // The plan: who acts, the gesture, where the word goes, which family (stable ids for the pet and the record).
  function planOf(card, fx, ctx, H) {
    const has = (t) => fx.some((f) => f.t === t);
    const fam = familyOf(card);
    const party = ctx.comp ? 'party' : 'pc';
    const many = ctx.group && ctx.reach && ctx.reach.foes && ctx.reach.foes.length > 1;
    const one = H.foeId(ctx);
    let target = many ? 'foes' : one, actors = ['pc'], spec = FAM[fam.family], gesture = spec ? spec.g : 'direct';
    switch (fam.family) {
      case 'unravel': case 'answer': case 'truth': case 'bind': target = one; break;
      case 'technique': { actors = ['pc', 'comp']; const T = TECH[card.tech] || TECH.nao; spec = T; gesture = T.g; if (card.tech === 'suzu' && fx.some((f) => f.t === 'tech' && f.all)) target = 'foes'; break; }
      case 'protect': target = card.target || 'pc'; break;
      case 'heal': case 'stone': case 'fire': case 'bell': case 'voice': target = party; break;
      case 'light': target = one; break;
      default: break;
    }
    void has;
    const motif = spec.motif;
    // where the word goes: over the protected one; over the two of you for what is for you both; to the
    // creature (or the middle of those it reaches) for what is done to it
    const wordTo = target;
    return { target, gesture, actors, family: fam.family, mapped: fam.mapped, motif, spec, wordTo, travel: motif, tech: card.kind === 'tech' ? card.tech : null };
  }

  // ---- the player's response (or a coordinated technique) -------------------------------------------------
  function player(card, fx, ctx, H) {
    const Q = [], rd = !!ctx.reduce;
    ctx.kb = {};
    let t = 0;
    const cost = fx.find((f) => f.t === 'cost');
    if (cost) {
      // a slip of the brush (−1 resolve): shown first, as its own small beat
      react(Q, cost, 180, ctx, 'player', H);
      Q.push({ at: 180, type: 'beat', f: cost });
      t = 320;
    }
    const plan = planOf(card, fx, ctx, H);
    const F = plan.spec, W = wordOf(card, ctx);
    const tech = plan.family === 'technique';
    const rel = (g, who) => (who === 'comp' ? MV().release(ctx.comp, g) : MV().release('pc', g));
    // gestures: anticipation → express/release → recovery (a technique: two complementary performances)
    const perf = tech
      ? [{ who: 'comp', g: F.p, at: F.pAt, ant: 200, act: 520 }, { who: 'pc', g: F.g, at: F.gAt, ant: 220, act: 540 }]
      : [{ who: 'pc', g: F.g, at: 0, ant: F.ant, act: F.act }];
    const releaseAt = {};
    for (const p of perf) {
      if (rd) Q.push({ at: t + p.at, type: 'pose', who: p.who, pose: 'act', gesture: p.g, d: F.rec + F.recD - p.at });
      else {
        Q.push({ at: t + p.at, type: 'pose', who: p.who, pose: 'anticipate', gesture: p.g, d: p.ant });
        Q.push({ at: t + p.at + p.ant, type: 'pose', who: p.who, pose: 'act', gesture: p.g, d: p.act });
        Q.push({ at: t + F.rec + (p.who === 'comp' ? 60 : 0), type: 'pose', who: p.who, pose: 'recover', gesture: p.g, d: F.recD });
      }
      releaseAt[p.who] = t + p.at + p.ant + Math.round(p.act * rel(p.g, p.who));
    }
    // the written word: its own motion for this family
    const wt = Object.assign({ motif: plan.motif, family: plan.family }, rd ? stillWord(F.word) : F.word);
    if (plan.motif === 'split') wt.splitAt = F.contact - F.word.at; // it cracks when the falsehood gives way
    Q.push({ at: t + F.word.at, type: 'strip', word: W.shown, from: 'pc', to: plan.wordTo, tm: wt, d: wt.end });
    // what carries it to its actual targets (visual only)
    arrive(Q, plan, card, fx, ctx, t, releaseAt, H);
    // the results, in the rules' order, from the moment it arrives
    let bt = t + F.contact, first = true;
    const outs = fx.filter((f) => f.t !== 'cost' && f.t !== 'harmony');
    for (const f of outs) {
      react(Q, f, bt, ctx, 'player', H, plan);
      const cue = { at: bt, type: 'beat', f, word: first ? W.log : null };
      if (f.t === 'heal' || (f.t === 'tech' && f.who === 'mio')) cue.then = H.healThen;
      Q.push(cue);
      first = false;
      bt += H.OUTCOME[f.t] ? H.T.beatGap : 60;
    }
    if (first) Q.push({ at: bt, type: 'beat', f: { t: 'woven' }, word: W.log });
    const hm = fx.find((f) => f.t === 'harmony');
    if (hm) {
      const at = Math.max(bt + 80, t + F.contact + 220);
      if (ctx.comp) Q.push({ at: at - 120, type: 'fx', name: 'link', d: 520, p: {} });
      Q.push({ at, type: 'beat', f: hm });
      bt = at;
    }
    const end = Math.max(t + F.end, bt + 240, H.stillNums(Q, rd));
    return { cues: Q, end, plan, word: W.shown };
  }

  // The visuals that carry a response to its actual targets (one creature, several, an ally, the party).
  function arrive(Q, plan, card, fx, ctx, t, rel, H) {
    const F = plan.spec, T = H.fid(ctx), rd = !!ctx.reduce;
    const r = rel.pc != null ? rel.pc : t + 300;
    const each = plan.target === 'foes' ? ctx.reach.foes : [T];
    const onEach = (name, at, d, extra) => each.forEach((i, k) => Q.push({ at: at + k * 90, type: 'fx', name, d, p: Object.assign({ from: 'pc', to: H.foeId(ctx, i), foe: i }, extra ? extra(i) : {}) }));
    const evOn = (tt, i) => fx.some((f) => f.t === tt && H.fid(ctx, f.foe) === i);
    const both = ctx.comp ? ['pc', 'comp'] : ['pc'];
    const c = t + F.contact;
    switch (plan.family) {
      case 'unravel': {
        // the thread drawn out of the completed inscription to the very knot that loosens
        const i = Math.max(0, H.fview(ctx, T).knots - 1);
        Q.push({ at: r - 40, type: 'fx', name: 'pThread', d: c - r + 280, p: { from: 'pc', to: H.knotId(ctx, T, i), foe: T, pull: 1 } });
        const n = (fx.find((f) => f.t === 'unravel' && H.fid(ctx, f.foe) === T) || { n: 1 }).n;
        if (n > 1 && H.fview(ctx, T).knots > 1) Q.push({ at: r + 40, type: 'fx', name: 'pThread', d: c - r + 240, p: { from: ctx.comp && fx.some((f) => f.t === 'comp' && f.who === 'nao') ? 'comp' : 'pc', to: H.knotId(ctx, T, i - 1), foe: T, pull: 1 } });
        break;
      }
      case 'protect': {
        // the seal closes round the one it protects (it waits, raised, when it is to catch a blow)
        const blk = fx.some((f) => f.t === 'ward' && f.block);
        Q.push({ at: r, type: 'fx', name: 'pSealClose', d: 760, p: { to: plan.target, held: blk } });
        break;
      }
      case 'light': {
        onEach('flashReveal', r, c - r + 420, (i) => ({ lit: evOn('light', i) }));
        break;
      }
      case 'heal': {
        // gathered at the hand, then released to each one it actually restores (none: it settles back)
        const hf = fx.find((f) => f.t === 'heal');
        const who = hf ? hf.who || [] : [];
        Q.push({ at: t + F.ant - 120, type: 'fx', name: 'pGather', d: r - (t + F.ant - 120) + 160, p: { from: 'pc', none: !who.length } });
        who.forEach((w, k) => Q.push({ at: r + 40 + k * 70, type: 'fx', name: 'pHealTo', d: c - r + 120, p: { from: 'pc', to: w } }));
        break;
      }
      case 'water':
        each.forEach((i, k) => Q.push({ at: r - 60 + k * 90, type: 'fx', name: 'splashArc', d: c - r + 520, p: { from: 'pc', to: H.foeId(ctx, i), foe: i, steam: evOn('water', i) || (!ctx.group && fx.some((f) => f.t === 'water')) } }));
        break;
      case 'ice':
        onEach('pFrost', r, c - r + 560, (i) => ({ steam: evOn('water', i) }));
        break;
      case 'wind':
        each.forEach((i, k) => Q.push({ at: r - 40 + k * 80, type: 'fx', name: 'pWind', d: c - r + 460, p: { from: 'pc', to: H.foeId(ctx, i), foe: i } }));
        break;
      case 'bind':
        onEach('ropeBind', r - 120, c - r + 640, (i) => ({ held: evOn('bind', i) }));
        break;
      case 'stone':
        Q.push({ at: r, type: 'fx', name: 'pGround', d: 900, p: { who: both } });
        Q.push({ at: r + 120, type: 'fx', name: 'stone', d: 700, p: { who: both } });
        break;
      case 'fire':
        Q.push({ at: r, type: 'fx', name: 'pEmber', d: 900, p: { from: 'pc', who: both } });
        break;
      case 'bell':
        Q.push({ at: r, type: 'fx', name: 'ringsPulse', d: 760, p: { from: 'pc', to: 'party' } });
        break;
      case 'voice':
        Q.push({ at: r, type: 'fx', name: 'ringsVoice', d: 720, p: { from: 'pc', to: plan.target } });
        break;
      case 'answer':
        Q.push({ at: r, type: 'fx', name: 'pNote', d: c - r + 360, p: { from: 'pc', to: H.foeId(ctx), foe: T } });
        break;
      case 'truth':
        Q.push({ at: r - 40, type: 'fx', name: 'lens', d: 720, p: { foe: T } });
        break;
      case 'technique': {
        const who = plan.tech;
        // the two performances meet: a braided thread from both release points to the target
        Q.push({ at: Math.min(rel.pc, rel.comp) + 40, type: 'fx', name: 'pJoin', d: c - Math.min(rel.pc, rel.comp) + 300, p: { to: plan.target === 'foes' ? 'foes' : H.foeId(ctx), foe: T, who } });
        if (who === 'nao' || who === 'suzu') {
          const i = Math.max(0, H.fview(ctx, T).knots - 1);
          Q.push({ at: rel.pc, type: 'fx', name: 'pThread', d: c - rel.pc + 260, p: { from: 'pc', to: H.knotId(ctx, T, i), foe: T, pull: 1 } });
        }
        if (who === 'nao') Q.push({ at: rel.comp, type: 'fx', name: 'pSpot', d: c - rel.comp + 200, p: { from: 'comp', foe: T } });
        if (who === 'mio') Q.push({ at: rel.comp, type: 'fx', name: 'pPour', d: c - rel.comp + 120, p: { from: 'comp', who: ['pc'], into: 'pc' } });
        if (who === 'ren') Q.push({ at: rel.comp, type: 'fx', name: 'pLamp', d: c - rel.comp + 300, p: { from: 'comp', who: both } });
        if (who === 'suzu') Q.push({ at: rel.comp, type: 'fx', name: 'pAttention', d: c - rel.comp + 300, p: { to: 'comp', foes: plan.target === 'foes' ? ctx.reach.foes : [T] } });
        Q.push({ at: c - 200, type: 'fx', name: 'link', d: 600, p: {} });
        break;
      }
      default: break;
    }
    void rd;
  }

  // ---- the companion's support action -------------------------------------------------------------------
  function companion(act, fx, ctx, H) {
    const Q = [], rd = !!ctx.reduce, who = ctx.comp;
    const sp = SUPPORT[act.id];
    const mapped = !!sp;
    const s = sp || S(act.gesture || PASSIVE[who] || 'raise', 'none', 'none', 160, 420, 560, 1100, 'generic');
    const g = MV().hasGesture(s.g, who) ? s.g : PASSIVE[who] || 'raise';
    if (rd) Q.push({ at: 0, type: 'pose', who: 'comp', pose: 'act', gesture: g, d: s.contact + 200 });
    else {
      Q.push({ at: 0, type: 'pose', who: 'comp', pose: 'anticipate', gesture: g, d: s.ant });
      Q.push({ at: s.ant, type: 'pose', who: 'comp', pose: 'act', gesture: g, d: s.act });
      Q.push({ at: s.ant + s.act + 40, type: 'pose', who: 'comp', pose: 'recover', gesture: g, d: Math.max(220, s.end - s.ant - s.act - 120) });
    }
    const rel = s.ant + Math.round(s.act * MV().release(who, g));
    const cact = fx.find((f) => f.t === 'cact');
    const none = !!(cact && cact.none);
    const T = H.fid(ctx), both = ctx.comp ? ['pc', 'comp'] : ['pc'];
    const heal = fx.find((f) => f.t === 'heal');
    const foesOf = () => { const fs = fx.filter((f) => f.foe != null && (f.t === 'soften' || f.t === 'draw' || f.t === 'stun' || f.t === 'water' || f.t === 'light' || f.t === 'bind')).map((f) => f.foe); return fs.length ? [...new Set(fs)] : (cact && cact.foes) || [T]; };
    // what carries it (visual only; the results arrive at their own beats below)
    switch (s.travel) {
      case 'spot': if (!none) Q.push({ at: rel, type: 'fx', name: 'pSpot', d: s.contact - rel + 520, p: { from: 'comp', foe: cact && cact.foe != null ? cact.foe : T } }); break;
      case 'voice': for (const i of foesOf()) Q.push({ at: rel, type: 'fx', name: 'ringsVoice', d: s.contact - rel + 360, p: { from: 'comp', to: H.foeId(ctx, i), foe: i, col: who === 'suzu' ? '#f0b8c8' : null } }); break;
      case 'thread': if (!none) { const u = fx.find((f) => f.t === 'unravel'); const i = H.fid(ctx, u ? u.foe : T); Q.push({ at: rel - 40, type: 'fx', name: 'pThread', d: s.contact - rel + 300, p: { from: 'comp', to: H.knotId(ctx, i, Math.max(0, H.fview(ctx, i).knots - 1)), foe: i, pull: 1 } }); } break;
      case 'headoff': for (const i of foesOf()) Q.push({ at: rel + 20, type: 'fx', name: 'pHeadOff', d: s.contact - rel + 420, p: { foe: i, from: 'comp' } }); break;
      case 'share': Q.push({ at: rel, type: 'fx', name: 'pShare', d: s.contact - rel + 520, p: {} }); break;
      case 'pour': {
        const ws = heal ? heal.who || [] : [];
        Q.push({ at: rel, type: 'fx', name: 'pPour', d: s.contact - rel + 200, p: { from: 'comp', who: ws, none: !ws.length } });
        break;
      }
      case 'vapour': for (const i of foesOf()) Q.push({ at: rel, type: 'fx', name: 'pVapour', d: s.contact - rel + 560, p: { from: 'comp', to: H.foeId(ctx, i), foe: i, clears: fx.some((f) => (f.t === 'water' || f.t === 'light' || f.t === 'bind') && f.foe === i) } }); break;
      case 'salts': Q.push({ at: rel, type: 'fx', name: 'pSalts', d: 760, p: { from: 'comp', who: both } }); break;
      case 'lamp': {
        const wards = fx.filter((f) => f.t === 'ward').map((f) => f.target);
        const fs = fx.filter((f) => f.foe != null && (f.t === 'light' || f.t === 'bind' || f.t === 'stun')).map((f) => f.foe);
        const foes = s.to === 'foes' ? [...new Set(fs.length ? fs : (cact && cact.foes) || [T])] : s.to === 'foe' ? [cact && cact.foe != null ? cact.foe : T] : [];
        Q.push({ at: rel, type: 'fx', name: 'pLamp', d: s.contact - rel + 480, p: { from: 'comp', who: wards, foes, flare: s.to === 'foe' || s.to === 'foes' } });
        break;
      }
      case 'attention': for (const i of (fx.filter((f) => f.t === 'draw').map((f) => f.foe).length ? fx.filter((f) => f.t === 'draw').map((f) => f.foe) : [T])) Q.push({ at: rel, type: 'fx', name: 'pAttention', d: s.contact - rel + 760, p: { to: 'comp', foes: [i] } }); break;
      case 'clap': Q.push({ at: rel - 40, type: 'fx', name: 'pClap', d: 520, p: { from: 'comp' } }); break;
      default: break;
    }
    if (none && s.travel !== 'voice' && s.travel !== 'attention') Q.push({ at: rel + 60, type: 'fx', name: 'pNone', d: 520, p: { from: 'comp' } });
    // the results on their actual targets, in the rules' order
    let at = s.contact;
    for (const f of fx) {
      if (f.t === 'harmony') Q.push({ at: at - 120, type: 'fx', name: 'link', d: 520, p: {} });
      react(Q, f, at, ctx, 'companion', H);
      const cue = { at, type: 'beat', f };
      if (f.t === 'heal') cue.then = H.healThen;
      Q.push(cue);
      at += f.t === 'cact' ? 160 : 150;
    }
    void both;
    return { cues: Q, end: Math.max(s.end, at + 200, H.stillNums(Q, rd)), mapped, gesture: g, support: act.id };
  }

  // ---- reactions: the party side of each result (placed at its beat) -------------------------------------
  // Returns true when the result is the party's to stage (src/ui/82_battle_seq.js stages the rest).
  function react(Q, f, at, ctx, side, H, plan) {
    const comp = ctx.comp, both = comp ? ['pc', 'comp'] : ['pc'];
    const num = (to, text, kind, dt) => Q.push({ at: at + (dt || 0), type: 'num', to, text, kind });
    const i = H.fid(ctx, f.foe);
    const foeCue = (act, d, extra) => Q.push(Object.assign({ at, type: 'foe', act, d, foe: i }, extra || {}));
    const pose = (who, p, v, d, dt) => Q.push({ at: at + (dt || 0), type: 'pose', who, pose: p, gesture: v || null, d });
    switch (f.t) {
      case 'unravel': {
        const n = f.n || 1;
        ctx.kb = ctx.kb || {};
        const top = ctx.kb[i] != null ? ctx.kb[i] : H.fview(ctx, i).knots;
        for (let j = 0; j < n && top - 1 - j >= 0; j++) Q.push({ at: at + j * 90, type: 'fx', name: 'knotRelease', d: 560, p: { i: top - 1 - j, foe: i } });
        Q.push({ at, type: 'fx', name: 'loosen', d: 600, p: { foe: i } });
        foeCue('release', 420);
        ctx.kb[i] = Math.max(0, top - n);
        return true;
      }
      case 'ward':
        // the seal forms round the protected one now (a seal raised to catch a blow waits for it)
        if (!f.block) Q.push({ at: at - 60, type: 'fx', name: 'sealForm', d: 520, p: { to: f.target } });
        return true;
      case 'heal': {
        const ws = f.who || [];
        if (ws.length) Q.push({ at: at - 120, type: 'fx', name: 'motes', d: 820, p: { who: ws } });
        for (const w of ws) pose(w, 'soothed', null, 700, -40);
        return true;
      }
      case 'water':
        foeCue('recoil', 300, { dir: 'party' });
        if (f.by) Q.push({ at: at - 80, type: 'fx', name: 'pSteam', d: 700, p: { foe: i } });
        return true;
      case 'light':
        // the creature's real Shroud disperses: the same mist that marked it, pushed off and thinning
        Q.push({ at, type: 'fx', name: 'mistPart', d: 620, p: { foe: i } });
        Q.push({ at: at - 40, type: 'fx', name: 'pShroudClear', d: 820, p: { foe: i, by: f.by || 'light' } });
        return true;
      case 'bind':
        Q.push({ at, type: 'fx', name: 'scatter', d: 520, p: { foe: i } });
        foeCue('recoil', 300, { dir: 'party' });
        return true;
      case 'warm': Q.push({ at, type: 'fx', name: 'warm', d: 600, p: { who: both } }); return true;
      case 'bell': if (f.by) Q.push({ at: at - 40, type: 'fx', name: 'rings', d: 700, p: {} }); return true;
      case 'settle': foeCue('release', 500); return true;
      case 'reveal': foeCue('recoil', 360, { dir: 'party' }); Q.push({ at, type: 'fx', name: 'pSplit', d: 640, p: { foe: i } }); return true;
      case 'tech': {
        const w = f.who || comp;
        if (w === 'mio') { Q.push({ at, type: 'fx', name: 'motes', d: 820, p: { who: both } }); for (const x of both) pose(x, 'soothed', null, 700, 40); for (const k of f.all && ctx.reach ? ctx.reach.foes : [i]) Q.push({ at: at + 60, type: 'fx', name: 'pSteam', d: 700, p: { foe: k, wash: 1 } }); }
        if (w === 'ren') for (const x of both) Q.push({ at: at + (x === 'comp' ? 80 : 0), type: 'fx', name: 'sealForm', d: 520, p: { to: x } });
        if (w === 'suzu') for (const k of f.all && ctx.reach ? ctx.reach.foes : [i]) Q.push({ at: at + (k === i ? 0 : 90), type: 'fx', name: 'fizzle', d: 520, p: { foe: k } });
        if (w === 'nao') Q.push({ at, type: 'fx', name: 'pSpot', d: 400, p: { from: 'comp', foe: i, done: 1 } });
        return true;
      }
      case 'comp': {
        const w = f.who;
        // Suzu turns aside a blow that would leave one of you at 2 or less: it meets empty air
        if (w === 'suzu' && side === 'enemy') { Q.push({ at, type: 'fx', name: 'miss', d: 560, p: { to: f.missAt || ctx.missAt || 'pc' } }); if (comp === 'suzu') pose('comp', 'act', 'flourish', 460, -160); return true; }
        // Nao takes half of a blow meant for you: he steps to your shoulder and braces
        if (f.share != null && comp) { pose('comp', 'guard', null, 520, -120); Q.push({ at: at - 120, type: 'fx', name: 'pShare', d: 520, p: {} }); return true; }
        if (comp && w === comp) pose('comp', 'act', PASSIVE[w] || 'raise', 420, -120);
        if (w === 'nao' && side === 'player') Q.push({ at: at - 60, type: 'fx', name: 'pSpot', d: 520, p: { from: 'comp', foe: i } });
        if (w === 'ren' && side === 'player') Q.push({ at, type: 'fx', name: 'flash', d: 520, p: { from: 'comp', foe: i } });
        if (w === 'mio' && side === 'enemy') { Q.push({ at: at - 60, type: 'fx', name: 'motes', d: 760, p: { who: both } }); }
        return true;
      }
      case 'soften': foeCue('recoil', 260, { dir: 'party' }); return true;
      case 'stun': foeCue('balk', 380); return true;
      case 'draw': return true; // (its eye drawn: the line from it to her is the companion's own cue)
      case 'cost':
        Q.push({ at: at - 150, type: 'fx', name: 'drop', d: 420, p: { to: 'pc' } });
        pose('pc', 'afflict', 'slip', 320, -180);
        num('pc', '-1', 'cost');
        return true;
      case 'block':
        Q.push({ at, type: 'fx', name: 'sealBlock', d: 440, p: { to: f.who, n: f.n } });
        pose(f.who, 'brace', null, 320);
        num(f.who, String(f.n), 'block', 40);
        return true;
      case 'hit': {
        // a full blow recoils; one a ward softened flinches less; Mio's salts: the knees go, then catch
        const partial = ctx.blocked && ctx.blocked[f.who];
        Q.push({ at, type: 'fx', name: 'impact', d: partial ? 300 : 380, p: { to: f.who, small: !!partial, col: ctx.kind === 'chill' ? '#e4f2ff' : null } });
        if (ctx.kind === 'chill') Q.push({ at, type: 'fx', name: 'frost', d: 520, p: { to: f.who } });
        pose(f.who, 'hit', f.held ? 'held' : partial ? 'soft' : null, partial ? 300 : H.T.react);
        if (ctx.kind === 'chill' && !f.held) pose(f.who, 'afflict', 'chill', 520, partial ? 300 : H.T.react);
        num(f.who, '-' + f.n, 'hit');
        return true;
      }
      case 'stripWard':
        Q.push({ at, type: 'fx', name: 'sealStrip', d: 560, p: { who: both.filter((w) => (ctx.view.ward[w] || 0) > 0) } });
        for (const w of both) pose(w, 'afflict', 'gust', 560, w === 'comp' ? 60 : 0);
        return true;
      case 'silence':
        // the Hush reaches them: a short, condition-specific reaction (the mark over the party stays)
        for (const w of both) if (!(ctx.view && ctx.view[w] <= 0)) pose(w, 'afflict', 'hush', 640, w === 'comp' ? 80 : 0);
        return true;
      case 'cact': return true; // (the companion's own cues stage it)
      default: return false;
    }
  }

  // ---- settle / victory, and the existing revive --------------------------------------------------------
  function finish(seqEnd, ctx) {
    const Q = [], at = Math.max(0, seqEnd - 360);
    const last = ctx.last && ctx.last.length ? ctx.last : [0];
    last.forEach((i, k) => {
      Q.push({ at: at + k * 120, type: 'foe', act: 'settle', d: 760, hold: true, foe: i });
      Q.push({ at: at + 60 + k * 120, type: 'fx', name: 'release', d: 1000, p: { foe: i } });
    });
    // each of you eases in your own way and time (the one still on their feet; never a downed one)
    const v = ctx.view || {};
    if (!(v.pc <= 0)) Q.push({ at: at + 300, type: 'pose', who: 'pc', pose: 'cheer', d: 560 });
    if (ctx.comp && !(v.comp <= 0)) Q.push({ at: at + 420, type: 'pose', who: 'comp', pose: 'cheer', d: 620 });
    Q.push({ at: at + 760, type: 'final' });
    return { cues: Q, end: at + 1000 };
  }
  function revive(ctx) {
    const Q = [], g = REVIVE[ctx.comp] || 'help';
    Q.push({ at: 0, type: 'pose', who: 'comp', pose: 'act', gesture: g, d: 560 });
    Q.push({ at: 100, type: 'fx', name: 'lift', d: 760, p: { to: 'pc' } });
    Q.push({ at: 280, type: 'pose', who: 'pc', pose: 'recover', gesture: 'rise', d: 500 });
    Q.push({ at: 320, type: 'beat', f: { t: 'revive' } });
    return { cues: Q, end: 860 };
  }

  // ---- coverage (tests and docs) -------------------------------------------------------------------------
  function coverage() {
    const C = RB.content || {};
    const words = Object.keys(C.words || {}).filter((id) => C.words[id] && C.words[id].tags && C.words[id].tags.length);
    const actions = [];
    for (const who of Object.keys(C.companionActions || {})) for (const a of C.companionActions[who]) actions.push({ who, id: a.id, kind: a.effect && a.effect.kind, mapped: !!SUPPORT[a.id], gesture: SUPPORT[a.id] && SUPPORT[a.id].g, gestureExists: !!(SUPPORT[a.id] && MV().hasGesture(SUPPORT[a.id].g, who)) });
    return {
      words: words.map((id) => ({ id, family: WORD_FAMILY[id] || null, mapped: !!WORD_FAMILY[id] })),
      kinds: ['unravel', 'answer', 'truth', 'tech'].map((k) => ({ id: k, mapped: true })),
      techs: ['nao', 'mio', 'ren', 'suzu'].map((id) => ({ id, mapped: !!TECH[id], partner: TECH[id] && TECH[id].p, lead: TECH[id] && TECH[id].g })),
      actions,
    };
  }

  return { FAM, TECH, SUPPORT, PASSIVE, REVIVE, WORD_FAMILY, familyOf, planOf, wordOf, player, companion, react, finish, revive, coverage };
})();
