// Sora's description, colour-neutral (Agnes 6780684863 and 6803414018; Local CL-766; Cloud CC-544 E): the small bird's
// Company-page line said "brown-and-cream" whichever look was chosen (Brown, Gray or Muted cream). Now:
//  1. the bird's line is exactly "A small road bird. Hops rather than walks, and never strays far from a good perch.",
//     with no colour word in it;
//  2. its name, reading and label are as before, and its three looks keep their order and their names;
//  3. the other animals' lines are as before;
//  4. the line is the species' own, never stored: meeting, choosing a look, selecting and a save read back keep the
//     record as before, with no description in it.
// On screen (each look chosen with its own button, its label and preview, the same line) is tests/e2e/sora_about.mjs.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const P = RB.pets;
  const LINE = 'A small road bird. Hops rather than walks, and never strays far from a good perch.';
  const COLOURS = /\b(brown|gr[ae]y|cream|white|black|red|blue|green|yellow|ginger|tan|dark|pale)\b/i;

  // ---- 1. the line
  const bird = P.species('bird');
  t.eq(bird.about.en, LINE, '1 the bird\'s line, exactly');
  t.ok(!COLOURS.test(bird.about.en), '1 no colour word in it');

  // ---- 2. the rest of the bird as before
  t.eq([bird.name, bird.reading, bird.label.en, bird.label.jp], ['Sora', 'ソラ', 'Small bird', '{小鳥|ことり}'], '2 its name, reading and label');
  t.eq(RB.petArt.LOOK_ORDER.bird, ['brown', 'gray', 'cream'], '2 its three looks, in order');
  t.eq(RB.petArt.LOOK_ORDER.bird.map((k) => RB.petArt.LOOKS.bird[k].en), ['Brown', 'Gray', 'Muted cream'], '2 named Brown, Gray and Muted cream');

  // ---- 3. the other animals
  t.eq(['cat', 'dog', 'tanuki'].map((k) => P.species(k).about.en), [
    'Keeps to dry corners and warm stones. Watches everything with half-closed eyes and pretends not to.',
    'Used to travellers and glad of them. Walks at your pace, sits when you stop, and checks that everyone is still here.',
    'Round, earnest and curious. Copies whatever the people around it are doing, a moment too late.',
  ], '3 the cat\'s, the dog\'s and the tanuki\'s lines as before');

  // ---- 4. never stored
  const s = RB.state.newCampaign({ edition: 2 });
  P.meet(s, 'bird');
  const fresh = JSON.stringify(P.record(s, 'bird'));
  const seen = [];
  for (const lk of RB.petArt.LOOK_ORDER.bird) {
    P.setLook(s, 'bird', lk);
    P.select(s, 'bird');
    seen.push([P.record(s, 'bird').look, P.active(s)]);
  }
  t.eq(seen, [['brown', 'bird'], ['gray', 'bird'], ['cream', 'bird']], '4 each look chosen and the bird selected, as before');
  const back = RB.save.migrate(JSON.parse(JSON.stringify(s)));
  const text = JSON.stringify(back.company);
  t.ok(P.record(back, 'bird') && P.record(back, 'bird').look === 'cream' && P.active(back) === 'bird' && !/road bird|perch|brown-and-cream/.test(text) && !/road bird|perch/.test(fresh),
    '4 the record and the choice survive a save read back, and no description is stored');
};
