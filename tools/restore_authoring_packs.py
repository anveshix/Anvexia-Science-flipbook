#!/usr/bin/env python3
"""Ensure EVPACK v2 chapter packs are present before bundling (never overwrites)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def restore():
    idx = ROOT / "authoring" / "packs" / "index.json"
    if not idx.exists():
        raise SystemExit(f"Missing {idx}")
    data = json.loads(idx.read_text(encoding="utf-8"))
    for row in data.get("catalogue", []):
        p = ROOT / "authoring" / "packs" / f"{row['id']}.json"
        if not p.exists():
            raise SystemExit(f"Missing chapter pack {p}")


if __name__ == "__main__":
    restore()
