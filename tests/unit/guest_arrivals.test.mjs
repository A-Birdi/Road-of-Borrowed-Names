// RBN-QA-092 (Agnes 6334290400, 6334506153; Local CL-175; Cloud CC-094, CC-095): the guests who are in an encounter
// from its start, each with the words they come in with (`RB.encounter.guestArrivals`, said once by the battle screen
// after the creature's intro: tests/e2e/guest_arrivals.mjs). Here: every guest the game has with an authored arrival
// gives exactly that line, in the encounter's order; a guest who has left, one with no words of arrival, and anyone who
// is not a guest give nothing; reading them changes nothing in the encounter.
import { load } from '../lib/load.mjs';

const GUESTS = {
  'yn.wander_aki': ['g:aki', /Nobody muddies my water/],
  'ko.wander_ao': ['g:ao', /That's my basket/],
  'ko.wander_kihei': ['g:kihei', /Jellies come in with the tide/],
  'cr.wander_oshika': ['g:oshika', /Don't you turn the shrine path round/],
  'cr.wander_ginji': ['g:ginji', /Blankpage moths/],
  'kr.wander_seiji': ['g:seiji', /A sandal tsukumogami/],
  'kr.wander_kikyo': ['g:kikyo', /Keep away from my scroll/],
  'mp.wander_gonta': ['g:gonta', /A thing made of woodblocks/],
  'mp.wander_hayashi': ['g:hayashi', /A crowd's gathering/],
  'fx.guest': ['g:porter', /won't let go of my cargo/],
};

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const C = RB.content, E = RB.encounter;
  const camp = () => { const s = RB.state.newCampaign({ difficulty: 'normal' }); s.id = 'arrive-test'; s.comp = null; s.words = ['mizu', 'kaze', 'nawa']; return s; };

  // every encounter with a guest who has an authored arrival is one of these (none is missed, none is added)
  const authored = Object.keys(C.encounters).filter((id) => (C.encounters[id].actors || []).some((a) => (a.side || 'guest') === 'guest' && a.lines && a.lines.arrive)).sort();
  t.ok(JSON.stringify(authored) === JSON.stringify(Object.keys(GUESTS).sort()), 'the encounters whose guests have an authored arrival: ' + authored.join(', '));
  for (const id in GUESTS) {
    const [aid, re] = GUESTS[id];
    const st = E.begin(id, camp());
    const before = JSON.stringify(st);
    const a = E.guestArrivals(st);
    t.ok(a.length === 1 && a[0].aid === aid && re.test(a[0].en) && a[0].en === C.encounters[id].actors[0].lines.arrive.en, id + ': ' + aid + '\'s arrival, as authored (' + JSON.stringify(a) + ')');
    t.ok(JSON.stringify(st) === before, id + ': reading it changes nothing in the encounter');
  }

  // none of them is lost to the log: the exchange log keeps its last five lines (eight in a group;
  // src/ui/80_combat.js logLine), and no encounter brings more guests with words of arrival than that
  {
    const most = Math.max(...Object.keys(C.encounters).map((id) => (C.encounters[id].actors || []).filter((a) => (a.side || 'guest') === 'guest' && a.lines && a.lines.arrive).length));
    t.ok(most >= 1 && most <= 5, 'the most arrivals any encounter brings (' + most + ') fit in the log\'s five lines');
  }

  // the encounter's order; a guest who has left, one with no words of arrival, and anyone not a guest give nothing
  {
    const def = { id: 'zz.arrive', name: { jp: '{二人|ふたり}', en: 'Two' }, lead: { enemy: 'ko.jelly', knots: 2 },
      actors: [
        { aid: 'g:one', side: 'guest', name: { jp: 'イチ', en: 'Ichi' }, hp: 3, agenda: { wants: 'pass' }, lines: { arrive: { jp: '{一|いち}', en: 'Ichi first.' } } },
        { aid: 'n:x', side: 'neutral', name: { jp: 'エックス', en: 'X' }, lines: { arrive: { jp: '{中|なか}', en: 'Not a guest.' } } },
        { aid: 'g:quiet', side: 'guest', name: { jp: 'シズ', en: 'Shizu' }, hp: 3, agenda: { wants: 'pass' }, lines: { act: { jp: '{静|しず}か', en: 'Quiet.' } } },
        { aid: 'g:two', side: 'guest', name: { jp: 'ニ', en: 'Ni' }, hp: 3, agenda: { wants: 'pass' }, lines: { arrive: { jp: '{二|に}', en: 'Ni second.' } } },
        { aid: 'g:gone', side: 'guest', name: { jp: 'サン', en: 'San' }, hp: 3, agenda: { wants: 'pass' }, lines: { arrive: { jp: '{三|さん}', en: 'San, who has left.' } } },
      ],
      conclusions: [{ id: 'won', when: { settled: 'all' }, result: 'win', text: { en: 'Done.' } }] };
    const st = E.begin(def, camp());
    E.actorOf(st, 'g:gone').left = true;
    const a = E.guestArrivals(st);
    t.ok(JSON.stringify(a.map((x) => x.en)) === JSON.stringify(['Ichi first.', 'Ni second.']), 'two guests in order; the one who left, the quiet one and the neutral give nothing (' + JSON.stringify(a) + ')');
    t.ok(E.guestArrivals({ actors: [] }).length === 0 && E.guestArrivals({}).length === 0, 'no actors: nothing');
  }

  // Kihei's victory: he has moved a little way off and waits by the water (no claim that he vanished); his flag as before
  {
    const c = C.encounters['ko.wander_kihei'].conclusions;
    t.ok(c.length === 1 && c[0].id === 'won' && c[0].text.en === 'The jelly drifts off. The sailor\'s footprints are filling with water; he has moved a little way off, and waits at the water\'s edge.' && !c[0].text.jp && JSON.stringify(c[0].flags) === '{"ko_kihei_met":true}',
      'Kihei\'s victory wording, English only, with ko_kihei_met as before (' + JSON.stringify(c[0]) + ')');
  }
};
