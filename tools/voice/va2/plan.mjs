// VA-2: the casting samples Robin asked for on 2026-10-14 (docs/future/plan/11_CONTRADICTIONS.md C-93), as one plan
// a job on Robin's PC renders (tools/voice/va2/va2_render.py) and turns into one gallery file (va2_gallery.py):
//   1. the player: three sets, each a Voice A and a Voice B, each at a higher and a lower pitch, five moods
//      (neutral, happy, sad, frustrated, excited): 3 × 4 × 5 = 60 takes;
//   2. the narrator: seven female AivisSpeech candidates, each Directed-Neutral and Directed-Energetic: 14 takes;
//   3. every NPC who speaks: one sentence each, the engine and settings chosen by the lead from Robin's rules
//      (docs/future/voice/va2/npc_casting.json): about 281 takes.
//   1b. the four companions (added at Robin's request the same day): the player's scope for each, 4 × 60 = 240 takes;
// Nothing else: no whole-game lines. Every text is a line the game really says (its key is checked).
// The spoken text is the line without furigana or the learner's spaces; names are given as their own kana (the game's
// furigana), since an engine's dictionary does not know Manybridge is やおばし.
//
//   node tools/voice/va2/plan.mjs            write docs/future/voice/va2/va2_plan.json
//   node tools/voice/va2/plan.mjs --check    build and compare, no write (exit 1 if different or invalid)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { RB, allLines } from '../lines.mjs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
const DIR = path.join(root, 'docs/future/voice/va2');
const OUT = process.env.VA2_PLAN_OUT || path.join(DIR, 'va2_plan.json'); // (the env overrides are for the job's self-test)
const errors = [];
const fail = (m) => errors.push(m);
const sha = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');

