# P12 · The Cloudroad, Chapter 10

*Playbook P12; plan [07_REGIONS.md](../plan/07_REGIONS.md) R2, [08_CULTURE.md](../plan/08_CULTURE.md),
[03_ENCOUNTERS.md](../plan/03_ENCOUNTERS.md) E6–E8, E17, E26, [14_COMPANIONS.md](../plan/14_COMPANIONS.md) (Nao's
crossroads and night apart; Mio's, Ren's and Suzu's Chapter 10 steps), [10_STORY.md](../plan/10_STORY.md) §8 (staying
behind); sealed notes S3, S14 (the lead's reading; nothing of a later chapter is shown). ごとに (Chapter 10, "station by
station") is this chapter's growth. Authorised by C-81; art under C-82 ([AC1_ART.md](../plan/AC1_ART.md)).
Twelve-chapter journeys only (`ed>=2`); the six-chapter game is unchanged.*

## The chapter in one paragraph

Back on the mainland after Kotonoha, a relay runner meets the party with a message from Lanternfall's council,
passed mouth to mouth down the coast and half lost on the way: something about the old highway and its lanterns.
At Lanternfall, Yae says it properly. Above the Lantern Road the old high highway climbs north-east over the
mountains, the way the torn-page leaves came: the Cloudroad (雲路), seven post stations rising into cloud. In the
old days relay couriers carried the post station to station and kept the names on the road's lanterns fresh. The
last courier never arrived, and since then every station tells it differently. Now the lanterns fail one by one,
and the messages that still pass between stations arrive garbled. The party climbs station by station. At each
board they weigh what people saw, heard and supposed about the road ahead (〜そうだ・〜らしい・〜ようだ・〜と言っていた)
and choose the next leg; they carry messages along the relay, repeating each with the certainty they actually have;
they relight each station's lantern. At the last lit station below the checkpoint an old courier keeps the post.
At the Mist Barrier (霧の関) the travel papers are blank where the Hush has been; the keeper hears them out in formal
speech and, by an old and gentle custom, keeps one traveller as surety while the other fetches proof from the
station above. Then the High Pass and the Courier's Hut, where the Courier Who Never Arrived still runs a message
whose sender and recipient everyone has forgotten. The party works out which of its changing accounts holds up, and
the message is delivered at last. From the pass the cloud sea opens, and far below in a valley, steam.

## The road (sealed S3, option 1)

The Cloudroad is a different road from the Archive's: the old high highway from Lanternfall over the northern
mountains. It leaves the Lantern Road at its east end, above the town (a new way, `ed>=2&ko_done`), and climbs to the
High Pass. Over the pass lies Steamhollow's valley (Chapter 11, P13); beyond it the highway meets the existing road
at the Last Lamp Hut, where Chapter 12 (the old Chapter 6) begins as it always has. The north fork above the Lantern
Road stays in mist until Steamhollow is behind the party (F-69, unchanged).

| | Station | Reading | Who keeps it | What happens there |
|---|---|---|---|---|
| 1 | 麓宿 | ふもとじゅく, Fumoto | the relay master; an innkeeper | the relay explained; the first board; the first lantern relit; the Seven Seals start |
| 2 | 杉ノ木宿 | すぎのきじゅく, Suginoki | a teahouse; porters | the cedar avenue; the first carried message |
| 3 | 坂下宿 | さかしたじゅく, Sakashita | the inn of the last courier's family | the stories of the last courier begin to disagree |
| 4 | 中山宿 | なかやまじゅく, Nakayama | two rival inns; the mapmaker | the inns' dispute over a guest; the wrong map |
| 5 | 馬返し宿 | うまがえしじゅく, Umagaeshi | the pack-horse station | where horses turn back; the ledge |
| 6 | 霧下宿 | きりしたじゅく, Kirishita | Sakichi, an old courier | the last lit station below the checkpoint |
| — | 霧の関 | きりのせき, the Mist Barrier | the checkpoint keeper | papers, the interview, surety |
| 7 | 雲居宿 | くもいじゅく, Kumoi | the station above the cloud | proof for the papers; the way to the pass |
| — | 雲路峠 | くもじとうげ, the High Pass | | the dungeon; the Courier's Hut at the top |

## Plan

| Item | Source | Where | Status |
|---|---|---|---|
| Chapter 10's call after Kotonoha: a garbled relayed message on landing, Yae's first-hand account at Lanternfall; the Lantern Road's way up onto the old highway | 10_STORY, S3 | `src/content/cr/` | Planned (P12a) |
| Seven post stations, the legs between them, the Mist Barrier, station 7; region, palette (cedar green, slate grey, cloud white, ember orange of station lanterns), place, zones, chart | R2 | `src/content/cr/` | Planned (P12a) |
| Shortcuts: each reached station is a travel point; dense decisions rather than repeated walking | R2 risks, playbook | travel | Planned (P12a) |
| Route reports at each station with their source (saw it, heard it, rumour) and certainty; weather and closures by explicit phases (never a clock) | R2, A8, A52 | `RB.relay` | Planned (P12b) |
| Route planning: choose the next leg from the reports, the weather phase and the party; any reasonable plan gets through, a better-read plan avoids a detour | R2, A14, A52 | `RB.relay`, UI | Planned (P12b) |
| The relay: carry a message and repeat it with the certainty you actually have; the next station acts on what you said; overstatement sends help the wrong way, a recoverable side consequence | R2, A8 | `RB.relay`, UI | Planned (P12b) |
| Travel papers: fill and check them; spot a forged stamp; all four profiles | R2, A48 | `src/content/cr/` | Planned (P12c) |
| The Mist Barrier interview: explain your purpose in suitably formal Japanese (a negotiation, E8; role and register, A41) | R2, E8 | encounter | Planned (P12c) |
| Staying behind: one traveller stays as surety (an old, non-violent custom); the companion volunteers; the player fetches proof from station 7 alone and comes back; tuned for one, no techniques, no replacement fighter | 10_STORY §8, playbook | engine + content | Planned (P12c) |
| Nao's crossroads woven into the wait: Sakichi at station 6 asks Nao to keep the post; Nao says no to Sakichi's face; the night apart (the last relay leg run alone, the porch at night: kajika frogs, wind in the cedars, a horse bell far below) | 14_COMPANIONS, S14 | `src/content/cr/` | Planned (P12c) |
| The High Pass and the Courier's Hut: switchbacks, a landslide detour, a rope bridge, a snow shelter, a rest hut with limited uses and checkpoints | R2, D1, D2 | `src/content/cr/` | Planned (P12d) |
| The Courier Who Never Arrived (届かずの飛脚): an argument chain; the account changes each round; track which version is supported; the message delivered | R2, E8, A24 | encounter | Planned (P12d) |
| ごとに taught in the story, station by station | 03_ENCOUNTERS growth | story scene | Planned (P12d) |
| Creatures: Fog Porter (a "protect the document" objective), Waystone Imp (turns signposts), Cloud Ox, Runner's Echo (repeats the last thing said, garbled), Pack-Lantern, Blankpage Moth (Hush-adjacent; silences modifiers for a few rounds, E26) | R2, E6, E26 | interim art (F-36) | Planned (P12e) |
| Wanderers: a pilgrim (helps against what blocks the shrine path; Kotonoha's rumour in a pilgrim's version, F-75), a smuggler (helps against the checkpoint's creatures, then asks a favour) | R2 | `src/content/cr/` | Planned (P12e) |
| Road events: a stranded courier; a pack horse on a ledge | R2, W5, A18 | `src/content/cr/` | Planned (P12e) |
| Side quests: The Seven Seals, The Inn That Lost Its Guest Book, The Mapmaker's Wrong Map (a Cartographer commission), The Pilgrim's Errand, The Last Courier's Family (permanent outcomes) | R2, E17 | `src/content/cr/` | Planned (P12e) |
| Companions: Mio (altitude sickness, the post-station dispensary's labels; Kikue's message on the relay), Ren (relights the station lanterns; word on the relay that the Keepers' Road is lit), Suzu (the inns' tricks, the road's stories; sends her reply to Koume by the relay) | 14_COMPANIONS, S14 | `src/content/cr/` | Planned (P12e) |
| Music: shakuhachi and koto with a walking rhythm, a lonely flute at altitude, pack-horse bells; battle, the pass, the boss; the night apart's cue for Nao | R2 Theme, C-22 | `src/audio` | Planned (P12e) |
| Records: the Seven Seals stand, chapter stamps; illustrations for P16 | K1 | records | Planned (P12e) |
| Tests: unit (reports, relay, papers, solo stretch, Nao's scenes, phases); browser (planning and relay sheets, papers, the surety stretch); the route through Chapter 10 | playbook P12 | `tests/` | Planned |

## Rules kept

- The road teaches weighing reports, not memorising a single best route. Any reasonable plan gets through.
- A misreported message never becomes an irreversible moral failure: help sent the wrong way is found and brought
  back, and the station says so plainly.
- Staying behind is a custom, never a punishment, and can't be caused by a Japanese mistake. The same companion
  always returns; no one takes their place.
- Real history labelled as such where taught: post stations (宿場), relay couriers (飛脚), checkpoints (関所), travel
  papers (通行手形). The Cloudroad itself, its stations and its people are fiction.
- The Courier Who Never Arrived rhymes with Nao's story; nobody says so (S14).
- Every line of new Japanese through the review ledger (self-review only).
