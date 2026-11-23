#!/usr/bin/env python3
"""Audit assets/2d plates: realistic originals (hash in DRAFT_MANIFEST.json)
vs procedurally generated placeholders. Exit 1 with --strict if any
manifest plate is a placeholder or missing.

Restore originals by copying the reviewed JPEGs into assets/2d/<chapter>/<file>
(same names as DRAFT_MANIFEST.json "image"), then rerun this script.
"""
import hashlib, json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
man = json.loads((ROOT / "DRAFT_MANIFEST.json").read_text(encoding="utf-8"))["records"]
real, placeholder, missing = [], [], []
for r in man:
    f = ROOT / "assets/2d" / r["image"]
    if not f.exists():
        missing.append(r["image"]); continue
    (real if hashlib.sha256(f.read_bytes()).hexdigest() == r["sha256"] else placeholder).append(r["image"])
print(f"manifest plates {len(man)} · realistic originals {len(real)} · generated placeholders {len(placeholder)} · missing {len(missing)}")
by = {}
for i in placeholder + missing:
    by.setdefault(i.split("/")[0], []).append(i.split("/")[1])
for ch in sorted(by):
    print(f"  {ch:24s} {len(by[ch]):3d} need original")
if "--strict" in sys.argv and (placeholder or missing):
    sys.exit(1)
