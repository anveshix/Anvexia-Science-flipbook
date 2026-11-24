#!/usr/bin/env node
/* Check the long-page fallback with actual keyboard, wheel and emulated touch. */
const assert = require('assert');
let playwright;
try { playwright = require('playwright'); } catch (_) {}
if (!playwright) {
  if (process.env.QA_REQUIRE_BROWSER === '1') { console.error('FAIL flipbook_scroll: playwright not installed'); process.exit(1); }
  console.log('SKIP flipbook_scroll: playwright not installed'); process.exit(0);
}
const base = process.env.QA_BASE || 'http://127.0.0.1:8080/';
(async () => {
  const b = await playwright.chromium.launch({
    ...(process.env.QA_CHROMIUM_EXECUTABLE ? { executablePath: process.env.QA_CHROMIUM_EXECUTABLE } : {}),
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  });
  try {
    const p = await b.newPage({viewport: {width: 1280, height: 720}});
    const pageErrors = [];
    p.on('pageerror', e => pageErrors.push(e.message));
    await p.goto(base + '?mode=2d', {waitUntil: 'load'});
    await p.evaluate(() => SCIVERSE.openFlipbook('c10_carbon', 8));
    const inner = p.locator('.svf-left-page[data-spread="8"] .svf-page-inner');
    await p.waitForFunction(() => document.querySelector('.svf-left-page[data-spread="8"] .svf-page-inner')?.classList.contains('svf-scrollable'));
    assert.equal(await inner.getAttribute('tabindex'), '0');
    assert.equal(await inner.getAttribute('role'), 'region');
    assert(await inner.getAttribute('aria-label'));
    await inner.focus();
    await p.keyboard.press('End');
    await p.waitForFunction(() => { const e = document.querySelector('.svf-left-page[data-spread="8"] .svf-page-inner'); return e.scrollTop >= e.scrollHeight - e.clientHeight - 2; });
    assert(await inner.evaluate(e => e.lastElementChild.getBoundingClientRect().bottom <= e.getBoundingClientRect().bottom + 2));
    await p.keyboard.press('Home');
    await p.waitForFunction(() => document.querySelector('.svf-left-page[data-spread="8"] .svf-page-inner').scrollTop === 0);
    const box = await inner.boundingBox();
    await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await p.mouse.wheel(0, 600);
    await p.waitForFunction(() => document.querySelector('.svf-left-page[data-spread="8"] .svf-page-inner').scrollTop > 0);
    await p.locator('.svf-left-page[data-spread="8"] .svf-opt').last().click();
    assert(await p.locator('.svf-left-page[data-spread="8"] .svf-explain').isVisible());
    assert.deepEqual(pageErrors, []);
    await p.close();

    const mobile = await b.newPage({viewport: {width: 390, height: 500}, isMobile: true, hasTouch: true});
    await mobile.goto(base + '?mode=2d', {waitUntil: 'load'});
    await mobile.evaluate(() => SCIVERSE.openFlipbook('c10_carbon', 8));
    const mi = mobile.locator('.svf-left-page[data-spread="8"] .svf-page-inner');
    await mobile.waitForFunction(() => document.querySelector('.svf-left-page[data-spread="8"] .svf-page-inner')?.classList.contains('svf-scrollable'));
    const r = await mi.boundingBox(), session = await mobile.context().newCDPSession(mobile);
    const x = Math.round(r.x + r.width * 0.5), y = Math.round(r.y + r.height * 0.7);
    await session.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]});
    for (let i = 1; i <= 8; i++) await session.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x, y: y - i * 22}]});
    await session.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
    await mobile.waitForFunction(() => document.querySelector('.svf-left-page[data-spread="8"] .svf-page-inner').scrollTop > 0);
    assert((await mobile.locator('#svFlipCounter').innerText()).includes('4.3.1'), 'touch scroll unexpectedly turned the page');
    await mobile.close();
    console.log('PASS flipbook_scroll: keyboard, wheel, answer control and emulated touch can reach long-page content without turning the page');
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
