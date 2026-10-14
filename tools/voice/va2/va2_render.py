#!/usr/bin/env python3
"""VA-2: render the casting samples of docs/future/voice/va2/va2_plan.json on the machine that has the engines (Robin's
PC; the cloud environment that wrote this cannot run them). Free, local engines only:

  - Qwen3-TTS 1.7B VoiceDesign (qwen-tts package; the voice designed from the plan's description, the mood added to
    the same instruction, a fixed seed per voice);
  - AivisSpeech Engine (127.0.0.1:10101) with the AIVMX models chosen for the narrator candidates N1–N7 and the AV-*
    slots in va2_voices.json;
  - the VOICEVOX Nemo engine (VOICEVOX API) with the voices chosen for the NM-* slots (middle-aged men only);
  - for an animal that only makes its sound (Mochi's ニャー), a sourced CC0 or public-domain recording (`sounds` in
    va2_voices.json), not a voice.

    python va2_render.py voices  --voices va2_voices.json --out <work>       list the engines' speakers, check the file
    python va2_render.py render  --plan <plan> --voices va2_voices.json --out <work> [--only player,companion,narrator,npc]
                                 [--engines qwen_design,aivis,nemo] [--ids ID,ID] [--limit N]
    python va2_render.py render  ... --mock                                   synthetic audio: tests the job, not voices

Each take: the engine's audio → the clean-ending check (a Qwen take with a long lead-in or unvoiced tail is made again
with the next seed, at most three tries, the cleanest kept; AivisSpeech and Nemo give the same audio every time, so
theirs is only recorded) → trimmed to its speech → for the player, moved to High or Low (PSOLA, formants kept) → the
supernatural treatment if any → −20 LUFS → Ogg Opus 48 kHz mono (about 58 kbit/s) in <work>/clips/, with <work>/results.json recording
what was sent, which voice, every try and every measurement. A take whose request is unchanged is not made again.
Nothing here is a final cast, game audio or whole-game generation (C-93).
"""
import argparse
import hashlib
import io
import json
import os
import sys
import time
import urllib.parse
import urllib.request

import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import va2_audio as A  # noqa: E402

LANG = 'Japanese'
OPENER = urllib.request.build_opener(urllib.request.ProxyHandler({}))  # loopback only, never through a proxy


def jload(p):
    with open(p, encoding='utf-8') as f:
        return json.load(f)


def jsave(p, d):
    tmp = p + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, indent=1)
    os.replace(tmp, p)


def sha(o):
    return hashlib.sha256(json.dumps(o, ensure_ascii=False, sort_keys=True).encode('utf-8')).hexdigest()


# ---- engines ----------------------------------------------------------------------------------------------------------
class VoicevoxFamily:
    """AivisSpeech and VOICEVOX Nemo share the VOICEVOX API: /audio_query then /synthesis."""

    def __init__(self, url, name):
        self.url, self.name = url.rstrip('/'), name

    def _req(self, path, data=None, ctype='application/json'):
        req = urllib.request.Request(self.url + path, data=data, method='POST' if data is not None else 'GET')
        if data is not None:
            req.add_header('Content-Type', ctype)
        with OPENER.open(req, timeout=300) as r:
            return r.read()

    def speakers(self):
        return json.loads(self._req('/speakers'))

    def version(self):
        try:
            return json.loads(self._req('/version'))
        except Exception as e:  # noqa: BLE001
            return 'unknown (' + str(e)[:60] + ')'

    def synth(self, text, style_id, params):
        q = json.loads(self._req('/audio_query?' + urllib.parse.urlencode({'text': text, 'speaker': style_id}), data=b''))
        for k, v in (params or {}).items():
            if k in q:
                q[k] = v
        q['outputSamplingRate'] = A.SR
        q['outputStereo'] = False
        wav = self._req('/synthesis?' + urllib.parse.urlencode({'speaker': style_id}), data=json.dumps(q).encode('utf-8'))
        x, sr = sf.read(io.BytesIO(wav), dtype='float64')
        return A.to48k(x, sr), {k: q.get(k) for k in ('speedScale', 'pitchScale', 'intonationScale', 'tempoDynamicsScale', 'volumeScale') if k in q}


