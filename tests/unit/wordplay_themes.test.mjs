// Shiritori's themed word sets (expansion P06, C12 "Shiritori v2"; src/engine/73_wordplay.js addTheme): a theme is
// offered only when its condition holds; its bank is built from the installed banks' entries for its words and no
// others, frozen like the journey bank; a themed game is recorded with the theme (made on first play), never as a
// stage, and loading or reading a companion's record never adds the theme record.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const SH = RB.shiritori, WP = RB.wordplay;
  const pocket = SH.bank('pocket');
  t.ok(!!pocket, 'the game\'s pocket bank is installed');
  // a test theme of thirty pocket words
  const words = pocket.entries.slice(0, 30).map((e) => e.forms[0]);
  WP.addTheme('t_test', { title: { en: 'Test words', jp: 'テスト の {言葉|ことば}' }, note: 'a test set', when: (s) => !!(s.flags && s.flags.tt_open), words });
  const fresh = () => { const s = RB.state.newCampaign({ edition: 2 }); s.map = 'sb.inn_room'; s.comp = 'mio'; s.chapter = 2; s.id = 'theme-test'; RB.game.s = s; return s; };

  const s = fresh();
  t.ok(!WP.themes(s).some((x) => x.id === 't_test'), 'closed until its condition holds');
  t.eq(WP.normSetup(s, { band: 'theme:t_test' }).band, 'pocket', 'a closed theme cannot be chosen');
  t.eq(WP.bankFor(s, { band: 'theme:t_test' }).code, 'closed', 'and builds no bank');
  s.flags.tt_open = true;
  t.ok(WP.themes(s).some((x) => x.id === 't_test'), 'open once it holds');
  t.eq(WP.normSetup(s, { band: 'theme:t_test' }).band, 'theme:t_test', 'then it can be chosen');
  const bf = WP.bankFor(s, { band: 'theme:t_test', format: 'competitive' });
  const want = new Set(words.map((w) => SH.norm(w)));
  t.ok(bf.ok && bf.kind === 'theme' && bf.bank.entries.length > 0 && bf.bank.entries.every((e) => e.forms.concat(SH.readingsOf(e)).some((f) => want.has(SH.norm(f)))), 'its bank holds its words and no others (' + (bf.bank ? bf.bank.entries.length : 0) + ')');
  t.eq(WP.BAND['theme:t_test'].en, 'Test words', 'named for the table and the records');

  // a game: started, conceded, recorded with the theme
  t.ok(!('themes' in WP.rec(s, 'mio')), 'a companion\'s record has no theme record before a themed game');
  const st = WP.start(s, { band: 'theme:t_test', format: 'competitive', level: 'casual' }, { first: 'cpu' });
  t.ok(st && st.ok !== false, 'a themed game starts');
  const done = WP.concede(s);
  t.ok(!!done, 'and ends');
  const r = WP.rec(s, 'mio');
  t.ok(r.themes && r.themes.t_test && r.themes.t_test.played === 1 && r.themes.t_test.lost === 1, 'recorded with the theme: played 1, lost 1');
  t.eq(Object.keys(r.stages).length, 0, 'never a stage');
};
