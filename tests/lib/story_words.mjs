// The inscription words a player is guaranteed to know at each story foe's
// EARLIEST possible encounter, with the evidence (shared by the fairness and
// difficulty-curve tests: tests/unit/combat_fairness.test.mjs checks the
// gates that make this table true).
// word grants, in story order
export const CH1 = ['mamoru', 'iyasu', 'hikari'];   // Tsuru, Mio's bottles, Ren's lanterns: all before the mill opens (rw_mill_open)
export const MILL = [...CH1, 'mizu'];               // rw.m1_gears grants みず; beyond the gears (loft, cellar, the Echo) it is known
export const CH2 = MILL;                            // かぜ (tide) and なわ (sluice) come during the chapter
export const SLUICE = [...CH2, 'nawa'];             // sg.da_raft grants なわ; the far bank, the vault and the gated moth come after
export const CH3 = [...CH2, 'kaze', 'nawa'];
// the twelve-chapter edition's Manybridge (after Chapter 2: Saltglass has granted かぜ and なわ)
export const MB1 = CH3;
// its Chapter 4 (Blockprint and Playhouse Rows, the Understage) grants no new inscription word
export const MB2 = MB1;
export const UPPER = [...CH3, 'ishi'];              // co.upper: the foes are above the ridge that いし opens (co.upper_wall)
export const CH4 = [...CH3, 'ishi', 'tsuchi', 'koori'];
export const OBS = [...CH4, 'honoo'];               // the Star Stair only opens after ほのお (sb.stair_ice needs it)
export const CH5 = OBS;
export const KR = OBS;                              // the Keepers' Road (twelve-chapter Chapter 7) opens at ch4_done, after Snowbell; it gives no new word
export const BELL = [...CH5, 'suzu'];               // すず and Tokuji's boat to the tower come in one scene (lf.tokuji_story)
export const CH6 = [...BELL, 'koe'];

export const KNOWN_AT = {
  'rw.reedling': CH1, 'rw.dustmoth': CH1, 'rw.inkblot': MILL, 'rw.mill_echo': MILL,
  'sg.crab': CH2, 'sg.crane': CH2, 'sg.blot': CH2, 'sg.fogwisp': CH2, 'sg.letter': CH2,
  'sg.moth': SLUICE, 'sg.golem': SLUICE, 'sg.tideclerk': SLUICE,
  'co.moth': UPPER, 'co.soot': UPPER, 'co.golem': CH3, 'co.ember': CH3, 'co.warden': CH3,
  'sb.fox': OBS, 'sb.wisp': OBS, 'sb.ghost': OBS, 'sb.moth': OBS, 'sb.golem': OBS, 'sb.boss': OBS,
  'lf.stamp': CH5, 'lf.blot': BELL, 'lf.mote': BELL, 'lf.conduit': BELL, 'lf.wraith': BELL, 'lf.keeper': BELL,
  'mb.crab': MB1, 'mb.snail': MB1, 'mb.beetle': MB1, 'mb.tangle': MB1, 'mb.barge': MB1, 'mb.bridge': MB1,
  // the twelve-chapter edition's three more kinds each for Cinder Orchard and Snowbell (P10, E23): met where their
  // region's own are (the kiln and old works; the upper terraces; the observatory, after the Star Stair)
  'co.shard': CH3, 'co.mole': CH3, 'co.imp': UPPER, 'sb.bat': OBS, 'sb.hare': OBS, 'sb.starling': OBS,
  'kr.wick': KR, 'kr.sandal': KR, 'kr.chochin': KR, 'kr.moss': KR, 'kr.shadow': KR, 'kr.hyakuwa': KR,
  // Lanternfall's three more (P11, E23): the mimic and the queue in the basement stacks, the weevil in the tower
  'lf.mimic': CH5, 'lf.queue': CH5, 'lf.weevil': BELL,
  // Kotonoha (twelve-chapter Chapter 9, P11): its shore, terraces and tide pools can be reached early by the player's
  // own boat (after Snowbell: the Harbourmaster's quest), so those creatures are fair with Snowbell's words; the
  // Root Hollows' and the Gardener only in Chapter 9 itself, after Lanternfall
  'ko.leafling': OBS, 'ko.jelly': OBS, 'ko.mirror': OBS, 'ko.echo': OBS, 'ko.sandlantern': OBS, 'ko.gardener': CH6,
  // the Cloudroad (twelve-chapter Chapter 10, P12): opens once Kotonoha is done, after Lanternfall's words
  'cr.waystone': CH6, 'cr.echo': CH6, 'cr.ox': CH6, 'cr.fogporter': CH6, 'cr.packlantern': CH6, 'cr.moth': CH6, 'cr.courier': CH6,
  'mp.kuroko': MB2, 'mp.moth': MB2, 'mp.imp': MB2, 'mp.golem': MB2, 'mp.naraku': MB2,
  'sa.crane': CH6, 'sa.wraith': CH6, 'sa.ghost': CH6, 'sa.moth': CH6, 'sa.echo': CH6, 'sa.hush': CH6,
};
