# 05 · Language: evidence, mastery and Japanese as a tool

*Expansion plan, draft 8 (2026-10-09, after Robin's sixth round of answers and the playbook). Planning only.*

Two halves:
- **L1–L6, the learning record:** what the game knows about a player's Japanese, and how it shows it.
- **L7–L20, language play:** new ways to *use* Japanese, which Astra's group A and Robin's review rated highest.

## What exists today (audit summary)

The learning record is simpler than the plans assume, and a few existing behaviours are defects worth fixing
whatever is decided.

- **Item kinds:** kana (`k:`), vocabulary (`v:`), grammar (`g:`), comprehension (`c:`). **There is no kanji kind, no
  construction kind and no listening kind** (`learn/10_mastery.js`). Kanji exist only as a derived "met" set.
- **One assisted boolean per answer.** The record stores no help *type*, no stroke retries, and not whether kanji
  or kana was written.
- **Mode tallies:** choice, recall (typed) and hand (handwritten). They count every attempt, including wrong ones.
- **Ordering answers are recorded as `choice`**, so sentence construction looks like recognition
  (`ui/65_challenge.js:413`). Ordering can only be arranged, never typed or handwritten.
- **Promotion beyond box 2 was weaker than its comment said** (fixed on 2026-10-07): one typed or handwritten
  attempt *ever*, even a wrong one, satisfied the "varied" condition for good.
- **Defects found in passing** (all fixed on 2026-10-07, with tests; part D of 11_CONTRADICTIONS.md):
  - **Foundations copy steps** show the answer yet are recorded as clean handwriting.
  - **Story activities' Translate** sets `assisted` and never resets it between customers or letters
    (`ui/75_activities.js:51,120`).
  - **Words › Grammar met always shows its empty message.** It reads `RB.grammar.points`, which doesn't exist
    (`ui/50_menu.js:439-443`). The lantern activity's `labelOf` has the same bug.
- **Intervals are counted in learning events**, never days.
- **Measured share of authored steps:** 68% choose, 25% write, 7.3% order. **English-intention construction is
  24 steps: 2.3%.**
- **Listening:** the device's local Japanese voice reads dialogue, word help and lessons. **No task uses audio.**
  The spec: "Never require hearing" and "Do not claim… listening validation based solely on synthetic speech"
  (lines 218, 280).
- **The richest construction system already built** is the post-story villagers' letters: 220 reply families and
  3,167 accepted writings, including every allowed order, answerable by pieces, typing or handwriting
  (docs/practice/suite_b.md).

---

## L1 · An evidence log that records what was actually shown

**What and why.** Robin [R1]: track words, kanji and kana adequately: "how often you get assisted, need to redo
strokes, etc." Astra: keep recognition, understanding in context, construction, typed and handwritten production,
listening, assisted practice and transfer distinct; "None needs to be treated as morally superior."

**Approach.**
- **New item kind `j:` for kanji**, with readings tracked separately. Seeing 水 in みず does not certify すい.
- **New evidence modes:**

  | Mode | Records |
  |---|---|
  | `recog` | choosing among options (existing) |
  | `context` | understanding a sentence or passage in a situation |
  | `construct` | ordering or forging a sentence (new; today recorded as choice) |
  | `typed` | typed production |
  | `hand` | handwritten production; kana or kanji noted |
  | `listen` | understanding spoken input, device voice, optional |
  | `transfer` | the item used in a materially different context type from its earlier successes |

- **A short attempt log per item** (the last 12 attempts): `{mode, contextType, helpCategory (L2), firstTry,
  recognitionRepairs, strokeRetries, exposed}`. Fishing's `recentAttempts` is the precedent.
- **Input statistics kept apart from language accuracy.** Stroke retries and recognition repairs are *input* data,
  shown separately and never counted as mistakes. Robin asked for them to be tracked; Astra warned that "someone
  struggling with the input surface could appear to know less Japanese than they actually do."
- **Encountering versus using.** Reading a label twenty times ("met") stays separate from applying a word
  successfully in twenty contexts.
- **The defects above were fixed on 2026-10-07** (Robin asked; C-35 left the judgement to me): copy steps record
  as guided practice; the activity Translate flag resets per customer or letter; the promotion rule's "varied"
  needs a clean typed or handwritten answer in the current run; the Grammar page reads `RB.grammar.get`. What
  remains for this work: ordering recorded as `construct`, and copy steps recorded as `exposed` in the new log.
- **Migration.** Additive: older items gain empty logs. Nothing is invented: past attempts stay summarised in
  their tallies.

**Pros.** Every later feature (stars, word pages, the portfolio, reactive commissions) depends on honest evidence.

**Cons.**
- Save size grows: 12 compact attempts × about 1,000 items is about 150–250 KiB, acceptable.
- Promotions after the 2026-10-07 fix are slower for items answered only by choice, by design; nothing already
  earned was lowered ([11_CONTRADICTIONS.md](11_CONTRADICTIONS.md) C-35).

**Effort:** L.

---

## L2 · What help supplied: the assistance categories

**What and why.** Robin [R2 §4]: assess every assist system; weigh heavier when someone is consistently assisted or
fishing for answers. Robin's later first version [H4]: a star when fewer than 30% of an exam's questions were
assisted. Robin noted that choosing a recognizer candidate other than the first currently counts as assisted, which
"would need ironing out first." **Robin settled it on 2026-10-07 (C-14):** the pad shows one guess, redrawing is
free, and asking for more suggestions counts as assisted.

**Approach: categorise every help by what it supplies, relative to the skill being assessed.**

| Help (all that exist today) | Category | Counts as "assisted" for a star? |
|---|---|---|
| Text size, contrast, reduced motion, control guidance, word spacing | Access | **No** |
| Furigana (always shown; there is no toggle, by rule) | Access, except in a reading-recall question, where it would supply the answer, so such questions never show the kanji at all | **No** |
| Pad: same-shape twin (ロ/口) | Input | **No** (already exempt) |
| Pad: redrawing a character before confirming | Input | **No** (C-14) |
| Pad: **"Show more suggestions"**, then any of the recognizer's other readings | Answer-constraining | **Yes** (C-14). The button says so, as Translate does |
| Pad: chart pick, "How to write" model | Answer-constraining or supplied, for that character | Yes |
| Word help or lookup inside the question | Conceptual, or answer-constraining when it defines the asked word | Yes, if it covers a word in the answer |
| Translate (English line) | Conceptual (comprehension tasks: answer-constraining) | Yes for comprehension; no for a production task whose English is the prompt anyway |
| "I don't know": answer shown | Answer supplied | Yes |
| Companion highlights a suitable response (E19) | Answer supplied | Yes |
| Battle tactical help (what a move does) | Tactical, not language | **No** |

- **Repeated opening of the same help doesn't pile up.** The question is *what* was supplied, not how often it was
  looked at (Astra).
- **Several mild hints that together reveal the answer** count as answer-constraining (authored per task family).
- **Where it's recorded:** each attempt's `helpCategory` in L1's log; the strongest help per question for exams.

**Effort:** M (classification and wiring).

---

## L3 · Mastery exams and stars

**What and why.**
- Robin [R1]: optional handwriting and comprehension mastery tests over *groups* of words, kanji or kana; small gold
  stars that are "inconsequential"; "a reinforcement of the why you learn the way you do"; hints allowed, but no
  star "if you were overly assisted."
- [H4]: **separate stars per input type** (handwriting, multiple choice, typed, listening); first version: a star
  when **fewer than 30% of the exam's questions were assisted**; weighted measures later.

**Approach.**
- **Groups** come from the content:
  - kana rows;
  - kanji by theme or by region met;
  - vocabulary by region;
  - grammar families (for example "requests", "conditions").

  Each group lists its items. A group is offered once the player has met most of it.
- **An exam** is about 10–15 fresh questions over the group, in **one chosen input type**. Hints stay available
  (Robin). The exam records each question's strongest help (L2).
- **The star.** Awarded per input type when **fewer than 30% of questions** used help in a counting category. That is
  Robin's rule; L2 defines "counting".
  - The four stars sit side by side, none above the others. A choice star is as bright as a handwriting star.
  - **A "completed with help" mark** records the attempt honestly without a star (Astra: "demonstrated
    independently / completed with support / needs another opportunity").
- **How a question counts** (proposed; C-75). Each question in an exam is a fixed slot that keeps its *first committed*
  answer: **independent** (right, with no counting help), **assisted** (right, with counting help) or **missed**
  (wrong first answer, even if put right afterwards). The star needs **fewer than 30% of the exam's questions to be
  assisted or missed** together: Robin's threshold, with a wrong first answer counted like help, so fishing gains
  nothing. In a ten-question exam, two such questions earn the star and three don't.
- **Retakes** revisit only the assisted and missed slots, each with a fresh, equivalent question (Astra); the
  denominator stays the whole exam, and earlier answers stay in the evidence log.
- **No fishing for answers** (Robin, C-41: help should feel good, but an obvious path to fishing must be closed;
  undoing a move isn't help when nothing prompted it; hiding suggestions up front helps a lot):
  - **The first committed answer is the one that counts.** A wrong first answer can be retried for learning, but
    that question doesn't count towards the star, so trying every option gains nothing.
  - **Nothing is suggested up front:** the pad shows one guess (C-14); choices appear only in a choice exam; hints
    are a button away and recorded when opened.
  - **Undo is free:** taking back a tile, clearing a stroke or redrawing before committing is never help, because
    nothing was shown that prompted it.
  - **Order and options are shuffled** per attempt, so a retake can't be answered by position.
- **Listening star.** Offered only where the device has a local Japanese voice. Labelled "Listening practice with
  your device's voice", never "validated listening" (spec line 280). Absent, not "missing", on devices without one.
- **Flair, just for you** (Robin, C-13: "just UI flair, not a real reward… it's just for you to feel good about
  learning and grasping the language"). Stars unlock nothing: no item, no route, no illustration, no Bond, no
  stamp. The Mastery page says so in plain words: "These stars are just for you: a way to see what you've grasped.
  They don't unlock anything." That is what makes them compatible with the "no handwriting-only or no-help-only
  reward" contract, with a one-line amendment saying so.
- **Home:** Words › a new "Mastery" page listing groups, stars and "next suggested".

**Effort:** M (on L1, L2).

---

## L4 · Word, kanji and kana pages

**What and why.** Astra's "useful word page", supported by Robin's review: an evidence profile, not a single
percentage; denominators shown; "not practised" never red.

**Approach.** Every noted word, every met kanji and every kana gets a page:

> **水 (みず)** — water
> **Recognised:** 8 of the last 10 times asked · **Used in a sentence:** 3 different situations
> **Typed:** 2 · **Handwritten:** not practised · **Reading すい:** met once, not asked
> **Last seen:** a delivery notice (Manybridge), a battle (Saltglass)
> **Try next:** explain a route to someone (a Kotonoha leaf) →

- Uncertainty labels ("limited evidence").
- No red failure states.
- A "Hear it" button where a voice exists.

**Effort:** M.

---

## L5 · "Things I Can Do" (A58)

**What and why.** Astra rated it Umazing; Robin accepted group F apart from #60. It turns evidence into *abilities*:
interpret directions, ask for clarification, refuse politely, report what you heard. Each points to the moments that
show it and suggests what to try next.

**Approach.**
- **About 60 can-do statements**, grouped as the Hall's ten themes are, written in plain English with a Japanese
  title.
- **Each statement lists its evidence:** tasks of the right kind, done in different contexts (transfer), with the
  help categories noted honestly.
- **Inspired by "can-do" descriptions in Japanese teaching** (the Japan Foundation's approach, named as inspiration
  only). **Never a certification**, never a JLPT level (spec line 170).
- **Home:** Words › "What I can do", beside Mastery.

**Effort:** M.

---

## L6 · Spacing that notices days, without pressure

**What and why.** Astra: an interval counted in events inside one long evening is not the same as remembering
something next week; spacing research supports taking time into account, but "it does not require overdue warnings
or login obligations."

**Contradiction.** The practice core's stance is "nothing reads the wall clock" (`engine/08_practice.js:21`). That
was written against clocks and streaks, not against spacing. Reading the date to *space reviews* creates no
pressure. **Proposal:** record the day of each attempt; let "due" consider both events and days; **never show
overdue counts or streaks** ([11_CONTRADICTIONS.md](11_CONTRADICTIONS.md) C-36).

**Effort:** S.

---

## L7 · Sentence forging: say what you need

**What and why.**
- Robin [R0]: "questions that are asked in English and ask to be ordered correctly in Japanese more often."
- Astra rated it the strongest addition (A1): from "recognise the answer" towards "say what you need".
- Robin [R1]: grow it in new content; don't shoehorn it into old.

**Approach.**
- **Intention first.** The prompt is a goal: "Ask the keeper to leave the side gate open until evening." It is
  sometimes in English, sometimes a picture or a situation (L8), sometimes Japanese ("tell her this more simply",
  L13).
- **A support ladder**, which the player picks and can change mid-task, as input modes switch today:

  | Rung | The player… | Records as |
  |---|---|---|
  | 1 | chooses among complete sentences | `recog` (construction-adjacent) |
  | 2 | arranges meaningful chunks | `construct` |
  | 3 | arranges chunks and picks particles and verb endings in slots | `construct` |
  | 4 | types or handwrites within a bounded answer space | `typed` / `hand` + `construct` |

- **Authored alternatives are accepted** (spec line 138: correct "for its context, not merely match a hard-coded
  preferred string"). The judge generalises the letters' reply families: alternative orders, interchangeable
  particles where meaning holds (に/へ for destination), politeness variants where both fit. Where one construction
  is being *practised*, the task says so explicitly.
- **The result changes the scene:** the keeper opens the gate; the barge goes where you sent it.
- **Validator:** checks every listed alternative (S5) and that a non-handwriting route exists (spec line 132).
- **Target in new content:** about one in four or five language interactions *where construction genuinely fits*
  (Astra's starting value, to be measured). Today's share of English-intention construction is 2.3%.

**Effort:** L.

---

## L8–L17 · Language-as-a-tool task families

Each family becomes an authoring template with all four tiers, a judge and a recording rule. Where the plan uses
each:

| # | Family | What the player does | Used in |
|---|---|---|---|
| L8 (A2) | **Scene to sentence** | Look at a small situation (which parcel moved, who stayed) and describe the change that matters, with pictures and optional English | Manybridge deliveries; Hall wing 2 |
| L9 (A3) | **Particle routing** | Send letters, goods or gifts by saying who gives what to whom; the result is visible | Manybridge barges; the Fox's Wedding |
| L10 (A4) | **Verb-transforming devices** | An authored magical device needs an instruction: action, prohibition, preparation, completed state. Transform a known verb to fit. Labelled as a game device, not as how Japanese works | The Understage; the Steam Vents |
| L11 (A5) | **Reference detective** | Work out what "that one", an omitted subject or an earlier mention refers to | The Understage prompt-book; Hall wing 7 |
| L12 (A6) | **Asking back** | Ask someone to repeat, simplify, slow down or confirm; they rephrase with an authored simpler version. Asking well is success, never a failure flag | **Every new region's conversations**: a "Clarify" option on hard lines |
| L13 (A7) | **Paraphrase bridges** | Explain a complicated notice in simpler Japanese, keeping its condition | Steamhollow's house rules; the new settlement's notices |
| L14 (A8) | **Evidence reporting** | Report what you saw, heard or suspect, with the right certainty (そうだ・らしい・ようだ) | The Cloudroad relay; Hall wing 8 |
| L15 (A10) | **Comic and dialogue reconstruction** | Rebuild an illustrated exchange from speech bubbles and speakers; several grammatical versions tell different stories | Kotonoha shells; the theatre's scrambled script |
| L16 (A9) | **Sound-and-meaning workshops** | Compare short spoken pairs and use the difference. **Optional**, the device voice only, always a text route, no validation claims | A small optional room in Kotonoha; Distractions |
| L17 (A39) | **Explain it to a partner** | Justify a plan to your companion with evidence | Dungeons (D6) |
| L17b (Robin, C-70) | **Modifier phrases** | Extend a response with a quantity word and write the short sentence it makes (「すべてを守る」, 「光がすべてを照らす」): すべて/全部/あらゆる/全体, それぞれ/ごとに, 大半/たくさん/いくつか, 永遠に/無限に, with が and で chosen by what is natural for each word. Overlaps in everyday Japanese are explained honestly | Battles and field puzzles everywhere, from Chapter 3 ([03_ENCOUNTERS.md](03_ENCOUNTERS.md) E27) |

**Effort:** L (all families); each region uses a subset.

---

## L18 · Growth offered, never imposed: the Grow route

**What and why.**
- Robin [R0]: push "a tier higher by the end to push growth".
- [R1]: "Growth via challenge should 100% be offered… never forced… nudge new, unfamiliar experiences into their
  path… Backing out should never be punished."

**Approach.**
- **Stretch content** is tagged with the next tier (E for an F player, and so on). It appears as:
  - *offered* side tasks in regions ("This one uses a form you haven't learned yet. It will teach it. Try it?");
  - the Grow route in the Hall and in commissions.
- **Always taught before it is relied on** (spec line 176). It is recorded as stretch evidence and never changes the
  global profile.
- **Engineering.** Thread a profile override through `stepsOf`, `itemPool` and `vocabStep`. The seams already exist
  in the Atlas (`objectiveSteps(P)`), `drillPool(lv)` and letters' `tier(prof)`.
- **For Advanced:** stretch means nuance, genres and conflicting perspectives (spec line 168: "approaching N2/N1
  style… paraphrase"), never an invented tier above A.
- **Declining or backing out** returns the player to where they were, with no record of "giving up".

**Effort:** M.

---

## L19 · Measuring what players actually meet

- **Instrument the F/Ren sweep** to count the language interactions a playthrough really meets, by kind, per
  chapter.
- This answers Robin's first question [R0] ("I'm not sure if it already happens frequently enough") with data.
  Today only authored counts exist.

**Effort:** S.

---

## L20 · The kanji record and the chart

- **The kanji chart's practice square records nothing today.** Add optional recording as handwriting practice
  (`exposed` when tracing, `hand` when from memory).
- **Reading-recall questions never show the kanji they ask about**, so furigana (always on, by rule) never gives
  the answer away. They ask from meaning or context instead.

**Effort:** S.
