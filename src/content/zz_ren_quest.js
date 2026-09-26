/* Ren's personal thread (Master Ushio) as a journal quest. The scenes live in
 * ch4 (the sketch in the observatory) and ch6 (the grave, the folio); this only
 * gives the journal something to track. Started only when Ren is the companion. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  C.quests.ren_ushio = { chapter: 4, title: { jp: '{師匠|ししょう} の {顔|かお}', en: 'The Teacher\'s Face' },
    stages: [
      { jp: 'レン は {師匠|ししょう} ウシオ の {顔|かお} を {思|おも}い{出|だ}せない 。 {星図|せいず} は {南東|なんとう} の {光|ひかり} を {指|さ}して いた 。', en: 'Ren can\'t remember their teacher Ushio\'s face. The star charts pointed to a light in the southeast — where Ushio went.' },
      { jp: 'ウシオ の {墓|はか} を {見|み}つけた 。 {墓|はか} を {彫|ほ}った {人|ひと} に 、 レン は {聞|き}きたい こと が ある 。', en: 'You found Ushio\'s grave below the Archive. Ren has questions for whoever carved it — and the Archive may be holding what Ushio left.' },
    ] };
})(RB.content);
