#!/usr/bin/env python3
"""Restore exact original .tar.gz rollback checkpoints from the deduplicated pack.

Run with no arguments to restore all, or give checkpoint filenames to select a
subset. Existing files are never overwritten. The underlying uncompressed tar
streams are retained losslessly, and the gzip result is hash-checked before use.
"""
from pathlib import Path
import hashlib, json, subprocess, sys, tarfile
ROOT = Path(__file__).resolve().parent

def sha(b): return hashlib.sha256(b).hexdigest()
def restore(names=None):
    manifest=json.loads((ROOT/'checkpoint-pack-manifest.json').read_text())
    names=list(manifest) if not names else names
    with tarfile.open(ROOT/'checkpoint-tar-streams.tar.xz','r:xz') as pack:
        for name in names:
            if name not in manifest or Path(name).name != name:
                raise ValueError('Unknown or unsafe checkpoint: '+name)
            dest=ROOT/name
            if dest.exists():
                if sha(dest.read_bytes()) != manifest[name]['gzip_sha256']:
                    raise ValueError('Existing checkpoint differs; not overwriting: '+name)
                continue
            raw=pack.extractfile('./'+name[:-3]).read()
            if sha(raw)!=manifest[name]['tar_sha256']:
                raise ValueError('Tar-stream digest mismatch: '+name)
            gz=subprocess.run(['gzip','-6n'],input=raw,stdout=subprocess.PIPE,check=True).stdout
            if sha(gz)!=manifest[name]['gzip_sha256']:
                raise ValueError('Gzip bytes differ; raw tar remains intact in pack: '+name)
            dest.write_bytes(gz)
            print('Restored',name)

if __name__=='__main__': restore(sys.argv[1:] or None)
