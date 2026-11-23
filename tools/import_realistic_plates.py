#!/usr/bin/env python3
"""Import realistic 1408x768 Class IX/X illustrations from the sibling
anveshix/ifinite-horizon repository (public/2d/<class>/<subject>/images +
the DATA table in assets/va-2d.js) into Sci-flip.

    python3 tools/import_realistic_plates.py /path/to/ifinite-horizon

Outputs (deterministic, idempotent):
  assets/2d/<chapter>/rx-<id>.webp     realistic plate (copied byte-for-byte)
  src/realistic_plates.json            {"assets": {chapter: {section: [file]}},
                                        "labels": {"chapter/file": [label spec]},
                                        "source": {...}}
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
    t_en, t_hi = split_title(entry["title"])
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


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    src = Path(sys.argv[1]).resolve()
    va = (src / "assets" / "va-2d.js").read_text(encoding="utf-8")
    line = next(l for l in va.splitlines() if l.startswith("const DATA="))
    data = json.loads(line[len("const DATA="):].rstrip().rstrip(";"))

    assets, labels, used, missing = {}, {}, set(), []
    for wid, secs in MAP.items():
        for sec, ids in secs.items():
            for full in ids:
                group, key = full.rsplit("/", 1)
                entry = data.get(group, {}).get(key)
                if not entry:
                    missing.append(full); continue
                img = src / "public" / "2d" / group / entry["img"]
                if img.suffix.lower() != ".webp" or not img.exists():
                    missing.append(full); continue
                fname = "rx-" + key + ".webp"
                dest = ROOT / "assets" / "2d" / wid / fname
                dest.parent.mkdir(parents=True, exist_ok=True)
                if not dest.exists() or dest.read_bytes() != img.read_bytes():
                    shutil.copyfile(img, dest)
                assets.setdefault(wid, {}).setdefault(sec, [])
                if fname not in assets[wid][sec]:
                    assets[wid][sec].append(fname)
                labels[wid + "/" + fname] = label_specs(entry)
                used.add(full)

    OUT_JSON.write_text(json.dumps({
        "source": {"repo": "anveshix/ifinite-horizon", "path": "public/2d", "data": "assets/va-2d.js",
                   "kind": "Illustrative AI-assisted teaching plates; not to scale, not micrographs."},
        "assets": assets, "labels": labels,
    }, ensure_ascii=False, indent=1, sort_keys=True) + "\n", encoding="utf-8")
    n_sec = sum(len(s) for s in assets.values())
    n_lab = sum(len(v) for v in labels.values())
    print(f"realistic plates: {len(used)} images · {n_sec} sections in {len(assets)} chapters · "
          f"{len(labels)} placements · {n_lab} anchored labels")
    if missing:
        print("skipped (no raster/DATA):", ", ".join(sorted(set(missing))))


if __name__ == "__main__":
    main()
