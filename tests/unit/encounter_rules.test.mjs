// The encounter content rules (tools/encounter_rules.mjs) catch what they promise to: unknown creatures and moves,
// too many creatures outside a set piece, a Hush on a bell, an objective with one way to win, a conversation
// without enough to it, a machine step without a right action, an action that can restart without saying what the
// player will do, and conditions or claims that do not exist. The fixtures themselves pass.
import { load } from '../lib/load.mjs';
import { encounterRules } from '../../tools/encounter_rules.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content;
  const check = (defs) => {
    const errs = [];
    const fake = Object.assign({}, C, { encounters: defs });
    encounterRules(RB, fake, { jcheck: () => {}, checkStep: () => {}, E: (m) => errs.push(m) });
    return errs;
  };
  t.eq(check(Object.fromEntries(Object.entries(C.encounters).filter(([, d]) => d.fixture))), [], 'the fixtures pass');
  const has = (errs, re, what) => t.ok(errs.some((e) => re.test(e)), what + ' (' + errs.join(' | ') + ')');
  const one = (d) => check({ [d.id]: Object.assign({ name: { en: 'x' } }, d) });
  has(one({ id: 'a', lead: 'nope' }), /unknown creature nope/, 'an unknown creature');
  has(one({ id: 'b', lead: { enemy: 'rw.reedling', pattern: ['strike', 'dance'] } }), /unknown move dance/, 'an unknown move');
  has(one({ id: 'c', lead: 'rw.reedling', group: ['rw.dustmoth', 'rw.inkblot', 'rw.reedling'] }), /outside a set piece/, 'four creatures outside a set piece');
  has(one({ id: 'd', lead: 'rw.reedling', group: ['rw.dustmoth', 'rw.inkblot', 'rw.reedling', 'sg.crab', 'sg.crane'], setPiece: true }), /more creatures at the start/, 'six creatures in a set piece');
  has(one({ id: 'e', lead: { enemy: 'lf.blot', pattern: ['silence:x'], intents: { 'silence:x': { family: 'bell' } } } }), /never silence a bell/, 'a Hush on a bell');
  has(one({ id: 'f', lead: 'rw.reedling', actors: [{ aid: 'o:box', side: 'object', name: { en: 'box' }, hp: 2 }], objective: { kind: 'protect', aid: 'o:box' }, conclusions: [{ id: 'safe', when: { settled: 'all' } }, { id: 'lost', when: { down: 'o:box' }, result: 'end' }] }), /two ways to win/, 'an objective with one way to win');
  has(one({ id: 'g', kind: 'social', social: { parties: [{ aid: 'n:a', name: { en: 'A' } }], claims: {}, actions: [] }, conclusions: [{ id: 'x', when: { rounds: 3 }, result: 'end' }] }), /several conclusions/, 'a conversation with one conclusion');
  const gErr = one({ id: 'g2', kind: 'social', social: { parties: [{ aid: 'n:a', name: { en: 'A' } }], claims: {}, actions: [] }, conclusions: [{ id: 'x', when: { rounds: 3 }, result: 'end' }, { id: 'y', when: { rounds: 4 }, result: 'end' }] });
  has(gErr, /at least two of/, 'a conversation with nothing to find, no change and one goal');
  has(gErr, /nao has no option/, 'a conversation with no option for a companion');
  has(one({ id: 'h', kind: 'procedure', procedure: { id: 'p', steps: [{ id: 's', actions: [{ id: 'a', label: { en: 'A' } }] }] }, conclusions: [] }), /no right action/, 'a machine step without a right action');
  has(one({ id: 'i', kind: 'procedure', procedure: { id: 'p', steps: [{ id: 's', actions: [{ id: 'a', label: { en: 'A' }, ok: true }, { id: 'b', label: { en: 'B' } }] }] }, conclusions: [] }), /must say what the player will do/, 'an action that can send the machine back without its interpretation');
  has(one({ id: 'j', lead: 'rw.reedling', conclusions: [{ id: 'x', when: { sunset: true } }] }), /unknown condition "sunset"/, 'an unknown condition');
  has(one({ id: 'k', kind: 'social', social: { parties: [{ aid: 'n:a', name: { en: 'A' } }], claims: {}, actions: [{ id: 'q', label: { en: 'Q' }, effect: { reveal: 'zz' } }] }, conclusions: [] }), /reveals unknown claim zz/, 'an unknown claim');
};
