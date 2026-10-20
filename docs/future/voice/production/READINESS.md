# Voice production: what is ready, kept apart

Robin, 2026-10-16:
> "Declare generation inputs ready separately from runtime integration and hosting readiness. Local generation need
> not wait for a final hosting URL or completed deployment."
>
> "Use the repository as the shared decision/handoff record. Give Local the exact branch, commit and manifest path.
> Report concrete blockers rather than asking Robin to repeat decisions already recorded."

The repository is the shared record:
- **Branch:** `claude/stoic-sagan-n3jvgk` of `A-Birdi/Road-of-Borrowed-Names`.
- **Lead's session, for coordination:** `session_015RcFBxQ5xp952n4kFB8UbL` (https://claude.ai/code/session_015RcFBxQ5xp952n4kFB8UbL).

## 1 · Generation inputs: READY (`GO.json`)

**Go:** branch `claude/stoic-sagan-n3jvgk`, source commit `ff8a0fa87cfacb322b8c277305eddd9b4cc196fb`. The manifest is
`docs/future/voice/production/manifest/RECORDING_MANIFEST.json.gz`, and its SHA-256 is in `GO.json`.

**Batch started** (the local worker, 2026-10-16) from `GO.json`:
- the source ff8a0fa, the manifest 513ec3ff…, and the script content 65cd3805…;
- 23,816 entries resolved against the locked cast, which is 14,721 dialogue recordings plus 9,095 reference readings,
  the manifest's count;
- 256 accepted reference files verified;
- the order: AivisSpeech, Nemo and the sourced sound first, then Qwen.

