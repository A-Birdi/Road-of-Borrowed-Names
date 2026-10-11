// The travel volume's pages painted in the art pass (expansion P16; AC-1; src/ui/43g_seq_paint.js … 43n_seq_post.js),
// in node. For every page in PAGES:
// - the registry: defined with its scene, its chapter key and a title whose Japanese has its readings; one to six
//   compositions; every shot draws, names its phases (each one-time action ≤ 1.6 s, SHOTS.md §0) and reports its
//   focal area and its safe areas (wide, narrow, a phone on its side);
// - the scripts: the sequence begins and ends in its scene, every !shot names a shot (and phase) of it, every
//   composition is used, and nothing inside moves the world (no warp, encounter, battle or hook) or shakes it;
// - the volume: each page is in the travel volume under its chapter, numbered in the twelve-chapter story order (13:
//   after the story), and painted by its own sequence (no interim plate).
// Drawing itself is the browser's (tests/e2e/sequence_p16.mjs).
import { load } from '../lib/load.mjs';

export const PAGES = [
  ['mb1.named', 'mb.bridge_named', 'mb1'], ['mb1.dusk', 'mb.chapter_end', 'mb1'],
  ['mb2.press', 'mp.sobe_printed', 'mb2'], ['mb2.fireworks', 'mp.fireworks', 'mb2'],
  ['kr.vigil', 'kr.vigil_begin', 'kr'], ['kr.dawn', 'kr.chapter_end', 'kr'],
  ['ko.garden', 'ko.gardener', 'ko'], ['ko.end', 'ko.end', 'ko'],
  ['cr.summit', 'cr.summit_first', 'cr'], ['cr.letter', 'cr.deliver', 'cr'], ['cr.relay', 'cr.end', 'cr'],
  ['yn.kettle', 'yn.kettle', 'yn'], ['yn.end', 'yn.end', 'yn'],
  // after the story: the old guardians' places, the Hall's ten tales, the settlement's first festival (pages of the volume
  // through their records' entries)
  ...['rw', 'sg', 'co', 'sb', 'lf', 'mb', 'cr', 'yn', 'ko'].map((k) => ['gd.' + k, 'gd.' + k, 'post']),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ['hall.w' + n, 'hall.w' + n + '.end', 'post']),
  ['as.festival', 'as.festival', 'post'],
];

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const SQ = RB.sequence, C = RB.content, V = RB.volume;
  for (const [id, scene, key] of PAGES) {
    const d = SQ.get(id);
    t.ok(!!d, id + ' is defined');
    if (!d) continue;
    const shots = Object.values(d.shots);
    t.ok(shots.length >= 1 && shots.length <= 6, id + ': ' + shots.length + ' compositions');
    t.ok(d.scene === scene && d.chapter === key && d.title && /\{.+\|.+\}/.test(d.title.jp), id + ': its scene, its chapter (' + key + ') and a title with readings');
    t.ok(shots.every((s) => typeof s.draw === 'function' && s.phases.length && s.phases.every((ph) => ph.id && ph.ms > 0 && ph.ms <= 1600)), id + ': every shot draws and names its phases (each one-time action ≤ 1.6 s)');
    t.ok(shots.every((s) => typeof s.focus === 'function' && s.safe && s.safe.wide && s.safe.narrow && s.safe.land), id + ': every shot reports its focal area and its safe areas');
    // the script
    const sc = C.scenes[scene];
    t.ok(!!sc, scene + ' exists');
    if (!sc) continue;
    const cmds = sc.cmds;
    const b = cmds.findIndex((c) => c.op === 'sequence' && c.args[0] === id && (c.args[1] || 'begin') === 'begin');
    const e = cmds.findIndex((c) => c.op === 'sequence' && c.args[0] === id && c.args[1] === 'end');
    t.ok(b >= 0 && e > b, scene + ': ' + id + ' begins and ends in the scene');
    const ins = cmds.slice(b + 1, e), used = new Set();
    const bad = [];
    for (const c of ins) {
      if (c.op === 'shot') {
        const sd = d.shots[c.args[0]];
        if (!sd) bad.push('no shot ' + c.args[0]);
        else if (c.args[1] && !sd.phases.some((ph) => ph.id === c.args[1])) bad.push('no phase ' + c.args.join(' '));
        used.add(c.args[0]);
      }
      if (['warp', 'encounter', 'battle', 'hook', 'shake'].includes(c.op)) bad.push('moves the world: !' + c.op);
    }
    t.eq(bad, [], id + ': every !shot is one of its shots and phases, and nothing inside moves the world');
    t.eq(Object.keys(d.shots).filter((k) => !used.has(k)), [], id + ': every composition is used');
    t.ok(ins.some((c) => c.op === 'say'), id + ': the scene\'s lines are shown over it');
    // the volume
    const pg = V.page(id), no = key === 'post' ? 13 : RB.edition.ORDER.indexOf(key) + 1;
    t.ok(pg && pg.key === key && pg.no === no && pg.seq === id, id + ': in the volume under ' + V.heading(no).en + ', painted by its sequence');
  }
};
