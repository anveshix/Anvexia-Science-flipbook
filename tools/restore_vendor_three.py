#!/usr/bin/env python3
"""Ensure vendored Three.js r187 is present before bundling (never overwrites)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def restore():
    target = ROOT / "vendor" / "three.min.js"
    if not target.exists():
        raise SystemExit(f"Missing {target}")


if __name__ == "__main__":
    restore()
