// At a routine's place, talk left from before the routine began is replaced by the routine's own line (Robin,
// 2026-10-19: back in Reedwake after Chapter 1, Oto, Mame and Kiku said their new lines "followed by their dialogue
// that is spoken during the post-bridge-repair section"). RB.town.pastTalk decides, on the real content: plain talk
// from before is replaced; a quest step, a gift, an open quest's reminder, a change beat, a line not yet heard by
// design and the town's later story still play.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, T = RB.town;
  const camp = (flags, quests) => { const s = RB.state.newCampaign({ edition: 2 }); s.id = 'rt-test'; Object.assign(s.flags, flags || {}); Object.assign(s.quests, quests || {}); RB.game.s = s; return s; };
  const slotDef = (person, map) => C.maps[map].npcs.find((n) => n.char === person && n.slotScene);
  const after = { departed: true, ch1_done: true, rw_echo_done: true };

  // Robin's three, after Chapter 1: what they said just after the bridge is replaced
  {
    const s = camp(after, { rw_boots: { stage: 9, done: true }, rw_tools: { stage: 9, done: true }, rw_crossroads: { stage: 9, done: true } });
    s.flags.rw_charm_given = true;
    for (const [person, map, scene] of [['mame', 'rw.carpenter', 'rw.mame_after'], ['oto', 'rw.village', 'rw.oto_after'], ['kiku', 'rw.village', 'rw.kiku_after']]) {
      const d = slotDef(person, map);
      t.ok(!!d, 'a routine place for ' + person + ' on ' + map);
      const o = T.talkOption(s, d);
      t.eq(o && o.scene, scene, person + ' would say ' + scene);
      t.ok(T.pastTalk(s, person, o), person + ': that line from just after the bridge is replaced by the routine\'s own');
    }
  }
  // what still plays after the routine's line
  {
    const s = camp(after, { rw_crossroads: { stage: 9, done: true } });
    const o = T.talkOption(s, slotDef('mame', 'rw.carpenter'));
    t.eq(o.scene, 'rw.mame_charm', 'Mame still has the charm to give');
    t.ok(!T.pastTalk(s, 'mame', o), 'a gift is never replaced');
  }
  {
    const s = camp(after, { rw_boots: { stage: 1 } });
    const o = T.talkOption(s, slotDef('oto', 'rw.village'));
    t.eq(o.scene, 'rw.oto_again', 'Oto\'s boots still wanted');
    t.ok(!T.pastTalk(s, 'oto', o), 'an open quest\'s reminder is not replaced');
  }
  {
    // Mame's line from just after the bridge also asks about the west crossroads' blank sign: while that quest is open,
    // the reminder is said (the whole scene); before it has begun (it begins at the sign) or once done, replaced
    const d = slotDef('mame', 'rw.carpenter');
    const open = camp(Object.assign({ rw_charm_given: true }, after), { rw_crossroads: { stage: 1 } });
    t.eq(T.talkOption(open, d).scene, 'rw.mame_after', 'Mame, the crossroads sign still blank');
    t.ok(!T.pastTalk(open, 'mame', T.talkOption(open, d)), 'an open quest\'s reminder inside a line is not replaced');
    const unbegun = camp(after);
    t.ok(T.pastTalk(unbegun, 'mame', T.talkOption(unbegun, d)), 'a quest not begun (it begins at its sign) is no reason to keep the old talk');
  }
  {
    const s = camp(Object.assign({ postgame: true }, after));
    s.flags.rw_charm_given = true;
    const o = T.talkOption(s, slotDef('mame', 'rw.carpenter'));
    t.eq(o.scene, 'rw.mame_post', 'after the story, Mame\'s own line for it');
    t.ok(!T.pastTalk(s, 'mame', o), 'lines for the town\'s later story are not replaced');
  }
  {
    const press = { if: 'beat.reedwake.press&!seen.mp.lw_rw_press_mame', scene: 'mp.lw_rw_press_mame' };
    t.ok(!!C.scenes[press.scene], 'Reedwake\'s change beat for Mame exists');
    t.ok(!T.pastTalk(camp(after), 'mame', press), 'a change beat is not replaced');
  }

  // every routine place in every town: what would be replaced is plain talk naming nothing of the routine's time
  {
    const OK = new Set(['say', 'gesture', 'faceplayer', 'look', 'prop', 'sfx', 'emote', 'wait', 'pose', 'shake', 'speakerless']);
    let places = 0, replaced = 0, kept = 0;
    const s = camp(after);
    for (const id in C.maps) for (const n of C.maps[id].npcs || []) {
      if (!n.slotScene) continue;
      places++;
      const town = Object.keys(C.towns).find((k) => (C.towns[k].residents || {})[n.char]);
      const later = [C.towns[town].after].concat(C.towns[town].care || [], ['post', 'postgame']);
      for (const o of n.talk || []) {
        if (!T.pastTalk(s, n.char, o)) { kept++; continue; }
        replaced++;
        const sc = C.scenes[o.scene];
        t.ok(sc.cmds.every((c) => OK.has(c.op)), 'only plain talk is replaced: ' + o.scene);
        t.ok(!later.some((f) => new RegExp('(^|[!&|])' + f.replace(/[.]/g, '\\.') + '($|[&|=<>!])').test(o.if || '')), 'nothing of the routine\'s time is replaced: ' + o.scene + ' [' + o.if + ']');
        t.ok(!/(^|[!&|])(beat|seen)\./.test(o.if || ''), 'no change beat or first-time line is replaced: ' + o.scene);
      }
    }
    t.ok(places > 30 && replaced > 0 && kept > 0, 'routine places checked: ' + places + ' (options replaced ' + replaced + ', kept ' + kept + ')');
  }
};
