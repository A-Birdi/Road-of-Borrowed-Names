# P11 · The sea, its ports and Kotonoha (Chapter 9), and Lanternfall as Chapter 8

*Playbook P11; plan [06_WORLD.md](../plan/06_WORLD.md) W7 (the Harbourmaster's long quest and sailing) and W8 (the
boat as a home), [07_REGIONS.md](../plan/07_REGIONS.md) R4 (Kotonoha) and R6 (Sazanami and East Landing),
[03_ENCOUNTERS.md](../plan/03_ENCOUNTERS.md) E23 (Lanternfall's new kinds), [14_COMPANIONS.md](../plan/14_COMPANIONS.md);
sealed notes S1, S5, S14, S15. Authorised by C-81; art under C-82 ([AC1_ART.md](../plan/AC1_ART.md)). Twelve-chapter
journeys only (`ed>=2`); the six-chapter game is unchanged.*

## The packet in one paragraph

After Chapter 2, Harbourmaster Ōmi offers a deal: restore an old hull and earn a licence, and the boat is yours to
sail, carrying the coast's post. Fuku may entrust her late husband's *Chidori-maru* (her choice; another hull is
there if she would rather not). The quest runs through the middle chapters: favours in Manybridge's canal yards and
the boat named in kana, sea trials with Tetsu and Shiori's tide book back at Saltglass, Ōmi's licence (a document
and an interview that cannot be failed for good), and a maiden voyage to Sazanami and East Landing, where a rumour
leads to an island. Sailing is optional and never fails: choose a port, then sail yourself on an untimed sea map
(steer, set the sail to the wind) or let the crew sail; sea situations happen either way and story ones are never
skipped; a torn sail or frayed line can be mended now with its words or later in port. The cabin is a quiet home:
keepsakes, the travel volume, the Distractions corner, a bunk, the companion and the pet. Chapter 9 takes everyone
to Kotonoha, by the public ferry or their own boat: an island where lost words drift ashore as leaves and a great
camphor tree is shedding faster than its keepers can gather. The party returns leaves to the places that lost them,
reconstructs conversations from shells, assembles the island's tellings in the keepers' hall, and goes down into
the Root Hollows, where the tide separates them for a while, to meet the Gardener of Unsent Words. Lanternfall,
now Chapter 8, gains three new kinds of creature.

## What P11 builds

| Part | Source | Where | State |
|---|---|---|---|
| The chapter order: Lanternfall as Chapter 8 leads to Kotonoha (Chapter 9) by Saltglass's public ferry; the road to the Still Archive waits for Chapter 11 in twelve-chapter journeys | 10_STORY, R4 | `src/content/ko/01_region.js` | To do |
| **A Licence for the Open Sea**, five stages: the deal (Ōmi; Fuku's hull or another), the yards (favours, the sail-maker, naming the boat in kana), sea trials (Tetsu's sea words, Shiori's tide book, a trial voyage), the licence (a document and an interview; retry at once), the maiden voyage (Sazanami, East Landing, the island's hint) | W7 | `src/content/sea/` | To do |
| **Sailing**: the sea chart of ports reached; sail yourself (an untimed top-down sea, steer, set the sail to the wind) or let the crew sail; both switchable; nothing sinks, runs out or pursues | W7 | `src/engine/` + `src/ui/` (sea mode), `src/content/sea/` | To do |
| Sea situations (seeded): a hail to answer, fog and the lighthouse signal, floating cargo's label, a creature on deck, a sea bird's message, a seal on the rocks; unique first-time ones per route; story ones interrupt the crew's sailing | W7, S2 | `src/content/sea/` | To do |
| Something goes wrong on board: mend it now (the part and what to do with it, in words) or in port; until then the boat is a little slower; calm lines, never a warning | W7, C-43 | sea mode | To do |
| The travel log: an entry per voyage (route, sights, words, people), a section of the travel volume | W7, K2 | records | To do |
| The cabin: keepsakes, the travel volume, the Distractions corner, a bunk, the companion and the pet; no upkeep | W8 | a map | To do |
| Sazanami: net-mending and the fish market's numbers, a tide-pool school where the player teaches, a fishing station | R6 | `src/content/sea/` | To do |
| East Landing: rebuilt over visits (repair jobs, notices, a negotiation with the old owners); the finished landing a new port | R6 | `src/content/sea/` | To do |
| Kotonoha: the shore, the village, the tree's terraces, the keepers' hall; early (boat), Chapter 9 and after-the-ending phases, progress kept | R4 | `src/content/ko/` | To do |
| Leaf returning (transfer): read a leaf, work out where it was lost, return it; the place changes | R4, A32, W1 | `src/content/ko/` | To do |
| Shell messages: reconstruct who said what to whom (read, and optionally listen) | R4, A53, A5 | `src/content/ko/` | To do |
| The tellings exhibition: the island's legend from four tellers, a panel each, no single right version, each choice explained | R4, A49 | `RB.tellings`, `src/content/ko/` | To do |
| The Root Hollows: leaves in air currents; restoring a leaf's word reshapes the passages; the separation by the tide (a solvable scare) | R4, A11, 10_STORY §8 | `src/content/ko/` | To do |
| The Gardener of Unsent Words: a social and folklore encounter (ask back, compare tellings, decide which leaves to return) | R4, E7/E8 | `src/content/ko/` | To do |
| Five creatures: Leafling, Driftword Jelly, Tidepool Mirror, Conch Echo, Sand Lantern; wanderers: a keeper's apprentice, a lost sailor's echo | R4 | interim art (F-36) | To do |
| Side quests: The Apprentice Who Cannot Read, The Sailor's Last Letter (permanent outcomes), The Leaf That Is Your Name, The Keepers' Census, The Tide Calendar | R4 | `src/content/ko/` | To do |
| Companions on the island: Nao's astray letter, Mio's labels without bottles, Ren's oldest lanterns in the sand, Suzu's unsent reply and the sea-cave stage; each companion's reunion after the separation | 14_COMPANIONS, S14 | `src/content/ko/` | To do |
| Lanternfall as Chapter 8: three new kinds (Notice-Board Mimic, Queue Spirit, Ledger Weevil), twelve-chapter journeys only | E23 | `src/content/lf2/` | To do |
| Music: the sea, the ports, the island (koto harmonics, a bowed instrument, wind chimes), its battle and the Gardener | R4 Theme, C-22 | `src/audio` | To do |
| Records: stamps for the chapter, the ports and the voyage; the travel log; illustrations for P16 | K1, K2 | records | To do |
| Tests: unit; browser (sailing by keyboard and touch, repairs, the crew sailing with a story situation, naming, the shells without voice); the route through Chapter 9 with and without the boat; every phase of the island; every companion's reunion | playbook P11 | `tests/` | To do |

## Rules kept

- S1, S5: the island holds what is lost by ordinary means (forgotten words, unsent letters, what the sea carried
  off) and, lately, stray pages; never the Hush's taken names, which canon sends to the Still Archive. The Hush's
  reach shows only indirectly (the tree shedding faster) and is not explained.
- The boat is optional: Chapter 9 plays fully by the public ferry, and the quest can be finished afterwards.
- Nothing at sea fails, sinks, runs out or chases; no reflex test; skipping never forfeits a story situation.
- The early visit neither locks in nor locks out anything Chapter 9 needs; its progress stays made.
- Folklore labelled: the Kokinshū preface quoted and labelled real; the island's lore the game's own.
- Every line of new Japanese through the review ledger (self-review only).