class Qwen:
    def __init__(self, cfg):
        self.cfg, self.model = cfg, None

    def load(self):
        if self.model is None:
            import torch
            from qwen_tts import Qwen3TTSModel
            dev = self.cfg.get('device') or ('cuda:0' if torch.cuda.is_available() else 'cpu')
            dtype = torch.bfloat16 if dev.startswith('cuda') else torch.float32
            self.torch, self.device = torch, dev
            self.model = Qwen3TTSModel.from_pretrained(self.cfg.get('model') or 'Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign', device_map=dev, dtype=dtype)
        return self.model

    def synth(self, text, instruct, seed):
        m = self.load()
        self.torch.manual_seed(int(seed))
        wavs, sr = m.generate_voice_design(text=[text], instruct=[instruct], language=[LANG])
        return A.to48k(np.asarray(wavs[0], dtype=np.float64), sr)


class Mock:
    """Synthetic voiced audio with a breath before and a tail after on some seeds: exercises the job, says nothing."""

    def synth(self, text, f0=180.0, seed=0):
        import scipy.signal as s
        rng = np.random.default_rng(int(seed))
        sr, parts = A.SR, []
        n = max(4, len(text))
        lead = rng.standard_normal(int(0.3 * sr)) * 0.01 if seed % 3 == 0 else np.zeros(int(0.05 * sr))
        parts.append(np.zeros(int(0.15 * sr)))
        parts.append(lead)
        for i in range(n):
            t = np.arange(int(0.11 * sr)) / sr
            ph = np.cumsum(np.full(len(t), f0 * (1 + 0.05 * np.sin(i))) / sr)
            src = sum(np.sin(2 * np.pi * k * ph) / k for k in range(1, 25))
            y = s.lfilter(*s.iirpeak(700 + 90 * (i % 5), 5, fs=sr), src)
            parts.append(y * 0.08 * np.hanning(len(y)) ** 0.4)
        parts.append(rng.standard_normal(int((0.3 if seed % 2 == 0 else 0.05) * sr)) * 0.015)
        parts.append(np.zeros(int(0.2 * sr)))
        return np.concatenate(parts)


# ---- voices ---------------------------------------------------------------------------------------------------------
def resolve(spec, voices, delivery_style=None):
    """The concrete voice for an AivisSpeech or Nemo take: model, speaker, style id (and whether the wanted style had to
    fall back to the neutral one)."""
    eng = spec['engine']
    if eng == 'aivis':
        key = spec.get('narratorSlot') or spec.get('aivisSlot')
        pool = (voices.get('aivis') or {}).get('narrators' if spec.get('narratorSlot') else 'slots') or {}
    elif eng == 'nemo':
        key = spec.get('nemoSlot')
        pool = (voices.get('nemo') or {}).get('slots') or {}
    else:
        return None
    v = pool.get(key)
    if not v:
        raise KeyError('no voice chosen for ' + eng + ' ' + str(key) + ' in va2_voices.json')
    want = spec.get('style') or 'normal'
    styles = v.get('styles') or {}
    sid = styles.get(want)
    fell_back = sid is None
    if sid is None:
        sid = styles.get('normal')
    if sid is None:
        raise KeyError(eng + ' ' + key + ': no style id for "normal"')
    return {'slot': key, 'styleId': sid, 'styleWanted': want, 'styleFellBack': fell_back,
            **{k: v.get(k) for k in ('modelName', 'modelUuid', 'modelVersion', 'speakerName', 'licence', 'credit')}}


def clamp_params(eng, params):
    p = dict(params or {})
    lim = {'aivis': {'pitchScale': 0.05, 'speedScale': (0.85, 1.2), 'intonationScale': (0.0, 2.0), 'tempoDynamicsScale': (0.0, 2.0)},
           'nemo': {'pitchScale': 0.1, 'speedScale': (0.85, 1.2), 'intonationScale': (0.0, 2.0)}}[eng]
    out = {}
    for k, v in p.items():
        if k not in lim:
            continue
        L = lim[k]
        out[k] = max(-L, min(L, float(v))) if not isinstance(L, tuple) else max(L[0], min(L[1], float(v)))
    return out


