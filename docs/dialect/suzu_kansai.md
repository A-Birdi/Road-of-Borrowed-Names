# Suzu's Kansai-ben

Suzu can speak **Kansai-ben** (関西弁, かんさいべん), the regional dialect of Osaka and
Kyoto, instead of standard Japanese. It is the player's choice, it can be changed
at any time, and it changes **only how her lines are shown**: the story, the
exercises, the answers, handwriting recognition and every save stay exactly as
they were.

> **Honesty first.** The Kansai text was written without a native speaker of
> Kansai-ben. It aims at natural, present-day Osaka speech, but it has **not** been
> reviewed by a native speaker; that review is recommended before anyone relies on
> it as a model (see *What a native speaker should check first*, below). The
> browser's Japanese voice (text-to-speech) reads her Kansai lines with a
> **standard (Tokyo) accent**: Kansai pitch accent, a large part of what makes the
> dialect sound like itself, is not reproduced anywhere in the game.

## The choice and the setting

One setting, `settings.suzuSpeech`: `'standard'` or `'kansai'`. It lives in the
global settings record (IndexedDB store `settings`, key `global`) beside text
speed and the other preferences. It is **additive**: an older settings record has
no such key and means standard. Nothing is added to the campaign save; the save
schema, slots, IndexedDB name and learning state are untouched.

The same setting is shown and changed in three places:

1. **When she joins you** (Lantern Hall, `rw.hall_suzu` → `!call rw.suzu_speech`
   → `!hook suzu_speech join`, the only edit to the standard scene files). A short
   sheet asks *How should Suzu speak?*, with one of her lines in each form as a
   sample (furigana on every kanji), one sentence on what Kansai-ben is, and how
   to switch back. Choosing applies at once; Escape keeps the current choice.
   Automated play (`RB.test.auto`) never sees it.
2. **Settings › Reading & Language › Suzu's speech**: *Standard* / *Kansai
   (Kansai-ben)*, with a one-line hint.
3. **Company › Suzu, in "Talk with Suzu"**: a small labelled control, *How Suzu
   speaks*, with two radio buttons — *Standard Japanese* ({標準語|ひょうじゅんご}) and
   *Kansai-ben* ({関西弁|かんさいべん}) — showing the current choice, at least 44 px,
   reachable by keyboard and pointer, and the sentence *Kansai-ben is a regional
   dialect (Osaka, Kyoto). Word help explains it; if it is hard to follow, switch
   back any time.* Above it, an in-world row asks her: *Ask her to talk as she
   does backstage (Kansai-ben)* / *Ask her to use her stage Japanese (standard)*,
   which plays a one-line reply (`co.suzu_speech_kansai` / `co.suzu_speech_standard`)
   and changes the same setting. The control appears only on Suzu's page, and works
   for any campaign in which she travels with you, including saves made before
   this option existed.

**Existing campaigns.** A campaign *loaded from a save* in which Suzu already
travels with you, with no choice made yet, is offered the same sheet **once**,
after the next scene in which she speaks (never in the middle of a scene; never in
a new campaign, which asks when she joins). Answering, or pressing Escape, records
the choice, so it is not asked again.

Changing the setting re-renders the line on screen (`RB.ui.dialogue.refresh`), and
every view below picks it up when it is next drawn.

## How it works (src/lang/85_dialect.js)

* **Standard lines are never edited.** A Kansai table, keyed by the standard
  Japanese line (whitespace normalised), holds the Kansai Japanese and the
  re-voiced English of every line Suzu speaks:

  ```
  @ ch1/32_depart:126 [rw.hall_suzu]          (where it comes from)
  = <standard Japanese> || <standard English>  (the key)
  > <Kansai Japanese> || <Kansai English>      ("> =" the same; "> = || English" same Japanese)
  ```

  Tables: `src/content/dialect/kansai_*.js` (one per chapter or system). A line
  with `%T` is a template (a memory title filled in at run time) and matches with
  its title in both languages.
