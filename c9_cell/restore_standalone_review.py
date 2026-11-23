#!/usr/bin/env python3
"""Restore the original self-contained Cell review byte-for-byte when requested.

The default linked review saves space using identical main-app JPEGs. Rebuilding the
standalone version requires those authoritative JPEGs and checks both their hashes
and the original HTML hash before writing. This never changes the app or images.
"""
from pathlib import Path
import base64, hashlib, json, re
HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
manifest = json.loads((HERE/'CELL_REVIEW_DEDUP.json').read_text())
page = (HERE/'REVIEW.html').read_text()
assets = ROOT/'metaworld/assets/2d/c9_cell'

def replace(match):
    name = match.group(1)
    data = (assets/name).read_bytes()
    if hashlib.sha256(data).hexdigest() != manifest['assets'][name]:
        raise ValueError('Asset checksum mismatch: '+name)
    return 'data:image/jpeg;base64,'+base64.b64encode(data).decode()

result, count = re.subn(r'\.\./\.\./metaworld/assets/2d/c9_cell/([^"\s]+\.jpg)', replace, page)
result = result.replace('img-src &#x27;self&#x27; data:;', 'img-src data:;')
if count != 13 or hashlib.sha256(result.encode()).hexdigest() != manifest['original_sha256']:
    raise ValueError('Original page could not be reconstructed exactly')
(HERE/'REVIEW_STANDALONE_RESTORED.html').write_text(result)
print('Restored exact original standalone review:', HERE/'REVIEW_STANDALONE_RESTORED.html')
