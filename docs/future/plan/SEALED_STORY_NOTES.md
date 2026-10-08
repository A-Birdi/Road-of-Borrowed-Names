# SEALED STORY NOTES — spoilers for Chapters 3–6, the ending and the postgame

> **Robin: please don't open this until you've finished the game.** These notes support decisions in the plan that
> depend on what happens later in the existing story. Everything a decision needs is stated in the plan in
> spoiler-free terms. This file records only *why*.

*Expansion plan, draft 6 (2026-10-08, after Robin's fourth round of answers). Sources: docs/STORY.md and src/content
(read-only audit).*

---

## S1 · New chapters must not pre-empt the existing reveals

The existing chapters reveal, in order:
- **Chapter 2.** The Drowned Archive is a branch of the Still Archive; names go to "head office". Robin was near the
  end of Chapter 2, so even this is kept out of the main plan.
- **Chapter 3.** The orchard's fire 20 years ago, rewritten out of the chronicle by the man who caused it. A
  traveller in white (Kasane) came to keep people's grief.
- **Chapter 4.** Hoshino's lamp and his daughter Akari's name; the star charts locate the Archive.
- **Chapter 5.** The town that can only say "certainly". The flood 30 years ago and Takase's 「必要なら開ける」;
  Tōya's death. The bell restores "no".
- **Chapter 6.** Kasane's origin as a grief-keeper whose Hush stopped asking anyone. The final battle against the
  Hush itself. Tōya's note re-read as a promise.

**Rules for the new chapters.**
- **Manybridge (new 3–4)** may show printed names lifted and contracts going blank. It **must not** show
  disagreement disappearing or "certainly" replacing "no": that is Lanternfall's reveal. It may show the phenomenon
  spreading through print, which is new. It must not name Kasane or the grief-keeping.
- **The Cloudroad and Steamhollow (new 8–9)** come after Lanternfall. They may reflect what the party now knows
  about disagreement and promises, and build towards the questions Chapter 6 answers (which promises to keep; how
  to repair harm). They must not answer them.
- **Folklore about しじま** across new regions stays consistent with Tsuru's line that the word is old keeper lore,
  "Even in my teacher's day, nobody took it seriously." This is canon support for "older than anyone believed", as
  long as no new chapter claims to explain its origin, which belongs to Chapter 6.

## S2 · The Keepers' Road (now Chapter 7)

- **Canon support:** Tsuru had a teacher. The word しじま predates Kasane's thirty years. Ushio's maxim
  (「名は灯に、灯は人に、人は名に。」) is keeper lore.
- **Placement:** after Snowbell (old 4, new 6) and before Lanternfall (new 8). Adopted (07_REGIONS R8). Snowbell's star charts already
  point at the Archive; a keepers' chapter there would explain *how the keepers once guarded names* without
  touching Kasane.
- **Risk:** it overlaps Ren's personal quest (Ushio, the Archive's dissenter). A Keepers' chapter must leave Ushio's
  story to Ren's quest.

## S3 · The Cloudroad's geography and Chapter 6's opening

- **The existing Chapter 6** begins on the road from Lanternfall: fading lanterns, Oyone's Last Lamp Hut, Ushio's
  grave, then the Archive. The world map places the hut north-east of Lanternfall.
- **Option 1 (recommended):** the Cloudroad is *a different road*: the old high highway from Lanternfall over the
  northern mountains, which the Archive's founding plaque calls "the northern mountains". It meets the existing
  road at the Last Lamp Hut. Chapter 6's opening still happens; it starts where the Cloudroad ends. Steamhollow is
  in a valley on the Cloudroad's far side.
- **Option 2:** the Cloudroad *replaces* the start of `sa.road`. That needs rewriting Chapter 6's opening, which the
  content rules discourage.
- **The stakes of the Cloudroad**: trust in reported words, and a courier who never delivered. It prepares the
  re-reading of Tōya's note (a message misunderstood) without echoing it too closely. The last courier's message is
  about something else entirely: a family's, not a town's.

## S4 · Steamhollow and Mio; how it sets up the finale

- **Mio's personal quest** (Chapter 5) is about refusing out loud: she won't make the Registrar's quieting draught.
  Steamhollow comes after it, so her "honest rejection of a fraud" there is her growth in action. It must not be
  written as if she has never refused anything.
