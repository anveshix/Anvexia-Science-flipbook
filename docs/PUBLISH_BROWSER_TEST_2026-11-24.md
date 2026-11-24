# Extracted publish package: browser test — 24 November 2026

## Result: not release-ready

Real headless Chromium testing of the **extracted ZIP** found three user-facing issues. No application bugs were fixed in this test pass. This is a focused package/interaction test, not a complete science, accessibility, device or production-readiness review.

- ZIP tested: `eduverse-publish.zip`, SHA-256 `fa3322aaa20544206c6b37bf3dcbc8488a384c340151b1e880b21ea8be68e1a2`.
- `index.html` inside ZIP: SHA-256 `93a18d18602ff00a12c461772ac4050d7dbc8c87fc50808c0cfacfe51239f95d`.
- Environment: Linux, headless Chromium 153.0.8010.0, Playwright; SwiftShader software rendering; extracted ZIP served over local HTTP. Desktop 1280×720; 1440×900 for the sampled 3D/geometry check; emulated 390×844 mobile for geometry and sampled flipbook layout. This is not a physical phone, hardware GPU or cross-browser test.

## Confirmed issues

### High — Search result click does not open the result

In 2D-only mode, open Search, search for `cell` or `कोशिका`, and click the first result's **Open** button or title: the search remains open and no flipbook opens. Pressing Enter in the search input does open the selected result. Source inspection shows result handlers access `el.dataset.hit3d` / `el.dataset.hit2d` for `data-hit-3d` / `data-hit-2d`; the DOM dataset keys retain the hyphen before a digit (`hit-3d` / `hit-2d`), so those property accesses are undefined. The numeric conversion produces `NaN`, and `activateSearchHit` receives no result. `src/sciverse.js`, search result handler section. Similar mouse handlers exist for both 2D and 3D actions, though the reported browser reproduction was in 2D-only mode.

### High — Some laptop flipbook pages clip content

`qa/flipbook_layout.js` reported 17 overflowing views at 1280×720: Class IX Disease spreads 1–3; Class X Carbon spreads 1–3, 5, 7, 9–16; Class X Light spread 8. Example: open `c10_carbon` spread index 8 (§4.3.1), bilingual mode: the left page remains 672 px tall inside a 613 px container after a five-second wait, with `--fs: 0.72`; the lower prediction options are visibly cut off. `src/sciverse.js` stops reducing the font scale at 0.72; `.svf-page-inner` hides overflow. Fix should preserve readable text and usable controls rather than merely shrinking indiscriminately. Test also covers a phone-sized sample of the first four chapters; this is not an exhaustive mobile test.

### Medium — Image selection leaks across chapters

In the 2D flipbook, select Cell, use the image-cycle button on its first spread, then select Carbon. Carbon's first spread starts at **2 / 2**, showing the JPEG rather than its first WebP (`assets/2d/rx/covalent.webp`). The image index is stored by spread index in a shared `flipPlateIdx` object (`src/sciverse.js`), so switching chapters carries a previous selection into an unrelated chapter. This is distinct from the fixed ZIP omission: the images are present, but first-view ordering can be wrong after navigation.

## What passed

- All **266** mapped first-view WebPs decoded from the extracted ZIP across 33 chapters in a fresh 2D session. Coverage used `SCIVERSE.openFlipbook` to visit every spread programmatically; it does not prove every navigation path or semantic correctness. No HTTP error or external network request was recorded in that test. User-facing controls were separately exercised for a sample.
- Sampled UI: open flipbook, choose chapter, enlarge image, open a hotspot, cycle image, submit a prediction, navigate to next spread, cycle all three language settings; English/Hindi search returned results, although clicking them failed as above.
- `qa/label_geometry.js`: desktop and emulated mobile geometry passed for 552 metadata images / 1,762 hotspot boxes, including popup and bilingual information checks. It tests overlay geometry in a shared rendered host, not scientific accuracy or every actual image/label target visually.
- Sample 3D mode (`c10_control`, spread index 2): WebGL context available under SwiftShader; local 2D plate decoded, zoom showed six hotspots, switching to 3D changed the plate state; no JavaScript page errors observed in that sample. This is not a hardware GPU or all-scene test.
- The ZIP includes the referenced JPEGs and WebPs, and extracted HTTP byte parity / missing-asset negative tests passed in the previous packaging pass.

## Reproduction / follow-up

1. Extract the tested ZIP to a local directory and serve it over HTTP; point `QA_BASE` to that server.
2. Install Playwright and a compatible Chromium plus system libraries. Run with `QA_REQUIRE_BROWSER=1` so lack of Playwright is a failure, not a skip. If needed set `QA_CHROMIUM_EXECUTABLE` to the browser path.
3. Run `node qa/publish_browser_smoke.js`, `node qa/label_geometry.js`, and `node qa/flipbook_layout.js` with those environment variables. The first and last currently fail for the confirmed issues above; these are regression checks, not evidence of successful tests until corrected.
4. Fix search result handlers and chapter image-index state, design an accessible solution for overflowing pages, rebuild and regenerate ZIP, then rerun these tests against the new extracted artifact. Repeat on real devices/browsers and complete science, Hindi and accessibility review before release.
