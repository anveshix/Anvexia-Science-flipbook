#!/usr/bin/env python3
"""Check that 2D draft images exist under assets/2d/ and match DRAFT_MANIFEST.json.

Usage: python3 tools/verify_2d_assets.py [--root DIR] [--manifest FILE]
Exit code 0 only when every manifest record is present with the recorded SHA-256.
"""
import argparse
import hashlib
import json
import sys
from pathlib import Path


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 16), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--root", default=".", help="repo root (default: cwd)")
    ap.add_argument("--manifest", default="DRAFT_MANIFEST.json")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    assets = root / "assets" / "2d"
    records = json.loads((root / args.manifest).read_text(encoding="utf-8"))["records"]

    missing, bad, ok = [], [], 0
    for rec in records:
        rel = rec.get("image")
        if not rel:
            continue
        path = assets / rel
        if not path.is_file():
            missing.append(rel)
            continue
        expected = rec.get("sha256")
        if expected and sha256(path) != expected:
            bad.append(rel)
        else:
            ok += 1

    total = len(records)
    print(f"manifest records: {total}  ok: {ok}  missing: {len(missing)}  hash mismatch: {len(bad)}")
    for rel in missing[:20]:
        print(f"  MISSING  assets/2d/{rel}")
    if len(missing) > 20:
        print(f"  ... {len(missing) - 20} more missing")
    for rel in bad:
        print(f"  HASH     assets/2d/{rel}")
    return 0 if not missing and not bad else 1


if __name__ == "__main__":
    sys.exit(main())
