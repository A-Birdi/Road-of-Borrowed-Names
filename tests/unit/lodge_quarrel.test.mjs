// RBN-QA-063 (option C′; Agnes 6313310257): after a quarrel at the Keepers' Lodge your companion does not walk with
// you at the lodge, in Hisae's hut or the caretakers' room until they come back to make it up. A follower-only map rule
// (followerAway, read by RB.world.placeCompanion only): the party, the pet's rule (companionHere) and Ren's night
// apart (noCompanion '!kr_apart') are untouched; the departure lines are followed by `!refresh comp`, and kr.makeup
// brings them back (kr_quarrel_back) before the apology. Browser: tests/e2e/lodge_quarrel.mjs.
import fs from 'node:fs';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content;
  const Q = 'kr_quarrel&!kr_makeup_done&!kr_quarrel_back';
  const ops = (id) => (C.scenes[id] ? C.scenes[id].cmds : []).map((c) => c.op + ':' + (c.args || []).join(' '));
  const st = (flags) => { const s = RB.state.newCampaign({ edition: 2 }); s.comp = 'suzu'; for (const f of flags) s.flags[f] = true; return s; };

  // the maps: only the three lodge maps, beside their unchanged noCompanion
  const withRule = Object.keys(C.maps).filter((id) => C.maps[id].followerAway != null).sort();
  t.eq(withRule, ['kr.hisae', 'kr.lodge', 'kr.lodge_in'], 'only the lodge, Hisae\'s hut and the caretakers\' room carry followerAway');
  for (const id of withRule) t.ok(C.maps[id].followerAway === Q && C.maps[id].noCompanion === '!kr_apart', id + ': the quarrel\'s condition, beside the unchanged !kr_apart');

  // the condition, over the states it meets
  for (const [flags, away, why] of [
    [[], false, 'no quarrel'],
    [['kr_quarrel'], true, 'after the departure line'],
    [['kr_quarrel', 'kr_quarrel_back'], false, 'come back for the apology'],
    [['kr_quarrel', 'kr_quarrel_back', 'kr_makeup_done'], false, 'made up'],
    [['kr_quarrel', 'kr_makeup_done'], false, 'a save made up before this rule (no kr_quarrel_back)'],
    [['kr_makeup_done'], false, 'the quiet branch'],
    [['kr_apart'], false, 'Ren\'s night apart (his own rule, noCompanion)'],
  ]) {
    const s = st(flags);
    t.ok(RB.state.test(s, Q) === away, why + ': ' + (away ? 'away' : 'with you') + ' at the lodge');
    // the pet and everything else read companionHere, which this rule does not touch
    for (const id of withRule) t.ok(RB.world.companionHere(s, C.maps[id]) === !flags.includes('kr_apart'), why + ': ' + id + ': companionHere as before');
  }

  // the scenes: each departure line, then the flag and the follower read again; Ren's evening unchanged
  for (const id of ['kr.nao_evening', 'kr.mio_evening', 'kr.suzu_evening']) {
    const o = ops(id), i = o.indexOf('set:kr_quarrel');
    t.ok(i > 0 && o[i - 1].startsWith('say:') && o[i + 1] === 'refresh:comp' && o.filter((x) => x === 'refresh:comp').length === 1, id + ': the departure line, !set kr_quarrel, then !refresh comp (once)');
  }
  const ren = ops('kr.ren_evening');
  t.ok(ren.includes('set:kr_apart') && !ren.includes('refresh:comp') && !ren.includes('set:kr_quarrel'), 'kr.ren_evening: unchanged (kr_apart; no quarrel, no refresh)');
  const mk = ops('kr.makeup'), firstSay = mk.findIndex((x) => x.startsWith('say:'));
  t.ok(mk[0] === 'if:kr_makeup_done -> end' && mk[1] === 'set:kr_quarrel_back' && mk[2] === 'refresh:comp' && firstSay > 2, 'kr.makeup: after its guard, kr_quarrel_back and !refresh comp, before the apology');
  t.ok(mk.includes('set:kr_makeup_done'), 'kr.makeup: still ends made up');
  // nothing else uses the new flag or the opt-in refresh
  const uses = Object.keys(C.scenes).filter((id) => ops(id).some((x) => x === 'refresh:comp' || x === 'set:kr_quarrel_back')).sort();
  t.eq(uses, ['kr.makeup', 'kr.mio_evening', 'kr.nao_evening', 'kr.suzu_evening'], 'the opt-in refresh and kr_quarrel_back appear in these four scenes only');

  // the engine: placeCompanion reads the rule; companionHere does not; `!refresh comp` places the follower again
  const world = fs.readFileSync(new URL('../../src/engine/50_world.js', import.meta.url), 'utf8');
  const script = fs.readFileSync(new URL('../../src/engine/70_script.js', import.meta.url), 'utf8');
  const here = world.slice(world.indexOf('function companionHere'), world.indexOf('function placeCompanion'));
  const place = world.slice(world.indexOf('function placeCompanion'), world.indexOf('function refreshActors'));
  t.ok(!/followerAway/.test(here.replace(/\/\/.*$/gm, '')) && /d\.followerAway && RB\.state\.test\(s\(\), d\.followerAway\)/.test(place), 'placeCompanion reads followerAway; companionHere does not');
  t.ok(/else if \(a\[0\] === 'comp'\) RB\.world\.placeCompanion\(\{ near: true \}\); else RB\.world\.refreshActors\(\);/.test(script), '`!refresh comp` places the follower again, beside you if not behind; a plain `!refresh` is unchanged');
  // a map's entry keeps behind-or-your-tile; only o.near (`!refresh comp`) looks beside and ahead
  t.ok(/if \(o && o\.near\) tries\.push\(/.test(place) && (world.match(/placeCompanion\(\{ near: true \}\)/g) || []).length === 0, 'the nearer places are `!refresh comp`\'s only; every placeCompanion() in the world itself is a map\'s entry as before');
};
