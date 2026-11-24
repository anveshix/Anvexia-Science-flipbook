#!/usr/bin/env node
/* A click/tap on a page corner must always turn the flipbook page.
 * Covers desktop, a short viewport whose pages are scrollable, and touch. */
const assert = require('assert');
let playwright;
try { playwright = require('playwright'); } catch (_) {}
if (!playwright) {
  if (process.env.QA_REQUIRE_BROWSER === '1') { console.error('FAIL flipbook_corner: playwright not installed'); process.exit(1); }
  console.log('SKIP flipbook_corner: playwright not installed');
  process.exit(0);
}
const base = process.env.QA_BASE || 'http://127.0.0.1:8080/';
const launch = () => playwright.chromium.launch({
  ...(process.env.QA_CHROMIUM_EXECUTABLE ? { executablePath: process.env.QA_CHROMIUM_EXECUTABLE } : {}),
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
});

async function openChapter(page) {
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  await page.locator('#classCardX').click();
  await page.waitForTimeout(300);
  await page.locator('#ldList [data-ch]').first().click();
  await page.waitForTimeout(1400);
}

async function state(page) {
  return page.evaluate(() => {
    const visible = [...document.querySelectorAll('.svf-page')].find(p => p.offsetWidth > 0);
    return {
      counter: document.querySelector('#svFlipCounter').textContent.split(' · ')[0],
      sec: visible?.querySelector('.svf-sec')?.textContent.trim() || '',
      scroll: !!visible?.querySelector('.svf-page-inner.svf-scrollable'),
      corners: visible ? visible.querySelectorAll('.svf-corner').length : 0
    };
  });
}

/* Headless Chromium runs requestAnimationFrame very slowly, so a fixed sleep
 * is not enough: wait for PageFlip to leave its animating state. */
async function settle(page) {
  await page.waitForTimeout(150);
  await page.waitForFunction(() => window.SCIVERSE && window.SCIVERSE.flipState && window.SCIVERSE.flipState() === 'read', null, { timeout: 30000 });
}

async function bookRect(page) {
  return page.evaluate(() => {
    const b = document.querySelector('#svFlipBook').getBoundingClientRect();
    return { x: b.x, y: b.y, w: b.width, h: b.height };
  });
}

(async () => {
  const browser = await launch();
  try {
    /* Desktop: every corner turns in the expected direction. */
    {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await openChapter(page);
      const start = await state(page);
      assert.equal(start.counter, '1.1', `desktop start counter ${start.counter}`);
      assert.equal(start.sec, '1.1', `desktop start page ${start.sec}`);
      assert.equal(start.corners, 4, `desktop visible page has ${start.corners} corner targets`);
      const b = await bookRect(page);
      await page.mouse.click(b.x + b.w - 30, b.y + b.h - 30);
      await settle(page);
      assert.equal((await state(page)).counter, '1.2', 'desktop bottom-right corner did not turn forward');
      await page.mouse.click(b.x + b.w - 30, b.y + 30);
      await settle(page);
      assert.equal((await state(page)).counter, '1.3', 'desktop top-right corner did not turn forward');
      await page.mouse.click(b.x + 30, b.y + b.h - 30);
      await settle(page);
      assert.equal((await state(page)).counter, '1.2', 'desktop bottom-left corner did not turn back');
      await page.mouse.click(b.x + 30, b.y + 30);
      await settle(page);
      assert.equal((await state(page)).counter, '1.1', 'desktop top-left corner did not turn back');
      assert.deepEqual(errors, [], `desktop page errors: ${errors.join(' | ')}`);
      await page.close();
    }

    /* Short viewport: pages are scrollable, corners must still turn. */
    {
      const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await openChapter(page);
      const start = await state(page);
      assert.ok(start.scroll, 'expected a scrollable page at 1024x600');
      assert.equal(start.corners, 4, 'scrollable page lost its corner targets');
      const b = await bookRect(page);
      await page.mouse.click(b.x + b.w - 30, b.y + b.h - 30);
      await settle(page);
      assert.equal((await state(page)).counter, '1.2', 'scrollable page bottom-right corner did not turn');
      await page.mouse.click(b.x + 30, b.y + b.h - 30);
      await settle(page);
      assert.equal((await state(page)).counter, '1.1', 'scrollable page bottom-left corner did not turn back');
      assert.deepEqual(errors, [], `scrollable page errors: ${errors.join(' | ')}`);
      await page.close();
    }

    /* Touch: a tap turns one page at a time. */
    {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await openChapter(page);
      const start = await state(page);
      assert.equal(start.counter, '1.1', `phone start counter ${start.counter}`);
      assert.equal(start.sec, '1.1', `phone start page ${start.sec}`);
      const b = await bookRect(page);
      await page.touchscreen.tap(b.x + b.w - 30, b.y + b.h - 30);
      await settle(page);
      assert.match((await state(page)).sec, /Figure/, 'phone right corner did not turn to the figure page');
      await page.touchscreen.tap(b.x + b.w - 30, b.y + b.h - 30);
      await settle(page);
      assert.equal((await state(page)).counter, '1.2', 'phone second right-corner tap did not reach the next spread');
      await page.touchscreen.tap(b.x + 30, b.y + b.h - 30);
      await settle(page);
      assert.match((await state(page)).sec, /Figure/, 'phone left corner did not turn back to the figure page');
      await page.touchscreen.tap(b.x + 30, b.y + b.h - 30);
      await settle(page);
      assert.equal((await state(page)).sec, '1.1', 'phone second left-corner tap did not return to the section page');
      assert.deepEqual(errors, [], `phone page errors: ${errors.join(' | ')}`);
      await page.close();
    }

    console.log('PASS flipbook_corner: desktop corners, scrollable-page corners and phone taps all turn the page');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
