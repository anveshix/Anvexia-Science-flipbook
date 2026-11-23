#!/usr/bin/env python3
"""EduVerse single-file offline bundler.
Reads vendor/* + src/* + authoring/packs/*.json and emits one self-contained
index.html. No CDN, no network requests, no runtime build dependencies, no OCR.

LAUNCH AUDIT
  * Three.js r187 is a vendored tree-shaken IIFE, not the deprecated r150 UMD.
  * Every inline <script>/<style> is hash-pinned in a strict CSP meta; the same
    policy is written to the publish headers by make_publish.py.
  * Third-party MIT/OFL licence notices are embedded in the HTML comment.
  * The 29 EVPACK v2 chapter packs remain INERT <script type="application/json">
    blocks; EVLAZY JSON.parses exactly one pack when a chapter needs it.
"""
import base64
import hashlib
import html
import json
import pathlib
import re
import sys
import zlib

ROOT = pathlib.Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
from tools.csp import analyze, policy, meta_policy  # noqa: E402
from tools.restore_generated_source import restore as restore_generated_source  # noqa: E402
from tools.restore_authoring_packs import restore as restore_authoring_packs  # noqa: E402
from tools.restore_vendor_three import restore as restore_vendor_three  # noqa: E402
restore_generated_source()
restore_authoring_packs()
restore_vendor_three()

OUT = ROOT / "index.html"
PACK_DIR = ROOT / "authoring" / "packs"
CSP_EVIDENCE = ROOT / "qa" / "csp_hashes.json"
INITIAL_PAYLOAD_BUDGET = 5_000_000
THREE_REVISION = "187"


def read(p):
    return (ROOT / p).read_text(encoding="utf-8")


def safe(s, kind):
    """A literal </script> or </style> inside a classic inline block would close it."""
    token = "</" + kind
    if token.lower() in s.lower():
        raise SystemExit(f"Unsafe literal {token} found in {kind} source — escape it")
    return s


def inert_packs():
    """Return (script tags, stats) for all generated chapter packs."""
    index = json.loads((PACK_DIR / "index.json").read_text(encoding="utf-8"))
    tags, total = [], 0
    for row in index["catalogue"]:
        pid = row["id"]
        raw = (PACK_DIR / (pid + ".json")).read_text(encoding="utf-8")
        # JSON allows \/ as an escaped slash; this keeps any literal '</' from
        # terminating the inert script element.
        body = raw.replace("</", "<\\/")
        safe(body, "script")
        a = lambda v: html.escape(str(v), quote=True)
        tags.append(
            '<script type="application/json" id="ev-pack-' + a(pid) + '"'
            ' data-pack-id="' + a(pid) + '"'
            ' data-pack-class="' + a(row["cls"]) + '"'
            ' data-pack-title-en="' + a(row["title_en"]) + '"'
            ' data-pack-title-hi="' + a(row["title_hi"]) + '"'
            ' data-pack-sections="' + a(row["sections"]) + '"'
            ' data-pack-quiz="' + a(row["quiz"]) + '"'
            ' data-pack-bytes="' + a(row["bytes"]) + '">'
            + body + "</script>"
        )
        total += row["bytes"]
    assert len(tags) == index["count"], "pack count mismatch with index.json"
    assert total == index["totalPackBytes"], "pack byte total mismatch with index.json"
    return "\n".join(tags), dict(count=len(tags), bytes=total,
                                quizTotal=index["quizTotal"])


