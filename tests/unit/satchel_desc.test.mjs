// RBN-QA-211, the Satchel and the Hall's key ledger (Agnes 6748887479; Local CL-734, CL-735 §2a, CL-736; Agnes
// 6749602707; Cloud CC-544): the ledger's description was an { en } object, the Satchel passed it to enVars as text, and
// selecting the key threw, so the Satchel's details stayed blank and its buttons stopped answering. Now:
//  1. the ledger's description is a plain English string (no Japanese, no voice key);
//  2. the content rule tools/validate.mjs applies to every registered item (tools/item_rules.mjs): a description, when
//     present, is a plain string with something in it; null, a number, an object (an { en } one too), an array, an
//     empty or blank string are each an error, and the message names the item; no description at all is fine;
//  3. the Satchel's guard (RB.ui.menu.itemDesc): a string as it is; a malformed { en: string } gives that English; any
//     other shape gives nothing; it never throws, and what it gives goes through enVars ($name filled in) without
//     throwing either. Keepsakes keep their own { en } descriptions and renderer, untouched.
// The Satchel on screen (both layouts, the key across save, load and reload, a bad entry's neighbours still answering)
// is tests/e2e/satchel_desc.mjs.
import { load } from '../lib/load.mjs';
import { itemDescProblem } from '../../tools/item_rules.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content;
  const s = RB.state.newCampaign({ edition: 2 }); s.player.name = 'Haru'; s.player.nameJp = 'ハル';
  RB.game.G.s = s; RB.game.s = s;

  // ---- 1. the ledger
  const L = C.items.hall_ledger;
  t.ok(L && L.key === true && typeof L.desc === 'string' && /^An old book of the lantern-keepers' hall above the Keepers' Road/.test(L.desc) && /Tsuru found it at the bottom of her teacher's box\.$/.test(L.desc), '1 the Hall\'s key ledger: a key item whose description is the same English, as a plain string');
  t.ok(L.name && L.name.en === 'The Hall\'s key ledger' && L.name.jp === '{館|やかた} の {鍵帳|かぎちょう}', '1 its name as before');

  // ---- 2. the content rule
  const bad = [['null', null], ['a number', 5], ['an { en } object', { en: 'An old book.' }], ['an { en: number }', { en: 5 }], ['a Japanese-only object', { jp: '{古|ふる}い {本|ほん}' }], ['an array', ['An old book.']], ['an empty string', ''], ['a blank string', '   \n ']];
  for (const [what, desc] of bad) {
    const p = itemDescProblem({ name: { en: 'Probe' }, desc });
    t.ok(typeof p === 'string' && p.length > 0, '2 ' + what + ' is an error');
  }
  t.eq([itemDescProblem({ name: { en: 'Probe' } }), itemDescProblem({ name: { en: 'Probe' }, desc: undefined }), itemDescProblem({ name: { en: 'Probe' }, desc: 'A plain line, for $name.' })], [null, null, null], '2 no description, or a plain string, passes');
  // the rule as tools/validate.mjs words it, naming the item
  const msgs = [];
  const E = (m) => msgs.push(m);
  const check = (id, it) => { const dp = itemDescProblem(it); if (dp) E('item ' + id + ': ' + dp); };
  check('probe_obj', { desc: { en: 'x' } }); check('probe_ok', { desc: 'x' });
  t.ok(msgs.length === 1 && msgs[0].indexOf('item probe_obj: ') === 0, '2 the message names the item');
  const fails = Object.keys(C.items).filter((id) => itemDescProblem(C.items[id]));
  t.eq(fails, [], '2 every registered item passes (' + Object.keys(C.items).length + ' items)');
  const src = (await import('node:fs')).readFileSync(new URL('../../tools/validate.mjs', import.meta.url), 'utf8');
  t.ok(/import \{ itemDescProblem \} from '\.\/item_rules\.mjs';/.test(src) && /const dp = itemDescProblem\(it\); if \(dp\) E\('item ' \+ id \+ ': ' \+ dp\);/.test(src), '2 tools/validate.mjs applies the rule to every item, naming it');

  // ---- 3. the Satchel's guard
  const D = RB.ui.menu.itemDesc;
  t.ok(typeof D === 'function', '3 the guard is the Satchel\'s own');
  const cases = [
    [{ desc: 'A plain line.' }, 'A plain line.'],
    [{ desc: { en: 'Its English.' } }, 'Its English.'],
    [{ desc: { en: 5 } }, ''], [{ desc: { jp: '{古|ふる}い' } }, ''], [{ desc: null }, ''], [{ desc: 5 }, ''], [{ desc: ['x'] }, ''], [{}, ''], [null, ''],
  ];
  let threw = null;
  const got = cases.map(([d]) => { try { return D(d); } catch (e) { threw = e; return 'THREW'; } });
  t.eq(got, cases.map((c) => c[1]), '3 each shape: a string as it is, an { en: string } its English, anything else nothing');
  t.ok(!threw, '3 none throws');
  let thrown2 = null;
  const filled = cases.map(([d]) => { try { return RB.script.enVars(D(d)); } catch (e) { thrown2 = e; return 'THREW'; } });
  t.ok(!thrown2 && filled.every((x) => typeof x === 'string'), '3 and enVars takes each without throwing');
  t.eq(RB.script.enVars(D({ desc: 'Kept for $name.' })), 'Kept for Haru.', '3 $name is still filled in');
  t.eq(RB.script.enVars(D(L)), L.desc, '3 the ledger reads its own English');
  // keepsakes untouched: their { en } descriptions stay, for their own renderer
  const KS = C.keepsakes || {};
  const ks = Object.keys(KS).filter((id) => KS[id] && KS[id].desc && typeof KS[id].desc === 'object' && typeof KS[id].desc.en === 'string');
  t.ok(!C.keepsakes || ks.length > 0, '3 keepsakes keep their { en } descriptions (' + ks.length + ')');
};
