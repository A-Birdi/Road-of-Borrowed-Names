// The Inn That Lost Its Guest Book (Agnes 6532997433, 6533320027; Local CL-525, CL-526; Cloud CC-376 §3): the guide named
// the guest books' table at the Courier's Inn "the workbench", the noun of every prop of its type; the scene itself
// calls it a table. In node:
//  1. the noun: only that table carries one of its own (机, "the table"); every other table keeps its type's noun, a
//     genuine workbench (Bunta's) included;
//  2. the guide before the pickup: the table in The Courier's Inn, in the "Next:" line and in both nudges, Japanese and
//     English, and never "workbench";
//  3. after the pickup: Otaki at Nakayama, in the same lines;
//  4. with the real runner: the table gives the book and moves the quest on; Otaki takes it back and the quest is done,
//     once.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, G = RB.questGuide;
  const table = C.maps['cr.saka_inn'].props.find((p) => p.scene === 'cr.guestbook');
  const bench = C.maps['rw.carpenter'].props.find((p) => p.p === 'table' && p.scene === 'rw.bench_tools');
  const flat = (x) => JSON.stringify(x);

  // ---- 1. the noun
  const owners = [];
  for (const [m, d] of Object.entries(C.maps)) for (const p of d.props || []) if (p.noun) owners.push(m + ':' + p.p + '@' + p.x + ',' + p.y);
  t.eq(owners, ['cr.saka_inn:table@8,3'], '1 only the guest books\' table has a noun of its own');
  t.eq([G.nameOf({ kind: 'prop', p: table.p, def: table }), G.nameOf({ kind: 'prop', p: bench.p, def: bench }), G.nameOf({ kind: 'prop', p: 'table' })],
    [{ jp: '{机|つくえ}', en: 'the table' }, { jp: '{台|だい}', en: 'the workbench' }, { jp: '{台|だい}', en: 'the workbench' }],
    '1 the guest books\' table is "the table"; Bunta\'s workbench and any other table keep "the workbench"');

  // ---- 2 and 3. the guide's words, before and after the pickup
  const journey = (k) => {
    G.reset();
    const s = S.newCampaign({ edition: 2 }); s.comp = 'nao'; s.map = 'cr.nakayama'; s.x = 10; s.y = 10;
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, cr_arrived: true, cr_st3: true, cr_st4: true, cr_guest_started: true });
    if (k === 1) { s.flags.cr_guest_found = true; s.inv.cr_guestbook = 1; }
    s.quests.cr_guest = { stage: k, done: false, t: 1 }; s.follow = 'cr_guest';
    RB.game.G.s = s; RB.game.s = s;
    return s;
  };
  let s = journey(0);
  let r = G.targets('cr_guest', s);
  const next0 = G.nextLines(r), nudge0 = G.nudges('cr_guest', s).lines;
  t.ok(r.targets.length === 1 && r.targets[0].map === 'cr.saka_inn' && r.targets[0].p === 'table' &&
    next0.length === 1 && /^Next: the table, in The Courier's Inn/.test(next0[0].en) && next0[0].jp.indexOf('{飛脚宿|ひきゃくやど} の {机|つくえ}') >= 0 &&
    nudge0[0].some((l) => l.en === 'Look for the table in The Courier\'s Inn.' && l.jp.indexOf('{机|つくえ} を {探|さが}そう') >= 0) &&
    nudge0[1].some((l) => /^Take a look at the table in The Courier's Inn\./.test(l.en) && l.jp.indexOf('{机|つくえ} を {見|み}て みよう') >= 0) &&
    !/workbench|\{台\|だい\}/.test(flat(next0) + flat(nudge0)),
  '2 before the pickup: the table, in The Courier\'s Inn, in "Next:" and both nudges (' + flat({ next0, nudge0 }) + ')');

  s = journey(1);
  r = G.targets('cr_guest', s);
  const next1 = G.nextLines(r), nudge1 = G.nudges('cr_guest', s).lines;
  t.ok(r.targets.length >= 1 && r.targets.every((x) => x.kind === 'npc' && x.id === 'cr_otaki') && next1.some((l) => /^Next: Otaki, in /.test(l.en)) &&
    nudge1[0].some((l) => /^Look for Otaki in /.test(l.en)) && !/the table|workbench/.test(flat(next1) + flat(nudge1)),
  '3 after the pickup: Otaki, in "Next:" and the nudges (' + flat({ next1, nudge1 }) + ')');

  // ---- 4. the real runner: the pickup, then the return
  const toasts = [];
  RB.ui.dialogue.say = async () => {};
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async (o) => { toasts.push(o.kind + ':' + o.en); };
  RB.ui.shake = () => {};
  RB.challenge.run = async () => ({ ok: true });
  for (const k of ['dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  s = journey(0);
  await RB.script.run('cr.guestbook');
  const picked = { stage: s.quests.cr_guest.stage, book: s.inv.cr_guestbook || 0, found: !!s.flags.cr_guest_found };
  await RB.script.run('cr.guest_settle');
  const DONE = 'quest_done:The Inn That Lost Its Guest Book';
  t.ok(picked.stage === 1 && picked.book === 1 && picked.found && s.quests.cr_guest.done && (s.inv.cr_guestbook || 0) === 0 && toasts.filter((x) => x === DONE).length === 1,
    '4 the table gives the book (stage 1); Otaki takes it back and the quest is done, once (' + flat({ picked, q: s.quests.cr_guest, book: s.inv.cr_guestbook, toasts }) + ')');
};
