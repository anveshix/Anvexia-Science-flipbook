#!/usr/bin/env python3
"""Import realistic Class IX/X illustrations from the sibling
anveshix/ifinite-horizon repository (main branch) into Sci-flip:
  * realistic plates: public/2d/<class>/<subject>/images + DATA in assets/va-2d.js
  * condition variants (clean 3D teaching renders of one topic in several
    states, e.g. myopia / corrected): public/2d/conditions + conditions.js

    python3 tools/import_realistic_plates.py /path/to/ifinite-horizon

Outputs (deterministic, idempotent):
  assets/2d/rx/<id>.webp               each image stored ONCE (shared by chapters)
  src/realistic_plates.json            {"assets": {chapter: {section: ["rx/<id>.webp"]}},
                                        "labels": {"rx/<id>.webp": [label spec]},
                                        "credits": {"rx/<id>.webp": "..."}, "source": {...}}
Map entries are "<class>/<subject>/<id>" for a realistic plate, or
"<class>/<subject>/<id>#<n>" for condition variant n of that topic.
build.py merges "labels" into the compressed EV_LABEL_DATA blob and inlines
"assets" so EVRASTER shows the realistic plate FIRST for each mapped section;
the generated composite plate stays available as the next image (↻).

Label specs follow EVLABEL's anchored-chip contract: chips sit in rows along
the top edge (1408x768 space) with leader lines to each authored mark.
"""
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_JSON = ROOT / "src" / "realistic_plates.json"

B9, C9, P9 = "class9/biology/", "class9/chemistry/", "class9/physics/"
B10, C10, P10 = "class10/biology/", "class10/chemistry/", "class10/physics/"