// ---- the game's lines and its names --------------------------------------------------------------------------------
const LINES = allLines();
const byKey = new Map(LINES.map((l) => [l.key, l]));
const NAMES = new Map(); // surface (kanji) -> reading, from the game's own furigana of people, places and maps
function addName(jp) {
  if (!jp) return;
  const surface = RB.jp.plain(jp).replace(/\s+/g, '');
  const reading = String(jp).replace(/\{([^|}]+)\|([^}]+)\}/g, (m, s, r) => r.split('|').join('')).replace(/\s+/g, '');
  if (/[一-鿿]/.test(surface) && surface !== reading) NAMES.set(surface, reading);
}
for (const k in RB.content.chars) addName(RB.content.chars[k].name && RB.content.chars[k].name.jp);
for (const k in RB.content.places || {}) addName(RB.content.places[k].name && RB.content.places[k].name.jp);
for (const k in RB.content.maps) addName(RB.content.maps[k].name && RB.content.maps[k].name.jp);
// the line's own furigana groups whose surface is a name (or contains one) are given as kana
function speakable(l) {
  const groups = [];
  String(l.jp).replace(/\{([^|}]+)\|([^}]+)\}/g, (m, s, r) => { groups.push({ surface: s, reading: r.split('|').join('') }); return m; });
  const overrides = groups.filter((g) => NAMES.has(g.surface) || [...NAMES.keys()].some((n) => n.length > 1 && g.surface.indexOf(n) >= 0 && NAMES.get(n)));
  // the spoken text with each name group replaced by its reading (the line's own reading, never a guess)
  let kanaNames = String(l.jp).replace(/\{([^|}]+)\|([^}]+)\}/g, (m, s, r) => (overrides.some((o) => o.surface === s) ? r.split('|').join('') : s));
  kanaNames = RB.jp.plain(kanaNames).replace(/\s+/g, '').normalize('NFC');
  return { text: l.plain, textNamesKana: kanaNames, overrides: dedupe(overrides) };
}
const dedupe = (a) => a.filter((x, i) => a.findIndex((y) => y.surface === x.surface) === i);
const VARIABLE = /\{name|\$\{|%[a-z]|\{pc|\{comp|\{player/i;
function line(scene, plain) {
  const l = LINES.find((x) => x.scene === scene && x.plain === plain) || frozenByText(scene, plain);
  if (!l) { fail('no line "' + plain + '" in ' + scene); return null; }
  if (VARIABLE.test(l.jp + l.en)) fail('line has a run-time variable: ' + l.key);
  return l;
}
const lineOut = (l) => Object.assign({ key: l.key, scene: l.scene, who: l.who, jp: l.jp, en: RB.script && RB.script.enVars ? RB.script.enVars(l.en) : l.en }, speakable(l));

// ---- shared delivery rules (Robin: "lines need to not have trailing consonants or overly-breathy sounds") ------------
const CLEAN = 'Clear articulation; every word ends cleanly; no breathiness, no trailing sounds.';
const MOOD = {
  neutral: 'Speak in a natural, neutral conversational tone.',
  happy: 'Speak happily, with a warm smile in the voice.',
  sad: 'Speak sadly and quietly, holding the feeling back.',
  frustrated: 'Speak with restrained frustration: firm, a little exasperated, never shouting.',
  excited: 'Speak with excitement, as if suddenly realising something important.',
};

// ---- 1. the player --------------------------------------------------------------------------------------------------
// The texts: five of the player's own lines, one per mood Robin named. None says the player's name.
const PLAYER_LINES = [
  { mood: 'neutral', scene: 'mb.arrive', plain: '町の中で、話を聞こう。' },
  { mood: 'happy', scene: 'co.arrive', plain: '祭りの前に着いたみたいだね。' },
  { mood: 'sad', scene: 'lq.fare_chigusa', plain: '何年か前に亡くなったそうです。渡し舟は、息子のコウジさんが継いでいます。' },
  { mood: 'frustrated', scene: 'lf.tadashi', plain: 'でも、下町が沈んだ日ですよ。' },
  { mood: 'excited', scene: 'sg.dir_check', plain: 'キヨさんの「日の昇るほう」は東。三人とも、同じ場所を指していたんだ。' },
];
// Three candidate sets. Voice A is the lighter, brighter adult voice and Voice B the lower, warmer one (C-83, §03):
// neither is tied to sex or pronouns. Each set is a different pair of designed voices; within a set, High and Low are
// the same take moved up or down by PITCH semitones with the formants kept (PSOLA), so the voice stays itself.
const PITCH = { high: 2, low: -2 };
const PLAYER_SETS = [
  { set: 1, label: 'Set 1: both voices androgynous',
    A: 'A young adult in their early twenties with a light, bright, clear voice; androgynous; mid-high pitch; friendly, attentive and natural, standard Tokyo Japanese.',
    B: 'An adult in their late twenties with a low, warm, steady voice; androgynous, leaning deeper; calm and kind, standard Tokyo Japanese.' },
  { set: 2, label: 'Set 2: A leaning feminine, B leaning masculine',
    A: 'A woman in her early twenties with a bright, lively, clear voice; mid-high pitch; quick and sincere, standard Tokyo Japanese.',
    B: 'A man in his late twenties with a low, warm, gentle voice; relaxed and dependable, standard Tokyo Japanese.' },
  { set: 3, label: 'Set 3: a youthful tenor-alto and a mellow alto-baritone',
    A: 'A youthful voice around twenty, a clear tenor-alto, slightly boyish and earnest; light and quick, standard Tokyo Japanese.',
    B: 'A thoughtful adult in their thirties, a mellow alto-baritone; unhurried and soft-spoken, standard Tokyo Japanese.' },
];
function playerSection() {
  const texts = PLAYER_LINES.map((p) => { const l = line(p.scene, p.plain); return l ? Object.assign({ mood: p.mood }, lineOut(l)) : null; }).filter(Boolean);
  const takes = [];
  for (const s of PLAYER_SETS) for (const v of ['A', 'B']) for (const t of texts) {
    const base = 'P' + s.set + v + '-' + t.mood;
    const design = { engine: 'qwen_design', description: s[v] + ' ' + CLEAN, instruct: s[v] + ' ' + MOOD[t.mood] + ' ' + CLEAN, seed: 1000 * s.set + (v === 'A' ? 100 : 200) };
    for (const p of ['high', 'low']) takes.push({ id: base + '-' + p, section: 'player', set: s.set, voice: v, pitch: p, semitones: PITCH[p], mood: t.mood, source: base, line: t.key, voiceSpec: design });
  }
  return { sets: PLAYER_SETS, pitchSemitones: PITCH, moods: MOOD, texts, takes };
}

// ---- 1b. the companions (Robin, 2026-10-14: "Cover each companion with the same scope as the player: 60 total lines") ---
// For each companion: five of their own lines, one per mood; three sets, each two candidate voices (A the lighter,
// brighter reading of the character, B the lower, warmer one), each at High and Low: 3 × 2 × 2 × 5 = 60 takes. Cast by
// fit, never by a pitch rule tied to pronouns (Nao and Ren are they/them). Qwen3-TTS VoiceDesign as for the player;
// Suzu's third set is AivisSpeech, the engine Robin found best for "bubbly / high energy female voices". Suzu's lines
// are her standard ones (with the Kansai option on, the same voice reads her Kansai versions).
const COMPANIONS = [
  { id: 'nao', name: 'Nao', lines: [
    { mood: 'neutral', scene: 'rw.nao_first', plain: '配達人のナオ。嵐で足止め。で、これ。' },
    { mood: 'happy', scene: 'cs.talk_parcel', plain: '名前のない宛名でも、届くところには届く。……気分がいいな。' },
    { mood: 'sad', scene: 'sg.ch2_end', plain: '届けるべきじゃないと思った。今も、半分はそう思ってる。' },
    { mood: 'frustrated', scene: 'sg.road_inland_closed', plain: 'は？一本道だったぞ。……道が、自分の行き先を忘れてる。' },
    { mood: 'excited', scene: 'lf.after_town', plain: '……うるさい。すごくうるさい。最高じゃん。' },
  ], sets: [
    { set: 1, label: 'Set 1: two androgynous readings',
      A: 'A courier in their early twenties; a light, clear, androgynous voice; quick, wry and dry, warm underneath; casual Tokyo Japanese.',
      B: 'A courier in their mid twenties; a lower, slightly husky androgynous voice; laconic and guarded, warm underneath; casual Tokyo Japanese.' },
    { set: 2, label: 'Set 2: two readings leaning masculine',
      A: 'A young man in his early twenties, a bright tenor; brisk, streetwise and quick-witted, dry humour; casual Tokyo Japanese.',
      B: 'A man in his mid twenties, a low baritone; terse, steady and watchful, dry humour; casual Tokyo Japanese.' },
    { set: 3, label: 'Set 3: two readings leaning feminine',
      A: 'A young woman in her early twenties, a clear alto with a tomboyish edge; quick, blunt and wry; casual Tokyo Japanese.',
      B: 'A woman in her mid twenties, a low, husky alto; cool and laconic, quietly kind; casual Tokyo Japanese.' },
  ] },
  { id: 'mio', name: 'Mio', lines: [
    { mood: 'neutral', scene: 'cs.view_window', plain: '紙がとても薄いですね。破らないように、気をつけます。' },
    { mood: 'happy', scene: 'hall.w2.f1_first', plain: '狐の嫁入り！子供の頃、窓から狐を探したわ。' },
    { mood: 'sad', scene: 'sg.da_boss_after', plain: '静かなほうが傷つかない……。その気持ちが少し分かるのが、嫌。' },
    { mood: 'frustrated', scene: 'sg.da_boss', plain: '片付ける？人の手紙を？……失礼ですが、あなたの規定、間違っています。' },
    { mood: 'excited', scene: 'sg.genzo_wind', plain: '髪がぐちゃぐちゃ！……でも、いい風！' },
  ], sets: [
    { set: 1, label: 'Set 1: bright and capable, warm and reassuring',
      A: 'A young woman in her early twenties, an apothecary; a bright, clear mezzo; warm, attentive and capable; polite standard Japanese.',
      B: 'A woman in her mid twenties, an apothecary; a warm, rounded alto; calm, confident and reassuring; polite standard Japanese.' },
    { set: 2, label: 'Set 2: lively, and grounded',
      A: 'A young woman around twenty, an apothecary; a light, lively soprano; cheerful, quick and sincere; polite standard Japanese.',
      B: 'A woman in her twenties, an apothecary; a steady mid-low voice; grounded and kind with a little dry humour; polite standard Japanese.' },
    { set: 3, label: 'Set 3: precise, and older-sisterly',
      A: 'A young woman in her twenties, an apothecary; a clear, precise voice like a young doctor; brisk and kind; polite standard Japanese.',
      B: 'A woman in her late twenties, an apothecary; a mature, warm voice like a dependable older sister; patient and firm; polite standard Japanese.' },
  ] },
  { id: 'ren', name: 'Ren', lines: [
    { mood: 'neutral', scene: 'cs.parcel_shelf', plain: '道が変わっても、宛名は残る。灯の名と似ています。' },
    { mood: 'happy', scene: 'rw.mr_lantern', plain: '……ありがとう。灯りが一つともると、道が一つ思い出す。先生の口癖です。' },
    { mood: 'sad', scene: 'sg.fuku_plate', plain: '名を返せば、名に付いていたものも戻る。……分かっていたはずなのに。' },
    { mood: 'frustrated', scene: 'yn.ren_evening', plain: '……古い決まりを、軽く見ないでください。それしか残っていない人もいるんです！' },
    { mood: 'excited', scene: 'yn.toki', plain: '百八！……全部、名前があるんですか？' },
  ], sets: [
    { set: 1, label: 'Set 1: two androgynous readings',
      A: 'A lantern keeper around twenty; a soft, clear androgynous tenor-alto; earnest, formal and gentle; polite standard Japanese.',
      B: 'A lantern keeper in their mid twenties; a low, calm androgynous voice; measured and reverent, quietly humorous; polite standard Japanese.' },
    { set: 2, label: 'Set 2: two readings leaning masculine',
      A: 'A young man around twenty, a lantern keeper; a light, gentle tenor; formal, earnest and a little shy; polite standard Japanese.',
      B: 'A young man in his twenties, a lantern keeper; a mellow baritone; calm, thoughtful and dignified; polite standard Japanese.' },
    { set: 3, label: 'Set 3: two readings leaning feminine',
      A: 'A young woman around twenty, a lantern keeper; a clear, cool alto; formal, precise and gentle; polite standard Japanese.',
      B: 'A young woman in her twenties, a lantern keeper; a low, velvety alto; serene and measured; polite standard Japanese.' },
  ] },
  { id: 'suzu', name: 'Suzu', lines: [
    { mood: 'neutral', scene: 'cs.talk_parcel', plain: '役は残って、役者は替わる。舞台と同じよ。' },
    { mood: 'happy', scene: 'kr.kikyo_first', plain: '語りの同業ね！舞台は違うけど、話は合いそう。' },
    { mood: 'sad', scene: 'co.works_sign', plain: '……トモエさん。名前、初めて知った。二十年も経って。' },
    { mood: 'frustrated', scene: 'mp.manbe_first', plain: '役者から役を取るなんて、一番残酷なことよ。……黙っていられないわ。' },
    { mood: 'excited', scene: 'rw.suzu_first', plain: 'さあさあ、旅のお方！嵐の夜の不思議な話、聞いていかない？お代は笑顔ひとつ！' },
  ], sets: [
    { set: 1, label: 'Set 1: a bright stage voice, and a husky one',
      A: 'A travelling performer in her twenties; a bright, projecting stage voice; quick comic timing, warm and playful; standard Japanese with a performer\'s flair.',
      B: 'A travelling performer in her late twenties; a rich, husky alto; theatrical, teasing and worldly, warm underneath; standard Japanese.' },
    { set: 2, label: 'Set 2: a sparkling barker, and a smoky raconteur',
      A: 'A young street performer in her early twenties; a lively, sparkling soprano; a barker\'s energy, cheeky and bright; standard Japanese.',
      B: 'A storyteller in her late twenties; a smoky, low mezzo; dry wit and an easy, knowing warmth; standard Japanese.' },
    { set: 3, label: 'Set 3: AivisSpeech (Robin: best for bubbly, high-energy female voices)', aivis: { A: 'AV-suzu-A', B: 'AV-suzu-B' },
      A: 'AivisSpeech slot AV-suzu-A: a projecting, energetic stage voice.', B: 'AivisSpeech slot AV-suzu-B: a warmer, huskier, witty voice.' },
  ] },
];
// AivisSpeech has no free-text direction: the mood is its style and inflection
const AIVIS_MOOD = {
  neutral: { style: 'normal', params: { speedScale: 1.0, intonationScale: 1.0, tempoDynamicsScale: 1.0 } },
  happy: { style: 'upbeat', params: { speedScale: 1.03, intonationScale: 1.2, tempoDynamicsScale: 1.1 } },
  sad: { style: 'calm', params: { speedScale: 0.94, intonationScale: 0.9, tempoDynamicsScale: 0.9 } },
  frustrated: { style: 'normal', params: { speedScale: 1.05, intonationScale: 1.3, tempoDynamicsScale: 1.15 } },
  excited: { style: 'upbeat', params: { speedScale: 1.08, intonationScale: 1.4, tempoDynamicsScale: 1.2 } },
};
function companionSection() {
  const out = { companions: [], takes: [], pitchSemitones: PITCH, aivisMood: AIVIS_MOOD };
  COMPANIONS.forEach((c, ci) => {
    const texts = c.lines.map((p) => { const l = line(p.scene, p.plain); if (l && !(l.who === c.id || (l.who === 'comp' && new RegExp('comp=' + c.id + '\\b').test(l.if || '')))) fail(c.id + ': ' + l.key + ' is not their line'); return l ? Object.assign({ mood: p.mood }, lineOut(l)) : null; }).filter(Boolean);
    if (texts.length !== 5) fail(c.id + ': five mood lines wanted, ' + texts.length + ' found');
    out.companions.push({ id: c.id, name: c.name, sets: c.sets, texts });
    for (const s of c.sets) for (const v of ['A', 'B']) for (const t of texts) {
      const base = 'C-' + c.id + '-' + s.set + v + '-' + t.mood;
      const spec = s.aivis
        ? { engine: 'aivis', aivisSlot: s.aivis[v], style: AIVIS_MOOD[t.mood].style, params: AIVIS_MOOD[t.mood].params }
        : { engine: 'qwen_design', description: s[v] + ' ' + CLEAN, instruct: s[v] + ' ' + MOOD[t.mood] + ' ' + CLEAN, seed: 20000 + 1000 * ci + 100 * s.set + (v === 'A' ? 10 : 20) };
      for (const p of ['high', 'low']) out.takes.push({ id: base + '-' + p, section: 'companion', companion: c.id, set: s.set, voice: v, pitch: p, semitones: PITCH[p], mood: t.mood, source: base, line: t.key, voiceSpec: spec });
    }
  });
  return out;
}

// ---- 2. the narrator ------------------------------------------------------------------------------------------------
// One line read both ways by each candidate, so the seven voices are compared on the same words.
const NARR_LINE = { scene: 'mb.arrive', plain: '運河の上に、橋が次から次へと架かっている。八百の橋の町、八百橋だ。' };
const NARRATORS = ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7'];
const NARR_DELIVERY = {
  neutral: { label: 'Directed-Neutral', style: 'normal', params: { speedScale: 1.0, intonationScale: 1.0, tempoDynamicsScale: 1.0 },
    note: 'The model\'s own neutral style; steady storyteller pace, the emphasis and pronunciation of the model, no added colour.' },
  energetic: { label: 'Directed-Energetic', style: 'upbeat', params: { speedScale: 1.06, intonationScale: 1.25, tempoDynamicsScale: 1.15 },
    note: 'The model\'s brightest style if it has one (テンション高め, 上機嫌, 喜び…); otherwise its neutral style with stronger inflection and a little more pace.' },
};
function narratorSection() {
  const l = line(NARR_LINE.scene, NARR_LINE.plain);
  const text = l ? lineOut(l) : null;
  const takes = [];
  for (const n of NARRATORS) for (const d of ['neutral', 'energetic']) takes.push({ id: n + '-' + d, section: 'narrator', candidate: n, delivery: d, line: text && text.key,
    voiceSpec: { engine: 'aivis', narratorSlot: n, style: NARR_DELIVERY[d].style, params: NARR_DELIVERY[d].params } });
  return { text, candidates: NARRATORS, deliveries: NARR_DELIVERY,
    choose: 'Seven distinct adult female AivisSpeech models (AIVMX, free on AivisHub or already installed), one candidate per model: a calm, clear storyteller is the target. Prefer different timbres (warm low, clear mid, light high, mature, soft, crisp, rich). Use the default Anneli model as one of them if installed. Each model\'s licence must allow use in a free, distributed game with credit; record it.', takes };
}

// ---- sourced sounds (Robin, 2026-10-14) -------------------------------------------------------------------------------
const SOUNDS = {
  cat_meow: { for: 'Mochi (rw.mochi_find, rw.mochi_home: ニャー), and any cat that meows later',
    want: 'one basic, clean domestic cat meow, about 0.5–1.5 s, no background noise, no other animal or voice',
    licence: 'CC0 or public domain only, as stated on the recording\'s own page (for example a Wikimedia Commons file page); record the URL, author, licence and SHA-256; a recording whose terms cannot be confirmed is not used' },
};

// ---- 3. the NPCs ----------------------------------------------------------------------------------------------------
// a companion sample is chosen by its text: the frozen plan's line with that text, when it is listed
function frozenByText(scene, plain) {
  if (!fs.existsSync(OUT)) return null;
  const fl = Object.values(JSON.parse(fs.readFileSync(OUT, 'utf8')).lines || {}).find((x) => x.scene === scene && x.text === plain);
  const l = fl ? frozenSample(fl.key) : null;
  return l ? Object.assign(l, { plain }) : null;
}
function frozenSample(key) {
  const df = path.join(DIR, 'DIVERGENCES.json');
  if (!fs.existsSync(df) || !fs.existsSync(OUT)) return null;
  const d = (JSON.parse(fs.readFileSync(df, 'utf8')).divergences || []).find((x) => x.key === key);
  const frozen = d && JSON.parse(fs.readFileSync(OUT, 'utf8')).lines[key];
  if (!frozen || sha(frozen.jp) !== d.frozenJpSha256) return null;
  return { key, scene: frozen.scene, who: frozen.who, jp: frozen.jp, en: frozen.en, plain: frozen.text, frozen: true };
}
function npcSection() {
  const f = process.env.VA2_NPC_CASTING || path.join(DIR, 'npc_casting.json');
  if (!fs.existsSync(f)) { fail('missing ' + path.relative(root, f)); return { npcs: [], takes: [] }; }
  const cast = JSON.parse(fs.readFileSync(f, 'utf8'));
  const takes = [], npcs = [];
  const speakers = new Set(LINES.map((l) => l.who));
  for (const n of cast.npcs || []) {
    // a sample the game has since corrected stays frozen (C-95; docs/future/voice/va2/DIVERGENCES.json): the frozen
    // plan's own line, while its text still has the recorded hash
    const l = n.sample && (byKey.get(n.sample.key) || frozenSample(n.sample.key));
    if (!l) { fail('NPC ' + n.id + ': sample line ' + (n.sample && n.sample.key) + ' not in the game'); continue; }
    if (l.who !== n.id) fail('NPC ' + n.id + ': sample is spoken by ' + l.who);
    if (VARIABLE.test(l.jp + l.en)) fail('NPC ' + n.id + ': sample has a run-time variable');
    if (!speakers.has(n.id)) fail('NPC ' + n.id + ': not a speaker');
    const spec = { engine: n.engine };
    if (n.engine === 'qwen_design') {
      if (!n.description) fail('NPC ' + n.id + ': qwen_design without a description');
      const desc = /no breathiness/.test(n.description || '') ? n.description : (n.description || '') + ' ' + CLEAN;
      spec.description = desc;
      spec.instruct = desc + ' ' + (MOOD[n.delivery] || MOOD.neutral);
      spec.seed = 5000 + npcs.length;
    } else if (n.engine === 'aivis') {
      if (!n.aivisSlot) fail('NPC ' + n.id + ': aivis without a slot');
      Object.assign(spec, { aivisSlot: n.aivisSlot, style: n.style || 'normal', params: n.params || {} });
    } else if (n.engine === 'nemo') {
      if (!n.nemoSlot) fail('NPC ' + n.id + ': nemo without a slot');
      if (n.profile && n.profile.age !== 'middle_aged') fail('NPC ' + n.id + ': Nemo is for middle-aged men only (Robin)');
      Object.assign(spec, { nemoSlot: n.nemoSlot, style: n.style || 'normal', params: n.params || {} });
    } else if (n.engine === 'sound') {
      // an animal that only makes its sound (Robin: "source a basic cat meow for Mochi"): a real recording, not a voice
      if (!SOUNDS[n.sound]) fail('NPC ' + n.id + ': unknown sound ' + n.sound);
      spec.sound = n.sound;
      // Robin: "If you cannot source a proper Nya for Mochi, generate it using a female model, any one is fine. Just
      // keep it playful": a voice used only when no recording's terms can be confirmed
      if (n.fallback) {
        if (n.fallback.engine !== 'aivis' || !n.fallback.aivisSlot) fail('NPC ' + n.id + ': the fallback is an AivisSpeech slot');
        spec.fallback = { engine: 'aivis', aivisSlot: n.fallback.aivisSlot, style: n.fallback.style || 'upbeat', params: n.fallback.params || {} };
      }
    } else fail('NPC ' + n.id + ': unknown engine ' + n.engine);
    if (n.fx) spec.fx = n.fx;
    npcs.push({ id: n.id, name: n.name, lines: n.lines, regions: n.regions, profile: n.profile, delivery: n.delivery || 'neutral', fx: n.fx || null, fxWhy: n.fxWhy || null, why: n.why });
    takes.push({ id: 'NPC-' + n.id, section: 'npc', npc: n.id, line: l.key, delivery: n.delivery || 'neutral', voiceSpec: spec });
  }
  // every speaker with lines, except the narrator, the player and the companions, has one take
  const want = [...speakers].filter((w) => !['narr', 'comp', 'pc', 'nao', 'mio', 'ren', 'suzu'].includes(w));
  const have = new Set(npcs.map((n) => n.id));
  const missing = want.filter((w) => !have.has(w));
  if (missing.length && !process.env.VA2_ALLOW_PARTIAL) fail('NPCs without a take: ' + missing.join(', '));
  return { rules: cast.rules, summary: cast.summary, npcs, takes };
}

// ---- the plan -------------------------------------------------------------------------------------------------------
const FX = {
  echo_light: 'A slight echo and a small room: two soft repeats (90 and 180 ms) under the voice. For the Mill Echo.',
  hush: 'Foreboding: the voice two semitones lower with its formants kept, a faint octave-below shadow, the top rolled off, and a long dark reverb. For the Hush.',
  spirit: 'Gentle and airy: a light shimmer (two slightly detuned copies) and a bright, short reverb.',
  ancient: 'Huge and old: one semitone lower with the formants a little lower too, and a large hall.',
  hollow: 'A voice from an object or a place: narrowed to 300–3,400 Hz with a short slapback.',
  ghost: 'A soft reverb and a slight, slow waver in pitch.',
  ember: 'Warm with a little grit (gentle saturation) and a small room.',
};
const sections = { player: playerSection(), companion: companionSection(), narrator: narratorSection(), npc: npcSection() };
const lineTexts = {};
for (const t of [...sections.player.takes, ...sections.companion.takes, ...sections.narrator.takes, ...sections.npc.takes]) {
  const l = byKey.get(t.line) || frozenSample(t.line);
  if (l && !lineTexts[t.line]) lineTexts[t.line] = lineOut(l);
}
let commit = 'unknown';
try { commit = execSync('git rev-parse HEAD', { cwd: root }).toString().trim(); } catch (e) { /* not a checkout */ }
const plan = {
  schemaVersion: 'rbn-va2-plan-1',
  purpose: 'casting samples for Robin\'s choices (C-93): not a final cast, not game audio, not whole-game generation',
  builtFrom: { branch: 'claude/stoic-sagan-n3jvgk', commit, by: 'tools/voice/va2/plan.mjs' },
  counts: { player: sections.player.takes.length, companion: sections.companion.takes.length, narrator: sections.narrator.takes.length, npc: sections.npc.takes.length },
  engines: {
    qwen_design: { model: 'Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign', package: 'qwen-tts (PyPI, Apache-2.0)', language: 'Japanese', note: 'The voice is designed from the description; the mood is added to the same instruction; the seed is fixed per voice.' },
    aivis: { engine: 'AivisSpeech Engine on 127.0.0.1:10101', note: 'Concrete models, speakers and styles for the narrator candidates N1–N7 and the AV-* slots are chosen on the PC and recorded in va2_voices.json.' },
    nemo: { engine: 'VOICEVOX Nemo engine (VOICEVOX API; port to verify, 50121 assumed)', note: 'Middle-aged men only (Robin). NM-A is the voice Robin preferred in VA-1 for the middle-aged man; NM-B and NM-C are other Nemo male voices.' },
    sound: { note: 'A sourced recording, not speech: an animal that only makes its sound. The file and its licence are recorded in va2_voices.json → sounds.' },
  },
  fx: FX,
  sounds: SOUNDS,
  clean: { rule: CLEAN, check: 'After each take: the time before the first voiced sound and the unvoiced tail after the last are measured; a take with more than 0.20 s of sound before the voice or 0.18 s of tail is made again with the next seed (at most three tries, the cleanest kept). Silence is trimmed to 60 ms each side; the tail keeps up to 100 ms of unvoiced sound so a devoiced です still ends naturally.' },
  loudness: 'Every take is set to −20 LUFS (integrated), peaks under −1 dBFS, 48 kHz mono, after any fx.',
  lines: lineTexts,
  sections,
};
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
const json = JSON.stringify(plan, null, 1) + '\n';
if (process.argv.includes('--check')) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  const strip = (s) => s.replace(/"commit": "[0-9a-f]+"/, '');
  if (strip(cur) !== strip(json)) { console.error('va2_plan.json is out of date: run node tools/voice/va2/plan.mjs'); process.exit(1); }
  console.log('va2_plan.json is current:', plan.counts);
} else {
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(OUT, json);
  console.log('wrote', path.relative(root, OUT), plan.counts, 'sha256', sha(json).slice(0, 12));
}
