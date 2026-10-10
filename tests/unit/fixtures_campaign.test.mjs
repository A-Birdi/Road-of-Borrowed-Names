// Older saves meet the expansion (playbook P02, S4 and S7; decisions F-01, F-02, C-54): campaigns written by the browser
// campaign test (tests/fixtures/campaign/) are loaded the way a save made before the expansion would be (its edition,
// records, streams and chapter key removed). Nothing they held may change; they stay six-chapter; until the edition
// ships none is an "old edition" save; and once it ships a finished one still begins New Game+ through the one carryover.
import { load } from '../lib/load.mjs';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'campaign');
const NEW = ['edition', 'records', 'rng', 'chapterKey'];

export default async (t) => {
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const E = RB.edition;
  const files = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();
  t.ok(files.length >= 3, 'the campaign fixtures are present (' + files.length + ')');
  for (const f of files) {
    const saved = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
    const old = JSON.parse(JSON.stringify(saved));
    for (const k of NEW) delete old[k];
    t.eq(RB.save.validate(old), [], f + ': an older save without the expansion\'s fields is valid');
    const before = JSON.stringify(old);
    const m = RB.save.migrate(JSON.parse(before));
    t.ok(m.edition === 1 && m.records && m.records.found && m.rng && m.rng.n, f + ': it loads as the six-chapter edition with empty records');
    const back = JSON.parse(JSON.stringify(m));
    for (const k of NEW) delete back[k];
    const was = JSON.parse(before);
    for (const k of Object.keys(was)) t.eq(JSON.stringify(back[k]), JSON.stringify(was[k]), f + ': ' + k + ' is exactly as it was');
    t.eq(E.number(m), was.chapter, f + ': it still shows as Chapter ' + was.chapter);
    t.ok(!E.isOld(m), f + ': until the edition ships it is an ordinary save');
    t.eq(JSON.stringify(RB.save.migrate(JSON.parse(JSON.stringify(m)))), JSON.stringify(m), f + ': loading it again changes nothing');
    // the save as it was written loads unchanged too: records added since are only added, empty
    const cur = RB.save.migrate(JSON.parse(JSON.stringify(saved)));
    const added = Object.keys(cur).filter((k) => !(k in saved));
    const fresh = RB.state.newCampaign();
    for (const k of added) t.eq(JSON.stringify(cur[k]), JSON.stringify(fresh[k]), f + ': ' + k + ', added since it was written, is added empty');
    for (const k of added) delete cur[k];
    t.eq(JSON.stringify(cur), JSON.stringify(saved), f + ': everything it held loads unchanged');
    // once the edition ships (A04), an edition-1 save is shown as such; a finished one begins New Game+ (C-54, K9)
    E._ship(true);
    try {
      t.ok(E.isOld(m) && E.forNew() === 2, f + ': once shipped, it is an edition-1 save and new journeys are twelve-chapter');
      if (m.flags.postgame) {
        const n = RB.ngplus.carry(m);
        t.ok(n.edition === 2 && n.ngplus === (m.ngplus || 0) + 1 && n.chapter === 0 && !n.flags.postgame, f + ': its New Game+ begins the twelve-chapter edition from the start');
        t.eq(JSON.stringify(n.learn.items), JSON.stringify(m.learn.items), f + ': and carries the learning record unchanged');
        t.ok(m.flags.postgame && m.chapter === was.chapter, f + ': the finished save itself is not touched');
      }
    } finally { E._ship(false); }
  }
};
