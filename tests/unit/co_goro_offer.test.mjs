// Gorō's first offer (Agnes 6586938396; Local CL-658, CL-659; Cloud CC-511): "Not right now" at the first meeting
// started no quest, but the scene was then seen, and his talk went to the bell polishing for good, so The Bell Without
// a Rope could never be taken (he had promised "Whenever you like"). Now only a finished quest goes to the polishing,
// and an offer declined is asked again: his request and the same choice, without a second introduction. In node, with
// the real runner and his square's own talk list:
//  1. the first meeting, line for line as before, either answer; declined: no quest, the scene seen;
//  2. declined, talked to again at once: his request only, and the same choice; declined twice, then taken;
//  3. taken on the retry: the quest at Tamotsu's step, his waiting line, Tamotsu's rope, the bell rung, the quest done;
//     then the bell polishing (the only way to it now);
//  4. the other paths keep their order: the history scene first when the chronicle's read (and the offer after it),
//     restored, and after Chapter 3 his after-chapter line (a declined offer is not reopened there);
//  5. the practice letter L03 still counts him met (seen.co.goro_first).
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, test = S.test;
  const base = C.maps['co.village'].npcs.find((n) => n.id === 'co_goro' && Array.isArray(n.talk));
  const IN = { departed: true, ch1_done: true, ch2_done: true, co_arrived: true, co_met_sayo: true };
  const AFTER = Object.assign({}, IN, { co_restored: true, ch3_done: true });
  const journey = (flags) => {
    const s = S.newCampaign({ edition: 2 }); s.comp = 'ren'; s.map = 'co.village'; s.x = 12; s.y = 14;
    Object.assign(s.flags, flags || {});
    s.quests.co_main = s.flags.ch3_done ? { stage: 9, done: true, t: 1 } : { stage: 1, done: false, t: 1 };
    RB.game.G.s = s; RB.game.s = s;
    return s;
  };
  const talk = (s) => (base.talk.find((o) => !o.if || test(s, o.if)) || {}).scene;
  const said = [], picks = [];
  RB.ui.dialogue.say = async (l) => { said.push(l.en); };
  RB.ui.dialogue.choose = async () => (picks.length ? picks.shift() : 0);
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.shake = () => {}; // (the bell's ringing shakes the screen: no page here)
  for (const k of ['dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  RB.activities.run = async () => ({ ok: false }); // (the history's ordering, not passed: his "later")
  const play = async (s, scene, p) => { said.length = 0; picks.length = 0; picks.push(...(p || [])); await RB.script.run(scene || talk(s)); return said.slice(); };
  const q = (s) => (s.quests.co_bell ? (s.quests.co_bell.done ? 'done' : s.quests.co_bell.stage) : 'none');

  const INTRO = 'Ah, travellers. I\'m Gorō, keeper of the lookout. …Though "keeping" it means polishing the bell and nothing more.';
  const BELL = 'This bell has no rope. Never has. …Or did it, once? I don\'t remember.';
  const FOLK = 'Folk say a bell nobody rings doesn\'t need a rope. But looking at a bell with no rope makes my hands itch.';
  const ASK = 'Traveller, would you do me a favour? Find me one good strong rope.';
  const YES = 'Much obliged. Tamotsu keeps rope for the water gates.';
  const NO = 'No matter. Whenever you like. The bell won\'t run off.';
  const WAIT = 'Tamotsu ought to have spare rope for the water gates. Ask him for me.';
  const IDLE = 'A bell has to be polished or its voice clouds over. Even a bell nobody rings.';
  const LATER = '…Well, it\'s not urgent. Come back any time.';

  // ---- 1. the first meeting
  {
    const s = journey(IN);
    const L = await play(s, null, [0]);
    t.eq({ scene: talk(journey(IN)), L, q: q(s) }, { scene: 'co.goro', L: [INTRO, BELL, FOLK, ASK, YES], q: 0 }, '1 the first meeting, "I\'ll find one": line for line as before, the quest at 0');
  }
  const declined = async (flags) => { const s = journey(flags); await play(s, null, [1]); return s; };
  {
    const s = journey(IN);
    const L = await play(s, null, [1]);
    t.eq({ L, q: q(s), seen: !!s.seen['co.goro_first'] }, { L: [INTRO, BELL, FOLK, ASK, NO], q: 'none', seen: true }, '1 the first meeting, "Not right now": line for line as before; no quest, the scene seen');
  }

  // ---- 2. asked again
  {
    const s = await declined(IN);
    const next = talk(s);
    const L = await play(s, null, [1]);
    t.eq({ next, L, q: q(s) }, { next: 'co.goro', L: [ASK, NO], q: 'none' }, '2 declined, talked to again at once: his request only, the same choice; declined again, still no quest');
    const L2 = await play(s, null, [0]);
    t.eq({ L2, q: q(s) }, { L2: [ASK, YES], q: 0 }, '2 declined twice, then "I\'ll find one": his request, then his thanks; the quest at 0');
    t.ok(!said.includes(INTRO), '2 no second introduction');
  }

  // ---- 3. taken on the retry, through to the bell
  {
    const s = await declined(IN);
    await play(s, null, [0]);
    const W1 = await play(s);
    const T = await play(s, 'co.tamotsu');
    const rope = s.inv.co_rope || 0, mid = q(s);
    const R = await play(s);
    const I = await play(s);
    t.eq({ W1, tamotsu: T.some((l) => /I've a spare for the water gates/.test(l)), rope, mid }, { W1: [WAIT], tamotsu: true, rope: 1, mid: 1 },
      '3 taken on the retry: his waiting line, then Tamotsu\'s rope (the quest at 1)');
    t.ok(R.some((l) => /Oh — a rope!/.test(l)) && q(s) === 'done' && s.flags.co_bell_done && s.flags.co_bell_rung && !(s.inv.co_rope || 0),
      '3 the rope to Gorō: the bell rung, the quest done (' + JSON.stringify({ q: q(s), R: R.slice(0, 2) }) + ')');
    t.eq(I, [IDLE], '3 then the bell polishing');
  }

  // ---- 4. the other paths, in their order
  {
    const s = await declined(IN); // (declined first: once the chronicle's read, his history comes before any first meeting)
    Object.assign(s.flags, { co_suspect: true, co_chronicle_read: true });
    const H = await play(s);
    t.ok(/Tales from when I was young\?/.test(H[0] || '') && H[H.length - 1] === LATER && q(s) === 'none', '4 the chronicle read, the offer declined: the history scene first, as before (' + JSON.stringify(H) + ')');
    s.flags.co_hist_goro = true;
    t.eq(await play(s, null, [0]), [ASK, YES], '4 his history told: the offer again');
  }
  {
    const s = journey(Object.assign({}, IN, { co_suspect: true, co_chronicle_read: true, co_bell_done: true, co_bell_rung: true }));
    s.seen['co.goro_first'] = true; s.quests.co_bell = { stage: 1, done: true, t: 2 };
    t.ok(/Tales from when I was young\?/.test((await play(s))[0] || ''), '4 the bell rung, the chronicle read: the history scene first, as before');
  }
  {
    const s = await declined(IN);
    s.flags.co_restored = true;
    s.quests.co_bell = { stage: 0, done: false, t: 1 };
    const L = await play(s);
    t.ok(/The rope's up/.test(L[0] || '') && q(s) === 'done', '4 restored with the quest open: the restored thanks, the quest done, as before');
  }
  {
    const s = await declined(IN);
    Object.assign(s.flags, AFTER); s.quests.co_main = { stage: 9, done: true, t: 1 };
    const after = talk(s), L = await play(s);
    t.eq({ after, q: q(s), first: L[0] }, { after: 'co.goro_after', q: 'none', first: 'We ring the bell once at dusk now — the signal to mind your fires. It\'s Kotarō who rings it, not me.' },
      '4 after Chapter 3 with the offer declined: his after-chapter line; not reopened');
  }

  // ---- 5. the practice letter L03
  {
    const L03 = (C.practiceB.letters || []).find((x) => x.id === 'L03');
    const s = await declined(IN);
    t.ok(L03 && L03.met === 'seen.co.goro_first' && test(s, L03.met) && !test(journey(IN), L03.met), '5 L03 counts him met once his first meeting is over (declined too), and not before');
  }
};
