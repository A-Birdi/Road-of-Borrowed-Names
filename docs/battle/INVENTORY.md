# Battle content inventory (battle addendum Phase A)

Generated from the game's registries by a script over the built source (the counts are the game's, not hand-kept). Used as the coverage list for the art work: every row needs a disposition (upgraded / already meets the standard and reverified / explicitly incomplete).

## Creatures (50 definitions, 20 art families)

| Enemy id | Name | Art family | Palette | Boss | Moves (pattern + phases) | Placed on | Region / bg |
|---|---|---|---|---|---|---|---|
| `atlas.bell` | The Borrowed Bell | bell | col=#7a8a6a | boss | lie, strike, rest, sweep, charge | (scripted / group / Atlas) | atlas / atlas |
| `atlas.blot` | Blotted Line | blot | col=#3a3050 |  | strike, mend, rest | (scripted / group / Atlas) | atlas / atlas |
| `atlas.cartographer` | The Blank Cartographer | atlas_cartographer |  | boss | rest, strike, plea, sweep, shroud | (scripted / group / Atlas) | atlas / atlas |
| `atlas.crab` | Rock-pool Crab | crab | col=#b89070 |  | flood, rest, strike | (scripted / group / Atlas) | atlas / atlas |
| `atlas.crane` | Unfolded Crane | crane | col=#f2ead6 |  | gust, rest, sweep | (scripted / group / Atlas) | atlas / atlas |
| `atlas.echo` | Road Echo | echo | col=#c8c0a8 |  | mirror, rest, strike | (scripted / group / Atlas) | atlas / atlas |
| `atlas.echotoll` | Echoing Gatekeeper | clerk | col=#5a6a7a |  | mirror, rest, lie, strike | (scripted / group / Atlas) | atlas / atlas |
| `atlas.fox` | Name-borrowing Fox | fox | col=#e8d0a0 |  | lie, rest, sweep | (scripted / group / Atlas) | atlas / atlas |
| `atlas.gate` | The Half-road Gatekeeper | golem | col=#8a8a78 core=#e8c070 | boss | charge, strike, plea, rest, mend | (scripted / group / Atlas) | atlas / atlas |
| `atlas.lamp` | Guttering Lantern | lantern | col=#e8a060 |  | heat, strike, rest | (scripted / group / Atlas) | atlas / atlas |
| `atlas.milestone` | Mossy Milestone | golem | col=#9a9a7a core=#c8b070 |  | charge, strike, rest | (scripted / group / Atlas) | atlas / atlas |
| `atlas.moth` | Margin Moth | moth | col=#e6dcc4 col2=#b8ac90 |  | shroud, strike, rest | (scripted / group / Atlas) | atlas / atlas |
| `atlas.mothlamp` | Moth and Lantern | lantern | col=#d8c0a0 |  | shroud, heat, strike, rest | (scripted / group / Atlas) | atlas / atlas |
| `atlas.stray` | Stray Name | wisp | col=#e8dcb0 |  | rest, strike, plea | (scripted / group / Atlas) | atlas / atlas |
| `atlas.toll` | False Gatekeeper | clerk | col=#6a5a4a |  | lie, strike, rest, charge | (scripted / group / Atlas) | atlas / atlas |
| `co.ember` | Ember Wisp | wisp | col=#f0a060 |  | heat, strike, rest | co.oldworks, co.kiln, co.kiln | cinder / kiln |
| `co.golem` | Glass Golem | golem | col=#8fb8b0 core=#f0a060 |  | charge, strike, mend, rest | co.oldworks, co.kiln | cinder / kiln |
| `co.moth` | Ash Moth | moth | col=#b8b0a8 col2=#8a827a |  | gust, strike, rest | co.upper, co.upper | cinder / cinder |
| `co.soot` | Smoke Blot | blot | col=#4a4440 |  | sweep, rest, mend, strike | co.upper, co.oldworks | cinder / cinder |
| `co.warden` | The Kiln Warden | warden |  | boss | heat, strike, plea, sweep, mirror, charge, rest | (scripted / group / Atlas) | cinder / kiln |
| `lf.blot` | Silence Blot | blot | col=#2a2848 |  | silence, strike, rest | lf.stacks, lf.tower_upper | lanternfall / belltower |
| `lf.conduit` | Conduit Spirit | lf_conduit | col=#8a90c8 |  | mend, silence, sweep, rest | lf.tower_mid, lf.tower_mid | lanternfall / belltower |
| `lf.keeper` | The Drowned Bell's Keeper | lf_keeper | col=#4a5a52 | boss | silence, strike, lie, rest, flood, plea, charge | (scripted / group / Atlas) | lanternfall / belltower |
| `lf.mote` | Hush Mote | wisp | col=#c8c4e8 |  | shroud, strike, rest | lf.tower_upper | lanternfall / belltower |
| `lf.stamp` | Consent Stamp | clerk | col=#4c4a78 |  | lie, strike, mend | lf.stacks | lanternfall / lanternfall |
| `lf.wraith` | Bell Wraith | bell | col=#3c5c8a |  | charge, sweep, silence, strike | lf.tower_low, lf.tower_low | lanternfall / belltower |
| `rw.dustmoth` | Flour Moth | moth | col=#e8e0d0 col2=#b8a888 |  | shroud, strike, rest | rw.millroad, rw.mill1 | reedwake / mill |
| `rw.inkblot` | Runoff Blot | blot | col=#2a2a44 |  | strike, mend, rest, sweep | rw.mill1, rw.mill0 | reedwake / mill |
| `rw.mill_echo` | The Mill Echo | echo | col=#a8c8d8 | boss | strike, heat, rest, mirror, plea | (scripted / group / Atlas) | reedwake / mill |
| `rw.reedling` | Reedling | wisp | col=#b8d88a |  | strike, rest, sweep | rw.millroad, rw.millroad, rw.mill0 | reedwake / reedwake |
| `sa.crane` | Paper Crane | crane | col=#f2eee2 |  | gust, strike, rest | sa.road, sa.road, sa.conduits | still / still |
| `sa.echo` | Shelved Echo | echo | col=#b8c8e0 |  | mirror, strike, mend | sa.stacks | still / still |
| `sa.ghost` | Nameless Lantern | lantern | col=#9aa8d8 |  | shroud, heat, strike, rest | sa.conduits, sa.conduits | still / still |
| `sa.hush` | The Hush | sa_hush |  | boss | silence, strike, shroud, mend, heat, gust, charge, lie, mirror, chill, plea, flood, sweep | (scripted / group / Atlas) | still / still |
| `sa.moth` | Catalogue Moth | moth | col=#e4dcc8 col2=#b8a890 |  | charge, strike, chill, rest | sa.stacks | still / still |
| `sa.wraith` | Hush Wraith | hush |  |  | silence, strike, mend, rest | sa.gate, sa.stacks, sa.stacks | still / still |
| `sb.boss` | The Lamp That Waited | sb_frostlamp |  | boss | chill, strike, rest, plea | (scripted / group / Atlas) | snowbell / observatory |
| `sb.fox` | Snow Fox | sb_snowfox |  |  | strike, rest, chill | sb.obs_path, sb.obs_path | snowbell / snowbell |
| `sb.ghost` | Lantern Ghost | lantern | col=#8ab8f0 |  | strike, lie, mend, rest | sb.obs_hall, sb.obs_gallery | snowbell / observatory |
| `sb.golem` | Icicle Warden | golem | col=#a8d4f0 core=#e8f4ff |  | charge, strike, chill, rest | sb.obs_gallery | snowbell / observatory |
| `sb.moth` | Chart Moth | moth | col=#2a3458 col2=#c8d8f0 |  | strike, mend, rest, sweep | sb.obs_charts | snowbell / observatory |
| `sb.wisp` | Frost Wisp | wisp | col=#cfe8ff |  | chill, mend, rest | sb.obs_path, sb.obs_hall, sb.obs_hall | snowbell / observatory |
| `sg.blot` | Runaway Ink | blot | col=#1e2440 |  | sweep, mend, rest | sg.da_stacks | saltglass / archive |
| `sg.crab` | Label Crab | crab | col=#c86a4a |  | strike, rest, mend | sg.road, sg.cove, sg.cove, sg.da_entry | saltglass / saltglass |
| `sg.crane` | Soggy Paper Crane | crane | col=#e4e0cc |  | shroud, strike, rest | sg.da_stacks, sg.da_stacks | saltglass / archive |
| `sg.fogwisp` | Harbour Fog | wisp | col=#c8d4e0 |  | shroud, rest, strike | sg.cove | saltglass / saltglass |
| `sg.golem` | Ledger Heap | golem | col=#8a8aa0 core=#e8e0cc |  | charge, strike, flood, rest | sg.da_sluice | saltglass / archive |
| `sg.letter` | Undelivered Letter | sg_letter |  |  | plea, rest, sweep | sg.da_reading | saltglass / archive |
| `sg.moth` | Postmark Moth | moth | col=#b0b8d0 col2=#6a7090 |  | charge, strike, rest | sg.da_sluice, sg.da_sluice | saltglass / archive |
| `sg.tideclerk` | The Tide Clerk | clerk | col=#3a5a7a | boss | strike, lie, rest, charge, flood, shroud, mirror, plea | (scripted / group / Atlas) | saltglass / archive |