# Curated NCERT section -> realistic image ids (most relevant first).
MAP = {
    "c9_matter": {"1.1": [C9 + "states"], "1.2": [C9 + "diffusion"], "1.3": [C9 + "states"], "1.4": [C9 + "evaporation"]},
    "c9_pure": {"1": [C9 + "separation"], "2": [C9 + "tyndall"], "3": [C9 + "fractional_distillation"]},
    "c9_atoms": {"1": [C9 + "molecule"], "2": [C10 + "ionic_bond_nacl"], "3": [C9 + "conservation_of_mass"]},
    "c9_disease": {"1": [B9 + "bacteriophage_virus"]},
    "c9_cell": {
        "2.1": [B9 + "compound_microscope", B9 + "microscope_resolution"],
        "2.2": [B9 + "cell_plant", B9 + "cell_animal"],
        "2.3": [B9 + "bacteriophage_virus"],
        "2.4": [B9 + "cell_membrane"],
        "2.5": [B9 + "cell_plant"],
        "2.6": [B9 + "cell_nucleus", B10 + "chromosome_structure"],
        "2.7": [B9 + "cell_mitochondria", B10 + "photosynthesis"],
        "2.8": [B9 + "cell_organelles"],
        "2.9": [B10 + "cell_cycle_division"],
        "2.11": [B9 + "recombinant_insulin", B9 + "bioreactor_growth_curve"],
    },
    "c9_tissues": {
        "3.1": [B9 + "tissue_epithelial"], "3.2": [B9 + "skin"],
        "3.5": [B10 + "absorption_roots", B10 + "transpiration"],
        "3.7": [B9 + "tissue_epithelial"], "3.8": [B9 + "tissue_connective"],
        "3.9": [B9 + "tissue_muscular", B9 + "tissue_nervous"],
        "3.10": [B9 + "skeleton_joint"], "3.11": [B9 + "balanced_diet"],
    },
    "c10_reactions": {
        "1.2": [C10 + "balancing_equation"], "1.3": [C10 + "combination"], "1.4": [C10 + "decomposition"],
        "1.5": [C10 + "displacement", C10 + "double_displacement"], "1.6": [C10 + "double_displacement"],
        "1.7": [C10 + "redox_reaction"], "1.9": [C10 + "corrosion_rancidity"],
    },
    "c10_acids": {
        "2.1": [C10 + "metal_acid"], "2.3": [C10 + "indicators"], "2.4": [C10 + "neutralisation"],
        "2.5": [C10 + "ph"], "2.6": [C10 + "ph"], "2.7": [C10 + "important_salts"],
        "2.8": [C10 + "important_salts"], "2.9": [C10 + "important_salts"],
    },
    "c10_metals": {
        "3.1": [C10 + "metals_nonmetals"], "3.2": [C10 + "metal_acid"], "3.3": [C10 + "reactivity"],
        "3.4": [C10 + "ionic_bond_nacl"], "3.5": [C10 + "extraction_metals"], "3.6": [C10 + "extraction_metals"],
        "3.7": [C10 + "prevent_corrosion", C10 + "corrosion_rancidity"],
    },
    "c10_carbon": {
        "4.1": [C10 + "covalent"], "4.1b": [C10 + "allotropes_carbon"], "4.2": [C10 + "carbon_homologous"],
        "4.2.1": [C10 + "covalent"], "4.2.4": [C10 + "carbon_homologous"],
        "4.4.1": [C10 + "ethanol_esterification"], "4.4.2b": [C10 + "ethanol_esterification"],
        "4.5": [C10 + "micelle"],
    },
    "c10_heredity": {"8.1": [B10 + "genetics_dna"], "8.3": [B10 + "genetics_dna"],
                     "8.6": [B10 + "chromosome_structure"], "8.7": [B10 + "human_evolution"]},
    "c10_light": {"9.1": [P10 + "reflection"], "9.2": [P10 + "reflection"], "9.3": [P10 + "refraction"],
                  "9.3.1": [P10 + "refraction"], "9.3.3": [P10 + "lens"], "9.3.7": [P10 + "lens"]},
    "c10_eye": {"10.1": [P10 + "human_eye_anatomy"], "10.2": [P10 + "human_eye_anatomy"],
                "10.5": [P10 + "dispersion"], "10.6": [P10 + "dispersion"],
                "10.7": [P10 + "scattering_light", C9 + "tyndall"]},
    "c10_electricity": {"11.1": [P10 + "circuit"], "11.2": [P10 + "circuit"], "11.3": [P10 + "ohm"],
                        "11.4": [P10 + "ohm"], "11.7": [P10 + "joule_heating"], "11.9": [P10 + "domestic_circuit"]},
    "c10_magnetism": {"12.1": [P10 + "magnetic_field_lines"], "12.4": [P10 + "electromagnet"],
                      "12.5": [P10 + "motor"], "12.8": [P10 + "domestic_circuit"],
                      "12.9": [P10 + "motor", P10 + "electromagnetic_induction"]},
    "c10_life": {
        "5.1": [B10 + "photosynthesis"], "5.2": [B10 + "photosynthesis"],
        "5.4": [B9 + "digestive_stomach", B9 + "digestive_mouth", B9 + "digestive_intestine", B9 + "digestive_liver", B9 + "teeth"],
        "5.5": [B9 + "plant_respiration"], "5.6": [B9 + "respiratory_system"],
        "5.7": [B10 + "absorption_roots", B10 + "transpiration"], "5.8": [B10 + "circulatory_system"],
        "5.9": [B10 + "excretory_system", B10 + "dialysis"],
    },
    "c10_control": {"6.1": [B10 + "chemical_coordination_plants"], "6.2": [B10 + "chemical_coordination_plants"],
                    "6.3": [B10 + "nervous_system", B9 + "tissue_nervous"], "6.4": [B10 + "nervous_system"],
                    "6.5": [B10 + "nervous_system"], "6.7": [B10 + "endocrine_system"]},
    "c10_repro": {"7.2": [B10 + "binary_fission", B10 + "budding_hydra"], "7.3": [B10 + "vegetative_propagation"],
                  "7.4": [B9 + "flower", B9 + "seeds_germination"], "7.5": [B10 + "reproductive_system"],
                  "7.6": [B10 + "reproductive_system"]},
    "c10_env": {"13.2": [B10 + "food_web"], "13.3": [B10 + "food_pyramid"], "13.4": [B10 + "food_pyramid"],
                "13.5": [B10 + "pollution"], "13.6": [B10 + "pollution"], "13.7": [B10 + "population"]},
    "c9_exploration": {"1.3": [P9 + "measurement_si_units"]},
    "c9_motion": {"4.1": [P9 + "frames_vectors_motion", P9 + "motion"], "4.2": [P9 + "frames_vectors_motion"],
                  "4.3": [P9 + "motion"], "4.9": [P9 + "circular_motion"]},
    "c9_forces": {"6.1": [P9 + "newton_laws"], "6.2": [P9 + "hookes_law_spring"],
                  "6.6": [P9 + "newton_laws", P9 + "pseudo_force"], "6.7": [P9 + "newton_laws"], "6.8": [P9 + "newton_laws"]},
    "c9_work_energy": {"7.1": [P9 + "work_energy"], "7.3": [P9 + "work_energy"], "7.4": [P9 + "hookes_law_spring"],
                       "7.6": [P9 + "work_energy"], "7.8": [P9 + "simple_machines"], "7.9": [P9 + "simple_machines"]},
    "c9_atom": {"8.1": [C9 + "atom"], "8.2": [C9 + "cathode_canal_rays"], "8.3": [C9 + "cathode_canal_rays"],
                "8.5": [C9 + "rutherford_vs_bohr"], "8.6": [C9 + "rutherford_vs_bohr", C9 + "hydrogen_line_spectrum"],
                "8.7": [C9 + "atom"], "8.10": [C9 + "chemical_bonding_lewis"]},
    "c9_atomic_foundations": {"9.1": [C9 + "conservation_of_mass"], "9.3": [C9 + "atom"], "9.4": [C9 + "molecule"],
                              "9.5": [C10 + "covalent"], "9.6": [C10 + "ionic_bond_nacl"]},
    "c9_sound": {"10.1": [P9 + "sound"], "10.3": [P9 + "sound"]},
    "c9_reproduction9": {"11.1": [B10 + "binary_fission"], "11.2": [B10 + "budding_hydra", B9 + "fungi_structure"],
                         "11.3": [B10 + "vegetative_propagation"], "11.4": [B9 + "flower"], "11.5": [B9 + "flower"],
                         "11.6": [B9 + "seeds_germination"], "11.7": [B10 + "reproductive_system"]},
    "c9_diversity": {"12.2": [B9 + "five_kingdoms"], "12.3": [B9 + "fungi_structure", B9 + "bacteriophage_virus"],
                     "12.8": [B9 + "bacteriophage_virus"]},
    "c9_earth": {"13.1": [P9 + "earth_spheres"], "13.3": [P9 + "differential_heating"], "13.4": [P9 + "sea_land_breeze"],
                 "13.5": [P9 + "biogeochemical_cycles"], "13.6": [P9 + "biogeochemical_cycles"],
                 "13.7": [P9 + "biogeochemical_cycles"], "13.8": [P9 + "biogeochemical_cycles"], "13.9": [B10 + "pollution"]},
    "c9_mixtures": {"5.1": [C9 + "separation"], "5.4": [C9 + "tyndall"], "5.7": [C9 + "separation", C9 + "evaporation"],
                    "5.8": [C9 + "fractional_distillation"], "5.9": [C9 + "column_chromatography"]},
    "c10_sustainable": {"M.1": [B10 + "population"]},
}

