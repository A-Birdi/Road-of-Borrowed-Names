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
| 1 | 追分宿 | おいわけじゅく, Oiwake (where the road divides) | the relay master; an innkeeper | the relay explained; the first board; the first lantern relit; the Seven Seals start |
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
| Chapter 10's call after Kotonoha: a garbled relayed message on landing, Yae's first-hand account at Lanternfall; the Lantern Road's way up onto the old highway | 10_STORY, S3 | `src/content/cr/20_scenes_call.js` | Done (P12a): Jinpachi at Saltglass's harbour and Lanternfall (whichever comes first), Yae's account, the waystone at the Lantern Road's top end |
| Seven post stations, the legs between them, the Mist Barrier, station 7; region, palette, place, zones, chart | R2 | `src/content/cr/01_region.js`, `10_maps.js` | Done (P12a): seven stations, five legs (main road through the gorge, old road round above), the Barrier, the road above the cloud, four interiors; two palettes (cloudroad, cloudtop); the place on the chart after `ko_done` |
| Shortcuts: each reached station is a travel point; dense decisions rather than repeated walking | R2 risks, playbook | travel | Done (P12a): the palanquin (駕籠) at every station with its lamp lit, to any lit station |
| Route reports at each station with their source and certainty; weather and closures by explicit phases (never a clock) | R2, A8, A52 | `src/content/cr/31_reports.js`, `10_maps.js` | Done (P12b): five plans of three to four reports (saw, told, rumour, signs, notice, map), each with its reading task; `var.cr_phase` 2–6 set by the story (cloud, rain, fog, clearing, snow); the washed-out bridge, the ledge's rockfall and the fog bank shut a road where they are, the way round always open |
| Route planning: choose the next leg from the reports; any reasonable plan gets through, a better-read plan avoids a detour | R2, A14, A52 | the tellings engine as a plan (`72k_tellings.js`, `89k_tellings.js`) | Done (P12b): F-88 |
| The relay: carry a message and repeat it with the certainty you have; the next station acts on what you said; overstatement sends help the wrong way, a recoverable side consequence | R2, A8 | `src/engine/72r_relay.js`, `src/ui/89r_relay.js` | Done (P12b): five messages; four side consequences each put right by talking to whoever acted on it (F-89) |
| Travel papers: fill and check them; spot a forged stamp; all four profiles | R2, A48 | `32_barrier_learning.js` | Done (P12c) |
| The Mist Barrier interview in suitably formal Japanese | R2, E8, A41 | `32_barrier_learning.js`, `22_scenes_barrier.js` | Done (P12c): Ujie's questions; humble 参ります against honorific いらっしゃる for oneself |
| Staying behind: one traveller stays as surety; the companion volunteers; the player fetches proof from station 7 alone and comes back; no techniques, no replacement | 10_STORY §8, playbook | `src/engine/58s_surety.js` | Done (P12c): F-90 |
| Nao's crossroads woven into the wait; the night apart | 14_COMPANIONS, S14 | `22_scenes_barrier.js`, `40_company.js` | Done (P12c): Sakichi at Kirishita; Nao's answer to his face; the last leg run alone; the porch, kajika frogs; a kept memory and a Bond event |
| The High Pass and the Courier's Hut: switchbacks, a landslide detour, a rope bridge, a snow shelter with limited rests and a checkpoint | R2, D1, D2 | `11_pass.js`, `23_scenes_pass.js`, `34_pass_learning.js` | Done (P12d): F-91 |
| The Courier Who Never Arrived (届かずの飛脚): an argument chain; the account changes each round; track which version is supported; the message delivered | R2, E8, A24 | `33_creatures.js`, `23_scenes_pass.js` | Done (P12d): F-92 |
| ごとに taught in the story | 03_ENCOUNTERS growth | `cr.goto` | Done (P12d): Ine, after the first message: the relay changes runner at every station (宿ごとに) |
| Creatures: Fog Porter (protect the document), Waystone Imp, Cloud Ox, Runner's Echo, Pack-Lantern, Blankpage Moth (silences modifiers, E26) | R2, E6, E26 | `33_creatures.js` | Done (P12e): interim art on existing families (F-36; F-93) |
| Wanderers: a pilgrim (Kotonoha's rumour in a pilgrim's version, F-75), a smuggler (then asks a favour) | R2 | `33_creatures.js`, `26_scenes_side.js` | Done (P12e): Oshika on the shrine path; Ginji above the Barrier, and his parcel for Chika (F-94) |
| Road events: a stranded courier; a pack horse on a ledge | R2, W5, A18 | `21_scenes_stations.js` | Done (P12a–b): Matazō at the ford; the pack horse backed off the ledge |
| Side quests: The Seven Seals, The Inn That Lost Its Guest Book, The Mapmaker's Wrong Map (a Cartographer commission), The Pilgrim's Errand, The Last Courier's Family (permanent outcomes) | R2, E17 | `25_side.js`, `26_scenes_side.js`, `35_side_learning.js` | Done (P12e): F-94, F-95 |
| Companions: Mio (altitude, the dispensary's labels; Kikue's message), Ren (relights the lanterns; the Keepers' Road lit), Suzu (the inns' tricks; her reply to Koume by the relay) | 14_COMPANIONS, S14 | `27_scenes_comp.js` | Done (P12e): each once on the restored relay, one Bond each (`cr:beat`) |
| Music: shakuhachi and koto with a walking rhythm, a lonely flute at altitude, pack-horse bells; battle, the pass, the hut, the boss | R2 Theme, C-22 | `src/audio/38x_songs_cr.js` | Done (P12e): five songs; the battle and boss themes between Kotonoha's and the Archive's in the ladder |
| Records: the chapter stamps and stand, the Seven Seals, the relay passed on as given; illustrations for P16 | K1 | `40_records.js` | Done (P12e); the illustrated pages are P16 art work |
| Tests: unit; browser (relay and planning sheets, the surety stretch); the route through Chapter 10 | playbook P12 | `tests/` | Done: `cr_ch10` 146/0, `chapter_reach` 4/0, browser `cloudroad` 4/0, the route to `cr_done` (phase end below) |

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

## Phase end (2026-10-11)

Unit 43,709/0 on a clean copy (31 failures found and fixed on the working tree first); validator clean; twelve
browser suites pass. The route from the Kotonoha fixture stuck at the foot of the High Pass: the goat path round the
slide on the Switchbacks did not join the road at its lower end, so the pass could not be climbed before the slide was
cleared from above. Walking every map from its spawn also showed the Mist Barrier's fence stopping short of the
cliffs. Both fixed, with a test that walks every map of the chapter in four story states (`chapter_reach`); the route
then reached `cr_done`, and the courier's echo now stands in the hut's doorway (the route's speaker check). The
campaign at the chapter's end is `tests/fixtures/campaign/F-ren-cr_done.json`. Details: VALIDATION.md "The expansion,
P12"; REQUIREMENTS.md XP68–XP72. Not verified: a person playing the chapter; other browsers; real devices.
