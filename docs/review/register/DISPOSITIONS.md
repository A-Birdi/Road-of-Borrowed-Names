# C-95 · Every RV-1 finding: accepted, retained or deferred

Robin, 2026-10-16:
> "Resolve C-95 with this bounded editorial authorization:
> - Apply the verified “fix before recording” findings.
> - Follow the report’s D1–D5 recommendations where supported by the full exchange, preserving intentional register changes and the 112 preservation notes.
> - Do not apply every “consider” finding as a blanket stylistic rewrite.
> - Handle D6 word-help/support corrections in parallel; do not hold unchanged dialogue generation for explanatory-note-only work."

This is a self-review against the RV-1 report and the full exchanges. Under C-26 there is no native reviewer, so it is never called "native-reviewed".

- **The record:** `DISPOSITIONS.json` holds every finding with its disposition, its note and the lines changed.
- **Mio's line decisions:** all 286 D1 decisions, each with its addressee and reason, are in `d1Lines`.
- **The report:** unchanged: [REGISTER_REVIEW.md](REGISTER_REVIEW.md), [FINDINGS.md](FINDINGS.md).

## In numbers

| Decision | Accepted | Retained | Deferred | In progress | All |
| --- | ---: | ---: | ---: | ---: | ---: |
| D1 Mio's register toward you | 13 | 3 | 0 | 0 | 16 |
| D2 lines any companion says (Ren's politeness) | 37 | 1 | 0 | 0 | 38 |
| D3 the player's register | 4 | 0 | 0 | 0 | 4 |
| D4 Kansai keeps the standard line's politeness | 41 | 4 | 2 | 0 | 47 |
| D5 banter that explains instead of reacting | 20 | 4 | 3 | 0 | 27 |
| D6 word help and learner support | 45 | 10 | 1 | 0 | 56 |
| No decision group (individual lines) | 62 | 48 | 6 | 0 | 116 |
| **All** | **222** | **70** | **12** | **0** | **304** |

- **Fix before recording:** 80 of 80 accepted.
- **Consider:** accepted only where the full exchange supports it. The rest are retained with a reason; nothing was rewritten wholesale.
- **Recording-text findings:**
  - The findings: RV-0006 (the 今朝 seam), RV-0160 (companion attribution) and RV-0297–RV-0304 (joined readings).
  - They are accepted in the recording plan, not by changing lines.
  - The production manifest attributes companion lines through their branches, and sends each seam as the reading the line means.
- **The 112 preservation notes:** all 112 lines are unchanged, checked by their line keys after the corrections.
- **Frozen audition text:** unchanged. Three game lines that the corrections touch are also audition samples, and they keep their frozen text:
  - VA-1 SUZU_K05 (RV-0015), recorded in `docs/future/voice/corpus/DIVERGENCES.json`;
  - VA-2 cr.call, Jinpachi (RV-0162), and rw.mr_lantern, Ren (RV-0161), recorded in `docs/future/voice/va2/DIVERGENCES.json`.

  The checks accept only those recorded pairs of texts.

## What changed in the script

482 lines changed in 100 files, 19 of them in the Kansai table. They come from three proposals, each checked line by line against the source and merged where two proposals touched the same line.

- **Mio (D1):**
  - 190 of the 286 candidate lines (where she speaks to you as a friend) became soft plain.
  - 96 stay polite, each with its addressee and reason: strangers, elders, her apothecary role, Steamhollow's guarded arc, or a preservation note.
- **Lines any companion says (D2):** 112 shared texts are split so Ren speaks in Ren's own polite register; the other companions keep the shared wording.
- **Kansai (D4):**
  - The dialect keeps the standard line's politeness.
  - 〜たねん becomes 〜てん or 〜たんや, and Suzu says うち where she said 私.
- **Fixes:**
  - The councillor is タミ, since Lanternfall already has a Yae.
  - Ren's teacher is 師匠.
  - Calques and register slips are corrected.
  - Explanatory banter became reactions; the grammar is left to the lesson cards.

## Deferred

These are Robin's to decide, or outside the bounded authorization:

- **RV-0025** (`lq.road_write#a3c11b694d`, suzu): Suzu's standard あんた to the player (here and RV-0089) against あなた in ~30 lines: whether it is a deliberate intimacy shift is a character decision that also feeds the C-93 "you" choice for recordings; for Robin. The Kansai line (あんた) is right either way.
- **RV-0047** (`co.b_nao4#d8c80dccd9`, nao): Needs a condition change (make the banter depend on co_bell_rung, with a different opener otherwise): a content-logic decision beyond a line fix; for the lead.
- **RV-0089** (`sb.quiet_suzu#77a9388f81`, suzu): Same decision as RV-0025 (standard あんた, in a tender night scene that also uses あたし, RV-0090); PV-040 protects the scene's casual register. For Robin with RV-0025/RV-0090.
- **RV-0090** (`sb.quiet_suzu#4eedb84845`, suzu): Suzu's standard あたし in Chapter 4 only (five lines) vs わたし elsewhere: one standard pronoun or a stated off-stage rule is a character decision for Robin, with RV-0025/RV-0089. PV-040 guards the scene's register.
- **RV-0108** (`sa.shelf_kasane#2982349fb9`, kasane): Young Kasane's feminine-coded endings vs the they/them canon: whether to neutralise them or note a reading in the casting brief is a character/casting decision for Robin (stereotyped findings are consider-only per DECISIONS).
- **RV-0115** (`lf.b_suzu2#06bef3627b`, suzu): 断られへん (Kansai potential vs passive) needs a line decision (D4: use 断れへん, or keep it with a note); nothing changed here.
- **RV-0130** (`mb.route_table#248c6e1ce0`, nao): A C-74 growth scene (comment in mb/21_scenes_main.js: "a scene, not a pop-up"): each companion bridges the everyday word to the battle ward on purpose before !teach mod_sorezore. Removing the bridge changes how the skill is introduced, a design decision for the lead/Robin, not a line fix.
- **RV-0131** (`mb.zenzo#44024b7264`, mb_zenzo): Zenzō's role language is consistent role speech; the report marks it "Robin's call" and stereotyped findings are consider-only. For Robin.
- **RV-0189** (`cr.oshika#2643376a13`, nao): The companions answer Oshika's island story told in an earlier encounter; fixing it needs a one-line story callback in the scene (new content). For the lead.
- **RV-0190** (`cr.goto#f6512900f3`, ren): Same C-74 growth-scene design as RV-0130 (cr.goto: ごとに → a Protect renewed each time, before !teach mod_goto); the ward link is the scene's purpose. For the lead/Robin with RV-0130/RV-0208.
- **RV-0208** (`yn.zentai#8e73043efe`, nao): Same C-74 growth-scene design (yn.zentai, before !teach mod_zentai); Nao's and Ren's remarks on the word are the bridge to the skill. For the lead/Robin with RV-0130/RV-0190.
- **RV-0283** (`ws.ask#27701cde05`, koji): The formal announcement is needed by the ask-back exercise; reframing it (a posted notice read aloud, or a ferry clerk) is an exercise-design decision. For the lead.

## Retained

60 findings stay as written, each with its reason in `DISPOSITIONS.json`. The usual reasons:

- the line is right in its full exchange;
- it is a deliberate register change;
- it is a "consider" the authorization does not ask to rewrite.

## D6, word help (done in parallel)

56 findings were about explanatory notes and word help. None of them changes dialogue.

- **The fix:** about 52 lexicon entries were added, notes were added to marked forms, and the lookup now knows where a word fits (sentence-final かい, かね, とも; おれ as the pronoun; kana なし and つく).
- **The effect:** word help's check went from 33 cases (250 tokens) to 1 (1 token). The word-help card now shows the furigana in its notes.
- **Lines:** no line changed.
- **Supplement:** the new lexicon words are also new reference readings in the manifest.

The one remaining case is 甲斐 read as the counter 回 in Mio's 怒ったかいがありました. It is deferred because a context rule for counters would change readings everywhere. The tests are `tests/unit/word_help_rv1.test.mjs` and `word_help`.
