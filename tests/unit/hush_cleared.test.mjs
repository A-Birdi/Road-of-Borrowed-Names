// A bell or a voice and the Hush (Agnes 6549129992; Cloud CC-413; Local CL-572; Agnes 6549259814). Any bell or voice
// response cleared the Hush and reported { t: 'bell' } whether or not one was on you, so the battle log said "A clear
// note breaks the hush." when nothing was hushed, and the Here preview had no way to say when one really was. Now the
// event carries `cleared`, read before the reset; the resets and the answering are as before. Ren's own global clear
// (Raise the lamps) carries `cleared: true` and keeps its `by`; it stays global-only.
// With synthetic battles only (the real rules, src/engine/95_combat.js):
//  1. すず (bell) and こえ (voice), each with a global Hush on you, a family Hush only, both, and neither: the event's
//     `cleared` true, true, true, false; the Hush gone after it either way;
//  2. the same through the Here preview's own path (previewAct): the same `cleared`, and the battle as it was (the
//     whole state; the rules draw no randomness here, src/engine/95_combat.js previewAct);
//  3. an incoming Hush only (nothing on you): `cleared` false, and the Hush still answered (countered), so its move
//     comes to nothing as before;
//  4. two creatures each about to Hush, and a Hush on you, aimed at either: one bell event, `cleared` true, both answered;
//  5. Ren's Raise the lamps with a global Hush on you: its event carries `by` and `cleared: true`; with a family Hush
//     only, no event and the family Hush stays (global-only, as before).
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const L = RB.combatLogic, C = RB.content;
  const W = (id) => C.words[id];
  const flat = (x) => JSON.stringify(x);
  const ok = { ok: true, firstTry: true, mistakes: 0 };
  const foe = (pattern) => ({ id: 'probe', knots: 9, pattern });
  const camp = (o) => {
    const s = RB.state.newCampaign({});
    s.learn.difficulty = 'normal'; s.learn.assist = 'normal';
    s.comp = o.comp || null;
    s.words = ['mamoru', 'mizu', 'hikari', 'iyasu', 'suzu', 'koe'];
    return s;
  };
  const HUSH = { global: { silenced: 1, hushed: {} }, family: { silenced: 0, hushed: { water: 3 } }, both: { silenced: 1, hushed: { light: 2 } }, neither: { silenced: 0, hushed: {} } };
  const setup = (h, pattern = ['strike', 'strike'], o = {}) => {
    const e = foe(pattern);
    const st = L.init(e, camp(o), o.group ? { group: o.group } : {});
    st.silenced = h.silenced; st.hushed = Object.assign({}, h.hushed);
    return { e, st };
  };
  const bells = (fx) => fx.filter((f) => f.t === 'bell');

  // 1. the real exchange
  for (const w of ['suzu', 'koe']) {
    const got = {};
    for (const [k, h] of Object.entries(HUSH)) {
      const { e, st } = setup(h);
      const r = L.playerAct(st, { kind: 'word', word: W(w) }, ok, e);
      const b = bells(r.fx);
      got[k] = { n: b.length, cleared: b[0] && b[0].cleared, after: [st.silenced, Object.keys(st.hushed || {}).length] };
    }
    t.ok(flat(Object.values(got).map((x) => [x.n, x.cleared, x.after])) === flat([[1, true, [0, 0]], [1, true, [0, 0]], [1, true, [0, 0]], [1, false, [0, 0]]]),
      '1 ' + w + ' (' + W(w).tags.join() + '): cleared for a global Hush, a family Hush, both; not for neither; no Hush after it either way ' + flat(got));
  }

  // 2. the Here preview's own path
  for (const w of ['suzu', 'koe']) {
    const got = {};
    let same = true;
    for (const [k, h] of Object.entries(HUSH)) {
      const { st } = setup(h);
      const before = flat(st);
      const p = L.previewAct(st, { kind: 'word', word: W(w) });
      const b = bells(p.fx);
      got[k] = b[0] && b[0].cleared;
      same = same && flat(st) === before;
    }
    t.ok(flat(got) === flat({ global: true, family: true, both: true, neither: false }) && same,
      '2 ' + w + ', previewed: the same cleared, and the whole battle state as it was ' + flat({ got, same }));
  }

  // 3. an incoming Hush only
  {
    const { e, st } = setup(HUSH.neither, ['silence', 'strike']);
    const intent = st.foes[0].intent && st.foes[0].intent.kind;
    const r = L.playerAct(st, { kind: 'word', word: W('suzu') }, ok, e);
    const b = bells(r.fx);
    const fx2 = L.enemyAct(st, r.countered);
    t.ok(intent === 'silence' && b.length === 1 && b[0].cleared === false && r.answered[0] && !!r.countered && !st.silenced && !fx2.some((f) => f.t === 'silence'),
      '3 an incoming Hush only: cleared false, the Hush still answered, and its move comes to nothing ' + flat({ intent, b, answered: r.answered, hushedAfter: st.silenced, fx2: fx2.map((f) => f.t) }));
  }

  // 4. two creatures each about to Hush (the second one's move set to the first one's Hush: in a group the patterns
  // start offset), and a Hush on you; aimed at either
  {
    const got = [];
    for (const cur of [0, 1]) {
      const b2 = foe(['silence', 'strike']);
      const { e, st } = setup(HUSH.global, ['silence', 'strike'], { group: [b2] });
      st.foes[1].intent = Object.assign({}, st.foes[0].intent); st.cur = cur;
      const r = L.playerAct(st, { kind: 'word', word: W('suzu') }, ok, e);
      const b = bells(r.fx);
      got.push({ cur, n: b.length, cleared: b[0] && b[0].cleared, answered: [!!r.answered[0], !!r.answered[1]] });
    }
    t.ok(got.every((g) => g.n === 1 && g.cleared === true && g.answered[0] && g.answered[1]),
      '4 two creatures about to Hush, and a Hush on you, aimed at either: one bell event, cleared, both Hushes answered ' + flat(got));
  }

  // 5. Ren's Raise the lamps
  {
    const a = foe(['silence', 'strike']), b = foe(['shroud', 'strike']);
    const s = camp({ comp: 'ren' });
    const st = L.init(a, s, { group: [b] });
    st.silenced = 1;
    const P = L.playerAct(st, { kind: 'word', word: W('iyasu') }, ok, a);
    const C1 = L.compAct(st, 'ren_lanterns', P);
    const rb = bells(C1.fx);
    const st2 = L.init(a, camp({ comp: 'ren' }), { group: [b] });
    st2.hushed = { water: 3 };
    const P2 = L.playerAct(st2, { kind: 'word', word: W('iyasu') }, ok, a);
    const C2 = L.compAct(st2, 'ren_lanterns', P2);
    t.ok(rb.length === 1 && rb[0].by && rb[0].cleared === true && !st.silenced && bells(C2.fx).length === 0 && st2.hushed.water === 3,
      '5 Raise the lamps: with a Hush on you, its event keeps "by" and carries cleared; with a family Hush only, nothing, and the family Hush stays ' + flat({ rb, family: st2.hushed, c2: bells(C2.fx) }));
  }
};
