# 11 · Contradictions and open decisions

*Expansion plan, draft 9 (2026-10-09, after Robin's seventh round of answers). Planning only.
Spoiler-safe.*

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
- **A6. Readings of the fifth round.** All approved on 2026-10-09 (C-72 to C-74).
- **A7. Questions raised by the playbook's review.** All answered on 2026-10-09 (C-75 to C-78); the interface
  proof accepted the same day (C-79).
- **B. Tensions this plan resolves.** Please confirm or overrule; some answered, the rest still open.
- **C. Already resolved.** Recorded so nobody reopens them by accident.
- **D. Defects found by the audit.** All fixed on 2026-10-07.
- **E. The playbook's review of draft 7 (D01–D16).** Each resolved, or labelled with its question in A7.

## Still waiting for you (at a glance)

| # | Question | Label |
|---|---|---|
| — | Nothing is waiting. Robin authorised the whole expansion without consulting (C-81); the lead's own decisions are logged in part F | — |

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

## A6. Readings of the fifth round (all approved 2026-10-09)

### C-72 · Modifier words: what each family does
**Decided.** Robin: "You can note that C-72, 73 and 74 are all fine as asked." As asked: [03_ENCOUNTERS.md](03_ENCOUNTERS.md) E27 gives each of your eleven words a role that follows its real
meaning: *breadth* (すべて), *completeness on one* (全部), *every kind* (あらゆる), *the group as one* (全体), *each its
own* (それぞれ), *in turn* (ごとに), *two of your choice* (いくつか), *all but one* (大半), *more on one* (たくさん),
*lasting* (永遠に) and *no limit, this round* (無限に). Each is a trade, never a plain upgrade. Only natural phrases
are offered, the help is honest where two words overlap in everyday Japanese, and with handwriting you write the
modifier and its particle while the rest is shown. Six are taught by the new chapters' stories; five are found off
the beaten path (the last two in the Trials).

### C-73 · No per-round ceiling on what a group can do
**Decided** (as asked). This does not touch the cap on what language mistakes cost, Relaxed's guarantees or any other
protection. Draft 6 proposed capping what a group could take from you in one round. Your "without restricting what
the enemies can do" reads to me as dropping it: groups are met by your growing tools (modifiers, companions' growth,
party-wide responses), while the curve test still guarantees every encounter can be won, at every setting, and with
Unravel alone.

### C-74 · Where the two growth moments fall
**Decided** (as asked). **Unravel reaches two** (いくつか) in Chapter 4, after the city's crowded fights; **Protect covers both**
(すべて) in Chapter 7, on the Keepers' Road, where the keepers' old practice teaches it after a moment when a ward
before one of you was not enough. Each is a scene, not a pop-up.

## A7. Questions raised by the playbook's review (all answered 2026-10-09)

Robin's package of 2026-10-09 ([../playbook/](../playbook/README.md)) reviewed draft 7 and found sixteen places where
the plan disagreed with itself (part E). Most are settled by decisions Robin has already made. These four are not.

### C-78 · The playbook's order of work, and the first scope
**Decided.** Robin: "Yes." The playbook's order replaces the roadmap's, with its six changes, and the first scope is
the one proposed: **P00** (the recorded baseline, no change to the game), then **P01's interface proof** (U01 and
U02), ending in one review set for Robin. Nothing beyond that is authorised yet. The proposal as it was put: The playbook proposes an order (P00 to P18) and six changes to this plan's roadmap
([12_ROADMAP.md](12_ROADMAP.md), "The playbook's proposed order"):
- **A01:** prove the visual method early (the book interface and a Reedwake presentation proof, P01), before new
  regions are built on it;
- **A02, A03:** settle animation conventions early, and make interim art in the final format;
- **A04:** treat the twelve chapters' "edition ships" as an internal milestone; release only the whole expansion,
  with its postgame and art;
- **A05:** language and performance review all the way through, not only at the end;
- **A06:** one implementation model writing at a time, with no parallel writers and no second model.

The playbook itself says it authorises nothing until you name a scope. **The question:** do you accept these six,
and which part should start? The natural first scope is **P00** (a recorded baseline: the census of screens,
controls, content and assets, with no change to the game) and then **P01's interface proof** (U01 and U02: the book
on Journey and Company, and a type specimen), which ends in one review set for you.

### C-79 · The interface proof accepted; P01 continues
**Decided.** Robin, on the first review set: "I'll say that the tabs at the top were fine, it's more of the inner
layout that needed some proper style and organization - sorry for the mixup". On the second: "I think it's an
improvement - you may proceed."
- **Accepted:** the book's direction, as revised in round 2 (U01, U02; [../work/U01_BOOK.md](../work/U01_BOOK.md)).
  The classic tabs stay across the top, the inner pages are organised, and the type is the U02 set. It stays a
  preview behind its setting until the shell reaches every page (U03 to U06); the method is then applied, not
  re-voted page by page.
- **Authorised next:** the rest of P01, in the playbook's order. That is Reedwake's presentation proof and Saltglass
  reusing it, which ends in its own visual gate (the playbook's P01 exit: Robin approves the world's visual
  direction).
- **Still waiting:** later milestones (P02 onward) wait for that gate.

### C-80 · P01's visual gate: solid, push the detail further; a fidelity study first
**Answered (2026-10-10), not yet accepted.** Robin, on the world proof's review page: "The proof direction is really
solid, don't misunderstand, but I'm wondering if we can push it closer to the mockup's level of detail."
- **Battles keep the game's own framing.** "The battle scene vs 3 crabs with the far camera reads a little distant.
  The closer one is fine. If we need to fit 5, keep it marginally spread out, just not so much that we're a mile
  away." Fixed: under the proof, a battle uses the game's own framing (it had been using the far view). Five
  creatures (the set pieces of C-76) may widen it a little, never to the far view.
- **The camera needn't pull back so far.** "The camera also doesn't need to zoom out so much. The mockup was just to
  show detail, and is loosely based on Octopath Traveler's layout and fidelity." The far view (45 tiles at 1440) is
  too far; the next camera sits nearer.
- **The end goal:** "pixel depth, shading, lighting, blur (focus), scenery depth"; crisp, defined pixels rather than
  shapes (Octopath Traveler given as the reference for fidelity). Sprite dimensions may change if the result reads
  well and looks like very detailed pixel art; animations follow, "fluid … elegant versus stiff".
- **Asked for next:** a fidelity study. Suzu redrawn from scratch (her existing sprite as reference only), alone in
  front of the Mill, rendered as the game would render it (not a painting), with an idle loop and the scenery
  animated. ([../work/P01_STUDY.md](../work/P01_STUDY.md))
- **Still waiting:** the gate itself (P02 onward) waits for Robin's view of the study.

### C-81 · The whole expansion authorised, without consulting; the study is a test
**Decided** (2026-10-10). Robin, after the fidelity study: "As a short note, it's both an upgrade and a step away in
some places, especially from the vision I have for the perspective. As a whole, disregard this as an authoritative
process - keep it noted as a test - and continue your World Proof into full Expansion plan at large. Do your best to
implement the *entire* expansion plan without consulting me. If possible I would like to review it in earnest at
completion, and accept fewer to no distractions or concerns that block or halt progress. Unless a blocker is an
extreme, serious deviation from what the game already does, work through it in a way that makes sense to you. If by
the end something has morphed into something else incorrectly, I will address it then."
- **The study is a test, not a standard.** Its code stays development only; nothing in it is adopted as the art
  direction. Robin's detailed feedback on it will come later, and the perspective in particular is Robin's to set.
- **P01's gate is passed; P02 to P17 are authorised**, in the playbook's order, one packet at a time, with tests and
  evidence for each. P18 (the full matrix and any release) still waits for Robin.
- **No questions in between.** Where the plan leaves something open, the lead decides, records the choice in this
  register (part F) and carries on. Robin reviews the whole at the end.
- **Unchanged:** every guardrail (one offline file, no network, saves and their schema untouched, no save export,
  furigana everywhere, recognition separate from answer checking); Robin's existing saves are never altered. The
  twelve-chapter edition stays behind its development switch (S4) until the release, so Robin's six-chapter
  campaign plays on as it is.

### C-82 · The art critique amendment (AC-1): for art work only
**Decided** (2026-10-10). Robin sent a reviewer's "Art critique and autonomous implementation amendment, revision
AC-1" with the note: "Addendum for art feedback - only consider it when we're working on more art." Digest:
[AC1_ART.md](AC1_ART.md) (the PDF is not committed: 13 MB of figures, and it names the implementation model).
- **Scope:** art work only (each new region's material kit, staging and battle backdrops in P08–P15; P16; any change
  to rendering, camera, actors, animation, light, focus, battle staging or the book's look). Everything else carries
  on under C-81 unchanged.
- **What it settles for art:** no approval pauses; the lead makes evidence-backed internal decisions and reports
  them honestly ("internally reviewed", never "Robin-approved"); the Mill study stays an experiment, its techniques
  adopted one by one; the camera serves play, not whole-map coverage; layouts may change for the scene's sake with
  connectivity, marker and interaction checks and saved positions kept valid; authored assets (pixel tables, masks,
  pose frames) are as much code-authored art as generators; the checklist AC-A01–A20.
- **Reconciled with Robin's standing rules (the lead's reading):**
  - *Perspective.* C-81 said the perspective is Robin's to set; AC-1, which Robin sent, makes the projection the
    lead's decision for art work. The lead chooses and documents it when art work next touches rendering; Robin's
    own feedback on the study, when it comes, wins.
  - *Libraries.* Robin's rule is no runtime libraries; AC-1 allows a locally bundled presentation component only when
    necessary. The lead keeps to project-authored Canvas or a project-authored GPU layer; a bundled component would
    need a recorded necessity in part F, offline, with its licence, and has not been needed.
  - *Release.* AC-1 asks for the final verification (the matrix included) near completion under the current
    authorisation; running tests changes nothing, so the matrix is run near the end. Any release, deployment or merge
    still waits for Robin (no destination is authorised; standing rule).
  - *Robin's devices.* Firefox and the foldable remain untested by automation; performance is reported for the
    measured environment only.

### C-83 · The voice audition (VA-1): the last queued task
**Decided** (2026-10-11). Robin sent "VA-1 · End-of-project Japanese voice audition" with its own instruction: "Queue
VA-1 as the last task after the currently authorized expansion, art and existing closure work. Do not switch to it
early. … Do not generate the whole game's dialogue or settle the final cast until I have heard the samples and given
the next instruction." Copy and templates: [../voice/](../voice/README.md) (the addendum's three mentions of the
implementation model are replaced by "the lead"; nothing else changed; the PDF and HTML reading copies are not
committed).
- **When:** after P17 (closure), as packets VS00–VS07; P02–P17 go on unchanged and nothing in them waits on it. It
  stops at VS07 with a listening gallery for Robin: no whole-game synthesis, no final cast, no purchases, no new
  terms accepted on Robin's behalf.