# Condition variants ("id#n") and newer realistic plates, appended after the
# realistic plate of each section (or first, where a section had none).
EXTRA = {
    "c9_cell": {"2.4": [B9 + "osmosis_tonicity", B9 + "cell_membrane#2", B9 + "cell_membrane#1"],
                "2.9": [B10 + "cell_cycle_division#3", B10 + "cell_cycle_division#4", B10 + "cell_cycle_division#6"]},
    "c9_tissues": {"3.9": [B10 + "nervous_system#1"], "3.10": [B9 + "skeleton_joint#1", B9 + "skeleton_joint#2"]},
    "c10_reactions": {"1.5": [C10 + "displacement#1", C10 + "displacement#3"]},
    "c10_acids": {"2.2": [C10 + "ph#3"], "2.3": [C10 + "ph#2"], "2.4": [C10 + "neutralisation#1", C10 + "neutralisation#2"],
                  "2.5": [C10 + "ph#1"], "2.6": [C10 + "ph#4", C10 + "neutralisation#3"]},
    "c10_metals": {"3.3": [C10 + "reactivity#1", C10 + "reactivity#3", C10 + "reactivity#4"]},
    "c10_heredity": {"8.2": [B10 + "genetics_dna#1"], "8.3": [B10 + "genetics_dna#4", B10 + "genetics_dna#5"],
                     "8.5": [B10 + "genetics_dna#2", B10 + "genetics_dna#3"]},
    "c10_light": {"9.2.1": [P10 + "reflection#1"], "9.2.2": [P10 + "reflection#2"], "9.3": [P10 + "refraction#4"],
                  "9.3.1": [P10 + "refraction#1"], "9.3.3": [P10 + "lens#1", P10 + "lens#2"],
                  "9.3.7": [P10 + "lens#1"], "9.3.8": [P10 + "lens#1", P10 + "lens#2"]},
    "c10_eye": {"10.1": [P10 + "human_eye_anatomy#5"], "10.2": [P10 + "human_eye_anatomy#3"],
                "10.3": [P10 + "human_eye_anatomy#6", P10 + "human_eye_anatomy#7"],
                "10.4": [P10 + "human_eye_anatomy#8", P10 + "human_eye_anatomy#9"],
                "10.7": [P10 + "scattering_light#1", P10 + "scattering_light#2"]},
    "c10_electricity": {"11.5": [P10 + "circuit#1"], "11.6": [P10 + "circuit#2", P10 + "circuit#3"]},
    "c10_magnetism": {"12.1": [P10 + "magnetic_field_lines#1", P10 + "magnetic_field_lines#2"],
                      "12.4": [P10 + "electromagnet#1", P10 + "electromagnet#2", P10 + "electromagnet#4"],
                      "12.5": [P10 + "motor#1"], "12.6": [P10 + "motor#1", P10 + "motor#2", P10 + "motor#3"]},
    "c10_life": {"5.6": [B9 + "respiratory_system#1", B9 + "respiratory_system#3"],
                 "5.8": [B10 + "circulatory_system#2", B10 + "circulatory_system#3"],
                 "5.9": [B10 + "excretory_system#4", B10 + "dialysis#4"]},
    "c10_control": {"6.3": [B10 + "nervous_system#1", B10 + "nervous_system#2"], "6.4": [B10 + "nervous_system#5"]},
    "c9_mixtures": {"5.3": [C9 + "tyndall#3"], "5.4": [C9 + "tyndall#1"], "5.7": [C9 + "tyndall#2"]},
    "c9_motion": {"4.4": [P9 + "motion#1"], "4.5": [P9 + "motion#2", P9 + "motion#3"], "4.6": [P9 + "motion#1"],
                  "4.7": [P9 + "motion#2"], "4.8": [P9 + "motion#2"]},
    "c9_forces": {"6.4": [P9 + "newton_laws#2"], "6.5": [P9 + "newton_laws#1"], "6.6": [P9 + "newton_laws#4"],
                  "6.7": [P9 + "newton_laws#2"], "6.8": [P9 + "newton_laws#3"], "6.9": [P9 + "newton_laws#3"]},
    "c9_sound": {"10.1": [P9 + "sound#1"], "10.2": [P9 + "sound#3"], "10.4": [P9 + "sound#1"], "10.5": [P9 + "sound#1"],
                 "10.6": [P9 + "sound#1"], "10.7": [P9 + "sound#1"], "10.8": [P9 + "sound#2"],
                 "10.9": [P9 + "echo_sonar"], "10.10": [P9 + "echo_sonar"]},
    "c9_earth": {"13.2": [P9 + "differential_heating#1"],
                 "13.3": [P9 + "differential_heating#1", P9 + "differential_heating#2", P9 + "differential_heating#3"],
                 "13.4": [P9 + "sea_land_breeze#1", P9 + "sea_land_breeze#2", P9 + "sea_land_breeze#3"]},
}

