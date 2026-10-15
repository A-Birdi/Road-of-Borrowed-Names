# RV-1 reader brief (as given to the 14 readers, 2026-10-15)

*Kept as the record of the criteria the readers used. Paths are repository-relative; the readers worked on
transcripts written by `tools/review/register_extract.mjs` outside the repository.*

You are reviewing part of the Japanese script of *The Road of Borrowed Names*, a Japanese-learning fantasy RPG,
before every line is voice-recorded. **This is a report, not a rewrite.** You change no file in the repository.
You write exactly one file: your findings JSON (path given in your task).

## What Robin (the project owner) asked, verbatim

> "Before whole-game voice production, review conversational naturalness and register in context—not just
> grammatical correctness. The script should retain both natural polite conversation and casual Japanese where the
> relationship and situation support it. Do not convert everyone to casual speech or remove character-specific
> politeness. Review complete exchanges, including who is being addressed. Check that ordinary banter does not become
> unnecessarily literary or explanatory, and that casual contractions and marked character expressions have
> appropriate learner support. Keep standard Japanese versus dialect separate from polite versus casual. Do not impose
> speech patterns solely from a character's age or gender. Report concrete scene/line examples that need attention
> before rewriting."

The game's specification adds: "Japanese dialogue should be natural for its speaker and situation. Keep teaching
explanations distinct from stylized character speech. Fantasy formality is not automatically a good model for
everyday conversation. Provide contextual register notes where this matters." and "Avoid constant exposition,
repetitive praise, modern corporate phrasing, unnecessary honorifics, and every character sounding like an ancient
oracle." Register is about the person and the situation; "more formal" is never automatically better.

## The companions (one travels with the player; their baseline from docs/STORY.md)

- **Nao** (they/them), courier: wry, perceptive, impatient with ceremony. Casual (だ/よ/じゃん), short sentences.
  Uses 俺: an established character choice, not something to "correct".
- **Mio** (she/her), apothecary: gentle; stubborn about honesty; a fierce, funny temper with condescension.
  です/ます to strangers, softer plain with friends. Her register toward the player may soften as they grow close:
  that is intended. Flag only shifts that do not fit the moment or the person addressed.
- **Ren** (they/them), travelling lantern keeper: earnest, precise, deadpan puns. Careful speech, occasionally
  formal. Their politeness is character, not stiffness: do not flatten it. Flag only where it reads as
  translationese, oracle-speak or a lecture in an ordinary moment.
