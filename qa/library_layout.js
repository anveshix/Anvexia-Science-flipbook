#!/usr/bin/env node
/* Compact library layout and navigation in desktop and emulated phone views. */
const assert = require('assert');
let playwright;
try { playwright = require('playwright'); } catch (_) {}
if (!playwright) {
  if (process.env.QA_REQUIRE_BROWSER === '1') { console.error('FAIL library_layout: playwright not installed'); process.exit(1); }
  console.log('SKIP library_layout: playwright not installed'); process.exit(0);
}
const base = process.env.QA_BASE || 'http://127.0.0.1:8080/';
(async () => {
  const b = await playwright.chromium.launch({
    ...(process.env.QA_CHROMIUM_EXECUTABLE ? { executablePath: process.env.QA_CHROMIUM_EXECUTABLE } : {}),
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  });
  try {
    for (const [name, width, height, mode] of [['desktop', 1440, 900, '3d'], ['laptop', 1024, 768, '2d'], ['tablet', 820, 900, '2d'], ['phone', 390, 844, '2d'], ['small-phone', 360, 640, '2d'], ['narrow-phone', 320, 640, '2d']]) {
      const p = await b.newPage({ viewport: { width, height }, isMobile: width < 500, hasTouch: width < 500 });
      const errors = [];
      p.on('pageerror', e => errors.push(e.message));
      await p.goto(base + '?mode=' + mode, { waitUntil: 'load' });
      await p.waitForSelector('#classCardX');
      assert.equal(await p.title(), 'Anvexia — Science, brought to life.');
      assert.equal(await p.locator('.brand-name').innerText(), 'Anvexia');
      assert.equal(await p.locator('.lp-cover text').first().textContent(), 'ANVEXIA · NCERT');
      assert.equal(await p.locator('#classCardHigher,#btnOpenHigher,#libShelf').count(), 0, 'removed dashboard links must stay absent');
      const credit = p.locator('#libDash .lib-credit');
      assert(await credit.isVisible());
      assert((await credit.innerText()).includes('Paras Pranav'));
      const creditBox = await credit.boundingBox();
      assert(creditBox.y + creditBox.height <= height + 1, `${name}: developer credit should be visible without scrolling`);
      const layout = await p.evaluate(() => {
        const a = document.querySelector('#classCardIX').getBoundingClientRect();
        const b = document.querySelector('#classCardX').getBoundingClientRect();
        return {firstTop: a.top, secondBottom: b.bottom, width: document.documentElement.scrollWidth, screenWidth: innerWidth};
      });
      assert(layout.firstTop < 150, `${name}: excessive space above books`);
      assert(layout.secondBottom <= height, `${name}: both class books should be visible without scrolling: ${JSON.stringify(layout)}`);
      assert(layout.width <= layout.screenWidth, `${name}: horizontal overflow`);
      for (const cls of ['IX', 'X']) {
        const sizes = await p.locator('#classCard' + cls).evaluate(card => {
          const cover = card.querySelector('.lp-cover').getBoundingClientRect();
          const info = card.querySelector('.lp-info').getBoundingClientRect();
          const button = card.getBoundingClientRect();
          return {coverHeight: cover.height, infoHeight: info.height, coverRight: cover.right, infoLeft: info.left, infoRight: info.right, buttonRight: button.right};
        });
        assert(sizes.coverHeight >= sizes.infoHeight * 0.6, `${name} Class ${cls}: book cover is too small relative to text: ${JSON.stringify(sizes)}`);
        assert(sizes.coverRight <= sizes.infoLeft + 1 && sizes.infoRight <= sizes.buttonRight + 1, `${name} Class ${cls}: cover and text overlap or overflow`);
      }
      assert(await p.locator('#svLibSearchBtn').isVisible());
      assert(await p.locator('#btnFlipbookTop').isVisible());
      assert(!(await p.locator('#chapterSelect').isVisible()));
      if (mode === '3d') {
        for (const id of ['btnO3', 'btnParts', 'btnProjector']) {
          assert(!(await p.locator('#' + id).isVisible()), `${id} should not clutter the library`);
        }
      }
      assert.equal(await p.locator('.lib-head,.sv-lib-search-row').count(), 0, 'large hero/search block returned');
      await p.locator('#langSelect').selectOption('hi');
      assert((await p.locator('.lib-section-title').innerText()).includes('कक्षा'));
      await p.locator('#langSelect').selectOption('en');
      assert.equal(await p.locator('.lib-section-title').innerText(), 'Choose a class');
      await p.locator('#langSelect').selectOption('both');
      await p.locator('#svLibSearchBtn').click();
      await p.locator('#svSearchInput').fill('cell');
      assert((await p.locator('#svSearchResults .sv-hit').count()) > 0);
      await p.locator('#svSearchClose').click();
      await p.locator('#btnFlipbookTop').click();
      assert(await p.locator('#svFlipbookModal').isVisible());
      await p.locator('#svFlipClose').click();
      for (const cls of ['IX', 'X']) {
        await p.locator('#classCard' + cls).click();
        assert(await p.locator('#libDrawer').isVisible());
        assert((await p.locator('#ldList [data-ch]').count()) > 0);
        const row = p.locator('#ldList [data-ch]:has(.ld-thumb)').first();
        if (await row.count()) {
          // Measure in one frame while the drawer's entrance animation may be running.
          const geometry = await row.evaluate(el => {
            const image = el.querySelector('.ld-thumb').getBoundingClientRect();
            const title = el.querySelector('.ld-body').getBoundingClientRect();
            const box = el.getBoundingClientRect();
            return {imageRight: image.right, titleLeft: title.left, titleRight: title.right, rowRight: box.right};
          });
          assert(geometry.imageRight <= geometry.titleLeft + 1, `${name}: chapter thumbnail overlaps title`);
          assert(geometry.titleRight <= geometry.rowRight + 1, `${name}: chapter title overflows its row`);
        }
        await p.locator('#ldClose').click();
      }
      if (mode === '3d') {
        await p.locator('#classCardIX').click();
        await p.locator('#ldList [data-ch]').first().click();
        await p.waitForFunction(() => EV.view === 'book');
        assert(await p.locator('#chapterSelect').isVisible(), 'chapter control did not return in book view');
      }
      assert.deepEqual(errors, []);
      await p.close();
      console.log(`PASS library_layout: ${name} ${width}x${height} · books visible, search/language/flipbook/class navigation`);
    }
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
