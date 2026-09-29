/* RB.kanjiInfo — what the game knows about each kanji it displays, for the
 * writing pad's chart (src/ui/62_kanjichart.js). Built on first use from the
 * game's own data; nothing here is fetched or invented:
 *  - readings: RB.kanjiRead (tools/kanjiread.mjs: the game's furigana and
 *    lexicon), most used first;
 *  - words: every lexicon word written with the kanji (RB.lex, with the words
 *    the content adds), most basic first (level, then length); names and
 *    fictional terms last;
 *  - meaning: the kanji's own word, when the lexicon has the kanji alone as a
 *    word (水 "water"); otherwise the chart shows the words that use it;
 *  - stroke count and radical: KanjiVG, through RB.recog.
 * Classification (docs/RECOGNITION.md "The chart"):
 *  - by use: from the parts of speech of the words written with the kanji
 *    (nouns, verbs, describing words, counters and numbers, names). A kanji is
 *    on every page its words give it.
 *  - by theme: one theme per kanji, from English keywords in the first sense
 *    of the meanings of its own word (weight 3) and of its four most basic
 *    words (1 each; the most basic counts 2 when there is no word of its
 *    own), with KanjiVG's radical adding 1 to a theme the words already point
 *    to. A theme needs a score of 2 and a clear lead; anything else is
 *    "Other" rather than a guess. Numerals are "Time and numbers".
 * Search: by kanji, by a word written with it, by kana reading (hiragana or
 * katakana), by rōmaji (Hepburn or 'wāpuro' spellings) and by English meaning.
 * "Met": kanji in the scenes the player has seen, the inscriptions they can
 * weave, the words they have practised or noted. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.kanjiInfo = (function () {
  'use strict';
  const K = RB.kana;

  // Keywords are matched as whole English words in the first sense of a
  // meaning (plurals and -ing/-ed forms fold). Words that are ambiguous in
  // English (light, well, spring, pass, order, line, point...) are left out.
  const THEMES = [
    { id: 'water', en: 'Water and liquids', jp: '{水|みず}', kw: 'water waters river rivers sea seas ocean lake pond wave waves tide tides flow flood pour wash washing laundry bath bathe bathing drink drinks tea sake wine alcohol beer soup broth oil liquid wet damp moist soak soaked stream brook swim float sink drown boil boiling steam drip drops tears tear sweat milk juice spill splash bubble bubbles foam puddle waterfall ink harbour harbor port ferry shore beach bay rinse dye dyed thirsty thirst dew fountain canal dam flooding submerged underwater waterside riverside seaside coastal coast offshore cove inlet pier wharf dock quay drainage drain leak overflow melt stagnate brew whirlpool swirl weir current currents splash ripple droplet flask mug backflow channel waterway' },
    { id: 'nature', en: 'Nature and weather', jp: '{自然|しぜん}', kw: 'sky sun sunlight moon star stars constellation cloud clouds cloudy rain rainy snow snowy wind windy storm typhoon thunder lightning weather fog foggy mist misty frost ice icy freeze frozen rainbow mountain mountains hill hills valley meadow forest woods stone stones rock rocks pebble earth soil sand mud muddy fire flame flames ash ashes smoke season seasons summer autumn winter island cave cliff desert ground land peak slope shadow shade dawn dusk sunset sunrise twilight moonlight starlight heaven heavens horizon landscape scenery lull sunny eclipse volcano crater wilderness light spring cape crystal dust lump mound cairn slope layer stratum shine glow gleam sparkle blizzard snowstorm hail breeze gust drought heat air atmosphere universe cosmos summit darkness burn burning scorch scorched charcoal soot embers spark sparks firebreak' },
    { id: 'living', en: 'Animals and plants', jp: '{生|い}き{物|もの}', kw: 'animal animals creature creatures bird birds fish horse horses dog dogs puppy cat cats cow cows cattle ox sheep pig insect insects bug butterfly moth snake dragon crow owl fox deer bear wolf monkey rabbit mouse rat frog turtle tortoise whale feather feathers wing wings tail beak claw claws nest crane hawk eagle sparrow chicken hen duck goose bee bees spider worm shell tree trees flower flowers blossom blossoms grass leaf leaves plant plants seed seeds root roots branch branches bamboo pine cherry reed reeds moss bud petal fruit vine rice mushroom herb herbs weed weeds willow maple plum wheat barley crop crops harvest beast beasts egg eggs squid octopus crab shrimp prawn eel sardine mackerel carp bream salmon tuna oyster clam jellyfish bat heron swallow firefly cicada ant mosquito flea silkworm hedge orchard lumber timber firewood kelp seaweed persimmon chestnut chestnuts peach pear ume apricot yuzu trunk bloom blooming bud seashell pet livestock poultry ginger pumpkin bean beans radish cabbage onion garlic potato cucumber melon grape grapes lemon ripen ripe wilt wilted droop sapling seedling vegetables vegetable honey brambles scrub thorn thorns straw hay fluff' },
    { id: 'body', en: 'People and the body', jp: '{人|ひと}と{体|からだ}', kw: 'person people man men woman women child children kid boy girl baby family mother father mom dad parent parents son daughter brother sister sibling twins husband wife grandmother grandfather grandchild aunt uncle nephew niece cousin relative relatives ancestor ancestors friend friends companion comrade colleague stranger guest crowd self oneself yourself himself herself someone everyone everybody anyone human humans i me you he she we they body head face eye eyes ear ears nose mouth lip lips tooth teeth tongue neck throat shoulder shoulders arm arms elbow hand hands palm finger fingers thumb leg legs foot feet toe knee knees back waist hip chest breast belly stomach heart lung lungs liver blood bone bones skin hair beard muscle nerve brain breath breathe health healthy illness sick ill disease fever injury injured wound pain ache medicine doctor nurse patient life death dead die dies died dying alive born birth age elderly adult youth youngster height stature appearance figure ghost corpse grave guy fellow lad miss cure heal healing treatment sunstroke recovery everyone members attendant assistant registrar carpenter kill murder corpse wound blind deaf limb limbs flesh pulse sneeze cough yawn sleepy hungry hunger eyebrow eyebrows cheek cheeks forehead chin jaw itch itchy symptom symptoms ointment plaster diagnosis examine drunk senior junior youngster craftsperson craftsman performer entertainer nobody who' },
    { id: 'places', en: 'Places and buildings', jp: '{場所|ばしょ}', kw: 'place places house houses home room rooms gate gates door doors entrance exit road roads street streets path town towns village villages city cities capital country countries land lands shop shops store stores temple temples shrine shrines castle tower towers bridge bridges school station inn market garden yard hall building buildings wall walls roof floor floors window windows stairs staircase corner north south east west inside outside interior exterior left right front behind rear side top bottom middle centre center area region district border world map province office library prison camp square lighthouse archive below under underground basement ceiling corridor hallway address position direction directions park warehouse storehouse residence resident neighbourhood neighborhood neighbour neighbor theatre plaza field fields farm farmland paddy pasture site spot location destination distance space nearby vicinity estate courtyard kitchen bathroom attic cellar hut cottage cabin tent barn stable shed mill factory workshop church palace hideout den lair ruins campsite ruin ruins stage reception studio courtyard threshold handrail surroundings around slot compartment section plot range extent landing crossing ford checkpoint barrier outpost frontier territory graveyard cemetery crossroads highway maze eaves' },
    { id: 'time', en: 'Time and numbers', jp: '{時|とき}と{数|かず}', kw: "time times day days year years month months hour hours minute minutes week weeks morning noon afternoon evening night nights tonight today yesterday tomorrow now then before after later early late soon always sometimes often never once twice ago past future present age era period moment instant while number numbers two three four five six seven eight nine ten eleven twelve twenty thirty hundred hundreds thousand thousands half first last next count counter calendar date clock daily weekly monthly yearly annual century decade schedule formerly again reunion final beginning ending end ends start completion finished sunday monday tuesday wednesday thursday friday saturday midnight midday overnight holiday anniversary birthday lifetime generation recently lately meanwhile until since during duration deadline limit several multiple double triple each every per already eternity history round lap precedent instant eternal forever ancient modern zero continue continued repeat repeated retirement usually mostly rarely suddenly abruptly express experience" },
    { id: 'mind', en: 'Feelings and the mind', jp: '{心|こころ}', kw: 'heart feel feeling feelings love like hate dislike fear afraid scared frightened fright terror happy happiness glad sad sadness sorrow grief anger angry furious joy joyful worry worried anxious anxiety uneasy think thought thoughts know knowledge remember memory memories forget understand believe belief hope wish dream dreams mind spirit soul sorry lonely loneliness kind kindness gentle calm surprise surprised shame ashamed embarrassed pride proud trust doubt wonder curious curiosity courage brave bravery coward patience mood emotion desire want miss envy jealous regret guilt guilty relief peace comfort pleasure pleasant painful suffer suffering consider decide decision intend intention wisdom wise foolish fool idea sense confusion premonition effort hardship trouble troubled strict severe selfish fair precious secret luck lucky fortune misfortune unfortunate unhappy excellent admirable honest careless consideration gratitude thanks thankful grateful excuse pardon forgive forgiveness misunderstanding mistake judgement judgment agreement approval consent refusal compromise sure certain habit custom attitude stance meticulous joke dear blessing atonement amends cry crying weep laugh laughing smile smiling tired exhausted bored interest interesting interested fun enjoy delight hurry lazy diligent serious earnest cheerful lively resolve resolution determination focus concentration attention care careful caution cautious respect respectful rude polite politeness nostalgia nostalgic longing yearning mercy pity sympathy compassion bitterness grudge revenge temper nervous tense relax relaxed relieved satisfied satisfaction disappointed disappointment impression intuition instinct conscience reason guess imagine imagination personality temperament scold resent resentment panic flustered lament grieve stubborn tenacity obsession boring cute sympathy talent miracle luxury worrier tendency disposition reproach grievance modest reserved refrain denial rejection welcome honour honor privilege splendid showy flashy necessary possibility coincidence chance premonition improvisation logic reasoning abnormality superstition thoughtfulness irony disguise frank candid essential cruel responsibility blame' },
    { id: 'speech', en: 'Speech and writing', jp: '{言葉|ことば}', kw: 'say says said speak speech talk talking word words language languages name names call ask answer read reading write writing written letter letters book books poem poetry song songs sing voice story stories tale tell listen hear sentence character characters kanji paper record records note notes sign message question lie lies promise explain explanation meaning chant prayer spell text page script inscription reply shout whisper sound sounds noise news report teach teaching learn lesson lessons study studies introduction request commission command understood roger conference talks rebuttal argument opposition postscript printing print copy dictionary grammar vocabulary phrase phrases expression expressions greeting greetings conversation discussion debate rumour rumor password title label diary journal log notice announcement document documents contract form forms list lists chart manual verse lyrics melody music tune rhythm chorus whistle echo rhyme proverb saying riddle vow oath curse praise thank blame complain complaint apologize apology invite invitation postcard mail envelope calligraphy handwriting draft novel article essay mutter groan hum drone protest criticism review evidence proof noticeboard posting proposal submission brackets pun duet applause clapping signpost respectful euphemistic indirect metaphor sutra scripture legend myth research translation translate signature magazine english context correction interpretation warning alarm state announce signboard calculation settlement details detailed' },
    { id: 'actions', en: 'Movement and actions', jp: '{動|うご}き', kw: 'go goes going come comes coming walk walking run running return returns enter entering leave leaving exit stand standing sit sitting carry hold holding take taking give giving grant push pull throw cut cutting open opening close closing shut stop stopping start starting begin finish make making build use using move moving fly flying fall falling rise rising climb cross meet wait follow search find catch hit strike fight fighting protect protection defend defence defense guard help helping work working play playing jump dance lift raise lower drop put turn travel journey arrive arrival depart departure chase escape hide show send bring fetch gather collect break fix mend repair tie bind wrap cover dig pick choose change grow shake touch press grab knock kick arrange compete exchange attach stretch extend visit accompany borrow lend preserve preservation keep maintain urge stab sting shave add addition win lose encourage recommend reach settle store deal dispose disposal sort sorting freeze pile support step slip practise practice wear set sleep wake rest stay live hurry rush wander roam lead guide sail row ride drive swing roll spin twist fold hang bow kneel crawl creep sneak sweep clean cleaning cook cooking eat eating bite chew taste smell see look watch observe glance stare notice hunt trap shoot aim fill peel scrape rub polish sew knit weave deliver receive accept offer prepare preparation plan planning try attempt meet borrow compare measure observe observation grind gut fillet knead scratch stroke scatter carve engrave paint spread bury buried increase decrease enclose surround contain include blow blowing handle treat rescue save lay tidy tidying span dent dented warp distort perish touring pilgrimage abolish scrapping coil wind rotate resist quarrel argue steal attack attacks avoid prevent block obstruct endure hire hired earn wager bet threaten scare nod peek gaze decorate entrust pack stuff swell bulge loosen slacken rot creak avert gush spout crush crushed perish packing casting cast seize snatch' },
    { id: 'things', en: 'Things and tools', jp: '{道具|どうぐ}', kw: 'tool tools sword swords knife knives blade blades bow arrow arrows boat boats ship ships cart wheel wheels box boxes crate bag bags sack cloth clothes clothing kimono garment thread rope cord string bell bells lamp lamps lantern lanterns candle candles mirror key keys lock money coin coins gold silver iron copper brass bronze metal steel glass brush cup bowl dish plate pot kettle table desk chair bed umbrella hat shoe shoes sandals thing things item items goods gift gifts jewel jewels gem ring needle net nets drum flute instrument toy fan shelf shelves basket barrel bottle jar ladder hammer saw axe spear shield armour armor bread food meal medicine photograph photo bandage seal stamp ticket uniform materials material device mechanism machine sweets candy cake stove hearth irori oven blanket cushion pillow towel handkerchief purse wallet mask belt button pocket sleeve collar scarf glove gloves boot boots pipe tube wire chain screw board plank pole stick staff cane cage frame screen curtain lens telescope compass comb rake shovel spade hoe sickle scissors loom anchor oar paddle vehicle wagon carriage cargo package parcel luggage baggage flag banner treasure pattern stake pillar beam fence bucket tub plug stopper bookmark shuttle carpet mat rug overcoat cloak chalk salt sugar lunch boxed stand pad model tassel tuft cosmetics inventory stock merchandise nail nails lid tray chopsticks raft kiln inkstone magnet pencil leather earring ornament paperweight axle shaft wick glaze wax grease starch flour millstone clapper piece pieces bolt costume embroidery lipstick rouge eyepiece peephole daifuku teapot' },
    { id: 'society', en: 'Society and work', jp: '{社会|しゃかい}', kw: 'king queen lord lady master servant soldier soldiers army war battle government official officials law laws rule rules regulation job jobs company trade buy buying sell selling sale price prices pay paid payment cost costs tax teacher student festival ceremony ceremonies god gods goddess religion society public private duty obligation team group member members rank title emperor prince princess guardian keeper clerk merchant farmer fisherman hunter priest monk guild council meeting business customer contract crime criminal thief thieves police court judge vote election manners courtesy ritual tradition recruit recruiting recruitment violation breach value worth debt gambling success succeed victory winning competition performance show theatre comedy guarantee prosperity economy industry profession employee employer boss manager staff worker workers labour labor salary wage wages income profit loss loan bank shopkeeper owner citizen citizens nation national politics politician minister chief leader captain commander general officer spy messenger envoy ambassador treaty alliance enemy enemies rival rivals funeral wedding marriage marry divorce celebration celebrate education exam examination test grade class classmate lecture university seminar academy accounts accounting privilege right rights troupe role leading stocktaking permission punishment punish culprit expenses expense accident disaster damage harm earnings prohibition forbid ban craft' },
    { id: 'qualities', en: 'Colours and qualities', jp: '{色|いろ}と{様子|ようす}', kw: 'red blue green yellow white black purple brown grey gray pink orange colour color colours colors bright dark big large huge small little tiny long short high tall low new old young strong weak fast quick slow heavy hot cold warm cool good bad beautiful pretty lovely ugly quiet loud noisy easy difficult hard soft true false same different many few much deep shallow wide broad narrow thick thin near far clean dirty rich poor safe dangerous danger strange odd special important simple plain sharp dull round square straight empty full correct wrong real polite sturdy durable ok okay inconvenient convenient both various temporary concrete specific valid effective tidy neat messy possible impossible free fine best worst usual normal ordinary common rare famous together alone single whole entire complete perfect enough excessive fresh stale sweet sour salty spicy delicious tasty rough smooth dry pale vivid clear transparent faint dim shiny glossy cheap expensive valuable worthless useful useless busy idle fierce wild tame mild harsh exact accurate vague similar resemble equal flat steep upright crooked broken convenient hard firm fixed wide spacious strong powerful width usual regular splendid showy flashy necessary luxury astringent astringency passive dented solitary indirect violent intense complicated complex dazzling smelly humid muggy pure genuine silent orderly especially vertical horizontal lengthways parallel diagonal reverse opposite stripe striped crack cracked sloppy amount dose sincere sincerity truly direct directly' },
  ];
  const OTHER = { id: 'other', en: 'Other', jp: 'その{他|ほか}' };
  const USES = [
    { id: 'noun', en: 'Nouns', jp: '{名詞|めいし}' },
    { id: 'verb', en: 'Verbs', jp: '{動詞|どうし}' },
    { id: 'desc', en: 'Describing words', jp: '{形容詞|けいようし}など' },
    { id: 'count', en: 'Counters and numbers', jp: '{数|かず}' },
    { id: 'name', en: 'Names', jp: '{名前|なまえ}' },
  ];
  // KanjiVG radicals whose meaning points to a theme (only ever corroborates
  // what the words already say).
  const RADICAL_THEME = {
    水: 'water', 氷: 'water', 雨: 'nature', 山: 'nature', 石: 'nature', 土: 'nature', 火: 'nature', 日: 'nature', 風: 'nature',
    木: 'living', 艸: 'living', 竹: 'living', 禾: 'living', 米: 'living', 鳥: 'living', 隹: 'living', 魚: 'living', 馬: 'living', 犬: 'living', 虫: 'living', 羽: 'living', 牛: 'living', 羊: 'living',
    人: 'body', 女: 'body', 子: 'body', 目: 'body', 耳: 'body', 肉: 'body', 頁: 'body', 手: 'body', 口: 'body', 足: 'body', 歯: 'body', 骨: 'body', 疒: 'body', 身: 'body', 毛: 'body',
    宀: 'places', 广: 'places', 門: 'places', 囗: 'places', 阜: 'places', 邑: 'places', 穴: 'places', 里: 'places',
    心: 'mind', 言: 'speech', 音: 'speech', 文: 'speech',
    辵: 'actions', 彳: 'actions', 走: 'actions', 力: 'actions', 攴: 'actions', 行: 'actions',
    金: 'things', 糸: 'things', 衣: 'things', 巾: 'things', 刀: 'things', 車: 'things', 舟: 'things', 皿: 'things', 弓: 'things', 食: 'things',
    貝: 'society', 示: 'society', 王: 'society', 士: 'society',
  };
  // numerals: the digits the lookup reads (RB.jp.numerals: 一…九 十 百 千 万)
  const isNumeral = (ch) => !!(RB.jp && RB.jp.numerals && RB.jp.numerals[ch] != null);
  const LVN = { F: 0, E: 1, I: 2, A: 3 };
  const POS_USE = (pos) => {
    if (!pos) return null;
    if (pos === 'name') return 'name';
    if (pos === 'ctr') return 'count';
    if (/^v(1|5|k|s-i)/.test(pos) || pos === 'v5aru') return 'verb';
    if (/^adj/.test(pos) || pos === 'adv') return 'desc';
    if (pos === 'n' || pos === 'pn' || pos === 'vs' || pos === 'suf' || pos === 'pref') return 'noun';
    return null;
  };

  const esc = (s) => String(s == null ? '' : s);
  const plainMeaning = (m) => esc(m).replace(/\{([^|}]+)\|[^}]+\}/g, '$1');
  const firstSense = (m) => plainMeaning(m).split(/[;；]/)[0].replace(/\([^)]*\)/g, ' ').trim();
  const tokens = (s) => (esc(s).toLowerCase().match(/[a-z][a-z'-]*/g) || []).map((w) => w.replace(/'s$/, ''));
  const KW = {};
  for (const t of THEMES) for (const w of t.kw.split(/\s+/)) if (w && !KW[w]) KW[w] = t.id;
  const themeOfWord = (w) => {
    let th = KW[w];
    if (!th && w.length > 4 && w.endsWith('s')) th = KW[w.slice(0, -1)];
    if (!th && w.length > 5 && w.endsWith('ing')) th = KW[w.slice(0, -3)] || KW[w.slice(0, -3) + 'e'];
    if (!th && w.length > 4 && w.endsWith('ed')) th = KW[w.slice(0, -2)] || KW[w.slice(0, -1)];
    return th || null;
  };
  // Themes named in a meaning: {theme: 1}, and 1.5 for the theme of its head
  // word (the verb of "to …", else the last word of the first gloss: "walking
  // stick" is a stick, "paper lantern" a lantern).
  function themesOf(text) {
    const hit = {};
    const stop = (w) => w === 'to' || w === 'a' || w === 'an' || w === 'the' || w === 'of' || w === 'one' || w === 'something' || w === 'someone';
    for (const w of tokens(text)) {
      if (stop(w)) continue;
      const th = themeOfWord(w);
      if (th) hit[th] = 1;
    }
    const gloss = tokens(String(text).split(',')[0]);
    let head = null;
    if (gloss[0] === 'to' && gloss[1]) head = gloss[1];
    else for (let i = gloss.length - 1; i >= 0 && !head; i--) if (!stop(gloss[i])) head = gloss[i];
    const ht = head ? themeOfWord(head) : null;
    if (ht) hit[ht] = 1.5;
    return hit;
  }

  // ---- readings (RB.kanjiRead, generated) ------------------------------------------
  let READ = null;
  function readingsOf(ch) {
    if (!READ) {
      READ = {};
      const r = (RB.kanjiRead && RB.kanjiRead.r) || '';
      for (const part of r.split(';')) {
        if (!part) continue;
        const k = String.fromCodePoint(part.codePointAt(0));
        READ[k] = part.slice(k.length).split(',').filter(Boolean);
      }
    }
    return READ[ch] || [];
  }

  // ---- the index --------------------------------------------------------------------
  let IDX = null, LIST = null;
  function kanjiList() {
    if (RB.recog && RB.recog.supported) return RB.recog.supported({ kanji: true }).filter((c) => K.isKanji(c));
    return Object.keys(READ || {});
  }
  function wordRank(e) {
    return (e.pos === 'name' ? 100 : 0) + (e.fic ? 50 : 0) + (e.pos === 'suf' || e.pos === 'pref' ? 40 : 0) + (LVN[e.lv] != null ? LVN[e.lv] : 3) * 10 + Math.min(9, Array.from(e.w).length);
  }
  // a word from the text for a kanji no lexicon word is written with; its
  // meaning from the lexicon's kana entry of the same reading, if there is one
  function textWord(f) {
    const [w, r] = f.split('|');
    const kana = RB.lex ? RB.lex.byReading(r).find((x) => x.w === r && x.pos !== 'name') : null;
    return { w, r, m: kana ? kana.m : null };
  }
  function build() {
    const list = kanjiList();
    const words = {};
    const seenW = new Set();
    for (const e of RB.lex ? RB.lex.all() : []) {
      if (!e.w || !K.hasKanji(e.w)) continue;
      const key = e.w + '|' + e.r + '|' + e.pos;
      if (seenW.has(key)) continue;
      seenW.add(key);
      for (const c of new Set(Array.from(e.w))) if (K.isKanji(c)) (words[c] = words[c] || []).push(e);
    }
    const counters = (RB.jp && RB.jp.counters) || {};
    const ctrKanji = new Set();
    for (const k of Object.keys(counters)) for (const c of Array.from(k)) if (K.isKanji(c)) ctrKanji.add(c);
    IDX = {};
    LIST = [];
    list.forEach((ch, order) => {
      const ws = (words[ch] || []).slice().sort((a, b) => wordRank(a) - wordRank(b) || (a.w < b.w ? -1 : a.w > b.w ? 1 : 0));
      const own = ws.find((e) => e.w === ch && !/^(name|suf|pref)$/.test(e.pos) && !e.fic) || null;
      const plainWs = ws.filter((e) => e.pos !== 'name' && !e.fic);
      // uses: the parts of speech of the words written with it
      const uses = new Set();
      for (const e of ws) { const u = POS_USE(e.pos); if (u) uses.add(u); }
      if (isNumeral(ch) || ctrKanji.has(ch)) uses.add('count');
      // theme
      const score = {};
      const why = [];
      const addT = (hit, w, src) => { for (const t in hit) { score[t] = (score[t] || 0) + w * hit[t]; why.push(src + '→' + t); } };
      if (own) addT(themesOf(firstSense(own.m)), 3, 'own word');
      const basic = plainWs.filter((e) => e !== own).slice(0, 4);
      // the most basic word stands for the kanji when it has no word of its own
      basic.forEach((e, i) => addT(themesOf(firstSense(e.m)), !own && !i ? 2 : 1, e.w));
      const rad = RB.recog && RB.recog.radical ? RB.recog.radical(ch) : null;
      const rt = rad && RADICAL_THEME[rad];
      if (rt && score[rt]) { score[rt] += 1; why.push('radical ' + rad + '→' + rt); }
      let theme = 'other';
      if (isNumeral(ch)) theme = 'time';
      else {
        const ranked = Object.entries(score).sort((a, b) => b[1] - a[1] || THEMES.findIndex((t) => t.id === a[0]) - THEMES.findIndex((t) => t.id === b[0]));
        // a tie is settled by the head word of the kanji's own (or most basic) word
        const rep = own || basic[0];
        const repHead = rep ? Object.keys(themesOf(firstSense(rep.m))).find((t) => themesOf(firstSense(rep.m))[t] > 1) : null;
        if (ranked.length && ranked[0][1] >= 2) {
          if (ranked.length < 2 || ranked[0][1] > ranked[1][1]) theme = ranked[0][0];
          else if (repHead && ranked.filter((r) => r[1] === ranked[0][1]).some((r) => r[0] === repHead)) { theme = repHead; why.push('tie: head of ' + rep.w); }
        }
      }
      const fallback = RB.kanjiRead && RB.kanjiRead.w && RB.kanjiRead.w[ch];
      const e = {
        ch, order,
        readings: readingsOf(ch),
        words: ws,
        own,
        meaning: own ? firstSense(own.m) : null,
        textWord: !ws.length && fallback ? textWord(fallback) : null,
        uses: USES.map((u) => u.id).filter((u) => uses.has(u)),
        theme,
        why: why.join(', '),
        radical: rad,
        strokes: RB.recog && RB.recog.strokeCount ? RB.recog.strokeCount(ch) : 0,
        level: plainWs.length ? plainWs[0].lv : ws.length ? ws[0].lv : 'A',
      };
      IDX[ch] = e;
      LIST.push(e);
    });
    return IDX;
  }
  function index() { return IDX || build(); }
  function get(ch) { return index()[ch] || null; }
  function all() { index(); return LIST.slice(); }
  function reset() { IDX = null; LIST = null; READ = null; }

  // ---- search -------------------------------------------------------------------------
  // rōmaji compared loosely: long vowels folded, Hepburn and 'wāpuro' spellings alike
  function romanKey(s) {
    let x = esc(s).toLowerCase().normalize('NFD').replace(/[̄̂]/g, (m) => '~').normalize('NFC');
    x = x.replace(/([aeiou])~/g, '$1$1').replace(/[^a-z]/g, '');
    x = x.replace(/si/g, 'shi').replace(/ti/g, 'chi').replace(/tu/g, 'tsu').replace(/hu/g, 'fu').replace(/zi/g, 'ji')
      .replace(/sy/g, 'sh').replace(/ty/g, 'ch').replace(/zy|jy/g, 'j').replace(/dzu|du/g, 'zu')
      .replace(/shhi/g, 'shi').replace(/chhi/g, 'chi').replace(/tsshu/g, 'tsu');
    x = x.replace(/n(?=[^aeiouy]|$)/g, 'n').replace(/nn/g, 'n').replace(/ou|oo/g, 'o').replace(/uu/g, 'u').replace(/aa/g, 'a').replace(/ii/g, 'i').replace(/ee|ei/g, 'e');
    return x;
  }
  const hira = (s) => (K.toHira ? K.toHira(s) : s);
  function searchKeys(e) {
    const rd = new Set(e.readings.map(hira));
    const words = e.words.slice(0, 12);
    const rom = new Set([...rd].map((r) => romanKey(K.romaji(r))));
    const wordReads = new Set(words.map((w) => hira(w.r || '')));
    const wordRom = new Set([...wordReads].map((r) => romanKey(K.romaji(r))));
    const own = e.own ? new Set(tokens(plainMeaning(e.own.m))) : new Set();
    // whole glosses ("sea", "to protect") of its own word, or of its most basic word
    const gl = new Set();
    const rep = e.own || words.find((w) => w.pos !== 'name');
    if (rep) for (const g of plainMeaning(rep.m).split(/[;,]/)) { const x = g.replace(/\([^)]*\)/g, ' ').toLowerCase().replace(/^\s*to\s+/, '').replace(/\s+/g, ' ').trim(); if (x) gl.add(x); }
    const mean = new Set();
    for (const w of words) if (w.pos !== 'name') for (const tk of tokens(plainMeaning(w.m))) mean.add(tk);
    return { rd, rom, words: words.map((w) => w.w), wordReads, wordRom, own, mean, gl, glOwn: !!e.own };
  }
  // Results for a query, best first: [{e, why}] (at most `limit`).
  function search(q, limit) {
    limit = limit || 60;
    const raw = esc(q).trim();
    if (!raw) return [];
    index();
    for (const e of LIST) if (!e.key) e.key = searchKeys(e);
    const out = [];
    const seen = new Set();
    const put = (e, rank, why) => { if (!e || seen.has(e.ch)) return; seen.add(e.ch); out.push({ e, rank, why, i: out.length }); };
    const chars = Array.from(raw);
    if (chars.some((c) => K.isKanji(c))) {
      // the kanji typed, in order, then kanji of words that contain the text typed
      for (const c of chars) if (K.isKanji(c)) put(IDX[c], 0, 'kanji');
      for (const e of LIST) if (e.key.words.some((w) => w.indexOf(raw) >= 0)) put(e, 1, 'word');
    } else if (chars.every((c) => K.isKana(c) || c === 'ー')) {
      const h = hira(raw);
      for (const e of LIST) if (e.key.rd.has(h)) put(e, 0, 'reading');
      for (const e of LIST) if (e.key.wordReads.has(h)) put(e, 1, 'word');
      for (const e of LIST) if ([...e.key.rd].some((r) => r.startsWith(h))) put(e, 2, 'reading');
      if (h.length >= 2) for (const e of LIST) if ([...e.key.wordReads].some((r) => r.startsWith(h))) put(e, 3, 'word');
    } else {
      const low = raw.toLowerCase();
      const words = tokens(low).filter((w) => !['to', 'a', 'an', 'the'].includes(w));
      const rk = romanKey(low);
      // exact reading in rōmaji, then English meaning words, then prefixes
      if (rk) for (const e of LIST) if (e.key.rom.has(rk)) put(e, 0, 'reading');
      if (words.length) {
        // a whole gloss of its own word ("sea"), then of its most basic word ("to protect")
        const phrase = words.join(' ');
        for (const e of LIST) if (e.key.glOwn && e.key.gl.has(phrase)) put(e, 0.5, 'meaning');
        for (const e of LIST) if (!e.key.glOwn && e.key.gl.has(phrase)) put(e, 0.6, 'meaning');
        const all = (set) => words.every((w) => set.has(w) || (w.length > 3 && set.has(w + 's')) || (w.endsWith('s') && set.has(w.slice(0, -1))));
        for (const e of LIST) if (all(e.key.own)) put(e, 1, 'meaning');
        if (rk) for (const e of LIST) if (e.key.wordRom.has(rk)) put(e, 2, 'word');
        for (const e of LIST) if (all(e.key.mean)) put(e, 3, 'meaning');
        const last = words[words.length - 1];
        if (last.length >= 3) for (const e of LIST) if ([...e.key.own, ...e.key.mean].some((m) => m.startsWith(last)) && words.slice(0, -1).every((w) => e.key.mean.has(w) || e.key.own.has(w))) put(e, 4, 'meaning');
      }
      if (rk.length >= 2) for (const e of LIST) if ([...e.key.rom].some((r) => r.startsWith(rk))) put(e, 5, 'reading');
    }
    out.sort((a, b) => a.rank - b.rank || a.i - b.i);
    return out.slice(0, limit).map((x) => ({ e: x.e, why: x.why }));
  }

  // ---- met ------------------------------------------------------------------------------
  // Kanji the player has met: in the scenes they have seen, the inscriptions
  // they can weave, and the words they have practised or noted.
  function met(s) {
    const set = new Set();
    if (!s) return set;
    const addText = (t) => { if (!t) return; for (const c of String(t)) if (K.isKanji(c)) set.add(c); };
    const C = RB.content || {};
    for (const id of Object.keys(s.seen || {})) {
      const sc = C.scenes && C.scenes[id];
      if (!sc || !sc.cmds) continue;
      for (const c of sc.cmds) {
        addText(c.jp);
        if (c.options) for (const o of c.options) addText(o && (o.jp || o.text));
      }
    }
    for (const w of s.words || []) { const x = C.words && C.words[w]; if (x) { addText(x.jpK); addText(x.jp); } }
    const items = (s.learn && s.learn.items) || {};
    for (const k of Object.keys(items)) addText(k.slice(2));
    for (const n of s.notebook || []) if (n && n.kind === 'word') addText(n.surface);
    return set;
  }

  function themes() { return THEMES.map((t) => ({ id: t.id, en: t.en, jp: t.jp })).concat([OTHER]); }
  function uses() { return USES.slice(); }
  function byTheme(id) { return all().filter((e) => e.theme === id); }
  function byUse(id) { return all().filter((e) => e.uses.indexOf(id) >= 0); }

  return { get, all, themes, uses, byTheme, byUse, search, met, reset, romanKey, readings: (ch) => readingsOf(ch).slice(), _internal: { themesOf, firstSense, KW, RADICAL_THEME, isNumeral, POS_USE } };
})();
