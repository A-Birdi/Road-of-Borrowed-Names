// VA-1 VS02: the seven provider configurations and how each case becomes that provider's request. Building a request
// sends nothing. `build(case, voice, takeKind, opts)` takes one corpus case (docs/future/voice/corpus/
// audition_corpus.json), the cast voice for its role and the take kind ('directed' or 'neutral_control'), and returns
// either { blocked } or a plan the runner (tools/voice/audition.mjs) can execute:
//  - sentText is the only text a provider may voice: the case's spoken Japanese, nothing else. The direction, the
//    context, the English and the speaker id never go into it; each provider gets the direction only through a
//    channel it documents as not spoken (engine parameters, an SSML attribute, an instruction or metadata field), or
//    not at all. A neutral control drops the direction and keeps everything else (voice, readings).
//  - Reading overrides (the corpus's pronunciationOverrides) go through the provider's own documented route, or are
//    recorded as not applied; an unsupported route is never counted as a corrected reading (§11).
//  - Secrets are never in the request built here: headers carry `<env NAME>` placeholders, filled only by the runner
//    at send time from the environment, never written to any file or log.
//  - `verify` marks details not confirmed from an official source readable here; check them before the first
//    authorised request (VS02_SETUP_REQUEST.md lists the source of every fact).

// a delivery label's broad energy, for engines whose only control is a speed/intonation scale (conservative ranges)
const ENERGY = {
  high: /alarm|celebration|comic|delight|excited|urgent|good news|flourish|spirited|resolve|rally|tease|banter/i,
  low: /calm|reflection|sorrow|solemn|tender|vulnerable|apology|regret|bittersweet|suspense|remembrance|nervous|quiet|grief/i,
};
const energyOf = (c) => (ENERGY.high.test(c.deliveryLabel) ? 'high' : ENERGY.low.test(c.deliveryLabel) ? 'low' : 'mid');

