/* The art pass's creature drawings (expansion P16b; AC-1, C-82). The creatures drawn in the interim on a borrowed
 * family with their own palette (F-36, F-93, F-104, F-135) are drawn now by their own families on the creature kit
 * (src/ui/78u_creature_kit.js, 78v_kit_*.js). This list moves each one onto its drawing and records it in the audit
 * register as upgraded; its palette (artOpts) and everything about how it fights stay as they were. A creature whose
 * drawing is not loaded keeps its interim one. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const OWN = {
    'mb.snail': 'mb_snail', 'mb.beetle': 'mb_beetle', 'mb.tangle': 'mb_tangle', 'mb.barge': 'mb_barge', 'mb.bridge': 'mb_bridge',
    'mp.kuroko': 'mp_kuroko', 'mp.imp': 'mp_imp', 'mp.naraku': 'mp_naraku',
    'kr.sandal': 'kr_sandal', 'kr.moss': 'kr_moss', 'kr.shadow': 'kr_shadow', 'kr.hyakuwa': 'kr_hyakuwa',
    'lf.mimic': 'lf_mimic', 'lf.queue': 'lf_queue', 'lf.weevil': 'lf_weevil', 'sb.bat': 'sb_bat', 'sb.starling': 'sb_starling',
    'co.shard': 'co_shard', 'co.mole': 'co_mole',
    'ko.leafling': 'ko_leafling', 'ko.jelly': 'ko_jelly', 'ko.mirror': 'ko_mirror', 'ko.echo': 'ko_echo', 'ko.gardener': 'ko_gardener',
    'yn.steamwisp': 'yn_steamwisp', 'yn.pebbles': 'yn_pebbles', 'yn.toad': 'yn_toad', 'yn.lostguest': 'yn_lostguest', 'yn.towelthief': 'yn_towelthief',
    'yn.chochin': 'yn_chochin', 'yn.kettle': 'yn_kettle',
    'gd.founder': 'gd_founder', 'gd.headoffice': 'gd_headoffice', 'gd.firstfire': 'gd_firstfire', 'gd.sisterstar': 'gd_sisterstar', 'gd.maker': 'gd_maker',
    'gd.bridgefounder': 'gd_bridgefounder', 'gd.oxelder': 'gd_oxelder', 'gd.kettlemother': 'gd_kettlemother', 'gd.firstkeeper': 'gd_firstkeeper',
    'cr.waystone': 'cr_waystone', 'cr.echo': 'cr_echo', 'cr.ox': 'cr_ox', 'cr.fogporter': 'cr_fogporter', 'cr.moth': 'cr_moth', 'cr.courier': 'cr_courier',
  };
  C.creaturesC = OWN;
  const FROM = (C.creaturesCFrom = {}); // the family each was drawn on in the interim
  const EA = RB.enemyArt, A = RB.creaturesA;
  if (!EA || !A) return;
  for (const [id, art] of Object.entries(OWN)) {
    const e = C.enemies[id];
    if (!e || !EA.P[art]) continue;
    FROM[id] = e.art;
    e.art = art;
    // its figure on the map: the same drawing at rest, at the map's scale
    if (RB.sprites && RB.sprites.customArt && RB.creatureKit && RB.creatureKit.overworld) {
      const key = 'kit:' + art;
      const fig = RB.creatureKit.overworld(art, e.artOpts || {});
      RB.sprites.customArt[key] = fig;
      if (RB.sprites.custom) RB.sprites.custom[key] = fig.small;
      e.look = Object.assign({}, e.look || {}, { custom: key });
    }
    A.auditEnemy(id, art, 'upgraded', 'its own drawing on the creature kit (P16b, src/ui/78u_creature_kit.js): ' + ((RB.creatureKit && RB.creatureKit.DEFS[art] && RB.creatureKit.DEFS[art].audit && RB.creatureKit.DEFS[art].audit.anatomy) || art));
  }
})(RB.content);
