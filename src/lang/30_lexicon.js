/* RB.lex — lexicon API and core entries.
 * Entry: {w, r, m, pos, lv, n?, alt?, ro?, fic?, src:[…]}
 *   w  written form (kanji/kana), r reading (kana; = w for kana-only words)
 *   m  concise meaning, n usage note, alt meanings in other contexts
 *   ro romaji override (e.g. こんにちは → konnichiwa), fic true for invented
 *   (fictional) terms, which must also be labelled in m.
 * m / n / alt are "mixed text": English with {漢字|かんじ} ruby for any kanji.
 * Content files add words with RB.lex.add([...], 'source-tag'). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.lex = (function () {
  'use strict';
  const K = RB.kana;
  const POS = new Set([
    'n', 'pn', 'v1', 'v5u', 'v5k', 'v5g', 'v5s', 'v5t', 'v5n', 'v5b', 'v5m', 'v5r', 'v5k-s', 'v5aru',
    'vs', 'vs-i', 'vk', 'adj-i', 'adj-ii', 'adj-na', 'adv', 'prt', 'conj', 'int', 'exp', 'ctr', 'suf', 'pref', 'aux', 'name',
  ]);
  const LV = new Set(['F', 'E', 'I', 'A']);
  const byKey = new Map();
  const bySurf = new Map();
  const byRead = new Map();
  const order = [];
  const conflictList = [];
  const problemList = [];

  const key = (w, r) => w + '\u0000' + K.toHira(r);
  const push = (map, k, e) => {
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(e);
  };

  function problemsOf(e) {
    const p = [];
    if (!e || typeof e !== 'object') return ['not an object'];
    if (!e.w) p.push('missing w');
    if (!e.m) p.push('missing m');
    if (!POS.has(e.pos)) p.push('bad pos ' + e.pos);
    if (!LV.has(e.lv)) p.push('bad lv ' + e.lv);
    if (e.r && !K.isKanaString(e.r)) p.push('reading not kana: ' + e.r);
    if (!e.r && K.hasKanji(e.w)) p.push('missing reading for ' + e.w);
    return p;
  }

  /* add(entries, sourceTag) — identical w+r with the same pos merge (a new
   * meaning becomes an alt); a different pos is recorded as a conflict and the
   * existing entry is kept. Returns the number of new entries. */
  function add(list, src) {
    src = src || 'unknown';
    let n = 0;
    for (const raw of list || []) {
      const probs = problemsOf(raw);
      if (probs.length) {
        problemList.push({ src, w: raw && raw.w, problems: probs });
        if (!raw || !raw.w || !raw.m) continue;
      }
      const e = Object.assign({}, raw);
      e.r = e.r || e.w;
      if (e.alt && !Array.isArray(e.alt)) e.alt = [e.alt];
      const k = key(e.w, e.r);
      const old = byKey.get(k);
      if (old) {
        if (e.pos && old.pos !== e.pos) {
          conflictList.push({ w: e.w, r: e.r, existing: { pos: old.pos, m: old.m, src: old.src.slice() }, incoming: { pos: e.pos, m: e.m, src } });
          continue;
        }
        const alts = old.alt ? old.alt.slice() : [];
        [e.m].concat(e.alt || []).forEach((m) => {
          if (m && m !== old.m && !alts.includes(m)) alts.push(m);
        });
        if (alts.length) old.alt = alts;
        if (!old.n && e.n) old.n = e.n;
        if (!old.src.includes(src)) old.src.push(src);
        continue;
      }
      e.src = [src];
      byKey.set(k, e);
      push(bySurf, e.w, e);
      push(byRead, K.toHira(e.r), e);
      order.push(e);
      n++;
    }
    return n;
  }
  function get(w, r) {
    if (r == null) {
      const l = bySurf.get(w);
      return l ? l[0] : null;
    }
    return byKey.get(key(w, r)) || null;
  }
  const bySurface = (w) => (bySurf.get(w) || []).slice();
  const byReading = (r) => (byRead.get(K.toHira(r)) || []).slice();
  const all = () => order.slice();
  const conflicts = () => conflictList.slice();
  const problems = () => problemList.slice();
  function stats() {
    const byLevel = { F: 0, E: 0, I: 0, A: 0 };
    const byPos = {};
    order.forEach((e) => {
      byLevel[e.lv] = (byLevel[e.lv] || 0) + 1;
      byPos[e.pos] = (byPos[e.pos] || 0) + 1;
    });
    return { total: order.length, byLevel, byPos };
  }
  // Headword markup with furigana, e.g. {食|た}べる
  const markup = (e) => (RB.jp && RB.jp.rubyize ? RB.jp.rubyize(e.w, e.r) : e.w);

  /* Table format, one entry per line:  w|r|pos|lv|meaning|note|alt1 ; alt2
   * r may be empty for kana-only words. Lines starting with # are comments. */
  function parseTable(text) {
    const out = [];
    text.split('\n').forEach((line) => {
      line = line.trim();
      if (!line || line[0] === '#') return;
      const f = line.split('|');
      const e = { w: f[0], r: f[1] || f[0], pos: f[2], lv: f[3], m: f[4] };
      if (f[5]) e.n = f[5];
      if (f[6]) e.alt = f[6].split(' ; ').map((s) => s.trim()).filter(Boolean);
      out.push(e);
    });
    return out;
  }

  return { POS, LEVELS: LV, add, get, bySurface, byReading, all, conflicts, problems, problemsOf, stats, markup, parseTable };
})();

