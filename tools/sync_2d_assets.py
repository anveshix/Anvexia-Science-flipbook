#!/usr/bin/env python3
"""Promote or verify canonical 2D JPEGs in the persistent main-app asset store.

In the unified Sci-flip repository root, `assets/2d/<chapter>/*.jpg` is
authoritative (274 JPEGs across 33 chapters, reproducible via
`node tools/build_2d_plates.mjs`). If an optional sibling `../eduverse_2d_assets`
staging directory exists, newer files there are synced into `assets/2d/`.
"""
from pathlib import Path
import hashlib
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[1]
CANON = ROOT.parent / "eduverse_2d_assets"

CHAPTER_PREFIXES = [
    ("c9_pure", "1-"),
    ("c9_atoms", "1-"),
    ("c9_disease", "1-"),
    ("c10_magnetism", "12-"),
    ("c10_electricity", "11-"),
    ("c10_eye", "10-"),
    ("c10_light", "9-"),
    ("c10_periodic", "P-"),
    ("c10_carbon", "4-"),
    ("c10_repro", "7-"),
    ("c9_matter", "1-"),
    ("c9_exploration", "1-"),
    ("c9_cell", "2-"),
    ("c9_tissues", "3-"),
    ("c9_motion", "4-"),
    ("c9_mixtures", "5-"),
    ("c9_forces", "6-"),
    ("c9_work_energy", "7-"),
    ("c9_atom", "8-"),
    ("c9_atomic_foundations", "9-"),
    ("c9_sound", "10-"),
    ("c9_reproduction9", "11-"),
    ("c9_diversity", "12-"),
    ("c9_earth", "13-"),
    ("c10_reactions", "1-"),
    ("c10_acids", "2-"),
    ("c10_metals", "3-"),
    ("c10_life", "5-"),
    ("c10_control", "6-"),
    ("c10_sources", "S-"),
    ("c10_sustainable", "M-"),
    ("c10_heredity", "8-"),
    ("c10_env", "13-"),
]

missing_chapters = [
    ch for ch, prefix in CHAPTER_PREFIXES
    if not list((ROOT / "assets" / "2d" / ch).glob(prefix + "*.jpg"))
    and not list((CANON / ch).glob(prefix + "*.jpg"))
]
if missing_chapters and (ROOT / "tools" / "build_2d_plates.mjs").exists():
    subprocess.run(["node", str(ROOT / "tools" / "build_2d_plates.mjs")], cwd=ROOT, check=True)

for chapter, prefix in CHAPTER_PREFIXES:
    srcdir = CANON / chapter
    destdir = ROOT / "assets" / "2d" / chapter
    destdir.mkdir(parents=True, exist_ok=True)
    srcs = list(srcdir.glob(prefix + "*.jpg")) if srcdir.exists() else []
    if not srcs and not list(destdir.glob(prefix + "*.jpg")):
        raise SystemExit(f"Missing runtime and newly rendered images for {chapter}")
    for src in srcs:
        dest = destdir / src.name
        if dest.exists() and hashlib.sha256(src.read_bytes()).digest() == hashlib.sha256(dest.read_bytes()).digest():
            continue
        shutil.copyfile(src, dest)
        print("synced", dest.relative_to(ROOT))