- **What it covers:** seven provider configurations (VOICEVOX, VOICEVOX Nemo, AivisSpeech, Qwen3-TTS, Gemini-TTS,
  ElevenLabs, Azure Speech), each attempted for real; 83 directed cases and 14 neutral controls per configuration (a
  female narrator in 16 tones, five lines for each of Suzu, Nao, Mio and Ren, the player's Voice A and B on the same
  five texts, twelve NPC profiles, Suzu's Kansai pairs, eight stress lines); a local-device (Windows) baseline only
  where one genuinely exists; a small hosted/fallback proof in a development build.
- **The runtime rule it adds:** voice modes None, Device voice, and Prepared voices with local fallback; the player's
  Voice A / B / None; an unset setting reads as None, explicit old preferences are kept and no save changes by being
  read; a prepared clip has about 2 s to start; no auto-advance; speech never awards learning credit, Bond, a turn or
  a witnessed scene; `index.html` alone stays complete and offline.
- **Reconciled with the standing rules (the lead's reading):**
  - *Offline and no network.* Unchanged for the game: the one file still needs nothing. VA-1 narrowly allows
    optional same-origin voice side files, fetched only in the Prepared mode; a copy of `index.html` on its own (or
    from `file://`) makes no voice requests. Any content-security change is the smallest one that serves
    same-origin manifests and audio, made when VS05 needs it.
  - *Paid services.* Adapters are development tools (outside the shipped game) and run only on access that already
    exists in the development environment; a hosted route without existing access or allowance is marked
    `blocked_access` and goes into one consolidated access/budget request to Robin. Nothing is bought, no billing is
    changed, no key is written into the game, the repository, the gallery or a log.
  - *Deployment.* Still not authorised (standing rule): the "hosted" checks (VA-A11, VA-A12) run against a local
    static server serving the game under a project subpath, and say so.
  - *Listening.* The lead cannot hear audio in this environment, so every subjective score stays empty
    ("unassessed", never a number made up from text or a waveform), as the addendum requires; Robin listens.
  - *Large files.* Engines, weights and caches are never committed; where the review copies and masters live is
    settled at VS06 under the rule against unnecessary large recordings (the addendum's ZIPs stay under 30,000,000
    bytes each).
  - *Devices.* No Windows machine and no Firefox are available to automation here; both are recorded as missing or
    untested, never inferred.

### C-84 · The twelve-chapter edition ships in the build (C-54 applies)
**Decided** (2026-10-11). Robin, before the voice work: "ensure the new additions are all updated to the live build for
the expansion plan. The voice addendum is meant to be completely afterward." Asked what "the live build" should mean
for the edition (every addition was already in `index.html`, but new journeys began six-chapter unless the development
switch was on), Robin chose **"Fully ship it (C-54 applies)"** over keeping it behind the setting or making it the
default while leaving old saves alone.
- **New journeys are twelve-chapter** (`RB.edition` `SHIPPED`, the release step of playbook A04); the development
  switch ("Edition for new journeys", `?edition=12`) is gone from Settings, since there is nothing left to switch.
- **An edition-1 save is an old one (C-54, S4).** Its slot in the Inn Ledger says "From the six-chapter edition".
  Continue or Load on it first explains that the journey begins again as New Game+: a fresh start without satchel
  equipment or items; what comes along (settings, the learning record and stars, stamps and seals, the illustrations
  witnessed, pastime records, noted words and kept sentences; the traveller's name, pronouns and look). **"Not now"
  (the safe answer, focused first) leaves the save byte for byte as it was:** it is read, never claimed or written.
- **"Begin New Game+"** goes through the one carryover (K9) and the slot choice of C-66: its own slot (replacing it,
  after a confirmation) or another (an occupied one erased only after its own confirmation); the farewell is that
  journey's companion's, or the solo one when no companion was chosen yet. The Inn Ledger's New Game+ plays the same
  farewell for a finished six-chapter journey.
- **Robin's own six-chapter campaign:** nothing changes in the browser's saves when the new build opens; continuing
  that journey now offers New Game+ (Robin's C-02 and C-54), and "Not now" keeps it exactly as it is.
- **Unchanged:** P18's final matrix (F/E/I/A × four companions) and any publication, deployment or merge still wait for
  Robin's word; "the live build" is the game file on the task branch. VA-1 (C-83) starts only after P17.

### C-85 · The order of the last steps: the campaign playable, then the voice audition, then the matrix
**Decided** (2026-10-11). Robin: "Do not run the full test matrix until after the voice addendum is addressed. The
voice addendum should not be addressed until the full 12-chapter campaign is playable as it has been in development."
- **First:** the whole twelve-chapter campaign plays in the shipped build exactly as it did behind the development
  switch (C-84). Shown, not assumed: every twelve-chapter gate reads the journey's own edition (`ed>=2`), never the
  switch (the one place that read the switch, the records menu, also reads "shipped"); a journey begun from the real
  creation wizard is twelve-chapter (`tests/e2e/create.mjs`); the twelve chapters driven to the ending from a new
  journey given the edition the build itself chooses (`PURSUE_EDITION=new`); the default browser suite on the
  shipped build. P17's closure finishes alongside.
- **Then VA-1** (C-83), its packets VS00–VS07, stopping at the listening gallery for Robin.
- **Then the full test matrix** (P18's F/E/I/A × four companions, `tests/e2e/run.mjs --full` with `matrix.mjs`), not
  before; the default browser suite (one whole-game route) is not the matrix.

### C-86 · Light and shadow on every map: the World Proof becomes the game's look, rooms included
**Decided** (2026-10-11). Robin asked for a screenshot proving a Chapter 10 exterior "matches the new World Proof
with lighting and shadows etc."; it did not (F-144 had read the proof's ground dressing as a development view, and
the proof's light was never carried past its two maps). Asked how to close the gap, Robin chose "Every exterior, all
chapters": "Make the proof's light, cast shadows, atmosphere and ground dressing the game's normal look on every
outdoor map of all twelve chapters and the postgame. Each region gets its own sun and grade; the camera sits nearer,
as you asked in C-80. Done before VA-1, with captures of each region for your review." Then: "Interiors should also
gain some of the proof - shadows, lighting, etc. It should match what is appropriate for the objects in the
interiors to allow. Light sources can come from windows, candles or other light fixtures, etc."
- **Supersedes F-144's reading** that the World Proof's ground dressing stays a development view.
- **Outdoors** (`src/engine/65_worldlook.js`, `66_worldkit.js`): every outdoor map is lit by its region's own sun
  (`SUNS`: direction, length, colour of light and shade, strength, grade; the Hall's wings share the Hall's), with
  the cast shadows, ambient grade, haze, glints and glows of the proof. Weather and a light darkness soften the sun;
  at night, or in a place dark enough (`dark` ≥ 0.3), there is no sun and the lamps cast the shadows, each away from
  itself. The kit's ground dressing, low growth, birds and rails take each region's colours from its palette; growth
  only where the grass is green (none on snow, ash or paper), lily pads only in fresh water, gulls on the coast;
  the kit's own reeds, lampposts and stalls stay with the river and coast country they were drawn for.
- **Rooms**: light that suits what a room holds. A room entered from a building outside has that building's windows
  (as many at the back as at the front, by the same fraction of the wall; timber walls only): by day the daylight
  falls through them in shafts across the floor and casts short shadows into the room; lamps, candles, hearths and
  stoves give warm pools and cast shadows away from themselves; the rest of the room is a little dimmer and the
  floor darkens where it meets the walls. By night the windows are dark paper and only the lamps cast; a room that
  is dim by design (the Lantern Hall) keeps its daylight at the windows. Shadows never fall over a wall. Lights the
  game's darkness did not count (a stove, a kiln's mouth, an oven, the festival lanterns) now open it.
- **The camera** (C-80): outdoors the view sits wider than the game's own only where a screen allows a whole-pixel
  step of at most half as many tiles again (30 tiles at 1920×1080 instead of 20); at 1440×900, 1280×800 and on
  phones it is the game's own; rooms and battles keep the game's own. The proof's far view (45 tiles at 1440×900)
  stays on the development page with its panel and the proof's working people (W03), which are not shipped.
- **A setting:** Settings → Display → "Light and shadow" (On by default; an older settings record reads On). Off is
  the flat picture exactly as before (tested pixel for pixel).
- **Cost:** steady frames about 3 → 6–9 ms in headless software Chromium at 1440×900 (within a 16.7 ms frame);
  entering a big town builds its shadows and dressing once (0.45–0.85 s there, inside the transition's dark screen,
  `RB.render.prewarm`). Phones and real GPUs are untested by automation here.
- **Status:** implemented provisionally, internally reviewed (AC-1). Robin's review at completion, from the
  captures in `docs/screenshots/light/`.

### C-87 · The Living World rolled out to the whole journey; what "shipped live" means
**Decided** (2026-10-12). Robin sent Astra's LW-1 audit of the public branch ("Take these into consideration,
especially since it brought up testing suite inconsistencies"), then: "So long as the non-voice work is reconciled and
meets the full scope of the expansion plan across the board, then shipped live, I'll be happy. The voice work I expect
to require much more time as it will be curated line by line". Then: "I suppose by "Shipped live" I meant that
everything within the expansion plan is created, curated, tested and verified in full. Regular per-feature testing
should still follow the F/Ren single pass, but when everything is all done and accounted for, run the full matrix
testing. This should double-check every single point in the expansion plan and look for holes in development, where
something might have been overlooked. When all passes, including the full matrix, it pushes to the hosted, playable
page's Index.html".
- **The audit's findings are confirmed** against the checkout (a read-only census of `5312368` in the unit tests'
  loader, before any of the rollout): one town registered (Ashihara Shinden), no relations, road events or return keys, the seven
  performers the gallery's only. The rollout and its register are in
  [`docs/future/work/LW1_ROLLOUT.md`](../work/LW1_ROLLOUT.md): W1–W6, W9–W17 and the work performances, each
  region's existing story content mapped first (it counts where it already does the job), the gaps then authored.
- **Order:** the Living World rollout and the test-suite reconciliation; the complete browser run; P17's closure
  (speed checks, the final review set, the night sweep); then VA-1 (bounded, as C-83); then, with everything in the
  plan accounted for, the full matrix (P18), which also hunts for anything overlooked.
- **Shipping:** only when everything above passes, the full matrix included, the playable page's `index.html` is
  updated on the hosting Robin uses. This is Robin's instruction for that one step at that point; until then nothing
  is merged into `main` or deployed, and every other standing constraint holds.
- **The work performances are the journey's own** (LW-01, LW-02): the World Proof's three (Yasu, Tomo, Kiyo) and the
  library's actions given to curated townspeople across every region, with the light on or off; a person works only
  on their own placement and tile and not on a story's evening (unless the work is the night's). People left still
  on purpose are listed with the reason.
- **Two engine faults the audit named are fixed:** "where you last saw someone" records only someone actually in
  view in the world (LW-08), and a person whose placement keeps its id but moves on the map walks to the new place
  (LW-09).
- **Robin, the same day, on the light:** the soft shadow round a room overlapped at its corners (each side's band
  laid over the next), and a shadow round the lighthouse's deck "doesn't really make sense". The room's shadow is
  now one falloff with rounded corners, dropped a little as if lit from above the page; the deck has none.
- **Status:** implemented provisionally, internally reviewed (AC-1 for the art); Robin's review at completion.

### C-88 · The music performance is not a dimension of the chain or the matrix
**Decided** (2026-10-12). Robin, on MT-1: "Since this is directly user-facing and not playable content in the
traditional sense, do not include verbose testing for content with both music settings either on F/ren or full
matrix, when this is implemented".
- The twelve-chapter chain (the F/Ren single pass) and the full matrix (P18) run at the default setting, Original,
  as every new journey starts. Neither is run a second time with Ensemble, and Ensemble is not added to the matrix's
  profiles × companions.
- Both performances stay covered where they matter: MT-1's own suite (`tests/e2e/music_performance.mjs`, the
  register MT-T01…T46, including the two pilots in ordinary play), its unit test, the recordings' measurements
  (`tools/music/ensemble/verify.mjs`), and the existing audio suites as regressions.
- **Status:** applied; `tests/e2e/matrix.mjs` says so in its header.

### C-89 · P18: four continuous campaigns and targeted coverage (Plan B)
**Decided** (2026-10-12). Robin: "Adopt Plan B for P18: four continuous twelve-chapter campaigns—F/Ren, E/Nao, I/Mio
and A/Suzu—plus the targeted coverage you described. This replaces the requirement for sixteen continuous campaigns
for this validation milestone."
- The four campaigns run through `tests/e2e/matrix.mjs --twelve --pairs …`, which passes the shipped edition and the
  twelve-chapter route explicitly and asserts the edition and the seventeen milestones in order. The sixteen-run
  product stays available and is not run automatically.
- The sixteen companion × profile naming combinations (`sa2.name_<companion>`, Chapter 12) are focused tests: each
  starts from a fresh copy of that companion's own genuinely captured pre-Archive state, its Japanese profile changed
  with the real Settings control or the production handler it calls (and checked before the interaction); the naming
  scene entered through its normal trigger and answered through the real interface; the result and what follows
  checked. No success flags or prerequisites set by hand, no change of companion, no fixture reused after another case
  has completed the scene. They are described as focused tests at the selected profile, not as proof that the
  campaign before them was played at that profile.
- Also: every tier of every answer-bearing registry swept with the game's checkers and negative controls (the content
  is enumerated, not counted by hand); the profile-dependent narration's selection and rendering checked directly; the
  existing focused suites kept (wrong answers, help, learning records, the Living World, separations and reunions,
  persistence, optional content, input, presentation, audio).
- Evidence names its build and test revisions and fixture provenance; runs use fixed builds; a later fix reruns what
  it affects and says what older evidence still holds. Not to be called "sixteen full campaigns passed",
  native-reviewed Japanese, or real-device validation. A stalled or incomplete campaign stays incomplete until
  resolved; no assertion is weakened to pass.
- C-88 stands (Original only); the voice-work order and other authorisations are unchanged.
- **Status:** done: the four campaigns pass on one build (2debb3c), the sixteen namings 16/16, the targeted coverage
  run (VALIDATION.md "P18 — Plan B").

### C-90 · LP-1's report resolved by the browser's setting; software rendering is a compatibility consideration
**Decided** (2026-10-12). Robin: "Confirmed on my Windows Firefox: restoring Recommended performance settings /
Hardware Acceleration resolved the Ledger lag. … Record this specific user-reported issue as resolved after the
browser configuration change. Do not describe it as universal Firefox performance certification or attribute the
resolution solely to LP-1."
- LP-1's improvements and the Quest Guide's snapshot correction stay; no further visual reductions or campaign reruns
  for this report.
- A short troubleshooting note for players: `README.md`, "If the game feels slow" (check hardware acceleration).
- Performance under software rendering is a separate compatibility consideration, not a release blocker arising
  from this report (P17_CLOSURE open items). The authorised work continues (VA-1).