## Intent kinds (rules: RB.combatLogic.INTENTS)

`strike`, `sweep`, `heat`, `shroud`, `charge`, `gust`, `mend`, `lie`, `plea`, `rest`, `flood`, `chill`, `silence`, `mirror`

## Party responses (words and their tags)

| Word id | Japanese | English | Tags |
|---|---|---|---|
| `hikari` | ひかり | light | light |
| `honoo` | ほのお | flame | fire, warm, light |
| `ishi` | いし | stone | anchor, stone |
| `iyasu` | いやす | heal, soothe | heal |
| `kaze` | かぜ | wind | wind |
| `koe` | こえ | voice | voice |
| `koori` | こおり | ice | water |
| `mamoru` | まもる | protect | ward |
| `mizu` | みず | water | water |
| `nawa` | なわ | rope | bind |
| `suzu` | すず | bell (small) | bell |
| `tsuchi` | つち | earth, soil | stone |

Card kinds besides words: `unravel`, `answer` (plea), `truth` (lie/mirror), `tech` (coordinated technique), `flee`.

## Companion support actions and techniques

- **nao**: `nao_opening` Spot the opening (opening); `nao_warn` Call out its aim (soften); `nao_hand` Lend a hand (knot); `nao_route` Seize the opening (stun); `nao_mark` Take half (share)
- **mio**: `mio_draught` Warm draught (heal); `mio_salve` Salve (heal); `mio_vapour` Clearing vapour (clear); `mio_salts` Smelling salts (salts); `mio_tonic` Right beside you (heal)
- **ren**: `ren_shade` Lamp ward (ward); `ren_flare` Flare the lamp (clear); `ren_vigil` Keep watch (ward); `ren_lanterns` Raise the lamps (clear); `ren_chime` Stand in front (ward)
- **suzu**: `suzu_heckle` Heckle (heckle); `suzu_eye` Draw its eye (draw); `suzu_encore` Encore (harmony); `suzu_feint` On her own cue (stun); `suzu_finale` Grand gesture (drawAll)

