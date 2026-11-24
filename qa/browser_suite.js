#!/usr/bin/env node
/* Mandatory browser QA: no silent fallback to static checks or skips. */
const { spawnSync } = require('child_process');
const path = require('path');
const env = { ...process.env, QA_REQUIRE_BROWSER: '1' };
for (const script of ['library_layout.js', 'search_result_clicks.js', 'book_raster.js', 'flipbook_scroll.js', 'label_geometry.js', 'flipbook_layout.js', 'publish_browser_smoke.js']) {
  console.log(`\n--- ${script} ---`);
  const result = spawnSync(process.execPath, [path.join(__dirname, script)], { env, stdio: 'inherit' });
  if (result.error || result.status !== 0) {
    if (result.error) console.error(result.error);
    process.exit(result.status || 1);
  }
}
console.log('\nPASS mandatory browser suite');
