#!/usr/bin/env python3
"""SciVerse 3D single-file offline bundler.
Reads vendor/* + src/* + authoring/packs/*.json and emits one self-contained
index.html. No CDN, no network requests, no runtime build dependencies, no OCR.

LAUNCH AUDIT
  * Three.js r187 is a vendored tree-shaken IIFE, not the deprecated r150 UMD.
  * SciVerse 3D open-source libs (StPageFlip, MiniSearch, @tweenjs/tween.js,
    Temml, canvas-confetti) are vendored offline in vendor/sciverse-libs.min.js.
  * Every inline <script>/<style> is hash-pinned in a strict CSP meta; the same
    policy is written to the publish headers by make_publish.py.
  * Third-party MIT/ISC/OFL licence notices are embedded in the HTML comment.
  * The 29 EVPACK v2 chapter packs remain INERT <script type="application/json">
    blocks; EVLAZY JSON.parses exactly one pack when a chapter needs it.
"""
import base64
import hashlib
import html
import json
import pathlib
import re
import subprocess
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


def compact_bundle_assets(css_raw, js_list):
    """Compact inline CSS and JS whitespace/syntax without renaming any globals."""
    if (ROOT / "node_modules" / "esbuild").exists():
        helper = (
            'const fs=require("fs"),esbuild=require("esbuild");'
            'const inp=JSON.parse(fs.readFileSync(0,"utf8"));'
            'const css=esbuild.transformSync(inp.css,{minify:true,loader:"css",charset:"utf8"}).code.replace(/<\\/style/gi,"<\\\\/style");'
            'const js=inp.js.map(s=>esbuild.transformSync(s,{minifyWhitespace:true,minifySyntax:true,loader:"js",charset:"utf8"}).code.replace(/<\\/script/gi,"<\\\\/script"));'
            'process.stdout.write(JSON.stringify({css,js}));'
        )
        proc = subprocess.run(
            ["node", "-e", helper],
            input=json.dumps({"css": css_raw, "js": js_list}),
            text=True,
            capture_output=True,
            cwd=ROOT,
            check=True,
        )
        parsed = json.loads(proc.stdout)
        return parsed["css"], parsed["js"]
    # Pure-Python deterministic fallback when node_modules is absent
    css_min = re.sub(r"/\*[\s\S]*?\*/", "", css_raw)
    css_min = re.sub(r"\n[ \t]*", "\n", css_min)
    js_min = [re.sub(r"\n[ \t]+", "\n", s) for s in js_list]
    return css_min, js_min


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
    temml_font = base64.b64encode((ROOT / "vendor/temml.woff2").read_bytes()).decode("ascii")
    sv_css = read("vendor/sciverse-libs.css").replace("__TEMML_FONT__", temml_font)
    css_raw = sv_css + "\n" + read("src/styles.css").replace("__DEVA_FONT__", font)

    three = read("vendor/three.min.js")
    qr = read("vendor/qrcode.js")
    sv_libs = read("vendor/sciverse-libs.min.js")
    unzlib = read("vendor/unzlib.min.js")
    licenses = read("vendor/THIRD_PARTY_LICENSES.txt")
    if "THREE_REVISION=" + THREE_REVISION not in three:
        raise SystemExit("vendor/three.min.js is not the pinned r187 tree-shaken build")
    if 'build/three.min.js" and "build/three.js" are deprecated' in three or \
       'Scripts "build/three.js" and "build/three.min.js" are deprecated' in three:
        raise SystemExit("deprecated Three.js UMD build detected")
    if "-->" in licenses:
        raise SystemExit("licence notice cannot be embedded in an HTML comment")

    src_scripts = [read(p) for p in [
        "src/spec.js", "src/dictionary.js", "src/blocks.js", "src/atlas_blocks.js",
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
        "src/pack_loader.js",
    ]]
    app_js = read("src/app.js")
    raw_labels = (ROOT / "src/label_data.json").read_bytes()
    b64_labels = base64.b64encode(zlib.compress(raw_labels, 9)).decode("ascii")
    decoder = (
        'JSON.parse(new TextDecoder().decode(EVUnzlib(Uint8Array.from(atob("'
        + b64_labels + '"),c=>c.charCodeAt(0)))))'
    )
    assert app_js.count("__EV_LABEL_DATA__") == 1
    app_resolved = app_js.replace("__EV_LABEL_DATA__", decoder)
    sciverse_js = read("src/sciverse.js")

    css, compacted = compact_bundle_assets(css_raw, src_scripts + [app_resolved, sciverse_js])
    scripts = compacted[:-2] + [unzlib, compacted[-2], compacted[-1]]

    script_tags = "\n".join("<script>\n" + s + "\n</script>" for s in scripts)
    for s in scripts + [three, qr, sv_libs]:
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
<title>SciVerse 3D — Explore Science. Experience Discovery.</title>
<meta name="description" content="SciVerse 3D — Explore Science. Experience Discovery. 2D Flipbooks • 3D Models • Interactive Experiments • Hindi–English Learning for Class IX–X Science (extensible to Class XI–XII).">
<!--
SciVerse 3D vendored third-party licence notices (offline, no external request).
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
{sv_libs}
</script>
<script>
const EV_READY_MARK = 'sciverse-3d-v2';
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
          f"sciverse-libs {len(sv_libs)} chars · Devanagari+Temml fonts {len(font) + len(temml_font)} base64 chars")
    print(f"strict script CSP: {analysis['scriptBlocks']} script hashes · "
          f"style unsafe-inline for dynamic DOM styles · 0 external refs")
    print(f"Prompt 5 inert packs {pack_stats['count']} · {pack_stats['bytes']:,} bytes · "
          f"{pack_stats['quizTotal']} bilingual MCQs · parsed on demand by EVLAZY")
    print(f"initial payload {size:,} / {INITIAL_PAYLOAD_BUDGET:,} bytes · external refs 0")


if __name__ == "__main__":
    main()
