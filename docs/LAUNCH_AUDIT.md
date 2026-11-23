# Launch-Day Senior Full-Stack Audit

**Copyright / Developer : Paras Pranav**  
**Audit date:** 2026-11-03 (Asia/Calcutta)  
**Status:** **LOCAL DETERMINISTIC PASS — PUBLIC DEPLOYMENT / FINAL OWNER SIGN-OFF PENDING.** This report certifies the current offline artifact and its reproducible local gates; it is **not** a public-deployment sign-off and must not be read as “ready to launch”.

---

## 1. Executive decision boundary

The full local chain now passes on the current bundle, and the documentation/manifest/evidence are hash-aligned to it. `make launch` exited 0; `make contact` exited 0; `python3 verify.py` printed `RESULT PASS`. The Makefile’s older “ready to publish” wording has been replaced with an explicit local-gate / deployment-pending message so that a local pass cannot be mistaken for production approval.

Still **explicitly unresolved**:

1. No public deployment host, DNS, TLS certificate, CDN/WAF configuration, credentials, uptime target or rollback drill was supplied or exercised.
2. The exact verbatim wording of the user’s “Prompt 5” Master Engine instruction is still **not available** in the workspace or connected Google Drive. No official CBSE project PDF was found. The procedural-organ and text-only EVPACK implementation is a **working default**, not an explicitly approved transcription.
3. No container-image runtime CVE scan, host CVE scan, production HTTPS/TLS test, CDN/WAF test, real-GPU test, Firefox/Safari test, or 79-shot human-perfect review certificate exists. A 79-shot contact sheet was regenerated and manually reviewed at contact-sheet resolution with no visible blocker; that is supporting evidence, not a substitute for deterministic gates or production validation.
4. This audit does **not** claim absolute XSS safety, optimal performance, “0 global vulnerabilities”, final sign-off, or readiness to launch. `qa/npm_audit.json` zero means **zero advisories in the QA npm lock**; `qa/dependency_osv.json` zero means **zero advisories for the seven explicitly pinned targets**. No universal vulnerability claim is made.

---

## 2. Current artifact identity

| Item | Current evidence |
|---|---|
| Root / publish | `index.html` and `publish/index.html` byte-identical |
| Bytes / chars | **4,564,451 bytes** / **3,674,826 characters** |
| sha256 | `25a2954562b0e301188d0ac5578146e1bc5760cd84201e71deba82a6bca1e0d7` |
| Publish zip | `eduverse-publish.zip`, **816,430 bytes**, 7 files |
| CSP | **58** SHA-256 script hashes; `script-src` has **no** `unsafe-inline`; `style-src 'unsafe-inline'` is deliberate for dynamic DOM styles; HTTP-header policy adds `frame-ancestors 'none'` and conditional HSTS |
| External refs | **0** |
| Inert P5 payload | **29** EVPACK v2 packs / **580** bilingual MCQs / **1,166,748** inert bytes; `ocr:false`, `gltf:0` |
| Exact credit | `Copyright / Developer : Paras Pranav` |
| HTTP parity | local `0.0.0.0:8080`: root, `?world=c10_carbon&spread=0`, `?projector=1`, `?pack=1`, `/publish/index.html` all **200** and byte-identical to root. The managed `*.e2b.app` preview host is token-gated (`e2b-traffic-access-token` supplied by the browser preview), not a public HTTP endpoint. |
| Evidence sheet | `qa/contact.png` **(1480 × 5276), 79 shots**, plus `qa/r6_contact.png` (12 shots) |

The zip is regenerated with fresh archive timestamps, so its SHA-256 is not used as the immutable artifact identity. The root/publish `index.html` SHA-256 above is the identity to which durable QA evidence is hash-tagged.

---

## 2b. Student-facing academic library dashboard (additive)

The world view now opens on a navy/indigo + warm-paper **two-page library dashboard**: two large, separately clickable **Class IX** and **Class X** textbook cards with inline SVG covers, "inside this book" chapter previews and a miniature printed-page / 3D-diagram spread. Clicking a class opens that class's chapter drawer (13 assessed NCERT chapters each); clicking a chapter calls the unchanged `openChapter()` controller and opens the existing 3D flipbook. The old left hanging Carbon chapter-list panel has been retired from the default landing; the original 3D meta-world (floating monoliths, chapter HUD) is intact behind **Explore 3D shelf ↗** and `?shelf=1`. `#btnEnter`, `setView`, both HUDs, `EV.view`, `WORLD.view`, the chapter picker, page-turn physics and every QA contract are preserved. No new runtime library, script block, network reference, image, font, GLB/GLTF or second canvas was added. Bilingual labels go through `EVDICT`; `qa/library_smoke.js` is the hash-tagged regression gate.

