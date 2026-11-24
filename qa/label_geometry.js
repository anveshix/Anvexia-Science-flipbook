const fs = require("fs");
const path = require("path");
const assert = require("assert");

const ROOT = path.resolve(__dirname, "..");
const base = process.env.QA_BASE || "http://127.0.0.1:8080/";
/* expected totals = authored labels (label_data.json) + imported realistic plates */
const LABELS = Object.assign({},
  JSON.parse(fs.readFileSync(path.join(ROOT, "src/label_data.json"), "utf8")),
  JSON.parse(fs.readFileSync(path.join(ROOT, "src/realistic_plates.json"), "utf8")).labels);
const EXP_IMAGES = Object.keys(LABELS).length;
const EXP_LABELS = Object.values(LABELS).reduce((n, v) => n + v.length, 0);

function verifyStaticGeometry() {
  const data = LABELS;
  const errors = [];
  let totalLabels = 0;
  const overlap = (a, b) =>
    a.left < b.right - 0.2 && b.left < a.right - 0.2 &&
    a.top < b.bottom - 0.2 && b.top < a.bottom - 0.2;

  for (const [key, specs] of Object.entries(data)) {
    const occupied = specs
      .map(s => [Math.max(0, (s.y / 768) * 100 - 1), Math.min(100, ((s.y + s.h) / 768) * 100 + 1)])
      .sort((a, b) => a[0] - b[0]);
    let cursor = 1, best = [1, 1];
    for (const [a, b] of occupied) {
      if (a - cursor > best[1] - best[0]) best = [cursor, a];
      cursor = Math.max(cursor, b);
    }
    if (99 - cursor > best[1] - best[0]) best = [cursor, 99];
    const popRect = {
      left: 0.02 * 1408,
      right: 0.98 * 1408,
      top: (best[0] / 100) * 768,
      bottom: (best[1] / 100) * 768
    };
    if (popRect.bottom - popRect.top < 80) {
      errors.push(`${key}: insufficient clear popup band (${(popRect.bottom - popRect.top).toFixed(1)}px)`);
    }

    const hitRects = specs.map(spec => {
      let right = spec.x + spec.w;
      for (const other of specs) {
        if (other !== spec && other.x > spec.x && other.x < right && other.y < spec.y + spec.h && spec.y < other.y + other.h) {
          right = other.x - 2;
        }
      }
      return { left: spec.x, right, top: spec.y, bottom: spec.y + spec.h };
    });

    specs.forEach((s, i) => {
      totalLabels++;
      if (!s.en || !s.hi || !s.info_en || !s.info_hi) errors.push(`${key}: missing bilingual text at ${i}`);
      const hr = hitRects[i];
      if (hr.left < -0.5 || hr.right > 1408.5 || hr.top < -0.5 || hr.bottom > 768.5 || hr.right - hr.left < 20) {
        errors.push(`${key}: invalid hit bounds at ${i}`);
      }
      if (overlap(popRect, hr)) errors.push(`${key}: popup band overlaps label ${i}`);
      for (let j = i + 1; j < hitRects.length; j++) {
        if (overlap(hr, hitRects[j])) errors.push(`${key}: hit overlap ${i}/${j}`);
      }
      if (s.overlay === "with_anchor") {
        if (s.anchor_x < 0 || s.anchor_x > 1408 || s.anchor_y < 0 || s.anchor_y > 768) {
          errors.push(`${key}: anchor out of bounds at ${i}`);
        }
      }
    });
  }

  assert.deepEqual(errors, []);
  assert.equal(Object.keys(data).length, EXP_IMAGES);
  assert.equal(totalLabels, EXP_LABELS);
  console.log(`static geometry: ${EXP_IMAGES} images, ${EXP_LABELS} hotspot boxes, bilingual info, label/popup clearance PASS`);
}

(async () => {
  let playwright = null;
  try { playwright = require("playwright"); } catch (_) {}
  if (!playwright) {
    if (process.env.QA_REQUIRE_BROWSER === "1") throw new Error("playwright not installed; real-browser geometry required");
    verifyStaticGeometry();
    return;
  }
  const { chromium } = playwright;
  for (const mobile of [false, true]) {
    const b = await chromium.launch({
      headless: true,
      ...(process.env.QA_CHROMIUM_EXECUTABLE ? { executablePath: process.env.QA_CHROMIUM_EXECUTABLE } : {}),
      args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-dev-shm-usage"]
    });
    try {
      const p = await b.newPage({
        viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
        isMobile: mobile,
        hasTouch: mobile
      });
      const errors = [];
      p.on("pageerror", e => errors.push(e.message));
      await p.goto(base + "?mode=3d&world=c10_control&spread=2", { waitUntil: "load", timeout: 60000 });
      await p.evaluate(() => setLanguage("both"));
      await p.locator("#plate2d").click();
      await p.waitForFunction(() => EVRASTER.isVisible());
      await p.locator("#btnZoomFigure").click();
      await p.waitForSelector(".evzoom-picture .ev-label-hit");
      const res = await p.evaluate(async () => {
        const host = document.querySelector(".evzoom-picture"), data = EV_LABEL_DATA, errors = [];
        let n = 0;
        const rect = (a, b) => a.left < b.right - 0.2 && b.left < a.right - 0.2 && a.top < b.bottom - 0.2 && b.top < a.bottom - 0.2;
        for (const [key, entries] of Object.entries(data)) {
          EVLABEL.render(host, key);
          const layer = host.querySelector(".ev-label-layer");
          const hits = [...layer.querySelectorAll(".ev-label-hit")];
          if (hits.length !== entries.length) errors.push(key + ": count");
          for (let i = 0; i < hits.length; i++) {
            hits[i].click();
            const pop = layer.querySelector(".ev-label-pop"), pr = pop.getBoundingClientRect(), lr = layer.getBoundingClientRect();
            if (pop.hidden || !pop.textContent.includes(entries[i].info_en) || !pop.textContent.includes(entries[i].info_hi)) errors.push(key + ": info " + i);
            for (let j = 0; j < hits.length; j++) if (rect(pr, hits[j].getBoundingClientRect())) errors.push(key + ": popup overlaps label " + j);
            if (pr.left < lr.left - 0.5 || pr.right > lr.right + 0.5 || pr.top < lr.top - 0.5 || pr.bottom > lr.bottom + 0.5) errors.push(key + ": popup outside image");
            for (let j = i + 1; j < hits.length; j++) if (rect(hits[i].getBoundingClientRect(), hits[j].getBoundingClientRect())) errors.push(key + ": hit overlap " + i + "/" + j);
            n++;
          }
        }
        return { images: Object.keys(data).length, labels: n, errors };
      });
      assert.deepEqual(res.errors, []);
      assert.equal(res.images, EXP_IMAGES);
      assert.equal(res.labels, EXP_LABELS);
      assert.deepEqual(errors, []);
      console.log((mobile ? "mobile" : "desktop"), `${EXP_IMAGES} images, ${EXP_LABELS} hotspot boxes, bilingual info, label/popup geometry PASS`);
      await p.close();
    } finally {
      await b.close();
    }
  }
})().catch(e => {
  console.error(e);
  process.exit(1);
});
