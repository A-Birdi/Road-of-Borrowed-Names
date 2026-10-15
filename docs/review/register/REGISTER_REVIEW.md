# RV-1 · Register and conversational naturalness, in context

**Status: a report for Robin to decide on. Nothing in the game has been rewritten.** (2026-10-15; C-95)

Robin asked, before whole-game voice production:

> "Before whole-game voice production, review conversational naturalness and register in context—not just
> grammatical correctness. The script should retain both natural polite conversation and casual Japanese where the
> relationship and situation support it. Do not convert everyone to casual speech or remove character-specific
> politeness. Review complete exchanges, including who is being addressed. Check that ordinary banter does not become
> unnecessarily literary or explanatory, and that casual contractions and marked character expressions have
> appropriate learner support. Keep standard Japanese versus dialect separate from polite versus casual. Do not impose
> speech patterns solely from a character's age or gender. Report concrete scene/line examples that need attention
> before rewriting. Do not change the frozen audition text or restart the current local voice comparison. Any
> approved script corrections should be reconciled before the eventual full-game recording batch."

This page is the summary: what was read and how, the patterns that need one decision each, the line-level examples,
and what has to happen before the recording batch. Every finding, with its line, speaker, addressee, reason and a
direction for a later rewrite, is in [FINDINGS.md](FINDINGS.md) (readable) and `findings.json` (the same data, ids
`RV-0001`…). The ids below point there.

## In one paragraph

The script mostly does what Robin wants already. Polite and casual Japanese sit side by side and follow the
relationship:
- Mio refuses Councillor Tami with a textbook polite お断りします, then turns to you in plain speech.
- Tahei's rough ねえ clashes with Oritsu's weaponised でございます.
- Ren's deadpan jokes live in their careful です/ます.
- Tsuru is plain and dry without a stock 〜じゃ.

The readers marked 112 lines like these as **must keep** (end of [FINDINGS.md](FINDINGS.md)).

The problems are concentrated in a few places, each a single decision:
1. Mio's register toward you switches back and forth between regions.
2. About 240 lines are said by whichever companion travels with you, but are written in a plain voice that Ren never uses.
3. Suzu's Kansai changes her politeness in 21 lines and uses a non-native past form in 11.
4. Lesson recaps leak into character speech.
5. Word help explains 33 words with the wrong meaning, among them Tsuru's signature かい ("times").

Separately, 80 lines are marked **fix before recording**. Some are contradictions a listener would hear: a councillor
with two names, a bell that was a rope, a teacher who is 先生 in one region and 師匠 in the rest. Others are calques
(それは数える for "that counts") or slips of register.

## What was read, and how

- **Scope:** every line spoken in a scene, which is the same set a full-game recording batch would voice
  (`tools/voice/lines.mjs`). That is 9,335 lines in 2,189 scenes by 287 speakers: 8,257 spoken lines, the player's
  918 choices, and the Kansai version of Suzu's lines where one exists (1,046). Narration (5,514 lines) was read only
  as context, not reviewed as conversation. Text outside scenes was not reviewed (company memories, notebook entries,
  interface text).
- **Whole exchanges:** `tools/review/register_extract.mjs` writes every conversation as one exchange, with:
  - the speakers;
  - the player's choices in place;
  - the scene's branches;
  - Suzu's Kansai line under her standard one;
  - heuristic register tags as pointers.

  A companion line is attributed to the companion whose branch it sits in, so a line behind `!if comp=ren -> ren` is
  Ren's, not anyone's.
- **Readers:** the road was cut into 14 parts in story order (Reedwake to the Hall, the endings and the side roads).
  Each part went to one reader. Each reader read every exchange in its part (2,189 scenes in all) against a brief
  that quotes Robin's request word for word. Each reader also had a cast sheet with each speaker's profile and usual
  register. They recorded:
  - the person addressed and the relationship;
  - a category, a severity and the reason;
  - a direction for a later rewrite;
  - lines that must be kept.
- **Automated checks:**
  - word help, as the game itself looks words up, for every token of every spoken line (`tools/review/wordhelp_check.mjs`);
  - Suzu's Kansai lines whose politeness differs from her standard line;
  - lines several companions say, by register;
  - places where the recording text joins two words into a compound read differently (`tools/review/joined_readings.mjs`).
