/* Companion shiritori: the shipped word list (Practice addendum §11.2). One line per entry:
 *   id|reading|head+tail|forms|display (ruby markup)|English meaning|themes|lexicalLevel|kind|repeatGroup|provenance
 * kind: c = common noun, x = established compound. head+tail are the house-rule boundaries
 * (authored here, checked against RB.shiritori.boundary when a bank is built).
 * Readings and forms were checked against local copies of JMdict (EDRDG, CC BY-SA 4.0;
 * the 2021-04-17 build in jamdict-data 1.5) and IPADIC 2.7.0 (via kuromoji 0.1.2), and
 * against this project's lexicon; see docs/practice/shiritori_banks/verification.md.
 * No dictionary text is copied: the English meanings are written for this game.
 * Provenance code: jm=<JMdict entry>/<priority tags>[/uk = usually written in kana];
 * ip=+ (IPADIC reads the form the same way) or ~<reading> (it reads it differently);
 * lx=<level> (already in the project lexicon) or new (added in 00_lex.js).
 * Nothing here has had native-speaker review. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const SH = RB.shiritori;
  if (!SH) return;
  // split on | outside ruby braces
  function fields(line) {
    const f = [];
    let cur = '', depth = 0;
    for (const ch of line) {
      if (ch === '{') depth++;
      else if (ch === '}') depth = Math.max(0, depth - 1);
      if (ch === '|' && depth === 0) { f.push(cur); cur = ''; } else cur += ch;
    }
    f.push(cur);
    return f;
  }
  const IPADIC = 'IPADIC 2.7.0 (via kuromoji 0.1.2)';
  const JMDICT = 'JMdict (EDRDG, CC BY-SA 4.0), 2021-04-17 build';
  function provenance(code, level) {
    const p = {};
    code.split(';').forEach((kv) => { const i = kv.indexOf('='); p[kv.slice(0, i)] = kv.slice(i + 1); });
    const out = [];
    const jm = (p.jm || '').split('/');
    out.push({ source: JMDICT, reviewed: true, note: 'entry ' + jm[0] + ': this reading and form as a common noun' + (jm[1] && jm[1] !== '-' ? '; priority ' + jm[1].split('.').join(' ') : '; no priority tag') + (jm[2] === 'uk' ? '; usually written in kana' : '') });
    if (p.ip === '+') out.push({ source: IPADIC, reviewed: true, note: 'reads the form the same way' });
    else out.push({ source: IPADIC, reviewed: false, note: 'reads the form as ' + String(p.ip || '').slice(1) + '; the JMdict reading is used' });
    if (p.lx === 'new') out.push({ source: 'meaning written for this word bank (src/content/shiritori/00_lex.js)', reviewed: false });
    else out.push({ source: 'project lexicon (level ' + p.lx + ')', reviewed: true });
    return { list: out, ref: 'jmdict:' + jm[0] };
  }
  const list = [];
  function table(text) {
    text.split('\n').forEach((ln) => {
      ln = ln.trim();
      if (!ln || ln[0] === '#') return;
      const f = fields(ln);
      const ht = Array.from(f[2]);
      const pv = provenance(f[10], f[7]);
      list.push({
        id: f[0], lemmaId: f[0].slice(2), repeatGroup: f[9], reading: f[1], head: ht[0], tail: ht[1],
        forms: f[3].split(','), display: { jp: f[4], en: f[5] }, themes: f[6].split(' '), lexicalLevel: f[7],
        nounKind: f[8] === 'x' ? 'established-compound' : 'common', lookupRef: pv.ref, provenance: pv.list,
      });
    });
  }

  // ---- Pocket ----
  table(`
w.ame.candy|あめ|あめ|飴|{飴|あめ}|boiled sweet, candy|food|pocket|c|rg.ame|jm=1153520/ichi1.news2.nf44;ip=+;lx=E
w.ame.rain|あめ|あめ|雨|{雨|あめ}|rain|weather|pocket|c|rg.ame|jm=1171900/ichi1.news1.nf02;ip=+;lx=F
w.atama|あたま|あま|頭|{頭|あたま}|head|body|pocket|c|rg.atama|jm=1582310/ichi1;ip=+;lx=E
w.chou|ちょう|ちう|蝶|{蝶|ちょう}|butterfly|animal|pocket|c|rg.chou|jm=1429010/ichi1.news1.nf18;ip=+;lx=new
w.donguri|どんぐり|どり|どんぐり|どんぐり|acorn|plant|pocket|c|rg.donguri|jm=1419200/spec1/uk;ip=+;lx=new
w.eki|えき|えき|駅|{駅|えき}|station|place|pocket|c|rg.eki|jm=1175140/ichi1.news1.nf05;ip=+;lx=E
w.fuku|ふく|ふく|服|{服|ふく}|clothes|clothing|pocket|c|rg.fuku|jm=1500940/ichi1.news1.nf04;ip=+;lx=F
w.gohan|ごはん|ごん|ご飯|ご{飯|はん}|cooked rice, a meal|food household|pocket|c|rg.gohan|jm=1270590/ichi1.news2.nf47;ip=+;lx=F
w.gorira|ごりら|ごら|ゴリラ|ゴリラ|gorilla|animal|pocket|c|rg.gorira|jm=1054600/gai1;ip=+;lx=new
w.hana.flower|はな|はな|花|{花|はな}|flower|plant|pocket|c|rg.hana|jm=1194500/ichi1.news1.nf01;ip=+;lx=F
w.hana.nose|はな|はな|鼻|{鼻|はな}|nose|body|pocket|c|rg.hana|jm=1486720/ichi1.news1.nf08;ip=+;lx=F
w.hashi.bridge|はし|はし|橋|{橋|はし}|bridge|place|pocket|c|rg.hashi|jm=1237410/ichi1.news1.nf05;ip=+;lx=F
w.hashi.chopsticks|はし|はし|箸|{箸|はし}|chopsticks|household|pocket|c|rg.hashi|jm=1476410/ichi1.news1.nf19;ip=+;lx=E
w.hon|ほん|ほん|本|{本|ほん}|book|writing|pocket|c|rg.hon|jm=1522150/ichi1;ip=+;lx=F
w.hoshi|ほし|ほし|星|{星|ほし}|star|nature light|pocket|c|rg.hoshi|jm=1376310/ichi1.news1.nf05;ip=+;lx=F
w.ie|いえ|いえ|家|{家|いえ}|house|place home|pocket|c|rg.ie|jm=1191730/ichi1;ip=+;lx=F
w.ika|いか|いか|いか|いか|squid|animal sea|pocket|c|rg.ika|jm=1171570/ichi1/uk;ip=+;lx=new
w.inu|いぬ|いぬ|犬|{犬|いぬ}|dog|animal|pocket|c|rg.inu|jm=1258330/ichi1.news1.nf03;ip=+;lx=F
w.isu|いす|いす|椅子|{椅子|いす}|chair|home|pocket|c|rg.isu|jm=1157070/ichi1.news1.nf22;ip=+;lx=F
w.kami.hair|かみ|かみ|髪|{髪|かみ}|hair (on the head)|body care|pocket|c|rg.kami|jm=1477950/ichi1.news1.nf06;ip=+;lx=E
w.kami.paper|かみ|かみ|紙|{紙|かみ}|paper|writing|pocket|c|rg.kami|jm=1311530/ichi1.news1.nf03;ip=+;lx=F
w.kani|かに|かに|蟹|{蟹|かに}|crab|animal sea|pocket|c|rg.kani|jm=1202410/ichi1.news2.nf43/uk;ip=+;lx=I
w.kao|かお|かお|顔|{顔|かお}|face|body|pocket|c|rg.kao|jm=1217730/ichi1.news1.nf01;ip=+;lx=F
w.kasa|かさ|かさ|傘|{傘|かさ}|umbrella|practical|pocket|c|rg.kasa|jm=1301940/ichi1.news1.nf11;ip=+;lx=F
w.ki|き|きき|木|{木|き}|tree|plant nature|pocket|c|rg.ki|jm=1534520/ichi1.news1.nf01;ip=+;lx=F
w.kimono|きもの|きの|着物|{着物|きもの}|kimono|clothing|pocket|c|rg.kimono|jm=1423240/ichi1.news1.nf09;ip=+;lx=E
w.kiri|きり|きり|霧|{霧|きり}|fog, mist|weather|pocket|c|rg.kiri|jm=1531110/ichi1.news1.nf11;ip=+;lx=E
w.kitsune|きつね|きね|狐|{狐|きつね}|fox|animal|pocket|c|rg.kitsune|jm=1267340/ichi1.news1.nf23/uk;ip=+;lx=E
w.kome|こめ|こめ|米|{米|こめ}|rice (uncooked)|food household|pocket|c|rg.kome|jm=1508750/ichi1;ip=~べい;lx=E
w.kuma|くま|くま|熊|{熊|くま}|bear|animal|pocket|c|rg.kuma|jm=1246850/ichi1.news1.nf13.spec1;ip=+;lx=E
w.kumo.cloud|くも|くも|雲|{雲|くも}|cloud|nature weather|pocket|c|rg.kumo|jm=1173100/ichi1.news1.nf06;ip=+;lx=F
w.kumo.spider|くも|くも|蜘蛛|{蜘蛛|くも}|spider|animal|pocket|c|rg.kumo|jm=1421960/ichi1.news2.nf37/uk;ip=+;lx=new
w.kuruma|くるま|くま|車|{車|くるま}|car|vehicle|pocket|c|rg.kuruma|jm=1323080/ichi1.news1.nf01;ip=+;lx=E
w.kusa|くさ|くさ|草|{草|くさ}|grass|plant|pocket|c|rg.kusa|jm=1401910/ichi1.news1.nf06;ip=+;lx=E
w.kutsu|くつ|くつ|靴|{靴|くつ}|shoes|clothing|pocket|c|rg.kutsu|jm=1246700/ichi1.news1.nf06;ip=+;lx=F
w.machi|まち|まち|町|{町|まち}|town|place|pocket|c|rg.machi|jm=1603990/ichi1.news1.nf02;ip=+;lx=F
w.mado|まど|まど|窓|{窓|まど}|window|home light|pocket|c|rg.mado|jm=1401400/ichi1.news1.nf04;ip=+;lx=F
w.makura|まくら|まら|枕|{枕|まくら}|pillow|household care|pocket|c|rg.makura|jm=1524860/ichi1.news1.nf23;ip=+;lx=E
w.mame|まめ|まめ|豆|{豆|まめ}|bean|food|pocket|c|rg.mame|jm=1450030/news1.nf12;ip=+;lx=E
w.me.bud|め|めめ|芽|{芽|め}|bud, sprout|plant|pocket|c|rg.me|jm=1197710/ichi1.news1.nf08;ip=+;lx=new
w.me.eye|め|めめ|目|{目|め}|eye|body|pocket|c|rg.me|jm=1604890/ichi1.news1.nf16;ip=+;lx=F
w.megane|めがね|めね|眼鏡|{眼鏡|めがね}|glasses, spectacles|practical writing|pocket|c|rg.megane|jm=1577670/ichi1.news1.nf13.spec1/uk;ip=+;lx=E
w.michi|みち|みち|道|{道|みち}|road, path|place|pocket|c|rg.michi|jm=1454080/ichi1.news1.nf01;ip=+;lx=F
w.mikan|みかん|みん|みかん|みかん|mandarin orange|food|pocket|c|rg.mikan|jm=1528410/ichi1/uk;ip=+;lx=F
w.momo|もも|もも|桃|{桃|もも}|peach|food plant|pocket|c|rg.momo|jm=1448290/ichi1.news1.nf13;ip=+;lx=E
w.mori|もり|もり|森|{森|もり}|forest|nature|pocket|c|rg.mori|jm=1362490/ichi1.news1.nf02;ip=+;lx=E
w.nami|なみ|なみ|波|{波|なみ}|wave|nature sea|pocket|c|rg.nami|jm=1470970/ichi1.news1.nf04;ip=+;lx=E
w.neko|ねこ|ねこ|猫|{猫|ねこ}|cat|animal|pocket|c|rg.neko|jm=1467640/ichi1.news1.nf07;ip=+;lx=F
w.nezumi|ねずみ|ねみ|ねずみ|ねずみ|mouse, rat|animal|pocket|c|rg.nezumi|jm=1397840/ichi1.news2.nf37.spec1/uk;ip=+;lx=new
w.niku|にく|にく|肉|{肉|にく}|meat|food|pocket|c|rg.niku|jm=1463520/ichi1.news1.nf05;ip=+;lx=E
w.nodo|のど|のど|喉|{喉|のど}|throat|body care|pocket|c|rg.nodo|jm=1600280/ichi1.news2.nf32/uk;ip=+;lx=E
w.nooto|のーと|のと|ノート|ノート|notebook|writing|pocket|c|rg.nooto|jm=1093450/gai1.ichi1;ip=+;lx=F
w.nori|のり|のり|海苔|{海苔|のり}|nori seaweed|food sea|pocket|c|rg.nori|jm=1201620/ichi1.news2.nf38/uk;ip=+;lx=new
w.nuno|ぬの|ぬの|布|{布|ぬの}|cloth|household|pocket|c|rg.nuno|jm=1496840/ichi1.news1.nf06;ip=+;lx=E
w.ocha|おちゃ|おや|お茶|お{茶|ちゃ}|tea|food household|pocket|c|rg.ocha|jm=1002430/ichi1.news1.nf06;ip=+;lx=F
w.pan|ぱん|ぱん|パン|パン|bread|food|pocket|c|rg.pan|jm=1103090/gai1.ichi1;ip=+;lx=F
w.rajio|らじお|らお|ラジオ|ラジオ|radio|home|pocket|c|rg.rajio|jm=1138860/gai1.ichi1;ip=+;lx=new
w.ringo|りんご|りご|りんご|りんご|apple|food|pocket|c|rg.ringo|jm=1555480/ichi1.news2.nf38/uk;ip=+;lx=F
w.saifu|さいふ|さふ|財布|{財布|さいふ}|wallet, purse|practical|pocket|c|rg.saifu|jm=1296970/ichi1.news1.nf10;ip=+;lx=E
w.sakana|さかな|さな|魚|{魚|さかな}|fish|animal sea|pocket|c|rg.sakana|jm=1578010/ichi1.news1.nf03.ichi2;ip=+;lx=F
w.sakura|さくら|さら|桜|{桜|さくら}|cherry tree, cherry blossom|plant|pocket|c|rg.sakura|jm=1593710/ichi1.news1.nf04;ip=+;lx=E
w.sara|さら|さら|皿|{皿|さら}|plate, dish|household|pocket|c|rg.sara|jm=1299680/ichi1.news1.nf10;ip=+;lx=E
w.shika|しか|しか|鹿|{鹿|しか}|deer|animal|pocket|c|rg.shika|jm=1319030/news1.nf10;ip=+;lx=E
w.shima|しま|しま|島|{島|しま}|island|nature place|pocket|c|rg.shima|jm=1446760/ichi1.news1.nf02;ip=+;lx=E
w.sushi|すし|すし|寿司|{寿司|すし}|sushi|food|pocket|c|rg.sushi|jm=1595650/ichi1.news2.nf35;ip=+;lx=new
w.tamago|たまご|たご|卵|{卵|たまご}|egg|food household|pocket|c|rg.tamago|jm=1549140/ichi1.news1.nf05;ip=+;lx=E
w.tanuki|たぬき|たき|狸|{狸|たぬき}|tanuki (raccoon dog)|animal|pocket|c|rg.tanuki|jm=1416770/news2.nf33.spec1/uk;ip=+;lx=new
w.tokei|とけい|とい|時計|{時計|とけい}|clock, watch|home practical|pocket|c|rg.tokei|jm=1316140/ichi1.news1.nf07;ip=+;lx=E
w.tomato|とまと|とと|トマト|トマト|tomato|food|pocket|c|rg.tomato|jm=1085420/gai1.ichi1;ip=+;lx=F
w.tora|とら|とら|虎|{虎|とら}|tiger|animal|pocket|c|rg.tora|jm=1267610/ichi1.news1.nf06.spec1;ip=+;lx=new
w.tori|とり|とり|鳥|{鳥|とり}|bird|animal|pocket|c|rg.tori|jm=1430250/ichi1.news1.nf04;ip=+;lx=F
w.tsuki|つき|つき|月|{月|つき}|moon|nature light|pocket|c|rg.tsuki|jm=1255430/ichi1;ip=+;lx=E
w.tsukue|つくえ|つえ|机|{机|つくえ}|desk|home writing|pocket|c|rg.tsukue|jm=1220210/ichi1.news1.nf07;ip=+;lx=F
w.uma|うま|うま|馬|{馬|うま}|horse|animal|pocket|c|rg.uma|jm=1471560/ichi1.news1.nf02;ip=+;lx=E
w.umi|うみ|うみ|海|{海|うみ}|sea|nature sea|pocket|c|rg.umi|jm=1201190/ichi1.news1.nf02;ip=+;lx=F
w.ushi|うし|うし|牛|{牛|うし}|cow|animal|pocket|c|rg.ushi|jm=1231490/ichi1.news1.nf06;ip=+;lx=E
w.uta|うた|うた|歌|{歌|うた}|song|performing|pocket|c|rg.uta|jm=1193180/ichi1.news1.nf02.nf16;ip=+;lx=F
w.yama|やま|やま|山|{山|やま}|mountain|nature|pocket|c|rg.yama|jm=1302680/ichi1.news1.nf02;ip=+;lx=F
`);

  // ---- Everyday (added to Pocket) ----
  table(`
w.ashi|あし|あし|足|{足|あし}|foot, leg|body|everyday|c|rg.ashi|jm=1404630/ichi1.news1.nf01.nf10;ip=+;lx=F
w.banana|ばなな|ばな|バナナ|バナナ|banana|food|everyday|c|rg.banana|jm=1099420/gai1.ichi1;ip=+;lx=new
w.basu|ばす|ばす|バス|バス|bus|vehicle|everyday|c|rg.basu|jm=1098390/gai1.ichi1;ip=+;lx=new
w.beddo|べっど|べど|ベッド|ベッド|bed|home care|everyday|c|rg.beddo|jm=1119650/gai1.ichi1;ip=+;lx=E
w.bentou|べんとう|べう|弁当|{弁当|べんとう}|packed lunch|food household|everyday|c|rg.bentou|jm=1513060/ichi1.news1.nf07;ip=+;lx=E
w.bin|びん|びん|瓶|{瓶|びん}|bottle|household|everyday|c|rg.bin|jm=1491120/ichi1.news1.nf07;ip=+;lx=E
w.biru|びる|びる|ビル|ビル|building|place|everyday|c|rg.biru|jm=1106010/gai1.ichi1;ip=+;lx=new
w.booru|ぼーる|ぼる|ボール|ボール|ball|toy|everyday|c|rg.booru|jm=1123550/gai1.ichi1;ip=+;lx=new
w.botan|ぼたん|ぼん|ボタン|ボタン|button|clothing|everyday|c|rg.botan|jm=1123880/gai1.ichi1/uk;ip=+;lx=E
w.boushi|ぼうし|ぼし|帽子|{帽子|ぼうし}|hat|clothing|everyday|c|rg.boushi|jm=1519170/ichi1.news1.nf09;ip=+;lx=E
w.buta|ぶた|ぶた|豚|{豚|ぶた}|pig|animal|everyday|c|rg.buta|jm=1457390/ichi1.news1.nf13;ip=+;lx=new
w.chawan|ちゃわん|ちん|茶碗|{茶碗|ちゃわん}|rice bowl, teacup|household|everyday|c|rg.chawan|jm=1597530/ichi1.news1.nf21.spec1;ip=+;lx=E
w.chiizu|ちーず|ちず|チーズ|チーズ|cheese|food|everyday|c|rg.chiizu|jm=1077330/gai1.ichi1;ip=+;lx=E
w.daidokoro|だいどころ|だろ|台所|{台所|だいどころ}|kitchen|place household|everyday|x|rg.daidokoro|jm=1412640/ichi1.news1.nf07;ip=+;lx=E
w.dango|だんご|だご|団子|{団子|だんご}|dumpling (on a skewer)|food|everyday|c|rg.dango|jm=1419240/news2.nf28;ip=+;lx=E
w.densha|でんしゃ|でや|電車|{電車|でんしゃ}|train|vehicle|everyday|c|rg.densha|jm=1443530/ichi1.news1.nf04;ip=+;lx=new
w.denwa|でんわ|でわ|電話|{電話|でんわ}|telephone|practical|everyday|c|rg.denwa|jm=1443840/ichi1.news1.nf01;ip=+;lx=new
w.e|え|ええ|絵|{絵|え}|picture, painting|art|everyday|c|rg.e|jm=1202270/news1.nf02;ip=+;lx=F
w.ebi|えび|えび|海老|{海老|えび}|shrimp|animal sea food|everyday|c|rg.ebi|jm=1588720/news2.nf27.spec1;ip=+;lx=new
w.eda|えだ|えだ|枝|{枝|えだ}|branch|plant|everyday|c|rg.eda|jm=1310530/ichi1.news1.nf05;ip=+;lx=E
w.enpitsu|えんぴつ|えつ|鉛筆|{鉛筆|えんぴつ}|pencil|writing|everyday|c|rg.enpitsu|jm=1178590/ichi1.news1.nf12;ip=+;lx=E
w.fooku|ふぉーく|ふく|フォーク|フォーク|fork|household|everyday|c|rg.fooku|jm=1110110/gai1.ichi1;ip=+;lx=F
w.fue|ふえ|ふえ|笛|{笛|ふえ}|flute, whistle|performing|everyday|c|rg.fue|jm=1437310/ichi1.news1.nf12;ip=+;lx=E
w.fune|ふね|ふね|船|{船|ふね}|ship, boat|vehicle sea|everyday|c|rg.fune|jm=1602800/ichi1.news1.nf04;ip=+;lx=F
w.furo|ふろ|ふろ|風呂|{風呂|ふろ}|bath|home care|everyday|c|rg.furo|jm=1500100/ichi1.news1.nf23;ip=+;lx=E
w.ginkou|ぎんこう|ぎう|銀行|{銀行|ぎんこう}|bank|place|everyday|c|rg.ginkou|jm=1243490/ichi1.news1.nf01;ip=+;lx=new
w.gitaa|ぎたー|ぎあ|ギター|ギター|guitar|performing|everyday|c|rg.gitaa|jm=1042820/gai1.ichi1;ip=+;lx=new
w.gomi|ごみ|ごみ|ごみ|ごみ|rubbish|household|everyday|c|rg.gomi|jm=1369900/ichi1.news2.nf36.spec1/uk;ip=+;lx=new
w.ha.leaf|は|はは|葉|{葉|は}|leaf|plant|everyday|c|rg.ha|jm=1546550/ichi1.news1.nf04;ip=+;lx=E
w.ha.tooth|は|はは|歯|{歯|は}|tooth|body|everyday|c|rg.ha|jm=1313000/ichi1.news1.nf05;ip=+;lx=E
w.hako|はこ|はこ|箱|{箱|はこ}|box|household practical|everyday|c|rg.hako|jm=1585650/ichi1.news1.nf09;ip=+;lx=F
w.hasami|はさみ|はみ|はさみ|はさみ|scissors|practical household|everyday|c|rg.hasami|jm=1573820/ichi1/uk;ip=+;lx=E
w.heya|へや|へや|部屋|{部屋|へや}|room|place home|everyday|c|rg.heya|jm=1499320/ichi1.news1.nf02;ip=+;lx=F
w.hi|ひ|ひひ|火|{火|ひ}|fire|light household|everyday|c|rg.hi|jm=1193610/ichi1.news1.nf02;ip=+;lx=F
w.hikari|ひかり|ひり|光|{光|ひかり}|light|light|everyday|c|rg.hikari|jm=1272780/ichi1.news1.nf01;ip=+;lx=E
w.ichigo|いちご|いご|いちご|いちご|strawberry|food|everyday|c|rg.ichigo|jm=1571460/ichi1/uk;ip=+;lx=new
w.ike|いけ|いけ|池|{池|いけ}|pond|nature place|everyday|c|rg.ike|jm=1421700/ichi1.news1.nf05;ip=+;lx=F
w.ishi|いし|いし|石|{石|いし}|stone|nature|everyday|c|rg.ishi|jm=1382440/ichi1;ip=+;lx=F
w.ito|いと|いと|糸|{糸|いと}|thread|household|everyday|c|rg.ito|jm=1311450/ichi1.news1.nf07;ip=+;lx=F
w.iwa|いわ|いわ|岩|{岩|いわ}|rock|nature|everyday|c|rg.iwa|jm=1217270/ichi1.news1.nf08;ip=+;lx=E
w.jagaimo|じゃがいも|じも|じゃがいも|じゃがいも|potato|food|everyday|c|rg.jagaimo|jm=1005930/spec1.ichi1/uk;ip=+;lx=new
w.juusu|じゅーす|じす|ジュース|ジュース|juice|food|everyday|c|rg.juusu|jm=1065950/gai1.ichi1;ip=+;lx=new
w.kaban|かばん|かん|かばん|かばん|bag|practical|everyday|c|rg.kaban|jm=1208910/ichi1/uk;ip=+;lx=new
w.kabe|かべ|かべ|壁|{壁|かべ}|wall|home|everyday|c|rg.kabe|jm=1509290/ichi1.news1.nf02;ip=+;lx=E
w.kaeru|かえる|かる|蛙|{蛙|かえる}|frog|animal|everyday|c|rg.kaeru|jm=1577460/ichi1.news2.nf33/uk;ip=+;lx=E
w.kagi|かぎ|かぎ|鍵|{鍵|かぎ}|key|practical|everyday|c|rg.kagi|jm=1260490/ichi1.news1.nf18;ip=+;lx=E
w.kago|かご|かご|かご|かご|basket|household practical|everyday|c|rg.kago|jm=1590200/ichi1.news1.nf23.spec1/uk;ip=+;lx=E
w.kaidan|かいだん|かん|階段|{階段|かいだん}|stairs|home|everyday|c|rg.kaidan|jm=1203090/ichi1.news1.nf07;ip=+;lx=E
w.kame|かめ|かめ|亀|{亀|かめ}|turtle|animal|everyday|c|rg.kame|jm=1224260/ichi1.news1.nf11.spec1;ip=+;lx=E
w.kawa|かわ|かわ|川|{川|かわ}|river|nature|everyday|c|rg.kawa|jm=1390020/ichi1.news1.nf03.nf10;ip=+;lx=F
w.kaze|かぜ|かぜ|風|{風|かぜ}|wind|weather|everyday|c|rg.kaze|jm=1499720/ichi1;ip=+;lx=F
w.keeki|けーき|けき|ケーキ|ケーキ|cake|food|everyday|c|rg.keeki|jm=1047860/gai1.ichi1;ip=+;lx=F
w.kemuri|けむり|けり|煙|{煙|けむり}|smoke|nature|everyday|c|rg.kemuri|jm=1177180/ichi1.news1.nf07;ip=+;lx=E
w.kitte|きって|きて|切手|{切手|きって}|postage stamp|writing|everyday|x|rg.kitte|jm=1385070/ichi1.news1.nf08;ip=+;lx=E
w.koori|こおり|こり|氷|{氷|こおり}|ice|nature household|everyday|c|rg.koori|jm=1488840/ichi1.news1.nf08;ip=+;lx=E
w.koppu|こっぷ|こぷ|コップ|コップ|cup, glass|household|everyday|c|rg.koppu|jm=1050390/gai1.ichi1/uk;ip=+;lx=E
w.kuchi|くち|くち|口|{口|くち}|mouth|body|everyday|c|rg.kuchi|jm=1275640/ichi1.news1.nf02;ip=+;lx=F
w.kusuri|くすり|くり|薬|{薬|くすり}|medicine|care|everyday|c|rg.kusuri|jm=1538160/ichi1.news1.nf04;ip=+;lx=F
w.matsu|まつ|まつ|松|{松|まつ}|pine tree|plant|everyday|c|rg.matsu|jm=1349860/ichi1.news1.nf04;ip=+;lx=E
w.mimi|みみ|みみ|耳|{耳|みみ}|ear|body|everyday|c|rg.mimi|jm=1317170/ichi1.news1.nf03;ip=+;lx=F
w.minato|みなと|みと|港|{港|みなと}|harbour|place sea|everyday|c|rg.minato|jm=1279990/ichi1.news1.nf04;ip=+;lx=E
w.mise|みせ|みせ|店|{店|みせ}|shop|place|everyday|c|rg.mise|jm=1582120/ichi1;ip=+;lx=F
w.miso|みそ|みそ|味噌|{味噌|みそ}|miso|food household|everyday|c|rg.miso|jm=1527040/ichi1.news2.nf32;ip=+;lx=new
w.mizu|みず|みず|水|{水|みず}|water|nature household|everyday|c|rg.mizu|jm=1371260/ichi1.news1.nf01;ip=+;lx=F
w.mizuumi|みずうみ|みみ|湖|{湖|みずうみ}|lake|nature|everyday|x|rg.mizuumi|jm=1267280/ichi1.news1.nf08;ip=+;lx=E
w.mochi|もち|もち|餅|{餅|もち}|rice cake|food|everyday|c|rg.mochi|jm=1535790/ichi1.news1.nf19/uk;ip=+;lx=E
w.mushi|むし|むし|虫|{虫|むし}|insect, bug|animal|everyday|c|rg.mushi|jm=1426680/ichi1.news1.nf06;ip=+;lx=F
w.nabe|なべ|なべ|鍋|{鍋|なべ}|cooking pot|household|everyday|c|rg.nabe|jm=1459720/ichi1.news1.nf11;ip=+;lx=E
w.namida|なみだ|なだ|涙|{涙|なみだ}|tear (from crying)|body|everyday|c|rg.namida|jm=1555930/ichi1.news1.nf04;ip=+;lx=E
w.ne|ね|ねね|根|{根|ね}|root|plant|everyday|c|rg.ne|jm=1290020/ichi1.news1.nf05;ip=+;lx=E
w.niji|にじ|にじ|虹|{虹|にじ}|rainbow|weather light|everyday|c|rg.niji|jm=1463740/ichi1.news1.nf17;ip=+;lx=E
w.nimotsu|にもつ|につ|荷物|{荷物|にもつ}|luggage|practical|everyday|c|rg.nimotsu|jm=1195430/ichi1.news1.nf09;ip=+;lx=E
w.ningyou|にんぎょう|にう|人形|{人形|にんぎょう}|doll|art toy|everyday|c|rg.ningyou|jm=1367120/ichi1.news1.nf05;ip=+;lx=E
w.niwa|にわ|にわ|庭|{庭|にわ}|garden|place home|everyday|c|rg.niwa|jm=1436130/ichi1.news1.nf06;ip=+;lx=F
w.oka|おか|おか|丘|{丘|おか}|hill|nature|everyday|c|rg.oka|jm=1588920/ichi1.news1.nf04;ip=+;lx=E
w.okashi|おかし|おし|お菓子|お{菓子|かし}|sweets, snacks|food|everyday|c|rg.okashi|jm=1001710/ichi1;ip=+;lx=F
w.onigiri|おにぎり|おり|おにぎり|おにぎり|rice ball|food household|everyday|c|rg.onigiri|jm=1001620/ichi1/uk;ip=+;lx=F
w.puuru|ぷーる|ぷる|プール|プール|swimming pool|place|everyday|c|rg.puuru|jm=1115150/gai1.ichi1;ip=+;lx=new
w.ranpu|らんぷ|らぷ|ランプ|ランプ|lamp|light|everyday|c|rg.ranpu|jm=1140360/gai1;ip=+;lx=E
w.rousoku|ろうそく|ろく|ろうそく|ろうそく|candle|light|everyday|c|rg.rousoku|jm=1561240/ichi1/uk;ip=+;lx=E
w.rubii|るびー|るい|ルビー|ルビー|ruby (gem)|art|everyday|c|rg.rubii|jm=1144130/gai1;ip=+;lx=new
w.saru|さる|さる|猿|{猿|さる}|monkey|animal|everyday|c|rg.saru|jm=1177390/ichi1.news1.nf14/uk;ip=+;lx=new
w.seetaa|せーたー|せあ|セーター|セーター|jumper, sweater|clothing|everyday|c|rg.seetaa|jm=1074270/gai1.ichi1;ip=+;lx=new
w.senaka|せなか|せか|背中|{背中|せなか}|back (of the body)|body|everyday|c|rg.senaka|jm=1472800/ichi1.news1.nf07;ip=+;lx=E
w.shatsu|しゃつ|しつ|シャツ|シャツ|shirt|clothing|everyday|c|rg.shatsu|jm=1061520/gai1.ichi1;ip=+;lx=F
w.shio|しお|しお|塩|{塩|しお}|salt|food household|everyday|c|rg.shio|jm=1576630/ichi1.news1.nf06;ip=+;lx=E
w.soba|そば|そば|そば|そば|soba noodles|food|everyday|c|rg.soba|jm=1238460/ichi1.news2.nf43/uk;ip=+;lx=E
w.sora|そら|そら|空|{空|そら}|sky|nature|everyday|c|rg.sora|jm=1245290/ichi1;ip=+;lx=F
w.suitou|すいとう|すう|水筒|{水筒|すいとう}|water flask|practical|everyday|x|rg.suitou|jm=1371910/ichi1.news2.nf37;ip=+;lx=E
w.suna|すな|すな|砂|{砂|すな}|sand|nature|everyday|c|rg.suna|jm=1291500/ichi1.news1.nf06.news2.nf28;ip=+;lx=E
w.suzu|すず|すず|鈴|{鈴|すず}|small bell|performing|everyday|c|rg.suzu|jm=1557580/ichi1.news1.nf13;ip=+;lx=E
w.taiyou|たいよう|たう|太陽|{太陽|たいよう}|the sun|nature light|everyday|c|rg.taiyou|jm=1408370/ichi1.news1.nf04;ip=+;lx=E
w.tako.kite|たこ|たこ|凧|{凧|たこ}|kite (toy)|toy performing|everyday|c|rg.tako|jm=1581560/ichi1.news1.nf18;ip=+;lx=new
w.tako.octopus|たこ|たこ|蛸|{蛸|たこ}|octopus|animal sea|everyday|c|rg.tako|jm=1596910/ichi1/uk;ip=+;lx=new
w.tanbo|たんぼ|たぼ|田んぼ|{田|た}んぼ|rice paddy|place|everyday|x|rg.tanbo|jm=1442840/ichi2.spec1;ip=+;lx=E
w.te|て|てて|手|{手|て}|hand|body|everyday|c|rg.te|jm=1327190/ichi1.news1.nf01;ip=+;lx=F
w.tebukuro|てぶくろ|てろ|手袋|{手袋|てぶくろ}|gloves|clothing|everyday|x|rg.tebukuro|jm=1328090/ichi1.news1.nf17;ip=+;lx=E
w.teeburu|てーぶる|てる|テーブル|テーブル|table|home household|everyday|c|rg.teeburu|jm=1078630/gai1.ichi1;ip=+;lx=E
w.tegami|てがみ|てみ|手紙|{手紙|てがみ}|letter|writing|everyday|x|rg.tegami|jm=1327720/ichi1.news1.nf03;ip=+;lx=E
w.toshokan|としょかん|とん|図書館|{図書館|としょかん}|library|place writing|everyday|c|rg.toshokan|jm=1370420/ichi1.news1.nf05;ip=+;lx=E
w.tsuchi|つち|つち|土|{土|つち}|soil, earth|nature|everyday|c|rg.tsuchi|jm=1445270/ichi1.news1.nf04;ip=~ど;lx=E
w.ude|うで|うで|腕|{腕|うで}|arm|body|everyday|c|rg.ude|jm=1562850/ichi1.news1.nf05;ip=+;lx=E
w.usagi|うさぎ|うぎ|うさぎ|うさぎ|rabbit|animal|everyday|c|rg.usagi|jm=1443970/ichi1.news2.nf32/uk;ip=+;lx=new
w.wani|わに|わに|わに|わに|crocodile|animal|everyday|c|rg.wani|jm=1562640/-/uk;ip=+;lx=new
w.yane|やね|やね|屋根|{屋根|やね}|roof|home|everyday|c|rg.yane|jm=1182700/ichi1.news1.nf06;ip=+;lx=E
w.yubi|ゆび|ゆび|指|{指|ゆび}|finger|body|everyday|c|rg.yubi|jm=1309650/ichi1.news1.nf06;ip=+;lx=E
w.yuki|ゆき|ゆき|雪|{雪|ゆき}|snow|weather|everyday|c|rg.yuki|jm=1386500/ichi1.news1.nf03;ip=+;lx=F
w.zerii|ぜりー|ぜい|ゼリー|ゼリー|jelly (dessert)|food|everyday|c|rg.zerii|jm=1075190/gai1;ip=+;lx=new
w.zou|ぞう|ぞう|象|{象|ぞう}|elephant|animal|everyday|c|rg.zou|jm=1351830/ichi1;ip=+;lx=new
w.zutsuu|ずつう|ずう|頭痛|{頭痛|ずつう}|headache|body care|everyday|c|rg.zutsuu|jm=1450890/ichi1.news1.nf11;ip=+;lx=I
`);

  // ---- Extended (added to Everyday) ----
  table(`
w.ahiru|あひる|ある|あひる|あひる|duck|animal|extended|c|rg.ahiru|jm=1191810/-/uk;ip=+;lx=new
w.akari|あかり|あり|明かり|{明|あ}かり|light, lamp|light|extended|c|rg.akari|jm=1586210/ichi1.ichi2.news1.nf15.spec1;ip=+;lx=E
w.ami|あみ|あみ|網|{網|あみ}|net|practical|extended|c|rg.ami|jm=1534380/ichi1.news1.nf10;ip=+;lx=E
w.ari|あり|あり|あり|あり|ant|animal|extended|c|rg.ari|jm=1225940/ichi1.news2.nf38/uk;ip=+;lx=new
w.ase|あせ|あせ|汗|{汗|あせ}|sweat|body|extended|c|rg.ase|jm=1213060/ichi1.news1.nf05;ip=+;lx=E
w.baketsu|ばけつ|ばつ|バケツ|バケツ|bucket|household practical|extended|c|rg.baketsu|jm=1098340/gai1.ichi1;ip=+;lx=new
w.bara|ばら|ばら|ばら|ばら|rose|plant|extended|c|rg.bara|jm=1571760/ichi1.news2.nf27/uk;ip=+;lx=new
w.biwa|びわ|びわ|びわ|びわ|loquat|food|extended|c|rg.biwa|jm=1486250/news1.nf12;ip=+;lx=new
w.budou|ぶどう|ぶう|ぶどう|ぶどう|grapes|food|extended|c|rg.budou|jm=1499230/ichi1.news2.nf46/uk;ip=+;lx=new
w.buranko|ぶらんこ|ぶこ|ぶらんこ|ぶらんこ|swing (playground)|toy|extended|c|rg.buranko|jm=1574220/ichi1/uk;ip=+;lx=new
w.butai|ぶたい|ぶい|舞台|{舞台|ぶたい}|stage|place performing|extended|c|rg.butai|jm=1499150/ichi1.news1.nf01;ip=+;lx=E
w.buutsu|ぶーつ|ぶつ|ブーツ|ブーツ|boots|clothing|extended|c|rg.buutsu|jm=1113130/gai1;ip=+;lx=E
w.byouin|びょういん|びん|病院|{病院|びょういん}|hospital|place care|extended|c|rg.byouin|jm=1490220/ichi1.news1.nf01;ip=+;lx=new
w.chizu|ちず|ちず|地図|{地図|ちず}|map|writing practical|extended|c|rg.chizu|jm=1421290/ichi1.news1.nf05;ip=+;lx=E
w.daikon|だいこん|だん|大根|{大根|だいこん}|daikon radish|food|extended|c|rg.daikon|jm=1413730/ichi1.news1.nf21;ip=+;lx=new
w.denki|でんき|でき|電気|{電気|でんき}|electric light, electricity|light|extended|c|rg.denki|jm=1443000/ichi1.news1.nf02;ip=+;lx=new
w.doro|どろ|どろ|泥|{泥|どろ}|mud|nature|extended|c|rg.doro|jm=1436900/ichi1.news1.nf10;ip=+;lx=E
w.douro|どうろ|どろ|道路|{道路|どうろ}|road|place|extended|c|rg.douro|jm=1454290/ichi1.news1.nf02;ip=+;lx=new
w.fude|ふで|ふで|筆|{筆|ふで}|writing brush|writing art|extended|c|rg.fude|jm=1487770/ichi1.news1.nf09;ip=+;lx=I
w.fukuro|ふくろ|ふろ|袋|{袋|ふくろ}|bag, sack|practical household|extended|c|rg.fukuro|jm=1411070/ichi1.news1.nf08;ip=+;lx=E
w.fukurou|ふくろう|ふう|ふくろう|ふくろう|owl|animal|extended|c|rg.fukurou|jm=1568080/-/uk;ip=+;lx=new
w.futa|ふた|ふた|蓋|{蓋|ふた}|lid|household|extended|c|rg.futa|jm=1204540/ichi1.news2.nf30;ip=+;lx=I
w.futon|ふとん|ふん|布団|{布団|ふとん}|futon (bedding)|household care|extended|c|rg.futon|jm=1496890/ichi1.news1.nf10;ip=+;lx=E
w.fuutou|ふうとう|ふう|封筒|{封筒|ふうとう}|envelope|writing|extended|c|rg.fuutou|jm=1499690/ichi1.news1.nf11;ip=+;lx=I
w.gakkou|がっこう|がう|学校|{学校|がっこう}|school|place writing|extended|c|rg.gakkou|jm=1206730/ichi1.news1.nf01;ip=+;lx=E
w.gekijou|げきじょう|げう|劇場|{劇場|げきじょう}|theatre|place performing|extended|c|rg.gekijou|jm=1253410/ichi1.news1.nf02;ip=+;lx=E
w.geta|げた|げた|下駄|{下駄|げた}|geta clogs|clothing|extended|c|rg.geta|jm=1185780/ichi1.news2.nf30;ip=+;lx=I
w.gyouza|ぎょうざ|ぎざ|ぎょうざ|ぎょうざ|gyoza dumpling|food|extended|c|rg.gyouza|jm=1574430/ichi1.news2.nf45;ip=~ぎょう?;lx=new
w.gyuunyuu|ぎゅうにゅう|ぎう|牛乳|{牛乳|ぎゅうにゅう}|milk|food household|extended|c|rg.gyuunyuu|jm=1231590/ichi1.news1.nf08;ip=+;lx=new
w.haburashi|はぶらし|はし|歯ブラシ|{歯|は}ブラシ|toothbrush|care|extended|x|rg.haburashi|jm=1313070/ichi1.news1.nf21;ip=+;lx=new
w.hachi|はち|はち|蜂|{蜂|はち}|bee|animal|extended|c|rg.hachi|jm=1517840/ichi1.news2.nf34;ip=+;lx=new
w.hagaki|はがき|はき|葉書|{葉書|はがき}|postcard|writing|extended|x|rg.hagaki|jm=1546590/ichi1/uk;ip=+;lx=new
w.hari|はり|はり|針|{針|はり}|needle|household|extended|c|rg.hari|jm=1366210/ichi1.news1.nf08;ip=+;lx=E
w.hatake|はたけ|はけ|畑|{畑|はたけ}|field (for crops)|place|extended|c|rg.hatake|jm=1476520/ichi1.news1.news2.nf04.nf33;ip=+;lx=E
w.hato|はと|はと|鳩|{鳩|はと}|pigeon|animal|extended|c|rg.hato|jm=1478330/ichi1.news1.nf21;ip=+;lx=new
w.hayashi|はやし|はし|林|{林|はやし}|grove, woods|nature|extended|c|rg.hayashi|jm=1555440/ichi1.news1.nf02;ip=+;lx=E
w.hebi|へび|へび|蛇|{蛇|へび}|snake|animal|extended|c|rg.hebi|jm=1323350/ichi1.news1.nf16;ip=+;lx=I
w.hikouki|ひこうき|ひき|飛行機|{飛行機|ひこうき}|aeroplane|vehicle|extended|c|rg.hikouki|jm=1485470/ichi1.news1.nf05;ip=+;lx=new
w.himawari|ひまわり|ひり|ひまわり|ひまわり|sunflower|plant|extended|c|rg.himawari|jm=1277290/-/uk;ip=+;lx=new
w.himo|ひも|ひも|紐|{紐|ひも}|string, cord|practical|extended|c|rg.himo|jm=1487970/ichi1.news2.nf41/uk;ip=+;lx=I
w.hitsuji|ひつじ|ひじ|羊|{羊|ひつじ}|sheep|animal|extended|c|rg.hitsuji|jm=1546490/ichi1.news1.nf11;ip=+;lx=E
w.hiyoko|ひよこ|ひこ|ひよこ|ひよこ|chick|animal|extended|c|rg.hiyoko|jm=1373400/ichi1.news2.nf25/uk;ip=+;lx=new
w.hiza|ひざ|ひざ|膝|{膝|ひざ}|knee|body|extended|c|rg.hiza|jm=1487320/ichi1.news2.nf27;ip=+;lx=I
w.hone|ほね|ほね|骨|{骨|ほね}|bone|body|extended|c|rg.hone|jm=1288550/ichi1.news1.nf04;ip=+;lx=E
w.hotaru|ほたる|ほる|蛍|{蛍|ほたる}|firefly|animal light|extended|c|rg.hotaru|jm=1252000/ichi1.news2.nf26/uk;ip=+;lx=I
w.hoteru|ほてる|ほる|ホテル|ホテル|hotel|place|extended|c|rg.hoteru|jm=1122650/gai1.ichi1;ip=+;lx=F
w.houchou|ほうちょう|ほう|包丁|{包丁|ほうちょう}|kitchen knife|household|extended|c|rg.houchou|jm=1515530/ichi1.news1.nf10;ip=+;lx=I
w.houki|ほうき|ほき|ほうき|ほうき|broom|household|extended|c|rg.houki|jm=1566500/ichi1/uk;ip=+;lx=new
w.ido|いど|いど|井戸|{井戸|いど}|well|place household|extended|c|rg.ido|jm=1160330/ichi1.news1.nf09;ip=+;lx=I
w.imo|いも|いも|芋|{芋|いも}|potato, yam|food|extended|c|rg.imo|jm=1167960/ichi1.news2.nf32;ip=+;lx=new
w.inaka|いなか|いか|田舎|{田舎|いなか}|the countryside|place|extended|c|rg.inaka|jm=1442750/ichi1.news1.nf09;ip=+;lx=new
w.inku|いんく|いく|インク|インク|ink|writing|extended|c|rg.inku|jm=1022210/gai1.ichi1;ip=+;lx=E
w.iruka|いるか|いか|いるか|いるか|dolphin|animal sea|extended|c|rg.iruka|jm=1201670/-/uk;ip=+;lx=new
w.ishou|いしょう|いう|衣装|{衣装|いしょう}|costume|performing clothing|extended|c|rg.ishou|jm=1158760/ichi1.news1.nf07;ip=+;lx=I
w.izumi|いずみ|いみ|泉|{泉|いずみ}|spring (of water)|nature|extended|c|rg.izumi|jm=1390780/ichi1.news1.nf06;ip=+;lx=I
w.jitensha|じてんしゃ|じや|自転車|{自転車|じてんしゃ}|bicycle|vehicle|extended|c|rg.jitensha|jm=1318290/ichi1.news1.nf04;ip=+;lx=new
w.kaaten|かーてん|かん|カーテン|カーテン|curtain|home|extended|c|rg.kaaten|jm=1036290/gai1.ichi1;ip=+;lx=new
w.kabocha|かぼちゃ|かや|かぼちゃ|かぼちゃ|pumpkin|food|extended|c|rg.kabocha|jm=1582580/ichi1/uk;ip=+;lx=new
w.kabu|かぶ|かぶ|かぶ|かぶ|turnip|food|extended|c|rg.kabu|jm=1499280/news2.nf34/uk;ip=+;lx=new
w.kagami|かがみ|かみ|鏡|{鏡|かがみ}|mirror|household care|extended|c|rg.kagami|jm=1238550/ichi1.news1.nf06;ip=+;lx=E
w.kage|かげ|かげ|影|{影|かげ}|shadow|light|extended|c|rg.kage|jm=1590145/ichi1.news1.nf04;ip=+;lx=E
w.kaki|かき|かき|柿|{柿|かき}|persimmon|food plant|extended|c|rg.kaki|jm=1204810/ichi1.news1.nf16;ip=+;lx=E
w.kama|かま|かま|鎌|{鎌|かま}|sickle|practical|extended|c|rg.kama|jm=1632980/news1.nf23;ip=+;lx=I
w.kaminari|かみなり|かり|雷|{雷|かみなり}|thunder, lightning|weather|extended|c|rg.kaminari|jm=1585060/ichi1.news1.nf11;ip=+;lx=E
w.kanazuchi|かなづち|かち|金槌|{金槌|かなづち}|hammer|practical|extended|x|rg.kanazuchi|jm=1779760/ichi1;ip=+;lx=I
w.kane|かね|かね|鐘|{鐘|かね}|temple bell|performing|extended|c|rg.kane|jm=1352030/ichi1.news1.nf12;ip=+;lx=E
w.karasu|からす|かす|からす|からす|crow|animal|extended|c|rg.karasu|jm=1171450/ichi1.news1.nf22/uk;ip=+;lx=new
w.kata|かた|かた|肩|{肩|かた}|shoulder|body|extended|c|rg.kata|jm=1258950/ichi1.news1.nf03;ip=+;lx=E
w.keito|けいと|けと|毛糸|{毛糸|けいと}|knitting wool, yarn|household|extended|x|rg.keito|jm=1533860/ichi1.news2.nf26;ip=+;lx=I
w.keshigomu|けしごむ|けむ|消しゴム|{消|け}しゴム|eraser, rubber|writing|extended|x|rg.keshigomu|jm=1350080/ichi1.news1.nf12;ip=+;lx=new
w.kinoko|きのこ|きこ|きのこ|きのこ|mushroom|food plant|extended|c|rg.kinoko|jm=1416010/ichi1.news2.nf47/uk;ip=+;lx=new
w.kippu|きっぷ|きぷ|切符|{切符|きっぷ}|ticket|practical|extended|c|rg.kippu|jm=1385170/ichi1.news1.nf10;ip=+;lx=E
w.koi|こい|こい|鯉|{鯉|こい}|carp|animal|extended|c|rg.koi|jm=1271650/ichi1.news2.nf30;ip=+;lx=new
w.koke|こけ|こけ|苔|{苔|こけ}|moss|plant|extended|c|rg.koke|jm=1411030/news2.nf47.spec1/uk;ip=+;lx=I
w.koma|こま|こま|こま|こま|spinning top|toy|extended|c|rg.koma|jm=1455730/ichi1/uk;ip=+;lx=new
w.koohii|こーひー|こい|コーヒー|コーヒー|coffee|food|extended|c|rg.koohii|jm=1049180/gai1.ichi1/uk;ip=+;lx=F
w.kooto|こーと|こと|コート|コート|coat|clothing|extended|c|rg.kooto|jm=1049000/gai1.ichi1;ip=+;lx=new
w.koshi|こし|こし|腰|{腰|こし}|lower back, hips|body|extended|c|rg.koshi|jm=1288340/ichi1.news1.nf04;ip=+;lx=I
w.koshou|こしょう|こう|こしょう|こしょう|pepper (spice)|food household|extended|c|rg.koshou|jm=1267600/ichi1.spec1/uk;ip=+;lx=new
w.koto|こと|こと|琴|{琴|こと}|koto (zither)|performing|extended|c|rg.koto|jm=1241450/ichi1.news1.nf05;ip=~きん;lx=new
w.kouen|こうえん|こん|公園|{公園|こうえん}|park|place|extended|c|rg.kouen|jm=1273270/ichi1.news1.nf02;ip=+;lx=E
w.kozutsumi|こづつみ|こみ|小包|{小包|こづつみ}|parcel|writing practical|extended|x|rg.kozutsumi|jm=1593290/ichi1.news1.nf22;ip=+;lx=I
w.kubi|くび|くび|首|{首|くび}|neck|body|extended|c|rg.kubi|jm=1592270/ichi1.news1.nf03;ip=+;lx=E
w.kugi|くぎ|くぎ|釘|{釘|くぎ}|nail (metal)|practical|extended|c|rg.kugi|jm=1436840/ichi1.news2.nf36;ip=+;lx=I
w.kujira|くじら|くら|鯨|{鯨|くじら}|whale|animal sea|extended|c|rg.kujira|jm=1253270/ichi1.news1.nf13/uk;ip=+;lx=new
w.kuki|くき|くき|茎|{茎|くき}|stem|plant|extended|c|rg.kuki|jm=1251950/ichi1.news1.nf14;ip=+;lx=I
w.kuri|くり|くり|栗|{栗|くり}|chestnut|food plant|extended|c|rg.kuri|jm=1246880/ichi1.news1.nf18/uk;ip=+;lx=I
w.kutsushita|くつした|くた|靴下|{靴下|くつした}|socks|clothing|extended|x|rg.kutsushita|jm=1246740/ichi1.news1.nf19;ip=+;lx=E
w.kyuuri|きゅうり|きり|きゅうり|きゅうり|cucumber|food|extended|c|rg.kyuuri|jm=1591500/ichi1/uk;ip=+;lx=new
w.maku|まく|まく|幕|{幕|まく}|stage curtain|performing|extended|c|rg.maku|jm=1524750/news1.nf04;ip=+;lx=I
w.manaita|まないた|また|まないた|まないた|cutting board|household|extended|x|rg.manaita|jm=1604140/ichi1.spec1;ip=+;lx=new
w.masuku|ますく|まく|マスク|マスク|face mask|care|extended|c|rg.masuku|jm=1127870/gai1.ichi1;ip=+;lx=F
w.matchi|まっち|まち|マッチ|マッチ|match (for lighting)|light practical|extended|c|rg.matchi|jm=1128430/gai1.ichi1/uk;ip=+;lx=E
w.mayu|まゆ|まゆ|眉|{眉|まゆ}|eyebrow|body|extended|c|rg.mayu|jm=1486270/ichi1.news1.nf22;ip=+;lx=I
w.mejiro|めじろ|めろ|めじろ|めじろ|white-eye (small bird)|animal|extended|c|rg.mejiro|jm=1535610/news1.nf13/uk;ip=+;lx=new
w.meron|めろん|めん|メロン|メロン|melon|food|extended|c|rg.meron|jm=1134190/gai1;ip=+;lx=F
w.momiji|もみじ|もじ|もみじ|もみじ|maple (autumn leaves)|plant|extended|c|rg.momiji|jm=1578780/ichi1.news1.nf16;ip=+;lx=new
w.monosashi|ものさし|もし|物差し|{物差|ものさ}し|ruler (for measuring)|writing practical|extended|x|rg.monosashi|jm=1502530/ichi1.news1.nf20;ip=+;lx=new
w.moufu|もうふ|もふ|毛布|{毛布|もうふ}|blanket|household care|extended|x|rg.moufu|jm=1533950/ichi1.news1.nf13;ip=+;lx=E
w.mune|むね|むね|胸|{胸|むね}|chest|body|extended|c|rg.mune|jm=1237820/ichi1.news1.nf02;ip=+;lx=E
w.mura|むら|むら|村|{村|むら}|village|place|extended|c|rg.mura|jm=1406820/ichi1.news1.nf03;ip=+;lx=E
w.naifu|ないふ|なふ|ナイフ|ナイフ|knife|household practical|extended|c|rg.naifu|jm=1089890/gai1.ichi1;ip=+;lx=F
w.nashi|なし|なし|梨|{梨|なし}|pear|food|extended|c|rg.nashi|jm=1549860/news1.nf14/uk;ip=+;lx=E
w.nasu|なす|なす|なす|なす|aubergine, eggplant|food|extended|c|rg.nasu|jm=1195240/ichi1/uk;ip=+;lx=new
w.nawa|なわ|なわ|縄|{縄|なわ}|rope (straw)|practical|extended|c|rg.nawa|jm=1459830/ichi1.news1.nf21;ip=+;lx=I
w.negi|ねぎ|ねぎ|ねぎ|ねぎ|spring onion|food household|extended|c|rg.negi|jm=1467630/ichi1/uk;ip=+;lx=new
w.neji|ねじ|ねじ|ねじ|ねじ|screw|practical|extended|c|rg.neji|jm=1585010/ichi2.spec1/uk;ip=+;lx=I
w.ninjin|にんじん|にん|にんじん|にんじん|carrot|food|extended|c|rg.ninjin|jm=1367800/ichi1/uk;ip=+;lx=new
w.niwatori|にわとり|にり|鶏|{鶏|にわとり}|chicken|animal|extended|x|rg.niwatori|jm=1252990/ichi1.news1.nf14;ip=+;lx=new
w.nohara|のはら|のら|野原|{野原|のはら}|meadow, field|place nature|extended|x|rg.nohara|jm=1537360/ichi1.news1.nf24;ip=+;lx=I
w.numa|ぬま|ぬま|沼|{沼|ぬま}|marsh, swamp|nature|extended|c|rg.numa|jm=1350010/ichi1.news1.nf10;ip=+;lx=new
w.obi|おび|おび|帯|{帯|おび}|sash (obi)|clothing|extended|c|rg.obi|jm=1410410/ichi1;ip=+;lx=I
w.oke|おけ|おけ|桶|{桶|おけ}|tub|household|extended|c|rg.oke|jm=1182830/ichi1.news2.nf33;ip=+;lx=I
w.omocha|おもちゃ|おや|おもちゃ|おもちゃ|toy|toy|extended|c|rg.omocha|jm=1217070/ichi1.news1.nf22/uk;ip=+;lx=new
w.onaka|おなか|おか|おなか|おなか|belly|body|extended|c|rg.onaka|jm=1002610/ichi1;ip=+;lx=new
w.origami|おりがみ|おみ|折り紙|{折|お}り{紙|がみ}|origami paper|art|extended|x|rg.origami|jm=1589450/ichi1.news1.nf20;ip=+;lx=new
w.panda|ぱんだ|ぱだ|パンダ|パンダ|panda|animal|extended|c|rg.panda|jm=1103210/gai1.ichi1;ip=+;lx=new
w.pen|ぺん|ぺん|ペン|ペン|pen|writing|extended|c|rg.pen|jm=1121380/gai1.ichi1;ip=+;lx=F
w.piano|ぴあの|ぴの|ピアノ|ピアノ|piano|performing|extended|c|rg.piano|jm=1106400/gai1.ichi1;ip=+;lx=F
w.poketto|ぽけっと|ぽと|ポケット|ポケット|pocket|clothing practical|extended|c|rg.poketto|jm=1124970/gai1.ichi1;ip=+;lx=E
w.posuto|ぽすと|ぽと|ポスト|ポスト|postbox|writing place|extended|c|rg.posuto|jm=1125150/gai1.ichi1;ip=+;lx=F
w.reizouko|れいぞうこ|れこ|冷蔵庫|{冷蔵庫|れいぞうこ}|refrigerator|household|extended|c|rg.reizouko|jm=1557110/ichi1.news1.nf08;ip=+;lx=new
w.remon|れもん|れん|レモン|レモン|lemon|food|extended|c|rg.remon|jm=1146020/gai1.ichi1/uk;ip=+;lx=F
w.retasu|れたす|れす|レタス|レタス|lettuce|food|extended|c|rg.retasu|jm=1145450/gai1;ip=+;lx=new
w.risu|りす|りす|りす|りす|squirrel|animal|extended|c|rg.risu|jm=1246890/-/uk;ip=+;lx=new
w.rouka|ろうか|ろか|廊下|{廊下|ろうか}|corridor|place home|extended|c|rg.rouka|jm=1560670/ichi1.news1.nf10;ip=+;lx=E
w.ruuretto|るーれっと|ると|ルーレット|ルーレット|roulette wheel|toy|extended|c|rg.ruuretto|jm=1143940/gai1;ip=+;lx=new
w.ryukku|りゅっく|りく|リュック|リュック|rucksack|practical|extended|c|rg.ryukku|jm=1925310/-;ip=+;lx=new
w.saba|さば|さば|鯖|{鯖|さば}|mackerel|animal sea food|extended|c|rg.saba|jm=1299610/spec1/uk;ip=+;lx=I
w.saka|さか|さか|坂|{坂|さか}|slope|place|extended|c|rg.saka|jm=1297110/ichi1.news1.nf09;ip=+;lx=E
w.sake|さけ|さけ|鮭|{鮭|さけ}|salmon|animal sea food|extended|c|rg.sake|jm=1579300/news2.nf32.spec1;ip=+;lx=I
w.satou|さとう|さう|砂糖|{砂糖|さとう}|sugar|food household|extended|c|rg.satou|jm=1291600/ichi1.news1.nf08;ip=+;lx=E
w.sekken|せっけん|せん|せっけん|せっけん|soap|household care|extended|c|rg.sekken|jm=1382590/ichi1.news2.nf32;ip=+;lx=new
w.semi|せみ|せみ|せみ|せみ|cicada|animal|extended|c|rg.semi|jm=1387080/ichi1.news2.nf35;ip=+;lx=new
w.shimo|しも|しも|霜|{霜|しも}|frost|weather|extended|c|rg.shimo|jm=1402930/ichi1.news2.nf25;ip=+;lx=I
w.shinbun|しんぶん|しん|新聞|{新聞|しんぶん}|newspaper|writing|extended|c|rg.shinbun|jm=1362360/ichi1.news1.nf01;ip=+;lx=new
w.shiro|しろ|しろ|城|{城|しろ}|castle|place|extended|c|rg.shiro|jm=1355710/ichi1.news1.nf10;ip=+;lx=new
w.shita|した|した|舌|{舌|した}|tongue|body|extended|c|rg.shita|jm=1387010/ichi1.news1.nf11;ip=+;lx=new
w.sode|そで|そで|袖|{袖|そで}|sleeve|clothing|extended|c|rg.sode|jm=1406000/ichi1.news2.nf25;ip=+;lx=I
w.sudare|すだれ|すれ|すだれ|すだれ|bamboo blind|home|extended|c|rg.sudare|jm=1559100/-/uk;ip=+;lx=I
w.suika|すいか|すか|すいか|すいか|watermelon|food|extended|c|rg.suika|jm=1380890/ichi1.spec1/uk;ip=+;lx=new
w.sukaato|すかーと|すと|スカート|スカート|skirt|clothing|extended|c|rg.sukaato|jm=1067470/gai1.ichi1;ip=+;lx=new
w.sumi|すみ|すみ|墨|{墨|すみ}|ink stick, sumi ink|writing art|extended|c|rg.sumi|jm=1521510/ichi1.news1.nf13;ip=+;lx=I
w.suzume|すずめ|すめ|すずめ|すずめ|sparrow|animal|extended|c|rg.suzume|jm=1373560/ichi1.news1.nf10;ip=+;lx=new
w.taiko|たいこ|たこ|太鼓|{太鼓|たいこ}|drum|performing|extended|c|rg.taiko|jm=1408280/ichi1.news1.nf11;ip=+;lx=new
w.take|たけ|たけ|竹|{竹|たけ}|bamboo|plant|extended|c|rg.take|jm=1422230/ichi1.news1.nf04;ip=+;lx=E
w.taki|たき|たき|滝|{滝|たき}|waterfall|nature|extended|c|rg.taki|jm=1415520/ichi1.news1.nf10;ip=+;lx=E
w.takushii|たくしー|たい|タクシー|タクシー|taxi|vehicle|extended|c|rg.takushii|jm=1076190/gai1.ichi1;ip=+;lx=new
w.tana|たな|たな|棚|{棚|たな}|shelf|home household|extended|c|rg.tana|jm=1416700/ichi1.news1.nf11;ip=+;lx=E
w.tane|たね|たね|種|{種|たね}|seed|plant|extended|c|rg.tane|jm=1328820/ichi1;ip=+;lx=E
w.tanpopo|たんぽぽ|たぽ|たんぽぽ|たんぽぽ|dandelion|plant|extended|c|rg.tanpopo|jm=1209040/-/uk;ip=+;lx=new
w.taoru|たおる|たる|タオル|タオル|towel|household care|extended|c|rg.taoru|jm=1076170/gai1.ichi1;ip=+;lx=new
w.taru|たる|たる|樽|{樽|たる}|barrel|practical|extended|c|rg.taru|jm=1633680/news1.nf23;ip=+;lx=I
w.tatami|たたみ|たみ|畳|{畳|たたみ}|tatami mat|home|extended|c|rg.tatami|jm=1356750/ichi1.news1.nf12;ip=+;lx=new
w.tera|てら|てら|寺|{寺|てら}|temple|place|extended|c|rg.tera|jm=1315240/ichi1.news1.nf02;ip=+;lx=new
w.terebi|てれび|てび|テレビ|テレビ|television|home|extended|c|rg.terebi|jm=1080510/gai1.ichi1;ip=+;lx=new
w.tetsu|てつ|てつ|鉄|{鉄|てつ}|iron|practical|extended|c|rg.tetsu|jm=1437780/ichi1.news1.nf04;ip=+;lx=I
w.tobira|とびら|とら|扉|{扉|とびら}|door|home|extended|c|rg.tobira|jm=1483380/ichi1.news1.nf09;ip=+;lx=I
w.tonbo|とんぼ|とぼ|とんぼ|とんぼ|dragonfly|animal|extended|c|rg.tonbo|jm=1585910/ichi1/uk;ip=+;lx=new
w.torakku|とらっく|とく|トラック|トラック|lorry, truck|vehicle|extended|c|rg.torakku|jm=1085760/gai1.ichi1;ip=+;lx=new
w.toudai|とうだい|とい|灯台|{灯台|とうだい}|lighthouse|place light sea|extended|c|rg.toudai|jm=1448730/ichi1.news1.nf24;ip=+;lx=I
w.toufu|とうふ|とふ|豆腐|{豆腐|とうふ}|tofu|food household|extended|c|rg.toufu|jm=1450070/ichi1.news1.nf14;ip=+;lx=new
w.tsubame|つばめ|つめ|つばめ|つばめ|swallow (bird)|animal|extended|c|rg.tsubame|jm=1177350/ichi1.news1.nf21.spec1/uk;ip=+;lx=new
w.tsue|つえ|つえ|杖|{杖|つえ}|walking stick|practical|extended|c|rg.tsue|jm=1356620/ichi1.news2.nf28;ip=+;lx=E
w.tsume|つめ|つめ|爪|{爪|つめ}|fingernail, claw|body|extended|c|rg.tsume|jm=1433880/ichi1.news1.nf23;ip=+;lx=new
w.tsuna|つな|つな|綱|{綱|つな}|rope (thick)|practical|extended|c|rg.tsuna|jm=1280880/ichi1.news1.nf11;ip=+;lx=I
w.tsuru|つる|つる|鶴|{鶴|つる}|crane (bird)|animal|extended|c|rg.tsuru|jm=1434130/ichi1.news1.nf07;ip=+;lx=I
w.udon|うどん|うん|うどん|うどん|udon noodles|food|extended|c|rg.udon|jm=1574470/ichi1/uk;ip=+;lx=new
w.ume|うめ|うめ|梅|{梅|うめ}|ume plum|food plant|extended|c|rg.ume|jm=1473460/ichi1.news1.nf07;ip=+;lx=new
w.uwagi|うわぎ|うぎ|上着|{上着|うわぎ}|jacket|clothing|extended|x|rg.uwagi|jm=1580340/ichi1.news1.nf17;ip=+;lx=E
w.wara|わら|わら|わら|わら|straw|plant household|extended|c|rg.wara|jm=1562710/ichi1/uk;ip=+;lx=I
w.yagi|やぎ|やぎ|山羊|{山羊|やぎ}|goat|animal|extended|c|rg.yagi|jm=1303200/-/uk;ip=+;lx=I
w.yakan|やかん|やん|やかん|やかん|kettle|household|extended|c|rg.yakan|jm=1605370/ichi1/uk;ip=+;lx=new
w.yubiwa|ゆびわ|ゆわ|指輪|{指輪|ゆびわ}|ring (finger)|art|extended|x|rg.yubiwa|jm=1310050/ichi1.news1.nf14;ip=+;lx=new
w.yuka|ゆか|ゆか|床|{床|ゆか}|floor|home|extended|c|rg.yuka|jm=1349380/ichi1;ip=+;lx=E
w.zarigani|ざりがに|ざに|ざりがに|ざりがに|crayfish|animal|extended|c|rg.zarigani|jm=1059040/spec1/uk;ip=+;lx=new
w.zasshi|ざっし|ざし|雑誌|{雑誌|ざっし}|magazine|writing|extended|c|rg.zasshi|jm=1299400/ichi1.news1.nf02;ip=+;lx=E
w.zu|ず|ずず|図|{図|ず}|diagram, figure|writing|extended|c|rg.zu|jm=1370320/ichi1.news1.nf08;ip=+;lx=I
w.zubon|ずぼん|ずん|ズボン|ズボン|trousers|clothing|extended|c|rg.zubon|jm=1074260/gai1.ichi1;ip=+;lx=new
w.zugara|ずがら|ずら|図柄|{図柄|ずがら}|design, pattern|art|extended|c|rg.zugara|jm=1370500/news1.nf18;ip=+;lx=new
`);

  SH.defineWords(list);
})();
