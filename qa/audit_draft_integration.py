#!/usr/bin/env python3
"""Audit every runtime draft mapping, rollout row, label entry, and 2D asset.

Checks:
- All 266 rollout rows in ROLLOUT_STATUS.csv across all 33 chapters
- Exact chapter-qualified section keys & supplemental image order vs EVRASTER
- All 274 regular local JPEGs in assets/2d/<chapter>/*.jpg (1408x768 verified)
- Exact 274-key / 516-hotspot parity with src/label_data.json
- Optional eduverse-publish.zip and local HTTP (:8080) byte-for-byte parity
"""
from pathlib import Path
import csv
import hashlib
import json
import struct
import urllib.error
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parent.parent
BASE = ROOT if (ROOT / "ROLLOUT_STATUS.csv").exists() else (ROOT.parent / "eduverse_2d_assets")
TOPIC_AUDIT = (ROOT / "eduverse_topic_audit") if (ROOT / "eduverse_topic_audit").exists() else (ROOT.parent / "eduverse_topic_audit")


def jpeg_dimensions(data: bytes) -> tuple[int, int]:
    assert data[:2] == b"\xff\xd8", "Not a valid JPEG SOI"
    i = 2
    n = len(data)
    while i < n:
        while i < n and data[i] == 0xFF:
            i += 1
        if i >= n:
            break
        marker = data[i]
        i += 1
        if marker in (0xD8, 0xD9) or (0xD0 <= marker <= 0xD7):
            continue
        length = struct.unpack(">H", data[i : i + 2])[0]
        if marker in (0xC0, 0xC1, 0xC2):
            h, w = struct.unpack(">HH", data[i + 3 : i + 7])
            return w, h
        i += length
    raise AssertionError("No SOF marker found in JPEG")


js = (ROOT / "src/app.js").read_text(encoding="utf-8")
raw = js.split("const EVRASTER = (() => {", 1)[1].split("  const assets = ", 1)[1].split("\n};", 1)[0] + "\n}"
assets = json.loads(raw)

label_data = json.loads((ROOT / "src/label_data.json").read_text(encoding="utf-8"))
assert len(label_data) == 274, f"Expected 274 label_data keys, got {len(label_data)}"
assert sum(len(v) for v in label_data.values()) == 516, "Expected 516 hotspots in label_data.json"

with (BASE / "ROLLOUT_STATUS.csv").open(encoding="utf-8-sig", newline="") as f:
    rows = list(csv.DictReader(f))
assert len({(r["chapter_id"], r["section"]) for r in rows}) == len(rows) == 266

status = {(r["chapter_id"], r["section"]): r for r in rows if r["asset_generation_status"] == "AI_DRAFT_REVIEW_PENDING"}
keys = {(chapter, section) for chapter, group in assets.items() for section in group}
assert len(assets) == 33, f"Expected 33 chapters in EVRASTER, got {len(assets)}"
assert keys == set(status), (sorted(keys - set(status)), sorted(set(status) - keys))

refs = []
short_keys = []
for chapter, section in sorted(keys):
    row = status[chapter, section]
    assert row["integrated_in_main_app"] == "DRAFT_ONLY"
    assert row["toggle_2d_currently_enabled"] == "True"
    paths = [chapter + "/" + name for name in assets[chapter][section]]
    assert paths == row["asset_file"].split("; "), (chapter, section, paths, row["asset_file"])
    for path in paths:
        f = ROOT / "assets/2d" / path
        assert f.is_file() and not f.is_symlink(), str(f)
        w, h = jpeg_dimensions(f.read_bytes())
        assert (w, h) == (1408, 768), f"{path}: expected 1408x768, got {w}x{h}"
        refs.append("assets/2d/" + path)
        short_keys.append(path)

assert len(refs) == len(set(refs)) == 274
assert set(short_keys) == set(label_data.keys()), "Mismatch between EVRASTER assets and label_data.json"

zpath = ROOT / "eduverse-publish.zip"
if zpath.exists():
    with zipfile.ZipFile(zpath) as z:
        assert z.testzip() is None
        assert set(refs) == {n for n in z.namelist() if n.startswith("assets/2d/") and n.endswith(".jpg")}
        assert z.read("index.html") == (ROOT / "index.html").read_bytes()
        if (ROOT / "publish/index.html").exists():
            assert z.read("index.html") == (ROOT / "publish/index.html").read_bytes()
        assert z.read("review/ROLLOUT_STATUS.csv") == (BASE / "ROLLOUT_STATUS.csv").read_bytes()
        assert z.read("review/CONCEPT_TRACKER_FIRST_PASS.csv") == (TOPIC_AUDIT / "CONCEPT_TRACKER_FIRST_PASS.csv").read_bytes()
        for ref in refs:
            assert z.read(ref) == (ROOT / ref).read_bytes(), ref

http_checked = False
try:
    root_bytes = urllib.request.urlopen("http://127.0.0.1:8080/", timeout=3).read()
    assert root_bytes == (ROOT / "index.html").read_bytes()
    for ref in refs:
        assert urllib.request.urlopen("http://127.0.0.1:8080/" + ref, timeout=5).read() == (ROOT / ref).read_bytes(), ref
    http_checked = True
except (urllib.error.URLError, TimeoutError):
    pass

print(
    f"PASS: {len(keys)} mapped spreads in {len(assets)} chapters; "
    f"{len(refs)} 1408x768 JPEGs; 516 bilingual hotspots; "
    f"ZIP={'verified' if zpath.exists() else 'skipped'}; "
    f"HTTP(:8080)={'verified' if http_checked else 'skipped'}."
)
print("Index SHA-256:", hashlib.sha256((ROOT / "index.html").read_bytes()).hexdigest())
if zpath.exists():
    print("ZIP SHA-256:  ", hashlib.sha256(zpath.read_bytes()).hexdigest())
