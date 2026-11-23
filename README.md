# Sci-flip · EduVerse Interactive 3D & 2D CBSE/NCERT Science Textbook

Offline, self-contained interactive 3D + 2D bilingual (English / हिंदी) Science textbook covering **33 chapters** and **266 spreads** across CBSE/NCERT Class IX & X (2026–27 curriculum).

## Unified Repository Layout

This repository consolidates the full modular EduVerse source tree (`metaworld/`), the 274 high-resolution (`1408 × 768`) 2D scientific plates (`assets/2d/`), offline build/packaging pipelines, QA harnesses, and draft review galleries at a single root so GitHub Pages, local HTTP preview, and offline ZIP builds work out-of-the-box:

| Path | Description |
| --- | --- |
| `index.html`, `.nojekyll` | Self-contained offline single-file runtime bundle (`4,915,454` bytes, strict 59-hash script CSP, zero external network dependencies). |
| `src/` | Modular runtime sources (`styles.css`, `body.html`, `app.js`, `spec.js`, `blocks.js`, `bio3d.js`, `figure3d.js`, `organ3d.js`, `carbon_*`, `light_*`, `engines/*`, `chapters_generated.js`, `label_data.json`, etc.). |
| `vendor/` | Vendored offline dependencies: tree-shaken `three.min.js` (r187), `qrcode.js`, `unzlib.min.js`, `devanagari.woff2` (Noto Sans Devanagari), and `THIRD_PARTY_LICENSES.txt`. |
| `authoring/` | `syllabus_ix.txt`, `syllabus_x.txt`, `coverage.json`, and 29 EVPACK v2 bilingual chapter packs (`authoring/packs/*.json`). |
| `assets/2d/<33 chapters>/` | **274** deterministic `1408 × 768` scientific 2D plates aligned pixel-for-pixel to all **516** bilingual clickable hotspots (`EVRASTER` + `EVLABEL`). |
| `tools/` | Reproducible compilers & generators: `build_chapters.py`, `build_clickable_labels.py`, `build_2d_plates.mjs`, `sync_2d_assets.py`, `csp.py`, and restoration helpers. |
| `build.py`, `make_publish.py`, `publish/` | Offline single-file bundler (`build.py`), static deployment packager (`make_publish.py`), and generated Netlify/Cloudflare (`publish/_headers`), Nginx (`publish/nginx.conf`), and Docker (`publish/Dockerfile`, `publish/compose.yaml`) configs. |
| `qa/` | Automated verification suites: `audit_draft_integration.py`, `label_geometry.js`, `syllabus_smoke.js`, `csp_hashes.json`, and pack validation manifests. |
| `DRAFT_REVIEW.html`, `TISSUES_MOTION_REVIEW.html`, `c9_cell/REVIEW.html` | Offline visual review galleries linked directly to `assets/2d/` alongside `ROLLOUT_STATUS.csv` and `eduverse_topic_audit/`. |

## Quick Start & Reproducible Build Commands

```bash
# 1. Serve the app & review galleries locally on port 8080
python3 -m http.server 8080 --bind 0.0.0.0

# 2. Recompile syllabus spreads & coverage ledger from authoring/syllabus_*.txt
python3 tools/build_chapters.py

# 3. Regenerate all 274 1408x768 2D scientific plates from 3D Three.js models & schematics
node tools/build_2d_plates.mjs

# 4. Verify clickable hotspot metadata & rebuild index.html + publish headers
python3 tools/build_clickable_labels.py
python3 make_publish.py --headers-only   # or `python3 make_publish.py` to also emit eduverse-publish.zip

# 5. Run automated QA suites
node qa/syllabus_smoke.js
node qa/label_geometry.js
python3 qa/audit_draft_integration.py
```

## Scientific & Teacher Review Note

All **266/266** runtime spreads across **33** chapters have 3D interactive scenes and **274** mapped 2D draft plates (`516` bilingual clickable hotspots across all 274 plates). In `tools/build_2d_plates.mjs`, each `1408 × 768` plate is deterministically rendered from the chapter's Three.js 3D scientific model, NCERT equations, bilingual schematics, and exact hotspot coordinates (`with_anchor` top-bar clearance for DOM chips + `without_anchor` baked bilingual callout cards). Formal subject-matter, teacher, accessibility, and cross-device sign-off remain tracked in `ROLLOUT_STATUS.csv` and `docs/REALISTIC_2D_STATUS.md`.
