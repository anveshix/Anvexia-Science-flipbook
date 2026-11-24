#!/usr/bin/env node
/* Real Chromium checks against a served, extracted publish ZIP (QA_BASE).
 * Requires Playwright and an installed Chromium; QA_REQUIRE_BROWSER=1 makes
 * a missing Playwright dependency an error instead of a source-only skip.
 * QA_CHROMIUM_EXECUTABLE can point to a local Chromium headless binary.
 */
const assert = require('assert');
let playwright;
try { playwright = require('playwright'); } catch (_) {}
if (!playwright) {
  if (process.env.QA_REQUIRE_BROWSER === '1') { console.error('FAIL publish_browser_smoke: playwright not installed'); process.exit(1); }
  console.log('SKIP publish_browser_smoke: playwright not installed'); process.exit(0);
}
const base = process.env.QA_BASE || 'http://127.0.0.1:8080/';
const options = {
  ...(process.env.QA_CHROMIUM_EXECUTABLE ? { executablePath: process.env.QA_CHROMIUM_EXECUTABLE } : {}),
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
};

(async () => {
  const browser = await playwright.chromium.launch(options);
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    const errors = [], badResponses = [], external = new Set();
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => { if (new URL(r.url()).origin !== new URL(base).origin && /^https?:/.test(r.url())) external.add(r.url()); });
    page.on('response', r => { if (r.status() >= 400) badResponses.push(`${r.status()} ${r.url()}`); });
    await page.goto(base + '?mode=2d', { waitUntil: 'load' });
    await page.locator('#btnLibFlipbook').click();
    assert(await page.locator('#svFlipbookModal').isVisible());
    await page.locator('#svFlipChapter').selectOption('c9_cell');
    await page.waitForFunction(() => document.querySelector('#svFlipCounter').textContent.includes('2.1'));
    const host = page.locator('.svf-plate-host[data-svf-sp="0"]');
    await host.locator('img').waitFor({ state: 'visible' });
    await page.locator('[data-svf-zoom="0"]').click();
    assert(await page.locator('.evzoom').isVisible());
    await page.locator('.evzoom .ev-label-hit').first().click();
    assert(await page.locator('.evzoom .ev-label-pop').isVisible());
    await page.locator('.evzoom-close').click();
    const before = await host.locator('img').getAttribute('src');
    await page.locator('[data-svf-cycle="0"]').click();
    await page.waitForFunction(old => document.querySelector('.svf-plate-host[data-svf-sp="0"] img').getAttribute('src') !== old, before);
    assert.notEqual(await host.locator('img').getAttribute('src'), before);
    // A fresh chapter should start with its own first image, not inherit
    // another chapter's supplement index.
    await page.locator('#svFlipChapter').selectOption('c10_carbon');
    const newChapterSrc = await page.locator('.svf-plate-host[data-svf-sp="0"] img').getAttribute('src');
    const expectedFirst = await page.evaluate(() => EVPLATE_SRC('c10_carbon', EVRASTER.filesFor('c10_carbon', getWorld('c10_carbon').spreads[0].section)[0]));
    if (newChapterSrc !== expectedFirst) errors.push(`Chapter switch inherited image cycle: got ${newChapterSrc}, expected ${expectedFirst}`);
    // Return to Cell for the remaining control checks.
    await page.reload({ waitUntil: 'load' });
    await page.locator('#btnLibFlipbook').click();
    await page.locator('#svFlipChapter').selectOption('c9_cell');
    await page.locator('#svFlipLangBtn').click();
    assert.equal(await page.evaluate(() => EV.lang), 'hi');
    await page.locator('#svFlipLangBtn').click();
    assert.equal(await page.evaluate(() => EV.lang), 'en');
    await page.locator('#svFlipLangBtn').click();
    assert.equal(await page.evaluate(() => EV.lang), 'both');
    await page.locator('.svf-left-page[data-spread="0"] .svf-opt').first().click();
    assert(await page.locator('.svf-left-page[data-spread="0"] .svf-explain').isVisible(), 'prediction explanation not shown');
    await page.locator('#svFlipNext').click();
    await page.waitForFunction(() => document.querySelector('#svFlipCounter').textContent.includes('2.2'), null, { timeout: 5000 });
    await page.locator('#svFlipClose').click();
    await page.locator('#svLibSearchBtn').click();
    for (const term of ['cell', 'कोशिका']) {
      await page.locator('#svSearchInput').fill(term);
      await page.waitForSelector('#svSearchResults .sv-hit');
      assert((await page.locator('#svSearchResults .sv-hit').count()) > 0, `no search result for ${term}`);
    }
    // In 2D-only mode the "Open" action routes to the flipbook and the
    // redundant 2D button is intentionally hidden.
    await page.locator('#svSearchResults button[data-hit-3d]').first().click();
    if (!(await page.locator('#svFlipbookModal').isVisible())) errors.push('Search result Open did not open the flipbook in 2D mode');
    // Clear the illustration cycle index before testing first views.
    await page.reload({ waitUntil: 'load' });

    // Exercise every first-view plate through the actual flipbook DOM against
    // the extracted archive. openFlipbook is used for coverage, not as a claim
    // that every navigation path has been manually exercised.
    const chapters = await page.evaluate(() => CATALOGUE_ALL.map(c => [c.id, getWorld(c.id).spreads.length]));
    let views = 0;
    for (const [id, count] of chapters) {
      for (let i = 0; i < count; i++) {
        await page.evaluate(([id, i]) => SCIVERSE.openFlipbook(id, i), [id, i]);
        const image = await page.evaluate(async i => {
          const img = document.querySelector(`.svf-plate-host[data-svf-sp="${i}"] img`);
          if (!img) return { error: 'no image element' };
          try { await img.decode(); } catch (e) { return { error: e.message, src: img.src }; }
          return { src: img.getAttribute('src'), width: img.naturalWidth, height: img.naturalHeight,
            missing: img.closest('.svf-plate-wrap').classList.contains('svf-missing') };
        }, i);
        assert(!image.error && image.width > 0 && image.height > 0 && !image.missing && image.src.includes('/rx/'),
          `${id} spread index ${i}: ${JSON.stringify(image)}`);
        views++;
      }
    }
    assert.equal(views, 266);
    console.log(`Checked Chromium ${browser.version()}: 33 chapters / ${views} first-view WebPs decoded from extracted package; navigation, zoom, hotspot, image cycle, prediction and EN/HI controls exercised`);
    if (errors.length || badResponses.length || external.size) {
      console.error('FAIL publish_browser_smoke:', JSON.stringify({ errors, badResponses, external: [...external] }, null, 2));
      process.exitCode = 1;
    } else {
      console.log('PASS publish_browser_smoke: search and all checks passed; no page/HTTP/external-request errors');
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
