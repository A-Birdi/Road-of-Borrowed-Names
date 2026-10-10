// Encounter content rules (expansion P04; src/engine/97_encounter.js), run by tools/validate.mjs. Every encounter
// definition is checked before a chapter can rely on it:
//  - its kind, creatures (existing ones, varied only by pattern, moves, conditions, knots) and their moves exist;
//  - the creatures' side: at most three hostile outside an authored set piece, at most five in one (C-76);
//  - every condition it tests is one the platform knows, every claim or actor it names exists;
//  - a Hush never silences a bell or a voice (they always end it);
//  - an objective encounter has at least two ways to win; a conversation at least two conclusions, something to
//    discover or a situation that changes, options for every companion, and choices with all four tiers;
//  - a procedure's every step has a right action, and every action that can send the machine back says what the
//    player will do before committing (the interpretation shown, E7);
//  - every Japanese string passes the text checks (furigana, lexicon), and every language step the step checks.
export function encounterRules(RB, C, { jcheck, checkStep, E }) {
  const L = RB.combatLogic;
  const KINDS = ['battle', 'social', 'procedure', 'study'];
  const WHEN = new Set(['all', 'any', 'not', 'settled', 'down', 'standing', 'left', 'rounds', 'flag', 'noFlag', 'arrived', 'prevented', 'comp', 'proc', 'machine', 'stance', 'claims', 'understanding', 'used', 'knots']);
  const STANCES = new Set(['listening', 'heated', 'closed', 'leaving']);
  const text = (o, where) => { if (o && typeof o === 'object' && o.jp != null) jcheck(o.jp, where); };
  const tiered = (o, where) => {
    if (!o) return;
    for (const k of ['F', 'E', 'I', 'A']) { if (!o[k]) E(where + ': a language step without the ' + k + ' tier (new content needs all four)'); else checkStep(o[k], where + '[' + k + ']'); }
  };
  for (const id in C.encounters || {}) {
    const d = C.encounters[id];
    const W = 'encounter ' + id;
    if (d.id !== id) E(W + ': id does not match its key');
    const kind = d.kind || 'battle';
    if (KINDS.indexOf(kind) < 0) E(W + ': unknown kind ' + kind);
    text(d.name, W + ' name');
    if (!d.name || !d.name.en) E(W + ': needs a name');
    // creatures
    const specs = [];
    const spec = (x, where) => {
      const eid = typeof x === 'string' ? x : x && x.enemy;
      if (!eid || !C.enemies[eid]) { E(where + ': unknown creature ' + eid); return; }
      specs.push(x);
      const en = typeof x === 'string' ? C.enemies[x] : Object.assign({}, C.enemies[eid], x);
      for (const k of en.pattern || []) {
        const kd = k.split(':')[0];
        if (!L.INTENTS[kd]) E(where + ': unknown move ' + k);
        const it = (en.intents || {})[k] || {};
        if (it.and && !L.INTENTS[it.and.split(':')[0]]) E(where + ': unknown second move ' + it.and);
        if (it.then && !(en.pattern || []).some((p) => p.split(':')[0] === it.then.split(':')[0])) E(where + ': a plan heads for ' + it.then + ', which is not in the pattern');
        if (kd === 'silence' && it.family && (it.family === 'bell' || it.family === 'voice')) E(where + ': a Hush may never silence a ' + it.family + ' (they always end it)');
        if (it.target && it.target.indexOf(':') > 0 && !(d.actors || []).some((a) => a.aid === it.target)) E(where + ': a move aimed at ' + it.target + ', who is not in the encounter');
      }
      for (const c of en.conditions || []) if (!RB.conditions.DEFS[c]) E(where + ': unknown condition ' + c);
    };
    if (d.lead) spec(d.lead, W + ' lead');
    const groups = Array.isArray(d.group) ? { normal: d.group } : d.group || {};
    for (const g of ['normal', 'hard']) (groups[g] || []).forEach((x, i) => spec(x, W + ' group.' + g + '[' + i + ']'));
    for (const a of (d.arrivals || []).concat(d.extras || [])) spec(a.enemy, W + ' arrival');
    if (d.calls && d.calls.enemy) spec(d.calls.enemy, W + ' calls');
    const most = 1 + Math.max((groups.normal || []).length, (groups.hard || []).length);
    if (d.lead && !d.setPiece && most > 3) E(W + ': ' + most + ' creatures at once outside a set piece (at most three)');
    if (d.setPiece && (d.capacity || 5) > 5) E(W + ': a set piece holds at most five on the creatures\' side');
    if (d.setPiece && most > (d.capacity || 5)) E(W + ': more creatures at the start than the set piece holds');
    if ((kind === 'battle' || kind === 'study') && !d.lead) E(W + ': a battle needs creatures');
    for (const f of d.field || []) if (!RB.conditions.FIELD[f]) E(W + ': unknown place condition ' + f);
    // actors
    const aids = new Set((d.actors || []).map((a) => a.aid));
    for (const a of d.actors || []) {
      if (!a.aid || !/^[gno]:[a-z_0-9]+$/.test(a.aid)) E(W + ': actor id ' + a.aid + ' (g: guest, n: neutral, o: object)');
      if (['guest', 'neutral', 'object'].indexOf(a.side) < 0) E(W + ' ' + a.aid + ': side must be guest, neutral or object');
      text(a.name, W + ' ' + a.aid + ' name');
      for (const k in a.lines || {}) text(a.lines[k], W + ' ' + a.aid + ' line ' + k);
      for (const c of [].concat(a.cond || [])) if (!RB.conditions.DEFS[c]) E(W + ' ' + a.aid + ': unknown condition ' + c);
    }
    if (d.social) for (const p of d.social.parties || []) aids.add(p.aid);
    // conditions to test
    const claims = (d.social && d.social.claims) || {};
    const walk = (w, where) => {
      if (w == null) return;
      if (Array.isArray(w)) { w.forEach((x) => walk(x, where)); return; }
      for (const k of Object.keys(w)) {
        if (!WHEN.has(k)) { E(where + ': unknown condition "' + k + '"'); continue; }
        const v = w[k];
        if (k === 'all' || k === 'any') v.forEach((x) => walk(x, where));
        else if (k === 'not') walk(v, where);
        else if (k === 'down' || k === 'standing' || k === 'left') for (const a of [].concat(v)) if (!aids.has(a)) E(where + ': names ' + a + ', who is not in the encounter');
        else if (k === 'claims') for (const c of [].concat(v)) if (!claims[c]) E(where + ': unknown claim ' + c);
        else if (k === 'stance') for (const a of Object.keys(v)) { if (!aids.has(a)) E(where + ': names ' + a + ', who is not in the encounter'); for (const st of [].concat(v[a])) if (!STANCES.has(st)) E(where + ': unknown stance ' + st); }
      }
    };
    const eff = (e, where) => {
      if (!e) return;
      if (e.reveal) for (const c of [].concat(e.reveal)) if (!claims[c]) E(where + ': reveals unknown claim ' + c);
      if (e.stance) for (const a of Object.keys(e.stance)) { if (!aids.has(a)) E(where + ': changes the stance of ' + a + ', who is not in the encounter'); if (!STANCES.has(e.stance[a])) E(where + ': unknown stance ' + e.stance[a]); }
      if (e.conclude && !(d.conclusions || []).some((c) => c.id === e.conclude)) E(where + ': concludes with unknown ' + e.conclude);
    };
    const cons = d.conclusions || [];
    cons.forEach((c, i) => { if (!c.id) E(W + ' conclusion ' + i + ': needs an id'); walk(c.when, W + ' conclusion ' + c.id); if (c.result && ['win', 'end', 'lose'].indexOf(c.result) < 0) E(W + ' conclusion ' + c.id + ': result must be win, end or lose'); text(c.text, W + ' conclusion ' + c.id); });
    if (d.objective) {
      if (d.objective.aid && !aids.has(d.objective.aid)) E(W + ': the objective names ' + d.objective.aid + ', who is not in the encounter');
      text(d.objective.text, W + ' objective');
      const wins = cons.filter((c) => (c.result || 'win') === 'win').length + (d.settleWins !== false && !cons.some((c) => c.when && c.when.settled === 'all') ? 1 : 0);
      if (wins < 2) E(W + ': an objective encounter needs at least two ways to win (C-09)');
    }
    // procedures
    if (d.procedure) {
      const P = d.procedure;
      if (!P.id || !Array.isArray(P.steps) || !P.steps.length) E(W + ': a procedure needs an id and steps');
      for (const sh of P.show || []) { text(sh.label, W + ' show ' + sh.key); for (const v in sh.values || {}) text(sh.values[v], W + ' show ' + sh.key + '.' + v); }
      (P.steps || []).forEach((stp, i) => {
        const w2 = W + ' step ' + (stp.id || i);
        text(stp.text, w2 + ' text');
        if (!stp.actions || !stp.actions.some((a) => a.ok)) E(w2 + ': no right action');
        for (const a of stp.actions || []) {
          text(a.label, w2 + ' action ' + a.id);
          if (!a.ok && !(a.means && a.means.en)) E(w2 + ' action ' + a.id + ': an action that can send the machine back must say what the player will do (means)');
          walk(a.requires, w2 + ' action ' + a.id);
        }
        if (stp.task) tiered(stp.task, w2 + ' task');
      });
      walk(cons.map((c) => c.when), W);
    }
    // conversations
    if (d.social) {
      const S = d.social;
      if ((S.parties || []).length < 1) E(W + ': a conversation needs people');
      for (const p of S.parties || []) { text(p.name, W + ' ' + p.aid + ' name'); if (p.stance && !STANCES.has(p.stance)) E(W + ' ' + p.aid + ': unknown stance ' + p.stance); }
      for (const c in claims) { jcheck(claims[c].jp, W + ' claim ' + c); if (!claims[c].en) E(W + ' claim ' + c + ': needs English'); }
      if (cons.length < 2) E(W + ': a conversation needs several conclusions');
      const hidden = Object.keys(claims).some((c) => claims[c].hidden);
      const changes = (S.drift || []).length > 0;
      const goals = (S.parties || []).filter((p) => p.wants).length >= 2;
      if ([hidden, changes, goals].filter(Boolean).length < 2) E(W + ': a conversation needs at least two of: something hidden to find, a situation that changes, competing goals (C-45)');
      for (const comp of ['nao', 'mio', 'ren', 'suzu']) if (!((S.companion || {})[comp] || []).length) E(W + ': ' + comp + ' has no option of their own (C-45)');
      for (const a of S.actions || []) {
        const w2 = W + ' choice ' + a.id;
        text(a.label, w2);
        walk(a.when, w2); eff(a.effect, w2);
        for (const c of a.cases || []) { walk(c.when, w2); eff(c.effect, w2); }
        if (a.task) tiered(a.task, w2 + ' task'); else E(w2 + ': a choice needs its language step (task)');
        if (a.lasting && !(a.means && a.means.en)) E(w2 + ': a choice with lasting consequences shows what the player means before committing (means)');
      }
      for (const k in S.responses || {}) { walk(S.responses[k].when, W + ' response ' + k); eff(S.responses[k].effect, W + ' response ' + k); }
      for (const comp in S.companion || {}) for (const a of S.companion[comp]) { text(a.name, W + ' ' + comp + ' ' + a.id); walk(a.when, W + ' ' + comp + ' ' + a.id); eff(a.effect, W + ' ' + comp + ' ' + a.id); }
      (S.drift || []).forEach((x, i) => { walk(x.when, W + ' drift ' + i); eff(x.effect, W + ' drift ' + i); });
      if (S.wait) { walk(S.wait.when, W + ' wait'); eff(S.wait.effect, W + ' wait'); }
      if (S.gesture) { text(S.gesture.name, W + ' gesture'); eff(S.gesture.effect, W + ' gesture'); }
    }
    for (const comp in d.companion || {}) for (const a of d.companion[comp]) { text(a.name, W + ' ' + comp + ' ' + a.id); walk(a.when, W + ' ' + comp + ' ' + a.id); eff(a.effect, W + ' ' + comp + ' ' + a.id); }
    if (d.study) for (const w of d.study.tools || []) if (!C.words[w]) E(W + ': the study uses unknown inscription ' + w);
    for (const a of d.arrivals || []) text(a.say, W + ' arrival');
    if (d.rules && d.rules.modifiers && d.rules.modifiers !== 'all') for (const m of [].concat(d.rules.modifiers)) if (!(C.modifiers && C.modifiers.families[m])) E(W + ': unknown modifier ' + m);
  }
  // modifier pairings (E27): every offered pairing is authored, natural, with furigana, its handwritten span part of
  // the phrase, its items real, its option and effect ones the rules know
  const M = C.modifiers || { families: {}, pairs: [] };
  const EFFECTS = ['ward_each', 'ward_any', 'ward_party', 'ward_fit', 'ward_per_blow', 'ward_unlimited', 'heal_full', 'light_all', 'rope_all', 'rope_most', 'rope_group', 'unravel_two', 'water_more', 'wind_forever'];
  for (const id in M.families) {
    const f = M.families[id];
    jcheck(f.jp, 'modifier ' + id);
    if (!f.grammar || !(RB.grammar && RB.grammar.get(f.grammar))) E('modifier ' + id + ': its grammar point ' + f.grammar + ' is not taught');
    if (!M.pairs.some((p) => p.mod === id)) E('modifier ' + id + ': pairs with no response');
    if (!RB.phase.concepts()['mod_' + id]) E('modifier ' + id + ': no concept declares how it is taught');
  }
  const seenPair = new Set();
  for (const p of M.pairs) {
    const W = 'modifier pair ' + p.mod + '+' + p.resp;
    if (!M.families[p.mod]) E(W + ': unknown modifier');
    if (p.resp !== 'unravel' && !C.words[p.resp]) E(W + ': unknown response');
    if (seenPair.has(p.mod + '+' + p.resp)) E(W + ': listed twice');
    seenPair.add(p.mod + '+' + p.resp);
    jcheck(p.jp, W + ' phrase');
    for (const k of ['before', 'write', 'after']) if (p.hand && p.hand[k]) jcheck(p.hand[k], W + ' hand.' + k);
    const flat = (m) => RB.jp.reading(m || '').replace(/\s+/g, '');
    if (!p.hand || flat([p.hand.before, p.hand.write, p.hand.after].filter(Boolean).join(' ')) !== flat(p.jp)) E(W + ': the handwritten span with what is shown around it is not the whole phrase');
    if (!p.en || !p.does || !p.trade) E(W + ': needs its meaning (en), what it does and its trade');
    if (EFFECTS.indexOf(p.effect) < 0) E(W + ': unknown effect ' + p.effect);
    if (p.option && ['who', 'two', 'leaveOut'].indexOf(p.option) < 0) E(W + ': unknown option ' + p.option);
    for (const it of [].concat(p.items || [], (p.hand && p.hand.items) || [])) if (it.slice(0, 2) === 'g:' && !(RB.grammar && RB.grammar.get(it.slice(2)))) E(W + ': unknown grammar point ' + it);
    if (p.hand && p.hand.items && p.hand.items.some((it) => (p.items || []).indexOf(it) < 0)) E(W + ': the handwritten route records an item the typed route does not');
  }
}
