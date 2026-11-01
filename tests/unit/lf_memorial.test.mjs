// Lanternfall's memorial stone after the bell (Agnes 6549722354; Local CL-574; Cloud CC-415): once the bell was rung,
// one visit said the face where the names should be was smooth, with only Tōya's left, then at once that all twelve were
// back; and Nao's "…Seventeen, huh." was said before the bell too, when only the restored list gives Tōya's age. Guards
// only: the smooth face before the bell, Nao's lowered head and line after it. On the real runner, the screen stood in
// for (lines with their voice keys, and gestures, recorded):
//  1. the scene: the smooth line under !lf_bell_rung, the restored one under lf_bell_rung as before, Nao's gesture and
//     line under comp=nao&lf_bell_rung; every line's text and key and every other command as before (fingerprints
//     taken before the change);
//  2. before the bell, with each companion: the heading and the smooth face; no restored names; no line of Nao's;
//     the others' answers as before;
//  3. after the bell, with each companion: the heading and the twelve names, never the smooth face; with Nao, the
//     lowered head and "…Seventeen, huh."; the others' answers as before; the kneel lands on the restored line;
//  4. after the bell, the first visit and a repeat: the same lines; no quest, flag or variable changed;
//  no scene ended on an error from the runner.
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const fp = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
  const keyOf = (scene, jp) => scene + '#' + crypto.createHash('sha256').update(String(jp)).digest('hex').slice(0, 10);
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };

  let log = [];
  RB.ui.dialogue.say = async (o) => { log.push(['say', o.who, o.en || '', o.jp ? keyOf(o.sceneId, o.jp) : null]); };
  RB.ui.dialogue.hide = () => {};
  RB.ui.fade = async () => {};
  for (const k of ['dismissExtras', 'refreshActors', 'placeCompanion', 'ensureSpeaker']) RB.world[k] = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  if (RB.staging) RB.staging.cue = (who, g) => { log.push(['gesture', who, g]); };
  const SC = C.scenes['lf.memorial'];
  const SMOOTH = /^The face where the names should be is smooth/, BACK = /^Now all the names are back/, AGE = '…Seventeen, huh.';
  const said = (l) => l.filter((x) => x[0] === 'say');
  const journey = (comp, bell) => {
    const s = S.newCampaign({ edition: 2 });
    s.map = 'lf.sluice'; s.x = 10; s.y = 11; s.comp = comp;
    for (const f of ['departed', 'ch1_done', 'ch2_done', 'ch3_done', 'ch4_done', 'lf_arrived', 'lf_town_intro'].concat(bell ? ['lf_bell_rung'] : [])) s.flags[f] = true;
    RB.game.G.s = s; RB.game.s = s;
    return s;
  };
  const visit = async (s) => { log = []; try { await RB.script.run('lf.memorial'); } catch (e) { errors.push(e.message); } return log.slice(); };
  const state = (s) => flat({ q: s.quests, v: s.vars, f: Object.keys(s.flags).filter((k) => !/^(seen|enter):/.test(k)).sort() });

  // 1. the scene
  {
    const smooth = SC.cmds.find((c) => c.op === 'say' && SMOOTH.test(c.en)), back = SC.cmds.find((c) => c.op === 'say' && BACK.test(c.en));
    const nao = SC.cmds.filter((c) => /comp=nao/.test(c.if || ''));
    t.ok(smooth && smooth.if === '!lf_bell_rung' && back && back.if === 'lf_bell_rung' && nao.length === 2 && nao.every((c) => c.if === 'comp=nao&lf_bell_rung') && nao[0].op === 'gesture' && nao[1].en === AGE,
      '1 the smooth face before the bell, the names after it, Nao\'s head and line after it ' + flat({ smooth: smooth && smooth.if, back: back && back.if, nao: nao.map((c) => [c.op, c.if]) }));
    const cmds = SC.cmds.map((c) => [c.op, c.who, c.jp, c.en, c.args, c.expr]);
    const others = SC.cmds.filter((c) => c !== smooth && !nao.includes(c)).map((c) => c.if || null);
    t.ok(fp(cmds) === CMDS_FP && fp(others) === IFS_FP, '1 every line\'s text and key, and every other condition, as before ' + flat({ cmds: fp(cmds), ifs: fp(others) }));
  }

  // 2. before the bell; 3. after the bell
  const runs = {};
  for (const bell of [false, true]) for (const comp of ['nao', 'mio', 'ren', 'suzu']) runs[(bell ? 'after:' : 'before:') + comp] = await visit(journey(comp, bell));
  const heading = (l) => said(l)[0] && /^A memorial stone/.test(said(l)[0][2]);
  const compSaid = (l) => said(l).filter((x) => x[1] !== 'narr').map((x) => [x[1], x[2], x[3]]);
  {
    const b = ['nao', 'mio', 'ren', 'suzu'].map((c) => runs['before:' + c]);
    t.ok(b.every((l) => heading(l) && said(l).some((x) => SMOOTH.test(x[2])) && !said(l).some((x) => BACK.test(x[2]) || x[2] === AGE)) && !compSaid(runs['before:nao']).length && !runs['before:nao'].some((x) => x[0] === 'gesture' && x[1] === 'comp'),
      '2 before the bell: the heading and the smooth face, no restored names; no line or gesture of Nao\'s ' + flat(b.map((l) => said(l).map((x) => x[2].slice(0, 24)))));
    t.ok(fp(['mio', 'ren', 'suzu'].map((c) => compSaid(runs['before:' + c]))) === BEFORE_OTHERS_FP, '2 Mio\'s, Ren\'s and Suzu\'s answers before the bell as before ' + flat(['mio', 'ren', 'suzu'].map((c) => compSaid(runs['before:' + c]))));
  }
  {
    const a = ['nao', 'mio', 'ren', 'suzu'].map((c) => runs['after:' + c]);
    const naoL = runs['after:nao'];
    const kneel = naoL.findIndex((x) => x[0] === 'gesture' && x[1] === 'pc' && x[2] === 'kneel');
    t.ok(a.every((l) => heading(l) && said(l).some((x) => BACK.test(x[2])) && !said(l).some((x) => SMOOTH.test(x[2]))) && naoL[kneel + 1] && naoL[kneel + 1][0] === 'say' && BACK.test(naoL[kneel + 1][2]),
      '3 after the bell: the heading and the twelve names, never the smooth face; the kneel lands on the restored line ' + flat(a.map((l) => said(l).map((x) => x[2].slice(0, 24)))));
    t.ok(flat(compSaid(naoL).map((x) => x[1])) === flat([AGE]) && compSaid(naoL)[0][2] === NAO_KEY && naoL.some((x) => x[0] === 'gesture' && x[1] === 'comp' && x[2] === 'lowered'),
      '3 with Nao after the bell: the lowered head and "…Seventeen, huh." under its key ' + flat(compSaid(naoL)));
    t.ok(fp(['mio', 'ren', 'suzu'].map((c) => compSaid(runs['after:' + c]))) === BEFORE_OTHERS_FP, '3 Mio\'s, Ren\'s and Suzu\'s answers after the bell, the same as before it ' + flat(['mio', 'ren', 'suzu'].map((c) => compSaid(runs['after:' + c]).length)));
  }

  // 4. the first visit after the bell and a repeat
  {
    const s = journey('nao', true);
    const before = state(s);
    const one = await visit(s), two = await visit(s);
    t.ok(flat(one) === flat(two) && state(s) === before, '4 the first visit after the bell and a repeat: the same lines and gestures; nothing changed ' + flat({ same: flat(one) === flat(two), state: state(s) === before }));
  }

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
// before this change (computed on its parent): every command's text, key and arguments; every other command's
// condition; Mio's, Ren's and Suzu's answers; Nao's line's key
const CMDS_FP = 'd76cabba7124dc7f', IFS_FP = '456bfa1a650b9440', BEFORE_OTHERS_FP = 'fe3af126976f9964', NAO_KEY = 'lf.memorial#6f76a6b63d';