Progress (the local worker's checkpoints, latest first):
- **2026-10-19: going live** (Robin: "get these redos sorted, then push the voices live"; and "set up the Github
  properly … if it still exceeds the limit, have it set up the new Repo"). The game's branch is cleaned (2,055 files,
  479.8 MB of screenshots and listening media out; about 606 MB left). Game and voices together would be about
  1,166 MB, so the voices get their own site, as planned (docs/hosting/RUNTIME_PUBLISHING.md, 2026-10-19).
  1. **The worker, with Robin's GitHub CLI login:** create the public repository
     **A-Birdi/Road-of-Borrowed-Names-voices** and turn on its Pages from **main**, **/ (root)**. (This session's
     GitHub integration may not create repositories: it was tried, 403.)
  2. **The worker** (after SC5–SC9 are recorded; no force push):
     - At the game commit that goes live (this one or later) rebuild the manifest from today's script:
       `node tools/voice/production_manifest.mjs --out <tmp>/pm`. It must print `"contentHash":"3c59018e3137"` (the
       GO script plus MW-1's six lines and one reference, less MW-1's three retired lines). If it prints another hash,
       stop and say so.
     - Build into the clone: `node tools/voice/voice_site.mjs --production <tmp>/pm/RECORDING_MANIFEST.json.gz
       --results <batch>/results.json,<batch>/results_MW1.json --files <audio folder of each> --voice-build
       vb1-3c59018e3137 --out <clone>/ja-JP`. Expect `missingRecordings` 0, `missingReferences` 0,
       `withheldReferences` 0, `unusedResults` 3 (MW-1's retired lines, not served), about 23,820 recordings and
       3,074 indexes, under the 900,000,000-byte ceiling.
     - Add an empty `.nojekyll` and the credits (CREDITS.md from the cast record; `docs/hosting/voices-site/README.md`
       is a draft from the casting record here) at the root, commit, `git push origin main`.
     - When Pages has published it, check that `https://a-birdi.github.io/Road-of-Borrowed-Names-voices/ja-JP/index.json`
       answers with `"voiceBuild":"vb1-3c59018e3137"`, and say so.
  - **Done (the worker, 29a8f2c):** A-Birdi/Road-of-Borrowed-Names-voices, main `b2496a81`, voice build
    `2026-10-19.1` (the id the worker chose instead of `vb1-3c59018e3137`), 26,894 files, 559,963,914 bytes; index and
    a recording checked over the web.
  3. **Cloud (done 2026-10-19):** `HOSTED_BASE` set to `'../Road-of-Borrowed-Names-voices/ja-JP/'`
     (src/audio/52_voicebank.js), rebuilt, voice browser tests rerun, pushed. Pages republishes the game within minutes; the next session of
     each player reads the voices. Until then the game plays as now. Saves are untouched (the voices keep their own
     cache, `rbn-voice-v1`).
  - **Checked here:** the same build with that base, served as github.io serves the two sites (scratch check, not
    committed): a line plays its recording from `/Road-of-Borrowed-Names-voices/ja-JP/`, with the page at
    `/Road-of-Borrowed-Names/` and at `/Road-of-Borrowed-Names/index.html`; with the voice site missing, one request,
    no page error, and the line falls back.
  - **Done now:** About & credits says where the voices come from in both cases and credits them (narrator
    「声は(x.com/dopoiro)のAI」, AivisSpeech models, VOICEVOX Nemo, Qwen3-TTS).
- **2026-10-19: SC5–SC9, from Robin's final listening round** (85 keep, 10 redo; Robin: "get these redos sorted, then
  push the voices live"; anything further comes from a full in-game test, not more listening). Appended to
  [supplements/SEND_CORRECTIONS.json](supplements/SEND_CORRECTIONS.json); SC1–SC4 unchanged. Each send is the line's
  own send with one kanji word spelled in the kana of its furigana; the display, spoken text, id and key stay.

  | | Recording | Line | Send | Target (window) | Now |
  | --- | --- | --- | --- | --- | --- |
  | SC5 | `r1-af31602b66d327ad` | Kohaku, hall.w10.t9#008fe5d567 | 「師匠、ページはもう書けています。語らせてください。」 | 4.67 s (3.93–7.52; 7 takes only) | 5.01 s |
  | SC6 | `r1-139fcb0057e03467` | Hisae, kr.hisae_vigil#e117d421a2 | 「ひもりの約束だよ。待っている。」 | 2.51 s (2.18–2.82) | 2.47 s |
  | SC7 | `r1-4a729bf0784c69a1` | Mio, mp.saku_first#4e3e0901f7 | 「せりふを一緒に読んでみませんか。名前より先に、役が戻るかもしれない。」 | 5.74 s (4.97–6.91) | 5.45 s |
  | SC8 | `r1-42001e24d9d659f1` | Nao, mp.saku_first#f7f397738f | 「せりふ、一緒に読んでみるか。名前より先に、役が戻るかもしれない。」 | 5.16 s (4.36–6.24) | 4.85 s |
  | SC9 | `r1-f39bfbb362a57021` | Nao, co.nobu#6ead6abc43 | 「灰のくすり、か。燃えた後のもので、きれいなもんを作る。悪くない。」 | 4.85 s (4.10–5.86) | 5.10 s |

  - **Which take:** the worker's seed search, keeping a take only when the recognizer hears the corrected reading; the
    windows (each speaker's own unflagged takes, morae per second) are only a guard. Results as before: `send` and
    `sendCorrection` on the entry, the replaced take to `superseded/<stamp>/`.
  - **Not listened for, by Robin's word:** other Qwen3-TTS takes of these words (頁 34, 灯守 169, 台詞 151, 釉 1) are
    left to the in-game test.
  - **Still open from f995b1a:** ぶんるいめい (`r1-ref-b8f801f6ac6359dc`). Robin kept the cloned take in round 4
    (sha256 `219acd698574…`, 1.04 s, `narrator/qwen-clone`); the results now hold an AivisSpeech take (`a9a1e4947c15…`,
    0.885 s) and the clone is not in `superseded`. To restore the kept clone before the site is built.
- **2026-10-19: SC4, and references left to the device's voice** (the worker, after Robin's review round 3 of
  2026-10-18: 12 redo, 21 keep).
  1. **SC4, the narrator's reading of 潮止まり: the same id, sent in katakana.** Record `r1-ref-e5bf48bf7ab94ff8` (key
     `word:潮止まり|しおどまり`, citation) again with the send **シオドマリ**, same voice. Robin: "should read as
     Shi-o-do-ma-ri but is heard as Sho-do-ma-ri - focus on the kana size". In the worker's trials (6 takes per input,
     checked by the local recognizer against the reading) the katakana kept しお as two beats in 4 of 6, against 1 of 6
     for しおどまり and for 潮止まり, and 0 of 6 for either comma spelling.
     - **Which take:** choose among the takes the recognizer hears as しおどまり; Robin's listening decides. The length
       window (0.83–1.16 s, median 0.97 s over 678 unflagged 5-mora word readings at ec82501) is only a guard: the
       current take is 1.23 s, so length does not show this fault.
     - **The results, as before:** the new take at `ref/r1-ref-e5bf48bf7ab94ff8.opus`, its entry with `"send": "シオドマリ"`
       and `"sendCorrection": "SC4"`, the replaced take to `superseded/<stamp>/`.
     - **The rule** ([VOICE_DELIVERY.md](VOICE_DELIVERY.md) §7 step 8) now says that the reading may be sent in katakana,
       which writes the same sounds, and that a reference reading is corrected the same way (word and reading stay).
  2. **The answer on 大石 (おおいし), 母港 (ぼこう) and 分類名 (ぶんるいめい), and 三里 (さんり) if Robin chooses so: yes, the
     game falls back.** A reference reading with no recording in the site is said by the device's Japanese voice when
     the device has one; when it has none, nothing speaks and that word's Listen / Say it control is hidden. This holds
     in the default "Prepared voices" mode; "Device voice" uses the device anyway, and "No voice" says nothing.
     (src/audio/54_voice_route.js `sayRef` and `canSayRef`: the recording is asked first, and anything but a playing
     recording goes to the device.)
     - **How to mark one, if Robin chooses the device voice:** take its entry out of `recordings` in `results.json` and
       name the id in a top-level `withheld` instead, with the reason and Robin's decision (VOICE_DELIVERY.md §4):
       `"withheld": { "r1-ref-2bab5bdb1e5539fb": { "reason": "AivisSpeech says おいしい for おおいし whatever it is sent",
       "decided": "Robin, <date>: …", "closest": { "file": "…", "bytes": …, "sha256": "…" } } }`. `closest` is optional:
       the take stays in the batch folder and is not served.
     - **What voice_site.mjs does with it:** leaves the id out of the reference index and counts it as
       `withheldReferences`, apart from `missingReferences`. It refuses an id that is not a reference reading in the
       manifest, and one that is both in `recordings` and `withheld`, so a slip cannot drop a line or serve a withheld
       take.
     - **The ids:** 大石 `r1-ref-2bab5bdb1e5539fb`, 母港 `r1-ref-b06952501818dfed`, 分類名 `r1-ref-b8f801f6ac6359dc`,
       三里 `r1-ref-99bd62e1b425b4d1`. Robin's choice is still open; nothing is withheld yet.
  3. **For the record, the worker's status** (as relayed): the approved clip fix is finished (1,082 narrator reference
     readings and 49 narrator lines re-made with recognizer selection and the text-aware trim; 65 Qwen lines re-trimmed
     on their own seeds); a breath after the word's own decay ("breathy uptick") was cut from 136 masters and their 161
     recordings re-rendered; the trim is now text/4 (the ending stops at the first dip); Uno now uses a clean reference
     cut from the accepted take (it held 7 s of babble after the sentence), and all four Uno lines were re-made and kept
     by Robin. The worker's records follow in the repository.