* **The swap happens only at display**, in `RB.dialect.line(who, line)`: when the
  speaker is Suzu (`'comp'` resolves to the companion) and the setting is
  `'kansai'`, a *copy* with the Kansai `jp`/`en` is shown; otherwise the line
  itself. The campaign keeps the standard line everywhere (history, memories,
  kept sentences, fishing reflections): `RB.dialect.std()` gives it back.
* **Where her words are shown, all swapped:** the dialogue box (scenes,
  conversations, Atlas and The Pages We Keep lines, which all go through it),
  Dialogue history, Company › Suzu (her thought, the first words of her bio,
  memory replies and recollections), Words › Kept sentences, shiritori lines,
  fishing remarks, the fishing stage and its reflection.
* **Battle.** Suzu has no Japanese battle remarks (battle effects are written in
  English), so there is nothing to swap there.

## Inventory and enforcement (tools/suzu_inventory.mjs)

`suzuInventory()` lists every line Suzu can speak:

* **Scenes** by flow analysis: `suzu:` lines, and `comp` lines that only Suzu can
  speak (`?(comp=suzu)`, branches reached only with her, scenes entered only with
  her; 17 generic "any companion" lines are included because she may be the one
  saying them).
* **Every data table of her words**: Company bios, memories, thoughts, places,
  pets; case and discovery reactions; shiritori lines; fishing remarks and
  memories; pet meetings; The Pages We Keep recollections; Unwritten Atlas
  companion lines (`RB.atlas.compLines`).
* **A source scan** as a safety net: every Japanese literal in `src/**/*.js` that
  sits next to a `suzu` key or argument must be in the inventory or listed as a
  *label* (her name, menu labels, the player's replies, narration — 39 labels,
  kept standard on purpose). A new table of her words therefore fails the checks
  until it is added and translated.

Counts (from `tests/unit/dialect_kansai.test.mjs`):

| Source | Lines |
|---|---|
| Scenes (suzu: and her comp lines) | 722 |
| Company (bios, memories, thoughts, places, pets) | 64 |
| Field discoveries (reactions) | 20 |
| Deduction cases (reactions) | 7 |
| Shiritori | 31 |
| Fishing | 15 |
| Pets (meetings) | 4 |
| The Pages We Keep (recollections) | 6 |
| Unwritten Atlas | 27 |
| **All** (896 lines, **872 distinct**) | 896 |

All 872 distinct lines have a table entry: 867 with a Kansai version (6 of these
are short lines whose Japanese stays as it is — "……", a name, "うん" — with the
English re-voiced where it fits) and 5 explicitly the same in Kansai (stage announcements and counting: *{幕|まく}、{下|お}りました！*).
The 68-entry Kansai lexicon is in `src/content/dialect/00_lex.js`.

`tools/validate.mjs` (and the unit test) report an **error** for: a Suzu line with
no Kansai entry; a kanji without furigana in Kansai text; a token in Kansai text
that neither the Kansai lexicon nor the standard lookup explains; placeholders
($name, %T) that differ; table syntax; a malformed Kansai lexicon entry; and any
scan leftover. Stale entries (no longer matching a line) are warnings.

## Learning

* **Word help** reads a Kansai line with the Kansai lexicon first: Kansai words
  (や, ほんま, めっちゃ, あかん, うち, あんた, …), Kansai verb forms explained
  through their standard form (〜へん → 〜ない, 〜てはる → 〜ている, 〜てもうた →
  〜てしまった, 〜とる, 〜たろ, けえへん, せえへん …), and context rules (final で /
  わ / な only at the end of a sentence; うち is "I" except in 〜のうち or before
  に). The card adds a note — *Kansai dialect ({関西弁|かんさいべん}). In standard
  Japanese: {本当|ほんとう}.* — with furigana on its Japanese. Standard words in her
  lines stay standard.
