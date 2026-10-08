# 11 · Contradictions and open decisions

*Expansion plan, draft 7 (2026-10-08, after Robin's fifth round of answers). Planning only. Spoiler-safe.*

Robin asked for every contradiction that hasn't been answered yet, "like the illustration book we covered", with
ideas for covering each. That one is the model:
- **The tension:** chapter passwords for gallery access contradicted the spec's ban on share codes (line 238).
- **The resolution:** Robin dropped passwords for an always-viewable Main Menu gallery [H1].

## How the labels read

| Label | Meaning |
|---|---|
| **Decided** | Robin has answered; the plan now follows the answer |
| **Decided · detail open** | Answered, but the answer raised one follow-up question (listed in part A2) |
| **Confirm** | I've proposed a reading of Robin's answer; a yes or no is enough |
| **Open** | Not yet answered by Robin |
| **Open · proposal stands** | Not yet answered; until Robin says otherwise, the plan follows the resolution given |
| **Revisit** | Robin will come back to it after the playthrough |
| **Fixed** | A defect in the current game, fixed and tested |

The register has these parts:
- **A. Decisions that blocked a feature.** All answered on 2026-10-07.
- **A2. Questions raised by those answers.** All answered in the second round, except Suzu (revisit).
- **A3. Questions raised by the second round.** All answered in the third round.
- **A4. Questions raised by the third round.** Answered (C-67).
- **A5. Proposals from the fourth round.** All answered (C-68 to C-71).
- **A6. Readings of the fifth round.** **The ones waiting for you** (C-72 to C-74).
- **B. Tensions this plan resolves.** Please confirm or overrule; some answered, the rest still open.
- **C. Already resolved.** Recorded so nobody reopens them by accident.
- **D. Defects found by the audit.** All fixed on 2026-10-07.

## Still waiting for you (at a glance)

| # | Question | Label |
|---|---|---|
| [C-72](#c-72--modifier-words-what-each-family-does) | Modifier words: what each of the eleven does, and how they're learned | **Confirm** |
| [C-73](#c-73--no-per-round-ceiling-on-what-a-group-can-do) | No per-round ceiling on what a group can do | **Confirm** |
| [C-74](#c-74--where-the-two-growth-moments-fall) | Unravel reaches two in Chapter 4; Protect covers both in Chapter 7 | **Confirm** |

---

## A. Decisions that blocked a feature (all answered 2026-10-07)

### C-01 · Six chapters, or ten (or twelve)
- **Sides.** Spec line 38: "Build six substantial chapters." Robin [R1]: "a solid 10, or… 12."
- **Robin's decision:** "It can be 12 chapters." **Decided.**
- **What follows.** The twelve-chapter outline in [10_STORY.md](10_STORY.md) §4 is now the plan: six new chapters,
  all before the finale. Spec line 38 is amended to "twelve". The playtime target (line 36) is a new question:
  C-61.

### C-02 · What happens to saves already past an inserted chapter, including Robin's
- **Sides.** Inserting chapters means existing saves skip them. Migrations "must never invent history"
  (ADDENDUM_CONTRACTS). The project rule was "Do not… require New Game".
- **Robin's decision:** "Do not allow old saves to continue after implementation of new chapters."
  **Decided · detail open.**
- **What follows.** When the twelve-chapter edition ships, a save from the six-chapter edition can no longer be
  continued. This replaces the project's "never require New Game" rule for that one change and nothing else:
  saves are still never deleted or rewritten, and every other update must keep saves working. The spec already
  asks for "incompatible saves" to be handled "gracefully" without clearing data (line 232), which is how the old
  saves are treated. The follow-up details are C-54. The four options of draft 1 (detour, Chapter Journey, NG+,
  postgame visit) are withdrawn.

### C-03 · Restart-from-the-beginning on dungeon failure, and the spec's checkpoints
- **Sides.** Robin [R2 §2]: "If the player fails a dungeon, they should simply be able to restart from the
  beginning." Spec line 128: "Defeat should return the player to a sensible checkpoint…"
- **Robin's decision:** "Optional dungeons only. Story dungeons remain using checkpoints." **Decided.**
- **What follows.** Optional dungeons restart from the beginning, and say so on their preview card. Story dungeons
  keep checkpoints and the declineable companion help (E19). Spec line 128 stands as written for story dungeons.

### C-09 · Encounters that can't be won by Unravel alone
- **Sides.** Content rules: "Every battle must be winnable with Unravel alone" (AGENT_COMMON, CONTENT, ATLAS).
  Robin wants puzzle battles, mediation, procedures and objectives [R1, R2 §1].
- **Robin's decision:** yes, they are exempt. Unravel may have no use there, "unless a mechanic is something like
  untying a knot or fixing a crumpled ball of paper, stuff where 'unravel' means something, not untying enemy knots
  that won't exist in that context." **Decided.**
- **What follows.**
  - The rule's wording becomes "every *combat* encounter is winnable with Unravel alone". Ordinary combat is
    unchanged.
  - Puzzle, social and objective encounters carry their own guarantee instead: at least two distinct ways to their
    conclusions, never a need for handwriting, and leaving is always possible without penalty.
  - In those encounters, Unravel appears only where something can literally be unravelled: a knot, a tangled
    line, crumpled paper, a snarled net. How it shows elsewhere: C-60.

### C-12 · A temporary separation from the companion
- **Sides.** Robin [R2 §1] allows a companion to stay behind, be captured or be briefly incapacitated. Spec lines
  70 and 290: "exactly two adventurers"; "no event creates a third party member".
- **Robin's decision:** separations can happen for story beats, "as long as you're unable to exchange them for
  another, you must be able to rejoin them guaranteed — no permanent separation. It can build suspense and tension,
  or just give you breathing room during a disagreement. They'll make up and be better for it, apologies and
  understanding abound." **Decided.**
- **What follows.**
  - Spec amendment: "Exactly two adventurers after commitment. A story beat may separate them for a while; the same
    companion always returns, and no one takes their place."
  - Three kinds of separation are now in the plan ([10_STORY.md](10_STORY.md) §8): **staying behind** (the surety
    at the Mist Barrier), **captivity or danger** (suspense, with a rescue), and **a disagreement** (breathing
    room, then apologies and understanding).
  - No stand-in companion and no guest fighter. Help while apart comes from the place, notes and people who advise
    but never join a battle.
  - How a quarrel touches Bond: C-59.

### C-13 · Mastery stars per input type and "no help-only rewards"
- **Sides.** Robin [H4]: stars per input type, awarded below 30% assisted questions. PRACTICE_CONTRACTS line 125:
  "No speed-only, handwriting-only or no-help-only reward".
- **Robin's decision:** "Mastery stars are just UI flair, not a real reward. It can be perceived that way by
  completionists, but must be clear that it's just for you to feel good about learning and grasping the
  language." **Decided.**
- **What follows.** Stars unlock nothing and are never a condition for anything. The page that shows them says so
  in plain words: "These stars are just for you: a way to see what you've grasped. They don't unlock anything."
  Contract text added (L3).

### C-14 · Is choosing the recognizer's second guess "assisted"?
- **Sides.** Today the pad shows the recognizer's top guess *and*, on the same row, its other readings; choosing
  one of those counts as assisted. Spec line 158: "A manual correction should allow progress while being recorded
  as assisted."
- **Robin's decision:** "If you draw る but it gets recognized as ろ, or カ when you draw か, it counts as assisted.
  It could only show one, immediate guess and allow you to redraw it before confirming without making it assisted.
  If you click a button to 'show more suggestions' then it's assisted." **Decided.**
- **What follows** (a change to the existing pad, planned for Phase 1):
  - The pad shows **one** guess per character.
  - **Redrawing before confirming is free** and never marks anything.
  - A **"Show more suggestions"** button opens the other readings. Pressing it marks that answer as assisted, and
    the button says so, as Translate does. Picking from the kana or kanji chart stays assisted too.
  - Spec line 158 needs no change. Draft 1's "recognition repair" category is withdrawn.

### C-17 · Timed or streak-based festival games and the no-clock rule
- **Sides.** Robin [R1]: personal streaks and high scores in festival minigames are fine. PRACTICE_CONTRACTS line
  123: "No clock anywhere except an explicitly started fishing response entry"; spec line 218: never require fast
  reactions.
- **Robin's decision:** "an opt-in timed mode would be good. An untimed reward-free practice mode should be
  default." **Decided · detail open.**
- **What follows.** Every festival game opens in an untimed practice mode that gives no rewards. A timed mode can be
  chosen, off by default, paused by help and never needed for anything, the same conditions as fishing. The
  contract is amended to allow that. What, if anything, the timed mode gives: C-55.

### C-18 · The Atlas adapts during a run; Robin's rule says expeditions are fixed
- **Sides.** Robin [R2 §3]: a generated dungeon is fixed at generation and does not change after mistakes. Today
  the Atlas adds the player's weakest items to each encounter's practice pool during a run.
- **Robin's decision:** "The Atlas should remain the premier randomly generated dungeon for maximum
  replayability." **Decided · detail open.**
- **What follows.** Draft 1's recommendation (choosing all of a run's content at its start) is withdrawn. The Atlas
  keeps its current behaviour. It also becomes the home of every generated expedition: the commissions of D7
  (practice, themed, survey) are built as Atlas run types rather than a separate system. The reading of "fixed"
  this depends on: C-57.

### C-21 · How big the game may get
- **Sides.** The single file is about 13 MiB; illustrations could add much more. Robin plays in Firefox.
- **Robin's decision:** no real concern until about 100 MB, "which is ludicrously large. Even then, it's hosted so
  not a top concern." **Decided.**
- **What follows.**
  - The ceiling is 100 MB. The per-feature budgets in S6 stay as guidance, not caps.
  - One measurement stays in Phase 1, as a check rather than a limit: how long a large build takes to open in
    Firefox and on the foldable. A slow first load is a reason to decode art only when needed, not to cut content.
  - Hosting doesn't change the offline rule: the file must still run with no network.

### C-35 · Fixing the learning record changes existing behaviour
- **Sides.** The audit found three learning-record defects. Fixing them makes evidence honest, but some items
  promote more slowly than before.
- **Robin's decision:** "I'll trust your best judgment on it." **Decided, and fixed** (part D).
- **What I decided, and why.**
  - **The promotion rule** said an item can't climb past box 2 "merely by choosing from options". In practice one
    typed or written attempt *ever*, even a wrong one, lifted that limit for good. Now the current run of correct
    answers must include a typed or handwritten one. A mistake ends the run.
  - **Copy steps** (Foundations, with the model shown) were recorded as unaided handwriting. The spec forbids
    counting a displayed answer as recall (line 188). They are now recorded as guided practice, and the feedback
    says "Guided practice — that's fine."
  - **Translate** in story activities stayed switched on for every later customer or letter. It now applies only to
    the one it was used on.
  - **Nothing already earned is taken away.** Existing boxes stay as they are. The new rule applies from the next
    answer. Choice-only play is still a full way to play (spec line 134): it reaches box 2, as it always did.

---

## A2. Questions raised by the first answers (answered 2026-10-07, second round)

### C-54 · Old saves when the new chapters ship (from C-02)
**Decided** (second round). Robin's answer, in short:
- **Continuing or loading an old save says so first:** the journey will begin again at the start, *a fresh start*,
  without any satchel equipment or items. What carries over: settings, pastime records (shiritori, shogi and the
  rest), unlocked illustrations and other personal data.
- **This is New Game+, and New Game+ means the same everywhere:** it keeps personal learning records, mastery
  stars, illustrations and other personal metadata, never character or story progression. Over several runs a
  player can collect every story illustration, with every companion.
- **New Game+ is offered by default at the end of the game.**
- **Starting New Game+ plays a farewell with the companion:** they have unfinished work and hope to meet again.
  The player is drawn back to the start of the story, a little tearfully, with the promise that they won't be
  forgotten: the game tells the player that their illustrations, records and "memories" persist.

How the plan carries it out: [10_STORY.md](10_STORY.md) §9 and §10, [02_FOUNDATIONS.md](02_FOUNDATIONS.md) S4,
[09_RECORDS.md](09_RECORDS.md) K9. Four small details: C-66.

### C-55 · Festival rewards when the default mode gives none (from C-17)
**Decided.** "The Festival Games are just for fun — they can have a personal record tracker, and that's it." The
timed mode keeps personal records and nothing else. No stamp or keepsake comes from any score. The festival's
story (setting up, the night, the fireworks) can still give its own story moments.

### C-56 · The bath for they/them and custom pronouns (from C-27)
**Decided.** Robin: "For unclear pronoun choices, the player should be given a choice, and stick with it if they
revisit the baths." So:
- she/her: the women's bath; he/him: the men's bath, with no question;
- they/them and custom pronouns: the player chooses once, at the first bath (men's, women's or the inn's reserved
  bath), and the game keeps that choice for every later visit.
- **Nao and Ren** (they/them) make their own choice in character, and always the same one: written once for each
  and kept (Robin, third round). The player is never asked to choose for them.

### C-57 · What "fixed at generation" means for the Atlas (from C-18)
**Decided.** Yes: each run's shape is fixed when it is generated. Robin added an idea: the rooms inside that fixed
shape can be generated at random too, so each run feels a little different. The plan adds per-run variation inside
the hand-drawn room patterns (mirroring, obstacles, props, decor, where creatures stand), all chosen when the run
begins and kept for that run ([04_DUNGEONS.md](04_DUNGEONS.md)).

### C-58 · Two Ledgers (from C-37)
**Decided.** **The Wayfarer's Ledger** (the pause menu) and **the Inn Ledger** (宿帳, the title's six saves). The
labels change in Phase 1; the plan's text now uses the names.

### C-59 · A quarrel and the Bond table (from C-12)
**Decided.** A quarrel never lowers Bond, because it is always resolved meaningfully. Robin: it shows conflict and
the everyday language of making up; "being apologetic is part of learning the language, too." The plan adds
apologies and making up as a language strand ([08_CULTURE.md](08_CULTURE.md) C16). Robin's mention of "romantic
partners" raised C-63.

### C-60 · Unravel where nothing is tangled (from C-09)
**Decided.** Unravel stays available in puzzle, social and objective encounters, **even where it does nothing**.
It is never there just to remove knots from creatures. Working out whether it helps is the player's job: not every
situation is cut and dried, and analysis is required. **The first non-creature group conflict teaches this:** the
Tally Exchange dispute in Manybridge (Chapter 3). How this sits with the "effect here" preview: C-64.

### C-61 · The playtime target for twelve chapters (from C-01)
**Decided.** About **15 hours** for a brisk playthrough of the main story, later chapters taking slightly longer as
they hold more; about **40 hours** for a new learner who takes in the whole game. Spec line 36 is amended to say
so. The only figure so far is a content-based estimate, not a measurement: the existing six chapters at roughly
11–14 hours for a learner at a plausible pace. Both targets are checked by timed play, never claimed
([10_STORY.md](10_STORY.md) §11).

### C-33 · Hanafuda, a traditional card game
**Decided.** "Totally in." Koi-koi against people in the world, points only, never stakes
([08_CULTURE.md](08_CULTURE.md) C12).

### C-62 · Suzu's dream (from C-31)
**Decided** (2026-10-08). Robin: her story could use an expansion with the new regions. As it stands, the player
never meets her troupe again: her resolve to see the player's story through answers "why isn't she chasing them?",
but not "do they know she's safe, what do they mean to her, and will they meet again?". So: she crosses paths with
members of her troupe, and makes the hard decision to stay with the player; a key separation in which she sorts out
her own thoughts, dismissive at first, then apologetic for making the player wait; a heartfelt night scene at a
camp or inn, with a sombre, near-silent theme and night ambience; an unfinished matter from her past, resolved; and
by the end, the next act with the same partner: the double act. She is a travelling comedian who wants fun and good
company, not a star. **And all four companions get the same depth** ([14_COMPANIONS.md](14_COMPANIONS.md)).

---

## A3. Questions raised by the second round (answered 2026-10-07, third round)

### C-63 · Romance
**Decided.** Robin: "romance is fine, but probably limited to a kiss and/or holding hands — very much a story
conclusion moment, depending on Bond. This could just be for the story ending, or very rarely elsewhere. Nothing
explicit."
- **Who:** only the chosen companion. Canon makes all four companions adults (story bible: "Adults, not
  one-note"), and the player is an adult traveller. Any companion, whatever the player's pronouns.
- **What:** holding hands and/or a kiss. Nothing explicit, ever.
- **When:** the story's ending, at high Bond. Very rarely elsewhere (C-67).
- **Unchanged:** no jealousy, no resentment, no sulking; unchosen candidates never resent the player; Bond never
  drops. The contract and its test (`tests/unit/company_bond.test.mjs`) change only to allow romance wording inside
  scenes marked as romance moments.
- How the moment is offered: C-67.

### C-64 · The "effect here" preview and analysis (from C-60)
**Decided.** The proposal stands, with Robin's note that "puzzles or situations may evolve turn by turn, it may
suffice to try something else".
- **Combat** keeps the honest "effect here" line (E5).
- **Puzzle, social and objective encounters** describe what each response does in general; the player reads the
  situation.
- **Trying something else is the answer** when a response does nothing. To make that easy, a response that did
  nothing is marked *tried* on its card ("Tried: nothing was tangled") until the situation changes, when the mark
  clears, because it might work now. Nothing is ever hidden or locked; the mark only saves the player repeating
  themselves.

### C-65 · How gruesome a witnessed conflict may be (from C-11)
**Decided.** As proposed: shown with restraint (aftermath, silhouettes, sound and reactions, cutting away at the
worst moment, never explicit gore), a "Distressing scenes: shown / summarised" setting, and a reflection scene with
the companion every time.

### C-66 · New Game+ details (from C-54)
**Decided.** Robin:
1. **Keepsakes and lore don't carry.** Nor do the Atlas cosmetics, the pet or Known details. The keepsake
   catalogue's "found" record and the noted-words notebook carry as personal metadata.
2. **The traveller stays as they are**: name, pronouns, appearance and (for they/them and custom pronouns) the bath
   they chose. No change is offered.
3. **New Game+ allows either**: beginning in the originating save's own slot (replacing it) or in another slot
   (keeping it). Replacing anything needs an explicit confirmation. (My reading of "allow either"; say if you meant
   something else.)
4. **The farewell comes from the originating save**: its companion says goodbye, not the companion of a save being
   overwritten.
5. An old save from before a companion was chosen gets the short solo farewell.

---

## A4. Questions raised by the third round

### C-67 · How the romance moment is offered (from C-63)
**Decided.** Robin: "that works." As proposed:
- **Always the player's choice.** At the ending, if Bond is high, the moment is offered in the scene itself: the
  companion says, in their own words, what the journey has meant, and the player can answer with the romantic
  moment (holding hands, a kiss) or as the closest of friends. Both are warm; neither is the "right" one; Bond is
  the same either way.
- **The companion's own consent is shown**, in their voice; nothing happens to anyone by surprise.
- **Elsewhere, at most one earlier moment, holding hands only:** after the reconciliation in Steamhollow (Chapter
  11), at high Bond, and only as the player's choice there too.
- **Each moment has its own travel-volume illustration**, witnessed like any other; in New Game+ runs these
  accumulate per companion.

## A5. Proposals from the fourth round (all answered 2026-10-08)

### C-68 · The companions' arcs and where their crossroads fall
**Decided.** Robin: "I can only speak to Suzu's, which sounds promising. I would trust your judgment in making the
other three equally fleshed out." [14_COMPANIONS.md](14_COMPANIONS.md) gives each companion a second arc with the same
parts (a seed, pressure, a step in Chapter 10, their existing quest, a crossroads, a night apart, an unfinished
matter settled, a postgame scene, their dream at the ending). The crossroads fall at: **Ren**, Chapter 7 (the
Keepers' Road); **Nao**, Chapter 10 (the Cloudroad, woven into the Mist Barrier); **Mio** and **Suzu**, Chapter 11
(Steamhollow, where Suzu meets her troupe). The specifics are sealed (S14).
- **Corrected while doing it:** checking canon again, I found two of draft 6's arcs leaned on lines spoken *near*
  the companion by other characters. Nao's and Mio's arcs now rest on their own lines; every canon line is now
  checked for its speaker as well as its words.

### C-69 · Reasons to fight roaming creatures
**Decided.** Robin: "Sounds reasonable - yes." From [03_ENCOUNTERS.md](03_ENCOUNTERS.md) E24: every roaming creature
carries a lost word that comes back to its place when it is settled; cleared routes change (people use them); a few
authored quest carriers; notable named creatures that can teach the companion an action or give an exploration
cosmetic; and field-guide stamps. No currency, random drops or "slay N".

### C-70 · Group scaling and varied tactics
**Decided, with Robin's additions.** Robin: "Numbering each enemy by their action order is good. Groups should still
respect targeting where applicable." Then three additions, now in the plan:
- **Growth, as story moments:** Unravel reaches up to two creatures after a point in the story; Protect covers both
  of you, "a meaningful moment of growth - not a surprise / sudden reward. You're a traveling Inkweaver, and still
  learning the ropes."
- **Modifier words** (E27, new): "Instead of choosing one response, we may be able to learn to use modifiers in
  battle / the overworld", such as すべてを守る ("Protect Everything") and 風がすべてを動かす ("The wind moves all").
  Words that read alike behave differently (すべて / 全部 / あらゆる / 全体; それぞれ / ごとに; 大半 / たくさん /
  いくつか; 永遠に / 無限). "They play like target modifiers more than direct word/response transformations at
  heart. Extensions, really." They give options for harder fights with two to five creatures "without restricting
  what the enemies can do".
- **Two-move turns and silencing** "sound fine, as long as it can be inferred clearly": only Hush or Hush-adjacent
  creatures silence, never the player (E26).

My readings of the additions are part A6 (C-72 to C-74).

### C-71 · Companions growing in battle
**Decided.** Robin: "Sounds good - Not every action needs to be laid out in the clearest path, as we're letting unique
enemies possibly reward the companion with a new tool or upgrade, too. This wouldn't be FOMO as the player can
generally revisit any area at any time (within reason)." From E25: about one new companion action per chapter (from
the story, their arcs, notable creatures and secret encounters), some actions growing a wider reach instead of
piling up, at most six offered in a battle, and the curve test still guarding the language work. Notable creatures
are never placed where an area closes for good.

## A6. Readings of the fifth round (to confirm)

### C-72 · Modifier words: what each family does
**Confirm.** [03_ENCOUNTERS.md](03_ENCOUNTERS.md) E27 gives each of your eleven words a role that follows its real
meaning: *breadth* (すべて), *completeness on one* (全部), *every kind* (あらゆる), *the group as one* (全体), *each its
own* (それぞれ), *in turn* (ごとに), *two of your choice* (いくつか), *all but one* (大半), *more on one* (たくさん),
*lasting* (永遠に) and *no limit, this round* (無限に). Each is a trade, never a plain upgrade. Only natural phrases
are offered, the help is honest where two words overlap in everyday Japanese, and with handwriting you write the
modifier and its particle while the rest is shown. Six are taught by the new chapters' stories; five are found off
the beaten path (the last two in the Trials).

### C-73 · No per-round ceiling on what a group can do
**Confirm.** Draft 6 proposed capping what a group could take from you in one round. Your "without restricting what
the enemies can do" reads to me as dropping it: groups are met by your growing tools (modifiers, companions' growth,
party-wide responses), while the curve test still guarantees every encounter can be won, at every setting, and with
Unravel alone.

### C-74 · Where the two growth moments fall
**Confirm.** **Unravel reaches two** (いくつか) in Chapter 4, after the city's crowded fights; **Protect covers both**
(すべて) in Chapter 7, on the Keepers' Road, where the keepers' old practice teaches it after a moment when a ward
before one of you was not enough. Each is a scene, not a pop-up.

---

## B. Tensions this plan resolves (please confirm or overrule)

Rows marked **Open · proposal stands** are ones you haven't answered yet. Until you do, the plan follows the
resolution in the row. Robin answered C-04 to C-11 on 2026-10-07 and the rest on 2026-10-08. All of part B is now decided.

| # | Tension | Sides | This plan's resolution | Where | Status |
|---|---|---|---|---|---|
| C-04 | Persistent health vs mistake costs that never compound | R1 wants health and status to persist; spec line 128 | **Robin: persistent health only where a dungeon specifies it**, not everywhere and not through trips to inns (tedious). In those dungeons, carry over only what tactics cost; restore what language mistakes cost at each encounter's end | D2 | **Decided** (2026-10-07) |
| C-05 | Stationed resources vs resource softlocks | R2 §2; spec line 216 | Exits always reachable; leaving is always possible; defeat applies the expedition rule | D2, D3 | **Decided** (2026-10-07: "your resolution fits") |
| C-06 | Suspend in the Trials vs six visible slots and no hidden saves | H2; spec lines 224, 228, 238 | A per-slot recovery-style record, removed with the slot, never listed as a save | D9 | **Decided** (2026-10-07: "your resolution fits") |
| C-07 | Ambushes vs visible, avoidable foes | R1; AGENT_COMMON | Ambushes only in dungeons whose preview says so; telegraphed on the map | E20 | **Decided** (2026-10-07: "your resolution fits") |
| C-08 | Arrivals and wanderers vs "Relaxed: one creature" and rules without randomness | R2 §1; COMBAT_NOTES | Relaxed never sees hostile arrivals; every random draw is seeded per save and stored before the battle | E2, S2 | **Decided** (2026-10-07: "your resolution fits") |
| C-10 | Lasting side-quest outcomes from "choosing incorrectly or waiting" vs no irreversible punishment for honest mistakes | R1; spec line 208 | The game shows the intention it understood before a committing action; recognition failures never commit; Wait counts only when chosen | E17 | **Decided** (2026-10-07: "your resolution fits") |
| C-11 | NPC deaths vs protected people | R2 §1; spec lines 94, 54, 242 | Never unchosen companion candidates, never people the player helped in a way that undoes their help; rare and authored. **Robin added:** a death is an avoidable consequence of the story and never stops it progressing; a conflict may be a little gruesome, never to NPCs who matter; failing to resolve a conflict never turns on the player: they may witness something terrible and reflect on it with the companion (how it is shown: C-65) | E17, 10_STORY | **Decided** (2026-10-07) |
| C-15 | A listening star using the device voice vs no listening validation from synthetic speech | H4; spec lines 280, 218 | Labelled "listening practice with your device's voice"; offered only where a voice exists; absent, not missing, elsewhere | L3 | **Decided** (2026-10-08) |
| C-16 | A "Distractions" tab vs never launching place-based activities remotely | R2 §6; practice index rule | **Robin:** the pastimes get their own **Distractions** tab in the Wayfarer's Ledger, outside Company: a page per game with code-drawn key art around it, how to play and where; companion games offered there, not on the Companion tab (K7, K10) | K7 | **Decided** (2026-10-08) |
| C-19 | Seals that survive deleting a save vs deletion removing a slot's data | R1's original wish; spec lines 228, 252 | **Robin: seals belong to the save itself, not the slot** — which is what this meant: the seals live inside the save's own data, so copying a save copies them, New Game+ carries them, and deleting a save removes them. A slot is only where a save sits; a new game written into a slot never inherits the old save's seals. The device-level alternative is dropped | S3, K4 | **Decided** (2026-10-08) |
| C-20 | Always fully viewable vs spoilers | H1; Robin's own wish to avoid spoilers; HX52; Astra | Veiled until revealed; one press per page or chapter; a setting removes the veil. H3 replaces HX53's "event-time appearance" for the Main Menu | K5 | **Decided** (2026-10-08) |
| C-22 | Inserted chapters vs the strict music intensity ladder | audio rule ZM2 | Re-tier across twelve chapters. **Robin:** energy, lift and intensity build region by region (Chapter 9 needn't be epic); the final region, dungeon and boss themes are unique and imposing; intensity comes from the writing, never from more instruments or a faster tempo; every piece belongs to one coherent score (07_REGIONS, "The score"; G16) | 07_REGIONS | **Decided** (2026-10-08) |
| C-23 | Achievements without trackers vs counting milestones | R1 | Curated stamps only; natural milestones allowed (Robin's own example); no visible counters towards them | K1 | **Decided** (2026-10-08) |
| C-24 | Printing stories "without restraint" vs never faking understanding of free text | R1; spec lines 182, 206 | Story blocks with tags; readers react only to what the blocks say; proofreading kept separate. **Robin:** free writing would be too lenient; the story blocks work well | C15 | **Decided** (2026-10-08) |
| C-25 | Construction tasks vs "accept every valid answer" | R0; spec line 138; validator gap | Authored alternatives, checked by an upgraded validator | L7, S5 | **Decided** (2026-10-08) |
| C-26 | A dialect field guide vs "questions always use standard Japanese" and no caricature | R1; dialect rules | The guide is for understanding only; questions stay standard. **Robin: no native reviewers are available**, so: careful self-review against references, few well-attested dialect features, always labelled, recorded as self-reviewed (Phase 12) | C5 | **Decided** (2026-10-08) |
| C-27 | On-screen bathing vs the player's chosen pronouns (Japanese public baths are usually separated by sex) and tone | R1; spec lines 62, 72 | **Robin: follow pronouns.** she/her: the women's bath; he/him: the men's bath; they/them and custom pronouns: C-56. Towel-wrapped, nonsexual, adults; a "shown / summarised" comfort setting | R3, C13 | **Decided** (C-56) |
| C-28 | Shogi pieces vs furigana on every kanji (and no furigana toggle) | spec line 186; project rule | Pieces show their kanji *with readings*, as Japanese learner sets do. **Robin: build it as I see fit; Robin has never played**, so it is designed to teach from nothing (08_CULTURE C12) | C12 | **Decided** (2026-10-07) |
| C-29 | A "Grow" route for Advanced players vs no level above Advanced | R0; spec lines 168, 170 | Grow means nuance, genres and conflicting perspectives for A; never an invented tier or certification | L18 | **Decided** (2026-10-08) |
| C-30 | Road events that "disappear for a time" vs no missable content | R1; spec line 208 | They re-offer themselves on later visits until resolved; the Journey keeps them as unfinished | W5 | **Decided** (2026-10-08) |
| C-31 | Suzu "aspires to be a star" vs canon (she isn't one; she wants a double-act partner) | R1; canon | **Robin (C-62):** not an aspiring star; a travelling comedian who wants fun, good company and a partner for her shows: the double act. Her story grows with a second arc (14_COMPANIONS) | C11 | **Decided** (C-62) |
| C-32 | New Bond events vs the exact Bond table capped at 12 | company.md | Rebalance across twelve chapters; no gifts or loops. **Robin:** the table can grow if it needs room (it isn't player-facing); whatever gives Bond a natural progression, with more to do by spending time with the companion and following their story (14_COMPANIONS §6) | 10_STORY §7 | **Decided** (2026-10-08) |
| C-34 | New Game+ carryover of records | spec line 252 (must be defined) | **Settled by C-54:** New Game+ carries personal learning records, stars, illustrations and seals, stamps, pastime records, settings and other personal metadata; never story or character progression, equipment or items (details C-66) | K9 | **Decided** (C-54) |
| C-36 | Spacing reviews by days vs "nothing reads the wall clock" | Astra; practice core | Read the date only to space reviews; never show overdue counts or streaks | L6 | **Decided** (2026-10-08) |
| C-37 | "The Ledger" means two things | Robin calls the pause menu "the Ledger"; the game calls it the *folio*, and its *ledger* is the title's list of saves | **Robin: both are Ledgers, kept distinct.** Proposed names in C-58 | — | **Decided** (C-58) |
| C-38 | A day/night system vs the flag-only night design | R1 floated it; the night-leak continuity test | Not now; story-set evenings only in new regions; routines move on ticks | W4 | **Decided** (2026-10-08) |
| C-39 | Companion highlighting answers in story dungeons vs honest evidence | R2 §3 | Recorded as answer-supplied help; changes nothing else | E19 | **Decided** (2026-10-08) |
| C-41 | "Overly assisted" by weighting suspected fishing vs inferring motives | R2 §4; Astra | **Left to me (Robin):** in mastery exams the first committed answer counts (retries teach but don't count), nothing is suggested up front, undo and redraw are free when nothing prompted them, options are shuffled (L3) | L2, L3 | **Decided** (2026-10-08) |
| C-42 | More than three creatures vs layout, Harmony and memory | R1; audit | Three for ordinary encounters; up to five actors in authored set pieces with a two-row formation. **Robin:** the Harmony cut-in overlapping creatures is fine; it's quick | E12 | **Decided** (2026-10-08) |
| C-43 | Hands-on sailing vs untimed play, no reflex, no excessive walking | R1; spec lines 116, 218, 56 | Direct control, nothing chasing, no failure; skip any time; story events never skipped. **Robin:** things can go wrong aboard, fixed during the voyage or at port by writing the fix; seafaring words learned on the boat; no failure, made clear without saying so (W7) | W7 | **Decided** (2026-10-08) |
| C-44 | Early island content vs "only words the player can know by then" and every profile and companion | R2 §10; AGENT_COMMON; spec lines 246, 298 | Story phase, profile and introduced concepts read separately (S1); concept gates validated | R4, S1 | **Decided** (2026-10-08) |
| C-45 | "Elimination" in group encounters is undefined | R1 | Defined per encounter, never the most severe by default. **Robin:** every non-battle group situation is a unique, demanding one-off (reusable in the postgame with new characters), never solved in three turns of common sense (E8) | E17 | **Decided** (2026-10-08) |
| C-46 | Festival clothing vs garment shapes hard-coded in every renderer, and keepsakes that may change colour only | R1; audit | A yukata cut for the festival. **Robin:** festival only, never in battle, so **no Harmony art** for it (C10a) | C10a | **Decided** (2026-10-08) |
| C-47 | "Suspend only in the Trials" vs shiritori's "rest later" and the Atlas's resume | H2; audit | H2 is about expeditions; shiritori's pause is a game pause, unaffected; the Atlas resumes by ordinary autosave, consistent with H2 | D3 | **Decided** (2026-10-08) |
| C-48 | Chapter numbers in the consultation (5, 8) vs the renumbered ten | R1; the context note says they were illustrative | Mapped to twelve chapters: the boat around new 7–8; the island's main chapter is new 9 | R4 | **Updated** for twelve chapters (C-01) |
| C-49 | Tsuru as the Trials' lore source vs her canon voice | R1 | Fits: she had a teacher, and keeper lore is hers; lines in her dry voice | D9 | **Decided** (2026-10-08) |
| C-51 | The spec's 10–15 hour target vs a longer main story | spec line 36 | About 15 h brisk, about 40 h for a new learner. **Robin:** not measured yet; the goal is about **1–3 hours per chapter** overall (10_STORY §11) | 10_STORY §11 | **Decided** (2026-10-08) |
| C-52 | A Main Menu illustration of one companion when Continue travels with another | H3; Astra | The other participants stay fixed; only the player's look follows Continue. **Robin:** Main Menu illustrations also show the effects (border, sheen, holographic finish, stamp) earned on the Continue save (K4) | K2 | **Decided** (2026-10-08) |
| C-53 | Superboss and Trials rewards vs "no exclusive essentials" | A30; R1; spec line 126 | Stamps, illustrations (revealable) and cosmetics only | E16, D9 | **Decided** (2026-10-08) |

---

## C. Already resolved (do not reopen without Robin)

| Topic | Resolution | Source |
|---|---|---|
| Gallery passwords | Dropped; the book is always viewable from the Main Menu | H1 (passwords also clashed with spec line 238) |
| Player appearance in illustrations | Continue save's look on the Main Menu; the player's own in game | H3 (replaces Astra's event-time appearance) |
| Suspend | Only the Trials; never from a battle | H2 |
| Mastery stars | Per input type; under 30% of questions assisted; **UI flair, not a reward** | H4; C-13 |
| Handwriting guesses | One guess; redraw freely; "Show more suggestions" counts as assisted | C-14 |
| Testing cadence | F/Ren routinely; the 16-combination matrix only on request | R2 §10, 2026-10-06 |
| The final art pass | Near the end, once content is settled | R2 §10, H6 |
| Exclusions | Crafting economy, collectible card game, daily chores, global difficulty scalar, correctness damage, politeness score, streaks outside recreational games, AI grading, RNG drops, pronunciation scoring, battle lanes, route editor, potion satchel, troupe death, gallery accounts | R1, R2 |
| Onsen on screen | Allowed, towel-wrapped and nonsexual; baths follow pronouns (C-56 for they/them) | R1; 2026-10-07 |
| Dungeon failure | Optional dungeons restart from the beginning; story dungeons keep checkpoints | R2 §2; C-03 |
| Generated dungeons | Fixed at generation; previewed before entry; the Atlas is the premier one (C-57) | R2 §3; C-18 |
| Chapter count | Twelve, all new chapters before the finale | C-01 |
| Old saves | Can't continue in the twelve-chapter edition; never deleted (details C-54) | C-02 |
| Unravel alone | Combat only; Unravel elsewhere only where it means something | C-09 |
| Separation | Story beats only; always the same companion back; never replaced | C-12 |
| Festival games, modes | Untimed, reward-free practice by default; opt-in timed mode | C-17 |
| File size | Not a concern below 100 MB | C-21 |
| Learning-record fixes | Done, by my judgement; nothing earned is taken away | C-35 |
| Shogi | Built as I see fit, designed for someone who has never played | C-28 |
| The two Ledgers | The Wayfarer's Ledger (pause menu) and the Inn Ledger (saves) | C-37, C-58 |
| New Game+ | Keeps personal records, stars, illustrations and personal metadata; never story or character progression, equipment or items; offered at the end of the game; a farewell with the companion | C-54 |
| Old saves | Continuing one begins New Game+ from it, with a notice first | C-54 |
| Festival games | Just for fun: personal records only | C-55 |
| Baths | By pronouns; they/them and custom choose once and keep it | C-56 |
| The Atlas | Fixed shape per run; rooms varied inside it at random | C-57 |
| Quarrels | Never lower Bond; always resolved; apologies as language | C-59 |
| Unravel outside combat | Always available, may do nothing; analysis required; taught at the first non-creature conflict | C-60 |
| Playtime | About 15 h brisk main story; about 40 h for a new learner taking in everything | C-61 |
| Hanafuda | In | C-33 |
| Companions' second arcs | All four at Suzu's depth; crossroads at Chapters 7, 10, 11 and 11 | C-68 |
| Roaming creatures | Lost words, changed routes, quest carriers, notable creatures, stamps; no currency, drops or "slay N" | C-69 |
| Group battles | Each creature's slip numbered by action order; targeting kept | C-70 |
| Silencing | Only Hush or Hush-adjacent creatures; never the player; always inferable | C-70 |
| Growth | Unravel reaches two and Protect covers both, as story moments; modifier words extend reach | C-70 |
| Companion actions | About one a chapter; some found off the beaten path, never missable | C-71 |
| Persistent health | Only in dungeons that specify it | C-04 |
| NPC deaths | Avoidable, never blocking the story; never to NPCs who matter; failure never turns on the player | C-11 |
| Romance | With the chosen companion, at high Bond; holding hands and/or a kiss; the story's ending, very rarely elsewhere; nothing explicit | C-63 |
| The "effect here" preview | Combat only; elsewhere read the situation, try something else; a *tried* mark until the situation changes | C-64 |
| Witnessed conflicts | Shown with restraint; a "shown / summarised" setting; a reflection scene | C-65 |
| New Game+ details | No keepsakes or lore; the traveller unchanged; either slot; the farewell from the originating save | C-66 |
| Nao's and Ren's bath | Their own choice, always the same | C-56 |
| The romance moment | Always the player's choice (romantic or closest friends, Bond the same); the companion's consent shown; at most one earlier moment, holding hands, after the Steamhollow reconciliation | C-67 |
| Suzu | A travelling comedian; crosses paths with her troupe; chooses to stay; a night apart; the double act at the end | C-62 |
| Companions | A second arc each, at the same depth (14_COMPANIONS) | C-62 |
| The Hush | A rising tragedy, chapter by chapter; heavy and imposing near its source | 10_STORY §6a |
| Distractions | Their own tab and pages in the Wayfarer's Ledger | C-16 |
| Seals | Belong to the save, not the slot | C-19 |
| Music | One coherent score; build-up by writing, not by volume; a unique, imposing finale | C-22 |
| Language review | No native reviewers: careful self-review against references | C-26 |
| Mastery exams | The first committed answer counts; nothing suggested up front; undo free | C-41 |
| Sailing | Repairs on board or at port; no failure, shown not said | C-43 |
| Situation encounters | Unique, demanding one-offs | C-45 |
| Yukata | Festival only; no Harmony art | C-46 |
| Playtime | About 1–3 hours per chapter | C-51 |
| Main Menu illustrations | Show the Continue save's earned effects | C-52 |

---

## D. Defects found by the audit (fixed 2026-10-07)

Found while reading the code for this plan. Robin asked for them to be fixed; all eight are. Each fix has a test
that fails on the old code and passes on the new: `tests/unit/audit_fixes.test.mjs` (22 checks) and
`tests/e2e/audit_fixes.mjs` (4 browser tests). Details: VALIDATION.md, "Audit defects fixed (2026-10-07)".

| Defect | Where | What a player saw | Fix | Label |
|---|---|---|---|---|
| Words › "Grammar met" always showed its empty message | `ui/50_menu.js` read `RB.grammar.points`, which doesn't exist | The grammar page never listed anything | Reads each point met with `RB.grammar.get`, in the order met, with furigana | **Fixed** |
| The lantern activity's label lookup had the same bug | `engine/77_lanterns.js`, `ui/88_lanterns.js` | Grammar lamps showed the question's title or "A reading question" | Shows the grammar point's own title | **Fixed** |
| Story activities' Translate never reset between customers or letters | `ui/75_activities.js` | Later answers in the same activity were recorded as assisted | Resets for each customer and letter | **Fixed** |
| Foundations copy steps recorded as unaided handwriting | `ui/65_challenge.js` | Handwriting evidence was overstated for F players | Recorded as guided practice (spec line 188) | **Fixed** |
| The promotion rule's "varied" condition used lifetime tallies, wrong attempts included | `learn/10_mastery.js` | Items could reach the top box by choice alone after one typed attempt | The current run of clean answers must include a typed or written one; existing boxes kept | **Fixed** |
| The route chart drew a Cinder–Lanternfall road that can't be walked | `content/00_world.js` | A road on the chart that doesn't exist | Removed; a test now checks every chart road can be walked | **Fixed** |
| Creature patrols used `Math.random`, the language tasks' stream | `engine/50_world.js` | A creature's wandering could change which question came next | Patrols use the world's own seeded stream, as people already did | **Fixed** |
| Ordering validation never checked `alts` | `tools/validate.mjs` | An authored alternative could be unreachable | Checked now. It found one: an Intermediate ordering drill whose alternative used a tile the drill didn't have. The alternative became an explanation shown after the answer | **Fixed** |
