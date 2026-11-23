#!/usr/bin/env python3
"""Ensure generated chapter source is present before bundling (never overwrites)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def restore():
    target = ROOT / "src" / "chapters_generated.js"
    if target.exists():
        return
    raise SystemExit(f"Missing {target}; run python3 tools/build_chapters.py first")


if __name__ == "__main__":
    restore()
