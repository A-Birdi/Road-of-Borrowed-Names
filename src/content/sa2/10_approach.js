/* The last chapter's road in a twelve-chapter journey (expansion P14; docs/future/work/P14_INTEGRATION.md; plan
 * 10_STORY.md §6a, sealed S15): the land feels the Hush more heavily near its source. Presentation and one short scene
 * only; the canon events of the chapter are unchanged, and six-chapter journeys see nothing new.
 *
 *  - colour drains map by map (`ambient.drain`, the renderer's final grade: src/engine/60_render.js), from the Archive
 *    road to the Heart; the Last Lamp Hut keeps its warmth; once the Hush is settled the colour is back;
 *  - lanterns' name slips peel off and drift uphill on the road and at the camp (weather `names`);
 *  - the score thins (src/audio/38z_songs_sa2.js): the Archive road's tune with its ensemble taken away, then at the gate
 *    and in the Reading Room a drone with the road motif under it; inside, the Archive's own themes as always;
 *  - at the gate, for a few lines, the companion's voice is hushed, and comes back when you call their name
 *    (sa2.hushed; never permanent, nobody harmed, no separation). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const BEFORE = 'ed>=2&!sa_hush_down';
  const on = () => { const s = RB.game && RB.game.s; return !!(s && RB.state.test(s, BEFORE)); };
  // the map's own ambience, read through: drained (and its weather replaced) only before the Hush is settled
  function drain(id, level, weather) {
    const m = C.maps[id];
    if (!m) return;
    const base = m.ambient || {};
    m.ambient = {
      get weather() { return on() && weather ? weather : base.weather; },
      get tint() { return base.tint; },
      get dark() { return base.dark; },
      get darkCol() { return base.darkCol; },
      get playerLight() { return base.playerLight; },
      get sea() { return base.sea; },
      get drain() { return on() ? level : 0; },
    };
  }
  // the road up from the valley, the camp, then the Archive room by room (the hut stays warm)
  drain('sa.road', 0.2, 'names');
  drain('sa.camp', 0.3, 'names');
  drain('sa.gate', 0.45);
  drain('sa.reading', 0.55);
  drain('sa.stacks', 0.65);
  drain('sa.conduits', 0.72);
  drain('sa.memories', 0.6);
  drain('sa.study', 0.78);
  drain('sa.heart', 0.85);
  C.sa2Drain = { 'sa.road': 0.2, 'sa.camp': 0.3, 'sa.gate': 0.45, 'sa.reading': 0.55, 'sa.stacks': 0.65, 'sa.conduits': 0.72, 'sa.memories': 0.6, 'sa.study': 0.78, 'sa.heart': 0.85 };

  // the score, thinning
  const music = (id, song, cond) => { const m = C.maps[id]; if (!m) return; const cur = Array.isArray(m.music) ? m.music : m.music ? [{ id: m.music }] : []; m.music = [{ if: cond, id: song }].concat(cur); };
  music('sa.road', 'sa_thin', BEFORE + '&!sa_descent');
  music('sa.gate', 'sa_drone', BEFORE);
  music('sa.reading', 'sa_drone', BEFORE);

  // the hushed voice, at the gate, right after its first sight (with a companion; never while they are away)
  const gate = C.maps['sa.gate'];
  if (gate) gate.onEnter = (gate.onEnter || []).concat([{ scene: 'sa2.hushed', if: BEFORE + '&seen.sa.gate_first&!sa2_voice_back&comp' }]);

  // calling the companion back by name: a reading step, their name among look-alikes (F and E in kana with the
  // English; I and A with the near ones closer)
  const T = (jp, en) => ({ jp, en });
  const ch = (o) => Object.assign({ kind: 'choose' }, o);
  const NAME = {
    nao: ['ナオ', ['メオ', 'ナホ'], ['ナヲ', 'ノオ']],
    mio: ['ミオ', ['シオ', 'ミヲ'], ['ミォ', 'ニオ']],
    ren: ['レン', ['レソ', 'しン'], ['ソン', 'レシ']],
    suzu: ['スズ', ['ヌズ', 'スヅ'], ['ヌス', 'ズス']],
  };
  for (const [who, [ok, low, high]] of Object.entries(NAME)) {
    const item = 'c:sa2_name_' + who;
    const opts = (ws, why) => [{ jp: ok, ok: true }].concat(ws.map((w) => ({ jp: w, ok: false, why: { en: why } })));
    const prompt = { en: 'Call their name. Which is it?' };
    C.challenges['sa2.name_' + who] = { title: T('{名前|なまえ} を {呼|よ}ぶ', 'Calling their name'), tiers: {
      F: [ch({ item, prompt, options: opts(low.slice(0, 1), 'A look-alike: look at each stroke.') })],
      E: [ch({ item, prompt, options: opts(low, 'A look-alike: look at each stroke.') })],
      I: [ch({ item, prompt, options: opts(high, 'Close, but not their name.') })],
      A: [ch({ item, prompt, options: opts(low.concat(high).slice(0, 3), 'Close, but not their name.') })],
    } };
  }
})(RB.content);