// katakana for a hiragana reading (VOICEVOX writes its reading in katakana)
export const kata = (s) => s.replace(/[ぁ-ゖ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60));
// long vowels written either way (トウ / トー / トオ) compare equal; accent and phrase marks dropped
const ROW = { a: 'アカガサザタダナハバパマヤラワャァ', i: 'イキギシジチヂニヒビピミリィ', u: 'ウクグスズツヅヌフブプムユルュゥヴ', e: 'エケゲセゼテデネヘベペメレェ', o: 'オコゴソゾトドノホボポモヨロヲョォ' };
const VOWEL = { a: 'ア', i: 'イ', u: 'ウ', e: 'エ', o: 'オ' };
const vowelOf = (ch) => Object.keys(ROW).find((v) => ROW[v].includes(ch));
export function kanaNorm(k) {
  const s = [...k.replace(/[’'\/_、。？?！!\s]/g, '')];
  const out = [];
  for (const ch of s) {
    const pv = out.length ? vowelOf(out[out.length - 1]) : null;
    if (ch === 'ー' && pv) out.push(VOWEL[pv]);
    else if (ch === 'ウ' && pv === 'o') out.push('オ');
    else if (ch === 'イ' && pv === 'e') out.push('エ');
    else out.push(ch);
  }
  return out.join('');
}
// a reading of one mora proves nothing by containment (ヒ is everywhere); such checks are inconclusive
const morae = (k) => [...k].filter((ch) => !'ャュョァィゥェォ'.includes(ch)).length;
export function readingCheck(engineKana, overrides) {
  const have = kanaNorm(engineKana || '');
  return overrides.map((o) => {
    const want = kanaNorm(kata(o.reading));
    if (morae(want) < 2) return { surface: o.surface, expected: kata(o.reading), status: 'inconclusive', why: 'a one-mora reading cannot be located by containment' };
    return { surface: o.surface, expected: kata(o.reading), status: have.includes(want) ? 'found' : 'not_found' };
  });
}
// the first occurrence of each override's surface, replaced by `fn(surface, reading)`; longer surfaces first so 灯台
// is not split by 灯
function substitute(text, overrides, fn) {
  const os = overrides.slice().sort((a, b) => b.surface.length - a.surface.length);
  const marks = [];
  let t = text;
  for (const o of os) {
    const i = t.indexOf(o.surface);
    if (i < 0) continue;
    const key = '\u0000' + marks.length + '\u0000';
    marks.push(fn(o.surface, o.reading));
    t = t.slice(0, i) + key + t.slice(i + o.surface.length);
  }
  return t.replace(/\u0000(\d+)\u0000/g, (_, n) => marks[+n]);
}

const VV_ADJUST = { high: { speedScale: 1.05, intonationScale: 1.15 }, low: { speedScale: 0.95, intonationScale: 0.9 }, mid: { speedScale: 1, intonationScale: 1 } };
const localEngine = (id, label, port, extra) => ({
  id, label, kind: 'local', port, model: extra.model, hosts: extra.hosts, download: extra.download, secret: null, controls: extra.controls,
  // VOICEVOX-family: POST /audio_query?speaker=<style>&text=<text> → query JSON; adjust it; POST /synthesis?speaker=<style>
  build(c, voice, take) {
    if (!voice || voice.styleId == null) return { blocked: 'no cast voice (style id) for ' + c.castingProfile };
    const neutral = take === 'neutral_control';
    const mapped = !neutral && voice.styleFor && voice.styleFor[c.deliveryLabel] != null;
    const style = mapped ? voice.styleFor[c.deliveryLabel] : voice.styleId;
    const adjust = extra.adjust(c, neutral);
    const ov = c.pronunciationOverrides || [];
    const kanaInput = extra.kanaIsInput && ov.length ? substitute(c.spokenText, ov, (s, r) => r) : null;
    return {
      engine: { port, style, text: c.spokenText, adjust, kana: kanaInput, userDict: voice.userDict || [] },
      sentText: c.spokenText,
      directionChannel: neutral ? 'none (neutral control)' : [mapped ? 'style id ' + style + ' mapped to "' + c.deliveryLabel + '"' : 'the voice\'s neutral style (no style mapped to this delivery)', extra.adjustNote].filter(Boolean).join('; '),
      readingChannel: !ov.length ? 'none needed' : extra.kanaIsInput ? 'the query\'s kana field (AivisSpeech reads it as the reading text)' : 'checked against the engine\'s own reading (the query\'s kana); a mismatch is repaired only with a user-dictionary entry whose accent a person chose',
      readingsApplied: extra.kanaIsInput ? ov.map((o) => o.surface) : [],
      readingsNotApplied: [],
      unsupported: ['free-text direction (no such field)', 'context (not sent)'].concat(mapped || neutral ? [] : ['a style for "' + c.deliveryLabel + '" (text-conditioned delivery only)']),
    };
  },
});

export const PROVIDERS = {
  voicevox: localEngine('voicevox', 'VOICEVOX character voices', 50021, {
    model: { engine: 'VOICEVOX Engine (pin the exact release at VS02; 0.25.2 was the latest on 2026-10-12)', voices: 'licensed character voices and their styles, enumerated from /speakers; each voice library\'s own terms apply (S14)' },
    hosts: ['127.0.0.1:50021 (the engine on the machine that runs the job)', 'download: github.com/VOICEVOX/voicevox_engine/releases (redirects to objects.githubusercontent.com / release-assets.githubusercontent.com) or Docker Hub voicevox/voicevox_engine:cpu-latest (registry-1.docker.io, auth.docker.io, production.cloudflare.docker.com)'],
    download: { here: 'not runnable: no Docker daemon; Docker Hub anonymous pull rate limit reached; GitHub release downloads and voicevox.hiroshiba.jp refused by the network policy', robin: 'the VOICEVOX app (its editor starts the engine on 50021) or the engine release; sizes verify on the release page', ram: '1–2 GB (verify)' },
    controls: ['style id (per voice)', 'speedScale', 'intonationScale (overall inflection)', 'pitchScale', 'volumeScale', 'pre/post phoneme length', 'accent phrases / user dictionary (readings)'],
    adjust: (c, neutral) => (neutral ? VV_ADJUST.mid : VV_ADJUST[energyOf(c)]),
    adjustNote: 'speedScale/intonationScale by the delivery\'s broad energy (±5% / ±15%)',
  }),
  voicevox_nemo: localEngine('voicevox_nemo', 'VOICEVOX Nemo (character-free voices)', 50121, {
    model: { engine: 'the VOICEVOX Nemo engine (its own release; port 50121 is an assumption: verify)', voices: 'Nemo voices from its own /speakers, never a VOICEVOX character style id by assumption; their own terms (S04)' },
    hosts: ['127.0.0.1:50121 (verify)', 'download: voicevox.hiroshiba.jp/nemo (refused here) and the release host it links to (verify)'],
    download: { here: 'not runnable: the Nemo site and release downloads refused; no Docker daemon', robin: 'the Nemo engine added to the VOICEVOX app (verify the current procedure)', ram: '1–2 GB (verify)' },
    controls: ['as VOICEVOX (same API family): style id, speed/intonation/pitch scales, user dictionary'],
    adjust: (c, neutral) => (neutral ? VV_ADJUST.mid : VV_ADJUST[energyOf(c)]),
    adjustNote: 'speedScale/intonationScale by the delivery\'s broad energy (±5% / ±15%)',
  }),
  aivis: localEngine('aivis', 'AivisSpeech (AIVMX models)', 10101, {
    model: { engine: 'AivisSpeech Engine (pin the exact release; 1.2.0 was the latest read on 2026-10-12)', voices: 'an explicitly identified AIVMX model (uuid + version), speaker and style; the default model (≈250 MB) and the BERT model (≈650 MB, from huggingface.co) download on first start (README)' },
    hosts: ['127.0.0.1:10101', 'download: ghcr.io/aivis-project/aivisspeech-engine:cpu-latest or github.com/Aivis-Project/AivisSpeech-Engine/releases; models: hub.aivis-project.com (AivisHub) and huggingface.co (BERT)'],
    download: { here: 'not runnable: no Docker daemon; AivisHub and Hugging Face refused (the first start needs both)', robin: 'the AivisSpeech app or engine; ≥1.5 GB free RAM (README); ≈0.9 GB first-start models + each AIVMX model', ram: '≥1.5 GB free (README)' },
    controls: ['style id (per model speaker)', 'intonationScale = the style\'s emotional strength, 0–2 (ignored for a Normal style)', 'tempoDynamicsScale 0–2', 'speedScale', 'kana = the reading text', 'pitchScale (degrades quality away from 0: left at 0)', 'pauseLength fields ignored'],
    kanaIsInput: true,
    adjust: (c, neutral) => ({ speedScale: neutral ? 1 : (energyOf(c) === 'low' ? 0.95 : energyOf(c) === 'high' ? 1.05 : 1), intonationScale: 1, tempoDynamicsScale: 1 }),
    adjustNote: 'speedScale by broad energy (±5%); intonationScale (here the style\'s emotional strength) and tempoDynamicsScale left at 1; pitchScale left at 0',
  }),
  qwen: {
    id: 'qwen', label: 'Qwen3-TTS 1.7B CustomVoice (instruction-capable)', kind: 'local_or_hosted',
    model: { local: 'Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice with Qwen/Qwen3-TTS-Tokenizer-12Hz (official README: instruction control ✅; the 0.6B CustomVoice has no instruction control and is not a substitute); qwen-tts package; nine preset speakers, Ono_Anna the Japanese-native one; VoiceDesign (1.7B) only as a separately labelled subtrial', hosted: 'Alibaba Cloud Model Studio Qwen3-TTS (DashScope); the exact hosted model name, endpoint and instruction field verify (docs host refused here)' },
    hosts: ['local: pypi.org / files.pythonhosted.org (qwen-tts, torch); weights from huggingface.co (+ cdn-lfs*.huggingface.co, *.hf.co, cas-bridge.xethub.hf.co) or modelscope.cn', 'hosted: dashscope-intl.aliyuncs.com (verify)'],
    download: { weights: '1.7B parameters in bf16 ≈ 3.5–4 GB + tokenizer (verify on the model card)', python: 'torch + transformers + qwen-tts; a CUDA build of torch from PyPI is several GB', peakDisk: '≈8–10 GB with torch and caches', ram: '≈8 GB+; a GPU with ≥8 GB recommended (the README loads it on cuda in bf16)', here: 'not sensible: 5.5 GB free, weight hosts refused, no GPU' },
    secret: { env: 'DASHSCOPE_API_KEY', header: 'Authorization: Bearer <env DASHSCOPE_API_KEY>' },
    controls: ['speaker (nine presets)', 'language', 'instruct (natural-language style, separate from text)'],
    build(c, voice, take) {
      if (!voice || !voice.speaker) return { blocked: 'no cast speaker for ' + c.castingProfile };
      const neutral = take === 'neutral_control';
      const ov = c.pronunciationOverrides || [];
      return {
        local: { text: c.spokenText, language: 'Japanese', speaker: voice.speaker, instruct: neutral ? '' : c.direction },
        hosted: { method: 'POST', url: 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation (verify)', headers: { Authorization: 'Bearer <env DASHSCOPE_API_KEY>', 'Content-Type': 'application/json' }, body: { model: '<hosted model id: verify>', input: { text: c.spokenText, voice: voice.speaker, language_type: 'Japanese', instructions: neutral ? undefined : c.direction } } },
        sentText: c.spokenText, directionChannel: neutral ? 'none (neutral control)' : 'the instruct field (separate from the text)',
        readingChannel: ov.length ? 'none documented' : 'none needed', readingsApplied: [], readingsNotApplied: ov.map((o) => o.surface),
        unsupported: ['context (not sent)'].concat(ov.length ? ['reading overrides (no documented field)'] : []),
      };
    },
  },
  gemini: {
    id: 'gemini', label: 'Gemini-TTS', kind: 'hosted',
    model: { api: 'Gemini API Interactions (POST /v1beta/interactions) as the official google-genai SDK ≥2.24 sends it', model: 'gemini-3.8-flash-tts (the cookbook\'s current TTS model; gemini-3.8-flash-lite-tts would be a separate configuration, never mixed)', voices: 'one of the 30 prebuilt voices (speech_config[].voice); a Voice Design voice (client.voices, type "prompted") only as a separately labelled subtrial', output: 'AUDIO_WAV: RIFF, 24 kHz mono 16-bit (cookbook)' },
    routes: {
      gemini_api: { hosts: ['generativelanguage.googleapis.com (reachable from here)'], secret: { env: 'GEMINI_API_KEY', header: 'x-goog-api-key: <env GEMINI_API_KEY>' } },
      cloud_tts: { hosts: ['texttospeech.googleapis.com (reachable from here)'], secret: { env: 'GOOGLE_OAUTH_TOKEN + GOOGLE_CLOUD_PROJECT', header: 'Authorization: Bearer <env GOOGLE_OAUTH_TOKEN>; x-goog-user-project: <env GOOGLE_CLOUD_PROJECT>' } },
    },
    hosts: ['generativelanguage.googleapis.com (Gemini API route)', 'texttospeech.googleapis.com (Cloud Text-to-Speech route)'],
    secret: { env: 'GEMINI_API_KEY', header: 'x-goog-api-key: <env GEMINI_API_KEY>' },
    controls: ['voice (prebuilt name or designed voice id)', 'speech_metadata.style (persona, emotion, pacing, accent; separate from the text)', 'inline vocal tags in the text (<laugh>, <sigh>, <short pause>…: not used, so nothing but the words is in the text)', 'Cloud TTS route: input.prompt (style instruction, "we pass the unedited text"), voice.model_name, audio_config.speaking_rate'],
    build(c, voice, take) {
      if (!voice || !voice.voiceName) return { blocked: 'no cast voice for ' + c.castingProfile };
      const neutral = take === 'neutral_control';
      const ov = c.pronunciationOverrides || [];
      const common = { sentText: c.spokenText, readingChannel: ov.length ? 'none documented for Japanese (Cloud TTS custom_pronunciations is en-US only per its API definition)' : 'none needed', readingsApplied: [], readingsNotApplied: ov.map((o) => o.surface), unsupported: ['context (not sent)'].concat(ov.length ? ['reading overrides'] : []) };
      if ((voice.route || 'gemini_api') === 'cloud_tts') {
        return Object.assign({
          request: {
            method: 'POST', url: 'https://texttospeech.googleapis.com/v1/text:synthesize',
            headers: { Authorization: 'Bearer <env GOOGLE_OAUTH_TOKEN>', 'x-goog-user-project': '<env GOOGLE_CLOUD_PROJECT>', 'Content-Type': 'application/json' },
            body: { input: neutral ? { text: c.spokenText } : { text: c.spokenText, prompt: c.direction }, voice: { languageCode: 'ja-JP', name: voice.voiceName, modelName: voice.modelName || '<Cloud TTS Gemini model name: verify>' }, audioConfig: { audioEncoding: 'LINEAR16', sampleRateHertz: 24000 } },
          },
          response: 'cloud_tts',
          directionChannel: neutral ? 'none (neutral control)' : 'input.prompt (Cloud TTS style instruction; the text is passed unedited)',
        }, common);
      }
      return Object.assign({
        request: {
          method: 'POST', url: 'https://generativelanguage.googleapis.com/v1beta/interactions',
          headers: { 'x-goog-api-key': '<env GEMINI_API_KEY>', 'Content-Type': 'application/json' },
          body: {
            model: voice.model || 'gemini-3.8-flash-tts',
            input: [neutral ? { type: 'text', text: c.spokenText } : { type: 'text', text: c.spokenText, annotations: [{ type: 'speech_metadata', style: c.direction }] }],
            response_format: { type: 'audio' }, generation_config: { speech_config: [{ voice: voice.voiceName }] }, store: false,
          },
        },
        response: 'gemini_interaction',
        directionChannel: neutral ? 'none (neutral control)' : 'speech_metadata.style (the text is spoken verbatim; the style is not)',
      }, common);
    },
  },
  elevenlabs: {
    id: 'elevenlabs', label: 'ElevenLabs', kind: 'hosted',
    model: { model: 'eleven_v3 or eleven_multilingual_v2: one pinned per pass, never mixed (S08); verify Japanese support for the chosen one', voices: 'a voice id from the account\'s library (no cloning of real people)', output: 'mp3_44100_128' },
    hosts: ['api.elevenlabs.io (refused here)'],
    secret: { env: 'ELEVENLABS_API_KEY', header: 'xi-api-key: <env ELEVENLABS_API_KEY>' },
    controls: ['voice id', 'model id', 'voice_settings (stability, similarity_boost, style, speed)', 'language_code', 'v3 audio tags inline in the text (not used)', 'pronunciation dictionaries (alias/phoneme rules; not configured here: verify for Japanese)'],
    build(c, voice, take) {
      if (!voice || !voice.voiceId) return { blocked: 'no cast voice for ' + c.castingProfile };
      const neutral = take === 'neutral_control';
      const ov = c.pronunciationOverrides || [];
      const lively = energyOf(c) === 'high';
      return {
        request: {
          method: 'POST', url: 'https://api.elevenlabs.io/v1/text-to-speech/' + voice.voiceId + '?output_format=mp3_44100_128',
          headers: { 'xi-api-key': '<env ELEVENLABS_API_KEY>', 'Content-Type': 'application/json' },
          body: { text: c.spokenText, model_id: voice.modelId || 'eleven_v3', language_code: 'ja', voice_settings: neutral ? { stability: 0.5, style: 0 } : { stability: lively ? 0.35 : 0.45, style: lively ? 0.4 : 0.25 } },
        },
        response: 'audio_bytes',
        sentText: c.spokenText, directionChannel: neutral ? 'none (neutral control)' : 'voice settings only (stability/style by broad energy); no tags or prose in the text',
        readingChannel: ov.length ? 'a pronunciation dictionary could carry aliases; not configured for the audition' : 'none needed', readingsApplied: [], readingsNotApplied: ov.map((o) => o.surface),
        unsupported: ['free-text direction', 'context (previous_text/next_text exist but are left out: they could colour the take)'].concat(ov.length ? ['reading overrides (not configured)'] : []),
      };
    },
  },
  azure: {
    id: 'azure', label: 'Azure Speech (neural voices, SSML)', kind: 'hosted',
    model: { api: 'Speech REST v1 with SSML', voices: 'a ja-JP neural voice (its styles and roles listed by the voices/list endpoint; only listed ones are used, S09/S15)', output: 'riff-24khz-16bit-mono-pcm' },
    hosts: ['<region>.tts.speech.microsoft.com (refused here)'],
    secret: { env: 'AZURE_SPEECH_KEY + AZURE_SPEECH_REGION', header: 'Ocp-Apim-Subscription-Key: <env AZURE_SPEECH_KEY>' },
    controls: ['voice name', 'mstts:express-as style/styledegree/role (only where the voice lists them)', 'prosody rate/pitch', 'sub alias / phoneme (readings)'],
    build(c, voice, take) {
      if (!voice || !voice.name) return { blocked: 'no cast voice for ' + c.castingProfile };
      const neutral = take === 'neutral_control';
      const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const style = !neutral && voice.styleFor ? voice.styleFor[c.deliveryLabel] || null : null;
      const ov = c.pronunciationOverrides || [];
      // readings by <sub alias> (the alias is read, the surface stays as written); the text is escaped piecewise
      const inner = substitute(c.spokenText, ov, (s, r) => '\u0001' + r + '\u0002' + s + '\u0003').split(/(\u0001[^\u0002]*\u0002[^\u0003]*\u0003)/).map((p) => {
        const m = /^\u0001([^\u0002]*)\u0002([^\u0003]*)\u0003$/.exec(p);
        return m ? '<sub alias="' + esc(m[1]) + '">' + esc(m[2]) + '</sub>' : esc(p);
      }).join('');
      const ssml = '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="ja-JP"><voice name="' + esc(voice.name) + '">' +
        (style ? '<mstts:express-as style="' + esc(style) + '">' + inner + '</mstts:express-as>' : inner) + '</voice></speak>';
      return {
        request: {
          method: 'POST', url: 'https://<env AZURE_SPEECH_REGION>.tts.speech.microsoft.com/cognitiveservices/v1',
          headers: { 'Ocp-Apim-Subscription-Key': '<env AZURE_SPEECH_KEY>', 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm', 'User-Agent': 'rbn-va1-audition' },
          body: ssml,
        },
        response: 'audio_bytes',
        sentText: c.spokenText, directionChannel: neutral ? 'none (neutral control)' : (style ? 'SSML express-as style "' + style + '"' : 'none: no listed style for this delivery'),
        readingChannel: ov.length ? 'SSML <sub alias> (verify that the voice honours it)' : 'none needed', readingsApplied: ov.map((o) => o.surface), readingsNotApplied: [],
        unsupported: ['free-text direction', 'context (not sent)'].concat(style || neutral ? [] : ['a style for "' + c.deliveryLabel + '" (text-conditioned delivery only)']),
      };
    },
  },
};
export const ORDER = ['voicevox', 'voicevox_nemo', 'aivis', 'qwen', 'gemini', 'elevenlabs', 'azure'];

// The words a request would make the provider voice, recovered from the built request itself (not from sentText), so
// a test can prove nothing else is in the spoken channel.
export function spokenChannelOf(id, plan) {
  if (plan.engine) return plan.engine.text;
  if (id === 'qwen') return [plan.local.text, plan.hosted.body.input.text];
  if (id === 'gemini') return plan.request.body.input ? (plan.request.body.input.text != null ? plan.request.body.input.text : plan.request.body.input.map((t) => t.text).join('')) : null;
  if (id === 'elevenlabs') return plan.request.body.text;
  if (id === 'azure') return plan.request.body.replace(/<sub alias="[^"]*">/g, '').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  return null;
}