- **2026-10-18: send corrections SC2 and SC3** (Robin's listening decisions, relayed by the worker: 50 redo, 101 keep,
  the rest stands; two of the redos are send corrections). Both are appended to
  [supplements/SEND_CORRECTIONS.json](supplements/SEND_CORRECTIONS.json); SC1 is unchanged.
  1. **SC2, the narrator: the same id, 札 sent as ふだ.** Record `r1-6843cbc80ebf3837` (key hall.w10.tab_sg#87dfc51991,
     neutral) again with the send **「「潮硝子」のふだを拾った。」**, same voice. Robin: "札 is pronounced さつ rather than its
     intended ふだ". The display already reads {札|ふだ}; only that word changes in the send, so the rest of the delivery
     stays as it was.
     - **Target:** about **1.98 s**, window 1.77–2.19 s: 13 morae at the narrator's median pace for one-pause lines of
       10–16 morae in this batch (287 unflagged takes, 6.55 a second; p10–p90 5.93–7.35). The current take is 1.99 s, so
       the length search is only a guard.
  2. **SC3, Nao: the same id, without the comma.** Record `r1-2d3ac586bb0e7209` (key mb.ks_token_shelf#212c320964,
     neutral) again with the send **「言われた通りにしか行かない舟か。……正直な奴だ。」**, same voice. Robin: "the overall
     delivery is good, except the か with a strange delay likely caused from the comma". The display keeps its comma.
     - **Target:** about **4.10 s**, window 3.61–4.78 s: 25 morae with the 「。……」 beat, at Nao's median pace for takes
       with 「。……」 (212 unflagged takes, 6.09 a second; p10–p90 5.23–6.92). The current take is 3.85 s.
  3. **The results, as for SC1:** the new take replaces the file in `results.json` at the same path; its entry adds
     `"send"` (the corrected send) and `"sendCorrection"` (`"SC2"` / `"SC3"`). The replaced take moves to
     `superseded/<stamp>/`. The review list and the listening page pick the correction up by id (both cards already show
     "A corrected send is chosen"; they read "Recorded with the corrected send" once `sent` equals it).
  4. **The rule, widened** ([VOICE_DELIVERY.md](VOICE_DELIVERY.md) §7 step 8): a send correction keeps the line's words,
     each sent as written or as the reading the line gives it, in kana; only a silent opening 「……」 or a comma may be left
     out; and it changes no more than the fault needs (one word or one comma where only that is wrong), so a delivery
     Robin liked stays. The unit test reads each correction against its display.
  5. **Lines that may share the faults (for listening, not corrected).** Only marked takes are corrected; these are listed
     so Robin and the worker can check them by ear:
     - **札 as ふだ:** the 11 other wing-10 tablet lines from the same template (src/content/hall/39a_w10_scenes.js:126):
       r1-101ef8952e7e0337 (yn), r1-54d0981d49eaa4e0 (lf), r1-56b5e145d3866919 (ko), r1-63813ba6a8b58db8 (mb2),
       r1-75080f81ee371bec (kr), r1-795eaf956be01c90 (sb), r1-b7f8dfeb3a1d1728 (cr), r1-c58f5afc89a14014 (co),
       r1-e6415ccd77c70dcb (sa), r1-f150417e65a2ad7c (rw), r1-fca2cb5a8f8a84b3 (mb1). Beyond them, 270 more narrator
       recordings and 197 other speakers' carry {札|ふだ} (479 in all), and 97 more carry a compound read with ふだ
       ({名札|なふだ}, {荷札|にふだ}, {木札|きふだ}, {花札|はなふだ}). Ten reference readings mean ふだ: 札 (two), 名札, 荷札,
       立て札, 木札, 札場, 札橋, 札蟹, 花札 (高札, こうさつ, is meant with さつ).
     - **「、か。」:** 65 lines end a clause with 「、か。」 (Nao 33, Suzu 20, Mio 3, Omi 2, seven others one each); the same
       pause may sit in some of them.
  6. **For the record, the worker's other work on Robin's notes** (as relayed):
     - **Lighter reverb:** every line of The Tide Clerk (sg_clerk, preset hush), the Gardener of Unsent Words (ko_gardener)
       and the Nameless Bridge (mb_bridgespirit) re-rendered from the clean masters, the reverb about 30% shorter and 35%
       quieter. The Kiln Warden and the Lord of the Understage stay as they are (Robin: perfect).
     - **The trim:** it clipped opening voiceless fricatives (the さ and は rows) whenever more than 0.20 s of sound came
       before the voice; this is Robin's "ふ is effectively silent" and the narrator's single-word "gasping". The redos use
       a text-aware trim. A scan finds 1,657 fricative-initial takes with the clipped opening (1,275 narrator reference
       readings, 113 narrator lines, 136 Suzu, the rest spread); the worker is asking Robin before touching any take that
       is not marked.
