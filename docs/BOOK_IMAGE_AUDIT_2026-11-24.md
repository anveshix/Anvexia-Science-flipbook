# Book illustration and index audit — 2026-11-24

## Deployment evidence

- GitHub Pages is configured to publish `main` at `/`. The latest reported successful build used `13412b2c8d1b61e5266198a939d10c7d6781eba8`, the merge of PR #17. The repository tree contains `.nojekyll` and 278 shared WebPs under `assets/2d/rx/`.
- The public HTML was retrieved and includes the current Anvexia dashboard. This does **not** establish that every deployed image loads or that the live page renders correctly in a user's browser. Direct access to the live WebP and the Pages build artifact was unavailable from this environment, so the live cause is not established.
- `build.py` injects the realistic plate mapping into the generated root `index.html`; the images remain separate files, requested using relative URLs. A hard refresh of HTML alone cannot fix a missing or blocked image request. The publish archive regression verifies byte parity for all 278 WebPs and 274 JPEGs in an extracted local package.

## Reproduced defects and changes

- In the saved `studio` theme, choosing a 2D plate left the 3D pop-up visible and the page texture printed a grid instead of the topic image. The still-page HTML overlay masked this until a page turn or other overlay-suppressed state. Studio page textures now use the same raster viewport as classroom pages, and the popup is hidden for 2D unless ULTRA is explicitly active.
- Studio image loads did not schedule texture repaint. Also, a shared image that completed after a chapter change could fail to repaint the new chapter. Image completion now queues a repaint for the current 2D page in either theme.
- An image failure could silently leave a vector diagram in place. The book now reports the failure and selecting 2D retries the image and clears failed texture-cache entries. Selecting 2D also exits ULTRA and precision modes, so that selection actually reveals the plate.

## Verification and limits

- `qa/book_raster.js` exercises default 2D images, saved studio mode, page turns and texture drawing, deliberate 3D and ULTRA modes, a simulated image 404 followed by retry, and delayed loading of a shared image across chapter changes. It checks the actual image drawn to the page canvas as well as the visible overlay.
- Browser and package checks are local tests. They cannot establish whether any of these defects caused the user's observed live GitHub Pages issue. After these changes are merged and deployed, verify using the affected live URL, browser, chapter and section; inspect the image request status if the warning appears.