DEVA = re.compile(r"[ऀ-ॿ]")
W, H = 1408, 768
PAD, GAP, CHIP_H, ROW_GAP, PER_ROW = 14, 10, 66, 10, 5


def split_title(t):
    parts = [p.strip() for p in re.split(r"\s+[—·]\s+", t) if p.strip()]
    en = next((p for p in parts if not DEVA.search(p)), parts[0] if parts else t)
    hi = next((p for p in parts if DEVA.search(p)), en)
    en = re.sub(r"\s*\(.*?\)\s*$", "", en) if en != hi else en
    return en, hi


def label_specs(entry):
    t = entry["title"]
    t_en, t_hi = (t.get("en", ""), t.get("hi", "")) if isinstance(t, dict) else split_title(t)
    marks = sorted(entry.get("marks") or [], key=lambda m: (m["x"]))
    if not marks:
        return []
    rows = [marks[i:i + PER_ROW] for i in range(0, len(marks), PER_ROW)]
    specs = []
    for r, row in enumerate(rows):
        row = sorted(row, key=lambda m: m["x"])
        k = len(row)
        w = int((W - 2 * PAD - (k - 1) * GAP) / k) if k > 1 else 420
        x0 = PAD if k > 1 else int(min(max(row[0]["x"] / 100 * W - w / 2, PAD), W - PAD - w))
        y = PAD + r * (CHIP_H + ROW_GAP)
        for i, m in enumerate(row):
            ax = round(max(8, min(W - 8, m["x"] / 100 * W)))
            ay = round(max(8, min(H - 8, m["y"] / 100 * H)))
            specs.append({
                "en": m["en"], "hi": m.get("hi") or m["en"],
                "x": x0 + i * (w + GAP), "y": y, "w": w, "h": CHIP_H,
                "info_en": f"{m['en']}: labelled part of the illustration “{t_en}”. Illustrative, not to scale.",
                "info_hi": f"{m.get('hi') or m['en']}: “{t_hi}” चित्र का अंकित भाग। सांकेतिक चित्र, पैमाने पर नहीं।",
                "anchor_x": ax, "anchor_y": ay,
            })
    return specs


