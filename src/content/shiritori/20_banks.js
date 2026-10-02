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
      starters: [
        "w.atama", "w.eki", "w.ika", "w.niku", "w.kasa", "w.tokei", "w.chou", "w.nooto",
        "w.kuma", "w.tanuki", "w.shika", "w.fuku", "w.kusa", "w.kuruma", "w.tsuki", "w.shima",
        "w.uma", "w.yama",
      ] },
    { id: 'everyday', version: 1, levels: ['pocket', 'everyday'], target: 180, title: { en: 'Everyday words' },
      starters: [
        "w.ashi", "w.gomi", "w.bentou", "w.eki", "w.atama", "w.fue", "w.ika", "w.fooku",
        "w.tokei", "w.kao", "w.basu", "w.ito", "w.kasa", "w.buta", "w.kitte", "w.kani",
        "w.ha.leaf", "w.saifu", "w.boushi", "w.hasami", "w.chou", "w.keeki", "w.kuma", "w.ie",
        "w.oka", "w.fuku", "w.rubii", "w.rajio", "w.isu", "w.minato", "w.kusa", "w.uta",
        "w.hashi.bridge", "w.kami.hair", "w.ginkou", "w.tanuki", "w.kuruma", "w.tsukue", "w.senaka", "w.niku",
        "w.zerii", "w.shio", "w.juusu", "w.nooto", "w.hoshi", "w.nami", "w.ningyou", "w.tsuki",
        "w.shima", "w.e", "w.shika", "w.rousoku", "w.ishi", "w.nezumi", "w.suitou", "w.yuki",
        "w.uma", "w.mushi", "w.tegami", "w.taiyou", "w.ki", "w.yama", "w.okashi", "w.umi",
        "w.zou", "w.sushi", "w.mimi", "w.zutsuu", "w.ushi", "w.mizuumi",
      ] },
    { id: 'extended', version: 1, levels: ['pocket', 'everyday', 'extended'], target: 360, title: { en: 'Extended words' },
      starters: [
        "w.bentou", "w.ami", "w.ashi", "w.denki", "w.hato", "w.ika", "w.fooku", "w.fune",
        "w.atama", "w.butai", "w.buranko", "w.buta", "w.baketsu", "w.basu", "w.kagi", "w.hatake",
        "w.banana", "w.himo", "w.fue", "w.moufu", "w.kao", "w.kani", "w.kimono", "w.gitaa",
        "w.kasa", "w.kitte", "w.saba", "w.ha.leaf", "w.hi", "w.kabu", "w.mayu", "w.budou",
        "w.gomi", "w.boushi", "w.eki", "w.ito", "w.iruka", "w.fuku", "w.hone", "w.kama",
        "w.koi", "w.hako", "w.futa", "w.buutsu", "w.isu", "w.kugi", "w.ike", "w.hana.flower",
        "w.imo", "w.ie", "w.naifu", "w.rajio", "w.wani", "w.nuno", "w.seetaa", "w.kusa",
        "w.te", "w.soba", "w.chou", "w.hasami", "w.haburashi", "w.hagaki", "w.keito", "w.oka",
        "w.inku", "w.kane", "w.koma", "w.koohii", "w.hiyoko", "w.geta", "w.enpitsu", "w.juusu",
        "w.negi", "w.koke", "w.sakana", "w.jagaimo", "w.tsue", "w.saifu", "w.shio", "w.zarigani",
        "w.piano", "w.fukurou", "w.izumi", "w.hashi.bridge", "w.hikouki", "w.kooto", "w.onaka", "w.maku",
        "w.kitsune", "w.kuma", "w.rubii", "w.kinoko", "w.kata", "w.kutsu", "w.karasu", "w.usagi",
        "w.oke", "w.suna", "w.kumo.cloud", "w.tsukue", "w.toufu", "w.fuutou", "w.kagami", "w.hayashi",
        "w.houki", "w.koto", "w.rouka", "w.masuku", "w.megane", "w.kuruma", "w.takushii", "w.neko",
        "w.kutsushita", "w.matsu", "w.nasu", "w.uwagi", "w.sake", "w.tana", "w.shimo", "w.e",
        "w.gakkou", "w.kami.hair", "w.hoshi", "w.kaki", "w.minato", "w.saka", "w.niku", "w.mune",
        "w.numa", "w.tokei", "w.reizouko", "w.manaita", "w.nimotsu", "w.retasu", "w.yagi", "w.take",
        "w.tsuna", "w.momo", "w.gekijou", "w.kozutsumi", "w.inoshishi", "w.keeki", "w.nooto", "w.senaka",
        "w.rousoku", "w.tane", "w.shima", "w.toudai", "w.taiko", "w.shita", "w.shatsu", "w.risu",
        "w.ginkou", "w.nami", "w.ishi", "w.kuki", "w.poketto", "w.shika", "w.ryukku", "w.yane",
        "w.uma", "w.zerii", "w.tako.kite", "w.uta", "w.tetsu", "w.gyuunyuu", "w.nezumi", "w.koshi",
        "w.taki", "w.posuto", "w.suika", "w.torakku", "w.ne", "w.yama", "w.houchou", "w.origami",
        "w.monosashi", "w.tanuki", "w.ruuretto", "w.yuka", "w.ishou", "w.semi", "w.mushi", "w.tsuki",
        "w.sukaato", "w.koshou", "w.sumi", "w.nashi", "w.yuki", "w.tomato", "w.ningyou", "w.tatami",
        "w.okashi", "w.ki", "w.satou", "w.tegami", "w.sushi", "w.suitou", "w.umi", "w.ushi",
        "w.taiyou", "w.mimi", "w.zasshi", "w.zou", "w.mizuumi", "w.zutsuu",
      ] },
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
