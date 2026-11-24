# SciVerse 3D

**Explore Science. Experience Discovery.**
*विज्ञान का अन्वेषण करें। खोज का अनुभव लें।*

`2D Flipbooks • 3D Models • Interactive Experiments • Hindi–English Learning`

---

**SciVerse 3D** is an offline-first, self-contained bilingual (**English + हिंदी**) interactive science platform built for **CBSE / NCERT Class IX & X Science** (33 chapters · 266 spreads · 274 high-resolution `1408 × 768` 2D scientific plates · 580 bilingual MCQs) with clean architectural scalability to **Class XI & XII** Physics, Chemistry, and Biology.

## Core Pillars

1. **📖 2D Flipbooks (`StPageFlip`)**: Tactile hardcover two-page illustrated Science Flipbooks with corner-peel physics, dynamic spine shadows, clickable bilingual diagram hotspots (`EVLABEL`), and instant jump-to-3D synchronization.
2. **🧊 3D Models (`Three.js r187`)**: Interactive 3D apparatus, molecules, ray-optics benches, circuits, and procedural biological organs rising directly from the textbook page on a single shared WebGL renderer.
3. **⚗️ Interactive Experiments (`Temml` + `TWEEN` + `canvas-confetti`)**: Guided **Predict → Try → Observe → Explain → Stamp** discovery loop with native W3C MathML equation typesetting, live numerical readouts, invariant checks, and celebratory mastery feedback.
4. **अ/A Hindi–English Learning (`EVDICT` + `MiniSearch`)**: Side-by-side `EN + हिंदी`, pure `हिंदी` (embedded Noto Sans Devanagari), and `English` modes plus instant offline bilingual search (`Ctrl+K` / `⌘K`) across all 266 spreads, formulas, and key terms.
5. **✦ Higher Classes Studio (Class XI & XII Ready)**: Engine-level support for `Classes IX, X, XI, XII` (`EVENGINE` + deterministic offline Chapter Compiler) with instant PCM/PCB Class XI–XII starter blueprints.

## Open-Source Stack & Architecture

All runtime libraries are vendored and bundled offline into `index.html` (`< 5.0 MB` strict initial payload budget, **zero** external CDN/network requests, strict SHA-256 script CSP):

| Package | Version | License | Role in SciVerse 3D |
| --- | --- | --- | --- |
| `three` (custom r187 IIFE) | `0.187.x` | MIT | Shared 3D WebGL textbook world, pop-up apparatus, ray optics & organs |
| `page-flip` (`StPageFlip`) | `2.0.7` | MIT | Tactile 2D hardcover & soft-page Science Flipbooks |
| `minisearch` | `7.2.0` | MIT | Instant offline English + Devanagari Hindi concept & formula search (`Ctrl+K`) |
| `temml` | `0.14.0` | MIT | LaTeX-to-native-MathML scientific & chemical equation typesetting (`~9 KB` font) |
| `@tweenjs/tween.js` | `25.0.0` | MIT | Smooth easing transitions for UI and interactive motion |
| `canvas-confetti` | `1.9.4` | ISC | Discovery Stamp & ≥80% quiz mastery celebration (`useWorker: false`) |
| `qrcode-generator` | `1.4.4` | MIT | Printable textbook-page QR markers on the Teacher Desk |
| `esbuild` + `@napi-rs/canvas` | `dev` | MIT | Deterministic offline bundling (`tools/vendor_libs.mjs`) & 2D plate generation (`tools/build_2d_plates.mjs`) |

## Repository Structure

| Path | Description |
| --- | --- |
| `index.html`, `.nojekyll` | Self-contained offline single-file runtime bundle (`~4.80 MB`, strict 61-hash script CSP, zero external URLs). |
| `src/` | Modular sources (`body.html`, `styles.css`, `spec.js`, `dictionary.js`, `app.js`, `sciverse.js`, `world.js`, `blocks.js`, `engines/*`, `chapters_generated.js`, `label_data.json`, etc.). |
| `vendor/` | Vendored offline bundles & fonts (`three.min.js`, `sciverse-libs.min.js`, `sciverse-libs.css`, `qrcode.js`, `unzlib.min.js`, `devanagari.woff2`, `temml.woff2`, `THIRD_PARTY_LICENSES.txt`). |
| `assets/2d/<33 chapters>/` | **274** deterministic `1408 × 768` scientific 2D plates aligned to **516** bilingual clickable hotspots. |
| `authoring/` | `syllabus_ix.txt`, `syllabus_x.txt`, `coverage.json`, and 29 EVPACK v2 bilingual chapter packs (`authoring/packs/*.json`). |
| `tools/` | `vendor_libs.mjs`, `build_2d_plates.mjs`, `build_chapters.py`, `build_clickable_labels.py`, `sync_2d_assets.py`, `csp.py`. |
| `qa/` | Automated verification suites: `syllabus_smoke.js`, `label_geometry.js`, `sciverse_smoke.js`, `audit_draft_integration.py`, `csp_hashes.json`. |

## Realistic 2D plates · 3D book · 2D flipbook (aligned pipeline)

| Concern | Source of truth | How it reaches the app |
| --- | --- | --- |
| Realistic plates, condition views & local drafts (278 WebP, each stored once) | `anveshix/ifinite-horizon` (main) → `public/2d/**/images`, `public/2d/conditions` + `assets/va-2d.js`, `conditions.js`; local AI drafts → `src/local_illustrations.json` | `python3 tools/import_realistic_plates.py <ifinite-horizon checkout>` → shared store `assets/2d/rx/` + `src/realistic_plates.json` (chapters reference `rx/<id>.webp`; credits in `CREDITS.md`). Local drafts remain subject to review. |
| Generated composite plates (274 JPEG) | `node tools/build_2d_plates.mjs` (never overwrites manifest originals) | kept as the **next image (↻)** after the realistic plate |
| Bilingual hotspots | `src/label_data.json` + `realistic_plates.json` labels | merged and compressed by `build.py` |
| 3D book | `src/world.js` | the realistic plate is painted **into the page texture**, so it turns with the paper; the HTML overlay adds sharp pixels and clickable labels when the page is still |
| 2D flipbook | `src/sciverse.js` (StPageFlip) | concept (left) + plate (right) per section; images pre-decoded before page turns |

**Modes:** 3D by default · automatic 2D flipbook when WebGL is unavailable · force with `?mode=2d` / `?mode=3d` · `?far=1` opens Far-read.

**QA:** `npm run qa` runs 5 suites, including `qa/realistic_plates.py` and label geometry for every hotspot (desktop + mobile).

## Quick Start & Commands

```bash
# Install build & authoring dependencies
npm install

# Bundle vendored libraries + rebuild index.html & CSP headers
npm run build
python3 make_publish.py --headers-only

# Run all 4 automated QA suites (3D scenes, 2D hotspot geometry, CSP & SciVerse smoke, asset parity)
npm run qa

# Start local preview server on http://0.0.0.0:8080
npm start
```