- **Suzu** (she/her), travelling performer: playful, stage phrases, meticulous about debts. Optional Kansai-ben
  (the player's choice): shown as `KANSAI:` under her standard line. Kansai is a **dialect**, independent of
  politeness: a polite Kansai line is still polite, and a casual standard line stays casual in Kansai.
- **Tsuru** (elderly keeper): plain, dry; NOT 〜じゃ; plainly with だね/かい. **Kasane**: soft polite speech, precise.

Lines tagged `NAO(comp)` etc. are said by whichever companion travels with you, chosen by condition. `ANY(comp)`
means the line has **no** companion condition: any of the four may say it, so it must suit all four voices (flag a
generic line whose register clearly fits only one of them, e.g. a Nao-style rough line that Mio or Ren would say).

`PC>` lines are the player's choices; `PC:` lines are the player character speaking. The player is an outsider
travelling through; they address villagers, elders, officials, children and companions. Different choices in one menu
may deliberately offer different registers (a register-teaching scene): do not flag that.

## What to look for (categories)

- `register_mismatch`: the register does not fit the speaker, the person addressed or the situation (e.g. a
  shopkeeper using plain speech to a stranger customer for no reason; a child speaking keigo; a companion speaking
  stiff です/ます to a close friend in banter while plain everywhere else; the player's choice too blunt or too
  servile for an elder, an official or a child).
- `register_inconsistent`: the same speaker to the same person in the same relationship stage swings between
  polite and plain within a scene or across adjacent scenes without a reason (emphasis, emotion, quoting, a
  deliberate shift are reasons).
- `unnatural_banter`: ordinary chat that does not sound like people talking (complete textbook sentences where
  speech drops particles or subjects; every line a perfect proverb; no reactions, no fillers where they belong).
- `over_literary`: literary/archaic grammar (である, 〜ぬ, 〜ず, ござる, 汝, 〜べし…) or oracle-speak in ordinary
  conversation where the character and moment do not call for it. Stylized speech that is a deliberate part of a
  character or a ritual/tale register is fine: say why if you note it.
- `over_explanatory`: a character explains what the listener already knows, or narrates the plot/the lesson aloud
  in a way people do not talk ("As you know…"), or a teaching explanation leaks into character speech.
- `stiff_translationese`: Japanese shaped by English (unnatural pronoun use like repeated あなた to a friend,
  "私は〜と思います" chains, literal idioms).
- `contraction_support`: a casual contraction (〜てる, 〜ちゃう, 〜なきゃ, 〜とく, じゃん, 〜んない, っす, ねえ…)
  that a learner meets here and which the word-help system might not explain; note only if it is unusual or
  first-time-heavy. (A separate automated pass has checked word help; you do not need to test it.)
- `marked_expression_support`: a marked character expression (elder かい/おくれ, rough ぜ/ぞ/ねえ, feminine
  わよ/かしら, わし, ござる, stage calls, regional forms) that a learner would need a register note to understand,
  where the scene gives none.
- `dialect_register_conflation`: a dialect version that changes the politeness (a polite standard line made casual
  in Kansai, or the reverse); dialect used as a shortcut for "rough" or "rustic"; a non-Suzu speaker given dialect
  forms inconsistently.
- `stereotyped_speech`: speech patterns that look imposed from age or gender alone rather than from the person
  (every old man with わし/じゃ; every woman with わよ/かしら; every child in third person) **where it reads as a
  caricature or is inconsistent with the character as written**. Many real speakers do use these; flag the
  pattern only with a reason from the character and scene.
- `generic_companion_line`: an `ANY(comp)` line whose register fits only some companions.
- `other`: anything else that would make the recording sound wrong (a line that reads oddly aloud, a name or $name
  placeholder used where a person would say あなた/君/お前, punctuation that will produce a wrong reading).

**Severity:** `fix_before_recording` (clearly wrong or unnatural for the speaker/addressee; a native listener would
notice), `consider` (borderline, stylistic, or a judgement call for Robin), `support_only` (the line is fine as
speech; it needs a word-help or register note for learners, no text change).

## What NOT to do

- Do not "correct" politeness into casual speech, or casual into polite, without a reason from the relationship
  and moment. Character-specific politeness stays.
- Do not judge by the heuristic tags alone: the `<polite plain mixed c:… m:…>` tags after each line are pointers
  from a script, often wrong. Read the exchange.
- Do not flag beginner-simple lines for being simple (Foundations content is meant to be simple). Kana-only lines
  in the Hall are deliberate beginner reading material.
- Do not flag English renderings except where they show the Japanese has the wrong tone.
- Do not review narration (`~` lines) except as context; it is not conversation.
- Do not propose finished rewrites as decisions. Give a short **direction** (what should change and why); you may
  add one illustrative phrase, labelled as such.
- Precision over volume: a finding must be something you would defend to a native-speaking editor. But read the
  **whole** part: do not stop after the first few scenes.

## Also record what must be kept

Robin is worried about flattening. In `preserve`, list a few (3–8) lines in your part where a character's polite
or casual register, or a marked expression, is exactly right and must survive any later rewrite, with why.

## The files

- Your transcript: `transcripts/<part>.txt`. Each scene starts `=== <scene id>  (<source file>)`. Each spoken line:
  `[<hash>] SPEAKER[expr] {if condition}: <Japanese as spoken>  | <English>   <tags>`; the line key is
  `<scene id>#<hash>`. `FROZEN:VA1:<case>` / `FROZEN:VA2` mark lines in the frozen voice auditions: report them like
  any other (the audition text itself will not change; a correction would apply to the game's line).
- Your cast sheet: `cast/<part>.md` (each speaker's profile and their usual register across the whole game). The
  profile "register" notes were written from the current lines: they describe, they do not prescribe.
- You may grep the repository (`src/...`) read-only for context (for example a
  scene's other branches or a speaker's lines elsewhere: `tools/voice/lines.mjs
  --who <id>` prints them). Never edit, stage or commit anything in the repository.

## Output JSON (write it with the Write tool, valid JSON, UTF-8)

```json
{
  "part": "<part name>",
  "scenesRead": <number of scenes you read>,
  "findings": [
    {
      "key": "<scene id>#<hash>  (for a PC> choice: '<scene id>:choice' plus the choice's Japanese in text)",
      "scene": "<scene id>",
      "speaker": "<speaker id>",
      "addressee": "<who is addressed and the relationship, e.g. 'pc (stranger, first meeting)', 'Tsuru (elder, respected)'>",
      "text": "<the Japanese as in the transcript>",
      "en": "<its English>",
      "category": "<one category>",
      "severity": "fix_before_recording | consider | support_only",
      "why": "<one or two sentences, concrete>",
      "direction": "<what a later rewrite should do; optionally 'e.g. …' with one illustrative phrase>",
      "frozen": "<VA1:<case> | VA2 | none>",
      "kansai": "<only if the finding concerns the KANSAI version: that text>"
    }
  ],
  "preserve": [ { "key": "...", "speaker": "...", "text": "...", "why": "..." } ],
  "speakerNotes": [ { "speaker": "...", "note": "<one or two sentences on this speaker's register in this part>" } ]
}
```
