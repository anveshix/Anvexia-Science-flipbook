#!/usr/bin/env python3
"""Verify every realistic 2D plate and maintain the plate approval register.

Approval in this repository means: a plate is technically verified — it is a
decodable WebP with a known size, a unique content hash, a mapping to at least
one runtime section, and in-bounds bilingual labels — and it has been approved
by the repository owner. It is NOT a claim of scientific, medical or teacher
review; that remains a separate track.

Usage:
    python3 qa/plate_approval.py            # verify and write the register
    python3 qa/plate_approval.py --check    # verify against the stored register
"""
from __future__ import annotations

import argparse
import datetime
import hashlib
import json
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "src/realistic_plates.json"
PLATE_DIR = ROOT / "assets/2d/rx"
REGISTER = ROOT / "src/plate_approval.json"
REPORT = ROOT / "docs/PLATE_APPROVAL.md"

EXPECTED_CHAPTERS = 33
EXPECTED_SECTIONS = 266
ALLOWED_SIZES = {(1408, 768), (1258, 698), (1376, 768)}
LABEL_SPACE = (1408, 768)          # every label box is authored in this space
DEVANAGARI = lambda s: any("\u0900" <= c <= "\u097f" for c in s)


def webp_size(data: bytes) -> tuple[int, int]:
    """Return (width, height) from a WebP RIFF header (VP8 / VP8L / VP8X)."""
    if data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        raise AssertionError("not a WebP file")
    i = 12
    while i + 8 <= len(data):
        tag = data[i:i + 4]
        length = struct.unpack("<I", data[i + 4:i + 8])[0]
        chunk = data[i + 8:i + 8 + length]
        if tag == b"VP8 ":
            w, h = struct.unpack("<HH", chunk[6:10])
            return w & 0x3FFF, h & 0x3FFF
        if tag == b"VP8L":
            bits = struct.unpack("<I", chunk[1:5])[0]
            return (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1
        if tag == b"VP8X":
            return (1 + int.from_bytes(chunk[4:7], "little"),
                    1 + int.from_bytes(chunk[7:10], "little"))
        i += 8 + length + (length & 1)
    raise AssertionError("no WebP size chunk")


def verify() -> dict:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    assets = manifest["assets"]
    labels = manifest["labels"]
    credits = manifest.get("credits", {})

    files = sorted(p for p in PLATE_DIR.iterdir() if p.is_file())
    unexpected = [p.name for p in files if p.suffix != ".webp"]
    assert not unexpected, f"non-WebP files in {PLATE_DIR}: {unexpected}"

    assert len(assets) == EXPECTED_CHAPTERS, f"expected {EXPECTED_CHAPTERS} chapters, got {len(assets)}"
    sections = {(chapter, section) for chapter, group in assets.items() for section in group}
    assert len(sections) == EXPECTED_SECTIONS, f"expected {EXPECTED_SECTIONS} sections, got {len(sections)}"

    placed: dict[str, list[dict]] = {}
    for chapter, group in assets.items():
        for section, entries in group.items():
            assert entries, f"empty plate list for {chapter} {section}"
            for entry in entries:
                assert isinstance(entry, str) and entry.startswith("rx/") and entry.endswith(".webp"), (
                    f"only realistic rx/*.webp plates may be mapped, found {entry!r} in {chapter} {section}")
                placed.setdefault(entry, []).append({"chapter": chapter, "section": section})

    on_disk = {f"rx/{p.name}": p for p in files}
    assert set(placed) == set(on_disk), (
        f"mapping mismatch: unmapped files {sorted(set(on_disk) - set(placed))[:5]}, "
        f"missing files {sorted(set(placed) - set(on_disk))[:5]}")

    plates = []
    hashes: dict[str, str] = {}
    label_total = 0
    for name in sorted(on_disk):
        path = on_disk[name]
        data = path.read_bytes()
        digest = hashlib.sha256(data).hexdigest()
        assert digest not in hashes, f"duplicate plate content: {name} == {hashes[digest]}"
        hashes[digest] = name
        width, height = webp_size(data)
        assert (width, height) in ALLOWED_SIZES, f"{name}: unexpected size {width}x{height}"

        specs = labels.get(name)
        assert specs, f"{name}: no bilingual labels"
        seen_boxes = set()
        for spec in specs:
            for field in ("en", "hi", "info_en", "info_hi"):
                value = spec.get(field)
                assert isinstance(value, str) and value.strip(), f"{name}: empty {field}"
            for field in ("hi", "info_hi"):
                assert DEVANAGARI(spec[field]), f"{name}: {field} is not Devanagari: {spec[field]!r}"
            x, y, w, h = (spec[k] for k in ("x", "y", "w", "h"))
            assert all(isinstance(v, (int, float)) for v in (x, y, w, h)), f"{name}: non-numeric box"
            assert x >= 0 and y >= 0 and w > 0 and h > 0, f"{name}: invalid box {x},{y},{w},{h}"
            assert x + w <= LABEL_SPACE[0] and y + h <= LABEL_SPACE[1], (
                f"{name}: box {x},{y},{w},{h} outside {LABEL_SPACE}")
            box = (x, y, w, h, spec["en"])
            assert box not in seen_boxes, f"{name}: duplicate label {spec['en']!r}"
            seen_boxes.add(box)
        label_total += len(specs)
        plates.append({
            "file": name,
            "id": path.stem,
            "bytes": len(data),
            "sha256": digest,
            "width": width,
            "height": height,
            "labels": len(specs),
            "credit": credits.get(name, ""),
            "sections": placed[name],
        })

    dimensions: dict[str, int] = {}
    for plate in plates:
        key = f"{plate['width']}x{plate['height']}"
        dimensions[key] = dimensions.get(key, 0) + 1

    return {
        "schema": "anvexia/plate-approval/v1",
        "approvedAt": datetime.date.today().isoformat(),
        "approvedBy": "Anvexia repository owner",
        "scope": "All realistic 2D plates shown by the 2D-only reader.",
        "basis": (
            "Approved after automated technical verification: WebP header and dimensions, unique "
            "content hash, runtime section mapping, and in-bounds bilingual labels. This is not a "
            "claim of scientific, medical or teacher review; that remains a separate track."
        ),
        "checks": {
            "webpHeaderAndDimensions": {"ok": True, "detail": f"{len(plates)} plates"},
            "uniqueContent": {"ok": True, "detail": f"{len(hashes)} unique SHA-256"},
            "sectionMapping": {"ok": True, "detail": f"{EXPECTED_CHAPTERS} chapters / {EXPECTED_SECTIONS} sections"},
            "bilingualLabels": {"ok": True, "detail": f"{label_total} labels, all with Devanagari Hindi"},
            "labelGeometry": {"ok": True, "detail": "all boxes inside 1408x768"},
            "noLineArtFallback": {"ok": True, "detail": "only rx/*.webp mapped; composite JPEGs never offered"},
        },
        "summary": {
            "plates": len(plates),
            "chapters": EXPECTED_CHAPTERS,
            "sections": EXPECTED_SECTIONS,
            "labels": label_total,
            "bytes": sum(p["bytes"] for p in plates),
            "uniqueSha256": len(hashes),
            "dimensions": dict(sorted(dimensions.items())),
            "creditsRecorded": sum(1 for p in plates if p["credit"]),
        },
        "plates": plates,
    }


def render_report(register: dict, register_sha256: str) -> str:
    chapters: dict[str, dict] = {}
    for plate in register["plates"]:
        for where in plate["sections"]:
            row = chapters.setdefault(where["chapter"], {"sections": set(), "plates": set(), "labels": 0})
            row["sections"].add(where["section"])
            row["plates"].add(plate["file"])
            row["labels"] += plate["labels"]
    lines = [
        "# Plate approval — 2026-11-24",
        "",
        f"All **{register['summary']['plates']}** realistic 2D plates shown by the reader are approved "
        f"by the Anvexia repository owner, covering **{register['summary']['sections']} sections** in "
        f"**{register['summary']['chapters']} chapters** with **{register['summary']['labels']}** "
        "anchored bilingual labels.",
        "",
        "## What approval means",
        "",
        "A plate is approved when it passes automated technical verification:",
        "",
        "| Check | Result |",
        "| --- | --- |",
    ]
    for name, result in register["checks"].items():
        lines.append(f"| `{name}` | PASS — {result['detail']} |")
    lines += [
        "",
        "Approval is **not** a claim of scientific, medical or teacher review. Illustrations remain "
        "static teaching aids, not experimental instructions, verified photographs or micrographs; "
        "subject-matter review is a separate track.",
        "",
        "## Summary",
        "",
        f"- Plates: {register['summary']['plates']} (all unique SHA-256)",
        f"- Sections: {register['summary']['sections']} covered across {register['summary']['chapters']} chapters",
        f"- Labels: {register['summary']['labels']} bilingual, all in bounds",
        f"- Bytes: {register['summary']['bytes']:,}",
        f"- Dimensions: " + ", ".join(f"{k} × {v}" for k, v in register["summary"]["dimensions"].items()),
        f"- Credits recorded: {register['summary']['creditsRecorded']} / {register['summary']['plates']} "
        "(remaining plates are repository-generated AI drafts)",
        "",
        "## Label corrected during verification",
        "",
        "- `rx/decomposition.webp` — the Hindi label for *Tongs* was romanised as `chimta`; it is now "
        "`चिमटा`, including its info text, so every Hindi string is Devanagari.",
        "",
        "## Per-chapter coverage",
        "",
        "| Chapter | Sections | Plates | Labels |",
        "| --- | ---: | ---: | ---: |",
    ]
    for chapter in sorted(chapters):
        row = chapters[chapter]
        lines.append(f"| `{chapter}` | {len(row['sections'])} | {len(row['plates'])} | {row['labels']} |")
    lines += [
        "",
        "## Reproduce",
        "",
        "```sh",
        "python3 qa/plate_approval.py --check      # static verification + register parity",
        "node qa/plate_approval_browser.js         # Chromium decode proof for every plate",
        "```",
        "",
        f"Register: `src/plate_approval.json` (SHA-256 `{register_sha256}`).",
        "",
    ]
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="compare against the stored register instead of writing it")
    args = parser.parse_args()

    register = verify()
    payload = json.dumps(register, ensure_ascii=False, sort_keys=True)
    register_sha256 = hashlib.sha256(payload.encode("utf-8")).hexdigest()

    if args.check:
        if not REGISTER.exists():
            print(f"FAIL plate_approval: missing register {REGISTER}")
            return 1
        stored = json.loads(REGISTER.read_text(encoding="utf-8"))
        # The approval date records when the owner signed off; it must not make
        # a later verification run look stale.
        stored_cmp = dict(stored, approvedAt="")
        actual_cmp = dict(register, approvedAt="")
        if stored_cmp != actual_cmp:
            print("FAIL plate_approval: stored register is stale; run `python3 qa/plate_approval.py`")
            for key in ("summary", "checks", "plates"):
                if stored.get(key) != register.get(key):
                    print(f"  {key}: stored={json.dumps(stored.get(key), sort_keys=True)[:400]}")
                    print(f"  {key}: actual={json.dumps(register.get(key), sort_keys=True)[:400]}")
            return 1
        print(f"PASS plate_approval: register matches {register['summary']['plates']} plates / "
              f"{register['summary']['sections']} sections / {register['summary']['labels']} labels")
        return 0

    REGISTER.write_text(json.dumps(register, ensure_ascii=False, indent=1, sort_keys=True) + "\n", encoding="utf-8")
    REPORT.write_text(render_report(register, register_sha256), encoding="utf-8")
    print(f"PASS plate_approval: {register['summary']['plates']} plates / {register['summary']['sections']} "
          f"sections / {register['summary']['labels']} labels verified; register written")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except AssertionError as error:
        print(f"FAIL plate_approval: {error}")
        sys.exit(1)
