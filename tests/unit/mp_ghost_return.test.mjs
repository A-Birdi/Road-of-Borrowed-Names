// A Ghostwriter's Debt: Shinobu comes back, and is there (Agnes 6576022838, 6576640096; Local CL-645, CL-646; Cloud
// CC-482). Once Ryūsui's voice rose, Shinobu went at the close of that exchange (left), and the next one said she
// "stops at the corner, and comes back" but nothing undid her going: the people panel kept her "Gone" to the end. And
// if Wait or a companion changed her stance first, the return was never said at all. Now an effect may name someone
// who has left to bring them back (`back`), and her return is keyed on her having gone. With synthetic campaigns only,
// the encounter engine as the conversation screen drives it (each choice's question answered right first time):
//  1. repeated Wait, nothing shown: she goes at the third exchange and comes back at the fourth (there again, listening;
//     one return line, one `back`); she stays there to the end; the seventh exchange ends it, unresolved, as before;
//  2. she goes, then the Wait that draws Ryūsui's admission (the manuscript shown first): she comes back, with her line;
//  3. she goes, then a companion's action changes her stance (Ren, Suzu; Nao once the manuscript is shown): the same;
//  4. she goes, then Mio calms Ryūsui: the same;
//  5. Mio calms Ryūsui before his voice rises: she never goes, and there is no return line;
//  6. the four ends, as before: brokered, exposed and shared, each by its own route, and unresolved at the seventh;
//  7. `back` itself, on a conversation made for the test: it brings back only who it names and only one who has left
//     (no line of its own, no stance or anything else changed); naming someone present, or no one in the encounter,
//     does nothing; a `leave` with no `back` stays gone;
//  8. the content's own checks: a `back` naming no one in the encounter is reported; the game's conversations pass;
//     mp.ghost's return is the only effect in the game that says `back`.
import { load } from '../lib/load.mjs';
import { encounterRules } from '../../tools/encounter_rules.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, E = RB.encounter;
  const flat = (x) => JSON.stringify(x);
  const OK = { ok: true, firstTry: true, mistakes: 0 };
  const RETURN = 'Shinobu stops at the corner, and comes back.';
  const camp = (comp) => { const s = RB.state.newCampaign({ edition: 2 }); s.id = 'mp-ghost-test'; s.comp = comp; s.words = []; RB.game.s = s; return s; };
  // one run: each step a choice (a card id) and the companion's action, if any; what was said, and where Shinobu stood
  const play = (comp, steps, def) => {
    const s = camp(comp);
    const st = E.begin(def || 'mp.ghost', s);
    const said = [], backs = [], where = [];
    for (const [id, act] of steps) {
      if (st.over) break;
      const card = E.cards(st, s, []).find((c) => c.id === id);
      if (!card) { where.push('no card ' + id); break; }
      const ev = E.exchange(st, { card, res: OK, comp: act ? { act } : null }, {});
      for (const f of [].concat(ev.fx || [], ev.cfx || [], ev.gfx || [])) { if (f.en) said.push(f.en); if (f.t === 'back') backs.push(f.aid); }
      const a = E.actorOf(st, 'n:shinobu');
      where.push(a ? (a.left ? 'gone' : st.enc.social.stance['n:shinobu']) : null);
    }
    return { st, s, said, backs, where, returns: said.filter((x) => x === RETURN).length };
  };
  const W = ['wait'];
  const waits = (n) => Array.from({ length: n }, () => W);

  // 1. repeated Wait, nothing shown
  {
    const r = play('mio', waits(8));
    t.ok(flat(r.where.slice(0, 4)) === flat(['closed', 'closed', 'gone', 'listening']) && r.returns === 1 && flat(r.backs) === flat(['n:shinobu']),
      '1 repeated Wait: she goes at the third exchange and comes back at the fourth, listening, with one return line and one back ' + flat({ where: r.where, returns: r.returns, backs: r.backs }));
    t.ok(r.where.slice(3).every((w) => w === 'listening') && r.st.over === 'end' && r.st.enc.outcome === 'unresolved' && r.where.length === 7,
      '1 and she stays there to the end; the seventh exchange ends it, unresolved, as before ' + flat({ where: r.where, over: r.st.over, outcome: r.st.enc.outcome }));
  }

  // 2. she goes, then the Wait that draws his admission
  {
    const r = play('mio', [W, W, ['s:manuscript'], W]);
    t.ok(flat(r.where) === flat(['closed', 'closed', 'gone', 'listening']) && r.returns === 1 && r.st.enc.social.revealed.g5 && r.said.some((x) => /ten years/.test(x)),
      '2 she goes, then the Wait that draws Ryūsui\'s admission: she comes back, with her line ' + flat({ where: r.where, returns: r.returns, g5: !!r.st.enc.social.revealed.g5 }));
  }

  // 3. she goes, then a companion changes her stance
  for (const [comp, steps] of [['ren', [W, W, W, ['wait', 'ren_record']]], ['suzu', [W, W, W, ['wait', 'suzu_billing']]], ['nao', [W, W, ['s:manuscript'], ['s:sanpei', 'nao_deliver']]]]) {
    const r = play(comp, steps);
    t.ok(flat(r.where) === flat(['closed', 'closed', 'gone', 'listening']) && r.returns === 1 && flat(r.backs) === flat(['n:shinobu']),
      '3 she goes, then ' + comp + '\'s action changes her stance: she comes back, with her line ' + flat({ where: r.where, returns: r.returns }));
  }

  // 4. she goes, then Mio calms Ryūsui
  {
    const r = play('mio', [W, W, W, ['wait', 'mio_calm']]);
    t.ok(flat(r.where) === flat(['closed', 'closed', 'gone', 'listening']) && r.returns === 1 && r.st.enc.social.stance['n:ryusui'] === 'listening',
      '4 she goes, then Mio calms Ryūsui: she comes back the same way ' + flat({ where: r.where, returns: r.returns }));
  }

  // 5. Mio calms Ryūsui before his voice rises
  {
    const r = play('mio', [['wait', 'mio_calm']].concat(waits(7)));
    t.ok(!r.where.includes('gone') && r.returns === 0 && !r.backs.length && !r.said.some((x) => /edges toward the street/.test(x)) && r.st.enc.outcome === 'unresolved',
      '5 Mio calms Ryūsui first: Shinobu never goes, and there is no return line ' + flat({ where: r.where, returns: r.returns }));
  }

  // 6. the four ends, as before
  {
    const brokered = play('mio', [['s:manuscript'], ['s:both_names']]);
    const exposed = play('mio', [['s:manuscript'], ['s:expose']]);
    const shared = play('mio', [['s:manuscript'], ['s:sanpei'], ['s:ask_debt'], ['gesture']]);
    const timeout = play('nao', waits(8));
    const ends = [brokered, exposed, shared, timeout].map((r) => [r.st.over, r.st.enc.outcome]);
    t.eq(flat(ends), flat([['end', 'brokered'], ['end', 'exposed'], ['end', 'shared'], ['end', 'unresolved']]), '6 the four ends by their own routes, as before: brokered, exposed, shared, unresolved');
  }

  // 7. back itself, on a conversation made for the test
  {
    const party = (aid, stance) => ({ aid, name: { jp: 'エー', en: aid }, stance: stance || 'listening' });
    const fx = (drift) => ({ id: 'fx.back', kind: 'social', name: { en: 'x' }, rules: { wait: true },
      social: { parties: [party('n:a'), party('n:b')], claims: {}, actions: [], drift }, conclusions: [{ id: 'over', when: { rounds: 4 }, result: 'end' }] });
    const state = (r) => ['n:a', 'n:b'].map((aid) => { const a = E.actorOf(r.st, aid); return aid + (a.left ? ':gone' : ':here') + ':' + r.st.enc.social.stance[aid] + ':' + (a.hp == null ? '-' : a.hp); });
    // a leaves at the first exchange; at the second, back names a; at the third, back names a again
    const r1 = play('mio', waits(3), fx([
      { when: { rounds: 0 }, once: true, effect: { leave: 'n:a' } },
      { when: { rounds: 1 }, once: true, effect: { back: 'n:a' } },
      { when: { rounds: 2 }, once: true, effect: { back: 'n:a' } },
    ]));
    t.ok(flat(r1.backs) === flat(['n:a']) && flat(state(r1)) === flat(['n:a:here:listening:-', 'n:b:here:listening:-']) && r1.said.length === 3 && r1.said.every((x) => /silence/.test(x)),
      '7 back brings back the one it names, once, with no line of its own and nothing else changed; named again, there already: nothing ' + flat({ backs: r1.backs, state: state(r1), said: r1.said }));
    const r2 = play('mio', waits(3), fx([
      { when: { rounds: 0 }, once: true, effect: { leave: ['n:a', 'n:b'] } },
      { when: { rounds: 1 }, once: true, effect: { back: ['n:a', 'n:nobody'] } },
    ]));
    t.ok(flat(r2.backs) === flat(['n:a']) && flat(state(r2)) === flat(['n:a:here:listening:-', 'n:b:gone:listening:-']),
      '7 a leave with no back stays gone; a back naming no one in the encounter does nothing ' + flat({ backs: r2.backs, state: state(r2) }));
  }

  // 8. the content's own checks
  {
    const check = (defs) => { const errs = []; encounterRules(RB, Object.assign({}, C, { encounters: defs }), { jcheck: () => {}, checkStep: () => {}, E: (m) => errs.push(m) }); return errs; };
    const bad = { id: 'fx.badback', kind: 'social', name: { en: 'x' }, rules: { wait: true }, social: { parties: [{ aid: 'n:a', name: { en: 'A' } }], claims: {}, actions: [], drift: [{ when: { rounds: 1 }, effect: { back: 'n:nobody' } }] }, conclusions: [{ id: 'x', when: { rounds: 3 }, result: 'end' }] };
    t.ok(check({ 'fx.badback': bad }).some((e) => /drift 0: names n:nobody, who is not in the encounter/.test(e)), '8 a back naming no one in the encounter is reported');
    const social = Object.fromEntries(Object.entries(C.encounters).filter(([, d]) => d.kind === 'social'));
    t.eq(check(social).filter((e) => /who is not in the encounter/.test(e)), [], '8 the game\'s conversations raise nothing about who they name');
    const backs = [];
    const walk = (x, where) => { if (!x || typeof x !== 'object') return; if (Array.isArray(x)) { x.forEach((y, i) => walk(y, where + '[' + i + ']')); return; } for (const k of Object.keys(x)) { if (k === 'effect' && x[k] && x[k].back !== undefined) backs.push(where + '.effect'); walk(x[k], where + '.' + k); } };
    for (const id in C.encounters) walk(C.encounters[id], id);
    // (a key named back elsewhere is not an effect: gd.ko's machine has a value "back", to go back)
    t.eq(backs, ['mp.ghost.social.drift[1].effect'], '8 mp.ghost\'s return is the only effect in the game that says back');
  }
};
