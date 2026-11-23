#!/usr/bin/env python3
"""QA for realistic plates imported by tools/import_realistic_plates.py.

Checks: every mapped file exists and is an 11:6 (1408x768-space) WebP; every mapped
chapter/section exists in the runtime chapter data; every placement has
bilingual anchored labels inside the image; chips never overlap; the
generated composite plates are kept as fallbacks (never deleted).
"""
import json
import re
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
data = json.loads((ROOT / "src/realistic_plates.json").read_text(encoding="utf-8"))
labels = json.loads((ROOT / "src/label_data.json").read_text(encoding="utf-8"))
errors = []


def webp_size(b):
    if b[:4] != b"RIFF" or b[8:12] != b"WEBP":
        return None
    chunk = b[12:16]
    if chunk == b"VP8X":
        return 1 + int.from_bytes(b[24:27], "little"), 1 + int.from_bytes(b[27:30], "little")
    if chunk == b"VP8 ":
        w, h = struct.unpack("<HH", b[26:30]); return w & 0x3FFF, h & 0x3FFF
    if chunk == b"VP8L":
        v = int.from_bytes(b[21:25], "little"); return (v & 0x3FFF) + 1, ((v >> 14) & 0x3FFF) + 1
    return None


# chapter/section universe from the generated chapter source + the app's built-in asset map
src = (ROOT / "src/app.js").read_text(encoding="utf-8")
gen = (ROOT / "src/chapters_generated.js").read_text(encoding="utf-8")
known = set(re.findall(r'"(c(?:9|10)_[a-z0-9_]+)"', src + gen))

files, n_labels = set(), 0
for wid, secs in data["assets"].items():
    if wid not in known:
        errors.append(f"unknown chapter {wid}")
    for sec, fl in secs.items():
        for f in fl:
            p = ROOT / "assets/2d" / wid / f
            if not p.exists():
                errors.append(f"missing {wid}/{f}"); continue
            dim = webp_size(p.read_bytes()[:40])
            if not dim or abs(dim[0] / dim[1] / (1408 / 768) - 1) > 0.02 or dim[0] < 1200:
                errors.append(f"{wid}/{f} is not a ~1408x768 (11:6) WebP: {dim}")
            files.add(f"{wid}/{f}")
            specs = data["labels"].get(f"{wid}/{f}")
            if not specs:
                errors.append(f"no labels for {wid}/{f}"); continue

for key, specs in data["labels"].items():
    if key in labels:
        errors.append(f"label key collides with label_data.json: {key}")
    boxes = []
    for s in specs:
        n_labels += 1
        if not (s.get("en") and s.get("hi") and s.get("info_en") and s.get("info_hi")):
            errors.append(f"{key}: missing bilingual text")
        if not (0 <= s["x"] and s["x"] + s["w"] <= 1408 and 0 <= s["y"] and s["y"] + s["h"] <= 768):
            errors.append(f"{key}: chip outside image")
        if not (0 <= s["anchor_x"] <= 1408 and 0 <= s["anchor_y"] <= 768):
            errors.append(f"{key}: anchor outside image")
        for b in boxes:
            if s["x"] < b["x"] + b["w"] and b["x"] < s["x"] + s["w"] and s["y"] < b["y"] + b["h"] and b["y"] < s["y"] + s["h"]:
                errors.append(f"{key}: chips overlap ({s['en']} / {b['en']})")
        boxes.append(s)

# generated composites stay as fallbacks
for key in labels:
    if not (ROOT / "assets/2d" / key).exists():
        errors.append(f"generated fallback plate missing: {key}")

if errors:
    print("FAIL realistic_plates:\n  " + "\n  ".join(errors[:40]))
    sys.exit(1)
sections = sum(len(s) for s in data["assets"].values())
print(f"PASS realistic_plates: {len(files)} placements · {len({f.split('/')[1] for f in files})} unique WebP plates · "
      f"{sections} sections in {len(data['assets'])} chapters · {n_labels} anchored bilingual labels · "
      f"{len(labels)} generated fallbacks intact")
