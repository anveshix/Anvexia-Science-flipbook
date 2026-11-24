#!/usr/bin/env python3
"""Rebuild + repackage the static publish bundle.

Usage:
  python3 make_publish.py                 # full build + headers + eduverse-publish.zip
  python3 make_publish.py --headers-only  # build index.html + publish/_headers + publish/nginx.conf

The CSP and security headers are regenerated from the exact inline-script/style
hashes. The offline ZIP includes the JPEG drafts and all WebP plates referenced
by the runtime mapping. Inclusion is not scientific or teacher approval.
"""
import argparse
import base64
import hashlib
import json
import os
import pathlib
import re
import shutil
import subprocess
import sys
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent
os.chdir(ROOT)
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
from tools.csp import render_netlify_headers, render_nginx_conf  # noqa: E402

ASSET_DIRS = [
    ("c9_pure", "1-"),
    ("c9_atoms", "1-"),
    ("c9_disease", "1-"),
    ("c10_magnetism", "12-"),
    ("c10_electricity", "11-"),
    ("c10_eye", "10-"),
    ("c10_light", "9-"),
    ("c10_periodic", "P-"),
    ("c10_carbon", "4-"),
    ("c10_repro", "7-"),
    ("c9_matter", "1-"),
    ("c9_exploration", "1-"),
    ("c9_cell", "2-"),
    ("c9_tissues", "3-"),
    ("c9_motion", "4-"),
    ("c9_mixtures", "5-"),
    ("c9_forces", "6-"),
    ("c9_work_energy", "7-"),
    ("c9_atom", "8-"),
    ("c9_atomic_foundations", "9-"),
    ("c9_sound", "10-"),
    ("c9_reproduction9", "11-"),
    ("c9_diversity", "12-"),
    ("c9_earth", "13-"),
    ("c10_reactions", "1-"),
    ("c10_acids", "2-"),
    ("c10_metals", "3-"),
    ("c10_life", "5-"),
    ("c10_control", "6-"),
    ("c10_sources", "S-"),
    ("c10_sustainable", "M-"),
    ("c10_heredity", "8-"),
    ("c10_env", "13-"),
]


