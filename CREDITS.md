# SciVerse 3D — Credits & Third-Party Notices

**SciVerse 3D** (*Explore Science. Experience Discovery.*) is an independent offline bilingual visual science platform for Class IX–X Science with extensible Class XI–XII chapter compilation. NCERT syllabus structure and textbook terminology belong to NCERT.

Full verbatim license texts for all bundled libraries and fonts are embedded inside `vendor/THIRD_PARTY_LICENSES.txt` and inside the top HTML comment of `index.html`:

- **Three.js (r187)** — MIT License (`mrdoob/three.js`)
- **StPageFlip (`page-flip` 2.0.7)** — MIT License (`Nodlik/StPageFlip`)
- **MiniSearch (`minisearch` 7.2.0)** — MIT License (`lucaong/minisearch`)
- **Temml (`temml` 0.14.0 + `Temml.woff2`)** — MIT License (`ronkok/Temml`)
- **Tween.js (`@tweenjs/tween.js` 25.0.0)** — MIT License (`tweenjs/tween.js`)
- **canvas-confetti (`1.9.4`)** — ISC License (`catdad/canvas-confetti`)
- **qrcode-generator** — MIT License (`kazuhikoarase/qrcode-generator`)
- **tiny-inflate / EVUnzlib** — MIT License (`foliojs/tiny-inflate` / Arjun Barrett)
- **Noto Sans Devanagari** — SIL Open Font License 1.1 (`notofonts`)

## 2D teaching plates (`assets/2d/rx/`)

Most are imported from `anveshix/ifinite-horizon` (main) by `tools/import_realistic_plates.py`. The `rx/local_*` plates were AI-generated for Sci-flip; their local mappings and bilingual hotspots are maintained in `src/local_illustrations.json`. All are illustrative teaching images, not to scale and not micrographs; the new drafts await scientific and language review.

These anatomy renders are adapted from BodyParts3D and Z-Anatomy and are shared under **CC BY-SA 4.0**:

- `rx/circulatory_system--2.webp`, `rx/circulatory_system--3.webp`, `rx/human_eye_anatomy--3.webp`, `rx/human_eye_anatomy--5.webp`, `rx/respiratory_system--1.webp`, `rx/respiratory_system--3.webp`, `rx/skeleton_joint--1.webp`, `rx/skeleton_joint--2.webp`
  — Anatomy © BodyParts3D (DBCLS, CC BY-SA 2.1 JP) · Z-Anatomy (CC BY-SA 4.0), simplified render — shared under CC BY-SA 4.0
