// RBN-QA-083 (Agnes 6332352250, 6332411599, 6332916876; Local CL-158, CL-159, CL-161; Cloud CC-087, CC-088): while
// Ao waits in the keepers' hall to read (quest.ko_ao=1), Mitsu in the lodge, asked "Have you seen…?", sent you to the
// village ("Ao runs round the village with his basket"). A person's usual line can now carry ordered variants for a
// story step (`usualIf`, the first that holds), beside the unchanged usual line. In Chromium on the built game:
//  1. Ao's side story not taken, at the lessons, at the hall reading and done, asked of Mitsu (the lodge) and of
//     Yoshino (the hall): the answer each would give (a sighting next door, or what Mitsu knows of the hall);
//     Yoshino, who sees Ao in the hall, still answers with her sighting;
//  2. through the real sheet (talk to Mitsu, "Have you seen…?", Ao): her answer is the hall line, and Known details keeps
//     what she said then (a note, not a tracker): it stays after Ao has read, until asked again;
//  3. the usual line itself unchanged (text and voice key), the variant with its own key and furigana; both in the
//     "Have you seen…?" lines for each asker who knows Ao well; a refusal and a stranger unchanged; every other
//     relation (usual lines, refusals, who knows whom) as before; no page errors.
// Usage: node tools/build.mjs && node tests/e2e/ao_whereabouts.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const { p, errors } = await page(b, url);
const wait = (ms) => p.waitForTimeout(ms);

const USUAL = { jp: 'アオ なら 、 {籠|かご} を {持|も}って {村|むら} の {中|なか} を {走|はし}り{回|まわ}って いる わ 。', en: 'Ao runs round the village with his basket.' };
const HALL = { jp: 'アオ なら 、 ヨシノ さん と {字|じ} を {読|よ}む って 、 {館|やかた} へ {行|い}った わ 。', en: 'Ao went off to the hall. He said he was going to read with Yoshino.' };
const NEAR = 'I saw them just now, over by The Keepers\' Village.', HERE = 'I saw them around here just now.';
// the relations table on the task head before this change (every person's usual line, refusal, coldness and whom
// they know), fingerprinted the same way: sha256 of the JSON below, first 16
const RELATIONS_BEFORE = '0c5800f1dd58fa7b';
const KO = { ch2_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_ch9: true, ko_arrived: true, ko_otoha_met: true, ko_ao_helped: true };
const ASKER = { ko_mitsu: ['ko.lodge', 7, 5], ko_yoshino: ['ko.hall', 8, 8] };

async function start(asker, quest) {
  const [map, x, y] = ASKER[asker];
  await p.evaluate(([map, x, y, quest, flags]) => {
    const s = RB.game.debugStart(map, x, y, { dir: 'up', edition: RB.edition.forNew(), comp: 'suzu', flags });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.game.settings.textSpeed = 'instant';
    if (quest != null) RB.state.setQuest(s, 'ko_ao', quest);
    RB.world.enter(map, x, y, 'up', { fresh: true });
    RB.town.seen(s, 'ko_ao', 'ko.village');
  }, [map, x, y, quest, KO]);
  await wait(200);
}
const answer = (asker) => p.evaluate(([asker, map]) => { const a = RB.town.whereabouts(RB.game.s, asker, 'ko_ao', map); return { kind: a.kind, en: a.line.en, jp: a.line.jp, where: RB.world.mapsWith('ko_ao') }; }, [asker, ASKER[asker][0]]);

// 1. each state, each asker
const want = {
  ko_mitsu: { null: ['sighting', NEAR], 0: ['sighting', NEAR], 1: ['routine', HALL.en], done: ['sighting', NEAR] },
  ko_yoshino: { null: ['sighting', NEAR], 0: ['sighting', NEAR], 1: ['sighting', HERE], done: ['sighting', NEAR] },
};
for (const asker of ['ko_mitsu', 'ko_yoshino']) for (const q of [null, 0, 1, 'done']) {
  await start(asker, q);
  const r = await answer(asker);
  const [kind, en] = want[asker][String(q)];
  ok(r.kind === kind && r.en === en && (q !== 1 || (r.kind !== 'routine' || r.jp === HALL.jp)), asker + ', ko_ao ' + (q == null ? 'not taken' : q) + ': ' + kind + ' "' + en + '" (' + JSON.stringify(r) + ')');
}

