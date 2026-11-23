/* ==========================================================================
   EVENGINE — MASTER ENGINE KIT (Prompt 1 of 5)
   --------------------------------------------------------------------------
   "One figure engine for every subject" — Atlas-of-Physics discipline, applied
   to the EXISTING offline EduVerse bundle. This is a classic-script factory,
   NOT React, NOT a second WebGLRenderer, NOT a CDN module. It returns plain
   THREE.Group scene graphs that the shipped FIGURE3D render target can draw.

   APPROVED local GitHub research only (docs/GITHUB_REPOS_USAGE.md, RESEARCH.md):
     * nathanliow/atlas-of-physics      -> model != world != checks; one engine
     * gogulashashank/cbse-interactive-lab -> 3D + 2D share ONE scientific state
     * ujjval93/3D_Notes                -> {en, hi} are first-class fields
     * rudra496/sciencelab3d            -> experiment catalogue, live state
     * AlphaaCode/Popbook               -> validated JSON-only content
     * james123wang5/every-joule-style  -> subject -> apparatus recipes
     * 123bruke/3d_labs                 -> measurement-driven validation
     * tmsteph/3dvr-portal#3381         -> predict -> experiment -> observe
   No repository was cloned; no third-party code was vendored; 0 external refs.

   STRICT SCOPE: Prompt 1 ONLY. This file declares the factory contract,
   generic primitives, bilingual labels, part registry, raycast targets,
   focus/dim hook, model-driven update hook and perfect dispose(). Steps 2-4
   are now supplied by EVPACK/EVSTATE/EVBIND, O3/O3LAB and EVDICT/EVPROJ; only
   Prompt 5 ships inert lazy chapter packs and procedural organs on this same registry.

   Copyright / Developer : Paras Pranav
   ========================================================================== */

