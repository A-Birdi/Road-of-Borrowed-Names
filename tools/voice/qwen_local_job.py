#!/usr/bin/env python3
"""VA-1: the Qwen3-TTS audition job, for a machine that can hold the model (the cloud environment cannot: 5 GB free,
weight hosts refused, no GPU). It runs the takes that tools/voice/audition.mjs exported, with the same take ids,
requests and output layout, and records what it made; `audition.mjs ingest` then runs the same technical check and
writes the same result records as for every other configuration.

    node tools/voice/audition.mjs export-job --config qwen --kind smoke      # then screen, then matrix
    python tools/voice/qwen_local_job.py voice-audition/VA1/<revision>/jobs/qwen.smoke.json
    node tools/voice/audition.mjs ingest --config qwen --kind smoke

Requirements (official README, github.com/QwenLM/Qwen3-TTS): `pip install -U qwen-tts` in a fresh Python 3.12
environment; the model Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice (and its tokenizer) from Hugging Face or ModelScope,
downloaded automatically or beforehand with `huggingface-cli download …`. A CUDA GPU is recommended; CPU works but is
slow. Only the 1.7B CustomVoice model has instruction control; the job refuses any other model rather than quietly
substituting one (a VoiceDesign subtrial is a separate, labelled configuration).

Only the take's `text` is spoken. Its direction goes in `instruct` (empty for a neutral control); nothing else from
the corpus (context, English, speaker id) is passed to the model.
"""
import argparse
import hashlib
import json
import os
import sys
import time

REQUIRED_MODEL = "Qwen3-TTS-12Hz-1.7B-CustomVoice"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("job", help="the job file written by `audition.mjs export-job`")
    ap.add_argument("--model", default="Qwen/" + REQUIRED_MODEL, help="model id or a local directory holding it")
    ap.add_argument("--device", default=None, help="cuda:0, cpu … (default: cuda:0 when available, else cpu)")
    ap.add_argument("--limit", type=int, default=0, help="stop after this many new takes (0: all)")
    a = ap.parse_args()

    if REQUIRED_MODEL not in a.model.replace("\\", "/"):
        sys.exit("refused: the Qwen configuration is " + REQUIRED_MODEL + " (instruction control); " + a.model + " would be a different model")
    with open(a.job, encoding="utf-8") as f:
        job = json.load(f)
    if job.get("schemaVersion") != "rbn-voice-job-1" or job.get("configurationId") != "qwen":
        sys.exit("refused: not a Qwen audition job")
    root = os.path.dirname(os.path.dirname(os.path.abspath(a.job)))  # voice-audition/VA1/<revision>
    done_path = os.path.join(root, "jobs", "qwen." + job["kind"] + ".done.jsonl")
    done = set()
    if os.path.exists(done_path):
        with open(done_path, encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    d = json.loads(line)
                    done.add((d["takeId"], d["requestSha256"]))

    import torch
    import soundfile as sf
    from qwen_tts import Qwen3TTSModel

    device = a.device or ("cuda:0" if torch.cuda.is_available() else "cpu")
    dtype = torch.bfloat16 if device.startswith("cuda") else torch.float32
    model = Qwen3TTSModel.from_pretrained(a.model, device_map=device, dtype=dtype)
    speakers = {s.lower() for s in model.get_supported_speakers()}
    revision = os.path.basename(os.path.normpath(a.model))
    print("model", a.model, "on", device, "| speakers:", ", ".join(sorted(speakers)))

    made = 0
    for t in job["takes"]:
        if (t["takeId"], t["requestSha256"]) in done:
            continue
        r = t["request"]
        if hashlib.sha256(r["text"].encode("utf-8")).hexdigest() != t["spokenTextSha256"]:
            sys.exit("refused: the text of " + t["takeId"] + " does not match its corpus hash")
        if r["speaker"].lower() not in speakers:
            print(t["takeId"], "skipped: speaker", r["speaker"], "is not in this model")
            continue
        kw = {"text": r["text"], "language": r["language"], "speaker": r["speaker"]}
        if r.get("instruct"):
            kw["instruct"] = r["instruct"]
        t0 = time.time()
        wavs, sr = model.generate_custom_voice(**kw)
        out = os.path.join(root, t["out"])
        os.makedirs(os.path.dirname(out), exist_ok=True)
        sf.write(out, wavs[0], sr, subtype="PCM_16")
        rec = {"takeId": t["takeId"], "requestSha256": t["requestSha256"], "out": t["out"], "seconds": round(time.time() - t0, 2), "modelRevision": revision, "device": device}
        with open(done_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
        print(t["takeId"], "written", rec["seconds"], "s")
        made += 1
        if a.limit and made >= a.limit:
            break
    print("done:", made, "new takes; next: node tools/voice/audition.mjs ingest --config qwen --kind", job["kind"])


if __name__ == "__main__":
    main()
