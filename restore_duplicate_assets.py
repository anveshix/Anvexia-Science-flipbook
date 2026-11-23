#!/usr/bin/env python3
"""Optional legacy compatibility: recreate byte-identical former image paths."""
from pathlib import Path
import hashlib, json, shutil
root=Path(__file__).resolve().parent
entries=json.loads((root/'ASSET_DEDUP_MANIFEST.json').read_text())['records']
assets_root = root/'assets'/'2d' if (root/'assets'/'2d').exists() else root.parent/'metaworld'/'assets'/'2d'
for r in entries:
 src=assets_root/r['runtime'];dst=root/r['old']
 if not src.exists() or hashlib.sha256(src.read_bytes()).hexdigest()!=r['sha256']:
  raise SystemExit(f'Runtime asset missing or changed; not restoring: {src}')
 if dst.exists():
  if hashlib.sha256(dst.read_bytes()).hexdigest()!=r['sha256']:raise SystemExit(f'Will not overwrite changed file: {dst}')
 else:
  dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst)
print('Restored',len(entries),'byte-identical duplicates')