- **2026-10-18: the answers to Robin's two requests** (relayed by the worker: "reconcile Wataru's line … a listening
  page for anything needing review"):
  1. **Wataru's line: the same id, with a new send.** Record `r1-6ab18b4d8dcef181` (key sg.omi_wataru#a036d6675c,
     delivery surprise) again with the send **「やめさせないんですか。」**. Keep the same voice and use a length-fit seed
     search.
     - **Display:** unchanged, 「……{辞|や}めさせないんですか。」.
     - **Target:** about **1.67 s**, with a window of 1.43–1.93 s. That is 10 morae at Wataru's own median pace in
       this batch, 5.99 a second. The 2.9 s you used counted 11 morae and a beat for the opening 「……」.
     - **The record:** SC1 in [supplements/SEND_CORRECTIONS.json](supplements/SEND_CORRECTIONS.json). The rule is
       [VOICE_DELIVERY.md](VOICE_DELIVERY.md) §7 step 8.
     - **The results:** put the new take at `wataru/r1-6ab18b4d8dcef181.opus` in `results.json`, and add
       `"send": "やめさせないんですか。"` to its entry. Move the 1.17 s take to `superseded/<stamp>/` beside the two
       earlier takes.
     - **Not a supplement:** this is not a new id like MW-1's. Nothing in the site's lookup changes. The new audio
       gets a new content name, so no player's kept copy goes stale.
     - **Then:** add the new take to `REVIEW_LIST.json`'s open item, with the 1.17 s take under `earlierTakes`. Rebuild
       the page (2 below). Its card then says "Recorded with the corrected send".
  2. **The listening page: `docs/future/voice/production/run/REVIEW_LISTENING.html`.**
     - **To use it:** copy it into the batch folder, the one holding `<speaker>/` and `superseded/`, and send Robin
       that file.
     - **Or build it there:** `node tools/voice/review_page.mjs --batch <batch folder>` writes
       `<batch folder>/REVIEW_LISTENING.html` and lists any named take that is not in the folder.
     - **What it holds:** the list, written in. The takes play by their relative paths. There is no audio in it and in
       the repository, and nothing is fetched or sent.
     - **On each card:** play, the earlier takes, and Keep / Redo / an earlier take instead, plus a note. "Copy my
       decisions" and "Save my decisions" give text with a JSON line (`rbn.voice.review-decisions/1`).
     - **Unmarked takes stand as made.** Wataru's line needs a decision.
     - **Checks:** VALIDATION.md "Wataru's line reconciled (SC1) and Robin's listening page".
