// The Upper House front desk, told as it is (Agnes 6553467222, 6553636474; Local CL-594; Cloud CC-430). The last
// traveller without a booking is rightly told no for tonight and takes Plum from tomorrow, but the end said every
// newcomer had a room for the night, and Tokuzō thanked everyone "safely in their rooms". Now the encounter's
// conclusion names the groups (English only, as before), and Tokuzō's English says tonight's guests, as his Japanese
// (皆さま, an innkeeper's guests of the house) already does: his Japanese, its voice key and its ledger key stay. With
// synthetic campaigns only, the real encounter engine and scene runner:
//  1. the conclusion: id, condition, win and flag as before; its English the named groups, and no Japanese of its own;
//     the procedure's fuller done line as before; the rest of the encounter as before (fingerprint taken before);
//  2. the desk done (each step right first time, and again with a wrong turn put right at every step): 'done' wins;
//     the done line, then the conclusion's own words; neither says the traveller has a room tonight;
//  3. Tokuzō's line: the same Japanese and voice key (yn.rooms_start#cae3754dd8), the new English; the ledger's entry
//     for it carries the same Japanese and the same English;
//  4. after the desk: done, Tokuzō's thanks, the room under the stairs, a towel and a yukata, yn_main at 3, as before;
//     not done (cancelled or unfinished): no thanks, nothing given, no flag, as before.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { load, root } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, E = RB.encounter;
  const OK = { ok: true, firstTry: true, mistakes: 0 };
  const J = (o) => JSON.stringify(o, (k, v) => (typeof v === 'function' ? undefined : v));
  const fp = (x) => crypto.createHash('sha256').update(J(x)).digest('hex').slice(0, 16);
  const CONC = 'Oshige, the four villagers and Yasuke have rooms tonight. The traveller has booked Plum from tomorrow.';
  const DONE = 'Every newcomer has a room tonight, and the man without a booking has the Plum room from tomorrow.';
  const THANKS = 'Everyone staying tonight is safely in their room. …Thank you. Truly.';
  const TOKUZO_JP = '{皆|みな}さま 、 {無事|ぶじ} に お{部屋|へや} へ 。 …… ありがとう ございました 。 {本当|ほんとう} に 。';
  // (computed on the parent, f21335a: the encounter without its conclusion's text)
  const REST_FP = 'f8505f2545ccf10a';

  let lines = [], encRes = () => ({ result: 'win', outcome: 'done' });
  RB.ui.dialogue.say = async (l) => { lines.push({ who: l.who, jp: l.jp || '', en: l.en || '' }); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.shake = () => {};
  RB.ui.fade = async () => {};
  for (const k of ['ensureSpeaker', 'dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.world.whenArrived = async () => {};
  RB.world.emote = () => {};
  RB.game.afterScene = () => {};
  RB.game.transition = async (map) => { RB.game.G.s.map = map; };
  RB.game.startEncounter = async (id) => encRes(id);
  RB.save.autosave = async () => {};
  RB.challenge.run = async () => ({ ok: true });
  const fresh = () => {
    const s = S.newCampaign({ edition: 2 });
    s.id = 'yn-desk-test'; s.map = 'yn.upper'; s.comp = 'ren';
    s.words = ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'iyasu'];
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_called: true });
    s.quests.yn_main = { stage: 2, done: false };
    RB.game.G.s = s;
    return s;
  };
  const wordsOf = (s) => s.words.map((w) => C.words[w]).filter(Boolean);
  const flat = (x) => JSON.stringify(x);

  // 1. the conclusion
  const d = C.encounters['yn.rooms'];
  {
    const c = d.conclusions;
    const rest = Object.assign({}, d, { conclusions: c.map((x) => { const o = Object.assign({}, x); delete o.text; return o; }) });
    t.ok(c.length === 1 && c[0].id === 'done' && flat(c[0].when) === flat({ proc: 'done' }) && c[0].result === 'win' && flat(c[0].flags) === flat({ yn_rooms_all: true }) &&
      c[0].text && c[0].text.en === CONC && !c[0].text.jp && d.procedure.done.en === DONE && fp(rest) === REST_FP,
      '1 the conclusion: as before but its English, the named groups, with no Japanese of its own; the fuller done line and the rest of the encounter as before ' + fp(rest));
  }

  // 2. the desk done, right first time and with a wrong turn at every step
  for (const wrongFirst of [false, true]) {
    const s = fresh();
    const st = E.begin('yn.rooms', s);
    const log = [];
    let wrongs = 0;
    for (let i = 0; i < 40 && !st.over; i++) {
      const cards = E.cards(st, s, wordsOf(s)).filter((c) => c.kind === 'proc');
      const good = cards.find((c) => c.action.ok), bad = cards.find((c) => !c.action.ok);
      const card = wrongFirst && bad && wrongs <= st.enc.proc.step ? bad : good;
      if (card === bad) wrongs++;
      const ev = E.exchange(st, { card, res: OK, comp: null }, {});
      for (const f of [].concat((ev && ev.fx) || [])) if (f && f.en) log.push(f.en);
    }
    const said = E.conclusionText(st.enc.conclusion, {});
    const doneAt = log.indexOf(DONE);
    t.ok(st.over === 'win' && st.enc.outcome === 'done' && said && said.en === CONC && doneAt >= 0 && (!wrongFirst || wrongs >= 5),
      '2 the desk ' + (wrongFirst ? 'with a wrong turn put right at every step' : 'right first time') + ': done wins; the done line logged, then the conclusion\'s named groups ' + flat({ over: st.over, outcome: st.enc.outcome, wrongs, done: doneAt >= 0 }));
    const shown = [said && said.en, log[doneAt]];
    t.ok(shown.every((x) => typeof x === 'string') && !shown.some((x) => /traveller has a room tonight|every newcomer has a room for the night/i.test(x)),
      '2 neither of the lines shown says the traveller has a room tonight ' + flat(shown));
  }

  // 3. Tokuzō's line
  {
    const cmds = C.scenes['yn.rooms_start'].cmds;
    const tk = cmds.filter((c) => c.op === 'say' && c.who === 'yn_tokuzo' && c.jp === TOKUZO_JP);
    const key = 'yn.rooms_start#' + crypto.createHash('sha256').update(TOKUZO_JP).digest('hex').slice(0, 10);
    const led = JSON.parse(fs.readFileSync(path.join(root, 'docs', 'review', 'language', 'yn.json'), 'utf8'));
    const entry = Object.entries(led).find(([k, v]) => k.startsWith('scene:yn.rooms_start#') && v.jp === TOKUZO_JP);
    t.ok(tk.length === 1 && tk[0].en === THANKS && key === 'yn.rooms_start#cae3754dd8' && entry && entry[1].en === THANKS && entry[1].status === 'self-reviewed',
      '3 Tokuzō: the same Japanese and voice key, the new English; the ledger entry the same Japanese and English ' + flat({ key, ledger: entry && entry[0] }));
  }

  // 4. after the desk, done and not done
  {
    const s = fresh();
    lines = []; encRes = () => ({ result: 'win', outcome: 'done' });
    await RB.script.run('yn.rooms_start');
    const thanks = lines.filter((l) => l.who === 'yn_tokuzo' && l.en === THANKS).length;
    t.ok(thanks === 1 && s.flags.yn_rooms_done && s.inv.yn_towel && s.inv.yn_yukata && s.quests.yn_main.stage === 3,
      '4 done: Tokuzō\'s thanks once, the room under the stairs, a towel and a yukata, yn_main at 3, as before ' + flat({ thanks, stage: s.quests.yn_main.stage }));
    const s2 = fresh();
    lines = []; encRes = () => ({ result: 'flee', outcome: null });
    await RB.script.run('yn.rooms_start');
    t.ok(!lines.some((l) => l.who === 'yn_tokuzo' && (l.en === THANKS || l.jp === TOKUZO_JP)) && !s2.flags.yn_rooms_done && !s2.flags.yn_rooms_all && !s2.inv.yn_towel && s2.quests.yn_main.stage === 2,
      '4 not done (cancelled or unfinished): no thanks, nothing given, no flag, as before');
  }
};
