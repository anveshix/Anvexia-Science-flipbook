#!/usr/bin/env node
/**
 * Bundle & vendor open-source npm dependencies for SciVerse 3D into `vendor/`
 * so `build.py` produces a 100% offline, zero-network single-file `index.html`.
 *
 * Vendored packages:
 *   - page-flip@2.0.7        (MIT) — Tactile 2D Flipbook engine (window.PageFlip)
 *   - minisearch@7.2.0       (MIT) — Instant Hindi-English search engine (window.MiniSearch)
 *   - @tweenjs/tween.js@25.0 (MIT) — Smooth 3D & UI motion easing (window.TWEEN)
 *   - temml@0.14.0           (MIT) — Native MathML scientific equation typesetter (window.temml)
 *   - canvas-confetti@1.9.4  (ISC) — Experiment stamp & mastery celebration particles (window.confetti)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VENDOR = path.join(ROOT, 'vendor');

const entryCode = `
import { PageFlip } from 'page-flip';
import MiniSearch from 'minisearch';
import * as TWEEN from '@tweenjs/tween.js';
import temml from 'temml';
import confetti from 'canvas-confetti';

window.PageFlip = PageFlip;
window.MiniSearch = MiniSearch;
window.TWEEN = TWEEN;
window.temml = temml;
window.confetti = confetti;
`;

const result = esbuild.buildSync({
  stdin: {
    contents: entryCode,
    resolveDir: ROOT,
    sourcefile: 'sciverse-libs-entry.js',
    loader: 'js',
  },
  bundle: true,
  minify: true,
  legalComments: 'none',
  format: 'iife',
  target: ['es2020'],
  charset: 'utf8',
  write: false,
});

let js = result.outputFiles[0].text;
// Prevent accidental inline </script> termination inside HTML
js = js.replace(/<\/script/gi, '<\\/script');

const externalUrlRe = /(?:src|href|url)\s*(?:=|\()\s*['"]?\s*(?:https?:|\/\/|wss?:)/i;
const badMatch = js.match(externalUrlRe);
if (badMatch) {
  throw new Error(`External URL pattern found in sciverse-libs.min.js: ${badMatch[0]}`);
}

const outJsPath = path.join(VENDOR, 'sciverse-libs.min.js');
fs.writeFileSync(outJsPath, js, 'utf8');

// Copy Temml.woff2 (9.4 KB script-capitals math font) for data-URI inlining in build.py
const temmlFontSrc = path.join(ROOT, 'node_modules', 'temml', 'dist', 'Temml.woff2');
const temmlFontDst = path.join(VENDOR, 'temml.woff2');
fs.copyFileSync(temmlFontSrc, temmlFontDst);

// Build combined vendor stylesheet (Temml MathML + StPageFlip layout)
let temmlCss = fs.readFileSync(
  path.join(ROOT, 'node_modules', 'temml', 'dist', 'Temml-Local.css'),
  'utf8'
);
temmlCss = temmlCss.replace(
  /url\(['"]?Temml\.woff2['"]?\)/g,
  'url(data:font/woff2;base64,__TEMML_FONT__)'
);
const pageFlipCss = fs.readFileSync(
  path.join(ROOT, 'node_modules', 'page-flip', 'src', 'Style', 'stPageFlip.css'),
  'utf8'
);
const combinedCss = esbuild.transformSync(`${temmlCss}\n${pageFlipCss}`, {
  loader: 'css',
  minify: true,
  charset: 'utf8',
}).code;
if (externalUrlRe.test(combinedCss)) {
  throw new Error('External URL pattern found in sciverse-libs.css');
}
fs.writeFileSync(path.join(VENDOR, 'sciverse-libs.css'), combinedCss, 'utf8');

// Ensure vendor/THIRD_PARTY_LICENSES.txt includes verbatim notices for all 5 libraries
const licensePath = path.join(VENDOR, 'THIRD_PARTY_LICENSES.txt');
let licText = fs.readFileSync(licensePath, 'utf8');
const marker = '\n========================================================================\nSCIVERSE 3D ADDITIONAL OPEN-SOURCE LIBRARIES\n========================================================================\n';
const libs = [
  ['StPageFlip (page-flip 2.0.7) — https://github.com/Nodlik/StPageFlip', 'node_modules/page-flip/LICENSE'],
  ['MiniSearch (minisearch 7.2.0) — https://github.com/lucaong/minisearch', 'node_modules/minisearch/LICENSE.txt'],
  ['@tweenjs/tween.js (25.0.0) — https://github.com/tweenjs/tween.js', 'node_modules/@tweenjs/tween.js/LICENSE'],
  ['Temml (temml 0.14.0) — https://github.com/ronkok/Temml', 'node_modules/temml/LICENSE'],
  ['canvas-confetti (1.9.4) — https://github.com/catdad/canvas-confetti', 'node_modules/canvas-confetti/LICENSE'],
];

const extraBlock =
  marker +
  libs
    .map(([title, rel]) => {
      const body = fs
        .readFileSync(path.join(ROOT, rel), 'utf8')
        .replace(/-->/g, '-- >')
        .trim();
      return `\n--- ${title} ---\n\n${body}\n`;
    })
    .join('\n');

if (licText.includes(marker)) {
  licText = licText.slice(0, licText.indexOf(marker)) + extraBlock;
} else {
  licText = licText.trimEnd() + '\n' + extraBlock;
}
if (licText.includes('-->')) {
  throw new Error('HTML comment closer found in THIRD_PARTY_LICENSES.txt');
}
fs.writeFileSync(licensePath, licText, 'utf8');

console.log(
  `Vendored sciverse-libs.min.js (${Buffer.byteLength(js)} B), sciverse-libs.css (${Buffer.byteLength(combinedCss)} B), temml.woff2 (${fs.statSync(temmlFontDst).size} B)`
);