## Pets

`cat`, `dog`, `bird`, `tanuki`

## Battle effects (RB.battleFx.fx) and status marks

`thread`, `loosen`, `knotRelease`, `sealForm`, `sealBlock`, `sealStrip`, `motes`, `splash`, `flash`, `mistPart`, `wind`, `rope`, `scatter`, `stone`, `warm`, `rings`, `note`, `lens`, `dart`, `arc`, `gust`, `impact`, `frost`, `miss`, `fizzle`, `embers`, `mistRoll`, `gather`, `mendThread`, `hushWave`, `pane`, `link`, `drop`, `release`, `lift`

Status: `heat`, `shroud`, `charge`, `hush`, `wards`, `harmony`, `target`, `preview`, `support`

## Creature motion styles (fallback presentation)

moth→flutter, crane→flutter, sg_letter→flutter, wisp→drift, hush→drift, spirit→drift, atlas_cartographer→drift, lantern→sway, sb_frostlamp→sway, lf_conduit→sway, echo→pulse, sa_hush→pulse, blot→ripple, golem→lurch, warden→lurch, lf_keeper→lurch, clerk→stamp, bell→swing, fox→pounce, sb_snowfox→pounce, crab→scuttle

## Backdrop keys used

reedwake, mill, saltglass, archive, cinder, kiln, snowbell, observatory, belltower, lanternfall, still, atlas
