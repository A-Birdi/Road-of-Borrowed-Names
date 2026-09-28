// No story foe uses a move before the player can answer it (spec §7: "Bosses
// should test combinations of ideas already introduced, with new mechanics
// taught safely"; docs/AGENT_COMMON.md: "Use only words the player can know
// by then").
//
// KNOWN_AT records, for every story foe, the inscription words the player is
// guaranteed to have at its EARLIEST possible encounter, with the evidence.
// A new foe must be added here (the test fails otherwise). The gates that
// make the table true are checked below as well.
import { load } from '../lib/load.mjs';

// word grants, in story order
const CH1 = ['mamoru', 'iyasu', 'hikari'];   // Tsuru, Mio's bottles, Ren's lanterns: all before the mill opens (rw_mill_open)
const MILL = [...CH1, 'mizu'];               // rw.m1_gears grants みず; beyond the gears (loft, cellar, the Echo) it is known
const CH2 = MILL;                            // かぜ (tide) and なわ (sluice) come during the chapter
const SLUICE = [...CH2, 'nawa'];             // sg.da_raft grants なわ; the far bank, the vault and the gated moth come after
const CH3 = [...CH2, 'kaze', 'nawa'];
const UPPER = [...CH3, 'ishi'];              // co.upper: the foes are above the ridge that いし opens (co.upper_wall)
const CH4 = [...CH3, 'ishi', 'tsuchi', 'koori'];
const OBS = [...CH4, 'honoo'];               // the Star Stair only opens after ほのお (sb.stair_ice needs it)
const CH5 = OBS;
const BELL = [...CH5, 'suzu'];               // すず and Tokuji's boat to the tower come in one scene (lf.tokuji_story)
const CH6 = [...BELL, 'koe'];

const KNOWN_AT = {
  'rw.reedling': CH1, 'rw.dustmoth': CH1, 'rw.inkblot': MILL, 'rw.mill_echo': MILL,
  'sg.crab': CH2, 'sg.crane': CH2, 'sg.blot': CH2, 'sg.fogwisp': CH2, 'sg.letter': CH2,
  'sg.moth': SLUICE, 'sg.golem': SLUICE, 'sg.tideclerk': SLUICE,
  'co.moth': UPPER, 'co.soot': UPPER, 'co.golem': CH3, 'co.ember': CH3, 'co.warden': CH3,
  'sb.fox': OBS, 'sb.wisp': OBS, 'sb.ghost': OBS, 'sb.moth': OBS, 'sb.golem': OBS, 'sb.boss': OBS,
  'lf.stamp': CH5, 'lf.blot': BELL, 'lf.mote': BELL, 'lf.conduit': BELL, 'lf.wraith': BELL, 'lf.keeper': BELL,
  'sa.crane': CH6, 'sa.wraith': CH6, 'sa.ghost': CH6, 'sa.moth': CH6, 'sa.echo': CH6, 'sa.hush': CH6,
};
// answered by a built-in response (See through, Answer) or nothing to answer
const BUILT_IN = new Set(['lie', 'plea', 'mirror', 'rest']);

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, L = RB.combatLogic;
  const kinds = (e) => new Set([...(e.pattern || ['strike', 'rest']), ...(e.phases || []).flatMap((p) => p.pattern)].map((k) => k.split(':')[0]));
  const answerable = (kind, words) => BUILT_IN.has(kind) || words.some((w) => (C.words[w].tags || []).some((tg) => L.INTENTS[kind].counters.indexOf(tg) >= 0));

  for (const id of Object.keys(C.enemies).filter((x) => !x.startsWith('atlas.'))) {
    const known = KNOWN_AT[id];
    t.ok(!!known, id + ' is in the fairness table (add it with the words known at its first encounter)');
    if (!known) continue;
    for (const k of kinds(C.enemies[id])) t.ok(answerable(k, known), `${id}: its ${L.INTENTS[k].label} can be answered with what is known by then (${known.join(', ')})`);
  }
  // the Unwritten Atlas opens after the ending: every word is known there
  for (const id of Object.keys(C.enemies).filter((x) => x.startsWith('atlas.'))) {
    for (const k of kinds(C.enemies[id])) t.ok(answerable(k, CH6), `${id}: ${k} is answerable in the Atlas`);
  }

  // ---- the gates the table relies on --------------------------------------------------------
  const ops = (sc) => (C.scenes[sc] ? C.scenes[sc].cmds : []);
  const idx = (sc, pred) => ops(sc).findIndex(pred);
  t.ok(idx('rw.m1_gears', (c) => c.op === 'word' && c.args[0] === 'mizu') >= 0, 'みず is learned when the mill gears turn (rw.m1_gears)');
  const w = idx('rw.m1_boss', (c) => c.op === 'word' && c.args[0] === 'mizu');
  const b = idx('rw.m1_boss', (c) => c.op === 'battle' && c.args[0] === 'rw.mill_echo');
  t.ok(w >= 0 && b > w, 'the Echo scene makes sure みず is known before the fight (older saves past the gears)');
  t.ok(!(C.enemies['rw.mill_echo'].reward && (C.enemies['rw.mill_echo'].reward.words || []).includes('mizu')), 'みず is no longer only a reward for beating the Echo');
  const foeIf = (map, fid) => ((C.maps[map].foes || []).find((f) => f.id === fid) || {}).if || '';
  t.ok(/word\.nawa/.test(foeIf('sg.da_sluice', 'm2')), 'the sluice moth on the near bank waits for なわ');
  for (const fid of ['m1', 'g1']) t.ok((C.maps['sg.da_sluice'].foes.find((f) => f.id === fid) || {}).y < 8, 'sg.da_sluice ' + fid + ' is on the far bank (after the raft)');
  t.ok(/word\.suzu/.test(foeIf('lf.stacks', 'st2')), 'the stacks blot (Hush) waits for すず or こえ');
  const s = RB.state.newCampaign({});
  s.words = [...CH2];
  t.ok(!RB.state.test(s, foeIf('sg.da_sluice', 'm2')), 'the sluice moth is absent before なわ');
  s.words = [...SLUICE];
  t.ok(RB.state.test(s, foeIf('sg.da_sluice', 'm2')), 'the sluice moth appears once なわ is known');
  s.words = [...CH5];
  t.ok(!RB.state.test(s, foeIf('lf.stacks', 'st2')), 'the stacks blot is absent before すず');
  s.words.push('suzu');
  t.ok(RB.state.test(s, foeIf('lf.stacks', 'st2')), 'the stacks blot appears once すず is known');
  for (const [cid, fid] of [['co.upper', 'm1'], ['co.upper', 'm2']]) {
    const f = C.maps[cid].foes.find((x) => x.id === fid);
    t.ok(f && f.y < 22, cid + ' ' + fid + ' (Gust) is above the ridge that いし opens (y 22)');
  }
  t.ok((C.maps['sb.hamlet'].exits || []).some((e) => e.to === 'sb.obs_path' && /sb_stair_open/.test(e.if || '')), 'the Star Stair (chill foes) opens only with sb_stair_open');
};