// 2. through the real sheet, at the hall reading
{
  await start('ko_mitsu', 1);
  const r = await p.evaluate(async () => {
    const said = [], say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) { said.push({ who: l.who, en: l.en, jp: l.jp, sceneId: l.sceneId }); return say.apply(this, arguments); };
    RB.test.enable({ choose: (opts) => { let i = opts.findIndex((o) => o.k === 'ask'); if (i < 0) i = opts.findIndex((o) => o.p === 'ko_ao'); return i < 0 ? opts.length - 1 : i; } });
    const n = RB.content.maps['ko.lodge'].npcs.find((x) => x.id === 'ko_mitsu');
    try { await RB.whereabouts.ask(n, null); } finally { RB.test.disable(); RB.ui.dialogue.say = say; }
    const note = (RB.game.s.world.notes || {}).ko_ao || null;
    return { said: said.filter((l) => l.who === 'ko_mitsu'), note: note && { kind: note.kind, from: note.from, en: note.line && note.line.en } };
  });
  ok(r.said.length === 1 && r.said[0].en === HALL.en && r.said[0].jp === HALL.jp && r.said[0].sceneId === 'code.wb', 'the sheet: Mitsu answers with the hall line, spoken under code.wb (' + JSON.stringify(r) + ')');
  ok(r.note && r.note.kind === 'routine' && r.note.from === 'ko_mitsu' && r.note.en === HALL.en, 'Known details keeps what Mitsu said (' + JSON.stringify(r.note) + ')');
  const after = await p.evaluate(() => { const s = RB.game.s; RB.state.setQuest(s, 'ko_ao', 'done'); const n = s.world.notes.ko_ao; return { en: n.line.en, kind: n.kind }; });
  ok(after.en === HALL.en && after.kind === 'routine', 'after Ao has read, the note still says what she said then, not where he is now (' + JSON.stringify(after) + ')');
  const again = await p.evaluate(() => { const s = RB.game.s; RB.world.enter('ko.lodge', 7, 5, 'up', { fresh: true }); const a = RB.town.whereabouts(s, 'ko_mitsu', 'ko_ao', 'ko.lodge'); RB.town.note(s, 'ko_mitsu', a); return { kind: a.kind, en: a.line.en, note: s.world.notes.ko_ao.kind }; });
  ok(again.kind === 'sighting' && again.en === NEAR && again.note === 'sighting', 'asked again once he is back by his basket: a sighting next door, and the note follows the new answer (' + JSON.stringify(again) + ')');
}

// 3. the lines themselves, the spoken set, refusal and stranger, the rest of the table
{
  const r = await p.evaluate(([USUAL, HALL]) => {
    const R = RB.content.relations, VB = RB.voicebank;
    const ao = R.ko_ao;
    const bare = (jp) => jp.replace(/\{[^}]*\}/g, '').match(/[一-鿿]/g) || [];
    const has = (asker, l) => RB.town.answersOf(asker).some((x) => x.jp === l.jp && x.en === l.en);
    const fp = Object.keys(R).sort().map((q) => [q, R[q].usual || null, R[q].refusal || null, R[q].friendly === false, Object.keys(R[q].knows || {}).sort().map((k) => k + ':' + R[q].knows[k])]);
    const s = RB.game.s;
    return {
      usual: ao.usual.jp === USUAL.jp && ao.usual.en === USUAL.en, usualKey: VB.keyOf('code.wb', ao.usual.jp), hallKey: VB.keyOf('code.wb', HALL.jp),
      variants: (ao.usualIf || []).map((w) => w.if + ' | ' + w.en), bare: bare(HALL.jp),
      spoken: { mitsu: [has('ko_mitsu', USUAL), has('ko_mitsu', HALL)], yoshino: [has('ko_yoshino', USUAL), has('ko_yoshino', HALL)] },
      others: Object.keys(R).filter((q) => q !== 'ko_ao' && R[q].usualIf).length,
      refusal: RB.town.whereabouts(s, 'ko_tokio', 'ko_ao', 'ko.village'), stranger: RB.town.whereabouts(s, 'ko_mitsu', 'ko_kihei', 'ko.lodge'),
      fp: VB.sha256(JSON.stringify(fp)).slice(0, 16),
    };
  }, [USUAL, HALL]);
  ok(r.usual && r.usualKey === 'code.wb#cf648ecb53', 'Ao\'s usual line unchanged, with its voice key (' + r.usualKey + ')');
  ok(r.variants.length === 1 && r.variants[0] === 'quest.ko_ao=1 | ' + HALL.en && r.hallKey !== r.usualKey && r.bare.length === 0 && r.others === 0, 'one variant, for the hall reading only, with its own key and furigana; nobody else has one (' + JSON.stringify({ v: r.variants, key: r.hallKey, bare: r.bare, others: r.others }) + ')');
  ok(r.spoken.mitsu.every(Boolean) && r.spoken.yoshino.every(Boolean), 'both lines are among the spoken "Have you seen…?" answers of Mitsu and of Yoshino (' + JSON.stringify(r.spoken) + ')');
  ok(r.refusal.kind === 'refusal' && r.stranger.kind === 'unknown', 'Tokio still refuses, and a stranger is still unknown (' + r.refusal.kind + ', ' + r.stranger.kind + ')');
  ok(r.fp === RELATIONS_BEFORE, 'every other usual line, refusal and acquaintance as before (' + r.fp + ')');
}

ok(!errors.length, 'no page errors ' + errors.slice(0, 3).join(' | '));
await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