# ---- one take -------------------------------------------------------------------------------------------------------
def make(take, plan, voices, eng, out, mock, cache):
    line = plan['lines'][take['line']]
    spec = take['voiceSpec']
    e = spec['engine']
    text = line['textNamesKana']
    req = {'engine': e, 'text': text, 'spec': spec, 'pitch': take.get('semitones', 0)}
    tries = []
    if e == 'sound':
        # a sourced recording (an animal's sound, not speech): its file and licence come from va2_voices.json → sounds
        sid = spec['sound']
        if mock:
            t = np.arange(int(0.8 * A.SR)) / A.SR
            f = 550 + 350 * np.sin(np.pi * t / 0.8)
            x0 = 0.2 * np.sin(2 * np.pi * np.cumsum(f) / A.SR) * np.sin(np.pi * t / 0.8)
            voice = {'sound': sid, 'mock': True}
        else:
            snd = (voices.get('sounds') or {}).get(sid) or {}
            path = os.path.join(voices.get('_dir', '.'), snd['file'])
            x0, sr0 = sf.read(path, dtype='float64')
            x0 = A.to48k(x0, sr0)
            voice = {'sound': sid, **{k: snd.get(k) for k in ('file', 'url', 'author', 'licence', 'sha256', 'title')}}
        m = A.clean_measure(x0)
        tries.append({'pre': r3(m['pre']), 'tail': r3(m['tail']), 'voiced': m['voiced'], 'clean': A.is_clean(m)})
        x = A.trim(x0, m) if m['voiced'] else x0
    elif e == 'qwen_design':
        src_key = take.get('source') or take['id']
        if src_key in cache:
            x, tries, used = cache[src_key]
        else:
            best = None
            for k in range(3):
                seed = int(spec.get('seed', 0)) + k
                t0 = time.time()
                x0 = eng['mock'].synth(text, 140 + (seed % 7) * 15, seed) if mock else eng['qwen'].synth(text, spec['instruct'], seed)
                m = A.clean_measure(x0)
                tries.append({'seed': seed, 'seconds': round(time.time() - t0, 2), 'pre': r3(m['pre']), 'tail': r3(m['tail']), 'voiced': m['voiced'], 'clean': A.is_clean(m)})
                score = (0 if A.is_clean(m) else 1, (m['pre'] or 9) + (m['tail'] or 9))
                if best is None or score < best[0]:
                    best = (score, x0, m, seed)
                if A.is_clean(m):
                    break
            x = A.trim(best[1], best[2])
            used = {'seed': best[3], 'model': 'mock' if mock else (voices.get('qwen') or {}).get('model', 'Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign')}
            cache[src_key] = (x, tries, used)
        voice = dict(used)
    else:
        voice = resolve(spec, voices) if not mock else {'slot': spec.get('narratorSlot') or spec.get('aivisSlot') or spec.get('nemoSlot'), 'styleId': 0, 'mock': True}
        params = clamp_params(e, spec.get('params'))
        t0 = time.time()
        if mock:
            x0, sent = eng['mock'].synth(text, 200 if e == 'aivis' else 120, 1), params
        else:
            x0, sent = eng[e].synth(text, voice['styleId'], params)
        m = A.clean_measure(x0)
        tries.append({'seconds': round(time.time() - t0, 2), 'pre': r3(m['pre']), 'tail': r3(m['tail']), 'voiced': m['voiced'], 'clean': A.is_clean(m), 'params': sent})
        x = A.trim(x0, m)
    if take.get('semitones'):
        x = A.pitch_shift(x, take['semitones'])
    if spec.get('fx'):
        x = A.fx(x, spec['fx'])
    y, lev = A.level(x)
    rel = os.path.join('clips', take['id'] + '.opus')
    sf.write(os.path.join(out, rel), y.astype(np.float32), A.SR, format='OGG', subtype='OPUS', compression_level=0.8)  # about 58 kbit/s: transparent for speech, keeps the gallery near 12 MB
    final = A.clean_measure(y)
    if spec.get('fallbackFor'):
        voice = dict(voice, fallbackFor=spec['fallbackFor'])
    return {'id': take['id'], 'section': take['section'], 'engine': e, 'mock': bool(mock), 'request': sha(req), 'textSent': text,
            'voice': voice, 'tries': tries, 'kept': tries[-1] if e != 'qwen_design' else next((t for t in tries if t.get('seed') == voice.get('seed')), None),
            'pitchSemitones': take.get('semitones', 0), 'fx': spec.get('fx'), 'level': lev, 'seconds': round(len(y) / A.SR, 2),
            'final': {'pre': r3(final['pre']), 'tail': r3(final['tail'])}, 'file': rel.replace('\\', '/'),
            'sha256': hashlib.sha256(open(os.path.join(out, rel), 'rb').read()).hexdigest(), 'at': time.strftime('%Y-%m-%dT%H:%M:%S')}


