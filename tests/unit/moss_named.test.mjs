// The Moss Lantern, named (Cloud CC-403; Local CL-561; Agnes 6547199277): after a peaceful naming the battle screen told
// the same beat three times: the procedure's done line in the log, then the conclusion's own text said ("The Moss
// Lantern, named, steps back onto its base. A small light shows in it.", English only, so never spoken), then the
// creature's settle line said. Only the conclusion's text is dropped; the conclusion stays. On the real encounter
// engine:
//  1. the definition: the `named` conclusion keeps its id, condition, win and flag, and has no text of its own; the
//     rest of the encounter (the procedure, its done line, both actions) and the Moss Lantern itself (its settle line)
//     as before, and every other encounter as before (no sweep), by fingerprints taken before the change;
//  2. named, with each companion and none: Call it by its name, answered right, ends the encounter a win, `named`; the
//     exchange carries the step's result and the done line as before; the conclusion helper gives no text (null),
//     whichever way outcomes are shown, while the conclusion's own .text and the finish's .text are absent (undefined);
//  3. what the campaign keeps: the flag kr_moss1_named, the procedure recorded done, the outcome `named`; on the
//     Cedar Steps the lit lantern is there and the Moss Lantern is not;
//  4. Push past it: as before: its line, back to the start, nothing called, not over; then named, a win as in 2;
//  5. a save's round trip keeps the flag and the procedure done.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, E = RB.encounter;
  const OK = { ok: true, firstTry: true, mistakes: 0 };
  const J = (o) => JSON.stringify(o, (k, v) => (typeof v === 'function' ? undefined : v));
  const fp = (x) => crypto.createHash('sha256').update(J(x)).digest('hex').slice(0, 16);
  const DONE = 'Called by its name, the Moss Lantern settles back onto its base and lets you by.';
  const CALLED = 'The moss stirs. The lantern stops, listening.';
  const PUSHED = 'The lantern doesn\'t budge an inch; it only plants itself more firmly.';
  const camp = (comp) => { const s = RB.state.newCampaign({ difficulty: 'normal' }); s.id = 'moss'; s.comp = comp; s.map = 'kr.steps'; s.flags.departed = !!comp; return s; };
  const wordsOf = (s) => s.words.map((w) => C.words[w]).filter(Boolean);
  const cardOf = (st, s, id) => E.cards(st, s, wordsOf(s)).find((c) => c.kind === 'proc' && c.action && c.action.id === id && !c.disabled);
  const play = (st, s, id) => { const card = cardOf(st, s, id); return card ? E.exchange(st, { card, res: OK }, { enemy: st.foes[0] && st.foes[0].def }) : null; };

  // 1. the definition
  const def = C.encounters['kr.moss_steps'];
  const named = (def.conclusions || []).find((c) => c.id === 'named');
  t.ok(def.conclusions.length === 1 && named && J(named.when) === J({ proc: 'done' }) && named.result === 'win' && J(named.flags) === J({ kr_moss1_named: true }) && !('text' in named) && !('summarised' in named),
    '1 the named conclusion: its id, condition, win and flag; no text of its own ' + J(named));
  const rest = Object.assign({}, def, { conclusions: def.conclusions.map((c) => { const o = Object.assign({}, c); delete o.text; return o; }) });
  t.ok(fp(rest) === ENC_FP && fp(C.enemies['kr.moss']) === MOSS_FP && C.enemies['kr.moss'].settle && /^Named, the lantern settles back onto its base/.test(C.enemies['kr.moss'].settle.en),
    '1 the rest of the encounter, and the Moss Lantern with its settle line, as before ' + J({ enc: fp(rest), moss: fp(C.enemies['kr.moss']) }));
  const others = Object.keys(C.encounters).filter((k) => k !== 'kr.moss_steps').sort();
  t.ok(fp(others.map((k) => [k, C.encounters[k]])) === OTHERS_FP, '1 every other encounter as before (no sweep) ' + J({ n: others.length, fp: fp(others.map((k) => [k, C.encounters[k]])) }));

  // 2. named, with each companion and none; 3. what the campaign keeps
  const results = {};
  for (const comp of ['ren', 'nao', 'mio', 'suzu', null]) {
    const s = camp(comp);
    const st = E.begin('kr.moss_steps', s);
    const ev = play(st, s, 'call');
    const fx = ev ? ev.fx.filter((f) => f.t === 'proc') : [];
    const helper = [E.conclusionText(st.enc.conclusion, { outcomeView: 'shown' }), E.conclusionText(st.enc.conclusion, { outcomeView: 'summarised' }), E.conclusionText(st.enc.conclusion, null)];
    const raw = st.enc.conclusion ? st.enc.conclusion.text : 'no conclusion';
    const fin = E.finishEncounter(st, s, st.over);
    if (fin && fin.flags) for (const k in fin.flags) s.flags[k] = fin.flags[k];
    const map = C.maps['kr.steps'];
    const lamp = map.props.find((p) => p.p === 'kr_toro' && p.x === 14 && p.y === 9);
    const foe = map.foes.find((f) => f.id === 'moss1');
    results[comp || 'none'] = {
      over: ev && ev.over, outcome: st.enc.outcome,
      fx: fx.map((f) => [f.ok === true ? 'ok' : f.done ? 'done' : 'no', f.en]),
      helper, raw, fin: fin && { text: fin.text, flags: fin.flags, outcome: fin.outcome },
      flag: s.flags.kr_moss1_named === true, proc: J(s.enc && s.enc.proc && s.enc.proc.kr_moss),
      lamp: !!lamp && RB.state.test(s, lamp.if) && !!(lamp.o && lamp.o.lit), foeGone: !!foe && !RB.state.test(s, foe.if),
    };
  }
  const r0 = results.ren;
  t.ok(Object.values(results).every((r) => r.over === 'win' && r.outcome === 'named' && J(r.fx) === J([['ok', CALLED], ['done', DONE]])),
    '2 named, with each companion and none: a win, named; the step\'s result and the done line as before ' + J(r0));
  t.ok(Object.values(results).every((r) => J(r.helper) === J([null, null, null]) && r.raw === undefined && r.fin && r.fin.text === undefined),
    '2 the helper gives no text (null), shown or summarised; the conclusion\'s .text and the finish\'s .text are absent (undefined) ' + J({ helper: r0.helper, raw: String(r0.raw), fin: String(r0.fin && r0.fin.text) }));
  t.ok(Object.values(results).every((r) => J(r.fin.flags) === J({ kr_moss1_named: true }) && r.fin.outcome === 'named' && r.flag && r.proc === J({ done: true, version: 1 }) && r.lamp && r.foeGone),
    '3 kept: the flag, the procedure done, the outcome; on the Cedar Steps the lantern lit and the Moss Lantern gone ' + J({ flags: r0.fin.flags, proc: r0.proc, lamp: r0.lamp, foeGone: r0.foeGone }));

  // 4. Push past it
  {
    const s = camp('nao');
    const st = E.begin('kr.moss_steps', s);
    const ev = play(st, s, 'push');
    const f = ev ? ev.fx.find((x) => x.t === 'proc') : null;
    const after = { over: ev && ev.over, step: st.enc.proc.step, machine: J(st.enc.proc.machine), done: !!st.enc.proc.done, concluded: !!st.enc.conclusion, flag: !!s.flags.kr_moss1_named };
    t.ok(f && f.ok === false && f.en === PUSHED && f.to === 'name' && !after.over && after.step === 0 && after.machine === J({ named: 'no' }) && !after.done && !after.concluded && !after.flag,
      '4 Push past it: its line, back to the start, nothing called, not over ' + J({ f, after }));
    const ev2 = play(st, s, 'call');
    t.ok(ev2 && ev2.over === 'win' && st.enc.outcome === 'named' && E.conclusionText(st.enc.conclusion, {}) === null, '4 then named: a win, as in 2 ' + J({ over: ev2 && ev2.over, outcome: st.enc.outcome }));
  }

  // 5. a save's round trip
  {
    const s = camp('mio');
    const st = E.begin('kr.moss_steps', s);
    play(st, s, 'call');
    const fin = E.finishEncounter(st, s, st.over);
    for (const k in fin.flags) s.flags[k] = fin.flags[k];
    const back = RB.save.migrate(JSON.parse(JSON.stringify(s)));
    t.ok(back.flags.kr_moss1_named === true && J(back.enc.proc.kr_moss) === J({ done: true, version: 1 }), '5 a save\'s round trip keeps the flag and the procedure done ' + J({ flag: back.flags.kr_moss1_named, proc: back.enc.proc.kr_moss }));
  }
};
// before this change (computed on its parent, the conclusion's text left out): this encounter, the Moss Lantern, every
// other encounter
// (OTHERS_FP: since the Nameless Bridge's row, mb.boss says settleWins: false; Agnes 6570338266; Cloud CC-470, CC-471;
// Local CL-633. Before it: da6368934a83e605. Since the Ghostwriter's row, Shinobu's return in mp.ghost is keyed on her
// having gone, and brings her back; Agnes 6576022838, 6576640096; Local CL-645, CL-646; Cloud CC-482. Before it:
// ff3e6917bd759b88. Since the Understage's row, mp.boss says settleWins: false; Agnes 6580371549; Cloud CC-484;
// Local CL-648. Before it: 903f63151942ebad)
// (ENC_FP: since the Moss Lantern's own settling row, kr.moss_steps says settleWins: false; Cloud CC-486; Local CL-648,
// CL-650. Before it: 6ed4034560ef3a45)
const ENC_FP = '3162cea5df79d7d5', MOSS_FP = 'ca049a7ebb803fe8', OTHERS_FP = '264fb78b3eb0abd8';
