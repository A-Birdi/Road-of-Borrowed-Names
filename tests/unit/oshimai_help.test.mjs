// おしまい in word help (Agnes 6547670899, 6547816998, 6548029795; Local CL-562, CL-563, CL-565; Cloud CC-404,
// CC-405, CC-406). おしまい is not in the standard lexicon, so word help split it as お + 姉妹 and said "sisters", and a
// card noted from it kept that meaning under the id w:姉妹|おしまい. Now a small lookup-only table gives the whole
// token its own entry (kept out of RB.lex), and a load-time migration repairs the card the bug wrote. Checked:
//  1. the lookup: おしまい as one word, "the end; that's all", romaji oshimai, no parts; on each of the seven standard
//     tokens in content (the census: no other form, and no other place); not for 姉妹, bare しまい, an author hint or
//     a gloss; Kansai lines still use the dialect lexicon; RB.lex and the practice index unchanged;
//  2. noting it now gives the card w:おしまい|おしまい;
//  3. bookmark practice on a real line asks what おしまい means, "the end; that's all" right, wrong meanings from
//     other nouns; usesOf finds the おしまい sentence for the active card, never the 姉妹 one;
//  4. the repair, through the save's own migration: the bugged card alone gets the new id and meaning, every other
//     field kept; with a word card for おしまい already there (a standard or a Kansai one, either order), the survivor
//     is unchanged and the bugged card is retired in place (kind 'word-retired' and the retired note added, nothing
//     else changed; restoring it gives the original); one active card; a card with a retired field already, a
//     card with another meaning, genuine w:姉妹|しまい and any other occupant of the id: unchanged;
//  5. idempotent: a second migration, and a save written as JSON and loaded, change nothing;
//  6. what reads the notebook: New Game+ carries the active card only (the old journey keeps the retired one); the
//     writing desk offers neither; the kanji met set is unchanged; the word game's notebook evidence follows the active
//     card, and its other evidence is kept.
import { load } from '../lib/load.mjs';
import { fixtureDef } from '../e2e/wordplay_fixture.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content;
  const flat = (x) => JSON.stringify(x);
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const END = "the end; that's all";
  const tokensOf = (jp) => RB.jp.parse(jp).filter((x) => x.surface === 'おしまい');
  const ONLY = RB.jp.LOOKUP_ONLY || {};
  const repair = RB.ui.help.repairNotebook || (() => ({}));

  // ---- 1: the lookup ----------------------------------------------------------------------------------
  const one = (r) => r && r.lemma === 'おしまい' && r.meaning === END && r.romaji === 'oshimai' && r.reading === 'おしまい' && !r.parts && !r.unknown && r.entry && r.entry.pos === 'n';
  const bare = RB.jp.lookup('おしまい');
  t.ok(one(bare) && bare.entry === ONLY['おしまい'] && flat(Object.keys(ONLY)) === flat(['おしまい']),
    '1 おしまい is one word: "the end; that\'s all", oshimai, no parts, from the one-entry lookup-only table ' + flat({ lemma: bare.lemma, meaning: bare.meaning, romaji: bare.romaji, parts: bare.parts }));

  // the census: every Japanese text in content with おしまい (the scene sources' raw text aside)
  const found = [];
  const walk = (o, p, seen) => {
    if (o == null || typeof o !== 'object' || seen.has(o)) return;
    seen.add(o);
    for (const k of Object.keys(o)) {
      if (p === 'C' && k === 'sceneSrc') continue;
      const v = o[k];
      if (typeof v === 'string') { if (v.includes('おしまい')) found.push({ path: p + '.' + k, jp: v }); } else walk(v, p + '.' + k, seen);
    }
  };
  walk(C, 'C', new Set());
  const PLACES = [
    'C.scenes.lq.fare_chigusa.cmds.68.jp',
    'C.company.mem.lq1.reply.suzu.jp',
    'C.company.thoughts.28.text.jp',
    'C.encounters.hall.w10.tale.procedure.steps.3.actions.1.label.jp',
    'C.encounters.kr.hyakuwa.social.actions.2.label.jp',
    'C.encounters.kr.hyakuwa.social.actions.2.task.F.options.0.jp',
    'C.encounters.kr.hyakuwa.social.actions.2.task.E.options.0.jp',
  ];
  const toks = found.flatMap((f) => RB.jp.parse(f.jp).filter((x) => /おしまい/.test(x.surface)).map((x) => ({ path: f.path, surface: x.surface, r: RB.jp.lookup(x) })));
  t.ok(flat(found.map((f) => f.path).sort()) === flat(PLACES.slice().sort()) && toks.length === 7 && toks.every((x) => x.surface === 'おしまい' && one(x.r)),
    '1 the census: seven standard tokens in seven texts (five files), each the whole token おしまい, each one word with no parts ' + flat(toks.map((x) => [x.path.split('.').slice(1, 3).join('.'), x.surface, x.r.lemma, !!x.r.parts])));

  const sisters = RB.jp.lookup('{姉妹|しまい}'), shimai = RB.jp.lookup('しまい');
  const hinted = RB.jp.lookup('おしまい@しまう'), glossed = RB.jp.lookup('おしまい=(the last of it)');
  t.ok(sisters.lemma === '姉妹' && sisters.meaning === 'sisters' && shimai.lemma === '姉妹' && shimai.meaning === 'sisters' && hinted.lemma === 'しまう' && glossed.lemma === '姉妹' && glossed.meaning === 'the last of it',
    '1 not for 姉妹, bare しまい, an author hint or a gloss: each as before (an @ hint and a =() gloss are the author\'s) ' + flat([sisters.lemma, shimai.lemma, hinted.lemma, glossed.lemma, glossed.meaning]));

  const kLine = RB.jp.parse('お{客|きゃく}さん 、 アンコール ？ {残念|ざんねん} 、 {今日|きょう} の {公演|こうえん} は もう おしまい や 。');
  const kAt = kLine.findIndex((x) => x.surface === 'おしまい');
  const kansai = RB.dialect.lookupIn(kLine, kAt);
  t.ok(kansai && kansai.dia && kansai.entry && kansai.entry.casual === true && kansai.entry.m === END,
    '1 a Kansai line still uses the dialect lexicon (casual speech) ' + flat(kansai && { dia: kansai.dia, casual: kansai.entry && kansai.entry.casual }));

  t.ok(!RB.lex.bySurface('おしまい').length && !RB.lex.byReading('おしまい').length && !RB.tasks.kanaWordIndex().some((x) => x.w === 'おしまい' || x.r === 'おしまい') && !!RB.lex.get('姉妹', 'しまい'),
    '1 RB.lex and the practice index have no おしまい (the vocabulary and its pools do not move); 姉妹 is still there');

  // ---- 2: noting it ------------------------------------------------------------------------------------
  // (as word help's "Add to notebook" keys a card: src/ui/10_ui.js)
  const keyOf = (tok) => { const info = RB.jp.lookup(tok); return 'w:' + (info.lemma || tok.surface) + '|' + (info.reading || ''); };
  const realLine = C.company.mem.lq1.reply.suzu.jp;
  t.ok(keyOf(tokensOf(realLine)[0]) === 'w:おしまい|おしまい', '2 noting it from a real line gives the card w:おしまい|おしまい ' + keyOf(tokensOf(realLine)[0]));

  // ---- 3: bookmarks --------------------------------------------------------------------------------------
  const sisLine = Object.values(C.scenes).flatMap((sc) => (sc.cmds || []).filter((c) => c.jp && c.jp.includes('{姉妹|しまい}')).map((c) => c.jp))[0];
  const s3 = RB.state.newCampaign();
  const bO = RB.bookmarks.keep(s3, { who: 'suzu', jp: realLine, en: 'x' }).b;
  const bS = RB.bookmarks.keep(s3, { who: 'narr', jp: sisLine, en: 'y' }).b;
  const steps = RB.bookmarks.practiceSteps(bO, 20);
  const st = steps.find((x) => x.ctx.jp === 'おしまい');
  const wrong = st ? st.options.filter((o) => !o.ok) : [];
  const nounMs = new Set(RB.tasks.kanaWordIndex().filter((x) => x.pos === 'n').map((x) => x.m));
  t.ok(!!st && st.options.filter((o) => o.ok).length === 1 && st.options.find((o) => o.ok).en === END && wrong.length === 3 && wrong.every((o) => nounMs.has(o.en) && o.en !== 'sisters') &&
    !steps.some((x) => /姉妹/.test(x.ctx.jp) || x.options.some((o) => o.ok && o.en === 'sisters')),
    '3 bookmark practice on a real line asks what おしまい means, "the end; that\'s all" right, three other nouns\' meanings wrong, and never 姉妹 ' + flat(st && st.options.map((o) => o.en)));
  const usesNew = RB.bookmarks.usesOf(s3, { kind: 'word', id: 'w:おしまい|おしまい', surface: 'おしまい', reading: 'おしまい' });
  const usesSis = RB.bookmarks.usesOf(s3, { kind: 'word', id: 'w:姉妹|しまい', surface: '姉妹', reading: 'しまい' });
  t.ok(!!sisLine && flat(usesNew.map((b) => b.id)) === flat([bO.id]) && flat(usesSis.map((b) => b.id)) === flat([bS.id]),
    '3 usesOf: the active おしまい card finds the おしまい sentence, not the 姉妹 one; genuine 姉妹 finds its own ' + flat({ new: usesNew.length, sis: usesSis.length }));

  // ---- 4–5: the repair ------------------------------------------------------------------------------------
  const BUG = () => ({ kind: 'word', id: 'w:姉妹|おしまい', surface: 'おしまい', reading: 'おしまい', m: 'sisters', t: 1700000000000, extra: { mine: [1, 2] } });
  const STD = () => ({ kind: 'word', id: 'w:おしまい|おしまい', surface: 'おしまい', reading: 'おしまい', m: 'the very end (my words)', t: 1700000000500 });
  const KAN = () => ({ kind: 'word', id: 'w:おしまい|おしまい', surface: 'おしまい', reading: 'おしまい', m: END, t: 1700000000600, dia: 'kansai' });
  const SIS = () => ({ kind: 'word', id: 'w:姉妹|しまい', surface: '姉妹', reading: 'しまい', m: 'sisters', t: 1700000000700 });
  const LORE = () => ({ kind: 'lore', id: 'kr_note_bell', t: 1700000000800 });
  const RETIRED = { was: 'word', by: 'w:おしまい|おしまい', why: 'おしまい was read as 姉妹 (RBN word help)' };
  // a save as the game loads one: the campaign, its notebook, through RB.save.migrate (every registered migration)
  const campaign = (nb) => { const s = RB.state.newCampaign(); s.notebook = nb; return s; };
  const loadAgain = (s) => RB.save.migrate(clone(s));
  const active = (s) => s.notebook.filter((n) => n.kind === 'word' && n.surface === 'おしまい');

  {
    const s = loadAgain(campaign([SIS(), BUG(), LORE()]));
    const want = Object.assign(BUG(), { id: 'w:おしまい|おしまい', m: END });
    t.ok(flat(s.notebook) === flat([SIS(), want, LORE()]),
      '4 the bugged card alone: the new id and "the end; that\'s all", its surface, reading, time and unknown fields kept, in its place; the other cards unchanged ' + flat(s.notebook[1]));
    const again = loadAgain(s);
    t.ok(flat(again.notebook) === flat(s.notebook) && active(again).length === 1, '5 idempotent: a second load changes nothing');
  }
  for (const [name, SURV] of [['a standard card', STD], ['a Kansai card', KAN]]) {
    for (const order of ['survivor first', 'bugged first']) {
      const nb0 = order === 'survivor first' ? [SURV(), SIS(), BUG()] : [BUG(), SIS(), SURV()];
      const s = loadAgain(campaign(nb0));
      const surv = s.notebook.find((n) => n.id === 'w:おしまい|おしまい');
      const old = s.notebook.find((n) => n.id === 'w:姉妹|おしまい');
      const want = Object.assign(BUG(), { kind: 'word-retired', retired: RETIRED });
      const back = clone(old || {}); if (back.retired) { back.kind = back.retired.was; delete back.retired; }
      t.ok(s.notebook.length === 3 && flat(surv) === flat(SURV()) && flat(old) === flat(want) && flat(back) === flat(BUG()) &&
        flat(s.notebook.find((n) => n.id === 'w:姉妹|しまい')) === flat(SIS()) && s.notebook.indexOf(old) === nb0.findIndex((n) => n.id === 'w:姉妹|おしまい'),
        '4 collision with ' + name + ', ' + order + ': the survivor unchanged; the bugged card retired in place (kind word-retired and the retired note, every other field as it was; restoring kind and removing the note gives the original); 姉妹 untouched ' + flat(old));
      const shown = s.notebook.filter((n) => n.kind === 'word' && n.surface === 'おしまい');
      t.ok(shown.length === 1 && shown[0] === surv && !s.notebook.some((n) => n.kind === 'word' && n.m === 'sisters' && n.surface === 'おしまい'),
        '4 collision with ' + name + ', ' + order + ': one active おしまい card, and no active "sisters" card for おしまい');
      const js = loadAgain(JSON.parse(JSON.stringify(s)));
      t.ok(flat(js.notebook) === flat(s.notebook) && js.notebook.filter((n) => n.retired).length === 1,
        '5 collision with ' + name + ', ' + order + ': written as JSON and loaded again, nothing changes and no second retired note');
    }
  }
  {
    // left as they are: a retired field already there (null, scalar, object), with and without a survivor
    const out = [];
    for (const r of [null, 'kept', { mine: true }]) for (const surv of [null, STD]) {
      const b = Object.assign(BUG(), { retired: r });
      const nb = surv ? [b, surv()] : [b];
      const s = loadAgain(campaign(nb));
      out.push(flat(s.notebook) === flat(nb) && repair(clone(campaign(nb))).left === 1);
    }
    t.ok(out.every(Boolean), '4 a bugged card that already has a retired field (null, a string, an object), with or without a survivor: unchanged and reported left, not repaired ' + flat(out));
  }
  {
    // left as they are: any other occupant of the new id, a card with another meaning, genuine 姉妹
    const cases = [
      ['a lore record', { kind: 'lore', id: 'w:おしまい|おしまい', t: 5 }],
      ['another surface', { kind: 'word', id: 'w:おしまい|おしまい', surface: 'オシマイ', reading: 'おしまい', m: END, t: 5 }],
      ['another reading', { kind: 'word', id: 'w:おしまい|おしまい', surface: 'おしまい', reading: 'しまい', m: END, t: 5 }],
      ['a retired card', { kind: 'word-retired', id: 'w:おしまい|おしまい', surface: 'おしまい', reading: 'おしまい', m: END, t: 5 }],
    ];
    const out = cases.map(([name, occ]) => {
      const nb = [BUG(), occ];
      const s = loadAgain(campaign(clone(nb)));
      const r = repair(campaign(clone(nb)));
      return [name, flat(s.notebook) === flat(nb) && r.left === 1 && !r.renamed && !r.retired];
    });
    t.ok(out.every((x) => x[1]), '4 another occupant of the id (a lore record, another surface, another reading, a retired card): nothing changed, reported left, not repaired ' + flat(out));
    const other = [Object.assign(BUG(), { m: 'the end (my note)' }), Object.assign(BUG(), { kind: 'lore' }), Object.assign(BUG(), { surface: '姉妹' }), SIS()];
    const s = loadAgain(campaign(clone(other)));
    t.ok(flat(s.notebook) === flat(other), '4 a w:姉妹|おしまい card with its own meaning, not a word card, or another surface, and genuine w:姉妹|しまい: unchanged');
  }

  // ---- 6: what reads the notebook ----------------------------------------------------------------------
  {
    const s = loadAgain(campaign([BUG(), KAN(), SIS()]));
    s.id = 'osh-test';
    const n = RB.ngplus.carry(s);
    t.ok(flat(n.notebook) === flat([KAN(), SIS()]) && s.notebook.some((x) => x.kind === 'word-retired'),
      '6 New Game+ carries the active cards only; the journey it was retired in keeps the retired card ' + flat(n.notebook.map((x) => x.id)));
  }
  {
    const before = campaign([BUG(), SIS()]), after = loadAgain(before);
    const deskB = RB.practiceDesk.notebookCards(before).map((c) => c.w), deskA = RB.practiceDesk.notebookCards(after).map((c) => c.w);
    t.ok(!deskB.includes('おしまい') && !deskA.includes('おしまい') && !deskA.some((w) => w !== '姉妹'),
      '6 the writing desk offers no おしまい card, before or after (it is not standard vocabulary) ' + flat({ deskB, deskA }));
    const coll = loadAgain(campaign([BUG(), STD(), SIS()]));
    const metB = [...RB.kanjiInfo.met(before)].sort(), metA = [...RB.kanjiInfo.met(after)].sort(), metC = [...RB.kanjiInfo.met(coll)].sort();
    t.ok(flat(metB) === flat(metA) && flat(metA) === flat(metC) && metA.includes('姉') && metA.includes('妹'),
      '6 the kanji met set is unchanged by the repair (the card is written in kana; genuine 姉妹 still gives 姉 and 妹) ' + flat(metA));
  }
  {
    // the word game's journey pool: no installed bank has おしまい, so a test-only bank shows the rule: a noted
    // standard card counts as met; a Kansai one does not; independent evidence still counts
    const SH = RB.shiritori, WP = RB.wordplay;
    const real = SH.banks().every((id) => !SH.bank(id).entries.some((e) => e.forms.concat(SH.readingsOf(e)).some((f) => /しまい|姉妹/.test(f))));
    for (const id of SH.banks()) SH.removeBank(id);
    const def = fixtureDef('pocket');
    def.entries.push({ id: 'oshimai', reading: 'おしまい', forms: ['おしまい'], display: { jp: 'おしまい', en: 'the end' }, nounKind: 'common', lexicalLevel: 'pocket', provenance: [{ source: 'test-only entry', reviewed: false }] });
    SH.addBank(def);
    const inPool = (s) => WP.journeyPool(s).some((e) => e.id === 'oshimai');
    const std = loadAgain(campaign([BUG(), STD()])), kan = loadAgain(campaign([BUG(), KAN()]));
    const kanMet = loadAgain(campaign([BUG(), KAN()]));
    WP.markEncountered(kanMet, ['oshimai']);
    const kanIntro = loadAgain(campaign([BUG(), KAN()]));
    kanIntro.learn.intro = { 'v:おしまい': true };
    t.ok(real && inPool(std) && !inPool(kan) && inPool(kanMet) && inPool(kanIntro) && inPool(loadAgain(campaign([BUG()]))),
      '6 the word game: no installed bank has おしまい or 姉妹; on a test bank, the active standard card counts as met and a Kansai survivor does not, while meeting it at the table or its introduction still counts ' + flat({ real, std: inPool(std), kan: inPool(kan), kanMet: inPool(kanMet), kanIntro: inPool(kanIntro) }));
  }
};