def main() -> None:
    parser = argparse.ArgumentParser(description="Build EduVerse offline publish bundle and headers.")
    parser.add_argument("--headers-only", action="store_true", help="Only build index.html and regenerate publish/_headers + publish/nginx.conf")
    args = parser.parse_args()

    subprocess.run([sys.executable, "tools/sync_2d_assets.py"], check=True)
    subprocess.run([sys.executable, "build.py"], check=True)

    src = ROOT / "index.html"
    os.makedirs(ROOT / "publish", exist_ok=True)
    html = src.read_text(encoding="utf-8")
    external = re.findall(r'(?:src|href)\s*=\s*["\']https?://[^"\']+', html)
    if external:
        raise SystemExit("ERROR: external references in bundle: " + repr(external[:5]))

    evidence = json.loads((ROOT / "qa" / "csp_hashes.json").read_text(encoding="utf-8"))
    csp = evidence["policy"]
    (ROOT / "publish" / "_headers").write_text(render_netlify_headers(csp), encoding="utf-8")
    (ROOT / "publish" / "nginx.conf").write_text(render_nginx_conf(csp), encoding="utf-8")

    digest = hashlib.sha256(src.read_bytes()).hexdigest()
    if args.headers_only:
        print("index.html      ", src.stat().st_size, "bytes")
        print("sha256          ", digest)
        print("headers         ", "publish/_headers + publish/nginx.conf regenerated")
        return

    # The runtime prepends these shared WebPs to the chapter JPEG lists. Package
    # the mapping, not a hard-coded count or glob, so new first views cannot be
    # silently omitted. Reject paths outside the shared store and missing files.
    realistic = json.loads((ROOT / "src/realistic_plates.json").read_text(encoding="utf-8"))
    webps = set()
    for sections in realistic["assets"].values():
        for files in sections.values():
            for name in files:
                path = pathlib.PurePosixPath(name)
                if (len(path.parts) != 2 or path.parts[0] != "rx" or
                        path.suffix != ".webp" or str(path) != name):
                    raise SystemExit("Invalid shared plate path: " + name)
                item = ROOT / "assets/2d" / name
                if not item.is_file() or item.is_symlink():
                    raise SystemExit("Missing or symlinked shared plate: " + str(item))
                webps.add(name)
    if not webps:
        raise SystemExit("No shared WebP plates found in runtime mapping")

    dst = ROOT / "publish" / "index.html"
    shutil.copyfile(src, dst)

    members = [
        "index.html", ".nojekyll", "_headers", "PUBLISH.md",
        "Dockerfile", "nginx.conf", "compose.yaml",
    ]
    zpath = ROOT / "eduverse-publish.zip"
    review_src = ROOT if (ROOT / "ROLLOUT_STATUS.csv").exists() else (ROOT.parent / "eduverse_2d_assets")
    topic_audit_src = (ROOT / "eduverse_topic_audit") if (ROOT / "eduverse_topic_audit").exists() else (ROOT.parent / "eduverse_topic_audit")

    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for name in members:
            z.write(ROOT / "publish" / name, name)
        for ch, prefix in ASSET_DIRS:
            files = sorted((ROOT / "assets" / "2d" / ch).glob(prefix + "*.jpg"))
            if not files:
                raise SystemExit("Missing local draft images for " + ch)
            for item in files:
                target = "assets/2d/" + ch + "/" + item.name
                z.write(item, target)
                members.append(target)

        for name in sorted(webps):
            target = "assets/2d/" + name
            z.write(ROOT / target, target)
            members.append(target)

        for name in ["DRAFT_REVIEW.html", "DRAFT_MANIFEST.json", "ROLLOUT_STATUS.csv"]:
            item = review_src / name
            if not item.exists():
                raise SystemExit("Missing draft review file: " + str(item))
            if name.endswith(".html"):
                text = item.read_text(encoding="utf-8")
                text = text.replace('src="../metaworld/assets/2d/', 'src="../assets/2d/')
                text = text.replace('src="assets/2d/', 'src="../assets/2d/')
                for ch, _ in ASSET_DIRS:
                    text = text.replace('src="' + ch + '/', 'src="../assets/2d/' + ch + '/')
                z.writestr("review/" + name, text)
            else:
                z.write(item, "review/" + name)
            members.append("review/" + name)

        cell = review_src / "c9_cell"
        embedded = (cell / "REVIEW.html").read_text(encoding="utf-8")
        by_hash = {hashlib.sha256(p.read_bytes()).hexdigest(): p.name for p in (ROOT / "assets/2d/c9_cell").glob("2-*.jpg")}

        def local_cell_asset(match):
            d = hashlib.sha256(base64.b64decode(match.group(1), validate=True)).hexdigest()
            if d not in by_hash:
                raise SystemExit("Cell review image is not identical to a packaged asset: " + d)
            return "../../assets/2d/c9_cell/" + by_hash[d]

        if "data:image/" in embedded:
            embedded, replaced = re.subn(r"data:image/(?:jpeg|jpg|png);base64,([A-Za-z0-9+/=]+)", local_cell_asset, embedded)
            embedded = embedded.replace("img-src data:;", "img-src &#x27;self&#x27; data:;")
        else:
            linked = re.findall(r'(?:\.\./\.\./metaworld|\.\.)/assets/2d/c9_cell/([^"\s]+\.jpg)', embedded)
            if any(name not in by_hash.values() for name in linked):
                raise SystemExit("Cell review references missing app assets")
            embedded, replaced = re.subn(r"(?:\.\./\.\./metaworld|\.\.)/assets/2d/c9_cell/", "../../assets/2d/c9_cell/", embedded)
        if replaced != 13:
            raise SystemExit("Expected 13 Cell review images, found " + str(replaced))
        z.writestr("review/cell/REVIEW.html", embedded)
        members.append("review/cell/REVIEW.html")

        for name in ["TEACHER_REVIEW.md", "manifest.json"]:
            z.write(cell / name, "review/cell/" + name)
            members.append("review/cell/" + name)
        for name in ["CONCEPT_TRACKER_FIRST_PASS.csv", "CONCEPT_TRACKER_README.md"]:
            z.write(topic_audit_src / name, "review/" + name)
            members.append("review/" + name)
        rejected = review_src / "rejected" / "c9_work_energy" / "7-08-mechanical-advantage.jpg"
        if rejected.exists():
            z.write(rejected, "review/rejected/c9_work_energy/" + rejected.name)
            members.append("review/rejected/c9_work_energy/" + rejected.name)

    print("index.html      ", dst.stat().st_size, "bytes")
    print("external refs   ", len(external))
    print("sha256          ", digest)
    print("strict script CSP", evidence["scriptBlocks"], "script hashes ·",
          "style unsafe-inline for dynamic DOM styles · header-only frame-ancestors")
    print("headers         ", "publish/_headers + publish/nginx.conf regenerated")
    print("publish package ", zpath, os.path.getsize(zpath), "bytes")
    print("files           ", len(members), "archive entries ·", len(webps), "referenced WebPs")
    # Packaging is not complete until the independent mapping/byte-parity audit
    # passes; do not depend on an optional server or silently skip a missing ZIP.
    subprocess.run([sys.executable, "qa/audit_draft_integration.py", "--require-zip", "--no-http"], check=True)


if __name__ == "__main__":
    main()
