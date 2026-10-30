// A blow at one target, where something is to be protected (Agnes 6535686146; Local CL-528; Cloud CC-380): the move's few
// words and its help said "one of you" (or "you", alone) even where it may be aimed at a lantern, the letter, your
// travel papers or your towel. They now say "or what you protect", without saying which: the Japanese says which. In
// node, on each encounter's real state:
//  1. the Wick Moths, with Nao and alone: strike, lie, mirror and chill, in the few words, the title and the help;
//  2. the letter, your travel papers and your towel: the same for a strike;
//  3. sweep and gust keep their words there (they reach only the two of you);
//  4. once nothing to protect is standing, the words are the ordinary ones again;
//  5. unchanged where nothing is to be protected: an ordinary battle, word for word, and every other encounter's strike.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, E = RB.encounter, S = RB.state, H = RB.combatHelp;
  const at = (enc, comp) => { const s = S.newCampaign({ edition: 2 }); s.comp = comp; s.words = ['mamoru', 'iyasu']; RB.game.s = s; RB.game.G.s = s; return E.begin(enc, s); };
  const said = (st, k) => { const it = Object.assign({}, st.foes[0].intent, { kind: k, key: k }); const inf = H.intentInfo(st, it, []); return { gist: H.gist(st, it), title: inf.title, what: inf.what }; };
  const P = ', or what you protect';

  // ---- 1. the Wick Moths
  for (const comp of ['nao', null]) {
    const st = at('kr.wick_ridge', comp);
    const who = comp ? 'one of you' : 'you';
    const got = Object.fromEntries(['strike', 'lie', 'mirror', 'chill'].map((k) => [k, said(st, k)]));
    t.eq(got, {
      strike: { gist: '2 to ' + who + P, title: 'Strike — a blow at one of you' + P, what: 'It hits ' + who + P + ', for 2. The Japanese says which.' },
      lie: { gist: '2 to ' + who + P, title: 'False promise — a lie with a blow behind it', what: 'It says something untrue; if you let it stand, it hits ' + who + P + ', for 2.' },
      mirror: { gist: '2 to ' + who + P, title: 'Mirror — your words, turned inside out', what: 'It repeats something real but twists it, and hits ' + who + P + ', for 2.' },
      chill: { gist: '2 to ' + who + P, title: 'Chill — a freezing breath at one of you' + P, what: 'It hits ' + who + P + ', for 2. The Japanese says which.' },
    }, '1 the Wick Moths, ' + (comp ? 'with Nao' : 'alone') + ': "or what you protect", and the Japanese says which');
    // ---- 3. sweep and gust as they were
    t.eq([said(st, 'sweep').gist, said(st, 'gust').gist], comp ? ['2 to each of you', '2 to you, strips wards'] : ['2 to you', '2 to you, strips wards'], '3 the Wick Moths, ' + (comp ? 'with Nao' : 'alone') + ': sweep and gust keep their words');
  }

  // ---- 2. the other three things to protect
  for (const enc of ['fx.protect', 'cr.fog_papers', 'yn.towel']) {
    const st = at(enc, 'nao');
    const x = said(st, 'strike');
    t.ok(x.gist.endsWith(' to one of you' + P) && x.what.indexOf('one of you' + P + ', for') >= 0 && /says which\.$/.test(x.what), '2 ' + enc + ': a strike says "or what you protect" (' + JSON.stringify(x) + ')');
  }

  // ---- 4. once nothing to protect is standing
  {
    const st = at('kr.wick_ridge', 'nao');
    const east = st.actors.find((a) => a.aid === 'o:east'), west = st.actors.find((a) => a.aid === 'o:west');
    east.hp = 0;
    const one = said(st, 'strike').gist;
    west.left = true;
    const none = said(st, 'strike');
    t.ok(one === '2 to one of you' + P && none.gist === '2 to one of you' && none.what === 'It hits one of you for 2. The Japanese says who.', '4 one lantern still standing keeps the words; none standing, the ordinary words (' + JSON.stringify({ one, none }) + ')');
  }

  // ---- 5. unchanged where nothing is to be protected
  for (const comp of ['nao', null]) {
    const st = at('fx.ordinary', comp);
    const who = comp ? 'one of you' : 'you';
    t.eq(['strike', 'lie', 'mirror', 'chill'].map((k) => said(st, k)), [
      { gist: '2 to ' + who, title: 'Strike — a blow at one of you', what: comp ? 'It hits one of you for 2. The Japanese says who.' : 'It hits you for 2.' },
      { gist: '2 to ' + who, title: 'False promise — a lie with a blow behind it', what: 'It says something untrue; if you let it stand, it hits ' + who + ' for 2.' },
      { gist: '2 to ' + who, title: 'Mirror — your words, turned inside out', what: 'It repeats something real but twists it, and hits ' + who + ' for 2.' },
      { gist: '2 to ' + who, title: 'Chill — a freezing breath at one of you', what: comp ? 'It hits one of you for 2. The Japanese says who.' : 'It hits you for 2.' },
    ], '5 an ordinary battle, ' + (comp ? 'with Nao' : 'alone') + ': the words as they were');
  }
  const guarded = new Set(['kr.wick_ridge', 'fx.protect', 'cr.fog_papers', 'yn.towel']);
  const wrong = [];
  let n = 0;
  for (const id of Object.keys(C.encounters)) {
    if (guarded.has(id) || !C.encounters[id].lead) continue;
    let st;
    try { st = at(id, 'nao'); } catch (e) { continue; }
    if (!st.foes.length || !st.foes[0].intent) continue;
    n++;
    if (/protect/.test(JSON.stringify(said(st, 'strike')))) wrong.push(id);
  }
  t.ok(n >= 20 && !wrong.length, '5 every other encounter with a creature (' + n + '): a strike\'s words never mention what you protect' + (wrong.length ? ': ' + wrong.join(', ') : ''));
};
