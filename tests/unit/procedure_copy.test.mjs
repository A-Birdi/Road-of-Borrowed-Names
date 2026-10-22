// RBN-QA-112 (Agnes 6344362652; Local CL-207): the words every procedure shares (the footer, the Step away confirm,
// the line for a wrong step with none of its own) must be true for all of them, and a procedure is not always a
// machine: the room allocation, the spring cooking and the Hall's trials are procedures too. What a wrong action
// undoes depends on the procedure's restart ('start': back to the first step; 'stable': back to the last step that
// holds), so the shared words promise neither. Here, on every procedure in the game:
//  1. a wrong action after the first step goes back exactly as its restart says (to the first step, or no further
//     back than the last stable step), so "A wrong action may undo progress" is true of each, and no more;
//  2. stepping away keeps where it stands (no procedure says keep: false today), as the Step away confirm says; and
//     one that said keep: false would start again from the first step, as its confirm would say;
//  3. a wrong step with no words of its own says only "That was not the way.", with no machine in it.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, E = RB.encounter;
  const OK = { ok: true, firstTry: true, mistakes: 0 };
  const camp = () => {
    const s = RB.state.newCampaign({ difficulty: 'normal' });
    s.id = 'proc-copy'; s.comp = null; s.words = ['mamoru', 'mizu', 'hikari'];
    return s;
  };
  const wordsOf = (s) => s.words.map((w) => C.words[w]).filter(Boolean);
  const procCard = (st, s, ok) => E.cards(st, s, wordsOf(s)).find((c) => c.kind === 'proc' && !!c.action.ok === ok && (!ok || E.test(st, c.action.requires) !== false));
  const play = (st, s, card) => E.exchange(st, { card, res: OK, comp: null, target: st.cur }, { enemy: st.foes[0] && st.foes[0].def });

  const ids = Object.keys(C.encounters).filter((id) => C.encounters[id].procedure).sort();
  t.ok(ids.length >= 27, 'every procedure in the game (' + ids.length + ')');
  const modes = { start: 0, stable: 0 };
  const wrongBad = [], keepBad = [], awayBad = [], noWrong = [];
  for (const id of ids) {
    const P = C.encounters[id].procedure;
    const mode = P.restart || 'start';
    modes[mode] = (modes[mode] || 0) + 1;
    if (P.keep === false) keepBad.push(id);
    // 1. as far into the procedure as its first two steps, then a wrong action
    const s = camp();
    const st = E.begin(id, s);
    let done = 0;
    for (let k = 0; k < Math.min(2, P.steps.length - 1); k++) {
      const c = procCard(st, s, true);
      if (!c) break;
      play(st, s, c);
      if (st.enc.proc.step !== k + 1) break;
      done++;
    }
    const wrong = procCard(st, s, false);
    if (!wrong) { noWrong.push(id + '@' + st.enc.proc.step); continue; }
    const at = st.enc.proc.step, stableAt = st.enc.proc.stable.step;
    play(st, s, wrong);
    const to = st.enc.proc.step;
    const expect = mode === 'stable' ? stableAt : 0;
    if (to !== expect) wrongBad.push({ id, mode, at, to, expect });
    // 2. stepping away and coming back
    if (!st.over) {
      E.finishEncounter(st, s, 'flee');
      const x = E.begin(id, s);
      if (x.enc.proc.step !== to || JSON.stringify(x.enc.proc.machine) !== JSON.stringify(st.enc.proc.machine)) awayBad.push({ id, left: to, back: x.enc.proc.step });
    }
    if (done < 1 && P.steps.length > 1) wrongBad.push({ id, note: 'could not take the first step' });
  }
  t.ok(modes.start > 0 && modes.stable > 0, 'both kinds are here: ' + JSON.stringify(modes));
  t.ok(!wrongBad.length, 'a wrong action goes back as the procedure\'s restart says: to the first step (start), or to the last stable step (stable)' + (wrongBad.length ? ': ' + JSON.stringify(wrongBad.slice(0, 5)) : ''));
  t.ok(!noWrong.length, 'every procedure has a wrong action to try at its third step or before' + (noWrong.length ? ': ' + noWrong.join(', ') : ''));
  t.ok(!keepBad.length, 'no procedure says keep: false, so "It stays as you leave it" is true of each' + (keepBad.length ? ': ' + keepBad.join(', ') : ''));
  t.ok(!awayBad.length, 'stepping away keeps where it stands' + (awayBad.length ? ': ' + JSON.stringify(awayBad.slice(0, 5)) : ''));

  // 2b. a procedure that does not keep its place (none in the game today; the Step away confirm says so for one that
  //     does not, Agnes 6345961972): stepping away and coming back starts it again from the first step
  {
    const d = JSON.parse(JSON.stringify(C.encounters['fx.sluice']));
    d.procedure.keep = false;
    const s = camp();
    const st = E.begin(d, s);
    play(st, s, procCard(st, s, true));
    const went = st.enc.proc.step;
    E.finishEncounter(st, s, 'flee');
    const x = E.begin(d, s);
    t.ok(went === 1 && x.enc.proc.step === 0, 'keep: false: stepped away after the first step, it starts again from the first (' + went + ' → ' + x.enc.proc.step + ')');
  }
  // 3. a wrong step with no words of its own
  {
    const d = JSON.parse(JSON.stringify(C.encounters['fx.sluice']));
    for (const st of d.procedure.steps) { delete st.wrong; for (const a of st.actions) delete a.wrong; }
    const s = camp();
    const st = E.begin(d, s);
    const ev = play(st, s, procCard(st, s, false));
    const f = ev.fx.find((x) => x.t === 'proc' && x.ok === false);
    t.ok(f && f.en === 'That was not the way.', 'a wrong step with no words of its own: "That was not the way." (' + (f && f.en) + ')');
  }
};
