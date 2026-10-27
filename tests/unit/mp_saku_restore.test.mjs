// Sakutarō before and after the Understage (Agnes 6446936604; Local CL-501, CL-502; Cloud CC-358): The Missing Lead
// Actor can be finished before or after the names come back from the Understage (mp_under_done), and two of his lines
// assumed one order. With the real runner:
//  1. the rehearsal: before the Understage, "The part's name is still blank…" (as before); after it, the part's name was
//     back in the script already and only now does he know who he plays; never the other; 178 ("…even if it never
//     comes back, I'll go on…") in both; the challenge, the quest's end and the journal as before, in both;
//  2. after the quest, in the playhouse: after the Understage, "My stage name came back too…" (as before); before it,
//     not yet, and he keeps rehearsing under his own name; never the other;
//  3. the lines kept keep their text, so their voice keys (their recordings play only where the line is true);
//  4. his first talk is as before, whichever side of the Understage.
import { createHash } from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const said = [];
  RB.ui.dialogue.say = async (l) => { said.push(l.en); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  let challenged = 0;
  RB.challenge.run = async () => { challenged++; return { ok: true }; };
  for (const k of ['dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  const journey = (flags, actor) => { const s = S.newCampaign({ edition: 2 }); s.comp = 'ren'; Object.assign(s.flags, flags || {}); if (actor) s.quests.mp_actor = actor; RB.game.G.s = s; return s; };
  const run = async (id) => { said.length = 0; challenged = 0; await RB.script.run(id); return said.slice(); };
  const BLANK = '…My voice came out. The part\'s name is still blank, but I know who I\'m playing now.';
  const BACK = '…My voice came out. The part\'s name was back in the script already, but only now do I know who I\'m playing.';
  const DECIDE = 'My stage name… even if it never comes back, I\'ll go on. As Sakutarō, my own name.';
  const CAME = 'My stage name came back too. But I had my own name printed small on the playbill as well.';
  const YET = 'My stage name hasn\'t come back yet. But I\'m keeping up rehearsals as Sakutarō, my own name.';

  // ---- 1. the rehearsal
  for (const [label, flags, want, not] of [['before the Understage', {}, BLANK, BACK], ['after it', { mp_under_done: true }, BACK, BLANK]]) {
    const s = journey(flags, { stage: 1, done: false, t: 1 });
    const L = await run('mp.saku_rehearse');
    const j = (s.journal || []).map((e) => e.en);
    t.ok(L.includes(want) && !L.includes(not) && L.includes(DECIDE) && challenged === 1 && s.quests.mp_actor.done && j.length === 1 && /own name/.test(j[0]),
      '1 the rehearsal, ' + label + ': "' + want.slice(0, 50) + '…", 178 as before, and the challenge, the quest\'s end and the journal (' + JSON.stringify({ L, challenged, q: s.quests.mp_actor, j }) + ')');
  }

  // ---- 2. after the quest, in the playhouse
  for (const [label, flags, want] of [['after the Understage', { mp_under_done: true }, CAME], ['before it', {}, YET]]) {
    journey(flags, { stage: 1, done: true, t: 2 });
    t.eq(await run('mp.saku_after'), [want], '2 after the quest, ' + label + ': one line, the one that is true');
  }

  // ---- 3. the lines kept keep their voice keys (src/audio/52_voicebank.js keyOf: scene + '#' + sha256(jp), 10)
  const key = (scene, en) => { const c = C.scenes[scene].cmds.find((x) => x.op === 'say' && x.en === en); return c ? scene + '#' + createHash('sha256').update(String(c.jp)).digest('hex').slice(0, 10) : null; };
  t.eq([key('mp.saku_rehearse', BLANK), key('mp.saku_rehearse', DECIDE), key('mp.saku_after', CAME)], ['mp.saku_rehearse#5654ef80ca', 'mp.saku_rehearse#960eefeaec', 'mp.saku_after#bb0dcf7a1e'],
    '3 the lines kept, kept to the letter (their recordings play where the line is true)');
  t.eq([key('mp.saku_rehearse', BACK), key('mp.saku_after', YET)], ['mp.saku_rehearse#11ee486242', 'mp.saku_after#1ef912af4d'], '3 the two new lines (new keys: the device voice or silence)');

  // ---- 4. his first talk, either side
  journey({}, null); const a = await run('mp.saku_first');
  journey({ mp_under_done: true }, null); const b = await run('mp.saku_first');
  t.ok(a.length >= 2 && JSON.stringify(a) === JSON.stringify(b), '4 his first talk is the same before and after the Understage (' + a.length + ' lines)');
};
