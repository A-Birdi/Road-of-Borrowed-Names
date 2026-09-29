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
export const UPPER = [...CH3, 'ishi'];              // co.upper: the foes are above the ridge that いし opens (co.upper_wall)
export const CH4 = [...CH3, 'ishi', 'tsuchi', 'koori'];
export const OBS = [...CH4, 'honoo'];               // the Star Stair only opens after ほのお (sb.stair_ice needs it)
export const CH5 = OBS;
export const BELL = [...CH5, 'suzu'];               // すず and Tokuji's boat to the tower come in one scene (lf.tokuji_story)
export const CH6 = [...BELL, 'koe'];

export const KNOWN_AT = {
  'rw.reedling': CH1, 'rw.dustmoth': CH1, 'rw.inkblot': MILL, 'rw.mill_echo': MILL,
  'sg.crab': CH2, 'sg.crane': CH2, 'sg.blot': CH2, 'sg.fogwisp': CH2, 'sg.letter': CH2,
  'sg.moth': SLUICE, 'sg.golem': SLUICE, 'sg.tideclerk': SLUICE,
  'co.moth': UPPER, 'co.soot': UPPER, 'co.golem': CH3, 'co.ember': CH3, 'co.warden': CH3,
  'sb.fox': OBS, 'sb.wisp': OBS, 'sb.ghost': OBS, 'sb.moth': OBS, 'sb.golem': OBS, 'sb.boss': OBS,
  'lf.stamp': CH5, 'lf.blot': BELL, 'lf.mote': BELL, 'lf.conduit': BELL, 'lf.wraith': BELL, 'lf.keeper': BELL,
  'sa.crane': CH6, 'sa.wraith': CH6, 'sa.ghost': CH6, 'sa.moth': CH6, 'sa.echo': CH6, 'sa.hush': CH6,
};
