// QA-207: Ren's Company biography no longer says the face is forgotten once it is taken back (Agnes 6942984231; Local
// CL-887, CL-888; Cloud CC-640). The one change: the bullet "Remembers every word Master Ushio taught, but not the
// teacher's face." gains `when: '!sa_ren_took'` (src/content/company/10_core.js), its words unchanged. Without a browser,
// on the real Companion page (RB.ui.company.pages.companion.render, the live bio() filter), drawn into a stand-in leaf:
//  1. before the Archive shelf (Ren with you): the bullet is shown, and neither outcome bullet;
//  2. taken back ("Take it back" or "You decide", sa_ren_took + sa_ren_decided, the quest done), the scene finished
//     (seen): the bullet is gone, "Took back the teacher's face" is shown;
//  3. the same flags mid-scene, after the shelf scene has set them and before it ends (not seen): gone, as 2;
//  4. left on the shelf (sa_ren_left + sa_ren_decided, the quest done): the bullet is shown, with "Left the teacher's
//     face on the Archive shelf";
//  5. carried home without Ren (sa_ren_decided + sa_ren_carried): with the companion you travel with, Ren's page is not
//     drawn at all; synthetic and unreachable in play (companions do not change once you set out), Ren with those
//     flags: the bullet is shown (the face was not taken back);
//  6. the states of 1-5 through a save's JSON and the game's own load migration (RB.save.migrate), as the equivalent of
//     a save and load (the real save and load are in tests/e2e/ren_face_bio.mjs): the same bullets;
//  7. every companion's biography, with this one `when` set aside, exactly the parent's (315b770): the bullet's words,
//     its place, every other bullet, its condition and the first words, for all four;
//  8. the condition is the game's own term: '!sa_ren_took' read by RB.state.test, true with no flag, false with it.
// The journeys here are made directly (synthetic flags), not played; the scene's own order is checked in the browser.
import { createHash } from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const S = RB.state, CO = RB.ui.company, BIOS = RB.content.company.bios;
  const fp = (x) => createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
  const FACE = 'Remembers every word Master Ushio taught, but not the teacher\'s face.';
  const TOOK = /^Took back the teacher's face at the Archive/;
  const LEFT = /^Left the teacher's face on the Archive shelf/;
  const plain = (h) => String(h).replace(/<rt>[^<]*<\/rt>/g, '').replace(/<[^>]+>/g, ' ').replace(/&#39;|&#x27;/g, '\'').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  const fresh = (comp, flags, o = {}) => {
    const s = S.newCampaign({ edition: 2 });
    s.id = 'ren-face-test';
    s.comp = comp;
    s.flags.departed = true;
    s.flags['comp_' + comp] = true;
    for (const k of flags || []) s.flags[k] = true;
    if (o.done) s.quests.ren_ushio = { stage: 1, done: true, t: 1 };
    else if (o.found) s.quests.ren_ushio = { stage: 1, done: false, t: 1 };
    if (o.seen) s.seen['sa.shelf_ren'] = true;
    return s;
  };
  // the Companion page, drawn as the folio draws it (one column), into a leaf that needs no DOM
  const leaf = () => ({ innerHTML: '', onclick: null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, removeEventListener() {} });
  const page = (s) => {
    RB.game.s = s;
    const A = leaf(), B = leaf();
    CO.pages.companion.render(A, B, false, { s, view: {}, render() {}, remember() {} });
    const m = /<ul class="co-know">([\s\S]*?)<\/ul>/.exec(A.innerHTML);
    const items = m ? [...m[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((x) => plain(x[1])) : [];
    const head = /What you know of ([^<]+)</.exec(A.innerHTML);
    return { items, of: head ? head[1].trim() : null };
  };
  const look = (s) => { const p = page(s); return { of: p.of, face: p.items.includes(FACE), took: p.items.some((x) => TOOK.test(x)), left: p.items.some((x) => LEFT.test(x)), n: p.items.length }; };
  const roundTrip = (s) => { const c = JSON.parse(JSON.stringify(s)); return RB.save.migrate(c) || c; };

  const CASES = [
    { n: '1 before the shelf', s: () => fresh('ren', ['sa_ushio_found'], { found: true }), want: { face: true, took: false, left: false } },
    { n: '2 taken back, the scene finished', s: () => fresh('ren', ['sa_ushio_found', 'sa_ren_took', 'sa_ren_decided'], { done: true, seen: true }), want: { face: false, took: true, left: false } },
    { n: '3 taken back, mid-scene (flags set, not seen)', s: () => fresh('ren', ['sa_ushio_found', 'sa_ren_took', 'sa_ren_decided'], { done: true }), want: { face: false, took: true, left: false } },
    { n: '4 left on the shelf', s: () => fresh('ren', ['sa_ushio_found', 'sa_ren_left', 'sa_ren_decided'], { done: true, seen: true }), want: { face: true, took: false, left: true } },
    { n: '5 synthetic: Ren with carried-without-Ren flags', s: () => fresh('ren', ['sa_ren_decided', 'sa_ren_carried'], { seen: true }), want: { face: true, took: false, left: false } },
  ];
  // 1-5
  for (const c of CASES) {
    const got = look(c.s());
    t.ok(got.of === 'Ren' && got.face === c.want.face && got.took === c.want.took && got.left === c.want.left, c.n + ': the teacher-face bullet ' + (c.want.face ? 'shown' : 'gone') + ' ' + JSON.stringify(got));
  }
  // 5: the reachable state, carried home by the companion you travel with: Ren's page is not drawn
  for (const comp of ['nao', 'mio', 'suzu']) {
    const got = look(fresh(comp, ['sa_ren_decided', 'sa_ren_carried'], { seen: true }));
    t.ok(got.of !== 'Ren' && !got.face && !got.took && !got.left && got.n > 0, '5 carried home with ' + comp + ': their own page, nothing of Ren\'s ' + JSON.stringify(got));
  }
  // 6: a save's JSON and the game's own load migration
  for (const c of CASES) {
    const a = c.s(), b = roundTrip(c.s());
    t.ok(JSON.stringify(page(a).items) === JSON.stringify(page(b).items) && look(b).face === c.want.face, '6 ' + c.n + ': the same bullets after a save\'s JSON and the load migration');
  }
  // 7: every biography, with this one `when` set aside, is the parent's
  const without = JSON.parse(JSON.stringify(BIOS));
  const face = without.ren.summary.find((x) => x.en === FACE);
  const at = without.ren.summary.indexOf(face);
  const cond = face ? face.when : undefined;
  if (face) delete face.when;
  const PARENT_FP = 'df9e46bd7d7b9287';
  t.ok(at === 1 && cond === '!sa_ren_took' && Object.keys(face).join() === 'en', '7 the bullet keeps its words and place (second) and gains only `when: \'!sa_ren_took\'` ' + JSON.stringify({ at, cond, keys: face && Object.keys(face) }));
  t.ok(fp(without) === PARENT_FP, '7 every companion\'s biography otherwise as on 315b770 ' + JSON.stringify({ fp: fp(without) }));
  // 8: the game's own term
  t.ok(S.test(fresh('ren', []), '!sa_ren_took') === true && S.test(fresh('ren', ['sa_ren_took']), '!sa_ren_took') === false, '8 \'!sa_ren_took\' is read by RB.state.test');
};
