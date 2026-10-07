# 11 · Contradictions and open decisions

*Expansion plan, draft 2 (2026-10-07, after Robin's answers). Planning only. Spoiler-safe.*

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

The register has five parts:
- **A. Decisions that blocked a feature.** All answered on 2026-10-07.
- **A2. New questions raised by those answers.** **These are the ones waiting for you.**
- **B. Tensions this plan resolves.** Please confirm or overrule; most are still open.
- **C. Already resolved.** Recorded so nobody reopens them by accident.
- **D. Defects found by the audit.** All fixed on 2026-10-07.

## Still waiting for you (at a glance)

| # | Question | Label |
|---|---|---|
| [C-54](#c-54--old-saves-when-the-new-chapters-ship-from-c-02) | Old saves when the new chapters ship: what they show, whether one can seed a new game, and whether all six chapters ship at once | **Open** |
| [C-55](#c-55--festival-rewards-when-the-default-mode-gives-none-from-c-17) | Does the opt-in timed mode of a festival game give anything? | **Open** |
| [C-56](#c-56--the-bath-for-theythem-and-custom-pronouns-from-c-27) | Which bath for they/them and custom pronouns? | **Open** |
| [C-61](#c-61--the-playtime-target-for-twelve-chapters-from-c-01) | The spec's playtime target for twelve chapters | **Open** |
| [C-57](#c-57--what-fixed-at-generation-means-for-the-atlas-from-c-18) | The Atlas keeps adapting its practice words; only its shape is fixed | **Confirm** |
| [C-58](#c-58--two-ledgers-from-c-37) | Names for the two Ledgers | **Confirm** |
| [C-59](#c-59--a-quarrel-and-the-bond-table-from-c-12) | A quarrel never lowers Bond; making up raises it | **Confirm** |
| [C-60](#c-60--unravel-where-nothing-is-tangled-from-c-09) | Unravel is hidden where nothing can be unravelled | **Confirm** |
| [C-33](#c-33--hanafuda-a-traditional-card-game) | Hanafuda: a traditional card game, in or out? | **Open** |
| [C-62](#c-62--suzus-dream-from-c-31) | Suzu: star, double act, or both | **Revisit** |
| Part B | 33 smaller tensions with a proposal each | **Open · proposal stands** |

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

## A2. New questions raised by the answers

### C-54 · Old saves when the new chapters ship (from C-02)
**Open.** Robin's rule: a six-chapter save can't continue in the twelve-chapter edition. What's left to decide:

1. **What an old save shows.** Recommendation: it stays in its slot, untouched, labelled "From the six-chapter
   edition", with Continue and Load disabled and a one-line reason. It is never deleted or rewritten
   automatically. The player can still delete it, as now.
2. **Whether it can still be looked at.** Recommendation: yes, read-only: its Journey summary, stamps, witnessed
   seals and learning progress.
3. **Whether it can seed a new game.** Options:
   - **(a)** "Begin the new edition from this save": a New Game+ start that carries the learning record, the
     appearance and the records (stamps, seals), with the story from Chapter 1. It is the spec's defined NG+
     carryover (line 252), so nothing about the story is invented. **Recommended.**
   - **(b)** Nothing carries; a plain New Game.
4. **One cut-off or several.** If the six new chapters ship one at a time, each release would stop saves again.
   Recommendation: develop them together and ship them as **one edition**, so saves stop only once.
5. **Your own save.** Once the twelve-chapter edition replaces the current build at the same address, your
   finished save can be viewed but not continued. Anything you want to do in it, do before then.

### C-55 · Festival rewards when the default mode gives none (from C-17)
**Open.** The default practice mode gives no rewards. Does the opt-in timed mode give anything? The contracts say
"no speed-only reward" (PRACTICE_CONTRACTS line 125), and a reward only in the timed mode would push players
towards it (G10).
- **Recommendation:** the timed mode keeps **personal records only** (best score, best time), which Robin already
  allowed for minigames (G11). Festival keepsakes and stamps come from **taking part in the festival's story**
  (helping set up, the fireworks, playing at all), never from scores, in either mode.
- **Alternative:** a cosmetic prize for a timed score. It needs a contract amendment and is not recommended.

### C-56 · The bath for they/them and custom pronouns (from C-27)
**Open.** The game asks for pronouns at character creation (they/them, she/her, he/him or custom) and never for a
gender. Robin: follow pronouns exclusively. So she/her goes to the women's bath and he/him to the men's. Not yet
covered: **they/them**, which is the default choice and also Nao's and Ren's, and **custom** pronouns.
- **(a) The inn's reserved bath** (貸切風呂, *kashikiri-buro*, a real and common option in Japanese inns), with no
  question asked. **Recommended**: it follows pronouns without asking anything.
- **(b)** Ask once at the entrance which bath to use (three curtains: men's, women's, reserved), remembered and
  changeable.
- **Companions** follow their own pronouns the same way: Nao and Ren use the reserved bath; Mio and Suzu the
  women's.
- When the player and the companion are in different baths, the conversation happens over the bamboo partition,
  a familiar onsen moment. The scenes stay towel-wrapped and nonsexual, with the "shown / summarised" setting.

### C-57 · What "fixed at generation" means for the Atlas (from C-18)
**Confirm.** My reading of Robin's two answers together: "fixed" is about a dungeon's **shape** (its rooms, length,
foes and rules), which never change after generation or after mistakes. The Atlas already fixes its shape for each
run. What it varies is **which words** each encounter practises (your weakest), and that keeps it useful and
replayable. So the Atlas stays as it is. Yes or no?

### C-58 · Two Ledgers (from C-37)
**Confirm.** Robin: both can be called Ledger, as long as they are distinct. Proposed names:
- **The pause menu: the Wayfarer's Ledger**, the book you carry (Journey, Words, Satchel, Map, Company).
- **The title's six saves: the Inn Ledger** (宿帳, *yadochō*): the register travellers sign at an inn. Six names
  in it fits a game about borrowed names.
- The change is a few labels (planned for Phase 1). Until the names are confirmed, the plan's text still says
  *folio* for the pause menu, as the code does. Other names are welcome.

### C-59 · A quarrel and the Bond table (from C-12)
**Confirm.** The Bond table is exact and capped at 12. Robin: after a disagreement "they'll make up and be better
for it". Proposal:
- A quarrel **never lowers Bond**.
- Making up is a Bond event, with a Memory page and an illustration.
- A quarrel is always authored and story-led, never triggered by the player's Japanese.

### C-60 · Unravel where nothing is tangled (from C-09)
**Confirm.** In a puzzle, social or objective encounter with nothing to unravel, Unravel is **hidden**, and the
encounter's opening card names the ways it can be resolved. A greyed-out button would only add noise. Where
something can be unravelled, it appears as usual.

### C-61 · The playtime target for twelve chapters (from C-01)
**Open.** The spec's target is 10–15 hours for a first playthrough (line 36). Six new chapters, each about an
existing chapter's size, would roughly double the main story. Options:
- **(a)** A new target of about twice the old one (20–30 hours), verified by timed play. **Recommended.**
- **(b)** No total target; a per-chapter target instead.
Either way, playtime is never claimed without timed play.

### C-33 · Hanafuda, a traditional card game
**Open.** Draft 1 referred to this question without giving it an entry; here it is. Robin excluded a collectible
card game. **Hanafuda** (花札) is different: a fixed, traditional deck of 48 cards, twelve months of four flowers
each, played as *koi-koi* in Japan for centuries. It is close in feel to a card game, so it needs Robin's say-so.
- **For:** strongly cultural; seasonal vocabulary (松に鶴, 梅に鶯, 月見で一杯); reading-based; fits the festival
  and the boat's Distractions corner.
- **Against:** card-game feel; historically tied to gambling (in the game: points only, never stakes).
- **Recommendation:** yes, as a late pastime (koi-koi against NPCs, points only), after shogi and karuta.

### C-62 · Suzu's dream (from C-31)
**Revisit.** Robin's impression is that Suzu wants to be a star of sorts, and Robin hasn't played her story yet.
The canon so far says she wants a double-act partner (相方). The two can meet: a double act that aims for the big
stage. Decide after you've played her story.

---

## B. Tensions this plan resolves (please confirm or overrule)

Rows marked **Open · proposal stands** are ones you haven't answered yet. Until you do, the plan follows the
resolution in the row.

| # | Tension | Sides | This plan's resolution | Where | Status |
|---|---|---|---|---|---|
| C-04 | Persistent health vs mistake costs that never compound | R1 wants health and status to persist; spec line 128 | Carry over only what tactics cost; restore what language mistakes cost at each encounter's end | D2 | **Open** · proposal stands |
| C-05 | Stationed resources vs resource softlocks | R2 §2; spec line 216 | Exits always reachable; leaving is always possible; defeat applies the expedition rule | D2, D3 | **Open** · proposal stands |
| C-06 | Suspend in the Trials vs six visible slots and no hidden saves | H2; spec lines 224, 228, 238 | A per-slot recovery-style record, removed with the slot, never listed as a save | D9 | **Open** · proposal stands |
| C-07 | Ambushes vs visible, avoidable foes | R1; AGENT_COMMON | Ambushes only in dungeons whose preview says so; telegraphed on the map | E20 | **Open** · proposal stands |
| C-08 | Arrivals and wanderers vs "Relaxed: one creature" and rules without randomness | R2 §1; COMBAT_NOTES | Relaxed never sees hostile arrivals; every random draw is seeded per save and stored before the battle | E2, S2 | **Open** · proposal stands |
| C-10 | Lasting side-quest outcomes from "choosing incorrectly or waiting" vs no irreversible punishment for honest mistakes | R1; spec line 208 | The game shows the intention it understood before a committing action; recognition failures never commit; Wait counts only when chosen | E17 | **Open** · proposal stands |
| C-11 | NPC deaths vs protected people | R2 §1; spec lines 94, 54, 242 | Never unchosen companion candidates, never people the player helped in a way that undoes their help; rare and authored | E17, 10_STORY | **Open** · proposal stands |
| C-15 | A listening star using the device voice vs no listening validation from synthetic speech | H4; spec lines 280, 218 | Labelled "listening practice with your device's voice"; offered only where a voice exists; absent, not missing, elsewhere | L3 | **Open** · proposal stands |
| C-16 | A "Distractions" tab vs never launching place-based activities remotely | R2 §6; practice index rule | The list lives in Company › Pastimes; companion games start anywhere safe; place games at their place | K7 | **Open** · proposal stands |
| C-19 | Seals that survive deleting a save vs deletion removing a slot's data | R1's original wish; spec lines 228, 252 | Seals belong to saves; viewing never depends on any save (H1), so nothing is lost but the mark. **Alternative:** a device-level "ever witnessed" record, which needs a spec amendment | S3, K4 | **Open** · proposal stands |
| C-20 | Always fully viewable vs spoilers | H1; Robin's own wish to avoid spoilers; HX52; Astra | Veiled until revealed; one press per page or chapter; a setting removes the veil. H3 replaces HX53's "event-time appearance" for the Main Menu | K5 | **Open** · proposal stands |
| C-22 | Inserted chapters vs the strict music intensity ladder | audio rule ZM2 | Re-tier battle and boss themes across twelve chapters; keep the loudness ceiling | 07_REGIONS | **Open** · proposal stands |
| C-23 | Achievements without trackers vs counting milestones | R1 | Curated stamps only; natural milestones allowed (Robin's own example); no visible counters towards them | K1 | **Open** · proposal stands |
| C-24 | Printing stories "without restraint" vs never faking understanding of free text | R1; spec lines 182, 206 | Story blocks with tags; readers react only to what the blocks say; proofreading kept separate | C15 | **Open** · proposal stands |
| C-25 | Construction tasks vs "accept every valid answer" | R0; spec line 138; validator gap | Authored alternatives, checked by an upgraded validator | L7, S5 | **Open** · proposal stands |
| C-26 | A dialect field guide vs "questions always use standard Japanese" and no caricature | R1; dialect rules | The guide is for understanding only; questions stay standard; native review per dialect | C5 | **Open** · proposal stands |
| C-27 | On-screen bathing vs the player's chosen pronouns (Japanese public baths are usually separated by sex) and tone | R1; spec lines 62, 72 | **Robin: follow pronouns.** she/her: the women's bath; he/him: the men's bath; they/them and custom pronouns: C-56. Towel-wrapped, nonsexual, adults; a "shown / summarised" comfort setting | R3, C13 | **Decided · detail open** (C-56) |
| C-28 | Shogi pieces vs furigana on every kanji (and no furigana toggle) | spec line 186; project rule | Pieces show their kanji *with readings*, as Japanese learner sets do. **Robin: build it as I see fit; Robin has never played**, so it is designed to teach from nothing (08_CULTURE C12) | C12 | **Decided** (2026-10-07) |
| C-29 | A "Grow" route for Advanced players vs no level above Advanced | R0; spec lines 168, 170 | Grow means nuance, genres and conflicting perspectives for A; never an invented tier or certification | L18 | **Open** · proposal stands |
| C-30 | Road events that "disappear for a time" vs no missable content | R1; spec line 208 | They re-offer themselves on later visits until resolved; the Journey keeps them as unfinished | W5 | **Open** · proposal stands |
| C-31 | Suzu "aspires to be a star" vs canon (she isn't one; she wants a double-act partner) | R1; canon | Robin's impression is that she wants to be a star of sorts; the canon so far says she wants a double-act partner (相方). The two can meet: a double act aiming for the big stage. Decide after Robin has played her story | C11 | **Revisit** after your playthrough (C-62) |
| C-32 | New Bond events vs the exact Bond table capped at 12 | company.md | Rebalance the table across twelve chapters; cap unchanged; no gifts or loops | 10_STORY §7 | **Open** · proposal stands |
| C-34 | New Game+ carryover of records | spec line 252 (must be defined) | NG+ carries stamps, seals, stars and the portfolio | K9 | **Open** · proposal stands |
| C-36 | Spacing reviews by days vs "nothing reads the wall clock" | Astra; practice core | Read the date only to space reviews; never show overdue counts or streaks | L6 | **Open** · proposal stands |
| C-37 | "The Ledger" means two things | Robin calls the pause menu "the Ledger"; the game calls it the *folio*, and its *ledger* is the title's list of saves | **Robin: both are Ledgers, kept distinct.** Proposed names in C-58 | — | **Decided · names to confirm** (C-58) |
| C-38 | A day/night system vs the flag-only night design | R1 floated it; the night-leak continuity test | Not now; story-set evenings only in new regions; routines move on ticks | W4 | **Open** · proposal stands |
| C-39 | Companion highlighting answers in story dungeons vs honest evidence | R2 §3 | Recorded as answer-supplied help; changes nothing else | E19 | **Open** · proposal stands |
| C-41 | "Overly assisted" by weighting suspected fishing vs inferring motives | R2 §4; Astra | Robin's H4 first version (under 30% of questions assisted) decides; categories by what help supplied; weighting later | L2, L3 | **Open** · proposal stands |
| C-42 | More than three creatures vs layout, Harmony and memory | R1; audit | Three for ordinary encounters; up to five actors in authored set pieces with a two-row formation | E12 | **Open** · proposal stands |
| C-43 | Hands-on sailing vs untimed play, no reflex, no excessive walking | R1; spec lines 116, 218, 56 | Direct control with nothing chasing and no failure; skip at any time; story events never skipped | W7 | **Open** · proposal stands |
| C-44 | Early island content vs "only words the player can know by then" and every profile and companion | R2 §10; AGENT_COMMON; spec lines 246, 298 | Story phase, profile and introduced concepts read separately (S1); concept gates validated | R4, S1 | **Open** · proposal stands |
| C-45 | "Elimination" in group encounters is undefined | R1 | Defined per encounter, never the most severe by default | E17 | **Open** · proposal stands |
| C-46 | Festival clothing vs garment shapes hard-coded in every renderer, and keepsakes that may change colour only | R1; audit | A fifth garment cut (yukata), built in all renderers, interim art now, painted layers in the art pass | C10a | **Open** · proposal stands |
| C-47 | "Suspend only in the Trials" vs shiritori's "rest later" and the Atlas's resume | H2; audit | H2 is about expeditions; shiritori's pause is a game pause, unaffected; the Atlas resumes by ordinary autosave, consistent with H2 | D3 | **Open** · proposal stands |
| C-48 | Chapter numbers in the consultation (5, 8) vs the renumbered ten | R1; the context note says they were illustrative | Mapped to twelve chapters: the boat around new 7–8; the island's main chapter is new 9 | R4 | **Updated** for twelve chapters (C-01) |
| C-49 | Tsuru as the Trials' lore source vs her canon voice | R1 | Fits: she had a teacher, and keeper lore is hers; lines in her dry voice | D9 | **Open** · proposal stands |
| C-51 | The spec's 10–15 hour target vs a longer main story | spec line 36 | Restate the target after deciding C-01; measure, never claim | 10_STORY §11 | **Open** (C-61) |
| C-52 | A Main Menu illustration of one companion when Continue travels with another | H3; Astra | The other participants stay fixed; only the player's look follows Continue | K2 | **Open** · proposal stands |
| C-53 | Superboss and Trials rewards vs "no exclusive essentials" | A30; R1; spec line 126 | Stamps, illustrations (revealable) and cosmetics only | E16, D9 | **Open** · proposal stands |

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
| Festival games | Untimed, reward-free practice by default; opt-in timed mode | C-17 |
| File size | Not a concern below 100 MB | C-21 |
| Learning-record fixes | Done, by my judgement; nothing earned is taken away | C-35 |
| Shogi | Built as I see fit, designed for someone who has never played | C-28 |
| The two Ledgers | Both "Ledger", kept distinct (names: C-58) | C-37 |

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