/* ---- core entries ------------------------------------------------------- */
(function () {
  'use strict';
  const T = RB.lex.parseTable;
  const core = [];

  // Particles and particle combinations
  core.push(...T(`
は||prt|F|topic marker ("as for …")|Written は, pronounced wa.
が||prt|F|subject marker|Between two clauses it means "but".|but (joining two clauses)
を||prt|F|object marker|Written を, pronounced o.
に||prt|F|to; at (a time); in/at (where something is)|Marks a destination, a point in time, where something exists, or the person who receives something.|by (the doer, in a passive sentence) ; for (purpose: verb stem + に + a verb of going)
で||prt|F|at/in (where an action happens); by/with (means)||because of (cause) ; as a group of (e.g. {三人|さんにん}で)
へ||prt|F|to, towards (direction)|Written へ, pronounced e.
と||prt|F|and (joining nouns); with (together with)|Also marks a quotation: 「…」と{言|い}う.|when/if (natural result, after a verb)
も||prt|F|also, too|Replaces は, が or を.|even (emphasis) ; (with a negative) not … either
の||prt|F|'s; of (links nouns)|Also turns a clause into a noun, and softens questions in casual speech.|one (the one that …)
から||prt|E|from (a place or time)||because, so (after a clause)
まで||prt|E|until; as far as||even (emphasis)
や||prt|E|and (listing examples, not a complete list)
か||prt|F|question marker||or (between choices)
よ||prt|F|sentence ending: tells the listener something new|Can sound pushy if overused.
ね||prt|F|sentence ending: seeks agreement ("…, isn't it?")
よね||prt|E|sentence ending: "…, right?" (checking shared knowledge)
な||prt|E|sentence ending: casual emphasis or musing|After a dictionary-form verb, な is a blunt prohibition: {行|い}くな "don't go".
ぞ||prt|I|sentence ending: strong, rough emphasis|Casual; mostly used by men.
わ||prt|I|sentence ending: soft emphasis|In Tokyo speech a rising わ sounds feminine; in western Japan it is used by everyone.
って||prt|E|casual quotation marker (= と); "speaking of …" (= は)||(I heard) that … (hearsay)
けど||prt|E|but; although (casual)|Often left hanging at the end of a sentence to soften it.
けれど||prt|I|but, although
けれども||prt|I|but, although (a little more formal)
し||prt|I|and (what's more) — listing reasons
では||prt|E|at/in … (as a topic or contrast)|で + は. Pronounced dewa.|well then (formal, starting a sentence)
には||prt|E|to/at/in … (as a topic or contrast)|に + は. Pronounced niwa.
へは||prt|I|to … (as a topic or contrast)|へ + は. Pronounced ewa.
とは||prt|I|with … (as a topic); "… means" (defining)|と + は. Pronounced towa.
でも||prt|E|but (starting a sentence); even|After a noun it can also soften a suggestion: お{茶|ちゃ}でも "tea or something".|or something (softening a suggestion)
より||prt|E|than; (formal) from
だけ||prt|E|only; just
しか||prt|E|only (always with a negative verb)|{一|ひと}つしかない "there is only one".
ほど||prt|I|to the extent of; (not) as … as||about (approximately)
くらい||prt|E|about, approximately; to the extent that
ぐらい||prt|E|about, approximately (variant of くらい)
など||prt|E|and so on; such as
ばかり||prt|I|only, nothing but; just (done)
さえ||prt|A|even (emphasis)||(with ～ば) if only
こそ||prt|A|precisely, indeed (strong emphasis)
ながら||prt|I|while (doing)||although (formal)
たり||prt|I|doing things like … (listing actions)
とか||prt|I|things like; or (casual listing)
かな||prt|E|"I wonder …" (sentence ending)
かしら||prt|I|"I wonder …" (sentence ending, soft; mostly feminine)
っけ||prt|I|sentence ending: checking something you've half forgotten ("…, was it?")
ので||prt|I|because, since (softer than から)
のに||prt|I|even though (often with disappointment)||in order to (after a verb)
までに||prt|I|by (a deadline)
なら||prt|I|if (that is the case); as for
ずつ||prt|E|each; at a time
ものの||prt|A|although (it's true that …)
どころか||prt|A|far from; let alone
からこそ||prt|A|precisely because
ばかりか||prt|A|not only … but also
`));

  // Copula and auxiliary endings
  core.push(...T(`
だ||aux|F|is, am, are (plain copula)|The plain form of です.
です||aux|F|is, am, are (polite copula)|After an い-adjective, です only adds politeness: {高|たか}いです.
でした||aux|E|was, were (polite)|Used after nouns and な-adjectives, not い-adjectives ({高|たか}かったです, not {高|たか}いでした).
だった||aux|E|was, were (plain)
でしょう||aux|E|probably; "…, right?" (polite)
だろう||aux|I|probably; I wonder (plain)
じゃない||aux|E|is not (casual)|With rising intonation it can mean "…, isn't it?".
ではない||aux|E|is not (neutral or written)|Pronounced dewa nai.
じゃありません||aux|E|is not (polite)
ではありません||aux|E|is not (polite, a little more formal)
じゃなかった||aux|E|was not (casual)
ではなかった||aux|E|was not
じゃありませんでした||aux|E|was not (polite)
ではありませんでした||aux|E|was not (polite, more formal)
である||aux|A|is (formal written copula)
んです||aux|E|explanatory ending: "it's that …"|Spoken form of のです.
んだ||aux|E|explanatory ending, plain: "it's that …"
のです||aux|I|explanatory ending: "it's that …" (more formal)
のだ||aux|I|explanatory ending, plain written
ます||aux|E|polite verb ending|Attaches to the verb stem: {食|た}べます, {行|い}きます.
らしい||aux|I|apparently; seems (from what one hears)||typical of, like (after a noun: {子|こ}どもらしい)
みたい||aux|I|seems like; like (casual)
かねない||aux|A|could well (happen) — something bad; after a verb stem
`));

  // Demonstratives, pronouns, question words
  core.push(...T(`
これ||pn|F|this (one, near me)
それ||pn|F|that (one, near you)
あれ||pn|F|that (one, over there)
どれ||pn|F|which (one, of three or more)
この||pn|F|this … (before a noun)
その||pn|F|that … (before a noun; near you, or just mentioned)
あの||pn|F|that … over there (before a noun)|Also a hesitation filler: "um…".
どの||pn|F|which … (before a noun)
ここ||pn|F|here
そこ||pn|F|there (near you)
あそこ||pn|F|over there
どこ||pn|F|where
こちら||pn|E|this way; this side|Also a polite way to say "this person" or "we".
そちら||pn|E|that way; (polite) you, your side
あちら||pn|E|that way over there
どちら||pn|E|which (of two); (polite) where
こっち||pn|E|this way; here (casual)
そっち||pn|E|that way; there (casual)
あっち||pn|E|over there (casual)
どっち||pn|E|which (of two); which way (casual)
こう||adv|E|like this; this way
そう||adv|F|so; like that|そうです "that's right". After a verb stem or adjective, ～そう means "looks …".
ああ||adv|E|like that; ah! (exclamation)
どう||adv|F|how; what way
こんな||pn|E|this kind of
そんな||pn|E|that kind of|As a reply it can mean "oh no, not at all".
あんな||pn|E|that kind of (over there)
どんな||pn|E|what kind of
私|わたし|pn|F|I, me|The standard, neutral word for "I".
私|わたくし|pn|I|I (very formal)
僕|ぼく|pn|E|I, me (male or boyish, casual)
俺|おれ|pn|E|I, me (rough, casual; mostly male)
あなた||pn|F|you|Often avoided: people usually use the listener's name.
君|きみ|pn|E|you (casual, to equals or juniors)
彼|かれ|pn|E|he; boyfriend
彼女|かのじょ|pn|E|she; girlfriend
私たち|わたしたち|pn|E|we, us
皆|みんな|pn|F|everyone
皆|みな|pn|I|everyone (more formal)
皆さん|みなさん|pn|E|everyone (polite, addressing a group)
自分|じぶん|pn|I|oneself|In some speech, also "I".
あいつ||pn|I|that guy (rough)
何|なに|pn|F|what
何|なん|pn|F|what (before d/t/n sounds and counters)
誰|だれ|pn|F|who
どなた||pn|I|who (polite)
いつ||pn|F|when
どうして||adv|E|why; how
なぜ||adv|E|why (a little formal)
なんで||adv|E|why (casual)
どうやって||adv|E|how; by what means
いくつ||pn|E|how many; how old
いくら||pn|E|how much (price, amount)
どのくらい||adv|E|how much; how long; how far
誰か|だれか|pn|E|someone
何か|なにか|pn|E|something
どこか||pn|E|somewhere
いつか||adv|E|someday; some time
誰も|だれも|pn|E|nobody (with a negative)
何も|なにも|pn|E|nothing (with a negative)
`));

  // Numbers and counters (the coin is fictional)
  core.push(...T(`
一|いち|n|F|one
二|に|n|F|two
三|さん|n|F|three
四|よん|n|F|four|Also read し in some fixed words ({四月|しがつ}).
四|し|n|E|four (in some fixed words, e.g. {四月|しがつ})
五|ご|n|F|five
六|ろく|n|F|six
七|なな|n|F|seven|Also read しち.
七|しち|n|E|seven (e.g. {七月|しちがつ})
八|はち|n|F|eight
九|きゅう|n|F|nine|Also read く ({九時|くじ}).
九|く|n|E|nine (e.g. {九時|くじ}, {九月|くがつ})
十|じゅう|n|F|ten
十|とお|n|E|ten (things)
百|ひゃく|n|E|hundred
千|せん|n|E|thousand
万|まん|n|E|ten thousand
零|れい|n|I|zero (formal)
ゼロ||n|E|zero
一つ|ひとつ|n|F|one (thing)
二つ|ふたつ|n|F|two (things)
三つ|みっつ|n|F|three (things)
四つ|よっつ|n|F|four (things)
五つ|いつつ|n|F|five (things)
六つ|むっつ|n|E|six (things)
七つ|ななつ|n|E|seven (things)
八つ|やっつ|n|E|eight (things)
九つ|ここのつ|n|E|nine (things)
一人|ひとり|n|F|one person; alone
二人|ふたり|n|F|two people
人|ひと|n|F|person
人|にん|ctr|E|counter for people ({三人|さんにん})|{一人|ひとり} and {二人|ふたり} are irregular.
人|じん|suf|E|person from … (e.g. a nationality)
本|ほん|n|F|book|As a counter: long, thin objects (bottles, pens, roads).|counter for long, thin objects ({一本|いっぽん})
枚|まい|ctr|E|counter for flat things (paper, plates)
杯|はい|ctr|E|counter for cupfuls and bowlfuls|Sound changes: {一杯|いっぱい}, {三杯|さんばい}.
匹|ひき|ctr|E|counter for small animals|Sound changes: {一匹|いっぴき}, {三匹|さんびき}.
回|かい|ctr|E|times (occurrences)
時|じ|ctr|F|o'clock
分|ふん|ctr|E|minute(s)|Sound changes: {一分|いっぷん}, {三分|さんぷん}.
日|にち|ctr|E|day (counter; date)
日|ひ|n|E|day; sun
日|か|ctr|I|day (in dates such as {二日|ふつか} to {十日|とおか})
月|つき|n|E|moon; month
月|がつ|ctr|E|month (names of months: {一月|いちがつ})
月|げつ|ctr|I|month (duration: {一|いっ}か{月|げつ})
年|ねん|ctr|E|year
年|とし|n|E|year; age
番|ばん|ctr|E|number (in a series); one's turn
階|かい|ctr|E|floor, storey
個|こ|ctr|E|counter for small objects
冊|さつ|ctr|E|counter for books
度|ど|ctr|E|times; degrees
歳|さい|ctr|E|years old
灯貨|とうか|n|E|lantern coin (fictional currency of this world)|Fictional term invented for this game; not a real Japanese word.
`));

  // Time
  core.push(...T(`
今|いま|n|F|now
今日|きょう|n|F|today
明日|あした|n|F|tomorrow
昨日|きのう|n|F|yesterday
朝|あさ|n|F|morning
昼|ひる|n|E|noon; daytime
夜|よる|n|F|night; evening
晩|ばん|n|E|evening; night
夕方|ゆうがた|n|E|evening, dusk
毎日|まいにち|n|E|every day
毎朝|まいあさ|n|E|every morning
毎晩|まいばん|n|E|every evening
今朝|けさ|n|E|this morning
今晩|こんばん|n|E|this evening, tonight
今夜|こんや|n|I|tonight
今年|ことし|n|E|this year
去年|きょねん|n|E|last year
来年|らいねん|n|E|next year
週|しゅう|n|E|week
今週|こんしゅう|n|E|this week
先週|せんしゅう|n|E|last week
来週|らいしゅう|n|E|next week
今月|こんげつ|n|E|this month
先月|せんげつ|n|E|last month
来月|らいげつ|n|E|next month
時間|じかん|n|E|time; hour(s)
時|とき|n|E|time; when …|After a clause: ～とき "when …".
前|まえ|n|F|front; before; ago
後|あと|n|E|after; later; the rest
後ろ|うしろ|n|E|behind, back
午前|ごぜん|n|E|morning, a.m.
午後|ごご|n|E|afternoon, p.m.
半|はん|n|E|half; half past
さっき||adv|E|a little while ago
後で|あとで|adv|E|later
まだ||adv|F|still; (with a negative) not yet
もう||adv|F|already; (with a negative) not any more|With a number: more ({もう一|もうひと}つ "one more").
すぐ||adv|F|immediately, soon; right (nearby)
いつも||adv|F|always
時々|ときどき|adv|E|sometimes
たまに||adv|E|occasionally
最近|さいきん|n|E|recently, lately
昔|むかし|n|E|long ago; the old days
将来|しょうらい|n|I|the future (one's prospects)
未来|みらい|n|I|the future
過去|かこ|n|I|the past
春|はる|n|F|spring
夏|なつ|n|F|summer
秋|あき|n|F|autumn
冬|ふゆ|n|F|winter
季節|きせつ|n|E|season
間|あいだ|n|I|between; while; during
最初|さいしょ|n|E|first; beginning
最後|さいご|n|E|last; end
次|つぎ|n|E|next
今度|こんど|n|E|this time; next time
一日|いちにち|n|E|one day; all day
夜中|よなか|n|I|the middle of the night
明け方|あけがた|n|I|dawn
月曜日|げつようび|n|E|Monday
火曜日|かようび|n|E|Tuesday
水曜日|すいようび|n|E|Wednesday
木曜日|もくようび|n|E|Thursday
金曜日|きんようび|n|E|Friday
土曜日|どようび|n|E|Saturday
日曜日|にちようび|n|E|Sunday
いつまでも||adv|I|forever; for as long as one likes
`));

  // People and family
  core.push(...T(`
家族|かぞく|n|E|family
父|ちち|n|E|(my) father|Used for one's own father when talking to others.
母|はは|n|E|(my) mother|Used for one's own mother when talking to others.
お父さん|おとうさん|n|E|father (someone's; also calling one's own)
お母さん|おかあさん|n|E|mother (someone's; also calling one's own)
兄|あに|n|E|(my) older brother
姉|あね|n|E|(my) older sister
弟|おとうと|n|E|younger brother
妹|いもうと|n|E|younger sister
お兄さん|おにいさん|n|E|older brother (someone's; polite)
お姉さん|おねえさん|n|E|older sister (someone's; polite)|Also used to address a young woman.
兄弟|きょうだい|n|E|siblings; brothers
両親|りょうしん|n|E|parents
親|おや|n|E|parent
子ども|こども|n|F|child
息子|むすこ|n|E|son
娘|むすめ|n|E|daughter; girl
夫|おっと|n|E|(my) husband
妻|つま|n|E|(my) wife
祖父|そふ|n|I|(my) grandfather
祖母|そぼ|n|I|(my) grandmother
おじいさん||n|E|grandfather; old man
おばあさん||n|E|grandmother; old woman
おじさん||n|E|uncle; middle-aged man
おばさん||n|E|aunt; middle-aged woman
孫|まご|n|I|grandchild
友達|ともだち|n|F|friend
仲間|なかま|n|E|companion, comrade
恋人|こいびと|n|I|sweetheart, partner
師匠|ししょう|n|I|master, teacher (of a craft or art)
弟子|でし|n|I|apprentice, pupil
先生|せんせい|n|F|teacher; doctor|Also a respectful title for teachers, doctors and similar.
赤ちゃん|あかちゃん|n|E|baby
大人|おとな|n|E|adult
男|おとこ|n|E|man, male
女|おんな|n|E|woman, female
男の人|おとこのひと|n|E|man
女の人|おんなのひと|n|E|woman
男の子|おとこのこ|n|E|boy
女の子|おんなのこ|n|E|girl
人々|ひとびと|n|I|people
商人|しょうにん|n|I|merchant, trader
職人|しょくにん|n|I|craftsperson
農家|のうか|n|I|farmer; farming household
漁師|りょうし|n|I|fisher
船頭|せんどう|n|A|boatman, ferryman
旅人|たびびと|n|I|traveller
医者|いしゃ|n|E|doctor
薬屋|くすりや|n|E|pharmacy, chemist's; apothecary
配達人|はいたつにん|n|I|delivery person, courier
番人|ばんにん|n|I|guard, keeper, watchman
灯台守|とうだいもり|n|A|lighthouse keeper
芸人|げいにん|n|I|performer, entertainer
旅芸人|たびげいにん|n|A|travelling performer
店主|てんしゅ|n|I|shopkeeper, owner
主人|しゅじん|n|I|master (of a house); innkeeper; husband
女将|おかみ|n|A|landlady (of an inn)
村長|そんちょう|n|I|village head
名人|めいじん|n|I|expert, master
役人|やくにん|n|I|official, bureaucrat
客|きゃく|n|E|guest, customer
お客さん|おきゃくさん|n|E|customer; guest
店員|てんいん|n|E|shop assistant
敵|てき|n|I|enemy
味方|みかた|n|I|ally; one's side
`));

  // Body, health
  core.push(...T(`
体|からだ|n|E|body
頭|あたま|n|E|head
顔|かお|n|F|face
目|め|n|F|eye|As a suffix after a number: -th ({二|ふた}つ{目|め} "the second").|-th (ordinal suffix)
耳|みみ|n|F|ear
鼻|はな|n|F|nose|Homophone: {花|はな} (flower).
口|くち|n|F|mouth
歯|は|n|E|tooth
手|て|n|F|hand
足|あし|n|F|foot; leg
腕|うで|n|E|arm; skill
指|ゆび|n|E|finger
肩|かた|n|E|shoulder
背中|せなか|n|E|back (of the body)
心|こころ|n|E|heart, mind
声|こえ|n|F|voice
髪|かみ|n|E|hair (on the head)
首|くび|n|E|neck
胸|むね|n|E|chest
お腹|おなか|n|E|stomach, belly
喉|のど|n|E|throat
血|ち|n|E|blood
鼻血|はなぢ|n|I|nosebleed
息|いき|n|E|breath
涙|なみだ|n|E|tears
力|ちから|n|E|strength, power
病気|びょうき|n|E|illness
薬|くすり|n|F|medicine
怪我|けが|n|E|injury
風邪|かぜ|n|E|a cold (illness)|Homophone: {風|かぜ} (wind).
`));

  // Weather and nature
  core.push(...T(`
天気|てんき|n|F|weather
雨|あめ|n|F|rain|Homophone: {飴|あめ} (sweets, candy).
雪|ゆき|n|F|snow
風|かぜ|n|F|wind|Homophone: {風邪|かぜ} (a cold).
雲|くも|n|F|cloud
空|そら|n|F|sky
晴れ|はれ|n|E|clear weather
曇り|くもり|n|E|cloudy weather
嵐|あらし|n|E|storm
雷|かみなり|n|E|thunder; lightning
霧|きり|n|E|fog, mist
霜|しも|n|I|frost
虹|にじ|n|E|rainbow
台風|たいふう|n|E|typhoon
氷|こおり|n|E|ice
吹雪|ふぶき|n|I|snowstorm, blizzard
雪崩|なだれ|n|A|avalanche
川|かわ|n|F|river
橋|はし|n|F|bridge|Homophones: {箸|はし} (chopsticks), {端|はし} (edge).
端|はし|n|I|edge, end
葦|あし|n|I|reed|Also read よし.
山|やま|n|F|mountain
海|うみ|n|F|sea
港|みなと|n|E|harbour, port
潮|しお|n|I|tide; seawater|Homophone: {塩|しお} (salt).
満ち潮|みちしお|n|A|rising tide, high tide
引き潮|ひきしお|n|A|ebb tide
波|なみ|n|E|wave
岸|きし|n|E|shore, bank
島|しま|n|E|island
湖|みずうみ|n|E|lake
池|いけ|n|F|pond
水|みず|n|F|water|Cold or room-temperature water; hot water is お{湯|ゆ}.
火|ひ|n|F|fire
土|つち|n|E|soil, earth
砂|すな|n|E|sand
石|いし|n|F|stone
岩|いわ|n|E|rock
草|くさ|n|E|grass
花|はな|n|F|flower|Homophone: {鼻|はな} (nose).
桜|さくら|n|E|cherry blossom; cherry tree
木|き|n|F|tree; wood
森|もり|n|E|forest
林|はやし|n|E|woods, grove
葉|は|n|E|leaf
実|み|n|I|fruit, nut, berry (on a plant)
種|たね|n|E|seed
田んぼ|たんぼ|n|E|rice field
畑|はたけ|n|E|field (for vegetables)
谷|たに|n|E|valley
坂|さか|n|E|slope (road)
丘|おか|n|E|hill
峠|とうげ|n|I|mountain pass
滝|たき|n|E|waterfall
泉|いずみ|n|I|spring (of water)
光|ひかり|n|E|light
影|かげ|n|E|shadow
闇|やみ|n|I|darkness
煙|けむり|n|E|smoke
灰|はい|n|I|ash
星|ほし|n|F|star
太陽|たいよう|n|E|the sun
空気|くうき|n|E|air; atmosphere (of a place)
自然|しぜん|n|E|nature
道|みち|n|F|road, path, way
野原|のはら|n|I|field, open plain
景色|けしき|n|E|scenery, view
夕日|ゆうひ|n|E|setting sun
朝日|あさひ|n|E|morning sun
星空|ほしぞら|n|I|starry sky
流れ|ながれ|n|I|flow, current
海辺|うみべ|n|I|seaside
動物|どうぶつ|n|E|animal
鳥|とり|n|F|bird
魚|さかな|n|F|fish
犬|いぬ|n|F|dog
猫|ねこ|n|F|cat
馬|うま|n|E|horse
牛|うし|n|E|cow
虫|むし|n|F|insect, bug
蛙|かえる|n|E|frog|Homophones: {帰|かえ}る (go home), {変|か}える (change).
狐|きつね|n|E|fox
鹿|しか|n|E|deer
熊|くま|n|E|bear
蛍|ほたる|n|I|firefly
烏|からす|n|E|crow
亀|かめ|n|E|turtle, tortoise
色|いろ|n|E|colour
赤|あか|n|E|red (the colour)
青|あお|n|E|blue (the colour); green (of plants, traffic lights)
白|しろ|n|E|white (the colour)
黒|くろ|n|E|black (the colour)
`));

  // Places, buildings, directions
  core.push(...T(`
村|むら|n|E|village
町|まち|n|F|town
市場|いちば|n|E|market
駅|えき|n|E|station
学校|がっこう|n|E|school
図書館|としょかん|n|E|library
書庫|しょこ|n|A|archive room, book stacks
役所|やくしょ|n|I|government office
塔|とう|n|I|tower
鐘楼|しょうろう|n|A|bell tower
天文台|てんもんだい|n|I|observatory
工房|こうぼう|n|I|workshop, studio
倉庫|そうこ|n|E|warehouse, storehouse
果樹園|かじゅえん|n|I|orchard
窯|かま|n|I|kiln
水車|すいしゃ|n|I|waterwheel
水車小屋|すいしゃごや|n|I|water mill
小屋|こや|n|E|hut, shed
灯台|とうだい|n|I|lighthouse
山小屋|やまごや|n|I|mountain hut
麓|ふもと|n|A|foot (of a mountain)
頂上|ちょうじょう|n|I|summit
宿|やど|n|E|inn, lodging
宿屋|やどや|n|I|inn
茶屋|ちゃや|n|I|teahouse
店|みせ|n|F|shop, store
本屋|ほんや|n|E|bookshop
家|いえ|n|F|house, home
家|うち|n|F|home; my house|Often written in kana: うち.
部屋|へや|n|F|room
台所|だいどころ|n|E|kitchen
庭|にわ|n|F|garden, yard
井戸|いど|n|I|well (for water)
門|もん|n|E|gate
広場|ひろば|n|E|(town) square, plaza
通り|とおり|n|E|street, avenue
角|かど|n|E|corner
入口|いりぐち|n|E|entrance
出口|でぐち|n|E|exit
乗り場|のりば|n|I|boarding place (e.g. a ferry landing)
場所|ばしょ|n|E|place
所|ところ|n|E|place; point, moment|～ているところ: "in the middle of …".
国|くに|n|E|country
世界|せかい|n|E|world
中|なか|n|F|inside, middle
外|そと|n|F|outside
上|うえ|n|F|above, on top
下|した|n|F|below, under
右|みぎ|n|F|right
左|ひだり|n|F|left
横|よこ|n|E|side; beside
隣|となり|n|E|next to; next door
近く|ちかく|n|E|nearby, the vicinity
向こう|むこう|n|E|over there; the other side
北|きた|n|E|north
南|みなみ|n|E|south
東|ひがし|n|E|east
西|にし|n|E|west
途中|とちゅう|n|I|on the way; midway
`));

  // Household things, tools, clothing, writing
  core.push(...T(`
机|つくえ|n|F|desk
椅子|いす|n|F|chair
箱|はこ|n|F|box
袋|ふくろ|n|E|bag, sack
鞄|かばん|n|E|bag, satchel
鍵|かぎ|n|E|key; lock
紙|かみ|n|F|paper|Homophone: {髪|かみ} (hair).
筆|ふで|n|I|writing brush
ペン||n|F|pen
インク||n|E|ink
墨|すみ|n|I|ink stick; black ink (for brush writing)
鉛筆|えんぴつ|n|E|pencil
地図|ちず|n|E|map
布|ぬの|n|E|cloth
糸|いと|n|F|thread
針|はり|n|E|needle
縄|なわ|n|I|rope
綱|つな|n|I|rope, cable
鍋|なべ|n|E|pot, pan
皿|さら|n|E|plate, dish
箸|はし|n|E|chopsticks
茶碗|ちゃわん|n|E|rice bowl; tea bowl
湯のみ|ゆのみ|n|I|teacup (Japanese-style, without a handle)
カップ||n|E|cup
コップ||n|E|glass, tumbler
棚|たな|n|E|shelf
床|ゆか|n|E|floor
屋根|やね|n|E|roof
壁|かべ|n|E|wall
階段|かいだん|n|E|stairs
釘|くぎ|n|I|nail (metal)
はしご||n|I|ladder
金槌|かなづち|n|I|hammer
はさみ||n|E|scissors
かご||n|E|basket; cage
樽|たる|n|I|barrel, cask
桶|おけ|n|I|bucket, tub
荷物|にもつ|n|E|luggage, baggage
荷|に|n|I|load, cargo
傘|かさ|n|F|umbrella
帽子|ぼうし|n|E|hat
服|ふく|n|F|clothes
着物|きもの|n|E|kimono; clothing
上着|うわぎ|n|E|jacket, coat
靴|くつ|n|F|shoes, boots
長靴|ながぐつ|n|E|(rubber) boots
ブーツ||n|E|boots
靴下|くつした|n|E|socks
ボタン||n|E|button
ポケット||n|E|pocket
道具|どうぐ|n|E|tool
瓶|びん|n|E|bottle, jar
ラベル||n|E|label
札|ふだ|n|I|tag, label, card
名札|なふだ|n|I|name tag
手紙|てがみ|n|E|letter (mail)
封筒|ふうとう|n|I|envelope
切手|きって|n|E|(postage) stamp
宛名|あてな|n|A|addressee's name (on a letter)
宛先|あてさき|n|I|address, destination (of mail)
差出人|さしだしにん|n|A|sender (of mail)
封|ふう|n|A|seal (on a letter)
住所|じゅうしょ|n|E|address
郵便|ゆうびん|n|E|mail, post
ドア||n|F|door
戸|と|n|E|door (sliding or traditional)
扉|とびら|n|I|door (hinged); gate
窓|まど|n|F|window
ろうそく||n|E|candle
マッチ||n|E|match (for lighting)
ランタン||n|E|lantern
ランプ||n|E|lamp
提灯|ちょうちん|n|I|paper lantern
灯籠|とうろう|n|A|(stone or hanging) lantern
灯り|あかり|n|I|light, lamplight|Also written {明|あ}かり.
鐘|かね|n|E|(large) bell|Homophone: お{金|かね} (money).
鈴|すず|n|E|(small) bell
ガラス||n|E|glass (the material)
布団|ふとん|n|E|futon, bedding
風呂|ふろ|n|E|bath
お湯|おゆ|n|E|hot water
石鹸|せっけん|n|I|soap
鏡|かがみ|n|E|mirror
時計|とけい|n|E|clock, watch
写真|しゃしん|n|E|photograph
絵|え|n|F|picture, painting
ベッド||n|E|bed
テーブル||n|E|table
お金|おかね|n|E|money
財布|さいふ|n|E|wallet, purse
物|もの|n|F|thing, object|For an abstract thing (an event, a fact) use こと.
忘れ物|わすれもの|n|E|something left behind
落とし物|おとしもの|n|E|lost item
車|くるま|n|E|vehicle; car; (wheeled) cart
荷車|にぐるま|n|I|cart
船|ふね|n|F|ship, boat
舟|ふね|n|I|small boat
渡し舟|わたしぶね|n|A|ferry boat
看板|かんばん|n|I|signboard
道しるべ|みちしるべ|n|A|signpost; guide
印|しるし|n|I|mark, sign
暦|こよみ|n|A|calendar, almanac
星図|せいず|n|A|star chart
碑|ひ|n|A|stone monument (with an inscription)
碑文|ひぶん|n|A|inscription (on a monument)
盾|たて|n|I|shield
剣|けん|n|I|sword
`));

  // Food and the inn
  core.push(...T(`
ご飯|ごはん|n|F|cooked rice; meal
米|こめ|n|E|rice (uncooked)
肉|にく|n|E|meat
野菜|やさい|n|E|vegetables
果物|くだもの|n|E|fruit
りんご||n|F|apple
梨|なし|n|E|(Japanese) pear
柿|かき|n|E|persimmon
みかん||n|F|mandarin orange
桃|もも|n|E|peach
スープ||n|E|soup
汁|しる|n|I|soup; juice, liquid
味噌汁|みそしる|n|E|miso soup
お茶|おちゃ|n|F|tea (green tea)
茶|ちゃ|n|E|tea
酒|さけ|n|E|alcohol; sake|Homophone: {鮭|さけ} (salmon).
鮭|さけ|n|I|salmon
パン||n|F|bread
卵|たまご|n|E|egg
塩|しお|n|E|salt|Homophone: {潮|しお} (tide).
砂糖|さとう|n|E|sugar
お菓子|おかし|n|F|sweets, snacks
飴|あめ|n|E|sweets, candy|Homophone: {雨|あめ} (rain).
団子|だんご|n|E|dumpling (sweet rice dumpling)
餅|もち|n|E|rice cake
豆|まめ|n|E|beans
天ぷら|てんぷら|n|E|tempura (battered, deep-fried food)
蜂蜜|はちみつ|n|I|honey
麦|むぎ|n|I|wheat; barley
粉|こな|n|I|flour; powder
弁当|べんとう|n|E|boxed lunch
飲み物|のみもの|n|E|drink
食べ物|たべもの|n|E|food
食事|しょくじ|n|E|meal
朝ご飯|あさごはん|n|E|breakfast
昼ご飯|ひるごはん|n|E|lunch
晩ご飯|ばんごはん|n|E|dinner, supper
味|あじ|n|E|taste, flavour
`));

  // Verbs: godan
  core.push(...T(`
会う|あう|v5u|F|to meet
合う|あう|v5u|E|to fit; to match; to agree
言う|いう|v5u|F|to say|Written いう, but usually pronounced like ゆう in speech.
買う|かう|v5u|F|to buy
使う|つかう|v5u|E|to use
洗う|あらう|v5u|E|to wash
歌う|うたう|v5u|E|to sing
手伝う|てつだう|v5u|E|to help (with a task)
思う|おもう|v5u|E|to think; to feel
習う|ならう|v5u|E|to learn (from someone)
払う|はらう|v5u|E|to pay
笑う|わらう|v5u|E|to laugh; to smile
違う|ちがう|v5u|E|to differ; to be wrong|{違|ちが}います is a polite "no, that's not right".
吸う|すう|v5u|E|to breathe in; to smoke
拾う|ひろう|v5u|E|to pick up
向かう|むかう|v5u|E|to head towards; to face
迷う|まよう|v5u|E|to get lost; to hesitate
もらう||v5u|E|to receive, get
間に合う|まにあう|v5u|I|to be in time
誘う|さそう|v5u|I|to invite (someone to do something)
失う|うしなう|v5u|I|to lose (something important)
争う|あらそう|v5u|A|to compete; to quarrel
追う|おう|v5u|I|to chase
戦う|たたかう|v5u|I|to fight
願う|ねがう|v5u|I|to wish; to request
扱う|あつかう|v5u|I|to handle, treat
従う|したがう|v5u|I|to follow, obey
伺う|うかがう|v5u|I|to visit; to ask (humble)
疑う|うたがう|v5u|I|to doubt, suspect
償う|つぐなう|v5u|A|to make amends
補う|おぎなう|v5u|A|to make up for, supplement
雇う|やとう|v5u|I|to hire
救う|すくう|v5u|I|to rescue, save
祝う|いわう|v5u|I|to celebrate
似合う|にあう|v5u|I|to suit (someone)
話し合う|はなしあう|v5u|I|to discuss, talk over
向き合う|むきあう|v5u|A|to face (each other, or a problem)
書く|かく|v5k|F|to write
聞く|きく|v5k|F|to hear; to listen; to ask
行く|いく|v5k-s|F|to go|Irregular て/た forms: {行|い}って, {行|い}った.
歩く|あるく|v5k|E|to walk
働く|はたらく|v5k|E|to work
置く|おく|v5k|E|to put, place
開く|あく|v5k|E|to open (by itself: "the door opens")|The transitive partner is {開|あ}ける.
開く|ひらく|v5k|I|to open (a book, a shop, an event)
着く|つく|v5k|E|to arrive
泣く|なく|v5k|E|to cry
鳴く|なく|v5k|I|to make a sound (birds, animals, insects)
引く|ひく|v5k|E|to pull; to draw (a line)
弾く|ひく|v5k|E|to play (a string or keyboard instrument)
動く|うごく|v5k|E|to move
届く|とどく|v5k|I|to reach; to be delivered
続く|つづく|v5k|I|to continue (by itself)
磨く|みがく|v5k|I|to polish; to brush (teeth)
描く|えがく|v5k|I|to draw, paint, depict|Also read かく.
乾く|かわく|v5k|I|to dry (by itself)
驚く|おどろく|v5k|I|to be surprised
気づく|きづく|v5k|I|to notice
近づく|ちかづく|v5k|I|to approach
響く|ひびく|v5k|I|to echo, resound
輝く|かがやく|v5k|I|to shine, sparkle
焼く|やく|v5k|E|to bake, grill; to burn
巻く|まく|v5k|I|to wind, wrap
招く|まねく|v5k|A|to invite; to bring about
咲く|さく|v5k|E|to bloom
叩く|たたく|v5k|I|to hit, knock
覗く|のぞく|v5k|I|to peek
頷く|うなずく|v5k|A|to nod
呟く|つぶやく|v5k|A|to mutter
嘆く|なげく|v5k|A|to lament, grieve
解く|とく|v5k|I|to solve; to untie
抱く|だく|v5k|I|to hold (in one's arms)|Also read いだく (to harbour a feeling).
いただく||v5k|E|to receive (humble); to eat or drink (humble)
履く|はく|v5k|E|to put on, wear (shoes, trousers)
吐く|はく|v5k|I|to breathe out; to spit; to vomit
築く|きずく|v5k|A|to build (up)
効く|きく|v5k|I|to be effective (medicine)
浮く|うく|v5k|I|to float
泳ぐ|およぐ|v5g|E|to swim
急ぐ|いそぐ|v5g|E|to hurry
脱ぐ|ぬぐ|v5g|E|to take off (clothes, shoes)
騒ぐ|さわぐ|v5g|I|to make noise; to make a fuss
防ぐ|ふせぐ|v5g|I|to prevent; to defend against
注ぐ|そそぐ|v5g|I|to pour
繋ぐ|つなぐ|v5g|I|to connect, tie
稼ぐ|かせぐ|v5g|I|to earn
嗅ぐ|かぐ|v5g|I|to smell (something)
継ぐ|つぐ|v5g|A|to inherit, succeed to
話す|はなす|v5s|F|to speak, talk
出す|だす|v5s|E|to take out; to send; to hand in
返す|かえす|v5s|E|to return (something)
消す|けす|v5s|E|to turn off; to erase; to put out (a fire)
探す|さがす|v5s|E|to look for
貸す|かす|v5s|E|to lend
押す|おす|v5s|E|to push
渡す|わたす|v5s|E|to hand over
直す|なおす|v5s|E|to fix, repair; to correct
壊す|こわす|v5s|E|to break, destroy
残す|のこす|v5s|I|to leave behind
思い出す|おもいだす|v5s|E|to remember, recall
許す|ゆるす|v5s|I|to forgive; to allow
隠す|かくす|v5s|I|to hide (something)
戻す|もどす|v5s|I|to put back, return
回す|まわす|v5s|I|to turn, spin; to pass around
起こす|おこす|v5s|E|to wake (someone) up; to cause
落とす|おとす|v5s|E|to drop
無くす|なくす|v5s|E|to lose
指す|さす|v5s|I|to point at
刺す|さす|v5s|I|to stab, sting
示す|しめす|v5s|A|to show, indicate
照らす|てらす|v5s|I|to light up, illuminate
流す|ながす|v5s|I|to let flow; to wash away
冷やす|ひやす|v5s|I|to cool, chill
増やす|ふやす|v5s|I|to increase (something)
燃やす|もやす|v5s|I|to burn (something)
過ごす|すごす|v5s|I|to spend (time)
暮らす|くらす|v5s|I|to live, get by
申す|もうす|v5s|I|to say; to be called (humble)
果たす|はたす|v5s|A|to carry out, fulfil
尽くす|つくす|v5s|A|to devote oneself; to use up
乾かす|かわかす|v5s|I|to dry (something)
沸かす|わかす|v5s|I|to boil (water)
動かす|うごかす|v5s|I|to move (something)
鳴らす|ならす|v5s|I|to ring, sound (something)
逃がす|にがす|v5s|I|to let (something) escape
見逃す|みのがす|v5s|A|to overlook, miss; to let pass
取り戻す|とりもどす|v5s|I|to get back, recover
見直す|みなおす|v5s|A|to look at again; to reconsider
干す|ほす|v5s|I|to dry (in the sun), air
灯す|ともす|v5s|A|to light (a lamp)
励ます|はげます|v5s|I|to encourage
待つ|まつ|v5t|F|to wait
持つ|もつ|v5t|F|to hold; to have
立つ|たつ|v5t|E|to stand
勝つ|かつ|v5t|E|to win
打つ|うつ|v5t|I|to hit, strike
育つ|そだつ|v5t|I|to grow up
保つ|たもつ|v5t|A|to keep, maintain
役立つ|やくだつ|v5t|I|to be useful
目立つ|めだつ|v5t|I|to stand out
死ぬ|しぬ|v5n|E|to die
遊ぶ|あそぶ|v5b|F|to play; to have fun
呼ぶ|よぶ|v5b|E|to call
飛ぶ|とぶ|v5b|E|to fly; to jump
選ぶ|えらぶ|v5b|E|to choose
運ぶ|はこぶ|v5b|E|to carry
学ぶ|まなぶ|v5b|I|to study, learn
並ぶ|ならぶ|v5b|I|to line up
結ぶ|むすぶ|v5b|I|to tie; to join
喜ぶ|よろこぶ|v5b|I|to be glad
転ぶ|ころぶ|v5b|I|to fall over
叫ぶ|さけぶ|v5b|I|to shout
滅ぶ|ほろぶ|v5b|A|to perish, be ruined
浮かぶ|うかぶ|v5b|I|to float; to come to mind
読む|よむ|v5m|F|to read
飲む|のむ|v5m|F|to drink; to take (medicine)
住む|すむ|v5m|E|to live (reside)
休む|やすむ|v5m|E|to rest; to take a day off
頼む|たのむ|v5m|E|to ask (a favour); to order
進む|すすむ|v5m|I|to advance, go forward
済む|すむ|v5m|I|to be finished; to be settled
盗む|ぬすむ|v5m|I|to steal
包む|つつむ|v5m|I|to wrap
楽しむ|たのしむ|v5m|E|to enjoy
悩む|なやむ|v5m|I|to worry, be troubled
望む|のぞむ|v5m|A|to wish for, hope
踏む|ふむ|v5m|I|to step on
積む|つむ|v5m|I|to pile up; to load
沈む|しずむ|v5m|I|to sink; to set (the sun)
刻む|きざむ|v5m|A|to carve, engrave; to chop
編む|あむ|v5m|I|to knit
混む|こむ|v5m|E|to be crowded
噛む|かむ|v5m|I|to bite, chew
恨む|うらむ|v5m|A|to resent
挟む|はさむ|v5m|I|to put between
拒む|こばむ|v5m|A|to refuse
帰る|かえる|v5r|F|to go home, return|Homophones: {変|か}える (to change), {蛙|かえる} (frog).
入る|はいる|v5r|F|to enter
切る|きる|v5r|E|to cut
知る|しる|v5r|E|to know; to get to know|"I know" is {知|し}っています; "I don't know" is {知|し}りません.
走る|はしる|v5r|E|to run
取る|とる|v5r|E|to take
作る|つくる|v5r|E|to make
分かる|わかる|v5r|F|to understand
乗る|のる|v5r|E|to ride; to get on
登る|のぼる|v5r|E|to climb
終わる|おわる|v5r|E|to end
始まる|はじまる|v5r|E|to begin (by itself)
座る|すわる|v5r|E|to sit
送る|おくる|v5r|E|to send; to see (someone) off
困る|こまる|v5r|E|to be in trouble; to be at a loss
残る|のこる|v5r|I|to remain
渡る|わたる|v5r|E|to cross (a bridge, a river)
守る|まもる|v5r|I|to protect; to keep (a promise, a rule)
謝る|あやまる|v5r|I|to apologise
祈る|いのる|v5r|I|to pray; to wish (for)
眠る|ねむる|v5r|E|to sleep
光る|ひかる|v5r|E|to shine
閉まる|しまる|v5r|E|to close (by itself)
集まる|あつまる|v5r|E|to gather (by itself)
止まる|とまる|v5r|E|to stop (by itself)
泊まる|とまる|v5r|I|to stay overnight
変わる|かわる|v5r|E|to change (by itself)
決まる|きまる|v5r|I|to be decided
助かる|たすかる|v5r|I|to be saved; to be a help
見つかる|みつかる|v5r|E|to be found
通る|とおる|v5r|E|to pass (through)
戻る|もどる|v5r|E|to go back, return
直る|なおる|v5r|I|to be fixed
曲がる|まがる|v5r|E|to turn (a corner); to bend
上がる|あがる|v5r|E|to go up, rise
下がる|さがる|v5r|E|to go down; to step back
触る|さわる|v5r|E|to touch
語る|かたる|v5r|I|to tell, narrate
断る|ことわる|v5r|I|to refuse, decline
減る|へる|v5r|I|to decrease
要る|いる|v5r|E|to need|Godan (いります), unlike ichidan いる "to be".
限る|かぎる|v5r|A|to limit
飾る|かざる|v5r|I|to decorate
塗る|ぬる|v5r|I|to paint, spread
振る|ふる|v5r|I|to wave; to shake
降る|ふる|v5r|E|to fall (rain, snow)
鳴る|なる|v5r|E|to ring, sound
灯る|ともる|v5r|A|to be lit (a lamp)
実る|みのる|v5r|I|to bear fruit
凍る|こおる|v5r|I|to freeze
なる||v5r|F|to become
ある||v5r|F|to exist, there is (things)|Negative: ない (not あらない).
やる||v5r|E|to do (casual)|Also "to give" to someone of lower status.
怒る|おこる|v5r|E|to get angry
頑張る|がんばる|v5r|E|to do one's best, keep going
黙る|だまる|v5r|I|to fall silent
売る|うる|v5r|E|to sell
映る|うつる|v5r|I|to be reflected
預かる|あずかる|v5r|I|to look after, keep (something for someone)
破る|やぶる|v5r|I|to tear; to break (a promise, a rule)
探る|さぐる|v5r|A|to search, probe
至る|いたる|v5r|A|to reach, lead to
散る|ちる|v5r|I|to scatter; to fall (leaves, petals)
参る|まいる|v5r|I|to go, come (humble)
おる||v5r|I|to be (humble form of いる)
召し上がる|めしあがる|v5r|I|to eat, drink (respectful)
蘇る|よみがえる|v5r|A|to come back to life, revive
偽る|いつわる|v5r|A|to lie about, falsify
裏切る|うらぎる|v5r|A|to betray
見守る|みまもる|v5r|A|to watch over
見送る|みおくる|v5r|I|to see (someone) off
見張る|みはる|v5r|I|to keep watch
張る|はる|v5r|I|to stretch; to put up
貼る|はる|v5r|I|to stick, paste
配る|くばる|v5r|I|to hand out
繋がる|つながる|v5r|I|to be connected, link up
かかる||v5r|E|to take (time, money); to hang|Written {掛|か}かる for "to hang".
譲る|ゆずる|v5r|I|to hand over; to give way
頼る|たよる|v5r|I|to rely on
かぶる||v5r|I|to put on (a hat)
いらっしゃる||v5aru|I|to be, go, come (respectful)
おっしゃる||v5aru|I|to say (respectful)
なさる||v5aru|I|to do (respectful)
くださる||v5aru|I|to give (to me/us) (respectful)
`));

  // Verbs: ichidan and irregular
  core.push(...T(`
食べる|たべる|v1|F|to eat
見る|みる|v1|F|to see, look, watch
寝る|ねる|v1|F|to sleep; to go to bed
起きる|おきる|v1|F|to get up; to wake up; to happen
出る|でる|v1|E|to go out, leave; to appear
着る|きる|v1|E|to wear (on the upper body)
いる||v1|F|to be, exist (people, animals)|Usually written in kana.
開ける|あける|v1|E|to open (something)
閉める|しめる|v1|E|to close (something)
教える|おしえる|v1|E|to teach; to tell
覚える|おぼえる|v1|E|to remember; to memorise
忘れる|わすれる|v1|E|to forget; to leave behind
始める|はじめる|v1|E|to begin (something)
決める|きめる|v1|E|to decide
見せる|みせる|v1|E|to show
答える|こたえる|v1|E|to answer
考える|かんがえる|v1|E|to think about, consider
借りる|かりる|v1|E|to borrow
出かける|でかける|v1|E|to go out
降りる|おりる|v1|E|to get off; to go down
生きる|いきる|v1|I|to live
信じる|しんじる|v1|I|to believe, trust
感じる|かんじる|v1|I|to feel
届ける|とどける|v1|I|to deliver
預ける|あずける|v1|I|to leave (something) in someone's care
助ける|たすける|v1|E|to help, rescue
続ける|つづける|v1|I|to continue (something)
付ける|つける|v1|E|to attach; to turn on (a light)
消える|きえる|v1|E|to disappear; to go out (a light)
聞こえる|きこえる|v1|E|to be audible, can be heard
見える|みえる|v1|E|to be visible, can be seen
変える|かえる|v1|E|to change (something)
伝える|つたえる|v1|I|to convey, pass on (a message)
調べる|しらべる|v1|E|to look into, investigate
比べる|くらべる|v1|I|to compare
並べる|ならべる|v1|I|to line up, arrange
集める|あつめる|v1|E|to collect, gather
止める|とめる|v1|E|to stop (something)
疲れる|つかれる|v1|E|to get tired
壊れる|こわれる|v1|E|to break (by itself)
燃える|もえる|v1|I|to burn (by itself)
増える|ふえる|v1|I|to increase (by itself)
植える|うえる|v1|I|to plant
迎える|むかえる|v1|I|to welcome, go to meet
慣れる|なれる|v1|I|to get used to
流れる|ながれる|v1|I|to flow
離れる|はなれる|v1|I|to move away from, leave
逃げる|にげる|v1|E|to run away
投げる|なげる|v1|E|to throw
上げる|あげる|v1|E|to raise, lift
あげる||v1|E|to give|Giving outward, from me or my side to others.
くれる||v1|E|to give (to me or my side)
下げる|さげる|v1|I|to lower
受ける|うける|v1|I|to receive; to take (a test)
負ける|まける|v1|E|to lose (a game, a fight)
分ける|わける|v1|I|to divide, share
見つける|みつける|v1|E|to find
片付ける|かたづける|v1|E|to tidy up
捨てる|すてる|v1|E|to throw away
建てる|たてる|v1|I|to build
立てる|たてる|v1|I|to stand (something) up; to make (a plan)
育てる|そだてる|v1|I|to raise, bring up
足りる|たりる|v1|E|to be enough
過ぎる|すぎる|v1|I|to pass; to exceed|After a stem or adjective: ～すぎる "too …".
落ちる|おちる|v1|E|to fall, drop
浴びる|あびる|v1|I|to bathe in; to take (a shower)
閉じる|とじる|v1|I|to close, shut (eyes, a book)
冷える|ひえる|v1|I|to get cold
震える|ふるえる|v1|I|to shake, tremble
揺れる|ゆれる|v1|I|to sway, shake
濡れる|ぬれる|v1|E|to get wet
汚れる|よごれる|v1|I|to get dirty
隠れる|かくれる|v1|I|to hide (oneself)
与える|あたえる|v1|A|to give, grant
抱える|かかえる|v1|I|to hold in one's arms; to have (a problem)
支える|ささえる|v1|I|to support
数える|かぞえる|v1|I|to count
耐える|たえる|v1|A|to endure
越える|こえる|v1|I|to cross over (a mountain, a border)
訪ねる|たずねる|v1|I|to visit
尋ねる|たずねる|v1|I|to ask, inquire
重ねる|かさねる|v1|I|to pile up; to repeat
確かめる|たしかめる|v1|I|to make sure, check
認める|みとめる|v1|A|to admit; to recognise
諦める|あきらめる|v1|I|to give up
求める|もとめる|v1|A|to seek; to request
眺める|ながめる|v1|I|to gaze at
務める|つとめる|v1|A|to serve as (a role)
閉じ込める|とじこめる|v1|A|to shut in, confine
受け入れる|うけいれる|v1|A|to accept
見捨てる|みすてる|v1|A|to abandon
見届ける|みとどける|v1|A|to see (something) through to the end
引き受ける|ひきうける|v1|I|to take on, accept (a task)
任せる|まかせる|v1|I|to leave (something) to someone
甘える|あまえる|v1|A|to depend on someone's kindness
慰める|なぐさめる|v1|A|to comfort
責める|せめる|v1|A|to blame
褒める|ほめる|v1|I|to praise
似る|にる|v1|I|to resemble|Usually {似|に}ている.
煮る|にる|v1|I|to simmer, boil (food)
できる||v1|E|can, be able to; to be made; to be finished|Also the potential form of する.
着替える|きがえる|v1|I|to change clothes
覚める|さめる|v1|I|to wake up
冷める|さめる|v1|I|to cool down (something hot); to lose interest
混ぜる|まぜる|v1|I|to mix
詰める|つめる|v1|I|to pack, stuff
溶ける|とける|v1|I|to melt
溺れる|おぼれる|v1|A|to drown
崩れる|くずれる|v1|A|to collapse, crumble
途絶える|とだえる|v1|A|to be cut off, come to a stop
乗り越える|のりこえる|v1|A|to overcome
見上げる|みあげる|v1|I|to look up (at)
申し上げる|もうしあげる|v1|I|to say (humble)
差し上げる|さしあげる|v1|I|to give (humble)
存じる|ぞんじる|v1|A|to know; to think (humble)
入れる|いれる|v1|E|to put in
生まれる|うまれる|v1|E|to be born
遅れる|おくれる|v1|E|to be late
別れる|わかれる|v1|I|to part, separate
間違える|まちがえる|v1|E|to make a mistake
終える|おえる|v1|I|to finish (something)
溢れる|あふれる|v1|I|to overflow
満ちる|みちる|v1|A|to be full; to rise (the tide)
晴れる|はれる|v1|E|to clear up (weather)
する||vs-i|F|to do
来る|くる|vk|F|to come
`));

  // する-nouns
  core.push(...T(`
勉強|べんきょう|vs|E|study
練習|れんしゅう|vs|E|practice
料理|りょうり|vs|E|cooking; dish, cuisine
掃除|そうじ|vs|E|cleaning
洗濯|せんたく|vs|E|laundry, washing
散歩|さんぽ|vs|E|walk, stroll
旅行|りょこう|vs|E|trip, travel
約束|やくそく|vs|E|promise; appointment
心配|しんぱい|vs|E|worry
説明|せつめい|vs|E|explanation
案内|あんない|vs|E|guidance; showing (someone) around
準備|じゅんび|vs|E|preparation
修理|しゅうり|vs|I|repair
返事|へんじ|vs|E|reply
連絡|れんらく|vs|I|contact, getting in touch
相談|そうだん|vs|I|consultation, talking something over
注文|ちゅうもん|vs|E|order (in a shop or restaurant)
配達|はいたつ|vs|I|delivery
記録|きろく|vs|I|record, document
記憶|きおく|vs|I|memory (what one remembers)
確認|かくにん|vs|I|confirmation, check
失敗|しっぱい|vs|E|failure, mistake
成功|せいこう|vs|I|success
感謝|かんしゃ|vs|I|gratitude, thanks
遠慮|えんりょ|vs|I|holding back (out of consideration for others)|ご{遠慮|えんりょ}ください is a polite "please refrain".
我慢|がまん|vs|I|putting up with, enduring
期待|きたい|vs|I|expectation, hope
安心|あんしん|vs|E|relief, peace of mind|Also used as a な-adjective.
注意|ちゅうい|vs|E|attention; warning, caution
用意|ようい|vs|E|preparation
質問|しつもん|vs|E|question
出発|しゅっぱつ|vs|E|departure
到着|とうちゃく|vs|I|arrival
挨拶|あいさつ|vs|E|greeting
研究|けんきゅう|vs|I|research
翻訳|ほんやく|vs|I|translation
結婚|けっこん|vs|E|marriage
紹介|しょうかい|vs|E|introduction
招待|しょうたい|vs|I|invitation
経験|けいけん|vs|I|experience
努力|どりょく|vs|I|effort
予約|よやく|vs|I|reservation
交換|こうかん|vs|I|exchange
発見|はっけん|vs|I|discovery
拝見|はいけん|vs|A|seeing, looking at (humble)
保管|ほかん|vs|A|safekeeping, storage
保存|ほぞん|vs|I|preservation; saving
削除|さくじょ|vs|A|deletion
修復|しゅうふく|vs|A|restoration (of something damaged)
修繕|しゅうぜん|vs|A|repair, mending
回復|かいふく|vs|I|recovery
再建|さいけん|vs|A|rebuilding
反対|はんたい|vs|I|opposition; the opposite
賛成|さんせい|vs|I|agreement, approval
議論|ぎろん|vs|A|argument, debate
理解|りかい|vs|I|understanding
誤解|ごかい|vs|I|misunderstanding
後悔|こうかい|vs|I|regret
反省|はんせい|vs|A|reflecting on one's own faults
信頼|しんらい|vs|I|trust
管理|かんり|vs|A|management, control
支配|しはい|vs|A|rule, domination
妥協|だきょう|vs|A|compromise
観測|かんそく|vs|A|(scientific) observation
想像|そうぞう|vs|I|imagination
決心|けっしん|vs|I|determination, resolve
覚悟|かくご|vs|A|resolve, readiness (for something hard)
証言|しょうげん|vs|A|testimony
矛盾|むじゅん|vs|A|contradiction
意図|いと|vs|A|intention, aim|Homophone: {糸|いと} (thread).
対立|たいりつ|vs|A|opposition, confrontation
合意|ごうい|vs|A|agreement, consensus
消去|しょうきょ|vs|A|erasure
喪失|そうしつ|vs|A|loss (of something intangible)
忘却|ぼうきゃく|vs|A|oblivion, forgetting
沈黙|ちんもく|vs|A|silence
混乱|こんらん|vs|I|confusion, chaos
影響|えいきょう|vs|I|influence, effect
言い訳|いいわけ|vs|I|excuse
収穫|しゅうかく|vs|I|harvest
由来|ゆらい|vs|A|origin (of a name or custom)
記念|きねん|vs|I|commemoration
署名|しょめい|vs|A|signature
`));

  // い-adjectives
  core.push(...T(`
大きい|おおきい|adj-i|F|big
小さい|ちいさい|adj-i|F|small
高い|たかい|adj-i|F|high, tall; expensive
低い|ひくい|adj-i|E|low; short (height)
安い|やすい|adj-i|E|cheap
新しい|あたらしい|adj-i|E|new
古い|ふるい|adj-i|E|old (things, not people)
いい||adj-ii|F|good|Past and negative use the よい stem: よかった, よくない.
良い|よい|adj-ii|E|good (a little more formal than いい)
悪い|わるい|adj-i|E|bad
長い|ながい|adj-i|E|long
短い|みじかい|adj-i|E|short
広い|ひろい|adj-i|E|wide, spacious
狭い|せまい|adj-i|E|narrow, cramped
重い|おもい|adj-i|E|heavy
軽い|かるい|adj-i|E|light (in weight)
早い|はやい|adj-i|E|early
速い|はやい|adj-i|E|fast
遅い|おそい|adj-i|E|slow; late
近い|ちかい|adj-i|F|near, close
遠い|とおい|adj-i|F|far
明るい|あかるい|adj-i|E|bright; cheerful
暗い|くらい|adj-i|E|dark; gloomy
強い|つよい|adj-i|E|strong
弱い|よわい|adj-i|E|weak
多い|おおい|adj-i|E|many, a lot|Usually used as a predicate ({人|ひと}が{多|おお}い); before a noun, use たくさんの or {多|おお}くの.
少ない|すくない|adj-i|E|few, little
白い|しろい|adj-i|F|white
黒い|くろい|adj-i|F|black
赤い|あかい|adj-i|F|red
青い|あおい|adj-i|F|blue|Also used for green plants and traffic lights.
黄色い|きいろい|adj-i|E|yellow
茶色い|ちゃいろい|adj-i|E|brown
甘い|あまい|adj-i|E|sweet; lenient
辛い|からい|adj-i|E|spicy, hot; salty|The same kanji read つらい means "painful, hard to bear".
辛い|つらい|adj-i|I|painful, hard to bear (emotionally)
苦い|にがい|adj-i|I|bitter
美味しい|おいしい|adj-i|F|delicious|Often written in kana: おいしい.
まずい||adj-i|E|bad-tasting; awkward, unwise
楽しい|たのしい|adj-i|E|fun, enjoyable
嬉しい|うれしい|adj-i|E|happy, glad
悲しい|かなしい|adj-i|E|sad
寂しい|さびしい|adj-i|E|lonely
怖い|こわい|adj-i|E|scary; afraid
優しい|やさしい|adj-i|E|kind, gentle
易しい|やさしい|adj-i|I|easy, simple
難しい|むずかしい|adj-i|E|difficult
忙しい|いそがしい|adj-i|E|busy
面白い|おもしろい|adj-i|E|interesting; funny
つまらない||adj-i|E|boring; trivial
痛い|いたい|adj-i|E|painful, sore
眠い|ねむい|adj-i|E|sleepy
若い|わかい|adj-i|E|young
太い|ふとい|adj-i|I|thick (in diameter)
細い|ほそい|adj-i|I|thin, narrow
丸い|まるい|adj-i|E|round
深い|ふかい|adj-i|I|deep
浅い|あさい|adj-i|I|shallow
汚い|きたない|adj-i|E|dirty
危ない|あぶない|adj-i|E|dangerous|Also a warning: "watch out!".
珍しい|めずらしい|adj-i|I|rare, unusual
懐かしい|なつかしい|adj-i|I|dear, bringing back fond memories
恥ずかしい|はずかしい|adj-i|I|embarrassed; embarrassing
可愛い|かわいい|adj-i|E|cute
美しい|うつくしい|adj-i|I|beautiful
正しい|ただしい|adj-i|I|correct, right
詳しい|くわしい|adj-i|I|detailed; knowledgeable
厳しい|きびしい|adj-i|I|strict, severe
激しい|はげしい|adj-i|A|violent, intense
苦しい|くるしい|adj-i|I|painful, hard; distressing
眩しい|まぶしい|adj-i|I|dazzling
薄い|うすい|adj-i|I|thin; weak (tea), pale
濃い|こい|adj-i|I|dark, thick, strong (colour, tea)
固い|かたい|adj-i|I|hard, firm
柔らかい|やわらかい|adj-i|I|soft
鋭い|するどい|adj-i|A|sharp, keen
偉い|えらい|adj-i|I|admirable; important (person)
すごい||adj-i|E|amazing; intense
素晴らしい|すばらしい|adj-i|I|wonderful
欲しい|ほしい|adj-i|E|wanted; (I) want (a thing)
ない||adj-i|F|there is not; do not have|The negative of ある; also the plain negative ending of verbs.
仕方ない|しかたない|adj-i|I|it can't be helped
しょうがない||adj-i|I|it can't be helped (casual)
申し訳ない|もうしわけない|adj-i|I|inexcusable|{申|もう}し{訳|わけ}ありません is a very polite apology.
もったいない||adj-i|I|wasteful; too good (for me)
情けない|なさけない|adj-i|A|pitiful, shameful
頼もしい|たのもしい|adj-i|A|reliable, dependable
心細い|こころぼそい|adj-i|A|helpless, uneasy (feeling alone)
気まずい|きまずい|adj-i|A|awkward, uncomfortable
うるさい||adj-i|E|noisy; annoying
騒がしい|さわがしい|adj-i|A|noisy, clamorous
怪しい|あやしい|adj-i|I|suspicious
細かい|こまかい|adj-i|I|fine, detailed; small
ずるい||adj-i|I|unfair, sly
よろしい||adj-i|I|good, all right (polite)
虚しい|むなしい|adj-i|A|empty, futile
暑い|あつい|adj-i|F|hot (weather)|Homophones: {熱|あつ}い (hot to the touch), {厚|あつ}い (thick).
熱い|あつい|adj-i|E|hot (to the touch)
厚い|あつい|adj-i|I|thick (a book, a wall)
寒い|さむい|adj-i|F|cold (weather)
暖かい|あたたかい|adj-i|E|warm (weather, a room)
温かい|あたたかい|adj-i|E|warm (to the touch; a warm heart)
涼しい|すずしい|adj-i|E|cool, refreshing
冷たい|つめたい|adj-i|E|cold (to the touch); unfriendly
蒸し暑い|むしあつい|adj-i|I|humid, muggy
`));

  // な-adjectives
  core.push(...T(`
静か|しずか|adj-na|E|quiet
綺麗|きれい|adj-na|F|pretty; clean|Often written in kana: きれい.
元気|げんき|adj-na|F|healthy, energetic
大切|たいせつ|adj-na|E|important, precious
大事|だいじ|adj-na|E|important; valuable
大丈夫|だいじょうぶ|adj-na|E|all right, OK|Also used to decline politely ("I'm fine, thanks").
好き|すき|adj-na|F|liked; (I) like|The thing liked takes が: {雨|あめ}が{好|す}きです.
嫌い|きらい|adj-na|E|disliked; (I) dislike
大好き|だいすき|adj-na|E|really like, love
大嫌い|だいきらい|adj-na|I|really dislike, hate
上手|じょうず|adj-na|E|skilful, good at|Not normally said about oneself (it sounds boastful); {得意|とくい} is used instead.
下手|へた|adj-na|E|unskilful, bad at
得意|とくい|adj-na|I|good at; one's strong point
苦手|にがて|adj-na|I|weak at; not fond of
便利|べんり|adj-na|E|convenient
不便|ふべん|adj-na|E|inconvenient
有名|ゆうめい|adj-na|E|famous
親切|しんせつ|adj-na|E|kind
簡単|かんたん|adj-na|E|easy, simple
大変|たいへん|adj-na|E|tough, hard; serious|As an adverb: very.
暇|ひま|adj-na|E|free (time); not busy
丁寧|ていねい|adj-na|I|polite; careful
変|へん|adj-na|E|strange, odd
本当|ほんとう|n|E|truth; real
無理|むり|adj-na|E|impossible; unreasonable
残念|ざんねん|adj-na|E|regrettable, a pity
特別|とくべつ|adj-na|E|special
必要|ひつよう|adj-na|E|necessary
安全|あんぜん|adj-na|E|safe
危険|きけん|adj-na|I|dangerous
自由|じゆう|adj-na|I|free (freedom)
確か|たしか|adj-na|I|certain, sure|As an adverb: "if I remember correctly".
正直|しょうじき|adj-na|I|honest
不思議|ふしぎ|adj-na|I|mysterious, strange
素直|すなお|adj-na|I|honest, straightforward; obedient
真面目|まじめ|adj-na|E|serious, diligent
賑やか|にぎやか|adj-na|E|lively, bustling
立派|りっぱ|adj-na|I|splendid, fine
幸せ|しあわせ|adj-na|E|happy (in life)
曖昧|あいまい|adj-na|A|vague, ambiguous
複雑|ふくざつ|adj-na|I|complicated
単純|たんじゅん|adj-na|I|simple
正確|せいかく|adj-na|I|accurate, precise
穏やか|おだやか|adj-na|I|calm, gentle
平和|へいわ|adj-na|I|peace; peaceful
平穏|へいおん|adj-na|A|calm, tranquil
無事|ぶじ|adj-na|I|safe, without incident
素敵|すてき|adj-na|E|lovely
適当|てきとう|adj-na|I|suitable|In casual speech it often means "half-hearted, careless".
十分|じゅうぶん|adj-na|E|enough
同じ|おなじ|adj-na|E|same|Comes directly before a noun without な: {同|おな}じ{道|みち}.
色々|いろいろ|adj-na|E|various
様々|さまざま|adj-na|I|various, diverse
楽|らく|adj-na|I|easy, comfortable
嫌|いや|adj-na|E|unpleasant; (I) don't want to
邪魔|じゃま|adj-na|I|in the way, a nuisance
余計|よけい|adj-na|A|unnecessary, uncalled-for|As an adverb: all the more.
大げさ|おおげさ|adj-na|A|exaggerated
控えめ|ひかえめ|adj-na|A|modest, reserved
率直|そっちょく|adj-na|A|frank, candid
遠回し|とおまわし|adj-na|A|indirect, roundabout
失礼|しつれい|adj-na|E|rude|{失礼|しつれい}します is a polite "excuse me".
平気|へいき|adj-na|I|fine, unbothered
孤独|こどく|adj-na|A|solitary; solitude
上品|じょうひん|adj-na|I|elegant, refined
退屈|たいくつ|adj-na|I|boring; bored
地味|じみ|adj-na|I|plain, subdued
派手|はで|adj-na|I|showy, flashy
いい加減|いいかげん|adj-na|A|irresponsible, sloppy
微妙|びみょう|adj-na|A|subtle, delicate|In casual speech: "so-so, doubtful".
意外|いがい|adj-na|I|unexpected
当然|とうぜん|adj-na|I|natural, a matter of course
結構|けっこう|adj-na|I|fine, good enough|いいえ、{結構|けっこう}です = "no, thank you". As an adverb: quite, fairly.
`));

  // Adverbs and sound-symbolic words
  core.push(...T(`
とても||adv|F|very
すごく||adv|E|really, extremely (casual)
ちょっと||adv|F|a little|Also a soft way to decline: "that's a bit…".
少し|すこし|adv|E|a little
たくさん||adv|F|a lot, many
いっぱい||adv|E|full; a lot, plenty
よく||adv|E|often; well
もっと||adv|E|more
一番|いちばん|adv|E|most; number one
ずっと||adv|E|all the time; by far
全然|ぜんぜん|adv|E|(not) at all (with a negative)
あまり||adv|E|(not) very (with a negative)
本当に|ほんとうに|adv|E|really
きっと||adv|E|surely, certainly
たぶん||adv|E|probably, maybe
必ず|かならず|adv|I|without fail, always
ぜひ||adv|I|by all means
一緒に|いっしょに|adv|E|together
一人で|ひとりで|adv|E|alone, by oneself
ゆっくり||adv|E|slowly; at ease
はっきり||adv|I|clearly
しっかり||adv|I|firmly; properly
やっと||adv|E|finally, at last (with relief)
ついに||adv|I|finally, in the end
とうとう||adv|I|at last, finally
急に|きゅうに|adv|I|suddenly
突然|とつぜん|adv|I|suddenly, abruptly
すっかり||adv|I|completely
ほとんど||adv|I|almost; mostly
全部|ぜんぶ|n|E|all, everything
全く|まったく|adv|I|entirely; (not) at all
決して|けっして|adv|I|never (with a negative)
絶対|ぜったい|adv|I|absolutely, definitely
まさか||adv|I|surely not; no way
やはり||adv|I|as expected; after all
やっぱり||adv|E|as expected; after all (casual)
さすが||adv|A|as you'd expect (of someone); impressive|Praise that fits someone's known ability: さすがですね.
むしろ||adv|A|rather; if anything
かえって||adv|A|on the contrary; instead (the opposite of what was expected)
いっそ||adv|A|rather (choosing a drastic option); might as well
せっかく||adv|A|with much trouble; since (one has gone to the trouble)|Often: せっかく…のに "after all that effort, but …".
わざわざ||adv|A|going out of one's way (to do something)
どうせ||adv|A|anyway (resigned: it will make no difference)
相変わらず|あいかわらず|adv|A|as always, as usual
相当|そうとう|adv|A|considerably
かなり||adv|I|fairly, quite
わりと||adv|I|relatively, comparatively
案外|あんがい|adv|A|unexpectedly
意外と|いがいと|adv|I|surprisingly
まるで||adv|I|just like (with ようだ or みたい)
実は|じつは|adv|E|actually, to tell the truth
実際|じっさい|adv|I|actually, in reality
特に|とくに|adv|E|especially
確かに|たしかに|adv|I|certainly, indeed
ただ||adv|I|only, just|As a conjunction: however.|free of charge
再び|ふたたび|adv|A|again (written style)
また||adv|F|again; also
まず||adv|E|first of all
先に|さきに|adv|E|first, ahead
なかなか||adv|I|quite|With a negative: not easily ({開|あ}かない "won't open").
なるべく||adv|I|as much as possible
できるだけ||adv|I|as much as possible
ちゃんと||adv|E|properly (casual)
きちんと||adv|I|neatly, properly
そっと||adv|I|softly, gently; quietly
じっと||adv|I|still, without moving; fixedly
ふと||adv|A|suddenly, by chance (without thinking)
次第に|しだいに|adv|A|gradually
少しずつ|すこしずつ|adv|I|little by little
既に|すでに|adv|A|already
もはや||adv|A|no longer; by now
未だに|いまだに|adv|A|still (even now)
今にも|いまにも|adv|A|at any moment
到底|とうてい|adv|A|(not) possibly (with a negative)
一応|いちおう|adv|I|for now; just in case; more or less
とりあえず||adv|I|for now, first of all
恐らく|おそらく|adv|A|probably (formal)
せめて||adv|A|at least
さっぱり||adv|I|(not) at all; refreshed
しばらく||adv|I|for a while
もちろん||adv|E|of course
どうか||adv|I|please (earnestly); somehow
どうしても||adv|I|no matter what; simply (cannot)
なんとか||adv|I|somehow
なんだか||adv|I|somehow, for some reason
いよいよ||adv|I|at last (the time has come)
ようやく||adv|A|at last, finally (after a long time)
まっすぐ||adv|E|straight
ちょうど||adv|E|exactly; just
ほぼ||adv|I|almost, nearly
よほど||adv|A|very much; considerably
いきなり||adv|I|suddenly, without warning
わざと||adv|I|on purpose
思わず|おもわず|adv|I|without meaning to, in spite of oneself
こっそり||adv|I|secretly
ぴったり||adv|I|exactly; perfectly (fitting)
がっかり||adv|I|disappointed (がっかりする)
ほっと||adv|I|relieved (ほっとする)
どきどき||adv|I|(heart) pounding (excitement, nerves)
ぴかぴか||adv|E|sparkling, shiny
ぽかぽか||adv|E|pleasantly warm
しとしと||adv|I|(rain) falling gently and steadily
ざあざあ||adv|I|(rain) pouring
ゆらゆら||adv|I|swaying gently
きらきら||adv|E|glittering, twinkling
こつこつ||adv|I|steadily, bit by bit; a tapping sound
ぐっすり||adv|I|(sleeping) soundly
`));

  // Conjunctions
  core.push(...T(`
だから||conj|E|so, therefore
それで||conj|E|and then; so (because of that)
そして||conj|E|and; and then
しかし||conj|I|however (formal)
ところが||conj|A|however; but (contrary to expectation)
つまり||conj|I|in other words; in short
ただし||conj|A|however; provided that (adds a condition)
それから||conj|E|after that; and also
それに||conj|I|besides, moreover
それでも||conj|I|even so
すると||conj|I|then, thereupon
なぜなら||conj|A|because (formal; followed by …からだ)
または||conj|I|or
あるいは||conj|A|or; perhaps
それとも||conj|I|or (in questions)
ところで||conj|I|by the way
さて||conj|I|well, now (changing the topic)
だって||conj|I|because; but (casual, justifying oneself)
それなら||conj|I|in that case
じゃあ||conj|E|well then (casual)
それでは||conj|E|well then (formal)
だが||conj|A|but (plain, written)
一方|いっぽう|conj|A|on the other hand; meanwhile
そのうえ||conj|A|moreover
とはいえ||conj|A|even so; that said
`));

  // Expressions, greetings, interjections
  core.push(...T(`
こんにちは||exp|F|hello; good afternoon|The final は is pronounced wa.
おはよう||exp|F|good morning (casual)
おはようございます||exp|F|good morning (polite)
こんばんは||exp|F|good evening|The final は is pronounced wa.
さようなら||exp|F|goodbye (for a long time)|Can sound final; friends often say じゃあね or またね.
ありがとう||exp|F|thank you
ありがとうございます||exp|F|thank you (polite)
すみません||exp|F|excuse me; I'm sorry|Also thanks someone who went to some trouble.
ごめんなさい||exp|F|I'm sorry
ごめん||exp|E|sorry (casual)
いただきます||exp|F|said before eating ("I humbly receive")
ごちそうさま||exp|E|said after eating (thanks for the meal)
ごちそうさまでした||exp|E|said after eating (polite)
お願いします|おねがいします|exp|E|please (making a request)
どうぞ||exp|F|please (go ahead; here you are)
どうも||exp|E|thanks; hi
はい||int|F|yes|Also "I'm listening" or "here you are".
いいえ||int|F|no|Also a modest reply to thanks: "not at all".
ええ||int|E|yes (softer)|With a rising tone: "eh?" (surprise).
うん||int|F|yeah (casual yes)
ううん||int|E|no, nope (casual)
いってきます||exp|E|"I'm off" (said when leaving home)
いってらっしゃい||exp|E|"see you later" (to someone leaving)
ただいま||exp|E|"I'm home"
おかえり||exp|E|"welcome home" (casual)
おかえりなさい||exp|E|"welcome home"
おやすみ||exp|E|good night (casual)
おやすみなさい||exp|E|good night
はじめまして||exp|E|nice to meet you (at a first meeting)
よろしく||exp|E|please treat me well; best regards
よろしくお願いします|よろしくおねがいします|exp|E|nice to meet you; thank you in advance
失礼します|しつれいします|exp|E|excuse me (entering, leaving, interrupting)
おめでとう||exp|E|congratulations
気をつけて|きをつけて|exp|E|take care; be careful
お疲れ様|おつかれさま|exp|I|thanks for your hard work
お疲れ様でした|おつかれさまでした|exp|I|thanks for your hard work (polite)
お待たせしました|おまたせしました|exp|I|sorry to keep you waiting
ようこそ||exp|E|welcome
いらっしゃいませ||exp|E|welcome (to a shop or an inn)
いらっしゃい||exp|E|welcome; come in (casual)
お大事に|おだいじに|exp|I|take care of yourself (to someone ill)
お元気ですか|おげんきですか|exp|E|how are you?
じゃあね||exp|E|see you (casual)
またね||exp|E|see you (casual)
ください||exp|E|please give me|After a て-form: "please (do …)".
ちょうだい||exp|I|please give me (casual)
ございます||exp|I|there is; is (very polite)
なるほど||int|I|I see; that makes sense
そうですね||exp|E|that's right; let me see…
そうか||exp|E|I see (casual)
そうですか||exp|E|is that so?; I see
よかった||exp|E|that's good; what a relief
やった||int|E|I did it!; yay!
へえ||int|E|huh!; really? (interest)
あっ||int|F|ah!; oh!
ええと||int|E|um, let me see
あのう||int|E|um, excuse me (to get attention)
まあ||int|E|well; oh my
さあ||int|E|come on; well (I'm not sure)
ほら||int|E|look!; see?
おい||int|I|hey! (rough)
かもしれない||exp|E|might, may
かもしれません||exp|E|might, may (polite)
仕方がない|しかたがない|exp|I|it can't be helped
ことがある||exp|I|have (done) before (after a past form); sometimes (after a dictionary form)
ことにする||exp|I|decide to
ことになる||exp|I|it has been decided that; it turns out that
ようにする||exp|I|make a point of; try to
ようになる||exp|I|come to (do or be able to do)
ざるを得ない|ざるをえない|exp|A|have no choice but to|Attaches to the negative stem: {行|い}かざるを{得|え}ない. する becomes せざるを{得|え}ない.
わけではない||exp|A|it's not that; it doesn't mean that
わけにはいかない||exp|A|can't very well (for social or moral reasons)
に過ぎない|にすぎない|exp|A|is merely, is no more than
にもかかわらず||exp|A|despite, in spite of
ずにはいられない||exp|A|can't help (doing)
というより||exp|A|rather than (saying) …
に越したことはない|にこしたことはない|exp|A|nothing is better than; it's best to
ことか||exp|A|how (very) …! (exclamation)
`));

  // Nouns: abstract, story, language, and intermediate/advanced vocabulary
  core.push(...T(`
名前|なまえ|n|F|name
名|な|n|I|name (literary)
言葉|ことば|n|E|word; language
文字|もじ|n|E|letter, character (writing)
字|じ|n|E|character; handwriting
漢字|かんじ|n|E|kanji (Chinese characters)
ひらがな||n|F|hiragana
カタカナ||n|F|katakana
日本語|にほんご|n|E|Japanese (language)
英語|えいご|n|E|English (language)
文|ぶん|n|I|sentence
話|はなし|n|E|story; talk
物語|ものがたり|n|I|story, tale
昔話|むかしばなし|n|I|old tale, folk tale
歌|うた|n|F|song
音|おと|n|E|sound
音楽|おんがく|n|E|music
夢|ゆめ|n|E|dream
願い|ねがい|n|I|wish, request
命|いのち|n|I|life
魂|たましい|n|A|soul
思い出|おもいで|n|I|memory (a fond recollection)
噂|うわさ|n|I|rumour
問題|もんだい|n|E|problem; question
答え|こたえ|n|E|answer
勇気|ゆうき|n|I|courage
魔法|まほう|n|I|magic
呪い|のろい|n|A|curse
祈り|いのり|n|I|prayer
精霊|せいれい|n|A|spirit (of nature)
幽霊|ゆうれい|n|I|ghost
怪物|かいぶつ|n|I|monster
戦い|たたかい|n|I|battle, fight
守り|まもり|n|A|defence, protection
仕事|しごと|n|E|work, job
旅|たび|n|E|journey
休み|やすみ|n|E|rest; holiday, day off
祭り|まつり|n|E|festival
伝統|でんとう|n|I|tradition
儀式|ぎしき|n|A|ceremony, ritual
伝説|でんせつ|n|I|legend
歴史|れきし|n|I|history
愛|あい|n|E|love
数字|すうじ|n|E|number, digit
雑誌|ざっし|n|E|magazine
日記|にっき|n|E|diary
こと||n|E|thing (abstract), matter|An event, fact or idea; for a physical object use {物|もの}.
はず||n|I|should be; expected to be (a reasonable expectation)
わけ||n|I|reason; meaning|～わけだ: "that's why …, no wonder".
つもり||n|I|intention, plan
ため||n|I|for the sake of; in order to; because of
よう||n|I|way, manner; seems like (～ようだ)
方|かた|n|E|person (polite)|After a verb stem: way of doing ({読|よ}み{方|かた} "how to read").
方|ほう|n|E|direction; side|In comparisons: ～ほうが "… is more"; ～たほうがいい "you'd better".
気|き|n|E|spirit; mind; mood|Appears in many expressions: {気|き}をつける, {気|き}がする, {気|き}になる.
気持ち|きもち|n|E|feeling
気配|けはい|n|A|sign, indication (e.g. of someone's presence)
感情|かんじょう|n|I|emotion
本音|ほんね|n|A|one's true feelings
建前|たてまえ|n|A|the position one presents in public
皮肉|ひにく|n|A|irony; sarcasm
冗談|じょうだん|n|I|joke
嘘|うそ|n|E|lie|うそ! can also mean "no way!".
真実|しんじつ|n|I|truth
事実|じじつ|n|I|fact
証拠|しょうこ|n|I|evidence, proof
手がかり|てがかり|n|I|clue
秘密|ひみつ|n|E|secret
意味|いみ|n|E|meaning
意見|いけん|n|I|opinion
責任|せきにん|n|I|responsibility
義務|ぎむ|n|A|duty, obligation
権利|けんり|n|A|right (entitlement)
規則|きそく|n|I|rule, regulation
決まり|きまり|n|I|rule; arrangement
公文書|こうぶんしょ|n|A|official document
書類|しょるい|n|I|documents, papers
静寂|せいじゃく|n|A|silence, stillness
秩序|ちつじょ|n|A|order (orderliness)
痛み|いたみ|n|I|pain
悲しみ|かなしみ|n|I|sadness
苦しみ|くるしみ|n|A|suffering
償い|つぐない|n|A|atonement, amends
被害|ひがい|n|I|damage, harm (suffered)
損害|そんがい|n|A|damage, loss
原因|げんいん|n|I|cause
結果|けっか|n|I|result
理由|りゆう|n|E|reason
目的|もくてき|n|I|purpose, aim
条件|じょうけん|n|I|condition
状況|じょうきょう|n|I|situation
事情|じじょう|n|A|circumstances
立場|たちば|n|I|position, standpoint
態度|たいど|n|I|attitude
口実|こうじつ|n|A|pretext
思いやり|おもいやり|n|I|consideration, compassion
気遣い|きづかい|n|A|thoughtfulness, concern (for others)
敬語|けいご|n|I|honorific (polite) language
恩|おん|n|A|debt of gratitude, a favour received
借り|かり|n|I|debt; a favour owed
貸し|かし|n|I|loan; a favour someone owes you
間違い|まちがい|n|E|mistake
`));

  // Affixes
  core.push(...T(`
お||pref|E|polite prefix (e.g. お{茶|ちゃ}, お{水|みず})
ご||pref|E|polite prefix (mostly before Sino-Japanese words: ご{家族|かぞく})
さん||suf|F|Mr./Ms. (polite name suffix)|Never used for oneself.
くん||suf|E|name suffix (for boys, or juniors)
ちゃん||suf|E|name suffix (affectionate: children, close friends)
様|さま|suf|I|Mr./Ms. (very polite)
たち||suf|E|plural suffix for people ({私|わたし}たち)
屋|や|suf|E|shop; person who deals in ({本屋|ほんや} = bookshop)
中|じゅう|suf|I|throughout ({一日中|いちにちじゅう} = all day)
中|ちゅう|suf|I|during, in the middle of ({仕事中|しごとちゅう})
的|てき|suf|I|-ic, -ical (forms な-adjectives)
語|ご|suf|E|language ({日本語|にほんご})
`));

  // Katakana loanwords used in the kana lessons and around the world
  core.push(...T(`
ココア||n|F|cocoa
イカ||n|F|squid|Often written in katakana.
アイス||n|F|ice cream; ice
スイカ||n|F|watermelon|Often written in katakana.
テスト||n|F|test
テキスト||n|F|textbook; text
ネクタイ||n|F|necktie
テニス||n|F|tennis
ナイフ||n|F|knife
トマト||n|F|tomato
メモ||n|F|memo, note
ハム||n|F|ham
マスク||n|F|mask
タイヤ||n|F|tyre
カメラ||n|F|camera
トイレ||n|F|toilet
ホテル||n|F|hotel
クラス||n|F|class
ワイン||n|F|wine
レモン||n|F|lemon
メロン||n|F|melon
ベンチ||n|F|bench
ポスト||n|F|postbox
ピアノ||n|F|piano
シャツ||n|F|shirt
ジャム||n|F|jam
キャベツ||n|F|cabbage
バッグ||n|F|bag
ケーキ||n|F|cake
コーヒー||n|F|coffee
ノート||n|F|notebook
フォーク||n|F|fork
ソファ||n|F|sofa
パーティー||n|F|party
ヴァイオリン||n|F|violin|Also written バイオリン.
`));

  // Romaji overrides where は is the (historical) particle inside a fixed word.
  const RO = {
    こんにちは: 'konnichiwa', こんばんは: 'konbanwa', ではない: 'dewa nai', ではありません: 'dewa arimasen',
    ではなかった: 'dewa nakatta', ではありませんでした: 'dewa arimasen deshita', わけではない: 'wake dewa nai',
    わけにはいかない: 'wake ni wa ikanai', ざるを得ない: 'zaru o enai', 気をつけて: 'ki o tsukete',
    にもかかわらず: 'ni mo kakawarazu', ずにはいられない: 'zu ni wa irarenai', に越したことはない: 'ni koshita koto wa nai',
    とはいえ: 'to wa ie',
  };
  core.forEach((e) => {
    if (RO[e.w]) e.ro = RO[e.w];
    if (e.w === '灯貨') e.fic = true;
  });
  RB.lex.add(core, 'core');
})();
