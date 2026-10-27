// RBN-QA-163 (Agnes 6374243437, 6375174827, 6376014281; Local CL-248; Cloud CC-153 §6, CC-154 §4, CC-155 §2): Chapter
// 4's bridge census. A plaque's name, once read back, goes into your notebook, and the plaque is cut again once Sen has
// the census's names; but the board showed carved at once, and its repeat line said it was. In node:
//  1. the three plaques carry their cut condition (quest.mp_census=done); no other plaque does;
//  2. the board (the shared condition, here the flat renderer): unread, blank; read back while the census is open,
//     blank; once Sen has the names, carved; an older plaque read back is carved as before, census or not;
//  3. each scene with the real runner: read back with the census open, the name noted once; looked at again before
//     Sen, the new line, nothing counted again; after Sen, the plaque reads its name;
//  4. the older census's plaque scenes are untouched by this;
//  5. (B) the person who named the bridge is never brought in: no line says they arrive, pass or speak now, and the
//     scene neither brings anyone in nor walks anyone (no !enter, !walkto or !move), so nobody can appear at the map's
//     edge or be left standing there; (Agnes 6446430005; CC-356 §2) nor does it claim you ever talked with them (you
//     may not have): it says whose description the clue is ("Sanpei describes this bridge:"), and that person is the
//     one the census's clue quotes.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state;
  const REC = 'The name is in your notebook. The plaque will be cut again once Sen has it.';

  // ---- 1.
  const plaques = Object.entries(C.maps).flatMap(([m, d]) => (d.props || []).filter((p) => p.p === 'mb_plaque').map((p) => [m, p]));
  const cut = plaques.filter(([, p]) => p.o && p.o.cut);
  t.eq(cut.map(([m, p]) => m + ':' + p.o.bridge + ':' + p.o.cut).sort(), ['mp.blockprint:hangi:quest.mp_census=done', 'mp.blockprint:sumi:quest.mp_census=done', 'mp.playhouse:maku:quest.mp_census=done'],
    'the three census plaques are cut once Sen has the names; no other plaque (' + plaques.length + ' in all) has a cut condition');

  // ---- 2. (the flat renderer shares the condition with the drawn art: src/content/mb/02_art.js named())
  const marks = (o) => {
    const fills = [];
    const ctx = { set fillStyle(v) { this._f = v; }, get fillStyle() { return this._f; }, fillRect() { fills.push(this._f); } };
    RB.props.P.mb_plaque.draw(ctx, 0, 0, { stone: ['#000', '#111', '#222', '#333'], wood: ['#400', '#500', '#600', '#700'] }, 0, o);
    return fills.includes('#2a2024') ? 'carved' : 'blank';
  };
  const journey = (o = {}) => { const s = S.newCampaign({ edition: 2 }); Object.assign(s.flags, o.flags || {}); if (o.census) s.quests.mp_census = o.census; RB.game.G.s = s; return s; };
  const sumi = plaques.find(([m, p]) => m === 'mp.blockprint' && p.o && p.o.bridge === 'sumi')[1].o;
  const rows = [];
  journey(); rows.push('unread: ' + marks(sumi));
  journey({ flags: { mb_pl_sumi: true }, census: { stage: 0, done: false, t: 1 } }); rows.push('read back, census open: ' + marks(sumi));
  journey({ flags: { mb_pl_sumi: true }, census: { stage: 1, done: false, t: 1 } }); rows.push('three read back, not yet to Sen: ' + marks(sumi));
  journey({ flags: { mb_pl_sumi: true }, census: { stage: 1, done: true, t: 1 } }); rows.push('Sen has them: ' + marks(sumi));
  journey({ flags: { mb_pl_fuda: true } }); rows.push('an older plaque read back, no census: ' + marks({ bridge: 'fuda' }));
  journey({ flags: { mb_pl_fuda: true }, census: { stage: 0, done: false, t: 1 } }); rows.push('an older plaque read back, census open: ' + marks({ bridge: 'fuda' }));
  t.eq(rows, ['unread: blank', 'read back, census open: blank', 'three read back, not yet to Sen: blank', 'Sen has them: carved', 'an older plaque read back, no census: carved', 'an older plaque read back, census open: carved'],
    'the board: blank until Sen has the names; an older plaque as before');

  // ---- 3. the scenes with the real runner
  const said = [];
  RB.ui.dialogue.say = async (l) => { said.push(l.en); };
  RB.ui.dialogue.choose = async () => 0;
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.challenge.run = async () => ({ ok: true });
  for (const k of ['dismissExtras', 'refreshActors']) RB.world[k] = () => {};
  RB.game.afterScene = () => {};
  RB.save.autosave = async () => {};
  const run = async (id) => { said.length = 0; await RB.script.run('mp.plaque_' + id); return said.slice(); };
  const bad = [];
  for (const id of ['hangi', 'sumi', 'maku']) {
    const s = journey({ census: { stage: 0, done: false, t: 1 } });
    const L = await run(id);
    if (!(L[0] === 'The bridge\'s plaque is blank. Only the grain of the wood shows.' && /^You note the name down\. Once Sen has it, the plaque will be cut again\.$/.test(L[L.length - 1]) && s.flags['mb_pl_' + id] && s.vars.mp_census === 1)) bad.push(id + ' read: ' + JSON.stringify({ L, n: s.vars.mp_census }));
    // looked at again before Sen: the new line, nothing counted again
    const L2 = await run(id);
    if (!(L2.length === 1 && L2[0] === REC && s.vars.mp_census === 1)) bad.push(id + ' again: ' + JSON.stringify({ L2, n: s.vars.mp_census }));
    // after Sen
    s.quests.mp_census = { stage: 1, done: true, t: 2 };
    const L3 = await run(id);
    if (!(L3.length === 1 && /^The plaque reads: "/.test(L3[0]) && s.vars.mp_census === 1)) bad.push(id + ' after Sen: ' + JSON.stringify(L3));
  }
  t.eq(bad, [], 'each scene: the name noted once; looked at again before Sen, the new line and nothing counted; after Sen, the name');

  // ---- 5. (B: Agnes's report, Kakeru at the ink bridge, and Sanpei with him; B2: Hayashi at the curtain bridge; then
  // Agnes 6446430005: whose description it is, not a talk you may never have had)
  const SAYS = { hangi: 'Sanpei describes this bridge:', sumi: 'The water under the bridge is cloudy black. Kakeru the courier describes this bridge:',
    maku: 'The railing has the marks of a great cloth hung to dry. Hayashi the drummer describes this bridge:' };
  const NOW = /runs up|says something|goes over the bridge|calls out/;
  const TOLD = /once told you|told you about/;
  const told = [];
  for (const [id, line] of Object.entries(SAYS)) {
    journey({ census: { stage: 0, done: false, t: 1 } });
    const L = await run(id);
    const cmds = C.scenes['mp.plaque_' + id].cmds;
    const jp = cmds.filter((c) => c.op === 'say').map((c) => c.jp);
    // the person the clue quotes (its English opens with their name: "Sanpei: …")
    const who = C.challenges['mb.census_' + id].tiers.E[0].ctx.en.split(':')[0];
    const ok = L[1] === line && line.includes(who + ' ') && !L.some((l) => NOW.test(l) || TOLD.test(l))
      && !jp.some((j) => /\{前\|まえ\} に .*\{話\|はな\}して いた/.test(j)) && jp.some((j) => /この \{橋\|はし\} の こと を こう \{話\|はな\}す 。$/.test(j))
      && !cmds.some((c) => /^(enter|walkto|move)$/.test(c.op));
    told.push(id + ': ' + (ok ? 'ok' : JSON.stringify({ L, who, jp, ops: cmds.map((c) => c.op) })));
  }
  t.eq(told, ['hangi: ok', 'sumi: ok', 'maku: ok'], 'the bridge\'s namer never brought in and never claimed as a talk you had: whose description it is (the one the clue quotes), nothing said to happen now, nobody walked');

  // ---- 4.
  const older = Object.keys(C.scenes).filter((id) => /^mb\.plaque_|^mb\.firstbridge_plaque$/.test(id));
  t.ok(older.length >= 7 && older.every((id) => !JSON.stringify(C.scenes[id].cmds).includes('mp_census')), 'the older census\'s plaque scenes untouched (' + older.length + ')');
};
