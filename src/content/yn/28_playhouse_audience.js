/* Steamhollow, Chapter 11: the little theatre's audience on the night of the troupe's show (RBN-QA-124; Agnes
 * 6347127013, 6351678399, 6350945110; Local CL-222, CL-226; Cloud CC-127 §8, CC-128 §3). Suzu's evening says the house
 * is packed and that people from the ridge are sitting on the earthen floor; until now Ginnojō was its only spectator.
 * Seven townsfolk without lines: four on the benches facing the stage, and three newcomers from the ridge seated on the
 * floor (the 土間) in front of it. Their looks are the world's own (made from each one's id, as for any unnamed
 * person), they are never talked to, and they are there only while that scene runs (the condition head `scene.<id>`,
 * src/engine/70_script.js): placed with the theatre when the scene brings you in, gone at the next placing of people
 * after it ends, a load, Skip or a new map, so none can stay behind. Their places keep clear of the way down from the
 * stage to you (x 6–7) and of your place and your companion's. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const m = C.maps['yn.playhouse'];
  if (!m) return;
  const show = 'scene.yn.suzu_evening';
  // [id, x, y, rest]: on the benches (4,6)–(5,6), (10,6)–(11,6), (10,8)–(11,8); on the floor in front of the stage
  const AUDIENCE = [
    ['yn_aud_bench1', 4, 6, 'sit'], ['yn_aud_bench2', 5, 6, 'sit'], ['yn_aud_bench3', 11, 6, 'sit'], ['yn_aud_bench4', 11, 8, 'sit'],
    ['yn_aud_ridge1', 10, 5, 'sitlap'], ['yn_aud_ridge2', 11, 5, 'sitlap'], ['yn_aud_ridge3', 3, 5, 'sitlap'],
  ];
  for (const [id, x, y, rest] of AUDIENCE) {
    // (seated on a bench: on the bench's own tile, which nobody walks on; `block: false` tells the validator so)
    m.npcs.push(Object.assign({ id, x, y, dir: 'up', if: show }, rest === 'sit' ? { block: false } : {}));
    if (RB.mannerisms) RB.mannerisms.add(id, { class: 'town', tier: 'overlay', rest, every: [16, 30], idle: [['glance', 1]] });
  }
  C.playhouseAudience = AUDIENCE.map((a) => a[0]);
})(RB.content);