const EVENGINE = (function () {
  'use strict';
  const VERSION = '2.0.0';
  const CREDIT = 'Copyright / Developer : Paras Pranav';
  const CLASSES = ['IX', 'X', 'XI', 'XII'];
  const SUBJECT_ENGINE = { biology: 'bio', chemistry: 'chem', physics: 'phys' };
  const RESEARCH = [
    'nathanliow/atlas-of-physics (model/world/checks; one engine)',
    'gogulashashank/cbse-interactive-lab (3D + 2D, one model, NCERT IX-X)',
    'ujjval93/3D_Notes (bilingual Hindi/English NCERT IX + X, no CDN)',
    'rudra496/sciencelab3d (MIT, 40+ IX-X experiment patterns)',
    'AlphaaCode/Popbook (validated declarative JSON only)',
    'james123wang5/every-joule-style (subject -> apparatus recipes)',
    '123bruke/3d_labs (measurement-driven validation)',
    'tmsteph/3dvr-portal#3381 (predict -> experiment -> observe -> explain)'
  ];

  const registry = {};
  const has = (a, v) => a.indexOf(v) >= 0;
  const num = (v, d) => (typeof v === 'number' && isFinite(v)) ? v : d;
  const arr3 = (v, d) => (Array.isArray(v) && v.length >= 3) ? [v[0], v[1], v[2]] : d;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const V3 = a => new THREE.Vector3(a[0], a[1], a[2]);
  const COLOR = (v, d) => (v === undefined || v === null) ? d : v;

  function text(part, lang) {
    const en = part.label_en || part.title_en || part.id || 'part';
    const hi = part.label_hi || part.title_hi || en;
    if (lang === 'en') return String(en);
    if (lang === 'hi') return String(hi);
    return String(en) + ' / ' + String(hi);
  }

  /* ------------------------------------------------------------ primitives */
  function sideOf(v) {
    if (v === 'double') return THREE.DoubleSide;
    if (v === 'back') return THREE.BackSide;
    return THREE.FrontSide;
  }
  function baseMaterial(part, opts, shape) {
    const color = COLOR(part.color, opts.defaults && opts.defaults.color || 0x2f6f9f);
    const opacity = clamp(num(part.opacity, 1), 0, 1);
    const transparent = opacity < 1 || !!part.transparent;
    if (shape === 'line' || shape === 'graph' || shape === 'polyline' || shape === 'lineSegments') {
      const m = new THREE.LineBasicMaterial({ color: color, transparent: transparent, opacity: opacity, linewidth: num(part.linewidth, 1) });
      m.userData.baseOpacity = opacity; m.userData.forceTransparent = transparent; m.userData.baseColor = m.color.clone();
      return m;
    }
    if (shape === 'points') {
      const m = new THREE.PointsMaterial({ color: color, size: num(part.pointSize, 0.09), sizeAttenuation: true, transparent: transparent, opacity: opacity, depthWrite: !transparent });
      m.userData.baseOpacity = opacity; m.userData.forceTransparent = transparent; m.userData.baseColor = m.color.clone();
      return m;
    }
    const m = new THREE.MeshStandardMaterial({
      color: color,
      roughness: clamp(num(part.roughness, 0.52), 0.04, 1),
      metalness: clamp(num(part.metalness, 0.06), 0, 1),
      emissive: new THREE.Color(COLOR(part.emissive, 0x000000)),
      emissiveIntensity: num(part.emissiveIntensity, 0.12),
      transparent: transparent, opacity: opacity,
      depthWrite: !transparent, side: sideOf(part.side),
      wireframe: !!part.wireframe, flatShading: !!part.flatShading
    });
    m.userData.baseOpacity = opacity; m.userData.forceTransparent = transparent; m.userData.baseColor = m.color.clone();
    return m;
  }

  function shapeOf(part) {
    if (part.shape) return part.shape;
    const map = {
      atom: 'sphere', organelle: 'sphere', cell: 'sphere', membrane: 'sphere', nucleus: 'sphere',
      particle: 'points', layer: 'plane', crossSection: 'box', slab: 'box', resistor: 'box',
      axis: 'cylinder', vessel: 'tube', fiber: 'tube', wire: 'tube', ray: 'tube', bond: 'bond',
      mirror: 'torus', lens: 'lathe', graph: 'line', polyline: 'line', line: 'line',
      arrow: 'arrow', vector: 'arrow', objectArrow: 'arrow', imageArrow: 'arrow',
      battery: 'battery', label: 'label', sphere: 'sphere', box: 'box', cylinder: 'cylinder',
      capsule: 'capsule', torus: 'torus', plane: 'plane', lathe: 'lathe', tube: 'tube',
      points: 'points', lineSegments: 'lineSegments'
    };
    return map[part.kind] || 'sphere';
  }
  function pointsOf(part) {
    let pts = part.points;
    if (!pts && part.from && part.to) {
      pts = [part.from].concat(part.via || [], [part.to]);
    }
    if (!Array.isArray(pts) || pts.length < 2) pts = [[0, 0, 0], [0, 1, 0]];
    return pts.map(p => Array.isArray(p) ? V3(p) : p.clone());
  }
  function primitiveGeometry(part, shape) {
    const size = part.size || [1, 1, 1];
    const seg = num(part.segments, 24);
    switch (shape) {
      case 'sphere': {
        const r = num(part.radius, num(size[0], 1) * 0.5);
        return new THREE.SphereGeometry(r, seg, Math.max(8, Math.floor(seg * 0.66)));
      }
      case 'capsule': {
        const r = num(part.radius, 0.35), len = num(part.length, 1);
        return new THREE.CapsuleGeometry(r, len, 8, seg);
      }
      case 'box': return new THREE.BoxGeometry(num(part.width, size[0]), num(part.height, size[1]), num(part.depth, size[2]));
      case 'cylinder': {
        const r = num(part.radius, 0.16), rt = num(part.radiusTop, r), rb = num(part.radiusBottom, r);
        return new THREE.CylinderGeometry(rt, rb, num(part.height, size[1]), seg);
      }
      case 'torus': return new THREE.TorusGeometry(num(part.radius, 1.2), num(part.tube, 0.07), Math.max(6, Math.floor(seg * 0.5)), seg, num(part.arc, Math.PI * 1.15));
      case 'plane': return new THREE.PlaneGeometry(num(part.width, size[0]), num(part.height, size[1]));
      case 'lathe': {
        const profile = (part.profile && part.profile.length >= 2) ? part.profile : [[0, -1], [0.42, -0.62], [0.58, 0], [0.42, 0.62], [0, 1]];
        return new THREE.LatheGeometry(profile.map(p => new THREE.Vector2(num(p[0], 0), num(p[1], 0))), seg);
      }
      case 'tube': {
        const curve = new THREE.CatmullRomCurve3(pointsOf(part), !!part.closed, 'centripetal', 0.5);
        return new THREE.TubeGeometry(curve, num(part.tubularSegments, 28), num(part.radius, 0.035), Math.max(4, Math.floor(seg * 0.35)), !!part.closed);
      }
      case 'line': case 'graph': case 'polyline': {
        return new THREE.BufferGeometry().setFromPoints(pointsOf(part));
      }
      case 'lineSegments': {
        return new THREE.BufferGeometry().setFromPoints(pointsOf(part));
      }
      case 'points': {
        let pts;
        if (part.points) pts = part.points.map(p => Array.isArray(p) ? V3(p) : p.clone());
        else {
          const n = clamp(Math.floor(num(part.count, 24)), 1, 400); pts = [];
          for (let i = 0; i < n; i++) {
            const a = Math.sin(i * 12.9898) * 43758.5453, b = Math.sin(i * 78.233) * 12345.6789, c = Math.sin(i * 39.425) * 9876.5432;
            pts.push(new THREE.Vector3((a - Math.floor(a) - 0.5) * 2, (b - Math.floor(b) - 0.5) * 2, (c - Math.floor(c) - 0.5) * 2));
          }
        }
        return new THREE.BufferGeometry().setFromPoints(pts);
      }
      default: return new THREE.SphereGeometry(num(part.radius, 0.5), seg, 12);
    }
  }

  function cylinderBetween(a, b, radius, material) {
    const dir = b.clone().sub(a), len = Math.max(0.0001, dir.length());
    const geo = new THREE.CylinderGeometry(radius, radius, len, 10);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return mesh;
  }
  function arrowGroup(part, opts) {
    const from = V3(arr3(part.from, [0, 0, 0])), to = V3(arr3(part.to, [0, 1, 0]));
    const dir = to.clone().sub(from), len = Math.max(0.0001, dir.length());
    const head = clamp(num(part.headLength, 0.20), 0.05, len * 0.6);
    const shaftLen = Math.max(0.0001, len - head);
    const matShaft = baseMaterial(Object.assign({}, part, { color: COLOR(part.color, 0xd45c2a) }), opts, 'sphere');
    const matHead = baseMaterial(Object.assign({}, part, { color: COLOR(part.headColor, part.color || 0xd45c2a) }), opts, 'sphere');
    const g = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(num(part.radius, 0.035), num(part.radius, 0.035), shaftLen, 10), matShaft);
    shaft.position.y = shaftLen / 2;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(num(part.headRadius, 0.10), head, 12), matHead);
    cone.position.y = shaftLen + head / 2;
    g.add(shaft, cone);
    g.position.copy(from);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    g.userData.hasEndpoints = true;
    return g;
  }
  function bondGroup(part, opts) {
    const a = V3(arr3(part.from, [0, 0, 0])), b = V3(arr3(part.to, [0, 1, 0]));
    const dir = b.clone().sub(a).normalize();
    let perp = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0));
    if (perp.lengthSq() < 1e-6) perp = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(1, 0, 0));
    perp.normalize();
    const order = clamp(Math.floor(num(part.order, 1)), 1, 3);
    const spacing = num(part.spacing, 0.10), r = num(part.radius, 0.035);
    const g = new THREE.Group();
    for (let i = 0; i < order; i++) {
      const off = perp.clone().multiplyScalar((i - (order - 1) / 2) * spacing);
      const mat = baseMaterial(Object.assign({}, part, { color: COLOR(part.color, 0x39566d) }), opts, 'sphere');
      g.add(cylinderBetween(a.clone().add(off), b.clone().add(off), r, mat));
    }
    g.userData.hasEndpoints = true;
    return g;
  }
  function batteryGroup(part, opts) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(num(part.width, 0.9), num(part.height, 0.42), num(part.depth, 0.34)),
      baseMaterial(Object.assign({}, part, { color: COLOR(part.color, 0x254a68) }), opts, 'sphere'));
    const pos = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.22, 10),
      baseMaterial({ color: 0xc0392b }, opts, 'sphere'));
    pos.position.set(-0.24, 0.30, 0);
    const neg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.22, 10),
      baseMaterial({ color: 0x1b3a55 }, opts, 'sphere'));
    neg.position.set(0.24, 0.30, 0);
    g.add(body, pos, neg);
    return g;
  }
  function labelSprite(part, opts) {
    const s = text(part, opts.lang || 'both');
    const c = document.createElement('canvas'); c.width = 512; c.height = 128;
    const x = c.getContext('2d');
    x.fillStyle = part.bg || '#ffffff'; x.fillRect(0, 0, 512, 128);
    x.strokeStyle = part.border || '#0b1620'; x.lineWidth = 5; x.strokeRect(2.5, 2.5, 507, 123);
    x.fillStyle = part.ink || '#0b1620'; x.textBaseline = 'middle';
    let fs = 40;
    do { x.font = '700 ' + fs + 'px Arial, "Noto Sans Devanagari Embedded", sans-serif'; fs -= 2; }
    while (x.measureText(s).width > 470 && fs > 18);
    x.fillText(s, 18, 66);
    const tex = new THREE.CanvasTexture(c); tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
    tex.userData.isTexture = true;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false });
    mat.userData.baseOpacity = 1; mat.userData.forceTransparent = true; mat.userData.baseColor = new THREE.Color(0xffffff);
    const sp = new THREE.Sprite(mat);
    const sz = part.size || [2.2, 0.55, 1];
    sp.scale.set(sz[0], sz[1], 1);
    sp.userData.isLabel = true;
    return sp;
  }

  function tag(obj, part, opts, rootId) {
    const rid = rootId || part.id;
    obj.traverse(o => {
      o.userData.partId = part.id;
      o.userData.rootPartId = rid;
      o.userData.engine = opts.engine;
      o.userData.labelEn = part.label_en || part.title_en || String(part.id);
      o.userData.labelHi = part.label_hi || part.title_hi || o.userData.labelEn;
      o.userData.pickable = part.pickable !== false && !o.isSprite && !o.userData.isLabel;
      o.userData.modelOpacity = 1;
      o.userData.focusTarget = false;
      if (o.scale) o.userData.baseScale = o.scale.clone();
      const mm = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
      mm.forEach(m => {
        if (m.userData.baseOpacity === undefined) m.userData.baseOpacity = m.opacity === undefined ? 1 : m.opacity;
        if (m.userData.forceTransparent === undefined) m.userData.forceTransparent = !!m.transparent;
        if (!m.userData.baseColor && m.color) m.userData.baseColor = m.color.clone();
      });
    });
    obj.userData.baseScale = obj.scale.clone();
    return obj;
  }
  function applyTransform(obj, part) {
    if (part.position && !obj.userData.hasEndpoints) obj.position.set(part.position[0], part.position[1], part.position[2]);
    if (part.rotation) obj.rotation.set(part.rotation[0], part.rotation[1], part.rotation[2]);
    if (part.scale !== undefined) {
      const s = part.scale;
      if (typeof s === 'number') obj.scale.set(s, s, s);
      else if (Array.isArray(s) && s.length >= 3) obj.scale.set(s[0], s[1], s[2]);
    }
    if (part.visible !== undefined) obj.visible = !!part.visible;
    obj.userData.baseScale = obj.scale.clone();
  }
  function build(part, opts, rootId) {
    const shape = shapeOf(part);
    let obj;
    if (shape === 'label') obj = labelSprite(part, opts);
    else if (shape === 'arrow') obj = arrowGroup(part, opts);
    else if (shape === 'bond') obj = bondGroup(part, opts);
    else if (shape === 'battery') obj = batteryGroup(part, opts);
    else {
      const geo = primitiveGeometry(part, shape);
      const mat = baseMaterial(part, opts, shape);
      if (shape === 'line' || shape === 'graph' || shape === 'polyline') obj = new THREE.Line(geo, mat);
      else if (shape === 'lineSegments') obj = new THREE.LineSegments(geo, mat);
      else if (shape === 'points') obj = new THREE.Points(geo, mat);
      else obj = new THREE.Mesh(geo, mat);
    }
    applyTransform(obj, part);
    return tag(obj, part, opts, rootId);
  }

  /* ------------------------------------------------------------- instance */
  function begin(spec, engineId, opts) {
    const o = Object.assign({}, opts || {}, { engine: engineId, lang: (opts && opts.lang) || 'both' });
    const group = new THREE.Group();
    group.name = 'EVENGINE_' + engineId + '_' + spec.id;
    group.userData = { engine: engineId, specId: spec.id, class: spec.class, subject: spec.subject };
    const inst = {
      group: group, parts: {}, roots: {}, focused: null, disposed: false,
      dynamic: new THREE.Group(), _segmentMeshes: {}, _t: 0, lastModel: null,
      spec: spec, engine: engineId, opts: o
    };
    inst.dynamic.name = 'EVENGINE_DYNAMIC';
    group.add(inst.dynamic);
    return inst;
  }
  function add(inst, part, rootId) {
    const rid = rootId || part.id;
    const obj = build(part, inst.opts, rid);
    const parent = (part.parent && inst.parts[part.parent]) ? inst.parts[part.parent] : inst.group;
    parent.add(obj);
    inst.parts[part.id] = obj;
    if (!inst.roots[rid]) inst.roots[rid] = obj;
    (part.children || []).forEach(ch => add(inst, ch, rid));
    return obj;
  }
  function isDescendantOf(o, root) {
    let p = o;
    while (p) { if (p === root) return true; p = p.parent; }
    return false;
  }
  function refreshOpacity(inst) {
    inst.group.traverse(o => {
      const mm = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
      mm.forEach(m => {
        const base = m.userData.baseOpacity === undefined ? 1 : m.userData.baseOpacity;
        const model = o.userData.modelOpacity === undefined ? 1 : o.userData.modelOpacity;
        const isTarget = !!o.userData.focusTarget;
        m.opacity = clamp(inst.focused && !isTarget ? 0.15 * model : base * model, 0, 1);
        m.transparent = m.opacity < 1 || !!m.userData.forceTransparent;
        if ('depthWrite' in m) m.depthWrite = m.opacity >= 1 && !m.userData.forceTransparent;
      });
    });
  }
  function resetScales(inst) {
    Object.keys(inst.roots).forEach(id => {
      const r = inst.roots[id];
      if (r && r.userData.baseScale) r.scale.copy(r.userData.baseScale);
    });
  }
  function focus(inst, id) {
    if (inst.disposed) return null;
    const root = id ? (inst.roots[id] || inst.parts[id] || null) : null;
    inst.focused = root ? id : null;
    inst.group.traverse(o => { o.userData.focusTarget = root ? isDescendantOf(o, root) : false; });
    resetScales(inst);
    refreshOpacity(inst);
    return inst.focused;
  }
  function setColor(o, color) {
    o.traverse(n => {
      const mm = n.material ? (Array.isArray(n.material) ? n.material : [n.material]) : [];
      mm.forEach(m => { if (m.color) m.color.set(color); });
    });
  }
  function setOpacity(inst, o, opacity) {
    o.traverse(n => { n.userData.modelOpacity = clamp(num(opacity, 1), 0, 1); });
    refreshOpacity(inst);
  }
  function segmentGeometry(seg) {
    if (seg.kind === 'line' || seg.kind === 'graph') return new THREE.BufferGeometry().setFromPoints(pointsOf(seg));
    const curve = new THREE.CatmullRomCurve3(pointsOf(seg), !!seg.closed, 'centripetal', 0.5);
    return new THREE.TubeGeometry(curve, num(seg.tubularSegments, 20), num(seg.radius, 0.028), 6, !!seg.closed);
  }
  function segmentMaterial(seg, opts) {
    const color = COLOR(seg.color, 0x004f96), opacity = clamp(num(seg.opacity, 1), 0, 1);
    if (seg.kind === 'line' || seg.kind === 'graph') {
      const m = new THREE.LineBasicMaterial({ color: color, transparent: opacity < 1, opacity: opacity });
      m.userData.baseOpacity = opacity; m.userData.forceTransparent = opacity < 1; m.userData.baseColor = m.color.clone();
      return m;
    }
    const m = new THREE.MeshStandardMaterial({ color: color, roughness: 0.4, metalness: 0.05,
      emissive: new THREE.Color(COLOR(seg.emissive, 0x000000)), emissiveIntensity: num(seg.emissiveIntensity, 0.2),
      transparent: opacity < 1, opacity: opacity, depthWrite: opacity >= 1 });
    m.userData.baseOpacity = opacity; m.userData.forceTransparent = opacity < 1; m.userData.baseColor = m.color.clone();
    return m;
  }
  function rebuildSegments(inst, segments) {
    if (inst.disposed || !Array.isArray(segments)) return 0;
    const seen = {};
    segments.forEach((seg, i) => {
      const id = seg.partId || seg.id || ('segment_' + i);
      let mesh = inst._segmentMeshes[id];
      const geo = segmentGeometry(seg);
      if (!mesh) {
        const pseudo = { id: id, kind: seg.kind || 'ray', label_en: seg.label_en || 'Segment', label_hi: seg.label_hi || 'खंड', pickable: seg.pickable !== false };
        mesh = (seg.kind === 'line' || seg.kind === 'graph') ? new THREE.Line(geo, segmentMaterial(seg, inst.opts)) : new THREE.Mesh(geo, segmentMaterial(seg, inst.opts));
        tag(mesh, pseudo, inst.opts, id);
        inst.dynamic.add(mesh);
        inst._segmentMeshes[id] = mesh; inst.parts[id] = mesh; inst.roots[id] = mesh;
      } else {
        const old = mesh.geometry; mesh.geometry = geo; if (old) { old.dispose(); old.userData.disposed = true; }
        if (seg.color && mesh.material && mesh.material.color) mesh.material.color.set(seg.color);
        if (seg.opacity !== undefined && mesh.material) {
          mesh.material.userData.baseOpacity = clamp(num(seg.opacity, 1), 0, 1);
          refreshOpacity(inst);
        }
      }
      seen[id] = true;
    });
    Object.keys(inst._segmentMeshes).forEach(id => {
      if (seen[id]) return;
      const m = inst._segmentMeshes[id];
      inst.dynamic.remove(m);
      m.traverse(o => {
        if (o.geometry) { o.geometry.dispose(); o.geometry.userData.disposed = true; }
        const mm = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
        mm.forEach(x => { x.dispose(); x.userData.disposed = true; });
      });
      delete inst._segmentMeshes[id]; delete inst.parts[id]; delete inst.roots[id];
    });
    return segments.length;
  }
  function applyModel(inst, model, dt, time) {
    if (inst.disposed) return inst;
    const m = model || {};
    inst._t += num(dt, 0);
    if (m.focus !== undefined) focus(inst, m.focus || null);
    if (m.parts) Object.keys(m.parts).forEach(id => {
      const o = inst.parts[id], s = m.parts[id];
      if (!o || !s) return;
      if (s.position) o.position.set(s.position[0], s.position[1], s.position[2]);
      if (s.rotation) o.rotation.set(s.rotation[0], s.rotation[1], s.rotation[2]);
      if (s.scale !== undefined) {
        if (typeof s.scale === 'number') o.scale.set(s.scale, s.scale, s.scale);
        else if (Array.isArray(s.scale) && s.scale.length >= 3) o.scale.set(s.scale[0], s.scale[1], s.scale[2]);
        o.userData.baseScale = o.scale.clone();
      }
      if (s.color !== undefined) setColor(o, s.color);
      if (s.opacity !== undefined) setOpacity(inst, o, s.opacity);
      if (s.visible !== undefined) o.visible = !!s.visible;
    });
    if (m.segments) rebuildSegments(inst, m.segments);
    if (inst.focused) {
      const root = inst.roots[inst.focused] || inst.parts[inst.focused];
      if (root && root.userData.baseScale) {
        const t = (typeof time === 'number') ? time : inst._t;
        root.scale.copy(root.userData.baseScale).multiplyScalar(1 + 0.06 * Math.sin(t * 4.2));
      }
    }
    inst.lastModel = m;
    return inst;
  }
  function raycastTargets(inst) {
    if (inst.disposed) return [];
    const out = [];
    inst.group.traverse(o => {
      if (!o.userData || !o.userData.partId || o.userData.pickable === false) return;
      if (o.isMesh || o.isLine || o.isLineSegments || o.isPoints) out.push(o);
    });
    return out;
  }
  function dispose(inst) {
    if (inst.disposed) return { disposed: true, geometries: 0, materials: 0, textures: 0 };
    let geometries = 0, materials = 0, textures = 0;
    inst.group.traverse(o => {
      if (o.geometry) { o.geometry.dispose(); o.geometry.userData.disposed = true; geometries++; }
      const mm = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
      mm.forEach(m => {
        if (!m) return;
        if (m.map) { m.map.dispose(); m.map.userData.disposed = true; textures++; }
        m.dispose(); m.userData.disposed = true; materials++;
      });
    });
    while (inst.group.children.length) inst.group.remove(inst.group.children[0]);
    inst.parts = {}; inst.roots = {}; inst._segmentMeshes = {};
    inst.focused = null; inst.dynamic = null; inst.lastModel = null; inst.disposed = true;
    return { disposed: true, geometries: geometries, materials: materials, textures: textures };
  }
  function stats(inst) {
    let meshes = 0, labels = 0;
    if (!inst.disposed) inst.group.traverse(o => { if (o.isMesh) meshes++; if (o.isSprite || o.userData.isLabel) labels++; });
    return {
      engine: inst.engine, class: inst.spec.class, subject: inst.spec.subject,
      specId: inst.spec.id, parts: Object.keys(inst.parts).length, roots: Object.keys(inst.roots).length,
      meshes: meshes, labels: labels, raycastTargets: raycastTargets(inst).length,
      dynamic: inst._segmentMeshes ? Object.keys(inst._segmentMeshes).length : 0,
      focused: inst.focused, disposed: inst.disposed
    };
  }
  function finalize(inst) {
    inst._baseUpdate = function (model, dt, time) { return applyModel(inst, model, dt, time); };
    inst.update = inst._baseUpdate;
    inst.focus = function (id) { return focus(inst, id); };
    inst.raycastTargets = function () { return raycastTargets(inst); };
    inst.dispose = function () { return dispose(inst); };
    inst.setSegments = function (segs) { return rebuildSegments(inst, segs); };
    inst.stats = function () { return stats(inst); };
    return inst;
  }

  /* --------------------------------------------------------------- registry */
  function register(id, descriptor) {
    if (!id || registry[id]) throw new Error('EVENGINE duplicate/missing engine: ' + id);
    if (!descriptor || typeof descriptor.create !== 'function') throw new Error('EVENGINE engine needs create(): ' + id);
    registry[id] = Object.assign({ id: id, classes: CLASSES.slice(), subjects: [] }, descriptor);
    (descriptor.subjects || []).forEach(s => { SUBJECT_ENGINE[s] = id; });
    return registry[id];
  }
  function validate(spec) {
    const p = [];
    if (!spec || typeof spec !== 'object') return ['spec must be an object'];
    if (!spec.id) p.push('missing spec.id');
    if (!has(CLASSES, spec.class)) p.push('spec.class must be IX or X');
    if (!spec.subject || !SUBJECT_ENGINE[spec.subject]) p.push('spec.subject must be biology/chemistry/physics');
    const eid = spec.engine || SUBJECT_ENGINE[spec.subject];
    if (spec.engine && spec.engine !== eid) p.push('spec.engine conflicts with spec.subject');
    if (!registry[eid]) p.push('no engine registered for ' + eid);
    if (!spec.title_en || !spec.title_hi) p.push('bilingual title_en/title_hi required');
    const collections = ['parts', 'organelles', 'atoms', 'bonds', 'particles', 'rays', 'optics', 'circuit', 'vectors', 'flasks', 'segments'];
    if (!collections.some(k => Array.isArray(spec[k]) && spec[k].length))
      p.push('at least one declarative part collection required (parts/organelles/atoms/rays/segments/...)');
    const ids = {};
    (spec.parts || []).forEach((part, i) => {
      if (!part || !part.id) { p.push('part[' + i + '] missing id'); return; }
      if (ids[part.id]) p.push('duplicate part id: ' + part.id);
      ids[part.id] = true;
      if (!part.kind && !part.shape) p.push('part ' + part.id + ' missing kind/shape');
      if (!part.label_en || !part.label_hi) p.push('part ' + part.id + ' needs label_en/label_hi');
    });
    return p;
  }
  function create(spec, opts) {
    const problems = validate(spec);
    if (problems.length) throw new Error('EVENGINE invalid spec: ' + problems.join('; '));
    const eid = spec.engine || SUBJECT_ENGINE[spec.subject], factory = registry[eid];
    return factory.create(spec, opts || {});
  }
  function engines() {
    return Object.keys(registry).map(id => ({
      id: id, label_en: registry[id].label_en, label_hi: registry[id].label_hi,
      subjects: registry[id].subjects.slice(), classes: registry[id].classes.slice(),
      kinds: (registry[id].kinds || []).slice()
    }));
  }
  function demoSpec(eid) {
    const base = { title_en: 'Generic ' + eid + ' block', title_hi: 'सामान्य ' + eid + ' खंड',
      captions: { en: 'Data-driven prototype', hi: 'डेटा-संचालित प्रोटोटाइप' } };
    if (eid === 'bio') return Object.assign(base, {
      id: 'demo_bio_cross_section', class: 'IX', subject: 'biology', engine: 'bio',
      organelles: [
        { id: 'membrane', label_en: 'Membrane', label_hi: 'झिल्ली', kind: 'membrane', radius: 1.45, color: 0x59b6a0, opacity: 0.28, transparent: true },
        { id: 'cytoplasm', label_en: 'Cytoplasm', label_hi: 'कोशिकाद्रव्य', kind: 'organelle', radius: 1.25, color: 0xdfc264, opacity: 0.55, transparent: true },
        { id: 'nucleus', label_en: 'Nucleus', label_hi: 'केन्द्रक', kind: 'organelle', radius: 0.44, position: [0.15, 0.12, 0.2], color: 0x9b6bd0 },
        { id: 'mitochondrion', label_en: 'Mitochondrion', label_hi: 'माइटोकॉन्ड्रिया', kind: 'capsule', radius: 0.16, length: 0.42, position: [-0.62, -0.34, 0.35], rotation: [0, 0, 0.7], color: 0xda7f2f }
      ],
      parts: [{ id: 'cell_label', kind: 'label', label_en: 'Cell / कोशिका', label_hi: 'कोशिका', position: [0, 1.75, 0] }]
    });
    if (eid === 'chem') return Object.assign(base, {
      id: 'demo_chem_molecule', class: 'X', subject: 'chemistry', engine: 'chem',
      atoms: [
        { id: 'o', label_en: 'Oxygen', label_hi: 'ऑक्सीजन', element: 'O', position: [0, 0, 0], radius: 0.34, color: 0xd4594f },
        { id: 'h1', label_en: 'Hydrogen', label_hi: 'हाइड्रोजन', element: 'H', position: [-0.82, 0.62, 0], radius: 0.22, color: 0xeef4fa },
        { id: 'h2', label_en: 'Hydrogen', label_hi: 'हाइड्रोजन', element: 'H', position: [0.82, 0.62, 0], radius: 0.22, color: 0xeef4fa }
      ],
      bonds: [{ id: 'b1', from: 'o', to: 'h1', order: 1, label_en: 'Covalent bond', label_hi: 'सहसंयोजी बंध' },
              { id: 'b2', from: 'o', to: 'h2', order: 1, label_en: 'Covalent bond', label_hi: 'सहसंयोजी बंध' }],
      particles: [{ id: 'electron_cloud', label_en: 'Electron cloud', label_hi: 'इलेक्ट्रॉन बादल', kind: 'particle', count: 28, color: 0x4ad6ff, pointSize: 0.06, opacity: 0.55 }],
      parts: [{ id: 'mol_label', kind: 'label', label_en: 'Molecule / अणु', label_hi: 'अणु', position: [0, 1.45, 0] }]
    });
    return Object.assign(base, {
      id: 'demo_phys_optics', class: 'X', subject: 'physics', engine: 'phys',
      parts: [
        { id: 'axis', kind: 'axis', label_en: 'Principal axis', label_hi: 'मुख्य अक्ष', radius: 0.022, height: 5.4, rotation: [0, 0, Math.PI / 2], color: 0x0b1620 },
        { id: 'mirror', kind: 'mirror', label_en: 'Concave mirror', label_hi: 'अवतल दर्पण', radius: 1.05, tube: 0.06, arc: Math.PI * 0.92, rotation: [0, 0, -Math.PI * 0.46], position: [1.35, 0, 0], color: 0x6e7f90 },
        { id: 'object', kind: 'objectArrow', label_en: 'Object', label_hi: 'वस्तु', from: [-1.9, 0, 0], to: [-1.9, 0.85, 0], color: 0xd45c2a },
        { id: 'image', kind: 'imageArrow', label_en: 'Image', label_hi: 'प्रतिबिम्ब', from: [0.55, 0, 0], to: [0.55, -0.48, 0], color: 0x004f96 },
        { id: 'graph', kind: 'graph', label_en: '1/v vs 1/u', label_hi: '1/v बनाम 1/u', points: [[-2, -1.2, 0], [-1, -0.6, 0], [0, 0, 0], [1, 0.6, 0], [2, 1.2, 0]], color: 0x0b6b43 },
        { id: 'ray_label', kind: 'label', label_en: 'Ray / किरण', label_hi: 'किरण', position: [0, 1.55, 0] }
      ],
      segments: [{ id: 'ray1', partId: 'ray1', label_en: 'Incident + reflected ray', label_hi: 'आपतित + परावर्तित किरण', from: [-1.9, 0.85, 0], via: [[1.28, 0.62, 0], [0.55, 0, 0]], to: [-2.5, -0.35, 0], color: 0xd48a00, radius: 0.028 }]
    });
  }
  function contract() {
    return {
      schema: 'eduverse.engine-factories/v1', version: VERSION, prompt: 1, release: 'R8 + Master Engine steps 1-4',
      credit: CREDIT, classes: CLASSES.slice(), subjectEngine: Object.assign({}, SUBJECT_ENGINE),
      engines: engines(),
      spec: {
        required: ['id', 'class', 'subject', 'title_en', 'title_hi', '>=1 declarative part collection'],
        optional: ['engine', 'sections', '3d_blocks', 'quiz', 'bilingual_captions', 'captions', 'atoms', 'bonds', 'particles', 'organelles', 'segments', 'groups'],
        part: ['id', 'kind|shape', 'label_en', 'label_hi', 'position', 'rotation', 'scale', 'color', 'opacity', 'parent', 'children', 'pickable'],
        note: 'sections / 3d_blocks / quiz / bilingual_captions are the PACK-LEVEL contract delivered in Prompt 2; this step validates a single 3D block spec.'
      },
      model: {
        parts: '{ partId: { position, rotation, scale, color, opacity, visible } }',
        segments: '[{ id|partId, from, via, to, kind, radius, color, opacity }] — rebuilt dynamically, never hardcoded',
        focus: 'partId|null — engine-level visual hook only',
        note: 'Numbers come from a PURE model supplied by the caller. Prompt 3 adds the physics formulas; Prompt 1 performs no science computation.'
      },
      lifecycle: ['create(spec, opts)', 'group', 'update(model, dt, time)', 'focus(partId)', 'raycastTargets()', 'setSegments(segments)', 'stats()', 'dispose()'],
      guarantees: ['0 own WebGLRenderer', '0 external refs', '0 GLTF/GLB', '0 React', 'every mesh carries userData.partId', 'focus() dims non-targets to 15%', 'dispose() releases geometry/material/texture'],
      deferred: {},
      research: RESEARCH.slice()
    };
  }

  return {
    VERSION: VERSION, CREDIT: CREDIT, CLASSES: CLASSES.slice(),
    register: register, validate: validate, create: create, engines: engines,
    demoSpec: demoSpec, contract: contract, research: () => RESEARCH.slice(),
    begin: begin, add: add, finalize: finalize, focus: focus, applyModel: applyModel,
    raycastTargets: raycastTargets, dispose: dispose, stats: stats, text: text,
    get defs() { return Object.keys(registry).map(id => Object.assign({}, registry[id])); }
  };
})();
