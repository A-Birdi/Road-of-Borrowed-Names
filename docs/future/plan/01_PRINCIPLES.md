# 01 · Principles and guardrails

*Expansion plan, draft 1 (2026-10-07). Planning only: nothing here is authorised work until Robin selects a scope.*

Everything in the later files is checked against this page. Where an idea elsewhere seems to break one of these
rules, this page wins, and the conflict belongs in [11_CONTRADICTIONS.md](11_CONTRADICTIONS.md).

Sources are marked like this:
- **[R0]** Robin's first request.
- **[R1]** Robin's written review.
- **[R2]** Robin's ten-point clarification.
- **[H]** The six points Robin settled afterwards (HANDOFF.md, "Future expansion").
- **[A#]** One of Astra's numbered proposals.
- **[P]** A proposal made in this plan.

When sources disagree, the later one wins: [H] over [R2] over [R1] over [R0], and Robin over Astra.

---

## 1. The north star

> **Japanese as increasing agency.** Early on, the player can identify the right object. Later, they can ask for
> clarification, explain a plan, negotiate a change, reconstruct an event and solve a problem another way. By the end,
> the reward includes the real realisation: *"I can do more with this language than I could when I started."*
> (Astra's closing line, endorsed by Robin's review.)

Every new region, system and dungeon in this plan answers one question first:

> **What can the player do here that changes how they think or act — not just what they are looking at?** [A, R0]

A region whose answer is "more quests" is not ready to build. Robin: new regions should "feel fresh and new in
general, not just more quests" [R0], and "not every region needs something inherently new … but should allow a fresh
experience reliably every chapter or area" [R1].

## 2. Learning comes first, and it is never punished

| # | Guardrail | Source |
|---|---|---|
| G1 | **Time spent reading, thinking, drawing, looking at help or fixing a recognition error never advances danger.** Only committed actions and turns do. An explicit Wait is an action; leaving the game open is not. | R2 §1, A |
| G2 | **Growth is offered, never imposed.** No hidden or permanent promotion to a harder language profile. Backing out of a stretch challenge is never punished. | R1 |
| G3 | **No global "Japanese accuracy" score governs anything**: not story access, not damage, not difficulty. | R1 (exclusions) |
| G4 | **A recognition or input-device problem is not a language mistake.** That separation, which the challenge runner already makes, survives every new system. | A, existing code |
| G5 | **Help is legitimate.** Assistance is recorded honestly as what it supplied, but it does not lower a reward, withhold a story moment, or remove a "witnessed" mark. Mastery stars [H4] are the one place help is weighed, and they are *records*, not rewards: they unlock nothing (C-13). | R2 §4, R2 §6, H1, H4 |
| G6 | **Every input mode stays a full way to play**: multiple choice, typing, handwriting. Listening is welcome and never required. Spoken pronunciation is never scored. | R1, H4 |
| G7 | **A dungeon does not move its goalposts.** It is chosen, or generated, before entry and then stays the same while the player learns it. Repeated failure never lengthens or reshapes it. | R2 §3 |
| G8 | **The main story can always be finished.** Required dungeons offer escalating, declineable companion help after repeated difficulty, up to highlighting suitable responses. | R2 §3 |
| G9 | **Sentence construction grows with new content**; existing content is not refactored to fit it. | R1 |

## 3. Challenge and consequence are allowed

Robin wants a world with real stakes, not one where nothing can go wrong [R1, R2]:

- Chosen challenges can be lost: a tactical study, an optional superboss, an expedition. Ordinary dungeon failure
  restarts that dungeon from the beginning [R2 §2].
- Side quests can end in more than one way, permanently, and combinations of outcomes can open hidden content [R1].
- A bad ending can exist if the player deliberately pursues it [R2 §1].
- Reinforcements, arrivals and summons are allowed by authored, turn-based rules (never on a clock). Ordinary ones
  are finite and uncommon; only a major boss may summon repeatedly, and summons must stay dispatchable [R2 §1].

**The boundary, from Astra's reading of Robin's review, carried forward:** a lasting consequence follows an
*understood, committed* choice. Before any irreversible action, the game shows the player the intention it
understood. A misread handwritten answer, or a sentence misunderstood while learning, never causes something
irreversible on its own [A, R2 §1].

## 4. Narrative boundaries [R2 §1]

- **The troupe never dies**, and the companion and pet are never permanently taken away.
- A companion can stay behind for a critical moment, be captured, or be briefly incapacitated, with a reunion soon
  after. The solo stretch must be genuinely playable without the companion's help, so its help comes from the
  environment, notes or another person [A].
- Other NPCs may die: of old age, through bereavement, or through an offscreen crime investigated from evidence.
  Such deaths are rare, carefully authored, and never murder shown on screen. They are never a random result of a
  failed Japanese answer.
- Capture and other outcomes come from the situation as written. Each event's author decides its possible outcomes
  and how the player's choices lead to each.

## 5. Rewards and records

| # | Guardrail | Source |
|---|---|---|
| G10 | **No FOMO, grind or bribery.** No rare RNG drops, login streaks, perfect-answer chains or daily chores. No reward that pushes a player to avoid help or change input mode. | R0, R1 |
| G11 | **Streaks and high scores exist only inside recreational minigames built for them** (festival games, for example), as personal records. | R1 |
| G12 | **Achievements mark meaningful moments**: chapters, regions, all side quests, dungeon families, the Trials. There are no checklists or trackers, except naturally earned milestones such as "used 15 different responses". Each comes with a visual badge, stamp or seal. | R1 |
| G13 | **Viewing an illustration is separate from having witnessed it.** The travel volume can always be viewed in full from the Main Menu. Each save earns a seal, border, sheen or badge on the illustrations it actually witnessed. Opening any illustration shows how it is unlocked. | H1, R2 §6 |
| G14 | **There is no consumable inventory.** The satchel is not a potion bag. Recovery in dungeons comes from stationed, limited resources tied to a place. | R1, R2 §2, R2 §5 |
| G15 | **Optional is genuinely optional.** Mapping dungeons, superbosses and the Trials give worthwhile rewards that are never essential advantages or story prerequisites. | R1 |

## 6. Hard technical boundaries (the spec and the project rules)

These come from SPECIFICATION.txt and CLAUDE.md. No expansion relaxes them.

- **One offline file.** No network, CDN, server, account, login, API key or remote AI grading [CLAUDE.md, R1].
- **No save export or import, cloud saves, share codes, download-save buttons or hidden equivalents** (spec, line
  238). This is why the gallery has no passwords [H1].
- **Every displayed kanji has furigana**, and the content validator enforces it.
- **Recognition stays separate from answer checking.** The expected answer is never used to manufacture a
  recognition result.
- **Existing saves keep working.** The schema, database name, keys, slots, learning state and story are preserved.
  No save is deleted, and New Game is never required. **Robin's own campaign is in Chapter 2; every structural
  change in this plan must migrate it cleanly.**
- No new font files, CDNs, remote assets or runtime libraries.

## 7. How the plan is tested and built

- **Routine check: F/Ren.** One full Foundations + Ren route, plus a focused test of whatever a change touches: the
  companion, the profile, the puzzle, the menu trigger. The 16-combination matrix runs only when Robin asks for the
  final check [R2 §10, testing cadence].
- **Reason before running.** Work out *why* a test is needed before spending a broad run on it.
- **Label evidence honestly.** An F/Ren clear proves that route. It does not prove Suzu's exclusive scene or an
  Advanced-only prompt.
- **Alternate outcomes** are tested with small saved-state fixtures, not extra full campaigns [A].

## 8. Art comes last

Robin: the final art pass is "a fresh coat of primer, paint and polish" once the content is settled [R2 §10, H6].
So in this plan:

- Every feature ships with **interim art at today's standard**: code-drawn, consistent, and no worse than the
  surrounding game.
- Each plan item records its **art requirements** (layers, poses, compositions, illustration slots) so that work is
  ready when the art pass begins. Producing final art early for content that may still change is not planned.
- The art pass itself is the last phase in [12_ROADMAP.md](12_ROADMAP.md), outlined but not detailed, as asked.

## 8a. Words used in this plan

- **Folio:** the pause menu (Journey, Words, Satchel, Map, Company). Robin calls it "the Ledger".
- **Ledger:** in the game, the title screen's list of six saves (C-37).
- **Profiles F / E / I / A:** Foundations, Elementary, Intermediate, Advanced.
- **Existing Chapter N:** today's numbering. **New Chapter N:** the ten-chapter numbering in
  [10_STORY.md](10_STORY.md).

## 9. Spoiler discipline (for this document)

Robin is mid-Chapter 2 and wants no spoilers. This plan never names or describes events of the existing Chapters
3–6. Where a decision depends on later canon, the main text gives the choice in spoiler-free terms and points to a
numbered note in [SEALED_STORY_NOTES.md](SEALED_STORY_NOTES.md). **Do not open that file until you have finished the
game.**

## 10. What is excluded (and stays excluded unless Robin reopens it)

| Excluded | What remains allowed |
|---|---|
| Crafting economy | Purposeful, authored repairs and craft interactions |
| Collectible card game | Shogi and other traditional games, judged on their own merits |
| Daily farming or maintenance chores | Seasonal observation; one-off garden problems |
| Global difficulty scalar | Explicit profiles, chosen challenge settings, optional support |
| Damage multiplier for "correct Japanese" | Equivalent expressions of the same intention are equally effective |
| Politeness or cultural-correctness score | Context-specific outcomes, with explanations |
| Login streaks, general perfect-answer chains | Personal scores in a recreational minigame |
| Unreviewed AI dialogue grading | Bounded creative composition, authored alternatives, native review |
| Rare rewards behind RNG drop rates | Unpredictable events without loot farming |
| Required spoken-pronunciation scoring | Optional listening |
| Spatial battle lanes (Astra #29) | Actors with intentions; formations stay as they are |
| Player-authored practice-route editor (Astra #60) | Curated commissions and generated expeditions |
| Consumable-hoarding satchel | Stationed resources |
| Permanent loss or death of the troupe | Temporary, solvable separation |
| Accounts or passwords for gallery persistence | An always-viewable Main Menu gallery |