* **Kansai forms never enter standard vocabulary.** The Kansai lexicon is separate
  from `RB.lex`, so kana practice, the kanji words, quizzes and reviews never see
  it. A Kansai word added to the field notebook is marked `dia: 'kansai'` and is
  left out of the writing desk, the shiritori journey pool and "kanji met".
  Kansai tables are left out of the pad's kanji readings (`tools/kanjiread.mjs`),
  so a colloquial reading such as 同 as おんな (おんなじ) is never shown as a reading.
* **Unchanged:** challenges, answers, answer checking, drills, recognition, rules,
  flags and the story. Practice built from a kept sentence uses the standard
  sentence the campaign keeps.

## Style sheet

Suzu is a touring actress who keeps a ledger of what she owes: quick, warm,
theatrical, a little guarded. Kansai-ben here is present-day Osaka speech in her
voice, never a comic stereotype.

**Japanese**

* Copula だ → **や** (やろ, やん, やねん, やけど, やったら); explanatory のだ / の →
  **ねん** / **ん や**; よ → **で** at the end of a statement; ね → **な**; ちがう →
  **ちゃう**; だめ → **あかん**; 本当 → **ほんま**; いい → **ええ**.
* Negatives in **〜へん** (しない → せえへん, 来ない → けえへん, できない → でけへん,
  行かない → 行かへん, 分からない → 分からへん); short **〜ん** where natural
  (知らん, 言わんとこ).
* **うち** for "I" and **あんた** for "you" (affectionate, not rude in her mouth);
  **〜はる** for friendly respect to people spoken of (ツルさん …{覚|おぼ}えてはる).
* Contractions: 〜とく (〜ておく), 〜てもうた (〜てしまった), 〜てまう, 〜たろ (〜て
  やろう), 〜な あかん (must).
* **Avoided as caricature**: さかい, まんねん, でんがな, でっせ / まっせ, わて, and
  おおきに (not used; the unit test fails if the stock forms appear). Polite stage announcements stay polite.
  Emotional scenes keep their weight: the dialect softens endings, never jokes.
* Same furigana rules as the rest of the game; Kansai-only kana words are written
  in kana.

