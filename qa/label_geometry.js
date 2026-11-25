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

/* A label is drawn as a numbered pin at the authored anchor (or the centre of
   the authored box). Pins are nudged apart when two labels name the same spot,
   exactly as the runtime does. */
function pinPoints(specs) {
  const pts = specs.map(s => ({
    x: s.anchor_x != null ? s.anchor_x : s.x + s.w / 2,
    y: s.anchor_y != null ? s.anchor_y : s.y + s.h / 2
  }));
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    let dx = pts[j].x - pts[i].x, dy = pts[j].y - pts[i].y, d = Math.hypot(dx, dy);
    if (d < 30) {
      if (d < 0.01) { dx = 0; dy = 1; d = 1; }
      const push = (30 - d) / 2;
      pts[i].x -= dx / d * push; pts[i].y -= dy / d * push;
      pts[j].x += dx / d * push; pts[j].y += dy / d * push;
    }
  }
  pts.forEach(p => { p.x = Math.max(0, Math.min(1408, p.x)); p.y = Math.max(0, Math.min(768, p.y)); });
  return pts;
}

function verifyStaticGeometry() {
  const data = LABELS;
  const errors = [];
  let totalLabels = 0;

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
    const bandTop = (best[0] / 100) * 768, bandBottom = (best[1] / 100) * 768;
    if (bandBottom - bandTop < 80) {
      errors.push(`${key}: insufficient clear popup band (${(bandBottom - bandTop).toFixed(1)}px)`);
    }

    const pts = pinPoints(specs);
    specs.forEach((s, i) => {
      totalLabels++;
      if (!s.en || !s.hi || !s.info_en || !s.info_hi) errors.push(`${key}: missing bilingual text at ${i}`);
      const p = pts[i];
      if (p.x < 0 || p.x > 1408 || p.y < 0 || p.y > 768) errors.push(`${key}: pin out of bounds at ${i}`);
      if (!Number.isFinite(s.x) || !Number.isFinite(s.y) || !Number.isFinite(s.w) || !Number.isFinite(s.h)) {
        errors.push(`${key}: invalid authored box at ${i}`);
      }
    });
    /* two pins must never land on the same pixel */
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      if (Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y) < 1) errors.push(`${key}: coincident pins ${i}/${j}`);
    }
  }

  assert.deepEqual(errors, []);
  assert.equal(Object.keys(data).length, EXP_IMAGES);
  assert.equal(totalLabels, EXP_LABELS);
  console.log(`static geometry: ${EXP_IMAGES} images, ${EXP_LABELS} pins, bilingual info, label/popup clearance PASS`);
}

