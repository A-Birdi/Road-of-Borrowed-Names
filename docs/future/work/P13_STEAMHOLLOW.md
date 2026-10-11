# P13 · Steamhollow, Chapter 11

*Playbook P13; plan [07_REGIONS.md](../plan/07_REGIONS.md) R3, [08_CULTURE.md](../plan/08_CULTURE.md) C13 (hot-spring
customs), C14 (stepping into a quarrel), C16 (apologies), [03_ENCOUNTERS.md](../plan/03_ENCOUNTERS.md) E6, E8
(mediation), E17, E26 and the 全体 growth, [04_DUNGEONS.md](../plan/04_DUNGEONS.md) A11 (connected airflow), D2 (hot
pools), [14_COMPANIONS.md](../plan/14_COMPANIONS.md) (Mio's and Suzu's crossroads and nights apart; Nao's and Ren's
quarrel made up the same evening), [10_STORY.md](../plan/10_STORY.md) §8, sealed notes S3, S4, S14, S15 (the lead's
reading; nothing of the last chapter is shown early). Authorised by C-81; art under C-82
([AC1_ART.md](../plan/AC1_ART.md)). Twelve-chapter journeys only (`ed>=2`, prefix `yn`, done flag `yn_done`); the
six-chapter game is unchanged.*

## The chapter in one paragraph

Down from the Cloudroad Pass, a path through steaming rock drops into a crowded valley of inns: Steamhollow
(湯ノ谷). It is loud and warm, the last such place before the end, and full: travellers who cannot say why they came,
people come down from villages above where nobody speaks any more (S15: the mountain above is soundless). The valley's
two great inns, the Upper House (上の湯) and the Lower House (下の湯), share one spring, and they have begun to quarrel
over it, with the bath-keepers' guild caught between; every time the town argues, the ground shudders and the water
runs too hot, then too cold. The party arranges things with people: rooms for the newcomers, house rules learned from
signs and staff (each inn's are different), requests and polite refusals, a complaint, a persistent seller of cures.
Below the town, in the Steam Vents, the spring's old spirit, the Kettle Below (釜の主), is more frightened than angry:
the quarrel above and the silence from the ridge are pressing on it from both sides. It is settled, not defeated.
Then the party brings the two houses, the guild and the spring to an arrangement in writing that keeps their
disagreement honest (S4), and the valley agrees as a whole (全体, the chapter's growth). Mio's and Suzu's crossroads
happen here; Nao and Ren have a short quarrel with the player over the mediation and make it up the same evening. The
chapter ends with a vow, and the road north out of the valley to the Last Lamp Hut, where the last chapter begins as
it always has.

## The valley (sealed S3)

The Cloudroad Pass's way down north-east opens with this chapter (`cr_done`). The valley's north road climbs to the
Archive road's camp and the Last Lamp Hut (`yn_done`); the north fork above the Lantern Road opens at the same time
(F-69, unchanged). The last chapter's opening plays wherever the party first reaches the Archive road.

## Plan

| Item | Source | Where | Status |
|---|---|---|---|
| The way down from the pass; the valley's maps (the descent, the upper and lower town, the bridge and the market, the river terraces, the north road), interiors (the two inns' lobbies and baths, the dispensary, the guild hall, the playhouse) | R3 | `src/content/yn/` | Planned (P13a) |
| Region, palette (cedar and lacquer, steam white, sulphur yellow, persimmon dusk), place, zones, music (koto and shamisen, geta on stone, a deep drone for the vents) | R3 | `src/content/yn/`, `src/audio` | Planned (P13a) |
| Rooms for the newcomers: reservations with conflicting needs, a change, a polite refusal (A44, A46) | R3 | an activity on the encounter platform | Planned (P13b) |
| House rules from signs and staff, different at each inn (A42); real customs labelled | R3, C13 | challenges, scenes | Planned (P13b) |
| The baths follow pronouns (C-56): she/her the women's, he/him the men's, they/them and custom choose once (men's, women's or the reserved bath, 貸切風呂) and the choice is kept; Nao and Ren choose in character; towel-wrapped, nonsexual; the partition talk; a comfort setting (shown / summarised) | R3, C13, C-56 | scenes, settings | Planned (P13b) |
| Steam cooking (温泉卵, steamed buns): follow a recipe card, no timer | R3 | an activity | Planned (P13b) |
| The persistent seller of cures: the polite-refusal training ground, and Mio's honest rejection of a fraud (S4) | R3, C14, S4 | social encounter | Planned (P13c) |
| A guest complaint | R3 | social encounter | Planned (P13c) |
| The Steam Vents: connected airflow (open a vent, the steam shifts elsewhere), hot pools that restore a little and run cool after use, checkpoints | R3, A11, D2 | `src/content/yn/` | Planned (P13d) |
| The Kettle Below (釜の主): settled, not defeated | R3, S4 | encounter | Planned (P13d) |
| The mediation: the Upper House, the Lower House, the guild and the spring; several authored conclusions, some preserving disagreement; the written agreement the player helps word (A17) | R3, E8, S4 | social encounter | Planned (P13e) |
| 全体 taught in the story: a valley that has to agree as a whole | 03_ENCOUNTERS growth | story scene | Planned (P13e) |
| Creatures: Steam Wisp, Pebble Stack, Towel Thief (protect), Sulphur Toad, Lost Guest, one more; a wanderer (a bath-keeper) | R3 | interim art (F-36) | Planned (P13f) |
| Side quests: The Masseur's Lost Words, A Wedding Party's Booking, The Retired Actor, Eggs for Everyone, The Footbath Poet (a short-story room, A38) | R3 | `src/content/yn/` | Planned (P13f) |
| Companions: Mio's crossroads (Kikue's dispensary) and night apart; Suzu's crossroads (the troupe, Koume, the books shown openly) and night apart; Nao's and Ren's quarrel made up the same evening (an apology scene, C16); a bath scene, an evening walk in yukata, a quiet confession per companion | 14_COMPANIONS, S4, S14 | scenes | Planned (P13g) |
| Records: chapter stamps and stand; illustrations for P16 | K1 | records | Planned (P13g) |
| Tests: unit; browser (reservations, the bath choice and its comfort setting, cooking, the vents, the mediation); the route through Chapter 11 | playbook P13 | `tests/` | Planned |

## Rules kept

- Warm and funny, never voyeuristic: towel-wrapped, nonsexual, adults only (spec line 72).
- The baths follow the player's pronouns (never a gender); they/them and custom pronouns choose once and the game keeps
  it; companions who are they/them choose in character and are never assigned.
- Real customs labelled as real; the valley, its inns and its people are fiction. Hot springs vary by place, and the
  game says so.
- The mediation preserves disagreement; no conclusion is "defeat". The Kettle Below is settled, not beaten.
- A quarrel never lowers Bond; making up is a Bond event, and its apologies are language the player learns.
- Every line of new Japanese through the review ledger (self-review only).
