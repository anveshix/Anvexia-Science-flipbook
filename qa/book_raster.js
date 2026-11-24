#!/usr/bin/env node
/* Exercise the standard book's raster overlay, including a Pages project path.
   QA_BASE may point to the deployed/extracted site (include trailing slash). */
const assert = require('assert');
let playwright;
try { playwright = require('playwright'); } catch (_) {}
if (!playwright) {
  if (process.env.QA_REQUIRE_BROWSER === '1') { console.error('FAIL book_raster: playwright not installed'); process.exit(1); }
  console.log('SKIP book_raster: playwright not installed'); process.exit(0);
}
const base = process.env.QA_BASE || 'http://127.0.0.1:8080/';
(async () => {
  const browser = await playwright.chromium.launch({
    ...(process.env.QA_CHROMIUM_EXECUTABLE ? { executablePath: process.env.QA_CHROMIUM_EXECUTABLE } : {}),
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  });
  const page = await browser.newPage({viewport: {width: 1280, height: 900}});
  await page.addInitScript(() => {
    window.__rasterDraws = [];
    const original = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function(image, ...args) {
      if (image instanceof HTMLImageElement && /\/assets\/2d\/rx\//.test(image.src)) window.__rasterDraws.push(image.src);
      return original.call(this, image, ...args);
    };
  });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  async function assertRaster(label) {
    await page.waitForFunction(() => EV.view === 'book' && WORLD.plate2d && EVRASTER.isVisible() && document.querySelector('#aiDraftImage').naturalWidth > 0, null, {timeout: 30000});
    const state = await page.evaluate(() => ({
      image: document.querySelector('#aiDraftImage').src,
      expected: new URL(EVPLATE_SRC(EV.world.id, EVRASTER.fileFor(EV.world.id, EV.world.spreads[WORLD.index].section)), location.href).href,
      chapter: EV.world.id, section: EV.world.spreads[WORLD.index].section
    }));
    assert.strictEqual(state.image, state.expected, label + ': wrong image');
    assert(state.image.startsWith(new URL('assets/2d/rx/', base).href), label + ': expected shared WebP under deployment path');
    console.log(`  ${label}: ${state.chapter} ${state.section} ${state.image}`);
  }
  try {
    await page.goto(base + '?mode=3d&world=c10_carbon', {waitUntil: 'load'});
    await assertRaster('book deep link');
    await page.evaluate(() => WORLD.jumpTo(2));
    await assertRaster('page jump');
    await page.locator('#plate3d').click();
    assert.strictEqual(await page.evaluate(() => !WORLD.plate2d && !EV.prefer2d), true, 'explicit 3D mode');
    await page.evaluate(() => WORLD.jumpTo(4));
    assert.strictEqual(await page.evaluate(() => !WORLD.plate2d && !EV.prefer2d), true, 'page navigation must preserve explicit 3D mode');
    await page.locator('#plate2d').click();
    await assertRaster('return to 2D');
    await page.evaluate(() => openChapter('c9_cell'));
    await assertRaster('chapter change');
    await page.goto(base + '?mode=3d', {waitUntil: 'load'});
    await page.locator('#classCardIX').click();
    await page.locator('#ldList [data-ch]').first().click();
    await assertRaster('library chapter entry');

    // A saved studio theme used to leave a raised model visible in 2D mode
    // and paint only a grid on the page/turning leaf instead of the image.
    await page.evaluate(() => localStorage.setItem('eduverse-theme-v1', 'studio'));
    await page.goto(base + '?mode=3d&world=c10_light', {waitUntil: 'load'});
    await assertRaster('saved studio theme');
    await page.waitForFunction(() => window.__rasterDraws.some(s => s === document.querySelector('#aiDraftImage').src), null, {timeout: 30000});
    assert.strictEqual(await page.evaluate(() => WORLD.boardDebug().popupVisible), false, 'studio 2D must not show a raised 3D model');
    await page.evaluate(() => WORLD.startTurn(1));
    await page.waitForFunction(() => WORLD.index === 1 && !WORLD.turning, null, {timeout: 30000});
    await assertRaster('studio page turn');
    await page.waitForFunction(() => window.__rasterDraws.some(s => s === document.querySelector('#aiDraftImage').src), null, {timeout: 30000});
    assert.strictEqual(await page.evaluate(() => WORLD.boardDebug().popupVisible), false, 'page turn must not restore 3D model in 2D mode');
    await page.locator('#plate3d').click();
    assert.strictEqual(await page.evaluate(() => WORLD.boardDebug().popupVisible), true, 'explicit studio 3D selection restores the model');
    await page.locator('#btn3d').click();
    assert.strictEqual(await page.evaluate(() => EV.ultra), true, 'ULTRA 3D must remain available');
    await page.locator('#plate2d').click();
    await assertRaster('2D after ULTRA');
    assert.strictEqual(await page.evaluate(() => !EV.ultra && !WORLD.boardDebug().popupVisible), true, '2D selection must exit ULTRA');

    // A failed image request must be reported, and clicking 2D must retry
    // both the overlay and the page texture rather than retaining a failure.
    const blocked = '**/assets/2d/rx/covalent.webp';
    await page.route(blocked, route => route.fulfill({status: 404, body: 'missing'}));
    await page.goto(base + '?mode=3d&world=c10_carbon', {waitUntil: 'domcontentloaded'});
    await page.waitForFunction(() => document.querySelector('#toast.show')?.textContent.includes('Image unavailable'), null, {timeout: 30000});
    await page.unroute(blocked);
    await page.locator('#plate2d').click();
    await assertRaster('retry after failed image request');
    await page.waitForFunction(() => window.__rasterDraws.some(s => s === document.querySelector('#aiDraftImage').src), null, {timeout: 30000});

    // The same WebP belongs to two chapters. Hold its first request while
    // navigating between them; the shared cache must repaint the new page.
    let releaseImage, signalStarted;
    const hold = new Promise(resolve => { releaseImage = resolve; });
    const started = new Promise(resolve => { signalStarted = resolve; });
    await page.route(blocked, async route => { signalStarted(); await hold; await route.continue(); });
    try {
      await page.goto(base + '?mode=3d&world=c10_carbon', {waitUntil: 'domcontentloaded'});
      await Promise.race([started, new Promise((_, reject) => setTimeout(() => reject(new Error('shared image request did not start')), 30000))]);
      await page.evaluate(() => {
        openChapter('c9_atomic_foundations');
        const idx = EV.world.spreads.findIndex(sp => sp.section === '9.5');
        if (idx < 0) throw new Error('shared image test spread not found');
        WORLD.jumpTo(idx);
      });
      releaseImage();
      await assertRaster('delayed shared image after chapter change');
      await page.waitForFunction(() => window.__rasterDraws.some(s => s === document.querySelector('#aiDraftImage').src), null, {timeout: 30000});
    } finally { releaseImage(); await page.unroute(blocked); }
    assert.deepStrictEqual(errors, []);
    console.log('PASS book_raster: entry, navigation, studio textures, mode controls, failed retry and delayed shared image');
  } finally { await page.close(); await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
