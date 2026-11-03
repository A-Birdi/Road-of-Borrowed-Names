// The Company page's line for a new talk away from a rest stop (Agnes 6548032279; Cloud CC-409; Local CL-567; Agnes
// 6548240195): it read "new — for a rest stop (an inn, a teahouse, a camp)", but the Waystation Teahouse offers tea, not
// a night's rest, and is no rest stop. Only the words change: "new — not here: talk where you can rest (an inn, a hut, a
// camp, or Hana's Teahouse)". Which places are rest stops is unchanged. In the source and the loaded game:
//  1. the line: the new words once, in the Company page's topics; the old words nowhere in the source or the tests;
//  2. the rest contract as before: the rest-stop list and its conditions, and where you can rest on every map (with
//     and without the night Ichi is lost and the Upper House room), by fingerprints taken before the change;
//  3. the places the line is about: the Waystation Teahouse, not a rest stop; Hana's Teahouse, a hut and a camp, rest
//     stops; Kawaya, a rest stop except on the night Ichi is lost.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, S = RB.state, K = RB.company;
  const flat = (x) => JSON.stringify(x);
  const fp = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
  const NEW = 'new — not here: talk where you can rest (an inn, a hut, a camp, or Hana\\\'s Teahouse)';
  const OLD = /for a rest stop|a teahouse, a camp/;
  const root = process.cwd();
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : /\.(m?js|html)$/.test(e.name) ? [path.join(d, e.name)] : []));

  // 1. the line
  const page = fs.readFileSync(path.join(root, 'src/ui/53_company_pages.js'), 'utf8');
  // (this file left out by either separator, so the check holds on Windows too: Local CL-668)
  const old = walk(path.join(root, 'src')).concat(walk(path.join(root, 'tests'))).filter((f) => !/tests[\\/]unit[\\/]rest_label\.test\.mjs$/.test(f) && OLD.test(fs.readFileSync(f, 'utf8')));
  t.ok(page.split(NEW).length === 2 && /'<div class="kind">' \+ \(x\.heard \? 'talked about' : rest \? 'you could talk about this now' : 'new — not here/.test(page) && !old.length,
    '1 the new words once, in the topics\' line; the old words nowhere in the source or the tests ' + flat({ n: page.split(NEW).length - 1, old: old.map((f) => path.relative(root, f)) }));

  // 2. the rest contract as before
  const at = (map, flags) => { const s = S.newCampaign({ edition: 2 }); s.map = map; for (const f of flags || []) s.flags[f] = true; return K.restHere(s); };
  const maps = Object.keys(C.maps).sort();
  const where = [[], ['mb_night'], ['yn_rooms_done']].map((fl) => maps.map((m) => { const r = at(m, fl); return r ? m + ':' + r.kind + (r.atlas ? ':atlas' : '') : null; }).filter(Boolean));
  t.ok(fp(K.REST) === REST_FP && fp(where) === WHERE_FP, '2 the rest-stop list and where you can rest on every map, as before ' + flat({ rest: fp(K.REST), where: fp(where), n: where.map((x) => x.length) }));

  // 3. the places the line is about
  const got = { waystation: at('kr.foot_inn'), hana: at('rw.tea'), hut: at('sa.hut'), camp: at('sa.camp'), kawaya: at('mb.inn'), kawayaNight: at('mb.inn', ['mb_night']) };
  t.ok(got.waystation === null && got.hana && got.hana.kind === 'tea' && got.hut && got.hut.kind === 'hut' && got.camp && got.camp.kind === 'camp' && got.kawaya && got.kawaya.kind === 'inn' && got.kawayaNight === null && C.maps['rw.tea'] && /Hana/.test(C.maps['rw.tea'].name.en),
    '3 the Waystation, no; Hana\'s Teahouse, a hut, a camp, yes; Kawaya, yes but not on the night Ichi is lost ' + flat(got));
};
// before this change (computed on its parent): the rest-stop list, where you can rest on every map
const REST_FP = '77a7326b07be3145', WHERE_FP = '73c7825eaa1c5ab6';
