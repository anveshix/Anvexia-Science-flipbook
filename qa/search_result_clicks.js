#!/usr/bin/env node
/* Test mouse activation of search results in 2D-only and standard modes. */
const assert = require('assert');
let playwright;
try { playwright = require('playwright'); } catch (_) {}
if (!playwright) {
  if (process.env.QA_REQUIRE_BROWSER === '1') { console.error('FAIL search_result_clicks: playwright not installed'); process.exit(1); }
  console.log('SKIP search_result_clicks: playwright not installed'); process.exit(0);
}
const base = process.env.QA_BASE || 'http://127.0.0.1:8080/';
(async () => {
  const b = await playwright.chromium.launch({
    ...(process.env.QA_CHROMIUM_EXECUTABLE ? { executablePath: process.env.QA_CHROMIUM_EXECUTABLE } : {}),
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  });
  try {
    for (const [mode, selector, flip] of [
      ['2d', '.sv-hit-main', true],
      ['2d', '.sv-hit-thumb', true],
      ['2d', 'button[data-hit-3d]', true],
      ['standard', 'button[data-hit-2d]', true],
      ['standard', 'button[data-hit-3d]', false]
    ]) {
      const p = await b.newPage({viewport: {width: 1280, height: 720}});
      const errors = [];
      p.on('pageerror', e => errors.push(e.message));
      await p.goto(base + (mode === '2d' ? '?mode=2d' : ''), {waitUntil: 'load'});
      await p.locator('#svLibSearchBtn').click();
      await p.locator('#svSearchInput').fill('cell');
      await p.waitForSelector('#svSearchResults .sv-hit');
      const section = await p.locator('#svSearchResults .sv-hit-ch').first().getAttribute('data-section');
      await p.locator('#svSearchResults ' + selector).first().click();
      await p.waitForFunction(() => document.getElementById('svSearchModal').hidden);
      if (flip) {
        assert(await p.locator('#svFlipbookModal').isVisible(), `${mode} ${selector}: flipbook did not open`);
        assert((await p.locator('#svFlipCounter').innerText()).startsWith(section + ' ·'), `${mode} ${selector}: wrong spread`);
      } else {
        // Adjacent 3D pages turn asynchronously before WORLD.index changes.
        await p.waitForFunction(section => EV.view === 'book' && EV.world.spreads[WORLD.index].section === section, section, { timeout: 15000 });
        assert.equal(await p.evaluate(() => EV.world.spreads[WORLD.index].section), section, 'wrong 3D spread');
      }
      assert.deepEqual(errors, []);
      await p.close();
    }
    console.log('PASS search_result_clicks: title, thumbnail and Open in 2D mode; 2D and 3D buttons in standard mode open the selected spread');
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