**Follow-up polish (same audit date).** A global **⌂ Home** button in the student top bar (plus the clickable EduVerse logo and `Alt+H`) returns to the dashboard from the flipbook, every full-screen tool screen, the chapter drawer and the 3D shelf. Because opt-in projector mode and help modals hide / cover the top bar, a single compact high-contrast **⌂ floating Home** control (`#btnHomeFloat`) is shown there too, leaving projector mode and dismissing the modal on the way home. The right-page 3D viewport no longer prints the `REALTIME THREE.JS · WEBGL` / `ULTRA 3D · MODEL RISING FROM THIS PAGE` watermark; only the live 3D plane and its honest grid fallback remain. The old bottom "Carbon and its Compounds / Open book" resume bar was removed entirely: that band is now free, the two textbook pages are taller, and the `Open book →` action lives in the dashboard header (its `#btnEnter` contract stays visible for the QA harness). The original 3D shelf keeps its own `Open book →` button.

---

## 3. Deterministic chain — all local gates PASS

| Command / evidence | Result |
|---|---|
| `make NODE=… p5` | EXIT0: generator self-test `33079 bytes / sections 8 / blocks 6 / quiz 20 / pdfTextOnly true / ocr false`; pack smoke `problems 0 / console errors 0 / external 0 / deferred 0` |
| `make qa arch bio state engines bind o3 projector shots publish` | EXIT0: `qa/results.json` **25 sections / ERRORS []**; `qa/qa-error.log` **0 bytes**; architecture **33 chapters / 266 spreads / 5,054 checks / 0 failures**; biology **73 spreads / 21 NCERT models / bad []**; engines/bind/O3/projector PASS; `publish_smoke.js` RESULT PASS |
| `make state` | EXIT0: `qa/state_machines.json` **21 machines / 67 states / 92 events / 30 guards / 6 persisted / 10 capsule machines / 4 presets**; `qa/r8_state_result.json` **106** exhaustive transitions PASS |
| `make visual` | EXIT0: **6 combos × 266 spreads**, `problems 0 / outside 0 / overlaps 0 / runtime 0`; detail minFont **12px**, EN/HI 30 FT minFont **14px**, both 30 FT minFont **12px** |
| `qa/o3_layout_smoke.js` | PASS: **6 cases / 0 problems / 0 errors**; O3 lane owns its CSS width, full-copy dock, no clipping |
| `qa/compiled_upload_smoke.js` | PASS: **12 cases / 17 spreads / 9 validator passes / 0 problems / 0 warnings**; pasted text and WorldSpec JSON compile; script/image payloads rejected |
| `qa/sustainable_model_smoke.js` | PASS: **4 lesson-specific NCERT models / 12 mode combinations / 0 problems**; `resource_plan`, `forest_conservation`, `water_harvest`, `fossil_3r` |
| `qa/full_visual_smoke.js` | PASS: **33 worlds / 266 spreads / bad 0 / runtime 0 / errors 0**; literal `$` sweep retained |
| `qa/library_smoke.js` (`make library`) | PASS: **Class IX/X dashboard** — 2 independent inline-SVG textbook cards, 13-chapter drawer per class, 26 assessed chapters, chapter → original flipbook, EN/HI/both dictionary parity, preserved 3D shelf, deep links, 1024/820/414 px overflow, 0 console errors / 0 external refs / 1 canvas |
| `make launch-smoke` | PASS: Node **24.22.2**, Playwright **1.65.0**, Chromium Headless Shell **158**; gzip **803,178 bytes**, median load **1,331 ms**, max **1,415 ms**, FCP **124 ms**, 3 cold loads; **0** console errors, warnings, deprecations, CSP violations, external requests, failed requests or page errors |
| `python3 tools/launch_gate.py` | PASS: **117 checks / 0 QA npm vulnerabilities / 0 OSV target advisories / 0 deprecations / 0 secrets**; `nginx -t` successful on an unprivileged temporary high-port wrapper |
| `python3 verify.py` | `RESULT PASS`: **19 schemas**, **35 docs / 323 links**, **25 sections / ERRORS []**, root/publish parity, CSP, launch evidence, eight hash-tagged visual/dashboard/pilot gate JSONs |
| `make launch` | EXIT0: build + publish + eight visual/dashboard/pilot gates + launch smoke + 117-check gate + verify |
| `make contact` | EXIT0: `qa/finalize.py` fresh evidence, `HTTP 200 4564451 IDENTICAL`, 79-shot contact sheet |

---

