#!/usr/bin/env python3
"""Exercise re-import preservation with overlapping upstream, studio and local plates."""
import contextlib
import importlib.util
import io
import json
import shutil
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("plate_import", ROOT / "tools/import_realistic_plates.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
actual = json.loads((ROOT / "src/realistic_plates.json").read_text(encoding="utf-8"))
local = json.loads((ROOT / "src/local_illustrations.json").read_text(encoding="utf-8"))
chapter, section = "c9_exploration", "1.1"
local_file = local["assets"][chapter][section][0]
studio_file = "rx/science_observation_patterns.webp"
assert studio_file in actual["assets"][chapter][section]

with tempfile.TemporaryDirectory() as tmp:
    tmp = Path(tmp)
    project, upstream = tmp / "project", tmp / "upstream"
    store = project / "assets/2d/rx"
    store.mkdir(parents=True)
    (project / "src").mkdir()
    for f in (local_file, studio_file):
        shutil.copy2(ROOT / "assets/2d" / f, project / "assets/2d" / f)
    (project / "src/local_illustrations.json").write_text(json.dumps({
        "assets": {chapter: {section: [local_file]}},
        "labels": {local_file: local["labels"][local_file]},
    }), encoding="utf-8")
    (project / "src/realistic_plates.json").write_text(json.dumps({
        "assets": {chapter: {section: [local_file, studio_file]}},
        "labels": {local_file: local["labels"][local_file], studio_file: actual["labels"][studio_file]},
        "credits": {studio_file: actual["credits"][studio_file]},
    }), encoding="utf-8")
    (upstream / "assets").mkdir(parents=True)
    images = upstream / "public/2d/class9/biology/images"
    images.mkdir(parents=True)
    shutil.copy2(ROOT / "assets/2d" / local_file, images / "test.webp")
    data = {"class9/biology": {"test": {"img": "images/test.webp", "title": "Test", "marks": [
        {"x": 50, "y": 50, "en": "Example", "hi": "उदाहरण"}
    ]}}}
    (upstream / "assets/va-2d.js").write_text("const DATA=" + json.dumps(data) + ";\n", encoding="utf-8")
    (upstream / "public/2d/conditions.js").write_text("const VA_CONDS = {};\n", encoding="utf-8")
    mod.ROOT, mod.OUT_JSON = project, project / "src/realistic_plates.json"
    mod.MAP, mod.EXTRA = {chapter: {section: ["class9/biology/test"]}}, {}
    sys.argv = ["import_realistic_plates.py", str(upstream)]
    for _ in range(2):
        with contextlib.redirect_stdout(io.StringIO()):
            mod.main()
        result = json.loads(mod.OUT_JSON.read_text(encoding="utf-8"))
        assert result["assets"][chapter][section] == [local_file, "rx/test.webp", studio_file]
        assert result["labels"][local_file] == local["labels"][local_file]
        assert result["labels"][studio_file] == actual["labels"][studio_file]
        assert result["credits"][studio_file] == actual["credits"][studio_file]
        assert {p.name for p in store.glob("*.webp")} == {Path(f).name for f in result["assets"][chapter][section]}

print("PASS import_realistic_plates: overlapping local, upstream and in-repo plates survive repeated imports")