- **2026-10-18: the run records are in the repository** (38a397f, the worker's own push, new files only):
  [run/RUN_SUMMARY.md](run/RUN_SUMMARY.md), `run/results.json.gz` (`results.json` gzipped), `run/results_MW1.json` and
  `run/POST_CHECK.json`.
  - **The worker reports:**
    - 23,816 + MW-1's 7 made, 0 failed, 0 pending;
    - every file decodes and matches its bytes and SHA-256;
    - `voice_site.mjs` built a site from them locally with 0 errors and 0 missing recordings or references;
    - the voice folder is 557,980,768 bytes;
    - the audio (552,138,662 bytes) stays on Robin's PC.
  - **Checked here** (the lead, on the pushed files):
    - the results name the GO pins (ff8a0fa, 513ec3ff…, content 65cd38053ad6);
    - all 23,816 GO manifest ids (14,721 recordings + 9,095 references) have a result, and none are pending or failed;
    - `results_MW1.json` covers the supplement's 7 ids and nothing else;
    - none of the four files carries a local path or a credential.
  - **Open, then reconciled (see the entry above):** `r1-6ab18b4d8dcef181` (Wataru, surprise,
    「……辞めさせないんですか。」, sg.omi_wataru) is 1.17 s for 10 morae on all 12 seeds tried, and is flagged. The
    expected 2.9 s counts the opening 「……」, which the trim removes from every line; the 14 other short 「……」 lines
    are 0.5–0.8 s and were judged not errors. Its actual pace is about 8.5 morae a second: brisk for a surprised line,
    not impossible. *(Corrected: this note first said a send without the 「……」 would be a new id. It would not. The
    id comes from the spoken text, which does not change; SC1 keeps the id.)*
  - **Fixed after the worker's note:** `voice_site.mjs`, `site_size.mjs`, `voice/lines.mjs` and the music
    `export_events.mjs` compared `import.meta.url` with `'file://' + argv[1]`. On Windows that never matches, so the
    commands exited silently. They now compare with `pathToFileURL(path.resolve(argv[1]))`, as `scene_manifest.mjs`
    already did.
  - **For the hosted site:** pass `voice_site.mjs --production` a manifest rebuilt at the site's revision
    (`production_manifest.mjs --out <dir>`). The committed manifest is the GO one, and it neither uses the MW-1 ids
    nor drops the 3 retired ones.
- 2026-10-18: the MW-1 supplement recorded after the batch: 7 of 7 made, 0 failed: the 6 narrator lines and the
  どすん reference. It was taken from the record at 5a8353c, and the worker's sha256 (52e292f2…) is that file's: it
  checks out byte-identical here and has not changed since. Results are in `results_MW1.json`, beside `results.json`.
  The 3 retired ids keep their files (VOICE_DELIVERY.md §8.4). Nothing pushed. Status only; no request to the lead.
- **2026-10-18: the batch run FINISHED:** 23,816 recordings made, 0 pending, 0 failed (the GO manifest's whole count).
  The audio stays on Robin's PC (§9). `results.json` and the run summary come back to this repository after the
  worker's own checks. Nothing pushed yet. Status only; no request to the lead.
- 2026-10-17, after the resumption (superseded by the lines above): phase 1 finished again (the AivisSpeech narrator, the reference readings, the
  AivisSpeech and Nemo NPCs, and Mochi), with the same counts as at the pause: 20,731 made, 3,085 pending, 0 failed. So
  the resumed pass made nothing new in phase 1, and what is left is Qwen's (the pause listed the rest of Ren, Suzu and
  the last Qwen NPCs). Qwen is starting. Status only; no request to the lead.
- 2026-10-17, after the pause (superseded by the line above): RESUMED on the same pinned source ff8a0fa and manifest 513ec3ff…, with the
  runaway-length guard on Qwen takes (normal takes unchanged). The counts are as at the pause: 20,731 made, 3,085
  pending, 0 failed. Nothing pushed. Status only; no request to the lead.
- 2026-10-17, later (the pause; superseded by the resumption above): PAUSED at Robin's request (the GPU is needed for a while). Saved: 20,731 recordings made,
  3,085 pending, 0 failed (20,731 + 3,085 = 23,816, the GO manifest's count). Still to make: the rest of Ren, Suzu and
  the last Qwen NPCs, then the MW-1 supplement as recorded at 5a8353c (6 narrator lines and 1 reference reading, on
  top of the 23,816). It resumes by exact input identity from the same pinned inputs. Nothing pushed. Status only; no
  request to the lead.
- 2026-10-17 (superseded by the counts above): phase 1 finished (the AivisSpeech narrator, the reference readings, the AivisSpeech and Nemo NPCs,
  and Mochi): 18,781 recordings made, 5,035 pending, 0 failed (18,781 + 5,035 = 23,816, the manifest's count). Qwen
  started. The whole-game batch was then resumed on the same pinned source ff8a0fa and manifest 513ec3ff…, with a
  runaway-length guard added to Qwen takes; normal takes are unchanged. Status only; no request to the lead.
- 2026-10-16 (superseded by the counts above): phase 1 done, 14,306 made, 0 failed; Qwen, 9,510 pending, started.

FR-1 (§5) changed none of the inputs above: the manifest check still reports content 65cd38053ad6.

Nothing has been pushed. Results come back as `results.json` (VOICE_DELIVERY.md §4 and §9).

To check:
```
git fetch origin claude/stoic-sagan-n3jvgk
git checkout ff8a0fa87cfacb322b8c277305eddd9b4cc196fb
node tools/voice/production_manifest.mjs --check
```
It prints "manifest is current: 14721 recordings + 9095 reference readings, content 65cd38053ad6".

**What the inputs are:**
- **The scope:** [PRODUCTION_SCOPE.md](PRODUCTION_SCOPE.md), Robin's production authorization kept apart from the auditions, and the agreed cast.
- **The contract:** [VOICE_DELIVERY.md](VOICE_DELIVERY.md), with the recording key, the variants, pronunciation normalization, the encoding, the results schema and the voice site.
- **The manifest:** `docs/future/voice/production/manifest/RECORDING_MANIFEST.json.gz` (with `SUMMARY.json`), built from the corrected script.
- **The go signal:** [GO.json](GO.json), with the exact source commit, the manifest's SHA-256 and the script's content hash. Check with `node tools/voice/production_manifest.mjs --check`.

**C-95 is reconciled** for the recording ([../../../review/register/DISPOSITIONS.md](../../../review/register/DISPOSITIONS.md)).
- All 304 findings carry a disposition: 222 accepted, 70 retained and 12 deferred.
- D6 word help is done too, in parallel, with no line changed.
- All 80 "fix before recording" findings are applied.
- The 112 preserved lines are unchanged.
- The frozen audition texts are unchanged, with their divergences recorded.

**Not holding generation**, each recorded:
- **Later lexicon changes:** a word added or changed later becomes a small supplement under its own reference id. D6's 54 new words are already in this manifest.
- **12 deferred findings:** these are Robin's decisions. Their lines are recorded as they are now. A later change re-records only those lines (new ids).
- **116 lines with the player's name:** a second small pass, once their neutral-word versions are written (C-93).
- **Hosting:** generation does not wait for a host or a deployment.
- **MW-1 supplement (2026-10-17):** Robin's Old Mill flow change adds 6 narrator lines and 1 narrator reference reading
  (どすん), and retires 3 lines: [supplements/MW1_SUPPLEMENT.json](supplements/MW1_SUPPLEMENT.json) (187 characters).
  It is recorded after the batch, with the same narrator voice, delivery and encoding: done on 2026-10-18, 7 of 7, 0
  failed (`results_MW1.json`; the progress list above). The batch's inputs are unchanged
  (`GO.json`: ff8a0fa, 513ec3ff…). At the branch head, `--check` now reports that the script has moved past the GO
  manifest. That is expected; it does not touch the batch, which checks out ff8a0fa.
- **SL-1 supplement (2026-10-19, Robin: "every line in-game should have spoken lines"):** 574 new recordings for lines
  the game's own code shows, now under stable scene ids: the prologue's captions, shut doors, marked objects (the Old
  Mill's notice among them), every line of the six field puzzles (the swinging screen and its clamp in Reedwake among
  them), every oral-history fragment (Old Yasu's story of Reedwake among them) and every battle line (each creature's
  intro and its line once settled, phases): narrator 515, Yasu 16, Tetsu 16, Kasane 25, Isao 1, Oyone 1; no reference,
  nothing retired. [supplements/SL1_SUPPLEMENT.json](supplements/SL1_SUPPLEMENT.json): its `builtFrom` names the commit
  and script content hash; `node tools/voice/supplement.mjs` rebuilds it. Recorded after the batch and the send
  corrections, with each speaker's accepted voice, delivery and encoding, into `results_SL1.json`.
  - **The voice site:** a site built from a commit at or after this supplement has the new scene shards; with no SL-1
    results yet, `voice_site.mjs` reports these as `missingRecordings` and the game simply has no recording for them (as
    today). The live build `2026-10-19.1` (3c59018e3137) is unaffected until it is rebuilt.
- **SC10 (Robin, 2026-10-19, playing):** Nao's 「葦、見てきたな。どう思った？」 (`r1-e1b3503be1963951`) read 葦 as
  "goku"; it is sent with あし (SEND_CORRECTIONS.json). Fifteen other recordings send a bare 葦 and were not reported:
  worth a listen while SC10 is recorded (an SC each for any that misread): `r1-439a8bb23eeac272` (Mitsue),
  `r1-ae5db8c3a54e390e` (Mame), `r1-6d88befa2dc31281` and `r1-c2611cde557ba239` (Nao), and the narrator's
  `r1-0f5f09c8bada8bf4`, `r1-37541eb3f610145b`, `r1-435699ffffe3c7e4`, `r1-451603efdb79f504`, `r1-6014d737464b850e`,
  `r1-6a44581301cb2dc5`, `r1-97d84117506b9dab`, `r1-c52251d2650145bb`, `r1-cad6de0625049d05`, `r1-ec3f8099c556c7d6`,
  `r1-fa2f6867c0bd8f8a`.
- **SC11–SC14 (the local worker's recognizer check of those fifteen, 2026-10-20, relayed by Robin):** four were likely
  misread and are now sent with あし, each as SC10 (SEND_CORRECTIONS.json; display, spoken, id and key unchanged):
  - SC11 `r1-6d88befa2dc31281` (Nao, Qwen3-TTS; heard ググ);
  - SC12 `r1-c2611cde557ba239` (Nao, Qwen3-TTS; heard グ);
  - SC13 `r1-439a8bb23eeac272` (Mitsue, Qwen3-TTS; heard グダ);
  - SC14 `r1-ae5db8c3a54e390e` (Mame, AivisSpeech; heard 足し, probably たし).
  Nine of the narrator's were heard right (あし) and stay. Two of the narrator's were heard as はし, which may be the
  recognizer or a breathy h before あ: `r1-6014d737464b850e` and `r1-fa2f6867c0bd8f8a`. They stay as they are for
  Robin's ear (an SC each if Robin hears はし).

## 2 · Runtime integration: BUILT AND TESTED, NOT YET WITH REAL RECORDINGS

[VOICE_RUNTIME.md](VOICE_RUNTIME.md) describes it.

**What `tests/e2e/voice_runtime.mjs` checks** (Chromium, 9/0), on a real voice site with synthetic tones:
- recordings play with no Japanese system voice;
- nothing is fetched before play;
- looking ahead is bounded;
- the cache persists across visits, survives being broken, stays within its limit and clears only itself;
- No voice, Mute and a zero voice level fetch nothing;
- Kansai, and the player's Voice A/B with High/Low, pick the right variant;
- the learning controls play their recordings;
- the voiced offline package plays from `file:`.

**VR-C1** (Astra's audit, 2026-10-16) corrected the loader after reproducing its cases on the full module. The
changes:
- lookahead to lines that will certainly come;
- one bounded speculative queue;
- index recovery;
- checked kept copies;
- bookkeeping across tabs;
- writes never waited for.

`tests/e2e/voice_runtime_vrc1.mjs` (Chromium, 7/0) checks them on the built page. They are not real-audio or other-browser
evidence (VALIDATION.md "VR-C1").

**Open:**
- the first real recordings, to hear and to time;
- `HOSTED_BASE`, set when the host is chosen;
- browsers other than Chromium (Firefox, Safari): not installed where the tests run;
- phones.

## 3 · Hosting: AUDITED; PUBLISHING NEEDS ROBIN

[../../../hosting/RUNTIME_PUBLISHING.md](../../../hosting/RUNTIME_PUBLISHING.md) has the full account.

**Done:**
- The unpacked Pages output was audited.
- The runtime-only folder is prepared and browser-tested on its own: 625 files, 523,674,397 bytes.
- The voice site format and the offline package are built.
- Development evidence stays in the repository and is not published; nothing was deleted.

**The size guard** (VR-C1): `tools/publish/site_size.mjs`, a ceiling of 900,000,000 bytes, in `prepare_runtime.mjs`,
`voice_site.mjs` (the whole site folder, kept builds included) and the draft workflow before upload.

**Concrete blockers, Robin's to remove (the lead cannot):**
1. **The game's site.** It publishes the whole branch, about 1.07 GB, over the 1 GB limit. Switching Pages to the runtime-only workflow (draft: `docs/hosting/pages-runtime.workflow.yml`) is a Pages setting. The URL is unchanged.
2. **Where the voices are published.** The lead's recommendation is a same-origin Pages repository, for example `A-Birdi/Road-of-Borrowed-Names-voices`: about 665 MB, under its own 1 GB.
   - Creating that repository and enabling its Pages is Robin's.
   - The game then gets its base path (`HOSTED_BASE`) in a one-line change.
3. **Then the audio is published there.** The lead pushes nothing of the audio to this branch.

## 4 · The voiced offline package: BUILT AND TESTED (Chromium)

`node tools/publish/offline_package.mjs --site <voice site> --out <dir>` builds the package. It uses the same accepted recordings, the same files and the same site; opening its `index.html` from disk plays them. It is a separate delivery from the hosted game; the hosted game never needs it.

## 5 · Status note to Local: FR-1 (2026-10-17)

FR-1 (Robin's Foundations clarity pass, `docs/review/fr1/FR1_REPORT.md`) is UI and learning-path work. Local's current
voice batch stays pinned and running unchanged:

> FR-1 needs 0 new spoken lines. Existing reference audio is reused.
> No change to your batch inputs or accepted audio is requested.

What was checked: `node tools/voice/production_manifest.mjs --check` reports the manifest current (14,721 recordings and
9,095 reference readings, content `65cd38053ad6`), the same as before FR-1. `GO.json`, the production manifest, the
spoken script lines, speakers, readings and recording IDs are untouched. The two script edits FR-1 made are stage
directions on lines that already existed (`!lesson kana` → `!lesson kana for <challenge>` in `rw.m1_gears` and
`rw.m2_lantern`), in place, so no line number moved. The new UI wording (the summary, "Add character", the help
lines, the single-kana feedback, the lesson sheet) is written text only.

## 6 · Status note to Local: SL4, and the order of the remaining recordings (2026-10-20)

Robin, 2026-10-20: "Create the relevant missing voice lines and ensure they're pushed live … Coordinate with the local
agent entirely." Coordination runs through the QA issue (A-Birdi/Road-of-Borrowed-Names#1, `[Claude Cloud]` comments)
and this file.

**SL4 (`supplements/SL4_SUPPLEMENT.json`)** lists the lines the game's own code shows (XP136; the VL-1 pass,
`docs/future/voice/SPOKEN_SURFACES.md` §1). It has 1,779 new recordings and 52,303 morae, with no new references and
nothing retired. Built from `4e144ec`, after MW1, SL1 and SL3.
- **By speaker:** narrator 687, Suzu 397 (196 of them her Kansai lines), Nao 208, Ren 206, Mio 203, Hana 7, and 2–4
  each for 19 residents.
- **By scene:**
  - `code.comp` 449 (the companion's remarks, thoughts, place talk, What We Keep, the Company page);
  - `code.pages` 385;
  - `code.fw` 282 (every exploration action's own rules);
  - `code.atlas` 185;
  - `code.play` 145 (the shiritori table);
  - `code.stamp` 86 (every set of stamps a stand can press, and the empty stand: Agnes's RBN-QA-002);
  - `code.fish` 69;
  - `code.letters` 48 (a villager's acknowledgement);
  - `code.town` 38;
  - `mp.press_react` 28;
  - `code.ngplus` 24;
  - `code.verbs` 20;
  - `code.weave` 12;
  - `cs.view_*` 6;
  - `ws.ask` 2 (a simpler version when you ask back).

  The game already passes these scene ids. B `spoken_lines` 24/0 plays a test recording for one line of each family
  through the game's own code.
- **Recording:** the same cast, engines, gates (the recognizer, a natural ending, the text/5 trim) and results
  convention as SL1/SL3, into `run/results_SL4.json`. The voice site is rebuilt from every results file (GO, MW1, SL1,
  SL3, SL4 and the send corrections SC10–SC14) with a new `voiceBuild`, then pushed to the voices repository. A
  `[Claude Cloud]`/`[Claude Local]` note on the QA issue gives the new build's identity.
- **SL5 (`supplements/SL5_SUPPLEMENT.json`)** lists the rest of the lines someone says (VL-2). It has 868 new
  recordings and 18,798 morae, with no new references and nothing retired. Built from `54728da`, after MW1, SL1, SL3
  and SL4.
  - **By speaker:** the player 412 (103 lines × the four variants), narrator 378, Suzu 33 (15 of them Kansai), Mio 17,
    Nao 15, Ren 13.
  - **By scene:**
    - `code.enc` 392: an encounter's people, your social lines, its conclusions;
    - `code.battle` 378: every telegraph at every tier with the names the code can put in, and the solo wordings
      for a move at both (Agnes's RBN-QA-003);
    - `code.comp` 70: a Shared memory's reply;
    - `code.hanafuda` 16: the calls;
    - `code.ask` 12: your ask-back questions.
  - **Recording:** the same terms as SL4.
  - **Left out, with the reasons in SPOKEN_SURFACES.md §2:** lines with your own name; English-only battle and
    encounter text; reading tasks; written records; the decisions left to Robin.