def r3(v):
    return None if v is None else round(float(v), 3)


# ---- commands -------------------------------------------------------------------------------------------------------
def cmd_voices(a):
    voices = jload(a.voices) if a.voices and os.path.exists(a.voices) else {}
    os.makedirs(a.out, exist_ok=True)
    for name, url in (('aivis', (voices.get('aivis') or {}).get('url', 'http://127.0.0.1:10101')), ('nemo', (voices.get('nemo') or {}).get('url', 'http://127.0.0.1:50121'))):
        e = VoicevoxFamily(url, name)
        try:
            sp = e.speakers()
            jsave(os.path.join(a.out, 'speakers_' + name + '.json'), {'url': url, 'version': e.version(), 'speakers': sp})
            print(name, url, 'version', e.version(), '—', len(sp), 'speakers:')
            for s in sp:
                print('  ', s.get('name'), [(st.get('name'), st.get('id')) for st in s.get('styles', [])])
        except Exception as ex:  # noqa: BLE001
            print(name, url, 'not reachable:', str(ex)[:120])
    problems = check_voices(voices) if voices else ['no va2_voices.json yet']
    print('va2_voices.json:', 'ready' if not problems else '; '.join(problems))


def check_voices(v):
    p = []
    nar = ((v.get('aivis') or {}).get('narrators') or {})
    for n in ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7']:
        x = nar.get(n)
        if not x or (x.get('styles') or {}).get('normal') is None:
            p.append('narrator ' + n + ' not chosen')
        elif not x.get('licence'):
            p.append('narrator ' + n + ': licence not recorded')
    models = [((nar.get(n) or {}).get('modelUuid') or (nar.get(n) or {}).get('modelName')) for n in nar]
    if len(set(models)) != len(models):
        p.append('the seven narrator candidates must be seven different models')
    for k in ['AV-girl', 'AV-teen', 'AV-bright', 'AV-sweet', 'AV-showy', 'AV-suzu-A', 'AV-suzu-B']:
        if not ((v.get('aivis') or {}).get('slots') or {}).get(k):
            p.append('aivis slot ' + k + ' not chosen')
    for k, snd in (v.get('sounds') or {}).items():
        if snd and snd.get('file') and not (snd.get('licence') and snd.get('url')):
            p.append('sound ' + k + ': licence or source not recorded')
    for k in ['NM-A', 'NM-B', 'NM-C']:
        if not ((v.get('nemo') or {}).get('slots') or {}).get(k):
            p.append('nemo slot ' + k + ' not chosen')
    return p