def load_conditions(src):
    js = (src / "public" / "2d" / "conditions.js").read_text(encoding="utf-8")
    start = js.index("{", js.index("VA_CONDS"))
    obj, _ = json.JSONDecoder().raw_decode(js[start:])
    return obj


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    src = Path(sys.argv[1]).resolve()
    va = (src / "assets" / "va-2d.js").read_text(encoding="utf-8")
    line = next(l for l in va.splitlines() if l.startswith("const DATA="))
    data = json.loads(line[len("const DATA="):].rstrip().rstrip(";"))
    conds = load_conditions(src)

    store = ROOT / "assets" / "2d" / "rx"
    store.mkdir(parents=True, exist_ok=True)
    assets, labels, credits, missing, files = {}, {}, {}, [], set()

    def resolve(full):
        """-> (source path, shared file name, entry) or None"""
        ref, _, n = full.partition("#")
        group, key = ref.rsplit("/", 1)
        if n:
            variants = conds.get(ref) or []
            idx = int(n) - 1
            if idx >= len(variants):
                return None
            e = variants[idx]
            return src / "public" / "2d" / e["img"], f"rx/{key}--{n}.webp", e
        e = data.get(group, {}).get(key)
        if not e:
            return None
        return src / "public" / "2d" / group / e["img"], f"rx/{key}.webp", e

    plan = {}
    for table in (MAP, EXTRA):
        for wid, secs in table.items():
            for sec, ids in secs.items():
                plan.setdefault(wid, {}).setdefault(sec, []).extend(ids)

    for wid, secs in plan.items():
        for sec, ids in secs.items():
            for full in ids:
                r = resolve(full)
                if not r or r[0].suffix.lower() != ".webp" or not r[0].exists():
                    missing.append(full); continue
                img, fname, entry = r
                specs = label_specs(entry)
                if not specs:
                    missing.append(full + " (no labels)"); continue
                dest = ROOT / "assets" / "2d" / fname
                if not dest.exists() or dest.read_bytes() != img.read_bytes():
                    shutil.copyfile(img, dest)
                row = assets.setdefault(wid, {}).setdefault(sec, [])
                if fname not in row:
                    row.append(fname)
                labels[fname] = specs
                if entry.get("credit"):
                    credits[fname] = entry["credit"]
                files.add(fname)

    # Keep locally authored drafts alongside the upstream imports.
    local_path = ROOT / "src" / "local_illustrations.json"
    if local_path.exists():
        local = json.loads(local_path.read_text(encoding="utf-8"))
        for wid, secs in local["assets"].items():
            for sec, names in secs.items():
                for fname in reversed(names):
                    if not re.fullmatch(r"rx/local_[a-z0-9_]+\.webp", fname):
                        raise ValueError(f"Invalid local plate path: {fname}")
                    if not (ROOT / "assets" / "2d" / fname).is_file() or not local["labels"].get(fname):
                        raise ValueError(f"Missing local plate or labels: {fname}")
                    row = assets.setdefault(wid, {}).setdefault(sec, [])
                    if fname not in row:
                        row.insert(0, fname)
                    labels[fname] = local["labels"][fname]
                    files.add(fname)

    # Preserve in-repo authored SciVerse 3D plates (from tools/plates_73) when re-importing upstream plates
    if OUT_JSON.exists():
        prev = json.loads(OUT_JSON.read_text(encoding="utf-8"))
        prev_credits = prev.get("credits") or {}
        in_repo = {
            fname for fname, cred in prev_credits.items()
            if "SciVerse 3D NCERT textbook plate" in str(cred)
        }
        for wid, secs in (prev.get("assets") or {}).items():
            for sec, lst in secs.items():
                kept = [f for f in lst if f in in_repo and (ROOT / "assets" / "2d" / f).exists()]
                if kept and not assets.get(wid, {}).get(sec):
                    assets.setdefault(wid, {})[sec] = kept
                    for f in kept:
                        files.add(f)
                        if f in (prev.get("labels") or {}):
                            labels[f] = prev["labels"][f]
                        if f in prev_credits:
                            credits[f] = prev_credits[f]

    # the shared store holds exactly the referenced images
    for old in store.glob("*.webp"):
        if "rx/" + old.name not in files:
            old.unlink()
    # retire the old per-chapter copies (rx-*.webp)
    for old in (ROOT / "assets" / "2d").glob("*/rx-*.webp"):
        old.unlink()

    OUT_JSON.write_text(json.dumps({
        "source": {"repo": "anveshix/ifinite-horizon", "branch": "main",
                   "paths": ["public/2d/<class>/<subject>/images", "public/2d/conditions"],
                   "data": ["assets/va-2d.js", "public/2d/conditions.js"],
                   "kind": "Illustrative teaching plates and 3D-rendered condition views; not to scale, not micrographs."},
        "assets": assets, "labels": labels, "credits": credits,
    }, ensure_ascii=False, indent=1, sort_keys=True) + "\n", encoding="utf-8")
    n_sec = sum(len(s) for s in assets.values())
    n_lab = sum(len(v) for v in labels.values())
    size = sum((ROOT / "assets" / "2d" / f).stat().st_size for f in files)
    print(f"plates: {len(files)} unique images ({size / 1e6:.1f} MB, stored once) · {n_sec} sections in "
          f"{len(assets)} chapters · {n_lab} anchored labels · {len(credits)} with licence credits")
    if missing:
        print("skipped:", ", ".join(sorted(set(missing))))


if __name__ == "__main__":
    main()
