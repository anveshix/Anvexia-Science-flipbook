#!/usr/bin/env python3
"""Restore the byte-exact 3D Notes research JSON, without overwriting edits."""
from pathlib import Path
import hashlib,lzma
root=Path(__file__).resolve().parent
archive=root/'3D_Notes__class-9.json.xz';dest=root/'3D_Notes__class-9.json';digest=(root/'3D_Notes__class-9.sha256').read_text().strip()
if dest.exists():
    print('Research file exists; not overwritten')
else:
    data=lzma.decompress(archive.read_bytes())
    if hashlib.sha256(data).hexdigest()!=digest:raise SystemExit('Research archive checksum mismatch')
    dest.write_bytes(data);print('Restored verified research JSON')
