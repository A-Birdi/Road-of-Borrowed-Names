/* Companion shiritori: the three fixed word banks (Practice addendum §9.3, §11).
 * Each bank is every word whose lexicalLevel is in its band, so Pocket ⊆ Everyday ⊆
 * Extended by construction. A bank is built strictly (the full §11.2 entry contract;
 * authored head/tail must equal the house rule) and registered with RB.shiritori.addBank.
 * Starters are certified openings (docs/practice/shiritori_banks/<bank>.md): at least
 * four safe initial responses and no forced terminal win within two plies; they are
 * checked again by tests/unit/shiritori_banks.test.mjs and tools/shiritori_audit.mjs.
 * A bank with fewer repeat-groups than its target is marked incomplete, never padded. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const SH = RB.shiritori;
  if (!SH || !SH.words) return;
  const BANDS = [
    { id: 'pocket', version: 1, levels: ['pocket'], target: 72, title: { en: 'Pocket words' },
      starters: ["w.ashi", "w.boushi", "w.fuku", "w.ha.leaf", "w.hashi.bridge", "w.hoshi", "w.ika", "w.ishi", "w.kasa", "w.kusa", "w.mushi", "w.nashi", "w.niku", "w.saka", "w.shika", "w.sushi", "w.tokei", "w.ushi"] },
    { id: 'everyday', version: 1, levels: ['pocket', 'everyday'], target: 180, title: { en: 'Everyday words' },
      starters: ["w.ashi", "w.atama", "w.banana", "w.bentou", "w.boushi", "w.buta", "w.butai", "w.eki", "w.fooku", "w.fue", "w.gakkou", "w.gomi", "w.ha.leaf", "w.hasami", "w.ika", "w.ito", "w.kao", "w.kasa", "w.keeki", "w.moufu"] },
    { id: 'extended', version: 1, levels: ['pocket', 'everyday', 'extended'], target: 360, title: { en: 'Extended words' },
      starters: ["w.ami", "w.ashi", "w.atama", "w.baketsu", "w.banana", "w.basu", "w.bentou", "w.buta", "w.butai", "w.denki", "w.fooku", "w.fue", "w.fune", "w.gake", "w.hako", "w.hato", "w.himo", "w.hitsuji", "w.honoo", "w.ika"] },
  ];
  SH.BANDS = {};
  SH.bankProblems = [];
  for (const d of BANDS) {
    const entries = SH.words().filter((e) => d.levels.indexOf(e.lexicalLevel) >= 0);
    const b = SH.addBank({ id: d.id, version: d.version, strict: true, title: d.title, entries, starters: d.starters, meta: { target: d.target, levels: d.levels } });
    SH.BANDS[d.id] = { id: d.id, title: d.title, version: d.version, target: d.target, groups: b.groupCount, complete: b.groupCount >= d.target, hash: b.hash, starters: d.starters.length };
    b.problems.forEach((p) => SH.bankProblems.push(d.id + ': ' + p));
  }
})();