**English** (re-voiced lightly, where it fits; many lines keep their English):
contractions, *ya / yer*, *gonna / wanna*, *y'know*, *reckon*, *a'right*, dropped
-g (*waitin'*), *ain't* now and then — a warm, country lilt, never phonetic
spelling for laughs, never mockery.

**Before → after** (standard → Kansai, English re-voiced):

| System | Standard | Kansai |
|---|---|---|
| Joining (sample) | {開幕|かいまく}！……ふふ、{一度|いちど}{言|い}ってみたかったの。 *Curtain up! …Heh. I always wanted to say that.* | {開幕|かいまく}！……ふふ、いっぺん{言|い}うてみたかってん。 *…Always wanted to say that, y'know.* |
| Chapter 1 | {真面目|まじめ}に{言|い}うね。…{私|わたし}は{幕|まく}が{下|お}りるまで{降|お}りない。 | {真面目|まじめ}に{言|い}うで。…うちは{幕|まく}が{下|お}りるまで{降|お}りへん。 *I'll say this straight.* |
| Chapter 3 | ……{聞|き}いただけよ。ほんとに。 *…Only heard. Really.* | ……{聞|き}いただけやで。ほんまに。 *…Only heard, mind. Honest.* |
| Chapter 6 | さあ、{最終幕|さいしゅうまく}だよ。{客席|きゃくせき}は……{誰|だれ}もいないけど。 | さあ、{最終幕|さいしゅうまく}やで。{客席|きゃくせき}は……{誰|だれ}もおらんけど。 *…plumb empty.* |
| Company thought | ヒロが{今|いま}{何|なに}を{信|しん}じているか、{知|し}りたい。{知|し}るのは{怖|こわ}いけどね。 | ヒロが{今|いま}{何|なに}を{信|しん}じてるか、{知|し}りたいねん。{知|し}るのは{怖|こわ}いけどな。 *I wanna know…* |
| Company memory | …あなたが{私|わたし}を{配役|はいやく}してくれた{日|ひ}。 | …あんたがうちを{配役|はいやく}してくれた{日|ひ}や。 |
| Shiritori | ねえ、{幕間|まくあい}にしりとりしない？{本気|ほんき}で{行|い}くわよ。 | なあ、{幕間|まくあい}にしりとりせえへん？{本気|ほんき}で{行|い}くで。 *I'm playin' for real.* |
| Fishing | {水辺|みずべ}の{舞台|ぶたい}、{開幕|かいまく}です！……{静|しず}かな{舞台|ぶたい}だけどね。 | {水辺|みずべ}の{舞台|ぶたい}、{開幕|かいまく}や！……{静|しず}かな{舞台|ぶたい}やけどな。 |
| Case | {裏返|うらがえ}すだけで{正解|せいかい}！{一番|いちばん}{好|す}きな{種明|たねあ}かしよ。 | {裏返|うらがえ}すだけで{正解|せいかい}！{一番|いちばん}{好|す}きな{種明|たねあ}かしやわ。 *…there's yer answer!* |
| Pages We Keep | 「%T」。……{題|だい}をつけるなら、そうなるかな。 | 「%T」。……{題|だい}つけるんやったら、そうなるかな。 |
| Unwritten Atlas | いい{声|こえ}！うちの{一座|いちざ}に{欲|ほ}しいくらい。 | ええ{声|こえ}！うちの{一座|いちざ}に{欲|ほ}しいくらいや。 |

(The tables in the game use the spaced token markup; spaces are removed here.)

## Tests

* `node tests/run-unit.mjs dialect_kansai` — the inventory as a test (coverage,
  furigana, lexicon, scan), the swap, templates, word help in context, Kansai forms
  kept out of the standard lexicon, kana word index, writing desk and kanji met.
* `node tools/validate.mjs` — the same coverage checks with the other content checks.
* `node tests/e2e/dialect_kansai.mjs` — in the built page: the choice when she
  joins; a Kansai line with furigana and re-voiced English; word help on a Kansai
  word; History; Settings; reload; a loaded save offered the choice once (Escape
  keeps standard); Company › Suzu both ways by pointer and keyboard; the in-world
  ask; a case scene, her Company thought and a shiritori invitation in Kansai;
  nothing Kansai in the campaign save; the slot unchanged; persistence.

## What is not verified

* **No native-speaker review.** Naturalness, register and regional consistency
  are the author's best effort only.
* Kansai **pitch accent** is not represented; text-to-speech uses a standard accent.
* Browser tests run in Chromium; Firefox (and Safari) were not tested for this
  feature, though it uses only the same ruby, buttons and IndexedDB settings as the
  rest of the game.
* Word help explains Kansai forms through simple rules; an unusual token can still
  fall back to the standard reading of its parts. The validator guarantees every
  token is explained by *something*, not that every explanation is ideal (the
  checker's "review" list shows the ones read through the standard lexicon).

## What a native speaker should check first

1. **Her emotional high points**: Chapter 3 (Cinder Orchard, Hiro, the debt and
   the truth), the ending and The Pages We Keep — that the dialect keeps their weight.
2. **Sentence-final particles**: the density of で / わ / な / やん / ねん, and
   ねん versus ん や.
3. **うち and あんた**: right for her age and character, and not too blunt in tender
   moments.
4. **Negatives and irregulars**: 〜へん / 〜ひん choices (見いひん / 見えへん, 来えへん /
   けえへん / こーへん, せえへん / しいひん), and potential forms (〜られへん, 〜れへん).
5. **〜はる** on third persons, and lines kept polite (stage announcements,
   受け付けました).
6. **English re-voicing**: that it reads warm and light, never mocking.
