// E5, the honest "effect here" line (expansion plan 03_ENCOUNTERS.md E5; Robin's C-64): each response card's preview is
// the rule itself, run on a copy of the battle (RB.combatLogic.previewAct). The preview's effect data must equal what
// the same response then does, and previewing must change nothing.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const L = RB.combatLogic, C = RB.content;
  const camp = (o) => {
    const s = RB.state.newCampaign({});
    s.learn.difficulty = o.diff || 'normal';
    s.comp = o.comp || null;
    s.words = ['mamoru', 'mizu', 'hikari', 'iyasu', 'kaze', 'nawa'];
    return s;
  };
  const words = (s) => s.words.map((id) => Object.assign({ id }, C.words[id])).filter((w) => w.tags);
  const ok = { ok: true, firstTry: true, mistakes: 0 };
  const strip = (r) => JSON.parse(JSON.stringify({ fx: r.fx, answered: r.answered, countered: r.countered }));
  let cases = 0;
  for (const pattern of [['heat', 'strike'], ['shroud', 'strike'], ['charge', 'sweep'], ['gust', 'rest'], ['plea:1', 'strike'], ['strike', 'heat']]) {
    for (const comp of [null, 'mio', 'suzu']) {
      for (const group of [[], ['probe2']]) {
        const e = { id: 'probe', knots: 6, pattern, intents: { 'plea:1': { text: { F: { jp: 'たすけて', en: 'Help' } } } } };
        C.enemies.probe2 = { id: 'probe2', knots: 4, pattern: ['heat', 'shroud'] };
        const s = camp({ comp });
        const st = L.init(e, s, { group });
        // a little history so Heat, mist and gathering are on the stage
        st.foes.forEach((f) => { f.heat = 1; });
        if (pattern[0] === 'shroud') st.shroud = true;
        if (comp) st.harmony = st.harmonyMax;
        st.pc = st.max - 2;
        for (const card of L.responses(st, words(s))) {
          if (card.disabled) continue;
          const before = JSON.stringify(st);
          const pv = L.previewAct(st, card);
          t.ok(JSON.stringify(st) === before, 'previewing ' + card.id + ' changes nothing');
          const real = L.playerAct(L.snapshot(st), card, ok, e);
          t.eq(strip(pv), strip(real), 'the preview of ' + card.id + ' is what it does (' + pattern.join('/') + ', ' + (comp || 'alone') + (group.length ? ', group' : '') + ')');
          cases++;
        }
      }
    }
  }
  t.ok(cases > 60, 'checked ' + cases + ' cards');
  // a card that does nothing here says so: healing at full resolve
  {
    const s = camp({});
    const st = L.init({ id: 'probe', knots: 4, pattern: ['strike'] }, s, {});
    const heal = L.responses(st, words(s)).find((c) => c.word && c.word.tags.indexOf('heal') >= 0);
    const pv = L.previewAct(st, heal);
    t.ok(pv.fx.some((f) => f.t === 'heal' && f.gain === 0), 'healing at full resolve: the preview shows no gain');
    const wind = L.responses(st, words(s)).find((c) => c.word && c.word.tags.indexOf('wind') >= 0);
    const pw = L.previewAct(st, wind);
    t.ok(!pw.fx.length && !pw.answered.some(Boolean), 'wind with no mist and no gust: no effect, no answer');
  }
};
