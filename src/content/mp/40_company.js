/* Manybridge, Chapter 4: the companion (expansion P09; plan C10 "a bonding scene within the existing Bond table").
 * The fireworks on the festival night: one bond event (RB.company.award through !hook co_bond, once a journey) and a
 * kept memory (!hook co_remember, with the lines said then). The memory's words are each companion's own; its "keep"
 * line is what they recall in What We Keep. Twelve-chapter journeys only: the scene is in Chapter 4. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  const CC = C.company;
  CC.bondEvents = Object.assign(CC.bondEvents || {}, { 'fest:fireworks': 1 });
  CC.mem.fireworks = {
    kind: 'together', title: T('{川開|かわびら}き の {花火|はなび}', 'Fireworks at the Opening'), place: T('{芝居|しばい} の {通|とお}り', 'Playhouse Row'),
    texts: {
      nao: T('{幕橋|まくばし} の たもと で 、 {浴衣|ゆかた} の まま 、 {花火|はなび} を {見|み}た 。 ナオ は 、 {誰|だれ} か の ため に {怒|おこ}った {話|はなし} を した 。', 'At the foot of the Curtain Bridge, in yukata, you watched the fireworks. Nao talked about being angry on someone else\'s behalf.'),
      mio: T('{幕橋|まくばし} の たもと で 、 {浴衣|ゆかた} の まま 、 {花火|はなび} を {見|み}た 。 ミオ は 、 {怒|おこ}る こと と {薬|くすり} の {話|はなし} を した 。', 'At the foot of the Curtain Bridge, in yukata, you watched the fireworks. Mio talked about anger, and medicine.'),
      ren: T('{幕橋|まくばし} の たもと で 、 {浴衣|ゆかた} の まま 、 {花火|はなび} を {見|み}た 。 レン は 、 {静|しず}か な {怒|いか}り の {話|はなし} を した 。', 'At the foot of the Curtain Bridge, in yukata, you watched the fireworks. Ren talked about a quiet kind of anger.'),
      suzu: T('{幕橋|まくばし} の たもと で 、 {浴衣|ゆかた} の まま 、 {花火|はなび} を {見|み}た 。 スズ は 、 {初|はじ}めて {客席|きゃくせき} から {花火|はなび} を {見|み}た 。', 'At the foot of the Curtain Bridge, in yukata, you watched the fireworks. For once, Suzu watched them from the audience.'),
    },
    keep: {
      nao: T('{八百橋|やおばし} の {花火|はなび} 。 {関係|かんけい} ない {荷物|にもつ} の ため に {怒|おこ}って 、 それ で よかった と {思|おも}えた {夜|よる} だ 。', 'The fireworks in Manybridge. The night I got angry over a parcel that wasn\'t mine, and found that was all right.'),
      mio: T('{川開|かわびら}き の {花火|はなび} 。 {怒|おこ}る の も 、 {量|りょう} を {間違|まちが}え なければ {薬|くすり} に なる 。 あの {夜|よる} に {覚|おぼ}えた こと です 。', 'The fireworks at the Opening. Anger can be medicine too, if the dose is right. I learned that that night.'),
      ren: T('{幕橋|まくばし} の {花火|はなび} 。 {一番|いちばん} {短|みじか}い {灯|あか}り を 、 {隣|となり} で {見|み}ました 。 {静|しず}か な {怒|いか}り と いう {言葉|ことば} も 、 あの {夜|よる} に もらいました 。', 'The fireworks at the Curtain Bridge. We watched the shortest-lived light side by side. That night you gave me the words "quiet anger", too.'),
      suzu: T('{川開|かわびら}き の {夜|よる} 。 {袖|そで} じゃ なくて 、 {客席|きゃくせき} から {花火|はなび} を {見|み}た の 。 あなた の {隣|となり} で 。', 'The night of the Opening. I watched the fireworks from the audience, not the wings. Next to you.'),
    },
  };
})(RB.content);