- **The inns' mediation** rehearses Chapter 6's real question: how to repair harm and keep promises when people
  disagree. Its resolution should *preserve disagreement* (the existing Lanternfall ending, "agrees on nothing",
  shows the game values that).
- **The Kettle Below** stirs when people argue: a mirror image of the Hush, which quiets argument. The thematic
  contrast is intentional and should stay subtle.

## S5 · Kotonoha and the Hush's lingering effects

- **Canon.** At the climax white pages settle "like snow", and afterwards "now and then one turns over though there
  is no wind, and flies off towards the towns below". In the postgame, Tsuru speaks of "strange roads… looking for a
  place for their names to settle", the Atlas.
- **Kotonoha's leaves.** Words lost to the world drift there. That fits canon *before* the ending (where lost words
  could go) and *after* it (pages flying off; names looking for places) without claiming the Hush survives.
- **Chapter 9 constraint (twelve chapters).** Chapter 2 already reveals that taken names go to "head office", the
  Still Archive. So the island must **not** claim that the Hush's taken names drift there. Kotonoha holds what is
  lost by *ordinary* means (forgotten words, unsent letters, words carried off by the sea) and, lately, stray
  pages. Chapter 9 can show the Hush's reach indirectly (the tree shedding faster, mainland words slipping sooner)
  without explaining it, which belongs to Chapter 12.
- **The island's deepest grove** (postgame) can hold what the Archive kept: names nobody came for. It deepens the
  ending's "open as a library / close it" choice, so its content should vary with `end_archive_*`.

## S6 · The new settlement

- The sixth Atlas restoration hangs a new lantern on `rw.road` naming **葦原新田 (Ashihara Shinden)**, a newly
  settled village "never visited". The postgame region R7 *is* that village.

## S7 · Later-chapter people for delvers, superbosses and cameos

