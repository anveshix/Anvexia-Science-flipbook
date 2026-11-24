#!/usr/bin/env python3
"""Exercise the ZIP audit against missing/corrupted plates and extracted HTTP assets.

Run after `npm run publish`; skip if no archive exists in a normal source-only QA run.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory
from threading import Thread
from urllib.request import urlopen
import json
import subprocess
import sys
import zipfile

ROOT = Path(__file__).resolve().parent.parent
ZIP = ROOT / "eduverse-publish.zip"
AUDIT = ROOT / "qa/audit_draft_integration.py"

if not ZIP.is_file():
    print("SKIP publish_archive_regression: run npm run publish first")
    raise SystemExit(0)

mapping = json.loads((ROOT / "src/realistic_plates.json").read_text(encoding="utf-8"))["assets"]
webps = sorted({"assets/2d/" + name for sections in mapping.values() for files in sections.values() for name in files})
assert webps, "No WebP assets in runtime mapping"


def audit(path):
    return subprocess.run([sys.executable, str(AUDIT), "--zip", str(path), "--require-zip", "--no-http"],
                          cwd=ROOT, capture_output=True, text=True)


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


with TemporaryDirectory(prefix="sciflip-package-test-") as tmp:
    tmp = Path(tmp)
    missing_zip = audit(tmp / "does-not-exist.zip")
    assert missing_zip.returncode != 0 and "Required ZIP missing" in missing_zip.stderr
    with zipfile.ZipFile(ZIP) as src:
        jpeg = next(n for n in src.namelist() if n.startswith("assets/2d/") and n.endswith(".jpg"))
    for kind, target, expected in (("missing-webp", webps[0], "ZIP missing"),
                                   ("corrupt-webp", webps[0], "ZIP content mismatch"),
                                   ("missing-jpeg", jpeg, "ZIP JPEG set mismatch")):
        modified = tmp / (kind + ".zip")
        with zipfile.ZipFile(ZIP) as src, zipfile.ZipFile(modified, "w", zipfile.ZIP_STORED) as dst:
            for info in src.infolist():
                if info.filename == target and kind.startswith("missing"):
                    continue
                data = src.read(info.filename)
                if info.filename == target and kind.startswith("corrupt"):
                    data += b"modified"
                dst.writestr(info.filename, data)
        result = audit(modified)
        assert result.returncode != 0 and expected in result.stderr, (kind, result.stdout, result.stderr)
        modified.unlink()

    extracted = tmp / "extracted"
    with zipfile.ZipFile(ZIP) as z:
        z.extractall(extracted)
        jpeg_refs = sorted(n for n in z.namelist() if n.startswith("assets/2d/") and n.endswith(".jpg"))
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=str(extracted)))
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        for ref in ["index.html", *jpeg_refs, *webps]:
            with urlopen(f"http://127.0.0.1:{server.server_port}/" + ref, timeout=5) as response:
                assert response.read() == (ROOT / ref).read_bytes(), ref
    finally:
        server.shutdown()
        server.server_close()
        thread.join()

print(f"PASS publish_archive_regression: missing ZIP, missing JPEG/WebP and altered WebP rejected; extracted HTTP serves index + {len(jpeg_refs)} JPEGs + {len(webps)} WebPs byte-for-byte")
