/* A Quiet Cast — interface labels that carry Japanese (validated like every
 * other Japanese text: furigana on every kanji, words in the lexicon). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (F) {
  'use strict';
  F.addText({
    title: { jp: '{静|しず}か な {釣|つ}り', en: 'A Quiet Cast' },
    notes: { jp: '{釣|つ}り の {記録|きろく}', en: 'Fishing notes' },
    cast: { jp: '{竿|さお} を {出|だ}す', en: 'Cast' },
    discover: { jp: '{水|みず} を {探|さぐ}る', en: 'Discover the waters' },
    look: { jp: 'この {魚|さかな} を {探|さが}す', en: 'Look for this fish' },
    where: { jp: 'どこ に {竿|さお} を {出|だ}す か', en: 'Where to cast' },
    wait: { jp: '{当|あ}たり を {待|ま}つ', en: 'Waiting for a bite' },
    skip: { jp: '{待|ま}たずに {進|すす}む', en: 'Skip waiting' },
    bite: { jp: '{当|あ}たり', en: 'A bite' },
    take: { jp: '{見|み}て みる', en: 'Take a look' },
    note: { jp: 'ヤス の メモ', en: 'Yasu\'s note' },
    answer: { jp: '{答|こた}える', en: 'Answer' },
    observe: { jp: '{観察|かんさつ}', en: 'Observation' },
    release: { jp: '{水|みず} に {返|かえ}す', en: 'Release' },
    again: { jp: 'もう {一度|いちど}', en: 'Cast again' },
    review: { jp: '{振|ふ}り{返|かえ}る', en: 'Review' },
    leave: { jp: '{離|はな}れる', en: 'Leave' },
    rules: { jp: '{釣|つ}り の きまり', en: 'Rules' },
    survey: { jp: 'ヤス の {調査|ちょうさ}', en: 'Yasu\'s survey' },
    input: { jp: '{答|こた}え{方|かた}', en: 'Answer by' },
    pace: { jp: 'ペース', en: 'Pace' },
    paceOff: { jp: '{時間|じかん} の {制限|せいげん} なし', en: 'Off — A Quiet Cast' },
    paceGentle: { jp: '{少|すこ}し の {流|なが}れ', en: 'Gentle — A Little Current' },
    paceBrisk: { jp: '{速|はや}い {流|なが}れ', en: 'Brisk — A Quick Current' },
    paceCustom: { jp: '{自分|じぶん} で {決|き}める', en: 'Custom' },
    casts: { jp: '{今回|こんかい} {出|だ}す {回数|かいすう}', en: 'Casts this outing' },
    ribbon: { jp: '{竿|さお} の リボン', en: 'Rod ribbon' },
    frame: { jp: '{額|がく} に {入|い}れた {水辺|みずべ} の {絵|え}', en: 'Framed waterside illustration' },
    spread: { jp: '{九|きゅう}{種類|しゅるい} の {見開|みひら}き', en: 'The nine-fish spread' },
    reflect: { jp: '{一緒|いっしょ} に {振|ふ}り{返|かえ}る', en: 'Look back together' },
    reflectSolo: { jp: '{記録|きろく} を {振|ふ}り{返|かえ}る', en: 'Look back over the notes' },
    first: { jp: '{初|はじ}めて の {記録|きろく}', en: 'First record' },
    unseen: { jp: 'まだ {見|み}て いない', en: 'Not yet seen' },
    expression: { jp: '{言葉|ことば} を もう {一度|いちど} {見|み}る', en: 'Show the expression again' },
  });
})(RB.fishing);
