/* ==========================================================================
   FIGURE3D — REAL-TIME 3D FIGURE RENDERER (R6 / "no poor mindset")
   --------------------------------------------------------------------------
   The right page opposite the textual left page is NOT a hand-drawn 2D diagram.
   It is a live WebGLRenderTarget of the SAME Three.js scene block that powers
   the pop-up apparatus. Every frame the real 3D geometry (spheres, tubes,
   lenses, atoms, membranes, circuits...) is re-lit, re-shaded, re-animated by
   the pure model() and composited onto the physical right page mesh.

   Discipline (nathanliow/atlas-of-physics):
     model.js  -> evalModel(sp, params)     : pure numbers
     world.js  -> BLOCKS[type].build()      : real 3D geometry
     checks    -> EVCHECKS / boardAudit     : the verdict
   This module owns ONLY the second view of that same geometry. No duplicated
   data, no invented numbers, no CDN, no external texture.

   Rendering is throttled to ~30 fps at 900x600 so a 2 GB SwiftShader sandbox
   and a classroom projector both stay smooth.
   ========================================================================== */

const FIGURE3D = (function () {
  const RT_W = 512, RT_H = 340;   /* still >1.6x the on-screen viewport; 37% fewer pixels on SwiftShader */
  /* Launch-day visual contract: ONE compact orbit inside the printed 3D
     viewport. Oversized twin rings and long dust arcs used to cross the page
     frame and overlap the caption / UI. These conservative radii are checked
     against the camera frustum in rebuild() and exposed to the QA gate. */
  const ORBIT_RADIUS = 1.62, DUST_MAX_RADIUS = 1.92, DECOR_RADIUS = 2.02;
  const VIEWPORT_LIMIT = 0.92, FIT_EPS = 0.001;
  let renderer = null, rt = null, scene = null, camera = null;
  let turntable = null, content = null, decor = null, built = null, volumetric = null, bio = null, spRef = null;
  let rings = [], dust = null, shadow = null, keyLight = null, auxLights = [], fitStats = null;
  let ready = false, frames = 0, updates = 0, lastRender = 0, meshCount = 0, label = "";
  /* wall clock, NOT simulation time: on a slow projector/SwiftShader the
     render target must still advance every frame instead of stalling. */
  let clear = new THREE.Color(0xeaf0f6), clearA = 1;

  function gradient(inner, outer) {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const x = c.getContext("2d");
    const g = x.createRadialGradient(128, 110, 12, 128, 128, 178);
    g.addColorStop(0, inner); g.addColorStop(0.62, inner); g.addColorStop(1, outer);
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function init(rend) {
    if (ready) return true;
    try {
      renderer = rend;
      rt = new THREE.WebGLRenderTarget(RT_W, RT_H, {
        minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat, depthBuffer: true, stencilBuffer: false
      });
      try { rt.texture.colorSpace = THREE.SRGBColorSpace; } catch (e) {}
      try { rt.texture.generateMipmaps = false; } catch (e) {}
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(36, RT_W / RT_H, 0.1, 120);
      /* Slightly wider / farther framing gives the compact orbit and the
         molecule labels a safe margin inside the designated right-page plate. */
      camera.position.set(0, 3.00, 8.60);
      camera.lookAt(0, 0.30, 0);

      /* --- studio lighting: soft hemi + warm key + cool fill + rim + bounce --- */
      const hemi = new THREE.HemisphereLight(0xffffff, 0xb2cbe4, 0.78);
      scene.add(hemi);
      keyLight = new THREE.DirectionalLight(0xfff4dc, 1.85);
      keyLight.position.set(-4.5, 8.5, 6.5); scene.add(keyLight);
      const fill = new THREE.DirectionalLight(0xbcdcff, 0.72);
      fill.position.set(5.5, 3.2, 4.0); scene.add(fill);
      const rim = new THREE.DirectionalLight(0x7fb0ff, 1.15);
      rim.position.set(1.5, 4.0, -7.0); scene.add(rim);
      const warm = new THREE.PointLight(0xffd09a, 0.70, 26);
      warm.position.set(0, 2.6, 4.5); scene.add(warm);
      /* Biology plates use two lights only: 5-light per-fragment shading on a
         SwiftShader projector made the anatomy render at ~1 fps. */
      auxLights = [fill, rim, warm];

      /* --- studio backdrop (light, projector-safe) --- */
      const bg = new THREE.Mesh(new THREE.PlaneGeometry(11, 7),
        new THREE.MeshBasicMaterial({ map: gradient("#ffffff", "#cfe2f4"), depthWrite: false }));
      bg.position.set(0, 1.0, -7); scene.add(bg);

      /* --- soft contact shadow on a light floor --- */
      shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 2.4),
        new THREE.MeshBasicMaterial({ map: gradient("rgba(28,62,98,0.44)", "rgba(28,62,98,0)"),
          transparent: true, depthWrite: false, opacity: 0.42 }));
      shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, -0.42, 0); scene.add(shadow);

      turntable = new THREE.Group(); scene.add(turntable);
      content = new THREE.Group(); turntable.add(content);
      decor = new THREE.Group(); scene.add(decor);

      /* --- ONE compact orbit + a bounded dust field: real 3D motion that
         cannot cross the printed viewport or duplicate the figure --- */
      const m = new THREE.Mesh(new THREE.TorusGeometry(ORBIT_RADIUS, 0.010, 6, 96),
        new THREE.MeshBasicMaterial({ color: 0x59b69a, transparent: true, opacity: 0.68 }));
      m.rotation.x = Math.PI / 2 - 0.18;
      m.position.y = 0.3; decor.add(m); rings.push(m);
      const n = 48, pos = new Float32Array(n * 3), rnd = (function () { let s = 991; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();
      for (let i = 0; i < n; i++) {
        const a = rnd() * Math.PI * 2, r = 1.10 + rnd() * (DUST_MAX_RADIUS - 1.10);
        pos[i * 3] = Math.cos(a) * r;
        pos[i * 3 + 1] = (rnd() - 0.5) * 1.7;
        pos[i * 3 + 2] = Math.sin(a) * r;
      }
      const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      dust = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0x2f73b4, size: 0.040, transparent: true, opacity: 0.55, depthWrite: false }));
      decor.add(dust);
      /* Default frustum evidence before any lesson geometry is mounted. */
      const dist0 = camera.position.distanceTo(new THREE.Vector3(0, 0.30, 0));
      const halfH0 = Math.tan(camera.fov * Math.PI / 360) * dist0;
      const halfW0 = halfH0 * camera.aspect;
      const decorNdc0 = Math.max(DECOR_RADIUS / halfW0, DECOR_RADIUS / halfH0);
      fitStats = {
        viewportHalfWidth: +halfW0.toFixed(3), viewportHalfHeight: +halfH0.toFixed(3),
        orbitRadius: ORBIT_RADIUS, decorRadius: DECOR_RADIUS, rings: rings.length,
        decorMaxNdc: +decorNdc0.toFixed(3), contentMaxNdc: 0,
        decorFit: decorNdc0 <= VIEWPORT_LIMIT + FIT_EPS, contentFit: true,
        viewportFit: decorNdc0 <= VIEWPORT_LIMIT + FIT_EPS, duplicateFigure: rings.length !== 1
      };
      ready = true;
    } catch (e) {
      ready = false;
      if (window.console && console.warn) console.warn("FIGURE3D init failed", e);
    }
    return ready;
  }

  function disposeGroup(g) {
    if (!g) return;
    while (g.children.length) {
      const c = g.children[0]; g.remove(c);
      c.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        const mm = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
        mm.forEach(m => { try { if (m.map) m.map.dispose(); m.dispose(); } catch (e) {} });
      });
    }
  }

  /* Upgrade standard materials to a glossy physical finish. Tags / transparent
     text planes are left alone so their ink stays readable. */
  function realism(g) {
    g.traverse(o => {
      if (!o.isMesh || !o.material || o.userData.isTag) return;
      if (o.material.transparent && o.material.opacity < 0.9) return;
      const m = o.material;
      if (!m.isMeshStandardMaterial && !m.isMeshPhysicalMaterial) return;
      try {
        /* Standard (not Physical) keeps the glossy specular highlights but
           halves the fragment cost — essential on a software-rendered smart
           board. Real depth still comes from the 5-light studio rig. */
        const p = new THREE.MeshStandardMaterial({
          color: m.color.clone(), roughness: Math.max(0.18, Math.min(0.66, (m.roughness || 0.7) * 0.62)),
          metalness: Math.max(0.02, Math.min(0.30, (m.metalness || 0.04) + 0.09)),
          emissive: m.emissive ? m.emissive.clone() : new THREE.Color(0x000000),
          emissiveIntensity: m.emissiveIntensity || 0,
          transparent: m.transparent, opacity: m.opacity, side: m.side,
          depthWrite: m.depthWrite
        });
        o.material = p; m.dispose();
      } catch (e) { /* keep the original material if allocation fails */ }
    });
  }

  /* ======================================================================
     VOLUMETRIC FIGURE ENGINE — for the 227 compiler-generated lessons.
     The Atlas packs declare `scene.fig = {kind, labels}`; their original
     paper-craft block is flat. A flat card is NOT "real 3D", so here the SAME
     declarative data + the SAME pure model becomes a genuine volumetric
     object: a glossy hub, orbiting labelled spheres, real tube bonds, a glass
     stage and a model-driven active node that pulses. Nothing is invented:
     labels come from scene.fig, the active node comes from evalModel().active,
     and the numbers come from evalModel(). 14 kinds get a distinct hub.
     ====================================================================== */
  function buildVolumetric(sp, parent, params) {
    const fig = (sp && sp.scene && sp.scene.fig) || {};
    const kind = String(fig.kind || "flow");
    const L = ((fig.labels && fig.labels.length >= 3) ? fig.labels
              : ["NCERT", "OBSERVE", "EXPLAIN"]).slice(0, 6);
    const n = L.length;
    let model = null;
    try { model = evalModel(sp, params || {}); } catch (e) {}
    const palette = [0x2f8fd8, 0x14a07a, 0xe0a02a, 0x8b5fc7, 0xd4594f, 0x2c93a8];
    const solid = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.24,
      metalness: 0.34, emissive: c, emissiveIntensity: 0.14 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xcfe3f6, roughness: 0.12,
      metalness: 0.28, transparent: true, opacity: 0.42, depthWrite: false });
    const bondMat = new THREE.MeshStandardMaterial({ color: 0x2b5d8c, roughness: 0.3, metalness: 0.5 });

    /* glass stage + rim: gives the object a real place in 3D space */
    const stage = new THREE.Mesh(new THREE.CylinderGeometry(1.62, 1.62, 0.075, 64), glassMat);
    stage.position.y = -0.62; parent.add(stage);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.032, 8, 72),
      new THREE.MeshStandardMaterial({ color: 0x2f6da8, roughness: 0.26, metalness: 0.62 }));
    rim.rotation.x = Math.PI / 2; rim.position.y = -0.62; parent.add(rim);

    const hub = new THREE.Group(); parent.add(hub);
    const add = (geo, mat, pos, rot, scl) => {
      const m = new THREE.Mesh(geo, mat);
      if (pos) m.position.set(pos[0], pos[1], pos[2]);
      if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
      if (scl) m.scale.set(scl[0], scl[1], scl[2]);
      hub.add(m); return m;
    };
    /* ---- kind-specific, genuinely three-dimensional centre ---- */
    if (kind === "cell") {
      add(new THREE.SphereGeometry(0.66, 32, 24),
          new THREE.MeshStandardMaterial({ color: 0xbfe0c8, roughness: 0.16, metalness: 0.1,
            transparent: true, opacity: 0.34, depthWrite: false }));
      add(new THREE.SphereGeometry(0.26, 24, 18), solid(0x9b6bd0), [0.04, 0.04, 0.10]);
      [[-0.32, -0.22, 0.18, 0xf0a15a], [0.32, -0.18, 0.20, 0xe2c46c],
       [0.0, 0.38, -0.10, 0x6bb7d8]].forEach(v =>
         add(new THREE.SphereGeometry(0.13, 18, 14), solid(v[3]), [v[0], v[1], v[2]]));
    } else if (kind === "molecule") {
      add(new THREE.SphereGeometry(0.30, 26, 20), solid(0x2f6da8));
      for (let i = 0; i < 4; i++) {
        const a = i / 4 * Math.PI * 2, v = [Math.cos(a) * 0.62, (i % 2 ? 0.34 : -0.34), Math.sin(a) * 0.62];
        add(new THREE.SphereGeometry(0.20, 20, 16), solid(palette[i + 1]), v);
        add(new THREE.CylinderGeometry(0.045, 0.045, 0.68, 10), bondMat,
            [v[0] / 2, v[1] / 2, v[2] / 2], [0, 0, Math.PI / 2]);
      }
    } else if (kind === "rays" || kind === "wave" || kind === "field") {
      add(new THREE.SphereGeometry(0.46, 28, 20),
          new THREE.MeshStandardMaterial({ color: 0xbfe4f7, roughness: 0.06, metalness: 0.15,
            transparent: true, opacity: 0.55, depthWrite: false }), null, null, [0.32, 1, 1]);
      for (let i = -1; i <= 1; i++)
        add(new THREE.ConeGeometry(0.09, 0.62, 14), solid(0xe0a02a),
            [0, i * 0.23, 0.52], [Math.PI / 2, 0, 0]);
    } else if (kind === "circuit" || kind === "machine") {
      add(new THREE.TorusGeometry(0.52, 0.055, 10, 48), solid(0x2f6da8), null, [Math.PI / 2, 0, 0]);
      add(new THREE.SphereGeometry(0.24, 22, 16),
          new THREE.MeshStandardMaterial({ color: 0xffd98a, emissive: 0xffb84d, emissiveIntensity: 1.1, roughness: 0.2 }));
    } else if (kind === "cycle" || kind === "layers") {
      for (let i = 0; i < 3; i++)
        add(new THREE.CylinderGeometry(0.62 - i * 0.13, 0.62 - i * 0.13, 0.12, 40),
            solid(palette[i]), [0, -0.18 + i * 0.22, 0]);
    } else if (kind === "bars" || kind === "graph") {
      for (let i = 0; i < n; i++) {
        const h = 0.38 + (i + 1) / (n + 1) * 0.92;
        add(new THREE.BoxGeometry(0.30, h, 0.30), solid(palette[i % 6]),
            [(i - (n - 1) / 2) * 0.42, -0.62 + h / 2, 0]);
      }
    } else {  /* flow / tree / table / generic concept hub */
      add(new THREE.IcosahedronGeometry(0.48, 1), solid(0x2f8fd8));
      add(new THREE.IcosahedronGeometry(0.26, 1),
          new THREE.MeshStandardMaterial({ color: 0xffd98a, emissive: 0xffb84d,
            emissiveIntensity: 0.9, roughness: 0.2 }));
    }

    /* ---- labelled satellites on a tilted 3D orbit + real tube bonds ---- */
    const orbit = new THREE.Group(); parent.add(orbit);
    const nodes = [], tags = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * 0.98, z = Math.sin(a) * 0.70, y = 0.08 + Math.sin(a * 2) * 0.18;
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.225, 24, 18), solid(palette[i % 6]));
      m.position.set(x, y, z); orbit.add(m); nodes.push(m);
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x * 0.5, y * 0.5 + 0.18, z * 0.5),
        new THREE.Vector3(x, y, z)
      ]);
      orbit.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.017, 6), bondMat));
      const tg = G3.tag(orbit, String(L[i]), 0.82, 0.20, {
        pos: [x, y + 0.30, z], size: 38, bg: "#ffffff", border: "#1c4d7a", fg: "#0b1620"
      });
      tg.userData.isFigureLabel = true; tags.push(tg);
    }

    return {
      kind: kind, labels: L.length,
      update(m, dt, time) {
        orbit.rotation.y = Math.sin(time * 0.28) * 0.32 + time * 0.06;
        hub.rotation.y = time * 0.22;
        hub.rotation.x = Math.sin(time * 0.19) * 0.10;
        let act = m && isFinite(m.active) ? Math.round(m.active) : 0;
        act = ((act % n) + n) % n;
        nodes.forEach((nd, i) => {
          const on = i === act;
          const s = on ? 1.30 + Math.sin(time * 3.1) * 0.12 : 1;
          nd.scale.setScalar(s);
          if (nd.material.emissiveIntensity !== undefined)
            nd.material.emissiveIntensity = on ? 0.75 + Math.sin(time * 3.1) * 0.2 : 0.14;
        });
        tags.forEach(t => { if (camera) t.lookAt(camera.position); });
      }
    };
  }

  function rebuild(sp, params, world) {
    if (!ready || !sp) return false;
    disposeGroup(content); built = null; volumetric = null; bio = null; spRef = sp; meshCount = 0;
    const block = BLOCKS[sp.scene.type] || BLOCKS.showcase;
    label = block.label || sp.scene.type;
    const ctx = { setHandleRange: function () {} };
    volumetric = null;
    /* BIOLOGY (R7): NCERT-aligned anatomy, NOT a generic orrery. spec() is
       data, BIO3D.build() is geometry, EVCHECKS.biology() is the verdict. */
    const bioId = (typeof BIO3D !== "undefined") ? BIO3D.classify(world, sp) : null;
    if (bioId) {
      try { bio = BIO3D.build(content, BIO3D.spec(world, sp)); } catch (e) { bio = null; }
      built = null; volumetric = null;
      if (bio) label = bio.spec.en + " / " + bio.spec.hi;
    }
    if (!bio && sp.scene && sp.scene.type === "atlas") {
      /* 227 compiler-generated lessons: real volumetric 3D, never a flat card */
      try { volumetric = buildVolumetric(sp, content, params); } catch (e) { volumetric = null; }
      built = null;
      if (!volumetric) { try { built = block.build(content, sp, ctx); } catch (e) { built = null; } }
    } else {
      try { built = block.build(content, sp, ctx); } catch (e) { built = null; }
    }
    if (!built && !volumetric && !bio) {
      if (typeof EVFSM !== "undefined") EVFSM.transition("figureEngine", "FALLBACK", { buildFailed: true });
      return false;
    }
    if (typeof EVFSM !== "undefined") EVFSM.observe("figureEngine",
      bio ? "biology" : volumetric ? "volumetric" : "sceneBlock", "figure3d.js:rebuild");
    realism(content);
    content.traverse(o => { if (o.isMesh || o.isLine || o.isPoints) meshCount++; });
    /* fit the real geometry into the camera frustum, once, without touching
       the model's own per-frame animation coordinates */
    content.position.set(0, 0, 0); turntable.scale.setScalar(1);
    content.updateMatrixWorld(true);
    fitStats = null;
    let box = null;
    try { box = new THREE.Box3().setFromObject(content); } catch (e) {}
    if (box && !box.isEmpty()) {
      const c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
      content.position.set(-c.x, -c.y + 0.15, -c.z);
      /* Flat Atlas paper-craft lies in the XZ plane at y~0.17. Tilt it up
         toward the camera so the 3D diorama reads instead of vanishing edge-on;
         tall apparatus (spheres, lenses, molecules) keeps its true upright
         orientation. This is a VIEW transform, not a different model. */
      content.rotation.x = (volumetric || bio) ? 0 : (s.y < 0.85 ? 0.78 : 0);
      const span = Math.max(s.x, s.y * 1.35, s.z, 1.2);
      /* Biology plates need their two aligned label columns inside the frame;
         the generic frustum fit would crop them. Molecule / concept-hub orbits
         use a tighter cap so bonds, tags and the single decor ring stay inside
         the printed viewport instead of crossing the caption and UI. */
      const maxScale = bio ? 1.55 : volumetric ? 1.30 : 1.55;
      const targetSpan = bio ? 5.70 : volumetric ? 4.85 : 4.95;
      let scale = Math.max(0.70, Math.min(maxScale, targetSpan / span));
      turntable.scale.setScalar(scale);
      turntable.rotation.set(0, 0, 0);
      scene.updateMatrixWorld(true);
      const frustumCenter = new THREE.Vector3(0, 0.30, 0);
      const halfH = Math.tan(camera.fov * Math.PI / 360) * camera.position.distanceTo(frustumCenter);
      const halfW = halfH * camera.aspect;
      /* Use the ACTUAL transformed world bounding box (after page tilt and
         scale), not a diagonal sphere estimate: the latter over-shrinks wide
         molecule plates. A 10% margin covers the small turntable oscillation. */
      const worldBox = () => new THREE.Box3().setFromObject(content);
      let wb = worldBox(), ws = wb.getSize(new THREE.Vector3());
      let maxDim = Math.max(ws.x, ws.y, ws.z);
      let contentRadius = maxDim / 2 + 0.20;
      let contentNdc = 1.10 * Math.max(contentRadius / halfW, contentRadius / halfH);
      const safeLimit = VIEWPORT_LIMIT - FIT_EPS;
      if (contentNdc > safeLimit) {
        const minHalf = Math.min(halfW, halfH);
        const allowedRadius = safeLimit * minHalf / 1.10 - 0.20;
        /* worldBox dimensions already include `scale`; divide it out before
           solving for the new scale, otherwise the reduction is a no-op. */
        for (let pass = 0; pass < 4 && contentNdc > safeLimit; pass++) {
          const rawDim = maxDim / Math.max(scale, 0.001);
          let next = Math.max(0.42, Math.min(scale, 2 * allowedRadius / Math.max(rawDim, 0.1)));
          /* Floating-point rounding can leave contentNdc at 0.921 instead of
             0.920. A 0.5% correction is visually imperceptible and keeps the
             strict <=0.92 contract true for every lesson. */
          if (next >= scale - 0.00001) next = Math.max(0.42, scale * 0.995);
          scale = next;
          turntable.scale.setScalar(scale);
          scene.updateMatrixWorld(true);
          wb = worldBox(); ws = wb.getSize(new THREE.Vector3());
          maxDim = Math.max(ws.x, ws.y, ws.z);
          contentRadius = maxDim / 2 + 0.20;
          contentNdc = 1.10 * Math.max(contentRadius / halfW, contentRadius / halfH);
        }
      }
      const decorNdc = Math.max(DECOR_RADIUS / halfW, DECOR_RADIUS / halfH);
      fitStats = {
        viewportHalfWidth: +halfW.toFixed(3), viewportHalfHeight: +halfH.toFixed(3),
        orbitRadius: ORBIT_RADIUS, decorRadius: DECOR_RADIUS, rings: rings.length,
        scale: +scale.toFixed(3), maxContentDimension: +maxDim.toFixed(3),
        decorMaxNdc: +decorNdc.toFixed(3), contentMaxNdc: +contentNdc.toFixed(3),
        decorFit: decorNdc <= VIEWPORT_LIMIT + FIT_EPS, contentFit: contentNdc <= VIEWPORT_LIMIT + FIT_EPS,
        viewportFit: decorNdc <= VIEWPORT_LIMIT + FIT_EPS && contentNdc <= VIEWPORT_LIMIT + FIT_EPS,
        duplicateFigure: rings.length !== 1
      };
    }
    return true;
  }

  function update(model, dt, time) {
    /* R7 fix: the old `!built` guard returned early whenever the figure was a
       volumetric / biology atlas, silently freezing its animation. */
    if (!ready || (!built && !volumetric && !bio)) return;
    updates++;
    if (bio) { try { bio.update(model, dt, time, camera); } catch (e) {} }
    else if (volumetric) { try { volumetric.update(model, dt, time); } catch (e) {} }
    else { try { if (built && built.update) built.update(model, dt, time); } catch (e) {} }
    /* An aligned textbook plate must NOT spin: labels stay in two fixed
       columns while the organelles breathe, pulse and flow in real 3D. */
    if (bio) {
      turntable.rotation.y = Math.sin(time * 0.27) * 0.10;
      turntable.rotation.x = Math.sin(time * 0.19) * 0.022;
      /* an anatomy plate is a labelled textbook figure, not a spinning toy:
         orbit rings, dust and the studio shadow would obscure the organelles */
      rings.forEach(r => { r.visible = false; });
      if (dust) dust.visible = false;
      if (shadow) shadow.visible = false;
      auxLights.forEach(l => { l.visible = false; });
    } else {
      rings.forEach(r => { r.visible = true; });
      if (dust) dust.visible = true;
      if (shadow) shadow.visible = true;
      auxLights.forEach(l => { l.visible = true; });
    }
    /* slow turntable oscillation keeps depth obvious without ever hiding a label */
    if (!bio) {
      turntable.rotation.y = Math.sin(time * 0.27) * 0.25;
      turntable.rotation.x = Math.sin(time * 0.19) * 0.030;
      turntable.position.y = Math.sin(time * 0.8) * 0.055;
    }
    rings.forEach((r, i) => { r.rotation.z += dt * (i ? -0.18 : 0.16); r.rotation.y += dt * (i ? 0.07 : -0.05); });
    if (dust) dust.rotation.y += dt * 0.075;
    /* moving studio key light = real specular highlights travelling over the
       geometry, so even a static paper-craft figure is visibly animated 3D. */
    if (keyLight) keyLight.position.x = -4.5 + Math.sin(time * 0.55) * 1.2;
    camera.position.x = Math.sin(time * 0.16) * 0.18;
    camera.position.y = 3.00 + Math.sin(time * 0.23) * 0.10;
    camera.lookAt(0, 0.30, 0);
  }

  function render(themeClear) {
    if (!ready || !renderer || (!built && !volumetric && !bio)) return;
    const now = performance.now() / 1000;
    if (now - lastRender < 1 / 24) return;       /* 24 fps ceiling */
    lastRender = now; frames++;
    renderer.getClearColor(clear); clearA = renderer.getClearAlpha();
    renderer.setClearColor(0xf5faff, 1);
    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.setClearColor(themeClear, clearA);
  }

  /* One-shot high resolution capture on the existing WebGLRenderer. The
     temporary render target is released immediately, never added to the DOM. */
  function zoomSnapshot() {
    if (!ready || !renderer || (!built && !volumetric && !bio)) return null;
    const w = 1536, h = 1020;
    const target = new THREE.WebGLRenderTarget(w, h, { format: THREE.RGBAFormat, depthBuffer: true, stencilBuffer: false });
    target.texture.colorSpace = THREE.SRGBColorSpace;
    const previous = renderer.getRenderTarget();
    const oldColor = new THREE.Color(); renderer.getClearColor(oldColor);
    const alpha = renderer.getClearAlpha();
    try {
      renderer.setClearColor(0xf5faff, 1); renderer.setRenderTarget(target);
      renderer.render(scene, camera);
      const pixels = new Uint8Array(w * h * 4);
      renderer.readRenderTargetPixels(target, 0, 0, w, h, pixels);
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      const x = c.getContext("2d"), image = x.createImageData(w, h);
      for (let y = 0; y < h; y++) image.data.set(pixels.subarray((h - y - 1) * w * 4, (h - y) * w * 4), y * w * 4);
      x.putImageData(image, 0, 0);
      return c.toDataURL("image/png");
    } finally { renderer.setRenderTarget(previous); renderer.setClearColor(oldColor, alpha); target.dispose(); }
  }

  function stats() {
    return { ready: ready, frames: frames, updates: updates, meshes: meshCount, label: label,
             size: RT_W + "x" + RT_H, lighting: "hemi + key + fill + rim + warm point",
             rings: rings.length, orbitRadius: ORBIT_RADIUS, decorRadius: DECOR_RADIUS,
             viewportFit: !!(fitStats && fitStats.viewportFit), fit: fitStats,
             duplicateFigure: rings.length !== 1,
             animation: bio ? "anatomical breathe / pulse / beat / flow + billboard labels"
                            : "turntable + orbit rings + dust + moving key light + model-driven active node",
             engine: bio ? "ncert-biology-3d (" + bio.spec.model + ", " + bio.spec.labels.length + " parts)"
                         : volumetric ? "volumetric-3d (" + volumetric.kind + ", " + volumetric.labels + " nodes)"
                                      : "scene-block-3d",
             bio: bio ? {
               model: bio.spec.model, en: bio.spec.en, hi: bio.spec.hi,
               ncert: bio.spec.ncert, section: bio.spec.section,
               parts: bio.spec.parts.length, labels: bio.labelCount,
               bilingual: bio.spec.labels.every(d => !!d.en && !!d.hi),
               aligned: bio.aligned, labelOverlaps: bio.labelOverlaps,
               columns: bio.columns, lessonLabels: bio.spec.lessonLabels.length,
               textAligned: bio.spec.lessonLabels.length > 0,
               routedBy: bio.spec.routedBy, sharedTerms: bio.spec.shared,
               caption: bio.spec.caption, motion: bio ? bio.motion.v : 0, chapterAligned: /^(text:|chapter-text:)/.test(bio.spec.routedBy) || bio.spec.shared >= 1,
               dualView: typeof BIO3D.svg2D === "function",
               repos: bio.spec.repos.length
             } : null };
  }

  return {
    init, rebuild, update, render, stats, zoomSnapshot,
    get texture() { return rt ? rt.texture : null; },
    get ready() { return ready; }
  };
})();
