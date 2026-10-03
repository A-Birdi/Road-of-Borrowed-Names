/* How Suzu speaks (src/ui/56_suzu_speech.js): the choice when she joins you, and the
 * in-world way to ask her from Company › Suzu. Her lines here have Kansai versions
 * like all her lines (kansai_70_company.js). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
# asked once in a campaign, when Suzu agrees to come (called from rw.hall_suzu)
@scene rw.suzu_speech
!hook suzu_speech join

# Company › Suzu: "Ask her to talk as she does backstage" (the setting is already Kansai)
@scene co.suzu_speech_kansai
suzu[laugh]: {楽屋|がくや} の {言葉|ことば} で {話|はな}して いい の ？ …… じゃあ 、 {遠慮|えんりょ} なく 。 {分|わ}からない ところ が あったら 、 いつ でも {言|い}って ね 。 || Backstage talk, then? …All right, no holding back. If you can't follow something, just say so, any time.

# Company › Suzu: "Ask her to use her stage Japanese" (the setting is already standard)
@scene co.suzu_speech_standard
suzu[smile]: {了解|りょうかい} 。 {舞台|ぶたい} の {言葉|ことば} で {話|はな}す ね 。 {一番|いちばん} {後|うし}ろ の {席|せき} まで {届|とど}く よう に 。 || Understood. Stage Japanese it is — clear enough to reach the back row.
`, 'dialect/scenes');