- **Checking the checkers:** every one of the 286 reader findings was matched to its actual line (0 unmatched). The
  lead checked a sample against the source and found every one as described:
  - the タミ/ヤエ names;
  - 今朝 split as {今|いま} {朝|あさ};
  - 綱 vs 鐘;
  - 顔色が変わりました;
  - the player's polite lines in the Lanternfall banter;
  - Nao's single 私;
  - Mio's polite ending block;
  - the shared Hall lines in their scenes;
  - the Kansai 〜たねん forms;
  - Ren's 先生/師匠 counts;
  - the うち/私 counts in Kansai.
- **What kind of check this is: R, review by reading.** It is not a test, and no game behaviour changed. The readers are
  Claude agents, not native speakers: Robin decided no native reviewer is available (C-26), so this is a careful
  self-review, like the language ledger. The Kansai findings especially would benefit from a native Kansai speaker if
  one ever becomes available. The tags were pointers only; every finding is a reader's judgement in context.

**Counts:**

| Severity | Findings |
|---|---:|
| fix before recording | 80 |
| consider (a judgement for Robin) | 169 |
| support only (the line stays; learners need a note) | 55 |

| Category | Findings |
|---|---:|
| other (content, names, readings, attribution) | 69 |
| marked expression needs support | 45 |
| inconsistent register | 39 |
| generic companion line | 37 |
| translationese | 28 |
| over-explanatory | 26 |
| dialect changes politeness | 24 |
| register mismatch | 12 |
| contraction needs support | 10 |
| unnatural banter | 8 |
| over-literary | 3 |
| stereotyped speech | 3 |

Plus 33 word-help cases (250 tokens) and 116 shared texts (242 placements).

## The decisions (patterns, each needing one answer)

### D1 · Mio's register toward you, along the road

Her baseline (docs/STORY.md) is "です/ます to strangers, softer plain with friends". Nao, Ren and Suzu each keep one
register toward you from start to finish. Mio's swings by region, depending on when each region was written, not on
what happens between you.

Mio's companion lines that use polite forms, by region in story order (some of these lines are to other people, so
the counts show the trend, not exact addressee counts):

| Region (chapter) | Polite / all | Reading |
|---|---:|---|
| Reedwake (1) and its case files | 8 / 9 | polite: you have just met |
| Saltglass (2) | 8 / 68 | soft plain (the night talk in Saltglass is where she drops it) |
| Manybridge (3) / Blockprint (4) | 5 / 20, 14 / 23 | mostly plain, some reflective polite |
| Cinder Orchard (5) | 135 / 151 | **polite again**, every companion topic, post-game variants too (co.arrive, RV-0022) |
| Snowbell (6) | 38 / 71 | mixed: polite in public, plain at night, polite again next morning |
| Keepers' Road (7) | 18 / 24 | mostly polite |
| Lanternfall (8) / Kotonoha (9) | 16 / 87, 8 / 31 | soft plain ("……ごめん、泣いてないよ") |
| Cloudroad (10) | 43 / 46 | **polite again**, even at an emotional reunion (cr.barrier_back, RV-0165) |
| Steamhollow (11) | 37 / 38 | polite: a guarded arc that the story names (she steps back on purpose; keep) |
| Still Archive endings | | the ending block (sa2.end_mio, RV-0098) is polite right after plain lines in the same scene |
| Hall, atlas, Ashihara (post-game) | 3 / 53, 1 / 20 | soft plain |

**Lead's recommendation:**
- Polite in Reedwake.
- Soft plain with you from the Saltglass night talk on (the drop is a scene, the point of the scene, and a reader
  marked it must-keep).