## 4. Visual / text contract — closed without relaxing gates

The launch-day visual work closed the following defects without truncation, without relaxing `no printed text overlap`, `outside`, `BIG_ZONES`, `MIN_SCREEN_PX_BIG`, or minimum-font gates, and without reintroducing duplicate orbit rings:

1. Full-copy bilingual prediction cards wrap and use three independent option columns with a **12px printed hard floor**.
2. The formula box and following KEY FACT block are separated by the measured formula bottom; no fixed-height clipping.
3. `src/figure3d.js` uses one compact decorative orbit ring, an iterative transformed `Box3` fit to `VIEWPORT_LIMIT − FIT_EPS`, and a final 0.5% safe-scale correction.
4. `EVCHECKS.plate()` rejects any printed secondary run below **12px**; the DOM dock scrolls full copy rather than clipping it.
5. The O3 ray-lab panel owns a real CSS lane; `#gl` and `.dock` stop before the panel. Later language/projector/theme CSS cannot reintroduce ellipsis, `nowrap`, line-clamp or hidden fixed-height text.
6. The 30 FT threshold is **stage-aware**: `need = (big ? 26 : 16) × min(1, stageViewport / 1440)`; the body-overflow bound remains the full viewport. `MIN_PRINTED_PX = 12`, `MIN_FRACTION = 0.82`, `BIG_ZONES` remain enforced.
7. The light/high-contrast palette gate is explicitly the **classroom projector** contract. The dark studio authoring chrome is intentional and exempt from classroom light-chrome checks; paper contrast, geometry, full copy, 12px floor and 30 FT type still apply in studio.
8. `figureRect()` derives the live 3D plane from the printed viewport: **692×360** with 4–6 labels in two chip rows, **692×444** with ≤3 labels in one row. `boardAudit().figureViewport.exact` and `EVCHECKS.plate()` reject any mismatch.
9. `c10_sustainable` now has four chapter-first NCERT models with eight bilingual parts each, two aligned 4+4 columns and one declarative 3D/2D spec: `resource_plan`, `forest_conservation`, `water_harvest`, `fossil_3r`.
10. Compiled text/JSON upload builds 17 spreads, passes 9/9 validator checks, shares one WebGL canvas/context with the O3 lane, and the generated WorldSpec JSON is no longer overwritten by the i18n placeholder.
11. Studio keeps the compact 202px dock, ≥82% book width and readable 30 FT type.

Durable evidence, all `RESULT PASS`, `generatedAt 2026-11-03`, hash-tagged to sha `3bab…`:

| Gate | Evidence |
|---|---|
| 6-mode visual matrix | `qa/visual_matrix_result.json` |
| O3 lane / full-copy UI | `qa/visual_layout_result.json`, `qa/visual-layout-o3.png` |
| Compiled text/JSON upload | `qa/compiled_upload_result.json`, `qa/shot-compiled-upload.png` |
| Lesson-specific sustainable models | `qa/sustainable_model_result.json`, `qa/shot-c10-sustainable-0..3.png` |
| 33-chapter full visual + literal-`$` sweep | `qa/full_visual_result.json` |

Screenshot evidence also includes `qa/shot_c10_electricity.png` and `qa/shot-c10-electricity.png`. `qa/sustainable_model_validation.json` is a stale diagnostic and must not be cited.

---

## 5. Dependency, security and deployment posture

- `qa/dependency_osv.json` queries the **seven pinned targets**: `jsonschema==4.26.0`, `Pillow==13.0.0`, Node `24.22.2`, Playwright `1.65.0`, Three.js `0.187.0`, `qrcode-generator 1.4.4`, and the pinned nginx digest. Pillow `12.3.0` was rejected because **59** advisories were fixed in `13.0.0`; current target advisories: **0**.
- `qa/npm_audit.json` reports **0** for the **QA npm lock only**. This is not a global vulnerability claim.
- `qa/vendor_hashes.json` records five vendored source hashes; `qa/env_inventory.json` records **0** production/build env vars, **0** secrets, API keys, service accounts, backend endpoints or `.env` files. The QA-only variables are `COMBOS`, `PUB_URL`, `QA_URL`; infrastructure-only variables are `NODE_PATH`, `PLAYWRIGHT_BROWSERS_PATH`.
- `publish/Dockerfile` is digest-pinned to `nginx:1.30.6-alpine`; `publish/compose.yaml` is `read_only`, drops all capabilities, sets `no-new-privileges`, and defines no secrets. `nginx -t` was validated locally through a temporary `listen 18080;` wrapper because port 80 is unprivileged in this sandbox. The container image was not deployed or CVE-scanned.
- `publish/_headers` and `publish/nginx.conf` are regenerated from the same `qa/csp_hashes.json` policy evidence. A meta CSP cannot supply `frame-ancestors` or HSTS; those remain HTTP-header responsibilities.
- XSS probes cover URL, five `localStorage` keys and the chapter compiler, plus `<img onerror>`/`<script>` payloads. They pass for those specific probes; absolute XSS safety is not claimed.
- `style-src 'unsafe-inline'` is retained deliberately. **Never** add script `unsafe-inline` or a CDN/remote font/analytics request; either would break the strict script-hash / 0-external-refs contract.