- **Delvers:** Hoshino or Kanta (Snowbell), Tokuji (Lanternfall's gatekeeper), Oyone (the hut keeper), Nagisa, and
  Isamu after his return.
- **Superbosses** for existing regions: the Mill Echo's "founder" (Reedwake); the Tide Clerk's "head office" echo
  (Saltglass, safe after the ending); the Kiln Warden's first fire (Cinder Orchard); the Lamp That Waited's sister
  star (Snowbell); the Drowned Bell's maker (Lanternfall).
- **Kasane** never appears as a superboss. The ending's dignity stands.

## S8 · Change beats for existing later towns

- **Cinder Orchard:** its festival is a one-time story map. Suzu promised "twenty festivals" for Hiro (Chapter 3,
  her personal quest), so a postgame **revisit of the yearly festival** (a new, repeatable festival map, distinct
  from the story's) would honour that promise and also give Robin's festival-games-stay rule a second venue.
- **Snowbell:** the observatory's lamp-keeping rota; letters with Akari.
- **Lanternfall:** the council's arguments; the "Objections welcome" board (Atlas decor) gains printed objections
  from Manybridge.

## S9 · Shogi canon

- Fuku's shogi partner was **Isamu**, the Saltglass net-mender. He is missing during Chapter 2 and found alive at
  the Last Lamp Hut in Chapter 6; he goes home. **Postgame shogi on the hill bench with both of them** is a natural
  scene.
- An abandoned mid-game also sits in Snowbell's hamlet (`ch4/30_scenes_hamlet.js:252`): a small "finish the game"
  tsume puzzle hook.

## S10 · Robin's Hush assumption against canon

Robin's assumption: the Hush can be ended while lingering effects remain elsewhere; "it is not an eminent force that
imbues its will unto written words, just that it's taken or changed things around."

| Point | Canon | Fit |
|---|---|---|
| Ended by the finale | Yes: it comes undone; lanterns' names no longer slide off | ✓ |
| Lingering effects | Yes: pages flying off; strange roads (the Atlas) | ✓ |
| Has no will of its own | **Partly.** It began as Kasane's grief-keeping, then "no longer asked anyone — not even Kasane"; in battle it borrows other guardians' patterns and speaks in Kasane's voice | ~ |

**Conclusion:** build on the assumption. New content should treat the Hush as *ended* and its *effects* as what
remains, which is what Robin wants, and never as a will that persists.

## S11 · Suzu canon

- Suzu is a travelling performer who kept her troupe's books for ten years and minded the luggage when the troupe
  went ahead after the storm. She is *not* a star, and wants a double-act partner (相方).
- At the ending she writes a play titled *The Road of Borrowed Names*.
- **Robin's impression** (2026-10-07, before playing her story): she wants to be "a star of sorts". To revisit after
  the playthrough (C-62). A double act aiming for the big stage would honour both.
- Her troupe in Manybridge (new Chapters 3–4) must be consistent with "went on ahead after the storm". Meeting them
  is a reunion with consequences for her ending, so it must not resolve what her Chapter 3 quest and the ending do.

## S12 · Small canon inconsistencies found during the audit

Not for this plan to fix; recorded so new writing doesn't copy them:
- **Ushio's pronouns:** "his" in `ch3/43_scenes_end.js:181` and `ch5/22_main.js:671`; they/them elsewhere
  (`ch4/32_scenes_quiet.js:297`).
- **Two different Mitsus:** Gorō's wife, who died in the fire, and Old Yasu's wife from Koharuno.
- **The route chart** drew a Cinder–Lanternfall road that could not be walked. **Fixed 2026-10-07** (part D of
  11_CONTRADICTIONS.md), with a test that every chart road can be walked.

## S13 · The New Game+ farewell and the world after the ending

- **The road that folds back.** After the ending, the Unwritten Atlas exists because roads were left unmoored: "unstable
  routes left behind as the world recovers (unmoored names, half-built roads)". A road that folds back on itself to
  the morning the traveller arrived is the same kind of thing, which is why the farewell can be supernatural without
  reopening the Hush. It is a road, not the Hush.
- **"Unfinished work" per companion** should come from each companion's own epilogue, so the line is true to where
  the ending leaves them: Nao's letters and addresses, Mio's refusals and care, Ren's lanterns and their teacher's
  sayings, Suzu's play (*The Road of Borrowed Names*, written at the ending) and her troupe.
- **The finished run stays resolved.** New Game+ starts a new timeline in another slot (C-66); nothing in the finished
  save changes, so spec line 242 holds.
- **An old six-chapter save mid-story** gets the same farewell: there the companion's "unfinished work" is literally
  the story they never finished, which gives that save a gentle close.

## S14 · The companions' second arcs: specifics (for 14_COMPANIONS.md)

Every specific below was checked against the companions' existing lines (src/content). Before writing any of it,
check again: nothing new may contradict a line already in the game.

### Suzu
- **Canon used:** sixteen and with the troupe twenty years ago, at the Cinder Orchard festival, "the first year I had
  lines of my own"; ten years keeping the troupe's books alone, "proud that nobody else ever saw them"; "the curtains
  put the troupe in the red"; after the storm the troupe went ahead and she meant to follow ("The bridge reaches, so
  I can chase after my troupe! …Or so I thought."). Her existing quest (Chapter 5, Hiro) is about a comforting lie.
- **The unfinished matter:** the books. For years she quietly covered the troupe's losses from her own share and
  told everyone the books balanced: a second comforting lie, about money instead of grief. When the storm came she
  stayed behind partly to settle the last debts town by town. Nobody in the troupe knows.
- **Her old partner:** **Koume** (コウメ), her double-act partner of those years, now the troupe's lead comic. Their
  act ended the night the troupe went ahead without her. Koume's letter (Chapter 4) asks where she went and why.
- **Why it works after Chapter 5:** having told Hiro the truth, Suzu now owes her troupe the same. In Chapter 11 she
  shows them the books openly, the meticulous ledger she was proud nobody saw; they are hurt, then grateful; Koume
  laughs first. The troupe knows she is safe, what they mean to her is said aloud, and they will meet again.
- **The crossroads:** Koume offers the old act back. Suzu chooses the player as her partner for the next act: not a
  rejection of Koume, but the act she wants now.
- **Kotonoha (Chapter 9):** among the drifted leaves, her own unsent reply to Koume. She sends it in Chapter 10 by
  the relay; that is why the troupe comes to Steamhollow.

### Nao
- **Canon used:** Nao's own father exists and writes back with a shaking hand ("A reply to my reply came from my
  father. The writing shakes so badly I can only read half."). Nao's existing quest (Chapter 8, Lanternfall) is a
  letter from a dying father to an estranged daughter, which Nao chose not to deliver.
- **The unfinished matter:** Nao's own father, a retired courier of the Cloudroad relay, keeps a post station near the
  Mist Barrier. Their letters are short and careful; something was never said. The Cloudroad's Courier Who Never
  Arrived carried the relay's last message the year it failed, and Nao's father was the courier who waited for it.
- **The crossroads:** the postmaster offers Nao the father's station: take over the post, stay near him. Nao chooses
  to finish the road with the player and promises to come back.
- **The night apart:** Nao runs the last leg alone to see their father, then sits with the player on the station's
  porch. The parallel with the Lanternfall letter is felt, never spelled out.
- **Ending:** the relay running again; Nao's route passes their father's door.

### Mio
- **Canon used:** "…I copied my mother."; "My mother loved Saltglass dried fish." (past tense); her existing quest
  (Chapter 8) is refusing out loud; Steamhollow already carries her "honest rejection of a fraud" (S4).
- **The unfinished matter:** her mother trained at Steamhollow's springs. Her recipe book ends with a remedy promised
  to a patient in the valley and never finished. Mio, who copied her mother in everything, finds that the remedy
  can't honestly be made as promised, and must say so to someone who has waited years.
- **Her old teacher:** the healer who taught her mother, retiring; the one who offers Mio the dispensary.
- **The crossroads:** her mother's old place, offered with love. Mio chooses the road, for now, and tells the
  patient the truth with care: her growth from Chapter 8 in action.
- **Ending:** her own dispensary, with an honest label on every shelf.

### Ren
- **Canon used:** "When lost, go back to the oldest name"; terrible at directions; their teacher's story (Ushio)
  belongs to their existing quest and is not touched.
- **The unfinished matter:** as an apprentice, Ren got lost on the Keepers' Road and never reached a lantern they had
  been sent to relight; it went dark, and a traveller lost the way that night (found safe, years later, as Old
  Hisae remembers). Ren has carried it quietly.
- **The crossroads:** Old Hisae offers Ren the road's keepership. Ren relights that lantern first, apologises to
  Hisae, and chooses to finish the road with the player.
- **Ending:** Ren's answer to Hisae: a keeper who walks the road, as the order once did.

## S15 · The Hush as a rising tragedy: the ladder (for 10_STORY.md §6a)

Robin: the Hush's effect should read as a tragedy that grows, with the party's resolve growing with it, and an
intense, grand, epic feel near its source by the end. Canon fixes six rungs; the new chapters fill the gaps so that
every chapter is worse than the one before, never a reveal early (S1).

| Ch | Region | What the Hush takes | The tragedy the player sees | The party's resolve |
|---|---|---|---|---|
| 1 | Reedwake | names on labels and lanterns | an eerie inconvenience; a mill that echoes old voices | curiosity |
| 2 | Saltglass | names "shelved" to a drowned archive | contradiction, a missing man | concern |
| 3 | Manybridge A | printed names, at a city's scale | barges lost, a family's goods gone, a child lost in the canals one night (found) | "this is bigger than one village" |
| 4 | Manybridge B | the names in stories and plays | a playhouse that can't remember its characters; actors who forget the roles they loved | anger on others' behalf |
| 5 | Cinder Orchard | a disaster's memory (canon) | firebreaks abandoned "because there was never a fire" | "forgetting can kill" |
| 6 | Snowbell | addresses (canon) | a promise broken by silence | grief, shared |
| 7 | the Keepers' Road | a whole order's work, over generations | a road of dark lanterns; the last keeper alone | the Hush is old; resolve to end it |
| 8 | Lanternfall | disagreement (canon) | a town that can only say "certainly" | outrage, then purpose |
| 9 | Kotonoha | words, faster than they can drift home | the great tree shedding; keepers who can't keep up | "the whole language is leaking" |
| 10 | the Cloudroad | the messages between places | stations that no longer speak to each other; travellers who have stopped talking; snow that falls without a sound | fear, faced |
| 11 | Steamhollow | (pressing from the ridge above) | the last warm, loud place; refugees from silent villages; the mountain above soundless | a vow |
| 12 | the Still Archive | (canon) | the land around it drained of colour and sound; lanterns' names peeling and drifting uphill; the companion's voice briefly hushed and won back | the climax |

**Chapter 12's approach is reworked to be heavier** (Robin's "fairly intense surrounding its location"): the palette
drains step by step, the music thins to a low drone with the score's main motif under it, the ambient sound drops
out map by map, and a short sequence hushes the companion's voice for a few lines until the player restores it
(never permanent; the companion is never harmed). The canon events of the chapter stay as they are.
