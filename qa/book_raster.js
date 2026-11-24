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
    assert.deepStrictEqual(errors, []);
    console.log('PASS book_raster: deep link, library entry, navigation, chapter change and explicit 3D preference');
  } finally { await page.close(); await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