(async () => {
  verifyStaticGeometry();
  let playwright = null;
  try { playwright = require("playwright"); } catch (_) {}
  if (!playwright) {
    if (process.env.QA_REQUIRE_BROWSER === "1") throw new Error("playwright not installed; real-browser geometry required");
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
      await p.waitForSelector(".evzoom-picture .ev-label-pin");
      const res = await p.evaluate(async () => {
        const host = document.querySelector(".evzoom-picture"), data = EV_LABEL_DATA, errors = [];
        let n = 0;
        const rect = (a, b) => a.left < b.right - 0.2 && b.left < a.right - 0.2 && a.top < b.bottom - 0.2 && b.top < a.bottom - 0.2;
        for (const [key, entries] of Object.entries(data)) {
          EVLABEL.render(host, key);
          const layer = host.querySelector(".ev-label-layer");
          const keyEl = host.querySelector(".ev-label-key");
          const pins = [...layer.querySelectorAll(".ev-label-pin")];
          const items = [...keyEl.querySelectorAll(".ev-key-item")];
          if (pins.length !== entries.length) errors.push(key + ": pin count");
          if (items.length !== entries.length) errors.push(key + ": key count");
          if (!keyEl || !layer) { errors.push(key + ": missing layer"); continue; }
          const lr = layer.getBoundingClientRect();
          for (const pin of pins) {
            const pr = pin.getBoundingClientRect();
            if (pr.left < lr.left - 0.5 || pr.right > lr.right + 0.5 || pr.top < lr.top - 0.5 || pr.bottom > lr.bottom + 0.5) errors.push(key + ": pin outside image");
          }
          for (let i = 0; i < items.length; i++) {
            items[i].click();
            const pop = layer.querySelector(".ev-label-pop") || keyEl.querySelector(".ev-label-pop"), pr = pop.getBoundingClientRect();
            if (pop.hidden || !pop.textContent.includes(entries[i].info_en) || !pop.textContent.includes(entries[i].info_hi)) errors.push(key + ": info " + i);
            if (pr.left < lr.left - 0.5 || pr.right > lr.right + 0.5 || pr.top < lr.top - 0.5 || pr.bottom > lr.bottom + 0.5) errors.push(key + ": popup outside image");
            n++;
          }
          /* every pin opens its own note too (close the open note first:
             clicking the selected pin again toggles it shut) */
          for (let i = 0; i < pins.length; i++) {
            const openPop = layer.querySelector(".ev-label-pop") || keyEl.querySelector(".ev-label-pop");
            if (openPop && !openPop.hidden) openPop.querySelector(".ev-label-close").click();
            pins[i].click();
            const pop = layer.querySelector(".ev-label-pop") || keyEl.querySelector(".ev-label-pop");
            if (pop.hidden || !pop.textContent.includes(entries[i].info_en)) errors.push(key + ": pin info " + i);
          }
        }
        return { images: Object.keys(data).length, labels: n, errors };
      });
      assert.deepEqual(res.errors, []);
      assert.equal(res.images, EXP_IMAGES);
      assert.equal(res.labels, EXP_LABELS);
      assert.deepEqual(errors, []);
      console.log((mobile ? "mobile" : "desktop"), `${EXP_IMAGES} images, ${EXP_LABELS} pins + key entries, bilingual info, label/popup geometry PASS`);
      await p.close();
    } finally {
      await b.close();
    }
  }

  /* Flipbook: the key must sit below the plate, never over the artwork. */
  const b = await chromium.launch({
    headless: true,
    ...(process.env.QA_CHROMIUM_EXECUTABLE ? { executablePath: process.env.QA_CHROMIUM_EXECUTABLE } : {}),
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-dev-shm-usage"]
  });
  try {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    p.on("pageerror", e => errors.push(e.message));
    await p.goto(base + "?world=c9_cell&spread=0", { waitUntil: "load" });
    await p.waitForTimeout(2500);
    const res = await p.evaluate(() => {
      const out = [];
      const right = document.querySelector(".svf-right-page");
      const host = right.querySelector(".svf-plate-host");
      const keyEl = right.querySelector(".ev-label-key");
      const layer = right.querySelector(".ev-label-layer");
      if (!host || !keyEl || !layer) return ["missing flipbook key parts"];
      const hb = host.getBoundingClientRect(), kb = keyEl.getBoundingClientRect(), lb = layer.getBoundingClientRect();
      if (kb.top < hb.bottom - 1) out.push("figure key overlaps the plate");
      if (kb.left < hb.left - 1 || kb.right > hb.right + 1) out.push("figure key wider than the plate");
      if (lb.width < 2 || lb.height < 2) out.push("pin layer is empty");
      if (lb.left < hb.left - 1 || lb.right > hb.right + 1 || lb.top < hb.top - 1 || lb.bottom > hb.bottom + 1) out.push("pin layer outside the plate");
      const pins = [...layer.querySelectorAll(".ev-label-pin")];
      if (!pins.length) out.push("no pins on the plate");
      for (const pin of pins) {
        const r = pin.getBoundingClientRect();
        if (r.left < lb.left - 1 || r.right > lb.right + 1 || r.top < lb.top - 1 || r.bottom > lb.bottom + 1) out.push("pin outside the plate");
      }
      const items = [...keyEl.querySelectorAll(".ev-key-item")];
      if (items.length !== pins.length) out.push("key entries != pins");
      return out;
    });
    assert.deepEqual(res, []);
    assert.deepEqual(errors, []);
    console.log("flipbook: figure key sits under the plate, pins stay on the artwork PASS");
    await p.close();
  } finally {
    await b.close();
  }
})().catch(e => {
  console.error(e);
  process.exit(1);
});
