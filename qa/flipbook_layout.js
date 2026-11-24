#!/usr/bin/env node
/**
 * qa/flipbook_layout.js — the 2D flipbook must never overflow or clip text.
 * Opens every section of every chapter on the tightest landscape screen
 * (1280x720) and a chapter sample on a phone (390x844), then checks the
 * visible pages: no page content scrolls, no option/term/label is clipped,
 * and no formula falls back to a Temml parse error.
 * Needs the local server (npm start) and Playwright; skips if unavailable.
 */
const base = process.env.QA_BASE || "http://127.0.0.1:8080/";
let playwright = null;
try { playwright = require("playwright"); } catch (_) {}
if (!playwright) {
  if (process.env.QA_REQUIRE_BROWSER === "1") { console.error("FAIL flipbook_layout: playwright not installed"); process.exit(1); }
  console.log("SKIP flipbook_layout: playwright not installed"); process.exit(0);
}

const audit = () => {
  const out = [];
  const pages = [...document.querySelectorAll("#svFlipBook .stf__item")].filter(e => getComputedStyle(e).display !== "none");
  pages.forEach(pg => {
    const inner = pg.querySelector(".svf-page-inner");
    if (inner && (inner.scrollHeight > inner.clientHeight + 2 || inner.scrollWidth > inner.clientWidth + 2))
      out.push("overflow " + inner.scrollWidth + "x" + inner.scrollHeight + " in " + inner.clientWidth + "x" + inner.clientHeight);
    pg.querySelectorAll(".svf-opt,.svf-term,.svf-caption,.ev-label-chip").forEach(el => {
      if (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2) out.push("clipped " + el.className.split(" ")[0] + ": " + el.textContent.trim().slice(0, 40));
    });
    if (/ParseError/.test(pg.textContent)) out.push("formula ParseError");
  });
  return out;
};

(async () => {
  const b = await playwright.chromium.launch({
    ...(process.env.QA_CHROMIUM_EXECUTABLE ? { executablePath: process.env.QA_CHROMIUM_EXECUTABLE } : {}),
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
  });
  const errors = [];
  let checked = 0;
  for (const [name, w, h, sample] of [["laptop", 1280, 720, 0], ["phone", 390, 844, 4]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    p.on("pageerror", e => errors.push(name + " pageerror " + e.message));
    await p.goto(base + "index.html?mode=2d", { waitUntil: "load" });
    await p.waitForTimeout(1200);
    const chapters = await p.evaluate(() => CATALOGUE_ALL.map(c => [c.id, getWorld(c.id).spreads.length]));
    for (const [id, n] of (sample ? chapters.slice(0, sample) : chapters)) {
      for (let i = 0; i < n; i++) {
        await p.evaluate(([cid, si]) => SCIVERSE.openFlipbook(cid, si), [id, i]);
        await p.waitForFunction(() => {
          const v = [...document.querySelectorAll("#svFlipBook .stf__item")].filter(e => getComputedStyle(e).display !== "none");
          return v.length && v.every(x => { const i = x.querySelector(".svf-page-inner"); return !i || i.style.getPropertyValue("--fs"); });
        }, null, { timeout: 5000 }).catch(() => {});
        const found = await p.evaluate(audit);
        found.forEach(f => errors.push(`${name} ${id} §${i + 1}: ${f}`));
        checked++;
        /* phone shows one page: check the figure page too */
        if (name === "phone") {
          await p.evaluate(() => document.getElementById("svFlipNext").click());
          await p.waitForTimeout(700);
          (await p.evaluate(audit)).forEach(f => errors.push(`${name} ${id} §${i + 1} figure: ${f}`));
        }
      }
    }
    await p.close();
  }
  await b.close();
  if (errors.length) {
    console.error("FAIL flipbook_layout:\n  " + errors.slice(0, 30).join("\n  ") + (errors.length > 30 ? `\n  … ${errors.length - 30} more` : ""));
    process.exit(1);
  }
  console.log(`PASS flipbook_layout: ${checked} section views (laptop all chapters + phone sample) · no overflow, no clipped text, no formula errors`);
})();