### C-75 · How a wrong first answer counts towards a star
**Decided.** Robin: "Sounds good." As proposed: Your rule is a star when fewer than 30% of an exam's questions were assisted. The plan never said how a
*wrong* first answer counts (the playbook's D07). Proposed ([05_LANGUAGE.md](05_LANGUAGE.md) L3): a wrong first
answer counts like help, so the star needs fewer than 30% of questions to be assisted *or* missed. In ten questions,
two may be either; three can't. Retakes give fresh versions of just those questions; the whole exam stays the
measure.

### C-76 · Five hostile creatures in authored set pieces
**Decided.** Robin: "Correct." As proposed: E12 allowed "up to five actors" but only three hostile at once outside a boss's summons, and never said
whether the player and companion counted (D05). Your C-70 answer spoke of "the harder 2-5 enemy fights". Proposed:
the five counts only the creatures' side (never the two of you), and authored set pieces may field up to five hostile
creatures; ordinary roaming encounters stay at three or fewer
([03_ENCOUNTERS.md](03_ENCOUNTERS.md) E12).

### C-77 · Harmony: one technique per filled bar
**Decided.** Robin: "Correct." As proposed: The question of one technique per filled bar (today) or capped charges per encounter has been open since
before the expansion (E18; D16). The plan recommends keeping today's behaviour: one technique when the bar is full.
The playbook does the same until you say otherwise.

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
| Modifier words | Eleven, each a trade; natural phrases only; six taught by the story, five found | C-72 |
| Group pressure | No per-round ceiling; the player's tools grow instead | C-73 |
| Growth moments | Unravel reaches two in Chapter 4; Protect covers both in Chapter 7 | C-74 |
| The interface | An authored travel book, not nested panels; text stays flat and readable | Robin, 2026-10-09; [15_INTERFACE.md](15_INTERFACE.md) |
| Fonts | A new font is allowed if readable and in the game's tone; embedded, offline, licence recorded | Robin, 2026-10-09 |
| Mastery stars | A wrong first answer counts like help: a star needs fewer than 30% assisted or missed | C-75 |
| Set pieces | Up to five hostile creatures; the player and companion never counted | C-76 |
| Harmony | One technique per filled bar | C-77 |
| Order of work | The playbook's P00–P18, with its six changes; first scope P00 and the interface proof | C-78 |
| The book interface | Accepted as revised (classic tabs on top, organised inner pages, the U02 type); P01's world proof next | C-79 |
| The world's look | The proof's direction is solid; push detail toward the mockup and Octopath Traveler's fidelity; a nearer camera; battles keep their own framing; a Suzu-at-the-Mill fidelity study before the gate | C-80 |
| The whole expansion | Authorised without consulting (P02 to P17); the lead decides open details and records them; the fidelity study is a test, not the standard; Robin reviews at the end | C-81 |
| Art work | The AC-1 amendment governs art work only: internal evidence-backed decisions, the Mill as an experiment, camera for play, the AC-A01–A20 checklist; libraries and release still under Robin's standing rules | C-82 |
| The voice audition | VA-1, the last queued task after P17: seven providers auditioned, a listening gallery for Robin, no whole-game synthesis or final cast until Robin chooses; the game stays complete offline, voice files optional | C-83 |
| The twelve-chapter edition | Shipped in the build: new journeys are twelve-chapter; an old six-chapter save explains its fresh start first and begins New Game+ only if accepted ("Not now" leaves it byte for byte); P18's matrix and any publication still wait | C-84 |
| The last steps | The twelve-chapter campaign shown playable in the shipped build, then VA-1, then the full test matrix (not before) | C-85 |
| Light and shadow everywhere | The World Proof's light, shadows, atmosphere and ground dressing on every outdoor map under each region's own sun; rooms lit by their windows, lamps, candles, hearths and stoves; the camera a little wider only where a screen allows; a Settings switch for the flat picture | C-86 |
| The Living World everywhere | Astra's LW-1 audit confirmed; W1–W6, W9–W17 and the work performances rolled out across the journey (existing story content mapped first); "where you last saw" only on a real sighting; a moved placement walks to its new place; shipping to the playable page only after everything, the full matrix included, passes | C-87 |
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

## E. The playbook's review of draft 7 (2026-10-09)

The playbook (§03) listed sixteen places where draft 7 contradicted itself or was unclear. Each is settled below by
a decision already made, or labelled with its question in part A7. **Status** is what draft 8 did.

| # | What disagreed | Settled by | Status |
|---|---|---|---|
| D01 | "If approved" or "(open)" left on things already decided (spacing by days, C-54's old-save path, C-20, C-22) | C-20, C-22, C-36, C-54 | **Fixed** in 12_ROADMAP and 02_FOUNDATIONS S8 |
| D02 | The stamp book offered a stamp for a first mastery star; L3 says stars unlock nothing | C-13 | **Fixed**: no star stamps (K1) |
| D03 | The stamp book offered stamps for playing festival games; festival games keep personal records only | C-55 | **Fixed**: none from festival games; the festival itself is a story stamp (K1) |
| D04 | E12 said the Harmony portrait could vanish with five actors; Robin accepts the cut-in overlapping creatures | C-42 | **Fixed**: never dropped by actor count (E12) |
| D05 | "Up to five actors": did the player and companion count, and could all five be hostile? | C-76 | **Fixed**: the creatures' side only; up to five hostile in set pieces (E12) |
| D06 | "Winnable with Unravel alone" beside a Hush that silences Unravel | Today's rule, written out | **Fixed**: the exact form in E26; the curve test reports both cases |
| D07 | How a wrong first answer counts towards a star | C-75 | **Fixed**: counted like help (L3) |
| D08 | Generated expeditions fix their learning content at entry; the Atlas keeps adapting its practice | C-57 | **Fixed**: the Atlas named as the exception (D1) |
| D09 | The travel volume still said ten chapters and 60–70 pages | C-01, C-68 | **Fixed**: twelve chapters, arc illustrations added, an exact manifest instead of an estimate (K2) |
| D10 | Chapter Journey, a proposal, carried keepsakes, which New Game+ no longer does | C-66 | **Fixed**: it carries what New Game+ carries, and stays out of scope unless asked for (K6) |
| D11 | "Persistent lantern oil" in the Hall, and a delver meeting listed among a wing's ten trials | D2's stationed resources | **Fixed**: stationed resources only; a delver meeting is never one of the ten (R5, D9) |
| D12 | Older "current state" passages still described the audit's eight defects as broken | Part D | **Fixed**: marked fixed where they appear (02, 05, 06) |
| D13 | An older Manybridge paragraph said Suzu's troupe could be met there; her arc meets them in Steamhollow | C-68 | **Fixed** (R1) |
| D14 | Counts and estimates (creatures, roads, side quests) don't all add up | — | **At P00**: a census of what really exists sets each region's list; estimates are not quotas |
| D15 | New Game+ keeps appearance, but not equipment or keepsakes | C-54, C-66 | **Fixed**: the look chosen at creation carries; anything worn that was earned or found does not (K9) |
| D16 | Harmony: one technique, or charges, still open | C-77 | **Fixed**: one technique per filled bar (E18) |

## F. The lead's decisions under C-81

Robin asked for the whole expansion without consulting. Where the plan left something open, the lead chose, and each
choice is recorded here with its reason, so Robin can overrule any of them at the end.

| # | Question | The lead's choice | Why |
|---|---|---|---|
| F-01 | How Robin reviews new chapters while the twelve-chapter edition stays behind its switch | A development switch (`?edition=12`, or the setting under Settings → Development on a `?dev` page) starts **new** journeys in the twelve-chapter edition; every existing save stays six-chapter and untouched | C-02/C-54 apply when the edition ships (A04); until then Robin's saves must not change |
| F-02 | S4 asks for a schema bump to 2 for the edition field | **No bump.** The edition is an additive field (absent means 1), like every record added since the addenda; `RB.SAVE_SCHEMA` stays 1 | Robin's standing rule: preserve the save schema; an additive field needs no bump, and a bump would make every new save unreadable to an older build |
| F-03 | K9's "pastime records" inside today's practice record | Carried: shiritori's results with each companion, the fishing journal's fish and milestones, the practice tallies, and each later pastime's own record (shogi, hanafuda, karuta, festival bests). Not carried: kept practice pages, the memento display, activity progress, sessions under way | Records are personal bests and results; pages and displays are mementos, which C-66 leaves with their journey |
| F-04 | Where the keepsake catalogue's "found" record lives once keepsakes stop carrying (C-66) | In `s.records.found` (the save's records), not as items or `discovery.keepsakes`, so a new run finds each keepsake afresh while the catalogue still shows what earlier runs found | Carrying `discovery.keepsakes` would make the game treat them as already found |
| F-05 | Kept sentences (bookmarks) in New Game+ | Carried, as personal metadata | They are the player's own collection, like the noted-words notebook |

| F-06 | C-14's one guess, for characters no drawing can tell apart | Shown beside the guess and free to choose: the other character of the same shape (ロ/口, already exempt) and the same kana drawn small or full size (つ/っ, や/ゃ). Every other reading waits behind "More suggestions", which counts as assisted | Size cannot be read reliably from a drawing; charging help for it would mark honest writing as assisted |
| F-07 | Where the C-14 "More suggestions" button sits | On its own line under the reading, so the one guess and its free twin keep their row at every width | The narrow-screen test (320 px, 200 % text) showed the twin pushed out of view |
| F-08 | What of the encounter platform's record (`s.enc`) New Game+ keeps | Only the Tactics Board's personal bests; machines, solved steps, defeats, outcomes and wanderers start fresh | The bests are a pastime-like record (F-03); everything else belongs to the journey's story |
| F-09 | Whether Wait takes a language step | No: it is a decision, not an inscription; it answers nothing and costs the exchange, so it is never a way round the language work | E9 calls it an action; a written まつ would add a step that teaches nothing the encounter needs |
| F-10 | How long a Hush of "n exchanges" lasts | The player meets it for n whole exchanges (set at n + 1 by the move, counted down at each close) | Counting from the move's own close left a two-exchange Hush felt for one |
| F-11 | Whether the order numbers (C-70) appear in six-chapter battles | Yes, for groups: they change no rule and Robin decided them | C-70 |
| F-12 | How modifier encounters keep their length (E27's curve promise) | Two rules: where modifiers are allowed, a creature in a group keeps at least two knots (so いくつか, a knot each, never settles two creatures at once); and E27's own fallback, the breath (an extended response cannot be extended again the very next exchange) | Without them the curve model showed group fights cut by up to half; giving every creature an extra knot instead made Unravel alone lose on Standard, which breaks a promise |
| F-13 | What "three transitions away" counts, and what a tick does | Transitions since you last left the town's maps; a rest counts only if it came after you left; a story flag counts if it was set while you were away. A tick gives each resident a different place from the one they had (never the same spot again), drawn from the campaign's own stream when you come back, never on a load | W2: "never reshuffle as the player approaches"; a draw at the moment of return is the only one nobody can watch happen |
| F-14 | When "Have you seen…?" appears, and whom it offers | Only on people content marks as askable, and only when there is someone to ask about: people you have seen (kept with the save, twelve-chapter journeys only) or someone a quest of yours is seeking. Otherwise talking is plain talking. A sighting needs the asker to know the person (no omniscience) | W3; a menu with nobody in it would be a chore |
| F-15 | A road event and the game re-checking enter events after every scene | One offer per visit: asked again on the same transition (after a scene ends), or walking on to the same road's next map, offers nothing more | Found by the browser test: without it a road's first event re-offered itself the moment it ended |
| F-16 | Whether an exploration action can be re-done after its outcome | No: its arrangement stays (a followed notice stays up, a mended lamp stays mended). Before the outcome everything is free to change and retry; posting the same words twice changes nothing | W9 "state change once"; the field puzzles' own rule for finished puzzles |
| F-17 | What the action sheets record as language evidence | Choosing among Japanese pieces in a sheet is recorded in the puzzle's log, not as mastery evidence (there is no separate language step there). A word woven at an object (route, network sluices) goes through the real language step and is recorded as usual | CLAUDE.md: recognition and answer checking stay separate; only what was written counts as written |
| F-18 | How water settles in connected mechanisms (W13) | In one pass, no iteration: basins joined by open gates form one body; with a source it is full, else with a drain empty, else it keeps its water shared evenly (rounded down) | Deterministic, bounded by construction (no cycle can run), and every reachable state can be checked exhaustively |
| F-19 | Readings in a layered site (W16) | A reading can be chosen once something it rests on has been compared; several readings may be valid, and the player's own valid reading is the one recorded (the case engine now keeps a chosen valid hypothesis) | W16 "valid alternate interpretations handled"; the existing cases have one valid reading, so they are unchanged |
| F-20 | Where the exploration actions' fixtures live | On real maps (the Lantern Road, the Saltglass road), present only in a throwaway session with the flag `dev_verbs` (`?dev=verbs`) | A separate development map would have to be excluded from every map-wide test and census; a flag no journey can set keeps them out of play |
| F-21 | Where the expansion's records appear before the release (Stamp book, Travel volume, seal, stamp stands, New Game+ farewell) | Only in journeys of the twelve-chapter edition; on the Main Menu only with the development switch (`?edition=12`) or once the edition ships. A six-chapter journey's Ledger, title screen and maps are unchanged | Robin's standing rule that existing saves are not altered, and C-81's development switch; the six-chapter matrix keeps testing exactly what Robin plays |
| F-22 | Shogi on screen: how their pieces face, what Take back does to a finished game, and a stamp after Take back | Their pieces point toward you as on a real board, but their kanji stay upright so every reading can be read. Taking back the move that ended a game takes its result off the record (Take back never counts against you or for you). A stamp once pressed stays pressed | A learner reads readings upside down with difficulty, and the rule is that every kanji is readable with its furigana; a record that a take-back could inflate or deflate would not be a record; stamps are never withdrawn (09_RECORDS) |
| F-23 | The Distractions tab: what it lists, where the companion's games live, and when a record is made | Twelve-chapter journeys only; the index lists the games met (shiritori with a companion; shogi once Saltglass is reached; fishing once Yasu's survey has begun, the fishing engine's own rule). The companion's games are offered there, and Company keeps a pointer and the conversation about a game. Reading a page never makes a record; a pastime's record is made at first play, so loading a save never changes it | K7 ("offered here, not on the Companion tab"); the playbook's "no menu advertises a finished game that is only a stub"; the save-fixture test (older saves load exactly as they were) |
| F-24 | When Fuku offers a game at her bench | In a twelve-chapter journey, once her nameplate is home (her quest done); she walks down, says the pawn is from her games with Isamu, and offers to teach. Before that the bench is as it was | Her grief is the subject of Chapter 2's Saltglass story; the canon already has her and Isamu playing on that bench (sg.fuku_idle), so the offer adds no new fact |
| F-25 | Koi-koi's house rules (rule sets differ from table to table) | The sake cup is an animal only (never also a plain card); 猪鹿蝶, 花見で一杯, 月見で一杯, 赤短 and 青短 are five points each, 赤短 and 青短 together ten; タネ, タン and カス add a point for each card past five, five and ten; a hand of seven or more is doubled, and doubled again if the other player had called koi-koi; when the cards run out with nobody stopping, nobody scores; four of a month face up on the field is dealt again; a game is one, three, six or twelve months, as the player chooses | The commonest modern rules, said once in the game (The sets) and kept simple for a learner; no dealing sets (手四, くっつき), which teach nothing about the months |
| F-26 | Where the pilot expedition goes, and how it is found | The Flood Cellars under Reedwake's River Warehouse: a hatch in its floor, in twelve-chapter journeys once Chapter 2 is over; Old Yasu introduces it once; no quest entry (a Chapter 1 quest would change what "everyone helped" means for Reedwake's stamp). Its language is 〜て ある, taught at the foot of the ladder (an apprenticeship dungeon, A31). Its stamp is a dungeon stamp, pressed when the outflow door is opened | P07 asks for one optional dungeon in an existing region; Reedwake is every journey's home and has a keeper for it; 〜て ある is in the grammar but no chapter teaches it in a place where it is the point |
| F-27 | The small rules of an expedition visit | Walking onto an expedition's map without being on it begins a fresh visit, and onto any other map ends it (a save resumed after an interrupted entry or exit is never half in); a rest place pressed at full resolve keeps its use; once a lamp has been mended in any visit, later visits may mend it "as before" without the task (like Resolve this step: no new learning credit); the cellars' maps keep the checkpoint where you came down from (the expedition's own rule handles defeat inside) | D3 asks for coherent state under interrupted transitions; a wasted rest would punish curiosity; repeating a mended lamp's task on every restart would be the grind the plan rules out |
| F-28 | English lines that quote Japanese in a language step | The challenge screen now renders {漢字|かな} groups in its English fields (prompt, options, why, hints, explanations) with their readings; plain English is unchanged. New content writes every kanji in English lines that way; a unit check holds the cellars to it | "Every displayed kanji needs furigana" (CLAUDE.md); the browser test found 上げて shown bare in a prompt. Older content's English lines are untouched by this decision (none of them carry braces) |
| F-29 | How hard the cellars are, and how their groups are made | Relaxed: every creature alone. Standard and Demanding: the south hall's blot and the one at the door each come with a flour moth strayed from the rice store (one knot fewer than the mill's), as authored encounters on P04's platform, never as map-placement groups, so the six-chapter story's own rules (groups only in its final stretch and the Atlas; its recorded battles) stay exactly as they were. Measured whole-expedition with the player model: the lowest resolve between encounters is 11 (Relaxed), 8 (Standard, a rest used in some runs), 8 (Demanding, up to two rests); each group is within 5 exchanges and half a resolve bar of the blot alone | A pilot in the first region, met after Chapter 2: carried condition should be felt on Standard and Demanding and stay out of the way on Relaxed. The first try (map groups, a full-size moth) broke the story's group rules and, alone on Demanding, ran six exchanges longer than the blot: the full unit run caught both |
| F-30 | How the Atlas's commissions work where the plan leaves it open (D7) | The board stands in the Lantern Hall (twelve-chapter journeys, after the story). Practice topics are the three weakest groups of the Exams' own groups that have evidence (three or more items answered), never a group nobody has answered; with none, one topic of the weakest items anywhere. A topic fixes its items at acceptance; inside, every lantern and the creatures' revisits ask about it, weakest first, and an item never met is taught first (its grammar card, or the word or character with its reading). Lengths: short (one fork, no camp), standard (an ordinary run's shape exactly), long (every branch one room deeper). Three survey areas of three kinds of room each; a landmark task in every room of the area; a survey counts once every landmark on the road walked is verified (optional; an unverified one waits for another walk). "Surveyed routes become shortcuts" is safe passage: in later runs a room of a surveyed area has its way on open (no veil, the bridge's planks laid, the right door unlocked), its task still there to do. The Cartographer's Atlas is a page of the Map tab, not the travel volume (whose pages are the story's illustrated moments); all three surveys give the stamp and the cartographer's compass, worn at the hip. Two grammar points no chapter drilled (〜て ある, 〜て みる) gained drills so the family of endings can be asked at every profile | The plan names the three kinds and their rewards, not these mechanics; each choice keeps an ordinary run exactly as it was (tested), keeps the route fixed after mistakes (tested), and keeps practice inside the topic (tested) |
| F-31 | Who the delvers are, and how a meeting works (D8) | Six people the journey has already met (their scene seen): Yasu, Hana, Fuku, Wataru, Gorō and Hoshino; the new chapters' people join with their chapters (the plan's "about twelve"). Twelve-chapter journeys only. A seeded chance of one in two per visit of an expedition (rolled once when the visit begins; a restart rolls again) puts one of them in a side chamber (the Flood Cellars' lamp room, or by B2's spring); an Atlas run decides once when it begins, and they wait at its camp (a short road has none). The aid comes first and always: a rest (+4), a shortcut opened (Wataru, while the grate is shut), or what lies ahead shown (Hoshino: a floor's plan; at the Atlas, both roads at the next fork). Then one memory question from a moment the player saw with them, answered from a choice of three (the dialogue history and Known details are allowed: it is memory, not a test); remembered adds a rest; a wrong answer takes nothing away. Met once per visit or run; the journey keeps who was met and remembered (s.delvers, made at the first meeting) | The plan's fairness rules (never required, never removed) decide the shape; the people chosen are ones every journey can have met by Chapter 4, so nobody is a stranger and no later chapter is spoiled |
| F-32 | How a twelve-chapter journey reaches Manybridge, and what happens to the road north (P08) | After Chapter 2, Tetsu's ferry gains an eastern run (Saltglass's harbour ↔ Manybridge's pier, both ways, any day); the inland road north from Saltglass shows a notice that its bridge was washed out in the storm, and opens once Manybridge's second chapter is done (`mb2_done`). The chart draws the sea crossing as a curve. A six-chapter journey is unchanged: the same exit, read as a six-chapter game reads it, is the base's `ch2_done` (the geometry record checks this, and the exits in play under both flag sets) | R1 places Manybridge between Saltglass and Cinderwell; the road north must wait for it or Chapter 3 could be skipped. A washed-out bridge is an ordinary reason in a chapter about bridges, and the ferry was already there, its eastern run unnamed |
| F-33 | Manybridge's "Kansai-flavoured speech community" | The city's people speak standard Japanese, each in their own register (Fujiko's brisk plain form, Kansuke's old boatman's じゃ・のう, Ichi's child speech, Sen's polite clerk); Suzu alone speaks Kansai-ben, through her existing dialect layer (17 lines). The tasks are standard Japanese throughout | The plan asks for the flavour and for standard tasks. A second dialect for the whole city would put unexplained forms in front of F and E learners in every conversation, and Suzu's Kansai is her signature in the canon; here she meets a city that talks the way she does in temperament, not in grammar. A told colour word (おおきに) may be added with its own gloss in a later pass |
| F-34 | When the Exchange dispute or the lock-keeper's negotiation goes badly | Every conclusion leads on. If the dispute breaks off (walked out, or unresolved), the Exchange's people open the east storehouse anyway and the rice is found; what was learned and said stays as it ended (Gonta's confession only if he was heard). If Matsu shows the party out, Sen obtains the Exchange's leave to open the lock instead; Matsu's lamp (the Undercroft's rest place) is given only when she has read her husband's letter | E8's rule that a social conflict never blocks the story; the better outcomes are worth having (the lamp, the confession, the reconciliation) without the worse ones being a wall |
| F-35 | Where Manybridge's music sits on the intensity ladder | A zone of its own (chapter 3, edition 2), outside the six-chapter ladder the existing tests check; for now it is checked one step against Saltglass (a few more beats per minute, busier drums). The twelve-chapter ladder is checked as a whole when every new zone has its themes (P14) | C-22's ladder is a six-chapter fact; inserting a zone into it now would renumber what Robin plays. Four songs: the city, the Undercroft, a battle and a boss, each looping a minute or more and quoting the road motif (the boss also the hush motif) |
| F-36 | The Undercroft's creatures before their art | The five creatures (and the Nameless Bridge in battle) are drawn on existing Creatures A families in their own palettes (the crab family fits the Tally Crab; the others are interim), each audited "incomplete" with the reason; their move patterns use only moves their families deliver (the Lockgate Snail gathers itself instead of shrouding; the Bridge floods instead of sweeping). Their own families are art work for P16 under AC-1 (C-82) | Art waits for the art pass and its checklist; a move the family cannot perform would play with no delivery. The field guide and help are complete now |
| F-37 | The order of options in a multiple-choice step, asked again | The shown order is a base shuffle seeded by the step, turned by one place for each tick of the learning clock (from a seeded starting turn), so consecutive askings always differ and every place gets its share | The choice-order test (where an option sits never gives the answer away) found a two-option Manybridge step whose seeded order came out the same on consecutive askings; a rotation guarantees the change instead of making it likely |
| F-38 | How much of the Bridge-Name Census Chapter 3 holds | Seven bridges in Chapter 3's districts (the pier, the Exchange district, Warehouse Row), each named from a clue near it at the profile's tier; the quest completes with the seven and gives a printed bridge map. Chapter 4 adds Blockprint and Playhouse Rows' bridges as the census's continuation (P09) | The plan's "begun in P08, finished in P09": a quest that cannot finish for a whole chapter would sit open in the Journal; its continuation is a second stage of the same register |
| F-39 | When Manybridge's travel-volume pages are drawn | Its records now: the chapter stamp and the region stamp, pressed at a stand a few steps from where the ferry's passengers come up into the Exchange district. Its travel-volume pages (the arrival under the bridges, the Exchange in uproar, the Nameless Bridge given its name) are illustrated sequences, drawn in the art pass (P16) under AC-1; a page counts as witnessed from the scene it shows, so a journey played before the art exists keeps them | AC-1 governs illustration; the volume's witnessed rule already reads the scenes, so nothing a player does now is lost |
| F-40 | The river road down from Reedwake (R1 placement) | It opens with Chapter 4's festival, the Opening of the River (川開き): until then the river is closed to traffic below Reedwake, and Manybridge is reached by Tetsu's ferry. Built with Chapter 4 (P09) | The plan names both ways in; the festival's own name gives the river road its moment, and Chapter 3's arrival by sea stays the one way in while the city's names are lost |
| F-41 | Chapter numbers in the twelve-chapter edition's stamps and pages | New chapters' stamps say their twelve-chapter number (Manybridge's first is "Chapter 3"); the six chapters' existing stamps and pages still say their old numbers in both editions until the integration pass (P14) shows every number through `RB.edition.number` | Renumbering what a six-chapter journey shows is out of bounds (Robin's saves); doing it once, for every record together, in P14 keeps one rule |
| F-42 | Chapter 4's interiors, where the plan's list is longer than the chapter's scenes | Seven interiors: Sōbē's workshop, the press room, the courier guild hall, the theatre (stage, seats, the trap), the festival committee, the festival hall (open after the festival) and Shinobu's room in the tenement; the Understage's three levels and the boss's stage. The stage door is a door on Playhouse Row with its letter rack (Suzu's seed); the troupe manager's business happens in the theatre itself; the poster shop's work is the press room's board and the readers around the city | Every place on the plan's list keeps its purpose; a room with nothing to do in it would be a corridor. Rooms can still be added in P14 if the integration pass wants them |
| F-43 | How the festival preparations change the night | The core three (lanterns hung from directions, the stalls placed, the procession's order) are Tomi's main-quest tasks: each right plan becomes the festival's own arrangement (a flag per placement, read by the night's props), and a plan that could not work falls back to a sensible one with Tomi's correction, never a wall. The optional three (invitations by register, the food order by counters, the fireworks safety notice) are the side quest "Festival preparations: the extras" | C10: "each visibly changes the festival"; a wrong plan must not stall the story |
| F-44 | Yukata (C-46) | `RB.festDress`: only on the night of the Opening (once the committee has lent them, until the chapter ends the next morning) and only on Manybridge's festival maps, the traveller and the companion wear yukata in each one's own colours, on the road sprite and in the dialogue portrait. No battle figure or Harmony bust (there is no fight that night); nothing is kept in the save. Interim art under AC-1; the finished cut is P16's | C-46's "for the festival only": nothing worn can leak into a battle or a later chapter |
| F-45 | The press | A page is composed from blocks, never free text: a story (who, where, wanting, trouble, turn, ending) or a notice (what, when, where, the ask), each block a sentence at the profile's tier; then a proof read (kept as its own step), ink, press, peel, and the page posted. Readers react to the page's tags the next time you talk to them, twelve-chapter journeys only; the page goes into the record. No score, price or popularity count | C15 and C-24 (no grind); a reaction drawn from the blocks is always about what was printed |
| F-46 | Groups in the Understage | Beneath the Revolve (`mp.under2`) is Chapter 4's one map with authored groups (one more creature at Standard, two at Demanding), alongside the Stacks and the Conduits; the fairness test's list grew by that map. Groups stay authored on the creature, never made by map placement | The plan's crowded fights before いくつか (C-74) need groups where the story passes |
| F-47 | Where a wrong move sends you in the Understage's machines | Each procedure says so: the trap lifts and the weights start again from the beginning; the revolve and the Lord of the Understage go back to their last stable step (turning the revolve back before the curtain winds it forward again to the step before) | A half-turned revolve has a stable state a stage crew would keep; turning it all again would teach nothing new |
| F-48 | Where Chapter 4's stamps are pressed | At Manybridge's one stand (Chapter 3's): the chapter stamp "Blockprint and Footlights" and the region stamp for Blockprint and Playhouse Rows' help. Its travel-volume pages (the press, the rehearsal, the fireworks) are P16's art, by F-39's rule | One city, one stand |
| F-49 | The word lottery's words | Each slip is a challenge of its own (`pt.kuji_<word>`) with a kana-only tier for F and E and a kanji tier for I and A, so a drawn word is forged and recorded by the forge's existing rules; putting the slip back counts nothing | The checking and the evidence stay with the existing machinery |
| F-50 | The trap lift on the theatre's stage | Solid (2×2, not walkable): you work it from beside it, like any machine | Found by the story driver: standing on it never took the traveller below |
| F-51 | The story driver (test code only) | It counts a scene seen during testing as progress, follows a travel scene's warp when judging whether a road leads anywhere, and makes travel already made costly so it stops pacing between two stairs | Found by the F/Ren run's Chapter 6 stall and by Chapter 4's route; nothing in the game changed |
| F-52 | The wanderers (E3), moved from P08 | Gonta, Chapter 3's porter, on his barge by Playhouse Row: a guest who unravels a knot of the Block Golem each round and thanks you when you settle it. Hayashi the busker by the theatre: a guest who steadies you with his drum (a ward) and leaves after three rounds, as a street crowd does. Both until the festival night | E3's unique encounters on P04's guest platform |
| F-53 | The theatre's oldest play (the Hundred Tales seed) | A script on the theatre's shelf, 「百物語」, in the keepers' version (a lamp lit for each tale understood), its last page torn away; the notebook labels the real custom real and the keepers' version the game's own. A rumour only: no hall, no key | 07_REGIONS R1 and 04_DUNGEONS D9 ("Manybridge's oldest play is about it"); Kotonoha's keepers hold the missing tale |
| F-54 | Two people called Hayate | Chapter 4's courier is renamed Kakeru (カケル, "to run"): Snowbell's Hayate (the fox-trail watcher, Chapter 6 of twelve) came first. Only the name changed; the lines were re-entered in the review ledger | Found while planning P10's seams; two different people with one name in one journey would read as the same person |
| F-55 | Two more shared names, and a rule so it cannot recur | Chapter 3's Kayo (Ichi's mother) is renamed Haru (ハル), since the long quests have a Kayo; Chapter 4's Kanta (Sōbē's apprentice) is renamed Sanpei (サンペイ), since Snowbell has a Kanta. A validator rule (tools/expansion_rules.mjs, rule 8) now refuses a new chapter's person whose Japanese name anyone else in the game already has | Same reason as F-54; checking by hand missed them twice, so the check is now the validator's |
| F-56 | How a twelve-chapter journey reaches the Keepers' Road (P10) | The lower road from Snowbell to Lanternfall lies under an avalanche until spring (Hayate says so on Snowbell's road; the arrival repeats it), so Snowbell's east road leads up onto the Keepers' Road once Chapter 6 is done (`ch4_done&ed>=2`), and the Lantern Road's west end leads back up to the Keepers' Road's pass. The chart draws Snowbell–the Keepers' Road, and the Keepers' Road–Lanternfall once the chapter is done; the direct Snowbell–Lanternfall road is the six-chapter journey's (`ed<2`). A six-chapter journey is unchanged: the geometry record reads `ed<2` exits as the base's and leaves `ed>=2` ones out, as it already did for props and triggers | R8 places the road between Snowbell and Lanternfall; an avalanche in winter mountains is an ordinary reason, and it keeps both editions' roads honest without a second Lantern Road |
| F-57 | Weighing tellings, the chapter's verb (R8, C9, A49, A5) | A sheet (`RB.tellings`, `!hook tellings <id>`): each source is read at the profile's tier (its reading task is the language evidence), its claims are marked "can vouch" or not, and the reading is chosen. Marks get feedback (a claim marked the other way says why) and never gate anything. Only claims a source can really vouch for bind the answer: for an order, a reading is supported when it breaks none of them; for a choice, when every claim it needs is vouched for. Any supported reading succeeds; the one marked best saves a detour. What was decided is kept in the campaign's vars and flags (no new save field). The validator checks every telling (furigana, reading tasks, rules naming real items, a supported reading exists) | "Any well-supported reading succeeds, a better one saves a detour" (R8). The cave's order has exactly one supported reading, because a lock either opens or not; the cache and the Fox Bridge each allow more than one |
| F-58 | A wrong telling in the Scriptorium Cave (D6) | Lighting the lanterns in the song's order rings the bell too soon: the door stays shut and a shelf slides aside onto a short dead end whose carving says why ("the name lamp is lit before the bell"); coming back puts the lamps out and the shelf back. Nothing is lost, and the inner door opens only on the supported order | "A wrong telling leads to a dead end that explains itself" (R8), never a trap |
| F-59 | The vigil's endings (C-09: no Unravel) | The Hundredth Tale is a social encounter: Unravel only says it is no knot. It ends when the ninety-ninth tale is given its ending in words, or, with the companion's help filling the meter, when the last wick is put out together; after nine rounds Hisae finishes the tale herself. Dawn follows whichever way it went. The chapter's unit test found the together-ending unreachable (the meter's own ending fired first); finishing the tale now ends it, and each companion's help counts double | R8's "ended by finishing the ninety-ninth tale so nothing is left for a hundredth"; every ending must be reachable |
| F-60 | Ren's crossroads and night apart (14_COMPANIONS, S14) | Hisae offers Ren the keepership of the road at the evening; Ren goes alone to the Ridge Light, the lamp Ren never reached as an apprentice (the companion is absent while `kr_apart`, and Ren waits on the ridge). Hisae tells the player the lost traveller of that night was found safe; the two light the lamp together, and Ren will answer Hisae after the journey (`kr_ren_crossroads`). A bond event and a kept memory (the Ridge Light), placed after the personal quest's in What We Keep. Nothing touches Ren's own quest (ren_ushio): Hisae says nothing of Ren's teacher | S14; the sealed notes keep Ren's teacher with Ren's quest; the crossroads is answered at the end, where P17's ending can honour it |
| F-61 | The others' pressure: a quarrel and making up | Nao bristles at a courier's name in the registers (Sakichi), Mio at Hisae refusing medicine, Suzu at a question about Koume's letter; each evening offers to press or to leave it, and Hisae sends the two of you to make it up before the vigil. The player's reply is chosen (one of three, from casual to absurdly formal); making up is a bond event once a journey | 14_COMPANIONS asks for pressure with a quarrel and a making-up; the choice of register is the chapter's language at work |
| F-62 | The Teacher's Inkstone's reply | Hisae gives the inkstone after the vigil; Aya sends it down with the oil carriers; Tsuru's reply waits at Aya's teahouse once the chapter is over (no trip back to Reedwake). The quest's steps are the two the player actually takes: send it, then wait | A letter needs time to travel; the teahouse at the foot is where the carriers come back to. The first draft's opening step could never be shown (the gift itself starts the quest), and the quest guide caught it |
| F-63 | The Keeper Who Stayed (E17) | After the vigil, three lasting ends: tell Hisae plainly, read the register's last page with her, or say nothing. Each shows its intention first ("It can't be taken back") with a way to think again; Hisae remembers whichever it was. The decision opens at dawn (the side story's second step) | E17's permanent outcomes with the intention shown first |
| F-64 | The shuttered hall | Seen from the ridge's fork: shuttered, a sacred rope across its door and a plaque, "The hundredth was never told"; a pilgrim brings word that only one who knows the hundred tales can open it. No interior and no key in this chapter; the postgame opens it (P15) | 04_DUNGEONS D9 and R5's seeding |
| F-65 | The Keepers' Road's music | Its own zone (chapter 7, edition 2), biwa-led with a single rin at the waystations: the road and the lodge, the cave, the vigil (Ren's motif among the wicks), the hall, a battle and a boss. The battle and boss themes sit between Snowbell's and Lanternfall's on every measure the ladder uses (tempo, density, percussion, harmonic tension, layering, score), checked by the zone test; the whole twelve-chapter ladder is re-tiered in P14 | C-22 and F-35's rule for a new zone before the re-tiering |
| F-66 | Chapters 5–6's new creatures and changed-world lines (E23) | Three more kinds each, met only in twelve-chapter journeys: Cinder Orchard's Glass-Shard Wisp (a Mirror and Heat, in the kiln), Ash Mole (Gathering, a heaving Flood, Re-tying, in the old works) and Persimmon Imp (Heat, then a False promise that names come back if you wait, on the upper terraces); Snowbell's Icicle Bat (Chill and Gust, in the gallery), Snow Hare (Sweep and Chill, on the path) and Starling Wisp (a Shroud that light alone clears, among the star charts). Each has a move or combination no other creature has, its moves' text at four profiles, a place in the fairness table at the words known where it is met, and interim art on an existing family (F-36). One changed-world line each: Heita has heard of Manybridge's fireworks, Rokuta of a town with eight hundred bridges (once each) | E23's list; "the tools taught by then checked fair in their fights" is the fairness table; the six-chapter regions' own content is untouched |
| F-67 | The recognizer's stroke-data budget | Per character: 120 bytes a character (what the original 200 KiB allowed for 164 kana and 1,549 kanji), instead of a fixed 200 KiB | The twelve-chapter edition displays more kanji; the budget's purpose (compact data per character) is kept |
| F-68 | What the language review ledger lists | Every encounter of the expansion's chapters (Manybridge's had been missed: only the expeditions' were listed), the tellings, the companions' chapter memories, and the creatures the expansion adds to the six-chapter regions. The newly listed Manybridge lines were reviewed with Chapter 7's | "Every line of new Japanese through the review ledger"; the gap was found while reviewing P10 |
| F-69 | How Lanternfall (Chapter 8) hands over in a twelve-chapter journey, and where the Archive's road goes | The council scene is shared; in a twelve-chapter journey Yae says the fork lantern has its name back but the road above stays in mist, and remembers a letter: Ōmi writes that written leaves are washing up at Saltglass and that Nami of Kotonoha asks for help, with a leaf bearing はんたい (the word Lanternfall lost). The north fork's exit to the Archive's road reads `ch5_done&!ed>=2|yn_done`; a twelve-chapter mist scene stands where the six-chapter lock stood. The Cloudroad's own way north (P12) is added there | 10_STORY's order (9 Kotonoha, 10 the Cloudroad, 11 Steamhollow, 12 the Archive) and sealed S3 option 1 (the Cloudroad is a different road, meeting the existing one at the Last Lamp Hut); the archive phase already read `ch5_done&!ed>=2|yn_done` (P02). The six-chapter game's exit, lock and scenes keep their conditions |
| F-70 | The order P11 is built in | Kotonoha (the chapter, playable by ferry) before the Harbourmaster's quest, sailing and the small ports, then those | The boat is optional and Chapter 9 must play fully without it (R4, W7); building the chapter first lets the route through it be tested while the sea is built. The playbook's contents are unchanged |
| F-71 | Kotonoha's people's names | Nami (the keeper and boatwoman), Koyomi (the tide calendar's keeper) and Kihei (the sailor's echo), not Nagi, Sayo and Sōsuke: those names belong to Lanternfall's, Cinder Orchard's and Snowbell's people already | One name, one person (the cast's rule); the plan names no one on the island but Otoha's role |
| F-72 | How the keepers' hall's exhibition of tellings works | A third kind of tellings, `panels`: each panel shows one teller's version, any full set is accepted (no single right version), and each pick says what showing that version means; the choices are kept per panel and shown on the hall's panels | R4: "choosing which version each panel shows (no single correct one; each choice is explained)"; the Keepers' Road's two kinds (an order, a choice) each have right and wrong readings |
| F-73 | Conversations in automated runs (test code's player only) | An automated run plays a conversation encounter by its authored route even when a creature leads it (the creature is who you talk to); before, any encounter with a creature was played as a battle, so the Gardener ran out its nine rounds and its scene asked to come back later, and the route through Chapter 9 stopped there. The Keepers' Road's three conversations now also end by their routes | Found by the route through Chapter 9; src/engine/99_test.js says conversations follow their route; nothing a player meets changed |
| F-74 | Kotonoha's side stories (R4's five) | The Apprentice Who Cannot Read: three lessons the player gives (look-alike kana, は said わ, the small letters; at A, how to correct a child kindly), then Ao reads Nana's leaf, his own name. The Sailor's Last Letter: Kihei's letter lies in the sea cave; Hatsu, to whom it was written, was Mitsu's grandmother; three lasting ends shown before they are chosen (Mitsu reads it and frames it; it goes on the wind and Kihei with it; Kihei keeps it and stays by the pools). The Leaf That Is Your Name: Tokio finds it once two leaves are home; who wrote it follows the background chosen at the start (the courier's boss, the first customer, the teacher), and the answer goes from the Wind Stone. The Keepers' Census: two baskets (枚 and big numbers) and the trend. The Tide Calendar: four moon stones, the moon's order, the next spring tide, and the night the leaves rise | R4 names the five; the plan leaves their content open. The leaf with your name is ordinary loss (a note the wind took, a wrapping thrown away, a copybook left behind), never a name the Hush took (S1, S5) |
| F-75 | The companions on the island, and the rumour on the mainland | Nao's letter-leaf in a hand they know (read alone, nothing said yet), Mio's labels without bottles in Otoha's pressed leaves, Ren's three lanterns older than the Keepers' Road named in the old kana spelling (real: ゆふなぎ, しほさゐ, みをつくし) that only Ren reads, Suzu's half-written reply to Koume in the sea cave and the island's story on its rock stage told the way the exhibition hangs; each once, one Bond event (ko:beat). The rumour is told by Tetsu (sailors: shout a name and the dead answer) and by Shinobu (a tree of unsent love letters that flowers); Nami answers both on the island (words come, not names; the tree is real, the flowers are not). Ōmi's version comes with the licence (P11b) and the pilgrim's on the Cloudroad (P12) | 14_COMPANIONS's Chapter 9 pressure; R4: the rumour told differently by four people, each partly true |
| F-76 | The boat's ports, and the sea as a place | The boat calls at Saltglass, Manybridge and Kotonoha (Sazanami and East Landing join in P11d); Reedwake is not a port of hers (a river town upstream: its roads reach it, and a coastal boat does not). The sea is a map you sail across, not a menu: it is a story lock for fast travel (bring her into a port, or let the crew sail her in), and the route chart files the sea and the cabin under Saltglass, her home harbour. Fishing from the boat waits for Sazanami's station (P11d). The sea's creature on deck fights to Kotonoha's battle themes until P14 re-tiers the ladder | W7 names the ports by role, not by list; R4: the boat is optional and the ferry stays |
| F-77 | How sailing works (W7) | Each voyage has a wind from one of four quarters; heading with the wind behind, on the beam or ahead, the sail has a best trim of three (full, half, sheeted in) and the wrong trim only slows her (never a capsize, never lost). Sailing her yourself and letting the crew sail meet the same situations: one or two drawn per voyage from the seeded sea stream, plus the first voyages' own. Trouble on board (a sail, a line, the rudder's fastener, a hatch) slows her until it is mended, now with its words or free at the next harbour; a missed task only leaves it for port. The travel log is a section of the Records' volume; Q sets the sail | W7's "sail yourself or the crew sails; situations on the way; repairs; a travel log"; nothing at sea can be failed, as nothing on a road can |
| F-78 | When the licence's stages open (W7's "middle chapters") | The deal after Chapter 2; the yard as soon as Manybridge is reached; the painting once Blockprint Row is open (Chapter 3's end); the sea trials once Playhouse Row's festival is over (Tetsu runs the ferry day and night until then, Chapter 4's end); the examination straight after the trials; the maiden voyage straight after the licence. The plan's chapter for each stage is a pace, not a gate: the island's early visit waits instead on the leaves reaching the coast (P11d) | Only gates the story gives a reason for; a player who does it all at once has the boat around Chapter 5, which the ports reached allow |
| F-79 | Fuku's choice (W7 stage 1) | Fuku cannot hand over a boat whose name she has lost (Chapter 2's sea glass quest): until Asahi's nameplate gives it back she offers to wait, or the harbour's old pilot boat is there instead; once the name is back she gives the Chidori-maru gladly, to be named as the player likes (keeping ちどり is one choice). The quest's text names no boat whose name is lost | "Her choice; there are other boats if she declines"; the sea glass quest's premise is that the name is gone |
| F-80 | Naming the boat (W7 stage 2) | A sheet of kana tiles: one to five hiragana, the sign-writers' rules checked as the name grows (no ん or small kana first, a small ゃゅょ only after a kana ending in i, no small っ last), the bow shown painted with 丸 and the romaji; "Not yet" puts it off with nothing lost. Before it is painted, Sōbē has the player find the slip on his apprentice's practice board (look-alike kana; at A, 丸 written 九); Sanpei paints it and Miyo the 丸. The yard is the shut house by Manybridge's ferry pier, open in twelve-chapter journeys | "Naming is this world's magic"; kana tiles work by touch and keyboard with no IME |
| F-81 | The sea trial and the examination | The trial goes out and back to Saltglass round a buoy off the point (a trial draws no situations and puts in at no other port); bringing her in early, the crew can take her round; letting the crew sail it counts. Ōmi's examination: the form, then three questions in an examiner's register, where the respectful forms she uses for you (されます, なさる) are wrong for yourself; a wrong answer is asked again at once with the reason, and a break keeps the form passed. Ōmi's version of the rumour comes with the licence: lost post washing up on an island in no ledger | W7 stage 4 ("cannot be failed permanently: retry at once with feedback"); F-75's four tellings of the rumour |
| F-82 | Fishing at Sazanami and from the boat (W7, R6: "a new station for the existing pastime") | Moved to P15 with the pastime itself: A Quiet Cast appears only after the story, and its specification fixes three sites, nine fish, eighteen situations and milestones at 1, 3, 6 and 9 kinds; two new stations mean new sites, fish, situations and milestones, which belong with the postgame's work on its pastimes. Nothing in P11 depends on them | The Practice addendum's §5 is a tested, closed system; extending it is postgame work, not the ports' |
| F-83 | Props whose filled shapes never drew (a defect found in P11d) | The art for the Keepers' Road (P10), Kotonoha (P11e), the sea's buoy and East Landing passed point pairs to the prop kit's `poly`, which takes a flat list, so every filled shape in them was silently skipped (the sand lanterns' hats, the conch, the camphor's roots, the lantern roofs, the root arches). Each file now flattens its pairs; the props were looked at on a sheet afterwards | Found because East Landing's silt bars showed only their ripple lines |
| F-84 | Sazanami and East Landing (R6) | Sazanami: a hamlet up the coast road west of Saltglass (and a port); Isaku (Kiyo's elder son), Yone's nets, Uki's market (counted in boxes and counters, never money: the world trades in favours) and the tide-pool school where the player teaches Mina and Riku; its own song (Ripples) and stand. East Landing: the silted inlet round Saltglass's east beach that the call-bell case names; Genroku, of the Seto family that owned it, keeps it; rebuilt over visits (terms, a notice answered by Daigo, Sōta and Hama, the channel, the jetty), each job finished by the next visit (leaving for anywhere else and coming back), and his landing's own bell, the Seto crest's wave on its shoulder, hung again; then a port. It shares Saltglass's region and song. The maiden voyage's East Landing letter is walked round, since no boat can put in there until it is rebuilt | R6's activities, placed where Chapter 2 already pointed (Kiyo's son "up the coast"; the vanished landing of the call-bell case) |
| F-85 | Two "goes first" talk options on one person (found at P11's phase end) | A press reaction waiting to be heard stays first on its reader's talk list; anything later chapters put first (a leaf come home, a sea errand) goes right after it. A final content pass (`src/content/zzz_press_first.js`, sorting after every chapter) moves a waiting reaction back in front, so later chapters need not know about the press. The leaf test now asks for the leaf line first after any press reaction | Both are one-off lines; the reaction is the one the player caused most recently (by printing), and it is gone once heard |
| F-86 | あらゆる never taught in Chapter 9 (found at P11's phase end) | Otoha teaches it as she opens the hollow: the keepers' words before going under the roots, 「あらゆる 言葉 を 、 あらゆる 風 から 守れ 。」, with each companion's line (Ren's contrasts すべて, "every lamp", with あらゆる, "every kind of word"); `ko.arayuru`, the pattern of Chapter 7's すべて (C-74). Before the Root Hollows, where every kind of tangled word waits | The modifier is Chapter 9's (10_modifiers.js ch 'ko'); the playbook's taught-tool check expects each chapter's growth to be taught in its story |
| F-87 | Unravel drawing an ordering task in a battle (found at P11's phase end) | Kept: a battle knot can be any language step its item has, an ordering one included (a Chapter 2 sentence, an Atlas sign). The encounters browser helper answers an ordering task from its pieces instead of waiting for choice buttons. An Atlas sign's framing ("The sign has come apart") reads oddly in a battle; noted for P14's integration review rather than changed now, since narrowing the draw would move every seeded battle | The game was right; the test assumed choice mode |
| F-88 | Route planning on the Cloudroad (R2, A14, A52) | The planning sheet is the Keepers' Road's tellings engine used as a plan: the station board, the people's reports (each marked saw, told, rumour, signs, notice or map, with a reading task at the learner's profile), claims to vouch for or not, and a choice of road. The road the vouched reports support is the best; any other road still gets there (the long way round, or the closed road shown closed where it is closed, with the way round beside it); waiting a night is a choice of its own at the fog. The plan is asked once per leg, on leaving a station the first time | R2's "any reasonable plan gets through"; P10's tellings reused rather than a second sheet |
| F-89 | The relay (R2, A8) | `RB.relay` (src/engine/72r_relay.js) and its sheet: each message in parts, each part with what you have of it and ways to say it at your profile (plain, と言っていました, そうです, らしい, ようです, とのこと); exactly one faithful way per part. Overstating a part raises a flag the next station acts on (help sent the wrong way: men to clear a landslide that was a rumour, a search downstream for a courier who was safe at the ford, a horse taken to a blocked ledge, the night post held for snow that only "might" come), each put right by talking to whoever acted on it, calmly; understating costs nothing. Kept under `s.vars.relay_*` and `s.flags.relay_*_done` (no new save field) | R2: "overstatement sends help the wrong way, a recoverable side consequence"; never a failure or a gate |
| F-90 | Staying behind (10_STORY §8) | The companion stays as surety by `!hook comp_away` (src/engine/58s_surety.js): `s.comp` is empty for the stretch and `s.vars._away` remembers who waits; the maps the stretch crosses read `cr_apart` (`noCompanion`), the waiting companion stands in the Barrier office, battles are fought by one (the combat rules already know a party of one), no technique and no stand-in; `!hook comp_back` brings the same companion back with the guarantee. A save made in the stretch loads into it. A condition head `away` lets a scene speak of whoever waits | Ordinary campaign state rather than a new save field; the same companion always returns |
| F-91 | The High Pass (D1, D2) | Three floors and the hut: the Switchbacks (a slide takes a turn; the goat path round it brings you out above it, where levering a log clears it for good, a shorter way back down); the Rope Bridge (its notice read at four profiles before crossing, one at a time) and the snow shelter (three bundles of firewood, one rest each; the road keeps your place there whatever the woodpile holds; after the chapter Kumoi restocks it); the Snowfield (half-buried waystones, a drift dug through); the Courier's Hut (a checkpoint before the courier). The Pass is the view, and the way down north-east waits for Chapter 11 | D2: a story dungeon's checkpoints and a rest with limited uses |
| F-92 | The Courier Who Never Arrived and what became of him | A social and folklore encounter (no Unravel, C-09): Genta's echo at the hut tells himself the stations' versions in turn (he ran off with the post money: Heisuke's father's; he fell into the gorge: his widow's; a fox bewitched him in the fog: Kirishita's old folk), and each is answered with what the hut shows (the letter box's seal unbroken; his sandals set by the hearth to dry; the note on the wall in his own hand: 雪深し、晴れを待つ、便は濡らさず). The last version standing is the true one: he stopped in the snow and kept the post dry. Offered the rest of the run (humble お預かりします), he hands it on. The letter was Heisuke's uncle's to his father, with the money for their mother's medicine: the "post money" Genta was blamed for. Delivered at Sakashita, it ends the chapter | R2 "track which version is supported"; S14 (the courier rhymes with Nao's story; nobody says so) |
| F-93 | The Cloudroad's creatures on existing families (F-36) | The moves fitted to what each family draws: the Waystone Imp (golem) lies and strikes; the Cloud Ox (blot) sweeps and re-ties; the Pack-Lantern (lantern) heats, strikes and re-ties; the Blankpage Moth is drawn on the blot family in pale paper for now, because the moth family has no Hush, and its Hush silences the modifiers for two exchanges (E26). Their own families are P16 art work (AC-1, C-82) | The battle-delivery tests (creatures A and B) |
| F-94 | The Cloudroad's side stories | The Seven Seals (each station's seal kept by someone there; Tome's book filled; the records keep it). The Inn That Lost Its Guest Book (Kōsuke carried the Matsuba's book down to Sakashita; Tatsu's booking said 暮れ六つまでに, so both inns were right). The Mapmaker's Wrong Map (black for walked, red for told; finishing it puts Rin's commission, "The wrong map", on the Atlas board afterwards: a themed commission may now carry a condition, `if`). The Pilgrim's Errand (a rubbing of the pass's carved seal: 拓本, a real custom). Ginji's favour: he has no papers because no headman will write his name, so he goes round the Barrier; he asks you to carry headache powder openly to Chika's dispensary, and you can say no | R2's five, E3's smuggler "then asks a favour"; no currency is added (the coins in the story are story) |
| F-95 | The Last Courier's Family (E17) | After the delivery Heisuke comes to Sono's inn to bow his head, and the purse's old coins go where you help them decide, each end shown before it is chosen, "think again" always possible: to Sono's inn (its curtain renewed as 飛脚宿ゲンタ), to the relay (the new runners' sandals and hats, Genta's mark on their backs: Kanbe says so), or to a stone for Genta beside the hut on the pass (it stands there afterwards). Nothing gates the main story | E17's lasting outcomes, shown before chosen |
| F-96 | Small corrections found while building P12 | The barrier keeper Ujie is he/him (the English said "Lady Ujie"; now "Master Ujie"). Stamps with the motifs mountain, seal and letter now draw them, and Kotonoha's exhibition stamp, whose scroll had fallen back to the path, now draws a scroll | P11's records (scroll) and P12's |
| F-97 | The baths and the player's pronouns (R3, C-27, C-56) | she/her goes to the women's bath and he/him to the men's, with no question; they/them and custom pronouns choose once among the men's, the women's and the inn's reserved bath (貸切風呂, a real custom), kept for every bath after (`s.vars.bath_side`). The companions choose in character and always the same: Mio and Suzu the women's bath, Nao and Ren the reserved bath; when your bath is not theirs, you talk over the bamboo partition and they are not drawn in yours. A comfort setting, Bathing scenes (Settings › Learning & Challenge, beside Grave outcomes): Shown describes the bath, towels on and nonsexual; Summarised tells the bath in a sentence; the conversation and what follows are the same | Pronouns, never a gender, decide; nobody is assigned a bath; the setting is presentation only (like Grave outcomes, E17) |
| F-98 | How Steamhollow joins the road | The relay's first letter from the valley side (Rokubei's) reaches the party at whichever Cloudroad station, the Pass or Lanternfall's street they are next in (`yn_called`): the Pass's way down to the north-east opens, and the Pass becomes a place to travel to. The valley's north road joins the foot of the Archive road (`sa.road`, from below) only once the valley has agreed (`yn_done`), and the last chapter's opening plays there as before | The chapter order (Cloudroad 10 → Steamhollow 11 → the Archive 12); the last chapter is unchanged |
| F-99 | Encounter conditions on the campaign | An encounter's `when` may name a campaign condition (`state`: e.g. `item.yn_ledger`, `yn_float_found`), so the mediation can offer the ledger and the float only once you have them; the validator knows the key | Evidence you carry should be usable where it matters, and not before |
| F-100 | Nights apart and quarrels in Chapter 11 (10_STORY) | Mio (Kikue's offer of the dispensary) and Suzu (Koume's offer of the old act) each spend a night apart (`!hook comp_away night`), back at dawn with their answer; their crossroads is a Bond event, given before they leave. Nao and Ren quarrel briefly over the mediation and the old agreement, step out (`comp_away quarrel`), and are found and made up with the same evening, apologies both ways: making up is a Bond event and the quarrel lowers nothing | Each companion's arc as the story plan has it; a quarrel never costs Bond (C-67's spirit) |
| F-101 | Returning faces | Tokube, the tonic seller of Playhouse Row, has come up to the valley with his "wonder tonic" (the salesman of R3); Oshige, one of the ridge newcomers at the front desk, is the woman Mio tends in her crossroads and one of the three who remember a verse of the masseur's song | Fewer, fuller people (the cast's rule: one name, one person) |
| F-102 | The romance moment on the walk (C-67) | One choice, the player's: take their hand, or walk on side by side as the closest of friends; both warm, and the Bond is the same either way | C-67: romance optional and never worth more |
| F-103 | The Steam Vents (A11, D2) | Connected airflow: in the Valve Hall one valve at a time lets the steam out (opening one closes the other), and the steam it no longer holds is pushed into another passage; in the Channel a shutter sends it into the upper or the lower corridor, with a wheel at each end of the Channel on the same pipe, so a player who leaves with the shutter set and comes back down finds a wheel on their side (found by the reach test). Three hot pools restore a little and run cool; a checkpoint at the second | Nothing in a dungeon may trap the player |
| F-104 | Steamhollow's creatures on existing families (F-36) | Steam Wisp (wisp: heat, shroud), Pebble Stack (golem: charge, strike), Sulphur Toad (blot: sweep, strike), Lost Guest (echo: plea, strike), Towel Thief (moth: gust, strike), Stray Lantern (lantern: false promise, heat, re-tying; at first lie and heat only, which was the Persimmon Imp's own combination) and the Kettle Below (golem: charge, chill; a conversation, settled and never defeated). Their own families are P16 art work (AC-1, C-82) | The battle-delivery tests; each creature its own combination of moves |
| F-105 | The mediation and 全体 (S4, C-74) | Several authored ends and none a defeat (walked out, adjourned, measured, open, together); the best writes down what was agreed and that they still disagree about the open-air bath, to be argued once a month at the guild hall. 全体 is taught in a story scene, from the agreement's last line ("kept by Steamhollow as a whole") | S4: a disagreement kept honestly; C-74: modifiers taught in the story |
| F-106 | Steamhollow's side stories (R3's five) | The masseur's lost words (three verses from three people, put in order), the double-booked wedding (the feast on neutral ground, each inn cooking half), the retired actor (the town gossip's version against the old playbill in the troupe's trunk; Suzu prompts from the wings), eggs for the newcomers (Tama's recipe card as a procedure, three eggs delivered), the footbath poet (a short story read, put in order, and a question) | R3; no currency is added |
| F-107 | Small corrections found while building P13 | Recognizer test: the fixture of kanji the game does not use now leaves out the ones later chapters display (按, 罵, 轤…). Kanji chart: theme words for the new meanings (flowers, animals, food, people at a wedding), so the Other page stays small | Tests describe what is true as the game grows |
| F-108 | How the last chapter's road gets heavier (10_STORY §6a, S15) | Twelve-chapter journeys only, before the Hush is settled: colour drains map by map (a final grade over the world canvas, `ambient.drain`: the road 0.2, the camp 0.3, the gate 0.45, the Reading Room 0.55, the Stacks 0.65, the conduits 0.72, the Room of Set-Down Memories 0.6, the study 0.78, the Heart 0.85), the Last Lamp Hut kept warm; lanterns' name slips drift uphill on the road and at the camp; the Archive road's tune is heard thinned (`sa_thin`), then a drone with the road motif under it at the gate and in the Reading Room (`sa_drone`); inside, the Archive's own themes as always. Once settled, the colour and the road home come back. The dialogue, the book and the writing pad are never graded | AC-1 E (grade separate from form and light); C-22 (the score thins by writing, not by adding); canon events unchanged |
| F-109 | The companion's voice hushed (S15) | At the gate, right after its first sight, with a companion: the music stops, their line is silence, and you give their voice back by calling their name, chosen among look-alikes (a reading step at all four profiles; a wrong pick is simply asked again). Once only; never permanent; nobody harmed; no separation | S15's "hushed for a few lines until the player restores it" |
| F-110 | The four arcs' endings (14_COMPANIONS §2, S14) | Inside the companion's ending at the bridge (`end.<comp>.c`), twelve-chapter journeys only, each true to what the journey holds: Nao writes a forwarding address for the first time and the player chooses where (the Lantern Hall, Kirishita, or "wherever you are"; kept as a decision); Mio's honest labels and the one jar with none (Kikue named only if her night happened); Ren's answer to Hisae, a keeper who walks the road, for the relay to carry; Suzu's opening night in Playhouse Row (Koume's letter only if the books were shown) | One ending scene, extended; six-chapter endings unchanged |
| F-111 | The ending's romance moment (C-63, C-67) | Offered when the bond is close (Trusted Company or more): hold hands, a kiss, or stand side by side as the closest of friends; the companion's yes in their own voice; nothing explicit; Bond untouched whichever (kept only as a decision note) | C-67: optional, never worth more |
| F-112 | The New Game+ farewell (10_STORY §9a, S13) | Each companion: they cannot come because of their own unfinished work (Nao's undelivered letters and addresses, Mio's unlabelled jars and refusals still being learned, Ren's lamps and their teacher's sayings, Suzu's script and the troupe's opening night), the road folding back to the morning in Reedwake, the memories said to come along, goodbye for now; a solo version for a journey ended before a companion was chosen. New Game+ exists only in twelve-chapter journeys (F-21), so nothing changes for six-chapter saves | §9a's four versions and the solo one |
| F-113 | The twelve-chapter music ladder (C-22) | Checked in the twelve-chapter order (Reedwake, Saltglass, Manybridge, the Understage, Cinder Orchard, Snowbell, the Keepers' Road, Lanternfall, Kotonoha, the Cloudroad, Steamhollow, the Archive): every battle and boss theme a step above the one before. Re-tiered by writing, never by adding instruments or tempo: Steamhollow's battle theme (running arpeggios, the shamisen's answers and stabs, a bowed bass under A, sevenths at the cadences, busier drumming) and the Kettle's theme (the shakuhachi's answers, the shinobue's stabs, a bowed bass, a cluster on the shō) raised; Manybridge's and the Understage's boss drums thinned so they sit below Cinder Orchard's | C-22: "intensity comes from the writing, never from more instruments or a faster tempo" |
| F-114 | Small corrections found while building P14 | The Steam Vents are entered by a real exit down the stone steps once Aki opens the grille (a scene's warp could not be planned by the route, and walking down suits a player better). Conditions have no grouping: the validator now refuses a parenthesis in a map's condition. An unconditional repeating enter event is refused too (F-107's bath loop) | Found by the route and by P14's own tests |
| F-115 | The Hall of a Hundred Tales built whole (D9: "one wing first, played and judged by Robin, then the other nine") | Under C-81 nothing waits on a judgement: wing 1 is built and tested completely first (its own unit test, the route), and the other nine follow the same engine; Robin judges the Hall as a whole at review, and anything that should change for all ten is one engine and ten content folders | C-81 ("implement the entire expansion plan without consulting me") |
| F-116 | Where the Hall exists | Twelve-chapter journeys only, after the story: its door is the Shuttered Hall above the Keepers' Road (F-64), which only the twelve-chapter edition has; Tsuru hands over the key ledger once the story is over and the Keepers' Road is done. A six-chapter journey's postgame is unchanged | Edition rule (F-21) |
| F-117 | The Hall's rules made exact (D9 Rules) | A floor's trials count once every trial on that floor is done, and from then on stay done; defeat starts the current floor again (its trials, mechanisms, creatures, stations and machines) and nothing earlier; leaving (the return lantern or the sheet, anywhere outside battle) also starts the current floor again next time; an earned reprieve (wing 1: the riddle) lets you leave with the floor held exactly (its flags, where you stood, your resolve) for the next visit; suspend writes a per-slot recovery record (`<slot>:suspend`), replaced each time, used up on resuming, removed with the slot: never a seventh save. A finished tale can be walked again from the start as practice that changes no record | D9 Rules; spec lines 224, 228 |
| F-118 | Which wings open when | Wings 1–9 open in any order from the foyer; the tenth (the Hundredth Tale) once nine are relit. A wing's hearth is relit for good the first time you reach it; its lantern when its tale is done | D9 Structure ("Hearths at each wing's start are its checkpoints"; "All ten: the Hundredth Tale") |
| F-119 | The three choices per wing | The profile is always the journey's; the route (Consolidate or Grow) and the tactical setting (Relaxed, Standard, Demanding) are the wing's own, chosen on its card at the hearth and in force only inside the wing (the campaign's setting is never changed). Grow runs each of the wing's language tasks one level up, taught first and recorded as stretch; at Advanced it runs the task's own Advanced stretch (nuance, genres, other perspectives), never an invented level. The Grow constructions are stated on the card | D9 "Three choices per wing"; L18 |
| F-120 | Delvers and the tales' pages | A delver is rarer in the Hall (a 35% chance a visit, against 50% in the cellars) and their rest goes further (+6 against +4): "rarer and stronger here". Each tale's stamp is pressed when it is done; the travel volume's painted page of each tale (K2) comes with the art pass (P16), since the volume's pages are illustrated sequences; the optional note (route, tactics, answers and help by L2's category) is recorded now | D9 Rules and Rewards; AC-1 for the paintings |
| F-121 | Wing 1, The Lamp at the Crossroads | An invented wayside tale: Otami (she/her), a lamp-keeper hard of hearing who always asked travellers to say it again; Genza (he/him), a pilgrim who never asks; a traveller and a lost child (they/them). Ten trials on three floors: the tale in four pictures (A38), the signpost, the odd plaque out (A34: に/を with directions at F and E, ～と never ending in a request at I and A), the route card walked to the right lantern, lanterns in the mist (conditions: paper and airborne, in mist), the map in your companion's hands (A12; alone, the lamp holds it), the riddle stone (the reprieve), four lamps lit in Otami's order, Genza (a conversation: his pride kept, never corrected), and the lamp relit for the travellers (the capstone procedure, whose third step is asking again). Two patterns fixed per journey choose the signpost's destination, the plaques, the card's lantern, the spring's corner and the lamps' order | D9 Structure and the plan's wing list |
| F-122 | Wing 2, The Fox's Wedding | Built on a real image (狐の嫁入り, rain in sunshine, and the foxfire once said to light a fox bride's way); the tale is the Hall's own: Sayo (she/her), the one villager who lent the fox bride her umbrella, Kozue the bride (she/her), Gin the groom (he/him), Toku the go-between (she/her), Konta the bride's little brother (he/him), a lantern-bearer and a porter (they/them). Its theme is who does what, from whom to whom: particles (に, から, を, へ), あげる/くれる/もらう by direction, 貸す/借りる, and on the Grow route ～てあげる/～てくれる/～てもらう (Advanced: the humble and respectful ways to give, as stretch). Ten trials on three floors: the tale in four pictures, the gifts carried to the trays their tags name (より/様 on the real-style tags at I and A), the go-between's practice cards (one wrong card per level and pattern), the procession called out in the card's order (out of order, everyone drifts back: never a penalty), the foxfire in the sun-shower, Sayo's seat read from the seating list by your companion (alone, by Toku), the riddle (the reprieve), the borrowed things returned to whoever lent them, Konta's umbrella (a social encounter; he hides and comes back, no fail), and the cup passed round (the capstone, simplified from the real 三々九度 and said so). The pattern chooses the tags, the order, the seat and who lent what to whom | D9 ("each wing its own map identity, music and language theme"); C-09 (social, not combat, where the tale is about people) |
| F-123 | The wings after the first are built with a kit | `src/content/hall/05_kit.js` gives every wing the same furniture (return lantern, bench, sacred rope, stairs), the same trial-scene shape (its floor's flag, `hall_trial`, refresh) and the same level conditions (the profile, or one up on Grow), so the ten wings stay one engine and ten contents (F-115). Wing 1 keeps its own inline helpers; nothing about it changes | F-115 |
| F-124 | Wing 3, The Bell Before Dawn | An invented tale, with two real things labelled as such (the dawn bell's three warning strikes, 捨て鐘, before the hour is counted; the tanuki's belly-drum of the old tales): Jinbei (he/him), the old bell-ringer, ill; Shino (she/her), his granddaughter, ringing for the first time; the priest, Mataji the watchman and Sukezō the fisherman (he/him); Mame (she/her), a mother tanuki, and Kobu (they/them), her lost cub, in human shape as the tales tell it. Its theme is sequence and timing: ～てから; ～前に with the dictionary form and ～後で with the past; まで for what lasts and までに for a deadline; ～と, ～たら and ～とき; on the Grow route ～うちに and ～ところ, and at Advanced ～次第 (two grammar points added to the notes: うちに at Intermediate, 次第 at Advanced). Ten trials: the tale in four pictures; Jinbei's note, written in a muddled order and done in the order it means (out of order, everything starts again: no penalty); the bell-ringer's sayings (one wrong per level and pattern); the incense clock, burned hour by hour while each thing on the slate is done at its hour (too early says so, too late offers a new stick that starts the night again, undoing only the slate's work); moths in the dawn mist; the almanac read by your companion (alone, by Shino) and Shino's lantern hung on the hook of the right hour; the riddle (the reprieve); the lost cub found where the latest of three sightings puts them; Mame's drum (a conversation whose key line is まで against までに: "keep looking until dawn" is not the promise she needs); and the dawn bell at the almanac's hour (two versions of the procedure, one per pattern). The watchman was first called Heiji; a Manybridge person already has that name, so he is Mataji | D9; C-09; the cast's rule (one name, one person) |
| F-125 | Small corrections found while building wings 2 and 3 | The fast-travel browser test now starts a twelve-chapter journey, so every hub of both editions is on the chart (a six-chapter journey rightly hides the twelve-chapter places, so the old test could not pass once they existed). The Cartographer's Compass hangs a little further back on the battle figure, so it shows past the arm and the skirt from behind on every look (an interim placement; the art pass, P16, finishes it). The route audit no longer reports a voice the scene itself declares off-screen (`!speakerless`) | Tests describe what is true as the game grows |
| F-126 | Wing 4, The Borrowed Umbrella | Wing 2 already lends an umbrella, so here the umbrella itself is the character: invented in the style of real folktales, with the karakasa of folklore (an old umbrella grown into a spirit that hops on its one leg) and the river closures of the old highways (川留め) labelled as real. Gosaku (he/him), a peddler, borrowed it from Myōshin (she/her), the nun of a mountain temple, on a stormy night, meant to bring it back, and was kept away a year by the flood; the umbrella (they/them), sure it was never meant to come back, hopped home by itself. Neighbours Oume, Otake (she/her), Kyūbei (he/him) and Kaede (they/them). Its theme is requests, permission, intention and misunderstanding: ～てください and ～てもらえますか, and at Intermediate and Advanced requests that never name the thing (each pointing to one item only); ～てもいい, ～てはいけない, ～なければならない, ～なくてもいい; ～つもり (after the dictionary form an intention, after the past a belief) and ～ようと思う; at Advanced the humble ways to ask. Ten trials: the tale in four pictures; the neighbours' requests from Gosaku's pack (the wrong thing is simply "not what I meant"); the peddler's cards; Gosaku's diary of a year ago, followed fork by fork the way he went rather than the way he meant (a wrong turn starts the diary again); the reeds in the flood (rooted, in the rain); the river notice read by your companion (alone, by Gosaku) and the one crossing it allows; the riddle (the reprieve); the temple's rules kept on the way into the hall (what you must, may and must not do; trying what is not allowed is gently refused); the umbrella at the gate (a conversation whose key line is 返すつもりだった against 返したつもりだった); and the umbrella returned and lent again (the capstone). The traveller was first called Riku; another chapter's person has that name, so they are Kaede | D9; C-09; the cast's rule |
| F-127 | Wing 5, The Two Wells | Invented in the style of real folktales, with the proverb 井の中の蛙、大海を知らず and the village well-cleaning (井戸替え, an old summer custom) labelled as real. Two houses share a village with two wells: the east water sweet, the west bitter, and each house blames the other. Osugi (she/her) of the east house and Mosuke (he/him) of the west; her grandson Kōta (he/him) and his granddaughter Hatsu (she/her), who are friends; Kero (they/them), the frog who has lived in the west well a hundred years. Its theme is reasons and contrasts: から and ので, けど and のに, おかげで and せいで by whether the result is welcome, and at Advanced からこそ, ものの and にもかかわらず (the grammar point おかげで／せいで added). Ten trials: the tale in four pictures; three troubles mended at their cause (the bucket, the patch and the kennel show the trouble; the person beside each says why; mending the wrong thing changes nothing); the old sayings (one reason that doesn't fit); the four jars, sorted by the reason on each label rather than by which well (east water left three days in the sun is spoiled, west water boiled is fit to drink); the frogs (wet); the well-digger's record, read by your companion (alone, by Hatsu), and the one remedy its reason points to (the willow's roots, or a well nobody draws from; a lid is never it); the riddle (the reprieve); the cleaning's three jobs, each given by the helpers' own reasons (a reason someone can't is also what they can); Osugi and Mosuke (they walk off and can be talked round when the drought year, when the west well saved the village, comes out); and the well-cleaning itself (the capstone, a procedure: test the air, empty, wash with Kero kept safe in a bucket, bless both wells). The pattern chooses the causes, the jars, the record's reason and the helpers' reasons. The granddaughter was first called Yone; another chapter's person has that name, so she is Hatsu | D9; C-09; the cast's rule |
| F-128 | Wing 6, The Toll That Changed | Invented, with the barrier stations of the old highways (関所) and their public notice boards (高札) labelled as real. A toll gate on a mountain pass whose toll began as one mon for everyone and grew a rule for every hard case, until the board was all "if" and "however"; the last rule, let anyone in trouble through, was never written. Kihei (he/him), the old keeper, laid up with his back; Ibuki (they/them), the young keeper keeping it by the letter in his place; travellers Ofuku (she/her), Hanbei (he/him), Kōun (they/them) and Momo (she/her); Otsuta (she/her), who comes to the shut gate at nightfall with her baby in a fever. Its theme is conditions and exceptions: と, ば, たら and なら, ても, and on the Grow route ～場合, ただし and ～以外, at the top ～限り, ～さえ～ば and ～を除いて (three grammar points added: ～場合, ～以外／ただし／～を除いて, ～限り). Ten trials: the tale in four pictures; the toll board and four travellers, each given the wooden tag the board says they owe (a load, a child, a villager even with a load); the waymarkers' sayings, one wrong; the pass's five lanterns lit by the rule and today's sky (one exception stays dark: the bridge on a windy day, or the shrine when it is not a festival); the mist on the pass (the porters fly, in mist); Kihei's ledger, read by your companion (alone, by Ibuki), and the one traveller it lets go on after dark (with a lantern, or two together; nobody urgent is ever the one turned away); the riddle (the reprieve); the help board, each case hung beside what the toll house does for it (a decoy case fits no hook); Ibuki and Otsuta at the shut gate (Ibuki wrote "no exceptions" out of fear; Kihei's unwritten rule comes out); and the night at the gate (the capstone: a lantern for whoever is still out, a hurried merchant asked to wait till morning, a hurt woodcutter let in, the last rule written on the board). The young keeper was first called Sen; another chapter's person has that name, so they are Ibuki | D9; C-09; the cast's rule |
| F-129 | Two browser tests behind the P04 encounter screens | The browser suite showed two failures on every run since P04, both in the tests rather than the game. (1) battle_presentation's intent badges looked for "B: about to", but P04 added each creature's acting order to its badge ("Flour Moth B, acts first: about to Shroud"); the test now accepts the order between the mark and the colon, and still requires A, B and C and the same mark as the creature's slip. (2) battle_anim's companion technique pressed the sixth response card where it would be without scrolling: with a pointed 守る for each of you and a ready technique, the response list (a scrolling list by design) holds six cards and the last sits below the fold at 1280×800, under the step-back button. The helper now scrolls the card into view first, as a player does. No change to the game | C-81 (work through it) |
| F-130 | Wing 7, The House That Remembers | Based on a real legend, labelled as such: the マヨイガ of Tōno (Tōno Monogatari, 1910), the wandering house found empty with its bowls laid out and its kettle on the boil, which gives to the one who takes nothing (a bowl comes floating down the stream after them). The house's family is never seen; they are remembered in what they wrote and said, and every one of them leaves out what they mean. Owan (they/them), the house's red bowl in human shape, who never names themself; Magoroku (he/him), a neighbour come to carry something off. Its theme is what was left unsaid: leaving out what is understood, こ・そ・あ by where a thing is and by what the listener knows, の for "the one", and at the top 例の, 前者 and 後者 (three grammar points added: の for "the one", leaving out what is understood, 例の／前者・後者). Ten trials: the tale in four pictures; the things left behind, each hung under the note that means it without naming it (a decoy fits no note); the garden stones' sayings, one wrong; the kitchen memo that names nothing, done in its order (tea for a guest, or shutting up for the night); the lantern in the dark room (paper; it floats); the father's letter, read by your companion (alone, by Owan), and the one keepsake it means ("the comb one", "the one written first", "the former"); the riddle (the reprieve); the bowls by the stream, fetched as the house asks for "the one", each request referring back to the last; Magoroku and Owan (he never says whom he needs things for; asking draws out his mother, ill, with no rice); and leaving the house (the capstone: take nothing, answer the house's goodbye, promise not to look for it, and carry the bowl that floats down to the one it is for). The song plays its tune whole, then with notes left out over a held shō, then whole again. The neighbour was first called Jūzō; another chapter's person has that name, so he is Magoroku. The grammar points of wings 6 and 7 first had kanji without furigana in their titles and notes (the unit suite's grammar check, 1 failure on a clean copy of fa4aa6f); now in ruby | D9; C-09; C-22; the cast's rule |
| F-131 | Wing 8, Three Witnesses at the Inn | Invented, set at a snowbound inn on an old highway pass. A box left in the inn's keeping goes missing in the night; the maid saw a shadow, the pedlar heard footsteps, and the old guest says it must be a fox's doing, and only when their three accounts are put together does one small set of footprints appear. Omatsu (she/her), who keeps the inn; the witnesses Saki (she/her), the maid, Tōsuke (he/him), a pedlar, and Gonroku (he/him), an old guest who knows every rumour; Hisa (they/them), Omatsu's grandchild, whom nobody thought to ask; Kichibei (he/him), the traveller who left the box ten years ago and comes back for it. Its theme is whose account: what was seen, heard, told or only guessed, ～そうだ for looks and for hearsay, ～らしい, ～ようだ and ～みたいだ, ～はずだ, ～かもしれない and ～でしょう, at the top ～に違いない and ～とのことだ (two grammar points added: ～に違いない, ～とのことだ／～によると). Ten trials: the tale in four pictures; what each witness said, sorted by how they know it (seen, heard, told, guessed); the inn's scrolls, one saying wrong; the witnesses' places (the kitchen window, the stairs, the back door), each account weighed for whether it could be seen or heard from there; the snow fox (wet); Hisa's note, read by your companion (alone, by Omatsu), and the one road it points to; the riddle (the reprieve); the footprints in the snow, each named from the evidence (boots, geta, straw sandals, zōri); Saki and Gonroku (he said it was a fox; she said she saw it; each says too much about what they never saw); and the inn's record of the night (the capstone: write only what is known, and how it is known, before Hisa comes back with Kichibei and the box). The song tells one short phrase three times, on koto, shamisen and shakuhachi, the shamisen's a little different, then lays the three over each other; the night watch's clappers go round once every four bars. In review the witness choices became この証言は、あり得る／無理がある (first 確かだ／あり得る, which answered a different question), and the kitchen window became the back door (a window could not have shown the yard); the song's sections were doubled to loop past a minute, and one held note that clashed with its chord was moved. The grammar unit check's dictionary measure (at most 3% of example words unknown with only the core lexicon loaded) failed at 25 of 755 once wing 8's examples were in; the examples now space their words, and five common words the chapters already define (子供, せい, 場合, 中止, 以外, the last four with the chapters' own glosses) joined the core lexicon's grammar-example block (17 of 755). 田舎 reads as a whole word, so 舎 has a curated reading (しゃ) for the kanji pad | D9; C-09; C-22; the cast's rule |
| F-132 | Wing 9, The Crane's Return | Based on a real folktale, labelled as such: 鶴の恩返し, the crane that returns a kindness. An old man frees a crane from a trap; a young woman comes to the old couple's door in the snow, weaves wonderful cloth and asks never to be watched at the loom; when they look, a crane is weaving from her own feathers, and she must go. The seats at a farmhouse hearth (横座, 客座, かか座, 木尻) are a real custom, labelled with a note that their names vary by region. Yosaku (he/him) and Otoku (she/her), the old couple; the young woman (she/her), who never gives a name (the cast shows her as 娘, "the young woman"); Sabu (they/them), the neighbours' child; Gensuke (he/him), the cloth merchant in the town below; the lord's messenger (he/him). Its theme is to whom you are speaking: plain and polite speech, what you call people and your own family to outsiders, respectful and humble verbs, at Intermediate ～てくださる／～ていただく, at the top ～させていただく (three grammar points added: さん・さま・くん・ちゃん and your own family, ～てくださる／～ていただく, ～させていただく). Ten trials: the tale in four pictures; the old man's sayings of one day, each given back to the one he said it to (his wife, the child, the merchant, the lord's messenger), told apart by register and by what he calls them; the shrine's prayer boards, one wrong; the seats at the hearth, each person set in their place for the night (on her first night she is the guest; on a later night she is the youngest of the house and the village head is the guest); the frost at the window (frozen); what she asked before she shut the loom room door, in your companion's ears (alone, Otoku's), and doing it without looking (a torn place in the paper door is never looked through); the riddle (the reprieve); the lord's order passed down from the gate to the shop to the hearth, said to each listener as they should hear it, the order unchanged; Yosaku and Otoku (he bowed to the lord's man and never asked his own daughter); and the farewell (the capstone: once seen, she speaks to them as a guest again, and each person is answered as who they are to her: Otoku answers as family, you as a traveller, Sabu as a child, and Yosaku refuses the lord's man humbly). The young woman's last request is ～させてください: let her weave one more bolt, for them. The crane shares Keeper Tsuru's name; the wing never says so aloud (she looks back once, and her eyes remind you of someone; Nao thinks of writing home to Reedwake; Ren says only "a crane, was it"). The song plays one tune plainly on the koto and again in long formal notes on the shakuhachi, then both together, with the loom's ton, ton, karari every two bars. In review a beginner's line used kana おれ for 織れ, which reads as "I"; it is now おってこい. 拙 and 穂 needed curated readings for the kanji pad (拙者, 稲穂 do not split by the rules) | D9; C-09; C-22; the cast's rule |
| F-133 | Wing 10, The Hundredth Tale, and the rewards for all ten | The tenth lantern's light is the Hall itself on the night its last keeper stopped the Hundred at ninety-nine (the game's own), and the tale to be told is the player's journey; the real custom (a hundred tales by a hundred lights, something appearing after the last) is labelled. Sōan (he/him), the last keeper, and Kohaku (they/them), his apprentice. The door stays sealed until nine lanterns are relit. Ten trials mixing every earlier theme: your journey in four pictures (the traveller painted on the scroll is you, by name); the waystones of your road, the twelve chapters' places set in story order from a road record (each pattern asks for six of the twelve); the keepers' practice slates, one rule from each tale, one broken; the nine lanterns, five sayings each set by the light of the tale that taught it; the moss lantern (rooted); the keepers' note, read by your companion (alone, by Kohaku), and the hundredth wick where it says, wrapped "for the next one"; the riddle (the reprieve); the hundredth tale's four pages, each given its one missing particle or connective, in order (the other two choices are ungrammatical or plainly illogical, and the right one moves from page to page); Sōan and Kohaku (his fear is not of what appears after the hundredth but of the apprentice leaving once it is told; they tell it together); and the hundredth tale (the capstone: where it began, who walked it with you, what you saw apart from what you were told, and an ending left open). What appears after the hundredth is the teller's own shadow. No new grammar points: Grow states ～からこそ and ～ものの, both already taught. The song retells the Hall's own foyer tune. All ten (D9 Rewards): Keeper Tsuru is waiting at the tenth hearth (she came up with the Cloudroad folk's help) for her last conversation, in her canon voice, which closes wing 9's quiet nod to her name ("The ninth tale was the crane, wasn't it. …Makes me blush."); she gives the Lantern of the Hundred, a cosmetic keepsake (the held-lamp look), once; she stays by the hearth afterwards with a line of her own. Each tale has a travel-volume page (special: witnessed when told; revealable before by confirmation, then viewable, never witnessed or completed), shown as an interim plate with its title until the art pass paints it (P16); the wing card shows the optional truthful note (route, tactics, profile, answers and help used by L2's categories) once a wing is told. The companions' reflections are the lines each tale's last scene gives them | D9; C-09; C-22; C-49; H1; K2; the cast's rule |
| F-134 | The Hall's card showed Japanese without furigana | The Hall's browser test found that every wing's folklore label and Grow note on its card (English text quoting Japanese: 狐の嫁入り, 捨て鐘, 川留め, 井の中の蛙大海を知らず, 関所, 横座, 百物語, the grammar names) and wing 9's theme line showed kanji without furigana, against the furigana rule; the validator checks Japanese lines, not Japanese inside English. The notes now carry readings in the game's markup and the card renders them with the same ruby-aware renderer the language tasks use for their English notes; `hall_w10.test.mjs` checks every wing's card text, and fails on the old notes | CLAUDE.md (furigana); C-81 (work through it) |
| F-135 | The old guardians (P15e) | Nine, one per region, named from E16 and sealed note S7 (Kasane never one): the Founder's Voice (the Mill Echo's founder, Reedwake's mill), the Head Office (the office the Tide Clerk answered to, Saltglass), the First Fire (the Kiln Warden's, Cinder Orchard), the Sister Star (the star the Lamp That Waited was lit to answer, Snowbell), the Bell's Maker (who cast the Drowned Bell, Lanternfall), the Bridge Founder (Manybridge), the Cloud Ox Elder (the Cloudroad's summit), the Kettle's Mother (under Steamhollow) and the First Keeper (Kotonoha's first shelves of leaves). Each is built round one family: conditions (the First Fire is made of flame, so water weakens it and wind feeds it; the Kettle's Mother is wet through, so ice freezes her still and a stone cracks the ice), arrivals (the Sister Star's little lights, called home by a bell; the Elder's herd, answered by a bell or a rope), a procedure under pressure (starting the mill as it was first started; shelving the First Keeper's four leaves) or an argument (the Head Office, the Maker, the Founder, settled by listening, asking, showing and proposing). Five knots at most, fewer than the final boss: the difficulty is in reading and tactics, never health. A shrine (a stele, or a filing chest in the Saltglass office) appears only in a twelve-chapter journey after the story. A win presses the guardian's stamp with an honest record (how many meetings it took, counting steps back, and the tactical setting it settled on) shown plainly in the stamp book, gives a cosmetic keepsake once and witnesses its travel-volume page (revealable before then, H1); nothing is an essential (C-53). Hidden criteria name no place, so a journey under way learns nothing of later regions. Building the arguments found a gap in the encounter platform: someone leaving a conversation only left when no creature led it; the close now lets them leave either way (no existing encounter used a leaving party with a creature leading). Interim art on existing families with their own palettes until P16 | E16; S7; C-53; C-13; C-09; H1; C-81 (work through it) |
| F-136 | Ashihara Shinden (P15f) | The village S6 names, reached by a new path off the Lantern Road's north-east corner, open only after the story in a twelve-chapter journey, and on the chart from Reedwake. A name and five houses; the player helps it become a place in four parts, one journal entry: naming its three ways from what the people say of them (naming is this world's magic; two right names each, and the name given goes on the signpost and into the people's talk), its first two notices (washing moves off the drinking well to the stream or the reed bank, a market every fifth day by the notice board or the bridge: different valid notices change the village differently, A17), its first two quarrels as mediations (E8: the channel's water, shared by the time of day or by days; the forge and the baby, by hours or by moving the forge; each settled either way, or ended by a blunt word and taken up again), and its first festival (lanterns where the player plans them, food by the counters and, at the top level, the real old rice measures 合 and 升, the evening's order), a smaller cousin of Manybridge's (A50). Each part changes the map (signposts, a post box, a school once a teacher can address her letters, washing lines, a stall, a rota board, an anvil or a sign on the forge, a meeting house, lanterns that stay up); seven residents (Mitsue she, Yoshizō he, Taki she, Shō they, Natsu she, Kotoe she, Mohei he; names chosen to be unused elsewhere) keep two places each through the living world's routines (W2, the first real use of C.towns), pinned while their quarrel waits. Never money, never upkeep: the pedlar gives his goods away. Buildings that only stand once the village grows needed the map compiler to let them block only when shown (`grow`, opt-in, no existing map changed). Rewards: a hidden stamp, the travel volume's page of the first festival, and a planting hat. Its music is the village's own planting song and the same tune shared out as a dance for the festival (C-22) | R7; S6; A17; E8; A50; W2; C-22; C-81 (work through it) |
| F-137 | The returns and the companions' postgame beats (P15g) | Everything after the story in a twelve-chapter journey, and nothing else changes: existing scenes are wrapped, never edited, and a person's new words come first in their talk only under `ed>=2&postgame` (the six-chapter Snowbell board reads exactly as before, tested). Kotonoha: a second root arch at the back of the Garden of Unsent Words opens onto a small grove where the names nobody came for hang on one tree; what fills it follows the Archive's ending (its readers copy the unclaimed names and give them to the tide, or the names drift there by themselves; neither, if neither ending is recorded); a leaf to read at four levels (へ, ている, ても) and a leaf of your own to leave, to whom you choose; Otoha has a word afterwards. Cinder Orchard: the story's festival is a one-time night, so the yearly one is a map of its own (the story's square, three of the festival games' stalls, real ways out); Hiro asks whether you are coming, and keeps count of Suzu's twenty festivals (each night with her is one paid back; no reward, just his book). Snowbell: the observatory lamp's rota on the hamlet's board follows Hoshino's choice; Akari's letter to whoever keeps the lamp, at Sousuke's (〜てください; 〜ておく; humble requests at A). Lanternfall: printed objections from Manybridge on a new board (に反対する; softened objections; 〜かねる), and the councillor on importing them. Manybridge: Sanpei prints the broadsheet's last editions himself before handing it on; they report what the player did (the Hall, the settlement's festival, the bridge's guardian, the Archive's ending) and nothing they did not. The Mist Barrier is a teahouse, as its officer once joked: Gonza moves from the gate to the counter (a separate actor, so there is one of him at a time; the gate's Gonza is `!postgame`), ordering tea at four levels. The festival hall is open all summer. The companions' beats (S14), each only with its companion, so a visitor is never in two places in another journey: the troupe passes through the festival hall and Suzu and the player do the double act for them (three new bits, as in Playhouse Row; Koume laughs first; in the morning they go on ahead, this time to wait, and Tomi remembers the summer); at Kirishita Sakichi's letter of the week is waiting and Nao opens it at once (A: reading what Sakichi means, not only what is said), then runs a letter of yours (to Hiro, Tsuru or Hisae) and the reply is waiting when you come again (the game keeps no calendar, so "within the week" is a return visit), with a line more if Nao's forwarding address is Kirishita; Kikue visits the festival hall on holiday with a jar of her own labelled 「未定」 (she labelled what Mio leaves blank; her shelf at the springs keeps its unlabelled jar); Hisae and Ren walk the Keepers' Road on the night they light every lamp along it in turn, as the old keepers did once a year (the road is lit nightly again since Chapter 10; the walk is the old custom), and Ren says the night's saying (〜たら; 〜なら at A). The review ledger gains the prefix `rt` | 10_STORY §10; S8; S14; C-81 (work through it) |
| F-138 | The pastimes' remaining content and the boat's destination after the story (P15g) | Shogi's two places (S9): Snowbell's abandoned game at the inn is a mate-in-one puzzle at its place, the gold that rolled off the board being the piece in hand (the board opens straight onto it; it joins the ladder's puzzles only once solved there; the defending king written 玉, as puzzles write it); at the hill bench Isamu, home from the Last Lamp Hut (his quest done), plays Fuku every morning and has not won yet, and either will play you (only after the story, Fuku's nameplate home). A Quiet Cast's two new stations (F-82; W7 "fishing from the boat", R6 "a quiet place to fish"), twelve-chapter journeys only, so a six-chapter journey keeps its three stations and nine fish exactly: Sazanami's rocks and the boat at the One-Pine Islet, three fish each (mejina, kasago, kyūsen; saba, isaki, madai: no biological claim, as the first nine), six situations each at four levels (48 variants, the stage's own actions; the stage gains the rocks' and the deck's scenery and a rock, weed and a neighbour on the left), introduced by a note of Yasu's at each station. The milestones keep their meaning: the nine-fish spread is the first nine; the coast's six make a spread of their own (`fish.coast`). "The boat's postgame destinations" became one place: the One-Pine Islet, the sea chart's islet with the pine, a port only after the story (the crew sails there like anywhere): a jetty, the pine, the boat's fishing station, and a stone where boats carve their names, where the Chidori-maru's name already is (a reading at four levels, then your boat's name carved; Fuku, if the boat was hers, remembers the summer they went). The coast's fishing content joins the review ledger under `coast` (the first nine keep the Practice addendum's notes) | S9; F-82; W7; R6; C-81 (work through it) |
| F-139 | The postgame's phase end (P15h) | One phase-end test gathers the playbook's P15 evidence across the postgame (`tests/unit/postgame_phase.test.mjs`), beside the per-system tests: every Hall wing (not only wings 1 and 2) taken through going in, defeat, the emergency retreat, the reprieve, the suspend point and completion; zero-delver runs read as journeys that have met nobody a delver could be (delvers come only from people already met), each wing completing with none met; "the optional stays optional" made checkable: outside its own content no postgame system's state gates an exit, a person, a thing, a scene's branch or an ending, and the only places it is read at all are Sanpei's last editions, which report it; the exit's "no empty port" read as every port having the boat at its pier and something to do ashore. The test found the three argument guardians (the Head Office, the Bell's Maker, the Bridge Founder) without the explain/suggest help every story encounter offers after a defeat (E19), so the companion would have described a creature's move cycle; they now say what the argument is about and a way through | Playbook P15 Evidence and Exit; D9; E16; E19; C-81 (work through it) |
| F-140 | The travel volume's chapter numbers | The volume belongs to the twelve-chapter edition (F-21), so its headings and criteria number chapters in that story order (Cinder Orchard 5, Snowbell 6, Lanternfall 8, the Archive 12); a page's chapter is an old number, a twelve-chapter key or `post`; the guardians', tales' and festival's pages are grouped "After the story". An automated story run names the boat at once (the old name, else はやて), as every other sheet of its kind already does | A defect found by the P16 survey; the chained route (XP79) found the missing automated path |
| F-141 | The pages after the story (P16c) | The twenty pages that were interim plates are painted: each old guardian's page is its place just after it settles (the keepsake in the light, the presence thinning away upward as motes, a few last ones still rising at the hold), built as a small set in one-point perspective with a framed foreground (AC-1 §A, §E, §F); the Kettle's Mother's page reuses the Kettle's own chamber from Chapter 11's page, quiet, with the hood on a boulder at its edge, so the same place looks the same; each sequence's title is the guardian's own name (the stamp's), never a second name. The ten tales are ink-and-wash picture scrolls in the game's pixels: washes fading into mist, one accent colour and a seal (a shape, never a letter) each, inked in from the middle outward over the one-time action. The festival has two compositions, the lanterns along the way the village chose (road, channel or slope) and the dance round the fire with Shō keeping time on a cooking pot, then Mitsue holding out the hat. Each page is linked from its record (`seq`, `scene`) and keeps the record's special rules (H1) | AC-1 (C-82) for the look; F-21, F-140 for where they sit; H1, K2 unchanged |
| F-142 | U05/U06: the book everywhere, the classic folio retired | C-79 kept the book a preview "until the shell reaches every page (U03 to U06)"; with U05 and U06 it does, so the book is the Ledger for everyone (`ledgerStyle` 'book' or 'flat'; a settings record that still says 'classic', or none, reads as the book, so nobody's journey or save changes) and the classic option is gone from Settings. Parity is kept, not assumed: the classic folio's controls on Journey and Company were recorded from the last build that had it (`tests/fixtures/book_parity_classic.json`) and the book is compared with that list in every run of `tests/e2e/book.mjs`. U05: everything shown over the world speaks through the five type roles (title, confirmations, word help, keyword cards, notices, chapter cards, writing prompts, battle slips), labels are small capitals instead of shouting capitals, an aside is a slip with a folded corner, a decision is a sheet with a deckled top, danger is a seal and its words; nothing an input depends on changes geometry (the pad, the answer field, the slips' hit areas). U06: every other folio is a sheet of the same book (the paper's tooth, headings in the display face). Two defects found and fixed: the book's tab row on phones could be nudged sideways by a few pixels (the outer tabs' faces reached past the rail), a one-word contents link was 31 px wide (now at least 44); and Back on an open word-help card in the open world opened the Ledger underneath (the card is now dismissed first everywhere). The folio test now reads the open book once its short opening motion has finished, and the rail's steadiness with reduced motion | C-79; playbook §15A U05, U06; UI-A04, UI-A05, UI-A13–A17 |
| F-143 | P16b: the interim creatures' own drawings; the book's small-screen defects | The 46 creatures drawn on a borrowed family in the interim (F-36, F-93, F-104, F-135) each have a drawing of their own on one creature kit (`src/ui/78u_creature_kit.js`), one family per creature, none shared, with the same move kinds, timings, effects and frame budget as before: nothing about how any of them fights changes, and a creature whose drawing is missing keeps its interim one. The kit draws by anatomy over a shared pose vocabulary; moves are performed by the kit (tested once for all, `tests/unit/creatures_c.test.mjs`). Guardians with no moves of their own (the Head Office, the Bell's Maker, the Bridge Founder) are still drawn whole, with a rest and a strike. The Kettle's Mother is drawn on the Kettle Below's drawing, larger and older, and the Cloud Ox Elder on the Cloud Ox's, standing, with a mane and prayer strips: an elder of its own kind, not a borrowed family. The bosses' canvases were held to about 300 × 296 so a full enemy-art cache stays inside the 48 MiB budget the Creatures A test sets. Marks that read as kana on the first drawings (the Ledger Weevil's back, the Driftword Jelly's insides) were redrawn as bars, curls and dots. Their map figures are the same drawings at rest, reduced to the map's scale (each map pixel the colour most of its block holds, so the pixel art stays crisp), instead of the borrowed shapes. Separately, with the book now everyone's (F-142) the browser suite's first third found the book's wider faces and the dialogue's book layout breaking small screens: on phones the dialogue sheet sat in a narrow column beside the portrait (the line wrapped to twice its height, the speaker's name ran over it, the sheet covered the player) and Keep sat outside the sheet; the creation slip's summary and the cloth buttons ran wider than a 320-px screen at 200 % text; a writing field's Submit could sit under the software keyboard; the worn list's "nothing worn" overflowed; the Following mark could not wrap; a closing Ledger's inert copy was still in the page when the next one opened. All fixed in the book's own rules (the phone dialogue takes the full width with the portrait pinned on the paper beside the name, so nothing of it stands up into the world, the line starts below the name however it wraps, Keep is a mark on the paper; summaries and labels wrap or clamp; Submit is brought into view with its field; a closing copy goes when a new Ledger opens) | C-81, C-82 (AC-1, art work only); F-36, F-93, F-104, F-135, F-142 |
| F-144 | P16d: the nine interim regional kits reviewed, the yukata's cut | The census counted 130 maps on "interim" regional kits (the Cloudroad, the Estuary, the Hall, Kotonoha, the Keepers' Road, Manybridge's two parts, the sea, Steamhollow). In the shipped game a region's kit is its palette and its props (each with a flat drawing and an art-resolution one; the World Proof's ground dressing was then a development view, `?dev=world`, for every region alike; **superseded by C-86**, which makes it and the proof's light the game's look on every map), so the art pass reviewed all 63 props on prop sheets at art resolution against the first six chapters' and redrew where they fell short: the Cloudroad's packhorse; the Understage's festival lanterns (round paper chōchin, ribbed, lacquered caps) and its stage lift (a frame, a ladder into the dark, lit boards when raised); the noodle stall's sign, whose two strokes and bar read as a Latin H. The rest stand as drawn; each kit's header now says so, and the census reads 0 interim. The yukata (F-44) has its cut on the road sprite: a print of small morning-glory florets in the obi's colour, a wide obi, and its bow at the back; the side view keeps the plain robe; still only on the festival night's maps, still nothing kept. The hood keepsake is drawn on the Harmony code bust; a painted bust file for it stays on the register for whoever paints the busts | C-82 (AC-1); F-44; P16_ART.md |
| F-145 | MT-1, the music performance (Robin's instruction narrowly widens "no remote assets") | **Precedence:** MT-1 permits optional, same-origin, static Ensemble files beside the hosted page and the build/CSP changes they need (`connect-src 'self'` only when a ready recording is embedded); everything else in the standing rule holds, and the single file plays Original with no request. **The lead's design choices** (docs/MUSIC_PERFORMANCE.md): the warm-Original strategy (the current cue's player goes on unheard behind its output gain and a gate on the music room's return) rather than a parked synth with reconstructed state; a short first-pass file to a join past every tail plus one circular steady cycle, not a whole first pass (half the download, the same music past the join to −144 dB); each cycle its own source on the score clock with a 50 ms crossfade on matching phases, starts on the frame grid; every note rendered once and placed exactly (SC-1 shared a synth per part); Opus first and MP3 second (FLAC would be four times the bytes); a linear handover crossfade (the performances are correlated); the trim calibrated through the game graph to the Original's integrated loudness | MT-1's annex lets the lead improve the internal design while keeping its behaviour; each choice is measured in docs/music/ensemble/qa/. Not decided here, left for Robin: the rights question of distributing recordings made with the GPL-2 TimGM6mb bank (assets/music/ensemble/NOTICE.md). Robin listened to the captures on 2026-10-12: "It sounds great, nice job" |
