// Lanternfall's ending, Umi with Nao after the letter (Agnes 6555618743, 6555704812; Local CL-604; Cloud CC-440): on
// the completed route she wrote one line back when the letter was delivered (lf.nao_deliver, "I read it."), but the
// ending had her say "I haven't written back." Now she says what she wrote, and that whether she forgives him is still
// undecided. On the real runner, the screen stood in for, every line said with its speaker and voice key:
//  1. Nao along, the letter delivered, with and without the first meeting (lf.nao_umi_first): the new line
//     (sa.epi_lf#acc22579bc), then the same next exchange ("You said I didn't have to decide." and Nao's answer);
//  2. Nao along, the quest started but not done (stages 1 and 2): "…Oh, the courier." and Nao's answer, as before;
//  3. Nao along, the quest not started: Nao's "one letter I haven't delivered", as before;
//  4. Mio, Ren or Suzu along, the quest done or not: no Umi line, and their own lines as before;
//  5. a save's round trip before the ending, then the ending: the same as 1;
//  6. the scene otherwise as before: its 29 spoken lines' keys in order, the one replaced (the old #774096ea3d no
//     longer said), and every other command and line (condition, speaker, English, staging) by a fingerprint of the
//     scene before this change;
//  7. the new line's words all known to the game, and the line valid;
//  and no scene ended on an error from the runner (its own error log watched).
import crypto from 'node:crypto';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const flat = (x) => JSON.stringify(x);
  const keyOf = (jp) => 'sa.epi_lf#' + crypto.createHash('sha256').update(String(jp)).digest('hex').slice(0, 10);
  const NEW = 'sa.epi_lf#acc22579bc', OLD = 'sa.epi_lf#774096ea3d', NEXT = 'sa.epi_lf#7e437a2f8e';
  const NEW_EN = '…"I read it." That\'s all I wrote. I still haven\'t decided whether I forgive him.';
  const errors = [];
  const cerr = console.error;
  console.error = (...a) => { if (a[0] === 'scene error') errors.push(a[1] + ': ' + String((a[2] && a[2].message) || a[2])); else cerr(...a); };

  // the runner, with the screen stood in for
  let log = [];
  RB.ui.dialogue.say = async (o) => { log.push({ who: o && o.who, en: o && o.en, key: o && o.jp ? keyOf(o.jp) : null }); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.fade = async () => {};
  for (const k of ['dismissExtras', 'refreshActors', 'placeCompanion']) RB.world[k] = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  RB.test.enable({});
  if (!RB.game.G.settings) RB.game.G.settings = {};

  // the end of the journey, in Lanternfall: a companion, Nao's letter at a stage (null: not started, 'done')
  const camp = (o = {}) => {
    const s = S.newCampaign({ edition: 2 }); s.comp = o.comp || 'nao'; s.map = 'lf.town'; s.x = 10; s.y = 10;
    Object.assign(s.flags, { departed: true, ch1_done: true, ch2_done: true, ch3_done: true, ch4_done: true, ch5_done: true, lf_bell_rung: true, sa_met_kasane: true });
    if (o.quest != null) S.setQuest(s, 'lf_nao', o.quest);
    if (o.quest === 'done') s.flags.lf_nao_done = true;
    if (o.met) s.seen['lf.nao_umi_first'] = true;
    RB.game.G.s = s; RB.game.s = s;
    return s;
  };
  const run = async () => { log = []; try { await RB.script.run('sa.epi_lf', {}); } catch (e) { errors.push('sa.epi_lf: ' + String((e && e.message) || e)); } return log.slice(); };
  const umi = (l) => l.filter((x) => x.who === 'umi');
  const after = (l, key, n) => { const i = l.findIndex((x) => x.key === key); return i < 0 ? [] : l.slice(i + 1, i + 1 + n); };
  const NAO_ANSWER = /^I did\. I still think so\. The letter arrived\. That's where a courier's job ends\.$/;

  // 1. the letter delivered, with and without the first meeting
  for (const met of [true, false]) {
    camp({ quest: 'done', met });
    const l = await run();
    const u = umi(l), next = after(l, NEW, 2);
    t.ok(u.length === 2 && u[0].key === NEW && u[0].en === NEW_EN && u[1].key === NEXT && next.length === 2 && next[0].key === NEXT && next[1].who === 'nao' && NAO_ANSWER.test(next[1].en || '') && !l.some((x) => x.key === OLD),
      '1 Nao along, the letter delivered, ' + (met ? 'with' : 'without') + ' the first meeting: the new line, then the same next exchange ' + flat({ umi: u, next }));
  }

  // 2. started, not done
  for (const stage of [1, 2]) {
    camp({ quest: stage });
    const l = await run();
    const u = umi(l), nao = l.filter((x) => x.who === 'nao');
    t.ok(u.length === 1 && u[0].key === 'sa.epi_lf#f0a0869abe' && nao.some((x) => /^…I'll come soon\. Whether you take it is up to you\.$/.test(x.en || '')) && !l.some((x) => x.key === NEW || x.key === OLD),
      '2 Nao along, the quest at stage ' + stage + ': "…Oh, the courier." and Nao\'s answer, as before ' + flat({ umi: u }));
  }

  // 3. not started
  {
    camp({ quest: null });
    const l = await run();
    t.ok(!umi(l).length && l.some((x) => x.who === 'nao' && /^…There's still one letter I haven't delivered in this town\. Soon\.$/.test(x.en || '')),
      '3 Nao along, the quest not started: no Umi line, Nao\'s "one letter I haven\'t delivered", as before ' + flat(umi(l)));
  }

  // 4. other companions
  const OWN = { mio: /^…Did you hear that\? I said no\. Properly, and politely\.$/, ren: /^Every lantern in Lanternfall has its name back\./, suzu: /^The squabbling in the square/ };
  for (const comp of ['mio', 'ren', 'suzu']) for (const quest of ['done', null]) {
    camp({ comp, quest });
    const l = await run();
    t.ok(!umi(l).length && l.some((x) => x.who === comp && OWN[comp].test(x.en || '')),
      '4 ' + comp + ' along, the quest ' + (quest || 'not started') + ': no Umi line, and ' + comp + '\'s own line as before ' + flat(umi(l)));
  }

  // 5. a save's round trip
  {
    const s = camp({ quest: 'done', met: true });
    const back = JSON.parse(JSON.stringify(s)); RB.game.G.s = back; RB.game.s = back;
    const l = await run();
    const u = umi(l);
    t.ok(u.length === 2 && u[0].key === NEW && u[1].key === NEXT, '5 after a save\'s round trip: the same as 1 ' + flat(u));
  }

  // 6. the scene otherwise as before
  {
    const sc = C.scenes['sa.epi_lf'];
    const rows = sc.cmds.map((c) => (c.op === 'say' ? ['say', c.if || null, c.who || null, c.expr || null, keyOf(c.jp), c.en] : [c.op, c.if || null, c.args || []]));
    const keys = rows.filter((r) => r[0] === 'say').map((r) => r[4].slice(10));
    const WANT = ['097fd0ba5e', '81e747aabc', '7d5f02109f', '51c0d28dc5', '35563fa37a', '9ae3bf1dcb', '708575c58d', 'c457a7f27f', 'f57ca982d6', '206d825ea2', 'c6f255da9d', '72c3ca87d7', '5c6d237f72', 'c0601059c7', '7c555ab5e5', '23d01f6317', 'fb9257f56f', '818bb2ce99', 'acc22579bc', '7e437a2f8e', '4572e2e9ac', 'f0a0869abe', '3c87772141', '054d206803', 'eb00938653', '2d463fdc13', 'f2c3f9665b', '07de4702ce', '7574d88904'];
    t.ok(flat(keys) === flat(WANT), '6 the 29 spoken lines\' keys in order, the one replaced (#774096ea3d to #acc22579bc) ' + flat(keys));
    const rest = rows.filter((r) => !(r[0] === 'say' && r[2] === 'umi' && r[1] === 'comp=nao&quest.lf_nao=done' && r[4] !== 'sa.epi_lf#7e437a2f8e'));
    const fp = crypto.createHash('sha256').update(JSON.stringify(rest)).digest('hex').slice(0, 16);
    t.ok(sc.cmds.length === 48 && rest.length === 47 && fp === '44c34c3db9c453da', '6 every other command and line as before (48 commands; the other 47 by the fingerprint of the scene before this change) ' + flat({ cmds: sc.cmds.length, fp }));
  }

  // 7. the new line's words and validity
  {
    const c = C.scenes['sa.epi_lf'].cmds.find((x) => x.op === 'say' && keyOf(x.jp) === NEW);
    const toks = c ? RB.jp.parse(c.jp).filter((tk) => !tk.punct) : [];
    const unknown = toks.filter((tk) => RB.jp.lookup(tk).unknown).map((tk) => tk.surface);
    const problems = c ? RB.jp.validate(c.jp) : ['missing'];
    t.ok(c && c.who === 'umi' && c.if === 'comp=nao&quest.lf_nao=done' && toks.length === 14 && !unknown.length && !problems.length && /「 \{読\|よ\}みました 」/.test(c.jp),
      '7 the new line: Umi\'s, on the completed route, its 14 words all known to the game, and valid ' + flat({ n: toks.length, unknown, problems }));
  }

  t.ok(!errors.length, 'no scene ended on an error from the runner ' + errors.slice(0, 3).join(' | '));
  console.error = cerr;
};