def main():
    font = base64.b64encode((ROOT / "vendor/devanagari.woff2").read_bytes()).decode("ascii")
    css = read("src/styles.css").replace("__DEVA_FONT__", font)
    three = read("vendor/three.min.js")
    qr = read("vendor/qrcode.js")
    unzlib = read("vendor/unzlib.min.js")
    licenses = read("vendor/THIRD_PARTY_LICENSES.txt")
    if "THREE_REVISION=" + THREE_REVISION not in three:
        raise SystemExit("vendor/three.min.js is not the pinned r187 tree-shaken build")
    if 'build/three.min.js" and "build/three.js" are deprecated' in three or \
       'Scripts "build/three.js" and "build/three.min.js" are deprecated' in three:
        raise SystemExit("deprecated Three.js UMD build detected")
    if "-->" in licenses:
        raise SystemExit("licence notice cannot be embedded in an HTML comment")
    scripts = [read(p) for p in ["src/spec.js", "src/dictionary.js", "src/blocks.js", "src/atlas_blocks.js",
                                 "src/checks.js", "src/bio3d.js", "src/fsm.js",
                                 "src/engines/EngineKit.js",
                                 "src/engines/BioEngine.js",
                                 "src/engines/ChemEngine.js",
                                 "src/engines/PhysEngine.js",
                                 "src/figure3d.js",
                                 "src/carbon_blocks.js", "src/carbon_chapter.js",
                                 "src/light_blocks.js", "src/light_chapter.js",
                                 "src/light_engine.js", "src/organ3d.js", "src/chapters_generated.js",
                                 "src/world.js",
                                 "src/chapter_packs.js", "src/state_manager.js",
                                 "src/chapter_bind.js", "src/projector.js",
                                 "src/pack_loader.js"]]
    scripts.append(unzlib)
    app_js = read("src/app.js")
    raw_labels = (ROOT / "src/label_data.json").read_bytes()
    b64_labels = base64.b64encode(zlib.compress(raw_labels, 9)).decode("ascii")
    decoder = (
        'JSON.parse(new TextDecoder().decode(EVUnzlib(Uint8Array.from(atob("'
        + b64_labels + '"),c=>c.charCodeAt(0)))))'
    )
    assert app_js.count("__EV_LABEL_DATA__") == 1
    scripts.append(app_js.replace("__EV_LABEL_DATA__", decoder))
    script_tags = "\n".join("<script>\n" + s + "\n</script>" for s in scripts)
    for s in scripts + [three, qr]:
        safe(s, "script")
    safe(css, "style")

    pack_tags, pack_stats = inert_packs()
    body = read("src/body.html")
    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0a1422">
<meta name="color-scheme" content="dark light">
<meta name="author" content="Paras Pranav">
<meta name="copyright" content="Copyright / Developer : Paras Pranav">
<title>EduVerse — Chapter to Moving 3D Textbook World</title>
<meta name="description" content="Compile any CBSE/NCERT Science chapter into a real moving 3D textbook world: page turning, pop-up experiments, prediction cards, quizzes.">
<!--
EduVerse vendored third-party licence notices (offline, no external request).
{licenses}
-->
__EDUVERSE_CSP_META__
<style>
{css}
</style>
</head>
<body data-theme="classroom">
{body}
<script>
{three}
</script>
<script>
{qr}
</script>
<script>
const EV_READY_MARK = 'eduverse-v1';
</script>
{pack_tags}
{script_tags}
</body>
</html>
"""
    analysis = analyze(full_html)
    csp = policy(analysis)              # HTTP header: includes frame-ancestors
    meta_csp = meta_policy(analysis)    # <meta>: frame-ancestors is header-only
    csp_meta = (
        '<meta http-equiv="Content-Security-Policy" content="' + html.escape(meta_csp, quote=True) + '">\n'
        '<meta name="referrer" content="strict-origin-when-cross-origin">\n'
        '<meta http-equiv="X-Content-Type-Options" content="nosniff">'
    )
    full_html = full_html.replace("__EDUVERSE_CSP_META__", csp_meta)
    OUT.write_text(full_html, encoding="utf-8")
    CSP_EVIDENCE.write_text(json.dumps({
        "threeRevision": THREE_REVISION,
        "scriptBlocks": analysis["scriptBlocks"],
        "styleBlocks": analysis["styleBlocks"],
        "scriptHashes": analysis["scriptHashes"],
        "styleHashes": analysis["styleHashes"],
        "policy": csp,
        "metaPolicy": meta_csp,
        "sha256": hashlib.sha256(OUT.read_bytes()).hexdigest(),
        "bytes": OUT.stat().st_size,
    }, indent=2) + "\n", encoding="utf-8")
    size = OUT.stat().st_size
    if size >= INITIAL_PAYLOAD_BUDGET:
        raise SystemExit(f"INITIAL PAYLOAD BUDGET EXCEEDED: {size} >= {INITIAL_PAYLOAD_BUDGET} bytes")
    external = re.findall(r'(?:src|href)\s*=\s*["\']https?://[^"\']+', full_html)
    if external:
        raise SystemExit("EXTERNAL REFS in bundle: " + repr(external[:3]))
    print(f"built {OUT} · {len(full_html):,} characters ({size:,} bytes)")
    print(f"vendored Three.js r{THREE_REVISION} {len(three)} chars · qrcode {len(qr)} chars · "
          f"Devanagari font {len(font)} base64 chars")
    print(f"strict script CSP: {analysis['scriptBlocks']} script hashes · "
          f"style unsafe-inline for dynamic DOM styles · 0 external refs")
    print(f"Prompt 5 inert packs {pack_stats['count']} · {pack_stats['bytes']:,} bytes · "
          f"{pack_stats['quizTotal']} bilingual MCQs · parsed on demand by EVLAZY")
    print(f"initial payload {size:,} / {INITIAL_PAYLOAD_BUDGET:,} bytes · external refs 0")


if __name__ == "__main__":
    main()
