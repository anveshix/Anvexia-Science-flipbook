#!/usr/bin/env node
/* Chromium decode proof for every approved realistic 2D plate.
 * Loads each plate listed in src/plate_approval.json in a real browser,
 * awaits decode(), and compares the decoded size with the register. Also
 * checks that the reader no longer shows a review-pending badge. */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
let playwright;
try { playwright = require('playwright'); } catch (_) {}
if (!playwright) {
  if (process.env.QA_REQUIRE_BROWSER === '1') { console.error('FAIL plate_approval_browser: playwright not installed'); process.exit(1); }
  console.log('SKIP plate_approval_browser: playwright not installed');
  process.exit(0);
}
const base = process.env.QA_BASE || 'http://127.0.0.1:8080/';
const register = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'plate_approval.json'), 'utf8'));

(async () => {
  const browser = await playwright.chromium.launch({
    ...(process.env.QA_CHROMIUM_EXECUTABLE ? { executablePath: process.env.QA_CHROMIUM_EXECUTABLE } : {}),
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    const errors = [], badResponses = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400) badResponses.push(`${r.status()} ${r.url()}`); });
    await page.goto(base, { waitUntil: 'load' });

    const badge = await page.evaluate(() => ({
      badge: document.querySelector('[data-i18n="draft.badge"]')?.textContent.trim() || '',
      foot: document.querySelector('[data-i18n="draft.labels"]')?.textContent.trim() || '',
      body: document.body.innerText
    }));
    assert(/APPROVED/i.test(badge.badge) && /स्वीकृत/.test(badge.badge), `badge is not approved: ${badge.badge}`);
    assert(/verified/i.test(badge.foot) && /सत्यापित/.test(badge.foot), `footnote is not verified: ${badge.foot}`);
    assert(!/REVIEW PENDING|science review pending/i.test(badge.body), 'reader still advertises a pending review');

    const files = register.plates.map(p => p.file);
    const decoded = [];
    for (let i = 0; i < files.length; i += 32) {
      const batch = files.slice(i, i + 32);
      decoded.push(...await page.evaluate(async list => {
        const out = [];
        await Promise.all(list.map(file => new Promise(resolve => {
          const img = new Image();
          img.onload = async () => {
            try { await img.decode(); out.push({ file, ok: true, w: img.naturalWidth, h: img.naturalHeight }); }
            catch (e) { out.push({ file, ok: false, error: e.message }); }
            resolve();
          };
          img.onerror = () => { out.push({ file, ok: false, error: 'image request failed' }); resolve(); };
          img.src = 'assets/2d/' + file;
        })));
        return out;
      }, batch));
    }
    assert.equal(decoded.length, register.plates.length, 'not every registered plate was decoded');
    for (const result of decoded) {
      const record = register.plates.find(p => p.file === result.file);
      assert(result.ok, `${result.file}: ${result.error || 'decode failed'}`);
      assert.equal(result.w, record.width, `${result.file}: width ${result.w} != ${record.width}`);
      assert.equal(result.h, record.height, `${result.file}: height ${result.h} != ${record.height}`);
    }
    assert.deepEqual(errors, [], `page errors: ${errors.join(' | ')}`);
    assert.deepEqual(badResponses, [], `HTTP errors: ${badResponses.join(' | ')}`);
    console.log(`PASS plate_approval_browser: ${decoded.length} plates decoded in Chromium at their registered sizes; approved badge shown; no page or HTTP errors`);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