def cmd_render(a):
    plan = jload(a.plan)
    voices = jload(a.voices) if a.voices and os.path.exists(a.voices) else {}
    voices['_dir'] = os.path.dirname(os.path.abspath(a.voices)) if a.voices else '.'
    if not a.mock:
        prob = [x for x in check_voices(voices) if not (a.engines and all(e == 'qwen_design' for e in a.engines.split(',')))]
        if prob:
            sys.exit('va2_voices.json is not ready: ' + '; '.join(prob))
    os.makedirs(os.path.join(a.out, 'clips'), exist_ok=True)
    rpath = os.path.join(a.out, 'results.json')
    res = jload(rpath) if os.path.exists(rpath) else {'schemaVersion': 'rbn-va2-results-1', 'plan': plan['builtFrom'], 'takes': {}}
    only = set(a.only.split(',')) if a.only else {'player', 'companion', 'narrator', 'npc'}
    engines = set(a.engines.split(',')) if a.engines else {'qwen_design', 'aivis', 'nemo', 'sound'}
    ids = set(a.ids.split(',')) if a.ids else None
    eng = {'mock': Mock()}
    if not a.mock:
        eng['qwen'] = Qwen(voices.get('qwen') or {})
        eng['aivis'] = VoicevoxFamily((voices.get('aivis') or {}).get('url', 'http://127.0.0.1:10101'), 'aivis')
        eng['nemo'] = VoicevoxFamily((voices.get('nemo') or {}).get('url', 'http://127.0.0.1:50121'), 'nemo')
    takes = [t for s in ('player', 'companion', 'narrator', 'npc') if s in only and s in plan['sections'] for t in plan['sections'][s]['takes']]
    # one engine at a time (the heavy one last), so only one model is loaded at once
    order = {'sound': 0, 'aivis': 1, 'nemo': 2, 'qwen_design': 3}
    takes = sorted([t for t in takes if t['voiceSpec']['engine'] in engines and (ids is None or t['id'] in ids)], key=lambda t: order[t['voiceSpec']['engine']])
    cache, done, failed, t0 = {}, 0, [], time.time()
    for t in takes:
        if a.limit and done >= a.limit:
            break
        prev = res['takes'].get(t['id'])
        req = sha({'engine': t['voiceSpec']['engine'], 'text': plan['lines'][t['line']]['textNamesKana'], 'spec': t['voiceSpec'], 'pitch': t.get('semitones', 0)})
        if prev and prev.get('file') and prev.get('request') == req and os.path.exists(os.path.join(a.out, prev['file'])) and prev.get('mock') == bool(a.mock):
            continue
        spec = t['voiceSpec']
        unsourced = spec['engine'] == 'sound' and not ((voices.get('sounds') or {}).get(spec['sound']) or {}).get('file')
        if unsourced and (not a.mock or a.mock_unsourced):
            if not spec.get('fallback'):
                res['takes'][t['id']] = {'id': t['id'], 'section': t['section'], 'engine': 'sound', 'skipped': 'no verified CC0 or public-domain recording of ' + spec['sound'] + ' was found'}
                print('%-28s skipped: no sourced %s' % (t['id'], spec['sound']))
                continue
            # Robin: no proper recording → a female voice says it, playfully
            t = dict(t, voiceSpec=dict(spec['fallback'], fallbackFor=spec['sound']))
        try:
            res['takes'][t['id']] = make(t, plan, voices, eng, a.out, a.mock, cache)
            done += 1
            r = res['takes'][t['id']]
            f = r['final']
            print('%-28s %-11s %5.2fs  tries %d  %s' % (t['id'], r['engine'], r['seconds'], len(r['tries']), 'clean' if (f['pre'] or 0) <= A.MAX_PRE and (f['tail'] or 0) <= A.MAX_TAIL else 'FLAGGED after trim'))
        except Exception as ex:  # noqa: BLE001
            failed.append((t['id'], str(ex)[:200]))
            print('FAILED', t['id'], str(ex)[:200])
        if done % 10 == 0:
            jsave(rpath, res)
    res['engines'] = {'aivis': eng['aivis'].version() if 'aivis' in eng and not a.mock else None, 'nemo': eng['nemo'].version() if 'nemo' in eng and not a.mock else None,
                      'qwen': (voices.get('qwen') or {}).get('model'), 'mock': bool(a.mock)}
    res['voices'] = {k: v for k, v in voices.items() if k != '_dir'}
    res['lastRun'] = {'at': time.strftime('%Y-%m-%dT%H:%M:%S'), 'made': done, 'failed': failed, 'seconds': round(time.time() - t0, 1)}
    jsave(rpath, res)
    print('made', done, 'failed', len(failed), 'in', round(time.time() - t0), 's ->', rpath)
    if failed:
        sys.exit(1)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    v = sub.add_parser('voices')
    v.add_argument('--voices')
    v.add_argument('--out', required=True)
    r = sub.add_parser('render')
    r.add_argument('--plan', required=True)
    r.add_argument('--voices')
    r.add_argument('--out', required=True)
    r.add_argument('--only')
    r.add_argument('--engines')
    r.add_argument('--ids')
    r.add_argument('--limit', type=int, default=0)
    r.add_argument('--mock', action='store_true')
    r.add_argument('--mock-unsourced', action='store_true', help='self-test: treat the sourced sounds as not found')
    a = ap.parse_args()
    {'voices': cmd_voices, 'render': cmd_render}[a.cmd](a)


if __name__ == '__main__':
    main()