---

## 6. Source-of-truth limitation for Prompt 5

Connected Google Drive searches found generic educational prompt repositories, CBSE/NCERT-related documents and commerce/accountancy material, but no project-specific Master Engine/EVPACK specification, no exact verbatim “Prompt 5”, no EduVerse/EVPACK/Master Engine document, and no official CBSE project PDF. The shipped implementation therefore uses a working default:

- `tools/generate_chapter_pack.py` → 29 text-only EVPACK v2 packs, 580 bilingual MCQs, 1,166,748 inert bytes, `ocr:false`, parsed on demand by `EVLAZY`;
- four procedural organs (heart, lungs, nephron, villus) on the shared WORLD renderer, with `0` GLB/GLTF and `0` external refs — this resolves the GLTF organ request under the standing no-GLB/GLTF rule, but is **not explicit owner approval**;
- O3 electricity primitives and the optics grammar `1/v + 1/u = 1/f` unchanged.

“Baki sab thik hai” is treated as preserving already-working behavior, not as approval of inferred Prompt 5 wording. If the exact instruction is supplied, a final wording/scope diff remains required.

---

## 7. Owner decisions still required before final sign-off

| Decision | Current state |
|---|---|
| Exact verbatim Prompt 5 | ❌ Not supplied; working default only |
| Official CBSE project PDF | ❌ Not found |
| Procedural organs / text-only EVPACK as final scope | ❌ Not explicitly approved |
| Public host, DNS, TLS, CDN/WAF, credentials | ❌ Not supplied |
| Production HTTPS/TLS, CDN/WAF, uptime, rollback drill | ❌ Not exercised |
| Container-image/host CVE scan, real GPU, Firefox/Safari, screen-reader journey | ❌ Not exercised |
| Final owner sign-off | ❌ **PENDING** |

`docs/OPEN_ITEMS.md` OI-07 remains blocked on a target host. `DOCS.md` and `PROJECT_MANIFEST.json` now state local deterministic PASS and public-deployment-pending status. No file in this repository should be described as “ready to launch”, “final signed off”, “absolutely XSS-safe”, “optimally performant”, or “0 global vulnerabilities”.

---

## 7b. IX `c9_cell` 2D/3D pilot candidate — teacher sign-off PENDING

The owner chose scalable inline vector plates, the `c9_cell` pilot, a page-bar 2D/3D toggle and per-chapter teacher-team sign-off. Only the 11-topic pilot is implemented. `qa/plate2d_result.json` and `qa/plate2d_shots_result.json` are hash-tagged to the current bundle and report 11 / 11 keys, 66 / 66 printed-plate audits, 11 fresh-boot plate captures, one canvas, 0 external requests, 0 console/page errors, default live 3D, 2D→3D restore, shared-capsule restore and deferred-chapter protection. `qa/plate2d-pilot-contact.png` shows all 11 plates for review.

`docs/2D_PLATE_PILOT_REVIEW.md` keeps subject / NCERT, EN/HI, visual and machine passes unsigned until the life-science teacher team signs. The 229 other assessed topics are deferred; literal 8K rasters, external assets, a new runtime library and a second canvas / renderer remain out. This local machine PASS is **not** teacher approval, final owner sign-off or public deployment.

---

## 8. Final local conclusion

**LOCAL DETERMINISTIC PASS.** The current `index.html` / `publish/index.html` artifact, strict CSP, inert packs, docs/schemas/manifest, eight visual/dashboard/pilot gates, browser launch smoke, 117-check launch gate, `verify.py`, HTTP parity and 79-shot contact sheet are fresh and mutually consistent. The Makefile no longer prints “ready to publish”; it prints an explicit local-pass / deployment-pending message.

**FINAL OWNER SIGN-OFF: PENDING.** Do not deploy, do not claim production readiness, and do not treat this local pass as approval of the inferred Prompt 5 scope until the owner supplies the exact verbatim instruction, the official project PDF if one exists, explicit approval of the procedural default, and a public deployment target with credentials and validation evidence.