- Polite again only where the story makes it a step back (Steamhollow's guarded arc, her sudden "$nameさん、私は
  大丈夫です" there) or where she is in her apothecary's role.
- Always polite to strangers and elders, as she is now; that part is right everywhere.

That means rewriting most of her Cinder Orchard and Cloudroad companion lines and parts of Snowbell and the Keepers'
Road toward you (on the order of two hundred lines, all hers, none of anyone else's). Alternative: Robin defines the stages by
Bond instead, and the lines follow those stages.

### D2 · Lines any companion can say, and Ren

There are 116 texts in 242 placements, 216 of them in the Hall, plus the atlas, the return visits, Snowbell's bell
post and a few in Blockprint. They are said by whichever companion is with you, and each would be recorded in all of
their voices. They are written in a gentle plain voice (〜だね, 〜よう, 〜みたいだ, もう一度言おうか？). That suits
Nao, Mio and Suzu more or less, but **not Ren**, who is です/ます to you in about 95% of their lines in every region:

| Companion | Polite lines | Notes |
|---|---:|---|
| Ren | 52 / 53 | in the Hall, Ren's own lines are polite (「私が読みましょう。何を知りたいですか？」, 「何をお話ししましょうか。」); a plain 「もう一度言おうか？」 a moment later is a different person (RV-0246–0248) |
| Nao | 1–2 % | |
| Suzu | 1–5 % | |

A few shared lines fail the other way:
- 意外な才能だな is Nao's だな, said by Mio and Ren too (RV-0138);
- the polite 扉の鍵はホシノさんが持っているはずです and 裏の階段でしょうか are said by Nao and Suzu (RV-0077, RV-0078);
- 何でも治るは、…かもね is said by Nao and Ren (RV-0141).

The full table, with which companions each line fits less well, is at the end of [FINDINGS.md](FINDINGS.md).

**Lead's recommendation:** give each shared text a Ren variant in Ren's polite voice (116 short lines, the Hall's
are templates repeated across wings), keep one shared text for the other three where it suits them, and split the
handful that fail Nao or Suzu or Mio. The alternative, rewriting every shared line into a form all four could say,
would flatten everyone and is not recommended.

### D3 · The player's register toward companions

You speak plain to your companions everywhere except the Lanternfall banter and arrival, where you are suddenly polite:
- 字が好きなんですね to Nao;
- 厳しいですね to Suzu;
- 下りてみましょう.

RV-0101–0103. **Recommendation:** plain, as everywhere else. The register scenes where you choose how politely to
apologise (Steamhollow) are separate and right: Nao answers 「丁寧に謝るなよ。余計に居心地が悪い。」 (keep).

### D4 · Suzu's Kansai-ben: keep it a dialect, not a register

These are dialect-quality issues, separate from the standard script. A native Kansai reader would still be the best
check (C-26).

- **Politeness changes with the dialect (21 lines, automated, listed in [FINDINGS.md](FINDINGS.md)):**
  - Her standard 〜ましょう suggestions always become plain 行こ / 始めよか. Kansai has polite volitionals too: 行きましょ, 始めましょか.
  - Her stage patter in the manzai bits drops from です/ます to plain: 毎晩温泉に入りました → 入ったねん.
  - The clearest case is her goodbye to Tsuru: 「ツルさん、帰りの道中、退屈はさせませんよ。」 becomes 「うちが盛り上げるで。」 (RV-0218).
  - Once it goes the other way: the Kansai line to Hiro adds です and 話してくれはって where the standard is plain (RV-0056).

  **Recommendation:** a Kansai line keeps the politeness of its standard line.
- **A non-native past form, 〜たねん (11 lines):**
  - 食べたねん, 入ったねん, 真似したねん, 言うてみたかったねん, 書けへんかったねん, ちゃうかったねん and more.
  - Osaka speech says 食べてん, 入ってん, 真似してん, 言うてみたかってん (as the project's own guide does), or 〜たんや.
  - One more is in a company memory.
  - RV-0142–0144, 0163, 0192–0193, 0219–0221, 0276–0277.
- **Single lines:**
  - 甘酒には目があらへん breaks the idiom 目がない (RV-0057).
  - 席を立たんとな reverses its meaning, "you'll have to get up" for "stay in your seat" (RV-0043).
  - Six Kansai lines (five in Steamhollow) use 私, where 94 use うち (RV-0222).
- **Right, and to keep:**
  - はる about third persons (覚えてはる);
  - the polite stage call 開演時刻の変更、承りました！ unchanged in Kansai;
  - ほな、見得を切ります！

### D5 · Teaching voices in character speech

The specification asks to "keep teaching explanations distinct from stylized character speech". Readers found the
lesson leaking into dialogue in these places:
- the tide-keeper explaining the game's word help (「知らない言葉は、言葉の手助けで…」, RV-0020);
- an innkeeper praising you by naming counters (「杯も個も袋も」, RV-0042);
- Kotonoha's keeper calling the Kokinshū "a real book" (RV-0167);
- the Hall's world-closing lines reciting the grammar point in a companion's mouth:
  - 「『そうだ』も『らしい』も、人から聞いた話」 (RV-0252), which is also wrong for one of its three uses;
  - Mio's grammar list at each tale's end;
  - 言葉は、相手に合わせて着替えるんだね.

**Recommendation:** move recaps to the lesson card and the notebook, and let characters react to what happened rather
than name the grammar.

A softer version of the same concern, marked *consider*: Ren's self-made aphorisms in ordinary moments. Their quoted
teachings and the lamp rituals are fine. Readers suggest thinning the rest where they pile up (Cinder Orchard,
Lanternfall), without touching Ren's politeness.

### D6 · Word help that explains the wrong word (no change to any line)

This was checked automatically with the game's own lookup. It affects learner support only: fixing it changes the
lexicon, not the script or the recordings. The worst cases:

| Shown | Is | Tokens | Who |
|---|---|---:|---|
| 回 "times" | sentence-final かい (Tsuru's 「来たのかい」 and 22 other speakers) | 71 | Tsuru, Oyone, Ume, Hisae… |
| 止む "rain stops" | やめる "to quit" (やめておく, やめて) | 41 | mostly your own choices |
| 着く "arrive" | つく in 嘘をつく, 気がつく, 名前がつく, ついて来る | 39 | |
| 何 "what" | な + んだ / んです (一杯までなんだよ) | 18 | |
| 影 "shadow" | おかげ "thanks to" | 12 | |
| 変 "strange" | Kansai 〜てへん (数えてへん) | 10 | Suzu, Kansai |
| 降る / 買う / 本 / 袋 / 係 | ふり, ん+かった and Kansai 〜へんかった, ほんと, おふくろ, かかり過ぎてる | 4–5 each | |
| 沖 "offshore", 前 "front", 霜 "frost", 蝋 "wax", ござ "mat", 妻 "wife", 剣 "sword", 茶 "tea"… | おおきに, おまえ, しもうた, じゃろう, ございまして, つまんない, じゃんけん, 〜ちゃ… | 1–3 each | |

All 33 are in [FINDINGS.md](FINDINGS.md). Readers also listed marked expressions that are right as written but meet the
learner without a note (45, *support only*), for example:
- Tsuru's 〜ておくれ and かい;
- お立ち会い;
- Bunta's 返さねえんだ;
- Bunkichi's でござい;
- Hall elders' じゃ in folk-tale role language.

**Recommendation:** fix the lexicon now (it is independent of the recording) and add register notes where a marked
form first appears.

## Fix before recording: what kind of thing (80 lines)

- **Contradictions a listener would hear:**
  - **The Lanternfall councillor is タミ** (she says 議員のタミです), but four Cloudroad lines, its journal and quest call
    her ヤエ, the Snowbell innkeeper's name (RV-0161, 0162, 0183; one is a VA-2 sample line).
  - Ren calls their teacher 先生 in seven Reedwake lines and 師匠 in 85 lines elsewhere (RV-0005).
  - Tokiwa apologises for 鐘を外せ after having shouted 綱を外してください (RV-0060).
  - 「頼んだぞ」 with no subject turns "Kasane asked" into "I'm counting on you" (RV-0079).
  - Two lines of narration are assigned to a speaker (the umbrella, the tanuki mother), so an actor would read the
    stage direction (RV-0228, RV-0229).
- **Calques and wrong idioms:**
  - それは数える for "that counts" (RV-0058);
  - ウシオ師匠の残り "Master's leftovers" (RV-0121);
  - ヤスさん、顔色が変わりました meant as "his colour's come back", but it says he has gone pale (RV-0021);
  - 籠が…数えていません (RV-0168);
  - 誰も何も得ない, 俺の足音が自分に, a bare ……正しい。 (RV-0209–0211).
- **Register slips against the character:**
  - Nao's only 私 in the game (RV-0266);
  - Nao calling a kind elder ばあさん to her face (RV-0059);
  - Sono, polite to you everywhere else, suddenly chatty plain at the guest book (RV-0181, 0182);
  - Sousuke's whole return scene plain (RV-0150);
  - Mio's polite ending block (RV-0098), and the D1–D3 lines above.
- **Recording text:**
  - The recording text removes the learner's word spacing, so {今|いま} {朝|あさ} becomes 今朝 (けさ) in Hana's first line (RV-0006).
  - Eight more seams are risky for a voice (全部分かる as 部分, 二回数えた as 回数) and are listed apart.
- **Lines any companion says that Ren cannot voice** (37 of the 80; D2).

## Kept on purpose

There are 112 *preserve* notes in [FINDINGS.md](FINDINGS.md). They are the guard against flattening in any rewrite. A few:
- Mio's 「……お断りします。」 to the Registrar, and 「飴ではありません。薬です。」: politeness as a blade.
- Tadashi's 「今なら申せます。承知いたしかねます。」: humble keigo as the joke and the payoff.
- Ren's 「名は重荷ではありません。灯りです。返してもらいます。」: polite even in anger.
- Ren's 「イカはいかが。……失礼しました。」: the politeness is the comedy.
- Nao's 「……大事に、預かります。」: Nao's single deliberate です, to a widow.
- Nao's 「……久しぶりです、サキチさん。」 to the courier who raised them.
- Suzu switching to です/ます when she meets her idol, and his plain 「君の間だ」 back.
- Tsuru, Hisae, Hoshino, Oyone: elders with かい, かね, もんさ and 〜な, and no stock 〜じゃ.
- Heita's lazy 「寝てませんよ。…考えてただけっす。」: a mixed register that is exactly a junior's.
- Hiro's 母 to an outsider and 母さん to Suzu: in-group and out-group, correct.

## The frozen texts and the voice runs

- **Unchanged:**
  - the VA-1 audition corpus (`docs/future/voice/corpus/audition_corpus.json`);
  - the VA-2 plan and samples (`docs/future/voice/va2/`);
  - the VA-2 run on Robin's PC (2026-10-15, 595 of 595 samples).

  Nothing was re-run.
- **12 findings touch lines that are in those samples:**
  - two in VA-1 (Tsuru's first line, support only; Suzu's SUZU05, its Kansai politeness);
  - ten in VA-2, of which one is *fix* (cr.call#e3c48a2fe7: the councillor's name).

  The samples stay as audition material; it is the game's line, corrected, that the full batch records.

## Before the full-game recording batch (reconciliation)

1. Robin decides D1–D6 and which line findings to take (all *fix*, chosen *consider*).
2. The corrections are made in the game's lines and Kansai table, and nowhere else. Then:
   - the language ledger records them (`node tools/review_ledger.mjs`);
   - the content tests run;
   - this review's tools run again on the new build to confirm.
3. **The recording plan is rebuilt from the corrected lines.** Two things in today's tools need changing first:
   - `tools/voice/fullgame_count.mjs` decides which companions say a line from that line's own condition only. It
     would record branch-only lines (Ren's old-kana readings, Suzu's stage-door letter) for all four companions. It
     should attribute companions through the scene's branches, as `register_extract.mjs` now does (RV-0160).
   - The recording text should carry the game's readings where removing the learner spacing joins two words
     (`joined_readings.mjs`), and names in kana, as VA-2 already does.
4. Lines already sampled keep their frozen audition text; the batch records the corrected line in the voice Robin picks.

## Files

| File | What it is |
|---|---|
| `FINDINGS.md` | Every finding by part of the road (fix first), the Kansai and recording-text lists, the shared lines, word help, the preserve notes |
| `findings.json` | The same, as data, with each line's key, source file and line number |
| `tools/review/register_extract.mjs` | Whole exchanges, companion attribution through branches, tags, Kansai lines |
| `tools/review/wordhelp_check.mjs` | Word help checked token by token against what each word is in its line |
| `tools/review/joined_readings.mjs` | Recording text that joins words into a compound read differently |
| `tools/review/register_merge.mjs` | Matches every reader finding to its line and writes the two files above |
