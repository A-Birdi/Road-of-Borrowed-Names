// Cosmetic pets (the Living Company addendum §3–5; src/engine/37_pets_*.js, 57_petworld.js,
// src/ui/85_battle_pets.js, src/content/pets/): names are plain text and follow the naming rules;
// every response, technique and companion action maps to a response family (fails on any new,
// unmapped id); acquisition is once per campaign and separate from selection; conditions; an
// unknown species or look is kept and drawn as nothing / the first look; the meeting memory is kept
// once; vignette state machines accept the ordinary and the field route; the battle observer's
// reaction table covers every family for every species; and the rules give exactly the same results,
// target choices and answer-option order with a pet selected, hidden, or none.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const S = RB.state, PETS = RB.pets, C = RB.content;
  const fresh = (o) => { const s = S.newCampaign({}); s.map = 'rw.village'; Object.assign(s, o || {}); return s; };

  // ---- names (§3.2) ------------------------------------------------------------------------------------
  const N = PETS.cleanName;
  t.eq(N('  Koma  ').value, 'Koma', 'trims surrounding whitespace');
  t.eq(N('こま\nち').value, 'こま ち', 'collapses a line break to one space');
  t.eq(N('a\r\n\r\nb').value, 'a b', 'several line breaks are one space');
  t.eq([N('').ok, N('   ').ok, N('\n\t').ok, N('\u0000\u0007\u001f').ok], [false, false, false, false], 'empty, blank and control-only names are refused');
  t.eq(N('a\u0007b').value, 'ab', 'control characters are dropped');
  t.eq(N('\u202eKoma').value, 'Koma', 'a direction override is dropped');
  t.eq(N('ポンタ・二世').value, 'ポンタ・二世', 'Japanese kept as written (no romanization)');
  t.eq(N('ｺﾏ').value, 'ｺﾏ', 'half-width kana kept');
  const long24 = 'あ'.repeat(24), long25 = 'あ'.repeat(25);
  t.eq([N(long24).ok, N(long24).count, N(long25).ok], [true, 24, false], 'up to 24 characters; 25 is refused');
  t.eq([N('👨‍👩‍👧'.repeat(24)).ok, N('👨‍👩‍👧'.repeat(24)).count], [true, 24], 'a family emoji counts as one character (grapheme clusters)');
  t.eq([N('é'.repeat(24)).ok, N('が'.repeat(24)).count], [true, 24], 'combining marks do not count on their own');
  const markup = '<img src=x onerror=alert(1)>{猫|ねこ}$name !set x';
  t.eq(N(markup).value, markup, 'markup, furigana markup, variables and commands are kept as plain text (escaped where shown)');
  t.eq(PETS.cleanName('', { optional: true }).ok, true, 'an empty reading is fine (optional)');

  // ---- records: acquisition once, selection separate, rename, reset, look ---------------------------------
  const s = fresh({ comp: 'mio' });
  t.eq([PETS.met(s), PETS.active(s), S.test(s, 'pet'), S.test(s, 'pet.cat'), S.test(s, 'pet=cat')], [[], null, false, false, false], 'no pet at first');
  let met = 0; const off = RB.bus.on('pet:met', () => met++);
  t.eq([PETS.meet(s, 'cat'), PETS.meet(s, 'cat')], [true, false], 'a pet is met once per campaign');
  t.eq([met, !!s.awarded['pet:met:cat']], [1, true], 'pet:met is emitted once; the acquisition is an awarded once-event');
  off();
  t.eq([PETS.active(s), S.test(s, 'pet.cat'), S.test(s, 'pet')], [null, true, false], 'meeting does not select it (a separate event)');
  t.eq(s.company.pets.cat.name, 'Koma', 'the default name is Koma');
  t.ok(PETS.select(s, 'cat') && PETS.active(s) === 'cat' && S.test(s, 'pet=cat') && S.test(s, 'pet') && !S.test(s, 'pet=dog'), 'selection and the conditions');
  t.eq(PETS.select(s, 'dog'), false, 'an animal not met cannot be selected');
  PETS.meet(s, 'dog');
  t.eq(PETS.active(s), 'cat', 'meeting another animal never replaces the one travelling with you');
  t.ok(PETS.select(s, null) && PETS.active(s) === null && s.company.pets.cat.name === 'Koma', 'No pet keeps names and records');
  const r1 = PETS.rename(s, 'cat', '  こまち ', 'こまち');
  t.eq([r1.ok, s.company.pets.cat.name, s.company.pets.cat.reading], [true, 'こまち', 'こまち'], 'rename (trimmed) with a reading');
  t.eq([PETS.rename(s, 'cat', '').ok, s.company.pets.cat.name], [false, 'こまち'], 'an empty rename is refused and changes nothing');
  t.eq([PETS.rename(s, 'cat', 'x', 'あ'.repeat(30)).ok, s.company.pets.cat.name], [false, 'こまち'], 'an over-long reading is refused');
  PETS.resetName(s, 'cat');
  t.eq([s.company.pets.cat.name, s.company.pets.cat.reading], ['Koma', 'コマ'], 'Reset to default');
  t.eq([PETS.setLook(s, 'cat', 'calico'), s.company.pets.cat.look, PETS.setLook(s, 'cat', 'rainbow'), s.company.pets.cat.look], [true, 'calico', false, 'calico'], 'three looks; an unknown look is refused');
  for (const sp of PETS.ORDER) t.eq(RB.petArt.LOOK_ORDER[sp].length, 3, sp + ': three looks');
  t.eq(RB.petArt.LOOK_ORDER.tanuki, ['warm', 'graybrown', 'dark'], 'tanuki looks: warm brown, gray-brown, dark brown');
  t.eq(PETS.ORDER.map((sp) => PETS.species(sp).name), ['Koma', 'Mugi', 'Sora', 'Ponta'], 'default names');

  // ---- unknown ids from a later content change: kept, drawn as nothing / the first look -----------------
  const u = fresh();
  u.company.pets.griffin = { name: 'G', look: 'x', met: { t: 1, map: 'rw.village' } };
  u.company.pet = 'griffin';
  const u2 = RB.save.migrate(JSON.parse(JSON.stringify(u)));
  t.ok(u2.company.pets.griffin && u2.company.pet === 'griffin', 'an unknown species is kept in the save');
  t.eq([PETS.active(u2), PETS.met(u2), PETS.visible(u2, 'world')], [null, [], false], '…and shown as no pet');
  const u3 = fresh(); PETS.meet(u3, 'dog'); u3.company.pets.dog.look = 'purple'; u3.company.pet = 'dog';
  t.eq([PETS.lookOf(u3, 'dog'), u3.company.pets.dog.look], ['cream', 'purple'], 'an unknown look is drawn as the first look and kept');

  // ---- pets are never party members, equipment or flags ------------------------------------------------------
  const p = fresh({ comp: 'nao' }); PETS.meet(p, 'tanuki'); PETS.select(p, 'tanuki');
  t.eq([p.comp, p.provisional, JSON.stringify(p.equip).includes('tanuki'), Object.keys(p.flags).some((k) => /tanuki|pet/.test(k))], ['nao', null, false, false], 'a pet is not a party member, not equipment, not a flag');

  // ---- response families: every id mapped explicitly --------------------------------------------------------
  const F = RB.families;
  const words = Object.keys(C.words);
  const unmapped = [];
  for (const w of words) if (!F.ofResponse('w:' + w)) unmapped.push('w:' + w);
  for (const k of ['unravel', 'answer', 'truth']) if (!F.ofResponse(k)) unmapped.push(k);
  for (const c of Object.keys(RB.combatLogic.TECHS)) if (!F.ofResponse('tech:' + c)) unmapped.push('tech:' + c);
  for (const c in C.companionActions) for (const a of C.companionActions[c]) if (!F.ofAction(a.id)) unmapped.push(a.id);
  if (!F.ofAction('join')) unmapped.push('join');
  for (const who of ['nao', 'mio', 'ren', 'suzu']) if (!F.ofPassive(who)) unmapped.push('passive:' + who);
  t.eq(unmapped, [], 'every response, technique and companion action id maps to a family (add new ids to src/engine/37_pets_0family.js)');
  const all = Object.values(F.RESPONSE).concat(Object.values(F.ACTION), Object.values(F.PASSIVE), Object.values(F.TECH_BASE));
  t.ok(all.every((f) => F.LIST.indexOf(f) >= 0), 'every mapped family is a known family');
  // the cards the rules actually deal map through ofCard
  const st0 = RB.combatLogic.init(Object.assign({ id: 'rw.dustmoth' }, C.enemies['rw.dustmoth']), fresh({ comp: 'ren', words }), {});
  st0.harmony = st0.harmonyMax;
  const cards = RB.combatLogic.responses(st0, words.map((w) => C.words[w]));
  t.ok(cards.length > 10 && cards.every((c) => F.ofCard(c)), 'every card dealt maps (' + cards.map((c) => c.id + '→' + F.ofCard(c)).join(', ') + ')');
  t.eq([F.ofResponse('w:koori'), F.ofResponse('w:tsuchi'), F.ofResponse('w:koe'), F.base('technique', 'mio')], ['ice', 'stone', 'bell', 'heal'], 'ice is ice, earth is stone, voice is sound; Mio\'s technique culminates as healing');
  // every family is used by some real action (no row of the matrix is dead)
  const used = new Set(all);
  t.eq(F.LIST.filter((f) => !used.has(f)), [], 'every family is produced by some real response, technique or action');

  // ---- the battle observer covers the whole matrix -------------------------------------------------------------
  const BP = RB.battlePets;
  const miss = [];
  for (const sp of PETS.ORDER) {
    for (const f of F.LIST) if (!BP.REACT[sp][f]) miss.push(sp + ':' + f);
    for (const k of ['hit', 'soft', 'status']) if (!BP.IMPACT[sp][k]) miss.push(sp + ':impact:' + k);
    if (!BP.VICTORY[sp]) miss.push(sp + ':victory');
    if (!BP.CALM[sp] || BP.CALM[sp].length < 3) miss.push(sp + ':calm idles < 3');
    if (!BP.READY[sp]) miss.push(sp + ':ready');
  }
  t.eq(miss, [], 'every species has a reaction for every family, the impacts, victory, ready and at least three calm idles');
  // reduced motion: a held key pose, the same at every moment; full motion changes over time
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  let still = true, alive = true;
  for (const sp of PETS.ORDER) for (const f of F.LIST) {
    if (!same(BP.sample(sp, f, 100, { reduce: true }), BP.sample(sp, f, 600, { reduce: true }))) still = false;
    const seq = [0, 150, 300, 450, 600, 750, 900].map((ms) => JSON.stringify(BP.sample(sp, f, ms)));
    if (new Set(seq).size < 3) alive = false;
  }
  t.ok(still, 'reduced motion: every reaction is one held pose');
  t.ok(alive, 'full motion: every reaction moves');
  // families differ from one another (not one generic bob): distinct key poses per species
  for (const sp of PETS.ORDER) {
    const keys = F.LIST.map((f) => JSON.stringify(BP.sample(sp, f, 0, { reduce: true })));
    t.ok(new Set(keys).size >= F.LIST.length - 1, sp + ': the families have distinct key poses (' + new Set(keys).size + ' of ' + F.LIST.length + ')');
  }
  // the four species react differently to the same family
  for (const f of F.LIST) {
    const k = PETS.ORDER.map((sp) => JSON.stringify(BP.sample(sp, f, 0, { reduce: true })));
    t.ok(new Set(k).size >= 3, f + ': the species react in their own ways');
  }

  // ---- the same game with and without a pet ------------------------------------------------------------------------
  // A scripted encounter through the rules, the observer hearing every presentation event (as the screen
  // would emit them): the same fx, the same enemy choices, the same end state, whether a pet travels, is
  // hidden, or there is none.
  function play(petSetup) {
    const g = fresh({ comp: 'suzu', words: ['mamoru', 'mizu', 'hikari', 'kaze'] });
    petSetup(g);
    RB.game = RB.game || {};
    const prevS = RB.game.s; RB.game.s = g;
    const L = RB.combatLogic;
    const enemy = Object.assign({ id: 'co.kilnwisp' }, C.enemies['co.kilnwisp'] || C.enemies['rw.dustmoth']);
    const st = L.init(enemy, g, { group: [] });
    const log = [];
    RB.bus.emit('present:scene', { scope: 'battle', phase: 'enter', comp: st.compId, t0: 0 });
    for (let r = 0; r < 12 && !st.over; r++) {
      RB.bus.emit('present:scene', { scope: 'battle', phase: 'calm', exchange: r });
      const ws = g.words.map((w) => C.words[w]);
      const cards = L.responses(st, ws);
      const card = cards.find((c) => c.kind === 'tech') || cards[(r * 3) % cards.length];
      const P = L.playerAct(st, card, { ok: true, firstTry: r % 3 !== 1, mistakes: r % 3 === 1 ? 1 : 0 }, enemy);
      RB.bus.emit('present:action', { scope: 'battle', actor: 'pc', action: card.id, family: F.ofCard(card), targets: ['foe'], result: 'x', id: 'u' + r, exchange: r, t0: r * 1000, beat: 560, end: 1140 });
      const acts = L.compOptions(st, g, card).filter((o) => !o.locked);
      let C2 = null;
      if (acts.length) { C2 = L.compAct(st, acts[r % acts.length].def.id, P); RB.bus.emit('present:action', { scope: 'battle', actor: 'comp', action: acts[r % acts.length].def.id, family: F.ofAction(acts[r % acts.length].def.id), targets: [], id: 'c' + r, exchange: r, t0: r * 1000 + 1200, beat: 360 }); }
      if (L.allSettled(st)) { log.push({ r, fx: P.fx, c: C2 && C2.fx, win: true }); break; }
      const intents = st.foes.map((f) => f.intent && f.intent.kind + ':' + f.intent.target);
      const efx = L.enemyAct(st, P.answered);
      RB.bus.emit('present:enemy', { scope: 'battle', actor: 'foe:0', kind: intents[0], outcome: 'hit', targets: ['pc'], id: 'e' + r, t0: r * 1000 + 2000, at: 560 });
      L.endRound(st, enemy);
      log.push({ r, fx: P.fx, c: C2 && C2.fx, intents, efx, pc: st.pc, comp: st.comp, knots: st.foes.map((f) => f.knots) });
    }
    RB.bus.emit('present:scene', { scope: 'battle', phase: 'exit', t0: 0 });
    // an answer step's option order (the order the choice mode shows)
    const step = { kind: 'write', item: 'v:水', answer: 'みず', accept: ['みず', '水'], mode: 'reading', choices: ['みず', 'みす', 'むず', 'ひず'] };
    const order = RB.challenge && RB.challenge.choicesFor ? RB.challenge.choicesFor(step).map((o) => o.text || o.jp || JSON.stringify(o)) : null;
    RB.game.s = prevS;
    return JSON.stringify({ log, over: st.over, order });
  }
  const none = play(() => {});
  const withCat = play((g) => { PETS.meet(g, 'cat'); PETS.select(g, 'cat'); });
  const withBird = play((g) => { PETS.meet(g, 'bird'); PETS.select(g, 'bird'); PETS.setLook(g, 'bird', 'gray'); });
  const hidden = play((g) => { PETS.meet(g, 'dog'); PETS.select(g, 'dog'); });
  t.ok(none.length > 200, 'the scripted encounter ran (' + none.length + ' chars of results)');
  t.ok(none === withCat && none === withBird && none === hidden, 'identical rules results, enemy choices and answer-option order with no pet, a cat, a gray bird, or a (hidden) dog');

  // ---- the cat vignette: ordinary route, field route, memory once, reachable later -------------------------------
  const v = PETS.vignettes.cat;
  t.ok(v && v.species === 'cat' && v.families.indexOf('bind') >= 0 && v.families.indexOf('stone') >= 0, 'the cat vignette accepts rope (bind) and stone');
  const c1 = fresh({ comp: 'ren', flags: { rw_echo_done: true } });
  RB.game.s = c1;
  t.eq([PETS.vignetteAction('cat', 'fire'), c1.vars.pet_cat || 0], [false, 0], 'a family that does not fit changes nothing');
  t.eq([PETS.vignetteAction('cat', 'bind'), c1.vars.pet_cat, c1.flags.pet_cat_by_cord], [true, 2, true], 'a rope word steadies the screen (same state as tying it)');
  t.eq(PETS.vignetteAction('cat', 'stone'), false, 'once steady, nothing more to do');
  const mapv = C.maps['rw.village'];
  const visibleProps = (st) => mapv.props.filter((q) => /^pet_/.test(q.p) && (!q.if || S.test(st, q.if))).map((q) => q.p);
  t.eq(visibleProps(fresh({ flags: {} })), [], 'nothing of the vignette before the Chapter 1 resolution');
  t.eq(visibleProps(fresh({ flags: { rw_echo_done: true } })).sort(), ['pet_screen', 'pet_spot'], 'after it: the loose screen and the cat');
  t.eq(visibleProps(c1).sort(), ['pet_screen_fixed', 'pet_spot'], 'once steady: the steadied screen (the lasting change) and the cat');
  const late = fresh({ chapter: 6, flags: { rw_echo_done: true, ch5_done: true, postgame: true } });
  t.eq(visibleProps(late).sort(), ['pet_screen', 'pet_spot'], 'still there in the postgame (no missable window)');
  // ---- the bird, the dog and the tanuki: the same shape ------------------------------------------------------------
  const OTHER = {
    bird: { map: 'sg.harbor', on: { quests: { sg_main: { stage: 1 } } }, fit: ['unravel', 'wind'], misfit: 'fire', before: [], open: ['pet_post', 'pet_spot'], fixed: ['pet_post_fixed', 'pet_spot'], flag: { unravel: 'pet_bird_untied', wind: 'pet_bird_blown' } },
    dog: { map: 'co.village', on: { flags: { co_met_sayo: true } }, fit: ['bind', 'stone'], misfit: 'water', before: [], open: ['pet_gate', 'pet_spot'], fixed: ['pet_gate_fixed', 'pet_spot'], flag: { bind: 'pet_dog_by_rope', stone: 'pet_dog_by_peg' } },
    tanuki: { map: 'co.road', on: { flags: { co_arrived: true } }, fit: ['wind', 'stone'], misfit: 'fire', before: [], open: ['pet_hollow', 'pet_look', 'pet_papers'], fixed: ['pet_hollow', 'pet_look', 'pet_papers_tidy'], flag: { wind: 'pet_tanuki_by_lee', stone: 'pet_tanuki_by_stone' } },
  };
  for (const sp in OTHER) {
    const O = OTHER[sp], V = PETS.vignettes[sp], mp = C.maps[O.map];
    const mk = (extra) => { const st = fresh(Object.assign({ comp: 'mio', chapter: 3 }, extra || {})); if (O.on.flags) Object.assign(st.flags, O.on.flags); if (O.on.quests) Object.assign(st.quests, JSON.parse(JSON.stringify(O.on.quests))); return st; };
    t.ok(V && V.species === sp && V.map === O.map && O.fit.every((f) => V.families.indexOf(f) >= 0), sp + ': the vignette is registered on ' + O.map + ' and accepts ' + O.fit.join(' and '));
    const vis = (st) => mp.props.filter((q) => /^pet_/.test(q.p) && (!q.if || S.test(st, q.if))).map((q) => q.p).sort();
    t.eq(vis(fresh({ comp: 'mio' })), O.before, sp + ': nothing of it before it opens');
    t.eq(vis(mk()), O.open.slice().sort(), sp + ': once open, the cause and the animal are there');
    t.eq(vis(mk({ chapter: 6, flags: { postgame: true, ch5_done: true } })), O.open.slice().sort(), sp + ': still there in the postgame (no missable window)');
    for (const f of O.fit) {
      const st = mk();
      RB.game.s = st;
      t.eq(PETS.vignetteAction(sp, O.misfit), false, sp + ': a family that does not fit (' + O.misfit + ') changes nothing');
      t.eq([PETS.vignetteAction(sp, f), st.vars['pet_' + sp], !!st.flags[O.flag[f]]], [true, 2, true], sp + ': the field route with ' + f + ' ends in the same state as the ordinary one');
      t.eq(PETS.vignetteAction(sp, O.fit[0]), false, sp + ': once settled, nothing more to do');
      t.eq(vis(st), O.fixed.slice().sort(), sp + ': the lasting change shows');
      PETS.meet(st, sp);
      t.ok(!vis(st).includes('pet_spot'), sp + ': once met, the animal is no longer waiting there');
      t.eq(PETS.vignetteAction(sp, f), false, sp + ': nothing happens after it has joined');
    }
    const sc = RB.content.scenes;
    if (sc) t.ok(['notice', sp].every((k) => sc['pets.' + sp + '.' + k]), sp + ': the notice and the meeting scenes exist');
  }
  const scenesSrc = RB.content.scenes;
  const dogMeet = scenesSrc['pets.dog.dog'];
  if (dogMeet) {
    const cmds = dogMeet.cmds;
    const perm = cmds.findIndex((c) => c.who === 'co_tamotsu');
    const inv = cmds.findIndex((c, i) => i > perm && c.op === 'choice' && c.opts.some((o) => /Invite/.test(o.en)));
    t.ok(perm >= 0 && inv > perm, 'the dog: the channel keeper gives explicit permission before the invitation');
  }
  // ---- the Weave sheet's route: targets near the cause, a result line, neutral for a family that does not fit ----
  const FIELDQ = { cat: ['rw.village', { flags: { rw_echo_done: true } }], bird: ['sg.harbor', { quests: { sg_main: { stage: 1 } } }], dog: ['co.village', { flags: { co_met_sayo: true } }], tanuki: ['co.road', { flags: { co_arrived: true } }] };
  const seenEv = [];
  const offEv = RB.bus.on('present:action', (e) => { if (e.scope === 'field') seenEv.push(e); });
  for (const sp in FIELDQ) {
    const V = PETS.vignettes[sp], [mapId, on] = FIELDQ[sp];
    const st = fresh({ comp: 'mio', chapter: 3 });
    if (on.flags) Object.assign(st.flags, on.flags);
    if (on.quests) Object.assign(st.quests, JSON.parse(JSON.stringify(on.quests)));
    const c = V.cause;
    t.eq(PETS.fieldTargets(fresh({ comp: 'mio' }), mapId, c.x, c.y + 1).length, 0, sp + ': no Weave target before the vignette opens');
    const tg = PETS.fieldTargets(st, mapId, c.x, c.y + 1);
    t.ok(tg.length === 1 && tg[0].id === sp && tg[0].families.join() === V.families.join() && tg[0].label.en, sp + ': the cause is a Weave target within two tiles: ' + JSON.stringify(tg));
    t.eq(PETS.fieldTargets(st, mapId, c.x + 3, c.y).length, 0, sp + ': not from three tiles away');
    RB.game.s = st;
    const miss = PETS.fieldWeave(st, sp, 'fire' === V.families[0] ? 'water' : 'fire');
    t.ok(miss && !miss.effective && miss.say.length === 1 && (st.vars['pet_' + sp] || 0) < 2, sp + ': a family that does not fit is neutral, with a physical reason');
    const hit = PETS.fieldWeave(st, sp, V.families[1]);
    t.ok(hit && hit.effective && hit.say.length === 1 && st.vars['pet_' + sp] === 2, sp + ': ' + V.families[1] + ' settles it, with its own line');
    t.eq(PETS.fieldTargets(st, mapId, c.x, c.y + 1).length, 0, sp + ': once settled it is no longer a target');
  }
  if (typeof offEv === 'function') offEv();
  t.ok(seenEv.length === 8 && seenEv.every((e) => e.targets[0].startsWith('pet:') && e.at && e.at.map), 'each weave at a cause is announced as a field action (for the pet and anything else watching): ' + seenEv.length);

  // ---- greeting together: sixteen distinct moments, no reward, no player-authored text ------------------------
  const GS = {};
  for (const c of ['nao', 'mio', 'ren', 'suzu']) for (const sp of PETS.ORDER) GS[c + '.' + sp] = RB.content.scenes['pets.greet.' + c + '.' + sp];
  t.ok(Object.values(GS).every(Boolean), 'all sixteen greetings exist');
  const sig = (sc) => sc.cmds.filter((c) => c.op === 'hook').map((c) => c.args.join(' ')).join('>');
  const txt = (sc) => sc.cmds.filter((c) => c.op === 'say').map((c) => c.jp).join('|');
  const sigs = Object.values(GS).map(sig), txts = Object.values(GS).map(txt);
  t.eq(new Set(txts).size, 16, 'the sixteen greetings say different things');
  t.ok(Object.values(GS).every((sc) => sc.cmds[0].op === 'hook' && sc.cmds[0].args[0] === 'pet_come'), 'each begins with the animal coming over to your companion');
  for (const sp of PETS.ORDER) {
    const per = ['nao', 'mio', 'ren', 'suzu'].map((c) => sig(GS[c + '.' + sp]));
    t.eq(new Set(per).size, 4, sp + ': each companion greets it with a different movement sequence (' + per.join(' / ') + ')');
  }
  t.ok(sigs.every((g) => g.split('>').filter((h) => /^pet_do /.test(h)).every((h) => RB.pets.WORLD_ANIM[h.split(' ')[1]])), 'every movement used exists');
  const bad = Object.entries(GS).filter(([, sc]) => sc.cmds.some((c) => /^(give|take|item|word|learn|award|var|set|quest|harmony|gold)$/.test(c.op) || (c.op === 'hook' && !/^pet_/.test(c.args[0]))));
  t.eq(bad.map(([k]) => k), [], 'no greeting gives, takes, sets or learns anything');
  const gjp = [];
  for (const [k, sc] of Object.entries(GS)) for (const c of sc.cmds) if (c.op === 'say') for (const pr of RB.jp.validate(c.jp)) gjp.push(k + ': ' + (pr.msg || JSON.stringify(pr)));
  t.eq(gjp, [], 'greeting Japanese carries furigana on every kanji');
  // the rest-point choice: only when a greeting can play, labelled by the kind of animal (never the name)
  const g1 = fresh({ comp: 'mio' });
  t.eq(PETS.restOption(g1), null, 'no pet: no rest choice');
  PETS.meet(g1, 'dog'); PETS.select(g1, 'dog'); PETS.rename(g1, 'dog', '<b>{犬|いぬ}</b>');
  const prevG = RB.game.s; RB.game.s = g1;
  const why = PETS.canGreet(g1, { rest: true });
  t.ok(why === true || typeof why === 'string', 'the rest route asks the same questions (in this headless run: ' + why + ')');
  const ro = why === true ? PETS.restOption(g1) : null;
  if (ro) t.ok(ro.label.en === 'Greet the dog together' && !/<b>|犬\|いぬ\}<\/b>/.test(ro.label.en + ro.label.jp), 'the label names the kind of animal, never the chosen name');
  RB.game.s = prevG;

  // the meeting memory: once, with the companion's reply and the name at the time
  const m = RB.pets.meeting.cat;
  t.ok(['cat', 'bird', 'dog', 'tanuki'].every((sp) => { const M = RB.pets.meeting[sp]; return M && M.title && M.text && ['nao', 'mio', 'ren', 'suzu'].every((k) => M.reply[k] && M.reply[k].jp && M.reply[k].en); }), 'every meeting memory has a reply from each companion');
  const jpProblems = [];
  for (const sp in RB.pets.meeting) {
    const M = RB.pets.meeting[sp];
    for (const o of [M.title, M.text].concat(Object.values(M.reply))) for (const pr of RB.jp.validate(o.jp)) jpProblems.push(sp + ': ' + (pr.msg || JSON.stringify(pr)));
  }
  for (const id in PETS.vignettes) { const V = PETS.vignettes[id]; for (const o of [V.title, V.met, V.cause && V.cause.label].concat(Object.values(V.fieldSay || {}), Object.values(V.fieldNeutral || {}))) if (o && o.jp) for (const pr of RB.jp.validate(o.jp)) jpProblems.push(id + ': ' + (pr.msg || JSON.stringify(pr))); }
  t.eq(jpProblems, [], 'memory and vignette Japanese carries furigana on every kanji');
};
