/* Practice suite A in the world (Practice addendum §15.1, §16.1):
 *  - the Lantern Hall (rw.hall): a low rack of small practice lamps in the
 *    top-right corner (9,2), once Chapter 1 has ended (ch1_done). The corner
 *    is a dead end beside the shelf (9,3): it closes no path and stands clear
 *    of the travelling lantern's shrine (4,2), Tsuru (5,4) and the desk (7,7).
 *    The player faces it from (8,2). It is not a story lantern and touches no
 *    story flag.
 *  - The Gull (sg.inn): the small table at (9,7), beside its chair (10,7),
 *    which had no interaction of its own, becomes the writing desk. Faced from
 *    (9,6), (8,7) or (9,8).
 * Also registers the desk's load-time normaliser (pages read from storage are
 * saved; unknown page records are kept). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  // ---- the practice lamps' rack ---------------------------------------------------------------
  if (RB.props && RB.props.P && !RB.props.P.pa_lamprack) {
    RB.props.P.pa_lamprack = {
      id: 'pa_lamprack', w: 1, h: 1, block: true, light: 22,
      draw(c, x, y) {
        // simple fallback (the art below replaces it at art resolution)
        c.fillStyle = '#5a3e2a'; c.fillRect(x + 1, y + 2, 14, 12);
        c.fillStyle = '#f2d08a'; for (const dx of [3, 7, 11]) c.fillRect(x + dx, y + 3, 3, 4);
      },
    };
    const pa = RB.propArt, K = RB.propKit;
    if (pa && K && pa.kit) {
      const { R, mix, ramp } = K;
      const kit = pa.kit;
      pa.art('pa_lamprack', {
        box: [-2, -14, 36, 48], ink: true,
        f: (t, o) => kit.flick(t, o, 230),
        draw(g, M, v, f) {
          const w5 = M.wood, frame = ramp(mix(w5[1], '#2a2226', 0.45), 0.45, 0.3);
          // a low two-shelf rack
          kit.post(g, 1, -2, 3, 31, w5); kit.post(g, 28, -2, 3, 31, w5);
          kit.plank(g, 0, 10, 32, 3, w5, 7);
          kit.plank(g, 0, 24, 32, 3, w5, 9);
          // three small lamps with paper shades on top, softly lit
          [[3, 0], [12, 1], [21, 2]].forEach(([x, k]) => {
            R(g, x + 1, -10, 7, 1, frame[3]); R(g, x + 3, -12, 3, 2, frame[1]);
            kit.lamp(g, x + 1, -9, 7, 10, [0, 1, 0, 2][(f + k) % 4]);
            R(g, x + 1, -9, 1, 10, frame[1]); R(g, x + 7, -9, 1, 10, frame[1]);
            R(g, x, 1, 9, 2, frame[2]); R(g, x, 1, 9, 1, frame[3]);
          });
          // spare shades waiting on the lower shelf (paper, unlit)
          const PP = K.FIX.paper;
          [[5, 0], [15, 1]].forEach(([x]) => { R(g, x, 15, 8, 9, PP[2]); R(g, x + 1, 16, 6, 7, PP[3]); R(g, x, 15, 8, 1, PP[4]); R(g, x, 23, 8, 1, PP[1]); });
        },
        over(g) { K.halo(g, 16, -4, 15, '#ffd27a', 0.12); },
        shadow: () => [16, 30, 15, 3, 0.3],
      });
    }
  }
  const hall = C.maps['rw.hall'];
  if (hall && !(hall.props || []).some((p) => p.p === 'pa_lamprack')) {
    hall.props = (hall.props || []).concat([{ p: 'pa_lamprack', x: 9, y: 2, if: 'ch1_done', scene: 'pa.lamps' }]);
  }

  // ---- the writing desk at the Gull ---------------------------------------------------------------
  for (const pl of RB.practiceDesk.PLACES) {
    const m = C.maps[pl.map];
    const t = m && (m.props || []).find((p) => p.p === pl.prop && p.x === pl.x && p.y === pl.y);
    if (t && !t.scene && !t.text) t.scene = 'pa.desk';
  }

  if (RB.save && RB.save.addMigration) RB.save.addMigration(RB.practiceDesk.migrate);
})(RB.content);
