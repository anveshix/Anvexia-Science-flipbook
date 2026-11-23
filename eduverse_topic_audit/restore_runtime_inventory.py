#!/usr/bin/env python3
"""Restore the verified historical runtime inventory if missing; never overwrite."""
from pathlib import Path
import hashlib,lzma
R=Path(__file__).resolve().parent

def restore():
    dest=R/'runtime_inventory.json'
    if dest.exists():return
    data=lzma.decompress((R/'runtime_inventory.json.xz').read_bytes())
    expected=(R/'runtime_inventory.sha256').read_text().strip()
    if hashlib.sha256(data).hexdigest()!=expected:raise ValueError('Runtime inventory digest mismatch')
    dest.write_bytes(data)
    print('Restored historical runtime inventory')
if __name__=='__main__':restore()
